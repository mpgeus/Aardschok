# Een mesh uit Hunyuan3D-2mv in Blender renderen, met de camera, het licht en de klei van vormproef V4 (ortho 2,0, 1024 pixels; het doel
# 0,85 in plaats van 0,8, anders valt de punt van deze speer buiten beeld).
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P hy_kijk.py -- <model.glb|model.npz> <map> [draai=<graden>] [elevatie=25] [hoogte=1.799] [richtingen=Z,W,N,O]
#       [mat=klei|kleur|pbr|onverlicht|verf|model] [ao=0..1] [beelden=<n, als de npz Vf heeft>] [houding=lopen] [speerkijkt] [licht=<json met waarden voor licht.py>] [monsters=24] [pixels=1024] [ortho=2.0] [doel=0.85] [schaal=<meter per eenheid>]
# naar <map>/staan-<richting>-00.png. hoogte is de hele mesh in meters: met speer 1,799, zoals V4; schaal gaat daarvoor. draai zet het gezicht naar -y.
# Een .npz heeft V en F, en eventueel kleur (n×3, lineair), ruw en metaal (n).
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

STIJL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, STIJL)
import licht as L  # noqa: E402
import render as RD  # noqa: E402

ARGS = sys.argv[sys.argv.index('--') + 1:]
MODEL, UIT = ARGS[0], os.path.abspath(ARGS[1])
O = dict(a.split('=') for a in ARGS[2:] if '=' in a)
DRAAI, ELEVATIE, HOOGTE = float(O.get('draai', 0)), float(O.get('elevatie', 25)), float(O.get('hoogte', 1.799))
RICHTINGEN = O.get('richtingen', 'Z,W,N,O').split(',')
ORTHO, DOEL_Z, PIXELS = float(O.get('ortho', 2.0)), float(O.get('doel', 0.85)), int(O.get('pixels', 1024))
MONSTERS = int(O.get('monsters', 24))
MAT = O.get('mat', 'klei')

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
kenmerken = {}
if MODEL.endswith('.npz'):
    d = np.load(MODEL)
    me = bpy.data.meshes.new('mesh')
    me.from_pydata(d['V'].tolist(), [], d['F'].tolist())
    me.update()
    ob = bpy.data.objects.new('mesh', me)
    sc.collection.objects.link(ob)
    kenmerken = {k: d[k] for k in d.files if k in ('kleur', 'ruw', 'metaal', 'echt')}
else:
    bpy.ops.import_scene.gltf(filepath=MODEL)
delen = [o for o in sc.objects if o.type == 'MESH']
bpy.context.view_layer.update()

# de mesh zelf: hoeveel losse stukken, en of hij dicht is
bm = bmesh.new()
for o in delen:
    bm.from_mesh(o.data)
open_randen = sum(1 for e in bm.edges if not e.is_manifold)
bm.verts.ensure_lookup_table()
gezien, stukken, groot = set(), 0, []
for v in bm.verts:
    if v.index in gezien:
        continue
    stukken += 1
    stapel, n = [v], 0
    gezien.add(v.index)
    while stapel:
        w = stapel.pop()
        n += 1
        for e in w.link_edges:
            a = e.other_vert(w)
            if a.index not in gezien:
                gezien.add(a.index)
                stapel.append(a)
    groot.append(n)
info = {'punten': len(bm.verts), 'vlakken': len(bm.faces), 'open_randen': open_randen, 'stukken': stukken, 'grootste_stukken': sorted(groot, reverse=True)[:5]}
bm.free()

# op de grond, midden op de as, op de hoogte van V4, het gezicht naar -y
hoeken = [o.matrix_world @ Vector(c) for o in delen for c in o.bound_box]
lo = Vector((min(p.x for p in hoeken), min(p.y for p in hoeken), min(p.z for p in hoeken)))
hi = Vector((max(p.x for p in hoeken), max(p.y for p in hoeken), max(p.z for p in hoeken)))
info['kader_glb'] = [[round(v, 3) for v in lo], [round(v, 3) for v in hi]]
s = float(O['schaal']) if 'schaal' in O else HOOGTE / (hi.z - lo.z)
ax, ay = (float(v) for v in O['as'].split(',')) if 'as' in O else ((lo.x + hi.x) / 2, (lo.y + hi.y) / 2)
M = Matrix.Rotation(math.radians(DRAAI), 4, 'Z') @ Matrix.Scale(s, 4) @ Matrix.Translation(Vector((-ax, -ay, -lo.z)))
as_ = bpy.data.objects.new('as', None)
sc.collection.objects.link(as_)
for o in delen:
    if o.parent is None:
        o.matrix_world = M @ o.matrix_world
        o.parent = as_
for o in delen:
    for p in o.data.polygons:
        p.use_smooth = True
    # staal van een los onderdeel is hard: vlakke facetten
    if 'echt' in kenmerken and 'metaal' in kenmerken:
        hard = (kenmerken['echt'] > 0.3) & (kenmerken['metaal'] > 0.5)
        for p in o.data.polygons:
            if all(hard[i] for i in p.vertices):
                p.use_smooth = False


