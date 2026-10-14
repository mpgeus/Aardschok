# CLAUDE.md

Tithebreaker (de werknaam sinds 11 okt, `ontwerp/commercieel.md`; de map en de opslag heten nog Aardschok): een spel dat Marcel en Claude samen bouwen, om het te verkopen (Steam eerst, als
los programma verpakt; `ontwerp/commercieel.md`). **Sinds 11 okt de economie van The Settlers, met gevechten in beurten**
(vraag 151, `ontwerp/gameloop.md`): je komt met een huifkar en een paar gezinnen op een lege plek op een eiland, je bouwt
alles zelf, van bovenaf, binnen bereik van je plein en je opslag, een ossenkar haalt de grondstoffen op, en je vecht in
beurten op dezelfde tegels (Jagged Alliance 2): eerst om je dorp te verdedigen, dan over het eiland tot het kasteel van de
heer. Je held is de schout: hij vecht en hij praat. **Het doel is de heer verstoten en verslaan** (vraag 126). Het beeld is
isometrisch (Mystic Towers), de HD-pixel art komt uit code, rijk aan details.

Code en commentaar zijn Nederlands, zoals in Marcels Planner. **De spelteksten zijn Engels, zonder Nederlands** (vraag 147;
Marcel, 11 okt: "Nederlands mag je mee stoppen"; de schout heet *reeve*): een zin die de speler ziet, is
`T.t('Engelse zin met {wie}', { wie })` (`js/taal.js`), de haak voor een latere vertaling, en daarna `npm run teksten`;
een zin uit gegevens die een bewerker terugschrijft (de gesprekken), toont `T.tGegevens`. De woorden: `ontwerp/engels.md`.

## Waar de kennis staat: lees alleen wat je nodig hebt

