# De basis voor methode B, C en D (vraag 192, de methodeproef): het textuurmodel van textuur.py, plus per onderdeel wat een schilder buiten Blender
# nodig heeft: per texel de plek in rust, de normaal, de bolling en de verf uit het recept (<naam>-tex.npz), de plek in de staande houding voor de projectie
# (<naam>-stand.npz), en een gebakken omgevingsschaduw (<naam>-ao.png). Daarna kan schilder.py zonder Blender texturen maken, in seconden.
#
#   blender.exe -b <figuur.blend> -P proef/textuur_b.py -- <uit.blend>
import os
import sys
import time

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import textuur as T  # noqa: E402

# 2048 is ook voor de tabberd genoeg: hoger gaf niets (kwaliteitsronde.md)
T.DELEN['tabberd'] = (30000, 2048)
for k in ('baard', 'buidel', 'hozen'):
    T.DELEN[k] = (T.DELEN[k][0], 1024)

_laatste = {}
_ras = T.rasteriseer
_delen = F.delen


def rasteriseer(m, maat):
    P, N, g = _ras(m, maat)
    _laatste['gevuld'] = g
    _laatste['maat'] = maat
    return P, N, g


def delen():
    uit = []
    for d in _delen():
        naam, verf = d[0], d[5]

        def omhuld(P, N, bol, naam=naam, verf=verf):
            v = verf(P, N, bol)
            g = _laatste['gevuld']
            idx = np.nonzero(g)
            np.savez(os.path.join(TEX[0], f'{naam}-tex.npz'), i=idx[0].astype(np.int32), j=idx[1].astype(np.int32), maat=_laatste['maat'], P=P.astype(np.float32), N=N.astype(np.float32),
                     bol=np.asarray(bol, dtype=np.float32), c=np.asarray(v[0], dtype=np.float32), ruw=np.asarray(v[1], dtype=np.float32), met=np.asarray(v[2], dtype=np.float32),
                     stof=np.asarray(v[3], dtype=np.float32), spiegel=np.asarray(v[4], dtype=np.float32))
            return v
        uit.append((*d[:5], omhuld, d[6]))
    return uit


TEX = [None]
T.rasteriseer = rasteriseer
F.delen = delen


def stand_en_ao(uit_blend):
    """Na het opslaan: de texels in de staande houding, en de omgevingsschaduw per onderdeel."""
    tex = TEX[0]
    scene = bpy.context.scene
    arm_ = bpy.data.objects['skelet']
    arm_.data.pose_position = 'POSE'
    rust = F.rust_van(arm_)
    arm_.rotation_euler = (0.0, 0.0, 0.0)
    B.zet(arm_, rust, 'staan', 0.0, 0.0)
    bpy.context.view_layer.update()
    dg = bpy.context.evaluated_depsgraph_get()
    for naam, (_, maat) in T.DELEN.items():
        ob = bpy.data.objects[naam]
        eva = ob.evaluated_get(dg)
        m = eva.to_mesh()
        P, N, g = _ras(m, maat)
        idx = np.nonzero(g)
        np.savez(os.path.join(tex, f'{naam}-stand.npz'), i=idx[0].astype(np.int32), j=idx[1].astype(np.int32), P=P[idx].astype(np.float32), N=N[idx].astype(np.float32))
        eva.to_mesh_clear()
    # de omgevingsschaduw in de staande houding, met alle lagen erbij: dat is de schaduw die een schilder zou zetten
    scene.cycles.samples = 48
    scene.render.bake.use_selected_to_active = False
    scene.render.bake.margin = 8
    if scene.world is None:
        scene.world = bpy.data.worlds.new('wereld')
    scene.world.light_settings.distance = 0.09
    L.videokaart(scene)
    t0 = time.time()
    for naam, (_, maat) in T.DELEN.items():
        ob = bpy.data.objects[naam]
        mat = ob.data.materials[0]
        nt = mat.node_tree
        im = bpy.data.images.new(f'{naam}-ao', maat, maat, alpha=False, float_buffer=False)
        im.colorspace_settings.name = 'Non-Color'
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = im
        for n in nt.nodes:
            n.select = False
        t.select = True
        nt.nodes.active = t
        bpy.ops.object.select_all(action='DESELECT')
        ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        r = bpy.ops.object.bake(type='AO', use_clear=True)
        im.filepath_raw = os.path.join(tex, f'{naam}-ao.png')
        im.file_format = 'PNG'
        im.save()
        nt.nodes.remove(t)
        bpy.data.images.remove(im)
        print(naam, 'ao', sorted(r), round(time.time() - t0, 1), flush=True)


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    TEX[0] = os.path.join(os.path.dirname(uit), 'texturen')
    os.makedirs(TEX[0], exist_ok=True)
    if 'alleen_ao' not in argv:
        T.hoofd()
    stand_en_ao(uit)
    # opnieuw opslaan zonder de AO-knopen; de beelden wijzen naar bestanden
    bpy.ops.wm.save_as_mainfile(filepath=uit, compress=True)
    # relatieve paden: anders vindt het model zijn beelden niet meer na het verplaatsen
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_mainfile(compress=True)
    print('KLAAR B', flush=True)


if __name__ == '__main__':
    hoofd()
