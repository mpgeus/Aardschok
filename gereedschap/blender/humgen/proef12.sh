# Ronde 12 (Marcel, 29 okt: "Verander niet alles tegelijkertijd"; "Gebruik afzonderlijke configuraties"): een proef op de
# soldaat van ronde 11 bouwen en renderen, elk in een eigen map (de variant humgen12, die op humgen11 staat; de proeven
# in basismens/proeven/r12-*.json; met VARIANT=humgen13 die van ronde 13). Zonder proef ("-") de variant zelf, met zijn
# gekozen proeven.
#
#   bash gereedschap/blender/humgen/proef12.sh <proeven, bv. r12-A1 of r12-A1,r12-A3> [bouw | <map>] [richting ...]
#
# - 'bouw': eerst de HumGen-man opnieuw (naar_basis.py: het gezicht en de huid uit 'humgen_basis'), anders de man van
#   humgen12 (gekopieerd van humgen11 als hij er nog niet is);
# - een <map>: geen nieuwe soldaat maar die uit <map>/bron/soldaat.blend, alleen het licht en de materialen van de
#   stijlen anders (de lichtproeven);
# - elke proef: A8 (de productierender), soort (het masker per materiaal) en kop, op 30 graden van ZW (de draai van de
#   speerman), en A8 in elke extra richting (Z, W, ...).
cd "$(dirname "$0")/../../.."
INST=gereedschap/blender/basismens/instellingen.json
B=$(node -p "require('./$INST').blender")
H=gereedschap/blender/basismens
V=${VARIANT:-humgen12}
G=gereedschap/pixelart/uit/basismens/$V
HG=$(node -p "require('./$INST').varianten.humgen.bouw.blend")
export BASISMENS_VARIANT=$V
naam="$1"
shift
fout() { grep -n "Traceback\|Error:" "$1" | grep -v "HIPEW\|hipew" | tail -4; }
if [ "$naam" = "-" ]; then
  unset BASISMENS_PROEF
  M=$G
else
  # een proef vervangt de lijst van de variant (variant.py), dus de proeven van de variant (die van ronde 11) eerst
  VP=$(node -p "require('./$INST').varianten['$V'].proeven.join(',')")
  export BASISMENS_PROEF="${VP:+$VP,}$naam"
  M=$G/proeven/${BASISMENS_PROEF//,/-}
fi
mkdir -p "$M/bron" "$G/bron" "$M/logs"
L=$M/logs
if [ ! -f "$G/bron/basismens.blend" ]; then
  cp gereedschap/pixelart/uit/basismens/humgen11/bron/basismens.blend "$G/bron/"
fi
BRON=$G/bron/basismens.blend
if [ "$1" = "bouw" ]; then
  t=$(date +%s); "$B" -b "$HG" -P gereedschap/blender/humgen/naar_basis.py > "$L/bouw.log" 2>&1
  echo "bouw $? $(( $(date +%s) - t ))s"; fout "$L/bouw.log"
  BRON=$M/bron/basismens.blend
  shift
fi
if [ -n "$1" ] && [ -d "$1" ]; then
  cp "$1/bron/soldaat.blend" "$M/bron/soldaat.blend"
  [ -f "$1/bron/soldaat-huid.png" ] && cp "$1/bron/soldaat-huid.png" "$M/bron/"
  shift
else
  t=$(date +%s); "$B" -b "$BRON" -P $H/soldaat.py > "$L/soldaat.log" 2>&1
  echo "soldaat $? $(( $(date +%s) - t ))s"; fout "$L/soldaat.log"
fi
for a in "A8 30 -40" "soort 30 -40" "kop 30 -40"; do
  t=$(date +%s); "$B" -b "$M/bron/soldaat.blend" -P $H/stijlen.py -- $a > "$L/stijl.log" 2>&1
  echo "$a $? $(( $(date +%s) - t ))s"; fout "$L/stijl.log"
done
for r in "$@"; do
  t=$(date +%s); "$B" -b "$M/bron/soldaat.blend" -P $H/stijlen.py -- A8 30 "$r" > "$L/stijl.log" 2>&1
  echo "A8 30 $r $? $(( $(date +%s) - t ))s"; fout "$L/stijl.log"
done
echo "PROEF $naam KLAAR"
