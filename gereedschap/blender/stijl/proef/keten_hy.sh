#!/bin/bash
# Hunyuan3D-2mv: één mesh uit de vier aanzichten, in ComfyUI (moet draaien), en als klei op 25 graden en vlak. Schrijft alleen in uit/stijl/hunyuan.
#   bash keten_hy.sh <naam> [draai=<graden>] [wissel]
set -eo pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
NAAM="$1"; shift
DRAAI=""; WISSEL=""
for a in "$@"; do case "$a" in draai=*) DRAAI="$a";; wissel) WISSEL="wissel";; esac; done
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:8188/system_stats && break; sleep 2; done
curl -s -o /dev/null http://127.0.0.1:8188/system_stats
if [ ! -f "$U/$NAAM.glb" ]; then
  timeout 3000 "$PY" "$P/hy_comfy.py" "$U" naam="$NAAM" $WISSEL
fi
curl -s -X POST http://127.0.0.1:8188/free -H 'Content-Type: application/json' -d '{"unload_models":true,"free_memory":true}' > /dev/null || true
for e in 25 0; do
  timeout 900 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$NAAM.glb" "$U/$NAAM/klei-e$e" elevatie=$e $DRAAI 2>&1 | grep -E 'MESH|Error|Traceback' || true
done
echo KETEN KLAAR
