# De omtrek van het model naast die van de referentie (vraag 190, ontwerp/beeld.md; Marcel, 25 okt: "We zitten te ver van
# de referentie met het 3d model", "Begin maar met de omtrek"). Per richting de staande man van het vel van het spel
# (beelden/figuren/speerman-staan.png) en die van het model (eigen.py -- <map> Z ZW W staan), even hoog en met de voeten
# op één lijn: hoeveel ze samenvallen (de overlap gedeeld door het geheel), en per strook van boven naar beneden hoeveel
# pixels van de referentie het model links en rechts te smal (min) of te breed (plus) is. De speer telt niet mee (dunne
# delen gaan eraf), en het model krijgt de donkere rand van een pixel die het vel ook heeft. Met een plaat per richting:
# de omtrekken over elkaar, rood de referentie, blauw het model.
#
#   python omtrek.py <map met eigen-<r>-staan.png> <uit-map> [Z,ZW,W]      (de Python van ComfyUI heeft PIL)
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HIER = __file__.replace('\\', '/').rsplit('/', 1)[0]
VEL = HIER + '/../../beelden/figuren/speerman-staan.png'
ALLE = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']
CB, CH = 44, 94
GRIJS = (92, 96, 90)
STROKEN = (('helm', 0.0, 0.17), ('gezicht', 0.17, 0.3), ('schouders', 0.3, 0.4), ('borst', 0.4, 0.55),
           ('riem', 0.55, 0.62), ('rok', 0.62, 0.78), ('benen', 0.78, 0.88), ('laarzen', 0.88, 1.0))


def masker(beeld, drempel=100):
    return beeld.getchannel('A').point(lambda a: 255 if a > drempel else 0)


def lijf(m):
    """Alleen het lijf: per rij gaan de stukken eraf die smaller zijn dan een achtste van het breedste stuk (de schacht en
    de punt van de speer), en het lijf begint bovenaan pas waar een rij een kwart zo breed is (niet bij de punt boven de
    helm). Waar de hand de speer vasthoudt, telt hij mee."""
    w, h = m.size
    px = m.load()
    alle = []
    for y in range(h):
        xs = [x for x in range(w) if px[x, y]]
        runs = []
        if xs:
            begin = xs[0]
            for x0, x1 in zip(xs, xs[1:]):
                if x1 - x0 > 1:
                    runs.append((begin, x0))
                    begin = x1
            runs.append((begin, xs[-1]))
        alle.append(runs)
    breedst = max((r - l + 1 for runs in alle for l, r in runs), default=1)
    uit = Image.new('L', (w, h), 0)
    op = uit.load()
    begonnen = False
    for y, runs in enumerate(alle):
        houd = [(l, r) for l, r in runs if r - l + 1 >= breedst / 8]
        if not begonnen and sum(r - l + 1 for l, r in houd) < breedst / 4:
            continue
        begonnen = True
        for l, r in houd:
            for x in range(l, r + 1):
                op[x, y] = 255
    return uit


def randen(m):
    """Per rij de meest linkse en rechtse pixel, of None."""
    w, h = m.size
    px = m.load()
    uit = []
    for y in range(h):
        xs = [x for x in range(w) if px[x, y]]
        uit.append((xs[0], xs[-1]) if xs else None)
    return uit


def midden_onder(m):
    """Het midden van de onderste derde: daar staat de man, los van de speer."""
    w, h = m.size
    px = m.load()
    bb = m.getbbox()
    xs = [x for y in range(bb[1] + (bb[3] - bb[1]) * 2 // 3, bb[3]) for x in range(w) if px[x, y]]
    return sorted(xs)[len(xs) // 2]


def meet(model_pad, r):
    vel = Image.open(VEL).convert('RGBA')
    rij = ALLE.index(r)
    ref_m = lijf(masker(vel.crop((0, rij * CH, CB, (rij + 1) * CH))))
    rb = ref_m.getbbox()
    ons = masker(Image.open(model_pad).convert('RGBA'))
    ons_lijf = lijf(ons)
    ob = ons_lijf.getbbox()
    # het model even hoog als de referentie (het lijf), met de voeten op dezelfde rij en het midden onder gelijk
    s = (rb[3] - rb[1]) / (ob[3] - ob[1])
    klein = ons_lijf.resize((max(1, round(ons.width * s)), max(1, round(ons.height * s))), Image.BOX)
    klein = klein.point(lambda a: 255 if a > 127 else 0).filter(ImageFilter.MaxFilter(3))  # de donkere rand van een pixel
    kb = klein.getbbox()
    vlak = Image.new('L', (CB * 3, CH), 0)
    vlak.paste(klein, (round(CB + midden_onder(ref_m) - midden_onder(klein)), rb[3] - kb[3]))
    model = vlak.crop((CB, 0, 2 * CB, CH))
    samen = ImageChops.darker(model, ref_m)
    geheel = ImageChops.lighter(model, ref_m)
    tel = lambda m: sum(1 for p in m.get_flattened_data() if p)
    overlap = tel(samen) / max(tel(geheel), 1)
    rr, mr = randen(ref_m), randen(model)
    hoog = rb[3] - rb[1]
    stroken = []
    for naam, a, b in STROKEN:
        links, rechts, n = 0.0, 0.0, 0
        for y in range(rb[1] + round(a * hoog), rb[1] + round(b * hoog)):
            if rr[y] and mr[y]:
                links += rr[y][0] - mr[y][0]   # plus: het model steekt links verder uit
                rechts += mr[y][1] - rr[y][1]  # plus: het model steekt rechts verder uit
                n += 1
        stroken.append((naam, links / max(n, 1), rechts / max(n, 1)))
    return overlap, stroken, ref_m, model, s


def plaat(ref_m, model, uit, schaal=8):
    w, h = ref_m.size
    p = Image.new('RGB', (w * schaal, h * schaal), GRIJS)
    for m, kleur in ((ref_m, (230, 60, 50)), (model, (70, 140, 255))):
        groot = m.resize((w * schaal, h * schaal), Image.NEAREST)
        rand = ImageChops.subtract(groot.filter(ImageFilter.MaxFilter(3)), groot)
        p.paste(Image.new('RGB', p.size, kleur), (0, 0), rand)
    p.save(uit)


if __name__ == '__main__':
    kaart, uit = sys.argv[1], sys.argv[2]
    richtingen = sys.argv[3].split(',') if len(sys.argv) > 3 else ['Z', 'ZW', 'W']
    totaal = 0
    for r in richtingen:
        overlap, stroken, ref_m, model, s = meet(f'{kaart}/eigen-{r}-staan.png', r)
        totaal += overlap
        plaat(ref_m, model, f'{uit}/omtrek-{r}.png')
        print(f'{r}: samen {overlap:.2f}  ' + '  '.join(f'{n} {l:+.1f}/{rt:+.1f}' for n, l, rt in stroken))
    print(f'gemiddeld samen {totaal / len(richtingen):.3f}')
