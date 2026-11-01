# TripoSplat (VAST-AI, MIT): van één plaat naar 3D Gaussians, en een renderer op de camera van het spel. Blender tekent geen Gaussians, dus de renderer is hier: elke Gaussian als ellips op het beeld, van achter naar voren
# samengesteld in lagen. Geen licht: de kleur zit in de Gaussians, net als de verf uit de plaat. Code en gewichten staan in C:/ComfyUI/triposplat.
#
#   python hy_splat.py maak <plaat.png> <uit.npz> [zaad=42 stappen=20 cfg=3.0 aantal=262144]
#   python hy_splat.py verf <samen.npz> <verf.npz> plaat=<Z-invoer.png>   wat er nog fout staat, recht gezet: blauw op leer, groen op de naad, en de kleuren van de plaat op de wapenrok
#   python hy_splat.py rig <verf.npz> <beweging.npz> <v_spel.npz> <map> [draai=0 elevatie=30 ortho=3.0 doel=0.74 pixels=768 richtingen=.. houdingen=staan,lopen,aanval stap=1]   hy_rig op de Gaussians, met de speer van de mesh als Gaussians erbij
#   python hy_splat.py samen <uit.npz> Z=<z.npz> N=<n.npz> [boog=1]   een run op de voorkant en een op de achterkant van de plaat; de voorste helft uit de ene, de achterste uit de andere, met de naad langs de zij. Dan is niets meer geraden en ligt er nergens iets dubbel
#   python hy_splat.py kijk <uit.npz> <map> [elevatie=20 pixels=640 ortho=auto richtingen=Z,ZW,W,N,O draai=0 lengte=1.354]
#
# uit.npz: xyz (z omhoog, gezicht naar -y, voeten op 0, lengte in meters), rgb (0 tot 1, sRGB), alfa, schaal (drie assen), rot (kwaternion w x y z).
import json
import os
import sys
import time

import numpy as np
from PIL import Image

CODE = 'C:/ComfyUI/triposplat/src'
CKPT = 'C:/ComfyUI/triposplat/ckpts'
C0 = 0.28209479177387814
RICHTING = {'Z': 0, 'ZW': 45, 'W': 90, 'NW': 135, 'N': 180, 'NO': 225, 'O': 270, 'ZO': 315}
LAGEN = 192
SIGMA_RAND = 3.0
HOOGSTE_R = 14


def maak(plaat, uit, arg):
    sys.path.insert(0, CODE)
    import torch
    from triposplat import TripoSplatPipeline
    t0 = time.time()
    pipe = TripoSplatPipeline(ckpt_path=CKPT + '/diffusion_models/triposplat_fp16.safetensors', decoder_path=CKPT + '/vae/triposplat_vae_decoder_fp16.safetensors', dinov3_path=CKPT + '/clip_vision/dino_v3_vit_h.safetensors',
                              flux2_vae_encoder_path=CKPT + '/vae/flux2-vae.safetensors', rmbg_path=CKPT + '/background_removal/birefnet.safetensors', device='cuda')
    t1 = time.time()
    torch.cuda.reset_peak_memory_stats()
    g, klaar = pipe.run(plaat, seed=int(arg.get('zaad', 42)), steps=int(arg.get('stappen', 20)), guidance_scale=float(arg.get('cfg', 3.0)), num_gaussians=int(arg.get('aantal', 262144)), show_progress=False)
    t2 = time.time()
    xyz = g.get_xyz.detach().float().cpu().numpy()
    rgb = np.clip(g._features_dc.detach().float().cpu().numpy()[:, 0, :] * C0 + 0.5, 0, 1)
    alfa = g.get_opacity.detach().float().cpu().numpy()[:, 0]
    schaal = g.get_scaling.detach().float().cpu().numpy()
    rot = (g._rotation + g.rots_bias[None, :]).detach().float().cpu().numpy()
    rot /= np.linalg.norm(rot, axis=1, keepdims=True)
    np.savez_compressed(uit, xyz=xyz, rgb=rgb, alfa=alfa, schaal=schaal, rot=rot)
    klaar.save(os.path.splitext(uit)[0] + '-invoer.png')
    info = {'laden_s': round(t1 - t0, 1), 'draaien_s': round(t2 - t1, 1), 'vram_piek_gb': round(torch.cuda.max_memory_allocated() / 2 ** 30, 2), 'aantal': int(len(xyz)), 'kader_min': xyz.min(0).round(3).tolist(), 'kader_max': xyz.max(0).round(3).tolist()}
    json.dump(info, open(os.path.splitext(uit)[0] + '.json', 'w', encoding='utf-8'), indent=1)
    print(json.dumps(info))


def kwat_matrix(q):
    w, x, y, z = q[:, 0], q[:, 1], q[:, 2], q[:, 3]
    return np.stack([1 - 2 * (y * y + z * z), 2 * (x * y - w * z), 2 * (x * z + w * y),
                     2 * (x * y + w * z), 1 - 2 * (x * x + z * z), 2 * (y * z - w * x),
                     2 * (x * z - w * y), 2 * (y * z + w * x), 1 - 2 * (x * x + y * y)], axis=1).reshape(-1, 3, 3)


def in_onze_assen(d, draai, lengte):
    """Hun object heeft al z omhoog en kijkt naar -y (`_OBJECT_TO_VIEWER` in ComfyUI). Op de voeten, gecentreerd, op lengte, en eventueel gedraaid om de as."""
    P = d['xyz'].astype(np.float64)
    R = d['matrix'].astype(np.float64) if 'matrix' in d.files else kwat_matrix(d['rot'].astype(np.float64))
    a = np.radians(draai)
    D = np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1.0]])
    zicht = d['alfa'] > 0.05
    P = P @ D.T
    R = D @ R
    P[:, 2] -= P[zicht, 2].min()
    # de lengte is die van de man, zonder speer
    P[:, :2] -= np.median(P[zicht, :2], axis=0)
    f = lengte / lijf_top(P[zicht])
    P *= f
    return P, R, d['schaal'].astype(np.float64) * f


def lijf_top(P):
    """De bovenkant van de helm, ook als er een speer boven uitsteekt: van boven af de eerste plak die breder is dan een speerblad. Is die er meteen, dan is er geen speer."""
    z = P[:, 2]
    H_ = z.max()
    for q in np.arange(H_, 0.5 * H_, -0.005 * H_):
        s = np.abs(z - q) < 0.005 * H_
        if s.sum() > 20:
            b = max(np.ptp(np.percentile(P[s, 0], [2, 98])), np.ptp(np.percentile(P[s, 1], [2, 98])))
            if b > TOP_BREED * H_:
                # bij een figuur zonder speer is dit gewoon de top. Met speer: de knop van de helm is smal en steekt boven deze plak uit, dus het hoogste punt bij het midden van de plak
                if H_ - q < TOP_MARGE * H_:
                    return H_
                # het midden uit een plak wat lager: boven in de helm zijn er nog meer speerpunten dan helmpunten
                c = np.median(P[np.abs(z - (q - TOP_ZAK * H_)) < 0.005 * H_, :2], axis=0)
                bij = (z > q) & (np.hypot(P[:, 0] - c[0], P[:, 1] - c[1]) < TOP_KNOP * H_)
                return float(z[bij].max()) if bij.any() else float(q)
    return H_


TOP_BREED = 0.1
TOP_MARGE = 0.07
TOP_KNOP = 0.06
TOP_ZAK = 0.05
SPEER_DIK = 1.35
SPEER_OVER_HELM = 0.04
SPEER_STRAAL = 0.03
SCHACHT_STRAAL = 0.028
SCHACHT_LAARS = 0.022
RAND_STRAAL = 0.05
RAND_BUREN = 12
RAND_DEEL = 0.5
RAND_RONDES = 3
BLAD_STRAAL = 0.07
BLAD_VANAF = 0.88
LAARS_TOT = 0.25


def speer_op_de_plaat(P, alfa, lengte=1.354):
    """De speer die de plaat zelf heeft: wat boven de helm uitsteekt geeft de as, en die wordt nauwkeuriger met wat er lager ook op ligt. Geeft (masker, assen in z, top), of (None, None, None) als er geen speer is."""
    z = P[:, 2]
    s = (alfa > 0.3) & (z > lengte + SPEER_OVER_HELM)
    if s.sum() < 200:
        return None, None, None
    a, b = np.polyfit(z[s], P[s, 0], 1), np.polyfit(z[s], P[s, 1], 1)
    for str_ in (0.08, 0.05, 0.035, 0.025):
        d = np.hypot(P[:, 0] - np.polyval(a, z), P[:, 1] - np.polyval(b, z))
        s = (alfa > 0.3) & (d < str_)
        a, b = np.polyfit(z[s], P[s, 0], 1), np.polyfit(z[s], P[s, 1], 1)
    d = np.hypot(P[:, 0] - np.polyval(a, z), P[:, 1] - np.polyval(b, z))
    top = float(z[(alfa > 0.3) & (d < SPEER_STRAAL)].max())
    # de brede straal alleen boven de helm, waar het blad zit: lager telde de helmrand mee als speer, en die draaide dan met de speer weg
    # per hoogte: boven de helmrand is er ruimte voor de koker en het blad, langs de laars is er weinig
    masker = d < np.where(z > BLAD_VANAF * lengte, BLAD_STRAAL, np.where(z > LAARS_TOT, SCHACHT_STRAAL, SCHACHT_LAARS))
    from scipy.spatial import cKDTree
    wel = alfa > 0.02
    boom = cKDTree(P[wel])
    for _ in range(RAND_RONDES):
        kand = np.nonzero(~masker & wel & (d < RAND_STRAAL))[0]
        if not len(kand):
            break
        _, i = boom.query(P[kand], k=RAND_BUREN + 1, workers=-1)
        masker[kand[masker[wel][i[:, 1:]].mean(1) >= RAND_DEEL]] = True
    return masker, (a, b), top


