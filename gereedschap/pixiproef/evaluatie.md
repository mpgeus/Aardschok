# De renderproef: js/gl.js tegen PixiJS v8, WebGL2 en WebGPU (17 okt 2026)

Marcel, 17 okt: onderzoek of PixiJS v8 voor het spel een betere keuze is dan onze eigen laag op WebGL1 (`js/gl.js`),
met een losse proef die dezelfde scène met beide tekent, zonder de code van het spel te veranderen, en een advies:
houden, deels verbeteren, of overstappen. Nog niets omzetten. Daarna: **"ik wil ook dat je kijkt of er winst te behalen
is in webgl 2 en webGPU"** (sectie 6). Hoort bij vraag 178 (ver uitgezoomd sneller, `ontwerp/snelheid.md`, E).

Gemeten op de pc van Marcel (GTX 1080 Ti, Ryzen 7 5800X), in Chromium 156 met de videokaart en in de Electron van de
proefversie (44.5.1, Chrome 152), `js/gl.js` zoals in git: Pixi op `aa2fe18f` (17 okt rond 23:20, `meting.json`),
WebGL2 en WebGPU op `4e2c6ae3` (rond 23:50, `meting-gpu.json`, met js/gl.js en Pixi opnieuw ernaast). Opnieuw: `npm
start`, dan `node gereedschap/pixiproef/meting.cjs` (alles, een minuut of twintig; hij wacht zelf tot de machine rustig
is), of met `--varianten pixi,pixi-gpu,gl2,gpu,gl2-vast,gpu-vast --uit meting-gpu.json` zoals de tweede keer; `--snel`
voor één blok. Kijken: `http://localhost:8123/gereedschap/pixiproef/` (slepen schuift, het wiel zoomt, de knoppen bovenaan
wisselen tekenaar, zoom, weergave van de gebouwen, schaduw, licht en 'vast'; de meter staat eronder; `?wegen=huidig,gl2,gpu`
voor de tekenaars van sectie 6). Ook in Firefox, dat is hier niet gemeten.

## Wat de proef doet

- **Eén scène, twee tekenaars** (`scene.js`): een dorp uit de echte kunst van het spel, uit een vast zaad. 150 gebouwen
  (59 verschillende tekeningen tot 6 bij 6 tegels, elk een eigen bestand, zoals in het spel) op kavels van 10 bij 10
  met straten ertussen, 4593 bomen en 2244 stuks begroeiing, 300 inwoners die heen en weer over de straten lopen (15
  figuren, acht richtingen, met hun loopanimatie), en rook uit een derde van de gebouwen (189 zachte, half doorzichtige
  wolkjes). De grond in stukken van 512 pixels op de maat van het scherm, zoals `werkStukkenBij` in `js/tekenen.js`. De
  volgorde: het midden van de voet (`x + y`); met een straat om elk gebouw klopt dat hier, en het is voor beide gelijk.
- **De schaduwen** zoals het spel ze tekent: elk plaatje nog eens als silhouet, scheef over de grond, op één masker dat
  in één keer over de grond gaat (`beginSchaduw`/`eindSchaduw`). In Pixi: een laag met dezelfde plaatjes in de
  schaduwkleur, scheef met een matrix, en een `AlphaFilter` erover (anders worden schaduwen die elkaar raken donkerder).
- **Het licht**, als eenvoudig filter: de wereld maal een avondkleur. Bij ons `tekenLichtkaart` (de lichtkaart op de
  halve maat), in Pixi een `ColorMatrixFilter` over de hele wereld.
- **De huidige weg** (`huidig.js`) gebruikt `js/gl.js` zoals `js/tekenen.js`: per beeld de lijst van wat in beeld is,
  gesorteerd, eerst de schaduwen, dan alles, dan het licht.
