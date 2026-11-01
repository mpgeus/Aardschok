# De rigtoets van Hunyuan3D-2mv als MP4 (APNG en GIF spelen bij Marcel niet af): dezelfde loopcyclus in klei en in verf, groot en op spelmaat. Alleen om de beweging te beoordelen.
#
#   python hy_film.py <uit.mp4> <map met klei/ en verf/> <beelden> <fps> [herhaal=5] [groot=verf:Z,verf:ZW] [houding=lopen]
import os
import sys

import av
import numpy as np
from PIL import Image, ImageDraw, ImageFont

GRIJS = (112, 111, 110)
UITVOER_FPS = 30
VAK = (160, 0, 480, 640)
CEL = (320, 640)
SPEL = 80 / (1.354 / 2.0 * 640)  # 640 pixels voor 2,0 m; de figuur wordt 80 pixels


def letter(g=17):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def main():
    uit, map_, n, fps = sys.argv[1], sys.argv[2], int(sys.argv[3]), float(sys.argv[4])
    arg = dict(a.split('=') for a in sys.argv[5:] if '=' in a)
    herhaal = int(arg.get('herhaal', 5))
    houding = arg.get('houding', 'lopen')
    groot = [tuple(x.split(':')) for x in arg['groot'].split(',')] if 'groot' in arg else [('klei', 'ZW'), ('verf', 'ZW'), ('verf', 'W')]
    klein = [('verf', r) for r in ('Z', 'ZW', 'W', 'N')]
    W = CEL[0] * len(groot) + 300
    H = CEL[1] + 30
    beelden = []
    for i in range(n):
        d = Image.new('RGB', (W, H), GRIJS)
        t = ImageDraw.Draw(d)
        for j, (m, r) in enumerate(groot):
            im = Image.open(os.path.join(map_, m, f'{houding}-{r}-{i:02d}.png')).convert('RGBA').crop(VAK)
            d.paste(im, (j * CEL[0], 30), im)
            t.text((j * CEL[0] + 8, 6), f'{m}, {r}', fill=(255, 255, 255), font=letter())
        t.text((CEL[0] * len(groot) + 8, 6), 'op spelmaat, 3x', fill=(255, 255, 255), font=letter())
        for j, (m, r) in enumerate(klein):
            im = Image.open(os.path.join(map_, m, f'{houding}-{r}-{i:02d}.png')).convert('RGBA')
            k = im.resize((round(im.width * SPEL), round(im.height * SPEL)), Image.LANCZOS)
            k = k.crop((k.width // 2 - 24, 0, k.width // 2 + 24, k.height)).resize((144, k.height * 3), Image.NEAREST)
            d.paste(k, (CEL[0] * len(groot) + 6 + (j % 2) * 146, 30 + (j // 2) * 315), k)
        beelden.append(np.asarray(d))
    c = av.open(uit, 'w')
    st = c.add_stream('libx264', rate=UITVOER_FPS)
    st.width, st.height = W - W % 2, H - H % 2
    st.pix_fmt = 'yuv420p'
    st.options = {'crf': '16'}
    per = max(1, round(UITVOER_FPS / fps))
    for _ in range(herhaal):
        for f in beelden:
            for _ in range(per):
                for p in st.encode(av.VideoFrame.from_ndarray(f[:st.height, :st.width], format='rgb24')):
                    c.mux(p)
    for p in st.encode():
        c.mux(p)
    c.close()
    print('KLAAR', uit, os.path.getsize(uit))


if __name__ == '__main__':
    main()
