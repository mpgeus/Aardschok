# Van render naar sprite, en van sprites naar vel met JSON (vraag 192). Eén vaste schaal en één vast anker voor alle richtingen en
# beelden: de render staat al op een vaste plek (de camera beweegt niet), dus het verkleinen en snijden gaat voor elk beeld gelijk,
# en de voeten blijven op dezelfde pixel. Op spelmaat komt de afwerking die de plaat zo helder maakt: een rand die per kant donkerder
# is, lijnen tussen de lagen (uit het ID-beeld), en wat scherpte en kleur. Geen handwerk: dezelfde invoer geeft dezelfde vellen.
#
#   python vel.py <rendermap> <uitmap> <naam> <houding> <beelden> [fps=10] [px=80] [richtingen=Z,ZW,...] [zonder=lijnen]
#
# Alleen PIL en numpy (de Python van ComfyUI).
import json
import math
import os
import sys

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))

# de afwerking op spelmaat
AF = {'scherpte': 0.45, 'kleur': 1.10, 'lijn': 0.60, 'rand': 0.62, 'alfa': 110, 'zwart': (34, 20, 14)}


def schaal_van(render_px, ortho, px, lengte=None):
    """Hoeveel spelpixels per renderpixel: de lengte van de figuur wordt px pixels hoog, gemeten langs de camera."""
    e = math.radians(INST['camera']['elevatie'])
    per_meter = px / ((lengte or INST['spel']['lengte_meter']) * math.cos(e))
    return per_meter * ortho / render_px


def _kleiner(im, w):
    """Vierkant verkleinen; rgb gewogen met alfa, zodat de rand niet naar de achtergrond trekt."""
    a = np.asarray(im, dtype=np.float32) / 255.0
    pm = a[..., :3] * a[..., 3:4]
    m = np.dstack([pm, a[..., 3]])
    uit = np.stack([np.asarray(Image.fromarray(m[..., i], 'F').resize((w, w), Image.BOX)) for i in range(4)], axis=-1)
    al = uit[..., 3:4]
    rgb = uit[..., :3] / np.maximum(al, 1e-4)
    return rgb, al[..., 0]


