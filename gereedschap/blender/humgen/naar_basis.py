# De HumGen-man als basismens (Marcel, 29 okt, ronde 10: "Pas de bestaande kleding aan op HumGen3D", "Gebruik de
# bestaande modulaire architectuur"): van het .blend van maak.py een bestand in de vorm van basismens.blend, zodat de
# bouw van de soldaat (basismens/soldaat.py) en de stappen erna (render, export, controle) er zonder tweede pijplijn op
# draaien. Wat er gebeurt:
# - de livekeys van HumGen (Male, LIVE_KEY_*) in de vorm gebakken; de vormen die aan de botten hangen (de correctieve
#   shape keys, de blik) blijven, als verschil op die nieuwe vorm;
# - 'lijf' (de man met zijn huid, de oogbollen erbij), 'lijf-bron' (dezelfde vorm zonder shape keys, verborgen: daar
#   snijdt de soldaat zijn kleren uit) en 'skelet';
# - de botten van HumGen krijgen de namen die de bouw van de soldaat kent (botten.json, omgekeerd; de vertexgroepen gaan
#   mee): geen ander skelet, dezelfde botten, gewichten en correctieve vormen; plus een paar hulpbotten die niets
#   vervormen, waar de code van MakeHuman een tweede stuk verwacht (upperarm02: de tweede helft van de bovenarm);
# - de herkenningspunten van het gezicht (rig['gezicht']: de ogen, de kaak, de kin, onder de onderlip), uit de botten en
#   het profiel van het gezicht;
# - het haar van HumGen eruit (deeltjes: onder de helm, en ze gaan niet mee als de soldaat vlakken van het lijf weghaalt),
#   de tanden eruit (de mond is dicht), een onderbroek uit bouw.onderbroek;
# naar <uit van de variant>/bron/basismens.blend en <uit>/bouw.json.
#
#   BASISMENS_VARIANT=humgen blender.exe -b <uit>/humgen/bron/humgen.blend -P gereedschap/blender/humgen/naar_basis.py
import json
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import bouw  # noqa: E402  (onderbroek, skelet_eraan, driehoeken)
from variant import INST, UIT  # noqa: E402

KAART = json.load(open(os.path.join(HIER, 'botten.json'), encoding='utf-8'))['kaart']
# HumGen -> de eerste naam van MakeHuman die erbij hoort (spine = de heup: root)
NAMEN = {}
for oud, nieuw in KAART.items():
    if nieuw and nieuw not in NAMEN:
        NAMEN[nieuw] = oud
NAMEN['spine'] = 'root'
NAMEN['spine.001'] = 'spine04'
NAMEN['spine.002'] = 'spine03'
NAMEN['spine.003'] = 'spine01'
# hulpbotten (vervormen niets): naam, ouder, van (deel van de ouder), tot
HULP = [(f'{d}02.{k}', f'{d}01.{k}', 0.3 if d == 'upperarm' else 0.5, 1.0) for d in ('upperarm', 'lowerarm', 'upperleg', 'lowerleg') for k in 'LR'] + \
       [('spine05', 'root', 0.0, 0.5), ('spine02', 'spine03', 0.5, 1.0), ('neck02', 'neck01', 0.33, 0.66), ('neck03', 'neck01', 0.66, 1.0)] + \
       [(f'shoulder01.{k}', f'clavicle.{k}', 0.6, 1.0) for k in 'LR']


def bak_livekeys(ob):
    """De shape keys zonder driver in de vorm; die met een driver (correctief, de blik) blijven als verschil."""
    me = ob.data
    if not me.shape_keys:
        return []
    kb = me.shape_keys.key_blocks
    n = len(me.vertices)
    co = lambda k: (lambda a: (k.data.foreach_get('co', a), a.reshape(-1, 3))[1])(np.empty(n * 3, np.float32))
    ad = me.shape_keys.animation_data
    gestuurd = {d.data_path.split('"')[1] for d in (ad.drivers if ad else []) if 'key_blocks' in d.data_path}
    basis = co(kb[0]).astype(np.float64)
    nieuw = basis.copy()
    weg = []
    for k in kb[1:]:
        if k.name not in gestuurd:
            nieuw += k.value * (co(k) - co(k.relative_key))
            weg.append(k.name)
    for k in kb[1:]:
        if k.name in gestuurd:
            k.data.foreach_set('co', (co(k) - basis + nieuw).astype(np.float32).ravel())
    kb[0].data.foreach_set('co', nieuw.astype(np.float32).ravel())
    me.vertices.foreach_set('co', nieuw.astype(np.float32).ravel())
    for naam in weg:
        ob.shape_key_remove(kb[naam])
    me.update()
    return weg


