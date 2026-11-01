# De beweging van V4 uitlezen voor een mesh uit Hunyuan3D-2mv: per beeld van staan en lopen de stand van elk bot, als getallen. Er verandert niets aan V4: pose4 werkt in dit proces.
#
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b <speerman-v4.blend> -P hy_v4_pose.py -- <uit.npz>
import math
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


# Geraakt worden (Marcel, 26 okt: "Geraakt worden is akkoord"; de tabel van `bakken.py`): drie beelden vanuit staan, naar achteren ten opzichte van waar hij kijkt. Per beeld: hoe ver het bovenlijf achterover gaat (graden), hoe ver de linkervoet terugschuift en hoe ver hij door de knieën zakt (meter).
GERAAKT = {'leun': (12, 18, 6), 'stap': (0.0, 0.06, 0.03), 'zakken': (0.01, 0.025, 0.01)}
# Sterven (Marcel, 26 okt: "op zn knieën valt en dan zijn hoofd naar de grond laat vallen op zn gezicht", en "Hij moet een beetje plat komen te liggen nu is het meer een propje"): de tabel van `bakken.py`, op deze korte benen. Per beeld: hoe ver het lijf vanuit de heupen voorover valt en de rug krult (graden; negatief is de klap), waar het bekken is, waar de enkels zijn en hoe de voet staat (eerst op de tenen, liggend de tenen naar achteren), hoe de knie wijst, en hoe het hoofd buigt.
STERVEN = {
    'leun': (-8, 0, 5, 30, 60, 85, 88),
    'rug': (0, 0, 5, 10, 10, 5, 0),
    'bekken_z': (0.43, 0.33, 0.22, 0.21, 0.19, 0.13, 0.12),
    'bekken_y': (0.0, 0.02, 0.06, 0.06, 0.02, -0.08, -0.10),
    'enkel_y': (0.0, 0.06, 0.16, 0.18, 0.22, 0.25, 0.24),
    'voet_y': (1, 1, 1, 1, 1, 0, 0),  # staand zijn de voeten verspringend; liggend gestrekt achter hem
    'draai': (0, 0, 4, 10, 16, 22, 22),  # hij valt iets schuin: recht naar de camera of ervan af is hij anders een propje, en 22 graden houdt in alle acht richtingen zijn lengte in beeld
    'rok_a': (0, 0, 0, 0, 5, 10, 10),  # de achterkant van de rok valt op de dijen, anders kijk je er liggend onder
    'enkel_z': (0.08, 0.126, 0.205, 0.205, 0.2, 0.14, 0.11),
    'kantel': (0, 15, 60, 70, 80, 115, 130),
    'knie': (0, 20, 65, 70, 80, 88, 88),
    'hoofd': (-6, 8, 25, 20, 10, -10, -15),
    'spreid': (0.0, 0.0, 0.0, 0.0, 0.0, 0.06, 0.09),  # liggend de benen wat uit elkaar (Marcel: "Bij NO vallen benen iets wijder")
}


def rok_bij_bekken(h, rok_a=0.0):
    """Als B.stand_rok, maar de hoek van de dij ten opzichte van het bekken: dat kantelt hier, tot plat op de grond."""
    D = h.delta['bekken']
    hoeken = []
    for n in ('.R', '.L'):
        d = D.T @ h.as_('dij' + n, 1)
        hoeken.append(math.degrees(math.atan2(-d[1], -d[2])))
    voor, achter = max(0.0, *hoeken), min(0.0, *hoeken)
    h.zet('buidel', D @ S.rx(math.radians(-(voor + achter) * 0.25)))
    h.zet('rok.V', D @ S.rx(math.radians(-voor * 0.4)))
    h.zet('rok.A', D @ S.rx(math.radians(-achter * 0.4 - rok_a)))


def armen_en_speer(h, speer_draai, richting=(0.02, -0.02, 1.0)):
    """De armen alleen zodat elk bot een stand heeft: hy_rig zet ze zelf. De speer wel: zijn richting telt zolang hij in de hand is."""
    greep = np.array([P4.GREEP[0], P4.GREEP[1], P4.GREEP[2] + S.E])
    richting = S._n(richting)
    B.speer_stand(h, greep, richting, speer_draai)
    P4.hand_recht(h, -1, greep, richting, (-0.45, 0.8, -0.7))
    C = np.array([P4.HAND_L[0], P4.HAND_L[1], P4.HAND_L[2] + S.E])
    P4.hand_recht(h, 1, C, S._n([-0.3, 0.05, 1.0]), (0.42, 0.82, -0.6), buig=8.0, vrij=True)


