# De soldaat, de controles die het model zelf nodig hebben (Marcel, 28 okt, ronde 3), op soldaat.blend: de onderdelen als
# losse meshes aan het skelet, de helm aan het hoofd, de speer aan de rechterhand, links en rechts in het model, en of
# de kleren de huid volgen als hij beweegt. Naar <uit>/soldaat-controle.json; controle.py neemt ze op in rapport.json,
# met de controles die uit de renders en de GLB komen.
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/basismens/soldaat_controle.py
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import soldaat_render as SR  # noqa: E402
import stand  # noqa: E402
import variant  # noqa: E402

INST, UIT = SR.INST, SR.UIT
KLEREN = variant.KLEREN
# de kleren uit de huid: die horen te bewegen zoals de huid eronder (de rok van de tabberd hangt aan de heupen, de riem,
# de buidel en de helm zitten vast aan één bot)
UIT_DE_HUID = ['broek', 'gambeson', 'handschoenen', 'laarzen', 'tabberd']
CONTROLES = []


def toets(naam, geslaagd, waarde, verwacht, toelichting=''):
    CONTROLES.append({'naam': naam, 'geslaagd': bool(geslaagd), 'waarde': waarde, 'verwacht': verwacht,
                      'toelichting': toelichting})
    print(('OK   ' if geslaagd else 'FOUT ') + naam, '|', waarde, '| verwacht', verwacht)


def punten(ob):
    deps = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(deps)
    me = e.to_mesh()
    uit = np.array([(ob.matrix_world @ v.co)[:] for v in me.vertices])
    e.to_mesh_clear()
    return uit


