# Hunyuan3D-2mv: van ruwe mesh naar een bewerkte speerman, in één herhaalbare stap uit een configuratie (`hy_config.json`). De bewerkingen staan los aan of uit,
# zodat elke proef één ding verandert. De ruwe GLB blijft staan.
#
#   python hy_bouw.py <config.json> <variant> <uitmap>
# naar <uitmap>/<variant>.npz (V, F, kleur, ruw, metaal), <variant>.glb en <variant>.json. De punten staan in meters: de figuur van helm tot zool is `figuur_m`, de as op x=y=0, de zolen op z=0.
import json
import math
import os
import sys
import time

import numpy as np
from scipy.sparse import coo_matrix, diags

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_kleur as K  # noqa: E402
import hy_mesh as M  # noqa: E402


def buren(n, F):
    r = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
    k = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = coo_matrix((np.ones(len(r), dtype=np.float32), (r, k)), shape=(n, n)).tocsr()
    A.data[:] = 1.0
    return diags(1.0 / np.maximum(np.asarray(A.sum(1)).ravel(), 1.0)) @ A


def glad(u, S, stappen):
    for _ in range(stappen):
        u = 0.5 * u + 0.5 * (S @ u)
    return u


# --- de vorm ------------------------------------------------------------------------------------------------------------------------

def kegel(V, m, c):
    """De schuine plaat eruit: z = (z_mesh + s*rho)/cos, met een sterkte die met de hoogte mee mag lopen (`profiel`: hoogte als deel van de figuur, factor)."""
    s0 = -m['zool_helling'] if c.get('sin_e') is None else c['sin_e']
    z0 = V[:, 2].min()
    zt = z0 + m['helm_top_z']
    t = (V[:, 2] - z0) / (zt - z0)
    p = np.array(c['profiel'], dtype=np.float64)
    s = np.interp(t, p[:, 0], p[:, 1]) * s0
    rho = np.linalg.norm(V[:, :2] - np.array(m['as_xy']), axis=1)
    U = V.copy()
    U[:, 2] = (V[:, 2] + s * rho) / np.sqrt(1 - s * s)
    return U, float(s0)


def plat_op_de_grond(V, F, c):
    """De zolen op de grond: per voet het vlak van de zool, en dat scheef weg, onderaan helemaal en bij de knie niets meer. Dat is een rechte scheefstelling, dus de laars blijft heel. In meters."""
    z0 = V[:, 2].min()
    H = V[:, 2].max() - z0
    N = M.normalen(V, F)
    zool = (V[:, 2] < z0 + c['zool'] * H) & (N[:, 2] < -0.35)
    U = V.copy()
    info = []
    # twee voeten: de scheiding is de grootste lege strook in x, onder in de figuur
    xs = np.sort(V[zool, 0])
    gat = np.argmax(np.diff(xs))
    midden = (xs[gat] + xs[gat + 1]) / 2
    for kant in (-1, 1):
        s = zool & (np.sign(V[:, 0] - midden) == kant)
        if s.sum() < 50:
            continue
        A = np.stack([V[s, 0], V[s, 1], np.ones(s.sum())], axis=1)
        co, *_ = np.linalg.lstsq(A, V[s, 2], rcond=None)
        # de hoogte van het vlak op elke plek, ten opzichte van de grond
        vlak = co[0] * V[:, 0] + co[1] * V[:, 1] + co[2] - z0
        hier = np.sign(V[:, 0] - midden) == kant
        w_ = np.clip(1 - (V[:, 2] - z0) / (c['tot'] * H), 0, 1)
        w_ = w_ * w_ * (3 - 2 * w_)
        U[hier, 2] = V[hier, 2] - vlak[hier] * w_[hier]
        info.append({'kant': kant, 'helling': [round(float(co[0]), 3), round(float(co[1]), 3)]})
    z = U[:, 2].min()
    U[:, 2] -= z - 0.0
    return U, info


# --- de speer -----------------------------------------------------------------------------------------------------------------------

def hout_van_de_mesh(V, kleur, m):
    """De kleur van de schacht: de helderste helft van de bonte punten op de schacht, onder de vuist."""
    _, _, r, rs, _ = lijn_speer(V, m)
    z0, H = V[:, 2].min(), m['hoogte']
    s = (r < rs) & (V[:, 2] > z0 + 0.1 * H) & (V[:, 2] < z0 + 0.3 * H)
    k = kleur[s]
    k = k[(k.max(1) - k.min(1)) > 0.5 * k.max(1)]
    return np.median(k[k.max(1) >= np.median(k.max(1))], axis=0)


