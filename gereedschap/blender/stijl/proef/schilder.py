# Methode B van de methodeproef (vraag 192): geschilderde texturen uit recepten, per texel, zonder Blender. Elke laag heeft een reden die uit het ding zelf komt,
# geen losse ruis: slijtage op bolle randen en waar iets schuurt, vuil onderaan en in de holten, de schaduw uit de gebakken omgevingsschaduw, per ruit van de
# watten een eigen tint, de nerf langs de schacht. De laag blijft aan het oppervlak vast (texels in rust), dus hij kan niet schuiven of flikkeren.
#
#   python schilder.py <texturen> <uitmap> [sterkte=1.0] [delen=helm,speer]
import json
import math
import multiprocessing as mp
import os
import sys
import time

import numpy as np
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import skelet as S  # noqa: E402
import vorm as V  # noqa: E402

CONFIG = json.load(open(os.path.join(HIER, 'schilder.json'), encoding='utf-8'))
_M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]], dtype=np.float32)
_MI = np.linalg.inv(_M).astype(np.float32)
_W = np.array([0.9505, 1.0, 1.089], dtype=np.float32)


def lin_lab(c):
    xyz = np.clip(c, 0, None) @ _M.T / _W
    f = np.where(xyz > 0.008856, np.cbrt(np.maximum(xyz, 1e-9)), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def lab_lin(lb):
    fy = (lb[..., 0] + 16) / 116
    f = np.stack([fy + lb[..., 1] / 500, fy, fy - lb[..., 2] / 200], -1)
    xyz = np.where(f > 0.2069, f ** 3, (f - 16 / 116) / 7.787) * _W
    return xyz @ _MI.T


def srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def glad(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


class Doek:
    """De verf van één onderdeel in Lab, met de bewerkingen die een schilder heeft: lichter of donkerder, verzadiging, tint, en mengen naar een kleur; altijd door een masker."""

    def __init__(self, c):
        self.lb = lin_lab(c.astype(np.float32))

    def licht(self, d, m=1.0):
        self.lb[..., 0] += d * m

    def maal(self, f, m=1.0):
        self.lb[..., 0] *= 1 + (f - 1) * m

    def chroma(self, f, m=1.0):
        s = 1 + (f - 1) * m
        self.lb[..., 1] *= s
        self.lb[..., 2] *= s

    def tint(self, graden, m=1.0):
        h = np.radians(graden) * m
        a, b = self.lb[..., 1].copy(), self.lb[..., 2].copy()
        self.lb[..., 1] = a * np.cos(h) - b * np.sin(h)
        self.lb[..., 2] = a * np.sin(h) + b * np.cos(h)

    def naar(self, lab, m):
        lab = np.asarray(lab, dtype=np.float32)
        m = np.clip(m, 0, 1)[..., None]
        self.lb = self.lb * (1 - m) + lab * m


def ruis(P, s, z, o=2):
    return V.ruis(P, s if np.ndim(s) else np.full(3, s, dtype=np.float32), z, o)


def rs(P, s, z, o=2):
    """Ruis van -1 tot 1."""
    return (ruis(P, np.asarray(s, dtype=np.float32), z, o) - 0.5) * 2.0


def krassen(P, z, schaal, as_=2, dun=0.012, hoeveel=0.5):
    """Dunne krassen: de hoogtelijnen van een uitgerekte ruis, waar een tweede ruis ze laat bestaan."""
    s = np.full(3, schaal[0], dtype=np.float32)
    s[as_] = schaal[1]
    r = ruis(P, s, z, 1)
    lijn = 1 - glad(0.0, dun, np.abs(r - 0.5))
    return lijn * glad(hoeveel, hoeveel + 0.15, ruis(P, schaal[1] * 0.8, z + 3, 1))


def slijt(bol, schaal, drempel, breek, m_breek):
    """Slijtage: op bolle randen, en onderbroken: nooit een nette lijn."""
    return glad(drempel, 1.0, bol / schaal + (breek - 0.5) * m_breek)


def holte(bol, schaal):
    return glad(0.15, 1.0, -bol / schaal)


# --- per onderdeel ------------------------------------------------------------------------------------------------------
def doe_ao(d, ao, k):
    """De gebakken schaduw: donkerder en warmer, en iets voller van kleur; zo wordt schaduw geen grijs."""
    w = 1 - ao
    d.maal(1 - k['ao'], w)
    d.chroma(1 + k['ao_chroma'], w)
    d.tint(k['ao_tint'], w)


def tabberd(d, a, k):
    P, bol = a['P'], a['bol']
    z = P[..., 2]
    # per paneel een zachte drift van tint en waarde: de kleur van een geverfd stuk stof is nooit overal gelijk
    grote = rs(P, 0.22, 11)
    d.licht(k['drift_L'] * grote)
    d.tint(k['drift_h'] * rs(P, 0.16, 12))
    # verfstreken langs de hanging van de stof, en een fijne weving
    streek = rs(P, np.array([0.024, 0.024, 0.2], dtype=np.float32), 13)
    d.licht(k['streek_L'] * streek)
    d.tint(k['streek_h'] * rs(P, np.array([0.035, 0.035, 0.26], dtype=np.float32), 14))
    d.licht(k['weef_L'] * rs(P, np.array([0.003, 0.003, 0.009], dtype=np.float32), 15, 1))
    # bolle plooien verschieten van het licht, holten houden de diepe kleur
    br = ruis(P, 0.018, 16)
    w = slijt(bol, 0.004, 0.25, br, 0.9)
    d.licht(k['plooi_L'], w)
    d.chroma(k['plooi_C'], w)
    d.chroma(1.12, holte(bol, 0.004))
    # vuil onderaan: de zoom schuurt en sleept
    vuil = glad(0.44, 0.285, z) * (0.45 + 0.55 * ruis(P, 0.05, 17))
    # donkerder en doffer in de eigen kleur: bruin door blauw mengen geeft paars
    d.maal(1 - k['vuil'], vuil)
    d.chroma(1 - 0.5 * k['vuil'], vuil)
    # rafels op de zoom: heel onderaan lichter en dof
    raf = glad(0.312, 0.285, z) * glad(0.45, 0.7, ruis(P, np.array([0.006, 0.006, 0.03], dtype=np.float32), 18))
    d.licht(6.0, raf)
    d.chroma(0.85, raf)


def gewat(d, a, k):
    P, bol = a['P'], a['bol']
    # elke ruit een eigen tint: de plaat heeft geen twee dezelfde
    for s, n in ((-1, '.R'), (1, '.L')):
        Sh, E = BOT['bovenarm' + n][:2]
        u, phi = as_ruimte(P, Sh, E)
        lengte = 0.088
        ca = np.floor(u / lengte + phi * 6 / (2 * math.pi))
        cb = np.floor(u / lengte - phi * 6 / (2 * math.pi))
        h = np.sin(ca * 12.9898 + cb * 78.233 + s) * 43758.5453
        h = h - np.floor(h)
        h2 = np.sin(ca * 39.346 + cb * 11.135 + s) * 24634.6345
        h2 = h2 - np.floor(h2)
        kant = (P[..., 0] * s > 0.2).astype(np.float32)
        d.licht(k['ruit_L'] * (h - 0.5) * 2, kant)
        d.tint(k['ruit_h'] * (h2 - 0.5) * 2, kant)
    d.licht(k['drift_L'] * rs(P, 0.12, 21))
    d.tint(k['drift_h'] * rs(P, 0.09, 22))
    # de hoogte van een ruit vangt de meeste slijtage
    br = ruis(P, 0.014, 23)
    w = slijt(bol, 0.004, 0.3, br, 0.8)
    d.licht(k['slijt_L'], w)
    d.chroma(0.9, w)
    d.chroma(1.1, holte(bol, 0.004))
    # fijne nerf: gewatteerd leer met poriën
    d.licht(k['nerf_L'] * rs(P, 0.0065, 24, 2))


def leer(d, a, k):
    P, bol = a['P'], a['bol']
    d.licht(k['drift_L'] * rs(P, 0.09, 31))
    d.tint(k['drift_h'] * rs(P, 0.07, 32))
    # de nerf en kleine plooitjes: het leer leeft
    d.licht(k['nerf_L'] * rs(P, 0.006, 33, 2))
    pl = krassen(P, 34, (0.02, 0.09), 0, 0.03, 0.35)
    d.licht(-k['kras_L'], pl)
    # randen slijten licht; holten worden donker en vol
    br = ruis(P, 0.012, 35)
    w = slijt(bol, 0.0035, 0.2, br, 1.0)
    d.licht(k['slijt_L'], w)
    d.chroma(k['slijt_C'], w)
    h = holte(bol, 0.0035)
    d.maal(0.82, h)
    d.chroma(1.1, h)


def laarzen(d, a, k):
    leer(d, a, k)
    P = a['P']
    z = P[..., 2]
    # stof en modder onderaan, schrammen op de neus
    stof = glad(0.14, 0.03, z) * (0.35 + 0.65 * ruis(P, 0.035, 41))
    d.naar((44, 9, 18), stof * k['stof'])
    y = P[..., 1]
    neus = glad(-0.12, -0.26, y) * glad(0.16, 0.05, z)
    kr = krassen(P, 42, (0.012, 0.05), 0, 0.05, 0.3)
    d.licht(k['neus_L'], neus * kr)
    d.chroma(0.8, neus * kr)


def staal(d, a, k):
    P, bol = a['P'], a['bol']
    # verschillen in het smeedwerk: donkerder en lichter in grote vlekken
    d.maal(1 + k['vlek'] * rs(P, 0.07, 51))
    d.maal(1 + k['vlek'] * 0.5 * rs(P, 0.025, 52))
    # krassen in meer richtingen
    for i, (as_, sch) in enumerate(((0, (0.004, 0.12)), (2, (0.004, 0.15)), (1, (0.005, 0.1)))):
        kr = krassen(P, 53 + i, sch, as_, 0.03, 0.45)
        d.licht(k['kras'] * (1 if i != 1 else -0.7), kr)
    # randen en nagels zijn blankgesleten, holten dragen roest
    br = ruis(P, 0.01, 57)
    w = slijt(bol, 0.003, 0.15, br, 0.9)
    d.licht(k['rand'], w)
    h = holte(bol, 0.003) * (0.4 + 0.6 * ruis(P, 0.012, 58))
    d.naar((30, 18, 30), h * k['roest'])


def hout(d, a, k):
    P = a['P']
    # de nerf loopt langs de schacht: de speer staat in rust rechtop
    n1 = rs(P, np.array([0.012, 0.012, 0.32], dtype=np.float32), 61, 2)
    n2 = rs(P, np.array([0.0045, 0.0045, 0.16], dtype=np.float32), 62, 2)
    d.licht(k['nerf_grof'] * n1)
    d.tint(k['nerf_h'] * n1)
    d.licht(k['nerf_fijn'] * n2)
    d.chroma(1 + 0.12 * n1)
    # waar de hand zit is hij lichter en glad gesleten: rond de greep
    z = P[..., 2]
    g = BOT['speer'][0][2] if False else 0.72
    d.licht(k['greep'], np.exp(-((z - g) / 0.14) ** 2))
    # hier en daar een donkere vlek: een kwast in het hout
    d.maal(1 - 0.25 * glad(0.62, 0.8, ruis(P, np.array([0.025, 0.025, 0.09], dtype=np.float32), 63)))


def hoofd_(d, a, k):
    P, bol = a['P'], a['bol']
    # blos op de neus en wangen
    q = P - np.array(S.KOP_DRAAI, dtype=np.float32)
    neus = np.exp(-(((q[..., 0]) / 0.03) ** 2 + ((q[..., 1] + 0.16) / 0.05) ** 2 + ((q[..., 2] - 0.0) / 0.04) ** 2))
    wang = np.exp(-(((np.abs(q[..., 0]) - 0.07) / 0.035) ** 2 + ((q[..., 2] + 0.02) / 0.03) ** 2))
    d.naar((54, 34, 28), (neus + wang) * k['blos'])
    d.licht(k['huid_L'] * rs(P, 0.02, 71))


def baard(d, a, k):
    P = a['P']
    d.licht(k['streng_L'] * rs(P, np.array([0.006, 0.006, 0.05], dtype=np.float32), 72, 2))
    d.tint(k['streng_h'] * rs(P, 0.03, 73))


BOT = {b[0]: (np.array(b[1], dtype=np.float32), np.array(b[2], dtype=np.float32), b[4]) for b in S.botten(0.0)}


def as_ruimte(P, a, b):
    a = np.asarray(a, dtype=np.float32)
    n = np.asarray(b, dtype=np.float32) - a
    d = n / np.linalg.norm(n)
    e = np.cross(d, [0, 1, 0]) if abs(d[1]) < 0.9 else np.cross(d, [1, 0, 0])
    e1 = (e / np.linalg.norm(e)).astype(np.float32)
    e2 = np.cross(d, e1).astype(np.float32)
    q = P - a
    return q @ d, np.arctan2(q @ e1, q @ e2)


SCHEMA = {'tabberd': (tabberd, 'tabberd'), 'gambeson': (gewat, 'gewat'), 'kap': (gewat, 'kap'), 'hozen': (leer, 'hozen'), 'riem': (leer, 'leer'), 'buidel': (leer, 'leer'), 'handschoenen': (leer, 'leer'),
          'laarzen': (laarzen, 'laars'), 'helm': (staal, 'staal'), 'speer': (hout, 'hout'), 'hoofd': (hoofd_, 'huid'), 'baard': (baard, 'baard')}


def rand_uit(b, g, keren=6):
    b = b.copy()
    g = g.copy()
    for _ in range(keren):
        n = np.zeros_like(b)
        t = np.zeros(g.shape, dtype=np.float32)
        for ax, s in ((0, 1), (0, -1), (1, 1), (1, -1)):
            gm = np.roll(g, s, axis=ax)
            n[gm] += np.roll(b, s, axis=ax)[gm]
            t[gm] += 1
        m = (~g) & (t > 0)
        b[m] = n[m] / t[m, None]
        g = g | m
    return b


def schrijf(pad, a):
    Image.fromarray((np.clip(np.flipud(a), 0, 1) * 255 + 0.5).astype(np.uint8)).save(pad)


def schilder_deel(args):
    naam, tex, uit, sterkte, ao_maal = args
    t0 = time.time()
    a = dict(np.load(os.path.join(tex, f'{naam}-tex.npz')))
    maat = int(a['maat'])
    ao_b = np.flipud(np.asarray(Image.open(os.path.join(tex, f'{naam}-ao.png')).convert('L'), dtype=np.float32) / 255.0)
    ao = ao_b[a['i'], a['j']]
    d = Doek(a['c'])
    fn, cfg = SCHEMA[naam]
    k = {x: (y * sterkte if isinstance(y, (int, float)) and x not in ('plooi_C', 'slijt_C') else y) for x, y in CONFIG[cfg].items()}
    met = a['met'] > 0.35
    if naam == 'speer':
        # schacht en metaal apart: de punt en de ringen zijn staal
        d0 = Doek(a['c'])
        fn(d0, a, k)
        d1 = Doek(a['c'])
        staal(d1, a, {x: (y * sterkte) for x, y in CONFIG['staal'].items()})
        d.lb = np.where(met[..., None], d1.lb, d0.lb)
    else:
        fn(d, a, k)
    # gespen en nagels op een onderdeel van leer blijven staal
    if naam in ('riem', 'buidel', 'laarzen', 'handschoenen', 'tabberd') and met.any():
        d0 = Doek(a['c'])
        staal(d0, a, {x: (y * sterkte) for x, y in CONFIG['staal'].items()})
        d.lb = np.where(met[..., None], d0.lb, d.lb)
    doe_ao(d, ao, {x: y * ao_maal for x, y in CONFIG['ao'][cfg if cfg in CONFIG['ao'] else '_'].items()})
    c = lab_lin(d.lb)
    kleur = np.ones((maat, maat, 4), dtype=np.float32)
    g = np.zeros((maat, maat), dtype=bool)
    g[a['i'], a['j']] = True
    kleur[a['i'], a['j'], :3] = srgb(c)
    kleur[..., :3] = rand_uit(kleur[..., :3], g)
    eigen = np.zeros((maat, maat, 4), dtype=np.float32)
    eigen[a['i'], a['j'], 0] = np.clip(a['ruw'], 0, 1)
    eigen[a['i'], a['j'], 1] = np.clip(a['met'], 0, 1)
    eigen[a['i'], a['j'], 2] = np.clip(a['spiegel'], 0, 1)
    eigen[a['i'], a['j'], 3] = np.clip(a['stof'], 0, 1)
    eigen = rand_uit(eigen, g)
    schrijf(os.path.join(uit, f'{naam}-kleur.png'), kleur)
    Image.fromarray((np.clip(np.flipud(eigen), 0, 1) * 255 + 0.5).astype(np.uint8), 'RGBA').save(os.path.join(uit, f'{naam}-eigen.png'))
    print(naam, round(time.time() - t0, 1), 's', flush=True)
    return naam


def hoofd():
    tex, uit = sys.argv[1], sys.argv[2]
    sterkte = 1.0
    ao_maal = 1.0  # met het licht uit verlicht.py komt de schaduw uit de echte houding: dan hoeft er weinig in de verf
    delen = list(SCHEMA)
    for x in sys.argv[3:]:
        k, v = x.split('=')
        if k == 'sterkte':
            sterkte = float(v)
        elif k == 'delen':
            delen = v.split(',')
        elif k == 'ao':
            ao_maal = float(v)
    os.makedirs(uit, exist_ok=True)
    t0 = time.time()
    with mp.Pool(6) as pool:
        pool.map(schilder_deel, [(n, tex, uit, sterkte, ao_maal) for n in delen])
    print('KLAAR', uit, round(time.time() - t0, 1), 's', flush=True)


if __name__ == '__main__':
    hoofd()
