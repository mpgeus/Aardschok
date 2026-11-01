# De vormbibliotheek van de stijlpijplijn (vraag 192): gesculpte vormen uit afstandsvelden (SDF), in numpy, zonder iets erbij
# te installeren. Een vorm is een functie van punten (..., 3) naar afstanden (...). Vormen vloeien met smin in elkaar, zodat
# een schouder overgaat in een arm in plaats van een bol op een cilinder te zijn; surface nets maakt er een mesh van.
# Alles is vast: hetzelfde zaad geeft dezelfde vorm, punt voor punt.
import numpy as np


def _arr(p):
    return np.asarray(p, dtype=np.float32)


# --- vormen -------------------------------------------------------------------------------------------------------------

def bol(P, c, r):
    return np.linalg.norm(P - _arr(c), axis=-1) - r


def ellips(P, c, r, R=None):
    """Een ellipsoïde (benadering van iq); R draait de punten naar de ruimte van de ellipsoïde."""
    q = P - _arr(c)
    if R is not None:
        q = q @ _arr(R)
    r = _arr(r)
    k0 = np.linalg.norm(q / r, axis=-1)
    k1 = np.linalg.norm(q / (r * r), axis=-1)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)


def staaf(P, a, b, ra, rb=None):
    """Een staaf van a naar b die van straal ra naar rb verloopt."""
    a = _arr(a)
    ba = _arr(b) - a
    rb = ra if rb is None else rb
    pa = P - a
    t = np.clip((pa @ ba) / np.maximum(ba @ ba, 1e-9), 0.0, 1.0)
    return np.linalg.norm(pa - t[..., None] * ba, axis=-1) - (ra + (rb - ra) * t)


def doos(P, c, b, r=0.0, R=None):
    q = P - _arr(c)
    if R is not None:
        q = q @ _arr(R)
    q = np.abs(q) - (_arr(b) - r)
    return np.linalg.norm(np.maximum(q, 0.0), axis=-1) + np.minimum(q.max(axis=-1), 0.0) - r


def ketting(P, punten, stralen):
    """Een rij staven door punten, met per punt een straal: een vinger, een riem."""
    d = None
    for i in range(len(punten) - 1):
        s = staaf(P, punten[i], punten[i + 1], stralen[i], stralen[i + 1])
        d = s if d is None else np.minimum(d, s)
    return d


# --- samenvoegen --------------------------------------------------------------------------------------------------------

def smin(a, b, k):
    if k <= 0:
        return np.minimum(a, b)
    h = np.maximum(k - np.abs(a - b), 0.0) / k
    return np.minimum(a, b) - h * h * k * 0.25


def smax(a, b, k):
    return -smin(-a, -b, k)


def weg(a, b, k=0.0):
    """Haal b uit a."""
    return smax(a, -b, k)


def vloei(vormen, k):
    d = vormen[0]
    for v in vormen[1:]:
        d = smin(d, v, k)
    return d


