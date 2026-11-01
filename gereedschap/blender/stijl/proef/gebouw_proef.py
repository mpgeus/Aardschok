# Proef: een aanzicht van Marcels gebouwplaat los uit de plaat, op de maat van een voet op het raster. Alleen om in de browser te bekijken.
#   python gebouw_proef.py <uit-map>
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ni

R = 'C:/Users/mpgeu/Desktop/Claude Code/Aardschok/docs/art/referentie/aardschok-gebouw-'
uit = sys.argv[1]
os.makedirs(uit, exist_ok=True)
# naam, zoekvak van het aanzicht ZW in de plaat, voet in tegels (b, h)
GEBOUWEN = {
    'burcht': ((262, 526), (8, 6)),
    'bakkerij': ((258, 528), (8, 6)),
    'molen': ((286, 518), (6, 8)),
    'stal': ((283, 519), (7, 5)),
    'huis-riet': ((260, 520), (6, 5)),
}
# de rook staat op de plaat, en het spel maakt zijn eigen: alles boven de schoorsteen gaat weg (de bovenkant in de plaat)
TOP = {'bakkerij': 237, 'huis-riet': 247}
TEGEL_B, TEGEL_H = 64, 32


def los(im, vak, y_letters):
    """De figuur los van het grijs: wat vanaf de rand van het vak grijs is en grijs blijft, gaat weg."""
    x0, x1 = vak
    a = im[:y_letters, x0:x1].astype(np.float64)
    bg = np.median(np.concatenate([a[:20].reshape(-1, 3), a[-6:].reshape(-1, 3)]), axis=0)
    verz = a.max(2) - a.min(2)
    # de achtergrond: dicht bij het grijs en bijna zonder kleur (de zachte schaduw en de rook ook)
    grijs = (np.abs(a - bg).sum(2) < 42) & (verz < 16)
    lab, _ = ni.label(grijs)
    rand = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    weg = np.isin(lab, rand[rand > 0])
    # kleine gaatjes in de figuur blijven dicht; open gaten (tussen wieken, onder een dak) waren al met de rand verbonden of groot
    weg = ni.binary_opening(weg, iterations=1) | (weg & ~ni.binary_dilation(~weg, iterations=1))
    alfa = (~weg).astype(np.float32)
    alfa = ni.gaussian_filter(alfa, 0.7)
    alfa = np.clip((alfa - 0.35) / 0.3, 0, 1)
    # alleen het grootste stuk: de buurman op de plaat steekt soms het vak in
    stuk, n = ni.label(alfa > 0.5)
    if n > 1:
        tel = ni.sum(np.ones_like(stuk), stuk, range(1, n + 1))
        grootste = 1 + int(np.argmax(tel))
        for i in set(np.unique(np.concatenate([stuk[:, 0], stuk[:, 1], stuk[:, -2], stuk[:, -1]]))) - {0, grootste}:
            alfa = alfa * ni.binary_erosion(stuk != i, iterations=1, border_value=1) * (stuk != i)
    return a, alfa


