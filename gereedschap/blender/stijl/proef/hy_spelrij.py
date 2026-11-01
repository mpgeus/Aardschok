# Hunyuan3D-2mv: op spelmaat naast elkaar: de plaat, V4 en de vellen uit de proef, in acht richtingen, drie keer vergroot, met de voetlijn zoals in het spel. Hier moet het overtuigen.
#
#   python hy_spelrij.py <uit.png> <naam=map met vellen/> [...]
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, hy_invoer as HI, platen4 as P4
from PIL import Image, ImageDraw
R = os.path.join(P4.S, '')
rs = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
Z_ = 3
bronnen = [('V4', R + 'vormproef4/eind/vellen/')] + [(a.split('=')[0], a.split('=')[1]) for a in sys.argv[2:]]
H = 118
rijen = []
# de plaat op spelmaat
HI.kies('vrij')
d = Image.new('RGB', (8 * 78 * Z_, H * Z_), (84, 120, 60))
for i, r in enumerate(rs):
    rgba, m = HI.vrijstaand(r)
    romp = P4.dun_weg(m)
    ys = np.nonzero(romp.any(1))[0]
    s = 80.0 / (ys.max() - ys.min() + 1)
    im = Image.fromarray(rgba)
    k = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS).resize((max(1, round(im.width * s)) * Z_, max(1, round(im.height * s)) * Z_), Image.NEAREST)
    x = round((i * 78 + 39) * Z_ - HI.as_x(m) * s * Z_)
    y = round((H - 6) * Z_ - (ys.max() + 1) * s * Z_)
    d.paste(k, (x, y), k)
rijen.append(('plaat acht', d))
for naam, m in bronnen:
    g = json.load(open(m + 'speerman-staan.json'))
    v = Image.open(m + 'speerman-staan.png').convert('RGBA')
    cw, ch = g['cel']
    ax, ay = g['anker']
    d = Image.new('RGB', (8 * 78 * Z_, H * Z_), (84, 120, 60))
    for i, r in enumerate(rs):
        c = v.crop((0, i * ch, cw, (i + 1) * ch)).resize((cw * Z_, ch * Z_), Image.NEAREST)
        d.paste(c, (round((i * 78 + 39) * Z_ - ax * Z_), round((H - 6) * Z_ - ay * Z_)), c)
    rijen.append((naam, d))
b = Image.new('RGB', (rijen[0][1].width, sum(x.height + 4 for _, x in rijen)), (0, 0, 0))
t = ImageDraw.Draw(b)
y = 0
for naam, x in rijen:
    b.paste(x, (0, y))
    t.text((6, y + 4), naam, fill=(255, 255, 255))
    y += x.height + 4
b.save(sys.argv[1])
print(b.size)
