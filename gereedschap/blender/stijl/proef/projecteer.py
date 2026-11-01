# Van AI-beelden terug op het oppervlak (vraag 192, de methodeproef, methode C en D). Per texel: in welk aanzicht is hij te zien en hoe recht kijkt dat aanzicht ernaar;
# het beste aanzicht telt het zwaarst. Twee manieren, om eerlijk te vergelijken:
#   ruw:    de kleur uit het AI-beeld wordt de verf. Het licht uit het beeld blijft dan op het oppervlak vastzitten.
#   detail: alleen wat de AI heeft toegevoegd (AI min onze invoer, zonder de grote vormen) gaat bovenop de bestaande verf. Ons licht blijft de baas.
#
#   python projecteer.py <invoermap> <aimap> <gbjson> <texturen> <basis> <uitmap> <houding> [wijze=detail] [sterkte=1.0] [hoogdoorlaat=26] [scherp=7] [richtingen=...]
import json
import multiprocessing as mp
import os
import sys
import time

import numpy as np
from PIL import Image
from scipy import ndimage as ni

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import exr  # noqa: E402
import schilder as Sc  # noqa: E402

INST = json.load(open(os.path.join(HIER, '..', 'instellingen.json'), encoding='utf-8'))
# de speer staat niet in de aanzichten (hij zou het lijf bedekken): die houdt zijn eigen verf
DELEN = ('hoofd', 'baard', 'helm', 'kap', 'gambeson', 'tabberd', 'riem', 'buidel', 'hozen', 'laarzen', 'handschoenen')


def lees_srgb(p):
    c = np.asarray(Image.open(p).convert('RGB'), dtype=np.float32) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def vaag_binnen(a, m, s):
    w = ni.gaussian_filter(m.astype(np.float32), s)
    uit = np.empty_like(a)
    for c in range(a.shape[-1]):
        uit[..., c] = ni.gaussian_filter(a[..., c] * m, s) / np.maximum(w, 1e-3)
    return uit


def aanzicht_laden(args):
    """Per aanzicht: de bron in Lab (ruw of verschil), de diepte en het masker."""
    r, inv, ai, gb, hd, wijze, hoogdoorlaat = args
    naam = f'{hd}-{r}-00'
    d = exr.passes(os.path.join(gb, naam + '.exr'))
    al = d['alfa']
    z = d['Depth']
    a = Sc.lin_lab(lees_srgb(os.path.join(ai, naam + '.png')))
    m = ni.binary_erosion(al > 0.98, iterations=3)
    if wijze == 'ruw':
        bron = a
    else:
        b = Sc.lin_lab(lees_srgb(os.path.join(inv, naam + '-init.png')))
        bron = (a - b)
        # de grote vormen eruit: dat is het licht dat de AI anders legde, niet zijn verf
        if hoogdoorlaat > 0:
            bron = bron - vaag_binnen(bron, m, hoogdoorlaat)
        bron = bron * m[..., None]
    return r, bron.astype(np.float32), z.astype(np.float32), m


def project_deel(args):
    naam, tex, basis, uit, meta, views, o = args
    t0 = time.time()
    st = np.load(os.path.join(tex, f'{naam}-stand.npz'))
    P, N = st['P'].astype(np.float64), st['N'].astype(np.float64)
    N = N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    i, j = st['i'], st['j']
    maat = int(np.load(os.path.join(tex, f'{naam}-tex.npz'))['maat'])
    e = np.radians(meta['elevatie'])
    ortho, Bp, Hp = meta['ortho'], meta['b'], meta['h']
    S = max(Bp, Hp) / ortho
    doel = np.array([0, 0, meta['doel_z']], dtype=np.float64)
    f = np.array([0, np.cos(e), -np.sin(e)])
    u = np.array([0, np.sin(e), np.cos(e)])
    V = -f
    som = np.zeros((len(P), 3), dtype=np.float64)
    gew = np.zeros(len(P), dtype=np.float64)
    beste = np.zeros(len(P), dtype=np.float64)
    for r, bron, z, m in views:
        th = np.radians(INST['richtingen'][r])
        c, s = np.cos(th), np.sin(th)
        Rm = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
        Q = (P @ Rm.T) - doel
        Nq = N @ Rm.T
        x = Bp / 2 + Q[:, 0] * S - 0.5
        y = Hp / 2 - (Q @ u) * S - 0.5
        diep = Q @ f + 20.0
        xi, yi = np.rint(x).astype(int), np.rint(y).astype(int)
        binnen = (xi >= 0) & (xi < Bp) & (yi >= 0) & (yi < Hp)
        w = np.zeros(len(P))
        idx = np.nonzero(binnen)[0]
        zp = z[yi[idx], xi[idx]]
        zicht = (diep[idx] <= zp + o['tol']) & m[yi[idx], xi[idx]]
        kijk = np.clip(Nq[idx] @ V, 0, 1)
        w[idx] = np.where(zicht, kijk ** o['scherp'], 0.0)
        w[w < (0.2 ** o['scherp'])] = 0.0
        k = np.nonzero(w)[0]
        if len(k) == 0:
            continue
        coords = np.vstack([y[k], x[k]])
        for ch in range(3):
            som[k, ch] += w[k] * ni.map_coordinates(bron[..., ch], coords, order=1, mode='nearest')
        gew[k] += w[k]
        beste[k] = np.maximum(beste[k], w[k])
    dek = gew > 0
    waarde = np.zeros((len(P), 3), dtype=np.float32)
    waarde[dek] = (som[dek] / gew[dek, None]).astype(np.float32)
    # de basis: de verf die er al was
    kl = lees_srgb(os.path.join(basis, f'{naam}-kleur.png'))
    kl = np.flipud(kl)
    lb = Sc.lin_lab(kl[i, j])
    if o['wijze'] == 'ruw':
        # wat geen aanzicht zag, houdt de basis; met een zachte overgang op het gewicht
        t = np.clip(beste / (0.5 ** o['scherp']), 0, 1)[..., None]
        uit_lb = lb * (1 - t) + waarde * t
    else:
        v = waarde * o['sterkte']
        # de AI mag niet de kleur van een vlak kantelen: chroma dempen, licht houden
        v[:, 1:] *= o['kleur']
        v[:, 0] = np.clip(v[:, 0], -o['max_L'], o['max_L'])
        v[:, 1:] = np.clip(v[:, 1:], -o['max_ab'], o['max_ab'])
        uit_lb = lb + v
    beeld = np.ones((maat, maat, 4), dtype=np.float32)
    g = np.zeros((maat, maat), dtype=bool)
    g[i, j] = True
    beeld[i, j, :3] = Sc.srgb(Sc.lab_lin(uit_lb))
    beeld[..., :3] = Sc.rand_uit(beeld[..., :3], g)
    Sc.schrijf(os.path.join(uit, f'{naam}-kleur.png'), beeld)
    print(naam, 'gezien', round(float(dek.mean()), 3), round(time.time() - t0, 1), 's', flush=True)
    return naam, float(dek.mean())


