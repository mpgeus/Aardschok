# De renderresolutie onderzocht (vraag 192, de kwaliteitsronde): dezelfde figuur rechtstreeks op 128, 256 en 512 pixels, en vanuit een interne
# render van 1536 verkleind naar diezelfde maten, naast elkaar. Daarna de sprite van 80 pixels uit verschillende bronnen, met maten voor scherpte,
# rust tussen de beelden en het anker. Het vak is overal hetzelfde: de hele figuur met speer in 3 meter.
#
#   blender.exe -b <figuur.blend> -P render.py -- <map>/r<maat> staan richtingen=Z,ZW pixels=<maat> monsters=64 speerkijkt     (per maat)
#   python resolutie.py <map> <uit.png> <uit.json>      (de Python van ComfyUI)
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import vel as Vel  # noqa: E402

GRAS = (98, 138, 54)
MATEN = (128, 256, 512)


def scherpte(rgb, m):
    """Hoeveel randen er zijn: de standaardafwijking van de tweede afgeleide, binnen de figuur."""
    g = rgb @ np.array([0.3, 0.59, 0.11], dtype=np.float32)
    lap = 4 * g[1:-1, 1:-1] - g[:-2, 1:-1] - g[2:, 1:-1] - g[1:-1, :-2] - g[1:-1, 2:]
    return float(lap[m[1:-1, 1:-1]].std())


def vierkant(im, maat):
    """Verkleinen met het vak erin: zo blijft de voet op dezelfde plek."""
    return im.resize((maat, maat), Image.BOX)


def hoofd():
    kaart, uit, js = sys.argv[1:4]
    letter = ImageFont.load_default(size=20)
    bron = Image.open(os.path.join(kaart, 'r1536', 'staan-Z-00.png')).convert('RGBA')
    # uitsnede: de figuur zonder de lege hoeken, zelfde verhouding voor elke maat
    x0, y0, x1, y1 = 0.30, 0.18, 0.72, 0.96
    cel = 360
    plaat = Image.new('RGB', (cel * len(MATEN) + 90, cel * 2 + 40), (70, 70, 70))
    d = ImageDraw.Draw(plaat)
    res = {}
    for j, (naam, maak) in enumerate((('rechtstreeks', lambda m: Image.open(os.path.join(kaart, f'r{m}', 'staan-Z-00.png')).convert('RGBA')),
                                      ('uit 1536', lambda m: vierkant(bron, m)))):
        d.text((4, 60 + j * cel), naam, fill=(255, 255, 255), font=letter)
        for i, m in enumerate(MATEN):
            im = maak(m)
            a = np.asarray(im, dtype=np.float32)
            mask = a[..., 3] > 128
            res[f'{naam} {m}'] = {'scherpte': round(scherpte(a[..., :3], mask), 2), 'randpixels': round(float(((a[..., 3] > 10) & (a[..., 3] < 245)).sum() / max(mask.sum(), 1)), 3)}
            bx = (int(x0 * m), int(y0 * m), int(x1 * m), int(y1 * m))
            c = im.crop(bx)
            s = cel / max(c.size)
            c2 = c.resize((int(c.width * s), int(c.height * s)), Image.NEAREST)
            g = Image.new('RGB', (cel, cel), GRAS)
            g.paste(c2, ((cel - c2.width) // 2, cel - c2.height), c2)
            plaat.paste(g, (90 + i * cel, 34 + j * cel))
            if j == 0:
                d.text((90 + i * cel + 6, 6), f'{m} x {m}', fill=(255, 255, 255), font=letter)
    plaat.save(uit)
    # de sprite op spelmaat, uit elke bron
    Vel.INST['camera']['elevatie'] = 30.0
    sprites = {}
    for m in (256, 512, 768, 1536):
        p = os.path.join(kaart, f'r{m}', 'staan-Z-00.png')
        if not os.path.exists(p):
            continue
        s = Vel.schaal_van(m, 3.0, 80, 1.3977)
        rgb, al = Vel._kleiner(Image.open(p).convert('RGBA'), max(1, round(m * s)))
        mask = al >= 110 / 255.0
        sprites[f'80 px uit {m}'] = {'scherpte': round(scherpte((rgb * 255).astype(np.float32), mask), 2)}
    res.update(sprites)
    with open(js, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    for k, v in res.items():
        print(k, v)


if __name__ == '__main__':
    hoofd()
