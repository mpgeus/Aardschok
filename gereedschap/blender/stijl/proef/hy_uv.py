# Hunyuan3D-2mv: van een dichte mesh met kleur per punt naar een uitwisselbaar model: een lichtere mesh met UV, en de kleur en de fijne vorm in texturen, als GLB.
# Geen handwerk: versimpelen, automatisch uitvouwen en bakken. Meet ook de kwaliteit van de UV: de dekking, de eilanden en de rek.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P hy_uv.py -- <model.npz> <uit.glb> [vlakken=60000] [textuur=2048] [laag=<npz met dezelfde punten, zonder relief>]
import json
import math
import os
import sys
import time

import bmesh
import bpy
import numpy as np

ARGS = sys.argv[sys.argv.index('--') + 1:]
MODEL, UIT = ARGS[0], os.path.abspath(ARGS[1])
O = dict(a.split('=') for a in ARGS[2:] if '=' in a)
VLAKKEN, TEX = int(O.get('vlakken', 60000)), int(O.get('textuur', 2048))
t0 = time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
p = bpy.context.preferences.addons['cycles'].preferences
p.compute_device_type = 'CUDA'
p.get_devices()
for d in p.devices:
    d.use = d.type == 'CUDA'
sc.cycles.device = 'GPU'
sc.cycles.samples = 4
sc.cycles.use_denoising = False

d = np.load(MODEL)
me = bpy.data.meshes.new('hoog')
me.from_pydata(d['V'].tolist(), [], d['F'].tolist())
me.update()
hoog = bpy.data.objects.new('hoog', me)
sc.collection.objects.link(hoog)
for po in me.polygons:
    po.use_smooth = True
n = len(me.vertices)
ca = me.color_attributes.new('kleur', 'FLOAT_COLOR', 'POINT')
ca.data.foreach_set('color', np.concatenate([d['kleur'], np.ones((n, 1))], axis=1).astype(np.float32).ravel())
for k in ('ruw', 'metaal'):
    a = me.attributes.new(k, 'FLOAT', 'POINT')
    a.data.foreach_set('value', d[k].astype(np.float32))
mh = bpy.data.materials.new('bron')
mh.use_nodes = True
nt = mh.node_tree
pb = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
out = next(x for x in nt.nodes if x.type == 'OUTPUT_MATERIAL')
at = nt.nodes.new('ShaderNodeAttribute')
at.attribute_name = 'kleur'
em = nt.nodes.new('ShaderNodeEmission')
nt.links.new(at.outputs['Color'], em.inputs['Color'])
nt.links.new(em.outputs[0], out.inputs['Surface'])
me.materials.append(mh)

# de lichte kopie
laag = hoog.copy()
laag.data = me.copy()
laag.name = 'speerman'
sc.collection.objects.link(laag)
if 'laag' in O:
    # de lichte mesh uit dezelfde vorm zonder relief: anders hakt de reliëf de UV in duizenden eilanden. De relief gaat via de bak in de normal map
    laag.data.vertices.foreach_set('co', np.load(O['laag'])['V'].astype(np.float32).ravel())
    laag.data.update()
bpy.ops.object.select_all(action='DESELECT')
bpy.context.view_layer.objects.active = laag
laag.select_set(True)
m = laag.modifiers.new('minder', 'DECIMATE')
m.ratio = min(1.0, VLAKKEN / max(len(me.polygons), 1))
bpy.ops.object.modifier_apply(modifier=m.name)
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(80), island_margin=0.0008, area_weight=0.0, correct_aspect=True)
bpy.ops.uv.select_all(action='SELECT')
bpy.ops.uv.pack_islands(rotate=True, margin=0.0015)
bpy.ops.object.mode_set(mode='OBJECT')
tijd_uv = time.time() - t0

# UV-kwaliteit
bm = bmesh.new()
bm.from_mesh(laag.data)
uvl = bm.loops.layers.uv.active
bm.faces.ensure_lookup_table()
opp_uv, opp_3d, rek = 0.0, 0.0, []
for f in bm.faces:
    u = [l[uvl].uv for l in f.loops]
    if len(u) != 3:
        continue
    a_uv = abs((u[1] - u[0]).cross(u[2] - u[0])) / 2
    a_3d = f.calc_area()
    opp_uv += a_uv
    opp_3d += a_3d
    if a_3d > 1e-9:
        rek.append(a_uv / a_3d)
rek = np.array(rek)
rel = rek / np.median(rek)
# eilanden: vlakken die via gedeelde uv-randen samenhangen
gezien, eilanden = set(), 0
for f in bm.faces:
    if f.index in gezien:
        continue
    eilanden += 1
    stapel = [f]
    gezien.add(f.index)
    while stapel:
        g = stapel.pop()
        for l in g.loops:
            r = l.link_loop_radial_next
            h = r.face
            if h.index in gezien or r == l:
                continue
            if (l[uvl].uv - r.link_loop_next[uvl].uv).length < 1e-5 and (l.link_loop_next[uvl].uv - r[uvl].uv).length < 1e-5:
                gezien.add(h.index)
                stapel.append(h)
