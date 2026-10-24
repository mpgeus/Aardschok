# De speerman in HD (vraag 190; ontwerp/beeld.md, "Blender als basis?"). Marcel, 24 okt: "ik wil echt een super HD
# variant, waarin ik alle details zichtbaar krijg." Staan naar Z, zo'n 1500 pixels hoog. Het lijf komt uit MPFB (MakeHuman
# voor Blender, de extensie van extensions.blender.org; Marcel: "je mag ook de plugin gebruiken"): een gedrongen man met een
# skelet met vingers. De kleren worden op dat lijf gemaakt: uit zijn eigen huid naar buiten gezet (het wambuis, de
# handschoenen, de laarzen), of eromheen gelegd en gevallen (de rok van de wapenrok, met de stofsimulatie van Blender).
#
# De man staat stil, dus de houding wordt in de mesh gebakken; de camera staat recht voor hem, 15 graden boven de grond,
# zoals de generator tekent (speerman.py, 'camera').
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/speerman_hd.py -- [uitmap] [blend] [spel]
# (zonder --factory-startup: dan laadt Blender de extensie MPFB niet)
import bpy
import bmesh
import math
import os
import sys
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService
from bl_ext.user_default.mpfb.services.locationservice import LocationService

HIER = os.path.dirname(os.path.abspath(__file__))
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
UIT = os.path.abspath(ARGS[0] if ARGS else os.path.join(HIER, '..', 'pixelart', 'uit', 'blender', 'render'))
BLEND = 'blend' in ARGS[1:]
SPEL = 'spel' in ARGS[1:]

INSTELLINGEN = {
    'res': (1200, 1950),
    'pxm': 1150,             # pixels per meter: de man (1,25 m tot de kruin van de helm) zo'n 1450 pixels
    'anker_y': 1860,         # waar de voeten staan, van boven
    'camera': 15,
    'samples': 192,
    # de man: een gedrongen soldaat van middelbare leeftijd (de knoppen van MakeHuman, 0 tot 1)
    'mens': {'gender': 1.0, 'age': 0.78, 'muscle': 0.85, 'weight': 0.9, 'proportions': 0.1, 'height': 0.1},
    # en gedrongen zoals op vel 01 (beeld.md, "De referentie, onderdeel voor onderdeel"): bredere schouders, een korte
    # nek, korte benen (de doelen van MakeHuman, dan de botten van de benen korter: de doelen gaan niet verder dan 1)
    'doelen': {'legs/measure-upperleg-height-decr': 1, 'legs/measure-lowerleg-height-decr': 1, 'neck/measure-neck-height-decr': 1,
               'neck/neck-scale-vert-decr': 1, 'torso/measure-shoulder-dist-incr': 1, 'torso/torso-scale-horiz-incr': 0.6,
               'head/head-square': 0.6, 'head/head-fat-incr': 0.4, 'hands/l-hand-scale-incr': 1, 'hands/r-hand-scale-incr': 1,
               'head/head-scale-horiz-incr': 1, 'head/head-scale-vert-decr': 0.4, 'arms/l-upperarm-fat-incr': 1, 'arms/r-upperarm-fat-incr': 1,
               'arms/l-lowerarm-fat-incr': 1, 'arms/r-lowerarm-fat-incr': 1,
               'eyebrows/eyebrows-angle-down': 1, 'eyebrows/eyebrows-trans-down': 0.6, 'nose/nose-scale-horiz-incr': 0.8,
               'nose/nose-flaring-incr': 0.6, 'nose/nose-volume-incr': 0.5, 'head/head-age-incr': 0.6},
    'been': 0.65,            # de botten van de benen, in de lengte
    'hoofd': 1.35,           # het hoofd: met de helm een kwart van de man, zoals op de plaat
    'voeten': 14,            # graden naar buiten
    'zon': 4.5, 'zonkleur': (1.0, 0.9, 0.78),
    'lucht': 0.5, 'luchtkleur': (0.5, 0.58, 0.74),
    'lijn': 3.0,
    'vullicht': 1.2,         # een zacht licht van voren, zodat het gezicht onder de helm licht is zoals op de plaat
    'speer': 1.0,            # het speerblad en de schacht, maal
    'belichting': 0.0,
}

# Op spelmaat (zo'n 74 pixels hoog) verdwijnt wat in HD klopt: de generator overdrijft, en dat doen wij hier ook. Vier keer
# zo groot als het spel gerenderd (proef: spelmaat.cjs verkleint), met lijnen van één pixel in het spel, lichter licht, en
# een groter speerblad en een dikkere schacht.
if SPEL:
    INSTELLINGEN.update(pxm=240, res=(330, 480), anker_y=455, samples=96, lijn=5.5, vullicht=1.2, speer=1.9, belichting=0.1, contrast=True)

# licht van linksvoor en hoog, vast aan de kijker; randlicht van rechtsachter
LICHT = Vector((-0.55, -0.62, 0.56)).normalized()
RANDLICHT = Vector((0.7, 0.55, 0.45)).normalized()


