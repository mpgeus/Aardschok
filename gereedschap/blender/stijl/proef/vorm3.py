# De vormcorrectie van de speerman (vraag 192, Marcels opdracht van 31 okt): één geometrische variant, gemeten op docs/art/referentie/aardschok-speerman-detail.png.
# Hij vervangt alleen velden van figuur.py, in dit proces; figuur.py en bron/speerman.blend blijven zoals ze zijn. Skelet, bewegingen en camera zijn die van de productie.
#
#   blender.exe -b --factory-startup -P gereedschap/blender/stijl/proef/vorm3.py -- <uit.blend>
import math
import os
import sys

import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import figuur as F  # noqa: E402
import materialen as M  # noqa: E402
import skelet as S  # noqa: E402
import vorm as V  # noqa: E402

# --- de getallen, gemeten op de plaat als deel van de lengte ------------------------------------------------------------------
F.BOUW['zoom_z'] = 0.245  # de rok langer: op de plaat komt de zoom bijna op de omslag van de laars
KOP = 1.15  # gemeten tegen de hele figuur is het hoofd op de plaat zo'n 9 procent kleiner dan bij 1,26: helmkoepel 0,25 tegen 0,28 van de lengte
LENGTE_PRODUCTIE = 1.3976540498447416  # de lengte waarop vel.py de schaal zet: hij blijft, dus een meter blijft evenveel pixels
OOG = (0.048, -0.103, 0.126)
GESP = (0.0, -0.192, 0.575)
F.OOG = OOG
F.GESP = GESP
KNOOP_BUIDEL = (0.0, -0.05, -0.012)


# --- het lijf: smallere taille, dunnere armen, zonder bulten ------------------------------------------------------------------

def romp(P):
    d = [V.ellips(P, (0, 0.0, 0.725), (0.205, 0.135, 0.15)),
         V.ellips(P, (0, -0.012, 0.60), (0.166, 0.122, 0.125)),
         V.ellips(P, (0, 0.002, 0.48), (0.155, 0.118, 0.085))]
    for s in (-1, 1):
        d.append(V.staaf(P, (s * 0.05, 0.005, 0.862), (s * S.SCHOUDER[0], 0.005, 0.832), 0.05, 0.05))
    return V.vloei(d, 0.05)


