# De staande man van het model en die van het vel van het spel tot op de pixel naast elkaar (vraag 190, ontwerp/beeld.md;
# Marcel, 25 okt: "Maak nu eens een goed analyse tussen de referentie en ons model. Zoek in detail uit waar de verschillen
# zitten. Tot op de laatste pixel."). Per richting, op spelmaat en uitgelijnd zoals omtrek.py (het lijf even hoog, de voeten
# op één rij, het midden onder gelijk), met de rand zoals op het vel (de eigen randpixels donkerder, lopen.cjs RAND):
#   1. de referentie;  2. het model;  3. de omtrek (grijs allebei, rood alleen de referentie, blauw alleen het model);
#   4. het kleurverschil per pixel (Lab, groen gelijk, rood 30 of meer);  5. licht en donker (rood: het model lichter,
#   blauw: donkerder, 20 punten L is vol).
# En per strook van boven naar beneden: de breedte links en rechts, het kleurverschil, en het verschil in L, a en b; en
# per richting het kleurverschil per pixel gemiddeld (waar vel en model allebei dekken), met onderaan het gemiddelde.
# De stand oké van 25 okt: 27,3 (Z 22,2  ZW 25,3  W 26,6  NW 26,0  N 27,9  NO 43,5  O 22,5  ZO 24,4).
#
#   python vergelijk.py <map met eigen-<r>-staan.png> <uit.png> [richtingen]     (de Python van ComfyUI, met PIL)
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
import omtrek  # noqa: E402

N = 8  # pixels per pixel van het vel
GRIJS = (92, 96, 90)
RAND = {'links': 0.81, 'boven': 0.74, 'onder': 0.83, 'rechts': 0.63}


def rand(b):
    px = b.load()
    w, h = b.size
    dekt = lambda x, y: 0 <= x < w and 0 <= y < h and px[x, y][3] >= 128
    uit = b.copy()
    po = uit.load()
    for y in range(h):
        for x in range(w):
            if not dekt(x, y):
                continue
            f = 1.0
            for nx, ny, k in ((x - 1, y, 'links'), (x + 1, y, 'rechts'), (x, y - 1, 'boven'), (x, y + 1, 'onder')):
                if not dekt(nx, ny):
                    f = min(f, RAND[k])
            if f < 1:
                r, g, bl, a = px[x, y]
                po[x, y] = (round(r * f), round(g * f), round(bl * f), a)
    return uit


def uitgelijnd(model_pad, r, met_maat=False):
    """De referentie en het model op het vak van het vel (44 bij 94), het model zoals omtrek.meet het uitlijnt. Met
    met_maat ook hoe (de maat van het verkleinde model en waar het staat), om een ander beeld zo te leggen (patroon.py)."""
    vel = Image.open(omtrek.VEL).convert('RGBA')
    rij = omtrek.ALLE.index(r)
    ref = vel.crop((0, rij * omtrek.CH, omtrek.CB, (rij + 1) * omtrek.CH))
    ref_lijf = omtrek.lijf(omtrek.masker(ref))
    rb = ref_lijf.getbbox()
    ons = Image.open(model_pad).convert('RGBA')
    ons_lijf = omtrek.lijf(omtrek.masker(ons))
    ob = ons_lijf.getbbox()
    s = (rb[3] - rb[1]) / (ob[3] - ob[1])
    maat = (max(1, round(ons.width * s)), max(1, round(ons.height * s)))
    klein = ons.resize(maat, Image.BOX)
    klein.putalpha(klein.getchannel('A').point(lambda v: 255 if v >= 128 else 0))
    klein = rand(klein)
    km = omtrek.lijf(omtrek.masker(klein))
    dy = rb[3] - km.getbbox()[3]
    # opzij uitgelijnd op de beste overlap van de omtrek (het midden van de voeten liep in N en ZO 3 à 4 pixels mis, door de
    # speer of een voet die naar buiten staat)
    beste = None
    for dx in range(-8, 9):
        x0 = round(omtrek.CB + omtrek.midden_onder(ref_lijf) - omtrek.midden_onder(km)) + dx
        vlak = Image.new('L', (omtrek.CB * 3, omtrek.CH), 0)
        vlak.paste(km, (x0, dy))
        m = vlak.crop((omtrek.CB, 0, 2 * omtrek.CB, omtrek.CH))
        samen = sum(1 for p, q in zip(m.get_flattened_data(), ref_lijf.get_flattened_data()) if p and q)
        geheel = sum(1 for p, q in zip(m.get_flattened_data(), ref_lijf.get_flattened_data()) if p or q)
        if beste is None or samen / geheel > beste[0]:
            beste = (samen / geheel, x0)
    vlak = Image.new('RGBA', (omtrek.CB * 3, omtrek.CH), (0, 0, 0, 0))
    vlak.paste(klein, (beste[1], dy), klein)
    model = vlak.crop((omtrek.CB, 0, 2 * omtrek.CB, omtrek.CH))
    if met_maat:
        return ref, model, ref_lijf, omtrek.lijf(omtrek.masker(model)), (maat, beste[1], dy)
    return ref, model, ref_lijf, omtrek.lijf(omtrek.masker(model))


