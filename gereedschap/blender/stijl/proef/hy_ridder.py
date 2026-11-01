# De ridder (Marcel, 1 nov: "De knight"; `aardschok-ridder-paard-draai.png`, `-ridder-draai-basis.png`, `-schild-los-draai.png`, `-zwaard-los-draai.png`; en "Ja graag" voor het skelet en de looppas). Paard, ruiter, schild en zwaard op elkaar, met een eigen skelet: vier benen, nek, hoofd en staart, de ruiter met zijn lijf en zwaardarm. Alleen om te bekijken in de browser.
#
#   python hy_ridder.py <splat-map> <uit-map> [richtingen=.. elevatie=30 pixels=1024 ortho=4.0 doel=1.0 paard=1.9 ruiter=1.0 houdingen=staan,lopen,aanval,geraakt,sterven beelden=lopen:0,3;aanval:3 sterven_vak=1.25]
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_kleur as K  # noqa: E402
import hy_rig as H  # noqa: E402
import hy_splat as Y  # noqa: E402
from scipy.spatial.transform import Rotation  # noqa: E402

KOLOM = 0.02
# De maten, in meters in de wereld van de andere figuren (de man is 1,354 m). De platen hebben elk een eigen schaal: een ruiter op de maat van de speerman zit met zijn voeten ver onder de stijgbeugels, dus allebei wat aangepast
PAARD_HOOG = 1.9
RUITER_SCHAAL = 1.0
SCHILD_HOOG = 0.85
ZWAARD_LANG = 1.05


def laad(pad, draai, lengte=1.0):
    d = np.load(pad)
    P, R, S = Y.in_onze_assen(d, draai, lengte)
    a = d['alfa'].astype(np.float64)
    a = np.where(Y.zonder_waas(P, a), a, 0.0)
    return P, R * S[:, None, :], d['rgb'].astype(np.float64), a


def snede(pad_a, pad_b, lengte=1.0):
    """Twee runs, van voren en van achteren: elke run houdt de helft die hij zag, per hoogte en plek gesneden. Wat voor de figuren `samen` doet, zonder helm en zonder koker: die horen bij een man die rechtop staat."""
    Pa, Qa, ka, aa = laad(pad_a, Y.RUN_DRAAI['Z'], lengte)
    Pb, Qb, kb, ab = laad(pad_b, Y.RUN_DRAAI['N'], lengte)
    ga, gb = aa > 0.3, ab > 0.3
    s, Ro, t_, fout = Y.op_elkaar(Pb[gb], Pa[ga])
    Pb = s * Pb @ Ro.T + t_
    Qb = np.einsum('ij,njk->nik', Ro, Qb) * s
    # het midden in de diepte, per kolom: ook wat gebogen is, zoals een schild, snijdt zo door zijn eigen midden
    def midden(P, g):
        ix = np.floor(P[:, [0, 2]] / KOLOM).astype(int)
        sleutel = ix[:, 0] * 100003 + ix[:, 1]
        m = {}
        for k in np.unique(sleutel[g]):
            y = P[g & (sleutel == k), 1]
            m[k] = (y.min() + y.max()) / 2
        return sleutel, m
    ka_s, ma = midden(Pa, ga)
    kb_s, mb = midden(Pb, gb)
    vaste = np.median(Pa[ga, 1])
    ya = np.array([ma.get(k, vaste) for k in ka_s])
    yb = np.array([mb.get(k, vaste) for k in kb_s])
    ha, hb = Pa[:, 1] <= ya, Pb[:, 1] > yb
    print('snede', os.path.basename(pad_a), os.path.basename(pad_b), 'schaal', round(s, 4), 'fout', round(fout, 4), 'punten', int(ha.sum()), int(hb.sum()))
    return np.vstack([Pa[ha], Pb[hb]]), np.concatenate([Qa[ha], Qb[hb]]), np.vstack([ka[ha], kb[hb]]), np.concatenate([aa[ha], ab[hb]])


def voor(P, Q, D=None, s=1.0, t=(0.0, 0.0, 0.0)):
    """Een stuk op zijn plek: schaal, draaiing en verschuiving."""
    D = np.eye(3) if D is None else np.asarray(D)
    return s * P @ D.T + np.asarray(t), np.einsum('ij,njk->nik', D, Q) * s


def om_z(g):
    c, s_ = np.cos(np.radians(g)), np.sin(np.radians(g))
    return np.array([[c, -s_, 0], [s_, c, 0], [0, 0, 1.0]])


def om_x(g):
    c, s_ = np.cos(np.radians(g)), np.sin(np.radians(g))
    return np.array([[1, 0, 0], [0, c, -s_], [0, s_, c]])


