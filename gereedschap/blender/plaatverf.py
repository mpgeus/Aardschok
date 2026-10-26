# De verf van Marcels plaat voor onze wapenrok (vraag 190; Marcel koos "Plaat op 3D projecteren"; beeld.md, "De
# aankleding naar Marcels platen"): de wapenrok van voren van de plaat (EXTRA/Middeleeuwse krijgeruitrusting
# spritesheet.png, de derde rij) gebogen tot hij op ons masker valt (hg_soldaat.py ... masker): per beeldrij, met de hals,
# de riem en de zoom op elkaar (de riem op de plaat gevonden als de rij met het meeste bruin), en binnen een rij van rand
# tot rand. Daarna legt hg_soldaat.py ... verf hem op het model.
#
#   python gereedschap/blender/plaatverf.py <map met masker-wapenrok.png en .json>   (de Python van ComfyUI, met PIL)
#   python gereedschap/blender/plaatverf.py <map> alle    de vijf richtingen van plaatbak.py (masker-<r>.png naar verf-<r>.png)
import json
import sys

import numpy as np
from PIL import Image

PLAAT = __file__.replace('\\', '/').rsplit('/', 3)[0] + '/EXTRA/Middeleeuwse krijgeruitrusting spritesheet.png'
RIJ = (270, 545)  # de rij met de wapenrokken op de plaat (y)
# per richting welke wapenrok van de plaat (van links af geteld), zoals plaatbak.RICHTINGEN
RICHTINGEN = {'Z': 0, 'ZW': 1, 'W': 2, 'N': 3, 'O': 4}
RAND = 2.0  # zoveel pixels van de tekening binnen de rand blijven (daar mengt het magenta mee)


def magenta(a):
    return (a[..., 0] > 170) & (a[..., 2] > 170) & (a[..., 1] < 110)


def tekening(nummer=0):
    """De wapenrok met dit nummer van de plaat (0 van voren), met zijn vorm (geen magenta) en de rijen van de hals, de
    riem en de zoom."""
    plaat = np.asarray(Image.open(PLAAT).convert('RGB')).astype(np.float32)
    rij = plaat[RIJ[0]:RIJ[1]]
    vorm = ~magenta(rij)
    kol = vorm.sum(0) > 3
    stukken, aan, start = [], False, 0
    for x, k in enumerate(kol):
        if k and not aan:
            aan, start = True, x
        if not k and aan:
            aan = False
            if x - start > 40:
                stukken.append((start, x))
    x0, x1 = stukken[nummer]
    beeld, vorm = rij[:, x0:x1], vorm[:, x0:x1]
    ys = np.where(vorm.sum(1) > 0)[0]
    beeld, vorm = beeld[ys[0]:ys[-1] + 1], vorm[ys[0]:ys[-1] + 1]
    # de riem: in het midden van de hoogte de rij met het meeste bruin (rood boven groen boven blauw, niet geel)
    r, g, b = beeld[..., 0], beeld[..., 1], beeld[..., 2]
    bruin = vorm & (r > g + 15) & (g > b + 5) & (r < 175) & (r > 60)
    h = len(beeld)
    band = bruin[int(h * 0.35):int(h * 0.75)].sum(1)
    riem = int(h * 0.35) + int(np.convolve(band, np.ones(9) / 9, 'same').argmax())
    return beeld, vorm, {'hals': 0.0, 'riem': float(riem), 'zoom': float(h - 1)}


def buig(map_, naam='wapenrok', nummer=0):
    doel = np.asarray(Image.open(f'{map_}/masker-{naam}.png').convert('RGBA')).astype(np.float32)
    binnen = doel[..., 3] > 128
    ankers = json.load(open(f'{map_}/masker-{naam}.json'))
    beeld, vorm, bron = tekening(nummer)
    print('ankers doel', {k: round(v) for k, v in ankers.items()}, 'bron', bron, 'tekening', beeld.shape[:2])
    H, W = binnen.shape
    uit = np.zeros((H, W, 4), np.uint8)
    # per doelrij de bronrij: stuksgewijs recht tussen de hals, de riem en de zoom (erboven en eronder doorgetrokken)
    # de boven- en onderrand van het masker zelf als hals en zoom: de camera kijkt van boven, dus de schouders komen hoger
    # in beeld dan de hals voor (daar kwam magenta), en de zoom voor ligt lager dan de onderrand die je ziet
    rijen = np.where(binnen.any(1))[0]
    td = [float(rijen[0]), ankers['riem'], float(rijen[-1])]
    tb = [bron['hals'], bron['riem'], bron['zoom']]
    for y in range(H):
        xs = np.where(binnen[y])[0]
        if not len(xs):
            continue
        ys = np.interp(y, td, tb, left=None, right=None)
        if y < td[0]:
            ys = tb[0] + (y - td[0]) * (tb[1] - tb[0]) / (td[1] - td[0])
        if y > td[2]:
            ys = tb[2]
        yb = int(np.clip(round(ys), 0, len(beeld) - 1))
        bx = np.where(vorm[yb])[0]
        if not len(bx):
            continue
        L, R = xs[0], xs[-1]
        Ls, Rs = bx[0] + RAND, bx[-1] - RAND
        for x in xs:
            t = (x - L) / max(1, R - L)
            xb = Ls + t * (Rs - Ls)
            # lineair tussen de twee buurpixels van de bron (in x en in y)
            xi, yi = int(np.floor(xb)), int(np.floor(ys)) if 0 <= ys < len(beeld) - 1 else yb
            fx, fy = xb - xi, (ys - yi) if 0 <= ys < len(beeld) - 1 else 0.0
            xi2, yi2 = min(xi + 1, beeld.shape[1] - 1), min(yi + 1, len(beeld) - 1)
            kl = (beeld[yi, xi] * (1 - fx) * (1 - fy) + beeld[yi, xi2] * fx * (1 - fy) + beeld[yi2, xi] * (1 - fx) * fy
                  + beeld[yi2, xi2] * fx * fy)
            uit[y, x, :3] = np.clip(kl, 0, 255)
            uit[y, x, 3] = 255
    Image.fromarray(uit).save(f'{map_}/verf-{naam}.png')
    print(f'{map_}/verf-{naam}.png')


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[2] == 'alle':
        for r, nummer in RICHTINGEN.items():
            buig(sys.argv[1], r, nummer)
    else:
        buig(sys.argv[1])
