# Het skelet van de stijl (vraag 192): één menselijk skelet voor elke eenheid, in meter, de figuur kijkt naar -Y, zijn linkerkant
# is +X (zo staat links en rechts altijd vanuit de figuur). Geen IK-constraints in Blender: de houding wordt hier uitgerekend
# (voorwaartse kinematica en een analytische IK), dus elk beeld is exact te herhalen, een voet die stilstaat staat echt stil,
# en een hand op de speer zit er echt op. De uitkomst gaat als gewone sleutels op de botten, zodat ook een GLB hem meeneemt.
import math

import numpy as np

# --- de maten ------------------------------------------------------------------------------------------------------------
# de maten komen uit de plaat met de acht richtingen (docs/art/referentie/aardschok-speerman-acht.png), bij een lengte van 1,40 m
ARM_HOEK = math.radians(28)  # de armen in rust: 28 graden van de romp (A-houding), het minste vervormen naar de houdingen
_s, _c = math.sin(ARM_HOEK), math.cos(ARM_HOEK)
BOVENARM = 0.20
ONDERARM = 0.20
HAND_SCHAAL = 1.5  # de vuisten zijn anderhalf keer een gewone: zo lezen ze op spelmaat
HAND = 0.105 * HAND_SCHAAL
GREEP = np.array([0.0, 0.066, -0.030])  # het midden van de greep in de vuist, in de ruimte van de hand, voor HAND_SCHAAL
DIJ = 0.17
SCHEEN = 0.17
SCHOUDER = (0.235, 0.005, 0.85)
HEUP = (0.115, 0.0, 0.42)
ENKEL_Z = 0.10
KOP_DRAAI = (0.0, 0.0, 0.94)  # waar de hals in het hoofd overgaat: om dit punt schaalt het hoofd
E = 0.0  # hoeveel de benen langer zijn dan de basis, in meter: het hele bovenlijf staat zoveel hoger (de verhouding, figuur.BOUW)


def _kant(s, e):
    """De botten van één kant; s = 1 links (+X), s = -1 rechts. Naam, kop, staart, ouder, verwijzing voor de Z-as."""
    Sh = np.array([s * SCHOUDER[0], SCHOUDER[1], SCHOUDER[2] + e])
    d = np.array([s * _s, 0.0, -_c])
    El = Sh + BOVENARM * d
    W = El + ONDERARM * d + np.array([0.0, -0.01, 0.0])
    Hk = W + HAND * d
    n = '.L' if s > 0 else '.R'
    uit = np.array([s * _c, 0.0, _s])  # de rug van de hand wijst naar buiten; de duim naar voren
    H = np.array([s * HEUP[0], HEUP[1], HEUP[2] + e])
    K = H + np.array([s * 0.005, -0.005, -(DIJ + e / 2)])
    A = np.array([s * 0.125, 0.005, ENKEL_Z])
    A = K + (A - K) / np.linalg.norm(A - K) * (SCHEEN + e / 2)
    T = np.array([s * 0.127, -0.135, 0.045])
    Z = np.array([s * 0.13, -0.245, 0.04])
    voor = np.array([0.0, -1.0, 0.0])
    op = np.array([0.0, 0.0, 1.0])
    return [
        ('sleutel' + n, (s * 0.05, 0.005, 0.84 + e), tuple(Sh), 'borst', tuple(op)),
        ('bovenarm' + n, tuple(Sh), tuple(El), 'sleutel' + n, tuple(uit)),
        ('onderarm' + n, tuple(El), tuple(W), 'bovenarm' + n, tuple(uit)),
        ('hand' + n, tuple(W), tuple(Hk), 'onderarm' + n, tuple(uit)),
        ('dij' + n, tuple(H), tuple(K), 'bekken', tuple(voor)),
        ('scheen' + n, tuple(K), tuple(A), 'dij' + n, tuple(voor)),
        ('voet' + n, tuple(A), tuple(T), 'scheen' + n, tuple(op)),
        ('teen' + n, tuple(T), tuple(Z), 'voet' + n, tuple(op)),
    ]


def botten(e=None):
    """Alle botten in de volgorde ouder vóór kind: naam, kop, staart, ouder, verwijzing voor de Z-as. e is hoeveel de benen langer zijn."""
    e = E if e is None else e
    op = (0.0, 0.0, 1.0)
    voor = (0.0, -1.0, 0.0)
    b = [
        ('wortel', (0, 0, 0), (0, -0.2, 0), None, op),
        ('speer', (-0.30, -0.16, 0.74 + e), (-0.30, -0.16, 1.04 + e), 'wortel', voor),
        ('bekken', (0, 0, 0.44 + e), (0, 0, 0.52 + e), 'wortel', voor),
        ('rug', (0, 0, 0.52 + e), (0, 0, 0.64 + e), 'bekken', voor),
        ('borst', (0, 0, 0.64 + e), (0, 0.005, 0.86 + e), 'rug', voor),
        ('nek', (0, 0.005, 0.86 + e), (0, 0, KOP_DRAAI[2] + e), 'borst', voor),
        ('hoofd', (0, 0, KOP_DRAAI[2] + e), (0, 0, 1.28 + e), 'nek', voor),
        ('rok.V', (0, -0.09, 0.47 + e), (0, -0.16, 0.25 + e), 'bekken', voor),
        ('rok.A', (0, 0.09, 0.47 + e), (0, 0.16, 0.25 + e), 'bekken', voor),
        ('buidel', (-0.185, -0.135, 0.56 + e), (-0.185, -0.135, 0.40 + e), 'bekken', voor),
    ]
    for s in (-1, 1):
        b += _kant(s, e)
    return b


