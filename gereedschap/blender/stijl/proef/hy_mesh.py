# Hunyuan3D-2mv, de mesh als getallen: GLB lezen en schrijven zonder Blender, in de assen van Blender (z omhoog, het gezicht naar -y), en de maten
# die de bewerkingen nodig hebben. Alleen numpy, zodat een proef seconden kost en in een keten past.
import json
import struct

import numpy as np

COMPONENT = {5121: np.uint8, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
AANTAL = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def lees_glb(pad):
    """Geeft V (n×3, assen van Blender) en F (m×3). Alleen de eerste mesh: ComfyUI schrijft er één."""
    data = open(pad, 'rb').read()
    lengte = struct.unpack('<I', data[12:16])[0]
    j = json.loads(data[20:20 + lengte])
    bin_start = 20 + lengte + 8

    def accessor(i):
        a = j['accessors'][i]
        b = j['bufferViews'][a['bufferView']]
        t = COMPONENT[a['componentType']]
        n = a['count'] * AANTAL[a['type']]
        arr = np.frombuffer(data, dtype=t, count=n, offset=bin_start + b.get('byteOffset', 0) + a.get('byteOffset', 0))
        return arr.reshape(a['count'], -1) if AANTAL[a['type']] > 1 else arr
    prim = j['meshes'][0]['primitives'][0]
    P = np.asarray(accessor(prim['attributes']['POSITION']), dtype=np.float64)
    F = np.asarray(accessor(prim['indices']), dtype=np.int64).reshape(-1, 3)
    return np.stack([P[:, 0], -P[:, 2], P[:, 1]], axis=1), F


def schrijf_glb(pad, V, F, kleur=None):
    """Schrijft V en F (assen van Blender) als GLB, met kleur (n×3 in 0..1, lineair) als die er is."""
    P = np.stack([V[:, 0], V[:, 2], -V[:, 1]], axis=1).astype(np.float32)
    I = F.astype(np.uint32).ravel()
    delen = [I.tobytes(), P.tobytes()]
    if kleur is not None:
        delen.append(np.clip(kleur, 0, 1).astype(np.float32).tobytes())
    views, pos = [], 0
    for i, d in enumerate(delen):
        views.append({'buffer': 0, 'byteOffset': pos, 'byteLength': len(d), 'target': 34963 if i == 0 else 34962})
        pos += len(d) + (-len(d) % 4)
    acc = [{'bufferView': 0, 'componentType': 5125, 'count': int(I.size), 'type': 'SCALAR'},
           {'bufferView': 1, 'componentType': 5126, 'count': len(P), 'type': 'VEC3', 'min': P.min(0).tolist(), 'max': P.max(0).tolist()}]
    attr = {'POSITION': 1}
    if kleur is not None:
        acc.append({'bufferView': 2, 'componentType': 5126, 'count': len(P), 'type': 'VEC3'})
        attr['COLOR_0'] = 2
    j = {'asset': {'version': '2.0', 'generator': 'hy_mesh.py'}, 'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0, 'name': 'speerman'}],
         'meshes': [{'primitives': [{'attributes': attr, 'indices': 0}]}], 'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': pos}]}
    jb = json.dumps(j).encode()
    jb += b' ' * (-len(jb) % 4)
    bin_ = b''.join(d + b'\0' * (-len(d) % 4) for d in delen)
    with open(pad, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bin_)))
        f.write(struct.pack('<I', len(jb)) + b'JSON' + jb)
        f.write(struct.pack('<I', len(bin_)) + b'BIN\0' + bin_)


def normalen(V, F):
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    n = np.cross(b - a, c - a)
    N = np.zeros_like(V)
    for i in range(3):
        np.add.at(N, F[:, i], n)
    return N / np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)


def stukken(n, F):
    """De samenhangende stukken: per punt het nummer van zijn stuk, grootste eerst."""
    from scipy.sparse import coo_matrix
    from scipy.sparse.csgraph import connected_components
    r = np.concatenate([F[:, 0], F[:, 1], F[:, 2]])
    k = np.concatenate([F[:, 1], F[:, 2], F[:, 0]])
    _, lab = connected_components(coo_matrix((np.ones(len(r), dtype=np.int8), (r, k)), shape=(n, n)), directed=False)
    return lab


