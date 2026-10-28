# De kruisboogschutter (vraag 190; Marcel, 26 okt: "Ja, het voorstel voor de kruisboogschutter is goed; maak een
# proefplaat"; beeld.md, "Voorstel: de kruisboogschutter"). Hetzelfde lijf, skelet en dezelfde bewegingen als de speerman
# (speerman_hd.py, bakken.py), met wat anders is: een leren jak van huiden met een smalle tabbaard erover, een ronde
# ijzeren kalot zonder rand met een leren kap, een snor en stoppels, aan de riem een koker met bouten en een spanhaak, en
# de kruisboog schuin voor de borst in beide handen, de boog boven.
#
# kies() zet die onderdelen in de plaats van die van de speerman, vóór speerman_hd.bouw(); eigen.py doet dat met
# `kruisboog` op de opdrachtregel:
#   blender.exe -b -P gereedschap/blender/eigen.py -- <map> Z ZW W NW N NO O ZO kruisboog staan
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

import speerman_hd as sh
from speerman_hd import Knopen, lin

LADE = 0.68       # de lade, van de voorkant (bij de boog) tot het eind van de kolf (meter)
BOOG = 0.72       # de boog van punt tot punt (groter dan echt, zoals de speer: op spelmaat was hij een dun lijntje)
BOOG_PLEK = 0.07  # de boog zo ver achter de voorkant van de lade
BOOG_TERUG = 0.09  # zo ver buigen de punten van de gespannen boog naar achteren
NOOT = 0.30       # de noot, waar de gespannen pees achter zit, zo ver achter de voorkant
TABBAARD = 0.1    # de halve breedte van de tabbaard (meter): smal, het jak komt er opzij onder uit
ROK_ZOOM = 0.1    # het jak tot halverwege de dij: de zoom zo ver boven de knie
# Hoe hij de kruisboog draagt, met de boog boven (Marcel: "Hij heeft de boog ondersteboven"; met de boog omlaag stond hij
# in ZW en W bijna rechtop op zijn kop). Twee manieren, voor Marcel om uit te kiezen (`draag=schuin` of `draag=vooruit` op
# de opdrachtregel): 'schuin' voor de borst zoals je een geweer schuin voor je draagt, de boog bij de linkerschouder, de
# bovenkant van de lade naar voren; 'vooruit' vanaf de rechterheup schuin omhoog naar voren, de bovenkant boven, de boog
# dwars voor de borst. Per manier: 'dragen' voor bakken.draag_schuin ('as' van de rechter- naar de linkerhand, 'greep' vanaf
# de kolf, de rechterhand bij de trekker, de linker net achter de boog), waar de bovenkant van de lade heen wijst ('boven',
# in de wereld; de lade draait om zijn as tot zijn bovenkant zo ligt), en waar de rug van elke hand heen wijst
# (bakken.HANDRUG; Marcel: "een normaal mens heeft de bovenkant van zijn hand van zich weg. de hand zit dan voor de
# kruisboog").
GREEP = (LADE - 0.42) / LADE
DRAAGWIJZEN = {
    'schuin': {'dragen': {'midden': (0.0, -0.26, -0.24), 'as': (0.7, -0.15, 0.7), 'afstand': 0.27, 'laag': 'R', 'greep': GREEP},
               'boven': (0.0, -1.0, 0.0), 'handrug': {'R': (0.0, -1.0, 0.0), 'L': (0.0, -1.0, 0.0)}},
    'vooruit': {'dragen': {'midden': (-0.085, -0.34, -0.22), 'as': (0.48, -0.65, 0.59), 'afstand': 0.27, 'laag': 'R', 'greep': GREEP},
                'boven': (0.0, 0.0, 1.0), 'handrug': {'R': (-1.0, -0.3, 0.0), 'L': (0.5, 0.0, -1.0)}},
}
# bij het lopen over de linkerschouder, zoals een soldaat met het geweer op de schouder (Marcel: "kan hij de kruisboog
# over zn schouder dragen? en ondersteunen met de handen? als hij loopt", "linker hand moet aan onderzijde van de kruisboog
# ondersteunen. kopse kant als het ware"; gekozen uit drie: de linkerschouder): de linkerhand plat onder het eind van de
# kolf, aan dezelfde kant, de elleboog laag langs het lijf, en de rechterarm vrij, die zwaait met de pas. Over de
# rechterschouder met de linkerhand eronder moest die hand dwars voor het lijf langs, en daarvoor zijn zijn armen te kort:
# een lage elleboog kwam in zijn lijf ("zn arm zit nu in zn lijf"), een hoge stond als een exorcist. 'steun': waar de
# lade op de schouder rust (van het midden tussen de schouders); 'as': de lade, van de kolf schuin omhoog naar achteren,
# vlak, zodat de boog dwars achter het hoofd ligt (steiler kwam hij door het hoofd: de lade is kort en het hoofd groot);
# 'kolf': zo ver voor de steun ligt het eind van de kolf (langs de lade); 'elleboog': waar de IK de linkerelleboog heen
# richt (van de schouder); 'zwaai': hoe ver de rechterarm meezwaait (radialen bij een volle pas); 'dik': zo ver ligt de
# as van de lade boven de kleren (de halve lade en speling: de schouder gaat bij het lopen wat op en neer).
SCHOUDER = {'steun': (0.18, 0.02, 0.06), 'as': (0.15, 0.83, 0.52), 'kolf': 0.34, 'elleboog': (0.3, 0.2, -0.6),
            'zwaai': 0.35, 'dik': 0.05}
