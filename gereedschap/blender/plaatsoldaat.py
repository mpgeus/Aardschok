# Een soldaatje helemaal uit code, met de onderdelen van Marcels plaat als vorm en als verf (vraag 190; Marcel, 26 okt:
# "Ik wil graag nog een proef doen met uv wrapping op een 3d model uit code", "Ik bedoelde meer op een model wat jij uit
# code maakte", en voor alle onderdelen: "Alles"; de plaat: EXTRA/Middeleeuwse krijgeruitrusting spritesheet.png). Zonder
# het mensenlijf van MakeHuman of Human Generator: elk onderdeel een eigen deel.
#
# Elk deel komt uit zijn tekeningen: per hoogte de breedte uit de tekening van voren en de diepte uit die van opzij (een
# ellips per ring, het midden van opzij naar voren of achteren, zodat een laars een neus krijgt), en de textuur
# rechtstreeks uit de tekeningen: per plek rond het deel (de hoek en de hoogte, ook de UV-kaart) de kanten die hem zien,
# gewogen naar de hoek, op de plek waar die kant hem tekent. Zo is de render uit een getekende kant de tekening.
# Onbelicht: het licht zit in de verf. Alles op één schaal: de plaat tekent zijn onderdelen even groot.
#
#   blender.exe -b -P gereedschap/blender/plaatsoldaat.py -- <map> [Z ZW W NW N NO O ZO]
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import speerman_hd as sh  # noqa: E402

PLAAT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'EXTRA',
                     'Middeleeuwse krijgeruitrusting spritesheet.png')
RICHTINGEN = [a for a in sh.ARGS[1:] if a in sh.RICHTINGEN] or ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO']
SCHAAL = 0.68 / 256  # meter per pixel van de plaat (de wapenrok van voren, 256 pixels, is 68 cm)
MACHT = 8  # hoe sterk de kant die een plek het best ziet voorgaat bij de verf
# per onderdeel waar zijn tekeningen op de plaat staan (een rij: y van tot, en x van tot), en welke tekening (van links
# af geteld) welke kant laat zien: de hoek van de camera om het deel (0 voor, 90 zijn linkerkant, 180 de rug, -90 zijn
# rechterkant), en of hij gespiegeld moet (een zijkant voor de andere kant, een voorkant voor de rug)
ONDERDELEN = {
    'wapenrok': {'rij': (270, 545), 'kanten': {0: (0, False), 45: (1, False), 90: (2, False), 180: (3, False), -90: (4, False)}},
    'helm': {'rij': (10, 155), 'kanten': {0: (0, False), 90: (6, False), 180: (0, True), -90: (6, True)}},
    'kraag': {'rij': (158, 278), 'kanten': {0: (0, False), 90: (2, False), 180: (6, False), -90: (2, True)}},
    'mouw': {'rij': (548, 725), 'kanten': {0: (10, False), 90: (11, False), 180: (10, True), -90: (11, True)}},
    'hand': {'rij': (700, 795, 730, 1300), 'kanten': {0: (5, False), 90: (4, False), 180: (5, True), -90: (4, True)}},
    'been': {'rij': (795, 1020, 725, 1300), 'kanten': {0: (0, False), 90: (3, False), 180: (0, True), -90: (3, True)}},
}
RIEM_T = 0.55  # waar de riem van de wapenrok zit, van zijn bovenkant (0) tot de zoom (1)
# hoeveel breder en dieper dan getekend (Marcel, 27 okt: "wat mager"; op de schaal van de plaat was hij slanker dan de
# gedrongen speerman); de hoogte blijft, en de verf rekt mee
DIK = {'wapenrok': 1.3, 'kraag': 1.25, 'mouw': 1.3, 'hand': 1.2, 'been': 1.25, 'helm': 1.0}


