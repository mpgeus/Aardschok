# De oorzaak in het licht zoeken (vraag 192, de kwaliteitsronde): hetzelfde model, dezelfde camera, en telkens één ding anders. Per variant
# één render van voren, op te meten met oorzaak.py. Zo wijs je aan wat de kleur kost en wat de helm laat glanzen, in plaats van te raden.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/licht_proef.py -- <uitmap> [pixels=768] [monsters=32] [elevatie=12]
import copy
import os
import sys

import bpy

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import licht as L  # noqa: E402

BASIS = copy.deepcopy(L.INST['licht'])
VARIANTEN = {
    'huidig': {},
    'geen-glans': {'glans_sterkte': 0.0},
    'geen-rand': {'rand_sterkte': 0.0},
    'witte-zon': {'zon_kleur': [1.0, 1.0, 1.0]},
    'witte-hemel': {'hemel_boven': [0.7, 0.7, 0.7], 'hemel_midden': [0.7, 0.7, 0.7], 'hemel_onder': [0.7, 0.7, 0.7]},
    'minder-hemel': {'hemel_sterkte': 0.25, 'zon_sterkte': 3.6},
    'geen-spiegeling': {'_spiegeling': 0.0},
    'geen-contact': {'_contact': 0.0},
    'alleen-zon': {'hemel_sterkte': 0.0, 'glans_sterkte': 0.0, 'rand_sterkte': 0.0},
    'alleen-hemel': {'zon_sterkte': 0.0, 'glans_sterkte': 0.0, 'rand_sterkte': 0.0},
}


# de tweede reeks: de zon meer van opzij, zodat de stof van licht naar donker loopt
VORMLICHT = {
    'huidig': {},
    'iets-zij': {'zon_richting': [-0.72, -0.52, 0.78], 'zon_sterkte': 3.5, 'hemel_sterkte': 0.42},
    'iets-zij-diep': {'zon_richting': [-0.72, -0.52, 0.78], 'zon_sterkte': 3.6, 'hemel_sterkte': 0.4, '_contact': 0.08},
    'iets-zij-warm': {'zon_richting': [-0.72, -0.52, 0.78], 'zon_sterkte': 3.6, 'hemel_sterkte': 0.42, 'zon_kleur': [1.0, 0.9, 0.74], 'hemel_boven': [0.5, 0.66, 1.0], '_contact': 0.08},
    'zij': {'zon_richting': [-0.85, -0.35, 0.75], 'zon_sterkte': 3.4, 'hemel_sterkte': 0.38},
    'zij-sterk': {'zon_richting': [-0.92, -0.28, 0.62], 'zon_sterkte': 3.8, 'hemel_sterkte': 0.3, 'rand_sterkte': 1.4},
    'zij-diep': {'zon_richting': [-0.85, -0.35, 0.75], 'zon_sterkte': 3.8, 'hemel_sterkte': 0.3, '_contact': 0.09},
    'zij-hoog': {'zon_richting': [-0.72, -0.28, 1.0], 'zon_sterkte': 3.5, 'hemel_sterkte': 0.34, '_contact': 0.09},
}


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    o = {'pixels': '768', 'monsters': '32', 'elevatie': '12', 'reeks': 'oorzaak'}
    for a in argv[1:]:
        k, v = a.split('=')
        o[k] = v
    os.makedirs(uit, exist_ok=True)
    scene = bpy.context.scene
    arm_ = bpy.data.objects['skelet']
    arm_.animation_data.action = None
    rust = F.rust_van(arm_)
    B.zet(arm_, rust, 'staan', 0.0)
    bpy.context.view_layer.update()
    mat = bpy.data.materials['Stijl']
    b = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    ao = next(n for n in mat.node_tree.nodes if n.type == 'AMBIENT_OCCLUSION')
    spec0 = b.inputs['Specular IOR Level'].default_value
    for naam, w in (VORMLICHT if o['reeks'] == 'vorm' else VARIANTEN).items():
        L.INST['licht'] = {**BASIS, **{k: v for k, v in w.items() if not k.startswith('_')}}
        L.zet_op(scene, float(o['elevatie']), int(o['pixels']), int(o['monsters']))
        b.inputs['Specular IOR Level'].default_value = w.get('_spiegeling', spec0)
        ao.inputs['Distance'].default_value = 0.0001 if w.get('_contact') == 0.0 else w.get('_contact', 0.055)
        scene.render.filepath = os.path.join(uit, f'{naam}.png')
        bpy.ops.render.render(write_still=True)
    print('KLAAR', uit, list(VARIANTEN), flush=True)


if __name__ == '__main__':
    hoofd()
