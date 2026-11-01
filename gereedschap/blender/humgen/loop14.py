# Ronde 14 (Marcel, 29 okt: "HYBRIDE 3D + AI SPRITE PIPELINE": "Blender bepaalt de geometrie, houding, beweging en camera.
# Een lokaal AI-model bepaalt de uiteindelijke artistieke afwerking"; "Twee correcte loopposes"): de invoer voor de AI en
# wat er daarna mee gebeurt, voor de twee contactstanden A en B (humgen/loop14.json, gerenderd met stijlen.py en
# STAND=...#A of #B in de variant humgen14).
# - voor: beide standen met dezelfde uitsnede, schaal en voetlijn op het doek (de vereniging van hun silhouetten; anders
#   krijgen ze elk een eigen maat, zoals ronde8.voor), en de diepte met dezelfde grenzen: init (onze render op grijs),
#   alfa (ons silhouet, exact), masker (iets ruimer, voor de AI), diepte, normaal, id, lijnen (waar het materiaal of de
#   diepte springt) en stijl (de ChatGPT-speerman);
# - na: het antwoord van de AI binnen ons exacte silhouet, daarbuiten #FF00FF (en doorzichtig), met de metingen: blijft
#   de kwartiering (het blauw en geel van de AI op het blauw en geel van ons masker), hoeveel wijkt het af van onze render
#   (de helderheid en de randen), en een verschilbeeld en een overlay van onze randen;
# - blad: het contactblad (de referentie, Blender A, AI A, Blender B, AI B, beide op 74 pixels) en de A/B-GIF.
#
#   python loop14.py voor [breed hoog]
#   python loop14.py na <proef>             (de antwoorden in humgen14/ai/<proef>/A.png en B.png)
#   python loop14.py blad <proef> ...       (de beste eerst)
import colorsys
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
sys.path.insert(0, HIER)
WORTEL = os.path.abspath(os.path.join(HIER, '..', '..', '..'))
U = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'uit', 'basismens', 'humgen14')
ST = os.path.join(U, 'stijlen')
AI = os.path.join(U, 'ai')
CHATGPT = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'bron', 'soldaten', 'gpt', 'met-speer.webp')
STANDEN = ('A', 'B')
MAGENTA = (255, 0, 255)
lees = lambda p: Image.open(p).convert('RGBA')


def pas(naam, p):
    return lees(os.path.join(ST, f'{naam}-30-{p}.png'))


