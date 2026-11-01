# De render naast de plaat met de acht richtingen (vraag 192): dezelfde volgorde en grootte, en daaronder op spelmaat. Zo is het
# oordeel steeds hetzelfde.
#
#   python naast.py <rendermap> <uit.png> <houding> [vel=<map met het vel>]    (de Python van ComfyUI)
import json
import os
import sys

from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HIER, '..', '..', '..', 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
RICHT = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']
GRAS = (96, 136, 52)
GRIJS = (127, 123, 119)


def hoofd():
    kaart, uit, houding = sys.argv[1:4]
    vel = next((a[4:] for a in sys.argv[4:] if a.startswith('vel=')), None)
    ref = Image.open(REF).convert('RGB')
    ref = ref.crop((0, 15, ref.width, 495))
    cel_b = ref.width // 8
    rij = Image.new('RGB', (ref.width, 480), GRIJS)
    for j, r in enumerate(RICHT):
        im = Image.open(os.path.join(kaart, f'{houding}-{r}-00.png')).convert('RGBA')
        bb = im.getbbox()
        im = im.crop(bb)
        s = 460 / im.height
        im = im.resize((round(im.width * s), 460), Image.LANCZOS)
        rij.paste(im, (j * cel_b + (cel_b - im.width) // 2, 470 - im.height), im)
    onder = 0
    spel = None
    if vel:
        g = json.load(open(os.path.join(vel, f'speerman-{houding}.json'), encoding='utf-8'))
        v = Image.open(os.path.join(vel, g['bestand']))
        cb, ch = g['cel']
        spel = Image.new('RGB', (ref.width, ch * 3 + 8), GRAS)
        for j in range(8):
            c = v.crop((0, j * ch, cb, (j + 1) * ch)).resize((cb * 3, ch * 3), Image.NEAREST)
            spel.paste(c, (j * cel_b + (cel_b - c.width) // 2, 4), c)
        onder = spel.height
    plaat = Image.new('RGB', (ref.width, 480 + 480 + onder), GRIJS)
    plaat.paste(ref, (0, 0))
    plaat.paste(rij, (0, 480))
    if spel:
        plaat.paste(spel, (0, 960))
    plaat.save(uit)
    print(uit, plaat.size)


if __name__ == '__main__':
    hoofd()