def om_y(g):
    c, s_ = np.cos(np.radians(g)), np.sin(np.radians(g))
    return np.array([[c, 0, s_], [0, 1, 0], [-s_, 0, c]])


def samenstellen(map_, arg):
    """Paard, ruiter, schild en zwaard op hun plek. Geeft de punten, en per punt van welk stuk het is: 0 paard, 1 ruiter, 2 schild, 3 zwaard."""
    paard_h, ruiter_s = float(arg.get('paard', PAARD_HOOG)), float(arg.get('ruiter', RUITER_SCHAAL))
    # het paard: de linkerkant uit de run op W, de rechterkant uit die op O. Ze zijn zo gedraaid dat elk zijn eigen kant naar -y heeft, en de kop naar -x; daarna met de kop naar -y, zoals de mannen kijken
    Pp, Qp, kp, ap = snede(map_ + '/paard/W.npz', map_ + '/paard/O.npz')
    h_ = Pp[ap > 0.3, 2].max()
    Pp, Qp = voor(Pp, Qp, om_z(90.0), paard_h / h_)
    y_m = np.median(Pp[ap > 0.3, 1])
    Pp[:, 1] -= y_m
    Pp[:, 0] -= np.median(Pp[ap > 0.3, 0])
    # de spikkels bij de hoeven: wat los in de lucht hangt
    weg = Y.zwevers(Pp, ap > 0.05)
    ap = np.where(weg, 0.0, ap)
    print('zwevers paard', int(weg.sum()))
    # de zitting: het laagste punt van de rug tussen de voorboog en de achterboog van het zadel
    g_ = (ap > 0.3) & (np.abs(Pp[:, 0]) < 0.05)
    bak = np.floor(Pp[g_, 1] / 0.02).astype(int)
    top = {b: Pp[g_, 2][bak == b].max() for b in np.unique(bak)}
    rij = sorted(top)
    # de romp ligt tussen de nek (vooraan hoog) en de staart; de zadelbogen zijn de twee toppen op zo'n driekwart van de hoogte
    midden = [b for b in rij if abs(b * 0.02) < 0.4 * paard_h * 0.5]
    zit_b = min(midden, key=lambda b: top[b] + 0.0 * b)
    voor_b = [b for b in midden if b < zit_b]
    print('rug', [(round(b * 0.02, 2), round(float(top[b]), 2)) for b in midden][::2])
    zadel_y, zadel_z = (zit_b + 0.5) * 0.02, float(top[zit_b])
    # de ruiter: voor uit Z, achter uit N. Zijn lengte op de plaat is met de pluim
    Pr, Qr, kr, ar = snede(map_ + '/ridder/Z.npz', map_ + '/ridder/N.npz')
    g = ar > 0.3
    h_r = Pr[g, 2].max()
    # de hoogte op de plaat: pluim op 455 pixels, de man tot zijn helm 395, dus de maat van de man is die hoogte
    Pr, Qr = voor(Pr, Qr, None, 1.354 * 1.15 * 455 / 395 / h_r * ruiter_s)
    g = ar > 0.3
    # hij zit: de plek waar hij zit is de onderkant van wat in het midden hangt, tussen zijn benen
    mid = g & (np.abs(Pr[:, 0]) < 0.07) & (Pr[:, 2] < np.percentile(Pr[g, 2], 60)) & (Pr[:, 2] > np.percentile(Pr[g, 2], 25))
    zit_z = float(np.percentile(Pr[mid, 2], 2))
    zit_y = float(np.median(Pr[mid, 1]))
    print('ruiter hoog', round(float(Pr[g, 2].max()), 3), 'zit', round(zit_z, 3), round(zit_y, 3))
    Pr, Qr = voor(Pr, Qr, None, 1.0, (0.0, float(arg.get('zit_y', zadel_y)) - zit_y, float(arg.get('zit_z', zadel_z)) - zit_z))
    g = ar > 0.3
    # de vuisten: op de plaat voor zijn buik
    # (de knieën staan even ver naar voren, en die tellen niet)
    boven_knie = Pr[:, 2] > float(arg.get('zit_z', zadel_z)) + 0.15
    links = g & (Pr[:, 0] > 0.1) & boven_knie & (Pr[:, 1] < np.percentile(Pr[g & boven_knie, 1], 8))
    rechts = g & (Pr[:, 0] < -0.1) & boven_knie & (Pr[:, 1] < np.percentile(Pr[g & boven_knie, 1], 8))
    hand_l, hand_r = Pr[links].mean(0), Pr[rechts].mean(0)
    print('handen', np.round(hand_l, 3).tolist(), np.round(hand_r, 3).tolist())
    # het schild aan zijn linkerarm, de leeuw naar buiten en wat naar voren
    Ps, Qs, ks, a_s = snede(map_ + '/schild/Z.npz', map_ + '/schild/N.npz')
    g_ = a_s > 0.3
    Ps[:, 0] -= np.median(Ps[g_, 0])
    Ps[:, 1] -= np.median(Ps[g_, 1])
    Ps[:, 2] -= (Ps[g_, 2].min() + Ps[g_, 2].max()) / 2
    Ps, Qs = voor(Ps, Qs, om_z(65.0), SCHILD_HOOG / np.ptp(Ps[g_, 2]), hand_l + np.array([0.14, 0.0, 0.06]))
    # het zwaard in zijn rechterhand, de punt omhoog en naar voren
    Pz, Qz, kz, az = laad(map_ + '/zwaard/Z.npz', Y.RUN_DRAAI['Z'])
    gz = az > 0.3
    z_lang = np.ptp(Pz[gz, 2])
    # de greep: tussen de knop en de stootplaat, zo'n 10 procent vanaf de onderkant
    Pz[:, 0] -= np.median(Pz[gz, 0])
    Pz[:, 1] -= np.median(Pz[gz, 1])
    Pz[:, 2] -= Pz[gz, 2].min() + 0.1 * z_lang
    Pz, Qz = voor(Pz, Qz, om_x(35.0), ZWAARD_LANG / z_lang, hand_r)
    # alles samen, en op de grond
    P = np.vstack([Pp, Pr, Ps, Pz])
    Q = np.concatenate([Qp, Qr, Qs, Qz])
    k = np.vstack([kp, kr, ks, kz])
    a = np.concatenate([ap, ar, a_s, az])
    stuk = np.concatenate([np.full(len(x_), i, dtype=np.int8) for i, x_ in enumerate((Pp, Pr, Ps, Pz))])
    z_ = a > 0.05
    P, Q, k, a, stuk = P[z_], Q[z_], k[z_], a[z_], stuk[z_]
    z0 = P[a > 0.3, 2].min()
    P[:, 2] -= z0
    maten = {'zit': np.array([0.0, float(arg.get('zit_y', zadel_y)), float(arg.get('zit_z', zadel_z)) - z0]), 'hand.R': hand_r - np.array([0, 0, z0]), 'hand.L': hand_l - np.array([0, 0, z0]), 's_p': paard_h / PAARD_HOOG, 's_r': ruiter_s}
    return P, Q, k, a, stuk, maten


