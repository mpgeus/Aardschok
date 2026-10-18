# De HD-proef met het wagenwiel: materialen, geometrie, resolutie en pixelverwerking

Technische evaluatie van Claude, 18 okt 2026, op Marcels vierde opdracht (`opdracht-comfyui.md`; werklijst vraag 180).
De platen staan in `gereedschap/pixelart/uit/hdproef/` (niet in git; opnieuw met `node gereedschap/pixelart/hdproef.cjs
alles`, zo'n vier minuten op zestien kernen), de getallen in `uit/hdproef/metingen.json`.

## Het antwoord in het kort

**Gedeeltelijk.** Met onze eigen renderer, AI-materialen en betere geometrie halen we het ChatGPT-wiel in toon, licht,
materiaal en diepte (gemeten: contrast, helderheid en drukte liggen op 2× binnen een paar procent van het doel, de warmte iets erboven,
waar het oude wiel er ver onder zat), en alles blijft consistent: de textuur zit voor 93 à 94% vast op 2×, een volle slag is
pixel voor pixel het beginbeeld, en de buitenmaat is gelijk. Dat is een zichtbare stap, geen paar procent.

Wat we nog **niet** halen, is het handschrift van de ChatGPT-sprite. Vier dingen bepalen dat, in volgorde van gewicht:

1. **De pixeldichtheid.** Het ChatGPT-wiel heeft zo'n 89 beeldpunten in de hoogte, het onze op spelmaat 52: het doel is
   ruwweg een sprite van **2×** onze maat. Op onze huidige maat (één pixel per eenheid) worden een klinknagel, een
   gelaagde naaf of een naad een paar pixels ruis, hoe goed het materiaal ook is. Dit is de grootste beperking, en de
   oplossing is bekend: een HD-sprite van 2× (zie het advies).
2. **De verhoudingen.** De ChatGPT-sprite overdrijft: spaken, velg en band zijn zo'n anderhalf keer zo fors als bij ons.
   Met die maten (de laatste trede van de ladder) leest ons wiel meteen beter, op elke resolutie. Forse vormen helpen
   meer dan kleine details.
3. **Het handschrift van pixel art:** een donkere lijn om elk onderdeel, een lichte lijn van één pixel op elke rand die
   naar het licht staat, vlakke kleurvlakken met weinig tinten, en geen losse pixels. Onze renderer rekent licht zoals het
   valt; een tekenaar kiest. Dat zit niet in het materiaal en niet in de resolutie, maar in een laatste stap op de
   doelmaat, die er nog niet is.
4. **Het licht.** Ons licht valt van linksboven, en een wand die naar rechtsonder kijkt, is donker (zo staat het in
   `kern.cjs`). Het wiel vooraan op de wagen naar zuidwest kijkt precies die kant op: bij ons in de schaduw, bij ChatGPT
   in het volle licht. `omslag` (het licht loopt om) maakt dat vlak leesbaar; of het spel een ander licht wil, is een
   keuze voor het hele spel.

## Wat er gebouwd is (alles optioneel; de oude renderer pixel voor pixel gelijk en even snel)

- **`kern.cjs`:** `tekenModel` met `o.fijn`, de interne resolutie: echt fijner gerasterd (de stralen en de normaal op de
  fijnere maat), niet vergroot. En `afwerken`, voor een materiaal met een textuur en `mat.afwerking`: reliëf (de normaal
  gebogen met de hoogte van het materiaal, gemeten in de rusthouding, dus ook het reliëf zit vast), holtes (een nauwe
  naad wordt donker, uit de afstandsfunctie), randen (een bolle rand vangt licht en is lichter versleten, uit de
  kromming van de afstandsfunctie), warm licht en koele schaduw, en glans die erbij komt (zodat donker ijzer echt
  blinkt). Alles in eenheden van de wereld, dus gelijk op elke resolutie.
- **`textuur.cjs`:** `contrast`, `reliëf` (een hoogtekaart uit de helderheid van de AI-textuur, `hoogteVan`), de
  mip-keuze naar de interne resolutie, en versiering langs de afwikkeling (`metVersiering`: klinknagels die meedraaien,
  met een zachte rand van een halve pixel zodat ze niet flikkeren). Een gesloten afwikkeling om een dunne stok wordt nu
  gespiegeld in plaats van dat er een hele textuur in geperst wordt (dat gaf op de spaken 74 texels per eenheid, en ruis;
  een fout uit de vorige proef, nu weg).
- **`onderdelen.cjs`**, herbruikbare geometrie: `ringStuk` (een velgstuk, een band, een hoepel om een ton), `balk` (taps,
  afgeschuind: een spaak, een dissel, een rong), `nagel` en `nagelKring` (één deel voor een hele kring nagels).
- **`stijlmaat.cjs`:** contrast, licht, schaduw, warmte, verzadiging, kleuren en drukte van een sprite, om naast een
  voorbeeld te leggen.
- **De texturen** (SDXL in ComfyUI, `textuur-ai.cjs`): `hout-versleten`, `hout-grof` en `ijzer-gesmeed`. Het gesmeed
  ijzer is goed (hamervlakken, roest); beide houtsoorten hebben een fijne nerf, zoals een foto: op spelmaat valt die weg.
  Pas met een lage dichtheid (één texel per eenheid) en drie keer het contrast wordt hij zichtbaar.
- **Gelijk en snel:** `gelijk.cjs` na elke wijziging aan de renderer: alle 65 beelden pixel voor pixel gelijk. Onderweg
  bleek de vorige proef de renderer twee keer zo traag te hebben gemaakt (een eigenschap `uv` op de onderdelen; nu
  ernaast, in een WeakMap); hersteld en gemeten tegen de stand van vóór de proef (zie onderaan).

## Experiment 1: drie varianten, en een ladder

- **A:** het wiel van de ossenkar zoals het is.
- **B:** dezelfde geometrie, met AI-hout en -ijzer, contrast, reliëf, holtes en randen, warm licht met `omslag`, glans
  op het ijzer, en klinknagels als versiering op de band.
- **C:** de materialen van B op een nieuw wiel uit `onderdelen.cjs`: een stevigere band (1,7 in plaats van 1,1 dik, naar
  binnen) met zestien nagels aan elke kant, een velg in vier stukken met een naad en een ijzeren plaatje met twee nagels
  over elke naad, taps toelopende afgeschuinde spaken, en een gelaagde naaf (een houten ton, twee ijzeren banden, een kap
  met zes nagels, de moer). Buitenmaat, dikte, plek en as gelijk: gemeten over alle beelden is de verste pixel in elke
  variant 25,96 van de as (de band is 25,93), en langs de as van −4,63 tot 4,03, precies als A.

**De ladder** (`0-ladder-ZW.png`, `0-ladder-NW.png`): van A naar C, bij elke trede één verandering, op 1×, 2× en 4×.
Wat elke trede doet, op het oog en in de stijlmaten:

| Trede | Wat het doet |
|---|---|
| 1. AI-textuur van de vorige proef | Het hout wordt egaal en grijzig; weinig winst. |
| 2. Grove nerf en contrast | De grootste stap van het materiaal: warm hout met nerf, ijzer met structuur. |
| 3. Reliëf | Klein: zichtbaar op het gesmeed ijzer (op 2× en 4×), nauwelijks op het hout. |
| 4. Holtes en randen | Subtiel: donkerder naden aan de naaf, lichtere randen. |
| 5. Warm licht, omslag, glans | Groot: het vlak in de schaduw wordt leesbaar, het ijzer blinkt, warm tegen koel. |
| 6. Nagels als versiering (= B) | Onzichtbaar: de zijkant van de oude band is 1,1 eenheid, één pixel. Een versiering kan alleen waar de geometrie een vlak heeft. |
| 7. C-geometrie met de oude materialen | Op 1× niets, op 2× en 4× de naaf en het beslag. |
| 8. C (geometrie + B) | Op 2× het meest "af": een gelaagde naaf, beslag, nagels. Op 1× wordt de naaf een blauw kruisje ruis. |
| 9. Binnenlijnen en 24 kleuren | Iets vlakker en rustiger, meer pixel art; de binnenlijnen doen bij een wiel weinig. |
| 10. Forser, zoals ChatGPT | Duidelijk beter leesbaar op elke resolutie: forse spaken, een brede velg en band. |

**Stijlmaten** naar zuidwest (`stijlmaat.cjs`; het doel is het wiel vooraan op de ChatGPT-wagen, verkleind tot dezelfde
hoogte, zonder de rode bak erachter):

| | Contrast | Licht | Schaduw | Warmte | Verzadiging | Drukte | Kleuren |
|---|---|---|---|---|---|---|---|
| A 2× | 94 | 116 | 22 | 23 | 0,46 | 0,23 | 11 |
| B 2× | 135 | 156 | 21 | 59 | 0,51 | 0,58 | 62 |
| C 2× | 127 | 148 | 21 | 57 | 0,47 | 0,62 | 63 |
| **doel 2×** | **132** | **147** | **16** | **45** | **0,55** | **0,58** | (AI: 3914) |
| B 1× | 119 | 140 | 21 | 56 | 0,49 | 0,77 | 56 |
| doel 1× | 115 | 140 | 25 | 39 | 0,51 | 0,67 | |

A is te dof, te koel en te vlak; B en C zitten er in alles dichtbij (iets te warm). Dat de getallen kloppen terwijl het
beeld nog anders oogt, zegt dat wat er nog mist niet in de toon zit maar in de vorm en het handschrift (punt 2 en 3
hierboven). Drukte: op 1× zijn B en C drukker dan het doel (0,77 tegen 0,67): de nerf op één pixel per eenheid is net te
fijn. Op 2× is het gelijk.

## Experiment 2: de interne resolutie

**Native** (`1-native.png`): 1× is het wiel zoals het nu in het spel staat, 48×58 pixels voor het hele beeld (het wiel
zelf 42×52); 2× 96×116; 4× 192×232. De geometrie, het materiaal, de camera, het licht en de stand zijn gelijk; alleen het
raster is fijner.

**Spelmaat.** Het spel tekent een spritepixel nu als **2×2 schermpixels** op een scherm van 1920×1080 (`js/main.js`,
`zoomVenster`), en als 4×4 op 4K. Een HD-sprite van 2× kan dus op dezelfde fysieke grootte, op halve zoom getekend,
zonder dat er iets verloren gaat. Op `2-spelmaat-1080p.png` is alles even groot op het scherm:

- **1× (nu):** het materiaal van B en C geeft al meer diepte en warmte dan A, maar alles kleiner dan een pixel wordt ruis.
- **2× en 4× verkleind tot 1×:** *naast* (nearest neighbour, de pixel in het midden van elk blok) geeft gebroken spaken
  en ruis: een slechte methode, die de fijnere render slechter laat lijken dan 1×. *Gefilterd* (het gemiddelde van elk
  blok in lineair licht, dan het palet, en de omlijning opnieuw op de doelmaat) geeft een rustiger, iets zachter wiel dan
  1× native: een kleine winst, voor wie de maat van nu houdt.
- **2× als HD-sprite (×1 getekend):** duidelijk scherper. De naaf, het beslag, de nerf en de glans op het ijzer worden
  leesbaar. **Dit is de stap.**
- **4× verkleind tot 2×:** gefilterd zachter dan 2× native, naast korrelig; geen winst boven 2× native.

Op 4K (`2-spelmaat-4k.png`) is 4× native de grens van wat het scherm kan tonen. Daar is het iets fijner dan 2×, maar het
verschil is klein naast het verschil tussen 1× en 2×, en het kost vier keer zoveel.

**Kosten** (gemeten met zes renders tegelijk op zestien kernen, dus per kern):

| | 1× | 2× | 4× |
|---|---|---|---|
| A, ms per beeld | 59 | 209 | 611 |
| B, ms per beeld | 225 | 489 | 1182 |
| C, ms per beeld | 483 | 1312 | 3010 |
| Een beeld (RGBA, ongecomprimeerd) | 48×58, 11 KB | 96×116, 45 KB | 192×232, 178 KB |
| 64 beelden (8 richtingen × 8 standen) | 0,7 MB | 2,9 MB | 11,4 MB |
| idem als PNG | 0,2 MB | 0,45 MB | 1,1 MB |

De rendertijd groeit met 2× zo'n twee tot drie keer (niet vier: een deel van het werk hangt niet aan het aantal pixels),
het geheugen op de videokaart vier keer, de PNG's zo'n twee keer. Ter vergelijking: `beelden/` is nu 70 MB en `tegels/`
305 MB. Met alles op 2× wordt dat ruwweg 150 en 700 MB op schijf, en vier keer zoveel videogeheugen voor wat er op het
scherm staat. Met 4× zestien keer: niet te doen voor een spel met acht richtingen en veel beelden per figuur.

## Experiment 3: consistentie in beweging

Acht richtingen (`3-richtingen-1x.png`, `3-richtingen-2x.png`) en negen standen (de acht van het lopen en een volle
slag); bewegend in `4-draaien-ZW.png` en `4-draaien-Z.png` (APNG: open ze in een browser), met per rij A, B en C en per
kolom 1×, 2× en 4×, even groot.

Gemeten op de zijvlakken, waar een plek op het wiel bij het draaien hetzelfde licht houdt: per plek op het wiel (op een
halve pixel van die resolutie, los van de renderer uitgerekend) het verschil van de kleur over de standen, gedeeld door
de spreiding van alle kleuren. 0 is vast, rond 1 is los. Twee maten: op de kleur van het oppervlak zelf (**schuiven**:
beweegt de textuur over het oppervlak?) en op het eindbeeld (**flikkeren**: verandert een vaste plek op het wiel, ook
door het licht, dat bij reliëf en schaduw van de spaken legitiem meedraait?). Gewogen naar het aantal meetpunten (naar Z
en N staat het wiel op zijn kant).

| | 1× | 2× | 4× |
|---|---|---|---|
| Schuiven, B (de kleur van het oppervlak zelf) | 0,12 | 0,07 | 0,04 |
| Schuiven, C | 0,11 | 0,06 | 0,03 |
| Flikkeren, A (zonder textuur; zijn procedurele hout staat in de ruimte van de kar en schuift) | 0,22 | 0,18 | 0,22 |
| Flikkeren, B (het eindbeeld) | 0,19 | 0,14 | 0,11 |
| Flikkeren, C | 0,18 | 0,14 | 0,12 |
| Volle slag gelijk aan stand 0 | 100% | 100% | 100% |

(Een eerdere versie van deze meting gebruikte een vast vakje van een halve eenheid; op 4× vielen daar vier pixels in, en
dan leek een fijnere render minder vast, ook voor de textuur van de vorige proef. Nu is het vakje een halve pixel.)

1. **De nerf draait met de spaken mee** (schuiven 0,03 tot 0,12, dus 88 tot 97% vast; de ruitjes van de vorige proef
   lieten het al met het oog zien). Wat overblijft, is het monsteren van een nerf die bijna zo fijn is als een pixel: het
   wordt kleiner met de resolutie.
2. **De nagels en het beslag blijven op hun plek** (ze zijn geometrie of versiering langs de afwikkeling); maar **wat
   kleiner is dan twee pixels, wordt ruis die per stand anders valt**: op 1× is de naaf van C een donkere vlek met een
   lichtblauwe streep die elke stand een andere vorm heeft; op 2× een vaste ring met bouten. (De gemiddelde meting ziet
   dat nauwelijks: het zijn weinig pixels.) Regel: geen detail kleiner dan twee pixels op de doelmaat.
3. **Niets schuift** (zie 1); A schuift wel, omdat het procedurele hout in de ruimte van de kar staat.
4. **Geen naden:** rondom een geheel aantal herhalingen, en op een dunne spaak gespiegeld.
5. **Flikkeren:** de kleur van een vaste plek verandert iets meer dan de textuur alleen, door het licht op het reliëf en
   de schaduw van de spaken die meedraait; dat is beweging, geen ruis. Wel verandert er per beeld meer dan bij A
   (verspringen 33 tot 42 tegen 6 tot 10): een wiel met nerf en glans is levendiger. Op 1× oogt dat korrelig, op 2× als
   een draaiend wiel.
6. **Volle slag:** in elke variant, op elke resolutie en uit elke richting is de volle slag pixel voor pixel het beginbeeld
   (100%).

## Experiment 4: tegen de ChatGPT-sprite

| Criterium | A | B (2×) | C (2×) | C forser, binnenlijnen (2×) | Wat er nog mist |
|---|---|---|---|---|---|
| Materiaalrijkdom | vlak | hout en ijzer overtuigend | idem | idem | een geschilderde nerf; de foto-nerf is fijn |
| Diepte | matig | goed | goed, gelaagde naaf | goed | — |
| Licht | dof, koel | warm, glans | warm, glans | warm, glans | lichte randlijnen van één pixel; het licht op het vlak vooraan |
| Pixelartstijl | schoon, grof | gerenderd, zacht | gerenderd | dichterbij | een donkere lijn om elk onderdeel, minder tinten, geen losse pixels |
| Leesbaarheid op spelmaat | goed op 1× | op 1× druk, op 2× goed | op 1× ruis, op 2× goed | het best | forse verhoudingen op alles |
| Consistentie | schuift | vast | vast (vanaf 2× ook de nagels) | vast | — |
| Geometrie | — | gelijk | buitenmaat gelijk | buitenmaat gelijk | — |
| Prestaties | 59 ms | 0,5 s | 1,3 s | 1,3 s | goed genoeg voor productie op 2× |

## Advies: de beste combinatie

1. **Resolutie: 2×, als HD-sprite.** Render op `fijn: 2` en teken de sprite in het spel op halve schaal: op 1080p even
   groot als nu, met vier keer zoveel pixels. Niet 4× (alleen op 4K zichtbaar, en vier keer duurder dan 2×). Nooit
   verkleinen met nearest neighbour; wie een kleinere maat nodig heeft (ver uitgezoomd), verkleint gefilterd.
2. **Materialen: B**, met een textuur die voor pixelmaat gemaakt is: brede strepen in plaats van een foto-nerf, of een
   lage dichtheid met veel contrast zoals nu; warm licht en koele schaduw, `omslag` rond 0,8, glans op metaal, holtes en
   randen. Reliëf alleen op metaal (op hout doet het weinig).
3. **Geometrie: C, maar forser.** Maak modellen met de verhoudingen van pixel art (onderdelen anderhalf keer zo fors als
   in het echt), en geen details kleiner dan twee pixels op de doelmaat. `onderdelen.cjs` geeft de bouwstenen.
4. **Pixelverwerking:** 24 tot 32 kleuren per ding, binnenlijnen tussen onderdelen (`omlijn`, `naad`), en, de volgende
   proef, een stap op de doelmaat die doet wat een tekenaar doet: een lichte lijn langs elke rand die naar het licht
   staat, een donkere lijn om elk onderdeel, losse pixels weg, en een paar tinten per materiaal.

## Wat dit betekent voor de rest

- **Gebouwen:** de grootste winst van AI-texturen (planken, pleister, riet, dakpannen: grote vlakken). Ze staan stil,
  dus weinig beelden; maar de huizen renderen nu al uren, en 2× kost twee à drie keer zoveel tijd.
- **Dieren en personages:** veel beelden (acht richtingen, elke beweging), dus daar weegt 2× het zwaarst in geheugen. Een
  textuur op een lijf zit vast via de rusthouding (`houding.cjs`, `TX.beweeg`). Gezichten en handen hebben 2× nodig om
  meer te zijn dan een paar pixels.
- **Voertuigen:** als het wiel: draaiende delen in rust bouwen en draaien, dan zit alles vast.
- **Het spel:** het moet een sprite op halve schaal kunnen tekenen (de cel en het anker maal twee), en de kaart van 2×
  sprites past vier keer minder in het videogeheugen: meten in Firefox, ook na een paar speeldagen (CLAUDE.md).

## Het oude bleef gelijk en even snel

- `gelijk.cjs vergelijk` na de laatste wijziging aan `kern.cjs`: alle 65 beelden pixel voor pixel gelijk aan de nulmeting.
- De snelheid van de gewone renders tegen een losse kopie van 82d8d4cc (vóór de wielproef): de ossenkar 1797 ms per beeld
  (toen 1755), de heer 601 (toen 596): gelijk, binnen de ruis.
- De vorige proef (`wielproef.cjs`) opnieuw, met de spiegeling op dunne spaken: nieuw 1,05 (was 1,21), glijdend 3,08,
  oud 4,41, zonder mip-niveaus 3,76; de conclusies blijven gelijk (`wielproef-evaluatie.md`).
