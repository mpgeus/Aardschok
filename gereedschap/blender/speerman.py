# De speerman van het dorp als 3D-model in Blender (vraag 190; ontwerp/beeld.md, "Blender als basis?"). Een proef: kan
# een model dat Claude in Blender maakt, de basis zijn voor de poppetjes? Gemaakt naar de plaat van de generator
# (gereedschap/pixelart/bron/soldaten/speerman-staan.webp): gedrongen, ketelhoed, maliënkraag, gewatteerde mouwen, een
# wapenrok in blauw en geel (rechts blauw, links geel, van hemzelf gezien), riem met tas, laarzen en een speer.
#
# Het model staat in de houding van staan; een skelet met een huid laat het lopen. De wereld is in meters, z omhoog, de
# man kijkt in rust naar -y. De camera is die van het spel (kern.cjs): recht, 30 graden naar beneden, vanuit +x+y.
# Blender rendert vier keer zo groot als het spel, met een doorzichtige achtergrond; proef.cjs maakt er de plaat van.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P gereedschap/blender/speerman.py -- [staan|lopen|alles] [uit-map]
import bpy
import bmesh
import json
import math
import os
import sys
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view

HIER = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
WAT = ARGS[0] if ARGS else 'alles'
STIJL = ARGS[2] if len(ARGS) > 2 else 'toon'
UIT = os.path.abspath(ARGS[1] if len(ARGS) > 1 else os.path.join(HIER, '..', 'pixelart', 'uit', 'blender', 'render'))

# ---------------------------------------------------------------- de getallen

INSTELLINGEN = {
    'pxm': 48 * 4,          # pixels per meter in de render, dwars op de kijkrichting (vier keer het spel)
    'res': (360, 560),      # de render, in pixels
    'anker_y': 500,         # waar de oorsprong (tussen de voeten) in de render staat, van boven
    'samples': 64,
    'zon': 4.8, 'zonkleur': (1.0, 0.90, 0.76), 'zonhoek': 4.0,
    'rand': 1.4, 'randkleur': (0.80, 0.88, 1.0),
    'lucht': 0.65, 'luchtkleur': (0.48, 0.56, 0.72),
    'breed': 1.35,          # gedrongen: de man breder dan echt, zoals op de plaat van de generator
    'lijn': 4.6,            # de dikte van de lijnen (Freestyle) in de render: na het verkleinen zo'n driekwart pixel
    'beelden': 8,           # lopen
    # toon: EEVEE, het licht in vaste banden zoals een pixeltekenaar het zet; echt: Cycles, het licht doorgerekend
    'banden': [(0.0, (0.40, 0.43, 0.58)), (0.40, (0.70, 0.70, 0.74)), (0.72, (1.0, 0.97, 0.90)), (1.12, (1.13, 1.09, 1.0))],
    'camera': 15,           # graden boven de grond; de wereld staat op 30, maar de generator tekent de poppetjes vlakker
}

# De richtingen van het spel (Z kijkt naar ons toe), als draaiing van de man om z vanuit zijn rust (kijkt naar -y).
RICHTINGEN = {'Z': 135, 'ZW': 90, 'W': 45, 'NW': 0, 'N': -45, 'NO': -90, 'O': -135, 'ZO': 180}

# Het licht: linksvoor en hoog, vaster aan de kijker dan in kern.cjs (daar 0,599 -0,301 0,740 in deze assen): de generator
# belicht zijn poppetjes meer van voren, en zo blijft een gezicht onder de helm leesbaar. Het randlicht is dat van kern.cjs.
LICHT = Vector((0.827, 0.049, 0.56)).normalized()
RANDLICHT = Vector((-0.850, 0.150, 0.501)).normalized()


def lin(hexkleur):
    h = hexkleur.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


# ---------------------------------------------------------------- de scène

def leeg():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    if STIJL == 'toon':
        for motor in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT'):
            try:
                sc.render.engine = motor
                break
            except TypeError:
                pass
        sc.eevee.taa_render_samples = 16
        sc.render.filter_size = 1.0
    pr = bpy.context.preferences.addons['cycles'].preferences
    for soort in ('CUDA',):  # OptiX compileert niet op de GTX 1080 Ti (Pascal) in Blender 5.2
        try:
            pr.compute_device_type = soort
            pr.get_devices()
            if any(d.type == soort for d in pr.devices):
                for d in pr.devices:
                    d.use = d.type == soort
                sc.cycles.device = 'GPU'
                break
        except Exception:
            pass
    sc.cycles.samples = INSTELLINGEN['samples']
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.filter_width = 1.0
    sc.render.film_transparent = True
    # Lijnen om elk deel (het silhouet, waar delen elkaar overlappen, en tussen materialen), zoals een tekenaar ze zet.
    sc.render.use_freestyle = True
    sc.render.line_thickness_mode = 'ABSOLUTE'
    fs = sc.view_layers[0].freestyle_settings
    ls = fs.linesets[0] if len(fs.linesets) else fs.linesets.new('lijnen')
    ls.select_by_visibility = True
    ls.visibility = 'VISIBLE'
    ls.select_by_edge_types = True
    for t in ('select_silhouette', 'select_border', 'select_material_boundary', 'select_external_contour', 'select_contour'):
        setattr(ls, t, True)
    ls.select_crease = False
    if not ls.linestyle:
        ls.linestyle = bpy.data.linestyles.new('lijn')
    ls.linestyle.color = (0.06, 0.04, 0.03)
    ls.linestyle.thickness = INSTELLINGEN['lijn']
    ls.linestyle.alpha = 0.9
    sc.render.resolution_x, sc.render.resolution_y = INSTELLINGEN['res']
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    try:
        sc.view_settings.view_transform = 'Standard'
        sc.view_settings.look = 'None'
    except Exception:
        pass
    return sc


