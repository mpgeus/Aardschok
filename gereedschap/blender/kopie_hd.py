# Een kopie van de man op de platen van GPT (vraag 190; Marcel, 27 okt: "probeer maar een kopie hiervan in blender te maken,
# gebruik alles wat tot je beschikking is, ik wil een perfecte kopie als het ware"). De bron: drie platen van ChatGPT,
# gemaakt met de prompt van 27 okt (een model sheet in een rusthouding van voren, schuin, opzij en achter; een vel met de
# onderdelen; de man met de speer), in gereedschap/pixelart/bron/soldaten/gpt/.
#
# Hetzelfde lijf, skelet en dezelfde onderdelen als de speerman (speerman_hd.py), maar met de maten van de plaat (een gewone
# man, geen gedrongen poppetje: het hoofd met helm een zesde), de houding van de plaat (de armen hangend, de benen wijd,
# zonder speer), en de kleren van de plaat: een gewatteerd jak met kleine ruiten en een hoge gewatteerde kraag, een
# gevierendeelde wapenrok met het jak eronder, een smalle riem met nagels en twee hangende einden, een buidel rechts en
# een dolk links, handschoenen met wijde kappen, een wijde bruine broek, en laarzen met een omslag. Gerenderd zoals de
# plaat: van voren, schuin, opzij en achter, de camera horizontaal, zacht licht van linksvoor.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/kopie_hd.py -- <map> [Z ZW W N] [blend]
# naar <map>/kopie-<richting>.png (vrijstaand, de man 879 pixels hoog en de zolen op 951, zoals op de plaat); daarna
# python gereedschap/blender/kopie_vergelijk.py <plaat> <map> (de kopie op de plaat gelegd, en gemeten).
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import speerman_hd as sh  # noqa: E402
from speerman_hd import Knopen, lin  # noqa: E402

# de plaat (gemeten op het vooraanzicht, als deel van de lengte van de zolen tot de top van de helm)
PLAAT = {'hoogte': 879, 'zolen': 951, 'riem': 0.573, 'zoom': 0.38, 'jak': 0.348, 'laarsrand': 0.165}
RICHTINGEN = {'Z': 0, 'ZW': 25, 'W': 90, 'N': 180}  # zoals de plaat: van voren, schuin (gemeten: 25 past het best, de plaat
# staat daar niet op 45 graden), opzij (naar links) en achter

# de kleuren van de plaat (de mediaan van 7 bij 7 pixels in het licht; kopie_vergelijk.py meet ze opnieuw)
BLAUW, GEEL = '#34528a', '#dca64e'
JAK = ('#7a5a46', '#4a3426', '#8e6a52', '#2a1c12')  # gevlekt licht en donker, de toppen van de kussens, de naden
BROEK = '#6f5340'
HAAR = '#2a1e16'

sh.INSTELLINGEN.update({
    # een gewone, stevige man van middelbare leeftijd (de plaat), niet het gedrongen poppetje van vel 01
    'mens': {'gender': 1.0, 'age': 0.6, 'muscle': 0.8, 'weight': 0.75, 'proportions': 0.5, 'height': 0.5},
    'doelen': {'torso/measure-shoulder-dist-incr': 0.5, 'torso/measure-frontchest-dist-incr': 0.5,
               'torso/torso-scale-depth-incr': 0.5, 'legs/measure-thigh-circ-incr': 0.5, 'legs/measure-calf-circ-incr': 0.5,
               'head/head-square': 0.9, 'head/head-fat-incr': 0.3, 'head/head-scale-horiz-incr': 0.4, 'hands/l-hand-scale-incr': 0.6, 'hands/r-hand-scale-incr': 0.6,
               'arms/l-upperarm-fat-incr': 0.6, 'arms/r-upperarm-fat-incr': 0.6, 'arms/l-lowerarm-fat-incr': 0.5,
               'arms/r-lowerarm-fat-incr': 0.5, 'eyebrows/eyebrows-angle-down': 0.8, 'eyebrows/eyebrows-trans-down': 0.5,
               'nose/nose-scale-horiz-incr': 0.3, 'head/head-age-incr': 0.5,
               # het gezicht van de plaat: een brede, hoekige kaak en kin, hoge jukbeenderen en ingevallen wangen, een
               # rechte neus met een bult, de wenkbrauwen ver naar voren boven diepe ogen, een smalle mond
               'chin/chin-width-incr': 0.5, 'chin/chin-prominent-incr': 0.3, 'chin/chin-height-incr': 0.3,
               'cheek/l-cheek-bones-incr': 0.6, 'cheek/r-cheek-bones-incr': 0.6, 'cheek/l-cheek-volume-decr': 0.4,
               'cheek/r-cheek-volume-decr': 0.4, 'nose/nose-hump-incr': 0.4, 'nose/nose-scale-vert-incr': 0.3,
               'nose/nose-point-width-incr': 0.3, 'eyebrows/eyebrows-trans-forward': 0.7, 'forehead/forehead-trans-forward': 0.3,
               'mouth/mouth-scale-horiz-incr': 0.2, 'mouth/mouth-lowerlip-volume-decr': 0.3, 'head/head-rectangular': 0.5},
    'been': 1.0, 'hoofd': 0.94, 'armlengte': 1.0, 'borst': 0, 'kijk': (0, 0),
    'voeten': {'R': 10, 'L': 10}, 'benen_in': -2,  # de benen wijd, zoals de plaat (de voeten 0,26 van de lengte uit elkaar)
    'lijn': 0.0, 'camera': 0, 'samples': 64, 'res': (440, 1024), 'pxm': 600, 'anker_y': PLAAT['zolen'],
})
sh.ARM_VOOR = {'draai': 0.0, 'sleutelbeen': 0.0, 'schouder': 0.0, 'bovenarm': 0.0, 'onderarm': 0.0}
# de armen hangend, wat van het lijf, de onderarm wat verder naar buiten (de plaat: de bovenarm 11 graden, de onderarm 17)
ARM = {'boven': (0.3, 0.0, -1), 'onder': (0.45, -0.1, -1), 'pols': (0.45, -0.08, -1)}
# de helm van de plaat: een brede rand die gelijk rondom wat afloopt, geen punt bovenop
sh.HELM_RAND = 1.55
sh.HELM_RAND_HOOGTE = 0.075  # de voet van de koepel 7 cm boven de ogen: het voorhoofd onder de rand (plaat 1)
sh.HELM_ZAK = 0.1
sh.HELM_ACHTER = 0.0
sh.LAARS_OM = 0.024  # de laars om de wijde broek
sh.LAARS_BREDER = 0.008  # de voet slanker dan bij de speerman: de plaat heeft gewone laarzen, geen bolle neuzen
sh.LAARS_LANGER = 0.035
VOET_LAAG = 0.82  # de voet van de laars zoveel lager (de bol van speerman_hd is hoog en rond)
sh.ZOOM_DIK = 0.0035  # een smal blauw biesje om het armsgat in plaats van de gouden zoom
# gladgeschoren met wat stoppels in de verf (de plaat), alleen de zware donkere wenkbrauwen van haar; met haar voor de
# stoppels werd het op deze maat een volle donkere baard
sh.BAARD = (('brauw', 'brauw', 3000, 0.008, 0.0),)
sh.BAARD_VOL = 0.0

