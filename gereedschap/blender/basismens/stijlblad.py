# Het contactblad van de drie renderstijlen (Marcel, 29 okt, ronde 5: "Maak een contactblad met de oorspronkelijke
# Aardschok-speerman, variant A, B en C. Toon elke variant zowel op grote resolutie als op 74 pixels spelhoogte. Gebruik
# dezelfde zichtbare lichaamsgrootte, voetenbaseline en kadering"). Uit de renders van stijlen.py (ZW) en de speerman:
# zijn vel in het spel (ZW) met de render waar dat vel van komt (eigen.py, 15 graden), en dezelfde speerman op 30 graden,
# de camera van de soldaat. Elk beeld wordt geschaald op de lichaamshoogte zonder speer (van de kruin van de helm tot de
# zool, met meten.masker op een klein beeld), met de voeten op één lijn en het lijf in het midden van zijn kolom.
# De nabewerking per stijl staat hier (de getallen in instellingen.json, soldaat.stijlen):
# - A: geen;
# - B: penseelstreken: een Kuwahara-filter ('penseel' pixels; per pixel het gemiddelde van de rustigste van vier hoeken);
# - C: kleurvlakken: het licht op elke plek (de render gedeeld door de albedo) in stappen van 1/'stappen' stop, terwijl
#   de kleur en de textuur van het materiaal blijven (een palet over het hele beeld maakte vlekken op de helm en een geel
#   speerblad: kleine vlakken krijgen dan de kleur van grote); dan donkere lijnen waar de materialen wisselen (de randen
#   in de albedo, 'lijn'); op spelmaat verkleind zoals de vellen van het spel (spelvel.py: BOX), een palet van 'kleuren'
#   kleuren zonder ruis en de doorzichtigheid hard (hele pixels, geen halve randen).
# Daarnaast de ontleding: de vorm (klei, en het silhouet over dat van de speerman op 30 graden), de materialen (albedo),
# het licht (A, B en C zoals gerenderd) en de nabewerking (B en C af).
#
# Ronde 6 (`stijlblad.py ronde6`): het origineel, ronde 5 C, ronde 6 zonder nabewerking en met de HD-pixelafwerking op 15
# en 30 graden (stijlen.py -- C 15|30 -40 en albedo), groot en op spelmaat (oplevering.png), en de close-ups met de helm
# alleen (details.png).
#
#   python gereedschap/blender/basismens/stijlblad.py [ronde6]
# naar <uit>/stijlen/contactblad.png, ontleding.png, stijlen.json (de maten per kolom), en per stijl de variant zoals
# op het blad: <stijl>-af.png (groot) en <stijl>-spelmaat.png.
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import blad  # noqa: E402
import meten  # noqa: E402
import soldaat_blad  # noqa: E402
import variant  # noqa: E402

INST, WORTEL = blad.INST, blad.WORTEL
ST = variant.INST['soldaat']['stijlen']
MAP = os.path.join(variant.UIT, 'stijlen')
SPEERMAN = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'blender', 'render')
GROOT, KLEIN, ACHTER = 560, None, (150, 145, 136, 255)


def lijf(im):
    """De bovenkant (kruin van de helm), de onderkant (de zool) en het midden van het lijf zonder speer, in pixels van
    `im`. Een groot beeld eerst verkleind tot zo'n 110 pixels hoog: daar is de schacht een dunne loop (meten.masker)."""
    f = min(1.0, 110 / im.height)
    klein = im if f == 1.0 else im.resize((max(1, round(im.width * f)), round(im.height * f)), Image.BOX)
    m, _ = meten.masker(klein)
    ys, xs = np.nonzero(m)
    return ys.min() / f, (ys.max() + 1) / f, (xs.mean() + 0.5) / f


def schaal(im, hoogte, soort=Image.LANCZOS):
    """`im` zo geschaald dat het lijf `hoogte` pixels is; met de plek van de voeten (midden, onder)."""
    boven, onder, cx = lijf(im)
    f = hoogte / (onder - boven)
    uit = im.resize((max(1, round(im.width * f)), max(1, round(im.height * f))), soort)
    return uit, (cx * f, onder * f)


