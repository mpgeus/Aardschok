# Hoe rustig staat een methode in beweging (vraag 192, de methodeproef): op de sprites van 80 pixels (na de afwerking), per richting over een hele cyclus. Elke maat
# vergelijkt twee bronnen die dezelfde beweging laten zien: wat de beweging zelf doet, zit in allebei. Alleen het verschil zegt iets over de methode.
#
#   python stabiliteit.py <uit.json> <naam=rendermap,...> <houding> <beelden> [richtingen=Z,ZW,...]
import json
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import vel as Vl  # noqa: E402


def lees(m, hd, r, n, s):
    return [np.asarray(Vl.sprite(os.path.join(m, f'{hd}-{r}-{i:02d}.png'), s), dtype=np.float32) for i in range(n)]


def meet(fr):
    n = len(fr)
    a = np.stack([f[..., 3] > 127 for f in fr])
    c = np.stack([f[..., :3] @ np.array([0.3, 0.59, 0.11], dtype=np.float32) for f in fr])
    # de waarde die per beeld heen en weer springt: de tweede afgeleide in de tijd, alleen waar de pixel steeds binnen de figuur ligt
    alle = a.all(0)
    d1 = np.abs(np.roll(c, -1, 0) - c)
    d2 = np.abs(np.roll(c, -1, 0) - 2 * c + np.roll(c, 1, 0))
    randen = (a ^ np.roll(a, -1, 0)).sum((1, 2))
    onder = []
    for f in a:
        ys = np.nonzero(f.any(1))[0]
        onder.append(int(ys.max()))
    return {'verschil_per_beeld': round(float(d1[:, alle].mean()), 3) if alle.any() else None, 'trilling': round(float(d2[:, alle].mean()), 3) if alle.any() else None,
            'trilling_p99': round(float(np.percentile(d2[:, alle], 99)), 2) if alle.any() else None, 'randpixels_wisselen': round(float(randen.mean()), 1), 'voetlijn_min': min(onder), 'voetlijn_max': max(onder), 'vaste_pixels': int(alle.sum())}


def hoofd():
    uit = sys.argv[1]
    br = [x.split('=', 1) for x in sys.argv[2].split(',')]
    hd, n = sys.argv[3], int(sys.argv[4])
    rs = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
    for a in sys.argv[5:]:
        if a.startswith('richtingen='):
            rs = a.split('=')[1].split(',')
    res = {}
    for naam, m in br:
        meta = json.load(open(os.path.join(m, f'{hd}-render.json'), encoding='utf-8'))
        s = Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))
        res[naam] = {r: meet(lees(m, hd, r, n, s)) for r in rs}
        al = list(res[naam].values())
        res[naam]['_gemiddeld'] = {k: round(float(np.mean([x[k] for x in al if x[k] is not None])), 3) for k in ('verschil_per_beeld', 'trilling', 'trilling_p99', 'randpixels_wisselen')}
        print(naam, res[naam]['_gemiddeld'], 'voetlijn', min(x['voetlijn_min'] for x in al), max(x['voetlijn_max'] for x in al))
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)


if __name__ == '__main__':
    hoofd()
