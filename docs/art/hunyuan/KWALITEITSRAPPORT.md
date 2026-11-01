# Kwaliteitsrapport: Hunyuan3D op de speerman

31 okt 2026. Alle platen in `docs/art/bewijs/hunyuan/`. Begin bij `hy-vergelijking.png`, `hy-diagonalen.png` en `F-in-het-spel.png`. Cijfers in `kwaliteit-invoer.json` en `kwaliteit-diagonaal.json`. Beoordeel de platen zelf: de maten helpen, maar ze zeggen weinig over artistieke kwaliteit.

## De uitkomst

- **Inmiddels ingehaald:** TripoSplat op de plaat met alle kanten is op spelmaat beter (`TRIPOSPLAT.md`). Dit rapport beschrijft de Hunyuan-route, die als terugval blijft staan.
- **De vorige hypothese klopt niet helemaal.** "Hunyuan vlak" was geen betere reconstructie, maar dezelfde mesh met een camera die de fout verbergt (`AUDIT.md`, vraag 5).
- **De bronplaat is veruit de grootste factor.** Dezelfde keten op de plaat van Marcel van 31 okt geeft een figuur die rondom klopt, ook in de vier richtingen die niet in de invoer zaten. Correcties die eerst nodig waren, vervielen.
- **De echte rig en het textuurmodel werken.** De armen zijn los van het lijf, de rok los van de benen, en het textuurmodel verft wat de plaat niet zag. Hij staat en loopt in het spel (`rig-staan-lopen.png`, `rig-lopen-klei-verf.mp4`, `F-in-het-spel.png`).
- **Het resultaat is niet gelijk aan de plaat, en nog geen productie-asset.** Op de voor- en achterkant komt het dichtbij. Op 80 pixels zijn de mouwen korreliger dan de plaat en V4. Op 30 graden verdwijnt het gezicht deels onder de helm. Marcel heeft de laatste stand nog niet beoordeeld.

## De drie grootste oorzaken van kwaliteitsverlies

### 1. De bron: de plaat spreekt zichzelf tegen, en kijkt van boven

Het model plakt de aanzichten tot één vorm, en leest ze als vlak aanzicht. Tegenspraak wordt modder, en een hoek wordt een kegel in de mesh.

| Plaat | Camera | Omtrek past: Z, W, N, O | Zolen hellen | Richtingen eens over dezelfde plek |
|---|---|---|---|---|
| `detail` | 20° | 0,86, 0,73, 0,75, 0,79 | 25,3° | Niet gemeten op de eindstand |
| `acht` | 21° | 0,85, 0,78, 0,73, 0,65 | 13,5° | 0,66 |
| `vrij` (31 okt) | Zo'n 10° | **0,94, 0,79, 0,93, 0,89** | 3,3° | **0,74** |

### 2. Geen verf: de rijkdom van de plaat is geschilderd

Klei is de vorm alleen. Metaal, leer, quilt en gezicht zitten op de plaat in de verf en in het geschilderde licht. Proef B en C laten zien dat echt licht op die kleur het doffer maakt en dat een ander licht dat niet oplost. Dat bevestigt `methodeproef.md`.

### 3. De verf lag niet op de vorm

Marcel zag het: "Lijkt nog niet helemaal goed te passen. De skin op het model". Drie oorzaken, alle drie aangepakt:

- De plaat lag er met alleen een schaal en verschuiving op. Nu is er per richting een zachte vervorming, eerst op de omtrek, dan op de randen binnen de figuur (`hy_kleur.passend`). Op deze plaat is die vervorming klein: 95 procent van de punten schuift minder dan 5 tot 10 plaatpixels.
- De richtingen werden gemengd: blauw en geel gaven paars. Nu kiest een punt één richting, en stemmen de richtingen over het kleurvlak.
- De verf werd op een grove mesh gezet, met punten die verder uit elkaar lagen dan de pixels van de plaat. Nu direct op de fijne mesh.

## De proeven

