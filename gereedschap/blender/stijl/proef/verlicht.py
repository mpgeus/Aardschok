# Methode A van de methodeproef (vraag 192): geschilderd licht uit de passes van gbuffer.py. Geen universele shader: per materiaalsoort een eigen
# kleurverloop van schaduw naar licht (geijkt op de plaat), een eigen vorm van de hoogste lichten, en eigen maten voor de overdreven vorm. De invoer komt
# helemaal uit de geometrie, dus er is niets dat per beeld kan verspringen; eenmaal geijkt zijn de getallen vast (stijl.json en ramps.json).
#
#   python verlicht.py ijk <gbmap> [houding] [richtingen=Z,ZW,ZO]        de percentielen van het licht per soort vastleggen (eenmalig)
#   python verlicht.py <gbmap> <uitmap> <houding> [variant]              alle beelden; variant = een sleutel in stijl.json['varianten']
#
# Alleen numpy, scipy en PIL (de Python van ComfyUI).
import glob
import json
import multiprocessing as mp
import os
import shutil
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ni
from scipy.interpolate import PchipInterpolator

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import exr  # noqa: E402

INST = json.load(open(os.path.join(HIER, '..', 'instellingen.json'), encoding='utf-8'))
SOORTEN = ('blauw', 'geel', 'gewat', 'leer', 'hout', 'huid', 'haar', 'staal')
DEEL = dict(hoofd=1, baard=2, helm=3, kap=4, gambeson=5, tabberd=6, riem=7, buidel=8, hozen=9, laarzen=10, handschoenen=11, speer=12)
PCT = (2, 15, 50, 85, 98)
RAMPS = os.path.join(HIER, os.environ.get('RAMPS', 'ramps.json'))


def stijl_van(variant=None):
    s = json.load(open(os.path.join(HIER, 'stijl.json'), encoding='utf-8'))
    if variant:
        w = s.get('varianten', {}).get(variant, {})
        for k, v in w.items():
            if isinstance(v, dict) and k in s:
                for k2, v2 in v.items():
                    if isinstance(v2, dict) and k2 in s[k]:
                        s[k][k2].update(v2)
                    else:
                        s[k][k2] = v2
            else:
                s[k] = v
    return s


# --- kleurruimte ----------------------------------------------------------------------------------------------------------
_M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], dtype=np.float32)
_MI = np.linalg.inv(_M).astype(np.float32)
_W = np.array([0.9505, 1.0, 1.089], dtype=np.float32)


def lin_lab(c):
    xyz = c @ _M.T / _W
    f = np.where(xyz > 0.008856, np.cbrt(np.maximum(xyz, 1e-9)), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def lab_lin(lb):
    fy = (lb[..., 0] + 16) / 116
    f = np.stack([fy + lb[..., 1] / 500, fy, fy - lb[..., 2] / 200], -1)
    xyz = np.where(f > 0.2069, f ** 3, (f - 16 / 116) / 7.787) * _W
    return xyz @ _MI.T


def srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def glad(a, b, x):
    t = np.clip((x - a) / max(b - a, 1e-6), 0, 1)
    return t * t * (3 - 2 * t)


def norm(v):
    return v / np.maximum(np.linalg.norm(v, axis=-1, keepdims=True), 1e-6)


# --- de passes -----------------------------------------------------------------------------------------------------------
def lees(pad, laag=False):
    p = exr.passes(pad)
    al = p['alfa']
    g = al > 0.02
    d = np.maximum(al, 0.02)
    uit = {'alfa': al, 'binnen': g}
    for k in ('verf', 'Diffuse Direct', 'Diffuse Indirect', 'Normal', 'Position'):
        uit[k] = p[k] / d[..., None]
    for k in ('ao', 'aow', 'bol', 'metaal', 'ruwheid', 'stof', 'spiegel', 'contact', 'deel'):
        uit[k] = p[k] / d
    uit['Depth'] = np.where(g, p['Depth'], 0.0)
    uit['deelnr'] = np.round(uit['deel']).astype(np.int32)
    uit['Normal'] = norm(uit['Normal'])
    if laag:
        uit['laag'] = (p['laag'] / d[..., None] - 0.5) * 100.0
    return uit


def soorten(P):
    """Per pixel de materiaalsoort, uit het onderdeel en de verf. Het staal volgt het kenmerk 'metaal'."""
    lb = lin_lab(np.clip(P['verf'], 0, 1))
    L, a, b = lb[..., 0], lb[..., 1], lb[..., 2]
    d = P['deelnr']
    s = np.full(d.shape, SOORTEN.index('leer'), dtype=np.int32)
    s[(d == DEEL['kap']) | (d == DEEL['gambeson']) | (d == DEEL['hozen'])] = SOORTEN.index('gewat')
    tb = d == DEEL['tabberd']
    s[tb & (b < -5)] = SOORTEN.index('blauw')
    s[tb & (b >= -5)] = SOORTEN.index('geel')
    s[d == DEEL['speer']] = SOORTEN.index('hout')
    kop = (d == DEEL['hoofd']) | (d == DEEL['baard'])
    s[kop] = SOORTEN.index('huid')
    s[kop & (L < 34)] = SOORTEN.index('haar')
    s[P['metaal'] > 0.35] = SOORTEN.index('staal')
    return s, lb


def per_deel_vaag(N, d, binnen, sigma):
    """Vervagen binnen elk onderdeel, zodat de overdreven vorm niet over de rand tussen twee lagen loopt."""
    uit = N.copy()
    for nr in np.unique(d[binnen]):
        m = (d == nr) & binnen
        ys, xs = np.nonzero(m)
        pad = int(3 * sigma) + 2
        y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, m.shape[0])
        x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, m.shape[1])
        sm = m[y0:y1, x0:x1].astype(np.float32)
        w = np.maximum(ni.gaussian_filter(sm, sigma), 1e-3)
        for c in range(N.shape[-1]):
            v = ni.gaussian_filter(N[y0:y1, x0:x1, c] * sm, sigma) / w
            uit[y0:y1, x0:x1, c][m[y0:y1, x0:x1]] = v[m[y0:y1, x0:x1]]
    return uit


