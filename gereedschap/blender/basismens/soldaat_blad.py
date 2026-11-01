# De soldaat, de bladen (Marcel, 28 okt, ronde 3; met PIL, de Python van ComfyUI, zoals blad.py):
# - contactblad-soldaat.png: de acht richtingen, de controle met de rode band, de doorsteektoets, en de spelmaat;
# - vergelijking-speerman.png: per richting de speerman uit het spel en de soldaat, even hoog, vier keer zo groot;
# - spelmaat-soldaat.png: de soldaat op spelmaat (de man in Z spelmaat.hoogte pixels, zonder de speer gemeten) op de
#   tegels van het spel, naast de speerman, op ware grootte en drie keer zo groot;
# - groot-soldaat.png: de grote render uit ZW en de close-ups (de stof, het leer, het staal);
# - uitgelegd-soldaat.png: alle onderdelen naast elkaar, met hun naam en hun driehoeken;
# - vergelijking-realtime.png (ronde 4): per richting de bron, soldaat.glb en soldaat-realtime.glb (opnieuw ingelezen, met
#   hun gebakken texturen), ook op spelmaat, met hoeveel hun silhouetten op spelmaat overlappen (realtime-silhouet.json),
#   en de close-ups van de bron naast die van de realtime GLB.
# Op spelmaat verkleind zoals de vellen van het spel (spelvel.cel): BOX, de doorzichtigheid op de helft afgekapt, en de
# rand donkerder (vergelijk.rand).
#
#   python gereedschap/blender/basismens/soldaat_blad.py
import json
import os
import sys

from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(1, os.path.dirname(HIER))
import blad  # noqa: E402
import variant  # noqa: E402
import vergelijk  # noqa: E402  (de rand van de vellen van het spel)

INST, WORTEL, NAMEN, WIT, GROND = blad.INST, blad.WORTEL, blad.NAMEN, blad.WIT, blad.GROND
SC = INST['soldaat']['camera']
pad = lambda *d: blad.pad('soldaat', *d)
NAAM = {'lijf': 'lijf (wat over is)', 'broek': 'broek (extra)', 'gambeson': 'gambeson', 'laarzen': 'laarzen',
        'tabberd': 'tabberd', 'handschoenen': 'handschoenen', 'riem': 'riem en gesp', 'buidel': 'buidel', 'helm': 'ketelhoed',
        'malienkraag': 'maliënkraag', 'baard': 'baard', 'ogen': 'ogen',
        'speer': 'speer'}


def op_grond(b, kleur=GROND):
    v = Image.new('RGBA', b.size, kleur + (255,))
    v.alpha_composite(b.convert('RGBA'))
    return v


def klein(b, f):
    """Verkleind zoals een vel van het spel: BOX, de doorzichtigheid op de helft afgekapt, de rand donkerder."""
    k = b.resize((max(1, round(b.width * f)), max(1, round(b.height * f))), Image.BOX)
    k.putalpha(k.getchannel('A').point(lambda v: 255 if v >= 128 else 0))
    return vergelijk.rand(k)


def spelmaat():
    """De soldaat op spelmaat in acht richtingen (en de schaal), naar <uit>/soldaat/spelmaat/."""
    r = json.load(open(blad.pad('soldaat-renders.json'), encoding='utf-8'))
    f = INST['spelmaat']['hoogte'] / r['zonder_speer_Z'][1]
    os.makedirs(pad('spelmaat'), exist_ok=True)
    uit = []
    for n in NAMEN:
        k = klein(Image.open(pad('renders', f'richting-{n}.png')).convert('RGBA'), f)
        k.save(pad('spelmaat', f'richting-{n}.png'))
        uit.append(k)
    k = klein(Image.open(pad('zonder-speer-Z.png')).convert('RGBA'), f)
    k.save(pad('spelmaat', 'zonder-speer-Z.png'))
    return f, uit


def speerman():
    """De speerman uit het spel: per richting zijn cel uit het vel, en zijn anker."""
    S = INST['spelmaat']
    fig = json.load(open(os.path.join(WORTEL, 'beelden', 'beschrijving.json'), encoding='utf-8'))['figuren']['speerman']
    st = fig['houdingen']['staan']
    cb, ch = st['cel']
    vel = Image.open(os.path.join(WORTEL, S['speerman'])).convert('RGBA')
    volgorde = fig.get('richtingen', NAMEN)
    return {n: vel.crop((0, volgorde.index(n) * ch, cb, (volgorde.index(n) + 1) * ch)) for n in NAMEN}, st['anker']


