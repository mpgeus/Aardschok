# Hunyuan3D-2mv: de aanzichten van een plaat als invoer (Marcel, 31 okt: "Ik wil de versie voor de 1080ti gebruiken").
# Elk aanzicht los van de achtergrond, op wit en vierkant. Het model draait in gedachten om één staande as, dus alle
# aanzichten krijgen dezelfde schaal, de as van de figuur in het midden en de zolen op één lijn. De speer blijft erin:
# hem wegwerken zou de referentie veranderen. De plaat zelf verandert niet.
#
# `detail` (de leidende plaat) is geen draaiing van één pose: in W en O staan de handen voor de buik, in O ontbreekt de speer, en in Z en N
# houdt hij de speer opzij. `acht` is dat wel, maar heeft een rok die in tweeën is gedeeld in plaats van gekwartierd.
#
#   python hy_invoer.py <uitmap> [plaat=detail]
# naar <uitmap>/invoer[_<plaat>]/<front|left|back|right>.png en invoer[_<plaat>]-blad.png
import os
import sys

import numpy as np
import scipy.ndimage as ni
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import platen4 as P4  # noqa: E402

REF_MAP = os.path.dirname(P4.REF)
BRONNEN = {
    'detail': {'pad': P4.REF, 'vak': P4.VAK, 'met_speer': 420, 'schaduw_vanaf': 0.8, 'vertrouwen': {'ZW': 0.8, 'ZO': 0.8, 'NW': 0.8, 'NO': 0.8, 'W': 0.5, 'O': 0.5}, 'ontwerp_filter': True, 'ontwerp_buren': True, 'ontwerp_drempel': 0.04},
    'acht': {'pad': os.path.join(REF_MAP, 'aardschok-speerman-acht.png'), 'met_speer': 495, 'schaduw_vanaf': 0.55, 'vertrouwen': {'W': 0.8, 'O': 0.8}, 'ontwerp_filter': True, 'ontwerp_drempel': 0.18,
             'vak': {'Z': (5, 30, 285, 570), 'ZW': (290, 30, 505, 570), 'W': (545, 60, 760, 570), 'NW': (785, 60, 995, 570), 'N': (1030, 60, 1290, 570), 'NO': (1360, 50, 1600, 570), 'O': (1660, 40, 1900, 570), 'ZO': (1915, 50, 2140, 570)}},
}
MIX = {'Z': 'detail', 'N': 'detail', 'W': 'acht', 'O': 'acht'}
# Marcel, 31 okt: de plaat om van te bouwen. Eén pose rondom, de armen los van het lijf, geen speer (die komt los), de figuur zo'n 500 pixels.
BRONNEN['draai'] = {'pad': os.path.join(REF_MAP, 'aardschok-speerman-draai.png'), 'met_speer': 505, 'schaduw_vanaf': 0.8, 'vertrouwen': {}, 'ontwerp_filter': False, 'ontwerp_drempel': 0.18, 'geen_speer': True,
                    'vak': {'Z': (0, 100, 265, 630), 'ZW': (266, 100, 510, 630), 'W': (512, 100, 700, 630), 'NW': (735, 100, 985, 630), 'N': (987, 100, 1255, 630), 'NO': (1257, 100, 1500, 630), 'O': (1505, 100, 1700, 630), 'ZO': (1705, 100, 1975, 630)}}
# Marcel, 31 okt: dezelfde plaat los van de achtergrond (echte alfa), de figuur zo'n 545 pixels.
BRONNEN['vrij'] = {'pad': os.path.join(REF_MAP, 'aardschok-speerman-draai-vrij.png'), 'met_speer': 550, 'schaduw_vanaf': 0.8, 'vertrouwen': {}, 'ontwerp_filter': False, 'ontwerp_drempel': 0.18, 'geen_speer': True,
                   'vak': {'Z': (0, 125, 273, 700), 'ZW': (273, 125, 505, 700), 'W': (505, 125, 697, 700), 'NW': (697, 125, 970, 700), 'N': (970, 125, 1240, 700), 'NO': (1240, 125, 1485, 700), 'O': (1485, 125, 1675, 700), 'ZO': (1675, 125, 1983, 700)}}
