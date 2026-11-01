# Vormproef V4 van de speerman (vraag 192): de correcties bovenop V3 (proef/vorm3.py). Hij vervangt alleen velden in dit proces; figuur.py, vorm3.py en de productie blijven zoals ze zijn. Het skelet blijft, op de hulpbotten van rok-variant B na.
#
#   blender.exe -b --factory-startup -P gereedschap/blender/stijl/proef/vorm4.py -- <uit.blend> [rok=A|B]
import json
import math
import os
import sys

import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import figuur as F  # noqa: E402
import materialen as M  # noqa: E402
import pose4 as P4  # noqa: E402
import skelet as S  # noqa: E402
import vorm as V  # noqa: E402
import vorm3 as V3  # noqa: E402

KOP = V3.KOP
SPEER_KEER = 1.3  # keer de echte hoogte van de figuur
HAND_GROOTTE = 1.02  # de hand groeit om het midden van de greep, dus de vingers blijven om de schacht
OOG = (0.046, -0.1025, 0.127)
F.OOG = OOG
V3.OOG = OOG
# de buidel ligt op de heup en volgt het lijf (Marcel, 31 okt: "Het heup tasje hangt ook niet tegen het lijf aan"): schuin naar buiten gedraaid, de onderkant op de uitlopende rok
F.BUIDEL = (-0.182, -0.122, 0.45)
BUIDEL_DRAAI = 41.0
BUIDEL_KANTEL = 14.0
BUIDEL_BOCHT = 2.6


def zet(**velden):
    """Een veld vervangen in figuur.py én in vorm3.py: beide zoeken hun buren in hun eigen module op."""
    for naam, f in velden.items():
        setattr(F, naam, f)
        setattr(V3, naam, f)


# --- romp en armen: een borstkas, een taille en heupen; een schuine schouderlijn; geen buis --------------------------------------------

def romp(P):
    d = [V.ellips(P, (0, 0.0, 0.725), (0.2, 0.132, 0.148)),
         V.ellips(P, (0, -0.01, 0.60), (0.148, 0.112, 0.115)),
         V.ellips(P, (0, 0.004, 0.485), (0.152, 0.116, 0.088))]
    for s in (-1, 1):
        d.append(V.staaf(P, (s * 0.05, 0.005, 0.875), (s * S.SCHOUDER[0], 0.005, 0.806), 0.046, 0.046))  # de schouderlijn loopt af
    return V.vloei(d, 0.045)


ARM_DIEP = (1.28, 1.0)  # hoeveel de arm dieper is dan breed: bij de schouder, bij de elleboog


def _arm_ovaal(P, Sh, E):
    """De punten zo dat een ronde vorm om de arm van opzij dieper wordt, en naar de elleboog toe weer rond."""
    as_ = S._n(E - Sh).astype(np.float32)
    u = np.clip(((P - Sh) @ as_) / float(np.linalg.norm(E - Sh)), 0, 1)
    f = ARM_DIEP[0] + (ARM_DIEP[1] - ARM_DIEP[0]) * u
    q = P.copy()
    q[..., 1] = Sh[1] + (P[..., 1] - Sh[1]) / f
    return q


