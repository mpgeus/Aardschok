# De speerman in de stijl van de stijlplaten (vraag 192, docs/art/aardschok-art-bible.md; de maten uit
# docs/art/referentie/aardschok-speerman-acht.png): gesculpt uit afstandsvelden (vorm.py), elk kledingstuk een eigen mesh aan
# hetzelfde skelet (skelet.py), de verf op de punten (materialen.py). Geen HumGen en geen MakeHuman: de stijl vraagt een gedrongen
# figuur van drie hoofden, met grote handen en laarzen, en de grote vormen zijn hier het model, niet de kleren om een echt lijf.
#
#   blender.exe -b --factory-startup -P gereedschap/blender/stijl/figuur.py -- <uit.blend> [kop=1.26] [benen=0] [tabberd=vier|twee] [vorm=2]
#
# vorm=1 is de vorm vóór de kwaliteitsronde, voor de vergelijking; vorm=2 de standaard.
# De figuur kijkt naar -Y en links is +X, altijd vanuit de figuur: de rechterborst (blauw) ligt op -X.
import json
import math
import os
import sys
import time

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import materialen as M  # noqa: E402
import skelet as S  # noqa: E402
import vorm as V  # noqa: E402

# --- de getallen ---------------------------------------------------------------------------------------------------------
BOUW = {
    'kop': 1.26,         # het hoofd met helm, om de hals: 1,26 is 33 procent van de lengte, zoals op de plaat; 1,10 met benen=0.32 de 24 uit de specificatie
    'benen': 0.0,        # hoeveel de benen langer zijn dan de basis (0,34 m): 0 is de plaat, 0,32 de specificatie (0,73 tot 0,79 m van heup tot grond)
    'tabberd': 'vier',   # vier: de vierendelen uit de opdracht; twee: voor en achter in twee helften, zoals de plaat van acht richtingen
    'vorm': 2,           # 1 is de vorm vóór de kwaliteitsronde (voor de proeven), 2 de standaard
    'riem_z': 0.575,     # de hoogte van de riem
    'zoom_z': 0.285,     # de onderkant van de tabberd
    'speer_straal': 0.03,
    'speer_lengte': 1.3,   # keer de lengte van de figuur (specificatie: 2,15 m bij 1,65 m)
    'speer_onder': -0.72,  # onderkant van de speer, t.o.v. de greep: wordt bij het bouwen berekend
    'speer_boven': 1.12,   # de punt, idem
}
BOT_STRAAL = {'wortel': 1.0, 'speer': 1.0, 'bekken': 0.20, 'rug': 0.20, 'borst': 0.24, 'nek': 0.09, 'hoofd': 0.20, 'sleutel': 0.10,
              'bovenarm': 0.11, 'onderarm': 0.10, 'hand': 0.09, 'dij': 0.13, 'scheen': 0.10, 'voet': 0.10, 'teen': 0.09, 'rok': 0.20, 'buidel': 0.2}
HOUDINGEN = {'staan': 8, 'lopen': 24}  # beelden per cyclus in het .blend; de render kiest er 8 of 12 uit


def G(oud, nieuw):
    """Een maat van de vorm vóór en na de kwaliteitsronde."""
    return nieuw if BOUW['vorm'] >= 2 else oud


def _botten(e):
    return {b[0]: (np.array(b[1], dtype=np.float32), np.array(b[2], dtype=np.float32), b[4]) for b in S.botten(e)}


BOT = _botten(0.0)   # het bovenlijf rekent in zijn eigen ruimte, alsof de benen de basismaat hebben (elk onderdeel wordt daarna verhoogd)
BOT_W = _botten(0.0)  # de botten zoals ze echt staan: de benen en de gewichten
PIVOT = np.array(S.KOP_DRAAI, dtype=np.float32)


def omhoog(P):
    return P - np.array([0, 0, BOUW['benen']], dtype=np.float32)


def frame(naam):
    """De assen van een bot in rust, zoals Blender ze met align_roll maakt: Y langs het bot, Z zo dicht mogelijk bij de verwijzing."""
    a, b, z = BOT[naam]
    y = S._n(b - a)
    x = S._n(np.cross(y, z))
    zz = np.cross(x, y)
    return a, np.stack([x, y, zz], axis=1).astype(np.float32)


def as_ruimte(P, a, b):
    """Een punt in de ruimte van een as: hoe ver erlangs (u) en de hoek eromheen (phi). Voor stiksels die om een arm lopen."""
    a = np.asarray(a, dtype=np.float32)
    d = S._n(np.asarray(b) - a).astype(np.float32)
    e1 = S._n(np.cross(d, [0, 1, 0]) if abs(d[1]) < 0.9 else np.cross(d, [1, 0, 0])).astype(np.float32)
    e2 = np.cross(d, e1).astype(np.float32)
    q = P - a
    return q @ d, np.arctan2(q @ e1, q @ e2)


def ruiten(u, phi, lengte, rond):
    """Gewatteerde ruiten: 1 midden op een ruit, 0 in de naad. rond is hoeveel ruiten er om de as passen, dus hij sluit naadloos."""
    a = u / lengte + phi * rond / (2 * math.pi)
    b = u / lengte - phi * rond / (2 * math.pi)
    return np.minimum(np.abs(np.sin(math.pi * a)), np.abs(np.sin(math.pi * b))) ** 0.42


# --- het lijf ------------------------------------------------------------------------------------------------------------

def romp(P):
    d = [V.ellips(P, (0, 0.005, 0.72), (0.218, 0.15, 0.16)),
         V.ellips(P, (0, -0.014, 0.585), (0.186, 0.14, 0.135)),
         V.ellips(P, (0, 0.005, 0.47), (0.168, 0.125, 0.09))]
    for s in (-1, 1):
        d.append(V.staaf(P, (s * 0.05, 0.005, 0.962 - 0.11), (s * S.SCHOUDER[0], 0.005, 0.845), 0.06, 0.062))
    return V.vloei(d, 0.05)