info = {'vlakken': len(bm.faces), 'punten': len(bm.verts), 'uv_dekking': round(opp_uv, 3), 'eilanden': eilanden, 'rek_p5': round(float(np.percentile(rel, 5)), 2), 'rek_p95': round(float(np.percentile(rel, 95)), 2), 'tijd_uv_s': round(tijd_uv, 1)}
bm.free()


# de doelmaterialen: elke textuur is een eigen knoop, en de bak schrijft naar de actieve knoop in het materiaal van het doel
ml = bpy.data.materials.new('speerman')
ml.use_nodes = True
laag.data.materials.clear()
laag.data.materials.append(ml)
nl = ml.node_tree
bl = next(x for x in nl.nodes if x.type == 'BSDF_PRINCIPLED')
sc.cycles.bake_type = 'EMIT'
bk = sc.render.bake
bk.use_selected_to_active = True
bk.cage_extrusion = 0.012
bk.max_ray_distance = 0.03
bk.margin = 8
bpy.ops.object.select_all(action='DESELECT')
hoog.select_set(True)
laag.select_set(True)
bpy.context.view_layer.objects.active = laag


def maak(naam, kleurruimte):
    im = bpy.data.images.new(naam, TEX, TEX)
    im.colorspace_settings.name = kleurruimte
    tx = nl.nodes.new('ShaderNodeTexImage')
    tx.image = im
    for x in nl.nodes:
        x.select = False
    tx.select = True
    nl.nodes.active = tx
    return im, tx


# 1. de kleur
ik, tk = maak('speerman-kleur', 'sRGB')
t1 = time.time()
bpy.ops.object.bake(type='EMIT', use_clear=True, use_selected_to_active=True)
info['bak_kleur_s'] = round(time.time() - t1, 1)
# 2. de ruwheid en het metaal, als kleur op dezelfde manier: emissie uit het kenmerk
nt.links.clear()
ar, am = nt.nodes.new('ShaderNodeAttribute'), nt.nodes.new('ShaderNodeAttribute')
ar.attribute_name, am.attribute_name = 'ruw', 'metaal'
cmb = nt.nodes.new('ShaderNodeCombineColor')
nt.links.new(am.outputs['Fac'], cmb.inputs[2])  # glTF: blauw is metaal, groen is ruwheid
nt.links.new(ar.outputs['Fac'], cmb.inputs[1])
cmb.inputs[0].default_value = 1.0
nt.links.new(cmb.outputs[0], em.inputs['Color'])
nt.links.new(em.outputs[0], out.inputs['Surface'])
ir, tr = maak('speerman-ruw-metaal', 'Non-Color')
bpy.ops.object.bake(type='EMIT', use_clear=True, use_selected_to_active=True)
# 3. de normaal: wat de lichte mesh aan fijne vorm mist
nt.links.clear()
nt.links.new(pb.outputs[0], out.inputs['Surface'])
inr, tn = maak('speerman-normaal', 'Non-Color')
t1 = time.time()
bpy.ops.object.bake(type='NORMAL', use_clear=True, use_selected_to_active=True, normal_space='TANGENT')
info['bak_normaal_s'] = round(time.time() - t1, 1)
for im in (ik, ir, inr):
    if float(np.asarray(im.pixels[:40000]).std()) == 0.0 and float(np.array(im.pixels[::9973]).std()) == 0.0:
        info.setdefault('leeg', []).append(im.name)
# het materiaal van het model
nl.links.new(tk.outputs['Color'], bl.inputs['Base Color'])
sep = nl.nodes.new('ShaderNodeSeparateColor')
nl.links.new(tr.outputs['Color'], sep.inputs[0])
nl.links.new(sep.outputs[1], bl.inputs['Roughness'])
nl.links.new(sep.outputs[2], bl.inputs['Metallic'])
nmk = nl.nodes.new('ShaderNodeNormalMap')
nl.links.new(tn.outputs['Color'], nmk.inputs['Color'])
nl.links.new(nmk.outputs[0], bl.inputs['Normal'])
map_ = os.path.dirname(UIT)
for im in (ik, ir, inr):
    im.filepath_raw = os.path.join(map_, im.name + '.png')
    im.file_format = 'PNG'
    im.save()
hoog.hide_set(True)
bpy.ops.object.select_all(action='DESELECT')
laag.select_set(True)
bpy.context.view_layer.objects.active = laag
bpy.ops.export_scene.gltf(filepath=UIT, export_format='GLB', use_selection=True, export_apply=False)
info['glb_mb'] = round(os.path.getsize(UIT) / 2**20, 1)
info['tijd_s'] = round(time.time() - t0, 1)
with open(UIT.replace('.glb', '-uv.json'), 'w', encoding='utf-8') as f:
    json.dump(info, f, indent=1)
print('UV', json.dumps(info))
