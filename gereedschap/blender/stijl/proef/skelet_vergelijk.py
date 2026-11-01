# Zijn het skelet en de bewegingen van twee modellen dezelfde (vraag 192, de vormproef)? Draai dit in Blender op elk model; het schrijft alles wat telt naar json, en vergelijk.py-achtig werk doet de laatste regel.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/skelet_vergelijk.py -- <uit.json> [<ander.json>]
import json
import sys

import bpy


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    arm_ = bpy.data.objects['skelet']
    uit = {'botten': {b.name: {'kop': [round(x, 6) for x in b.head_local], 'staart': [round(x, 6) for x in b.tail_local], 'ouder': b.parent.name if b.parent else None} for b in arm_.data.bones},
           'acties': {}}
    for a in bpy.data.actions:
        sleutels = {}
        for lb in a.layers:
            for st in lb.strips:
                for zak in st.channelbags:
                    for fc in zak.fcurves:
                        sleutels[f'{fc.data_path}[{fc.array_index}]'] = [round(k.co[1], 5) for k in fc.keyframe_points]
        uit['acties'][a.name] = sleutels
    with open(argv[0], 'w', encoding='utf-8') as f:
        json.dump(uit, f)
    print('KLAAR', len(uit['botten']), 'botten', {k: len(v) for k, v in uit['acties'].items()}, flush=True)
    if len(argv) > 1:
        ander = json.load(open(argv[1], encoding='utf-8'))
        botten = sum(uit['botten'].get(k) != v for k, v in ander['botten'].items()) + len(set(uit['botten']) ^ set(ander['botten']))
        kanalen = {k: sum(uit['acties'].get(k, {}).get(c) != w for c, w in v.items()) for k, v in ander['acties'].items()}
        print('VERGELIJK botten anders', botten, 'kanalen anders', kanalen, 'kanalen totaal', {k: len(v) for k, v in ander['acties'].items()}, flush=True)


if __name__ == '__main__':
    hoofd()
