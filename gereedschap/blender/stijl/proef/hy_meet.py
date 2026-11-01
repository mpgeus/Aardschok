# Hunyuan3D-2mv tegen de plaat en V4: de silhouetoverlap en de vergelijkingsplaat, op gelijke figuurhoogte (helm tot zool).
# De maat van V4 (P4.plaat_zonder_speer) rust op een drempel die uit de helm hapt, dus elke overlap staat er ook op het
# masker van hy_invoer. Dunne delen gaan eruit (P4.dun_weg), bij de mesh en bij V4 op dezelfde manier.
#
#   python hy_meet.py <map met klei-e25 en klei-e0> <uitmap bewijs> [naam]
import json
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_invoer as HI  # noqa: E402
import platen4 as P4  # noqa: E402

V4 = os.path.join(P4.S, 'vormproef4', 'eind', 'klei')
SPEER = {'Z': ((41, 44), (47, 442), (262, 322)), 'N': ((1071, 44), (1062, 430), (278, 322))}  # zoals P4.plaat_zonder_speer


def plaat_beter(r):
    m = HI.vrijstaand(r)[1]
    if r not in SPEER:
        return m
    (xa, ya), (xb, yb), (h0, h1) = SPEER[r]
    x0, y0 = P4.VAK[r][:2]
    h, w = m.shape
    yy, xx = np.mgrid[0:h, 0:w]
    px, py = xx + x0, yy + y0
    t = (py - ya) / (yb - ya)
    breed = np.where(py < ya + 100, 26, 11)
    return P4.grootste(m & ~((np.abs(px - (xa + t * (xb - xa))) < breed) & ((py < h0) | (py > h1))))


def main():
    map_, bewijs = sys.argv[1], sys.argv[2]
    naam = sys.argv[3] if len(sys.argv) > 3 else 'speerman'
    e25, e0 = os.path.join(map_, 'klei-e25'), os.path.join(map_, 'klei-e0')
    os.makedirs(bewijs, exist_ok=True)
    res = {}
    for r in ('Z', 'N'):
        h25 = P4.dun_weg(P4.masker_render(os.path.join(e25, f'staan-{r}-00.png')))
        h0 = P4.dun_weg(P4.masker_render(os.path.join(e0, f'staan-{r}-00.png')))
        v4 = P4.dun_weg(P4.masker_render(os.path.join(V4, f'staan-{r}-00.png')))
        oud, beter = P4.plaat_zonder_speer(r), plaat_beter(r)
        res[r] = {
            'oud masker': {'V4': round(P4.overlap(oud, v4), 3), 'Hunyuan 25 graden': round(P4.overlap(oud, h25), 3), 'Hunyuan vlak': round(P4.overlap(oud, h0), 3)},
            'beter masker': {'V4': round(P4.overlap(beter, v4), 3), 'Hunyuan 25 graden': round(P4.overlap(beter, h25), 3), 'Hunyuan vlak': round(P4.overlap(beter, h0), 3)},
        }
    # W en O: met wat er staat. W heeft een speer op de plaat, O niet, en beide de handen voor de buik: alleen ter vergelijking, zonder dunne delen
    for r in ('W', 'O'):
        beter = P4.dun_weg(HI.vrijstaand(r)[1])
        res[r] = {'beter masker': {'V4': round(P4.overlap(beter, P4.dun_weg(P4.masker_render(os.path.join(V4, f'staan-{r}-00.png')))), 3),
                                   'Hunyuan 25 graden': round(P4.overlap(beter, P4.dun_weg(P4.masker_render(os.path.join(e25, f'staan-{r}-00.png')))), 3),
                                   'Hunyuan vlak': round(P4.overlap(beter, P4.dun_weg(P4.masker_render(os.path.join(e0, f'staan-{r}-00.png')))), 3)}}
    with open(os.path.join(bewijs, f'{naam}-overlap.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1, ensure_ascii=False)
    print(json.dumps(res, ensure_ascii=False))

    def hoogte(m):
        ys = np.nonzero(m.any(1))[0]
        return int(ys.max() - ys.min() + 1)
    rijen = []
    for r in ('Z', 'W', 'N', 'O'):
        p25, p0 = os.path.join(e25, f'staan-{r}-00.png'), os.path.join(e0, f'staan-{r}-00.png')
        rijen.append(P4.gelijk([(P4.ref_vak(r), P4.REF_H[r]), (P4.op_grijs(p25), hoogte(P4.dun_weg(P4.masker_render(p25)))), (P4.op_grijs(p0), hoogte(P4.dun_weg(P4.masker_render(p0)))), (P4.op_grijs(os.path.join(V4, f'staan-{r}-00.png')), P4.fig_h(V4, r))], 460, [f'{r}: plaat', 'Hunyuan, 25 graden', 'Hunyuan, vlak', 'V4, 25 graden']))
    W = max(i.width for i in rijen)
    d = Image.new('RGB', (W * 2 + 16, max(rijen[0].height + rijen[1].height, rijen[2].height + rijen[3].height) + 8), P4.DONKER)
    d.paste(rijen[0], (0, 0))
    d.paste(rijen[1], (0, rijen[0].height + 8))
    d.paste(rijen[2], (W + 16, 0))
    d.paste(rijen[3], (W + 16, rijen[2].height + 8))
    d.save(os.path.join(bewijs, f'{naam}-vergelijking.png'))


if __name__ == '__main__':
    main()
