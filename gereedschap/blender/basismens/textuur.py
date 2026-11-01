# De soldaat met texturen (Marcel, 29 okt, ronde 4: "Maak een reproduceerbare textuurpijplijn. UV-unwrapping waar nodig,
# base-color-texturen, normal maps voor stof, leer en metaal, roughness maps, correcte GLB-export"), en een realtime
# versie ("maximaal 15.000 driehoeken, zonder onacceptabel verlies van silhouet"). De bronversie (soldaat.blend, met de
# knopen van de speerman) blijft voor de sprites; hieruit komen twee kopieën:
# - 'hoog': elk onderdeel zoals het is, met een UV-kaart en drie gebakken beelden;
# - 'realtime': elk onderdeel versimpeld tot zijn budget (instellingen: soldaat.realtime), met dezelfde drie beelden,
#   gebakken van de bron, zodat het reliëf van de bron (de ruiten, de plooien, de maliën) in de normalen terugkomt.
# Per onderdeel, in rust (de A-houding): een UV-kaart (smart project), en met Cycles van de bron naar de kopie gebakken
# (selected to active, 'kooi' meter erbuiten begonnen): de kleur en ruwheid en metaal als licht (het materiaal van de
# bron tijdelijk als emissie: de kleur die de knopen zouden geven, zonder licht; de knopen zoals de sprites ze hebben,
# soldaat_render.materialen_voor_het_spel), en de normalen in tangent space (de vorm
# van de bron en de bobbels van zijn materiaal). Ruwheid en metaal in één beeld, groen en blauw, zoals glTF ze wil. Dan
# een nieuw materiaal: een Principled BSDF met de drie beelden, dat de glTF-exporter herkent. Het lijf houdt zijn eigen
# materiaal (de huid uit bouw.py, al een textuur) en in de realtime versie zijn UV's (versimpelen houdt ze).
#
#   blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/basismens/textuur.py
# naar <uit>/bron/soldaat-hoog.blend en soldaat-realtime.blend (voor export.py), de beelden in <uit>/export/texturen/,
# en <uit>/textuur.json.
import json
import math
import os
import sys
import time

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
from variant import INST, UIT  # noqa: E402
import stand  # noqa: E402
import soldaat_render as SR  # noqa: E402

S = INST['soldaat']
TX, RT = S['textuur'], S['realtime']
BEELDEN = os.path.join(UIT, 'export', 'texturen')
VERSIES = ('hoog', 'realtime')


def scene():
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    pr = bpy.context.preferences.addons['cycles'].preferences
    pr.compute_device_type = 'CUDA'
    pr.get_devices()
    for d in pr.devices:
        d.use = d.type == 'CUDA'
    sc.cycles.device = 'GPU'
    sc.cycles.samples = TX['monsters']
    sc.cycles.use_denoising = False
    b = sc.render.bake
    b.use_selected_to_active = True
    b.cage_extrusion = TX['kooi']
    b.max_ray_distance = 2 * TX['kooi']
    b.margin = TX['marge']
    b.margin_type = 'EXTEND'
    b.use_clear = True
    return sc


def bsdf_van(m):
    """De Principled BSDF die het licht van een materiaal maakt (de eerste, vanaf de uitgang terug gezocht)."""
    nt = m.node_tree
    uit = next(n for n in nt.nodes if n.type == 'OUTPUT_MATERIAL' and n.is_active_output)
    rij = [uit]
    while rij:
        n = rij.pop(0)
        if n.type == 'BSDF_PRINCIPLED':
            return n, uit
        for s in n.inputs:
            rij += [l.from_node for l in s.links]
    raise RuntimeError(f'geen Principled BSDF in {m.name}')


def bron(s):
    """Waar een ingang van de BSDF vandaan komt: de uitgang die erin gaat, of de vaste waarde."""
    return s.links[0].from_socket if s.links else s.default_value


ORIGINEEL = {}