def main():
    ob = bpy.data.objects
    rig = ob['skelet']
    rig.rotation_euler = (0, 0, 0)
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    botten = {b.name for b in rig.data.bones}
    standen = INST['buigtest']['standen']

    # elk onderdeel een eigen mesh aan het skelet, met alleen gewichten van botten, per punt samen 1
    fout, waarde = {}, {}
    for naam in ['lijf'] + KLEREN:
        o = ob.get(naam)
        if o is None or o.type != 'MESH':
            fout[naam] = 'mist'
            continue
        aan = any(m.type == 'ARMATURE' and m.object == rig for m in o.modifiers) and o.parent == rig
        vreemd = [g.name for g in o.vertex_groups if g.name not in botten]
        afw = max(abs(sum(x.weight for x in v.groups) - 1) for v in o.data.vertices)
        waarde[naam] = {'driehoeken': sum(len(p.vertices) - 2 for p in o.data.polygons), 'botten': len(o.vertex_groups),
                        'aan_het_skelet': aan, 'gewicht_afwijking': round(afw, 5)}
        if not aan or vreemd or afw > 0.01:
            fout[naam] = waarde[naam] | {'vreemde_groepen': vreemd}
    sp = ob.get('speer')
    waarde['speer'] = {'ouder': sp.parent.name if sp and sp.parent else None, 'driehoeken': len(sp.data.polygons) if sp else 0}
    toets('soldaat: losse onderdelen', not fout and sp is not None and sp.type == 'MESH', waarde | ({'fout': fout} if fout else {}),
          'het lijf en elf onderdelen elk een eigen mesh aan het skelet (alleen gewichten van botten, per punt samen 1), '
          'en de speer als eigen mesh', 'de broek is erbij gekomen (niet gevraagd): zonder broek blote knieen')

    # de helm aan het hoofd: alleen het bot head, gewicht 1, en hij gaat mee als het hoofd draait (de buigtest 'hoofd')
    h = ob['helm']
    groepen = sorted(g.name for g in h.vertex_groups)
    allemaal = all(len(v.groups) == 1 and abs(v.groups[0].weight - 1) < 1e-6 for v in h.data.vertices)
    stand.rust(rig)
    p0 = punten(h)
    M0 = (rig.matrix_world @ rig.pose.bones['head'].matrix).copy()
    stand.zet(rig, standen['hoofd'])
    p1 = punten(h)
    M1 = rig.matrix_world @ rig.pose.bones['head'].matrix
    T = np.array(M1 @ M0.inverted())
    verwacht = (np.c_[p0, np.ones(len(p0))] @ T.T)[:, :3]
    fout_m = float(np.abs(verwacht - p1).max())
    beweegt = float(np.linalg.norm(p1 - p0, axis=1).max())
    toets('soldaat: helm aan het hoofd', groepen == ['head'] and allemaal and fout_m < 1e-4 and beweegt > 0.02,
          {'groepen': groepen, 'gewicht_1': allemaal, 'beweegt_m': round(beweegt, 3), 'afwijking_van_het_hoofd_m': round(fout_m, 6)},
          'alleen het bot head met gewicht 1; met het hoofd gedraaid (buigtest hoofd) beweegt hij precies zoals het hoofd')

    # de speer aan de rechterhand: aan een greep (een leeg object) aan het bot wrist.R; in de idle in de vuist, rechtop,
    # de voet op de grond; en met de arm gebogen gaat hij mee met de hand
    gr = ob['greep.R']
    SR.houding(rig)
    as_o = sp.matrix_world.translation.copy()
    as_r = (sp.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    g = gr.matrix_world.translation
    q = g - as_o
    afstand = (q - as_r * q.dot(as_r)).length
    voet = min((sp.matrix_world @ v.co).z for v in sp.data.vertices)
    scheef = math.degrees(as_r.angle(Vector((0, 0, 1))))
    pols = lambda: rig.matrix_world @ rig.pose.bones['wrist.R'].matrix
    rel0 = pols().inverted() @ gr.matrix_world
    stand.zet(rig, standen['ellebogen'])
    rel1 = pols().inverted() @ gr.matrix_world
    mee = float(np.abs(np.array(rel1) - np.array(rel0)).max())
    keten = gr.parent == rig and gr.parent_type == 'BONE' and gr.parent_bone == 'wrist.R' and sp.parent == gr
    toets('soldaat: speer aan de rechterhand', keten and afstand < INST['soldaat']['speer']['straal'] + 0.002 and abs(voet) < 0.01
          and scheef < 3 and mee < 1e-4,
          {'speer_aan': sp.parent.name, 'greep_aan': f'{gr.parent.name}.{gr.parent_bone} ({gr.parent_type})',
           'vuist_tot_de_as_m': round(afstand, 4), 'voet_z_m': round(voet, 4), 'uit_het_lood_graden': round(scheef, 2),
           'verschuift_tegen_de_hand': round(mee, 6)},
          'de speer aan greep.R aan het bot wrist.R; in de idle gaat de as door het midden van de vuist, rechtop (op 3 graden), '
          'de voet op de grond (1 cm); met de ellebogen gebogen blijft de greep op zijn plek in de hand')

    # links en rechts in het model (de man naar -Y, niet gedraaid): de speer en de buidel aan zijn rechterkant (-X), de
    # tabberd boven rechts geel en links blauw, onder de riem andersom
    SR.houding(rig)
    speer_x = float(np.mean(punten(sp)[:, 0]))
    buidel_x = float(np.mean(punten(ob['buidel'])[:, 0]))
    stand.rust(rig)
    t = ob['tabberd']
    riem = json.load(open(os.path.join(UIT, 'soldaat.json'), encoding='utf-8'))['maten']['riem']
    verkeerd = 0
    for p in t.data.polygons:
        c = p.center
        if abs(c.x) < 0.03 or abs(c.z - riem) < 0.03:
            continue
        geel = t.data.materials[p.material_index].name.startswith('tabberd-geel')
        verkeerd += geel != (((c.z > riem) == (c.x < 0)) == (INST['soldaat']['tabberd'].get('rechterborst', 'geel') == 'geel'))
    toets('soldaat: links en rechts in het model', speer_x < -0.15 and buidel_x < 0 and verkeerd == 0,
          {'speer_x': round(speer_x, 3), 'buidel_x': round(buidel_x, 3), 'tabberd_vlakken_verkeerd': verkeerd},
          'de speer en de buidel aan zijn rechterkant (x < 0); de tabberd boven rechts geel en links blauw, onder de riem '
          'andersom, op het lijf vast')

    # de kleren uit de huid blijven op hun afstand van de huid als hij beweegt: per punt de afstand tot de huid (lijf-bron,
    # met het teken van de normaal), in een stand tegen die in rust; en hoeveel punten in de huid zakken
    bron = ob['lijf-bron']

    def afstanden(n):
        deps = bpy.context.evaluated_depsgraph_get()
        e = bron.evaluated_get(deps)
        me = e.to_mesh()
        boom = BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [p.vertices[:] for p in me.polygons])
        e.to_mesh_clear()
        uit = []
        for p in punten(ob[n]):
            loc, nrm, _, _ = boom.find_nearest(Vector(p))
            uit.append((Vector(p) - loc).dot(nrm))
        return np.array(uit)
    stand.rust(rig)
    rust = {n: afstanden(n) for n in UIT_DE_HUID}
    lijfje = punten(ob['tabberd'])[:, 2] > riem + 0.02  # het lijfje; de rok hangt aan de heupen
    uitslag = {}
    for naam, zet in (('idle', None), ('ellebogen', standen['ellebogen']), ('knieen', standen['knieen']),
                      ('schouders', standen['schouders'])):
        if zet is None:
            SR.houding(rig)
        else:
            stand.rust(rig)
            stand.zet(rig, zet)
        uitslag[naam] = {}
        for n in UIT_DE_HUID:
            d0, d1 = rust[n], afstanden(n)
            if n == 'tabberd':
                d0, d1 = d0[lijfje], d1[lijfje]
            buiten = d0 > 0.001  # wat in rust buiten de huid lag (de binnenkant van de stof ligt er soms net op)
            verschil = np.abs(d1 - d0)[buiten]
            uitslag[naam][n] = {'p99_cm': round(float(np.percentile(verschil, 99)) * 100, 2),
                                'in_de_huid': round(float((d1[buiten] < 0).mean()), 4)}
    stand.rust(rig)
    # de grens per onderdeel: hoe dik het is (de vulling mag samengedrukt worden, maar komt nooit aan de andere kant uit),
    # plus 5 mm
    So = INST['soldaat']
    G = So['gambeson']
    dik = {'broek': So['broek']['afstand'], 'gambeson': G['afstand'] + G['kussen'] + G['mouw'],
           'handschoenen': So['handschoenen']['afstand'], 'laarzen': So['laarzen']['afstand'] + So['laarzen']['breder'],
           'tabberd': G['afstand'] + G['kussen'] + G['mouw'] + So['tabberd']['speling']}
    grens = {n: round((d + 0.005) * 100, 2) for n, d in dik.items()}
    zak = 0.05
    for s_ in uitslag.values():
        for n, x in s_.items():
            x['grens_cm'] = grens[n]
    toets('soldaat: kleren volgen de huid', all(x['p99_cm'] <= x['grens_cm'] and x['in_de_huid'] <= zak for s_ in uitslag.values()
                                                for x in s_.values()),
          uitslag, 'per punt blijft de stof op zijn afstand van de huid: het 99e percentiel van het verschil met de rust hooguit '
          f'zo groot als de stof dik is plus 5 mm (grens_cm), en hooguit {zak:.0%} van de punten zakt in de huid; in de idle en '
          'in drie standen van de buigtest',
          'de rok van de tabberd telt niet mee (die hangt aan de heupen), de riem, de buidel en de helm zitten vast aan één bot; '
          'de zwakke plekken van lineaire skinning: de oksel (de gambeson als de arm uit de A-houding omlaag gaat) en de '
          'knieholte (de broek in de diepe knieval)')
    json.dump(CONTROLES, open(os.path.join(UIT, 'soldaat-controle.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f"SOLDAAT-CONTROLE {sum(c['geslaagd'] for c in CONTROLES)} van {len(CONTROLES)}")


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
