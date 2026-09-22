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

- **`ontwerp/werklijst.md`: wat we doen, in welke volgorde. Begin een sessie hier.**
- `ontwerp/verhaal.md`: het verhaal, de personen, de toon, en wat er boven in de toren zit.
- `ontwerp/wereld.md`: de plekken. Het erf, het bos, het dorp met zijn mensen, de maten, en de
  bosvijanden.
- `ontwerp/toren.md`: de klim. Het herstel per verdieping, goud en grondstoffen, de staf, en de
  vorm van het spel (vrij en niet lineair, en hoe groot het wordt).
- `ontwerp/kaarten.md`: van Tiled naar het spel, en hoe hoogte gaat werken.
- `ontwerp/spreuken.md`: de spreuken, en hoe de tovenaar met de jaren meer kan.
- `ontwerp/verpakken.md`: van map met bestanden naar programma op Steam, en wanneer er wél een
  bouwstap komt.
- `ontwerp/beeld.md`: de beeldstijl (HD-pixel art), maten, palet, en het ontwerpcanvas.

## Git

- Opslagplaats: https://github.com/mpgeus/Aardschok. Werk rechtstreeks op `main`.
- Een commit per onderwerp, met een Nederlands bericht dat ook het waarom vertelt.
- Pushen alleen als Marcel erom vraagt ("push it"); dat is voor hem een aparte stap. En alleen als
  `npm test` groen is: op 22 sep ging er een falende toets mee omdat de opdracht de uitslag wel
  toonde maar de push niet tegenhield (`npm test && git push`).

## Draaien en testen

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules.
  Dat is een bewuste keuze. Modules werken niet vanaf `file://`, en er is geen bouwstap nodig.
- `npm start` start `server.cjs` op poort 8123 (geen afhankelijkheden). `.claude/launch.json`
  heeft dezelfde server onder de naam `aardschok`. Het browserpaneel kan een los bestand wel
  tonen maar niet bedienen, vandaar deze server.
- `npm test` draait `test/*.test.cjs` met `node --test`: de regels zonder scherm.
- `npm run pixelart` rendert alle HD-pixel art naar `gereedschap/pixelart/uit/` (niet in git).
- `npm run pixelart:spel` zet daaruit alleen wat het spel tekent in `beelden/` (wél in git,
  want het spel heeft het nodig als het draait). Draai het opnieuw als de kunst verandert.

## Zuinig werken met agents

Gemeten op 20 sep 2026: de agents waren samen ruim 2,5 miljoen tekens, het gesprek zelf 284.000.
De agents zijn dus zo'n negentig procent. Het knelpunt is de vijfuursgrens, niet de week.

De duurste agent deed 84 aanroepen voor 740.000 tekens, bijna 9.000 per stap: een agent stuurt
bij elke stap zijn hele eigen gesprek opnieuw mee, dus de kosten lopen kwadratisch op met hoe
lang hij leeft. Daaruit volgt, van meest naar minst effect:

- **Laat een agent kort leven.** Een verse agent met een korte opdracht die naar `ontwerp/`
  wijst, is goedkoper dan dezelfde agent voor de vijfde keer terugsturen met commentaar. Alleen
  doorgaan als hij iets weet dat nergens staat.
- **Lees niet het hele bestand.** `dorp.cjs` en `kern.cjs` zijn duizenden regels; zoek de twintig
  regels die je nodig hebt.
- **Beoordeel op uitsneden.** Een plaat van 3200×1800 kost elke keer dat iemand hem bekijkt. Voor
  "is die steen nu grijs" is 600×400 genoeg.
- **Sonnet voor uitvoerend werk, Opus voor oordeel.**
- **Kijk eerst of het er al is.** Een agent kreeg de opdracht dorpelingen te laten dwalen, en
  vond het al gebouwd; hij schreef er toen toetsen omheen. Nuttig, maar een goedkope zoekopdracht
  vooraf had dat ook laten zien.
- **Niet meer dan twee agents tegelijk die renderen.**
- **Een kleine precieze klus doe je zelf.** Een kleur, één functie, een regel tekst: een agent
  kost dan meer aan opstarten dan het werk zelf.
- **Een opdracht aan een agent verwijst naar deze paragraaf** in plaats van hem te herhalen, en
  naar één punt uit `ontwerp/werklijst.md` plus het ene ontwerpbestand dat erbij hoort.
