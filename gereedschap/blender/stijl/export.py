# De realtime versie en de GLB (vraag 192, punt 11 en 16 van de specificatie). Het model voor de sprites is dicht (ruim een miljoen driehoeken,
# de verf op de punten); de GLB is dezelfde figuur op zo'n 39.000 driehoeken, met een UV-kaart en de verf en de ruwheid gebakken in een
# textuur, met hetzelfde skelet en dezelfde bewegingen. De sprites blijven uit het dichte model komen.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/export.py -- <uitmap> [textuur=2048]
import json
import os
import sys
import time

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import licht as L  # noqa: E402

# het budget per onderdeel, in driehoeken: meer waar het gezicht en de vorm zitten
BUDGET = {'hoofd': 4000, 'baard': 1500, 'helm': 6000, 'kap': 3000, 'gambeson': 6000, 'tabberd': 5500, 'riem': 1500, 'buidel': 1000, 'hozen': 1200,
          'laarzen': 3500, 'handschoenen': 4000, 'speer': 1500}


def versimpel(ob, doel):
    n = len(ob.data.polygons) * 2
    mod = ob.modifiers.new('versimpel', 'DECIMATE')
    mod.decimate_type = 'COLLAPSE'
    mod.ratio = min(1.0, doel / max(n, 1))
    # het skelet uit, zodat hij in rust versimpelt
    sk = ob.modifiers['skelet']
    sk.show_viewport = False
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=mod.name)
    sk.show_viewport = True


def bak(ob, beeld, uitgang, kleur=None, kanalen=None):
    """Attributen in een textuur bakken, als emissie, zodat er geen licht in komt: één kleur, of per kanaal (G en B) een getal. Ze gaan in één
    keer in het beeld: de pixels van een gebakken beeld krijg je in Python niet terug, dus samenvoegen kan daarna niet (een GLB die overal glansde)."""
    nt = ob.active_material.node_tree
    nt.nodes.clear()
    e = nt.nodes.new('ShaderNodeEmission')
    if kleur:
        a = nt.nodes.new('ShaderNodeAttribute')
        a.attribute_name = kleur
        nt.links.new(a.outputs['Color'], e.inputs['Color'])
    else:
        c = nt.nodes.new('ShaderNodeCombineColor')
        c.inputs[0].default_value = 1.0
        for kanaal, attribuut in kanalen.items():
            a = nt.nodes.new('ShaderNodeAttribute')
            a.attribute_name = attribuut
            nt.links.new(a.outputs['Fac'], c.inputs[kanaal])
        nt.links.new(c.outputs[0], e.inputs['Color'])
    u = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(e.outputs[0], u.inputs[0])
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = beeld
    for n in nt.nodes:
        n.select = False
    t.select = True
    nt.nodes.active = t
    t0 = time.time()
    r = bpy.ops.object.bake(type='EMIT', margin=8, use_clear=True)
    print(f'gebakken {uitgang} in {time.time() - t0:.1f} s: {r}', flush=True)
    beeld.filepath_raw = uitgang
    beeld.file_format = 'PNG'
    beeld.save()
    beeld.source = 'FILE'


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    tex = 2048
    for a in argv[1:]:
        if a.startswith('textuur='):
            tex = int(a[8:])
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    L.videokaart(scene)
    scene.cycles.samples = 1
    scene.cycles.bake_type = 'EMIT'
    arm_ = bpy.data.objects['skelet']
    arm_.animation_data.action = None
    for pb in arm_.pose.bones:
        pb.matrix_basis.identity()
    bpy.context.view_layer.update()
    # het lijf gaat niet mee: het zit onder de kleren
    delen = []
    for naam, doel in BUDGET.items():
        ob = bpy.data.objects[naam]
        versimpel(ob, doel)
        delen.append(ob)
        print(naam, len(ob.data.polygons), 'vlakken', flush=True)
    bpy.data.objects.remove(bpy.data.objects['lijf'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in delen:
        ob.hide_render = False
        ob.select_set(True)
    bpy.context.view_layer.objects.active = delen[0]
    bpy.ops.object.join()
    fig = bpy.context.view_layer.objects.active
    fig.name = 'speerman'
    fig.data.name = 'speerman'
    # de UV-kaart
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.quads_convert_to_tris()
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.004)
    bpy.ops.object.mode_set(mode='OBJECT')
    # bakken: de verf, en ruwheid en metaal in de kanalen die glTF verwacht
    mat = bpy.data.materials.new('speerman')
    mat.use_nodes = True
    fig.data.materials.clear()
    fig.data.materials.append(mat)
    fig.active_material = mat
    scene.render.bake.use_selected_to_active = False
    kleur = bpy.data.images.new('speerman-kleur', tex, tex, alpha=False)
    orm = bpy.data.images.new('speerman-orm', tex // 2, tex // 2, alpha=False)
    orm.colorspace_settings.name = 'Non-Color'
    bak(fig, kleur, os.path.join(uit, 'speerman-kleur.png'), kleur='verf')
    # de kanalen die glTF verwacht: G ruwheid, B metaal
    bak(fig, orm, os.path.join(uit, 'speerman-orm.png'), kanalen={'Green': 'ruwheid', 'Blue': 'metaal'})
    # het eindmateriaal
    nt = mat.node_tree
    nt.nodes.clear()
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    u = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(b.outputs[0], u.inputs[0])
    tk = nt.nodes.new('ShaderNodeTexImage')
    tk.image = kleur
    nt.links.new(tk.outputs['Color'], b.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage')
    to.image = orm
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(to.outputs['Color'], sep.inputs[0])
    nt.links.new(sep.outputs['Green'], b.inputs['Roughness'])
    nt.links.new(sep.outputs['Blue'], b.inputs['Metallic'])
    # de attributen zijn nu gebakken
    for naam in ('verf', 'ruwheid', 'metaal', 'stof', 'spiegel', 'contact', 'bol'):
        if naam in fig.data.attributes:
            fig.data.attributes.remove(fig.data.attributes[naam])
    # opslaan en exporteren
    blend = os.path.join(uit, 'speerman-realtime.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    glb = os.path.join(uit, 'speerman.glb')
    bpy.ops.object.select_all(action='DESELECT')
    fig.select_set(True)
    arm_.select_set(True)
    bpy.ops.export_scene.gltf(filepath=glb, export_format='GLB', use_selection=True, export_animations=True, export_animation_mode='ACTIONS',
                              export_force_sampling=True, export_skins=True, export_image_format='AUTO')
    info = {'driehoeken': len(fig.data.polygons), 'punten': len(fig.data.vertices), 'textuur': tex, 'groepen': len(fig.vertex_groups),
            'glb_mb': round(os.path.getsize(glb) / 1e6, 2), 'acties': [a.name for a in bpy.data.actions]}
    with open(os.path.join(uit, 'export.json'), 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=1)
    print('KLAAR', info, flush=True)


if __name__ == '__main__':
    hoofd()
