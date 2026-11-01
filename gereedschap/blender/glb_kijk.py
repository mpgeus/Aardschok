# Een 3D-model (GLB, bijvoorbeeld uit ComfyUI) gerenderd zoals de plaat van GPT, om het naast de plaat en de kopie te
# leggen (vraag 190; Marcel, 27 okt, bij de kopie: "mag ik je deze ook even geven"). Het model op de grond en in het midden,
# even hoog als de man op de plaat, met de camera, het licht en de richtingen van kopie_hd.py.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P gereedschap/blender/glb_kijk.py -- <model.glb> <map> [draai=<graden>]
# naar <map>/kopie-<richting>.png, zodat kopie_vergelijk.py hem net zo op de plaat legt; draai= zet het model eerst om
# zijn staande as (als het niet met zijn gezicht naar -y staat).
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

ARGS = sys.argv[sys.argv.index('--') + 1:]
MODEL, UIT = ARGS[0], os.path.abspath(ARGS[1])
DRAAI = next((float(a.split('=')[1]) for a in ARGS[2:] if a.startswith('draai=')), 0.0)
RICHTINGEN = {'Z': 0, 'ZW': 45, 'W': 90, 'N': 180}
PLAAT = {'hoogte': 879, 'zolen': 951}
RES = (440, 1024)

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=MODEL)
delen = [o for o in sc.objects if o.type == 'MESH']
print('GLB delen', len(delen), 'punten', sum(len(o.data.vertices) for o in delen), 'vlakken', sum(len(o.data.polygons) for o in delen))
for o in delen:
    print('  ', o.name, len(o.data.vertices), [m.name for m in o.data.materials])
for img in bpy.data.images:
    print('  beeld', img.name, tuple(img.size))

# alles in één stelsel: de wereld, gedraaid, op de grond en in het midden
bpy.context.view_layer.update()
hoeken = [o.matrix_world @ Vector(c) for o in delen for c in o.bound_box]
lo = Vector((min(p.x for p in hoeken), min(p.y for p in hoeken), min(p.z for p in hoeken)))
hi = Vector((max(p.x for p in hoeken), max(p.y for p in hoeken), max(p.z for p in hoeken)))
print('GLB kader', tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))
# rechtop: het model uit een plaat van schuin boven staat scheef (het helt naar de camera van de plaat); de lange as van
# de punten (de eerste hoofdas) wordt de staande as
import numpy as np
mw = delen[0].matrix_world
co = np.empty(len(delen[0].data.vertices) * 3)
delen[0].data.vertices.foreach_get('co', co)
pts = np.array([tuple(mw @ Vector(p)) for p in co.reshape(-1, 3)[::7]])
c = pts.mean(axis=0)
waarden, vectoren = np.linalg.eigh(np.cov((pts - c).T))
as_ = Vector(vectoren[:, -1])
if as_.z < 0:
    as_ = -as_
helling = math.degrees(as_.angle(Vector((0, 0, 1))))
print('GLB lange as', tuple(round(v, 3) for v in as_), 'helt', round(helling, 1), 'graden')
R = as_.rotation_difference(Vector((0, 0, 1))).to_matrix().to_4x4() if 'scheef' not in ARGS else Matrix.Identity(4)
for o in delen:
    if o.parent is None:
        o.matrix_world = R @ o.matrix_world
bpy.context.view_layer.update()
hoeken = [o.matrix_world @ Vector(c) for o in delen for c in o.bound_box]
lo = Vector((min(p.x for p in hoeken), min(p.y for p in hoeken), min(p.z for p in hoeken)))
hi = Vector((max(p.x for p in hoeken), max(p.y for p in hoeken), max(p.z for p in hoeken)))
print('GLB rechtop', tuple(round(v, 3) for v in lo), tuple(round(v, 3) for v in hi))
midden = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
M = Matrix.Rotation(math.radians(DRAAI), 4, 'Z') @ Matrix.Translation(-midden)
for o in delen:
    if o.parent is None:
        o.matrix_world = M @ o.matrix_world
bpy.context.view_layer.update()
hoogte = max((o.matrix_world @ Vector(c)).z for o in delen for c in o.bound_box)

