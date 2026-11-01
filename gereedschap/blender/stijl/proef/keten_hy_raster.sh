#!/bin/bash
# Hunyuan3D-2mv: wat de bron zelf oplevert (route 4). Eén wijziging per mesh ten opzichte van de basis (zaad 1, 20 stappen, octree 256, vier aanzichten).
# Een mesh die er al is, slaat hij over. Schrijft alleen in uit/stijl/hunyuan. ComfyUI moet draaien, de invoer moet er staan (`hy_invoer.py <uit> plaat=acht`, `plaat=mix`).
# Octree 512 is afgebroken: 384 gaf al geen nieuwe vorm en zat met 23,2 GB aan de grens van het geheugen.
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
for i in $(seq 1 90); do curl -s -o /dev/null http://127.0.0.1:8188/system_stats && break; sleep 2; done
maak() {
  naam="$1"; shift
  [ -f "$U/$naam.glb" ] && return 0
  timeout 2400 "$PY" "$P/hy_comfy.py" "$U" naam="$naam" "$@" 2>&1 | tail -1 | cut -c1-480 || echo "FOUT bij $naam"
}
maak speerman
maak z2 zaad=2
maak z3 zaad=3
maak s40 stappen=40
maak o384 octree=384
maak acht invoer=invoer_acht
maak mix invoer=invoer_mix
maak acht_z2 invoer=invoer_acht zaad=2
maak acht_r5000 invoer=invoer_acht resolutie=5000
echo RASTER KLAAR
