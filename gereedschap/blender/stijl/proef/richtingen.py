# Blijft een materiaal gelijk over de acht richtingen, en blijft de figuur dezelfde vorm houden (vraag 192, de methodeproef). Per onderdeel de mediane kleur in elke richting, en hoe
# ver die uiteenloopt; per beeld de overlap van het silhouet met de huidige render op 80 pixels; en de maten en ankers van de vellen.
#
#   python richtingen.py <uit.json> <map nu> <map nieuw> <houding> <beelden> <vellen nu> <vellen nieuw>
import json
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import oorzaak as O  # noqa: E402
import render_id_kleuren as RK  # noqa: E402
import vel as Vl  # noqa: E402

RS = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')


def per_deel(m, hd, r, i):
    p = os.path.join(m, f'{hd}-{r}-{i:02d}.png')
    a = np.asarray(Image.open(p).convert('RGBA'), dtype=np.float32)
    idb = np.asarray(Image.open(p.replace('.png', '-id.png')).convert('RGBA'), dtype=np.float32)
    uit = {}
    lb = O.lab(a[..., :3])
    for naam, k in RK.KLEUR.items():
        # de ID-kleur is lineair, het beeld sRGB: 0,5 staat er als 0,735
        doel = np.where(np.array(k) == 0.5, 0.735, np.array(k))
        s = (np.abs(idb[..., :3] / 255.0 - doel).sum(-1) < 0.15) & (a[..., 3] > 230) & (idb[..., 3] > 230)
        if s.sum() > 200:
            uit[naam] = np.median(lb[s], axis=0)
    return uit


def spreiding(m, hd):
    per = {r: per_deel(m, hd, r, 0) for r in RS}
    res = {}
    for naam in RK.KLEUR:
        v = np.array([per[r][naam] for r in RS if naam in per[r]])
        if len(v) >= 4:
            res[naam] = {'L_sd': round(float(v[:, 0].std()), 2), 'kleur_sd': round(float(np.hypot(v[:, 1].std(), v[:, 2].std())), 2), 'richtingen': len(v)}
    return res


def overlap(mn, mx, hd, n):
    meta = json.load(open(os.path.join(mn, f'{hd}-render.json'), encoding='utf-8'))
    s = Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))
    uit = []
    for r in RS:
        for i in range(n):
            a = np.asarray(Vl.sprite(os.path.join(mn, f'{hd}-{r}-{i:02d}.png'), s))[..., 3] > 127
            b = np.asarray(Vl.sprite(os.path.join(mx, f'{hd}-{r}-{i:02d}.png'), s))[..., 3] > 127
            uit.append((a & b).sum() / max((a | b).sum(), 1))
    return round(float(np.mean(uit)), 4), round(float(np.min(uit)), 4)


def hoofd():
    uit, nu, nw, hd, n, vn, vm = sys.argv[1:8]
    n = int(n)
    res = {'spreiding_nu': spreiding(nu, hd), 'spreiding_nieuw': spreiding(nw, hd)}
    res['silhouet_overlap_gemiddeld'], res['silhouet_overlap_laagst'] = overlap(nu, nw, hd, n)
    a = json.load(open(os.path.join(vn, f'speerman-{hd}.json'), encoding='utf-8'))
    b = json.load(open(os.path.join(vm, f'speerman-{hd}.json'), encoding='utf-8'))
    res['vel_nu'] = {k: a[k] for k in ('cel', 'anker', 'stap', 'fps', 'beelden')}
    res['vel_nieuw'] = {k: b[k] for k in ('cel', 'anker', 'stap', 'fps', 'beelden')}
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    print(json.dumps(res)[:1800])


if __name__ == '__main__':
    hoofd()
