# De speerman uit het model als vel voor het spel (vraag 190; Marcel, 26 okt: "kun je nu eens een animatie maken in
# game?"): staan, lopen, de steek (aanval), geraakt worden en sterven in acht richtingen uit eigen.py, op spelmaat, in de cellen en met het anker
# van het vel van de generator (beelden/beschrijving.json, figuren.speerman), zodat het spel ze zonder meer kan tonen. De
# vellen van de generator blijven staan: dit schrijft speerman3d-<houding>.png naar een eigen map, voor elke houding
# waarvan de renders er zijn.
#
# Eén schaal voor alle richtingen en beelden (het gemiddelde van de staande man naast het vel, zoals vergelijk.py
# uitlijnt), en het anker op de oorsprong van het model (midden onder de camera, op anker_y: waar de voeten staan), zodat
# hij bij het draaien en lopen niet verspringt. Met de rand van het vel (vergelijk.rand).
#
#   blender.exe -b -P gereedschap/blender/eigen.py -- <map> Z ZW W NW N NO O ZO [steek]   (staan en lopen, of de steek)
#   python spelvel.py <map> <uitmap> [procent] [schaal=<getal>]   (de Python van ComfyUI; procent van de render, 50 voor de
#   snelle; een map met alleen de steek krijgt de schaal van de staande man mee)
import json
import os
import sys

sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
import omtrek  # noqa: E402
import vergelijk  # noqa: E402
from PIL import Image  # noqa: E402

HIER = __file__.replace('\\', '/').rsplit('/', 1)[0]
FIGUUR = json.load(open(f'{HIER}/../../beelden/beschrijving.json', encoding='utf-8'))['figuren']['speerman']
ANKER_Y = 1860  # speerman_hd.INSTELLINGEN['anker_y'], bij 100 procent
# welke renders bij welke houding horen (de steek is de aanval van het spel)
RENDER = {'staan': 'staan', 'lopen': 'lopen-{i}', 'aanval': 'steek-{i}', 'geraakt': 'geraakt-{i}', 'sterven': 'sterven-{i}'}
# wat de generator niet heeft (geraakt worden: 3 beelden zoals de wolf en het skelet), of waar zijn cel niet past (sterven:
# languit ligt hij naar voren, en dus in Z omlaag in beeld; de cel van de generator heeft onder het anker 9 pixels), met
# een cel waar het in past; die gaat voor
EIGEN = {'geraakt': {'beelden': 3, 'fps': 12, 'herhaal': False, 'cel': [89, 110], 'anker': [44, 105]},
         'sterven': {'beelden': 7, 'fps': 8, 'herhaal': False, 'cel': [150, 124], 'anker': [75, 84]}}


def schaal(kaart):
    """De schaal waarmee de staande man even hoog is als op het vel, gemiddeld over de richtingen."""
    s = []
    for r in omtrek.ALLE:
        vel = Image.open(omtrek.VEL).convert('RGBA')
        rij = omtrek.ALLE.index(r)
        ref = vel.crop((0, rij * omtrek.CH, omtrek.CB, (rij + 1) * omtrek.CH))
        rb = omtrek.lijf(omtrek.masker(ref)).getbbox()
        ob = omtrek.lijf(omtrek.masker(Image.open(f'{kaart}/eigen-{r}-staan.png').convert('RGBA'))).getbbox()
        s.append((rb[3] - rb[1]) / (ob[3] - ob[1]))
    return sum(s) / len(s)


def cel(pad, s, anker_y, houding):
    """Een render verkleind en met de oorsprong op het anker van de cel."""
    h = EIGEN.get(houding) or FIGUUR['houdingen'][houding]
    cb, ch = h['cel']
    ax, ay = h['anker']
    b = Image.open(pad).convert('RGBA')
    klein = b.resize((max(1, round(b.width * s)), max(1, round(b.height * s))), Image.BOX)
    klein.putalpha(klein.getchannel('A').point(lambda v: 255 if v >= 128 else 0))
    klein = vergelijk.rand(klein)
    uit = Image.new('RGBA', (cb, ch), (0, 0, 0, 0))
    uit.paste(klein, (round(ax - b.width / 2 * s), round(ay - anker_y * s)), klein)
    return uit


if __name__ == '__main__':
    kaart, uitmap = sys.argv[1], sys.argv[2]
    procent = float(sys.argv[3]) if len(sys.argv) > 3 else 100
    anker_y = ANKER_Y * procent / 100
    # de schaal van de staande man (een map met alleen de steek neemt hem met `schaal=<getal>` mee)
    vast = [a for a in sys.argv[4:] if a.startswith('schaal=')]
    s = float(vast[0].split('=')[1]) if vast else schaal(kaart)
    print(f'schaal {s:.4f}')
    for houding, naam in RENDER.items():
        if not os.path.exists(f'{kaart}/eigen-Z-{naam.format(i=0)}.png'):
            continue
        h = EIGEN.get(houding) or FIGUUR['houdingen'][houding]
        cb, ch = h['cel']
        n = h['beelden']
        vel = Image.new('RGBA', (cb * n, ch * len(FIGUUR['richtingen'])), (0, 0, 0, 0))
        for j, r in enumerate(FIGUUR['richtingen']):
            for i in range(n):
                vel.paste(cel(f'{kaart}/eigen-{r}-{naam.format(i=i)}.png', s, anker_y, houding), (i * cb, j * ch))
        vel.save(f'{uitmap}/speerman3d-{houding}.png')
        print(f'{uitmap}/speerman3d-{houding}.png', vel.size)