def camera(sc):
    cd = bpy.data.cameras.new('camera')
    cd.type = 'ORTHO'
    cd.sensor_fit = 'VERTICAL'
    b, h = INSTELLINGEN['res']
    cd.ortho_scale = h / INSTELLINGEN['pxm']
    cam = bpy.data.objects.new('camera', cd)
    sc.collection.objects.link(cam)
    a = math.radians(INSTELLINGEN['camera'])
    cam.rotation_euler = (math.pi / 2 - a, 0, math.radians(135))
    kijk = Vector((-math.sqrt(0.5) * math.cos(a), -math.sqrt(0.5) * math.cos(a), -math.sin(a)))
    op = Vector((-math.sin(a) * math.sqrt(0.5), -math.sin(a) * math.sqrt(0.5), math.cos(a)))
    midden = op * ((INSTELLINGEN['anker_y'] - h / 2) / INSTELLINGEN['pxm'])
    cam.location = midden - kijk * 20
    cd.clip_end = 60
    sc.camera = cam
    return cam


def licht(sc):
    def zon(naam, richting, sterkte, kleur, hoek):
        ld = bpy.data.lights.new(naam, 'SUN')
        ld.energy = sterkte
        ld.color = kleur
        ld.angle = math.radians(hoek)
        ob = bpy.data.objects.new(naam, ld)
        sc.collection.objects.link(ob)
        ob.rotation_euler = richting.to_track_quat('Z', 'Y').to_euler()
        return ob
    zon('zon', LICHT, math.pi if STIJL == 'toon' else INSTELLINGEN['zon'], INSTELLINGEN['zonkleur'], INSTELLINGEN['zonhoek'])
    zon('rand', RANDLICHT, INSTELLINGEN['rand'], INSTELLINGEN['randkleur'], 10)
    w = bpy.data.worlds.new('lucht')
    sc.world = w
    try:
        w.use_nodes = True
    except Exception:
        pass
    ach = w.node_tree.nodes.get('Background')
    ach.inputs['Color'].default_value = INSTELLINGEN['luchtkleur'] + (1.0,)
    ach.inputs['Strength'].default_value = INSTELLINGEN['lucht']
    # De grond kaatst warm licht terug, maar de camera ziet haar niet (het spel tekent zijn eigen grond).
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
    g = bpy.context.active_object
    g.name = 'grond'
    g.data.materials.append(materiaal('grond', '#6b6440', ruw=1.0)[0])
    g.visible_camera = False
    g.visible_shadow = False
    kol = bpy.data.collections.new('grond')
    sc.collection.children.link(kol)
    kol.objects.link(g)
    sc.collection.objects.unlink(g)
    ls = sc.view_layers[0].freestyle_settings.linesets[0]
    ls.select_by_collection = True
    ls.collection = kol
    ls.collection_negation = 'EXCLUSIVE'


# ---------------------------------------------------------------- de materialen

def W(nt, op, *ins):
    n = nt.nodes.new('ShaderNodeMath')
    n.operation = op
    for i, x in enumerate(ins):
        if isinstance(x, (int, float)):
            n.inputs[i].default_value = x
        else:
            nt.links.new(x, n.inputs[i])
    return n.outputs[0]


def glad(nt, x, lo, hi, a=0.0, b=1.0):
    n = nt.nodes.new('ShaderNodeMapRange')
    n.interpolation_type = 'SMOOTHSTEP'
    nt.links.new(x, n.inputs['Value'])
    n.inputs['From Min'].default_value = lo
    n.inputs['From Max'].default_value = hi
    n.inputs['To Min'].default_value = a
    n.inputs['To Max'].default_value = b
    return n.outputs['Result']


def meng(nt, f, a, b):
    n = nt.nodes.new('ShaderNodeMix')
    n.data_type = 'RGBA'
    kl = [s for s in n.inputs if s.type == 'RGBA']
    for sok, x in zip(kl, (a, b)):
        if isinstance(x, tuple):
            sok.default_value = x
        else:
            nt.links.new(x, sok)
    if isinstance(f, (int, float)):
        n.inputs[0].default_value = f
    else:
        nt.links.new(f, n.inputs[0])
    return [s for s in n.outputs if s.type == 'RGBA'][0]


def rust(nt):
    # De plek van elk punt in rust (een attribuut van de mesh): de patronen bewegen mee met het lijf.
    a = nt.nodes.new('ShaderNodeAttribute')
    a.attribute_type = 'GEOMETRY'
    a.attribute_name = 'rust'
    s = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(a.outputs['Vector'], s.inputs[0])
    return a.outputs['Vector'], s.outputs['X'], s.outputs['Y'], s.outputs['Z']


def groef(nt, u, breed):
    f = W(nt, 'FRACT', u)
    f = W(nt, 'ABSOLUTE', W(nt, 'SUBTRACT', f, 0.5))
    return glad(nt, W(nt, 'MULTIPLY', f, 2.0), 1 - breed, 1.0)


def ruis(nt, vec, schaal, detail=2.0):
    n = nt.nodes.new('ShaderNodeTexNoise')
    n.noise_dimensions = '3D'
    nt.links.new(vec, n.inputs['Vector'])
    n.inputs['Scale'].default_value = schaal
    n.inputs['Detail'].default_value = detail
    return n.outputs['Fac']


