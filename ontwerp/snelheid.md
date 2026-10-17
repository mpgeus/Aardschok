# Sneller tekenen: wat we nog kunnen doen (vraag 178)

Marcel, 17 okt: "Maar de perfomance moet echt wel veel beter", en eerder die dag: "spelers haken af als dat niet op
orde is" (CLAUDE.md, "Hoe we kiezen"). Dit is het onderzoek van 17 okt: wat er al is, waar de tijd nu zit, en welke
technieken we nog hebben, elk met wat het oplevert, wat het kost en of je het ziet. Het plan en de keuzes staan in de
werklijst bij P; hoe iets gebouwd is, in `code.md` bij het bestand.

## Voor wie we meten

- **Steam is Chromium.** De Steam-versie draait in Electron (`verpakken.md`), en Electron is Chromium, dezelfde motor
  als Chrome en Edge. Wat Chromium meet, is wat een speler op Steam krijgt; Firefox telt voor een versie in de browser
  (een demo op itch.io), en daar is het per opdracht aan de kaart duurder (`code.md` bij `js/gl.js`).
- **Iedereen heeft een videokaart** (Marcel, 17 okt; `code.md` bij `js/gl.js`), maar niet iedereen deze: de pc van
  Marcel heeft een GTX 1080 Ti en een Ryzen 7 5800X, en een Steam Deck of een laptop met een kaart in de processor
  is flink trager (hoeveel, is nog niet gemeten). **Het doel:** helemaal uitgezoomd op deze pc 8 ms tekenen of minder, zodat er op een
  zwakke machine nog ruimte is voor 60 beelden per seconde (16,7 ms voor alles).
- **Meten:** `npm run tekenmeting -- 1920x1080@1 --videokaart` (`gereedschap.md`), en om en om tegen de stand ervoor
  in één browser, want losse metingen lopen hier uiteen van 20 tot 52 ms door wat er naast draait (`opmerkingen.md`).

## Wat er al is

