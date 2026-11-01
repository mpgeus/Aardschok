# De vergelijking van de methodeproef (vraag 192): de plaat, de huidige render en de methoden naast elkaar, zo gemaakt dat elke kolom dezelfde pose, camera, schaal en
# achtergrond heeft. Drie platen: heel groot, de details per onderdeel, en de spelmaat (80 pixels, met de echte afwerking uit vel.py).
#
#   python vergelijk.py <uitmap> <hoogmap: naam=map,...> <spelmap: naam=map,...> [richting=Z] [elevatie...]
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import oorzaak as O  # noqa: E402
import vel as Vl  # noqa: E402

GRIJS = (110, 110, 108, 255)
PLAAT = Image.open(O.PLAAT).convert('RGB')
# de stukken van de plaat voor de details: de grote aanzichten onderaan, en het zuidaanzicht waar die er niet zijn
PLAAT_DETAIL = {'helm': (20, 585, 150, 660), 'gezicht': (35, 645, 135, 715), 'tabberd': (1155, 590, 1305, 715), 'gambeson': (845, 590, 955, 715), 'handschoen': (1322, 585, 1420, 712), 'laarzen': (1532, 585, 1640, 712), 'speer': (30, 735, 280, 780)}
# dezelfde onderdelen in de hoge render: in meter, x in beeld en z op de figuur (richting Z)
DETAIL_M = {'helm': (-0.34, 0.98, 0.34, 1.46), 'gezicht': (-0.21, 0.80, 0.21, 1.12), 'tabberd': (-0.37, 0.26, 0.37, 0.97), 'gambeson': (0.20, 0.52, 0.62, 0.98), 'handschoen': (0.22, 0.10, 0.66, 0.60), 'laarzen': (-0.36, -0.24, 0.36, 0.28), 'speer': (-0.60, 1.05, -0.14, 1.88)}


def letter(g=15):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def op_grijs(im):
    bg = Image.new('RGBA', im.size, GRIJS)
    bg.alpha_composite(im.convert('RGBA'))
    return bg.convert('RGB')


def vak_px(m, meta):
    e = np.radians(float(meta['elevatie']))
    S = max(meta.get('b', meta['pixels']), meta.get('h', meta['pixels'])) / meta['ortho']
    b, h = meta.get('b', meta['pixels']), meta.get('h', meta['pixels'])
    x0, z0, x1, z1 = m
    dz = float(meta['doel_z'])
    return (int(b / 2 + x0 * S), int(h / 2 - (z1 - dz) * np.cos(e) * S), int(b / 2 + x1 * S), int(h / 2 - (z0 - dz) * np.cos(e) * S))


def heel(uit, kolommen, r, H=860):
    """De hele figuur, op dezelfde hoogte."""
    pl = PLAAT.crop(O.PLAAT_VAK)
    rij = [('plaat', pl.resize((round(pl.width * H / pl.height), H), Image.LANCZOS))]
    for n, m in kolommen:
        im = Image.open(os.path.join(m, f'staan-{r}-00.png')).convert('RGBA')
        c = op_grijs(im.crop(im.getbbox()))
        rij.append((n, c.resize((round(c.width * H / c.height), H), Image.LANCZOS)))
    W = sum(b.width for _, b in rij) + 8 * (len(rij) - 1)
    d = Image.new('RGB', (W, H + 26), (34, 34, 34))
    t = ImageDraw.Draw(d)
    x = 0
    for n, b in rij:
        d.paste(b, (x, 26))
        t.text((x + 5, 4), n, fill=(240, 240, 240), font=letter())
        x += b.width + 8
    d.save(os.path.join(uit, 'methoden-heel.png'))


