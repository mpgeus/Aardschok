# De verf in texturen (vraag 192, de kwaliteitsronde): het dichte model versimpeld, met een UV-kaart per onderdeel, en de verf per texel in
# plaats van per punt. De recepten zijn dezelfde (figuur.verf_*): ze krijgen de plek, de normaal en de bolling van elke texel, dus een naad
# is hier scherper dan de punten van de mesh. De vorm van het dichte model komt als normal map mee. Zo is hetzelfde spoor bruikbaar voor de
# sprites en voor een GLB.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/textuur.py -- <uit.blend> [schaal=1.0]    (schaal van de textuurmaten)
import json
import math
import os
import sys
import time

import bpy
import numpy as np

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
import figuur as F  # noqa: E402
import licht as L  # noqa: E402
import materialen as M  # noqa: E402

# per onderdeel: driehoeken na het versimpelen, en de maat van de textuur
DELEN = {'hoofd': (24000, 2048), 'baard': (10000, 1024), 'helm': (24000, 2048), 'kap': (16000, 2048), 'gambeson': (30000, 2048), 'tabberd': (30000, 4096),
         'riem': (10000, 2048), 'buidel': (7000, 1024), 'hozen': (6000, 1024), 'laarzen': (24000, 2048), 'handschoenen': (24000, 2048), 'speer': (7000, 2048)}


def lees_mesh(m):
    n = len(m.vertices)
    v = np.zeros(n * 3, dtype=np.float64)
    m.vertices.foreach_get('co', v)
    return v.reshape(n, 3)


def bol_volume(v, bol, h):
    """De bolling van het dichte model in een raster, zodat elke texel hem kan opzoeken zonder de mesh te doorzoeken."""
    lo = v.min(axis=0) - 2 * h
    maat = np.ceil((v.max(axis=0) - lo) / h).astype(int) + 3
    som = np.zeros(maat, dtype=np.float32)
    tel = np.zeros(maat, dtype=np.float32)
    i = np.floor((v - lo) / h).astype(int)
    np.add.at(som, tuple(i.T), bol.astype(np.float32))
    np.add.at(tel, tuple(i.T), 1.0)
    # drie keer uitsmeren: elke plek bij het oppervlak heeft zo een waarde
    for _ in range(3):
        s2, t2 = som.copy(), tel.copy()
        for ax in range(3):
            for d in (-1, 1):
                s2 += np.roll(som, d, axis=ax)
                t2 += np.roll(tel, d, axis=ax)
        leeg = tel == 0
        som[leeg], tel[leeg] = s2[leeg], t2[leeg]
    return np.divide(som, np.maximum(tel, 1e-6)), lo


def rasteriseer(lo_m, maat):
    """Per texel de plek en de normaal in rust. Eén driehoek tegelijk, met zijn eigen vak: eenvoudig en vast."""
    lo_m.calc_loop_triangles()
    uvlaag = lo_m.uv_layers.active.data
    n_loops = len(lo_m.loops)
    uv = np.zeros(n_loops * 2, dtype=np.float64)
    uvlaag.foreach_get('uv', uv)
    uv = uv.reshape(n_loops, 2) * maat
    lv = np.zeros(n_loops, dtype=np.int64)
    lo_m.loops.foreach_get('vertex_index', lv)
    co = lees_mesh(lo_m)
    nor = np.zeros(len(lo_m.vertices) * 3)
    lo_m.vertices.foreach_get('normal', nor)
    nor = nor.reshape(-1, 3)
    P = np.zeros((maat, maat, 3), dtype=np.float32)
    N = np.zeros((maat, maat, 3), dtype=np.float32)
    gevuld = np.zeros((maat, maat), dtype=bool)
    for tri in lo_m.loop_triangles:
        l0, l1, l2 = tri.loops
        a, b, c = uv[l0], uv[l1], uv[l2]
        x0, x1 = int(max(min(a[0], b[0], c[0]) - 1, 0)), int(min(max(a[0], b[0], c[0]) + 2, maat))
        y0, y1 = int(max(min(a[1], b[1], c[1]) - 1, 0)), int(min(max(a[1], b[1], c[1]) + 2, maat))
        if x1 <= x0 or y1 <= y0:
            continue
        xs, ys = np.meshgrid(np.arange(x0, x1) + 0.5, np.arange(y0, y1) + 0.5)
        den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(den) < 1e-9:
            continue
        w0 = ((b[1] - c[1]) * (xs - c[0]) + (c[0] - b[0]) * (ys - c[1])) / den
        w1 = ((c[1] - a[1]) * (xs - c[0]) + (a[0] - c[0]) * (ys - c[1])) / den
        w2 = 1.0 - w0 - w1
        m = (w0 >= -0.02) & (w1 >= -0.02) & (w2 >= -0.02)
        if not m.any():
            continue
        v0, v1, v2 = lv[l0], lv[l1], lv[l2]
        px = (ys[m] - 0.5).astype(int), (xs[m] - 0.5).astype(int)
        P[px] = (co[v0][None] * w0[m, None] + co[v1][None] * w1[m, None] + co[v2][None] * w2[m, None])
        N[px] = (nor[v0][None] * w0[m, None] + nor[v1][None] * w1[m, None] + nor[v2][None] * w2[m, None])
        gevuld[px] = True
    return P, N, gevuld


