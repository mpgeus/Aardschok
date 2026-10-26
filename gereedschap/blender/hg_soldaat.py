# Proef met Human Generator (vraag 190; Marcel, 26 okt: "probeer de soldaat met Human Generator verder: onze helm,
# wapenrok en kleuren erop. en ook verder de afmetingen aanpassen", "hij moet wat groter worden"; ontwerp/opmerkingen.md,
# "Human Generator als bron voor mensen"): een man uit Human Generator in de aankleding naar Marcels plaat (uitrusting.py,
# met de wapenrok en de kraag van speerman_hd.py), en een speer, gerenderd met de camera en het licht van eigen.py.
#
# De bouwers van de speerman vragen het skelet van MPFB (botten als `neck01`, `special04`, `upperarm01.L`) en de
# armgroepen van zijn lijf (`upperarm`, `lowerarm`, `wrist`, `finger`): `Nep` geeft die plekken uit het skelet van Human
# Generator (Rigify-achtig: `neck`, `jaw`, `upper_arm.L`), en `vorm` maakt van zijn lijf en kleren een kopie zoals ze nu
# staan, met de groepen op de namen van MPFB.
#
#   blender.exe -b -P gereedschap/blender/hg_soldaat.py -- <map> [Z ZW W NW N NO O ZO]
import math
import os
import sys
import time
from types import SimpleNamespace

import addon_utils
import bpy
from mathutils import Matrix, Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import speerman_hd as sh  # noqa: E402
import uitrusting as ui  # noqa: E402

INHOUD = os.path.normpath('C:/Users/mpgeu/Downloads/Gen1/HUMAN GEN 4') + os.sep  # de inhoud van Human Generator
RICHTINGEN = [a for a in sh.ARGS[1:] if a in sh.RICHTINGEN] or ['Z', 'ZW', 'W', 'N']
BEELD = {'Z': 5, 'ZW': 40, 'W': 65, 'NW': 135, 'N': 185, 'NO': -145, 'O': -65, 'ZO': -40}  # de draaiing per richting (eigen.py)
# de man: zo gedrongen als de knoppen toelaten (zie de speerman: een korte, brede soldaat met korte benen en een groot
# hoofd); de knoppen lopen verder dan -1 tot 1
LENGTE = 150  # centimeter, het laagste dat Human Generator kent
LIJF = {'muscular': 1.0, 'overweight': 0.8, 'skinny': 0.0, 'Stylized': 1.0, 'Shoulder Width': 1.5, 'Chest Width': 1.2,
        'Belly Size': 0.6, 'Neck Length': -1.5, 'Thigh Length': -1.5, 'Shin Length': -1.5, 'Upper Arm Thickness': 0.8,
        'Forearm Thickness': 0.8, 'Thigh Thickness': 0.8, 'Shin Thickness': 0.5, 'Waist Thickness': 0.8,
        'Traps Muscles': 0.8, 'Hand Width': 0.5}
HOOFD = 1.3  # het hoofd zoveel groter (het bot), zoals de speerman (speerman_hd.INSTELLINGEN['hoofd'])
HOOGTE = 1520  # pixels van de voeten tot de top van de helm bij volle maat (de speerman 1450; Marcel: "wat groter")
# de groepen van Human Generator op de namen van MPFB, voor speerman_hd.gewicht
GROEPEN = (('upper_arm', 'upperarm01'), ('forearm', 'lowerarm01'), ('hand', 'wrist'), ('palm', 'metacarpal'),
           ('f_', 'finger'), ('thumb', 'finger'), ('thigh', 'upperleg01'), ('shin', 'lowerleg01'))


class Nep:
    """Het skelet van Human Generator zoals de bouwers van de speerman het vragen: de botten van MPFB op naam, met hun
    begin in de wereld (de kin is het eind van de kaak, het middel het begin van de tweede rugwervel)."""

    def __init__(self, rig):
        bpy.context.view_layer.update()
        W = lambda b: rig.matrix_world @ rig.pose.bones[b].head
        T = lambda b: rig.matrix_world @ rig.pose.bones[b].tail
        plek = {'head': W('head'), 'neck01': W('neck'), 'neck02': (W('neck') + T('neck')) / 2, 'special04': T('jaw'),
                'spine03': W('spine.001')}
        for k in ('L', 'R'):
            plek[f'eye.{k}'] = W(f'eyeball.{k}')
            plek[f'upperarm01.{k}'] = W(f'upper_arm.{k}')
            plek[f'lowerarm01.{k}'] = W(f'forearm.{k}')
            plek[f'wrist.{k}'] = W(f'hand.{k}')
            plek[f'lowerleg01.{k}'] = W(f'shin.{k}')
        self.matrix_world = Matrix.Identity(4)
        self.pose = SimpleNamespace(bones={n: SimpleNamespace(head=p, tail=p) for n, p in plek.items()})


