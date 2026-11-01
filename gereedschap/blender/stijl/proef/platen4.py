# De bewijsplaten en de maten van vormproef V4 (vraag 192): referentie, V3 en V4 onder gelijke omstandigheden. Klei: gelijke camera, licht, achtergrond en resolutie; alleen de figuur verschilt.
#
#   python platen4.py <uitmap> <map v4-uitvoer>
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ni

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import render_id_kleuren as RK  # noqa: E402
import vel as Vl  # noqa: E402

R = os.path.abspath(os.path.join(HIER, '..', '..', '..', '..'))
S = os.path.join(R, 'gereedschap', 'pixelart', 'uit', 'stijl')
V3 = os.path.join(S, 'vormproef')
REF = os.path.join(R, 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
GRIJS = (110, 110, 108, 255)
DONKER = (34, 34, 34)
RS = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
VAK = {'Z': (15, 30, 230, 470), 'ZW': (235, 30, 415, 470), 'W': (462, 50, 632, 470), 'NW': (660, 45, 860, 470), 'N': (885, 50, 1095, 470), 'NO': (1130, 30, 1345, 470), 'O': (1370, 45, 1505, 470), 'ZO': (1530, 30, 1755, 470)}
# gemeten op de plaat, richting Z, op een raster, plusminus 1 plaatpixel (zo'n 0,3 procent van de hoogte); figuur van helm tot zool 341 pixels
PLAAT = {'helmrand': 0.349, 'koepel': 0.261, 'gezicht met haar': 0.197, 'helm tot baard': 0.334, 'helm tot riem': 0.575, 'schouders (tabberd)': 0.388, 'riem': 0.268, 'zoom': 0.41, 'riem tot zoom': 0.235, 'bovenarm': 0.103, 'laars': 0.22, 'hele breedte': 0.601, 'voetafstand': 0.293, 'speer': 1.167}


def letter(g=17):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def op_grijs(p, krop=True):
    im = Image.open(p).convert('RGBA')
    bg = Image.new('RGBA', im.size, GRIJS)
    bg.alpha_composite(im)
    return bg.crop(im.getbbox()).convert('RGB') if krop else bg.convert('RGB')


def ref_vak(r):
    return Image.open(REF).convert('RGB').crop(VAK[r])


# de hoogte van de figuur op de plaat, helm tot zool, in plaatpixels: Z, W en N gemeten op het raster, de rest geschat op dezelfde maat
REF_H = {'Z': 341, 'ZW': 341, 'W': 338, 'NW': 341, 'N': 341, 'NO': 341, 'O': 341, 'ZO': 341}


def fig_h(map_, r):
    """De hoogte van de figuur in een render, helm tot zool, zonder de speer: de platen schalen hierop, niet op de hoogte met speer."""
    ids = np.asarray(Image.open(os.path.join(map_, f'staan-{r}-00-id.png')).convert('RGBA'), dtype=np.float32)
    def m(n):
        doel = np.where(np.array(RK.KLEUR[n]) == 0.5, 0.735, np.array(RK.KLEUR[n]))
        return (np.abs(ids[..., :3] / 255.0 - doel).sum(-1) < 0.15) & (ids[..., 3] > 200)
    ys = np.nonzero(m('helm').any(1))[0]
    yl = np.nonzero(m('laarzen').any(1))[0]
    return int(yl.max() - ys.min() + 1)


def gelijk(items, doel, namen=None, tussen=8):
    """Beelden naast elkaar met dezelfde karakterhoogte in beeld, de onderkant op één lijn. items: (beeld, hoogte van de figuur erin)."""
    bs = [b.resize((round(b.width * doel / h), round(b.height * doel / h)), Image.LANCZOS) for b, h in items]
    kop = 26 if namen else 0
    H = max(b.height for b in bs)
    d = Image.new('RGB', (sum(b.width for b in bs) + tussen * (len(bs) - 1), H + kop), DONKER)
    t_ = ImageDraw.Draw(d)
    x = 0
    for i, b in enumerate(bs):
        d.paste((110, 110, 108), (x, kop, x + b.width, H + kop))
        d.paste(b, (x, kop + H - b.height))
        if namen:
            t_.text((x + 4, 3), namen[i], fill=(240, 240, 240), font=letter())
        x += b.width + tussen
    return d


def rij(beelden, H, namen=None, tussen=8, filter_=Image.LANCZOS):
    bs = [b.resize((round(b.width * H / b.height), H), filter_) for b in beelden]
    kop = 26 if namen else 0
    d = Image.new('RGB', (sum(b.width for b in bs) + tussen * (len(bs) - 1), H + kop), DONKER)
    t = ImageDraw.Draw(d)
    x = 0
    for i, b in enumerate(bs):
        d.paste(b, (x, kop))
        if namen:
            t.text((x + 4, 3), namen[i], fill=(240, 240, 240), font=letter())
        x += b.width + tussen
    return d


def onder(*platen, tussen=10):
    d = Image.new('RGB', (max(p.width for p in platen), sum(p.height for p in platen) + tussen * (len(platen) - 1)), DONKER)
    y = 0
    for p in platen:
        d.paste(p, (0, y))
        y += p.height + tussen
    return d


def naast(*platen, tussen=16):
    d = Image.new('RGB', (sum(p.width for p in platen) + tussen * (len(platen) - 1), max(p.height for p in platen)), DONKER)
    x = 0
    for p in platen:
        d.paste(p, (x, 0))
        x += p.width + tussen
    return d


def schaal(m):
    meta = json.load(open(os.path.join(m, os.path.basename(m) if False else 'staan-render.json'), encoding='utf-8')) if os.path.exists(os.path.join(m, 'staan-render.json')) else json.load(open(os.path.join(m, 'lopen-render.json'), encoding='utf-8'))
    return Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))