def zon_van(P):
    return norm(np.array(P['_meta'].get('zon') or INST['licht']['zon_richting'], dtype=np.float32))


def kader(P):
    """Alles wat het licht nodig heeft, gemeten in pixels van een render van 768 over 3 meter: op een grotere render schalen de maten mee."""
    meta = P['_meta']
    return (meta['pixels'] / 768.0) * (3.0 / meta['ortho'])


# --- de licht- en kleurberekening ----------------------------------------------------------------------------------------
def licht_t(P, s, st):
    """De waarde t van de vorm: zon met schaduw, hemel met omgevingsschaduw, overdreven normaal. Per soort eigen maten."""
    k = kader(P)
    N = P['Normal']
    d, g = P['deelnr'], P['binnen']
    S = st['soorten']
    lz = zon_van(P)
    e = np.radians(P['_meta']['elevatie'])
    V = np.array([0, -np.cos(e), np.sin(e)], dtype=np.float32)
    n1 = per_deel_vaag(N, d, g, st['vorm']['fijn'] * k)
    n2 = per_deel_vaag(N, d, g, st['vorm']['grof'] * k)
    fijn = np.zeros(s.shape, dtype=np.float32)
    grof = np.zeros(s.shape, dtype=np.float32)
    wrap = np.zeros(s.shape, dtype=np.float32)
    zon = np.zeros(s.shape, dtype=np.float32)
    hemel = np.zeros(s.shape, dtype=np.float32)
    voor = np.zeros(s.shape, dtype=np.float32)
    aop = np.zeros(s.shape, dtype=np.float32)
    bolw = np.zeros(s.shape, dtype=np.float32)
    for i, n in enumerate(SOORTEN):
        m = s == i
        c = S[n]
        fijn[m], grof[m], wrap[m], zon[m], hemel[m], voor[m], aop[m], bolw[m] = c['fijn'], c['grof'], c['wrap'], c['zon'], c['hemel'], c['voor'], c['ao'], c['rand']
    Nx = norm(N + fijn[..., None] * (N - n1) + grof[..., None] * (N - n2))
    nl0 = N @ lz
    # de zichtbaarheid van de zon uit de echte pass: voor vlakken die naar de zon kijken
    dd = P['Diffuse Direct'].mean(-1)
    vis = np.where(nl0 > 0.06, np.clip(dd / np.maximum(nl0, 0.06), 0, 1), 1.0)
    vis = ni.gaussian_filter(vis, 0.6 * k)
    nl = np.clip((Nx @ lz + wrap) / (1 + wrap), 0, 1)
    ao = ni.gaussian_filter(P['ao'], 0.7 * k)
    aow = ni.gaussian_filter(P['aow'], 1.2 * k)
    # de omgevingsschaduw weegt minder op wat 'contact' laag heeft (het gezicht)
    ao = 1 - (1 - ao) * P['contact']
    aow = 1 - (1 - aow) * (0.4 + 0.6 * P['contact'])
    hem = (0.5 + 0.5 * Nx[..., 2]) ** 1.1
    frontaal = np.clip(Nx @ V, 0, 1)
    t = zon * nl * vis + hemel * hem * aow + voor * frontaal * aow
    # de bolling van het model: bolle randen krijgen licht, holten worden dieper
    t = t + bolw * np.clip(P['bol'] / st['vorm']['bol_schaal'], -1, 1)
    t = t * (ao ** aop)
    # zachte banden, zoals een schilder in een paar waarden werkt
    b = st['vorm']['banden']
    if b['sterkte'] > 0:
        t = t + b['sterkte'] * np.sin(2 * np.pi * b['aantal'] * t) / (2 * np.pi * b['aantal'])
    P['_Nx'], P['_vis'], P['_ao'], P['_aow'] = Nx, vis, ao, aow
    return t