def gezicht(rig, lijf):
    """De herkenningspunten die de soldaat gebruikt (INST['skelet']['gezicht']): de ogen (de oogbollen), de kaak, en uit
    het profiel van het gezicht de kin (het voorste punt onder de mond) en het punt onder de onderlip (oris01)."""
    B = lambda b: rig.data.bones[b].head_local.copy()
    oog = {k: B(f'eyeball.{k}') for k in 'LR'}
    z_oog = (oog['L'].z + oog['R'].z) / 2
    mid = [v.co for v in lijf.data.vertices if abs(v.co.x) < 0.003 and v.co.y < oog['L'].y and z_oog - 0.2 < v.co.z < z_oog]
    voorste = lambda z0, z1: min((p for p in mid if z0 < p.z < z1), key=lambda p: p.y)
    neus = voorste(z_oog - 0.075, z_oog - 0.02)
    kin = voorste(z_oog - 0.165, z_oog - 0.1)
    # onder de onderlip: het diepste punt (grootste y) van het profiel tussen de mond en de kin
    tussen = [p for p in mid if kin.z + 0.008 < p.z < neus.z - 0.035]
    onder = max(tussen, key=lambda p: p.y) if tussen else (neus + kin) / 2
    punten = {'eye.L': oog['L'], 'eye.R': oog['R'], 'jaw': B('jaw'), 'special04': kin, 'oris01': onder}
    return {b: [round(c, 5) for c in punten[b]] for b in INST['skelet']['gezicht']}