def vorm(obs, naam):
    """Een kopie van delen zoals ze nu staan (de houding en de vormsleutels erin), in de wereld, zonder maskers en haar,
    samen één mesh, met de groepen op de namen van MPFB. Niet zichtbaar: alleen om op te meten en tegenaan te bouwen."""
    delen = []
    for ob in obs:
        uit = [m for m in ob.modifiers if m.type in ('MASK', 'PARTICLE_SYSTEM') and m.show_viewport]
        for m in uit:
            m.show_viewport = False
        deps = bpy.context.evaluated_depsgraph_get()
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(deps), preserve_all_data_layers=True, depsgraph=deps)
        for m in uit:
            m.show_viewport = True
        me.transform(ob.matrix_world)
        kopie = bpy.data.objects.new(naam, me)
        bpy.context.scene.collection.objects.link(kopie)
        for g in kopie.vertex_groups:  # de mesh nam de groepen mee: alleen hernoemen
            g.name = next((n + g.name[len(o):] for o, n in GROEPEN if g.name.startswith(o)), g.name)
        delen.append(kopie)
    if len(delen) > 1:
        bpy.ops.object.select_all(action='DESELECT')
        for d in delen:
            d.select_set(True)
        bpy.context.view_layer.objects.active = delen[0]
        bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active if len(delen) > 1 else delen[0]
    ob.name = naam
    ob.hide_render = True
    return ob


def man():
    """De man uit Human Generator: gedrongen, 45, kort haar en een volle baard, in het piratenpak (het enige oude pak in
    de basisinhoud) zonder hoed, de armen wat van het lijf, en het hoofd groter."""
    from HumGen3D import Human
    opties = Human.get_preset_options('male')
    mens = Human.from_preset(next(o for o in opties if 'Caucasian' in o))
    mens.height.set(LENGTE)
    mens.age.set(45)
    for k in mens.body.keys:
        if k.name in LIJF:
            k.value = LIJF[k.name]
    mens.hair.regular_hair.set(next(o for o in mens.hair.regular_hair.get_options() if 'Short Side Combed' in o))
    mens.hair.face_hair.set(next(o for o in mens.hair.face_hair.get_options() if 'Full_Beard_1' in o))
    mens.clothing.outfit.set(next(o for o in mens.clothing.outfit.get_options() if 'Pirate' in o))
    mens.clothing.footwear.set(next(o for o in mens.clothing.footwear.get_options() if 'Pirate' in o))
    mens.pose.set(next(o for o in mens.pose.get_options() if 'Base IA Pose' in o))  # de armen wat van het lijf af
    rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
    rig.pose.bones['head'].scale = (HOOFD, HOOFD, HOOFD)
    for ob in list(bpy.data.objects):
        if ob.name.startswith('HG_Pirate_Hat'):
            bpy.data.objects.remove(ob)
    bpy.context.view_layer.update()
    return rig


def kleding(rig):
    """De aankleding naar Marcels plaat (uitrusting.py): de ketelhoed, de maliënkraag, de gevierendeelde wapenrok met de
    donkere randen om de armsgaten, de riem met de riemeinden en het tasje, op de mouwen een maliënrand en een manchet,
    handschoenen; het hemd wordt de gewatteerde mouwen, de broek de grijsbeige wol, de laarzen bruin leer."""
    kleren = [o for o in bpy.data.objects if o.name.startswith('HG_Pirate_')]
    hemd = next(o for o in kleren if 'Shirt' in o.name)
    lijf = vorm([bpy.data.objects['HG_Body']] + [o for o in kleren if 'Shirt' in o.name or 'Pants' in o.name], 'hg-vorm')
    alleen_lijf = vorm([bpy.data.objects['HG_Body']], 'hg-lijf')
    mouwen = vorm([hemd], 'hg-mouwen')
    nep = Nep(rig)
    sh.INSTELLINGEN['hoofd'] = HOOFD
    riem_z = nep.pose.bones['spine03'].head.z
    nek = nep.pose.bones['neck01'].head
    cy = nek.y + 0.01
    M = ui.materialen()
    M['wapenrok'] = ui.mat_kwartier(riem_z + 0.55 * (nek.z - riem_z), riem_z, cy)
    for ob in kleren:
        ob.data.materials.clear()
        ob.data.materials.append(M['mouw'] if 'Shirt' in ob.name else M['broek'] if 'Pants' in ob.name else M['laars'])
    lijfje, rok = sh.wapenrok(lijf, nep, mouwen, M, riem_z)
    sh.armsgat_zoom(lijf, nep, mouwen, lijfje, M)
    ui.riem(sh.bvh_van([(lijfje, None), (rok, None)]), cy, riem_z, M)
    ui.maliekraag(lijf, nep, mouwen, lijfje, M)
    ui.mouwranden(mouwen, nep, M)
    ui.handschoenen(alleen_lijf, M)
    helm = ui.ketelhoed(lijf, nep, M)
    return M, [o for o in helm if o.type == 'MESH']