def lijn_speer(V, m):
    """De lijn van de speer: alleen de punten boven de helm en onder de rok, want daar staat hij vrij; daarna nog tweemaal bijgesteld."""
    z0, H = V[:, 2].min(), m['hoogte']
    xy = np.array(m['speer_xy'])
    a = np.zeros(2)
    rs = 0.05 * H
    for _ in range(3):
        d = np.linalg.norm(V[:, :2] - (xy + a * (V[:, 2:3] - (z0 + H))), axis=1)
        zone = ((V[:, 2] > z0 + 0.84 * H) | (V[:, 2] < z0 + 0.24 * H)) & (d < rs)
        A = np.stack([V[zone, 2] - (z0 + H), np.ones(zone.sum())], axis=1)
        c, *_ = np.linalg.lstsq(A, V[zone, :2], rcond=None)
        a, xy = c[0], c[1]
        rs = max(0.022 * H, 0.75 * rs)
    r = np.linalg.norm(V[:, :2] - (xy + a * (V[:, 2:3] - (z0 + H))), axis=1)
    schacht = V[:, 2] < z0 + 0.84 * H
    r_schacht = float(np.percentile(r[(r < rs * 1.4) & (V[:, 2] > z0 + 0.3 * H) & (V[:, 2] < z0 + 0.84 * H) & ((V[:, 2] < z0 + 0.42 * H) | (V[:, 2] > z0 + 0.66 * H))], 88))
    return xy, a, r, r_schacht, schacht


def snij_speer(V, F, kleur, m, c_vuist=0.5):
    """Haalt de speer uit de mesh (behalve in de hand, want daar zit de vuist eraan vast), en geeft de lijn en maten voor een nieuwe."""
    z0, H = V[:, 2].min(), m['hoogte']
    xy, a, r, rs, _ = lijn_speer(V, m)
    weg = r < rs * 1.5
    weg |= (V[:, 2] > z0 + 0.84 * H) & (r < 0.12 * H)  # het blad, en de koker eronder
    weg &= V[:, 2] > z0 + 0.1 * H  # niet door de laars: het stompje blijft binnen de nieuwe schacht
    # de vuist blijft heel: op de hoogte waar de mesh rondom de schacht zit, wordt niets weggesneden; de nieuwe schacht loopt er dunner doorheen
    xyl = np.array(xy) + np.array(a) * (V[:, 2:3] - (z0 + H))
    hoek = np.arctan2(V[:, 1] - xyl[:, 1], V[:, 0] - xyl[:, 0])
    schil = (r > rs * 1.5) & (r < rs * 3.4)
    bak = ((V[:, 2] - z0) / H * 80).astype(int)
    vak_h = ((hoek + np.pi) / (2 * np.pi) * 12).astype(int) % 12
    dekking = np.zeros(82)
    for b in range(82):
        dekking[b] = len(np.unique(vak_h[schil & (bak == b)])) / 12
    vuist = dekking > c_vuist
    zones = [i for i in range(82) if vuist[i] and 0.3 * 80 < i < 0.8 * 80]
    if zones:
        # de hand is hooguit zo'n 7 procent van de hoogte: de langste aaneengesloten zone, en daarvan het midden
        groepen = np.split(np.array(zones), np.nonzero(np.diff(zones) > 1)[0] + 1)
        g_ = max(groepen, key=len)
        hm = (g_[0] + g_[-1] + 1) / 2 / 80 * H + z0
        h0, h1 = hm - 0.04 * H, hm + 0.04 * H
        weg &= ~((V[:, 2] > h0) & (V[:, 2] < h1))
    else:
        h0, h1 = None, None
    hou = ~weg
    Fk = F[hou[F].all(1)]
    # de grootste delen blijven; kruimels van de oude speer gaan weg
    lab = M.stukken(len(V), Fk)
    tel = np.bincount(lab[np.unique(Fk)], minlength=lab.max() + 1)
    goed = tel >= max(600, 0.01 * len(V))
    Fk = Fk[goed[lab[Fk[:, 0]]]]
    gebruikt = np.unique(Fk)
    nieuw = -np.ones(len(V), dtype=np.int64)
    nieuw[gebruikt] = np.arange(len(gebruikt))
    return gebruikt, nieuw[Fk], {'xy_top': xy.tolist(), 'helling': a.tolist(), 'straal': rs, 'top_z': float(z0 + H), 'weg_punten': int(len(V) - len(gebruikt)), 'vuist_z': [h0, h1]}


