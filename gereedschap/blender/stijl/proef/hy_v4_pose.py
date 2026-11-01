# De beweging van V4 uitlezen voor een mesh uit Hunyuan3D-2mv: per beeld van staan en lopen de stand van elk bot, als getallen. Er verandert niets aan V4: pose4 werkt in dit proces.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b <speerman-v4.blend> -P hy_v4_pose.py -- <uit.npz>
import os
import sys

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import pose4 as P4  # noqa: E402
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import skelet as S  # noqa: E402


def _zacht(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3.0 - 2.0 * x)


def steek2(rust, t, speer_draai=0.0):
    """De steek met twee handen (Marcel, 1 nov: "buigt hij iets door, zet hij door, en pakt hij de speer met 2 handen vast"): alleen lijf en benen tellen, de armen en de speer komen uit hy_rig. De linkerschouder draait naar voren en de linkervoet stapt uit, de knieën buigen, en het lijf gaat erachteraan."""
    v = _zacht(t / 0.28) * (1.0 - _zacht((t - 0.66) / 0.3))
    u = _zacht((t - 0.22) / 0.22) * (1.0 - _zacht((t - 0.6) / 0.32))
    h = S.Houding(rust)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0 + 9.0 * u, -2.0, 6.0 - 18.0 * v), rust.kop['bekken'] + np.array([0.02, 0.004 + 0.03 * v - 0.08 * u, -0.022 - 0.035 * v - 0.03 * u]))
    h.rel('rug', S.euler(1.5 + 4.0 * u, 1.0, -6.0 * v))
    h.rel('borst', S.euler(0.5 + 4.0 * u, 1.0, -6.0 * v))
    h.rel('nek', S.euler(-2.0 - 6.0 * u, 0.0, 9.0 * v))
    h.rel('hoofd', S.euler(-3.0 - 7.0 * u, 0.0, 12.0 * v))
    B.stand_benen(h, {
        -1: (np.array([P4.VOET_VRIJ[0], P4.VOET_VRIJ[1] + 0.12 * v, rust.kop['voet.R'][2]]), 0.0, -22.0, 0.0, np.array([-0.45, -1.0, 0.0])),
        1: (np.array([P4.VOET_STAND[0], P4.VOET_STAND[1] - 0.17 * v, rust.kop['voet.L'][2]]), 0.0, 6.0, 0.0, np.array([0.2, -1.0, 0.0])),
    })
    B.stand_rok(h)
    P4.zet_rok_botten(h)
    # de armen en de speer alleen zodat elk bot een stand heeft; hy_rig zet ze zelf
    greep = np.array([P4.GREEP[0], P4.GREEP[1], P4.GREEP[2] + S.E])
    richting = S._n([0.02, -0.02, 1.0])
    B.speer_stand(h, greep, richting, speer_draai)
    P4.hand_recht(h, -1, greep, richting, (-0.45, 0.8, -0.7))
    C = np.array([P4.HAND_L[0], P4.HAND_L[1], P4.HAND_L[2] + S.E])
    P4.hand_recht(h, 1, C, S._n([-0.3, 0.05, 1.0]), (0.42, 0.82, -0.6), buig=8.0, vrij=True)
    return h


def schiet(rust, t, speer_draai=0.0):
    """Schieten: de linkerschouder naar het doel, de voeten uit elkaar, het hoofd kijkt recht vooruit. Alleen lijf en benen tellen, de armen en de boog komen uit hy_splat."""
    v = _zacht(t / 0.25) * (1.0 - _zacht((t - 0.74) / 0.24))
    h = S.Houding(rust)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0, -2.0, 6.0 - 26.0 * v), rust.kop['bekken'] + np.array([0.02, 0.004, -0.022 - 0.02 * v]))
    h.rel('rug', S.euler(1.5, 1.0, -8.0 * v))
    h.rel('borst', S.euler(0.5, 1.0, -8.0 * v))
    h.rel('nek', S.euler(-2.0, 0.0, 14.0 * v))
    h.rel('hoofd', S.euler(-3.0, 0.0, 22.0 * v))
    B.stand_benen(h, {
        -1: (np.array([P4.VOET_VRIJ[0], P4.VOET_VRIJ[1] + 0.12 * v, rust.kop['voet.R'][2]]), 0.0, -22.0, 0.0, np.array([-0.45, -1.0, 0.0])),
        1: (np.array([P4.VOET_STAND[0], P4.VOET_STAND[1] - 0.12 * v, rust.kop['voet.L'][2]]), 0.0, 6.0, 0.0, np.array([0.2, -1.0, 0.0])),
    })
    B.stand_rok(h)
    P4.zet_rok_botten(h)
    greep = np.array([P4.GREEP[0], P4.GREEP[1], P4.GREEP[2] + S.E])
    richting = S._n([0.02, -0.02, 1.0])
    B.speer_stand(h, greep, richting, speer_draai)
    P4.hand_recht(h, -1, greep, richting, (-0.45, 0.8, -0.7))
    C = np.array([P4.HAND_L[0], P4.HAND_L[1], P4.HAND_L[2] + S.E])
    P4.hand_recht(h, 1, C, S._n([-0.3, 0.05, 1.0]), (0.42, 0.82, -0.6), buig=8.0, vrij=True)
    return h


P4.zet_aan(True)
B.HOUDING['steek2'] = steek2
B.HOUDING['schiet'] = schiet
uit = sys.argv[sys.argv.index('--') + 1]
arm_ = bpy.data.objects['skelet']
if arm_.animation_data:
    arm_.animation_data.action = None
rust = F.rust_van(arm_)
namen = [b.name for b in arm_.data.bones]
ouders = [b.parent.name if b.parent else '' for b in arm_.data.bones]
R0 = np.array([np.array(arm_.data.bones[n].matrix_local) for n in namen])
res = {'namen': np.array(namen), 'ouders': np.array(ouders), 'rust': R0}
for houding, beelden in (('staan', 4), ('lopen', 12), ('steek2', 24), ('schiet', 24)):
    rij = []
    for i in range(beelden):
        B.zet(arm_, rust, houding, i / beelden, 0.0)
        bpy.context.view_layer.update()
        rij.append([np.array(arm_.pose.bones[n].matrix) for n in namen])
    res[houding] = np.array(rij)
np.savez_compressed(uit, **res)
print('KLAAR', {k: v.shape for k, v in res.items()})