def kleding(rig, K):
    """Ronde 13 (Marcel, 29 okt: "professionele bestaande 3D-assets gebruiken als bron voor hoogwaardige
    kledingconstructie"): kleding van Human Generator zelf aan deze man, met zijn API (outfit.set en footwear.set passen
    het stuk aan zijn vorm, in de shape key 'Body Proportions'). Per stuk ('soort' outfit of footwear, 'zoek' een stuk van
    de naam van de voorinstelling, 'object' het begin van de naam van het mesh dat blijft): de vorm vast (de shape keys
    toegepast, de correctieve zonder drivers op 0), 'onderverdeling' keer onderverdeeld en zijn dikte toegepast, in
    wereldcoördinaten; alleen het grootste stuk (zonder riemen, sjerpen en kraagjes) als 'grootste'; de vlakken weg die
    samen meer dan een drempel aan bepaalde botten hangen ('weg': [[botten, drempel]], de capuchon aan het hoofd, de
    mouwen aan de armen). De rest van de outfit gaat weg; het stuk heet 'naam'."""
    from HumGen3D import Human
    from mathutils import Matrix
    ctx = bpy.context
    mens = Human.from_existing(rig)
    stukken = []
    for k in K:
        soort = mens.clothing.outfit if k['soort'] == 'outfit' else mens.clothing.footwear
        p = next(x for x in soort.get_options(ctx) if k['zoek'] in x)
        voor = {o.name for o in bpy.data.objects}
        soort.set(p, ctx)
        for o in [o for o in bpy.data.objects if o.name not in voor and o.type == 'MESH']:
            if not o.name.startswith(k['object']):
                bpy.data.objects.remove(o, do_unlink=True)
                continue
            bpy.ops.object.select_all(action='DESELECT')
            ctx.view_layer.objects.active = o
            o.select_set(True)
            if o.data.shape_keys:
                o.data.shape_keys.animation_data_clear()
                for kb in o.data.shape_keys.key_blocks:
                    kb.value = 1.0 if kb.name == 'Body Proportions' else 0.0
                bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
            for md in list(o.modifiers):
                if md.type == 'SUBSURF':
                    md.levels = k.get('onderverdeling', 0)
                    if md.levels:
                        bpy.ops.object.modifier_apply(modifier=md.name)
                        continue
                if md.type not in ('ARMATURE', 'SOLIDIFY'):
                    o.modifiers.remove(md)
            if k.get('opblazen'):
                # voller dan het kledingstuk is gemaakt ('opblazen': meter langs de normaal, en extra op de mouwen), vóór
                # zijn dikte: de vorm, de plooien en de naden blijven, het volume groeit (ronde 13: de parka was slanker
                # dan de gambeson van de speerman)
                basis, mouw = k['opblazen']
                arm = {g.index for g in o.vertex_groups if g.name.startswith(('upper_arm', 'forearm'))}
                o.data.update()
                ns = [v.normal.copy() for v in o.data.vertices]
                for v, n in zip(o.data.vertices, ns):
                    a = min(1.0, sum(g.weight for g in v.groups if g.group in arm))
                    v.co += n * (basis + mouw * a)
            for md in [m for m in o.modifiers if m.type == 'SOLIDIFY']:
                bpy.ops.object.modifier_apply(modifier=md.name)
            mw = o.matrix_world.copy()
            o.parent = None
            o.data.transform(mw)
            o.matrix_world = Matrix.Identity(4)
            if 'cloth' in o:
                del o['cloth']  # anders haalt het volgende stuk van HumGen hem weer weg
            if 'shoe' in o:
                del o['shoe']
            bm = bmesh.new()
            bm.from_mesh(o.data)
            weg = set()
            if k.get('grootste'):
                bm.verts.ensure_lookup_table()
                deel, gezien = {}, set()
                for v in bm.verts:
                    if v.index in gezien:
                        continue
                    stapel, stuk = [v], []
                    gezien.add(v.index)
                    while stapel:
                        w = stapel.pop()
                        stuk.append(w)
                        for e in w.link_edges:
                            x = e.other_vert(w)
                            if x.index not in gezien:
                                gezien.add(x.index)
                                stapel.append(x)
                    for w in stuk:
                        deel[w.index] = len(stuk)
                grootst = max(deel.values())
                weg |= {f for f in bm.faces if any(deel[v.index] < grootst for v in f.verts)}
            dl = bm.verts.layers.deform.active
            for botten, drempel in k.get('weg', []):
                idx = {g.index for g in o.vertex_groups if g.name in botten}
                gewicht = lambda v: sum(w for i, w in v[dl].items() if i in idx) if dl else 0.0
                weg |= {f for f in bm.faces if all(gewicht(v) > drempel for v in f.verts)}
            bmesh.ops.delete(bm, geom=list(weg), context='FACES')
            bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
            bm.to_mesh(o.data)
            bm.free()
            o.name = o.data.name = k['naam']
            stukken.append(o)
    return stukken


