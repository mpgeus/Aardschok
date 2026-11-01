#!/bin/bash
# Hunyuan3D-2mv: de gecontroleerde proeven A tot en met F, elk met één verschil. Alles op de camera van de plaat (10 graden, ortho 2,0, doel 0,85, 1024 pixels), behalve waar het verschil de camera is.
# Schrijft alleen in uit/stijl/hunyuan. Blender op CUDA.
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
U="$R/gereedschap/pixelart/uit/stijl/hunyuan"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
BL="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
K0=v_geen; K1=v_speer; K2=v_eind; K3=v_on
bouw() { timeout 900 "$PY" "$P/hy_bouw.py" "$P/hy_config.json" "$1" "$U" 2>&1 | tail -1 | cut -c1-150; }
kijk() { # model map extra...
  m="$1"; d="$2"; shift 2
  timeout 1800 "$BL" -b -P "$P/hy_kijk.py" -- "$U/$m.npz" "$U/proef/$d" schaal=1 as=0,0 elevatie=10 monsters=24 "$@" 2>&1 | grep -E 'Traceback|rror:' || true
}
for v in ruw a_ruw v_ruw $K0 $K1 $K2 $K3 v_det v_sch; do bouw "$v"; done
# A: de vorm. Dezelfde klei, camera en licht; de bron is het verschil
kijk ruw A/ruw-detail mat=klei
kijk a_ruw A/ruw-acht mat=klei
kijk v_ruw A/ruw-vrij mat=klei
kijk "$K2" A/eind mat=klei
# B: het materiaal. Dezelfde mesh, hetzelfde licht
kijk "$K0" B/klei mat=klei richtingen=Z,N
kijk "$K0" B/kleur mat=kleur richtingen=Z,N
kijk "$K0" B/pbr mat=pbr richtingen=Z,N
kijk "$K0" B/onverlicht mat=onverlicht richtingen=Z,N
kijk "$K0" B/verf-ao mat=verf ao=0.6 richtingen=Z,N
kijk "$K2" B/eind mat=verf ao=0.6 richtingen=Z,N
# C: het licht. Dezelfde mesh, dezelfde ontlichte verf
kijk "$K3" C/spel mat=pbr richtingen=Z,N
for l in plaat zacht hoog; do kijk "$K3" C/$l mat=pbr "licht=$P/hy_licht/$l.json" richtingen=Z,N; done
# D: de resolutie: op de spelcamera (ortho 3,0, 30 graden), en dan pas naar de spelmaat
for px in 768 1536 3072; do kijk "$K2" D/$px mat=verf ao=0.6 pixels=$px ortho=3.0 doel=0.74 elevatie=30 richtingen=Z,ZW monsters=32; done
# E: de detailmethoden los
kijk "$K0" E/geen mat=verf richtingen=Z,N
kijk v_det E/geometrie mat=verf richtingen=Z,N
kijk v_det E/geometrie-ao mat=verf ao=0.6 richtingen=Z,N
kijk v_sch E/scherp mat=verf ao=0.6 richtingen=Z,N
kijk "$K2" E/echt-licht mat=verf ao=0.6 richtingen=Z,N
# F: de beste kandidaat in acht richtingen, op de camera van de plaat en op die van het spel
kijk "$K2" F/klei mat=klei richtingen=Z,ZW,W,NW,N,NO,O,ZO
kijk "$K2" F/verf mat=verf ao=0.6 richtingen=Z,ZW,W,NW,N,NO,O,ZO
kijk "$K2" F/verf-30 mat=verf ao=0.6 elevatie=30 richtingen=Z,ZW,W,NW,N,NO,O,ZO
echo PROEVEN KLAAR