def spelmaat_blad(f, kleintjes):
    S = INST['spelmaat']
    tegel = Image.open(os.path.join(WORTEL, S['tegels'])).convert('RGBA').crop(tuple(S['tegel']))
    tw, th = tegel.size
    cellen, anker = speerman()
    ax, ay = SC['anker'][0] * f, SC['anker'][1] * f
    hoog = 150
    voet_y = hoog - 2 * th
    rijen = []
    for naam, met_speerman in (('naast de speerman', True), ('alleen', False)):
        veld = blad.tegelveld(9 * tw + tw, hoog, tegel, voet_y)
        xs = [tw + i * tw for i in range(9)]
        if met_speerman:
            veld.alpha_composite(cellen['Z'], (xs[0] - anker[0], voet_y - anker[1]))
            plek = xs[1:]
        else:
            plek = xs[:8]
        for x, k in zip(plek, kleintjes):
            veld.alpha_composite(k, (round(x - ax), round(voet_y - ay)))
        rijen.append(veld)
    w = rijen[0].width * 4 + 60
    b = Image.new('RGB', (w, 50 + sum(r.height * 3 + 40 for r in rijen)), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 12), f"De soldaat op spelmaat: de man (zonder speer) {S['hoogte']} pixels hoog in Z, verkleind zoals de vellen "
           f"van het spel, op de tegels van het spel. Boven links de speerman uit het spel, dan Z ZW W NW N NO O ZO", font=blad.letter(16), fill=WIT)
    y = 46
    for r in rijen:
        b.paste(r.convert('RGB'), (20, y))
        b.paste(r.resize((r.width * 3, r.height * 3), Image.NEAREST).convert('RGB'), (40 + r.width, y))
        y += r.height * 3 + 40
    b.save(blad.pad('spelmaat-soldaat.png'))


def vergelijking(f, kleintjes):
    """Per richting de speerman uit het spel en de soldaat, in een cel even groot, vier keer vergroot."""
    cellen, anker = speerman()
    cb, ch = next(iter(cellen.values())).size
    ax, ay = SC['anker'][0] * f, SC['anker'][1] * f
    s = 4
    w = 20 + 8 * (cb * s * 2 + 30)
    b = Image.new('RGB', (w, 120 + ch * s + 40), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 12), 'De speerman uit het spel (links) en de soldaat uit de basismens (rechts), per richting, op spelmaat in '
           'een cel van het spel, vier keer vergroot', font=blad.letter(16), fill=WIT)
    wie = ('de gedrongen soldaat (ronde 4) heeft een groter hoofd, kortere benen en een bredere romp, op hetzelfde skelet'
           if variant.NAAM == 'gedrongen' else 'de basismens is een gewone man van 1,75 m')
    d.text((20, 36), f'De speerman is gedrongen (een groot hoofd, korte benen); {wie}. '
           'Het vel van de generator wisselt de kleuren van de tabberd per richting; de soldaat niet.', font=blad.letter(14), fill=WIT)
    for i, n in enumerate(NAMEN):
        x = 20 + i * (cb * s * 2 + 30)
        cel = Image.new('RGBA', (cb, ch), (0, 0, 0, 0))
        cel.alpha_composite(kleintjes[i], (round(anker[0] - ax), round(anker[1] - ay)))
        for j, c in enumerate((cellen[n], cel)):
            g = op_grond(c, (92, 96, 90)).resize((cb * s, ch * s), Image.NEAREST)
            b.paste(g.convert('RGB'), (x + j * (cb * s + 4), 70))
        d.text((x, 70 + ch * s + 8), n, font=blad.letter(16), fill=WIT)
    b.save(blad.pad('vergelijking-speerman.png'))


