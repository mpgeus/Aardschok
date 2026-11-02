# Marcels gebouwplaten naar het spel (Marcel, 1 nov: "Wat gebouwen"; docs/art/hunyuan/PLAAT-EISEN.md). Een gebouw staat vast, en het schuine aanzicht heeft al de camera van het spel, dus het hoeft niet door TripoSplat: los van het grijs, op de maat van de voet, met de deur naar vier kanten (schuin van voren en van achteren, en die gespiegeld) en vijf bouwfasen, uit een eigen plaat zodra die er is. Schrijft tegels/platen/, tegels/platen-fasen/ en tegels/platen.js.
#
#   python gebouw_vel.py [plaat=<map voor de controleplaat>]
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ni

R = 'C:/Users/mpgeu/Desktop/Claude Code/Aardschok/'
PLAAT = R + 'docs/art/referentie/aardschok-gebouw-'
UIT = R + 'tegels/platen/'
# eigen map: gereedschap/pixelart/bouwfasen.cjs maakt tegels/bouwfasen/ eerst leeg
UIT_FASEN = R + 'tegels/platen-fasen/'
TEGEL_B, TEGEL_H = 64, 32
ANKER_ONDER = TEGEL_H // 2  # het anker van een tekening is het midden van zijn achterste tegel (T.naarScherm), een halve tegel onder de bovenste hoek van de voet
ALLE_STIJLEN = ['wit', 'oker', 'planken', 'roze']
# Per gebouw: de soort, de voet in tegels, of de deur in ZW links staat (anders spiegelen we), de bovenkant van de schoorsteen waar de rook van de plaat begint (in de plaat, per aanzicht), en waar het spel zijn eigen rook laat beginnen. `vervangt`: dit wordt de tekening van die soort; zonder is het een vorm erbij, alleen onder dat dak. Het rieten huis is de hut (Marcel, 2 nov: "Een hut"); de plankenstijl houdt haar eigen hutten, want die bouwt haar hele gehucht onder spanen (T.bouwstijlen, js/bouwstijl.js).
GEBOUWEN = {
    'burcht': {'soort': 'raadhuis', 'n': 7, 'links': True, 'vervangt': True},
    'bakkerij': {'soort': 'bakkerij', 'n': 7, 'links': True, 'vervangt': True, 'top': {'ZW': 237, 'NW': 243}, 'rook': {'ZW': (445, 240), 'NW': (925, 246)}},
    'molen': {'soort': 'molen', 'n': 6, 'links': True, 'vervangt': True},
    'stal': {'soort': 'stal', 'n': 6, 'links': False, 'vervangt': True},
    'huis-riet': {'soort': 'hut', 'vorm': 'hutriet', 'dak': 'riet', 'stijlen': ['wit', 'oker', 'roze'], 'n': 6, 'links': True, 'vervangt': True, 'top':{'ZW': 247, 'NW': 246}, 'rook': {'ZW': (435, 250), 'NW': (925, 249)}, 'zonder-voet': {'top': {'ZW': 232, 'NW': 239}, 'rook': {'ZW': (424, 243), 'NW': (920, 248)}}},
}
# Marcel, 2 nov: "Ik laat de ronde voeten om de gebouwen verwijderen". De plaat met gras blijft de maat (daaraan meten we de voet), de plaat <naam>-zonder-voet.png geeft het beeld; dus dezelfde plaat met het gebouw op dezelfde plek.
ZONDER_VOET = '-zonder-voet'
SCHADUW_KLEUR, SCHADUW_STERK = 10, 1.5  # de schaduw op zo'n plaat: hoe weinig kleur (steen is warmer), en hoeveel sterker dan op het grijs
# het zoekvak van een aanzicht op de plaat: de echte rand is de kolom met de minste figuur daar vlakbij
VAK = {'ZW': (262, 526), 'NW': (748, 998)}
# De bouwfasen van een eigen plaat, docs/art/referentie/aardschok-gebouw-<naam>-fasen-zw.png en -nw.png (prompt-bouwfasen.txt): vijf stadia op een rij.
FASE_NAMEN = ('terrein', 'fundering', 'skelet', 'muren', 'dak')
GAT_VERSCHIL, GAT_KLEUR, GAT_MIN = 24, 8, 12  # het grijs tussen de balken: hoe ver van de achtergrond, hoe weinig kleur, en hoeveel pixels bij elkaar
# De noodoplossing zolang een gebouw die plaat niet heeft: hoe hoog de muren al staan, als deel van de hoogte van het gebouw. De eerste is de fundering.
FASEN = (('fundering', 0.0), ('muren', 0.2), ('muren', 0.42), ('steigers', 0.64), ('half-gedekt', 0.86))
WANDEN_BINNEN = 0.74  # de muren staan zoveel van de rand van de voet, gerekend vanuit het midden
HOUT = (112, 78, 46)
STEEN = (168.0, 158.0, 140.0)
KUIL = (96, 76, 52)
ZOOM_RUIS = 7


