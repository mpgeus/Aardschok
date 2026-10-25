# Per materiaal het lichtbereik van de referentie en van het model, over alle richtingen samen (vraag 190; Marcel, 25 okt:
# "Zoek in detail uit waar de verschillen zitten. Tot op de laatste pixel."). Elke pixel van het lijf (op spelmaat,
# uitgelijnd zoals vergelijk.py) gaat naar een materiaal op zijn kleur (tint en verzadiging); per materiaal het aantal
# pixels (hoeveel ervan in beeld is) en L, a en b bij het licht (80e percentiel van L), het midden en de schaduw (20e).
#
# Let op: een groep op kleur mengt delen. "Grijs" van het vel bevat ook de schaduw van de helm, en zei daardoor dat kap en
# armstuk koel blauwgrijs moesten; per vlak gemeten (hieronder, VLAK) zijn ze warm grijsbruin. Kijk dus eerst per vlak: een
# rechthoek per deel, met de hand op het raster van Z gezet, en daarin de mediaan van het vel en van het model.
#
#   python palet.py <map met eigen-<r>-staan.png> [nog een map ...]      (de Python van ComfyUI, met PIL)
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


# per deel een rechthoek op het vak van Z (x0, y0, x1, y1, op spelmaat), binnen het deel zodat een pixel scheef niet telt
VLAK = {'helm': (16, 21, 32, 29), 'kap': (15, 37, 19, 43), 'kap schaduw': (28, 37, 32, 43), 'mouw L': (34, 42, 40, 54),
        'riem': (16, 57, 33, 59), 'armstuk': (35, 56, 40, 62), 'geel boven': (15, 45, 24, 55),
        'blauw boven': (26, 45, 32, 55), 'geel rok': (17, 62, 26, 72), 'blauw rok': (27, 62, 33, 72),
        'hozen': (16, 75, 33, 77), 'laarzen': (15, 81, 22, 88)}


def vlakken(kaarten):
    """Per deel de mediaan in Lab van het vel en van elk model (staan Z)."""
    uit = {}
    for kaart in kaarten:
        ref, model, _, _ = vergelijk.uitgelijnd(f'{kaart}/eigen-Z-staan.png', 'Z')
        for naam, b in (('vel', ref), (kaart.replace(chr(92), '/').rstrip('/').rsplit('/', 1)[-1], model)):
            px = b.load()
            for v, (x0, y0, x1, y1) in VLAK.items():
                labs = [omtrek.lab(px[x, y][:3]) for x in range(x0, x1 + 1) for y in range(y0, y1 + 1) if px[x, y][3] >= 128]
                uit.setdefault(v, {})[naam] = [sorted(l[i] for l in labs)[len(labs) // 2] for i in range(3)] if labs else None
    for v, d in uit.items():
        print(f'{v:12s} ' + '   '.join(f'{n[:10]:10s} L{c[0]:3.0f} a{c[1]:3.0f} b{c[2]:3.0f}' for n, c in d.items() if c))


def bereik(px):
    if not px:
        return None
    labs = sorted((omtrek.lab(p) for p in px), key=lambda t: t[0])
    n = len(labs)
    return [labs[min(n - 1, int(n * q))] for q in (0.8, 0.5, 0.2)]


if __name__ == '__main__':
    print('Per vlak (staan Z):')
    vlakken(sys.argv[1:])
    kaart = sys.argv[-1]
    print()
    print(f'Per kleurgroep, alle richtingen ({kaart}):')
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
