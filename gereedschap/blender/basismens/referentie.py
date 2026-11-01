# De speerman als referentie, gemeten (Marcel, 29 okt, ronde 6: "Analyseer de referentie alsof je een professioneel
# 3D-personage moet reconstrueren uit concept art", en "Maak een reproduceerbare visuele vergelijking met de oorspronkelijke
# referentie"). Eén meting voor de speerman en voor de soldaat, zodat ze vergelijkbaar zijn:
# - elk beeld geschaald op dezelfde lichaamshoogte zonder speer (400 pixels), de voeten op één lijn en het lijf midden;
# - de delen uit de kleur (HSV) en de plek, voor beide op dezelfde manier: de speer (wat buiten het lijf valt, meten.masker),
#   de tabberd (verzadigd geel en blauw), de helm (grijs bovenaan, tot net onder de bovenkant van het gezicht), het gezicht
#   (huidkleur), de gambeson (bruin tussen schouders en heupen, niet de tabberd), de handschoenen (donkerbruin op
#   heuphoogte), de laarzen (bruin in het onderste kwart);
# - per deel de overlap (IoU) met de speerman, de maten in pixels en als deel van de hoogte, en de mediane kleur (Lab) met
#   het verschil (ΔE).
# Wat uit de kleur komt, is een benadering: elke maat krijgt een betrouwbaarheid. De beschrijving per deel (BESCHRIJVING)
# is wat het oog op het vel en de render van de speerman ziet; de maten zet het script erbij.
#
#   python gereedschap/blender/basismens/referentie.py
# leest de speerman (de render van zijn vel, 15 graden, en dezelfde op 30) en de soldaat (<uit>/stijlen/C-15.png en C-30.png,
# stijlen.py op de camera van de speerman); schrijft <uit>/stijlen/reference_analysis.json, vergelijking.json,
# silhouet.png (de overlap per deel) en spelmaat.png (op 74 pixels).
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

WORTEL = blad.WORTEL
MAP = os.path.join(variant.UIT, 'stijlen')
SPEERMAN = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'blender', 'render')
H = 400  # de lichaamshoogte waarop alles gemeten wordt
DELEN = ('helm', 'gezicht', 'gambeson', 'tabberd', 'handschoenen', 'laarzen', 'speer')