def kaarten(ref, model, ref_m, mod_m):
    w, h = ref.size
    pr, pm, mr, mm = ref.load(), model.load(), ref_m.load(), mod_m.load()
    omt = Image.new('RGB', (w, h), GRIJS)
    de = Image.new('RGB', (w, h), GRIJS)
    dl = Image.new('RGB', (w, h), GRIJS)
    po, pd, pl = omt.load(), de.load(), dl.load()
    for y in range(h):
        for x in range(w):
            a, b = pr[x, y][3] >= 128, pm[x, y][3] >= 128
            if a and b:
                po[x, y] = (150, 150, 150)
                la, lb = omtrek.lab(pr[x, y][:3]), omtrek.lab(pm[x, y][:3])
                e = sum((la[i] - lb[i]) ** 2 for i in range(3)) ** 0.5
                t = min(1.0, e / 30)
                pd[x, y] = (round(60 + 195 * t), round(200 - 150 * t), 60)
                d = max(-1.0, min(1.0, (lb[0] - la[0]) / 20))
                pl[x, y] = (round(128 + 127 * d), round(128 - 127 * abs(d)), round(128 - 127 * d))
            elif a:
                po[x, y] = (230, 60, 50)
            elif b:
                po[x, y] = (70, 140, 255)
    return omt, de, dl


def stroken(ref, model, ref_m, mod_m):
    rb = ref_m.getbbox()
    hoog = rb[3] - rb[1]
    rr, mr = omtrek.randen(ref_m), omtrek.randen(mod_m)
    pr, pm = ref.load(), model.load()
    uit = []
    for naam, a, b in omtrek.STROKEN:
        y0, y1 = rb[1] + round(a * hoog), rb[1] + round(b * hoog)
        l = r = 0.0
        n = 0
        sa, sb = [0.0] * 3, [0.0] * 3
        m = 0
        for y in range(y0, y1):
            if rr[y] and mr[y]:
                l += rr[y][0] - mr[y][0]
                r += mr[y][1] - rr[y][1]
                n += 1
            for x in range(ref.width):
                if pr[x, y][3] >= 128 and pm[x, y][3] >= 128:
                    la, lb = omtrek.lab(pr[x, y][:3]), omtrek.lab(pm[x, y][:3])
                    for i in range(3):
                        sa[i] += la[i]
                        sb[i] += lb[i]
                    m += 1
        ga = [v / max(m, 1) for v in sa]
        gb = [v / max(m, 1) for v in sb]
        uit.append((naam, l / max(n, 1), r / max(n, 1), ga, gb))
    return uit


def per_pixel(ref, model):
    """Het kleurverschil (Lab) gemiddeld over de pixels waar vel en model allebei dekken."""
    pr, pm = ref.load(), model.load()
    s = n = 0
    for y in range(ref.height):
        for x in range(ref.width):
            if pr[x, y][3] >= 128 and pm[x, y][3] >= 128:
                a, b = omtrek.lab(pr[x, y][:3]), omtrek.lab(pm[x, y][:3])
                s += sum((a[i] - b[i]) ** 2 for i in range(3)) ** 0.5
                n += 1
    return s / max(n, 1)


def groot(b):
    return b.resize((b.width * N, b.height * N), Image.NEAREST)


def op_grijs(b):
    g = Image.new('RGBA', b.size, GRIJS + (255,))
    g.alpha_composite(b)
    return g.convert('RGB')


if __name__ == '__main__':
    kaart, uit = sys.argv[1], sys.argv[2]
    richtingen = sys.argv[3].split(',') if len(sys.argv) > 3 else omtrek.ALLE
    W, H = omtrek.CB * N, omtrek.CH * N
    vel = Image.new('RGB', (W * 5 + 40, (H + 24) * len(richtingen)), (40, 40, 40))
    d = ImageDraw.Draw(vel)
    verschil = {}
    for n, r in enumerate(richtingen):
        ref, model, ref_m, mod_m = uitgelijnd(f'{kaart}/eigen-{r}-staan.png', r)
        omt, de, dl = kaarten(ref, model, ref_m, mod_m)
        y = n * (H + 24) + 20
        for i, b in enumerate((op_grijs(ref), op_grijs(model), omt, de, dl)):
            vel.paste(groot(b), (i * (W + 10), y))
        d.text((4, y - 16), f'{r}:  referentie | model | omtrek (rood alleen ref, blauw alleen model) | kleurverschil | '
                            f'licht (rood model lichter, blauw donkerder)', fill=(230, 230, 220))
        verschil[r] = per_pixel(ref, model)
        print(f'== {r}   kleurverschil per pixel {verschil[r]:.1f}')
        for naam, l, rt, ga, gb in stroken(ref, model, ref_m, mod_m):
            e = sum((ga[i] - gb[i]) ** 2 for i in range(3)) ** 0.5
            print(f'  {naam:10s} breedte links {l:+.1f} rechts {rt:+.1f}   ref L{ga[0]:.0f} a{ga[1]:.0f} b{ga[2]:.0f}   '
                  f'model L{gb[0] - ga[0]:+.0f} a{gb[1] - ga[1]:+.0f} b{gb[2] - ga[2]:+.0f}   verschil {e:.0f}')
    print('kleurverschil per pixel: ' + '  '.join(f'{r} {e:.1f}' for r, e in verschil.items()) +
          f'   gemiddeld {sum(verschil.values()) / len(verschil):.1f}')
    vel.save(uit)