def stap(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


# --- ruis ---------------------------------------------------------------------------------------------------------------

_TABELLEN = {}


def _tabel(zaad):
    if zaad not in _TABELLEN:
        _TABELLEN[zaad] = np.random.default_rng(zaad).random((64, 64, 64), dtype=np.float32)
    return _TABELLEN[zaad]


def ruis(P, schaal, zaad=1, octaven=1):
    """Waarderuis van 0 tot 1; schaal is de grootte van een vlek in meter (per as mag ook: wit trekt hij uit)."""
    t = _tabel(zaad)
    uit = np.zeros(P.shape[:-1], dtype=np.float32)
    amp, som = 1.0, 0.0
    q = P / _arr(schaal)
    for o in range(octaven):
        f = np.floor(q)
        u = q - f
        u = u * u * (3.0 - 2.0 * u)
        i = f.astype(np.int64) & 63
        j = (i + 1) & 63
        c = lambda a, b, d: t[a[..., 0], b[..., 1], d[..., 2]]
        x00 = c(i, i, i) * (1 - u[..., 0]) + c(j, i, i) * u[..., 0]
        x10 = c(i, j, i) * (1 - u[..., 0]) + c(j, j, i) * u[..., 0]
        x01 = c(i, i, j) * (1 - u[..., 0]) + c(j, i, j) * u[..., 0]
        x11 = c(i, j, j) * (1 - u[..., 0]) + c(j, j, j) * u[..., 0]
        y0 = x00 * (1 - u[..., 1]) + x10 * u[..., 1]
        y1 = x01 * (1 - u[..., 1]) + x11 * u[..., 1]
        uit += amp * (y0 * (1 - u[..., 2]) + y1 * u[..., 2])
        som += amp
        amp *= 0.5
        q = q * 2.03 + 17.3
    return uit / som


# --- van veld naar mesh -------------------------------------------------------------------------------------------------

def rooster(lo, hi, h):
    """De punten van een rooster over een vak, met maat h."""
    ass = [np.arange(lo[i], hi[i] + h, h, dtype=np.float32) for i in range(3)]
    X, Y, Z = np.meshgrid(*ass, indexing='ij')
    return np.stack([X, Y, Z], axis=-1)


def netten(D, lo, h):
    """Surface nets: per cel die het oppervlak snijdt één punt, het gemiddelde van waar de ribben snijden; per snijdende
    ribbe een vierhoek. Geeft gladdere vormen dan marching cubes, en alleen vierhoeken."""
    D = D.astype(np.float32)
    nx, ny, nz = D.shape
    S = D < 0
    cel = np.full((nx - 1, ny - 1, nz - 1), -1, dtype=np.int32)
    som = {}
    # per as de ribben die snijden, met hun snijpunt in roostermaat
    bijdragen_c, bijdragen_p = [], []
    ribben = []
    for as_ in range(3):
        a = [slice(None)] * 3
        b = [slice(None)] * 3
        a[as_] = slice(0, -1)
        b[as_] = slice(1, None)
        kruis = S[tuple(a)] != S[tuple(b)]
        idx = np.argwhere(kruis)
        if len(idx) == 0:
            ribben.append((idx, None))
            continue
        da = D[tuple(a)][kruis]
        db = D[tuple(b)][kruis]
        t = da / (da - db)
        p = idx.astype(np.float32)
        p[:, as_] += t
        ribben.append((idx, da < 0))
        # de vier cellen rond deze ribbe
        o1, o2 = [(1, 2), (0, 2), (0, 1)][as_]
        for d1 in (0, 1):
            for d2 in (0, 1):
                c = idx.copy()
                c[:, o1] -= d1
                c[:, o2] -= d2
                goed = (c[:, 0] >= 0) & (c[:, 1] >= 0) & (c[:, 2] >= 0) & (c[:, 0] < nx - 1) & (c[:, 1] < ny - 1) & (c[:, 2] < nz - 1)
                bijdragen_c.append(c[goed])
                bijdragen_p.append(p[goed])
    C = np.concatenate(bijdragen_c)
    P = np.concatenate(bijdragen_p)
    sleutel = C[:, 0] * (ny * nz) + C[:, 1] * nz + C[:, 2]
    uniek, inv = np.unique(sleutel, return_inverse=True)
    n = len(uniek)
    v = np.zeros((n, 3), dtype=np.float64)
    tel = np.bincount(inv, minlength=n).astype(np.float64)
    for i in range(3):
        v[:, i] = np.bincount(inv, weights=P[:, i], minlength=n) / tel
    cx = uniek // (ny * nz)
    cy = (uniek // nz) % ny
    cz = uniek % nz
    cel[cx, cy, cz] = np.arange(n, dtype=np.int32)
    # de vierhoeken
    quads = []
    for as_, (idx, binnen) in enumerate(ribben):
        if binnen is None or len(idx) == 0:
            continue
        o1, o2 = [(1, 2), (0, 2), (0, 1)][as_]
        goed = (idx[:, o1] > 0) & (idx[:, o2] > 0) & (idx[:, o1] < D.shape[o1] - 1) & (idx[:, o2] < D.shape[o2] - 1)
        i = idx[goed]
        bin_ = binnen[goed]
        h1 = np.zeros(3, dtype=int)
        h2 = np.zeros(3, dtype=int)
        h1[o1] = 1
        h2[o2] = 1
        c00 = cel[tuple((i - h1 - h2).T)]
        c10 = cel[tuple((i - h2).T)]
        c11 = cel[tuple(i.T)]
        c01 = cel[tuple((i - h1).T)]
        q = np.stack([c00, c10, c11, c01], axis=1)
        # de richting: de normaal wijst van binnen naar buiten
        omkeer = bin_ if as_ == 1 else ~bin_
        q[omkeer] = q[omkeer][:, ::-1]
        quads.append(q)
    q = np.concatenate(quads) if quads else np.zeros((0, 4), dtype=np.int32)
    q = q[(q >= 0).all(axis=1)]
    return v * h + np.asarray(lo, dtype=np.float64), q


def buren(q, n):
    a = q.ravel()
    b = np.roll(q, -1, axis=1).ravel()
    return np.concatenate([a, b]), np.concatenate([b, a]), n


def glad(v, q, keren=2, l=0.5, mu=-0.53):
    """Taubin: gladstrijken zonder te krimpen."""
    i, j, n = buren(q, len(v))
    tel = np.maximum(np.bincount(i, minlength=n), 1).astype(np.float64)
    v = v.copy()
    for _ in range(keren):
        for f in (l, mu):
            m = np.stack([np.bincount(i, weights=v[j, a], minlength=n) for a in range(3)], axis=1) / tel[:, None]
            v += f * (m - v)
    return v


def normalen(v, q):
    a = v[q[:, 2]] - v[q[:, 0]]
    b = v[q[:, 3]] - v[q[:, 1]]
    fn = np.cross(a, b)
    n = np.zeros_like(v)
    for k in range(4):
        for ax in range(3):
            n[:, ax] += np.bincount(q[:, k], weights=fn[:, ax], minlength=len(v))
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)


def bolling(v, q, n, keren=8):
    """Hoe bol een punt ligt, in meter: het verschil met zijn gladde buurt, langs de normaal. Positief is bol (een rand die
    slijt en licht vangt), negatief hol (een plooi waar het vuil en de schaduw zitten)."""
    i, j, _ = buren(q, len(v))
    tel = np.maximum(np.bincount(i, minlength=len(v)), 1).astype(np.float64)
    g = v.copy()
    for _ in range(keren):
        g = 0.5 * g + 0.5 * np.stack([np.bincount(i, weights=g[j, a], minlength=len(v)) for a in range(3)], axis=1) / tel[:, None]
    return ((v - g) * n).sum(axis=1)


def maak(veld, lo, hi, h, gladkeren=1):
    """Van een veld (functie) over een vak naar punten en vierhoeken."""
    P = rooster(lo, hi, h)
    D = veld(P)
    v, q = netten(D, lo, h)
    if gladkeren:
        v = glad(v, q, gladkeren)
    return v, q
