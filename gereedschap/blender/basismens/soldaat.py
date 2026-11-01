# De basismens als soldaat (Marcel, 28 okt, ronde 3: "bewijs dat de basismens geschikt is om een volledig uitgeruste
# Aardschok-soldaat te maken, zonder het basismodel opnieuw te bouwen"). Op het lijf en het skelet van bouw.py, gebouwd in
# de rust (de A-houding), elk onderdeel een eigen mesh aan hetzelfde skelet, met de materialen van de speerman
# (speerman_hd.py), zodat hij in de stijl van het spel blijft:
# - de broek, de gambeson en de laarzen uit de huid (lijf-bron, met de lussen van MakeHuman): de vlakken van dat deel,
#   recht afgesneden met vlakken, over de holtes gespannen, met de gewichten van de huid eronder, en dan naar buiten
#   gezet; zo buigen ze zoals de huid, en blijft elke laag boven de laag eronder;
# - de tabberd: het lijfje ook uit de huid (over de gambeson, de holtes overbrugd, met ronde armsgaten), de rok een buis
#   om heupen en benen die recht valt; gevierendeeld met vaste vlakken op het lijf (soldaat.tabberd);
# - de handschoenen uit de huid van de handen, met een wijde kap over de mouw; de kraag en de omslag van de laarzen als
#   buis om hals en been;
# - de riem met gesp om de tabberd, de buidel eraan, de helm (een ketelhoed) aan het bot van het hoofd, en de speer aan
#   een greep (een leeg object) aan het bot van de rechterhand.
# Ronde 4 (29 okt, Marcel: "Verbeter de uitrusting"): een maliënkraag onder de helm die als een cape over de schouders
# valt, een baard en snor als vorm (speerman_hd.baardvorm), plooien in de rok van de tabberd en boven de riem, kleinere
# ruiten met smallere naden in de gambeson, een rand, kreukels en een riempje met gesp aan de laarzen, een lus en gaten
# aan de riem, een knoop aan de buidel. Dezelfde code bouwt ook de gedrongen variant (variant.py).
# Ronde 5 (29 okt, Marcel: "Corrigeer de belangrijkste vormen"): de rok valt met de stofsimulatie van de speerman
# (speerman_hd.hangen) in plaats van regelmatige golven; de helm gesmeed (een kam, een licht spitse koepel, deuken,
# klinknagels) en mat; oogbollen voor de dichte oogkassen; een eigen baard met een snor over de bovenlip; laarzen met een
# neus, een hiel en een losse zool; een fijnere speerpunt met een holle slijpkant en een tule met een nagel.
# Ronde 6 (29 okt, Marcel: "de bestaande speerman zo nauwkeurig mogelijk reconstrueren"): de helm naar die van de
# speerman (een halve bol, een smallere zakkende rand, kam en naden, geen schaduw op het gezicht), stoppels en
# wenkbrauwen in plaats van een baard als vorm, een donkere ooglijn, plooien vanaf de riem, en een eigen stand van de
# benen en de rug ('stand': de voeten uit elkaar, de knieën wat door, de borst op, het hoofd recht).
# Ronde 7 (29 okt, Marcel: "helm, gezicht en maliënkraag"; elk als proef in proeven/, variant.py): de helm groter, hoger,
# een dikkere zoom, wat scheef gesmeed en wat achterover ('hoger', 'zoom', 'scheef', 'kantel', 'rand_voor'); de stoppels,
# de wenkbrauwen en wat blos in de huid gebakken (huid, stoppels) in plaats van een baard als laag (baard.vorm false); de
# maliën lichter en over de schouders, met elk punt buiten de gambeson en de tabberd (bovenop); de gewatteerde kraag dunner.
# Daarna gaat het lijf onder de kleren weg, krijgt elke laag een kenmerk 'bedekt' (de vlakken die onder een laag erboven
# horen te liggen; de controle kijkt of je ze ergens ziet), en staat hij in de houding van de soldaat: de idle met de speer.
#
#   blender.exe -b <uit>/bron/basismens.blend -P gereedschap/blender/basismens/soldaat.py
# naar <uit>/bron/soldaat.blend en <uit>/soldaat.json.
import json
import math
import os
import random
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(1, os.path.dirname(HIER))
import bouw  # noqa: E402
import stand  # noqa: E402
import speerman_hd as sh  # noqa: E402  (de materialen van de speerman)

INST, UIT = bouw.INST, bouw.UIT
S = INST['soldaat']
K = S['kleuren']
ARM = ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal')
HAND = ('wrist', 'finger', 'metacarpal')
BEEN = ('upperleg', 'lowerleg', 'foot', 'toe')
# de groepen van het hoofd (ronde 10: bij de HumGen-man hangt het gezicht ook aan de botten van zijn mimiek: 'hoofd_groepen')
HOOFD = tuple(S.get('hoofd_groepen', ('head', 'neck')))
KOP = tuple(g for g in HOOFD if g != 'neck')
# de lagen van binnen naar buiten: een laag kan alleen bedekt worden door een hogere (de speer bedekt niets)
LAAG = {'lijf': 0, 'broek': 1, 'gambeson': 2, 'laarzen': 2, 'tabberd': 3, 'handschoenen': 3, 'riem': 4,
        'malienkraag': 4, 'buidel': 5, 'baard': 5, 'helm': 6, 'ogen': 0}


def glad(t, a, b):
    t = min(1.0, max(0.0, (t - a) / (b - a)))
    return t * t * (3 - 2 * t)


def som(ob, namen):
    """Per punt de som van de gewichten van de groepen waarvan de naam met een van `namen` begint."""
    idx = {g.index for g in ob.vertex_groups if g.name.startswith(namen)}
    w = np.zeros(len(ob.data.vertices))
    for v in ob.data.vertices:
        for x in v.groups:
            if x.group in idx:
                w[v.index] += x.weight
    return w


# ---------------------------------------------------------------- uit de huid

def uit_huid(naam, bron, kies, sneden=(), sub=0):
    """De vlakken van het bronlijf waarvan alle punten gekozen zijn, als eigen object. Elke snede (punt, normaal, waar)
    gooit weg wat aan de kant van de normaal ligt, alleen in de vlakken binnen `waar` meter van het punt (None: overal),
    zodat de rand recht is en niet de driehoeken volgt. Met `sub` daarna zoveel keer fijner (Catmull-Clark)."""
    bm = bmesh.new()
    bm.from_mesh(bron.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if not all(kies[v.index] for v in f.verts)], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    for p, n, waar in sneden:
        p = Vector(p)
        fs = [f for f in bm.faces if waar is None or (f.calc_center_median() - p).length < waar]
        es = list({e for f in fs for e in f.edges})
        vs = list({v for f in fs for v in f.verts})
        bmesh.ops.bisect_plane(bm, geom=vs + es + fs, plane_co=p, plane_no=Vector(n).normalized(), clear_outer=True)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bmesh.ops.dissolve_degenerate(bm, dist=1e-4, edges=bm.edges[:])
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    me = bpy.data.meshes.new(naam)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    for g in bron.vertex_groups:
        ob.vertex_groups.new(name=g.name)
    if sub:
        m = ob.modifiers.new('sub', 'SUBSURF')
        m.levels = m.render_levels = sub
        bouw.toepassen(ob, 'sub')
    return ob