def maak_speer(c, voet, top, straal, wit_hout, staal, zaad=192):
    """Een speer als los ding: één schacht van hout, een koker, een bladvormige punt en een hak, langs de lijn voet-top. Punten, vlakken en per punt kleur, ruwheid en metaal."""
    as_ = top - voet
    L = np.linalg.norm(as_)
    e3 = as_ / L
    e1 = np.cross(e3, [0.0, 1.0, 0.0])
    e1 /= np.linalg.norm(e1)
    e2 = np.cross(e3, e1)
    # (t als deel van de lengte, straal in e1, straal in e2, soort): 0 hout, 1 staal
    n_blad, r_koker = c['blad'], straal * c['koker']
    b0 = 1.0 - n_blad
    koker = c['koker_lang']
    pro = [(0.0, straal * .55, straal * .55, 1), (0.004, straal * 1.05, straal * 1.05, 1), (0.04, straal * 1.05, straal * 1.05, 1), (0.041, straal, straal, 0),
           (b0 - koker, straal * .92, straal * .92, 0), (b0 - koker + .001, r_koker, r_koker, 1), (b0 - .004, r_koker, r_koker, 1), (b0, r_koker * .8, r_koker * .8, 1)]
    breed, dik = c['blad_breed'], c['blad_dik']
    for f, bb in ((0.0, .2), (0.07, .62), (0.2, 1.0), (0.42, .78), (0.68, .42), (0.9, .12), (1.0, .002)):
        pro.append((b0 + n_blad * f, breed * bb, max(dik * bb, .002) * (.55 + .45 * bb), 2))
    # de schacht in ringen, zodat de nerf over de lengte kan lopen
    extra = [(float(t_), straal - (straal - straal * .92) * (t_ - .041) / max(b0 - koker - .041, 1e-3), straal - (straal - straal * .92) * (t_ - .041) / max(b0 - koker - .041, 1e-3), 0) for t_ in np.arange(0.06, b0 - koker - 0.005, 0.012)]
    pro = sorted(pro[:4] + extra + pro[4:], key=lambda r_: r_[0])
    Vn, Fn, Sn, Tn = [], [], [], []
    N = 24
    for i, (t, r1, r2, so) in enumerate(pro):
        for j in range(N):
            f = 2 * math.pi * j / N
            if so == 2:
                # het blad is een ruit in doorsnede, met een rug in het midden: dat vangt het licht zoals op de plaat
                cf, sf = math.cos(f), math.sin(f)
                d_ = 1.0 / max(abs(cf) / max(r1, 1e-5) + abs(sf) / max(r2, 1e-5), 1e-5)
                Vn.append(voet + as_ * t + e1 * d_ * cf + e2 * d_ * sf)
            else:
                Vn.append(voet + as_ * t + e1 * r1 * math.cos(f) + e2 * r2 * math.sin(f))
            Sn.append(1 if so else 0)
            Tn.append(t)
    for i in range(len(pro) - 1):
        for j in range(N):
            a, b = i * N + j, i * N + (j + 1) % N
            Fn += [[a, b, a + N], [b, b + N, a + N]]
    Vn = np.array(Vn)
    Vn = np.vstack([Vn, voet, top])
    k0, k1 = len(Vn) - 2, len(Vn) - 1
    for j in range(N):
        Fn.append([j, k0, (j + 1) % N])
        Fn.append([(len(pro) - 1) * N + j, (len(pro) - 1) * N + (j + 1) % N, k1])
    Sn = np.array(Sn + [1, 1])
    Tn = np.array(Tn + [0.0, 1.0])
    rng = np.random.default_rng(zaad)
    # de nerf: per kant een eigen tint die langzaam over de lengte verloopt, met donkere strepen, net als de geschilderde schacht op de plaat
    kant = rng.normal(0, 0.16, N)
    kant = kant + 0.5 * np.roll(kant, 1)
    fase = rng.uniform(0, 6.28, N)
    j_ = np.arange(len(Vn)) % N
    tint = 1 + kant[j_] + 0.14 * np.sin(Tn * 34 + fase[j_]) + 0.1 * np.sin(j_ * 2 * math.pi / N - 0.9)
    kl = np.where(Sn[:, None] == 1, np.array(staal), np.array(wit_hout) * tint[:, None])
    ruw = np.where(Sn == 1, c['staal_ruw'], 0.6)
    met = np.where(Sn == 1, 1.0, 0.0)
    return Vn, np.array(Fn), kl, ruw, met


# --- de helm ------------------------------------------------------------------------------------------------------------------------

