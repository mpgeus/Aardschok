# De soldaat in drie renderstijlen (Marcel, 29 okt, ronde 5: "Maak drie artistieke renderstijlen ... Gebruik hetzelfde
# model, dezelfde pose, dezelfde camera en dezelfde compositie voor alle drie de varianten"). Alleen ZW, de vaste
# testrichting ("Werk eerst aan één richting"), met de camera en de kadering van de grote render (soldaat_render.groot).
# Elke stijl in een eigen Blender, zodat hij op de materialen van de bron begint (soldaat.blend):
# - A, mat 3D: de materialen van het spel (soldaat_render.materialen_voor_het_spel) en dan alles matter, ook het staal;
#   een grote zachte zon van linksboven, meer licht uit de lucht (zachte schaduwen), AgX.
# - B, painterly: warm licht (een oranje zon, een koele lucht, warm licht terug van de grond), en over elke kleur grote
#   vlekken in tint, verzadiging en toon, zoals met de kwast gezet; de penseelstreken komen in stijlblad.py.
# - C, Aardschok HD-pixel: het licht en de materialen van de vellen van het spel (soldaat_render.licht, zoals eigen.py),
#   de zon wat warmer en de holtes dieper (donkere vormaccenten); de kleurvlakken en de pixelafwerking in stijlblad.py.
# Voor de ontleding (welk verschil uit de vorm, de materialen, het licht of de nabewerking komt) nog twee:
# - klei: alles één grijs, mat materiaal in het licht van C: alleen de vorm;
# - albedo: elk materiaal alleen zijn kleur, zonder licht (textuur.als_licht): alleen de materialen.
# De getallen staan in instellingen.json bij soldaat.stijlen.
#
# Ronde 6 (Marcel, 29 okt): C met een zachter, warm hoofdlicht van linksboven-voor en een zwak, koel vullicht; een
# camerahoek en een draai erbij (om 15 en 30 graden te vergelijken, en op de draai van de speerman in ZW, 40 graden);
# 'details' (de close-ups in het licht van C, zonder nabewerking: gezicht, helm, romp, laarzen, speer) en 'helm' (de
# helm alleen, van voren, opzij, driekwart voor en achter, met textuur en in klei).
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/basismens/stijlen.py -- A|B|C|klei|albedo [elevatie] [draai]
#   ... -- details | helm
#   ... -- kop [elevatie] [draai]       het hoofd van dichtbij met de camera van C (ronde 7)
# naar <uit>/stijlen/<stijl>.png (met een elevatie <stijl>-<elevatie>.png), detail-<naam>.png, helm-<kant>[-klei].png;
# stijlblad.py en referentie.py maken er de bladen van.
import math
import os
import sys

import bpy
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(1, os.path.dirname(HIER))
import render as R  # noqa: E402
import soldaat_render as SR  # noqa: E402

INST, UIT, CAM = R.INST, R.UIT, R.CAM
ST = INST['soldaat']['stijlen']
ARGS = sys.argv[sys.argv.index('--') + 1:]
STIJL = ARGS[0]
ELEVATIE = float(ARGS[1]) if len(ARGS) > 1 else CAM['elevatie']
# de draai in graden, of (ronde 8) de naam van een richting van het spel (Z, ZW, W, ...: de draai uit instellingen.json),
# die dan ook in de naam van het beeld komt
RICHTING = ARGS[2] if len(ARGS) > 2 and not ARGS[2].lstrip('-').replace('.', '').isdigit() else None
DRAAI = (next(r['draai'] for r in R.RICHTINGEN if r['naam'] == RICHTING) if RICHTING
         else float(ARGS[2]) if len(ARGS) > 2 else SR.SC['detail']['draai'])
# ronde 13: SCHAAL rendert op een deel van de resolutie (de supersamplingproef: hoeveel keer groter dan de sprite)
SCHAAL = float(os.environ.get('SCHAAL', '1'))
NAAM = ((STIJL if len(ARGS) == 1 else f'{STIJL}-{ARGS[1]}') + (f'-{RICHTING}' if RICHTING else '')
        + (f"-{os.environ['STAND'].partition('#')[2]}" if os.environ.get('STAND') else '')
        + ('-eevee' if os.environ.get('MOTOR') == 'EEVEE' else '') + (f'-schaal{SCHAAL:g}' if SCHAAL != 1 else ''))


