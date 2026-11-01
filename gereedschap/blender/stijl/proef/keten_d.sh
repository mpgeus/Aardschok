#!/bin/bash
# De keten van methode D (vraag 192, de methodeproef): verf, licht, AI op lijf en speer, en de lagen terug op het oppervlak. Daarna rendert keten_d8.sh de sprites.
cd "$(dirname "$0")/../../../.."
PY=/c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
S=gereedschap/pixelart/uit/stijl; M=$S/methoden; P=gereedschap/blender/stijl/proef; ZON="zon=-0.72,-0.5,0.72"
$PY $P/schilder.py $M/tex/texturen $M/tex/B | tail -1
$PY $P/schilder.py $M/tex/texturen $M/tex/B0 ao=0.25 | tail -1
"$BL" -b $M/tex/speerman-tex.blend -P $P/gbuffer.py -- $M/gbD30 staan beelden=1 richtingen=Z,ZW,ZO,N $ZON tex=$M/tex/B0 2>&1 | grep -E "KLAAR|Error|Traceback"
RAMPS=ramps-d.json $PY $P/verlicht.py ijk $M/gbD30 staan > /dev/null
CAM="pixels=832 hoog=1216 ortho=1.62 elevatie=25 doelz=0.66 monsters=64"
"$BL" -b $M/tex/speerman-tex.blend -P $P/gbuffer.py -- $M/ai/gbD staan beelden=1 $CAM zonder=speer $ZON tex=$M/tex/B0 2>&1 | grep -E "KLAAR|Error|Traceback"
RAMPS=ramps-d.json $PY $P/verlicht.py $M/ai/gbD $M/ai/D-r staan | tail -1
$PY $P/ai_invoer.py $M/ai/gbD $M/ai/D-r $M/ai/D-inv staan | tail -1
node gereedschap/ai/textuur-proef.cjs $M/ai/D-inv $M/ai/D-ai staan denoise=0.5 2>&1 | tail -9
# de speer apart: hij zou anders het lijf bedekken
CS="pixels=832 hoog=1216 ortho=2.0 elevatie=25 doelz=0.95 monsters=64"
"$BL" -b $M/tex/speerman-tex.blend -P $P/gbuffer.py -- $M/ai/gbS staan beelden=1 richtingen=Z,W,N,O $CS alleen=speer $ZON tex=$M/tex/B0 2>&1 | grep -E "KLAAR|Error|Traceback"
RAMPS=ramps-d.json $PY $P/verlicht.py $M/ai/gbS $M/ai/S-r staan | tail -1
$PY $P/ai_invoer.py $M/ai/gbS $M/ai/S-r $M/ai/S-inv staan | tail -1
$PY -c "
from PIL import Image
Image.open('docs/art/referentie/aardschok-speerman-detail.png').convert('RGB').crop((30,735,760,860)).save('$M/ai/stijl-speer.png')"
node gereedschap/ai/textuur-proef.cjs $M/ai/S-inv $M/ai/S-ai staan richtingen=Z,W,N,O denoise=0.45 zin=speer stijl=$M/ai/stijl-speer.png lijn=0.4 2>&1 | tail -5
$PY $P/projecteer.py laag $M/ai/D-inv $M/ai/D-ai $M/ai/gbD $M/tex/texturen $M/tex/D-laag staan | tail -1
$PY $P/projecteer.py laag $M/ai/S-inv $M/ai/S-ai $M/ai/gbS $M/tex/texturen $M/tex/D-laag staan richtingen=Z,W,N,O delen=speer per=0 | tail -1
echo KETEN KLAAR
