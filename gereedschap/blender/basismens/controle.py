# De basismens, stap 5: de controles. Leest het model (het .blend), en wat de stappen ervoor bewaarden (bouw.json,
# renders.json, export.json, de atlas en de beelden), en schrijft per controle of hij slaagt, met de waarde en wat
# verwacht werd, naar rapport.json. Bij een controle die zakt, eindigt Blender met code 1.
# De soldaat (ronde 3): de controles op zijn model komen uit soldaat_controle.py (soldaat-controle.json); hier de rest,
# uit soldaat.json, soldaat-renders.json, export-soldaat.json en de beelden.
#
#   blender.exe -b <uit>/bron/basismens.blend -P gereedschap/blender/basismens/controle.py
import datetime
import hashlib
import json
import math
import os
import subprocess
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector
from mathutils.kdtree import KDTree

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import variant  # noqa: E402
from variant import INST, UIT, WORTEL  # noqa: E402  (de instellingen en de map van de variant)
CAM = INST['camera']
LIJST = INST['richtingen']['lijst']
CONTROLES = []


def toets(naam, geslaagd, waarde, verwacht, toelichting=''):
    CONTROLES.append({'naam': naam, 'geslaagd': bool(geslaagd), 'waarde': waarde, 'verwacht': verwacht,
                      'toelichting': toelichting})
    print(('OK   ' if geslaagd else 'FOUT ') + naam, '|', waarde, '| verwacht', verwacht)


def lees(naam):
    pad = os.path.join(UIT, naam)
    return json.load(open(pad, encoding='utf-8')) if os.path.exists(pad) else None


def punten(ob):
    deps = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(deps)
    me = e.to_mesh()
    uit = [ob.matrix_world @ v.co for v in me.vertices]
    e.to_mesh_clear()
    return uit


def beeld(pad):
    """Een PNG als rij pixels (hoog, breed, 4), van boven naar onder, met 0 tot 1."""
    img = bpy.data.images.load(pad, check_existing=False)
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    kanalen = img.channels
    bpy.data.images.remove(img)
    return px.reshape(h, w, 4)[::-1], kanalen


def mesh_heel(ob):
    """Open randen, randen aan meer dan twee vlakken, losse punten en randen, vlakken zonder oppervlak, dubbele punten,
    normalen die naar binnen wijzen, en vlakken zonder uv-oppervlak."""
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    open_ = sum(1 for e in bm.edges if len(e.link_faces) == 1)
    meer = sum(1 for e in bm.edges if len(e.link_faces) > 2)
    los = sum(1 for v in bm.verts if not v.link_edges) + sum(1 for e in bm.edges if not e.link_faces)
    plat = sum(1 for f in bm.faces if f.calc_area() < 1e-10)
    kd = KDTree(len(bm.verts))
    for v in bm.verts:
        kd.insert(v.co, v.index)
    kd.balance()
    dubbel = sum(1 for v in bm.verts if len(kd.find_range(v.co, 1e-5)) > 1)
    voor = [f.normal.copy() for f in bm.faces]
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    om = sum(1 for f, n in zip(bm.faces, voor) if f.normal.dot(n) < 0)
    uv = bm.loops.layers.uv.active
    zonder_uv = 0
    if uv is not None:
        for f in bm.faces:
            a = [l[uv].uv for l in f.loops]
            opp = 0.5 * abs(sum(a[i].x * a[(i + 1) % len(a)].y - a[(i + 1) % len(a)].x * a[i].y for i in range(len(a))))
            zonder_uv += opp < 1e-9
    n = len(bm.faces)
    bm.free()
    return {'open_randen': open_, 'meer_dan_twee_vlakken': meer, 'los': los, 'plat': plat, 'dubbel': dubbel,
            'normalen_binnen': om, 'uv': uv is not None, 'zonder_uv': zonder_uv, 'vlakken': n}