def materiaal(naam, kleur, ruw=0.75, metaal=0.0, patroon=None, kleur2=None, bol=0.15, holte=0.45):
    """Een materiaal: een kleur (of twee, gesplitst op x), een patroon in de plek in rust, en het geschilderde licht:
    holtes donkerder (AO), bolle randen lichter (pointiness)."""
    m = bpy.data.materials.new(naam)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    uit = nt.nodes.new('ShaderNodeOutputMaterial')
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bsdf.outputs['BSDF'], uit.inputs['Surface'])
    bsdf.inputs['Roughness'].default_value = ruw
    bsdf.inputs['Metallic'].default_value = metaal
    if naam == 'grond':
        bsdf.inputs['Base Color'].default_value = lin(kleur)
        return m, nt
    vec, x, y, z = rust(nt)
    kl = lin(kleur)
    if kleur2:
        # gevierendeeld: de tweede kleur rechtsboven en linksonder (van hemzelf gezien), de riem is de grens
        rechts = glad(nt, x, 0.004, -0.004)
        boven = glad(nt, z, 0.92, 0.93)
        kl = meng(nt, W(nt, 'ABSOLUTE', W(nt, 'SUBTRACT', rechts, W(nt, 'SUBTRACT', 1.0, boven))), lin(kleur), lin(kleur2))
    hoogte = None
    if patroon == 'wambuis':
        # gewatteerd: ruiten van vijf centimeter, de naden donker en diep
        u = W(nt, 'DIVIDE', W(nt, 'ADD', z, W(nt, 'ADD', W(nt, 'MULTIPLY', x, 0.8), W(nt, 'MULTIPLY', y, -0.6))), 0.05)
        v = W(nt, 'DIVIDE', W(nt, 'SUBTRACT', z, W(nt, 'ADD', W(nt, 'MULTIPLY', x, 0.8), W(nt, 'MULTIPLY', y, -0.6))), 0.05)
        naad = W(nt, 'MAXIMUM', groef(nt, u, 0.22), groef(nt, v, 0.22))
        kl = meng(nt, W(nt, 'MULTIPLY', naad, 0.75), kl, lin('#3a2210'))
        hoogte = W(nt, 'MULTIPLY', naad, -1.0)
    elif patroon == 'malien':
        n = nt.nodes.new('ShaderNodeTexVoronoi')
        nt.links.new(vec, n.inputs['Vector'])
        n.inputs['Scale'].default_value = 55
        ring = glad(nt, n.outputs['Distance'], 0.18, 0.42)
        kl = meng(nt, W(nt, 'MULTIPLY', ring, 0.8), kl, lin('#2e3036'))
        hoogte = W(nt, 'MULTIPLY', ring, -1.0)
    elif patroon == 'stof':
        r = ruis(nt, vec, 40, 3)
        kl = meng(nt, W(nt, 'MULTIPLY', glad(nt, r, 0.35, 0.65), 0.18), kl, (0, 0, 0, 1))
        hoogte = W(nt, 'MULTIPLY', r, 0.3)
    elif patroon == 'leer':
        r = ruis(nt, vec, 25, 4)
        kl = meng(nt, W(nt, 'MULTIPLY', glad(nt, r, 0.3, 0.7), 0.35), kl, lin('#2a160a'))
        hoogte = W(nt, 'MULTIPLY', r, 0.2)
    elif patroon == 'baard':
        sv = nt.nodes.new('ShaderNodeVectorMath')
        sv.operation = 'MULTIPLY'
        nt.links.new(vec, sv.inputs[0])
        sv.inputs[1].default_value = (90, 90, 14)
        r = ruis(nt, sv.outputs[0], 1.0, 3)
        kl = meng(nt, glad(nt, r, 0.3, 0.7), lin('#22140b'), lin('#5a3a22'))
        hoogte = r
    elif patroon == 'hout':
        sv = nt.nodes.new('ShaderNodeVectorMath')
        sv.operation = 'MULTIPLY'
        nt.links.new(vec, sv.inputs[0])
        sv.inputs[1].default_value = (160, 160, 6)
        r = ruis(nt, sv.outputs[0], 1.0, 2)
        kl = meng(nt, W(nt, 'MULTIPLY', glad(nt, r, 0.3, 0.7), 0.4), kl, lin('#3a1e0c'))
    if hoogte is not None:
        bump = nt.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = 0.6
        bump.inputs['Distance'].default_value = 0.004
        nt.links.new(hoogte, bump.inputs['Height'])
        nt.links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    if STIJL == 'toon':
        nt.nodes.remove(bsdf)
        toon(nt, uit, kl, bump.outputs['Normal'] if hoogte is not None else None, metaal, ruw)
        return m, nt
    # het geschilderde licht
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
    ao.inputs['Distance'].default_value = 0.06
    ao.only_local = True
    donker = glad(nt, ao.outputs['AO'], 0.0, 1.0, 1 - holte, 1.0)
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    rand = glad(nt, geo.outputs['Pointiness'], 0.42, 0.58, 1 - bol, 1 + bol)
    f = W(nt, 'MULTIPLY', donker, rand)
    kleurf = nt.nodes.new('ShaderNodeCombineColor')
    for i in range(3):
        nt.links.new(f, kleurf.inputs[i])
    eind = meng(nt, 1.0, kl, kleurf.outputs[0])
    eind.node.blend_type = 'MULTIPLY'
    nt.links.new(eind, bsdf.inputs['Base Color'])
    return m, nt


