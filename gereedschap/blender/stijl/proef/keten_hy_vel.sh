#!/bin/bash
# Hunyuan3D-2mv: van de eindkeuze naar spelvellen, om hem in het spel te bekijken (alleen in de browser, met inspel.js). Op de camera van het spel (30 graden), acht richtingen, staan en lopen uit de rig van hy_rig.py.
# Schrijft alleen in uit/stijl/hunyuan. De rig moet er al zijn (rig2/rig_staan.npz en rig_lopen.npz), eventueel met een andere verf erop: dan is M de map met die npz'en.
#   bash keten_hy_vel.sh [M=rig2] [uit=spel]
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
G="$R/gereedschap/blender/stijl"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
M="${1:-rig2}"
O="${2:-spel}"
A8="Z,ZW,W,NW,N,NO,O,ZO"
GAME="schaal=1 as=0,0 elevatie=30 ortho=3.0 doel=0.74 pixels=768 speerkijkt"
t0=$(date +%s)
timeout 3000 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$M/rig_staan.npz" "$U/$O/renders" $GAME mat=verf ao=0.6 monsters=16 beelden=4 houding=staan richtingen=$A8 2>&1 | grep -E 'Traceback|rror:'
timeout 3000 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$M/rig_lopen.npz" "$U/$O/renders" $GAME mat=verf ao=0.6 monsters=16 beelden=12 houding=lopen richtingen=$A8 2>&1 | grep -E 'Traceback|rror:'
echo "SPRITES 128 renders $(( $(date +%s) - t0 )) s"
"$PY" - "$U/$O/renders" <<'PYEOF'
import json, sys
m = sys.argv[1]
for h in ('staan', 'lopen'):
    json.dump({'pas_meter': 0.2327, 'lengte': 1.354, 'doel_z': 0.74, 'houding': h, 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO'.split(','), 'pixels': 768, 'monsters': 16, 'elevatie': 30, 'ortho': 3.0}, open(f'{m}/{h}-render.json', 'w'))
PYEOF
"$PY" "$G/vel.py" "$U/$O/renders" "$U/$O/vellen" speerman staan 4 fps=3 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/$O/renders" "$U/$O/vellen" speerman lopen 12 fps=15 kleur=1.0 scherpte=0.2 | tail -1
echo VEL KLAAR
