# De bewegingen van de stijl (vraag 192): per houding een functie van de tijd t in de cyclus (0 tot 1) naar een stand. De voeten
# en de handen zijn doelen in de wereld; de botten volgen met de IK van skelet.py. Daardoor glijdt een voet niet en laat een hand
# de speer niet los: dat zit in de opzet, en controle.py meet het na.
import math

import numpy as np

import skelet as S

TAU = 2.0 * math.pi
GAT = S.GREEP * S.HAND_SCHAAL
ENKEL = S.ENKEL_Z


def _rond(t):
    return t - math.floor(t)


def voet_doel(x, y, kantel, draai, spil):
    """Waar de enkel staat als de voet op y staat en kantelt (positief: tenen omlaag) om de hiel of de bal."""
    d = {'hiel': np.array([0.0, 0.07, -ENKEL]), 'bal': np.array([0.0, -0.135, -ENKEL]), None: np.zeros(3)}[spil]
    R = S.rx(math.radians(kantel))
    return np.array([x, y, ENKEL]) + d - R @ d


def stand_benen(h, voeten):
    """De benen naar hun doelen. voeten: per kant (enkel, kantel van de voet, draai naar buiten, kantel van de teen, pool)."""
    r = h.r
    for s, n in ((-1, '.R'), (1, '.L')):
        doel, kantel, draai, teen, pool = voeten[s]
        h.zet('dij' + n)
        H = h.kop['dij' + n]
        K, A = S.ik(H, doel, r.len['dij' + n], r.len['scheen' + n], pool)
        h.wijs('dij' + n, K - H)
        h.wijs('scheen' + n, A - K)
        h.zet('voet' + n, S.rz(math.radians(draai)) @ S.rx(math.radians(kantel)), A)
        h.rel('teen' + n, S.rx(math.radians(teen)))


def stand_hand(h, s, C, duim, vinger, pool, schouder=None):
    """Een hand met de greep (het gat in de vuist) op C, de duim in richting duim, de vingers ruwweg in richting vinger."""
    n = '.L' if s > 0 else '.R'
    r = h.r
    Y = S._n(np.asarray(vinger, dtype=np.float64) - np.asarray(duim) * (np.asarray(vinger) @ np.asarray(duim)))
    X = s * S._n(duim)
    Z = np.cross(X, Y)
    Rh = np.stack([X, Y, Z], axis=1)
    W = np.asarray(C, dtype=np.float64) - Rh @ GAT
    h.zet('sleutel' + n, schouder if schouder is not None else h.delta['borst'])
    h.zet('bovenarm' + n)
    Sh = h.kop['bovenarm' + n]
    E, W2 = S.ik(Sh, W, r.len['bovenarm' + n], r.len['onderarm' + n], pool)
    h.wijs('bovenarm' + n, E - Sh)
    h.wijs('onderarm' + n, W2 - E)
    h.zet('hand' + n, Rh @ r.R['hand' + n].T, W2)


def stand_rok(h):
    """De panden van de tabberd volgen de dij die het verst staat: zo komt een knie niet door de stof."""
    hoeken = []
    for n in ('.R', '.L'):
        d = h.as_('dij' + n, 1)
        hoeken.append(math.degrees(math.atan2(-d[1], -d[2])))
    voor = max(0.0, *hoeken)
    achter = min(0.0, *hoeken)
    D = h.delta['bekken']
    if 'buidel' in h.r.kop:
        h.zet('buidel', D @ S.rx(math.radians(-(voor + achter) * 0.25)))
    # in rust staan de botten al wat schuin; de hoek is t.o.v. het bekken
    h.zet('rok.V', D @ S.rx(math.radians(-voor * 0.4)))
    h.zet('rok.A', D @ S.rx(math.radians(-achter * 0.4)))


def speer_stand(h, greep, richting, draai=0.0):
    r = h.r
    h.zet('speer', None, greep)
    y0 = r.R['speer'][:3, 1]
    D = S.zwaai(y0, richting)
    if draai:
        a = math.radians(draai)
        u = S._n(richting)
        K = np.array([[0, -u[2], u[1]], [u[2], 0, -u[0]], [-u[1], u[0], 0]])
        D = (np.eye(3) + math.sin(a) * K + (1 - math.cos(a)) * K @ K) @ D
    h.delta['speer'] = D


# --- de houdingen --------------------------------------------------------------------------------------------------------

def staan(rust, t, speer_draai=0.0):
    """Rustig staan: ademen, een beetje wegzakken en het hoofd dat iets rondkijkt. De voeten staan stil."""
    h = S.Houding(rust)
    a = math.sin(TAU * t)
    b = math.sin(TAU * t + 0.8)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0, 0.8, 1.5), rust.kop['bekken'] + np.array([-0.006, 0.0, -0.016 - 0.0028 * (a + 1)]))
    h.rel('rug', S.euler(1.5 + 0.35 * a))
    h.rel('borst', S.euler(0.5 - 0.7 * a, -0.8, -1.5))
    h.rel('nek', S.euler(-2.0))
    h.rel('hoofd', S.euler(-3.0 + 0.5 * b, 0.0, 0.8 * b))
    stand_benen(h, {
        -1: (np.array([-0.145, 0.0, ENKEL]), 0.0, -12.0, 0.0, np.array([-0.3, -1.0, 0.0])),
        1: (np.array([0.145, 0.015, ENKEL]), 0.0, 12.0, 0.0, np.array([0.3, -1.0, 0.0])),
    })
    stand_rok(h)
    # de speer rechtop aan de rechterkant, de kolf net boven de grond
    greep = np.array([-0.37, -0.24, 0.72 + S.E])
    richting = S._n([-0.07, -0.03, 1.0])
    speer_stand(h, greep, richting, speer_draai)
    stand_hand(h, -1, greep, richting, (-0.28, -1.0, -0.05), (-0.35, 0.6, -1.0))
    # de linkerhand hangt ontspannen, met de duim naar voren
    C = np.array([0.335, -0.045 - 0.002 * a, 0.40 + S.E + 0.002 * a])
    stand_hand(h, 1, C, S._n([0.05, -1.0, 0.1]), (-0.05, -0.25, -1.0), (0.5, 1.0, -0.1))
    return h