- **De weg met Pixi** (`pixiweg.js`): Pixi 8.22.0 (1 okt 2026), het gewone script `pixi-8.22.0.min.js` (MIT,
  `pixi-LICENSE.txt`). Pixi houdt een boom van dingen vast: elk ding is één keer een `Sprite`, en per beeld zet je alleen
  wat veranderde. Vier manieren, om Pixi eerlijk te behandelen: **gewoon** (wat in beeld is, hangt in de laag, Pixi
  sorteert op `zIndex`), **alles erin** (elk ding hangt er altijd, onzichtbaar buiten beeld), **eigen lijst** (de laag
  krijgt elk beeld opnieuw alleen wat in beeld is, door ons gesorteerd: zo zou `js/tekenen.js` er het makkelijkst op
  overgaan), en **Culler** (alles erin, Pixi's eigen `Culler` bepaalt wat in beeld is).
- **Twee eigen tekenaars op WebGL2 en WebGPU** (`gl2weg.js`, `gpuweg.js`, met het gedeelde stuk in `atlas.js`), precies
  gelijk op de API na, zodat het verschil tussen de API's los staat van het verschil in techniek. Zie sectie 6.
- **De teller** (`teller.js`) telt voor elk WebGL-doek (en voor WebGPU op de bladzijde) hetzelfde: opdrachten aan de kaart, wat erheen gaat, en hoeveel
  textuurgeheugen er vastligt. **De meting** (`meting.cjs`): 1920×1080, elk beeld met één pixel teruggelezen (dan heeft
  de kaart het werk ook gedaan); alle varianten tegelijk open en per zoom vier blokjes van 120 beelden om en om, met
  vooraf wachten tot de machine rustig is. Dan per tekenaar in een verse bladzijde het geheugen, de wissel naar plat en
  de echte beelden per seconde; het beeld pixel voor pixel; `file://` in Chromium; en Electron met `loadFile`, zoals de
  Steam-versie (`electron/main.js`). Sinds de tweede meting ook de **doorvoer**: 120 beelden achter elkaar zonder te
  wachten, en één keer aan het eind, zodat de processor en de kaart tegelijk werken, zoals in het spel (en WebGPU, dat
  alleen met een belofte op de kaart kan wachten, eerlijk meetelt).

## 1. Snelheid en geheugen

Milliseconden per beeld, alles samen (tussen haakjes de processor alleen), de mediaan over vier blokjes, en hoeveel keer
de tijd van `js/gl.js` in hetzelfde blokje:

| | 100% (339 in beeld) | 50% (1647) | 35% (3880) |
| --- | --- | --- | --- |
| `js/gl.js` | 1,1 (0,7) | 2,5 (1,8) | 4,5 (3,3) |
| Pixi, gewoon | 1,5 (0,9), 1,36× | 2,1 (1,1), 0,87× | 3,7 (2,2), 0,82× |
| Pixi, alles erin | 1,6 (1,0), 1,5× | 3,1 (1,6), 1,24× | 4,2 (2,7), 0,93× |
| Pixi, eigen lijst | 1,5 (0,9), 1,36× | 3,7 (2,5), 1,61× | 6,1 (4,4), 1,33× |
| Pixi, Culler | 4,5 (3,9), 4,5× | 5,6 (4,5), 2,33× | 7,1 (5,3), 1,54× |
| opdrachten aan de kaart | 8 tegen 16 | 8 tegen 33 | 8 tegen 40 |

- **In doorvoer** (de tweede meting, processor en kaart tegelijk) is het verschil groter: op 35% `js/gl.js` 3,5 ms, Pixi
  gewoon 1,8 ms, twee keer zo snel; op 100% gelijk (0,65 en 0,66). Bij ons wacht de kaart dus ook op ons pad per plaatje.
- **In Electron** (zoals Steam) hetzelfde beeld: `js/gl.js` 1,0 / 2,3 à 2,4 / 4,3 à 4,6 ms, Pixi gewoon 1,2 à 1,3 / 2,1 à
  2,3 / 3,4 à 3,9 ms. In Chromium met de echte spellus halen beide op 35% de 60 beelden per seconde (Pixi had in
  drie seconden twee beelden boven de 20 ms, wij geen).
- **Pixi gewoon is ver uitgezoomd 0,8 ms sneller, dichtbij 0,4 ms trager.** Waar het verschil zit (35%, per tekenaar
  in een eigen bladzijde, dus wat ruwer): de schaduwen kosten beide zo'n 1,3 à 1,6 ms; het licht bij ons bijna niets en
  in Pixi 0,5 à 0,8 ms (een filter is een extra rondgang over het hele scherm, dat is ook de vaste prijs dichtbij); en
  als niets beweegt, zakt Pixi naar 3,2 ms en wij niet (4,5): Pixi bewaart zijn opdrachten zolang de boom niet
  verandert, wij bouwen elk beeld alles opnieuw. Bij ons
  gaat de rest naar het pad per plaatje in `drawImage` (een lijst per aanroep, het opzoeken van de textuur, een rijtje
  getallen per schaduw).
- **Pixi is alleen sneller als je hem gebruikt zoals hij bedoeld is**, met een sprite die blijft bestaan. Als tekenaar
  die elk beeld een lijst krijgt (eigen lijst, hoe `js/tekenen.js` werkt) is hij 1,3 à 1,6 keer trager, en met zijn
  eigen `Culler` tot 4,5 keer (die rekent elk beeld de omtrek van alle 8800 dingen uit).
- **Onder last keert het om.** De eerste metingen liepen terwijl een andere sessie renderde of `npm test` draaide (de
  machine vol): toen was Pixi gewoon 1,2 à 1,9 keer trager dan wij, in Electron op 35% 31 tegen 15 ms. Vermoedelijk
  omdat Pixi vijf keer zoveel opdrachten geeft, en die gaan in Chromium door een eigen proces dat dan ook om de
  processor vecht. Op een zwakke machine (een Steam Deck, vier kernen) is dat de gewone toestand; daar is niet gemeten.
- **Geheugen.** Op de kaart: wij 163 / 178 / 193 MB (op 100, 50 en 35%, met de grond van elke zoom die al langskwam),
  Pixi 85 / 112 / 130 MB. Een blad van `js/gl.js` is 4096 bij 4096
  en kost meteen 64 MB, ook als het half leeg is; Pixi maakt elk plaatje precies zo groot als het is. In JavaScript: na
  het opruimen wij 20 MB, Pixi 35 MB (17.000 sprites voor 8800 dingen en hun schaduwen); tijdens het tekenen loopt het
  bij ons tussen twee keer opruimen op tot 117 MB, bij Pixi tot 44: `js/gl.js` maakt per beeld veel afval, en het
  traagste beeld op 35% was bij ons 17 ms (opruimen), bij Pixi 10. Pixi zelf laden kost 21 à 23 ms bij het begin (840
  KB script), de sprites maken 34 ms.

## 2. Het beeld per zoom

`vergelijking-100.png`, `-50.png` en `-35.png`: per zoom een uitsnede, twee keer vergroot, van `js/gl.js`, Pixi met
naaste pixel, en Pixi lineair met mipmaps.

- **Het is echt dezelfde scène:** zonder schaduw en licht op 100% pixel voor pixel gelijk (0%); met schaduw en licht
  wijkt 1,6% van de pixels af, gemiddeld 0,6 op 255 (het masker tegen het `AlphaFilter`, de lichtkaart op de halve maat
  tegen de kleurmatrix).
- **Op 50% en 35% verschilt 27% van de pixels, maar het is hetzelfde beeld met een andere bemonstering:** Pixi legt elke
  sprite op hele schermpixels (`roundPixels`), wij niet. Zonder afronden is 35% op 0,13% na gelijk; op 50% blijft 15%,
  omdat daar elk plaatje precies op een halve pixel valt en de kaart bij naaste pixel dan willekeurig kiest. Geen van
  beide is beter; beide flikkeren bij het schuiven ver uitgezoomd, want naaste pixel zonder mipmaps slaat pixels over.
- **Met mipmaps (Pixi, één optie)** is 35% rustiger: de daken en de bomen ruisen niet meer, maar alles is zachter, meer
  geschilderd dan pixel art. Dat kan `js/gl.js` ook: de bladen zijn 4096 bij 4096, een macht van twee, dus mipmaps werken
  ook in WebGL1, met een randje om elk plaatje op het blad zodat de buren niet doorlopen.

## 3. Afvlakken en verbergen

Beide kunnen het even makkelijk: per ding een ander plaatje (plat), doorzichtigheid, of niet tekenen. Bij ons kiest
`js/tekenen.js` dat per beeld; in Pixi zet je `texture`, `alpha` of haal je de sprite uit de laag. De proef heeft de
weergaven **plat** (de platte tekeningen uit vraag 176, en half doorzichtig waar er nog geen is), **doorzichtig** (de
gebouwen bij het midden van het beeld) en **verborgen**. Wisselen op 50%: de 48 platte tekeningen laden 33 à 39 ms (voor
beide gelijk), het eerste beeld daarna bij ons 17 ms en in Pixi 27 ms (10 MB naar de kaart), en dan weer gewoon;
doorzichtig en verborgen kosten niets extra. Pixi heeft er meer bij (maskers voor een uitsnede, een filter per ding voor
een rand of een gloed), maar een filter per ding is een rondgang per ding, en het kijkgat en het grijs van de mist doet
`js/gl.js` al. Geen reden om over te stappen.

## 4. Inpassen in onze simulatie

- **De simulatie merkt niets**: beide lezen alleen `S`; de tik, het toeval en het samen spelen blijven zoals ze zijn.
- **Pixi wil een boom die meeleeft met `S`**: een sprite per boom, gebouw, figuur en lantaarn, die ontstaat als het
  ding ontstaat, verandert als het verandert, en weggaat als het weggaat (gekapt, afgebroken, gestorven), en alleen dan
  is hij sneller. `js/tekenen.js` (3583 regels) tekent elk beeld opnieuw uit `S`. Overstappen is dat bestand opnieuw
  schrijven, met alles wat de laatste weken op het beeld kwam (de doorkijk, de mist, de lantaarns, de bruggen, de
  heuvels, het graan, plat). De goedkope weg, Pixi als tekenaar die een lijst krijgt, is trager dan nu (hierboven).
- **Wat Pixi niet heeft**: de mengstanden van de nacht en de ramen (`source-atop`, `destination-over`, `source-in`,
  `copy`; Pixi kent zonder filter gewoon, optellen, vermenigvuldigen, scherm en wissen, de rest alleen als filter, een
  rondgang extra), het grijs van de mist per hoek (in Pixi een filter per sprite of een eigen batcher), de lichtkaart die ook
  lichter kan maken (een eigen filter), en het doek zonder videokaart (`js/tekenen.js` tekent nu op beide).
- **De toetsen**: Pixi laadt niet in Node (`navigator is not defined`), dus het moet bij `ALLEEN_SCHERM` in
  `test/laad.cjs`, en wat erop tekent ook.
- **Onderhoud**: een bibliotheek die we niet zelf bijhouden; van v7 naar v8 brak bijna alles. Een vaste versie in de map
  (zoals hier) houdt dat tegen, tot je wilt bijwerken.

## 5. Zonder bouwstap

- **Pixi v8 werkt als gewoon script**: `dist/pixi.min.js` zet `PIXI` op `globalThis`, zonder bundelaar en zonder
  modules. Wel de hele bibliotheek (840 KB), want zonder bouwstap valt er niets weg te laten.
- **Electron met `loadFile`** (de Steam-versie): beide tekenen met de videokaart.
- **`index.html` los in Chromium (`file://`)**: Chromium laat geen plaatje van een los bestand naar WebGL ("tainted"),
  voor beide. `js/gl.js` valt dan vanzelf terug op het 2D-doek; Pixi geeft een fout bij de eerste textuur, en dan moet je
  zelf zijn `CanvasRenderer` starten (8.22 heeft er weer een, en die werkt vanaf `file://`: 2000 sprites in 4,6 ms). Dus
  gelijk, met wat extra code voor Pixi.

## 6. WebGL2 en WebGPU

Wat de twee nieuwere API's kunnen, en wat het hier oplevert. Om de API los te meten van de techniek zijn er twee eigen
tekenaars, precies gelijk op de API na (`gl2weg.js` en `gpuweg.js`, met het gedeelde stuk in `atlas.js`):

- **Een atlas als textuurstapel** (*texture array*, WebGL2 en WebGPU; WebGL1 kent het niet): alle plaatjes in één
  textuur van lagen van 2048 bij 2048, dus geen grens van acht texturen per opdracht.
- **Een plaatje als één instantie** (*instancing*): 12 getallen per plaatje in plaats van vier hoeken van 10 (zoals nu),
  en de kaart maakt er zelf de vier hoeken van.
- **De schaduwen uit dezelfde rij** (`snelheid.md`, B3): de shader legt het silhouet scheef, dus geen tweede rondgang
  over de lijst op de processor.
- **Twee manieren**: **lijst** (per beeld wat in beeld is, gesorteerd, zoals `js/tekenen.js` nu werkt), en **vast** (B1
  en B2: wat stilstaat één keer in een vaste rij op de kaart, met een dieptebuffer, en per beeld alleen wat beweegt of
  zacht is). Een dieptebuffer mag, want alle kunst heeft alleen helemaal dichte of helemaal doorzichtige pixels (geteld:
  0 van de 9,9 miljoen ertussen, in gebouwen, bomen, begroeiing en figuren); de rook en wat half doorzichtig is, komt
  erna, gesorteerd.

**Hetzelfde beeld:** tegen `js/gl.js`, ook vast met de dieptebuffer, is op 100% 0% van de pixels anders, op 35% 0,15%
(WebGL2) en 0,19% (WebGPU); op 50% 1,9 en 12,6%, de halve pixels van sectie 2.

Doorvoer in ms per beeld (de mediaan over vier blokjes om en om; tussen haakjes de processor alleen), Chromium:

| | 100% | 50% | 35% |
| --- | --- | --- | --- |
| `js/gl.js` (WebGL1) | 0,65 (0,6) | 1,79 (1,6) | 3,53 (3,2) |
| Pixi op WebGL2 | 0,66 (0,6) | 1,09 (1,1) | 1,77 (1,8) |
| Pixi op WebGPU | 0,75 (1,0) | 1,27 (1,6) | 2,12 (2,8) |
| eigen, WebGL2, lijst | 0,44 (0,4) | 0,74 (0,6) | 1,28 (1,1) |
| eigen, WebGPU, lijst | 0,40 (0,4) | 0,67 (0,8) | 1,18 (1,3) |
| eigen, WebGL2, vast | 0,27 (0,1) | 0,40 (0,1) | 0,59 (0,1) |
| eigen, WebGPU, vast | 0,28 (0,1) | 0,39 (0,1) | 0,65 (0,1) |

In Electron (twee keer elk, om en om) hetzelfde: op 35% `js/gl.js` 3,4, Pixi 1,8 à 1,9, Pixi op WebGPU 2,2, WebGL2 en
WebGPU lijst allebei 1,2, vast allebei 0,54 à 0,68 ms.

- **De winst zit in de techniek, niet in de API.** Met dezelfde aanpak als nu (lijst) is WebGL2 op 35% 2,8 keer zo
  snel als `js/gl.js` (de processor van 3,2 naar 1,1 ms), en met vaste rijen 6 keer (de processor 0,1 ms: alleen wat
  beweegt). Ook sneller dan Pixi, en zonder `js/tekenen.js` om te bouwen tot een boom van sprites.
- **WebGPU levert hier niets extra op**: lijst en vast binnen 10% van WebGL2, en de processor met WebGPU zelfs iets meer
  (1,3 tegen 1,1 ms). Waar WebGPU goed in is, minder werk per opdracht, telt niet bij twintig opdrachten per beeld. Pixi
  op WebGPU is trager dan Pixi op WebGL2 (2,1 tegen 1,8 ms).
- **Waar de tijd nu nog zit**: de schaduwen kosten met WebGL2 de processor bijna niets (lijst 1,28 met, 1,15 zonder;
  bij `js/gl.js` 3,5 met en 2,1 zonder), het licht ook niet. Het geheugen in JavaScript blijft laag (18 MB na opruimen,
  tijdens het tekenen 19 à 26; `js/gl.js` 46 à 71), en het traagste beeld op 35% was 2,4 ms (lijst) of 1,5 (vast), bij
  `js/gl.js` 15,7 (opruimen).
- **Wisselen naar plat** kost met een vaste rij één keer de rij opnieuw: het eerste beeld 17,6 ms (WebGL2) of 34,5
  (WebGPU), daarna weer 0,25 ms; doorzichtig en verborgen 2 à 5 ms, één keer.
- **Op de kaart even groot**: 167 à 205 MB, zoals nu. De textuurstapel heeft een vast aantal lagen (hier negen van 16
  MB, met twee in reserve voor de platte tekeningen), dus strakker inpakken scheelt daar net zo als bij de bladen (E2).
- **Opstarten**: WebGL2 8 ms, WebGPU 86 à 90 ms (de pijplijnen).
- **Waar het draait.** WebGL2 overal waar het spel nu draait: Chromium, Electron, Firefox, Safari, en de Steam Deck.
  WebGPU hier in Chromium en in Electron (ook vanaf `file://`, met `timestamp-query`), maar in Chrome op Linux staat het
  alleen standaard aan voor nieuwere Intel- (en volgens één bron NVIDIA-)kaarten; voor AMD, wat de Steam Deck heeft, vond
  ik geen bron dat het standaard aan staat, alleen vlaggen die "unsafe" heten
  ([Chrome, WebGPU troubleshooting](https://developer.chrome.com/docs/web-platform/webgpu/troubleshooting-tips),
  [WebGL 2 of WebGPU, 2026](https://app.cinevva.com/guides/webgl-webgpu-not-supported-fix)). Firefox heeft WebGPU op
  Windows (141) en op Macs met Apple Silicon (147), nog niet op Linux
  ([Firefox 147](https://www.firefox.com/firefox/147.0/releasenotes/),
  [web.dev](https://web.dev/blog/webgpu-supported-major-browsers)). Niet op een Steam Deck zelf nagekeken.
- **Hoe het in het spel kan komen**: `js/tekenen.js` hoeft niet om. `js/gl.js` kan `drawImage` blijven aannemen, maar
  per aanroep een instantie schrijven (12 getallen) in plaats van vier hoeken, en pas in `klaar` tekenen: eerst het
  masker uit de plaatjes die een schaduw hebben, dan alles. Dan valt `tekenZonneschaduw` (de tweede rondgang) weg, en
  komt de lijst zoals nu. Vast (B1 en B2) is daarna een stap erbij: wat stilstaat per stuk land in een eigen rij, met
  de diepte; de 2D-weg zonder videokaart blijft zoals hij is.

## Advies: houden en verbouwen naar WebGL2; niet naar Pixi, niet naar WebGPU

**Niet naar Pixi.** In doorvoer is Pixi ver uitgezoomd twee keer zo snel als `js/gl.js` nu (1,8 tegen 3,5 ms), maar
alleen als `js/tekenen.js` een boom van sprites wordt die meeleeft met `S`, een herschrijving van het grootste bestand
van het spel; als tekenaar die elk beeld een lijst krijgt, zoals nu, is hij trager, en onder last ook. En een eigen
tekenaar op WebGL2 met dezelfde lijst als nu haalt 1,3 ms, met vaste rijen 0,6 (sectie 6).

**Niet naar WebGPU.** Met dezelfde techniek is het niet sneller dan WebGL2 (binnen 10%, de processor zelfs iets meer),
het start trager (90 tegen 8 ms), en het draait niet overal: op Linux met een AMD-kaart, dus op de Steam Deck, staat het
in Chromium niet standaard aan, en Firefox heeft het op Linux nog niet. Later kan het nog voor rekenwerk op de kaart
(*compute*), maar voor het tekenen niet.

**Wel: `js/gl.js` naar WebGL2, in stappen**, zonder verschil in beeld (gemeten: hetzelfde beeld, ook met de dieptebuffer):

1. **Instanties en een textuurstapel** (`snelheid.md`, B5 en B3, met E1): `drawImage` blijft, maar schrijft per plaatje
   12 getallen zonder afval, alle plaatjes staan in één textuurstapel, en `klaar` tekent alles in een paar opdrachten,
   eerst het masker van de schaduwen uit dezelfde rij. `js/tekenen.js` blijft zoals het is, op de tweede rondgang voor de
   schaduwen na, die wegvalt. In de proef: ver uitgezoomd 3,5 naar 1,3 ms.
2. **Vaste rijen met een dieptebuffer** (B1 en B2): wat stilstaat per stuk land één keer, en per beeld alleen wat
   beweegt of zacht is. In de proef 0,6 ms en 0,1 ms op de processor. In het spel zit hier de grote winst: dan hoeft
   `js/tekenen.js` de duizenden bomen niet meer elk beeld langs (de lijst, de volgorde, de mist per ding), en daar zat
   volgens het profiel van 17 okt het meeste van de tijd ver uitgezoomd (`snelheid.md`, "Waar de tijd nu zit").
3. **Daarna de rest**: de textuurstapel strakker inpakken (E2), en de twee keuzes die je ziet (E3 mipmaps ver
   uitgezoomd, E4 afronden op 50%), eerst met een proefplaat.

WebGL2 draait overal waar het spel nu draait; zonder WebGL2 (of vanaf `file://` in een browser) blijft de weg over het
2D-doek. Niet gemeten: Firefox, en een zwakke machine zoals de Steam Deck; de proef kan daar zo open.

De proef blijft staan: hij meet na elke stap in `js/gl.js` hoe ver we van de eigen WebGL2-tekenaar af zitten.
