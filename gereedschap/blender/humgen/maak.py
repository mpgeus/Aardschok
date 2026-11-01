# De basismens uit HumGen3D (Marcel, 29 okt, ronde 9: "Maak een afzonderlijke HumGen3D-bronvariant. Overschrijf de
# bestaande modellen niet"). Alleen met de Python-API van HumGen3D 4.0.38 (Human, in de add-on; zie ontwerp/beeld.md):
# - een man uit een voorinstelling (Human.from_preset), op de leeftijd van instellingen.json (age.set);
# - zijn bouw en gezicht met de livekeys van HumGen ('lichaam', 'gezicht': set_without_update, dan
#   update_human_from_key_change);
# - de lengte precies: HumGen's height.set gaat uit van 184 cm en zet maar één van de twee livekeys height_150/_200,
#   dus eerst beide op 0, dan bijstellen tot de gemeten lengte (human.height.meters, van het bot head tot heel.02.L)
#   binnen een millimeter van 'lengte' ligt;
# - de huid (textuur, subsurface, ondergoed), het skelet van HumGen zoals het is (een Rigify-metarig van 102 botten), de
#   rust zoals HumGen hem maakt;
# - dan opgeslagen als <uit>/bron/humgen.blend, met in <uit>/analyse.json de mesh, het skelet, de lengte, de stand van
#   de armen, de richting, links en rechts, en een hash van de vorm (om te zien of een tweede bouw hetzelfde geeft).
#
#   blender.exe -b -P gereedschap/blender/humgen/maak.py [-- <ander.blend>]
import hashlib
import json
import math
import os
import sys
import time

import bpy
import numpy as np
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
WORTEL = os.path.abspath(os.path.join(HIER, '..', '..', '..'))
UIT = os.path.join(WORTEL, INST['uit'])
ARGS = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
import HumGen3D  # noqa: E402
from HumGen3D import Human  # noqa: E402


def sleutel(mens, naam):
    """Een livekey op naam (zoals HumGen hem noemt, of zonder hoofdletters en met _ voor spaties)."""
    try:
        return mens.keys[naam]
    except Exception:
        n = naam.lower().replace(' ', '_')
        for k in mens.body.keys + mens.face.keys:
            if k.name.lower().replace(' ', '_') == n:
                return k
    raise KeyError(f'geen livekey {naam}; lichaam: {[k.name for k in mens.body.keys]}')


def lengte(mens):
    deps = bpy.context.evaluated_depsgraph_get()
    lijf = mens.objects.body
    e = lijf.evaluated_get(deps)
    zs = [(lijf.matrix_world @ v.co).z for v in e.data.vertices]
    return mens.height.meters, max(zs) - min(zs), min(zs)


def zet_lengte(mens, doel):
    """De lengte tot op een millimeter (de bot-maat van HumGen), door bij te stellen: height.set rekent met 184 cm."""
    ctx = bpy.context
    v = doel * 100 + 3.4
    for ronde in range(8):
        for k in ('height_150', 'height_200'):
            mens.keys[k].set_without_update(0.0)
        mens.keys.update_human_from_key_change(ctx)
        mens.height.set(v, ctx)
        bpy.context.view_layer.update()
        gemeten = mens.height.meters
        if abs(gemeten - doel) < 0.0005:
            break
        v += (doel - gemeten) * 100 * 1.25
    return {'ingesteld_cm': round(v, 2), 'rondes': ronde + 1}


