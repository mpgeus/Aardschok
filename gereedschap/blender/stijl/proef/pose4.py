# De bewegingen van vormproef V4 (vraag 192), als werkvariant: beweging.py blijft zoals het is, dit vervangt in het eigen proces alleen `staan` en voegt testhoudingen toe.
# `lopen` blijft van de productie, op de hulpbotten van de rok na (variant B). `proef_steek`, `proef_val` en `proef_kop` zijn TESTEN van de geometrie: op dit skelet bestaat nog geen
# aanval of sterfanimatie, die zijn er alleen als oude vellen van het eerdere model (beelden/figuren/speerman3d-aanval.png). Dit zijn dus geen spelanimaties.
import math

import numpy as np

import beweging as B
import skelet as S

TAU = 2.0 * math.pi
ENKEL = S.ENKEL_Z
PRODUCTIE = {'staan': B.staan, 'lopen': B.lopen}
ROK_BOTTEN = ('rokp.VL', 'rokp.VR', 'rokp.AL', 'rokp.AR')
# de stand, in meter; de keuzes staan onderbouwd in docs/art/v4/V4-ANALYSE.md
VOET_STAND = (0.125, 0.02)     # het standbeen, links: het gewicht rust hierop
VOET_VRIJ = (-0.17, -0.06)   # het vrije been, rechts: iets naar voren en opzij
BEKKEN = (0.026, 0.004, -0.018)
GREEP = (-0.345, -0.31, 0.67)
HAND_L = (0.245, -0.24, 0.485)


def _dij_hoek(h, n):
    d = h.as_('dij' + n, 1)
    return math.degrees(math.atan2(-d[1], -d[2])), math.degrees(math.atan2(d[0], -d[2]))


def zet_rok_botten(h, h_vorig=None):
    """Variant B: per pand een eigen bot. Een pand volgt de dij van zijn kant, met iets vertraging (het beeld ervoor), zodat de stof achter het been aan komt en de knie niet door de stof gaat."""
    if 'rokp.VL' not in h.r.kop:
        return
    D = h.delta['bekken']
    v_l, z_l = _dij_hoek(h, '.L')
    v_r, z_r = _dij_hoek(h, '.R')
    if h_vorig is not None:
        pl, _ = _dij_hoek(h_vorig, '.L')
        pr, _ = _dij_hoek(h_vorig, '.R')
        v_l, v_r = 0.65 * v_l + 0.35 * pl, 0.65 * v_r + 0.35 * pr
    for naam, voor, s, hoek, zij, ander in (('rokp.VL', True, 1, v_l, z_l, v_r), ('rokp.VR', True, -1, v_r, z_r, v_l), ('rokp.AL', False, 1, v_l, z_l, v_r), ('rokp.AR', False, -1, v_r, z_r, v_l)):
        a = max(hoek, 0.0) * 0.8 + max(ander, 0.0) * 0.1 if voor else min(hoek, 0.0) * 0.8 + min(ander, 0.0) * 0.1
        # opzij alleen wat er meer is dan de rust van de dij (die staat al iets naar buiten)
        spreid = (zij - s * 1.7) * 0.55
        h.zet(naam, D @ S.ry(math.radians(spreid)) @ S.rx(math.radians(-a)))


def hand_recht(h, s, C, duim, pool, schouder=None, buig=0.0, vrij=False):
    """Een hand op C die de onderarm volgt, zodat de pols recht blijft. Elleboog en pols hangen van elkaar af, dus een paar keer heen en weer. buig: hoeveel de hand omlaag buigt, in graden.
    vrij: de duim draait mee, loodrecht op de onderarm; zonder vrij blijft hij langs de speer."""
    n = '.L' if s > 0 else '.R'
    vinger = np.array([0.0, -1.0, 0.0])
    d = np.asarray(duim, dtype=np.float64)
    for _ in range(5):
        B.stand_hand(h, s, C, d, vinger, pool, schouder)
        vinger = h.as_('onderarm' + n, 1)
        if vrij:
            d = S._n(np.asarray(duim) - vinger * (np.asarray(duim) @ vinger))
    if buig:
        vinger = S._n(vinger + np.array([0.0, 0.0, -math.tan(math.radians(buig))]))
        if vrij:
            d = S._n(np.asarray(duim) - vinger * (np.asarray(duim) @ vinger))
    B.stand_hand(h, s, C, d, vinger, pool, schouder)


def pols_hoek(h, n):
    """De hoek tussen onderarm en hand, in graden."""
    return math.degrees(math.acos(float(np.clip(h.as_('onderarm' + n, 1) @ h.as_('hand' + n, 1), -1.0, 1.0))))