def render(P, Q, rgb, alfa, richting, elevatie, pixels, ortho, doel_z):
    """Orthografisch, zoals hy_kijk: de camera kijkt vanuit `richting` omlaag onder `elevatie`. Elke Gaussian wordt een 2D-ellips (3 sigma); per laag op diepte samengesteld met het product van (1 - alfa)."""
    a, e = np.radians(-RICHTING[richting]), np.radians(elevatie)
    # zoals hy_kijk: Z staat aan de -y kant, W aan de +x kant (hij kijkt naar links in beeld)
    kijk = np.array([np.sin(a) * np.cos(e), np.cos(a) * np.cos(e), -np.sin(e)])
    rechts = np.array([np.cos(a), -np.sin(a), 0.0])
    boven = np.cross(rechts, kijk)
    px = pixels / ortho
    M = np.stack([rechts, boven])
    u = (P @ rechts) * px + pixels / 2
    v = pixels / 2 - (P @ boven - doel_z * np.cos(e)) * px
    d = P @ kijk
    # de 2D-covariantie: A = M Q, met Q = R diag(s) in rust en daarna vervormd -> C = A A^T
    A = np.einsum('ij,njk->nik', M, Q) * px
    c00 = (A[:, 0, :] ** 2).sum(1) + 0.08
    c11 = (A[:, 1, :] ** 2).sum(1) + 0.08
    c01 = -(A[:, 0, :] * A[:, 1, :]).sum(1)  # beeld-y staat omgekeerd
    det = np.maximum(c00 * c11 - c01 ** 2, 1e-6)
    i00, i11, i01 = c11 / det, c00 / det, -c01 / det
    r = np.clip(np.ceil(SIGMA_RAND * np.sqrt(np.maximum(c00, c11))).astype(int), 1, HOOGSTE_R)
    orde = np.argsort(-d)
    laag = np.zeros(len(P), dtype=np.int32)
    laag[orde] = (np.arange(len(P)) * LAGEN // len(P))
    n = pixels * pixels
    # van achter naar voren: laag 0 is de verste
    beeld = np.zeros((n, 3))
    dek = np.zeros(n)
    for l in range(LAGEN):
        s = np.nonzero(laag == l)[0]
        if not len(s):
            continue
        pids, wa, ca = [], [], []
        for rr in np.unique(r[s]):
            q = s[r[s] == rr]
            dy, dx = np.mgrid[-rr:rr + 1, -rr:rr + 1]
            dx, dy = dx.ravel(), dy.ravel()
            x0, y0 = np.floor(u[q]).astype(int), np.floor(v[q]).astype(int)
            X = x0[:, None] + dx
            Y = y0[:, None] + dy
            ex = X + 0.5 - u[q][:, None]
            ey = Y + 0.5 - v[q][:, None]
            m = i00[q][:, None] * ex * ex + 2 * i01[q][:, None] * ex * ey + i11[q][:, None] * ey * ey
            g = np.exp(-0.5 * m) * alfa[q][:, None]
            ok = (X >= 0) & (X < pixels) & (Y >= 0) & (Y < pixels) & (g > 0.002)
            pids.append((Y * pixels + X)[ok])
            wa.append(g[ok])
            ca.append(np.repeat(rgb[q], len(dx), axis=0).reshape(len(q), len(dx), 3)[ok])
        pid = np.concatenate(pids)
        w = np.minimum(np.concatenate(wa), 0.999)
        c = np.concatenate(ca)
        log_t = np.bincount(pid, np.log1p(-w), minlength=n)
        som = np.bincount(pid, w, minlength=n)
        t = np.exp(log_t)
        ver = 1 - t
        h = som > 1e-6
        for k in range(3):
            lc = np.bincount(pid, w * c[:, k], minlength=n)
            beeld[h, k] = beeld[h, k] * t[h] + (lc[h] / som[h]) * ver[h]
        dek = dek * t + ver
    uit_ = np.zeros((pixels, pixels, 4), dtype=np.uint8)
    d_ = np.maximum(dek, 1e-4)[:, None]
    uit_[:, :, :3] = (np.clip(beeld / d_, 0, 1) * 255).reshape(pixels, pixels, 3).astype(np.uint8)
    uit_[:, :, 3] = (np.clip(dek, 0, 1) * 255).reshape(pixels, pixels).astype(np.uint8)
    return Image.fromarray(uit_, 'RGBA')


def kijk(pad, map_, arg):
    d = np.load(pad)
    os.makedirs(map_, exist_ok=True)
    lengte = float(arg.get('lengte', 1.354))
    P, R, S = in_onze_assen(d, float(arg.get('draai', 0)), lengte)
    pixels = int(arg.get('pixels', 640))
    ortho = float(arg.get('ortho', lengte * 1.25))
    t0 = time.time()
    rij = arg.get('richtingen', 'Z,ZW,W,N,O').split(',')
    for r in rij:
        render(P, R * S[:, None, :], d['rgb'].astype(np.float64), d['alfa'].astype(np.float64), r, float(arg.get('elevatie', 20)), pixels, ortho, float(arg.get('doel', lengte / 2))).save(os.path.join(map_, f'staan-{r}-00.png'))
    print('renders', len(rij), round((time.time() - t0) / len(rij), 1), 's per beeld')


ARM_BUIS = 0.09
DONKER = 0.33
ROMP_BOVEN = 0.1
ZIJ_VANAF = 0.12
STOF_BUREN = 32
STOF_GLAD = 0.55
WIT_TOT = 0.98
WIT_VERZ = 0.4
WIT_LICHT = 0.42


def verf(pad, uit, arg):
    """Spiegelen en verf van de plaat erop bleken niet nodig: elke helft komt nu uit een run die hem zag. Wat overblijft: blauw op leer (de laarsneus, een streep op de mouw: daar lopen de runs uit), groen op de naad bij de schouder, en de pijplijn dempt de kleuren."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import hy_kleur as K
    import hy_rig as H
    d = np.load(pad)
    P, _, _ = in_onze_assen(d, float(arg.get('draai', 0)), 1.354)
    alfa = d['alfa'].astype(np.float64)
    rgb = d['rgb'].astype(np.float64)
    zicht = alfa > 0.05
    deel = np.zeros(len(P), dtype=np.int8)
    speer = speer_op_de_plaat(P, alfa)[0]
    if speer is not None:
        deel[speer] = 3
    lin = K.srgb_lin(rgb)
    m = H.maten_figuur(P[zicht], lin[zicht], deel[zicht])
    if speer is not None:
        m['schouder.R'] = [-m['schouder.L'][0], m['schouder.L'][1], m['schouder.L'][2]]
    arm, _, z_boven, _ = H.arm_los(P, buur_vlakken(P), lin, deel, m)
    x, z = P[:, 0], P[:, 2]
    kl = K.klasse(lin)
    licht = rgb.mean(1)
    buis = (H.seg_afstand(P, np.array(m['schouder.L']), np.array(m['elleboog.L'])) < ARM_BUIS) | (H.seg_afstand(P, np.array(m['schouder.R']), np.array(m['elleboog.R'])) < ARM_BUIS)
    laars = z < m['zoom'] - 0.05
    # blauw op leer wordt leer, met zijn eigen licht. Boven de oksel raakt de mouw de wapenrok: daar alleen het donkere
    m_leer = np.median(rgb[arm & (kl == 0) & (licht > 0.2)], axis=0)
    op_leer = (kl == 1) & (arm | laars | (buis & (licht < DONKER))) & (deel == 0)
    rgb[op_leer] = np.clip(m_leer * (licht[op_leer, None] / m_leer.mean()), 0, 1)
    # groen bestaat niet op deze figuur. De romp houdt op onder de hals: gezicht en helm blijven zoals ze zijn
    romp = ~arm & (deel == 0) & (z > m['zoom'] - 0.05) & (z < max(z_boven.values()) + ROMP_BOVEN)
    m_b, m_g = np.median(rgb[romp & (kl == 1) & (licht > DONKER)], axis=0), np.median(rgb[romp & (kl == 2)], axis=0)
    groen = (deel == 0) & (rgb[:, 1] > rgb[:, 0] * 1.05) & (rgb[:, 1] > rgb[:, 2] * 1.05)
    rgb[groen] = np.where((x[groen] > 0)[:, None], m_g, m_b)
    # blauw op de helm is verzonnen: staal
    H_ = P[zicht, 2].max()
    op_helm = (z > 0.84 * H_) & (np.hypot(P[:, 0] - np.median(P[z > 0.9 * H_, 0]), P[:, 1] - np.median(P[z > 0.9 * H_, 1])) < HELM_STRAAL) & (deel == 0)
    blauw_h = op_helm & (K.klasse(K.srgb_lin(rgb)) == 1)
    rgb[blauw_h] = np.clip(np.median(rgb[op_helm & ~blauw_h], axis=0) * (rgb[blauw_h].mean(1, keepdims=True) / np.median(rgb[op_helm & ~blauw_h])), 0, 1)
    # wat de arm bedekte en wit werd verzonnen, komt bloot zodra hij opgaat
    verz = (rgb.max(1) - rgb.min(1)) / np.maximum(rgb.max(1), 1e-4)
    wit = (deel == 0) & (np.abs(z - m['riem']) > H.RIEM_HALF) & (z < WIT_TOT) & (verz < WIT_VERZ) & (rgb.mean(1) > WIT_LICHT)
    from scipy.spatial import cKDTree
    goed_ = (deel == 0) & ~wit & zicht
    _, i_ = cKDTree(P[goed_]).query(P[wit], k=8, workers=-1)
    rgb[wit] = np.median(rgb[goed_][i_], axis=1)
    # op de zij onder de arm staat de verf van de arm: die komt bloot zodra hij opgaat
    kl = K.klasse(K.srgb_lin(rgb))
    # alleen onder de oksel: daarboven is het de mouw. Rechts is de stof blauw, links geel
    oksel_k = np.where(x < 0, z_boven['R'], z_boven['L']) - 0.02
    for s_k, c in ((-1.0, 1), (1.0, 2)):
        zij = (deel == 0) & ~arm & (x * s_k > ZIJ_VANAF) & (z > m['riem'] + H.RIEM_HALF) & (z < oksel_k) & (P[:, 1] < KOKER_Y) & (kl == 0)
        stof = (deel == 0) & ~arm & (kl == c) & (z > m['riem'] + H.RIEM_HALF) & (x * s_k > 0)
        if zij.any() and stof.any():
            _, i_ = cKDTree(P[stof]).query(P[zij], k=8, workers=-1)
            rgb[zij] = np.median(rgb[stof][i_], axis=1)
    # de kleuren van de plaat, per vlak en per helft: de twee runs kiezen elk hun eigen geel
    v = np.array(Image.open(arg['plaat']).convert('RGB')).reshape(-1, 3).astype(np.float64) / 255
    v = v[v.max(1) > 0.1]
    v_kl = K.klasse(K.srgb_lin(v))
    kl = K.klasse(K.srgb_lin(rgb))
    info = {'blauw_op_leer': int(op_leer.sum()), 'groen': int(groen.sum()), 'wit': int(wit.sum()), 'blauw_op_helm': int(blauw_h.sum())}
    for c, naam in ((1, 'blauw'), (2, 'geel')):
        for hk_, helft in (('voor', P[:, 1] < 0), ('achter', P[:, 1] >= 0)):
            s = romp & (kl == c) & helft
            if s.sum() < 50:
                continue
            # optellen en niet vermenigvuldigen: anders worden de hooglichten paars
            g = np.median(v[v_kl == c], axis=0) - np.median(rgb[s], axis=0)
            rgb[s] = np.clip(rgb[s] + g, 0, 1)
            info['verschil_' + naam + '_' + hk_] = g.round(3).tolist()
    # de strepen op de stof: elk punt half naar het gemiddelde van zijn buren van dezelfde kleur. De plooien zitten in de vorm
    for c in (1, 2):
        s = romp & (kl == c) & (alfa > 0.05)
        if s.sum() > 50:
            _, i_ = cKDTree(P[s]).query(P[s], k=STOF_BUREN, workers=-1)
            rgb[s] = (1 - STOF_GLAD) * rgb[s] + STOF_GLAD * rgb[s][i_].mean(1)
    k = {n: d[n] for n in d.files}
    k['rgb'] = rgb.astype(np.float32)
    np.savez_compressed(uit, **k)
    print(json.dumps(info))


# Hoe een run staat: het aanzicht dat hij kreeg, wijst naar +x (gemeten op de eerste proef). Dit zet die kant naar de camera van dat aanzicht, in de assen van hy_kijk.
RUN_DRAAI = {'Z': -90, 'W': 0, 'N': 90, 'O': 180}
ICP_RONDES = 30
ICP_PUNTEN = 40000
ICP_VER = 0.06
NAAD_BAND = 0.08
NAAD_OVERLAP = 0.003


def op_elkaar(bron, doel):
    """Schaal, draaiing en plek van een run op de basis (ICP met schaal, de verste paren tellen niet). De basis raadt zijn achterkant, maar de vorm klopt ruwweg, en meer is hier niet nodig."""
    from scipy.spatial import cKDTree
    r = np.random.default_rng(0)
    b = bron[r.choice(len(bron), min(ICP_PUNTEN, len(bron)), replace=False)]
    boom = cKDTree(doel[r.choice(len(doel), min(ICP_PUNTEN, len(doel)), replace=False)])
    s, Ro, t_ = 1.0, np.eye(3), np.zeros(3)
    for _ in range(ICP_RONDES):
        q = s * b @ Ro.T + t_
        d, i = boom.query(q, workers=-1)
        ok = d < ICP_VER
        a_, c_ = b[ok], boom.data[i[ok]]
        ma, mc = a_.mean(0), c_.mean(0)
        H_ = (a_ - ma).T @ (c_ - mc)
        U_, D_, Vt = np.linalg.svd(H_)
        Ro = Vt.T @ np.diag([1, 1, np.sign(np.linalg.det(Vt.T @ U_.T))]) @ U_.T
        s = float((D_ * [1, 1, np.sign(np.linalg.det(Vt.T @ U_.T))]).sum() / ((a_ - ma) ** 2).sum())
        t_ = mc - s * ma @ Ro.T
    return s, Ro, t_, float(np.median(d[ok]))


NAAD_PLAK = 0.02
NAAD_KOLOM = 0.13
HELM_VAN = 0.79
HELM_TOT = 0.87


def midden_per_hoogte(P, s):
    """Per hoogte het midden in de diepte van wat daar staat: de helm staat zo'n 6 cm achter het midden van het lijf, en een rechte naad snijdt er dan scheef doorheen ("lijken afgeknipt"). Glad over de hoogte, anders krijgt de figuur trappen."""
    # alleen de middenkolom: een voorarm die naar voren steekt, of de speer, is het midden niet
    H_ = P[s, 2].max()
    s = s & (np.abs(P[:, 0] - np.median(P[s, 0])) < NAAD_KOLOM)
    z = np.arange(0.0, H_ + NAAD_PLAK, NAAD_PLAK)
    m = np.full(len(z), np.nan)
    for i, q in enumerate(z):
        v = s & (np.abs(P[:, 2] - q) < NAAD_PLAK)
        if v.sum() > 30:
            m[i] = np.mean(np.percentile(P[v, 1], [1, 99]))
    ok = np.isfinite(m)
    m = np.interp(z, z[ok], m[ok])
    # eerst de uitschieters eruit, dan glad
    from scipy.ndimage import gaussian_filter1d, median_filter
    m = gaussian_filter1d(median_filter(m, size=5, mode='nearest'), 1.5, mode='nearest')
    # de helm is star: boven de rand één waarde, gemeten waar hij het breedst en het best bepaald is
    boven = z >= HELM_VAN * H_
    m[boven] = np.median(m[(z >= HELM_VAN * H_) & (z < HELM_TOT * H_)])
    return z, m


def helm_spiegel(P, rgb, alfa, sp, goede_kant):
    """Elke run heeft één goede kant van de helm en verzint de andere donker: Z ziet zijn rechterkant goed, N zijn linkerkant. Een helm is links en rechts gelijk, dus de donkere kant krijgt het spiegelbeeld van de goede. Alleen de helm: de rest van de figuur is niet symmetrisch."""
    from scipy.spatial import cKDTree
    s = (alfa > 0.3) & ~sp
    z, H_ = P[:, 2], P[s, 2].max()
    # het midden van de koepel, en dan de breedste plak binnen de straal van een helm: wat ernaast steekt (pijlen, de boog) telt niet
    koepel = s & (z > 0.88 * H_) & (z < 0.96 * H_)
    m_ = np.median(P[koepel, :2], axis=0)
    binnen = s & (np.hypot(P[:, 0] - m_[0], P[:, 1] - m_[1]) < HELM_STRAAL)
    beste, rand = 0.0, H_
    for q in np.arange(0.77 * H_, 0.98 * H_, 0.006):
        v = binnen & (np.abs(z - q) < 0.006)
        if v.sum() > 50:
            b = float(np.ptp(np.percentile(P[v, 0], [1, 99])))
            if b > beste:
                beste, rand = b, float(q)
    v = binnen & (np.abs(z - rand) < 0.006)
    c = float(np.mean(np.percentile(P[v, 0], [1, 99])))
    helm = (z > rand - HELM_RAND) & (np.hypot(P[:, 0] - m_[0], P[:, 1] - m_[1]) < HELM_STRAAL) & ~sp
    doel = helm & ((P[:, 0] - c) * goede_kant < 0)
    bron = helm & ((P[:, 0] - c) * goede_kant > 0) & (alfa > 0.3)
    Q = P[bron].copy()
    Q[:, 0] = 2 * c - Q[:, 0]
    _, i = cKDTree(Q).query(P[doel], workers=-1)
    uit_ = rgb.copy()
    uit_[doel] = rgb[bron][i]
    return uit_, {'rand_z': round(rand, 3), 'gespiegeld': int(doel.sum())}


HELM_RAND = 0.015
HELM_STRAAL = 0.21
STREEP_BAND = 0.05
STREEP_DONKER = 0.72
STREEP_BUREN = 40


HELM_NAAD = 0.035


def helm_naad(P, rgb, alfa, sp, naad, rand_z):
    """Op de helm komen de twee runs samen met elk een eigen glans: een lichte streep van voor naar achter over de koepel. De band krijgt de kleur van wat ernaast ligt."""
    from scipy.spatial import cKDTree
    z = P[:, 2]
    koepel = (alfa > 0.05) & ~sp & (z > rand_z) & (np.hypot(P[:, 0] - np.median(P[z > rand_z + 0.1, 0]), P[:, 1] - np.median(P[z > rand_z + 0.1, 1])) < HELM_STRAAL)
    band = koepel & (np.abs(P[:, 1] - naad) < HELM_NAAD)
    bron = koepel & ~band
    uit_ = rgb.copy()
    if band.any() and bron.any():
        _, i = cKDTree(P[bron]).query(P[band], k=24, workers=-1)
        uit_[band] = np.median(rgb[bron][i], axis=1)
    return uit_, int(band.sum())


def naad_streep(P, rgb, alfa, sp, naad, boven_z):
    """Langs de naad zijn beide runs aan het raden, en dat geeft een donkere streep over mouw en laars. Wat in die band veel donkerder is dan de stof ernaast, krijgt de kleur van wat ernaast ligt. Plooien en naden die maar iets donkerder zijn, blijven."""
    from scipy.spatial import cKDTree
    z = P[:, 2]
    band = (np.abs(P[:, 1] - naad) < STREEP_BAND) & (z < boven_z) & ~sp
    bron = ~band & (alfa > 0.3) & ~sp & (z < boven_z)
    _, i = cKDTree(P[bron]).query(P[band], k=STREEP_BUREN, workers=-1)
    k = rgb[bron][i]
    # de lichtere helft van de buren: de omgeving zelf kan ook al wat donker zijn
    licht = k.mean(2)
    orde = np.argsort(-licht, axis=1)[:, :STREEP_BUREN // 2]
    m = np.take_along_axis(k, orde[:, :, None], axis=1).mean(1)
    donker = rgb[band].mean(1) < STREEP_DONKER * m.mean(1)
    uit_ = rgb.copy()
    w_ = np.nonzero(band)[0][donker]
    uit_[w_] = m[donker]
    return uit_, int(len(w_))


BOOG_PLAK = 0.015
BOOG_CEL = 0.008
BOOG_BREED = 0.07
BOOG_RAAK = 0.022
BOOG_RONDES = 400
BOOG_MARGE = 0.04
BOOG_ARM = 0.022
ARM_VAN, ARM_TOT = 0.38, 0.88
BOOG_VERF = 0.06


def boog_weg(P, alfa, rgb):
    """Wat van de boog in de wolk zit. In elke horizontale plak is hij een klein los stukje naast het lijf; door die stukjes past één gladde lijn, en daaromheen gaat het weg. Bij de arm smal, want daar is hij niet van de mouw te scheiden."""
    from scipy import ndimage as ni
    g = (alfa > 0.3) & (P[:, 0] > 0.1)
    Q = P[g]
    st = []
    for z in np.arange(0.12, 1.2, BOOG_PLAK):
        s = np.abs(Q[:, 2] - z) < BOOG_PLAK
        if s.sum() < 5:
            continue
        ix = ((Q[s, :2] - Q[s, :2].min(0)) / BOOG_CEL).astype(int)
        r = np.zeros(ix.max(0) + 2, dtype=bool)
        r[ix[:, 0], ix[:, 1]] = True
        lab, n = ni.label(r, structure=np.ones((3, 3)))
        l_ = lab[ix[:, 0], ix[:, 1]]
        for k in range(1, n + 1):
            c = Q[s][l_ == k]
            if len(c) >= 4 and np.ptp(c[:, :2], axis=0).max() < BOOG_BREED:
                st.append((c[:, 0].mean(), c[:, 1].mean(), z))
    st = np.array(st)
    leeg = np.zeros(len(P), dtype=bool)
    if len(st) < 12:
        return leeg, 0, rgb
    # de beste gladde lijn: een paar keer drie stukjes, en wie het meeste meekrijgt
    r_ = np.random.default_rng(0)
    beste = None
    for _ in range(BOOG_RONDES):
        k = r_.choice(len(st), 3, replace=False)
        if np.ptp(st[k, 2]) < 0.25:
            continue
        ax, ay = np.polyfit(st[k, 2], st[k, 0], 2), np.polyfit(st[k, 2], st[k, 1], 2)
        goed = np.hypot(st[:, 0] - np.polyval(ax, st[:, 2]), st[:, 1] - np.polyval(ay, st[:, 2])) < BOOG_RAAK
        if goed.sum() and (beste is None or np.ptp(st[goed, 2]) * goed.sum() > beste[0]):
            beste = (np.ptp(st[goed, 2]) * goed.sum(), goed)
    if beste is None or np.ptp(st[beste[1], 2]) < 0.3:
        return leeg, 0, rgb
    goed = beste[1]
    ax, ay = np.polyfit(st[goed, 2], st[goed, 0], 2), np.polyfit(st[goed, 2], st[goed, 1], 2)
    z = P[:, 2]
    d = np.hypot(P[:, 0] - np.polyval(ax, z), P[:, 1] - np.polyval(ay, z))
    uit_ = (d < np.where((z > ARM_VAN) & (z < ARM_TOT), BOOG_ARM, BOOG_MARGE)) & (P[:, 0] > 0.1)
    uit_ &= (z > st[goed, 2].min() - 0.12) & (z < st[goed, 2].max() + 0.12)
    # veren zijn wit, en van de koker
    uit_ &= ~((rgb.mean(1) > 0.5) & ((rgb.max(1) - rgb.min(1)) / np.maximum(rgb.max(1), 1e-4) < 0.35))
    # waar hij tegen de mouw lag, staat zijn verf nog op de mouw
    from scipy.spatial import cKDTree
    veeg = (d < BOOG_VERF) & (z > ARM_VAN) & (z < ARM_TOT) & ~uit_ & (P[:, 0] > 0.1)
    bron = (d > BOOG_VERF + 0.01) & (z > ARM_VAN) & (z < ARM_TOT) & (P[:, 0] > 0.1) & (alfa > 0.3)
    rgb = rgb.copy()
    if veeg.any() and bron.any():
        _, i = cKDTree(P[bron]).query(P[veeg], k=8, workers=-1)
        rgb[veeg] = np.median(rgb[bron][i], axis=1)
    return uit_, int(goed.sum()), rgb


def samen(uit, arg):
    """Twee proeven die niet werkten: vier vormen door elkaar gaf vlekken (ze liggen een centimeter uit elkaar, en de geraden kanten komen erdoorheen), en alleen de kleur overnemen werd wazig. Dus snijden: elke run houdt de helft die hij echt zag."""
    dz, dn = np.load(arg['Z']), np.load(arg['N'])
    Pz, Rz, Sz = in_onze_assen(dz, RUN_DRAAI['Z'], 1.354)
    Pn, Rn, Sn = in_onze_assen(dn, RUN_DRAAI['N'], 1.354)
    # passen op de band langs de naad: daar moeten ze op elkaar aansluiten, en de geraden kant telt dan niet mee
    # de speer komt uit Z alleen: hij is daar het best te zien, en twee runs zetten hem niet op dezelfde plek
    sz = speer_op_de_plaat(Pz, dz['alfa'])[0]
    sn = speer_op_de_plaat(Pn, dn['alfa'])[0]
    sz = np.zeros(len(Pz), dtype=bool) if sz is None else sz
    sn = np.zeros(len(Pn), dtype=bool) if sn is None else sn
    # de boog gaat uit allebei: hij komt uit code
    bz, bn, boog_seeds = np.zeros(len(Pz), dtype=bool), np.zeros(len(Pn), dtype=bool), (0, 0)
    rgb_z0, rgb_n0 = dz['rgb'].astype(np.float64), dn['rgb'].astype(np.float64)
    if 'boog' in arg:
        bz, nz, rgb_z0 = boog_weg(Pz, dz['alfa'], rgb_z0)
        bn, nn, rgb_n0 = boog_weg(Pn, dn['alfa'], rgb_n0)
        boog_seeds = (nz, nn)
    gz = (dz['alfa'] > 0.3) & (np.abs(Pz[:, 1]) < NAAD_BAND) & ~sz
    gn = (dn['alfa'] > 0.3) & (np.abs(Pn[:, 1]) < NAAD_BAND) & ~sn
    s, Ro, t_, fout = op_elkaar(Pn[gn], Pz[gz])
    Pn = s * Pn @ Ro.T + t_
    Rn = Ro @ Rn
    Sn = Sn * s
    # de naad volgt per hoogte het midden, in elke run dat van hemzelf: zo houdt elke run zijn hele helft, en sluiten ze op elkaar aan
    zb, mz = midden_per_hoogte(Pz, (dz['alfa'] > 0.3) & ~sz)
    _, mn = midden_per_hoogte(Pn, (dn['alfa'] > 0.3) & ~sn)
    n_ = min(len(mz), len(mn))
    zb, mz, mn = zb[:n_], mz[:n_], mn[:n_]
    Pn[:, 1] += np.interp(Pn[:, 2], zb, mz - mn)
    naad_z, naad_n = np.interp(Pz[:, 2], zb, mz), np.interp(Pn[:, 2], zb, mz)
    hz = ((Pz[:, 1] < naad_z + NAAD_OVERLAP) | sz) & ~bz
    hn = (Pn[:, 1] >= naad_n - NAAD_OVERLAP) & ~sn & ~bn
    rgb_z, helm_z = helm_spiegel(Pz, rgb_z0, dz['alfa'], sz, -1.0)
    rgb_n, helm_n = helm_spiegel(Pn, rgb_n0, dn['alfa'], sn, 1.0)
    Pa = np.vstack([Pz[hz], Pn[hn]])
    alfa_a = np.concatenate([dz['alfa'][hz], dn['alfa'][hn]])
    sp_a = np.concatenate([sz[hz], np.zeros(int(hn.sum()), dtype=bool)])
    rgb_a, streep = naad_streep(Pa, np.vstack([rgb_z[hz], rgb_n[hn]]), alfa_a, sp_a, np.interp(Pa[:, 2], zb, mz), helm_z['rand_z'] - HELM_RAND)
    rgb_a, helm_band = helm_naad(Pa, rgb_a, alfa_a, sp_a, np.interp(Pa[:, 2], zb, mz), helm_z['rand_z'])
    np.savez_compressed(uit, xyz=Pa.astype(np.float32), matrix=np.concatenate([Rz[hz], Rn[hn]]).astype(np.float32), schaal=np.vstack([Sz[hz], Sn[hn]]).astype(np.float32),
                        rgb=rgb_a.astype(np.float32), alfa=alfa_a.astype(np.float32))
    info = {'schaal': round(s, 4), 'draai_graden': round(float(np.degrees(np.arccos(np.clip((np.trace(Ro) - 1) / 2, -1, 1)))), 2), 'icp_fout_m': round(fout, 4), 'naad_verschil_cm': round(float(np.abs(mz - mn).max() * 100), 1), 'voor': int(hz.sum()), 'achter': int(hn.sum()), 'speer_uit_Z': int(sz.sum()), 'speer_uit_N_weg': int(sn.sum()), 'helm_Z': helm_z, 'helm_N': helm_n, 'naad_streep': streep, 'helm_band': helm_band, 'boog_punten': [int(bz.sum()), int(bn.sum())], 'boog_dun': boog_seeds}
    json.dump(info, open(os.path.splitext(uit)[0] + '.json', 'w', encoding='utf-8'), indent=1)
    print(json.dumps(info))


ZWEVER = 1500


def zwevers(U, zicht):
    """Wat in deze houding los in de lucht hangt: stukjes hand en oksel die de snede bij het lijf liet. Kleine stukken in de buurgraaf."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import hy_mesh as M
    s = np.nonzero(zicht)[0]
    lab = M.stukken(len(s), buur_vlakken(U[s]))
    tel = np.bincount(lab)
    uit_ = np.zeros(len(U), dtype=bool)
    uit_[s[tel[lab] < ZWEVER]] = True
    return uit_


def buur_vlakken(P, k=7, ver=0.02):
    """Gaussians hebben geen vlakken, en hy_rig rekent daarmee zijn buren en sneden uit. Driehoeken uit de dichtste buren zijn genoeg: alleen wie naast wie ligt, telt."""
    from scipy.spatial import cKDTree
    d, i = cKDTree(P).query(P, k=k, workers=-1)
    r = []
    for a in range(1, k - 1):
        s = (d[:, a] < ver) & (d[:, a + 1] < ver)
        r.append(np.stack([np.nonzero(s)[0], i[s, a], i[s, a + 1]], axis=1))
    return np.vstack(r).astype(np.int64)


def speer_uit_mesh(pad, n=40000):
    """De speer van de mesh als Gaussians: gelijkmatig over zijn vlakken. Geeft ook de voet en de top, de twee laatste punten van de mesh."""
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import hy_kleur as K
    d = np.load(pad)
    sp = d['deel'] == 3
    F = d['F'][sp[d['F']].all(1)]
    V = d['V'].astype(np.float64)
    A = np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1)
    r = np.random.default_rng(0)
    f = r.choice(len(F), n, p=A / A.sum())
    b = r.dirichlet((1, 1, 1), n)
    P = (V[F[f]] * b[:, :, None]).sum(1)
    k = (d['kleur'][F[f]] * b[:, :, None]).sum(1)
    voet, top = V[sp][-2], V[sp][-1]
    return P, np.clip(K.lin_srgb(k), 0, 1), voet, top


# Hoe hij de speer houdt (Marcel, 1 nov). Staan: één hand, de onderkant op de grond. Lopen: twee handen, schuin voor zich, van zijn rechtervoet naar zijn linkerschouder. Steken: twee handen, door de knieën, en doorzetten.
DRAAG_HAND = (-0.05, -0.17, 0.68)
DRAAG_AF = 0.24
DRAAG_SCHUIF = 0.1
BOVEN_GROND = 0.04
# De steek: lijf en benen uit `steek2` in hy_v4_pose (24 beelden), de speer en de armen van hier. Eerst kantelen en terugnemen, dan doorstoten, rustiger terug.
STEEK_N = 24
STEEK_J = [0, 2, 4, 6, 8, 10, 12, 15, 18, 21]
STEEK_RICHTING = (0.0, -1.0, 0.13)
STEEK_TERUG = (-0.08, -0.08, 0.68)
STEEK_VOOR = (-0.05, -0.27, 0.67)
STEEK_AF = 0.2
STEEK_SCHUIF = 0.24
ARM_STRAAL_M = 0.055
POLS_M = 0.06
VUIST_M = 0.075
ELLEBOOG_ZACHT = 0.08
SPEER_LOS = 0.015
SPEER_LOS_DEEL = 0.1


def _zacht(x):
    x = float(np.clip(x, 0, 1))
    return x * x * (3 - 2 * x)


def steek_stand(t):
    """Hoe ver de speer gekanteld is, hoe ver de hand naar voren is, en hoe ver de linkerhand op de schacht is, op tijd t van 0 tot 1."""
    kiep = _zacht(t / 0.26) * (1 - _zacht((t - 0.64) / 0.3))
    stoot = _zacht((t - 0.22) / 0.2) * (1 - _zacht((t - 0.56) / 0.3))
    links = _zacht(t / 0.2) * (1 - _zacht((t - 0.7) / 0.22))
    return kiep, stoot, links


# De boog (Marcel, 1 nov: de boogschutter; de plaat `aardschok-boogschutter-draai.png`). De run zet hem op de verkeerde diepte en niet door de hand, dus hij komt uit code, als Gaussians, zodat de pees mee kan met de hand. Lokaal: x opzij, y naar voren (de rug van de boog), z langs de boog; (0, 0, 0) is de greep.
BOOG_HALF = 0.47
BOOG_BOL = 0.13
BOOG_KRUL = 0.06
BOOG_N, PEES_N, PIJL_N = 12000, 1200, 2000
BOOG_HOUT = (0.50, 0.25, 0.10)
BOOG_GREEP = (0.27, 0.21, 0.17)
PEES_KLEUR = (0.66, 0.60, 0.50)
PEES_ALFA = 0.5
PIJL_HOUT = (0.74, 0.56, 0.32)
PIJL_LANG = 0.68
BOOG_AS_RUST = (0.06, -0.32, 0.945)
BOOG_AS_SCHIET = (-0.08, 0.0, 1.0)
SCHIET_LINKS = (0.05, -0.42, 0.94)
SCHIET_BEGIN = (0.0, -0.24, 0.95)
SCHIET_ANKER = (-0.02, -0.13, 0.97)
SCHIET_LOS = (-0.06, -0.08, 0.99)
BOOG_ALFA = 0.95
KOKER_Y = 0.12
HELM_Z = 1.08


def boog_lijn(s):
    """De hartlijn van de boog in zijn eigen assen, s van -1 (onder) tot 1 (boven): naar achteren gebogen, met de uiteinden weer naar voren."""
    a = np.abs(s)
    return np.stack([0 * s, -BOOG_BOL * s * s + BOOG_KRUL * (np.clip(a - 0.78, 0, None) / 0.22) ** 2, s * BOOG_HALF], axis=-1)


def boog_lokaal():
    """De Gaussians van de boog, de pees en de pijl, lokaal: punten, kleur, sigma. De pees en de pijl krijgen hun plek per beeld."""
    r = np.random.default_rng(1)
    s = r.uniform(-1, 1, BOOG_N)
    c = boog_lijn(s)
    t_ = boog_lijn(np.clip(s + 0.01, -1, 1)) - boog_lijn(np.clip(s - 0.01, -1, 1))
    t_ /= np.linalg.norm(t_, axis=1, keepdims=True)
    e_x = np.tile(np.array([1.0, 0, 0]), (BOOG_N, 1))
    e_d = np.cross(t_, e_x)
    th = r.uniform(0, 2 * np.pi, BOOG_N)
    st = 0.018 - 0.008 * np.abs(s) ** 1.5
    P_ = c + st[:, None] * (np.cos(th)[:, None] * e_x + np.sin(th)[:, None] * e_d)
    # hout met nerf en een lichte kant, een donkere wikkel om de greep
    licht = 0.72 + 0.5 * np.clip(np.sin(th) * 0.6 + np.cos(th) * 0.4, 0, 1)
    nerf = 1 + 0.08 * np.sin(s * 37.0) + r.normal(0, 0.03, BOOG_N)
    k = np.array(BOOG_HOUT) * (licht * nerf)[:, None]
    g = np.abs(s) < 0.13
    k[g] = np.array(BOOG_GREEP) * (licht[g] * (1 + 0.25 * np.sign(np.sin(s[g] * 90.0))))[:, None]
    u = r.uniform(0, 1, PEES_N)
    w_ = r.uniform(0, 1, PIJL_N)
    return {'P': P_, 'rgb': np.clip(k, 0, 1), 's': np.full(BOOG_N, 0.0045), 'u': u, 'w': w_, 'hoek': r.uniform(0, 2 * np.pi, PIJL_N)}


def assen_boog(as_):
    e_z = np.array(as_, dtype=np.float64)
    e_z /= np.linalg.norm(e_z)
    e_y = np.array([0.0, -1.0, 0.0]) - (np.array([0.0, -1.0, 0.0]) @ e_z) * e_z
    e_y /= np.linalg.norm(e_y)
    return np.stack([np.cross(e_y, e_z), e_y, e_z], axis=1)


def pees_en_pijl(L, nok, pijl):
    """De pees (van de tippen naar de nok) en de pijl (van de nok door de greep), lokaal. Kleur van de pijl per punt: veren, hout en een stalen punt."""
    top, bodem = boog_lijn(np.array([1.0]))[0], boog_lijn(np.array([-1.0]))[0]
    u = L['u']
    Ps = np.where((u < 0.5)[:, None], top + (nok - top) * (u / 0.5)[:, None], bodem + (nok - bodem) * ((u - 0.5) / 0.5)[:, None])
    v = np.array([0.012, 0.0, 0.0]) - nok
    v /= np.linalg.norm(v)
    w_ = L['w'] * PIJL_LANG
    Pp = nok + v[None] * w_[:, None]
    # de veren staan aan het eind bij de nok, een klein waaiertje
    dwars = np.cross(v, np.array([0.0, 0.0, 1.0]))
    dwars /= max(np.linalg.norm(dwars), 1e-6)
    veer = w_ < 0.09
    Pp[veer] += (np.cos(L['hoek'][veer])[:, None] * dwars + np.sin(L['hoek'][veer])[:, None] * np.array([0.0, 0.0, 1.0])) * 0.014
    return Ps, Pp


def schiet_stand(t):
    """De boog omhoog, de rechterhand naar de pees, spannen, loslaten en terug: hoe ver elk is op tijd t."""
    op = _zacht(t / 0.28) * (1 - _zacht((t - 0.74) / 0.24))
    hand = _zacht((t - 0.06) / 0.24) * (1 - _zacht((t - 0.74) / 0.24))
    trek = _zacht((t - 0.3) / 0.24)
    los = t >= 0.6
    return op, hand, trek, los


WAAS_M = 0.01
GREEP_STRAAL = 0.07
SPEER_SIGMA = 0.0035
SPEER_ALFA = 0.85


def rig(pad, beweging, mesh, map_, arg):
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import hy_kleur as K
    import hy_rig as H
    d = np.load(pad)
    bw = np.load(beweging)
    os.makedirs(map_, exist_ok=True)
    P, R, S = in_onze_assen(d, float(arg.get('draai', 0)), 1.354)
    alfa = d['alfa'].astype(np.float64)
    zicht = alfa > 0.05
    kleur = K.srgb_lin(d['rgb'].astype(np.float64))
    rgb = d['rgb'].astype(np.float64)
    deel = np.zeros(len(P), dtype=np.int8)
    namen = [str(x) for x in bw['namen']]
    ouders = [str(x) for x in bw['ouders']]
    rust = bw['rust']
    ix = {b: i for i, b in enumerate(namen)}
    boog = arg.get('wapen') == 'boog'
    speer, as_, top_z = (None, None, None) if boog else speer_op_de_plaat(P, alfa)
    eigen_speer = speer is not None
    if boog:
        voet, top = np.zeros(3), np.array([0.0, 0.0, 1.0])
    elif eigen_speer:
        deel[speer] = 3
        voet = np.array([np.polyval(as_[0], 0.0), np.polyval(as_[1], 0.0), 0.0])
        top = np.array([np.polyval(as_[0], top_z), np.polyval(as_[1], top_z), top_z])
    if not boog and not eigen_speer:
        # een plaat zonder speer: die van de mesh, als Gaussians erbij
        sp_P, sp_rgb, voet, top = speer_uit_mesh(mesh)
        P = np.vstack([P, sp_P])
        R = np.concatenate([R, np.tile(np.eye(3), (len(sp_P), 1, 1))])
        S = np.vstack([S, np.full((len(sp_P), 3), SPEER_SIGMA)])
        rgb = np.vstack([rgb, sp_rgb])
        alfa = np.concatenate([alfa, np.full(len(sp_P), SPEER_ALFA)])
        deel = np.concatenate([deel, np.full(len(sp_P), 3, dtype=np.int8)])
    zicht = alfa > 0.05
    speer = deel == 3
    if eigen_speer:
        # op spelmaat moet de schacht minstens twee pixels breed zijn (`modelleren`: overdrijf wat dun is); de as blijft waar hij is
        As = np.stack([np.polyval(as_[0], P[speer, 2]), np.polyval(as_[1], P[speer, 2])], axis=1)
        P[speer, :2] = As + (P[speer, :2] - As) * SPEER_DIK
        S[speer] *= SPEER_DIK
    kleur = K.srgb_lin(rgb)
    F = buur_vlakken(P)
    m = H.maten_figuur(P[zicht], kleur[zicht], deel[zicht])
    if eigen_speer:
        # de rechterarm staat al goed; zijn schouder is het spiegelbeeld van links
        m['speerarm_vast'] = True
        m['schouder.R'] = [-m['schouder.L'][0], m['schouder.L'][1], m['schouder.L'][2]]
    if boog:
        # de boogarm staat al goed: hij hoeft niet te buigen om te lopen. De boog zelf komt hierna, in de hand
        m['boogarm_vast'] = True
    arm, Fa, z_boven, snede = H.arm_los(P, F, kleur, deel, m)
    if boog:
        # de hand is het eind van de arm, en de elleboog de plek die het verst van de lijn schouder-hand ligt: hij hangt niet recht, en de maten uit het buitenprofiel kijken alleen van voren
        for k_, s_k in (('R', -1.0), ('L', 1.0)):
            ar = arm & (P[:, 0] * s_k > 0) & zicht & (P[:, 1] < KOKER_Y)
            S_ = np.array(m['schouder.' + k_])
            d_s = np.linalg.norm(P[ar] - S_, axis=1)
            G_ = P[ar][d_s > np.percentile(d_s, 93)].mean(0)
            d_l = H.seg_afstand(P[ar], S_, G_)
            buiten = P[ar][d_l > np.percentile(d_l, 97)].mean(0)
            v_ = G_ - S_
            lijn = S_ + np.clip((buiten - S_) @ v_ / (v_ @ v_), 0, 1) * v_
            afst = np.linalg.norm(lijn - buiten)
            Ell = lijn if afst <= ARM_STRAAL_M else buiten + (lijn - buiten) / afst * ARM_STRAAL_M
            m['elleboog.' + k_] = Ell.tolist()
            m['pols.' + k_] = (G_ + (Ell - G_) / np.linalg.norm(Ell - G_) * POLS_M).tolist()
            m['hand.' + k_] = G_.tolist()
    if eigen_speer:
        # de greep en de elleboog, op de arm zoals hij op de plaat staat
        dg = np.hypot(P[:, 0] - np.polyval(as_[0], P[:, 2]), P[:, 1] - np.polyval(as_[1], P[:, 2]))
        greep_z = float(np.median(P[arm & (dg < GREEP_STRAAL), 2]))
        G_rust = np.array([np.polyval(as_[0], greep_z), np.polyval(as_[1], greep_z), greep_z])
        ar = arm & (P[:, 0] < 0) & zicht & (dg > GREEP_STRAAL)
        S_ = np.array(m['schouder.R'])
        d_lijn = H.seg_afstand(P[ar], S_, G_rust)
        buiten = P[ar][d_lijn > np.percentile(d_lijn, 97)].mean(0)
        v_ = G_rust - S_
        t_ = np.clip((buiten - S_) @ v_ / (v_ @ v_), 0, 1)
        lijn = S_ + t_ * v_
        Ell = buiten + (lijn - buiten) / np.linalg.norm(lijn - buiten) * ARM_STRAAL_M
        m['elleboog.R'] = Ell.tolist()
        m['pols.R'] = (G_rust + (Ell - G_rust) / np.linalg.norm(Ell - G_rust) * POLS_M).tolist()
        m['hand.R'] = G_rust.tolist()
    J = H.gewrichten(m)
    rok, been, Fk, gesneden = H.rok_en_been(P, Fa, kleur, deel, m, J, arm)
    W = H.gewichten(P, Fk, deel, J, m, rok, been, arm, z_boven, namen)
    if eigen_speer or boog:
        # de armen in drie: bovenarm, onderarm en de hand, zacht over de elleboog. Ze buigen nu flink, en de gewichten uit de afstand scheuren dan
        for k_, s_k, G_k in (('R', -1.0, G_rust if eigen_speer else np.array(m['hand.R'])), ('L', 1.0, np.array(m['hand.L']))):
            s = arm & (P[:, 0] * s_k > 0)
            d_b = H.seg_afstand(P[s], J['bovenarm.' + k_], J['onderarm.' + k_])
            d_o = H.seg_afstand(P[s], J['onderarm.' + k_], J['hand.' + k_])
            d_h = np.linalg.norm(P[s] - G_k, axis=1)
            w_o = np.clip((d_b - d_o) / ELLEBOOG_ZACHT + 0.5, 0, 1)
            w_h = np.clip((VUIST_M + 0.02 - d_h) / 0.04, 0, 1)
            W[s] = 0
            W[s, ix['bovenarm.' + k_]] = (1 - w_o) * (1 - w_h)
            W[s, ix['onderarm.' + k_]] = w_o * (1 - w_h)
            W[s, ix['hand.' + k_]] = w_h
        W[speer] = 0
        W[speer, ix['hand.R']] = 1.0
        # de gladstrijkronde legt de hand ook op randjes naast de speer: half aan de hand en half aan het hoofd werd dat een lijn van stippen
        rest_ = (deel == 0) & ~arm
        W[np.ix_(rest_, [ix['hand.R'], ix['hand.L']])] = 0
        W[rest_] /= np.maximum(W[rest_].sum(1, keepdims=True), 1e-9)
    if boog:
        # de koker en de veren zitten vast op de rug: niet aan de rok, niet aan het hoofd, niet aan de arm
        z_, r_h = P[:, 2], np.hypot(P[:, 0] - np.median(P[zicht & (P[:, 2] > 1.2), 0]), P[:, 1] - np.median(P[zicht & (P[:, 2] > 1.2), 1]))
        koker = (deel == 0) & (((P[:, 1] > KOKER_Y) & (z_ > 0.5) & (z_ < HELM_Z)) | ((P[:, 0] > 0.1) & (P[:, 1] > 0.02) & (z_ > 0.93) & (z_ < 1.22) & (r_h > HELM_STRAAL)))
        W[koker] = 0
        W[koker, ix['borst']] = 1.0
    if eigen_speer:
        # de lijn van het lopen: in de richting van zijn rechtervoet naar zijn linkerschouder, voor zijn buik langs, door de plek die zijn rechterhand haalt
        d_draag = (J['bovenarm.L'] - J['voet.R']) * np.array([1.0, 0.0, 1.0])
        d_draag /= np.linalg.norm(d_draag)
        G_draag = np.array(DRAAG_HAND)
        D_draag = H.draai_van_naar(np.array([0, 0, 1.0]), d_draag)

    if boog:
        G_boog = np.array(m['hand.L'])
        R_rust, R_schiet = assen_boog(BOOG_AS_RUST), assen_boog(BOOG_AS_SCHIET)
        L_boog = boog_lokaal()
        nok_rust = boog_lijn(np.array([1.0]))[0] * np.array([1.0, 1.0, 0.0])
        pols_rust = J['hand.R'].copy()
        # de boog als Gaussians erbij; de pees en de pijl staan achteraan, en krijgen hun plek per beeld
        n_b = BOOG_N + PEES_N + PIJL_N
        n0 = len(P)
        lok = np.vstack([L_boog['P'], np.zeros((PEES_N + PIJL_N, 3))])
        rood = np.vstack([L_boog['rgb'], np.tile(np.array(PEES_KLEUR), (PEES_N, 1)), np.tile(np.array(PIJL_HOUT), (PIJL_N, 1))])
        w_p = L_boog['w'] * PIJL_LANG
        rood[BOOG_N + PEES_N:][w_p < 0.09] = (0.93, 0.92, 0.88)
        rood[BOOG_N + PEES_N:][w_p > PIJL_LANG - 0.05] = (0.62, 0.64, 0.68)
        sig = np.concatenate([L_boog['s'], np.full(PEES_N, 0.0022), np.full(PIJL_N, 0.0042)])
        P = np.vstack([P, G_boog + lok @ R_rust.T])
        R = np.concatenate([R, np.tile(np.eye(3), (n_b, 1, 1))])
        S = np.vstack([S, sig[:, None] * np.ones((n_b, 3))])
        rgb = np.vstack([rgb, rood])
        alfa = np.concatenate([alfa, np.full(BOOG_N, BOOG_ALFA), np.full(PEES_N, PEES_ALFA), np.full(PIJL_N, BOOG_ALFA)])
        deel = np.concatenate([deel, np.full(n_b, 3, dtype=np.int8)])
        speer = deel == 3
        zicht = alfa > 0.05
        kleur = K.srgb_lin(rgb)
        W = np.vstack([W, np.zeros((n_b, W.shape[1]), dtype=W.dtype)])
        W[n0:, ix['hand.L']] = 1.0
        rok, been, arm = (np.concatenate([q_, np.zeros(n_b, dtype=bool)]) for q_ in (rok, been, arm))

    def greep_voor(houding, t_):
        if boog:
            if houding != 'aanval':
                return None
            op, hd_, trek, los = schiet_stand(t_)
            as_ = (1 - op) * np.array(BOOG_AS_RUST) + op * np.array(BOOG_AS_SCHIET)
            links = (1 - op) * G_boog + op * np.array(SCHIET_LINKS)
            doel_r = (1 - trek) * np.array(SCHIET_BEGIN) + trek * np.array(SCHIET_ANKER)
            if los:
                doel_r = np.array(SCHIET_LOS)
            return {'links': links, 'rechts': (1 - hd_) * pols_rust + hd_ * doel_r, 'R_boog': assen_boog(as_), 'pees': 0.3 <= t_ < 0.6}
        if not eigen_speer or houding == 'staan':
            return None
        if houding == 'lopen':
            return {'plek': G_draag, 'draai': D_draag, 'in_borst': True, 'links': 1.0, 'af': DRAAG_AF, 'rol': 1.0, 'schuif': DRAAG_SCHUIF}
        kp, st, ln = steek_stand(t_)
        v_ = (1 - kp) * np.array([0, 0, 1.0]) + kp * np.array(STEEK_RICHTING)
        hand_ = (1 - st) * np.array(STEEK_TERUG) + st * np.array(STEEK_VOOR)
        return {'plek': (1 - kp) * G_rust + kp * hand_, 'draai': H.draai_van_naar(np.array([0, 0, 1.0]), v_), 'links': ln, 'af': STEEK_AF, 'rol': kp, 'schuif': STEEK_SCHUIF * kp}

    info = {'maten': {k: v for k, v in m.items() if k in ('H', 'zoom', 'riem')}, 'arm': int(arm.sum()), 'rok': int(rok.sum()), 'been': int(been.sum()), 'speer': int(speer.sum()), 'eigen_speer': eigen_speer, 'arm_tot': z_boven, 'arm_lengtes': [round(float(np.linalg.norm(J['onderarm.R'] - J['bovenarm.R'])), 3), round(float(np.linalg.norm(J['hand.R'] - J['onderarm.R'])), 3)], 'greep': np.round(J['hand.R'], 3).tolist(), 'elleboog': np.round(J['onderarm.R'], 3).tolist(), 'schouder': np.round(J['bovenarm.R'], 3).tolist()}
    print(json.dumps(info))
    json.dump(info, open(os.path.join(map_, 'rig.json'), 'w', encoding='utf-8'), indent=1)
    Q0 = R * S[:, None, :]
    # de binnenkant van de rok die bij het been hoort, steekt in de pas onder de zoom uit: daar is hij broek
    broek = been & (K.klasse(kleur) == 0) & (P[:, 2] > m['zoom'] - 0.1) & (P[:, 2] < m['zoom'])
    fout = been & (K.klasse(kleur) > 0)
    if broek.sum() > 100:
        rgb = rgb.copy()
        m_broek = np.median(rgb[broek], axis=0)
        rgb[fout] = np.clip(m_broek * (rgb[fout].mean(1, keepdims=True) / m_broek.mean()), 0, 1)
    info['been_kleur'] = int(fout.sum())
    # het waas boven de helm: bijna doorzichtig, maar groot genoeg om te zien
    alfa = np.where(zicht & ((P[:, 2] < 1.354 + WAAS_M) | speer), alfa, 0.0)
    zicht = alfa > 0.05
    alfa = alfa.copy()
    if eigen_speer:
        # de speer is één ding: wat er los bij hangt, zijn spikkels van de run
        import hy_mesh as M
        s_ = np.nonzero(speer & zicht)[0]
        lab = M.stukken(len(s_), buur_vlakken(P[s_], ver=SPEER_LOS))
        tel_ = np.bincount(lab)
        alfa[s_[tel_[lab] < SPEER_LOS_DEEL * tel_.max()]] = 0
        zicht = alfa > 0.05
    # zwevers: gemeten in elke houding, op het verste punt: wat dan los in de lucht hangt, hoort nergens bij
    weg = np.zeros(len(P), dtype=bool)
    for h_, b_ in (('staan', 0), ('lopen', 0), ('lopen', 6)) + ((('steek2', 6), ('steek2', 12)) if eigen_speer else ()) + ((('schiet', 12),) if boog else ()):
        steek_ = h_ in ('steek2', 'schiet')
        zw_ = 0.0 if steek_ else float(H.zwaai_van(bw[h_], rust, ix, h_ == 'lopen')[b_])
        Dz, Pz = H.beeld_van(bw[h_][b_], rust, namen, ouders, J, m, zw_, greep_voor('aanval' if steek_ else h_, b_ / STEEK_N))
        weg |= zwevers(H.vervorm(P, W, Dz, Pz, J, namen), zicht)
    alfa[weg] = 0
    zicht = alfa > 0.05
    info['zwevers'] = int(weg.sum())
    print('zwevers', int(weg.sum()))
    D0, P0 = H.beeld_van(bw['staan'][0], rust, namen, ouders, J, m, 0.0)
    if boog:
        grip, grip_z, hand_punt = G_boog, float(G_boog[2]), G_boog
    elif eigen_speer:
        # de speer hangt aan de vuist, op de greep
        grip_z = greep_z
        grip = G_rust
        hand_punt = grip
    else:
        grip_z = float((P0[ix['hand.R']] + D0[ix['hand.R']] @ (np.array(m['hand.R']) - J['hand.R']))[2])
        grip = np.array([voet[0], voet[1], grip_z])
        hand_punt = np.array(m['hand.R'])
    info['greep_z'] = round(grip_z, 3)
    sp_P = P[speer]
    D_sp0 = np.linalg.inv(D0[ix['speer']])
    # op de plaat staat hij recht; de run raadt hem in de diepte scheef
    D_recht = H.draai_van_naar(top - voet, np.array([0, 0, 1.0])) if eigen_speer else np.eye(3)
    richtingen = arg.get('richtingen', 'Z,ZW,W,NW,N,NO,O,ZO').split(',')
    e, pixels, ortho, doel = float(arg.get('elevatie', 30)), int(arg.get('pixels', 768)), float(arg.get('ortho', 3.0)), float(arg.get('doel', 0.74))
    t0 = time.time()
    tel = 0
    for houding in arg.get('houdingen', 'staan,lopen').split(','):
        steek = houding == 'aanval'
        lijst = bw['schiet' if boog else 'steek2'][STEEK_J] if steek else bw[houding]
        zw = None if steek else H.zwaai_van(lijst, rust, ix, houding == 'lopen')
        for i in range(0, len(lijst), int(arg.get('stap', 1))):
            greep_nu = greep_voor(houding, STEEK_J[i] / STEEK_N if steek else 0.0)
            zw_i = 0.0 if steek else float(zw[i])
            Dm, Pm = H.beeld_van(lijst[i], rust, namen, ouders, J, m, zw_i, greep_nu)
            U = H.vervorm(P, W, Dm, Pm, J, namen)
            # de vervorming per Gaussian: de gewogen draaiing van zijn botten
            B = np.zeros((len(P), 3, 3))
            for j in range(len(namen)):
                s = W[:, j] > 1e-5
                if s.any():
                    B[s] += W[s, j, None, None] * Dm[j]
            z0 = U[zicht & ~speer, 2].min()
            U[:, 2] -= z0
            Q = np.einsum('nij,njk->nik', B, Q0)
            if boog:
                # de boog: rigide met de hand, of in de stand van het schieten; de pees naar de hand, en de pijl op de pees zolang hij gespannen is
                hL = Pm[ix['hand.L']] + Dm[ix['hand.L']] @ (G_boog - J['hand.L'])
                hL[2] -= z0
                R_b = greep_nu['R_boog'] if greep_nu else Dm[ix['hand.L']] @ R_rust
                nok, pijl_aan = nok_rust, False
                if greep_nu and greep_nu['pees']:
                    hr = Pm[ix['hand.R']] + Dm[ix['hand.R']] @ (np.array(m['hand.R']) - J['hand.R'])
                    hr[2] -= z0
                    nok, pijl_aan = (hr - hL) @ R_b, True
                Ps, Pp = pees_en_pijl(L_boog, nok, pijl_aan)
                lok_f = np.vstack([L_boog['P'], Ps, Pp])
                Ur = U.copy()
                Ur[speer] = hL + lok_f @ R_b.T
                alfa_f = alfa.copy()
                if not pijl_aan:
                    alfa_f[len(alfa) - PIJL_N:] = 0
                Qr = Q.copy()
                Qr[speer] = Q0[speer]
                for r in richtingen:
                    render(Ur, Qr, rgb, alfa_f, r, e, pixels, ortho, doel).save(os.path.join(map_, f'{houding}-{r}-{i:02d}.png'))
                    tel += 1
                continue
            bot = ix['hand.R']
            h = Pm[bot] + Dm[bot] @ (hand_punt - J[namen[bot]])
            h[2] -= z0
            # de speer staat in de eerste stand zoals in rust, en beweegt daarna zoals die van V4; met twee handen zoals de greep zegt
            D_sp = Dm[ix['speer']] @ D_recht if greep_nu else Dm[ix['speer']] @ D_sp0 @ D_recht
            sp = (sp_P - grip) @ D_sp.T + h
            a_ = (voet - grip) @ D_sp.T + h
            b_ = (top - grip) @ D_sp.T + h
            as_v = (b_ - a_) / np.linalg.norm(b_ - a_)
            # de speer schuift door de hand: staand rust hij op de grond, en verder raakt hij hem niet
            schuif = greep_nu['schuif'] if greep_nu else 0.0
            if eigen_speer and as_v[2] > 0.3:
                if greep_nu is None:
                    schuif = -a_[2] / as_v[2]
                elif a_[2] + schuif * as_v[2] < BOVEN_GROND:
                    schuif = (BOVEN_GROND - a_[2]) / as_v[2]
            sp, a_, b_ = sp + as_v * schuif, a_ + as_v * schuif, b_ + as_v * schuif
            Kx = np.array([[0, -as_v[2], as_v[1]], [as_v[2], 0, -as_v[0]], [-as_v[1], as_v[0], 0]])
            Q_sp = np.einsum('ij,njk->nik', D_sp, Q0[speer])
            for r in richtingen:
                # het brede blad naar de camera, zoals `speerkijkt` in hy_kijk: anders is hij in W en O een streep
                # de kant die de run zag, naar de camera, om de as van de speer: anders wordt hij donker als hij ligt, en een streep van opzij
                a_r, e_r = np.radians(-RICHTING[r]), np.radians(e)
                cam = np.array([-np.sin(a_r) * np.cos(e_r), -np.cos(a_r) * np.cos(e_r), np.sin(e_r)])
                f0 = D_sp @ np.array([0.0, -1.0, 0.0])
                fp, cp = f0 - (f0 @ as_v) * as_v, cam - (cam @ as_v) * as_v
                hk = np.arctan2(as_v @ np.cross(fp, cp), fp @ cp)
                Rk = np.eye(3) + np.sin(hk) * Kx + (1 - np.cos(hk)) * Kx @ Kx
                Ur, Qr = U.copy(), Q.copy()
                Ur[speer] = (sp - a_) @ Rk.T + a_
                Qr[speer] = np.einsum('ij,njk->nik', Rk, Q_sp)
                beeld = render(Ur, Qr, rgb, alfa, r, e, pixels, ortho, doel)
                beeld.save(os.path.join(map_, f'{houding}-{r}-{i:02d}.png'))
                tel += 1
    print('renders', tel, round(time.time() - t0, 1), 's')


def main():
    if sys.argv[1] == 'rig':
        rig(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5], dict(a.split('=', 1) for a in sys.argv[6:] if '=' in a))
        return
    if sys.argv[1] == 'samen':
        samen(sys.argv[2], dict(a.split('=', 1) for a in sys.argv[3:] if '=' in a))
        return
    arg = dict(a.split('=', 1) for a in sys.argv[4:] if '=' in a)
    if sys.argv[1] == 'maak':
        maak(sys.argv[2], sys.argv[3], arg)
    elif sys.argv[1] == 'verf':
        verf(sys.argv[2], sys.argv[3], arg)
    else:
        kijk(sys.argv[2], sys.argv[3], arg)


if __name__ == '__main__':
    main()
