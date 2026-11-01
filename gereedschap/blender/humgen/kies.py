# De keuze van het gezicht (Marcel, 29 okt, ronde 9: "Maak één volwassen mannelijk personage ... een volwassen, robuust
# gezicht met een neutrale expressie"): alle mannelijke voorinstellingen van HumGen3D (Human.get_preset_options), elk
# even gemaakt, op 35 jaar gezet en van voren en schuin gerenderd (Eevee, de huid van HumGen), op één blad met hun naam.
# Daaruit kiest instellingen.json 'voorinstelling'.
#
#   blender.exe -b -P gereedschap/blender/humgen/kies.py
# naar <uit>/kies/ (per voorinstelling een beeld) en <uit>/kies.png.
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
WORTEL = os.path.abspath(os.path.join(HIER, '..', '..', '..'))
UIT = os.path.join(WORTEL, INST['uit'])
from HumGen3D import Human  # noqa: E402


def leeg():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)


def camera(punt, draai, schaal):
    cd = bpy.data.cameras.new('kop')
    cd.type, cd.ortho_scale = 'ORTHO', schaal
    cam = bpy.data.objects.new('kop', cd)
    bpy.context.scene.collection.objects.link(cam)
    R = Matrix.Rotation(math.radians(draai), 4, 'Z')
    kijk = R.to_3x3() @ Vector((0, 1, 0))
    cam.matrix_world = Matrix.Translation(punt - kijk * 3) @ R @ Matrix.Rotation(math.pi / 2, 4, 'X')
    return cam


def main():
    sc = bpy.context.scene
    leeg()
    sc.render.engine = next(e for e in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT') if e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys())
    sc.render.resolution_x, sc.render.resolution_y = 256, 300
    sc.render.film_transparent = True
    zon = bpy.data.objects.new('zon', bpy.data.lights.new('zon', 'SUN'))
    zon.data.energy = 3.0
    zon.rotation_euler = (math.radians(50), 0, math.radians(-30))
    sc.collection.objects.link(zon)
    if sc.world is None:
        sc.world = bpy.data.worlds.new('wereld')
    sc.world.color = (0.35, 0.35, 0.37)
    os.makedirs(os.path.join(UIT, 'kies'), exist_ok=True)
    lijst = []
    for p in Human.get_preset_options('male', context=bpy.context):
        mens = Human.from_preset(p, context=bpy.context)
        mens.age.set(INST['leeftijd'])
        rig = mens.objects.rig
        bpy.context.view_layer.update()
        kop = rig.matrix_world @ rig.pose.bones['head'].head + Vector((0, 0, 0.09))
        naam = os.path.splitext(os.path.basename(p))[0]
        for kant, draai in (('voor', 0), ('schuin', 35)):
            c = camera(kop, draai, 0.34)
            sc.camera = c
            sc.render.filepath = os.path.join(UIT, 'kies', f'{naam}-{kant}.png')
            bpy.ops.render.render(write_still=True)
            bpy.data.objects.remove(c, do_unlink=True)
        lijst.append({'voorinstelling': p, 'naam': naam})
        mens.delete()
    json.dump(lijst, open(os.path.join(UIT, 'kies', 'lijst.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('KIES', len(lijst))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