def kuwahara(im, r):
    """Per pixel het gemiddelde van de rustigste (laagste spreiding in helderheid) van de vier hoeken van (r+1) bij (r+1)
    eromheen; op de kleur maal de doorzichtigheid, zodat de achtergrond niet in de rand loopt."""
    a = np.asarray(im.convert('RGBA')).astype(np.float64) / 255
    pm = np.concatenate([a[:, :, :3] * a[:, :, 3:], a[:, :, 3:]], axis=2)
    lum = pm[:, :, :3] @ np.array([0.299, 0.587, 0.114])
    h, w = lum.shape

    def doos(x):  # de som over elk vak van (r+1) bij (r+1) met de pixel linksboven, via een integraalbeeld
        p = np.pad(x, ((r + 1, r + 1), (r + 1, r + 1)) + ((0, 0),) * (x.ndim - 2), mode='edge')
        s = np.pad(p.cumsum(0).cumsum(1), ((1, 0), (1, 0)) + ((0, 0),) * (x.ndim - 2))
        n = r + 1
        return (s[n:, n:] - s[:-n, n:] - s[n:, :-n] + s[:-n, :-n]) / (n * n)
    gem, gem_l, gem_l2 = doos(pm), doos(lum), doos(lum * lum)
    beste, uit = np.full((h, w), np.inf), np.zeros_like(pm)
    for dy in (0, r):
        for dx in (0, r):
            ys, xs = slice(r + 1 - dy, r + 1 - dy + h), slice(r + 1 - dx, r + 1 - dx + w)
            var = gem_l2[ys, xs] - gem_l[ys, xs] ** 2
            kies = var < beste
            beste[kies] = var[kies]
            uit[kies] = gem[ys, xs][kies]
    al = uit[:, :, 3:]
    rgb = np.where(al > 1e-4, uit[:, :, :3] / np.maximum(al, 1e-4), 0)
    return Image.fromarray(np.clip(np.concatenate([rgb, al], axis=2) * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')


def trap(im, albedo, stappen):
    """Kleurvlakken: het licht op elke plek (de render gedeeld door de albedo, in lineaire helderheid) afgerond op
    1/`stappen` stop; de kleur en de textuur van het materiaal blijven."""
    r = np.asarray(im.convert('RGBA')).astype(np.float64) / 255
    a = np.asarray(albedo.convert('RGBA')).astype(np.float64) / 255
    lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    w = np.array([0.2126, 0.7152, 0.0722])
    rl = lin(r[:, :, :3])
    licht = (rl @ w) / np.maximum(lin(a[:, :, :3]) @ w, 1e-3)
    q = 2 ** (np.round(np.log2(np.maximum(licht, 1e-3)) * stappen) / stappen)
    rl = np.clip(rl * (q / np.maximum(licht, 1e-6))[:, :, None], 0, 1)
    s = np.where(rl <= 0.0031308, rl * 12.92, 1.055 * rl ** (1 / 2.4) - 0.055)
    return Image.fromarray(np.clip(np.dstack([s, r[:, :, 3:]]) * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')


def lijnen(im, albedo, breedte, donker):
    """Donker langs de randen van de materialen: waar de albedo van kleur wisselt, of het silhouet ophoudt."""
    b = np.asarray(albedo.convert('RGBA')).astype(np.int32)
    rand = np.zeros(b.shape[:2], bool)
    for dy, dx in ((0, 1), (1, 0)):
        d = np.abs(b[dy:, dx:, :3] - b[:b.shape[0] - dy, :b.shape[1] - dx, :3]).sum(axis=2) > 90
        d |= (b[dy:, dx:, 3] >= 128) != (b[:b.shape[0] - dy, :b.shape[1] - dx, 3] >= 128)
        rand[dy:, dx:] |= d
        rand[:b.shape[0] - dy, :b.shape[1] - dx] |= d
    for _ in range(breedte - 1):
        rand[1:] |= rand[:-1]
        rand[:, 1:] |= rand[:, :-1]
    a = np.asarray(im.convert('RGBA')).astype(np.float64)
    a[:, :, :3] *= np.where(rand, 1 - donker, 1.0)[:, :, None]
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def palet(im, n, hard=False):
    """De kleuren tot een palet van `n` (octree, zonder ruis; ronde 6: median cut maakte de grijze helm blauw); met `hard`
    de doorzichtigheid 0 of 1."""
    a = np.asarray(im.convert('RGBA'))
    rgb = Image.fromarray(a[:, :, :3]).quantize(colors=n, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE)  # octree: kleine vlakken (de helm) houden hun kleur
    al = (a[:, :, 3] >= 128).astype(np.uint8) * 255 if hard else a[:, :, 3]
    return Image.fromarray(np.dstack([np.asarray(rgb.convert('RGB')), al]), 'RGBA')


def maat(im):
    """De helderheid (gemiddeld en de spreiding, L van 0 tot 100), de verzadiging en het aantal kleuren van het lijf."""
    a = np.asarray(im.convert('RGBA'))
    m = a[:, :, 3] >= 128
    rgb = a[:, :, :3][m].astype(np.float64) / 255
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    Y = lin @ np.array([0.2126, 0.7152, 0.0722])
    L = np.where(Y > 0.008856, 116 * np.cbrt(Y) - 16, 903.3 * Y)
    mx, mn = rgb.max(axis=1), rgb.min(axis=1)
    return {'L': round(float(L.mean()), 1), 'L_spreiding': round(float(L.std()), 1),
            'verzadiging': round(float(np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).mean()), 3),
            'kleuren': int(len(np.unique(a[:, :, :3][m].reshape(-1, 3), axis=0)))}


def kolommen():
    """Per kolom de naam, het grote beeld en het beeld op spelmaat, en de tussenstappen voor de ontleding."""
    global KLEIN
    lees = lambda p: Image.open(p).convert('RGBA')
    cellen, _ = soldaat_blad.speerman()
    spel = cellen['ZW']
    b, o, _ = lijf(spel)
    KLEIN = round(o - b)  # de lichaamshoogte van de speerman in ZW op zijn vel
    st = {s: lees(os.path.join(MAP, s + '.png')) for s in ('A', 'B', 'C', 'klei', 'albedo')}
    B_af = kuwahara(st['B'], ST['B']['penseel'])
    C_af = lijnen(trap(st['C'], st['albedo'], ST['C']['stappen']), st['albedo'], *ST['C']['lijn'])
    sm = lambda im: schaal(im, KLEIN, Image.BOX)[0]
    s15, s30 = lees(os.path.join(SPEERMAN, 'eigen-ZW-staan.png')), lees(os.path.join(SPEERMAN, 'eigen-ZW-iso-staan.png'))
    kol = [
        ('speerman, het vel van het spel', '15 graden (eigen.py)', s15, spel),
        ('speerman op 30 graden', 'de camera van de soldaat', s30, sm(s30)),
        ('A  mat 3D', 'zacht licht, alles mat', st['A'], sm(st['A'])),
        ('B  painterly', 'warm licht, vlekken, penseel', B_af, sm(B_af)),
        ('C  Aardschok HD-pixel', 'licht van het vel, lichtvlakken, lijnen', C_af, palet(sm(C_af), ST['C']['kleuren'], hard=True)),
    ]
    return kol, st, {'B_af': B_af, 'C_af': C_af, 's30': s30}


def plaats(blad_, im, hoogte, voet, cx_kolom, soort=Image.LANCZOS):
    """`im` geschaald op lichaamshoogte `hoogte`, de voeten op y `voet`, het lijf midden op x `cx_kolom`."""
    s, (cx, onder) = schaal(im, hoogte, soort)
    blad_.alpha_composite(s, (round(cx_kolom - cx), round(voet - onder)))


def contactblad(kol, bestand='contactblad.png'):
    lt, lk = blad.letter(22), blad.letter(15)
    # dezelfde kadering voor elke kolom: zo breed en hoog als het verste beeld (met de speer) van zijn voeten af
    links = rechts = boven = 0
    for _, _, groot, _ in kol:
        s, (cx, onder) = schaal(groot, GROOT)
        x0, y0, x1, _ = s.getbbox()
        links, rechts, boven = max(links, cx - x0), max(rechts, x1 - cx), max(boven, onder - y0)
    kb = round(links + rechts) + 30
    tegel = Image.open(os.path.join(WORTEL, INST['spelmaat']['tegels'])).convert('RGBA').crop(tuple(INST['spelmaat']['tegel']))
    rij_groot, rij_grijs, rij_spel, rij_palet = round(boven) + 30, GROOT // 2 + 70, 4 * KLEIN + 60, 60
    kop = 70
    H = kop + rij_groot + rij_grijs + rij_spel + rij_palet + 20
    B = Image.new('RGBA', (len(kol) * kb + 20, H), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    for i, (naam, uitleg, groot, klein) in enumerate(kol):
        x = 10 + i * kb
        cx = x + links + 15
        d.text((x + 8, 10), naam, font=lt, fill=(240, 236, 228))
        d.text((x + 8, 40), uitleg, font=lk, fill=(190, 184, 172))
        y = kop
        B.paste(Image.new('RGBA', (kb - 6, rij_groot), ACHTER), (x, y))
        plaats(B, groot, GROOT, y + rij_groot - 15, cx)
        y += rij_groot + 6
        # de waarden: hetzelfde beeld in grijs, half zo groot (licht en schaduw los van de kleur)
        B.paste(Image.new('RGBA', (kb - 6, rij_grijs - 6), ACHTER), (x, y))
        g = groot.convert('LA').convert('RGBA')
        plaats(B, g, GROOT // 2, y + rij_grijs - 20, cx)
        y += rij_grijs
        # op spelmaat: op de tegels van het spel, en vier keer vergroot (hele pixels)
        veld = blad.tegelveld(kb - 6, rij_spel - 6, tegel, rij_spel - 40)
        b_, o_, kx = lijf(klein)
        veld.alpha_composite(klein, (round(45 - kx), round(rij_spel - 40 - o_)))
        groot4 = klein.resize((klein.width * 4, klein.height * 4), Image.NEAREST)
        veld.alpha_composite(groot4, (round(kb * 0.55 - kx * 4), round(rij_spel - 22 - o_ * 4)))
        B.paste(veld, (x, y))
        d.text((x + 8, y + 6), f'spelmaat: lijf {KLEIN} px, en 4x', font=lk, fill=(240, 236, 228))
        y += rij_spel
        # het palet op spelmaat: de tien kleuren die het meest voorkomen
        a = np.asarray(klein.convert('RGBA'))
        px = a[:, :, :3][a[:, :, 3] >= 128]
        q = Image.fromarray(px.reshape(1, -1, 3)).quantize(colors=10, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        tel = sorted(q.getcolors(), reverse=True)
        pal = q.getpalette()
        for j, (_, k) in enumerate(tel[:10]):
            d.rectangle((x + 8 + j * ((kb - 20) // 10), y + 6, x + 4 + (j + 1) * ((kb - 20) // 10), y + 48), fill=tuple(pal[3 * k:3 * k + 3]))
    B.convert('RGB').save(os.path.join(MAP, bestand))


def silhouet(soldaat, speerman, hoogte):
    """Het silhouet van de soldaat over dat van de speerman, even groot, de voeten en het midden op elkaar: rood alleen
    de soldaat, blauw alleen de speerman, grijs allebei."""
    s1, (c1, o1) = schaal(soldaat, hoogte)
    s2, (c2, o2) = schaal(speerman, hoogte)
    W, H = 2 * round(hoogte * 0.9), round(hoogte * 1.7)
    uit = np.zeros((H, W, 4), np.uint8)
    lagen = []
    for s, c, o in ((s1, c1, o1), (s2, c2, o2)):
        doek = Image.new('RGBA', (W, H))
        doek.alpha_composite(s, (round(W / 2 - c), round(H - 20 - o)))
        lagen.append(np.asarray(doek)[:, :, 3] >= 128)
    a, b = lagen
    uit[a & b] = (150, 150, 150, 255)
    uit[a & ~b] = (220, 70, 50, 255)
    uit[~a & b] = (60, 130, 230, 255)
    return Image.fromarray(uit, 'RGBA'), round(float((a & b).sum() / (a | b).sum()), 3)


def ontleding(st, extra):
    lt, lk = blad.letter(20), blad.letter(14)
    h = 380
    sil, iou = silhouet(st['klei'], extra['s30'], h)
    panelen = [
        ('vorm: klei', 'licht van C, één grijs', st['klei']),
        ('vorm: silhouet', f'rood soldaat, blauw speerman 30°; overlap {iou}', sil),
        ('materialen: albedo', 'alleen de kleur, geen licht', st['albedo']),
        ('licht: A', 'zoals gerenderd', st['A']),
        ('licht: B', 'zoals gerenderd', st['B']),
        ('licht: C', 'zoals gerenderd', st['C']),
        ('nabewerking: B', 'penseel (Kuwahara)', extra['B_af']),
        ('nabewerking: C', 'lichtvlakken en lijnen', extra['C_af']),
    ]
    pb, ph = 330, h + 150
    B = Image.new('RGBA', (4 * pb + 20, 2 * ph + 20), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    for i, (naam, uitleg, im) in enumerate(panelen):
        x, y = 10 + (i % 4) * pb, 10 + (i // 4) * ph
        B.paste(Image.new('RGBA', (pb - 6, ph - 6), ACHTER), (x, y))
        d.text((x + 8, y + 6), naam, font=lt, fill=(30, 28, 26))
        d.text((x + 8, y + 32), uitleg, font=lk, fill=(50, 46, 42))
        if naam == 'vorm: silhouet':
            B.alpha_composite(im, (round(x + pb / 2 - im.width / 2), y + ph - 16 - im.height))
        else:
            plaats(B, im, h, y + ph - 30, x + pb / 2 + 20)
    B.convert('RGB').save(os.path.join(MAP, 'ontleding.png'))
    return iou


def main():
    kol, st, extra = kolommen()
    contactblad(kol)
    for naam, _, groot, klein in kol[2:]:
        groot.save(os.path.join(MAP, naam.split()[0] + '-af.png'))
        klein.save(os.path.join(MAP, naam.split()[0] + '-spelmaat.png'))
    iou = ontleding(st, extra)
    verslag = {'lijf_spelmaat': KLEIN, 'silhouet_overlap_speerman_30': iou,
               'kolommen': {naam: {'groot': maat(schaal(groot, GROOT)[0]), 'spelmaat': maat(klein)} for naam, _, groot, klein in kol}}
    json.dump(verslag, open(os.path.join(MAP, 'stijlen.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('STIJLBLAD', json.dumps(verslag, ensure_ascii=False))


def ronde6():
    """De bladen van ronde 6 (Marcel, 29 okt: "Lever minimaal de volgende afbeeldingen"): oplevering.png (het origineel,
    ronde 5 C, ronde 6 zonder nabewerking, en met de HD-pixelafwerking op 15 en 30 graden; groot, in grijs en op
    spelmaat) en details.png (de close-ups, de helm alleen van vier kanten met textuur en in klei, en de helm op spelmaat
    naast die van de speerman). De varianten ook los: r6-*.png."""
    global KLEIN
    lees = lambda p: Image.open(p).convert('RGBA')
    spel = soldaat_blad.speerman()[0]['ZW']
    b, o, _ = lijf(spel)
    KLEIN = round(o - b)
    sm = lambda im: schaal(im, KLEIN, Image.BOX)[0]
    C = ST['C']
    af = {e: lijnen(trap(lees(os.path.join(MAP, f'C-{e}.png')), lees(os.path.join(MAP, f'albedo-{e}.png')), C['stappen']),
                    lees(os.path.join(MAP, f'albedo-{e}.png')), *C['lijn']) for e in ('15', '30')}
    r5 = os.path.join(variant.UIT_BASIS, 'overdracht-5')
    rauw = lees(os.path.join(MAP, 'C-30.png'))
    kol = [('speerman, het vel', '15 graden (eigen.py)', lees(os.path.join(SPEERMAN, 'eigen-ZW-staan.png')), spel),
           ('ronde 5, C', '30 graden, ZW op 45', lees(os.path.join(r5, '3-C-groot.png')), lees(os.path.join(r5, '4-C-spelmaat.png'))),
           ('ronde 6, zonder', '30 graden, geen nabewerking', rauw, sm(rauw)),
           ('ronde 6, HD-pixel 15°', 'lichtvlakken, lijnen, palet', af['15'], palet(sm(af['15']), C['kleuren'], hard=True)),
           ('ronde 6, HD-pixel 30°', 'lichtvlakken, lijnen, palet', af['30'], palet(sm(af['30']), C['kleuren'], hard=True))]
    contactblad(kol, 'oplevering.png')
    for naam, (_, _, groot, klein) in (('zonder', kol[2]), ('hdpixel-15', kol[3]), ('hdpixel-30', kol[4])):
        groot.save(os.path.join(MAP, f'r6-{naam}.png'))
        klein.save(os.path.join(MAP, f'r6-{naam}-spelmaat.png'))
    # de close-ups en de helm
    lt = blad.letter(16)
    Z = 300
    rijen = [[(f'detail-{n}', t) for n, t in (('gezicht', 'gezicht'), ('hoofd', 'helm'), ('romp', 'gambeson en tabberd'),
                                              ('laarzen', 'laarzen'), ('speer', 'speer'))],
             [(f'helm-{k}', f'helm {t}') for k, t in (('voor', 'van voren'), ('opzij', 'opzij'), ('driekwart-voor', 'driekwart voor'),
                                                    ('driekwart-achter', 'driekwart achter'))],
             [(f'helm-{k}-klei', f'klei {t}') for k, t in (('voor', 'van voren'), ('opzij', 'opzij'), ('driekwart-voor', 'driekwart voor'),
                                                         ('driekwart-achter', 'driekwart achter'))]]
    B = Image.new('RGB', (5 * (Z + 8) + 8, 3 * (Z + 30) + 8), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for i, rij in enumerate(rijen):
        for j, (bestand, titel) in enumerate(rij):
            im = Image.new('RGBA', (Z, Z), ACHTER)
            im.alpha_composite(lees(os.path.join(MAP, bestand + '.png')).resize((Z, Z), Image.LANCZOS))
            B.paste(im.convert('RGB'), (8 + j * (Z + 8), 30 + i * (Z + 30)))
            d.text((10 + j * (Z + 8), 8 + i * (Z + 30)), titel, font=lt, fill=(235, 230, 222))
    # de helm op spelmaat: het hoofd van de speerman op zijn vel en van ronde 6 op 30 graden, zes keer vergroot
    x, y = 8 + 4 * (Z + 8), 30 + Z + 30
    d.text((x + 2, y - 22), 'op spelmaat (6x): speerman, ronde 6', font=lt, fill=(235, 230, 222))
    for k, im in enumerate((spel, kol[4][3])):
        b, o, cx = lijf(im)  # het hoofd: van de kruin van de helm tot een derde van het lijf, rond het midden
        kop = im.crop((round(cx - 0.16 * (o - b)), round(b) - 2, round(cx + 0.16 * (o - b)), round(b + 0.36 * (o - b))))
        kop = kop.resize((kop.width * 6, kop.height * 6), Image.NEAREST)
        vak = Image.new('RGBA', (Z // 2 - 4, Z), ACHTER)
        vak.alpha_composite(kop, (max(0, (vak.width - kop.width) // 2), 10))
        B.paste(vak.convert('RGB'), (x + k * (Z // 2 + 4), y))
    B.save(os.path.join(MAP, 'details.png'))


def hdpixel(map_):
    """De HD-pixelafwerking van C (ronde 5 en 6) op de render C-30 van een map: groot, rauw en op spelmaat."""
    lees = lambda p: Image.open(p).convert('RGBA')
    C = ST['C']
    rauw, alb = lees(os.path.join(map_, 'C-30.png')), lees(os.path.join(map_, 'albedo-30.png'))
    af = lijnen(trap(rauw, alb, C['stappen']), alb, *C['lijn'])
    return af, rauw, palet(schaal(af, KLEIN, Image.BOX)[0], C['kleuren'], hard=True)


def hoofd(im, hoogte=1000, breed=380, hoog=390):
    """Het hoofd met de kraag en de schouders uit een hele man: geschaald op lichaamshoogte `hoogte`, rond het midden van
    het lijf, van net boven de kruin van de helm."""
    s, _ = schaal(im, hoogte)
    b, _, cx = lijf(s)
    vak = Image.new('RGBA', (breed, hoog), ACHTER)
    vak.alpha_composite(s.crop((round(cx - breed / 2), round(b) - 12, round(cx + breed / 2), round(b) - 12 + hoog)))
    return vak


def blad7(kol, pad):
    """Een contactblad van ronde 7: per kolom de hele man met de HD-pixelafwerking (dezelfde lichaamshoogte en voetlijn),
    het hoofd zonder nabewerking, de man op spelmaat (op de tegels en 4x) en zijn hoofd op spelmaat (8x)."""
    lt, lk = blad.letter(22), blad.letter(15)
    links = rechts = boven = 0
    for k in kol:
        s, (cx, onder) = schaal(k[2], GROOT)
        x0, y0, x1, _ = s.getbbox()
        links, rechts, boven = max(links, cx - x0), max(rechts, x1 - cx), max(boven, onder - y0)
    kb = max(round(links + rechts) + 30, 400)
    tegel = Image.open(os.path.join(WORTEL, INST['spelmaat']['tegels'])).convert('RGBA').crop(tuple(INST['spelmaat']['tegel']))
    rij_groot, rij_kop, rij_spel = round(boven) + 30, 400, 4 * KLEIN + 60
    kop_spel = round(0.36 * KLEIN) * 8 + 20
    H = 96 + rij_groot + rij_kop + rij_spel + kop_spel + 20
    B = Image.new('RGBA', (len(kol) * kb + 20, H), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    for i, (naam, uitleg, groot, rauw, klein) in enumerate(kol):
        x = 10 + i * kb
        d.text((x + 8, 10), naam, font=lt, fill=(240, 236, 228))
        for j, regel in enumerate(uitleg.split('\n')[:3]):
            d.text((x + 8, 40 + j * 18), regel, font=lk, fill=(190, 184, 172))
        y = 96
        B.paste(Image.new('RGBA', (kb - 6, rij_groot), ACHTER), (x, y))
        plaats(B, groot, GROOT, y + rij_groot - 15, x + links + 15 + (kb - 30 - round(links + rechts)) // 2)
        y += rij_groot + 6
        B.alpha_composite(hoofd(rauw), (x + (kb - 6 - 380) // 2, y))
        d.text((x + 8, y + 4), 'zonder nabewerking', font=lk, fill=(40, 36, 32))
        y += rij_kop
        veld = blad.tegelveld(kb - 6, rij_spel - 6, tegel, rij_spel - 40)
        b_, o_, kx = lijf(klein)
        veld.alpha_composite(klein, (round(45 - kx), round(rij_spel - 40 - o_)))
        veld.alpha_composite(klein.resize((klein.width * 4, klein.height * 4), Image.NEAREST), (round(kb * 0.55 - kx * 4), round(rij_spel - 22 - o_ * 4)))
        B.paste(veld, (x, y))
        d.text((x + 8, y + 6), f'spelmaat: lijf {KLEIN} px, en 4x', font=lk, fill=(240, 236, 228))
        y += rij_spel
        kop = klein.crop((round(kx - 0.2 * (o_ - b_)), round(b_) - 2, round(kx + 0.2 * (o_ - b_)), round(b_ + 0.36 * (o_ - b_))))
        kop = kop.resize((kop.width * 8, kop.height * 8), Image.NEAREST)
        vak = Image.new('RGBA', (kb - 6, kop_spel), ACHTER)
        vak.alpha_composite(kop, ((vak.width - kop.width) // 2, 10))
        B.paste(vak, (x, y))
        d.text((x + 8, y + 4), 'hoofd op spelmaat, 8x', font=lk, fill=(40, 36, 32))
    B.convert('RGB').save(pad)


def helm_klein(im):
    """De helm op spelmaat: de grijze pixels in het bovenste achtste van het lijf (zonder de speer); hoeveel, hoe breed, en
    de mediane helderheid (L, 0 tot 100)."""
    b, o, cx = lijf(im)
    a = np.asarray(im.convert('RGBA')).astype(np.float64)
    vak = a[round(b):round(b + 0.13 * (o - b)), max(0, round(cx - 0.2 * (o - b))):round(cx + 0.2 * (o - b))]
    rgb = vak[:, :, :3] / 255
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    grijs = (vak[:, :, 3] >= 128) & ((mx - mn) / np.maximum(mx, 1e-6) < 0.3) & (mx > 0.25)
    if grijs.sum() < 3:
        return None
    lin = np.where(rgb <= 0.04045, rgb / 12.92, ((rgb + 0.055) / 1.055) ** 2.4)
    Y = lin @ np.array([0.2126, 0.7152, 0.0722])
    L = np.where(Y > 0.008856, 116 * np.cbrt(Y) - 16, 903.3 * Y)
    return {'pixels': int(grijs.sum()), 'breed': int(np.ptp(np.nonzero(grijs.any(axis=0))[0]) + 1), 'L': round(float(np.median(L[grijs])), 1)}


def ronde7():
    """De bladen en de metingen van ronde 7 (Marcel, 29 okt: helm, gezicht en maliënkraag in drie experimenten, elk naast
    het origineel en ronde 6, op grote resolutie en op 74 pixels): contactblad-A (helm), -B (gezicht), -C (kraag) en -D
    (origineel, ronde 5, 6 en 7), en ronde7.json met per versie de metingen tegen de speerman op 30 graden (referentie.py:
    de overlap, de maten, de kleur, het gezicht en de kraag), de ogen onder de rand (stijlen.py -- kop) en de maten van de
    helm (soldaat.json). Leest de proeven uit <uit>/proeven/<naam>/stijlen, ronde 7 uit <uit>/stijlen."""
    global KLEIN
    import referentie
    lees = lambda p: Image.open(p).convert('RGBA')
    spel = soldaat_blad.speerman()[0]['ZW']
    b, o, _ = lijf(spel)
    KLEIN = round(o - b)
    G = os.path.join(variant.UIT_BASIS, 'gedrongen')
    kaart = {'ronde 6': os.path.join(variant.UIT_BASIS, 'overdracht-7', 'ronde6')}
    for p in ('A2', 'A2-A3', 'B2', 'B2-B3', 'C2', 'C2-C3'):
        kaart[p] = os.path.join(G, 'proeven', p)
    kaart['ronde 7'] = G
    s30 = lees(os.path.join(SPEERMAN, 'eigen-ZW-iso-staan.png'))
    ref = referentie.figuur(os.path.join(SPEERMAN, 'eigen-ZW-iso-staan.png'))
    r5 = os.path.join(variant.UIT_BASIS, 'overdracht-5')
    metingen = {'speerman': {'maten': ref['maten'], 'kleur': ref['kleur'], 'vlak': ref['vlak'], 'helm_spelmaat': helm_klein(spel)}}
    kol = {'origineel': ('origineel', 'de speerman: 30 graden (render)\nen zijn vel in het spel (15 graden)\n'
                         f"helm op 74 px L {metingen['speerman']['helm_spelmaat']['L']:.0f}", s30, s30, spel),
           'ronde 5': ('ronde 5, C', 'zoals opgeleverd', lees(os.path.join(r5, '3-C-groot.png')), lees(os.path.join(r5, '3-C-groot.png')),
                       lees(os.path.join(r5, '4-C-spelmaat.png')))}
    for naam, m_ in kaart.items():
        st = os.path.join(m_, 'stijlen')
        if not os.path.exists(os.path.join(st, 'C-30.png')):
            continue
        af, rauw, klein = hdpixel(st)
        f = referentie.figuur(os.path.join(st, 'C-30.png'))
        iou = {k: referentie.iou((np.asarray(ref['doek'])[:, :, 3] >= 128) if k == 'alles' else ref['m'][k],
                                 (np.asarray(f['doek'])[:, :, 3] >= 128) if k == 'alles' else f['m'][k])
               for k in ('alles', 'lijf', 'helm', 'tabberd', 'kraag')}
        de = {k: round(float(np.linalg.norm(np.array(f['kleur'][k]) - np.array(ref['kleur'][k]))), 1)
              for k in ('helm', 'gezicht') if k in f['kleur'] and k in ref['kleur']}
        uit = {'iou': iou, 'maten': f['maten'], 'kleur': f['kleur'], 'delta_e': de, 'vlak': f['vlak'], 'helm_spelmaat': helm_klein(klein),
               'staal_L': f['kleur'].get('helm', [None])[0], 'staal_dL': round(f['kleur']['helm'][0] - ref['kleur']['helm'][0], 1) if 'helm' in f['kleur'] else None}
        for bestand, sleutel in (('kop-30.json', 'ogen'), (os.path.join('..', 'soldaat.json'), 'helm_m')):
            p = os.path.join(st, bestand)
            if os.path.exists(p):
                j = json.load(open(p, encoding='utf-8'))
                uit[sleutel] = j.get('helm') if sleutel == 'helm_m' else j
        metingen[naam] = uit
        if naam == 'ronde 7':  # de eindrenders los: groot met en zonder nabewerking, en op spelmaat (1x en 4x)
            af.save(os.path.join(MAP, 'r7-hdpixel-30.png'))
            rauw.save(os.path.join(MAP, 'r7-zonder.png'))
            klein.save(os.path.join(MAP, 'r7-spelmaat.png'))
            klein.resize((klein.width * 4, klein.height * 4), Image.NEAREST).save(os.path.join(MAP, 'r7-spelmaat-4x.png'))
        mt = f['maten']
        regel = (f"overlap {iou['alles']:.2f}, helm {iou['helm']:.2f}\n"
                 f"helm {mt['helm_hoog'][1]:.3f} x {mt['helm_breed'][1]:.3f}, gezicht {f['vlak']['gezicht']} px")
        if 'ogen' in uit:
            regel += f"\nogen zichtbaar {round(100 * uit['ogen']['ogen_zichtbaar'])}%"
        if uit['helm_spelmaat']:
            regel += f", helm op 74 px L {uit['helm_spelmaat']['L']:.0f}"
        kol[naam] = (naam, regel, af, rauw, klein)
    json.dump(metingen, open(os.path.join(MAP, 'ronde7.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    namen = lambda *n: [kol[k] for k in n if k in kol]
    for letter, rij in (('A', ('origineel', 'ronde 6', 'A2', 'A2-A3')), ('B', ('origineel', 'ronde 6', 'B2', 'B2-B3')),
                        ('C', ('origineel', 'ronde 6', 'C2', 'C2-C3')), ('D', ('origineel', 'ronde 5', 'ronde 6', 'ronde 7'))):
        k = namen(*rij)
        hernoem = {'ronde 6': {'A': 'ronde 6', 'B': 'B1 (ronde 6)', 'C': 'C1 (ronde 6)', 'D': 'ronde 6'}[letter], 'A2-A3': 'A3', 'B2-B3': 'B3', 'C2-C3': 'C3'}
        k = [(hernoem.get(n, n),) + tuple(rest) for n, *rest in k]
        blad7(k, os.path.join(MAP, f'contactblad-{letter}.png'))
    print('RONDE7', json.dumps({n: {'iou': v.get('iou'), 'dL': v.get('staal_dL'), 'de': v.get('delta_e'), 'vlak': v.get('vlak'),
                                    'ogen': (v.get('ogen') or {}).get('ogen_zichtbaar'), 'helm74': v.get('helm_spelmaat')}
                                for n, v in metingen.items()}, ensure_ascii=False))


if __name__ == '__main__':
    ronde7() if 'ronde7' in sys.argv else ronde6() if 'ronde6' in sys.argv else main()
