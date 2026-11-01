# De basismens, stap 1 (Marcel, 28 okt: een 3D-pijplijn voor figuren, te beginnen met één man). Het lijf uit MPFB
# (MakeHuman voor Blender; het basismesh, de doelen, de skeletten en hun gewichten zijn CC0, vrijgegeven in september
# 2020 door Data Collection AB; de code van MPFB is GPL-3, maar die komt niet in wat we maken): een man van precies 1,75 m
# in de rusthouding van MakeHuman (een A-houding), stevig, met wat grotere handen en voeten. Het skelet is 'default' van
# MPFB, het skelet van de speerman (speerman_hd.py, bakken.py), zonder de botten van het gezicht en de borst: hun gewicht
# gaat naar het hoofd en de borstkas.
#
# Twee meshes van hetzelfde lijf: 'lijf-bron' met de lussen van MakeHuman (26.756 driehoeken, voor wie verder verfijnt),
# en 'lijf' voor het spel, symmetrisch versimpeld tot onder het budget (instellingen.json), met de gewichten mee. Daarbij
# een losse onderbroek, en één textuur met de huid, de lippen, de nagels, kort haar en de ogen, gebakken uit de verf.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b -P gereedschap/blender/basismens/bouw.py
# (zonder --factory-startup: dan laadt Blender MPFB niet) naar <uit>/bron/basismens.blend en <uit>/bouw.json.
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.locationservice import LocationService
from bl_ext.user_default.mpfb.services.targetservice import TargetService

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import stand  # noqa: E402

from variant import INST, UIT, WORTEL  # noqa: E402  (de instellingen en de map van de variant)
LIJF = INST['lijf']


def lin(h):
    h = h.lstrip('#')
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c) + (1.0,)


def maak_mens(schaal):
    """Een man uit MPFB met de macro's en doelen uit de instellingen; geeft (lijf, skelet)."""
    macro = TargetService.get_default_macro_info_dict()
    macro.update(LIJF['macro'])
    macro['race'] = {'caucasian': 1.0, 'asian': 0.0, 'african': 0.0}
    lijf = HumanService.create_human(macro_detail_dict=macro, scale=schaal)
    doelen = LocationService.get_mpfb_data('targets')
    for naam, w in LIJF['doelen'].items():
        TargetService.load_target(lijf, os.path.join(doelen, naam + '.target.gz'), weight=w)
    rig = HumanService.add_builtin_rig(lijf, INST['skelet']['basis'])
    bpy.context.view_layer.update()
    return lijf, rig


def punten(ob):
    """De punten van een object zoals het eruitziet (modifiers, doelen), in de wereld."""
    deps = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(deps)
    me = e.to_mesh()
    uit = [ob.matrix_world @ v.co for v in me.vertices]
    e.to_mesh_clear()
    return uit


def leeg():
    for ob in list(bpy.data.objects):
        bpy.data.objects.remove(ob, do_unlink=True)
    for me in list(bpy.data.meshes):
        bpy.data.meshes.remove(me)
    for a in list(bpy.data.armatures):
        bpy.data.armatures.remove(a)


def bak(ob, naam):
    """Het lijf zoals het eruitziet (de doelen, zonder de hulpvormen) als eigen mesh in meters, met de groepen en de uv."""
    deps = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps), preserve_all_data_layers=True, depsgraph=deps)
    me.transform(ob.matrix_world)
    nieuw = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(nieuw)
    for g in ob.vertex_groups:
        if g.name not in nieuw.vertex_groups:
            nieuw.vertex_groups.new(name=g.name)
    return nieuw


def groep_gewicht(ob, namen):
    """Per punt het grootste gewicht van de groepen met een van deze namen (of voorvoegsels)."""
    idx = {g.index for g in ob.vertex_groups if g.name in namen or g.name.startswith(tuple(namen))}
    return [max([g.weight for g in v.groups if g.group in idx] or [0.0]) for v in ob.data.vertices]


