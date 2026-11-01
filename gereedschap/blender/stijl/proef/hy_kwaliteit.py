# Hunyuan3D-2mv: een herhaalbare kwaliteitscontrole van een render tegen de plaat, per richting. Wat telt is het oordeel op de plaat; dit zijn de maten die daarbij helpen.
# Pixelverschil zit er bewust niet in: die zegt weinig over kwaliteit, en een render met de plaat als verf scoort daar per definitie hoog op.
#
#   python hy_kwaliteit.py <uit.json> plaat=<detail|acht> <naam>=<map met staan-*.png> [...] [richtingen=Z,W,N,O]
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ni

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_invoer as HI  # noqa: E402
import platen4 as P4  # noqa: E402

SPELMAAT = 80  # de figuur van helm tot zool op het vel


def srgb_lab(c):
    c = np.asarray(c, dtype=np.float64) / 255.0
    l = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = l @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], axis=-1)


def klassen(rgb):
    """Blauw, geel, bruin (leer, mouwen, laarzen, hout, huid) en staal, in de pixels van de figuur."""
    r, g, b = rgb[..., 0].astype(float), rgb[..., 1].astype(float), rgb[..., 2].astype(float)
    mx, mn = rgb.max(-1).astype(float), rgb.min(-1).astype(float)
    blauw = (b > r * 1.25) & (b > 70)
    geel = (r > b * 1.7) & (g > r * 0.6) & (mx > 130)
    staal = (mx - mn) < 26
    bruin = ~blauw & ~geel & ~staal
    return {'blauw': blauw, 'geel': geel, 'bruin': bruin, 'staal': staal}


def maten_van(rgb, m, romp):
    """rgb en masker op eigen schaal. romp is het masker zonder dunne delen: de figuur van helm tot zool."""
    ys = np.nonzero(romp.any(1))[0]
    y0, y1 = ys.min(), ys.max()
    H = float(y1 - y0 + 1)
    xs = np.nonzero(romp.any(0))[0]
    uit = {'hoogte_px': int(H), 'breedte_romp': round((xs.max() - xs.min() + 1) / H, 3)}
    ym = np.nonzero(m.any(1))[0]
    uit['speer_boven_figuur'] = round((y0 - ym.min()) / H, 3)
    k = klassen(rgb)
    # de helm: de breedste rij van het staal in het bovenste deel van de romp
    boven = romp & (np.arange(romp.shape[0])[:, None] < y0 + 0.42 * H)
    st = k['staal'] & boven
    if st.any():
        rij = st.sum(1)
        uit['helm_breedte'] = round(float(rij.max()) / H, 3)
        st_ys = np.nonzero(rij > 0.2 * rij.max())[0]
        uit['helm_hoogte'] = round(float(st_ys.max() - st_ys.min() + 1) / H, 3)
    rok = (k['blauw'] | k['geel']) & romp
    if rok.any():
        r_ys = np.nonzero(rok.sum(1) > 0.15 * rok.sum(1).max())[0]
        uit['rok_boven'] = round(float(r_ys.min() - y0) / H, 3)
        uit['rok_onder'] = round(float(r_ys.max() - y0) / H, 3)
    n = float(romp.sum())
    uit['kleur_aandeel'] = {a: round(float((k[a] & romp).sum()) / n, 3) for a in k}
    lab = srgb_lab(rgb)
    uit['kleur_lab'] = {a: [round(float(v), 1) for v in np.median(lab[k[a] & romp], axis=0)] for a in k if (k[a] & romp).sum() > 30}
    # de tabberd: hoe schoon de twee kleuren elk een eigen vlak zijn. Op de rijen van het bovenlijf de grens tussen blauw en geel
    if rok.any():
        kol_b = np.nonzero((k['blauw'] & romp).sum(0) > 2)[0]
        kol_g = np.nonzero((k['geel'] & romp).sum(0) > 2)[0]
        if len(kol_b) and len(kol_g):
            bl, ge = ni.binary_opening(k['blauw'] & romp), ni.binary_opening(k['geel'] & romp)
            uit['tabberd_vlakken'] = {'blauw_stukken': int(ni.label(bl)[1]), 'geel_stukken': int(ni.label(ge)[1]), 'verhouding_blauw_geel': round(float(bl.sum()) / max(float(ge.sum()), 1), 2)}
    return uit, (y0, y1)


