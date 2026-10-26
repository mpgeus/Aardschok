# De speerman uit het model als vel voor het spel (vraag 190; Marcel, 26 okt: "kun je nu eens een animatie maken in
# game?"): staan en lopen in acht richtingen uit eigen.py, op spelmaat, in de cellen en met het anker van het vel van de
# generator (beelden/beschrijving.json, figuren.speerman), zodat het spel ze zonder meer kan tonen. De vellen van de
# generator blijven staan: dit schrijft speerman3d-staan.png en speerman3d-lopen.png naar een eigen map.
#
# Eén schaal voor alle richtingen en beelden (het gemiddelde van de staande man naast het vel, zoals vergelijk.py
# uitlijnt), en het anker op de oorsprong van het model (midden onder de camera, op anker_y: waar de voeten staan), zodat
# hij bij het draaien en lopen niet verspringt. Met de rand van het vel (vergelijk.rand).
#
#   blender.exe -b -P gereedschap/blender/eigen.py -- <map> Z ZW W NW N NO O ZO      (staan en lopen)
#   python spelvel.py <map> <uitmap> [procent]      (de Python van ComfyUI; procent van de render, 50 voor de snelle)
import json
import sys

sys.path.insert(0, __file__.replace('\\', '/').rsplit('/', 1)[0])
import omtrek  # noqa: E402
import vergelijk  # noqa: E402
from PIL import Image  # noqa: E402

HIER = __file__.replace('\\', '/').rsplit('/', 1)[0]
FIGUUR = json.load(open(f'{HIER}/../../beelden/beschrijving.json', encoding='utf-8'))['figuren']['speerman']
ANKER_Y = 1860  # speerman_hd.INSTELLINGEN['anker_y'], bij 100 procent


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
    h = FIGUUR['houdingen'][houding]
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
    s = schaal(kaart)
    print(f'schaal {s:.4f}')
    for houding in ('staan', 'lopen'):
        h = FIGUUR['houdingen'][houding]
        cb, ch = h['cel']
        n = h['beelden']
        vel = Image.new('RGBA', (cb * n, ch * len(FIGUUR['richtingen'])), (0, 0, 0, 0))
        for j, r in enumerate(FIGUUR['richtingen']):
            for i in range(n):
                pad = f'{kaart}/eigen-{r}-staan.png' if houding == 'staan' else f'{kaart}/eigen-{r}-lopen-{i}.png'
                vel.paste(cel(pad, s, anker_y, houding), (i * cb, j * ch))
        vel.save(f'{uitmap}/speerman3d-{houding}.png')
        print(f'{uitmap}/speerman3d-{houding}.png', vel.size)