BRON = BRONNEN['detail']
PLAAT = 'detail'
# W toont de linkerkant van de figuur (hij kijkt naar links in beeld), O zijn rechterkant
AANZICHT = {'front': 'Z', 'left': 'W', 'back': 'N', 'right': 'O'}
MAAT = 1024
DEEL = 0.70  # de hoogste figuur met speer op 70 procent van het beeld, zoals bij Tencent (border_ratio 0,15)
# de slagschaduw op de grond: donker en zonder kleur, alleen onderaan; staal is lichter
SCHADUW_SAT, SCHADUW_LICHT = 12, 104
_cache = {}


def kies(naam):
    global BRON, PLAAT
    BRON, PLAAT = BRONNEN['detail' if naam == 'mix' else naam], naam
    if naam == 'mix':
        BRON = {**BRON, 'vertrouwen': {}, 'ontwerp_filter': True, 'ontwerp_buren': False, 'ontwerp_drempel': 0.22, 'mix': True}


def bron_van(r):
    return BRONNEN[MIX[r]] if BRON.get('mix') else BRON


def ref_vak(r):
    b = bron_van(r)
    im = Image.open(b['pad'])
    if 'A' in im.getbands():
        # transparante pixels krijgen hun kleur niet mee: op neutraal grijs, zodat een rand niet zwart wordt
        d = Image.new('RGBA', im.size, (125, 124, 121, 255))
        d.alpha_composite(im.convert('RGBA'))
        return d.convert('RGB').crop(b['vak'][r])
    return im.convert('RGB').crop(b['vak'][r])


def vrijstaand(r):
    """Het vak van de plaat als RGBA, zonder de slagschaduw. Staal lijkt op de grijze achtergrond, dus een drempel
    (`P4.masker_plaat`) hapt uit de helm: hier een waterscheiding over de randen, vanuit zaden die zeker figuur of achtergrond zijn."""
    if (bron_van(r)['pad'], r) in _cache:
        return _cache[(bron_van(r)['pad'], r)]
    # een plaat met een echte alfa (Marcel haalt de achtergrond er zelf uit): dan hoeft er niets geraden te worden
    b_ = bron_van(r)
    bron_im = Image.open(b_['pad'])
    if 'A' in bron_im.getbands():
        al = np.asarray(bron_im.convert('RGBA').crop(b_['vak'][r]))[..., 3]
        if (al < 128).mean() > 0.05:
            m = ni.binary_opening(al > 127, iterations=2)
            lab, n = ni.label(m)
            m = np.isin(lab, [i + 1 for i, g in enumerate(ni.sum(m, lab, range(1, n + 1))) if g >= 200])
            uit = np.dstack([np.asarray(ref_vak(r)), al * m]).astype(np.uint8), m
            _cache[(b_['pad'], r)] = uit
            return uit
    a = np.asarray(ref_vak(r), dtype=np.float32)
    bg = np.median(np.concatenate([a[:12, :12].reshape(-1, 3), a[:12, -12:].reshape(-1, 3)]), axis=0).mean()
    sat, licht = a.max(-1) - a.min(-1), a.mean(-1)
    bont = ni.binary_opening(sat > 45, iterations=1)
    ys = np.nonzero(bont.any(1))[0]
    grens = ys.min() + bron_van(r)['schaduw_vanaf'] * (ys.max() - ys.min())
    onder = np.arange(a.shape[0])[:, None] > grens
    staal = ni.binary_opening((np.abs(licht - bg) > 40) & ~onder, iterations=1) | (onder & ((licht > 150) | (licht < 66)))
    zeker = bont | staal
    ver = ni.distance_transform_edt(~zeker)
    schaduw = onder & (sat < SCHADUW_SAT) & (licht < SCHADUW_LICHT) & (ni.distance_transform_edt(~bont) > 3)
    achter = ((sat < 14) & (np.abs(licht - bg) < 12) & (ver > 9)) | schaduw
    achter[:5], achter[-5:], achter[:, :5], achter[:, -5:] = True, True, True, True
    zaad = np.zeros(sat.shape, dtype=np.int32)
    zaad[achter] = 1
    zaad[zeker & ~schaduw] = 2
    glad = ni.gaussian_filter(a, (0.7, 0.7, 0))
    rand = np.sqrt(sum(ni.sobel(glad[..., c], axis=0) ** 2 + ni.sobel(glad[..., c], axis=1) ** 2 for c in range(3)))
    m = ni.watershed_ift(np.clip(rand / 4, 0, 65535).astype(np.uint16), zaad) == 2
    m = ni.binary_opening(ni.binary_closing(m, iterations=1), iterations=1)
    lab, n = ni.label(m)
    m = np.isin(lab, [i + 1 for i, g in enumerate(ni.sum(m, lab, range(1, n + 1))) if g >= 200])  # een laars kan los staan van de rok
    gaten, n = ni.label(ni.binary_fill_holes(m) & ~m)
    ys = np.nonzero(m.any(1))[0]
    for i in range(1, n + 1):
        if (gaten == i).sum() < 40 or np.nonzero(gaten == i)[0].max() < ys.min() + 0.38 * (ys.max() - ys.min()):  # de helm is dicht, ook waar het licht op de achtergrond lijkt
            m[gaten == i] = True
    zacht = ni.gaussian_filter(m.astype(np.float32), 0.7)
    uit = np.dstack([a, np.clip(zacht, 0, 1) * 255]).astype(np.uint8), m
    _cache[(bron_van(r)['pad'], r)] = uit
    return uit