def sprite(pad, s, V_=1, krop=True):
    c = Vl.sprite(pad, s)
    bb = c.getbbox()
    bg = Image.new('RGBA', c.size, GRIJS)
    bg.alpha_composite(c)
    c = bg.crop(bb).convert('RGB') if krop else bg.convert('RGB')
    return c.resize((c.width * V_, c.height * V_), Image.NEAREST)


# --- A: de vorm ----------------------------------------------------------------------------------------------------------------------------

def plaat_a(uit, v4):
    m3, m4 = os.path.join(V3, 'klei-v3'), os.path.join(v4, 'klei')
    a = gelijk([(ref_vak('Z'), REF_H['Z']), (op_grijs(os.path.join(m3, 'staan-Z-00.png')), fig_h(m3, 'Z')), (op_grijs(os.path.join(m4, 'staan-Z-00.png')), fig_h(m4, 'Z'))], 760, ['referentie', 'V3', 'V4'])
    a.save(os.path.join(uit, 'A-vorm-zuid.png'))
    d = []
    for r, naam in (('ZW', 'zuidwest'), ('W', 'west'), ('N', 'noord')):
        d.append(gelijk([(ref_vak(r), REF_H[r]), (op_grijs(os.path.join(m3, f'staan-{r}-00.png')), fig_h(m3, r)), (op_grijs(os.path.join(m4, f'staan-{r}-00.png')), fig_h(m4, r))], 480, [f'{naam}: ref', 'V3', 'V4']))
    naast(*d).save(os.path.join(uit, 'A-vorm-zij-rug.png'))


# --- B: het silhouet ------------------------------------------------------------------------------------------------------------------------

def masker_plaat(r):
    a = np.asarray(ref_vak(r), dtype=np.float32)
    bg = np.median(np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3)]), axis=0)
    sat = a.max(-1) - a.min(-1)
    m = (sat > 42) | (np.abs(a.mean(-1) - bg.mean()) > 34)
    m = ni.binary_closing(m, iterations=2)
    lab, n = ni.label(m)
    if n:
        m = lab == (np.argmax(ni.sum(m, lab, range(1, n + 1))) + 1)
    return ni.binary_fill_holes(m)


def masker_render(p):
    return np.asarray(Image.open(p).convert('RGBA'))[..., 3] > 127


