# De bladen van ronde 9: de HumGen-man naast de procedurele basismens, uit beelden.py (dezelfde camera, licht en schaal,
# in klei), en op spelmaat (74 pixels hoog met voeten, het lijf 72: basismens/ronde8.sprite, de gewone verkleining).
#
#   python gereedschap/blender/humgen/bladen.py
# leest <uit>/humgen/beelden en <uit>/humgen/oud, schrijft de bladen in <uit>/humgen/bladen.
import json
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import blad  # noqa: E402
import ronde8  # noqa: E402

INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
UIT = os.path.join(os.path.abspath(os.path.join(HIER, '..', '..', '..')), INST['uit'])
NIEUW, OUD = os.path.join(UIT, 'beelden'), os.path.join(UIT, 'oud')
BLAD = os.path.join(UIT, 'bladen')
ACHTER = (150, 145, 138, 255)
RICHT = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']


def raster(rijen, titels, kop, pad, h=300):
    """Rijen beelden (elk op hoogte h, op de grijze achtergrond van de bladen), met een titel per rij en per kolom."""
    lt, lk = blad.letter(18), blad.letter(14)
    ims = [[Image.open(p).convert('RGBA') if os.path.exists(p) else Image.new('RGBA', (10, 10)) for p in rij] for rij in rijen]
    ims = [[im.resize((round(im.width * h / im.height), h), Image.LANCZOS) for im in rij] for rij in ims]
    b = max(sum(im.width + 6 for im in rij) for rij in ims) + 170
    B = Image.new('RGB', (b, len(ims) * (h + 8) + 34), (34, 32, 30))
    d = ImageDraw.Draw(B)
    x = 164
    for j, t in enumerate(kop):
        d.text((x + 4 + j * (ims[0][0].width + 6), 8), t, font=lk, fill=(235, 230, 222))
    for i, (rij, titel) in enumerate(zip(ims, titels)):
        y = 30 + i * (h + 8)
        d.text((8, y + h // 2 - 10), titel, font=lt, fill=(240, 236, 228))
        x = 164
        for im in rij:
            vak = Image.new('RGBA', im.size, ACHTER)
            vak.alpha_composite(im)
            B.paste(vak.convert('RGB'), (x, y))
            x += im.width + 6
    os.makedirs(BLAD, exist_ok=True)
    B.save(pad)


def main():
    raster([[os.path.join(NIEUW, 'huid', f'richting-{r}.png') for r in RICHT],
            [os.path.join(NIEUW, 'klei', f'richting-{r}.png') for r in RICHT],
            [os.path.join(OUD, 'klei', f'richting-{r}.png') for r in RICHT]],
           ['HumGen, huid', 'HumGen, klei', 'oud, klei'], RICHT, os.path.join(BLAD, '01-acht-richtingen.png'), 320)
    kanten = ['voor', 'driekwart', 'opzij', 'achter']
    raster([[os.path.join(OUD, 'aanzicht', f'{k}.png') for k in kanten], [os.path.join(NIEUW, 'aanzicht', f'{k}.png') for k in kanten]],
           ['oud', 'HumGen'], kanten, os.path.join(BLAD, '02-oud-nieuw-aanzichten.png'), 560)
    stukken = ['gezicht-voor', 'gezicht-schuin', 'hand-opzij', 'hand-voor', 'voeten']
    raster([[os.path.join(OUD, 'stuk', f'{k}.png') for k in stukken], [os.path.join(NIEUW, 'stuk', f'{k}.png') for k in stukken]],
           ['oud', 'HumGen'], stukken, os.path.join(BLAD, '03-close-ups.png'), 340)
    buig = ['schouder-opzij', 'schouder-voor', 'elleboog', 'heup', 'knie']
    raster([[os.path.join(OUD, 'buig', f'{k}.png') for k in buig], [os.path.join(NIEUW, 'buig', f'{k}.png') for k in buig]],
           ['oud', 'HumGen'], buig, os.path.join(BLAD, '04-buigtest.png'), 300)
    # op spelmaat: de gewone verkleining naar een lijf van 72 pixels, 1x en 4x
    paren = [('oud, klei', os.path.join(OUD, 'klei', 'richting-ZW.png')), ('HumGen, klei', os.path.join(NIEUW, 'klei', 'richting-ZW.png')),
             ('HumGen, huid', os.path.join(NIEUW, 'huid', 'richting-ZW.png'))]
    ims = []
    for naam, p in paren:
        uit = os.path.join(BLAD, 'sprite-' + naam.replace(', ', '-').replace(' ', '') + '.png')
        ronde8.sprite(p, uit, 72)
        ims.append((naam, Image.open(uit).convert('RGBA')))
    lt = blad.letter(16)
    B = Image.new('RGB', (len(ims) * 300 + 10, 470), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for i, (naam, im) in enumerate(ims):
        x = 10 + i * 300
        d.text((x, 8), naam, font=lt, fill=(240, 236, 228))
        vak = Image.new('RGBA', (290, 430), ACHTER)
        vak.alpha_composite(im, (10, 430 - im.height - 10))
        g = im.resize((im.width * 4, im.height * 4), Image.NEAREST)
        vak.alpha_composite(g, (min(290 - g.width, 80), max(0, 430 - g.height - 10)))
        B.paste(vak.convert('RGB'), (x, 32))
    B.save(os.path.join(BLAD, '05-spelmaat-74px.png'))
    print('BLADEN', sorted(os.listdir(BLAD)))


if __name__ == '__main__':
    main()