def plaat():
    """De plaat als getallen (rijen van boven naar beneden, RGB 0 tot 1), en waar hij magenta is."""
    img = bpy.data.images.load(PLAAT)
    b, h = img.size
    px = np.empty(b * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    a = px.reshape(h, b, 4)[::-1, :, :3].copy()
    mag = (a[..., 0] > 0.67) & (a[..., 2] > 0.67) & (a[..., 1] < 0.43)
    return a, mag


def stukken(mag, rij):
    """De losse tekeningen in een rij van de plaat: per stuk (x0, x1, y0, y1)."""
    y0, y1 = rij[0], rij[1]
    xa, xb = (rij[2], rij[3]) if len(rij) > 2 else (0, mag.shape[1])
    vorm = ~mag[y0:y1, xa:xb]
    kol = vorm.sum(0) > 2
    uit, aan, start = [], False, 0
    for x, k in enumerate(list(kol) + [False]):
        if k and not aan:
            aan, start = True, x
        if not k and aan:
            aan = False
            if x - start > 25:
                ys = np.where(vorm[:, start:x].sum(1) > 0)[0]
                uit.append((xa + start, xa + x, y0 + ys[0], y0 + ys[-1] + 1))
    return uit


class Tekening:
    """Eén tekening van de plaat: zijn kleuren, zijn vorm per rij (links en rechts), eventueel gespiegeld."""

    def __init__(self, a, mag, stuk, spiegel=False):
        x0, x1, y0, y1 = stuk
        self.kleur = (a[y0:y1, x0:x1][:, ::-1] if spiegel else a[y0:y1, x0:x1]).copy()
        # waar de omtrek met het magenta mengt (paarsig): donker, zoals de omtrek zelf (aan de kleine handen gaf dat
        # roze spikkels)
        k = self.kleur
        paars = (k[..., 0] > 0.35) & (k[..., 2] > 0.35) & (k[..., 1] < k[..., 0] - 0.15) & (k[..., 1] < k[..., 2] - 0.1)
        k[paars] = (0.10, 0.07, 0.05)
        self.vorm = (~mag[y0:y1, x0:x1])[:, ::-1] if spiegel else ~mag[y0:y1, x0:x1]
        self.h = y1 - y0
        self.links = np.array([np.argmax(r) if r.any() else np.nan for r in self.vorm], dtype=np.float32)
        self.rechts = np.array([len(r) - 1 - np.argmax(r[::-1]) if r.any() else np.nan for r in self.vorm], dtype=np.float32)
        for rand in (self.links, self.rechts):  # rijen zonder vorm (een gat): die van de buren
            leeg = np.isnan(rand)
            if leeg.any():
                rand[leeg] = np.interp(np.where(leeg)[0], np.where(~leeg)[0], rand[~leeg])
        self.riem = None

    def zoek_riem(self):
        """De riem: in het midden van de hoogte de rij met het meeste bruin (rood boven groen boven blauw)."""
        r, g, b = self.kleur[..., 0], self.kleur[..., 1], self.kleur[..., 2]
        bruin = self.vorm & (r > g + 0.06) & (g > b + 0.02) & (r < 0.69) & (r > 0.24)
        band = bruin[int(self.h * 0.35):int(self.h * 0.75)].sum(1)
        self.riem = int(self.h * 0.35) + int(np.convolve(band, np.ones(9) / 9, 'same').argmax())

    def rij(self, t):
        """De rij bij t (0 de bovenkant, 1 de onderkant); met een riem stuksgewijs recht over de riem op RIEM_T."""
        if self.riem is None:
            return t * (self.h - 1)
        return np.where(t < RIEM_T, t / RIEM_T * self.riem, self.riem + (t - RIEM_T) / (1 - RIEM_T) * (self.h - 1 - self.riem))

    def rand(self, t):
        y = np.clip(np.round(self.rij(t)).astype(int), 0, self.h - 1)
        return self.links[y], self.rechts[y]

    def kleur_bij(self, t, s):
        """De kleur op hoogte t, op s van links (0) naar rechts (1) binnen de vorm van die rij, lineair tussen buren."""
        y = np.clip(self.rij(t), 0, self.h - 1)
        yi = np.clip(np.round(y).astype(int), 0, self.h - 1)
        L, R = self.links[yi] + 1.5, self.rechts[yi] - 1.5
        x = L + s * np.maximum(R - L, 0)
        x0 = np.clip(np.floor(x).astype(int), 0, self.kleur.shape[1] - 2)
        fx = (x - x0)[..., None]
        return self.kleur[yi, x0] * (1 - fx) + self.kleur[yi, x0 + 1] * fx


def deel(naam, a, mag, riem=False, bijsnijden=None):
    """Een onderdeel uit zijn tekeningen, staand met zijn bovenkant op z = 0 en zijn as door (0, 0): een buis van ellipsen
    (breed uit de tekening van voren, diep en naar voren of achteren uit die van opzij) met zijn textuur. Met `riem` liggen
    de riemen van de tekeningen op dezelfde hoogte; `bijsnijden` (een deel van de hoogte) laat de onderkant weg."""
    o = ONDERDELEN[naam]
    st = stukken(mag, o['rij'])
    tek = {}
    for hoek, (n, spiegel) in o['kanten'].items():
        tk = Tekening(a, mag, st[n], spiegel)
        if riem:
            tk.zoek_riem()
        tek[hoek] = tk
    voor, zij = tek[0], tek[90]
    deelt = bijsnijden or 1.0
    K, N = 72, 96
    hoog = voor.h * SCHAAL * deelt
    ts = np.linspace(0, deelt, K + 1)
    lv, rv = voor.rand(ts)
    lz, rz = zij.rand(ts)
    rx, ry = (rv - lv) / 2 * SCHAAL, (rz - lz) / 2 * SCHAAL
    # het midden: gemeten tegen het midden van de bovenkant (waar het deel vastzit); opzij kijkt hij naar links, dus
    # rechts in die tekening is achter (+y)
    boven = slice(0, max(2, K // 10))
    cx = ((lv + rv) / 2 - np.mean((lv + rv)[boven] / 2)) * SCHAAL
    cy = ((lz + rz) / 2 - np.mean((lz + rz)[boven] / 2)) * SCHAAL
    # breder en dieper allebei even veel: zo kijkt elke kant nog op dezelfde plek van zijn tekening
    rx, ry, cx, cy = (v * DIK[naam] for v in (rx, ry, cx, cy))
    zs = -ts / deelt * hoog
    vs, fs, uvs = [], [], []
    for k in range(K + 1):
        for j in range(N + 1):
            f = -math.pi + 2 * math.pi * j / N  # de hoek om het deel: 0 voor, + naar zijn linkerkant
            vs.append((cx[k] + rx[k] * math.sin(f), cy[k] - ry[k] * math.cos(f), zs[k]))
            uvs.append((j / N, 1 - k / K))
    for k in range(K):
        for j in range(N):
            a0 = k * (N + 1) + j
            fs.append((a0, a0 + N + 1, a0 + N + 2, a0 + 1))  # naar buiten
    me = bpy.data.meshes.new(naam)
    me.from_pydata(vs, [], fs)
    uv = me.uv_layers.new(name='uv')
    for lp in me.loops:
        uv.data[lp.index].uv = uvs[lp.vertex_index]
    me.update()
    ob = bpy.data.objects.new(naam, me)
    bpy.context.scene.collection.objects.link(ob)
    sh.zacht(ob)
    # de textuur: per texel (de hoek f, de hoogte t) de kanten die hem zien, gewogen naar de hoek
    B, H = 1024, 640
    F, T = np.meshgrid(-math.pi + 2 * math.pi * (np.arange(B) + 0.5) / B, (np.arange(H) + 0.5) / H * deelt)
    ki = np.clip(np.round(T / deelt * K).astype(int), 0, K)
    som, gewicht = np.zeros((H, B, 3), np.float32), np.zeros((H, B, 1), np.float32)
    for hoek, tk in tek.items():
        al = math.radians(hoek)
        w = np.clip(np.cos(F - al), 0, 1) ** MACHT
        x = rx[ki] * np.sin(F) * math.cos(al) - ry[ki] * np.cos(F) * math.sin(al)
        A = np.sqrt((rx[ki] * math.cos(al)) ** 2 + (ry[ki] * math.sin(al)) ** 2)
        s = np.clip((x / np.maximum(A, 1e-6) + 1) / 2, 0, 1)
        som += tk.kleur_bij(T, s) * w[..., None]
        gewicht += w[..., None]
    beeld = som / np.maximum(gewicht, 1e-6)
    img = bpy.data.images.new(naam, B, H, alpha=False)
    img.pixels.foreach_set(np.concatenate([beeld, np.ones((H, B, 1), np.float32)], axis=2)[::-1].ravel())
    img.filepath_raw = os.path.join(sh.UIT, f'textuur-{naam}.png')
    img.file_format = 'PNG'
    img.save()
    ob.data.materials.append(onbelicht(naam, img))
    return ob, hoog, rx, ry


def onbelicht(naam, img):
    """De verf onbelicht (het licht zit in de tekening); de binnenkant donker."""
    k = sh.Knopen(naam)
    k.nt.nodes.remove(k.bsdf)
    uv = k.n('ShaderNodeUVMap', uv_map='uv')
    tex = k.n('ShaderNodeTexImage', image=img, interpolation='Linear')
    k.nt.links.new(uv.outputs['UV'], tex.inputs['Vector'])
    geo = k.n('ShaderNodeNewGeometry')
    em = k.n('ShaderNodeEmission')
    k.zet(em.inputs['Color'], k.meng(geo.outputs['Backfacing'], tex.outputs['Color'], (0.04, 0.03, 0.02, 1)))
    k.nt.links.new(em.outputs[0], k.uit.inputs['Surface'])
    return k.m


def kopie(ob, naam):
    k = ob.copy()
    k.data = ob.data
    k.name = naam
    bpy.context.scene.collection.objects.link(k)
    return k


def zet(ob, plek, draai=None):
    ob.matrix_world = Matrix.Translation(plek) @ (draai.to_4x4() if draai else Matrix.Identity(4))


def mat(naam, kleur, ruw=0.7, metaal=0.0):
    m = bpy.data.materials.new(naam)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*sh.lin(kleur)[:3], 1)
    b.inputs['Roughness'].default_value = ruw
    b.inputs['Metallic'].default_value = metaal
    return m


def bol(naam, plek, maat, materiaal):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=plek)
    o = bpy.context.active_object
    o.name = naam
    o.scale = maat
    sh.zacht(o)
    o.data.materials.append(materiaal)
    return o


def soldaat(a, mag):
    """De delen op hun plek: de benen (met broek en laars) op de grond, de wapenrok met zijn riem op de heup, de mouwen uit
    de armsgaten met de handen eronder, de kraag om de hals, een hoofd met een baard, de helm erop, en een speer."""
    been, been_h, been_rx, _ = deel('been', a, mag)
    wapenrok, rok_h, rx, ry = deel('wapenrok', a, mag, riem=True)
    mouw, mouw_h, _, _ = deel('mouw', a, mag)
    hand, hand_h, _, _ = deel('hand', a, mag)
    kraag, kraag_h, _, _ = deel('kraag', a, mag)
    helm, helm_h, _, _ = deel('helm', a, mag, bijsnijden=0.8)  # zonder de kinriemen die eronder hangen
    # de benen: voeten op de grond, naast elkaar met een handbreed ertussen. Naar de zoom van de wapenrok gemeten stonden
    # ze op elkaar (zijn onderste rij is de smalle punt van de zoom, 1,7 cm), en had hij één voet (Marcel, 27 okt)
    breed = been_rx.max() + 0.03
    print('BENEN', round(float(been_rx.max()), 3), 'uit elkaar', round(2 * breed, 3), 'zoom', round(float(rx[-1]), 3))
    zet(been, Vector((-breed, 0, been_h)))
    zet(kopie(been, 'been.L'), Vector((breed, 0, been_h)))
    # de wapenrok: de zoom over de knie (de broek steekt eronder uit)
    top = been_h * 0.62 + rok_h
    zet(wapenrok, Vector((0, 0, top)))
    # de mouwen uit de armsgaten (aan de rand van de wapenrok, wat onder de bovenkant), wat naar buiten, en de handen
    schouder = rx[len(rx) // 12] * 0.92
    for s in (-1, 1):
        m = mouw if s < 0 else kopie(mouw, 'mouw.L')
        draai = Matrix.Rotation(math.radians(6 * s), 3, 'Y')
        aan = Vector((s * schouder, 0.0, top - 0.02))
        zet(m, aan, draai)
        zet(hand if s < 0 else kopie(hand, 'hand.L'), aan + draai @ Vector((0, 0, -mouw_h * 0.96)), draai)
    # de kraag om de hals, op de schouders
    zet(kraag, Vector((0, 0.01, top + kraag_h * 0.62)))
    # het hoofd met een baard, de helm erop
    kin = top + kraag_h * 0.45
    huid, baard = mat('huid', '#b0735a', 0.7), mat('baard', '#2a1e16', 0.9)
    kop = bol('hoofd', Vector((0, 0.0, kin + 0.1)), (0.105, 0.11, 0.11), huid)
    bol('baard', Vector((0, -0.05, kin + 0.06)), (0.085, 0.07, 0.07), baard)
    bol('neus', Vector((0, -0.105, kin + 0.12)), (0.018, 0.02, 0.025), huid)
    for s in (-1, 1):
        bol('oog', Vector((s * 0.035, -0.098, kin + 0.15)), (0.012, 0.008, 0.01), baard)
    # de rand van de helm (zo'n driekwart van de getekende hoogte) op het voorhoofd: hoger stak het hoofd als een kaal ei
    # onder de helm uit
    helm_top = kop.location.z + 0.03 + helm_h * 0.72
    zet(helm, Vector((0, 0.01, helm_top)))
    # de speer rechtop door de rechterhand
    hout = mat('hout', '#7a3418', 0.7)
    staal = mat('staal', '#a3a8b0', 0.3, 0.9)
    x = -schouder - 0.05
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.017, depth=1.55, location=(x, -0.04, 0.78))
    bpy.context.active_object.data.materials.append(hout)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.045, radius2=0.0, depth=0.2, location=(x, -0.04, 1.66))
    bpy.context.active_object.scale = (1, 0.35, 1)
    bpy.context.active_object.data.materials.append(staal)
    return helm_top


