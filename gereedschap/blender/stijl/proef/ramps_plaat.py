# De kleurverlopen uit de plaat (vraag 192, de methodeproef): per materiaalsoort hoe de kleur loopt van de diepste schaduw naar het hoogste licht, gemeten op
# de stukken van de plaat waar dat materiaal groot in beeld staat. Geeft ramps.json; verlicht.py legt die op het licht van het model. De plaat is van Marcel;
# alleen deze getallen gaan mee, geen beeld.
#
#   python ramps_plaat.py
import json
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import oorzaak as O  # noqa: E402
from plaat_vakken import VAKKEN  # noqa: E402

PCT = (2, 15, 50, 85, 98)
PLAAT = np.asarray(Image.open(O.PLAAT).convert('RGB'), dtype=np.float32)


def vak(n):
    x0, y0, x1, y1 = VAKKEN[n] if isinstance(n, str) else n
    return O.lab(PLAAT[y0:y1, x0:x1])


def stops(lb, m):
    L = lb[..., 0][m]
    C = np.hypot(lb[..., 1], lb[..., 2])[m]
    H = np.arctan2(lb[..., 2], lb[..., 1])[m]
    Ls = np.percentile(L, PCT)
    Cs, Hs = [], []
    for l in Ls:
        w = np.abs(L - l) < 4
        if w.sum() < 10:
            w = np.abs(L - l) < 10
        Cs.append(float(np.median(C[w])))
        Hs.append(float(np.degrees(np.angle(np.exp(1j * H[w]).mean()))))
    return {'L': [round(float(x), 2) for x in Ls], 'C': [round(c, 2) for c in Cs], 'h': [round(h, 2) for h in Hs], 't': [0.1, 0.25, 0.5, 0.75, 0.95], 'ref': [50, 30, 50], 'pixels': int(m.sum())}


def hoofd():
    uit = {'_uitleg': 'Per soort de kleur op vijf percentielen van licht (2, 15, 50, 85, 98) op de plaat; t en ref komen uit verlicht.py ijk.', 'soorten': {}}
    s = uit['soorten']
    # tabberd: de drie grote aanzichten van het lijf, op kleur gescheiden
    lb = vak('blauw_geel')
    s['blauw'] = stops(lb, lb[..., 2] < -18)
    s['geel'] = stops(lb, (lb[..., 2] > 45) & (lb[..., 0] > 50) & (lb[..., 1] < 34))
    # de gewatteerde mouw: de tegel en de mouwen in het grote aanzicht
    g = vak('gewat_tegel')
    s['gewat'] = stops(g, np.ones(g.shape[:2], dtype=bool))
    # leer: handschoenen en laarzen samen
    h = np.concatenate([vak('handschoen').reshape(-1, 3), vak('laars').reshape(-1, 3)])[None]
    ch = np.hypot(h[..., 1], h[..., 2])
    s['leer'] = stops(h, (ch > 14) & (h[..., 0] < 68))
    # hout: de tegel en de schacht van de speer
    ho = vak('hout_tegel')
    sc = vak((175, 752, 740, 770))
    al = np.concatenate([ho.reshape(-1, 3), sc.reshape(-1, 3)])[None]
    s['hout'] = stops(al, np.hypot(al[..., 1], al[..., 2]) > 14)
    # staal: de helmen, alleen het grijze deel
    st = vak((20, 585, 830, 660))
    s['staal'] = stops(st, (np.hypot(st[..., 1], st[..., 2]) < 13) & (st[..., 0] > 16))
    # huid en haar: de gezichten
    gz = vak((40, 655, 420, 712))
    L, a, b = gz[..., 0], gz[..., 1], gz[..., 2]
    # huid en baard liggen op de plaat door elkaar: de percentielen geven twee bulten, dus hier met de hand afgelezen van de vergrote gezichten
    s['huid'] = {'L': [36, 48, 62, 73, 82], 'C': [40, 44, 45, 40, 30], 'h': [44, 50, 57, 64, 70], 't': [0.1, 0.25, 0.5, 0.75, 0.95], 'ref': [50, 30, 50], 'pixels': int(((a > 8) & (L > 42)).sum())}
    s['haar'] = {'L': [7, 11, 17, 25, 34], 'C': [5, 8, 12, 15, 17], 'h': [42, 46, 50, 54, 58], 't': [0.1, 0.25, 0.5, 0.75, 0.95], 'ref': [50, 30, 50], 'pixels': int((L < 30).sum())}
    with open(os.path.join(HIER, 'ramps.json'), 'w', encoding='utf-8') as f:
        json.dump(uit, f, indent=1)
    for n, v in s.items():
        print(n, v['pixels'], 'L', v['L'], 'C', v['C'], 'h', v['h'])


if __name__ == '__main__':
    hoofd()
