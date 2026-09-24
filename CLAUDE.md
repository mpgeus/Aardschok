# CLAUDE.md

Aardschok (werktitel, past niet meer): een spel dat Marcel en Claude samen bouwen, met als doel het
uiteindelijk te verkopen (Steam eerst, als los programma verpakt). **Sinds 23 sep 2026 een ander
spel:** een bouw- en beheerspel in isometrisch beeld, met politiek en avontuur erin. Je bent de
schout van een dorp onder een verwarde heer die alleen geld ziet. Je breidt het dorp uit tot een
stad, bestuurt het met keuren, en maakt je aan het eind van de heer los, met stadsrechten of een
opstand. Zie "Het spel in het kort" hieronder, en `ontwerp/spel.md`.

Tot 23 sep was het De laatste klim: een tovenaar van 84 met zijn leeftijd als levensbalk, in een
toren. Marcel vond het doel niet goed genoeg. De kunst en de techniek eronder blijven: het
isometrische beeld (Mystic Towers als voorbeeld), de HD-pixel art uit code, en een naadloze
overgang van rondlopen naar een gevecht in beurten op tegels (Fallout, Jagged Alliance 2). De code
van het oude spel (toren, spreuken, leeftijd, tutorial) staat er nog tot hij eruit gaat; zie de
werklijst.

Code, commentaar en spelteksten zijn Nederlands, zoals in Marcels Planner.

## Kennis over het spel: lees alleen wat je nodig hebt

Dit bestand wordt elke sessie gelezen en blijft daarom kort. Het houdt de kaart, de kernregel en
de afspraken bij. Het ontwerp staat in `ontwerp/`, één bestand per onderwerp. Bovenaan staat wat
besloten is (met datum en waarom), onderaan wat nog open is. Lees bij een taak alleen het bestand
dat erover gaat.

Komt Marcel met een idee of besluit, schrijf het dan meteen in het juiste bestand, niet alleen in
het gesprek; wat alleen in een gesprek staat, raakt kwijt. Laat groot zoek- en leeswerk aan een
agent over, zodat alleen de samenvatting in het gesprek komt.

- **`ontwerp/werklijst.md`: wat we doen, in welke volgorde. Begin een sessie hier.** Lees de stand
  bovenaan en zeg Marcel in een paar regels waar we zijn. Werk de stand bij aan het eind van de
  sessie.
- **`ontwerp/spel.md`: het spel.** De schout, de heer en de inner, keuren en politiek, avontuur,
  en wat nog open is.
- `ontwerp/beeld.md`: de beeldstijl (HD-pixel art), maten, palet, en het ontwerpcanvas.
- `ontwerp/kaarten.md`: van Tiled naar het spel, en hoe hoogte gaat werken.
- `ontwerp/wereld.md`: de plekken en mensen van het oude spel (erf, bos, dorp); het dorp en zijn
  mensen zijn nog bruikbaar.
- `ontwerp/verpakken.md`: van map met bestanden naar programma op Steam, en wanneer er wél een
  bouwstap komt.
- Van het oude spel, alleen nog als bron: `ontwerp/verhaal.md` (met de vijf rondes ideeën van
  23 sep die tot het nieuwe spel leidden), `ontwerp/toren.md` en `ontwerp/spreuken.md`.

## Git

- Opslagplaats: https://github.com/mpgeus/Aardschok. Werk rechtstreeks op `main`.
- Een commit per onderwerp, met een Nederlands bericht dat ook het waarom vertelt.
- Pushen alleen als Marcel erom vraagt ("push it"); dat is voor hem een aparte stap. En alleen als
  `npm test` groen is: op 22 sep ging er een falende toets mee omdat de opdracht de uitslag wel
  toonde maar de push niet tegenhield (`npm test && git push`).

## Draaien en testen

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules.
  Dat is een bewuste keuze. Modules werken niet vanaf `file://`, en er is geen bouwstap nodig.