Dit bestand leest elke sessie en elke agent, dus het blijft **onder de 20 KB** (Marcel, 11 okt, vraag 153: het was 153
KB, zo'n 40.000 tokens voor er iets gebeurde; `test/claude.test.cjs` bewaakt het). **Wat een bestand doet, staat in
`ontwerp/code.md`, niet hier**: wie iets bouwt of verandert, werkt zijn stuk daar bij. Hier komt alleen een nieuwe
afspraak of een nieuw principe; wordt de toets rood, dan gaat er iets naar een ontwerpbestand, niet de grens omhoog.

Komt Marcel met een idee of besluit, schrijf het dan meteen in het juiste bestand, niet alleen in het gesprek; wat alleen
in een gesprek staat, raakt kwijt. Laat groot zoek- en leeswerk aan een agent over, zodat alleen de samenvatting in het
gesprek komt.

- **`ontwerp/werklijst.md`: wat we doen, in welke volgorde. Begin een sessie hier.** Sinds 11 okt een nieuwe, korte
  lijst; die van daarvoor (vraag 1 tot 153) staat in `ontwerp/archief/`, en het snoeien in `ontwerp/snoeien.md`. Lees het blok
  **Nu en daarna** bovenaan (Marcel, 8 okt: "snel, duidelijk en low cost"): wat loopt, wat op Marcel wacht, en wat
  erna komt, in volgorde. Zeg Marcel in een paar regels waar we zijn, neem het bovenste, en begin met een plan voor
  Marcel. Werk dat blok bij aan het eind van de sessie, en houd het kort: wat af is, gaat eruit; het hoe staat in
  het ontwerpbestand van het onderwerp, en de geschiedenis in git.
  **Wie aan een punt begint, zegt het eerst in `main`** (Marcel, 6 okt: "Ja zet erin"; op 6 okt bouwden drie sessies
  tegelijk vraag 130, omdat elk het bovenste punt nam). Haal vlak voor je begint `main` op (`git fetch origin main`), en
  staat er bij het punt al "**Bezig in sessie …**", neem dan een ander punt of vraag het Marcel. Anders zet je bij het
  punt "**Bezig in sessie `<je branch>`** (datum): wat je doet", en push je dat meteen naar `main`, met de controle
  hieronder (`git push origin HEAD:main` vanaf een commit op `main`, niet je hele branch). Weigert de controle, dan was
  een andere sessie je voor: haal `main` binnen en kijk opnieuw. Is het werk in `main`, of stop je ermee, haal het teken
  dan weg.
- `ontwerp/code.md`: **de code per onderwerp**, met een kop per bestand (`grep -n 'js/bos.js' ontwerp/code.md`), en de
  afspraken in de code met het waarom. Lees alleen het stuk van je bestand.
- `ontwerp/gereedschap.md`: elke `npm run`-opdracht in detail, testen in de browser met alle `Spel.debug`-opdrachten, en
  de bladzijden gereedschap (de gesprekken, de quests, de wereld).
- `ontwerp/spel.md`: het spel per onderwerp; bovenaan de stand, en elk onderwerp begint met **Zo werkt het nu** (wie iets
  bouwt of verandert, werkt dat blok bij). Onderaan staat wat tot 11 okt in CLAUDE.md stond.
- `ontwerp/gameloop.md`: de richting van 11 okt, en wat andere spellen als gameloop hebben.
- `ontwerp/commercieel.md`: geld verdienen: de markt, Steam Next Fest, de haak, het tijdpad. `engels.md`: de woorden.
- `ontwerp/beeld.md` (de beeldstijl, maten, palet), `kaarten.md` (van Tiled naar het spel, en de hoogte), `verpakken.md`
  (van map naar programma op Steam), `speelbaar.md` (wat de speeltests vonden), `concept.md` (het concept van 30 sep),
  `wereld.md` (het dorp en zijn mensen).
- `ontwerp/opmerkingen.md`: wat onderweg opviel en nog niet af is (Marcel, 25 sep). Zie je iets, zet het erbij.
- `ontwerp/het-spel-in-het-kort.pdf`: het spel voor een gamedesigner, uit `gereedschap/samenvatting/samenvatting.html`
  (`npm run samenvatting`). Verandert het spel, werk dan de tekst bij en maak hem opnieuw.
- Van het oude spel (De laatste klim, tot 23 sep), alleen als bron: `verhaal.md`, `toren.md`, `spreuken.md`, en de
  afspraken in `git show 0eb8269:CLAUDE.md`.

## Git

- Opslagplaats: https://github.com/mpgeus/Aardschok. Werk rechtstreeks op `main`.
- Een commit per onderwerp, met een Nederlands bericht dat ook het waarom vertelt.
- Pushen alleen als Marcel erom vraagt ("push it"); dat is voor hem een aparte stap. En alleen als
  `npm test` groen is: op 22 sep ging er een falende toets mee omdat de opdracht de uitslag wel
  toonde maar de push niet tegenhield (`npm test && git push`). Eén uitzondering: het teken "Bezig in sessie …" in de
  werklijst (hierboven, bij de werklijst) gaat zonder vragen naar `main`, en verder niets.
- In de cloud krijgt elke sessie een eigen branch. Zet die aan het eind in `main` als Marcel dat
  vraagt, anders begint de sessie erna op een oude stand. Kijk vóór het pushen of `main` intussen
  verder is (`git fetch origin main`, dan `git merge origin/main`): twee sessies tegelijk schrijven
  allebei in de stand van de werklijst. Laat die controle de push tegenhouden, niet alleen iets
  afdrukken: `git fetch origin main && git merge-base --is-ancestor origin/main HEAD && npm test &&
  git push`. Op 27 sep ging een push door terwijl `main` zeven commits verder was.
- Een speeltest of proef zegt op welke stand hij speelt (branch en commit). Op 27 sep speelde er een op
  `main`, terwijl een andere sessie de kern op haar branch al verder had gebouwd.
- Haal in een verse kloon eerst de hele geschiedenis op (`git fetch --unshallow`):
  `test/tegelvolgorde.test.cjs` leest een oude commit, en in een ondiepe kloon falen er dan twee
  toetsen die niets met je werk te maken hebben.

## Draaien en testen

In detail in `ontwerp/gereedschap.md`.

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules (die werken niet vanaf
  `file://`), en er is geen bouwstap. Een bewuste keuze.
- `npm start` start de server op poort 8123 (in `.claude/launch.json` als `aardschok`): het spel op `/`, het gereedschap
  op `/gereedschap/`, en alle getallen op `/gereedschap/instellingen.html` (wat je daar verandert, schrijft de server
  meteen in het bestand: commit het, en pas een toets aan die het oude getal verwacht).
- `npm test` draait de toetsen in `test/`. Een toets laadt het spel zoals het draait, met `require('./laad.cjs').spel()`
  (of `.pagina('gereedschap/wereld.html')`), **nooit met een eigen lijstje**: dan mist er vroeg of laat een bestand, en
  toetst hij een ander spel dan er draait. Een toets die een dorp nodig heeft, speelt op het proefdorp (`test/grond.cjs`).
- `npm run speeltest`: de kolonist in code speelt het spel, met vaste zaden, dus na een ander getal zie je precies wat het
  deed (wat het vond: `ontwerp/speelbaar.md`). Verder `proefversie` (de zip voor een tester), `grootte`, `schermen`,
  `tekenmeting`, `samenvatting`, `maker`, `teksten` (na elke zin die erbij komt of verandert), en `pixelart` en
  `pixelart:spel` (de kunst naar `beelden/`, opnieuw als de kunst verandert).

## Zuinig werken met agents

Gemeten op 20 sep: de agents waren zo'n negentig procent van het verbruik. Een agent stuurt bij elke stap zijn hele eigen
gesprek opnieuw mee, dus hij kost kwadratisch met hoe lang hij leeft. Het knelpunt is de vijfuursgrens, en let op de week.
De volledige tekst, met de metingen, staat onderaan `ontwerp/spel.md`.

- **Laat een agent kort leven:** een verse agent met een korte opdracht is goedkoper dan dezelfde agent voor de vijfde
  keer terugsturen. Alleen doorgaan als hij iets weet dat nergens staat.
- **Een opdracht aan een agent verwijst naar deze paragraaf**, naar één punt uit `ontwerp/werklijst.md`, en naar het ene
  ontwerpbestand (of het ene stuk van `ontwerp/code.md`) dat erbij hoort.
- **Lees niet het hele bestand:** zoek de twintig regels die je nodig hebt. Beoordeel een beeld op een uitsnede: voor
  "is die steen nu grijs" is 600×400 genoeg.
- **Sonnet voor uitvoerend werk, Opus voor oordeel.** Een kleine precieze klus doe je zelf. Niet meer dan twee agents
  tegelijk die renderen.
- **Kijk eerst of het er al is**, met een goedkope zoekopdracht vooraf.
- **Nooit `git stash` of `git checkout` op de werkmap** als er meer agents tegelijk werken; wie wil meten hoe het vóór
  een wijziging was, maakt een losse kopie met `git worktree add`.
- **Kijk naar de meter:** vraag het verbruik op (`get_usage`) voor je een zware agent start, en begin na een groot stuk
  werk een nieuwe sessie; de werklijst draagt alles over.

## Opbouw

Alles hangt aan één naamruimte, `globalThis.Spel` (in de code `T`), zodat hetzelfde bestand in
de browser en in de Node-tests werkt. De volgorde van de scripts in `index.html` telt.

- **Het spel en zijn dorpen** (`js/dorp.js`, vraag 71): `S` is het spel (de kalender, het land, de schout van de speler,
  `S.schout`, het scherm, de dorpen, `S.dorpen`); je eigen dorp is `S.dorp`. Een dorp (`D`) heeft alles van zichzelf: zijn
  kaart (`D.wereld`), voorraad, gebouwen, bewoners, wetten, vlaggen (`D.vlaggen`). **Een regel over een dorp krijgt het
  dorp mee** (`T.tikGebouwenDag(D, dag)`, `T.wijzigVoorraad(D, ...)`); wat ook het spel nodig heeft, krijgt allebei
  (`T.werkOogstBij(S, D, dt)`). Elk dorp leeft, elk beeld (`T.werkDorpBij`), ook waar je niet bent. **Een regel zegt iets
  met `T.zeg(D, tekst, soort)`, nooit rechtstreeks met `T.ui.bericht`** (`test/dorpen.test.cjs` kijkt het na).
- **De getallen** staan per onderwerp in één blok bovenaan zijn bestand (`T.BOS_INSTELLINGEN`, ...), en de spelregels in
  `js/opties.js` (`T.OPTIES`): een keuze zet alleen waarden in die blokken, zodat elk getal één plek houdt, en
  `T.WERKBANK` heeft ze allemaal. Het gereedschap laadt `js/opties.js` bewust niet.
- **De beelden komen uit code** (`gereedschap/pixelart/`, met een README): kleine 3D-modellen, uit acht richtingen tot
  pixel art gerenderd, ingepakt naar `beelden/` en `tegels/` (in git, want het spel heeft ze nodig). Het spel laadt ze met
  `Image`, nooit met `getImageData` (anders werkt `file://` niet meer), en alleen wat er op de kaart staat.

De bestanden in `js/`, per onderwerp; elk heeft een kop in `ontwerp/code.md`:

- **Spel en dorp:** `dorp`, `opslaan`, `menu` (het titelscherm), `taal`, `naam`, `tijd`, `dag`, `opties`, `main` (de
  spellus, de invoer, de camera).
- **Wereld en lopen:** `wereld`, `mist`, `pad` (A*), `lopen`, `praatje`, `anim`, `verkennen`.
- **Het land:** `eiland` (2500 bij 2500 tegels uit één nummer), `maker` (je land erop), `hoogte`, `kaart` (uit Tiled),
  `land` en `landkaart`, `gebied`, `minikaart`.
- **Beeld en scherm:** `iso`, `tekenen`, `gl` (WebGL), `sprites`, `doorkijk`, `bouwstijl`, `kleinleven`, `zien` (het
  licht), `ui` (één manier om een venster te openen en te sluiten), `dialoog`, `balk` (onderaan), `hud`, `huisbriefje`,
  `gebouwbriefje` (een gebouw aanklikken).
- **De mensen:** `mensen`, `bewoners`, `leven`, `gesprek` en `gesprekken`, `quest` en `quests`.
- **Bouwen en groeien:** `begin` (het lege begin), `bouwen` (meebouwen), `boerderij` (boeren uit het niets), `gebouwen`,
  `treden`, `wensen`, `behoeften`, `paden`, `wegen` (die jij legt), `afbreken`, `markt`, `herberg`.
- **Het land bewerken en de natuur:** `akkers`, `veldwerk`, `bos`, `beesten`, `vee`, `weer`, `graanschuur`,
  `wijngaard`.
- **Voorraad en handel:** `voorraad`, `kar` (de ossenkar en de stapels), `handel` (de marskramer), `bode`.
- **De heer en het bestuur:** `heer`, `brieven`, `bazen`, `grillen`, `heervaart`, `wetten` en `wettenmenu`, `raad`,
  `raadsman` en `raadsmanvenster`, `ochtendrapport`, `voorvallen`, `feesten`, `brand`, `koorts`, `rovers`, `einde`.
- **Het gevecht:** `gevecht` (de overgang, de beurten, de actiepunten, de militie), op hetzelfde raster als het lopen.

## Het spel in het kort

Het ontwerp staat in `ontwerp/spel.md` en `ontwerp/gameloop.md`; hier staat wat elke sessie moet weten.

- **De richting** (Marcel, 11 okt, vraag 151: "A ja, B ja, C allebei"): A, jij bouwt van bovenaf, en de schout is je held.
  B, je bouwt binnen een aantal tegels van je plein en van elke opslag, zonder grens en zonder vlaggen ("alles moet open
  zijn"); een ossenkar haalt de grondstoffen op, en een waar telt pas als hij binnen is. C, vechten is allebei: je dorp
  verdedigen, en erop uit over het eiland tot het kasteel van de heer. En: **"We moeten ook zelf alles vanaf de start gaan
  bouwen"**, dus geen gehucht dat er al was. Het plan is vraag 152 in de werklijst.
- **Wat sinds 11 okt om is:** "geen hand van bovenaf" (30 sep), "de mensen bouwen zelf" (3 okt), en heel "rijk worden en
  arm lijken": de inner, de argwaan, het verstoppen en de getuigen zijn eruit (optie 1). Wat er nog van in de code staat,
  gaat eruit in de snoeironde (vraag 153, stap 3).
- **De heer** is verward en ziet alleen geld. Levert het dorp te weinig, dan straft hij, en hij straft wat je tegen hem
  doet, niet wat je hebt (wapens mogen, 7 okt). Hij is ook de tegenstander (vraag 126): een kasteel, bondgenoten en per
  spel een ander karakter. Drie wegen naar het eind: de opstand, de koning achter zijn rug om, of trouw (dan word jij de
  nieuwe heer). Toon: zwarte satire; de heer is lachwekkend, zijn straffen niet.
- **Twee bazen** (vraag 106): de gunst van de heer en het vertrouwen van het dorp kunnen je allebei wegsturen; onder een
  grens een waarschuwing, op 0 ben je weg.
- **Het doel van de demo is open** (werklijst, "Wacht op Marcel"): het oude doel, een stad waar iedereen een jaar lang
  super gelukkig is (vraag 78, 79 en 101), is op 11 okt weggehaald (snoeironde, vraag 153).
- **Geld verdienen** (Marcel, 1 okt: "Ik wil hier eigenlijk geld mee verdienen"; `commercieel.md`): in januari 2027 de
  naam, geluid, Engels en de Steam-pagina, in juni 2027 de demo in Next Fest. Er is weinig geld ("Ik gebruik jou ☺️"):
  wat kan, maakt Claude, zoals de beelden uit code; Marcel kiest, luistert en plaatst.
- **Wie valt, is dood** (vraag 55): valt de schout, dan is het spel uit; wie het overleeft, geneest na een nacht.

Hoe we kiezen:

- **Instelbaar** (Marcel, 24 sep), **en wat om is, gaat eruit** (Marcel, 11 okt, vraag 153: "akkoord met de afspraak"):
  waar een ontwerpvraag meer dan één goed antwoord heeft, wordt het een optie in de spelregels (`js/opties.js`), en wat
  Marcel koos, is de standaard. Een verlaten richting is geen goed antwoord meer: die gaat eruit en blijft niet als
  spelregel staan (git bewaart haar). Een spelregel die het oude alleen houdt tot het nieuwe af is (zoals "Het begin"),
  gaat eruit zodra het nieuwe af is.
- **Een toestand is een status** (Marcel, 1 okt): wat een tijd duurt, heeft een begin en een eind, soms in niveaus
  (droogte, ernstige droogte), en is te zien zolang het duurt (`T.OORZAKEN`); een bericht zegt het als het begint,
  erger of minder wordt, of ophoudt.
- **Niet te ingewikkeld** (Marcel, 29 sep: "er is geen gelijkenis met de werkelijkheid"): de eenvoudige regel gaat voor
  de regel die klopt met vroeger.
- **Eerst speelbaar** (Marcel, 26 sep: "We moeten oppassen voor functie creep"): een nieuw idee, ook een goed idee van
  Claude, gaat naar `ontwerp/opmerkingen.md` of achteraan de werklijst, niet in de stap die loopt.
- **Het scherm zo leeg mogelijk** (Marcel, 14 okt: "zo leeg mogelijk houden zonder info te missen"): wat niet altijd
  nodig is, staat op het briefje bij de muis; alle kaartjes even breed (`--kaart`, `code.md` bij `js/ui.js`).
- **Niets erbij zonder overleg** (Marcel, 8 okt: "We moeten stoppen met het ene op te lossen met iets anders"): wat een
  speeltest scheef laat zien, los je eerst op met een getal uit de werkbank; iets nieuws (een regel, een gebouw, een
  grondstof) komt er alleen als Marcel het kiest.

## Afspraken in de code

**Begrijpelijk en aan te passen houden** (Marcel, 26 sep). In het kort; met het waarom in `ontwerp/code.md`:

- **Eén manier per ding:** kijk eerst of het er al is, en maak geen tweede variant ernaast. Getallen in één blok bovenaan,
  regels zonder scherm en met toetsen, en na een groot stuk werk een opruimronde.
- **Alles in `Spel.S` wordt bewaard** (`js/opslaan.js`): wat het spel onthoudt, staat in `S` als gewone gegevens
  (objecten, lijsten, Set, Map; geen functie, canvas of Date), nooit in een losse variabele in een bestand. Wat alleen
  scherm is, staat in `T.schermVelden`, of binnen een ding in `SCHERM_SLEUTELS`. Past een oud spel niet meer (iets heet
  of betekent iets anders), verhoog dan `T.OPSLAAN_INSTELLINGEN.versie`.
- **Geen bewakers voor regels:** een toets laadt het hele spel, dus geen `T.x && T.x(...)` of `if (T.x)` voor een regel
  uit `js/`; alleen op `T.ui`, op gegevens, en waar een bladzijde een deel van het spel laadt.
- **Zo dat samen spelen later kan** (vraag 126, f): wat de heer of een ander dorp beslist, kiest hij uit dezelfde
  handelingen als een mens in zijn plaats (zoals `T.raadsmanKeuze`), en een keuze die op de speler wacht, heeft een
  termijn en een uitkomst als die om is.
- **Scherm en klik stellen dezelfde vraag:** `handelingVerkennen` en `handelingGevecht` geven `{ tekst, kosten, kan, doe }`,
  en de tekst bij de muis, het pad, de actiepunten en de klik komen uit hetzelfde antwoord.
- **Eén weg voor:** de voorraad (`T.wijzigVoorraad`), het getal in de balk (`T.wijzigBevolking(S, verschil, reden,
  waarom)`), de tijd stilzetten (`T.houdTijdStil(S, reden)` en `T.laatTijdGaan`; een venster zet nooit zelf `snelheid`),
  een bezoeker (`T.bezoekerKomtAan`), en een venster (`T.ui.openVenster`, `T.ui.sluitVenster`).
- **De wereld is het hele eiland** (Marcel, 11 okt: "de wereld moet 1 geheel worden het vlakke van 100x100 is niet hoe
  het blijft. We hebben een heel land van 2500x2500"): je land van 100 bij 100 is voorlopig (vraag 117, stap 3,
  `kaarten.md`). Niets nieuws gaat uit van die maat: geen lijst of rekensom over de hele kaart, alleen over een vak.
- **Twee klokken:** wat in de wereld gebeurt, loopt op de tijd van de wereld (`dtWereld`, `S.wereldTijd`), wat alleen op
  het scherm beweegt, op `S.tijd`. Een gevecht loopt altijd op 1×.
- **Een bewerker schrijft alleen het blok dat hij kent** (`T.bronBlok` in `gereedschap/bronblok.js`): kop en staart van
  het bestand gaan letterlijk mee terug.

## Testen in de browser

`Spel.S` is de spelstaat, `Spel.S.dorp` je eigen dorp. `await Spel.debug.stap(seconden)` laat het spel vooruitlopen
zonder op beelden te wachten (een verborgen paneel tekent maar af en toe), `Spel.debug.naarBeeld(x, y)` geeft de
schermpositie van een tegel, en `await Spel.debug.schermafdruk('naam')` bewaart het doek als PNG in
`gereedschap/pixelart/uit/schermen/`, zodat Marcel het spel ziet zonder dat het beeld door het gesprek gaat. Elk
onderwerp heeft zijn eigen `Spel.debug`: de lijst staat in `ontwerp/gereedschap.md`. De spelregels die de browser
onthield, gelden ook voor wie test; `Spel.optiesTerug()` zet alles op de standaard. Drie dingen die bij het mikken
misgaan:

- een open venster vangt de klik: het spel opent op het titelscherm (Nieuw spel, dan Begin), en dan staat de
  benoemingsbrief open; sluit hem eerst (`.heer-geef-knop`, of Esc). Op `?kaart=proef` is er geen titelscherm en geen brief;
- de camera glijdt mee: reken de schermpositie pas uit als hij stilstaat (een seconde `stap`);
- mik op het lijf van een wezen (zo'n 16 pixels boven zijn tegel), niet op zijn voeten.
