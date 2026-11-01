# De bouwstenen voor de methodeproef (vraag 192): geen eindbeeld, maar per beeld de ruwe passes uit Cycles in een multilayer-EXR, plus het ID-beeld
# van render.py. Alles is wit gelakt, met alleen de zon aan: zo geeft DiffDir de zon met zijn schaduw, los van de kleur. De verf en de andere
# kenmerken komen als AOV mee. verlicht.py maakt daar in een paar seconden een eindbeeld van; opnieuw renderen is niet nodig om de stijl te wijzigen.
#
#   blender.exe -b <figuur.blend> -P proef/gbuffer.py -- <uitmap> <houding> [beelden=1] [richtingen=Z,ZW] [pixels=768] [monsters=64] [elevatie=30]
#       [ortho=3.0] [doelz=0.74] [zonder=speer,hozen] [rust] [grijs]
import json
import math
import os
import sys
import time

import bpy
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HIER))
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import render as R  # noqa: E402

AOV = (('verf', 'COLOR'), ('ao', 'VALUE'), ('aow', 'VALUE'), ('bol', 'VALUE'), ('metaal', 'VALUE'), ('ruwheid', 'VALUE'), ('stof', 'VALUE'), ('spiegel', 'VALUE'), ('contact', 'VALUE'), ('deel', 'VALUE'))
AO_DICHT, AO_WIJD = 0.055, 0.32
DEEL_NUMMER = {n: i + 1 for i, n in enumerate(R.ID_KLEUR)}


def _aov(nt, naam, uitgang, kleur=False):
    a = nt.nodes.new('ShaderNodeOutputAOV')
    a.aov_name = naam
    nt.links.new(uitgang, a.inputs['Color' if kleur else 'Value'])


def _ao(nt, afstand):
    n = nt.nodes.new('ShaderNodeAmbientOcclusion')
    n.samples = 8
    n.inputs['Distance'].default_value = afstand
    return n.outputs['AO']


def gbuffer_materiaal(mat):
    """Een kopie van het materiaal: wit en diffuus, met de verf (attribuut of textuur) en de kenmerken als AOV."""
    nieuw = bpy.data.materials.new(mat.name + '-gb')
    nieuw.use_nodes = True
    nt = nieuw.node_tree
    nt.nodes.clear()
    uit = nt.nodes.new('ShaderNodeOutputMaterial')
    d = nt.nodes.new('ShaderNodeBsdfDiffuse')
    d.inputs['Color'].default_value = (1, 1, 1, 1)
    nt.links.new(d.outputs[0], uit.inputs[0])
    # de normal map van een textuurmodel blijft meetellen
    teks = {n.image.name.rsplit('-', 1)[-1].split('.')[0]: n.image for n in mat.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image}
    if 'kleur' in teks:
        tk = nt.nodes.new('ShaderNodeTexImage')
        tk.image = teks['kleur']
        _aov(nt, 'verf', tk.outputs['Color'], True)
        te = nt.nodes.new('ShaderNodeTexImage')
        te.image = teks['eigen']
        sep = nt.nodes.new('ShaderNodeSeparateColor')
        nt.links.new(te.outputs['Color'], sep.inputs[0])
        _aov(nt, 'ruwheid', sep.outputs['Red'])
        _aov(nt, 'metaal', sep.outputs['Green'])
        _aov(nt, 'spiegel', sep.outputs['Blue'])
        _aov(nt, 'stof', te.outputs['Alpha'])
        tn = nt.nodes.new('ShaderNodeTexImage')
        tn.image = teks['normaal']
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nt.links.new(tn.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], d.inputs['Normal'])
    else:
        at = {}
        for naam in ('verf', 'ruwheid', 'metaal', 'stof', 'spiegel'):
            n = nt.nodes.new('ShaderNodeAttribute')
            n.attribute_name = naam
            at[naam] = n
        _aov(nt, 'verf', at['verf'].outputs['Color'], True)
        for naam in ('ruwheid', 'metaal', 'stof', 'spiegel'):
            _aov(nt, naam, at[naam].outputs['Fac'])
    for naam in ('bol', 'contact'):
        n = nt.nodes.new('ShaderNodeAttribute')
        n.attribute_name = naam
        _aov(nt, naam, n.outputs['Fac'])
    _aov(nt, 'ao', _ao(nt, AO_DICHT))
    _aov(nt, 'aow', _ao(nt, AO_WIJD))
    info = nt.nodes.new('ShaderNodeObjectInfo')
    _aov(nt, 'deel', info.outputs['Object Index'])
    return nieuw


