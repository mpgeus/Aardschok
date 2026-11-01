# De beelden en de controles van een basismens (Marcel, 29 okt, ronde 9): de HumGen-man (maak.py) of de procedurele
# basismens (gereedschap/blender/basismens) met dezelfde camera, hetzelfde licht en dezelfde schaal als de bestaande
# pijplijn (basismens/render.py: orthografisch, 30 graden, de acht richtingen door de man om Z te draaien, niets
# gespiegeld), en een neutraal materiaal (klei) zodat alleen de vorm telt:
# - de acht richtingen in klei; voor HumGen ook met zijn eigen huid, met de rode band om de rechterbovenarm als
#   controle van links en rechts (render.richtingen);
# - de aanzichten (voor, opzij, achter, driekwart) en de close-ups (gezicht, handen, voeten) in klei;
# - de buigtest: schouder opzij en naar voren, elleboog, heup en knie, gedraaid om dezelfde assen in de wereld (de twee
#   skeletten hebben andere botnamen en assen), met de rek van de randen en het volume tegen de rust;
# - de controles van de mesh (randen, wikkeling, UV), het skelet (gewichten) en de materialen.
#
#   blender.exe -b <blend> -P gereedschap/blender/humgen/beelden.py -- humgen|oud <uitmap>
import hashlib
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import render as R  # noqa: E402  (de scène, de camera, het licht en de richtingen van de basismens)

ARGS = sys.argv[sys.argv.index('--') + 1:]
SOORT, MAP = ARGS[0], os.path.abspath(ARGS[1])
# de botten van elk skelet: het hoofd, de rechterbovenarm (de band), en voor de close-ups en de buigtest
BOTTEN = {'humgen': {'hoofd': 'head', 'band': 'upper_arm.R', 'hand': 'hand.L', 'voet': 'foot.L', 'bovenarm': 'upper_arm.L',
                     'onderarm': 'forearm.L', 'dij': 'thigh.L', 'scheen': 'shin.L'},
          'oud': {'hoofd': 'head', 'band': 'upperarm02.R', 'hand': 'wrist.L', 'voet': 'foot.L', 'bovenarm': 'upperarm01.L',
                  'onderarm': 'lowerarm01.L', 'dij': 'upperleg01.L', 'scheen': 'lowerleg01.L'}}[SOORT]
CAM = R.CAM


def onderdelen():
    rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    lijf = max((o for o in bpy.data.objects if o.type == 'MESH' and o.visible_get()), key=lambda o: len(o.data.vertices))
    return rig, lijf


def klei():
    m = bpy.data.materials.new('klei')
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (0.42, 0.40, 0.38, 1)
    b.inputs['Roughness'].default_value = 0.6
    return m


def zonder_haar(aan):
    """Het haar van HumGen (deeltjes) uit, voor de vorm in klei; met aan=True weer zoals het was."""
    for o in bpy.data.objects:
        for md in getattr(o, 'modifiers', []):
            if md.type == 'PARTICLE_SYSTEM':
                md.show_render = aan
        if o.type == 'MESH' and o.name.lower().startswith(('hg_eyebrows', 'hg_hair')):
            o.hide_render = not aan


def stuk(sc, punt, draai, schaal, pad, elev=0.0):
    c = R.camera_op(sc, punt, draai, schaal, 'stuk')
    if elev:
        c.matrix_world = Matrix.Translation(punt) @ Matrix.Rotation(math.radians(draai), 4, 'Z') @ Matrix.Rotation(math.radians(-elev), 4, 'X') @ \
            Matrix.Translation(-punt) @ c.matrix_world
    sc.camera = c
    R.licht(sc, c)
    R.render(sc, pad)
    bpy.data.objects.remove(c, do_unlink=True)


def richt(rig, bot, as_, graden):
    """Een bot (met wat eraan hangt) om een as in de wereld draaien, om zijn kop."""
    pb = rig.pose.bones[bot]
    a = (rig.matrix_world.inverted().to_3x3() @ Vector(as_)).normalized()
    pb.matrix = Matrix.Translation(pb.head) @ Matrix.Rotation(math.radians(graden), 4, a) @ Matrix.Translation(-pb.head) @ pb.matrix
    bpy.context.view_layer.update()


