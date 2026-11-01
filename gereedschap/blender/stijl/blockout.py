# De blockout beoordelen (vraag 192, stap 2 van de specificatie): voor, zij en achter in klei voor elke verhouding, naast de plaat, en
# dezelfde figuur in kleur en op 80 pixels op het gras. Zo kies je de verhouding voor er verder wordt afgewerkt.
#
#   python blockout.py <uit.png> <naam>=<map> ...     (de Python van ComfyUI; per map klei/ kleur/ en spel/)
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import vel as Vel  # noqa: E402

REF = os.path.join(HIER, '..', '..', '..', 'docs', 'art', 'referentie', 'aardschok-speerman-detail.png')
GRIJS = (127, 123, 119)
GRAS = (98, 138, 54)
PAPIER = (240, 232, 214)
HOOG = 440


def rij(kaart, houding='staan', hoog=HOOG):
    """Voor, zij en achter met dezelfde schaal: de voeten op één lijn."""
    delen = [Image.open(os.path.join(kaart, f'{houding}-{r}-00.png')).convert('RGBA') for r in ('Z', 'W', 'N')]
    bbs = [d.getbbox() for d in delen]
    h = max(b[3] - b[1] for b in bbs)
    s = hoog / h
    uit = Image.new('RGB', (900, hoog + 10), GRIJS)
    for j, (d, b) in enumerate(zip(delen, bbs)):
        c = d.crop(b)
        c = c.resize((round(c.width * s), round(c.height * s)), Image.LANCZOS)
        uit.paste(c, (j * 300 + (300 - c.width) // 2, hoog + 5 - c.height), c)
    return uit


def spel(kaart, px=80):
    """Op spelmaat, 1x en 3x, op het gras."""
    meta = json.load(open(os.path.join(kaart, 'staan-render.json'), encoding='utf-8'))
    s = Vel.schaal_van(meta['pixels'], meta['ortho'], px, meta.get('lengte'))
    uit = Image.new('RGB', (900, 460), GRAS)
    x = 6
    for r in ('Z', 'ZW', 'W'):
        c = Vel.sprite(os.path.join(kaart, f'staan-{r}-00.png'), s)
        c = c.crop(c.getbbox())
        g = c.resize((c.width * 3, c.height * 3), Image.NEAREST)
        uit.paste(g, (x, 455 - g.height), g)
        x += max(g.width + 16, 230)
    y = 455
    c = Vel.sprite(os.path.join(kaart, 'staan-Z-00.png'), s)
    c = c.crop(c.getbbox())
    uit.paste(c, (830, y - c.height), c)
    return uit


def hoofd():
    uit = sys.argv[1]
    bronnen = [a.split('=', 1) for a in sys.argv[2:]]
    ref = Image.open(REF).convert('RGB').crop((0, 15, 1774, 470))
    b = 900
    plaat = Image.new('RGB', (b * len(bronnen), 470 + (HOOG + 40) * 2 + 480), PAPIER)
    plaat.paste(ref.crop((0, 0, min(b * len(bronnen), 1774), 455)).resize((min(b * len(bronnen), 1774), 455)), (0, 0))
    d = ImageDraw.Draw(plaat)
    letter = ImageFont.load_default(size=26)
    for i, (naam, kaart) in enumerate(bronnen):
        x = i * b
        y = 470
        b_ = json.load(open(os.path.join(kaart, os.path.basename(kaart) + '.json'), encoding='utf-8'))
        lengte = b_['delen']['_lengte']
        heup = (0.42 + b_['bouw']['benen']) / lengte
        d.text((x + 8, y - 8), f"{naam}: {lengte:.2f} m, hoofd {b_['delen']['_kop_procent']:.0f}%, benen {heup * 100:.0f}%", fill=(40, 25, 10), font=letter)
        plaat.paste(rij(os.path.join(kaart, 'klei')), (x, y + 22))
        y += HOOG + 40
        plaat.paste(rij(os.path.join(kaart, 'kleur')), (x, y + 6))
        y += HOOG + 30
        plaat.paste(spel(os.path.join(kaart, 'spel')), (x, y))
    plaat.save(uit, optimize=True)
    print(uit, plaat.size)


if __name__ == '__main__':
    hoofd()