def als_licht(m, wat):
    """Het materiaal tijdelijk als emissie: de kleur ('kleur'), of ruwheid in groen en metaal in blauw ('rm'); met None
    weer zoals het was."""
    nt = m.node_tree
    if m.name not in ORIGINEEL:  # de eerste keer, nu het materiaal nog is zoals het was
        b, uit = bsdf_van(m)
        ORIGINEEL[m.name] = (uit.inputs['Surface'].links[0].from_socket, b, uit)
    bron_, b, uit = ORIGINEEL[m.name]
    em = nt.nodes.get('bak-licht') or nt.nodes.new('ShaderNodeEmission')
    em.name = 'bak-licht'
    em.inputs['Strength'].default_value = 1.0
    for l in list(em.inputs['Color'].links):
        nt.links.remove(l)
    if wat is None:
        nt.links.new(bron_, uit.inputs['Surface'])
        return
    if wat == 'kleur':
        x = bron(b.inputs['Base Color'])
        if isinstance(x, bpy.types.NodeSocket):
            nt.links.new(x, em.inputs['Color'])
        else:
            em.inputs['Color'].default_value = tuple(x)
    else:
        cc = nt.nodes.get('bak-rm') or nt.nodes.new('ShaderNodeCombineColor')
        cc.name = 'bak-rm'
        cc.inputs[0].default_value = 1.0
        for i, naam in ((1, 'Roughness'), (2, 'Metallic')):
            for l in list(cc.inputs[i].links):
                nt.links.remove(l)
            x = bron(b.inputs[naam])
            if isinstance(x, bpy.types.NodeSocket):
                nt.links.new(x, cc.inputs[i])
            else:
                cc.inputs[i].default_value = x
        nt.links.new(cc.outputs[0], em.inputs['Color'])
    nt.links.new(em.outputs[0], uit.inputs['Surface'])


def actief(ob):
    bpy.ops.object.select_all(action='DESELECT')
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob


def kopie(ob, versie):
    """Een kopie van een onderdeel om op te bakken: in de realtime versie versimpeld tot zijn budget, met een UV-kaart."""
    k = ob.copy()
    k.data = ob.data.copy()
    k.name = f'{ob.name}-{versie}'
    SR.zonder_hoornvlies(k)  # ronde 10: de ogen van HumGen gaan zonder hoornvlies naar de GLB
    bpy.context.scene.collection.objects.link(k)
    if versie == 'realtime':
        n = sum(len(p.vertices) - 2 for p in k.data.polygons)
        doel = RT['delen'][ob.name]
        if n > doel:
            if k.data.shape_keys:  # ronde 10: de correctieve vormen van HumGen blijven in de bron, niet in de realtime versie
                k.shape_key_clear()
            d = k.modifiers.new('minder', 'DECIMATE')
            d.decimate_type = 'COLLAPSE'
            d.ratio = doel / n * 0.97
            d.use_collapse_triangulate = True
            actief(k)
            bpy.ops.object.modifier_move_to_index(modifier='minder', index=0)
            bpy.ops.object.modifier_apply(modifier='minder')
    if ob.name == 'lijf':
        return k  # de huid uit bouw.py, met zijn eigen UV's
    for laag in list(k.data.uv_layers):
        k.data.uv_layers.remove(laag)
    k.data.uv_layers.new(name='UVMap')
    actief(k)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004, area_weight=0.0, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    return k


def beeld(naam, maat, kleur):
    img = bpy.data.images.new(naam, maat, maat, alpha=False, float_buffer=False)
    img.colorspace_settings.name = 'sRGB' if kleur else 'Non-Color'
    return img


