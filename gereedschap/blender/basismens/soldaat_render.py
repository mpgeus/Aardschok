# De soldaat, de renders (Marcel, 28 okt, ronde 3). Dezelfde camera als de basismens (orthografisch, de elevatie uit de
# instellingen, 256 pixels per meter), maar een hoger beeld voor de speer (soldaat.camera), en het licht van de vellen
# van het spel (eigen.py: een zon van linksboven, weinig vullicht, een lucht met een verloop, meer contrast; stof mat,
# leer met een zachte glans, staal glanzend), zodat hij naast de speerman uit het spel past. Hij staat in de houding van
# de soldaat (soldaat.py: de idle met de speer), en draait om Z zoals de basismens.
#
# Wat er komt:
# - de acht richtingen, en dezelfde acht met de rode band om zijn rechterbovenarm (links en rechts);
# - de doorsteektoets: elk vlak dat onder een laag erboven hoort (het kenmerk 'bedekt' van soldaat.py) gloeit magenta,
#   de rest is zwart: wat je in een richting van het magenta ziet, steekt erdoor;
# - het lijf: elk vlak van het lijf in een eigen kleur, de rest zwart: welke vlakken van het lijf je ooit ziet;
# - de onderdelen uitgelegd naast elkaar (zoals ze zitten, uit ZW), een grote render uit ZW en close-ups;
# - de man zonder speer in Z (voor de spelmaat: blad.py verkleint tot hij 74 pixels hoog is).
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/basismens/soldaat_render.py
# naar <uit>/soldaat/ en <uit>/soldaat-renders.json.
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import render as R  # noqa: E402
import stand  # noqa: E402
import variant  # noqa: E402

INST, UIT, CAM = R.INST, R.UIT, R.CAM
SO = INST['soldaat']
SC, LI = SO['camera'], SO['licht']
DOEK = (SC['breed'], SC['hoog'], CAM['pixels_per_meter'])
MAP = 'soldaat'
ONDERDELEN = ['lijf'] + variant.KLEREN + ['speer']

# per soort materiaal hoe het licht erop valt, zoals eigen.py (SOORTEN): stof mat met een wollige rand, leer met een zachte
# glans, dof leer, staal glanzend
SOORTEN = {
    'stof': (('tabberd', 'wambuis', 'hozen'), {'Roughness': 1.0, 'Specular IOR Level': 0.12, 'Sheen Weight': 0.55,
                                                'Sheen Roughness': 0.6, 'Diffuse Roughness': 1.0, 'Metallic': 0.0}),
    'leer': (('riem', 'leer', 'koord'), {'Roughness': 0.48, 'Specular IOR Level': 0.45, 'Metallic': 0.0}),
    'laars': (('laars', 'omslag', 'handschoen'), {'Roughness': 0.7, 'Specular IOR Level': 0.2, 'Metallic': 0.0}),
    'staal': (('helm', 'staal'), {'Roughness': None, 'Metallic': 0.9}),
    'blad': (('blad',), {'Roughness': 0.3, 'Metallic': 0.5}),
}


def zonder_hoornvlies(ob):
    """De buitenste schil van de ogen van HumGen (het hoornvlies: doorzichtig en glanzend) weg uit een mesh die naar glTF
    gaat (ronde 10): met dat materiaal liep de export van Blender bij het afsluiten vast. Alleen in de kopie of de
    export; in de bron blijft hij voor de renders (zonder schil lezen de ogen rood)."""
    import bmesh
    if ob.type != 'MESH':
        return
    me = ob.data
    weg = {i for i, m in enumerate(me.materials) if m and 'Eyes_Outer' in m.name}
    if not weg:
        return
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in weg], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(me)
    bm.free()
    for i in sorted(weg, reverse=True):
        me.materials.pop(index=i)


def houding(rig):
    """De houding van de soldaat terug (soldaat.py bewaart haar in het skelet)."""
    stand.rust(rig)
    for naam, m in json.loads(rig['houding_soldaat']).items():
        rig.pose.bones[naam].matrix_basis = Matrix(m)
    bpy.context.view_layer.update()


