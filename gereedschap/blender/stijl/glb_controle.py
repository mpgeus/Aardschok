# De GLB nagekeken (vraag 192): opnieuw ingelezen in een leeg Blender, geteld, en gerenderd uit de vaste opstelling, in staan en halverwege
# het lopen. Zo weet je dat wat eruit is gegaan er ook echt in zit: skelet, gewichten, textuur en bewegingen.
#
#   blender.exe -b --factory-startup -P gereedschap/blender/stijl/glb_controle.py -- <model.glb> <uitmap>
import json
import math
import os
import sys

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import licht as L  # noqa: E402


def hoofd():
    glb, uit = sys.argv[sys.argv.index('--') + 1:][:2]
    uit = os.path.abspath(uit)
    os.makedirs(uit, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(glb))
    scene = bpy.context.scene
    arm_ = next(o for o in scene.objects if o.type == 'ARMATURE')
    mesh = next(o for o in scene.objects if o.type == 'MESH')
    tri = sum(len(p.vertices) - 2 for p in mesh.data.polygons)
    beelden = [i.name for i in bpy.data.images]
    uv = list(mesh.data.uv_layers.keys())
    acties = [a.name for a in bpy.data.actions]
    info = {'driehoeken': tri, 'punten': len(mesh.data.vertices), 'botten': len(arm_.data.bones), 'groepen': len(mesh.vertex_groups), 'uv': uv,
            'textuur': beelden, 'acties': acties, 'materialen': [m.name for m in mesh.data.materials]}
    # van het punt naast elkaar: rust, staan en lopen
    L.zet_op(scene, 30.0, 640, 32, 3.0, 0.74)
    for naam, actie, frame in (('staan', next((a for a in bpy.data.actions if 'staan' in a.name), None), 1),
                               ('lopen', next((a for a in bpy.data.actions if 'lopen' in a.name), None), 7)):
        if actie is None:
            continue
        arm_.animation_data_create()
        arm_.animation_data.action = actie
        if actie.slots:
            arm_.animation_data.action_slot = actie.slots[0]
        scene.frame_set(frame)
        for r in ('Z', 'ZW'):
            arm_.rotation_mode = 'XYZ'
            arm_.rotation_euler = (0, 0, math.radians(L.INST['richtingen'][r]))
            bpy.context.view_layer.update()
            scene.render.filepath = os.path.join(uit, f'glb-{naam}-{r}.png')
            bpy.ops.render.render(write_still=True)
    with open(os.path.join(uit, 'glb-controle.json'), 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=1)
    print('KLAAR', info, flush=True)


if __name__ == '__main__':
    hoofd()