def detail(rgb, romp, y0, y1, doel):
    """Hoeveel er te zien is op een gegeven figuurhoogte: de gemiddelde helderheidsrand binnen de figuur. Op de figuur geschaald, zonder de omtrek."""
    s = doel / float(y1 - y0 + 1)
    xs = np.nonzero(romp.any(0))[0]
    vak = (int(xs.min()), int(y0), int(xs.max()) + 1, int(y1) + 1)
    im = Image.fromarray(rgb).crop(vak)
    mk = Image.fromarray((romp * 255).astype(np.uint8)).crop(vak)
    nw, nh = max(2, round(im.width * s)), max(2, round(im.height * s))
    g = np.asarray(im.resize((nw, nh), Image.BOX).convert('L'), dtype=np.float32)
    k = np.asarray(mk.resize((nw, nh), Image.BOX), dtype=np.float32) > 250
    k = ni.binary_erosion(k, iterations=1)
    rand = np.hypot(ni.sobel(g, axis=0), ni.sobel(g, axis=1)) / 8
    return round(float(rand[k].mean()), 2) if k.any() else 0.0


def meet(rgb, m):
    romp = P4.dun_weg(m)
    uit, (y0, y1) = maten_van(rgb, m, romp)
    uit['detail_groot'] = detail(rgb, romp, y0, y1, 341)
    uit['detail_spel'] = detail(rgb, romp, y0, y1, SPELMAAT)
    return uit, romp


def main():
    arg = sys.argv[2:]
    richtingen = 'Z,W,N,O'.split(',')
    bronnen, plaat = {}, 'detail'
    for a in arg:
        k, v = a.split('=', 1)
        if k == 'richtingen':
            richtingen = v.split(',')
        elif k == 'plaat':
            plaat = v
        else:
            bronnen[k] = v
    HI.kies(plaat)
    res = {'plaat': plaat, 'richtingen': {}}
    for r in richtingen:
        rgba, m_ = HI.vrijstaand(r)
        rgb = rgba[..., :3]
        pm, pr = meet(rgb, m_)
        rij = {'plaat': pm}
        for naam, map_ in bronnen.items():
            p = os.path.join(map_, f'staan-{r}-00.png')
            if not os.path.exists(p):
                continue
            im = np.asarray(Image.open(p).convert('RGBA'))
            m = im[..., 3] > 127
            if not m.any():
                continue
            v, vr = meet(im[..., :3], m)
            v['overlap'] = round(P4.overlap(pr, vr), 3)
            rij[naam] = v
        res['richtingen'][r] = rij
    # samenvatting: gemiddelde per bron, en de spreiding van de hoogte over de richtingen
    kort = {}
    for naam in ['plaat'] + list(bronnen):
        rijen = [res['richtingen'][r][naam] for r in richtingen if naam in res['richtingen'][r]]
        if not rijen:
            continue
        kort[naam] = {
            'overlap': round(float(np.mean([x['overlap'] for x in rijen if 'overlap' in x])), 3) if naam != 'plaat' else None,
            'detail_groot': round(float(np.mean([x['detail_groot'] for x in rijen])), 2),
            'detail_spel': round(float(np.mean([x['detail_spel'] for x in rijen])), 2),
            'hoogte_spreiding_pct': round(float(np.std([x['hoogte_px'] for x in rijen]) / np.mean([x['hoogte_px'] for x in rijen]) * 100), 1),
            'helm_breedte': round(float(np.mean([x.get('helm_breedte', 0) for x in rijen])), 3),
            'breedte_romp': round(float(np.mean([x['breedte_romp'] for x in rijen])), 3),
        }
    res['kort'] = kort
    with open(sys.argv[1], 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1, ensure_ascii=False)
    print(json.dumps(kort, ensure_ascii=False))


if __name__ == '__main__':
    main()
