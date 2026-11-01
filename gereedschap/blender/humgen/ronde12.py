# Ronde 12 (Marcel, 29 okt: "ART-DIRECTED CHARACTER RECONSTRUCTION"; "De belangrijkste beoordelingsmaatstaf is de
# uiteindelijke sprite op 74 pixels karakterhoogte"): de bladen en de metingen van de experimenten. Elke kolom is een
# map met stijlen/A8-30.png (proef12.sh) of 'speerman' (de referentie: zijn grote render en zijn cel uit het spel), op
# dezelfde camera, lichaamshoogte en voetlijn. Per kolom: groot, 220 pixels, 74 pixels (1x op de tegels en 4x) en het
# hoofd 8x, met de metingen eronder.
# - de verkleining is die van ronde 8 (ronde8.sprite: het gemiddelde in lineair licht, de alfa op de helft), tenzij een
#   kolom een andere vraagt (ds);
# - de metingen zijn hulp, geen oordeel (Marcel: "Een hogere technische score mag nooit een zichtbaar slechtere sprite
#   goedpraten"): de breedte tegen de hoogte, de helm (de breedste rij bovenin, groot gemeten), de huid in het hoofd en de
#   kleurverdeling op 74 pixels (op kleur, ook bij de speerman, die geen masker per materiaal heeft), het contrast, en
#   hoeveel van het silhouet samenvalt met dat van de speerman (IoU, op de voeten gelegd).
#
#   python ronde12.py analyse                                   de referentie tegen ronde 11 (02-referentie.png)
#   python ronde12.py blad <uit.png> <titel> <kolom> ...         een experiment; kolom: <map>=<naam>|<uitleg> of speerman
#   python ronde12.py ds <map> <uit.png>                         de verkleiningen naast elkaar
#   python ronde12.py richtingen <map> <uit.png>                 acht richtingen, groot en op 74 pixels, naast de speerman
import colorsys
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import blad  # noqa: E402
import meten  # noqa: E402
import soldaat_blad  # noqa: E402
import spriteafwerking as SA  # noqa: E402
import stijlblad as SB  # noqa: E402

WORTEL = SB.WORTEL
U = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'basismens')
INST = soldaat_blad.INST
NAMEN = soldaat_blad.NAMEN
SPEL = soldaat_blad.speerman()[0]
_b, _o, _ = SB.lijf(SPEL['ZW'])
KLEIN = SB.KLEIN = round(_o - _b)  # de lichaamshoogte van de speerman op spelmaat (ZW)
GROEP_KLEUR = {'staal': (255, 0, 0), 'malien': (0, 255, 0), 'stof': (0, 0, 255), 'leer': (255, 255, 0), 'huid': (255, 0, 255), 'hout': (0, 255, 255)}
lees = lambda p: Image.open(p).convert('RGBA')
TEGEL = Image.open(os.path.join(WORTEL, INST['spelmaat']['tegels'])).convert('RGBA').crop(tuple(INST['spelmaat']['tegel']))


# ---------------------------------------------------------------- verkleinen

def verklein(R, lijf_px, soort='lineair'):
    """Een render (RGBA) verkleind tot een lichaamshoogte van `lijf_px`. 'lineair' is ronde8.sprite (het gemiddelde in
    lineair licht, voorvermenigvuldigd met de alfa); 'lanczos', 'bicubic' en 'box' doen hetzelfde in sRGB met PIL; de
    alfa altijd op de helft afgekapt (een hard silhouet, zoals het spel)."""
    a = np.asarray(R).astype(np.float64)
    al = a[:, :, 3] / 255.0
    s = lijf_px / SA.lijf_hoogte(al)
    B, H = max(1, round(R.width * s)), max(1, round(R.height * s))
    if soort == 'lineair':
        lin = SA.lineair(a[:, :, :3])
        w = SA.verklein(al, B, H)
        kl = np.stack([SA.verklein(lin[:, :, c] * al, B, H) for c in range(3)], -1) / np.maximum(w, 1e-9)[..., None]
        rgb = SA.srgb(kl)
    else:
        f = {'lanczos': Image.LANCZOS, 'bicubic': Image.BICUBIC, 'box': Image.BOX}[soort]
        pm = R.convert('RGBa').resize((B, H), f).convert('RGBA')
        x = np.asarray(pm).astype(np.float64)
        rgb, w = x[:, :, :3], x[:, :, 3] / 255.0
    alfa = w >= 0.5
    uit = np.zeros((H, B, 4), np.uint8)
    uit[..., :3] = np.clip(np.round(rgb), 0, 255).astype(np.uint8)
    uit[..., 3] = alfa * 255
    uit[~alfa] = 0
    return Image.fromarray(uit)


