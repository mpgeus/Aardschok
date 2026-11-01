# De basismens, stap 3: de GLB. Het skelet, het spelmodel ('lijf') en de onderbroek met hun materialen en de textuur van
# de huid, in de rusthouding, in meters (glTF staat Y omhoog; Blender zet dat bij in- en uitlezen om). Daarna leest een
# lege Blender de GLB weer in en meet wat er binnenkwam: de botten, de meshes, de gewichten, de lengte, waar voor en waar
# links is, en de textuur.
#
# Met `-- soldaat` (op soldaat.blend, ronde 3) de geklede soldaat: het skelet, het lijf dat over is, elk onderdeel als
# eigen mesh, en de speer aan zijn greep (een leeg object aan het bot van de rechterhand). De materialen van de kleren zijn
# knopen (de stof, het leer en het staal van de speerman); sinds ronde 4 bakt textuur.py ze tot beelden (de kleur, de
# normalen, ruwheid en metaal) in soldaat-hoog.blend, en met `realtime` erbij de versimpelde soldaat met zijn eigen
# beelden (soldaat-realtime.blend). De beelden gaan als JPEG in de GLB; na het inlezen kijkt hij per mesh of de drie
# beelden er nog aan zitten.
#
#   blender.exe -b <uit>/bron/basismens.blend -P gereedschap/blender/basismens/export.py
#   blender.exe -b <uit>/bron/soldaat-hoog.blend -P gereedschap/blender/basismens/export.py -- soldaat
#   blender.exe -b <uit>/bron/soldaat-realtime.blend -P gereedschap/blender/basismens/export.py -- soldaat realtime
# naar <uit>/export/basismens.glb en <uit>/export.json, <uit>/export/soldaat.glb en <uit>/export-soldaat.json, of
# <uit>/export/soldaat-realtime.glb en <uit>/export-soldaat-realtime.json.
import json
import os
import sys

import bpy
from mathutils import Matrix, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
from variant import INST, UIT, WORTEL  # noqa: E402  (de instellingen en de map van de variant)
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
SOLDAAT, REALTIME = 'soldaat' in ARGS, 'realtime' in ARGS


def effen(m):
    """Een materiaal van knopen als effen kleur voor de GLB (de kleur die soldaat.py erbij zette)."""
    kl = m['kleur'].lstrip('#')
    lin = [((c / 255 + 0.055) / 1.055) ** 2.4 if c / 255 > 0.04045 else c / 255 / 12.92 for c in (int(kl[i:i + 2], 16) for i in (0, 2, 4))]
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    uit = nt.nodes.new('ShaderNodeOutputMaterial')
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = tuple(lin) + (1.0,)
    b.inputs['Roughness'].default_value = 0.75
    b.inputs['Metallic'].default_value = 0.7 if m.name.startswith(('helm', 'staal', 'blad')) else 0.0
    nt.links.new(b.outputs['BSDF'], uit.inputs['Surface'])


def texturen(o):
    """Welke beelden het materiaal van een mesh gebruikt: achter de kleur, de normalen, en ruwheid en metaal."""
    uit = {'kleur': False, 'normaal': False, 'rm': False}

    def beeld(sok):
        rij = [l.from_node for l in sok.links]
        while rij:
            n = rij.pop()
            if n.type == 'TEX_IMAGE' and n.image is not None:
                return True
            for i in n.inputs:
                rij += [l.from_node for l in i.links]
        return False
    for sl in o.material_slots:
        m = sl.material
        b = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None) if m and m.node_tree else None
        if b is None:
            continue
        uit['kleur'] |= beeld(b.inputs['Base Color'])
        uit['normaal'] |= beeld(b.inputs['Normal'])
        uit['rm'] |= beeld(b.inputs['Roughness']) and beeld(b.inputs['Metallic'])
    return uit


def hoogte(meshes):
    deps = bpy.context.evaluated_depsgraph_get()
    zs = []
    for ob in meshes:
        e = ob.evaluated_get(deps)
        me = e.to_mesh()
        zs += [(ob.matrix_world @ v.co).z for v in me.vertices]
        e.to_mesh_clear()
    return min(zs), max(zs)