def zwart(m):
    return Image.fromarray(np.where(m, 0, 225).astype(np.uint8)).convert('RGB').crop(Image.fromarray((m * 255).astype(np.uint8)).getbbox())


def plaat_b(uit, v4):
    p = []
    for r in ('Z', 'W', 'N'):
        m3, m4 = os.path.join(V3, 'klei-v3'), os.path.join(v4, 'klei')
        p.append(gelijk([(zwart(masker_plaat(r)), REF_H[r]), (zwart(masker_render(os.path.join(m3, f'staan-{r}-00.png'))), fig_h(m3, r)), (zwart(masker_render(os.path.join(m4, f'staan-{r}-00.png'))), fig_h(m4, r))], 520, [f'{r}: ref (benadering)', 'V3', 'V4']))
    naast(*p).save(os.path.join(uit, 'B-silhouet.png'))


def grootste(m):
    lab, n = ni.label(m)
    return lab == (np.argmax(ni.sum(m, lab, range(1, n + 1))) + 1)


def dun_weg(m, deel=0.024):
    """Zonder wat dun is: de schacht en het blad van de speer. Op de kleur van het id-beeld bleef een rand van de speer staan,
    en dan schaalde overlap() op de hoogte met speer: V3 en V4 kregen te lage cijfers. De straal als deel van de hoogte met speer."""
    ys = np.nonzero(m.any(1))[0]
    st = max(2, round(deel * (ys.max() - ys.min())))
    romp = grootste(ni.binary_opening(m, iterations=st))
    return m & ni.binary_dilation(romp, iterations=st + 2)


def plaat_zonder_speer(r):
    m = masker_plaat(r)
    x0, y0 = VAK[r][:2]
    h, w = m.shape
    # de speer op de plaat, afgelezen op het raster; bij de hand blijft alles staan, want daar is de hand breder dan de schacht
    lijn = {'Z': ((41, 44), (47, 442), (262, 322)), 'N': ((1071, 44), (1062, 430), (278, 322))}[r]
    (xa, ya), (xb, yb), (h0, h1) = lijn
    yy, xx = np.mgrid[0:h, 0:w]
    px, py = xx + x0, yy + y0
    t = (py - ya) / (yb - ya)
    breed = np.where(py < ya + 100, 26, 11)
    weg_ = (np.abs(px - (xa + t * (xb - xa))) < breed) & ((py < h0) | (py > h1))
    m = m & ~weg_
    lab, n = ni.label(m)
    return lab == (np.argmax(ni.sum(m, lab, range(1, n + 1))) + 1)


def overlap(a, b, H=500):
    def norm(m):
        ys, xs = np.nonzero(m)
        c = m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
        im = Image.fromarray((c * 255).astype(np.uint8)).resize((round(c.shape[1] * H / c.shape[0]), H), Image.BILINEAR)
        return np.asarray(im) > 127
    a, b = norm(a), norm(b)
    W = max(a.shape[1], b.shape[1]) + 40
    def leg(m, dx=0):
        d = np.zeros((H, W), dtype=bool)
        x = (W - m.shape[1]) // 2 + dx
        d[:, x:x + m.shape[1]] = m
        return d
    A = leg(a)
    return max(float((A & leg(b, dx)).sum() / max((A | leg(b, dx)).sum(), 1)) for dx in range(-20, 21, 2))


# --- C: acht richtingen ---------------------------------------------------------------------------------------------------------------------

def plaat_c(uit, v4):
    a = gelijk([(ref_vak(r), REF_H[r]) for r in RS], 320)
    c = gelijk([(op_grijs(os.path.join(v4, 'klei', f'staan-{r}-00.png')), fig_h(os.path.join(v4, 'klei'), r)) for r in RS], 320)
    d = gelijk([(op_grijs(os.path.join(v4, 'renders-groot', f'staan-{r}-00.png')), fig_h(os.path.join(v4, 'klei'), r)) for r in RS], 320)
    onder(a, c, d).save(os.path.join(uit, 'C-acht-richtingen.png'))


# --- D: op spelmaat -------------------------------------------------------------------------------------------------------------------------

