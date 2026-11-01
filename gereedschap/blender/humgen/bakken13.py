# Ronde 13 (Marcel, 29 okt: "EXPERIMENT D — DETAILTRANSFER EN TEXTURE BAKING": "Vergelijk: high-poly, low-poly zonder
# baking, low-poly met baking. Gebruik dezelfde belichting"): de soldaat groot (soldaat_render.groot, hetzelfde licht en
# dezelfde camera) in vier versies:
# - hoog: de bron (soldaat.blend, 116.000 driehoeken, de procedurele materialen);
# - gebakken: de realtime GLB (13.000 driehoeken) zoals een spel hem leest, met de gebakken kleur, normal map en
#   ruwheid/metaal (textuur.py, van de bron naar de vereenvoudigde mesh);
# - zonder-normaal: dezelfde GLB zonder de gebakken normal map (wat het reliëf van de bron doet);
# - zonder-bakken: dezelfde GLB zonder enige gebakken textuur, elk materiaal één kleur (het gemiddelde van zijn
#   kleurtextuur): wat er van de vorm overblijft.
#
#   BASISMENS_VARIANT=humgen12 blender.exe -b <uit>/bron/soldaat.blend -P gereedschap/blender/humgen/bakken13.py
# naar <uit>/bakken/<versie>/groot.png
import json
import os
import sys

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HIER, '..', 'basismens'))
import realtime_render as RR  # noqa: E402
import render as R  # noqa: E402
import soldaat_render as SR  # noqa: E402


def groot(sc, rig, vuist, naam):
    SR.MAP = os.path.join('bakken', naam)
    os.makedirs(os.path.join(SR.UIT, SR.MAP), exist_ok=True)
    SR.groot(sc, rig, vuist)


def main():
    sc = R.scene()
    rig = bpy.data.objects['skelet']
    rig.data.pose_position = 'POSE'
    for pb in rig.pose.bones:
        pb.rotation_mode = 'XYZ'
    SR.houding(rig)
    vuist = json.load(open(os.path.join(SR.UIT, 'soldaat.json'), encoding='utf-8'))['speer']['vuist']
    groot(sc, rig, vuist, 'hoog')
    for o in [o for o in bpy.data.objects if o.type == 'MESH']:
        o.hide_render = True
    nieuw = RR.inlezen(os.path.join(SR.UIT, 'export', 'soldaat-realtime.glb'), rig)
    groot(sc, rig, vuist, 'gebakken')
    mats = {m for o in nieuw if o.type == 'MESH' for m in o.data.materials if m and m.node_tree}
    for m in mats:
        bsdf = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf:
            for l in list(bsdf.inputs['Normal'].links):
                m.node_tree.links.remove(l)
    groot(sc, rig, vuist, 'zonder-normaal')
    for m in mats:
        nt = m.node_tree
        bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not bsdf:
            continue
        for invoer in ('Base Color', 'Roughness', 'Metallic'):
            s = bsdf.inputs[invoer]
            bron = s.links[0].from_node if s.links else None
            while bron is not None and bron.type != 'TEX_IMAGE':
                bron = next((i.links[0].from_node for i in bron.inputs if i.links), None)
            for l in list(s.links):
                nt.links.remove(l)
            if invoer == 'Base Color' and bron is not None and bron.image:
                px = np.empty(len(bron.image.pixels), np.float32)
                bron.image.pixels.foreach_get(px)
                s.default_value = tuple(px.reshape(-1, 4)[::5, :3].mean(0)) + (1.0,)
    groot(sc, rig, vuist, 'zonder-bakken')
    print('BAKKEN13 klaar', len(mats), 'materialen')


if __name__ == '__main__':
    try:
        main()
    except Exception:
        import traceback
        traceback.print_exc()
        sys.exit(1)