def skelet_opruimen(rig, lijven):
    """De botten van het gezicht en de borst weg; hun gewicht bij het bot dat ze opvangt (instellingen: skelet.weg)."""
    weg = {}
    for doel, voorvoegsels in INST['skelet']['weg'].items():
        if doel.startswith('_'):
            continue
        for b in rig.data.bones:
            if b.name.startswith(tuple(voorvoegsels)):
                weg[b.name] = doel
    for ob in lijven:
        for naam, doel in weg.items():
            g, d = ob.vertex_groups.get(naam), ob.vertex_groups.get(doel)
            if g is None:
                continue
            for v in ob.data.vertices:
                w = next((x.weight for x in v.groups if x.group == g.index), 0.0)
                if w > 0:
                    oud = next((x.weight for x in v.groups if x.group == d.index), 0.0)
                    d.add([v.index], min(1.0, oud + w), 'REPLACE')
            ob.vertex_groups.remove(g)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    for naam in weg:
        eb = rig.data.edit_bones.get(naam)
        if eb is not None:
            rig.data.edit_bones.remove(eb)
    bpy.ops.object.mode_set(mode='OBJECT')
    return sorted(weg)


def driehoeken(ob):
    return sum(len(p.vertices) - 2 for p in ob.data.polygons)


def kopie(ob, naam):
    nieuw = ob.copy()
    nieuw.data = ob.data.copy()
    nieuw.name = naam
    bpy.context.scene.collection.objects.link(nieuw)
    return nieuw


def versimpel(bron, budget):
    """Het spelmodel: symmetrisch versimpeld (collapse, om X) tot onder het budget; de gewichten en de uv gaan mee."""
    verhouding = budget * 0.985 / driehoeken(bron)
    for _ in range(6):
        ob = kopie(bron, 'lijf')
        for m in list(ob.modifiers):
            ob.modifiers.remove(m)
        d = ob.modifiers.new('versimpel', 'DECIMATE')
        d.decimate_type = 'COLLAPSE'
        d.ratio = verhouding
        d.use_symmetry = True
        d.symmetry_axis = 'X'
        d.use_collapse_triangulate = True
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.modifier_apply(modifier='versimpel')
        n = driehoeken(ob)
        if n <= budget:
            return ob, verhouding
        bpy.data.objects.remove(ob, do_unlink=True)
        verhouding *= budget * 0.985 / n
    raise RuntimeError('het budget is niet te halen')


def skelet_eraan(ob, rig):
    for m in list(ob.modifiers):
        ob.modifiers.remove(m)
    m = ob.modifiers.new('skelet', 'ARMATURE')
    m.object = rig
    ob.parent = rig
    ob.matrix_parent_inverse = rig.matrix_world.inverted()


# ---------------------------------------------------------------- de verf

def knopen_materiaal(naam, kleur, ruis=0.0):
    """Een materiaal met een egale kleur, desgewenst met wat ruis erin (voor de huid), om te bakken."""
    m = bpy.data.materials.new(naam)
    nt = m.node_tree
    bsdf = nt.nodes['Principled BSDF']
    if ruis:
        t = nt.nodes.new('ShaderNodeTexNoise')
        t.inputs['Scale'].default_value = 40
        mix = nt.nodes.new('ShaderNodeMix')
        mix.data_type = 'RGBA'
        mix.inputs[0].default_value = ruis
        rgba = [s for s in mix.inputs if s.type == 'RGBA']
        rgba[0].default_value = lin(kleur)
        rgba[1].default_value = tuple(c * 0.82 for c in lin(kleur)[:3]) + (1.0,)
        ramp = nt.nodes.new('ShaderNodeMapRange')
        nt.links.new(t.outputs['Fac'], ramp.inputs['Value'])
        ramp.inputs['From Min'].default_value, ramp.inputs['From Max'].default_value = 0.35, 0.65
        f = nt.nodes.new('ShaderNodeMath')
        f.operation = 'MULTIPLY'
        nt.links.new(ramp.outputs['Result'], f.inputs[0])
        f.inputs[1].default_value = ruis
        nt.links.new(f.outputs[0], mix.inputs[0])
        nt.links.new([s for s in mix.outputs if s.type == 'RGBA'][0], bsdf.inputs['Base Color'])
    else:
        bsdf.inputs['Base Color'].default_value = lin(kleur)
    bsdf.inputs['Roughness'].default_value = 0.6
    return m


