# De invoer voor de AI-laag (vraag 192, de methodeproef, methode C): per aanzicht de render op de grijze achtergrond van de plaat, ons silhouet als masker, de
# diepte en de lijnen uit de geometrie. De diepte krijgt in alle aanzichten hetzelfde bereik, zodat de AI overal dezelfde vorm ziet.
#
#   python ai_invoer.py <gbmap> <rendermap> <uitmap> <houding> [plaatvak]
import glob
import json
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ni

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import exr  # noqa: E402

GRIJS = np.array([110, 110, 108], dtype=np.float32) / 255.0


def hoofd():
    gb, rmap, uit, hd = sys.argv[1:5]
    os.makedirs(uit, exist_ok=True)
    for p in sorted(glob.glob(os.path.join(gb, f'{hd}-*.exr'))):
        naam = os.path.basename(p)[:-4]
        d = exr.passes(p)
        al = np.clip(d['alfa'], 0, 1)
        m = al > 0.5
        zz = d['Depth']
        zm = np.where(m, zz, np.nan)
        # een vast bereik rond het doel van de camera: 20 m ver, de figuur ligt binnen 0,75 m daaromheen
        z = np.where(m, np.clip(1.0 - (zm - 19.25) / 1.5, 0.08, 1.0), 0.0)
        Image.fromarray((np.nan_to_num(z) * 255).astype(np.uint8)).convert('RGB').save(os.path.join(uit, f'{naam}-diepte.png'))
        # lijnen: waar de normaal of de diepte verspringt, wit op zwart
        N = d['Normal'] / np.maximum(al[..., None], 0.02)
        ge = sum(np.abs(ni.sobel(N[..., c], ax)) for c in range(3) for ax in (0, 1)) / 8
        gz = np.abs(ni.sobel(np.nan_to_num(z), 0)) + np.abs(ni.sobel(np.nan_to_num(z), 1))
        l = np.clip(ge * 1.3 + gz * 6.0, 0, 1) * (al > 0.02)
        Image.fromarray((l * 255).astype(np.uint8)).convert('RGB').save(os.path.join(uit, f'{naam}-lijnen.png'))
        # het masker: ons silhouet, een paar pixels ruimer; zo blijft de AI binnen de figuur
        ms = ni.binary_dilation(m, iterations=4)
        Image.fromarray((ms * 255).astype(np.uint8)).convert('RGB').save(os.path.join(uit, f'{naam}-masker.png'))
        r = Image.open(os.path.join(rmap, naam + '.png')).convert('RGBA')
        a = np.asarray(r, dtype=np.float32) / 255.0
        rgb = a[..., :3] * a[..., 3:4] + GRIJS * (1 - a[..., 3:4])
        Image.fromarray((rgb * 255 + 0.5).astype(np.uint8)).save(os.path.join(uit, f'{naam}-init.png'))
        print(naam, flush=True)
    print('KLAAR', flush=True)


if __name__ == '__main__':
    hoofd()