BESCHRIJVING = {
    'helm': {'vorm': 'ketelhoed: een hoge, ronde koepel (een halve bol, bijna zo hoog als breed) met een kam van voor naar achter en twee naden opzij, een korte punt bovenop; de rand smal (zo’n anderhalf keer de koepel), wat zakkend, achteraan lager',
             'kleur': 'staal, lichtgrijs tot middengrijs met donkere vlekken; de onderkant van de rand donker', 'materiaal': 'gesmeed staal, half glanzend: het licht van de lucht bovenop, donker onderaan',
             'positie': 'laag op het hoofd: de rand net boven de wenkbrauwen, het gezicht komt er van voren onder uit',
             'licht': 'bovenkant licht (de lucht), links (de zon) een glimlicht, de rand werpt geen schaduw op het gezicht',
             'silhouet': 'het breedste en lichtste deel boven de schouders; de koepel steekt hoog uit', 'op_74px': 'een lichtgrijze koepel met een donkere onderrand: het herkenningspunt',
             'aanpassing': 'koepel hoger en ronder (een halve bol), de rand smaller (1,45 keer de koepel) en lager, kam en naden, geen schaduw op het gezicht',
             'waargenomen': ['koepel hoog en rond', 'kam', 'rand smal en zakkend', 'licht van boven'], 'aanname': ['twee naden opzij (op het vel niet te zien, wel in de render)']},
    'gezicht': {'vorm': 'breed, met een volle baard en snor die de mond bedekken; de neus groot; de ogen in de schaduw van de wenkbrauwen',
                'kleur': 'warme huid, rozig bruin; de baard donker grijsbruin', 'materiaal': 'huid en haar',
                'positie': 'onder de rand, tussen de wangstukken van de maliënkap', 'licht': 'de linkerkant lichter, onder de neus en de wenkbrauwen schaduw',
                'silhouet': 'binnen het silhouet', 'op_74px': 'een huidkleurige vlek van een paar pixels met een donkere baard eronder',
                'aanpassing': 'het gezicht onder de rand zichtbaar houden: de helm lager achter op het hoofd, de rand smaller; kaak breder, wenkbrauwen zwaarder',
                'waargenomen': ['baard over de mond', 'huid zichtbaar onder de rand'], 'aanname': ['de vorm van de kaak (de baard bedekt hem)']},
    'gambeson': {'vorm': 'dikke gewatteerde mouwen met ruiten, wijd bij de schouders, de onderarmen massief', 'kleur': 'roodbruin, warm; donkerbruin in de naden',
                 'materiaal': 'stof, mat, gewatteerd', 'positie': 'de mouwen naast de tabberd, van de schouders tot de handschoenen',
                 'licht': 'elke ruit een eigen licht en schaduw', 'silhouet': 'de armen maken het silhouet breed en zwaar',
                 'op_74px': 'een roodbruine massa met wat streepjes', 'aanpassing': 'mouwen dikker bij de schouders en de onderarmen',
                 'waargenomen': ['ruiten', 'dikke mouwen'], 'aanname': []},
    'tabberd': {'vorm': 'gevierendeeld, tot even boven de knie, onder de riem een rok met plooien; aan de zijkant open', 'kleur': 'goudgeel en koningsblauw',
                'materiaal': 'linnen, mat', 'positie': 'over de gambeson, vast onder de riem', 'licht': 'de plooien geven schaduwbanen; de zon van links',
                'silhouet': 'de rok een trapezium, breder bij de zoom', 'op_74px': 'vier duidelijke vlakken geel en blauw',
                'aanpassing': 'de zoom hoger (net boven de knie), plooien vanaf de riem, dikker naar de zoom',
                'waargenomen': ['in ZW: zijn rechterborst (links in beeld) geel, zijn linkerborst blauw; onder de riem andersom'],
                'aanname': ['de rug volgt dezelfde indeling']},
    'handschoenen': {'vorm': 'grote leren handschoenen met kappen over de mouw', 'kleur': 'donkerbruin', 'materiaal': 'leer, zacht glanzend',
                     'positie': 'rechts om de speer, links los naast de heup', 'licht': 'glimlicht op de knokkels', 'silhouet': 'de vuisten groot',
                     'op_74px': 'twee donkere blokjes van een paar pixels', 'aanpassing': 'groter, met kappen', 'waargenomen': ['grote vuisten'], 'aanname': []},
    'laarzen': {'vorm': 'hoge laarzen met een omgeslagen rand, een ronde maar duidelijke neus, een hak; wijd uit elkaar', 'kleur': 'donker roodbruin, de omslag lichter',
                'materiaal': 'leer', 'positie': 'de benen kort, de laarzen tot onder de knie, de voeten op schouderbreedte', 'licht': 'glim op de neus en de omslag',
                'silhouet': 'twee zware voeten, breed uit elkaar', 'op_74px': 'twee bruine blokken met een lichtere rand bovenaan',
                'aanpassing': 'de voeten verder uit elkaar, de neus duidelijker, de laarzen donkerder', 'waargenomen': ['wijde stand', 'omslag'], 'aanname': []},
    'speer': {'vorm': 'rechtop in de rechtervuist, de voet op de grond; een bladvormige punt met een middenrib, een koperen omwikkeling onder de tule',
              'kleur': 'roodbruine schacht, lichtgrijs blad', 'materiaal': 'hout en staal', 'positie': 'aan zijn rechterkant (links in beeld in ZW)',
              'licht': 'het blad licht', 'silhouet': 'een dunne lijn boven het hoofd uit', 'op_74px': 'een lijn van 1 à 2 pixels met een lichte punt',
              'aanpassing': 'de lengte als in de meting', 'waargenomen': ['rechtop', 'koperen omwikkeling'], 'aanname': []},
}


def lees(p):
    return Image.open(p).convert('RGBA')


def normaal(im):
    """`im` geschaald op lichaamshoogte H, op een doek met de voeten op een vaste lijn en het lijf in het midden."""
    f = min(1.0, 110 / im.height)
    klein = im.resize((max(1, round(im.width * f)), round(im.height * f)), Image.BOX)
    m, _ = meten.masker(klein)
    ys, xs = np.nonzero(m)
    boven, onder, cx = ys.min() / f, (ys.max() + 1) / f, (xs.mean() + 0.5) / f
    s = H / (onder - boven)
    g = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    doek = Image.new('RGBA', (2 * H, round(1.8 * H)))
    doek.alpha_composite(g, (round(H - cx * s), round(doek.height - 20 - onder * s)))
    lijf = Image.fromarray((m * 255).astype(np.uint8)).resize(klein.size).resize((round(im.width * s), round(im.height * s)), Image.NEAREST)
    lijfdoek = Image.new('L', doek.size)
    lijfdoek.paste(lijf, (round(H - cx * s), round(doek.height - 20 - onder * s)))
    return doek, np.asarray(lijfdoek) > 127


