#!/bin/bash
# Vormproef V4 (vraag 192): bouwen met rok-variant A, controleren, alle renders in klei en in de bestaande verf, vellen, doorsteek, animatiecontrole en de platen. Geen D8 en geen AI. Schrijft alleen in uit/stijl/vormproef4 en docs/art/bewijs/v4. Zo'n 20 minuten.
set -eo pipefail
PS4='+ $(date +%H:%M:%S) '; set -x
cd "$(dirname "$0")/../../../.."
PY="timeout 1800 /c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL() { timeout 1800 "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" "$@"; }
S=gereedschap/pixelart/uit/stijl; V=$S/vormproef4; V3=$S/vormproef/speerman-v3.blend; P=gereedschap/blender/stijl/proef; G=gereedschap/blender/stijl; W=docs/art/bewijs/v4
M=$V/eind; B4=$M/speerman-v4.blend; R=$P/render4.py
filter() { grep -E "KLAAR|VERGELIJK|CONTROLE|FOUT|Traceback" || true; }
t0=$(date +%s); mark() { echo "TIJD $1: $(( $(date +%s) - t0 )) s"; t0=$(date +%s); }
mkdir -p $W
rm -rf $M
BL -b --factory-startup -P $P/vorm4.py -- $B4 rok=A 2>&1 | filter
mark model
BL -b $B4 -P $P/inventaris.py -- $V/inv-v4.json 2>&1 | filter
BL -b $B4 -P $P/controle4.py -- $W/controle-model.json 2>&1 | filter
BL -b $S/bron/speerman.blend -P $P/skelet_vergelijk.py -- $V/skelet-nu.json 2>&1 | filter
BL -b $B4 -P $P/skelet_vergelijk.py -- $V/skelet-v4.json $V/skelet-nu.json 2>&1 | tee $V/skelet-uitkomst.txt | filter
BL -b $B4 -P $P/anim4.py -- $W/animatie.json 2>&1 | filter
mark controles
GROOT="pixels=1024 ortho=2.0 elevatie=25 doelz=0.8 speerkijkt"
BL -b $B4 -P $R -- $M/klei staan beelden=1 $GROOT monsters=24 klei 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-spel staan beelden=1 monsters=24 klei speerkijkt 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-loop lopen beelden=12 richtingen=Z,ZW,W,NO monsters=16 klei speerkijkt 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-steek proef_steek beelden=8 richtingen=ZW,W monsters=16 klei 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-val proef_val beelden=8 richtingen=ZW monsters=16 pixels=1024 ortho=4.0 klei 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-helm staan beelden=1 richtingen=Z,W,ZW pixels=1024 ortho=0.72 elevatie=25 doelz=1.2 monsters=32 klei speerkijkt 2>&1 | filter
BL -b $B4 -P $R -- $M/klei-helm-boven staan beelden=1 richtingen=Z pixels=1024 ortho=0.72 elevatie=89 doelz=1.2 monsters=32 klei speerkijkt 2>&1 | filter
mark klei
BL -b $B4 -P $R -- $M/renders-groot staan beelden=1 $GROOT monsters=48 2>&1 | filter
BL -b $B4 -P $R -- $M/renders/staan staan beelden=4 monsters=64 speerkijkt 2>&1 | filter
BL -b $B4 -P $R -- $M/renders/lopen lopen beelden=12 monsters=64 speerkijkt 2>&1 | filter
mark verf
$PY $G/vel.py $M/renders/staan $M/vellen speerman staan 4 fps=3 | tail -1
$PY $G/vel.py $M/renders/lopen $M/vellen speerman lopen 12 fps=15 | tail -1
$PY $G/controle_vel.py $M/vellen $W/controle-vel.json speerman staan lopen | tail -1
$PY $P/stabiliteit.py $W/stabiliteit-lopen.json "V3=$S/vormproef/renders/lopen,V4=$M/renders/lopen" lopen 12
$PY $P/stabiliteit.py $W/stabiliteit-staan.json "V3=$S/vormproef/renders/staan,V4=$M/renders/staan" staan 4
mark vel
BL -b $B4 -P $P/doorsteek4.py -- $W/doorsteek-V4.json 2>&1 | filter
BL -b $V3 -P $P/doorsteek4.py -- $W/doorsteek-V3.json oudidle 2>&1 | filter
mark doorsteek
$PY $P/film2.py $W/E-lopen-V3-V4.mp4 "V3=$S/vormproef/renders/lopen,V4=$M/renders/lopen" lopen 12 15 richtingen=Z,ZW,O,NO | tail -1
$PY $P/film2.py $W/E-staan-V3-V4.mp4 "V3=$S/vormproef/renders/staan,V4=$M/renders/staan" staan 4 3 richtingen=Z,ZW,O,NO herhaal=4 | tail -1
$PY $P/platen4.py $W $M
mark platen
echo KETEN KLAAR
