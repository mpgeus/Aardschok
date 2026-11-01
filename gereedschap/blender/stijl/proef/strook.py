# Alle beelden van een loop naast elkaar, huidig boven nieuw, om flikkering en schuivende verf met het oog na te kijken; en de koppen van de acht richtingen groot, om te zien of het gezicht hetzelfde blijft.
#
#   python strook.py <uit-loop.png> <uit-koppen.png> <map nu lopen> <map nieuw lopen> <map nu hoog> <map nieuw hoog> [richting=ZW]
import json
import os
import sys

from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import vel as Vl  # noqa: E402

GRIJS = (110, 110, 108, 255)
RS = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')


def hoofd():
    uit1, uit2, nu, nw, nh, gh = sys.argv[1:7]
    r = sys.argv[7].split('=')[1] if len(sys.argv) > 7 else 'ZW'
    meta = json.load(open(os.path.join(nu, 'lopen-render.json'), encoding='utf-8'))
    s = Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))
    rijen = []
    for m in (nu, nw):
        rijen.append([Vl.sprite(os.path.join(m, f'lopen-{r}-{i:02d}.png'), s) for i in range(12)])
    bb = None
    for rij in rijen:
        for c in rij:
            b = c.getbbox()
            bb = b if bb is None else (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    V = 3
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    d = Image.new('RGBA', (w * V * 12, (h * V + 8) * 2), GRIJS)
    for j, rij in enumerate(rijen):
        for i, c in enumerate(rij):
            x = c.crop(bb).resize((w * V, h * V), Image.NEAREST)
            d.alpha_composite(x, (i * w * V, j * (h * V + 8)))
    d.convert('RGB').save(uit1)
    # de koppen
    H = 280
    d = Image.new('RGB', (H * 8, H * 2 + 8), GRIJS[:3])
    for j, m in enumerate((nh, gh)):
        meta = json.load(open(os.path.join(m, 'staan-render.json'), encoding='utf-8'))
        S = meta['pixels'] / meta['ortho']
        for i, q in enumerate(RS):
            im = Image.open(os.path.join(m, f'staan-{q}-00.png')).convert('RGBA')
            cx = meta['pixels'] // 2
            y0 = int(meta['pixels'] / 2 - 0.56 * S)
            c = im.crop((cx - int(0.34 * S), y0 - int(0.0 * S), cx + int(0.34 * S), y0 + int(0.68 * S)))
            bg = Image.new('RGBA', c.size, GRIJS)
            bg.alpha_composite(c)
            d.paste(bg.convert('RGB').resize((H, H), Image.LANCZOS), (i * H, j * (H + 8)))
    d.save(uit2)
    print(uit1, uit2)


if __name__ == '__main__':
    hoofd()
