# De vaste opstelling van de stijl (vraag 192): één camera en één licht voor figuren, gebouwen en tegels, uit instellingen.json. De
# camera staat stil en de figuur draait, dus het licht valt in elke richting van linksboven in beeld.
import json
import math
import os

import bpy
from mathutils import Vector

HIER = os.path.dirname(os.path.abspath(__file__))
INST = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))


def videokaart(scene):
    """CUDA: OptiX werkt niet op de 1080 Ti (ontwerp/gereedschap.md, bij Blender als basis)."""
    scene.render.engine = 'CYCLES'
    p = bpy.context.preferences.addons['cycles'].preferences
    p.compute_device_type = 'CUDA'
    p.get_devices()
    for d in p.devices:
        d.use = d.type == 'CUDA'
    scene.cycles.device = 'GPU'


def camera(scene, elevatie=None, ortho=None, doel_z=None):
    c = INST['camera']
    e = math.radians(c['elevatie'] if elevatie is None else elevatie)
    cam = scene.camera
    if cam is None:
        cam = bpy.data.objects.new('camera', bpy.data.cameras.new('camera'))
        scene.collection.objects.link(cam)
        scene.camera = cam
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = c['ortho_meter'] if ortho is None else ortho
    cam.data.clip_start, cam.data.clip_end = 0.1, 100.0
    doel = Vector((0.0, 0.0, c['doel_z'] if doel_z is None else doel_z))
    cam.location = doel + Vector((0.0, -math.cos(e), math.sin(e))) * 20.0
    cam.rotation_euler = (doel - cam.location).to_track_quat('-Z', 'Y').to_euler()
    return cam


def licht(scene):
    l = INST['licht']
    zon = bpy.data.objects.get('zon')
    if zon is None:
        zon = bpy.data.objects.new('zon', bpy.data.lights.new('zon', 'SUN'))
        scene.collection.objects.link(zon)
    zon.data.energy = l['zon_sterkte']
    zon.data.color = l['zon_kleur']
    zon.data.angle = math.radians(l['zon_hoek'])
    zon.rotation_euler = (-Vector(l['zon_richting'])).to_track_quat('-Z', 'Y').to_euler()
    # glanslicht: alleen in de glans, een brede streep licht op het metaal en het leer, die de kleuren van de stof met rust laat
    gl = bpy.data.objects.get('glans')
    if gl is None:
        gl = bpy.data.objects.new('glans', bpy.data.lights.new('glans', 'SUN'))
        scene.collection.objects.link(gl)
    gl.data.energy = l['glans_sterkte']
    gl.data.color = (1.0, 0.97, 0.92)
    gl.data.angle = math.radians(l['glans_hoek'])
    gl.rotation_euler = (-Vector(l['glans_richting'])).to_track_quat('-Z', 'Y').to_euler()
    gl.visible_diffuse = False
    gl.visible_shadow = False
    # randlicht: koel van achter, zwak, houdt het silhouet los van de grond
    rd = bpy.data.objects.get('rand')
    if rd is None:
        rd = bpy.data.objects.new('rand', bpy.data.lights.new('rand', 'SUN'))
        scene.collection.objects.link(rd)
    rd.data.energy = l['rand_sterkte']
    rd.data.color = l['rand_kleur']
    rd.data.angle = math.radians(20)
    rd.rotation_euler = (-Vector(l['rand_richting'])).to_track_quat('-Z', 'Y').to_euler()
    rd.visible_shadow = False
    # de hemel: boven koel, onder warm teruggekaatst van de grond; dat houdt de schaduw kleurig en nooit zwart
    w = bpy.data.worlds.get('hemel') or bpy.data.worlds.new('hemel')
    scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    uit = nt.nodes.new('ShaderNodeOutputWorld')
    bg = nt.nodes.new('ShaderNodeBackground')
    co = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    ramp = nt.nodes.new('ShaderNodeMapRange')
    ramp.inputs['From Min'].default_value = -1.0
    ramp.inputs['From Max'].default_value = 1.0
    kl = nt.nodes.new('ShaderNodeValToRGB')
    cr = kl.color_ramp
    cr.elements[0].position = 0.25
    cr.elements[0].color = (*l['hemel_onder'], 1)
    cr.elements[1].position = 0.92
    cr.elements[1].color = (*l['hemel_boven'], 1)
    m = cr.elements.new(0.52)
    m.color = (*l['hemel_midden'], 1)
    nt.links.new(co.outputs['Generated'], sep.inputs[0])
    nt.links.new(sep.outputs['Z'], ramp.inputs['Value'])
    nt.links.new(ramp.outputs['Result'], kl.inputs['Fac'])
    nt.links.new(kl.outputs['Color'], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = l['hemel_sterkte']
    nt.links.new(bg.outputs[0], uit.inputs[0])


def render_stand(scene, pixels=None, monsters=None):
    r = INST['render']
    videokaart(scene)
    scene.cycles.samples = r['monsters'] if monsters is None else monsters
    scene.cycles.use_denoising = r['ruisfilter']
    scene.cycles.use_adaptive_sampling = False
    scene.cycles.seed = 192
    scene.cycles.max_bounces = 6
    scene.cycles.diffuse_bounces = 3
    scene.cycles.glossy_bounces = 2
    scene.render.film_transparent = True
    scene.render.resolution_x = scene.render.resolution_y = r['pixels'] if pixels is None else pixels
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.view_settings.view_transform = 'Standard'
    scene.view_settings.look = 'None'
    scene.view_settings.exposure = r['belichting']


def zet_op(scene, elevatie=None, pixels=None, monsters=None, ortho=None, doel_z=None):
    camera(scene, elevatie, ortho, doel_z)
    licht(scene)
    render_stand(scene, pixels, monsters)
