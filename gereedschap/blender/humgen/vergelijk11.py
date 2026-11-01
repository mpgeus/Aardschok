# De vergelijking van ronde 11 (Marcel, 29 okt: "A — Baseline: de bestaande ronde-10-spearman. B — Nieuwe
# kledinggeometrie met eenvoudige neutrale materialen. C — Nieuwe kleding plus hoogwaardige PBR-materialen"): alles op
# dezelfde camera (30 graden, ZW op de draai van de speerman), lichaamshoogte en voetlijn.
# - A en B met de eenvoudige materialen van het spel (stijl C), C met de materialen van A8 (Poly Haven, slijtage,
#   vormschaduw): A tegen B is het effect van de kleding, B tegen C dat van de materialen;
# - 20-abc-groot.png, 21-abc-74px.png (met de speerman, ronde 7 en het ChatGPT-doel), 22-abc-220px.png,
#   23-onderdelen.png (speerman, ronde 10, ronde 11), 24-materialen.png (de close-ups van C).
#
#   python gereedschap/blender/humgen/vergelijk11.py <uitmap>
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
sys.path.insert(0, HIER)
import blad  # noqa: E402
import ronde8  # noqa: E402
import soldaat_blad  # noqa: E402
import spriteafwerking as SA  # noqa: E402
import stijlblad as SB  # noqa: E402
import vergelijk10 as V10  # noqa: E402

U = os.path.join(SB.WORTEL, 'gereedschap', 'pixelart', 'uit', 'basismens')
R7, R10, R11 = os.path.join(U, 'gedrongen', 'stijlen'), os.path.join(U, 'humgen', 'r10'), os.path.join(U, 'humgen11', 'stijlen')
O = os.path.abspath(sys.argv[1])
lees = lambda p: Image.open(p).convert('RGBA')


def raster(paden, titels, h, uit):
    ims = []
    for p in paden:
        im = lees(p)
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
        bg = Image.new('RGBA', im.size, SB.ACHTER)
        bg.alpha_composite(im)
        ims.append(bg.convert('RGB'))
    B = Image.new('RGB', (sum(i.width + 6 for i in ims) + 6, h + 30), (30, 30, 30))
    d = ImageDraw.Draw(B)
    x = 6
    for im, t in zip(ims, titels):
        B.paste(im, (x, 26))
        d.text((x + 3, 7), t, font=blad.letter(14), fill=(235, 230, 222))
        x += im.width + 6
    B.save(os.path.join(O, uit))


