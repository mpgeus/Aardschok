#!/bin/bash
# Hunyuan3D-2mv: na de proeven de laatste renders, de export met UV, de kwaliteitsmeting, de platen en de film van de loop. Schrijft in uit/stijl/hunyuan en docs/art/bewijs/hunyuan.
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
W="$R/docs/art/bewijs/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
mkdir -p "$W"
kijk() { m="$1"; d="$2"; shift 2; timeout 1500 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$m.npz" "$U/$d" schaal=1 as=0,0 elevatie=10 monsters=24 "$@" 2>&1 | grep -E 'Traceback|rror:' || true; }
kijk ruw proef/A/ruw-vlak mat=klei elevatie=0
kijk v_speer proef/A/alleen-verf mat=verf
# het model als uitwisselbaar bestand: lichter, met UV en texturen
mkdir -p "$U/model"
t0=$(date +%s)
timeout 3000 "$BL" -b -P "$P/hy_uv.py" -- "$U/v_eind.npz" "$U/model/speerman-hunyuan.glb" vlakken=60000 textuur=2048 "laag=$U/v_speer.npz" 2>&1 | grep -E '^UV|Traceback|rror:' | cut -c1-400
echo "UV $(( $(date +%s) - t0 )) s"
timeout 900 "$BL" -b -P "$P/hy_kijk.py" -- "$U/model/speerman-hunyuan.glb" "$U/proef/E/glb" schaal=1 as=0,0 elevatie=10 monsters=24 mat=model richtingen=Z,N 2>&1 | grep -E 'Traceback|rror:|MESH' | cut -c1-220
# de meting: de vier richtingen uit de invoer, en de vier die er niet in zaten
"$PY" "$P/hy_kwaliteit.py" "$W/kwaliteit-invoer.json" plaat=vrij "V4=$U/v4/klei-e10" "ruw=$U/proef/A/ruw-vrij" "klei=$U/proef/F/klei" "eind=$U/proef/F/verf" richtingen=Z,W,N,O
"$PY" "$P/hy_kwaliteit.py" "$W/kwaliteit-diagonaal.json" plaat=vrij "V4=$U/v4/klei-e10" "klei=$U/proef/F/klei" "eind=$U/proef/F/verf" richtingen=ZW,NW,NO,ZO
"$PY" "$P/hy_platen.py" "$U" "$W"
"$PY" "$P/hy_spelrij.py" "$W/hy-spelmaat-vellen.png" "Hunyuan, vellen=$U/spel/vellen/"
mkdir -p "$W/acht-richtingen"
for r in Z ZW W NW N NO O ZO; do cp "$U/proef/F/verf/staan-$r-00.png" "$W/acht-richtingen/verf-$r.png"; cp "$U/proef/F/verf-30/staan-$r-00.png" "$W/acht-richtingen/verf-30-graden-$r.png"; cp "$U/proef/F/klei/staan-$r-00.png" "$W/acht-richtingen/klei-$r.png"; done
"$PY" "$P/hy_film.py" "$W/rig-lopen-klei-verf.mp4" "$U/rig3" 12 15 2>&1 | tail -1 | cut -c1-200
cp "$U/invoer_vrij-blad.png" "$W/invoer-vrij.png"
cp "$P/hy_config.json" "$W/hy_config-kopie.json"
for n in v_eind v_spel v_ruw ruw; do cp "$U/$n.json" "$W/log-$n.json"; done
cp "$U/rig3/rig.json" "$W/rig.json"
cp "$U/model/speerman-hunyuan-uv.json" "$W/uv.json" 2>/dev/null
echo EIND KLAAR