def hsv(a):
    rgb = a[:, :, :3].astype(np.float64) / 255
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    d = mx - mn
    h = np.zeros_like(mx)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    k = d > 1e-6
    h = np.where(k & (mx == r), ((g - b) / np.maximum(d, 1e-6)) % 6, h)
    h = np.where(k & (mx == g), (b - r) / np.maximum(d, 1e-6) + 2, h)
    h = np.where(k & (mx == b), (r - g) / np.maximum(d, 1e-6) + 4, h)
    return h * 60, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx


def delen(doek, lijf_grof):
    """De delen uit de kleur en de plek (zie boven), elk een masker op het doek."""
    a = np.asarray(doek)
    alfa = a[:, :, 3] >= 128
    lijf = alfa & np.pad(lijf_grof, 3, mode='edge')[3:-3, 3:-3]  # het lijf zonder speer, op de rand van het grove masker
    for _ in range(4):  # het grove masker (een pixel van 110 is er hier 4) wat ruimer, alleen binnen de figuur
        g = lijf.copy()
        g[1:] |= lijf[:-1]
        g[:-1] |= lijf[1:]
        g[:, 1:] |= lijf[:, :-1]
        g[:, :-1] |= lijf[:, 1:]
        lijf = g & alfa
    h, s, v = hsv(a)
    ys = np.nonzero(lijf.any(axis=1))[0]
    top, bodem = ys.min(), ys.max() + 1
    rij = np.arange(a.shape[0])[:, None] * np.ones((1, a.shape[1]))
    t = (rij - top) / (bodem - top)  # 0 bovenaan, 1 bij de voeten
    m = {'lijf': lijf, 'speer': alfa & ~lijf}
    geel = (h > 30) & (h < 62) & (s > 0.45) & (v > 0.35)
    blauw = (h > 195) & (h < 250) & (s > 0.35) & (v > 0.2)
    m['tabberd'] = lijf & (geel | blauw) & (t > 0.15) & (t < 0.85)
    # de tabberd houdt op bij de zoom: het laagste geel (een blauwe broek eronder is geen tabberd)
    gy = np.nonzero((m['tabberd'] & geel).any(axis=1))[0]
    if len(gy):
        m['tabberd'] &= rij <= gy.max() + 0.015 * (bodem - top)
    huid = lijf & (h > 8) & (h < 38) & (s > 0.22) & (s < 0.62) & (v > 0.45) & (t < 0.4)
    # ronde 7: alleen de huid die vastzit aan de bovenste rij huid (het gezicht), ook in de schaduw van de rand, onder de
    # helm en boven de schouders: een belichte gambeson is ook oranjebruin
    rijen = np.nonzero(huid.sum(axis=1) >= 3)[0]
    if len(rijen):
        kol = np.nonzero((lijf & (s < 0.28) & (t < 0.2)).any(axis=0))[0]
        binnen = np.zeros_like(lijf)
        binnen[:, kol.min():kol.max() + 1] = True
        huid = lijf & (h > 8) & (h < 38) & (s > 0.22) & (s < 0.65) & (v > 0.3) & (t < 0.3) & binnen
        g = huid & (rij <= rijen.min() + 2)
        for _ in range(400):
            n_ = g.copy()
            n_[1:] |= g[:-1]
            n_[:-1] |= g[1:]
            n_[:, 1:] |= g[:, :-1]
            n_[:, :-1] |= g[:, 1:]
            n_ &= huid
            if (n_ == g).all():
                break
            g = n_
        huid = g
        rijen = np.nonzero(huid.sum(axis=1) >= 3)[0]
    gezicht_boven = rijen.min() if len(rijen) else top + 0.15 * (bodem - top)
    m['gezicht'] = huid
    m['helm'] = lijf & (s < 0.28) & (rij < gezicht_boven + 0.02 * (bodem - top))
    bruin = lijf & (h < 42) & (s > 0.3) & ~m['tabberd']
    m['gambeson'] = bruin & (v > 0.18) & (t > 0.18) & (t < 0.62)
    m['handschoenen'] = bruin & (v <= 0.33) & (t > 0.38) & (t < 0.66)
    m['gambeson'] &= ~m['handschoenen']
    m['laarzen'] = lijf & (h < 45) & (s > 0.25) & (t > 0.74)
    # de maliënkraag (ronde 7): grijs onder het gezicht tot de schouders (wat naast het gezicht onder de rand zit, telt
    # niet mee: daar lopen helm, kap en baard door elkaar)
    onder = rijen.max() if len(rijen) else top + 0.2 * (bodem - top)
    m['kraag'] = lijf & (s < 0.3) & (v > 0.1) & (rij > onder) & (t < 0.42) & ~m['helm'] & ~huid
    return m, (top, bodem)


