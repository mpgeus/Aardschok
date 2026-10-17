# De renderproef: js/gl.js tegen PixiJS v8 (17 okt 2026)

Marcel, 17 okt: onderzoek of PixiJS v8 voor het spel een betere keuze is dan onze eigen laag op WebGL1 (`js/gl.js`),
met een losse proef die dezelfde scène met beide tekent, zonder de code van het spel te veranderen, en een advies:
houden, deels verbeteren, of overstappen. Nog niets omzetten. Hoort bij vraag 178 (ver uitgezoomd sneller,
`ontwerp/snelheid.md`, E).

Gemeten op `main` op `aa2fe18f` (`js/gl.js` zoals in git), 17 okt rond 23:20, op de pc van Marcel (GTX 1080 Ti,
Ryzen 7 5800X), in Chromium 156 met de videokaart en in de Electron van de proefversie (44.5.1). Opnieuw: `npm start`,
dan `node gereedschap/pixiproef/meting.cjs` (een minuut of acht; hij wacht zelf tot de machine rustig is; `--snel` voor
één blok). Kijken: `http://localhost:8123/gereedschap/pixiproef/` (slepen schuift, het wiel zoomt, de knoppen bovenaan
wisselen tekenaar, zoom, weergave van de gebouwen, schaduw en licht; de meter staat eronder). Ook in Firefox, dat is hier
niet gemeten.

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
- **De teller** (`teller.js`) telt voor elk WebGL-doek hetzelfde: opdrachten aan de kaart, wat erheen gaat, en hoeveel
  textuurgeheugen er vastligt. **De meting** (`meting.cjs`): 1920×1080, elk beeld met één pixel teruggelezen (dan heeft
  de kaart het werk ook gedaan); alle varianten tegelijk open en per zoom vier blokjes van 120 beelden om en om, met
  vooraf wachten tot de machine rustig is. Dan per tekenaar in een verse bladzijde het geheugen, de wissel naar plat en
  de echte beelden per seconde; het beeld pixel voor pixel; `file://` in Chromium; en Electron met `loadFile`, zoals de
  Steam-versie (`electron/main.js`). Alles in `meting.json`.

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
- **Geheugen.** Op de kaart: wij 163 / 178 / 193 MB, Pixi 85 / 112 / 130 MB. Een blad van `js/gl.js` is 4096 bij 4096
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

## Advies: houden, en gedeeltelijk verbeteren

**Niet overstappen.** Pixi wint alleen in de laag die het minst kost, en weinig: ver uitgezoomd 0,8 ms van de 4,5 die
deze scène hier kost, en alleen als `js/tekenen.js` een boom van sprites wordt die meeleeft met `S`, een herschrijving
van het grootste bestand van het spel. Waar het spel ver uitgezoomd zijn tijd kwijt is (na A1 en A2 zo'n 19 ms per beeld,
het meeste in `js/tekenen.js` per ding), doet Pixi niets aan. De grote winst blijft B1 tot B4 uit `snelheid.md` (een
dieptebuffer en vaste buffers per stuk land), en die heeft Pixi ook niet: zijn sprites kennen geen dieptebuffer, dus dat
wordt daar ook eigen werk, op een laag die we niet zelf bijhouden. En onder last, de gewone toestand op een zwakke
machine, was Pixi hier juist trager.

**Wel overnemen wat de proef liet zien**, klein en zonder verschil in beeld tenzij gezegd:

1. **`drawImage` zonder afval**: geen lijst per aanroep (`...a`), geen rijtjes per schaduw, de textuur en de plek op het
   blad bij het plaatje onthouden (zoals `v.getekend`). Dat is het verschil met Pixi ver uitgezoomd, en het haalt de
   uitschieters van het opruimen weg (17 tegen 10 ms). Klein werk in `js/gl.js`.
2. **Niet opnieuw wat stilstaat**: Pixi was stil 0,5 à 0,8 ms sneller dan bewegend; bij ons is dat B2 (vaste buffers per
   stuk), dat al op de lijst staat.
3. **Bladen die groeien** in plaats van meteen 64 MB: hier 60 MB minder op de kaart, wat telt op een Steam Deck of een
   laptop met de kaart in de processor.
4. **Mipmaps ver uitgezoomd** (je ziet het: rustiger, zachter), als keuze onder *Display*, met een randje om elk
   plaatje op het blad. Eerst een proefplaat voor Marcel.
5. **Op hele schermpixels afronden** op 50% (je ziet het: een vast beeld bij het schuiven in plaats van wisselende
   halve pixels). Ook eerst kijken.

De proef blijft staan om later opnieuw te kijken, bijvoorbeeld als WebGPU ooit telt (Pixi 8 heeft het, Electron en de
Steam Deck nog niet zeker), en hij meet na elke stap in `js/gl.js` hoe ver we van Pixi af zitten.
