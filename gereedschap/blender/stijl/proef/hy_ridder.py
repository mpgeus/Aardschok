# De ridder (Marcel, 1 nov: "De knight"; `aardschok-ridder-paard-draai.png`, `-ridder-draai-basis.png`, `-schild-los-draai.png`, `-zwaard-los-draai.png`). Nog zonder skelet: paard, ruiter, schild en zwaard als starre stukken op elkaar, om te zien of hij op spelmaat leest. Alleen om te bekijken.
#
#   python hy_ridder.py <splat-map> <uit-map> [richtingen=.. elevatie=30 pixels=1024 ortho=4.0 doel=0.74 paard=1.9 ruiter=1.0 zit_y=.. zit_z=..]
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_splat as Y  # noqa: E402

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


def main():
    map_, uit = sys.argv[1], sys.argv[2]
    arg = dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a)
    os.makedirs(uit, exist_ok=True)
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
    links = g & (Pr[:, 0] > 0.1) & (Pr[:, 1] < np.percentile(Pr[g, 1], 12))
    rechts = g & (Pr[:, 0] < -0.1) & (Pr[:, 1] < np.percentile(Pr[g, 1], 12))
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
    z_ = a > 0.05
    P, Q, k, a = P[z_], Q[z_], k[z_], a[z_]
    P[:, 2] -= P[a > 0.3, 2].min()
    richtingen = arg.get('richtingen', 'Z,ZW,W,NW,N,NO,O,ZO').split(',')
    e, pixels, ortho, doel = float(arg.get('elevatie', 30)), int(arg.get('pixels', 1024)), float(arg.get('ortho', 4.0)), float(arg.get('doel', 0.74))
    for r in richtingen:
        Y.render(P, Q, k, a, r, e, pixels, ortho, doel).save(os.path.join(uit, f'staan-{r}-00.png'))
    json.dump({'pas_meter': 0.2327, 'lengte': 1.354, 'doel_z': doel, 'houding': 'staan', 'richtingen': richtingen, 'pixels': pixels, 'monsters': 1, 'elevatie': e, 'ortho': ortho}, open(os.path.join(uit, 'staan-render.json'), 'w'))
    print('ridder', len(P), 'punten; hoog', round(float(P[a > 0.3, 2].max()), 3), 'breed', np.round(np.ptp(P[a > 0.3], axis=0), 3).tolist())


if __name__ == '__main__':
    main()