def lab(rgb):
    c = rgb / 255
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    X = c @ np.array([0.4124, 0.3576, 0.1805]) / 0.95047
    Y = c @ np.array([0.2126, 0.7152, 0.0722])
    Z = c @ np.array([0.0193, 0.1192, 0.9505]) / 1.08883
    f = lambda x: np.where(x > 0.008856, np.cbrt(x), 7.787 * x + 16 / 116)
    return np.stack([116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))], axis=-1)


def maten(doek, m, rijen):
    """De maten in pixels (op H = 400), en per deel de mediane kleur in Lab."""
    top, bodem = rijen
    a = np.asarray(doek)
    bb = lambda x: (lambda ys, xs: (ys.min(), ys.max() + 1, xs.min(), xs.max() + 1) if len(ys) else None)(*np.nonzero(x))
    uit = {'hoogte_lijf': int(bodem - top)}
    alle = bb(a[:, :, 3] >= 128)
    uit['hoogte_met_speer'] = int(bodem - alle[0])
    hb = bb(m['helm'])
    if hb:
        uit['helm_hoog'], uit['helm_breed'] = int(hb[1] - hb[0]), int(hb[3] - hb[2])
    gz = bb(m['gezicht'])
    tb = bb(m['tabberd'])
    if gz and hb:
        uit['hoofd_hoog'] = int(gz[1] - top)  # van de kruin van de helm tot onder het gezicht
    if tb:
        uit['tabberd_lang'] = int(tb[1] - tb[0])
        uit['romp_lang'] = int(tb[1] - (gz[1] if gz else top))
        uit['been_lang'] = int(bodem - tb[1])
    sch = m['lijf'][int(top + 0.22 * (bodem - top)):int(top + 0.36 * (bodem - top))]
    uit['schouders_breed'] = int(max(np.ptp(r.nonzero()[0]) + 1 if r.any() else 0 for r in sch))
    kb = bb(m['kraag'])
    if kb:
        uit['kraag_hoog'] = int(kb[1] - kb[0])
        uit['kraag_breed'] = int(max(np.ptp(r.nonzero()[0]) + 1 if r.any() else 0 for r in m['kraag']))
    voet = m['laarzen'][int(bodem - 0.06 * (bodem - top)):int(bodem)]
    uit['voeten_breed'] = int(max(np.ptp(r.nonzero()[0]) + 1 if r.any() else 0 for r in voet)) if voet.any() else 0
    uit = {k: (v, round(v / (bodem - top), 3)) for k, v in uit.items()}
    kleur = {}
    for d in DELEN:
        px = a[:, :, :3][m[d]]
        if len(px) >= 20:
            kleur[d] = [round(float(x), 1) for x in np.median(lab(px.astype(np.float64)), axis=0)]
    geel = m['tabberd'] & (hsv(a)[0] < 80)
    for naam, k in (('tabberd_geel', geel), ('tabberd_blauw', m['tabberd'] & ~geel)):
        px = a[:, :, :3][k]
        if len(px) >= 20:
            kleur[naam] = [round(float(x), 1) for x in np.median(lab(px.astype(np.float64)), axis=0)]
    return uit, kleur


def iou(a, b):
    u = (a | b).sum()
    return round(float((a & b).sum() / u), 3) if u else None


def figuur(pad):
    doek, lijf = normaal(lees(pad))
    m, rijen = delen(doek, lijf)
    mt, kl = maten(doek, m, rijen)
    # ronde 7: hoeveel pixels gezicht en kraag je ziet (op een lichaamshoogte van H)
    return {'doek': doek, 'm': m, 'maten': mt, 'kleur': kl, 'vlak': {d: int(m[d].sum()) for d in ('gezicht', 'kraag', 'helm')}}


