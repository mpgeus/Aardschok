#!/bin/bash
# TripoSplat: van de plaat met alle kanten naar spelvellen en een film. Een run op Z en een op N (elk 3 minuten), samen, recht gezet, de rig erop, op de camera van het spel. Schrijft alleen in uit/stijl/hunyuan/splat.
# Alleen om in de browser te bekijken (inspel.js); productie blijft ongemoeid. Een plaat met speer krijgt ook de aanval: staan met één hand, lopen en steken met twee (Marcel, 1 nov).
#   bash keten_splat_vel.sh [speer|boog|kruis|piek|alle] [opnieuw]     de plaat (speer: de speerman; boog: de boogschutter met hoed; kruis: de kruisboogschutter; piek: de pikeman; hun wapens en de koker komen van een eigen plaat; alle: de man zonder wapen), en met `opnieuw` ook de runs
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
WAPEN=()
SAMEN=""
VERF=""
AANVAL_N=10
AANVAL_FPS=16
# per plaat de vakken van Z en N, en de hoogte zonder de letters
if [ "$N" = "speer" ]; then VAK="(0,264)|(975,1240)|30|625"; else VAK="(0,270)|(972,1258)|95|635"; fi
if [ "$N" = "boog" ]; then
    # Marcel, 1 nov: de hoed met de veer, en zijn boog op een eigen plaat. Het lijf is van de plaat zonder wapen; de koker uit de run op de plaat met koker (splat/boog-koker, `aardschok-boogschutter-draai-koker.png`, met de helm). De veer steekt boven de hoed uit, dus de maat is die van de hele figuur op de plaat
    VAK="(0,265)|(985,1255)|85|635"; PLAAT="$R/docs/art/referentie/aardschok-boogschutter-draai-hoed.png"; FIG=boogschutter
    K="$H/splat/boog-koker"; mkdir -p "$K"
    if [ ! -f "$K/verf.npz" ]; then
        "$PY" - "$R/docs/art/referentie/aardschok-boogschutter-draai-koker.png" "$K" <<'PYEOF'
import sys
from PIL import Image
a = Image.open(sys.argv[1]).convert('RGB')
a.crop((0, 100, 264, 625)).save(f'{sys.argv[2]}/plaat-Z.png')
a.crop((982, 100, 1254, 625)).save(f'{sys.argv[2]}/plaat-N.png')
PYEOF
        for r in Z N; do "$PY" "$P/hy_splat.py" maak "$K/plaat-$r.png" "$K/$r.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200; done
        "$PY" "$P/hy_splat.py" samen "$K/samen.npz" "Z=$K/Z.npz" "N=$K/N.npz" boog=1 2>&1 | tail -1 | cut -c1-240
        "$PY" "$P/hy_splat.py" verf "$K/samen.npz" "$K/verf.npz" "plaat=$K/Z-invoer.png" 2>&1 | tail -1 | cut -c1-300
    fi
    L="$H/splat/boog-los"; mkdir -p "$L"
    if [ "$2" = "opnieuw" ] || [ ! -f "$L/NW.npz" ]; then
        "$PY" - "$R/docs/art/referentie/aardschok-boog-los-draai.png" "$L" <<'PYEOF'
import sys
from PIL import Image
Image.open(sys.argv[1]).convert('RGB').crop((795, 20, 965, 625)).save(f'{sys.argv[2]}/plaat-NW.png')
PYEOF
        "$PY" "$P/hy_splat.py" maak "$L/plaat-NW.png" "$L/NW.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200
    fi
    WAPEN=(wapen=boog hoed=1 lengte=1.4395 "koker=$H/splat/boog-koker/verf.npz" "boog_run=$L/NW.npz"); SAMEN="hoed=1 lengte=1.4395"; VERF="hoed=1 lengte=1.4395 wit_tot=1.09 zij_tot=0.86"
fi
if [ "$N" = "kruis" ]; then
    VAK="(0,265)|(982,1252)|105|635"; PLAAT="$R/docs/art/referentie/aardschok-kruisboog-draai-basis.png"; FIG=kruisboogschutter
    WAPEN=(wapen=kruis "koker=$H/splat/kruis-wapen/verf.npz" "kruisboog=$H/splat/kruisboog/W.npz"); VERF="wit_tot=1.09 zij_tot=0.86"
    AANVAL_N=8; AANVAL_FPS=10
    # het lijf is van de plaat zonder wapen. De koker komt uit de plaat met wapen, de kruisboog uit zijn eigen plaat (het aanzicht W, zonder de letters)
    K="$H/splat/kruis-wapen"; L="$H/splat/kruisboog"
    mkdir -p "$K" "$L"
    if [ "$2" = "opnieuw" ] || [ ! -f "$K/verf.npz" ] || [ ! -f "$L/W.npz" ]; then
        "$PY" - "$R/docs/art/referentie/aardschok-kruisboog-draai.png" "$R/docs/art/referentie/aardschok-kruisboog-los-draai.png" "$K" "$L" <<'PYEOF'
