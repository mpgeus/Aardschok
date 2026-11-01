# De productie-render op een V4-model, met de werkvariant van de bewegingen (pose4.py) aan. render.py en beweging.py op schijf veranderen niet.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/render4.py -- <map> <houding> [dezelfde opties als render.py] [oudidle]
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import pose4 as P4  # noqa: E402
import render as R  # noqa: E402

P4.zet_aan('oudidle' not in sys.argv)
if 'oudidle' in sys.argv:
    sys.argv.remove('oudidle')
R.hoofd()
