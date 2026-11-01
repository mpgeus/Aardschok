# De camerahoek van een plaat aflezen: de helmen vergroot, met een liniaal in plaatpixels. De rand is een cirkel, dus (laagste punt op de as - lijn tussen de punten) / halve breedte is de sinus van de hoek. Een automatische meting was niet betrouwbaar.
#
#   python hy_helmen.py <uit.png>
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, hy_invoer as HI, platen4 as P4
from PIL import Image, ImageDraw
Z = 3
d = Image.new('RGB', (4 * 480, 3 * 340), (20, 20, 20))
t = ImageDraw.Draw(d)
for j, p in enumerate(('detail', 'acht', 'draai')):
    HI.kies(p)
    for i, r in enumerate('ZNWO'):
        rgba, m = HI.vrijstaand(r)
        romp = P4.dun_weg(m)
        ys = np.nonzero(romp.any(1))[0]
        x = int(HI.as_x(m))
        y0 = ys.min()
        vak = (max(x - 78, 0), y0 - 6, x + 78, y0 + 100)
        c = Image.fromarray(rgba[..., :3]).crop(vak).resize(((vak[2] - vak[0]) * Z, (vak[3] - vak[1]) * Z), Image.LANCZOS)
        ox, oy = i * 480 + 2, j * 340 + 12
        d.paste(c, (ox, oy))
        for k in range(0, 106, 10):
            yy = oy + k * Z
            t.line([(ox, yy), (ox + 10, yy)], fill=(255, 255, 0))
            t.text((ox + 12, yy - 5), str(k), fill=(255, 255, 0))
        t.line([(ox + (x - vak[0]) * Z, oy), (ox + (x - vak[0]) * Z, oy + 318)], fill=(0, 255, 255))
        t.text((ox + 40, oy - 11), f'{p} {r}', fill=(255, 255, 255))
d.save(sys.argv[1])