def richtingen_toetsen(lijst, map_r, map_c, erbij, grens=15):
    """De acht richtingen van een houding: acht namen en draaien, acht verschillende beelden, de kijkrichting op het
    scherm; de eindrenders gelijk aan de controle; en links en rechts met de rode band."""
    namen_r = [r['naam'] for r in LIJST]
    draaien = [r['draai'] % 360 for r in LIJST]
    paden = [os.path.join(UIT, map_r, f'richting-{n}.png') for n in namen_r]
    bestaan = all(os.path.exists(p) for p in paden)
    hashes = [hashlib.md5(open(p, 'rb').read()).hexdigest() for p in paden] if bestaan else []
    hoeken = {r['naam']: (r['kijkt_scherm'], r['verwacht_scherm']) for r in lijst}
    hoek_fout = {n: v for n, v in hoeken.items() if abs((v[0] - v[1] + 180) % 360 - 180) > 25}
    toets('acht unieke richtingen' + erbij, len(namen_r) == 8 and len(set(namen_r)) == 8 and len(set(draaien)) == 8 and bestaan
          and len(set(hashes)) == 8 and len(hoeken) == 8 and not hoek_fout,
          {'richtingen': namen_r, 'draai': [r['draai'] for r in LIJST], 'verschillende_beelden': len(set(hashes)),
           'kijkt_scherm_tegen_verwacht': hoeken},
          'acht namen en draaien, acht verschillende beelden, en hij kijkt op het scherm binnen 25 graden van zijn richting',
          'de schuine richtingen schelen 15 tot 18 graden: de camera verkort de diepte (sin elevatie)')
    # links en rechts in de renders: de rode band ligt bij zijn rechterarm, niet waar een gespiegelde linkerarm lag
    uitslag, zichtbaar = {}, 0
    for r in lijst:
        m = r.get('markering')
        if not m or m['gevonden'] is None or m['pixels'] < 20:
            uitslag[r['naam']] = 'achter het lijf'
            continue
        zichtbaar += 1
        d_r = math.dist(m['gevonden'], m['verwacht'])
        d_s = math.dist(m['gevonden'], m['gespiegeld'])
        uitslag[r['naam']] = {'afstand_rechts': round(d_r, 1), 'afstand_gespiegeld': round(d_s, 1), 'goed': d_r < grens and d_r < d_s}
    # en de eindrenders zijn dezelfde beelden als de controle (de omtrek valt samen, op de band na)
    samen = {}
    for n in namen_r if bestaan else []:
        a, _ = beeld(os.path.join(UIT, map_r, f'richting-{n}.png'))
        c_, _ = beeld(os.path.join(UIT, map_c, f'markering-{n}.png'))
        band = (c_[:, :, 0] > 0.75) & (c_[:, :, 1] < 0.3) & (c_[:, :, 2] < 0.3)
        x, y = (a[:, :, 3] > 0.5) & ~band, (c_[:, :, 3] > 0.5) & ~band
        samen[n] = round(float((x & y).sum() / max(1, (x | y).sum())), 4)
    toets('eindrenders gelijk aan de controle' + erbij, samen and min(samen.values()) > 0.97, samen,
          'per richting valt de omtrek van de eindrender voor meer dan 0,97 samen met die van de controlerender')
    toets('links en rechts in de renders' + erbij, zichtbaar >= 6 and all(u['goed'] for u in uitslag.values() if isinstance(u, dict)),
          uitslag, f'de band om de rechterarm binnen {grens} pixels van waar hij hoort, en nooit op de plek van een gespiegelde arm',
          '' if grens == 15 else 'bij de soldaat is de band wijder (om de mouw) en valt hij in ZW en NW half achter het lijf: '
          'het midden van wat je ziet, schuift dan op')


