# De basismens, stap 2: de renders. Eén orthografische camera op de elevatie uit instellingen.json, vast; de man draait
# om Z (de draai per richting staat in instellingen.json), dus elke richting komt uit hetzelfde model met dezelfde camera,
# hetzelfde licht en dezelfde schaal, en niets wordt gespiegeld. De oorsprong (tussen de voeten, op de grond) valt in elk
# beeld op hetzelfde anker.
#
# Wat er komt:
# - de acht richtingen in de rust (de A-houding) en in de idle (houdingen.idle), elk met een controle: dezelfde acht met
#   een rode band om zijn rechterbovenarm (waar valt die, en ligt hij bij zijn rechterarm of bij een gespiegelde linker);
# - de aanzichten recht van voren, achter, links en rechts (de camera horizontaal, dezelfde schaal), in rust en idle;
# - de vergelijking van de elevaties (vergelijking.elevaties): de idle in acht richtingen, op een raster van tegels om 45
#   graden zoals de wereld van het spel, en één tegel alleen om zijn verhouding te meten (op 2:1-tegels is dat 0,5);
# - de buigtest: de gewrichten gebogen, met het volume en de rek van de randen tegen de rust, over het hele lijf en per
#   gebied (kruis, heupen, oksels), en close-ups van die gebieden.
#
#   blender.exe -b <uit>/bron/basismens.blend -P gereedschap/blender/basismens/render.py
#   blender.exe -b <ander.blend> -P .../render.py -- dichtbij <map>   (alleen de close-ups en hun meting, naar <map>)
# naar <uit>/renders/, renders-idle/, controle/, controle-idle/, aanzichten/, vergelijking/e<elevatie>/, buigtest/ en
# <uit>/renders.json.
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import stand  # noqa: E402

from variant import INST, UIT, WORTEL  # noqa: E402  (de instellingen en de map van de variant)
CAM = INST['camera']
RICHTINGEN = INST['richtingen']['lijst']
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
GEBIEDEN = {k: v for k, v in INST['buigtest']['meetgebieden'].items() if not k.startswith('_')}


def scene():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'CUDA'  # OptiX compileert niet op de GTX 1080 Ti
    pr.get_devices()
    for d in pr.devices:
        d.use = d.type == 'CUDA'
    sc.cycles.device = 'GPU'
    sc.cycles.samples = CAM['samples']
    sc.cycles.use_denoising = True
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y = CAM['breed'], CAM['hoog']
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.look = 'None'
    return sc


def camera(sc, elevatie, draai=0.0, naam='camera', anker=None, doek=None):
    """Een orthografische camera die op `elevatie` graden neerkijkt, om Z gedraaid (0: hij kijkt langs +Y, de man kijkt
    hem aan), met de oorsprong op het anker en de schaal uit de instellingen; `doek` (breed, hoog, pixels per meter) voor
    een ander beeld dan dat uit de instellingen (de soldaat met zijn speer is hoger)."""
    breed, hoog, ppm = doek or (CAM['breed'], CAM['hoog'], CAM['pixels_per_meter'])
    cd = bpy.data.cameras.new(naam)
    cd.type = 'ORTHO'
    cd.sensor_fit = 'VERTICAL'
    cd.ortho_scale = hoog / ppm
    cd.clip_start, cd.clip_end = 0.1, CAM['afstand'] * 2
    cam = bpy.data.objects.new(naam, cd)
    sc.collection.objects.link(cam)
    a = math.radians(elevatie)
    kijk = Vector((0, math.cos(a), -math.sin(a)))
    op = Vector((0, math.sin(a), math.cos(a)))
    ax, ay = anker or CAM['anker']
    rechts = (ax - breed / 2) / ppm
    omhoog = (ay - hoog / 2) / ppm
    cam.matrix_world = Matrix.Rotation(math.radians(draai), 4, 'Z') @ Matrix.LocRotScale(
        op * omhoog - Vector((rechts, 0, 0)) - kijk * CAM['afstand'], Matrix.Rotation(math.pi / 2 - a, 3, 'X'), None)
    return cam


