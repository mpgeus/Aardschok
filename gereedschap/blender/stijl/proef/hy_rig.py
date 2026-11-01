# Hunyuan3D-2mv, de rig: de gewrichten gemeten op de mesh, de rok los van de benen, en de beweging van V4 (`hy_v4_pose.py`) erop. De botten heten en hangen zoals bij V4, met de rok als twee eigen botten, dus elke
# beweging van V4 past. Hoe: per bot de draaiing ten opzichte van de rust van V4 toepassen op de rust van deze mesh. De speer is een los ding: hij volgt de stand van de speer van V4 en zit vast aan de hand.
# Geen handwerk per figuur, behalve de maat van het wapen. De punten per beeld gaan als `Vf` naar een npz; hy_kijk.py rendert die (beelden=, houding=).
#
#   python hy_rig.py <variant.npz> <beweging.npz> <uitmap> [naam=rig] [verf=<kleur.npz van hy_paint.py>] [alleen_verf=1]
import json
import os
import sys

import numpy as np
from scipy.sparse import coo_matrix, diags
from scipy.spatial.transform import Rotation

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_kleur as K  # noqa: E402
import hy_mesh as M  # noqa: E402

MAX_BOTTEN = 4
ARM_STRAAL = 0.13
# De armen volgen de referentie en niet V4: de rechterhand houdt de speer op borsthoogte, de linkerarm hangt (de plaat, `aardschok-speerman-acht.png`). De rotaties van V4 gaven handen op de buik: zijn armen zijn anders
# dan deze. De plek van de speerhand staat in de rust van de mesh, en beweegt met de borst mee.
SPEERHAND = [-0.33, -0.19, 0.76]
ELLEBOOG_R = [-0.26, 0.12, -0.2]
ZWAAI_L = 0.32
ZWAAI_ELLEBOOG = 0.3
ZWAAI_SPEERHAND = 0.02
ZWAAI_VAST = 0.06
REIK = 0.97
HOOFD_ACHTEROVER = np.radians(8.0)
HANG_ARM = (0.1, 0.06, -1.0)
BOOG_ELLEBOOG = (0.2, 0.9, -0.2)
HANG_ELLEBOOG = (0.6, 0.8, 0.0)
ROK_MEE = 1.7
ELLEBOOG_TWEE = [0.3, -0.05, -0.2]
ELLEBOOG_TREK = [-0.35, 0.25, 0.02]


def buren(n, F):
    r = np.concatenate([F[:, 0], F[:, 1], F[:, 2], F[:, 1], F[:, 2], F[:, 0]])
    k = np.concatenate([F[:, 1], F[:, 2], F[:, 0], F[:, 0], F[:, 1], F[:, 2]])
    A = coo_matrix((np.ones(len(r), dtype=np.float32), (r, k)), shape=(n, n)).tocsr()
    A.data[:] = 1.0
    return diags(1.0 / np.maximum(np.asarray(A.sum(1)).ravel(), 1.0)) @ A


def seg_afstand(P, a, b):
    ab = b - a
    t = np.clip(((P - a) @ ab) / max(ab @ ab, 1e-9), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)


def plak(L, z, dik=0.008):
    return L[np.abs(L[:, 2] - z) < dik]


def maten_figuur(V, kleur, deel):
    """Zoom en riem uit de kleur, de benen en armen uit plakken door de mesh. Alles in meters, het gezicht naar -y."""
    lijf = deel == 0
    L, kl = V[lijf], K.klasse(kleur[lijf])
    H = L[:, 2].max()
    rok = kl > 0
    # blauw zit alleen op de rok en het lijf; bruin en oranje ook op de laarzen. Van de grootste plak blauw omlaag, tot het ophoudt: losse blauwe stippen onderaan tellen niet
    tel, randen = np.histogram(L[kl == 1, 2], bins=np.arange(0, H + 0.01, 0.01))
    i = int(np.argmax(tel))
    while i > 0 and tel[i - 1] >= 0.12 * tel.max():
        i -= 1
    zoom = float(randen[i])
    # de riem: tussen zoom en borst de plak waar de minste rokkleur zit, aan de voorkant
    voor = L[:, 1] < 0
    beste, riem = 2.0, zoom + 0.2
    for z in np.arange(zoom + 0.08, zoom + 0.42, 0.01):
        s = (np.abs(L[:, 2] - z) < 0.012) & voor & (np.abs(L[:, 0]) < 0.17)
        if s.sum() > 30 and rok[s].mean() < beste:
            beste, riem = float(rok[s].mean()), float(z)
    m = {'H': float(H), 'zoom': zoom, 'riem': riem}
    # de armen: ze raken het lijf in de mesh, dus de buitenkant per plak: de arm is de bult opzij
    ARM_DIK = 0.11
    for k, s in (('R', -1.0), ('L', 1.0)):
        kant = L[L[:, 0] * s > 0.05]
        rij = []
        for z in np.arange(zoom - 0.05, riem + 0.5, 0.012):
            p = plak(kant, z)
            if len(p) > 10:
                uit_ = float((p[:, 0] * s).max())
                a = p[p[:, 0] * s > uit_ - ARM_DIK]
                rij.append((float(z), uit_, float(a[:, 1].mean())))
        rij = np.array(rij)
        xm = rij[:, 1].max()
        onder = float(rij[rij[:, 1] > 0.78 * xm, 0].min())
        oksel = float(rij[rij[:, 1] > 0.72 * xm, 0].max()) - 0.06
        s_ = rij[(rij[:, 0] >= onder) & (rij[:, 0] <= oksel + 0.06)]
        lijn = np.stack([s_[:, 0], (s_[:, 1] - ARM_DIK / 2) * s, s_[:, 2]], axis=1)
        m['arm_' + k] = {'lijn': lijn.tolist(), 'oksel': oksel, 'onder': onder}
        hand_z = onder + 0.045
        pols_z = onder + 0.09
        schouder_z = oksel + 0.05
        hand_xy = lijn[np.abs(lijn[:, 0] - hand_z).argmin(), 1:]
        pols_xy = lijn[np.abs(lijn[:, 0] - pols_z).argmin(), 1:]
        elleboog_z = schouder_z - 0.5 * (schouder_z - pols_z)
        elleboog_xy = lijn[np.abs(lijn[:, 0] - elleboog_z).argmin(), 1:]
        boven_xy = lijn[-1, 1:]
        m['schouder.' + k] = [float(boven_xy[0] - s * 0.015), float(boven_xy[1]), schouder_z]
        m['elleboog.' + k] = [float(elleboog_xy[0]), float(elleboog_xy[1]), elleboog_z]
        m['pols.' + k] = [float(pols_xy[0]), float(pols_xy[1]), pols_z]
        m['hand.' + k] = [float(hand_xy[0]), float(hand_xy[1]), hand_z]
    # de benen
    for k, s in (('R', -1.0), ('L', 1.0)):
        b = L[(L[:, 0] * s > 0.0) & (L[:, 0] * s < 0.24)]
        knie_p = plak(b, zoom - 0.06, 0.012)
        enkel_p = plak(b, 0.13, 0.012)
        zool = b[b[:, 2] < 0.03]
        kx, ky = float(knie_p[:, 0].mean()), float(knie_p[:, 1].mean())
        ex, ey = float(enkel_p[:, 0].mean()), float(enkel_p[:, 1].mean())
        tx, ty = float(zool[:, 0].mean()), float(zool[:, 1].min())
        m['been.' + k] = {'knie_xy': [kx, ky], 'enkel_xy': [ex, ey], 'teen': [tx, ty]}
    return m