def maak_helm(c):
    """Een stalen ketelhoed als los ding: kroon met knop en vier ribben, een band en een platte rand met dikte. Rond, dicht en met echte hoeken; de top op (0, 0, 0), de rand onder z = 0. De verf komt van de plaat."""
    Rr, Rk, Hk, band = c['rand_m'], c['kroon_m'], c['kroon_h'], c['band_h']
    knop, knop_r = c['knop_h'], c['knop_r']
    pro = [(1e-4, -Hk - band - 0.014), (Rr * .55, -Hk - band - 0.012), (Rr - 0.006, -Hk - band - 0.012 - 0.018), (Rr, -Hk - band - 0.024), (Rr + 0.002, -Hk - band - 0.016), (Rr - 0.006, -Hk - band - 0.011), (Rr * .80, -Hk - band + 0.002), (Rk + 0.012, -Hk - band + 0.01), (Rk + 0.008, -Hk - band + 0.012), (Rk + 0.008, -Hk + 0.002), (Rk + 0.001, -Hk + 0.004)]
    for f in np.linspace(0.04, 0.96, 34):
        fi = f * np.pi / 2
        pro.append((max(Rk * np.cos(fi), knop_r * 0.92), -Hk + Hk * np.sin(fi) ** 0.9 * (1 - knop / Hk) + 0.004))
    z_kn = pro[-1][1]
    pro += [(knop_r, z_kn + 0.003), (knop_r * .98, z_kn + knop * .5), (knop_r * .66, z_kn + knop * .86), (1e-4, z_kn + knop)]
    # meer ringen, zodat de verf van de plaat scherp blijft
    pro = np.array(pro)
    t_ = np.concatenate([[0], np.cumsum(np.hypot(*np.diff(pro, axis=0).T))])
    t2 = np.linspace(0, t_[-1], c.get('ringen', 200))
    t2 = np.unique(np.concatenate([t2, t_]))
    r2, z2 = np.interp(t2, t_, pro[:, 0]), np.interp(t2, t_, pro[:, 1])
    N = c.get('rond', 300)
    th = np.linspace(0, 2 * np.pi, N, endpoint=False)
    V = []
    for r, z in zip(r2, z2):
        kroon = (z > -Hk) & (r > knop_r)
        rib = 1 + (c['rib'] * np.exp(-(((np.mod(th + np.pi / 4, np.pi / 2) - np.pi / 4)) / 0.055) ** 2) if kroon else 0)
        V.append(np.stack([r * rib * np.cos(th), r * rib * np.sin(th), np.full(N, z)], axis=1))
    V = np.concatenate(V)
    n_r = len(r2)
    i, j = np.meshgrid(np.arange(n_r - 1), np.arange(N), indexing='ij')
    a, b, cc, d = i * N + j, i * N + (j + 1) % N, (i + 1) * N + j, (i + 1) * N + (j + 1) % N
    # de kant op: van onder naar boven tegen de klok in, dus de normalen wijzen naar buiten
    F = np.concatenate([np.stack([a, b, d], -1).reshape(-1, 3), np.stack([a, d, cc], -1).reshape(-1, 3)])
    k = np.radians(c['kanteling'])  # achterover: de voorkant (-y) omhoog
    Rx = np.array([[1, 0, 0], [0, np.cos(k), -np.sin(k)], [0, np.sin(k), np.cos(k)]])
    return V @ Rx.T, F


def maak_hoofd(c, kleur):
    """Wat onder de nieuwe helm ontbreekt: het hoofd zat aan de oude helm vast. Een eenvoudige ovaal in de kleur van het haar, grotendeels onder de rand."""
    N, M_ = 48, 28
    fi = np.linspace(0, 2 * np.pi, N, endpoint=False)
    th = np.linspace(0.02, np.pi - 0.02, M_)
    rx, ry, rz = c['hoofd_ovaal']
    V = np.concatenate([np.stack([rx * np.sin(a) * np.cos(fi), ry * np.sin(a) * np.sin(fi), np.full(N, rz * np.cos(a))], 1) for a in th])
    i, j = np.meshgrid(np.arange(M_ - 1), np.arange(N), indexing='ij')
    a, b, cc, d = i * N + j, i * N + (j + 1) % N, (i + 1) * N + j, (i + 1) * N + (j + 1) % N
    F = np.concatenate([np.stack([a, cc, d], -1).reshape(-1, 3), np.stack([a, d, b], -1).reshape(-1, 3)])
    return V, F, np.tile(np.array(kleur), (len(V), 1))


def speer_masker(r):
    """De speer op de plaat: wat dun is, dus het masker zonder de romp. De grootste vorm."""
    from scipy import ndimage as ni
    m = K.HI.vrijstaand(r)[1]
    s = m & ~ni.binary_dilation(K.HI.P4.dun_weg(m), iterations=1)
    lab, n = ni.label(s)
    if n == 0:
        return s
    return lab == (np.argmax(ni.sum(s, lab, range(1, n + 1))) + 1)


def helm_masker(r):
    """Het staal van de helm op de plaat: het bovenste deel van de romp, zonder wat bont is, de grootste vorm, dicht."""
    from scipy import ndimage as ni
    rgba, m = K.HI.vrijstaand(r)
    a = rgba[..., :3].astype(np.float32)
    romp = K.HI.P4.dun_weg(m)
    ys = np.nonzero(romp.any(1))[0]
    H = ys.max() - ys.min()
    boven = np.zeros_like(romp)
    boven[ys.min():ys.min() + int(0.34 * H)] = True
    s = romp & boven & ((a.max(-1) - a.min(-1)) < 42)
    s = ni.binary_opening(s, iterations=2)
    lab, n = ni.label(s)
    s = lab == (np.argmax(ni.sum(s, lab, range(1, n + 1))) + 1)
    return ni.binary_fill_holes(ni.binary_closing(s, iterations=3))


