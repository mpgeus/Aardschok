# Het overzicht van de acht richtingen voor de methodeproef (vraag 192): de plaat, de huidige render, de nieuwe render, en de sprites op spelmaat van allebei.
#
#   python overzicht2.py <uit.png> <map nu groot> <map nieuw groot> <vellen nu> <vellen nieuw>
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import overzicht as Oz  # noqa: E402

GRIJS = (110, 110, 108)


def spelrij(vel, b):
    g = json.load(open(os.path.join(vel, 'speerman-staan.json'), encoding='utf-8'))
    vv = Image.open(os.path.join(vel, g['bestand']))
    cb, ch = g['cel']
    uit = Image.new('RGB', (b, ch * 3 + 16), GRIJS)
    cel = b // 8
    for j in range(8):
        c = vv.crop((0, j * ch, cb, (j + 1) * ch)).resize((cb * 3, ch * 3), Image.NEAREST)
        uit.paste(c, (j * cel + (cel - c.width) // 2, 8), c)
    return uit


def hoofd():
    uit, nu, nieuw, vnu, vnieuw = sys.argv[1:6]
    letter = ImageFont.truetype('arial.ttf', 22)
    ref = Image.open(Oz.REF).convert('RGB').crop((0, 15, 1774, 470))
    b, h = ref.width, 455
    koppen = ['Rij 1: de plaat', 'Rij 2: de huidige render', 'Rij 3: de nieuwe render', 'Rij 4: de huidige sprites op spelmaat, 3x vergroot', 'Rij 5: de nieuwe sprites op spelmaat, 3x vergroot']
    delen = [ref, Oz.rij(nu, b, h), Oz.rij(nieuw, b, h), spelrij(vnu, b), spelrij(vnieuw, b)]
    plaat = Image.new('RGB', (b, sum(p.height + 34 for p in delen)), (40, 40, 40))
    d = ImageDraw.Draw(plaat)
    y = 0
    for kop, p in zip(koppen, delen):
        d.text((10, y + 4), kop, fill=(255, 255, 255), font=letter)
        plaat.paste(p, (0, y + 34))
        y += p.height + 34
    plaat.save(uit)
    print(uit, plaat.size)


if __name__ == '__main__':
    hoofd()