def arm(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = F.BOT['bovenarm' + n][:2]
    W = F.BOT['onderarm' + n][1]
    return V.vloei([
        V.ellips(P, Sh + np.array([s * 0.002, 0, -0.008]), (0.052, 0.058, 0.058)),
        V.staaf(P, Sh, E, 0.05, 0.046),
        V.bol(P, E, 0.046),
        V.staaf(P, E, W, 0.045, 0.036),
    ], 0.03)


def been(P, s):
    n = '.L' if s > 0 else '.R'
    H, K = F.BOT_W['dij' + n][:2]
    A = F.BOT_W['scheen' + n][1]
    return V.vloei([
        V.staaf(P, H, K, 0.096, 0.078),
        V.bol(P, K + np.array([0, -0.006, 0]), 0.078),
        V.staaf(P, K, A, 0.072, 0.058),
    ], 0.03)


def ruiten(u, phi, lengte, rond):
    """Kussens in plaats van vlakken met een dunne groef: de ruit bolt geleidelijk op, dus de mouw blijft één vorm."""
    a = u / lengte + phi * rond / (2 * math.pi)
    b = u / lengte - phi * rond / (2 * math.pi)
    return np.minimum(np.abs(np.sin(math.pi * a)), np.abs(np.sin(math.pi * b))) ** 0.62


# --- het hoofd: een breed, plat gezicht met grote vlakken -----------------------------------------------------------------------

def kaak(Q):
    return V.smin(V.doos(Q, (0, -0.03, 0.082), (0.1, 0.072, 0.066), 0.042), V.doos(Q, (0, -0.066, 0.045), (0.056, 0.036, 0.03), 0.02), 0.03)


def veld_hoofd(P):
    Q, k = F.kop_ruimte(P)
    d = V.smin(F.schedel(Q), V.doos(Q, (0, -0.03, 0.125), (0.106, 0.076, 0.065), 0.048), 0.03)  # het vlak van het gezicht
    d = V.smin(d, kaak(Q), 0.03)
    for s in (-1, 1):
        d = V.smin(d, V.ellips(Q, (s * 0.064, -0.09, 0.098), (0.034, 0.02, 0.026)), 0.03)  # de wang, vlak
        d = V.weg(d, V.ellips(Q, (s * OOG[0], -0.121, OOG[2]), (0.028, 0.017, 0.019)), 0.01)  # de oogkas, ondiep
        d = V.smin(d, V.ellips(Q, (s * OOG[0], OOG[1], OOG[2]), (0.021, 0.008, 0.016)), 0.002)  # het oog
        d = V.smin(d, V.ellips(Q, (s * 0.108, 0.0, 0.115), (0.012, 0.022, 0.03)), 0.008)  # het oor
        d = V.smin(d, V.bol(Q, (s * 0.025, -0.106, 0.094), 0.015), 0.01)  # de neusvleugel
    d = V.smin(d, V.staaf(Q, (-0.078, -0.098, 0.156), (0.078, -0.098, 0.156), 0.009), 0.016)  # de wenkbrauwboog, recht en licht
    d = V.smin(d, V.staaf(Q, (0, -0.104, 0.146), (0, -0.118, 0.102), 0.012, 0.019), 0.012)  # de neus: een korte wig
    d = V.weg(d, V.staaf(Q, (-0.03, -0.106, 0.062), (0.03, -0.106, 0.062), 0.004), 0.005)  # de mond
    d = V.smin(d, V.staaf(Q, (0, 0.012, 0.05), (0, 0.012, -0.08), 0.062), 0.03)  # de hals
    return d * k


def veld_baard(P):
    Q, k = F.kop_ruimte(P)
    # een volle, korte baard die de kaak volgt; de strengen zitten in de verf
    b = kaak(Q) - 0.014
    b = V.smax(b, Q[..., 2] - (0.068 + 0.06 * V.stap(0.045, 0.09, np.abs(Q[..., 0]))), 0.008)
    b = V.smax(b, Q[..., 1], 0.03)
    b = V.weg(b, V.staaf(Q, (-0.022, -0.121, 0.06), (0.022, -0.121, 0.06), 0.004), 0.004)
    b = b + (V.ruis(Q, (0.02, 0.02, 0.05), 5, 2) - 0.5) * 0.004
    d = b
    for s in (-1, 1):
        d = V.smin(d, V.ketting(Q, [(s * 0.094, -0.05, 0.06), (s * 0.102, -0.035, 0.105), (s * 0.102, -0.03, 0.14)], [0.016, 0.013, 0.01]), 0.01)  # de bakkebaard
        d = V.smin(d, V.ketting(Q, [(s * 0.003, -0.118, 0.08), (s * 0.032, -0.116, 0.076), (s * 0.056, -0.103, 0.066)], [0.009, 0.0095, 0.007]), 0.008)  # de snor
        d = V.smin(d, V.ketting(Q, [(s * 0.018, -0.113, 0.157), (s * 0.05, -0.112, 0.157), (s * 0.08, -0.098, 0.155)], [0.0095, 0.0095, 0.006]), 0.004)  # de wenkbrauw
    return d * k


# --- de helm: hoge koepel, smalle hangende rand, een brede strip van voor naar achter ---------------------------------------------

def HELM():
    return {'z': 0.19, 'y': 0.014, 'ax': 0.136, 'ay': 0.149, 'h': 0.16, 'kantel': -11.0, 'rand_voor': 0.036, 'rand_rest': 0.052,
            'zak_voor': 0.018, 'zak_rest': 0.04, 'dik': 0.0055}


def veld_helm(P):
    Q, k = F.helm_ruimte(P)
    H = HELM()
    x, y, z = Q[..., 0], Q[..., 1], Q[..., 2]
    O = V.ellips(Q, (0, 0, 0), (H['ax'], H['ay'], H['h']))
    O = O + (V.ruis(Q, 0.05, 11, 2) - 0.5) * 0.003
    koepel = V.smax(O, -O - 0.012, 0.002)
    koepel = V.smax(koepel, -z - 0.002, 0.004)
    phi = np.arctan2(y, x)
    voor = V.stap(0.2, 0.95, -np.sin(phi))
    ext = H['rand_rest'] + (H['rand_voor'] - H['rand_rest']) * voor
    zak = H['zak_rest'] + (H['zak_voor'] - H['zak_rest']) * voor
    r = np.sqrt(x * x + y * y)
    rb = 1.0 / np.sqrt((np.cos(phi) / H['ax']) ** 2 + (np.sin(phi) / H['ay']) ** 2)
    t = (r - rb) / ext
    zb = -zak * np.clip(t, 0, 1) ** 1.05 + 0.002
    schijf = np.abs(z - zb) - H['dik'] * (1.0 - 0.2 * np.clip(t, 0, 1))
    schijf = V.smax(schijf, r - (rb + ext), 0.005)
    schijf = V.smax(schijf, (rb - 0.012) - r, 0.002)
    d = V.smin(koepel, schijf, 0.01)
    # een smalle opstaande rand, geen rol: het leest als staal en niet als hoed
    rand = V.smax(np.abs(r - (rb + ext - 0.002)) - 0.0036, np.abs(z - zb) - 0.0065, 0.003)
    d = V.smin(d, rand, 0.003)
    band = V.smax(V.ellips(Q, (0, 0, 0), (H['ax'] + 0.006, H['ay'] + 0.006, H['h'] + 0.006)), np.abs(z - 0.022) - 0.015, 0.003)
    d = V.smin(d, V.smax(band, -O - 0.008, 0.002), 0.002)
    for i in range(8):
        a = 2 * math.pi * (i + 0.5) / 8
        px = 1.0 / math.sqrt((math.cos(a) / (H['ax'] + 0.007)) ** 2 + (math.sin(a) / (H['ay'] + 0.007)) ** 2)
        d = V.smin(d, V.bol(Q, (px * math.cos(a), px * math.sin(a), 0.022), 0.0072), 0.001)
    # een brede strip van voor naar achter, en aan elke kant een smalle rib
    for a, w in ((0.0, 0.0125), (math.radians(58), 0.0042), (math.radians(-58), 0.0042)):
        rib = V.smax(np.abs(x * math.cos(a) + y * math.sin(a)) - w, O - 0.0042, 0.003)
        d = V.smin(d, V.smax(rib, 0.03 - z, 0.006), 0.003)
    d = V.smin(d, V.staaf(Q, (0, 0, H['h'] - 0.006), (0, 0, H['h'] + 0.008), 0.02, 0.006), 0.006)  # de punt
    return d * k


# --- de kraag: een gestikte rol, kleiner, met een V aan de voorkant ---------------------------------------------------------------

def _kap_ruiten(P):
    u, phi = F.as_ruimte(P, (0, 0.012, 0.8), (0, 0.012, 1.2))
    return ruiten(u, phi, 0.07, 11)


def veld_kap(P):
    Q, k = F.kop_ruimte(P)
    d = F.schedel(Q) * k - 0.018
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    z0 = 0.9 + 0.04 * V.stap(-0.1, 0.1, y)
    a, b_, rr = 0.132, 0.116, 0.042
    rho = np.sqrt((x / a) ** 2 + ((y - 0.012) / b_) ** 2)
    d = V.smin(d, np.sqrt(((rho - 1.0) * a) ** 2 + ((z - z0) * 0.9) ** 2) - rr, 0.035)
    d = V.smax(d, 0.848 - z, 0.012)
    gat = V.ellips(Q, (0, -0.135, 0.095), (0.128, 0.135, 0.15))
    d = V.weg(d, gat * k, 0.012)
    # de V: de hals is te zien
    w = 0.008 + 0.5 * (z - 0.85)
    d = V.weg(d, V.smax((np.abs(x) - w) * 0.85, y + 0.04, 0.01), 0.012)
    return d - 0.0035 * _kap_ruiten(P) + (V.ruis(P, (0.07, 0.07, 0.04), 18, 2) - 0.5) * 0.003


def verf_kap(P, N, bol):
    v = M.verf('kap', P, bol, 6, 0.007, N)
    return M.meng(v, M.kleur('#3f2110', v), (1.0 - _kap_ruiten(P)) ** 2.2 * 0.6)


# --- de gambeson: dezelfde mouw zonder opgeblazen vorm -----------------------------------------------------------------------------

def _mouw_ruiten(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = F.BOT['bovenarm' + n][:2]
    u, phi = F.as_ruimte(P, Sh, E)
    return ruiten(u, phi, 0.082, 7)


def _armsgat(P, s):
    """Het armsgat ligt verder naar buiten: de tabberd loopt over de schouder, de mouw komt eronder uit."""
    n = '.L' if s > 0 else '.R'
    Sh, E = F.BOT['bovenarm' + n][:2]
    return V.staaf(P, Sh + np.array([s * 0.066, 0, 0.0]), E, 0.08, 0.09)


def veld_gambeson(P):
    d = romp(P) - 0.016
    zh = F.BOUW['zoom_z']
    for s in (-1, 1):
        mouw = arm(P, s) - 0.012 - 0.0085 * _mouw_ruiten(P, s)
        mouw = mouw + 0.016 * V.stap(-0.022, 0.006, _armsgat(P, s))
        n = '.L' if s > 0 else '.R'
        E, W = F.BOT['onderarm' + n][:2]
        as_ = S._n(W - E).astype(np.float32)
        mouw = V.smax(mouw, (P - E) @ as_ - 0.135, 0.008)
        d = V.smin(d, mouw, 0.03)
    z = P[..., 2]
    t = np.clip((0.6 - z) / (0.6 - zh - 0.02), 0, 1)
    rx, ry = 0.155 + 0.06 * t, 0.118 + 0.04 * t
    rok = (np.sqrt((P[..., 0] / rx) ** 2 + (P[..., 1] / ry) ** 2) - 1.0) * ry
    rok = V.smax(V.smax(rok, zh + 0.05 - z, 0.008), z - 0.62, 0.01)
    d = V.smin(d, rok, 0.03)
    return V.smax(d, zh + 0.05 - z, 0.006)


# --- de tabberd: vlakke panelen, een schouderstuk en een rechte rok -------------------------------------------------------------------

def _zoom(P):
    theta = np.arctan2(P[..., 1], P[..., 0])
    return F.BOUW['zoom_z'] + 0.004 * np.sin(theta * 3 + 0.7) + 0.002 * np.sin(theta * 7 + 2.0)


def veld_tabberd(P):
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    zr, zh = F.BOUW['riem_z'], F.BOUW['zoom_z']
    theta = np.arctan2(y, x)
    off = 0.031 - 0.007 * np.exp(-((z - zr) / 0.04) ** 2)
    boven = romp(P) - off + (V.ruis(P, (0.08, 0.08, 0.18), 13, 2) - 0.5) * 0.005
    boven = boven - 0.006 * np.exp(-((z - (zr + 0.06)) / 0.04) ** 2)
    for s in (-1, 1):
        boven = boven - 0.003 * np.exp(-((x * s - (0.085 + 0.5 * (z - zr))) / 0.02) ** 2) * V.stap(zr + 0.01, zr + 0.06, z) * V.stap(0.80, 0.70, z)
    boven = boven - 0.003 * np.exp(-(x / 0.017) ** 4) * (z > zr)
    boven = V.smax(boven, (zr - 0.02) - z, 0.02)
    # de rok: recht uitlopend, met een paar brede plooien
    t = np.clip((zr - z) / (zr - zh), 0, 1)
    rx = 0.18 + 0.10 * t ** 0.85
    ry = 0.14 + 0.055 * t ** 0.85
    rok = (np.sqrt((x / rx) ** 2 + ((y - 0.002) / ry) ** 2) - 1.0) * ry
    plooi = np.zeros_like(z)
    for th, w, a, drift in F.PLOOIEN:
        dth = (theta - th - drift * t + math.pi) % (2 * math.pi) - math.pi
        plooi += a * np.exp(-(dth / w) ** 2)
    rok = rok - plooi * (0.1 + 0.9 * t) * 0.018
    h = z - _zoom(P)
    rok = rok - 0.0045 * V.stap(0.036, 0.024, h) + 0.0022 * np.exp(-((h - 0.04) / 0.003) ** 2)  # de zoom en de naad
    rok = V.smax(rok, _zoom(P) - z, 0.005)
    rok = V.smax(rok, z - (zr + 0.03), 0.01)
    d = V.smin(boven, rok, 0.03)
    for s in (-1, 1):
        ag = _armsgat(P, s)
        d = d - 0.007 * V.stap(0.032, 0.022, ag)  # de dikke rand om het armsgat
        d = V.weg(d, ag, 0.006)
        d = V.weg(d, V.doos(P, (s * 0.34, 0.0, zh + 0.03), (0.2, 0.012, 0.07), 0.006), 0.004)  # de split opzij
    # de split voor en achter: van de zoom omhoog, onderaan wijder
    hoog = 0.15
    w = 0.007 + 0.05 * np.clip((zh + hoog - z) / hoog, 0, 1)
    d = V.weg(d, np.maximum(np.abs(x) - w, z - (zh + hoog)) * 0.9, 0.006)
    d = V.weg(d, V.ellips(P, *F.HALS), 0.012)
    for z_ in (0.815, 0.76):
        d = V.smin(d, V.bol(P, (0.0, -0.152 - (0.815 - z_) * 0.3, z_), 0.0095), 0.003)
    return d


# --- de riem en de buidel: rechte vlakken --------------------------------------------------------------------------------------------

def veld_riem(P):
    z = P[..., 2]
    zr = F.BOUW['riem_z']
    d = V.smax(romp(P) - 0.05, np.abs(z - zr) - 0.036, 0.006)
    d = d + 0.0018 * np.exp(-((np.abs(z - zr) - 0.026) / 0.003) ** 2)
    g = V.doos(P, GESP, (0.062, 0.012, 0.052), 0.008)
    g = V.weg(g, V.doos(P, GESP, (0.04, 0.03, 0.03), 0.004), 0.002)
    d = V.smin(d, g, 0.002)
    d = V.smin(d, V.staaf(P, (GESP[0] - 0.04, GESP[1] - 0.01, GESP[2]), (GESP[0] + 0.004, GESP[1] - 0.01, GESP[2]), 0.0065), 0.002)  # de pen
    return V.smin(d, V.doos(P, (0.088, -0.182, 0.55), (0.024, 0.008, 0.042), 0.006), 0.003)  # het eind van de riem


def veld_buidel(P):
    c = np.array(F.BUIDEL)
    d = V.doos(P, c + np.array([0, 0, -0.008]), (0.072, 0.034, 0.08), 0.016)
    d = d + (V.ruis(P, 0.06, 34) - 0.5) * 0.003
    d = V.smin(d, V.doos(P, c + np.array([0, -0.004, -0.058]), (0.076, 0.037, 0.03), 0.018), 0.012)  # iets dikker onderaan
    # de klep: rechte hoeken, steekt over de buidel
    d = V.smin(d, V.doos(P, c + np.array([0, -0.01, 0.034]), (0.079, 0.04, 0.046), 0.011), 0.002)
    # de lus om de riem, het sluitriempje en de knoop
    d = V.smin(d, V.doos(P, (c[0] + 0.03, c[1] + 0.012, 0.57), (0.03, 0.022, 0.05), 0.008), 0.006)
    d = V.smin(d, V.doos(P, c + np.array([0, -0.05, -0.002]), (0.013, 0.005, 0.044), 0.003), 0.002)
    return V.smin(d, V.bol(P, c + np.array(KNOOP_BUIDEL) + np.array([0, -0.006, 0]), 0.011), 0.002)


def verf_buidel(P, N, bol):
    c = np.array(F.BUIDEL)
    v = M.verf('buidel', P, bol, 35, 0.008, N)
    k = M.verf('riem', P, bol, 36, 0.008, N)
    me = M.verf('mat_staal', P, bol, 37, 0.004, N)
    knoop = np.where(((P - (c + np.array(KNOOP_BUIDEL) + np.array([0, -0.006, 0]))) ** 2).sum(-1) < 0.012 ** 2, 1.0, 0.0)
    return M.meng(M.meng(v, k, (P[..., 2] > c[2] - 0.012) * 0.5), me, knoop)


def veld_hozen(P):
    d = V.smin(been(P, -1), been(P, 1), 0.004) - (0.002 + 0.012 * V.stap(0.2, 0.34, P[..., 2]))
    d = d + (V.ruis(P, (0.05, 0.05, 0.03), 40, 2) - 0.5) * 0.006
    return V.smax(V.smax(d, 0.14 - P[..., 2], 0.01), P[..., 2] - (0.5 + F.BOUW['benen']), 0.02)


# --- de laarzen: blokkig, met een echte zool en hak, en een omslag met rechte kepen -----------------------------------------------------

def plaat(P, c, bx, by, hz, rxy, rz):
    """Een plaat die in bovenaanzicht grote ronde hoeken heeft, en aan de rand een kleine."""
    qx = np.abs(P[..., 0] - c[0]) - (bx - rxy)
    qy = np.abs(P[..., 1] - c[1]) - (by - rxy)
    vlak = np.sqrt(np.maximum(qx, 0) ** 2 + np.maximum(qy, 0) ** 2) + np.minimum(np.maximum(qx, qy), 0) - rxy
    return V.smax(vlak, np.abs(P[..., 2] - c[2]) - hz, rz)


def _omslag_onder(P, s):
    c = F._omslag_midden(s)
    theta = np.arctan2(P[..., 1] - c[1], P[..., 0] - c[0])
    return 0.168 - 0.026 * V.stap(-0.35, 0.35, np.sin(theta * 5 + s))


def laars(P, s):
    n = '.L' if s > 0 else '.R'
    A = F.BOT_W['scheen' + n][1]
    x = A[0]
    K = F._omslag_midden(s)
    z = P[..., 2]
    d = V.vloei([
        V.staaf(P, A + np.array([0, 0.004, -0.02]), A * 0.25 + K * 0.75, 0.068, 0.078),  # de schacht
        V.doos(P, (x, 0.035, 0.08), (0.07, 0.066, 0.06), 0.03),  # de hiel
        V.staaf(P, (x, -0.02, 0.098), (x + s * 0.004, -0.15, 0.068), 0.07, 0.056),  # de wreef
        plaat(P, (x + s * 0.004, -0.172, 0.058), 0.076, 0.082, 0.032, 0.058, 0.03),  # de neus, plat van boven en rond van voren
    ], 0.024)
    d = d + (V.ruis(P, (0.07, 0.07, 0.04), 50, 2) - 0.5) * 0.002
    # een naad om de neuskap, en twee plooien boven de enkel
    d = d + 0.003 * np.exp(-((P[..., 1] + 0.122 - 7.0 * (P[..., 0] - x) ** 2) / 0.0042) ** 2) * (z > 0.04)
    d = d + 0.0025 * np.sin(z * 110) * np.exp(-((z - 0.105) / 0.018) ** 2) * (P[..., 1] > -0.07)
    d = V.smax(d, 0.032 - z, 0.005)
    # de omslag: naar boven wijder, hol, met rechte kepen in de onderrand
    r = np.sqrt((P[..., 0] - K[0]) ** 2 + (P[..., 1] - K[1]) ** 2)
    top = 0.25
    wijd = 0.09 + 0.018 * V.stap(0.15, top, z)
    omslag = V.smax(V.smax(r - wijd, _omslag_onder(P, s) - z, 0.004), z - top, 0.008)
    omslag = V.smax(omslag, -(V.smax(r - (wijd - 0.009), (top - 0.016) - z, 0.004)), 0.003)
    d = V.smin(d, omslag, 0.003)
    # de zool: een plaat, breder dan de laars, en een hak met een holte eronder
    zool = V.smin(plaat(P, (x + s * 0.004, -0.165, 0.018), 0.086, 0.094, 0.018, 0.064, 0.008), plaat(P, (x, 0.028, 0.018), 0.074, 0.074, 0.018, 0.05, 0.008), 0.004)
    zool = V.smin(zool, plaat(P, (x, -0.06, 0.026), 0.07, 0.07, 0.01, 0.02, 0.006), 0.004)
    zool = V.weg(zool, V.doos(P, (x, -0.035, 0.0), (0.13, 0.024, 0.015), 0.004), 0.004)
    return V.smax(V.smin(d, zool, 0.0015), -z, 0.002)


def verf_laarzen(P, N, bol):
    z = P[..., 2]
    v = M.verf('laars', P, bol, 51, 0.008, N)
    om = M.verf('omslag', P, bol, 52, 0.007, N)
    zool = M.verf('zool', P, bol, 53, 0.012, N)
    onder = np.where(P[..., 0] > 0, _omslag_onder(P, 1), _omslag_onder(P, -1))
    v = M.meng(v, om, V.stap(-0.004, 0.003, z - onder))
    v = M.meng(v, M.kleur('#e0b47e', v), np.exp(-((z - onder - 0.011) / 0.0028) ** 2) * (np.sin(np.arctan2(P[..., 1], P[..., 0]) * 90) > 0) * 0.5)
    v = M.meng(v, zool, V.stap(0.048, 0.04, z))
    return M.meng(v, M.kleur('#e0b47e', v), np.exp(-((z - 0.052) / 0.0026) ** 2) * (np.sin(P[..., 1] * 230) > 0) * 0.45)


# --- de handschoenen: een rechte kap om de onderarm, een smalle pols en een grote hand ---------------------------------------------------

def veld_handschoenen(P):
    d = None
    for s in (-1, 1):
        E, W, as_ = F.kap_as(s)
        a, b = E + (W - E) * 0.56, W - (W - E) * 0.02
        u = (P - a) @ as_
        kap = V.smax(V.staaf(P, a, b, 0.058, 0.055), -u, 0.004)
        kap = kap - np.exp(-((u - 0.007) / 0.008) ** 2) * 0.005 - np.exp(-((u - 0.05) / 0.009) ** 2) * 0.003
        pols = V.staaf(P, b, W + (W - E) * 0.12, 0.046, 0.044)
        v = V.smin(F.vuist(P, s), V.smin(kap, pols, 0.008), 0.006)
        d = v if d is None else np.minimum(d, v)
    return d


def verf_handschoenen(P, N, bol):
    v = M.verf('handschoen', P, bol, 61, 0.005, N)
    k = M.verf('omslag', P, bol, 62, 0.007, N)
    r = M.verf('riem', P, bol, 63, 0.007, N)
    uit = v
    for s in (-1, 1):
        E, W, as_ = F.kap_as(s)
        u = (P - (E + (W - E) * 0.56)) @ as_
        kant = np.where(P[..., 0] * s > 0, 1.0, 0.0)
        uit = M.meng(uit, k, np.where(u < S.ONDERARM * 0.44, 1.0, 0.0) * kant)
        uit = M.meng(uit, r, np.exp(-((u - 0.05) / 0.0085) ** 2) * kant * 0.9)
        uit = M.meng(uit, M.kleur('#e0b47e', uit), np.exp(-((u - 0.016) / 0.003) ** 2) * kant * 0.4)
    return uit


# --- de vakken -----------------------------------------------------------------------------------------------------------------------

_delen = F.delen


def delen():
    """Dezelfde onderdelen; de helm hangt van achteren lager, dus zijn vak gaat verder omlaag."""
    k = F.BOUW['kop']
    uit = []
    for d in _delen():
        if d[0] == 'helm':
            d = (d[0], d[1], (d[2][0], d[2][1], F.PIVOT[2] + 0.07 * k), *d[3:])
        uit.append(d)
    return uit


for naam, f in dict(romp=romp, arm=arm, been=been, ruiten=ruiten, kaak=kaak, veld_hoofd=veld_hoofd, veld_baard=veld_baard, HELM=HELM, veld_helm=veld_helm,
                    veld_kap=veld_kap, verf_kap=verf_kap, _mouw_ruiten=_mouw_ruiten, _armsgat=_armsgat, veld_gambeson=veld_gambeson, _zoom=_zoom, veld_tabberd=veld_tabberd,
                    veld_riem=veld_riem, veld_buidel=veld_buidel, verf_buidel=verf_buidel, veld_hozen=veld_hozen, _omslag_onder=_omslag_onder, laars=laars,
                    verf_laarzen=verf_laarzen, veld_handschoenen=veld_handschoenen, verf_handschoenen=verf_handschoenen, delen=delen).items():
    setattr(F, naam, f)

_zet_bouw = F.zet_bouw


def zet_bouw(argv):
    """De speer behoudt zijn maat uit de productie: die rekent op het hoofd van 1,26. Daarna pas het kleinere hoofd."""
    _zet_bouw(argv)
    F.BOUW['kop'] = KOP


F.zet_bouw = zet_bouw


def hoofd():
    import json
    import bpy
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    F.zet_bouw(argv[1:])
    os.makedirs(os.path.dirname(uit), exist_ok=True)
    arm_, info = F.bouw()
    info['_kop_procent'] = round(float((info['_lengte'] - F.PIVOT[2]) / info['_lengte'] * 100), 1)
    arm_['lengte'] = LENGTE_PRODUCTIE
    arm_['bouw'] = json.dumps(F.BOUW)
    F.bak_houdingen(arm_)
    bpy.ops.wm.save_as_mainfile(filepath=uit, compress=True)
    with open(uit.rsplit('.', 1)[0] + '.json', 'w', encoding='utf-8') as f:
        json.dump({'bouw': F.BOUW, 'delen': info}, f, indent=2, default=float)
    print('KLAAR', uit, info['_lengte'], info['_kop_procent'], flush=True)


if __name__ == '__main__':
    hoofd()
