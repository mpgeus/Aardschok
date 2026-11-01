# De instellingen en de uitvoermap, per variant van de basismens (Marcel, 29 okt, ronde 4: "Maak een afzonderlijke
# gestileerde soldaatvariant, zonder de oorspronkelijke basismens te overschrijven"). Zonder variant is het de basismens
# zoals hij was: instellingen.json en <uit>. Met BASISMENS_VARIANT=gedrongen gaan de instellingen van
# instellingen.json/varianten/gedrongen over die van de basismens heen (een woordenboek per sleutel, de rest vervangen),
# en schrijft elke stap in <uit>/gedrongen, met dezelfde namen; zo blijft elk script hetzelfde voor elke variant.
import json
import os

HIER = os.path.dirname(os.path.abspath(__file__))
WORTEL = os.path.abspath(os.path.join(HIER, '..', '..', '..'))
BASIS = json.load(open(os.path.join(HIER, 'instellingen.json'), encoding='utf-8'))
NAAM = os.environ.get('BASISMENS_VARIANT', '')


def samen(a, b):
    """b over a heen: een woordenboek per sleutel, al het andere (ook een lijst) vervangen."""
    if not (isinstance(a, dict) and isinstance(b, dict)):
        return b
    uit = dict(a)
    for k, v in b.items():
        uit[k] = samen(a.get(k), v) if k in a else v
    return uit


if NAAM and NAAM not in BASIS['varianten']:
    raise SystemExit(f'onbekende variant {NAAM}; kies uit {", ".join(BASIS["varianten"])}')
# een variant kan op een andere variant voortbouwen ('basis', ronde 11: humgen11 op humgen)
def _variant(naam):
    v = BASIS['varianten'][naam]
    return samen(_variant(v['basis']), v) if v.get('basis') else v


INST = samen(BASIS, _variant(NAAM)) if NAAM else BASIS
UIT_BASIS = os.path.join(WORTEL, BASIS['uit'])
UIT = os.path.join(UIT_BASIS, NAAM) if NAAM else UIT_BASIS

# Een proef (Marcel, 29 okt, ronde 7: "Werk in drie afzonderlijke experimenten", "Alle wijzigingen moeten afzonderlijk
# terug te draaien zijn"): proeven/<naam>.json, een stel instellingen over de variant heen. De proeven die de variant houdt,
# staan in zijn lijst 'proeven' (een proef terugdraaien is hem uit die lijst halen). BASISMENS_PROEF=A2 of A2,B3 neemt de
# plaats in van die lijst (een experiment op de variant zonder zijn proeven; op de variant met zijn proeven: noem ze
# allemaal), en elke stap schrijft dan in <uit van de variant>/proeven/<namen>.
proef = lambda p: json.load(open(os.path.join(HIER, 'proeven', p + '.json'), encoding='utf-8'))
PROEVEN = [p for p in os.environ.get('BASISMENS_PROEF', '').split(',') if p]
for p in PROEVEN or INST.get('proeven', []):
    INST = samen(INST, proef(p))
if PROEVEN:
    UIT = os.path.join(UIT, 'proeven', '-'.join(PROEVEN))

# de onderdelen van de soldaat, van binnen naar buiten; met de stoppels in de huid (ronde 7, baard.vorm false) is er geen
# baard als vorm
KLEREN = ['broek', 'gambeson', 'laarzen', 'tabberd', 'handschoenen', 'riem', 'buidel', 'malienkraag', 'baard', 'ogen', 'helm']
if not INST['soldaat']['baard'].get('vorm', True):
    KLEREN.remove('baard')
if not INST['soldaat']['ogen'].get('vorm', True):  # ronde 10: de HumGen-man heeft eigen ogen in het lijf
    KLEREN.remove('ogen')
