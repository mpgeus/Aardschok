# De close-ups uit de specificatie (vraag 192): hoofd, romp, handschoenen, laarzen en speer, elk uit de vaste opstelling met een eigen
# uitsnede. Ze horen bij de beoordeling van het model, niet bij het spel.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/detail.py -- <uitmap> [pixels=640] [monsters=64] [elevatie=12]
import math
import os
import sys

import bpy
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import skelet as S  # noqa: E402

# naam: richting, punt waar de camera op kijkt (x, z in beeld, in meter), breedte van het beeld in meter; 'bot:' volgt een bot
UITSNEDEN = {
    'hoofd-Z': ('Z', (0.0, 1.13), 0.62),
    'hoofd-ZW': ('ZW', (0.0, 1.13), 0.62),
    'hoofd-W': ('W', (0.0, 1.13), 0.62),
    'hoofd-N': ('N', (0.0, 1.13), 0.62),
    'romp-Z': ('Z', (0.0, 0.62), 0.78),
    'romp-ZW': ('ZW', (0.0, 0.62), 0.78),
    'romp-N': ('N', (0.0, 0.62), 0.78),
    'hand-rechts': ('Z', ('hand.R', 0.0), 0.42),
    'hand-links': ('Z', ('hand.L', 0.0), 0.42),
    'laarzen-Z': ('Z', (0.0, 0.14), 0.72),
    'laarzen-ZW': ('ZW', (0.0, 0.14), 0.72),
    'speer-punt': ('Z', ('speer', 1.0), 0.6),
    'speer-hand': ('ZW', ('speer', 0.0), 0.6),
}


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    o = {'pixels': '640', 'monsters': '64', 'elevatie': '12'}
    for a in argv[1:]:
        k, v = a.split('=')
        o[k] = v
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    L.zet_op(scene, float(o['elevatie']), int(o['pixels']), int(o['monsters']))
    arm_ = bpy.data.objects['skelet']
    arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    e = math.radians(float(o['elevatie']))
    cam = scene.camera
    for naam, (r, (px, pz), breed) in UITSNEDEN.items():
        hoek = L.INST['richtingen'][r]
        arm_.rotation_euler = (0, 0, math.radians(hoek))
        h = B.zet(arm_, rust, 'staan', 0.0, -hoek)
        bpy.context.view_layer.update()
        if isinstance(px, str):
            bot = arm_.pose.bones[px]
            p = arm_.matrix_world @ (bot.head if pz == 0.0 else bot.head + (bot.tail - bot.head) / bot.length * 1.0)
            doel = Vector((p.x, p.y, p.z))
        else:
            doel = Vector((px, 0.0, pz))
        cam.data.ortho_scale = breed
        cam.location = doel + Vector((0.0, -math.cos(e), math.sin(e))) * 20.0
        cam.rotation_euler = (doel - cam.location).to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = os.path.join(uit, naam + '.png')
        bpy.ops.render.render(write_still=True)
    print('KLAAR', uit, flush=True)


if __name__ == '__main__':
    hoofd()
