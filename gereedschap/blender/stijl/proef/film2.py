# De beweging naast elkaar als MP4 (vraag 192, de methodeproef; APNG en GIF spelen bij Marcel niet af): dezelfde houding, timing en camera, de huidige render boven en de nieuwe
# eronder, per richting. Op spelmaat (met de afwerking van vel.py) en groot.
#
#   python film2.py <uit.mp4> <naam=map,naam=map> <houding> <beelden> <fps> [richtingen=Z,ZW,O,NO] [herhaal=5] [maat=spel|groot]
import json
import os
import sys

import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import vel as Vl  # noqa: E402

GRIJS = (110, 110, 108, 255)
UITVOER_FPS = 30


def letter(g=16):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def beeld(m, hd, r, i, s, maat):
    p = os.path.join(m, f'{hd}-{r}-{i:02d}.png')
    if maat == 'spel':
        c = Vl.sprite(p, s)
        return c
    im = Image.open(p).convert('RGBA')
    return im


def hoofd():
    uit = sys.argv[1]
    br = [x.split('=', 1) for x in sys.argv[2].split(',')]
    hd, n, fps = sys.argv[3], int(sys.argv[4]), float(sys.argv[5])
    o = {'richtingen': 'Z,ZW,O,NO', 'herhaal': '5', 'maat': 'spel'}
    for a in sys.argv[6:]:
        k, v = a.split('=')
        o[k] = v
    rs = o['richtingen'].split(',')
    maat = o['maat']
    rijen = []
    for naam, m in br:
        meta = json.load(open(os.path.join(m, f'{hd}-render.json'), encoding='utf-8'))
        s = Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))
        rijen.append((naam, {r: [beeld(m, hd, r, i, s, maat) for i in range(n)] for r in rs}))
    # één vak per richting, over alle bronnen, zodat de voeten niet verspringen
    vak = {}
    for r in rs:
        b = None
        for _, d in rijen:
            for c in d[r]:
                bb = c.getbbox()
                b = bb if b is None else (min(b[0], bb[0]), min(b[1], bb[1]), max(b[2], bb[2]), max(b[3], bb[3]))
        vak[r] = b
    V = 4 if maat == 'spel' else 1
    cellen = {r: ((vak[r][2] - vak[r][0]) * V + 16, (vak[r][3] - vak[r][1]) * V + 8) for r in rs}
    H = sum(max(cellen[r][1] for r in rs) + 26 for _ in rijen)
    W = sum(cellen[r][0] for r in rs)
    W += W % 2
    H += H % 2
    kader = []
    for i in range(n):
        d = Image.new('RGBA', (W, H), GRIJS)
        t = ImageDraw.Draw(d)
        y = 0
        for naam, bron in rijen:
            t.text((6, y + 3), naam, fill=(245, 245, 245, 255), font=letter())
            y += 26
            x = 0
            for r in rs:
                c = bron[r][i].crop(vak[r])
                if V > 1:
                    c = c.resize((c.width * V, c.height * V), Image.NEAREST)
                d.alpha_composite(c, (x + 8, y + 4))
                x += cellen[r][0]
            y += max(cellen[q][1] for q in rs)
        kader.append(np.asarray(d.convert('RGB')))
    herhaal = int(o['herhaal'])
    os.makedirs(os.path.dirname(uit), exist_ok=True)
    c = av.open(uit, 'w')
    st = c.add_stream('libx264', rate=UITVOER_FPS)
    st.width, st.height = W, H
    st.pix_fmt = 'yuv420p'
    st.options = {'crf': '14'}
    per = max(1, round(UITVOER_FPS / fps))
    for _ in range(herhaal):
        for f in kader:
            for _ in range(per):
                for p in st.encode(av.VideoFrame.from_ndarray(f, format='rgb24')):
                    c.mux(p)
    for p in st.encode():
        c.mux(p)
    c.close()
    print('KLAAR', uit, (W, H), flush=True)


if __name__ == '__main__':
    hoofd()
