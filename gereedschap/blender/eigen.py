# Proef (a) van vraag 190 (ontwerp/beeld.md, "Proef (a)"): de speerman uit het 3D-model met zijn eigen kleuren, als vel
# voor het spel. Marcel: "we proberen de proef die de andere sessie doorgaf" (via de sessie van de GLB: "staan en lopen in
# acht richtingen met de eigen gebakken kleuren, licht bijgesteld voor spelmaat, en in het spel naast de generator").
#
# Het model van speerman_hd.py, niet de verf van vel 01: zijn eigen materialen, mat gemaakt zoals de GLB (ruwheid 0,75, geen
# bump, het staal metaal 0,7), de baard echt haar. Het lijf blijft een eigen deel (met het haar) aan het skelet; de kleren
# worden een mesh zoals in bakken.py. Smaller met de schaal van het skelet (de maat van de generator op spelmaat). Het
# licht draait per richting met de camera mee: een zachte zon van linksboven, licht van voren onder de helmrand, wat feller
# en meer contrast. Staan met de speer rechtop, lopen met de speer schuin voor het lijf zoals de generator.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/eigen.py -- <map> Z ZW [staan]
# naar <map>/eigen-<richting>-staan.png en eigen-<richting>-lopen-<i>.png; de plaat: node gereedschap/blender/eigen.cjs
import bpy
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import speerman_hd as sh  # noqa: E402
import bakken as bk  # noqa: E402

from mathutils import Matrix  # noqa: E402

UIT = sh.UIT
RICHTINGEN = [a for a in sh.ARGS[1:] if a in sh.RICHTINGEN] or ['Z', 'ZW']
# isometrisch (Marcel: "Ik wil ook de poppetjes in isometrisch zien"): de camera op 30 graden zoals de wereld, in plaats
# van de 15 van de generator (beeld.md, "Wat het verschil maakte"); de beelden krijgen -iso in hun naam
ISO = '-iso' if 'iso' in sh.ARGS else ''
if ISO:
    sh.INSTELLINGEN['camera'] = 30
# gemeten tegen staan Z van de generator (kleurmeting op spelmaat, 24 okt): ons model was per stof 8 tot 18 punten lichter
# (Lab) en vlakker, dus een stop donkerder, minder vullicht en lucht (diepere schaduwkant), en de zon meer van opzij, zodat
# de plooien en de ruiten schaduw geven
LICHT = {'zonhoek': 8, 'zon': 5.0, 'vul': 0.9, 'lucht': 0.35, 'belichting': 0.4, 'look': 'Medium High Contrast',
         'zonrichting': (-0.82, -0.32, 0.48)}
# proeven met het licht (Marcel: "En de schaduwen in het origineel zijn ook beter. Op de kleding etc. Dat maakt alles veel
# dieper en echter"): -- <map> lichtproef rendert alleen staan Z in een paar standen, naar eigen-licht-<naam>.png
LICHTPROEF = {
    'nu': {},
    'dieper': {'zon': 5.0, 'zonhoek': 6, 'vul': 0.8, 'lucht': 0.3, 'belichting': 0.35},
    'diepst': {'zon': 5.5, 'zonhoek': 4, 'vul': 0.4, 'lucht': 0.15, 'belichting': 0.5},
    'schaduw': {'zon': 5.0, 'zonhoek': 6, 'vul': 0.8, 'lucht': 0.3, 'belichting': 0.35, 'holte': (0.12, 0.3)},
}
BREED = 0.9  # het skelet (en alles eraan) zo smal: de breedte van de generator op spelmaat
STAP = 0.38  # iets grotere stappen dan in de proef met de verf: de voeten in ZW vielen bijna over elkaar