def toon(nt, uit, kl, normaal, metaal, ruw):
    # Het licht in vaste banden (INSTELLINGEN['banden']: schaduw koel, dan half, licht warm, glans), zoals een pixeltekenaar
    # het zet: zo worden het op spelmaat vlakken en geen verloop. Metaal krijgt er een harde glans bij.
    dif = nt.nodes.new('ShaderNodeBsdfDiffuse')
    if normaal is not None:
        nt.links.new(normaal, dif.inputs['Normal'])
    s2 = nt.nodes.new('ShaderNodeShaderToRGB')
    nt.links.new(dif.outputs[0], s2.inputs[0])
    bw = nt.nodes.new('ShaderNodeRGBToBW')
    nt.links.new(s2.outputs['Color'], bw.inputs[0])
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.interpolation = 'CONSTANT'
    banden = INSTELLINGEN['banden']
    for i, (pos, c) in enumerate(banden):
        e = cr.elements[i] if i < len(cr.elements) else cr.elements.new(pos)
        e.position = min(pos, 1.0)
        e.color = tuple(min(x, 1.0) for x in c) + (1.0,)
    # een kleurenband boven 1 kan niet in een ColorRamp: de glans komt erbij als een tweede stap
    nt.links.new(bw.outputs[0], ramp.inputs['Fac'])
    col = meng(nt, 1.0, kl, ramp.outputs['Color'])
    col.node.blend_type = 'MULTIPLY'
    glans = nt.nodes.new('ShaderNodeMath')
    glans.operation = 'GREATER_THAN'
    nt.links.new(bw.outputs[0], glans.inputs[0])
    glans.inputs[1].default_value = banden[-1][0]
    col = meng(nt, W(nt, 'MULTIPLY', glans.outputs[0], 0.12), col, (1.0, 0.97, 0.9, 1.0))
    if metaal > 0.5:
        gl = nt.nodes.new('ShaderNodeBsdfGlossy')
        gl.inputs['Roughness'].default_value = ruw
        if normaal is not None:
            nt.links.new(normaal, gl.inputs['Normal'])
        s3 = nt.nodes.new('ShaderNodeShaderToRGB')
        nt.links.new(gl.outputs[0], s3.inputs[0])
        bw3 = nt.nodes.new('ShaderNodeRGBToBW')
        nt.links.new(s3.outputs['Color'], bw3.inputs[0])
        hl = glad(nt, bw3.outputs[0], 0.55, 0.6, 0.0, 0.55)
        col = meng(nt, hl, col, (1.0, 1.0, 1.0, 1.0))
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(col, em.inputs['Color'])
    nt.links.new(em.outputs[0], uit.inputs['Surface'])


# ---------------------------------------------------------------- de vormen

def actief():
    return bpy.context.active_object


def bol(c, r, rot=(0, 0, 0), seg=32, ringen=16):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=ringen, radius=1, location=c, rotation=rot, scale=r)
    return actief()


def capsule(a, b, ra, rb, seg=24):
    a, b = Vector(a), Vector(b)
    d = b - a
    rot = Vector((0, 0, 1)).rotation_difference(d).to_euler()
    bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=ra, radius2=rb, depth=d.length, location=(a + b) / 2, rotation=rot)
    delen = [actief(), bol(tuple(a), (ra, ra, ra)), bol(tuple(b), (rb, rb, rb))]
    return delen


def ringen(naam, lijst, n=48, dicht=(False, False), mat=None):
    """Een buis van ringen: (z, rx, ry, cx, cy, zakvoor, plooi) per ring; zakvoor laat de voorkant (-y) zakken, plooi
    geeft negen plooien rond."""
    vs, fs = [], []
    for (z, rx, ry, *rest) in lijst:
        cx, cy, zak, plooi = (list(rest) + [0, 0, 0, 0])[:4]
        for j in range(n):
            t = 2 * math.pi * j / n
            s = math.sin(t)
            f = 1 + plooi * math.sin(9 * t + 0.7)
            vs.append((cx + rx * f * math.cos(t), cy + ry * f * s, z - zak * max(0.0, -s) ** 1.5))
    for i in range(len(lijst) - 1):
        for j in range(n):
            a, b = i * n + j, i * n + (j + 1) % n
            fs.append((a, b, b + n, a + n))
    if dicht[0]:
        fs.append(tuple(reversed(range(n))))
    if dicht[1]:
        k = (len(lijst) - 1) * n
        fs.append(tuple(range(k, k + n)))
    me = bpy.data.meshes.new(naam)
    me.from_pydata(vs, [], fs)
    me.update()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    if mat:
        me.materials.append(mat)
    return ob


def samen(naam, delen, voxel=0.011, glad_n=3, mat=None):
    """Delen samensmelten tot één huid (voxel remesh), en wat glad maken."""
    bm = bmesh.new()
    for ob in delen:
        me = ob.data.copy()
        me.transform(ob.matrix_world)
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
        bpy.data.objects.remove(ob)
    me = bpy.data.meshes.new(naam)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    rm = ob.modifiers.new('remesh', 'REMESH')
    rm.mode = 'VOXEL'
    rm.voxel_size = voxel
    sm = ob.modifiers.new('glad', 'SMOOTH')
    sm.factor = 0.6
    sm.iterations = glad_n
    deps = bpy.context.evaluated_depsgraph_get()
    nieuw = bpy.data.meshes.new_from_object(ob.evaluated_get(deps))
    ob.modifiers.clear()
    oud = ob.data
    ob.data = nieuw
    bpy.data.meshes.remove(oud)
    nieuw.name = naam
    if mat:
        nieuw.materials.append(mat)
    return ob


def vast(ob, naam=None, mat=None):
    """Een los deel als eigen object houden (met zijn transformatie erin gebakken)."""
    ob.data.transform(ob.matrix_world)
    ob.matrix_world = Matrix.Identity(4)
    if naam:
        ob.name = naam
    if mat:
        ob.data.materials.clear()
        ob.data.materials.append(mat)
    return ob


def zacht(ob):
    ob.data.polygons.foreach_set('use_smooth', [True] * len(ob.data.polygons))


# ---------------------------------------------------------------- de speerman

# Het skelet in de houding van staan: kop, staart, ouder.
SCHOUDER, ELLEBOOG, POLS, VUIST = {}, {}, {}, {}
for k, s in (('L', 1), ('R', -1)):
    SCHOUDER[k] = Vector((0.185 * s, 0.0, 1.41))