def materiaal(soort):
    """De kleur en glans uit de punten; klei is dezelfde als in render.py. `model` laat de materialen van een GLB staan."""
    if soort == 'model':
        return
    if soort == 'klei':
        RD.klei(sc)
        return
    me = delen[0].data
    n = len(me.vertices)
    ca = me.color_attributes.new('kleur', 'FLOAT_COLOR', 'POINT')
    ca.data.foreach_set('color', np.concatenate([kenmerken['kleur'], np.ones((n, 1))], axis=1).astype(np.float32).ravel())
    for k in ('ruw', 'metaal', 'echt'):
        if k in kenmerken:
            a = me.attributes.new(k, 'FLOAT', 'POINT')
            a.data.foreach_set('value', kenmerken[k].astype(np.float32))
    mat = bpy.data.materials.new('hy')
    mat.use_nodes = True
    nt = mat.node_tree
    b = next(x for x in nt.nodes if x.type == 'BSDF_PRINCIPLED')
    out = next(x for x in nt.nodes if x.type == 'OUTPUT_MATERIAL')
    kl = nt.nodes.new('ShaderNodeAttribute')
    kl.attribute_name = 'kleur'
    if float(O.get('ao', 0)) > 0:
        # contactschaduw: de plooien en onder de rand iets donkerder, ook op geschilderde verf
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
        ao.inputs['Distance'].default_value = 0.06
        ao.samples = 8
        menger = nt.nodes.new('ShaderNodeMix')
        menger.data_type = 'RGBA'
        menger.blend_type = 'MULTIPLY'
        menger.inputs[0].default_value = float(O['ao'])
        nt.links.new(kl.outputs['Color'], menger.inputs[6])
        nt.links.new(ao.outputs['Color'], menger.inputs[7])
        kl = type('uit', (), {'outputs': {'Color': menger.outputs[2]}})()
    if soort == 'onverlicht':
        em = nt.nodes.new('ShaderNodeEmission')
        nt.links.new(kl.outputs['Color'], em.inputs['Color'])
        nt.links.new(em.outputs[0], out.inputs['Surface'])
    elif soort == 'verf':
        # het geschilderde licht van de plaat, gemengd met echt licht: 'echt' per punt zegt hoeveel echt (0 alleen de verf, 1 alleen echt licht, zoals de speer)
        em = nt.nodes.new('ShaderNodeEmission')
        nt.links.new(kl.outputs['Color'], em.inputs['Color'])
        nt.links.new(kl.outputs['Color'], b.inputs['Base Color'])
        for k, poort in (('ruw', 'Roughness'), ('metaal', 'Metallic')):
            x = nt.nodes.new('ShaderNodeAttribute')
            x.attribute_name = k
            nt.links.new(x.outputs['Fac'], b.inputs[poort])
        fac = nt.nodes.new('ShaderNodeAttribute')
        fac.attribute_name = 'echt'
        mix = nt.nodes.new('ShaderNodeMixShader')
        nt.links.new(fac.outputs['Fac'], mix.inputs[0])
        nt.links.new(em.outputs[0], mix.inputs[1])
        nt.links.new(b.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs['Surface'])
    else:
        nt.links.new(kl.outputs['Color'], b.inputs['Base Color'])
        b.inputs['Roughness'].default_value = 0.75
        if soort == 'pbr':
            for k, poort in (('ruw', 'Roughness'), ('metaal', 'Metallic')):
                x = nt.nodes.new('ShaderNodeAttribute')
                x.attribute_name = k
                nt.links.new(x.outputs['Fac'], b.inputs[poort])
    me.materials.clear()
    me.materials.append(mat)


materiaal(MAT)
if 'licht' in O:
    L.INST['licht'].update(json.load(open(O['licht'], encoding='utf-8')))
L.zet_op(sc, ELEVATIE, PIXELS, MONSTERS, ORTHO, DOEL_Z)
os.makedirs(UIT, exist_ok=True)
for r in RICHTINGEN:
    as_.rotation_euler = (0.0, 0.0, math.radians(L.INST['richtingen'][r]))
    if 'beelden' in O:
        me_ = delen[0].data
        hd_ = O.get('houding', 'lopen')
        for i in range(int(O['beelden'])):
            co = d['Vf'][i].copy()
            if 'speerkijkt' in ARGS and 'deel' in d.files:
                # het brede blad van de speer naar de camera, net als bij V4: hij draait om zijn eigen as, anders wordt hij in W en O een streep
                sp = d['deel'] == 3
                a_, b_ = co[sp][-2].astype(np.float64), co[sp][-1].astype(np.float64)
                as_v = (b_ - a_) / np.linalg.norm(b_ - a_)
                hk = -math.radians(L.INST['richtingen'][r])
                rel = co[sp].astype(np.float64) - a_
                co[sp] = (rel * math.cos(hk) + np.cross(as_v, rel) * math.sin(hk) + as_v[None] * (rel @ as_v)[:, None] * (1 - math.cos(hk)) + a_).astype(np.float32)
            me_.vertices.foreach_set('co', co.ravel())
            me_.update()
            sc.render.filepath = os.path.join(UIT, f'{hd_}-{r}-{i:02d}.png')
            bpy.ops.render.render(write_still=True)
        continue
    sc.render.filepath = os.path.join(UIT, f'staan-{r}-00.png')
    bpy.ops.render.render(write_still=True)
info['schaal'] = s
with open(os.path.join(UIT, 'mesh.json'), 'w', encoding='utf-8') as f:
    json.dump(info, f, indent=1)
print('MESH', json.dumps(info))
