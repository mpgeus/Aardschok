# De automatische controle van het model (vraag 192): onderdelen, verf, gewichten, skelet en beweging, in Blender, en wat er bij een
# fout zou misgaan is meetbaar: een voet die glijdt, een hand die de speer loslaat, een speer die krom trekt. Wat mooi is, meet dit niet.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/controle_model.py -- <uit.json>      (eindigt met code 1 bij een fout)
import json
import math
import os
import sys

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import beweging as B  # noqa: E402
import figuur as F  # noqa: E402
import skelet as S  # noqa: E402

DELEN = ['lijf', 'hoofd', 'baard', 'helm', 'kap', 'gambeson', 'tabberd', 'riem', 'buidel', 'hozen', 'laarzen', 'handschoenen', 'speer']
ATTRIBUTEN = ['verf', 'ruwheid', 'metaal', 'stof', 'spiegel', 'contact', 'bol']
BEELDEN = 24


def main():
    uit = sys.argv[sys.argv.index('--') + 1]
    r = []

    def toets(naam, ok, waarde=None):
        r.append({'naam': naam, 'ok': bool(ok), 'waarde': waarde})

    arm_ = bpy.data.objects['skelet']
    # onderdelen en verf
    for d in DELEN:
        ob = bpy.data.objects.get(d)
        toets(f'onderdeel {d} bestaat', ob is not None)
        if not ob:
            continue
        m = ob.data
        toets(f'{d}: één shader', [x.name for x in m.materials] == ['Stijl'])
        ontbreekt = [a for a in ATTRIBUTEN if a not in m.attributes]
        toets(f'{d}: alle verf aanwezig', not ontbreekt, ontbreekt)
        co = np.zeros(len(m.vertices) * 3)
        m.vertices.foreach_get('co', co)
        toets(f'{d}: geen kapotte punten', np.isfinite(co).all())
        c = np.zeros(len(m.vertices) * 4, dtype=np.float32)
        m.color_attributes['verf'].data.foreach_get('color', c)
        toets(f'{d}: verf zonder fouten', np.isfinite(c).all() and c.max() <= 1.0 and c.min() >= 0.0)
        # de gewichten: elk punt aan een bot, opgeteld 1, hooguit 4
        groepen = {g.index: g.name for g in ob.vertex_groups}
        onbekend = [n for n in groepen.values() if n not in arm_.data.bones]
        toets(f'{d}: groepen horen bij het skelet', not onbekend, onbekend)
        som = np.zeros(len(m.vertices))
        meest = 0
        for v in m.vertices:
            s = sum(g.weight for g in v.groups)
            som[v.index] = s
            meest = max(meest, len(v.groups))
        toets(f'{d}: gewichten tellen op tot 1', abs(som - 1).max() < 0.02, round(float(abs(som - 1).max()), 4))
        toets(f'{d}: hooguit 4 botten per punt', meest <= 4, meest)
    # verhouding
    lengte = float(arm_.get('lengte', 0))
    toets('lengte tussen 1,2 en 1,8 m', 1.2 < lengte < 1.8, round(lengte, 3))
    speer = bpy.data.objects['speer']
    z = np.array([v.co.z for v in speer.data.vertices])
    verh = float((z.max() - z.min()) / lengte)
    toets('speer 1,3 keer de lengte (1,25 tot 1,35)', 1.25 < verh < 1.35, round(verh, 3))
    # de beweging
    rust = F.rust_van(arm_)
    grip = np.array(S.GREEP) * S.HAND_SCHAAL
    for houding in ('staan', 'lopen'):
        afst, spl = [], []
        voet = {'.L': [], '.R': []}
        for i in range(BEELDEN):
            t = i / BEELDEN
            h = B.HOUDING[houding](rust, t)
            M = h.matrices()
            # de hand op de speer: het gat in de vuist ligt op de as van de speer
            hand = M['hand.R'][:3, :3] @ grip + M['hand.R'][:3, 3]
            as_ = M['speer'][:3, 1]
            d = hand - M['speer'][:3, 3]
            afst.append(float(np.linalg.norm(d - as_ * (d @ as_))))
            spl.append(float(np.linalg.norm(as_)))
            for z_ in voet:
                voet[z_].append(h.kop['voet' + z_].copy())
            # de benen halen het doel: geen gestrekt been dat de voet optilt
        toets(f'{houding}: de rechterhand zit op de speer (< 2 mm)', max(afst) < 0.002, round(max(afst), 5))
        toets(f'{houding}: de speer blijft recht en even lang', abs(max(spl) - min(spl)) < 1e-6)
        if houding == 'staan':
            for z_, p in voet.items():
                p = np.array(p)
                toets(f'staan: voet{z_} staat stil (< 1 mm)', np.ptp(p, axis=0).max() < 0.001, round(float(np.ptp(p, axis=0).max()), 5))
        else:
            # de standvoet schuift gelijkmatig met de wereld mee: vaste snelheid in de vlakke fase
            for z_, p in voet.items():
                p = np.array(p)
                f = 0.0 if z_ == '.R' else 0.5
                pas = 0.135 + 0.42 * S.E
                snel = []
                for i in range(BEELDEN):
                    t = ((i / BEELDEN) + f) % 1.0
                    t2 = (((i + 1) / BEELDEN) + f) % 1.0
                    u, u2 = t / 0.58, t2 / 0.58
                    if 0.14 < u < 0.68 and 0.14 < u2 < 0.68:
                        snel.append((p[(i + 1) % BEELDEN][1] - p[i][1]) * BEELDEN)
                gewenst = 2 * pas / 0.58
                fout = max(abs(s - gewenst) for s in snel)
                toets(f'lopen: voet{z_} glijdt niet (afwijking < 2 cm/cyclus)', fout < 0.02, round(float(fout), 4))
            # echt om en om
            yl, yr = np.array(voet['.L'])[:, 1], np.array(voet['.R'])[:, 1]
            toets('lopen: de benen wisselen af', np.corrcoef(yl, yr)[0, 1] < -0.5, round(float(np.corrcoef(yl, yr)[0, 1]), 3))
    # acties in het bestand
    for a in ('staan', 'lopen'):
        toets(f'actie {a} in het bestand', a in bpy.data.actions)
    fout = [x for x in r if not x['ok']]
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump({'toetsen': len(r), 'fout': len(fout), 'details': r}, f, indent=1)
    print(f'CONTROLE {len(r) - len(fout)} van {len(r)} goed', flush=True)
    for x in fout:
        print('FOUT', x['naam'], x['waarde'], flush=True)
    sys.exit(1 if fout else 0)


if __name__ == '__main__':
    main()
