# Renderen uit de vaste opstelling (vraag 192): een figuur uit het .blend, per houding, richting en beeld één PNG met een
# doorzichtige achtergrond, altijd in hetzelfde vak: de camera beweegt niet, de figuur draait om zijn voetpunt, dus het anker ligt
# voor elk beeld op dezelfde pixel.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/render.py -- <uitmap> <houding> [beelden=8] [richtingen=Z,ZW]
#       [pixels=768] [monsters=64] [elevatie=30] [ortho=3.0] [doelz=0.72] [klei] [speerkijkt]
import json
import math
import os
import sys
import time

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402

# per onderdeel een vaste kleur voor de lijnen tussen de lagen (vel.py): geen licht, geen ruisfilter, één monster
ID_KLEUR = {'hoofd': (1, 0, 0), 'baard': (1, 0, 0), 'helm': (0, 0, 1), 'kap': (1, 1, 0), 'gambeson': (1, 0, 1), 'tabberd': (0, 1, 1),
            'riem': (0.5, 0, 0), 'buidel': (0, 0.5, 0), 'hozen': (0, 0, 0.5), 'laarzen': (0.5, 0.5, 0), 'handschoenen': (0.5, 0, 0.5),
            'speer': (0, 0.5, 0.5)}


def id_opstelling(scene):
    """Per onderdeel een emissiemateriaal, om de ID-beelden te maken."""
    terug = {}
    for ob in scene.objects:
        if ob.type != 'MESH' or ob.name not in ID_KLEUR:
            continue
        mat = bpy.data.materials.new('id-' + ob.name)
        mat.use_nodes = True
        nt = mat.node_tree
        nt.nodes.clear()
        e = nt.nodes.new('ShaderNodeEmission')
        e.inputs['Color'].default_value = (*ID_KLEUR[ob.name], 1)
        u = nt.nodes.new('ShaderNodeOutputMaterial')
        nt.links.new(e.outputs[0], u.inputs[0])
        terug[ob.name] = (ob, ob.data.materials[0], mat)
    return terug


def render_id(scene, stel, pad):
    """Eén ID-beeld, zonder de verf te verliezen."""
    oud = (scene.cycles.samples, scene.cycles.use_denoising, scene.cycles.filter_width, scene.cycles.max_bounces, scene.world)
    scene.cycles.samples, scene.cycles.use_denoising, scene.cycles.filter_width, scene.cycles.max_bounces = 1, False, 0.01, 0
    for ob, _, mat in stel.values():
        ob.data.materials[0] = mat
    scene.render.filepath = pad
    bpy.ops.render.render(write_still=True)
    for ob, m0, _ in stel.values():
        ob.data.materials[0] = m0
    scene.cycles.samples, scene.cycles.use_denoising, scene.cycles.filter_width, scene.cycles.max_bounces, scene.world = oud


def klei(scene):
    """Alleen de vorm: dezelfde grijze stof op alles, om het silhouet en de vormen te beoordelen."""
    mat = bpy.data.materials.new('klei')
    mat.use_nodes = True
    b = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (0.42, 0.40, 0.38, 1)
    b.inputs['Roughness'].default_value = 0.75
    for ob in scene.objects:
        if ob.type == 'MESH':
            ob.data.materials.clear()
            ob.data.materials.append(mat)


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit, houding = os.path.abspath(argv[0]), argv[1]
    o = {'beelden': 1, 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO', 'pixels': None, 'monsters': None, 'elevatie': None, 'ortho': None, 'doelz': None}
    vlag = set()
    for a in argv[2:]:
        if '=' in a:
            k, v = a.split('=', 1)
            o[k] = v
        else:
            vlag.add(a)
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    L.zet_op(scene, float(o['elevatie']) if o['elevatie'] else None, int(o['pixels']) if o['pixels'] else None,
             int(o['monsters']) if o['monsters'] else None, float(o['ortho']) if o['ortho'] else None, float(o['doelz']) if o['doelz'] else None)
    if 'klei' in vlag:
        klei(scene)
    arm_ = bpy.data.objects['skelet']
    if arm_.animation_data:
        arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    beelden = int(o['beelden'])
    stel = id_opstelling(scene)
    t0 = time.time()
    tel = 0
    for r in o['richtingen'].split(','):
        arm_.rotation_euler = (0.0, 0.0, math.radians(L.INST['richtingen'][r]))
        # het brede blad van de speer naar de camera: de speer draait in zijn hand om zijn eigen as, anders wordt hij een streep
        speer_draai = -L.INST['richtingen'][r] if 'speerkijkt' in vlag else 0.0
        for i in range(beelden):
            B.zet(arm_, rust, houding, i / beelden, speer_draai)
            bpy.context.view_layer.update()
            scene.render.filepath = os.path.join(uit, f'{houding}-{r}-{i:02d}.png')
            bpy.ops.render.render(write_still=True)
            render_id(scene, stel, os.path.join(uit, f'{houding}-{r}-{i:02d}-id.png'))
            tel += 1
    with open(os.path.join(uit, f'{houding}-render.json'), 'w', encoding='utf-8') as f:
        json.dump({'pas_meter': B.pas_lengte(), 'lengte': float(arm_.get('lengte', L.INST['spel']['lengte_meter'])), 'doel_z': float(o['doelz'] or L.INST['camera']['doel_z']), 'houding': houding, 'beelden': beelden, 'richtingen': o['richtingen'].split(','), 'pixels': scene.render.resolution_x,
                   'monsters': scene.cycles.samples, 'elevatie': o['elevatie'] or L.INST['camera']['elevatie'],
                   'ortho': scene.camera.data.ortho_scale, 'seconden': round(time.time() - t0, 1), 'beelden_totaal': tel}, f, indent=1)
    print(f'KLAAR {tel} beelden in {time.time() - t0:.1f} s', flush=True)


if __name__ == '__main__':
    hoofd()
