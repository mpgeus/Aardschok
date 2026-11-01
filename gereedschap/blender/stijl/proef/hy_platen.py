# Hunyuan3D-2mv: de vergelijkingsplaten. Regels van Marcel: gelijke celmaat, gelijke schaal, gelijke camera voor de 3D-renders, geen bijsnijden op de figuur, de voeten op één lijn, de hele speer in beeld, en elke kolom met zijn methode erbij.
# Een 3D-render is altijd hetzelfde vak uit hetzelfde beeld (2,0 m op 1024 pixels). Een plaat wordt op dezelfde meters per pixel gezet: de figuur van helm tot zool is 1,354 m.
#
#   python hy_platen.py <uitmap hunyuan> <bewijsmap>
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_invoer as HI  # noqa: E402
import platen4 as P4  # noqa: E402

VAK = (237, 0, 787, 1024)  # 550 bij 1024: de speer past er in elke richting in
GRIJS = (112, 111, 110)
DONKER = (30, 30, 30)
FIGUUR_M = 1.354
PX_M = 1024 / 2.0


def letter(g=15):
    try:
        return ImageFont.truetype('arial.ttf', g)
    except OSError:
        return ImageFont.load_default()


def render(pad):
    im = Image.open(pad).convert('RGBA').crop(VAK)
    d = Image.new('RGB', im.size, GRIJS)
    d.paste(im, (0, 0), im)
    return d


def voetlijn(pad):
    a = np.asarray(Image.open(pad).convert('RGBA'))[..., 3] > 127
    ys = np.nonzero(a[:, VAK[0]:VAK[2]].any(1))[0]
    return int(ys.max())


def plaat(naam, r, voet):
    """Een richting van een plaat op de meters per pixel van de renders, de zolen op de voetlijn. De figuur staat met zijn as in het midden."""
    HI.kies(naam)
    rgba, m = HI.vrijstaand(r)
    romp = P4.dun_weg(m)
    ys = np.nonzero(romp.any(1))[0]
    s = FIGUUR_M * PX_M / float(ys.max() - ys.min() + 1)
    vak = HI.ref_vak(r)
    g = vak.resize((round(vak.width * s), round(vak.height * s)), Image.LANCZOS)
    w, h = VAK[2] - VAK[0], VAK[3] - VAK[1]
    d = Image.new('RGB', (w, h), GRIJS)
    x = round(w / 2 - HI.as_x(m) * s)
    y = round(voet - (ys.max() + 1) * s)
    d.paste(g, (x, y))
    return d


def blad(uit, kolommen, richtingen, voet_van, cel=(300, 559), kop=44):
    """kolommen: (titel, functie(r) -> beeld)."""
    cw, ch = cel
    b = Image.new('RGB', (cw * len(kolommen) + 8 * (len(kolommen) - 1), (ch + 6) * len(richtingen) + kop), DONKER)
    t = ImageDraw.Draw(b)
    for i, (titel, _) in enumerate(kolommen):
        x = i * (cw + 8)
        for k, regel in enumerate(titel.split('\n')):
            t.text((x + 4, 3 + k * 18), regel, fill=(240, 240, 240), font=letter(14))
    for j, r in enumerate(richtingen):
        for i, (_, f) in enumerate(kolommen):
            b.paste(f(r).resize((cw, ch), Image.LANCZOS), (i * (cw + 8), kop + j * (ch + 6)))
        t.text((6, kop + j * (ch + 6) + 4), r, fill=(255, 235, 120), font=letter(20))
    b.save(uit)
    print(os.path.basename(uit), b.size)


