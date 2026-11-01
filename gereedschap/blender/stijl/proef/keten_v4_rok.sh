#!/bin/bash
# Fase 5 van vormproef V4: de rok op twee manieren (A: betere gewichten; B: hulpbotten per pand), met doorsteek en een loop in klei. Schrijft alleen in uit/stijl/vormproef4.
set -eo pipefail
PS4='+ $(date +%H:%M:%S) '; set -x
cd "$(dirname "$0")/../../../.."
BL() { timeout 1200 "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" "$@"; }
S=gereedschap/pixelart/uit/stijl; V=$S/vormproef4; P=gereedschap/blender/stijl/proef
filter() { grep -E "KLAAR|Traceback|Error:" || true; }
for r in a b; do
  R=$(echo $r | tr a-z A-Z)
  rm -rf $V/$r/klei-loop
  BL -b --factory-startup -P $P/vorm4.py -- $V/$r/speerman-v4.blend rok=$R 2>&1 | filter
  BL -b $V/$r/speerman-v4.blend -P $P/render4.py -- $V/$r/klei-loop lopen beelden=12 richtingen=ZW,W,NO monsters=16 klei speerkijkt 2>&1 | filter
  BL -b $V/$r/speerman-v4.blend -P $P/render4.py -- $V/$r/klei staan beelden=1 richtingen=Z,ZW,W,N pixels=1024 ortho=2.0 elevatie=25 doelz=0.8 monsters=24 klei speerkijkt 2>&1 | filter
  BL -b $V/$r/speerman-v4.blend -P $P/doorsteek4.py -- $V/$r/doorsteek.json 2>&1 | filter
done
echo KETEN KLAAR