def lin(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


# ---------------------------------------------------------------- de scène

def scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'CUDA'  # OptiX compileert niet op de GTX 1080 Ti
    pr.get_devices()
    for d in pr.devices:
        d.use = d.type == 'CUDA'
    sc.cycles.device = 'GPU'
    sc.cycles.samples = INSTELLINGEN['samples']
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.render.film_transparent = True
    sc.render.resolution_x, sc.render.resolution_y = INSTELLINGEN['res']
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGBA'
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.exposure = INSTELLINGEN['belichting']
    if INSTELLINGEN.get('contrast'):
        try:
            sc.view_settings.look = 'Medium High Contrast'
        except TypeError:
            print('LOOK', [l.identifier for l in sc.view_settings.bl_rna.properties['look'].enum_items])
    # de camera, recht van voren
    b, h = INSTELLINGEN['res']
    cd = bpy.data.cameras.new('camera')
    cd.type = 'ORTHO'
    cd.sensor_fit = 'VERTICAL'
    cd.ortho_scale = h / INSTELLINGEN['pxm']
    cd.clip_end = 60
    cam = bpy.data.objects.new('camera', cd)
    sc.collection.objects.link(cam)
    a = math.radians(INSTELLINGEN['camera'])
    cam.rotation_euler = (math.pi / 2 - a, 0, 0)
    kijk = Vector((0, math.cos(a), -math.sin(a)))
    op = Vector((0, math.sin(a), math.cos(a)))
    cam.location = op * ((INSTELLINGEN['anker_y'] - h / 2) / INSTELLINGEN['pxm']) - kijk * 20
    sc.camera = cam
    # het licht
    for naam, r, e, kl, hoek in (('zon', LICHT, INSTELLINGEN['zon'], INSTELLINGEN['zonkleur'], 3),
                                 ('rand', RANDLICHT, 1.6, (0.8, 0.88, 1.0), 8),
                                 ('vul', Vector((0.1, -1, 0.35)).normalized(), INSTELLINGEN['vullicht'], (1.0, 0.95, 0.9), 20)):
        ld = bpy.data.lights.new(naam, 'SUN')
        ld.energy, ld.color, ld.angle = e, kl, math.radians(hoek)
        ob = bpy.data.objects.new(naam, ld)
        sc.collection.objects.link(ob)
        ob.rotation_euler = r.to_track_quat('Z', 'Y').to_euler()
    w = bpy.data.worlds.new('lucht')
    sc.world = w
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = INSTELLINGEN['luchtkleur'] + (1,)
    bg.inputs['Strength'].default_value = INSTELLINGEN['lucht']
    # lijnen om de delen (in HD uit: ze tekenen door het haar heen)
    sc.render.use_freestyle = INSTELLINGEN['lijn'] > 0
    sc.render.line_thickness_mode = 'ABSOLUTE'
    ls = sc.view_layers[0].freestyle_settings.linesets
    ls = ls[0] if len(ls) else ls.new('lijnen')
    ls.select_by_visibility = True
    ls.select_by_edge_types = True
    for t in ('select_silhouette', 'select_border', 'select_material_boundary', 'select_external_contour'):
        setattr(ls, t, True)
    ls.select_crease = False
    if not ls.linestyle:
        ls.linestyle = bpy.data.linestyles.new('lijn')
    ls.linestyle.color = (0.07, 0.045, 0.03)
    ls.linestyle.thickness = INSTELLINGEN['lijn']
    ls.linestyle.alpha = 1.0 if INSTELLINGEN.get('contrast') else 0.85
    return sc


# ---------------------------------------------------------------- materialen

class Knopen:
    """Een materiaal bouwen met korte zinnen."""

    def __init__(self, naam):
        self.m = bpy.data.materials.new(naam)
        self.nt = self.m.node_tree
        for n in list(self.nt.nodes):
            self.nt.nodes.remove(n)
        self.uit = self.nt.nodes.new('ShaderNodeOutputMaterial')
        self.bsdf = self.nt.nodes.new('ShaderNodeBsdfPrincipled')
        self.nt.links.new(self.bsdf.outputs['BSDF'], self.uit.inputs['Surface'])

    def n(self, soort, **kw):
        node = self.nt.nodes.new(soort)
        for k, v in kw.items():
            setattr(node, k, v)
        return node

    def zet(self, sok, x):
        if isinstance(x, (int, float)):
            sok.default_value = x
        elif isinstance(x, tuple):
            sok.default_value = x
        else:
            self.nt.links.new(x, sok)

    def w(self, op, a, b=0.0):
        n = self.n('ShaderNodeMath', operation=op)
        self.zet(n.inputs[0], a)
        self.zet(n.inputs[1], b)
        return n.outputs[0]

    def plek(self):
        tc = self.n('ShaderNodeTexCoord')
        return tc.outputs['Object']

    def ruis(self, schaal, detail=3.0, rek=None, vec=None):
        v = vec if vec is not None else self.plek()
        if rek:
            vm = self.n('ShaderNodeVectorMath', operation='MULTIPLY')
            self.zet(vm.inputs[0], v)
            vm.inputs[1].default_value = rek
            v = vm.outputs[0]
        t = self.n('ShaderNodeTexNoise')
        self.zet(t.inputs['Vector'], v)
        t.inputs['Scale'].default_value = schaal
        t.inputs['Detail'].default_value = detail
        return t.outputs['Fac']

    def glad(self, x, lo, hi, a=0.0, b=1.0):
        n = self.n('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP')
        self.zet(n.inputs['Value'], x)
        n.inputs['From Min'].default_value, n.inputs['From Max'].default_value = lo, hi
        n.inputs['To Min'].default_value, n.inputs['To Max'].default_value = a, b
        return n.outputs['Result']

    def meng(self, f, a, b, soort='MIX'):
        n = self.n('ShaderNodeMix', data_type='RGBA', blend_type=soort)
        kl = [s for s in n.inputs if s.type == 'RGBA']
        self.zet(kl[0], a)
        self.zet(kl[1], b)
        self.zet(n.inputs[0], f)
        return [s for s in n.outputs if s.type == 'RGBA'][0]

    def bobbel(self, hoogte, kracht=0.5, afstand=0.003):
        b = self.n('ShaderNodeBump')
        b.inputs['Strength'].default_value = kracht
        b.inputs['Distance'].default_value = afstand
        self.zet(b.inputs['Height'], hoogte)
        self.nt.links.new(b.outputs['Normal'], self.bsdf.inputs['Normal'])

    def af(self, kleur, ruw=0.7, metaal=0.0, holte=0.35):
        # holtes donkerder: omgevingsschaduw, alleen binnen het eigen deel
        ao = self.n('ShaderNodeAmbientOcclusion', only_local=True)
        ao.inputs['Distance'].default_value = 0.03
        f = self.glad(ao.outputs['AO'], 0.0, 1.0, 1 - holte, 1.0)
        c = self.n('ShaderNodeCombineColor')
        for i in range(3):
            self.zet(c.inputs[i], f)
        self.zet(self.bsdf.inputs['Base Color'], self.meng(1.0, kleur, c.outputs[0], 'MULTIPLY'))
        self.zet(self.bsdf.inputs['Roughness'], ruw)
        self.bsdf.inputs['Metallic'].default_value = metaal
        return self.m


def mat_huid():
    k = Knopen('huid')
    r = k.ruis(60, 4)
    kl = k.meng(k.glad(k.ruis(14, 2), 0.4, 0.7, 0, 0.35), lin('#b8714c'), lin('#a4553c'))
    kl = k.meng(k.w('MULTIPLY', r, 0.15), kl, lin('#7a4630'))
    k.bsdf.inputs['Subsurface Weight'].default_value = 0.12
    k.bsdf.inputs['Subsurface Radius'].default_value = (0.9, 0.4, 0.25)
    k.bsdf.inputs['Subsurface Scale'].default_value = 0.01
    k.bobbel(r, 0.15, 0.001)
    return k.af(kl, ruw=0.48, holte=0.25)


def mat_stof(naam, kleur, schaal=30, kracht=0.25):
    k = Knopen(naam)
    r = k.ruis(schaal * 8, 2)          # het weefsel
    v = k.ruis(schaal / 4, 2)          # vlekken
    kl = k.meng(k.glad(v, 0.35, 0.65, 0, 0.22), lin(kleur), (0, 0, 0, 1))
    k.bobbel(r, kracht, 0.0015)
    return k.af(kl, ruw=0.9)


def mat_leer(naam, kleur, donker='#2a160a'):
    k = Knopen(naam)
    r = k.ruis(18, 5)
    kras = k.ruis(90, 2, rek=(1, 1, 6))
    kl = k.meng(k.glad(r, 0.3, 0.75, 0, 0.45), lin(kleur), lin(donker))
    kl = k.meng(k.glad(kras, 0.62, 0.72, 0, 0.25), kl, (1, 0.9, 0.75, 1))
    k.bobbel(k.w('ADD', r, k.w('MULTIPLY', kras, 0.3)), 0.35, 0.002)
    return k.af(kl, ruw=0.55)


def mat_oog():
    # wit met een bruine iris en een zwarte pupil, naar voren (-y)
    k = Knopen('oog')
    tc = k.n('ShaderNodeTexCoord')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.nt.links.new(tc.outputs['Normal'], sep.inputs[0])
    voor = k.w('MULTIPLY', sep.outputs['Y'], -1.0)
    iris = k.glad(voor, 0.86, 0.9)
    pupil = k.glad(voor, 0.965, 0.975)
    kl = k.meng(iris, lin('#d9d2c4'), lin('#4a3220'))
    kl = k.meng(pupil, kl, lin('#0c0806'))
    k.zet(k.bsdf.inputs['Base Color'], kl)
    k.bsdf.inputs['Roughness'].default_value = 0.15
    k.bsdf.inputs['Coat Weight'].default_value = 0.6
    return k.m


# ---------------------------------------------------------------- de mens

def richt(rig, bot, richting):
    """Een bot in de houding naar een richting laten wijzen (in de ruimte van het skelet), zijn draaiing om zich heen gelijk."""
    bpy.context.view_layer.update()
    pb = rig.pose.bones[bot]
    M = pb.matrix.copy()
    nu = (M.to_3x3() @ Vector((0, 1, 0))).normalized()
    R = nu.rotation_difference(Vector(richting).normalized()).to_matrix()
    nieuw = (R @ M.to_3x3()).to_4x4()
    nieuw.translation = M.translation
    pb.matrix = nieuw
    bpy.context.view_layer.update()


def krul(rig, bot, hoek):
    pb = rig.pose.bones[bot]
    pb.rotation_mode = 'XYZ'
    pb.rotation_euler.x += hoek
    bpy.context.view_layer.update()


def mens():
    macro = TargetService.get_default_macro_info_dict()
    macro.update(INSTELLINGEN['mens'])
    macro['race'] = {'caucasian': 1.0, 'asian': 0.0, 'african': 0.0}
    lijf = HumanService.create_human(macro_detail_dict=macro, scale=0.1)
    doelen = LocationService.get_mpfb_data('targets')
    for naam, w in INSTELLINGEN['doelen'].items():
        TargetService.load_target(lijf, os.path.join(doelen, naam + '.target.gz'), weight=w)
    rig = HumanService.add_builtin_rig(lijf, 'default')
    bpy.context.view_layer.objects.active = rig
    # korte benen: de botten in de lengte korter, de onderbenen en voeten zonder de schaal van hun ouder
    for b in rig.data.bones:
        if b.name.startswith(('lowerleg', 'foot', 'toe')):
            b.inherit_scale = 'NONE'
    for k in ('L', 'R'):
        for b in ('upperleg02', 'lowerleg01', 'lowerleg02'):
            rig.pose.bones[f'{b}.{k}'].scale = (1, INSTELLINGEN['been'], 1)
    bpy.context.view_layer.update()
    # de armen omlaag: links hangend, rechts de onderarm naar voren voor de speer
    for k, s in (('L', 1), ('R', -1)):
        for b in ('upperarm01', 'upperarm02'):
            richt(rig, f'{b}.{k}', ((0.22 if k == 'R' else 0.3) * s, 0.06, -1))
    for b in ('lowerarm01', 'lowerarm02'):
        richt(rig, f'{b}.L', (0.06, -0.22, -1))
    richt(rig, 'wrist.L', (0.02, -0.2, -1))
    for b in ('lowerarm01', 'lowerarm02'):
        richt(rig, f'{b}.R', (-0.1, -1, 0.5))
    richt(rig, 'wrist.R', (-0.1, -1, 0.35))
    # de voeten wat naar buiten
    for k, s in (('L', 1), ('R', -1)):
        pb = rig.pose.bones[f'foot.{k}']
        nu = ((rig.matrix_world @ pb.tail) - (rig.matrix_world @ pb.head)).normalized()
        richt(rig, f'foot.{k}', Matrix.Rotation(math.radians(INSTELLINGEN['voeten'] * s), 3, 'Z') @ nu)
    # het hoofd groter
    rig.pose.bones['head'].scale = (INSTELLINGEN['hoofd'],) * 3
    bpy.context.view_layer.update()
    # op de grond: de laagste punt van het lijf op z = 0
    deps = bpy.context.evaluated_depsgraph_get()
    me = lijf.evaluated_get(deps).to_mesh()
    z0 = min(v.co.z for v in me.vertices)
    lijf.evaluated_get(deps).to_mesh_clear()
    rig.location.z -= z0
    bpy.context.view_layer.update()
    return lijf, rig


def vingers(rig, hoek_vinger, hoek_duim):
    for k in ('L', 'R'):
        for v in range(2, 6):
            for d in range(1, 4):
                krul(rig, f'finger{v}-{d}.{k}', hoek_vinger[k])
        for d in range(2, 4):
            krul(rig, f'finger1-{d}.{k}', hoek_duim[k])


def bak(ob, naam):
    """De mesh zoals hij er nu uitziet (houding, maskers) als een eigen object, met zijn vertex groups."""
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps), preserve_all_data_layers=True, depsgraph=deps)
    me.transform(ob.matrix_world)
    nieuw = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(nieuw)
    for g in ob.vertex_groups:
        if g.name not in nieuw.vertex_groups:
            nieuw.vertex_groups.new(name=g.name)
    return nieuw