def _kader(meta):
    e = np.radians(meta['elevatie'])
    return dict(e=e, ortho=meta['ortho'], Bp=meta['b'], Hp=meta['h'], S=max(meta['b'], meta['h']) / meta['ortho'], doel=np.array([0, 0, meta['doel_z']], dtype=np.float64),
                f=np.array([0, np.cos(e), -np.sin(e)]), u=np.array([0, np.sin(e), np.cos(e)]))


def _schrijf_laag(pad, maat, i, j, v):
    beeld = np.ones((maat, maat, 4), dtype=np.float32)
    beeld[..., :3] = 0.5
    g = np.zeros((maat, maat), dtype=bool)
    g[i, j] = True
    beeld[i, j, :3] = np.clip(v / 100.0 + 0.5, 0, 1)
    beeld[..., :3] = Sc.rand_uit(beeld[..., :3], g)
    Sc.schrijf(pad, beeld)


def laag_deel(args):
    """De AI-laag van één onderdeel: alle = de aanzichten samen, zonder de grote vormen; <richting> = de laag van dat aanzicht zelf, en alle waar dat aanzicht niet kijkt."""
    naam, tex, uit, meta, views, o, per_richting = args
    t0 = time.time()
    st = np.load(os.path.join(tex, f'{naam}-stand.npz'))
    P, N = st['P'].astype(np.float64), st['N'].astype(np.float64)
    N = N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-9)
    i, j = st['i'], st['j']
    maat = int(np.load(os.path.join(tex, f'{naam}-tex.npz'))['maat'])
    K = _kader(meta)
    V = -K['f']
    som = np.zeros((len(P), 3))
    gew = np.zeros(len(P))
    eigen = {}
    for r, vol, hp, z, m in views:
        th = np.radians(INST['richtingen'][r])
        c, s = np.cos(th), np.sin(th)
        Rm = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
        Q = (P @ Rm.T) - K['doel']
        Nq = N @ Rm.T
        x = K['Bp'] / 2 + Q[:, 0] * K['S'] - 0.5
        y = K['Hp'] / 2 - (Q @ K['u']) * K['S'] - 0.5
        diep = Q @ K['f'] + 20.0
        xi, yi = np.rint(x).astype(int), np.rint(y).astype(int)
        idx = np.nonzero((xi >= 0) & (xi < K['Bp']) & (yi >= 0) & (yi < K['Hp']))[0]
        zicht = (diep[idx] <= z[yi[idx], xi[idx]] + o['tol']) & m[yi[idx], xi[idx]]
        kijk = np.clip(Nq[idx] @ V, 0, 1)
        k = idx[zicht & (kijk > 0.2)]
        kj = np.clip(Nq[k] @ V, 0, 1)
        coords = np.vstack([y[k], x[k]])
        w = kj ** o['scherp']
        for ch in range(3):
            som[k, ch] += w * ni.map_coordinates(hp[..., ch], coords, order=1, mode='nearest')
        gew[k] += w
        if per_richting:
            val = np.stack([ni.map_coordinates(vol[..., ch], coords, order=1, mode='nearest') for ch in range(3)], -1)
            cov = np.clip((kj - 0.22) / 0.33, 0, 1)
            # de AI mag detail en licht toevoegen, maar het materiaal niet van kleur laten verschuiven: het midden van zijn verschil gaat eruit, per onderdeel
            if len(val) > 50:
                val = val - np.median(val[cov > 0.5] if (cov > 0.5).any() else val, axis=0) * np.array([o['nul_L'], o['nul_ab'], o['nul_ab']])
            eigen[r] = (k, val, cov)
    alle = np.zeros((len(P), 3), dtype=np.float32)
    dek = gew > 0
    alle[dek] = (som[dek] / gew[dek, None]).astype(np.float32)
    os.makedirs(os.path.join(uit, 'alle'), exist_ok=True)
    _schrijf_laag(os.path.join(uit, 'alle', f'{naam}-verschil.png'), maat, i, j, alle)
    for r, (k, val, cov) in eigen.items():
        v = alle.copy()
        v[k] = v[k] * (1 - cov[..., None]) + val * cov[..., None]
        os.makedirs(os.path.join(uit, r), exist_ok=True)
        _schrijf_laag(os.path.join(uit, r, f'{naam}-verschil.png'), maat, i, j, v)
    print(naam, 'gezien', round(float(dek.mean()), 3), round(time.time() - t0, 1), 's', flush=True)
    return naam, float(dek.mean())