def arm(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = BOT['bovenarm' + n][:2]
    W = BOT['onderarm' + n][1]
    return V.vloei([
        V.ellips(P, Sh + np.array([s * 0.006, 0, -0.006]), (G(0.068, 0.074), G(0.072, 0.078), G(0.074, 0.08))),
        V.staaf(P, Sh, E, G(0.056, 0.06), G(0.05, 0.054)),
        V.bol(P, Sh * 0.55 + E * 0.45 + np.array([0, -0.006, 0]), G(0.058, 0.064)),
        V.bol(P, E, G(0.048, 0.052)),
        V.staaf(P, E, W, G(0.048, 0.052), G(0.04, 0.044)),
        V.bol(P, E * 0.72 + W * 0.28, G(0.052, 0.057)),
    ], 0.03)


def been(P, s):
    n = '.L' if s > 0 else '.R'
    H, K = BOT_W['dij' + n][:2]
    A = BOT_W['scheen' + n][1]
    return V.vloei([
        V.staaf(P, H, K, 0.105, 0.082),
        V.bol(P, K + np.array([0, -0.006, 0]), 0.082),
        V.staaf(P, K, A, 0.076, 0.06),
    ], 0.03)


def veld_lijf(P):
    U = omhoog(P)
    d = V.smin(romp(U), V.smin(arm(U, -1), arm(U, 1), 0.01), 0.045)
    d = V.smin(d, V.smin(been(P, -1), been(P, 1), 0.005), 0.05)
    return V.smin(d, V.staaf(U, (0, 0.01, 0.97), (0, 0.01, 0.84), 0.07), 0.03)


# --- het hoofd (in de ruimte van het hoofd: de hals op 0, de kin op z = 0, de kruin op 0,29) -----------------------------------

def kop_ruimte(P):
    k = BOUW['kop']
    return (P - PIVOT) / k, k


def schedel(Q):
    return V.smin(V.ellips(Q, (0, 0.012, 0.165), (0.108, 0.118, 0.122)),
                  V.ellips(Q, (0, -0.028, 0.072), (0.092, 0.08, 0.072)), 0.05)


def kaak(Q):
    return V.smin(V.ellips(Q, (0, -0.028, 0.072), (G(0.092, 0.096), 0.08, 0.072)), V.bol(Q, (0, -0.08, 0.034), 0.03), 0.03)


OOG = (0.041, -0.098, 0.135)


def veld_hoofd(P):
    Q, k = kop_ruimte(P)
    d = schedel(Q)
    d = V.smin(d, kaak(Q), 0.03)
    d = V.smin(d, V.bol(Q, (0, -0.08, 0.034), 0.03), 0.03)  # de kin
    for s in (-1, 1):
        d = V.smin(d, V.ellips(Q, (s * 0.056, -0.076, 0.10), G((0.032, 0.026, 0.028), (0.037, 0.03, 0.032))), 0.04)  # de wang
        d = V.weg(d, V.bol(Q, (s * OOG[0], -0.124, OOG[2] - 0.002), G(0.021, 0.019)), G(0.012, 0.014))  # de oogkas
        d = V.smin(d, V.bol(Q, (s * OOG[0], OOG[1], OOG[2]), G(0.02, 0.018)), 0.002)  # de oogbol
        d = V.smin(d, V.ellips(Q, (s * 0.1, 0.0, 0.12), (0.012, 0.022, 0.032)), 0.008)  # het oor
    d = V.smin(d, V.staaf(Q, (-0.066, -0.106, 0.16), (0.066, -0.106, 0.16), G(0.017, 0.02)), 0.022)  # de wenkbrauwboog
    d = V.smin(d, V.staaf(Q, (0, -0.114, 0.15), (0, -0.134, 0.104), G(0.011, 0.013), G(0.019, 0.021)), 0.012)  # de neusbrug
    d = V.smin(d, V.bol(Q, (0, -0.135, 0.1), G(0.022, 0.025)), 0.008)  # de neuspunt
    for s in (-1, 1):
        d = V.smin(d, V.bol(Q, (s * G(0.026, 0.03), -0.124, 0.092), G(0.014, 0.0165)), 0.008)  # de neusvleugel
    d = V.smin(d, V.staaf(Q, (-0.022, -0.112, 0.047), (0.022, -0.112, 0.047), 0.011), 0.01)  # de onderlip
    d = V.weg(d, V.staaf(Q, (-0.036, -0.122, 0.06), (0.036, -0.122, 0.06), 0.005), 0.006)  # de mond
    d = V.smin(d, V.staaf(Q, (0, 0.012, 0.04), (0, 0.012, -0.08), 0.062), 0.03)  # de hals
    return d * k


def verf_hoofd(P, N, bol):
    Q, _ = kop_ruimte(P)
    v = M.verf('huid', P, bol, 3, 0.02, N)
    blos = sum(np.exp(-((Q - np.array(c)) ** 2).sum(-1) / (2 * r * r)) for c, r in
               (((0.062, -0.09, 0.10), 0.03), ((-0.062, -0.09, 0.10), 0.03), ((0, -0.155, 0.095), 0.03)))
    v = M.meng(v, M.kleur('#c4582e', v), blos * 0.5)
    # onder de neus en langs de kaak iets donkerder, zoals een schilder dat zet
    v = M.meng(v, M.kleur('#a4603a', v), np.exp(-((Q[..., 2] - 0.072) / 0.012) ** 2) * np.exp(-(Q[..., 0] / 0.03) ** 2) * (Q[..., 1] < -0.09) * 0.45)
    # de ogen: eenvoudig en donker, met een zware bovenrand, een klein oogwit aan de buitenkant en een klein lichtje
    for s in (-1, 1):
        dx = Q[..., 0] - s * OOG[0]
        dz = Q[..., 2] - OOG[2]
        voor = Q[..., 1] < -0.09
        d2 = (dx / 0.02) ** 2 + (dz / 0.0125) ** 2
        v = M.meng(v, M.kleur('#7a4428', v), np.where(voor, np.exp(-d2 * 0.5), 0.0) * 0.45)
        v = M.meng(v, M.kleur('#d9c8ad', v), np.where(voor & (d2 < 0.85), 1.0, 0.0))
        v = M.meng(v, M.kleur('#1e110a', v), np.where(voor & (((dx + s * 0.003) / 0.0125) ** 2 + (dz / 0.0145) ** 2 < 1), 1.0, 0.0))
        lid = np.where(voor & (np.abs(dx) < 0.022) & (dz > 0.0065) & (dz < 0.0175), 1.0, 0.0)
        v = M.meng(v, M.kleur('#2a170c', v), lid)
        v = M.meng(v, M.kleur('#ffffff', v), np.where(voor & (((dx + 0.0045) ** 2 + (dz - 0.004) ** 2) < 0.003 ** 2), 1.0, 0.0))
    # het haar bij de slapen, dat onder de helm uitkomt, boven het oor en erachter
    haar = M.verf('haar', P, bol, 39, 0.01, N)
    masker = V.stap(0.074, 0.086, np.abs(Q[..., 0])) * V.stap(0.09, 0.12, Q[..., 2]) * V.stap(-0.07, -0.05, Q[..., 1])
    oor = np.exp(-(((np.abs(Q[..., 0]) - 0.1) / 0.02) ** 2 + (Q[..., 1] / 0.024) ** 2 + ((Q[..., 2] - 0.12) / 0.034) ** 2))
    return M.meng(v, haar, masker * (1.0 - np.clip(oor * 1.6, 0, 1)))


def veld_baard(P):
    Q, k = kop_ruimte(P)
    # een korte baard: de kaak iets opgeblazen, alleen onderaan en voor, met strengen
    b = kaak(Q) - G(0.005, 0.0105)
    b = V.smax(b, Q[..., 2] - (G(0.046, 0.054) + 0.06 * V.stap(0.035, 0.08, np.abs(Q[..., 0]))), 0.01)
    b = V.smax(b, Q[..., 1] - 0.005, 0.03)
    b = V.weg(b, V.staaf(Q, (-0.026, -0.135, 0.056), (0.026, -0.135, 0.056), 0.01), 0.006)
    if BOUW['vorm'] >= 2:
        b = V.smin(b, V.bol(Q, (0, -0.086, 0.014), 0.024), 0.02)  # de punt onder de kin
    b = b + (V.ruis(Q, (0.012, 0.012, 0.045), 5, 2) - 0.5) * 0.008
    d = b
    for s in (-1, 1):
        d = V.smin(d, V.ketting(Q, [(s * 0.082, -0.05, 0.05), (s * 0.09, -0.035, 0.1), (s * 0.088, -0.03, 0.135)], [0.012, 0.01, 0.008]), 0.01)
        # de snor
        d = V.smin(d, V.ketting(Q, [(s * 0.004, -0.137, 0.078), (s * 0.032, -0.131, 0.069), (s * 0.056, -0.106, 0.05)],
                                [G(0.0105, 0.012), G(0.012, 0.0135), 0.008]), 0.008)
        # de wenkbrauw, zwaar en bijna recht
        d = V.smin(d, V.ketting(Q, [(s * 0.014, -0.127, 0.16), (s * 0.044, -0.124, 0.163), (s * 0.074, -0.1, 0.155)],
                                [G(0.0095, 0.0115), G(0.0105, 0.012), 0.0065]), 0.004)
    return d * k


def verf_baard(P, N, bol):
    Q, _ = kop_ruimte(P)
    v = M.verf('haar', P, bol, 9, 0.004, N)
    # strengen: lichter aan de buitenkant van elke pluk, zo blijft het een vorm en geen haren
    str_ = V.stap(0.55, 0.8, V.ruis(Q, (0.008, 0.008, 0.05), 19, 2))
    return M.meng(v, M.kleur('#6b4526', v), str_ * 0.4)


# --- de helm: een ketelhoed, met een brede rand, een band met nagels en ribben naar de kruin ---------------------------------

def HELM():
    return {'z': 0.192, 'y': 0.014, 'ax': G(0.133, 0.136), 'ay': G(0.146, 0.149), 'h': G(0.15, 0.156), 'kantel': -6.0, 'rand_voor': G(0.046, 0.054),
            'rand_rest': G(0.054, 0.064), 'zak_voor': G(0.014, 0.02), 'zak_rest': G(0.026, 0.036), 'dik': G(0.0065, 0.008)}


def helm_ruimte(P):
    Q, k = kop_ruimte(P)
    H = HELM()
    c = np.array([0, H['y'], H['z']], dtype=np.float32)
    R = S.rx(math.radians(H['kantel'])).astype(np.float32)
    return (Q - c) @ R, k


def veld_helm(P):
    Q, k = helm_ruimte(P)
    H = HELM()
    x, y, z = Q[..., 0], Q[..., 1], Q[..., 2]
    O = V.ellips(Q, (0, 0, 0), (H['ax'], H['ay'], H['h']))
    O = O + (V.ruis(Q, 0.045, 11, 2) - 0.5) * 0.0055
    koepel = V.smax(O, -O - 0.012, 0.002)
    koepel = V.smax(koepel, -z - 0.002, 0.004)
    # de rand: een schuin aflopende schijf met een omgerolde rand
    phi = np.arctan2(y, x)
    voor = V.stap(0.2, 0.95, -np.sin(phi))
    ext = H['rand_rest'] + (H['rand_voor'] - H['rand_rest']) * voor
    zak = H['zak_rest'] + (H['zak_voor'] - H['zak_rest']) * voor
    r = np.sqrt(x * x + y * y)
    rb = 1.0 / np.sqrt((np.cos(phi) / H['ax']) ** 2 + (np.sin(phi) / H['ay']) ** 2)
    t = (r - rb) / ext
    zb = -zak * np.clip(t, 0, 1) ** 1.2 + 0.002
    schijf = np.abs(z - zb) - H['dik'] * (1.0 - 0.2 * np.clip(t, 0, 1))
    schijf = V.smax(schijf, r - (rb + ext), 0.006)
    schijf = V.smax(schijf, (rb - 0.012) - r, 0.002)
    rol = V.smax(np.abs(r - (rb + ext - 0.003)) - G(0.0075, 0.0085), np.abs(z - zb) - G(0.0098, 0.011), 0.007)
    d = V.smin(V.smin(koepel, schijf, 0.012), rol, 0.004)
    # de band om de voet van de koepel, met nagels
    band = V.smax(V.ellips(Q, (0, 0, 0), (H['ax'] + 0.006, H['ay'] + 0.006, H['h'] + 0.006)), np.abs(z - 0.022) - 0.015, 0.003)
    d = V.smin(d, V.smax(band, -O - 0.008, 0.002), 0.002)
    for i in range(10):
        a = 2 * math.pi * (i + 0.5) / 10
        px = 1.0 / math.sqrt((math.cos(a) / (H['ax'] + 0.007)) ** 2 + (math.sin(a) / (H['ay'] + 0.007)) ** 2)
        d = V.smin(d, V.bol(Q, (px * math.cos(a), px * math.sin(a), 0.022), G(0.0078, 0.0066)), 0.001)
    # de ribben: van de band naar de kruin, met een knop bovenop
    for i in range(3):
        a = math.pi * (i + 0.5) / 3
        rib = V.smax(np.abs(x * math.cos(a) + y * math.sin(a)) - 0.0052, O - 0.0042, 0.003)
        d = V.smin(d, V.smax(rib, 0.03 - z, 0.006), 0.003)
    d = V.smin(d, V.ellips(Q, (0, 0, H['h'] + 0.004), (0.022, 0.022, 0.012)), 0.006)
    return d * k


def verf_helm(P, N, bol):
    Q, _ = helm_ruimte(P)
    v = M.verf('mat_staal', P, bol, 4, 0.005, N)
    r = np.sqrt((Q[..., :2] ** 2).sum(-1))
    band = np.where(np.abs(Q[..., 2] - 0.022) < 0.015, 1.0, 0.0) * np.where(r < 0.19, 1.0, 0.0)
    w = M.verf('gesmeed_ijzer', P, bol, 5, 0.005, N)
    uit = M.meng(v, w, band * 0.35)
    # geschilderd licht: per vlak tussen de ribben een eigen waarde, boven helder en onder donker, de binnenkant bijna zwart
    phi = np.arctan2(Q[..., 1], Q[..., 0])
    vlak = 1.0 + 0.09 * np.cos(3.0 * phi + 1.1)
    f = (0.72 + 0.52 * np.clip(N[..., 2], 0, 1) ** 1.3) * vlak
    uit = (uit[0] * f[..., None], *uit[1:])
    binnen = np.where(N[..., 2] < -0.25, 1.0, 0.0)
    # krassen en slijtage: dun, en alleen op de grote vlakken
    krassen = V.stap(0.7, 0.76, V.ruis(P, (0.006, 0.09, 0.006), 14, 2)) * 0.1
    uit = M.meng(uit, M.kleur('#c6ccd5', uit), krassen)
    # donkere naden langs de ribben en de band
    uit = M.meng(uit, M.kleur('#303640', uit), np.clip(-bol / 0.0025, 0, 1) * 0.6)
    return M.meng(uit, M.kleur('#303640', uit), binnen * 0.9)


# --- de kap: gewatteerd, een rol om de hals en achter het hoofd omhoog -----------------------------------------------------

def _kap_naden(P):
    """De stiksels van de kap: gebogen ringen om de hals."""
    z = P[..., 2] - 0.15 * np.sqrt(P[..., 0] ** 2 + (P[..., 1] - 0.012) ** 2)
    return np.exp(-(((z / 0.052) % 1.0 - 0.5) / 0.1) ** 2)


def veld_kap(P):
    Q, k = kop_ruimte(P)
    d = schedel(Q) * k - 0.018
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    # de rol om de hals: een platte ring, voor lager dan achter
    z0 = G(0.895, 0.885) + 0.05 * V.stap(-0.1, 0.1, y)
    a, b_, rr = G(0.128, 0.148), G(0.112, 0.128), G(0.038, 0.048)
    rho = np.sqrt((x / a) ** 2 + ((y - 0.012) / b_) ** 2)
    rol = np.sqrt(((rho - 1.0) * a) ** 2 + (z - z0) ** 2) - rr
    d = V.smin(d, rol, 0.04)
    if BOUW['vorm'] >= 2:
        # een tweede plooi boven de rol, zodat het een kap is en geen koker
        rho2 = np.sqrt((x / 0.122) ** 2 + ((y - 0.012) / 0.108) ** 2)
        d = V.smin(d, np.sqrt(((rho2 - 1.0) * 0.12) ** 2 + (z - (z0 + 0.052)) ** 2) - 0.03, 0.045)
    d = V.smax(d, G(0.85, 0.838) - z, 0.012)
    # de opening voor het gezicht
    gat = V.ellips(Q, (0, -0.135, 0.095), G((0.112, 0.125, 0.145), (0.118, 0.135, 0.15)))
    d = V.weg(d, gat * k, 0.012)
    if BOUW['vorm'] >= 2:
        return d + 0.0022 * _kap_naden(P) + (V.ruis(P, (0.07, 0.07, 0.04), 18, 2) - 0.5) * 0.012
    u, phi = as_ruimte(P, (0, 0.012, 0.8), (0, 0.012, 1.2))
    return d - 0.005 * ruiten(u, phi, 0.10, 9)


def verf_kap(P, N, bol):
    v = M.verf('kap', P, bol, 6, 0.007, N)
    d = M.kleur('#3f2110', v)
    return M.meng(v, d, _kap_naden(P) * 0.32)


# --- de gambeson: de mouwen met grote gewatteerde ruiten, de rok die onder de tabberd uitkomt -------------------------------

def _mouw_ruiten(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = BOT['bovenarm' + n][:2]
    u, phi = as_ruimte(P, Sh, E)
    return ruiten(u, phi, G(0.098, 0.088), 6)


def veld_gambeson(P):
    r = romp(P)
    d = r - 0.018
    zh = BOUW['zoom_z']
    for s in (-1, 1):
        mouw = arm(P, s) - G(0.018, 0.016) - G(0.008, 0.015) * _mouw_ruiten(P, s)
        if BOUW['vorm'] >= 2:
            mouw = mouw + 0.022 * V.stap(-0.022, 0.006, _armsgat(P, s))
        # het eind van de mouw, onder de kap van de handschoen
        n = '.L' if s > 0 else '.R'
        E, W = BOT['onderarm' + n][:2]
        as_ = S._n(W - E).astype(np.float32)
        mouw = V.smax(mouw, (P - E) @ as_ - 0.14, 0.008)
        d = V.smin(d, mouw, 0.04)
    # de rok, die onder de tabberd uitkomt in de splitten
    z = P[..., 2]
    t = np.clip((0.6 - z) / (0.6 - zh - 0.02), 0, 1)
    rx, ry = 0.165 + 0.05 * t, 0.125 + 0.035 * t
    rok = (np.sqrt((P[..., 0] / rx) ** 2 + (P[..., 1] / ry) ** 2) - 1.0) * ry
    rok = V.smax(V.smax(rok, zh + 0.02 - z, 0.008), z - 0.62, 0.01)
    d = V.smin(d, rok, 0.03)
    return V.smax(d, zh + 0.02 - z, 0.006)


def verf_gambeson(P, N, bol):
    v = M.verf('bruine_watten', P, bol, 8, 0.008, N)
    for s in (-1, 1):
        kant = np.where(P[..., 0] * s > 0.2, 1.0, 0.0)
        r = _mouw_ruiten(P, s)
        # de ruit bol en licht, de naad donker: leest als gewatteerd leer
        v = M.meng(v, M.kleur('#c98338', v), r ** 6.0 * kant * 0.38)
        v = M.meng(v, M.kleur('#3a1a08', v), (1.0 - r) ** 2.6 * kant * 0.6)
    return v


# --- de tabberd ----------------------------------------------------------------------------------------------------------
_rng = np.random.default_rng(192)
PLOOIEN = [(_rng.uniform(-math.pi, math.pi), _rng.uniform(0.13, 0.24), _rng.uniform(0.5, 1.0), _rng.uniform(-0.2, 0.2)) for _ in range(13)]
HALS = ((0, 0.002, 0.925), (0.092, 0.08, 0.085))


def _zoom(P):
    theta = np.arctan2(P[..., 1], P[..., 0])
    return BOUW['zoom_z'] + 0.008 * np.sin(theta * 3 + 0.7) + 0.005 * np.sin(theta * 7 + 2.0)


def _armsgat(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = BOT['bovenarm' + n][:2]
    return V.staaf(P, Sh + np.array([s * G(0.055, 0.036), 0, 0.0]), E, 0.092, 0.098)


def veld_tabberd(P):
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    zr, zh = BOUW['riem_z'], BOUW['zoom_z']
    theta = np.arctan2(y, x)
    off = 0.036 - 0.009 * np.exp(-((z - zr) / 0.04) ** 2)
    boven = romp(P) - off + (V.ruis(P, (0.06, 0.06, 0.14), 13, 2) - 0.5) * 0.014
    if BOUW['vorm'] >= 2:
        # de stof bloest boven de riem, met een paar spanningsplooien van de schouder naar de riem en fijne rimpels bij de riem
        boven = boven - 0.013 * np.exp(-((z - (zr + 0.065)) / 0.04) ** 2)
        for s in (-1, 1):
            for a, b, w, am in ((0.075, 0.55, 0.016, 0.0048), (0.125, 0.35, 0.02, 0.0042)):
                boven = boven - am * np.exp(-((x * s - (a + b * (z - zr))) / w) ** 2) * V.stap(zr + 0.01, zr + 0.06, z) * V.stap(0.80, 0.70, z)
        boven = boven - 0.0045 * (0.5 + 0.5 * np.sin(theta * 24)) * np.exp(-((z - zr - 0.03) / 0.03) ** 2)
        # de sluiting in het midden
        boven = boven - 0.003 * np.exp(-(x / 0.017) ** 4) * (z > zr)
    boven = V.smax(boven, (zr - 0.02) - z, 0.02)
    # de rok, die wijd uitloopt, met een paar brede plooien
    t = np.clip((zr - z) / (zr - zh), 0, 1)
    rx = 0.185 + G(0.085, 0.095) * t ** 0.85
    ry = 0.145 + G(0.038, 0.046) * t ** 0.85
    rho = np.sqrt((x / rx) ** 2 + ((y - 0.002) / ry) ** 2)
    rok = (rho - 1.0) * ry
    plooi = np.zeros_like(z)
    for th, w, a, drift in PLOOIEN:
        dth = (theta - th - drift * t + math.pi) % (2 * math.pi) - math.pi
        plooi += a * np.exp(-(dth / w) ** 2)
    rok = rok - plooi * (0.1 + 0.9 * t) * G(0.03, 0.038)
    h = z - _zoom(P)
    if BOUW['vorm'] >= 2:
        # fijne rimpels onder de riem, en een verdikte zoom met een naad erboven
        rok = rok - 0.0035 * (0.5 + 0.5 * np.sin(theta * 28 + 1.0)) * np.exp(-((zr - 0.06 - z) / 0.03) ** 2)
        rok = rok - 0.0045 * V.stap(0.036, 0.024, h) + 0.0022 * np.exp(-((h - 0.04) / 0.003) ** 2)
    rok = V.smax(rok, _zoom(P) - z, 0.006)
    rok = V.smax(rok, z - (zr + 0.03), 0.01)
    d = V.smin(boven, rok, 0.03)
    for s in (-1, 1):
        if BOUW['vorm'] < 2:
            d = V.smin(d, V.smax(arm(P, s) - 0.036, 0.80 - z, 0.025), 0.02)
        ag = _armsgat(P, s)
        d = d - 0.0055 * V.stap(0.032, 0.024, ag)  # de dikke rand
        d = V.weg(d, ag, 0.008)
        # open in de zij onder de arm, en een split in de rok
        d = V.weg(d, V.doos(P, (s * 0.31, 0.0, (zr + 0.04 + 0.77) / 2), (0.14, 0.03, (0.77 - zr - 0.04) / 2), 0.012), 0.008)
        d = V.weg(d, V.doos(P, (s * 0.34, 0.0, zh + G(0.055, 0.03)), (0.2, G(0.017, 0.012), G(0.09, 0.07)), 0.006), 0.004)
    # voor en achter een split in het midden, waar de gambeson uitkomt
    d = V.weg(d, V.doos(P, (0.0, 0.0, zh + 0.01), (0.014, 0.4, 0.065), 0.012), 0.006)
    # de hals
    d = V.weg(d, V.ellips(P, *HALS), 0.012)
    # twee knopen voor op de borst
    for z_ in (0.815, 0.76):
        d = V.smin(d, V.bol(P, (0.0, -0.168 - (0.815 - z_) * 0.3 + G(0.0, -0.004), z_), 0.0095), 0.003)
    return d


def verf_tabberd(P, N, bol):
    """Vanuit de figuur: rechterborst blauw, linkerborst geel, rechterheup geel, linkerheup blauw (spelregel van de opdracht). De
    kleur hangt aan de plek op het lijf, dus aan de kant van de figuur, en draait dus mee: van achteren dezelfde kant dezelfde kleur."""
    x, z = P[..., 0], P[..., 2]
    blauw = M.verf('blauw_geverfd', P, bol, 21, 0.0075, N)
    geel = M.verf('geel_geverfd', P, bol, 22, 0.0075, N)
    links = V.stap(-0.003, 0.003, x)
    boven = V.stap(-0.003, 0.003, z - BOUW['riem_z'])
    is_geel = links if BOUW['tabberd'] == 'twee' else links * boven + (1 - links) * (1 - boven)
    v = M.meng(blauw, geel, is_geel)
    # geschilderde vormschaduw: onder de riem en naar de zoom toe, zoals het licht op de plaat valt
    zr = BOUW['riem_z']
    onder_riem = np.exp(-(np.clip(zr - 0.035 - z, 0, 1) / 0.035) ** 2) * (z < zr - 0.03)
    naar_zoom = np.clip((zr - z) / (zr - BOUW['zoom_z']), 0, 1) ** 2 * 0.26
    boven_riem = np.exp(-(np.clip(z - zr - 0.035, 0, 1) / 0.02) ** 2) * (z > zr + 0.03) * 0.35
    donkerder = np.clip(onder_riem * 0.55 + naar_zoom + boven_riem, 0, 1)
    v = M.meng(v, M.meng(M.kleur_van('blauw_geverfd', 'schaduw', v), M.kleur_van('geel_geverfd', 'schaduw', v), is_geel), donkerder)
    if BOUW['vorm'] >= 2:
        th = np.arctan2(P[..., 1], x)
        tt = np.clip((zr - z) / (zr - BOUW['zoom_z']), 0, 1)
        pl = np.zeros(len(P))
        for t0, w, a, drift in PLOOIEN:
            dth = (th - t0 - drift * tt + math.pi) % (2 * math.pi) - math.pi
            pl += a * np.exp(-(dth / w) ** 2)
        tussen_plooien = np.clip(1.0 - pl, 0, 1) * tt * (z < zr)
        v = M.meng(v, M.meng(M.kleur_van('blauw_geverfd', 'schaduw', v), M.kleur_van('geel_geverfd', 'schaduw', v), is_geel), tussen_plooien * 0.5)
        v = M.meng(v, M.meng(M.kleur_van('blauw_geverfd', 'licht', v), M.kleur_van('geel_geverfd', 'licht', v), is_geel), np.clip(pl - 0.8, 0, 1) * tt * (z < zr) * 0.4)
    # het stiksel en de zoom
    leer = M.verf('donker_leer', P, bol, 23, 0.012, N)
    h = z - _zoom(P)
    stiksel = np.exp(-((h - 0.021) / 0.0028) ** 2) * (np.sin(np.arctan2(P[..., 1], x) * 130) > -0.2)
    v = M.meng(v, M.kleur('#f0e2c0', v), stiksel * 0.55)
    v = M.meng(v, leer, np.clip(1.0 - h / 0.006, 0, 1) * 0.6)
    # de rand om de armsgaten: blauw op geel, geel op blauw
    rand = np.zeros(len(P))
    for s in (-1, 1):
        rand = np.maximum(rand, V.stap(0.0305, 0.0265, _armsgat(P, s)))
    v = M.meng(v, M.meng(geel, blauw, is_geel), rand)
    # de naad in het midden, het leren boord om de hals en de knopen
    v = M.meng(v, leer, np.exp(-(x / 0.0035) ** 2) * 0.5)
    v = M.meng(v, M.verf('licht_leer', P, bol, 26, 0.006, N), V.stap(0.02, 0.008, V.ellips(P, *HALS)))
    knoop = np.zeros(len(P))
    for z_ in (0.815, 0.76):
        knoop = np.maximum(knoop, np.where(((P - np.array([0.0, -0.168 - (0.815 - z_) * 0.3 + G(0.0, -0.004), z_])) ** 2).sum(-1) < 0.0105 ** 2, 1.0, 0.0))
    return M.meng(v, M.verf('licht_eiken', P, bol, 28, 0.012, N), knoop)


# --- de riem en de buidel ------------------------------------------------------------------------------------------------
GESP = (0.0, -0.206, 0.575)
BUIDEL = (-0.185, -0.135, 0.455)


def veld_riem(P):
    z = P[..., 2]
    zr = BOUW['riem_z']
    d = V.smax(romp(P) - G(0.046, 0.05), np.abs(z - zr) - 0.034, 0.007)
    if BOUW['vorm'] >= 2:
        # de randen van de riem wat dikker, met een naad ertussen
        d = d + 0.0018 * np.exp(-((np.abs(z - zr) - 0.024) / 0.003) ** 2)
        # een riemlus naast de gesp
        d = V.smin(d, V.doos(P, (0.115, -0.193, zr), (0.012, 0.012, 0.042), 0.005), 0.002)
    # de grote vierkante gesp en het eind van de riem
    g = V.doos(P, GESP, (0.066, 0.013, 0.052), 0.009)
    g = V.weg(g, V.doos(P, GESP, (0.04, 0.03, 0.029), 0.004), 0.002)
    d = V.smin(d, g, 0.002)
    d = V.smin(d, V.staaf(P, (GESP[0] - 0.04, GESP[1] - 0.012, GESP[2]), (GESP[0] + 0.03, GESP[1] - 0.012, GESP[2]), 0.0065), 0.002)
    d = V.smin(d, V.doos(P, (0.085, -0.195, 0.552), (0.022, 0.008, 0.034), 0.007), 0.003)
    return d


def verf_riem(P, N, bol):
    v = M.verf('riem', P, bol, 31, 0.006, N)
    donker = M.verf('zool', P, bol, 32, 0.012, N)
    metaal = M.verf('mat_staal', P, bol, 33, 0.004, N)
    h = np.abs(P[..., 2] - BOUW['riem_z'])
    v = M.meng(v, donker, np.exp(-((h - 0.0255) / 0.003) ** 2) * 0.7)
    px, pz = np.abs(P[..., 0] - GESP[0]), np.abs(P[..., 2] - GESP[2])
    binnen = (px < 0.039) & (pz < 0.028)
    pen = (np.abs(P[..., 2] - GESP[2]) < 0.008) & (P[..., 1] < GESP[1] - 0.004)
    masker = np.where((px < 0.07) & (pz < 0.056) & (P[..., 1] < GESP[1] + 0.016) & (~binnen | pen), 1.0, 0.0)
    return M.meng(v, metaal, masker)


def veld_buidel(P):
    c = np.array(BUIDEL)
    d = V.doos(P, c, (0.08, 0.044, 0.09), G(0.038, 0.042))
    d = d + (V.ruis(P, 0.05, 34) - 0.5) * G(0.008, 0.012)
    if BOUW['vorm'] >= 2:
        # dikker onderaan, zoals een buidel die iets draagt
        d = V.smin(d, V.ellips(P, c + np.array([0, -0.006, -0.05]), (0.075, 0.05, 0.05)), 0.02)
    # de klep
    k = V.doos(P, c + np.array([0, -0.012, 0.034]), (0.086, 0.042, 0.062), 0.026)
    d = V.smin(d, k, 0.002)
    # de lus om de riem en de knoop
    d = V.smin(d, V.doos(P, (c[0] + 0.03, c[1] + 0.012, 0.57), (0.03, 0.022, 0.05), 0.008), 0.006)
    if BOUW['vorm'] >= 2:
        # het sluitriempje
        d = V.smin(d, V.doos(P, c + np.array([0, -0.054, -0.018]), (0.012, 0.005, 0.042), 0.004), 0.002)
    return V.smin(d, V.bol(P, c + np.array([0, -0.058, -0.022 if BOUW['vorm'] >= 2 else 0.0]), 0.0115), 0.002)


def verf_buidel(P, N, bol):
    c = np.array(BUIDEL)
    v = M.verf('buidel', P, bol, 35, 0.008, N)
    k = M.verf('riem', P, bol, 36, 0.008, N)
    me = M.verf('mat_staal', P, bol, 37, 0.004, N)
    knoop = np.where(((P - (c + np.array([0, -0.058, -0.022 if BOUW['vorm'] >= 2 else 0.0]))) ** 2).sum(-1) < 0.0125 ** 2, 1.0, 0.0)
    return M.meng(M.meng(v, k, (P[..., 2] > c[2] - 0.022) * 0.5), me, knoop)


# --- de hozen ------------------------------------------------------------------------------------------------------------

def veld_hozen(P):
    d = V.smin(been(P, -1), been(P, 1), 0.004) - (0.002 + 0.012 * V.stap(0.2, 0.34, P[..., 2]))
    d = d + (V.ruis(P, (0.05, 0.05, 0.03), 40, 2) - 0.5) * G(0.01, 0.014)
    return V.smax(V.smax(d, 0.14 - P[..., 2], 0.01), P[..., 2] - (0.5 + BOUW['benen']), 0.02)


def verf_hozen(P, N, bol):
    return M.verf('hozen', P, bol, 41, 0.008, N)


# --- de laarzen: een schacht met band en gesp, een brede omslag en een dikke zool --------------------------------------------

def _omslag_midden(s):
    n = '.L' if s > 0 else '.R'
    A = BOT_W['scheen' + n][1]
    K0 = BOT_W['scheen' + n][0]
    return A + (K0 - A) / np.linalg.norm(K0 - A) * 0.125


def _omslag_onder(P, s):
    c = _omslag_midden(s)
    theta = np.arctan2(P[..., 1] - c[1], P[..., 0] - c[0])
    if BOUW['vorm'] >= 2:
        # een gekartelde onderrand: vier punten rondom
        return 0.168 - 0.024 * np.abs(((theta * 4 + s) / (2 * math.pi)) % 1.0 - 0.5) * 2.0
    return 0.152 + 0.012 * np.sin(theta * 5 + s)


def laars(P, s):
    n = '.L' if s > 0 else '.R'
    A = BOT_W['scheen' + n][1]
    x = A[0]
    K = _omslag_midden(s)
    z = P[..., 2]
    d = V.vloei([
        V.staaf(P, A + np.array([0, 0.004, -0.02]), A * 0.25 + K * 0.75, 0.08, 0.09),
        V.ellips(P, (x, 0.028, 0.07), (0.086, 0.09, 0.07)),
        V.ellips(P, (x + s * 0.002, -0.075, 0.062), (0.096, 0.135, 0.062)),
        V.ellips(P, (x + s * 0.004, -0.178, 0.054), (0.092, 0.09, G(0.05, 0.056))),
    ], 0.035)
    d = d + (V.ruis(P, (0.06, 0.06, 0.03), 50, 2) - 0.5) * 0.005
    if BOUW['vorm'] >= 2:
        # plooien boven de enkel, en een naad om de neus
        d = d + 0.0035 * np.sin(z * 150) * np.exp(-((z - 0.105) / 0.022) ** 2) * (P[..., 1] > -0.09)
        d = d + 0.0035 * np.exp(-((P[..., 1] + 0.135 - 8.0 * (P[..., 0] - x) ** 2) / 0.0048) ** 2) * (z > 0.05)
    # een band om de schacht, en de gesp
    d = d - np.exp(-((z - 0.125) / 0.012) ** 2) * G(0.006, 0.008)
    d = V.smin(d, V.doos(P, (x + s * 0.09, 0.0, 0.125), (0.012, 0.026, 0.022), 0.004), 0.002)
    d = V.smax(d, 0.03 - z, 0.006)
    # de omslag: wijd, met een golvende onderrand
    r = np.sqrt((P[..., 0] - K[0]) ** 2 + (P[..., 1] - K[1]) ** 2)
    wijd = 0.106 + 0.02 * V.stap(0.15, 0.232, z)
    top = G(0.232, 0.25)
    if BOUW['vorm'] >= 2:
        wijd = 0.096 + 0.016 * V.stap(0.15, top, z)
    omslag = V.smax(V.smax(r - wijd, _omslag_onder(P, s) - z, 0.005), z - top, 0.01)
    if BOUW['vorm'] >= 2:
        # hol van boven, met een dikke rand: de broek komt eruit
        omslag = V.smax(omslag, -(V.smax(r - (wijd - 0.009), (top - 0.016) - z, 0.004)), 0.003)
    d = V.smin(d, omslag, 0.003)
    # de zool en de hak, breder dan de laars
    zool = V.smin(V.ellips(P, (x + s * 0.003, -0.098, 0.02), (0.098, 0.17, 0.03)), V.doos(P, (x, 0.03, 0.022), (0.08, 0.08, 0.03), 0.018), 0.012)
    if BOUW['vorm'] >= 2:
        # een holte onder de voet tussen hak en bal
        zool = V.weg(zool, V.doos(P, (x, -0.05, 0.0), (0.12, 0.018, 0.014), 0.006), 0.006)
    return V.smax(V.smin(d, zool, 0.002), -z, 0.002)


def veld_laarzen(P):
    return V.smin(laars(P, -1), laars(P, 1), 0.001)


def verf_laarzen(P, N, bol):
    z = P[..., 2]
    v = M.verf('laars', P, bol, 51, 0.008, N)
    om = M.verf('omslag', P, bol, 52, 0.007, N)
    zool = M.verf('zool', P, bol, 53, 0.012, N)
    me = M.verf('mat_staal', P, bol, 54, 0.004, N)
    onder = np.where(P[..., 0] > 0, _omslag_onder(P, 1), _omslag_onder(P, -1))
    v = M.meng(v, om, V.stap(-0.004, 0.003, z - onder))
    # het stiksel langs de onderkant van de omslag en boven de zool
    v = M.meng(v, M.kleur('#e0b47e', v), np.exp(-((z - onder - 0.011) / 0.0028) ** 2) * (np.sin(np.arctan2(P[..., 1], P[..., 0]) * 90) > 0) * 0.5)
    v = M.meng(v, zool, V.stap(0.046, 0.04, z))
    v = M.meng(v, M.kleur('#e0b47e', v), np.exp(-((z - 0.05) / 0.0026) ** 2) * (np.sin(P[..., 1] * 230) > 0) * 0.45)
    v = M.meng(v, zool, np.exp(-((z - 0.125) / 0.0115) ** 2) * 0.55)
    gesp = np.where((np.abs(np.abs(P[..., 0]) - 0.215) < 0.018) & (np.abs(P[..., 1]) < 0.026) & (np.abs(z - 0.125) < 0.022), 1.0, 0.0)
    return M.meng(v, me, gesp)


# --- de handschoenen: een brede leren kap en een grote vuist -----------------------------------------------------------------

def vuist(P, s):
    n = '.L' if s > 0 else '.R'
    kop, R = frame('hand' + n)
    h = S.HAND_SCHAAL
    Q = (P - kop) @ R / h
    G_ = S.GREEP
    d = V.doos(Q, (0, 0.03, -0.002), (0.041, 0.036, 0.025), 0.018)
    d = V.smin(d, V.staaf(Q, (0, -0.03, 0), (0, 0.02, 0), 0.036, 0.040), 0.02)
    # de linkerhand is vrij: minder dicht dan de hand om de speer
    open_ = s > 0 and BOUW['vorm'] >= 2
    hoeken = (-22, 32, 90, 150, 195) if open_ else (-25, 35, 95, 160, 215)
    stralen = [0.0135, 0.0135, 0.0125, 0.0118, 0.011]
    for i, xf in enumerate((0.031, 0.0105, -0.0105, -0.030)):
        L = (1.0, 1.0, 0.97, 0.9)[i] * (1.1 if open_ else 1.0)
        pts = []
        for a in hoeken:
            b = math.radians(a)
            rho = 0.0312 * L
            pts.append((s * xf, G_[1] + rho * math.sin(b), G_[2] + rho * math.cos(b)))
        d = V.smin(d, V.ketting(Q, pts, stralen), G(0.003, 0.0018))
        if BOUW['vorm'] >= 2:
            d = V.smin(d, V.bol(Q, pts[1], 0.0148), 0.003)  # de knokkel
    if open_:
        duim = [(s * 0.036, 0.015, -0.012), (s * 0.054, 0.05, -0.032), (s * 0.038, 0.088, -0.048)]
    else:
        duim = [(s * 0.036, 0.015, -0.012), (s * 0.052, 0.052, -0.034), (s * 0.026, 0.09, -0.05)]
    d = V.smin(d, V.ketting(Q, duim, [0.018, 0.0155, 0.0135]), G(0.006, 0.004))
    return d * h


def kap_as(s):
    n = '.L' if s > 0 else '.R'
    E, W = BOT['onderarm' + n][:2]
    return E, W, S._n(W - E).astype(np.float32)


def veld_handschoenen(P):
    d = None
    for s in (-1, 1):
        E, W, as_ = kap_as(s)
        a, b = E + (W - E) * 0.58, W + (W - E) * 0.08
        kap = V.staaf(P, a, b, 0.074, 0.064)
        # plat afgesneden aan de kant van de elleboog, met een dikke rand en twee banden
        u = (P - a) @ as_
        kap = V.smax(kap, -u, 0.006)
        kap = kap - np.exp(-((u - 0.008) / 0.011) ** 2) * 0.007 - np.exp(-((u - 0.062) / 0.008) ** 2) * 0.004
        if BOUW['vorm'] >= 2:
            # een riempje over de kap, met een klinknagel
            kap = kap - np.exp(-((u - 0.036) / 0.009) ** 2) * 0.0035
        v = V.smin(vuist(P, s), kap, 0.01)
        d = v if d is None else np.minimum(d, v)
    return d


def verf_handschoenen(P, N, bol):
    v = M.verf('handschoen', P, bol, 61, 0.005, N)
    k = M.verf('omslag', P, bol, 62, 0.007, N)
    r = M.verf('riem', P, bol, 63, 0.007, N)
    uit = v
    for s in (-1, 1):
        E, W, as_ = kap_as(s)
        u = (P - (E + (W - E) * 0.58)) @ as_
        kant = np.where(P[..., 0] * s > 0, 1.0, 0.0)
        kap = np.where(u < S.ONDERARM * 0.56, 1.0, 0.0) * kant
        uit = M.meng(uit, k, kap)
        uit = M.meng(uit, r, np.exp(-((u - 0.036) / 0.0085) ** 2) * kant * 0.9)
        lijn = np.exp(-((u - 0.016) / 0.003) ** 2) + np.exp(-((u - 0.056) / 0.003) ** 2)
        uit = M.meng(uit, M.kleur('#e0b47e', uit), np.clip(lijn, 0, 1) * kant * 0.4)
    return uit


# --- de speer ------------------------------------------------------------------------------------------------------------

def speer_ruimte(P):
    return P - BOT['speer'][0]


SPEER_BLAD_ = [0.76, 1.12]  # van, tot, langs de speer: wordt bij het bouwen op de lengte gezet


def veld_speer(P):
    Q = speer_ruimte(P)
    x, y, z = Q[..., 0], Q[..., 1], Q[..., 2]
    r = BOUW['speer_straal']
    o = BOUW['speer_onder']
    d = V.staaf(Q, (0, 0, o), (0, 0, SPEER_BLAD_[0] - 0.04), r * 1.05, r * 0.96)
    # de tule met twee ringen
    b0 = SPEER_BLAD_[0]
    d = V.smin(d, V.staaf(Q, (0, 0, b0 - 0.10), (0, 0, b0 + 0.04), r * 1.22, r * 0.72), 0.004)
    for z_ in (b0 - 0.09, b0 - 0.025):
        d = V.smin(d, V.staaf(Q, (0, 0, z_), (0, 0, z_ + 0.016), r * 1.42), 0.003)
    # de ijzeren punt onderaan
    d = V.smin(d, V.staaf(Q, (0, 0, o + 0.002), (0, 0, o + 0.075), r * 1.2, r * 1.24), 0.003)
    # het blad: langwerpig, met een middenrib en twee vlakken die elk hun eigen licht vangen
    t = np.clip((z - SPEER_BLAD_[0]) / (SPEER_BLAD_[1] - SPEER_BLAD_[0]), 0.0, 1.0)
    W_ = G(0.064, 0.066)
    w = W_ * np.where(t < 0.3, (t / 0.3) ** 0.8, ((1.0 - t) / 0.7) ** 0.95) + 0.0012
    th = G(0.022, 0.031) * (w / W_) + 0.0012
    blad = (np.abs(x) / w + np.abs(y) / th - 1.0) * np.minimum(w, th) * 0.8
    blad = V.smax(blad, np.maximum(SPEER_BLAD_[0] - z, z - SPEER_BLAD_[1]), 0.002)
    return V.smin(d, blad, 0.004)


def verf_speer(P, N, bol):
    Q = speer_ruimte(P)
    hout = M.verf('essenhout', Q, bol, 71, 0.004, N)
    # de nerf: lange strepen, donker en licht, recht langs de schacht
    nerf = V.stap(0.48, 0.7, V.ruis(Q, (0.012, 0.012, 0.3), 74, 2)) * 0.7
    hout = M.meng(hout, M.kleur('#6e3610', hout), nerf)
    lichter = V.stap(0.52, 0.72, V.ruis(Q, (0.016, 0.016, 0.36), 75, 2)) * 0.45
    hout = M.meng(hout, M.kleur('#e6a050', hout), lichter)
    staal = M.verf('mat_staal', Q, bol, 72, 0.002, N)
    ijzer = M.verf('gesmeed_ijzer', Q, bol, 73, 0.003, N)
    z = Q[..., 2]
    o = BOUW['speer_onder']
    v = M.meng(hout, ijzer, np.where((z > SPEER_BLAD_[0] - 0.105) | (z < o + 0.078), 1.0, 0.0))
    v = M.meng(v, staal, np.where(z > SPEER_BLAD_[0] - 0.005, 1.0, 0.0))
    # de ringen van de tule lichter, zodat ze lezen
    for z_ in (SPEER_BLAD_[0] - 0.09, SPEER_BLAD_[0] - 0.025):
        v = M.meng(v, M.kleur('#c9cdd4', v), np.where((z > z_ - 0.004) & (z < z_ + 0.02), 0.7, 0.0))
    # het blad: het ene vlak lichter dan het andere; de middenrib leest doordat ze tegen elkaar liggen
    x = Q[..., 0]
    blad = np.where(z > SPEER_BLAD_[0], 1.0, 0.0)
    v = (v[0], v[1], np.where(blad > 0, 0.45, v[2]), *v[3:])
    v = M.meng(v, M.kleur('#d4d8de', v), blad * np.where(x < 0, 0.85, 0.0))
    return M.meng(v, M.kleur('#61656f', v), blad * np.where(x > 0, 0.9, 0.0))


# --- de onderdelen: naam, veld, vak, voxelmaat, verf, botten -------------------------------------------------------------
ZIJDEN = ('.L', '.R')


def _zij(*namen):
    return [n + z for n in namen for z in ZIJDEN]


def delen():
    k = BOUW['kop']
    z0, zt = PIVOT[2] - 0.15 * k, PIVOT[2] + 0.37 * k
    h = 0.29 * k
    g = BOT['speer'][0]
    zh = BOUW['zoom_z']
    return [
        # naam, veld, laag vak, hoog vak, voxelmaat, verf, botten; het bovenlijf rekent in zijn eigen ruimte (zie omhoog)
        ('lijf', veld_lijf, (-0.66, -0.25, -0.02), (0.66, 0.25, 1.02 + BOUW['benen']), 0.008, lambda P, N, b: M.verf('huid', P, b, 2, 0.012, N),
         ['bekken', 'rug', 'borst', 'nek'] + _zij('sleutel', 'bovenarm', 'onderarm', 'dij', 'scheen')),
        ('hoofd', veld_hoofd, (-0.17 * k, -0.21 * k, z0), (0.17 * k, 0.17 * k, PIVOT[2] + 0.31 * k), 0.0032, verf_hoofd, ['hoofd', 'nek']),
        ('baard', veld_baard, (-0.12 * k, -0.17 * k, PIVOT[2] - 0.03 * k), (0.12 * k, 0.02 * k, PIVOT[2] + 0.2 * k), 0.0028, verf_baard, ['hoofd']),
        ('helm', veld_helm, (-h, -h, PIVOT[2] + 0.12 * k), (h, h, zt + 0.02), 0.0032, verf_helm, ['hoofd']),
        ('kap', veld_kap, (-0.27, -0.26, 0.79), (0.27, 0.26, PIVOT[2] + 0.34 * k), 0.0042, verf_kap, ['hoofd', 'nek', 'borst']),
        ('gambeson', veld_gambeson, (-0.56, -0.26, zh - 0.01), (0.56, 0.26, 0.97), 0.0052, verf_gambeson,
         ['bekken', 'rug', 'borst'] + _zij('sleutel', 'bovenarm', 'onderarm')),
        ('tabberd', veld_tabberd, (-0.36, -0.26, zh - 0.04), (0.36, 0.26, 0.96), 0.0038, verf_tabberd, None),
        ('riem', veld_riem, (-0.26, -0.24, 0.5), (0.26, 0.21, 0.65), 0.0028, verf_riem, ['bekken']),
        ('buidel', veld_buidel, (-0.31, -0.22, 0.32), (-0.05, -0.05, 0.64), 0.0034, verf_buidel, ['buidel']),
        ('hozen', veld_hozen, (-0.26, -0.15, 0.12), (0.26, 0.15, 0.52 + BOUW['benen']), 0.006, verf_hozen, ['bekken'] + _zij('dij', 'scheen')),
        ('laarzen', veld_laarzen, (-0.31, -0.30, -0.01), (0.31, 0.18, 0.285), 0.0038, verf_laarzen, _zij('scheen', 'voet', 'teen')),
        ('handschoenen', veld_handschoenen, (-0.66, -0.17, 0.18), (0.66, 0.17, 0.72), 0.0034, verf_handschoenen, _zij('onderarm', 'hand')),
        ('speer', veld_speer, (g[0] - 0.1, g[1] - 0.05, g[2] + BOUW['speer_onder'] - 0.01), (g[0] + 0.1, g[1] + 0.05, g[2] + BOUW['speer_boven'] + 0.01),
         0.0026, verf_speer, ['speer']),
    ]


# --- de gewichten --------------------------------------------------------------------------------------------------------

def _seg(v, a, b):
    ba = b - a
    t = np.clip(((v - a) @ ba) / max(ba @ ba, 1e-12), 0, 1)
    return np.linalg.norm(v - (a + t[:, None] * ba), axis=1)


ONDER = ('lijf', 'hozen', 'laarzen')  # deze rekenen al in de echte ruimte


def gewichten(v, q, namen, macht=7.0, gladkeren=3):
    """Per punt de botten, naar de afstand tot het bot gedeeld door zijn dikte, en nooit een bot van de andere kant: een dij
    trekt het andere been niet mee."""
    w = np.zeros((len(v), len(namen)), dtype=np.float32)
    for i, n in enumerate(namen):
        a, b, _ = BOT_W[n]
        basis = n.split('.')[0]
        d = _seg(v, a.astype(np.float64), b.astype(np.float64)) / BOT_STRAAL[basis]
        w[:, i] = 1.0 / np.maximum(d, 0.05) ** macht
        if n.endswith('.L'):
            w[v[:, 0] < -0.01, i] = 0
        if n.endswith('.R'):
            w[v[:, 0] > 0.01, i] = 0
    return _gewicht_af(w, q, gladkeren)


def _gewicht_af(w, q, gladkeren=3):
    w /= np.maximum(w.sum(axis=1, keepdims=True), 1e-12)
    if gladkeren:
        i, j, n = V.buren(q, len(w))
        tel = np.maximum(np.bincount(i, minlength=n), 1)
        for _ in range(gladkeren):
            for c in range(w.shape[1]):
                w[:, c] = 0.5 * w[:, c] + 0.5 * np.bincount(i, weights=w[j, c], minlength=n) / tel
    # hooguit vier botten per punt
    if w.shape[1] > 4:
        rest = np.argsort(w, axis=1)[:, :-4]
        np.put_along_axis(w, rest, 0.0, axis=1)
    w /= np.maximum(w.sum(axis=1, keepdims=True), 1e-12)
    return w


def gewichten_tabberd(v, q):
    """De tabberd: boven de riem met de romp mee. Eronder hangt elk pand aan rok.V of rok.A, en naar de zoom toe vooral aan de dij van
    zijn eigen kant: zo gaat de zoom mee met de knie en steekt die er niet doorheen. Het midden is gespleten, dus dat mag uit elkaar."""
    namen = ['bekken', 'rug', 'borst', 'rok.V', 'rok.A', 'sleutel.L', 'sleutel.R', 'dij.L', 'dij.R']
    z = v[:, 2] - BOUW['benen']
    onder = V.stap(0.52, 0.40, z).astype(np.float64)
    voor = V.stap(0.015, -0.015, v[:, 1]).astype(np.float64)
    links = V.stap(-0.02, 0.02, v[:, 0]).astype(np.float64)
    dij = V.stap(0.50, 0.33, z).astype(np.float64) * 0.82
    boven = gewichten(v, q, ['bekken', 'rug', 'borst', 'sleutel.L', 'sleutel.R'], 5.0, 0)
    w = np.zeros((len(v), len(namen)), dtype=np.float32)
    w[:, 0] = boven[:, 0] * (1 - onder)
    w[:, 1] = boven[:, 1] * (1 - onder)
    w[:, 2] = boven[:, 2] * (1 - onder)
    w[:, 3] = onder * voor * (1 - dij)
    w[:, 4] = onder * (1 - voor) * (1 - dij)
    w[:, 5] = boven[:, 3] * (1 - onder)
    w[:, 6] = boven[:, 4] * (1 - onder)
    w[:, 7] = onder * dij * links
    w[:, 8] = onder * dij * (1 - links)
    return namen, _gewicht_af(w, q, 3)


# --- naar Blender --------------------------------------------------------------------------------------------------------

def naar_mesh(naam, v, q):
    m = bpy.data.meshes.new(naam)
    m.vertices.add(len(v))
    m.vertices.foreach_set('co', v.astype(np.float32).ravel())
    m.loops.add(q.size)
    m.loops.foreach_set('vertex_index', q.astype(np.int32).ravel())
    m.polygons.add(len(q))
    m.polygons.foreach_set('loop_start', np.arange(len(q), dtype=np.int32) * 4)
    m.update(calc_edges=True)
    m.polygons.foreach_set('use_smooth', np.ones(len(q), dtype=bool))
    m.update()
    return m


def maak_skelet():
    arm_data = bpy.data.armatures.new('skelet')
    arm_ = bpy.data.objects.new('skelet', arm_data)
    bpy.context.scene.collection.objects.link(arm_)
    bpy.context.view_layer.objects.active = arm_
    bpy.ops.object.mode_set(mode='EDIT')
    arm_['benen'] = BOUW['benen']
    for naam, kop, staart, ouder, z in S.botten():
        eb = arm_data.edit_bones.new(naam)
        eb.head, eb.tail = kop, staart
        eb.align_roll(z)
        if ouder:
            eb.parent = arm_data.edit_bones[ouder]
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb in arm_.pose.bones:
        pb.rotation_mode = 'QUATERNION'
    return arm_


def rust_van(arm_):
    S.E = float(arm_.get('benen', 0.0))
    r = S.Rust({b.name: np.array(b.matrix_local) for b in arm_.data.bones}, {b.name: b.parent.name if b.parent else None for b in arm_.data.bones})
    for b in arm_.data.bones:
        r.len[b.name] = b.length
    return r


def bolling_van(v, q, n):
    """Hoe bol elk punt ligt, op twee schalen: kleine randen en grote plooien (materialen.verf)."""
    return 0.55 * V.bolling(v, q, n, 6) + 0.45 * V.bolling(v, q, n, 40)


def bouw():
    t0 = time.time()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    arm_ = maak_skelet()
    mat = M.shader(bpy)
    info = {}
    top = 0.0
    e = np.array([0, 0, BOUW['benen']], dtype=np.float32)
    for naam, veld, lo, hi, h, verf, botten_ in delen():
        t1 = time.time()
        if naam in ONDER:
            v, q = V.maak(veld, lo, hi, h, 1)
        else:
            v, q = V.maak(lambda P: veld(P - e), np.array(lo) + e, np.array(hi) + e, h, 1)
        n = V.normalen(v, q)
        bol = bolling_van(v, q, n)
        m = naar_mesh(naam, v, q)
        p_verf = v.astype(np.float32) if naam in ONDER else (v.astype(np.float32) - e)
        M.zet_verf(m, verf(p_verf, n, bol), contact=0.4 if naam in ('hoofd', 'baard') else 1.0)
        # voor de textuurbak (textuur.py): de bolling blijft bewaard
        at = m.attributes.new('bol', 'FLOAT', 'POINT')
        at.data.foreach_set('value', bol.astype(np.float32))
        m.materials.append(mat)
        ob = bpy.data.objects.new(naam, m)
        bpy.context.scene.collection.objects.link(ob)
        ob.parent = arm_
        if botten_ is None:
            namen, w = gewichten_tabberd(v, q)
        elif len(botten_) == 1:
            namen, w = botten_, np.ones((len(v), 1), dtype=np.float32)
        else:
            namen, w = botten_, gewichten(v, q, botten_)
        for i, b in enumerate(namen):
            vg = ob.vertex_groups.new(name=b)
            niet0 = np.nonzero(w[:, i] > 1e-4)[0]
            for vi, wi in zip(niet0.tolist(), w[niet0, i].tolist()):
                vg.add([vi], wi, 'REPLACE')
        mod = ob.modifiers.new('skelet', 'ARMATURE')
        mod.object = arm_
        mod.use_deform_preserve_volume = True
        # het lijf zit onder de kleren: het blijft in het bestand voor een volgende eenheid, maar gaat niet mee in de render
        ob.hide_render = naam == 'lijf'
        if naam == 'helm':
            ob.visible_shadow = False  # geen slagschaduw van de rand op het gezicht: dan blijft het gezicht lezen
        info[naam] = {'punten': len(v), 'vlakken': len(q), 'voxel': h, 's': round(time.time() - t1, 1)}
        if naam not in ('speer', 'lijf'):
            top = max(top, float(v[:, 2].max()))
        print(f'{naam}: {len(v)} punten in {time.time() - t1:.1f} s', flush=True)
    info['_lengte'] = float(top)
    info['_tijd'] = round(time.time() - t0, 1)
    return arm_, info


def bak_houdingen(arm_):
    """De bewegingen als sleutels op de botten, één actie per houding, zodat ze in het .blend (en een GLB) zitten."""
    rust = rust_van(arm_)
    arm_.animation_data_create()
    for houding, beelden in HOUDINGEN.items():
        act = bpy.data.actions.new(houding)
        act.use_fake_user = True
        arm_.animation_data.action = act
        for f in range(beelden):
            B.zet(arm_, rust, houding, f / beelden)
            for pb in arm_.pose.bones:
                pb.keyframe_insert('location', frame=f + 1, group=pb.name)
                pb.keyframe_insert('rotation_quaternion', frame=f + 1, group=pb.name)
    arm_.animation_data.action = None
    B.zet(arm_, rust, 'staan', 0.0)


def zet_bouw(argv):
    """De keuzes van de opdrachtregel, en wat daaruit volgt: de benen en de lengte van de speer."""
    global BOT_W
    for a in argv:
        k, v = a.split('=')
        BOUW[k] = v if k == 'tabberd' else float(v)
    S.E = BOUW['benen']
    BOT_W = _botten(BOUW['benen'])
    # de speer: rechtop net boven de grond, 1,3 keer de lengte
    h_figuur = PIVOT[2] + BOUW['benen'] + 0.365 * BOUW['kop']
    greep_z = 0.72 + BOUW['benen']
    BOUW['speer_onder'] = -(greep_z - 0.03)
    BOUW['speer_boven'] = float(h_figuur * BOUW['speer_lengte'] + BOUW['speer_onder'])
    SPEER_BLAD_[0], SPEER_BLAD_[1] = BOUW['speer_boven'] - 0.36, BOUW['speer_boven']


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    zet_bouw(argv[1:])
    os.makedirs(os.path.dirname(uit), exist_ok=True)
    arm_, info = bouw()
    info['_kop_procent'] = round(float((info['_lengte'] - PIVOT[2] - BOUW['benen']) / info['_lengte'] * 100), 1)
    arm_['lengte'] = float(info['_lengte'])
    arm_['bouw'] = json.dumps(BOUW)
    bak_houdingen(arm_)
    bpy.ops.wm.save_as_mainfile(filepath=uit, compress=True)
    with open(uit.rsplit('.', 1)[0] + '.json', 'w', encoding='utf-8') as f:
        json.dump({'bouw': BOUW, 'delen': info}, f, indent=2, default=float)
    print('KLAAR', uit, info['_lengte'], info['_kop_procent'], flush=True)


if __name__ == '__main__':
    hoofd()
