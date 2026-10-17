# De cameraproef: vier standen (17 okt 2026)

Gespeeld op `main` op `00744e33`. Opnieuw maken: `node gereedschap/cameraproef/cameraproef.cjs` (ongeveer een minuut).
Het spel en de kunst zijn niet veranderd; alles van de proef staat in deze map.

## Wat de proef doet

- **Het spel tekent alles zelf.** Het script opent het echte spel headless, zoals `npm run schermen`: het lege begin,
  geen spellus, een vaste reeks toeval, met de videokaart, op zoom 1 (ware pixels).
- **De wereld draait, niet de camera.** Het spel kan de camera niet draaien. Een kwartslag van de camera met de klok mee
  is dezelfde wereld een kwartslag tegen de klok in, met de zon op dezelfde plek van het scherm. Dat is de afspraak van
  4 okt (`ontwerp/beeld.md`, "De draaibare huizen").
  - Elke plek, voet, deur en blik draait om het midden van het dorp.
  - Elk gebouw krijgt de tekening met zijn deur naar de nieuwe kant (-z, -o, -n, -w).
  - Elke stand is een vers spel.
- **Het dorp**, op een leeg stuk gras van het eiland, in de stijl van dat eiland (planken, spanen):
  - een herberg (`herberg1`, 11×8);
  - twee hutten (`hut1` en `hut4`);
  - een boerderij (`boerderij2`);
  - 11 bomen van 11 soorten;
  - 4 inwoners;
  - een weg langs de deuren, met een zijweg.
- **Bewust krap neergezet.** De herberg staat vóór de hut, met tussen hun deuren een weg van één tegel.
- **Uit:**
  - `camera_000.png` tot `camera_270.png`: 1575×1032, dezelfde uitsnede om het midden;
  - `camera_vergelijking.png`: de vier in een raster van twee bij twee, 3222×2264;
  - `zichtbaarheid.json`: de metingen.
- **Zo wordt gemeten.** Het dorp wordt zonder schaduwen nog eens getekend, met en zonder elk ding. De pixels die
  veranderen, zijn van dat ding; zo volgt hoeveel ervan te zien is, en wie het afdekt.

De camerastanden:
- 000: vanuit het zuidoosten, de stand van het spel;
- 090: vanuit het zuidwesten;
- 180: vanuit het noordwesten;
- 270: vanuit het noordoosten.

## Zichtbaarheid

Hoeveel procent te zien is (bij een deur en de weg: hoeveel van de tegel vrij ligt).

| | 000 | 090 | 180 | 270 | beste |
|---|---:|---:|---:|---:|---:|
| herberg | 88 | 94 | 71 | 54 | 94 |
| hut aan de weg (achter de herberg) | **23** | 47 | 72 | 61 | 72 |
| hut in het westen | 49 | 99 | 87 | 68 | 99 |
| boerderij | 87 | 54 | 89 | 89 | 89 |
| inwoner op de weg tussen herberg en hut | 0 | 0 | 0 | 0 | **0** |
| inwoner achter de hut | 0 | 0 | 26 | 19 | 26 |
| inwoner bij de deur van de boerderij | 83 | 0 | 0 | 0 | 83 |
| inwoner op de zijweg | 99 | 71 | 100 | 0 | 100 |
| deur van de herberg | 0 | 0 | 0 | 0 | 0 |
| deur van de hut aan de weg | 0 | 0 | 0 | 0 | 0 |
| deur van de hut in het westen | 0 | 75 | 0 | 0 | 75 |
| deur van de boerderij | 85 | 0 | 0 | 0 | 85 |
| de weg, vrij | 33 | 34 | 16 | 0 | |
| tegels van de weg helemaal weg (van 36) | 21 | 21 | 29 | 36 | |

Wie wie afdekt:
- **000:** de herberg dekt de hut aan de weg voor 71% af, de hut in het westen voor 47%, en de inwoner op de weg helemaal.
- **090:** de herberg dekt de boerderij voor 37% af, en de inwoner bij de boerderij helemaal.
- **180:** de hut aan de weg dekt een vijfde van de herberg af, en de bomen in het noorden de inwoner achter de hut voor 74%.
- **270:** de boerderij dekt de herberg voor 35% af; de bomen nemen de inwoner achter de hut, en de herberg die op de
  zijweg.

Wat het zegt:
- **Gebouwen: draaien helpt duidelijk.** Een gebouw achter een groot gebouw komt in een andere stand in beeld. De hut
  achter de herberg gaat van 23% naar 72%, de hut in het westen van 49% naar 99%.
- **Inwoners: draaien helpt nauwelijks.**
  - Wie in een smalle straat tussen twee hoge gebouwen staat, is in alle vier de standen weg.
  - Wie achter een huis staat, komt maar half terug, omdat er dan bomen voor staan.
  - En wat in de ene stand te zien is, verdwijnt in een andere: de inwoner bij de boerderij is alleen in 000 te zien.
  - In 000 zijn 2 van de 4 inwoners goed te zien, in de andere standen hooguit één.