def gewrichten(m):
    """De kop van elk bot, in de namen van V4."""
    J = {}
    zoom, riem = m['zoom'], m['riem']
    heup = zoom + 0.10
    hoofd = m['H'] - 0.40
    J['wortel'] = [0, 0, 0]
    J['speer'] = [0, 0, 0]
    J['bekken'] = [0, 0, riem - 0.14]
    J['rug'] = [0, 0, riem - 0.02]
    J['borst'] = [0, 0.005, riem + 0.13]
    J['nek'] = [0, 0.005, max(m['schouder.R'][2], m['schouder.L'][2]) + 0.02]
    J['hoofd'] = [0, 0, max(hoofd, J['nek'][2] + 0.06)]
    J['rok.V'] = [0, -0.09, riem - 0.05]
    J['rok.A'] = [0, 0.09, riem - 0.05]
    J['buidel'] = [-0.18, -0.13, riem - 0.05]
    for k, s in (('R', -1.0), ('L', 1.0)):
        J['sleutel.' + k] = [s * 0.05, 0.005, m['schouder.' + k][2] - 0.01]
        J['bovenarm.' + k] = m['schouder.' + k]
        J['onderarm.' + k] = m['elleboog.' + k]
        J['hand.' + k] = m['pols.' + k]
        b = m['been.' + k]
        kx, ky = b['knie_xy']
        ex, ey = b['enkel_xy']
        kn_z = (heup + 0.12) / 2
        J['dij.' + k] = [kx * 0.95, 0.0, heup]
        J['scheen.' + k] = [(kx + ex) / 2, (ky + ey) / 2 - 0.005, kn_z]
        J['voet.' + k] = [ex, ey + 0.01, 0.11]
        J['teen.' + k] = [b['teen'][0], b['teen'][1] * 0.55 + ey * 0.45, 0.045]
    return {n: np.array(v, dtype=np.float64) for n, v in J.items()}


# het eind van elk bot, voor de gewichten
EINDE = {'bekken': 'rug', 'rug': 'borst', 'borst': 'nek', 'nek': 'hoofd', 'sleutel.R': 'bovenarm.R', 'bovenarm.R': 'onderarm.R', 'onderarm.R': 'hand.R', 'sleutel.L': 'bovenarm.L', 'bovenarm.L': 'onderarm.L', 'onderarm.L': 'hand.L',
         'dij.R': 'scheen.R', 'scheen.R': 'voet.R', 'voet.R': 'teen.R', 'dij.L': 'scheen.L', 'scheen.L': 'voet.L', 'voet.L': 'teen.L'}