# de rechterarm hangt (in plaats van de speerhand op borsthoogte, speerman_hd.RECHTERHAND), wat van het lijf af
RECHTERHAND = ((-0.05, -0.25, -1.0), (-0.05, -0.2, -1.0))
RECHTERARM = 0.3
# de draagwijze van de opdrachtregel (`draag=...`, ook `schouder`); zonder: staan 'vooruit', lopen op de schouder
DRAAGWIJZE = next((a.split('=', 1)[1] for a in sh.ARGS if a.startswith('draag=')), None)
# een snor die wat hangt, en stoppels in plaats van de volle baard (speerman_hd.BAARD)
BAARD = (('baard', 'baard', 14000, 0.004, -0.4), ('snor', 'snor', 4000, 0.017, -1.6), ('brauw', 'brauw', 1200, 0.006, 0.0))
BAARD_VOL = 0.1

RIEM = sh.riem_en_hangers  # de riem van de speerman, zonder zijn schede en hanger


def kies():
    """Het model van speerman_hd wordt de kruisboogschutter: zijn onderdelen in de plaats van die van de speerman."""
    sh.mat_wambuis = mat_jak
    sh.mat_malien = lambda: mat_jak('jak-kap', '#6a4428', '#382212')  # de kap en de kraag van leer in plaats van maliën
    sh.mat_wapenrok = mat_tabbaard
    sh.mat_baardvorm = mat_stoppels
    sh.armsgat_zoom = lambda *a: None  # de smalle tabbaard komt niet bij de armsgaten
    sh.helm = kalot
    sh.speer = kruisboog
    sh.riem_en_hangers = riem_met_koker
    sh.ROK_ZOOM = ROK_ZOOM
    sh.BAARD = BAARD
    sh.BAARD_VOL = BAARD_VOL
    sh.RECHTERHAND = RECHTERHAND
    sh.INSTELLINGEN['arm'] = RECHTERARM