# Per soort materiaal hoe het licht erop valt (Marcel: "kan de kleding nog wat meer stoffiger gerenderd worden? Het ziet er
# nog wat te plastic uit", en "Ook wat schaduw op de helm?"): stof helemaal mat, zonder glans maar met een zachte, wollige
# rand in het licht (sheen) en het matte licht van ruwe stof (diffuse roughness); leer met een lichte glans; het staal glanst
# (metaal toont zijn vorm door wat het weerspiegelt: de lucht met een verloop, licht_voor_spelmaat).
STOF = ('wapenrok', 'wambuis', 'hozen')
LEER = ('riem', 'leer', 'laars', 'omslag', 'armstuk', 'armrand', 'schede', 'handschoen', 'koord')
STAAL = ('helm', 'staal')
SOORTEN = {
    'stof': {'Roughness': 1.0, 'Specular IOR Level': 0.12, 'Sheen Weight': 0.55, 'Sheen Roughness': 0.6, 'Diffuse Roughness': 1.0,
             'Metallic': 0.0},
    'leer': {'Roughness': 0.48, 'Specular IOR Level': 0.45, 'Metallic': 0.0},  # leer met een zachte glans, geen klei
    'staal': {'Roughness': 0.42, 'Metallic': 0.9},
    'anders': {'Roughness': 0.75},
}


def soort_van(m):
    naam = m.name.split('.')[0]
    for soort, namen in (('stof', STOF), ('leer', LEER), ('staal', STAAL)):
        if naam.startswith(namen):
            return soort
    return 'anders'


def mat_maken():
    """Alle materialen zonder lak en fijne bobbels, per soort (SOORTEN): stof mat met sheen, leer licht glanzend, staal
    glanzend; de rest mat zoals de GLB (ruwheid 0,75, metaal hooguit 0,7)."""
    for m in bpy.data.materials:
        if not m.node_tree or m.get('glans'):
            continue  # de maliën houden hun glans
        nt = m.node_tree
        for n in nt.nodes:
            if n.type != 'BSDF_PRINCIPLED':
                continue
            for naam in ('Roughness', 'Normal', 'Metallic', 'Coat Weight'):
                if naam == 'Roughness' and soort_van(m) == 'staal':
                    continue  # het staal houdt zijn ruwheid uit de textuur: blank en mat door elkaar, geen plastic
                for link in list(n.inputs[naam].links):
                    # het reliëf van een textuur (een normal map onder de bobbel) blijft; de fijne bobbels gaan eraf
                    if naam == 'Normal' and link.from_node.type == 'BUMP' and link.from_node.inputs['Normal'].links:
                        nt.links.new(link.from_node.inputs['Normal'].links[0].from_socket, n.inputs['Normal'])
                        continue
                    if naam == 'Normal' and link.from_node.type == 'NORMAL_MAP':
                        continue
                    nt.links.remove(link)
            n.inputs['Metallic'].default_value = min(n.inputs['Metallic'].default_value, 0.7)
            n.inputs['Coat Weight'].default_value = 0.0
            for invoer, waarde in SOORTEN[soort_van(m)].items():
                if invoer in n.inputs:
                    n.inputs[invoer].default_value = waarde
            # de wollige rand in de kleur van de stof zelf, niet wit (dan werden de donkerblauwe hozen grijs)
            if soort_van(m) == 'stof' and n.inputs['Base Color'].links and 'Sheen Tint' in n.inputs:
                nt.links.new(n.inputs['Base Color'].links[0].from_socket, n.inputs['Sheen Tint'])


def holtes(afstand, diepte):
    """Diepere schaduw in de holtes (de AO van de materialen): niet meer alleen binnen een deel, zodat de kraag, de riem en de
    armen schaduw geven op wat eronder ligt, en verder en donkerder."""
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        for n in m.node_tree.nodes:
            if n.type != 'AMBIENT_OCCLUSION':
                continue
            n.only_local = False
            n.inputs['Distance'].default_value = afstand
            for link in n.outputs['AO'].links:
                if link.to_node.type == 'MAP_RANGE':
                    link.to_node.inputs['To Min'].default_value = 1 - diepte


def lucht_met_verloop(sc):
    """De lucht licht boven en donker onder (de grond): de onderkant van de helm en de rand worden donker, de bovenkant licht,
    zoals op vel 01."""
    nt = sc.world.node_tree
    if nt.nodes.get('verloop'):
        return
    bg = nt.nodes['Background']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.name = 'verloop'
    mr.interpolation_type = 'SMOOTHSTEP'
    nt.links.new(sep.outputs['Z'], mr.inputs['Value'])
    mr.inputs['From Min'].default_value, mr.inputs['From Max'].default_value = -0.15, 0.55
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nt.links.new(mr.outputs['Result'], mix.inputs[0])
    kl = [x for x in mix.inputs if x.type == 'RGBA']
    kl[0].default_value = (0.05, 0.045, 0.04, 1)       # de grond
    kl[1].default_value = (0.62, 0.68, 0.8, 1)        # de lucht
    nt.links.new([x for x in mix.outputs if x.type == 'RGBA'][0], bg.inputs['Color'])


