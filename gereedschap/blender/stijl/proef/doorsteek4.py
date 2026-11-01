# Clipping, gesplitst naar wat je kunt zien (vraag 192, vormproef V4). Per paar onderdelen en per beeld: de driehoeken die elkaar snijden, en daarvan de driehoeken waar vanaf minstens één spelcamera (acht richtingen, 30 graden)
# niets voor zit. Een snijding die overal achter ligt, is intern en geen probleem. Een zichtbare snijding kan ook een bedoeld contact zijn (riem op stof, vuist om de schacht): daarom telt alleen wat er meer is dan in de rust, en wordt het nagekeken op beeld.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/doorsteek4.py -- <uit.json> [oudidle]
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
sys.path.insert(0, os.path.dirname(HIER))
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import pose4 as P4  # noqa: E402

PAREN = [('tabberd', 'hozen'), ('tabberd', 'laarzen'), ('tabberd', 'handschoenen'), ('tabberd', 'gambeson'), ('tabberd', 'speer'), ('tabberd', 'buidel'), ('handschoenen', 'buidel'), ('handschoenen', 'speer'), ('hozen', 'laarzen'),
         ('helm', 'kap'), ('helm', 'tabberd'), ('helm', 'gambeson'), ('kap', 'tabberd'), ('gambeson', 'handschoenen'), ('gambeson', 'buidel'), ('speer', 'laarzen'), ('speer', 'helm'), ('speer', 'gambeson')]
PROEF = [('staan', 4), ('lopen', 12), ('proef_steek', 8), ('proef_val', 8), ('proef_kop', 6)]
MONSTER = 70
E = math.radians(30.0)
RICHT = 'Z,ZW,W,NW,N,NO,O,ZO'.split(',')
HOEK = {'Z': 0, 'ZW': -45, 'W': -90, 'NW': -135, 'N': 180, 'NO': 135, 'O': 90, 'ZO': 45}


def camera_richtingen():
    uit = []
    for r in RICHT:
        a = math.radians(HOEK[r])
        c, s = math.cos(-a), math.sin(-a)
        v = np.array([0.0, -math.cos(E), math.sin(E)])
        uit.append(Vector((c * v[0] - s * v[1], s * v[0] + c * v[1], v[2])))
    return uit


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = argv[0]
    P4.zet_aan('oudidle' not in argv)
    arm_ = bpy.data.objects['skelet']
    if arm_.animation_data:
        arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    delen = [o.name for o in bpy.data.objects if o.type == 'MESH' and o.name != 'lijf']
    dirs = camera_richtingen()
    rng = np.random.default_rng(192)
    res = {}
    for houding, beelden in PROEF:
        per = {f'{a}/{b}': {'snijdt': [], 'zichtbaar': [], 'richtingen': [], 'plek': []} for a, b in PAREN}
        for i in range(beelden):
            B.zet(arm_, rust, houding, i / beelden, 0.0)
            bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()
            bomen, tri = {}, {}
            for n in delen:
                ob = bpy.data.objects[n].evaluated_get(dg)
                me = ob.to_mesh()
                me.calc_loop_triangles()
                v = np.zeros(len(me.vertices) * 3)
                me.vertices.foreach_get('co', v)
                t = np.zeros(len(me.loop_triangles) * 3, dtype=np.int64)
                me.loop_triangles.foreach_get('vertices', t)
                tri[n] = v.reshape(-1, 3)[t.reshape(-1, 3)].mean(axis=1)
                bomen[n] = BVHTree.FromObject(bpy.data.objects[n], dg)
                ob.to_mesh_clear()
            lijst = list(bomen.values())
            for a, b in PAREN:
                ov = bomen[a].overlap(bomen[b])
                k = f'{a}/{b}'
                per[k]['snijdt'].append(len(ov))
                if not ov:
                    per[k]['zichtbaar'].append(0)
                    per[k]['richtingen'].append({})
                    per[k]['plek'].append(None)
                    continue
                ids = np.array([x[0] for x in ov])
                keus = rng.choice(len(ids), min(MONSTER, len(ids)), replace=False)
                punten = tri[a][ids[keus]]
                zicht = 0
                waar = {}
                gezien = []
                for p in punten:
                    z = False
                    for r, d in zip(RICHT, dirs):
                        o = Vector(p) + d * 0.008
                        if all(tr.ray_cast(o, d)[0] is None for tr in lijst):
                            z = True
                            waar[r] = waar.get(r, 0) + 1
                    zicht += z
                    if z:
                        gezien.append(p)
                per[k]['zichtbaar'].append(int(round(zicht / len(punten) * len(ov))))
                per[k]['richtingen'].append(waar)
                per[k]['plek'].append([[round(float(x), 2) for x in np.min(gezien, axis=0)], [round(float(x), 2) for x in np.max(gezien, axis=0)]] if gezien else None)
        res[houding] = per
        print(houding, 'klaar', flush=True)
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(res, f)
    print('KLAAR', uit, flush=True)


if __name__ == '__main__':
    hoofd()