def staan(rust, t, speer_draai=0.0):
    """De nieuwe rust: het gewicht op het linkerbeen, de rechtervoet los naar voren en opzij, de vrije heup iets lager en naar voren, de borst weer recht. Geen gespiegeld silhouet."""
    h = S.Houding(rust)
    a = math.sin(TAU * t)
    b = math.sin(TAU * t + 0.8)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0, -2.6, 6.0), rust.kop['bekken'] + np.array([BEKKEN[0], BEKKEN[1], BEKKEN[2] - 0.0028 * (a + 1)]))
    h.rel('rug', S.euler(1.5 + 0.35 * a, 1.4, -3.5))
    h.rel('borst', S.euler(0.5 - 0.7 * a, 1.0, -3.0))
    h.rel('nek', S.euler(-2.0, 0.0, 0.5))
    h.rel('hoofd', S.euler(-3.0 + 0.5 * b, 0.0, 0.8 * b))
    B.stand_benen(h, {
        -1: (np.array([VOET_VRIJ[0], VOET_VRIJ[1], rust.kop['voet.R'][2]]), 0.0, -14.0, 0.0, np.array([-0.45, -1.0, 0.0])),
        1: (np.array([VOET_STAND[0], VOET_STAND[1], rust.kop['voet.L'][2]]), 0.0, 10.0, 0.0, np.array([0.2, -1.0, 0.0])),
    })
    B.stand_rok(h)
    zet_rok_botten(h)
    greep = np.array([GREEP[0], GREEP[1], GREEP[2] + S.E])
    # de speer staat buiten de vrije voet
    richting = S._n([0.02, -0.02, 1.0])
    B.speer_stand(h, greep, richting, speer_draai)
    # de schouders ontspannen: het sleutelbeen zakt, de ellebogen blijven dichter bij de romp
    D = h.delta['borst']
    hand_recht(h, -1, greep, richting, (-0.2, 0.75, -1.0), D @ S.ry(math.radians(-11.0)))
    C = np.array([HAND_L[0], HAND_L[1] - 0.002 * a, HAND_L[2] + S.E + 0.002 * a])
    hand_recht(h, 1, C, S._n([-0.3, 0.05, 1.0]), (0.42, 0.82, -0.6), D @ S.ry(math.radians(11.0)), buig=8.0, vrij=True)
    return h


def lopen(rust, t, speer_draai=0.0):
    """Het lopen van de productie, ongewijzigd; alleen de hulpbotten komen erbij."""
    h = PRODUCTIE['lopen'](rust, t, speer_draai)
    if 'rokp.VL' in rust.kop:
        zet_rok_botten(h, PRODUCTIE['lopen'](rust, (t - 0.05) % 1.0, speer_draai))
    return h


# --- de testen: alleen om de vorm onder belasting te zien, nooit voor het spel --------------------------------------------------------

def proef_steek(rust, t, speer_draai=0.0):
    """Een steek naar voren, heen en terug. Geen bestaande animatie: een belastingstest voor schouder, elleboog, tabberd en handcontact."""
    u = math.sin(math.pi * t) ** 1.2
    h = S.Houding(rust)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0 + 6.0 * u, -2.0, 6.0 + 12.0 * u), rust.kop['bekken'] + np.array([0.02, 0.004 - 0.05 * u, -0.022 - 0.012 * u]))
    h.rel('rug', S.euler(1.5 + 3.0 * u, 1.0, 3.0 * u))
    h.rel('borst', S.euler(0.5 + 3.0 * u, 1.0, 8.0 * u))
    h.rel('nek', S.euler(-2.0 - 3.0 * u, 0.0, -6.0 * u))
    h.rel('hoofd', S.euler(-3.0 - 4.0 * u, 0.0, -8.0 * u))
    B.stand_benen(h, {
        -1: (np.array([VOET_VRIJ[0], VOET_VRIJ[1] - 0.05 * u, rust.kop['voet.R'][2]]), 0.0, -20.0, 0.0, np.array([-0.45, -1.0, 0.0])),
        1: (np.array([VOET_STAND[0], VOET_STAND[1] + 0.03 * u, rust.kop['voet.L'][2]]), 0.0, 10.0, 0.0, np.array([0.2, -1.0, 0.0])),
    })
    B.stand_rok(h)
    zet_rok_botten(h)
    greep = np.array([GREEP[0] + 0.1 * u, GREEP[1] - 0.2 * u, GREEP[2] + 0.11 * u + S.E])
    richting = S._n([-0.05 + 0.06 * u, -0.03 - 1.0 * u, 1.0 - 0.72 * u])
    B.speer_stand(h, greep, richting, speer_draai)
    hand_recht(h, -1, greep, richting, (-0.45, 0.8, -0.7))
    C = np.array([HAND_L[0], HAND_L[1] + 0.08 * u, HAND_L[2] + S.E])
    hand_recht(h, 1, C, S._n([-0.3, 0.05, 1.0]), (0.42, 0.82, -0.6), buig=8.0, vrij=True)
    return h


def proef_val(rust, t, speer_draai=0.0):
    """Achterover vallen als één stuk met slappe armen. Geen bestaande animatie: een belastingstest voor de grote vervormingen. De speer blijft hier in de hand."""
    u = t * t * (3.0 - 2.0 * t)
    h = staan(rust, 0.0, speer_draai)
    H = S.Houding(rust)
    R = S.rx(math.radians(-78.0 * u))
    wortel = np.array([0.0, 0.18 * u, 0.12 * u])
    H.zet('wortel', R, wortel)
    k0 = h.kop['wortel']
    for naam in h.delta:
        if naam == 'wortel':
            continue
        H.delta[naam] = R @ h.delta[naam]
        H.kop[naam] = wortel + R @ (h.kop[naam] - k0)
    return H


def proef_kop(rust, t, speer_draai=0.0):
    """Het hoofd helemaal om: helm tegen kraag en schouders. t loopt door draaien links, rechts, voorover en achterover."""
    h = staan(rust, 0.0, speer_draai)
    hoeken = [(0, 0, 15), (0, 0, -15), (0, 12, 0), (0, -12, 0), (12, 0, 0), (-12, 0, 0)]
    v, o, d = hoeken[int(t * len(hoeken)) % len(hoeken)]
    keep = {k: v_ for k, v_ in h.delta.items()}
    h.zet('hoofd', keep['nek'] @ S.euler(-3.0 + v, o, d))
    return h


TESTEN = {'proef_steek': proef_steek, 'proef_val': proef_val, 'proef_kop': proef_kop}


def zet_aan(idle_v4=True):
    """Zet de werkvariant aan in dit proces; beweging.py op schijf verandert niet."""
    B.HOUDING['staan'] = staan if idle_v4 else PRODUCTIE['staan']
    B.HOUDING['lopen'] = lopen
    B.HOUDING.update(TESTEN)