- **Nooit `git stash` of `git checkout` op de werkmap** als er meer agents tegelijk werken: dat zet
  hun werk opzij of gooit het weg. Wie wil meten hoe het vóór een wijziging was, maakt een losse
  kopie met `git worktree add`.
- **De werklijst blijft kort:** onder "Af" staan alleen de laatste twee weken; ouder staat in
  `git log`.
- **Kijk naar de meter, ook naar de week.** Op 22 sep stond de week op 70%, met nog bijna vier
  dagen te gaan. Dat kwam na een dag met vijf agents van 300.000 tot 750.000 tokens elk. Het
  gesprek zelf was toen 400.000 tokens groot, en dat gaat bij elke stap mee. Vraag het verbruik
  op (`get_usage`) voordat je een zware agent start. Begin na een groot stuk werk een nieuwe
  sessie; de werklijst draagt alles over.

## Opbouw

Alles hangt aan één naamruimte, `globalThis.Toren` (in de code `T`), zodat hetzelfde bestand in
de browser en in de Node-tests werkt. De volgorde van de scripts in `index.html` telt.

- `js/wereld.js`: plattegrond, kamers, deuren, voorwerpen en wezens, en de vragen over de
  wereld: `isBegaanbaar`, `isVast`, `raakt`, `zicht`/`zichtTussen`, `isZichtbaar`.
- `js/pad.js`: A* (`zoekPad`, acht richtingen, schuin kost ook 1, geen hoeken afsnijden) en
  `bereik` (alle tegels binnen N stappen).
- `js/spreuken.js`: de spreuken als regels, zonder scherm en dus te toetsen: `T.SPREUKEN`
  (kring, toets, kosten, en per trede wat hij erbij krijgt), de treden van meesterschap
  (`T.spreuk`, `T.telGebruik`, `T.voortgang`) en de losse rekensommen eromheen: `T.duwPad`,
  `T.windstootDuwen`, `T.volgendOpLijn` (doorboren), `T.lokt`/`T.lokPad` (dwaallicht).
- `js/toveren.js`: een spreuk kiezen, richten en uitspreken, in en buiten een gevecht
  (`T.kiesSpreuk`, `T.handelingSpreuk`), de dwaallichten in de wereld (`T.werkLichtenBij`) en
  het meesterschap dat meetelt (`T.oefen`).
- `js/iso.js`: de isometrische projectie (tegel 64×32) en tekenhulpen (`ruit`, `blok`).
- `js/sprites.js`: de pixel art uit `beelden/`. `T.sprites.figuur/tegel/muur/voorwerp` wijzen
  een cel op een vel aan, `T.sprites.houding(S, wezen)` kiest houding, richting en fase uit de
  spelstaat zelf (pad, uitval, flits, dood, en de jaren die erbij komen: dat is toveren), en
  `T.sprites.teken` legt het anker van de cel op het midden van de tegel. Laadt alles met
  `Image`, nooit `getImageData`: anders werkt `file://` niet meer.
- `js/anim.js`: beweging en effecten. `T.anim.*` geeft beloftes, zodat een beurt als gewone
  code met `await` leest. Wachten gaat in speltijd (`S.tijd`), niet met `setTimeout`.
- `js/verkennen.js`: rondlopen, klikhandelingen, dwalende monsters, ontdekt worden.
- `js/gevecht.js`: de overgang, beurtvolgorde, actiepunten, handelingen, monster-AI
  (`planMonsterBeurt`, los van het scherm en dus te toetsen).