def silhouetblad(paren, naam):
    """Per paar (titel, speerman, soldaat) het silhouet per deel: grijs allebei, blauw alleen de speerman, rood alleen de
    soldaat."""
    lt = blad.letter(16)
    kolommen = ['alles', 'lijf', 'helm', 'tabberd', 'laarzen', 'speer']
    w, h = 2 * H // 2, round(1.8 * H) // 2
    B = Image.new('RGB', (len(kolommen) * (w + 8) + 8, len(paren) * (h + 40) + 8), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for i, (titel, a, b) in enumerate(paren):
        for j, k in enumerate(kolommen):
            ma = (np.asarray(a['doek'])[:, :, 3] >= 128) if k == 'alles' else a['m'][k]
            mb = (np.asarray(b['doek'])[:, :, 3] >= 128) if k == 'alles' else b['m'][k]
            kl = np.full(ma.shape + (3,), 150, np.uint8)
            kl[:] = (150, 145, 136)
            kl[ma & mb] = (90, 90, 90)
            kl[ma & ~mb] = (60, 130, 230)
            kl[~ma & mb] = (220, 70, 50)
            x, y = 8 + j * (w + 8), 8 + i * (h + 40)
            B.paste(Image.fromarray(kl).resize((w, h), Image.NEAREST), (x, y + 30))
            d.text((x + 4, y + 6), f'{titel}: {k} {iou(ma, mb)}', font=lt, fill=(235, 230, 222))
    B.save(os.path.join(MAP, naam))


def main():
    spel = soldaat_blad.speerman()[0]['ZW']
    ref = {'15': figuur(os.path.join(SPEERMAN, 'eigen-ZW-staan.png')), '30': figuur(os.path.join(SPEERMAN, 'eigen-ZW-iso-staan.png'))}
    analyse = {'bron': {'15': 'gereedschap/pixelart/uit/blender/render/eigen-ZW-staan.png (de render waar het vel van het spel uit komt; de camera 15 graden, 40 graden gedraaid)',
                        '30': 'eigen-ZW-iso-staan.png (dezelfde speerman op 30 graden)', 'vel': 'beelden/figuren/speerman3d-staan.png, ZW'},
               'methode': 'alles op een lichaamshoogte zonder speer van 400 pixels; de delen uit kleur en plek (referentie.py); maten in pixels en als deel van de lichaamshoogte',
               'betrouwbaarheid': {'lijf, speer, tabberd': 'hoog (eenduidige kleur of vorm)', 'helm, laarzen': 'middel (grijs en bruin, begrensd op plek)',
                                   'gezicht, gambeson, handschoenen': 'laag (de huid, de mouwen en het leer liggen dicht bij elkaar in kleur)'},
               'maten': {e: r['maten'] for e, r in ref.items()}, 'kleur_lab': {e: r['kleur'] for e, r in ref.items()},
               'vel_74px': {'lijf': int(soldaat_blad_lijf(spel)), 'cel': list(spel.size)},
               'delen': BESCHRIJVING}
    analyse['speer_tot_lijf'] = {e: round(r['maten']['hoogte_met_speer'][0] / r['maten']['hoogte_lijf'][0], 3) for e, r in ref.items()}
    json.dump(analyse, open(os.path.join(MAP, 'reference_analysis.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    uit = {'referentie': {e: {'maten': r['maten'], 'kleur': r['kleur']} for e, r in ref.items()}}
    paren = []
    for naam in sys.argv[1:] or ['C-15', 'C-30']:
        p = os.path.join(MAP, naam + '.png')
        if not os.path.exists(p):
            continue
        e = '15' if '15' in naam else '30'
        s = figuur(p)
        r = ref[e]
        uit[naam] = {'iou': {k: iou((np.asarray(r['doek'])[:, :, 3] >= 128) if k == 'alles' else r['m'][k],
                                    (np.asarray(s['doek'])[:, :, 3] >= 128) if k == 'alles' else s['m'][k])
                             for k in ('alles', 'lijf', 'helm', 'tabberd', 'laarzen', 'speer')},
                     'maten': s['maten'],
                     'maten_verschil': {k: round(s['maten'][k][1] - r['maten'][k][1], 3) for k in s['maten'] if k in r['maten']},
                     'kleur': s['kleur'],
                     'delta_e': {k: round(float(np.linalg.norm(np.array(s['kleur'][k]) - np.array(r['kleur'][k]))), 1)
                                 for k in s['kleur'] if k in r['kleur']}}
        paren.append((naam, r, s))
    if paren:
        silhouetblad(paren, 'silhouet.png')
    json.dump(uit, open(os.path.join(MAP, 'vergelijking.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('REFERENTIE', json.dumps({k: v for k, v in uit.items() if k != 'referentie'}, ensure_ascii=False)[:3000])
    print('REF', json.dumps(analyse['maten'], ensure_ascii=False), json.dumps(analyse['speer_tot_lijf']))


def soldaat_blad_lijf(cel):
    m, _ = meten.masker(cel)
    ys = np.nonzero(m.any(axis=1))[0]
    return ys.max() + 1 - ys.min()


if __name__ == '__main__':
    main()
