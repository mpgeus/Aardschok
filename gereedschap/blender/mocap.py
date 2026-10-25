# Echte bewegingen uit motion capture op het skelet van de figuren (vraag 190, ontwerp/beeld.md; Marcel: "hij loopt nog
# echt houterig", "Zijn er geen addons voor natuurlijke bewegingen", "Cmu dan maar"). De opnames staan in beweging/ (met
# de bron en de voorwaarden in beweging/LEESMIJ.md): een skelet (.asf) en de bewegingen (.amc), zoals CMU ze geeft.
#
# Per bot van de opname de draai in de wereld ten opzichte van zijn ruststand; ons bot krijgt dezelfde draai, maar eerst
# wordt de ruststand van de opname gelijkgezet aan de onze (de opname staat met de benen twintig graden gespreid, wij niet:
# zonder dat liep hij met gekruiste benen). Uit de opname één pas (van de ene keer dat de linkervoet neerkomt tot de
# volgende), op de plaats (de voorwaartse beweging eruit, het zwaaien opzij en naar voren erin), sluitend gemaakt (het
# eind is weer het begin), en met de voeten op de grond: het bekken zakt tot de laagste voet de grond raakt.
import math
import os

from mathutils import Matrix, Quaternion, Vector

HIER = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HIER, 'beweging')
SCHAAL = (1.0 / 0.45) * 2.54 / 100.0  # van de eenheden van ASF/AMC naar meter (de FAQ van CMU)
P = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))  # van de opname (y omhoog, het gezicht naar +z) naar Blender (z omhoog, -y)

# welk bot van de opname elk van onze botten volgt (de armen niet: die houden met de IK de speer)
KOPPEL = {'root': 'root', 'spine05': 'lowerback', 'spine04': 'lowerback', 'spine03': 'upperback', 'spine02': 'upperback',
          'spine01': 'thorax', 'neck01': 'lowerneck', 'neck02': 'lowerneck', 'neck03': 'upperneck', 'head': 'head'}
for _k, _o in (('L', 'l'), ('R', 'r')):
    KOPPEL.update({f'upperleg01.{_k}': f'{_o}femur', f'upperleg02.{_k}': f'{_o}femur',
                   f'lowerleg01.{_k}': f'{_o}tibia', f'lowerleg02.{_k}': f'{_o}tibia', f'foot.{_k}': f'{_o}foot'})


def euler(ax, ay, az):
    """Graden, zoals in ASF/AMC: eerst om x, dan om y, dan om z."""
    return (Matrix.Rotation(math.radians(az), 3, 'Z') @ Matrix.Rotation(math.radians(ay), 3, 'Y')
            @ Matrix.Rotation(math.radians(ax), 3, 'X'))


def lees_asf(pad):
    """Het skelet: per bot de richting en lengte in rust, het assenstelsel (C), de vrijheden, en de kinderen."""
    botten, kinderen, deel, bot = {}, {}, None, None
    for regel in open(pad, encoding='latin-1'):
        w = regel.split()
        if not w or w[0].startswith('#'):
            continue
        if w[0].startswith(':'):
            deel = w[0]
            continue
        if deel == ':bonedata':
            if w[0] == 'begin':
                bot = {'dof': []}
            elif w[0] == 'end':
                bot['C'] = euler(*bot['axis'])
                botten[bot['name']] = bot
            elif w[0] == 'name':
                bot['name'] = w[1]
            elif w[0] == 'direction':
                bot['dir'] = Vector([float(x) for x in w[1:4]])
            elif w[0] == 'length':
                bot['len'] = float(w[1])
            elif w[0] == 'axis':
                bot['axis'] = [float(x) for x in w[1:4]]
            elif w[0] == 'dof':
                bot['dof'] = w[1:]
        elif deel == ':hierarchy' and w[0] not in ('begin', 'end'):
            kinderen[w[0]] = w[1:]
    return botten, kinderen


def lees_amc(pad):
    """De beelden: per beeld per bot de waarden, in de volgorde van zijn vrijheden."""
    beelden, beeld = [], None
    for regel in open(pad, encoding='latin-1'):
        w = regel.split()
        if not w or w[0].startswith(('#', ':')):
            continue
        if len(w) == 1 and w[0].isdigit():
            beeld = {}
            beelden.append(beeld)
        elif beeld is not None:
            beeld[w[0]] = [float(x) for x in w[1:]]
    return beelden


