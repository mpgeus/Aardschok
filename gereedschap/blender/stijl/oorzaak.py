# De oorzaak gemeten (vraag 192, de kwaliteitsronde): de plaat en een render op dezelfde figuurhoogte, per soort kleur: hoe ver het licht
# loopt (L*: het donkerste en lichtste deel), hoe verzadigd, en hoeveel klein contrast er is, groot en op spelmaat. Zo zie je of een verschil
# in de waarden zit, in de kleur of in het detail, zonder te raden.
#
#   python oorzaak.py <uit.json> <naam>=<png met doorzichtige achtergrond> ...     (de Python van ComfyUI)
import json
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
PLAAT = os.path.join(HIER, '..', '..', '..', 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
# de speerman op de plaat, zuidaanzicht, zonder de punt van de speer: x0, y0, x1, y1
PLAAT_VAK = (12, 118, 232, 468)
ACHTERGROND = np.array([110, 110, 108], dtype=np.float32)
HOOGTE = 330


def lab(rgb):
    c = rgb / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ m.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def klassen(L_a_b):
    L, a, b = L_a_b[..., 0], L_a_b[..., 1], L_a_b[..., 2]
    ch = np.hypot(a, b)
    return {
        'blauw': (b < -18),
        'geel': (b > 45) & (L > 55) & (a < 32),
        'bruin': (b > 12) & (b <= 60) & (a > 8) & (L < 62),
        'staal': (ch < 12) & (L > 22),
    }


def hoogdoorlaat(g, straal=2):
    k = np.ones(2 * straal + 1) / (2 * straal + 1)
    v = np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 0, g)
    v = np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 1, v)
    return g - v


def meet(rgb, m):
    """Per soort: L* op 5, 50 en 95 procent, chroma en klein contrast."""
    lb = lab(rgb)
    uit = {}
    hp = hoogdoorlaat(lb[..., 0])
    for naam, k in klassen(lb).items():
        k = k & m
        if k.sum() < 12:
            uit[naam] = None
            continue
        L = lb[..., 0][k]
        uit[naam] = {'aandeel': round(float(k.sum() / m.sum()), 3), 'L5': round(float(np.percentile(L, 5)), 1), 'L50': round(float(np.percentile(L, 50)), 1),
                     'L95': round(float(np.percentile(L, 95)), 1), 'bereik': round(float(np.percentile(L, 95) - np.percentile(L, 5)), 1),
                     'chroma': round(float(np.median(np.hypot(lb[..., 1], lb[..., 2])[k])), 1), 'klein_contrast': round(float(hp[k].std()), 2)}
    uit['_geheel'] = {'L5': round(float(np.percentile(lb[..., 0][m], 5)), 1), 'L95': round(float(np.percentile(lb[..., 0][m], 95)), 1),
                      'klein_contrast': round(float(hp[m].std()), 2)}
    return uit


def lees_plaat():
    im = Image.open(PLAAT).convert('RGB').crop(PLAAT_VAK)
    a = np.asarray(im, dtype=np.float32)
    # de grijze achtergrond eruit
    m = np.abs(a - np.median(a[:8, :8].reshape(-1, 3), axis=0)).sum(-1) > 26
    return Image.fromarray(np.dstack([a, m * 255.0]).astype(np.uint8), 'RGBA')


def schaal(im, hoog):
    bb = im.getbbox()
    c = im.crop(bb)
    s = hoog / c.height
    return c.resize((max(1, round(c.width * s)), hoog), Image.BOX)


def hoofd():
    uit = sys.argv[1]
    bronnen = {'plaat': lees_plaat()}
    for a in sys.argv[2:]:
        n, p = a.split('=', 1)
        bronnen[n] = Image.open(p).convert('RGBA')
    res = {}
    for n, im in bronnen.items():
        res[n] = {}
        for h, naam in ((HOOGTE, f'{HOOGTE}px'), (80, '80px')):
            c = np.asarray(schaal(im, h), dtype=np.float32)
            res[n][naam] = meet(c[..., :3], c[..., 3] > 128)
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    for maat in (f'{HOOGTE}px', '80px'):
        print(maat)
        for soort in ('blauw', 'geel', 'bruin', 'staal', '_geheel'):
            for n in res:
                r = res[n][maat].get(soort)
                print(f'  {soort:8s} {n:10s}', r)


if __name__ == '__main__':
    hoofd()