# Hoeveel punten per stuk: paard en ruiter vullen het beeld, schild en zwaard zijn op spelmaat klein. Elk punt kost tekentijd; minder punten worden wat groter
PUNTEN = {0: (200000, 1.12), 1: (130000, 1.25), 2: (60000, 1.35), 3: (15000, 1.7)}
# Het skelet, gemeten op het raster (`paard=1.9`). De benen: heup of schouder, knie of hak, kogel, en de hoef op de grond
ROMP = (-0.03, 0.1, 1.1)
NEK = (-0.03, -0.28, 1.3)
HOOFD = (-0.03, -0.68, 1.68)
STAART = (-0.03, 0.66, 1.38)
BENEN = {
    'LV': ((0.12, -0.22, 1.0), (0.12, -0.25, 0.52), (0.13, -0.27, 0.2), (0.15, -0.33, 0.03)),
    'RV': ((-0.17, -0.22, 1.0), (-0.19, -0.25, 0.52), (-0.21, -0.27, 0.2), (-0.23, -0.32, 0.03)),
    'LA': ((0.12, 0.5, 1.1), (0.11, 0.66, 0.5), (0.14, 0.6, 0.2), (0.17, 0.55, 0.03)),
    'RA': ((-0.17, 0.5, 1.1), (-0.2, 0.66, 0.5), (-0.24, 0.57, 0.2), (-0.25, 0.52, 0.03)),
}
# Waar een been inzit in de stap: achter, voor, achter, voor, elk een kwart van de cyclus later (een stap heeft vier tellen)
FASE = {'LA': 0.0, 'LV': 0.25, 'RA': 0.5, 'RV': 0.75}
STAND = 0.62
PAS_L = 0.5
PAS_H = {'V': 0.16, 'A': 0.12}
VOET_KROM = 70.0
# De ruiter, ten opzichte van waar hij zit (`ruiter=1`)
MIDDEL = (0.0, -0.14, 0.25)
SCHOUDER = (-0.3, -0.15, 0.58)
ELLEBOOG = (-0.385, -0.17, 0.32)
ARM_DIK = 0.13
# De slag: de zwaardhand in de rust van het lijf, ten opzichte van hoe hij op de plaat staat, en de richting van het zwaard
SLAG = {
    'tijd': (0.0, 0.14, 0.28, 0.43, 0.57, 0.71, 0.86, 1.0),
    'hand': ((0, 0, 0), (-0.06, 0.08, 0.2), (-0.1, 0.14, 0.42), (-0.1, 0.1, 0.5), (-0.14, -0.2, 0.2), (-0.16, -0.26, -0.02), (-0.08, -0.14, -0.04), (0, 0, 0)),
    'as': ((0, -0.57, 0.82), (-0.05, -0.1, 1.0), (-0.1, 0.45, 0.89), (-0.1, 0.55, 0.83), (-0.15, -0.75, 0.65), (-0.2, -0.92, -0.33), (-0.1, -0.85, 0.3), (0, -0.57, 0.82)),
    'draai': (0, 6, 12, 14, -6, -16, -8, 0),
    'voorover': (0, -3, -6, -6, 6, 12, 6, 0),
    'romp': (0, -1, -2.5, -3, 0.5, 2.5, 1, 0),
}
GERAAKT_LEUN = (12.0, 18.0, 6.0)
GERAAKT_NEK = (-6.0, -9.0, -3.0)
GERAAKT_ROMP = (-1.0, -2.0, -0.5)
# Sterven, 7 beelden: de klap, hij zakt door de voorbenen, en valt op zijn rechterzij; de ruiter valt ernaast op zijn gezicht, het zwaard los
STERVEN = {
    'voorover': (-4, 6, 10, 6, 2, 0, 0),
    'zak': (0.0, -0.1, -0.3, -0.42, -0.5, -0.55, -0.55),
    'rol': (0, 0, 5, 25, 55, 82, 88),
    'vouw_v': (0.0, 0.5, 1.0, 0.9, 0.5, 0.15, 0.1),
    'vouw_a': (0.0, 0.2, 0.6, 0.6, 0.35, 0.1, 0.05),
    'nek': (-10, 0, 10, 12, 10, 5, 0),
    'val': (0.0, 0.0, 0.0, 0.33, 0.66, 1.0, 1.0),
    'ruiter': (-10, 8, 22, 50, 75, 88, 90),
    'lijf': (-12, 4, 8, 6, 3, 0, 0),
    'zwaard': (0.0, 0.0, 0.25, 0.5, 0.75, 1.0, 1.0),
}
RUITER_GROND = (-1.0, -0.1)
ZWAARD_GROND = ((-0.42, 0.42, 0.04), (-0.2, -0.98, 0.0))
OPZIJ = 0.22
VOUW_Z, VOUW_Y = 0.45, 0.1
REIK = 0.995
ZOOM_ONDER = 0.6