| Proef | Wat veranderde | Uitkomst | Plaat |
|---|---|---|---|
| **A, geometrie** | De bron | De nieuwe plaat is de beste: losse armen en benen, vlakke zolen, kap en gesp leesbaar. Overlap op 10°: V4 0,717, nieuwe plaat ruw 0,882. Scherpe harde vormen blijven wel zwakker dan in V4 | `proef-A-vorm.png` |
| **B, materiaal** | Materiaal op dezelfde mesh | Verf met weinig echt licht wint ruim. Volledig echt licht: dof, en staal spiegelt | `proef-B-materiaal.png` |
| **C, licht** | Licht op ontlichte verf | Licht van voren en zachter is iets beter dan het spellicht, maar geen ervan komt bij de plaat. Dit is niet de hefboom | `proef-C-licht.png` |
| **D, resolutie** | 768, 1536, 3072 px, op spelmaat | Verschil met 3072 op 80 pixels: 1536 is 0,4 en 768 is 1,2 tot 1,3 op een schaal van 255. Niet zichtbaar genoeg om voor te betalen: 768 volstaat | `proef-D-resolutie.json` |
| **E, detail** | Een methode per keer | Zie hieronder | `proef-E-detail.png` |
| **F, richtingen** | Acht richtingen | Dezelfde man in alle acht. Overlap in de vier die niet in de invoer zaten: V4 0,685, eindkeuze 0,786 | `hy-diagonalen.png`, `acht-richtingen/` |

### Proef E en de extra detailronde

| Methode | Uitkomst | Besluit |
|---|---|---|
| Geometrie: relief uit de plaat, tot 2,1 mm (`detailpass`) | Duidelijk in klei. Op alleen geschilderde verf nauwelijks te zien: die heeft geen schaduw van de vorm | Aan, samen met echt licht |
| Bump | Niet apart getest: dezelfde informatie als de relief | Uit |
| Normal map | Gebakken in de lichte GLB. Daar komt de vorm mee terug, maar de export is verder niet goed (zie UV) | Open |
| Ruwheid en metaal per kleurvlak | Alleen zichtbaar onder veel echt licht, en daar niet mooier | Blijft in het model, weinig effect |
| Contactschaduw | Klein maar goed: plooien en onder de helm | Aan |
| Verf scherper | Lijnen komen terug bij 10° | Aan voor de grote render, uit voor het vel |
| 30% echt licht | **Het grootste effect**: quilt, riem en staal komen los, en de kleur blijft | Aan |
| Harde onderdelen | Op de oude platen nodig: helm en speer. Op de nieuwe plaat is de helm uit de mesh goed genoeg, en alleen de speer is los | Alleen de speer |
| AI op de textuur | Niet opnieuw getest. `methodeproef.md` liet zien dat het gezicht daarmee ouder en strenger wordt. De verf uit de plaat maakt het voorlopig overbodig | Uit |

**Belangrijk voor "overtuigend in game":** de detailronde helpt groot, maar werkt op 80 pixels als ruis. Daarom zijn er nu twee versies: `v_eind` voor groot, en `v_spel` voor de vellen, met rustiger verf en vorm en minder nabewerking.

### De maximale mesh

Zie `AUDIT.md`, vraag 6. De grens is het RAM, niet de VRAM. 8192 latents geven een scherper gezicht, kap, tas en vingers, maar ook kraters op vlakke stof. Octree 512 voegt daarna weinig vorm toe en kost 24 minuten en al het RAM. Meer stappen (40) gaven niets. Op spelmaat is het verschil niet aangetoond.

## De routes

Gescoord op de platen en metingen hierboven. "Goed" en "slecht" zijn mijn oordeel.