H = {}  # de maten van dit lijf: 'lengte' (zolen tot de top van de helm), 'riem', 'zoom', 'jak' (z in meters)


# ---------------------------------------------------------------- het lijf en de houding

_mens = sh.mens


def mens():
    """Het lijf van speerman_hd, dan de armen hangend zoals op de plaat, en de maten van de plaat op dit lijf."""
    lijf, rig = _mens()
    for k, s in (('L', 1), ('R', -1)):
        sh.richt(rig, f'clavicle.{k}', (s, 0.0, 0.02))
        sh.richt(rig, f'shoulder01.{k}', (s, 0.05, -0.45))
    for k, s in (('L', 1), ('R', -1)):
        for b in ('upperarm01', 'upperarm02'):
            sh.richt(rig, f'{b}.{k}', (ARM['boven'][0] * s, ARM['boven'][1], ARM['boven'][2]))
        for b in ('lowerarm01', 'lowerarm02'):
            sh.richt(rig, f'{b}.{k}', (ARM['onder'][0] * s, ARM['onder'][1], ARM['onder'][2]))
        sh.richt(rig, f'wrist.{k}', (ARM['pols'][0] * s, ARM['pols'][1], ARM['pols'][2]))
    deps = bpy.context.evaluated_depsgraph_get()
    me = lijf.evaluated_get(deps).to_mesh()
    punten = [lijf.matrix_world @ v.co for v in me.vertices]  # in de wereld: _mens zette hem al op de grond
    lijf.evaluated_get(deps).to_mesh_clear()
    z0 = min(p.z for p in punten)
    rig.location.z -= z0
    bpy.context.view_layer.update()
    lengte = helm_maten([p - Vector((0, 0, z0)) for p in punten], rig)['top']  # tot de kam van de helm
    H.update(lengte=lengte, riem=PLAAT['riem'] * lengte, zoom=PLAAT['zoom'] * lengte, jak=PLAAT['jak'] * lengte)
    knie = (rig.matrix_world @ rig.pose.bones['lowerleg01.L'].head).z
    sh.ROK_ZOOM = H['jak'] - knie  # de rok tot de zoom van het jak; de wapenrok houdt daarboven op (mat_wapenrok)
    print('KOPIE maten', {k: round(v, 3) for k, v in H.items()}, 'knie', round(knie, 3))
    return lijf, rig


def greep(rig, k, r_schacht, handschoen=0.007, duim=0.0):
    """Geen speer: de vingers ontspannen, wat gekromd, zoals op de plaat."""
    for v in range(2, 6):
        for d, hoek in ((1, 14), (2, 20), (3, 14)):
            sh.krul(rig, f'finger{v}-{d}.{k}', math.radians(hoek))
    sh.krul(rig, f'finger1-2.{k}', math.radians(10))
    rig[f'holte.{k}'] = [0.0, 0.0, 0.0]
    return Vector()


# ---------------------------------------------------------------- materialen

_mat_stof, _mat_leer, _mat_staal = sh.mat_stof, sh.mat_leer, sh.mat_staal
STOF = {'hozen': BROEK, 'wapenrok-goud': '#2c3f6a'}
LEER = {'riem': ('#5e3e2c', '#2a160c'), 'omslag': ('#7a5c4a', '#3a261a'), 'handschoen': ('#5a3e30', '#22140c'),
        'schede': ('#6a4430', '#2a160c'), 'leer': ('#5a3c2a', '#2a160c'), 'koord': ('#6a4a34', '#2a160c')}


def mat_stof(naam, kleur, *a, **kw):
    if naam == 'hozen':
        return mat_broek()
    return _mat_stof(naam, STOF.get(naam, kleur), *a, **kw)


def mat_broek():
    """De broek van de plaat: bruine wol, gevlekt als suède."""
    k = Knopen('hozen')
    kl = k.meng(k.glad(k.ruis(6, 3), 0.3, 0.7, 0, 0.5), lin('#86644a'), lin('#56402c'))
    kl = k.met_textuur(kl, 'brown_leather', 0.35, contrast=0.8, kracht=0.6)
    k.bobbel(k.ruis(5, 0, rek=(1.2, 1.2, 3.0)), 1.0, 0.03)  # brede liggende plooien in de wol
    return k.af(kl, ruw=0.85, holte=0.6)


def mat_leer(naam, kleur, donker='#2a160a'):
    return _mat_leer(naam, *LEER.get(naam, (kleur, donker)))


def mat_staal(naam='staal', kleur='#9aa0a8', ruw=0.32):
    # de helm van de plaat: mat grijs staal, gedeukt en wat vuil, niet blauwig
    return _mat_staal(naam, '#8e8c8e', 0.38) if naam == 'helm' else _mat_staal(naam, kleur, ruw)