def speer(rig, M, top):
    """Een speer rechtop naast de rechterhand (de hand sluit er niet om: alleen om te zien hoe hij als soldaat leest),
    met de schacht, de koker en het blad van de speerman, zo'n 1,3 keer zo lang als de man."""
    hand = rig.matrix_world @ rig.pose.bones['hand.R'].tail
    L = top * 1.32
    delen = []
    for naam, z0, z1, r, mat in (('schacht', 0.02, L * 0.86, 0.025, M['hout']), ('koker', L * 0.84, L * 0.88, 0.027, M['staal'])):
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=r, depth=z1 - z0, location=(hand.x, hand.y, (z0 + z1) / 2))
        o = bpy.context.active_object
        o.name = 'speer.' + naam
        sh.zacht(o)
        o.data.materials.append(mat)
        delen.append(o)
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.07, radius2=0.0, depth=L * 0.13, location=(hand.x, hand.y, L * 0.88 + L * 0.065))
    o = bpy.context.active_object
    o.name = 'speer.blad'
    o.scale = (1.0, 0.35, 1.0)
    o.data.materials.append(M['blad'])
    delen.append(o)
    return delen


def camera_op(sc, top):
    """De camera van speerman_hd.scene, maar met zoveel pixels per meter dat de top van de helm HOOGTE pixels boven de
    voeten komt."""
    b, h = sh.INSTELLINGEN['res']
    pxm = HOOGTE / top
    cam = sc.camera
    cam.data.ortho_scale = h / pxm
    a = math.radians(sh.INSTELLINGEN['camera'])
    kijk = Vector((0, math.cos(a), -math.sin(a)))
    op = Vector((0, math.sin(a), math.cos(a)))
    cam.location = op * ((sh.INSTELLINGEN['anker_y'] - h / 2) / pxm) - kijk * 20
    print('HG PXM', round(pxm, 1), 'top', round(top, 3), 'm')


def licht(sc):
    """Het licht van eigen.py voor spelmaat (LICHT)."""
    zon = bpy.data.objects['zon']
    zon.rotation_euler = Vector((-0.82, -0.32, 0.48)).normalized().to_track_quat('Z', 'Y').to_euler()
    zon.data.energy, zon.data.angle = 5.0, math.radians(8)
    bpy.data.objects['vul'].data.energy = 0.65
    sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35
    sc.view_settings.exposure = 0.6
    sc.view_settings.look = 'Medium High Contrast'
    sc.render.use_freestyle = False


def main():
    sc = sh.scene()
    # scene() begint met de fabrieksinstellingen: Human Generator weer aan, met zijn inhoud
    addon_utils.enable('HumGen3D', default_set=True, persistent=False)
    bpy.context.preferences.addons['HumGen3D'].preferences.filepath = INHOUD
    for ob in list(bpy.data.objects):
        if ob.type == 'MESH':
            bpy.data.objects.remove(ob)
    t = time.time()
    rig = man()
    M, helm = kleding(rig)
    top = max((o.matrix_world @ v.co).z for o in helm for v in o.data.vertices)
    speer(rig, M, top)
    print('HG GEBOUWD in', round(time.time() - t, 1), 's')
    camera_op(sc, top)
    licht(sc)
    sc.cycles.samples = 32
    sc.render.resolution_percentage = 50
    cam = sc.camera
    lichten = {bpy.data.objects[n]: bpy.data.objects[n].matrix_world.copy() for n in ('zon', 'rand', 'vul')}
    m0 = cam.matrix_world.copy()
    for r in RICHTINGEN:
        R = Matrix.Rotation(math.radians(BEELD[r]), 4, 'Z')
        cam.matrix_world = R @ m0
        for ob, m in lichten.items():
            ob.matrix_world = R @ m
        sc.render.filepath = os.path.join(sh.UIT, f'hg-{r}-staan.png')
        bpy.ops.render.render(write_still=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(sh.UIT, 'hg-soldaat.blend'))
    print('HG KLAAR')


main()