def main():
    rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    lijf = next(o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('HG_Body'))
    print('NAAR_BASIS skelet', rig.name, tuple(round(s, 4) for s in rig.matrix_world.to_scale()), tuple(round(c, 4) for c in rig.location))
    HB = INST.get('humgen_basis', {})
    kleren = kleding(rig, HB['kleding']) if HB.get('kleding') else []
    # ronde 11: de wenkbrauwen van HumGen (deeltjes) als eigen haarobject, vast aan het hoofd: als deeltjes gingen ze stuk
    # zodra de soldaat vlakken van het lijf weghaalt
    brauw = None
    if HB.get('wenkbrauwen'):
        for i, ps in enumerate(lijf.particle_systems):
            md = next(m for m in lijf.modifiers if m.type == 'PARTICLE_SYSTEM' and m.particle_system == ps)
            if ps.name.startswith('Eyebrows') and md.show_render:
                lijf.particle_systems.active_index = i
                bpy.ops.object.select_all(action='DESELECT')
                bpy.context.view_layer.objects.active = lijf
                lijf.select_set(True)
                bpy.ops.curves.convert_from_particle_system()
                brauw = bpy.context.active_object
                brauw.name = 'wenkbrauwen'
                # dunne haren ('wenkbrauwen_straal' meter): uit de deeltjes kwamen ze als dikke blokken
                r = brauw.data.attributes.get('radius') or brauw.data.attributes.new('radius', 'FLOAT', 'POINT')
                r.data.foreach_set('value', [HB.get('wenkbrauwen_straal', 0.0002)] * len(r.data))
                if '.HG_Hair_Eye' in bpy.data.materials and not brauw.data.materials:
                    brauw.data.materials.append(bpy.data.materials['.HG_Hair_Eye'])
                # de kleur van de haren: donkerbruin in plaats van zwart ('wenkbrauwen_melanine')
                for mat in brauw.data.materials:
                    for n in (mat.node_tree.nodes if mat and mat.node_tree else []):
                        if 'Melanin' in n.inputs:
                            n.inputs['Melanin'].default_value = HB.get('wenkbrauwen_melanine', 0.7)
                print('NAAR_BASIS wenkbrauwen', len(brauw.data.points), [a.name for a in brauw.data.attributes])
                break
    # de huid van HumGen naar ons licht (ronde 11: 'huid', de knoppen van zijn huidtoon en zijn baardschaduw)
    huid = bpy.data.materials.get('.Human')
    for groep_naam in ('Skin_tone', 'Gender_Group'):
        n = huid.node_tree.nodes.get(groep_naam) if huid else None
        for sok in (n.inputs if n else []):
            if sok.name in HB.get('huid', {}):
                sok.default_value = HB['huid'][sok.name]
    # het haar en de tanden eruit
    for md in [m for m in lijf.modifiers if m.type == 'PARTICLE_SYSTEM']:
        lijf.modifiers.remove(md)
    for ob in list(bpy.data.objects):
        if ob.type == 'MESH' and ob.name.startswith('HG_Teeth'):
            bpy.data.objects.remove(ob, do_unlink=True)
    gebakken = bak_livekeys(lijf)
    # de oogbollen in het lijf (één mesh met zijn eigen materialen)
    ogen = [o for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith('HG_Eyes')]
    # de UV-laag van de ogen heet bij HumGen 'map1', die van het lijf 'UVMap': na het samenvoegen lazen de oogtexturen dan
    # op (0, 0), en de ogen werden rood (ronde 10)
    for o in ogen:
        if o.data.uv_layers and 'UVMap' not in [u.name for u in o.data.uv_layers]:
            o.data.uv_layers[0].name = 'UVMap'
    bak_livekeys_ogen = [bak_livekeys(o) for o in ogen]
    bpy.ops.object.select_all(action='DESELECT')
    for o in ogen + [lijf]:
        o.select_set(True)
    bpy.context.view_layer.objects.active = lijf
    if ogen:
        bpy.ops.object.join()
    # de buitenste schil van de ogen blijft voor de renders; de export haalt hem weg (soldaat_render.zonder_hoornvlies)
    # de botten hernoemen (de vertexgroepen, drivers en beperkingen gaan mee)
    for b in list(rig.data.bones):
        if b.name in NAMEN:
            b.name = NAMEN[b.name]
    # de hulpbotten
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode='EDIT')
    eb = rig.data.edit_bones
    for naam, ouder, van, tot in HULP:
        p = eb[ouder]
        b = eb.new(naam)
        b.head = p.head.lerp(p.tail, van)
        b.tail = p.head.lerp(p.tail, tot)
        b.roll = p.roll
        b.parent = p
        b.use_deform = False
    bpy.ops.object.mode_set(mode='OBJECT')
    rig['gezicht'] = json.dumps(gezicht(rig, lijf))
    # lijf-bron: dezelfde vorm, zonder shape keys en zonder iets erop
    bron = lijf.copy()
    bron.data = lijf.data.copy()
    bpy.context.scene.collection.objects.link(bron)
    bron.shape_key_clear()
    # alleen het lijf, zonder de oogbollen (de soldaat snijdt de kleren uit de huid)
    bm = bmesh.new()
    bm.from_mesh(bron.data)
    oogmat = {i for i, m in enumerate(bron.data.materials) if m and 'Eye' in m.name}
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index in oogmat], context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    bm.to_mesh(bron.data)
    bm.free()
    bouw.skelet_eraan(bron, rig)
    for m in [m for m in lijf.modifiers if m.type != 'ARMATURE']:
        lijf.modifiers.remove(m)
    lijf.name, lijf.data.name, bron.name, bron.data.name = 'lijf', 'lijf', 'lijf-bron', 'lijf-bron'
    rig.name = rig.data.name = 'skelet'
    broek, broek_rand = bouw.onderbroek(bron, rig)
    bouw.skelet_eraan(broek, rig)
    broek.name = broek.data.name = 'onderbroek'
    botten = {b.name for b in rig.data.bones}
    for ob in [bron, lijf, broek] + kleren:
        for g in list(ob.vertex_groups):
            if g.name not in botten:
                ob.vertex_groups.remove(g)
        # de gewichten per punt samen 1 (HumGen: 0,70 tot 1,11; de armature normaliseert ze bij het vervormen toch al)
        bpy.ops.object.select_all(action='DESELECT')
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.vertex_group_normalize_all(lock_active=False)
    for pb in rig.pose.bones:
        pb.custom_shape = None
    if brauw is not None:
        mw = brauw.matrix_world.copy()
        brauw.parent, brauw.parent_type, brauw.parent_bone = rig, 'BONE', 'head'
        brauw.matrix_world = mw
    for ob in list(bpy.data.objects):
        if ob not in [rig, bron, lijf, broek, brauw] + kleren:
            print('NAAR_BASIS weg:', ob.name)
            bpy.data.objects.remove(ob, do_unlink=True)
    # geen HumGen-mens meer (anders werken zijn handlers op deze objecten: de export liep bij het afsluiten vast), en de
    # mesh na het samenvoegen en bakken nagekeken
    for ob in [rig, bron, lijf, broek] + kleren:
        if getattr(ob, 'HG', None) is not None and hasattr(ob.HG, 'ishuman'):
            ob.HG.ishuman = False
        for k in [k for k in ob.keys() if k.lower().startswith(('hg_', 'active_')) or k == 'Age']:
            del ob[k]
    hersteld = {ob.name: lijf.data.validate(clean_customdata=False) if ob is lijf else ob.data.validate(clean_customdata=False) for ob in (lijf, bron, broek)}
    print('NAAR_BASIS hersteld', hersteld)
    bron.hide_render = True
    bron.hide_set(True)
    rig.data.pose_position = 'POSE'
    os.makedirs(os.path.join(UIT, 'bron'), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'bron', 'basismens.blend'))
    deps = bpy.context.evaluated_depsgraph_get()
    zs = [(lijf.matrix_world @ v.co).z for v in lijf.evaluated_get(deps).data.vertices]
    feiten = {'lengte': round(max(zs) - min(zs), 4), 'laagste_punt': round(min(zs), 5),
              'driehoeken': {'lijf': bouw.driehoeken(lijf), 'lijf-bron': bouw.driehoeken(bron), 'onderbroek': bouw.driehoeken(broek)},
              'botten': len(rig.data.bones), 'hulpbotten': [h[0] for h in HULP], 'livekeys_gebakken': gebakken,
              'shapekeys_over': [k.name for k in lijf.data.shape_keys.key_blocks] if lijf.data.shape_keys else [],
              'onderbroek_rand_mm': broek_rand, 'gezicht': json.loads(rig['gezicht']),
              'kleding': {o.name: bouw.driehoeken(o) for o in kleren},
              'herkomst': 'HumGen3D 4.0.38 (Human Generator Asset License, royalty free; een geëxporteerd personage mag in een '
                          'verkocht spel met de commerciële licentie, de bestanden zelf niet delen); naar_basis.py'}
    json.dump(feiten, open(os.path.join(UIT, 'bouw.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('BOUW', json.dumps(feiten, ensure_ascii=False)[:1500])


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