def plaat_d(uit, v4):
    regels = []
    ref = Image.open(REF).convert('RGB')
    for naam, bron in (('referentie (verkleind, zonder afwerking)', None), ('V3, klei', os.path.join(V3, 'klei-spel-v3')), ('V4, klei', os.path.join(v4, 'klei-spel')), ('V3, bestaande verf', os.path.join(V3, 'renders', 'staan')), ('V4, bestaande verf', os.path.join(v4, 'renders', 'staan'))):
        cel = []
        for r in ('Z', 'ZW', 'W', 'NO', 'N'):
            if bron is None:
                # de referentie op de spelmaat van de figuur: helm tot zool 80 pixels, net als de sprites
                c = ref.crop(VAK[r])
                s_ = 80.0 / REF_H[r]
                c = c.resize((round(c.width * s_), round(c.height * s_)), Image.BOX)
            else:
                c = sprite(os.path.join(bron, f'staan-{r}-00.png'), schaal(bron))
            cel.append(c)
        groot = [c.resize((c.width * 3, c.height * 3), Image.NEAREST) for c in cel]
        w = sum(c.width for c in groot) + 6 * len(groot) + sum(c.width for c in cel) + 8 * len(cel)
        h = max(c.height for c in groot) + 22
        d = Image.new('RGB', (w, h), (110, 110, 108))
        ImageDraw.Draw(d).text((4, 2), naam, fill=(255, 255, 255), font=letter())
        x = 0
        for c in groot:
            d.paste(c, (x, h - c.height))
            x += c.width + 6
        for c in cel:
            d.paste(c, (x, h - c.height))
            x += c.width + 8
        regels.append(d)
    onder(*regels, tussen=4).save(os.path.join(uit, 'D-80px.png'))
    k = []
    for m, naam in ((os.path.join(V3, 'renders', 'staan'), 'V3'), (os.path.join(v4, 'renders', 'staan'), 'V4')):
        s = schaal(m)
        rijtje = [sprite(os.path.join(m, f'staan-{r}-00.png'), s, 3, krop=False) for r in RS]
        k.append(rij(rijtje, rijtje[0].height, [f'{naam} {r}' for r in RS], filter_=Image.NEAREST))
    onder(*k).save(os.path.join(uit, 'D-acht-80px.png'))


# --- E: de beweging, als strook --------------------------------------------------------------------------------------------------------------

def strook(map_, houding, r, beelden, H=300, midden=None):
    uit = []
    for i in beelden:
        im = Image.open(os.path.join(map_, f'{houding}-{r}-{i:02d}.png')).convert('RGBA')
        bg = Image.new('RGBA', im.size, GRIJS)
        bg.alpha_composite(im)
        w, h = im.size
        uit.append(bg.crop((int(w * .16), int(h * .08), int(w * .84), int(h * .94))).convert('RGB'))
    return rij(uit, H, [f'{r} {i}' for i in beelden], tussen=2)


