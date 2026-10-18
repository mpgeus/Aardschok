# Sneller: het tekenen en de tik (vraag 178)

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

- **B1 en B2 zijn gebouwd** (18 okt; Marcel: "dan bouwen we nu b1 en b2", en "Misschien zoveel mogelijk offloaden naar
  gpu"; `code.md` bij `js/tekenen.js` en `js/gl.js`): de bomen en het groen per stuk land in een vaste rij op de kaart,
  met de wind, de mist en de schaduw in de shader, en de volgorde uit een dieptebuffer; wat in de lijst blijft, toetst
  ertegen. Om en om gemeten tegen B5 (ms per beeld, de processor zonder wachten, Chromium met de videokaart, 1920×1080):

  | | vlak, oud | vlak, nieuw | heuvels, oud | heuvels, nieuw | na 2 dagen, oud | na 2 dagen, nieuw |
  | --- | --- | --- | --- | --- | --- | --- |
  | dichtbij | 1,5 | 0,8 | 3,1 | 2,0 | 1,2 | 0,5 |
  | 0,5 | 4,6 | 1,6 | 5,9 | 2,7 | 4,4 | 1,5 |
  | 0,35 | 6,8 | 2,1 | 7,6 | 2,8 | 6,6 | 1,9 |
  | 0,35, avond | 6,2 | 1,7 | 6,9 | 2,3 | 6,3 | 1,8 |

  Met de kaart erbij (een pixel teruggelezen) op 35% 9,5 naar 5,1 ms. Hetzelfde beeld, op de gelijke gevallen bij 50%
  na (`code.md`). Wat er op 35% nog per beeld is (2 ms): de mensen en de gebouwen in de lijst (0,5), de regen (0,3), het
  masker van de mist (0,2) en de vaste rijen zelf (0,15). Een boom kappen tekent zijn stuk opnieuw (dat beeld 7,5 ms,
  in B5 10 ms, want de grond gaat er ook opnieuw); een ander seizoen of ver verderop kijken kost één beeld van 120 ms,
  net als eerst (de grond en de standen in de wind; D1). Niet in Firefox gemeten.
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
  kunnen het al jaren, de Steam Deck ook. Een overstap in `js/gl.js`. **Gebouwd op 18 okt, met B3 en E1** (`code.md`
  bij `js/gl.js`): in het spel overdag ver uitgezoomd een kwart minder voor de processor (11,0 naar 8,3 ms op 35%,
  vlak; met heuvels 11,7 naar 9,4), 's avonds gelijk, en hetzelfde beeld; de rest van de tijd zit in `js/tekenen.js` per
  ding, en daar gaat B1 en B2 over. **Gemeten in de renderproef** (17 okt, E):
  met instanties, een textuurstapel en de schaduwen in de shader (B3), en verder de lijst zoals nu, ver uitgezoomd 3,5
  naar 1,3 ms per beeld; met vaste rijen en een dieptebuffer erbij (B1 en B2) 0,6 ms. WebGPU met dezelfde techniek is
  niet sneller (E).

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

### E. Een andere tekenaar: PixiJS v8, WebGL2 en WebGPU (de renderproef, 17 okt)

Marcel vroeg of PixiJS v8 beter is dan `js/gl.js`, en daarna "kijk of er winst te behalen is in webgl 2 en webGPU". De
proef (`gereedschap/pixiproef/`, met de uitslag in `evaluatie.md`) tekent hetzelfde dorp met allemaal: 150 gebouwen,
4600 bomen, 300 inwoners, schaduwen, rook en een lichtfilter, op 100, 50 en 35%, met hetzelfde beeld. **Het advies:
`js/gl.js` houden en naar WebGL2 verbouwen; niet naar Pixi, niet naar WebGPU.** Op 35%, in doorvoer (processor en kaart
tegelijk): `js/gl.js` 3,5 ms, Pixi 1,8 (op WebGPU 2,1), een eigen tekenaar op WebGL2 met de lijst zoals nu 1,3, en met
vaste rijen en een dieptebuffer 0,6 (de processor 0,1). Op WebGPU precies dezelfde tekenaar: binnen 10%, dus de winst
zit in de techniek (B5, B3, dan B1 en B2), niet in de API; en WebGPU staat op Linux met een AMD-kaart (de Steam Deck)
niet standaard aan. Pixi is alleen sneller met een boom van sprites die meeleeft met `S`, dus een herschrijving van
`js/tekenen.js`; als tekenaar die elk beeld een lijst krijgt, zoals nu, is hij trager, en op een volle machine ook. De
dieptebuffer mag: alle kunst heeft alleen helemaal dichte of doorzichtige pixels. Wat we verder overnemen: **E1**, `drawImage`
zonder afval (geen lijst per aanroep, de textuur bij het plaatje onthouden; nu loopt het geheugen tussen twee keer
opruimen op tot 117 MB tegen 44 bij Pixi, en het opruimen geeft uitschieters van 17 ms); **E2**, bladen die groeien in
plaats van meteen 64 MB (hier 60 MB minder op de kaart); en twee keuzes die je ziet, eerst met een proefplaat: **E3**,
mipmaps ver uitgezoomd (rustiger, zachter), en **E4**, op 50% afronden op hele schermpixels. Zonder bouwstap werkt Pixi
wel (een gewoon script van 840 KB), en vanaf `file://` in Chromium kunnen beide niet met de videokaart (`js/gl.js`
valt dan terug op het 2D-doek, Pixi alleen met eigen code op zijn `CanvasRenderer`).

## Voorstel van Claude

Eerst **A1 en A2** (snel, je ziet niets, samen zo'n 40%), dan meten. Daarna niet C1 (je ziet het, en het is een
lapmiddel), maar B: eerst **B5 met B3 en E1** (`js/gl.js` naar WebGL2 met instanties en een textuurstapel, de schaduwen
uit dezelfde rij; `js/tekenen.js` blijft, in de proef 2,8 keer zo snel), en dan **B1 en B2** (renderproef, E). Eerst gedacht:
**B1 tot B4** als één stuk werk: de dieptebuffer en vaste buffers per stuk, met de schaduwen en het
grijs op de kaart. Dat is groter, maar het maakt het bos goedkoop, ook op een eiland van 2500 bij 2500. **C3** kan ernaast
als instelling voor zwakke machines. A3 en A4 alleen als de meting na A1 en A2 erom vraagt, want B maakt ze grotendeels
overbodig.

**Na B1 en B2** (18 okt): op 35% was de processor nog 2 ms per beeld, en het bos kost hem bijna niets meer. **De regen
en het masker van de mist** gaan sinds 18 okt ook naar de kaart (Marcel: "Regen en mist doen maar"; `code.md` bij
`js/gl.js`): de regen in één keer in plaats van een fillRect per druppel (waar hij valt, blijft het beeld uitrekenen, want
in de shader is de klok na een uur spelen te grof), en het masker van de mist maakt de kaart zelf uit wat je kent en wie
er kijkt. Om en om: op 35% overdag 2,1 naar 1,7 ms voor de processor, met de kaart erbij 5,0 naar 4,4; hetzelfde beeld,
pixel voor pixel. Wat nog overblijft, is vooral de lijst (de gebouwen, de bomen bij de huizen, de mensen: 0,6 ms). WebGPU
helpt daar niet (Marcel vroeg het, 18 okt): wat `js/gl.js` per beeld aan de kaart vraagt, kost nog 0,1 ms; de rest is ons
eigen JavaScript, en de renderproef gaf met dezelfde techniek op WebGPU binnen 10% (E). Pas bij duizenden mensen tegelijk
(grote veldslagen) zou dat anders kunnen, en dan eerst de mensen als instanties op WebGL2, zoals nu de bomen. Wat verder
kan: **D1** (de haperingen: een ander seizoen of ver verderop kijken kost één beeld van 120 ms, vooral de grond), en
**E4** (afronden op 50%, met een proefplaat), waarmee ook de gelijke gevallen tussen twee texels vastliggen. B4 (het grijs
per pixel) is niet meer nodig: de vaste rijen krijgen de mist per tegel, zoals de lijst.

### Het advies van buiten (18 okt)

Marcel bracht een advies voor een spel met blokken (zoals Minecraft) op WebGL2: "Kunnen we hier wat mee?" Per punt:

- **Hardware instancing, een vaste vorm met per blok één getal van 32 bits** (x 6, z 6, y 8 en de textuur 10 bits): er
  al sinds B5 en B1/B2 (elk plaatje één instantie; de bomen en het groen per stuk land in een vaste rij op de kaart).
  Inpakken in 32 bits scheelt hier weinig: een vaste rij gaat één keer per stuk naar de kaart (8 getallen per boom), en
  wat per beeld gaat, zijn een paar honderd figuren.
- **De plek op het scherm in de shader**: de vaste rijen al (de wind, de mist, de schaduw, de diepte); de lijst die
  overblijft (mensen, gebouwen) rekent zijn hoeken nog in JavaScript, 0,6 ms per beeld.
- **Geen afval per beeld**: E1 voor het tekenen. In de tik gemeten (Node, proefdorp, drie dagen op 30×): 159 keer
  opruimen, samen 119 ms (zo'n 7% van de tik), het langste 3,7 ms, nooit boven 5 ms. Nu geen bron van haperingen.
- **Een textuurstapel (TEXTURE_2D_ARRAY) in plaats van een atlas**: er al sinds B5; zonder mipmaps (pixel art), dus geen
  randen die overlopen.
- **Web Workers voor het land**: F6 (bij "De tik"): `file://` weigert een worker uit een bestand, en lockstep vraagt dat
  wat meteen nodig is synchroon kan; na F1 is elke stap onder 3 ms. Later, eerst voor een nieuw eiland.
- **Wegstrepen** (hun vraag): wat in beeld en niet in het zwart staat, gaat in de lijst (A1); de vaste rijen per stuk
  in beeld; wat ervoor staat, zegt de dieptebuffer (B1).

**Wat het wel oplevert: het principe voor de grond.** De grond is het laatste wat de processor nog bakt: in stukken van
512 bij 512 pixels op het 2D-doek, op de maat van de zoom (`werkGrondBij`, `grondSleutel` in `js/tekenen.js`), en die
gaan als plaatje naar de kaart. Bij elke stap met het wiel (de zoom van het venster, 0,5, 0,35: de maat van de buffer
verandert), een ander seizoen, sneeuw of een beek die droogvalt, gaat alle grond in beeld in één beeld opnieuw: de 120 ms
van D1 (de stap met het wiel is niet gemeten). Met het advies: per stuk land een vaste rij met één getal per tegel (x en
y in het stuk, 6 bits elk; de tekening op de stapel; een paar vlaggen), de hoogte per hoekpunt uit een textuur in de
vertex shader (nu knipt de processor een tegel op een helling in driehoeken), en het licht en de mist zoals de vaste
rijen. Dan zijn de zoom en het seizoen een getal voor de shader, en een gevelde boom een paar getallen
(`bufferSubData`): B2 voor de grond. De prijs is groot: de overgangen tussen de soorten grond, het zand van de paadjes
per hoekpunt, wat plat groeit (dat kan bij de vaste rijen), de droge beek, de sneeuw, de wanden op een helling en de
half doorzichtige rand aan de kust, en het zelfde beeld pixel voor pixel. **Voorstel van Claude:** eerst in de browser
meten hoe lang een stap met het wiel en een ander seizoen duren (de meter, het traagste beeld, op 0,35 bij het dorp);
is dat rond de 100 ms, dan een renderproef van de grond (zoals E), en dan kiezen.

**Gemeten (18 okt, op `main` bij `1346daab`):** in de browser van de Claude-app (Chromium 152, met de videokaart) op
Marcels pc, 1920 bij 1080 op 1,5 pixel per css-pixel, het proefdorp (eiland 2) bij het dorp. Gemeten is het traagste
beeld (de tijd tussen twee beelden, zoals de meter) en hoe lang `T.tekenBeeld` erover deed, telkens drie keer of meer.
Vlak:

| wat | traagste beeld | tekenen | waarvan naar de kaart |
| --- | --- | --- | --- |
| het wiel naar 0,35 | 83 tot 100 ms | 87 tot 99 ms | 42 ms: 15 stukken van 512 bij 512, 2,8 ms per stuk (`texImage2D`) |
| het wiel naar 0,5 | 50 tot 67 ms | 64 tot 75 ms | 29 ms: 20 stukken |
| het wiel naar de zoom van het venster | 17 ms | 7 ms | 6 stukken op schaal 1 |
| een ander seizoen (op 0,35) | 83 tot 100 ms | 93 tot 106 ms | 42 ms |
| de beek valt droog of komt terug | 83 ms | 88 tot 90 ms | |
| sneeuw op de grond, een stand van de 16 | 283 ms | 296 tot 299 ms | |
| schuiven over de kaart (op 0,35) | 17 ms | hooguit 8 ms | een stuk per keer |
| stil (op 0,35) | 17 ms | 1,5 ms | |

Met heuvels (de spelregel *Height* op *Hills*, die straks altijd aan staat: d bij L) is het drie keer zo veel: het wiel
naar 0,35 300 tot 335 ms, naar 0,5 117 tot 343, een ander seizoen 217 tot 302, en een stand sneeuw 333 tot 347 ms. Het
doorsturen blijft 42 ms; de rest is het knippen van een tegel op een helling in driehoeken en het licht erop. De sneeuw
verandert één keer per dag, om middernacht (`js/weer.js`: een sneeuwdag 0,35 erbij, elke winterdag 0,05 eraf), dus in de
winter hapert elke middernacht. Erbij gezien, niet de grond (D1): de eerste keer winter of sneeuw in een spel kost één
beeld van 400 tot 500 ms, want dan gaat het blad met die bomen naar de kaart (`bomen-winter.png` 11 MB,
`bomen-sneeuw.png` 14 MB). Let op bij het meten met de javascript van Claude in de browser: de eerste meting na elke
aanroep gaf een beeld van een seconde, ook zonder verandering; die telt niet.

**Wat dat zegt:** vlak is het rond de 100 ms, met heuvels en sneeuw 300; dus volgens het voorstel de renderproef van de
grond als vaste rijen. Die maakt het wiel, het seizoen, de sneeuw en de beek een getal voor de shader, en haalt ook het
knippen op een helling weg (de hoogte per hoekpunt in de vertex shader). Kleiner en zonder renderproef kan **spreiden**:
na een stap met het wiel of een ander seizoen blijft de oude grond, geschaald, staan, en komen de nieuwe stukken er een of
twee per beeld overheen, zoals nu al bij nieuw land. Dan geen beeld van 300 ms, maar een kwart seconde lang beelden van
zo'n 20 ms (met heuvels), met de grond even onscherp of in het oude seizoen; het werk zelf blijft even groot, wat op een
zwakke machine (de Steam Deck) telt.

**Spreiden** (Marcel, 18 okt: "Doe eerst het spreiden: de nieuwe stukken een of twee per beeld"; `code.md` bij
`js/tekenen.js`, "de grond ligt in stukken"; `werkStukkenBij`): per beeld een nieuw stuk, en een tweede als het
eerste minder dan 8 ms kostte; tot dan het oude beeld in de gaten. Nagekeken: als het af is, is het beeld pixel voor
pixel dat van alles in één keer (0 van de 2.073.600 pixels anders, bij het wiel van 2 naar 0,5, van 0,5 naar 0,35 en
terug naar 2, en de herfst). Gemeten met `Spel.debug.meetGrond()` (dat sinds het spreiden ook het traagste beeld geeft
tot de grond heel is) en dezelfde tekenlus, elk beeld tot de videokaart klaar is (`T.gl.wacht`), op het proefdorp op
1920 bij 1080. Het Claude-venster stond daarbij niet in beeld, wat alles trager maakt (alles in één keer met heuvels:
558 ms, eerder in beeld 300 tot 335); vergelijk dus binnen de tabel:

| wat | vlak, vroeger in één beeld | vlak, gespreid | heuvels, gespreid |
| --- | --- | --- | --- |
| het wiel naar 0,35 | 83 tot 100 ms | 8 beelden, hooguit 34 ms | 14 beelden, hooguit 90 ms (meest 40 à 75) |
| het wiel naar 0,5 | 50 tot 67 ms | 10 beelden, hooguit 35 ms | 10 beelden, hooguit 54 ms |
| een ander seizoen | 83 tot 100 ms | 8 beelden, hooguit 37 ms | 14 beelden, hooguit 66 à 77 ms |
| de beek | 83 ms | 8 beelden, hooguit 41 ms | |
| sneeuw erbij (0,3) | 283 ms | 11 beelden, hooguit 79 ms (meest 40 à 67) | 14 beelden, het eerste 195 ms, dan 30 à 95 |

Een gewoon beeld was in dezelfde meting 3 tot 11 ms. Wat het niet oplost: een stuk zelf. Met heuvels kost één stuk van
512 bij 512 al 40 à 90 ms (hier, niet in beeld), en een stuk met sneeuw ook vlak 40 à 80; dat is een beeld dat hapert,
alleen korter. Dat haalt alleen de renderproef weg (de grond als vaste rijen), of de sneeuw zelf goedkoper
(`tekenSneeuwOp`, `sneeuwRuis` per tegel). Wat je ziet (de schermafdrukken `uit/schermen/spreiden-*.png`): bij een ander
seizoen, sneeuw of de beek gaat het oude beeld stuk voor stuk weg; bij inzoomen ligt het oude beeld er geschaald onder;
bij uitzoomen ligt er aan de rand nog niets, en is de grond daar een paar beelden donker tot de stukken er zijn (eerst
die, dan het midden). Een eerste keer herfst of winter na het laden kost nog steeds een beeld van 440 à 510 ms: het blad
met de bomen (D1), niet de grond.

**Het plan voor de renderproef van de grond** (18 okt, Marcel: "we gaan verder"; hij koos **A**, en eerst stap 1 en 2:
"ver uitgezoomd mag anders zijn als het er even goed uitziet. Begin met stap 1 en 2 (vlak)"). Eerst twee
dingen die anders zijn dan hierboven staat (de kaart van de code door een zoekagent): een tegel op een helling wordt niet
in driehoeken geknipt, maar met één schuine stand per tegel getekend, het vlak door zijn vier hoeken, 1,04 groter tegen
naden (`tekenSchuineTegel`, `opTegelVlak`); alleen de wanden zijn driehoeken met een knip (`tekenWanden`). En de hoogte
is per tegel vier hoeken (een trede deelt een hoekpunt op twee hoogten, `rekenStuk` in `js/hoogte.js`), dus vier
getallen per tegel, geen textuur met één hoogte per hoekpunt.

Het idee: per stuk land van 64 bij 64 tegels, zoals de bomen (B1), een vaste rij met een instantie per tegel: welke
tekening (het nummer in het vel rand of kust, zoals nu op de processor gekozen, met de paadjes, de droge beek en de
hoeken al verrekend: `S.grondMetHoeken`), zijn plaats, en met heuvels zijn vier hoeken. De videokaart tekent ze in de
volgorde van nu (x+y, dan x), met menging, zodat de half doorzichtige kust klopt. Een stap met het wiel kost dan niets
meer, een ander seizoen alleen het platte groen opnieuw, en de sneeuw, de beek of een gevelde boom een paar getallen in
de rij (`bufferSubData`, nu nog nergens). Het 2D-pad blijft voor kleine stukjes (het kijkgat, `tekenTegelOpnieuw`,
`tekenVorig`) en voor zonder videokaart.

In stappen, elk naast de oude grond (aan en uit met een `Spel.debug`-schakelaar), met een meting en een vergelijking
met het beeld van nu (`gereedschap/schermen/tekenmeting.cjs --tegen`, pixel voor pixel, de verschillen in rood; de
scènes met sneeuw, seizoen en beek komen erbij):

1. **Vlak, dichtbij** (zoom vanaf 0,75): de grondtegels als vaste rij. Doel: pixel voor pixel hetzelfde.
2. **Vlak, ver uit** (0,5 en 0,35): dezelfde rij, meteen op de zoom. Meten: de tijd, en hoeveel pixels anders (zie de
   keuze hieronder), met de platen naast elkaar.
3. **Wat erop ligt:** het platte groen (een tweede rij, per seizoen), de sneeuw (een laag per tegel; de stand en de ruis
   rekent de processor, want `beeldLot` en `sneeuwRuis` rekenen in 64 bits), de droge beek (de tekening wisselt, de
   barstjes en steentjes als kleine plaatjes).
4. **Heuvels:** de vier hoeken per tegel en dezelfde schuine stand in de shader, het licht uit het vel van 65 bij 65 per
   stuk (bilineair, zoals nu), de wanden als driehoeken. De randen van de wanden worden niet pixel voor pixel hetzelfde
   (de knip op het doek is zacht).
5. **Meten** (`meetGrond`, de tekenmeting, Firefox door Marcel), en dan kiest Marcel: over, of niet.

Waar het moeilijk wordt: (a) met heuvels valt een hoge tegel over tegels van een stuk land erachter, en elk stuk is één
opdracht: de volgorde over de rand van een stuk (voorstel: een diepte per tegel voor wat dicht is, en de doorzichtige
kust in volgorde); (b) de vellen rand en kust zijn 2400 hoog, te hoog voor de stapel van 2048 (opknippen, of een eigen
textuur); (c) wat de processor blijft kiezen (de tekening per hoek, de ruis), gaat als getal in de rij.

**De keuze:** ver uitgezoomd (onder 0,75, `BAK_ZOOM`) bakt het spel de grond nu verkleind op een doek, met de pixels
van de tekening die het verkleinen overhoudt (op een halve pixel verschoven, `faseVan`), en zet dat één op één op het
scherm. De videokaart tekent elke tegel meteen op de zoom: voor het oog hetzelfde, maar niet elke pixel (een andere
pixel van de tekening blijft over). Pixel voor pixel kan alleen dichtbij. **A**: ver uit mag anders zijn, als het er even
goed uitziet (Marcel kijkt naar de platen naast elkaar en in het spel); **B**: ver uit blijft de gebakken grond (dan helpt
de proef alleen dichtbij, waar het al snel is). Voorstel van Claude: **A**, want daar zit de winst; en eerst stap 1 en 2
(vlak): die zeggen of het snel genoeg is en of het er goed uitziet, voor het grootste werk (de heuvels) begint.

**Stap 1 en 2 zijn gebouwd** (18 okt; `code.md` bij `js/tekenen.js`, "de grond op de kaart"; aan met
`Spel.debug.grondProef = 'nieuw'`, en `'oud'` was tot stap 3 de oude grond zonder de beek, het platte groen en de
sneeuw, om te vergelijken). Op het proefdorp, het hele beeld met de bomen, de schaduw en de mist erbij, na 30 beelden rust:

- **Dichtbij** (zoom 2, 1 en 0,75): 0 pixels anders. Stuk na stuk land, rij na rij, valt de volgorde op een vlakke
  kaart samen met die van de oude grond, want een tegel overlapt alleen zijn buren in dezelfde rij en kolom.
- **Ver uit**: 0,7% van het beeld anders op 0,5 en 0,5% op 0,35 (in het bos, waar weinig grond te zien is; op open
  land meer): losse pixels van de grond, waar een andere pixel van de tekening overblijft. De platen:
  `uit/schermen/grondproef-*.png`.
- **Een stap met het wiel** (elk beeld tot de videokaart klaar is, `T.gl.wacht`; het Claude-venster niet in beeld, dus
  trager dan echt): met de oude grond en het spreiden 6 tot 8 beelden van 18 tot 44 ms; met de grond op de kaart één
  beeld van 5 tot 11 ms, dan 3 ms. Een gewoon beeld is met de grond op de kaart 3 ms, met de oude 4 à 6.

Een les onderweg: een uniform hoort bij het programma dat in gebruik is (`gebruik`); met het programma van de grond als
laatste in de lus van `start` kregen de bomen hun tabel en hun mist niet, en lazen ze uit de verkeerde textuur (bomen in
blokken, die kwamen en gingen). Nu staat er `gebruik(vastProg)` vóór.

**Stap 3 is gebouwd** (18 okt; `code.md` bij `js/tekenen.js`, "de grond op de kaart"): de droge beek, het platte groen
en de sneeuw liggen nu ook op de kaart, in de volgorde van de oude grond: de sneeuw van een tegel meteen na zijn vloer,
dan de beek, dan het groen, na de vloer van alle stukken. De sneeuw is een getal voor de kaart: de processor rekent per
tegel de ruis (64 bits) en de kaart hoeveel er ligt, dus een andere stand sneeuw maakt niets opnieuw. Het groen van een
ander seizoen komt gespreid (`SPREID`, een of twee stukken per beeld: in één beeld kostte het 17 tot 50 ms voor de 9
stukken van het proefdorp); een droge beek maakt alleen de stukken om de beek opnieuw (tot dan alles: 34 tot 44 ms).
`'oud'` is weg: zonder `'nieuw'` is het de oude grond, met alles. Nagekeken in de browser van de Claude-app (Chromium,
GTX 1080 Ti), het tabblad op 1920 bij 1080 met 1 pixel per css-pixel en het paneel niet in beeld (dus trager dan
echt), op het proefdorp, op `main` na 6dd28f96 met deze stap. Oud tegen nieuw, na 30 beelden rust, met `S.tijd = 1000`
en `Spel.debug.beeld()`, bij de start, bij het midden van het dorp en bij de beek; in de zomer, de herfst, de winter met
sneeuw 0,3 en de beek droog, en met sneeuw 0,65:

- **Zoom 2 en 1**: 0 pixels anders, overal.
- **Zoom 0,75**: alleen gelijke gevallen. Op 0,75 valt het midden van elke derde rij en kolom schermpixels precies op
  de grens tussen twee pixels van de tekening; de kaart kiest dan altijd dezelfde kant (zoals bij de bomen en de
  gebouwen), de oude buffer door de afronding van zijn textuur nu eens de ene, dan de andere, en hoeveel hangt af van
  waar de camera staat: bij de start 1 tot 52 pixels, bij de beek 3.600 tot 16.000, bij het midden van het dorp 39.000
  tot 121.000 (6% van het beeld). Dat was in stap 1 en 2 al zo (daar alleen bij de start gemeten). Voor het oog
  hetzelfde; pixel voor pixel gelijk kan op 0,75 niet, want de oude buffer is het zelf niet van plek tot plek.
- **Ver uit**: in het bos 1,1 à 1,5% anders, bij het midden van het dorp 12 à 19%: op open grond is het gras ruis, en de
  sneeuw ook, en er blijft een andere pixel van over, net als bij de vloer in stap 2. De gemiddelde kleur van het beeld
  is tot op een tiende gelijk, met en zonder sneeuw: er ligt evenveel. De platen (oud, nieuw, de verschillen in rood):
  `uit/schermen/grondproef3-*.png`.

Gemeten met `Spel.debug.meetGrond()`, dat nu ook de sneeuw en de beek meet, elk beeld tot de videokaart klaar is, drie
keer oud en vier keer nieuw (na de eerste keer van elk seizoen; die kost door de bomen nog steeds een beeld van 500 à 600
ms, D1):

| wat | de oude grond, gespreid | de grond op de kaart |
| --- | --- | --- |
| het wiel naar 0,35 | 8 à 9 beelden, hooguit 35 à 44 ms | 1 beeld van 13 à 22 ms |
| het wiel naar 0,5 | 10 beelden, hooguit 28 à 29 ms | 1 beeld van 8 à 15 ms |
| het wiel naar 2 | 3 beelden, hooguit 8 à 18 ms | 1 beeld van 4 à 6 ms |
| een ander seizoen | 8 à 10 beelden, hooguit 40 à 64 ms | 5 beelden, het eerste 36 à 70 ms |
| een andere stand sneeuw (0,3 naar 0,35) | 11 beelden, hooguit 69 à 75 ms | 1 beeld van 3 à 10 ms, een gewoon beeld |
| sneeuw komt (0 naar 0,3) | 11 à 12 beelden, hooguit 70 à 78 ms | 9 beelden, hooguit 12 à 27 ms |
| de sneeuw is weg | 8 à 10 beelden, hooguit 35 à 46 ms | 9 beelden, hooguit 9 à 11 ms |
| de beek valt droog of komt terug | 8 à 9 beelden, hooguit 32 à 45 ms | 1 beeld van 7 à 12 ms |

Een gewoon beeld was in dezelfde meting 2 à 6 ms, met allebei. Wat nog hapert, is niet de grond: bij een ander seizoen
maken de bomen hun vaste rijen in één beeld opnieuw (27 à 37 ms op het proefdorp, `vasteRijenVoor`), en wat bij het wiel
naar 0,35 overblijft, zit buiten de grond (de grond doet dan niets). Een stuk grond opnieuw maken kost 4 à 5 ms
(`bouwGrondStuk`, 4096 tegels); dat gebeurt bij nieuw land, een gevelde boom, een paadje, en één per beeld als de
sneeuw komt of weg is. In `opmerkingen.md`.

Marcel, in het spel (18 okt): "wow, dat is snel, geeft geen krimp meer, instant wissel".

**Het plan voor stap 4, de heuvels** (18 okt, Marcel: "Ja, begin met stap 4 ... Eerst een plan"; de heuvels staan nog
standaard uit, de spelregel *Height*, en gaan aan in d van 174). Wat de oude grond met heuvels doet (js/tekenen.js):
per tegel, van achter naar voor (x + y, dan x), de vloer schuin op het vlak door zijn vier hoeken, 1,04 groter tegen
naden (`tekenSchuineTegel`, `opTegelVlak`); dan het licht als laag over de tegel, zacht uit een plaatje van 65 bij 65
per stuk (`tekenGrondMetLicht`, `maakLichtStuk`), wat een haarfijn naadje laat; dan zijn wanden aan de zuid- en oostkant,
elk twee driehoeken uit een textuur (`tekenWanden`, `wandTextuur`); de sneeuw op hetzelfde vlak. En een hoge tegel die
iets achter zich afdekt, tekent de lijst opnieuw uit de buffer, uitgeknipt (`heuvelsErvoor`, `tekenTegelOpnieuw`); het
kijkgat haalt zijn grond ook uit die buffer. In stappen, elk weer naast de oude grond:

- **4a, de vloer op de helling**: per tegel zijn vier hoeken erbij in de rij, en de kaart legt de tekening op het vlak
  zoals `opTegelVlak` (met de 1,04), de sneeuw ook (zonder). De volgorde binnen een stuk wordt die van de oude grond (x
  + y, dan x). Stuk na stuk blijft goed: twee tegels die elkaar raken, liggen hooguit twee kolommen (x − y) uit elkaar,
  en dan valt de volgorde van de stukken samen met die van de oude grond (nagerekend, zoals bij het groen). De beek en
  het groen staan al op hun hoogte (`opGrond`, de processor).
- **4b, het licht**: het plaatje per stuk (`maakLichtStuk`, hetzelfde) gaat als textuur naar de kaart, zacht gelezen. De
  keuze: **A** in de tegel zelf (dan is er geen naadje; zo wilde het spel het al, `lichtInDeTegel`, maar op de processor
  was het tien keer zo duur, en op de kaart kost het niets), of **B** als laag erover, zoals nu, met het naadje. Voorstel
  van Claude: **A**. **Marcel koos A** (18 okt: "optie A en akkoord"), en is akkoord met het plan.
- **4c, de wanden**: per wand een instantie met zijn vier hoeken en zijn stuk textuur (de vier texturen op de stapel),
  als dezelfde twee driehoeken. De randen worden niet pixel voor pixel hetzelfde: de oude knipt zacht.
- **4d, wat ervoor ligt**: een tegel die afdekt (`T.dekkersIn`, js/hoogte.js) schrijft zijn diepte op de kaart, met de
  sleutel waarmee `heuvelsErvoor` hem nu in de lijst zet; wat erachter staat (de bomen van de vaste rijen, en de lijst)
  toetst daar al tegen (B1), dus de kaart dekt het zelf af, per pixel, zonder dat de processor elk beeld de dekkers
  zoekt (nu tot 0,9 ms). Wat geen dekker is, schrijft geen diepte: anders zou een tegel ook de voeten en de schaduw
  afdekken van wie op de tegel erachter staat. Het kijkgat (en zo ook (c) in `opmerkingen.md`, op vlak land) tekent zijn
  stukje grond met het 2D-pad (`tekenGrondIn` op zijn eigen doekje), zoals het plan al zei.
- **4e, meten en vergelijken**: `meetGrond` met heuvels (nu: een stuk 40 à 90 ms, gespreid 14 beelden tot 90), de platen
  naast elkaar (pixel voor pixel wordt het hier niet: de oude legt de schuine tegels op een doek, en dat smeert en knipt
  anders), en Marcel in Firefox. Dan stap 5: kiest Marcel of de oude grond eruit gaat.

Waar het lastig kan worden: de diepte van de grond moet dezelfde maat hebben als die van de bomen en de lijst (die
komt per beeld uit `vasteRijenVoor`, na de grond: de opdracht van de grond krijgt hem dan later mee); en de kust is half
doorzichtig, dus alleen wat dicht is, schrijft diepte (een dekker is hoog land, geen water).

Het tweede deel (Marcel, 18 okt: "Dit vond ik nog"):

- **Wegstrepen per stuk, niet per blok**: er al. De vaste rijen gaan per stuk land van 64 bij 64 naar de kaart, met een
  toets van de rechthoek van het stuk tegen het vak in beeld (`vasteRijenVoor`, `js/tekenen.js`); de lijst neemt van elk
  stuk alleen het deel in het vak (`T.voorwerpenIn`, A1). Klein te halen: het vak is een rechthoek in tegels om het
  schuine beeld, dus een stuk in een hoek ervan gaat mee terwijl het buiten het scherm valt; de kaart knipt het weg,
  het kost alleen wat hoeken.
- **Het zwart wegstrepen met een raster**: voor de lijst er al (A1: wat in het zwart staat, gaat er niet in); de vaste
  rijen krijgen de mist per tegel in de shader. Een stuk dat helemaal in het zwart ligt (open, want vooruit, maar nog
  niet gezien), kan in één keer overslaan als de mist per stuk telt wat er bekend is. Klein; winst alleen op de kaart.
- **Van voor naar achter tekenen, voor early-Z**: nieuw, en goedkoop te proeven. De vaste rijen staan nu in een vaste
  volgorde op de kaart; die eens per stuk van voor naar achter leggen (en de stukken zo tekenen) kost per beeld niets.
  Pas op: (a) de bomen gooien hun doorzichtige pixels weg (`discard`), en dan schrijft de kaart de diepte pas na de
  shader; het vroeg wegstrepen van wat erachter ligt, doen de meeste kaarten dan nog wel, niet allemaal; (b) wat zacht
  is (schaduwen, het grijs, de gloed, rook), moet van achter naar voor blijven; (c) waar twee plaatjes precies even diep
  liggen, kan een andere volgorde een andere pixel laten winnen (de "gelijke gevallen" van B1). De winst zit alleen op de
  kaart, en die meet de meter niet (hij meet de processor): meten in beelden per seconde op een zwakke kaart, of met een
  tijdmeter van de kaart erbij.
- **De pijplijn met een worker en Uint32Array per stuk**: zie F6 en het eerste deel hierboven.

## De tik (18 okt)

Marcel, 18 okt: "Waar komen de performance hits vandaan?", en daarna "zoek het per deelgebied uit". Na B1 en B2 is het
tekenen klein; wat een speler nog merkt, zijn pieken in de tik (`js/tik.js`): zwaar werk dat in één tik op de
hoofdthread valt. Gemeten in Node op het proefdorp, op 30×, stand 0570d2d, in de cloud (niet op Marcels pc), om en om
oud tegen nieuw. Drie agents zochten elk een deelgebied uit en proefden de beste ideeën; die proeven staan niet in `main`.

| | op 0570d2d | hoe vaak |
| --- | --- | --- |
| een gewone tik | 1,8 ms (95% onder 3,7) | elke tik |
| middernacht | 13 à 20 ms | elke speeldag, op 30× elke 10 s |
| de eerste tik na het laden | 0,8 s op het proefdorp, meer naarmate er meer verkend is | één keer |
| het land vooruit maken | 14 à 18 ms | zo'n 50 tikken na het laden, en weer bij nieuw land |
| een stuk land dat meteen nodig is | 45 à 60 ms | per stuk, wie snel op tocht gaat |

### F. Het land maken en laden (procedurele generatie en streaming)

Waarom: een deel van 16 bij 16 (`maakVooruit`, `T.landStuk`) rekent `T.eilandStuk` met een marge van 8 tegels en een
rand van 1, en dat twee keer (de tegels en de hoeken): 2.381 punten voor 256 tegels, ruim 9 per tegel, waar een stuk van
64 er 3,3 heeft. Zo kost één deel 8 ms tegen een budget van 4 per tik (`vooruitMsPerSeconde`), en een stuk in delen 107
à 125 ms tegen 48 in één keer. En na het laden is er geen stuk (ze worden niet bewaard: WeakMaps per kaart), dus vult de
eerste vraag aan het raster (`vulRaster`) het hele loopvak: alle open stukken in één tik, op het proefdorp 9 × 42 à 50
ms, en meer naarmate er meer open is. Na lang verkennen zijn dat seconden.

- **F1, gedeelde blokken** (gebouwd, 18 okt; Marcel: "daarna F1"; `code.md` bij `js/eiland.js`): `T.eilandStuk` in
  vaste blokken van 16 bij 16 (`T.eilandRaster`), de laatste 1.024 onthouden (2 à 3 MB), en daaruit putten de delen, de
  stukken ernaast en de hoogte (`js/hoogte.js`); het vooruit maken rekent eerst de blokken, een per stap; en
  `heuveligOp` één keer per punt in plaats van twee (8%). Om en om nagemeten tegen de stand ervoor: een stap van het
  vooruit maken van een mediaan van 6,3 ms (tot 12,7) naar 0,6 voor een blok en 1,5 voor een deel (allebei hooguit 3);
  zeven stukken vooruit samen 667 naar 328 ms; na het laden (een gespeeld proefdorp, 900 tikken op 30×) de tikken boven
  8 ms van 40 à 52 naar 5 à 11, het traagste procent van 11 à 12 naar 7 à 9 ms. Een stuk dat meteen nodig is, blijft
  50 à 60 ms. Het land blijft precies gelijk (een vingerafdruk van `T.eilandStuk` en `T.landStuk`, en een toets dat de
  blokken op elk punt `T.eilandStuk` geven), dus geen nieuwe `versie`; en het spel loopt precies hetzelfde (een afdruk
  van `S` per dag). Je ziet niets. Wat er na het laden nog uitsteekt, is de eerste tik (35 à 39 ms) en de eerste
  middernacht (46 à 70 ms: het net van de paden en de eerste bosKaart, koud): dat is H4.
- **F2, het land achter het laadscherm** (gebouwd, 18 okt; Marcel: "daarna G2 en F2"; `code.md` bij `js/opslaan.js`):
  na het laden maakt de lus eerst het land van alle open stukken (`T.maakOpenStukken`, `ladenMsPerBeeld` per beeld, dus
  een stuk per beeld), en het menu zegt zolang "Loading the land… 4 of 9"; pas daarna tikt de wereld. Samen even duur,
  maar daarna geen hapering: in Node, met een gespeeld en bewaard proefdorp, met 9 open stukken een eerste tik van 452
  naar 16 ms (het land in 9 stappen van hooguit 49 ms), met 39 van 1.702 naar 44 ms (39 stappen van hooguit 58 ms). In
  de browser niet nagekeken: de headless Chromium van deze omgeving loopt vast zodra de spellus draait, ook op de stand
  ervoor.
- **F3, het raster per stuk** in plaats van over het hele loopvak (het lopen): de echte oplossing als er veel land open
  is. Groot, later.
- **F4, het wild bij het opengaan spreiden**: een bosrijk stuk kost zo'n 40 ms aan wild, waarvan 27 het eilandenwerk
  (`eilandenVan`, `kanErKomen`); per groep per tik. Middel. (De 200 ms die eerst gemeten werd, kwam van het meten: een
  bewaard spel heeft zijn wild al.)
- **F5, `vooruitMsPerSeconde` hoger**: na F1 zijn de stappen klein, dus mag het vooruit maken meer per tik. Een getal in
  de werkbank.
- **F6, een Web Worker**: Chromium weigert vanaf `file://` een worker uit een bestand (een blob uit geladen code
  waarschijnlijk wel, nog niet geproefd); `T.landStuk` hangt aan veel van `js/maker.js`, de schets (8 MB) moet erheen,
  en een getal uit de werkbank ook (anders ander land); en er komen twee wegen (vooruit in de worker, wat meteen nodig is
  synchroon). Lockstep blijft veilig. Winst nu zo'n 4 ms per tik terwijl er vooruit gemaakt wordt. Groot; later, en dan
  eerst voor `T.maakEiland` (1,45 s bij een nieuw eiland).
- Niet: de ruis op een grover raster (geschat 25 à 35% sneller), want dat verandert het land, en dus elk spel.

### G. De kuddes (padzoeken en local avoidance)

Waarom: 40 à 60% van een gewone tik ging naar `omweg` (`js/lopen.js`), bijna alles voor herten en wolven die volgen.
Staat de leider stil (91% van de keren, meestal thuis in het bos), dan wil een volger naar zijn plek in de kring (`volg`,
`KRING`), 3 à 4 tegels van de leider; op zijn weg staat een dier van zijn eigen kudde (96%), en tussen de bomen gaat de
enige weg door de kudde, dus vindt A* in 80 tegels niets (97% vergeefs), elke seconde opnieuw. In drie dagen 11.600 keer;
voor mensen 4.

- **G1, wachten of er al zijn** (gebouwd, 18 okt; Marcel: "daarna G1"; `code.md` bij `js/beesten.js`): een volger met
  een dier van zijn eigen kudde voor zich wacht even als dat loopt, en is anders klaar; bij een stilstaande leider is hij
  er ook naast een dier dat er al bij hoort (`erBij`, een keten vanaf de leider). Om en om nagemeten tegen de stand
  ervoor: omwegen van 11.621 naar 12 in drie dagen, de gewone tik over zes dagen van 1,81 naar 0,81 ms. Te zien: bij een
  stilstaande leider staat de kudde iets losser (op twee tegels van 54 naar 45%, op drie van 23 naar 28%); het vluchten
  is gelijk (107 tegen 104 keer in zes dagen), en het langst losse dier staat even lang los als eerst (150 s). Het spel
  loopt dus iets anders, zonder toeval erbij.
- **G2, alleen de mensen dichtbij** (gebouwd, 18 okt; Marcel: "daarna G2 en F2"): `mensBij` vraagt op 30× elke tik voor
  elke groep aan alle wezens of er een mens komt; een mens buiten het vak om de groep slaat hij nu over. Precies hetzelfde
  spel (een afdruk van `S` per dag, met en zonder 120 mensen erbij). Om en om: de tik van 2,36 naar 2,08 ms op het
  proefdorp, van 4,03 naar 3,40 met 120 mensen erbij.
- Niet: boids of een formatie (de kring is er al een, en sturen past niet bij tegels die elk wezen reserveert), vooraf
  zien dat een omweg niet kan (het doel is nooit helemaal omringd), flow fields en RVO/ORCA (die lossen het blokkeren
  niet op). Een omweg die na elke misser langer wacht, alleen als de spits van een groot dorp erom vraagt: met 137 mensen
  is hun padzoeken 7% van de tik, maar de ochtend- en avondspits is nog niet gemeten.

### H. Middernacht (werk dat eens per dag valt)

Waarom: het wild woont in de stukken rond het dorp (op het proefdorp 6, met 17 groepen), en voor elk stuk rekent
`bosKaart` elke nacht `T.bosInVak` met het jonge bos over 68 bij 68 tegels: zo'n 27.700 keer `T.voorwerpOp`, en dan de
diepte (een zoektocht met een rij paren). Tussen twee nachten verandert er meestal niets: alleen rooien, planten, een
stronk die vergaat, een gebouw of een akker.

- **H1, goedkoper rekenen** (geproefd): `T.voorwerpOpVak` leest de rijen van de stukken en `w.voorwerpen` één keer per
  vak (met dezelfde regel als `lijstPerTegel`), en de diepte rekent in vaste lijsten. Winst: `bosInVak` van 6,0 naar 2,4
  ms, de nacht van het wild van 9,5 naar 3,8. Prijs: klein (`js/wereld.js`, `bos.js`, `beesten.js`).
- **H2, alleen opnieuw wat veranderde** (geproefd): `T.bosInVak` onthoudt per vak zijn lijst (in een WeakMap op de kaart,
  niet in `S`), geldig zolang `T.kaartPlekkenSinds` niets in het vak of op een rand van 2 tegels noemt en `open`,
  `w.voorwerpen` en `bosBomen` gelijk zijn, zoals `T.aangelegdNet`. Winst: de nacht van het wild van 3,8 naar 0,3 ms;
  met veel veranderingen 4 à 5,5 tegen 10 à 12,5. Prijs: klein tot middel, met een nieuwe toets in `test/bos.test.cjs`.
  Risico: een verandering buiten `kaartVeranderd` om (dat bewaakt `test/wereld.test.cjs` al); boven 64 veranderingen
  per dag (`PLEKKEN_MAX`) gaat alles opnieuw, of dat in een levend dorp te krap is, is nog niet gemeten.
- **H3, het plein één keer per dag**: `plekOpHetPlein` filterde voor elke bewoner alle 262 tegels van het plein; nu één
  keer per `T.wijsWerkToe` (`T.pleinVrij`, `js/bewoners.js`). Van 0,9 naar 0,3 ms bij 17 bewoners; bij 100 geschat 3 ms
  minder.
- **H4, opwarmen bij het laden** (gebouwd, 18 okt; Marcel: "dan h4 starten"; `code.md` bij `js/opslaan.js`): na het
  land van F2 doet de lus nog vijf stappen achter de voortgang (`T.opwarmStappen`, `js/tik.js`): het raster om te lopen,
  zijn eilanden, wat er op elke tegel staat, het bos van het wild (`T.warmBosKaarten`), en per dorp het net van de
  paadjes en de tegels van zijn plein; elk hooguit zo'n 20 ms, samen 65 à 73. In een vers proces, met een gespeeld en
  bewaard proefdorp: de eerste tik van 39 à 52 naar 20 à 21 ms, de eerste middernacht van 60 à 63 naar 18 à 19, en een
  tik erna (de eilanden) van 24 naar gewoon. Precies hetzelfde spel (een afdruk van `S` per dag, en een toets). Wat in de
  eerste nacht overblijft, is de dag van de gebouwen die voor het eerst draait; wat na het laden het traagst is, is nu
  een lange zoektocht van de ossenkar (tik 10, 32 à 45 ms), en dat is werk, niet koud (`opmerkingen.md`).
- **H1 tot H3 zijn gebouwd** (18 okt; Marcel: "begin met middernacht"; `code.md` bij `js/bos.js`), met een toets dat
  `T.voorwerpOpVak` op elke tegel `T.voorwerpOp` geeft (`test/wereld.test.cjs`). Om en om nagemeten: middernacht van een
  mediaan van 13,6 naar 3,3 ms (het traagste van 23,5 naar 4,4, de eerste nacht na het laden van 33 à 54 naar 22); met
  elke dag veranderingen in elk vak 5 à 7 tegen 10 à 14 ms (het traagste 16 à 18 tegen 21 à 22). En precies hetzelfde
  spel: een afdruk van `S` elke nacht, oud tegen nieuw, ook met honderden bomen weg, om of geplant, een stuk dat opengaat,
  en laden midden in het spel. Niet: het werk spreiden over de tikken vóór middernacht (na H1 en H2 niet nodig, en het
  verandert wanneer iets gebeurt).

### Wat we nog niet weten

- `npm run grootte` werkt niet op het eiland: `gereedschap/grootte/bouw.cjs` zoekt alleen kaarten tot 512 tegels, bouwt
  dan niets en meldt een lege reden. Zo is de ochtend- en avondspits van een groot dorp niet te meten.
- Een zwakke machine (een Steam Deck, een laptop met de videokaart in de processor): niets gemeten.
- De meter in het spel meet bij *drawing* alleen de processor; wat de videokaart doet, zie je alleen aan de beelden per
  seconde.
- De speeltest in de browser liep niet (de time-out op `file://`, `opmerkingen.md`), dus de kolonist speelde de proeven
  niet.

### Voorstel van Claude (de tik)

Eerst wat klein is en het spel niet verandert: H1, H2 en H3 (middernacht van 13 naar 3 ms; gebouwd, 18 okt), G2, en F2
met H4 (het laden, want dat groeit met het spel). Dan G1, na Marcels blik op de kudde (de helft van de gewone tik). Dan F1 met F5 (de pieken
van het vooruit maken). F3, F4 en F6 later, en eerst `npm run grootte` op het eiland laten werken, zodat de spits van een
groot dorp te meten is.
