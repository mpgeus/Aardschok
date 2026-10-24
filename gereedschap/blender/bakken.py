# Vel 01 in een textuur op het model gebakken (vraag 190; ontwerp/beeld.md, "Uitvouwen en bakken"). Marcel, 24 okt:
# "kunnen we de uv niet unwrappen en in blender inbrengen als mesh", en "vouw het model uit en bak de verf van vel 01 in een
# textuur op de mesh, eerst met Z, ZW en W (en gespiegeld voor de andere kant), en laat het zien in Z, ZW, W en een paar
# loopbeelden."
#
# Het model van speerman_hd.py (zonder de speer) wordt één mesh met een echte UV-kaart (uitgevouwen). Elke richting van
# vel 01, gebogen op het model (verf.cjs: render/verf-<richting>.png), kleurt de plekken die hij het best ziet: per punt
# een gewicht naar de hoek met de camera, en nul als iets anders ervoor zit. Dat samen wordt in één textuur gebakken
# (render/atlas.png). Daarna hangt de mesh aan het skelet (de staande houding wordt de rusthouding, de gewichten komen van
# het lijf van MakeHuman), en lopen de beelden mee.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/bakken.py -- <map>
#   ... -- <map> richting ZW [draag generator]   per richting, zonder mengen: alleen de verf van ZW, staan en acht
#                                                loopbeelden; de speer gedragen zoals in DRAGEN
import bpy
import math
import numpy as np
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import speerman_hd as sh  # noqa: E402

from mathutils import Matrix, Vector  # noqa: E402
from mathutils.kdtree import KDTree  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402

UIT = sh.UIT
VERF = ['Z', 'ZW', 'W', 'ZO', 'O']  # de richtingen met verf (ZO en O gespiegeld)
ATLAS = 4096
MACHT = 3  # hoe sterk een richting voorgaat als hij een plek rechter ziet
# Smaller dan het model, zodat hij op spelmaat de maat van de generator heeft (Marcel, 24 okt; gemeten op ZW: borst en rok
# 7 procent te breed, de laarzen bijna 30): het lijf maal SMAL, naar de voeten toe aflopend tot SMAL_VOET.
SMAL, SMAL_VOET = 0.9, 0.8
LEUN = math.radians(8)  # zo ver hangt hij bij het lopen naar voren
STAP = 0.3  # hoe ver de dij naar voren en naar achteren zwaait (radialen)
DRAAI = math.radians(12)  # het bovenlijf gedraaid bij het dragen: de rechterschouder naar voren, zoals bij de generator
ZICHT = (0.2, 0.45)  # de hoek met de camera (cosinus) waarbinnen de verf overgaat in de verf ernaast


def actief(ob):
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob


def aan_de_heup(ob, z_knie):
    """Hangt dit deel aan het bekken in plaats van aan het dichtste punt van het lijf? De rok, de riem, en wat aan de riem
    hangt (de gesp, de tas, de schede: blokken boven de knie). Marcel, 24 okt: "de rok aan de heupen in plaats van de dijen"
    (aan de dijen scheurde hij tussen de benen)."""
    if ob.name.startswith(('wapenrok-rok', 'riem')):
        return True
    if ob.name.startswith('Cube'):
        zs = [(ob.matrix_world @ v.co).z for v in ob.data.vertices]
        return sum(zs) / len(zs) > z_knie
    return False


