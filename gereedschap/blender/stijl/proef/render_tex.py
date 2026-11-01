# render.py op het textuurmodel, met een andere set texturen (vraag 192, de methodeproef): dezelfde camera, hetzelfde licht en dezelfde uitvoer als de productie.
#
#   blender.exe -b <speerman-tex.blend> -P proef/render_tex.py -- <uitmap> <houding> ... tex=<map>
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import bpy  # noqa: E402

import gbuffer as G  # noqa: E402
import licht as L  # noqa: E402
import render as R  # noqa: E402

_zet_op = L.zet_op
_hoog = [None]


def zet_op(scene, *a, **k):
    _zet_op(scene, *a, **k)
    if _hoog[0]:
        scene.render.resolution_y = _hoog[0]


L.zet_op = zet_op
for a in sys.argv[sys.argv.index('--') + 1:]:
    if a.startswith('tex='):
        G.wissel_texturen(a[4:])
    elif a.startswith('hoog='):
        _hoog[0] = int(a[5:])
    elif a.startswith('zonder='):
        for n in a[7:].split(','):
            bpy.data.objects[n].hide_render = True
R.hoofd()
