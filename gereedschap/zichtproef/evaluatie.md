# De zichtproef: gebouwen plat, zoals Stronghold (17 okt 2026)

Vraag 176, stap 1 (`ontwerp/beeld.md`, "Zicht in een dicht dorp"). Gespeeld op `main` op `9f7f19a3`, met in de werkmap
de nog niet gecommitte wijzigingen van de sessie die aan 174c werkt (`js/gl.js`, `js/tekenen.js`, `js/hoogte.js`: het
tekenen op hellingen; dit land is vlak). Opnieuw maken: `node gereedschap/zichtproef/plat.cjs` (de platte tekeningen,
zo'n vijf minuten), dan `node gereedschap/zichtproef/zichtproef.cjs` (de proef, zo'n vier minuten). Het spel en de kunst
zijn niet veranderd; alles van de proef staat in deze map.

## Wat de proef doet

- **Het spel tekent alles zelf**, zoals de cameraproef: headless, het lege begin, een vaste reeks toeval, zoom 1 (ware
  pixels), 10 uur 's ochtends, dezelfde camera voor alle vier.
- **Het dorp** (`dorp.cjs`): een extreem dichte straat van twee tegels breed, met aan elke kant een rij huizen zonder
  ruimte ertussen, de deuren naar de straat, en één steeg naar het zuiden. Elf gebouwen in de stijl van planken (twee
  hutten en een huis aan elke kant, twee stenen huizen, een woontoren en een stenen toren, de herberg), zes bomen, zes
  inwoners: in de straat, naast de deur van de woontoren, in de steeg, achter een hut, op een achterplaats, en één op
  het pleintje als controle.
- **De platte tekening** (`plat.cjs`, uit de huizenbouwer zelf, niet samengedrukt): het huis zonder dak, gesneden zoals
  de bouwfasen het doen (de muren als schil). De muren aan de kant van de camera (zuid en oost op het scherm) staan tot
  de heup (44 eenheden, onder de ramen), die aan de achterkant vlak boven de grond (8), als een doorsnede. De vloer en
  een randje op de muren hebben de kleur van het eigen dak: pannen oranje, leien grijs, spanen bruin. Dezelfde maat en
  hetzelfde anker als de echte tekening, dus het huis verspringt niet.
- **Hoe plat in het spel komt:** het spel laadt elke tekening van een huis uit een eigen bestand; de proef geeft het
  voor een plat gebouw het platte plaatje (`page.route`). Volgorde en schaduwen doet het spel zelf.
- **Vier weergaven:** A gewoon; B alles plat; C1 alleen plat wat het zicht neemt op de inwoner in de straat; C2 alleen
  plat wat het zicht neemt op het gebouw dat in A het slechtst te zien is (de hut aan de noordkant, 4%). Wie het zicht
  neemt, zegt de meting van A (welk gebouw de pixels van het gekozene afdekt) samen met de plattegrond (wie ervoor staat).
- **Meten** zoals de cameraproef: het dorp zonder schaduwen nog eens getekend, met en zonder elk ding.
- **Uit:** `zicht_A.png`, `zicht_B.png`, `zicht_C1.png`, `zicht_C2.png` (2045×1613, dezelfde uitsnede),
  `zicht_vergelijking.png` (de vier in een raster, met de getallen erboven), `zichtbaarheid.json` (alle metingen), en
  `plat/` (de elf platte tekeningen, en `naast-elkaar.png`: elk huis echt en plat). De stippellijn om de inwoner in de
  straat is een aantekening van de proef, niet van het spel. De zwarte hoeken bovenaan zijn land buiten het proefstuk.

## Zichtbaarheid

| | A gewoon | B plat | C1 inwoner | C2 gebouw |
|---|---:|---:|---:|---:|
| inwoners goed te zien (minstens de helft) | **1 van 6** | **6 van 6** | 3 van 6 | 4 van 6 |
| inwoners, gemiddeld te zien | 17% | 99% | 55% | 67% |
| de gekozen inwoner (in de straat) | 0% | 100% | **100%** | 100% |
| de gekozen hut (aan de noordkant) | 4% | 100% | 4% | **100%** |
| gebouwen, gemiddeld te zien | 56% | 95% | 62% | 75% |
| deuren te zien (de tegel ervoor minstens half vrij) | 1 van 11 | 10 van 11 | 1 van 11 | 5 van 11 |
| de straat en de steeg, vrij | 8% | **83%** | 20% | 55% |
| tegels van de straat helemaal weg (van 104) | 94 | 12 | 80 | 41 |
| hoeveel gebouwen plat | 0 | 11 | 1 | 4 |

- **A:** de straat is zo goed als weg (8% vrij). Vijf van de zes inwoners zijn helemaal weg; alleen die op het pleintje
  is te zien. Het stenen huis aan de zuidkant (717 pixels hoog) dekt vier van hen helemaal af, en de stenen toren de
  vijfde. De hut aan de noordkant is voor 4% te zien, de tweede hut ook. Van de elf deuren is er één te zien.
- **B:** elke inwoner en elk gebouw is te zien, ook in de straat en achter de huizen (de inwoner in de steeg voor 95%,
  de rest helemaal). Van de straat is 83% vrij; wat er nog afligt, is vooral de rand langs de lage muren en de drempels.
  Tien deuren zijn te zien; de elfde (het huis aan de zuidkant, 49%) ook, maar zijn drempel ligt op de tegel ervoor en
  telt in de meting als afgedekt (net als bij de herberg, de hut en de toren aan de zuidkant, 52 tot 64%).
- **C1:** één gebouw plat (het stenen huis aan de zuidkant), en de gekozen inwoner is helemaal te zien, met een stuk
  straat om hem heen (20% vrij in plaats van 8%). De rest van de straat blijft zoals in A.
