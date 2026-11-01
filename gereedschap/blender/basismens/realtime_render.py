# De realtime soldaat naast de bronversie (Marcel, 29 okt, ronde 4: "een vergelijking tussen de hoogwaardige
# bronversie en de geoptimaliseerde GLB"). In de scène van de bron (soldaat.blend: dezelfde camera's en hetzelfde licht
# als soldaat_render.py) gaat de bron uit beeld en komt de GLB erin zoals een spel hem leest: soldaat-realtime.glb,
# opnieuw ingelezen, met zijn eigen materialen (de gebakken beelden). Zijn skelet volgt dat van de bron bot voor bot
# (Copy Transforms in de wereld), dus dezelfde houding en dezelfde draai per richting. Dan de acht richtingen, de grote
# render en de close-ups, zoals van de bron; en hetzelfde voor soldaat.glb (de bron met gebakken texturen).
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/basismens/realtime_render.py
# naar <uit>/soldaat/realtime/ en <uit>/soldaat/glb/, en <uit>/realtime-renders.json.
import json
import os
import sys

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import render as R  # noqa: E402
import soldaat_render as SR  # noqa: E402

UIT, CAM, SC = SR.UIT, SR.CAM, SR.SC


def inlezen(pad, bron_rig):
    """De GLB erin, zijn skelet aan dat van de bron; geeft zijn objecten."""
    voor = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=pad)
    nieuw = [o for o in bpy.data.objects if o not in voor]
    arm = next(o for o in nieuw if o.type == 'ARMATURE')
    for pb in arm.pose.bones:
        pb.custom_shape = None
        c = pb.constraints.new('COPY_TRANSFORMS')
        c.target, c.subtarget = bron_rig, pb.name
    bpy.context.view_layer.update()
    return nieuw


def main():
    sc = R.scene()
    sc.render.resolution_x, sc.render.resolution_y = SC['breed'], SC['hoog']
    rig = bpy.data.objects['skelet']
    rig.data.pose_position = 'POSE'
    rig.rotation_euler = (0, 0, 0)
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    SR.houding(rig)
    feiten = json.load(open(os.path.join(UIT, 'soldaat.json'), encoding='utf-8'))
    bron = [o for o in bpy.data.objects if o.type == 'MESH']
    verslag = {}
    for naam, glb in (('realtime', 'soldaat-realtime.glb'), ('glb', 'soldaat.glb')):
        for o in bron:
            o.hide_render = True
        nieuw = inlezen(os.path.join(UIT, 'export', glb), rig)
        cam = R.camera(sc, CAM['elevatie'], 0, 'camera-' + naam, SC['anker'], SR.DOEK)
        sc.camera = cam
        SR.licht(sc, cam)
        sc.render.resolution_x, sc.render.resolution_y = SC['breed'], SC['hoog']
        SR.MAP = os.path.join('soldaat', naam)
        os.makedirs(os.path.join(UIT, SR.MAP), exist_ok=True)

        def doen(r):
            R.render(sc, os.path.join(UIT, SR.MAP, f'richting-{r}.png'))
            return R.vak(os.path.join(UIT, SR.MAP, f'richting-{r}.png'))
        verslag[naam] = {'richtingen': SR.per_richting(sc, rig, doen),
                         'driehoeken': sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in nieuw if o.type == 'MESH')}
        SR.groot(sc, rig, feiten['speer']['vuist'])
        for o in nieuw:
            bpy.data.objects.remove(o, do_unlink=True)
    json.dump(verslag, open(os.path.join(UIT, 'realtime-renders.json'), 'w', encoding='utf-8'), indent=1)
    print('REALTIME-RENDER', json.dumps({k: v['driehoeken'] for k, v in verslag.items()}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
