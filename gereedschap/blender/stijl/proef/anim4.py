# De animatiecontrole van vormproef V4 (vraag 192): rust en lopen, de overgang daartussen, hand en speer, voeten op de grond, en sprongen in de botten. Rekent op het skelet en de vervormde mesh; wat mooi is, meet dit niet.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/anim4.py -- <uit.json>
import json
import math
import os
import sys

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import pose4 as P4  # noqa: E402
import skelet as S  # noqa: E402

GRIP = np.array(S.GREEP) * S.HAND_SCHAAL


def punten(h):
    """De punten waar een sprong het meest opvalt, in de wereld."""
    M = h.matrices()
    sp = M['speer']
    return {'bekken': M['bekken'][:3, 3], 'voet.L': M['voet.L'][:3, 3], 'voet.R': M['voet.R'][:3, 3], 'hand.R': M['hand.R'][:3, 3], 'hand.L': M['hand.L'][:3, 3], 'speerpunt': sp[:3, 3] + sp[:3, 1] * 1.1, 'hoofd': M['hoofd'][:3, 3]}


def greep_fout(h):
    M = h.matrices()
    hand = M['hand.R'][:3, :3] @ GRIP + M['hand.R'][:3, 3]
    as_ = M['speer'][:3, 1]
    d = hand - M['speer'][:3, 3]
    return float(np.linalg.norm(d - as_ * (d @ as_)))


def overgang(rust, idle):
    """Het spel wisselt zonder overvloeien van vel. Welk loopbeeld ligt het dichtst bij de rust, en hoe ver springt alles dan?"""
    a = punten(idle(rust, 0.0))
    beste = None
    for i in range(12):
        b = punten(P4.PRODUCTIE['lopen'](rust, i / 12))
        d = {k: float(np.linalg.norm(a[k] - b[k])) for k in a}
        m = max(d.values())
        if beste is None or m < beste['grootste']:
            beste = {'beeld': i, 'grootste': m, 'per_punt': {k: round(v, 3) for k, v in d.items()}}
    beste['grootste'] = round(beste['grootste'], 3)
    return beste


def hoek(a, b):
    r = a.T @ b
    return math.degrees(math.acos(max(-1.0, min(1.0, (np.trace(r) - 1) / 2))))


def zool_contact(arm_, rust, houding, t):
    B.zet(arm_, rust, houding, t, 0.0)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    ob = bpy.data.objects['laarzen'].evaluated_get(dg)
    me = ob.to_mesh()
    v = np.zeros(len(me.vertices) * 3)
    me.vertices.foreach_get('co', v)
    ob.to_mesh_clear()
    v = v.reshape(-1, 3)
    uit = {}
    M = F  # noqa: F841
    h = B.HOUDING[houding](rust, t, 0.0)
    for n, s in (('.L', 1), ('.R', -1)):
        k = h.kop['voet' + n]
        q = v[np.linalg.norm(v[:, :2] - k[:2], axis=1) < 0.35]
        q = q[np.sign(q[:, 0] - (h.kop['voet.L'][0] + h.kop['voet.R'][0]) / 2) == s]
        uit[n] = {'laagste': round(float(q[:, 2].min()), 4), 'plat': round(float((q[:, 2] < 0.006).sum()) / max(1, (q[:, 2] < 0.03).sum()), 3)}
    return uit