def bsdfs():
    for m in bpy.data.materials:
        if m.node_tree:
            for n in m.node_tree.nodes:
                if n.type == 'BSDF_PRINCIPLED':
                    yield m, n


def soort(m):
    return next((s for s, (namen, _) in SR.SOORTEN.items() if m.name.startswith(namen)), None)


def minstens(m, sok, waarde):
    """De invoer `sok` minstens `waarde`, ook als er een knoop aan hangt."""
    nt = m.node_tree
    if sok.links:
        mx = nt.nodes.new('ShaderNodeMath')
        mx.operation = 'MAXIMUM'
        nt.links.new(sok.links[0].from_socket, mx.inputs[0])
        mx.inputs[1].default_value = waarde
        nt.links.new(mx.outputs[0], sok)
    else:
        sok.default_value = max(sok.default_value, waarde)


def kijk(sc, transform, look, belichting):
    sc.view_settings.view_transform = transform
    try:
        sc.view_settings.look = look
    except TypeError:
        sc.view_settings.look = 'None'
    sc.view_settings.exposure = belichting


def lucht(sc, onder, boven, sterkte):
    """De kleuren van het verloop van soldaat_render.licht: de grond (onder) en de lucht (boven)."""
    nt = sc.world.node_tree
    mix = next(n for n in nt.nodes if n.type == 'MIX')
    kl = [s for s in mix.inputs if s.type == 'RGBA']
    kl[0].default_value, kl[1].default_value = tuple(onder) + (1,), tuple(boven) + (1,)
    nt.nodes['Background'].inputs['Strength'].default_value = sterkte


def zon(sterkte, hoek, kleur=(1, 1, 1), vul=None):
    z = bpy.data.objects['zon'].data
    z.energy, z.angle, z.color = sterkte, math.radians(hoek), kleur
    if vul is not None:
        bpy.data.objects['vul'].data.energy = vul


def holtes(afstand, diepte):
    """De holtes van de materialen dieper en verder (zoals eigen.holtes): niet alleen binnen het eigen deel, zodat de
    kraag, de riem en de armen schaduw geven op wat eronder ligt."""
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        for n in m.node_tree.nodes:
            if n.type == 'AMBIENT_OCCLUSION':
                n.only_local = False
                n.inputs['Distance'].default_value = afstand
                for link in n.outputs['AO'].links:
                    if link.to_node.type == 'MAP_RANGE':
                        link.to_node.inputs['To Min'].default_value = 1 - diepte


def stijl_A(sc, cam):
    A = ST['A']
    SR.materialen_voor_het_spel()
    for m, b in bsdfs():
        s = soort(m)
        minstens(m, b.inputs['Roughness'], A['ruw'].get(s, A['ruw']['anders']))
        b.inputs['Specular IOR Level'].default_value = min(b.inputs['Specular IOR Level'].default_value, A['spiegel'])
        b.inputs['Sheen Weight'].default_value = min(b.inputs['Sheen Weight'].default_value, A['sheen'])
    holtes(*A['holte'])
    SR.licht(sc, cam)
    zon(A['zon'], A['hoek'], tuple(A['zon_kleur']), A['vul'])
    lucht(sc, A['grond'], A['hemel'], A['lucht'])
    kijk(sc, 'AgX', A['look'], A['belichting'])


