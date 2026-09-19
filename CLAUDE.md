# CLAUDE.md

Aardschok (werktitel): een spel dat Marcel en Claude samen bouwen, met als doel het uiteindelijk te
verkopen (Steam eerst, als los programma verpakt). Het idee: het isometrische beeld van Mystic
Towers, de opbouw van een avonturenspel, en een naadloze overgang van rondlopen naar een
gevecht in beurten op tegels, zonder apart gevechtsscherm. Referenties voor die overgang:
Fallout 1 en 2, Jagged Alliance 2, Shadowrun Returns.

Code, commentaar en spelteksten zijn Nederlands, zoals in Marcels Planner.

## Kennis over het spel: lees alleen wat je nodig hebt

Dit bestand wordt elke sessie gelezen en blijft daarom kort. Het houdt de kaart, de kernregel en
de afspraken bij. Het ontwerp staat in `ontwerp/`, één bestand per onderwerp. Bovenaan staat wat
besloten is (met datum en waarom), onderaan wat nog open is. Lees bij een taak alleen het bestand
dat erover gaat.

Komt Marcel met een idee of besluit, schrijf het dan meteen in het juiste bestand, niet alleen in
het gesprek; wat alleen in een gesprek staat, raakt kwijt. Laat groot zoek- en leeswerk aan een
agent over, zodat alleen de samenvatting in het gesprek komt.

- `ontwerp/verhaal.md`: het verhaal, de personen, de toon, en wat er boven in de toren zit.
- `ontwerp/wereld.md`: het dorp, het bos, de toren van de oude meester; goud, quests, upgrades,
  staf en uitrusting.
- `ontwerp/spreuken.md`: de spreuken, en hoe de tovenaar met de jaren meer kan.
- `ontwerp/beeld.md`: de beeldstijl (HD-pixel art), maten, palet, en het ontwerpcanvas.

## Git

- Opslagplaats: https://github.com/mpgeus/Aardschok. Werk rechtstreeks op `main`.
- Een commit per onderwerp, met een Nederlands bericht dat ook het waarom vertelt.
- Pushen alleen als Marcel erom vraagt ("push it"); dat is voor hem een aparte stap.

## Draaien en testen

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules.
  Dat is een bewuste keuze. Modules werken niet vanaf `file://`, en er is geen bouwstap nodig.
- `npm start` start `server.cjs` op poort 8123 (geen afhankelijkheden). `.claude/launch.json`
  heeft dezelfde server onder de naam `aardschok`. Het browserpaneel kan een los bestand wel
  tonen maar niet bedienen, vandaar deze server.
- `npm test` draait `test/*.test.cjs` met `node --test`: de regels zonder scherm.
- `npm run pixelart` rendert alle HD-pixel art naar `gereedschap/pixelart/uit/` (niet in git).

## Opbouw

Alles hangt aan één naamruimte, `globalThis.Toren` (in de code `T`), zodat hetzelfde bestand in
de browser en in de Node-tests werkt. De volgorde van de scripts in `index.html` telt.

- `js/wereld.js`: plattegrond, kamers, deuren, voorwerpen en wezens, en de vragen over de
  wereld: `isBegaanbaar`, `isVast`, `raakt`, `zicht`/`zichtTussen`, `isZichtbaar`.
- `js/pad.js`: A* (`zoekPad`, acht richtingen, schuin kost ook 1, geen hoeken afsnijden) en
  `bereik` (alle tegels binnen N stappen).
- `js/iso.js`: de isometrische projectie (tegel 64×32) en tekenhulpen (`ruit`, `blok`).
- `js/anim.js`: beweging en effecten. `T.anim.*` geeft beloftes, zodat een beurt als gewone
  code met `await` leest. Wachten gaat in speltijd (`S.tijd`), niet met `setTimeout`.
- `js/verkennen.js`: rondlopen, klikhandelingen, dwalende monsters, ontdekt worden.
- `js/gevecht.js`: de overgang, beurtvolgorde, actiepunten, handelingen, monster-AI
  (`planMonsterBeurt`, los van het scherm en dus te toetsen).