def main():
    os.makedirs(sh.UIT, exist_ok=True)
    sc = sh.scene()
    a, mag = plaat()
    hoogte = soldaat(a, mag)
    # het licht van eigen.py voor spelmaat, en de camera zo dat de top even hoog in beeld komt als de helm van de speerman
    zon = bpy.data.objects['zon']
    zon.rotation_euler = Vector((-0.82, -0.32, 0.48)).normalized().to_track_quat('Z', 'Y').to_euler()
    zon.data.energy, zon.data.angle = 5.0, math.radians(8)
    bpy.data.objects['vul'].data.energy = 0.65
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
    sc.view_settings.exposure = 0.6
    sc.view_settings.look = 'Medium High Contrast'
    sc.render.use_freestyle = False
    sc.cycles.samples = 32
    sc.render.resolution_percentage = 50
    cam = sc.camera
    b, h = sh.INSTELLINGEN['res']
    pxm = 1450 / hoogte
    cam.data.ortho_scale = h / pxm
    hoek = math.radians(sh.INSTELLINGEN['camera'])
    kijk, op = Vector((0, math.cos(hoek), -math.sin(hoek))), Vector((0, math.sin(hoek), math.cos(hoek)))
    cam.location = op * ((sh.INSTELLINGEN['anker_y'] - h / 2) / pxm) - kijk * 20
    lichten = {bpy.data.objects[n]: bpy.data.objects[n].matrix_world.copy() for n in ('zon', 'rand', 'vul')}
    m0 = cam.matrix_world.copy()
    beeld = {'Z': 5, 'ZW': 40, 'W': 65, 'NW': 135, 'N': 185, 'NO': -145, 'O': -65, 'ZO': -40}
    for r in RICHTINGEN:
        R = Matrix.Rotation(math.radians(beeld[r]), 4, 'Z')
        cam.matrix_world = R @ m0
        for o, m in lichten.items():
            o.matrix_world = R @ m
        sc.render.filepath = os.path.join(sh.UIT, f'eigen-{r}-staan.png')
        bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(sh.UIT, 'plaatsoldaat.blend'))
    print('PLAATSOLDAAT KLAAR', round(hoogte, 3), 'm')


main()
