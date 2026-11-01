# Hunyuan3D-2mv: de kleur van de plaat op de mesh, per punt. Dat gebeurt op de mesh zoals hij uit het model komt, met een vlakke camera: zo heeft het model de plaat
# gelezen, dus daar valt hij het best samen. De kleur blijft daarna aan het punt zitten, ook als de vorm verandert. Eén masker en de registratie per richting
# (schaal en verschuiving op de omtrek) maken dit automatisch.
#
# Let op wat dit bewijst: een render uit een richting die in de projectie zat, lijkt per definitie op de plaat. Eerlijk is een richting die er niet in zat (`richtingen`).
import os
import sys

import numpy as np
from scipy import ndimage as ni
from scipy import signal as si
from scipy.sparse import coo_matrix, diags

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_invoer as HI  # noqa: E402
import hy_mesh as M  # noqa: E402

RICHTINGEN = {'Z': 0, 'ZW': -45, 'W': -90, 'NW': -135, 'N': 180, 'NO': 135, 'O': 90, 'ZO': 45}
SCHERPTE, TOL = 14.0, 0.014  # scherp: blauw en geel uit twee richtingen gemengd geven paars
# De plaat past niet met alleen schaal en verschuiving op de mesh (Marcel, 31 okt: "Lijkt nog niet helemaal goed te passen. De skin op het model"): per richting een zachte vervorming,
# eerst op de omtrek, dan op de randen binnen de figuur (riem, zoom, kraag, mouw). `pasmaat` meet of het helpt: hoe vaak twee richtingen het eens zijn over dezelfde plek op de mesh.
PAS = {'omtrek': True, 'binnen': True, 'rand': 34, 'stappen': 90, 'glad': 7.0, 'binnen_stappen': 60, 'binnen_glad': 9.0, 'binnen_stap': 0.5}