def gewicht(ob, namen):
    """Per punt de som van de gewichten van de groepen waarvan de naam met een van `namen` begint."""
    idx = [g.index for g in ob.vertex_groups if g.name.startswith(namen)]
    uit = [0.0] * len(ob.data.vertices)
    for v in ob.data.vertices:
        for g in v.groups:
            if g.group in idx:
                uit[v.index] += g.weight
    return uit


def zacht(ob):
    ob.data.polygons.foreach_set('use_smooth', [True] * len(ob.data.polygons))


# ---------------------------------------------------------------- kleren uit de huid

def uit_huid(naam, lijf, kies, dikte, mat, sub=1):
    """De vlakken van het lijf waarvan alle punten gekozen zijn, als een eigen deel, dikte meter naar buiten gezet."""
    bm = bmesh.new()
    bm.from_mesh(lijf.data)
    bm.verts.ensure_lookup_table()
    weg = [f for f in bm.faces if not all(kies[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    me = bpy.data.meshes.new(naam)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    if sub:
        s = ob.modifiers.new('sub', 'SUBSURF')
        s.levels = s.render_levels = sub
        deps = bpy.context.evaluated_depsgraph_get()
        nieuw = bpy.data.meshes.new_from_object(ob.evaluated_get(deps))
        ob.modifiers.clear()
        ob.data = nieuw
    me = ob.data
    me.update()
    ns = [v.normal.copy() for v in me.vertices]  # eerst alle normalen: verschuiven maakt ze anders
    for v, n in zip(me.vertices, ns):
        v.co += n * dikte
    me.materials.append(mat)
    zacht(ob)
    return ob


def wambuis(lijf, rig, mat):
    """De mouwen van het gewatteerde wambuis: de armen van schouder tot pols, naar buiten, met echte ruiten."""
    arm = gewicht(lijf, ('upperarm', 'lowerarm'))
    hand = gewicht(lijf, ('wrist', 'finger', 'metacarpal'))
    kies = [a > 0.35 and h < 0.2 for a, h in zip(arm, hand)]
    ob = uit_huid('wambuis', lijf, kies, 0.0, mat, sub=2)
    # per punt de dichtstbijzijnde armbot: de plek langs de arm (t) en rond de arm (s), en daaruit de ruiten
    bpy.context.view_layer.update()
    segs = []
    for k in ('L', 'R'):
        begin = 0.0
        for b in ('shoulder01', 'upperarm01', 'upperarm02', 'lowerarm01', 'lowerarm02'):
            pb = rig.pose.bones[f'{b}.{k}']
            a, e = rig.matrix_world @ pb.head, rig.matrix_world @ pb.tail
            segs.append((a, e, begin))
            begin += (e - a).length
    me = ob.data
    ns = [v.normal.copy() for v in me.vertices]
    for v, nrm in zip(me.vertices, ns):
        p = v.co.copy()
        best = None
        for a, b, begin in segs:
            ab = b - a
            t = max(0.0, min(1.0, (p - a).dot(ab) / ab.length_squared))
            q = a + ab * t
            d = (p - q).length
            if best is None or d < best[0]:
                best = (d, a, b, t, q, begin)
        d, a, b, t, q, begin = best
        as_ = (b - a).normalized()
        voor = Vector((0, -1, 0))
        x1 = (voor - as_ * voor.dot(as_)).normalized()
        y1 = as_.cross(x1)
        r = p - q
        hoek = math.atan2(r.dot(y1), r.dot(x1))
        langs = begin + (p - a).dot(as_)  # langs de arm, in meters
        rond = hoek * 0.065
        u = (langs + rond) / 0.065
        w = (langs - rond) / 0.065
        fu, fw = u - math.floor(u), w - math.floor(w)
        kussen = (math.sin(math.pi * fu) * math.sin(math.pi * fw)) ** 0.45
        v.co += nrm * (0.012 + 0.009 * kussen)
    return ob



# ---------------------------------------------------------------- kleren om het lijf heen

def bvh_van(delen):
    """Een BVH van de vlakken van (object, kies) in de wereld; kies per punt, of None voor alles."""
    verts, polys = [], []
    for ob, kies in delen:
        mw = ob.matrix_world
        o = len(verts)
        verts += [mw @ v.co for v in ob.data.vertices]
        for p in ob.data.polygons:
            if kies is None or all(kies[i] for i in p.vertices):
                polys.append([o + i for i in p.vertices])
    return BVHTree.FromPolygons(verts, polys)


def straal(bvh, c, d, ver=0.8):
    """Hoe ver van c de buitenkant ligt in richting d (van buiten naar binnen gemeten), of None."""
    hit = bvh.ray_cast(c + d * ver, -d, ver)
    return ver - hit[3] if hit[0] is not None else None


def vul(rij):
    """Gaten in een ring van stralen opvullen met de buren."""
    n = len(rij)
    if all(r is None for r in rij):
        return [0.1] * n
    uit = list(rij)
    for i in range(n):
        if uit[i] is None:
            for k in range(1, n):
                kand = [x for x in (rij[(i - k) % n], rij[(i + k) % n]) if x is not None]
                if kand:
                    uit[i] = max(kand)
                    break
    return uit


def maak(naam, vs, fs, uvs=None, mat=None):
    me = bpy.data.meshes.new(naam)
    me.from_pydata(vs, [], fs)
    if uvs:
        laag = me.uv_layers.new(name='uv')
        for p in me.polygons:
            for li in p.loop_indices:
                laag.data[li].uv = uvs[me.loops[li].vertex_index]
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
    zacht(ob)
    return ob


def koker(naam, bvh, punt, ts, extra, n=64, mat=None, dicht=False, ver=0.8):
    """Een buis om het lijf: punt(t, hoek) geeft het midden van de ring en zijn as (een eenheidsvector); de ring ligt op
    de buitenkant van wat de bvh raakt, plus extra(t, hoek). De naad ligt achter. Met uv's: rond in meters, langs in meters."""
    ringen = []
    for t in ts:
        rij, cs = [], []
        for j in range(n + 1):
            th = math.pi + 2 * math.pi * j / n
            c, as_ = punt(t, th)
            ref = Vector((0, -1, 0)) if abs(as_.y) < 0.9 else Vector((1, 0, 0))
            x1 = (ref - as_ * ref.dot(as_)).normalized()
            y1 = as_.cross(x1)
            d = x1 * math.cos(th) + y1 * math.sin(th)
            rij.append(straal(bvh, c, d, ver))
            cs.append((c, d))
        rij = vul(rij)
        ringen.append([c + d * (r + extra(t, th)) for (c, d), r, th in
                       zip(cs, rij, [math.pi + 2 * math.pi * j / n for j in range(n + 1)])])
    vs = [p for ring in ringen for p in ring]
    fs = []
    for i in range(len(ts) - 1):
        for j in range(n):
            a = i * (n + 1) + j
            fs.append((a, a + 1, a + n + 2, a + n + 1))
    # uv: rond de omtrek en langs de as, in meters
    uvs = []
    langs = 0.0
    for i, ring in enumerate(ringen):
        if i:
            langs += sum((ring[j] - ringen[i - 1][j]).length for j in range(n)) / n
        rond = 0.0
        for j, p in enumerate(ring):
            if j:
                rond += (p - ring[j - 1]).length
            uvs.append((rond, langs))
    ob = maak(naam, [tuple(p) for p in vs], fs, uvs, mat)
    if dicht:
        pass
    return ob


def recht(as_punt, as_richting):
    a, r = Vector(as_punt), Vector(as_richting).normalized()
    return lambda t, th: (a + r * t, r)


def staand(x, y, z_van):
    """Een staande as door (x, y): t is de hoogte, of z_van(t, hoek) geeft de hoogte."""
    return lambda t, th: (Vector((x, y, z_van(t, th))), Vector((0, 0, -1)))


def bak_mod(ob):
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps))
    ob.modifiers.clear()
    oud = ob.data
    ob.data = me
    bpy.data.meshes.remove(oud)
    return ob


def dik(ob, d, offset=1):
    s = ob.modifiers.new('dik', 'SOLIDIFY')
    s.thickness = d
    s.offset = offset
    return ob


# ---------------------------------------------------------------- materialen erbij

def mat_wapenrok(z_riem, z_zoom=0.0):
    """Van voren blauw met een brede gele baan in het midden, van de kraag tot de zoom; op de rok smaller. Op de rug
    gevierendeeld (vel 01, en beeld.md, "De referentie, onderdeel voor onderdeel")."""
    k = Knopen('wapenrok')
    p = k.plek()
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], p)
    x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    boven = k.glad(z, z_riem - 0.004, z_riem + 0.004)
    breed = k.w('ADD', 0.075, k.w('MULTIPLY', boven, 0.035))
    baan = k.glad(k.w('SUBTRACT', k.w('ABSOLUTE', k.w('ADD', x, 0.015)), breed), 0.003, -0.003)
    rechts = k.glad(x, 0.003, -0.003)
    kwartier = k.w('ABSOLUTE', k.w('SUBTRACT', rechts, k.w('SUBTRACT', 1.0, boven)))
    achter = k.glad(y, 0.0, 0.03)
    f = k.w('ADD', k.w('MULTIPLY', baan, k.w('SUBTRACT', 1.0, achter)), k.w('MULTIPLY', kwartier, achter))
    kl = k.meng(f, lin('#14245a'), lin('#df9a1c'))
    v = k.ruis(7, 2)
    kl = k.meng(k.glad(v, 0.35, 0.65, 0, 0.3), kl, (0, 0, 0, 1))
    kl = k.meng(k.w('MULTIPLY', k.glad(z, z_zoom + 0.06, z_zoom), k.glad(k.ruis(30, 3), 0.3, 0.6, 0.35, 0.7)), kl, lin('#3a2a1c'))
    w = k.ruis(240, 2)
    k.bobbel(w, 0.25, 0.0012)
    k.bsdf.inputs['Sheen Weight'].default_value = 0.3
    return k.af(kl, ruw=0.92, holte=0.4)


