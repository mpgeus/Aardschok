# De resterende oorzaak gemeten (vraag 192, de methodeproef). oorzaak.py meet hoe licht en hoe verzadigd; dit meet wat daarna nog overblijft: op welke
# schaal het detail ontbreekt, hoe de kleur verschuift van schaduw naar licht, hoeveel de kleur varieert binnen een materiaal, hoe scherp de hoogste
# lichten zijn, hoe donker de lijnen tussen de delen zijn, en hoe het silhouet verloopt. Alles op dezelfde figuurhoogte.
#
#   python oorzaak2.py <uit.json> <naam>=<png met doorzichtige achtergrond> ...
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ni

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import oorzaak as O  # noqa: E402

BANDEN = (0.7, 1.4, 2.8, 5.6, 11.2)
HOOG = 330


def banden(L, m):
    """De energie per schaal: het verschil tussen twee keer vervagen, binnen een masker. Rand van het masker telt niet mee."""
    uit = []
    binnen = ni.binary_erosion(m, iterations=3)
    if binnen.sum() < 20:
        return [None] * (len(BANDEN) - 1)
    # het vervagen binnen het masker: de achtergrond telt niet mee
    gew = m.astype(np.float32)
    vorige = None
    for s in BANDEN:
        d = ni.gaussian_filter(L * gew, s) / np.maximum(ni.gaussian_filter(gew, s), 1e-3)
        if vorige is not None:
            uit.append(round(float((vorige - d)[binnen].std()), 2))
        vorige = d
    return uit


def meet(rgb, al):
    m = al > 128
    lb = O.lab(rgb)
    L, a, b = lb[..., 0], lb[..., 1], lb[..., 2]
    res = {}
    kl = O.klassen(lb)
    for n, k in kl.items():
        k = k & m
        if k.sum() < 40:
            res[n] = None
            continue
        # kleurverschuiving: de tint in het donkerste en lichtste kwart
        lo, hi = np.percentile(L[k], 25), np.percentile(L[k], 75)
        tint = np.degrees(np.arctan2(b, a))
        dk, lk = k & (L <= lo), k & (L >= hi)
        wd = np.exp(1j * np.radians(tint[dk])).mean()
        wl = np.exp(1j * np.radians(tint[lk])).mean()
        res[n] = {'banden': banden(L, k), 'tint_donker': round(float(np.degrees(np.angle(wd))), 1), 'tint_licht': round(float(np.degrees(np.angle(wl))), 1),
                  'tintverschil': round(float(np.degrees(np.angle(wl / wd))), 1), 'chroma_donker': round(float(np.median(np.hypot(a, b)[dk])), 1), 'chroma_licht': round(float(np.median(np.hypot(a, b)[lk])), 1),
                  'tint_sd': round(float(np.degrees(np.sqrt(-2 * np.log(np.abs(np.exp(1j * np.radians(tint[k])).mean()))))), 1), 'L_sd': round(float(L[k].std()), 1),
                  # de hoogste lichten: hoeveel van het vlak is echt helder, en hoe ver boven de mediaan
                  'L99_boven_mediaan': round(float(np.percentile(L[k], 99) - np.median(L[k])), 1), 'L1_onder_mediaan': round(float(np.median(L[k]) - np.percentile(L[k], 1)), 1)}
    # lijnen tussen de delen: hoe donker is de naad tegenover de vlakken ernaast
    gx, gy = ni.sobel(L, 1), ni.sobel(L, 0)
    gr = np.hypot(gx, gy) / 8.0
    binnen = ni.binary_erosion(m, iterations=3)
    res['_rand'] = {'gradient_mediaan': round(float(np.median(gr[binnen])), 2), 'gradient_p90': round(float(np.percentile(gr[binnen], 90)), 2), 'gradient_p99': round(float(np.percentile(gr[binnen], 99)), 2),
                    'donker_aandeel_L25': round(float((L[binnen] < 25).mean()), 3), 'donker_aandeel_L15': round(float((L[binnen] < 15).mean()), 3)}
    # het silhouet: breedte per hoogte, als deel van de hoogte
    h = m.shape[0]
    prof = []
    for t in np.linspace(0.05, 0.95, 19):
        r = m[int(t * h)]
        w = np.nonzero(r)[0]
        prof.append(round(float((w.max() - w.min() + 1) / h), 3) if len(w) else 0)
    res['_silhouet'] = prof
    return res


def hoofd():
    uit = sys.argv[1]
    br = {'plaat': O.lees_plaat()}
    for a in sys.argv[2:]:
        n, p = a.split('=', 1)
        br[n] = Image.open(p).convert('RGBA')
    res = {}
    for n, im in br.items():
        c = np.asarray(O.schaal(im, HOOG), dtype=np.float32)
        res[n] = meet(c[..., :3], c[..., 3])
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    for soort in ('blauw', 'geel', 'bruin', 'staal', '_rand'):
        for n in res:
            print(soort, n, res[n].get(soort))


if __name__ == '__main__':
    hoofd()