def as_x(m):
    """De staande as in het vak: de knop boven op de helm, de top van de figuur zonder dunne delen (de speer)."""
    romp = P4.dun_weg(m)
    ys = np.nonzero(romp.any(1))[0]
    return float(np.nonzero(romp[ys.min():ys.min() + 4].any(0))[0].mean())


def op_wit(r, fig_px=None):
    rgba, m = vrijstaand(r)
    ys = np.nonzero(m.any(1))[0]
    schaal = MAAT * DEEL / BRON['met_speer']
    if fig_px:
        # een gemengde invoer: de figuur (zonder speer) overal even hoog
        ry = np.nonzero(P4.dun_weg(m).any(1))[0]
        schaal = fig_px / (ry.max() - ry.min() + 1)
    uit_ = Image.fromarray(rgba)
    g = uit_.resize((round(uit_.width * schaal), round(uit_.height * schaal)), Image.LANCZOS)
    x = round(MAAT / 2 - as_x(m) * schaal)
    y = round((MAAT + MAAT * DEEL) / 2 - (ys.max() + 1) * schaal)
    d = Image.new('RGBA', (MAAT, MAAT), (255, 255, 255, 255))
    d.alpha_composite(g, (max(x, 0), max(y, 0)), (max(-x, 0), max(-y, 0)))
    return d.convert('RGB')


def mengsel(uit):
    """Z en N uit de leidende plaat (het ontwerp), W en O uit de plaat met dezelfde pose (zodat de aanzichten elkaar niet tegenspreken)."""
    map_ = os.path.join(uit, 'invoer_mix')
    os.makedirs(map_, exist_ok=True)
    blad = Image.new('RGB', (4 * 512 + 3 * 8, 512), (34, 34, 34))
    for i, (naam, r, p) in enumerate((('front', 'Z', 'detail'), ('left', 'W', 'acht'), ('back', 'N', 'detail'), ('right', 'O', 'acht'))):
        kies(p)
        im = op_wit(r, 570)
        im.save(os.path.join(map_, f'{naam}.png'))
        blad.paste(im.resize((512, 512), Image.LANCZOS), (i * 520, 0))
    blad.save(os.path.join(uit, 'invoer_mix-blad.png'))


def main():
    arg = dict(a.split('=') for a in sys.argv[2:] if '=' in a)
    if arg.get('plaat') == 'mix':
        return mengsel(sys.argv[1])
    kies(arg.get('plaat', 'detail'))
    achtervoegsel = '' if PLAAT == 'detail' else f'_{PLAAT}'
    map_ = os.path.join(sys.argv[1], 'invoer' + achtervoegsel)
    os.makedirs(map_, exist_ok=True)
    blad = Image.new('RGB', (4 * 512 + 3 * 8, 512), (34, 34, 34))
    for i, (naam, r) in enumerate(AANZICHT.items()):
        im = op_wit(r)
        im.save(os.path.join(map_, f'{naam}.png'))
        blad.paste(im.resize((512, 512), Image.LANCZOS), (i * 520, 0))
    blad.save(os.path.join(sys.argv[1], f'invoer{achtervoegsel}-blad.png'))


if __name__ == '__main__':
    main()