def mat_laars():
    """Warm bruin leer, met een donkere zool."""
    k = Knopen('laars')
    r = k.ruis(18, 5)
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    kl = k.meng(k.glad(r, 0.3, 0.75, 0, 0.4), lin('#7c4828'), lin('#2e1609'))
    kl = k.meng(k.glad(sep.outputs['Z'], 0.016, 0.012), kl, lin('#1e120c'))
    k.bobbel(r, 0.35, 0.002)
    return k.af(kl, ruw=0.5)


def mat_blad():
    """Het staal van het blad, met roestspikkels."""
    k = Knopen('blad')
    vlek = k.ruis(60, 3)
    kl = k.meng(k.glad(vlek, 0.66, 0.72, 0, 0.7), lin('#b4b1ba'), lin('#7a3a20'))
    k.bobbel(vlek, 0.2, 0.001)
    return k.af(kl, ruw=k.w('ADD', 0.3, k.w('MULTIPLY', k.glad(vlek, 0.6, 0.7), 0.4)), metaal=1.0, holte=0.2)


def mat_malien():
    """Maliën: rijen ringen (acht millimeter), elke rij een halve ring verschoven, met donkere gaten ertussen."""
    k = Knopen('malien')
    uvn = k.n('ShaderNodeUVMap', uv_map='uv')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.nt.links.new(uvn.outputs['UV'], sep.inputs[0])
    dx, dy = 0.013, 0.009

    def ring(ox, oy):
        x = k.w('ADD', k.w('DIVIDE', sep.outputs['X'], dx), ox)
        y = k.w('ADD', k.w('DIVIDE', sep.outputs['Y'], dy), oy)
        fx = k.w('SUBTRACT', k.w('FRACT', x), 0.5)
        fy = k.w('MULTIPLY', k.w('SUBTRACT', k.w('FRACT', y), 0.5), dy / dx * 1.4)
        d = k.w('SQRT', k.w('ADD', k.w('MULTIPLY', fx, fx), k.w('MULTIPLY', fy, fy)))
        return k.glad(k.w('ABSOLUTE', k.w('SUBTRACT', d, 0.36)), 0.13, 0.03)

    ringen = k.w('MAXIMUM', ring(0.0, 0.0), ring(0.5, 0.5))
    kl = k.meng(ringen, lin('#1c1714'), lin('#86766a'))
    k.bobbel(ringen, 0.9, 0.0025)
    return k.af(kl, ruw=0.42, metaal=0.9, holte=0.5)