def camera_op(sc, punt, draai, schaal, naam):
    """Een horizontale orthografische camera, `schaal` meter hoog, met `punt` in het midden, van kant `draai` (graden om
    Z; 0 van voren, 90 van zijn linkerkant)."""
    cd = bpy.data.cameras.new(naam)
    cd.type = 'ORTHO'
    cd.sensor_fit = 'VERTICAL'
    cd.ortho_scale = schaal
    cd.clip_start, cd.clip_end = 0.1, CAM['afstand'] * 2
    cam = bpy.data.objects.new(naam, cd)
    sc.collection.objects.link(cam)
    R = Matrix.Rotation(math.radians(draai), 4, 'Z')
    kijk = R.to_3x3() @ Vector((0, 1, 0))
    cam.matrix_world = Matrix.Translation(punt - kijk * CAM['afstand']) @ R @ Matrix.Rotation(math.pi / 2, 4, 'X')
    return cam


def licht(sc, cam):
    """Het licht vast aan de camera: een zon van linksboven en wat van voren, zacht licht van de camera, en de lucht. Zo
    heeft elke camera (ook die van een andere elevatie) hetzelfde licht."""
    for ob in [o for o in sc.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(ob, do_unlink=True)
    L = INST['licht']
    R = cam.matrix_world.to_3x3()
    for naam, richting, sterkte, hoek, kleur in (
            ('zon', Vector(L['zon']['richting_scherm']), L['zon']['sterkte'], L['zon']['hoek'], L['zon']['kleur']),
            ('vul', Vector((0, 0, 1)), L['vul']['sterkte'], 30, (1, 1, 1))):
        ld = bpy.data.lights.new(naam, 'SUN')
        ld.energy, ld.angle, ld.color = sterkte, math.radians(hoek), kleur
        ob = bpy.data.objects.new(naam, ld)
        sc.collection.objects.link(ob)
        ob.rotation_euler = (R @ richting.normalized()).to_track_quat('Z', 'Y').to_euler()
    if sc.world is None:
        sc.world = bpy.data.worlds.new('lucht')
    bg = sc.world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = tuple(L['lucht']['kleur']) + (1,)
    bg.inputs['Strength'].default_value = L['lucht']['sterkte']


def pixel(sc, cam, p):
    q = world_to_camera_view(sc, cam, p)
    return (q.x * sc.render.resolution_x, (1 - q.y) * sc.render.resolution_y)


def gloeiend(naam, kleur, sterkte=1.0):
    m = bpy.data.materials.new(naam)
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    em = nt.nodes.new('ShaderNodeEmission')
    em.inputs['Color'].default_value = tuple(kleur) + (1,)
    em.inputs['Strength'].default_value = sterkte
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def markering(rig, straal=0.062, bot='upperarm02.R'):
    """Een rode, gloeiende band om zijn rechterbovenarm (anatomisch rechts, -X), vast aan het bot, waar de arm nu is; met
    een grotere straal om een mouw heen. `bot`: het bot van de rechterbovenarm (ronde 9: een ander skelet, HumGen3D)."""
    pb = rig.pose.bones[bot]
    midden = rig.matrix_world @ ((pb.head + pb.tail) / 2)
    as_ = (rig.matrix_world.to_3x3() @ (pb.tail - pb.head)).normalized()
    bpy.ops.mesh.primitive_torus_add(major_radius=straal, minor_radius=0.014, major_segments=32, minor_segments=8,
                                     location=midden, rotation=as_.to_track_quat('Z', 'Y').to_euler())
    ob = bpy.context.active_object
    ob.name = 'markering'
    ob.data.materials.append(gloeiend('markering', (1, 0, 0), 4))
    mw = ob.matrix_world.copy()
    ob.parent = rig
    ob.parent_type = 'BONE'
    ob.parent_bone = bot
    ob.matrix_world = mw
    return ob


def lees_png(pad):
    img = bpy.data.images.load(pad, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)[::-1]


def rood(pad):
    """Het midden van de rode pixels in een render (en hoeveel er zijn), in pixels van linksboven."""
    px = lees_png(pad)
    m = (px[:, :, 0] > 0.75) & (px[:, :, 1] < 0.3) & (px[:, :, 2] < 0.3) & (px[:, :, 3] > 0.5)
    ys, xs = np.nonzero(m)
    return (float(xs.mean()), float(ys.mean()), int(m.sum())) if len(xs) else (None, None, 0)


def render(sc, pad):
    os.makedirs(os.path.dirname(pad), exist_ok=True)
    sc.render.filepath = pad
    bpy.ops.render.render(write_still=True)


def richtingen(sc, cam, rig, map_, controle=None, band=0.062, botten=('head', 'upperarm02.R')):
    """De acht richtingen in de stand van nu naar <map_>/richting-<r>.png; met `controle` ook dezelfde acht met de rode
    band (met straal `band`) naar <controle>/markering-<r>.png, en waar die band ligt. `botten`: het hoofd en de
    rechterbovenarm (ronde 9: een ander skelet)."""
    hoofd = rig.pose.bones[botten[0]]
    uit = []
    for r in RICHTINGEN:
        rig.rotation_euler = (0, 0, math.radians(r['draai']))
        bpy.context.view_layer.update()
        pad = os.path.join(UIT, map_, f"richting-{r['naam']}.png")
        render(sc, pad)
        H = rig.matrix_world @ hoofd.head
        V = H + rig.matrix_world.to_3x3() @ Vector((0, -0.25, 0))  # 25 cm voor zijn gezicht
        a, b = pixel(sc, cam, H), pixel(sc, cam, V)
        hoek = math.degrees(math.atan2(-(b[1] - a[1]), b[0] - a[0]))  # op het scherm: 0 rechts, 90 omhoog
        uit.append({'naam': r['naam'], 'draai': r['draai'], 'bestand': os.path.relpath(pad, UIT),
                    'camera': [list(row) for row in cam.matrix_world],
                    'kijkt_scherm': round(hoek, 1), 'verwacht_scherm': r['scherm']})
    if controle:
        band = markering(rig, band, botten[1])
        monsters = sc.cycles.samples
        sc.cycles.samples = 16
        for r, v in zip(RICHTINGEN, uit):
            rig.rotation_euler = (0, 0, math.radians(r['draai']))
            bpy.context.view_layer.update()
            pad = os.path.join(UIT, controle, f"markering-{r['naam']}.png")
            render(sc, pad)
            rechts = band.matrix_world.translation.copy()
            gespiegeld = rig.matrix_world @ (Matrix.Diagonal((-1, 1, 1, 1)) @ (rig.matrix_world.inverted() @ rechts))
            x, y, n = rood(pad)
            v['markering'] = {'verwacht': [round(c, 1) for c in pixel(sc, cam, rechts)],
                              'gespiegeld': [round(c, 1) for c in pixel(sc, cam, gespiegeld)],
                              'gevonden': [round(x, 1), round(y, 1)] if n else None, 'pixels': n}
        bpy.data.objects.remove(band, do_unlink=True)
        sc.cycles.samples = monsters
    rig.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    return uit


def aanzichten(sc, voorvoegsel=''):
    monsters = sc.cycles.samples
    sc.cycles.samples = 32
    vorige = sc.camera
    for kant, draai in (('voor', 0), ('achter', 180), ('links', 90), ('rechts', -90)):
        c = camera(sc, 0.0, draai, 'aanzicht-' + kant, CAM['anker_aanzicht'])
        sc.camera = c
        licht(sc, c)
        render(sc, os.path.join(UIT, 'aanzichten', f'{voorvoegsel}{kant}.png'))
    sc.camera = vorige
    licht(sc, vorige)
    sc.cycles.samples = monsters


def tegels(zijde, n, hoogte=-0.0005):
    """Een raster van n bij n vierkante tegels (zijde in meters) op de grond, om 45 graden gedraaid zoals de wereld van het
    spel, de middelste tegel onder de oorsprong; om en om twee tinten, gloeiend (geen licht of schaduw)."""
    vs, fs, idx = [], [], []
    h = n // 2
    for i in range(-h, n - h):
        for j in range(-h, n - h):
            b = len(vs)
            for dx, dy in ((-0.5, -0.5), (0.5, -0.5), (0.5, 0.5), (-0.5, 0.5)):
                vs.append(((i + dx) * zijde, (j + dy) * zijde, hoogte))
            fs.append((b, b + 1, b + 2, b + 3))
            idx.append((i + j) % 2)
    me = bpy.data.meshes.new('tegels')
    me.from_pydata(vs, [], fs)
    me.materials.append(gloeiend('tegel-licht', (0.42, 0.46, 0.34)))
    me.materials.append(gloeiend('tegel-donker', (0.33, 0.37, 0.27)))
    for p, k in zip(me.polygons, idx):
        p.material_index = k
    ob = bpy.data.objects.new('tegels', me)
    bpy.context.scene.collection.objects.link(ob)
    ob.rotation_euler = (0, 0, math.radians(45))
    return ob


def vak(pad):
    """De rand om wat niet doorzichtig is: (breed, hoog) in pixels."""
    a = lees_png(pad)[:, :, 3] > 0.5
    ys, xs = np.nonzero(a)
    return int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)


