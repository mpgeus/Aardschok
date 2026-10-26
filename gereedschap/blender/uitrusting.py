# De aankleding naar Marcels plaat (vraag 190; Marcel, 26 okt: "ik wil dat wij onze aankleding op basis van dit plaatje
# maken", "jij moet hier 3d varianten van maken, zodat we deze op ons soldaatje kunnen plakken"; de plaat:
# EXTRA/Middeleeuwse krijgeruitrusting spritesheet.png; beeld.md, "Voorstel: de aankleding naar Marcels platen, als losse
# 3D-delen"): elk onderdeel een eigen deel op het lijf: de ketelhoed, de maliënkraag, de wapenrok, de mouwen, de
# handschoenen, de broek, de laarzen en de riem.
#
# Zoals de bouwers van speerman_hd.py: een lijf in de wereld (met de armgroepen van MPFB), een skelet met de botten van
# MPFB (hg_soldaat.Nep geeft die voor Human Generator) en de materialen in M (materialen()). De kleuren zijn op de plaat
# gemeten (beeld.md).
import math

import bpy
from mathutils import Vector

import speerman_hd as sh
from speerman_hd import Knopen, lin

# de kleuren van de plaat (beeld.md): het geel en blauw van de wapenrok, het bruine leer van de mouwen, de grijsbeige wol
GEEL, GEEL_DONKER = '#f2b02c', '#ce8514'
BLAUW, BLAUW_DONKER = '#4a6478', '#1e2e39'
KOPER = '#c89a40'  # de klinknagels en de gespen
NAGEL = 0.032  # zoveel meter tussen de klinknagels
KRAAG = (0.05, 0.02, 0.02)  # de maliënkraag: zo ver onder het midden van de nek (opzij, en voor extra) en zo ver uitwaaierend
BANEN = 6  # de rok in zoveel paren banen rond, geel en blauw om en om


def streep(k, v, breed=0.06):
    """1 vlak bij de gehele waarden van v (een lijn om de 1), 0 ertussen."""
    return k.glad(k.w('ABSOLUTE', k.w('SUBTRACT', k.w('FRACT', v), 0.5)), 0.5 - breed, 0.5)


def mat_kwartier(z_borst, z_riem, cy):
    """De wapenrok: gevierendeeld op borst en rug (boven de borstnaad zijn rechterhelft geel en zijn linker blauw, eronder
    andersom), de rok onder de riem in banen rond, geel en blauw om en om, met de naad (en de split) recht voor; koperen
    klinknagels langs de naden. Heet 'wapenrok', zodat eigen.py hem als stof behandelt."""
    k = Knopen('wapenrok')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    rechts = k.glad(x, 0.003, -0.003)  # 1 op zijn rechterhelft (-x)
    boven = k.glad(z, z_borst - 0.004, z_borst + 0.004)
    onder_riem = k.glad(z, z_riem + 0.004, z_riem - 0.004)
    kwartier = k.w('SUBTRACT', 1.0, k.w('ABSOLUTE', k.w('SUBTRACT', rechts, boven)))
    hoek = k.w('ARCTAN2', x, k.w('SUBTRACT', cy, y))  # 0 recht voor, negatief aan zijn rechterkant
    baan_sin = k.w('SINE', k.w('MULTIPLY', hoek, BANEN))
    baan = k.glad(baan_sin, 0.04, -0.04)  # geel waar de sinus negatief is: de eerste baan rechts van de split
    f = k.w('ADD', k.w('MULTIPLY', onder_riem, baan), k.w('MULTIPLY', k.w('SUBTRACT', 1.0, onder_riem), kwartier))
    kl = k.meng(f, lin(BLAUW), lin(GEEL))
    v = k.ruis(9, 3)
    kl = k.meng(k.glad(v, 0.3, 0.7, 0, 0.35), kl, k.meng(f, lin(BLAUW_DONKER), lin(GEEL_DONKER)))
    # de naden: de middennaad en de borstnaad boven de riem, de banen eronder; daarlangs om de NAGEL een klinknagel
    midden = k.glad(k.w('ABSOLUTE', x), 0.006, 0.002)
    borst = k.glad(k.w('ABSOLUTE', k.w('SUBTRACT', z, z_borst)), 0.006, 0.002)
    naad_rok = k.glad(k.w('ABSOLUTE', baan_sin), 0.12, 0.04)
    langs_z = streep(k, k.w('DIVIDE', z, NAGEL), 0.12)
    langs_rond = streep(k, k.w('DIVIDE', k.w('MULTIPLY', hoek, 0.2), NAGEL), 0.12)
    boven_riem = k.w('SUBTRACT', 1.0, onder_riem)
    nagels = k.w('MAXIMUM', k.w('MULTIPLY', k.w('MULTIPLY', midden, langs_z), boven_riem),
                 k.w('MAXIMUM', k.w('MULTIPLY', borst, langs_rond), k.w('MULTIPLY', k.w('MULTIPLY', naad_rok, langs_z), onder_riem)))
    naden = k.w('MAXIMUM', k.w('MULTIPLY', k.w('MAXIMUM', midden, borst), boven_riem), k.w('MULTIPLY', naad_rok, onder_riem))
    kl = k.meng(k.w('MULTIPLY', naden, 0.5), kl, lin('#2a1c10'))
    kl = k.meng(nagels, kl, lin(KOPER))
    kl = k.met_textuur(kl, 'rough_linen', 0.7, contrast=1.0, kracht=1.2)
    k.bobbel(k.w('ADD', k.w('MULTIPLY', nagels, 1.0), k.w('MULTIPLY', naden, -0.6)), 0.8, 0.003)
    k.bsdf.inputs['Sheen Weight'].default_value = 0.3
    # de stof gloeit wat na, zodat het geel in de schaduw niet modderig wordt (zoals de wapenrok van de speerman)
    k.zet(k.bsdf.inputs['Emission Color'], k.meng(f, lin('#28384a'), lin('#ffaa14')))
    k.bsdf.inputs['Emission Strength'].default_value = sh.GEEL_GLOED
    return k.af(kl, ruw=0.9, holte=0.65)