def verf(lijf, ogen, beeld):
    """De delen van het lijf in hun kleur (de groepen van MakeHuman voor lippen, nagels en hoofdhuid; de ogen rond de
    plek van de oogbotten), gebakken in één textuur op de uv van het spelmodel; daarna één materiaal met die textuur."""
    k = LIJF['kleuren']
    mats = {n: knopen_materiaal(n, k[n], ruis=0.35 if n == 'huid' else 0.0) for n in ('huid', 'lippen', 'nagels', 'haar', 'oogwit', 'iris')}
    me = lijf.data
    me.materials.clear()
    volgorde = list(mats)
    for n in volgorde:
        me.materials.append(mats[n])
    lip = groep_gewicht(lijf, ['lips'])
    nagel = groep_gewicht(lijf, ['fingernails', 'toenails'])
    hoofdhuid = groep_gewicht(lijf, ['scalp'])
    for p in me.polygons:
        vs = p.vertices
        gem = lambda w: sum(w[i] for i in vs) / len(vs)
        c = p.center
        oog = min(((c - o).length, o) for o in ogen)
        if oog[0] < 0.0135 and p.normal.y < -0.4:
            o = oog[1]
            p.material_index = volgorde.index('iris' if abs(c.x - o.x) < 0.0055 and abs(c.z - o.z) < 0.0055 else 'oogwit')
        elif gem(lip) > 0.5:
            p.material_index = volgorde.index('lippen')
        elif gem(nagel) > 0.5:
            p.material_index = volgorde.index('nagels')
        elif gem(hoofdhuid) > 0.5:
            p.material_index = volgorde.index('haar')
        else:
            p.material_index = volgorde.index('huid')
    img = bpy.data.images.new('basismens-huid', beeld, beeld, alpha=False)
    for m in mats.values():
        n = m.node_tree.nodes.new('ShaderNodeTexImage')
        n.image = img
        m.node_tree.nodes.active = n
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = 4
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = lijf
    lijf.select_set(True)
    bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_clear=True, margin=6)
    img.filepath_raw = os.path.join(UIT, 'bron', 'basismens-huid.png')
    img.file_format = 'PNG'
    img.save()
    # één materiaal met de gebakken textuur, voor het spel en de GLB
    m = bpy.data.materials.new('basismens')
    nt = m.node_tree
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    nt.links.new(tex.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
    nt.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.6
    me.materials.clear()
    me.materials.append(m)
    for p in me.polygons:
        p.material_index = 0
    for n in mats.values():
        bpy.data.materials.remove(n)
    return m


def gewichten_gladden(ob, rig):
    """De gewichten glad rond kruis, heupen en oksels (instellingen: skinning): per ronde schuift elk punt een deel naar
    het gemiddelde van zijn buren, het meest in het midden van een gebied en niets aan de rand, en daarna is de som van
    zijn gewichten weer 1. Lineaire skinning rekt de huid het meest waar het gewicht van het ene bot snel overgaat in dat
    van het andere; een zachtere overgang verdeelt de rek. Geeft hoeveel punten meededen."""
    S = INST['skinning']
    me = ob.data
    n = len(me.vertices)
    botten = {b.name for b in rig.data.bones}
    groepen = [g for g in ob.vertex_groups if g.name in botten]
    kol = {g.index: j for j, g in enumerate(groepen)}
    W = np.zeros((n, len(groepen)))
    for v in me.vertices:
        for x in v.groups:
            j = kol.get(x.group)
            if j is not None:
                W[v.index, j] = x.weight
    co = np.array([v.co[:] for v in me.vertices])
    f = np.zeros(n)
    for g in S['gebieden']:
        p = np.array((rig.matrix_world @ stand.gebied(rig, g['naam']))[:])
        t = np.clip(1 - np.linalg.norm(co - p, axis=1) / g['straal'], 0, 1)
        f = np.maximum(f, t * t * (3 - 2 * t))
    ed = np.array([e.vertices[:] for e in me.edges])
    buren = np.maximum(np.bincount(ed.ravel(), minlength=n), 1).astype(float)[:, None]
    k = (S['kracht'] * f)[:, None]
    for _ in range(S['rondes']):
        som = np.zeros_like(W)
        np.add.at(som, ed[:, 0], W[ed[:, 1]])
        np.add.at(som, ed[:, 1], W[ed[:, 0]])
        W = W + k * (som / buren - W)
        tot = W.sum(axis=1, keepdims=True)
        W = np.where(tot > 0, W / np.maximum(tot, 1e-9), W)
    mee = np.nonzero(f > 0)[0]
    for j, g in enumerate(groepen):
        kolom = W[:, j]
        for i in mee:
            if kolom[i] > 1e-4:
                g.add([int(i)], float(kolom[i]), 'REPLACE')
            else:
                g.remove([int(i)])
    return int(len(mee))


def toepassen(ob, naam):
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.modifier_move_to_index(modifier=naam, index=0)
    bpy.ops.object.modifier_apply(modifier=naam)


def holtes_spannen(bm, vast, rondes):
    """Stof spant over holtes (de navel, de bilspleet): een punt dat dieper ligt dan het gemiddelde van zijn buren, gaat
    naar buiten; bolle plekken blijven (glad strijken trok de broek daar de huid in), en de punten in `vast` ook. Naar
    buiten gezet liepen de wanden van de navel anders naar elkaar toe, tot twee punten op elkaar."""
    for _ in range(rondes):
        bm.normal_update()
        schuif = {}
        for v in bm.verts:
            if v in vast or not v.link_edges:
                continue
            L = sum((e.other_vert(v).co for e in v.link_edges), Vector()) / len(v.link_edges) - v.co
            if L.dot(v.normal) > 0:
                schuif[v] = L * 0.5
        for v, d in schuif.items():
            v.co += d
    bm.normal_update()


def onderbroek(lijf, rig):
    """Een neutrale boxershort uit het spelmodel, recht afgesneden met vlakken: boven de taille en onder de pijpen weg
    (zo volgt de rand niet de driehoeken, en is hij niet gekarteld), met nog een snede waar de band begint. Dan 4 mm naar
    buiten (de band nog wat verder), de gewichten van het lijf eronder punt voor punt, en 2,5 mm dik met een gesloten
    rand. Geeft (de broek, hoe ver de open randen voor de dikte van hun snijvlak lagen in mm)."""
    O = INST['onderbroek']
    heup = (rig.matrix_world @ rig.data.bones['upperleg01.L'].head_local).z
    boven, onder = heup + O['taille_boven_heup'], heup - O['pijp_onder_heup']
    band_boven, band_onder = boven - O['band'], onder + O['band_pijp']
    ob = kopie(lijf, 'onderbroek')
    for m in list(ob.modifiers):
        ob.modifiers.remove(m)
    arm = groep_gewicht(ob, ['upperarm', 'lowerarm', 'wrist', 'finger', 'metacarpal'])
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if max(arm[v.index] for v in f.verts) > 0.05], context='FACES')
    for z, weg in ((boven, 'boven'), (onder, 'onder'), (band_boven, None), (band_onder, None)):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=(0, 0, z), plane_no=(0, 0, 1),
                               clear_outer=weg == 'boven', clear_inner=weg == 'onder')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    # waar een snede vlak langs een punt liep, bleven splinters van driehoeken over: een punt zonder normaal, dat de dikte
    # niet verplaatst (de controle vond het als twee punten op elkaar); weg ermee
    bmesh.ops.dissolve_degenerate(bm, dist=1e-4, edges=bm.edges[:])
    bmesh.ops.remove_doubles(bm, verts=bm.verts[:], dist=1e-5)
    rand = [v for v in bm.verts if any(len(e.link_faces) == 1 for e in v.link_edges)]
    afwijking = max(min(abs(v.co.z - boven), abs(v.co.z - onder)) for v in rand) * 1000
    holtes_spannen(bm, set(rand), O['glad'])
    in_band = lambda z: z >= band_boven - 1e-6 or z <= band_onder + 1e-6
    for v in bm.verts:
        v.co += v.normal * (O['afstand'] + (O['band_uit'] if in_band(v.co.z) else 0.0))
    bm.to_mesh(ob.data)
    bm.free()
    me = ob.data
    me.materials.clear()
    me.materials.append(knopen_materiaal('onderbroek', LIJF['kleuren']['onderbroek']))
    me.materials.append(knopen_materiaal('onderbroek-band', LIJF['kleuren']['onderbroek_band']))
    for p in me.polygons:
        p.material_index = 1 if in_band(p.center.z) else 0
    # de gewichten van het lijf eronder, ook voor de punten die het afsnijden maakte
    for g in list(ob.vertex_groups):
        ob.vertex_groups.remove(g)
    dt = ob.modifiers.new('gewichten', 'DATA_TRANSFER')
    dt.object = lijf
    dt.use_vert_data = True
    dt.data_types_verts = {'VGROUP_WEIGHTS'}
    dt.vert_mapping = 'POLYINTERP_NEAREST'
    dt.layers_vgroup_select_src = 'ALL'
    dt.layers_vgroup_select_dst = 'NAME'
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.datalayout_transfer(modifier='gewichten')
    toepassen(ob, 'gewichten')
    s = ob.modifiers.new('dikte', 'SOLIDIFY')
    s.thickness = O['dikte']
    s.offset = 1
    s.use_rim = True
    s.use_even_offset = True
    toepassen(ob, 'dikte')
    zacht = [True] * len(ob.data.polygons)
    ob.data.polygons.foreach_set('use_smooth', zacht)
    skelet_eraan(ob, rig)
    return ob, round(afwijking, 4)