ELLEBOOG['L'] = Vector((0.255, 0.02, 1.17))
POLS['L'] = Vector((0.245, -0.055, 0.97))
VUIST['L'] = Vector((0.24, -0.068, 0.905))
ELLEBOOG['R'] = Vector((-0.25, 0.04, 1.18))
POLS['R'] = Vector((-0.25, -0.13, 1.07))
VUIST['R'] = Vector((-0.25, -0.195, 1.04))
SPEER_XY = (-0.25, -0.195)
HEUP = {'L': Vector((0.085, 0.0, 0.96)), 'R': Vector((-0.085, 0.0, 0.96))}
KNIE = {'L': Vector((0.105, -0.012, 0.53)), 'R': Vector((-0.105, -0.012, 0.53))}
ENKEL = {'L': Vector((0.112, 0.01, 0.105)), 'R': Vector((-0.112, 0.01, 0.105))}
TEEN = {'L': Vector((0.114, -0.15, 0.035)), 'R': Vector((-0.114, -0.15, 0.035))}

# Het hoofd groter dan echt, zoals op de plaat (hoofd en helm een kwart van de lengte): het hoofd, het gezicht en de helm
# staan hieronder in de maten van een gewoon hoofd, en worden om de nek vergroot en wat gezakt.
KOP = {'schaal': 1.4, 'om': Vector((0, 0, 1.5)), 'zak': 0.05}


def kp(p):
    return tuple(KOP['om'] + (Vector(p) - KOP['om']) * KOP['schaal'] - Vector((0, 0, KOP['zak'])))


def kbol(c, r, rot=(0, 0, 0), **kw):
    return bol(kp(c), tuple(x * KOP['schaal'] for x in r), rot, **kw)


def kring(lijst):
    # ringen in de maten van het hoofd: (z, rx, ry, cx, cy, zak)
    s = KOP['schaal']
    uit = []
    for (z, rx, ry, *rest) in lijst:
        cx, cy, zak = (list(rest) + [0, 0, 0])[:3]
        x, y, zz = kp((cx, cy, z))
        uit.append((zz, rx * s, ry * s, x, y, zak * s))
    return uit


BOTTEN = {
    'heup': ((0, 0, 0.94), (0, 0, 1.12), None),
    'buik': ((0, 0, 1.12), (0, 0, 1.34), 'heup'),
    'borst': ((0, 0, 1.34), (0, 0, 1.50), 'buik'),
    'nek': ((0, 0, 1.50), kp((0, 0, 1.58)), 'borst'),
    'hoofd': (kp((0, 0, 1.58)), kp((0, 0, 1.80)), 'nek'),
}
for k in ('L', 'R'):
    BOTTEN['bovenarm.' + k] = (SCHOUDER[k], ELLEBOOG[k], 'borst')
    BOTTEN['onderarm.' + k] = (ELLEBOOG[k], POLS[k], 'bovenarm.' + k)
    BOTTEN['hand.' + k] = (POLS[k], VUIST[k] + (VUIST[k] - POLS[k]) * 0.6, 'onderarm.' + k)
    BOTTEN['dij.' + k] = (HEUP[k], KNIE[k], 'heup')
    BOTTEN['scheen.' + k] = (KNIE[k], ENKEL[k], 'dij.' + k)
    BOTTEN['voet.' + k] = (ENKEL[k], TEEN[k], 'scheen.' + k)


def maak_materialen():
    M = {}
    M['huid'] = materiaal('huid', '#d8996c', ruw=0.55, bol=0.12)[0]
    M['baard'] = materiaal('baard', '#4b2f1c', ruw=0.9, patroon='baard')[0]
    M['oog'] = materiaal('oog', '#1a1210', ruw=0.4)[0]
    M['wambuis'] = materiaal('wambuis', '#84522a', ruw=0.85, patroon='wambuis')[0]
    M['hozen'] = materiaal('hozen', '#2c3a62', ruw=0.9, patroon='stof')[0]
    M['leer'] = materiaal('leer', '#6b3f1f', ruw=0.6, patroon='leer')[0]
    M['riem'] = materiaal('riem', '#7c3a1f', ruw=0.5, patroon='leer')[0]
    M['laars'] = materiaal('laars', '#7a4a26', ruw=0.55, patroon='leer')[0]
    M['wapenrok'] = materiaal('wapenrok', '#2c52bd', ruw=0.85, patroon='stof', kleur2='#f0ae25')[0]
    M['malien'] = materiaal('malien', '#5e636b', ruw=0.6, metaal=0.4, patroon='malien', bol=0.1)[0]
    M['staal'] = materiaal('staal', '#a9afb8', ruw=0.42, metaal=1.0, bol=0.25)[0]
    M['hout'] = materiaal('hout', '#6e3d1f', ruw=0.6, patroon='hout')[0]
    return M