- **C2:** om de hut helemaal te zien, moeten er vier plat: de woontoren, de herberg, en de twee huizen aan de zuidkant
  ertegenover. In een dichte straat is wat voor een gebouw staat al gauw de halve straat.
- **Een eerste ronde** met alle muren tot de heup (geen doorsnede) liet 56% van de straat vrij, met 41 tegels helemaal
  weg en de deuren aan de straat nog afgedekt: een lage muur van 44 eenheden dekt de rij tegels erachter nog af. Daarom
  de doorsnede: de achterste muren laag.

**Tegenover draaien** (de cameraproef van vandaag): daar was de inwoner in een smalle straat in alle vier de standen
weg, en lag van de weg per stand hooguit een derde vrij. Plat (B) laat hier alle inwoners zien en 83% van de straat, in
de gewone stand. **Plat lost op wat draaien niet oplost**; draaien hoeft niet voor het zicht.

## Beeld

- **Herkenbaar:** elk gebouw houdt zijn voet (een L blijft een L), zijn muur (planken, veldsteen, baksteen), zijn deur
  aan de voorkant (aan de achterkant alleen de drempel), en de kleur van zijn dak. Je ziet welk huis welk is als je van A
  naar B gaat: het oranje van de pannen blijft oranje.
- **De vloer:** een effen vlak in de kleur van het dak, met een zacht dambord. Op pannen en leien valt dat weg, op
  spanen leest het als een tegelvloer. In het echt zou de vloer een eigen patroon moeten krijgen (planken, of rijen
  zoals een dak).
- **Laag:** de schaduwen worden vanzelf kort (het spel maakt ze uit het silhouet van het plaatje). Niets verspringt: het
  anker is dat van het huis.
- **Wat het niet heeft:** geen ramen, geen schoorsteen, geen versiering. Dat hoort zo bij een functionele weergave,
  maar het is een ander beeld: B is een plattegrond om te spelen, niet om naar te kijken.
- In de uitsneden van 900×600 geen fout in de volgorde gezien: inwoners staan voor en achter de lage muren zoals het
  hoort, de bomen ook.

## Wat de proef niet toetst

- **Alleen de huizen van de huizenbouwer.** De 29 werkplaatsen (`dorp.cjs`, `dorp2.cjs`), de bouwfasen, de ruïnes, de
  bruggen en het erf hebben geen platte tekening. De werkplaatsen kunnen het op dezelfde manier als hun bouwfasen
  (`bouwfasen.cjs` snijdt hun vormen al op een hoogte), maar dat is een eigen stuk werk. Gebouwen uit delen (de kapel, de
  zagerij) kan `plat.cjs` nog niet.
- **In het spel zelf**, als het een weergave wordt:
  - de muis: een gebouw kiest hij aan de hoogte van zijn plaatje (`voorwerpHoogte` in `js/main.js`); plat moet die van
    het platte plaatje zijn, anders pak je het gebouw als je op wie erachter staat klikt;
  - wat het spel over een huis heen tekent (de ramen 's nachts, de sneeuw op het dak, de rook uit de schoorsteen) moet
    plat uit;
  - elk voorwerp onthoudt zijn plaatje (`js/sprites.js`): omschakelen moet dat vergeten;
  - de doorkijk (`js/doorkijk.js`) is plat niet nodig; voor C kan hij zeggen wie plat moet (hij weet al wie wie bedekt);
  - de toets: Stronghold gebruikt de spatie, maar die brengt je hier naar het laatste bericht (`js/main.js`).
- **Niet getoetst:** de nacht, de winter, ver uitgezoomd, heuvels, de mist, en hoe het voelt om om te schakelen.
- **Wat het kost:** een platte tekening rendert in 7 tot 61 seconden (één draad); het spel heeft zo'n 600 tekeningen van
  huizen (de oude delen hun vorm met de jonge), dus alle huizen samen ruwweg een uur in acht draden. Elk plaatje is
  klein en laadt pas als je plat kijkt.

## Advies

**De aanpak werkt: plat (B) maakt het zicht goed, waar draaien dat niet deed.** In de dichtste straat die we kunnen
bouwen, gaat het zicht van 1 naar 6 inwoners, van 8% naar 83% van de straat, en van 1 naar 10 deuren, zonder de camera te
draaien en met de kunst van het spel.

1. **B als weergave die je aan en uit zet** is de kern: goedkoop te renderen, en het spel hoeft er alleen een ander
   plaatje voor te kiezen, met dezelfde plek en dezelfde volgorde. Dat is iets nieuws, dus jouw keuze.
2. **C is een goede aanvulling voor wie je kiest**, niet in plaats van B. Voor een inwoner is één gebouw plat genoeg en
   blijft de rest van het dorp mooi; voor een gebouw in een dichte straat gaat al snel de halve straat plat. C kan
   meeliften op de doorkijk, die al weet wie wie bedekt; een kort overgangetje is nodig, anders klappert het.
3. **Draaien** blijft wat de cameraproef zei: een extra, later. Voor het zicht is het niet meer nodig.

Te kiezen, als je verder wilt (stap 4 van de volgorde):

- **De muren:** de doorsnede van deze proef (voor tot de heup, achter laag), of alles laag (alleen de voet, minder
  herkenbaar, maar nog platter).
- **De vloer:** in de kleur van het dak (zoals hier, je herkent het huis van A naar B), of planken en aarde (eerlijker,
  maar dan lijken alle huizen op elkaar).
- **De toets:** een andere toets dan de spatie, of de spatie wordt plat en het laatste bericht krijgt een andere.
- **Aan en uit, of vasthouden:** een schakelaar zoals Stronghold, of plat zolang je een toets vasthoudt (en vanzelf bij
  het bouwen, punt 5 van de opdracht).