def main():
    os.makedirs(os.path.join(UIT, 'bron'), exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    # eerst meten, dan op maat: MakeHuman maakt hem zo groot als de macro's zeggen; de schaal maakt er 1,75 m van
    lijf, rig = maak_mens(0.1)
    zs = [p.z for p in punten(lijf)]
    schaal = 0.1 * LIJF['lengte'] / (max(zs) - min(zs))
    leeg()
    lijf, rig = maak_mens(schaal)
    rig.data.pose_position = 'REST'
    zs = [p.z for p in punten(lijf)]
    rig.location.z -= min(zs)
    bpy.context.view_layer.update()
    print('BOUW schaal', round(schaal, 5), 'skelet', tuple(round(s, 4) for s in rig.scale), 'lengte', round(max(zs) - min(zs), 4))
    ogen = [rig.matrix_world @ rig.data.bones[f'eye.{k}'].head_local for k in ('L', 'R')]
    bron = bak(lijf, 'lijf-bron')
    bpy.data.objects.remove(lijf, do_unlink=True)
    # het skelet zonder verplaatsing en schaal, zodat de GLB in meters staat met de voeten op Z = 0
    bpy.ops.object.select_all(action='DESELECT')
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    rig.name = 'skelet'
    rig.data.name = 'skelet'
    # waar de botten van het gezicht stonden (de mond, de kin, de ogen), voor de baard en de maliënkraag van de soldaat
    # (ronde 4): die botten gaan hierna weg
    rig['gezicht'] = json.dumps({b: [round(c, 5) for c in rig.data.bones[b].head_local] for b in INST['skelet']['gezicht']})
    weg = skelet_opruimen(rig, [bron])
    glad = gewichten_gladden(bron, rig)
    skelet_eraan(bron, rig)
    lijf, verhouding = versimpel(bron, LIJF['budget_driehoeken'])
    skelet_eraan(lijf, rig)
    verf(lijf, ogen, LIJF['textuur'])
    bron.data.materials.clear()
    bron.data.materials.append(lijf.data.materials[0])
    broek, broek_rand = onderbroek(lijf, rig)
    # de groepen van MakeHuman die geen bot zijn, eruit (de GLB kent alleen de gewichten van de botten)
    botten = {b.name for b in rig.data.bones}
    for ob in (bron, lijf, broek):
        for g in list(ob.vertex_groups):
            if g.name not in botten:
                ob.vertex_groups.remove(g)
    # wat MPFB verder in de scène zette (de vorm van de botten in de viewport, een Icosphere), eruit: anders gaat het
    # mee in de GLB
    for pb in rig.pose.bones:
        pb.custom_shape = None
    for ob in list(bpy.data.objects):
        if ob not in (rig, bron, lijf, broek):
            print('BOUW weg:', ob.name)
            bpy.data.objects.remove(ob, do_unlink=True)
    for ob in (bron, lijf, broek):
        ob.data.name = ob.name  # in de GLB heten de meshes zoals hier (anders 'base.002' van MPFB)
    bron.hide_render = True
    bron.hide_set(True)
    rig.data.pose_position = 'POSE'
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'bron', 'basismens.blend'))
    zs = [p.z for p in punten(lijf)]
    feiten = {
        'lengte': round(max(zs) - min(zs), 4), 'laagste_punt': round(min(zs), 5),
        'driehoeken': {'lijf': driehoeken(lijf), 'lijf-bron': driehoeken(bron), 'onderbroek': driehoeken(broek)},
        'versimpeling': round(verhouding, 4), 'botten': len(rig.data.bones), 'botten_weg': len(weg),
        'gewichten_glad': glad, 'onderbroek_rand_mm': broek_rand,
        'herkomst': 'MPFB 2 (MakeHuman voor Blender), basismesh hm08 en het skelet default met zijn gewichten: CC0 '
                    '(september 2020, Data Collection AB); de code van MPFB (GPL-3) zit niet in de uitvoer.',
    }
    json.dump(feiten, open(os.path.join(UIT, 'bouw.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('BOUW', json.dumps(feiten, ensure_ascii=False))


if __name__ == '__main__':  # soldaat.py leent de stukken
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
