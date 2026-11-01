#!/bin/bash
# Alleen het licht opnieuw (na een wijziging in stijl.json of verlicht.py), en alles wat daarop volgt: vellen, controles, metingen, platen en films. De G-buffers van keten_d8.sh blijven staan.
set -eo pipefail
PS4='+ $(date +%H:%M:%S) '; set -x
cd "$(dirname "$0")/../../../.."
PY="timeout 1800 /c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
S=gereedschap/pixelart/uit/stijl; M=$S/methoden; P=gereedschap/blender/stijl/proef; W=docs/art/bewijs/methoden
t0=$(date +%s); mark() { echo "TIJD $1: $(( $(date +%s) - t0 )) s"; t0=$(date +%s); }
$PY $P/verlicht.py $M/g/A-s $M/spel/A staan | tail -1
$PY $P/verlicht.py $M/g/A-h $M/hoog/A staan | tail -1
export RAMPS=ramps-d.json
for v in D1 D8 D65; do
  # D65 bestaat alleen na de proef met sterkte 0,65
  [ -d $M/g/$v-s ] || continue
  $PY $P/verlicht.py $M/g/$v-s $M/spel/$v staan | tail -1
  $PY $P/verlicht.py $M/g/$v-h $M/hoog/$v staan | tail -1
done
$PY $P/verlicht.py $M/vol/g-staan $M/vol/r-staan staan | tail -1
$PY $P/verlicht.py $M/vol/g-lopen $M/vol/r-lopen lopen | tail -1
$PY $P/verlicht.py $M/vol/g-hoog $M/vol/r-hoog staan | tail -1
mark licht
unset RAMPS
$PY gereedschap/blender/stijl/vel.py $M/vol/r-staan $M/vol/vellen speerman staan 4 fps=3
$PY gereedschap/blender/stijl/vel.py $M/vol/r-lopen $M/vol/vellen speerman lopen 12 fps=15
mark vel
$PY gereedschap/blender/stijl/controle_vel.py $M/vol/vellen $W/controle-vel-d8.json speerman staan lopen | tail -1
$PY $P/stabiliteit.py $W/stabiliteit-lopen.json "nu=$S/renders/lopen,D8=$M/vol/r-lopen" lopen 12
$PY $P/stabiliteit.py $W/stabiliteit-staan.json "nu=$S/renders/staan,D8=$M/vol/r-staan" staan 4
$PY $P/richtingen.py $W/richtingen-staan.json $S/renders/staan $M/vol/r-staan staan 4 $S/vellen $M/vol/vellen > /dev/null
$PY $P/film2.py $W/lopen-spelmaat.mp4 "huidig=$S/renders/lopen,nieuw=$M/vol/r-lopen" lopen 12 15 richtingen=Z,ZW,O,NO | tail -1
$PY $P/film2.py $W/lopen-groot.mp4 "huidig=$S/renders/lopen,nieuw=$M/vol/r-lopen" lopen 12 15 richtingen=ZW,NO maat=groot herhaal=4 | tail -1
$PY $P/film2.py $W/staan-spelmaat.mp4 "huidig=$S/renders/staan,nieuw=$M/vol/r-staan" staan 4 3 richtingen=Z,ZW,O,NO herhaal=4 | tail -1
$PY $P/overzicht2.py $W/acht-richtingen.png $M/hoog/nu $M/vol/r-hoog $S/vellen $M/vol/vellen
$PY $P/strook.py $W/loop-strook.png $W/koppen-acht.png $S/renders/lopen $M/vol/r-lopen $M/hoog/nu $M/vol/r-hoog
K="nu=$M/hoog/nu,A=$M/hoog/A,B=$M/hoog/B,C=$M/hoog/C,D1=$M/hoog/D1,D8=$M/hoog/D8"; LL="nu=$M/spel/nu,A=$M/spel/A,B=$M/spel/B,C=$M/spel/C,D1=$M/spel/D1,D8=$M/spel/D8"
$PY $P/vergelijk.py $W "$K" "$LL"
OO=""; for v in nu A B C D1 D8 D65; do [ -d $M/spel/$v ] || continue; OO="$OO $v=$M/spel/$v/staan-Z-00.png"; done
$PY gereedschap/blender/stijl/oorzaak.py $W/meting-kleur.json $OO > /dev/null
$PY $P/oorzaak2.py $W/meting-schaal.json $OO > /dev/null
$PY $P/naast_plaat.py $W/plaat-huidig-nieuw.png 900 huidig=$M/hoog/nu/staan-Z-00.png nieuw=$M/hoog/D8/staan-Z-00.png
[ ! -d $M/hoog/D65 ] || $PY $P/naast_plaat.py $W/sterkte-50-65.png 900 sterkte-50=$M/hoog/D8/staan-Z-00.png sterkte-65=$M/hoog/D65/staan-Z-00.png
echo KETEN KLAAR
