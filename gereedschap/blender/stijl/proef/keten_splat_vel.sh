#!/bin/bash
# TripoSplat: van de plaat met alle kanten naar spelvellen en een film. Een run op Z en een op N (elk 3 minuten), samen, recht gezet, de rig erop, op de camera van het spel. Schrijft alleen in uit/stijl/hunyuan/splat.
# Alleen om in de browser te bekijken (inspel.js); productie blijft ongemoeid. Een plaat met speer krijgt ook de aanval: staan met één hand, lopen en steken met twee (Marcel, 1 nov).
#   bash keten_splat_vel.sh [speer|boog|alle] [opnieuw]     de plaat (speer: de speerman; boog: de boogschutter; alle: de man zonder wapen), en met `opnieuw` ook de twee runs
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
G="$R/gereedschap/blender/stijl"
H="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
N="${1:-speer}"
U="$H/splat/$N"
PLAAT="$R/docs/art/referentie/aardschok-speerman-draai-$N.png"
FIG=speerman
WAPEN=""
SAMEN=""
# per plaat de vakken van Z en N, en de hoogte zonder de letters
if [ "$N" = "speer" ]; then VAK="(0,264)|(975,1240)|30|625"; else VAK="(0,270)|(972,1258)|95|635"; fi
if [ "$N" = "boog" ]; then VAK="(0,255)|(985,1245)|100|628"; PLAAT="$R/docs/art/referentie/aardschok-boogschutter-draai.png"; FIG=boogschutter; WAPEN="wapen=boog"; SAMEN="boog=1"; fi
B="$H/rig2/beweging-v4.npz"
if [ "$N" = "alle" ]; then HOUDINGEN="staan,lopen"; else HOUDINGEN="staan,lopen,aanval"; fi
M="$H/v_spel.npz"
mkdir -p "$U"
if [ "$2" = "opnieuw" ] || [ ! -f "$U/Z.npz" ] || [ ! -f "$U/N.npz" ]; then
    "$PY" - "$PLAAT" "$U" "$VAK" <<'PYEOF'
import ast, sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGB')
z, n, y0, y1 = sys.argv[3].split('|')
for r, v in (('Z', z), ('N', n)):
    x0, x1 = ast.literal_eval(v)
    im.crop((x0, int(y0), x1, int(y1))).save(f'{sys.argv[2]}/plaat-{r}.png')
PYEOF
    for r in Z N; do "$PY" "$P/hy_splat.py" maak "$U/plaat-$r.png" "$U/$r.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200; done
fi
"$PY" "$P/hy_splat.py" samen "$U/samen.npz" "Z=$U/Z.npz" "N=$U/N.npz" $SAMEN 2>&1 | tail -1 | cut -c1-240
"$PY" "$P/hy_splat.py" verf "$U/samen.npz" "$U/verf.npz" "plaat=$U/Z-invoer.png" 2>&1 | tail -1 | cut -c1-300
rm -rf "$U/spel/renders" "$U/spel/vellen" "$U/film"
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/spel/renders" "houdingen=$HOUDINGEN" $WAPEN 2>&1 | grep -E 'Traceback|rror|renders|zwevers|maten' | cut -c1-280
"$PY" - "$U/spel/renders" <<'PYEOF'
import json, sys
m = sys.argv[1]
for h in ('staan', 'lopen', 'aanval'):
    json.dump({'pas_meter': 0.2327, 'lengte': 1.354, 'doel_z': 0.74, 'houding': h, 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO'.split(','), 'pixels': 768, 'monsters': 1, 'elevatie': 30, 'ortho': 3.0}, open(f'{m}/{h}-render.json', 'w'))
PYEOF
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG staan 4 fps=3 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG lopen 12 fps=15 kleur=1.0 scherpte=0.2 | tail -1
if [ "$N" != "alle" ]; then "$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG aanval 10 fps=16 kleur=1.0 scherpte=0.2 | tail -1; fi
echo VEL KLAAR
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=lopen $WAPEN 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/staan" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=Z,ZW,W,NW,N,NO,O,ZO houdingen=staan stap=4 $WAPEN 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
"$PY" "$P/hy_film.py" "$U/lopen.mp4" "$U/film" 12 15 groot=verf:Z,verf:ZW,verf:W 2>&1 | tail -1 | cut -c1-200
if [ "$N" != "alle" ]; then
    "$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=aanval $WAPEN 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
    "$PY" "$P/hy_film.py" "$U/aanval.mp4" "$U/film" 10 16 groot=verf:Z,verf:ZW,verf:W houding=aanval herhaal=6 2>&1 | tail -1 | cut -c1-200
fi
echo FILM KLAAR