def snij_helm(V, F, kleur, c, top_z):
    """Haalt de gereconstrueerde helm weg: alles boven het vlak van de nieuwe rand, en de neerhangende rand eromheen. De nieuwe helm dekt de snede af."""
    k = math.tan(math.radians(c['kanteling']))
    z_rand = top_z + c.get('dz', 0.0) - c['kroon_h'] - c['band_h'] - c['knop_h']
    vlak = z_rand - V[:, 1] * k - c['snij_marge']
    weg = V[:, 2] > vlak
    # de oude rand die onder het vlak hangt: staal is grijs, en de huid en de kraag zijn dat niet
    mx, mn = kleur.max(1), kleur.min(1)
    weg |= (V[:, 2] > vlak - c['rand_zak']) & ((mx - mn) / np.maximum(mx, 1e-4) < c['grijs']) & (mx > c['grijs_licht'])
    hou = ~weg
    Fk = F[hou[F].all(1)]
    lab = M.stukken(len(V), Fk)
    tel = np.bincount(lab[np.unique(Fk)], minlength=lab.max() + 1)
    Fk = Fk[(tel >= 400)[lab[Fk[:, 0]]]]
    gebruikt = np.unique(Fk)
    nieuw = -np.ones(len(V), dtype=np.int64)
    nieuw[gebruikt] = np.arange(len(gebruikt))
    return V[gebruikt], nieuw[Fk], kleur[gebruikt], gebruikt


# --- de verf ------------------------------------------------------------------------------------------------------------------------

def soorten(kleur, t):
    """Welk materiaal een punt heeft, uit zijn kleur en hoogte (t: 0 de zolen, 1 de top van de helm). Geeft ruwheid en metaal."""
    r, g, b = kleur[:, 0], kleur[:, 1], kleur[:, 2]
    mx, mn = kleur.max(1), kleur.min(1)
    sat = (mx - mn) / np.maximum(mx, 1e-4)
    staal = (sat < 0.32) & (t > 0.66)                  # helm
    gesp = (sat < 0.25) & (t > 0.34) & (t < 0.5) & (mx > 0.25)
    blauw = b > 1.3 * r
    geel = (r > 1.5 * b) & (g > 0.42 * r) & (mx > 0.22)
    leer = ~staal & ~gesp & ~blauw & ~geel & (mx < 0.26)
    ruw = np.full(len(kleur), 0.72)
    met = np.zeros(len(kleur))
    ruw[blauw | geel] = 0.82
    ruw[leer] = 0.48
    ruw[staal | gesp] = 0.36
    met[staal | gesp] = 1.0
    return ruw, met, {'staal': int(staal.sum()), 'gesp': int(gesp.sum()), 'blauw': int(blauw.sum()), 'geel': int(geel.sum()), 'leer': int(leer.sum())}


def zonder_licht(kleur, F, c):
    """Het geschilderde licht uit de kleur, voor wie echt licht wil gebruiken: per kleurvlak de helderheid gelijkmaken over een grote schaal. Fijne lijnen en de stof blijven, groot licht en schaduw gaan eruit."""
    S = buren(len(kleur), F)
    L = np.maximum(kleur.mean(1), 1e-4)
    Lg = glad(np.log(L), S, c['schaal'])
    kl = K.klasse(kleur)
    mx, mn = kleur.max(1), kleur.min(1)
    grijs = (mx - mn) / np.maximum(mx, 1e-4) < 0.3
    groep = kl.astype(np.int64) + 3 * grijs.astype(np.int64)
    uit = kleur.copy()
    for g in np.unique(groep):
        s = groep == g
        doel = np.median(Lg[s])
        uit[s] *= np.exp((doel - Lg[s]) * c['sterkte'])[:, None]
    return np.clip(uit, 0, 1)


# --- de detailpass ------------------------------------------------------------------------------------------------------------------

def detailpass(V, F, kleur, c):
    """Fijne vorm uit de plaat: wat op de plaat een donkere lijn is (naad, klinknagel, quilt, riemrand), wordt een groef, en wat licht is, een bolling. Eerst de putjes eruit (die zijn van de meshing), dan de reliëf.
    Hoogdoorlaat op de helderheid langs het oppervlak: groot licht en schaduw vallen af, dus de verf bepaalt de reliëf niet meer dan de lijnen op de plaat."""
    S = buren(len(V), F)
    N = M.normalen(V, F)
    # de putjes: alleen naar buiten duwen waar het punt lager ligt dan zijn gladde omgeving
    G = glad(V, S, c['glad'])
    d = ((G - V) * N).sum(1)
    U = V + N * np.clip(d, 0, c['put_max'])[:, None]
    L = kleur.mean(1)
    L = np.log(np.maximum(L, 0.01))
    hd = L - glad(L, S, c['hoogdoorlaat'])
    hd = np.clip(hd, -c['knip'], c['knip'])
    N2 = M.normalen(U, F)
    return U + N2 * (hd * c['sterkte'])[:, None], {'put_mm': round(float(np.percentile(np.clip(d, 0, None), 99) * 1000), 2), 'relief_mm': round(float(np.percentile(np.abs(hd * c['sterkte']), 99) * 1000), 2)}


