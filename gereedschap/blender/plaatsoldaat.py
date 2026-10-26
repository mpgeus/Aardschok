# Een soldaatje helemaal uit code, met de onderdelen van Marcels plaat als vorm en als verf (vraag 190; Marcel, 26 okt:
# "Ik wil graag nog een proef doen met uv wrapping op een 3d model uit code", "Ik bedoelde meer op een model wat jij uit
# code maakte"; de plaat: EXTRA/Middeleeuwse krijgeruitrusting spritesheet.png). Zonder het mensenlijf van MakeHuman of
# Human Generator: eenvoudige, gladde vormen, elk onderdeel een eigen deel.
#
# De wapenrok komt uit de tekeningen zelf: per hoogte de breedte uit de tekening van voren en de diepte uit die van opzij
# (een ellips per ring), en de textuur rechtstreeks uit de tekeningen: per plek rond het lijf (de hoek en de hoogte, ook
# de UV-kaart) de tekening van de kant die die plek het best ziet, op de plek waar die kant hem tekent. Zo is de render uit
# die kant de tekening. Onbelicht: het licht zit in de verf. De rest (benen, armen, hoofd, helm) is voorlopig eenvoudig.
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
# de wapenrokken op de plaat (de derde rij), per kant: de hoek van de camera om het lijf (0 voor, 90 zijn linkerkant,
# 180 de rug, -90 zijn rechterkant) en het nummer van links af
WAPENROK_RIJ = (270, 545)
KANTEN = {0: 0, 45: 1, 90: 2, 180: 3, -90: 4}
# de maten (meter): de zoom van de rok, de top van de schouders; de man tot de top van de helm zo'n 1,3 m
ZOOM_Z, SCHOUDER_Z = 0.30, 0.98
MACHT = 8  # hoe sterk de kant die een plek het best ziet voorgaat bij de verf


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
    vorm = ~mag[rij[0]:rij[1]]
    kol = vorm.sum(0) > 3
    uit, aan, start = [], False, 0
    for x, k in enumerate(list(kol) + [False]):
        if k and not aan:
            aan, start = True, x
        if not k and aan:
            aan = False
            if x - start > 40:
                ys = np.where(vorm[:, start:x].sum(1) > 0)[0]
                uit.append((start, x, rij[0] + ys[0], rij[0] + ys[-1] + 1))
    return uit


class Tekening:
    """Eén tekening van de plaat: zijn kleuren, zijn vorm per rij (links en rechts), en de rij van de riem."""

    def __init__(self, a, mag, stuk):
        x0, x1, y0, y1 = stuk
        self.kleur = a[y0:y1, x0:x1]
        self.vorm = ~mag[y0:y1, x0:x1]
        self.h = y1 - y0
        self.links = np.array([np.argmax(r) if r.any() else -1 for r in self.vorm], dtype=np.float32)
        self.rechts = np.array([len(r) - 1 - np.argmax(r[::-1]) if r.any() else -1 for r in self.vorm], dtype=np.float32)
        r, g, b = self.kleur[..., 0], self.kleur[..., 1], self.kleur[..., 2]
        bruin = self.vorm & (r > g + 0.06) & (g > b + 0.02) & (r < 0.69) & (r > 0.24)
        band = bruin[int(self.h * 0.35):int(self.h * 0.75)].sum(1)
        self.riem = int(self.h * 0.35) + int(np.convolve(band, np.ones(9) / 9, 'same').argmax())

    def rij(self, t):
        """De rij bij t (0 de bovenkant, de riem bij RIEM_T, 1 de zoom): stuksgewijs recht over de riem."""
        return np.where(t < RIEM_T, t / RIEM_T * self.riem, self.riem + (t - RIEM_T) / (1 - RIEM_T) * (self.h - 1 - self.riem))

    def breedte(self, t):
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


RIEM_T = 0.55  # waar de riem zit, van de schouders (0) tot de zoom (1)


