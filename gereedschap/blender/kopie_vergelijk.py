# De kopie (kopie_hd.py) op de plaat van GPT gelegd en gemeten (vraag 190; Marcel, 27 okt: "ik wil een perfecte kopie").
# Per aanzicht hoe de omtrekken samenvallen (doorsnede gedeeld door vereniging), en per strook van 5 procent van de lengte
# hoeveel pixels de kopie links en rechts te smal (min) of te breed (plus) is; dan de kleur per onderdeel op het
# vooraanzicht, met het verschil in Lab. Beelden: <uit>/kopie-plaat.png (de kopie als plaat), naast.png (de plaat boven,
# de kopie onder) en omtrek.png (de omtrek van de plaat paars, die van de kopie cyaan).
#
#   python gereedschap/blender/kopie_vergelijk.py <plaat> <map met kopie-<r>.png> [uitmap]   (de Python van ComfyUI, met PIL)
import os
import sys

from PIL import Image, ImageChops, ImageFilter

RICHTINGEN = ['Z', 'ZW', 'W', 'N']  # zoals de plaat, van links naar rechts
DREMPEL = 28  # zoveel verschilt een pixel van de figuur van de achtergrond (r + g + b)
PUNTEN = {
    'helm': (215, 115), 'gezicht': (192, 222), 'kraag': (178, 240), 'mouw-boven': (95, 360), 'mouw-onder': (55, 420),
    'rok-blauw': (165, 330), 'rok-geel': (265, 330), 'rok-geel-onder': (150, 560), 'rok-blauw-onder': (290, 560),
    'riem': (170, 448), 'jak-onder': (140, 632), 'broek': (150, 720), 'laars': (110, 905), 'laars-omslag': (120, 830),
    'handschoen': (45, 560),
}


def masker_plaat(im):
    bg = im.getpixel((5, 5))
    vlak = Image.new('RGB', im.size, bg)
    d = ImageChops.difference(im, vlak).convert('RGB')
    r, g, b = d.split()
    som = ImageChops.add(ImageChops.add(r, g), b)
    return som.point(lambda v: 255 if v > DREMPEL else 0), bg


def figuren(m):
    """De figuren op de plaat als kolommen met inhoud: [(x0, x1)]."""
    w, h = m.size
    px = m.load()
    kol = [sum(1 for y in range(0, h, 2) if px[x, y]) for x in range(w)]
    uit, start = [], None
    for x, n in enumerate(kol + [0]):
        if n > 3 and start is None:
            start = x
        elif n <= 3 and start is not None:
            if x - start > 40:
                uit.append((start, x - 1))
            start = None
    return uit


def kader(m, x0, x1):
    bb = m.crop((x0, 0, x1 + 1, m.size[1])).getbbox()
    return (bb[0] + x0, bb[1], bb[2] + x0 - 1, bb[3] - 1) if bb else None


def randen(m, x0, x1, y):
    """De linker- en rechterrand van de figuur op rij y (en de rijen eromheen), of None."""
    px = m.load()
    ls, rs = [], []
    for yy in range(y - 2, y + 3):
        xs = [x for x in range(x0, x1 + 1) if px[x, yy]]
        if xs:
            ls.append(xs[0])
            rs.append(xs[-1])
    return (sum(ls) / len(ls), sum(rs) / len(rs)) if ls else None


def lab(c):
    def lin(v):
        v /= 255
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (lin(v) for v in c[:3])
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.9505
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.089
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))