def materialen_voor_het_spel():
    """De materialen zoals eigen.py ze voor de vellen van het spel maakt: zonder lak en zonder fijne bobbels (het reliëf
    van een textuur blijft), per soort de ruwheid en de glans."""
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        soort = next((s for s, (namen, _) in SOORTEN.items() if m.name.startswith(namen)), None)
        for n in m.node_tree.nodes:
            if n.type != 'BSDF_PRINCIPLED' or soort is None:
                continue
            nt = m.node_tree
            for link in list(n.inputs['Normal'].links):
                if link.from_node.type == 'BUMP' and link.from_node.inputs['Normal'].links:
                    nt.links.new(link.from_node.inputs['Normal'].links[0].from_socket, n.inputs['Normal'])
            # ronde 12: per soort andere waarden uit de instellingen (soldaat.stijlen.C.soorten), zoals een matter staal
            for invoer, waarde in {**SOORTEN[soort][1], **SO['stijlen']['C'].get('soorten', {}).get(soort, {})}.items():
                if waarde is None or invoer not in n.inputs:
                    continue
                for link in list(n.inputs[invoer].links):
                    nt.links.remove(link)
                n.inputs[invoer].default_value = waarde
            n.inputs['Coat Weight'].default_value = 0.0
            if soort == 'stof' and n.inputs['Base Color'].links and 'Sheen Tint' in n.inputs:
                nt.links.new(n.inputs['Base Color'].links[0].from_socket, n.inputs['Sheen Tint'])