def mat_gewatteerd():
    """De mouwen: gewatteerd bruin leer, in de lengte doorgestikt (lijnen in x en in y lopen langs een hangende arm) en om
    de 6,5 cm in banen, met stiksels en licht op de bolle kussens (met donkere, dichte stiksels las het als een net)."""
    k = Knopen('mouw')
    sep = k.n('ShaderNodeSeparateXYZ')
    k.zet(sep.inputs[0], k.plek())
    x, y, z = sep.outputs['X'], sep.outputs['Y'], sep.outputs['Z']
    kanaal = k.w('MAXIMUM', streep(k, k.w('DIVIDE', x, 0.045), 0.04), streep(k, k.w('DIVIDE', y, 0.045), 0.04))
    naad = k.w('MAXIMUM', kanaal, streep(k, k.w('DIVIDE', z, 0.065), 0.04))
    kl = k.meng(k.glad(k.ruis(14, 4), 0.3, 0.75, 0, 0.4), lin('#8a4a20'), lin('#4a2010'))
    kl = k.meng(k.w('MULTIPLY', k.w('SUBTRACT', 1.0, naad), 0.35), kl, lin('#bd7940'))
    kl = k.meng(k.w('MULTIPLY', naad, 0.6), kl, lin('#2a1006'))
    kl = k.met_textuur(kl, 'brown_leather', 0.5, contrast=0.6, kracht=0.8)
    k.bobbel(k.w('SUBTRACT', 1.0, naad), 1.6, 0.006)
    return k.af(kl, ruw=0.6, holte=0.6)


def materialen():
    """De materialen van de aankleding, met de namen die de bouwers van speerman_hd.py vragen."""
    return {
        'helm': sh.mat_staal('helm', '#8c8476', 0.34),  # donker staal met wat bruin, zoals op de plaat
        'staal': sh.mat_staal('staal', '#a3a8b0', 0.28),
        'koper': sh.mat_staal('koper', KOPER, 0.3),
        'malien': sh.mat_malien(),
        'leer-donker': sh.mat_leer('leer-donker', '#3a2414', '#1a0e08'),
        'wapenrok-goud': sh.mat_leer('armsgat', '#3a2414', '#1a0e08'),  # de armsgaten met een donkere rand
        'mouw': mat_gewatteerd(),
        'manchet': sh.mat_leer('manchet', '#5a2810', '#2a1006'),
        'handschoen': sh.mat_leer('handschoen', '#8a4a20', '#3a1a0c'),
        'broek': sh.mat_stof('broek', '#a2967a', 30, 0.3, textuur=('hessian_230', 0.5)),
        'laars': sh.mat_leer('laars', '#94501f', '#3a1a0c'),
        'riem': sh.mat_leer('riem', '#7a3a16', '#37140d'),
        'hout': sh.mat_hout(),
        'blad': sh.mat_blad(),
    }