def houding(botten, kinderen, beeld):
    """Per bot de draai in de wereld ten opzichte van de ruststand, en waar elk bot eindigt (in meter), in de ruimte van
    de opname."""
    r = beeld['root']
    W = {'root': euler(*r[3:6])}
    eind = {'root': Vector(r[0:3]) * SCHAAL}
    rij = ['root']
    while rij:
        ouder = rij.pop(0)
        for kind in kinderen.get(ouder, []):
            b = botten[kind]
            waarden = dict(zip(b['dof'], beeld.get(kind, [])))
            R = euler(waarden.get('rx', 0.0), waarden.get('ry', 0.0), waarden.get('rz', 0.0))
            W[kind] = W[ouder] @ b['C'] @ R @ b['C'].transposed()
            eind[kind] = eind[ouder] + W[kind] @ b['dir'] * (b['len'] * SCHAAL)
            rij.append(kind)
    return W, eind


class Beweging:
    """Eén pas uit een opname, klaar om op het skelet te zetten (zet)."""

    def __init__(self, rig, naam='35_02', persoon='35'):
        botten, kinderen = lees_asf(os.path.join(MAP, f'{persoon}.asf'))
        beelden = lees_amc(os.path.join(MAP, f'{naam}.amc'))
        houdingen = [houding(botten, kinderen, b) for b in beelden]
        # de richting waarin hij loopt (in Blender), en de draai die die richting naar voren (-y) legt
        wortel = [P @ e['root'] for _, e in houdingen]
        d = wortel[-1] - wortel[0]
        hoek = -math.pi / 2 - math.atan2(d.y, d.x)
        Rh = Matrix.Rotation(hoek, 3, 'Z')
        voor = Vector((0, -1, 0))
        # de pas: van de ene keer dat de linkerenkel het verst voor het bekken staat (de hiel komt neer) tot de volgende,
        # die het dichtst bij het midden van de opname
        voet = [(Rh @ (P @ e['ltibia'] - P @ e['root'])).dot(voor) for _, e in houdingen]
        toppen = [i for i in range(10, len(voet) - 10) if voet[i] == max(voet[i - 10:i + 11])]
        paren = [(a, b) for a, b in zip(toppen, toppen[1:]) if 60 < b - a < 200]
        if not paren:
            raise ValueError(f'geen pas gevonden in {naam}')
        midden = len(voet) / 2
        self.a, self.b = min(paren, key=lambda p: abs((p[0] + p[1]) / 2 - midden))
        # de ruststand van de opname gelijk aan de onze, per bot (zie boven); en de verhouding van de beenlengtes
        bb = rig.data.bones
        self.koppel = {o: s for o, s in KOPPEL.items() if o in bb}
        Q = {}
        for o, s in self.koppel.items():
            if s == 'root':
                Q[o] = Matrix.Identity(3)
            else:
                # (Bone.vector staat in de ruimte van het ouderbot: met die richting liep de rug omlaag en de dij omhoog)
                rust = (bb[o].tail_local - bb[o].head_local).normalized()
                Q[o] = (P @ botten[s]['dir']).rotation_difference(rust).to_matrix()
        ons = sum(bb[f'{n}.L'].length for n in ('upperleg01', 'upperleg02', 'lowerleg01', 'lowerleg02') if f'{n}.L' in bb)
        hun = (botten['lfemur']['len'] + botten['ltibia']['len']) * SCHAAL
        verhouding = ons / hun
        # per beeld van de pas: per bot van ons de draai in de ruimte van het skelet, het zwaaien van het bekken, en per voet
        # de enkel ten opzichte van het bekken (voor en achter, hoogte) en hoe de voet kantelt (de teen omlaag is positief)
        a, b = self.a, self.b
        self.draai, self.zwaai, self.enkel, self.hoogte = [], [], [], []
        w0, w1 = Rh @ wortel[a], Rh @ wortel[b]
        for i in range(a, b + 1):
            W, e = houdingen[i]
            u = (i - a) / (b - a)
            self.draai.append({o: (Rh @ P @ W[s] @ P.transposed() @ Q[o].transposed()).to_quaternion()
                               for o, s in self.koppel.items()})
            w = Rh @ wortel[i] - (w0 + (w1 - w0) * u)
            self.zwaai.append(Vector((w.x, w.y, 0.0)) * verhouding)
            enkels = {}
            for k, o in (('L', 'l'), ('R', 'r')):
                rel = Rh @ (P @ e[o + 'tibia'] - P @ e['root'])
                f = Rh @ P @ (W[o + 'foot'] @ botten[o + 'foot']['dir'])
                enkels[k] = (rel.y, rel.z, math.atan2(-f.z, math.hypot(f.x, f.y)))
            self.enkel.append(enkels)
            self.hoogte.append((Rh @ wortel[i]).z)
        # sluitend: wat het eind nog van het begin verschilt, gaat geleidelijk over de pas weg
        self.rest = {o: self.draai[-1][o] @ self.draai[0][o].inverted() for o in self.koppel}
        n = len(self.enkel) - 1
        for k in ('L', 'R'):
            fout = [self.enkel[-1][k][j] - self.enkel[0][k][j] for j in range(3)]
            for i in range(n + 1):
                y, z, h = self.enkel[i][k]
                self.enkel[i][k] = (y - fout[0] * i / n, z - fout[1] * i / n, h - fout[2] * i / n)
        fout = self.hoogte[-1] - self.hoogte[0]
        self.hoogte = [h - fout * i / n for i, h in enumerate(self.hoogte)]
        # de voeten naar de maat van de pas (voeten): de enkel voor en achter rond zijn midden, de hoogte boven de grond (de
        # laagste stand van die enkel), en het kantelen ten opzichte van de voet die plat staat (de middelste stand)
        self.voet_midden, self.voet_grond, self.voet_plat, self.voet_half = {}, {}, {}, {}
        for k in ('L', 'R'):
            ys = [e[k][0] for e in self.enkel]
            self.voet_midden[k] = (max(ys) + min(ys)) / 2
            self.voet_half[k] = (max(ys) - min(ys)) / 2
            self.voet_grond[k] = min(e[k][1] for e in self.enkel)
            self.voet_plat[k] = sorted(e[k][2] for e in self.enkel)[len(self.enkel) // 2]
        self.duur = (b - a) / 120.0
        print('BEWEGING', naam, 'pas van beeld', a, 'tot', b, f'({self.duur:.2f} s), benen maal {verhouding:.2f}')

    def voeten(self, u, half, til=1.0):
        """Op plek u van de pas per voet: hoe ver de enkel voor (negatief) of achter het midden staat, met `half` als
        halve pas (meter), hoe hoog hij boven de grond is (in dezelfde maat, maal `til`), en hoe de voet kantelt (radialen,
        de hiel omhoog is positief); en hoe ver het bekken zakt ten opzichte van zijn hoogste stand (in dezelfde maat)."""
        u = u % 1.0
        x = u * (len(self.enkel) - 1)
        i = min(int(x), len(self.enkel) - 2)
        f = x - i
        uit = {}
        for k in ('L', 'R'):
            schaal = half / self.voet_half[k]
            e0, e1 = self.enkel[i][k], self.enkel[i + 1][k]
            y, z, h = (e0[j] + (e1[j] - e0[j]) * f for j in range(3))
            uit[k] = ((y - self.voet_midden[k]) * schaal, (z - self.voet_grond[k]) * schaal * til, h - self.voet_plat[k])
        schaal = half / ((self.voet_half['L'] + self.voet_half['R']) / 2)
        h = self.hoogte[i] + (self.hoogte[i + 1] - self.hoogte[i]) * f
        uit['bekken'] = (max(self.hoogte) - h) * schaal
        return uit

    def op(self, u):
        """De draaien en het zwaaien op plek u van de pas (0 tot 1, rond)."""
        u = u % 1.0
        x = u * (len(self.draai) - 1)
        i = min(int(x), len(self.draai) - 2)
        f = x - i
        draai = {}
        for o in self.koppel:
            q = self.draai[i][o].slerp(self.draai[i + 1][o], f)
            draai[o] = Quaternion().slerp(self.rest[o].inverted(), u) @ q
        zwaai = self.zwaai[i].lerp(self.zwaai[i + 1], f)
        return draai, zwaai


BENEN = ('upperleg', 'lowerleg', 'foot')


def zet(rig, beweging, u, benen=True):
    """De houding op plek u van de pas op het skelet: de gekoppelde botten met hun draai (de andere, zoals de armen,
    houden hun eigen stand), het bekken met zijn zwaaien; zonder `benen` alleen bekken, rug en hoofd (de benen zet dan de
    IK). Geeft hoe ver het skelet moet zakken (of rijzen) zodat de laagste voet de grond raakt (met de benen)."""
    draai, zwaai = beweging.op(u)
    if not benen:
        draai = {o: q for o, q in draai.items() if not o.startswith(BENEN)}
    bb = rig.data.bones
    M = {}

    def stand(b):
        if b.name in M:
            return M[b.name]
        rust = b.matrix_local
        zonder = rust.copy() if b.parent is None else stand(b.parent) @ b.parent.matrix_local.inverted() @ rust
        pb = rig.pose.bones[b.name]
        if b.name in draai:
            hoofd = zonder.translation + (zwaai if b.parent is None else Vector())
            gewenst = Matrix.Translation(hoofd) @ (draai[b.name].to_matrix() @ rust.to_3x3()).to_4x4()
            pb.rotation_mode = 'QUATERNION'
            pb.matrix_basis = zonder.inverted() @ gewenst
            M[b.name] = gewenst
        else:
            M[b.name] = zonder @ pb.matrix_basis
        return M[b.name]
    for b in bb:
        stand(b)
    if not benen:
        return 0.0
    laagst = 1e9
    for k in ('L', 'R'):
        voet = bb[f'foot.{k}']
        m = M[voet.name]
        laagst = min(laagst, m.translation.z - voet.head_local.z, (m @ Vector((0, voet.length, 0))).z - voet.tail_local.z)
    return laagst
