# De modelcontrole van de productie op een V4-model, met de werkvariant van de bewegingen aan.
#
#   blender.exe -b <figuur.blend> -P gereedschap/blender/stijl/proef/controle4.py -- <uit.json>
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HIER)
sys.path.insert(0, os.path.dirname(HIER))
import controle_model as C  # noqa: E402
import pose4 as P4  # noqa: E402

P4.zet_aan(True)
C.main()