def mat_huid(rig=None):
    """De huid van de plaat: gebruind, met donkere oogkassen (zoals speerman_hd.mat_huid, donkerder)."""
    k = Knopen('huid')
    r = k.ruis(60, 4)
    kl = k.meng(k.glad(k.ruis(14, 2), 0.4, 0.7, 0, 0.35), lin('#b07050'), lin('#965c40'))
    kl = k.meng(k.w('MULTIPLY', r, 0.15), kl, lin('#704028'))
    if rig is not None:
        p = k.n('ShaderNodeVectorMath', operation='MULTIPLY')
        k.zet(p.inputs[0], k.plek())
        p.inputs[1].default_value = (1, 0.35, 1)
        kas = None
        for kant in ('L', 'R'):
            o = rig.matrix_world @ rig.pose.bones[f'eye.{kant}'].head
            d = k.n('ShaderNodeVectorMath', operation='DISTANCE')
            k.nt.links.new(p.outputs[0], d.inputs[0])
            d.inputs[1].default_value = (o.x, o.y * 0.35, o.z + 0.003)
            g = k.glad(d.outputs['Value'], 0.024, 0.008)
            kas = g if kas is None else k.w('MAXIMUM', kas, g)
        kl = k.meng(k.w('MULTIPLY', kas, 0.5), kl, lin('#3a1c0e'))
        # de stoppels: fijne donkere puntjes van onder de neus tot onder de kaak, voor de oren, zacht naar de rand, de
        # lippen vrij; een vlak in de verf, gemeten vanaf de ogen (een eigen vlak, baardvorm, had een harde rand)
        W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
        oog = W('eye.L')
        sep = k.n('ShaderNodeSeparateXYZ')
        k.zet(sep.inputs[0], k.plek())
        x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
        mond = W('oris01')
        st = k.w('MULTIPLY', k.glad(z, oog.z - 0.03, oog.z - 0.06), k.glad(z, oog.z - 0.15, oog.z - 0.11))
        st = k.w('MULTIPLY', st, k.glad(y, oog.y + 0.06, oog.y + 0.02))
        st = k.w('MULTIPLY', st, k.glad(k.w('ABSOLUTE', x), 0.076, 0.05))
        lip = k.w('MULTIPLY', k.glad(k.w('ABSOLUTE', x), 0.03, 0.02),
                  k.glad(k.w('ABSOLUTE', k.w('SUBTRACT', z, mond.z + 0.002)), 0.011, 0.006))
        st = k.w('MULTIPLY', st, k.w('SUBTRACT', 1.0, lip))  # de lippen vrij
        # sterk: de huid dempt de verf (met de helft naar donkerbruin werd de kaak maar 10 procent donkerder), vlekkerig
        # en met fijne puntjes
        stip = k.w('MULTIPLY', k.glad(k.ruis(900, 2), 0.38, 0.62), k.glad(k.ruis(60, 2), 0.3, 0.6, 0.6, 1.0))
        kl = k.meng(k.w('MULTIPLY', st, k.w('ADD', 0.55, k.w('MULTIPLY', stip, 0.4))), kl, lin('#221a16'))
    k.bsdf.inputs['Subsurface Weight'].default_value = 0.12
    k.bsdf.inputs['Subsurface Radius'].default_value = (0.9, 0.4, 0.25)
    k.bsdf.inputs['Subsurface Scale'].default_value = 0.01
    k.bobbel(r, 0.15, 0.001)
    return k.af(kl, ruw=0.5, holte=0.45)


def mat_stoppels():
    """De stoppels: de huid wat grauw, met fijne donkere puntjes."""
    k = Knopen('baardvorm')
    kl = k.meng(k.glad(k.ruis(900, 2), 0.4, 0.6, 0.0, 0.55), lin('#8a5a42'), lin('#2c2622'))
    return k.af(kl, ruw=0.8, holte=0.3)


def mat_wambuis():
    """Het gewatteerde jak van de plaat: grijzig bruin, gevlekt, de kussens licht met donkere naden."""
    k = Knopen('wambuis')
    v = k.ruis(5, 2)
    kus = k.n('ShaderNodeAttribute', attribute_name='kussen').outputs['Fac']
    kl = k.meng(k.glad(v, 0.3, 0.7, 0, 0.45), lin(JAK[0]), lin(JAK[1]))
    kl = k.meng(k.glad(kus, 0.8, 0.98, 0.0, 0.3), kl, lin(JAK[2]))
    kl = k.meng(k.glad(kus, 0.15, 0.8, 0.6, 0.0), kl, lin(JAK[3]))
    kl = k.met_textuur(kl, 'rough_linen', 0.7, contrast=1.0, kracht=1.2)
    return k.af(kl, ruw=0.9, holte=0.55)


def mat_wapenrok(z_riem, z_zoom=0.0):
    """Gevierendeeld, vast aan het lijf (de prompt): zijn rechterborst blauw, zijn linkerborst geel, onder de riem andersom,
    voor en achter op dezelfde kant van het lijf. De onderste rand van de rok is het jak dat eronder uitkomt."""
    z_riem = H['riem']
    k = Knopen('wapenrok')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    x, z = sep.outputs['X'], sep.outputs['Z']
    boven = k.glad(z, z_riem - 0.004, z_riem + 0.004)
    links = k.glad(x, -0.003, 0.003)  # zijn linkerkant (+x)
    f = k.w('ADD', k.w('MULTIPLY', boven, links),
            k.w('MULTIPLY', k.w('SUBTRACT', 1.0, boven), k.w('SUBTRACT', 1.0, links)))
    kl = k.meng(f, lin(BLAUW), lin(GEEL))
    kl = k.meng(k.glad(k.ruis(7, 2), 0.35, 0.65, 0, 0.08), kl, (0, 0, 0, 1))  # wat vlekkerig
    kl = k.meng(k.w('MULTIPLY', k.glad(k.ruis(90, 2), 0.62, 0.72), 0.5), kl, lin('#3a2a20'))  # fijne spikkels
    kl = k.meng(k.w('MULTIPLY', k.glad(k.ruis(40, 3), 0.6, 0.7), 0.15), kl, lin('#5a4030'))  # vuile spatjes
    kl = k.meng(k.w('MULTIPLY', k.glad(k.ruis(14, 3), 0.64, 0.76), 0.15), kl, lin('#d8c8a8'))  # verschoten plekken
    # de zoom: een donkerder rand langs de zijkant van het paneel, de rand van de rok en boven de onderzoom
    L = H['lengte']
    ax = k.w('ABSOLUTE', x)
    zoom = k.w('MAXIMUM', k.w('MULTIPLY', k.glad(ax, PANEEL * L - 0.014, PANEEL * L - 0.006), boven),
               k.w('MULTIPLY', k.glad(ax, 0.13 * L - 0.014, 0.13 * L - 0.006), k.w('SUBTRACT', 1.0, boven)))
    zoom = k.w('MAXIMUM', zoom, k.glad(z, H['zoom'] + 0.018, H['zoom'] + 0.008))
    kl = k.meng(k.w('MULTIPLY', zoom, 0.3), kl, (0, 0, 0, 1))
    # het jak onder de zoom: kleine ruiten, zoals de mouwen
    jak = k.glad(z, H['zoom'] + 0.002, H['zoom'] - 0.002)
    zij = k.w('MULTIPLY', k.glad(k.w('ABSOLUTE', x), 0.13 * H['lengte'] - 0.002, 0.13 * H['lengte'] + 0.002),
              k.w('SUBTRACT', 1.0, boven))  # de wapenrok is 0,26 van de lengte breed; wat breder valt, is het jak
    jak = k.w('MAXIMUM', jak, zij)
    rx = k.w('SINE', k.w('MULTIPLY', k.w('ADD', x, z), 2 * math.pi / 0.045))
    ry = k.w('SINE', k.w('MULTIPLY', k.w('SUBTRACT', x, z), 2 * math.pi / 0.045))
    ruit = k.w('POWER', k.w('ABSOLUTE', k.w('MULTIPLY', rx, ry)), 0.3)
    jak_kl = k.meng(k.glad(ruit, 0.1, 0.7), lin(JAK[3]), lin(JAK[0]))
    kl = k.meng(jak, kl, jak_kl)
    kl = k.met_textuur(kl, 'rough_linen', 0.4, contrast=1.0, kracht=1.2)  # het weefsel te zien, zoals op de plaat
    k.bobbel(k.ruis(3, 1, rek=(2.5, 2.5, 0.6)), 0.35, 0.02)  # brede staande plooien
    k.bsdf.inputs['Sheen Weight'].default_value = 0.3
    return k.af(kl, ruw=0.92, holte=0.6)