def zonder_kraters(V, F, c):
    """Meer latents geven een scherpere vorm, maar ook kraters en spikes op vlakke stof. Wat ver van zijn gladde omgeving ligt, gaat naar die omgeving; randen van riem en tas liggen er dichter bij en blijven staan."""
    S = buren(len(V), F)
    G = glad(V, S, c['glad'])
    N = M.normalen(G, F)
    d = np.abs(((V - G) * N).sum(1))
    w_ = (d > c['drempel']).astype(np.float32)
    w_ = np.clip(glad(w_, S, c['rand']) * c['groei'], 0, 1)
    return V * (1 - w_[:, None]) + G * w_[:, None], {'punten': int((w_ > 0.5).sum()), 'p99_mm': round(float(np.percentile(d, 99) * 700), 1)}


def scherper(kleur, F, c):
    """Onscherp masker op de helderheid, over de mesh: de lijnen van de plaat (naad, quilt, klinknagel, riem) komen terug die bij het samplen zachter werden. De kleur zelf blijft."""
    S = buren(len(kleur), F)
    L = np.maximum(kleur @ np.array([0.2126, 0.7152, 0.0722]), 1e-4)
    log_l = np.log(L)
    d = np.clip(log_l - glad(log_l, S, c['stappen']), -c['knip'], c['knip'])
    return np.clip(kleur * np.exp(c['sterkte'] * d)[:, None], 0, 1)


def fijner(V, F, kenmerken):
    """Eén keer alle vlakken in vieren, met de kenmerken mee. De kleur van een punt op een rand is het gemiddelde; de reliëf volgt pas daarna."""
    e = np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]), axis=0 if False else 1)
    uniek, inv = np.unique(e, axis=0, return_inverse=True)
    inv = inv.ravel()
    n, m = len(V), len(F)
    mid = n + inv
    a, b, c = mid[:m], mid[m:2 * m], mid[2 * m:]
    Fn = np.vstack([np.stack([F[:, 0], a, c], 1), np.stack([a, F[:, 1], b], 1), np.stack([c, b, F[:, 2]], 1), np.stack([a, b, c], 1)])
    Vn = np.vstack([V, 0.5 * (V[uniek[:, 0]] + V[uniek[:, 1]])])
    uit = {k: np.concatenate([v, 0.5 * (v[uniek[:, 0]] + v[uniek[:, 1]])]) for k, v in kenmerken.items()}
    return Vn, Fn, uit


# --- samen --------------------------------------------------------------------------------------------------------------------------

