# De maten en de staat van een model, uit de meshes in rust (vraag 192, vormproef V4): lengtes in meter, botten, acties, en de meshkwaliteit per onderdeel.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/inventaris.py -- <uit.json>
import json
import sys

import bmesh
import bpy
import numpy as np


def punten(n):
    m = bpy.data.objects[n].data
    c = np.zeros(len(m.vertices) * 3)
    m.vertices.foreach_get('co', c)
    return c.reshape(-1, 3)


def breedte(p, z0, z1):
    q = p[(p[:, 2] >= z0) & (p[:, 2] <= z1)]
    return float(np.ptp(q[:, 0])) if len(q) else 0.0


def kwaliteit(n):
    ob = bpy.data.objects[n]
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    bm.edges.ensure_lookup_table()
    los = sum(1 for v in bm.verts if not v.link_edges)
    rand = sum(1 for e in bm.edges if e.is_boundary)
    niet = sum(1 for e in bm.edges if not e.is_manifold and not e.is_boundary)
    plat = sum(1 for f in bm.faces if f.calc_area() < 1e-10)
    dubbel = len(bmesh.ops.find_doubles(bm, verts=bm.verts, dist=1e-5)['targetmap'])
    uit = {'punten': len(bm.verts), 'vlakken': len(bm.faces), 'los': los, 'open_randen': rand, 'niet_manifold': niet, 'platte_vlakken': plat, 'dubbele_punten': dubbel}
    bm.free()
    return uit


def hoofd():
    uit = sys.argv[sys.argv.index('--') + 1]
    arm_ = bpy.data.objects['skelet']
    b = arm_.data.bones
    tab, helm, hoofd_, baard, hoz, lrs, sp, gam, rm = (punten(n) for n in ('tabberd', 'helm', 'hoofd', 'baard', 'hozen', 'laarzen', 'speer', 'gambeson', 'riem'))
    links = lrs[lrs[:, 0] > 0]
    zr = float(rm[:, 2].mean())
    z_sp = sp[:, 2]
    # de schacht: op het midden tussen hand en blad
    mid = z_sp.min() + 0.25 * np.ptp(z_sp)
    onder = max(float(helm[:, 2].max()), float(hoofd_[:, 2].max()))
    r = {
        'blender': bpy.app.version_string, 'eenheid': bpy.context.scene.unit_settings.system + ', ' + str(bpy.context.scene.unit_settings.scale_length) + ' (1 BU = 1 m)',
        'hoogte_totaal': onder, 'hoogte_zonder_helm': float(hoofd_[:, 2].max()), 'lengte_opgeslagen': float(arm_.get('lengte', 0)),
        'schouders_tabberd': breedte(tab, 0.76, 0.93), 'romp_taille': breedte(rm, zr - 0.03, zr + 0.03), 'romp_borst': breedte(tab, 0.68, 0.72), 'heupen': float(np.ptp(hoz[(hoz[:, 2] > 0.38) & (hoz[:, 2] < 0.46)][:, 0])),
        'hoofd_hoogte': float(np.ptp(hoofd_[:, 2])), 'hoofd_breedte': float(np.ptp(hoofd_[hoofd_[:, 2] > hoofd_[:, 2].min() + 0.12][:, 0])), 'helm_breedte': float(np.ptp(helm[:, 0])), 'helm_diepte': float(np.ptp(helm[:, 1])), 'helm_hoogte': float(np.ptp(helm[:, 2])),
        'bovenarm': b['bovenarm.L'].length, 'onderarm': b['onderarm.L'].length, 'bovenbeen': b['dij.L'].length, 'onderbeen': b['scheen.L'].length,
        'voet_lengte': float(np.ptp(links[:, 1])), 'voet_breedte': float(np.ptp(links[links[:, 2] < 0.05][:, 0])), 'laars_hoogte': float(links[:, 2].max()),
        'tabberd_onder': float(tab[:, 2].min()), 'tabberd_boven': float(tab[:, 2].max()), 'tabberd_lengte': float(np.ptp(tab[:, 2])), 'rok_lengte': zr - float(tab[:, 2].min()), 'zoom_breedte': breedte(tab, tab[:, 2].min(), tab[:, 2].min() + 0.03),
        'speer_lengte': float(np.ptp(z_sp)), 'speer_schacht': float(np.ptp(sp[np.abs(z_sp - mid) < 0.02][:, 0])), 'speer_blad_breedte': float(np.ptp(sp[:, 0])),
        'botten': len(b), 'botnamen': [x.name for x in b], 'acties': {a.name: a.frame_range[1] - a.frame_range[0] + 1 for a in bpy.data.actions}, 'materialen': sorted({m.name for o in bpy.data.objects if o.type == 'MESH' for m in o.data.materials}),
        'kwaliteit': {o.name: kwaliteit(o.name) for o in bpy.data.objects if o.type == 'MESH'},
    }
    with open(uit, 'w', encoding='utf-8') as f:
        json.dump(r, f, indent=1)
    print('KLAAR', uit, round(r['hoogte_totaal'], 3), flush=True)


if __name__ == '__main__':
    hoofd()
