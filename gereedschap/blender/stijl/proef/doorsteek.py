# Gaat een onderdeel door een ander, in de staande houding en door de hele loop (vraag 192, de vormproef)? Telt per paar en per beeld de driehoeken die elkaar snijden, op de vervormde mesh.
# Een getal is alleen betekenisvol tegen een ander model: een vuist hoort de speer te raken, en lagen die elkaar raken hoeven niet te zien te zijn. Kijk er dus ook naar.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/doorsteek.py -- <uit.json>
import json
import os
import sys

import bpy
from mathutils.bvhtree import BVHTree

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402

PAREN = [('handschoenen', 'speer'), ('speer', 'tabberd'), ('speer', 'laarzen'), ('speer', 'helm'), ('handschoenen', 'tabberd'), ('handschoenen', 'buidel'), ('handschoenen', 'riem'),
         ('gambeson', 'tabberd'), ('tabberd', 'hozen'), ('tabberd', 'laarzen'), ('tabberd', 'buidel'), ('hozen', 'laarzen'), ('kap', 'tabberd'), ('kap', 'helm'), ('hoofd', 'kap'), ('baard', 'kap')]


def hoofd():
    uit = sys.argv[sys.argv.index('--') + 1]
    arm_ = bpy.data.objects['skelet']
    if arm_.animation_data:
        arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    delen = sorted({n for p in PAREN for n in p})
    res = {}
    for houding, beelden in (('staan', 1), ('lopen', 12)):
        per = {f'{a}/{b}': [] for a, b in PAREN}
        for i in range(beelden):
            B.zet(arm_, rust, houding, i / beelden, 0.0)
            bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()
            bomen = {n: BVHTree.FromObject(bpy.data.objects[n], dg) for n in delen}
            for a, b in PAREN:
                per[f'{a}/{b}'].append(len(bomen[a].overlap(bomen[b])))
        res[houding] = {k: {'beelden': v, 'hoogste': max(v), 'gemiddeld': round(sum(v) / len(v), 1)} for k, v in per.items()}
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f, indent=1)
    print('KLAAR', uit, flush=True)


if __name__ == '__main__':
    hoofd()