def mediaan(im, x, y):
    vak = sorted((im.getpixel((x + i, y + j))[:3] for i in range(-3, 4) for j in range(-3, 4)), key=sum)
    return vak[len(vak) // 2]


def main():
    plaat_pad, map_ = sys.argv[1], sys.argv[2]
    uit = sys.argv[3] if len(sys.argv) > 3 else map_
    plaat = Image.open(plaat_pad).convert('RGB')
    mp, bg = masker_plaat(plaat)
    figs = figuren(mp)
    kopie = Image.new('RGB', plaat.size, bg)
    mk = Image.new('L', plaat.size, 0)
    print('aanzicht  samen  hoog plaat/kopie  zolen plaat/kopie  rand gem. (px)')
    stroken = {}
    grenzen = [0] + [(figs[i][1] + figs[i + 1][0]) // 2 for i in range(len(figs) - 1)] + [plaat.size[0] - 1]
    for i, (r, (x0, x1)) in enumerate(zip(RICHTINGEN, figs)):
        lo, hi = grenzen[i], grenzen[i + 1]
        pad = os.path.join(map_, f'kopie-{r}.png')
        if not os.path.exists(pad):
            continue
        im = Image.open(pad).convert('RGBA')
        a = im.split()[3].point(lambda v: 255 if v > 128 else 0)
        rb = a.getbbox()
        pb = kader(mp, x0, x1)
        dx = round((pb[0] + pb[2]) / 2 - (rb[0] + rb[2] - 1) / 2)
        kopie.paste(im, (dx, 0), im)
        mk.paste(a, (dx, 0), a)
        eigen = Image.new('L', plaat.size, 0)  # alleen deze figuur: de kopie is soms breder dan zijn vak
        eigen.paste(a, (dx, 0), a)
        kb = kader(eigen, 0, plaat.size[0] - 1)
        A = mp.crop((lo, 0, hi + 1, plaat.size[1]))
        B = eigen.crop((lo, 0, hi + 1, plaat.size[1]))
        en = ImageChops.multiply(A, B).histogram()[255]
        of = ImageChops.lighter(A, B).histogram()[255]
        # per strook van 5 procent van de lengte, van de zolen omhoog
        lengte = pb[3] - pb[1]
        rij = []
        for i in range(1, 20):
            y = round(pb[3] - lengte * i / 20)
            p, k = randen(mp, lo, hi, y), randen(eigen, 0, plaat.size[0] - 1, y)
            if p and k:
                rij.append((i * 5, p[0] - k[0], k[1] - p[1], p[1] - p[0], k[1] - k[0]))
        stroken[r] = rij
        gem = sum(abs(d[1]) + abs(d[2]) for d in rij) / (2 * len(rij))
        print(f'{r:3s}       {en / of:.3f}  {pb[3] - pb[1]:4d} / {kb[3] - kb[1]:4d}      {pb[3]:4d} / {kb[3]:4d}         {gem:5.1f}')
    print('\nper strook: hoogte (% van de zolen), links en rechts te breed (+) of te smal (-), breedte plaat / kopie')
    for r, rij in stroken.items():
        print(r, '  '.join(f'{h}%:{l:+.0f}/{rr:+.0f}({pw:.0f}/{kw:.0f})' for h, l, rr, pw, kw in rij))
    print('\nkleur per onderdeel (vooraanzicht): plaat, kopie, verschil in L a b')
    for naam, (x, y) in PUNTEN.items():
        p, k = mediaan(plaat, x, y), mediaan(kopie, x, y)
        lp, lk = lab(p), lab(k)
        print(f'{naam:16s} #{p[0]:02x}{p[1]:02x}{p[2]:02x}  #{k[0]:02x}{k[1]:02x}{k[2]:02x}  '
              f'L{lk[0] - lp[0]:+5.0f} a{lk[1] - lp[1]:+5.0f} b{lk[2] - lp[2]:+5.0f}')
    os.makedirs(uit, exist_ok=True)
    kopie.save(os.path.join(uit, 'kopie-plaat.png'))
    grenzen = [0] + [(figs[i][1] + figs[i + 1][0]) // 2 for i in range(len(figs) - 1)] + [plaat.size[0] - 1]
    for i, r in enumerate(RICHTINGEN):  # per aanzicht de plaat en de kopie naast elkaar, op ware grootte
        vak = (grenzen[i], 0, grenzen[i + 1], plaat.size[1])
        w = vak[2] - vak[0]
        beeld = Image.new('RGB', (2 * w, plaat.size[1]), bg)
        beeld.paste(plaat.crop(vak), (0, 0))
        beeld.paste(kopie.crop(vak), (w, 0))
        beeld.save(os.path.join(uit, f'naast-{r}.png'))
    naast = Image.new('RGB', (plaat.size[0], plaat.size[1] * 2), bg)
    naast.paste(plaat, (0, 0))
    naast.paste(kopie, (0, plaat.size[1]))
    naast.resize((plaat.size[0] * 3 // 4, plaat.size[1] * 3 // 2), Image.LANCZOS).save(os.path.join(uit, 'naast.png'))
    omtrek = Image.blend(kopie, Image.new('RGB', plaat.size, (0, 0, 0)), 0.45)
    omtrek.paste((255, 0, 255), (0, 0), mp.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 0 else 0))
    omtrek.paste((0, 255, 255), (0, 0), mk.filter(ImageFilter.FIND_EDGES).point(lambda v: 255 if v > 0 else 0))
    omtrek.save(os.path.join(uit, 'omtrek.png'))


if __name__ == '__main__':
    main()