def stijl_B(sc, cam):
    B = ST['B']
    SR.materialen_voor_het_spel()
    for m, b in bsdfs():
        if m.name.startswith(('oog', 'basismens')):
            continue  # het gezicht en de ogen niet vlekkig
        nt = m.node_tree
        kc = b.inputs['Base Color']
        bron = kc.links[0].from_socket if kc.links else None
        tc = nt.nodes.new('ShaderNodeTexCoord')
        ruis = nt.nodes.new('ShaderNodeTexNoise')
        ruis.inputs['Scale'].default_value = B['vlek']
        ruis.inputs['Detail'].default_value = 2.0
        nt.links.new(tc.outputs['Object'], ruis.inputs['Vector'])
        sep = nt.nodes.new('ShaderNodeSeparateColor')
        nt.links.new(ruis.outputs['Color'], sep.inputs['Color'])
        hsv = nt.nodes.new('ShaderNodeHueSaturation')
        for i, (naam, mate, basis) in enumerate((('Hue', B['tint'], 0.5), ('Saturation', B['verzadiging'], 1 + B['meer_verzadigd']),
                                                 ('Value', B['toon'], 1.0))):
            mr = nt.nodes.new('ShaderNodeMapRange')
            nt.links.new(sep.outputs[i], mr.inputs['Value'])
            mr.inputs['From Min'].default_value, mr.inputs['From Max'].default_value = 0.3, 0.7
            mr.inputs['To Min'].default_value, mr.inputs['To Max'].default_value = basis - mate, basis + mate
            nt.links.new(mr.outputs['Result'], hsv.inputs[naam])
        if bron is not None:
            nt.links.new(bron, hsv.inputs['Color'])
        else:
            hsv.inputs['Color'].default_value = kc.default_value
        nt.links.new(hsv.outputs['Color'], kc)
    holtes(*B['holte'])
    SR.licht(sc, cam)
    zon(B['zon'], B['hoek'], tuple(B['zon_kleur']), B['vul'])
    bpy.data.objects['vul'].data.color = tuple(B['vul_kleur'])
    lucht(sc, B['grond'], B['hemel'], B['lucht'])
    kijk(sc, 'AgX', B['look'], B['belichting'])


def licht_C(sc, cam):
    """Het licht van de vellen van het spel (soldaat_render.licht), met de zon van C: warm, wat zachter, en een zwak, koel
    vullicht (ronde 6, Marcel: "Hoofdlicht van linksboven en enigszins van voren, warm, zachte schaduwen; invullicht
    zwakker, neutraal of licht koel")."""
    C = ST['C']
    SR.licht(sc, cam)
    zon(SR.LI['zon']['sterkte'], C['hoek'], tuple(C['zon_kleur']), C['vul'])
    bpy.data.objects['vul'].data.color = tuple(C['vul_kleur'])


def stijl_C(sc, cam):
    SR.materialen_voor_het_spel()
    holtes(*ST['C']['holte'])
    licht_C(sc, cam)


def stijl_klei(sc, cam):
    stijl_C(sc, cam)
    m = bpy.data.materials.new('klei')
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (0.2, 0.2, 0.2, 1)  # met de belichting van C: 0,42 was wit
    b.inputs['Roughness'].default_value = 0.85
    sc.view_layers[0].material_override = m


def stijl_albedo(sc, cam):
    import textuur
    for m in list(bpy.data.materials):
        if m.node_tree and any(n.type == 'BSDF_PRINCIPLED' for n in m.node_tree.nodes):
            textuur.als_licht(m, 'kleur')
    SR.licht(sc, cam)
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0
    kijk(sc, 'Standard', 'None', 0.0)
    sc.cycles.use_denoising = False


def details(sc, rig):
    """De close-ups in het licht van C, zonder nabewerking: het gezicht, de helm, de romp (gambeson en tabberd) en de
    laarzen met de camera's van soldaat_render.dichtbij, en het blad van de speer."""
    import json
    vuist = json.load(open(os.path.join(UIT, 'soldaat.json'), encoding='utf-8'))['speer']['vuist']
    deps = bpy.context.evaluated_depsgraph_get()
    sp = bpy.data.objects['speer']
    top = max((sp.matrix_world @ v.co for v in sp.evaluated_get(deps).data.vertices), key=lambda p: p.z)
    blad = INST['soldaat']['speer']['blad'][0]
    sc.render.resolution_x = sc.render.resolution_y = 512
    beelden = [d for d in SR.dichtbij(rig, vuist) if d[0] != 'vuist'] + [('speer', top - Vector((0, 0, blad * 0.75)), -30, blad * 1.9)]
    # ronde 7: de maliënkraag, schuin van voren op de hals
    nek = rig.matrix_world @ rig.pose.bones['neck01'].head
    beelden.append(('kraag', nek - Vector((0, 0, 0.03)), 35, 0.5))
    SR.materialen_voor_het_spel()
    holtes(*ST['C']['holte'])
    for naam, punt, draai, schaal in beelden:
        sc.camera = R.camera_op(sc, punt, draai, schaal, 'detail-' + naam)
        licht_C(sc, sc.camera)
        R.render(sc, os.path.join(UIT, 'stijlen', f'detail-{naam}.png'))