def los(im, vak, y_onder):
    """De figuur los van het grijs: wat vanaf de rand van het vak grijs is en grijs blijft, gaat weg. Wat de zijkanten van het vak raakt en niet het gebouw is, is de buurman op de plaat."""
    x0, x1 = vak
    a = im[:y_onder, x0:x1].astype(np.float64)
    bg = np.median(np.concatenate([a[:20].reshape(-1, 3), a[-6:].reshape(-1, 3)]), axis=0)
    verz = a.max(2) - a.min(2)
    grijs = (np.abs(a - bg).sum(2) < 42) & (verz < 16)
    lab, _ = ni.label(grijs)
    rand = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    weg = np.isin(lab, rand[rand > 0])
    weg = ni.binary_opening(weg, iterations=1) | (weg & ~ni.binary_dilation(~weg, iterations=1))
    alfa = ni.gaussian_filter((~weg).astype(np.float32), 0.7)
    alfa = np.clip((alfa - 0.35) / 0.3, 0, 1)
    stuk, n = ni.label(alfa > 0.5)
    if n > 1:
        tel = ni.sum(np.ones_like(stuk), stuk, range(1, n + 1))
        grootste = 1 + int(np.argmax(tel))
        for i in set(np.unique(np.concatenate([stuk[:, 0], stuk[:, 1], stuk[:, -2], stuk[:, -1]]))) - {0, grootste}:
            alfa = alfa * (stuk != i)
    return a, alfa


def groter(rgba, s):
    """Alfa-gewogen vergroten, zodat de rand niet naar het grijs trekt, en daarna wat scherper."""
    w, h = round(rgba.width * s), round(rgba.height * s)
    arr = np.asarray(rgba, dtype=np.float32) / 255
    pm = np.dstack([arr[:, :, :3] * arr[:, :, 3:4], arr[:, :, 3]])
    pm2 = np.dstack([np.asarray(Image.fromarray(pm[:, :, i]).resize((w, h), Image.LANCZOS)) for i in range(4)])
    al = np.clip(pm2[:, :, 3], 1e-4, 1)
    rgb = np.clip(pm2[:, :, :3] / al[:, :, None], 0, 1)
    uit = Image.fromarray((np.dstack([rgb, np.clip(pm2[:, :, 3], 0, 1)]) * 255).astype(np.uint8), 'RGBA')
    r, g, b, a = uit.split()
    uit = Image.merge('RGB', (r, g, b)).filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    uit.putalpha(a)
    return uit


def grasvoet(alfa, y_onder):
    """De schijf onder het gebouw: de breedste rij op de onderste helft. Geeft zijn breedte en zijn midden."""
    hg = alfa > 0.5
    hg[: int(y_onder * 0.5)] = False
    br = [np.ptp(np.nonzero(r)[0]) if r.any() else 0 for r in hg]
    xr = np.nonzero(hg[int(np.argmax(br))])[0]
    breed = int(np.ptp(xr))
    return breed, float(xr.min() + xr.max()) / 2, float(y_onder - breed / 4)


def vak_op(im, zicht):
    """Het vak van een aanzicht op de plaat, en de onderste rij van de figuur daarin."""
    bg = np.median(im[:20].reshape(-1, 3), axis=0)
    f_ = (np.abs(im.astype(float) - bg).sum(2) > 60) & ((im.max(2).astype(int) - im.min(2)) > 22)
    v0, v1 = VAK[zicht]
    prof = ni.uniform_filter1d(f_.sum(0).astype(float), 3)
    vak = (v0 - 12 + int(np.argmin(prof[v0 - 12:v0 + 20])), v1 - 20 + int(np.argmin(prof[v1 - 20:v1 + 12])))
    return vak, int(np.nonzero(f_[:, vak[0]:vak[1]].sum(1) > 2)[0].max())