sc.render.engine = 'CYCLES'
pr = bpy.context.preferences.addons['cycles'].preferences
pr.compute_device_type = 'CUDA'
pr.get_devices()
for d in pr.devices:
    d.use = d.type == 'CUDA'
sc.cycles.device = 'GPU'
sc.cycles.samples = 48
sc.cycles.use_denoising = True
sc.render.film_transparent = True
sc.render.resolution_x, sc.render.resolution_y = RES
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGBA'
sc.view_settings.view_transform = 'Standard'
pxm = PLAAT['hoogte'] / hoogte
cd = bpy.data.cameras.new('camera')
cd.type = 'ORTHO'
cd.sensor_fit = 'VERTICAL'
cd.ortho_scale = RES[1] / pxm
cam = bpy.data.objects.new('camera', cd)
sc.collection.objects.link(cam)
cam.rotation_euler = (math.pi / 2, 0, 0)
cam.location = (0, -20, (PLAAT['zolen'] - RES[1] / 2) / pxm)
sc.camera = cam
# hetzelfde licht als kopie_hd.py: een zon van linksvoor en boven, licht van voren, en de lucht
lichten = []
for naam, r, e, hoek in (('zon', (-0.55, -0.75, 0.6), 4.0, 20), ('vul', (0.1, -1, 0.35), 0.5, 20)):
    ld = bpy.data.lights.new(naam, 'SUN')
    ld.energy, ld.angle = e, math.radians(hoek)
    ob = bpy.data.objects.new(naam, ld)
    sc.collection.objects.link(ob)
    ob.rotation_euler = Vector(r).normalized().to_track_quat('Z', 'Y').to_euler()
    lichten.append(ob)
w = bpy.data.worlds.new('lucht')
sc.world = w
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.78, 0.79, 0.82, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.55
bpy.context.view_layer.update()
print('GLB hoogte', round(hoogte, 3), 'pxm', round(pxm, 1))
os.makedirs(UIT, exist_ok=True)
m0, ml = cam.matrix_world.copy(), [o.matrix_world.copy() for o in lichten]
for r, graden in RICHTINGEN.items():
    R = Matrix.Rotation(math.radians(graden), 4, 'Z')
    cam.matrix_world = R @ m0
    for o, m in zip(lichten, ml):
        o.matrix_world = R @ m
    sc.render.filepath = os.path.join(UIT, f'kopie-{r}.png')
    bpy.ops.render.render(write_still=True)

# het profiel van de helm en het hoofd (`profiel` op de opdrachtregel): per plak van 1 procent van de lengte, vanaf de top,
# hoe ver het model reikt naar zijn linkerkant (+x, weg van de speer), naar voren (-y) en naar achteren (+y), als deel van
# de lengte; de lengte van de zolen van zijn linkervoet tot de top van de helm
if 'profiel' in ARGS:
    mw = delen[0].matrix_world
    co = np.empty(len(delen[0].data.vertices) * 3)
    delen[0].data.vertices.foreach_get('co', co)
    P = np.array([tuple(mw @ Vector(p)) for p in co.reshape(-1, 3)])
    hoofd = P[(np.abs(P[:, 0]) < 0.12) & (np.abs(P[:, 1]) < 0.15)]
    top = hoofd[:, 2].max()
    kolom = hoofd[hoofd[:, 2] > top - 0.05]
    cx, cy = kolom[:, 0].mean(), kolom[:, 1].mean()
    links = P[P[:, 0] > cx + 0.02]
    zool = links[:, 2].min()
    L = top - zool
    print(f'PROFIEL lengte {L:.3f} midden ({cx:.3f}, {cy:.3f})')
    for i in range(0, 30):
        z1, z0 = top - L * i / 100, top - L * (i + 1) / 100
        plak = P[(P[:, 2] <= z1) & (P[:, 2] > z0) & (np.abs(P[:, 1] - cy) < 0.3)]
        lk = plak[plak[:, 0] > cx]
        if not len(lk):
            continue
        print(f'PROFIEL {100 - i:3d}%  links {(lk[:, 0].max() - cx) / L:.3f}  voor {(cy - plak[:, 1].min()) / L:.3f}  achter {(plak[:, 1].max() - cy) / L:.3f}')
