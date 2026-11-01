# Het stijlblad (vraag 192, de methodeproef): per materiaalsoort het kleurverloop van diepe schaduw naar hoogste licht, zoals de stijl het toepast, naast de waarden. Zo is de stijl te zien
# zonder de code te lezen. Elke nieuwe eenheid gebruikt dezelfde soorten.
#
#   python stijlblad.py <uit.png> <uit.json>
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import verlicht as Vt  # noqa: E402

NAMEN = ('diepe schaduw', 'schaduw', 'midden', 'licht', 'hoogste licht')


def hexv(L, C, h):
    lb = np.array([[L, C * np.cos(np.radians(h)), C * np.sin(np.radians(h))]], dtype=np.float32)
    c = Vt.srgb(np.clip(Vt.lab_lin(lb), 0, 1))[0]
    return tuple(int(x * 255 + 0.5) for x in c)


def hoofd():
    uit, uitj = sys.argv[1:3]
    r = json.load(open(os.path.join(HIER, 'ramps-d.json'), encoding='utf-8'))['soorten']
    f = ImageFont.truetype('arial.ttf', 16)
    k = ImageFont.truetype('arial.ttf', 13)
    d = Image.new('RGB', (140 + 5 * 130, 34 + 62 * len(r)), (40, 40, 40))
    t = ImageDraw.Draw(d)
    for j, n in enumerate(NAMEN):
        t.text((140 + j * 130 + 6, 8), n, fill=(240, 240, 240), font=k)
    res = {}
    for i, (naam, v) in enumerate(r.items()):
        y = 34 + i * 62
        t.text((8, y + 18), naam, fill=(240, 240, 240), font=f)
        res[naam] = []
        for j in range(5):
            c = hexv(v['L'][j], v['C'][j], v['h'][j])
            t.rectangle((140 + j * 130, y, 140 + j * 130 + 126, y + 58), fill=c)
            h = '#%02x%02x%02x' % c
            t.text((140 + j * 130 + 6, y + 40), f"{h}  L{v['L'][j]:.0f}", fill=(255, 255, 255) if v['L'][j] < 55 else (20, 20, 20), font=k)
            res[naam].append({'stap': NAMEN[j], 'hex': h, 'L': v['L'][j], 'C': v['C'][j], 'tint': v['h'][j]})
    d.save(uit)
    with open(uitj, 'w', encoding='utf-8') as fh:
        json.dump(res, fh, indent=1)
    print(uit, d.size)


if __name__ == '__main__':
    hoofd()
