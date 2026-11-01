# Ronde 8 (Marcel, 29 okt: "Van technisch correct 3D-model naar hoogwaardige, reproduceerbare Aardschok HD-pixel-art"):
# drie afwerkingen op dezelfde render, alleen ZW (en Z en W voor de consistentie).
# - voor [richting]: de invoer voor de AI (experiment C, gereedschap/ai/soldaat-ai.cjs) op een doek van 832 bij 1216:
#   de render van A op grijs (init), het silhouet iets ruimer (masker: de AI tekent alleen daarbinnen), de randen van de
#   materialen, het silhouet en de sprongen in de diepte (lijnen), de diepte, en de ChatGPT-speerman als stijl;
# - na [richting]: het antwoord van de AI terug op de plek van de render, met precies de alfa van de render (er komt
#   niets buiten het silhouet), en wat de AI erbuiten tekende en binnen veranderde, gemeten;
# - sprite <render> <uit> [lijfhoogte]: de gewone verkleining (in lineair licht, de alfa van de bron op 0,5): de sprite
#   van A en C, naast die van B (spriteafwerking.py).
# De richting is leeg (ZW op de draai van de speerman, 40 graden) of Z, ZW, W (de draai van het spel).
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import spriteafwerking as SA  # noqa: E402
import variant  # noqa: E402

ST = os.path.join(variant.UIT, 'stijlen')
AI = os.path.join(variant.UIT, 'ai8')
WORTEL = variant.WORTEL
CHATGPT = os.path.join(WORTEL, 'gereedschap', 'pixelart', 'bron', 'soldaten', 'gpt', 'met-speer.webp')
DOEK, RAND = (832, 1216), 32


def lees(p):
    return np.asarray(Image.open(p).convert('RGBA'))


def achtervoegsel(r):
    return f'-{r}' if r else ''


