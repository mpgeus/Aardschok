# V4: animatiecontrole

## De bestaande animaties

| Animatie | Status |
|---|---|
| `lopen` | Bestaat. **0 van 182 kanalen veranderd** tegen de productie |
| `staan` | V4 heeft een eigen rustpose: 72 van 182 kanalen anders. De productie blijft staan in `beweging.py` |
| `aanval`, `aanval2`, `geraakt`, `sterven` | **Bestaan niet op dit skelet.** Alleen als oude vellen van het eerdere model. Niet te testen op V4 |

Skelet: 26 botten, 0 verschillen in naam, plek of ouder. Rok-variant A voegt niets toe. Modelcontrole 117 van 117, vellen 42 van 42.

De werkvariant staat in `pose4.py`, die `beweging.py` alleen in het eigen proces vervangt.

## Lopen

| Controle | Uitkomst |
|---|---|
| Benen wisselen af | Ja, correlatie -0,886 |
| Contact | Links voor op beeld 11 van 24, rechts op beeld 23 |
| Down en up | Bekken laagst op beeld 0 en 12, hoogst op 6 en 18, bereik 2,2 cm |
| Sluit op beeld 1 | Ja, geen sprong |
| Grootste draai per beeld | Dij 21,2°, voet 13,7° (van 24 beelden) |
| Voet glijdt | Nee (controle: 0,0 cm afwijking) |
| Wortel | Vast; bekken schuift 3,2 cm opzij als gewichtsverplaatsing |
| Hand op de speer | 0,0 mm in elk beeld |
| Speer recht | Ja |
| Voetlijn | Vast per richting; in het vel lager door de grotere schaal (`V4-PROPORTIES.md`) |

**Openstaand, ook in de productie:** de laagste zool per beeld loopt van -1,8 cm tot +1,9 cm tegen de grond: de voet zakt soms iets in de grond of zweeft iets. Dat is minder dan een halve tot één pixel op spelmaat, maar **niet opgelost**, omdat `lopen` niet mocht veranderen.

Beeld: `E-loop-klei.png`, `E-loop-rok.png`, `E-lopen-V3-V4.mp4`.

## Van staan naar lopen

Het spel wisselt zonder overvloeien van vel. Hieronder hoe ver alles dan springt naar het dichtstbijzijnde loopbeeld (beeld 10), in meter.

| Punt | Productie-rust | V4-rust |
|---|---|---|
| Bekken | 0,020 | 0,013 |
| Voet links | 0,011 | 0,022 |
| Voet rechts | 0,068 | 0,082 |
| Speerhand | 0,042 | **0,110** |
| Vrije hand | 0,064 | **0,135** |
| Speerpunt | 0,074 | **0,137** |
| Hoofd | 0,025 | 0,027 |

**Dit is slechter geworden.** De armen staan in de nieuwe rust anders dan in het bestaande lopen. 0,137 m is zo'n 8 pixels op spelmaat, in één beeld. Het bekken springt niet en de romp draait niet opeens, maar de armen en de speer verspringen wel zichtbaar (`E-staan-naar-lopen.png`).

Oplossing zonder bestaande animaties te raken: een korte overgang van 2 of 3 beelden, of een variant van `lopen` met de armen dichter bij de nieuwe rust. Beide heb ik niet gemaakt: dat is een keuze voor Marcel.

## Acht richtingen

Alle acht gerenderd, staan 4 beelden, lopen 12. `C-acht-richtingen.png`, `D-acht-80px.png`. Bewegen op 80 pixels: lopen verschil per beeld 12,98 (V3) tegen 12,30 (V4), wisselende randpixels 218,4 tegen 229,0. Die laatste stijgt door de grotere figuur.

## De testen

**Dit zijn geen spelanimaties.**

| Test | Uitkomst | Beeld |
|---|---|---|
| Steek | Hand 0,0 mm op de speer, geen zichtbare breuk in schouder of elleboog. **De speer gaat in sommige beelden door de mouw** (`V4-CLIPPING.md`) | `E-TEST-steek.png` |
| Val | Valt als één stuk, geen ontplofte mesh. Te rigide om iets over kleding te zeggen | `E-TEST-val.png` |
| Hoofd ±15° draaien, ±12° kantelen | Helm raakt tabberd en mouw niet | `V4-CLIPPING.md` |

## Hand en speer

- Hand op de as van de speer: 0,0 mm in alle houdingen.
- Vuist raakt de schacht: 799 snijdende driehoeken in rust (V3: 749), dus de vingers sluiten om de schacht.
- De speer blijft in de rechterhand; hij wisselt niet.
- Pols: speerhand 16,5°, vrije hand 11,4°. Elleboog: 86° en 95°.