- `js/dialoog.js`, `js/ui.js` (alle html over het beeld), `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera).
- `gereedschap/pixelart/`: de beelden komen uit code. Figuren en voorwerpen zijn kleine
  3D-modellen die uit acht richtingen tot pixel art worden gerenderd; zie de README daar.
  `naar-spel.cjs` zet er `beelden/` uit klaar voor het spel.
- Het spel tekent met sprites zodra `beelden/` er is, en anders met vlakken. Wat de kunst niet
  dekt (raster, bereik, richtlijn, zwevende tekst, spreukeffecten, de pilaar) blijft altijd
  vlakken. `Toren.debug.vlakken = true` zet alles terug naar vlakken, om te vergelijken.

## De kernregel: De laatste klim

Gekozen door Marcel op 19 sep 2026, nadat het eerste proefje "dertien in een dozijn" voelde. De
held is een tovenaar van 84, en zijn leeftijd is zijn levensbalk (`js/leeftijd.js`, geteld in
hele maanden, nooit in kommagetallen). Elke vuurschicht kost een jaar, elke klap van een monster
een paar maanden (`aanval.maanden`), en op zijn honderdste is het voorbij. Genezen bestaat niet,
maar jaren terugkopen kan soms: magische grondstoffen uit de wereld geef je aan de toren óf aan
jezelf, nooit aan allebei. Ze zijn eindig en meestal bewaakt, dus je komt er per saldo altijd op
achteruit en loopt de balk in gevoel één kant op. De fontein maakt één keer twee jaar jonger. Hoe ouder, hoe minder actiepunten (8, vanaf 90 jaar
7, vanaf 95 jaar 6) en hoe sterker de magie (+1 schade per vijf jaar boven de 80). Slaan met de
staf kost geen jaren. Die afweging, jaren tegen veiligheid, is het spel: een gevecht dat je
vermijdt, kost niets, en daardoor hebben het avontuur en het gevecht elkaar nodig. Monsters
houden gewone levenspunten. Aan het eind telt hoe oud je boven aankomt.

- Alle jaren lopen via `T.verouder` (gevecht.js). Die toont het getal boven de held, werkt de
  balk en de beurtvolgorde bij, meldt een nieuwe actiepuntengrens, en laat de held sterven op
  100. Een tweede weg naar `held.leeftijd` mist er vroeg of laat één van.
- De vuurschicht raakt eerst en kost daarna zijn jaar: wie zo zijn honderdste haalt, velt met
  zijn laatste spreuk nog het monster. Elke spreuk houdt die volgorde aan: eerst het effect,
  dan de tijd via `T.verouder`, dan pas telt het meesterschap (`T.oefen`).
- Meesterschap door gebruik (`ontwerp/spreuken.md`): vijf treden (Roestig, en dan na 3, 8, 15 en
  25 keer raak). Een spreuk telt alleen als hij iets doet: raken, een wezen echt duwen, een deur
  dichtgooien, een monster weglokken. Een trede geeft bereik, een extra effect of minder
  actiepunten, maar maakt een spreuk **nooit** goedkoper in jaren; `T.spreuk` zet `maanden`
  daarom altijd terug op de basis. Het meesterschap staat per held (`held.meesterschap`), de
  hoogste open kring in `held.kring` (gaat alleen omhoog, in `T.verouder`, want wie door de
  fontein jonger wordt, vergeet niets).
- De eindstrijd **blokkeert nooit** op leeftijd, hij verandert ervan. Jong aankomen geeft veel
  beurten en dus ruimte om te bewegen en te ontwijken; oud aankomen geeft drie handelingen maar
  spreuken als mokers. Een harde grens zou de speler twintig uur ver onwinbaar kunnen zetten.
- **Waarom 84 en 100.** Honderd is het getal waarbij een mensenleven voelbaar op is; daar hoeft
  niets bij uitgelegd. Vierentachtig is dan "zestien jaar te gaan", en zestien jaar is zestien
  vuurschichten: weinig genoeg om over na te denken, genoeg om een spel mee te vullen. Al het
  andere is daarop geijkt. Zie `ontwerp/spreuken.md` voor wat daar nog aan wringt.
- **Niets is een muur, alles is een prijs.** Een kapotte trap die een machtige tovenaar
  tegenhoudt, is flauw. Hij zweeft erlangs — en dat kost hem twee jaar, drie als de vloer weg is.
  Zo geldt het overal: een dichte deur, een ravijn, een ingestorte gang. Er is altijd een dure weg
  eromheen, en de prijs staat er in jaren bij vóórdat je klikt. Herstellen is dan een investering
  in plaats van een sleutel: één keer goud en grondstoffen, daarna gratis. Zie `ontwerp/toren.md`.
- Sluipen (`S`, alleen buiten een gevecht) is het eerste middel om een gevecht te ontlopen: half
  zo snel, en monsters zien je pas van `T.SLUIP_ZICHT` (2) tegels dichterbij. Elke nieuwe manier
  om een gevecht te vermijden (praten, afleiden, een val) versterkt de kernregel; een nieuwe
  manier om te vechten zonder jaren te betalen, verzwakt hem. Het dwaallicht (een monster
  weglokken) en de windstoot (van afstand een deur dichtgooien) zijn de tweede en derde manier,
  en kosten maar een maand of drie.
- De held loopt trager naarmate hij ouder wordt: `T.loopSnelheid` (2,5 tegels per seconde op zijn
  84e, 2,1 op zijn 92e, 1,8 op zijn 99e). Wie iets wil weten over de snelheid van een wezen,
  vraagt `T.snelheidVan(e)`; monsters houden hun vaste snelheid.

## Het verhaal in het kort

Het spel begint bij de toren van de oude meester, die nog leeft: hij doet zijn moestuin en leert
je toveren, en speelt daarbij met zijn eigen leeftijd. Boven in de toren zit iets dat hij lang
geleden opsloot en door ouderdom vergat; de aardschok maakte het wakker. Hij sterft aan zijn eigen
laatste spreuk, bij zijn moestuin, en jij erft de toren — die op de meeste verdiepingen
onbegaanbaar is en per verdieping hersteld moet worden. Wim, zijn knecht, erf je erbij. De toon:
weemoedig met een knipoog, nooit grappig ten koste van de ernst van de klim. Meer, en wat nog open
is (wat er precies boven zit), staat in `ontwerp/verhaal.md`.

## Afspraken die het idee dragen

- Eén raster voor rondlopen én vechten. Een wezen heeft een vloeiende positie (`x`, `y`) en
  een tegel (`tx`, `ty`); bezetting vraag je altijd aan `tx`/`ty`. Bij het begin van een
  gevecht maakt iedereen zijn lopende stap af (`modus: 'overgang'`), en pas als niemand meer
  onderweg is begint het gevecht. Dat is wat de overgang naadloos maakt.
- Scherm en klik stellen dezelfde vraag: `handelingVerkennen`/`handelingGevecht` geven
  `{ tekst, kosten, kan, doe }` terug. De tekst bij de muis, het pad op de vloer, de
  actiepunten en de klik komen uit hetzelfde antwoord.
- Een klik op een deur is altijd erheen lopen. Dichtgooien is in een gevecht een eigen knop
  (`D`), die alleen verschijnt naast een open deur. Eerst ging een open deur dicht als je er
  naast stond en erop klikte, en dat is precies wat je niet wilt.
- Toetsen: `1` slaan, `2` vuurschicht, `3` dwaallicht, `4` windstoot, `D` deur dicht, `spatie`
  einde beurt, `S` sluipen. De spreuktoetsen werken binnen én buiten een gevecht, want een
  dwaallicht en een windstoot horen juist bij het rondlopen. Een spreuk in de hand verandert wat
  de muis doet: hij richt, en lopen kan pas als je hem weer weglegt met `Esc`, de rechtermuisknop
  of dezelfde toets nog eens. De knoppen onderaan staan in één kolom: de spreukbalk altijd, en
  daarboven schuiven in een gevecht de actiepunten en de knoppen erbij.
- Monsters openen geen deuren. Kan geen enkel monster de held nog zien of bereiken, dan eindigt
  het gevecht ('kwijt').

## Testen in de browser

`Toren.S` is de spelstaat. `Toren.debug.naarBeeld(x, y)` geeft de schermpositie van een tegel
(css-pixels), `await Toren.debug.stap(seconden)` laat het spel vooruitlopen zonder op beelden te
wachten. Dat is nodig omdat een verborgen browserpaneel maar af en toe een beeld tekent; ook
css-overgangen staan dan vrijwel stil. Het testgereedschap stuurt de spatiebalk niet goed door
(lege `key`), dus test einde beurt met de knop of met een `KeyboardEvent`.
`Toren.debug.meesterschap('vuurschicht', 15)` zet het meesterschap van een spreuk (hier op
Meesterlijk), om de treden te proberen zonder ze te verdienen.

Twee dingen die bij het mikken misgaan:

- de camera glijdt mee, dus reken de schermpositie pas uit als hij stilstaat (een seconde
  `stap` na elke verplaatsing), anders klik je een tegel ernaast;
- wat vooraan staat, vangt de muis. Mik op het lijf van een wezen (zo'n 16 pixels boven zijn
  tegel), niet op zijn voeten, anders klik je de kist die ervoor staat.