def aanzicht(naam, g, zicht):
    """Eén aanzicht van de plaat, op de maat van de voet: het beeld, de plek van de bovenste hoek van de voet, en de schoorsteen ten opzichte van die hoek."""
    im = np.asarray(Image.open(f'{PLAAT}{naam}-draai.png').convert('RGB'))
    vak, y_onder = vak_op(im, zicht)
    a, alfa = los(im, vak, y_onder + 12)
    breed, cx, cy = grasvoet(alfa, y_onder)
    zonder = f'{PLAAT}{naam}-draai{ZONDER_VOET}.png'
    if os.path.exists(zonder):
        im = np.asarray(Image.open(zonder).convert('RGB'))
        vak_oud = vak
        vak, y_onder = vak_op(im, zicht)
        a, alfa = los(im, vak, y_onder + 12)
        bg_z = np.median(im[:20].reshape(-1, 3), axis=0)
        a, alfa = echte_schaduw(a, zonder_gaten(a, alfa, bg_z), bg_z)
        cx += vak_oud[0] - vak[0]
        g = {**g, **g.get('zonder-voet', {})}
    if zicht in g.get('top', {}):
        alfa[:g['top'][zicht]] = 0
    n = g['n']
    s = 2 * n * TEGEL_B / 2 / breed
    rgba = Image.fromarray(np.dstack([a, alfa * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
    bb = rgba.getbbox()
    uit = groter(rgba.crop(bb), s)
    ax, ay = (cx - bb[0]) * s, (cy - bb[1]) * s - 2 * n * TEGEL_H / 4
    # strak: het vergroten laat een rand zonder iets erop
    ys, xs = np.nonzero(np.asarray(uit)[:, :, 3])
    x0, y0 = int(xs.min()), int(ys.min())
    uit = uit.crop((x0, y0, int(xs.max()) + 1, int(ys.max()) + 1))
    ax, ay = ax - x0, ay - y0
    rook = None
    if zicht in g.get('rook', {}):
        px, py = g['rook'][zicht]
        rook = [(px - vak[0] - bb[0]) * s - ax, (py - bb[1]) * s - ay]
    return uit, ax, ay, rook, s


def spiegel(im, ax, ay, rook):
    return im.transpose(Image.FLIP_LEFT_RIGHT), im.width - ax, ay, ([-rook[0], rook[1]] if rook else None)


def grond_onder(x, ax, ay, n, deel):
    """De onderkant van de muren op kolom x: de punt van de ruit naar je toe, ingekort tot waar de muren staan. Twee rechte lijnen, zoals op de kaart."""
    midy = ay + n * TEGEL_H / 2
    return midy + (n * TEGEL_H / 2 - np.abs(x - ax) / 2) * deel


def fasen(im, ax, ay, n, gras=True):
    """De vijf bouwfasen: de fundering op de grasvoet (`gras`: een gebouw zonder voet krijgt die ook hier niet), en dan de muren die van onderaf oprijzen, langs de lijnen van de voet en niet recht over het beeld. Met steigers tot het dak erop ligt."""
    w, h = im.size
    a = np.asarray(im, dtype=np.float32)
    alfa = a[:, :, 3] / 255
    xs, ys = np.meshgrid(np.arange(w), np.arange(h))
    onder = grond_onder(xs, ax, ay, n, WANDEN_BINNEN)
    hoogte = onder - ys
    h_max = float(np.percentile(hoogte[alfa > 0.5], 99.5))
    # de kleur van de grond en van de steen, uit het beeld zelf
    voor = alfa > 0.9
    laag = voor & (hoogte < -6) & (a[:, :, 1] > a[:, :, 0] * 0.95) & (a[:, :, 1] > a[:, :, 2] * 1.25)
    grond = np.median(a[laag][:, :3], axis=0) if laag.sum() > 50 else np.array((120.0, 130.0, 60.0))
    steen = np.array(STEEN)
    midx, midy = ax, ay + n * TEGEL_H / 2
    bodem = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    t = ImageDraw.Draw(bodem)
    rx, ry = n * TEGEL_B / 2, n * TEGEL_H / 2
    if gras:
        t.ellipse((midx - rx, midy - ry, midx + rx, midy + ry), fill=tuple(int(c) for c in grond) + (255,))
    # de kuil en de stenen van de fundering
    d = WANDEN_BINNEN + 0.04
    ruit = [(midx, midy - ry * d), (midx + rx * d, midy), (midx, midy + ry * d), (midx - rx * d, midy)]
    t.polygon(ruit, fill=KUIL + (255,))
    for j in range(4):
        p, q = ruit[j], ruit[(j + 1) % 4]
        for k in range(3):
            t.line([(p[0], p[1] - k * 2), (q[0], q[1] - k * 2)], fill=tuple(int(c * (0.78 + 0.1 * k)) for c in steen) + (255,), width=3)
    bodem = np.asarray(bodem.filter(ImageFilter.GaussianBlur(0.8)), dtype=np.float32).copy()
    r = np.random.default_rng(3)
    # wat al op de grond ligt in de plaat (de stenen voor de deur, het gras) blijft staan
    ruis = r.uniform(-1, 1, w // ZOOM_RUIS + 2)
    ruis = ruis[(xs // ZOOM_RUIS)] * 5
    uit = []
    for naam, deel in FASEN:
        H = deel * h_max
        grens = H + (ruis if deel > 0 else 0)
        toon = ni.gaussian_filter((hoogte < grens).astype(np.float32), 0.6) if deel > 0 else (hoogte < -2).astype(np.float32)
        # wat los in de lucht zou hangen (de tip van een wiek), komt pas als het eraan vastzit
        if deel > 0:
            stuk, aantal = ni.label(alfa * toon > 0.3)
            if aantal > 1:
                tel = ni.sum(np.ones_like(stuk), stuk, range(1, aantal + 1))
                toon = toon * ni.binary_dilation(stuk == 1 + int(np.argmax(tel)), iterations=1)
        wa = (alfa * toon)[:, :, None]
        beeld = a[:, :, :3] * wa + bodem[:, :, :3] * (bodem[:, :, 3:4] / 255) * (1 - wa)
        al = wa[:, :, 0] + (bodem[:, :, 3] / 255) * (1 - wa[:, :, 0])
        rgb = beeld / np.maximum(al[:, :, None], 1e-4)
        f = Image.fromarray(np.dstack([rgb, al * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
        if 0 < deel < 0.8:
            # steigers om de twee muren naar je toe, tot net boven wat er staat
            t = ImageDraw.Draw(f)
            for fx in (-0.86, -0.42, 0.0, 0.42, 0.86):
                x = midx + rx * WANDEN_BINNEN * fx
                y0 = float(grond_onder(x, ax, ay, n, WANDEN_BINNEN + 0.05))
                y1 = y0 - H - 14
                t.line([(x, y0), (x, y1)], fill=HOUT + (255,), width=3)
                t.line([(x + 1, y0), (x + 1, y1)], fill=tuple(int(c * 1.25) for c in HOUT) + (255,), width=1)
            for hg in (0.45, 0.95):
                pts = [(midx + rx * WANDEN_BINNEN * fx, float(grond_onder(midx + rx * WANDEN_BINNEN * fx, ax, ay, n, WANDEN_BINNEN + 0.05)) - H * hg) for fx in (-0.92, 0.0, 0.92)]
                t.line(pts, fill=tuple(int(c * 1.15) for c in HOUT) + (255,), width=3)
        uit.append((naam, f))
    return uit


def zonder_gaten(a, alfa, bg):
    """Het grijs tussen de balken hangt niet aan de rand, dus los() ziet het niet. Steen heeft ook weinig kleur, maar is lichter of donkerder."""
    grijs = (np.abs(a - bg).sum(2) < GAT_VERSCHIL) & (a.max(2) - a.min(2) < GAT_KLEUR)
    lab, k = ni.label(grijs)
    tel = ni.sum(np.ones_like(lab), lab, range(1, k + 1))
    gaten = np.isin(lab, 1 + np.nonzero(tel >= GAT_MIN)[0]) & (alfa > 0.5)
    return alfa * (1 - np.clip(ni.gaussian_filter(ni.binary_dilation(gaten, iterations=1).astype(np.float32), 0.6) * 1.6, 0, 1))


def echte_schaduw(a, alfa, bg):
    """Een plaat zonder voet heeft zijn schaduw op het grijs, en die zou een grijze plaat om het gebouw worden: wat vanaf de rand kleurloos is en niet lichter dan het grijs, wordt zwart en doorzichtig, zo sterk als het op het grijs was."""
    licht = a.mean(2)
    b = float(bg.mean())
    stil = ((a.max(2) - a.min(2)) < SCHADUW_KLEUR) & (licht < b + 6)
    lab, _ = ni.label(stil)
    rand = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    weg = np.isin(lab, rand[rand > 0])
    dekking = np.clip((b - licht - 3) / b * SCHADUW_STERK, 0, 0.7)
    a = a.copy()
    a[weg] = 0
    return a, np.where(weg, np.where(dekking < 0.04, 0, dekking), alfa)


def fasen_van_plaat(naam, zicht, n):
    """De vijf stadia van een eigen plaat, op één maat, elk op zijn eigen grasvoet uitgelijnd. Geeft de fasen en de plek van de bovenste hoek van de voet, of None zonder plaat."""
    pad = f'{PLAAT}{naam}-fasen-{zicht.lower()}.png'
    if not os.path.exists(pad):
        return None
    im = np.asarray(Image.open(pad).convert('RGB'))
    bg = np.median(im[:20].reshape(-1, 3), axis=0)
    f_ = np.abs(im.astype(float) - bg).sum(2) > 60
    # de cijfers staan eronder, los van de figuren
    rijen = np.nonzero(f_.sum(1))[0]
    y_onder = int(max(np.split(rijen, np.nonzero(np.diff(rijen) > 1)[0] + 1), key=len)[-1])
    kol = np.nonzero(f_[:y_onder + 1].sum(0))[0]
    stukken = [k for k in np.split(kol, np.nonzero(np.diff(kol) > 1)[0] + 1) if len(k) > 50]
    assert len(stukken) == len(FASE_NAMEN), f'{pad}: {len(stukken)} stadia'
    zonder = pad[:-4] + ZONDER_VOET + '.png'
    beeld = np.asarray(Image.open(zonder).convert('RGB')) if os.path.exists(zonder) else None
    stadia = []
    for k in stukken:
        vak = (int(k[0]) - 3, int(k[-1]) + 4)
        a, alfa = los(im, vak, y_onder + 12)
        alfa = zonder_gaten(a, alfa, bg)
        breed, cx, cy = grasvoet(alfa, int(np.nonzero((alfa > 0.5).any(1))[0].max()))
        if beeld is not None:
            a, alfa = los(beeld, vak, y_onder + 12)
            bg_z = np.median(beeld[:20].reshape(-1, 3), axis=0)
            a, alfa = echte_schaduw(a, zonder_gaten(a, alfa, bg_z), bg_z)
        s = n * TEGEL_B / breed
        rgba = Image.fromarray(np.dstack([a, alfa * 255]).clip(0, 255).astype(np.uint8), 'RGBA')
        bb = rgba.getbbox()
        stadia.append((groter(rgba.crop(bb), s), (cx - bb[0]) * s, (cy - bb[1]) * s))
    links, boven = max(x[1] for x in stadia), max(x[2] for x in stadia)
    b = round(links + max(f.width - cx for f, cx, _ in stadia)) + 1
    h = round(boven + max(f.height - cy for f, _, cy in stadia)) + 1
    lijst = []
    for nm, (f, cx, cy) in zip(FASE_NAMEN, stadia):
        vel = Image.new('RGBA', (b, h), (0, 0, 0, 0))
        vel.paste(f, (round(links - cx), round(boven - cy)))
        lijst.append((nm, vel))
    return lijst, round(links), round(boven - n * TEGEL_H / 2)


def spiegel_fasen(lijst, ax, ay):
    return [(nm, f.transpose(Image.FLIP_LEFT_RIGHT)) for nm, f in lijst], lijst[0][1].width - ax, ay


def vel_fasen(naam_t, lijst, ax, ay, n):
    """De fasen onder elkaar op één vel, in 256 kleuren: ze duren kort, en het zijn er veel."""
    bb = [f.getbbox() for _, f in lijst]
    b = max(x[2] - x[0] for x in bb)
    h = sum(x[3] - x[1] for x in bb)
    vel = Image.new('RGBA', (b, h), (0, 0, 0, 0))
    y = 0
    data = []
    for (nm, f), q in zip(lijst, bb):
        vel.paste(f.crop(q), (0, y))
        data.append({'x': 0, 'y': y, 'b': q[2] - q[0], 'h': q[3] - q[1], 'anker': [round(ax - q[0]), round(ay + ANKER_ONDER - q[1])], 'naam': nm})
        y += q[3] - q[1]
    os.makedirs(UIT_FASEN, exist_ok=True)
    vel.quantize(256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(f'{UIT_FASEN}{naam_t}.png', optimize=True)
    return {'gebouw': None, 'beslaat': [n, n], 'bestand': f'platen-fasen/{naam_t}.png', 'fasen': data}


def main():
    arg = dict(a.split('=', 1) for a in sys.argv[1:] if '=' in a)
    os.makedirs(UIT, exist_ok=True)
    tegels, bouwfasen = [], {}
    controle = []
    for naam, g in GEBOUWEN.items():
        n = g['n']
        vz = aanzicht(naam, g, 'ZW')
        z = vz[:4] if g['links'] else spiegel(*vz[:4])
        o = spiegel(*z)
        w_ = aanzicht(naam, g, 'NW')[:4]
        nn = spiegel(*w_)
        print(naam, 'schaal', round(vz[4], 2), 'cel', z[0].size)
        fz = fasen_van_plaat(naam, 'ZW', n)
        if fz and not g['links']:
            fz = spiegel_fasen(*fz)
        fw = fasen_van_plaat(naam, 'NW', n)
        van_plaat = {'z': fz, 'o': fz and spiegel_fasen(*fz), 'w': fw, 'n': fw and spiegel_fasen(*fw)}
        for kant, (im, ax, ay, rook), deur in (('z', z, [n // 2, n]), ('o', o, [n, n // 2]), ('n', nn, [n // 2, -1]), ('w', w_, [-1, n // 2])):
            naam_t = f'{naam}-{kant}'
            im.save(f'{UIT}{naam_t}.png', optimize=True)
            ax_, ay_ = round(ax), round(ay)
            anker = [ax_, ay_ + ANKER_ONDER]
            t = {'naam': naam_t, 'vast': True, 'beslaat': [n, n], 'groep': None, 'staat': None, 'deur': deur, 'doos': [anker[0], anker[1], im.width - anker[0], im.height - anker[1]],
                 'stijl': {'stijl': g.get('stijlen', ALLE_STIJLEN)[0], 'ook': g.get('stijlen', ALLE_STIJLEN)[1:], 'vorm': g.get('vorm', g['soort']), 'soort': g['soort'], 'dak': g.get('dak', 'plaat'), 'steen': None, 'stand': kant},
                 'bestand': f'tegels/platen/{naam_t}.png', 'cel': [0, 0, im.width, im.height], 'anker': anker}
            if g.get('vervangt'):
                t['stijl']['vervangt'] = True
            if rook:
                t['schoorsteen'] = [round(rook[0]), round(rook[1]) - ANKER_ONDER]
            tegels.append(t)
            fs, fx, fy = van_plaat[kant] or (fasen(im, ax_, ay_, n, gras=not os.path.exists(f'{PLAAT}{naam}-draai{ZONDER_VOET}.png')), ax_, ay_)
            bf = vel_fasen(naam_t, fs, fx, fy, n)
            bf['gebouw'] = g['soort']
            bouwfasen[naam_t] = bf
            if kant == 'z':
                controle.append((n, fs, fx, fy, im, ax_, ay_))
    kop = '// Gemaakt door gereedschap/blender/stijl/proef/gebouw_vel.py, uit de platen van Marcel — niet met de hand bijwerken.\n// Een vel naast tegels.js (npm run tiled schrijft dat opnieuw): per gebouw de deur naar vier kanten, met de stijl die js/bouwstijl.js leest, en hun bouwfasen.\n'
    with open(R + 'tegels/platen.js', 'w', encoding='utf8', newline='\n') as f:
        f.write(kop + '(function (T) {\n  T.TEGELS.platen = ' + json.dumps({'tsx': None, 'ingepakt': True, 'perTekening': True, 'tiles': tegels}, ensure_ascii=False) + ';\n  Object.assign(T.BOUWFASEN.fasen, ' + json.dumps(bouwfasen, ensure_ascii=False) + ');\n})(globalThis.Spel = globalThis.Spel || {});\n')
    grootte = sum(os.path.getsize(os.path.join(p, x)) for m in (UIT, UIT_FASEN) for p, _, fl in os.walk(m) for x in fl)
    print('tegels', len(tegels), 'samen', round(grootte / 1e6, 1), 'MB')
    if 'plaat' in arg:
        vak_b, vak_h = 440, 640
        d = Image.new('RGB', (vak_b * 6, vak_h * len(controle)), (92, 130, 62))
        for j, (n, fs, fx, fy, im, ax, ay) in enumerate(controle):
            for i, (f, x, y) in enumerate([(f, fx, fy) for _, f in fs] + [(im, ax, ay)]):
                d.paste(f, (i * vak_b + 220 - x, j * vak_h + 520 - y - n * TEGEL_H // 2), f)
        d.save(arg['plaat'])


if __name__ == '__main__':
    main()