def rek(lijf, rust_co, randen):
    deps = bpy.context.evaluated_depsgraph_get()
    e = lijf.evaluated_get(deps)
    co = np.array([v.co[:] for v in e.data.vertices])
    l0 = np.linalg.norm(rust_co[randen[:, 0]] - rust_co[randen[:, 1]], axis=1)
    l1 = np.linalg.norm(co[randen[:, 0]] - co[randen[:, 1]], axis=1)
    r = l1 / np.maximum(l0, 1e-9)
    return {'rek_p99': round(float(np.percentile(r, 99)), 3), 'krimp_p1': round(float(np.percentile(r, 1)), 3),
            'randen_boven_1_5': round(float((r > 1.5).mean() * 100), 3)}


def controles(rig, lijf):
    me = lijf.data
    bm = bmesh.new()
    bm.from_mesh(me)
    open_ = sum(1 for e in bm.edges if len(e.link_faces) < 2)
    niet = sum(1 for e in bm.edges if len(e.link_faces) > 2)
    wikkeling = sum(1 for e in bm.edges if len(e.link_faces) == 2 and not e.is_contiguous)
    los = sum(1 for v in bm.verts if not v.link_faces)
    nul = sum(1 for f in bm.faces if f.calc_area() < 1e-10)
    bm.free()
    uv = me.uv_layers.active
    uvs = np.zeros(len(me.loops) * 2)
    if uv:
        uv.data.foreach_get('uv', uvs)
    botten = {b.name for b in rig.data.bones}
    groepen = {g.index: g.name for g in lijf.vertex_groups}
    zonder, som = 0, []
    for v in me.vertices:
        w = [g.weight for g in v.groups if groepen.get(g.group) in botten and g.weight > 0]
        if not w:
            zonder += 1
        else:
            som.append(sum(w))
    som = np.array(som)
    beelden = {}
    for o in bpy.data.objects:
        if o.type == 'MESH':
            for m in o.data.materials:
                if m and m.node_tree:
                    for n in m.node_tree.nodes:
                        if n.type == 'TEX_IMAGE' and n.image:
                            p = bpy.path.abspath(n.image.filepath)
                            beelden[n.image.name] = os.path.exists(p) or n.image.packed_file is not None
    return {'mesh': {'open_randen': open_, 'randen_met_meer_dan_2_vlakken': niet, 'wikkeling_omgedraaid': wikkeling,
                     'losse_punten': los, 'vlakken_zonder_oppervlak': nul, 'geldig': not me.validate(verbose=False)},
            'uv': {'laag': uv.name if uv else None, 'nan': bool(np.isnan(uvs).any()), 'binnen_0_1': round(float(((uvs >= -0.001) & (uvs <= 1.001)).mean()), 4)},
            'skelet': {'botten': len(botten), 'groepen_zonder_bot': sorted(set(groepen.values()) - botten)[:10],
                       'punten_zonder_gewicht': zonder, 'gewicht_som_min_max': [round(float(som.min()), 3), round(float(som.max()), 3)] if len(som) else None},
            'texturen': {'aantal': len(beelden), 'gevonden': sum(beelden.values()), 'ontbreken': [k for k, v in beelden.items() if not v][:10]}}