def open_randen(F):
    """Randen die niet door precies twee vlakken gedeeld worden."""
    e = np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]), axis=1)
    _, tel = np.unique(e, axis=0, return_counts=True)
    return int((tel != 2).sum())


def dicht_gaten(V, F, kenmerken, max_rand=400):
    """Kleine gaten dicht met een waaier: elke lus van randen met één vlak krijgt een punt in het midden. Kenmerken (kleur en zo) zijn het gemiddelde van de rand. Grote lussen blijven open."""
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]])
    s = np.sort(e, axis=1)
    _, inv, tel = np.unique(s, axis=0, return_inverse=True, return_counts=True)
    inv = inv.ravel()
    los = e[tel[inv] == 1]
    # de lussen per rand en niet per punt: waar een punt twee gaten raakt, valt een lus anders uit elkaar. De omgekeerde richting: de waaier heeft de goede kant op
    volgende = {}
    for a, b in los:
        volgende.setdefault(int(b), []).append(int(a))
    Vn, Fn = list(V), []
    extra = {k: [] for k in kenmerken}
    aantal = 0
    for start in list(volgende):
        while volgende.get(start):
            pad, plek, h = [start], {start: 0}, start
            while volgende.get(h):
                h = volgende[h].pop()
                if h in plek:
                    # een lus is rond: eruit halen, en verder vanaf daar
                    i = plek[h]
                    lus = pad[i:]
                    for x in pad[i + 1:]:
                        del plek[x]
                    pad = pad[:i + 1]
                    if 3 <= len(lus) <= max_rand:
                        c = len(Vn)
                        Vn.append(V[lus].mean(0))
                        for k, v in kenmerken.items():
                            extra[k].append(v[lus].mean(0))
                        for j in range(len(lus)):
                            Fn.append([lus[j], lus[(j + 1) % len(lus)], c])
                        aantal += 1
                else:
                    plek[h] = len(pad)
                    pad.append(h)
    if not Fn:
        return V, F, kenmerken, 0
    uit = {k: np.concatenate([v, np.array(extra[k])]) if extra[k] else v for k, v in kenmerken.items()}
    return np.array(Vn), np.vstack([F, np.array(Fn)]), uit, aantal


GEEN_SPEER = False  # de plaat heeft geen speer: dan is de top van de mesh de top van de helm


def maten(V, F):
    """De assen en hellingen: de speer (de hoogste punten), de as van de helm (de top zonder de speer), en hoe de helmrand en de zolen hellen."""
    H = V[:, 2].max() - V[:, 2].min()
    z0 = V[:, 2].min()
    top = V[V[:, 2] > z0 + 0.93 * H]
    speer = np.median(top[:, :2], axis=0)
    r_speer = np.full(len(V), 9.0) if GEEN_SPEER else np.linalg.norm(V[:, :2] - speer, axis=1)
    zonder = V[r_speer > 0.09 * H]
    knop = zonder[zonder[:, 2] > zonder[:, 2].max() - 0.012 * H]
    as_ = knop[:, :2].mean(0)
    N = normalen(V, F)
    rho = np.linalg.norm(V[:, :2] - as_, axis=1)
    z_helm = zonder[:, 2].max()
    # de helmrand: boven het gezicht, ver van de as, met de normaal omhoog
    band = (V[:, 2] > z_helm - 0.32 * H) & (r_speer > 0.09 * H)
    rm = rho[band].max()
    br = band & (rho > 0.62 * rm) & (N[:, 2] > 0.5)
    s_rand, z_rand = np.polyfit(rho[br], V[br, 2], 1)
    # de zolen: de laagste punten, met de normaal omlaag
    laag = (V[:, 2] < z0 + 0.12 * H) & (N[:, 2] < -0.6) & (r_speer > 0.05 * H)
    s_zool, z_zool = np.polyfit(rho[laag], V[laag, 2], 1)
    return {'hoogte': float(H), 'speer_xy': speer.tolist(), 'as_xy': as_.tolist(), 'helm_top_z': float(z_helm - z0), 'rand_helling': float(s_rand), 'rand_punten': int(br.sum()),
            'zool_helling': float(s_zool), 'zool_punten': int(laag.sum()), 'rho_rand': float(rm)}
