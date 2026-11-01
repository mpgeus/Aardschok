#!/bin/bash
# De lagen van D8 opnieuw (na een wijziging in projecteer.py) en de G-buffers daarop; het licht en alles daarna doet keten_licht.sh. De AI en de textuurbak hoeven er niet opnieuw overheen.
# Na een nacht vastzitten (31 okt): een fout stopt de keten ook midden in een pijp (pipefail), elke stap heeft een tijdslimiet, en de regels met tijd erbij laten zien waar hij staat.
set -eo pipefail
PS4='+ $(date +%H:%M:%S) '; set -x
cd "$(dirname "$0")/../../../.."
PY="timeout 1800 /c/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL() { timeout 1800 "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" "$@"; }
S=gereedschap/pixelart/uit/stijl; M=$S/methoden; P=gereedschap/blender/stijl/proef; W=docs/art/bewijs/methoden
ZON="zon=-0.72,-0.5,0.72"; HOOG="pixels=1536 ortho=2.0 elevatie=25 doelz=0.9 monsters=96"; RS=Z,ZW,O,N; TB=$M/tex/speerman-tex.blend
filter() { grep -E "KLAAR|Error|Traceback" || true; }
t0=$(date +%s); mark() { echo "TIJD $1: $(( $(date +%s) - t0 )) s"; t0=$(date +%s); }
rm -f $M/tex/D-laag/dekking-hoofd.json $M/tex/D-laag/dekking-speer.json
$PY $P/projecteer.py laag $M/ai/D-inv $M/ai/D-ai $M/ai/gbD $M/tex/texturen $M/tex/D-laag staan
$PY $P/projecteer.py laag $M/ai/S-inv $M/ai/S-ai $M/ai/gbS $M/tex/texturen $M/tex/D-laag staan richtingen=Z,W,N,O delen=speer per=0
# zonder de paletcorrectie in de lagen heeft de rest geen zin
grep -q nul_L $M/tex/D-laag/dekking-hoofd.json
grep -q nul_L $M/tex/D-laag/dekking-speer.json
mark lagen
curl -s -X POST http://127.0.0.1:8188/free -H 'Content-Type: application/json' -d '{"unload_models":true,"free_memory":true}' > /dev/null || true
L="tex=$M/tex/B0 laag=$M/tex/D-laag speerkijkt $ZON"
BL -b $TB -P $P/gbuffer.py -- $M/g/D8-s staan beelden=1 richtingen=$RS $L 2>&1 | filter
BL -b $TB -P $P/gbuffer.py -- $M/g/D8-h staan beelden=1 richtingen=Z,ZW $HOOG $L 2>&1 | filter
BL -b $TB -P $P/gbuffer.py -- $M/vol/g-staan staan beelden=4 monsters=64 $L 2>&1 | filter
mark gb-staan
BL -b $TB -P $P/gbuffer.py -- $M/vol/g-lopen lopen beelden=12 monsters=64 $L 2>&1 | filter
mark gb-lopen
BL -b $TB -P $P/gbuffer.py -- $M/vol/g-hoog staan beelden=1 $HOOG $L 2>&1 | filter
bash $P/keten_licht.sh