def helm_alleen(sc, rig):
    """De helm alleen (ronde 6, Marcel: "Render de helm afzonderlijk: frontaal, van opzij, driekwart vooraanzicht,
    driekwart achteraanzicht"; "de helm moet ook zonder texturen herkenbaar zijn"): in het licht van C en in klei."""
    helm = bpy.data.objects['helm']
    for ob in sc.objects:
        if ob.type == 'MESH' and ob != helm:
            ob.hide_render = True
    deps = bpy.context.evaluated_depsgraph_get()
    pts = [helm.matrix_world @ v.co for v in helm.evaluated_get(deps).data.vertices]
    mid = Vector([(min(p[i] for p in pts) + max(p[i] for p in pts)) / 2 for i in range(3)])
    sc.render.resolution_x = sc.render.resolution_y = 512
    SR.materialen_voor_het_spel()
    klei = bpy.data.materials.new('klei')
    klei.use_nodes = True
    klei.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.2, 0.2, 0.2, 1)
    klei.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.85
    for kant, draai in (('voor', 0), ('opzij', 90), ('driekwart-voor', 45), ('driekwart-achter', 135)):
        sc.camera = R.camera_op(sc, mid, draai, 0.42, 'helm-' + kant)
        licht_C(sc, sc.camera)
        for laag, mat in (('', None), ('-klei', klei)):
            sc.view_layers[0].material_override = mat
            R.render(sc, os.path.join(UIT, 'stijlen', f'helm-{kant}{laag}.png'))
        sc.view_layers[0].material_override = None


# ronde 8 (Marcel, 29 okt: "Van technisch correct 3D-model naar hoogwaardige, reproduceerbare Aardschok HD-pixel-art"):
# de materialen in zes groepen, voor de verfijning van A8 en voor het masker 'soort' (de afwerking per materiaal,
# spriteafwerking.py, en de AI in gereedschap/ai/soldaat-ai.cjs)
GROEPEN = {'staal': ('helm', 'staal', 'blad'), 'malien': ('malien',), 'stof': ('tabberd', 'wambuis', 'hozen'),
           'leer': ('leer', 'riem', 'handschoen', 'laars', 'omslag', 'zool', 'koord', 'gat'), 'huid': ('basismens', 'oog'),
           'hout': ('hout',)}
GROEP_KLEUR = {'staal': (1, 0, 0), 'malien': (0, 1, 0), 'stof': (0, 0, 1), 'leer': (1, 1, 0), 'huid': (1, 0, 1), 'hout': (0, 1, 1)}


def groep(m):
    return next((g for g, namen in GROEPEN.items() if m.name.startswith(namen)), None)


