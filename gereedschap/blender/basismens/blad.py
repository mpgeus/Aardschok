# De basismens, stap 4: de atlas en de bladen (met PIL; de Python van ComfyUI, zoals de meetscripts).
# De atlas heeft de vorm van de vellen van het spel (beelden/beschrijving.json, figuren): de richtingen in rijen (Z, ZW,
# W, NW, N, NO, O, ZO), de beelden in kolommen, één cel voor alle richtingen (de rand om wat in alle acht staat) met het
# anker op de oorsprong van de man, en ernaast de beschrijving (bestand, beelden, fps, herhaal, cel, anker); een houding
# 'staan' (de rust, de A-houding) en 'idle'.
# De bladen:
# - contactblad.png: de rust in acht richtingen, de controle, de aanzichten met een maatlat, de buigtest;
# - contactblad-idle.png: hetzelfde voor de idle, met de idle op spelmaat;
# - vergelijking-elevatie.png: de idle op een raster van tegels bij elke elevatie, met de echte 2:1-ruit van het spel
#   over de middelste tegel, en de gemeten verhouding;
# - spelmaat.png: de idle verkleind tot de man in Z zo hoog is als de speerman in het spel (spelmaat.hoogte), op de
#   tegels van het spel, naast de speerman, op ware grootte en drie keer zo groot;
# - skinning-voor-na.png: de close-ups van de buigtest voor en na het gladmaken van de gewichten (als <uit>/voor er is).
#
#   python gereedschap/blender/basismens/blad.py
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
from variant import INST, UIT, WORTEL  # noqa: E402  (de instellingen en de map van de variant)
CAM = INST['camera']
NAMEN = [r['naam'] for r in INST['richtingen']['lijst']]
GROND = (118, 118, 122)
WIT = (255, 255, 255)
GEEL = (255, 210, 60)


