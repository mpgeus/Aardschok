# De bewegingstests van de geklede soldaat (Marcel, 29 okt, ronde 10: "Maak: neutrale idle-pose, speer vasthouden met
# twee handen, linkerbeen vooruit, rechterbeen vooruit, kniebuiging, arm naar voren, arm naar achteren"; "Controleer of
# schouders natuurlijk vervormen, ellebogen niet instorten, knieën correct buigen, handen rond de speer kunnen sluiten, de
# romp niet vervormt, de kleding de beweging kan volgen"). Elke stand met basismens/stand.zet (richtingen in de ruimte
# van het skelet, dus voor elk skelet hetzelfde), de soldaat met al zijn kleren, gerenderd van ZW (30 graden) en opzij;
# per stand ook de rek van de randen van het lijf en van de kleren tegen de idle.
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/humgen/bewegingen.py -- <uitmap>
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import render as R  # noqa: E402
import soldaat_render as SR  # noqa: E402
import stand  # noqa: E402

MAP = os.path.abspath(sys.argv[sys.argv.index('--') + 1])


def punten(ob):
    deps = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(deps)
    return np.array([(ob.matrix_world @ v.co)[:] for v in e.data.vertices])


def main():
    sc = R.scene()
    rig = bpy.data.objects['skelet']
    rig.data.pose_position = 'POSE'
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    bpy.data.objects['lijf-bron'].hide_render = True
    SR.materialen_voor_het_spel()
    sc.cycles.samples = 48
    sc.render.resolution_x, sc.render.resolution_y = 560, 760
    kleren = [o for o in bpy.data.objects if o.type == 'MESH' and not o.hide_render and o.name != 'speer']
    sp = bpy.data.objects['speer']
    SR.houding(rig)
    basis = {o.name: punten(o) for o in kleren}
    randen = {o.name: np.array([e.vertices[:] for e in o.data.edges]) for o in kleren}
    vuist = rig.pose.bones['wrist.R'].head.copy()
    standen = {
        'idle': [],
        'speer-twee-handen': 'reik',
        'linkerbeen-vooruit': [('upperleg01.L', [1, 0, 0], -28), ('lowerleg01.L', [1, 0, 0], 14), ('foot.L', 'rust')],
        'rechterbeen-vooruit': [('upperleg01.R', [1, 0, 0], -28), ('lowerleg01.R', [1, 0, 0], 14), ('foot.R', 'rust')],
        'kniebuiging': [('upperleg01.L', [1, 0, 0], -38), ('upperleg01.R', [1, 0, 0], -38), ('lowerleg01.L', [1, 0, 0], 70),
                        ('lowerleg01.R', [1, 0, 0], 70), ('foot.L', 'rust'), ('foot.R', 'rust')],
        'arm-naar-voren': [('upperarm01.L', 'richt', [0.12, -1, -0.15]), ('lowerarm01.L', 'richt', [0.1, -1, 0.05])],
        'arm-naar-achteren': [('upperarm01.L', 'richt', [0.25, 0.75, -1]), ('lowerarm01.L', 'richt', [0.2, 0.6, -1])],
        'rompdraai': [('spine04', [0, 0, 1], 8), ('spine03', [0, 0, 1], 8), ('spine01', [0, 0, 1], 6)],
        # ronde 13 (Marcel: "Test minimaal: Idle. Lopen. Speer vasthouden. Speeraanval. Kniebuiging"): een pas (links voor,
        # rechts achter, de linkerarm zwaait terug) en een steek (de rechterarm met de speer naar voren)
        'lopen': [('upperleg01.L', [1, 0, 0], -22), ('lowerleg01.L', [1, 0, 0], 12), ('upperleg01.R', [1, 0, 0], 16),
                  ('lowerleg01.R', [1, 0, 0], 28), ('foot.L', 'rust'), ('foot.R', 'rust'), ('upperarm01.L', 'richt', [0.18, 0.35, -1])],
        'speeraanval': [('upperarm01.R', 'richt', [-0.1, -1, -0.3]), ('lowerarm01.R', 'richt', [-0.05, -1, -0.05]),
                        ('upperleg01.L', [1, 0, 0], -18), ('lowerleg01.L', [1, 0, 0], 10), ('foot.L', 'rust')],
    }
    verslag = {}
    for naam, st in standen.items():
        SR.houding(rig)
        if st == 'reik':
            # de linkerhand om de schacht, een handbreedte onder de rechter, naar voren gebogen
            doel = Vector((vuist.x + 0.02, vuist.y - 0.02, vuist.z + 0.28))
            stand.reik(rig, 'L', doel, (0.6, -0.6, -0.5))
            stand.zet(rig, [('wrist.L', 'richt', [-1, -0.2, 0.1])])
        else:
            stand.zet(rig, st)
        if naam in ('kniebuiging', 'lopen', 'speeraanval'):
            rig.location.z = 0
            bpy.context.view_layer.update()
            stand.op_de_grond(rig, bpy.data.objects['laarzen'])
        rek = {}
        for o in kleren:
            p, r = punten(o), randen[o.name]
            l0 = np.linalg.norm(basis[o.name][r[:, 0]] - basis[o.name][r[:, 1]], axis=1)
            l1 = np.linalg.norm(p[r[:, 0]] - p[r[:, 1]], axis=1)
            q = l1 / np.maximum(l0, 1e-9)
            rek[o.name] = {'p99': round(float(np.percentile(q, 99)), 3), 'boven_1_5_pct': round(float((q > 1.5).mean() * 100), 3)}
        verslag[naam] = rek
        for kant, draai in (('zw', -45), ('opzij', 90)):
            rig.rotation_euler = (0, 0, math.radians(draai))
            bpy.context.view_layer.update()
            cam = R.camera(sc, 30 if kant == 'zw' else 10, 0, 'b', (280, 700), (560, 760, 300))
            sc.camera = cam
            R.licht(sc, cam)
            R.render(sc, os.path.join(MAP, f'{naam}-{kant}.png'))
            bpy.data.objects.remove(cam, do_unlink=True)
        rig.rotation_euler = (0, 0, 0)
        rig.location.z = 0
        bpy.context.view_layer.update()
    json.dump(verslag, open(os.path.join(MAP, 'bewegingen.json'), 'w', encoding='utf-8'), indent=1)
    print('BEWEGINGEN', json.dumps({k: {o: v['p99'] for o, v in r.items()} for k, r in verslag.items()})[:2000])


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