def main():
    os.makedirs(O, exist_ok=True)
    spel = soldaat_blad.speerman()[0]['ZW']
    b_, o_, _ = SB.lijf(spel)
    SB.KLEIN = round(o_ - b_)
    s30 = lees(os.path.join(SB.SPEERMAN, 'eigen-ZW-iso-staan.png'))
    af7, _, klein7 = SB.hdpixel(R7)
    I = json.load(open(os.path.join(HIER, '..', 'basismens', 'spriteafwerking.json'), encoding='utf-8'))
    # (rij() verkleint een kolom waarvan de naam met B begint met NEAREST, dus de letter staat achteraan)
    versies = [('ronde 10 (A)', 'A', os.path.join(R10, 'C-30.png'), 'HumGen, kleren van ronde 10;\neenvoudige materialen'),
               ('ronde 11 (B)', 'B', os.path.join(R11, 'C-30.png'), 'nieuwe tabberd en gambeson;\neenvoudige materialen'),
               ('ronde 11 (C)', 'C', os.path.join(R11, 'A8-30.png'), 'nieuwe kleding + PBR\n(Poly Haven, A8)')]
    kol = [('speerman (spel)', 'de referentie', s30, spel), ('ronde 7', 'MakeHuman, gedrongen;\nHD-pixel C', af7, klein7)]
    for naam, kort, p, uitleg in versies:
        ronde8.sprite(p, os.path.join(O, f'sprite-{kort}-74.png'), SB.KLEIN)
        ronde8.sprite(p, os.path.join(O, f'sprite-{kort}-220.png'), 216)
        kol.append((naam, uitleg, lees(p), lees(os.path.join(O, f'sprite-{kort}-74.png'))))
    # C ook met de afwerking per materiaal (ronde 8) op 74 px
    rgba, _ = SA.afwerken(np.asarray(lees(os.path.join(R11, 'A8-30.png'))), np.asarray(lees(os.path.join(R11, 'soort-30.png'))), SB.KLEIN, I)
    Image.fromarray(rgba).save(os.path.join(O, 'sprite-C-74-per-materiaal.png'))
    doel = Image.open(ronde8.CHATGPT).convert('RGB')
    ronde8.rij(kol, doel, os.path.join(O, '20-abc-groot.png'), groot=True)
    ronde8.rij(kol + [('per materiaal (C)', 'op 74 px met de\nafwerking van ronde 8', lees(os.path.join(R11, 'A8-30.png')),
                       lees(os.path.join(O, 'sprite-C-74-per-materiaal.png')))], doel, os.path.join(O, '21-abc-74px.png'), groot=False)
    # 220 px: de drie naast elkaar, 2x vergroot
    ims = [lees(os.path.join(O, f'sprite-{k}-220.png')) for k in 'ABC']
    B = Image.new('RGB', (sum(i.width * 2 + 10 for i in ims) + 10, max(i.height for i in ims) * 2 + 30), (34, 32, 30))
    d = ImageDraw.Draw(B)
    x = 10
    for k, im in zip('ABC', ims):
        vak = Image.new('RGBA', (im.width * 2, im.height * 2), SB.ACHTER)
        vak.alpha_composite(im.resize((im.width * 2, im.height * 2), Image.NEAREST))
        B.paste(vak.convert('RGB'), (x, 28))
        d.text((x + 4, 6), f'{k}: 220 px, 2x', font=blad.letter(14), fill=(235, 230, 222))
        x += im.width * 2 + 10
    B.save(os.path.join(O, '22-abc-220px.png'))
    # de onderdelen: speerman, ronde 10 (A), ronde 11 (C)
    lt = blad.letter(16)
    beelden = [('speerman', s30), ('ronde 10 (A)', lees(os.path.join(R10, 'A8-30.png'))), ('ronde 11 (C)', lees(os.path.join(R11, 'A8-30.png')))]
    rijen = [(naam, [V10.uitsnede(im, naam, *d) for _, im in beelden]) for naam, *d in V10.DELEN]
    hoog = 240
    rijen = [(n, [v.resize((round(v.width * hoog / v.height), hoog), Image.LANCZOS) for v in vs]) for n, vs in rijen]
    B = Image.new('RGB', (max(sum(v.width + 8 for v in vs) for _, vs in rijen) + 140, len(rijen) * (hoog + 8) + 36), (34, 32, 30))
    d = ImageDraw.Draw(B)
    for j, (t, _) in enumerate(beelden):
        d.text((140 + j * ((B.width - 140) // 3), 8), t, font=lt, fill=(240, 236, 228))
    for i, (naam, vs) in enumerate(rijen):
        y = 32 + i * (hoog + 8)
        d.text((8, y + hoog // 2 - 8), naam, font=lt, fill=(240, 236, 228))
        for j, v in enumerate(vs):
            B.paste(v.convert('RGB'), (140 + j * ((B.width - 140) // 3), y))
    B.save(os.path.join(O, '23-onderdelen.png'))
    raster([os.path.join(R11, f'detail-{n}.png') for n in ('romp', 'hoofd', 'kraag', 'laarzen', 'speer')],
           ['gambeson en tabberd', 'helm', 'maliënkap', 'laarzen', 'speer'], 360, '24-materialen.png')
    print('VERGELIJK11', sorted(os.listdir(O)))


if __name__ == '__main__':
    main()