def kleur_door_t(s, lb, t, st, ramps):
    """De kleur uit het verloop van de plaat; de verf bepaalt wat er binnen de soort afwijkt."""
    L = lb[..., 0]
    C = np.hypot(lb[..., 1], lb[..., 2])
    H = np.arctan2(lb[..., 2], lb[..., 1])
    uit = np.zeros(lb.shape, dtype=np.float32)
    for i, n in enumerate(SOORTEN):
        m = s == i
        if not m.any() or n not in ramps['soorten']:
            continue
        r = ramps['soorten'][n]
        ts = np.array(r['t'], dtype=np.float32)
        Ls = np.array(r['L'], dtype=np.float32)
        Cs = np.array(r['C'], dtype=np.float32)
        Hs = np.unwrap(np.radians(np.array(r['h'], dtype=np.float32)))
        Lr, Cr, Hr = r['ref']
        b = st['soorten'][n].get('verf', 1.0)
        tm = t[m]
        Lt = PchipInterpolator(ts, Ls, extrapolate=False)(np.clip(tm, ts[0], ts[-1])).astype(np.float32)
        # buiten het verloop loopt het rustig door
        Lt = Lt + np.minimum(tm - ts[0], 0) * (Ls[1] - Ls[0]) / max(ts[1] - ts[0], 1e-3)
        Lt = Lt + np.maximum(tm - ts[-1], 0) * (Ls[-1] - Ls[-2]) / max(ts[-1] - ts[-2], 1e-3)
        Ct = np.interp(tm, ts, Cs)
        Ht = np.interp(tm, ts, Hs)
        rL = (np.maximum(L[m], 1.0) / max(Lr, 1.0)) ** b
        rC = (np.maximum(C[m], 0.5) / max(Cr, 0.5)) ** (0.8 * b)
        dH = np.angle(np.exp(1j * (H[m] - np.radians(Hr)))).astype(np.float32) * b * np.clip(C[m] / 12, 0, 1)
        Lu, Cu, Hu = Lt * rL, Ct * rC, Ht + dH
        uit[..., 0][m] = Lu
        uit[..., 1][m] = Cu * np.cos(Hu)
        uit[..., 2][m] = Cu * np.sin(Hu)
    return uit


def _lobben(P, s, st, V):
    """De hoogste lichten per soort: scherpte en sterkte verschillen per materiaal, en ze blijven in het eigen licht."""
    Nx = P['_Nx']
    S = st['soorten']
    extra = np.zeros(Nx.shape, dtype=np.float32)
    for i, n in enumerate(SOORTEN):
        m = s == i
        lob = S[n].get('lobben')
        if not lob or not m.any():
            continue
        for l in lob:
            ld = norm(np.array(l['richting'], dtype=np.float32))
            H = norm(ld + V)
            sp = np.clip(Nx[m] @ H, 0, 1) ** l['macht']
            v = glad(l['van'], l['tot'], sp) * l['sterkte']
            if l.get('schaduw', True):
                v = v * (0.25 + 0.75 * P['_vis'][m])
            v = v * P['_ao'][m] ** 2
            extra[m] += v[..., None] * np.array(l['kleur'], dtype=np.float32)
    return extra