def licht(sc, cam):
    """Het licht van de vellen van het spel (eigen.py, LICHT), vast aan de camera: de zon van linksboven en wat van voren,
    vullicht van de camera, en een lucht licht boven en donker onder (de grond), zodat de onderkant van de helmrand donker
    is en de bovenkant licht."""
    for ob in [o for o in sc.objects if o.type == 'LIGHT']:
        bpy.data.objects.remove(ob, do_unlink=True)
    Rm = cam.matrix_world.to_3x3()
    for naam, richting, sterkte, hoek in (('zon', Vector(LI['zon']['richting_scherm']), LI['zon']['sterkte'], LI['zon']['hoek']),
                                          ('vul', Vector((0, 0, 1)), LI['vul'], 30)):
        ld = bpy.data.lights.new(naam, 'SUN')
        ld.energy, ld.angle = sterkte, math.radians(hoek)
        ob = bpy.data.objects.new(naam, ld)
        sc.collection.objects.link(ob)
        ob.rotation_euler = (Rm @ richting.normalized()).to_track_quat('Z', 'Y').to_euler()
    if sc.world is None:
        sc.world = bpy.data.worlds.new('lucht')
    nt = sc.world.node_tree
    bg = nt.nodes['Background']
    if not nt.nodes.get('verloop'):
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
        kl[0].default_value = (0.05, 0.045, 0.04, 1)
        kl[1].default_value = (0.62, 0.68, 0.8, 1)
        nt.links.new([x for x in mix.outputs if x.type == 'RGBA'][0], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = LI['lucht']
    sc.view_settings.view_transform = 'Standard'
    sc.view_settings.exposure = LI['belichting']
    sc.view_settings.look = LI['look']


def vlak_render(sc, pad, mat):
    """Een render met één materiaal voor alles (`mat` gloeit), zonder licht en kleurbeheer, één monster per pixel en
    zonder ruis: elke pixel heeft precies de kleur van één vlak."""
    vs, rd, cy, vl = sc.view_settings, sc.render, sc.cycles, sc.view_layers[0]
    oud = (vs.view_transform, vs.look, vs.exposure, cy.samples, cy.use_denoising, cy.pixel_filter_type, cy.filter_width,
           rd.dither_intensity, vl.material_override)
    vs.view_transform, vs.look, vs.exposure = 'Raw', 'None', 0.0
    cy.samples, cy.use_denoising, cy.pixel_filter_type, cy.filter_width = 1, False, 'BOX', 0.01
    rd.dither_intensity = 0.0
    vl.material_override = mat
    R.render(sc, pad)
    (vs.view_transform, vs.look, vs.exposure, cy.samples, cy.use_denoising, cy.pixel_filter_type, cy.filter_width,
     rd.dither_intensity, vl.material_override) = oud


def gloei_kenmerk(naam, kenmerk, kleur=None):
    """Een materiaal dat een kenmerk van de vlakken laat gloeien: als factor (zwart tot `kleur`) of als kleur."""
    m = bpy.data.materials.new(naam)
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type != 'OUTPUT_MATERIAL':
            nt.nodes.remove(n)
    at = nt.nodes.new('ShaderNodeAttribute')
    at.attribute_name = kenmerk
    em = nt.nodes.new('ShaderNodeEmission')
    if kleur:
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        nt.links.new(at.outputs['Fac'], mix.inputs[0])
        kl = [x for x in mix.inputs if x.type == 'RGBA']
        kl[0].default_value, kl[1].default_value = (0, 0, 0, 1), tuple(kleur) + (1,)
        nt.links.new([x for x in mix.outputs if x.type == 'RGBA'][0], em.inputs['Color'])
    else:
        nt.links.new(at.outputs['Color'], em.inputs['Color'])
    nt.links.new(em.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m


def per_richting(sc, rig, doen):
    uit = {}
    for r in R.RICHTINGEN:
        rig.rotation_euler = (0, 0, math.radians(r['draai']))
        bpy.context.view_layer.update()
        uit[r['naam']] = doen(r['naam'])
    rig.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    return uit


def mat_doorsteek():
    """Wat bedekt hoort te zijn gloeit: magenta op de kleren (een laag die door de laag erboven steekt), cyaan op het lijf
    (huid onder de kleren; wat daarvan over is, zie je soms door een opening, zoals bovenin de kraag)."""
    m = gloei_kenmerk('bedekt', 'bedekt', (1, 1, 1))
    nt = m.node_tree
    em = next(n for n in nt.nodes if n.type == 'EMISSION')
    wit = em.inputs['Color'].links[0].from_socket
    info = nt.nodes.new('ShaderNodeObjectInfo')
    lijf = nt.nodes.new('ShaderNodeMath')
    lijf.operation = 'LESS_THAN'
    nt.links.new(info.outputs['Object Index'], lijf.inputs[0])
    lijf.inputs[1].default_value = 1.5
    kleur = nt.nodes.new('ShaderNodeMix')
    kleur.data_type = 'RGBA'
    nt.links.new(lijf.outputs[0], kleur.inputs[0])
    kl = [x for x in kleur.inputs if x.type == 'RGBA']
    kl[0].default_value, kl[1].default_value = (1, 0, 1, 1), (0, 1, 1, 1)
    keer = nt.nodes.new('ShaderNodeMix')
    keer.data_type, keer.blend_type = 'RGBA', 'MULTIPLY'
    keer.inputs[0].default_value = 1.0
    kl = [x for x in keer.inputs if x.type == 'RGBA']
    nt.links.new(wit, kl[0])
    nt.links.new([x for x in kleur.outputs if x.type == 'RGBA'][0], kl[1])
    nt.links.new([x for x in keer.outputs if x.type == 'RGBA'][0], em.inputs['Color'])
    return m


def doorsteek(sc, rig):
    """Per richting hoeveel pixels van een bedekt vlak je ziet: van de kleren (magenta: een laag steekt door de laag
    erboven) en van het lijf (cyaan), en waar."""
    for o in sc.objects:
        if o.type == 'MESH':
            o.pass_index = 1 if o.name == 'lijf' else 2
    mat = mat_doorsteek()

    def doen(naam):
        pad = os.path.join(UIT, MAP, 'doorsteek', f'richting-{naam}.png')
        vlak_render(sc, pad, mat)
        px = R.lees_png(pad)
        a = px[:, :, 3] > 0.5
        m = (px[:, :, 0] > 0.5) & (px[:, :, 2] > 0.5) & (px[:, :, 1] < 0.2) & a
        c = (px[:, :, 0] < 0.2) & (px[:, :, 1] > 0.5) & (px[:, :, 2] > 0.5) & a
        ys, xs = np.nonzero(m)
        yc, xc = np.nonzero(c)
        return {'pixels': int(m.sum()), 'waar': [int(xs.mean()), int(ys.mean())] if len(xs) else None,
                'lijf_pixels': int(c.sum()), 'lijf_waar': [int(xc.mean()), int(yc.mean())] if len(xc) else None,
                'figuur': int(a.sum())}
    uit = per_richting(sc, rig, doen)
    # de tegenproef: zonder de tabberd moet de gambeson eronder magenta zijn (anders ziet de toets niets)
    tab = bpy.data.objects['tabberd']
    tab.hide_render = True
    uit['tegenproef_zonder_tabberd'] = doen('tegenproef-Z')
    tab.hide_render = False
    return uit


def lijf_zichtbaar(sc, rig):
    """Welke vlakken van het lijf je in de acht richtingen ziet: elk vlak gloeit in een eigen kleur (zijn nummer)."""
    lijf = bpy.data.objects['lijf']
    me = lijf.data
    a = me.attributes.get('id') or me.attributes.new('id', 'FLOAT_COLOR', 'FACE')
    kleuren = []
    for i in range(len(me.polygons)):
        n = i + 1
        kleuren += [(n % 256) / 255, (n // 256 % 256) / 255, 0.0, 1.0]
    a.data.foreach_set('color', kleuren)
    mat = gloei_kenmerk('id', 'id')
    gezien = set()

    def doen(naam):
        pad = os.path.join(UIT, MAP, 'lijf', f'richting-{naam}.png')
        vlak_render(sc, pad, mat)
        px = R.lees_png(pad)
        r = np.rint(px[:, :, 0] * 255).astype(int)
        g = np.rint(px[:, :, 1] * 255).astype(int)
        n = (r + 256 * g)[(px[:, :, 3] > 0.5)]
        nu = set((n[n > 0] - 1).tolist())
        gezien.update(nu)
        return len(nu)
    per = per_richting(sc, rig, doen)
    me.attributes.remove(me.attributes['id'])
    return {'vlakken': len(me.polygons), 'ooit_gezien': len(gezien), 'per_richting': per}


def uitgelegd(sc, rig):
    """De onderdelen naast elkaar uit ZW, elk op zijn eigen hoogte zoals ze zitten; geeft waar elk in beeld staat."""
    U = SC['uitgelegd']
    rig.rotation_euler = (0, 0, math.radians(-45))
    bpy.context.view_layer.update()
    deps = bpy.context.evaluated_depsgraph_get()
    zichtbaar = [o for o in sc.objects if o.type == 'MESH' and not o.hide_render]
    kopieen = []
    n = len(ONDERDELEN)
    for i, naam in enumerate(ONDERDELEN):
        ob = bpy.data.objects[naam]
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps), preserve_all_data_layers=True, depsgraph=deps)
        me.transform(ob.matrix_world)
        k = bpy.data.objects.new('uit-' + naam, me)
        sc.collection.objects.link(k)
        xs = [v.co.x for v in me.vertices]
        k.location.x = (i - (n - 1) / 2) * U['tussen'] - (min(xs) + max(xs)) / 2
        kopieen.append(k)
    for o in zichtbaar:
        o.hide_render = True
    oud = (sc.render.resolution_x, sc.render.resolution_y, sc.camera)
    sc.render.resolution_x, sc.render.resolution_y = U['breed'], SC['hoog']
    cam = R.camera(sc, CAM['elevatie'], 0, 'uitgelegd', (U['breed'] / 2, SC['anker'][1]), (U['breed'], SC['hoog'], CAM['pixels_per_meter']))
    sc.camera = cam
    licht(sc, cam)
    bpy.context.view_layer.update()
    R.render(sc, os.path.join(UIT, MAP, 'uitgelegd.png'))
    plekken = {naam: round(R.pixel(sc, cam, Vector(((i - (n - 1) / 2) * U['tussen'], 0, 0)))[0], 1) for i, naam in enumerate(ONDERDELEN)}
    for k in kopieen:
        bpy.data.objects.remove(k, do_unlink=True)
    for o in zichtbaar:
        o.hide_render = False
    sc.render.resolution_x, sc.render.resolution_y, sc.camera = oud
    rig.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    return plekken


def dichtbij(rig, vuist):
    """Waar de close-ups kijken (punt, van welke kant, hoe hoog in meters), uit het model in de houding: het hoofd met de
    helm (schuin), het gezicht (recht van voren, onder de rand), de romp bij de riem, de vuist en de laarzen."""
    pb = rig.pose.bones['head']
    wereld = lambda p: rig.matrix_world @ pb.matrix @ pb.bone.matrix_local.inverted() @ Vector(p)
    gz = json.loads(rig['gezicht'])
    oog = (wereld(gz['eye.L']) + wereld(gz['eye.R'])) / 2
    deps = bpy.context.evaluated_depsgraph_get()
    riem = bpy.data.objects['riem'].evaluated_get(deps)
    zr = sum((riem.matrix_world @ x.co).z for x in riem.data.vertices) / len(riem.data.vertices)
    return (('hoofd', oog + Vector((0, 0, 0.04)), 30, 0.42), ('gezicht', oog - Vector((0, 0, 0.03)), 0, 0.27),
            ('romp', Vector((-0.04, -0.1, zr + 0.05)), -30, 0.62), ('vuist', Vector(vuist), -40, 0.36),
            ('laarzen', Vector((0, -0.05, 0.19)), 25, 0.6))


def groot(sc, rig, vuist):
    """Een grote render uit ZW (de stof, het leer, het staal) en close-ups van het hoofd, het gezicht, de romp, de vuist en
    de laarzen."""
    D = SC['detail']
    oud = (sc.render.resolution_x, sc.render.resolution_y, sc.camera, sc.cycles.samples)
    sc.cycles.samples = D['monsters']
    rig.rotation_euler = (0, 0, math.radians(D['draai']))
    bpy.context.view_layer.update()
    sc.render.resolution_x, sc.render.resolution_y = D['breed'], D['hoog']
    cam = R.camera(sc, CAM['elevatie'], 0, 'groot', D['anker'], (D['breed'], D['hoog'], D['pixels_per_meter']))
    sc.camera = cam
    licht(sc, cam)
    R.render(sc, os.path.join(UIT, MAP, 'groot.png'))
    rig.rotation_euler = (0, 0, 0)
    bpy.context.view_layer.update()
    sc.render.resolution_x = sc.render.resolution_y = 512
    for naam, punt, draai, schaal in dichtbij(rig, vuist):
        c = R.camera_op(sc, punt, draai, schaal, 'dichtbij-' + naam)
        sc.camera = c
        licht(sc, c)
        R.render(sc, os.path.join(UIT, MAP, f'dichtbij-{naam}.png'))
    sc.render.resolution_x, sc.render.resolution_y, sc.camera, sc.cycles.samples = oud


def main():
    sc = R.scene()
    sc.render.resolution_x, sc.render.resolution_y = SC['breed'], SC['hoog']
    rig = bpy.data.objects['skelet']
    rig.data.pose_position = 'POSE'
    rig.rotation_euler = (0, 0, 0)
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    if 'lijf-bron' in bpy.data.objects:
        bpy.data.objects['lijf-bron'].hide_render = True
    houding(rig)
    materialen_voor_het_spel()
    cam = R.camera(sc, CAM['elevatie'], 0, 'camera', SC['anker'], DOEK)
    sc.camera = cam
    licht(sc, cam)
    bpy.context.view_layer.update()
    feiten = json.load(open(os.path.join(UIT, 'soldaat.json'), encoding='utf-8'))
    verslag = {'camera': {'elevatie': CAM['elevatie'], 'type': cam.data.type, 'ortho_schaal': cam.data.ortho_scale,
                          'breed': SC['breed'], 'hoog': SC['hoog'], 'anker': list(R.pixel(sc, cam, Vector((0, 0, 0))))}}
    verslag['richtingen'] = R.richtingen(sc, cam, rig, os.path.join(MAP, 'renders'), os.path.join(MAP, 'controle'), SC['band'])
    verslag['doorsteek'] = doorsteek(sc, rig)
    verslag['lijf_zichtbaar'] = lijf_zichtbaar(sc, rig)
    # de man zonder speer in Z: zijn hoogte in beeld, voor de spelmaat
    speer = bpy.data.objects['speer']
    speer.hide_render = True
    monsters = sc.cycles.samples
    sc.cycles.samples = 8
    R.render(sc, os.path.join(UIT, MAP, 'zonder-speer-Z.png'))
    sc.cycles.samples = monsters
    speer.hide_render = False
    verslag['zonder_speer_Z'] = R.vak(os.path.join(UIT, MAP, 'zonder-speer-Z.png'))
    verslag['uitgelegd'] = uitgelegd(sc, rig)
    groot(sc, rig, feiten['speer']['vuist'])
    json.dump(verslag, open(os.path.join(UIT, 'soldaat-renders.json'), 'w', encoding='utf-8'), indent=1)
    print('SOLDAAT-RENDER', json.dumps({'doorsteek': {k: v['pixels'] for k, v in verslag['doorsteek'].items()},
                                        'speer_aan': bpy.data.objects['speer'].parent.name,
                                        'lijf': {k: v for k, v in verslag['lijf_zichtbaar'].items() if k != 'per_richting'},
                                        'zonder_speer_Z': verslag['zonder_speer_Z'],
                                        'kijkt': {r['naam']: r['kijkt_scherm'] for r in verslag['richtingen']}}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