def licht_voor_spelmaat(sc):
    if 'zonrichting' in LICHT:
        from mathutils import Vector
        bpy.data.objects['zon'].rotation_euler = Vector(LICHT['zonrichting']).normalized().to_track_quat('Z', 'Y').to_euler()
        bpy.context.view_layer.update()
    zon = bpy.data.objects['zon'].data
    zon.energy = LICHT['zon']
    zon.angle = math.radians(LICHT['zonhoek'])
    bpy.data.objects['vul'].data.energy = LICHT['vul']
    lucht_met_verloop(sc)
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = LICHT['lucht']
    sc.view_settings.exposure = LICHT['belichting']
    sc.view_settings.look = LICHT['look']
    sc.render.use_freestyle = False
    sc.cycles.samples = 48


def render(sc, naam, hoek, lichten):
    """De camera en het licht samen om de man gedraaid: het licht komt op het scherm altijd van linksboven."""
    cam = sc.camera
    m0 = cam.matrix_world.copy()
    R = Matrix.Rotation(math.radians(hoek), 4, 'Z')
    cam.matrix_world = R @ m0
    for ob, m in lichten.items():
        ob.matrix_world = R @ m
    sc.render.filepath = os.path.join(UIT, naam)
    bpy.ops.render.render(write_still=True)
    cam.matrix_world = m0
    for ob, m in lichten.items():
        ob.matrix_world = m


def smal_maken(sc, rig):
    """Het skelet smaller (BREED), en de speer, die los staat, rechtop door de holte van de vuist waar die nu is (het binden
    aan het skelet en het smaller maken verschuiven de hand; de speer stond ernaast; Marcel: "Rechter hand ook niet heel
    goed om de speer")."""
    rig.scale = (BREED, BREED, 1.0)
    bpy.context.view_layer.update()
    mis = sh.holte(rig, 'R') - bpy.data.objects['speer.schacht'].matrix_world.translation
    mis.z = 0.0
    for ob in sc.objects:
        if ob.name.startswith('speer.'):
            ob.matrix_world = Matrix.Translation(mis) @ ob.matrix_world  # in de wereld: hij hangt aan de pols
    bpy.context.view_layer.update()


def lichtproef():
    sc = sh.bouw()
    mat_maken()
    rig = [o for o in sc.objects if o.type == 'ARMATURE'][0]
    smal_maken(sc, rig)
    lichten = {bpy.data.objects[n]: bpy.data.objects[n].matrix_world.copy() for n in ('zon', 'rand', 'vul')}
    basis = dict(LICHT)
    for naam, anders in LICHTPROEF.items():
        LICHT.clear()
        LICHT.update(basis, **anders)
        if 'holte' in LICHT:
            holtes(*LICHT['holte'])
        licht_voor_spelmaat(sc)
        render(sc, f'eigen-licht-{naam}.png', sh.RICHTINGEN['Z'], lichten)


def plek_vast():
    """De patronen op de plek waar elk punt zat toen het model af was (het kenmerk 'oorsprong', bakken.py,
    oorsprong_vast), niet op de plek nu: anders schuiven ze over de stof als die beweegt. Niet voor het haar (dat zijn
    deeltjes zonder dat kenmerk)."""
    for m in bpy.data.materials:
        if not m.node_tree or m.name.startswith('haar'):
            continue
        nt = m.node_tree
        for n in list(nt.nodes):
            if n.type != 'TEX_COORD' or not n.outputs['Object'].links:
                continue
            at = nt.nodes.new('ShaderNodeAttribute')
            at.attribute_name = 'oorsprong'
            for link in list(n.outputs['Object'].links):
                nt.links.new(at.outputs['Vector'], link.to_socket)


SUB = 3  # stappen van de stof per beeld: een beeld is een achtste seconde, de stof rekent op 24 per seconde