def mat_laars():
    """Grijzig bruin, versleten leer, met een donkere zool (de plaat)."""
    k = Knopen('laars')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    kl = k.meng(k.glad(k.ruis(18, 5), 0.3, 0.75, 0, 0.6), lin('#9a7058'), lin('#3e2a1e'))
    kl = k.meng(k.glad(k.ruis(7, 3, rek=(1, 1, 2.5)), 0.55, 0.7, 0, 0.5), kl, lin('#2a1c14'))  # donkere kreukels
    kl = k.meng(k.glad(sep.outputs['Z'], 0.017, 0.014), kl, lin('#1a0f09'))
    kl = k.met_textuur(kl, 'brown_leather', 0.3, contrast=1.0, kracht=2.2)  # de nerf en de kreukels groter
    geo = k.n('ShaderNodeNewGeometry')
    kl = k.meng(k.w('MULTIPLY', k.glad(geo.outputs['Pointiness'], 0.5, 0.58), 0.55), kl, lin('#c8a088'))  # slijtage
    return k.af(kl, ruw=0.6, holte=0.45)


def mat_kraag():
    """De hoge gewatteerde kraag: het bruin van het jak, met ruiten van 3,2 cm (op de uv van de koker: rond en langs in
    meters; liggende banen lazen als een zwemband)."""
    k = Knopen('kraag')
    uv = k.n('ShaderNodeUVMap', uv_map='uv')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], uv.outputs['UV'])
    u, v = sep.outputs['X'], sep.outputs['Y']
    f = 2 * math.pi / 0.032
    kus = k.w('POWER', k.w('ABSOLUTE', k.w('MULTIPLY', k.w('SINE', k.w('MULTIPLY', k.w('ADD', u, v), f / 2)),
                                                  k.w('SINE', k.w('MULTIPLY', k.w('SUBTRACT', u, v), f / 2)))), 0.3)
    kl = k.meng(k.glad(k.ruis(5, 2), 0.3, 0.7, 0, 0.45), lin(JAK[0]), lin(JAK[1]))
    kl = k.meng(k.glad(kus, 0.8, 0.98, 0.0, 0.3), kl, lin(JAK[2]))
    kl = k.meng(k.glad(kus, 0.1, 0.6, 0.6, 0.0), kl, lin(JAK[3]))
    kl = k.met_textuur(kl, 'rough_linen', 0.7, contrast=1.0, kracht=1.2)
    k.bobbel(kus, 0.8, 0.005)
    return k.af(kl, ruw=0.9, holte=0.5)


def mat_haar():
    """Kort donker haar onder de helm: strepen naar beneden."""
    k = Knopen('haarkap')
    kl = k.meng(k.glad(k.ruis(80, 3, rek=(1, 1, 0.12)), 0.35, 0.65), lin(HAAR), lin('#4a382a'))
    return k.af(kl, ruw=0.6, holte=0.3)


# ---------------------------------------------------------------- de kleren

def wambuis(lijf, rig, mat):
    """De mouwen van het jak, zoals speerman_hd.wambuis, met de kleinere ruiten van de plaat (4,5 cm, acht rondom)."""
    arm = sh.gewicht(lijf, ('upperarm', 'lowerarm', 'shoulder01', 'clavicle'))
    hand = sh.gewicht(lijf, ('wrist', 'finger', 'metacarpal'))
    ob = sh.uit_huid('wambuis', lijf, [a > 0.35 and h < 0.2 for a, h in zip(arm, hand)], 0.0, mat, sub=2)
    bpy.context.view_layer.update()
    assen = {}
    for k in ('L', 'R'):
        a = rig.matrix_world @ rig.pose.bones[f'upperarm01.{k}'].head
        e = rig.matrix_world @ rig.pose.bones[f'lowerarm02.{k}'].tail
        assen[k] = (a, (e - a).normalized())
    me = ob.data
    schouder_x = abs((rig.matrix_world @ rig.pose.bones['upperarm01.L'].head).x)
    ns = [v.normal.copy() for v in me.vertices]
    RUIT, RONDOM = 0.038, 10
    kussens = []
    for v, nrm in zip(me.vertices, ns):
        p = v.co.copy()
        a, as_ = assen['L' if p.x > 0 else 'R']
        langs = (p - a).dot(as_)
        q = a + as_ * langs
        voor = Vector((0, -1, 0))
        x1 = (voor - as_ * voor.dot(as_)).normalized()
        y1 = as_.cross(x1)
        r = p - q
        rond = math.atan2(r.dot(y1), r.dot(x1)) / (2 * math.pi) * RONDOM * RUIT
        u, w = (langs + rond) / RUIT, (langs - rond) / RUIT
        kussen = (math.sin(math.pi * (u - math.floor(u))) * math.sin(math.pi * (w - math.floor(w)))) ** 0.3
        f = max(0.0, min(1.0, (abs(p.x) - (schouder_x - 0.04)) / 0.06))
        f = f * f * (3 - 2 * f)
        sch = 0.45 + 0.55 * min(1.0, max(0.0, langs / 0.14)) ** 0.8
        v.co += nrm * (0.01 + (0.014 + 0.012 * kussen) * f * sch)
        kussens.append(kussen)
    me.attributes.new('kussen', 'FLOAT', 'POINT').data.foreach_set('value', kussens)
    return ob


_wapenrok = sh.wapenrok


PANEEL = 0.112  # de wapenrok van plaat 1 is een recht paneel: zijn zijkant zo ver uit het midden (deel van de lengte)


def wapenrok(lijf, rig, mouwen, M, z_riem):
    """De wapenrok van speerman_hd, boven de riem een recht paneel zoals op plaat 1: de punten verder opzij dan PANEEL
    schuiven naar die lijn, zodat de zijkant recht van de schouder naar de riem loopt en de mouwkop erbuiten valt (een
    boog of vlakken weghalen gaf gekartelde hoeken)."""
    lijfje, rok = _wapenrok(lijf, rig, mouwen, M, H['riem'])
    rand = PANEEL * H['lengte']
    for v in lijfje.data.vertices:
        if abs(v.co.x) > rand:
            v.co.x = math.copysign(rand, v.co.x)
    return [lijfje, rok]


