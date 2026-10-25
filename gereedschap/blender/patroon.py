# Welke kleur heeft de wapenrok op het vel van het spel, rondom het lijf? (vraag 190; Marcel, 25 okt: "de wapenrok moet
# inderdaad overal gelijk zijn".) Het vel is per richting getekend, niet één lijf: in N ligt het geel boven op de rug links,
# in NO en NW rechts. Dit telt over alle richtingen samen waar het vel geel en waar blauw is, zodat één patroon voor alle
# richtingen het best past (speerman_hd.mat_wapenrok, beeld.md "Eén wapenrok voor alle richtingen").
#
# Per pixel van de wapenrok op spelmaat (uitgelijnd zoals vergelijk.py) geeft de hoekpas (eigen.py, `staan hoek`) de plek
# op het lijf; daaruit de hoek om het lijf (0 voor, +90 zijn linkerzij, 180 de rug, -90 zijn rechterzij) en boven of
# onder de riem. Alleen pixels die rondom ook wapenrok zijn (een pixel scheef telt niet), en op het vel duidelijk geel of
# blauw. Per vak van 10 graden: hoe vaak geel, hoe vaak blauw, en per richting.
#
#   blender.exe -b -P gereedschap/blender/eigen.py -- <hoekmap> Z ZW W NW N NO O ZO staan hoek
#   python patroon.py <map met eigen-<r>-staan.png> <hoekmap>      (de Python van ComfyUI, met PIL)
import colorsys
import json
import math
import sys

sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
import omtrek  # noqa: E402
import vergelijk  # noqa: E402
from PIL import Image  # noqa: E402

VAK = 10  # graden


def kleur(rgb):
    h, l, s = colorsys.rgb_to_hls(*(c / 255 for c in rgb))
    h *= 360
    if 30 <= h < 70 and s > 0.35 and l > 0.25:
        return 'geel'
    if 200 <= h <= 260 and s > 0.2:
        return 'blauw'
    return None


def monsters(mooi, hoek):
    """(hoek om het lijf, boven of onder, richting, kleur op het vel) per pixel van de wapenrok."""
    w = json.load(open(f'{hoek}/hoekpas.json'))
    uit = []
    for r in omtrek.ALLE:
        ref, _, _, _, (maat, x0, dy) = vergelijk.uitgelijnd(f'{mooi}/eigen-{r}-staan.png', r, met_maat=True)
        hk = Image.open(f'{hoek}/eigen-{r}-staan.png').convert('RGBA').resize(maat, Image.NEAREST)
        vlak = Image.new('RGBA', (omtrek.CB * 3, omtrek.CH), (0, 0, 0, 0))
        vlak.paste(hk, (x0, dy))
        hk = vlak.crop((omtrek.CB, 0, 2 * omtrek.CB, omtrek.CH))
        ph, pr = hk.load(), ref.load()
        rok = lambda x, y: 0 <= x < hk.width and 0 <= y < hk.height and ph[x, y][3] >= 128 and ph[x, y][2] > 20
        for y in range(hk.height):
            for x in range(hk.width):
                if not all(rok(x + a, y + b) for a, b in ((0, 0), (1, 0), (-1, 0), (0, 1), (0, -1))):
                    continue
                k = kleur(pr[x, y][:3]) if pr[x, y][3] >= 128 else None
                if not k:
                    continue
                px, py, pz = ph[x, y][0] / 255 - 0.5, ph[x, y][1] / 255 - 0.5, (ph[x, y][2] / 255 - 0.1) / 0.5
                th = math.degrees(math.atan2(px, -(py - w['midden_y'])))
                uit.append((th, 'boven' if pz > w['z_riem'] else 'onder', r, k))
    return uit


if __name__ == '__main__':
    tel = {}
    for th, deel, r, k in monsters(sys.argv[1], sys.argv[2]):
        vak = int((th + 180) // VAK) % (360 // VAK)
        d = tel.setdefault((deel, vak), {})
        d.setdefault(r, {'geel': 0, 'blauw': 0})[k] += 1
    for deel in ('boven', 'onder'):
        print(f'== {deel} de riem (0 voor, +90 zijn linkerzij, 180 de rug, -90 zijn rechterzij)')
        for vak in range(360 // VAK):
            d = tel.get((deel, vak))
            if not d:
                continue
            g = sum(v['geel'] for v in d.values())
            b = sum(v['blauw'] for v in d.values())
            a = vak * VAK - 180
            print(f'{a:5d} tot {a + VAK:4d}  geel {g:3d}  blauw {b:3d}  {"GEEL " if g > b else "blauw"}  ' +
                  ' '.join(f"{r} {v['geel']}/{v['blauw']}" for r, v in d.items()))
