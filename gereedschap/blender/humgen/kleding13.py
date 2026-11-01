# Ronde 13 (Marcel, 29 okt: "We gaan professionele bestaande 3D-assets gebruiken als bron voor hoogwaardige
# kledingconstructie, plooien, stiknaden, materiaaldetails en oppervlakteafwerking"): de kleding van Human Generator zelf
# (de pakketten die Marcel al heeft: Base Clothes en het Extra Outfits Pack) aan de HumGen-man, met de API van HumGen
# (outfit.set en footwear.set passen het kledingstuk aan de vorm van deze man, in de shape key 'Body Proportions'), en
# gerenderd zoals het is: de bron, met zijn eigen materialen, op onze camera (30 graden) en in ons licht.
#
#   blender.exe -b <humgen.blend van maak.py> -P gereedschap/blender/humgen/kleding13.py -- <uitmap> <soort>:<zoek> ...
#   (soort: outfit of footwear; zoek: een stuk van de naam van de voorinstelling, bv. outfit:Frosty_Evening)
import json
import math
import os
import sys

import bpy
from HumGen3D import Human

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import render as R  # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:]
MAP = os.path.abspath(ARGS[0])


def aankleden(ctx, keuzes):
    rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    mens = Human.from_existing(rig)
    uit = {}
    for keuze in keuzes:
        soort, _, zoek = keuze.partition(':')
        stuk = mens.clothing.outfit if soort == 'outfit' else mens.clothing.footwear
        opties = stuk.get_options(ctx)
        p = next(x for x in opties if zoek in x)
        voor = {o.name for o in bpy.data.objects}
        stuk.set(p, ctx)
        nieuw = [o for o in bpy.data.objects if o.name not in voor and o.type == 'MESH']
        uit[keuze] = {'voorinstelling': p, 'objecten': {o.name: sum(len(f.vertices) - 2 for f in o.data.polygons) for o in nieuw}}
    return rig, uit


def main():
    ctx = bpy.context
    os.makedirs(MAP, exist_ok=True)
    rig, uit = aankleden(ctx, ARGS[1:])
    sc = R.scene()
    sc.cycles.samples = 64
    sc.render.resolution_x, sc.render.resolution_y = 560, 760
    for naam, draai, elev in (('zw', -40, 30), ('voor', 0, 10)):
        rig.rotation_euler = (0, 0, math.radians(draai))
        bpy.context.view_layer.update()
        cam = R.camera(sc, elev, 0, 'b', (280, 700), (560, 760, 300))
        sc.camera = cam
        R.licht(sc, cam)
        R.render(sc, os.path.join(MAP, f'bron-{naam}.png'))
        bpy.data.objects.remove(cam, do_unlink=True)
    rig.rotation_euler = (0, 0, 0)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(MAP, 'bron.blend'))
    json.dump(uit, open(os.path.join(MAP, 'kleding.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('KLEDING13', json.dumps(uit, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
