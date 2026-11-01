# De loop als MP4 (vraag 192; skill modelleren: APNG en GIF spelen bij Marcel niet af): 8, 12 en 24 beelden per cyclus naast elkaar, even
# lang, op spelmaat (3x vergroot) en groot. Zo is te zien of acht beelden genoeg zijn.
#
#   python film.py <rendermap met 24 beelden> <uit.mp4> [richting=ZW] [px=80] [cyclus=0.8] [herhaal=4]    (de Python van ComfyUI, met PyAV)
import json
import os
import sys

import av
import numpy as np
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import vel as Vel  # noqa: E402

GRAS = (98, 138, 54)
FPS = 30


def hoofd():
    kaart, uit = sys.argv[1:3]
    o = {'richting': 'ZW', 'px': '80', 'cyclus': '0.8', 'herhaal': '4'}
    for a in sys.argv[3:]:
        k, v = a.split('=')
        o[k] = v
    meta = json.load(open(os.path.join(kaart, 'lopen-render.json'), encoding='utf-8'))
    s = Vel.schaal_van(meta['pixels'], meta['ortho'], int(o['px']), meta.get('lengte'))
    beelden = meta['beelden']
    assert beelden == 24, 'de vergelijking vraagt een render van 24 beelden'
    sprites = [Vel.sprite(os.path.join(kaart, f"lopen-{o['richting']}-{i:02d}.png"), s) for i in range(beelden)]
    vak = None
    for c in sprites:
        b = c.getbbox()
        vak = b if vak is None else (min(vak[0], b[0]), min(vak[1], b[1]), max(vak[2], b[2]), max(vak[3], b[3]))
    sprites = [c.crop(vak) for c in sprites]
    w, h = sprites[0].size
    vergroot = 4
    cel_b, cel_h = w * vergroot + 20, h * vergroot + 44
    breedte = (cel_b * 3) // 2 * 2
    hoogte = (cel_h // 2) * 2
    aantal = int(float(o['cyclus']) * float(o['herhaal']) * FPS)
    met = av.open(uit, 'w')
    st = met.add_stream('libx264', rate=FPS)
    st.width, st.height = breedte, hoogte
    st.pix_fmt = 'yuv420p'
    for f in range(aantal):
        fase = (f / FPS / float(o['cyclus'])) % 1.0
        beeld = Image.new('RGB', (breedte, hoogte), GRAS)
        d = ImageDraw.Draw(beeld)
        for k, n in enumerate((8, 12, 24)):
            i = int(fase * n) % n
            c = sprites[i * (24 // n)].resize((w * vergroot, h * vergroot), Image.NEAREST)
            beeld.paste(c, (k * cel_b + 10, 34), c)
            d.text((k * cel_b + 12, 8), f'{n} beelden ({n / float(o["cyclus"]):.0f} per seconde)', fill=(255, 255, 255))
        kader = av.VideoFrame.from_ndarray(np.asarray(beeld), format='rgb24')
        for p in st.encode(kader):
            met.mux(p)
    for p in st.encode():
        met.mux(p)
    met.close()
    print('KLAAR', uit, breedte, hoogte, aantal)


if __name__ == '__main__':
    hoofd()