def srgb_lin(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def zicht(V, graden, e=0.0):
    """X naar rechts, Y omhoog in beeld, D naar de camera; de figuur draait, de camera staat stil."""
    a = np.radians(graden)
    x = V[:, 0] * np.cos(a) - V[:, 1] * np.sin(a)
    y = V[:, 0] * np.sin(a) + V[:, 1] * np.cos(a)
    c, s = np.cos(np.radians(e)), np.sin(np.radians(e))
    return x, y * s + V[:, 2] * c, -y * c + V[:, 2] * s


def registreer(X, Y, masker, schalen):
    """De schaal en verschuiving waarbij de omtrek van de mesh het best op het masker van de plaat valt."""
    h, w = masker.shape
    best = (-1.0, None)
    plaat = masker.astype(np.float32)
    for s in schalen:
        px, py = (X - X.min()) * s, (Y.max() - Y) * s
        H, W = int(py.max()) + 3, int(px.max()) + 3
        m = np.zeros((H, W), dtype=bool)
        m[py.astype(int), px.astype(int)] = True
        m = ni.binary_fill_holes(ni.binary_closing(m, iterations=2))
        c = si.fftconvolve(plaat, m[::-1, ::-1].astype(np.float32), mode='full')
        iy, ix = np.unravel_index(np.argmax(c), c.shape)
        snijd = c[iy, ix]
        iou = snijd / (plaat.sum() + m.sum() - snijd)
        if iou > best[0]:
            best = (float(iou), (float(s), float(ix - (W - 1) - X.min() * s), float(iy - (H - 1) + Y.max() * s)))
    return best


def bilineair(a, x, y):
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = (x - x0)[:, None], (y - y0)[:, None]
    h, w = a.shape[:2]
    x0, x1, y0, y1 = np.clip(x0, 0, w - 1), np.clip(x0 + 1, 0, w - 1), np.clip(y0, 0, h - 1), np.clip(y0 + 1, 0, h - 1)
    return (a[y0, x0] * (1 - fx) + a[y0, x1] * fx) * (1 - fy) + (a[y1, x0] * (1 - fx) + a[y1, x1] * fx) * fy


def gedeelde_schaal(V, richtingen):
    """Eén schaal voor alle richtingen: de som van de overlap is het hoogst. De invoer had ook één schaal; per richting vrij geeft uitschieters."""
    midden = HI.BRON['met_speer'] / (V[:, 2].max() - V[:, 2].min())
    if HI.BRON.get('mix'):
        richtingen = [r for r in richtingen if HI.MIX[r] == 'detail']
    beste, s_b = -1.0, midden
    for s in np.arange(0.8 * midden, 1.1 * midden, 0.015 * midden):
        som = 0.0
        for r in richtingen:
            X, Y, _ = zicht(V, RICHTINGEN[r])
            som += registreer(X, Y, HI.vrijstaand(r)[1], [s])[0]
        if som > beste:
            beste, s_b = som, float(s)
    return s_b


def _veld(F_, G_, stappen, sigma, klem, uy=None, ux=None):
    """Demons: een glad verplaatsingsveld zodat G_(x + u(x)) op F_(x) gaat lijken. In plaatpixels."""
    h, w_ = F_.shape
    yy, xx = np.mgrid[0:h, 0:w_].astype(np.float32)
    ux = np.zeros((h, w_), dtype=np.float32) if ux is None else ux
    uy = np.zeros((h, w_), dtype=np.float32) if uy is None else uy
    gy, gx = np.gradient(F_)
    for _ in range(stappen):
        Gw = ni.map_coordinates(G_, [yy + uy, xx + ux], order=1, mode='nearest')
        d = Gw - F_
        gy2, gx2 = np.gradient(Gw)
        jx, jy = (gx + gx2) / 2, (gy + gy2) / 2
        noem = jx * jx + jy * jy + 0.02 * d * d + 1e-4
        ux = ni.gaussian_filter(ux - np.clip(d * jx / noem, -klem, klem), sigma)
        uy = ni.gaussian_filter(uy - np.clip(d * jy / noem, -klem, klem), sigma)
    return uy, ux


def _randen(a, s=1.2):
    g = ni.gaussian_filter(a.astype(np.float32), s)
    e = np.hypot(ni.sobel(g, axis=0), ni.sobel(g, axis=1))
    return e / max(float(np.percentile(e, 99)), 1e-6)


def passend(V, N, F, r, m, vak, px, py, D, zicht_):
    """De plek op de plaat per punt, na de zachte vervorming. px, py: na schaal en verschuiving."""
    pad = 40
    h, w_ = m.shape
    H, W_ = h + 2 * pad, w_ + 2 * pad
    ix, iy = np.clip((px + pad).round().astype(int), 0, W_ - 1), np.clip((py + pad).round().astype(int), 0, H - 1)
    mm = np.zeros((H, W_), dtype=bool)
    mm[iy, ix] = True
    mm = ni.binary_fill_holes(ni.binary_closing(mm, iterations=2))
    pl = np.zeros((H, W_), dtype=bool)
    pl[pad:pad + h, pad:pad + w_] = m
    romp_m, romp_p = HI.P4.dun_weg(mm), HI.P4.dun_weg(pl)
    uy, ux = None, None
    if PAS['omtrek']:
        def sdf(b):
            return np.clip(ni.distance_transform_edt(b) - ni.distance_transform_edt(~b), -PAS['rand'], PAS['rand']).astype(np.float32)
        uy, ux = _veld(sdf(romp_m), sdf(romp_p), PAS['stappen'], PAS['glad'], 1.5)
    if PAS['binnen']:
        # de randen binnen de figuur: wat de mesh als vorm heeft (diepte en licht) tegen wat de plaat als lijn heeft
        a = np.radians(RICHTINGEN[r])
        vl = zicht_ & ((-(N[:, 0] * np.sin(a) + N[:, 1] * np.cos(a))) > 0.0)
        som, tel = np.zeros((H, W_), dtype=np.float32), np.zeros((H, W_), dtype=np.float32)
        schaduw = 0.6 * np.clip(-(N[:, 0] * np.sin(a) + N[:, 1] * np.cos(a)), 0, 1) + 0.4 * np.clip(N[:, 2], -1, 1)
        np.add.at(som, (iy[vl], ix[vl]), schaduw[vl].astype(np.float32))
        np.add.at(tel, (iy[vl], ix[vl]), 1.0)
        gl_t = ni.gaussian_filter(tel, 1.0)
        beeld_m = ni.gaussian_filter(som, 1.0) / np.maximum(gl_t, 1e-3)
        L = np.zeros((H, W_), dtype=np.float32)
        L[pad:pad + h, pad:pad + w_] = vak.mean(-1)
        # alleen binnen de romp, en niet de omtrek zelf: die is net gedaan
        kern_m = ni.binary_erosion(romp_m, iterations=5)
        kern_p = ni.binary_erosion(romp_p, iterations=5)
        Fm = ni.gaussian_filter(_randen(beeld_m) * kern_m, 1.6)
        Gm = ni.gaussian_filter(_randen(L) * kern_p, 1.6)
        uy, ux = _veld(Fm, Gm, PAS['binnen_stappen'], PAS['binnen_glad'], PAS['binnen_stap'], uy, ux)
    if ux is None:
        return px, py, 0.0
    qx = px + ni.map_coordinates(ux, [py + pad, px + pad], order=1, mode='nearest')
    qy = py + ni.map_coordinates(uy, [py + pad, px + pad], order=1, mode='nearest')
    return qx, qy, round(float(np.percentile(np.hypot(qx - px, qy - py), 95)), 1)


def vorm_naar_plaat(V, richtingen, schaal, kracht=0.8, glad=None):
    """De mesh naar de plaat: hetzelfde veld als voor de verf, maar nu beweegt de vorm. Z en N zeggen iets over x, W en O over y, en allemaal over z. De diepte in beeld blijft staan. Geeft de nieuwe punten en hoeveel ze zijn bewogen."""
    dx, dy, dz, nz = np.zeros(len(V)), np.zeros(len(V)), np.zeros(len(V)), 0
    nx = ny = 0.0
    for r in richtingen:
        m = HI.vrijstaand(r)[1]
        X, Y, _ = zicht(V, RICHTINGEN[r])
        s_r = schaal
        if HI.BRON.get('mix'):
            s_r = schaal * {'detail': 341.0, 'acht': 390.0}[HI.MIX[r]] / 341.0
        _, (s, tx, ty) = registreer(X, Y, m, [s_r])
        px, py = X * s + tx, -Y * s + ty
        pad = 40
        h, w_ = m.shape
        H, W_ = h + 2 * pad, w_ + 2 * pad
        mm = np.zeros((H, W_), dtype=bool)
        mm[np.clip((py + pad).round().astype(int), 0, H - 1), np.clip((px + pad).round().astype(int), 0, W_ - 1)] = True
        mm = ni.binary_fill_holes(ni.binary_closing(mm, iterations=2))
        pl = np.zeros((H, W_), dtype=bool)
        pl[pad:pad + h, pad:pad + w_] = m
        def sdf(b):
            return np.clip(ni.distance_transform_edt(b) - ni.distance_transform_edt(~b), -PAS['rand'], PAS['rand']).astype(np.float32)
        uy, ux = _veld(sdf(HI.P4.dun_weg(mm)), sdf(HI.P4.dun_weg(pl)), PAS['stappen'], glad or 9.0, 1.5)
        vx = ni.map_coordinates(ux, [py + pad, px + pad], order=1, mode='nearest') / s
        vy = ni.map_coordinates(uy, [py + pad, px + pad], order=1, mode='nearest') / s
        a = np.radians(RICHTINGEN[r])
        dx += vx * np.cos(a)
        dy += -vx * np.sin(a)
        nx += abs(np.cos(a))
        ny += abs(np.sin(a))
        dz += -vy
        nz += 1
    U = V.copy()
    U[:, 0] += kracht * dx / max(nx, 1e-6)
    U[:, 1] += kracht * dy / max(ny, 1e-6)
    U[:, 2] += kracht * dz / max(nz, 1)
    return U, round(float(np.percentile(np.linalg.norm(U - V, axis=1), 95)), 4)


def pasmaat(alles, gewicht, richtingen):
    """Hoe goed de verf past: twee buurrichtingen die dezelfde plek op de mesh zien, moeten dezelfde kleur geven. Per paar: het deel van de punten in hetzelfde kleurvlak, en het kleurverschil (0..255)."""
    uit, rs = {}, list(richtingen)
    for i, a in enumerate(rs):
        b = rs[(i + 1) % len(rs)]
        s = (gewicht[a] > 0.2) & (gewicht[b] > 0.2)
        if s.sum() < 100:
            continue
        ka, kb = lin_srgb(alles[a][s]), lin_srgb(alles[b][s])
        uit[f'{a}-{b}'] = {'punten': int(s.sum()), 'zelfde_vlak': round(float((klasse(alles[a][s]) == klasse(alles[b][s])).mean()), 3), 'verschil': round(float(np.abs(ka - kb).mean() * 255), 1)}
    if uit:
        uit['gemiddeld'] = {'zelfde_vlak': round(float(np.mean([v['zelfde_vlak'] for v in uit.values()])), 3), 'verschil': round(float(np.mean([v['verschil'] for k, v in uit.items() if k != 'gemiddeld'])), 1)}
    return uit


def per_richting(V, F, r, N, schaal=None):
    """Voor één richting: de kleur (lineair), hoe recht het punt naar de camera kijkt, of het zichtbaar is, en hoe goed de registratie was."""
    vak = np.asarray(HI.ref_vak(r), dtype=np.float32) / 255.0
    m = HI.vrijstaand(r)[1]
    X, Y, D = zicht(V, RICHTINGEN[r])
    # bij een gemengde plaat is de plaatschaal per bron anders: die volgt uit de figuurhoogte op de plaat
    if HI.BRON.get('mix'):
        hoogte = lambda b_: {'detail': 341.0, 'acht': 390.0}[b_]
        schaal = schaal * hoogte(HI.MIX[r]) / hoogte('detail')
    iou, (s, tx, ty) = registreer(X, Y, m, [schaal])
    px, py = X * s + tx, -Y * s + ty
    # de voorste diepte per plaatpixel, tweemaal zo fijn
    h, w = m.shape
    ix, iy = np.clip((px * 2).astype(int), 0, 2 * w - 1), np.clip((py * 2).astype(int), 0, 2 * h - 1)
    zb = np.full((2 * h, 2 * w), -1e9)
    np.maximum.at(zb, (iy, ix), D)
    zb = ni.maximum_filter(zb, size=3)
    zicht_ = D >= zb[iy, ix] - TOL
    a = np.radians(RICHTINGEN[r])
    facing = -(N[:, 0] * np.sin(a) + N[:, 1] * np.cos(a))
    px, py, verschuiving = passend(V, N, F, r, m, vak, px, py, D, zicht_)
    binnen = ni.binary_erosion(m, iterations=1)
    in_masker = binnen[np.clip(py.round().astype(int), 0, h - 1), np.clip(px.round().astype(int), 0, w - 1)]
    k = srgb_lin(bilineair(vak, px, py))
    return k, np.clip(facing, 0, 1) * zicht_ * in_masker, {'iou': round(iou, 3), 'schaal': round(s, 1), 'zichtbaar': int((zicht_ & in_masker & (facing > 0.05)).sum()), 'vervorming_p95_px': verschuiving}


def vul_gaten(kleur, bekend, F, stappen=60):
    """Waar geen enkele richting bij kon (onder de arm, tussen de benen): de kleur van de buren."""
    n = len(kleur)
    r = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
    k = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = coo_matrix((np.ones(len(r), dtype=np.float32), (r, k)), shape=(n, n)).tocsr()
    S = diags(1.0 / np.maximum(np.asarray(A.sum(1)).ravel(), 1.0)) @ A
    u = kleur.copy()
    for _ in range(stappen):
        v = S @ u
        u[~bekend] = v[~bekend]
    return u


def klasse(k):
    """De grote kleurvlakken: 1 blauw, 2 geel, 0 de rest (leer, huid, staal). Op lineaire kleur."""
    uit = np.zeros(len(k), dtype=np.int8)
    uit[k[:, 2] > 1.4 * k[:, 0]] = 1
    uit[(k[:, 0] > 1.6 * k[:, 2]) & (k[:, 1] > 0.42 * k[:, 0]) & (k.max(1) > 0.22)] = 2
    return uit


def projecteer(V, F, richtingen=tuple(RICHTINGEN), scherpte=SCHERPTE):
    N = M.normalen(V, F)
    alles, gewicht, info = {}, {}, {}
    schaal = gedeelde_schaal(V, richtingen)
    for r in richtingen:
        alles[r], gewicht[r], info[r] = per_richting(V, F, r, N, schaal)
    som, tel = np.zeros_like(V), np.zeros(len(V))
    # Z en N bepalen het ontwerp: op de plaat staan in W en O de armen anders. Ziet Z of N een punt ook maar scheef, dan moet de kleur van W of O in hetzelfde kleurvlak vallen
    ontwerp = np.full(len(V), -1, dtype=np.int8)
    beste = np.zeros(len(V))
    for r in ('Z', 'N'):
        if r in richtingen:
            nieuw = gewicht[r] > np.maximum(beste, HI.BRON['ontwerp_drempel'])
            ontwerp[nieuw] = klasse(alles[r])[nieuw]
            beste[nieuw] = gewicht[r][nieuw]
    # op de plaat met de andere armen: wat Z en N niet zien, krijgt het kleurvlak van zijn buren, zodat de buitenkant van de arm mouw blijft
    if HI.BRON.get('ontwerp_buren') and (ontwerp < 0).any() and (ontwerp >= 0).any():
        n = len(V)
        r_ = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
        k_ = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
        A = coo_matrix((np.ones(len(r_), dtype=np.float32), (r_, k_)), shape=(n, n)).tocsr()
        heet = np.zeros((n, 3), dtype=np.float32)
        heet[ontwerp >= 0, ontwerp[ontwerp >= 0]] = 1.0
        for _ in range(90):
            buur = A @ heet
            leeg = ontwerp < 0
            heet[leeg] = buur[leeg] / np.maximum(buur[leeg].sum(1, keepdims=True), 1e-6)
        ontwerp = heet.argmax(1).astype(np.int8)
    # de richtingen stemmen over het kleurvlak: een kleine verschuiving legt anders de rok op de hand
    stem = np.zeros((len(V), 3))
    for r in richtingen:
        np.add.at(stem, (np.arange(len(V)), klasse(alles[r])), gewicht[r] ** 2 * HI.BRON['vertrouwen'].get(r, 1.0))
    meerderheid = stem.argmax(1)
    for r in richtingen:
        w = (gewicht[r] * HI.BRON['vertrouwen'].get(r, 1.0)) ** scherpte
        if not HI.BRON.get('ontwerp_buren'):
            w = w * (klasse(alles[r]) == meerderheid)
        if HI.BRON['ontwerp_filter'] and r not in ('Z', 'N'):
            w = w * ((ontwerp < 0) | (klasse(alles[r]) == ontwerp))
        som += alles[r] * w[:, None]
        tel += w
    bekend = tel > 1e-12
    kleur = np.zeros_like(V)
    kleur[bekend] = som[bekend] / tel[bekend, None]
    kleur = vul_gaten(kleur, bekend, F)
    # wat geen richting ziet, wijst meestal omlaag (onder de helmrand, onder de rok): daar hoort schaduw, geen licht van de buren
    kleur[~bekend] *= (1 - 0.7 * np.clip(-N[~bekend, 2], 0, 1))[:, None]
    return kleur, alles, gewicht, info, N, bekend


def licht_van_de_plaat(alles, gewicht, N, r='Z'):
    """Het licht op de plaat, geschat uit de plaat zelf: per stofkleur de helderheid tegen de normaal (in beeld: x rechts, y naar de camera, z omhoog)."""
    a = np.radians(RICHTINGEN[r])
    nx = N[:, 0] * np.cos(a) - N[:, 1] * np.sin(a)
    ny = -(N[:, 0] * np.sin(a) + N[:, 1] * np.cos(a))
    k = alles[r]
    w = gewicht[r] > 0.3
    uit = {}
    for naam, m in (('blauw', k[:, 2] > 1.6 * k[:, 0]), ('geel', (k[:, 0] > 2.0 * k[:, 2]) & (k[:, 1] > 0.25))):
        s = w & m
        if s.sum() < 500:
            continue
        L = k[s].mean(1)
        A = np.stack([nx[s], ny[s], N[s, 2], np.ones(s.sum())], axis=1)
        c, *_ = np.linalg.lstsq(A, L, rcond=None)
        rest = L - A @ c
        d = c[:3]
        uit[naam] = {'richting': (d / np.linalg.norm(d)).round(3).tolist(), 'sterkte': round(float(np.linalg.norm(d)), 3), 'basis': round(float(c[3]), 3), 'punten': int(s.sum()), 'R2': round(float(1 - rest.var() / L.var()), 3)}
    return uit


def verf_op_vorm(V, F, e, masker_van, richtingen=('Z', 'W', 'N', 'O'), scherpte=SCHERPTE, schaal_zoek=(0.86, 1.2)):
    """De verf van de plaat op een los onderdeel met echte vorm: dat staat wel in het echt in de ruimte, dus deze camera heeft de hoek van de plaat. masker_van(r) geeft het masker van het onderdeel op de plaat."""
    N = M.normalen(V, F)
    som, tel = np.zeros_like(V), np.zeros(len(V))
    info = {}
    for r in richtingen:
        vak = np.asarray(HI.ref_vak(r), dtype=np.float32) / 255.0
        m = masker_van(r)
        X, Y, D = zicht(V, RICHTINGEN[r], e)
        midden = HI.BRON['met_speer'] / 1.72
        iou, (s, tx, ty) = registreer(X, Y, m, np.arange(schaal_zoek[0] * midden, schaal_zoek[1] * midden, 0.012 * midden))
        px, py = X * s + tx, -Y * s + ty
        h, w_ = m.shape
        ix, iy = np.clip((px * 2).astype(int), 0, 2 * w_ - 1), np.clip((py * 2).astype(int), 0, 2 * h - 1)
        zb = np.full((2 * h, 2 * w_), -1e9)
        np.maximum.at(zb, (iy, ix), D)
        zb = ni.maximum_filter(zb, size=3)
        zichtbaar = D >= zb[iy, ix] - 0.012
        a = np.radians(RICHTINGEN[r])
        ec, es = np.cos(np.radians(e)), np.sin(np.radians(e))
        facing = -(N[:, 0] * np.sin(a) + N[:, 1] * np.cos(a)) * ec + N[:, 2] * es
        g = np.clip(facing, 0, 1) * zichtbaar
        k = srgb_lin(bilineair(vak, px, py))
        w = g ** scherpte
        som += k * w[:, None]
        tel += w
        info[r] = {'iou': round(iou, 3), 'schaal': round(s, 1)}
    bekend = tel > 1e-12
    kleur = np.zeros_like(V)
    kleur[bekend] = som[bekend] / tel[bekend, None]
    return vul_gaten(kleur, bekend, F), info