- `npm start` start `server.cjs` op poort 8123 (geen afhankelijkheden) en drukt meteen af waar
  alles zit. `.claude/launch.json` heeft dezelfde server onder de naam `aardschok`. Het
  browserpaneel kan een los bestand wel tonen maar niet bedienen, vandaar deze server.
  - het spel: `http://localhost:8123/`
  - **het gereedschap: `http://localhost:8123/gereedschap/`** — een bladzijde die naar alle drie
    wijst. De belangrijkste is `gereedschap/wereld.html`: daar wordt het spel gemaakt.
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
  gesprek zelf was toen 400.000 tokens groot, en dat gaat bij elke stap mee. Hard of zacht gaan
  maakt Marcel niet uit: de week is even groot, of hij nu vandaag of vrijdag op is. Het gaat erom
  dat er niets verloren gaat. Vraag daarom het verbruik op (`get_usage`) voordat je een zware agent
  start, zodat hij niet halverwege tegen de grens loopt. Begin na een groot stuk werk een nieuwe
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
- `js/quests.js`: de quests en de raakpunten als gegevens (nu nog leeg, met de vorm erboven);
  `js/quest.js`: de regels erachter, zonder scherm en dus te toetsen — fasen en wegen
  (`T.zetQuest`, `T.neemWeg`, `T.werkQuestsBij`), goud (`T.geefGoud`), de haken waarmee een
  gesprek erop let (`T.questVoorwaarde`, `T.questGevolg`), voorwerpen die aan een quest hangen,
  en `T.keurQuests`, dat de toets van drie antwoorden nakijkt.