def letter(grootte):
    for naam in ('arial.ttf', 'DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(naam, grootte)
        except OSError:
            pass
    return ImageFont.load_default()


def pad(*d):
    return os.path.join(UIT, *d)


def atlas():
    beschrijving = {'naam': 'basismens', 'richtingen': NAMEN, 'houdingen': {},
                    'pixels_per_meter': CAM['pixels_per_meter'], 'elevatie': CAM['elevatie']}
    os.makedirs(pad('atlas'), exist_ok=True)
    for houding, map_ in (('staan', 'renders'), ('idle', 'renders-idle')):
        beelden = [Image.open(pad(map_, f'richting-{r}.png')).convert('RGBA') for r in NAMEN]
        vakken = [b.split()[3].getbbox() for b in beelden]
        x0 = max(0, min(v[0] for v in vakken) - 2)
        y0 = max(0, min(v[1] for v in vakken) - 2)
        x1 = min(CAM['breed'], max(v[2] for v in vakken) + 2)
        y1 = min(CAM['hoog'], max(v[3] for v in vakken) + 2)
        cb, ch = x1 - x0, y1 - y0
        vel = Image.new('RGBA', (cb, ch * len(beelden)), (0, 0, 0, 0))
        for j, b in enumerate(beelden):
            vel.paste(b.crop((x0, y0, x1, y1)), (0, j * ch))
        bestand = f'basismens-{houding}.png'
        vel.save(pad('atlas', bestand))
        anker = [CAM['anker'][0] - x0, CAM['anker'][1] - y0]
        beschrijving['houdingen'][houding] = {'bestand': bestand, 'beelden': 1, 'fps': 4, 'herhaal': True,
                                              'cel': [cb, ch], 'anker': anker}
    # de rust bovenaan, zoals eerst (cel en anker van 'staan')
    beschrijving['cel'] = beschrijving['houdingen']['staan']['cel']
    beschrijving['anker'] = beschrijving['houdingen']['staan']['anker']
    json.dump(beschrijving, open(pad('atlas', 'basismens.json'), 'w', encoding='utf-8'), indent=1)
    return beschrijving


def vakje(bron, schaal, maatlat=False, onder=None, titel=None):
    """Een render op de grijze grond, verkleind; desgewenst met een maatlat (de aanzichten) en tekst."""
    b = Image.open(bron).convert('RGBA')
    w, h = round(b.width * schaal), round(b.height * schaal)
    v = Image.new('RGBA', (w, h), GROND + (255,))
    v.alpha_composite(b.resize((w, h), Image.LANCZOS))
    d = ImageDraw.Draw(v)
    if maatlat:
        for m in (0, 0.5, 1.0, 1.5, INST['lijf']['lengte']):
            yy = (CAM['anker_aanzicht'][1] - m * CAM['pixels_per_meter']) * schaal
            d.line((0, yy, w, yy), fill=GEEL + (220,) if m == INST['lijf']['lengte'] else WIT + (90,))
            d.text((w - 52, yy - 14), f'{m:.2f} m', font=letter(11), fill=WIT + (200,))
    if titel:
        d.text((4, 4), titel, font=letter(15), fill=WIT)
    if onder:
        d.text((4, h - 20), onder, font=letter(12), fill=WIT)
    return v


def rij(blad, beelden, x, y, tussen=10):
    for b in beelden:
        blad.paste(b.convert('RGB'), (x, y))
        x += b.width + tussen
    return max(b.height for b in beelden)


def contactblad(beschrijving, houding='rust'):
    schaal = 0.5
    w = 20 + 8 * (round(CAM['breed'] * schaal) + 10) + 10
    blad = Image.new('RGB', (w, 2400), (60, 60, 64))
    d = ImageDraw.Draw(blad)
    idle = houding == 'idle'
    renders, controle, voor = ('renders-idle', 'controle-idle', 'idle-') if idle else ('renders', 'controle', '')
    d.text((20, 14), f"Basismens{' in de idle' if idle else ''}: acht richtingen uit één model, één camera (elevatie "
           f"{CAM['elevatie']} graden, orthografisch, {CAM['pixels_per_meter']} pixels per meter)", font=letter(20), fill=WIT)
    y = 50
    lijst = INST['richtingen']['lijst']
    y += rij(blad, [vakje(pad(renders, f'richting-{r}.png'), schaal, titel=f"{r}  ({x['draai']:+d} graden)")
                    for r, x in zip(NAMEN, lijst)], 20, y) + 30
    d.text((20, y - 22), 'Controle: de rode band zit om zijn rechterarm', font=letter(16), fill=WIT)
    y += rij(blad, [vakje(pad(controle, f'markering-{r}.png'), schaal, titel=r) for r in NAMEN], 20, y) + 30
    d.text((20, y - 22), 'Aanzichten (de camera horizontaal, dezelfde schaal) met een maatlat', font=letter(16), fill=WIT)
    y += rij(blad, [vakje(pad('aanzichten', f'{voor}{k}.png'), schaal, maatlat=True, titel=k)
                    for k in ('voor', 'achter', 'links', 'rechts')], 20, y) + 30
    if idle:
        r = json.load(open(pad('renders.json'), encoding='utf-8'))['idle']['maten']
        d.text((20, y - 22), f"Op spelmaat ({INST['spelmaat']['hoogte']} pixels hoog in Z), op de tegels van het spel, "
               'bij beide elevaties; ware grootte en drie keer zo groot', font=letter(16), fill=WIT)
        for e in INST['vergelijking']['elevaties']:
            b = Image.open(pad('spelmaat', f'e{e:g}.png'))
            blad.paste(b, (20, y))
            groot = b.resize((b.width * 3, b.height * 3), Image.NEAREST)
            blad.paste(groot, (40 + b.width, y))
            d.text((20, y + b.height + 4), f'{e:g} graden', font=letter(14), fill=WIT)
            y += groot.height + 30
        d.text((20, y), f"Idle: de voeten {r['voeten_uit_elkaar'] * 100:.0f} cm uit elkaar, de polsen op "
               f"{abs(r['polsen']['L'][0]) * 100:.0f} cm van het midden, het laagste punt op {abs(r['laagste_punt']):.3f} m; "
               'de rust blijft de A-houding', font=letter(16), fill=WIT)
        y += 30
    else:
        standen = [s for s in INST['buigtest']['standen'] if not s.startswith('_')]
        d.text((20, y - 22), 'Buigtest (naar Z)', font=letter(16), fill=WIT)
        y += rij(blad, [vakje(pad('buigtest', f'{s}.png'), schaal * 0.8, titel=s) for s in standen], 20, y, 6) + 20
        a = beschrijving['houdingen']['staan']
        d.text((20, y), f"Atlas: cel {a['cel']}, anker {a['anker']}", font=letter(16), fill=WIT)
        y += 30
    blad.crop((0, 0, w, y + 10)).save(pad('contactblad-idle.png' if idle else 'contactblad.png'))


def tegelveld(breed, hoog, tegel, rij_y):
    """Een veld van tegels van het spel (64 bij 32), in ruiten zoals het spel ze legt."""
    veld = Image.new('RGBA', (breed, hoog), (40, 44, 36, 255))
    tw, th = tegel.size
    for i in range(-2, breed // (tw // 2) + 4):
        for j in range(-4, hoog // (th // 2) + 4):
            # oneven rijen een halve tegel opzij; de middens van de rij met de voeten liggen op rij_y
            veld.paste(tegel, (i * tw - (j % 2) * tw // 2, rij_y % th - th + j * th // 2), tegel)
    return veld


def spelmaat():
    """De idle op spelmaat per elevatie, op de tegels van het spel, naast de speerman uit het spel."""
    S = INST['spelmaat']
    tegel = Image.open(os.path.join(WORTEL, S['tegels'])).convert('RGBA').crop(tuple(S['tegel']))
    tw, th = tegel.size
    verslag = json.load(open(pad('renders.json'), encoding='utf-8'))
    fig = json.load(open(os.path.join(WORTEL, 'beelden', 'beschrijving.json'), encoding='utf-8'))['figuren']['speerman']
    st = fig['houdingen']['staan']
    speer = Image.open(os.path.join(WORTEL, S['speerman'])).convert('RGBA').crop((0, 0, st['cel'][0], st['cel'][1]))
    os.makedirs(pad('spelmaat'), exist_ok=True)
    uit = {}
    for e in INST['vergelijking']['elevaties']:
        map_ = pad('vergelijking', f'e{e:g}')
        f = S['hoogte'] / verslag['vergelijking'][f'{e:g}']['man_hoog_Z']
        klein = []
        for r in NAMEN:
            b = Image.open(os.path.join(map_, f'richting-{r}.png')).convert('RGBA')
            k = b.resize((round(b.width * f), round(b.height * f)), Image.LANCZOS)
            os.makedirs(pad('spelmaat', f'e{e:g}'), exist_ok=True)
            k.save(pad('spelmaat', f'e{e:g}', f'richting-{r}.png'))
            klein.append(k)
        ax, ay = CAM['anker'][0] * f, CAM['anker'][1] * f
        # negen plekken op een rij tegels (de middens van de tegels, een tegel uit elkaar), de speerman als eerste
        hoog = 130
        voet_y = hoog - 2 * th
        veld = tegelveld(9 * tw + tw, hoog, tegel, voet_y)
        xs = [tw + i * tw for i in range(9)]
        veld.alpha_composite(speer, (xs[0] - st['anker'][0], voet_y - st['anker'][1]))
        for x, k in zip(xs[1:], klein):
            veld.alpha_composite(k, (round(x - ax), round(voet_y - ay)))
        veld.save(pad('spelmaat', f'e{e:g}.png'))
        uit[f'{e:g}'] = {'schaal': round(f, 4), 'hoogte_Z': S['hoogte']}
    # het blad: per elevatie ware grootte en drie keer zo groot
    rijen = [Image.open(pad('spelmaat', f'e{e:g}.png')) for e in INST['vergelijking']['elevaties']]
    w = rijen[0].width * 4 + 60
    blad = Image.new('RGB', (w, 40 + sum(r.height * 3 + 40 for r in rijen)), (60, 60, 64))
    d = ImageDraw.Draw(blad)
    d.text((20, 10), f"Op spelmaat: de man {S['hoogte']} pixels hoog in Z, op de tegels van het spel (64 bij 32); "
           'links de speerman uit het spel, dan Z ZW W NW N NO O ZO', font=letter(16), fill=WIT)
    y = 40
    for e, r in zip(INST['vergelijking']['elevaties'], rijen):
        blad.paste(r.convert('RGB'), (20, y))
        blad.paste(r.resize((r.width * 3, r.height * 3), Image.NEAREST).convert('RGB'), (40 + r.width, y))
        d.text((20, y + r.height + 4), f'{e:g} graden', font=letter(15), fill=WIT)
        y += r.height * 3 + 40
    blad.save(pad('spelmaat.png'))
    return uit


def vergelijking():
    """De idle op een raster van tegels bij elke elevatie, met de 2:1-ruit van het spel over de middelste tegel."""
    V = INST['vergelijking']
    verslag = json.load(open(pad('renders.json'), encoding='utf-8'))['vergelijking']
    schaal = 0.6
    rijen = []
    for e in V['elevaties']:
        m = verslag[f'{e:g}']
        beelden = []
        for r in NAMEN[:3]:
            b = Image.open(pad('vergelijking', f'e{e:g}', f'op-tegels-{r}.png')).convert('RGBA')
            v = Image.new('RGBA', b.size, GROND + (255,))
            v.alpha_composite(b)
            d = ImageDraw.Draw(v)
            # de ruit van een tegel van 2:1 even breed als de gerenderde tegel, om het anker (de middelste tegel)
            hb = V['tegel_zijde'] * math.sqrt(2) / 2 * CAM['pixels_per_meter']
            ax, ay = CAM['anker']
            d.polygon([(ax - hb, ay), (ax, ay - hb / 2), (ax + hb, ay), (ax, ay + hb / 2)], outline=GEEL + (255,), width=3)
            v = v.resize((round(v.width * schaal), round(v.height * schaal)), Image.LANCZOS)
            ImageDraw.Draw(v).text((6, 6), r, font=letter(16), fill=WIT)
            beelden.append(v)
        rijen.append((e, m, beelden))
    w = 20 + 3 * (round(CAM['breed'] * schaal) + 10) + 330
    blad = Image.new('RGB', (w, 70 + len(rijen) * (round(CAM['hoog'] * schaal) + 40)), (60, 60, 64))
    d = ImageDraw.Draw(blad)
    d.text((20, 12), 'Elevatie: de idle op tegels om 45 graden, dezelfde schaal en hetzelfde licht. Geel: een tegel van 2:1 '
           '(64 bij 32), zoals in het spel, even breed als de tegel eronder', font=letter(16), fill=WIT)
    y = 50
    for e, m, beelden in rijen:
        rij(blad, beelden, 20, y)
        tx = 20 + 3 * (beelden[0].width + 10) + 10
        past = abs(m['verhouding'] - 0.5) < 0.01
        d.text((tx, y + 10), f'{e:g} graden', font=letter(22), fill=WIT)
        d.text((tx, y + 44), f"tegel gemeten: {m['tegel_breed']} bij {m['tegel_hoog']} px", font=letter(15), fill=WIT)
        d.text((tx, y + 66), f"hoog / breed = {m['verhouding']:.3f}", font=letter(15), fill=WIT)
        d.text((tx, y + 88), f"(sin {e:g} = {m['sin_elevatie']:.3f}; 2:1 is 0,500)", font=letter(15), fill=WIT)
        d.text((tx, y + 118), 'past op de tegels van het spel' if past else 'past niet: de tegels worden hoger dan 2:1',
               font=letter(16), fill=(120, 230, 140) if past else (255, 150, 120))
        d.text((tx, y + 140), f"de man in Z: {m['man_hoog_Z']} px hoog", font=letter(15), fill=WIT)
        y += beelden[0].height + 40
    blad.save(pad('vergelijking-elevatie.png'))


def skinning():
    """De close-ups voor en na het gladmaken, met de rek per gebied."""
    voor = pad('voor', 'dichtbij', 'dichtbij.json')
    if not os.path.exists(voor):
        return
    v = json.load(open(voor, encoding='utf-8'))
    n = json.load(open(pad('renders.json'), encoding='utf-8'))['dichtbij']
    standen = list(n)
    k = 300
    blad = Image.new('RGB', (20 + len(standen) * (k + 10), 60 + 2 * (k + 70)), (60, 60, 64))
    d = ImageDraw.Draw(blad)
    d.text((20, 12), 'Skinning: boven voor, onder na het gladmaken van de gewichten (kruis, heupen, oksels); de rek per gebied '
           '(grootste, 99e percentiel, aandeel randen boven 2 keer)', font=letter(16), fill=WIT)
    for i, s in enumerate(standen):
        for j, (map_, meting) in enumerate(((pad('voor', 'dichtbij'), v[s]['meting']), (pad('buigtest'), n[s]['meting']))):
            x, y = 20 + i * (k + 10), 50 + j * (k + 70)
            b = Image.open(os.path.join(map_, f'dichtbij-{s}.png')).convert('RGBA').resize((k, k), Image.LANCZOS)
            vlak = Image.new('RGBA', (k, k), GROND + (255,))
            vlak.alpha_composite(b)
            blad.paste(vlak.convert('RGB'), (x, y))
            d.text((x + 4, y + 4), f"{s} ({n[s]['gebied']})", font=letter(14), fill=WIT)
            d.text((x, y + k + 4), f"rek {meting['rek_max']:.1f} / p99 {meting['rek_p99']:.2f} / {meting['boven_2'] * 100:.1f}%",
                   font=letter(14), fill=WIT)
    blad.save(pad('skinning-voor-na.png'))


if __name__ == '__main__':
    b = atlas()
    contactblad(b)
    spelmaat()
    contactblad(b, 'idle')
    vergelijking()
    skinning()
    print('BLAD klaar')