def wissel_texturen(map_):
    """Een andere set kleur- en eigen-texturen (schilder.py, projecteer.py) op hetzelfde model. De normal map en de UV blijven."""
    for im in bpy.data.images:
        for stam in ('-kleur', '-eigen'):
            if im.name.split('.')[0].endswith(stam):
                nieuw = os.path.join(os.path.abspath(map_), im.name.split('.')[0] + '.png')
                if os.path.exists(nieuw):
                    im.filepath = nieuw
                    im.source = 'FILE'
                    im.reload()


def laag_beeld(naam):
    n = f'{naam}-laag'
    im = bpy.data.images.get(n)
    if im is None:
        im = bpy.data.images.new(n, 4, 4, alpha=False, float_buffer=False)
        im.source = 'FILE'
        im.colorspace_settings.name = 'Non-Color'
    return im


def zet_laag(map_, r):
    """De AI-laag van deze richting op elk onderdeel: de verf blijft aan de UV vast, dus elk beeld van deze richting heeft dezelfde laag."""
    for im in bpy.data.images:
        if not im.name.endswith('-laag'):
            continue
        naam = im.name[:-5]
        p = os.path.join(map_, r, f'{naam}-verschil.png')
        if not os.path.exists(p):
            p = os.path.join(map_, 'alle', f'{naam}-verschil.png')
        im.filepath = os.path.abspath(p)
        im.reload()


