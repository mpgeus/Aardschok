# Hunyuan3D-2mv: de schuine plaat uit de mesh halen. Het model leest een aanzicht van schuin boven als vlak aanzicht. Een punt dichter bij de camera staat op
# de plaat lager, en dat geldt rondom, dus de mesh wordt een kegel: z_mesh = z * cos(e) - rho * sin(e), met rho de afstand tot de staande as. De zolen hellen
# daardoor even hard als de camera (gemeten: 25,3 graden). De helling meet hij op de zolen van de mesh zelf, dus dit vraagt geen handwerk per figuur.
#
#   python hy_kegel.py <in.glb> <uit.glb> [helling=<sin e, standaard gemeten op de zolen>] [factor=1.0]
import json
import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hy_mesh as M  # noqa: E402


def recht(V, m, helling=None, factor=1.0):
    s = -m['zool_helling'] if helling is None else helling
    s = min(s * factor, 0.9)
    as_ = np.array(m['as_xy'])
    rho = np.linalg.norm(V[:, :2] - as_, axis=1)
    U = V.copy()
    U[:, 2] = (V[:, 2] + s * rho) / math.sqrt(1 - s * s)
    return U, s


def main():
    arg = dict(a.split('=') for a in sys.argv[3:] if '=' in a)
    V, F = M.lees_glb(sys.argv[1])
    m = M.maten(V, F)
    U, s = recht(V, m, float(arg['helling']) if 'helling' in arg else None, float(arg.get('factor', 1.0)))
    M.schrijf_glb(sys.argv[2], U, F)
    print(json.dumps({'in': os.path.basename(sys.argv[1]), 'sin_e': round(s, 4), 'hoek': round(math.degrees(math.asin(s)), 1), 'voor': {k: round(m[k], 3) for k in ('zool_helling', 'rand_helling')}, 'na': {k: round(M.maten(U, F)[k], 3) for k in ('zool_helling', 'rand_helling')}}))


if __name__ == '__main__':
    main()
