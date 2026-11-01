# Het A/B-overzicht van de kwaliteitsronde (vraag 192): de plaat, de render vóór de ronde, de render erna en de sprites op spelmaat, alle acht
# richtingen onder elkaar; daaronder dezelfde close-ups voor en na.
#
#   python overzicht.py <map voor> <map na> <vellen na> <detail voor> <detail na> <uit-rijen.png> <uit-detail.png>     (de Python van ComfyUI)
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HIER, '..', '..', '..', 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
RICHT = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']
GRAS = (98, 138, 54)
GRIJS = (118, 116, 113)
DETAILS = [('Helm', 'hoofd-ZW'), ('Gezicht', 'hoofd-Z'), ('Tabberd', 'romp-Z'), ('Gambeson', 'hand-links'), ('Laarzen', 'laarzen-ZW')]


def rij(kaart, breed, hoog):
    uit = Image.new('RGB', (breed, hoog), GRIJS)
    cel = breed // 8
    for j, r in enumerate(RICHT):
        im = Image.open(os.path.join(kaart, f'staan-{r}-00.png')).convert('RGBA')
        c = im.crop(im.getbbox())
        s = (hoog - 16) / c.height
        c = c.resize((max(1, round(c.width * s)), hoog - 16), Image.LANCZOS)
        uit.paste(c, (j * cel + (cel - c.width) // 2, 8), c)
    return uit


def hoofd():
    voor, na, vel, dv, dn, uit1, uit2 = sys.argv[1:8]
    letter = ImageFont.load_default(size=22)
    ref = Image.open(REF).convert('RGB').crop((0, 15, 1774, 470))
    b = ref.width
    h = 455
    g = json.load(open(os.path.join(vel, 'speerman-staan.json'), encoding='utf-8'))
    vv = Image.open(os.path.join(vel, g['bestand']))
    cb, ch = g['cel']
    spel = Image.new('RGB', (b, ch * 3 + 16), GRAS)
    cel = b // 8
    for j in range(8):
        c = vv.crop((0, j * ch, cb, (j + 1) * ch)).resize((cb * 3, ch * 3), Image.NEAREST)
        spel.paste(c, (j * cel + (cel - c.width) // 2, 8), c)
    koppen = ['Rij 1: de plaat', 'Rij 2: de render voor de ronde', 'Rij 3: de render na de ronde', 'Rij 4: de sprites op spelmaat, 3x vergroot']
    delen = [ref, rij(voor, b, h), rij(na, b, h), spel]
    plaat = Image.new('RGB', (b, sum(p.height + 34 for p in delen)), (40, 40, 40))
    d = ImageDraw.Draw(plaat)
    y = 0
    for kop, p in zip(koppen, delen):
        d.text((10, y + 4), kop, fill=(255, 255, 255), font=letter)
        plaat.paste(p, (0, y + 34))
        y += p.height + 34
    plaat.save(uit1)
    # de close-ups
    t = 360
    plaat = Image.new('RGB', (t * len(DETAILS), t * 2 + 68), (40, 40, 40))
    d = ImageDraw.Draw(plaat)
    for i, (naam, f) in enumerate(DETAILS):
        d.text((i * t + 8, 6), naam, fill=(255, 255, 255), font=letter)
        for j, k in enumerate((dv, dn)):
            im = Image.open(os.path.join(k, f + '.png')).convert('RGBA')
            gr = Image.new('RGB', im.size, GRIJS)
            gr.paste(im, (0, 0), im)
            plaat.paste(gr.resize((t, t), Image.LANCZOS), (i * t, 34 + j * (t + 34)))
    d.text((8, 34 + t + 6), 'boven: voor de ronde, onder: erna', fill=(255, 255, 255), font=letter)
    plaat.save(uit2)
    print(uit1, uit2)


if __name__ == '__main__':
    hoofd()