| | 1. Mesh plus materiaal | 2. Plus bewerking van de mesh | 3. Hybride, harde delen los | 4. Betere bron |
|---|---|---|---|---|
| Wat | Ruwe mesh, verf uit de plaat | Kraters, relief, en op een schuine plaat de kegel en de zolen | Speer, en op een zwakke plaat ook de helm | Eén pose, vlak, los, groot |
| Visuele kwaliteit | Goed als de bron goed is | Klein extra | Speer nodig. Helm alleen bij een zwakke bron | **De grootste winst** |
| Consistentie van het karakter | Volgt de bron | Gelijk | Gelijk | **Lost het op** |
| Automatisering | Hoog | Hoog: alles uit een configuratie | Middel: de maten per wapen | Hoog, als de plaat goed is |
| Handwerk | Vak per richting | Geen | Plek en maat van het wapen | Plaat beoordelen |
| Hardware | 6 tot 24 minuten | Seconden | Seconden | Geen |
| Rig en animatie | Fusie is het probleem | Geen verschil | **Beter**: hard deel volgt één bot | **Beter**: armen en benen los |
| Herbruikbaar voor andere figuren | Ja | Ja | Wapens wel, helmen per type | Ja |
| Onderhoud | Klein | Klein | Klein | Klein |

**Keuze op bewijs:** route 4 als basis, route 1 voor de verf, van route 2 alleen wat de plaat nog nodig heeft, en van route 3 alleen de wapens.

## Per onderdeel

Referentie is de plaat van 31 okt. Beoordeeld op `hy-vergelijking.png` en `hy-diagonalen.png`.

| Onderdeel | Vorige beste, vlak | V4 | Nu | Blijft achter |
|---|---|---|---|---|
| **Helm** | Rand hangt, geen band | Schoon, maar eigen ontwerp | Kroon met kam en band, rand met dikte; klinknagels in de verf | Bij de rand wat grof; onderkant is geschat |
| **Gezicht** | Anoniem | Eigen, leesbaar gezicht | De identiteit van de plaat in de verf | **Op 30° deels onder de helm.** Vorm is zacht, ogen alleen in de verf |
| **Tabberd** | Geen kleur | Eigen vorm, stijf | Vlakken kloppen, split en zoom in de vorm | Kleine vlekken aan de zijkant. De plaat is hier in tweeën, niet gekwartierd (Marcels nieuwe keuze, of nog vragen) |
| **Mouwen** | Glad | Te dun geweest | Quilt scherp in verf en reliëf, vol en taps | **Op 80 pixels korrelig** |
| **Riem en tassen** | Vorm | Vorm | Vorm en verf vallen samen | Rechtertas in de zijkant rommelig |
| **Handen** | Klomp | Duidelijk | Handschoen met duim en vingers als klomp | Vingers niet los. Pakken de speer niet echt |
| **Benen en laarzen** | Scheef | Blokkig | Zolen vlak, omslag met punten, quilt op de schoen | Hier en daar hobbelig |
| **Speer** | Ingekeept | Schoon | Los onderdeel, één schacht, koker, bladvorm | **Vlakker dan de rest**, want geen verf van de plaat, en in ZO staat hij voor het lijf |

## De metingen

| Maat | Plaat | V4 (klei) | Ruw (nieuwe plaat) | Eindkeuze |
|---|---|---|---|---|
| Omtrek, 4 richtingen uit de invoer | | 0,717 | 0,882 | 0,856 |
| Omtrek, 4 andere richtingen | | 0,685 | | 0,786 |
| Breedte romp / hoogte | 0,403 | 0,532 | 0,387 | 0,384 |
| Spreiding hoogte over de richtingen | 0,7% | 1,7% | 0,7% | 2,7% |
| Detail bij 341 px (rand per pixel) | 14,05 | 5,52 | 6,32 | 13,73 |
| Detail bij 80 px | 21,19 | 12,6 | 13,7 | 20,11 |

V4 en "ruw" zijn klei, dus hun detailcijfer is niet vergelijkbaar met verf. Het eindcijfer is lager op de omtrek dan ruw, omdat de hoogte met speer en de detailpass meetellen.

Kleur op de vlakken, richting Z, plaat tegen eindkeuze (`kwaliteit-invoer.json`):

