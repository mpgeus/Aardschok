# De gedeelde materialen (vraag 192): één shader voor alles, en per materiaal een recept uit materialen.json. De kleur staat
# als verf op de punten van de mesh (de attributen 'verf', 'ruwheid', 'metaal', 'stof'), uit de plek in rust, zodat hij niet
# schuift als de figuur beweegt en er geen UV-kaart nodig is. Zo delen figuren, gebouwen en tegels dezelfde taal.
import json
import os

import numpy as np

import vorm as V

HIER = os.path.dirname(os.path.abspath(__file__))
BIB = {k: v for k, v in json.load(open(os.path.join(HIER, 'materialen.json'), encoding='utf-8')).items() if not k.startswith('_')}


def lin(hexkleur):
    """Van sRGB (#rrggbb) naar lineair."""
    c = np.array([int(hexkleur[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _mix(a, b, t):
    t = np.clip(t, 0.0, 1.0)[..., None]
    return a * (1.0 - t) + b * t


# hoe sterk het geschilderde licht in de verf zit: boven lichter, onder donkerder, in de eigen licht- en schaduwkleur
GESCHILDERD = {'boven': 0.34, 'onder': 0.42}


def verf(naam, P, bol, zaad=1, schaal_bol=0.012, N=None):
    """De verf van een materiaal op punten P (rust), met hun bolling (vorm.bolling) en normaal. Geeft kleur (lineair, n x 3), ruwheid,
    metaal, stof en spiegeling. In lagen, zoals een schilder: grote vlekken, de korrel, het licht over de hele vorm, en dan de holten en
    randen. Het licht zit dus ook in de verf: dat maakt de vorm rijk, en de schaduw kleurig in plaats van alleen donker."""
    m = BIB[naam]
    n = len(P)
    basis = np.broadcast_to(lin(m['basis']), (n, 3)).copy()
    # grote vlekken
    v = V.ruis(P.astype(np.float32), m['vlek_schaal'], zaad, 3)
    c = _mix(basis, lin(m['vlek']), (v - 0.45) * 2.4 * m['vlek_sterkte'])
    # korrel, eventueel uitgerekt langs een as (nerf in hout, sprieten in stro)
    s = np.full(3, m['korrel_schaal'], dtype=np.float32)
    if m.get('as'):
        s['xyz'.index(m['as'])] *= 9.0
    k = V.ruis(P.astype(np.float32), s, zaad + 7, 2)
    c = c * (1.0 + (k[..., None] - 0.5) * 2.0 * m['korrel_sterkte'])
    # het licht over de hele vorm; de figuur draait alleen om de lengteas, dus boven blijft boven
    if N is not None and not m.get('metaal'):
        nz = np.clip(np.asarray(N)[..., 2], -1.0, 1.0)
        c = _mix(c, lin(m['licht']), np.clip(nz, 0, 1) ** 1.5 * GESCHILDERD['boven'])
        c = _mix(c, lin(m['schaduw']), np.clip(-nz, 0, 1) ** 1.2 * GESCHILDERD['onder'])
    # de vorm: holten naar de schaduwkleur, randen naar het licht
    c = _mix(c, lin(m['schaduw']), -bol / schaal_bol * 0.75)
    c = _mix(c, lin(m['licht']), bol / schaal_bol * 0.55)
    ruw = np.full(n, m['ruwheid'], dtype=np.float64) + (k - 0.5) * 0.08
    return (c, ruw, np.full(n, m['metaal'], dtype=np.float64), np.full(n, m['stof'], dtype=np.float64), np.full(n, m.get('spiegel', 0.25), dtype=np.float64))


def meng(a, b, t):
    """Twee verven mengen (kleur, ruwheid, metaal, stof, spiegeling), met t per punt."""
    t = np.clip(t, 0, 1)
    return (_mix(a[0], b[0], t), *[x + (y - x) * t for x, y in zip(a[1:], b[1:])])


def kleur(hexkleur, v):
    """Dezelfde verf in een andere kleur: voor wat erop geschilderd wordt (een naad, een stiksel, een oog)."""
    return (np.broadcast_to(lin(hexkleur), v[0].shape).copy(), *v[1:])


def kleur_van(naam, soort, v):
    """Idem, met een kleur uit de bibliotheek ('schaduw' of 'licht' van een materiaal)."""
    return kleur(BIB[naam][soort], v)


def shader(bpy):
    """De ene shader van de stijl: Principled BSDF op de attributen."""
    naam = 'Stijl'
    if naam in bpy.data.materials:
        return bpy.data.materials[naam]
    mat = bpy.data.materials.new(naam)
    mat.use_nodes = True
    nt = mat.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    knoop = {}
    for attr, ingang in (('verf', None), ('ruwheid', 'Roughness'), ('metaal', 'Metallic'), ('stof', 'Sheen Weight'), ('spiegel', 'Specular IOR Level')):
        n = nt.nodes.new('ShaderNodeAttribute')
        n.attribute_name = attr
        knoop[attr] = n
        if ingang:
            nt.links.new(n.outputs['Fac'], b.inputs[ingang])
    # contactschaduw tussen de lagen (de riem op de tabberd, de rand op het gezicht): zo lezen de lagen, en in een warme toon
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
    ao.samples = 8
    ao.inputs['Distance'].default_value = 0.055
    macht = nt.nodes.new('ShaderNodeMath')
    macht.operation = 'POWER'
    nt.links.new(ao.outputs['AO'], macht.inputs[0])
    macht.inputs[1].default_value = 1.15
    donker = nt.nodes.new('ShaderNodeMix')
    donker.data_type = 'RGBA'
    donker.blend_type = 'MULTIPLY'
    donker.inputs['Factor'].default_value = 1.0
    nt.links.new(knoop['verf'].outputs['Color'], donker.inputs['A'])
    kleur = nt.nodes.new('ShaderNodeMix')
    kleur.data_type = 'RGBA'
    ct = nt.nodes.new('ShaderNodeAttribute')
    ct.attribute_name = 'contact'
    een = nt.nodes.new('ShaderNodeMath')
    een.operation = 'SUBTRACT'
    een.inputs[0].default_value = 1.0
    nt.links.new(ct.outputs['Fac'], een.inputs[1])
    maxi = nt.nodes.new('ShaderNodeMath')
    maxi.operation = 'MAXIMUM'
    nt.links.new(macht.outputs[0], maxi.inputs[0])
    nt.links.new(een.outputs[0], maxi.inputs[1])
    nt.links.new(maxi.outputs[0], kleur.inputs['Factor'])
    kleur.inputs['A'].default_value = (0.34, 0.22, 0.22, 1)
    kleur.inputs['B'].default_value = (1, 1, 1, 1)
    nt.links.new(kleur.outputs['Result'], donker.inputs['B'])
    nt.links.new(donker.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Sheen Roughness'].default_value = 0.7
    b.inputs['Sheen Tint'].default_value = (1.0, 0.9, 0.8, 1)
    return mat


def shader_textuur(bpy, naam, kleur_, eigen, normaal):
    """Dezelfde shader, met de verf uit texturen (textuur.py): kleur in sRGB, eigen met ruwheid (R), metaal (G), spiegeling (B) en stof (A), en
    een normal map uit het dichte model. De contactschaduw blijft op het punt, want die hoort bij de lagen."""
    mat = bpy.data.materials.new(naam)
    mat.use_nodes = True
    nt = mat.node_tree
    b = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
    tk = nt.nodes.new('ShaderNodeTexImage')
    tk.image = kleur_
    te = nt.nodes.new('ShaderNodeTexImage')
    te.image = eigen
    sep = nt.nodes.new('ShaderNodeSeparateColor')
    nt.links.new(te.outputs['Color'], sep.inputs[0])
    nt.links.new(sep.outputs['Red'], b.inputs['Roughness'])
    nt.links.new(sep.outputs['Green'], b.inputs['Metallic'])
    nt.links.new(sep.outputs['Blue'], b.inputs['Specular IOR Level'])
    nt.links.new(te.outputs['Alpha'], b.inputs['Sheen Weight'])
    tn = nt.nodes.new('ShaderNodeTexImage')
    tn.image = normaal
    nm = nt.nodes.new('ShaderNodeNormalMap')
    nt.links.new(tn.outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    # de contactschaduw, zoals in shader()
    ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
    ao.samples = 8
    ao.inputs['Distance'].default_value = 0.055
    macht = nt.nodes.new('ShaderNodeMath')
    macht.operation = 'POWER'
    nt.links.new(ao.outputs['AO'], macht.inputs[0])
    macht.inputs[1].default_value = 1.15
    ct = nt.nodes.new('ShaderNodeAttribute')
    ct.attribute_name = 'contact'
    een = nt.nodes.new('ShaderNodeMath')
    een.operation = 'SUBTRACT'
    een.inputs[0].default_value = 1.0
    nt.links.new(ct.outputs['Fac'], een.inputs[1])
    maxi = nt.nodes.new('ShaderNodeMath')
    maxi.operation = 'MAXIMUM'
    nt.links.new(macht.outputs[0], maxi.inputs[0])
    nt.links.new(een.outputs[0], maxi.inputs[1])
    kl = nt.nodes.new('ShaderNodeMix')
    kl.data_type = 'RGBA'
    nt.links.new(maxi.outputs[0], kl.inputs['Factor'])
    kl.inputs['A'].default_value = (0.34, 0.22, 0.22, 1)
    kl.inputs['B'].default_value = (1, 1, 1, 1)
    do = nt.nodes.new('ShaderNodeMix')
    do.data_type = 'RGBA'
    do.blend_type = 'MULTIPLY'
    do.inputs['Factor'].default_value = 1.0
    nt.links.new(tk.outputs['Color'], do.inputs['A'])
    nt.links.new(kl.outputs['Result'], do.inputs['B'])
    nt.links.new(do.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Sheen Roughness'].default_value = 0.7
    b.inputs['Sheen Tint'].default_value = (1.0, 0.9, 0.8, 1)
    return mat


def zet_verf(mesh, verf_, contact=1.0):
    """De verf op de mesh, als attributen op de punten. contact: hoe sterk de contactschaduw telt (op een gezicht weinig)."""
    c, ruw, met, stof, spiegel = verf_
    at = mesh.attributes.new('contact', 'FLOAT', 'POINT')
    at.data.foreach_set('value', np.full(len(c), contact, dtype=np.float32))
    a = mesh.color_attributes.new('verf', 'FLOAT_COLOR', 'POINT')
    rgba = np.ones((len(c), 4), dtype=np.float32)
    rgba[:, :3] = np.clip(c, 0.0, 1.0)
    a.data.foreach_set('color', rgba.ravel())
    for naam, w in (('ruwheid', ruw), ('metaal', met), ('stof', stof), ('spiegel', spiegel)):
        at = mesh.attributes.new(naam, 'FLOAT', 'POINT')
        at.data.foreach_set('value', np.clip(w, 0.0, 1.0).astype(np.float32))