def rust_meting(lijf):
    deps = bpy.context.evaluated_depsgraph_get()
    e = lijf.evaluated_get(deps)
    me = e.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    vol = bm.calc_volume()
    lengte = np.array([(ed.verts[0].co - ed.verts[1].co).length for ed in bm.edges])
    midden = np.array([tuple((ed.verts[0].co + ed.verts[1].co) / 2) for ed in bm.edges])
    bm.free()
    e.to_mesh_clear()
    return vol, lengte, midden


def meting(lijf, rust, rig):
    """Het volume en de rek van de randen zoals het lijf nu staat, tegen de rust: over alles, en per gebied (de randen
    die in rust binnen de straal van het gebied lagen)."""
    deps = bpy.context.evaluated_depsgraph_get()
    e = lijf.evaluated_get(deps)
    me = e.to_mesh()
    bm = bmesh.new()
    bm.from_mesh(me)
    vol = bm.calc_volume()
    nu = np.array([(ed.verts[0].co - ed.verts[1].co).length for ed in bm.edges])
    bm.free()
    e.to_mesh_clear()
    rek = nu / np.maximum(rust[1], 1e-9)
    grens, grens2 = INST['buigtest']['rek_grens'], INST['buigtest']['gebieden_rek']
    uit = {'volume': round(vol / rust[0], 4), 'rek_max': round(float(rek.max()), 3), 'rek_min': round(float(rek.min()), 3),
           'rek_boven_grens': round(float((rek > grens).mean()), 6),
           'rek_plek': [round(float(c), 3) for c in rust[2][int(rek.argmax())]], 'gebieden': {}}
    for naam, straal in GEBIEDEN.items():
        p = np.array(stand.gebied(rig, naam)[:])
        m = np.linalg.norm(rust[2] - p, axis=1) < straal
        if m.any():
            r = rek[m]
            uit['gebieden'][naam] = {'rek_max': round(float(r.max()), 3), 'rek_p99': round(float(np.percentile(r, 99)), 3),
                                     'boven_2': round(float((r > grens2).mean()), 5), 'randen': int(m.sum())}
    return uit