def laag_hoofd(inv, ai, gb, tex, uit, hd, o, rs, delen, per_richting):
    meta = json.load(open(os.path.join(gb, f'{hd}-render.json'), encoding='utf-8'))
    t0 = time.time()
    views = []
    for r in rs:
        rr, vol, z, m = aanzicht_laden((r, inv, ai, gb, hd, 'detail', 0))
        hp = vol - vaag_binnen(vol, m, o['hoogdoorlaat']) if o['hoogdoorlaat'] > 0 else vol
        views.append((rr, vol, (hp * m[..., None]).astype(np.float32), z, m))
    # een voor een: met zes draden tegelijk liep dit op 31 okt een hele nacht vast, zonder fout en zonder rekenwerk
    res = dict(laag_deel((n, tex, uit, meta, views, o, per_richting)) for n in delen)
    with open(os.path.join(uit, f'dekking-{delen[0]}.json'), 'w', encoding='utf-8') as f:
        json.dump({'instellingen': o, 'gezien': res, 'seconden': round(time.time() - t0, 1)}, f, indent=1)
    print('KLAAR', uit, round(time.time() - t0, 1), 's', flush=True)


def hoofd():
    if sys.argv[1] == 'laag':
        inv, ai, gb, tex, uit, hd = sys.argv[2:8]
        o = {'hoogdoorlaat': 60.0, 'scherp': 8.0, 'tol': 0.008, 'nul_L': 1.0, 'nul_ab': 1.0}
        rs = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
        delen = list(DELEN)
        per = True
        for a in sys.argv[8:]:
            k, v = a.split('=')
            if k == 'richtingen':
                rs = v.split(',')
            elif k == 'delen':
                delen = v.split(',')
            elif k == 'per':
                per = v == '1'
            else:
                o[k] = float(v)
        laag_hoofd(inv, ai, gb, tex, uit, hd, o, rs, delen, per)
        return
    inv, ai, gb, tex, basis, uit, hd = sys.argv[1:8]
    o = {'wijze': 'detail', 'sterkte': 1.0, 'hoogdoorlaat': 26.0, 'scherp': 7.0, 'tol': 0.008, 'kleur': 0.8, 'max_L': 14.0, 'max_ab': 12.0}
    rs = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
    for a in sys.argv[8:]:
        k, v = a.split('=')
        if k == 'richtingen':
            rs = v.split(',')
        else:
            o[k] = v if k == 'wijze' else float(v)
    os.makedirs(uit, exist_ok=True)
    meta = json.load(open(os.path.join(gb, f'{hd}-render.json'), encoding='utf-8'))
    t0 = time.time()
    views = [aanzicht_laden((r, inv, ai, gb, hd, o['wijze'], o['hoogdoorlaat'])) for r in rs]
    print('aanzichten', round(time.time() - t0, 1), 's', flush=True)
    res = [project_deel((n, tex, basis, uit, meta, views, o)) for n in DELEN]
    Image.open(os.path.join(basis, 'speer-kleur.png')).save(os.path.join(uit, 'speer-kleur.png'))
    # de eigen-texturen gaan ongewijzigd mee
    for n in (*DELEN, 'speer'):
        for bron in (basis, tex):
            p = os.path.join(bron, f'{n}-eigen.png')
            if os.path.exists(p):
                Image.open(p).save(os.path.join(uit, f'{n}-eigen.png'))
                break
    with open(os.path.join(uit, 'dekking.json'), 'w', encoding='utf-8') as f:
        json.dump({'instellingen': o, 'gezien': dict(res), 'seconden': round(time.time() - t0, 1)}, f, indent=1)
    print('KLAAR', uit, round(time.time() - t0, 1), 's', flush=True)


if __name__ == '__main__':
    hoofd()
