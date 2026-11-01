#!/bin/bash
# De vergelijkende renders van de methodeproef (vraag 192): elke methode op dezelfde pose, camera, schaal en achtergrond, heel groot (25 graden, 1536 pixels) en in de spelopstelling
# (30 graden, 768 pixels, de bron van de sprites). De zon van de methoden met geschilderd licht staat meer opzij; de andere houden het licht van de productie.
cd "$(dirname "$0")/../../../.."
PY=/c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
S=gereedschap/pixelart/uit/stijl; M=$S/methoden; P=gereedschap/blender/stijl/proef; R=gereedschap/blender/stijl/render.py
ZON="zon=-0.72,-0.5,0.72"; HOOG="pixels=1536 ortho=2.0 elevatie=25 doelz=0.9 monsters=96"; RS=Z,ZW,O,N; TB=$M/tex/speerman-tex.blend
filter() { grep -E "KLAAR|Error|Traceback"; }
curl -s -X POST http://127.0.0.1:8188/free -H 'Content-Type: application/json' -d '{"unload_models":true,"free_memory":true}' > /dev/null

t0=$(date +%s); mark() { echo "$1: $(( $(date +%s) - t0 )) s"; t0=$(date +%s); }

# de huidige render
"$BL" -b $S/bron/speerman.blend -P $R -- $M/hoog/nu staan beelden=1 richtingen=Z,ZW,W,NW,N,NO,O,ZO $HOOG speerkijkt 2>&1 | filter
mark nu-hoog
# A: het geschilderde licht op de verf per punt
"$BL" -b $S/bron/speerman.blend -P $P/gbuffer.py -- $M/g/A-s staan beelden=1 richtingen=$RS $ZON speerkijkt 2>&1 | filter
$PY $P/verlicht.py ijk $M/g/A-s staan richtingen=Z,ZW,O > /dev/null
$PY $P/verlicht.py $M/g/A-s $M/spel/A staan | tail -1
"$BL" -b $S/bron/speerman.blend -P $P/gbuffer.py -- $M/g/A-h staan beelden=1 richtingen=Z,ZW $HOOG $ZON speerkijkt 2>&1 | filter
$PY $P/verlicht.py $M/g/A-h $M/hoog/A staan | tail -1
mark A
# B: geschilderde texturen in het licht van de productie
"$BL" -b $TB -P $P/render_tex.py -- $M/hoog/B staan beelden=1 richtingen=Z,ZW $HOOG speerkijkt tex=$M/tex/B 2>&1 | filter
"$BL" -b $TB -P $P/render_tex.py -- $M/spel/B staan beelden=1 richtingen=$RS monsters=64 speerkijkt tex=$M/tex/B 2>&1 | filter
mark B
# C: de AI-laag uit acht aanzichten, projecteerd op de verf, in het licht van de productie
$PY $P/projecteer.py $M/ai/C-inv $M/ai/C-ai $M/ai/gb $M/tex/texturen $M/tex/texturen $M/tex/C staan wijze=detail hoogdoorlaat=60 scherp=10 sterkte=1.2 | tail -1
"$BL" -b $TB -P $P/render_tex.py -- $M/hoog/C staan beelden=1 richtingen=Z,ZW $HOOG speerkijkt tex=$M/tex/C 2>&1 | filter
"$BL" -b $TB -P $P/render_tex.py -- $M/spel/C staan beelden=1 richtingen=$RS monsters=64 speerkijkt tex=$M/tex/C 2>&1 | filter
mark C
# D: geschilderde verf, geschilderd licht, en de AI-laag op het oppervlak. D1: één laag voor alle richtingen. D8: per richting een eigen laag.
for v in D1 D8; do
  extra=""; [ $v = D1 ] && extra="laagals=alle"
  "$BL" -b $TB -P $P/gbuffer.py -- $M/g/$v-s staan beelden=1 richtingen=$RS $ZON speerkijkt tex=$M/tex/B0 laag=$M/tex/D-laag $extra 2>&1 | filter
  RAMPS=ramps-d.json $PY $P/verlicht.py $M/g/$v-s $M/spel/$v staan | tail -1
  "$BL" -b $TB -P $P/gbuffer.py -- $M/g/$v-h staan beelden=1 richtingen=Z,ZW $HOOG $ZON speerkijkt tex=$M/tex/B0 laag=$M/tex/D-laag $extra 2>&1 | filter
  RAMPS=ramps-d.json $PY $P/verlicht.py $M/g/$v-h $M/hoog/$v staan | tail -1
  mark $v
done
mkdir -p $M/spel/nu; cp $S/renders/staan/staan-*-00* $S/renders/staan/staan-render.json $M/spel/nu/
K="nu=$M/hoog/nu,A=$M/hoog/A,B=$M/hoog/B,C=$M/hoog/C,D1=$M/hoog/D1,D8=$M/hoog/D8"; L="nu=$M/spel/nu,A=$M/spel/A,B=$M/spel/B,C=$M/spel/C,D1=$M/spel/D1,D8=$M/spel/D8"
$PY $P/vergelijk.py docs/art/bewijs/methoden "$K" "$L"
echo KETEN KLAAR