def dichtbij(sc, rig, lijf, map_):
    """De close-ups van de standen waar de huid het meest rekt (buigtest.dichtbij), met hun meting."""
    standen, D = INST['buigtest']['standen'], INST['buigtest']['dichtbij']
    stand.rust(rig)
    rust = rust_meting(lijf)
    oud = (sc.render.resolution_x, sc.render.resolution_y, sc.camera)
    sc.render.resolution_x = sc.render.resolution_y = 384
    uit = {}
    for naam, waarde in D.items():
        if naam.startswith('_'):
            continue
        gebied, draai = waarde
        punt = rig.matrix_world @ stand.gebied(rig, gebied)
        c = camera_op(sc, punt, draai, 0.6, 'dichtbij-' + naam)
        sc.camera = c
        licht(sc, c)
        stand.zet(rig, standen[naam])
        uit[naam] = {'gebied': gebied, 'meting': meting(lijf, rust, rig)['gebieden'].get(gebied)}
        render(sc, os.path.join(map_, f'dichtbij-{naam}.png'))
        stand.rust(rig)
    sc.render.resolution_x, sc.render.resolution_y, sc.camera = oud
    if sc.camera:
        licht(sc, sc.camera)
    return uit


def maten(rig, lijf):
    """Waar de handen en de voeten staan (de man naar -Y, niet gedraaid), en zijn laagste punt."""
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    T = lambda b: rig.matrix_world @ rig.pose.bones[b].tail
    pols = {k: [round(c, 3) for c in W(f'wrist.{k}')] for k in 'LR'}
    enkel = {k: [round(c, 3) for c in T(f'lowerleg02.{k}')] for k in 'LR'}
    return {'polsen': pols, 'enkels': enkel, 'voeten_uit_elkaar': round(enkel['L'][0] - enkel['R'][0], 3),
            'laagste_punt': round(stand.laagste(lijf), 4)}


