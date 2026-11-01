# De vergelijking van ronde 10 (Marcel, 29 okt: "Maak een groot contactblad met A. de oorspronkelijke Aardschok-referentie,
# B. de spearman uit ronde 7, C. de nieuwe HumGen3D-spearman uit ronde 10 ... afzonderlijke vergelijkingen van helm,
# gezicht, schouders, tabberd, armen, handschoenen, laarzen, speer, silhouet en materiaalafwerking ... op hoge resolutie en
# op 74 pixels"). Alles op dezelfde lichaamshoogte en voetlijn (stijlblad.schaal), ZW op de draai van de speerman.
# - 10-vergelijking-groot.png en 11-vergelijking-74px.png (basismens/ronde8.rij: het ChatGPT-doel apart);
# - 12-onderdelen.png: per onderdeel een uitsnede op vaste plekken (delen van de lichaamshoogte) bij alle drie;
# - de sprites op 220 en 74 pixels (de gewone verkleining, en de afwerking per materiaal van ronde 8).
#
#   python gereedschap/blender/humgen/vergelijk10.py <uitmap>
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import blad  # noqa: E402
import ronde8  # noqa: E402
import soldaat_blad  # noqa: E402
import spriteafwerking as SA  # noqa: E402
import stijlblad as SB  # noqa: E402

U = os.path.join(SB.WORTEL, 'gereedschap', 'pixelart', 'uit', 'basismens')
R7, R10 = os.path.join(U, 'gedrongen', 'stijlen'), os.path.join(U, 'humgen', 'stijlen')
O = os.path.abspath(sys.argv[1])
lees = lambda p: Image.open(p).convert('RGBA')
# (naam, boven, onder, links, rechts) in delen van de lichaamshoogte, vanaf de kruin van de helm en het midden van het lijf
DELEN = [('helm', -0.02, 0.17, -0.17, 0.17), ('gezicht', 0.07, 0.21, -0.11, 0.11), ('schouders', 0.13, 0.33, -0.3, 0.3),
         ('tabberd', 0.24, 0.62, -0.22, 0.22), ('armen', 0.18, 0.56, -0.36, 0.36), ('handschoenen', 0.38, 0.6, -0.36, 0.36),
         ('laarzen', 0.74, 1.01, -0.26, 0.26)]


def uitsnede(im, naam, b0, b1, x0, x1, hoog=1000):
    s, _ = SB.schaal(im, hoog)
    top, onder, cx = SB.lijf(s)
    vak = Image.new('RGBA', (round((x1 - x0) * hoog), round((b1 - b0) * hoog)), SB.ACHTER)
    vak.alpha_composite(s.crop((round(cx + x0 * hoog), round(top + b0 * hoog), round(cx + x1 * hoog), round(top + b1 * hoog))))
    return vak


def speerpunt(im, hoog=1000):
    """De punt van de speer: het bovenste stuk van het beeld, rond de kolom van de speer (links van het lijf)."""
    s, _ = SB.schaal(im, hoog)
    a = np.asarray(s)[:, :, 3] > 128
    ys, xs = np.nonzero(a)
    y0 = ys.min()
    kol = xs[ys < y0 + 40].mean()
    vak = Image.new('RGBA', (160, 300), SB.ACHTER)
    vak.alpha_composite(s.crop((round(kol - 80), y0 - 10, round(kol + 80), y0 + 290)))
    return vak


def main():
    os.makedirs(O, exist_ok=True)
    spel = soldaat_blad.speerman()[0]['ZW']
    b_, o_, _ = SB.lijf(spel)
    SB.KLEIN = round(o_ - b_)
    s30 = lees(os.path.join(SB.SPEERMAN, 'eigen-ZW-iso-staan.png'))
    af7, _, klein7 = SB.hdpixel(R7)
    r10 = lees(os.path.join(R10, 'A8-30.png'))
    # de sprites van ronde 10: gewoon verkleind (220 en 74), en met de afwerking per materiaal (74)
    ronde8.sprite(os.path.join(R10, 'A8-30.png'), os.path.join(O, 'sprite-220.png'), 216)
    ronde8.sprite(os.path.join(R10, 'A8-30.png'), os.path.join(O, 'sprite-74.png'), SB.KLEIN)
    import json
    I = json.load(open(os.path.join(HIER, '..', 'basismens', 'spriteafwerking.json'), encoding='utf-8'))
    rgba, _ = SA.afwerken(np.asarray(r10), np.asarray(lees(os.path.join(R10, 'soort-30.png'))), SB.KLEIN, I)
    Image.fromarray(rgba).save(os.path.join(O, 'sprite-74-per-materiaal.png'))
    klein10 = lees(os.path.join(O, 'sprite-74.png'))
    kol = [('A  speerman (spel)', 'de referentie: zijn render\nop 30 graden en zijn vel', s30, spel),
           ('B  ronde 7', 'MakeHuman, gedrongen;\nHD-pixel C', af7, klein7),
           ('C  ronde 10', 'HumGen3D; materialen A8,\nCycles; gewoon verkleind', r10, klein10),
           ('C  ronde 10', 'op 74 px met de afwerking\nper materiaal (ronde 8)', r10, lees(os.path.join(O, 'sprite-74-per-materiaal.png')))]
    doel = Image.open(ronde8.CHATGPT).convert('RGB')
    ronde8.rij(kol[:3], doel, os.path.join(O, '10-vergelijking-groot.png'), groot=True)
    ronde8.rij(kol, doel, os.path.join(O, '11-vergelijking-74px.png'), groot=False)
    # de onderdelen
    lt = blad.letter(16)
    beelden = [('A speerman', s30), ('B ronde 7', lees(os.path.join(R7, 'C-30.png'))), ('C ronde 10', r10)]
    rijen = [(naam, [uitsnede(im, naam, *d) for _, im in beelden]) for naam, *d in DELEN]
    rijen.append(('speer', [speerpunt(im) for _, im in beelden]))
    hoog = 260
    rijen = [(n, [v.resize((round(v.width * hoog / v.height), hoog), Image.LANCZOS) for v in vs]) for n, vs in rijen]
    B = Image.new('RGB', (max(sum(v.width + 8 for v in vs) for _, vs in rijen) + 140, len(rijen) * (hoog + 8) + 36), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for j, (t, _) in enumerate(beelden):
        d.text((140 + j * ((B.width - 140) // 3), 8), t, font=lt, fill=(240, 236, 228))
    for i, (naam, vs) in enumerate(rijen):
        y = 32 + i * (hoog + 8)
        d.text((8, y + hoog // 2 - 8), naam, font=lt, fill=(240, 236, 228))
        x = 140
        for j, v in enumerate(vs):
            B.paste(v.convert('RGB'), (140 + j * ((B.width - 140) // 3), y))
    B.save(os.path.join(O, '12-onderdelen.png'))
    print('VERGELIJK10', sorted(os.listdir(O)))


if __name__ == '__main__':
    main()