def mat_staal(naam='staal', kleur='#9aa0a8', ruw=0.32):
    k = Knopen(naam)
    kras = k.ruis(160, 3, rek=(1, 6, 1))
    vlek = k.ruis(9, 3)
    r = k.w('ADD', ruw, k.w('MULTIPLY', k.glad(vlek, 0.3, 0.7), 0.2))
    kl = k.meng(k.glad(vlek, 0.45, 0.75, 0, 0.35), lin(kleur), lin('#4d4a46'))
    k.bobbel(k.w('ADD', k.w('MULTIPLY', kras, 0.3), k.w('MULTIPLY', vlek, 0.6)), 0.25, 0.002)
    return k.af(kl, ruw=r, metaal=1.0, holte=0.3)


def mat_hout():
    k = Knopen('hout')
    nerf = k.ruis(4, 4, rek=(40, 40, 1.2))
    kl = k.meng(k.glad(nerf, 0.35, 0.7), lin('#4a2412'), lin('#7a4422'))
    k.bobbel(nerf, 0.25, 0.002)
    return k.af(kl, ruw=0.55)


def mat_haar():
    m = bpy.data.materials.new('haar')
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    uit = nt.nodes.new('ShaderNodeOutputMaterial')
    h = nt.nodes.new('ShaderNodeBsdfHairPrincipled')
    h.parametrization = 'MELANIN'
    h.inputs['Melanin'].default_value = 0.62
    h.inputs['Melanin Redness'].default_value = 0.3
    h.inputs['Random Color'].default_value = 0.8  # grijze spikkels
    h.inputs['Roughness'].default_value = 0.45
    nt.links.new(h.outputs[0], uit.inputs['Surface'])
    return m


# ---------------------------------------------------------------- de delen

def baard(lijf, rig, M):
    """Baard, snor en wenkbrauwen van echt haar (particle hair), op plekken van het gezicht die het skelet aanwijst."""
    bpy.context.view_layer.update()
    pos = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    oogL, oogR = pos('eye.L'), pos('eye.R')
    mond = pos('oris01')
    kin = pos('special04')
    hoofd = pos('head')
    z_oog = (oogL.z + oogR.z) / 2
    y_mid = hoofd.y + 0.005
    gb, gs, gw = (lijf.vertex_groups.new(name=n) for n in ('baard', 'snor', 'brauw'))
    for v in lijf.data.vertices:
        p = v.co
        if p.z < kin.z - 0.03 or p.z > z_oog + 0.05 or p.y > y_mid + 0.02:
            continue
        lip = abs(p.x) < 0.028 and mond.z - 0.014 < p.z < mond.z + 0.006 and p.y < mond.y + 0.012
        if p.z < mond.z - 0.004 and p.y < y_mid and not lip:
            gb.add([v.index], 1.0, 'REPLACE')
        elif abs(p.x) > 0.03 and p.z < mond.z + 0.026 + (abs(p.x) - 0.03) * 0.8 and p.y < y_mid:
            gb.add([v.index], 1.0, 'REPLACE')  # de wangen en de bakkebaarden
        elif abs(p.x) < 0.055 and mond.z + 0.004 < p.z < mond.z + 0.03 and p.y < mond.y + 0.014:
            gs.add([v.index], 1.0, 'REPLACE')
        for o in (oogL, oogR):
            if o.z + 0.017 < p.z < o.z + 0.034 and abs(p.x - o.x) < 0.028 and p.y < o.y + 0.006:
                gw.add([v.index], 1.0, 'REPLACE')
    lijf.data.materials.append(M['haar'])
    slot = len(lijf.data.materials)
    for naam, groep, n, lengte, omlaag in (('baard', 'baard', 40000, 0.015, -0.5), ('snor', 'snor', 7000, 0.016, -1.1),
                                            ('brauw', 'brauw', 2500, 0.009, 0.0)):
        md = lijf.modifiers.new(naam, 'PARTICLE_SYSTEM')
        ps = md.particle_system
        st = ps.settings
        st.type = 'HAIR'
        st.count = n
        st.hair_length = lengte
        st.emit_from = 'FACE'
        st.use_advanced_hair = True
        # met de geavanceerde instellingen geven de snelheden de richting én de lengte (in meters): wat uit de huid, en omlaag
        f = lengte / 8  # gemeten: het haar wordt zo'n acht keer de snelheid lang
        st.normal_factor = f * 0.5
        st.object_align_factor = (0.0, -f * 0.25, f * omlaag) if naam != 'brauw' else (0.0, -f * 0.3, f * 0.5)
        st.child_type = 'INTERPOLATED'
        st.rendered_child_count = 6
        st.child_percent = 3
        st.clump_factor = 0.55
        st.roughness_2 = 0.004
        st.root_radius = 0.6
        st.tip_radius = 0.0
        st.radius_scale = 0.0008
        st.material = slot
        ps.vertex_group_density = groep
        ps.seed = 7


def kruin(lijf):
    return max(v.co.z for v in lijf.data.vertices) + 0.045


def helm(lijf, rig, M):
    """De ketelhoed: een hoge ronde koepel van vier delen (een kam van voor naar achter met een korte punt bovenop, en naden
    aan weerszijden), een rand zo'n anderhalf keer zo breed die wat zakt. Hoog genoeg dat je onder de rand de ogen ziet."""
    hoofd = [v.co for v in lijf.data.vertices if v.co.z > (rig.matrix_world @ rig.pose.bones['head'].head).z + 0.01]
    xs, ys, zs = [p.x for p in hoofd], [p.y for p in hoofd], [p.z for p in hoofd]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    hx, hy, top = (max(xs) - min(xs)) / 2, (max(ys) - min(ys)) / 2, max(zs)
    oog = rig.matrix_world @ rig.pose.bones['eye.L'].head
    zb = oog.z + 0.06 * INSTELLINGEN['hoofd']
    rx, ry = hx + 0.03, hy + 0.026
    hoog = max(top - zb + 0.04, rx * 1.1)
    delen = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=(cx, cy, zb))
    k = bpy.context.active_object
    k.scale = (rx, ry, hoog)
    bm = bmesh.new()
    bm.from_mesh(k.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.01], context='VERTS')
    bm.to_mesh(k.data)
    bm.free()
    zacht(k)
    delen.append(bak_mod(k))
    # de rand, wat naar beneden, met een opgerolde zoom
    vs, fs = [], []
    n = 96
    ringen = ((1.0, 0.0), (1.1, -0.005), (1.21, -0.013), (1.32, -0.026))
    for f, dz in ringen:
        for j in range(n):
            th = 2 * math.pi * j / n
            vs.append((cx + rx * f * math.cos(th), cy + ry * f * math.sin(th), zb + dz))
    for i in range(len(ringen) - 1):
        for j in range(n):
            a = i * n + j
            fs.append((a, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    r = maak('rand', vs, fs)
    dik(r, 0.005)
    delen.append(bak_mod(r))
    bpy.ops.mesh.primitive_torus_add(major_radius=rx * 1.32, minor_radius=0.005, major_segments=96, minor_segments=12,
                                     location=(cx, cy, zb - 0.026))
    t = bpy.context.active_object
    t.scale = (1, ry / rx, 1)
    zacht(t)
    delen.append(bak_mod(t))
    # de kam van voor naar achter, en de naden aan weerszijden (smaller), elk een smalle ribbe over de koepel
    for hoek, dikte, hoger in ((0, 0.012, 0.008), (32, 0.005, 0.003), (-32, 0.005, 0.003)):
        a = math.radians(hoek)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=(cx, cy, zb))
        rib = bpy.context.active_object
        rib.scale = (dikte, ry + hoger, hoog + hoger)
        rib.rotation_euler = (0, 0, a)
        bm = bmesh.new()
        bm.from_mesh(rib.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 0.0], context='VERTS')
        bm.to_mesh(rib.data)
        bm.free()
        zacht(rib)
        delen.append(bak_mod(rib))
    # de korte punt bovenop
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.016, radius2=0.004, depth=0.035, location=(cx, cy, zb + hoog + 0.012))
    zacht(bpy.context.active_object)
    delen.append(bpy.context.active_object)
    for o in delen:
        o.data.materials.clear()
        o.data.materials.append(M['helm'])
        o.visible_shadow = False  # het gezicht blijft leesbaar, zoals een schilder het doet
    return delen