def lijf(M):
    d = []
    # romp (onder de wapenrok), gedrongen
    d.append(bol((0, 0, 1.0), (0.165, 0.12, 0.12)))
    d.append(bol((0, 0.0, 1.17), (0.165, 0.122, 0.15)))
    d.append(bol((0, 0.01, 1.35), (0.18, 0.13, 0.165)))
    # de schouders van het wambuis: bol en breed
    for k in ('L', 'R'):
        d.append(bol(tuple(SCHOUDER[k] + Vector((0.012 if k == 'L' else -0.012, 0.005, -0.015))), (0.09, 0.09, 0.085)))
    # nek en hoofd
    d += capsule((0, 0.01, 1.44), kp((0, 0.0, 1.60)), 0.075, 0.07)
    d.append(kbol((0, 0.004, 1.663), (0.091, 0.10, 0.104)))
    d.append(kbol((0, -0.028, 1.60), (0.078, 0.074, 0.058)))
    d.append(kbol((0, -0.099, 1.635), (0.017, 0.022, 0.028), rot=(math.radians(-15), 0, 0)))  # neus
    for s in (1, -1):
        d.append(kbol((0.088 * s, 0.01, 1.64), (0.014, 0.024, 0.03)))  # oren
    # armen: gewatteerde mouwen, handschoenen
    for k in ('L', 'R'):
        d += capsule(SCHOUDER[k], ELLEBOOG[k], 0.092, 0.072)
        d += capsule(ELLEBOOG[k], POLS[k], 0.068, 0.058)
        d.append(bol(tuple(VUIST[k]), (0.052, 0.058, 0.062)))
    # benen
    for k in ('L', 'R'):
        d += capsule(HEUP[k], KNIE[k], 0.08, 0.064)
        d += capsule(KNIE[k], ENKEL[k], 0.064, 0.046)
    ob = samen('lijf', d)
    me = ob.data
    for k in ('huid', 'wambuis', 'hozen', 'leer'):
        me.materials.append(M[k])
    idx = {'huid': 0, 'wambuis': 1, 'hozen': 2, 'leer': 3}
    vuisten = [VUIST['L'], VUIST['R']]
    for p in me.polygons:
        c = p.center
        if c.z > 1.47 and abs(c.x) < 0.17:
            m = 'huid'
        elif min((c - v).length for v in vuisten) < 0.078:
            m = 'leer'
        elif abs(c.x) > 0.19 and c.z > 0.85:
            m = 'wambuis'
        elif c.z < 0.97:
            m = 'hozen'
        else:
            m = 'wambuis'
        p.material_index = idx[m]
    zacht(ob)
    return ob


def gezicht(M):
    delen = []
    for s in (1, -1):
        delen.append(vast(kbol((0.034 * s, -0.088, 1.652), (0.011, 0.008, 0.009)), 'oog', M['oog']))
        # wenkbrauwen: dik en wat nors
        wb = kbol((0.036 * s, -0.093, 1.672), (0.024, 0.01, 0.008), rot=(0, math.radians(-12 * s), 0))
        delen.append(vast(wb, 'wenkbrauw', M['baard']))
    # de baard over kaak en kin, de snor
    baard = [kbol((0, -0.055, 1.572), (0.066, 0.05, 0.045)), kbol((0, -0.072, 1.552), (0.045, 0.035, 0.035))]
    for s in (1, -1):
        baard.append(kbol((0.062 * s, -0.03, 1.588), (0.022, 0.04, 0.04)))
    baard.append(kbol((0, -0.1, 1.607), (0.04, 0.014, 0.012)))
    b = samen('baard', baard, voxel=0.008, glad_n=2, mat=M['baard'])
    zacht(b)
    delen.append(b)
    return delen


def kleren(M):
    delen = []
    # de wapenrok: over de schouders tot boven de knie, voor iets lager
    rok = ringen('wapenrok', [
        (1.50, 0.11, 0.095, 0, 0.01, 0.0),
        (1.46, 0.165, 0.13, 0, 0.005, 0.0),
        (1.38, 0.195, 0.15),
        (1.25, 0.195, 0.148),
        (1.10, 0.18, 0.14),
        (0.93, 0.172, 0.134),
        (0.80, 0.205, 0.152, 0, 0, 0, 0.02),
        (0.62, 0.232, 0.168, 0, 0, 0.02, 0.045),
    ], mat=M['wapenrok'])
    so = rok.modifiers.new('dik', 'SOLIDIFY')
    so.thickness = 0.012
    so.offset = 1
    delen.append(rok)
    # de maliënkraag: om de nek en over de schouders, voor onder de baard
    delen.append(ringen('kraag', [
        (1.585, 0.128, 0.135, 0, 0.02, 0.08),
        (1.53, 0.152, 0.152, 0, 0.012, 0.06),
        (1.48, 0.195, 0.168, 0, 0.006, 0.04),
        (1.43, 0.218, 0.178, 0, 0.005, 0.035),
        (1.395, 0.214, 0.176, 0, 0.005, 0.035),
    ], mat=M['malien']))
    delen[-1].modifiers.new('dik', 'SOLIDIFY').thickness = 0.01
    # de riem, de gesp en de tas
    riem = ringen('riem', [(0.885, 0.19, 0.146), (0.968, 0.188, 0.144)], mat=M['riem'])
    riem.modifiers.new('dik', 'SOLIDIFY').thickness = 0.008
    delen.append(riem)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.149, 0.927), scale=(0.078, 0.016, 0.068))
    g = actief()
    g.modifiers.new('rand', 'BEVEL').width = 0.004
    delen.append(vast_mod(g, 'gesp', M['staal']))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.155, -0.1, 0.847), rotation=(0, 0, math.radians(-35)), scale=(0.075, 0.04, 0.085))
    t = actief()
    b = t.modifiers.new('rand', 'BEVEL')
    b.width = 0.012
    b.segments = 3
    delen.append(vast_mod(t, 'tas', M['leer']))
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.157, -0.104, 0.877), rotation=(0, 0, math.radians(-35)), scale=(0.08, 0.046, 0.03))
    f = actief()
    b = f.modifiers.new('rand', 'BEVEL')
    b.width = 0.01
    b.segments = 2
    delen.append(vast_mod(f, 'klep', M['leer']))
    # de laarzen, met een omgeslagen rand
    for k in ('L', 'R'):
        e, kn = ENKEL[k], KNIE[k]
        schacht = ringen('schacht', [(0.40, 0.084, 0.087, kn.x + (e.x - kn.x) * 0.2, -0.004), (0.28, 0.074, 0.077, e.x * 0.99, 0.0),
                                     (0.14, 0.066, 0.07, e.x, 0.006), (0.08, 0.068, 0.078, e.x, 0.0)], dicht=(True, True))
        voet = bol((e.x * 1.15, -0.05, 0.05), (0.066, 0.13, 0.055), rot=(0, 0, math.radians(14 if e.x > 0 else -14)))
        hiel = bol((e.x, 0.03, 0.055), (0.06, 0.06, 0.055))
        laars = samen('laars.' + k, [schacht, voet, hiel], voxel=0.009, glad_n=2, mat=M['laars'])
        # de zool vlak
        for v in laars.data.vertices:
            v.co.z = max(v.co.z, 0.0)
        zacht(laars)
        delen.append(laars)
        bpy.ops.mesh.primitive_torus_add(major_radius=0.085, minor_radius=0.026, location=(kn.x + (e.x - kn.x) * 0.2, -0.004, 0.395))
        rand = actief()
        rand.scale = (1.0, 1.04, 0.8)
        zacht(rand)
        delen.append(vast(rand, 'laarsrand.' + k, M['laars']))
    return delen