def kraag(lijf, rig, mouwen, lijfje, M):
    """De hoge gewatteerde kraag van de plaat: een dikke rol om de hals, van de wapenrok tot onder de kaak, achter hoger."""
    arm = sh.gewicht(lijf, ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'))
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    nek, kin = W('neck02'), W('special04')
    bvh = sh.bvh_van([(lijf, [a < 0.2 and v.co.z < kin.z - 0.01 for a, v in zip(arm, lijf.data.vertices)]), (lijfje, None)])

    def z(t, th):
        voor = max(0.0, math.cos(th)) ** 1.5  # 1 recht voor, 0 opzij en achter
        boven = kin.z + 0.012 + 0.04 * (1 - voor) - 0.03 * voor ** 6  # achter hoger, van voren een V
        onder = nek.z - 0.06
        return boven - t * (boven - onder)
    k = sh.koker('kraag', bvh, sh.staand(0, nek.y + 0.01, z), [i / 16 for i in range(17)],
                 lambda t, th: 0.006 + 0.014 * math.sin(math.pi * min(1.0, t * 1.05)) ** 0.5, n=128, mat=mat_kraag())
    sh.dik(k, 0.006)
    return k


def haarkap(lijf, rig, M):
    """In plaats van de maliënkap: kort donker haar onder de helm, van achter de slaap over en achter het oor tot in de
    nek, zoals op de plaat; het voorhoofd, de oren en het gezicht vrij (een rand voor het oor las als een blok, en
    vooraan als een pony)."""
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    hoofdbot, oog = W('head'), W('eye.L')
    hoofd = [v.co for v in lijf.data.vertices if v.co.z > hoofdbot.z - 0.05]
    cy = (min(p.y for p in hoofd) + max(p.y for p in hoofd)) / 2
    bvh = sh.bvh_van([(lijf, [v.co.z > hoofdbot.z - 0.12 for v in lijf.data.vertices])])
    zb = oog.z + sh.HELM_RAND_HOOGTE * sh.INSTELLINGEN['hoofd']
    z_onder = oog.z - 0.07
    k = sh.koker('haar', bvh, sh.staand(0, cy, lambda t, th: zb - t * (zb - z_onder)), [i / 12 for i in range(13)],
                 lambda t, th: 0.002, n=96, mat=mat_haar(), ver=0.4)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(k.data)
    weg = []
    for f in bm.faces:
        c = f.calc_center_median()
        hoek = abs(math.degrees(math.atan2(c.x, -(c.y - cy))))
        houden = hoek > 112 or (88 < hoek <= 112 and c.z > oog.z + 0.02)
        if not houden:
            weg.append(f)
    bmesh.ops.delete(bm, geom=weg, context='FACES')
    bm.to_mesh(k.data)
    bm.free()
    sh.dik(k, 0.003)
    return k


HELM_HOOG = 1.1  # de koepel zoveel hoger dan bij de speerman (met 1,6 zakte de man onder een klok: de ogen op 80 procent)
HELM_VAL = 0.04  # zo ver valt de rand van de koepel tot de buitenkant


def helm_maten(punten, rig):
    """De maten van de helm uit de punten van het hoofd in de wereld: het midden, de koepel en de top van de kam."""
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    hoofdbot, oog = W('head'), W('eye.L')
    hoofd = [p for p in punten if p.z > hoofdbot.z + 0.01]
    xs, ys, zs = [p.x for p in hoofd], [p.y for p in hoofd], [p.z for p in hoofd]
    m = {'cx': (min(xs) + max(xs)) / 2, 'cy': (min(ys) + max(ys)) / 2 + sh.HELM_ACHTER,
         'zb': oog.z + sh.HELM_RAND_HOOGTE * sh.INSTELLINGEN['hoofd']}
    m['rx'], m['ry'] = (max(xs) - min(xs)) / 2 + 0.02, (max(ys) - min(ys)) / 2 + 0.018
    m['hoog'] = max(max(zs) - m['zb'] + 0.012, m['rx'] * 0.95) * HELM_HOOG
    m['top'] = m['zb'] + m['hoog'] + 0.012
    return m


def helm(lijf, rig, M):
    """De ketelhoed van de plaat (zoals speerman_hd.helm): een hoge ronde koepel met één kam van voor naar achter, een
    rij klinknagels rond de voet, een brede rand die gelijk rondom afloopt met een opgerolde zoom, en een leren kinriem."""
    import bmesh
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    hoofdbot, oog, kin = W('head'), W('eye.L'), W('special04')
    m = helm_maten([v.co for v in lijf.data.vertices], rig)
    cx, cy, zb, rx, ry, hoog = m['cx'], m['cy'], m['zb'], m['rx'], m['ry'], m['hoog']
    print('KOPIE helm (deel van de lengte): ogen', round(oog.z / m['top'], 3), 'kin', round(kin.z / m['top'], 3),
          'voet koepel', round(zb / m['top'], 3), 'rand', round((zb - HELM_VAL) / m['top'], 3),
          'koepel breed', round(rx / m['top'], 3), 'rand breed', round(rx * sh.HELM_RAND / m['top'], 3))
    delen = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=(cx, cy, zb))
    k = bpy.context.active_object
    k.scale = (rx, ry, hoog)
    bm = bmesh.new()
    bm.from_mesh(k.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.01], context='VERTS')
    bm.to_mesh(k.data)
    bm.free()
    sh.zacht(k)
    delen.append(sh.bak_mod(k))
    # de rand, gelijk rondom wat naar beneden, met een opgerolde zoom
    n = 96
    ringen = ((1.0, 0.0), (1.12, -HELM_VAL * 0.25), (1.3, -HELM_VAL * 0.6), (sh.HELM_RAND, -HELM_VAL))
    zak = lambda th, dz: dz * (1 + sh.HELM_ZAK * max(0.0, math.sin(th)) ** 1.5)
    vs, fs = [], []
    for f, dz in ringen:
        for j in range(n):
            th = 2 * math.pi * j / n
            vs.append((cx + rx * f * math.cos(th), cy + ry * f * math.sin(th), zb + zak(th, dz)))
    for i in range(len(ringen) - 1):
        for j in range(n):
            a = i * n + j
            fs.append((a, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    r = sh.maak('rand', vs, fs)
    sh.dik(r, 0.005)
    delen.append(sh.bak_mod(r))
    bpy.ops.mesh.primitive_torus_add(major_radius=rx * sh.HELM_RAND, minor_radius=0.005, major_segments=96, minor_segments=12,
                                     location=(cx, cy, zb - HELM_VAL))
    t = bpy.context.active_object
    t.scale = (1, ry / rx, 1)
    sh.zacht(t)
    sh.bak_mod(t)
    t.data.transform(t.matrix_world)
    t.matrix_world = Matrix.Identity(4)
    for v in t.data.vertices:
        th = math.atan2((v.co.y - cy) / ry, (v.co.x - cx) / rx)
        v.co.z += zak(th, -HELM_VAL) + HELM_VAL
    delen.append(t)
    # de kam van voor naar achter
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=(cx, cy, zb))
    rib = bpy.context.active_object
    rib.scale = (0.013, ry + 0.012, hoog + 0.012)
    bm = bmesh.new()
    bm.from_mesh(rib.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 0.0], context='VERTS')
    bm.to_mesh(rib.data)
    bm.free()
    sh.zacht(rib)
    rib.name = 'helmrib'
    delen.append(sh.bak_mod(rib))
    # de klinknagels rond de voet van de koepel
    for i in range(30):
        th = 2 * math.pi * i / 30
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.0042,
                                             location=(cx + (rx + 0.001) * math.cos(th), cy + (ry + 0.001) * math.sin(th), zb + 0.01))
        bpy.context.active_object.name = 'nagel'
        delen.append(bpy.context.active_object)
    for o in delen:
        o.data.materials.clear()
        o.data.materials.append(M['helm'])
        o.visible_shadow = False  # het gezicht leesbaar onder de rand, zoals op de plaat (en bij de speerman)
    # de kinriem: van onder de rand voor het oor langs, onder de kin door
    bvh = sh.bvh_van([(lijf, [v.co.z > hoofdbot.z - 0.12 for v in lijf.data.vertices])])
    c = Vector((cx, oog.y + 0.06, (zb + kin.z) / 2))
    punten = []
    for i in range(-20, 21):
        a = math.radians(i * 5)
        d = Vector((math.sin(a), 0, -math.cos(a)))
        s = sh.straal(bvh, c, d, 0.3)
        if s is not None:
            punten.append(c + d * (s + 0.005))
    kromme = bpy.data.curves.new('kinriem', 'CURVE')
    kromme.dimensions = '3D'
    kromme.bevel_depth = 0.0025
    kromme.bevel_resolution = 2
    sp = kromme.splines.new('POLY')
    sp.points.add(len(punten) - 1)
    for pt, q in zip(sp.points, punten):
        pt.co = (q.x, q.y, q.z, 1.0)
    ob = bpy.data.objects.new('kinriem', kromme)
    bpy.context.scene.collection.objects.link(ob)
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps))
    bpy.data.objects.remove(ob)
    riem = bpy.data.objects.new('kinriem', me)
    bpy.context.scene.collection.objects.link(riem)
    riem.data.materials.append(M['riem'])
    sh.zacht(riem)
    delen.append(riem)
    return delen