def main():
    t0 = time.time()
    ctx = bpy.context
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    keuze = INST['voorinstelling']
    opties = Human.get_preset_options('male', context=ctx)
    p = next(x for x in opties if os.path.splitext(os.path.basename(x))[0] == keuze)
    mens = Human.from_preset(p, context=ctx)
    mens.name = 'HumGen basismens'
    mens.age.set(INST['leeftijd'])
    gezet = {}
    for groep in ('lichaam', 'gezicht'):
        for naam, waarde in INST[groep].items():
            if naam.startswith('_'):
                continue
            k = sleutel(mens, naam)
            k.set_without_update(waarde)
            gezet[k.name] = waarde
    mens.keys.update_human_from_key_change(ctx)
    lengte_info = zet_lengte(mens, INST['lengte'])
    Hd = INST['huid']
    mens.skin.texture.set_resolution(Hd['resolutie'])
    mens.skin.set_subsurface_scattering(Hd['sss'], ctx)
    mens.skin.set_underwear(Hd['ondergoed'], ctx)
    bpy.context.view_layer.update()
    # de analyse
    rig, lijf = mens.objects.rig, mens.objects.body
    me = lijf.data
    bot, mesh_h, voet_z = lengte(mens)
    pb = rig.pose.bones
    w = lambda b: rig.matrix_world @ pb[b].head
    arm = (rig.matrix_world @ pb['upper_arm.L'].tail - w('upper_arm.L')).normalized()
    deps = bpy.context.evaluated_depsgraph_get()
    e = lijf.evaluated_get(deps)
    co = np.array([v.co[:] for v in e.data.vertices])
    tri = sum(len(f.vertices) - 2 for f in me.polygons)
    deform = [b.name for b in rig.data.bones if b.use_deform]
    analyse = {
        'humgen': '.'.join(map(str, HumGen3D.__version__)), 'blender': bpy.app.version_string, 'voorinstelling': p,
        'leeftijd': INST['leeftijd'], 'livekeys_gezet': gezet, 'lengte': lengte_info,
        'lengte_m': {'humgen_bot_maat': round(bot, 4), 'mesh_kruin_tot_zool': round(mesh_h, 4), 'zool_z': round(voet_z, 4)},
        'arm_van_de_romp_graden': round(math.degrees(math.acos(max(-1, min(1, -arm.z)))), 1),
        'kijkt_naar_min_y': bool(w('eyeball.L').y < w('head').y) if 'eyeball.L' in pb else None,
        'links_op_plus_x': bool(w('hand.L').x > 0 and w('hand.R').x < 0),
        'objecten': {o.name: {'soort': o.type, 'punten': len(o.data.vertices) if o.type == 'MESH' else None,
                              'materialen': [m.name for m in o.data.materials if m] if o.type == 'MESH' else None}
                     for o in bpy.data.objects if o.type in ('MESH', 'ARMATURE')},
        'lijf': {'punten': len(me.vertices), 'vlakken': len(me.polygons), 'driehoeken': tri,
                 'vierhoeken': sum(1 for f in me.polygons if len(f.vertices) == 4), 'uv': [u.name for u in me.uv_layers],
                 'materialen': [m.name for m in me.materials if m], 'vertexgroepen': len(lijf.vertex_groups),
                 'shapekeys': len(me.shape_keys.key_blocks) if me.shape_keys else 0,
                 'shapekeys_namen': [k.name for k in me.shape_keys.key_blocks][:40] if me.shape_keys else []},
        'skelet': {'naam': rig.name, 'botten': len(rig.data.bones), 'vervormend': len(deform), 'vervormend_namen': deform,
                   'alle_namen': [b.name for b in rig.data.bones]},
        'vorm_hash': hashlib.sha256(np.round(co, 5).tobytes()).hexdigest(), 'seconden': round(time.time() - t0, 1),
    }
    os.makedirs(os.path.join(UIT, 'bron'), exist_ok=True)
    pad = ARGS[0] if ARGS else os.path.join(UIT, 'bron', 'humgen.blend')
    bpy.ops.wm.save_as_mainfile(filepath=pad)
    if not ARGS:
        json.dump(analyse, open(os.path.join(UIT, 'analyse.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('MAAK', json.dumps({k: analyse[k] for k in ('lengte', 'lengte_m', 'arm_van_de_romp_graden', 'kijkt_naar_min_y',
                                                       'links_op_plus_x', 'vorm_hash', 'seconden')}))
    print('LIJF', json.dumps(analyse['lijf'])[:600], 'SKELET', analyse['skelet']['botten'], analyse['skelet']['vervormend'])


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