def wapenrok(a, mag):
    """De wapenrok: een buis van ellipsen (breed uit de tekening van voren, diep uit die van opzij) en zijn textuur."""
    stuk = stukken(mag, WAPENROK_RIJ)
    tek = {hoek: Tekening(a, mag, stuk[n]) for hoek, n in KANTEN.items()}
    voor, zij = tek[0], tek[90]
    schaal = (SCHOUDER_Z - ZOOM_Z) / voor.h  # meter per pixel van de tekening
    K, N = 80, 128
    ts = np.linspace(0, 1, K + 1)
    lv, rv = voor.breedte(ts)
    lz, rz = zij.breedte(ts)
    rx, ry = (rv - lv) / 2 * schaal, (rz - lz) / 2 * schaal
    zs = SCHOUDER_Z - ts * (SCHOUDER_Z - ZOOM_Z)
    vs, fs, uvs = [], [], []
    for k in range(K + 1):
        for j in range(N + 1):
            f = -math.pi + 2 * math.pi * j / N  # de hoek om het lijf: 0 voor, + naar zijn linkerkant
            vs.append((rx[k] * math.sin(f), -ry[k] * math.cos(f), zs[k]))
            uvs.append((j / N, 1 - ts[k]))
    for k in range(K):
        for j in range(N):
            a0 = k * (N + 1) + j
            fs.append((a0, a0 + N + 1, a0 + N + 2, a0 + 1))  # naar buiten (andersom keek de binnenkant naar buiten)
    me = bpy.data.meshes.new('plaat-wapenrok')
    me.from_pydata(vs, [], fs)
    uv = me.uv_layers.new(name='uv')
    for lp in me.loops:
        uv.data[lp.index].uv = uvs[lp.vertex_index]
    me.update()
    ob = bpy.data.objects.new('plaat-wapenrok', me)
    bpy.context.scene.collection.objects.link(ob)
    sh.zacht(ob)
    # de textuur: per texel (de hoek f, de hoogte t) de kanten die hem zien, gewogen
    B, H = 1024, 640
    f = -math.pi + 2 * math.pi * (np.arange(B) + 0.5) / B
    t = (np.arange(H) + 0.5) / H
    F, T = np.meshgrid(f, t)
    som, gewicht = np.zeros((H, B, 3), np.float32), np.zeros((H, B, 1), np.float32)
    for hoek, tk in tek.items():
        al = math.radians(hoek)
        cosa = np.cos(F - al)
        w = np.clip(cosa, 0, 1) ** MACHT
        # waar de plek in die tekening staat: van zijn linkerrand naar zijn rechterrand (het beeld van de camera)
        ki = np.clip(np.round(T * K).astype(int), 0, K)
        x = rx[ki] * np.sin(F) * math.cos(al) + (-ry[ki] * np.cos(F)) * math.sin(al)
        rand = np.sqrt((rx[ki] * math.cos(al)) ** 2 + (ry[ki] * math.sin(al)) ** 2)
        s = np.clip((x / np.maximum(rand, 1e-6) + 1) / 2, 0, 1)
        som += tk.kleur_bij(T, s) * w[..., None]
        gewicht += w[..., None]
    beeld = som / np.maximum(gewicht, 1e-6)
    img = bpy.data.images.new('plaat-wapenrok', B, H, alpha=False)
    rgba = np.concatenate([beeld, np.ones((H, B, 1), np.float32)], axis=2)[::-1]
    img.pixels.foreach_set(rgba.ravel())
    img.filepath_raw = os.path.join(sh.UIT, 'plaat-wapenrok-textuur.png')
    img.file_format = 'PNG'
    img.save()
    ob.data.materials.append(onbelicht('plaat-wapenrok', img))
    return ob, rx, ry, zs


def onbelicht(naam, img):
    """De verf onbelicht (het licht zit in de tekening), aan beide kanten (de binnenkant donker)."""
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


def mat(naam, kleur, ruw=0.7, metaal=0.0):
    m = bpy.data.materials.new(naam)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*sh.lin(kleur)[:3], 1)
    b.inputs['Roughness'].default_value = ruw
    b.inputs['Metallic'].default_value = metaal
    return m