def verfijn(m, V):
    """Ronde 8, A: een materiaal rijker maken zonder zijn kleur te veranderen (`V`, per groep uit soldaat.stijlen.A8):
    vormschaduw (omgevingsschaduw over 'ao_afstand' meter, 'ao' diep), slijtage op de randen (de bolheid van de vorm,
    'rand' lichter), vlekken ('vlek' op 'vlek_schaal' per meter), reliëf (ruis van 'bobbel_schaal' per meter, gerekt met
    'rek', 'bobbel' sterk; boven op wat er al was) en een ondergrens voor de ruwheid ('ruw': mat)."""
    nt = m.node_tree
    b = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if b is None:
        return
    def nieuw(soort, **kw):
        n = nt.nodes.new(soort)
        for k, v in kw.items():
            setattr(n, k, v)
        return n

    bron =b.inputs['Base Color'].links[0].from_socket if b.inputs['Base Color'].links else None
    kleur = tuple(b.inputs['Base Color'].default_value)

    def bereik(x, lo, hi, a, z):
        r = nieuw('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP')
        nt.links.new(x, r.inputs['Value'])
        r.inputs['From Min'].default_value, r.inputs['From Max'].default_value = lo, hi
        r.inputs['To Min'].default_value, r.inputs['To Max'].default_value = a, z
        return r.outputs['Result']

    def maal(kl, f):
        mx = nieuw('ShaderNodeMix', data_type='RGBA', blend_type='MULTIPLY')
        mx.inputs[0].default_value = 1.0
        rgba = [s for s in mx.inputs if s.type == 'RGBA']
        if kl is None:
            rgba[0].default_value = kleur
        else:
            nt.links.new(kl, rgba[0])
        cc = nieuw('ShaderNodeCombineColor')
        for i in range(3):
            nt.links.new(f, cc.inputs[i])
        nt.links.new(cc.outputs[0], rgba[1])
        return [s for s in mx.outputs if s.type == 'RGBA'][0]

    tc = nieuw('ShaderNodeTexCoord')
    ao = nieuw('ShaderNodeAmbientOcclusion', only_local=False)
    ao.inputs['Distance'].default_value = V['ao_afstand']
    f = bereik(ao.outputs['AO'], 0.0, 1.0, 1 - V['ao'], 1.0)
    rand = bereik(nieuw('ShaderNodeNewGeometry').outputs['Pointiness'], 0.5, 0.58, 1.0, 1 + V['rand'])
    vlek = nieuw('ShaderNodeTexNoise')
    nt.links.new(tc.outputs['Object'], vlek.inputs['Vector'])
    vlek.inputs['Scale'].default_value, vlek.inputs['Detail'].default_value = V['vlek_schaal'], 4.0
    fv = bereik(vlek.outputs['Fac'], 0.3, 0.7, 1 - V['vlek'], 1 + V['vlek'])
    kl = maal(maal(maal(bron, f), rand), fv)
    if V.get('vuil', 0) > 0:  # kleine, scherp begrensde donkere plekken: vuil, slijtage, putjes ('vuil' diep, 'vuil_schaal' per meter)
        vu = nieuw('ShaderNodeTexNoise')
        nt.links.new(tc.outputs['Object'], vu.inputs['Vector'])
        vu.inputs['Scale'].default_value, vu.inputs['Detail'].default_value = V['vuil_schaal'], 6.0
        kl = maal(kl, bereik(vu.outputs['Fac'], 0.58, 0.68, 1.0, 1 - V['vuil']))
    nt.links.new(kl, b.inputs['Base Color'])
    if V['bobbel'] > 0:
        rek = nieuw('ShaderNodeVectorMath', operation='MULTIPLY')
        nt.links.new(tc.outputs['Object'], rek.inputs[0])
        rek.inputs[1].default_value = V['rek']
        rb = nieuw('ShaderNodeTexNoise')
        nt.links.new(rek.outputs[0], rb.inputs['Vector'])
        rb.inputs['Scale'].default_value, rb.inputs['Detail'].default_value = V['bobbel_schaal'], 3.0
        bump = nieuw('ShaderNodeBump')
        bump.inputs['Strength'].default_value, bump.inputs['Distance'].default_value = V['bobbel'], 0.002
        nt.links.new(rb.outputs['Fac'], bump.inputs['Height'])
        if b.inputs['Normal'].links:
            nt.links.new(b.inputs['Normal'].links[0].from_socket, bump.inputs['Normal'])
        nt.links.new(bump.outputs['Normal'], b.inputs['Normal'])
    r = b.inputs['Roughness']
    if r.links:
        mx = nieuw('ShaderNodeMath', operation='MAXIMUM')
        nt.links.new(r.links[0].from_socket, mx.inputs[0])
        mx.inputs[1].default_value = V['ruw']
        nt.links.new(mx.outputs[0], r)
    else:
        r.default_value = max(r.default_value, V['ruw'])