def main():
    sc = scene()
    rig = bpy.data.objects['skelet']
    lijf = bpy.data.objects['lijf']
    rig.data.pose_position = 'POSE'
    rig.rotation_euler = (0, 0, 0)
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    stand.rust(rig)
    if ARGS and ARGS[0] == 'dichtbij':
        map_ = os.path.abspath(ARGS[1])
        uit = dichtbij(sc, rig, lijf, map_)
        json.dump(uit, open(os.path.join(map_, 'dichtbij.json'), 'w', encoding='utf-8'), indent=1)
        print('DICHTBIJ', json.dumps(uit))
        return
    cam = camera(sc, CAM['elevatie'])
    sc.camera = cam
    licht(sc, cam)
    bpy.context.view_layer.update()
    verslag = {'camera': {'elevatie': CAM['elevatie'], 'type': cam.data.type, 'ortho_schaal': cam.data.ortho_scale,
                          'breed': sc.render.resolution_x, 'hoog': sc.render.resolution_y,
                          'anker': list(pixel(sc, cam, Vector((0, 0, 0))))}}
    # de rust (de A-houding): de acht richtingen met de controle, en de aanzichten
    verslag['richtingen'] = richtingen(sc, cam, rig, 'renders', 'controle')
    aanzichten(sc)
    # de idle: dezelfde acht, de aanzichten, en waar handen en voeten staan
    stand.zet(rig, INST['houdingen']['idle'])
    grond = stand.op_de_grond(rig, lijf)
    verslag['idle'] = {'grond_verschoven': round(-grond, 4), 'maten': maten(rig, lijf),
                       'richtingen': richtingen(sc, cam, rig, 'renders-idle', 'controle-idle')}
    aanzichten(sc, 'idle-')
    # de vergelijking van de elevaties, in de idle, met hetzelfde licht (vast aan elke camera) en dezelfde schaal
    V = INST['vergelijking']
    verslag['vergelijking'] = {}
    for e in V['elevaties']:
        c = camera(sc, e, naam=f'e{e:g}')
        sc.camera = c
        licht(sc, c)
        map_ = os.path.join('vergelijking', f'e{e:g}')
        richtingen(sc, c, rig, map_)
        raster = tegels(V['tegel_zijde'], 9)
        for r in RICHTINGEN[:3]:
            rig.rotation_euler = (0, 0, math.radians(r['draai']))
            bpy.context.view_layer.update()
            render(sc, os.path.join(UIT, map_, f"op-tegels-{r['naam']}.png"))
        rig.rotation_euler = (0, 0, 0)
        bpy.data.objects.remove(raster, do_unlink=True)
        # één tegel alleen, de man weg: hoe hoog is hij tegen hoe breed
        # (ook de curven: anders telden de wenkbrauwen van HumGen, ronde 11, mee als tegel)
        verborgen = [o for o in sc.objects if o.type in ('MESH', 'CURVES') and not o.hide_render]
        for o in verborgen:
            o.hide_render = True
        een = tegels(V['tegel_zijde'], 1, 0.5)  # 50 cm hoger, helemaal in beeld; vlak blijft hij even scheef
        pad = os.path.join(UIT, map_, 'tegel.png')
        render(sc, pad)
        b, h = vak(pad)
        bpy.data.objects.remove(een, do_unlink=True)
        for o in verborgen:
            o.hide_render = False
        verslag['vergelijking'][f'{e:g}'] = {'tegel_breed': b, 'tegel_hoog': h, 'verhouding': round(h / b, 4),
                                            'sin_elevatie': round(math.sin(math.radians(e)), 4),
                                            'man_hoog_Z': vak(os.path.join(UIT, map_, 'richting-Z.png'))[1]}
    sc.camera = cam
    licht(sc, cam)
    # de buigtest (vanuit de rust), naar Z, met de meting over alles en per gebied, en de close-ups
    stand.rust(rig)
    rust = rust_meting(lijf)
    verslag['buigtest'] = {}
    for naam, s in INST['buigtest']['standen'].items():
        if naam.startswith('_'):
            continue
        stand.zet(rig, s)
        verslag['buigtest'][naam] = meting(lijf, rust, rig)
        render(sc, os.path.join(UIT, 'buigtest', f'{naam}.png'))
        stand.rust(rig)
    verslag['dichtbij'] = dichtbij(sc, rig, lijf, os.path.join(UIT, 'buigtest'))
    json.dump(verslag, open(os.path.join(UIT, 'renders.json'), 'w', encoding='utf-8'), indent=1)
    print('RENDER', json.dumps({r['naam']: r['kijkt_scherm'] for r in verslag['richtingen']}))
    print('IDLE', json.dumps(verslag['idle']['maten']))
    print('VERGELIJKING', json.dumps(verslag['vergelijking']))
    print('BUIGTEST', json.dumps({k: (v['volume'], v['rek_max'], v['gebieden']) for k, v in verslag['buigtest'].items()}))


if __name__ == '__main__':  # soldaat.py leent de stukken
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
