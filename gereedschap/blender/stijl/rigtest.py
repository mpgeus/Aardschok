# De rig-test uit de specificatie (vraag 192, punt 13): schouder, elleboog, heup, knie, nek en de greep, elk een eind doorgebogen, om
# te zien of de kleren het volgen zonder te scheuren of in te klappen.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/rigtest.py -- <uitmap> [pixels=512] [monsters=24]
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import skelet as S  # noqa: E402


def draai(h, bot, R, kinderen):
    """Een bot draaien, en zijn kinderen gaan mee."""
    h.delta[bot] = R @ h.delta[bot]
    for k in kinderen:
        h.zet(k, R @ h.delta[k])


ARM = lambda n: ['onderarm' + n, 'hand' + n]
BEEN = lambda n: ['scheen' + n, 'voet' + n, 'teen' + n]
TESTEN = {
    'schouder-voor': lambda h: draai(h, 'bovenarm.L', S.rx(math.radians(-75)), ARM('.L')),
    'schouder-opzij': lambda h: draai(h, 'bovenarm.L', S.ry(math.radians(-60)), ARM('.L')),
    'elleboog': lambda h: draai(h, 'onderarm.L', S.rx(math.radians(-100)), ['hand.L']),
    'heup-voor': lambda h: draai(h, 'dij.L', S.rx(math.radians(-50)), BEEN('.L')),
    'heup-achter': lambda h: draai(h, 'dij.L', S.rx(math.radians(30)), BEEN('.L')),
    'knie': lambda h: draai(h, 'scheen.L', S.rx(math.radians(90)), ['voet.L', 'teen.L']),
    'nek': lambda h: draai(h, 'hoofd', S.rz(math.radians(35)) @ S.rx(math.radians(15)), []),
    'romp': lambda h: draai(h, 'borst', S.rz(math.radians(25)), ['nek', 'hoofd']),
}


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    o = {'pixels': '512', 'monsters': '24'}
    for a in argv[1:]:
        k, v = a.split('=')
        o[k] = v
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    L.zet_op(scene, 20.0, int(o['pixels']), int(o['monsters']), 1.75, 0.68)
    arm_ = bpy.data.objects['skelet']
    arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    for naam, f in TESTEN.items():
        for r in ('ZW', 'O'):
            arm_.rotation_euler = (0, 0, math.radians(L.INST['richtingen'][r]))
            h = B.staan(rust, 0.0, -L.INST['richtingen'][r])
            f(h)
            b = h.basis()
            for pb in arm_.pose.bones:
                if pb.name in b:
                    pb.matrix_basis = Matrix(b[pb.name].tolist())
            bpy.context.view_layer.update()
            scene.render.filepath = os.path.join(uit, f'{naam}-{r}.png')
            bpy.ops.render.render(write_still=True)
    print('KLAAR', uit, flush=True)


if __name__ == '__main__':
    hoofd()