def main():
    rig = bpy.data.objects['skelet']
    if SOLDAAT:
        delen = [rig] + [o for o in bpy.data.objects if 'onderdeel' in o] + [bpy.data.objects['greep.R']]
        for m in bpy.data.materials:
            if 'kleur' in m:
                effen(m)
    else:
        delen = [rig, bpy.data.objects['lijf'], bpy.data.objects['onderbroek']]
    rig.rotation_euler = (0, 0, 0)
    for pb in rig.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.ops.object.select_all(action='DESELECT')
    for ob in delen:
        ob.hide_set(False)
        ob.select_set(True)
    bpy.context.view_layer.objects.active = rig
    os.makedirs(os.path.join(UIT, 'export'), exist_ok=True)
    pad = os.path.join(UIT, 'export', ('soldaat-realtime.glb' if REALTIME else 'soldaat.glb') if SOLDAAT else 'basismens.glb')
    beelden = {'export_image_format': 'JPEG', 'export_image_quality': INST['soldaat']['textuur']['jpeg']} if SOLDAAT else {}
    import soldaat_render as SR
    for o in bpy.context.selected_objects:
        SR.zonder_hoornvlies(o)  # ronde 10: de ogen van HumGen
    bpy.ops.export_scene.gltf(filepath=pad, export_format='GLB', use_selection=True, export_apply=False,
                              export_skins=True, export_animations=False, export_yup=True, export_materials='EXPORT', **beelden)
    botten = sorted(b.name for b in rig.data.bones)
    # opnieuw inlezen in een lege Blender
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=pad)
    bpy.context.view_layer.update()
    skeletten = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE']
    arm = skeletten[0] if skeletten else None
    # de importer maakt zelf een vorm om de botten te tekenen (een Icosphere): die zat niet in de GLB
    vormen = {pb.custom_shape for pb in arm.pose.bones if pb.custom_shape} if arm else set()
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o not in vormen]
    # de speer: aan welk object hangt hij, en dat aan welk bot (een leeg object aan een bot: parent_type BONE)
    keten = []
    sp = bpy.context.scene.objects.get('speer')
    while sp is not None and sp.parent is not None:
        keten.append({'object': sp.name, 'ouder': sp.parent.name, 'soort': sp.parent_type, 'bot': sp.parent_bone})
        sp = sp.parent
    terug = sorted(b.name for b in arm.data.bones) if arm else []
    laag, hoog = hoogte(meshes)
    feiten = {'bestand': os.path.relpath(pad, UIT), 'grootte': os.path.getsize(pad), 'skeletten': len(skeletten),
              'botten': len(terug), 'botten_gelijk': terug == botten,
              'meshes': {o.name: {'driehoeken': sum(len(p.vertices) - 2 for p in o.data.polygons),
                                  'gewichten': len(o.vertex_groups),
                                  'aan_skelet': any(m.type == 'ARMATURE' and m.object == arm for m in o.modifiers),
                                  'texturen': texturen(o)}
                         for o in meshes},
              'lengte': round(hoog - laag, 4), 'laagste_punt': round(laag, 4),
              'materialen': sorted(m.name for m in bpy.data.materials),
              'texturen': {i.name: list(i.size) for i in bpy.data.images if i.type == 'IMAGE'}}
    if SOLDAAT:
        feiten['speer_aan'] = keten
        if arm and 'speer' in bpy.context.scene.objects:
            # waar de speer in rust zit: bij de rechterhand (de A-houding), niet bij de linker
            sp = bpy.context.scene.objects['speer']
            ps = [sp.matrix_world @ v.co for v in sp.data.vertices]
            midden = sum(ps, Vector()) / len(ps)
            hand = {k: (arm.matrix_world @ arm.data.bones[f'wrist.{k}'].head_local - midden).length for k in 'LR'}
            feiten['speer_bij_de_hand'] = {k: round(d, 3) for k, d in hand.items()}
    if arm:
        W = lambda b: arm.matrix_world @ arm.data.bones[b].head_local
        # het gezicht ligt voor het hoofdbot (-Y), zijn linkerarm aan +X
        lijf = next((o for o in meshes if o.name == 'lijf'), None) or max(meshes, key=lambda o: len(o.data.vertices))
        g = lijf.vertex_groups.get('head')
        hoofd = [lijf.matrix_world @ v.co for v in lijf.data.vertices if g and any(x.group == g.index and x.weight > 0.5 for x in v.groups)]
        feiten['gezicht_voor'] = bool(hoofd) and min(p.y for p in hoofd) < W('head').y - 0.05
        feiten['links_aan_plus_x'] = W('upperarm01.L').x > 0 > W('upperarm01.R').x
    naam = ('export-soldaat-realtime.json' if REALTIME else 'export-soldaat.json') if SOLDAAT else 'export.json'
    json.dump(feiten, open(os.path.join(UIT, naam), 'w', encoding='utf-8'),
              indent=1, ensure_ascii=False)
    print('EXPORT', json.dumps(feiten, ensure_ascii=False))


try:
    main()
except Exception:
    import traceback
    traceback.print_exc()
    sys.exit(1)