def maliekap(lijf, rig, M):
    """De maliënkap onder de helm: langs de wangen, over de oren en het achterhoofd, tot de kraag; het gezicht met de baard
    blijft vrij."""
    hoofdbot = rig.matrix_world @ rig.pose.bones['head'].head
    kin = rig.matrix_world @ rig.pose.bones['special04'].head
    oog = rig.matrix_world @ rig.pose.bones['eye.L'].head
    hoofd = [v.co for v in lijf.data.vertices if v.co.z > hoofdbot.z - 0.05]
    cy = (min(p.y for p in hoofd) + max(p.y for p in hoofd)) / 2
    bvh = bvh_van([(lijf, [v.co.z > hoofdbot.z - 0.12 for v in lijf.data.vertices])])
    zb = oog.z + 0.06 * INSTELLINGEN['hoofd']
    z_onder = kin.z - 0.02
    ts = [i / 16 for i in range(17)]
    k = koker('kap', bvh, staand(0, cy, lambda t, th: zb - t * (zb - z_onder)), ts, lambda t, th: 0.016, n=96,
              mat=M['malien'], ver=0.4)
    # het gezicht vrij: voor tot zo'n zestig graden opzij
    bm = bmesh.new()
    bm.from_mesh(k.data)
    weg = []
    for f in bm.faces:
        c = f.calc_center_median()
        hoek = math.degrees(math.atan2(c.x, -(c.y - cy)))
        if abs(hoek) < 62:
            weg.append(f)
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bm.to_mesh(k.data)
    bm.free()
    dik(k, 0.006)
    return k


def wapenrok(lijf, rig, mouwen, M, z_riem):
    """Het lijf van de wapenrok (van de nek tot de riem, op de romp), en de rok die eronder valt (stofsimulatie)."""
    arm = gewicht(lijf, ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'))
    romp = bvh_van([(lijf, [a < 0.25 for a in arm])])
    nek = rig.matrix_world @ rig.pose.bones['neck01'].head
    cy = nek.y + 0.01
    kin = rig.matrix_world @ rig.pose.bones['special04'].head
    z_top = min(nek.z - 0.035, kin.z - 0.04)
    lijfje = koker('wapenrok-lijf', romp, staand(0, cy, lambda t, th: z_top - t * (z_top - z_riem + 0.02)),
                   [i / 24 for i in range(25)], lambda t, th: 0.026 + 0.008 * t, n=96, mat=M['wapenrok'])
    # de stof valt recht van de borst naar beneden: per kolom nooit smaller dan erboven (vanaf de schouders)
    me = lijfje.data
    kol = 97
    for j in range(kol):
        verst = 0.0
        for i in range(25):
            v = me.vertices[i * kol + j]
            d = Vector((v.co.x, v.co.y - cy, 0))
            r = d.length
            if i >= 6:
                if r < verst * 0.985:
                    v.co.x, v.co.y = (d.normalized() * verst * 0.985 + Vector((0, cy, 0))).xy
                    r = verst * 0.985
            verst = max(verst, r)
    dik(lijfje, 0.005)
    # de rok: recht van de heupen naar beneden, wat wijder naar de zoom, met lange verticale plooien (zoals op vel 01; de
    # stofsimulatie liet hem onderaan als een zak doorhangen)
    knie = (rig.matrix_world @ rig.pose.bones['lowerleg01.L'].head).z
    z_zoom = knie + 0.05
    ts = [i / 24 for i in range(25)]
    hoogte = lambda t, th: z_riem + 0.01 - t * (z_riem + 0.01 - z_zoom)
    plooi = lambda t, th: 0.03 + 0.03 * t + (0.004 + 0.008 * t) * math.sin(7 * th + 0.6) + 0.003 * t * math.sin(13 * th + 2.1)
    rok = koker('wapenrok-rok', romp, staand(0, cy, hoogte), ts, plooi, n=128, mat=M['wapenrok'])
    me = rok.data
    kol = 129
    for j in range(kol):
        verst = 0.0
        for i in range(len(ts)):
            v = me.vertices[i * kol + j]
            d = Vector((v.co.x, v.co.y - cy, 0))
            r = d.length
            if r < verst:
                th = math.pi + 2 * math.pi * j / 128
                r = verst + plooi(ts[i], th) - plooi(ts[i - 1], th)
                v.co.x, v.co.y = (d.normalized() * r + Vector((0, cy, 0))).xy
            verst = max(verst, r)
    zacht(rok)
    dik(rok, 0.005)
    return [lijfje, rok]


def riem_en_hangers(bvh, cy, z_riem, M):
    """De brede roodbruine riem met een grote rechthoekige gesp, en aan beide heupen een smalle hanger: rechts een schede
    met een beslagen punt, links een riempje met een klein beslag."""
    delen = []
    riem = koker('riem', bvh, staand(0, cy, lambda t, th: z_riem + 0.026 - t * 0.052), [0, 0.5, 1],
                 lambda t, th: 0.012, n=128, mat=M['riem'])
    dik(riem, 0.006)
    delen.append(riem)
    voor = straal(bvh, Vector((0, cy, z_riem)), Vector((0, -1, 0))) + 0.018
    for naam, plek, maat, mat in (('gesp', (0, cy - voor, z_riem), (0.07, 0.012, 0.062), M['staal']),
                                  ('gesp-gat', (0, cy - voor - 0.004, z_riem), (0.044, 0.01, 0.038), M['riem']),
                                  ('tong', (0.012, cy - voor - 0.007, z_riem), (0.026, 0.006, 0.03), M['omslag'])):
        bpy.ops.mesh.primitive_cube_add(size=1, location=plek, scale=maat)
        o = bpy.context.active_object
        b = o.modifiers.new('rand', 'BEVEL')
        b.width = min(maat) * 0.35
        b.segments = 3
        o.data.materials.append(mat)
        delen.append(bak_mod(o))
    for x, naam in ((-1, 'schede'), (1, 'hanger')):
        d = Vector((0.86 * x, -0.5, 0)).normalized()
        r = straal(bvh, Vector((0, cy, z_riem - 0.05)), d) + 0.02
        c = Vector((0, cy, 0)) + d * r
        draai = math.atan2(d.y, d.x) + math.pi / 2
        stukken = ((('lus', 0.0, (0.04, 0.02, 0.07), M['riem']), ('schede', -0.11, (0.042, 0.026, 0.17), M['schede']),
                    ('punt', -0.2, (0.046, 0.03, 0.026), M['staal'])) if naam == 'schede' else
                   (('lus', 0.0, (0.03, 0.018, 0.07), M['riem']), ('hanger', -0.08, (0.028, 0.012, 0.13), M['riem']),
                    ('beslag', -0.05, (0.018, 0.016, 0.018), M['staal'])))
        for nm, dz, maat, mat in stukken:
            bpy.ops.mesh.primitive_cube_add(size=1, location=(c.x, c.y, z_riem + dz), rotation=(math.radians(-6), 0, draai), scale=maat)
            o = bpy.context.active_object
            b = o.modifiers.new('rand', 'BEVEL')
            b.width = min(maat) * 0.35
            b.segments = 3
            o.data.materials.append(mat)
            delen.append(bak_mod(o))
    return delen


def kraag(lijf, rig, mouwen, lijfje, M):
    """De maliënkraag: om de nek, onder de kin en de baard, en als een cape over de schouders."""
    arm = gewicht(lijf, ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'))
    bvh = bvh_van([(lijf, [a < 0.2 for a in arm]), (lijfje, None)])
    nek = rig.matrix_world @ rig.pose.bones['neck02'].head
    kin = rig.matrix_world @ rig.pose.bones['special04'].head
    hoofd = rig.matrix_world @ rig.pose.bones['head'].head

    def z(t, th):
        voor = max(0.0, math.cos(th)) ** 1.5  # 1 recht voor, 0 opzij en achter
        boven = (hoofd.z + 0.03) - voor * (hoofd.z + 0.03 - (kin.z + 0.012))
        onder = nek.z - 0.09 - 0.04 * voor
        return boven - t * (boven - onder)
    k = koker('kraag', bvh, staand(0, nek.y + 0.015, z), [i / 22 for i in range(23)], lambda t, th: 0.014 + 0.045 * math.sin(math.pi * min(1.0, t * 1.1)) ** 0.6,
              n=128, mat=M['malien'])
    dik(k, 0.006)
    return k


def smelt(naam, delen, voxel, glad_n, mat):
    """Delen samensmelten tot een gladde huid (voxel remesh)."""
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
    sm.factor = 0.7
    sm.iterations = glad_n
    bak_mod(ob)
    ob.data.materials.append(mat)
    zacht(ob)
    return ob


def laarzen(lijf, rig, M):
    """Korte laarzen tot onder de knie: een schacht om het onderbeen en een voet met een ronde dikke neus, samengesmolten,
    de zool vlak en donker; een omgeslagen rand, en om de enkel een riempje met een gespje aan de buitenkant."""
    delen = []
    for k, s in (('L', 1), ('R', -1)):
        been = gewicht(lijf, ('lowerleg', 'foot', 'toe'))
        kies = [b > 0.4 and v.co.x * s > 0 for b, v in zip(been, lijf.data.vertices)]
        bvh = bvh_van([(lijf, kies)])
        kn = rig.matrix_world @ rig.pose.bones[f'lowerleg01.{k}'].head
        en = rig.matrix_world @ rig.pose.bones[f'lowerleg02.{k}'].tail
        as_ = (en - kn).normalized()
        x1 = Vector((0, -1, 0)) - as_ * as_.dot(Vector((0, -1, 0)))
        x1.normalize()
        y1 = as_.cross(x1)

        def gem(c):
            rs = [straal(bvh, c, x1 * math.cos(t) + y1 * math.sin(t), 0.2) for t in [i * math.pi / 8 for i in range(16)]]
            rs = [r for r in rs if r is not None]
            return sum(rs) / len(rs) if rs else 0.06
        z_top = kn.z - 0.035
        boven = kn + as_ * (kn.z - z_top) / as_.dot(Vector((0, 0, -1)))
        r_boven, r_enkel = gem(boven) + 0.018, gem(en + as_ * -0.015) + 0.016
        d = en - boven
        bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=r_boven, radius2=r_enkel, depth=d.length, location=(boven + en) / 2,
                                        rotation=Vector((0, 0, 1)).rotation_difference(-d).to_euler())
        stukken = [bpy.context.active_object]
        voet = [v.co for v, b in zip(lijf.data.vertices, been) if b > 0.4 and v.co.x * s > 0 and v.co.z < 0.08]
        teen = min(voet, key=lambda q: q.y)
        hiel = max(voet, key=lambda q: q.y)
        breed = max(q.x for q in voet) - min(q.x for q in voet)
        lengte = (Vector((teen.x, teen.y, 0)) - Vector((hiel.x, hiel.y, 0))).length
        richting = (Vector((teen.x - hiel.x, teen.y - hiel.y, 0))).normalized()
        midden = Vector((hiel.x, hiel.y, 0.05)) + richting * lengte * 0.5
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=midden,
                                             rotation=(0, 0, math.atan2(richting.y, richting.x) + math.pi / 2))
        e = bpy.context.active_object
        e.scale = (breed / 2 + 0.013, lengte / 2 + 0.013, 0.055)
        stukken.append(e)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=breed / 2 + 0.008,
                                             location=Vector((teen.x, teen.y, 0.04)) - richting * 0.012)
        neus = bpy.context.active_object
        neus.scale = (1, 1, 0.85)
        stukken.append(neus)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=r_enkel + 0.006, location=en + Vector((0, 0.012, -0.012)))
        stukken.append(bpy.context.active_object)
        laars = smelt('laars.' + k, stukken, 0.004, 6, M['laars'])
        for v in laars.data.vertices:
            v.co.z = max(v.co.z, 0.0)  # de zool vlak
        delen.append(laars)
        lb = bvh_van([(laars, None)])
        o = koker('omslag.' + k, lb, lambda t, th, boven=boven, as_=as_: (boven + as_ * (0.004 + 0.055 * t), as_), [0, 0.3, 1],
                  lambda t, th: 0.004 + 0.012 * t, n=64, mat=M['omslag'], ver=0.2)
        dik(o, 0.005)
        delen.append(o)
        # het riempje om de enkel, met een gespje aan de buitenkant
        enkel = en + as_ * -0.03
        r = koker('enkelriem.' + k, lb, lambda t, th, enkel=enkel, as_=as_: (enkel + as_ * 0.02 * t, as_), [0, 1],
                  lambda t, th: 0.004, n=64, mat=M['omslag'], ver=0.2)
        dik(r, 0.004)
        delen.append(r)
        buiten = Vector((s, -0.35, 0)).normalized()
        rb = straal(lb, enkel + as_ * 0.01, buiten, 0.2) or 0.06
        bpy.ops.mesh.primitive_cube_add(size=1, location=enkel + as_ * 0.01 + buiten * (rb + 0.008), scale=(0.016, 0.006, 0.02),
                                        rotation=(0, 0, math.atan2(buiten.y, buiten.x) + math.pi / 2))
        g = bpy.context.active_object
        g.data.materials.append(M['staal'])
        delen.append(g)
    return delen


