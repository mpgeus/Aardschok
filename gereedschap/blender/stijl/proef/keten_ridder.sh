#!/bin/bash
# De ridder (Marcel, 1 nov: "De knight"): paard, ruiter, schild en zwaard met hun skelet, tot spelvellen en films. De runs staan in uit/stijl/hunyuan/splat/{paard,ridder,schild,zwaard}; schrijft alleen in splat/ridder-samen.
# Alleen om in de browser te bekijken; productie blijft ongemoeid.
#   bash keten_ridder.sh
set -o pipefail
R="C:/Users/mpgeu/Desktop/Claude Code/Aardschok"
P="$R/gereedschap/blender/stijl/proef"
G="$R/gereedschap/blender/stijl"
H="$R/gereedschap/pixelart/uit/stijl/hunyuan/splat"
PY="C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe"
U="$H/ridder-samen"
rm -rf "$U/spel" "$U/film"
mkdir -p "$U/spel" "$U/film"
"$PY" "$P/hy_ridder.py" "$H" "$U/spel/renders" pixels=1024 ortho=4.0 doel=1.0 sterven_vak=1.25 2>&1 | grep -E 'Traceback|rror|renders|File|line ' | cut -c1-200
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" ridder staan 4 fps=3 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" ridder lopen 12 fps=15 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" ridder aanval 8 fps=12 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" ridder geraakt 3 fps=12 kleur=1.0 scherpte=0.2 | tail -1
"$PY" "$G/vel.py" "$U/spel/renders" "$U/spel/vellen" ridder sterven 7 fps=8 kleur=1.0 scherpte=0.2 | tail -1
echo VEL KLAAR
"$PY" "$P/hy_ridder.py" "$H" "$U/film/verf" elevatie=20 pixels=640 ortho=4.2 doel=1.1 sterven_vak=1 richtingen=ZW,W,Z,N 2>&1 | grep -E 'Traceback|rror|renders' | cut -c1-200
"$PY" "$P/hy_film.py" "$U/lopen.mp4" "$U/film" 12 15 groot=verf:Z,verf:ZW,verf:W cel=640 klein=0 2>&1 | tail -1 | cut -c1-200
"$PY" "$P/hy_film.py" "$U/aanval.mp4" "$U/film" 8 12 groot=verf:Z,verf:ZW,verf:W houding=aanval herhaal=6 cel=640 klein=0 rust=staan:6 2>&1 | tail -1 | cut -c1-200
"$PY" "$P/hy_film.py" "$U/geraakt.mp4" "$U/film" 3 12 groot=verf:Z,verf:ZW,verf:W houding=geraakt herhaal=6 cel=640 klein=0 rust=staan:10 2>&1 | tail -1 | cut -c1-200
"$PY" "$P/hy_film.py" "$U/sterven.mp4" "$U/film" 7 8 groot=verf:Z,verf:ZW,verf:W houding=sterven herhaal=4 cel=640 klein=0 2>&1 | tail -1 | cut -c1-200
echo FILM KLAAR