def capsule(naam, a, b, r, materiaal, r2=None):
    """Een gladde staaf van a naar b (de uiteinden rond), eventueel taps (r bij a, r2 bij b)."""
    d = b - a
    bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=r, depth=d.length, location=(a + b) / 2,
                                        rotation=Vector((0, 0, 1)).rotation_difference(d).to_euler())
    o = bpy.context.active_object
    o.name = naam
    if r2 is not None:
        for v in o.data.vertices:
            if v.co.z > 0:
                v.co.x *= r2 / r
                v.co.y *= r2 / r
    sh.zacht(o)
    o.data.materials.append(materiaal)
    for p, rr in ((a, r), (b, r2 or r)):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=rr, location=p)
        s = bpy.context.active_object
        s.name = naam
        sh.zacht(s)
        s.data.materials.append(materiaal)
    return o


def lijf(rx, ry, zs):
    """Voorlopig eenvoudig: benen in de grijsbeige broek met bruine laarzen, armen in gewatteerd bruin met handschoenen,
    een hoofd met een baard, de ketelhoed, en een speer."""
    broek, laars = mat('broek', '#8a7e64', 0.9), mat('laars', '#7a3a16', 0.6)
    mouw, hand = mat('mouw', '#7f401c', 0.7), mat('handschoen', '#5a2a12', 0.6)
    huid, baard = mat('huid', '#d89070', 0.6), mat('baard', '#2a1e16', 0.9)
    helm, hout = mat('helm', '#8c8476', 0.35, 0.8), mat('hout', '#7a3418', 0.7)
    breed = rx[-1] * 0.45  # de benen onder de rok
    for x in (-breed, breed):
        capsule('been', Vector((x, 0.0, 0.42)), Vector((x, 0.0, 0.16)), 0.075, broek, 0.06)
        capsule('laars', Vector((x, -0.01, 0.15)), Vector((x, -0.02, 0.04)), 0.07, laars, 0.065)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=1, location=(x, -0.06, 0.035))
        voet = bpy.context.active_object
        voet.scale = (0.065, 0.11, 0.04)
        voet.data.materials.append(laars)
        sh.zacht(voet)
    k0 = int(len(zs) * 0.06)
    sx = rx[k0] * 1.02  # de armen uit de armsgaten, naast de borst omlaag
    for x in (-sx, sx):
        s = 1 if x > 0 else -1
        capsule('arm', Vector((x, 0.0, zs[k0] - 0.02)), Vector((x + s * 0.03, -0.02, 0.62)), 0.065, mouw, 0.055)
        capsule('hand', Vector((x + s * 0.03, -0.02, 0.6)), Vector((x + s * 0.035, -0.03, 0.53)), 0.045, hand, 0.04)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.115, location=(0, 0.0, 1.08))
    kop = bpy.context.active_object
    kop.data.materials.append(huid)
    sh.zacht(kop)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=1, location=(0, -0.05, 1.02))
    b = bpy.context.active_object
    b.scale = (0.09, 0.07, 0.07)
    b.data.materials.append(baard)
    sh.zacht(b)
    capsule('nek', Vector((0, 0.0, SCHOUDER_Z - 0.04)), Vector((0, 0.0, 1.0)), 0.06, huid)
    # de ketelhoed: een koepel en een brede rand
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=1, location=(0, 0.01, 1.13))
    k = bpy.context.active_object
    k.scale = (0.135, 0.14, 0.13)
    k.data.materials.append(helm)
    sh.zacht(k)
    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=0.22, depth=0.01, location=(0, 0.01, 1.125))
    rand = bpy.context.active_object
    rand.data.materials.append(helm)
    capsule('speer', Vector((-sx - 0.06, -0.06, 0.02)), Vector((-sx - 0.06, -0.06, 1.55)), 0.016, hout)


def main():
    os.makedirs(sh.UIT, exist_ok=True)
    sc = sh.scene()
    a, mag = plaat()
    ob, rx, ry, zs = wapenrok(a, mag)
    lijf(rx, ry, zs)
    # het licht van eigen.py voor spelmaat, en de camera zo dat hij even groot is als de speerman
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
    print('PLAATSOLDAAT KLAAR')


main()
