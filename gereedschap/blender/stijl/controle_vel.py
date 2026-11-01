# De automatische controle van de vellen (vraag 192): maat, doorzichtigheid, anker, richtingen en de kleur van de tabberd. Wat er bij een
# verkeerde render of een verschoven figuur misgaat, is hier meetbaar; of het mooi is, niet.
#
#   python controle_vel.py <map met vellen> <uit.json> <naam> <houding> ...     (de Python van ComfyUI; code 1 bij een fout)
import json
import os
import sys

import numpy as np
from PIL import Image

RICHT = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']


def main():
    kaart, uit, naam, *houdingen = sys.argv[1:]
    r = []

    def toets(t, ok, waarde=None):
        r.append({'naam': t, 'ok': bool(ok), 'waarde': waarde})

    for h in houdingen:
        g = json.load(open(os.path.join(kaart, f'{naam}-{h}.json'), encoding='utf-8'))
        v = Image.open(os.path.join(kaart, g['bestand']))
        a = np.asarray(v.convert('RGBA'))
        cb, ch = g['cel']
        toets(f'{h}: maat van het vel past op cel, beelden en richtingen', v.size == (cb * g['beelden'], ch * len(g['richtingen'])), list(v.size))
        toets(f'{h}: alle acht richtingen', g['richtingen'] == RICHT, g['richtingen'])
        al = a[..., 3]
        toets(f'{h}: de doorzichtigheid is scherp (alleen 0 en 255)', set(np.unique(al).tolist()) <= {0, 255}, np.unique(al).tolist()[:6])
        toets(f'{h}: de hoeken van het vel zijn doorzichtig', al[0, 0] == 0 and al[-1, -1] == 0)
        ax, ay = g['anker']
        toets(f'{h}: het anker ligt in de cel', 0 <= ax < cb and 0 <= ay < ch, g['anker'])
        leeg, randen, voeten, hoogtes = 0, 0, [], []
        beelden_per_richting = []
        for j in range(len(g['richtingen'])):
            rij = []
            for i in range(g['beelden']):
                c = a[j * ch:(j + 1) * ch, i * cb:(i + 1) * cb]
                m = c[..., 3] > 0
                if not m.any():
                    leeg += 1
                    continue
                ys = np.where(m.any(1))[0]
                xs = np.where(m.any(0))[0]
                if xs.min() == 0 or xs.max() == cb - 1 or ys.min() == 0 or ys.max() == ch - 1:
                    randen += 1
                voeten.append(float(ys.max()))
                hoogtes.append(float(ys.max() - ys.min() + 1))
                rij.append(c)
            beelden_per_richting.append(rij)
        toets(f'{h}: geen leeg beeld', leeg == 0, leeg)
        toets(f'{h}: niets raakt de rand van de cel', randen == 0, randen)
        # het voetpunt: de onderkant van de figuur ligt rond het anker en springt niet
        toets(f'{h}: de voeten blijven rond het anker (binnen 16 px)', max(abs(y - ay) for y in voeten) <= 16, round(max(abs(y - ay) for y in voeten), 1))
        # de richtingen zijn echt verschillend
        eerste = [rij[0][..., :4].astype(int) for rij in beelden_per_richting]
        versch = min(float(np.abs(eerste[p] - eerste[q]).mean()) for p in range(8) for q in range(p + 1, 8))
        toets(f'{h}: acht verschillende beelden', versch > 1.0, round(versch, 2))
        if h == 'lopen':
            # beelden achter elkaar verschillen, maar niet met sprongen
            for j, rij in enumerate(beelden_per_richting):
                d = [float(np.abs(rij[i].astype(int) - rij[(i + 1) % len(rij)].astype(int)).mean()) for i in range(len(rij))]
                toets(f'lopen {RICHT[j]}: het beweegt, zonder sprong', min(d) > 0.3 and max(d) < 3 * np.median(d), [round(min(d), 2), round(max(d), 2)])
        # de tabberd: blauw en geel allebei in beeld, in elke richting, in een redelijk deel van de figuur
        for j, rij in enumerate(beelden_per_richting):
            c = rij[0]
            m = c[..., 3] > 0
            rgb = c[..., :3].astype(float)
            blauw = (rgb[..., 2] > rgb[..., 0] * 1.5) & (rgb[..., 2] > 90) & m
            geel = (rgb[..., 0] > 160) & (rgb[..., 1] > 110) & (rgb[..., 2] < 90) & m
            pb, pg = blauw.sum() / m.sum(), geel.sum() / m.sum()
            toets(f'{h} {RICHT[j]}: blauw en geel leesbaar (elk minstens 2 procent)', pb > 0.02 and pg > 0.02, [round(pb, 3), round(pg, 3)])
    fout = [x for x in r if not x['ok']]
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump({'toetsen': len(r), 'fout': len(fout), 'details': r}, f, indent=1)
    print(f'CONTROLE {len(r) - len(fout)} van {len(r)} goed')
    for x in fout:
        print('FOUT', x['naam'], x['waarde'])
    sys.exit(1 if fout else 0)


if __name__ == '__main__':
    main()