def arm(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = F.BOT['bovenarm' + n][:2]
    W = F.BOT['onderarm' + n][1]
    # de bovenkant van de arm ligt lager dan het gewricht: de schouder hangt, en de tabberd loopt er nog overheen
    S2 = Sh + np.array([0, 0, -0.032])
    Q = _arm_ovaal(P, S2, E)
    return V.vloei([V.staaf(Q, S2, E, 0.064, 0.05), V.bol(P, E, 0.05), V.staaf(P, E, W, 0.05, 0.046)], 0.022)


def been(P, s):
    """Dij, knie, kuit en enkel elk hun eigen maat: geen bal op de knie."""
    n = '.L' if s > 0 else '.R'
    H, K = F.BOT_W['dij' + n][:2]
    A = F.BOT_W['scheen' + n][1]
    return V.vloei([
        V.staaf(P, H, K, 0.084, 0.066),
        V.bol(P, K, 0.063),
        V.staaf(P, K, A, 0.06, 0.046),
        V.ellips(P, K * 0.6 + A * 0.4 + np.array([0, 0.008, 0]), (0.058, 0.062, 0.05)),
    ], 0.025)


def _armsgat(P, s):
    n = '.L' if s > 0 else '.R'
    Sh, E = F.BOT['bovenarm' + n][:2]
    S2 = Sh + np.array([s * 0.06, 0, -0.03])
    return V.staaf(_arm_ovaal(P, S2, E), S2, E, 0.097, 0.09)


def veld_gambeson(P):
    d = romp(P) - 0.014
    zh = F.BOUW['zoom_z']
    for s in (-1, 1):
        n = '.L' if s > 0 else '.R'
        Sh, E0 = F.BOT['bovenarm' + n][:2]
        E, W = F.BOT['onderarm' + n][:2]
        as_ = S._n(W - E).astype(np.float32)
        u_e = (P - E) @ as_
        # de stof volgt de arm: iets minder bol, met een plooi in de elleboog
        mouw = arm(P, s) - 0.012 - 0.0055 * V3._mouw_ruiten(P, s) + 0.002 * np.exp(-(u_e / 0.012) ** 2)
        mouw = mouw + 0.016 * V.stap(-0.022, 0.006, _armsgat(P, s))
        mouw = V.smax(mouw, u_e - 0.135, 0.008)
        d = V.smin(d, mouw, 0.028)
    z = P[..., 2]
    t = np.clip((0.6 - z) / (0.6 - zh - 0.02), 0, 1)
    rx, ry = 0.15 + 0.06 * t, 0.112 + 0.04 * t
    rok = (np.sqrt((P[..., 0] / rx) ** 2 + (P[..., 1] / ry) ** 2) - 1.0) * ry
    rok = V.smax(V.smax(rok, zh + 0.05 - z, 0.008), z - 0.62, 0.01)
    d = V.smin(d, rok, 0.03)
    return V.smax(d, zh + 0.05 - z, 0.006)


# --- het hoofd: voorhoofd, jukbeen, wang en kaak elk een eigen vlak; ondiepe ogen; een neutrale mond --------------------------------------

def kaak(Q):
    return V.smin(V.doos(Q, (0, -0.03, 0.082), (0.092, 0.07, 0.066), 0.042), V.doos(Q, (0, -0.06, 0.047), (0.05, 0.032, 0.028), 0.02), 0.03)


def veld_hoofd(P):
    Q, k = F.kop_ruimte(P)
    d = V.smin(F.schedel(Q), V.doos(Q, (0, -0.03, 0.128), (0.1, 0.074, 0.062), 0.046), 0.03)  # het voorhoofd en het vlak van het gezicht
    d = V.smin(d, kaak(Q), 0.03)
    for s in (-1, 1):
        d = V.smin(d, V.ellips(Q, (s * 0.07, -0.082, 0.106), (0.036, 0.024, 0.03)), 0.028)  # het jukbeen
        d = V.weg(d, V.ellips(Q, (s * OOG[0], -0.117, OOG[2]), (0.024, 0.012, 0.016)), 0.01)  # de oogkas, ondiep
        d = V.smin(d, V.ellips(Q, (s * OOG[0], OOG[1], OOG[2]), (0.018, 0.0065, 0.014)), 0.002)  # het oog
        d = V.smin(d, V.ellips(Q, (s * 0.104, 0.0, 0.115), (0.012, 0.022, 0.03)), 0.008)  # het oor
        d = V.smin(d, V.bol(Q, (s * 0.022, -0.106, 0.098), 0.012), 0.01)  # de neusvleugel
    d = V.smin(d, V.staaf(Q, (-0.074, -0.097, 0.158), (0.074, -0.097, 0.158), 0.007), 0.014)  # de wenkbrauwboog: licht
    d = V.smin(d, V.staaf(Q, (0, -0.103, 0.146), (0, -0.114, 0.106), 0.0095, 0.015), 0.012)  # de neus: kort en duidelijk
    d = V.weg(d, V.staaf(Q, (-0.026, -0.103, 0.064), (0.026, -0.103, 0.064), 0.003), 0.004)  # de mond, recht
    d = V.smin(d, V.staaf(Q, (0, 0.012, 0.05), (0, 0.012, -0.08), 0.062), 0.03)  # de hals
    return d * k


def veld_baard(P):
    """De baard zoals op de referentie, kort en langs de kaak: geen zware massa. De snor sluit erop aan, de wenkbrauwen zijn recht en zonder frons."""
    Q, k = F.kop_ruimte(P)
    b = kaak(Q) - 0.011
    b = V.smax(b, Q[..., 2] - (0.07 + 0.056 * V.stap(0.045, 0.086, np.abs(Q[..., 0]))), 0.008)
    b = V.smax(b, Q[..., 1], 0.03)
    b = V.weg(b, V.staaf(Q, (-0.02, -0.116, 0.062), (0.02, -0.116, 0.062), 0.0035), 0.004)
    b = b + (V.ruis(Q, (0.02, 0.02, 0.05), 5, 2) - 0.5) * 0.003
    d = b
    for s in (-1, 1):
        d = V.smin(d, V.ketting(Q, [(s * 0.09, -0.05, 0.062), (s * 0.097, -0.035, 0.105), (s * 0.097, -0.03, 0.14)], [0.0125, 0.0105, 0.008]), 0.01)  # de bakkebaard
        d = V.smin(d, V.ketting(Q, [(s * 0.003, -0.112, 0.08), (s * 0.03, -0.11, 0.077), (s * 0.05, -0.098, 0.068)], [0.0075, 0.008, 0.006]), 0.008)  # de snor
        d = V.smin(d, V.ketting(Q, [(s * 0.017, -0.111, 0.16), (s * 0.047, -0.11, 0.159), (s * 0.076, -0.097, 0.152)], [0.0082, 0.0085, 0.005]), 0.004)  # de wenkbrauw
    return d * k


def verf_hoofd(P, N, bol):
    Q, _ = F.kop_ruimte(P)
    v = M.verf('huid', P, bol, 3, 0.02, N)
    blos = sum(np.exp(-((Q - np.array(c)) ** 2).sum(-1) / (2 * r * r)) for c, r in (((0.066, -0.09, 0.098), 0.03), ((-0.066, -0.09, 0.098), 0.03), ((0, -0.13, 0.1), 0.024)))
    v = M.meng(v, M.kleur('#c4582e', v), blos * 0.45)
    v = M.meng(v, M.kleur('#a4603a', v), np.exp(-((Q[..., 2] - 0.086) / 0.01) ** 2) * np.exp(-(Q[..., 0] / 0.028) ** 2) * (Q[..., 1] < -0.09) * 0.4)
    # de ogen: een eenvoudige donkere vorm met een zware bovenrand en een klein lichtje, zoals op de referentie
    for s in (-1, 1):
        dx = Q[..., 0] - s * OOG[0]
        dz = Q[..., 2] - OOG[2]
        voor = Q[..., 1] < -0.088
        v = M.meng(v, M.kleur('#8a5230', v), np.where(voor, np.exp(-((dx / 0.024) ** 2 + (dz / 0.017) ** 2) * 0.6), 0.0) * 0.4)
        v = M.meng(v, M.kleur('#1e110a', v), np.where(voor & ((dx / 0.0165) ** 2 + (dz / 0.0135) ** 2 < 1), 1.0, 0.0))
        v = M.meng(v, M.kleur('#ffffff', v), np.where(voor & (((dx + 0.005) ** 2 + (dz - 0.004) ** 2) < 0.0032 ** 2), 1.0, 0.0))
    haar = M.verf('haar', P, bol, 39, 0.01, N)
    masker = V.stap(0.082, 0.094, np.abs(Q[..., 0])) * V.stap(0.09, 0.12, Q[..., 2]) * V.stap(-0.07, -0.05, Q[..., 1])
    oor = np.exp(-(((np.abs(Q[..., 0]) - 0.104) / 0.02) ** 2 + (Q[..., 1] / 0.024) ** 2 + ((Q[..., 2] - 0.115) / 0.034) ** 2))
    return M.meng(v, haar, masker * (1.0 - np.clip(oor * 1.6, 0, 1)))


# --- de helm: bredere koepel en rand, een zachtere overgang en een subtiele kam -------------------------------------------------------------

def HELM():
    return {'z': 0.19, 'y': 0.014, 'ax': 0.142, 'ay': 0.152, 'h': 0.16, 'kantel': -11.0, 'rand_voor': 0.04, 'rand_rest': 0.058, 'zak_voor': 0.02, 'zak_rest': 0.042, 'dik': 0.0055}


def veld_helm(P):
    Q, k = F.helm_ruimte(P)
    H = HELM()
    x, y, z = Q[..., 0], Q[..., 1], Q[..., 2]
    O = V.ellips(Q, (0, 0, 0), (H['ax'], H['ay'], H['h']))
    O = O + (V.ruis(Q, 0.06, 11, 2) - 0.5) * 0.002
    koepel = V.smax(V.smax(O, -O - 0.012, 0.002), -z - 0.002, 0.004)
    phi = np.arctan2(y, x)
    voor = V.stap(0.2, 0.95, -np.sin(phi))
    ext = H['rand_rest'] + (H['rand_voor'] - H['rand_rest']) * voor
    zak = H['zak_rest'] + (H['zak_voor'] - H['zak_rest']) * voor
    r = np.sqrt(x * x + y * y)
    rb = 1.0 / np.sqrt((np.cos(phi) / H['ax']) ** 2 + (np.sin(phi) / H['ay']) ** 2)
    t = (r - rb) / ext
    zb = -zak * np.clip(t, 0, 1) ** 1.05 + 0.002
    schijf = np.abs(z - zb) - H['dik'] * (1.0 - 0.2 * np.clip(t, 0, 1))
    schijf = V.smax(V.smax(schijf, r - (rb + ext), 0.005), (rb - 0.012) - r, 0.002)
    d = V.smin(koepel, schijf, 0.016)  # de overgang van koepel naar rand
    d = V.smin(d, V.smax(np.abs(r - (rb + ext - 0.002)) - 0.0034, np.abs(z - zb) - 0.0062, 0.003), 0.003)
    band = V.smax(V.ellips(Q, (0, 0, 0), (H['ax'] + 0.005, H['ay'] + 0.005, H['h'] + 0.005)), np.abs(z - 0.022) - 0.014, 0.003)
    d = V.smin(d, V.smax(band, -O - 0.008, 0.002), 0.002)
    for i in range(8):
        a = 2 * math.pi * (i + 0.5) / 8
        px = 1.0 / math.sqrt((math.cos(a) / (H['ax'] + 0.006)) ** 2 + (math.sin(a) / (H['ay'] + 0.006)) ** 2)
        d = V.smin(d, V.bol(Q, (px * math.cos(a), px * math.sin(a), 0.022), 0.0062), 0.001)
    for a, w, h_ in ((0.0, 0.011, 0.0052), (math.radians(58), 0.0036, 0.0034), (math.radians(-58), 0.0036, 0.0034)):  # de kam en de ribben
        rib = V.smax(np.abs(x * math.cos(a) + y * math.sin(a)) - w, O - h_, 0.003)
        d = V.smin(d, V.smax(rib, 0.03 - z, 0.006), 0.003)
    d = V.smin(d, V.staaf(Q, (0, 0, H['h'] - 0.006), (0, 0, H['h'] + 0.008), 0.018, 0.006), 0.006)
    return d * k


# --- de kraag: zichtbare hals, lager aan de voorkant ------------------------------------------------------------------------------------

def veld_kap(P):
    Q, k = F.kop_ruimte(P)
    d = F.schedel(Q) * k - 0.018
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    z0 = 0.888 + 0.052 * V.stap(-0.1, 0.1, y)
    a, b_, rr = 0.128, 0.114, 0.04
    rho = np.sqrt((x / a) ** 2 + ((y - 0.012) / b_) ** 2)
    d = V.smin(d, np.sqrt(((rho - 1.0) * a) ** 2 + ((z - z0) * 0.9) ** 2) - rr, 0.035)
    d = V.smax(d, 0.84 - z, 0.012)
    d = V.weg(d, V.ellips(Q, (0, -0.135, 0.095), (0.122, 0.135, 0.15)) * k, 0.012)
    w = 0.012 + 0.55 * (z - 0.84)
    d = V.weg(d, V.smax((np.abs(x) - w) * 0.85, y + 0.04, 0.01), 0.012)
    return d - 0.0035 * V3._kap_ruiten(P) + (V.ruis(P, (0.07, 0.07, 0.04), 18, 2) - 0.5) * 0.003


# --- de tabberd: een echte stoflaag, zonder zijsplit, die de benen ruimte geeft ------------------------------------------------------------

DIK = 0.011  # de dikte van de rok; hij is hol, dus de benen zitten erin en niet erdoor


def _zoom(P):
    theta = np.arctan2(P[..., 1], P[..., 0])
    return F.BOUW['zoom_z'] + 0.006 * np.sin(theta * 3 + 0.7) + 0.0025 * np.sin(theta * 7 + 2.0)


def veld_tabberd(P):
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    zr, zh = F.BOUW['riem_z'], F.BOUW['zoom_z']
    theta = np.arctan2(y, x)
    off = 0.028 - 0.006 * np.exp(-((z - zr) / 0.04) ** 2)
    boven = romp(P) - off + (V.ruis(P, (0.08, 0.08, 0.18), 13, 2) - 0.5) * 0.004
    boven = boven - 0.006 * np.exp(-((z - (zr + 0.06)) / 0.04) ** 2)
    for s in (-1, 1):
        boven = boven - 0.003 * np.exp(-((x * s - (0.085 + 0.5 * (z - zr))) / 0.02) ** 2) * V.stap(zr + 0.01, zr + 0.06, z) * V.stap(0.80, 0.70, z)
    boven = boven - 0.003 * np.exp(-(x / 0.017) ** 4) * (z > zr)
    boven = V.smax(boven, (zr - 0.02) - z, 0.02)
    t = np.clip((zr - z) / (zr - zh), 0, 1)
    rx = 0.168 + 0.112 * t ** 0.85
    ry = 0.135 + 0.06 * t ** 0.85
    rok = (np.sqrt((x / rx) ** 2 + ((y - 0.002) / ry) ** 2) - 1.0) * ry
    plooi = np.zeros_like(z)
    for th, w, a, drift in F.PLOOIEN:
        dth = (theta - th - drift * t + math.pi) % (2 * math.pi) - math.pi
        plooi += a * np.exp(-(dth / w) ** 2)
    rok = rok - plooi * (0.1 + 0.9 * t) * 0.016
    h = z - _zoom(P)
    rok = rok - 0.004 * V.stap(0.036, 0.024, h) + 0.002 * np.exp(-((h - 0.04) / 0.003) ** 2)
    # hol: een stoflaag met dikte, open aan de onderkant
    rok = V.smax(rok, -(rok + DIK), 0.002)
    rok = V.smax(rok, _zoom(P) - z, 0.004)
    rok = V.smax(rok, z - (zr + 0.03), 0.01)
    d = V.smin(boven, rok, 0.02)
    for s in (-1, 1):
        ag = _armsgat(P, s)
        d = d - 0.006 * V.stap(0.03, 0.02, ag)
        d = V.weg(d, ag, 0.006)
    # de split voor en achter, van de zoom omhoog en onderaan wijder
    hoog = 0.15
    w = 0.007 + 0.05 * np.clip((zh + hoog - z) / hoog, 0, 1)
    d = V.weg(d, np.maximum(np.abs(x) - w, z - (zh + hoog)) * 0.9, 0.006)
    d = V.weg(d, V.ellips(P, *F.HALS), 0.012)
    for z_ in (0.815, 0.76):
        d = V.smin(d, V.bol(P, (0.0, -0.146 - (0.815 - z_) * 0.3, z_), 0.0095), 0.003)
    return d


def veld_riem(P):
    z = P[..., 2]
    zr = F.BOUW['riem_z']
    G_ = (0.0, -0.172, 0.575)
    d = V.smax(romp(P) - 0.041, np.abs(z - zr) - 0.036, 0.006)
    d = d + 0.0018 * np.exp(-((np.abs(z - zr) - 0.026) / 0.003) ** 2)
    g = V.doos(P, G_, (0.062, 0.012, 0.052), 0.008)
    g = V.weg(g, V.doos(P, G_, (0.04, 0.03, 0.03), 0.004), 0.002)
    d = V.smin(d, g, 0.002)
    d = V.smin(d, V.staaf(P, (G_[0] - 0.04, G_[1] - 0.01, G_[2]), (G_[0] + 0.004, G_[1] - 0.01, G_[2]), 0.0065), 0.002)
    return V.smin(d, V.doos(P, (0.086, -0.158, 0.55), (0.024, 0.008, 0.042), 0.006), 0.003)


F.GESP = (0.0, -0.172, 0.575)


# --- de benen en de laarzen --------------------------------------------------------------------------------------------------------------

def veld_hozen(P):
    d = V.smin(been(P, -1), been(P, 1), 0.004) - (0.002 + 0.01 * V.stap(0.22, 0.34, P[..., 2]))
    d = d + 0.0025 * np.sin(P[..., 2] * 95) * np.exp(-((P[..., 2] - 0.3) / 0.035) ** 2)  # een paar plooien bij de knie
    d = d + (V.ruis(P, (0.05, 0.05, 0.03), 40, 2) - 0.5) * 0.004
    # boven de zoom is de broek toch niet te zien; hij stopt ruim onder de riem, anders komt hij bij de heup door de rok
    return V.smax(V.smax(d, 0.14 - P[..., 2], 0.01), P[..., 2] - (0.43 + F.BOUW['benen']), 0.02)


def _omslag_onder(P, s):
    c = F._omslag_midden(s)
    theta = np.arctan2(P[..., 1] - c[1], P[..., 0] - c[0])
    return 0.17 - 0.028 * V.stap(-0.35, 0.35, np.sin(theta * 5 + s))


def laars(P, s):
    n = '.L' if s > 0 else '.R'
    A = F.BOT_W['scheen' + n][1]
    x = A[0]
    K = F._omslag_midden(s)
    z = P[..., 2]
    d = V.vloei([
        V.staaf(P, A + np.array([0, 0.004, -0.02]), A * 0.25 + K * 0.75, 0.064, 0.072),  # de schacht, smal bij de enkel
        V.doos(P, (x, 0.035, 0.088), (0.068, 0.064, 0.06), 0.028),  # de hiel
        V.staaf(P, (x, -0.02, 0.108), (x + s * 0.004, -0.135, 0.08), 0.064, 0.058),  # de wreef
        V3.plaat(P, (x + s * 0.004, -0.155, 0.066), 0.082, 0.082, 0.038, 0.05, 0.028),  # de neus: hoog en kort
    ], 0.02)
    d = d + (V.ruis(P, (0.07, 0.07, 0.04), 50, 2) - 0.5) * 0.002
    d = d + 0.003 * np.exp(-((P[..., 1] + 0.108 - 6.0 * (P[..., 0] - x) ** 2) / 0.0042) ** 2) * (z > 0.04)  # de neuskap
    d = d + 0.0025 * np.sin(z * 110) * np.exp(-((z - 0.11) / 0.016) ** 2) * (P[..., 1] > -0.07)
    d = V.smax(d, 0.03 - z, 0.005)
    # de omslag: dik leer, hol, met rechte kepen
    r = np.sqrt((P[..., 0] - K[0]) ** 2 + (P[..., 1] - K[1]) ** 2)
    top = 0.24  # net onder de zoom, zoals op de referentie
    wijd = 0.086 + 0.02 * V.stap(0.15, top, z)
    omslag = V.smax(V.smax(r - wijd, _omslag_onder(P, s) - z, 0.004), z - top, 0.007)
    omslag = V.smax(omslag, -(V.smax(r - (wijd - 0.016), (top - 0.03) - z, 0.004)), 0.004)
    d = V.smin(d, omslag, 0.003)
    # de zool: dun onder de bal, een dikkere hak, met een holte ertussen
    voor = V3.plaat(P, (x + s * 0.004, -0.15, 0.016), 0.09, 0.094, 0.016, 0.056, 0.007)
    hak = V3.plaat(P, (x, 0.03, 0.024), 0.076, 0.072, 0.024, 0.04, 0.007)
    brug = V3.plaat(P, (x, -0.055, 0.028), 0.072, 0.065, 0.01, 0.02, 0.005)
    zool = V.smin(V.smin(voor, hak, 0.002), brug, 0.004)
    return V.smax(V.smin(d, zool, 0.0015), -z, 0.002)


_buidel = V3.veld_buidel


def _rok_buiten(P):
    x, y, z = P[..., 0], P[..., 1], P[..., 2]
    zr, zh = F.BOUW['riem_z'], F.BOUW['zoom_z']
    t = np.clip((zr - z) / (zr - zh), 0, 1)
    rx, ry = 0.168 + 0.112 * t ** 0.85, 0.135 + 0.06 * t ** 0.85
    return V.smax((np.sqrt((x / rx) ** 2 + ((y - 0.002) / ry) ** 2) - 1.0) * ry, z - (zr - 0.01), 0.005)


def _buidel_ruimte(P):
    """Naar de ruimte van de buidel: het midden op 0, de voorkant naar -y. De x-kromming buigt hem om de heup, zodat de randen het lijf raken."""
    c = np.array(F.BUIDEL, dtype=np.float32)
    R = (S.rz(math.radians(-BUIDEL_DRAAI)) @ S.rx(math.radians(-BUIDEL_KANTEL))).astype(np.float32)
    q = (P - c) @ R
    q = np.stack([q[..., 0], q[..., 1] - BUIDEL_BOCHT * q[..., 0] ** 2, q[..., 2]], axis=-1)
    return q


def veld_buidel(P):
    """Zacht leer: ronde hoeken, dun, en onderaan iets voller. De achterkant volgt de rok, dus hij ligt erop en gaat er niet doorheen ("Lijken wel hoekig er vanaf te staan")."""
    q = _buidel_ruimte(P)
    d = V.doos(q, (0, 0, -0.008), (0.068, 0.026, 0.076), 0.024)
    d = V.smin(d, V.ellips(q, (0, -0.004, -0.05), (0.066, 0.03, 0.04)), 0.02)
    d = d + (V.ruis(P, 0.06, 34) - 0.5) * 0.003
    # de klep, afgerond, die een stukje over de voorkant hangt
    d = V.smin(d, V.doos(q, (0, -0.008, 0.032), (0.072, 0.028, 0.044), 0.02), 0.003)
    # de riem waaraan hij hangt, omhoog over de riem van de figuur; het sluitriempje en de knoop
    d = V.smin(d, V.doos(q, (0.008, 0.012, 0.098), (0.024, 0.009, 0.05), 0.007), 0.006)
    d = V.smin(d, V.doos(q, (0, -0.036, 0.0), (0.012, 0.005, 0.04), 0.003), 0.002)
    d = V.smin(d, V.bol(q, (0, -0.042, -0.012), 0.0105), 0.002)
    return V.weg(d, _rok_buiten(P) - 0.003, 0.004)


def verf_buidel(P, N, bol):
    q = _buidel_ruimte(P)
    v = M.verf('buidel', P, bol, 35, 0.008, N)
    k = M.verf('riem', P, bol, 36, 0.008, N)
    me = M.verf('mat_staal', P, bol, 37, 0.004, N)
    knoop = np.where(((q - np.array([0, -0.042, -0.012])) ** 2).sum(-1) < 0.0115 ** 2, 1.0, 0.0)
    return M.meng(M.meng(v, k, (q[..., 2] > -0.012) * 0.5), me, knoop)


def verf_laarzen(P, N, bol):
    z = P[..., 2]
    v = M.verf('laars', P, bol, 51, 0.008, N)
    om = M.verf('omslag', P, bol, 52, 0.007, N)
    zool = M.verf('zool', P, bol, 53, 0.012, N)
    onder = np.where(P[..., 0] > 0, _omslag_onder(P, 1), _omslag_onder(P, -1))
    v = M.meng(v, om, V.stap(-0.004, 0.003, z - onder))
    hoog = np.where(P[..., 1] > -0.03, 0.05, 0.034)  # de hak is hoger dan de zool onder de bal
    v = M.meng(v, zool, np.where(z < hoog, 1.0, 0.0))
    return M.meng(v, M.kleur('#e0b47e', v), np.exp(-((z - hoog - 0.004) / 0.0026) ** 2) * (np.sin(P[..., 1] * 230) > 0) * 0.4)


# --- de hand en de speer --------------------------------------------------------------------------------------------------------------------

_vuist = F.vuist


def vuist(P, s):
    n = '.L' if s > 0 else '.R'
    kop, R = F.frame('hand' + n)
    G_ = (S.GREEP * S.HAND_SCHAAL).astype(np.float32)
    Q = (P - kop) @ R
    Q2 = G_ + (Q - G_) / HAND_GROOTTE
    return _vuist(kop + Q2 @ R.T, s) * HAND_GROOTTE


def veld_handschoenen(P):
    d = None
    for s in (-1, 1):
        E, W, as_ = F.kap_as(s)
        a, b = E + (W - E) * 0.5, W + (W - E) * 0.04
        u = (P - a) @ as_
        kap = V.smax(V.staaf(P, a, b, 0.064, 0.057), -u, 0.004)
        # de dikke rand, en een riempje
        kap = kap - np.exp(-((u - 0.008) / 0.008) ** 2) * 0.005 - np.exp(-((u - 0.052) / 0.008) ** 2) * 0.0035
        pols = V.staaf(P, b, W + (W - E) * 0.14, 0.052, 0.047)
        v = V.smin(vuist(P, s), V.smin(kap, pols, 0.008), 0.006)
        d = v if d is None else np.minimum(d, v)
    return d


def veld_speer(P):
    Q = F.speer_ruimte(P)
    x, y, z = Q[..., 0], Q[..., 1], Q[..., 2]
    r = F.BOUW['speer_straal']
    o = F.BOUW['speer_onder']
    b0, b1 = F.SPEER_BLAD_
    d = V.staaf(Q, (0, 0, o), (0, 0, b0 - 0.04), r * 1.04, r * 0.98)
    # één huls: geen kandelaar
    d = V.smin(d, V.staaf(Q, (0, 0, b0 - 0.095), (0, 0, b0 + 0.03), r * 1.3, r * 0.82), 0.003)
    d = V.smin(d, V.staaf(Q, (0, 0, o + 0.002), (0, 0, o + 0.07), r * 1.18, r * 1.22), 0.003)
    t = np.clip((z - b0) / (b1 - b0), 0.0, 1.0)
    W_ = 0.08
    w = W_ * np.where(t < 0.3, (t / 0.3) ** 0.8, ((1.0 - t) / 0.7) ** 0.95) + 0.0012
    th = 0.03 * (w / W_) + 0.0012
    blad = (np.abs(x) / w + np.abs(y) / th - 1.0) * np.minimum(w, th) * 0.8
    blad = V.smax(blad, np.maximum(b0 - z, z - b1), 0.002)
    return V.smin(d, blad, 0.004)


# --- de vakken, de gewichten en de hulpbotten ---------------------------------------------------------------------------------------------------

ROK = {'variant': 'A'}
_delen = V3.delen
_botten = S.botten


def delen():
    uit = []
    for d in _delen():
        if d[0] == 'speer':
            g = F.BOT['speer'][0]
            d = (d[0], d[1], (g[0] - 0.11, g[1] - 0.06, g[2] + F.BOUW['speer_onder'] - 0.06), (g[0] + 0.11, g[1] + 0.06, g[2] + F.BOUW['speer_boven'] + 0.02), *d[4:])
        if d[0] == 'buidel':
            d = (d[0], d[1], (-0.38, -0.28, 0.27), (0.0, 0.0, 0.7), *d[4:])  # hij is gedraaid: anders valt hij buiten het vak en blijft er een gat
        if d[0] == 'laarzen':
            d = (d[0], d[1], d[2], (d[3][0], d[3][1], 0.30), *d[4:])
        uit.append(d)
    return uit


def botten(e=None):
    """Variant B: per pand van de rok een hulpbot onder het bekken. De bestaande botten blijven gelijk en op hun plaats."""
    b = list(_botten(e))
    if ROK['variant'] == 'B':
        e_ = S.E if e is None else e
        voor = (0.0, -1.0, 0.0)
        for naam, x, y in (('rokp.VL', 0.09, -0.1), ('rokp.VR', -0.09, -0.1), ('rokp.AL', 0.09, 0.1), ('rokp.AR', -0.09, 0.1)):
            b.append((naam, (x, y, 0.5 + e_), (x * 1.3, y * 1.6, 0.26 + e_), 'bekken', voor))
    return b


def gewichten_tabberd(v, q):
    """Variant A: dezelfde botten, zachtere overgangen en minder dij: de zoom klapt niet als een plank met de knie mee. Variant B: elk pand aan zijn eigen hulpbot."""
    z = v[:, 2] - F.BOUW['benen']
    onder = V.stap(0.54, 0.44, z).astype(np.float64)
    voor = V.stap(0.05, -0.05, v[:, 1]).astype(np.float64)
    links = V.stap(-0.02, 0.02, v[:, 0]).astype(np.float64)
    basis = ['bekken', 'rug', 'borst', 'sleutel.L', 'sleutel.R']
    boven = F.gewichten(v, q, basis, 5.0, 0)
    if ROK['variant'] == 'B':
        namen = basis + list(P4.ROK_BOTTEN)
        w = np.zeros((len(v), len(namen)), dtype=np.float32)
        for i in range(5):
            w[:, i] = boven[:, i] * (1 - onder)
        for i, (a, b) in enumerate(((voor, links), (voor, 1 - links), (1 - voor, links), (1 - voor, 1 - links))):
            w[:, 5 + i] = onder * a * b
        return namen, F._gewicht_af(w, q, 4)
    namen = basis + ['rok.V', 'rok.A', 'dij.L', 'dij.R']
    dij = V.stap(0.50, 0.30, z).astype(np.float64) * 0.5
    w = np.zeros((len(v), len(namen)), dtype=np.float32)
    for i in range(5):
        w[:, i] = boven[:, i] * (1 - onder)
    w[:, 5] = onder * voor * (1 - dij)
    w[:, 6] = onder * (1 - voor) * (1 - dij)
    w[:, 7] = onder * dij * links
    w[:, 8] = onder * dij * (1 - links)
    return namen, F._gewicht_af(w, q, 4)


zet(romp=romp, arm=arm, been=been, _armsgat=_armsgat, veld_gambeson=veld_gambeson, kaak=kaak, veld_hoofd=veld_hoofd, veld_baard=veld_baard, verf_hoofd=verf_hoofd, HELM=HELM, veld_helm=veld_helm,
    veld_kap=veld_kap, _zoom=_zoom, veld_tabberd=veld_tabberd, veld_riem=veld_riem, veld_hozen=veld_hozen, _omslag_onder=_omslag_onder, laars=laars, verf_laarzen=verf_laarzen, vuist=vuist, veld_buidel=veld_buidel, verf_buidel=verf_buidel,
    veld_handschoenen=veld_handschoenen, veld_speer=veld_speer, delen=delen, gewichten_tabberd=gewichten_tabberd)
S.botten = botten
P4.zet_aan(True)


def hoofd():
    import bpy
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    for a in argv[1:]:
        k, v = a.split('=')
        if k == 'rok':
            ROK['variant'] = v
    F.zet_bouw([])
    F.BOUW['speer_onder'] = -(P4.GREEP[2] - 0.03)  # de hand zit lager op de schacht, dus de kolf blijft net boven de grond
    # de speer: 1,3 keer de echte hoogte van deze figuur, gerekend vanaf dezelfde onderkant
    hoogte = F.PIVOT[2] + KOP * (HELM()['z'] + HELM()['h'] + 0.014)
    F.BOUW['speer_boven'] = float(hoogte * SPEER_KEER + F.BOUW['speer_onder'])
    F.SPEER_BLAD_[0], F.SPEER_BLAD_[1] = F.BOUW['speer_boven'] - 0.34, F.BOUW['speer_boven']
    os.makedirs(os.path.dirname(uit), exist_ok=True)
    arm_, info = F.bouw()
    info['_kop_procent'] = round(float((info['_lengte'] - F.PIVOT[2]) / info['_lengte'] * 100), 1)
    arm_['lengte'] = float(info['_lengte'])  # de sprite wordt 80 pixels op de echte lengte (Marcel: "Het poppetje is kleiner in verhouding")
    arm_['rok'] = ROK['variant']
    arm_['bouw'] = json.dumps(F.BOUW)
    F.bak_houdingen(arm_)
    bpy.ops.wm.save_as_mainfile(filepath=uit, compress=True)
    with open(uit.rsplit('.', 1)[0] + '.json', 'w', encoding='utf-8') as f:
        json.dump({'bouw': F.BOUW, 'rok': ROK['variant'], 'delen': info}, f, indent=2, default=float)
    print('KLAAR', uit, info['_lengte'], info['_kop_procent'], flush=True)


if __name__ == '__main__':
    hoofd()
