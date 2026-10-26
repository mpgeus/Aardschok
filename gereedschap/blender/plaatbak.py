# Uitvouwen en bakken met Marcels plaat (vraag 190; Marcel, 26 okt: "Ik wil graag nog een proef doen met uv wrapping op
# een 3d model uit code", "op basis van de platen in de extra map"; beeld.md, "De proef met uitvouwen en bakken met de
# plaat"): de wapenrok van ons model (speerman_hd.py) uitgevouwen, en de wapenrokken van de plaat uit vijf richtingen
# (EXTRA/Middeleeuwse krijgeruitrusting spritesheet.png, de derde rij) erin gebakken, zoals bakken.py dat op 24 okt met
# vel 01 deed. Daarna loopt eigen.py gewoon door (staan, lopen, met de rok als stof): de verf zit in de textuur van de
# mesh, dus hij beweegt mee.
#
#   blender.exe -b -P gereedschap/blender/eigen.py -- <map> Z plaatmasker     de maskers uit de vijf richtingen
#   python gereedschap/blender/plaatverf.py <map> alle                        de plaat per richting naar zijn masker
#   blender.exe -b -P gereedschap/blender/eigen.py -- <map> Z ZW W N ... plaat [staan]   bakken, dan renderen
import json
import math
import os

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

import speerman_hd as sh
import bakken as bk

DELEN = ('wapenrok-lijf', 'wapenrok-rok')  # zonder de gouden zoom om de armsgaten: die houdt zijn eigen materiaal
# per richting de draaiing van de camera (speerman_hd.RICHTINGEN) en welke wapenrok van de plaat (van links af geteld):
# 0 van voren, 1 schuin voor met zijn linkerkant, 2 zijn linkerkant, 3 de rug, 4 zijn rechterkant
RICHTINGEN = {'Z': 0, 'ZW': 1, 'W': 2, 'N': 3, 'O': 4}
ATLAS = 2048
# hoe sterk de richting die een plek het best ziet voorgaat (bakken.MACHT is 3): met 3 middelde hij vijf tekeningen tot een
# dambord, want de vierendelen liggen op de tekeningen van verschillende kanten niet precies op dezelfde plek
MACHT = 12


def delen():
    return [bpy.data.objects[n] for n in DELEN]


def maskers(sc):
    """Per richting de wapenrok alleen, wit (zonder wat ervoor staat: de tekening van de plaat heeft geen armen), en de rij
    in beeld van de riem (masker-<r>.json), voor plaatverf.py."""
    wapenrok = delen()
    verborgen = [o for o in sc.objects if o.type in ('MESH', 'CURVE') and o not in wapenrok and not o.hide_render]
    for o in verborgen:
        o.hide_render = True
    k = sh.Knopen('masker')
    k.nt.nodes.remove(k.bsdf)
    em = k.n('ShaderNodeEmission')
    em.inputs['Color'].default_value = (1, 1, 1, 1)
    k.nt.links.new(em.outputs[0], k.uit.inputs['Surface'])
    vl = sc.view_layers[0]
    vl.material_override = k.m
    sc.render.film_transparent = True
    sc.render.use_freestyle = False
    sc.cycles.samples = 4
    rok = bpy.data.objects['wapenrok-rok']
    midden = Vector((0.0, rok['midden_y'], rok['z_riem']))
    cam = sc.camera
    m0 = cam.matrix_world.copy()
    h = sc.render.resolution_y * sc.render.resolution_percentage / 100
    for r in RICHTINGEN:
        cam.matrix_world = Matrix.Rotation(math.radians(sh.RICHTINGEN[r]), 4, 'Z') @ m0
        bpy.context.view_layer.update()
        sc.render.filepath = os.path.join(sh.UIT, f'masker-{r}.png')
        bpy.ops.render.render(write_still=True)
        json.dump({'riem': (1 - world_to_camera_view(sc, cam, midden).y) * h},
                  open(os.path.join(sh.UIT, f'masker-{r}.json'), 'w'))
    cam.matrix_world = m0
    vl.material_override = None
    for o in verborgen:
        o.hide_render = False


def bak_wapenrok(sc):
    """De wapenrok uitgevouwen en de vijf richtingen erin gebakken (verf-<r>.png van plaatverf.py), per deel een eigen
    textuur, onbelicht (het licht zit in de verf)."""
    bk.VERF = list(RICHTINGEN)  # de richtingen die bakken.per_richting en bakmateriaal gebruiken
    bk.UIT = sh.UIT
    bk.ATLAS = ATLAS
    bk.MACHT = MACHT
    for ob in delen():
        # uitgevouwen zonder de dikte (die neemt de UV-kaart mee), zodat de rok zijn rijen houdt voor de stof
        bk.uitvouwen(ob)
        bk.per_richting(sc, ob, bk.VERF)
        atlas = bk.bakmateriaal(ob)
        atlas.name = f'atlas-{ob.name}'
        sc.render.engine = 'CYCLES'
        sc.cycles.samples = 16
        sc.render.bake.margin = 8
        bk.actief(ob)
        bpy.ops.object.bake(type='EMIT', use_clear=True)
        atlas.filepath_raw = os.path.join(sh.UIT, f'atlas-{ob.name}.png')
        atlas.file_format = 'PNG'
        atlas.save()
        bk.eindmateriaal(ob, atlas)
        print('GEBAKKEN', ob.name)