| | Aandeel plaat | Aandeel eind | Lab plaat | Lab eind |
|---|---|---|---|---|
| Blauw | 14,6% | 12,8% | 37, 27, -65 | 38, 24, -60 |
| Geel | 14,5% | 19,6% | 74, 20, 75 | 68, 18, 65 |
| Bruin | 56,3% | 49,9% | 31, 24, 31 | 33, 22, 27 |
| Staal | 14,7% | 17,7% | 29, 4, 1 | 30, 4, 2 |

**De tabberd:** beide kleuren zijn herkenbaar. Geel is in deze richting te ruim en blauw te krap: verhouding blauw tot geel 1,19 op de plaat, 0,68 in het eind. Ook heeft het geel meer losse stukjes (178 tegen 75). Daar past de verf nog niet.

**De mesh:** 488.086 punten, 998.376 vlakken, 20 stukken, 29.528 randen niet dicht. Niet dicht en met losse kruimels: voor sprites geen probleem, voor animatie en realtime wel.

**De UV:** niet bruikbaar. 13% dekking, 12.942 eilanden, rek 0,76 tot 1,11. In de lichte GLB is de speer een zwart streepje, en de verf krijgt dubbel licht. Een nieuwe topologie is nodig als we ooit een echte textuur willen. **De sprites hebben dit niet nodig.**

**De rig** (`hy_rig.py`, `rig.json`, `rig-staan-lopen.png`, `rig-lopen-klei-verf.mp4`): de 26 botten van V4 op gewrichten die op de mesh gemeten zijn.

- **Benen, lijf en rok** volgen de beweging van V4 (`hy_v4_pose.py`). **De armen niet:** de rotaties van V4 zetten op deze mesh de handen op de buik (Marcel: "gaat nog niet helemaal goed"). De rechterhand staat nu met twee botten op de speer op borsthoogte, en de linkerarm hangt met een zwaai tegen de benen in, zoals op `aardschok-speerman-acht.png`.
- **De rok is los van de benen, op vorm:** een gladde zoomlijn rondom, en de vlakken die rok aan been vastmaken zijn weg (1504). De eerste poging op kleur gaf repen.
- **De arm is los van het lijf, op vorm:** in elke horizontale doorsnede is de plooi tussen arm en lijf te zien, waar de doorsnede het smalst is (2531 vlakken weg). De snede is aan beide kanten dichtgeritst (2457 vlakken). De mesh is daar niet twee-op-een (29.000 randen met meer dan twee vlakken), dus dichtmaken langs lussen van randen werkte niet.
- **Rek:** 1 procent van de randen rekt in de loop meer dan 1,34 keer. Dat was 1,9 op de proefrig en 5,3 op de eerste versie van deze rig.
- **Nog over:** de rok beweegt mee als geheel, zonder stofsimulatie. De linkerhand beweegt niet los. De speer gaat door de hand, zonder gesloten vingers. Alleen staan en lopen: geen aanval, geraakt worden of sterven.

**Het textuurmodel** (`hy_paint.py`, `paint.json`, `textuur-vergelijking.png`, `paint-zes-aanzichten.png`): Hunyuan3D-2 paint en delight van Tencent, 9,51 GB, op de officiële code. Hun rasterizer vraagt een compiler; die is vervangen door eigen normaal- en plekkaarten op hun camera, en de verf gaat per punt terug op onze mesh. Gemeten op de 1080 Ti: 12 s licht eraf, 122 s verven, piek 9,33 GB VRAM. Vergelijking op dezelfde houdingen:

| | Sterk | Zwak |
|---|---|---|
| Alleen de plaat | Stikwerk, staal, helm, de tweedeling voor en achter | Zij en binnenkant arm zijn opgevuld: vlekken zodra de arm weggaat |
| Alleen het textuurmodel | Rondom schoon en eenduidig, en het gezicht leest goed | Helm zwart, stikwerk weg, rug helemaal blauw (de plaat is half geel), zachter en minder rijk |
| **Plaat + textuurmodel op wat de plaat niet zag (gekozen)** | Rijkdom van de plaat, zij en binnenkant arm schoon | Lichte spikkels op de zij, en de zij is zachter dan de voorkant |

