# De camerahoeken vergeleken (vraag 192): dezelfde figuur op elke hoek in vier richtingen, op spelmaat op een tegel van het spel, zodat
# je ziet welke hoek bij de wereld past. De ruit is een tegel van 64 bij 32 uit het spel: die vaste verhouding 2:1 hoort bij 30 graden.
#
#   python elevatie.py <map met submappen e<hoek>> <uit.png> <hoek> ...      (de Python van ComfyUI)
import math
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import vel as Vel  # noqa: E402

RICHT = ['Z', 'ZW', 'N', 'O']
GRAS = (98, 138, 54)
LIJN = (78, 112, 42)


def hoofd():
    kaart, uit, *hoeken = sys.argv[1:]
    px, cel = 80, 150
    rijen = []
    for h in hoeken:
        e = float(h)
        Vel.INST['camera']['elevatie'] = e
        # dezelfde pixels per meter in de wereld, ongeacht de hoek: anders vergelijk je ook de grootte
        rij = Image.new('RGB', (cel * len(RICHT), cel), GRAS)
        d = ImageDraw.Draw(rij)
        s = 0.0
        for j, r in enumerate(RICHT):
            pad = os.path.join(kaart, f'e{h}', f'staan-{r}-00.png')
            Vel.INST['camera']['elevatie'] = 30.0
            schaal = Vel.schaal_van(768, 3.0, px)
            Vel.INST['camera']['elevatie'] = e
            sp = Vel.sprite(pad, schaal)
            bb = sp.getbbox()
            sp = sp.crop(bb)
            # de voet op een ruit: een tegel op deze hoek
            mx, my = j * cel + cel // 2, cel - 22
            th = 32 * math.sin(math.radians(e)) / 0.5
            d.polygon([(mx - 32, my), (mx, my - th / 2), (mx + 32, my), (mx, my + th / 2)], outline=LIJN)
            rij.paste(sp, (mx - sp.width // 2, my + 4 - sp.height), sp)
        rijen.append((h, rij))
    plaat = Image.new('RGB', (cel * len(RICHT) * 3, (cel * 3 + 26) * len(rijen)), (240, 232, 214))
    d = ImageDraw.Draw(plaat)
    for i, (h, rij) in enumerate(rijen):
        d.text((6, i * (cel * 3 + 26) + 6), f'elevatie {h} graden', fill=(50, 30, 15))
        plaat.paste(rij.resize((rij.width * 3, rij.height * 3), Image.NEAREST), (0, i * (cel * 3 + 26) + 24))
    plaat.save(uit)
    print(uit, plaat.size)


if __name__ == '__main__':
    hoofd()