import sys
from PIL import Image
a = Image.open(sys.argv[1]).convert('RGB')
a.crop((0, 105, 268, 635)).save(f'{sys.argv[3]}/plaat-Z.png')
a.crop((1000, 105, 1225, 635)).save(f'{sys.argv[3]}/plaat-N.png')
Image.open(sys.argv[2]).convert('RGB').crop((985, 70, 1480, 250)).save(f'{sys.argv[4]}/plaat-W.png')
PYEOF
        for r in Z N; do "$PY" "$P/hy_splat.py" maak "$K/plaat-$r.png" "$K/$r.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200; done
        "$PY" "$P/hy_splat.py" samen "$K/samen.npz" "Z=$K/Z.npz" "N=$K/N.npz" 2>&1 | tail -1 | cut -c1-240
        "$PY" "$P/hy_splat.py" verf "$K/samen.npz" "$K/verf.npz" "plaat=$K/Z-invoer.png" 2>&1 | tail -1 | cut -c1-300
        "$PY" "$P/hy_splat.py" maak "$L/plaat-W.png" "$L/W.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200
    fi
fi
if [ "$N" = "piek" ]; then
    # Marcel, 1 nov: "Dit wordt de pikeman". Het lijf is van de plaat zonder wapen, de hellebaard van zijn eigen plaat (het aanzicht Z). Het harnas is staal: wit is daar geen fout
    VAK="(0,290)|(975,1260)|55|650"; PLAAT="$R/docs/art/referentie/aardschok-pikeman-draai-basis.png"; FIG=piekenier; VERF="wit_tot=0"
    L="$H/splat/hellebaard"; mkdir -p "$L"
    if [ "$2" = "opnieuw" ] || [ ! -f "$L/Z.npz" ]; then
        "$PY" - "$R/docs/art/referentie/aardschok-hellebaard-los-draai.png" "$L" <<'PYEOF'
import sys
from PIL import Image
Image.open(sys.argv[1]).convert('RGB').crop((95, 5, 265, 655)).save(f'{sys.argv[2]}/plaat-Z.png')
PYEOF
        "$PY" "$P/hy_splat.py" maak "$L/plaat-Z.png" "$L/Z.npz" zaad=42 2>&1 | grep -E 'Traceback|rror|laden_s' | cut -c1-200
    fi
    WAPEN=(wapen=piek "piek_run=$L/Z.npz")
fi
B="$H/rig2/beweging-v4.npz"
if [ "$N" = "alle" ]; then HOUDINGEN="staan,lopen"; else HOUDINGEN="staan,lopen,aanval,geraakt,sterven"; fi
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
"$PY" "$P/hy_splat.py" verf "$U/samen.npz" "$U/verf.npz" "plaat=$U/Z-invoer.png" $VERF 2>&1 | tail -1 | cut -c1-300
rm -rf "$U/spel/renders" "$U/spel/vellen" "$U/film"
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/spel/renders" "houdingen=$HOUDINGEN" "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders|zwevers|maten' | cut -c1-280
"$PY" - "$U/spel/renders" <<'PYEOF'
import json, sys
m = sys.argv[1]
for h in ('staan', 'lopen', 'aanval', 'geraakt', 'sterven'):
    v = 1.25 if h == 'sterven' else 1.0  # STERVEN_VAK in hy_splat
    json.dump({'pas_meter': 0.2327, 'lengte': 1.354, 'doel_z': 0.74, 'houding': h, 'richtingen': 'Z,ZW,W,NW,N,NO,O,ZO'.split(','), 'pixels': round(768 * v), 'monsters': 1, 'elevatie': 30, 'ortho': 3.0 * v}, open(f'{m}/{h}-render.json', 'w'))
PYEOF
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG staan 4 fps=3 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG lopen 12 fps=15 kleur=1.0 scherpte=0.2 | tail -1
if [ "$N" != "alle" ]; then
    "$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG aanval $AANVAL_N fps=$AANVAL_FPS kleur=1.0 scherpte=0.2 | tail -1
    "$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG geraakt 3 fps=12 kleur=1.0 scherpte=0.2 | tail -1
    "$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" $FIG sterven 7 fps=8 kleur=1.0 scherpte=0.2 | tail -1
fi
echo VEL KLAAR
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=lopen "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
"$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/staan" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=Z,ZW,W,NW,N,NO,O,ZO houdingen=staan stap=4 "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
"$PY" "$P/hy_film.py" "$U/lopen.mp4" "$U/film" 12 15 groot=verf:Z,verf:ZW,verf:W 2>&1 | tail -1 | cut -c1-200
if [ "$N" != "alle" ]; then
    "$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=aanval "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
    "$PY" "$P/hy_film.py" "$U/aanval.mp4" "$U/film" $AANVAL_N $AANVAL_FPS groot=verf:Z,verf:ZW,verf:W houding=aanval herhaal=6 2>&1 | tail -1 | cut -c1-200
    # geraakt worden met een pauze ertussen, en sterven met een wijder beeld: daar ligt hij breed uit
    "$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=geraakt "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
    "$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=2.2 doel=0.9 pixels=640 richtingen=ZW,W,Z,N houdingen=staan stap=4 "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
    "$PY" "$P/hy_film.py" "$U/geraakt.mp4" "$U/film" 3 12 groot=verf:Z,verf:ZW,verf:W houding=geraakt herhaal=6 rust=staan:10 2>&1 | tail -1 | cut -c1-200
    "$PY" "$P/hy_splat.py" rig "$U/verf.npz" "$B" "$M" "$U/film/verf" elevatie=20 ortho=3.6 doel=0.5 pixels=640 sterven_vak=1 richtingen=ZW,W,Z,N houdingen=sterven "${WAPEN[@]}" 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
    "$PY" "$P/hy_film.py" "$U/sterven.mp4" "$U/film" 7 8 groot=verf:Z,verf:ZW,verf:W houding=sterven herhaal=4 cel=640 klein=0 2>&1 | tail -1 | cut -c1-200
fi
echo FILM KLAAR