def per_materiaal(R, soort, lijf_px=KLEIN):
    I = json.load(open(os.path.join(HIER, '..', 'basismens', 'spriteafwerking.json'), encoding='utf-8'))
    rgba, _ = SA.afwerken(np.asarray(R), np.asarray(soort), lijf_px, I)
    return Image.fromarray(rgba)


def zonder_speer(gr, so):
    """Hoeveel groter SA.lijf_hoogte (en stijlblad.lijf) het lijf meet dan het is: in NW staat de schacht achter het
    hoofd en telt hij mee. Het echte lijf uit het masker per materiaal: het hout weg, dan het grootste stuk (op een
    kwart van de maat)."""
    a = np.asarray(gr)[::4, ::4, 3] >= 128
    s = np.asarray(so.convert('RGB'))[::4, ::4].astype(int)
    hout = (s[:, :, 0] < 60) & (s[:, :, 1] > 200) & (s[:, :, 2] > 200)
    ys = np.nonzero(meten.grootste(a & ~hout).any(axis=1))[0]
    echt = (ys.max() + 1 - ys.min()) * 4
    return SA.lijf_hoogte(np.asarray(gr)[:, :, 3] / 255.0) / echt


# ---------------------------------------------------------------- metingen

def masker(kl):
    m, _ = meten.masker(kl)
    return m


def klassen(kl, m):
    """Per pixel van het lijf een klasse op kleur (HSV, sRGB): donker, grijs (staal, maliën), blauw, geel, huid (alleen
    in het hoofd: de bovenste 30 procent) of bruin (stof, leer, hout)."""
    a = np.asarray(kl.convert('RGB')).astype(np.float64) / 255
    ys = np.nonzero(m.any(axis=1))[0]
    top, H = ys.min(), ys.max() - ys.min() + 1
    uit = {}
    for y, x in zip(*np.nonzero(m)):
        h, s, v = colorsys.rgb_to_hsv(*a[y, x])
        h *= 360
        if v < 0.18:
            k = 'donker'
        elif s < 0.2:
            k = 'grijs'
        elif 190 <= h <= 260:
            k = 'blauw'
        elif 35 <= h < 62 and s >= 0.45 and v >= 0.45:
            k = 'geel'
        elif (h < 35 or h > 345) and 0.18 <= s < 0.62 and v >= 0.45 and y < top + 0.3 * H:
            k = 'huid'
        else:
            k = 'bruin'
        uit[k] = uit.get(k, 0) + 1
    n = max(1, m.sum())
    return {k: round(v / n, 3) for k, v in sorted(uit.items())}


def helm_breed(gr):
    """De breedte van de helm tegen de lichaamshoogte, groot gemeten: de breedste rij in de bovenste 22 procent, alleen het
    stuk rond het midden van het hoofd (de schacht staat er los van)."""
    s, _ = SB.schaal(gr, 1000)
    b, o, _ = SB.lijf(s)
    a = np.asarray(s)[:, :, 3] >= 128
    H = o - b
    kop = a[int(b):int(b + 0.08 * H)]
    cx = int(np.median(np.nonzero(kop)[1]))
    best = 0
    for y in range(int(b), int(b + 0.22 * H)):
        rij = a[y]
        if not rij[cx]:
            continue
        x0 = x1 = cx
        while x0 > 0 and rij[x0 - 1]:
            x0 -= 1
        while x1 < len(rij) - 1 and rij[x1 + 1]:
            x1 += 1
        best = max(best, x1 - x0 + 1)
    return round(best / H, 3)


def lstar(rgb):
    Y = SA.lineair(rgb) @ np.array([0.2126, 0.7152, 0.0722])
    return np.where(Y > 0.008856, 116 * np.cbrt(Y) - 16, 903.3 * Y)