Twee dingen maakten het verschil. Het model verft **met de armen wijd** (`rig_open.npz`), anders ziet ook hij de zij niet en wordt die bruin. En de wapenrok volgt één regel, **rechts blauw en links geel**, omdat Z en N op elke plaat dat zeggen en de zijaanzichten elkaar tegenspreken. Dat is een ontwerpkeuze van mij, voor Marcel om te controleren. De kleuren zijn per vlak op de plaat gezet met de verhouding van de medianen. 63.800 van de 486.380 punten zag geen enkel aanzicht; die krijgen de kleur van het dichtste punt dat wel gezien is.

**Handmatig per figuur:** drie dingen. De vakken op de plaat (op een plaat met alfa kan dat automatisch), de maat van het wapen, en het oordeel van Marcel. De plek van de speerhand in `hy_rig.py` (`SPEERHAND`, `ELLEBOOG_R`) en de kleurregel van de rok gelden voor deze figuur.

## In het spel

Getest in Chromium, alleen in de browser en zonder wijziging aan het spel: staan op zoom 1 en 2, lopen in vier richtingen op zoom 2, zonder consolefouten (`F-in-het-spel.png`, `hy-spelmaat-vellen.png`). De vellen: staan 4 beelden, lopen 12, 128 renders in 417 s; de pas is die van V4 (`pas_meter` 0,2327).

- **Goed:** de figuur staat in de wereld en past naast de dorpelingen. Metaal en de twee kleuren lezen op zoom 1. De houding met de speer klopt met de referentie, en de loop leest als lopen.
- **Minder:** V4 leest schoner, want die heeft grote, rustige vlakken. Hier zijn de mouwen korreliger, en de zijaanzichten drukker dan de plaat op dezelfde maat. Het gezicht is op 30 graden minder zichtbaar dan in V4.
- **Niet beoordeeld:** of de voet in de loop glijdt. Dat vraagt kijken in beweging, en een schermafdruk toont het niet. De film is van een gewone render, niet uit het spel.
- **Niet getest:** Firefox, beeldtijd, nacht.

## De resterende problemen, op volgorde

1. Het gezicht op 30 graden: helm verder achterover, of de verf van het gezicht uit het textuurmodel, want daar leest het beter.
2. De korrel op 80 pixels: de quilt is op die maat te fijn. Een rustiger verf voor de mouwen, of de plaat groter en schoner aanleveren.
3. De speer: vlakker dan de rest, en de hand sluit er niet omheen.
4. De rok beweegt als geheel en heeft geen stof.
5. De andere bewegingen ontbreken: aanval, geraakt worden, sterven.
6. Mesh niet dicht en niet overal twee-op-een, en geen bruikbare UV. De sprites hebben dat niet nodig.

## De GLB van Marcel (31 okt, avond)

Marcel stuurde een losse GLB (`upload-vergelijking.png`: boven zijn vorm, onder onze speerman, zelfde camera en lengte zonder speer). Herkomst onbekend; de maker in het bestand is trimesh. 125.918 punten, 251.892 driehoeken, één stuk, geen open randen, geen verf en geen skelet. Voor de proef geverfd met hetzelfde textuurmodel, verder niet bewerkt.

- **Beter dan onze mesh:** gesloten en glad, zonder kraters, de hand zit echt om de speer, en de speer zit eraan vast. De rok is rustig, en op spelmaat leest hij schoon.
- **Slechter:** het is niet de man van de plaat. Geen gedrongen bouw, een kleinere en plattere helm, een kraag in plaats van een kap, en het reliëf zit op de rok in plaats van als ruiten op de mouwen. De verf van alleen het textuurmodel maakt de helm donker en de rug helemaal blauw. Er zit een gat in het speerblad.
- **Niet getest:** de rig. `hy_rig.py` is gemeten op de bouw en de kleuren van onze mesh, en de speer zit hier aan de hand vast, dus die moet eerst los.

## Wat is niet gedaan

Geen aanval, geraakt worden en sterven, geen tweede figuur, geen film uit het spel. Productieassets, V4 en D8 zijn niet aangeraakt, en er is niets gecommit.