def vast_mod(ob, naam, mat):
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps))
    ob.modifiers.clear()
    oud = ob.data
    ob.data = me
    bpy.data.meshes.remove(oud)
    return vast(ob, naam, mat)


def helm(M):
    delen = []
    # in de maten van een gewoon hoofd (kp), hoog genoeg dat je onder de rand de ogen ziet
    s = KOP['schaal']
    koepel = kbol((0, 0.004, 1.718), (0.112, 0.116, 0.138), seg=40, ringen=20)
    me = koepel.data
    bm = bmesh.new()
    bm.from_mesh(me)
    weg = [v for v in bm.verts if v.co.z < -0.02]
    bmesh.ops.delete(bm, geom=weg, context='VERTS')
    bm.to_mesh(me)
    bm.free()
    koepel.modifiers.new('dik', 'SOLIDIFY').thickness = 0.008
    zacht(koepel)
    delen.append(vast_mod(koepel, 'koepel', M['staal']))
    rand = ringen('rand', kring([(1.722, 0.107, 0.11, 0, 0.004), (1.712, 0.12, 0.123, 0, 0.004), (1.702, 0.136, 0.139, 0, 0.004)]),
                  n=64, mat=M['staal'])
    rand.modifiers.new('dik', 'SOLIDIFY').thickness = 0.01
    zacht(rand)
    delen.append(vast_mod(rand, 'rand', M['staal']))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.137 * s, minor_radius=0.0055 * s, major_segments=64, location=kp((0, 0.004, 1.701)))
    zacht(actief())
    delen.append(vast(actief(), 'omrand', M['staal']))
    delen.append(vast(kbol((0, 0.004, 1.718), (0.011, 0.118, 0.141)), 'kam', M['staal']))
    delen.append(vast(kbol((0, 0.004, 1.718), (0.114, 0.011, 0.141)), 'kam', M['staal']))
    delen.append(vast(kbol((0, 0.004, 1.857), (0.015, 0.015, 0.013)), 'knop', M['staal']))
    for ob in delen[-2:]:
        zacht(ob)
    for ob in delen:
        ob.visible_shadow = False  # de helm werpt geen schaduw: het gezicht blijft leesbaar, zoals een schilder doet
    return delen


def speer(M):
    x, y = SPEER_XY
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.026, depth=2.06, location=(x, y, 1.11))
    s = actief()
    zacht(s)
    delen = [vast(s, 'schacht', M['hout'])]
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.032, depth=0.11, location=(x, y, 2.17))
    delen.append(vast(actief(), 'koker', M['staal']))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.033, minor_radius=0.008, location=(x, y, 2.12))
    delen.append(vast(actief(), 'ring', M['staal']))
    # het blad: een blad met een middenrib, ruitvormig in doorsnede
    lijst = []
    for i in range(13):
        t = i / 12
        w = 0.058 * math.sin(math.pi * min(1.0, t ** 0.75 * 1.0)) * (1 - t) ** 0.25 + 0.0005
        lijst.append((2.22 + 0.38 * t, w, 0.018 * (1 - t) + 0.001, x, y))
    blad = ringen('blad', lijst, n=4, dicht=(True, True), mat=M['staal'])
    delen.append(blad)
    # een dop aan de voet
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.028, depth=0.05, location=(x, y, 0.08))
    delen.append(vast(actief(), 'dop', M['staal']))
    return delen


# ---------------------------------------------------------------- het skelet en de huid

def skelet():
    ad = bpy.data.armatures.new('skelet')
    arm = bpy.data.objects.new('skelet', ad)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for naam, (kop, staart, _) in BOTTEN.items():
        eb = ad.edit_bones.new(naam)
        eb.head = Vector(kop)
        eb.tail = Vector(staart)
    for naam, (_, _, ouder) in BOTTEN.items():
        if ouder:
            ad.edit_bones[naam].parent = ad.edit_bones[ouder]
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm


def segafstand(p, a, b):
    a, b = Vector(a), Vector(b)
    ab = b - a
    t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length


def smoothstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


def huid(ob, arm, keuze):
    """Gewichten per punt: keuze(p) geeft {bot: gewicht}. Daarna het skelet als modifier."""
    groepen = {}
    for v in ob.data.vertices:
        for bot, w in keuze(ob.matrix_world @ v.co).items():
            if w <= 1e-4:
                continue
            if bot not in groepen:
                groepen[bot] = ob.vertex_groups.new(name=bot)
            groepen[bot].add([v.index], w, 'REPLACE')
    ob.parent = arm
    md = ob.modifiers.new('skelet', 'ARMATURE')
    md.object = arm


def naast(botten, macht=8):
    def keuze(p):
        d = sorted((segafstand(p, BOTTEN[b][0], BOTTEN[b][1]), b) for b in botten)[:2]
        w = [1 / (x + 1e-4) ** macht for x, _ in d]
        som = sum(w)
        return {b: wi / som for (_, b), wi in zip(d, w)}
    return keuze