info = {}
for naam, (vak, voet) in GEBOUWEN.items():
    im = np.asarray(Image.open(f'{R}{naam}-draai.png').convert('RGB'))
    # het vak: de kolom met de minste figuur rond de rand van het opgegeven vak
    f_ = (np.abs(im.astype(float) - np.median(im[:20].reshape(-1, 3), axis=0)).sum(2) > 60) & ((im.max(2).astype(int) - im.min(2)) > 22)
    prof = ni.uniform_filter1d(f_[:vak[1] * 3].sum(0).astype(float), 3)
    vak = (vak[0] - 12 + int(np.argmin(prof[vak[0] - 12:vak[0] + 20])), vak[1] - 20 + int(np.argmin(prof[vak[1] - 20:vak[1] + 12])))
    # de letters: de eerste rij onder de figuur met alleen wit en grijs; het gras is het laagste met kleur
    s = np.abs(im[:, vak[0]:vak[1]].astype(float) - np.median(im[:20].reshape(-1, 3), axis=0)).sum(2)
    verz = im[:, vak[0]:vak[1]].max(2).astype(int) - im[:, vak[0]:vak[1]].min(2)
    rij = np.nonzero(((s > 60) & (verz > 22)).sum(1) > 2)[0]
    y_onder = int(rij.max())
    a, alfa = los(im, vak, y_onder + 12)
    if naam in TOP:
        alfa[:TOP[naam]] = 0
    # het gras: het breedste stuk van de voet, onderaan
    g = alfa > 0.5
    groen = g & (a[:, :, 1] > a[:, :, 0] * 0.95) & (a[:, :, 1] > a[:, :, 2] * 1.25)
    xs = np.nonzero(groen.sum(0) > 0)[0]
    # de hele schijf: van onder af de breedste rij, op de rijen onder de helft
    hg = g.copy()
    hg[: int(y_onder * 0.5)] = False
    br = [np.ptp(np.nonzero(r)[0]) if r.any() else 0 for r in hg]
    y_br = int(np.argmax(br))
    xr = np.nonzero(hg[y_br])[0]
    breed = int(np.ptp(xr))
    cx = float(xr.min() + xr.max()) / 2
    cy = float(y_onder - breed / 4)
    b, h = voet
    s_ = (b + h) * TEGEL_B / 2 / breed
    rgba = np.dstack([a, alfa * 255]).clip(0, 255).astype(np.uint8)
    bb = Image.fromarray(rgba, 'RGBA').getbbox()
    kl = Image.fromarray(rgba, 'RGBA').crop(bb)
    w2, h2 = round(kl.width * s_), round(kl.height * s_)
    # alfa-gewogen vergroten, zodat de rand niet naar het grijs trekt
    arr = np.asarray(kl, dtype=np.float32) / 255
    pm = np.dstack([arr[:, :, :3] * arr[:, :, 3:4], arr[:, :, 3]])
    kanalen = [Image.fromarray(pm[:, :, i]).resize((w2, h2), Image.LANCZOS) for i in range(4)]
    pm2 = np.dstack([np.asarray(c) for c in kanalen])
    al2 = np.clip(pm2[:, :, 3], 1e-4, 1)
    rgb2 = np.clip(pm2[:, :, :3] / al2[:, :, None], 0, 1)
    uitk = Image.fromarray((np.dstack([rgb2, np.clip(pm2[:, :, 3], 0, 1)]) * 255).astype(np.uint8), 'RGBA')
    r_, g_, b_, a_ = uitk.split()
    uitk = Image.merge('RGB', (r_, g_, b_)).filter(ImageFilter.UnsharpMask(radius=1.2, percent=70, threshold=2))
    uitk.putalpha(a_)
    pad = f'{uit}/{naam}.png'
    uitk.save(pad, optimize=True)
    # het anker is de bovenste hoek van de voet
    mx, my = (cx - bb[0]) * s_, (cy - bb[1]) * s_
    ax = mx - (b - h) * TEGEL_B / 4
    ay = my - (b + h) * TEGEL_H / 4
    info[naam] = {'bestand': os.path.basename(pad), 'cel': [0, 0, uitk.width, uitk.height], 'anker': [round(ax), round(ay)], 'beslaat': [b, h], 'schaal': round(s_, 2), 'breed': breed, 'plaatH': int(y_onder - rij.min()), 'KB': round(os.path.getsize(pad) / 1024)}
    print(naam, vak, info[naam])
json.dump(info, open(f'{uit}/gebouwen.json', 'w'), indent=1)
# een controleplaat: de vier naast elkaar op groen, met de voet als ruit
d = Image.new('RGB', (2300, 800), (92, 130, 62))
x = 20
from PIL import ImageDraw
t = ImageDraw.Draw(d)
for naam, g in info.items():
    im = Image.open(f'{uit}/{naam}.png')
    ax, ay = g['anker']
    y0 = 720 - ay - (g['beslaat'][0] + g['beslaat'][1]) * 16
    d.paste(im, (x, y0), im)
    tx, ty = x + ax, y0 + ay
    b, h = g['beslaat']
    p = [(tx, ty), (tx + b * 32, ty + b * 16), (tx + (b - h) * 32, ty + (b + h) * 16), (tx - h * 32, ty + h * 16)]
    t.line(p + [p[0]], fill=(255, 255, 255), width=1)
    x += im.width + 20
d.save(sys.argv[2])