def iou(kl, ref):
    """Hoeveel van de silhouetten samenvalt (doorsnede gedeeld door vereniging), de voeten en het midden op elkaar."""
    m1, m2 = masker(kl), masker(ref)

    def plek(m):
        ys, xs = np.nonzero(m)
        return ys.max(), xs.mean()
    (o1, c1), (o2, c2) = plek(m1), plek(m2)
    H, W = 200, 200
    A, Bm = np.zeros((H, W), bool), np.zeros((H, W), bool)
    for m, o, c, D in ((m1, o1, c1, A), (m2, o2, c2, Bm)):
        ys, xs = np.nonzero(m)
        D[ys - o + 180, np.round(xs - c).astype(int) + 100] = True
    return round(float((A & Bm).sum() / max(1, (A | Bm).sum())), 3)


def meet(gr, kl, ref=None):
    m = masker(kl)
    ys, xs = np.nonzero(m)
    H = ys.max() - ys.min() + 1
    ma = meten.maten(kl)
    a = np.asarray(kl.convert('RGB')).astype(np.float64)
    L = lstar(a)[m]
    kop = np.zeros_like(m)
    kop[ys.min():ys.min() + int(0.12 * H)] = True
    k = klassen(kl, m)
    uit = {'breed_hoog': round((xs.max() - xs.min() + 1) / H, 3), 'schouders': round(ma['schouders'], 3), 'romp': round(ma['romp'], 3),
           'helm': helm_breed(gr), 'huid_px': int(round(k.get('huid', 0) * m.sum())), 'kleuren': k,
           'contrast_L': round(float(L.std()), 1), 'helm_L': round(float(lstar(a)[m & kop].mean()), 1)}
    if ref is not None:
        uit['iou'] = iou(kl, ref)
    return uit


# ---------------------------------------------------------------- de bladen

def kolom_van(arg):
    """'speerman' of 'speerman:<richting>', of <map>[=<naam>|<uitleg>] met stijlen/A8-30.png (of een .png; eindigt die
    op -<richting>.png, dan is dat de richting)."""
    if arg.startswith('speerman'):
        r = arg.partition(':')[2] or 'ZW'
        gr = lees(os.path.join(SB.SPEERMAN, f'eigen-{r}-iso-staan.png'))
        return {'naam': 'speerman (spel)' if r == 'ZW' else f'speerman {r}', 'uitleg': 'de referentie: zijn render\nen zijn cel uit het spel',
                'groot': gr, 'klein': SPEL[r], 'midden': verklein(gr, 216), 'richting': r}
    pm = arg.startswith('pm:')  # op 74 pixels de afwerking per materiaal (ds: de gekozen verkleining van ronde 12)
    pad, _, rest = arg[3 if pm else 0:].partition('=')
    naam, _, uitleg = rest.partition('|')
    p = pad if pad.endswith('.png') else os.path.join(pad, 'stijlen', 'A8-30.png')
    r = os.path.basename(p)[:-4].rpartition('-')[2]
    gr = lees(p)
    kl = per_materiaal(gr, lees(p.replace('A8-30', 'soort-30'))) if pm else verklein(gr, KLEIN)
    return {'naam': naam or os.path.basename(pad), 'uitleg': uitleg.replace('/', '\n'), 'groot': gr, 'klein': kl,
            'midden': verklein(gr, 216), 'map': None if pm else pad, 'richting': r if r in NAMEN else 'ZW'}


def kop_van(kl, f=8):
    b, o, kx = SB.lijf(kl)
    H = o - b
    k = kl.crop((round(kx - 0.21 * H), round(b) - 2, round(kx + 0.21 * H), round(b + 0.34 * H)))
    return k.resize((k.width * f, k.height * f), Image.NEAREST)


def tekst_meting(d):
    k = d['kleuren']
    regels = [f"breed/hoog {d['breed_hoog']}  helm {d['helm']}",
              f"schouders {d['schouders']}  romp {d['romp']}",
              f"huid in het hoofd {d['huid_px']} px",
              f"L-contrast {d['contrast_L']}  helm L {d['helm_L']}",
              'blauw {:.0%} geel {:.0%} bruin {:.0%}'.format(k.get('blauw', 0), k.get('geel', 0), k.get('bruin', 0)),
              'grijs {:.0%} donker {:.0%} huid {:.0%}'.format(k.get('grijs', 0), k.get('donker', 0), k.get('huid', 0))]
    if 'iou' in d:
        regels.append(f"silhouet = speerman: IoU {d['iou']}")
    return regels