def rand_uit(beeld, gevuld, keren=6):
    """De kleur over de rand van elk eiland: anders loopt er bij het verkleinen een zwarte naad in."""
    b = beeld.copy()
    g = gevuld.copy()
    for _ in range(keren):
        nieuw = np.zeros_like(b)
        tel = np.zeros(g.shape, dtype=np.float32)
        for ax, d in ((0, 1), (0, -1), (1, 1), (1, -1)):
            gm = np.roll(g, d, axis=ax)
            nieuw[gm] += np.roll(b, d, axis=ax)[gm]
            tel[gm] += 1
        m = (~g) & (tel > 0)
        b[m] = nieuw[m] / tel[m, None]
        g = g | m
    return b


def naar_srgb(c):
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def beeld_van(naam, rgba, kleurruimte):
    h, w = rgba.shape[:2]
    im = bpy.data.images.new(naam, w, h, alpha=True)
    im.colorspace_settings.name = kleurruimte
    im.pixels.foreach_set(rgba.astype(np.float32).ravel())
    im.update()
    return im


def bak_normaal(scene, hoog, laag, im):
    """De vorm van het dichte model als normal map, in rust."""
    mat = laag.data.materials[0]
    nt = mat.node_tree
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = im
    for n in nt.nodes:
        n.select = False
    t.select = True
    nt.nodes.active = t
    bpy.ops.object.select_all(action='DESELECT')
    hoog.select_set(True)
    laag.select_set(True)
    bpy.context.view_layer.objects.active = laag
    scene.render.bake.use_selected_to_active = True
    scene.render.bake.cage_extrusion = 0.012
    scene.render.bake.max_ray_distance = 0.03
    scene.render.bake.normal_space = 'TANGENT'
    scene.render.bake.margin = 8
    r = bpy.ops.object.bake(type='NORMAL', use_clear=True)
    nt.nodes.remove(t)
    return r