DUUR = 0.58  # welk deel van de cyclus een voet op de grond staat


def _voet_lopen(fase, pas, x, draai, duur=DUUR):
    """Eén voet door de cyclus. Fase 0 is hiel neer, voor het lichaam; de standvoet schuift gelijkmatig terug (tegen de loop
    in, zodat hij in de wereld stilstaat), de zwaaivoet maakt een boog."""
    if fase < duur:
        u = fase / duur
        y = -pas + 2.0 * pas * u
        if u < 0.14:
            k = -20.0 * (1.0 - u / 0.14) ** 1.6
            return voet_doel(x, y, k, draai, 'hiel'), k, draai, 0.0
        if u > 0.68:
            k = 34.0 * ((u - 0.68) / 0.32) ** 1.5
            return voet_doel(x, y, k, draai, 'bal'), k, draai, -k * 0.9
        return voet_doel(x, y, 0.0, draai, None), 0.0, draai, 0.0
    v = (fase - duur) / (1.0 - duur)
    e = v * v * (3.0 - 2.0 * v)
    y = pas - 2.0 * pas * e
    til = math.sin(math.pi * v) ** 0.85 * 0.055
    k = 34.0 * (1.0 - v) ** 1.6 - 20.0 * v ** 3
    teen = -30.0 * max(0.0, 1.0 - v * 3.0)
    doel = voet_doel(x, y, k, draai, 'bal' if v < 0.12 else None)
    doel[2] = max(doel[2], ENKEL) + til
    return doel, k, draai, teen


def pas_lengte():
    """Hoe ver de standvoet per pas schuift, in meter: dat is ook hoe ver de figuur per pas vooruit moet, wil hij niet glijden."""
    return (0.135 + 0.42 * S.E) * 2.0 / DUUR / 2.0


def lopen(rust, t, speer_draai=0.0):
    """Lopen: de benen wisselen echt, het bekken draait en zakt, de borst draait tegen, de vrije arm zwaait tegen het been in en
    de speer gaat als één stuk mee. Op de plaats: de wereld schuift onder hem door, met dezelfde snelheid als de standvoet."""
    pas = 0.135 + 0.42 * S.E  # de halve slag van de voet
    h = S.Houding(rust)
    c1 = math.cos(TAU * t)
    s1 = math.sin(TAU * t)
    c2 = math.cos(2 * TAU * t)
    h.zet('wortel', np.eye(3))
    zak = -0.012 - 0.022 * (0.5 + 0.5 * c2)
    zij = -0.016 * s1
    h.zet('bekken', S.euler(3.5, 2.4 * s1, 6.5 * c1), rust.kop['bekken'] + np.array([zij, 0.0, zak]))
    h.rel('rug', S.euler(1.5 + 0.8 * c2, -1.2 * s1, -6.0 * c1))
    h.rel('borst', S.euler(1.0, -1.0 * s1, -6.0 * c1))
    h.rel('nek', S.euler(-2.5, 0.5 * s1, 2.5 * c1))
    h.rel('hoofd', S.euler(-3.0 + 0.8 * c2, 0.8 * s1, 2.5 * c1))
    pool = lambda s: np.array([s * 0.18, -1.0, 0.0])
    voeten = {}
    for s, f in ((-1, 0.0), (1, 0.5)):
        doel, k, dr, teen = _voet_lopen(_rond(t + f), pas, s * 0.135, s * 8.0)
        voeten[s] = (doel, k, dr, teen, pool(s))
    stand_benen(h, voeten)
    stand_rok(h)
    # de speer in de rechterhand, schuin naar voren, met de borst mee
    B = h.kop['borst']
    greep = np.array([-0.37 + 0.8 * zij, -0.24 - 0.015 * c1, 0.75 + S.E + 0.6 * (zak + 0.024)])
    richting = S._n([-0.07, -0.09 + 0.012 * c1, 1.0])
    speer_stand(h, greep, richting, speer_draai)
    stand_hand(h, -1, greep, richting, (-0.28, -1.0, -0.05), (-0.35, 0.6, -1.0))
    # de linkerarm zwaait tegen het rechterbeen in: bij rechts voor (t = 0) is links voor
    zwaai_ = c1
    C = np.array([0.335 + zij, -0.03 - 0.13 * zwaai_, 0.415 + S.E + 0.05 * max(0.0, zwaai_) + 0.02 * max(0.0, -zwaai_)])
    vinger = S._n([-0.05, -0.35 * zwaai_ - 0.2, -1.0])
    stand_hand(h, 1, C, S._n([0.05, -1.0, 0.25 * zwaai_]), vinger, (0.5, 1.0, -0.1))
    return h


HOUDING = {'staan': staan, 'lopen': lopen}


def zet(arm_, rust, houding, t, speer_draai=0.0):
    """De houding op de botten in Blender."""
    from mathutils import Matrix
    h = HOUDING[houding](rust, t, speer_draai)
    b = h.basis()
    for pb in arm_.pose.bones:
        if pb.name in b:
            pb.matrix_basis = Matrix(b[pb.name].tolist())
    return h