- `js/dialoog.js`, `js/ui.js` (alle html over het beeld), `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera).
- `js/mensen.js`: **wie de mensen van het dorp zijn, op één plek.** `T.MENSEN.<id>` zegt hoe hij
  heet, hoe snel hij loopt, hoe ver hij dwaalt, welk gesprek hij voert en welk vel hij krijgt —
  zijn eigen (zijn id is de naam van het vel), een geleend vel (`vel: 'wim'`) of dat van een
  gewone dorpeling (`zaad: 14`). De kaart zegt alleen nog wáár hij staat:
  `{ x, y, wie: 'koster' }`. Dat is er gekomen omdat het er honderd kunnen worden (Marcel,
  22 sep): een mens stond over vier plekken verdeeld en niets verbond ze, dus kon dezelfde bakker
  op twee plekken staan zonder dat iets klaagde. `T.naamVanMens`, `T.gesprekVanMens`,
  `T.maakDorpeling` en `T.maakMens` zijn de vragen eromheen.
  **Wie geen naam hoeft te hebben, staat er niet in:** `{ x, y, zaad: 7 }` is menigte.
  **`T.WEZENS` gaat over wat een wezen ís** — wat vecht, wat een leeftijd draagt, wat in code
  wordt neergezet — en een dorpeling is dat niet. Daar staan alleen nog de held, Wim, de meester
  en de monsters; de veertien dorpelingen die er met veertien keer dezelfde regel in stonden, zijn
  op 22 sep naar `mensen.js` verhuisd. Een mens met `wezen: 'wim'` leent er nog wel een.
- `js/akkers.js`: **alleen het gehucht** (`?kaart=gehucht`, `ontwerp/spel.md`): welk stadium een
  akker heeft op welke dag (`T.AKKER_STADIA`, één tabel, `T.akkerStadium`), het windbeeld per
  tegel (`T.windBeeld`) en zijn vaste variant (`T.akkerVariant`), waar een boer in het
  groeiseizoen dwaalt (`T.wandelAnker`, anders gewoon bij zijn huis) en de oogst zelf, tegel voor
  tegel (`T.werkOogstBij`, met een vangnet: haalt hij het seizoen niet, dan wordt bij de volgende
  ploegtijd toch de hele akker in één keer "gemaaid"). `js/tekenen.js` tekent ermee (achterlaag,
  wezen, voorlaag, zodat iemand tot zijn middel in het graan staat); `js/kaart.js` koppelt een
  boer aan zijn akker(s) via `huis`, dezelfde id op de boer als op de akker.
- **Het nieuwe spel (het gehucht), verder:** `js/tijd.js` (de kalender met oude maandnamen, eigen
  klok naast `S.tijd`, snelheid), `js/voorraad.js` (`S.voorraad`; alles verandert via
  `T.wijzigVoorraad`, zoals vroeger de jaren via `T.verouder`), `js/gebouwen.js` (`T.GEBOUWEN`: 45
  soorten op één plek, zoals `T.MENSEN`; bevolking, woonruimte, handen, productie per dag,
  `T.plaatsGebouw`, bouwfases via `T.bouwFaseIndex`), `js/behoeften.js` (tevredenheid uit eten,
  brandhout en een kerk; de winter; een huis dat doorgroeit), en `js/hud.js` (de balk en het
  bouwmenu onder `B`, alleen met `?kaart=gehucht` of `?hud`). Het begin zonder tutorial is
  `T.beginOpKaart` (`js/gebied.js`); de kaart komt uit `gereedschap/tiled/maak-gehucht.cjs`, de
  bouwfases uit `gereedschap/pixelart/bouwfasen.cjs` (`tegels/bouwfasen.png` + `.json`). Getallen
  om bij te stellen staan telkens bovenaan in één blok (`T.GEBOUWEN_INSTELLINGEN`,
  `T.BEHOEFTEN_INSTELLINGEN`, `T.AKKER_STADIA`, `T.GRAAN_PER_TEGEL`).
- Wiens gesprek een wezen voert, vraag je aan `T.gesprekIdVan(e)` (`js/gesprek.js`): zijn `gesprek`
  als hij er een heeft, anders zijn soort. Zo delen honderd figuranten één soort (`dorpeling`)
  zonder alle honderd hetzelfde te zeggen.
- `gereedschap/pixelart/`: de beelden komen uit code. Figuren en voorwerpen zijn kleine
  3D-modellen die uit acht richtingen tot pixel art worden gerenderd; zie de README daar.
  `naar-spel.cjs` zet er `beelden/` uit klaar voor het spel.
- Het spel tekent met sprites zodra `beelden/` er is, en anders met vlakken. Wat de kunst niet
  dekt (raster, bereik, richtlijn, zwevende tekst, spreukeffecten, de pilaar) blijft altijd
  vlakken. `Toren.debug.vlakken = true` zet alles terug naar vlakken, om te vergelijken.

## Het spel in het kort

Gekozen door Marcel op 23 sep 2026; het ontwerp staat in `ontwerp/spel.md`.

- Je bent de **schout**, een poppetje dat door het dorp loopt, geen hand van bovenaf. Je breidt
  het dorp uit en bestuurt het met **keuren** (regels), samen met de schepenen.
- De **heer** is verward en ziet alleen geld. Levert het dorp te weinig, dan straft hij: in het
  dorp, jou zelf, met hogere eisen, en met soldaten. Zijn **inner** komt kijken, en wat je opzij
  zet, moet uit zijn zicht.
- Het dorp groeit tot een stad met boeren, winkels, een markt en handel. Het zit vol **groepen**
  met eigen belangen (de politiek) en mensen met een verhaal (het avontuur).
- Vrij word je door **stadsrechten** te kopen of door een **opstand**, een gevecht in beurten op
  dezelfde kaart. Dan word je burgemeester.
- De kern zoals Claude hem voorstelt, nog te toetsen met een proefje: **rijk worden en arm
  lijken.**
- Toon: zwarte satire. De heer is lachwekkend, zijn straffen niet (voorstel).

De regels van het oude spel (de leeftijd als levensbalk, `T.verouder`, meesterschap, de toetsen
voor spreuken) staan in `git show 0eb8269:CLAUDE.md`, voor wie aan die code komt voordat hij weg is.

## Afspraken in de code

Uit het oude spel; ze gelden voor de code zoals die er nu staat. Het raster en de overgang naar een
gevecht gaan mee naar het nieuwe spel, de spreuken niet.

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
`Toren.debug.quest('bakker', 'terug')` zet een quest in een fase zonder hem te spelen ('uit' haalt
hem weg, beloning en al); zonder fase zegt hij waar hij staat.
`await Toren.debug.schermafdruk('naam')` bewaart het doek als PNG in
`gereedschap/pixelart/uit/schermen/` (via de server, zonder de html-balken): zo laat je Marcel een
blik op het spel zien zonder de afbeelding door je eigen gesprek te halen. In het gehucht:
`Toren.debug.kalender(dag, snelheid)` springt door het jaar, `Toren.debug.bouw('huis', x, y)` bouwt.

Drie bladzijden gereedschap draaien op dezelfde server, en alle drie gebruiken ze de regels uit
`js/` zelf, nooit een eigen kopie:

- `gereedschap/gesprekken.html` voor de gesprekken en `gereedschap/quests.html` voor de quests
  (fasen, wegen, het dorp per fase, en de controle die de toets van drie antwoorden nakijkt).
  **In de gespreksschrijver kijk je door één situatie tegelijk** (22 sep): bovenin staan de
  situaties, je klikt er een, en het gesprek wordt getekend zoals het dán loopt — één zin per
  knoop, alleen de antwoorden die je dan kunt geven, ingesprongen zoals een gesprek loopt. Wat in
  die situatie niet klinkt, zakt naar onderen met de situatie erachter waarin het wél klinkt. Dat
  is er gekomen omdat het scherm de gegevens liet zien en niet het gesprek: Wims vijf versies van
  één zin stonden alle vijf onder elkaar, alsof hij ze achter elkaar zei.
  Een situatie staat bij de persoon (`situaties` in `js/gesprekken.js`), is geschreven in dezelfde
  woorden als een voorwaarde, en het spel leest hem nooit. **De fasen van een quest zíjn
  situaties** en staan er vanzelf bij bij wie hem geeft; de quest staat daarom op dezelfde
  bladzijde, met erbij welk antwoord welke weg neemt. `test/situaties.test.cjs` bewaakt dat elke
  zin met een voorwaarde ergens wint. Boven het gesprek klapt een **kaartje** open: de vorm van
  het gesprek in deze situatie, vanzelf neergelegd, klikken springt naar de tekst — een kaartje
  erbij en geen canvas in plaats van, want slepen is een tweede baan en een canvas zet alle
  voorwaarden weer tegelijk in beeld. In de kopbalk **zoek je over alle mensen heen**; klikken
  brengt je naar een situatie waarin die zin ook echt klinkt. Onderaan de personenlijst staat
  **het draaiboek van de tutorial** (`T.TUTORIAL_TEKST`): geen gesprek maar de momenten van de
  openingsscène, in de volgorde die uit `js/tutorial.js` zelf gelezen wordt. Zie
  `ontwerp/verhaal.md`.
  Allebei starten ze zichzelf niet meer: de bladzijde die ze gebruikt roept
  `T.gesprekkenTool.start()` of `T.questsTool.start()` aan, met `.kies(...)` en `.begin(...)` /
  `.beginVoor(...)` erbij. Zo zet `wereld.html` dezelfde bewerkers in een paneel, zonder een
  tweede te bouwen — want twee bewerkers voor hetzelfde bestand lopen vroeg of laat uit elkaar.
- **Een bewerker schrijft alleen het blok dat hij kent.** `gereedschap/bronblok.js` knipt een
  bestand in kop, blok en staart (`T.bronBlok(tekst, 'T.GESPREKKEN')`); de bewerker regenereert
  alleen het blok, en kop en staart gaan letterlijk mee terug. Dat is geen netheid maar noodzaak:
  vóór 22 sep schreef de gespreksbewerker `js/gesprekken.js` helemaal opnieuw, kende
  `T.TUTORIAL_TEKST` niet, en wiste één keer opslaan dus het hele draaiboek van de tutorial. Wie
  een bewerker bouwt of uitbreidt, houdt zich hieraan; `test/bronblok.test.cjs` bewaakt het op de
  echte bestanden. Commentaar in het bestand hangt aan wat eronder staat — een persoon, een knoop,
  één regel tekst, één antwoord — en komt bij het opslaan terug op zijn plek.
- `gereedschap/wereld.html` voor de kaarten, en dat is de bladzijde waar het spel gemaakt wordt.
  **Tiled tekent alleen nog de grond; alles wat betekenis heeft ontstaat en verandert hier**
  (Marcel, 22 sep; `ontwerp/kaarten.md`). Het tekent de kaart met `js/tekenen.js` zelf, kent lagen
  die aan en uit kunnen (begaanbaar, mensen met hun dwaalstraal, quest en raakpunten, uitgangen),
  zegt bij een klik wat het spel denkt dat daar is, en keurt de kaart. Ver uitgezoomd tekent het
  zijn eigen plattegrond, want de tekencode van het spel is er niet op gebouwd.
  - Het leest de `.tmj` rechtstreeks van schijf: opslaan in Tiled, verversen, zien.
  - **Het schrijft alleen `kaarten/<naam>.betekenis.json`** — mensen, dorpelingen, deuren,
    geheime doorgangen, aansluitingen en voorwerpen met hun `raak=` en `quest=`. Eén ding per
    regel, zodat een verplaatsing ook één regel in `git diff` is. Tiled komt in dat bestand
    nooit, dus er valt niets mee te botsen; tegen een tweede open blad stuurt het mee hoe het
    bestand eruitzag toen het het las. Na het opslaan bundelt het zelf (`npm run kaarten`), zodat
    het spel het meteen ziet.
  - Een aansluiting leg je in één handeling: klik de tegel waar je vertrekt, het blad springt
    naar de andere kaart, klik waar je aankomt, en beide kanten staan er — `komt` erbij bedacht.
  - **Klik een poppetje en zijn gesprek én zijn quest staan ernaast** (dubbelklik, of de knoppen
    in het tegelpaneel): een breed paneel over de kaart met twee tabbladen, en daarin de
    volledige bewerkers uit `gesprekken-tool.js` en `quests-tool.js` — knopen, regels, fasen,
    wegen, voorwaarden, gevolgen, de proef en de controle. Geeft iemand nog geen gesprek of
    quest, dan biedt het paneel aan er een te beginnen, met hem als gever. Aanwijzen gaat op het
    lijf van een wezen, niet op zijn voeten, met dezelfde maten als `zoekDoel` in `js/main.js`.
    Esc sluit het paneel.
  - Een questvoorwerp hang je aan een fase met twee keuzelijsten (quest en fase), niet door
    `bakker:zoeken` te typen; de kaart springt meteen naar die fase, zodat je ziet wat je legt.
  - De controle staat in `gereedschap/keuring.js` (`T.keurKaart` en `T.keurDekking`, zonder scherm
    en dus getoetst): wat op de kaart staat en niet kan, en omgekeerd wat het spel vraagt en
    nergens staat. Die tweede zegt precies wat er nog neergezet moet worden.

Twee dingen die bij het mikken misgaan:

- de camera glijdt mee, dus reken de schermpositie pas uit als hij stilstaat (een seconde
  `stap` na elke verplaatsing), anders klik je een tegel ernaast;
- wat vooraan staat, vangt de muis. Mik op het lijf van een wezen (zo'n 16 pixels boven zijn
  tegel), niet op zijn voeten, anders klik je de kist die ervoor staat.