def main():
    cfg = json.load(open(sys.argv[1], encoding='utf-8'))
    naam, uit = sys.argv[2], sys.argv[3]
    c = {**cfg['basis'], **cfg['varianten'][naam]}
    t0 = time.time()
    bron = c['bron'] if os.path.isabs(c['bron']) else os.path.join(uit, c['bron'])
    V0, F0 = M.lees_glb(bron)
    K.HI.kies(c.get('plaat', 'detail'))
    M.GEEN_SPEER = bool(K.HI.BRON.get('geen_speer'))
    if c.get('vormpas'):
        s_ = K.gedeelde_schaal(V0, tuple(c['kleur_richtingen']))
        V0, bewogen = K.vorm_naar_plaat(V0, tuple(c['kleur_richtingen']), s_, c['vormpas']['kracht'], c['vormpas'].get('glad'))
    # eerst fijner, dan pas de verf: de punten van de ruwe mesh liggen verder uit elkaar dan de pixels van de plaat, en dan worden de randen zacht en gekarteld
    for _ in range(c.get('fijner', 0)):
        V0, F0, _e = fijner(V0, F0, {})
    krater_log = None
    if c.get('kraters'):
        V0, krater_log = zonder_kraters(V0, F0, c['kraters'])
    m = M.maten(V0, F0)
    log = {'variant': naam, 'bron': c['bron'], 'maten_ruw': m, 'punten_ruw': len(V0), 'vlakken_ruw': len(F0), 'open_randen_ruw': M.open_randen(F0)}

    if krater_log:
        log['kraters'] = krater_log
    # de kleur op de ruwe mesh met een vlakke camera, waar hij het best samenvalt
    kleur, alles, gewicht, info, N, bekend = K.projecteer(V0, F0, tuple(c['kleur_richtingen']))
    log['registratie'] = info
    log['kleur_bekend'] = round(float(bekend.mean()), 3)
    log['licht_plaat_Z'] = K.licht_van_de_plaat(alles, gewicht, N, 'Z')
    log['pasmaat'] = K.pasmaat(alles, gewicht, tuple(c['kleur_richtingen']))
    # de plaat zelf heeft de maat: wit hout en staal voor de nieuwe speer, uit de punten die er nu zitten
    V, F = V0, F0
    if c.get('kegel'):
        V, s0 = kegel(V0, m, c['kegel'])
        log['kegel'] = {'sin_e': round(s0, 4), 'hoek': round(math.degrees(math.asin(s0)), 1), 'zool_helling_na': round(M.maten(V, F)['zool_helling'], 3)}
    # de maat: helm tot zool wordt figuur_m, de as op nul, de zolen op nul
    mk = M.maten(V, F)
    hout = None
    if c.get('speer'):
        hout = np.array(c['speer']['hout']) if c['speer'].get('hout') else hout_van_de_mesh(V0, kleur, m)
    speer_lijn = None
    if c.get('speer') and not M.GEEN_SPEER:
        gebruikt, Fk, sp = snij_speer(V0, F0, kleur, m)
        log['speer_uit'] = sp
        # de lijn in de ruwe mesh, en dezelfde punten na de kegel
        V, F, kleur = V[gebruikt], Fk, kleur[gebruikt]
        V0k = V0[gebruikt]
        zv = M.maten(V0k, Fk)
        speer_lijn = sp
    z0 = V[:, 2].min()
    # de top van de helm staat los van de speer: zonder speer is hij gewoon de hoogste, met speer staat hij in de maten
    ztop = V[:, 2].max() if (c.get('speer') or M.GEEN_SPEER) else z0 + mk['helm_top_z']
    schaal = c['figuur_m'] / (ztop - z0)
    as_xy = np.array(mk['as_xy'])
    V = np.stack([(V[:, 0] - as_xy[0]) * schaal, (V[:, 1] - as_xy[1]) * schaal, (V[:, 2] - z0) * schaal], axis=1)
    log['schaal'] = round(schaal, 4)
    if c.get('grond'):
        V, log['grond'] = plat_op_de_grond(V, F, c['grond'])
    V, F, e, gaten = M.dicht_gaten(V, F, {'kleur': kleur})
    kleur = e['kleur']
    log['gaten_dicht'] = gaten
    t = V[:, 2] / V[:, 2].max()
    ruw, met, tel = soorten(kleur, t)
    log['soorten'] = tel
    if c.get('rust'):
        S_ = buren(len(V), F)
        kleur = glad(kleur, S_, c['rust']['verf'])
        V = glad(V, S_, c['rust']['vorm'])
    if c.get('scherp'):
        kleur = scherper(kleur, F, c['scherp'])
    if c.get('detail'):
        V, d = detailpass(V, F, kleur, c['detail'])
        log['detail'] = d
    if c.get('ontlicht'):
        kleur = zonder_licht(kleur, F, c['ontlicht'])
    deel = None
    if c.get('helm'):
        h = c['helm']
        top_z = float(V[:, 2].max())
        V, F, kleur, gebruikt = snij_helm(V, F, kleur, h, top_z)
        ruw, met = ruw[gebruikt], met[gebruikt]
        V, F, e_, _ = M.dicht_gaten(V, F, {'kleur': kleur, 'ruw': ruw, 'met': met}, max_rand=6000)  # de snede onder de helm dicht: wat de nieuwe rand niet dekt, is dan donker haar
        kleur, ruw, met = e_['kleur'], e_['ruw'], e_['met']
        deel = np.zeros(len(V), dtype=np.int8)
        Vh, Fh = maak_helm(h)
        Vh = Vh + np.array([h.get('dx', 0.0), h.get('dy', 0.0), top_z + h.get('dz', 0.0)])
        kh, vinfo = K.verf_op_vorm(Vh, Fh, h['camera'], helm_masker)
        log['helm'] = {'punten': len(Vh), 'verf': vinfo}
        F = np.vstack([F, Fh + len(V)])
        V = np.vstack([V, Vh])
        kleur = np.vstack([kleur, kh])
        ruw, met = np.concatenate([ruw, np.full(len(Vh), 0.36)]), np.concatenate([met, np.ones(len(Vh))])
        deel = np.concatenate([deel, np.full(len(Vh), 1, dtype=np.int8)])
        Vo, Fo, ko = maak_hoofd(h, h['haar'])
        Vo = Vo + np.array([0.0, h['hoofd_y'], top_z + h.get('dz', 0.0) - h['kroon_h'] - h['band_h'] - h['knop_h'] - h['hoofd_z']])
        F = np.vstack([F, Fo + len(V)])
        V = np.vstack([V, Vo])
        kleur = np.vstack([kleur, ko])
        ruw, met = np.concatenate([ruw, np.full(len(Vo), 0.8)]), np.concatenate([met, np.zeros(len(Vo))])
        deel = np.concatenate([deel, np.full(len(Vo), 2, dtype=np.int8)])
    if deel is None:
        deel = np.zeros(len(V), dtype=np.int8)
    if c.get('speer'):
        # de nieuwe speer: door de vuist, in de hoek van de oude, van de grond tot de oude top. x en y na de maat, en op de hoogte van de oude verhouding
        lengte_m = c['speer']['lengte_x_figuur'] * c['figuur_m']
        if M.GEEN_SPEER:
            # de plaat heeft geen speer: door de rechterhand (in Z links in beeld), rechtop, met de hoek uit de config
            lijf = V[deel == 0]
            zij = lijf[(lijf[:, 0] < -0.2) & (lijf[:, 2] > 0.42)]
            hand = zij[zij[:, 2] < np.percentile(zij[:, 2], 12)].mean(0)
            schuin = np.array(c['speer'].get('schuin', [0.0, 0.0]))
            voet_xy = hand[:2] + np.array(c['speer'].get('hand_xy', [0.0, 0.0])) - schuin * hand[2]
            d = schuin * lengte_m
            log['hand_R'] = hand.round(3).tolist()
        else:
            s2 = speer_lijn
            H0 = m['hoogte']
            rt = np.array(s2['xy_top'])
            hel = np.array(s2['helling'])
            # de hand op de oude lijn: op de plek van de vuist is de speer de kleinste verschuiving; de lijn gaat door de oude xy
            voet_xy = (rt + hel * (m['helm_top_z'] * 0 - H0) - as_xy) * schaal
            top_xy = (rt - as_xy) * schaal
            d = top_xy - voet_xy
        d = d / max(np.linalg.norm(d), 1e-6) * min(np.linalg.norm(d), c['speer']['max_scheef'] * lengte_m)
        voet = np.array([voet_xy[0], voet_xy[1], c['speer']['voet_z']])
        top = voet + np.array([d[0], d[1], math.sqrt(max(lengte_m ** 2 - d @ d, 0.01))])
        straal = c['speer']['straal_m'] if c['speer'].get('straal_m') else speer_lijn['straal'] * schaal * 1.08
        Vs, Fs, ks, rs_, ms = maak_speer(c['speer'], voet, top, straal, np.clip(hout * c['speer'].get('hout_maal', 1.0), 0, 1), c['speer']['staal'])
        if c['speer'].get('verf'):
            kp, vi_ = K.verf_op_vorm(Vs, Fs, c['speer']['verf'], speer_masker, richtingen=tuple(c['speer'].get('verf_richtingen', ('Z', 'N'))), schaal_zoek=(0.92, 1.08))
            log['speer_verf'] = vi_
            ks = kp * c['speer'].get('verf_deel', 0.85) + ks * (1 - c['speer'].get('verf_deel', 0.85))
        F = np.vstack([F, Fs + len(V)])
        V = np.vstack([V, Vs])
        kleur = np.vstack([kleur, ks])
        ruw, met = np.concatenate([ruw, rs_]), np.concatenate([met, ms])
        deel = np.concatenate([deel, np.full(len(Vs), 3, dtype=np.int8)])
        log['speer_nieuw'] = {'lengte_m': round(float(lengte_m), 3), 'straal_m': round(float(straal), 4), 'voet': voet.round(3).tolist(), 'top': top.round(3).tolist()}
    echt = np.full(len(V), float(c.get('echt_licht', 0.0)), dtype=np.float32)
    if c.get('speer'):
        echt[-len(Vs):] = c['speer'].get('echt', 1.0)  # de speer heeft geen geschilderd licht, dus die krijgt (ook) het echte
    np.savez_compressed(os.path.join(uit, f'{naam}.npz'), V=V, F=F, kleur=kleur.astype(np.float32), ruw=ruw.astype(np.float32), metaal=met.astype(np.float32), echt=echt, deel=deel)
    M.schrijf_glb(os.path.join(uit, f'{naam}.glb'), V, F, kleur)
    log.update({'punten': len(V), 'vlakken': len(F), 'open_randen': M.open_randen(F), 'stukken': int(M.stukken(len(V), F).max()) + 1, 'figuur_m': c['figuur_m'], 'seconden': round(time.time() - t0, 1), 'config': c})
    json.dump(log, open(os.path.join(uit, f'{naam}.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(json.dumps({k: log[k] for k in ('variant', 'punten', 'vlakken', 'open_randen', 'stukken', 'schaal', 'seconden')}), json.dumps(log.get('kegel')), json.dumps(log.get('speer_nieuw')), json.dumps(log.get('detail')))


if __name__ == '__main__':
    main()
