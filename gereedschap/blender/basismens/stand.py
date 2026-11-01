# De basismens: standen en gebieden, gedeeld door bouw.py, render.py en controle.py. Een stand draait botten bovenop de
# rust (de A-houding blijft de technische rust); een gebied is een plek op het lijf in rust (het kruis, een heup, een
# oksel), waar de huid bij buigen het meest rekt.
import math

import bpy
from mathutils import Matrix, Vector


def gebied(rig, naam):
    """Het midden van een gebied, in de ruimte van het skelet in rust."""
    return gebied_rust(lambda b: rig.data.bones[b].head_local, naam)


def gebied_rust(W, naam):
    """Het midden van een gebied; W(bot) geeft het begin van een bot in rust."""
    if naam == 'kruis':
        return (W('upperleg01.L') + W('upperleg01.R')) / 2 - Vector((0, 0, 0.07))
    kant = naam.split('.')[1]
    if naam.startswith('heup'):
        return W(f'upperleg01.{kant}').copy()
    if naam.startswith('oksel'):
        return W(f'upperarm01.{kant}') - Vector((0, 0, 0.07))
    raise KeyError(naam)


def regels(stand):
    """Een stand als lijst (bot, as, waarde): uit de lijst van de houdingen, of uit de buigtest ({bot: [as, graden]})."""
    if isinstance(stand, dict):
        return [(b, a, g) for b, (a, g) in stand.items() if not b.startswith('_')]
    return [tuple(r) + (None,) * (3 - len(r)) for r in stand]


def zet(rig, stand):
    """De botten na elkaar, met de botten eronder mee. Per regel (bot, as, waarde):
    - as [x, y, z] (een richting van het skelet in rust) of 'x', 'y', 'z' (een as van het bot): zoveel graden draaien;
    - 'richt': het bot wijst naar de richting `waarde`, met de kleinste draai (zo hangt een arm recht, waar hij in rust
      ook stond);
    - 'rust': het bot houdt de stand die het in rust had (een voet blijft plat op de grond)."""
    for bot, as_, waarde in regels(stand):
        pb = rig.pose.bones[bot]
        M = pb.matrix.copy()
        h = M.translation.copy()
        if as_ == 'rust':
            nieuw = pb.bone.matrix_local.copy()
            nieuw.translation = h
        else:
            if as_ == 'richt':
                nu = (M.to_3x3() @ Vector((0, 1, 0))).normalized()
                R = nu.rotation_difference(Vector(waarde).normalized()).to_matrix().to_4x4()
            else:
                v = M.to_3x3().col['xyz'.index(as_)].normalized() if isinstance(as_, str) else Vector(as_)
                R = Matrix.Rotation(math.radians(waarde), 4, v)
            nieuw = Matrix.Translation(h) @ R @ Matrix.Translation(-h) @ M
        pb.matrix = nieuw
        bpy.context.view_layer.update()


def rust(rig):
    for pb in rig.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()


def laagste(ob):
    deps = bpy.context.evaluated_depsgraph_get()
    e = ob.evaluated_get(deps)
    me = e.to_mesh()
    z = min((ob.matrix_world @ v.co).z for v in me.vertices)
    e.to_mesh_clear()
    return z


def op_de_grond(rig, lijf):
    """Het hele lijf omhoog of omlaag (de wortel) tot zijn laagste punt op Z = 0; geeft hoeveel."""
    z0 = laagste(lijf)
    pb = rig.pose.bones['root']
    M = pb.matrix.copy()
    M.translation.z -= z0
    pb.matrix = M
    bpy.context.view_layer.update()
    return z0


def reik(rig, kant, doel, pool):
    """De arm van `kant` met de hand naar `doel` (in de ruimte van het skelet): de elleboog uit de lengtes van boven- en
    onderarm, naar de kant van `pool` gebogen; dan richten de botten zich daarop (stand 'richt'). Ronde 10, uit
    humgen/bewegingen.py; in ronde 14 hierheen, voor de loopstanden van stijlen.py."""
    B = rig.data.bones
    S = rig.pose.bones[f'upperarm01.{kant}'].head.copy()
    a, b = B[f'upperarm01.{kant}'].length, B[f'lowerarm01.{kant}'].length
    d = min((doel - S).length, a + b - 1e-4)
    rich = (doel - S).normalized()
    x = (a * a - b * b + d * d) / (2 * d)
    h = math.sqrt(max(a * a - x * x, 0.0))
    p = (Vector(pool) - rich * Vector(pool).dot(rich)).normalized()
    E = S + rich * x + p * h
    zet(rig, [(f'upperarm01.{kant}', 'richt', list(E - S)), (f'lowerarm01.{kant}', 'richt', list(S + rich * d - E))])