def een_mesh(sc):
    """Alle delen behalve de speer en de grond als één mesh, met de modifiers erin (zonder het haar). Wat aan de heup hangt,
    krijgt het kenmerk 'heup'."""
    rig = [o for o in sc.objects if o.type == 'ARMATURE'][0]
    z_knie = (rig.matrix_world @ rig.pose.bones['lowerleg01.L'].head).z
    delen = []
    for ob in list(sc.objects):
        if ob.type != 'MESH' or ob.name.startswith('speer.') or ob.name == 'grond':
            continue
        for md in list(ob.modifiers):
            if md.type == 'PARTICLE_SYSTEM':
                ob.modifiers.remove(md)
        kopie = ob.copy()
        kopie.data = ob.data.copy()
        sc.collection.objects.link(kopie)
        sh.bak_mod(kopie)
        kopie.data.transform(kopie.matrix_world)
        kopie.matrix_world = Matrix.Identity(4)
        kopie.parent = None
        kopie.vertex_groups.clear()
        heup = kopie.data.attributes.new('heup', 'FLOAT', 'POINT')
        heup.data.foreach_set('value', [1.0 if aan_de_heup(ob, z_knie) else 0.0] * len(kopie.data.vertices))
        # wat aan de arm vastzit, volgt alleen de arm (het armstuk hing dicht bij de heup en bleef anders achter als de arm
        # naar voren ging)
        arm = kopie.data.attributes.new('arm', 'FLOAT', 'POINT')
        aan_arm = ob.name.startswith(('armstuk', 'armrand', 'kap.', 'handschoenen', 'wambuis', 'nagel'))
        arm.data.foreach_set('value', [1.0 if aan_arm else 0.0] * len(kopie.data.vertices))
        delen.append(kopie)
        ob.hide_render = True
        ob.hide_viewport = True
    bpy.ops.object.select_all(action='DESELECT')
    for d in delen:
        d.select_set(True)
    bpy.context.view_layer.objects.active = delen[0]
    bpy.ops.object.join()
    pop = bpy.context.active_object
    pop.name = 'pop'
    return pop


def uitvouwen(pop):
    me = pop.data
    laag = me.uv_layers.new(name='atlas')
    me.uv_layers.active = laag
    actief(pop)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.002)
    bpy.ops.object.mode_set(mode='OBJECT')