def voor(r=''):
    s = achtervoegsel(r)
    A = lees(os.path.join(ST, f'A8-30{s}.png'))
    soort = lees(os.path.join(ST, f'soort-30{s}.png'))
    diepte = lees(os.path.join(ST, f'diepte-30{s}.png'))
    a = A[:, :, 3] > 0
    ys, xs = np.nonzero(a)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    f = min((DOEK[0] - 2 * RAND) / (x1 - x0), (DOEK[1] - 2 * RAND) / (y1 - y0))
    b, h = round((x1 - x0) * f), round((y1 - y0) * f)
    ox, oy = (DOEK[0] - b) // 2, (DOEK[1] - h) // 2
    plek = lambda arr, soort_=Image.LANCZOS: Image.fromarray(arr[y0:y1, x0:x1]).resize((b, h), soort_)
    map_ = os.path.join(AI, r or 'ZW')
    os.makedirs(map_, exist_ok=True)
    init = Image.new('RGBA', DOEK, (128, 128, 128, 255))
    init.alpha_composite(plek(A), (ox, oy))
    init.convert('RGB').save(os.path.join(map_, 'init.png'))
    alfa = Image.new('L', DOEK, 0)
    alfa.paste(plek(A[:, :, 3]), (ox, oy))
    alfa.point(lambda v: 255 if v > 0 else 0).filter(ImageFilter.MaxFilter(13)).convert('RGB').save(os.path.join(map_, 'masker.png'))
    g = np.zeros(DOEK[::-1], np.int32) - 1
    g[oy:oy + h, ox:ox + b] = np.where(np.asarray(plek(A[:, :, 3], Image.NEAREST)) > 127,
                                        SA.groepen_van(np.asarray(plek(soort, Image.NEAREST))), -1)
    d = np.zeros(DOEK[::-1])
    d[oy:oy + h, ox:ox + b] = np.asarray(plek(diepte, Image.BILINEAR))[:, :, 0] / 255.0
    binnen = g >= 0  # de diepte over het hele bereik van de figuur: dichtbij wit, het verste deel van de figuur 0,15
    lo, hi = np.percentile(d[binnen], [1, 99])
    d = np.where(binnen, 0.15 + 0.85 * np.clip((d - lo) / max(hi - lo, 1e-6), 0, 1), 0.0)
    lijn = np.zeros(DOEK[::-1], bool)
    for dy, dx in ((1, 0), (0, 1), (1, 1), (1, -1)):
        lijn |= (g != np.roll(np.roll(g, dy, 0), dx, 1))
        lijn |= (np.abs(d - np.roll(np.roll(d, dy, 0), dx, 1)) > 0.04) & (g >= 0)
    Image.fromarray((lijn * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).convert('RGB').save(os.path.join(map_, 'lijnen.png'))
    Image.fromarray((d * 255).astype(np.uint8)).convert('RGB').save(os.path.join(map_, 'diepte.png'))
    Image.open(CHATGPT).convert('RGB').save(os.path.join(map_, 'stijl.png'))
    json.dump({'bron': f'A8-30{s}.png', 'uitsnede': [int(x0), int(y0), int(x1), int(y1)], 'schaal': f, 'plek': [ox, oy, b, h],
               'maat': list(A.shape[1::-1])}, open(os.path.join(map_, 'voor.json'), 'w'), indent=1)
    print('VOOR', map_)


def na(r=''):
    s = achtervoegsel(r)
    map_ = os.path.join(AI, r or 'ZW')
    v = json.load(open(os.path.join(map_, 'voor.json')))
    A = lees(os.path.join(ST, v['bron']))
    x0, y0, x1, y1 = v['uitsnede']
    ox, oy, b, h = v['plek']
    masker = np.asarray(Image.open(os.path.join(map_, 'masker.png')).convert('L')) > 127
    init = np.asarray(Image.open(os.path.join(map_, 'init.png')).convert('RGB')).astype(np.float64)
    uit = {}
    for p in sorted(os.listdir(map_)):
        if not (p.startswith('ai-') and p.endswith('.png')):
            continue
        dn = p[3:-4]
        ai = Image.open(os.path.join(map_, p)).convert('RGB')
        aia = np.asarray(ai).astype(np.float64)
        # wat de AI buiten het (ruime) masker veranderde, en hoeveel binnen het silhouet
        verschil = np.abs(aia - init).max(-1) > 12
        terug = np.asarray(ai.crop((ox, oy, ox + b, oy + h)).resize((x1 - x0, y1 - y0), Image.LANCZOS))
        C = A.copy()
        C[y0:y1, x0:x1, :3] = np.where(A[y0:y1, x0:x1, 3:4] > 0, terug, A[y0:y1, x0:x1, :3])
        naam = f'C8-{dn}-30{s}.png'
        Image.fromarray(C).save(os.path.join(ST, naam))
        binnen = A[:, :, 3] > 0
        uit[dn] = {'beeld': naam, 'buiten_het_masker_veranderd': round(float(verschil[~masker].mean() * 100), 3),
                   'binnen_veranderd': round(float(verschil[masker].mean() * 100), 1),
                   'alfa_gelijk_aan_de_bron': bool((C[:, :, 3] == A[:, :, 3]).all()),
                   'pixels_buiten_het_silhouet': int((C[:, :, 3][~binnen] > 0).sum())}
    json.dump(uit, open(os.path.join(map_, 'na.json'), 'w'), indent=1)
    print('NA', json.dumps(uit))


def sprite(render_p, uit_p, lijf_px=72):
    """De gewone verkleining: per pixel het gemiddelde in lineair licht (voorvermenigvuldigd met de alfa), de alfa van de
    bron op 0,5 afgekapt; dezelfde maat en hetzelfde silhouet als spriteafwerking.py."""
    R = lees(render_p)
    a = R[:, :, 3] / 255.0
    s = lijf_px / SA.lijf_hoogte(a)
    B, H = max(1, round(R.shape[1] * s)), max(1, round(R.shape[0] * s))
    lin = SA.lineair(R[:, :, :3].astype(np.float64))
    w = SA.verklein(a, B, H)
    kl = np.stack([SA.verklein(lin[:, :, c] * a, B, H) for c in range(3)], -1) / np.maximum(w, 1e-9)[..., None]
    alfa = w >= 0.5
    rgba = np.zeros((H, B, 4), np.uint8)
    rgba[..., :3] = np.round(SA.srgb(kl)).astype(np.uint8)
    rgba[..., 3] = alfa * 255
    rgba[~alfa] = 0
    Image.fromarray(rgba).save(uit_p)


# ---------------------------------------------------------------- de bladen, de metingen en de atlas

def hoog_detail(rgb, g, a):
    """Per groep het fijne detail: het gemiddelde verschil van het licht met zijn 9 bij 9-gemiddelde."""
    Y = rgb[:, :, :3].astype(np.float64) @ np.array([0.2126, 0.7152, 0.0722])
    bl = np.asarray(Image.fromarray(np.clip(Y, 0, 255).astype(np.uint8)).filter(ImageFilter.BoxBlur(4)), dtype=np.float64)
    return {SA.GROEPEN[i]: round(float(np.abs(Y - bl)[(g == i) & a].mean()), 2) for i in range(6) if ((g == i) & a).any()}


def per_groep_lab(rgb, g, a):
    L = SA.lab(SA.lineair(rgb[:, :, :3].astype(np.float64)))
    return {SA.GROEPEN[i]: np.median(L[(g == i) & a], axis=0) for i in range(6) if ((g == i) & a).sum() > 10}


def tint(rgb):
    x = rgb[..., :3].astype(np.float64) / 255
    mx, mn = x.max(-1), x.min(-1)
    d = np.maximum(mx - mn, 1e-9)
    h = np.where(mx == x[..., 0], ((x[..., 1] - x[..., 2]) / d) % 6, np.where(mx == x[..., 1], (x[..., 2] - x[..., 0]) / d + 2, (x[..., 0] - x[..., 1]) / d + 4))
    return h * 60, (mx - mn) / np.maximum(mx, 1e-9)


def bladen():
    import time
    import stijlblad as SB
    import soldaat_blad
    t0 = time.time()
    lees_ = lambda p: Image.open(p).convert('RGBA')
    spel = soldaat_blad.speerman()[0]['ZW']
    b_, o_, _ = SB.lijf(spel)
    SB.KLEIN = round(o_ - b_)
    G = variant.UIT
    O = os.path.join(variant.UIT_BASIS, 'overdracht-8')
    os.makedirs(O, exist_ok=True)
    # de sprites van A en C (gewone verkleining) en van ronde 7 (de HD-pixelafwerking van C uit ronde 5 tot 7)
    af7, rauw7, klein7 = SB.hdpixel(ST)
    klein7.save(os.path.join(ST, 'sprite-r7.png'))
    af7.save(os.path.join(ST, 'r7-hdpixel-30.png'))
    for n in ['A8-30'] + [f'C8-{d}-30' for d in ('0.15', '0.25', '0.35')] + [f'{x}-30-{r}' for x in ('A8', 'C8-0.25') for r in ('Z', 'ZW', 'W')]:
        if os.path.exists(os.path.join(ST, n + '.png')):
            sprite(os.path.join(ST, n + '.png'), os.path.join(ST, f'sprite-{n}.png'), SB.KLEIN)
    s30 = lees_(os.path.join(SB.SPEERMAN, 'eigen-ZW-iso-staan.png'))
    kol = [('speerman (spel)', 'de vorm op 74 px:\nzijn render op 30 graden\nen zijn vel', s30, spel),
           ('ronde 7', 'C van ronde 5-7:\nlichtvlakken, lijnen, palet', af7, klein7),
           ('A  Blender', 'rijkere materialen,\nCycles, 256 monsters', lees_(os.path.join(ST, 'A8-30.png')), lees_(os.path.join(ST, 'sprite-A8-30.png'))),
           ('B  per materiaal', 'deterministisch:\nspriteafwerking.py', lees_(os.path.join(ST, 'B8-30-groot.png')), lees_(os.path.join(ST, 'B8-30.png')))]
    for d, k in (('0.15', 'C1'), ('0.25', 'C2'), ('0.35', 'C3')):
        kol.append((f'{k}  AI {d}', 'SDXL img2img, ControlNet,\nIP-Adapter (ChatGPT)', lees_(os.path.join(ST, f'C8-{d}-30.png')), lees_(os.path.join(ST, f'sprite-C8-{d}-30.png'))))
    doel = Image.open(CHATGPT).convert('RGB')
    rij(kol, doel, os.path.join(O, '08-contactblad-groot.png'), groot=True)
    rij(kol, doel, os.path.join(O, '09-contactblad-74px.png'), groot=False)
    # de metingen
    soort = lees(os.path.join(ST, 'soort-30.png'))
    g = SA.groepen_van(soort)
    a = soort[:, :, 3] > 0
    A = lees(os.path.join(ST, 'A8-30.png'))
    LA = per_groep_lab(A, g, a)
    hA, sA = tint(A)
    blauw, geel = a & (g == 2) & (sA > 0.35) & (hA > 200) & (hA < 245), a & (g == 2) & (sA > 0.35) & (hA > 35) & (hA < 60)
    bron_alfa = (SA.verklein(A[:, :, 3] / 255.0, *Image.open(os.path.join(ST, 'B8-30.png')).size) >= 0.5)
    M = {}
    for naam, groot_p, klein_p in [('ronde 7', os.path.join(ST, 'C-30.png'), os.path.join(ST, 'sprite-r7.png')),
                                   ('A', os.path.join(ST, 'A8-30.png'), os.path.join(ST, 'sprite-A8-30.png')),
                                   ('B', None, os.path.join(ST, 'B8-30.png'))] + \
            [(k, os.path.join(ST, f'C8-{d}-30.png'), os.path.join(ST, f'sprite-C8-{d}-30.png')) for d, k in (('0.15', 'C1'), ('0.25', 'C2'), ('0.35', 'C3'))]:
        kl = lees(klein_p)
        m = {'kleuren_op_74px': int(len(np.unique(kl[kl[:, :, 3] > 0][:, :3], axis=0)))}
        if kl.shape[:2] == bron_alfa.shape:
            ka = kl[:, :, 3] > 0
            m['silhouet_gelijk_aan_de_bron'] = round(float((ka == bron_alfa).mean()), 4)
        if groot_p:
            X = lees(groot_p)
            m['detail_groot'] = hoog_detail(X, g, a)
            if naam != 'ronde 7':
                LX = per_groep_lab(X, g, a)
                m['delta_e_tegen_A'] = {k: round(float(np.linalg.norm(LX[k] - LA[k])), 1) for k in LA if k in LX}
                hX, sX = tint(X)
                m['tabberd_blauw_blijft_blauw'] = round(float(((hX > 200) & (hX < 245) & (sX > 0.3))[blauw].mean()), 3)
                m['tabberd_geel_blijft_geel'] = round(float(((hX > 35) & (hX < 60) & (sX > 0.3))[geel].mean()), 3)
                gx = lambda Y: np.hypot(*np.gradient(Y))
                YA, YX = A[:, :, :3] @ np.array([0.2126, 0.7152, 0.0722]), X[:, :, :3] @ np.array([0.2126, 0.7152, 0.0722])
                m['randen_gelijk_aan_A'] = round(float(np.corrcoef(gx(YA)[a], gx(YX)[a])[0, 1]), 3)
        M[naam] = m
    for d in ('0.15', '0.25', '0.35'):
        p = os.path.join(variant.UIT, 'ai8', 'ZW', 'na.json')
        if os.path.exists(p):
            M[{'0.15': 'C1', '0.25': 'C2', '0.35': 'C3'}[d]].update(json.load(open(p))[d])
    # de consistentie over drie richtingen: per groep de kleur in elke richting (verschil tussen de richtingen), en voor C
    # hoeveel de AI per richting van A afwijkt
    cons = {}
    for x in ('B8', 'sprite-A8', 'sprite-C8-0.25'):
        per = {}
        for r in ('Z', 'ZW', 'W'):
            p = os.path.join(ST, f'{x}-30-{r}.png')
            if not os.path.exists(p):
                continue
            kl = lees(p)
            sm = SA.groepen_van(np.asarray(Image.open(os.path.join(ST, f'soort-30-{r}.png')).convert('RGBA').resize(kl.shape[1::-1], Image.NEAREST)))
            per[r] = per_groep_lab(kl, sm, kl[:, :, 3] > 0)
        if len(per) == 3:
            cons[x] = {k: round(float(max(np.linalg.norm(per[r1][k] - per[r2][k]) for r1 in per for r2 in per if k in per[r1] and k in per[r2])), 1)
                       for k in per['ZW']}
    afw = {}
    for r in ('Z', 'ZW', 'W'):
        p = os.path.join(ST, f'C8-0.25-30-{r}.png')
        if os.path.exists(p):
            so = lees(os.path.join(ST, f'soort-30-{r}.png'))
            gg, aa = SA.groepen_van(so), so[:, :, 3] > 0
            LA_, LC_ = per_groep_lab(lees(os.path.join(ST, f'A8-30-{r}.png')), gg, aa), per_groep_lab(lees(p), gg, aa)
            afw[r] = {k: round(float(np.linalg.norm(LC_[k] - LA_[k])), 1) for k in LA_ if k in LC_}
    json.dump({'varianten': M, 'consistentie_dE_tussen_richtingen': cons, 'ai_afwijking_van_A_per_richting': afw,
               'seconden_voor_de_bladen': round(time.time() - t0, 1)}, open(os.path.join(O, 'ronde8.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('METINGEN', json.dumps(M, ensure_ascii=False)[:3000])
    print('CONSISTENTIE', json.dumps(cons), json.dumps(afw))


def rij(kol, doel, pad, groot):
    """Een contactblad: links het ChatGPT-doel apart, dan per kolom de figuur op dezelfde lichaamshoogte en voetlijn (groot)
    of op spelmaat (1x op de tegels, 4x, en het hoofd 8x)."""
    import blad
    import stijlblad as SB
    lt, lk = blad.letter(20), blad.letter(14)
    kb = 300
    Hh = 760 if groot else 4 * SB.KLEIN + 60 + 260
    dw = round(doel.width * (Hh - 40) / doel.height)
    B = Image.new('RGBA', (dw + 30 + len(kol) * (kb + 8), Hh + 90), (34, 32, 30, 255))
    d = ImageDraw.Draw(B)
    B.paste(doel.resize((dw, Hh - 40)), (10, 80))
    d.text((14, 10), 'doel: de ChatGPT-speerman', font=lt, fill=(240, 236, 228))
    d.text((14, 40), 'apart: stijl, niet de maat', font=lk, fill=(190, 184, 172))
    x0 = dw + 20
    tegel = Image.open(os.path.join(WORTEL, variant.INST['spelmaat']['tegels'])).convert('RGBA').crop(tuple(variant.INST['spelmaat']['tegel']))
    for i, (naam, uitleg, gr, kl) in enumerate(kol):
        x = x0 + i * (kb + 8)
        d.text((x + 6, 10), naam, font=lt, fill=(240, 236, 228))
        for j, regel in enumerate(uitleg.split('\n')[:3]):
            d.text((x + 6, 36 + j * 16), regel, font=lk, fill=(190, 184, 172))
        vak = Image.new('RGBA', (kb, Hh), SB.ACHTER)
        if groot:
            SB.plaats(vak, gr, 640, Hh - 20, kb // 2 + 30, Image.NEAREST if naam.startswith('B') else Image.LANCZOS)
        else:
            veld = blad.tegelveld(kb, 4 * SB.KLEIN + 60, tegel, 4 * SB.KLEIN + 20)
            b_, o_, kx = SB.lijf(kl)
            veld.alpha_composite(kl, (round(36 - kx), round(4 * SB.KLEIN + 20 - o_)))
            veld.alpha_composite(kl.resize((kl.width * 4, kl.height * 4), Image.NEAREST), (round(kb * 0.58 - kx * 4), round(4 * SB.KLEIN + 40 - o_ * 4)))
            vak.paste(veld, (0, 0))
            kop = kl.crop((round(kx - 0.2 * (o_ - b_)), round(b_) - 2, round(kx + 0.2 * (o_ - b_)), round(b_ + 0.33 * (o_ - b_))))
            kop = kop.resize((kop.width * 8, kop.height * 8), Image.NEAREST)
            vak.alpha_composite(kop, (max(0, (kb - kop.width) // 2), 4 * SB.KLEIN + 66))
        B.paste(vak, (x, 80))
    B.convert('RGB').save(pad)


def atlas():
    """De proef voor het spel (Marcel: "PNG-sprites, sprite-atlassen, JSON-metadata ... voetenbaseline, frame-afmetingen,
    pivotpunten"): de sprites van B in Z, ZW en W naast elkaar in één atlas, met per beeld de plek, de maat, het
    draaipunt (midden van de voeten) en de voetlijn, de richting, het materiaal per groep en de hash."""
    import hashlib
    O = os.path.join(variant.UIT_BASIS, 'overdracht-8')
    os.makedirs(O, exist_ok=True)
    beelden = [(r, Image.open(os.path.join(ST, f'B8-30-{r}.png')).convert('RGBA')) for r in ('Z', 'ZW', 'W')]
    b = max(im.width for _, im in beelden)
    h = max(im.height for _, im in beelden)
    at = Image.new('RGBA', (b * len(beelden), h), (0, 0, 0, 0))
    frames = []
    for i, (r, im) in enumerate(beelden):
        a = np.asarray(im)[:, :, 3] > 0
        ys, xs = np.nonzero(a)
        onder = int(ys.max()) + 1
        voet = xs[ys >= onder - 3]
        x, y = i * b + (b - im.width) // 2, h - im.height
        at.alpha_composite(im, (x, y))
        info = json.load(open(os.path.join(ST, f'B8-30-{r}.json'), encoding='utf-8'))
        frames.append({'naam': f'soldaat-idle-{r}', 'richting': r, 'animatie': 'idle', 'frame': 0, 'x': x, 'y': y, 'b': im.width,
                       'h': im.height, 'pivot': [int(round(float(voet.mean()))), onder], 'voetlijn': onder,
                       'palet_per_groep': info['palet_per_groep'], 'sha256': info['sha256']})
    at.save(os.path.join(O, 'atlas-soldaat-idle.png'))
    meta = {'versie': json.load(open(os.path.join(HIER, 'spriteafwerking.json'), encoding='utf-8'))['versie'],
            'bron': 'gedrongen/bron/soldaat.blend, stijlen.py -- A8 30 <richting> en -- soort 30 <richting>, spriteafwerking.py',
            'lijfhoogte_px': 72, 'atlas': 'atlas-soldaat-idle.png', 'maat': list(at.size), 'frames': frames,
            'sha256_atlas': hashlib.sha256(np.asarray(at).tobytes()).hexdigest()}
    json.dump(meta, open(os.path.join(O, 'atlas-soldaat-idle.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('ATLAS', meta['maat'], [f['pivot'] for f in frames])


if __name__ == '__main__':
    opdracht = sys.argv[1]
    if opdracht == 'sprite':
        sprite(sys.argv[2], sys.argv[3], float(sys.argv[4]) if len(sys.argv) > 4 else 72)
    else:
        {'voor': voor, 'na': na, 'bladen': bladen, 'atlas': atlas}[opdracht](*sys.argv[2:3])