def hoofd():
    uit = sys.argv[sys.argv.index('--') + 1]
    P4.zet_aan(True)
    arm_ = bpy.data.objects['skelet']
    if arm_.animation_data:
        arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    r = {}
    # de nieuwe rust
    h = P4.staan(rust, 0.0)
    vl, vr = h.kop['voet.L'], h.kop['voet.R']
    heup = float(np.linalg.norm(h.kop['dij.L'] - h.kop['dij.R']))
    r['rust'] = {'voetafstand_m': round(float(abs(vl[0] - vr[0])), 3), 'voet_voor_m': round(float(abs(vl[1] - vr[1])), 3), 'heupbreedte_m': round(heup, 3), 'voet_per_heup': round(float(abs(vl[0] - vr[0])) / heup, 2),
                 'bekken_x': round(float(h.kop['bekken'][0]), 3), 'steunvlak_x': [round(float(vr[0]), 3), round(float(vl[0]), 3)], 'zwaartepunt_binnen_steunvlak': bool(vr[0] < h.kop['bekken'][0] < vl[0])}
    o = P4.PRODUCTIE['staan'](rust, 0.0)
    r['pols_hoek_graden'] = {'hand.R': round(P4.pols_hoek(h, '.R'), 1), 'hand.L': round(P4.pols_hoek(h, '.L'), 1)}
    r['elleboog_hoek_graden'] = {n: round(180.0 - math.degrees(math.acos(float(np.clip(h.as_('bovenarm' + n, 1) @ h.as_('onderarm' + n, 1), -1, 1)))), 1) for n in ('.R', '.L')}
    r['rust_oud'] = {'voetafstand_m': round(float(abs(o.kop['voet.L'][0] - o.kop['voet.R'][0])), 3), 'voet_voor_m': round(float(abs(o.kop['voet.L'][1] - o.kop['voet.R'][1])), 3)}
    # de overgang
    r['overgang_oud'] = overgang(rust, P4.PRODUCTIE['staan'])
    r['overgang_nieuw'] = overgang(rust, P4.staan)
    # hand en speer in alle houdingen
    r['hand_op_speer_mm'] = {}
    r['speer_recht'] = {}
    for naam, n in (('staan', 8), ('lopen', 24), ('proef_steek', 12), ('proef_val', 8), ('proef_kop', 6)):
        hs = [B.HOUDING[naam](rust, i / n, 0.0) for i in range(n)]
        r['hand_op_speer_mm'][naam] = round(max(greep_fout(x) for x in hs) * 1000, 3)
        d = [np.linalg.norm(x.matrices()['speer'][:3, 1]) for x in hs]
        r['speer_recht'][naam] = bool(max(d) - min(d) < 1e-6)
    # de loop: sprongen, doorlopen naar beeld 1, en de fasen
    n = 24
    hs = [B.HOUDING['lopen'](rust, i / n, 0.0) for i in range(n)]
    gr = {}
    for b in hs[0].delta:
        st = [hoek(hs[i].delta[b], hs[(i + 1) % n].delta[b]) for i in range(n)]
        gr[b] = (max(st), st[-1] / max(max(st), 1e-6))
    top = sorted(gr.items(), key=lambda x: -x[1][0])[:6]
    r['lopen'] = {'grootste_draai_per_beeld_graden': {k: round(v[0], 1) for k, v in top}, 'sluit_op_beeld_1': max(hoek(hs[-1].delta[b], hs[0].delta[b]) for b in hs[0].delta) < max(v[0] for v in gr.values()) * 1.01}
    y_l = np.array([x.kop['voet.L'][1] for x in hs])
    y_r = np.array([x.kop['voet.R'][1] for x in hs])
    z_b = np.array([x.kop['bekken'][2] for x in hs])
    r['lopen']['fasen'] = {'contact_links_voor_beeld': int(np.argmin(y_l)), 'contact_rechts_voor_beeld': int(np.argmin(y_r)), 'laagste_bekken_beelden': [int(i) for i in np.argsort(z_b)[:2]], 'hoogste_bekken_beelden': [int(i) for i in np.argsort(-z_b)[:2]], 'bekken_z_bereik_m': round(float(np.ptp(z_b)), 3), 'benen_wisselen': round(float(np.corrcoef(y_l, y_r)[0, 1]), 3)}
    bx = np.array([x.kop['bekken'][:2] for x in hs])
    r['lopen']['wortel_schuift_m'] = {'x': round(float(np.ptp(bx[:, 0])), 3), 'y': round(float(np.ptp(bx[:, 1])), 3)}
    # de voeten op de grond
    r['voeten_rust'] = zool_contact(arm_, rust, 'staan', 0.0)
    r['voeten_lopen_laagste'] = {}
    lg = []
    for i in range(12):
        c = zool_contact(arm_, rust, 'lopen', i / 12)
        lg.append(min(c['.L']['laagste'], c['.R']['laagste']))
    r['voeten_lopen_laagste'] = [round(x, 4) for x in lg]
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(r, f, indent=1)
    print('KLAAR', uit, flush=True)


if __name__ == '__main__':
    hoofd()