# ---------------------------------------------------------------- de delen

def bolletje(naam, plek, r, mat, delen):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=r, location=plek)
    o = bpy.context.active_object
    o.name = naam
    sh.zacht(o)
    o.data.materials.append(mat)
    delen.append(o)
    return o


def ketelhoed(lijf, rig, M):
    """De ketelhoed van de plaat: een koepel van vier delen (een kruis van ribben met klinknagels, een nagel bovenop),
    onderaan een band met nagels, een brede, vlakke rand met een opgerolde zoom, en een leren kinriem."""
    import bmesh
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    kop = W('head')
    hoofd = [v.co for v in lijf.data.vertices if v.co.z > kop.z + 0.01]
    xs, ys, zs = [p.x for p in hoofd], [p.y for p in hoofd], [p.z for p in hoofd]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2 + sh.HELM_ACHTER
    rx, ry, top = (max(xs) - min(xs)) / 2 + 0.02, (max(ys) - min(ys)) / 2 + 0.018, max(zs)
    zb = W('eye.L').z + sh.HELM_RAND_HOOGTE * sh.INSTELLINGEN['hoofd']
    hoog = max(top - zb + 0.012, rx * 0.95)
    delen = []
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=1, location=(cx, cy, zb))
    koepel = bpy.context.active_object
    koepel.scale = (rx, ry, hoog)
    bm = bmesh.new()
    bm.from_mesh(koepel.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.01], context='VERTS')
    bm.to_mesh(koepel.data)
    bm.free()
    sh.zacht(koepel)
    koepel.name = 'helm-koepel'
    koepel.data.materials.append(M['helm'])
    delen.append(sh.bak_mod(koepel))
    op = lambda a, f: Vector((cx + rx * math.sin(f) * math.cos(a), cy + ry * math.sin(f) * math.sin(a), zb + hoog * math.cos(f)))
    # het kruis van ribben, met klinknagels erlangs
    for a in (0.0, math.pi / 2):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=(cx, cy, zb))
        rib = bpy.context.active_object
        rib.scale = (0.012, ry + 0.005, hoog + 0.005) if a == 0.0 else (rx + 0.005, 0.012, hoog + 0.005)
        bm = bmesh.new()
        bm.from_mesh(rib.data)
        bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < 0.0], context='VERTS')
        bm.to_mesh(rib.data)
        bm.free()
        sh.zacht(rib)
        rib.name = 'helmrib'
        rib.data.materials.append(M['helm'])
        delen.append(sh.bak_mod(rib))
        for kant in (a + math.pi / 2, a - math.pi / 2):  # de rib van a = 0 loopt van voor naar achter (langs y)
            for f in (0.35, 0.65, 0.95, 1.25):
                p = op(kant, f)
                bolletje('nagel', p + (p - Vector((cx, cy, zb))).normalized() * 0.006, 0.0045, M['koper'], delen)
    bolletje('nagel', Vector((cx, cy, zb + hoog + 0.006)), 0.009, M['koper'], delen)
    # de band onderaan de koepel, met nagels rond
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1, depth=0.024, location=(cx, cy, zb + 0.012))
    band = bpy.context.active_object
    band.scale = (rx + 0.004, ry + 0.004, 1)
    sh.zacht(band)
    band.name = 'helm-band'
    band.data.materials.append(M['helm'])
    delen.append(band)
    for i in range(16):
        a = 2 * math.pi * (i + 0.5) / 16
        bolletje('nagel', Vector((cx + (rx + 0.008) * math.cos(a), cy + (ry + 0.008) * math.sin(a), zb + 0.012)), 0.004,
                 M['koper'], delen)
    # de rand: breed en vlak, naar buiten wat omlaag, met een opgerolde zoom
    n, ringen = 96, ((1.0, 0.0), (1.2, -0.006), (1.4, -0.016), (1.55, -0.026))
    vs, fs = [], []
    for f, dz in ringen:
        for j in range(n):
            a = 2 * math.pi * j / n
            vs.append((cx + rx * f * math.cos(a), cy + ry * f * math.sin(a), zb + dz))
    for i in range(len(ringen) - 1):
        for j in range(n):
            fs.append((i * n + j, i * n + (j + 1) % n, (i + 1) * n + (j + 1) % n, (i + 1) * n + j))
    rand = sh.maak('helm-rand', vs, fs, mat=M['helm'])
    sh.dik(rand, 0.005)
    delen.append(sh.bak_mod(rand))
    bpy.ops.mesh.primitive_torus_add(major_radius=1, minor_radius=0.005, major_segments=96, minor_segments=10,
                                     location=(cx, cy, zb - 0.026))
    zoom = bpy.context.active_object
    zoom.scale = (rx * 1.55, ry * 1.55, 1)
    zoom.name = 'helm-zoom'
    sh.zacht(zoom)
    zoom.data.materials.append(M['helm'])
    delen.append(zoom)
    # de kinriem: van de rand opzij onder de kin door
    kin = W('special04')
    kromme = bpy.data.curves.new('kinriem', 'CURVE')
    kromme.dimensions, kromme.bevel_depth, kromme.bevel_resolution = '3D', 0.005, 1
    sp = kromme.splines.new('BEZIER')
    punten = [Vector((cx - rx * 0.95, cy + 0.01, zb)), Vector((cx - rx * 0.6, kin.y + 0.02, kin.z - 0.012)),
              Vector((cx, kin.y + 0.005, kin.z - 0.018)), Vector((cx + rx * 0.6, kin.y + 0.02, kin.z - 0.012)),
              Vector((cx + rx * 0.95, cy + 0.01, zb))]
    sp.bezier_points.add(len(punten) - 1)
    for bp, p in zip(sp.bezier_points, punten):
        bp.co = p
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    riem = bpy.data.objects.new('kinriem', kromme)
    bpy.context.scene.collection.objects.link(riem)
    kromme.materials.append(M['leer-donker'])
    delen.append(riem)
    for o in delen:
        o.visible_shadow = False  # het gezicht blijft leesbaar, zoals bij de helm van de speerman
    return delen