def hoofd():
    argv = sys.argv[sys.argv.index('--') + 1:]
    uit = os.path.abspath(argv[0])
    schaal = 1.0
    for a in argv[1:]:
        if a.startswith('schaal='):
            schaal = float(a[7:])
    map_ = os.path.dirname(uit)
    tex = os.path.join(map_, 'texturen')
    os.makedirs(tex, exist_ok=True)
    scene = bpy.context.scene
    L.videokaart(scene)
    scene.cycles.samples = 4
    scene.cycles.use_denoising = False
    scene.render.film_transparent = False
    arm_ = bpy.data.objects['skelet']
    arm_.animation_data.action = None
    for pb in arm_.pose.bones:
        pb.matrix_basis.identity()
    arm_.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    F.zet_bouw([f'{k}={v}' for k, v in json.loads(arm_.get('bouw', '{}')).items() if k in ('kop', 'benen', 'tabberd', 'vorm', 'zoom_z', 'speer_straal')])
    recepten = {d[0]: d for d in F.delen()}
    e = np.array([0, 0, F.BOUW['benen']], dtype=np.float32)
    info = {}
    t0 = time.time()
    for naam, (budget, maat) in DELEN.items():
        t1 = time.time()
        maat = int(maat * schaal)
        hoog = bpy.data.objects[naam]
        h = recepten[naam][4]
        verf = recepten[naam][5]
        # het dichte model: plek en bolling
        hm = hoog.data
        hv = lees_mesh(hm)
        hb = np.zeros(len(hm.vertices), dtype=np.float32)
        hm.attributes['bol'].data.foreach_get('value', hb)
        vol, vol_lo = bol_volume(hv, hb, h)
        # het versimpelde model, met een eigen UV-kaart
        laag = hoog.copy()
        laag.data = hm.copy()
        laag.name = naam + '-laag'
        scene.collection.objects.link(laag)
        for m in list(laag.modifiers):
            if m.type == 'ARMATURE':
                m.show_viewport = False
        mod = laag.modifiers.new('versimpel', 'DECIMATE')
        mod.decimate_type = 'COLLAPSE'
        mod.ratio = min(1.0, budget / max(len(hm.polygons) * 2, 1))
        bpy.ops.object.select_all(action='DESELECT')
        laag.select_set(True)
        bpy.context.view_layer.objects.active = laag
        bpy.ops.object.modifier_apply(modifier=mod.name)
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.quads_convert_to_tris()
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.006, area_weight=0.6)
        bpy.ops.object.mode_set(mode='OBJECT')
        P, Nt, gevuld = rasteriseer(laag.data, maat)
        idx = np.nonzero(gevuld)
        p = P[idx].astype(np.float64)
        nrm = Nt[idx].astype(np.float64)
        nrm /= np.maximum(np.linalg.norm(nrm, axis=1, keepdims=True), 1e-9)
        # de bolling uit het raster van het dichte model (dichtstbijzijnde cel)
        i = np.clip(np.floor((p - vol_lo) / h).astype(int), 0, np.array(vol.shape) - 1)
        bol = vol[tuple(i.T)].astype(np.float64)
        p_verf = (p.astype(np.float32) if naam in F.ONDER else (p.astype(np.float32) - e))
        v = verf(p_verf, nrm, bol)
        kleur = np.ones((maat, maat, 4), dtype=np.float32)
        kleur[idx[0], idx[1], :3] = naar_srgb(np.asarray(v[0], dtype=np.float64))
        eigen = np.zeros((maat, maat, 4), dtype=np.float32)
        eigen[idx[0], idx[1], 0] = np.clip(v[1], 0, 1)
        eigen[idx[0], idx[1], 1] = np.clip(v[2], 0, 1)
        eigen[idx[0], idx[1], 2] = np.clip(v[4], 0, 1)
        eigen[idx[0], idx[1], 3] = np.clip(v[3], 0, 1)
        kleur[..., :3] = rand_uit(kleur[..., :3], gevuld)
        eigen = rand_uit(eigen, gevuld)
        im_k = beeld_van(f'{naam}-kleur', kleur, 'sRGB')
        im_e = beeld_van(f'{naam}-eigen', eigen, 'Non-Color')
        im_e.alpha_mode = 'CHANNEL_PACKED'
        im_n = bpy.data.images.new(f'{naam}-normaal', maat, maat, alpha=False, float_buffer=False)
        im_n.colorspace_settings.name = 'Non-Color'
        # de normal map uit het dichte model
        mat = M.shader_textuur(bpy, f'Stijl-{naam}', im_k, im_e, im_n)
        laag.data.materials.clear()
        laag.data.materials.append(mat)
        r = bak_normaal(scene, hoog, laag, im_n)
        for im, stam in ((im_k, 'kleur'), (im_e, 'eigen'), (im_n, 'normaal')):
            im.filepath_raw = os.path.join(tex, f'{naam}-{stam}.png')
            im.file_format = 'PNG'
            im.save()
            im.source = 'FILE'
        # het laag model neemt de plek van het dichte in
        for m in laag.modifiers:
            m.show_viewport = True
        bpy.data.objects.remove(hoog)
        laag.name = naam
        laag.data.name = naam
        info[naam] = {'driehoeken': len(laag.data.polygons), 'textuur': maat, 'normal': sorted(r), 's': round(time.time() - t1, 1)}
        print(naam, info[naam], flush=True)
    arm_.data.pose_position = 'POSE'
    bpy.ops.wm.save_as_mainfile(filepath=uit, compress=True)
    with open(uit.rsplit('.', 1)[0] + '.json', 'w', encoding='utf-8') as f:
        json.dump(info, f, indent=1)
    print('KLAAR', uit, round(time.time() - t0, 1), 's', flush=True)


if __name__ == '__main__':
    hoofd()