def opstelling(scene, zonder, laag=None):
    """De passes aan, de wereld zwart, alleen de zon, met een sterkte waarbij wit precies n.l geeft."""
    vl = scene.view_layers[0]
    vl.use_pass_diffuse_direct = True
    vl.use_pass_diffuse_indirect = True
    vl.use_pass_normal = True
    vl.use_pass_z = True
    vl.use_pass_position = True
    for naam, soort in AOV + ((('laag', 'COLOR'),) if laag else ()):
        a = vl.aovs.add()
        a.name = naam
        a.type = soort
    im = scene.render.image_settings
    im.media_type = 'MULTI_LAYER_IMAGE'
    im.file_format = 'OPEN_EXR_MULTILAYER'
    im.color_depth = '16'
    im.exr_codec = 'ZIP'
    zon = bpy.data.objects['zon']
    zon.data.energy = math.pi
    zon.data.color = (1, 1, 1)
    for n in ('glans', 'rand'):
        bpy.data.objects[n].hide_render = True
    w = bpy.data.worlds.new('zwart')
    w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0
    scene.world = w
    scene.cycles.use_denoising = False
    scene.cycles.max_bounces = 2
    scene.cycles.diffuse_bounces = 2
    scene.cycles.glossy_bounces = 0
    gb = {}
    for ob in scene.objects:
        if ob.type != 'MESH':
            continue
        if ob.name in zonder:
            ob.hide_render = True
        ob.pass_index = DEEL_NUMMER.get(ob.name, 0)
        m = ob.data.materials[0]
        if m.name not in gb:
            gb[m.name] = gbuffer_materiaal(m)
            if laag and m.name.startswith('Stijl-'):
                nt = gb[m.name].node_tree
                tl = nt.nodes.new('ShaderNodeTexImage')
                tl.image = laag_beeld(ob.name)
                _aov(nt, 'laag', tl.outputs['Color'], True)
        ob.data.materials[0] = gb[m.name]


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit, houding = os.path.abspath(argv[0]), argv[1]
    o = {'beelden': '1', 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO', 'pixels': None, 'monsters': None, 'elevatie': None, 'ortho': None, 'doelz': None, 'zonder': '', 'zon': None, 'tex': None, 'hoog': None, 'laag': None, 'laagals': None, 'alleen': None}
    for a in argv[2:]:
        if '=' in a:
            k, v = a.split('=', 1)
            o[k] = v
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    L.zet_op(scene, float(o['elevatie']) if o['elevatie'] else None, int(o['pixels']) if o['pixels'] else None,
             int(o['monsters']) if o['monsters'] else None, float(o['ortho']) if o['ortho'] else None, float(o['doelz']) if o['doelz'] else None)
    zonder = [z for z in o['zonder'].split(',') if z]
    if o['tex']:
        wissel_texturen(o['tex'])
    if o['hoog']:
        scene.render.resolution_y = int(o['hoog'])
    zon_r = [float(x) for x in o['zon'].split(',')] if o['zon'] else L.INST['licht']['zon_richting']
    if o['alleen']:
        zonder = [ob.name for ob in scene.objects if ob.type == 'MESH' and ob.name != o['alleen']]
    stel = R.id_opstelling(scene)
    opstelling(scene, zonder, o['laag'])
    bpy.data.objects['zon'].rotation_euler = (-Vector(zon_r)).to_track_quat('-Z', 'Y').to_euler()
    for n, (ob, m0, mat) in list(stel.items()):
        stel[n] = (ob, ob.data.materials[0], mat)
    arm_ = bpy.data.objects['skelet']
    if arm_.animation_data:
        arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    beelden = int(o['beelden'])
    t0 = time.time()
    tel = 0
    im = scene.render.image_settings
    for r in o['richtingen'].split(','):
        if o['laag']:
            zet_laag(o['laag'], o['laagals'] or r)
        arm_.rotation_euler = (0.0, 0.0, math.radians(L.INST['richtingen'][r]))
        for i in range(beelden):
            # zoals maak.cjs: met de vlag speerkijkt draait de speer in de hand het brede blad naar de camera
            B.zet(arm_, rust, houding, i / beelden, -L.INST['richtingen'][r] if 'speerkijkt' in argv else 0.0)
            bpy.context.view_layer.update()
            im.media_type = 'MULTI_LAYER_IMAGE'
            im.file_format = 'OPEN_EXR_MULTILAYER'
            im.color_depth = '16'
            im.exr_codec = 'ZIP'
            scene.render.filepath = os.path.join(uit, f'{houding}-{r}-{i:02d}.exr')
            bpy.ops.render.render(write_still=True)
            im.media_type = 'IMAGE'
            im.file_format = 'PNG'
            im.color_mode = 'RGBA'
            im.color_depth = '8'
            R.render_id(scene, stel, os.path.join(uit, f'{houding}-{r}-{i:02d}-id.png'))
            tel += 1
    with open(os.path.join(uit, f'{houding}-render.json'), 'w', encoding='utf-8') as f:
        json.dump({'pas_meter': B.pas_lengte(), 'lengte': float(arm_.get('lengte', L.INST['spel']['lengte_meter'])), 'doel_z': float(o['doelz'] or L.INST['camera']['doel_z']), 'houding': houding, 'beelden': beelden, 'richtingen': o['richtingen'].split(','), 'pixels': max(scene.render.resolution_x, scene.render.resolution_y), 'b': scene.render.resolution_x, 'h': scene.render.resolution_y, 'doel_z_camera': float(o['doelz'] or L.INST['camera']['doel_z']),
                   'monsters': scene.cycles.samples, 'elevatie': float(o['elevatie'] or L.INST['camera']['elevatie']), 'ortho': scene.camera.data.ortho_scale, 'zon': zon_r, 'laag': bool(o['laag']), 'seconden': round(time.time() - t0, 1), 'beelden_totaal': tel}, f, indent=1)
    print(f'KLAAR {tel} beelden in {time.time() - t0:.1f} s', flush=True)


if __name__ == '__main__':
    hoofd()