def blad_maken(kolommen, pad, titel):
    lt, lk, lm = blad.letter(20), blad.letter(14), blad.letter(13)
    kb, hg = 300, 560
    veld_h = 4 * KLEIN + 60
    hoogtes = [34, 72, hg + 20, 240, veld_h, 0.36 * KLEIN * 8 + 12, 124]
    Ht = int(sum(hoogtes))
    B = Image.new('RGBA', (len(kolommen) * (kb + 8) + 8, Ht), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    d.text((10, 8), titel, font=lt, fill=(240, 236, 228))
    metingen = {}
    for i, k in enumerate(kolommen):
        x = 8 + i * (kb + 8)
        y = hoogtes[0]
        d.text((x + 6, y), k['naam'], font=lt, fill=(240, 236, 228))
        for j, r in enumerate(k['uitleg'].split('\n')[:2]):
            d.text((x + 6, y + 26 + j * 17), r, font=lk, fill=(190, 184, 172))
        y += hoogtes[1]
        vak = Image.new('RGBA', (kb, hg + 20), SB.ACHTER)
        SB.plaats(vak, k['groot'], hg - 40, hg + 4, kb // 2 + 20)
        B.alpha_composite(vak, (x, y))
        y += hoogtes[2]
        vak = Image.new('RGBA', (kb, 236), SB.ACHTER)
        mb, mo, mx = SB.lijf(k['midden'])
        vak.alpha_composite(k['midden'], (round(kb // 2 + 20 - mx), round(228 - mo)))
        B.alpha_composite(vak, (x, y))
        d.text((x + 4, y + 2), '220 px', font=lm, fill=(60, 56, 50))
        y += hoogtes[3]
        kl = k['klein']
        veld = blad.tegelveld(kb, veld_h, TEGEL, 4 * KLEIN + 20)
        b_, o_, kx = SB.lijf(kl)
        veld.alpha_composite(kl, (round(36 - kx), round(4 * KLEIN + 20 - o_)))
        veld.alpha_composite(kl.resize((kl.width * 4, kl.height * 4), Image.NEAREST), (round(kb * 0.6 - kx * 4), round(4 * KLEIN + 40 - o_ * 4)))
        B.alpha_composite(veld, (x, y))
        y += hoogtes[4]
        kop = kop_van(kl)
        vak = Image.new('RGBA', (kb, int(hoogtes[5]) - 6), SB.ACHTER)
        vak.alpha_composite(kop, (max(0, (kb - kop.width) // 2), 2))
        B.alpha_composite(vak, (x, y))
        y += int(hoogtes[5])
        mt = meet(k['groot'], kl, None if k['naam'].startswith('speerman') else SPEL[k.get('richting', 'ZW')])
        metingen[k['naam']] = mt
        for j, r in enumerate(tekst_meting(mt)):
            d.text((x + 6, y + j * 17), r, font=lm, fill=(214, 208, 198))
    B.convert('RGB').save(pad)
    json.dump(metingen, open(pad[:-4] + '.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    for k in kolommen:
        if k.get('map') and not k['map'].endswith('.png') and not k['naam'].startswith('speerman'):
            k['klein'].save(os.path.join(k['map'], 'sprite-74.png'))
            k['midden'].save(os.path.join(k['map'], 'sprite-220.png'))
    print('BLAD', pad, json.dumps({n: {x: v for x, v in m.items() if x != 'kleuren'} for n, m in metingen.items()}))


def analyse(pad, tegen=None):
    """De speerman en ronde 11 (of `tegen`: een kolom zoals bij blad) groot op dezelfde lichaamshoogte, met lijnen om de
    tiende van de hoogte, en op 74 pixels 4x: wat breder, hoger of groter is, staat naast elkaar."""
    sp = kolom_van('speerman')
    r11 = kolom_van(tegen or os.path.join(U, 'humgen11') + '=ronde 11')
    hg, kb = 900, 470
    B = Image.new('RGBA', (2 * kb + 2 * 260 + 40, hg + 120), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    for i, k in enumerate((sp, r11)):
        vak = Image.new('RGBA', (kb, hg + 20), SB.ACHTER)
        SB.plaats(vak, k['groot'], hg - 60, hg, kb // 2 + 30)
        dv = ImageDraw.Draw(vak)
        for t in range(11):
            y = hg - (hg - 60) * t / 10
            dv.line((0, y, kb, y), fill=(255, 255, 255, 70), width=1)
            dv.text((4, y - 14), f'{t / 10:.1f}', font=blad.letter(12), fill=(255, 255, 255, 160))
        B.alpha_composite(vak, (10 + i * (kb + 10), 60))
        d.text((14 + i * (kb + 10), 14), k['naam'], font=blad.letter(22), fill=(240, 236, 228))
        kl = k['klein']
        g = kl.resize((kl.width * 4, kl.height * 4), Image.NEAREST)
        vak = Image.new('RGBA', (250, hg + 20), SB.ACHTER)
        b_, o_, kx = SB.lijf(g)
        vak.alpha_composite(g, (round(125 - kx), round(hg - o_)))
        B.alpha_composite(vak, (2 * kb + 30 + i * 260, 60))
        d.text((2 * kb + 34 + i * 260, 14), f"{k['naam']}, 74 px 4x", font=blad.letter(16), fill=(240, 236, 228))
    B.convert('RGB').save(pad)
    uit = {'speerman': meet(sp['groot'], sp['klein']), r11['naam']: meet(r11['groot'], r11['klein'], SPEL['ZW'])}
    for n in NAMEN:
        uit.setdefault('speerman_maten', {})[n] = {k: round(float(v), 3) for k, v in meten.maten(SPEL[n]).items()}
    json.dump(uit, open(pad[:-4] + '.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('ANALYSE', json.dumps(uit)[:1500])


def ds(map_, pad):
    """De verkleiningen op dezelfde render naast elkaar: lineair (ronde 8, nu), Lanczos, bicubic en box in sRGB, en de
    afwerking per materiaal (ronde 8)."""
    gr = lees(os.path.join(map_, 'stijlen', 'A8-30.png'))
    so = lees(os.path.join(map_, 'stijlen', 'soort-30.png'))
    kol = []
    for naam, uitleg in (('lineair', 'gemiddelde in lineair licht\n(ronde 8, tot nu toe)'), ('lanczos', 'Lanczos in sRGB'), ('bicubic', 'bicubisch in sRGB'),
                         ('box', 'gemiddelde in sRGB')):
        kol.append({'naam': naam, 'uitleg': uitleg, 'groot': gr, 'klein': verklein(gr, KLEIN, naam), 'midden': verklein(gr, 216, naam)})
    kol.append({'naam': 'per materiaal', 'uitleg': 'de afwerking van ronde 8\n(spriteafwerking.py)', 'groot': gr, 'klein': per_materiaal(gr, so),
                'midden': verklein(gr, 216)})
    scherp = verklein(gr, KLEIN, 'lanczos').filter(ImageFilter.UnsharpMask(1, 40, 2))
    kol.append({'naam': 'lanczos + scherp', 'uitleg': 'Lanczos en een lichte\nonscherpe maskering', 'groot': gr, 'klein': scherp, 'midden': verklein(gr, 216, 'lanczos')})
    blad_maken([kolom_van('speerman')] + kol, pad, 'Verkleinen: dezelfde render, zes manieren naar 74 pixels')
    for k in kol:
        k['klein'].save(os.path.join(os.path.dirname(pad), f"ds-{k['naam'].replace(' ', '')}.png"))


def supersampling(map_, pad, schalen):
    """Ronde 13 (Marcel: "Test 1x, 2x, 4x, 8x"): dezelfde render op een deel van de resolutie (stijlen.py met SCHAAL),
    elk naar dezelfde 74 pixels, lineair en per materiaal; bij 1 is het lijf zo'n 1000 pixels (14x de sprite)."""
    kol = []
    for s in schalen:
        staart = '' if s == '1' else f'-schaal{s}'
        gr = lees(os.path.join(map_, 'stijlen', f'A8-30{staart}.png'))
        so = lees(os.path.join(map_, 'stijlen', f'soort-30{staart}.png'))
        x = round(SA.lijf_hoogte(np.asarray(gr)[:, :, 3] / 255.0) / KLEIN, 1)
        kol.append({'naam': f'{x}x lineair', 'uitleg': f'render op {float(s) * 100:g}%', 'groot': gr, 'klein': verklein(gr, KLEIN), 'midden': verklein(gr, min(216, gr.height))})
        kol.append({'naam': f'{x}x per mat.', 'uitleg': 'per materiaal', 'groot': gr, 'klein': per_materiaal(gr, so), 'midden': verklein(gr, min(216, gr.height))})
    vierenzeventig([kolom_van('speerman')] + kol, pad, 'Supersampling: dezelfde soldaat op 1x tot 14x de spritemaat gerenderd, naar 74 pixels')


def richtingen(map_, pad):
    """De acht richtingen groot (A8, 30 graden) en op 74 pixels naast de cellen van de speerman uit het spel."""
    kb, hg = 230, 420
    B = Image.new('RGBA', (8 * (kb + 6) + 6, hg + 2 * (4 * KLEIN + 50) + 60), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    for i, n in enumerate(NAMEN):
        x = 6 + i * (kb + 6)
        gr = lees(os.path.join(map_, 'stijlen', f'A8-30-{n}.png'))
        so = lees(os.path.join(map_, 'stijlen', f'soort-30-{n}.png'))
        f = zonder_speer(gr, so)  # in NW telt de schacht achter het hoofd anders mee
        vak = Image.new('RGBA', (kb, hg), SB.ACHTER)
        SB.plaats(vak, gr, (hg - 40) * f, hg - 10, kb // 2 + 15)
        B.alpha_composite(vak, (x, 40))
        d.text((x + 6, 10), n, font=blad.letter(20), fill=(240, 236, 228))
        eigen = per_materiaal(gr, so, KLEIN * f)
        for j, kl in enumerate((eigen, SPEL[n])):
            veld = blad.tegelveld(kb, 4 * KLEIN + 44, TEGEL, 4 * KLEIN + 20)
            b_, o_, kx = SB.lijf(kl)
            veld.alpha_composite(kl, (round(30 - kx), round(4 * KLEIN + 20 - o_)))
            veld.alpha_composite(kl.resize((kl.width * 4, kl.height * 4), Image.NEAREST), (round(kb * 0.62 - kx * 4), round(4 * KLEIN + 40 - o_ * 4)))
            y = 50 + hg + j * (4 * KLEIN + 50)
            B.alpha_composite(veld, (x, y))
            d.text((x + 4, y + 2), 'ronde 12' if j == 0 else 'speerman', font=blad.letter(13), fill=(240, 236, 228))
    B.convert('RGB').save(pad)
    print('RICHTINGEN', pad)


def vierenzeventig(kolommen, pad, titel):
    """Alleen spelmaat: per kolom de sprite 1x en 4x op de tegels en het hoofd 8x, met de metingen; om veel varianten
    naast elkaar te zien."""
    kb = 200
    veld_h = 4 * KLEIN + 60
    kop_h = int(0.36 * KLEIN * 8) + 12
    B = Image.new('RGBA', (len(kolommen) * (kb + 6) + 6, 40 + 44 + veld_h + kop_h + 60), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    d.text((8, 8), titel, font=blad.letter(20), fill=(240, 236, 228))
    for i, k in enumerate(kolommen):
        x = 6 + i * (kb + 6)
        d.text((x + 4, 42), k['naam'], font=blad.letter(15), fill=(240, 236, 228))
        d.text((x + 4, 62), k['uitleg'].split('\n')[0], font=blad.letter(12), fill=(190, 184, 172))
        kl = k['klein']
        veld = blad.tegelveld(kb, veld_h, TEGEL, 4 * KLEIN + 20)
        b_, o_, kx = SB.lijf(kl)
        veld.alpha_composite(kl, (round(24 - kx), round(4 * KLEIN + 20 - o_)))
        veld.alpha_composite(kl.resize((kl.width * 4, kl.height * 4), Image.NEAREST), (round(kb * 0.6 - kx * 4), round(4 * KLEIN + 40 - o_ * 4)))
        B.alpha_composite(veld, (x, 84))
        kop = kop_van(kl, 6)
        vak = Image.new('RGBA', (kb, kop_h), SB.ACHTER)
        vak.alpha_composite(kop, (max(0, (kb - kop.width) // 2), 4))
        B.alpha_composite(vak, (x, 84 + veld_h))
        mt = meet(k['groot'], kl, None if k['naam'].startswith('speerman') else SPEL[k.get('richting', 'ZW')])
        regels = [f"huid {mt['huid_px']} px  grijs {mt['kleuren'].get('grijs', 0):.0%}", f"breed/hoog {mt['breed_hoog']}" + (f"  IoU {mt['iou']}" if 'iou' in mt else '')]
        for j, r in enumerate(regels):
            d.text((x + 4, 84 + veld_h + kop_h + 6 + j * 16), r, font=blad.letter(12), fill=(214, 208, 198))
    B.convert('RGB').save(pad)
    print('74', pad)


def instellingen(map_, pad):
    """Wat een render bepaalt, vastgelegd (Marcel: "Leg vast: camera, orthografische schaal, renderengine, belichting,
    kleurbeheer, materiaalinstellingen, modelversie, scriptversie, renderresolutie, downsamplingmethode")."""
    import hashlib
    import subprocess
    md5 = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()[:12]
    S = INST['soldaat']
    BM = os.path.join(HIER, '..', 'basismens')
    gr = Image.open(os.path.join(map_, 'stijlen', 'A8-30.png'))
    uit = {'camera': {k: v for k, v in INST['camera'].items() if not k.startswith('_')},
           'camera_stijlen': f'orthografisch, 30 graden boven de grond, ZW op de draai van de speerman (-40 graden); de render {gr.width} bij {gr.height}',
           'motor': f"Cycles (GPU), {S['stijlen']['A8']['monsters']} monsters per pixel (A8)",
           'licht': {k: v for k, v in S['licht'].items() if not k.startswith('_')},
           'licht_C': {k: v for k, v in S['stijlen']['C'].items() if k in ('zon_kleur', 'hoek', 'vul', 'vul_kleur', 'holte')},
           'kleurbeheer': {'view_transform': 'Standard', 'look': S['licht']['look'], 'belichting': S['licht']['belichting']},
           'materialen_A8': {k: v for k, v in S['stijlen']['A8'].items() if isinstance(v, dict)},
           'kleuren': S['kleuren'],
           'model': {'soldaat.blend': md5(os.path.join(map_, 'bron', 'soldaat.blend')), 'proeven': os.environ.get('BASISMENS_PROEF') or INST.get('proeven')},
           'scripts': {f: md5(os.path.join(BM, f)) for f in ('soldaat.py', 'stijlen.py', 'soldaat_render.py', 'render.py', 'variant.py')},
           'git': subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True, cwd=WORTEL).stdout.strip() + ' (met niet gecommitte wijzigingen)',
           'verkleinen': f'ronde8.sprite: het gemiddelde in lineair licht, voorvermenigvuldigd met de alfa, de alfa op de helft; lichaamshoogte {KLEIN} pixels (de speerman in ZW) en 216'}
    json.dump(uit, open(pad, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('INSTELLINGEN', pad)


if __name__ == '__main__':
    wat = sys.argv[1]
    if wat == 'instellingen':
        instellingen(sys.argv[2], sys.argv[3])
    if wat == 'analyse':
        analyse(sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else None)
    elif wat == 'blad':
        blad_maken([kolom_van(a) for a in sys.argv[4:]], sys.argv[2], sys.argv[3])
    elif wat == 'ss':
        supersampling(sys.argv[2], sys.argv[3], sys.argv[4:])
    elif wat == '74':
        vierenzeventig([kolom_van(a) for a in sys.argv[4:]], sys.argv[2], sys.argv[3])
    elif wat == 'ds':
        ds(sys.argv[2], sys.argv[3])
    elif wat == 'richtingen':
        richtingen(sys.argv[2], sys.argv[3])