def maliekraag(lijf, rig, mouwen, lijfje, M):
    """De staande maliënkraag van de plaat: van onder de kin en de nek tot net over de schouders, die daar wat
    uitwaaiert (korter dan de kraag van de speerman, speerman_hd.kraag, die als een cape de borst bedekte en zo de
    bovenste vierendelen van de wapenrok), met bovenaan een leren rand."""
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    arm = sh.gewicht(lijf, ('upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'))
    bvh = sh.bvh_van([(lijf, [a < 0.2 for a in arm]), (lijfje, None)])
    nek, kin, hoofd = W('neck02'), W('special04'), W('head')

    def z(t, th):
        voor = max(0.0, math.cos(th)) ** 1.5  # 1 recht voor, 0 opzij en achter
        boven = (hoofd.z + 0.02) - voor * (hoofd.z + 0.02 - (kin.z - 0.01))
        onder = nek.z - KRAAG[0] - KRAAG[1] * voor
        return boven - t * (boven - onder)
    kraag = sh.koker('kraag', bvh, sh.staand(0, nek.y + 0.015, z), [i / 22 for i in range(23)],
                     lambda t, th: 0.01 + KRAAG[2] * math.sin(math.pi * min(1.0, t * 1.1)) ** 0.6, n=128, mat=M['malien'])
    sh.dik(kraag, 0.006)
    n = 129  # de punten van een ring van de kraag (koker met n=128); de eerste ring is de bovenrand
    ring = [kraag.matrix_world @ kraag.data.vertices[i].co for i in range(n - 1)]
    midden = sum(ring, Vector()) / len(ring)
    kromme = bpy.data.curves.new('kraagrand', 'CURVE')
    kromme.dimensions, kromme.bevel_depth, kromme.bevel_resolution = '3D', 0.007, 2
    sp = kromme.splines.new('POLY')
    sp.points.add(len(ring) - 1)
    for pt, p in zip(sp.points, ring):
        q = p + (p - midden).normalized() * 0.004
        pt.co = (q.x, q.y, q.z, 1.0)
    sp.use_cyclic_u = True
    rand = bpy.data.objects.new('kraagrand', kromme)
    bpy.context.scene.collection.objects.link(rand)
    kromme.materials.append(M['leer-donker'])
    return [kraag, rand]