# --- rekenen -------------------------------------------------------------------------------------------------------------

def _n(v):
    v = np.asarray(v, dtype=np.float64)
    return v / max(np.linalg.norm(v), 1e-12)


def rx(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]], dtype=np.float64)


def ry(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]], dtype=np.float64)


def rz(a):
    c, s = math.cos(a), math.sin(a)
    return np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]], dtype=np.float64)


def euler(voorover=0.0, opzij=0.0, draai=0.0):
    """Een draaiing in graden: voorover (positief is naar -Y), opzij (positief is de bovenkant naar zijn linkerkant, +X) en
    draai om de lengteas (positief is zijn borst naar links)."""
    return rz(math.radians(draai)) @ ry(math.radians(opzij)) @ rx(math.radians(voorover))


def zwaai(a, b):
    """De kortste draaiing van richting a naar richting b."""
    a, b = _n(a), _n(b)
    v = np.cross(a, b)
    c = float(a @ b)
    if c > 0.999999:
        return np.eye(3)
    if c < -0.999999:
        o = _n(np.cross(a, [1, 0, 0]) if abs(a[0]) < 0.9 else np.cross(a, [0, 1, 0]))
        return 2.0 * np.outer(o, o) - np.eye(3)
    K = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + K + K @ K * (1.0 / (1.0 + c))


def ik(a, doel, l1, l2, pool):
    """Twee botten van a naar doel, met het gewricht naar de pool. Geeft het gewricht en het eindpunt."""
    a = np.asarray(a, dtype=np.float64)
    d = np.asarray(doel, dtype=np.float64) - a
    L = np.linalg.norm(d)
    L2 = min(max(L, abs(l1 - l2) + 1e-4), (l1 + l2) * 0.9995)
    r = d / max(L, 1e-9)
    x = (l1 * l1 - l2 * l2 + L2 * L2) / (2.0 * L2)
    y = math.sqrt(max(l1 * l1 - x * x, 0.0))
    p = _n(np.asarray(pool, dtype=np.float64) - r * (np.asarray(pool, dtype=np.float64) @ r))
    return a + r * x + p * y, a + r * L2


class Rust:
    """Het skelet in rust, uit de matrices die Blender aan de botten gaf."""

    def __init__(self, matrices, ouders):
        self.M = {k: np.array(v, dtype=np.float64) for k, v in matrices.items()}
        self.ouder = ouders
        self.R = {k: v[:3, :3] for k, v in self.M.items()}
        self.kop = {k: v[:3, 3] for k, v in self.M.items()}
        self.len = {}

    def staart(self, naam):
        return self.kop[naam] + self.R[naam][:3, 1] * self.len[naam]


class Houding:
    """Een houding in opbouw: per bot het verschil met rust (Delta, in de wereld) en de plek van de kop."""

    def __init__(self, rust):
        self.r = rust
        self.delta = {}
        self.kop = {}

    def zet(self, naam, delta=None, kop=None):
        """Een bot zetten: delta is zijn draaiing t.o.v. rust; zonder delta volgt hij zijn ouder. Zonder kop hangt hij aan
        zijn ouder, op de plek die hij in rust daartegenover had."""
        r = self.r
        o = r.ouder[naam]
        if o is None:
            D0 = np.eye(3)
            k = r.kop[naam]
        else:
            D0 = self.delta[o]
            k = self.kop[o] + D0 @ (r.kop[naam] - r.kop[o])
        self.delta[naam] = D0 if delta is None else delta
        self.kop[naam] = k if kop is None else np.asarray(kop, dtype=np.float64)
        return self

    def rel(self, naam, e=None):
        """Een bot met een draaiing t.o.v. zijn ouder."""
        o = self.r.ouder[naam]
        D0 = np.eye(3) if o is None else self.delta[o]
        return self.zet(naam, D0 if e is None else D0 @ e)

    def wijs(self, naam, richting, kop=None):
        """Een bot dat naar een richting wijst, met de kortste draaiing vanaf zijn ouder (geen ongewild wringen)."""
        r = self.r
        self.zet(naam, None, kop)
        y0 = self.delta[naam] @ r.R[naam][:3, 1]
        self.delta[naam] = zwaai(y0, richting) @ self.delta[naam]
        return self

    def as_(self, naam, as_i):
        return self.delta[naam] @ self.r.R[naam][:3, as_i]

    def staart(self, naam):
        return self.kop[naam] + self.as_(naam, 1) * self.r.len[naam]

    def matrices(self):
        """Per bot de 4x4-matrix in de wereld."""
        uit = {}
        for k in self.delta:
            m = np.eye(4)
            m[:3, :3] = self.delta[k] @ self.r.R[k]
            m[:3, 3] = self.kop[k]
            uit[k] = m
        return uit

    def basis(self):
        """De matrix_basis per bot, zoals Blender hem wil."""
        r = self.r
        M = self.matrices()
        uit = {}
        for k, m in M.items():
            o = r.ouder[k]
            if o is None:
                uit[k] = np.linalg.inv(r.M[k]) @ m
            else:
                rel = np.linalg.inv(r.M[o]) @ r.M[k]
                uit[k] = np.linalg.inv(rel) @ np.linalg.inv(M[o]) @ m
        return uit
