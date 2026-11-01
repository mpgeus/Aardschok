# De platen van de vormproef (vraag 192): de referentie, de huidige en de nieuwe geometrie naast elkaar, op gelijke hoogte, in neutrale klei; dezelfde op 80 pixels; de zijkant, de rug en alle acht de richtingen;
# de hand op de speer en de loop. En de omtrek gemeten: de breedte per hoogte, als deel van de lengte, voor de plaat en voor beide modellen.
#
#   python vormplaten.py <uitmap>
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import vel as Vl  # noqa: E402

R = os.path.abspath(os.path.join(HIER, '..', '..', '..', '..'))
S = os.path.join(R, 'gereedschap', 'pixelart', 'uit', 'stijl')
V = os.path.join(S, 'vormproef')
REF = os.path.join(R, 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
GRIJS = (110, 110, 108, 255)
DONKER = (34, 34, 34)
RS = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
VAK = {'Z': (15, 30, 230, 470), 'ZW': (235, 30, 415, 470), 'W': (462, 50, 632, 470), 'NW': (660, 45, 860, 470), 'N': (885, 50, 1095, 470), 'NO': (1130, 30, 1345, 470), 'O': (1370, 45, 1505, 470), 'ZO': (1530, 30, 1755, 470)}
RUG = {'Z': False}


def letter(g=17):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def op_grijs(p):
    im = Image.open(p).convert('RGBA')
    bb = im.getbbox()
    bg = Image.new('RGBA', im.size, GRIJS)
    bg.alpha_composite(im)
    return bg.crop(bb).convert('RGB')


def ref_vak(r):
    return Image.open(REF).convert('RGB').crop(VAK[r])


def rij(beelden, H, namen=None, tussen=8):
    bs = [b.resize((round(b.width * H / b.height), H), Image.LANCZOS) for b in beelden]
    kop = 26 if namen else 0
    d = Image.new('RGB', (sum(b.width for b in bs) + tussen * (len(bs) - 1), H + kop), DONKER)
    t = ImageDraw.Draw(d)
    x = 0
    for i, b in enumerate(bs):
        d.paste(b, (x, kop))
        if namen:
            t.text((x + 4, 3), namen[i], fill=(240, 240, 240), font=letter())
        x += b.width + tussen
    return d


def onder(*platen, tussen=10):
    w = max(p.width for p in platen)
    d = Image.new('RGB', (w, sum(p.height for p in platen) + tussen * (len(platen) - 1)), DONKER)
    y = 0
    for p in platen:
        d.paste(p, (0, y))
        y += p.height + tussen
    return d


def sprite_op_grijs(pad, s, V_=1, krop=True):
    c = Vl.sprite(pad, s)
    bb = c.getbbox()
    bg = Image.new('RGBA', c.size, GRIJS)
    bg.alpha_composite(c)
    c = bg.crop(bb).convert('RGB') if krop else bg.convert('RGB')
    return c.resize((c.width * V_, c.height * V_), Image.NEAREST)


def naast_elkaar(uit):
    a = rij([op_grijs(os.path.join(V, 'klei-nu', 'staan-Z-00.png')), op_grijs(os.path.join(V, 'klei-v3', 'staan-Z-00.png')), ref_vak('Z')], 900, ['huidige geometrie', 'nieuwe geometrie', 'referentie'])
    a.save(os.path.join(uit, 'vorm-naast-elkaar.png'))
    # hetzelfde zonder de speer in het oog: de bovenkant groter
    return a


def zij_en_rug(uit):
    d = []
    for r, naam in (('W', 'zijkant'), ('N', 'rug'), ('ZW', 'schuin')):
        d.append(rij([op_grijs(os.path.join(V, 'klei-nu', f'staan-{r}-00.png')), op_grijs(os.path.join(V, 'klei-v3', f'staan-{r}-00.png')), ref_vak(r)], 620, [f'{naam}: huidig', f'{naam}: nieuw', f'{naam}: referentie']))
    w = sum(x.width for x in d) + 20 * (len(d) - 1)
    p = Image.new('RGB', (w, d[0].height), DONKER)
    x = 0
    for q in d:
        p.paste(q, (x, 0))
        x += q.width + 20
    p.save(os.path.join(uit, 'vorm-zij-en-rug.png'))


def schaal(m):
    meta = json.load(open(os.path.join(m, 'staan-render.json'), encoding='utf-8'))
    return Vl.schaal_van(meta['pixels'], meta['ortho'], 80, meta.get('lengte'))


def op_80(uit):
    """Op spelmaat: de referentie verkleind (zonder afwerking), dan klei en verf van beide modellen; vergroot met harde pixels, en één keer op ware grootte."""
    regels = []
    ref = Image.open(REF).convert('RGB')
    vier = ('Z', 'ZW', 'W', 'N')
    for naam, bron in (('referentie', None), ('huidig, klei', 'klei-spel-nu'), ('nieuw, klei', 'klei-spel-v3'), ('huidig, verf', 'r-nu'), ('nieuw, verf', 'r-v3')):
        cel = []
        for r in vier:
            if bron is None:
                c = ref.crop(VAK[r])
                h = 118
                c = c.resize((round(c.width * h / c.height), h), Image.BOX)
            else:
                map_ = {'r-nu': os.path.join(S, 'renders', 'staan'), 'r-v3': os.path.join(V, 'renders', 'staan')}.get(bron, os.path.join(V, bron))
                c = sprite_op_grijs(os.path.join(map_, f'staan-{r}-00.png'), schaal(map_))
            cel.append(c)
        H = 3
        groot = [c.resize((c.width * H, c.height * H), Image.NEAREST) for c in cel]
        w = sum(c.width for c in groot) + 6 * len(groot) + sum(c.width for c in cel) + 8 * len(cel) + 150
        h = max(c.height for c in groot)
        d = Image.new('RGB', (w, h), (110, 110, 108))
        t = ImageDraw.Draw(d)
        t.text((4, 4), naam, fill=(255, 255, 255), font=letter())
        x = 150
        for c in groot:
            d.paste(c, (x, h - c.height))
            x += c.width + 6
        for c in cel:
            d.paste(c, (x, h - c.height))
            x += c.width + 8
        regels.append(d)
    onder(*regels, tussen=4).save(os.path.join(uit, 'vorm-80px.png'))


def acht(uit):
    a = rij([op_grijs(os.path.join(V, 'klei-nu', f'staan-{r}-00.png')) for r in RS], 400)
    b = rij([op_grijs(os.path.join(V, 'klei-v3', f'staan-{r}-00.png')) for r in RS], 400)
    c = rij([ref_vak(r) for r in RS], 400)
    onder(c, a, b).save(os.path.join(uit, 'vorm-acht-richtingen.png'))
    k = []
    for m in (('klei-spel-nu', 'huidig'), ('klei-spel-v3', 'nieuw')):
        map_ = os.path.join(V, m[0])
        s = schaal(map_)
        rijtje = [sprite_op_grijs(os.path.join(map_, f'staan-{r}-00.png'), s, 3, krop=False) for r in RS]
        k.append(rij(rijtje, rijtje[0].height))
    onder(*k).save(os.path.join(uit, 'vorm-acht-80px.png'))


def hand(uit):
    """De rechterhand op de speer en de linkerhand, in de richtingen waarin je ze ziet, huidig boven en nieuw onder."""
    d = []
    for m, naam in (('klei-hand-nu', 'huidig'), ('klei-hand-v3', 'nieuw')):
        rijtje = []
        for r in ('Z', 'ZW', 'W'):
            im = Image.open(os.path.join(V, m, f'staan-{r}-00.png')).convert('RGBA')
            bg = Image.new('RGBA', im.size, GRIJS)
            bg.alpha_composite(im)
            w, h = im.size
            rijtje.append(bg.crop((int(w * 0.05), int(h * 0.27), int(w * 0.95), int(h * 0.72))).convert('RGB'))
        d.append(rij(rijtje, 460, [f'{naam} {r}' for r in ('Z', 'ZW', 'W')]))
    onder(*d).save(os.path.join(uit, 'vorm-handen.png'))


def loop(uit):
    """Twaalf beelden lopen in klei, om doorsteek en vervorming met het oog na te kijken."""
    p = []
    for r in ('ZW', 'W', 'N'):
        for m in ('klei-loop-nu', 'klei-loop-v3'):
            map_ = os.path.join(V, m)
            rijtje = []
            for i in range(0, 12, 2):
                im = Image.open(os.path.join(map_, f'lopen-{r}-{i:02d}.png')).convert('RGBA')
                bg = Image.new('RGBA', im.size, GRIJS)
                bg.alpha_composite(im)
                w, h = im.size
                rijtje.append(bg.crop((int(w * .2), int(h * .08), int(w * .8), int(h * .92))).convert('RGB'))
            p.append(rij(rijtje, 330, [f'{m[10:]} {r} {i}' for i in range(0, 12, 2)]))
    onder(*p).save(os.path.join(uit, 'vorm-loop.png'))


def loop_rok(uit):
    """De onderkant van de figuur in de loop, groot: de rok, de knie en de laars. Hier zit het meeste risico van de langere rok."""
    p = []
    for m in ('klei-loop-nu', 'klei-loop-v3'):
        for r in ('ZW', 'W'):
            rijtje = []
            for i in (0, 3, 6, 9):
                im = Image.open(os.path.join(V, m, f'lopen-{r}-{i:02d}.png')).convert('RGBA')
                bg = Image.new('RGBA', im.size, GRIJS)
                bg.alpha_composite(im)
                bb = im.getbbox()
                h = bb[3] - bb[1]
                x0 = (bb[0] + bb[2]) // 2 - 140
                rijtje.append(bg.crop((x0, bb[1] + int(h * 0.55), x0 + 280, bb[3])).convert('RGB'))
            p.append(rij(rijtje, 330, [f'{m[10:]} {r} {i}' for i in (0, 3, 6, 9)]))
    onder(*p).save(os.path.join(uit, 'vorm-loop-rok.png'))


# --- de maten per onderdeel --------------------------------------------------------------------------------------------------------
# De plaat is met het oog afgelezen op richting Z (plusminus 1 procent), de modellen uit de ID-beelden, als deel van de hoogte van helm tot zool, zonder de speer. Een omtrek per rij (de eerste poging) werkt hier niet:
# de speer telt dan mee, en hij steekt op de plaat veel minder boven de helm uit, dus de rijen vielen niet samen.
PLAAT_MATEN = {'helmrand': 0.35, 'koepel': 0.26, 'gezicht met haar': 0.23, 'helm tot baard': 0.338, 'schouders (tabberd)': 0.381, 'riem': 0.263, 'zoom': 0.41, 'riem tot zoom': 0.227, 'bovenarm': 0.094, 'laars': 0.209, 'hele breedte': 0.604}


def maten(map_):
    sys.path.insert(0, HIER)
    import render_id_kleuren as RK
    p = os.path.join(map_, 'staan-Z-00')
    idb = np.asarray(Image.open(p + '-id.png').convert('RGBA'), dtype=np.float32)
    def m(n):
        doel = np.where(np.array(RK.KLEUR[n]) == 0.5, 0.735, np.array(RK.KLEUR[n]))
        return (np.abs(idb[..., :3] / 255.0 - doel).sum(-1) < 0.15) & (idb[..., 3] > 200)
    def bb(x):
        ys, xs = np.nonzero(x)
        return xs.min(), xs.max(), ys.min(), ys.max()
    # de baard heeft geen eigen ID-kleur, en staat in het ID-beeld dus niet onder een onderdeel: hij telt mee als wat er in het silhouet overblijft rond het hoofd
    helm, hoofd_, tab, riem, gam, laars = m('helm'), m('hoofd'), m('tabberd'), m('riem'), m('gambeson'), m('laarzen')
    bekend = np.zeros(helm.shape, dtype=bool)
    for n in RK.KLEUR:
        bekend |= m(n)
    hx0, hx1, hy0, hy1 = bb(hoofd_)
    rest = (idb[..., 3] > 200) & ~bekend
    rest[:hy0] = False
    rest[:, :hx0 - 12] = False
    rest[:, hx1 + 12:] = False
    baard = rest
    x0, x1, y0, _ = bb(helm)
    y1 = bb(laars)[3]
    H = y1 - y0 + 1
    alles = (idb[..., 3] > 200) & ~m('speer')
    bx0, bx1, _, _ = bb(alles)
    # de koepel: de helm boven de band
    rand_y = y0 + int((np.nonzero(helm.sum(1) == helm.sum(1).max())[0][0] - y0) * 0.72)
    kx = np.nonzero(helm[rand_y])[0]
    gx0, gx1, _, gy1 = bb(hoofd_ | baard)
    tx0, tx1, ty0, ty1 = bb(tab)
    rx0, rx1, ry0, ry1 = bb(riem)
    # de schouders: de breedte van de tabberd boven de riem
    sb = tab[:ry0].sum(1)
    boven = np.nonzero(tab[:ry0].any(0))[0]
    # de zoom: de breedte van de tabberd in de onderste rijen
    zm = np.nonzero(tab[ty1 - max(4, H // 40):ty1].any(0))[0]
    # de bovenarm: de breedte van de gambeson op het midden tussen schouder en riem, aan de kant zonder speer
    my = (ty0 + ry0) // 2
    rechts = np.nonzero(gam[my, (tx0 + tx1) // 2:])[0]
    return {'helmrand': (x1 - x0 + 1) / H, 'koepel': (kx.max() - kx.min() + 1) / H, 'gezicht met haar': (gx1 - gx0 + 1) / H, 'helm tot baard': (gy1 - y0 + 1) / H,
            'schouders (tabberd)': (boven.max() - boven.min() + 1) / H, 'riem': (rx1 - rx0 + 1) / H, 'zoom': (zm.max() - zm.min() + 1) / H, 'riem tot zoom': (ty1 - (ry0 + ry1) // 2 + 1) / H,
            'bovenarm': (rechts.max() - rechts.min() + 1) / H if len(rechts) else 0.0, 'laars': (y1 - bb(laars)[2] + 1) / H, 'hele breedte': (bx1 - bx0 + 1) / H}


def meet(uit):
    a = maten(os.path.join(V, 'klei-nu'))
    b = maten(os.path.join(V, 'klei-v3'))
    res = {k: {'plaat': PLAAT_MATEN[k], 'huidig': round(a[k], 3), 'nieuw': round(b[k], 3)} for k in PLAAT_MATEN}
    with open(os.path.join(uit, 'vorm-maten.json'), 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    for k, v in res.items():
        print(k, v, 'dichterbij' if abs(v['nieuw'] - v['plaat']) < abs(v['huidig'] - v['plaat']) else 'NIET dichterbij')


def hoofd():
    uit = sys.argv[1]
    os.makedirs(uit, exist_ok=True)
    naast_elkaar(uit)
    zij_en_rug(uit)
    op_80(uit)
    acht(uit)
    hand(uit)
    loop(uit)
    loop_rok(uit)
    meet(uit)
    print('KLAAR', uit)


if __name__ == '__main__':
    hoofd()