def met_stof(sc, rig, zet, beelden, naam, lichten, rondes=1, rust=8):
    """De beweging afspelen met de rok als stof (bakken.py, rok_als_stof): eerst `rust` stappen stilstaan in de eerste
    houding (de stof valt), dan `rondes` keer de `beelden` in tussenstappen, en in de laatste ronde elk beeld renderen in
    alle richtingen. zet(t) zet de houding op tijd t (in beelden)."""
    rok = bpy.data.objects['wapenrok-rok']
    bk.nieuwe_stof(rok)
    totaal = rust + rondes * beelden * SUB
    for stap in range(totaal + 1):
        t = max(0, stap - rust) / SUB
        zet(t)
        sc.frame_set(stap + 1)
        if stap >= rust + (rondes - 1) * beelden * SUB and (stap - rust) % SUB == 0 and t < rondes * beelden:
            i = int(round(t)) % beelden
            for r in RICHTINGEN:
                render(sc, naam(r, i), sh.RICHTINGEN[r], lichten)


def main():
    if 'lichtproef' in sh.ARGS:
        return lichtproef()
    sc = sh.bouw()
    rig = [o for o in sc.objects if o.type == 'ARMATURE'][0]
    lijf = bpy.data.objects['lijf']
    bk.oorsprong_vast(sc)
    # de kleren als een mesh (zonder het lijf: dat houdt zijn haar; en zonder de rok: die wordt stof)
    pop = bk.een_mesh(sc, zonder=('lijf', 'wapenrok-rok'))
    mat_maken()
    plek_vast()
    holtes(0.12, 0.3)  # schaduw onder de kraag, de riem en tussen arm en lijf
    licht_voor_spelmaat(sc)
    bk.aan_het_skelet(sc, pop, rig)
    # het lijf aan het skelet: zijn gewichten zijn die van MakeHuman, de staande houding is nu de rust
    lijf.hide_render = False
    lijf.hide_viewport = False
    md = lijf.modifiers.new('skelet', 'ARMATURE')
    md.object = rig
    while lijf.modifiers[0].name != 'skelet':
        lijf.modifiers.move(lijf.modifiers.find('skelet'), 0)
    rok = bk.rok_als_stof(sc, rig, lijf)
    for ob in (pop, lijf, rok):
        m = ob.matrix_world.copy()
        ob.parent = rig
        ob.matrix_world = m
    smal_maken(sc, rig)
    rig['z0'] = rig.location.z
    bk.STAP = STAP
    lichten = {bpy.data.objects[n]: bpy.data.objects[n].matrix_world.copy() for n in ('zon', 'rand', 'vul')}
    if 'steek' not in sh.ARGS:
        met_stof(sc, rig, lambda t: None, 1, lambda r, i: f'eigen-{r}{ISO}-staan.png', lichten, rust=12)
    if 'staan' in sh.ARGS:
        return
    sc.render.resolution_x = 2400
    if 'steek' in sh.ARGS:
        # de steek: uit de wacht, met de speer laag bij de rechterheup (bakken.py, STEEK); breder, zodat de punt in beeld
        # blijft als hij vooruit schiet
        sc.render.resolution_x = 4400
        bk.draag_schuin(sc, rig, bk.WACHT)
        bk.steek(rig, 0)
        bk.speer_in_handen(sc, rig, sh.kruin(lijf) * 1.18, bk.WACHT)
        bk.speer_vast(rig)
        met_stof(sc, rig, lambda t: bk.steek(rig, t), 8, lambda r, i: f'eigen-{r}{ISO}-steek-{i}.png', lichten)
        return
    # lopen: de speer schuin voor het lijf, zoals de generator; drie rondes, zodat de stof op gang is
    dragen = bk.DRAGEN['generator']
    bk.draag_schuin(sc, rig, dragen)
    bk.loop(rig, 0, 8, draagt=True)
    bk.speer_in_handen(sc, rig, sh.kruin(lijf) * 1.18, dragen)
    bk.speer_vast(rig)
    met_stof(sc, rig, lambda t: bk.loop(rig, t, 8, draagt=True), 8, lambda r, i: f'eigen-{r}{ISO}-lopen-{i}.png', lichten,
             rondes=3)

main()