def in_handen(sc, rig, lopen=False):
    """De kruisboog in de handen (na smal_maken in eigen.py): bij het lopen op de schouder, bij staan in beide handen
    zoals de speer, en om zijn as gedraaid tot de bovenkant van de lade ligt zoals de draagwijze wil: hij hing tot dan aan
    de rechterpols, en lag dus gedraaid zoals die pols draaide (bij de ronde speer maakt dat niets uit)."""
    import bakken as bk
    wijze = DRAAGWIJZE or ('schouder' if lopen else 'vooruit')
    if wijze == 'schouder':
        return op_de_schouder(sc, rig, lopen)
    wijze = DRAAGWIJZEN[wijze]
    bk.HANDRUG = wijze['handrug']
    bk.draag_schuin(sc, rig, wijze['dragen'])
    bk.speer_in_handen(sc, rig, LADE, wijze['dragen'])
    a, b = sh.holte(rig, 'R'), sh.holte(rig, 'L')
    rol(sc, a, (b - a).normalized(), Vector(wijze['boven']))
    bk.speer_vast(rig)


def op_de_schouder(sc, rig, lopen):
    """De kruisboog op de linkerschouder (SCHOUDER): de linkerhand met IK onder het eind van de kolf, plat met de palm
    omhoog, aan de borst vast (spine01), zodat hij met het lijf meegaat; de kruisboog aan de borst, de rechterarm vrij."""
    import bakken as bk
    bpy.context.view_layer.update()
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    as_ = Vector(SCHOUDER['as']).normalized()
    steun = (W('upperarm01.R') + W('upperarm01.L')) / 2 + Vector(SCHOUDER['steun'])
    steun.z += boven_op(steun, as_)
    plek = steun - as_ * (SCHOUDER['kolf'] + 0.035)  # de holte van de linkerhand, net voorbij het eind van de kolf

    def aan_de_borst(naam, waar):
        leeg = bpy.data.objects.new(naam, None)
        sc.collection.objects.link(leeg)
        leeg.parent, leeg.parent_type, leeg.parent_bone = rig, 'BONE', 'spine01'
        bpy.context.view_layer.update()
        leeg.matrix_world = Matrix.Translation(waar)
        return leeg
    ik = rig.pose.bones['lowerarm02.L'].constraints.new('IK')
    ik.target = aan_de_borst('hand.L', plek)
    ik.chain_count, ik.use_tail = 4, True
    ik.pole_target = aan_de_borst('elleboog.L', W('upperarm01.L') + Vector(SCHOUDER['elleboog']))
    bpy.context.view_layer.update()
    if lopen:
        bk.BEWEGING = bk.mocap.Beweging(rig)  # de pas uit een echte opname, zoals de speerman
        loop(rig, 0)
    bk.HANDPLAT, bk.HANDRUG = {'L'}, {'L': (0.0, 0.0, -1.0)}
    bk.handen_op_speer(rig, {'L': plek}, as_, n=6, handen=('L',))
    rig['pols.L'] = list(rig.pose.bones['wrist.L'].rotation_quaternion)  # loop zet elk beeld alle botten terug
    bk.speer_in_handen(sc, rig, LADE, {'laag': 'L', 'greep': -0.035 / LADE}, richting=as_)
    rol(sc, sh.holte(rig, 'L'), as_, Vector((0.0, 0.0, 1.0)))


def boven_op(steun, as_):
    """Hoe ver de lade omhoog moet om op de schouder te liggen in plaats van erdoor (Marcel: "de kruisboog valt alleen nog
    door zn schouder"): langs de lade, 20 cm aan weerszijden van de steun, van boven gemeten waar de kleren (de pop, met
    het jak en de kraag) liggen, plus de halve dikte van de lade en wat speling voor het lopen."""
    from mathutils.bvhtree import BVHTree
    pop = bpy.data.objects['pop']
    bvh = BVHTree.FromObject(pop, bpy.context.evaluated_depsgraph_get())
    M = pop.matrix_world
    Mi, omlaag = M.inverted(), (M.inverted().to_3x3() @ Vector((0.0, 0.0, -1.0))).normalized()
    hoger = 0.0
    for i in range(-10, 11):
        p = steun + as_ * (0.02 * i)
        raak = bvh.ray_cast(Mi @ (p + Vector((0.0, 0.0, 1.0))), omlaag)[0]
        if raak is not None:
            hoger = max(hoger, (M @ raak).z + SCHOUDER['dik'] - p.z)
    print('KRUISBOOG', round(hoger, 3), 'm hoger op de schouder')
    return hoger