- **Deuren en de weg: ook nauwelijks.**
  - Een deur aan de andere kant van het huis zie je per stand niet. Een deur aan een smalle straat zie je in geen enkele
    stand.
  - Van de weg ligt per stand hooguit een derde vrij, want de huizen zijn 350 tot 600 pixels hoog op een tegel van 32.
- **Een stand die op zichzelf alles laat zien, is er niet.** Pas samen tonen ze alle gebouwen. De speler moet dan zelf
  draaien om iets terug te vinden.

## Beeldkwaliteit

- **Daken en gevels:** elke stand is het huis echt van die kant (de muren rondom ingevuld, sinds 4 okt), met ramen,
  luiken, bloembakken en vakwerk op elke muur. De schoorstenen en dakkapellen draaien mee.
- **Pixels:** de tekeningen van het spel op ware pixels, zonder schalen of filter. De kwaliteit is in elke stand
  dezelfde als nu in het spel.
- **Licht en schaduw:** in elke stand komt het licht van linksboven op het scherm, en vallen de schaduwen dezelfde kant
  op. Dat klopt met de tekeningen, maar betekent wel dat de zon in de wereld meedraait met de camera. Om 10 uur valt de
  schaduw in alle vier de standen naar rechtsonder.
- **Verhoudingen:** elke voet past in elke stand (de maat wisselt bij een kwartslag), en elke deur ligt in elke stand op
  dezelfde tegel van de weg.
- **Volgorde:** in de uitsneden van 600×400 geen fout gezien. Bomen staan voor en achter muren, een inwoner staat achter
  een struik, en een dak achter een dak. De metingen van wie wie afdekt, kloppen met de plattegrond.
- **De weg:** het zand en zijn randen kloppen in elke stand.
- **De ramen** die oranje zijn, zijn dat in de tekening zelf (`tegels/huizen/…-n.png`), niet door het licht.

## Ontbrekende aanzichten en wat de proef niet toetst

- **Bomen: één aanzicht.** Een boom blijft in elke stand dezelfde tekening (niet gespiegeld, niet vervormd). Bij ronde
  bomen valt dat niet op. Bij een scheve groveDen of een smalle populier wel, als je ernaar zoekt: hij leunt in elke
  stand dezelfde kant op het scherm op.
- **Niet in de proef, omdat ze één aanzicht hebben:**
  - de 29 werkplaatsen (`dorp.cjs`, `dorp2.cjs`, met de soorten die ze lenen);
  - de huizen van het ontworpen gehucht;
  - de bruggen;
  - het erf.

  Die moeten eerst in vier standen worden gerenderd, en hun bouwers kennen nog geen draai.
- **De grond:** het gras draait mee (elke tegel houdt zijn soort gras), maar het patroon in een grondtegel ligt aan het
  scherm vast. Dat is niet te zien.
- **Niet getoetst:**
  - heuvels en hun wanden (dit land is vlak);
  - de mist (uit);
  - de nacht met de ramen en de lantaarns;
  - akkers, waarvan de rijen een richting hebben;
  - bruggen;
  - het kijkgat.
- **In het spel zelf:**
  - de projectie, de diepte, de wanden, het afdekken door heuvels en de muis moeten een draai krijgen;
  - een draai tekent de grond opnieuw (zoals de eerste keer uitzoomen);
  - zie het onderzoek "Camera, zoom en 3D".
- **Een eigen ingreep van de proef:** het vak van de kaart (`w.vak`) is in de proef het proefstuk. Een gelegde weg
  tekent het spel alleen binnen het vak om het dorp. In het spel zelf hoeft dat niet.

## Advies

**Draaien is de moeite waard als extra, niet als oplossing voor het zicht.**

Wat goed gaat:
- De bestaande kunst en de bestaande renderer kunnen het. De huizen hebben hun vier standen, de pixel art blijft gelijk,
  en de volgorde en de schaduwen kloppen vanzelf als de wereldcoördinaten draaien.
- Gebouwen van alle kanten bekijken voegt echt iets toe, ook voor beelden en een trailer.

Wat niet gaat:
- Het probleem dat de proef het scherpst laat zien, lost draaien niet op: inwoners en deuren in een smalle straat tussen
  hoge huizen. Die blijven in elke stand weg.
- Dat vraagt iets dat niet van de stand afhangt, zoals het kijkgat van `js/doorkijk.js`. Dat werkt nu alleen voor de
  aanvoerder, gevechten, bezoekers en het plein.

Voorstel:
1. Niet voor de demo.
2. Eerst het kijkgat voor gewone inwoners, of een toets die de gebouwen doorschijnend maakt. Dat is iets nieuws, dus
   jouw keuze.
3. Draaien in kwartslagen na de demo, als de werkplaatsen, de bruggen en het erf vier aanzichten hebben. Bouw het dan
   zoals deze proef: de wereldcoördinaten draaien bij het tekenen, en de renderer blijft dezelfde.
