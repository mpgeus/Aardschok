# De HumGen-man naar GLB en terug (Marcel, 29 okt, ronde 9: "GLB-export en herimport indien uitgevoerd"): met de
# exporteur van HumGen zelf (human.export.to_glb; die bakt de livekeys in de mesh), daarna in een lege scène weer
# ingelezen en gemeten: de meshes, het skelet, de lengte, de materialen en de texturen. Zonder het pakket HG_Export bakt
# HumGen de huid niet: de procedurele huid gaat dan zonder textuur mee (zie het verslag).
# Het .blend wordt niet opnieuw opgeslagen (de export verandert de mens).
#
#   blender.exe -b <uit>/bron/humgen.blend -P gereedschap/blender/humgen/exporteer.py
import json
import os
import sys
import time

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
UIT = os.path.join(os.path.abspath(os.path.join(HIER, '..', '..', '..')), INST['uit'])
from HumGen3D import Human  # noqa: E402


def main():
    rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    mens = Human.from_existing(rig)
    os.makedirs(os.path.join(UIT, 'export'), exist_ok=True)
    t0 = time.time()
    pad = mens.export.to_glb(os.path.join(UIT, 'export', 'humgen.glb'))
    t = time.time() - t0
    pad = pad if isinstance(pad, str) and os.path.exists(pad) else os.path.join(UIT, 'export', 'humgen.glb')
    bpy.ops.wm.read_homefile(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=pad)
    # alleen wat aan het skelet hangt: de importer van glTF zet een Icosphere (straal 1 m, in de oorsprong, aan niets vast)
    # neer als vorm voor de botten; die maakte in ronde 9 van 1,75 m een 'lengte' van 2,75 m
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE']
    hulp = [o.name for o in bpy.data.objects if o.type == 'MESH' and o.parent is None]
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and o.parent in arm]
    deps = bpy.context.evaluated_depsgraph_get()
    zs = [(o.matrix_world @ v.co).z for o in meshes for v in o.evaluated_get(deps).data.vertices]
    lijf = max(meshes, key=lambda o: len(o.data.vertices))
    verslag = {'bestand': os.path.relpath(pad, UIT), 'grootte_mb': round(os.path.getsize(pad) / 2 ** 20, 2), 'seconden': round(t, 1),
               'meshes': {o.name: len(o.data.vertices) for o in meshes}, 'hulpobjecten_van_de_importer': hulp, 'skeletten': len(arm),
               'botten': len(arm[0].data.bones) if arm else 0, 'lengte_m': round(max(zs) - min(zs), 4),
               'lijf_aan_skelet': any(m.type == 'ARMATURE' for m in lijf.modifiers) or lijf.parent in arm,
               'lijf_vertexgroepen': len(lijf.vertex_groups),
               'materialen': [m.name for m in bpy.data.materials if m.users], 'texturen': [i.name for i in bpy.data.images if i.users]}
    json.dump(verslag, open(os.path.join(UIT, 'export', 'export.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('EXPORT', json.dumps(verslag, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