def loop(rig, i):
    """Beeld i van 8 van het lopen met de kruisboog op de schouder: de pas van de speerman (bakken.loop), de linkerpols
    weer plat onder de kolf, en de rechterarm die tegen de pas in zwaait (naar voren als de linkervoet voor is)."""
    import bakken as bk
    bk.loop(rig, i, 8)
    pb = rig.pose.bones
    if 'pols.L' in rig:
        pb['wrist.L'].rotation_quaternion = rig['pols.L']
    bpy.context.view_layer.update()
    voor = (rig.matrix_world @ pb['foot.R'].head).y - (rig.matrix_world @ pb['foot.L'].head).y
    bk.draai(rig, 'upperarm01.R', -SCHOUDER['zwaai'] * max(-1.0, min(1.0, voor / (2 * bk.PAS_HALF))), 'X')
    bpy.context.view_layer.update()


def rol(sc, a, as_, boven):
    """De kruisboog om de as van de lade (door punt a, langs as_) gedraaid, tot zijn bovenkant (waar de noot zit) zo dicht
    mogelijk bij `boven` ligt. Na bakken.speer_in_handen staan de meshes in de wereld."""
    bpy.context.view_layer.update()
    loodrecht = lambda v: (v - as_ * v.dot(as_)).normalized()
    noot = bpy.data.objects['speer.noot']
    c = sum((noot.matrix_world @ v.co for v in noot.data.vertices), Vector()) / len(noot.data.vertices)
    nu, doel = loodrecht(c - a), loodrecht(boven)
    hoek = math.atan2(nu.cross(doel).dot(as_), nu.dot(doel))
    D = Matrix.Translation(a) @ Matrix.Rotation(hoek, 4, as_) @ Matrix.Translation(-a)
    for ob in sc.objects:
        if ob.name.startswith('speer.'):
            ob.data.transform(ob.matrix_world.inverted() @ D @ ob.matrix_world)
    bpy.context.view_layer.update()


# ---------------------------------------------------------------- de kleren

def jak_kleur(k, licht='#8a5634', donker='#4a2c16'):
    """Het bruin van het jak: lappen huid, elk wat anders van toon, met donkere stiksels waar ze aan elkaar zitten."""
    lap = k.n('ShaderNodeTexVoronoi', feature='F1')
    k.zet(lap.inputs['Vector'], k.plek())
    lap.inputs['Scale'].default_value = 9
    toon = k.n('ShaderNodeRGBToBW')
    k.zet(toon.inputs[0], lap.outputs['Color'])
    kl = k.meng(k.glad(toon.outputs[0], 0.15, 0.85, 0.0, 0.7), lin(licht), lin(donker))
    kl = k.meng(k.glad(k.ruis(14, 4), 0.3, 0.75, 0, 0.35), kl, lin(donker))  # gevlekt, zoals echt leer
    naad = k.n('ShaderNodeTexVoronoi', feature='DISTANCE_TO_EDGE')
    k.zet(naad.inputs['Vector'], k.plek())
    naad.inputs['Scale'].default_value = 9
    return k.meng(k.glad(naad.outputs['Distance'], 0.012, 0.035, 0.75, 0.0), kl, lin('#1e1008'))


def mat_jak(naam='jak', licht='#8a5634', donker='#4a2c16'):
    """Het leren jak van huiden (de mouwen en het lijf onder de tabbaard), en met andere kleuren de kap en de kraag."""
    k = Knopen(naam)
    kl = k.met_textuur(jak_kleur(k, licht, donker), 'brown_leather', 0.5, contrast=0.55, kracht=0.8)
    return k.af(kl, ruw=0.6, holte=0.55)


