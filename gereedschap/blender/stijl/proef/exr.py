# Een kleine lezer voor de multilayer-EXR van gbuffer.py (vraag 192, de methodeproef): alleen wat Blender schrijft, regels met ZIP of zonder
# compressie, halve en hele floats. Zo is er geen extra pakket nodig; de Python van ComfyUI heeft numpy en zlib.
import struct
import zlib

import numpy as np

_DT = {1: ('<f2', 2), 2: ('<f4', 4), 0: ('<u4', 4)}
_REGELS = {0: 1, 2: 1, 3: 16}


def _tot_nul(b, i):
    j = b.index(b'\0', i)
    return b[i:j].decode('ascii'), j + 1


def _kop(b, i):
    kop = {'kanalen': []}
    while b[i] != 0:
        naam, i = _tot_nul(b, i)
        soort, i = _tot_nul(b, i)
        n = struct.unpack_from('<i', b, i)[0]
        i += 4
        data = b[i:i + n]
        i += n
        if soort == 'chlist':
            kan = []
            j = 0
            while data[j] != 0:
                c, j = _tot_nul(data, j)
                t = struct.unpack_from('<i', data, j)[0]
                j += 16
                kan.append((c, t))
            kop['kanalen'] = kan
        elif soort == 'box2i':
            kop[naam] = struct.unpack('<4i', data)
        elif soort == 'compression':
            kop['compressie'] = data[0]
        elif naam == 'chunkCount':
            kop['blokken'] = struct.unpack('<i', data)[0]
    return kop, i + 1


def _pak_uit(data, grootte):
    if len(data) == grootte:
        return np.frombuffer(data, dtype=np.uint8)
    t = np.frombuffer(zlib.decompress(data), dtype=np.uint8).astype(np.int32)
    # de predictor terug: t[i] = t[i-1] + d[i] - 128, met t[0] = d[0]
    t = ((np.cumsum(t - 128, dtype=np.int64) + 128) & 255).astype(np.uint8)
    h = (len(t) + 1) // 2
    uit = np.empty(len(t), dtype=np.uint8)
    uit[0::2] = t[:h]
    uit[1::2] = t[h:]
    return uit


def lees(pad):
    """Alle kanalen als dict {'Laag.Pass.K': h x b float32}. Blender schrijft sinds 5.x een bestand met meer delen (per pass een eigen deel)."""
    b = open(pad, 'rb').read()
    meer = bool(struct.unpack_from('<I', b, 4)[0] & 0x1000)
    i = 8
    koppen = []
    while True:
        kop, i = _kop(b, i)
        koppen.append(kop)
        if not meer or b[i] == 0:
            break
    if meer:
        i += 1
    uit = {}
    tabellen = []
    for kop in koppen:
        x0, y0, x1, y1 = kop['dataWindow']
        h = y1 - y0 + 1
        n = kop.get('blokken', (h + _REGELS[kop['compressie']] - 1) // _REGELS[kop['compressie']])
        tabellen.append(struct.unpack_from(f'<{n}Q', b, i))
        i += 8 * n
    for d_nr, (kop, verw) in enumerate(zip(koppen, tabellen)):
        x0, y0, x1, y1 = kop['dataWindow']
        w, h = x1 - x0 + 1, y1 - y0 + 1
        per = _REGELS[kop['compressie']]
        kan = sorted(kop['kanalen'], key=lambda c: c[0])
        regel = sum(_DT[t][1] for _, t in kan) * w
        for c, _ in kan:
            uit[c] = np.empty((h, w), dtype=np.float32)
        for v in verw:
            if meer:
                v += 4
            y, n = struct.unpack_from('<ii', b, v)
            y -= y0
            rij = min(per, h - y)
            d = _pak_uit(b[v + 8:v + 8 + n], regel * rij)
            p = 0
            for r in range(rij):
                for c, t in kan:
                    dt, g = _DT[t]
                    uit[c][y + r] = np.frombuffer(d[p:p + w * g].tobytes(), dtype=dt)
                    p += w * g
    return uit


def passes(pad):
    """De passes per naam: {'DiffDir': h x b x 3, 'ao': h x b, ...}; de laag valt weg, en Combined.A heet 'alfa'. De rijen staan van boven naar onder."""
    ruw = lees(pad)
    groep = {}
    for k, v in ruw.items():
        d = k.split('.')
        naam, c = d[-2] if len(d) >= 2 else '', d[-1]
        groep.setdefault(naam, {})[c] = v
    uit = {}
    for naam, kan in groep.items():
        if naam == 'Combined':
            uit['alfa'] = kan['A']
            uit['Combined'] = np.dstack([kan['R'], kan['G'], kan['B']])
        elif 'R' in kan:
            uit[naam] = np.dstack([kan['R'], kan['G'], kan['B']])
        elif 'X' in kan and 'Y' in kan:
            uit[naam] = np.dstack([kan['X'], kan['Y'], kan['Z']])
        else:
            uit[naam] = next(iter(kan.values()))
    return uit