def geraakt2(rust, t, speer_draai=0.0):
    i = int(round(t * len(GERAAKT['leun'])))
    leun, stap, zak = GERAAKT['leun'][i], GERAAKT['stap'][i], GERAAKT['zakken'][i]
    h = S.Houding(rust)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(1.0, -2.6, 6.0), rust.kop['bekken'] + np.array([P4.BEKKEN[0], P4.BEKKEN[1], P4.BEKKEN[2] - zak]))
    h.rel('rug', S.euler(1.5 - 0.4 * leun, 1.4, -3.5))
    h.rel('borst', S.euler(0.5 - 0.6 * leun, 1.0, -3.0))
    h.rel('nek', S.euler(-2.0, 0.0, 0.5))
    h.rel('hoofd', S.euler(-3.0 - 0.3 * leun, 0.0, 0.0))
    B.stand_benen(h, {
        -1: (np.array([P4.VOET_VRIJ[0], P4.VOET_VRIJ[1], rust.kop['voet.R'][2]]), 0.0, -14.0, 0.0, np.array([-0.45, -1.0, 0.0])),
        1: (np.array([P4.VOET_STAND[0], P4.VOET_STAND[1] + stap, rust.kop['voet.L'][2]]), 0.0, 10.0, 0.0, np.array([0.2, -1.0, 0.0])),
    })
    B.stand_rok(h)
    P4.zet_rok_botten(h)
    # de speer zwiept met het lijf mee, de top naar achteren; zijn onderkant blijft op de grond
    armen_en_speer(h, speer_draai, (0.02, -0.02 + 0.012 * leun, 1.0))
    return h


def sterven2(rust, t, speer_draai=0.0):
    i = int(round(t * len(STERVEN['leun'])))
    T_ = {k: v[i] for k, v in STERVEN.items()}
    h = S.Houding(rust)
    h.zet('wortel', np.eye(3))
    h.zet('bekken', S.euler(T_['leun'], 0.0, T_['draai']), np.array([0.0, T_['bekken_y'], T_['bekken_z']]))
    h.rel('rug', S.euler(T_['rug'] * 0.5, 0.0, 0.0))
    h.rel('borst', S.euler(T_['rug'] * 0.5, 0.0, 0.0))
    h.rel('nek', S.euler(0.0, 0.0, 0.0))
    h.rel('hoofd', S.euler(T_['hoofd'], 0.0, 0.0))
    knie = math.radians(T_['knie'])
    Rz = S.rz(math.radians(T_['draai']))
    bk = np.array([0.0, T_['bekken_y'], 0.0])
    B.stand_benen(h, {
        s: (bk + Rz @ (np.array([x + s * T_['spreid'], y * T_['voet_y'] + T_['enkel_y'], T_['enkel_z']]) - bk), T_['kantel'], s * 12.0 + T_['draai'], 0.0, Rz @ np.array([s * 0.3, -math.cos(knie), -math.sin(knie)]))
        for s, x, y in ((-1, P4.VOET_VRIJ[0], P4.VOET_VRIJ[1]), (1, P4.VOET_STAND[0], P4.VOET_STAND[1]))
    })
    rok_bij_bekken(h, T_['rok_a'])
    P4.zet_rok_botten(h)
    armen_en_speer(h, speer_draai)
    return h


P4.zet_aan(True)
B.HOUDING['steek2'] = steek2
B.HOUDING['schiet'] = schiet
B.HOUDING['geraakt2'] = geraakt2
B.HOUDING['sterven2'] = sterven2
uit = sys.argv[sys.argv.index('--') + 1]
arm_ = bpy.data.objects['skelet']
if arm_.animation_data:
    arm_.animation_data.action = None
rust = F.rust_van(arm_)
namen = [b.name for b in arm_.data.bones]
ouders = [b.parent.name if b.parent else '' for b in arm_.data.bones]
R0 = np.array([np.array(arm_.data.bones[n].matrix_local) for n in namen])
res = {'namen': np.array(namen), 'ouders': np.array(ouders), 'rust': R0}
for houding, beelden in (('staan', 4), ('lopen', 12), ('steek2', 24), ('schiet', 24), ('geraakt2', len(GERAAKT['leun'])), ('sterven2', len(STERVEN['leun']))):
    rij = []
    for i in range(beelden):
        B.zet(arm_, rust, houding, i / beelden, 0.0)
        bpy.context.view_layer.update()
        rij.append([np.array(arm_.pose.bones[n].matrix) for n in namen])
    res[houding] = np.array(rij)
np.savez_compressed(uit, **res)
print('KLAAR', {k: v.shape for k, v in res.items()})