def mat_tabbaard(z_riem, z_zoom=0.0):
    """De wapenrok van de speerman als jak met een smalle tabbaard voor en achter: blauw met een gele baan in het midden, in
    de kleuren van de wapenrok; opzij het leer van het jak, met schaduw langs de rand van de tabbaard, zodat die als een
    los doek erover leest. Heet 'wapenrok', zodat eigen.py hem als stof behandelt."""
    k = Knopen('wapenrok')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    x, z = sep.outputs['X'], sep.outputs['Z']
    ax = k.w('ABSOLUTE', x)
    doek = k.glad(ax, TABBAARD + 0.003, TABBAARD - 0.003)  # 1 op de tabbaard
    baan = k.glad(ax, 0.038, 0.032)  # de gele baan in het midden
    stof = k.meng(baan, lin('#2258c8'), lin('#f0a812'))
    stof = k.meng(k.glad(k.ruis(7, 2), 0.35, 0.65, 0, 0.3), stof, (0, 0, 0, 1))
    leer = k.meng(k.glad(ax, TABBAARD + 0.018, TABBAARD + 0.002, 0.0, 0.55), jak_kleur(k), lin('#140a04'))
    kl = k.meng(doek, leer, stof)
    kl = k.meng(k.w('MULTIPLY', k.glad(z, z_zoom + 0.06, z_zoom), k.glad(k.ruis(30, 3), 0.3, 0.6, 0.35, 0.7)), kl, lin('#3a2a1c'))
    kl = k.met_textuur(kl, 'rough_linen', 0.7, contrast=1.0, kracht=1.2)
    k.bsdf.inputs['Sheen Weight'].default_value = 0.3
    # alleen de tabbaard gloeit wat na, zoals de wapenrok (speerman_hd.GEEL_GLOED)
    k.zet(k.bsdf.inputs['Emission Color'], k.meng(doek, (0, 0, 0, 1), k.meng(baan, lin('#2c3c78'), lin('#ffaa14'))))
    k.bsdf.inputs['Emission Strength'].default_value = sh.GEEL_GLOED
    return k.af(kl, ruw=0.92, holte=0.65)


def kalot(lijf, rig, M):
    """De ronde ijzeren kalot zonder rand: een koepel op het hoofd, onderaan een opgerolde zoom, op de hoogte waar de kap
    begint (speerman_hd.maliekap)."""
    hoofd = [v.co for v in lijf.data.vertices if v.co.z > (rig.matrix_world @ rig.pose.bones['head'].head).z + 0.01]
    xs, ys, zs = [p.x for p in hoofd], [p.y for p in hoofd], [p.z for p in hoofd]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2 + sh.HELM_ACHTER
    rx, ry, top = (max(xs) - min(xs)) / 2 + 0.014, (max(ys) - min(ys)) / 2 + 0.014, max(zs)
    oog = rig.matrix_world @ rig.pose.bones['eye.L'].head
    zb = oog.z + sh.HELM_RAND_HOOGTE * sh.INSTELLINGEN['hoofd']
    hoog = max(top - zb + 0.012, rx * 0.9)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=(cx, cy, zb))
    k = bpy.context.active_object
    k.scale = (rx, ry, hoog)
    bm = bmesh.new()
    bm.from_mesh(k.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.01], context='VERTS')
    bm.to_mesh(k.data)
    bm.free()
    sh.zacht(k)
    delen = [sh.bak_mod(k)]
    bpy.ops.mesh.primitive_torus_add(major_radius=rx + 0.002, minor_radius=0.006, major_segments=96, minor_segments=12,
                                     location=(cx, cy, zb + 0.002))
    t = bpy.context.active_object
    t.scale = (1, (ry + 0.002) / (rx + 0.002), 1)
    sh.zacht(t)
    delen.append(sh.bak_mod(t))
    for o in delen:
        o.data.materials.clear()
        o.data.materials.append(M['helm'])
        o.visible_shadow = False  # het gezicht blijft leesbaar, zoals bij de helm
    return delen


