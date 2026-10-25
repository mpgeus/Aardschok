# Per materiaal het lichtbereik van de referentie en van het model, over alle richtingen samen (vraag 190; Marcel, 25 okt:
# "Zoek in detail uit waar de verschillen zitten. Tot op de laatste pixel."). Elke pixel van het lijf (op spelmaat,
# uitgelijnd zoals vergelijk.py) gaat naar een materiaal op zijn kleur (tint en verzadiging); per materiaal het aantal
# pixels (hoeveel ervan in beeld is) en L, a en b bij het licht (80e percentiel van L), het midden en de schaduw (20e).
#
#   python palet.py <map met eigen-<r>-staan.png>      (de Python van ComfyUI, met PIL)
import colorsys
import sys

sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
import omtrek  # noqa: E402
import vergelijk  # noqa: E402


def soort(rgb):
    r, g, b = (c / 255 for c in rgb)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    h *= 360
    if s < 0.18 and l > 0.45:
        return 'staal'
    if s < 0.22:
        return 'grijs (kap, baard, armstuk)'
    if 200 <= h <= 250:
        return 'blauw (wapenrok, hozen)'
    if 38 <= h < 60 and s > 0.5 and l > 0.35:
        return 'geel (wapenrok)'
    if 15 <= h < 38 and l > 0.5:
        return 'huid / licht leer'
    if h < 38 or h > 330:
        return 'bruin (mouwen, laarzen, leer, speer)'
    return 'anders'


def bereik(px):
    if not px:
        return None
    labs = sorted((omtrek.lab(p) for p in px), key=lambda t: t[0])
    n = len(labs)
    return [labs[min(n - 1, int(n * q))] for q in (0.8, 0.5, 0.2)]


if __name__ == '__main__':
    kaart = sys.argv[1]
    verz = {}
    for r in omtrek.ALLE:
        ref, model, ref_m, mod_m = vergelijk.uitgelijnd(f'{kaart}/eigen-{r}-staan.png', r)
        for naam, beeld, m in (('ref', ref, ref_m), ('model', model, mod_m)):
            pb, pm = beeld.load(), m.load()
            for y in range(beeld.height):
                for x in range(beeld.width):
                    if pm[x, y] and pb[x, y][3] >= 128:
                        verz.setdefault(soort(pb[x, y][:3]), {}).setdefault(naam, []).append(pb[x, y][:3])
    for s, d in sorted(verz.items(), key=lambda t: -len(t[1].get('ref', []))):
        a, b = d.get('ref', []), d.get('model', [])
        print(f'{s}: ref {len(a)} pixels, model {len(b)} ({len(b) / max(len(a), 1) * 100:.0f} procent)')
        for naam, px in (('ref', a), ('model', b)):
            br = bereik(px)
            if br:
                print(f'   {naam:6s} ' + '  '.join(f'{t} L{v[0]:.0f} a{v[1]:.0f} b{v[2]:.0f}'
                                                for t, v in zip(('licht', 'midden', 'schaduw'), br)))