def plooi(L, z0, z1, s):
    """De plooi tussen arm en lijf, per plak: de doorsnede is daar een pinda, en de plooi is waar hij in y het smalst is (een gat is breedte 0). Geeft een rij (z, x, verhouding hals/arm)."""
    rij = []
    for z in np.arange(z0, z1, 0.012):
        p = plak(L[L[:, 0] * s > 0.05], z, 0.006)
        if len(p) < 10:
            continue
        x, y = p[:, 0] * s, p[:, 1]
        uit_ = float(x.max())
        randen = np.arange(uit_ - 0.2, uit_ + 0.008, 0.008)
        midden = (randen[:-1] + randen[1:]) / 2
        i = np.digitize(x, randen) - 1
        br = np.array([np.ptp(y[i == j]) if (i == j).any() else 0.0 for j in range(len(midden))])
        kan = np.nonzero((midden > uit_ - 0.165) & (midden < uit_ - 0.045))[0]
        laag = kan[br[kan] <= br[kan].min() + 1e-6]
        j = int(laag[len(laag) // 2])
        rij.append((float(z), float(midden[j]), float(br[j] / max(br[j:].max(), 1e-3))))
    return np.array(rij)


HALS = 0.82


def arm_los(V, F, kleur, deel, m):
    """De arm los van het lijf, op vorm en niet op kleur: in de mesh zitten ze aan elkaar, en de binnenkant van de arm heeft soms de kleur van de rok. Geeft het masker, de vlakken zonder de snede, en de hoogte tot waar er gesneden is.
    De kant van de arm die de kleur van de rok heeft, krijgt de kleur van de rest van de arm: een plaat kan daar niet in kijken."""
    lijf = deel == 0
    L = V[lijf]
    arm = np.zeros(len(V), dtype=bool)
    z_boven = {}
    for k, s in (('R', -1.0), ('L', 1.0)):
        a = m['arm_' + k]
        r = plooi(L, a['onder'], a['oksel'] + 0.08, s)
        # de hals loopt vanaf de hand omhoog, tot hij verdwijnt in de schouder
        boven = r[:, 0].max()
        for i in range(int(np.argmin(np.abs(r[:, 0] - (a['oksel'] - 0.12)))), len(r)):
            if r[i, 2] > HALS:
                boven = r[i, 0]
                break
        z_boven[k] = float(boven)
        xs = r[:, 1].copy()
        for i in range(len(xs)):
            xs[i] = np.median(r[max(i - 2, 0):i + 3, 1])
        grens = np.interp(V[:, 2], r[:, 0], xs)
        kant = lijf & (V[:, 0] * s > grens) & (V[:, 2] >= a['onder'] - 0.005) & (V[:, 2] < boven)
        # alleen het grootste stuk is de arm: een reep rok die over de grens valt, hoort bij de rok
        lab = M.stukken(len(V), F[kant[F].all(1)])
        arm |= kant & (lab == np.argmax(np.bincount(lab[kant])))
    # de snede
    fa = arm[F]
    weg = fa.any(1) & (~fa).any(1) & lijf[F].all(1)
    return arm, F[~weg], z_boven, F[weg]


RITS_Z = 0.03
F_TYPE = np.int64


def rits_dicht(V, weg, arm, J):
    """De snede dicht, aan de arm en aan het lijf: de arm gaat ervan af en dan zie je erin. De mesh is niet overal twee-op-een (29.000 randen met meer dan twee vlakken), dus niet langs lussen van randen, maar op vorm: de punten van de snede
    gesorteerd op hoogte, de voorste en de achterste rij aan elkaar, van onder naar boven. Zo buigt de strook mee met de arm, en er komt geen punt bij."""
    uit_ = []
    for k, s in (('R', -1.0), ('L', 1.0)):
        for op_arm in (True, False):
            rand = np.unique(weg[arm[weg] == op_arm])
            rand = rand[V[rand, 0] * s > 0]
            if len(rand) < 3:
                continue
            z, y = V[rand, 2], V[rand, 1]
            bak = ((z - z.min()) / 0.012).astype(int)
            mid = np.zeros(bak.max() + 1)
            for b in np.unique(bak):
                mid[b] = np.median(y[bak == b])
            voor = rand[y < mid[bak]]
            achter = rand[y >= mid[bak]]
            a, b = voor[np.argsort(V[voor, 2])], achter[np.argsort(V[achter, 2])]
            i, j = 0, 0
            while i < len(a) - 1 or j < len(b) - 1:
                if j == len(b) - 1 or (i < len(a) - 1 and V[a[i + 1], 2] <= V[b[j + 1], 2]):
                    f = [a[i], a[i + 1], b[j]]
                    i += 1
                else:
                    f = [a[i], b[j + 1], b[j]]
                    j += 1
                # over het vrije stuk tussen arm en lijf geen strook
                if np.ptp(V[f, 2]) < RITS_Z:
                    uit_.append(f)
    uit_ = np.array(uit_, dtype=F_TYPE) if uit_ else np.zeros((0, 3), dtype=F_TYPE)
    # de goede kant op: weg van de as van de arm, of weg van het midden van het lijf
    p = V[uit_]
    n = np.cross(p[:, 1] - p[:, 0], p[:, 2] - p[:, 0])
    c = p.mean(1)
    if len(uit_):
        as_ = np.where(arm[uit_[:, 0]][:, None], np.stack([np.sign(c[:, 0]) * 0.26, 0 * c[:, 1], c[:, 2]], axis=1), np.stack([0 * c[:, 0], 0 * c[:, 1], c[:, 2]], axis=1))
        om = (n * (c - as_)).sum(1) < 0
        uit_[om] = uit_[om][:, [0, 2, 1]]
    return uit_


def arm_kleur(V, F, kleur, arm):
    """Wat op de arm de kleur van de rok heeft, krijgt de kleur van de arm eromheen."""
    fout = arm & (K.klasse(kleur) > 0)
    if not fout.any():
        return kleur
    uit_ = kleur.copy()
    uit_[fout] = np.median(kleur[arm & ~fout], axis=0)
    S = buren(len(V), F)
    for _ in range(40):
        U = S @ uit_
        uit_[fout] = U[fout]
    return uit_


RAND_STAPPEN = 12
ACHTER_ARM = 0.14
ACHTER_HAND = 0.17
RIEM_HALF = 0.04


def op_de_plaat(verf, kleur, klas, s):
    """De verf van het textuurmodel in de kleuren van de plaat: per kleurvlak de verhouding van de medianen, gemeten op wat de plaat wel zag en waar ze het eens zijn over het vlak (zijn rug is helemaal blauw, die van de plaat half geel)."""
    uit_ = verf.copy()
    plaat = K.klasse(kleur)
    for c in (0, 1, 2):
        v = klas == c
        b = v & ~s & (plaat == c)
        if b.sum() > 100:
            uit_[v] = verf[v] * (np.median(kleur[b], axis=0) / np.maximum(np.median(verf[b], axis=0), 1e-4))
    return np.clip(uit_, 0, 1)


def achter_de_arm(V, F, kleur, deel, m, arm, z_boven, verf=None, rand=None):
    """Wat de plaat niet zag: het lijf achter de arm. Daar staat nu de afdruk van de arm en de hand, en die blijft staan als de arm weggaat. Met het textuurmodel: zijn verf, in de kleuren van de plaat en met een zachte overgang. Zonder: de kleur van het dichtste punt dat wel te zien was."""
    from scipy.spatial import cKDTree
    lijf = deel == 0
    s = np.zeros(len(V), dtype=bool)
    for k in 'RL':
        a, b, c = (np.array(m[x + '.' + k]) for x in ('schouder', 'elleboog', 'hand'))
        d_ = np.minimum(seg_afstand(V, a, b), seg_afstand(V, b, c))
        s |= lijf & ~arm & (d_ < ACHTER_ARM) & (V[:, 2] < z_boven[k])
        s |= lijf & ~arm & (np.linalg.norm(V - c, axis=1) < ACHTER_HAND) & (V[:, 2] > m['zoom'] - 0.02)
    # het leer aan de voorkant zijn de buidel en de riemen: die zijn echt. Met het textuurmodel: alleen als hij daar ook leer ziet, anders is het de afdruk van de hand
    s &= ~((K.klasse(kleur) == 0) & (V[:, 1] < -0.07) & (verf is None or K.klasse(verf) == 0))
    if verf is not None:
        band = lijf & ~arm & (V[:, 2] > m['zoom'] - 0.05) & (V[:, 2] < max(z_boven.values()) + 0.04)
        klas = K.klasse(verf)
        # alleen op het lijf: zijn helm en gezicht zijn niet de onze
        nieuw = kleur.copy()
        nieuw[band] = op_de_plaat(verf[band], kleur[band], klas[band], s[band])
        S = buren(len(V), F)
        w_ = s.astype(np.float32)
        for _ in range(5):
            w_ = S @ w_
        w_ = np.maximum(w_, s * 1.0)[:, None] * band[:, None]
        # beide eerst op de goede helft: anders mengt de overgang blauw met geel tot groen
        kleur_h, _ = helften(V, kleur, deel, m, arm, z_boven)
        nieuw_h, _ = helften(V, nieuw, deel, m, arm, z_boven)
        uit_ = kleur_h * (1 - w_) + nieuw_h * w_
        # de binnenkant van de arm, langs de snede: daar zag de plaat ook niets
        r = np.zeros(len(V), dtype=np.float32)
        r[rand] = 1
        for _ in range(RAND_STAPPEN):
            r = S @ r
        a = arm & (r > 0.01)
        if a.any():
            arm_nieuw = op_de_plaat(verf[arm], kleur[arm], klas[arm], a[arm])
            g = np.clip(r[arm] / 0.08, 0, 1)[:, None] * a[arm][:, None]
            uit_[arm] = uit_[arm] * (1 - g) + arm_nieuw * g
        return uit_, int(s.sum() + a.sum())
    # de bron is de stof, of de riem op zijn eigen hoogte: bruin op de rok is de afdruk zelf. Op gelijke hoogte tellen is genoeg om de riem rond te laten lopen en de zoom een zoom te laten.
    riem = np.abs(V[:, 2] - m['riem']) < RIEM_HALF
    bron = lijf & ~arm & ~s & (V[:, 2] > m['zoom'] - 0.02) & (V[:, 2] < max(z_boven.values()) + 0.04) & ((K.klasse(kleur) > 0) | riem)
    Z = np.array([1.0, 1.0, 4.0])
    _, i = cKDTree(V[bron] * Z).query(V[s] * Z)
    uit_ = kleur.copy()
    uit_[s] = kleur[bron][i]
    S = buren(len(V), F)
    for _ in range(3):
        U = S @ uit_
        uit_[s] = U[s]
    return uit_, int(s.sum())


def helften(V, kleur, deel, m, arm, z_boven):
    """De wapenrok is rechts blauw en links geel, voor en achter (Z en N op elke plaat). Opzij spreken de platen elkaar tegen, en daar staat dus de verkeerde kleur: die wisselt, met zijn eigen licht en plooien. Rond het midden blijft de lijn van de plaat staan,
    en boven de riem links de blauwe zoom om het armsgat."""
    kl = K.klasse(kleur)
    lijf = (deel == 0) & ~arm & (V[:, 2] > m['zoom'] - 0.05) & (V[:, 2] < max(z_boven.values())) & (np.abs(V[:, 2] - m['riem']) > RIEM_HALF)
    geel_echt = kl == 2
    m_blauw = np.median(kleur[lijf & (kl == 1)], axis=0)
    m_geel = np.median(kleur[lijf & geel_echt], axis=0)
    fout_b = lijf & (kl == 1) & (V[:, 0] > 0.05) & (V[:, 2] < m['riem'])
    fout_g = lijf & geel_echt & (V[:, 0] < -0.05)
    uit_ = kleur.copy()
    uit_[fout_b] = np.clip(m_geel * (kleur[fout_b].mean(1, keepdims=True) / m_blauw.mean()), 0, 1)
    uit_[fout_g] = np.clip(m_blauw * (kleur[fout_g].mean(1, keepdims=True) / m_geel.mean()), 0, 1)
    return uit_, int(fout_b.sum() + fout_g.sum())


EILAND = 2500


def eilanden_weg(V, F, kleur, deel):
    """Een los vlekje blauw op het geel (of andersom) is de projectie, geen ontwerp: de zomen hangen aan hun vlak en blijven. Het vlekje krijgt de kleur van het dichtste punt dat niet zo'n vlekje is."""
    from scipy.spatial import cKDTree
    kl = K.klasse(kleur)
    lijf = deel == 0
    klein = np.zeros(len(V), dtype=bool)
    # alleen de kleur van de andere helft: een stuk geel naast de riem is geen vlekje
    for c, teken in ((1, 1.0), (2, -1.0)):
        s = lijf & (kl == c)
        lab = M.stukken(len(V), F[s[F].all(1)])
        klein |= s & (np.bincount(lab[s], minlength=lab.max() + 1)[lab] < EILAND) & (V[:, 0] * teken > 0)
    bron = lijf & (((kl == 1) & (V[:, 0] < 0)) | ((kl == 2) & (V[:, 0] > 0))) & ~klein
    _, i = cKDTree(V[bron]).query(V[klein])
    uit_ = kleur.copy()
    uit_[klein] = kleur[bron][i]
    S = buren(len(V), F)
    for _ in range(2):
        U = S @ uit_
        uit_[klein] = U[klein]
    return uit_, int(klein.sum())


def zij_glad(V, F, kleur, deel, m, arm):
    """De stof op de zij komt uit twee bronnen en een kleurwissel: dat geeft spikkels. De plooien zitten in de vorm, dus de kleur mag daar glad."""
    s = (deel == 0) & ~arm & (K.klasse(kleur) > 0) & (np.abs(V[:, 0]) > 0.12) & (V[:, 2] > m['zoom']) & (V[:, 2] < m['riem'] - RIEM_HALF)
    S = buren(len(V), F)
    uit_ = kleur.copy()
    for _ in range(ZIJ_GLAD):
        U = S @ uit_
        uit_[s] = U[s]
    return uit_


ZIJ_GLAD = 6
KLEIN_STUK = 1500


def zonder_stukjes(V, F, deel):
    """Na de sneden blijven er losse stukjes over, vingertoppen die de mesh als eilandjes heeft: die zouden in de lucht blijven hangen als de hand weggaat."""
    lab = M.stukken(len(V), F)
    tel = np.bincount(lab, minlength=lab.max() + 1)
    klein = (tel[lab] < KLEIN_STUK) & (deel == 0)
    return F[~klein[F].any(1)], int(klein[np.unique(F)].sum())


def rok_en_been(V, F, kleur, deel, m, J, arm):
    """De snede, op vorm en niet op kleur (kleur gaf repen): de zoom is een gladde lijn rondom, gemeten uit de laagste rokkleur per hoek. Daaronder en binnen de dij is been. Vlakken die rok aan been vastmaken, gaan weg."""
    lijf = deel == 0
    kl = K.klasse(kleur)
    hoek = np.arctan2(V[:, 1], V[:, 0])
    BAK = 48
    bak = ((hoek + np.pi) / (2 * np.pi) * BAK).astype(int) % BAK
    laag = np.full(BAK, np.nan)
    rokkleur = lijf & (kl > 0) & (V[:, 2] > m['zoom'] - 0.08) & (V[:, 2] < m['riem'])
    for b_ in range(BAK):
        s = rokkleur & (bak == b_)
        if s.sum() > 30:
            laag[b_] = np.percentile(V[s, 2], 4)
    g = np.nan_to_num(laag, nan=np.nanmedian(laag))
    # rondgaand glad
    k = np.array([1, 2, 3, 2, 1], dtype=np.float64) / 9
    g = np.convolve(np.concatenate([g[-2:], g, g[:2]]), k, mode='valid')
    z_zoom = np.interp((hoek + np.pi) / (2 * np.pi) * BAK - 0.5, np.arange(-1, BAK + 1), np.concatenate([g[-1:], g, g[:1]]))
    d_been = np.minimum(seg_afstand(V, J['dij.R'], J['scheen.R']), seg_afstand(V, J['dij.L'], J['scheen.L']))
    onder_zoom = V[:, 2] < z_zoom
    been = lijf & onder_zoom & ((d_been < 0.15) | (V[:, 2] < z_zoom - 0.03)) & ~arm & (V[:, 2] < m['zoom'] + 0.12)
    rok = lijf & ~been & ~arm & (V[:, 2] < m['riem'] - 0.02)
    # de snede
    weg = rok[F].any(1) & been[F].any(1)
    return rok, been, F[~weg], int(weg.sum())


def gewichten(V, F, deel, J, m, rok, been, arm, z_boven, namen):
    n = len(V)
    ix = {b: i for i, b in enumerate(namen)}
    W = np.zeros((n, len(namen)), dtype=np.float32)
    for b, e in EINDE.items():
        W[:, ix[b]] = 1.0 / np.maximum(seg_afstand(V, J[b], J[e]), 0.012) ** 4
    z = V[:, 2]
    arm_b = [ix[x + y] for x in ('bovenarm.', 'onderarm.', 'sleutel.') for y in 'RL']
    for b in ('bovenarm.R', 'onderarm.R', 'bovenarm.L', 'onderarm.L'):
        W[seg_afstand(V, J[b], J[EINDE[b]]) > ARM_STRAAL, ix[b]] = 0
    # onder de oksel: de arm is alleen arm, en het lijf heeft geen arm
    onder_oksel = z < min(z_boven.values()) - 0.02
    W[np.ix_(onder_oksel & ~arm & (deel == 0), arm_b)] = 0
    # de hand heeft zijn eigen bot, dus hier alleen wat niet arm of hand is
    W[np.ix_(arm, [i for i in range(len(namen)) if i not in arm_b and namen[i] not in ('hand.R', 'hand.L')])] = 0
    for k, s_k in (('R', -1.0), ('L', 1.0)):
        # elke arm alleen aan zijn eigen kant
        for b in ('bovenarm.', 'onderarm.', 'sleutel.'):
            W[V[:, 0] * s_k < 0, ix[b + k]] = 0
        # de hand: alles van de arm onder de pols
        s = arm & (V[:, 0] * s_k > 0) & (z < J['hand.' + k][2] + 0.01)
        W[s, :] = 0
        W[s, ix['hand.' + k]] = 1.0
    been_b = [ix[x + y] for x in ('dij.', 'scheen.', 'voet.') for y in 'RL']
    # de benen alleen onder de zoom, en alleen het been aan de eigen kant
    W[np.ix_(~been & (deel == 0), been_b)] = 0
    for k, s in (('R', -1.0), ('L', 1.0)):
        for b in ('dij.', 'scheen.', 'voet.'):
            W[V[:, 0] * s < -0.005, ix[b + k]] = 0
    # het been onder de zoom heeft geen last van bekken of rug
    W[np.ix_(been & (z < m['zoom'] - 0.02), [ix[x] for x in ('bekken', 'rug', 'borst', 'nek')])] = 0
    # de armen niet op de benen en de rok
    W[np.ix_(been | rok, arm_b)] = 0
    # de rok: van de riem naar de zoom steeds meer op rok.V en rok.A, zoals bij V4
    u = np.clip((m['riem'] - z) / max(m['riem'] - m['zoom'], 1e-3), 0, 1) ** 1.2
    f = np.clip(0.5 - V[:, 1] / 0.2, 0, 1)
    W[rok] = 0
    W[rok, ix['bekken']] = 1 - u[rok]
    W[rok, ix['rok.V']] = u[rok] * f[rok]
    W[rok, ix['rok.A']] = u[rok] * (1 - f[rok])
    # het hoofd: de helm, het gezicht en de nek staan stijf
    hd = (z > J['hoofd'][2]) & (deel == 0) & (np.hypot(V[:, 0], V[:, 1]) < 0.34)
    W[hd] = 0
    W[hd, ix['hoofd']] = 1.0
    for d_, b in ((1, 'hoofd'), (2, 'hoofd'), (3, 'hand.R')):
        W[deel == d_] = 0
        W[deel == d_, ix[b]] = 1.0
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    S = buren(n, F)
    lijf = deel == 0
    for _ in range(10):
        U = S @ W
        W[lijf] = 0.6 * W[lijf] + 0.4 * U[lijf]
    # hoogstens vier botten per punt, zoals in de stijl
    orde = np.argsort(-W, axis=1)[:, MAX_BOTTEN:]
    np.put_along_axis(W, orde, 0, axis=1)
    return W / np.maximum(W.sum(1, keepdims=True), 1e-9)


def draai_van_naar(u, v):
    """De kleinste draaiing die richting u op richting v legt."""
    u = u / np.linalg.norm(u)
    v = v / np.linalg.norm(v)
    a = np.cross(u, v)
    c = float(u @ v)
    K_ = np.array([[0, -a[2], a[1]], [a[2], 0, -a[0]], [-a[1], a[0], 0]])
    return np.eye(3) + K_ + K_ @ K_ / max(1 + c, 1e-6)


def om_x(h):
    c, s = np.cos(h), np.sin(h)
    return np.array([[1, 0, 0], [0, c, -s], [0, s, c]])


def twee_botten(a, doel, l1, l2, pool):
    """De elleboog: op de cirkel die bij deze twee lengtes hoort, aan de kant van de pool."""
    v = doel - a
    d_ = min(np.linalg.norm(v), 0.999 * (l1 + l2))
    n = v / np.linalg.norm(v)
    x_ = (l1 ** 2 - l2 ** 2 + d_ ** 2) / (2 * d_)
    h_ = np.sqrt(max(l1 ** 2 - x_ ** 2, 0.0))
    p_ = pool - (pool @ n) * n
    return a + x_ * n + h_ * p_ / np.linalg.norm(p_)


def boog_armen(D, P, J, m, ix, zwaai, greep, B):
    """De boogschutter. Zonder greep: de boogarm vast zoals op de plaat, met een kleine zwaai, en de vrije arm zwaait. Met greep (schieten): de linkerhand met de boog naar `links`, en de rechterpols naar `rechts`; beide in de wereld."""
    Rl, Rr = [ix[x + '.L'] for x in ('bovenarm', 'onderarm', 'hand')], [ix[x + '.R'] for x in ('bovenarm', 'onderarm', 'hand')]
    if greep is None:
        Ra = B @ om_x(-ZWAAI_VAST * zwaai)
        D[Rl[0]], D[Rl[1]], D[Rl[2]] = Ra, Ra, Ra
        P[Rl[1]] = P[Rl[0]] + Ra @ (J['onderarm.L'] - J['bovenarm.L'])
        P[Rl[2]] = P[Rl[1]] + Ra @ (J['hand.L'] - J['onderarm.L'])
        if 'boog_hoog' in m:
            # een lijf zonder wapen: de hand hangt te laag om de boog te dragen, dus de elleboog buigt een beetje
            hand_naar(D, P, J, m, ix, 'L', P[ix['borst']] + B @ (np.array(m['boog_hoog']) + np.array([0.0, -0.03 * zwaai, 0.0]) - J['borst']), BOOG_ELLEBOOG, B)
        boven = B @ om_x(ZWAAI_L * zwaai)
        onder = B @ om_x(ZWAAI_L * zwaai - ZWAAI_ELLEBOOG * max(-zwaai, 0.0))
        D[Rr[0]], D[Rr[1]], D[Rr[2]] = boven, onder, onder
        P[Rr[1]] = P[Rr[0]] + boven @ (J['onderarm.R'] - J['bovenarm.R'])
        P[Rr[2]] = P[Rr[1]] + onder @ (J['hand.R'] - J['onderarm.R'])
        return
    a = P[Rl[0]]
    l1 = np.linalg.norm(J['onderarm.L'] - J['bovenarm.L'])
    l2 = np.linalg.norm(J['hand.L'] - J['onderarm.L'])
    off = np.array(m['hand.L']) - J['hand.L']
    Do = B
    for _ in range(4):
        pols = np.array(greep['links']) - Do @ off
        v = pols - a
        if np.linalg.norm(v) > REIK * (l1 + l2):
            pols = a + v / np.linalg.norm(v) * REIK * (l1 + l2)
        e = twee_botten(a, pols, l1, l2, B @ np.array(ELLEBOOG_TWEE))
        Db = draai_van_naar(J['onderarm.L'] - J['bovenarm.L'], e - a)
        Do = draai_van_naar(J['hand.L'] - J['onderarm.L'], pols - e)
    D[Rl[0]], D[Rl[1]], D[Rl[2]] = Db, Do, Do
    P[Rl[1]], P[Rl[2]] = e, pols
    a = P[Rr[0]]
    l1 = np.linalg.norm(J['onderarm.R'] - J['bovenarm.R'])
    l2 = np.linalg.norm(J['hand.R'] - J['onderarm.R'])
    pols = np.array(greep['rechts'])
    v = pols - a
    if np.linalg.norm(v) > REIK * (l1 + l2):
        pols = a + v / np.linalg.norm(v) * REIK * (l1 + l2)
    e = twee_botten(a, pols, l1, l2, B @ np.array(ELLEBOOG_TREK))
    Db = draai_van_naar(J['onderarm.R'] - J['bovenarm.R'], e - a)
    Do = draai_van_naar(J['hand.R'] - J['onderarm.R'], pols - e)
    D[Rr[0]], D[Rr[1]], D[Rr[2]] = Db, Do, Do
    P[Rr[1]], P[Rr[2]] = e, pols


def hand_naar(D, P, J, m, ix, k, doel, pool, B):
    """Eén arm met twee botten: het midden van de hand op `doel`; de hand volgt de onderarm."""
    ib, io, ih = ix['bovenarm.' + k], ix['onderarm.' + k], ix['hand.' + k]
    a = P[ib]
    l1 = np.linalg.norm(J['onderarm.' + k] - J['bovenarm.' + k])
    l2 = np.linalg.norm(J['hand.' + k] - J['onderarm.' + k])
    off = np.array(m['hand.' + k]) - J['hand.' + k]
    Do = B
    for _ in range(4):
        pols = doel - Do @ off
        v = pols - a
        if np.linalg.norm(v) > REIK * (l1 + l2):
            pols = a + v / np.linalg.norm(v) * REIK * (l1 + l2)
        e = twee_botten(a, pols, l1, l2, B @ np.array(pool))
        Db = draai_van_naar(J['onderarm.' + k] - J['bovenarm.' + k], e - a)
        Do = draai_van_naar(J['hand.' + k] - J['onderarm.' + k], pols - e)
    D[ib], D[io], D[ih] = Db, Do, Do
    P[io], P[ih] = e, pols


def kruis_armen(D, P, J, m, ix, zwaai, greep, B, wereld):
    """De kruisboogschutter. Zonder greep hangen de armen zoals op de plaat. Met greep ligt een hand op de lade (`links`, `rechts`: lokaal op de kruisboog), en een arm zonder plek zwaait met de pas; `los`: hoe ver de handen al losgelaten hebben en hangen."""
    for k in 'RL':
        ib, io, ih = ix['bovenarm.' + k], ix['onderarm.' + k], ix['hand.' + k]
        hoek = ZWAAI_L * zwaai if k == 'R' else -ZWAAI_L * zwaai
        boven = B @ om_x(hoek)
        onder = B @ om_x(hoek - ZWAAI_ELLEBOOG * max(-hoek, 0.0))
        D[ib], D[io], D[ih] = boven, onder, onder
        P[io] = P[ib] + boven @ (J['onderarm.' + k] - J['bovenarm.' + k])
        P[ih] = P[io] + onder @ (J['hand.' + k] - J['onderarm.' + k])
    if greep is None:
        return
    G = np.array(greep['plek']) if greep.get('wereld') else wereld(greep['plek'])
    R_ = np.array(greep['R']) if greep.get('wereld') else B @ greep['R']
    for k, naam in (('R', 'rechts'), ('L', 'links')):
        if greep.get(naam) is None:
            continue
        v = greep.get('los_' + k, greep.get('los', 0.0))
        doel = G + R_ @ np.array(greep[naam])
        hang = P[ix['hand.' + k]] + D[ix['hand.' + k]] @ (np.array(m['hand.' + k]) - J['hand.' + k])
        hand_naar(D, P, J, m, ix, k, (1 - v) * doel + v * hang, greep['pool_' + k], B)


def armen(D, P, J, m, ix, zwaai, greep=None):
    """De armen op de borst: links hangend met een zwaai tegen het rechterbeen in (zwaai: -1 tot 1, positief is rechterbeen voor), rechts een elleboog die de hand op de speer zet."""
    B, pB = D[ix['borst']], P[ix['borst']]

    def wereld(q):
        return pB + B @ (np.asarray(q) - J['borst'])

    for k in 'RL':
        D[ix['sleutel.' + k]] = B
        P[ix['sleutel.' + k]] = wereld(J['sleutel.' + k])
        P[ix['bovenarm.' + k]] = wereld(J['bovenarm.' + k])
    if m.get('kruis'):
        kruis_armen(D, P, J, m, ix, zwaai, greep, B, wereld)
        return
    if greep is not None and 'hang' in greep:
        # sterven: beide armen hangen aan de borst, en de hand die het wapen hield, zakt langs het lijf
        for k in 'RL':
            ib, io, ih = ix['bovenarm.' + k], ix['onderarm.' + k], ix['hand.' + k]
            D[ib], D[io], D[ih] = B, B, B
            P[io] = P[ib] + B @ (J['onderarm.' + k] - J['bovenarm.' + k])
            P[ih] = P[io] + B @ (J['hand.' + k] - J['onderarm.' + k])
        k, v = greep['hang']
        if v > 0:
            s_k = 1.0 if k == 'L' else -1.0
            ib, io, ih = ix['bovenarm.' + k], ix['onderarm.' + k], ix['hand.' + k]
            a = P[ib]
            l1 = np.linalg.norm(J['onderarm.' + k] - J['bovenarm.' + k])
            l2 = np.linalg.norm(J['hand.' + k] - J['onderarm.' + k])
            recht = np.array(HANG_ARM) * [s_k, 1.0, 1.0]
            pols = (1 - v) * P[ih] + v * (a + B @ (recht / np.linalg.norm(recht)) * REIK * (l1 + l2))
            e = twee_botten(a, pols, l1, l2, B @ (np.array(HANG_ELLEBOOG) * [s_k, 1.0, 1.0]))
            D[ib], D[io] = draai_van_naar(J['onderarm.' + k] - J['bovenarm.' + k], e - a), draai_van_naar(J['hand.' + k] - J['onderarm.' + k], pols - e)
            D[ih] = D[io]
            P[io], P[ih] = e, pols
        return
    if m.get('boogarm_vast'):
        boog_armen(D, P, J, m, ix, zwaai, greep, B)
        return
    if m.get('speerarm_vast'):
        ib, io, ih = ix['bovenarm.R'], ix['onderarm.R'], ix['hand.R']
        if greep is None:
            # de plaat heeft de houding al (de vuist om de speer): de hele arm hangt aan de schouder en zwaait een beetje, tegen de benen in
            Ra = B @ om_x(ZWAAI_VAST * zwaai)
            D[ib], D[io], D[ih] = Ra, Ra, Ra
            P[io] = P[ib] + Ra @ (J['onderarm.R'] - J['bovenarm.R'])
            P[ih] = P[io] + Ra @ (J['hand.R'] - J['onderarm.R'])
        else:
            # de speer beweegt: de vuist zit eraan vast, en de arm gaat erachteraan met twee botten. greep: de plek van de greep en de draaiing van de speer, in de wereld of (in_borst) in de rust van de borst
            los = greep.get('in_borst')
            D_v = B @ greep['draai'] if los else greep['draai']
            hp = wereld(greep['plek']) if los else np.array(greep['plek'])
            G = np.array(m['hand.R'])
            a = P[ib]
            as_ = D_v @ np.array([0.0, 0.0, 1.0])
            # de vuist rolt om de schacht, de pols naar de schouder: anders reikt hij korter, en dat kan deze arm niet missen
            u = D_v @ (J['hand.R'] - G)
            up, wp = u - (u @ as_) * as_, (a - hp) - ((a - hp) @ as_) * as_
            hoek = np.arctan2(as_ @ np.cross(up, wp), up @ wp) * greep.get('rol', 1.0)
            Kx = np.array([[0, -as_[2], as_[1]], [as_[2], 0, -as_[0]], [-as_[1], as_[0], 0]])
            D_h = (np.eye(3) + np.sin(hoek) * Kx + (1 - np.cos(hoek)) * Kx @ Kx) @ D_v
            P[ih] = hp + D_h @ (J['hand.R'] - G)
            l1 = np.linalg.norm(J['onderarm.R'] - J['bovenarm.R'])
            l2 = np.linalg.norm(J['hand.R'] - J['onderarm.R'])
            # zijn armen zijn kort: verder dan dit gaat de vuist niet, en de speer dus ook niet
            v = P[ih] - a
            if np.linalg.norm(v) > REIK * (l1 + l2):
                P[ih] = a + v / np.linalg.norm(v) * REIK * (l1 + l2)
            e = twee_botten(a, P[ih], l1, l2, B @ (np.array(ELLEBOOG_TWEE) * [-1, 1, 1]))
            D[ib] = draai_van_naar(J['onderarm.R'] - J['bovenarm.R'], e - a)
            D[io] = draai_van_naar(J['hand.R'] - J['onderarm.R'], P[ih] - e)
            D[ih] = D_h
            P[io] = e
            D[ix['speer']] = D_v
            echte_greep = P[ih] + D_h @ (G - J['hand.R'])
    # links: de arm naar voren is een draaiing om x
    h = -ZWAAI_L * zwaai
    boven = B @ om_x(h)
    onder = B @ om_x(h - ZWAAI_ELLEBOOG * max(zwaai, 0.0))
    ib, io, ih = ix['bovenarm.L'], ix['onderarm.L'], ix['hand.L']
    D[ib], D[io], D[ih] = boven, onder, onder
    P[io] = P[ib] + boven @ (J['onderarm.L'] - J['bovenarm.L'])
    P[ih] = P[io] + onder @ (J['hand.L'] - J['onderarm.L'])
    if m.get('speerarm_vast'):
        if greep is not None and greep.get('links'):
            # de linkerhand op de schacht, een stuk voorbij de vuist; links: hoe ver hij al onderweg is, vanaf de hangende arm
            l_ = greep['links']
            doel_h = echte_greep + as_ * greep['af']
            hang = P[ih].copy()
            off = np.array(m['hand.L']) - J['hand.L']
            a = P[ib]
            l1 = np.linalg.norm(J['onderarm.L'] - J['bovenarm.L'])
            l2 = np.linalg.norm(J['hand.L'] - J['onderarm.L'])
            Db, Do = boven, onder
            for _ in range(4):
                pols = (1 - l_) * hang + l_ * (doel_h - Do @ off)
                v = pols - a
                if np.linalg.norm(v) > REIK * (l1 + l2):
                    pols = a + v / np.linalg.norm(v) * REIK * (l1 + l2)
                e = twee_botten(a, pols, l1, l2, B @ np.array(ELLEBOOG_TWEE))
                Db = draai_van_naar(J['onderarm.L'] - J['bovenarm.L'], e - a)
                Do = draai_van_naar(J['hand.L'] - J['onderarm.L'], pols - e)
            D[ib], D[io], D[ih] = Db, Do, Do
            P[io], P[ih] = e, pols
        return
    # rechts: twee botten naar de speerhand
    ib, io, ih = ix['bovenarm.R'], ix['onderarm.R'], ix['hand.R']
    a = P[ib]
    grip = wereld(np.array(SPEERHAND) + np.array([0, ZWAAI_SPEERHAND * zwaai, 0]))
    l1 = np.linalg.norm(J['onderarm.R'] - J['bovenarm.R'])
    l2 = np.linalg.norm(J['hand.R'] - J['onderarm.R'])
    l3 = np.linalg.norm(np.array(m['hand.R']) - J['hand.R'])
    v = grip - a
    d = min(np.linalg.norm(v), 0.999 * (l1 + l2 + l3))
    n = v / np.linalg.norm(v)
    x = (l1 ** 2 - (l2 + l3) ** 2 + d ** 2) / (2 * d)
    h_ = np.sqrt(max(l1 ** 2 - x ** 2, 0.0))
    pool = B @ np.array(ELLEBOOG_R)
    pool = pool - (pool @ n) * n
    e = a + x * n + h_ * pool / np.linalg.norm(pool)
    D[ib] = draai_van_naar(J['onderarm.R'] - J['bovenarm.R'], e - a)
    D[io] = draai_van_naar(J['hand.R'] - J['onderarm.R'], grip - e)
    D[ih] = D[io]
    P[io] = e
    P[ih] = e + (grip - e) * l2 / (l2 + l3)


def beeld_van(mat, rust, namen, ouders, J, m, zwaai, greep=None):
    """Eén beeld: per bot de draaiing (ten opzichte van de rust van V4) en de plek van zijn kop op deze mesh. Het lijf, de benen en de rok komen van V4, de armen uit `armen`."""
    ix = {b: i for i, b in enumerate(namen)}
    D = np.zeros((len(namen), 3, 3))
    P = np.zeros((len(namen), 3))
    for i in range(len(namen)):
        D[i] = mat[i, :3, :3] @ np.linalg.inv(rust[i, :3, :3])
    # het hoofd iets achterover: op de spelcamera valt het gezicht anders onder de helm (de skill: "het gezicht leest met de helm wat naar achteren")
    D[ix['hoofd']] = D[ix['hoofd']] @ om_x(-HOOFD_ACHTEROVER)
    # de rok gaat meer mee met de dij dan bij V4: deze rok is dunner, en de knie prikte erdoorheen
    Db_inv = np.linalg.inv(D[ix['bekken']])
    for b_ in ('rok.V', 'rok.A'):
        D[ix[b_]] = D[ix['bekken']] @ Rotation.from_rotvec(Rotation.from_matrix(Db_inv @ D[ix[b_]]).as_rotvec() * ROK_MEE).as_matrix()
    for i, b in enumerate(namen):
        o = ouders[i]
        if not o:
            P[i] = J[b]
        elif b == 'bekken':
            # het bekken beweegt mee: de verschuiving van V4 zelf
            P[i] = J[b] + (mat[i, :3, 3] - rust[i, :3, 3])
        else:
            jo = ix[o]
            P[i] = P[jo] + D[jo] @ (J[b] - J[o])
    armen(D, P, J, m, ix, zwaai, greep)
    return D, P


OPEN_ARM = np.radians(40)


def open_houding(V, W, J, namen):
    """Om te verven: de rust met de armen wijd, zodat het textuurmodel ook de zij en de binnenkant van de armen ziet."""
    ix = {b: i for i, b in enumerate(namen)}
    D = np.tile(np.eye(3), (len(namen), 1, 1))
    P = np.array([J[b] for b in namen])
    for k, s in (('R', 1.0), ('L', -1.0)):
        c, z = np.cos(OPEN_ARM), np.sin(OPEN_ARM * s)
        R = np.array([[c, 0, z], [0, 1, 0], [-z, 0, c]])
        ib, io, ih = ix['bovenarm.' + k], ix['onderarm.' + k], ix['hand.' + k]
        D[ib] = D[io] = D[ih] = R
        P[io] = P[ib] + R @ (J['onderarm.' + k] - J['bovenarm.' + k])
        P[ih] = P[io] + R @ (J['hand.' + k] - J['onderarm.' + k])
    return vervorm(V, W, D, P, J, namen)


def zwaai_van(lijst, rust, ix, normaal):
    """Hoe ver het rechterbeen naar voren staat, per beeld: het gezicht kijkt naar -y."""
    i = ix['dij.R']
    s = np.array([-(mat[i, :3, :3] @ np.linalg.inv(rust[i, :3, :3]) @ np.array([0, 0, -1.0]))[1] for mat in lijst])
    s -= s.mean()
    return s / max(np.abs(s).max(), 1e-6) if normaal else s * 0.0


def vervorm(V, W, D, P, J, namen):
    U = np.zeros_like(V)
    for i, b in enumerate(namen):
        s = W[:, i] > 1e-5
        if s.any():
            U[s] += W[s, i, None] * ((V[s] - J[b]) @ D[i].T + P[i])
    return U


def main():
    d = np.load(sys.argv[1])
    bw = np.load(sys.argv[2])
    uit = sys.argv[3]
    arg = dict(a.split('=') for a in sys.argv[4:] if '=' in a)
    naam = arg.get('naam', 'rig')
    V, F = d['V'], d['F']
    per_punt = {k: d[k] for k in d.files if k not in ('V', 'F') and d[k].ndim > 0 and len(d[k]) == len(V)}
    deel, kleur = per_punt['deel'], per_punt['kleur']
    namen = [str(x) for x in bw['namen']]
    ouders = [str(x) for x in bw['ouders']]
    rust = bw['rust']
    m = maten_figuur(V, kleur, deel)
    J = gewrichten(m)
    arm, Fa, z_boven, snede = arm_los(V, F, kleur, deel, m)
    strook = rits_dicht(V, snede, arm, J)
    Fa = np.vstack([Fa, strook.astype(Fa.dtype)])
    per_punt['kleur'] = arm_kleur(V, Fa, kleur, arm)
    verf = np.load(arg['verf'])['kleur'].astype(np.float64) if 'verf' in arg else None
    per_punt['kleur'], achter = achter_de_arm(V, Fa, per_punt['kleur'], deel, m, arm, z_boven, verf, np.unique(snede))
    per_punt['kleur'], gewisseld = helften(V, per_punt['kleur'], deel, m, arm, z_boven)
    per_punt['kleur'], vlekjes = eilanden_weg(V, Fa, per_punt['kleur'], deel)
    per_punt['kleur'] = zij_glad(V, Fa, per_punt['kleur'], deel, m, arm)
    kleur = per_punt['kleur']
    speer = deel == 3
    rok, been, Fk, gesneden = rok_en_been(V, Fa, kleur, deel, m, J, arm)
    Fk, stukjes = zonder_stukjes(V, Fk, deel)
    W = gewichten(V, Fk, deel, J, m, rok, been, arm, z_boven, namen)
    e = np.sort(np.concatenate([Fk[:, [0, 1]], Fk[:, [1, 2]], Fk[:, [2, 0]]]), axis=1)
    e = np.unique(e, axis=0)
    e = e[(deel[e[:, 0]] == 0) & (deel[e[:, 1]] == 0)]
    l0 = np.linalg.norm(V[e[:, 0]] - V[e[:, 1]], axis=1)
    keys = per_punt
    info = {'maten': {k: v for k, v in m.items() if not k.startswith('arm_')}, 'gesneden_vlakken': gesneden, 'arm_gesneden': len(snede), 'arm_tot': z_boven, 'achter_de_arm': achter, 'gewisseld': gewisseld, 'vlekjes': vlekjes, 'rits_vlakken': len(strook), 'losse_stukjes': stukjes, 'rok_punten': int(rok.sum()), 'been_punten': int(been.sum()), 'arm_punten': int(arm.sum()), 'botten': len(namen)}
    ix = {b: i for i, b in enumerate(namen)}
    n_sp = int(speer.sum())
    voet = V[speer][-2] if n_sp else None
    # de hoogte op de speer waar de hand zit: in het eerste beeld van staan, zodat de hak net op de grond staat
    D0, P0 = beeld_van(bw['staan'][0], rust, namen, ouders, J, m, 0.0)
    hand0 = P0[ix['hand.R']] + D0[ix['hand.R']] @ (np.array(m['hand.R']) - J['hand.R'])
    grip_z = float(hand0[2]) if n_sp else 0.0
    hd_v4 = ix['speer']
    for houding in ('staan', 'lopen'):
        Vf, rek = [], []
        zw = zwaai_van(bw[houding], rust, ix, houding == 'lopen')
        for mat, z_ in zip(bw[houding], zw):
            Dm, Pm = beeld_van(mat, rust, namen, ouders, J, m, float(z_))
            U = vervorm(V, W, Dm, Pm, J, namen)
            if n_sp:
                # de speer: stijf, in de stand van de speer van V4, door de hand
                h = Pm[ix['hand.R']] + Dm[ix['hand.R']] @ (np.array(m['hand.R']) - J['hand.R'])
                grip = np.array([voet[0], voet[1], grip_z])
                U[speer] = (V[speer] - grip) @ Dm[hd_v4].T + h
            U[:, 2] -= U[deel == 0, 2].min()
            Vf.append(U.astype(np.float32))
            rek.append(np.linalg.norm(U[e[:, 0]] - U[e[:, 1]], axis=1) / np.maximum(l0, 1e-5))
        rek = np.array(rek)
        info[houding] = {'beelden': len(Vf), 'rek_p99': round(float(np.percentile(rek, 99)), 3), 'krimp_p1': round(float(np.percentile(rek, 1)), 3)}
        np.savez_compressed(os.path.join(uit, f'{naam}_{houding}.npz'), V=V, F=Fk, Vf=np.array(Vf), **keys)
    np.savez_compressed(os.path.join(uit, f'{naam}_open.npz'), V=V, F=Fk, Vf=open_houding(V, W, J, namen)[None].astype(np.float32), **keys)
    json.dump(info, open(os.path.join(uit, f'{naam}.json'), 'w', encoding='utf-8'), indent=1)
    print(json.dumps({k: info[k] for k in ('gesneden_vlakken', 'arm_gesneden', 'achter_de_arm', 'gewisseld', 'vlekjes', 'rits_vlakken', 'losse_stukjes', 'rok_punten', 'been_punten', 'arm_punten', 'staan', 'lopen')}), json.dumps({k: (round(v, 3) if isinstance(v, float) else v) for k, v in info['maten'].items() if k in ('H', 'zoom', 'riem')}), json.dumps({b: [round(float(x), 3) for x in J[b]] for b in ('bekken', 'dij.R', 'scheen.R', 'voet.R', 'bovenarm.R', 'onderarm.R', 'hand.R', 'hoofd')}))


if __name__ == '__main__':
    main()