def alleen(bot):
    return lambda p: {bot: 1.0}


def rokgewicht(p):
    # boven de riem de romp, eronder steeds meer de dij aan dezelfde kant (het midden van beide)
    romp = naast(['heup', 'buik', 'borst'])(p)
    t = smoothstep(0.98, 0.72, p.z) * 0.85
    if t <= 0:
        return romp
    s = smoothstep(-0.13, 0.13, p.x)
    w = {b: v * (1 - t) for b, v in romp.items()}
    w['dij.L'] = t * s
    w['dij.R'] = t * (1 - s)
    return w


# ---------------------------------------------------------------- houdingen

def draai(arm, bot, hoek):
    """Een bot draaien om de x-as van het skelet (voor- en achterwaarts), om zijn kop."""
    pb = arm.pose.bones[bot]
    R = pb.bone.matrix_local.to_3x3()
    pb.rotation_mode = 'QUATERNION'
    pb.rotation_quaternion = (R.inverted() @ Matrix.Rotation(hoek, 3, 'X') @ R).to_quaternion()


def schuif(arm, bot, v):
    pb = arm.pose.bones[bot]
    pb.location = pb.bone.matrix_local.to_3x3().inverted() @ Vector(v)


def rust_houding(arm):
    for pb in arm.pose.bones:
        pb.rotation_mode = 'QUATERNION'
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)


def loop_houding(arm, i, n):
    """Beeld i van n van een loopcyclus, op de plaats. Vooruit is -y, dus een negatieve hoek om x."""
    rust_houding(arm)
    f = 2 * math.pi * i / n
    for k, fase in (('L', 0.0), ('R', math.pi)):
        g = f + fase
        dij = -0.42 * math.sin(g)
        knie = 0.12 + 0.75 * max(0.0, math.cos(g)) ** 1.5
        draai(arm, 'dij.' + k, dij)
        draai(arm, 'scheen.' + k, knie)
        draai(arm, 'voet.' + k, -(dij + knie) * 0.7 - 0.1 * max(0.0, -math.cos(g)))
    # de linkerarm zwaait tegen het linkerbeen in; de rechter draagt de speer
    draai(arm, 'bovenarm.L', 0.32 * math.sin(f))
    draai(arm, 'onderarm.L', -0.15 - 0.2 * max(0.0, -math.sin(f)))
    draai(arm, 'bovenarm.R', -0.05 * math.sin(f))
    draai(arm, 'buik', -0.05)
    schuif(arm, 'heup', (0, 0, -0.028 * abs(math.sin(f)) + 0.006))


# ---------------------------------------------------------------- alles samen

def bouw():
    sc = leeg()
    M = maak_materialen()
    licht(sc)
    cam = camera(sc)
    arm = skelet()
    l = lijf(M)
    huid(l, arm, naast(list(BOTTEN)))
    for ob in gezicht(M) + helm(M):
        huid(ob, arm, alleen('hoofd'))
    for ob in kleren(M):
        n = ob.name
        if n.startswith('wapenrok'):
            huid(ob, arm, rokgewicht)
        elif n.startswith('kraag'):
            huid(ob, arm, naast(['borst', 'nek']))
        elif n.startswith(('riem', 'gesp', 'tas', 'klep')):
            huid(ob, arm, alleen('heup'))
        elif n.startswith(('laars', 'laarsrand')):
            k = n[-1]
            huid(ob, arm, naast(['scheen.' + k, 'voet.' + k]) if n.startswith('laars.') else alleen('scheen.' + k))
    for ob in speer(M):
        huid(ob, arm, alleen('hand.R'))
    arm.scale = (INSTELLINGEN['breed'], INSTELLINGEN['breed'], 1.0)
    # de plek in rust, voor de patronen
    for ob in sc.objects:
        if ob.type != 'MESH' or ob.name == 'grond':
            continue
        me = ob.data
        if 'rust' in me.attributes:
            me.attributes.remove(me.attributes['rust'])
        a = me.attributes.new('rust', 'FLOAT_VECTOR', 'POINT')
        mw = ob.matrix_world
        plat = []
        for v in me.vertices:
            plat.extend(mw @ v.co)
        a.data.foreach_set('vector', plat)
    return sc, cam, arm


def render(sc, pad):
    sc.render.filepath = pad
    bpy.ops.render.render(write_still=True)


def maat(sc, cam):
    # waar de oorsprong (het anker) en de top van de helm in de render vallen, voor proef.cjs
    b, h = INSTELLINGEN['res']
    def px(p):
        v = world_to_camera_view(sc, cam, Vector(p))
        return [v.x * b, (1 - v.y) * h]
    return {'anker': px((0, 0, 0)), 'helm': px(kp((0, 0, 1.87))), 'pxm': INSTELLINGEN['pxm'], 'res': [b, h]}


def main():
    os.makedirs(UIT, exist_ok=True)
    sc, cam, arm = bouw()
    with open(os.path.join(UIT, 'maat.json'), 'w') as f:
        json.dump(maat(sc, cam), f)
    if WAT in ('staan', 'alles', 'Z'):
        rust_houding(arm)
        for r, hoek in RICHTINGEN.items():
            if WAT == 'Z' and r != 'Z':
                continue
            arm.rotation_euler = (0, 0, math.radians(hoek))
            render(sc, os.path.join(UIT, f'staan-{r}{"" if STIJL == "toon" else "-" + STIJL}.png'))
    if WAT in ('lopen', 'alles'):
        arm.rotation_euler = (0, 0, math.radians(RICHTINGEN['ZW']))
        n = INSTELLINGEN['beelden']
        for i in range(n):
            loop_houding(arm, i, n)
            render(sc, os.path.join(UIT, f'lopen-ZW-{i}.png'))
    if WAT == 'blend':
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'speerman.blend'))


main()