def _id(im, w):
    """Het ID-beeld op spelmaat: per spelpixel het onderdeel dat er het meest ligt."""
    a = np.asarray(im.convert('RGBA'), dtype=np.int32)
    code = ((a[..., 0] // 64) * 16 + (a[..., 1] // 64) * 4 + (a[..., 2] // 64)) + 1
    code = np.where(a[..., 3] < 128, 0, code)
    H = a.shape[0]
    f = H / w
    uit = np.zeros((w, w), dtype=np.int32)
    for j in range(w):
        y0, y1 = int(j * f), max(int((j + 1) * f), int(j * f) + 1)
        for i in range(w):
            x0, x1 = int(i * f), max(int((i + 1) * f), int(i * f) + 1)
            b = code[y0:y1, x0:x1].ravel()
            uit[j, i] = np.bincount(b).argmax()
    return uit


def _vaag(a):
    k = np.array([1, 2, 1], dtype=np.float32) / 4
    b = np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 0, a)
    return np.apply_along_axis(lambda m: np.convolve(m, k, mode='same'), 1, b)


def afwerken(rgb, al, ids, af=None):
    """De afwerking op spelmaat: scherpte, kleur, lijnen tussen de lagen en een donkere rand aan de schaduwkant."""
    af = {**AF, **(af or {})}
    uit = np.clip(rgb, 0, 1).astype(np.float32)
    # scherpte (alleen op het licht, zodat de kleur blijft)
    helder = uit @ np.array([0.3, 0.59, 0.11], dtype=np.float32)
    uit = uit * (1.0 + af['scherpte'] * ((helder - _vaag(helder)) / np.maximum(helder, 0.05)))[..., None]
    # verzadiging
    helder = (uit @ np.array([0.3, 0.59, 0.11], dtype=np.float32))[..., None]
    uit = helder + (uit - helder) * af['kleur']
    binnen = al >= af['alfa'] / 255.0
    z = np.array(af['zwart'], dtype=np.float32) / 255.0
    if af['lijn'] > 0 and ids is not None:
        # een lijn op de plek waar twee onderdelen elkaar raken: aan de onderkant en rechts, zoals de schaduw valt
        lijn = np.zeros(ids.shape, dtype=bool)
        for dy, dx in ((1, 0), (0, 1)):
            buur = np.roll(ids, (-dy, -dx), axis=(0, 1))
            lijn |= (ids != buur) & (ids > 0) & (buur > 0)
        uit = np.where(lijn[..., None], uit * (1 - af['lijn']) + z * af['lijn'], uit)
    if af['rand'] > 0:
        # de rand van de figuur: per kant donkerder, niet één zwarte lijn; aan de kant van het licht minder
        for (dy, dx), f in (((1, 0), 1.0), ((0, 1), 1.0), ((-1, 0), 0.55), ((0, -1), 0.55)):
            buur = np.roll(binnen, (-dy, -dx), axis=(0, 1))
            r = binnen & ~buur
            uit = np.where(r[..., None], uit * (1 - af['rand'] * f) + z * af['rand'] * f, uit)
    a8 = np.where(binnen, 255, 0).astype(np.uint8)
    rgb8 = (np.clip(uit, 0, 1) * 255 + 0.5).astype(np.uint8)
    return Image.fromarray(np.dstack([rgb8, a8]), 'RGBA')


def sprite(pad, s, af=None):
    """Eén render op spelmaat; het hele vak blijft, dus het anker blijft op zijn plek."""
    im = Image.open(pad).convert('RGBA')
    w = max(1, round(im.width * s))
    rgb, al = _kleiner(im, w)
    idp = pad.replace('.png', '-id.png')
    ids = _id(Image.open(idp), w) if os.path.exists(idp) and (af or AF).get('lijn', AF['lijn']) > 0 else None
    return afwerken(rgb, al, ids, af)


def anker(render_px, ortho, s, doel_z=None):
    """Waar het voetpunt (de oorsprong, onder de figuur) in de verkleinde render staat."""
    e = math.radians(INST['camera']['elevatie'])
    w = round(render_px * s)
    # de camera kijkt naar doel_z; de oorsprong ligt doel_z * cos(e) onder het midden
    per_px = ortho / render_px
    dy = (doel_z or INST['camera']['doel_z']) * math.cos(e) / per_px * s
    return w / 2.0, w / 2.0 + dy


def hoofd():
    argv = sys.argv[1:]
    kaart, uitmap, naam, houding, beelden = argv[0], argv[1], argv[2], argv[3], int(argv[4])
    o = {'fps': 10, 'px': INST['spel']['lengte_px'], 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO', 'ortho': None, 'stappen': 1, 'marge': 2}
    af = {}
    for a in argv[5:]:
        k, v = a.split('=')
        if k == 'zonder':
            af[v] = 0.0
        elif k in AF:
            af[k] = float(v)
        else:
            o[k] = v
    os.makedirs(uitmap, exist_ok=True)
    meta = json.load(open(os.path.join(kaart, f'{houding}-render.json'), encoding='utf-8'))
    ortho = float(o['ortho'] or meta['ortho'])
    px = int(o['px'])
    render_px = meta['pixels']
    s = schaal_van(render_px, ortho, px, meta.get('lengte'))
    richt = o['richtingen'].split(',')
    stappen = int(o['stappen'])  # 2: elk tweede beeld uit de render (een vel van 12 uit 24)
    cellen = {}
    for r in richt:
        for i in range(beelden):
            cellen[(r, i)] = sprite(os.path.join(kaart, f'{houding}-{r}-{i * stappen:02d}.png'), s, af)
    # één vak voor het hele vel: het omsluit alle beelden in alle richtingen, en het anker ligt in elk beeld gelijk
    bbs = [c.getbbox() for c in cellen.values() if c.getbbox()]
    m = int(o['marge'])
    x0, y0 = min(b[0] for b in bbs) - m, min(b[1] for b in bbs) - m
    x1, y1 = max(b[2] for b in bbs) + m, max(b[3] for b in bbs) + m
    cb, ch = x1 - x0, y1 - y0
    vel = Image.new('RGBA', (cb * beelden, ch * len(richt)), (0, 0, 0, 0))
    for j, r in enumerate(richt):
        for i in range(beelden):
            vel.paste(cellen[(r, i)].crop((x0, y0, x1, y1)), (i * cb, j * ch))
    ax, ay = anker(render_px, ortho, s, meta.get('doel_z'))
    bestand = f'{naam}-{houding}.png'
    # hoe ver hij per pas vooruitgaat, in tegels (de beschrijving: stap), zodat de voet in het spel niet glijdt. Een stap over het raster is op
    # het scherm 32 bij 16 pixels; op de grond is 1 meter even veel pixels als de lengte, gemeten langs de camera.
    e = math.radians(meta['elevatie'] if isinstance(meta['elevatie'], (int, float)) else float(meta['elevatie']))
    per_meter = px / (meta.get('lengte', INST['spel']['lengte_meter']) * math.cos(e))
    tegel_m = math.hypot(INST['spel']['tegel'][0] / 2 / per_meter, INST['spel']['tegel'][1] / 2 / (per_meter * math.sin(e)))
    stap = round(meta['pas_meter'] / tegel_m, 4) if meta.get('pas_meter') else None
    vel.save(os.path.join(uitmap, bestand), optimize=True)
    gegevens = {'bestand': bestand, 'houding': houding, 'beelden': beelden, 'fps': float(o['fps']), 'herhaal': True, 'richtingen': richt,
                'stap': stap, 'cel': [cb, ch], 'anker': [round(ax - x0, 2), round(ay - y0, 2)], 'lengte_px': px, 'bron': {
                    'render_px': render_px, 'ortho': ortho, 'elevatie': meta['elevatie'], 'monsters': meta['monsters'], 'schaal': round(s, 5)}}
    with open(os.path.join(uitmap, f'{naam}-{houding}.json'), 'w', encoding='utf-8') as f:
        json.dump(gegevens, f, indent=1)
    print(bestand, 'cel', cb, ch, 'anker', gegevens['anker'], 'vel', vel.size)


if __name__ == '__main__':
    hoofd()