def doos(naam, plek, maat, mat, as_=None, rand=0.35):
    """Een afgerond blok: maat (breed, diep, hoog), het assenstelsel as_ (3x3: breed, diep, hoog) of recht."""
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.active_object
    o.name = naam
    o.data.transform(Matrix.Diagonal((*maat, 1)))
    m = (as_ if as_ is not None else Matrix.Identity(3)).to_4x4()
    m.translation = plek
    o.matrix_world = m
    b = o.modifiers.new('rand', 'BEVEL')
    b.width = min(maat) * rand
    b.segments = 3
    o.data.materials.append(mat)
    return sh.bak_mod(o)


def riem(bvh, cy, z_riem, M, hangers=True):
    """De riem van de plaat: smal donkerbruin leer met nagels, een vierkante ijzeren gesp met twee lange einden die
    voor de rok hangen, rechts op de heup een buidel met een klep, links een dolk met een bolle knop in een schede."""
    z_riem, L = H['riem'], H['lengte']
    delen = []
    hoog = 0.03 * L
    r = sh.koker('riem', bvh, sh.staand(0, cy, lambda t, th: z_riem + hoog / 2 - t * hoog), [0, 0.5, 1],
                 lambda t, th: 0.008, n=128, mat=M['riem'])
    sh.dik(r, 0.005)
    delen.append(r)
    rond = lambda hoek, z, extra: (lambda d: Vector((0, cy, z)) + d * ((sh.straal(bvh, Vector((0, cy, z)), d) or 0.15) + extra))(
        Vector((math.sin(math.radians(hoek)), -math.cos(math.radians(hoek)), 0)))
    # de nagels, voor en opzij
    for i in range(-11, 12):
        hoek = i * 9
        if abs(hoek) < 20:
            continue
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.0045, location=rond(hoek, z_riem, 0.0135))
        n = bpy.context.active_object
        n.name = 'nagel'
        n.data.materials.append(M['staal'])
        delen.append(n)
    # de gesp: een vierkant van rond ijzer, met de pen
    voor = rond(0, z_riem, 0.016)
    w, h, s = 0.044 * L, 0.038 * L, 0.0045
    hoeken = [voor + Vector((sx * w / 2, 0, sy * h / 2)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4):
        delen.append(sh.staaf('gesp', hoeken[i], hoeken[(i + 1) % 4], s, M['staal']))
    delen.append(sh.staaf('gesp-pen', voor - Vector((w / 2, 0, 0)), voor + Vector((w / 2, -0.003, 0)), s * 0.7, M['staal']))
    # twee lange einden van de gesp tot halverwege de rok (de plaat: 0,14 van de lengte lang, 0,016 breed)
    for x, lang in ((0.004 * L, 0.143 * L), (0.04 * L, 0.13 * L)):
        z_mid = z_riem - lang / 2
        c = Vector((x, cy, z_mid))
        d = Vector((0, -1, 0))
        y = cy - ((sh.straal(bvh, c, d) or 0.15) + 0.006)
        delen.append(doos('riem-eind', Vector((x, y, z_mid)), (0.024 * L, 0.005, lang), M['riem'], rand=0.2))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.003, location=(x, y - 0.003, z_riem - lang + 0.012))
        delen.append(bpy.context.active_object)
        delen[-1].data.materials.append(M['staal'])
    if not hangers:
        return delen
    # de buidel op zijn rechterheup (-x), wat naar voren
    hoek = -55
    d = Vector((math.sin(math.radians(hoek)), -math.cos(math.radians(hoek)), 0))
    breed, diep, hoogte = 0.052 * L, 0.026 * L, 0.082 * L
    c = rond(hoek, z_riem - hoogte * 0.38, diep / 2 + 0.006)
    as_ = Matrix((Vector((d.y, -d.x, 0)), d, Vector((0, 0, 1)))).transposed()
    buidel = sh.mat_leer('buidel', '#7a5440', '#3a2214')  # lichter dan de riem, zoals de plaat
    delen.append(doos('buidel', c, (breed, diep, hoogte), buidel, as_, rand=0.45))
    delen.append(doos('buidel-klep', c + d * (diep / 2 + 0.002) + Vector((0, 0, hoogte * 0.28)),
                      (breed * 1.04, 0.006, hoogte * 0.45), buidel, as_, rand=0.35))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.004,
                                         location=c + d * (diep / 2 + 0.006) + Vector((0, 0, hoogte * 0.1)))
    delen.append(bpy.context.active_object)
    delen[-1].data.materials.append(M['staal'])
    # de dolk op zijn linkerheup (+x): een bolle knop op de riem, het gevest, de pareerstang, en de schede schuin naar buiten
    hoek = 44
    d = Vector((math.sin(math.radians(hoek)), -math.cos(math.radians(hoek)), 0))
    langs = Vector((-d.y, d.x, 0))  # langs het lijf
    schuin = math.radians(12)
    as_ = (Vector((0, 0, -1)) * math.cos(schuin) + d * math.sin(schuin)).normalized()  # van de knop naar de punt
    top = rond(hoek, z_riem + 0.01 * L, 0.025)
    knop = 0.013 * L
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=8, radius=knop, location=top)
    delen.append(bpy.context.active_object)
    delen[-1].data.materials.append(M['staal'])
    g0, g1 = top + as_ * knop, top + as_ * (knop + 0.06 * L)
    delen.append(sh.staaf('gevest', g0, g1, 0.0065 * L, M['koord'], seg=12))
    delen.append(sh.staaf('pareer', g1 - langs * 0.022 * L, g1 + langs * 0.022 * L, 0.0035 * L, M['staal'], seg=10))
    lang = 0.165 * L
    stelsel = Matrix((langs, langs.cross(as_).normalized(), -as_)).transposed()
    delen.append(doos('schede', g1 + as_ * (0.004 + lang / 2), (0.022 * L, 0.01 * L, lang), M['schede'], stelsel, rand=0.45))
    bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.009 * L, radius2=0.002, depth=0.03 * L,
                                    location=g1 + as_ * (lang + 0.01 * L), rotation=as_.to_track_quat('Z', 'Y').to_euler())
    delen.append(bpy.context.active_object)
    delen[-1].data.materials.append(M['staal'])
    return delen