def armstukken(rig, mouwen, M):
    """Een breed armstuk van donker leer over elke onderarm, boven en onder een lichtere band met klinknagels."""
    delen = []
    bvh = bvh_van([(mouwen, None)])
    for k in ('L', 'R'):
        a = rig.matrix_world @ rig.pose.bones[f'lowerarm01.{k}'].head
        b = rig.matrix_world @ rig.pose.bones[f'lowerarm02.{k}'].tail
        as_ = (b - a).normalized()
        L = (b - a).length
        p = lambda t, th, a=a, as_=as_, L=L: (a + as_ * L * (0.3 + 0.62 * t), as_)
        st = koker('armstuk.' + k, bvh, p, [i / 8 for i in range(9)], lambda t, th: 0.005 + 0.004 * t, n=64, mat=M['armstuk'], ver=0.2)
        dik(st, 0.005)
        delen.append(st)
        for t0 in (0.0, 0.93):
            q = lambda t, th, t0=t0: p(t0 + t * 0.07, th)
            r = koker('armrand.' + k, bvh, q, [0, 1], lambda t, th, t0=t0: 0.012 + 0.004 * t0, n=64, mat=M['armrand'], ver=0.2)
            dik(r, 0.004)
            delen.append(r)
            # klinknagels rond de band
            c, _ = q(0.5, 0)
            x1 = Vector((0, -1, 0)) - as_ * as_.dot(Vector((0, -1, 0)))
            x1.normalize()
            y1 = as_.cross(x1)
            for i in range(10):
                h = 2 * math.pi * i / 10
                dvec = x1 * math.cos(h) + y1 * math.sin(h)
                rr = straal(bvh, c, dvec, 0.2)
                if rr is None:
                    continue
                bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.0035,
                                                     location=c + dvec * (rr + 0.012 + 0.004 * t0 + 0.004))
                n = bpy.context.active_object
                n.data.materials.append(M['staal'])
                delen.append(n)
    return delen


def kappen(lijf, rig, M):
    """De kap van de handschoen: een wijde rand van de pols over het eind van de mouw."""
    delen = []
    hand = gewicht(lijf, ('wrist', 'finger', 'metacarpal', 'lowerarm02'))
    bvh = bvh_van([(lijf, [h > 0.3 for h in hand])])
    for k in ('L', 'R'):
        w = rig.matrix_world @ rig.pose.bones[f'wrist.{k}'].head
        a = rig.matrix_world @ rig.pose.bones[f'lowerarm02.{k}'].head
        as_ = (w - a).normalized()
        kap = koker('kap.' + k, bvh, lambda t, th, w=w, as_=as_: (w - as_ * (0.075 - 0.08 * t), as_), [0, 0.5, 1],
                    lambda t, th: 0.02 - 0.012 * t, n=64, mat=M['handschoen'], ver=0.15)
        dik(kap, 0.004)
        delen.append(kap)
    return delen


