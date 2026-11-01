# Een beoordelingsplaat (vraag 192): een rij renders groot, en eronder op spelmaat, 1:1 en 3x vergroot, op de kleur van het gras en
# naast de speerman van de stijlplaat. Beoordeel op spelmaat, niet alleen groot (skill modelleren).
#
#   python plaat.py <map> <uit.png> <houding> [beelden] [richtingen] [px=80] [ortho=3.0] [groot=320]   (de Python van ComfyUI)
import json
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
REF = os.path.join(HIER, '..', '..', '..', 'docs', 'art', 'referentie')
GRAS = (96, 136, 52)
PAPIER = (240, 232, 214)


def bijsnijden(im):
    """Op de figuur, met de vaste maat om het vak heen; alleen voor de plaat."""
    return im.crop(im.getbbox() or (0, 0, im.width, im.height))


def naar_spelmaat(im, ortho, px, lengte=None):
    """Verkleinen met de vaste schaal: lengte meter is px pixels (op de camera is hoogte z maal cos(elevatie))."""
    import math
    e = math.radians(INST['camera']['elevatie'])
    lengte = lengte or INST['spel']['lengte_meter']
    px_per_m = px / (lengte * math.cos(e) + 0.0)
    f = px_per_m * ortho / im.width
    w = max(1, round(im.width * f))
    return im.resize((w, w), Image.LANCZOS)


def hoofd():
    argv = sys.argv[1:]
    kaart, uit, houding = argv[0], argv[1], argv[2]
    o = {'px': 80, 'ortho': INST['camera']['ortho_meter'], 'groot': 320, 'beelden': 1, 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO'}
    for a in argv[3:]:
        k, v = a.split('=')
        o[k] = v
    px, ortho, groot, beelden = int(o['px']), float(o['ortho']), int(o['groot']), int(o['beelden'])
    richt = o['richtingen'].split(',')
    rijen = []
    for r in richt:
        for i in range(beelden):
            p = os.path.join(kaart, f'{houding}-{r}-{i:02d}.png')
            if os.path.exists(p):
                rijen.append((r, i, Image.open(p).convert('RGBA')))
    n = len(rijen)
    cel = groot
    vak = 3 * int(px * 1.6)
    breedte = max(cel, vak) * n
    plaat = Image.new('RGB', (breedte, cel + vak + 20), PAPIER)
    teken = ImageDraw.Draw(plaat)
    bw = max(cel, vak)
    for j, (r, i, im) in enumerate(rijen):
        g = bijsnijden(im)
        s = min(cel / g.width, (cel - 4) / g.height)
        g2 = g.resize((max(1, int(g.width * s)), max(1, int(g.height * s))), Image.LANCZOS)
        plaat.paste(g2, (j * bw + (bw - g2.width) // 2, cel - g2.height), g2)
        teken.text((j * bw + 4, 4), f'{r} {i}', fill=(60, 40, 20))
        k = naar_spelmaat(im, ortho, px)
        kb = bijsnijden(k)
        grond = Image.new('RGB', (vak, vak), GRAS)
        klein = kb.resize((kb.width * 3, kb.height * 3), Image.NEAREST)
        grond.paste(klein, ((vak - klein.width) // 2, vak - klein.height - 6), klein)
        plaat.paste(grond, (j * bw + (bw - vak) // 2, cel + 20))
        teken.text((j * bw + 4, cel + 4), f'{kb.width}x{kb.height} px, 3x', fill=(60, 40, 20))
    plaat.save(uit)
    print(uit, plaat.size)


if __name__ == '__main__':
    hoofd()