def details(uit, kolommen, r, cel=210):
    delen = list(DETAIL_M)
    rijen = [('plaat', None)] + kolommen
    d = Image.new('RGB', (90 + (cel + 6) * len(delen), 24 + (cel + 6) * len(rijen)), (34, 34, 34))
    t = ImageDraw.Draw(d)
    for j, n in enumerate(delen):
        t.text((90 + j * (cel + 6) + 4, 4), n, fill=(240, 240, 240), font=letter())
    for i, (naam, m) in enumerate(rijen):
        y = 24 + i * (cel + 6)
        t.text((4, y + cel // 2 - 8), naam, fill=(240, 240, 240), font=letter(13))
        if m:
            meta = json.load(open(os.path.join(m, 'staan-render.json'), encoding='utf-8'))
            im = op_grijs(Image.open(os.path.join(m, f'staan-{r}-00.png')))
        for j, dl in enumerate(delen):
            if m:
                # een vak dat buiten de render valt, wordt grijs in plaats van zwart
                v = vak_px(DETAIL_M[dl], meta)
                c = Image.new('RGB', (v[2] - v[0], v[3] - v[1]), GRIJS[:3])
                c.paste(im.crop((max(v[0], 0), max(v[1], 0), min(v[2], im.width), min(v[3], im.height))), (max(-v[0], 0), max(-v[1], 0)))
            else:
                c = PLAAT.crop(PLAAT_DETAIL[dl])
            s = min(cel / c.width, cel / c.height)
            c = c.resize((max(1, round(c.width * s)), max(1, round(c.height * s))), Image.LANCZOS)
            d.paste(c, (90 + j * (cel + 6) + (cel - c.width) // 2, y + (cel - c.height) // 2))
    d.save(os.path.join(uit, 'methoden-details.png'))


def spelmaat(uit, kolommen, richtingen=('Z', 'ZW', 'O', 'N')):
    """80 pixels, met de afwerking van vel.py; per methode 1x en 4x. Links de plaat, verkleind met dezelfde BOX."""
    G = 4
    pl = PLAAT.crop(O.PLAAT_VAK)
    pl80 = pl.resize((round(pl.width * 104 / pl.height), 104), Image.BOX)
    cel_b, cel_h = 84, 116
    rijen = len(kolommen) + 1
    d = Image.new('RGB', (110 + len(richtingen) * (cel_b * G + 6) + len(richtingen) * (cel_b + 4), 24 + rijen * (cel_h * G + 8)), (110, 110, 108))
    t = ImageDraw.Draw(d)
    t.rectangle((0, 0, d.width, 20), fill=(34, 34, 34))
    y = 24
    t.text((4, y + 40), 'plaat', fill=(20, 20, 20), font=letter(13))
    d.paste(pl80.resize((pl80.width * G, pl80.height * G), Image.NEAREST), (110, y))
    d.paste(pl80, (110 + pl80.width * G + 12, y))
    t.text((110 + pl80.width * G + 12, y + pl80.height + 4), '(BOX, zonder afwerking)', fill=(20, 20, 20), font=letter(11))
    for i, (naam, m) in enumerate(kolommen):
        y = 24 + (i + 1) * (cel_h * G + 8)
        t.text((4, y + 40), naam, fill=(20, 20, 20), font=letter(13))
        meta = json.load(open(os.path.join(m, 'staan-render.json'), encoding='utf-8'))
        s = Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))
        x = 110
        for r in richtingen:
            sp = Vl.sprite(os.path.join(m, f'staan-{r}-00.png'), s)
            bb = sp.getbbox()
            c = sp.crop((bb[0] - 2, bb[3] - cel_h, bb[0] - 2 + cel_b, bb[3]))
            bg = Image.new('RGBA', c.size, GRIJS)
            bg.alpha_composite(c)
            bg = bg.convert('RGB')
            d.paste(bg.resize((bg.width * G, bg.height * G), Image.NEAREST), (x, y))
            d.paste(bg, (x + bg.width * G + 2, y + cel_h * G - cel_h))
            x += cel_b * G + cel_b + 10
    d.save(os.path.join(uit, 'methoden-80px.png'))


def lijst(a):
    return [tuple(x.split('=', 1)) for x in a.split(',')]


def hoofd():
    uit = sys.argv[1]
    hoog = lijst(sys.argv[2])
    spel = lijst(sys.argv[3])
    os.makedirs(uit, exist_ok=True)
    heel(uit, hoog, 'Z')
    details(uit, hoog, 'Z')
    spelmaat(uit, spel)
    print('KLAAR', uit)


if __name__ == '__main__':
    hoofd()