def bak(sc, src, dst, versie):
    """De drie beelden van src op dst, en dst een materiaal dat ze gebruikt."""
    maat = TX['maat'].get(src.name, TX['standaard'])
    naam = f'{src.name}-{versie}'
    imgs = {'kleur': beeld(f'{naam}-kleur', maat, True), 'normaal': beeld(f'{naam}-normaal', maat, False),
            'rm': beeld(f'{naam}-rm', maat, False)}
    m = bpy.data.materials.new(f'{src.name}-textuur')
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    # eerst de uitgang en de BSDF: zonder uitgang slaat Cycles het bakken stil over
    b = nt.nodes.new('ShaderNodeBsdfPrincipled')
    uit = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(b.outputs['BSDF'], uit.inputs['Surface'])
    tex = {k: nt.nodes.new('ShaderNodeTexImage') for k in imgs}
    for k, t in tex.items():
        t.image = imgs[k]
    dst.data.materials.clear()
    dst.data.materials.append(m)
    for p in dst.data.polygons:
        p.material_index = 0
    mats = {s.material for s in src.material_slots if s.material}
    bpy.ops.object.select_all(action='DESELECT')
    src.select_set(True)
    dst.select_set(True)
    bpy.context.view_layer.objects.active = dst
    tijden = {}
    for k in ('kleur', 'rm', 'normaal'):
        # het doel: de actieve knoop, en geselecteerd (anders breekt Cycles het bakken stil af)
        for t in tex.values():
            t.select = t is tex[k]
        nt.nodes.active = tex[k]
        t0 = time.time()
        if k == 'normaal':
            for mm in mats:
                als_licht(mm, None)
            bpy.ops.object.bake(type='NORMAL', normal_space='TANGENT')
        else:
            for mm in mats:
                als_licht(mm, k)
            bpy.ops.object.bake(type='EMIT')
        tijden[k] = round(time.time() - t0, 2)
        p = os.path.join(BEELDEN, f'{naam}-{k}.png')
        imgs[k].filepath_raw = p
        imgs[k].file_format = 'PNG'
        imgs[k].save()
        # vanaf nu uit het bestand: een gemaakt beeld bewaart het .blend niet
        imgs[k].source = 'FILE'
        imgs[k].filepath = p
        imgs[k].reload()
    for mm in mats:
        als_licht(mm, None)
    # het materiaal van de kopie: de drie beelden in de Principled BSDF, zoals de glTF-exporter ze herkent
    nt.links.new(tex['kleur'].outputs['Color'], b.inputs['Base Color'])
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(tex['rm'].outputs['Color'], sep.inputs['Color'])
    nt.links.new(sep.outputs['Green'], b.inputs['Roughness'])
    nt.links.new(sep.outputs['Blue'], b.inputs['Metallic'])
    nm = nt.nodes.new('ShaderNodeNormalMap')
    nt.links.new(tex['normaal'].outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return {'maat': maat, 'seconden': tijden}


def maak(versie):
    """Een versie: alle onderdelen gekopieerd (en versimpeld), gebakken, en in de plaats van de bron; bewaard als
    bron/soldaat-<versie>.blend."""
    bpy.ops.wm.open_mainfile(filepath=os.path.join(UIT, 'bron', 'soldaat.blend'))
    ORIGINEEL.clear()
    sc = scene()
    # de materialen zoals de sprites ze hebben (soldaat_render.materialen_voor_het_spel: per soort de ruwheid en het metaal,
    # zonder de fijnste bobbels), zodat de GLB eruitziet als de vellen van het spel
    SR.materialen_voor_het_spel()
    rig = bpy.data.objects['skelet']
    stand.rust(rig)
    bpy.context.view_layer.update()
    delen = [o for o in bpy.data.objects if 'onderdeel' in o]
    feiten = {}
    paren = []
    for ob in delen:
        ob.hide_set(False)
        ob.hide_render = False
        k = kopie(ob, versie)
        f = {'driehoeken_bron': sum(len(p.vertices) - 2 for p in ob.data.polygons),
             'driehoeken': sum(len(p.vertices) - 2 for p in k.data.polygons)}
        if ob.name != 'lijf':
            f.update(bak(sc, ob, k, versie))
        feiten[ob.name] = f
        paren.append((ob, k))
        print('TEXTUUR', versie, ob.name, json.dumps(f))
    # de kopieën in de plaats van de bron, met dezelfde namen, ouders en kenmerken
    for ob, k in paren:
        naam = ob.name
        me = ob.data
        bpy.data.objects.remove(ob, do_unlink=True)
        if me.users == 0:
            bpy.data.meshes.remove(me)
        k.name = naam
        k.data.name = naam
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(UIT, 'bron', f'soldaat-{versie}.blend'))
    return feiten


def main():
    os.makedirs(BEELDEN, exist_ok=True)
    uit = {}
    for versie in VERSIES:
        t0 = time.time()
        f = maak(versie)
        uit[versie] = {'delen': f, 'driehoeken': sum(x['driehoeken'] for x in f.values()), 'seconden': round(time.time() - t0, 1)}
    uit['budget_realtime'] = RT['budget']
    json.dump(uit, open(os.path.join(UIT, 'textuur.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('TEXTUUR', json.dumps({v: uit[v]['driehoeken'] for v in VERSIES}))


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