def contactblad(f, kleintjes):
    r = json.load(open(blad.pad('soldaat-renders.json'), encoding='utf-8'))
    so = json.load(open(blad.pad('soldaat.json'), encoding='utf-8'))
    schaal = 0.5
    bw, bh = round(SC['breed'] * schaal), round(SC['hoog'] * schaal)
    w = 20 + 8 * (bw + 10) + 10
    b = Image.new('RGB', (w, 3000), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 14), f"De soldaat uit de basismens: acht richtingen uit één model, één camera (elevatie {INST['camera']['elevatie']} "
           f"graden, orthografisch, {INST['camera']['pixels_per_meter']} pixels per meter), het licht van de vellen van het spel",
           font=blad.letter(20), fill=WIT)
    y = 50
    lijst = INST['richtingen']['lijst']
    y += blad.rij(b, [blad.vakje(pad('renders', f'richting-{n}.png'), schaal, titel=f"{n}  ({x['draai']:+d} graden)")
                      for n, x in zip(NAMEN, lijst)], 20, y) + 30
    d.text((20, y - 22), 'Controle: de rode band zit om zijn rechterarm, de speer in zijn rechterhand', font=blad.letter(16), fill=WIT)
    y += blad.rij(b, [blad.vakje(pad('controle', f'markering-{n}.png'), schaal, titel=n) for n in NAMEN], 20, y) + 30
    tot = sum(r['doorsteek'][n]['pixels'] for n in NAMEN)
    huid = sum(r['doorsteek'][n].get('lijf_pixels', 0) for n in NAMEN)
    d.text((20, y - 22), f'Doorsteek in de idle: kleren die onder een laag erboven horen gloeien magenta ({tot} pixels zichtbaar), '
           f'de huid eronder cyaan ({huid}); zonder tabberd: {r["doorsteek"]["tegenproef_zonder_tabberd"]["pixels"]}',
           font=blad.letter(16), fill=WIT)
    y += blad.rij(b, [blad.vakje(pad('doorsteek', f'richting-{n}.png'), schaal,
                                 titel=f"{n}: {r['doorsteek'][n]['pixels']} / {r['doorsteek'][n].get('lijf_pixels', 0)}")
                      for n in NAMEN], 20, y) + 30
    d.text((20, y - 22), f"Op spelmaat: de man {INST['spelmaat']['hoogte']} pixels hoog in Z (zonder speer); ware grootte en drie "
           'keer zo groot', font=blad.letter(16), fill=WIT)
    x = 20
    for k in kleintjes:
        g = op_grond(k)
        b.paste(g.convert('RGB'), (x, y))
        b.paste(g.resize((g.width * 3, g.height * 3), Image.NEAREST).convert('RGB'), (x, y + g.height + 6))
        x += g.width * 3 + 12
    y += kleintjes[0].height * 4 + 30
    lz = r['lijf_zichtbaar']
    tri = so['driehoeken']
    for regel in (
            f"Onderdelen: {', '.join(f'{k} {v}' for k, v in tri.items())} driehoeken (samen {sum(tri.values())})",
            f"Het lijf onder de kleren weg: {so['lijf_vlakken']['weg']} van {so['lijf_vlakken']['voor']} vlakken; van de "
            f"{lz['vlakken']} die over zijn, zie je er {lz['ooit_gezien']} in minstens één richting",
            f"De speer: de vuist op {so['speer']['vuist'][2]:.2f} m, de voet op {so['speer']['voet_z']:.3f} m, aan "
            f"{so['speer']['ouder']} aan het bot {so['speer']['bot']}"):
        d.text((20, y), regel, font=blad.letter(15), fill=WIT)
        y += 24
    b.crop((0, 0, w, y + 10)).save(blad.pad('contactblad-soldaat.png'))


DICHTBIJ = ('hoofd', 'gezicht', 'romp', 'vuist', 'laarzen')


