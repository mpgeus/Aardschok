#!/bin/bash
# De vormproef (vraag 192, 31 okt): de nieuwe geometrie bouwen, renderen in klei en in de verf van de productie, en controleren. Hij schrijft alleen in uit/stijl/vormproef en docs/art/bewijs/vormproef; geen D8.
set -eo pipefail
PS4='+ $(date +%H:%M:%S) '; set -x
cd "$(dirname "$0")/../../../.."
PY="timeout 1800 /c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL() { timeout 1800 "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" "$@"; }
S=gereedschap/pixelart/uit/stijl; V=$S/vormproef; P=gereedschap/blender/stijl/proef; G=gereedschap/blender/stijl; W=docs/art/bewijs/vormproef
NU=$S/bron/speerman.blend; V3=$V/speerman-v3.blend; R=$G/render.py
filter() { grep -E "KLAAR|VERGELIJK|CONTROLE|FOUT|Traceback" || true; }
t0=$(date +%s); mark() { echo "TIJD $1: $(( $(date +%s) - t0 )) s"; t0=$(date +%s); }
mkdir -p $W
BL -b --factory-startup -P $P/vorm3.py -- $V3 2>&1 | filter
mark model
# geen stille fout: de controle stopt de keten
BL -b $V3 -P $G/controle_model.py -- $W/controle-model.json 2>&1 | filter
BL -b $NU -P $P/skelet_vergelijk.py -- $V/skelet-nu.json 2>&1 | filter
BL -b $V3 -P $P/skelet_vergelijk.py -- $V/skelet-v3.json $V/skelet-nu.json 2>&1 | tee $V/skelet-uitkomst.txt | filter
mark controles
GROOT="pixels=1024 ortho=2.0 elevatie=25 doelz=0.8 monsters=24 klei speerkijkt"
for m in nu v3; do
  b=$NU; [ $m = v3 ] && b=$V3
  rm -rf $V/klei-$m $V/klei-spel-$m $V/klei-loop-$m $V/klei-hand-$m
  BL -b $b -P $R -- $V/klei-$m staan beelden=1 $GROOT 2>&1 | filter
  BL -b $b -P $R -- $V/klei-spel-$m staan beelden=1 monsters=24 klei speerkijkt 2>&1 | filter
  BL -b $b -P $R -- $V/klei-loop-$m lopen beelden=12 richtingen=ZW,W,N monsters=24 klei speerkijkt 2>&1 | filter
  BL -b $b -P $R -- $V/klei-hand-$m staan beelden=1 richtingen=Z,ZW,W pixels=1536 ortho=1.25 elevatie=25 doelz=0.72 monsters=32 klei speerkijkt 2>&1 | filter
  BL -b $b -P $P/doorsteek.py -- $W/doorsteek-$m.json 2>&1 | filter
  mark klei-$m
done
rm -rf $V/renders
BL -b $V3 -P $R -- $V/renders/staan staan beelden=4 monsters=64 speerkijkt 2>&1 | filter
BL -b $V3 -P $R -- $V/renders/lopen lopen beelden=12 monsters=64 speerkijkt 2>&1 | filter
mark verf
$PY $G/vel.py $V/renders/staan $V/vellen speerman staan 4 fps=3 | tail -1
$PY $G/vel.py $V/renders/lopen $V/vellen speerman lopen 12 fps=15 | tail -1
$PY $G/controle_vel.py $V/vellen $W/controle-vel.json speerman staan lopen | tail -1
$PY $P/stabiliteit.py $W/stabiliteit-lopen.json "nu=$S/renders/lopen,v3=$V/renders/lopen" lopen 12
$PY $P/stabiliteit.py $W/stabiliteit-staan.json "nu=$S/renders/staan,v3=$V/renders/staan" staan 4
$PY $P/vormplaten.py $W
mark vel-en-platen
echo KETEN KLAAR
