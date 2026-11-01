#!/bin/bash
# Hunyuan3D-2mv: een snelle proef op spelmaat: alleen staan, acht richtingen, op de camera van het spel, met de afwerking van vel.py.
#   PIXELS=768 bash hy_vel_staan.sh <variant> <uitnaam> [opties voor vel.py]
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
G="$R/gereedschap/blender/stijl"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
V="$1"; N="$2"; shift 2
PX="${PIXELS:-768}"
"$PY" "$P/hy_bouw.py" "$P/hy_config.json" "$V" "$U" 2>&1 | tail -1 | cut -c1-120
M="$U/spelproef/$N"
timeout 900 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$V.npz" "$M/renders" schaal=1 as=0,0 elevatie=30 ortho=3.0 doel=0.74 pixels=$PX mat=verf ao=0.6 monsters=16 richtingen=Z,ZW,W,NW,N,NO,O,ZO 2>&1 | grep -E 'Traceback|rror:'
"$PY" - "$M/renders" "$PX" <<'PYEOF'
import json, shutil, sys
m, px = sys.argv[1], int(sys.argv[2])
for r in 'Z,ZW,W,NW,N,NO,O,ZO'.split(','):
    for i in range(1, 4):
        shutil.copy(f'{m}/staan-{r}-00.png', f'{m}/staan-{r}-{i:02d}.png')
json.dump({'pas_meter': 0.45, 'lengte': 1.354, 'doel_z': 0.74, 'houding': 'staan', 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO'.split(','), 'pixels': px, 'monsters': 16, 'elevatie': 30, 'ortho': 3.0}, open(f'{m}/staan-render.json', 'w'))
PYEOF
"$PY" "$G/vel.py" "$M/renders" "$M/vellen" speerman staan 4 fps=3 "$@" | tail -1