def per_richting(sc, pop, richtingen=VERF):
    """Per richting een UV-kaart uit zijn camera en een gewicht per punt (de hoek met de camera, nul als iets ervoor zit)."""
    cam = sc.camera
    m0 = cam.matrix_world.copy()
    me = pop.data
    # wat ervoor zit: het model zelf en de speer (anders krijgt de wapenrok achter de speer de verf van de speer)
    bvh = sh.bvh_van([(pop, None)] + [(o, None) for o in sc.objects if o.name.startswith('speer.')])
    ns = [v.normal.copy() for v in me.vertices]
    for r in richtingen:
        cam.matrix_world = Matrix.Rotation(math.radians(sh.RICHTINGEN[r]), 4, 'Z') @ m0
        bpy.context.view_layer.update()
        naar_cam = (cam.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()  # de camera kijkt langs -z
        plek = [world_to_camera_view(sc, cam, v.co) for v in me.vertices]
        uv = me.uv_layers.new(name=f'proj-{r}')
        for lp in me.loops:
            q = plek[lp.vertex_index]
            uv.data[lp.index].uv = (q.x, q.y)
        g = me.attributes.new(f'w-{r}', 'FLOAT', 'POINT')
        bedekt_a = me.attributes.new(f'b-{r}', 'FLOAT', 'POINT')
        w, bedekt = [], []
        for v, n in zip(me.vertices, ns):
            h = n.dot(naar_cam)
            if h <= 0.05:
                w.append(0.0)
                bedekt.append(0.0)
                continue
            hit = bvh.ray_cast(v.co + n * 0.003, naar_cam, 10.0)
            w.append(0.0 if hit[0] is not None else h ** MACHT)
            bedekt.append(1.0 if hit[0] is not None else 0.0)
        g.data.foreach_set('value', w)
        bedekt_a.data.foreach_set('value', bedekt)
        print('RICHTING', r, 'zichtbaar', sum(1 for x in w if x > 0), 'van', len(w))
    cam.matrix_world = m0
    if 'atlas' in me.uv_layers:
        me.uv_layers.active = me.uv_layers['atlas']


def bakmateriaal(pop):
    """De verf van alle richtingen, gewogen; met het doelbeeld (de atlas) als actieve knoop om in te bakken."""
    k = sh.Knopen('verf-bakken')
    k.nt.nodes.remove(k.bsdf)
    som, gewicht = None, None
    for r in VERF:
        uv = k.n('ShaderNodeUVMap', uv_map=f'proj-{r}')
        tex = k.n('ShaderNodeTexImage', image=bpy.data.images.load(os.path.join(UIT, f'verf-{r}.png')), interpolation='Linear', extension='EXTEND')
        k.nt.links.new(uv.outputs['UV'], tex.inputs['Vector'])
        at = k.n('ShaderNodeAttribute', attribute_type='GEOMETRY', attribute_name=f'w-{r}')
        # alleen waar die richting verf heeft (alfa), anders telt hij niet mee
        wr = k.w('MULTIPLY', at.outputs['Fac'], tex.outputs['Alpha'])
        bijdrage = k.n('ShaderNodeVectorMath', operation='SCALE')
        k.nt.links.new(tex.outputs['Color'], bijdrage.inputs[0])
        k.zet(bijdrage.inputs['Scale'], wr)
        if som is None:
            som, gewicht = bijdrage.outputs[0], wr
        else:
            opt = k.n('ShaderNodeVectorMath', operation='ADD')
            k.nt.links.new(som, opt.inputs[0])
            k.nt.links.new(bijdrage.outputs[0], opt.inputs[1])
            som = opt.outputs[0]
            gewicht = k.w('ADD', gewicht, wr)
    deel = k.n('ShaderNodeVectorMath', operation='SCALE')
    k.nt.links.new(som, deel.inputs[0])
    k.zet(deel.inputs['Scale'], k.w('DIVIDE', 1.0, k.w('MAXIMUM', gewicht, 1e-4)))
    em = k.n('ShaderNodeEmission')
    k.nt.links.new(deel.outputs[0], em.inputs['Color'])
    k.nt.links.new(em.outputs[0], k.uit.inputs['Surface'])
    atlas = bpy.data.images.new('atlas', ATLAS, ATLAS, alpha=False)
    doel = k.n('ShaderNodeTexImage', image=atlas)
    k.nt.nodes.active = doel
    pop.data.materials.clear()
    pop.data.materials.append(k.m)
    return atlas


def bak(sc, pop, atlas):
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 16
    sc.render.bake.margin = 8
    actief(pop)
    bpy.ops.object.bake(type='EMIT', use_clear=True)
    atlas.filepath_raw = os.path.join(UIT, 'atlas.png')
    atlas.file_format = 'PNG'
    atlas.save()


def eindmateriaal(pop, atlas):
    """De gebakken atlas, onbelicht (het licht zit in de verf)."""
    k = sh.Knopen('gebakken')
    k.nt.nodes.remove(k.bsdf)
    uv = k.n('ShaderNodeUVMap', uv_map='atlas')
    tex = k.n('ShaderNodeTexImage', image=atlas, interpolation='Linear')
    k.nt.links.new(uv.outputs['UV'], tex.inputs['Vector'])
    em = k.n('ShaderNodeEmission')
    k.nt.links.new(tex.outputs['Color'], em.inputs['Color'])
    k.nt.links.new(em.outputs[0], k.uit.inputs['Surface'])
    pop.data.materials.clear()
    pop.data.materials.append(k.m)


def aan_het_skelet(sc, pop, rig):
    """De staande houding wordt de rusthouding; de gewichten van het dichtstbijzijnde punt van het lijf; de speer aan de
    rechterhand."""
    lijf = bpy.data.objects['lijf']
    actief(rig)
    rig.hide_viewport = False
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    kd = KDTree(len(lijf.data.vertices))
    for v in lijf.data.vertices:
        kd.insert(lijf.matrix_world @ v.co, v.index)
    kd.balance()
    namen = {g.index: g.name for g in lijf.vertex_groups}
    # de punten van de armen (en handen) van het lijf, voor wat aan de arm vastzit
    armgroepen = {g.index for g in lijf.vertex_groups if g.name.startswith(('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'))}
    armpunten = [v for v in lijf.data.vertices if sum(g.weight for g in v.groups if g.group in armgroepen) > 0.5]
    kd_arm = KDTree(len(armpunten))
    for v in armpunten:
        kd_arm.insert(lijf.matrix_world @ v.co, v.index)
    kd_arm.balance()
    aan_arm = [0.0] * len(pop.data.vertices)
    if 'arm' in pop.data.attributes:
        pop.data.attributes['arm'].data.foreach_get('value', aan_arm)
    groepen = {}
    rig.data.bones['spine05'].use_deform = True
    heup = [0.0] * len(pop.data.vertices)
    if 'heup' in pop.data.attributes:
        pop.data.attributes['heup'].data.foreach_get('value', heup)
    bekken = pop.vertex_groups.new(name='spine05')
    groepen['spine05'] = bekken
    for v in pop.data.vertices:
        if heup[v.index] > 0.5:
            bekken.add([v.index], 1.0, 'REPLACE')
            continue
        _, i, _ = (kd_arm if aan_arm[v.index] > 0.5 else kd).find(v.co)
        for g in lijf.data.vertices[i].groups:
            if g.weight < 1e-3 or namen[g.group] not in rig.data.bones:
                continue
            naam = namen[g.group]
            if naam not in groepen:
                groepen[naam] = pop.vertex_groups.new(name=naam)
            groepen[naam].add([v.index], g.weight, 'REPLACE')
    md = pop.modifiers.new('skelet', 'ARMATURE')
    md.object = rig
    bpy.context.view_layer.update()
    for ob in sc.objects:
        if ob.name.startswith('speer.'):
            m = ob.matrix_world.copy()
            ob.parent = rig
            ob.parent_type = 'BONE'
            ob.parent_bone = 'wrist.R'
            bpy.context.view_layer.update()
            ob.matrix_world = m


def draai(rig, bot, hoek, as_='X'):
    """Een bot draaien om een as van het skelet (X: voor- of achterover, Z: om zijn lengte), om zijn kop; bij een bot dat al
    gedraaid is, komt het erbij."""
    pb = rig.pose.bones[bot]
    R = pb.bone.matrix_local.to_3x3()
    pb.rotation_mode = 'QUATERNION'
    erbij = (R.inverted() @ Matrix.Rotation(hoek, 3, as_) @ R).to_quaternion()
    pb.rotation_quaternion = pb.rotation_quaternion @ erbij


def loop(rig, i, n, draagt=False):
    """Beeld i van n van een loopcyclus op de plaats (vooruit is -y). Met draagt houden de armen de speer schuin (IK, zie
    draag_schuin) en zwaait de linkerarm niet."""
    for pb in rig.pose.bones:
        pb.rotation_mode = 'QUATERNION'
        pb.rotation_quaternion = (1, 0, 0, 0)
        pb.location = (0, 0, 0)
    f = 2 * math.pi * i / n
    for k, fase in (('L', 0.0), ('R', math.pi)):
        g = f + fase
        # kleine stappen (een gedrongen man), de voet vlak op de grond; bij het neerzetten de teen wat omhoog, bij het afzetten
        # de hiel (Marcel: "voeten ziet er nog raar uit": de voet kantelde mee met de knie en wipte achteruit omhoog)
        dij = -STAP * math.sin(g)
        knie = 0.08 + 0.55 * max(0.0, math.cos(g)) ** 1.5
        draai(rig, f'upperleg01.{k}', dij)
        draai(rig, f'lowerleg01.{k}', knie)
        draai(rig, f'foot.{k}', -(dij + knie) - 0.15 * max(0.0, math.sin(g)) ** 2 + 0.3 * max(0.0, -math.sin(g)) ** 3)
    # de linkerarm zwaait weinig (Marcel: "de linkerarm minder zwaaien"): wat hij naar voren laat zien, staat niet in de verf
    if not draagt:
        draai(rig, 'upperarm01.L', 0.1 * math.sin(f))
        draai(rig, 'lowerarm01.L', -0.05 - 0.05 * max(0.0, -math.sin(f)))
    # naar voren hangen (Marcel: "de soldaat moet eigenlijk ook iets naar voren 'hangen' als hij loopt"): het bovenlijf vanaf
    # de taille voorover, het hoofd wat terug zodat hij vooruit blijft kijken; de rok en de riem hangen aan het bekken
    draai(rig, 'spine04', LEUN * 0.7)  # om x: positief kantelt de top naar -y, naar voren
    draai(rig, 'spine02', LEUN * 0.3)
    draai(rig, 'head', -LEUN * 0.5)
    if draagt:
        # het bovenlijf gedraaid (om z: positief brengt zijn rechterschouder, op -x, naar voren), het hoofd half terug
        # (Marcel: "ik heb ook het idee dat de rechter schouder uit de generator verder naar voren staat")
        draai(rig, 'spine02', DRAAI * 0.5, 'Z')
        draai(rig, 'spine01', DRAAI * 0.5, 'Z')
        draai(rig, 'head', -DRAAI * 0.5, 'Z')
    rig.location.z = rig['z0'] - 0.02 * abs(math.sin(f))
    bpy.context.view_layer.update()


def geschilderd(naam, hoek, banden, roest=False):
    """Een materiaal in vaste tonen, zoals een pixeltekenaar het zet en zoals de verf op het lijf: licht, midden en donker
    naar de hoek met het licht (van linksboven op het scherm, dus met de camera meegedraaid), onbelicht gerenderd."""
    k = sh.Knopen(naam)
    k.nt.nodes.remove(k.bsdf)
    geo = k.n('ShaderNodeNewGeometry')
    licht = Matrix.Rotation(math.radians(hoek), 3, 'Z') @ sh.LICHT
    dot = k.n('ShaderNodeVectorMath', operation='DOT_PRODUCT')
    k.nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    dot.inputs[1].default_value = licht
    ramp = k.n('ShaderNodeValToRGB')
    cr = ramp.color_ramp
    cr.interpolation = 'CONSTANT'
    for i, (pos, kleur) in enumerate(banden):
        e = cr.elements[i] if i < len(cr.elements) else cr.elements.new(pos)
        e.position = pos
        e.color = sh.lin(kleur)
    k.nt.links.new(dot.outputs['Value'], ramp.inputs['Fac'])
    kleur = ramp.outputs['Color']
    if roest:
        kleur = k.meng(k.glad(k.ruis(45, 3), 0.66, 0.7), kleur, sh.lin('#7a3a20'))
    em = k.n('ShaderNodeEmission')
    k.nt.links.new(kleur, em.inputs['Color'])
    k.nt.links.new(em.outputs[0], k.uit.inputs['Surface'])
    return k.m


def verf_speer(sc, r):
    """De speer in vaste tonen, met de kleuren van vel 01 (Marcel: "ook de speer zelf mag nog beter"): de dofglanzende
    schacht roodbruin, het koord koperbruin, het blad licht en donker per vlak van de ruit, met roestvlekken."""
    hoek = sh.RICHTINGEN[r]
    M = {
        'schacht': geschilderd('speer-schacht', hoek, [(0.0, '#3a1a12'), (0.15, '#603327'), (0.6, '#8a4a2c')]),
        'koker': geschilderd('speer-koker', hoek, [(0.0, '#4a2410'), (0.15, '#8a4a22'), (0.6, '#c07a3c')]),
        'koord': geschilderd('speer-koord', hoek, [(0.0, '#4a2410'), (0.15, '#8a4a22'), (0.6, '#c07a3c')]),
        'blad': geschilderd('speer-blad', hoek, [(0.0, '#4f4c5a'), (0.05, '#8e8a96'), (0.45, '#cfccd2')], roest=True),
    }
    for ob in sc.objects:
        if ob.name.startswith('speer.'):
            deel = ob.name.split('.')[1]
            ob.data.materials.clear()
            ob.data.materials.append(M.get(deel, M['koker']))


# De houding bij het lopen (Marcel, 21 okt: "Bij stilstaan 1 hand recht, lopen 2 handen en steken ook", "Bij lopen schuin";
# 24 okt: "lopen moet ook speer schuin vasthouden hadden we besproken", en "hij moet hem schuin voor zich dragen zoals in de
# generator file"). Per manier van dragen: waar elke hand zit, in meters ten opzichte van zijn schouder (+x is zijn
# linkerkant, -y voor), welke hand laag zit, en waar die de speer vasthoudt (vanaf de voet, als deel van de lengte).
# - vooruit: de rechterhand laag voor de heup, de linker ver voor het lijf: de punt schuin omhoog naar voren, de speer ver
#   voor hem uit;
# - generator en gespiegeld: dwars voor het lijf, zoals het lopen ZW van de generator: het midden van de speer voor de borst
#   ('midden', ten opzichte van het midden tussen de schouders), schuin zodat hij in ZW zo'n 40 graden ligt ('as', van de
#   lage hand naar de punt), de handen 'afstand' uit elkaar om het midden. Bij generator wijst de punt omhoog over de
#   linkerschouder (in ZW naar achteren, zoals in het vel: het gebrek van 21 okt), bij gespiegeld over de rechterschouder
#   naar voren.
DRAGEN = {
    'vooruit': {'R': (0.03, -0.12, -0.29), 'L': (-0.24, -0.30, -0.08), 'laag': 'R', 'greep': 0.12},
    'generator': {'midden': (0.0, -0.25, -0.15), 'as': (0.5, 0.5, 0.7), 'afstand': 0.26, 'laag': 'R', 'greep': 0.38},
    'gespiegeld': {'midden': (0.0, -0.25, -0.15), 'as': (-0.5, -0.5, 0.7), 'afstand': 0.26, 'laag': 'L', 'greep': 0.38},
}


def draag_schuin(sc, rig, dragen):
    """De handen met IK naar de plekken van houding B, aan de borst vast (spine01), zodat ze meeleunen."""
    bpy.context.view_layer.update()
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    doelen = {}
    if 'midden' in dragen:
        c = (W('upperarm01.R') + W('upperarm01.L')) / 2 + Vector(dragen['midden'])
        a = Vector(dragen['as']).normalized() * dragen['afstand'] / 2
        laag = dragen['laag']
        plekken = {laag: c - a, ('L' if laag == 'R' else 'R'): c + a}
    else:
        plekken = {k: W(f'upperarm01.{k}') + Vector(dragen[k]) for k in ('R', 'L')}
    for k in ('R', 'L'):
        plek = plekken[k]
        leeg = bpy.data.objects.new(f'hand.{k}', None)
        sc.collection.objects.link(leeg)
        leeg.parent = rig
        leeg.parent_type = 'BONE'
        leeg.parent_bone = 'spine01'
        bpy.context.view_layer.update()
        leeg.matrix_world = Matrix.Translation(plek)
        c = rig.pose.bones[f'lowerarm02.{k}'].constraints.new('IK')
        c.target = leeg
        c.chain_count = 4
        c.use_tail = True
        doelen[k] = leeg
    bpy.context.view_layer.update()
    return doelen


def speer_in_handen(sc, rig, lengte, dragen):
    """De speer door beide vuisten (na de IK): het punt GREEP van de speer in de rechtervuist, de punt naar de linker. Waar de
    speer nu staat, volgt uit de schacht zelf (na smal staat hij niet meer waar hij gebouwd is)."""
    bpy.context.view_layer.update()
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    vuist = {k: (W(f'finger3-1.{k}') + W(f'finger3-3.{k}') + W(f'wrist.{k}')) / 3 for k in ('R', 'L')}
    laag = dragen['laag']
    hoog = 'L' if laag == 'R' else 'R'
    as_ = (vuist[hoog] - vuist[laag]).normalized()
    if 'as' in dragen:
        # de vuisten komen niet precies op hun doel; de speer ligt langs de lijn tussen de doelen (die leunen en draaien mee)
        doel = {k: bpy.data.objects[f'hand.{k}'].matrix_world.translation for k in ('R', 'L')}
        as_ = (doel[hoog] - doel[laag]).normalized()
    schacht = bpy.data.objects['speer.schacht']
    as0 = (schacht.matrix_world.to_3x3() @ Vector((0, 0, 1))).normalized()
    voet = schacht.matrix_world.translation - as0 * schacht.dimensions.z / 2
    greep0 = voet + as0 * dragen['greep'] * lengte
    T = Matrix.Translation(vuist[laag]) @ as0.rotation_difference(as_).to_matrix().to_4x4() @ Matrix.Translation(-greep0)
    for ob in sc.objects:
        if not ob.name.startswith('speer.'):
            continue
        m = ob.matrix_world.copy()
        ob.parent = None
        ob.matrix_world = T @ m
        m = ob.matrix_world.copy()
        ob.parent = rig
        ob.parent_type = 'BONE'
        ob.parent_bone = 'spine01'
        bpy.context.view_layer.update()
        ob.matrix_world = m
    bpy.context.view_layer.update()


def render(sc, naam, hoek):
    cam = sc.camera
    m0 = cam.matrix_world.copy()
    cam.matrix_world = Matrix.Rotation(math.radians(hoek), 4, 'Z') @ m0
    sc.render.filepath = os.path.join(UIT, naam)
    bpy.ops.render.render(write_still=True)
    cam.matrix_world = m0


def vul_verborgen(sc, pop, r):
    """Wat de camera van r niet ziet (erachter, of van opzij: daar rekt de verf uit), krijgt de verf van de plekken ernaast
    (Marcel: "de verborgen delen vullen met de verf ernaast"). Per punt: hoe goed hij gezien wordt ('zicht', 0 tot 1, uit de
    hoek met de camera en of iets ervoor zit), en een kleur ('vulkleur'): waar hij gezien wordt de verf op die plek, en
    verder over de mesh doorgegeven van buur naar buur."""
    me = pop.data
    n = len(me.vertices)
    beeld = bpy.data.images.load(os.path.join(UIT, f'verf-{r}.png'))
    B, H = beeld.size
    px = np.empty(B * H * 4, dtype=np.float32)
    beeld.pixels.foreach_get(px)
    px = px.reshape(H, B, 4)
    w = np.zeros(n, dtype=np.float32)
    me.attributes[f'w-{r}'].data.foreach_get('value', w)
    h = np.power(np.maximum(w, 0), 1 / MACHT)  # de cosinus van de hoek (nul als iets ervoor zit)
    uv = np.zeros((n, 2), dtype=np.float32)
    laag = me.uv_layers[f'proj-{r}']
    lv = np.zeros(len(me.loops), dtype=np.int64)
    me.loops.foreach_get('vertex_index', lv)
    luv = np.zeros(len(me.loops) * 2, dtype=np.float32)
    laag.data.foreach_get('uv', luv)
    uv[lv] = luv.reshape(-1, 2)
    xi = np.clip((uv[:, 0] * B).astype(int), 0, B - 1)
    yi = np.clip((uv[:, 1] * H).astype(int), 0, H - 1)
    kl = px[yi, xi]
    t = np.clip((h - ZICHT[0]) / (ZICHT[1] - ZICHT[0]), 0, 1)
    zicht = (t * t * (3 - 2 * t)) * (kl[:, 3] > 0.5)
    # sRGB naar lineair: het kleurattribuut is lineair, zoals de textuur na het laden
    lin = np.where(kl[:, :3] <= 0.04045, kl[:, :3] / 12.92, ((kl[:, :3] + 0.055) / 1.055) ** 2.4)
    bekend = zicht > 0.5
    kleur = np.where(bekend[:, None], lin, 0.0)
    ev = np.zeros(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get('vertices', ev)
    ev = ev.reshape(-1, 2)
    for _ in range(400):
        a, b = ev[:, 0], ev[:, 1]
        naar_b = bekend[a] & ~bekend[b]
        naar_a = bekend[b] & ~bekend[a]
        if not (naar_b.any() or naar_a.any()):
            break
        som = np.zeros((n, 3), dtype=np.float32)
        tel = np.zeros(n, dtype=np.float32)
        np.add.at(som, b[naar_b], kleur[a[naar_b]])
        np.add.at(tel, b[naar_b], 1)
        np.add.at(som, a[naar_a], kleur[b[naar_a]])
        np.add.at(tel, a[naar_a], 1)
        nieuw = tel > 0
        kleur[nieuw] = som[nieuw] / tel[nieuw, None]
        bekend = bekend | nieuw
    print('VUL', r, 'gezien', int((zicht > 0.5).sum()), 'gevuld', int(bekend.sum()), 'van', n)
    za = me.attributes.new('zicht', 'FLOAT', 'POINT')
    za.data.foreach_set('value', zicht.astype(np.float32))
    ka = me.attributes.new('vulkleur', 'FLOAT_COLOR', 'POINT')
    ka.data.foreach_set('color', np.concatenate([kleur, np.ones((n, 1), dtype=np.float32)], axis=1).ravel())


def smal(rig, pop):
    """Het model smaller (SMAL, naar de voeten SMAL_VOET), in rust: de mesh en de botten, om de as van de man. De verf zit al
    vast (de UV's uit de camera zijn eerder gezet), dus die gaat mee."""
    z_knie = rig.data.bones['lowerleg01.L'].head_local.z + rig.location.z

    def f(z):
        t = max(0.0, min(1.0, z / z_knie))
        return SMAL_VOET + (SMAL - SMAL_VOET) * t
    for v in pop.data.vertices:
        s = f(v.co.z)
        v.co.x *= s
        v.co.y *= s
    actief(rig)
    bpy.ops.object.mode_set(mode='EDIT')
    for eb in rig.data.edit_bones:
        for kant in ('head', 'tail'):
            q = getattr(eb, kant)
            s = f(q.z + rig.location.z)
            setattr(eb, kant, Vector((q.x * s, q.y * s, q.z)))
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.context.view_layer.update()


def projectie(pop, r):
    """Alleen de verf van richting r, vanuit zijn eigen camera, onbelicht; niets gemengd. Waar de camera de plek schuin of van
    achteren ziet, de verf van ernaast (vul_verborgen); waar iets anders ervoor zat (de wapenrok achter de hangende arm, die
    vrijkomt als de arm naar voren gaat), het eigen materiaal van het model, belicht: een egale vulling gaf daar een vlakke
    beige schim. Per materiaal van het model, zodat elk deel zijn eigen materiaal houdt."""
    beeld = bpy.data.images.load(os.path.join(UIT, f'verf-{r}.png'))
    for i, oud in enumerate(list(pop.data.materials)):
        if oud is None:
            continue
        m = oud.copy()
        m.name = f'{oud.name}-verf-{r}'
        nt = m.node_tree
        uit = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL')
        eigen = uit.inputs['Surface'].links[0].from_socket
        k = sh.Knopen.__new__(sh.Knopen)
        k.m, k.nt, k.uit = m, nt, uit
        uv = k.n('ShaderNodeUVMap', uv_map=f'proj-{r}')
        tex = k.n('ShaderNodeTexImage', image=beeld, interpolation='Linear', extension='EXTEND')
        k.nt.links.new(uv.outputs['UV'], tex.inputs['Vector'])
        zicht = k.n('ShaderNodeAttribute', attribute_type='GEOMETRY', attribute_name='zicht')
        vul = k.n('ShaderNodeAttribute', attribute_type='GEOMETRY', attribute_name='vulkleur')
        bedekt = k.n('ShaderNodeAttribute', attribute_type='GEOMETRY', attribute_name=f'b-{r}')
        kleur = k.meng(zicht.outputs['Fac'], vul.outputs['Color'], tex.outputs['Color'])
        em = k.n('ShaderNodeEmission')
        k.nt.links.new(kleur, em.inputs['Color'])
        mix = k.n('ShaderNodeMixShader')
        k.nt.links.new(bedekt.outputs['Fac'], mix.inputs['Fac'])
        k.nt.links.new(em.outputs[0], mix.inputs[1])
        k.nt.links.new(eigen, mix.inputs[2])
        k.nt.links.new(mix.outputs[0], uit.inputs['Surface'])
        pop.data.materials[i] = m


def een_richting(r, n=8, draag='vooruit'):
    """Per richting projecteren, zonder mengen (Marcel, 24 okt: "lopen ZW alleen met de verf van ZW"): de verf van die
    richting op het model, staan en n loopbeelden uit die richting, naar richting-<r>-staan.png en richting-<r>-lopen-<i>.png."""
    sh.INSTELLINGEN['bladhoek'] = sh.RICHTINGEN[r]  # de brede kant van het blad naar deze camera
    sc = sh.bouw()
    rig = [o for o in sc.objects if o.type == 'ARMATURE'][0]
    lengte = sh.kruin(bpy.data.objects['lijf']) * 1.18
    pop = een_mesh(sc)
    per_richting(sc, pop, [r])
    verf_speer(sc, r)
    vul_verborgen(sc, pop, r)
    projectie(pop, r)
    sc.render.use_freestyle = False
    sc.cycles.samples = 32
    aan_het_skelet(sc, pop, rig)
    smal(rig, pop)
    rig['z0'] = rig.location.z
    render(sc, f'richting-{r}-staan.png', sh.RICHTINGEN[r])
    # lopen: de speer schuin met twee handen, in een bredere render (de speer wijst ver vooruit; de oorsprong blijft in het
    # midden, lopen.cjs rekent het anker uit de breedte)
    sc.render.resolution_x = 2400
    draag_schuin(sc, rig, DRAGEN[draag])
    loop(rig, 0, n, draagt=True)
    speer_in_handen(sc, rig, lengte, DRAGEN[draag])
    for i in range(n):
        loop(rig, i, n, draagt=True)
        render(sc, f'richting-{r}-lopen-{draag}-{i}.png', sh.RICHTINGEN[r])


def main():
    sc = sh.bouw()
    rig = [o for o in sc.objects if o.type == 'ARMATURE'][0]
    pop = een_mesh(sc)
    uitvouwen(pop)
    per_richting(sc, pop)
    atlas = bakmateriaal(pop)
    bak(sc, pop, atlas)
    eindmateriaal(pop, atlas)
    sc.render.use_freestyle = False
    sc.cycles.samples = 32
    for r in ('Z', 'ZW', 'W'):
        render(sc, f'gebakken-{r}.png', sh.RICHTINGEN[r])
    aan_het_skelet(sc, pop, rig)
    rig['z0'] = rig.location.z
    for i in (0, 2, 4, 6):
        loop(rig, i, 8)
        render(sc, f'gebakken-lopen-ZW-{i}.png', sh.RICHTINGEN['ZW'])


if 'richting' in sh.ARGS:
    een_richting(sh.ARGS[sh.ARGS.index('richting') + 1],
                 draag=sh.ARGS[sh.ARGS.index('draag') + 1] if 'draag' in sh.ARGS else 'vooruit')
else:
    main()