- `js/dialoog.js`, `js/ui.js` (alle html over het beeld), `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera).
- `gereedschap/pixelart/`: de beelden komen uit code. Figuren en voorwerpen zijn kleine
  3D-modellen die uit acht richtingen tot pixel art worden gerenderd; zie de README daar. Het
  spel tekent zelf nog met vlakken; de sprites zitten er nog niet in.

## De kernregel: De laatste klim

Gekozen door Marcel op 19 sep 2026, nadat het eerste proefje "dertien in een dozijn" voelde. De
held is een tovenaar van 84, en zijn leeftijd is zijn levensbalk (`js/leeftijd.js`, geteld in
hele maanden, nooit in kommagetallen). Elke vuurschicht kost een jaar, elke klap van een monster
een paar maanden (`aanval.maanden`), en op zijn honderdste is het voorbij. Genezen bestaat niet;
de fontein maakt één keer twee jaar jonger. Hoe ouder, hoe minder actiepunten (8, vanaf 90 jaar
7, vanaf 95 jaar 6) en hoe sterker de magie (+1 schade per vijf jaar boven de 80). Slaan met de
staf kost geen jaren. Die afweging, jaren tegen veiligheid, is het spel: een gevecht dat je
vermijdt, kost niets, en daardoor hebben het avontuur en het gevecht elkaar nodig. Monsters
houden gewone levenspunten. Aan het eind telt hoe oud je boven aankomt.

- Alle jaren lopen via `T.verouder` (gevecht.js). Die toont het getal boven de held, werkt de
  balk en de beurtvolgorde bij, meldt een nieuwe actiepuntengrens, en laat de held sterven op
  100. Een tweede weg naar `held.leeftijd` mist er vroeg of laat één van.
- De vuurschicht raakt eerst en kost daarna zijn jaar: wie zo zijn honderdste haalt, velt met
  zijn laatste spreuk nog het monster.
- Sluipen (`S`, alleen buiten een gevecht) is het eerste middel om een gevecht te ontlopen: half
  zo snel, en monsters zien je pas van `T.SLUIP_ZICHT` (2) tegels dichterbij. Elke nieuwe manier
  om een gevecht te vermijden (praten, afleiden, een val) versterkt de kernregel; een nieuwe
  manier om te vechten zonder jaren te betalen, verzwakt hem.

## Het verhaal in het kort

Veertig jaar geleden sloot de tovenaar iets op, boven in de toren. Vannacht brak de aardschok het
zegel. Wim, zijn vroegere leerling, wachtte al die tijd. De toon: weemoedig met een knipoog,
nooit grappig ten koste van de ernst van de klim. Meer, en wat nog open is, staat in
`ontwerp/verhaal.md`.

## Afspraken die het idee dragen

- Eén raster voor rondlopen én vechten. Een wezen heeft een vloeiende positie (`x`, `y`) en
  een tegel (`tx`, `ty`); bezetting vraag je altijd aan `tx`/`ty`. Bij het begin van een
  gevecht maakt iedereen zijn lopende stap af (`modus: 'overgang'`), en pas als niemand meer
  onderweg is begint het gevecht. Dat is wat de overgang naadloos maakt.
- Scherm en klik stellen dezelfde vraag: `handelingVerkennen`/`handelingGevecht` geven
  `{ tekst, kosten, kan, doe }` terug. De tekst bij de muis, het pad op de vloer, de
  actiepunten en de klik komen uit hetzelfde antwoord.
- Een klik op een deur is altijd erheen lopen. Dichtgooien is in een gevecht een eigen knop
  (`3`), die alleen verschijnt naast een open deur. Eerst ging een open deur dicht als je er
  naast stond en erop klikte, en dat is precies wat je niet wilt.
- Monsters openen geen deuren. Kan geen enkel monster de held nog zien of bereiken, dan eindigt
  het gevecht ('kwijt').

## Testen in de browser

`Toren.S` is de spelstaat. `Toren.debug.naarBeeld(x, y)` geeft de schermpositie van een tegel
(css-pixels), `await Toren.debug.stap(seconden)` laat het spel vooruitlopen zonder op beelden te
wachten. Dat is nodig omdat een verborgen browserpaneel maar af en toe een beeld tekent; ook
css-overgangen staan dan vrijwel stil. Het testgereedschap stuurt de spatiebalk niet goed door
(lege `key`), dus test einde beurt met de knop of met een `KeyboardEvent`.
