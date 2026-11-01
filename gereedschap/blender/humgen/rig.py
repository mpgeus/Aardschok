# Het skelet van een basismens in een bestand (Marcel, 29 okt, ronde 9: "Vergelijk deze rig met de bestaande
# Aardschok-rig"): per bot de ouder, of het vervormt, de lengte, de kop en de staart (rust, meter) en de rol; voor de
# HumGen-man en de procedurele basismens met hetzelfde script, zodat ze naast elkaar kunnen.
#
#   blender.exe -b <blend> -P gereedschap/blender/humgen/rig.py -- <uit.json>
import json
import math
import sys

import bpy

uit = sys.argv[sys.argv.index('--') + 1]
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
botten = []
for b in rig.data.bones:
    botten.append({'naam': b.name, 'ouder': b.parent.name if b.parent else None, 'vervormt': b.use_deform,
                   'lengte': round(b.length, 4), 'kop': [round(c, 4) for c in b.head_local], 'staart': [round(c, 4) for c in b.tail_local],
                   'y_as': [round(c, 3) for c in b.matrix_local.to_3x3().col[1]], 'x_as': [round(c, 3) for c in b.matrix_local.to_3x3().col[0]]})
json.dump({'skelet': rig.name, 'botten': botten, 'aantal': len(botten), 'vervormend': sum(b['vervormt'] for b in botten)},
          open(uit, 'w', encoding='utf-8'), indent=1)
print('RIG', rig.name, len(botten))
