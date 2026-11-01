# Het materiaaloverzicht (vraag 192, punt 16 van de specificatie): elk materiaal uit materialen.json op een eigen bol met wat vorm, uit de
# vaste opstelling. Zo zie je of de kleuren en de glans bij elkaar horen.
#
#   blender.exe -b --factory-startup -P gereedschap/blender/stijl/materiaalplaat.py -- <uit.png>
import math
import os
import sys

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import materialen as M  # noqa: E402
import vorm as V  # noqa: E402

KOLOM = 6
AFSTAND = 0.62
R = 0.24


def hoofd():
    uit = os.path.abspath(sys.argv[sys.argv.index('--') + 1])
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    mat = M.shader(bpy)
    namen = list(M.BIB)
    rijen = math.ceil(len(namen) / KOLOM)

    def veld(P):
        d = V.bol(P, (0, 0, 0), R)
        # wat vorm, zodat de holte en de rand van het recept te zien zijn
        return d + 0.012 * (0.5 + 0.5 * np.sin(P[..., 0] * 22) * np.sin(P[..., 1] * 22) * np.sin(P[..., 2] * 22))

    v0, q = V.maak(veld, (-0.28, -0.28, -0.28), (0.28, 0.28, 0.28), 0.007, 1)
    n = V.normalen(v0, q)
    bol = V.bolling(v0, q, n, 8)
    for i, naam in enumerate(namen):
        m = F.naar_mesh(naam, v0, q)
        M.zet_verf(m, M.verf(naam, v0.astype(np.float32), bol, 100 + i, 0.012, n))
        m.materials.append(mat)
        ob = bpy.data.objects.new(naam, m)
        scene.collection.objects.link(ob)
        ob.location = ((i % KOLOM - (KOLOM - 1) / 2) * AFSTAND, 0.0, ((rijen - 1) / 2 - i // KOLOM) * AFSTAND)
    L.zet_op(scene, 12.0, 1200, 64, KOLOM * AFSTAND + 0.2, 0.0)
    scene.render.resolution_y = int(1200 * (rijen * AFSTAND + 0.2) / (KOLOM * AFSTAND + 0.2))
    scene.render.film_transparent = False
    scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value *= 1.0
    scene.render.filepath = uit
    bpy.ops.render.render(write_still=True)
    print('KLAAR', uit, namen, flush=True)


if __name__ == '__main__':
    hoofd()