def kappen(lijf, rig, M):
    """De wijde kappen van de handschoenen (de plaat: van de pols tot een derde van de onderarm, wijd uitlopend)."""
    delen = []
    KAP = sh.mat_leer('handschoen-kap', '#6e4c3a', '#2a160c')
    hand = sh.gewicht(lijf, ('wrist', 'finger', 'metacarpal', 'lowerarm02'))
    bvh = sh.bvh_van([(lijf, [h > 0.3 for h in hand])])
    for k in ('L', 'R'):
        w = rig.matrix_world @ rig.pose.bones[f'wrist.{k}'].head
        a = rig.matrix_world @ rig.pose.bones[f'lowerarm02.{k}'].head
        as_ = (w - a).normalized()
        kap = sh.koker('kap.' + k, bvh, lambda t, th, w=w, as_=as_: (w - as_ * (0.1 - 0.1 * t), as_), [0, 0.5, 1],
                       lambda t, th: 0.042 - 0.03 * t, n=64, mat=KAP, ver=0.2)
        sh.dik(kap, 0.005)
        delen.append(kap)
    return delen


_laarzen, _kruin = sh.laarzen, sh.kruin


def laarzen(lijf, rig, M):
    """Eerst de wijde broek (de plaat: de dij 0,12 van de lengte breed), van de heup tot in de laars; dan de laarzen van
    speerman_hd, met de rand op de hoogte van de plaat."""
    been = sh.gewicht(lijf, ('upperleg', 'lowerleg'))
    z_laars = PLAAT['laarsrand'] * H['lengte']
    # alleen onder de rok: de rok viel al (stofsimulatie) en houdt 1 cm van het been, de wijde broek prikte erdoor
    kies = [b > 0.5 and z_laars - 0.04 < v.co.z < H['jak'] + 0.03 for b, v in zip(been, lijf.data.vertices)]
    broek = sh.uit_huid('broek', lijf, kies, 0.026, M['hozen'], sub=1)
    # waar de broek in de laars valt, kreukelt hij
    me = broek.data
    me.update()
    for v, n in zip(me.vertices, [v.normal.copy() for v in me.vertices]):
        h = v.co.z - z_laars
        if -0.04 < h < 0.15:
            hoek = math.atan2(v.co.y, v.co.x)
            v.co += n * 0.007 * math.exp(-((h - 0.03) / 0.05) ** 2) * math.sin(h * 150 + 1.7 * math.sin(3 * hoek))
    sh.kruin = lambda l: z_laars / 0.2  # laarzen zet de rand op 0,2 maal de kruin
    try:
        delen = _laarzen(lijf, rig, M)
    finally:
        sh.kruin = _kruin
    # de hoge omgeslagen kap van de plaat (0,05 van de lengte hoog), bovenaan wijd
    hoogte = 0.05 * H['lengte']
    for k in ('L', 'R'):
        laars = bpy.data.objects['laars.' + k]
        kn = rig.matrix_world @ rig.pose.bones[f'lowerleg01.{k}'].head
        en = rig.matrix_world @ rig.pose.bones[f'lowerleg02.{k}'].tail
        as_ = (en - kn).normalized()
        boven = kn + as_ * (kn.z - z_laars) / as_.dot(Vector((0, 0, -1)))
        kap = sh.koker('laarskap.' + k, sh.bvh_van([(laars, None)]), sh.recht(boven + as_ * 0.003, as_),
                       [hoogte * i / 8 for i in range(9)], lambda t, th: 0.004 + 0.009 * (1 - t / hoogte) ** 1.5,
                       n=96, mat=M['omslag'], ver=0.25)
        sh.dik(kap, 0.005)
        delen.append(kap)
    for k, s in (('L', 1), ('R', -1)):
        laars = bpy.data.objects['laars.' + k]
        # de voet lager, naar de hak toe weer de volle hoogte
        for v in laars.data.vertices:
            f = VOET_LAAG + (1 - VOET_LAAG) * (lambda t: t * t * (3 - 2 * t))(max(0.0, min(1.0, (v.co.z - 0.04) / 0.06)))
            v.co.z *= f
        # een tweede riem met een gesp over de wreef, voor de enkel (de plaat): de lus staand, dwars op de voet en met de
        # bovenkant wat naar voren, zodat hij boven op de wreef ligt (achterover liep hij binnen de schacht naar de hak)
        lb = sh.bvh_van([(laars, None)])
        en = rig.matrix_world @ rig.pose.bones[f'lowerleg02.{k}'].tail
        vt = rig.matrix_world @ rig.pose.bones[f'foot.{k}'].tail
        voor = Vector((vt.x - en.x, vt.y - en.y, 0)).normalized()
        as_ = (voor * math.cos(math.radians(15)) - Vector((0, 0, 1)) * math.sin(math.radians(15))).normalized()
        c = Vector((en.x, en.y, 0.04)) + voor * 0.05
        riem = sh.koker('wreefriem.' + k, lb, sh.recht(c, as_), [0.0, 0.011, 0.022], lambda t, th: 0.002, n=96,
                        mat=M['riem'], ver=0.25)
        sh.dik(riem, 0.004)
        delen.append(riem)
        buiten = Vector((s, 0, 0))
        buiten = (buiten - as_ * as_.dot(buiten)).normalized()
        m = c + as_ * 0.011
        plek = m + buiten * ((sh.straal(lb, m, buiten, 0.25) or 0.05) + 0.004)
        langs = as_.cross(buiten).normalized()
        w, hg, r = 0.022, 0.024, 0.0022
        hoeken = [plek + langs * (sx * w / 2) + as_ * (sy * hg / 2) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
        for i in range(4):
            delen.append(sh.staaf('gesp.wreef.' + k, hoeken[i], hoeken[(i + 1) % 4], r, M['staal']))
    return delen


sh.mens, sh.greep, sh.speer = mens, greep, lambda rig, M, kruin: []
sh.mat_stof, sh.mat_leer, sh.mat_staal = mat_stof, mat_leer, mat_staal
sh.mat_huid, sh.mat_baardvorm, sh.mat_wambuis, sh.mat_wapenrok, sh.mat_laars = (mat_huid, mat_stoppels, mat_wambuis,
                                                                                 mat_wapenrok, mat_laars)
sh.wambuis, sh.wapenrok, sh.kraag, sh.maliekap = wambuis, wapenrok, kraag, haarkap
sh.helm = helm
sh.riem_en_hangers, sh.kappen, sh.laarzen = riem, kappen, laarzen
sh.armstukken = lambda rig, mouwen, M: []  # de plaat heeft geen armstukken: de mouw loopt tot in de kap


# ---------------------------------------------------------------- licht, camera en renderen

# zacht licht van linksvoor en boven, veel licht van rondom, zoals de plaat (weinig schaduw, de kleuren te meten)
LICHT = {'zon': 4.5, 'zonhoek': 20, 'zonrichting': (-0.7, -0.6, 0.55), 'vul': 0.35, 'lucht': 0.5,
         'luchtkleur': (0.78, 0.79, 0.82), 'belichting': 0.15}


def licht(sc):
    zon = bpy.data.objects['zon']
    zon.data.energy = LICHT['zon']
    zon.data.angle = math.radians(LICHT['zonhoek'])
    zon.data.color = (1.0, 0.96, 0.9)
    zon.rotation_euler = Vector(LICHT['zonrichting']).normalized().to_track_quat('Z', 'Y').to_euler()
    bpy.data.objects['vul'].data.energy = LICHT['vul']
    bpy.data.objects['rand'].data.energy = 0.0
    bg = sc.world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = LICHT['luchtkleur'] + (1,)
    bg.inputs['Strength'].default_value = LICHT['lucht']
    sc.view_settings.exposure = LICHT['belichting']
    bpy.context.view_layer.update()


def camera(sc):
    """De camera zo dat de man even hoog is als op de plaat, de zolen even laag."""
    deps = bpy.context.evaluated_depsgraph_get()
    top = 0.0
    for ob in sc.objects:
        if ob.type == 'MESH' and not ob.hide_render:
            e = ob.evaluated_get(deps)
            top = max([top] + [(ob.matrix_world @ Vector(c)).z for c in e.bound_box])
    pxm = PLAAT['hoogte'] / top
    h = sc.render.resolution_y
    cam = sc.camera
    cam.data.ortho_scale = h / pxm
    cam.location = Vector((0, -20, (PLAAT['zolen'] - h / 2) / pxm))
    bpy.context.view_layer.update()  # anders draait render() de oude plek mee
    print('KOPIE lengte', round(top, 3), 'pxm', round(pxm, 1))


def render(sc, r):
    cam = sc.camera
    lichten = [bpy.data.objects[n] for n in ('zon', 'rand', 'vul')]
    m0, ml = cam.matrix_world.copy(), [o.matrix_world.copy() for o in lichten]
    R = Matrix.Rotation(math.radians(RICHTINGEN[r]), 4, 'Z')
    cam.matrix_world = R @ m0
    for o, m in zip(lichten, ml):
        o.matrix_world = R @ m
    sc.render.filepath = os.path.join(sh.UIT, f'kopie-{r}.png')
    bpy.ops.render.render(write_still=True)
    cam.matrix_world = m0
    for o, m in zip(lichten, ml):
        o.matrix_world = m


def gezicht(sc):
    """Na de bouw: het vlak van baardvorm uit beeld (de stoppels zitten in de huid, mat_huid), en de wenkbrauwen als
    twee bogen met een opening ertussen (de vakken van speerman_hd.baard liepen over het hele voorhoofd: een pony)."""
    vorm = bpy.data.objects.get('baardvorm')
    if vorm is not None:
        vorm.hide_render = True
    lijf = bpy.data.objects['lijf']
    rig = next(o for o in sc.objects if o.type == 'ARMATURE')
    groep = lijf.vertex_groups.get('brauw')
    if groep is None:
        return
    for k, s in (('L', 1), ('R', -1)):
        o = rig.matrix_world @ rig.pose.bones[f'eye.{k}'].head
        for v in lijf.data.vertices:
            p = v.co
            if (p.x - o.x) * s < -0.03 or (p.x - o.x) * s > 0.034 or abs(p.z - o.z) > 0.05:
                continue
            u = (p.x - o.x) * s  # van binnen (-) naar buiten (+)
            boog = o.z + 0.016 + 0.005 * math.cos(math.pi * (u - 0.004) / 0.06)
            binnen = -0.02 < u < 0.027 and abs(p.z - boog) < 0.006 - 0.002 * max(0.0, u) / 0.027 and p.y < o.y + 0.006
            if binnen:
                groep.add([v.index], 1.0, 'REPLACE')
            else:
                groep.remove([v.index])
    for md in lijf.modifiers:
        if md.type == 'PARTICLE_SYSTEM' and md.particle_system.vertex_group_density == 'brauw':
            md.particle_system.settings.count = 600  # opnieuw verdeeld over de nieuwe vorm
            md.particle_system.settings.hair_length = 0.005
            md.particle_system.settings.radius_scale = 0.0006  # dunner: met de dikte van de baard lazen ze als blokken


def main():
    os.makedirs(sh.UIT, exist_ok=True)
    sc = sh.bouw()
    gezicht(sc)
    for ob in list(sc.objects):
        if ob.name.startswith('helmpunt'):
            bpy.data.objects.remove(ob, do_unlink=True)
    licht(sc)
    camera(sc)
    if 'blend' in sh.ARGS:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.join(sh.UIT, 'kopie.blend'))
    for a in sh.ARGS[1:]:
        if '=' in a and a.split('=')[0] in RICHTINGEN:
            RICHTINGEN[a.split('=')[0]] = float(a.split('=')[1])
    for r in [a.split('=')[0] for a in sh.ARGS[1:] if a.split('=')[0] in RICHTINGEN] or list(RICHTINGEN):
        render(sc, r)


main()