def soldaat(botten):
    """De controles van de soldaat (ronde 3)."""
    so, r, e = lees('soldaat.json'), lees('soldaat-renders.json'), lees('export-soldaat.json')
    model = lees('soldaat-controle.json')
    if model:
        CONTROLES.extend(model)
    else:
        toets('soldaat: het model', False, None, 'soldaat-controle.json (soldaat_controle.py)')
    # de camera op 30 graden (2:1), en de acht richtingen met links en rechts, zoals de basismens
    c = r['camera'] if r else {}
    toets('soldaat: camera', r and c['type'] == 'ORTHO' and abs(c['elevatie'] - 30) < 1e-6 and abs(CAM['elevatie'] - 30) < 1e-6
          and abs(c['ortho_schaal'] - INST['soldaat']['camera']['hoog'] / CAM['pixels_per_meter']) < 1e-6,
          {k: c.get(k) for k in ('type', 'elevatie', 'ortho_schaal', 'breed', 'hoog', 'anker')},
          'orthografisch, 30 graden (de 2:1-tegels van het spel), dezelfde schaal als de basismens, een hoger beeld voor de speer')
    richtingen_toetsen(r['richtingen'] if r else [], os.path.join('soldaat', 'renders'), os.path.join('soldaat', 'controle'), ' (soldaat)', 25)
    # geen doorsteek in de idle: van wat onder een laag erboven hoort, zie je (bijna) niets; en de toets ziet wel iets als
    # de tabberd er niet is
    d = r['doorsteek'] if r else {}
    per = {k: x['pixels'] for k, x in d.items() if k != 'tegenproef_zonder_tabberd'}
    lijf = {k: x.get('lijf_pixels') for k, x in d.items() if k != 'tegenproef_zonder_tabberd'}
    tegen = d.get('tegenproef_zonder_tabberd', {}).get('pixels', 0)
    toets('soldaat: geen doorsteek in de idle', len(per) == 8 and max(per.values()) <= 5 and max(lijf.values()) <= 10 and tegen > 1000,
          {'kleren_pixels_per_richting': per, 'lijf_pixels_per_richting': lijf, 'tegenproef_zonder_tabberd': tegen},
          'per richting hooguit 5 pixels (van zo\'n 45.000) van kleren die onder een laag erboven horen, en hooguit 10 van de '
          'huid onder de kleren; zonder de tabberd ziet dezelfde toets de gambeson eronder (meer dan 1000 pixels)',
          'van het lijf is alleen over wat je ergens ziet; wat je daarvan in de idle nog ziet, is bovenin de kraag de hals')
    # geen verborgen lijf: wat onder de kleren ligt en je nooit ziet, is weg
    lv = so['lijf_vlakken'] if so else {}
    lz = r['lijf_zichtbaar'] if r else {}
    toets('soldaat: lijf onder de kleren weg', so and lv['weg'] / lv['voor'] >= 0.5 and lv['over'] == lz.get('vlakken'),
          lv | {'gezien_in_de_acht_richtingen': lz.get('ooit_gezien')},
          'weg wat onder een laag ligt en je in geen van 48 renders ziet (de idle en de rust, acht richtingen, 0, 30 en 60 '
          'graden); wat over is, is het hoofd en de hals, met een strook langs de randen van de kleren (over_onder_de_kleren)')
    # op spelmaat
    p = os.path.join(UIT, 'soldaat', 'spelmaat', 'zonder-speer-Z.png')
    hoog = None
    if os.path.exists(p):
        a_ = beeld(p)[0][:, :, 3] > 0.5
        ys = np.nonzero(a_.any(axis=1))[0]
        hoog = int(ys.max() - ys.min() + 1)
    toets('soldaat: spelmaat', hoog is not None and abs(hoog - INST['spelmaat']['hoogte']) <= 1, {'hoogte_Z_zonder_speer_px': hoog},
          f"de man in Z (zonder speer) {INST['spelmaat']['hoogte']} pixels hoog, op 1 pixel, zoals de speerman in het spel")
    # de GLB van de soldaat, naast die van de basismens
    m = (e or {}).get('meshes', {})
    kleren = {'lijf'} | set(variant.KLEREN)
    keten = (e or {}).get('speer_aan', [])
    toets('soldaat: GLB opnieuw ingelezen', e and e.get('skeletten') == 1 and e.get('botten_gelijk') and e.get('botten') == len(botten)
          and set(m) == kleren | {'speer'} and all(m[n]['aan_skelet'] for n in kleren) and e.get('gezicht_voor')
          and e.get('links_aan_plus_x') and 1.75 < e.get('lengte', 0) < 1.9
          and [(k['ouder'], k['soort'], k['bot']) for k in keten] == [('greep.R', 'OBJECT', ''), ('skelet', 'BONE', 'wrist.R')],
          {k: (e or {}).get(k) for k in ('bestand', 'grootte', 'botten', 'lengte', 'speer_aan', 'gezicht_voor', 'links_aan_plus_x')}
          | {'meshes': {k: x['driehoeken'] for k, x in m.items()}},
          'één skelet met dezelfde botten; het lijf en de elf onderdelen elk een eigen mesh aan het skelet, de speer aan '
          'greep.R aan het bot wrist.R; de basismens zonder kleren blijft basismens.glb')
    # ronde 4: de gebakken texturen in beide GLB's (na opnieuw inlezen), en de realtime soldaat onder zijn budget met
    # (bijna) hetzelfde silhouet op spelmaat
    glbs = {'soldaat.glb': e, 'soldaat-realtime.glb': lees('export-soldaat-realtime.json')}
    mist = {}
    for g, x in glbs.items():
        for mn, mm in (x or {}).get('meshes', {}).items():
            t = mm.get('texturen', {})
            if not all(t.get(k) for k in (('kleur',) if mn == 'lijf' else ('kleur', 'normaal', 'rm'))):
                mist[f'{g}/{mn}'] = t
    toets('soldaat: texturen in de GLB', all(glbs.values()) and not mist,
          {g: {'beelden': len((x or {}).get('texturen', {})), 'grootte_mb': round((x or {}).get('grootte', 0) / 1e6, 1)}
           for g, x in glbs.items()} | ({'mist': mist} if mist else {}),
          'in beide GLB\'s, opnieuw ingelezen, per onderdeel een beeld achter de kleur, de normalen en ruwheid en metaal '
          '(het lijf: zijn huid)', 'gebakken uit de knopen van de bron (textuur.py); als JPEG in de GLB')
    rt = glbs['soldaat-realtime.glb'] or {}
    rm_ = rt.get('meshes', {})
    som_rt = sum(x['driehoeken'] for x in rm_.values())
    sil = lees('realtime-silhouet.json') or {}
    minst = min((x['realtime'] for x in sil.values()), default=0)
    budget = INST['soldaat']['realtime']['budget']
    toets('soldaat: realtime onder het budget', rm_ and som_rt <= budget and set(rm_) == kleren | {'speer'}
          and all(rm_[n]['aan_skelet'] for n in kleren) and len(sil) == 8 and minst >= 0.95,
          {'driehoeken': som_rt, 'budget': budget, 'per_onderdeel': {k: x['driehoeken'] for k, x in rm_.items()},
           'silhouet_op_spelmaat': {n: x['realtime'] for n, x in sil.items()}},
          f'samen hooguit {budget} driehoeken, elk onderdeel nog een eigen mesh aan het skelet, en op spelmaat in elke '
          'richting een silhouet dat voor minstens 95 procent met dat van de bron overlapt (doorsnede gedeeld door vereniging)')
    bestanden = {n: os.path.getsize(os.path.join(UIT, n)) if os.path.exists(os.path.join(UIT, n)) else 0 for n in (
        os.path.join('bron', 'soldaat.blend'), os.path.join('export', 'soldaat.glb'), os.path.join('export', 'basismens.glb'),
        os.path.join('export', 'soldaat-realtime.glb'), os.path.join('bron', 'soldaat-hoog.blend'),
        os.path.join('bron', 'soldaat-realtime.blend'), 'contactblad-soldaat.png', 'vergelijking-speerman.png',
        'spelmaat-soldaat.png', 'groot-soldaat.png', 'uitgelegd-soldaat.png', 'vergelijking-realtime.png')}
    toets('soldaat: bestanden', all(bestanden.values()), bestanden, 'alle bestanden er, niet leeg')