def _zacht(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


def dunner(P, Q, k, a, stuk):
    """Minder punten per stuk, en die wat groter."""
    r = np.random.default_rng(9)
    hou, Q2 = [], Q.copy()
    for i, (n, f) in PUNTEN.items():
        s = np.nonzero(stuk == i)[0]
        hou.append(r.choice(s, min(n, len(s)), replace=False, p=a[s] / a[s].sum()))
        Q2[hou[-1]] *= f
    hou = np.concatenate(hou)
    return P[hou], Q2[hou], k[hou], a[hou], stuk[hou]


def lijn_op(punten, z):
    """Het midden van een been op hoogte z: een lijn door zijn gewrichten."""
    pp = np.array(punten)[::-1]
    return np.stack([np.interp(z, pp[:, 2], pp[:, 0]), np.interp(z, pp[:, 2], pp[:, 1])], axis=1)


class Ridder:
    def __init__(self, map_, arg):
        P, Q, k, a, stuk, m = samenstellen(map_, arg)
        self.P, self.Q, self.k, self.a, self.stuk = dunner(P, Q, k, a, stuk)
        self.m = m
        sp, sr = m['s_p'], m['s_r']
        self.J = {'romp': np.array(ROMP) * sp, 'nek': np.array(NEK) * sp, 'hoofd': np.array(HOOFD) * sp, 'staart': np.array(STAART) * sp}
        self.been = {}
        for b, (h_, kn, ko, ho) in BENEN.items():
            self.J['boven.' + b], self.J['onder.' + b], self.J['voet.' + b] = np.array(h_) * sp, np.array(kn) * sp, np.array(ko) * sp
            self.been[b] = np.array(ho) * sp
        zit = m['zit']
        self.J['ruiter'] = zit
        self.J['lijf'] = zit + np.array(MIDDEL) * sr
        self.J['arm'] = zit + np.array(SCHOUDER) * sr
        self.J['voorarm'] = zit + np.array(ELLEBOOG) * sr
        self.J['hand'] = m['hand.R']
        self.J['zwaard'] = m['hand.R']
        self.namen = list(self.J)
        self.ix = {b: i for i, b in enumerate(self.namen)}
        self.gewichten()

    def gewichten(self):
        P, stuk, J, ix = self.P, self.stuk, self.J, self.ix
        W = np.zeros((len(P), len(self.namen)), dtype=np.float32)
        kl = K.klasse(K.srgb_lin(self.k))
        sp, sr = self.m['s_p'], self.m['s_r']
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        p = stuk == 0
        # het hoofd en de nek: langs de nek, vanaf de schouder. De borst blijft bij de romp
        as_ = J['hoofd'] - J['nek']
        as_ = as_ / np.linalg.norm(as_)
        s = (P - J['nek']) @ as_
        nek = p & (y < -0.18 * sp) & (z > 1.12 * sp)
        w_n = _zacht((s + 0.04 * sp) / (0.16 * sp)) * nek
        kop = np.clip((-(y) - 0.66 * sp) / (0.08 * sp), 0, 1) * nek
        # de staart: achter het lijf en in het midden; zijn eind beweegt het meest
        d_s = np.linalg.norm(P - J['staart'], axis=1)
        staart = p & (y > 0.64 * sp) & (np.abs(x + 0.03 * sp) < 0.13 * sp) & (z > 0.36 * sp) & (z < 1.44 * sp) & (kl != 1) & (kl != 2)
        w_s = np.clip(d_s / (0.4 * sp), 0, 1) * staart
        # de benen: onder de zoom van het kleed, het dichtst bij zijn eigen lijn. Wat blauw of geel is, hoort bij het kleed
        W_been = {}
        for b, (h_, kn, ko, ho) in BENEN.items():
            lijn = lijn_op(np.array((h_, kn, ko, ho)) * sp, z)
            W_been[b] = np.hypot(x - lijn[:, 0], y - lijn[:, 1])
        namen_b = list(W_been)
        d_b = np.stack([W_been[b] for b in namen_b], axis=1)
        wie = d_b.argmin(1)
        d_min = d_b.min(1)
        # (onder de zoom is alles been: de witte sokken tellen anders als het geel van het kleed, en blijven dan staan)
        vrij = p & (((kl != 1) & (kl != 2)) | (z < ZOOM_ONDER * sp)) & ~staart
        zoom = np.where(y > 0.4 * sp, 1.12 * sp, 0.72 * sp)
        for i, b in enumerate(namen_b):
            s_ = vrij & (wie == i) & (d_min < 0.17 * sp) & (z < zoom)
            h_, kn, ko, ho = np.array(BENEN[b]) * sp
            w_v = _zacht((ko[2] + 0.05 * sp - z) / (0.08 * sp))
            w_o = _zacht((kn[2] + 0.05 * sp - z) / (0.1 * sp)) * (1 - w_v)
            hoog = np.clip((1.12 * sp - z) / (0.3 * sp), 0, 1) if b[1] == 'A' else 1.0
            w_b = (1 - w_v - w_o) * hoog
            W[s_, ix['voet.' + b]] = w_v[s_]
            W[s_, ix['onder.' + b]] = w_o[s_]
            W[s_, ix['boven.' + b]] = (w_b * np.ones(len(P)))[s_]
        been = W[:, [ix[d + '.' + b] for b in namen_b for d in ('boven', 'onder', 'voet')]].sum(1)
        W[:, ix['nek']] = np.where(been == 0, w_n * (1 - kop), 0.0)
        W[:, ix['hoofd']] = np.where(been == 0, w_n * kop, 0.0)
        W[:, ix['staart']] = np.where(been == 0, w_s, 0.0)
        W[:, ix['romp']] = np.where(p, 1 - W[:, [ix[b] for b in self.namen]].sum(1), 0.0)
        # de ruiter: benen en bekken samen, het lijf boven het middel, en zijn zwaardarm
        r_ = stuk == 1
        w_l = _zacht((z - J['lijf'][2] + 0.05 * sr) / (0.1 * sr))
        d_a1 = H.seg_afstand(P, J['arm'], J['voorarm'])
        d_a2 = H.seg_afstand(P, J['voorarm'], J['hand'])
        dicht = r_ & (x < -0.15 * sr) & (np.minimum(d_a1, d_a2) < ARM_DIK * sr) & (z > J['lijf'][2] - 0.08 * sr)
        w_v = np.clip((d_a1 - d_a2) / (0.08 * sr) + 0.5, 0, 1)
        w_sch = np.clip(np.linalg.norm(P - J['arm'], axis=1) / (0.1 * sr), 0, 1)
        W[r_, ix['ruiter']] = (1 - w_l)[r_]
        W[r_, ix['lijf']] = w_l[r_]
        W[dicht, ix['lijf']] = (w_l * (1 - w_sch))[dicht]
        W[dicht, ix['ruiter']] = ((1 - w_l) * (1 - w_sch))[dicht]
        W[dicht, ix['arm']] = ((1 - w_v) * w_sch)[dicht]
        W[dicht, ix['voorarm']] = (w_v * w_sch)[dicht]
        W[stuk == 2, ix['lijf']] = 1.0
        W[stuk == 3, ix['zwaard']] = 1.0
        self.W = W
        print('gewichten: nek', int((w_n > 0).sum()), 'staart', int(staart.sum()), 'benen', int((been > 0).sum()), 'arm', int(dicht.sum()))

    def pose(self, houding, i):
        """Per bot de draaiing en de plek, voor beeld i (in delen van de houding of als nummer)."""
        J = self.J
        sp, sr = self.m['s_p'], self.m['s_r']
        rust = {b: (np.eye(3), J[b].copy()) for b in self.namen}
        n = {'staan': 4, 'lopen': 12, 'aanval': 8, 'geraakt': 3, 'sterven': 7}[houding]
        t = i / n
        dz, voorover, rol, opzij = 0.0, 0.0, 0.0, 0.0
        nek_h, kop_h, staart_x, staart_z = 0.0, 0.0, 0.0, 0.0
        leun, lijf_draai, lijf_voor = 0.0, 0.0, 0.0
        hand_d = np.zeros(3)
        z_as = np.array([0.0, -0.57, 0.82])
        benen = None
        vouw = None
        if houding == 'staan':
            f = np.sin(2 * np.pi * t)
            nek_h, staart_z, lijf_voor = 2.5 * f, 7.0 * np.sin(2 * np.pi * t + 1.0), 0.6 * f
        elif houding == 'lopen':
            benen = {}
            for b, fa in FASE.items():
                benen[b] = (t + fa) % 1.0
            dz = -0.02 * sp * (0.5 + 0.5 * np.cos(4 * np.pi * (t - 0.1)))
            voorover = 1.2 * np.sin(4 * np.pi * t)
            nek_h = 4.0 * np.sin(4 * np.pi * (t + 0.05))
            staart_z, staart_x = 9.0 * np.sin(2 * np.pi * t), 3.0 * np.sin(4 * np.pi * t)
            lijf_voor, leun = 1.5 * np.sin(4 * np.pi * (t - 0.1)), 1.0 * np.sin(4 * np.pi * (t - 0.1))
        elif houding == 'aanval':
            tt = SLAG['tijd']
            hand_d = np.array([np.interp(t, tt, [q[c] for q in SLAG['hand']]) for c in range(3)]) * sr
            # de richting van het zwaard: langs de rij, per stuk
            j = min(int(np.searchsorted(tt, t, side='right')) - 1, len(tt) - 2)
            u = (t - tt[j]) / (tt[j + 1] - tt[j])
            a0, a1 = np.array(SLAG['as'][j], dtype=np.float64), np.array(SLAG['as'][j + 1], dtype=np.float64)
            z_as = (1 - u) * a0 + u * a1
            lijf_draai, lijf_voor = np.interp(t, tt, SLAG['draai']), np.interp(t, tt, SLAG['voorover'])
            voorover = np.interp(t, tt, SLAG['romp'])
            nek_h = -1.5 * voorover
            benen = {b: None for b in FASE}
        elif houding == 'geraakt':
            leun, nek_h, voorover = GERAAKT_LEUN[i], GERAAKT_NEK[i], GERAAKT_ROMP[i]
            leun = -leun
            benen = {b: None for b in FASE}
        elif houding == 'sterven':
            T_ = {q: v[i] for q, v in STERVEN.items()}
            voorover, dz, rol, nek_h = T_['voorover'], T_['zak'] * sp, T_['rol'], T_['nek']
            leun = T_['lijf']
            vouw = (T_['vouw_v'], T_['vouw_a'])
            opzij = OPZIJ * sp * T_['rol'] / 90.0
        # de romp
        R_r = om_y(-rol) @ om_x(voorover)
        spil = np.array([-0.35 * sp, J['romp'][1], 0.0])
        p_r = spil + om_y(-rol) @ (J['romp'] + np.array([0, 0, dz]) - spil) + np.array([opzij, 0, 0])
        rust['romp'] = (R_r, p_r)
        T = lambda q: p_r + R_r @ (np.asarray(q) - J['romp'])
        # nek, hoofd en staart
        R_n = R_r @ om_x(nek_h)
        rust['nek'] = (R_n, T(J['nek']))
        rust['hoofd'] = (R_n @ om_x(0.5 * nek_h + kop_h), T(J['nek']) + R_n @ (J['hoofd'] - J['nek']))
        rust['staart'] = (R_r @ om_z(staart_z) @ om_x(staart_x), T(J['staart']))
        # de benen
        for b in FASE:
            h_, kn, ko = J['boven.' + b], J['onder.' + b], J['voet.' + b]
            ho = self.been[b]
            voor_b = b[1] == 'V'
            heup = T(h_)
            krom = 0.0
            hoef = ho.copy()
            if benen is not None and benen.get(b) is not None:
                f = benen[b]
                if f < STAND:
                    s = f / STAND
                    hoef = ho + np.array([0, (s - 0.5) * PAS_L * sp, 0])
                    # de hiel komt op voor hij loslaat
                    krom = VOET_KROM * 0.35 * _zacht((s - 0.8) / 0.2)
                else:
                    s = (f - STAND) / (1 - STAND)
                    hoef = ho + np.array([0, (0.5 - s) * PAS_L * sp, PAS_H['V' if voor_b else 'A'] * sp * np.sin(np.pi * s)])
                    krom = VOET_KROM * (0.35 + 0.65 * np.sin(np.pi * min(s * 1.4, 1.0))) * (1 - _zacht((s - 0.7) / 0.3))
            R_v = om_x(krom)
            kogel = hoef + R_v @ (ko - ho)
            if vouw is not None:
                v_ = vouw[0] if voor_b else vouw[1]
                R_v = R_r @ om_x(60.0 * v_)
                kogel = T(ko + np.array([0, (-VOUW_Y if voor_b else VOUW_Y) * v_ * sp, VOUW_Z * v_ * sp]))
            elif benen is None:
                # staan: de benen zoals op de plaat
                rust['boven.' + b], rust['onder.' + b], rust['voet.' + b] = (np.eye(3), heup), (np.eye(3), T(kn)), (np.eye(3), T(ko))
                continue
            l1, l2 = np.linalg.norm(kn - h_), np.linalg.norm(ko - kn)
            v = kogel - heup
            if np.linalg.norm(v) > REIK * (l1 + l2):
                kogel = heup + v / np.linalg.norm(v) * REIK * (l1 + l2)
            pool = R_r @ (np.array([0.0, -1.0, 0.0]) if voor_b else np.array([0.0, 1.0, 0.0]))
            knie = H.twee_botten(heup, kogel, l1, l2, pool)
            rust['boven.' + b] = (H.draai_van_naar(kn - h_, knie - heup), heup)
            rust['onder.' + b] = (H.draai_van_naar(ko - kn, kogel - knie), knie)
            rust['voet.' + b] = (R_v, kogel)
        # de ruiter: hij zit op de romp, en valt er bij het sterven af
        R_ru, p_ru = R_r @ om_x(leun * 0.25), T(J['ruiter'])
        if houding == 'sterven':
            v_ = T_['val']
            R_ru = R_r @ om_x(T_['ruiter'])
            if v_ > 0:
                eind = om_z(14.0) @ om_x(T_['ruiter'])
                R_ru = Rotation.from_rotvec(Rotation.from_matrix(eind @ R_ru.T).as_rotvec() * v_).as_matrix() @ R_ru
                doel = np.array([RUITER_GROND[0] * sp + opzij, RUITER_GROND[1] * sp, 0.5 * sr])
                p_ru = (1 - v_) * p_ru + v_ * doel
        rust['ruiter'] = (R_ru, p_ru)
        R_l = R_ru @ om_z(lijf_draai) @ om_x(lijf_voor + leun)
        p_l = p_ru + R_ru @ (J['lijf'] - J['ruiter'])
        rust['lijf'] = (R_l, p_l)
        TL = lambda q: p_l + R_l @ (np.asarray(q) - J['lijf'])
        # de zwaardarm: de hand gaat waar de slag zegt, en de elleboog erachteraan
        sch = TL(J['arm'])
        hand = TL(J['hand'] + hand_d)
        l1, l2 = np.linalg.norm(J['voorarm'] - J['arm']), np.linalg.norm(J['hand'] - J['voorarm'])
        v = hand - sch
        if np.linalg.norm(v) > REIK * (l1 + l2):
            hand = sch + v / np.linalg.norm(v) * REIK * (l1 + l2)
        ell = H.twee_botten(sch, hand, l1, l2, R_l @ np.array([-0.7, 0.5, -0.5]))
        rust['arm'] = (H.draai_van_naar(J['voorarm'] - J['arm'], ell - sch), sch)
        rust['voorarm'] = (H.draai_van_naar(J['hand'] - J['voorarm'], hand - ell), ell)
        # het zwaard: rigide in de hand, of (sterven) los naar de grond
        R_z = H.draai_van_naar(np.array([0.0, -0.57, 0.82]), R_l @ z_as)
        p_z = hand
        if houding == 'sterven' and T_['zwaard'] > 0:
            v_ = T_['zwaard'] ** 2
            R_g = H.draai_van_naar(np.array([0.0, -0.57, 0.82]), np.array(ZWAARD_GROND[1]))
            R_z = Rotation.from_rotvec(Rotation.from_matrix(R_g @ R_z.T).as_rotvec() * v_).as_matrix() @ R_z
            p_z = (1 - v_) * hand + v_ * np.array(ZWAARD_GROND[0]) * sp
        rust['zwaard'] = (R_z, p_z)
        return rust

    def beeld(self, houding, i):
        po = self.pose(houding, i)
        D = np.stack([po[b][0] for b in self.namen])
        Pm = np.stack([po[b][1] for b in self.namen])
        U = H.vervorm(self.P, self.W, D, Pm, self.J, self.namen)
        B = np.zeros((len(U), 3, 3))
        for j in range(len(self.namen)):
            s = self.W[:, j] > 1e-5
            if s.any():
                B[s] += self.W[s, j, None, None] * D[j]
        Q = np.einsum('nij,njk->nik', B, self.Q)
        if houding == 'sterven':
            # alles op de grond: het paard op zijn zij, en de ruiter ernaast
            g = self.a > 0.3
            pa, ru = self.stuk == 0, (self.stuk == 1) | (self.stuk == 2)
            U[pa, 2] -= U[pa & g, 2].min()
            U[ru, 2] -= min(0.0, U[ru & g, 2].min()) if i < 5 else U[ru & g, 2].min()
            U[self.stuk == 3, 2] -= min(0.0, U[(self.stuk == 3) & g, 2].min())
        return U, Q


def main():
    map_, uit = sys.argv[1], sys.argv[2]
    arg = dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a)
    os.makedirs(uit, exist_ok=True)
    Rr = Ridder(map_, arg)
    richtingen = arg.get('richtingen', 'Z,ZW,W,NW,N,NO,O,ZO').split(',')
    e, pixels, ortho, doel = float(arg.get('elevatie', 30)), int(arg.get('pixels', 1024)), float(arg.get('ortho', 4.0)), float(arg.get('doel', 1.0))
    aantal = {'staan': 4, 'lopen': 12, 'aanval': 8, 'geraakt': 3, 'sterven': 7}
    # alleen deze beelden, om te proeven: beelden=lopen:0,3;aanval:3
    keuze = {q.split(':')[0]: [int(x) for x in q.split(':')[1].split(',')] for q in arg['beelden'].split(';')} if 'beelden' in arg else {}
    import time
    t0, tel = time.time(), 0
    for h_ in arg.get('houdingen', 'staan,lopen,aanval,geraakt,sterven').split(','):
        vak = float(arg.get('sterven_vak', 1.25)) if h_ == 'sterven' else 1.0
        pix_h, ort_h = round(pixels * vak), ortho * vak
        pas = PAS_L / STAND * Rr.m['s_p']
        json.dump({'pas_meter': round(pas, 4), 'lengte': 1.354, 'doel_z': doel, 'houding': h_, 'richtingen': richtingen, 'pixels': pix_h, 'monsters': 1, 'elevatie': e, 'ortho': ort_h}, open(os.path.join(uit, f'{h_}-render.json'), 'w'))
        for i in keuze.get(h_, range(aantal[h_])):
            U, Q = Rr.beeld(h_, i)
            for r in richtingen:
                Y.render(U, Q, Rr.k, Rr.a, r, e, pix_h, ort_h, doel).save(os.path.join(uit, f'{h_}-{r}-{i:02d}.png'))
                tel += 1
    print('renders', tel, round(time.time() - t0, 1), 's;', len(Rr.P), 'punten')


if __name__ == '__main__':
    main()