def plaat_e(uit, v4):
    p = []
    for r in ('ZW', 'W', 'NO'):
        p.append(strook(os.path.join(v4, 'klei-loop'), 'lopen', r, range(0, 12, 2), 300))
    onder(*p).save(os.path.join(uit, 'E-loop-klei.png'))
    # de rok groot
    q = []
    for r in ('ZW', 'W'):
        rijtje = []
        for i in (0, 3, 6, 9):
            im = Image.open(os.path.join(v4, 'klei-loop', f'lopen-{r}-{i:02d}.png')).convert('RGBA')
            bg = Image.new('RGBA', im.size, GRIJS)
            bg.alpha_composite(im)
            bb = im.getbbox()
            h = bb[3] - bb[1]
            x0 = (bb[0] + bb[2]) // 2 - 130
            rijtje.append(bg.crop((x0, bb[1] + int(h * .5), x0 + 260, bb[3] + 4)).convert('RGB'))
        q.append(rij(rijtje, 360, [f'V4 {r} {i}' for i in (0, 3, 6, 9)]))
    onder(*q).save(os.path.join(uit, 'E-loop-rok.png'))
    if os.path.isdir(os.path.join(v4, 'klei-steek')):
        onder(strook(os.path.join(v4, 'klei-steek'), 'proef_steek', 'ZW', range(0, 8), 300), strook(os.path.join(v4, 'klei-steek'), 'proef_steek', 'W', range(0, 8), 300)).save(os.path.join(uit, 'E-TEST-steek.png'))
    if os.path.isdir(os.path.join(v4, 'klei-val')):
        strook(os.path.join(v4, 'klei-val'), 'proef_val', 'ZW', range(0, 8), 300).save(os.path.join(uit, 'E-TEST-val.png'))
    # van staan naar lopen: de laatste rust en de eerste loopbeelden, op spelmaat en in klei
    a, b = os.path.join(v4, 'renders', 'staan'), os.path.join(v4, 'renders', 'lopen')
    s = schaal(b)
    regels = []
    ov = json.load(open(os.path.join(uit, 'animatie.json'), encoding='utf-8'))['overgang_nieuw']['beeld']
    for r in ('Z', 'ZW', 'W'):
        rijtje = [sprite(os.path.join(a, f'staan-{r}-{i:02d}.png'), s, 3, krop=False) for i in (2, 3)]
        rijtje += [sprite(os.path.join(b, f'lopen-{r}-{(ov + i) % 12:02d}.png'), s, 3, krop=False) for i in range(5)]
        regels.append(rij(rijtje, rijtje[0].height, ['staan', 'staan'] + [f'lopen {(ov + i) % 12}' for i in range(5)], filter_=Image.NEAREST))
    onder(*regels).save(os.path.join(uit, 'E-staan-naar-lopen.png'))


# --- de helm apart ---------------------------------------------------------------------------------------------------------------------------

def plaat_helm(uit, v4):
    m = os.path.join(v4, 'klei-helm')
    if not os.path.isdir(m):
        return
    d = []
    for naam, r in (('voor', 'Z'), ('zij', 'W'), ('schuin', 'ZW')):
        im = op_grijs(os.path.join(m, f'staan-{r}-00.png'))
        d.append((naam, im))
    d.append(('boven', op_grijs(os.path.join(v4, 'klei-helm-boven', 'staan-Z-00.png'))))
    rij([x[1] for x in d], 520, [x[0] for x in d]).save(os.path.join(uit, 'helm-controle.png'))


# --- de maten --------------------------------------------------------------------------------------------------------------------------------

