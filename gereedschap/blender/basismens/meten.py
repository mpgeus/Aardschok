# De soldaat tegen de speerman op spelmaat (Marcel, 29 okt, ronde 4: "Gebruik de bestaande speerman als doelreferentie.
# Meet de verschillen op spelgrootte"). Uit de silhouetten op spelmaat, per richting, zonder de speer (de dunne lopen,
# hooguit 3 pixels breed, gaan eruit; ook het blad boven het hoofd): de hoogte van voet tot helm, en als deel daarvan
# de breedte van de helm, over de schouders en armen, van de romp, van de laarzen onderaan, en de hoogte van de zoom van
# de tabberd (het laagste geel) en van de laarzen (het hoogste bruin onderaan). Met PIL en numpy, zoals blad.py.
#
#   python gereedschap/blender/basismens/meten.py
# de soldaat en elke variant die er is (<uit>/<variant>/soldaat/spelmaat), naar <uit>/maten.json, en per figuur een
# regel op het scherm.
import json
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import blad  # noqa: E402
import variant  # noqa: E402

INST, WORTEL, NAMEN = blad.INST, blad.WORTEL, blad.NAMEN
MATEN = ('hoogte', 'helm', 'schouders', 'romp', 'laarzen', 'zoom', 'laars_hoog')


def masker(cel):
    """Wat van de figuur is (doorzichtigheid op de helft), zonder de speer: de lopen van hooguit 3 pixels breed in de
    kolommen waar zo'n dunne loop over meer dan 20 rijen gaat (de schacht; een dun been is korter), en dan alleen het
    grootste stuk (het blad staat los)."""
    a = np.asarray(cel.convert('RGBA')).astype(np.int32)
    m = a[:, :, 3] >= 128
    dun = np.zeros_like(m)
    for y in range(m.shape[0]):
        x = 0
        while x < m.shape[1]:
            if not m[y, x]:
                x += 1
                continue
            b = x
            while x < m.shape[1] and m[y, x]:
                x += 1
            if x - b <= 3:
                dun[y, b:x] = True
    uit = m & ~(dun & (dun.sum(axis=0) > 20)[None, :])
    # het blad van de speer is soms breder dan 3, maar staat los van de rest: alleen het grootste stuk blijft
    return grootste(uit), a


def grootste(m):
    """Het grootste samenhangende stuk van een masker (vier buren)."""
    gezien = np.zeros_like(m)
    beste = []
    for y0, x0 in zip(*np.nonzero(m)):
        if gezien[y0, x0]:
            continue
        stuk, rij = [], [(y0, x0)]
        gezien[y0, x0] = True
        while rij:
            y, x = rij.pop()
            stuk.append((y, x))
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < m.shape[0] and 0 <= xx < m.shape[1] and m[yy, xx] and not gezien[yy, xx]:
                    gezien[yy, xx] = True
                    rij.append((yy, xx))
        if len(stuk) > len(beste):
            beste = stuk
    uit = np.zeros_like(m)
    for y, x in beste:
        uit[y, x] = True
    return uit


def lopen_van(rij):
    """De lopen in een rij, als (begin, eind)."""
    xs = np.nonzero(np.diff(np.concatenate([[0], rij.astype(np.int8), [0]])))[0]
    return list(zip(xs[::2], xs[1::2]))


def lopen(rij):
    xs = np.nonzero(rij)[0]
    return (int(xs.max() - xs.min() + 1)) if len(xs) else 0


def maten(cel):
    """De maten van een figuur op spelmaat, in pixels en als deel van de hoogte."""
    m, a = masker(cel)
    ys = np.nonzero(m.any(axis=1))[0]
    top, voet = int(ys.min()), int(ys.max())
    H = voet - top + 1
    rij = lambda f: top + int(round(f * H))
    breed = lambda f0, f1: max(lopen(m[y]) for y in range(rij(f0), rij(f1)))
    r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    bruin = (r > g + 12) & (g > b) & (r < 190) & (b < 110) & m
    # de zoom (van voren en achteren): van onderaan omhoog zolang er tussen de benen licht is
    y = voet
    while y > top and len(lopen_van(m[y])) >= 2 and len(lopen_van(m[y - 1])) >= 2:
        y -= 1
    zoom = (voet - y) / H
    # de laars: van onderaan omhoog zolang de helft van de rij bruin is
    y = voet
    while y > top and bruin[y].sum() >= 0.5 * max(1, m[y].sum()):
        y -= 1
    # de helm: het staal (grijs, licht) in het bovenste derde
    staal = (a[:, :, :3].max(axis=2) - a[:, :, :3].min(axis=2) < 32) & (a[:, :, :3].max(axis=2) > 100) & m
    staal[rij(0.33):] = False
    _, sx = np.nonzero(staal)
    return {'hoogte': H, 'helm': (sx.max() - sx.min() + 1) / H, 'schouders': breed(0.2, 0.4) / H, 'romp': breed(0.4, 0.55) / H,
            'laarzen': breed(0.94, 1.0) / H, 'zoom': zoom, 'laars_hoog': (voet - y) / H}


def speerman():
    import soldaat_blad as SB
    cellen, _ = SB.speerman()
    return cellen


def figuur(uit):
    return {n: Image.open(os.path.join(uit, 'soldaat', 'spelmaat', f'richting-{n}.png')) for n in NAMEN}


def tabel(cellen):
    per = {n: maten(c) for n, c in cellen.items()}
    # alleen de vier richtingen waarin de speer recht omhoog staat, los van het lijf: in de schuine raakt hij de helm
    gem = {k: round(float(np.mean([per[n][k] for n in ('Z', 'N')])), 3) for k in MATEN}
    zij = {k: round(float(np.mean([per[n][k] for n in ('W', 'O')])), 3) for k in MATEN if k != 'zoom'}
    return {'voor': gem, 'zij': zij, 'per_richting': {n: {k: round(v, 3) for k, v in x.items()} for n, x in per.items()}}


def main():
    mappen = {'soldaat': variant.UIT_BASIS}
    for n in variant.BASIS['varianten']:
        if os.path.exists(os.path.join(variant.UIT_BASIS, n, 'soldaat', 'spelmaat')):
            mappen[n] = os.path.join(variant.UIT_BASIS, n)
    namen = list(mappen)
    uit = {'speerman': tabel(speerman())}
    for n in namen:
        uit[n] = tabel(figuur(mappen[n]))
    ref = uit['speerman']
    for n in namen:
        uit[n]['verschil'] = {kant: {k: round(uit[n][kant][k] / ref[kant][k] - 1, 3) for k in ref[kant] if ref[kant][k]}
                              for kant in ('voor', 'zij')}
    json.dump(uit, open(os.path.join(variant.UIT_BASIS, 'maten.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    for n, t in uit.items():
        print(n.ljust(10), 'voor', t['voor'], '\n'.ljust(12), 'zij ', t['zij'])


if __name__ == '__main__':
    main()
