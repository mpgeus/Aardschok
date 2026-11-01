# De afwerking per materiaal (Marcel, 29 okt, ronde 8, experiment B: "een gecontroleerde afwerkingspipeline die
# kleurgradaties vereenvoudigt, materiaalstructuur behoudt, vormschaduwen versterkt, kleurclusters organiseert ... de
# oorspronkelijke silhouette exact behoudt"; "Gebruik geen uniforme filter over het hele personage"). Uit een render en
# het masker van de materiaalgroepen (stijlen.py -- soort, dezelfde camera) een sprite op een lichaamshoogte:
# 1. verkleinen per materiaal: per spritepixel wint de groep die het meest van het blok bedekt, en de kleur is het
#    gemiddelde (in lineair licht) van alleen die groep: geen kleur loopt over een grens tussen materialen;
# 2. de alfa is die van de bron, verkleind en op 0,5 afgekapt: het silhouet is precies dat van de bron;
# 3. per groep het contrast van het licht rond zijn gemiddelde ('contrast': staal hard, stof zacht) en een eigen klein
#    palet ('kleuren', k-means in Lab met een vaste start): heldere kleurclusters per materiaal;
# 4. donkere vormaccenten: de buitenste rij van het silhouet donkerder ('rand'), en op een grens tussen twee groepen de
#    donkerste kant ('naad'); nooit een pixel buiten het silhouet.
# Alles staat in spriteafwerking.json, met een versie; zelfde invoer en instellingen geven hetzelfde beeld (numpy, geen
# toeval).
#
#   python spriteafwerking.py <render.png> <soort.png> <uit.png> [lijfhoogte] [instellingen.json]
# schrijft <uit.png> (de sprite) en <uit>.json (de instellingen, de groepen per pixel, de tijd).
import hashlib
import json
import os
import sys
import time

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import meten  # noqa: E402

GROEP_KLEUR = {'staal': (255, 0, 0), 'malien': (0, 255, 0), 'stof': (0, 0, 255), 'leer': (255, 255, 0), 'huid': (255, 0, 255),
               'hout': (0, 255, 255), 'anders': (128, 128, 128)}  # zoals stijlen.GROEP_KLEUR
GROEPEN = list(GROEP_KLEUR)


def lineair(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def srgb(l):
    l = np.clip(l, 0, 1)
    return np.where(l <= 0.0031308, l * 12.92, 1.055 * l ** (1 / 2.4) - 0.055) * 255.0


def lab(lin):
    X = lin @ np.array([0.4124, 0.3576, 0.1805]) / 0.95047
    Y = lin @ np.array([0.2126, 0.7152, 0.0722])
    Z = lin @ np.array([0.0193, 0.1192, 0.9505]) / 1.08883
    f = lambda x: np.where(x > 0.008856, np.cbrt(x), 7.787 * x + 16 / 116)
    return np.stack([116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))], axis=-1)


def lijf_hoogte(alfa):
    """De lichaamshoogte zonder speer in pixels (meten.masker op zo'n 110 pixels hoog, zoals stijlblad.lijf)."""
    im = Image.fromarray((alfa * 255).astype(np.uint8))
    f = min(1.0, 110 / im.height)
    klein = im.resize((max(1, round(im.width * f)), round(im.height * f)), Image.BOX)
    rgba = Image.merge('RGBA', (klein, klein, klein, klein))
    m, _ = meten.masker(rgba)
    ys = np.nonzero(m.any(axis=1))[0]
    return (ys.max() + 1 - ys.min()) / f


def verklein(a, b, h):
    """Een vlak van floats naar b bij h met de gemiddelden per blok (PIL BOX: vast en exact)."""
    return np.asarray(Image.fromarray(a.astype(np.float32), mode='F').resize((b, h), Image.BOX), dtype=np.float64)


def groepen_van(soort):
    rgb = soort[:, :, :3].astype(np.int32)
    kl = np.array(list(GROEP_KLEUR.values()))
    d = ((rgb[:, :, None, :] - kl[None, None]) ** 2).sum(-1)
    return d.argmin(-1)


def kmeans(x, k, rondes=12):
    """k clusters in x (n bij 3), vast begonnen op de kwantielen van de eerste as (L): geen toeval."""
    if len(x) <= k:
        return x.copy(), np.arange(len(x))
    volg = np.argsort(x[:, 0], kind='stable')
    c = x[volg[((np.arange(k) + 0.5) / k * len(x)).astype(int)]].copy()
    for _ in range(rondes):
        nr = ((x[:, None, :] - c[None]) ** 2).sum(-1).argmin(1)
        for j in range(k):
            if (nr == j).any():
                c[j] = x[nr == j].mean(0)
    return c, nr