def riem_met_koker(bvh, cy, z_riem, M):
    """De riem van de speerman, met rechts op de heup een leren koker met bouten (de veren erboven) en links voor de
    spanhaak, waarmee hij de pees spant. Alles heet riem-*, zodat het aan het bekken hangt (bakken.aan_de_heup)."""
    delen = RIEM(bvh, cy, z_riem, M, hangers=False)

    def blok(naam, plek, maat, mat, draai, kantel=-6):
        bpy.ops.mesh.primitive_cube_add(size=1, location=plek, rotation=(math.radians(kantel), 0, draai), scale=maat)
        o = bpy.context.active_object
        o.name = naam
        b = o.modifiers.new('rand', 'BEVEL')
        b.width = min(maat) * 0.3
        b.segments = 3
        o.data.materials.append(mat)
        delen.append(sh.bak_mod(o))
        return o

    veer = mat_veer()
    # de koker rechts (-x), wat naar achteren
    d = Vector((-0.9, 0.25, 0)).normalized()
    r = (sh.straal(bvh, Vector((0, cy, z_riem - 0.05)), d) or sh.straal(bvh, Vector((0, cy, z_riem)), d) or 0.16) + 0.04
    c = Vector((0, cy, 0)) + d * r
    draai = math.atan2(d.y, d.x) + math.pi / 2
    blok('riem-lus', (c.x, c.y, z_riem), (0.04, 0.02, 0.07), M['riem'], draai)
    blok('riem-koker', (c.x, c.y, z_riem - 0.08), (0.075, 0.055, 0.2), M['schede'], draai)
    blok('riem-kokerrand', (c.x, c.y, z_riem + 0.02), (0.082, 0.062, 0.022), M['riem'], draai)
    # de bouten met de punt omlaag in de koker; erboven steken de schachten en de veren uit
    for i, (dx, dy) in enumerate(((-0.02, -0.01), (0.0, 0.012), (0.02, -0.006), (0.008, -0.016))):
        u = Vector((math.cos(draai), math.sin(draai), 0))
        v = Vector((-math.sin(draai), math.cos(draai), 0))
        p = c + u * dx + v * dy
        hoog = z_riem + 0.06 + 0.012 * (i % 2)
        o = sh.staaf('riem-bout', Vector((p.x, p.y, z_riem)), Vector((p.x, p.y, hoog)), 0.004, M['hout'], seg=8)
        delen.append(o)
        blok('riem-veer', (p.x, p.y, hoog - 0.012), (0.018, 0.003, 0.03), veer, draai + 0.6 * i, kantel=0)
    # de spanhaak links voor (+x): een plaatje aan de riem met een haak eronder
    d = Vector((0.6, -0.8, 0)).normalized()
    r = (sh.straal(bvh, Vector((0, cy, z_riem)), d) or 0.16) + 0.02
    c = Vector((0, cy, 0)) + d * r
    draai = math.atan2(d.y, d.x) + math.pi / 2
    blok('riem-haakplaat', (c.x, c.y, z_riem - 0.02), (0.035, 0.008, 0.045), M['staal'], draai, kantel=0)
    onder = Vector((c.x, c.y, z_riem - 0.075))
    delen.append(sh.staaf('riem-haak', Vector((c.x, c.y, z_riem - 0.04)), onder, 0.0045, M['staal'], seg=8))
    delen.append(sh.staaf('riem-haak', onder, onder + d * 0.025 + Vector((0, 0, 0.02)), 0.0045, M['staal'], seg=8))
    return delen