def mouwranden(mouwen, rig, M):
    """Een maliënrand om de bovenarm bij de schouder en een leren manchet om de pols, op de mouwen."""
    delen = []
    W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
    for k in ('L', 'R'):
        for naam, van, naar, t0, t1, mat, uit in (('maliemouw', f'upperarm01.{k}', f'lowerarm01.{k}', 0.05, 0.3, M['malien'], 0.006),
                                                  ('manchet', f'lowerarm01.{k}', f'wrist.{k}', 0.82, 1.0, M['manchet'], 0.004)):
            a, b = W(van), W(naar)
            as_ = (b - a).normalized()
            L = (b - a).length
            dichtbij = [(((v.co - a) - as_ * (v.co - a).dot(as_)).length < 0.12 and t0 - 0.1 < (v.co - a).dot(as_) / L < t1 + 0.1)
                        for v in mouwen.data.vertices]
            bvh = sh.bvh_van([(mouwen, dichtbij)])
            p = lambda t, th, a=a, as_=as_, L=L, t0=t0, t1=t1: (a + as_ * L * (t0 + (t1 - t0) * t), as_)
            o = sh.koker(f'{naam}.{k}', bvh, p, [i / 6 for i in range(7)], lambda t, th, uit=uit: uit, n=64, mat=mat, ver=0.2)
            sh.dik(o, 0.004)
            delen.append(o)
    return delen


def handschoenen(lijf, M):
    """Leren handschoenen: de handen van het lijf, wat naar buiten gezet."""
    hand = sh.gewicht(lijf, ('wrist', 'finger', 'metacarpal'))
    return sh.uit_huid('handschoenen', lijf, [h > 0.5 for h in hand], 0.005, M['handschoen'], sub=1)


def riem(bvh, cy, z_riem, M):
    """De riem van de plaat: bruin leer met een koperen gesp, voor twee afhangende riemeinden met een koperen punt, en opzij
    aan zijn rechterheup een tasje met een klep."""
    delen = []
    band = sh.koker('riem', bvh, sh.staand(0, cy, lambda t, th: z_riem + 0.025 - t * 0.05), [0, 0.5, 1], lambda t, th: 0.012,
                    n=128, mat=M['riem'])
    sh.dik(band, 0.006)
    delen.append(band)

    def blok(naam, plek, maat, mat, draai=0.0, kantel=0.0):
        bpy.ops.mesh.primitive_cube_add(size=1, location=plek, rotation=(kantel, 0, draai), scale=maat)
        o = bpy.context.active_object
        o.name = naam
        b = o.modifiers.new('rand', 'BEVEL')
        b.width = min(maat) * 0.3
        b.segments = 2
        o.data.materials.append(mat)
        delen.append(sh.bak_mod(o))
        return o

    voor = lambda x: (sh.straal(bvh, Vector((x, cy, z_riem)), Vector((0, -1, 0))) or 0.15) + 0.018
    blok('gesp', (0, cy - voor(0), z_riem), (0.06, 0.01, 0.05), M['koper'])
    blok('gesp-gat', (0, cy - voor(0) - 0.004, z_riem), (0.036, 0.008, 0.03), M['riem'])
    for x in (-0.075, 0.075):
        y = cy - voor(x) + 0.004
        blok('riemeind', (x, y, z_riem - 0.1), (0.024, 0.006, 0.17), M['riem'], kantel=math.radians(-4))
        blok('riempunt', (x, y - 0.002, z_riem - 0.19), (0.026, 0.008, 0.02), M['koper'])
    # het tasje aan zijn rechterheup (-x), wat naar voren
    d = Vector((-0.9, -0.35, 0)).normalized()
    r = (sh.straal(bvh, Vector((0, cy, z_riem - 0.05)), d) or 0.17) + 0.035
    c = Vector((0, cy, 0)) + d * r
    draai = math.atan2(d.y, d.x) + math.pi / 2
    blok('tas', (c.x, c.y, z_riem - 0.07), (0.08, 0.04, 0.085), M['riem'], draai)
    blok('tasklep', (c.x + d.x * 0.021, c.y + d.y * 0.021, z_riem - 0.045), (0.082, 0.008, 0.05), M['leer-donker'], draai)
    bolletje('tasknoop', Vector((c.x + d.x * 0.027, c.y + d.y * 0.027, z_riem - 0.065)), 0.005, M['koper'], delen)
    return delen