def groot():
    g = op_grond(Image.open(pad('groot.png')))
    k = 400
    dicht = [op_grond(Image.open(pad(f'dichtbij-{n}.png'))).resize((k, k), Image.LANCZOS) for n in DICHTBIJ]
    w = 40 + g.width + 20 + 2 * (k + 10)
    b = Image.new('RGB', (w, 60 + max(g.height, 3 * (k + 40))), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 14), 'De soldaat van dichtbij: de grote render uit ZW (640 pixels per meter) en close-ups van de helm, het '
           'gezicht (recht van voren), de romp, de vuist en de laarzen', font=blad.letter(18), fill=WIT)
    b.paste(g.convert('RGB'), (20, 50))
    for i, (n, c) in enumerate(zip(DICHTBIJ, dicht)):
        x, y = 40 + g.width + (i % 2) * (k + 10), 50 + (i // 2) * (k + 40)
        b.paste(c.convert('RGB'), (x, y))
        d.text((x, y + k + 6), n, font=blad.letter(16), fill=WIT)
    b.save(blad.pad('groot-soldaat.png'))


def overlap(a, b):
    """Hoeveel twee silhouetten op spelmaat overlappen: de doorsnede gedeeld door de vereniging."""
    ma = [p >= 128 for p in a.getchannel('A').getdata()]
    mb = [p >= 128 for p in b.getchannel('A').getdata()]
    en = sum(1 for x, y in zip(ma, mb) if x and y)
    of = sum(1 for x, y in zip(ma, mb) if x or y)
    return en / of if of else 1.0


def realtime(f):
    """De bron, soldaat.glb en soldaat-realtime.glb naast elkaar: per richting, op spelmaat, en van dichtbij."""
    tx = json.load(open(blad.pad('textuur.json'), encoding='utf-8'))
    rijen = (('renders', 'bron (soldaat.blend, de knopen)'),
             ('glb', f"soldaat.glb (de bron met gebakken texturen, {tx['hoog']['driehoeken']} driehoeken)"),
             ('realtime', f"soldaat-realtime.glb ({tx['realtime']['driehoeken']} driehoeken, budget {tx['budget_realtime']})"))
    schaal = 0.4
    bw = round(SC['breed'] * schaal)
    w = 20 + 8 * (bw + 10) + 10
    b = Image.new('RGB', (w, 4000), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 14), 'De bron en de GLB-versies, opnieuw ingelezen zoals een spel ze leest, met dezelfde camera en hetzelfde licht',
           font=blad.letter(20), fill=WIT)
    y = 50
    for m, titel in rijen:
        d.text((20, y), titel, font=blad.letter(16), fill=WIT)
        y += 26 + blad.rij(b, [blad.vakje(pad(m, f'richting-{n}.png'), schaal, titel=n) for n in NAMEN], 20, y + 26) + 20
    # op spelmaat, en hoeveel de silhouetten overlappen
    sil = {}
    d.text((20, y), 'Op spelmaat (drie keer vergroot): bron, soldaat.glb, realtime; onder elke richting de overlap van de '
           'silhouetten van realtime en bron (doorsnede gedeeld door vereniging)', font=blad.letter(16), fill=WIT)
    y += 30
    x = 20
    hoog = 0
    for n in NAMEN:
        k = {m: klein(Image.open(pad(m, f'richting-{n}.png')).convert('RGBA'), f) for m, _ in rijen}
        sil[n] = {'glb': round(overlap(k['renders'], k['glb']), 4), 'realtime': round(overlap(k['renders'], k['realtime']), 4)}
        for j, (m, _) in enumerate(rijen):
            g = op_grond(k[m]).resize((k[m].width * 3, k[m].height * 3), Image.NEAREST)
            b.paste(g.convert('RGB'), (x, y + j * (g.height + 4)))
            hoog = max(hoog, 3 * (g.height + 4))
        d.text((x, y + hoog + 4), f"{n}: {sil[n]['realtime']:.3f}", font=blad.letter(14), fill=WIT)
        x += k['renders'].width * 3 + 14
    y += hoog + 40
    # van dichtbij: de bron en de realtime GLB
    d.text((20, y), 'Van dichtbij: de bron (boven) en soldaat-realtime.glb (onder)', font=blad.letter(16), fill=WIT)
    y += 28
    k = 300
    for i, n in enumerate(DICHTBIJ):
        for j, m in enumerate(('', 'realtime')):
            c = op_grond(Image.open(pad(m, f'dichtbij-{n}.png') if m else pad(f'dichtbij-{n}.png'))).resize((k, k), Image.LANCZOS)
            b.paste(c.convert('RGB'), (20 + i * (k + 10), y + j * (k + 10)))
        d.text((20 + i * (k + 10), y + 2 * (k + 10)), n, font=blad.letter(14), fill=WIT)
    y += 2 * (k + 10) + 40
    b.crop((0, 0, w, y)).save(blad.pad('vergelijking-realtime.png'))
    json.dump(sil, open(blad.pad('realtime-silhouet.json'), 'w', encoding='utf-8'), indent=1)


def uitgelegd():
    r = json.load(open(blad.pad('soldaat-renders.json'), encoding='utf-8'))
    so = json.load(open(blad.pad('soldaat.json'), encoding='utf-8'))
    u = op_grond(Image.open(pad('uitgelegd.png')))
    b = Image.new('RGB', (u.width + 40, u.height + 110), (60, 60, 64))
    d = ImageDraw.Draw(b)
    d.text((20, 14), 'De soldaat uitgelegd: elk onderdeel een eigen mesh aan hetzelfde skelet, uit ZW, op de hoogte waar het '
           'zit (in de idle)', font=blad.letter(18), fill=WIT)
    b.paste(u.convert('RGB'), (20, 46))
    for naam, x in r['uitgelegd'].items():
        t = NAAM.get(naam, naam)
        d.text((20 + x - 4 * len(t), 46 + u.height + 8), t, font=blad.letter(16), fill=WIT)
        n = so['driehoeken'].get(naam)
        if n:
            s = f'{n} driehoeken'
            d.text((20 + x - 3.5 * len(s), 46 + u.height + 32), s, font=blad.letter(13), fill=(200, 200, 200))
    b.save(blad.pad('uitgelegd-soldaat.png'))


if __name__ == '__main__':
    f, k = spelmaat()
    contactblad(f, k)
    spelmaat_blad(f, k)
    vergelijking(f, k)
    groot()
    uitgelegd()
    realtime(f)
    print('SOLDAAT-BLAD klaar', round(f, 4))
