# De plaat en beelden naast elkaar op dezelfde hoogte, op de grijze achtergrond van de plaat, om snel te kijken (vraag 192, de methodeproef).
#
#   python naast_plaat.py <uit.png> <hoogte> <naam>=<png> ... [vak=x0,y0,x1,y1 als deel van de figuur] [plaatvak=x0,y0,x1,y1]
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import oorzaak as O  # noqa: E402

GRIJS = (110, 110, 108, 255)


def letter(g=16):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def op_grijs(im):
    bg = Image.new('RGBA', im.size, GRIJS)
    bg.alpha_composite(im)
    return bg.convert('RGB')


def hoofd():
    uit = sys.argv[1]
    H = int(sys.argv[2])
    delen = []
    plaatvak = None
    for a in sys.argv[3:]:
        n, p = a.split('=', 1)
        if n == 'plaatvak':
            plaatvak = tuple(int(x) for x in p.split(','))
            continue
        delen.append((n, p))
    pl = Image.open(O.PLAAT).convert('RGB').crop(plaatvak or O.PLAAT_VAK)
    rij = [('plaat', pl.resize((round(pl.width * H / pl.height), H), Image.LANCZOS))]
    for n, p in delen:
        im = Image.open(p).convert('RGBA')
        c = op_grijs(im.crop(im.getbbox()))
        rij.append((n, c.resize((round(c.width * H / c.height), H), Image.LANCZOS)))
    W = sum(b.width for _, b in rij) + 8 * (len(rij) - 1)
    d = Image.new('RGB', (W, H + 24), (40, 40, 40))
    t = ImageDraw.Draw(d)
    x = 0
    for n, b in rij:
        d.paste(b, (x, 24))
        t.text((x + 4, 3), n, fill=(240, 240, 240), font=letter())
        x += b.width + 8
    d.save(uit)
    print(uit, d.size)


if __name__ == '__main__':
    hoofd()