def main():
    sc = R.scene()
    rig, lijf = onderdelen()
    rig.data.pose_position = 'POSE'
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    bpy.context.view_layer.update()
    os.makedirs(MAP, exist_ok=True)
    verslag = {'soort': SOORT, 'controles': controles(rig, lijf), 'lijf': lijf.name, 'skelet': rig.name}
    pb = rig.pose.bones
    w = lambda b, k='head': rig.matrix_world @ getattr(pb[b], k)
    # de acht richtingen met de camera van het spel: eerst met de eigen materialen en de band (links en rechts), dan in
    # klei zonder haar
    cam = R.camera(sc, CAM['elevatie'])
    sc.camera = cam
    R.licht(sc, cam)
    if SOORT == 'humgen':
        verslag['richtingen'] = R.richtingen(sc, cam, rig, os.path.join(MAP, 'huid'), os.path.join(MAP, 'controle'),
                                             0.075, (BOTTEN['hoofd'], BOTTEN['band']))
    zonder_haar(False)
    sc.view_layers[0].material_override = klei()
    r = R.richtingen(sc, cam, rig, os.path.join(MAP, 'klei'), None, 0.075, (BOTTEN['hoofd'], BOTTEN['band']))
    verslag['richtingen_klei'] = [x['bestand'] for x in r]
    hashes = [hashlib.sha256(open(os.path.join(R.UIT, x['bestand']), 'rb').read()).hexdigest()[:16] for x in r]
    verslag['acht_verschillend'] = len(set(hashes)) == 8
    # de aanzichten en de close-ups, in klei
    sc.render.resolution_x, sc.render.resolution_y = 600, 1000
    midden = Vector((0, 0, 0.88))
    for kant, draai in (('voor', 0), ('driekwart', 45), ('opzij', 90), ('achter', 180)):
        stuk(sc, midden, draai, 1.95, os.path.join(MAP, 'aanzicht', f'{kant}.png'))
    sc.render.resolution_x = sc.render.resolution_y = 512
    kop = w(BOTTEN['hoofd']) + Vector((0, 0, 0.08))
    stuk(sc, kop, 0, 0.32, os.path.join(MAP, 'stuk', 'gezicht-voor.png'))
    stuk(sc, kop, 35, 0.32, os.path.join(MAP, 'stuk', 'gezicht-schuin.png'))
    hand = (w(BOTTEN['hand']) + w(BOTTEN['hand'], 'tail')) / 2
    stuk(sc, hand + Vector((0, 0, -0.03)), 90, 0.3, os.path.join(MAP, 'stuk', 'hand-opzij.png'))
    stuk(sc, hand + Vector((0, 0, -0.03)), 0, 0.3, os.path.join(MAP, 'stuk', 'hand-voor.png'))
    stuk(sc, Vector((0, -0.03, 0.08)), 25, 0.5, os.path.join(MAP, 'stuk', 'voeten.png'), elev=20)
    # de buigtest: per gewricht de rek en het volume, en een close-up
    randen = np.array([e.vertices[:] for e in lijf.data.edges])
    deps = bpy.context.evaluated_depsgraph_get()
    rust = np.array([v.co[:] for v in lijf.evaluated_get(deps).data.vertices])
    verslag['buigtest'] = {}
    proeven = [('schouder-opzij', [(BOTTEN['bovenarm'], (0, 1, 0), -55)], BOTTEN['bovenarm'], 0),
               ('schouder-voor', [(BOTTEN['bovenarm'], (1, 0, 0), -80)], BOTTEN['bovenarm'], 90),
               ('elleboog', [(BOTTEN['onderarm'], (1, 0, 0), -110)], BOTTEN['onderarm'], 90),
               ('heup', [(BOTTEN['dij'], (1, 0, 0), -75)], BOTTEN['dij'], 90),
               ('knie', [(BOTTEN['scheen'], (1, 0, 0), 100)], BOTTEN['scheen'], 90)]
    for naam, draaien, bot, kant in proeven:
        for b, as_, g in draaien:
            richt(rig, b, as_, g)
        verslag['buigtest'][naam] = rek(lijf, rust, randen)
        stuk(sc, w(bot), kant, 0.55, os.path.join(MAP, 'buig', f'{naam}.png'))
        for p in rig.pose.bones:
            p.matrix_basis = Matrix()
        bpy.context.view_layer.update()
    json.dump(verslag, open(os.path.join(MAP, 'verslag.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('BEELDEN', SOORT, json.dumps(verslag['controles']), json.dumps(verslag['buigtest']), verslag['acht_verschillend'])


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