def mat_stoppels():
    """De stoppels: de huid wat grauw, met fijne donkere puntjes (in plaats van de strengen van de volle baard), zodat de
    donkere snor erop leest; met de volle baard was het één donkere vlek."""
    k = Knopen('baardvorm')
    kl = k.meng(k.glad(k.ruis(700, 2), 0.42, 0.62, 0.0, 0.5), lin('#a87458'), lin('#3a2a20'))
    return k.af(kl, ruw=0.8, holte=0.3)


def mat_veer():
    k = Knopen('veer')
    kl = k.meng(k.glad(k.ruis(40, 2), 0.3, 0.7), lin('#d8d0bc'), lin('#8a7e68'))
    return k.af(kl, ruw=0.8)


# ---------------------------------------------------------------- de kruisboog

def kruisboog(rig, M, kruin=None):
    """De kruisboog, rechtop in de rechtervuist gebouwd zoals de speer (bakken.speer_in_handen legt hem daarna in beide
    handen): de lade langs z, met de kolf onderaan en de voorkant boven, met de stijgbeugel erboven, de boog dwars (x) met
    de punten naar de kolf (gespannen), de pees naar de noot, een bout op de lade, de trekker eronder. De bovenkant van de
    lade, waar de bout ligt, wijst naar voren (-y). Elk deel heet speer.*, zodat het dragen van de speer hem meeneemt; de
    lade is speer.schacht (de lengte langs z, de oorsprong in het midden, de kolf aan zijn voet). Een plek wordt gegeven
    vanaf de voorkant (z)."""
    vuist = sh.holte(rig, 'R')
    z0 = vuist.z - (LADE - 0.42)  # de kolf: de rechtervuist zit om de lade bij de trekker, zoals om de speer
    P = lambda x, y, z: Vector((vuist.x + x, vuist.y + y, z0 + LADE - z))
    delen = []

    def deel(o, naam, mat=None):
        o.name = 'speer.' + naam
        if mat:
            o.data.materials.append(mat)
        delen.append(o)
        return o

    # de lade: een balk, bovenop plat, onder de kolf dieper (naar +y)
    rijen = [(0.0, 0.026, -0.026, 0.032), (0.4, 0.026, -0.026, 0.032), (0.48, 0.028, -0.026, 0.06), (LADE, 0.03, -0.026, 0.08)]
    vs, fs = [], []
    for z, hb, yb, yo in rijen:
        for x, y in ((-hb, yb), (hb, yb), (hb, yo), (-hb, yo)):
            vs.append((x, y, LADE / 2 - z))
    for i in range(len(rijen) - 1):
        for j in range(4):
            fs.append((i * 4 + j, i * 4 + (j + 1) % 4, (i + 1) * 4 + (j + 1) % 4, (i + 1) * 4 + j))
    n = len(vs)
    fs += [(3, 2, 1, 0), (n - 4, n - 3, n - 2, n - 1)]
    lade = sh.maak('lade', vs, fs)
    lade.location = P(0, 0, LADE / 2)
    b = lade.modifiers.new('rand', 'BEVEL')
    b.width = 0.005
    b.segments = 2
    sh.bak_mod(lade)
    lade.data.polygons.foreach_set('use_smooth', [False] * len(lade.data.polygons))
    deel(lade, 'schacht', sh.mat_hout('#d8a868', '#a06c34'))  # licht hout: op spelmaat los van het bruine jak
    oorsprong = lade.data.attributes.new('oorsprong', 'FLOAT_VECTOR', 'POINT')  # de nerf langs de lade (mat_hout)
    oorsprong.data.foreach_set('vector', [c for v in lade.data.vertices for c in v.co])
    # de boog (hoorn en pees, bekleed met berkenbast: licht, zodat hij op spelmaat leest), dwars voorop, de punten naar
    # achteren
    vs, fs = [], []
    m = 24
    for i in range(m + 1):
        u = 2 * i / m - 1
        x, z = u * BOOG / 2, BOOG_PLEK + BOOG_TERUG * u * u
        dz, dy = 0.02 * (1 - 0.5 * abs(u)), 0.014 * (1 - 0.4 * abs(u))
        for px, py, pz in ((x, -0.016 - dy, z - dz), (x, -0.016 - dy, z + dz), (x, -0.016 + dy, z + dz), (x, -0.016 + dy, z - dz)):
            vs.append(tuple(P(px, py, pz)))
    for i in range(m):
        for j in range(4):
            fs.append((i * 4 + j, i * 4 + (j + 1) % 4, (i + 1) * 4 + (j + 1) % 4, (i + 1) * 4 + j))
    fs += [(3, 2, 1, 0), (m * 4, m * 4 + 1, m * 4 + 2, m * 4 + 3)]
    deel(sh.maak('boog', vs, fs), 'boog', mat_boog())
    # het koord om lade en boog
    for dz in (-0.022, 0.022):
        bpy.ops.mesh.primitive_torus_add(major_radius=0.034, minor_radius=0.006, location=P(0, 0.0, BOOG_PLEK + dz))
        o = bpy.context.active_object
        o.scale = (1.0, 1.3, 1.0)
        sh.zacht(o)
        deel(o, 'koord', M['koord'])
    # de pees, van de punten naar de noot
    noot = P(0, -0.03, NOOT)
    pees = mat_pees()
    for s in (-1, 1):
        punt = P(s * BOOG / 2 * 0.97, -0.016, BOOG_PLEK + BOOG_TERUG * 0.94)
        deel(sh.staaf('pees', punt, noot, 0.0025, pees, seg=8), 'pees')
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=0.009, location=noot)
    sh.zacht(bpy.context.active_object)
    deel(bpy.context.active_object, 'noot', M['staal'])
    # de bout op de lade, de punt voorop, de veren bij de noot
    deel(sh.staaf('bout', P(0, -0.032, NOOT - 0.015), P(0, -0.032, 0.0), 0.005, M['hout'], seg=8), 'bout')
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.008, radius2=0.0, depth=0.035, location=P(0, -0.032, -0.016),
                                    rotation=(0, 0, 0))
    deel(bpy.context.active_object, 'boutpunt', M['staal'])
    bpy.ops.mesh.primitive_cube_add(size=1, location=P(0, -0.036, NOOT - 0.04), scale=(0.022, 0.002, 0.035))
    deel(bpy.context.active_object, 'boutveer', mat_veer())
    # de stijgbeugel voorop, een ijzeren lus onder de voorkant van de lade
    bpy.ops.mesh.primitive_torus_add(major_radius=0.055, minor_radius=0.006, major_segments=48, minor_segments=8,
                                     location=P(0, -0.004, -0.04), rotation=(math.pi / 2, 0, 0))
    o = bpy.context.active_object
    o.scale = (0.8, 1.0, 1.0)
    sh.zacht(o)
    deel(o, 'beugel', M['staal'])
    # de lange trekker langs de onderkant
    deel(sh.staaf('trekker', P(0, 0.036, NOOT + 0.03), P(0, 0.056, NOOT + 0.2), 0.005, M['staal'], seg=8), 'trekker')
    return delen


def mat_pees():
    k = Knopen('koord-pees')  # 'koord': eigen.py geeft hem de zachte glans van leer
    kl = k.meng(k.glad(k.ruis(60, 2, rek=(1, 1, 8)), 0.3, 0.7), lin('#d0bc90'), lin('#7a6a48'))
    return k.af(kl, ruw=0.7)


def mat_boog():
    """De boog: hoorn en pees onder een bekleding van berkenbast, licht roomwit met donkere vlekjes, zoals de bast."""
    k = Knopen('leer-boog')  # 'leer': eigen.py geeft hem de zachte glans van leer
    kl = k.meng(k.glad(k.ruis(20, 3, rek=(6, 1, 1)), 0.55, 0.75, 0, 0.6), lin('#e2d4ae'), lin('#5a4a38'))
    return k.af(kl, ruw=0.6)