def maten(map_):
    p = os.path.join(map_, 'staan-Z-00')
    idb = np.asarray(Image.open(p + '-id.png').convert('RGBA'), dtype=np.float32)
    def m(n):
        doel = np.where(np.array(RK.KLEUR[n]) == 0.5, 0.735, np.array(RK.KLEUR[n]))
        return (np.abs(idb[..., :3] / 255.0 - doel).sum(-1) < 0.15) & (idb[..., 3] > 200)
    def bb(x):
        ys, xs = np.nonzero(x)
        return xs.min(), xs.max(), ys.min(), ys.max()
    helm, hoofd_, tab, riem, gam, laars, speer = m('helm'), m('hoofd'), m('tabberd'), m('riem'), m('gambeson'), m('laarzen'), m('speer')
    x0, x1, y0, _ = bb(helm)
    y1 = bb(laars)[3]
    H = y1 - y0 + 1
    bx0, bx1, _, _ = bb((idb[..., 3] > 200) & ~speer)
    rand_y = y0 + int((np.nonzero(helm.sum(1) == helm.sum(1).max())[0][0] - y0) * 0.72)
    kx = np.nonzero(helm[rand_y])[0]
    gx0, gx1, _, gy1 = bb(hoofd_)
    tx0, tx1, ty0, ty1 = bb(tab)
    rx0, rx1, ry0, ry1 = bb(riem)
    boven = np.nonzero(tab[:ry0].any(0))[0]
    zm = np.nonzero(tab[ty1 - max(4, H // 40):ty1].any(0))[0]
    # de bovenarm: de breedte van de mouw op de helft tussen schouder en riem, aan de kant zonder speer
    my = (ty0 + ry0) // 2
    midden = (tx0 + tx1) // 2
    run = np.nonzero(gam[my, midden:])[0]
    if len(run):
        stuk = np.split(run, np.nonzero(np.diff(run) > 2)[0] + 1)[-1]
        arm_b = stuk.max() - stuk.min() + 1
    else:
        arm_b = 0
    lab, n = ni.label(laars)
    grote = sorted(range(1, n + 1), key=lambda i: -(lab == i).sum())[:2]
    cs = [bb(lab == i) for i in grote]
    voet = abs((cs[0][0] + cs[0][1]) / 2 - (cs[1][0] + cs[1][1]) / 2) if len(cs) == 2 else 0.0
    sy0, sy1 = bb(speer)[2:]
    uit = {'helmrand': x1 - x0 + 1, 'koepel': kx.max() - kx.min() + 1, 'gezicht met haar': gx1 - gx0 + 1, 'helm tot baard': gy1 - y0 + 1, 'helm tot riem': (ry0 + ry1) // 2 - y0 + 1, 'schouders (tabberd)': boven.max() - boven.min() + 1, 'riem': rx1 - rx0 + 1,
           'zoom': zm.max() - zm.min() + 1, 'riem tot zoom': ty1 - (ry0 + ry1) // 2 + 1, 'bovenarm': arm_b, 'laars': max(c[3] - c[2] + 1 for c in cs), 'hele breedte': bx1 - bx0 + 1, 'voetafstand': voet, 'speer': sy1 - sy0 + 1}
    return {k: float(v) / H for k, v in uit.items()}


def meet(uit, v4):
    a = maten(os.path.join(V3, 'klei-v3'))
    b = maten(os.path.join(v4, 'klei'))
    res = {}
    for k, p in PLAAT.items():
        d3, d4 = abs(a[k] - p), abs(b[k] - p)
        oordeel = 'gelijk' if abs(d3 - d4) < 0.003 else ('beter' if d4 < d3 else 'slechter')
        res[k] = {'plaat': p, 'V3': round(a[k], 3), 'V4': round(b[k], 3), 'afwijking_V3_pct': round((a[k] - p) / p * 100, 1), 'afwijking_V4_pct': round((b[k] - p) / p * 100, 1), 'oordeel': oordeel}
    # het silhouet zonder speer, geschaald op dezelfde hoogte: een benadering, de plaat staat iets gedraaid
    res2 = {}
    for r in ('Z', 'N'):
        pl = plaat_zonder_speer(r)
        res2[r] = {'V3': round(overlap(pl, dun_weg(masker_render(os.path.join(V3, 'klei-v3', f'staan-{r}-00.png')))), 3), 'V4': round(overlap(pl, dun_weg(masker_render(os.path.join(v4, 'klei', f'staan-{r}-00.png')))), 3)}
    with open(os.path.join(uit, 'maten.json'), 'w', encoding='utf-8') as f:
        json.dump({'maten': res, 'silhouet_overlap_zonder_speer': res2}, f, indent=1)
    for k, v in res.items():
        print(f"{k:22s} plaat {v['plaat']:.3f}  V3 {v['V3']:.3f} ({v['afwijking_V3_pct']:+.0f}%)  V4 {v['V4']:.3f} ({v['afwijking_V4_pct']:+.0f}%)  {v['oordeel']}")
    print('silhouet', res2)


def hoofd():
    uit, v4 = sys.argv[1:3]
    os.makedirs(uit, exist_ok=True)
    onderdelen = sys.argv[3].split(',') if len(sys.argv) > 3 else ['a', 'b', 'c', 'd', 'e', 'h', 'm']
    if 'm' in onderdelen:
        meet(uit, v4)
    if 'a' in onderdelen:
        plaat_a(uit, v4)
    if 'b' in onderdelen:
        plaat_b(uit, v4)
    if 'c' in onderdelen:
        plaat_c(uit, v4)
    if 'd' in onderdelen:
        plaat_d(uit, v4)
    if 'e' in onderdelen:
        plaat_e(uit, v4)
    if 'h' in onderdelen:
        plaat_helm(uit, v4)
    print('KLAAR', uit)


if __name__ == '__main__':
    hoofd()