def snijd(bm, f):
    """Snijdt de vlakken langs f = 0 (f een functie van de plek) en gooit weg waar f < 0: elke rand die f = 0 kruist krijgt
    daar een punt, en die punten worden per vlak verbonden. Zo ligt de rand op het gebogen vlak, niet op de driehoeken."""
    waarde = {v: f(v.co) for v in bm.verts}
    nieuw = set()
    for e in list(bm.edges):
        a, b = e.verts
        fa, fb = waarde[a], waarde[b]
        if (fa < 0) != (fb < 0):
            t = fa / (fa - fb)
            if 1e-3 < t < 1 - 1e-3:
                _, nv = bmesh.utils.edge_split(e, a, t)
                waarde[nv] = 0.0
                nieuw.add(nv)
            else:
                nul = a if t <= 1e-3 else b
                waarde[nul] = 0.0
                nieuw.add(nul)
    for fc in list(bm.faces):
        nul = [v for v in fc.verts if v in nieuw]
        if len(nul) == 2 and not any(set(e.verts) == set(nul) for e in fc.edges):
            bmesh.ops.connect_verts(bm, verts=nul)
    bmesh.ops.delete(bm, geom=[fc for fc in bm.faces if f(fc.calc_center_median()) < 0], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')


def rand(bm):
    return [v for v in bm.verts if any(len(e.link_faces) == 1 for e in v.link_edges)]


def spannen(ob, rondes):
    """Over de holtes spannen (bouw.holtes_spannen), de open randen vast."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bouw.holtes_spannen(bm, set(rand(bm)), rondes)
    bm.to_mesh(ob.data)
    bm.free()


def gewichten(ob, bron, rig, zonder=()):
    """De gewichten van de huid eronder (punt voor punt, ook waar een snede punten maakte), alleen van botten, zonder de
    botten die met `zonder` beginnen; elk punt samen 1 (een punt zonder gewicht krijgt die van zijn naaste buur)."""
    for g in list(ob.vertex_groups):
        ob.vertex_groups.remove(g)
    dt = ob.modifiers.new('gewichten', 'DATA_TRANSFER')
    dt.object = bron
    dt.use_vert_data = True
    dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'
    dt.layers_vgroup_select_src = 'ALL'
    dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.datalayout_transfer(modifier='gewichten')
    bouw.toepassen(ob, 'gewichten')
    schoon(ob, rig, zonder)


def schoon(ob, rig, zonder=()):
    botten = {b.name for b in rig.data.bones}
    for g in list(ob.vertex_groups):
        if g.name not in botten or (zonder and g.name.startswith(zonder)):
            ob.vertex_groups.remove(g)
    leeg = []
    for v in ob.data.vertices:
        tot = sum(x.weight for x in v.groups)
        if tot > 1e-6:
            for x in v.groups:
                x.weight /= tot
        else:
            leeg.append(v.index)
    if leeg:
        kd = KDTree(len(ob.data.vertices))
        n = 0
        vol = set(range(len(ob.data.vertices))) - set(leeg)
        for i in vol:
            kd.insert(ob.data.vertices[i].co, i)
            n += 1
        kd.balance()
        for i in leeg:
            _, j, _ = kd.find(ob.data.vertices[i].co)
            for x in ob.data.vertices[j].groups:
                ob.vertex_groups[x.group].add([i], x.weight, 'REPLACE')


def naar_buiten(ob, afstand):
    """Elk punt langs zijn normaal naar buiten, afstand(index, punt) meter (eerst alle normalen: verschuiven verandert ze)."""
    me = ob.data
    me.update()
    ns = [v.normal.copy() for v in me.vertices]
    for v, n in zip(me.vertices, ns):
        v.co += n * afstand(v.index, v.co.copy())


def dik(ob, d):
    """Dik met een gesloten rand (naar buiten); zonder 'even offset', want die maakt pieken waar de stof plooit (de rand
    van de zool, de tabberd)."""
    s = ob.modifiers.new('dikte', 'SOLIDIFY')
    s.thickness = d
    s.offset = 1
    s.use_rim = True
    bouw.toepassen(ob, 'dikte')
    sh.zacht(ob)


def versimpel(ob, budget):
    """Tot onder het budget aan driehoeken (collapse, symmetrisch om X); de gewichten en de kenmerken gaan mee. Voor de
    dikte, zodat de twee kanten van de stof niet door elkaar zakken."""
    n = sum(len(p.vertices) - 2 for p in ob.data.polygons)
    if n > budget:
        d = ob.modifiers.new('minder', 'DECIMATE')
        d.decimate_type = 'COLLAPSE'
        d.ratio = budget / n * 0.98
        d.use_symmetry, d.symmetry_axis = True, 'X'
        bouw.toepassen(ob, 'minder')


def vast_aan(ob, rig, bot):
    """Alle punten met gewicht 1 aan één bot."""
    for g in list(ob.vertex_groups):
        ob.vertex_groups.remove(g)
    ob.vertex_groups.new(name=bot).add(list(range(len(ob.data.vertices))), 1.0, 'REPLACE')


def samen(naam, delen):
    """Delen tot één object (het eerste), met hun materialen en groepen."""
    bpy.ops.object.select_all(action='DESELECT')
    for d in delen:
        d.select_set(True)
    bpy.context.view_layer.objects.active = delen[0]
    bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    ob.name = ob.data.name = naam
    return ob


# ---------------------------------------------------------------- buizen om het lijf

def bvh(*obs, kant=None):
    """Een BVH van de vlakken van deze objecten (in rust); met kant 'L' of 'R' alleen die helft (x > 0 is links)."""
    kies = lambda o: None if kant is None else [(p.co.x > 0) == (kant == 'L') for p in o.data.vertices]
    return sh.bvh_van([(o, kies(o)) for o in obs])


def hull2d(pts):
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts
    kruis = lambda o, a, b: (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    onder, boven = [], []
    for p in pts:
        while len(onder) >= 2 and kruis(onder[-2], onder[-1], p) <= 0:
            onder.pop()
        onder.append(p)
    for p in reversed(pts):
        while len(boven) >= 2 and kruis(boven[-2], boven[-1], p) <= 0:
            boven.pop()
        boven.append(p)
    return onder[:-1] + boven[:-1]


def op_hull(H, th):
    """Hoe ver de rand van de convexe veelhoek H ligt vanuit (0, 0) in richting th."""
    dx, dy = math.cos(th), math.sin(th)
    best = 0.0
    for i in range(len(H)):
        ax, ay = H[i]
        ex, ey = H[(i + 1) % len(H)][0] - ax, H[(i + 1) % len(H)][1] - ay
        det = -dx * ey + ex * dy
        if abs(det) < 1e-12:
            continue
        t = (-ax * ey + ex * ay) / det
        s = (dx * ay - dy * ax) / det
        if -1e-9 <= s <= 1 + 1e-9 and t > best:
            best = t
    return best


def ringen_om(boom, oorsprong, as_, ts, extra, n, lengte=None, bol=False, ref=Vector((0, -1, 0))):
    """Ringen loodrecht op een as, elk op de buitenkant van wat de bvh raakt (van buiten naar binnen gezocht) plus
    extra(t, hoek); met `lengte(hoek)` rekt t per hoek (een kraag die van voren lager is), met `bol` wordt elke ring
    convex (stof overbrugt de holtes). Hoek 0 is voor (ref), pi/2 zijn rechterkant als de as omlaag wijst; de naad achter."""
    as_ = as_.normalized()
    x1 = (ref - as_ * ref.dot(as_)).normalized()
    y1 = as_.cross(x1)
    hoeken = [math.pi + 2 * math.pi * j / n for j in range(n)]
    ringen = []
    for t in ts:
        rij, cs = [], []
        for th in hoeken:
            tt = t * (lengte(th) if lengte else 1.0)
            c = oorsprong + as_ * tt
            d = x1 * math.cos(th) + y1 * math.sin(th)
            rij.append(sh.straal(boom, c, d))
            cs.append((c, d, th, tt))
        rij = sh.vul(rij)
        ring = [c + d * (r + extra(tt, th)) for (c, d, th, tt), r in zip(cs, rij)]
        if bol:
            c0 = oorsprong + as_ * t
            H = hull2d([((p - c0).dot(x1), (p - c0).dot(y1)) for p in ring])
            ring = [c0 + (x1 * math.cos(th) + y1 * math.sin(th)) * op_hull(H, th) for th in hoeken]
        ringen.append(ring)
    return ringen, x1, y1


def buis(naam, ringen, mat=None):
    """Een buis door de ringen (elk even veel punten, gesloten), met de normalen naar buiten."""
    n = len(ringen[0])
    vs = [tuple(p) for r in ringen for p in r]
    fs = []
    for i in range(len(ringen) - 1):
        for j in range(n):
            a, b = i * n + j, i * n + (j + 1) % n
            fs.append((a, b, b + n, a + n))
    me = bpy.data.meshes.new(naam)
    me.from_pydata(vs, [], fs)
    me.update()
    # naar buiten: vanaf de as door de middens van de eerste en de laatste ring gemeten
    c0 = sum((Vector(p) for p in ringen[0]), Vector()) / n
    as_ = (sum((Vector(p) for p in ringen[-1]), Vector()) / n - c0).normalized()
    straal_ = lambda q: (q - c0) - as_ * (q - c0).dot(as_)
    binnen = sum(1 for p in me.polygons if p.normal.dot(straal_(p.center)) < 0)
    if binnen > len(me.polygons) / 2:
        me.flip_normals()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    sh.zacht(ob)
    return ob


def uv_buis(ob, ringen):
    """Een UV-kaart 'uv' in meters over een buis uit buis(): u rondom (de lengte langs de ring), v langs de buis, de naad
    achter; voor de maliën (speerman_hd.mat_malien rekent in meters). Per hoek van een vlak via zijn punt (ring i, plek
    j); waar een vlak over de naad gaat, krijgt plek 0 de hele omtrek."""
    n = len(ringen[0])
    u = [[0.0] * (n + 1) for _ in ringen]
    w = [0.0] * len(ringen)
    for i, r in enumerate(ringen):
        for j in range(n):
            u[i][j + 1] = u[i][j] + (r[(j + 1) % n] - r[j]).length
        if i:
            w[i] = w[i - 1] + sum((r[j] - ringen[i - 1][j]).length for j in range(n)) / n
    me = ob.data
    laag = me.uv_layers.new(name='uv')
    for p in me.polygons:
        js = [k % n for k in p.vertices]
        naad = 0 in js and n - 1 in js
        for l, k in zip(p.loop_indices, p.vertices):
            i, j = divmod(k, n)
            laag.data[l].uv = (u[i][n if naad and j == 0 else j], w[i])


# ---------------------------------------------------------------- de materialen

def mat_tabberd(naam, kleur, gloed):
    """De stof van de tabberd: de kleur met wat vlekken en het linnen van de wapenrok van de speerman, en een zachte
    gloed zodat het geel in de schaduw niet olijf wordt (speerman_hd.mat_wapenrok)."""
    k = sh.Knopen(naam)
    v = k.ruis(7, 2)
    kl = k.meng(k.glad(v, 0.35, 0.65, 0, 0.3), sh.lin(kleur), (0, 0, 0, 1))
    kl = k.met_textuur(kl, 'rough_linen', 0.7, contrast=1.0, kracht=1.2)
    V = S['tabberd'].get('vuil')
    if V:
        # ronde 12: vuil aan de zoom en schaduw onder de riem (het kenmerk 'vuil' van tabberd()), in vlekken, zoals de
        # wapenrok van de speerman
        vuil = k.n('ShaderNodeAttribute', attribute_name='vuil').outputs['Fac']
        kl = k.meng(k.w('MULTIPLY', vuil, k.glad(k.ruis(30, 3), 0.3, 0.6, V['vlek'], 1.0)), kl, sh.lin(V['kleur']))
    k.bsdf.inputs['Sheen Weight'].default_value = 0.3
    k.zet(k.bsdf.inputs['Emission Color'], sh.lin(gloed))
    k.bsdf.inputs['Emission Strength'].default_value = sh.GEEL_GLOED
    m = k.af(kl, ruw=0.92, holte=0.65)
    m['kleur'] = kleur
    return m


def mat_helm():
    """Gesmeed staal (ronde 5, Marcel: "matter, met subtiele slijtage"): dof, met vlekken van een donkere patina, fijne
    krassen, het blanke staal waar de randen en de kam slijten (de bolheid van de vorm), en hamerslagen in het reliëf."""
    H = S['helm']
    k = sh.Knopen('helm')
    vlek = k.ruis(18, 4)
    hamer = k.ruis(70, 2)
    kras = k.ruis(150, 2, rek=(1, 8, 1))
    kl = k.meng(k.glad(vlek, 0.3, 0.75, 0, H['patina_deel']), sh.lin(K['helm']), sh.lin(H['patina']))
    kl = k.met_textuur(kl, 'rusty_metal_sheet', 0.3, contrast=0.45, kracht=0.5)
    bol = k.n('ShaderNodeNewGeometry').outputs['Pointiness']
    slijt = k.w('MAXIMUM', k.glad(bol, 0.53, 0.6), k.glad(kras, 0.7, 0.76, 0, 0.6))
    kl = k.meng(slijt, kl, sh.lin(H['blank']))
    ruw = k.w('SUBTRACT', k.w('ADD', H['ruw'], k.w('MULTIPLY', k.glad(vlek, 0.3, 0.75), 0.18)), k.w('MULTIPLY', slijt, 0.2))
    k.bobbel(k.w('ADD', k.w('MULTIPLY', hamer, 0.6), k.w('MULTIPLY', kras, 0.15)), 0.25, 0.002)
    m = k.af(kl, ruw=ruw, metaal=H.get('metaal', 0.85), holte=0.5)
    m['kleur'] = K['helm']
    return m


def mat_malien():
    """De maliën van de speerman (speerman_hd.mat_malien), met donkerdere ringen ('ringen_kleur'; ronde 5, Marcel:
    "verklein de visuele dominantie van de maliënkraag": de lichte ringen maakten op de schouders een lichte vlek)."""
    Mk = S['malienkraag']
    m = kleuren_van(sh.mat_malien(), [('#8e8278', Mk['ringen_kleur'])] + ([('#16100c', Mk['tussen_kleur'])] if 'tussen_kleur' in Mk else []))
    # ronde 7 (Marcel: "Middengrijs staal. Lichtere ringaccenten. Subtiele donkere tussenruimten. Matte afwerking"): de
    # tussenruimte ('tussen_kleur'), het metaal en de ruwheid ('metaal', 'ruw') naar keuze
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    for sok, sleutel in (('Metallic', 'metaal'), ('Roughness', 'ruw')):
        if sleutel in Mk and not b.inputs[sok].links:
            b.inputs[sok].default_value = Mk[sleutel]
    return m


def kleuren_van(m, paren):
    """In een materiaal van de speerman de vaste kleuren vervangen: (oud, nieuw) in hex."""
    for oud, nieuw in paren:
        o = tuple(round(x, 5) for x in sh.lin(oud))
        for n in m.node_tree.nodes:
            for s in n.inputs:
                if s.type == 'RGBA' and not s.links and tuple(round(x, 5) for x in s.default_value) == o:
                    s.default_value = sh.lin(nieuw)
    return m


def mat_laars():
    """Het leer van de laarzen van de speerman (speerman_hd.mat_laars) in het donkerdere bruin van zijn vel ('kleur':
    licht en donker; ronde 6: de laarzen waren op de render oranje, bij de speerman donker roodbruin)."""
    licht, donker = S['laarzen']['kleur']
    return kleuren_van(sh.mat_laars(), (('#d07a3c', licht), ('#7a3c16', donker)))


def huid(lijf, m):
    """De huid van de soldaat donkerder en bruiner, verweerd (ronde 6, Marcel: "Verbeter ... huid"; het gezicht was op de
    render licht roze, bij de speerman bruin): een eigen kopie van de textuur van het lijf maal 'tint', naast de bron
    (<uit>/bron/soldaat-huid.png). De basismens houdt zijn huid; de GLB houdt een gewone textuur.
    Ronde 7 (Marcel, 29 okt: "Minder oranje", "Matte afwerking", "Gebruik korte, subtiele stoppels in plaats van een
    geometrische baardplaat"): de kleur eerst 'verzadiging' keer zo verzadigd, de kopie 'maat' pixels breed, de ruwheid
    'ruw'; met 'stoppels' bakt stoppels() er de stoppels, de snor, de wenkbrauwen en wat blos op de neus en de wangen in
    (de baard als vorm valt dan weg: baard.vorm false)."""
    Hd = S['huid']
    if Hd.get('behouden'):  # ronde 10: de huid van HumGen blijft zoals hij is
        return
    for mat in lijf.data.materials:
        for n in mat.node_tree.nodes:
            if n.type != 'TEX_IMAGE' or n.image is None:
                continue
            img = n.image
            px = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
            img.pixels.foreach_get(px)
            px = px.reshape(-1, 4)
            grijs = px[:, :3] @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
            px[:, :3] = grijs[:, None] + (px[:, :3] - grijs[:, None]) * Hd.get('verzadiging', 1.0)
            px[:, :3] *= np.array(sh.lin(Hd['tint'])[:3], dtype=np.float32)
            kopie = bpy.data.images.new('soldaat-huid', img.size[0], img.size[1])
            kopie.pixels.foreach_set(px.ravel())
            if Hd.get('maat', img.size[0]) != img.size[0]:
                kopie.scale(Hd['maat'], Hd['maat'])
            if Hd.get('stoppels'):
                stoppels(lijf, m, mat, kopie)
            kopie.filepath_raw = os.path.join(UIT, 'bron', 'soldaat-huid.png')
            kopie.file_format = 'PNG'
            kopie.save()
            kopie.source = 'FILE'
            kopie.reload()
            n.image = kopie
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED' and 'ruw' in Hd:
                n.inputs['Roughness'].default_value = Hd['ruw']


def stoppels(lijf, m, mat, beeld):
    """De stoppels in de huid (ronde 7): per punt van het lijf hoe dicht het haar staat ('stoppel': kaak, kin en hals tot
    een onregelmatige lijn van de mondhoek schuin naar de bakkebaard, de lippen vrij, de snor apart; 'brauw': een boog
    boven elk oog; 'blos': de neus en de wangen), en dan in Cycles de kleur gebakken in `beeld`: de huid wat donkerder en
    koeler waar de stoppels staan ('schaduw'), wat roder op de neus en de wangen ('blos'), daarover de haartjes uit fijne
    ruis (meer naarmate 'stoppel' hoger is, zodat ze naar de rand uitlopen) en de haren van de wenkbrauwen langs de boog."""
    from mathutils import noise
    St = S['huid']['stoppels']
    g = m.gezicht
    mond, kin = g['oris01'], g['special04']
    z_oog = (g['eye.L'].z + g['eye.R'].z) / 2
    y_mid = m.B('head').y + 0.005
    D = St['dicht']
    # de lippen: van het bot oris01 (onder de onderlip) tot net onder de neus; de mondnaad daartussen
    lip_boven = m.neus.z - 0.017
    naad = (mond.z + lip_boven) / 2
    w = {'stoppel': [], 'brauw': [], 'blos': []}
    for v in lijf.data.vertices:
        p = v.co
        ax = abs(p.x)
        voor = glad(y_mid + 0.02 - p.y, 0.0, 0.012)
        grens = min(naad + max(0.0, ax - 0.026) * 0.85, z_oog - 0.03) + St['rand'] * noise.noise(p * 80.0)
        d = glad(grens - p.z, -0.004, 0.008) * glad(p.z - (kin.z - 0.05), 0.0, 0.025)
        lip = (glad(0.026 - ax, -0.004, 0.004) * glad(p.z - mond.z - 0.001, -0.002, 0.002)
               * glad(lip_boven - p.z, -0.002, 0.002))
        snor = glad(0.034 - ax, -0.004, 0.008) * glad(p.z - lip_boven, -0.002, 0.002) * glad(m.neus.z - 0.009 - p.z, -0.002, 0.002)
        kinvol = glad(mond.z - p.z, 0.0, 0.04) * glad(0.045 - ax, 0.0, 0.03)
        w['stoppel'].append(voor * max(d * (1 - lip) * (D[0] + D[1] * kinvol), snor * D[2]))
        oog = min((g['eye.L'], g['eye.R']), key=lambda e: abs(p.x - e.x))
        dx = p.x - oog.x
        zc = oog.z + St['brauw_hoog'] - 6.0 * dx * dx
        half = 0.003 - 0.04 * max(0.0, dx * math.copysign(1.0, oog.x))
        w['brauw'].append(D[3] * glad(0.024 - abs(dx), -0.003, 0.004) * glad(half - abs(p.z - zc), -0.0015, 0.0015)
                          * glad(oog.y - 0.002 - p.y, 0.0, 0.004))
        wang = Vector((math.copysign(0.038, p.x), oog.y, oog.z - 0.032))
        w['blos'].append(voor * min(1.0, 0.8 * math.exp(-((p - m.neus).length / 0.013) ** 2) + math.exp(-((p - wang).length / 0.02) ** 2)))
    for naam, waarden in w.items():
        a = lijf.data.attributes.new(naam, 'FLOAT', 'POINT')
        a.data.foreach_set('value', waarden)
    k = sh.Knopen('huid-bak')
    tex = k.n('ShaderNodeTexImage', image=beeld)
    kenmerk = lambda naam: k.n('ShaderNodeAttribute', attribute_name=naam).outputs['Fac']
    st, br, bl = kenmerk('stoppel'), kenmerk('brauw'), kenmerk('blos')
    kl = k.meng(k.w('MULTIPLY', st, St['schaduw']), tex.outputs['Color'], sh.lin(St['schaduw_kleur']), 'MULTIPLY')
    kl = k.meng(k.w('MULTIPLY', bl, St['blos']), kl, sh.lin(St['blos_kleur']), 'MULTIPLY')
    fijn = k.ruis(St['fijn'], 2.0, rek=(1.0, 1.0, 0.6))
    f = k.w('MULTIPLY', k.glad(k.w('SUBTRACT', fijn, k.w('SUBTRACT', 0.72, k.w('MULTIPLY', st, 0.4))), -0.04, 0.04), k.glad(st, 0.0, 0.2))
    haar = k.meng(k.glad(k.ruis(40, 2), 0.35, 0.65), sh.lin(St['kleur']), sh.lin(St['licht']))
    kl = k.meng(k.w('MULTIPLY', f, St['haar']), kl, haar)
    bh = k.ruis(St['fijn'] * 0.6, 2.0, rek=(0.2, 1.0, 1.0))  # de haren van de wenkbrauwen langs de boog
    fb = k.w('MULTIPLY', k.w('ADD', k.w('MULTIPLY', k.glad(bh, 0.42, 0.56), 0.6), 0.35), br)
    kl = k.meng(fb, kl, sh.lin(St['brauw_kleur']))
    k.zet(k.bsdf.inputs['Base Color'], kl)
    doel = bpy.data.images.new('huid-bak', beeld.size[0], beeld.size[1])
    bak = k.n('ShaderNodeTexImage', image=doel)
    bak.select = True
    k.nt.nodes.active = bak
    sc = bpy.context.scene
    oud = (sc.render.engine, sc.cycles.samples, lijf.material_slots[0].material)
    sc.render.engine, sc.cycles.samples = 'CYCLES', 1
    lijf.material_slots[0].material = k.m
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    lijf.select_set(True)
    bpy.context.view_layer.objects.active = lijf
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, margin=16, use_clear=True)
    px = np.empty(doel.size[0] * doel.size[1] * 4, dtype=np.float32)
    doel.pixels.foreach_get(px)
    beeld.pixels.foreach_set(px)
    sc.render.engine, sc.cycles.samples, lijf.material_slots[0].material = oud
    for naam in w:
        lijf.data.attributes.remove(lijf.data.attributes[naam])
    bpy.data.materials.remove(k.m)
    bpy.data.images.remove(doel)


def mat_oog():
    """Het oog (ronde 6, Marcel: "een donkere ooglijn, subtiele oogwitwaarden"): op het kenmerk 'oog' (hoe recht de plek
    vooruit kijkt) van buiten naar binnen een donkere lijn waar de oogleden over de bol vallen ('lijn'), gedempt oogwit,
    de iris en de pupil."""
    O = S['ogen']
    k = sh.Knopen('oog')
    a = k.n('ShaderNodeAttribute', attribute_name='oog').outputs['Fac']
    kl = k.meng(k.glad(a, O['lijn'] - 0.06, O['lijn']), sh.lin(O['lijn_kleur']), sh.lin(O['wit']))
    kl = k.meng(k.glad(a, O['iris_rand'], O['iris_rand'] + 0.03), kl, sh.lin(O['iris']))
    kl = k.meng(k.glad(a, 0.955, 0.965), kl, sh.lin('#0a0705'))
    m = k.af(kl, ruw=0.35, holte=0.6)
    m['kleur'] = O['iris']
    return m


def mat_baard():
    """Stoppels (ronde 6): haar in fijne donkere punten en streepjes (ruis die snel over de breedte en trager omlaag gaat),
    zoveel als het kenmerk 'dicht' zegt (de snor en de wenkbrauwen bijna vol, naar de rand niets); daartussen is de laag
    doorzichtig, zodat de huid van het lijf erdoor komt (een eigen huidkleur gaf een lichte vlek). Mat, met wat reliëf."""
    B = S['baard']
    k = sh.Knopen('baard')
    dicht = k.n('ShaderNodeAttribute', attribute_name='dicht').outputs['Fac']
    fijn = k.ruis(9, 2, rek=(160, 160, 60))
    pluk = k.ruis(3, 2, rek=(25, 25, 12))
    haar = k.meng(k.glad(pluk, 0.35, 0.65), sh.lin(B['kleur']), sh.lin(B['licht']))
    drempel = k.w('SUBTRACT', 0.75, k.w('MULTIPLY', dicht, 0.45))  # dicht 1: bijna overal haar, 0: bijna niets
    f = k.w('MULTIPLY', k.glad(k.w('SUBTRACT', fijn, drempel), -0.06, 0.06), k.glad(dicht, 0.0, 0.25))
    k.zet(k.bsdf.inputs['Alpha'], f)
    k.bobbel(k.w('MULTIPLY', fijn, 0.5), 0.3, 0.001)
    m = k.af(haar, ruw=0.85, holte=0.4)
    m['kleur'] = B['kleur']
    return m


def materialen():
    M = {
        'hozen': sh.mat_stof('hozen', K['broek'], 30, 0.3, textuur=('hessian_230', 0.5)),
        # ronde 12: de vaste kleuren van het wambuis van de speerman anders ('kleuren': [oud, nieuw] in hex)
        'wambuis': kleuren_van(sh.mat_wambuis(), S['gambeson'].get('kleuren', [])),
        'handschoen': sh.mat_leer('handschoen', K['handschoen'], '#22140c'),
        'blauw': mat_tabberd('tabberd-blauw', K['blauw'], '#2c3c78'),
        'geel': mat_tabberd('tabberd-geel', K['geel'], '#ffaa14'),
        'helm': mat_helm(),
        'staal': sh.mat_staal('staal', K['staal'], 0.28),
        'hout': sh.mat_hout(*S['speer']['hout']),
        'riem': sh.mat_leer('riem', K['riem'], '#4a2010'),
        'leer': sh.mat_leer('leer', K['buidel']),
        'laars': mat_laars(),
        'omslag': sh.mat_leer('omslag', K['omslag'], '#5a2a10'),
        'koord': sh.mat_leer('koord', '#9a5a2a', '#4a2410'),
        'blad': sh.mat_blad(),
        'malien': mat_malien(),
        'gat': sh.mat_leer('gat', '#1a0e08', '#0a0604'),
        'zool': sh.mat_leer('zool', S['laarzen']['zool_kleur'], '#120a06'),
        'oog': mat_oog(),
        'baard': mat_baard(),
    }
    # de gemiddelde kleur van elk materiaal, voor de GLB (de knopen gaan niet mee)
    for naam, kl in (('hozen', K['broek']), ('wambuis', '#7a3e24'), ('handschoen', K['handschoen']), ('helm', K['helm']),
                     ('staal', K['staal']), ('hout', '#94482a'), ('riem', K['riem']), ('leer', K['buidel']),
                     ('laars', '#a85a2c'), ('omslag', K['omslag']), ('koord', '#9a5a2a'), ('blad', '#c0c0cc'),
                     ('malien', S['malienkraag']['kleur']), ('gat', '#1a0e08'), ('zool', S['laarzen']['zool_kleur'])):
        M[naam]['kleur'] = kl
    return M


# ---------------------------------------------------------------- de onderdelen

class Maten:
    """De plekken op het skelet in rust die de onderdelen gebruiken."""

    def __init__(self, rig, bron):
        B = lambda b: rig.data.bones[b].head_local.copy()
        T = lambda b: rig.data.bones[b].tail_local.copy()
        self.B, self.T = B, T
        self.heup = B('upperleg01.L').z
        self.knie = B('lowerleg01.L').z
        self.nek = B('neck01')
        self.riem = self.heup + S['tabberd']['riem_boven_heup']
        self.zoom = self.knie + S['tabberd']['zoom_boven_knie']
        self.laars = self.knie - S['laarzen']['onder_knie']
        self.oksel = B('upperarm01.L').z - 0.08
        hoofd = som(bron, KOP)
        hp = [v.co.copy() for v, w in zip(bron.data.vertices, hoofd) if w > 0.5 and v.co.z > B('head').z - 0.02]
        neus = min(hp, key=lambda p: p.y)
        self.oog = neus.z + 0.032
        self.neus = neus
        self.hoofd = hp
        # waar de botten van het gezicht stonden (bouw.py bewaarde ze): de mond, de kin, de kaak, de ogen
        self.gezicht = {k: Vector(p) for k, p in json.loads(rig['gezicht']).items()}

    def hals(self, onder):
        """Het vlak van een halslijn `onder` meter onder de nek, van voren lager dan achter."""
        return ((0, self.nek.y, self.nek.z - onder), (0, -0.45, 1), 0.16)

    def pols(self, k, terug):
        a = (self.B(f'wrist.{k}') - self.B(f'lowerarm01.{k}')).normalized()
        return self.B(f'wrist.{k}') - a * terug, a

    def vulling(self, p):
        """Hoe dik de vulling hier mag (1 overal, tot 'oksel' in de oksel): onder de arm is een gambeson dun, anders zakt de
        dikke stof in het lijf als de arm uit de A-houding omlaag gaat."""
        G = S['gambeson']
        k = 'L' if p.x > 0 else 'R'
        d = (p - stand.gebied_rust(self.B, f'oksel.{k}')).length
        return 1 - (1 - G['oksel']) * (1 - glad(d, 0.03, G['oksel_straal']))

    def arm_as(self, k):
        A = self.B(f'upperarm01.{k}')
        return A, (self.T(f'upperarm02.{k}') - A).normalized()


def broek(bron, rig, m, M):
    B = S['broek']
    boven, onder = m.heup + B['boven_heup'], m.laars - 0.06
    arm = som(bron, ARM)
    kies = [a < 0.05 and onder - 0.03 < v.co.z < boven + 0.03 for v, a in zip(bron.data.vertices, arm)]
    ob = uit_huid('broek', bron, kies, [((0, 0, boven), (0, 0, 1), None), ((0, 0, onder), (0, 0, -1), None)])
    spannen(ob, 6)
    gewichten(ob, bron, rig)
    naar_buiten(ob, lambda i, p: B['afstand'])
    versimpel(ob, S['budget']['broek'] / 2)
    ob.data.materials.append(M['hozen'])
    dik(ob, B['dikte'])
    return ob


def kussens(ob, m, armw):
    """De ruiten van de gambeson per punt (1 bol, 0 in de naad): op de mouwen om één as per arm (van de schouder naar de
    pols, zoals speerman_hd.wambuis), op het lijf om de staande as; waar de arm overgaat in het lijf gemengd."""
    G = S['gambeson']
    r = G['ruit']
    uit = []
    assen = {k: (m.B(f'upperarm01.{k}'), (m.B(f'wrist.{k}') - m.B(f'upperarm01.{k}')).normalized()) for k in 'LR'}
    voor = Vector((0, -1, 0))
    for v, w in zip(ob.data.vertices, armw):
        p = v.co
        # het lijf: om de staande as, zo'n 20 ruiten rondom
        hoek = math.atan2(p.x, -p.y)
        rond = hoek / (2 * math.pi) * 20 * r
        fu, fw = ((p.z + rond) / r) % 1.0, ((p.z - rond) / r) % 1.0
        lijf = (math.sin(math.pi * fu) * math.sin(math.pi * fw)) ** G['naad']
        a, as_ = assen['L' if p.x > 0 else 'R']
        langs = (p - a).dot(as_)
        x1 = (voor - as_ * voor.dot(as_)).normalized()
        y1 = as_.cross(x1)
        q = p - a - as_ * langs
        rond = math.atan2(q.dot(y1), q.dot(x1)) / (2 * math.pi) * G['rondom'] * r
        fu, fw = ((langs + rond) / r) % 1.0, ((langs - rond) / r) % 1.0
        mouw = (math.sin(math.pi * fu) * math.sin(math.pi * fw)) ** G['naad']
        uit.append(lijf + (mouw - lijf) * w)
    return uit


# ---------------------------------------------------------------- ronde 13: kleding uit bestaande assets

def texturen_vervangen():
    """Ronde 13 (Marcel: "Gebruik professionele PBR-materialen als basis"): per materiaal een textuur van Poly Haven
    (speerman_hd.Knopen.textuur: van de kleur het licht en donker rond zijn gemiddelde, en de normal map) vervangen door
    een CC0-set uit assets/extern ('texturen': [{'materiaal': het begin van de naam, 'van': de naam bij Poly Haven,
    'naar': de map van de set}]), op dezelfde tegel; het gemiddelde (de deler) gaat mee."""
    for T in S.get('texturen', []):
        map_ = os.path.join(HIER, '..', '..', '..', T['naar'])
        bestand = lambda soort: os.path.join(map_, next(f for f in os.listdir(map_) if f.endswith(f'_{soort}.jpg')))
        for m in [m for m in bpy.data.materials if m.node_tree and m.name.startswith(T['materiaal'])]:
            nt = m.node_tree
            for n in [n for n in nt.nodes if n.type == 'TEX_IMAGE' and n.image]:
                b = os.path.basename(n.image.filepath)
                if not b.startswith(T['van'] + '_'):
                    continue
                kleur = '_diff' in b or '_albedo' in b
                img = bpy.data.images.load(bestand('Color' if kleur else 'NormalGL'), check_existing=True)
                if kleur:
                    if 'gem' not in img:
                        px = np.empty(img.size[0] * img.size[1] * 4, dtype=np.float32)
                        img.pixels.foreach_get(px)
                        px = px.reshape(-1, 4)
                        img['gem'] = float((px[:, 0] * 0.2126 + px[:, 1] * 0.7152 + px[:, 2] * 0.0722).mean())
                    oud = n.image.get('gem')
                    for x in nt.nodes:
                        if x.type == 'MATH' and x.operation == 'DIVIDE' and oud is not None and abs(x.inputs[1].default_value - oud) < 1e-6:
                            x.inputs[1].default_value = img['gem']
                else:
                    img.colorspace_settings.name = 'Non-Color'
                n.image = img


def kleurtextuur(m):
    """De kleurtextuur van een materiaal van Human Generator en zijn gemiddelde helderheid (lineair), of (None, None)."""
    for n in m.node_tree.nodes:
        if n.type == 'TEX_IMAGE' and n.image and 'basecolor' in n.image.name.lower().replace('_', ''):
            px = np.empty(len(n.image.pixels), np.float32)
            n.image.pixels.foreach_get(px)
            c = px.reshape(-1, 4)[::7, :3]
            c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
            return n, float((c @ np.array([0.2126, 0.7152, 0.0722])).mean())
    return None, None


def kleur_over(m, naam, kleur, gloed=None, top=1.25):
    """Ronde 13: een kopie van het materiaal van een kledingstuk uit de assets met de kleur van de soldaat, maar met zijn
    eigen detail: de nieuwe kleur maal de helderheid van zijn kleurtextuur (zelf, niet na de kleurknopen van HumGen, die
    hem donkerder kleuren) gedeeld door het gemiddelde, begrensd op `top` (een witte sjerp in de textuur werd anders een
    lichte band), met zijn eigen normal map en ruwheid; met `gloed` de zachte gloed van mat_tabberd."""
    k = m.copy()
    k.name = naam
    nt = k.node_tree
    bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    bc = bsdf.inputs['Base Color']
    tex, gem = kleurtextuur(k)
    if gloed:
        bsdf.inputs['Emission Color'].default_value = sh.lin(gloed)
        bsdf.inputs['Emission Strength'].default_value = sh.GEEL_GLOED
    if tex and gem:
        bw = nt.nodes.new('ShaderNodeRGBToBW')
        nt.links.new(tex.outputs['Color'], bw.inputs[0])
        deel = nt.nodes.new('ShaderNodeMath')
        deel.operation, deel.use_clamp = 'DIVIDE', False
        nt.links.new(bw.outputs[0], deel.inputs[0])
        deel.inputs[1].default_value = gem
        grens = nt.nodes.new('ShaderNodeMath')
        grens.operation = 'MINIMUM'
        nt.links.new(deel.outputs[0], grens.inputs[0])
        grens.inputs[1].default_value = top
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type, mix.blend_type = 'RGBA', 'MULTIPLY'
        mix.inputs['Factor'].default_value = 1.0
        a, b = [s for s in mix.inputs if s.type == 'RGBA']
        a.default_value = sh.lin(kleur)
        nt.links.new(grens.outputs[0], b)
        nt.links.new([s for s in mix.outputs if s.type == 'RGBA'][0], bc)
    else:
        for l in list(bc.links):
            nt.links.remove(l)
        bc.default_value = sh.lin(kleur)
    k['kleur'] = kleur
    return k


def van_buiten(E, kleuren, onder=None):
    """Ronde 13: een kledingstuk uit de assets van Human Generator (`E['object']`; humgen/naar_basis.kleding heeft het al
    op de maat van deze man gezet, zonder capuchon, mouwen of losse riemen), met de kleuren van de soldaat over zijn eigen
    detail (kleur_over, een materiaal per (naam, kleur) of (naam, kleur, gloed)), en zo nodig onder `onder` meter
    afgeknipt."""
    ob = bpy.data.objects[E['object']]
    if onder is not None:
        bm = bmesh.new()
        bm.from_mesh(ob.data)
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if all(v.co.z < onder for v in f.verts)], context='FACES')
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
        bm.to_mesh(ob.data)
        bm.free()
    eigen = ob.data.materials[0]
    ob.data.materials.clear()
    for naam, kleur, *gloed in kleuren:
        ob.data.materials.append(kleur_over(eigen, naam, kleur, *gloed))
    return ob


def gambeson(bron, rig, m, M):
    G = S['gambeson']
    if G.get('extern'):
        # ronde 13: de gambeson uit een bestaand kledingstuk (een gewatteerde jas), in het bruin van het wambuis
        return van_buiten(G['extern'], [('wambuis-buiten', G['extern'].get('kleur', '#965238'))], m.heup - G['onder_heup'])
    hoofd, hand, been = som(bron, HOOFD), som(bron, HAND), som(bron, BEEN)
    onder = m.heup - G['onder_heup']
    kies = [h < 0.6 and hd < 0.5 and b < 0.5 and v.co.z > onder - 0.03
            for v, h, hd, b in zip(bron.data.vertices, hoofd, hand, been)]
    sneden = [((0, 0, onder), (0, 0, -1), None), m.hals(G['hals'])]
    for k in 'LR':
        p, a = m.pols(k, G['pols'])
        sneden.append((p, a, 0.16))
    ob = uit_huid('gambeson', bron, kies, sneden, sub=G['sub'])
    spannen(ob, G['glad'])
    gewichten(ob, bron, rig)
    # hoe ver een punt mouw is: de gewichten van de arm, en pas voorbij het schoudergewricht (op de schouder plat: daar
    # ligt de tabberd overheen)
    arm = som(ob, ('upperarm', 'lowerarm'))
    mouw = []
    for v, a in zip(ob.data.vertices, arm):
        A, as_ = m.arm_as('L' if v.co.x > 0 else 'R')
        mouw.append(glad(a, 0.3, 0.9) * glad((v.co - A).dot(as_), 0.0, 0.08))
    kus = kussens(ob, m, mouw)
    # ronde 11: een manchet, een dikkere band aan het eind van de mouw ('manchet': hoe lang, hoe veel dikker), net boven
    # de kap van de handschoen: eronder stak hij door de kap (de doorsteektoets, Z en ZW)
    manchet = [0.0] * len(ob.data.vertices)
    if G.get('manchet'):
        lang, extra = G['manchet']
        begin = S['handschoenen']['kap'] - G['pols']
        for v in ob.data.vertices:
            k = 'L' if v.co.x > 0 else 'R'
            P0, a = m.pols(k, G['pols'])
            d = (Vector(P0) - v.co).dot(a) - begin
            manchet[v.index] = extra * mouw[v.index] * glad(d, 0.0, 0.008) * glad(lang - d, 0.0, 0.008)
    naar_buiten(ob, lambda i, p: G['afstand'] + manchet[i] + (G['kussen'] * (0.35 + 0.65 * kus[i]) + G['mouw'] * mouw[i] * (0.5 + 0.5 * kus[i]))
                * m.vulling(p))
    a = ob.data.attributes.new('kussen', 'FLOAT', 'POINT')
    a.data.foreach_set('value', kus)
    versimpel(ob, S['budget']['gambeson'] / 2)
    ob.data.materials.append(M['wambuis'])
    dik(ob, G['dikte'])
    kraag_ob = kraag(bron, rig, m, M)
    ob = samen('gambeson', [ob, kraag_ob])
    return ob


def kraag(bron, rig, m, M):
    G, Kr = S['gambeson'], S['kraag']
    hoofd = som(bron, HOOFD)
    boom = sh.bvh_van([(bron, [w > 0.3 for w in hoofd])])
    o = Vector(m.hals(G['hals'])[0]) - Vector((0, 0, 0.01))
    as_ = (m.B('head') - m.nek).normalized()
    ts = [Kr['achter'] * i / 8 for i in range(9)]
    lengte = lambda th: (Kr['voor'] + (Kr['achter'] - Kr['voor']) * (1 - math.cos(th)) / 2) / Kr['achter']
    dikte = (G['afstand'] + G['kussen']) * Kr.get('vulling', 1.0) + Kr['uit']  # ronde 7: 'vulling', minder dik dan de gambeson
    ringen, _, _ = ringen_om(boom, o, as_, ts, lambda t, th: dikte + Kr['wijd'] * t / Kr['achter'], 48, lengte=lengte)
    ob = buis('kraag', ringen, M['wambuis'])
    # gewatteerd in banen rondom: de ruiten van de gambeson als banen
    kus = []
    for v in ob.data.vertices:
        t = (v.co - o).dot(as_)
        kus.append(math.sin(math.pi * ((t / 0.022) % 1.0)) ** 0.3)
    a = ob.data.attributes.new('kussen', 'FLOAT', 'POINT')
    a.data.foreach_set('value', kus)
    for g in bron.vertex_groups:
        ob.vertex_groups.new(name=g.name)
    gewichten(ob, bron, rig)
    dik(ob, 0.006)
    return ob


def gesmolten(naam, delen, voxel, rondes):
    """Delen samensmelten tot één gladde, gesloten huid (voxel remesh en gladstrijken, zoals speerman_hd.smelt)."""
    ob = samen(naam, delen)
    rm = ob.modifiers.new('remesh', 'REMESH')
    rm.mode = 'VOXEL'
    rm.voxel_size = voxel
    bouw.toepassen(ob, 'remesh')
    sm = ob.modifiers.new('glad', 'SMOOTH')
    sm.factor, sm.iterations = 0.7, rondes
    bouw.toepassen(ob, 'glad')
    return ob


def voetvorm(vp, start, richting, opzij, lengte, L):
    """De maat van de laars langs de voet (ronde 5, Marcel: "anatomischer, met een duidelijkere neus, hiel en zool"), van
    de hiel (u 0) naar de neus (u 1): per u het midden opzij, de halve breedte, de onderkant van het bovenleer (de
    bovenkant van de zool) en de hoogte erboven. De hiel recht en rond, de bal het breedst, de neus smaller en lager met
    een ronde punt die wat opkrult; nooit binnen de huid van de voet (per stuk de huid plus 'afstand')."""
    n = 24
    huid = [None] * n  # per stuk langs de voet: kleinste en grootste plek opzij, en het hoogste punt
    for q in vp:
        d = q - start
        i = min(n - 1, max(0, int(d.dot(richting) / lengte * n)))
        s = d.dot(opzij)
        h = huid[i] or [s, s, 0.0]
        huid[i] = [min(h[0], s), max(h[1], s), max(h[2], q.z)]
    for i in range(n):  # stukken zonder huid (achter de hiel, voor de tenen) nemen hun buur
        huid[i] = huid[i] or next(huid[j] for j in sorted(range(n), key=lambda j: abs(j - i)) if huid[j])
    W = max(h[1] - h[0] for h in huid) / 2 + L['breder']
    a = L['afstand'] + L['voet_marge']

    def maat(u):
        h = huid[min(n - 1, int(u * n))]
        if u < 0.1:
            half = 0.78 * W * math.sqrt(max(0.0, 1 - (1 - u / 0.1) ** 2))
        elif u < 0.68:
            half = W * (0.78 + 0.22 * glad(u, 0.15, 0.68))
        else:
            half = W * max(0.0, 1 - ((u - 0.68) / 0.32) ** 2) ** 0.7
        krul = L['krul'] * glad(u, 0.75, 1.0) ** 2
        onder = L['hak'] * (1 - glad(u, 0.24, 0.34)) + krul
        hoog = (L['wreef'] * (1 - glad(u, 0.35, 0.68)) + L['neus'] * glad(u, 0.35, 0.68)) * (1 - glad(u, 0.9, 1.0) * 0.65)
        if 0.04 < u < 0.97:  # de huid erin: breder en hoger waar hij er anders door zou steken
            half = max(half, (h[1] - h[0]) / 2 + a)
            hoog = max(hoog, h[2] - onder + a)
        return (h[0] + h[1]) / 2, half, onder, hoog
    return [(start + richting * (lengte * u), opzij) + maat(u) for u in [0.5 - 0.5 * math.cos(math.pi * i / 39) for i in range(40)]]


def bovenleer(vorm):
    """Het bovenleer langs de voetvorm: per stuk een doorsnede met een platte onderkant en ronde hoeken, het breedst op een
    derde van de hoogte, bol erboven."""
    vs, fs, n = [], [], 32
    for c, opzij, mid, half, onder, hoog in vorm:
        for j in range(n):
            f = 2 * math.pi * j / n
            co, si = math.cos(f), math.sin(f)
            if si < 0:
                x, z = math.copysign(abs(co) ** 0.4, co), 0.3 * (1 - abs(si) ** 0.4)
            else:
                x, z = math.copysign(abs(co) ** 0.6, co), 0.3 + 0.7 * abs(si) ** 0.6
            vs.append(c + opzij * (mid + half * x) + Vector((0, 0, onder + hoog * z)))
    for i in range(len(vorm) - 1):
        for j in range(n):
            fs.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    fs += [tuple(range(n))[::-1], tuple(range((len(vorm) - 1) * n, len(vorm) * n))]
    return sh.maak('voet', vs, fs)


def zool(vorm, L):
    """De zool onder het bovenleer: 'welt' meter breder dan het leer, van onder plat op 'zool' meter onder de voet; de hak
    tot een derde van de voet, dan de holte onder de wreef ('boog' omhoog), en de neus die met het leer opkrult."""
    vs, fs, n, w = [], [], 6, L['welt']
    for i, (c, opzij, mid, half, onder, hoog) in enumerate(vorm):
        u = i / (len(vorm) - 1)
        eind = -w if i == 0 else (w if i == len(vorm) - 1 else 0.0)
        c = c + Vector((opzij.y, -opzij.x, 0)) * eind  # de uiteinden 'welt' verder (opzij gedraaid is de richting)
        hs = half + w
        b = min(0.003, hs * 0.4)
        krul = L['krul'] * glad(u, 0.75, 1.0) ** 2
        bo = -L['zool'] + L['boog'] * glad(u, 0.27, 0.30) * (1 - glad(u, 0.36, 0.56)) + krul
        top = onder + 0.002
        for x, z in ((-hs, bo + b), (-hs + b, bo), (hs - b, bo), (hs, bo + b), (hs, top), (-hs, top)):
            vs.append(c + opzij * (mid + x) + Vector((0, 0, z)))
    for i in range(len(vorm) - 1):
        for j in range(n):
            fs.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    fs += [tuple(range(n))[::-1], tuple(range((len(vorm) - 1) * n, len(vorm) * n))]
    ob = sh.maak('zool', vs, fs)
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(ob.data)
    bm.free()
    return ob


def laarzen(bron, rig, m, M):
    """Leren laarzen tot halverwege de kuit, gebouwd zoals speerman_hd.laarzen: een schacht om het onderbeen in zijn eigen
    vorm, een cilinder om de enkel tot het bovenleer van de voet (voetvorm, bovenleer), samengesmolten tot één gladde
    huid, en daaronder een losse zool met een hak (zool). Bovenaan een omgeslagen rand."""
    L = S['laarzen']
    been = som(bron, ('lowerleg', 'foot', 'toe'))
    voet = som(bron, ('foot', 'toe'))
    delen, zolen = [], []
    for k, z in (('L', 1), ('R', -1)):
        boom = sh.bvh_van([(bron, [b > 0.4 and p.co.x * z > 0 for b, p in zip(been, bron.data.vertices)])])
        kn, en = m.B(f'lowerleg01.{k}'), m.T(f'lowerleg02.{k}')
        a = (en - kn).normalized()  # omlaag langs het scheenbeen
        boven = kn + a * ((kn.z - m.laars) / -a.z)
        d = (en - boven).length
        ringen, x1, y1 = ringen_om(boom, boven, a, [d * i / 12 for i in range(13)], lambda t, th: L['afstand'], 48)
        schacht = buis('schacht.' + k, ringen)
        sl = schacht.modifiers.new('dik', 'SOLIDIFY')
        sl.thickness, sl.offset = 0.006, -1
        bouw.toepassen(schacht, 'dik')
        # de enkel tot de zool: een cilinder zo dik als de enkel gemiddeld (met de grootste stak hij achter de hiel uit)
        rs = [sh.straal(boom, en - a * 0.015, x1 * math.cos(t) + y1 * math.sin(t), 0.2) for t in [i * math.pi / 8 for i in range(16)]]
        rs = [r for r in rs if r is not None] or [0.04]
        r_enkel = sum(rs) / len(rs) + L['afstand']
        grond = en + a * ((en.z - L['hak'] - 0.002) / -a.z)  # tot net in het bovenleer boven de hak
        bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r_enkel, depth=(en - grond).length, location=(en + grond) / 2,
                                            rotation=Vector((0, 0, 1)).rotation_difference(en - grond).to_euler())
        enkel = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        # de voet langs de as van de hiel naar het midden van de tenen (naar de grote teen staken de kleine tenen er opzij uit)
        vp = [p.co.copy() for p, w in zip(bron.data.vertices, voet) if w > 0.4 and p.co.x * z > 0 and p.co.z < 0.08]
        teen, hiel = min(vp, key=lambda q: q.y), max(vp, key=lambda q: q.y)
        tenen = [q for q in vp if q.y < teen.y + 0.06]
        neus = Vector(((min(q.x for q in tenen) + max(q.x for q in tenen)) / 2, teen.y, 0))
        richting = Vector((neus.x - hiel.x, neus.y - hiel.y, 0)).normalized()
        opzij = Vector((-richting.y, richting.x, 0))
        lengte = (neus.xy - hiel.xy).length + L['langer'] + L['achter']
        start = Vector((hiel.x, hiel.y, 0)) - richting * L['achter']
        vorm = voetvorm(vp, start, richting, opzij, lengte, L)
        delen.append(gesmolten('laars.' + k, [schacht, enkel, bovenleer(vorm)], 0.004, 4))
        zolen.append(zool(vorm, L))
    ob = samen('laarzen', delen)
    versimpel(ob, S['budget']['laarzen'])
    gewichten(ob, bron, rig)
    ob.data.materials.append(M['laars'])
    # ronde 4 (Marcel: "meer vorm en details in de leren laarzen"): kreukels voor de enkel
    me = ob.data
    me.update()
    ns = [x.normal.copy() for x in me.vertices]
    for x, nr in zip(me.vertices, ns):
        p = x.co
        k = 'L' if p.x > 0 else 'R'
        en = m.T(f'lowerleg02.{k}')
        voor = glad(en.y - p.y, 0.0, 0.03)
        if voor > 0:
            x.co += nr * L['kreukels'] * voor * math.sin(2 * math.pi * (p.z - 0.05) / 0.017) * glad(p.z, 0.05, 0.08) * glad(p.z, 0.17, 0.13)
    sh.zacht(ob)
    zo = samen('zolen', zolen)
    zo.data.materials.append(M['zool'])
    gewichten(zo, bron, rig)  # vlak gearceerd: de zool krijgt scherpe randen
    delen = [ob, zo]
    for k in 'LR':
        boom = bvh(ob, kant=k)
        a = (m.T(f'lowerleg02.{k}') - m.B(f'lowerleg01.{k}')).normalized()
        t0 = (m.laars - 0.003 - m.B(f'lowerleg01.{k}').z) / a.z  # net onder de rand van de schacht: daarboven raakt een straal niets
        o = m.B(f'lowerleg01.{k}') + a * t0
        ts = [L['omslag'] * i / 5 for i in range(6)]
        ringen, _, _ = ringen_om(boom, o, a, ts, lambda t, th: L['omslag_uit'] + 0.002 * (1 - t / L['omslag']), 40, bol=True)
        om = buis(f'omslag.{k}', ringen, M['omslag'])
        gewichten(om, bron, rig)
        dik(om, 0.004)
        delen.append(om)
        # het riempje om de enkel, met een gespje aan de buitenkant
        bz, bh, buit = L['band']
        kn = m.B(f'lowerleg01.{k}')
        o = kn + a * ((bz + bh / 2 - kn.z) / a.z)
        ringen, x1, y1 = ringen_om(bvh(ob, kant=k), o, a, [bh * i / 3 for i in range(4)], lambda t, th: buit, 48, bol=True)
        band = buis(f'band.{k}', ringen, M['riem'])
        dik(band, 0.0025)
        mid = ringen[1][len(ringen[1]) * (1 if k == 'L' else 3) // 4]  # zijn buitenkant: links +x, rechts -x
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=mid + Vector((0.004 if k == 'L' else -0.004, 0, 0)))
        gesp = bpy.context.active_object
        gesp.scale = (0.004, 0.016, bh + 0.004)
        bpy.ops.object.transform_apply(scale=True)
        gesp.data.materials.append(M['staal'])
        band = samen(f'band.{k}', [band, gesp])
        for g in bron.vertex_groups:
            band.vertex_groups.new(name=g.name)
        gewichten(band, bron, rig)
        delen.append(band)
    return samen('laarzen', delen)


def handschoenen(bron, rig, m, M, gamb):
    H = S['handschoenen']
    hand = som(bron, ('lowerarm',) + HAND)
    vlak = {k: m.pols(k, 0.045) for k in 'LR'}
    kies = [h > 0.3 and (v.co - vlak['L' if v.co.x > 0 else 'R'][0]).dot(vlak['L' if v.co.x > 0 else 'R'][1]) > -0.06
            for v, h in zip(bron.data.vertices, hand)]
    sneden = [(p, -a, 0.2) for p, a in vlak.values()]
    ob = uit_huid('handschoenen', bron, kies, sneden)
    spannen(ob, 4)
    gewichten(ob, bron, rig)
    naar_buiten(ob, lambda i, p: H['afstand'])
    versimpel(ob, S['budget']['handschoenen'] / 2)
    ob.data.materials.append(M['handschoen'])
    dik(ob, H['dikte'])
    delen = [ob]
    for k in 'LR':
        boom = bvh(gamb, ob, kant=k)
        p, a = m.pols(k, 0.0)
        o = p + a * 0.01
        ts = [H['kap'] * i / 6 for i in range(7)]
        ringen, _, _ = ringen_om(boom, o, -a, ts, lambda t, th: 0.003 + H['kap_wijd'] * (t / H['kap']) ** 1.3, 40, bol=True)
        kap = buis(f'kap.{k}', ringen, M['handschoen'])
        for g in bron.vertex_groups:
            kap.vertex_groups.new(name=g.name)
        gewichten(kap, bron, rig)
        dik(kap, 0.003)
        delen.append(kap)
    return samen('handschoenen', delen)


def tabberd_van_buiten(m, gamb, T):
    """Ronde 13: de tabberd uit een bestaand kledingstuk (een hemd zonder mouwen, naar_basis.kleding): de rok onder de riem
    uitgerekt tot de zoom van de soldaat ('zoom_boven_knie'), over de gambeson gelegd (elk punt minstens 'uit' meter buiten
    het dichtstbijzijnde punt van de gambeson, langs diens normaal), en gevierendeeld zoals de gebouwde tabberd."""
    E = T['extern']
    K = {**S['kleuren'], **E.get('kleuren', {})}  # een eigen blauw en geel: dit materiaal kleurt anders dan mat_tabberd
    # (zonder de gloed van mat_tabberd en strakker begrensd: met de eigen schaduw van het hemd werd hij te fel)
    ob = van_buiten(E, [('tabberd-blauw', K['blauw'], None, E.get('top', 1.1)), ('tabberd-geel', K['geel'], None, E.get('top', 1.1))])
    laag = min(v.co.z for v in ob.data.vertices)
    f = (m.riem - m.zoom) / max(m.riem - laag, 1e-3)
    for v in ob.data.vertices:
        if v.co.z < m.riem:
            v.co.z = m.riem - (m.riem - v.co.z) * f
    bpy.context.view_layer.update()
    # alleen de romp van de gambeson: bij de oksel duwden zijn mouwen de rand van het armsgat als een flap naar buiten
    boom = sh.bvh_van([(gamb, [a < 0.3 for a in som(gamb, ARM)])])
    for _ in range(E.get('rondes', 2)):
        for v in ob.data.vertices:
            p, n, _, d = boom.find_nearest(v.co)
            if p is None:
                continue
            if n.dot(Vector((p.x, p.y - m.nek.y, 0.0))) < 0:  # naar buiten: van de staande as van het lijf af
                n = -n
            diep = (v.co - p).dot(n)
            if diep < E['uit']:
                v.co = v.co + n * (E['uit'] - diep)
        ob.data.update()
    geel_rechts = T.get('rechterborst', 'geel') == 'geel'
    for p in ob.data.polygons:
        boven, rechts = p.center.z > m.riem, p.center.x < 0
        p.material_index = 1 if (boven == rechts) == geel_rechts else 0
    return ob


def tabberd(bron, rig, m, M, gamb, br):
    T, G = S['tabberd'], S['gambeson']
    if T.get('extern'):
        return tabberd_van_buiten(m, gamb, T)
    arm, hoofd, been = som(bron, ARM), som(bron, HOOFD), som(bron, BEEN)
    kies = [a < 0.5 and h < 0.5 and b < 0.3 and v.co.z > m.riem - 0.03
            for v, a, h, b in zip(bron.data.vertices, arm, hoofd, been)]
    lijfje = uit_huid('lijfje', bron, kies, [((0, 0, m.riem - 0.004), (0, 0, -1), None), m.hals(T['hals'])])
    spannen(lijfje, 12)
    gewichten(lijfje, bron, rig, zonder=('lowerarm', 'wrist', 'finger', 'metacarpal'))
    am = som(lijfje, ('upperarm', 'lowerarm'))
    mouw = []
    for v, a in zip(lijfje.data.vertices, am):
        A, as_ = m.arm_as('L' if v.co.x > 0 else 'R')
        mouw.append(glad(a, 0.3, 0.9) * glad((v.co - A).dot(as_), 0.0, 0.08))
    naar_buiten(lijfje, lambda i, p: G['afstand'] + T['speling'] + (G['kussen'] + G['mouw'] * mouw[i]) * m.vulling(p))
    me = lijfje.data
    P = T['plooien']
    # de holtes overbrugd: per hoogte de punten naar de convexe rand van hun strook (de stof hangt over borst en rug, niet
    # in de holte ertussen); boven de oksels steeds minder, tot niets
    zs = np.array([v.co.z for v in me.vertices])
    strook = ((zs - m.riem) / 0.015).astype(int)
    for s_ in set(strook.tolist()):
        idx = np.nonzero(strook == s_)[0]
        z = float(zs[idx].mean())
        w = 1.0 - glad(z, m.oksel - 0.02, m.oksel + 0.06)
        if w <= 0 or len(idx) < 4:
            continue
        cy = float(np.mean([me.vertices[i].co.y for i in idx]))
        H = hull2d([(me.vertices[i].co.x, me.vertices[i].co.y - cy) for i in idx])
        if len(H) < 3 or any((H[(j + 1) % len(H)][0] - H[j][0]) * (0 - H[j][1]) - (H[(j + 1) % len(H)][1] - H[j][1]) * (0 - H[j][0]) < 0
                             for j in range(len(H))):
            continue  # het midden ligt niet binnen de strook
        for i in idx:
            v = me.vertices[i]
            q = Vector((v.co.x, v.co.y - cy, 0))
            if q.length < 1e-6:
                continue
            th = math.atan2(q.y, q.x)
            r = min(op_hull(H, th), q.length + 0.06)
            if r > q.length:
                q2 = q.normalized() * (q.length + (r - q.length) * w)
                v.co.x, v.co.y = q2.x, q2.y + cy
    # boven de riem bolt de stof op (de riem trekt hem samen), in plooien rondom (ronde 4)
    boven_riem = m.riem + S['riem']['hoogte'] / 2
    cy0 = float(np.mean([v.co.y for v in me.vertices if abs(v.co.z - boven_riem) < 0.02]))
    for v in me.vertices:
        h = v.co.z - boven_riem
        q = Vector((v.co.x, v.co.y - cy0, 0))
        if -0.01 < h < 0.08 and q.length > 1e-6:
            golf = max(0.0, 0.5 + 0.5 * sh.plooien(math.atan2(q.x, -q.y), 0.3, sh.LIJF_PLOOIEN) / 1.6)
            v.co += q.normalized() * P['riem'] * glad(h, 0.08, 0.0) * (0.4 + 0.6 * golf)
    # de armsgaten: rond om de bovenarm (een buis om de as vanaf de schouder, met een ronde kop), de mouw komt erdoor
    bm = bmesh.new()
    bm.from_mesh(me)
    gm = gamb.data
    bovenarm = som(gamb, ('upperarm',))
    for k in 'LR':
        A, as_ = m.arm_as(k)
        s0 = -0.02
        rs = [((v.co - A) - as_ * (v.co - A).dot(as_)).length for v, w in zip(gm.vertices, bovenarm)
              if w > 0.5 and 0.02 < (v.co - A).dot(as_) < 0.07 and (v.co.x > 0) == (k == 'L')]
        R = max(rs) + T['armsgat']

        snijd(bm, lambda p, A=A, as_=as_, R=R: (p - (A + as_ * max((p - A).dot(as_), s0))).length - R)
    bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, 0), plane_no=(1, 0, 0))
    bm.to_mesh(me)
    bm.free()
    me.update()
    # de rok: een buis om heupen en benen (de broek en de onderkant van de gambeson), recht naar beneden en wat wijder
    # naar de zoom; nooit smaller naar onder
    boom = bvh(br, gamb)
    hoogte = m.riem + 0.004 - m.zoom
    ts = [hoogte * i / 24 for i in range(25)]
    cy = float(np.mean([v.co.y for v in br.data.vertices if abs(v.co.z - m.heup) < 0.03]))
    ringen, x1, y1 = ringen_om(boom, Vector((0, cy, m.riem + 0.004)), Vector((0, 0, -1)), ts,
                               lambda t, th: T['rok_marge'] + T['rok_wijd'] * (t / hoogte) ** 1.5, T['ringen'], bol=True)
    c = lambda i: Vector((0, cy, m.riem + 0.004 - ts[i]))
    for i in range(1, len(ringen)):
        for j in range(len(ringen[i])):
            r0 = (ringen[i - 1][j] - c(i - 1)).length
            r1 = (ringen[i][j] - c(i)).length
            if r1 < r0:
                ringen[i][j] = c(i) + (ringen[i][j] - c(i)) * (r0 / r1)
    # de plooien (ronde 6, Marcel: "Plooien moeten logisch voortkomen uit zwaartekracht, spanning en
    # bevestigingspunten"): ze beginnen onder de riem, die de stof samentrekt, en lopen naar de zoom uit, breder en
    # dieper; de meeste opzij en achter, waar de riem de stof bijeen trekt, voor één tussen de benen en een langs elk
    # bovenbeen ('plekken': de hoek rondom, 0 voor, in radialen, en de diepte). Breedte, begin en scheefstand verschillen
    # wat per plooi (een vast zaad); alleen naar buiten, en de zoom gaat met de plooien mee omhoog. Ronde 5 had plooien op
    # willekeurige plekken; de stofsimulatie van de speerman (speerman_hd.hangen) scheurde de rok hier tussen de benen.
    n = len(ringen[0])
    zaad = random.Random(P['zaad'])
    lijst = [(hoek, diep, zaad.uniform(0.7, 1.3), zaad.uniform(0.0, 0.12), zaad.uniform(-0.12, 0.12)) for hoek, diep in P['plekken']]
    for i in range(1, len(ringen)):
        f = ts[i] / hoogte
        for j in range(n):
            th = 2 * math.pi * j / n
            uit = 0.0
            for th0, diep, breed, begin, scheef in lijst:
                d = math.remainder(th - th0 - scheef * f, 2 * math.pi) / (P['breed'] * breed * (0.6 + 0.6 * f))
                uit += diep * glad(f, begin, begin + 0.3) * math.exp(-d * d)
            q = ringen[i][j] - c(i)
            q.z = 0.0
            ringen[i][j] = ringen[i][j] + q.normalized() * P['diep'] * f * min(uit, 1.3)
            if i == len(ringen) - 1:
                ringen[i][j].z += P['zoom'] * min(uit, 1.3)
    rok = buis('rok', ringen)
    # de rok hangt aan de wortel; naar de zoom gaat hij wat met de benen mee (anders steken de knieen erdoor bij het lopen)
    for g in list(rok.vertex_groups):
        rok.vertex_groups.remove(g)
    gw = {b: rok.vertex_groups.new(name=b) for b in ('root', 'upperleg01.L', 'upperleg01.R')}
    for v in rok.data.vertices:
        mee = T['rok_benen'] * glad((m.riem - v.co.z) / hoogte, 0.0, 1.0)
        links = glad(v.co.x, -0.06, 0.06)
        gw['root'].add([v.index], 1 - mee, 'REPLACE')
        if mee * links > 1e-4:
            gw['upperleg01.L'].add([v.index], mee * links, 'REPLACE')
        if mee * (1 - links) > 1e-4:
            gw['upperleg01.R'].add([v.index], mee * (1 - links), 'REPLACE')
    for d in (lijfje, rok):
        d.data.materials.clear()
        d.data.materials.append(M['blauw'])
        d.data.materials.append(M['geel'])
    ob = samen('tabberd', [lijfje, rok])
    # gevierendeeld, vast op het lijf: boven zijn rechterkant (-X) geel, onder de riem zijn linkerkant; met
    # 'rechterborst' blauw andersom (ronde 10, Marcel: "Anatomische rechterborst: blauw")
    geel_rechts = T.get('rechterborst', 'geel') == 'geel'
    for p in ob.data.polygons:
        boven, rechts = p.center.z > m.riem, p.center.x < 0
        p.material_index = 1 if (boven == rechts) == geel_rechts else 0
    if T.get('doek'):
        doek(ob, bron, gamb, m, T['doek'])
    dik(ob, T['dikte'])
    if T.get('vuil'):
        # ronde 12: per punt hoeveel vuil (mat_tabberd): 'zoom' meter boven de zoom omhoog uitlopend, en 'riem' meter
        # rond de riem 'riem_deel' zo donker (de contactschaduw)
        V = T['vuil']
        laag = min(v.co.z for v in ob.data.vertices)
        waarden = [max(glad(laag + V['zoom'] - v.co.z, 0.0, V['zoom']), V['riem_deel'] * glad(V['riem'] - abs(v.co.z - m.riem), 0.0, V['riem']))
                   for v in ob.data.vertices]
        a = ob.data.attributes.new('vuil', 'FLOAT', 'POINT')
        a.data.foreach_set('value', waarden)
    sh.zacht(ob)
    return ob


def doek(ob, bron, gamb, m, D):
    """De tabberd als stof (ronde 11, Marcel: "Twee herkenbare stofpanelen ... Natuurlijke stofval ... Vrije beweging rond
    heupen en benen"): opzij open onder de oksels ('open_onder_oksel', binnen 'open_graden' van opzij), zodat er een voor-
    en een achterpaneel overblijft; dan in de stofsimulatie van Blender gehangen: vast boven de riem en tot 'riem_band'
    eronder, de rest valt met de zwaartekracht ('massa', 'stijf', 'buig') op het lijf en de gambeson (botsing op
    'afstand'), 'beelden' beelden lang. De vorm na de simulatie wordt de rust: de plooien en de val komen uit de stof zelf."""
    yc = m.B('root').y
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    weg = []
    for f in bm.faces:
        c = f.calc_center_median()
        if c.z < m.oksel - D['open_onder_oksel'] and abs(abs(math.degrees(math.atan2(c.x, -(c.y - yc)))) - 90) < D['open_graden']:
            weg.append(f)
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    vast = ob.vertex_groups.new(name='vast')
    for v in ob.data.vertices:
        vast.add([v.index], glad(v.co.z, m.riem - D['riem_band'], m.riem), 'REPLACE')
    verborgen = bron.hide_get()
    bron.hide_set(False)
    botsers = []
    for c in [bron] + ([gamb] if D.get('botst_gambeson') else []):
        md = c.modifiers.new('botsing', 'COLLISION')
        c.collision.thickness_outer = D['afstand']
        c.collision.cloth_friction = 5.0
        botsers.append((c, md))
    cl = ob.modifiers.new('doek', 'CLOTH')
    s = cl.settings
    s.quality, s.mass = D['kwaliteit'], D['massa']
    s.tension_stiffness = s.compression_stiffness = s.shear_stiffness = D['stijf']
    s.bending_stiffness, s.air_damping = D['buig'], 1.0
    s.vertex_group_mass, s.pin_stiffness = 'vast', 1.0
    cl.collision_settings.distance_min = D['afstand']
    cl.collision_settings.use_self_collision = False
    cl.point_cache.frame_start, cl.point_cache.frame_end = 1, D['beelden']
    sc = bpy.context.scene
    for f in range(1, D['beelden'] + 1):
        sc.frame_set(f)
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier='doek')
    sc.frame_set(1)
    for c, md in botsers:
        c.modifiers.remove(md)
    bron.hide_set(verborgen)
    if ob.vertex_groups.get('vast'):
        ob.vertex_groups.remove(ob.vertex_groups['vast'])


def riem_en_buidel(rig, m, M, tab):
    R, Bu = S['riem'], S['buidel']
    boom = bvh(tab)
    cy = float(np.mean([v.co.y for v in tab.data.vertices if abs(v.co.z - m.riem) < 0.01]))
    o = Vector((0, cy, m.riem + R['hoogte'] / 2))
    ts = [R['hoogte'] * i / 4 for i in range(5)]
    ringen, x1, y1 = ringen_om(boom, o, Vector((0, 0, -1)), ts, lambda t, th: 0.0015, 96, bol=True)
    ob = buis('riem', ringen, M['riem'])
    s = ob.modifiers.new('dikte', 'SOLIDIFY')
    s.thickness = R['dikte']
    s.offset = 1
    s.use_rim = True
    bouw.toepassen(ob, 'dikte')
    delen = [ob]
    # de gesp voor op de riem: een rechthoekig raam van staal met een pin, en het eind van de riem dat erdoor hangt
    j = len(ringen[0]) // 2  # hoek 0: voor
    voor = (ringen[2][j] + ringen[2][j - 1] + ringen[2][(j + 1) % len(ringen[2])]) / 3
    n = (voor - Vector((0, cy, voor.z))).normalized()
    b, h, d = R['gesp']
    p0 = voor + n * (R['dikte'] + d / 2 + 0.001)
    rand_ = 0.009
    bm = bmesh.new()
    buiten = [(-b / 2, -h / 2), (b / 2, -h / 2), (b / 2, h / 2), (-b / 2, h / 2)]
    binnen = [(x * (b / 2 - rand_) / (b / 2), y * (h / 2 - rand_) / (h / 2)) for x, y in buiten]
    vb = [bm.verts.new((x, 0, y)) for x, y in buiten]
    vi = [bm.verts.new((x, 0, y)) for x, y in binnen]
    for i in range(4):
        bm.faces.new((vb[i], vb[(i + 1) % 4], vi[(i + 1) % 4], vi[i]))
    r = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
    bmesh.ops.translate(bm, verts=[e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)], vec=(0, d, 0))
    bmesh.ops.translate(bm, verts=bm.verts[:], vec=(0, -d / 2, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new('gesp')
    bm.to_mesh(me)
    bm.free()
    gesp = bpy.data.objects.new('gesp', me)
    bpy.context.scene.collection.objects.link(gesp)
    hoek = math.atan2(n.x, -n.y)
    gesp.matrix_world = Matrix.Translation(p0) @ Matrix.Rotation(hoek, 4, 'Z')
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.0025, depth=h - 2 * rand_ + 0.002,
                                        location=p0 + n * 0.003, rotation=(0, 0, 0))
    pin = bpy.context.active_object
    for o_ in (gesp, pin):
        o_.data.materials.append(M['staal'])
    eind = bpy.data.objects.new('riemeind', bpy.data.meshes.new('riemeind'))
    bpy.context.scene.collection.objects.link(eind)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(0.03, 0.004, R['eind']), verts=bm.verts[:])
    # gaten in het eind (ronde 4): donkere schijfjes er dwars door
    gaten = []
    for i in range(R['gaten']):
        r_ = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=0.0026, radius2=0.0026, depth=0.0052,
                                   matrix=Matrix.Translation((0, 0, R['eind'] / 2 - 0.022 - 0.018 * i)) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
        gaten += r_['verts']
    gat_vlakken = {f for x in gaten for f in x.link_faces}
    for f in bm.faces:
        f.material_index = 1 if f in gat_vlakken else 0
    bm.to_mesh(eind.data)
    bm.free()
    zij = Vector((-n.y, n.x, 0))  # naar zijn linkerkant, langs de riem
    eind.matrix_world = Matrix.Translation(voor + n * (R['dikte'] + 0.004) + zij * (b / 2 + 0.018) - Vector((0, 0, R['eind'] / 2 - 0.012))) \
        @ Matrix.Rotation(hoek, 4, 'Z') @ Matrix.Rotation(math.radians(-8), 4, 'Y')
    eind.data.materials.append(M['riem'])
    eind.data.materials.append(M['gat'])
    # een lus van leer om de riem, tussen de gesp en het eind
    lus = bpy.data.objects.new('lus', bpy.data.meshes.new('lus'))
    bpy.context.scene.collection.objects.link(lus)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(R['lus'], 2 * R['dikte'] + 0.006, R['hoogte'] + 0.006), verts=bm.verts[:])
    bm.to_mesh(lus.data)
    bm.free()
    lus.matrix_world = Matrix.Translation(voor + n * (R['dikte'] / 2) + zij * (b / 2 + 0.006 + R['lus'] / 2) + Vector((0, 0, R['hoogte'] / 2 - 0.021))) \
        @ Matrix.Rotation(hoek, 4, 'Z')
    lus.data.materials.append(M['riem'])
    for o_ in (gesp, pin, eind, lus):
        bpy.ops.object.select_all(action='DESELECT')
        o_.select_set(True)
        bpy.context.view_layer.objects.active = o_
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    delen += [gesp, pin, eind, lus]
    ob = samen('riem', delen)
    vast_aan(ob, rig, 'root')
    # de buidel aan zijn rechterkant, wat naar voren: een zak met afgeronde hoeken en een klep, de bovenkant achter de riem
    th = -math.radians(Bu['hoek'])  # hoek naar zijn rechterkant is positief in ringen_om
    j = int(round((th - math.pi) / (2 * math.pi) * len(ringen[0]))) % len(ringen[0])
    p = ringen[-1][j]
    n = (p - Vector((0, cy, p.z))).normalized()
    bx, by, bz = Bu['maat']
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(bx, by, bz), verts=bm.verts[:])
    me = bpy.data.meshes.new('buidel')
    bm.to_mesh(me)
    bm.free()
    zak = bpy.data.objects.new('buidel', me)
    bpy.context.scene.collection.objects.link(zak)
    bev = zak.modifiers.new('rond', 'BEVEL')
    bev.width, bev.segments = 0.014, 3
    bouw.toepassen(zak, 'rond')
    for v in zak.data.vertices:  # onderaan wat boller, bovenaan smaller
        f = 0.5 + v.co.z / bz
        v.co.x *= 0.88 + 0.12 * (1 - f)
        v.co.y *= 0.8 + 0.35 * math.sin(math.pi * min(1.0, max(0.0, f)))
    zak.data.materials.append(M['leer'])
    klep = bpy.data.objects.new('klep', bpy.data.meshes.new('klep'))
    bpy.context.scene.collection.objects.link(klep)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(bx * 1.04, 0.006, bz * 0.5), verts=bm.verts[:])
    bmesh.ops.translate(bm, vec=(0, -by * 0.5 * 1.1, bz * 0.22), verts=bm.verts[:])
    bm.to_mesh(klep.data)
    bm.free()
    bev = klep.modifiers.new('rond', 'BEVEL')
    bev.width, bev.segments = 0.003, 2
    bouw.toepassen(klep, 'rond')
    klep.data.materials.append(M['riem'])
    # een knoop van hout onder aan de klep
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.0055, depth=0.024, location=(0, -by * 0.55 - 0.007, bz * 0.22 - bz * 0.25 + 0.008),
                                        rotation=(0, math.pi / 2, 0))
    knoop = bpy.context.active_object
    bpy.ops.object.transform_apply(location=True, rotation=True)
    knoop.data.materials.append(M['hout'])
    plek = p + n * (by / 2 + 0.006) - Vector((0, 0, bz / 2 - 0.02))
    hoek = math.atan2(n.x, -n.y)
    for o_ in (zak, klep, knoop):
        o_.matrix_world = Matrix.Translation(plek) @ Matrix.Rotation(hoek, 4, 'Z') @ Matrix.Rotation(math.radians(-6), 4, 'X')
        bpy.ops.object.select_all(action='DESELECT')
        o_.select_set(True)
        bpy.context.view_layer.objects.active = o_
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    buidel_ob = samen('buidel', [zak, klep, knoop])
    sh.zacht(buidel_ob)
    vast_aan(buidel_ob, rig, 'root')
    return ob, buidel_ob


def malienkraag(bron, rig, m, M, gamb, tab):
    """De maliënkraag (ronde 4, Marcel: "donkere maliënkraag rond hoofd en nek", zoals de speerman): een kap van maliën
    van net onder de rand van de helm, over de wangen, de oren en het achterhoofd, die als een korte cape over de kraag
    van de gambeson en de schouders van de tabberd valt; het gezicht open tot onder de kin (de baard ligt eroverheen).
    Een buis om de as van het hoofd naar de hals, op wat eronder ligt (convex: de maliën hangen over de holtes), naar
    onderen wijder; met de gewichten van de huid eronder (hoofd, hals, schouders)."""
    Mk = S['malienkraag']
    hoofd = som(bron, HOOFD)
    boom = sh.bvh_van([(bron, [w > 0.3 for w in hoofd]), (gamb, None), (tab, None)])
    kin = m.gezicht['special04']
    z0 = m.oog + S['helm']['boven_oog'] - Mk['onder_rand']
    band = [p for p in m.hoofd if abs(p.z - z0) < 0.015]
    cy = (min(p.y for p in band) + max(p.y for p in band)) / 2
    o = Vector((0, cy, z0))
    as_ = (m.nek - o).normalized()
    d = (m.nek - o).length
    lang = lambda th: d + (Mk['voor'] if math.cos(th) > 0 else Mk['achter']) * math.cos(th) ** 2 + Mk['zij'] * math.sin(th) ** 2
    L = max(lang(th) for th in (0.0, math.pi / 2, math.pi))
    ts = [L * i / 28 for i in range(29)]
    ringen, _, _ = ringen_om(boom, o, as_, ts, lambda t, th: Mk['uit'] + Mk['wijd'] * glad(t / lang(th), 0.55, 1.0),
                             Mk['ringen'], lengte=lambda th: lang(th) / L, bol=True)
    ob = buis('malienkraag', ringen, M['malien'])
    uv_buis(ob, ringen)
    # het gezicht open: voor, boven de kin
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    weg = []
    for f in bm.faces:
        c = f.calc_center_median()
        if c.z > kin.z - Mk['kin'] and abs(math.degrees(math.atan2(c.x, -(c.y - cy)))) < Mk['open']:
            weg.append(f)
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bmesh.ops.delete(bm, geom=[x for x in bm.verts if not x.link_faces], context='VERTS')
    bm.to_mesh(ob.data)
    bm.free()
    if Mk.get('bovenop'):
        bovenop(ob, sh.bvh_van([(gamb, None), (tab, None)]), Mk['uit'], m.nek.y, m.nek.z - 0.03, *Mk['bovenop'])
    for g in bron.vertex_groups:
        ob.vertex_groups.new(name=g.name)
    gewichten(ob, bron, rig, zonder=('lowerarm', 'wrist', 'finger', 'metacarpal'))
    if Mk.get('volgt'):
        volg_de_kleren(ob, [gamb, tab], rig, m.nek.z, ('lowerarm', 'wrist', 'finger', 'metacarpal'))
    dik(ob, Mk['dikte'])
    return ob


def volg_de_kleren(ob, kleren, rig, z_nek, zonder):
    """Onder de hals de gewichten van de kleren waar de kap op ligt, in plaats van die van de huid (ronde 7: de kap over de
    schouders bewoog met de huid, de tabberd eronder met zijn eigen gewichten; als de armen uit de A-houding zakten, kwam
    er langs de rand tabberd vrij die eronder hoort). Boven de hals blijven die van de huid (het hoofd), daartussen
    gemengd over 4 cm."""
    huid = [{ob.vertex_groups[g.group].name: g.weight for g in v.groups} for v in ob.data.vertices]
    kopie = []
    for o in kleren:
        c = o.copy()
        c.data = o.data.copy()
        bpy.context.scene.collection.objects.link(c)
        kopie.append(c)
    bpy.ops.object.select_all(action='DESELECT')
    for c in kopie:
        c.select_set(True)
    bpy.context.view_layer.objects.active = kopie[0]
    bpy.ops.object.join()
    bron_kleren = kopie[0]
    gewichten(ob, bron_kleren, rig, zonder)
    kl = [{ob.vertex_groups[g.group].name: g.weight for g in v.groups} for v in ob.data.vertices]
    bpy.data.objects.remove(bron_kleren, do_unlink=True)
    for g in list(ob.vertex_groups):
        ob.vertex_groups.remove(g)
    groepen = {}
    for i, (v, a, b) in enumerate(zip(ob.data.vertices, huid, kl)):
        f = glad(z_nek - 0.01 - v.co.z, 0.0, 0.04)
        for naam in set(a) | set(b):
            w = (1 - f) * a.get(naam, 0.0) + f * b.get(naam, 0.0)
            if w > 1e-4:
                if naam not in groepen:
                    groepen[naam] = ob.vertex_groups.new(name=naam)
                groepen[naam].add([i], w, 'REPLACE')
    schoon(ob, rig, zonder)


def bovenop(ob, boom, uit, y_as, z_rand, ver, rondes):
    """Elk punt minstens `uit` buiten wat de bvh raakt, gezocht langs zijn eigen normaal van buiten naar binnen, tot `ver`
    meter ver; dan wat glad, en dat `rondes` keer (ronde 7, Marcel: "Laat de onderzijde natuurlijk over de schouders
    vallen", "Zorg dat de kraag de schoudervorm volgt": de ringen loodrecht op de schuine as van hoofd naar hals liepen op
    de schouders langs de stof, zodat de tabberd en de gambeson er tussen twee ringen doorheen staken)."""
    for r in range(rondes + 1):
        me = ob.data
        me.update()
        for v in me.vertices:
            n = v.normal if v.normal.dot(v.co - Vector((0, y_as, v.co.z))) > 0 else -v.normal
            d = sh.straal(boom, v.co - n * uit, n, ver)
            if d is not None and d > 0:
                v.co = v.co + n * d
        if r < rondes:
            sm = ob.modifiers.new('glad', 'SMOOTH')
            sm.factor, sm.iterations = 0.5, 3
            bouw.toepassen(ob, 'glad')
    # de onderrand (onder `z_rand`) ligt op wat eronder ligt, zoals een kap op de schouders valt (de rij erboven half):
    # stond hij er 'uit' boven, dan zag je er van opzij de tabberd onder (de doorsteektoets); de rand om het gezicht niet,
    # die kwam dan op de kraag te liggen en liet hem bij de keel zien
    me = ob.data
    me.update()
    bm = bmesh.new()
    bm.from_mesh(me)
    rand = {v.index for e in bm.edges if len(e.link_faces) < 2 for v in e.verts if v.co.z < z_rand}
    bm.verts.ensure_lookup_table()
    tweede = {w.index for i in rand for e in bm.verts[i].link_edges for w in e.verts} - rand
    bm.free()
    for i, deel in [(i, 1.0) for i in rand] + [(i, 0.5) for i in tweede]:
        v = me.vertices[i]
        n = v.normal if v.normal.dot(v.co - Vector((0, y_as, v.co.z))) > 0 else -v.normal
        raak = boom.ray_cast(v.co + n * 0.001, -n, 0.03)
        if raak[0] is not None:
            v.co = v.co.lerp(raak[0] + n * 0.001, deel)


def baard(bron, rig, m, M):
    """Korte stoppels, de snor en de wenkbrauwen (ronde 6, Marcel: "Verwijder deze aanpak. Gebruik bij voorkeur korte
    stoppels of een zeer korte, onregelmatige baard"; de baard als vorm las als een opgeplakte plaat): een dunne laag over
    de huid op de plekken die de botten van het gezicht aanwezen, 'dik' meter (bij de kin 'dik_kin' meer), de snor
    'snor' en de wenkbrauwen 'brauw' dik. De dichtheid van het haar ('dicht', een kenmerk per punt) loopt naar de rand
    uit tot de huid ('rand' meter), zodat er geen rand te zien is; mat_baard zet er stoppels van in de kleur van de huid
    en het haar. Zonder het echte haar van de speerman, dat niet mee kan in de GLB."""
    from mathutils import noise
    B = S['baard']
    g = m.gezicht
    mond, kin = g['oris01'], g['special04']
    z_oog = (g['eye.L'].z + g['eye.R'].z) / 2
    y_mid = m.B('head').y + 0.005
    groep = {k: bron.vertex_groups.new(name=k) for k in ('baard', 'snor', 'brauw')}
    for x in bron.data.vertices:
        p = x.co
        oog = min((g['eye.L'], g['eye.R']), key=lambda e: abs(p.x - e.x))
        if abs(p.x - oog.x) < 0.024 and oog.z + 0.01 < p.z < oog.z + 0.026 and p.y < oog.y - 0.006:
            groep['brauw'].add([x.index], 1.0, 'REPLACE')
            continue
        if p.z < kin.z - 0.03 or p.z > z_oog + 0.05 or p.y > y_mid + 0.02:
            continue
        if p.z < mond.z - 0.002 and p.y < y_mid:
            groep['baard'].add([x.index], 1.0, 'REPLACE')
        elif abs(p.x) > 0.03 and p.z < mond.z - 0.002 + (abs(p.x) - 0.03) * 0.8 + 0.005 * noise.noise(p * 90.0) and p.y < y_mid:
            groep['baard'].add([x.index], 1.0, 'REPLACE')  # de rand over de wang onregelmatig
        elif abs(p.x) < 0.05 and mond.z - 0.002 < p.z < mond.z + 0.026 and p.y < mond.y + 0.016:
            groep['snor'].add([x.index], 1.0, 'REPLACE')
    nrs = {gr.index for gr in groep.values()}
    kies = [any(gr.group in nrs and gr.weight > 0.5 for gr in x.groups) for x in bron.data.vertices]
    ob = uit_huid('baard', bron, kies, sub=2)
    for gr in groep.values():
        bron.vertex_groups.remove(gr)
    me = ob.data
    me.update()
    gewicht = {k: [next((gr.weight for gr in x.groups if gr.group == ob.vertex_groups[k].index), 0.0) for x in me.vertices]
               for k in ('snor', 'brauw')}
    ns = [x.normal.copy() for x in me.vertices]
    # hoe ver elk punt van de rand ligt (over de mesh): naar de rand loopt het haar uit in de huid
    import heapq
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    afstand = [1e9] * len(bm.verts)
    rij = []
    for e in bm.edges:
        if len(e.link_faces) < 2:
            for v in e.verts:
                afstand[v.index] = 0.0
                heapq.heappush(rij, (0.0, v.index))
    while rij:
        d, i = heapq.heappop(rij)
        if d > afstand[i]:
            continue
        for e in bm.verts[i].link_edges:
            j = e.other_vert(bm.verts[i]).index
            if d + e.calc_length() < afstand[j]:
                afstand[j] = d + e.calc_length()
                heapq.heappush(rij, (afstand[j], j))
    bm.free()
    dicht = []
    for x, nr in zip(me.vertices, ns):
        p = x.co.copy()
        rand = glad(afstand[x.index], 0.0, B['rand'])
        s, b = glad(gewicht['snor'][x.index], 0.3, 0.7), glad(gewicht['brauw'][x.index], 0.3, 0.7)
        onder = glad(mond.z - p.z, 0.0, 0.06)                 # 0 bij de mond, 1 bij de kin en lager
        voor = glad(0.06 - abs(p.x), 0.0, 0.05)               # midden voor voller dan op de wangen
        uit = (B['dik'] + B['dik_kin'] * onder * voor) * (1 - s - b) + B['snor'] * s + B['brauw'] * b
        x.co = p + nr * uit * (0.3 + 0.7 * rand) + Vector((0, 0, -B['snor_hang'] * s * glad(p.z, mond.z + 0.02, mond.z)))
        D = B['dicht']
        dicht.append(rand * ((D[0] + D[1] * onder) * (1 - s - b) + D[2] * s + D[3] * b))
    a = me.attributes.new('dicht', 'FLOAT', 'POINT')
    a.data.foreach_set('value', dicht)
    sm = ob.modifiers.new('glad', 'SMOOTH')
    sm.factor, sm.iterations = 0.6, 3
    bouw.toepassen(ob, 'glad')
    dik(ob, B['dikte'])
    ob.data.materials.append(M['baard'])
    gewichten(ob, bron, rig)
    versimpel(ob, S['budget']['baard'])
    return ob


def ogen(rig, m, M):
    """De ogen (ronde 5, Marcel: "corrigeer de ogen"): het lijf heeft dichte oogkassen met geverfd oogwit, dat dicht las;
    twee oogbollen op de plek van de oogbotten, 'voor' meter naar voren zodat ze net door de oogleden komen, met een iris
    die recht vooruit en 'omlaag' graden naar beneden kijkt (het kenmerk 'oog', mat_oog)."""
    O = S['ogen']
    kijk = Vector((0, -1, -math.tan(math.radians(O['omlaag'])))).normalized()
    delen = []
    for k in ('eye.L', 'eye.R'):
        c = m.gezicht[k] + Vector((0, -O['voor'], 0))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=O['straal'], location=c)
        o = bpy.context.active_object
        bpy.ops.object.transform_apply(location=True)
        a = o.data.attributes.new('oog', 'FLOAT', 'POINT')
        a.data.foreach_set('value', [(v.co - c).normalized().dot(kijk) for v in o.data.vertices])
        o.data.materials.append(M['oog'])
        delen.append(o)
    ob = samen('ogen', delen)
    sh.zacht(ob)
    vast_aan(ob, rig, 'head')
    return ob


def helm(rig, m, M):
    """De ketelhoed (ronde 6, Marcel: "een duidelijk bolvormige koepel, een brede, licht afhangende rand, een herkenbare
    verhoogde kam van voor naar achter"), naar de helm van de speerman (speerman_hd.helm): een halve bol 'speling' wijder
    dan het hoofd boven de rand, minstens 'koepel' keer zo hoog als breed (en 'boven_kruin' boven de kruin), 'achter'
    meter naar achteren op het hoofd, zodat het gezicht er van voren onder uit komt; een rand van 'rand' keer de koepel die
    naar buiten 'rand_val' meter zakt, achteraan 'zak' keer verder, wat golvend ('golf'), met een opgerolde zoom; een kam
    van voor naar achter ('kam' hoog, 'kam_breed' breed) en twee naden opzij ('naden' graden, 'naad', 'naad_breed'), een
    korte punt bovenop ('punt': straal, hoogte), deuken van de hamer ('deuk') en 'nagels' klinknagels rond de voet van de
    koepel. Hij werpt geen schaduw op het gezicht, zoals de helm van de speerman: het gezicht blijft leesbaar."""
    from mathutils import noise
    Hm = S['helm']
    zr = m.oog + Hm['boven_oog']
    boven = [p for p in m.hoofd if p.z > zr - 0.01]
    cy = (min(p.y for p in boven) + max(p.y for p in boven)) / 2 + Hm['achter']
    rx = max(abs(p.x) for p in boven) + Hm['speling']
    ry = (max(p.y for p in boven) - min(p.y for p in boven)) / 2 + Hm['speling']
    h = max(max(p.z for p in m.hoofd) - zr + Hm['boven_kruin'], Hm['koepel'] * rx) * Hm.get('hoger', 1.0)
    n, nk = 128, 24
    hoeken = [2 * math.pi * j / n for j in range(n)]
    o = Vector((0, cy, zr))
    deuk = lambda p: Hm['deuk'] * noise.noise(p * 55.0)
    scheef = lambda p: Hm.get('scheef', 0.0) * noise.noise(p * 6.0 + Vector((5.3, 2.1, 0.7)))  # met de hand gesmeed
    ribben = [(0.0, Hm['kam'], Hm['kam_breed']), (Hm['naden'], Hm['naad'], Hm['naad_breed']), (-Hm['naden'], Hm['naad'], Hm['naad_breed'])]
    ringen = []
    # de rand van buiten naar binnen (factor maal de koepel, deel van het zakken, meter extra naar buiten): de opgerolde
    # zoom, de rand, dan de koepel tot bovenop
    F, z = Hm['rand'], Hm.get('zoom', 0.0045)
    profiel = [(F, 1.0, 0.22 * z, -2 * z), (F, 1.0, z, -z), (F, 1.0, 0.44 * z, 0.0), (1.3, 0.5, 0.0, 0.0),
               (1.15, 0.2, 0.0, 0.0), (1.0, 0.0, 0.0, 0.0)]
    profiel += [('koepel', i / nk * math.pi / 2) for i in range(1, nk)]
    for pf in profiel:
        ring = []
        for th in hoeken:
            c, s_ = math.cos(th), math.sin(th)
            if pf[0] == 'koepel':
                f = pf[1]
                p = Vector((rx * c * math.cos(f), cy + ry * s_ * math.cos(f), zr + h * math.sin(f)))
                uit = deuk(p) + scheef(p)
                for hoek, hoog, breed in ribben:
                    a = math.radians(hoek)
                    d = (p.x * math.cos(a) + (p.y - cy) * math.sin(a))  # afstand tot het vlak van de rib
                    uit += hoog * math.exp(-(d / breed) ** 2) * glad(f, 0.08, 0.3)
                p += (p - o).normalized() * uit
            else:
                fac, deel, extra, dz = pf
                # ronde 7: van voren een smallere rand ('rand_voor' keer de koepel), zodat de ogen er onder uit komen
                Fv = F + (Hm.get('rand_voor', F) - F) * max(0.0, -s_) ** 2
                fac = 1 + (fac - 1) * (Fv - 1) / (F - 1)
                zak = Hm['rand_val'] * deel * (1 + Hm['zak'] * max(0.0, s_) ** 1.5) * (1 + Hm['golf'] * math.sin(2 * th + 0.6))
                zak -= Hm.get('voor_op', 0.0) * deel * max(0.0, -s_) ** 1.5  # de voorkant wat op: de ogen eronder vrij
                nrm = Vector((c / rx, s_ / ry, 0)).normalized()
                p = Vector((rx * fac * c, cy + ry * fac * s_, zr - zak + dz)) + nrm * extra
                p.z += (deuk(p) + scheef(p)) * min(1.0, fac - 1.0)
            ring.append(p)
        ringen.append(ring)
    ob = buis('helm', ringen)
    # bovenop dicht
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    pool = bm.verts.new((0, cy, zr + h + Hm['kam']))
    laatste = bm.verts[-n - 1:-1]
    for j in range(n):
        bm.faces.new((laatste[j], laatste[(j + 1) % n], pool))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    bm.to_mesh(ob.data)
    bm.free()
    s = ob.modifiers.new('dikte', 'SOLIDIFY')
    s.thickness = Hm['dikte']
    s.offset = -1
    bouw.toepassen(ob, 'dikte')
    delen = [ob]
    # de korte punt bovenop, en de klinknagels rond de voet van de koepel
    r1, hp = Hm['punt']
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=r1, radius2=r1 * 0.3, depth=hp, location=(0, cy, zr + h + Hm['kam'] + hp / 2 - 0.004))
    delen.append(bpy.context.active_object)
    bpy.ops.object.transform_apply(location=True)
    f = 0.12
    for i in range(Hm['nagels']):
        th = 2 * math.pi * (i + 0.5) / Hm['nagels']
        p = Vector((rx * math.cos(th) * math.cos(f), cy + ry * math.sin(th) * math.cos(f), zr + h * math.sin(f)))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=6, radius=Hm.get('nagel', 0.0032), location=p + (p - o).normalized() * 0.0005)
        delen.append(bpy.context.active_object)
        bpy.ops.object.transform_apply(location=True)
    for d in delen:
        d.data.materials.clear()
        d.data.materials.append(M['helm'])
    ob = samen('helm', delen)
    # ronde 7: 'kantel' graden achterover op het hoofd (de voorkant van de rand op, zodat de ogen er van de camera onder
    # uit komen; zoals een ketelhoed die wat naar achteren gedragen wordt)
    ob.data.transform(Matrix.Translation(o) @ Matrix.Rotation(math.radians(-Hm.get('kantel', 0.0)), 4, 'X') @ Matrix.Translation(-o))
    # de maten van de helm voor het rapport (meter): de koepel, de rand, de kam, en hoe ver de rand voor boven de ogen zit
    pts = [v.co for v in ob.data.vertices]
    voor = min(pts, key=lambda p: p.y)
    ob['maten'] = json.dumps({'koepel_breed': round(2 * rx, 4), 'koepel_diep': round(2 * ry, 4), 'koepel_hoog': round(h, 4),
                              'rand_breed': round(rx * (F - 1) + z, 4), 'rand_val': round(Hm['rand_val'], 4),
                              'rand_helling_graden': round(math.degrees(math.atan2(Hm['rand_val'], rx * (F - 1))), 1),
                              'kam': round(Hm['kam'], 4), 'rand_boven_oog': round(Hm['boven_oog'], 4),
                              'voorrand_boven_oog': round(voor.z - m.oog, 4), 'voorrand_voor_het_oog': round(m.gezicht['eye.L'].y - voor.y, 4),
                              'hoogte_totaal': round(max(p.z for p in pts) - min(p.z for p in pts), 4)})
    sh.zacht(ob)
    ob.visible_shadow = False
    vast_aan(ob, rig, 'head')
    return ob


def speer_mesh(M):
    """De speer langs +Z, de voet op 0: een schacht van es met een stalen voet, een koord onder de tule, de tule, en een
    bladvormige punt met een middenrib. Het blad staat 22,5 graden gedraaid: zo kijkt geen van de acht richtingen op de
    smalle kant (de speerman van het spel draaide het blad per richting naar de camera)."""
    Sp = S['speer']
    L, r = Sp['lengte'], Sp['straal']
    lb, wb, db = Sp['blad']
    z_tule = L - lb - Sp['tule']
    delen = []

    def cil(z0, z1, r0, r1, mat, seg=20):
        bpy.ops.mesh.primitive_cone_add(vertices=seg, radius1=r0, radius2=r1, depth=z1 - z0, location=(0, 0, (z0 + z1) / 2))
        o = bpy.context.active_object
        o.data.materials.append(mat)
        bpy.ops.object.transform_apply(location=True)
        delen.append(o)
        return o
    # ronde 5 (Marcel: "verfijn de speerpunt en de houten schacht"): de schacht naar boven 'tapse' keer zo dun, de tule
    # met een kraag en een nagel erdoor, en het blad met een holle slijpkant naast de middenrib (het licht valt in banen)
    rt = r * Sp['tapse']
    cil(0.0, Sp['voet'], r + 0.001, r + 0.0018, M['staal'])
    cil(Sp['voet'], z_tule - Sp['koord'] + 0.002, r, rt, M['hout'], 24)
    cil(z_tule - Sp['koord'], z_tule + 0.002, rt + 0.0022, rt + 0.0022, M['koord'])
    cil(z_tule, L - lb + 0.006, rt + 0.003, rt - 0.004, M['staal'])
    cil(z_tule - 0.001, z_tule + 0.007, rt + 0.0045, rt + 0.0045, M['staal'])
    nagel = cil(-rt - 0.006, rt + 0.006, 0.0022, 0.0022, M['staal'], 8)
    nagel.rotation_euler = (0, math.pi / 2, 0)
    nagel.location = (0, 0, z_tule + 0.03)
    bpy.ops.object.transform_apply(location=True, rotation=True)
    n = 28
    vs, fs = [], []
    hoek = math.radians(22.5)
    ux, uy = math.cos(hoek), math.sin(hoek)
    half = [(1, 0), (0.55, 0.28), (0.18, 0.82), (0, 1), (-0.18, 0.82), (-0.55, 0.28)]
    doorsnede = half + [(-px, -py) for px, py in half]  # rond, met de klok mee; (0.55, 0.28) ligt onder de rechte lijn
    k = len(doorsnede)
    for i in range(n + 1):
        t = i / n
        w = wb * (0.3 + 0.7 * (t / 0.32) ** 0.6) if t < 0.32 else wb * ((1 - t) / 0.68) ** 1.15
        w = max(w, 0.0004)
        d = db * (w / wb) + 0.0006
        z = L - lb + lb * t
        for fx, fy in doorsnede:
            px, py = fx * w, fy * d
            vs.append((px * ux - py * uy, px * uy + py * ux, z))
    for i in range(n):
        for j in range(k):
            fs.append((i * k + j, i * k + (j + 1) % k, (i + 1) * k + (j + 1) % k, (i + 1) * k + j))
    blad = sh.maak('blad', vs, fs, mat=M['blad'])
    blad.data.polygons.foreach_set('use_smooth', [False] * len(blad.data.polygons))
    delen.append(blad)
    ob = samen('speer', delen)
    for p in ob.data.polygons:
        if ob.data.materials[p.material_index].name.startswith('hout'):
            p.use_smooth = True
    a = ob.data.attributes.new('oorsprong', 'FLOAT_VECTOR', 'POINT')
    a.data.foreach_set('vector', [c for v in ob.data.vertices for c in v.co])
    return ob


# ---------------------------------------------------------------- de houding en de greep

def krul(rig, bot, graden):
    pb = rig.pose.bones[bot]
    M_ = pb.matrix.copy()
    h = M_.translation.copy()
    as_ = M_.to_3x3().col[0].normalized()
    pb.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(graden), 4, as_) @ Matrix.Translation(-h) @ M_
    bpy.context.view_layer.update()


def greep(rig, r_schacht, handschoen):
    """De rechterhand om een staande schacht: eerst de pols om zijn eigen as tot de knokkels boven elkaar staan (de wijsvinger
    boven, de duim op de schacht), dan krult elk kootje van elke vinger tot hij de schacht net raakt (speerman_hd.greep,
    met de schacht rechtop). Geeft het midden van de vuist in de wereld (de as van de schacht gaat erdoor)."""
    pb = rig.pose.bones
    W = lambda p: rig.matrix_world @ p
    knokkel = lambda v: W(pb[f'finger{v}-1.R'].head)
    pols = pb['wrist.R']
    M0 = pols.matrix.copy()
    beste = None
    for g in range(-180, 180, 3):
        h = M0.translation.copy()
        as_ = M0.to_3x3().col[1].normalized()
        pols.matrix = Matrix.Translation(h) @ Matrix.Rotation(math.radians(g), 4, as_) @ Matrix.Translation(-h) @ M0
        bpy.context.view_layer.update()
        k = (knokkel(2) - knokkel(5)).normalized()
        if beste is None or k.z > beste[0]:
            beste = (k.z, pols.matrix.copy())
    pols.matrix = beste[1]
    bpy.context.view_layer.update()
    scheef = math.degrees(math.acos(max(-1.0, min(1.0, beste[0]))))
    # de knokkels liggen niet haaks op het polsbot: wat het draaien niet haalt, kantelt de hele hand bij
    k = (knokkel(2) - knokkel(5)).normalized()
    h = pols.matrix.translation.copy()
    R = k.rotation_difference(Vector((0, 0, 1))).to_matrix().to_4x4()
    pols.matrix = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ pols.matrix
    bpy.context.view_layer.update()
    as_ = Vector((0, 0, 1))
    m = (knokkel(3) + knokkel(4)) / 2
    voor = W(pb['finger3-1.R'].tail) - knokkel(3)
    krul(rig, 'finger3-1.R', 90)
    palm = W(pb['finger3-1.R'].tail) - knokkel(3)
    krul(rig, 'finger3-1.R', -90)
    palm = (palm - as_ * palm.dot(as_)).normalized()
    voor = (voor - as_ * voor.dot(as_) - palm * voor.dot(palm)).normalized()
    S_ = m + palm * (0.012 + handschoen + r_schacht) - voor * 0.006
    ruimte = r_schacht + handschoen + 0.0085

    def raakt(v):
        punten = []
        for d in range(1, 4):
            b_ = pb[f'finger{v}-{d}.R']
            h, t = W(b_.head), W(b_.tail)
            punten += [h + (t - h) * (i / 4) for i in range(5)]
        return any(((q - S_) - as_ * (q - S_).dot(as_)).length < ruimte for q in punten[3:])
    for v in range(2, 6):
        for d in range(1, 4):
            for _ in range(28):
                krul(rig, f'finger{v}-{d}.R', 4)
                if raakt(v):
                    krul(rig, f'finger{v}-{d}.R', -4)
                    break
    for d in range(2, 4):
        krul(rig, f'finger1-{d}.R', 30)
    return S_, scheef


def houding_vast(rig):
    """De houding van nu als gegevens in het skelet (per bot de matrix_basis), zodat render en controle haar terugzetten."""
    rig['houding_soldaat'] = json.dumps({pb.name: [list(r) for r in pb.matrix_basis] for pb in rig.pose.bones
                                         if not np.allclose(np.array(pb.matrix_basis), np.eye(4))})


# ---------------------------------------------------------------- bedekt en weg

def bedekking(ob, boven, ver=0.15, recht=False):
    """Per punt van ob (in rust): ligt het onder de lagen uit `boven`? Dertien stralen rond de normaal (recht naar buiten,
    en zes op 35 en zes op 65 graden) moeten allemaal binnen `ver` meter een van die lagen raken. Zo blijft wat langs een
    rand naar buiten kijkt vrij (het voorhoofd onder de rand van de helm), en wat eronder ligt bedekt. Met `recht` alleen
    de straal langs de normaal."""
    deps = bpy.context.evaluated_depsgraph_get()
    vs, fs = [], []
    for o in boven:
        e = o.evaluated_get(deps)
        me = e.to_mesh()
        b = len(vs)
        vs += [o.matrix_world @ v.co for v in me.vertices]
        fs += [[b + i for i in p.vertices] for p in me.polygons]
        e.to_mesh_clear()
    boom = BVHTree.FromPolygons(vs, fs)
    me = ob.data
    me.update()
    kegel = [(0.0, 0.0)] + ([] if recht else [(math.radians(a), 2 * math.pi * j / 6 + (0.5 if a > 50 else 0.0))
                                              for a in (35, 65) for j in range(6)])
    uit = []
    for v in me.vertices:
        p, n = ob.matrix_world @ v.co, (ob.matrix_world.to_3x3() @ v.normal).normalized()
        t1 = n.orthogonal().normalized()
        t2 = n.cross(t1)
        ok = True
        for a, b in kegel:
            d = n * math.cos(a) + (t1 * math.cos(b) + t2 * math.sin(b)) * math.sin(a)
            if boom.ray_cast(p + n * 1e-4, d, ver)[0] is None:
                ok = False
                break
        uit.append(ok)
    return uit


def gezien_lijf(lijf, rig):
    """Welke vlakken van het lijf je ooit ziet: in de houding van de soldaat en in rust, acht richtingen op drie hoogtes
    (0, 30 en 60 graden), elk vlak in een eigen kleur (soldaat_render.vlak_render)."""
    import render as R
    import soldaat_render as SR
    sc = R.scene()
    C = S['camera']
    sc.render.resolution_x, sc.render.resolution_y = C['breed'], C['hoog']
    me = lijf.data
    a = me.attributes.new('id', 'FLOAT_COLOR', 'FACE')
    kl = []
    for i in range(len(me.polygons)):
        kl += [((i + 1) % 256) / 255, ((i + 1) // 256 % 256) / 255, 0.0, 1.0]
    a.data.foreach_set('color', kl)
    mat = SR.gloei_kenmerk('id', 'id')
    pad = os.path.join(UIT, 'soldaat', 'zicht.png')
    gezien = set()
    for rust in (False, True):
        if rust:
            stand.rust(rig)
        for e in (0.0, 30.0, 60.0):
            cam = R.camera(sc, e, 0, 'zicht', C['anker'], (C['breed'], C['hoog'], INST['camera']['pixels_per_meter']))
            sc.camera = cam
            for r in R.RICHTINGEN:
                rig.rotation_euler = (0, 0, math.radians(r['draai']))
                bpy.context.view_layer.update()
                SR.vlak_render(sc, pad, mat)
                px = R.lees_png(pad)
                n = (np.rint(px[:, :, 0] * 255).astype(int) + 256 * np.rint(px[:, :, 1] * 255).astype(int))[px[:, :, 3] > 0.5]
                gezien.update((n[n > 0] - 1).tolist())
            sc.camera = None
            bpy.data.objects.remove(cam, do_unlink=True)
    rig.rotation_euler = (0, 0, 0)
    SR.houding(rig)
    me.attributes.remove(me.attributes['id'])
    bpy.data.materials.remove(mat)
    os.remove(pad)
    return gezien


def main():
    rig = bpy.data.objects['skelet']
    bron, lijf = bpy.data.objects['lijf-bron'], bpy.data.objects['lijf']
    stand.rust(rig)
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    bpy.data.objects.remove(bpy.data.objects['onderbroek'], do_unlink=True)  # onder de broek
    m = Maten(rig, bron)
    M = materialen()
    texturen_vervangen()
    huid(lijf, m)
    delen = {}
    delen['broek'] = broek(bron, rig, m, M)
    delen['gambeson'] = gambeson(bron, rig, m, M)
    delen['laarzen'] = laarzen(bron, rig, m, M)
    delen['handschoenen'] = handschoenen(bron, rig, m, M, delen['gambeson'])
    delen['tabberd'] = tabberd(bron, rig, m, M, delen['gambeson'], delen['broek'])
    delen['riem'], delen['buidel'] = riem_en_buidel(rig, m, M, delen['tabberd'])
    delen['malienkraag'] = malienkraag(bron, rig, m, M, delen['gambeson'], delen['tabberd'])
    if S['baard'].get('vorm', True):  # ronde 7: anders staan de stoppels in de huid (huid)
        delen['baard'] = baard(bron, rig, m, M)
    if S['ogen'].get('vorm', True):  # ronde 10: de HumGen-man heeft eigen oogbollen (in het lijf)
        delen['ogen'] = ogen(rig, m, M)
    delen['helm'] = helm(rig, m, M)
    # ronde 13: kleding van buiten die deze soldaat niet draagt weg (het basisbestand heeft alle stukken)
    for ob in [o for o in bpy.data.objects if o.name.startswith('buiten-') and o not in delen.values()]:
        bpy.data.objects.remove(ob, do_unlink=True)
    for naam, ob in delen.items():
        ob.name = ob.data.name = naam
        bouw.skelet_eraan(ob, rig)
        ob['laag'] = LAAG[naam]
    delen['broek']['gevraagd'] = False  # niet in de opdracht: zonder broek blote knieen
    bpy.context.view_layer.update()
    # de houding van de soldaat: de idle, de armen wat verder uit, links een losse vuist, rechts de vuist om de speer
    stand.zet(rig, INST['houdingen']['idle'] + S['stand'] + S['houding'])
    grond = stand.op_de_grond(rig, delen['laarzen'])
    Sp = S['speer']
    vuist, scheef = greep(rig, Sp['straal'], S['handschoenen']['afstand'] + S['handschoenen']['dikte'])
    speer = speer_mesh(M)
    # de greep: een leeg object aan het bot van de rechterhand, in het midden van de vuist, de Z-as langs de schacht; de
    # speer eraan met de voet op de grond
    gr = bpy.data.objects.new('greep.R', None)
    bpy.context.scene.collection.objects.link(gr)
    gr.empty_display_type, gr.empty_display_size = 'ARROWS', 0.1
    gr.parent, gr.parent_type, gr.parent_bone = rig, 'BONE', 'wrist.R'
    gr.matrix_world = Matrix.Translation(vuist)
    speer.parent = gr
    speer.matrix_world = Matrix.Translation(Vector((vuist.x, vuist.y, 0.0)))
    speer['laag'] = 9
    bpy.context.view_layer.update()
    houding_vast(rig)
    feiten_speer = (grond, vuist, scheef, gr)
    # het lijf onder de kleren weg: wat onder een laag ligt (een straal langs de normaal raakt hem binnen 5 cm) en wat je
    # nooit ziet (in de houding van de soldaat en in rust, acht richtingen op drie hoogtes); dan in rust per laag wat
    # bedekt hoort te blijven (voor de doorsteektoets)
    kleren = [o for o in delen.values()]
    gezien = gezien_lijf(lijf, rig)
    stand.rust(rig)
    onder = bedekking(lijf, kleren, 0.05, recht=True)
    bm = bmesh.new()
    bm.from_mesh(lijf.data)
    bm.faces.ensure_lookup_table()
    voor = len(bm.faces)
    weg = [f for f in bm.faces if f.index not in gezien and all(onder[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(lijf.data)
    bm.free()
    lijf['laag'] = 0
    # wat van het lijf nog onder een laag ligt, bleef omdat je het ziet (een strook langs de randen van de kleren)
    onder = bedekking(lijf, kleren, 0.05, recht=True)
    nog = sum(1 for p in lijf.data.polygons if all(onder[i] for i in p.vertices))
    feiten = {'lijf_vlakken': {'voor': voor, 'weg': len(weg), 'over': voor - len(weg), 'gezien': len(gezien),
                               'over_onder_de_kleren': nog}, 'bedekt': {}}
    for naam, ob in [('lijf', lijf)] + list(delen.items()):
        boven = [o for n, o in delen.items() if LAAG[n] > LAAG.get(naam, 0)]
        # alleen lagen binnen 6 cm: de hals onder de kraag telde anders als bedekt doordat de stralen de helmrand raakten
        onder = bedekking(ob, boven, 0.06) if boven else [False] * len(ob.data.vertices)
        a = ob.data.attributes.new('bedekt', 'FLOAT', 'FACE')
        waarden = [1.0 if all(onder[i] for i in p.vertices) else 0.0 for p in ob.data.polygons]
        a.data.foreach_set('value', waarden)
        feiten['bedekt'][naam] = int(sum(waarden))
    import soldaat_render as SR
    SR.houding(rig)
    # wat de controle wil weten
    grond, vuist, scheef, gr = feiten_speer
    deps = bpy.context.evaluated_depsgraph_get()
    e = speer.evaluated_get(deps)
    zs = [(speer.matrix_world @ v.co).z for v in e.data.vertices]
    feiten.update({
        'driehoeken': {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in [lijf] + list(delen.values()) + [speer]},
        'grond_verschoven': round(-grond, 4),
        'speer': {'vuist': [round(c, 4) for c in vuist], 'voet_z': round(min(zs), 4), 'punt_z': round(max(zs), 4),
                  'hand_bijgekanteld': round(scheef, 1), 'ouder': gr.name, 'bot': gr.parent_bone},
        'maten': {'riem': round(m.riem, 4), 'zoom': round(m.zoom, 4), 'laars': round(m.laars, 4), 'oog': round(m.oog, 4)},
        'helm': json.loads(delen['helm']['maten']),
    })
    for ob in list(delen.values()) + [speer, lijf]:
        ob['onderdeel'] = ob.name
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'bron', 'soldaat.blend'))
    json.dump(feiten, open(os.path.join(UIT, 'soldaat.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('SOLDAAT', json.dumps(feiten, ensure_ascii=False))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