def staal_omgeving(P, m, st, V):
    """Staal leest door zijn omgeving: een lucht boven, een donkere horizon en warm van onder, plus scherpe vensters van licht. Eén geschilderde
    omgeving, dus elke helm in elke richting krijgt dezelfde behandeling."""
    Nx = P['_Nx'][m]
    c = st['staal']
    R = 2 * (Nx @ V)[..., None] * Nx - V
    rz = R[..., 2]
    rx = R[..., 0]
    # de waarde als functie van de hoogte in de omgeving
    Lw = np.interp(rz, c['hoogte'], c['waarde'])
    # rechts donkerder: het licht komt van links
    Lw = Lw * (1 - c['rechts'] * glad(-0.2, 0.9, rx))
    # het venster van de zon en een zwakkere tweede
    lz = zon_van(P)
    v1 = glad(c['venster'][0], c['venster'][1], R @ lz)
    tweede = norm(np.array(c['tweede_richting'], dtype=np.float32))
    v2 = glad(c['tweede'][0], c['tweede'][1], R @ tweede)
    Lw = Lw + c['venster_sterkte'] * v1 * (0.35 + 0.65 * P['_vis'][m]) + c['tweede_sterkte'] * v2
    return Lw * P['_ao'][m] ** c['ao'] * (0.6 + 0.4 * P['_aow'][m])


def contactlijn(P, st):
    """Een donkere lijn op de plek waar een laag over een andere ligt: uit de diepte, dus bij elke stand opnieuw goed."""
    k = kader(P)
    c = st['contact']
    Z = P['Depth'].astype(np.float32)
    g = P['binnen']
    w = g.astype(np.float32)
    uit = np.zeros(Z.shape, dtype=np.float32)
    for sig, s in ((c['straal'] * k, 1.0), (c['straal'] * 2.5 * k, 0.45)):
        v = ni.gaussian_filter(Z * w, sig) / np.maximum(ni.gaussian_filter(w, sig), 1e-3)
        # dichterbij dan dit punt: Z kleiner; er ligt iets over dit punt heen
        uit = np.maximum(uit, s * glad(c['van'], c['tot'], Z - v))
    return uit * g


def beeld(P, st, ramps):
    s, lb = soorten(P)
    t = licht_t(P, s, st)
    e = np.radians(P['_meta']['elevatie'])
    V = np.array([0, -np.cos(e), np.sin(e)], dtype=np.float32)
    uit_lab = kleur_door_t(s, lb, t, st, ramps)
    # staal: de omgeving geeft de waarde, de verf geeft de hamerslag
    im = s == SOORTEN.index('staal')
    if im.any():
        r = ramps['soorten']['staal']
        Lw = staal_omgeving(P, im, st, V)
        verh = (np.maximum(lb[..., 0][im], 1.0) / max(r['ref'][0], 1.0)) ** st['staal']['verf']
        uit_lab[..., 0][im] = Lw * verh
        # het blad van de speer is plat en vangt anders alleen de donkere horizon: op de plaat is het juist het lichtste van de figuur
        sp = P['deelnr'][im] == DEEL['speer']
        uit_lab[..., 0][im] += sp * st['staal']['speer_L'] * P['_vis'][im]
        kl = st['staal']['tint']
        # koel in het licht, warm in de schaduw, zoals de plaat
        f = glad(25, 75, Lw)
        uit_lab[..., 1][im] = kl['schaduw'][0] * (1 - f) + kl['licht'][0] * f
        uit_lab[..., 2][im] = kl['schaduw'][1] * (1 - f) + kl['licht'][1] * f
    # de donkere lijn tussen de lagen, met verzadiging in plaats van zwart
    cl = contactlijn(P, st)
    uit_lab[..., 0] *= 1 - st['contact']['sterkte'] * cl
    rgb = lab_lin(uit_lab)
    rgb = rgb + _lobben(P, s, st, V)
    # randlicht: koel en dun, aan de kant van de lucht
    rc = st['rand']
    f = np.clip(1 - np.clip(P['_Nx'] @ V, 0, 1), 0, 1) ** rc['macht'] * np.clip(P['_Nx'] @ norm(np.array(rc['richting'], dtype=np.float32)), 0, 1)
    rgb = rgb + (f * rc['sterkte'] * P['_aow'])[..., None] * np.array(rc['kleur'], dtype=np.float32)
    # de AI-laag (projecteer.py): wat de AI over dit eindbeeld schilderde, op dezelfde plek van het oppervlak
    if 'laag' in P:
        lb2 = lin_lab(np.clip(rgb, 0, 1))
        d = P['laag'] * st.get('laag_sterkte', 1.0)
        # per onderdeel minder of meer: op de helm legt de volle laag bruine vlekken op het staal (helm-laag.png)
        for naam, f in st.get('laag_per_deel', {}).items():
            d[P['deelnr'] == DEEL[naam]] *= f
        # de AI licht de diepe schaduwen op (gemeten: onder L 15 zit 3,5 tegen 9,4 procent op de plaat): daar telt zijn verlichting niet mee
        ld = st.get('laag_diep', [8, 34])
        d[..., 0] = np.where(d[..., 0] > 0, d[..., 0] * glad(ld[0], ld[1], lb2[..., 0]), d[..., 0])
        rgb = lab_lin(lb2 + d)
    return np.clip(rgb, 0, 1), s, t