def main():
    rig = bpy.data.objects['skelet']
    lijf, bron, broek = bpy.data.objects['lijf'], bpy.data.objects['lijf-bron'], bpy.data.objects['onderbroek']
    rig.rotation_euler = (0, 0, 0)
    rig.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    bouw, renders, export = lees('bouw.json'), lees('renders.json'), lees('export.json')
    atlas = lees(os.path.join('atlas', 'basismens.json'))

    # de lengte
    zs = [p.z for p in punten(lijf)]
    toets('lengte', abs(max(zs) - min(zs) - INST['lijf']['lengte']) < 0.003 and abs(min(zs)) < 0.002,
          {'lengte': round(max(zs) - min(zs), 4), 'laagste_punt': round(min(zs), 4)}, f"{INST['lijf']['lengte']} m, voeten op Z = 0")

    # het mesh
    for ob in (lijf, bron):
        h = mesh_heel(ob)
        fout = h['open_randen'] + h['meer_dan_twee_vlakken'] + h['los'] + h['plat'] + h['dubbel'] + h['normalen_binnen']
        toets(f'mesh {ob.name}', fout == 0 and h['uv'] and h['zonder_uv'] <= 0.005 * h['vlakken'], h,
              'alles 0, uv aanwezig, hooguit 0,5 procent vlakken zonder uv-oppervlak')
    tri = {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in (lijf, broek, bron)}
    toets('driehoeken', tri['lijf'] <= INST['lijf']['budget_driehoeken'], tri,
          f"lijf hooguit {INST['lijf']['budget_driehoeken']}", 'lijf-bron is het volle mesh met de lussen van MakeHuman, niet voor het spel')

    # de botten
    namen = {b.name for b in rig.data.bones}
    mist = sorted(set(INST['skelet']['nodig']) - namen)
    mist += sorted(n.replace('.L', '.R') for n in INST['skelet']['nodig'] if n.endswith('.L') and n.replace('.L', '.R') not in namen)
    paar = sorted(n for n in namen if (n.endswith('.L') and n[:-2] + '.R' not in namen) or (n.endswith('.R') and n[:-2] + '.L' not in namen))
    vreemd = sorted(n for n in namen if n.lower().endswith(('_l', '_r', '.left', '.right')) or ' ' in n)
    toets('botnamen', not mist and not paar and not vreemd,
          {'botten': len(namen), 'mist': mist, 'zonder_paar': paar, 'vreemde_namen': vreemd},
          'alle nodige botten (instellingen: skelet.nodig, ook gespiegeld), elk .L met een .R')
    # het midden van elk bot (het bekken begint voor links en rechts in het midden, bij de wortel)
    M = lambda b: rig.matrix_world @ ((rig.data.bones[b].head_local + rig.data.bones[b].tail_local) / 2)
    kant_fout = sorted(n for n in namen if (n.endswith('.L') and M(n).x < 0.005) or (n.endswith('.R') and M(n).x > -0.005))
    gewicht_fout = []
    for g in lijf.vertex_groups:
        if g.name.endswith(('.L', '.R')):
            ws = [(v.co.x, x.weight) for v in lijf.data.vertices for x in v.groups if x.group == g.index and x.weight > 0.3]
            if ws:
                gx = sum(x * w for x, w in ws) / sum(w for _, w in ws)
                if (g.name.endswith('.L') and gx < 0) or (g.name.endswith('.R') and gx > 0):
                    gewicht_fout.append(g.name)
    # het mesh symmetrisch om X: elk punt heeft een spiegelpunt
    kd = KDTree(len(lijf.data.vertices))
    for v in lijf.data.vertices:
        kd.insert(v.co, v.index)
    kd.balance()
    asym = max(kd.find(Vector((-v.co.x, v.co.y, v.co.z)))[2] for v in lijf.data.vertices)
    toets('links en rechts in het model', not kant_fout and not gewicht_fout and asym < 0.001,
          {'botten_aan_verkeerde_kant': kant_fout, 'gewichten_aan_verkeerde_kant': gewicht_fout, 'asymmetrie_m': round(asym, 6)},
          '.L op +X, .R op -X (botten en gewichten), het mesh symmetrisch op 1 mm')

    # de camera en de renders
    c = renders['camera'] if renders else {}
    mats = [r['camera'] for r in renders['richtingen']] if renders else []
    zelfde = all(np.allclose(m, mats[0]) for m in mats) if mats else False
    toets('camera', renders and c['type'] == 'ORTHO' and abs(c['elevatie'] - CAM['elevatie']) < 1e-6
          and abs(c['ortho_schaal'] - CAM['hoog'] / CAM['pixels_per_meter']) < 1e-6 and c['breed'] == CAM['breed']
          and c['hoog'] == CAM['hoog'] and zelfde and np.allclose(c['anker'], CAM['anker'], atol=0.5),
          {k: c.get(k) for k in ('type', 'elevatie', 'ortho_schaal', 'breed', 'hoog', 'anker')} | {'acht_keer_dezelfde': zelfde},
          f"orthografisch, {CAM['elevatie']} graden, schaal {CAM['hoog'] / CAM['pixels_per_meter']}, {CAM['breed']}x{CAM['hoog']}, anker {CAM['anker']}")
    namen_r = [r['naam'] for r in LIJST]
    paden = [os.path.join(UIT, 'renders', f'richting-{n}.png') for n in namen_r]
    bestaan = all(os.path.exists(p) for p in paden)
    richtingen_toetsen(renders['richtingen'] if renders else [], 'renders', 'controle', '')

    # de beelden: even groot, doorzichtig, het anker en de voeten, geen schaduw op de grond
    maten, doorzichtig, voeten, schaduw = set(), True, [], 0
    for p in paden if bestaan else []:
        px, kanalen = beeld(p)
        maten.add((px.shape[1], px.shape[0], kanalen))
        a = px[:, :, 3]
        doorzichtig &= bool(a[0, 0] == 0 and a[0, -1] == 0 and a[-1, 0] == 0 and a[-1, -1] == 0)
        rijen = np.nonzero(a.max(axis=1) > 0.5)[0]
        voeten.append(int(rijen.max()))
        schaduw += int((a[rijen.max() + 3:, :] > 0.02).sum())
    toets('beeldafmetingen', maten == {(CAM['breed'], CAM['hoog'], 4)} and doorzichtig and schaduw == 0,
          {'maten': sorted(maten), 'doorzichtig': doorzichtig, 'pixels_onder_de_voeten': schaduw,
           'onderste_pixel_per_richting': dict(zip(namen_r, voeten))},
          f"{CAM['breed']}x{CAM['hoog']} RGBA, doorzichtige hoeken, niets onder de voeten (geen schaduw)",
          'de onderste pixel verschilt per richting doordat de voet die het dichtst bij de camera staat lager in beeld komt; '
          'het anker (de oorsprong op de grond) staat in elk beeld op dezelfde pixel')
    if atlas:
        vel = os.path.join(UIT, 'atlas', atlas['houdingen']['staan']['bestand'])
        px, _ = beeld(vel)
        cb, ch = atlas['cel']
        toets('atlas', (px.shape[1], px.shape[0]) == (cb, ch * 8) and atlas['richtingen'] == namen_r,
              {'maat': [px.shape[1], px.shape[0]], 'cel': atlas['cel'], 'anker': atlas['anker']},
              'een cel breed, acht rijen in de volgorde van het spel (Z ZW W NW N NO O ZO)')
    else:
        toets('atlas', False, None, 'atlas/basismens.json')

    # de idle: de acht richtingen, en waar handen en voeten staan; de rust blijft de A-houding
    i = renders.get('idle') if renders else None
    if i:
        richtingen_toetsen(i['richtingen'], 'renders-idle', 'controle-idle', ' (idle)')
        m = i['maten']
        pols = abs(m['polsen']['L'][0])
        pols_rust = abs(rig.data.bones['wrist.L'].head_local.x)
        toets('idle-houding', abs(m['laagste_punt']) < 0.002 and 0.18 <= m['voeten_uit_elkaar'] <= 0.35 and 0.18 <= pols <= 0.34
              and pols_rust > pols + 0.1 and bool(atlas) and 'idle' in atlas['houdingen'],
              {'voeten_uit_elkaar': m['voeten_uit_elkaar'], 'pols_van_het_midden': round(pols, 3), 'laagste_punt': m['laagste_punt'],
               'pols_in_rust': round(pols_rust, 3), 'grond_verschoven': i['grond_verschoven']},
              'op de grond (2 mm), de voeten 18 tot 35 cm uit elkaar, de polsen 18 tot 34 cm van het midden; de rust blijft '
              'de A-houding (daar staan de polsen verder uit), en de atlas heeft een houding idle')
    else:
        toets('idle-houding', False, None, 'renders.json: idle')

    # de onderbroek: recht afgesneden (de open randen op hun snijvlak), daarna dik en gesloten
    h = mesh_heel(broek)
    rand = (bouw or {}).get('onderbroek_rand_mm')
    toets('onderbroek', rand is not None and rand <= 0.5 and h['open_randen'] == 0 and h['meer_dan_twee_vlakken'] == 0
          and h['plat'] == 0 and h['dubbel'] == 0 and h['los'] == 0,
          {'rand_van_het_snijvlak_mm': rand, 'open_randen': h['open_randen'], 'meer_dan_twee_vlakken': h['meer_dan_twee_vlakken'],
           'plat': h['plat'], 'dubbel': h['dubbel'], 'driehoeken': tri['onderbroek']},
          'voor de dikte ligt elke open rand op zijn snijvlak (hooguit 0,5 mm: niet gekarteld); daarna gesloten en heel')

    # de elevatie: een tegel op de grond is sin(elevatie) zo hoog als breed; 2:1 (de tegels van het spel) is 0,5
    v = renders.get('vergelijking', {}) if renders else {}
    past = [e for e, x in v.items() if abs(x['verhouding'] - 0.5) < 0.01]
    toets('elevatie tegen de tegels', len(v) == len(INST['vergelijking']['elevaties'])
          and all(abs(x['verhouding'] - x['sin_elevatie']) < 0.012 for x in v.values()),
          {e: {'tegel': [x['tegel_breed'], x['tegel_hoog']], 'verhouding': x['verhouding'], 'sin': x['sin_elevatie']}
           for e, x in v.items()} | {'past_op_2_bij_1': past},
          'de gemeten verhouding van een tegel is sin(elevatie), op 0,012; de tegels van het spel zijn 2:1 (0,5)',
          'de uitkomst staat in past_op_2_bij_1: welke elevatie op de tegels van het spel past')

    # de skinning per gebied: niet slechter dan voor het gladmaken, en niet te veel randen die meer dan 2 keer rekken
    d = renders.get('dichtbij', {}) if renders else {}
    voor = lees(os.path.join('voor', 'dichtbij', 'dichtbij.json'))
    slechter = {s: (voor[s]['meting']['rek_p99'], d[s]['meting']['rek_p99']) for s in d
                if voor and s in voor and d[s]['meting']['rek_p99'] > voor[s]['meting']['rek_p99'] + 0.02}
    te_veel = {s: d[s]['meting']['boven_2'] for s in d if d[s]['meting']['boven_2'] > 0.10}
    toets('skinning per gebied', bool(d) and not slechter and not te_veel,
          {s: {'gebied': d[s]['gebied'], 'na': d[s]['meting'], 'voor': voor[s]['meting'] if voor and s in voor else None} for s in d},
          'per stand en gebied geen hoger 99e percentiel van de rek dan voor het gladmaken (als die meting er is), en hooguit '
          '10 procent van de randen meer dan 2 keer zo lang',
          'het meest rekt het kruis in de spreidstand (de benen elk 40 graden opzij)')

    # de spelmaat: de man in Z zo hoog als de speerman in het spel
    hoog = {}
    for e in INST['vergelijking']['elevaties']:
        p = os.path.join(UIT, 'spelmaat', f'e{e:g}', 'richting-Z.png')
        if os.path.exists(p):
            a_ = beeld(p)[0][:, :, 3] > 0.5
            ys = np.nonzero(a_.any(axis=1))[0]
            hoog[f'{e:g}'] = int(ys.max() - ys.min() + 1)
    toets('spelmaat', len(hoog) == len(INST['vergelijking']['elevaties'])
          and all(abs(x - INST['spelmaat']['hoogte']) <= 1 for x in hoog.values()), {'hoogte_Z_px': hoog},
          f"de idle in Z {INST['spelmaat']['hoogte']} pixels hoog (op 1 pixel), bij elke elevatie")

    # de bestanden en de GLB
    bestanden = {n: os.path.getsize(os.path.join(UIT, n)) if os.path.exists(os.path.join(UIT, n)) else 0 for n in (
        os.path.join('bron', 'basismens.blend'), os.path.join('bron', 'basismens-huid.png'), os.path.join('export', 'basismens.glb'),
        os.path.join('atlas', 'basismens-staan.png'), os.path.join('atlas', 'basismens-idle.png'), os.path.join('atlas', 'basismens.json'),
        'contactblad.png', 'contactblad-idle.png', 'vergelijking-elevatie.png', 'spelmaat.png')
        + (('skinning-voor-na.png',) if os.path.exists(os.path.join(UIT, 'voor')) else ())}
    toets('exportbestanden', all(bestanden.values()), bestanden, 'alle bestanden er, niet leeg')
    e = export or {}
    m = e.get('meshes', {})
    toets('GLB opnieuw ingelezen', e.get('skeletten') == 1 and e.get('botten_gelijk') and e.get('botten') == len(namen)
          and set(m) == {'lijf', 'onderbroek'} and all(x['aan_skelet'] and x['gewichten'] > 0 for x in m.values())
          and abs(e.get('lengte', 0) - INST['lijf']['lengte']) < 0.005 and e.get('gezicht_voor') and e.get('links_aan_plus_x')
          and e.get('texturen'), e, 'één skelet met dezelfde botten, lijf en onderbroek aan het skelet, 1,75 m, '
          'het gezicht naar -Y, links aan +X, de textuur erin')

    # de buigtest
    b = renders.get('buigtest', {}) if renders else {}
    marge, aandeel = INST['buigtest']['volume_marge'], INST['buigtest']['rek_aandeel_max']
    fout = {s: v for s, v in b.items() if abs(v['volume'] - 1) > marge or v['rek_boven_grens'] > aandeel}
    toets('skinning (buigtest)', b and not fout, b,
          f"volume binnen {marge:.0%}, hooguit {aandeel:.1%} van de randen meer dan {INST['buigtest']['rek_grens']} keer zo lang",
          'het grootste rekken zit in het kruis (diepe knieval) en de oksels (armen omhoog): bekend bij lineaire skinning')

    soldaat(namen)

    stand = subprocess.run(['git', 'log', '-1', '--format=%h %s'], capture_output=True, text=True, cwd=WORTEL).stdout.strip()
    tak = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True, cwd=WORTEL).stdout.strip()
    rapport = {'datum': datetime.datetime.now().isoformat(timespec='seconds'), 'stand': f'{tak} {stand}',
               'blender': bpy.app.version_string, 'geslaagd': sum(c['geslaagd'] for c in CONTROLES),
               'gezakt': sum(not c['geslaagd'] for c in CONTROLES), 'bouw': bouw, 'controles': CONTROLES}
    json.dump(rapport, open(os.path.join(UIT, 'rapport.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(f"CONTROLE {rapport['geslaagd']} geslaagd, {rapport['gezakt']} gezakt")
    return rapport['gezakt']


try:
    sys.exit(1 if main() else 0)
except SystemExit:
    raise
except Exception:
    import traceback
    traceback.print_exc()
    sys.exit(1)