Elk plaatje gaat in een rij van hoeken naar de kaart, tot acht texturen in één opdracht (zo'n 30 opdrachten per beeld);
kleine plaatjes staan samen op grote bladen; de grond is een buffer per stuk die alleen opnieuw gaat waar iets
veranderde; een boom onthoudt welk plaatje hij heeft (`v.getekend`, `js/sprites.js`); de wind zijn vijf voorgebakken
standen voor de hele wereld; het licht een kaart op de halve maat; het grijs van de mist een getal per hoek; en een tegel
op een heuvel gaat niet meer over het kladdoek (vraag 174, c). Het doek telt in hele pixels (`floor(devicePixelRatio)`).

## Waar de tijd nu zit

Het proefdorp op eiland 5, vlak, helemaal uitgezoomd (0,35), 1920×1080, Chromium met de videokaart (17 okt; Firefox
24,8 ms, Chromium 16 à 24): bijna alles is rekenwerk van het spel per ding, niet het werk van de kaart.

| | aantal per beeld |
| --- | --- |
| in het vak dat het spel langsloopt (een rechthoek in tegels om het schuine beeld) | 14.564 |
| daarvan buiten beeld | 4.815 |
| in beeld, in het zwart (nooit getekend) | 6.710 |
| in beeld, in het grijs (bijna alle bomen; daar loopt niemand) | 2.492 |
| in beeld, in zicht | 547 |

Alle 14.564 krijgen het werk voor de tekenlijst (`T.isZichtbaar`, `isGebakken`, de diepte, een item, de doorkijk), en pas
`mistOverLijst` gooit het zwart eruit; 79% is zo werk voor niets. Van een profiel (de verhoudingen; met de profiler
loopt alles anderhalf keer trager): de lijst tekenen 40% (`tekenVoorwerp`, met `isPlat`, `onthoudVoorwerp` en de rij),
de schaduwen 22% (`tekenZonneschaduw` loopt de lijst nog eens langs), de lijst opbouwen 20%, de mist over de lijst 11%,
de doorkijk 8%, sorteren 6%.

## De technieken

Per techniek: wat het is, wat het hier oplevert (een schatting op het profiel), wat het kost, en of je het ziet.

### A. Minder werk op de processor (je ziet niets anders)

- **A1, wegstrepen vóór de lijst.** Per tegel eerst: in beeld (zoals de grond met `binnen` al doet, `tegelsVoorStuk`)
  en niet in het zwart, en pas dan het werk. Van 14.564 naar zo'n 3.000. Winst: de lijst opbouwen, de mist en de
  doorkijk grotendeels, zo'n 30% van het tekenen. Klein werk in `js/tekenen.js`; pas op dat de doorkijk en
  `heuvelsErvoor` hetzelfde blijven zien.
- **A2, het vaste werk eens.** Wat voor een boom niet verandert (het plaatje, plat, gebakken, de kamer, de diepte),
  onthouden bij het voorwerp, zoals `v.getekend` al voor het plaatje doet, met een versie die het opnieuw laat doen.
  Winst: een deel van `tekenVoorwerp` en de schaduwen, 10 à 20%. Middel; het risico is een onthouden waarde die niet
  opnieuw gaat als hij moet (een gekapte boom, het seizoen).
- **A1 en A2 zijn af** (17 okt; Marcel: "Ja, begin met A1 en A2, en meet daarna"; `code.md` bij `js/tekenen.js` en
  `js/wereld.js`): wat in het zwart staat of met zijn schaduw buiten beeld valt, gaat niet meer in de lijst; van een
  stuk land alleen het deel in het vak (`T.voorwerpenIn`); en `isPlat` en de plek op het scherm staan op het voorwerp.
  In beeld precies dezelfde plaatjes, op dezelfde plek (nagekeken per plaatje, oud tegen nieuw, vlak en met heuvels,
  dichtbij en ver, middag, ochtend en avond); alleen waar een boom buiten de rijen van een gebouw over zijn dak valt,
  kan de volgorde anders zijn, zoals eerst ook al bij het schuiven. Om en om gemeten, oud tegen nieuw (ms per beeld,
  Chromium met de videokaart, 1920×1080):

  | | vlak, oud | vlak, nieuw | heuvels, oud | heuvels, nieuw |
  | --- | --- | --- | --- | --- |
  | dichtbij | 16 | 12,4 | 10,6 | 9,1 |
  | 0,5 | 28,7 | 18,7 | 28,5 | 16,4 |
  | 0,35 | 30,2 | 19,3 | 29,9 | 19,2 |
  | 0,35, avond | 20,6 | 13,3 | 27,2 | 14,5 |

  Ver uitgezoomd 35 à 47% minder (de tijden zelf schommelen met wat er naast draait). In het profiel ging het rekenwerk
  van het tekenen ver uitgezoomd van 34 naar 13 ms; wat blijft, is vooral elke boom tekenen, twee keer (de schaduw en het
  plaatje), en dat is wat B oplost.
- **A3, geen nieuwe dingen per beeld.** Nu krijgt elk ding elk beeld een nieuw item met een functie erin, en een punt
  `{ x, y }`; 3.000 tot 14.000 per beeld. Hergebruiken (of getallen in vaste lijsten) scheelt opruimwerk van de browser
  en de post "(program)" in het profiel. Winst onzeker, 5 à 10%. Middel.
- **A4, één keer sorteren.** Wat stilstaat (bomen, rotsen, huizen), staat per stuk land eens op volgorde; per beeld
  alleen de paar dingen die bewegen erin voegen (samenvoegen in plaats van 3.000 dingen sorteren). Winst: het sorteren,
  zo'n 6%. Middel; gebouwen hebben hun eigen regel voor de volgorde (`tekenVolgorde`).

### B. De videokaart meer laten doen (je ziet niets anders)

- **B1, een dieptebuffer.** De bomen en de begroeiing hebben alleen helemaal doorzichtige en helemaal dichte pixels
  (gemeten 17 okt: `tegels/bomen.png` en `begroeiing.png`, geen enkele pixel ertussen). Dan kan de kaart zelf bepalen
  wat ervoor staat: elk plaatje krijgt zijn diepte mee, en een doorzichtige pixel schrijft niets. Sorteren hoeft dan
  niet meer voor wat hard is; wat zacht is (schaduwen, het grijs, de gloed, rook, de doorkijk), komt erna in een eigen
  laag. Winst: het sorteren en de volgorde-regels, en het opent B2. Groot werk in `js/gl.js`; eerst meten of de huizen
  ook hard zijn (alleen de bomen en de begroeiing zijn gemeten), en let op de doorkijk.
- **B2, vaste buffers per stuk land.** Met B1: de hoeken van alle bomen van een stuk één keer naar de kaart, en per
  beeld één opdracht per stuk in beeld, in plaats van elke boom elk beeld opnieuw. De wind gaat mee als een getal per
  hoek (de stand), of buigt de kruin in de shader met de ene windwaarde van de wereld. Winst: de bomen kosten de
  processor bijna niets meer; ver uitgezoomd naar schatting van zo'n 25 naar onder de 8 ms. Het grootste
  werk van allemaal, en de echte oplossing voor een eiland vol bos.
- **B3, de schaduwen op de kaart.** Dezelfde buffer nog eens, met een shader die het silhouet scheef legt naar de zon
  (een getal voor de hele wereld), in plaats van een tweede rondgang over de lijst. Winst: de 22% van de schaduwen.
  Past bij B2; los kan het ook, met de rij van nu.
- **B4, het grijs per pixel.** De mistlaag ligt er al (`tekenMist`); de shader kan daaruit lezen of een pixel grijs is,
  in plaats van per ding te beslissen (`mistOverLijst`). Winst: de mist over de lijst, 11%. Middel; met B2 nodig, want
  dan beslist niemand per ding meer.
- **B5, WebGL 2.** Een stapel texturen in één (geen grens van acht), meer exemplaren van één plaatje in één opdracht
  (instancing: één punt per boom in plaats van vier hoeken), en betere buffers. Electron, Chrome, Edge en Firefox
  kunnen het al jaren, de Steam Deck ook. Winst vooral samen met B2. Een overstap in `js/gl.js`.

### C. Vooraf tekenen (je ziet een verschil; een keuze voor Marcel)

- **C1, het bos in het grijs in de grond bakken.** De 2.500 bomen in het grijs in de grondbuffer, met hun schaduw.
  Winst: ver uitgezoomd het meeste van de lijst en de schaduwen. Te zien: wat grijs is, wuift niet, en bij het kappen
  of als het grijs verschuift moet een stuk opnieuw (een hapering, `opmerkingen.md`). Met B2 is het niet meer nodig.
- **C2, ver uitgezoomd minder.** Onder zoom 0,5 geen zonneschaduw per boom, geen kleine begroeiing (varens), of geen
  wind. Klein werk, direct winst (de schaduwen alleen al 22%), maar je ziet het.
- **C3, de wereld op een lagere maat.** De wereld tekenen op de helft of driekwart van de pixels en scherp opschalen
  (pixel art verdraagt dat), als instelling onder *Display*. Helpt vooral de kaart op 4K en op zwakke machines, niet
  de processor. Klein werk.
- **C4, een stuk als één plaatje.** Ver uitgezoomd een heel stuk (grond en bos) als één plaatje, alleen wat beweegt en
  wat in zicht is los erop. Dezelfde winst als C1 en ook in zicht, maar wie tussen de bomen loopt, staat dan bovenop
  het bos. Met B2 niet nodig.

### D. Rondom het tekenen

- **D1, haperingen.** Het traagste beeld (50 ms met heuvels in Firefox) komt van werk dat in één beeld valt: een nieuw
  stuk land (45 ms; werklijst, "Op tocht bekijken"), een nieuw blad naar de kaart, de grond van een nieuw stuk. Verdelen
  over beelden, of in een worker maken.
- **D2, de wereld in een worker.** De regels kosten nu zo'n 1 ms per beeld, dus nu weinig winst; bij live samen spelen
  en meer dorpen wel. Later.
- **D3, meten waar het telt.** Een vaste meetreeks per stap (de tekenmeting), en ook in de Steam-versie zelf
  (`npm run proefversie -- --windows`) en op een zwakke machine.

## Voorstel van Claude

Eerst **A1 en A2** (snel, je ziet niets, samen zo'n 40%), dan meten. Daarna niet C1 (je ziet het, en het is een
lapmiddel), maar **B1 tot B4** als één stuk werk: de dieptebuffer en vaste buffers per stuk, met de schaduwen en het
grijs op de kaart. Dat is groter, maar het maakt het bos goedkoop, ook op een eiland van 2500 bij 2500. **C3** kan ernaast
als instelling voor zwakke machines. A3 en A4 alleen als de meting na A1 en A2 erom vraagt, want B maakt ze grotendeels
overbodig.