def speer(rig, M, kruin):
    """De speer staat rechtop in de rechtervuist, zo'n 1,18 keer zo lang als de man (vel 01): een donkere schacht, bovenaan
    een koker met koord omwonden, en een blad als een ruit met afgeronde zijden en een middenrib, met roestspikkels."""
    pb = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    vuist = (pb('finger3-1.R') + pb('finger3-3.R') + pb('wrist.R')) / 3
    x, y = vuist.x, vuist.y
    L = kruin * 1.18
    delen = []

    def cil(naam, z0, z1, r, mat, seg=24):
        bpy.ops.mesh.primitive_cylinder_add(vertices=seg, radius=r, depth=z1 - z0, location=(x, y, (z0 + z1) / 2))
        o = bpy.context.active_object
        zacht(o)
        o.data.materials.append(mat)
        delen.append(o)
    z_koker, z_blad = L * (1 - 0.16 * INSTELLINGEN['speer']), L * (1 - 0.1 * INSTELLINGEN['speer'])
    ov = INSTELLINGEN['speer'] ** 0.5
    cil('schacht', 0.02, z_koker + 0.01, 0.016 * ov, M['hout'])
    cil('koker', z_koker, z_blad + 0.005, 0.017 * ov, M['staal'])
    for i in range(7):  # het koord, zeven slagen
        bpy.ops.mesh.primitive_torus_add(major_radius=0.0185 * ov, minor_radius=0.004 * ov, location=(x, y, z_koker + 0.008 + i * (z_blad - z_koker - 0.014) / 6))
        o = bpy.context.active_object
        zacht(o)
        o.data.materials.append(M['koord'])
        delen.append(o)
    n = 24
    vs, fs = [], []
    for i in range(n + 1):
        t = i / n
        w = 0.026 * INSTELLINGEN['speer'] * math.sin(math.pi * min(1.0, t ** 0.8)) ** 0.8 * (1 - t) ** 0.25 + 0.0004
        d = 0.006 * INSTELLINGEN['speer'] * (1 - t) + 0.0005
        z = z_blad + (L - z_blad) * t
        for px, py in ((w, 0), (0, d), (-w, 0), (0, -d)):
            vs.append((x + px, y + py, z))
    for i in range(n):
        for j in range(4):
            a = i * 4 + j
            fs.append((a, i * 4 + (j + 1) % 4, (i + 1) * 4 + (j + 1) % 4, (i + 1) * 4 + j))
    delen.append(maak('blad', vs, fs, mat=M['blad']))
    delen[-1].data.polygons.foreach_set('use_smooth', [False] * len(delen[-1].data.polygons))
    return delen


def bouw():
    sc = scene()
    lijf, rig = mens()
    vingers(rig, {'L': math.radians(55), 'R': math.radians(75)}, {'L': math.radians(25), 'R': math.radians(35)})
    lijf_b = bak(lijf, 'lijf')
    bpy.data.objects.remove(lijf)
    riem_z = (rig.matrix_world @ rig.pose.bones['spine03'].head).z + 0.02
    M = {
        'huid': mat_huid(),
        'hozen': mat_stof('hozen', '#1c2038', 30, 0.3),
        'wambuis': mat_stof('wambuis', '#5e2f1c', 20, 0.15),
        'handschoen': mat_leer('handschoen', '#6a4632', '#2e1a10'),
        'oog': mat_oog(),
        'haar': mat_haar(),
        'wapenrok': mat_wapenrok(riem_z, (rig.matrix_world @ rig.pose.bones['lowerleg01.L'].head).z + 0.05),
        'malien': mat_malien(),
        'helm': mat_staal('helm', '#9c99a4', 0.42),
        'staal': mat_staal('staal', '#a3a8b0', 0.28),
        'hout': mat_hout(),
        'riem': mat_leer('riem', '#793a28', '#3a160c'),
        'leer': mat_leer('leer', '#5a3418'),
        'laars': mat_laars(),
        'omslag': mat_leer('omslag', '#7c4c2a', '#3e2412'),
        'armstuk': mat_leer('armstuk', '#4d3730', '#1e1410'),
        'armrand': mat_leer('armrand', '#6e4c36', '#2e1e14'),
        'schede': mat_leer('schede', '#8a4630', '#2e120a'),
        'koord': mat_leer('koord', '#9a5a2a', '#4a2410'),
        'blad': mat_blad(),
    }
    me = lijf_b.data
    for k in ('huid', 'hozen', 'handschoen', 'wambuis'):
        me.materials.append(M[k])
    been = gewicht(lijf_b, ('upperleg', 'lowerleg', 'foot', 'toe', 'pelvis'))
    hand = gewicht(lijf_b, ('wrist', 'finger', 'metacarpal'))
    z_nek = (rig.matrix_world @ rig.pose.bones['neck01'].head).z - 0.02
    for p in me.polygons:
        vs = p.vertices
        if sum(hand[i] for i in vs) / len(vs) > 0.4:
            p.material_index = 2
        elif sum(been[i] for i in vs) / len(vs) > 0.5:
            p.material_index = 1
        elif p.center.z < z_nek:
            p.material_index = 3  # onder de kleren het wambuis: waar iets openvalt, zie je geen bloot vel
    zacht(lijf_b)
    mouwen = wambuis(lijf_b, rig, M['wambuis'])
    handen = gewicht(lijf_b, ('wrist', 'finger', 'metacarpal'))
    uit_huid('handschoenen', lijf_b, [h > 0.5 for h in handen], 0.007, M['handschoen'], sub=1)
    for ob in wapenrok(lijf_b, rig, mouwen, M, riem_z):
        pass
    lijfje = bpy.data.objects['wapenrok-lijf']
    rok = bpy.data.objects['wapenrok-rok']
    nek = rig.matrix_world @ rig.pose.bones['neck01'].head
    riem_en_hangers(bvh_van([(lijfje, None), (rok, None)]), nek.y + 0.01, riem_z, M)
    kraag(lijf_b, rig, mouwen, lijfje, M)
    helm(lijf_b, rig, M)
    laarzen(lijf_b, rig, M)
    armstukken(rig, mouwen, M)
    kappen(lijf_b, rig, M)
    speer(rig, M, kruin(lijf_b))
    baard(lijf_b, rig, M)
    maliekap(lijf_b, rig, M)
    sub = lijf_b.modifiers.new('sub', 'SUBSURF')
    sub.levels = sub.render_levels = 1
    lijf_b.modifiers.move(len(lijf_b.modifiers) - 1, 0)  # eerst gladder, dan het haar
    # de ogen
    for k in ('L', 'R'):
        c = rig.matrix_world @ rig.pose.bones[f'eye.{k}'].head
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.0125 * INSTELLINGEN['hoofd'], location=c)
        o = bpy.context.active_object
        o.name = 'oog.' + k
        o.data.materials.append(M['oog'])
        zacht(o)
    rig.hide_render = True
    kol = bpy.data.collections.new('zonder-lijnen')
    sc.collection.children.link(kol)
    for ob in [lijf_b] + [o for o in sc.collection.objects if o.name.startswith('oog.')]:
        if ob.name in sc.collection.objects:
            kol.objects.link(ob)
            sc.collection.objects.unlink(ob)
    ls = sc.view_layers[0].freestyle_settings.linesets[0]
    ls.select_by_collection = True
    ls.collection = kol
    ls.collection_negation = 'EXCLUSIVE'
    return sc


def main():
    os.makedirs(UIT, exist_ok=True)
    sc = bouw()
    if BLEND:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'speerman-hd.blend'))
    sc.render.filepath = os.path.join(UIT, 'staan-Z-spel-mens.png' if SPEL else 'staan-Z-hd-mens.png')
    bpy.ops.render.render(write_still=True)


main()