def schrijf(rgb, alfa, pad):
    a = (np.clip(alfa, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(np.dstack([(srgb(rgb) * 255 + 0.5).astype(np.uint8), a]), 'RGBA').save(pad)


def _een(args):
    pad, uit, st, ramps, meta = args
    P = lees(pad, meta.get('laag', False))
    P['_meta'] = meta
    rgb, _, _ = beeld(P, st, ramps)
    schrijf(rgb, P['alfa'], uit)
    return os.path.basename(uit)


def ijk(gbmap, houding, richtingen, st):
    """Eenmalig: waar zit het licht t van elke soort, gemeten op de vaste opstelling. Het verloop van de plaat komt daar precies op te liggen."""
    ramps = json.load(open(RAMPS, encoding='utf-8'))
    meta = json.load(open(os.path.join(gbmap, f'{houding}-render.json'), encoding='utf-8'))
    verz = {n: [] for n in SOORTEN}
    ref = {n: [] for n in SOORTEN}
    for r in richtingen:
        P = lees(os.path.join(gbmap, f'{houding}-{r}-00.exr'), meta.get('laag', False))
        P['_meta'] = meta
        s, lb = soorten(P)
        t = licht_t(P, s, st)
        g = P['binnen'] & (P['alfa'] > 0.9)
        for i, n in enumerate(SOORTEN):
            m = g & (s == i)
            if m.sum() > 50:
                verz[n].append(t[m])
                ref[n].append(lb[m])
    for n in SOORTEN:
        if n not in ramps['soorten'] or not verz[n]:
            continue
        a = np.concatenate(verz[n])
        lb = np.concatenate(ref[n])
        ramps['soorten'][n]['t'] = [round(float(x), 4) for x in np.percentile(a, PCT)]
        # strikt oplopend houden voor de interpolatie
        ts = ramps['soorten'][n]['t']
        for j in range(1, len(ts)):
            ts[j] = max(ts[j], ts[j - 1] + 1e-3)
        ramps['soorten'][n]['ref'] = [round(float(np.median(lb[..., 0])), 2), round(float(np.median(np.hypot(lb[..., 1], lb[..., 2]))), 2),
                                      round(float(np.degrees(np.angle(np.exp(1j * np.arctan2(lb[..., 2], lb[..., 1])).mean()))), 2)]
        print(n, ramps['soorten'][n]['t'], ramps['soorten'][n]['ref'])
    with open(RAMPS, 'w', encoding='utf-8') as f:
        json.dump(ramps, f, indent=1)


def hoofd():
    a = sys.argv[1:]
    if a[0] == 'ijk':
        rs = next((x.split('=')[1] for x in a[1:] if x.startswith('richtingen=')), 'Z,ZW,ZO').split(',')
        hd = a[2] if len(a) > 2 and '=' not in a[2] else 'staan'
        ijk(a[1], hd, rs, stijl_van())
        return
    gb, uit, hd = a[0], a[1], a[2]
    st = stijl_van(a[3] if len(a) > 3 else None)
    ramps = json.load(open(RAMPS, encoding='utf-8'))
    os.makedirs(uit, exist_ok=True)
    meta = json.load(open(os.path.join(gb, f'{hd}-render.json'), encoding='utf-8'))
    werk = []
    for p in sorted(glob.glob(os.path.join(gb, f'{hd}-*.exr'))):
        naam = os.path.basename(p)[:-4]
        werk.append((p, os.path.join(uit, naam + '.png'), st, ramps, meta))
        idp = os.path.join(gb, naam + '-id.png')
        if os.path.exists(idp):
            shutil.copy(idp, os.path.join(uit, naam + '-id.png'))
    shutil.copy(os.path.join(gb, f'{hd}-render.json'), os.path.join(uit, f'{hd}-render.json'))
    if len(werk) <= 2:
        for w in werk:
            _een(w)
    else:
        with mp.Pool(min(8, os.cpu_count() or 4)) as pool:
            pool.map(_een, werk)
    print('KLAAR', len(werk), 'beelden', flush=True)


if __name__ == '__main__':
    hoofd()