def stijl_A8(sc, cam):
    """Ronde 8, experiment A: de render van C (zelfde licht, camera, kleurbeheer) met rijkere materialen (verfijn, per
    groep) en meer monsters; 'motor' CYCLES of EEVEE (om te vergelijken)."""
    A8 = ST['A8']
    stijl_C(sc, cam)
    for m in bpy.data.materials:
        g = groep(m) if m.node_tree else None
        if g:
            verfijn(m, A8[g])
    sc.cycles.samples = A8['monsters']
    if os.environ.get('MOTOR') == 'EEVEE':
        sc.render.engine = next(e for e in ('BLENDER_EEVEE', 'BLENDER_EEVEE_NEXT') if e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys())


def stijl_soort(sc, cam):
    """Ronde 8: elk materiaal één vlakke kleur voor zijn groep (GROEP_KLEUR), zonder licht en zonder filter: het masker
    voor de afwerking per materiaal. Wat in geen groep valt, is grijs."""
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        nt = m.node_tree
        uit = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        if uit is None:
            continue
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Color'].default_value = GROEP_KLEUR.get(groep(m), (0.5, 0.5, 0.5)) + (1,)
        nt.links.new(em.outputs[0], uit.inputs['Surface'])
    SR.licht(sc, cam)


def stijl_diepte(sc, cam):
    """Ronde 8: de diepte voor ControlNet: dichtbij wit, ver zwart, over 'diepte' meter rond de afstand van de camera."""
    m = bpy.data.materials.new('diepte')
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    cd = nt.nodes.new('ShaderNodeCameraData')
    r = nt.nodes.new('ShaderNodeMapRange')
    nt.links.new(cd.outputs['View Z Depth'], r.inputs['Value'])
    # ronde 14: het bereik gemeten aan de figuur zelf (de diepte langs de camera van alle zichtbare meshes in deze stand,
    # 1 cm erbuiten): rond de vaste afstand van de camera (CAM['afstand'] ± 'diepte'/2) was bijna alles wit, want deze
    # camera staat anders
    deps = bpy.context.evaluated_depsgraph_get()
    inv = cam.matrix_world.inverted()
    zs = [-(inv @ (ob.matrix_world @ v.co)).z for ob in sc.objects if ob.type == 'MESH' and not ob.hide_render
          for v in ob.evaluated_get(deps).data.vertices]
    lo, hi = (float(x) for x in os.environ['DIEPTE'].split(',')) if os.environ.get('DIEPTE') else (min(zs) - 0.01, max(zs) + 0.01)
    print('DIEPTE', round(min(zs), 4), round(max(zs), 4), 'bereik', round(lo, 4), round(hi, 4))  # DIEPTE=lo,hi: één bereik voor meer standen
    r.inputs['From Min'].default_value, r.inputs['From Max'].default_value = lo, hi
    r.inputs['To Min'].default_value, r.inputs['To Max'].default_value = 1.0, 0.0
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(r.outputs['Result'], em.inputs['Color'])
    nt.links.new(em.outputs[0], next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL').inputs['Surface'])
    sc.view_layers[0].material_override = m
    SR.licht(sc, cam)


# ronde 14 (Marcel, 29 okt: "Het materiaal-ID-masker moet minimaal onderscheid maken tussen huid, helm, maliën,
# gambeson, blauw textiel, geel textiel, leer, hout en speerpunt"): fijner dan GROEPEN
ID_KLEUR = {'huid': (1, 0.5, 0.5), 'helm': (0.5, 0.5, 0.5), 'malien': (0, 1, 0), 'gambeson': (0.5, 0.25, 0), 'blauw': (0, 0, 1),
            'geel': (1, 1, 0), 'leer': (1, 0.5, 0), 'hout': (0, 1, 1), 'speerpunt': (1, 0, 0), 'staal': (0.25, 0.25, 0.25),
            'hozen': (0, 0, 0.5)}
ID_NAMEN = {'helm': ('helm',), 'malien': ('malien',), 'gambeson': ('wambuis',), 'blauw': ('tabberd-blauw',), 'geel': ('tabberd-geel',),
            'leer': ('leer', 'riem', 'handschoen', 'laars', 'omslag', 'zool', 'koord', 'gat'), 'hout': ('hout',), 'speerpunt': ('blad',),
            'staal': ('staal',), 'hozen': ('hozen',), 'huid': ('basismens', 'oog')}


def stijl_id(sc, cam):
    """Ronde 14: elk materiaal één vlakke kleur voor zijn soort (ID_KLEUR); alles van het lijf en de wenkbrauwen is huid
    (de materialen van HumGen heten anders). Wat in geen soort valt, is wit."""
    van_lijf = {m for o in bpy.data.objects if o.name in ('lijf', 'wenkbrauwen') and o.data for m in getattr(o.data, 'materials', []) if m}
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        nt = m.node_tree
        uit = next((n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL'), None)
        if uit is None:
            continue
        soort = 'huid' if m in van_lijf else next((k for k, namen in ID_NAMEN.items() if m.name.startswith(namen)), None)
        em = nt.nodes.new('ShaderNodeEmission')
        em.inputs['Color'].default_value = ID_KLEUR.get(soort, (1, 1, 1)) + (1,)
        nt.links.new(em.outputs[0], uit.inputs['Surface'])
    SR.licht(sc, cam)


def stijl_normaal(sc, cam):
    """Ronde 14: de normaal in de ruimte van de camera als kleur (x naar rechts rood, y omhoog groen, naar de camera blauw;
    zoals ControlNet hem verwacht)."""
    m = bpy.data.materials.new('normaal')
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    geo = nt.nodes.new('ShaderNodeNewGeometry')
    vt = nt.nodes.new('ShaderNodeVectorTransform')
    vt.vector_type, vt.convert_from, vt.convert_to = 'NORMAL', 'WORLD', 'CAMERA'
    nt.links.new(geo.outputs['Normal'], vt.inputs[0])
    sc_ = nt.nodes.new('ShaderNodeVectorMath')
    sc_.operation = 'MULTIPLY_ADD'
    nt.links.new(vt.outputs[0], sc_.inputs[0])
    sc_.inputs[1].default_value = (0.5, 0.5, -0.5)  # Blender kijkt langs -z: naar de camera wordt blauw
    sc_.inputs[2].default_value = (0.5, 0.5, 0.5)
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(sc_.outputs[0], em.inputs['Color'])
    nt.links.new(em.outputs[0], next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL').inputs['Surface'])
    sc.view_layers[0].material_override = m
    SR.licht(sc, cam)


def loopstand(rig):
    """Ronde 14: een stand uit een JSON-bestand (STAND=<pad>#<naam>) over de houding heen: 'zet' voor stand.zet, en
    'reik' de linkerhand naar de schacht ('naar': meter van de rechterhand, 'pool': waar de elleboog heen buigt, 'pols':
    de richting van de linkerhand); daarna het lijf weer op de grond."""
    import json
    import stand
    pad, _, naam = os.environ['STAND'].partition('#')
    P = json.load(open(pad, encoding='utf-8'))[naam]
    stand.zet(rig, P['zet'])
    if P.get('reik'):
        bpy.context.view_layer.update()
        vuist = rig.pose.bones['wrist.R'].head.copy()
        stand.reik(rig, 'L', vuist + Vector(P['reik']['naar']), P['reik']['pool'])
        stand.zet(rig, [('wrist.L', 'richt', P['reik']['pols'])])
    bpy.context.view_layer.update()
    print('STAND', naam, 'omlaag', round(stand.op_de_grond(rig, bpy.data.objects['laarzen']), 4))


def kop(sc, cam):
    """Het hoofd van dichtbij met de camera van C (ronde 7, Marcel: "Render de oorspronkelijke helm, de 10%-variant en de
    15%-variant vanuit exact dezelfde ZW-camera"): dezelfde richting en hetzelfde licht als de hele man, ingezoomd op de
    helm, het gezicht en de kraag ('kop': meter hoog, en hoeveel meter het midden onder het midden van de helm ligt)."""
    deps = bpy.context.evaluated_depsgraph_get()
    helm = bpy.data.objects['helm']
    pts = [helm.matrix_world @ v.co for v in helm.evaluated_get(deps).data.vertices]
    mid = Vector([(min(p[i] for p in pts) + max(p[i] for p in pts)) / 2 for i in range(3)])
    schaal, omlaag = ST['kop']
    kijk = cam.matrix_world.to_3x3() @ Vector((0, 0, -1))
    cam.matrix_world.translation = mid - Vector((0, 0, omlaag)) - kijk * CAM['afstand']
    cam.data.ortho_scale = schaal
    sc.render.resolution_x = sc.render.resolution_y = 640
    stijl_C(sc, cam)
    # hoeveel van de ogen de camera ziet (Marcel: "Zorg dat de ogen onder de helmrand zichtbaar blijven"): een straal van
    # elk punt van de voorkant van de oogbollen naar de camera; vrij, achter de helm, of achter iets anders (de oogleden)
    import json
    ogen = bpy.data.objects.get('ogen')
    if ogen is None:  # ronde 10: de HumGen-man heeft zijn ogen in het lijf, zonder het kenmerk 'oog'
        return
    e = ogen.evaluated_get(deps)
    waarden = [d.value for d in e.data.attributes['oog'].data]
    naar = cam.matrix_world.to_3x3() @ Vector((0, 0, 1))
    tel = {'vrij': 0, 'helm': 0, 'anders': 0}
    for v, a in zip(e.data.vertices, waarden):
        if a < 0.6:
            continue
        p = ogen.matrix_world @ v.co
        raak, _, _, _, ob, _ = sc.ray_cast(deps, p + naar * 0.0005, naar)
        tel['vrij' if not raak else 'helm' if ob.name == 'helm' else 'anders'] += 1
    n = max(1, sum(tel.values()))
    json.dump({'ogen_zichtbaar': round(tel['vrij'] / n, 3), 'achter_de_helm': round(tel['helm'] / n, 3),
               'achter_de_oogleden': round(tel['anders'] / n, 3), 'punten': n},
              open(os.path.join(UIT, 'stijlen', NAAM + '.json'), 'w', encoding='utf-8'), indent=1)


def main():
    sc = R.scene()
    rig = bpy.data.objects['skelet']
    rig.data.pose_position = 'POSE'
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    bpy.data.objects['lijf-bron'].hide_render = True
    SR.houding(rig)
    if os.environ.get('STAND'):
        loopstand(rig)
    # de camera en de kadering van de grote render: de man 45 graden gedraaid (ZW), de oorsprong (de voeten) op het anker
    D = SR.SC['detail']
    sc.cycles.samples = ST['monsters']
    os.makedirs(os.path.join(UIT, 'stijlen'), exist_ok=True)
    if STIJL in ('details', 'helm'):
        (details if STIJL == 'details' else helm_alleen)(sc, rig)
        print('STIJL', STIJL, 'klaar')
        return
    rig.rotation_euler = (0, 0, math.radians(DRAAI))
    bpy.context.view_layer.update()
    sc.render.resolution_x, sc.render.resolution_y = D['breed'], D['hoog']
    sc.render.resolution_percentage = max(1, round(100 * SCHAAL))
    cam = R.camera(sc, ELEVATIE, 0, 'stijl', D['anker'], (D['breed'], D['hoog'], D['pixels_per_meter']))
    sc.camera = cam
    (kop if STIJL == 'kop' else globals()['stijl_' + STIJL])(sc, cam)
    import time
    t0 = time.time()
    if STIJL in ('soort', 'diepte', 'id', 'normaal'):  # vlak: één monster, geen filter, geen kleurbeheer (elke pixel één vlak)
        SR.vlak_render(sc, os.path.join(UIT, 'stijlen', NAAM + '.png'), sc.view_layers[0].material_override)
    else:
        R.render(sc, os.path.join(UIT, 'stijlen', NAAM + '.png'))
    print('RENDERTIJD', NAAM, sc.render.engine, round(time.time() - t0, 1))
    print('STIJL', STIJL, 'klaar')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