def main():
    U, W = sys.argv[1], sys.argv[2]
    os.makedirs(W, exist_ok=True)
    P = os.path.join(U, 'proef')

    def uit(*d):
        return lambda r: render(os.path.join(U, *d, f'staan-{r}-00.png'))
    best_verf = ('proef', 'F', 'verf')
    voet = lambda r: voetlijn(os.path.join(U, *best_verf, f'staan-{r}-00.png'))
    vrij = lambda r: plaat('vrij', r, voet(r))
    # de hoofdplaat
    kol = [('1. Plaat van Marcel\n(zonder achtergrond)', vrij),
           ('2. Vorige beste Hunyuan\noude plaat, ruw, vlakke camera, klei', uit('proef', 'A', 'ruw-vlak')),
           ('3. Nieuwe plaat, verbeterd, klei\nmaximale mesh, detailpass, speer los', uit('proef', 'F', 'klei')),
           ('4. Alleen de verf van de plaat\ngeen detailpass, geen echt licht', uit('proef', 'A', 'alleen-verf')),
           ('5. Eindkeuze\nverf, detailpass, 30% echt licht', uit(*best_verf))]
    blad(os.path.join(W, 'hy-vergelijking.png'), kol, ['Z', 'N', 'W', 'O'], voet)
    # de andere vier richtingen: die zaten niet in de invoer en niet in de verf
    kol = [('Plaat\nniet gebruikt voor mesh of verf', vrij), ('Eindkeuze in klei', uit('proef', 'F', 'klei')), ('Eindkeuze\n10 graden', uit(*best_verf)), ('Eindkeuze\nspelcamera, 30 graden', uit('proef', 'F', 'verf-30'))]
    blad(os.path.join(W, 'hy-diagonalen.png'), kol, ['ZW', 'NW', 'NO', 'ZO'], voet)
    # proef A: vorm, zelfde klei, camera en licht
    kol = [('V4', uit('v4', 'klei-e10')), ('Ruw, plaat detail', uit('proef', 'A', 'ruw-detail')), ('Ruw, plaat acht', uit('proef', 'A', 'ruw-acht')), ('Ruw, nieuwe plaat', uit('proef', 'A', 'ruw-vrij')), ('Eindkeuze', uit('proef', 'A', 'eind'))]
    blad(os.path.join(W, 'proef-A-vorm.png'), kol, ['Z', 'N', 'W', 'O'], voet, cel=(260, 484))
    # proef B: materiaal, zelfde mesh en licht
    kol = [(n, uit('proef', 'B', d)) for n, d in (('Klei', 'klei'), ('Kleur, diffuus, echt licht', 'kleur'), ('Kleur met ruwheid\nen metaal, echt licht', 'pbr'), ('Alleen de verf, onverlicht', 'onverlicht'), ('Verf, contactschaduw', 'verf-ao'), ('Eindkeuze', 'eind'))]
    blad(os.path.join(W, 'proef-B-materiaal.png'), kol, ['Z', 'N'], voet, cel=(260, 484))
    # proef C: licht, zelfde mesh en ontlichte verf
    kol = [(n, uit('proef', 'C', d)) for n, d in (('Licht van het spel', 'spel'), ('Meer van voren, zachter', 'plaat'), ('Zacht', 'zacht'), ('Hoog', 'hoog'))]
    kol.insert(0, ('Plaat', vrij))
    blad(os.path.join(W, 'proef-C-licht.png'), kol, ['Z', 'N'], voet, cel=(260, 484))
    # proef E: detail, zelfde verf
    kol = [(n, uit('proef', 'E', d)) for n, d in (('Geen detailpass', 'geen'), ('Detailpass in de mesh', 'geometrie'), ('Detailpass, contactschaduw', 'geometrie-ao'), ('Plus de verf scherper', 'scherp'), ('Plus 30% echt licht\n(de eindkeuze)', 'echt-licht'), ('Lichte GLB met\nnormal map en texturen', 'glb'))]
    kol.insert(0, ('Plaat', vrij))
    blad(os.path.join(W, 'proef-E-detail.png'), kol, ['Z', 'N'], voet, cel=(240, 447))
    # proef D: resolutie, op spelmaat
    rs, res = ['Z', 'ZW'], ['768', '1536', '3072']
    uitk = {}
    D = os.path.join(P, 'D')
    cel = 80
    Sch = 5
    b = Image.new('RGB', (len(res) * (160 * 2 + 16), 2 * (cel * 2 * Sch // 2 + 8) + 30), DONKER)
    t = ImageDraw.Draw(b)
    ref = {}
    for j, r in enumerate(rs):
        for i, n in enumerate(reversed(res)):
            im = Image.open(os.path.join(D, n, f'staan-{r}-00.png')).convert('RGBA')
            # 3,0 m in beeld, 1,354 m is 80 pixels: voor elke resolutie hetzelfde doelbeeld
            maat = round(3.0 * 80.0 / FIGUUR_M)
            k = im.resize((maat, maat), Image.LANCZOS)
            if n == '3072':
                ref[r] = k
            else:
                v = np.asarray(k, dtype=np.float32) - np.asarray(ref[r], dtype=np.float32)
                uitk[f'{r}-{n}'] = round(float(np.abs(v[np.asarray(ref[r])[..., 3] > 127]).mean()), 2)
    print('D', uitk)
    import json
    with open(os.path.join(W, 'proef-D-resolutie.json'), 'w', encoding='utf-8') as f:
        json.dump({'verschil_met_3072_op_spelmaat_0_255': uitk}, f, indent=1)
    # op spelmaat: alle kandidaten en de plaat
    kandidaten = [('Plaat', None), ('Eindkeuze, 10 graden', ('proef', 'F', 'verf')), ('Eindkeuze, 30 graden', ('proef', 'F', 'verf-30'))]
    alle = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']
    cw, ch = 62, 120
    Z_ = 4
    sp = Image.new('RGB', (len(alle) * cw * Z_, len(kandidaten) * (ch * Z_ + 24)), GRIJS)
    t = ImageDraw.Draw(sp)
    for j, (naam, d) in enumerate(kandidaten):
        t.text((6, j * (ch * Z_ + 24) + 2), f'{naam}, op spelmaat (figuur 80 pixels), vier keer vergroot', fill=(255, 255, 255), font=letter(16))
        for i, r in enumerate(alle):
            if d is None:
                HI.kies('vrij')
                rgba, m = HI.vrijstaand(r)
                im = Image.fromarray(rgba)
                ma = m
            else:
                im = Image.open(os.path.join(U, *d, f'staan-{r}-00.png')).convert('RGBA')
                ma = np.asarray(im)[..., 3] > 127
            romp = P4.dun_weg(ma)
            ys = np.nonzero(romp.any(1))[0]
            s = 80.0 / (ys.max() - ys.min() + 1)
            k = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
            x = round(cw / 2 - (HI.as_x(ma) if d is None else im.width / 2) * s)
            y = round(ch - 4 - (ys.max() + 1) * s)
            c = Image.new('RGBA', (cw, ch), (112, 111, 110, 255))
            c.alpha_composite(k, (max(x, 0), max(y, 0)), (max(-x, 0), max(-y, 0)))
            sp.paste(c.convert('RGB').resize((cw * Z_, ch * Z_), Image.NEAREST), (i * cw * Z_, j * (ch * Z_ + 24) + 24))
    sp.save(os.path.join(W, 'hy-spelmaat.png'))
    print('spelmaat', sp.size)


if __name__ == '__main__':
    main()