def afwerken(render, soort, lijf_px, I):
    t0 = time.time()
    a = render[:, :, 3] / 255.0
    lin = lineair(render[:, :, :3].astype(np.float64))
    g = groepen_van(soort)
    s = lijf_px / lijf_hoogte(a)
    B, H = max(1, round(render.shape[1] * s)), max(1, round(render.shape[0] * s))
    # 1 en 2: per groep het gewicht (alfa binnen de groep) en de kleur maal het gewicht, verkleind
    W = np.stack([verklein(a * (g == i), B, H) for i in range(len(GROEPEN))], -1)
    C = np.stack([np.stack([verklein(lin[:, :, c] * a * (g == i), B, H) for c in range(3)], -1) for i in range(len(GROEPEN))], 2)
    alfa = verklein(a, B, H) >= 0.5
    gp = W.argmax(-1)
    w = np.take_along_axis(W, gp[..., None], -1)[..., 0]
    kleur = np.take_along_axis(C, gp[..., None, None], 2)[:, :, 0] / np.maximum(w, 1e-9)[..., None]
    # 3: per groep contrast en een eigen palet
    Y = kleur @ np.array([0.2126, 0.7152, 0.0722])
    uit = kleur.copy()
    palet = {}
    for i, naam in enumerate(GROEPEN):
        m = alfa & (gp == i)
        if not m.any():
            continue
        G = I['groepen'].get(naam, I['groepen']['anders'])
        y = Y[m]
        ym = np.exp(np.log(np.maximum(y, 1e-4)).mean())
        y2 = ym * (np.maximum(y, 1e-4) / ym) ** G['contrast']
        k = kleur[m] * (y2 / np.maximum(y, 1e-4))[:, None]
        c, nr = kmeans(lab(np.clip(k, 0, 1)), G['kleuren'])
        cent = np.stack([k[nr == j].mean(0) if (nr == j).any() else k.mean(0) for j in range(len(c))])
        uit[m] = cent[nr]
        palet[naam] = len(cent)
    # 4: donkere vormaccenten binnen het silhouet
    buur = lambda x, dy, dx: np.roll(np.roll(x, dy, 0), dx, 1)
    rand = np.zeros_like(alfa)
    naad = np.zeros_like(alfa)
    Yu = uit @ np.array([0.2126, 0.7152, 0.0722])
    for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        rand |= alfa & ~buur(alfa, dy, dx)
        naad |= alfa & buur(alfa, dy, dx) & (buur(gp, dy, dx) != gp) & (Yu < buur(Yu, dy, dx))
    uit[rand] *= I['rand']
    uit[naad & ~rand] *= I['naad']
    rgba = np.zeros((H, B, 4), np.uint8)
    rgba[..., :3] = np.round(srgb(uit)).astype(np.uint8)
    rgba[..., 3] = alfa * 255
    rgba[~alfa] = 0
    return rgba, {'schaal': s, 'maat': [B, H], 'palet_per_groep': palet, 'seconden': round(time.time() - t0, 3),
                  'groepen_pixels': {n: int((alfa & (gp == i)).sum()) for i, n in enumerate(GROEPEN)}}


def main():
    render_p, soort_p, uit_p = sys.argv[1:4]
    lijf_px = float(sys.argv[4]) if len(sys.argv) > 4 else None
    I = json.load(open(sys.argv[5] if len(sys.argv) > 5 else os.path.join(HIER, 'spriteafwerking.json'), encoding='utf-8'))
    render = np.asarray(Image.open(render_p).convert('RGBA'))
    soort = np.asarray(Image.open(soort_p).convert('RGBA'))
    rgba, info = afwerken(render, soort, lijf_px or I['lijf_px'], I)
    Image.fromarray(rgba).save(uit_p)
    info.update({'versie': I['versie'], 'instellingen': I, 'bron': os.path.basename(render_p), 'masker': os.path.basename(soort_p),
                 'sha256': hashlib.sha256(rgba.tobytes()).hexdigest()})
    json.dump(info, open(os.path.splitext(uit_p)[0] + '.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('AFWERKING', uit_p, info['maat'], info['seconden'], 's', info['sha256'][:12])


if __name__ == '__main__':
    main()