def voor(B=832, H=1216, rand=24):
    rgb = {p: pas('A8', p) for p in STANDEN}
    al = [np.asarray(rgb[p])[:, :, 3] > 0 for p in STANDEN]
    ys, xs = np.nonzero(al[0] | al[1])
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    f = min((B - 2 * rand) / (x1 - x0), (H - 2 * rand) / (y1 - y0))
    b, h = round((x1 - x0) * f), round((y1 - y0) * f)
    ox, oy = (B - b) // 2, H - rand - h  # de voeten op dezelfde lijn, onderaan
    plek = lambda im, s=Image.LANCZOS: im.crop((x0, y0, x1, y1)).resize((b, h), s)
    # de diepte: dezelfde grenzen voor beide (dichtbij wit, het verste van de figuur 0,15)
    diep = {p: np.asarray(pas('diepte', p))[:, :, 0] / 255.0 for p in STANDEN}
    alle = np.concatenate([diep[p][a] for p, a in zip(STANDEN, al)])
    lo, hi = np.percentile(alle, [1, 99])
    for p, a in zip(STANDEN, al):
        m = os.path.join(AI, f'{B}x{H}', p)
        os.makedirs(m, exist_ok=True)
        doek = lambda kleur=(128, 128, 128, 255): Image.new('RGBA', (B, H), kleur)
        init = doek()
        init.alpha_composite(plek(rgb[p]), (ox, oy))
        init.convert('RGB').save(os.path.join(m, 'init.png'))
        alfa = Image.new('L', (B, H), 0)
        alfa.paste(plek(rgb[p].getchannel('A')).point(lambda v: 255 if v >= 128 else 0), (ox, oy))
        alfa.save(os.path.join(m, 'alfa.png'))
        alfa.filter(ImageFilter.MaxFilter(9)).convert('RGB').save(os.path.join(m, 'masker.png'))
        for naam, s in (('id', Image.NEAREST), ('normaal', Image.BILINEAR), ('soort', Image.NEAREST)):
            d = doek((0, 0, 0, 255))
            d.alpha_composite(plek(pas(naam, p), s), (ox, oy))
            d.convert('RGB').save(os.path.join(m, f'{naam}.png'))
        d = np.where(a, 0.15 + 0.85 * np.clip((diep[p] - lo) / max(hi - lo, 1e-6), 0, 1), 0.0)
        dd = Image.new('L', (B, H), 0)
        dd.paste(plek(Image.fromarray((d * 255).astype(np.uint8)), Image.BILINEAR), (ox, oy))
        dd.convert('RGB').save(os.path.join(m, 'diepte.png'))
        # de lijnen: waar het materiaal verspringt (id) of de diepte springt
        g = np.asarray(Image.open(os.path.join(m, 'id.png')).convert('RGB')).astype(np.int32)
        g = g[:, :, 0] * 65536 + g[:, :, 1] * 256 + g[:, :, 2]
        z = np.asarray(dd).astype(np.float64) / 255
        lijn = np.zeros((H, B), bool)
        for dy, dx in ((1, 0), (0, 1), (1, 1), (1, -1)):
            lijn |= g != np.roll(np.roll(g, dy, 0), dx, 1)
            lijn |= (np.abs(z - np.roll(np.roll(z, dy, 0), dx, 1)) > 0.04) & (z > 0)
        Image.fromarray((lijn * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).convert('RGB').save(os.path.join(m, 'lijnen.png'))
        Image.open(CHATGPT).convert('RGB').save(os.path.join(m, 'stijl.png'))
        json.dump({'bron': f'A8-30-{p}.png', 'uitsnede': [int(x0), int(y0), int(x1), int(y1)], 'schaal': f, 'plek': [ox, oy, b, h],
                   'doek': [B, H], 'diepte': [float(lo), float(hi)], 'figuur_hoog_px': h}, open(os.path.join(m, 'voor.json'), 'w'), indent=1)
    print('VOOR', B, H, 'figuur', b, 'x', h)


def samen(W=1024, H=1024, rand=24):
    """T4: beide standen naast elkaar in één beeld (een modelblad), zodat de AI ze samen ziet en voor allebei dezelfde
    kleding tekent: de invoer van 832x1216 met dezelfde uitsnede en schaal verkleind, A links en B rechts op dezelfde
    voetlijn, in ai/samen/; terug met splits()."""
    bron = os.path.join(AI, '832x1216')
    al = [np.asarray(Image.open(os.path.join(bron, p, 'alfa.png'))) > 127 for p in STANDEN]
    ys, xs = np.nonzero(al[0] | al[1])
    y0, y1, x0, x1 = int(ys.min()), int(ys.max()) + 1, int(xs.min()), int(xs.max()) + 1
    f = min((H - 2 * rand) / (y1 - y0), (W - 3 * rand) / 2 / (x1 - x0))
    bw, bh = round((x1 - x0) * f), round((y1 - y0) * f)
    plek = {'A': [rand, H - rand - bh], 'B': [W - rand - bw, H - rand - bh]}
    m = os.path.join(AI, 'samen')
    os.makedirs(m, exist_ok=True)
    for naam, s, grond in (('init', Image.LANCZOS, (128, 128, 128)), ('masker', Image.NEAREST, (0, 0, 0)), ('lijnen', Image.NEAREST, (0, 0, 0)),
                           ('diepte', Image.BILINEAR, (0, 0, 0)), ('alfa', Image.NEAREST, (0, 0, 0)), ('id', Image.NEAREST, (0, 0, 0)),
                           ('soort', Image.NEAREST, (0, 0, 0)), ('normaal', Image.BILINEAR, (0, 0, 0))):
        doek = Image.new('RGB', (W, H), grond)
        for p in STANDEN:
            im = Image.open(os.path.join(bron, p, f'{naam}.png')).convert('RGB').crop((x0, y0, x1, y1)).resize((bw, bh), s)
            doek.paste(im, tuple(plek[p]))
        doek.save(os.path.join(m, f'{naam}.png'))
    Image.open(CHATGPT).convert('RGB').save(os.path.join(m, 'stijl.png'))
    json.dump({'uitsnede': [x0, y0, x1, y1], 'schaal': f, 'maat': [bw, bh], 'plek': plek, 'doek': [W, H]}, open(os.path.join(m, 'samen.json'), 'w'), indent=1)
    print('SAMEN', W, H, 'figuur', bw, 'x', bh)


def splits(proef):
    """Het antwoord van T4 (ai/<proef>/samen.png) terug naar A.png en B.png op het doek van 832x1216 (dezelfde plek als
    de invoer van één stand), zodat na() en blad() er gewoon mee werken."""
    S = json.load(open(os.path.join(AI, 'samen', 'samen.json')))
    x0, y0, x1, y1 = S['uitsnede']
    bw, bh = S['maat']
    ai = Image.open(os.path.join(AI, proef, 'samen.png')).convert('RGB')
    for p in STANDEN:
        x, y = S['plek'][p]
        stuk = ai.crop((x, y, x + bw, y + bh)).resize((x1 - x0, y1 - y0), Image.LANCZOS)
        doek = Image.new('RGB', (832, 1216), (128, 128, 128))
        doek.paste(stuk, (x0, y0))
        doek.save(os.path.join(AI, proef, f'{p}.png'))
    print('SPLITS', proef)


# ---------------------------------------------------------------- na

def klasse(rgb):
    h, s, v = colorsys.rgb_to_hsv(*(np.asarray(rgb) / 255.0))
    h *= 360
    if v < 0.15:
        return 'donker'
    if s < 0.2:
        return 'grijs'
    if 190 <= h <= 260:
        return 'blauw'
    if 35 <= h < 65 and s >= 0.4:
        return 'geel'
    return 'bruin'


def luminantie(a):
    return a[:, :, :3].astype(np.float64) @ np.array([0.2126, 0.7152, 0.0722])


def randen(L):
    gx = np.abs(np.roll(L, 1, 1) - np.roll(L, -1, 1))
    gy = np.abs(np.roll(L, 1, 0) - np.roll(L, -1, 0))
    return gx + gy


def na(proef, maat='832x1216'):
    """Het antwoord binnen ons silhouet, op magenta en doorzichtig, en de metingen per stand."""
    uit = {}
    for p in STANDEN:
        m = os.path.join(AI, maat, p)
        ai = np.asarray(Image.open(os.path.join(AI, proef, f'{p}.png')).convert('RGB'))
        init = np.asarray(Image.open(os.path.join(m, 'init.png')).convert('RGB'))
        a = np.asarray(Image.open(os.path.join(m, 'alfa.png'))) > 127
        idm = np.asarray(Image.open(os.path.join(m, 'id.png')).convert('RGB'))
        sprite = np.zeros_like(ai)
        sprite[:] = MAGENTA
        sprite[a] = ai[a]
        Image.fromarray(sprite).save(os.path.join(AI, proef, f'{p}-magenta.png'))
        rgba = np.dstack([ai, a * 255]).astype(np.uint8)
        rgba[~a] = 0
        Image.fromarray(rgba).save(os.path.join(AI, proef, f'{p}-alfa.png'))
        # de kwartiering: wat de AI tekent op ons blauw en ons geel
        kw = {}
        for naam, kleur in (('blauw', (0, 0, 255)), ('geel', (255, 255, 0))):
            sel = a & np.all(idm == kleur, axis=2)
            ys, xs = np.nonzero(sel)
            st = slice(None, None, 7)
            ks = [klasse(ai[y, x]) for y, x in zip(ys[st], xs[st])]
            kw[naam] = round(ks.count(naam) / max(1, len(ks)), 3)
        La, Li = luminantie(ai), luminantie(init)
        Ra, Ri = randen(La), randen(Li)
        r = np.corrcoef(Ra[a], Ri[a])[0, 1]
        uit[p] = {'kwartiering_behouden': kw, 'helderheid_verschil_gem': round(float(np.abs(La - Li)[a].mean()), 1),
                  'randen_correlatie': round(float(r), 3)}
        # verschilbeeld (wit is veel verschil) en onze randen in rood over het antwoord
        vb = np.clip(np.abs(ai.astype(np.int32) - init.astype(np.int32)).sum(2) * 2, 0, 255).astype(np.uint8)
        vb[~a] = 0
        Image.fromarray(vb).save(os.path.join(AI, proef, f'{p}-verschil.png'))
        ov = sprite.copy()
        lijn = np.asarray(Image.open(os.path.join(m, 'lijnen.png')).convert('L')) > 127
        ov[lijn] = (255, 0, 0)
        Image.fromarray(ov).save(os.path.join(AI, proef, f'{p}-overlay.png'))
    json.dump(uit, open(os.path.join(AI, proef, 'metingen.json'), 'w'), indent=1)
    print('NA', proef, json.dumps(uit))


# ---------------------------------------------------------------- blad

def sprite74(rgba, soort=None, lijf=None):
    """Een frame (RGBA, ons silhouet) naar 74 pixels: lineair, en per materiaal met het masker 'soort' (ronde 12)."""
    import ronde12 as R12
    gr = Image.fromarray(rgba)
    kl = R12.verklein(gr, R12.KLEIN)
    pm = R12.per_materiaal(gr, soort) if soort is not None else None
    return kl, pm


def SB_speerman():
    """De cel van de speerman in ZW uit het spel (de referentie op spelmaat)."""
    import soldaat_blad
    return soldaat_blad.speerman()[0]['ZW']


def vierenzeventig(proeven, maat='832x1216'):
    """Op spelmaat, op de tegels (ronde12.vierenzeventig): de speerman, dan per stand Blender en de proeven, elk per
    materiaal verkleind met het masker van Blender."""
    import ronde12 as R12
    kol = [R12.kolom_van('speerman')]
    for p in STANDEN:
        m = os.path.join(AI, maat, p)
        a = np.asarray(Image.open(os.path.join(m, 'alfa.png'))) > 127
        soort = lees(os.path.join(m, 'soort.png'))
        bl = np.dstack([np.asarray(Image.open(os.path.join(m, 'init.png')).convert('RGB')), a * 255]).astype(np.uint8)
        bl[~a] = 0
        for naam, im in [(f'Blender {p}', bl)] + [(f'{pr} {p}', np.asarray(lees(os.path.join(AI, pr, f'{p}-alfa.png')))) for pr in proeven]:
            gr = Image.fromarray(im)
            kol.append({'naam': naam, 'uitleg': 'per materiaal', 'groot': gr, 'klein': R12.per_materiaal(gr, soort), 'midden': gr})
    R12.vierenzeventig(kol, os.path.join(AI, f'74-{"-".join(proeven)}.png'), 'Op 74 pixels: de speerman, Blender en de AI-proeven, A en B (per materiaal verkleind)')


def blad(proeven, maat='832x1216'):
    """Het contactblad: de referentie, en per stand Blender en de AI-proeven; daaronder alles op 74 pixels (4x), en de
    A/B-GIF van de eerste proef (de beste)."""
    from PIL import ImageFont
    import ronde12 as R12
    lt = ImageFont.truetype('arial.ttf', 20)
    lk = ImageFont.truetype('arial.ttf', 14)
    hg = 620
    kol = [('referentie', 'de ChatGPT-speerman', Image.open(CHATGPT).convert('RGBA'))]
    klein = []
    for p in STANDEN:
        m = os.path.join(AI, maat, p)
        a = np.asarray(Image.open(os.path.join(m, 'alfa.png'))) > 127
        soort = lees(os.path.join(m, 'soort.png'))
        bl = np.dstack([np.asarray(Image.open(os.path.join(m, 'init.png')).convert('RGB')), a * 255]).astype(np.uint8)
        bl[~a] = 0
        kol.append((f'Blender {p}', 'de 3D-render', Image.fromarray(bl)))
        klein.append((f'Blender {p}', sprite74(bl, soort)))
        for pr in proeven:
            ai = np.asarray(lees(os.path.join(AI, pr, f'{p}-alfa.png')))
            kol.append((f'AI {p}', pr, Image.fromarray(ai)))
            klein.append((f'AI {p} {pr}', sprite74(ai, soort)))
    kb = 330
    B = Image.new('RGB', (len(kol) * (kb + 8) + 8, 70 + hg + 30 + 4 * R12.KLEIN * 2 + 60), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for i, (naam, uitleg, im) in enumerate(kol):
        x = 8 + i * (kb + 8)
        d.text((x + 4, 8), naam, font=lt, fill=(240, 236, 228))
        d.text((x + 4, 36), uitleg, font=lk, fill=(190, 184, 172))
        bb = im.getbbox()
        c = im.crop(bb)
        s = min((kb - 10) / c.width, hg / c.height)
        c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
        vak = Image.new('RGBA', (kb, hg + 10), (255, 0, 255, 255) if naam != 'referentie' else (150, 145, 138, 255))
        vak.alpha_composite(c, ((kb - c.width) // 2, hg + 10 - c.height))
        B.paste(vak.convert('RGB'), (x, 64))
    y = 64 + hg + 20
    d.text((10, y), 'op 74 pixels (per materiaal), 4x', font=lk, fill=(240, 236, 228))
    sp = SB_speerman()
    for i, s in enumerate([sp] + [pm or kl for _, (kl, pm) in klein]):
        x = 8 + i * (kb + 8)
        s = s.crop(s.getbbox())
        g = s.resize((s.width * 4, s.height * 4), Image.NEAREST)
        vak = Image.new('RGBA', g.size, (255, 0, 255, 255))
        vak.alpha_composite(g)
        B.paste(vak.convert('RGB'), (x + (kb - g.width) // 2, y + 24))
    B.save(os.path.join(AI, f'blad-{"-".join(proeven)}.png'))
    # de A/B-GIF van de eerste proef: groot (220 hoog) en op 74 pixels 4x, met Blender ernaast
    frames = []
    for p in STANDEN:
        m = os.path.join(AI, maat, p)
        a = np.asarray(Image.open(os.path.join(m, 'alfa.png'))) > 127
        bl = np.dstack([np.asarray(Image.open(os.path.join(m, 'init.png')).convert('RGB')), a * 255]).astype(np.uint8)
        bl[~a] = 0
        ai = np.asarray(lees(os.path.join(AI, proeven[0], f'{p}-alfa.png')))
        soort = lees(os.path.join(m, 'soort.png'))
        vak = Image.new('RGB', (1000, 520), MAGENTA)
        dr = ImageDraw.Draw(vak)
        for k, (naam, x) in enumerate(((bl, 'Blender'), (ai, proeven[0]))):
            groot = Image.fromarray(naam)
            groot = groot.crop(groot.getbbox())
            groot = groot.resize((round(groot.width * 300 / groot.height), 300), Image.LANCZOS)
            vak.paste(groot, (40 + k * 250, 40), groot)
            kl, pm = sprite74(naam, soort)
            g = (pm or kl).resize(((pm or kl).width * 4, (pm or kl).height * 4), Image.NEAREST)
            vak.paste(g, (560 + k * 220, 40), g)
            dr.text((40 + k * 250, 12), f'{x} {p}', fill=(0, 0, 0))
        frames.append(vak)
    frames[0].save(os.path.join(AI, f'ab-{proeven[0]}.gif'), save_all=True, append_images=frames[1:], duration=450, loop=0)
    print('BLAD', proeven)


if __name__ == '__main__':
    wat = sys.argv[1]
    if wat == 'voor':
        voor(*(int(x) for x in sys.argv[2:4])) if len(sys.argv) > 3 else voor()
    elif wat == 'samen':
        samen()
    elif wat == 'splits':
        splits(sys.argv[2])
    elif wat == 'na':
        na(sys.argv[2], *sys.argv[3:4])
    elif wat == 'blad':
        blad(sys.argv[2:])
        vierenzeventig(sys.argv[2:])
