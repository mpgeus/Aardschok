# CLAUDE.md

Aardschok (werktitel, past niet meer): een spel dat Marcel en Claude samen bouwen, met als doel het
uiteindelijk te verkopen (Steam eerst, als los programma verpakt). Een bouw- en beheerspel in
isometrisch beeld, met politiek en avontuur erin. Je bent de schout van een dorp onder een verwarde
heer die alleen geld ziet. Je breidt het dorp uit tot een stad en bestuurt het met wetten. **Het doel
is de heer verstoten en verslaan** (Marcel, 5 en 6 okt, vraag 126): hij krijgt een kasteel op de kaart,
is sterk, smeedt bonden met de andere spelers en heeft per spel een ander karakter. Veroveren en
bevriend raken (zoals in Civilization, 29 sep) zijn de weg erheen, langs drie wegen: de opstand, de
koning achter zijn rug om, of trouw, en dan word jij de nieuwe heer. Iedereen super gelukkig, het eind
van de kern, blijft het eind van de demo. Na de release misschien samen spelen, met een speler als heer
(`ontwerp/spel.md`, "De heer als tegenstander"). Zie "Het spel in het kort" hieronder.

Het beeld is isometrisch (Mystic Towers als voorbeeld), de HD-pixel art komt uit code, en
rondlopen gaat naadloos over in een gevecht in beurten op dezelfde tegels (Fallout, Jagged
Alliance 2). Dat bleef over van het spel dat het tot 23 sep was, De laatste klim (een tovenaar in
een toren); de rest ervan ging er op 25 en 26 sep uit (werklijst, punt 7). De afspraken van dat
spel staan in `git show 0eb8269:CLAUDE.md`.

Code, commentaar en spelteksten zijn Nederlands, zoals in Marcels Planner.

## Kennis over het spel: lees alleen wat je nodig hebt

Dit bestand wordt elke sessie gelezen en blijft daarom kort. Het houdt de kaart, de kernregel en
de afspraken bij. Het ontwerp staat in `ontwerp/`, één bestand per onderwerp. Bovenaan staat wat
besloten is (met datum en waarom), onderaan wat nog open is. Lees bij een taak alleen het bestand
dat erover gaat.

Komt Marcel met een idee of besluit, schrijf het dan meteen in het juiste bestand, niet alleen in
het gesprek; wat alleen in een gesprek staat, raakt kwijt. Laat groot zoek- en leeswerk aan een
agent over, zodat alleen de samenvatting in het gesprek komt.

- **`ontwerp/werklijst.md`: wat we doen, in welke volgorde. Begin een sessie hier.** Lees het blok
  **Nu en daarna** bovenaan (Marcel, 8 okt: "snel, duidelijk en low cost"): wat loopt, wat op Marcel wacht, en wat
  erna komt, in volgorde. Zeg Marcel in een paar regels waar we zijn, neem het bovenste, en begin met een plan voor
  Marcel. Werk dat blok bij aan het eind van de sessie, en houd het kort: wat af is, gaat eruit; de geschiedenis staat
  in de stand eronder.
  **Wie aan een punt begint, zegt het eerst in `main`** (Marcel, 6 okt: "Ja zet erin"; op 6 okt bouwden drie sessies
  tegelijk vraag 130, omdat elk het bovenste punt nam). Haal vlak voor je begint `main` op (`git fetch origin main`), en
  staat er bij het punt al "**Bezig in sessie …**", neem dan een ander punt of vraag het Marcel. Anders zet je bij het
  punt "**Bezig in sessie `<je branch>`** (datum): wat je doet", en push je dat meteen naar `main`, met de controle
  hieronder (`git push origin HEAD:main` vanaf een commit op `main`, niet je hele branch). Weigert de controle, dan was
  een andere sessie je voor: haal `main` binnen en kijk opnieuw. Is het werk in `main`, of stop je ermee, haal het teken
  dan weg.
- **`ontwerp/spel.md`: het spel.** De schout, de heer en de inner, keuren en politiek, avontuur,
  en wat nog open is. Bovenaan staat per onderwerp de stand, en elk onderwerp begint met **Zo werkt
  het nu**; wie iets bouwt of verandert, werkt dat blok bij (Marcel, 25 sep).
- `ontwerp/concept.md`: het concept dat Marcel op 30 sep meebracht ("De Schout": het poppetje is de manier
  waarop je bestuurt), en hoe het naast ons spel ligt; wat ervan besloten wordt, is vraag 73.
- `ontwerp/commercieel.md`: hoe het spel geld gaat verdienen (Marcel, 1 okt: "Ik wil hier eigenlijk geld mee
  verdienen"): de markt, verlanglijstjes en Steam Next Fest, de haak (je bent geen god boven het dorp, maar de schout
  erin), de beeldstijl als troef, Engels, en een tijdpad.
  Het commerciële deel denkt mee in elke keuze; de vragen waren vraag 83 en 84 (open: welke zin de haak wordt).
- `ontwerp/speelbaar.md`: wat er nog ontbreekt voor een eerste speelbaar product (vraag 33), en wat er
  in een speeltest van een heel jaar gebeurde.
- `ontwerp/beeld.md`: de beeldstijl (HD-pixel art), maten, palet, en het ontwerpcanvas.
- `ontwerp/kaarten.md`: van Tiled naar het spel, en hoe hoogte gaat werken.
- `ontwerp/wereld.md`: de plekken en mensen van het oude spel (erf, bos, dorp); het dorp en zijn
  mensen zijn nog bruikbaar.
- `ontwerp/verpakken.md`: van map met bestanden naar programma op Steam, en wanneer er wél een
  bouwstap komt.
- `ontwerp/opmerkingen.md`: wat onderweg opviel en nog niet af is, om later na te lopen (Marcel,
  25 sep). Zie je iets, zet het erbij.
- `ontwerp/het-spel-in-het-kort.pdf`: het spel in een paar bladzijden voor wie het niet kent (Marcel, 6 okt; voor een
  gamedesigner), met beelden uit het spel; het hele spel als één verhaal, zonder te zeggen wat er al is. Verandert het
  spel, werk dan de tekst bij (`gereedschap/samenvatting/samenvatting.html`) en maak hem opnieuw (`npm run samenvatting`).
- Van het oude spel, alleen nog als bron: `ontwerp/verhaal.md` (met de vijf rondes ideeën van
  23 sep die tot het nieuwe spel leidden), `ontwerp/toren.md` en `ontwerp/spreuken.md`.

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

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules.
  Dat is een bewuste keuze. Modules werken niet vanaf `file://`, en er is geen bouwstap nodig.
- `npm start` start `server.cjs` op poort 8123 (geen afhankelijkheden) en drukt meteen af waar
  alles zit. `.claude/launch.json` heeft dezelfde server onder de naam `aardschok`. Het
  browserpaneel kan een los bestand wel tonen maar niet bedienen, vandaar deze server.
  - het spel: `http://localhost:8123/`
  - **het gereedschap: `http://localhost:8123/gereedschap/`** — een bladzijde die naar alle drie
    wijst. De belangrijkste is `gereedschap/wereld.html`: daar wordt het spel gemaakt.
- `npm test` draait `node --test`: de toetsen in `test/`, de regels zonder scherm. Een toets laadt het
  spel zoals het draait, met `require('./laad.cjs').spel()`: de scripts uit `index.html`, in die
  volgorde, zonder wat alleen scherm is (`test/laad.cjs`). Een toets van het gereedschap laadt wat
  zijn bladzijde laadt (`.pagina('gereedschap/wereld.html')`). Nooit een eigen lijstje: dan mist er
  vroeg of laat een bestand, en toetst de toets een ander spel dan er draait.
- `npm run speeltest` speelt het gehucht een jaar met vier spelers in code (braaf, lui 30%, lui 60%, slim;
  vraag 45), en twee jaar met een vijfde, de bouwer, die van gehucht tot dorp wil en de raad volgt (vraag 58), en een
  zesde, de sluwe bouwer, die daarbij de heer bedriegt en het graan verstopt houdt voor de herberg en de molen (vraag 94),
  elk met zaad 1 tot en met 3, in een onzichtbare browser, en zet de uitslag in
  `gereedschap/speeltest/uit/` (niet in git), met een tabel in `samenvatting.md`; wie twee jaar speelt, krijgt er een
  graanboek bij: per jaar waar het graan bleef, en hoeveel dagen er geen bier, brood of laken was. Hetzelfde zaad geeft
  hetzelfde jaar, dus na het bijstellen van een getal zie je precies wat het deed (`-- slim --zaad 2` voor
  één jaar). Met `-- bouwer sluw --jaren 4` spelen de bouwers vier jaar, naar de winst (vraag 102, e): de samenvatting
  krijgt dan "Naar de winst", per jaar de teller van het eind en wat de reeks brak; `--tegelijk 4` speelt vier spellen
  tegelijk (standaard drie). Het speelt het spel zoals het draait: de speler klikt en drukt op de knoppen van de vensters
  (`gereedschap/speeltest/speler.js`). Een jaar kost anderhalf tot vier minuten (5 okt: vier jaar op een land van de
  maker 6 à 17 minuten, met drie tegelijk); nodig is Playwright (in de
  cloud staat het klaar). Wat het vond, staat in `ontwerp/speelbaar.md`. Met `--opslaan` is het de proef met
  opslaan: de speler slaat op 1 oogstmaand op via het menu, de bladzijde herlaadt, hij gaat verder met Verder,
  en het jaar moet letter voor letter aflopen als hetzelfde jaar zonder opslaan (`uit/opslaan.md`). Met `--maker`
  speelt het op gehuchten van de maker (de spelregel "Je gehucht" op "Elk spel een ander"; `uit/samenvatting-maker.md`).
  Met `--eiland` speelt het op het eiland, zoals een nieuw spel sinds 8 okt begint (`uit/samenvatting-eiland.md`).
  Met `--regel seizoen=jij` speelt het met een spelregel anders, en met `--getal VOORVALLEN_INSTELLINGEN.metOorzaak=1` met
  een getal uit de werkbank anders (allebei zo vaak als je wilt; de uitslag krijgt `-regels` achter zijn naam). Een
  taak op de achtergrond stopt na twee uur, dus een grote speeltest gaat in meer taken; `--samenvatting` speelt dan
  niet, maar maakt de samenvatting opnieuw uit wat er al in `uit/` ligt, zodat de taken samen één tabel geven.
- `npm run proefversie` maakt de zip voor een tester (itch.io, `ontwerp/verpakken.md`) in `gereedschap/proefversie/uit/`
  (niet in git): `index.html` bovenin en alleen wat het spel laadt, met de stand (datum, commit) klein op het
  titelscherm (`T.STAND`). Commit eerst. Met `-- --windows` is het het spel in Electron voor Windows, zoals straks op Steam
  (`Aardschok/Aardschok.exe`; Electron komt één keer van GitHub, in `uit/`; vraag 123, e).
- `npm run grootte` meet hoe groot een dorp kan worden (vraag 74): het bouwt het gehucht uit tot N bewoners, met erven en
  werkplekken zoals het spel ze bouwt, en meet de wereld per beeld op 30×, de dagtik en het opslaan, elke N in een eigen
  Node (`gereedschap/grootte/`, uitleg bovenin `grootte.cjs`); `-- 26 800` voor andere N, `--browser` ook het tekenen
  (start zelf de server), `--astar` het zoeken van een pad, `--prof` een CPU-profiel, `--maker 5` op land 5 van de maker
  (zonder het eiland) in plaats van het ontworpen gehucht. De uitslag in
  `gereedschap/grootte/uit/` (niet in git), met een tabel in `samenvatting.md`. Meet op een stille machine.
- `npm run schermen` maakt twintig vaste schermafdrukken van het spel (het plein op vier zoomstanden, de herberg 's avonds,
  de nacht, twee bouwplaatsen in hun fases, land 5 van de maker) en meet wat de browser aan plaatjes vasthoudt
  (`Spel.debug.vellen`) en hoe lang het eerste beeld na het uitzoomen duurt; `-- --naam voor`, en na een verandering aan
  het tekenen of het laden `-- --naam na --tegen voor`: dan zegt het per beeld of het byte voor byte gelijk bleef
  (vraag 114, stap 1; ook voor WebGL, vraag 123). In `gereedschap/schermen/uit/` (niet in git). Op 0,35 kan het
  verkleinen in een paar honderd pixels de buurpixel kiezen als alleen het vel van een tekening anders is.
- `npm run tekenmeting` meet waar het tekenen zijn tijd kwijt is, per laag (vraag 123, f): land 5 van de maker op
  1920×1080, 4K en 4K op 200%, dichtbij en in het overzicht, overdag en 's avonds; `-- 1920x1080@1` voor één scherm. In
  `gereedschap/schermen/uit/tekenmeting.json` (niet in git).
- `npm run samenvatting` maakt `ontwerp/het-spel-in-het-kort.pdf` uit `gereedschap/samenvatting/samenvatting.html` en de
  vier beelden in `gereedschap/samenvatting/beelden/` (alle drie in git); `-- --beelden` speelt eerst het spel en maakt
  de beelden opnieuw, elk uit een vers spel op land 5 van de maker (een minuut). Lukt een beeld niet meer, dan zegt het
  waar het vastliep, en blijft het oude staan.
- `npm run maker` legt gehuchten met de maker (`js/maker.js`, `T.maakGehucht(zaad)`: elk spel een ander gehucht, vraag
  69 en 70) en tekent ze als plattegrond naast het ontworpen gehucht, in `gereedschap/maker/uit/` (niet in git);
  `-- 7 12` voor andere zaden.
- `npm run pixelart` rendert alle HD-pixel art naar `gereedschap/pixelart/uit/` (niet in git).
- `npm run pixelart:spel` zet daaruit alleen wat het spel tekent in `beelden/` (wél in git,
  want het spel heeft het nodig als het draait), met de cellen van de figuren gekrompen tot wat erin staat
  (`gereedschap/pixelart/inpakken.cjs`). Draai het opnieuw als de kunst verandert. `npm run tiled` en
  `bouwfasen.cjs` pakken hun vellen net zo in.

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

Alles hangt aan één naamruimte, `globalThis.Spel` (in de code `T`), zodat hetzelfde bestand in
de browser en in de Node-tests werkt. De volgorde van de scripts in `index.html` telt.

- `js/dorp.js`: **het spel en zijn dorpen** (werklijst vraag 71, 30 sep). `S` is het spel: de kalender, het land, de
  schout van de speler (`S.schout`), waar hij is (`S.wereld`), het scherm, en de dorpen (`S.dorpen`); je eigen dorp is
  `S.dorp`. Een dorp (`D`) heeft alles van zichzelf: zijn kaart (`D.wereld`), voorraad, gebouwen, bewoners, wetten, hoe
  de heer en de inner ertegenover staan, rovers, voorvallen, raadsman, trede, vee, de vlaggen van wat er speelt
  (`D.vlaggen`), en zijn eigen schout (`D.schout`; in jouw dorp ben jij dat). `D.kalender` is `S.kalender`.
  **Een regel over een dorp krijgt het dorp mee** (`T.tikGebouwenDag(D, dag)`, `T.wijzigVoorraad(D, ...)`); wat ook
  het spel nodig heeft (of je vecht, praat of slaapt, de klok van het scherm), krijgt allebei: `T.werkInnerBij(S, D)`,
  `T.werkOogstBij(S, D, dt)`, en een gesprek `T.doeGevolg(S, D, doe)` (je tas en je quests van het spel, de vlaggen en
  het goud van het dorp). De balk en de vensters gaan over je eigen dorp (`S.dorp`, vraag 71, C); wat getekend,
  aangeklikt of gevochten wordt, over het dorp dat er ligt (`T.dorpHier(S)`, of geen). Een venster dat een dorp zelf
  opent (`T.ui.toonBrief(D, ...)`, `T.ui.openSlachten(D)`, de balk met `T.ui.toonVoorraad(D)`), komt alleen voor je
  eigen dorp. `T.nieuwDorp` maakt een dorp op een kaart (vanuit `T.beginOpKaart`), en `T.schoutIsWeg(D)` zegt of zijn
  schout niet op de kaart van het dorp staat. Het gereedschap, dat niet speelt, is zijn eigen dorp (`S.dorp = S`).
  **Elk dorp leeft** (vraag 71, A): `T.werkDorpBij(S, D, dt, dtWereld)` doet elk beeld alles van een dorp (js/main.js,
  voor elk dorp in `S.dorpen`), en ligt het niet waar je bent, dan lopen, maaien en dwalen zijn poppetjes daar ook, op
  zijn eigen kaart, niet getekend (`T.beweegWezens` in js/anim.js, `T.dwaal` in js/verkennen.js). Een ander dorp dan het
  jouwe (`D.ander`, het buurdorp) spreekt niet tegen jou: **een regel over een dorp zegt iets met `T.zeg(D, tekst,
  soort)`, nooit rechtstreeks met `T.ui.bericht`** (`test/dorpen.test.cjs` kijkt het na); een ander dorp bewaart wat
  het zei (`D.gezegd`). Een voorval in een ander dorp beslist zijn raadsman, als het er een heeft (het kiest er nog
  geen zelf: dat komt met het buurdorp, vraag 72), tot zijn schout in code kiest (stap 1b).
  `test/dorpen.test.cjs` zet twee dorpen naast elkaar (jouw gehucht en een van de maker): een jaar van het ene laat het
  andere letter voor letter ongemoeid.

- `js/naam.js`: de naam van het spel (`T.NAAM`), op één plek, want hij verandert nog (Marcel, 28 sep); een
  titel schrijft `{naam}`. De sleutel waaronder de browser iets bewaart (`T.OPSLAG_SLEUTEL`) staat ernaast en
  verandert nooit mee. `test/naam.test.cjs` bewaakt dat de naam nergens anders staat. `T.STAND` is leeg, behalve in
  een proefversie (`npm run proefversie` zet er de datum en de commit in).
- `js/opslaan.js`: **opslaan en laden** (werklijst punt 3, vraag 48): het bewaart heel `Spel.S` behalve wat
  alleen scherm is (`T.schermVelden`), met de verzamelingen en alles wat elkaar aanwijst heel
  (`T.bewaarSpel`, `T.leesSpel`, `T.zetSpel`). Een plek die vanzelf gaat, elke ochtend als de mensen opstaan
  (`T.werkOpslaanBij`; op 30× om de drie dagen, want het kost een hapering), en vijf eigen (`T.slaOp`, `T.opgeslagenSpellen`); waar het blijft, zegt één functie
  (`T.opslagPlek`: de opslag van de browser, straks een bestand). Na het laden meldt het de soorten aan van wat er op de
  kaarten ligt (`T.kenSoortVan` in `js/kaart.js`): een verse bladzijde kent alleen wat ze zelf neerzette, niet een gebouw
  uit het spel (gevonden met de proef met opslaan, 4 okt). `js/menu.js` is het scherm erbij: het
  titelscherm, waarop het spel opent, en het menu onder `Esc`. `js/main.js` begint een nieuw spel
  (`T.nieuwSpel`, dat een vorig spel helemaal wist), laadt er een (`T.laadSpel`), en gaat terug naar het
  titelscherm (`T.naarTitelscherm`).

- `js/wereld.js`: wat een wezen is (`T.WEZENS`) en wat een voorwerp is (`T.VOORWERPEN`), de
  vragen over een kaart (`isBegaanbaar`, `isVast`, `raakt`, `zicht`/`zichtTussen`/`zietTegel`, `isZichtbaar`,
  `opHetPlein`: op het plein wordt niet gebouwd, en `T.pleinTegels`: de tegels van het plein, één keer per kaart),
  wat er op een tegel staat (`T.voorwerpOp`, uit een lijst per tegel die de kaart zelf bijhoudt, niet in `S`; een voorwerp
  zet je erbij en haal je weg met `T.zetVoorwerp` en `T.haalVoorwerpWeg`, vraag 71: dit was 85% van een speeldag),
  en de proefkamers (`T.maakProefkamers`): drie kamers in code voor de toetsen van het gevecht.
  Elke kaart van het spel komt uit Tiled (`js/kaart.js`). De speler is `S.schout`, met soort
  'schout' en kant 'speler' (Marcel, 26 sep: een man van de militie vecht later ook aan kant
  'speler' zonder de schout te zijn); hij draagt het vel van een gewone dorpeling (`js/sprites.js`).
- `js/pad.js`: A* (`zoekPad`, acht richtingen, schuin kost ook 1, geen hoeken afsnijden; sinds 2 okt met een hoop, die
  in precies dezelfde volgorde kiest als de lijst ervoor; tijdens het zoeken staat iedereen stil, `T.iedereenStil` in
  `js/wereld.js`, zodat wie op een tegel staat in één stap bekend is, 3 okt) en `bereik` (alle tegels binnen N stappen). **De eilanden**
  (`T.eilandOp`, `T.kanErKomen` in `js/wereld.js`, vraag 88): welke tegels samen één gebied vormen, ruim gerekend, zodat
  wie naar een ander eiland wil, meteen weet dat er geen weg is. Verandert er een tegel of een voorwerp, dan zegt
  `T.kaartVeranderd(w)` het (een toets kijkt dat niemand het vergeet).
- `js/lopen.js`: **lopen tussen anderen** (vraag 119, D, 4 okt; Marcel: "Je kunt nu eenmaal niet over iemand heen"): een
  weg gaat alleen om wat vaststaat (`T.zoekRoute`, met A* uit `js/pad.js`), niet om wie er staat, en de kaart onthoudt
  hem tot hij verandert. Wie een weg krijgt, krijgt hem met zijn doel (`T.geefRoute(e, pad, doel)`, `e.padDoel`, met `tot`
  of `naast`), en wie onderweg een ander op zijn volgende tegel treft, lost het daar op (`T.ontwijk`, vanuit
  `js/anim.js`): langs elkaar schuiven als ze elkaar tegemoet lopen, even wachten op wie doorloopt, wie maar wat staat
  gaat opzij (`T.magOpzij`) of ruilt van plaats, om wie bezig is een korte omweg, en anders wachten tot zijn geduld op is.
  Een stap van het dwalen (zonder doel) en een gevecht doen dat niet: daar stopt wie zijn tegel bezet vindt. Ook de rem
  (wie twee keer na elkaar geen weg vindt, wacht een uur; vraag 88) en `zoekPerBeeld` staan hier, in
  `T.LOPEN_INSTELLINGEN`. Een weg zoeken met de anderen als muur gebeurt alleen nog in een gevecht en voor een omweg.
  **De velden** (vraag 119, A): waar velen heen gaan (de plekken van `T.dagAnker`: hun deur, hun werk, de put, de
  herberg), vraagt het dwalen een weg met `veld: true`, en die komt uit een veld: vanaf het doel ring voor ring hoeveel
  stappen elke tegel ervan af ligt, zo ver als nodig, tot de kaart verandert (`veldenOnthouden`). Een veld is alleen uit
  de kaart, dus een weg is dezelfde, hoe ver het veld ook al gegroeid was, en ook na het laden.
- `js/praatje.js`: **een praatje** (vraag 120, 4 okt; Marcel: "Het dorp moet echt levendig en realistisch aanvoelen", en
  "geen praatjes forceren. Alleen als mensen een reden hebben en elkaar toevallig tegenkomen"): wie vrij is
  (`T.kanPraten`: 's ochtends, in de schaft, 's avonds, en overdag wie geen werk heeft) en toevallig een bekende uit een
  ander huis treft (`T.kentElkaar`: een buur of wie op hetzelfde werk werkt, niet je eigen gezin), blijft soms staan, bij
  een stap van het dwalen (`T.zoekPraatje`) of onderweg in plaats van uit te wijken (`T.praatjeOnderweg`, vanuit
  `T.ontwijk`); wie langskomt, schuift aan, tot vier. Niemand gaat ergens heen om te praten. Het groepje is een ding dat
  ze delen (`e.praatje`: het midden, tot wanneer, een zaad voor het wolkje), zonder lijst ernaast (`T.praatjesOp(w)`); ze
  kijken naar elkaar (`e.kijkt` als plek, js/sprites.js). Elk beeld, vóór het dwalen (`T.werkPraatjesBij`, vanuit
  `T.dwaal`): wie niet meer vrij is, gaat, en na een kwartier tot een uur is het om, dan een uur niet weer. Op een vaste
  plek (`T.opVastePlek`: het plein, de put, voor de herberg of de kapel) is de kans groter. Het wolkje tekent
  `js/tekenen.js` (`tekenWolkjes`). De regels van het spel veranderen niet. De spelregel "Praatjes"; de getallen in
  `T.PRAATJE_INSTELLINGEN`.
- `js/iso.js`: de isometrische projectie (tegel 64×32) en tekenhulpen (`ruit`, `blok`).
- `js/hoogte.js`: **de hoogte van het land** (vraag 121, stap 1, 7 okt; Marcel: "ik doel ook meer op heuvels in het
  landschap", "a ja 32", "Ik wil dat de akkers mee bollen met de heuvel", en "De heuvels moeten niet alleen kleine bultjes
  zijn ... Uiteindelijk wilde ik een map van 2500x2500", "Waar alles doorloopt"): elke hoek van een tegel heeft een hoogte
  in pixels, de glooiing van het hoekpunt plus het niveau van de tegel maal een trede van 32 (`w.hoogte.niveau`), of per
  hoek voor een helling (`w.hoogte.hellingen`); delen buren hun hoek, dan glooit het, anders staat er een wand
  (`T.wandenVan`, alleen aan de zuid- en oostkant, want die zie je). **De glooiing is een rekensom, geen lijst**
  (`glooiingOp`): drie lagen gladde ruis uit het nummer van het land (`groot`, `midden`, `klein` in
  `T.HOOGTE_INSTELLINGEN`, van dal tot top zo'n 300 à 400 pixels), overal te vragen, ook buiten de kaart, platter op de
  vlakte om het dorp, en vlak op de vlakke stukken (`w.hoogte.vlakken`: een huis met zijn looppad, het plein, het water),
  dus een bewaard spel onthoudt alleen het nummer en die stukken, en het landschap loopt door als het land groter wordt.
  Voor het tekenen staan de hoeken in een lijst (met een rand van 48 tegels om de kaart), opnieuw als `w.hoogte.versie`
  verandert. De vragen: `T.hoekHoogte`, `T.hoogteOp` (op een punt, op de driehoeken van de tegel), `T.isSchuin`,
  `T.naarSchermOp` en `T.naarWereldOp` (het scherm en de muis, met de hoogte), `T.lichtOpHoekpunt` en
  `T.helderheidVanVlak` (lichter naar de zon). De maker legt hem met de spelregel "Hoogte" op "Heuvels" (`T.legHoogte`,
  vanuit `T.laadGemaaktGehucht`), met een richel met een rotswand en een helling bij de rotsen; op het eiland is het land
  dat van het eiland (`hg.eiland`: de grond, het water op zijn peil, de zee op 0; vraag 117, 2b). Standaard staat hij op
  "Vlak", en een kaart zonder `w.hoogte` tekent pixel voor pixel als vroeger. `js/tekenen.js` tekent alles op de grond met
  `opGrond` (de hoogte eraf), een grondtegel op het vlak van zijn hoeken (`tekenSchuineTegel`, `opTegelVlak`), het licht
  zacht verlopend uit een plaatje met een pixel per hoekpunt (`lichtKaartVan`, `tekenGrondMetLicht`), de wanden uit een
  textuur in code (`tekenWanden`, `wandTextuur`), het land om de kaart ook op de helling, en het graan dat meebuigt
  (`tekenGraan`, in smalle stroken en korte stukjes die elk de hoogte van de grond volgen, ver uitgezoomd grover); de grond
  met hoogte van achter naar voren. **Wat de hoogte doet** (stap 2, 8 okt; Marcel: "Akkoord"): niemand stapt door een wand
  (`T.kanStappen`; `T.zoekPad` en `T.bereik` krijgen de kaart mee, `wereld`, en de eilanden en de velden vragen het ook),
  wel over een helling; een gebouw of erf niet op steile grond (`T.teSteil`, "te steil" in `T.waaromPastHetNiet` en
  `T.waaromPastErfNiet`), en waar het komt, wordt de grond vlak (`T.egaliseer`, vanuit `zetGebouwVoorwerp` en het
  doorgroeien: een vlak stuk vooraan in `w.hoogte.vlakken`); een heuvel houdt het zicht tegen (`T.heuvelTussen` in
  `T.zichtTussen`) en wie hoog staat, ziet verder (`T.verderVanBoven` in `T.zietTegel`); en een tegel die iets achter zich
  afdekt (`T.dektAf`), komt nog eens in de tekenlijst (`heuvelsErvoor` in `js/tekenen.js`). De proefplaat:
  `gereedschap/pixelart/hoogte-proef.cjs`.
- `js/eiland.js`: **het eiland, de kaartenmaker** (vraag 117, stap 1, 8 okt; Marcel: "Ik wil 1 aaneengesloten landschap",
  "B 1"): uit één nummer een eiland van 2500 bij 2500 tegels, gemaakt zoals een schilder werkt, eerst grof en dan elk
  blaadje. **De schets** (`T.maakEiland(zaad)`, zo'n 0,6 s, niet bewaard: hetzelfde nummer maakt hem opnieuw): het eiland
  in vakken van 8 bij 8 tegels (`E.n`), met de vorm (`E.vorm`: de lange as, de bergrug met zijn passen), de hoogte per
  vak, de zee (wat aan de rand vastzit) en het hoofdland; het water, vanaf de zee het land in (priority-flood:
  `E.afwaarts`, `E.afvoer`, `E.stroomPeil`), waarbij alleen de grootste kommen een meer worden (`E.meren`, `E.meer`) en
  de rivier zich door de rest een weg slijt; de rivieren als gladde, slingerende lijnen (`E.rivieren`); de streek per vak;
  de plekken (`E.plekken`: het kasteel op een heuvel, de stad aan de grootste monding, acht dorpen met een naam uit
  `T.DORPSNAMEN`, elk waar een dorp kan groeien en zonder berg naar de camera toe, en één met `jij`); en de wegen
  (`E.wegen`, A\* over de vakken, die samen lopen waar het kan). **Het detail** (`T.eilandStuk(E, x0, y0, b, h, stap)`):
  per tegel de hoogte, de streek (`T.EILAND_STREKEN`: het water, strand en duinen, en de zes van de landkaart), de weg en
  de bomen, uit het nummer en de schets; een stuk is hetzelfde hoe je het ook vraagt, zodat het spel later het land maakt
  aan de rand van de mist. Alleen optellen, vermenigvuldigen, delen en wortels (een toets kijkt het na), zodat elke
  browser hetzelfde eiland maakt. **Je dorp op het eiland** (stap 2a, Marcel: "C dorp dat er al was", en "Het eiland wordt
  gewoon altijd gegenereerd bij een nieuw spel"): elk nieuw spel maakt het eiland (`T.MAKER_INSTELLINGEN.opEiland`; de
  spelregel "Je gehucht" zet het alleen voor de toetsen en de speeltest uit, `voorProeven`), en je land is het stuk ervan
  om jouw dorp:
  `T.landVanEiland(E, plek, b, h)` geeft de maker de streek per tegel en per hoekpunt, de bomen en waar de wegen het land
  verlaten, en `T.eilandVan(zaad)` onthoudt het laatste eiland. De maker (`js/maker.js`, met `land`) legt het gehucht erop
  als een dorp dat er al was; de kaart onthoudt waar hij ligt (`w.eiland`). **Het eiland om je land** (stap 2b): buiten
  de kaart loopt het eiland door, met de regels van de maker (`T.randVanHetEiland(w)` in `js/maker.js`, één keer per kaart,
  niet in `Spel.S`; `T.grondVanStreek`), en `js/tekenen.js` tekent het als het land en het bos om de kaart. **De grond
  van het eiland** (B van 2a): de zee, het strand, het veen en het broek hebben eigen tegels (`tegels/kust.png`, uit
  `node gereedschap/pixelart/randtegels.cjs kust`; `T.sprites.grondMetHoeken` zoekt in rand en kust); welke twee soorten
  samen een tegel hebben, zegt `T.grondPaar`, wat niet past wijkt (`T.passendeGrond`), en een tegel met drie soorten
  wordt er een met twee (`T.grondTegelHoeken`); de zee is water (`T.isWaterGrond` in `js/wereld.js`). De plaat:
  `node gereedschap/pixelart/eiland-plaat.cjs [nummer] [--groot]` (in `gereedschap/pixelart/uit/eiland/`). De getallen in
  `T.EILAND_INSTELLINGEN`.
- `js/sprites.js`: de pixel art uit `beelden/`. `T.sprites.figuur/tegel/muur/voorwerp` wijzen
  een cel op een vel aan, `T.sprites.houding(S, wezen)` kiest houding, richting en fase uit de
  spelstaat zelf (pad, uitval, flits, dood), en
  `T.sprites.teken` legt het anker van de cel op het midden van de tegel. Laadt alles met
  `Image`, nooit `getImageData`: anders werkt `file://` niet meer. **De vellen zijn ingepakt**
  (vraag 114, 2a; samen zo'n 210 MB in de browser, was 900): een vel met voorwerpen in `tegels/` zegt per tegel
  waar hij staat (`cel` en `anker` in `tegels.js`; vraag het aan `T.sprites.celVan`), alleen de grond is nog een
  raster; een figuurvel is een raster met een cel die zo klein is als wat erin staat; en de bouwfasen hebben per
  gebouw een eigen vel (`tegels/bouwfasen/`), dat pas laadt als er een in aanbouw staat (`T.sprites.bouwfase`;
  `T.sprites.bezig()` zegt hoeveel er nog onderweg zijn). **Een vel per tekening** (vraag 114, stap 1): de huizen en
  de gebouwen hebben elke tekening in een eigen bestand (`tegels/huizen/`, `tegels/gebouwen/`; `perTekening` en
  `bestand` per tegel in `tegels.js`), dat pas laadt als hij op de kaart staat (`T.sprites.laadWatErStaat`, vanuit
  `js/tekenen.js` bij een andere kaart of `T.kaartVersie`); tot dan tekent hij niets, en een huis dat doorgroeit, houdt
  zijn oude plaatje tot het nieuwe er is (`T.sprites.wachtOp`). **De figuren net zo** (stap 1b): een figuur laadt pas
  als zijn wezen op de kaart staat (wie maait, krijgt de maaier erbij; welke figuur iemand draagt, zegt `figuurNu` bij
  `T.sprites.houding`), wie van figuur wisselt, houdt zijn oude beeld tot het nieuwe er is, en wie net komt, staat er
  pas als zijn figuur er is (`T.sprites.laadtWezen`, in `tekenWezen`). Bij het begin zo'n 80 MB aan plaatjes; wat de
  browser vasthoudt, zegt `Spel.debug.vellen()` (`T.sprites.geladen`).
- `js/anim.js`: beweging en effecten. `T.anim.*` geeft beloftes, zodat een beurt als gewone
  code met `await` leest. Wachten gaat in speltijd (`S.tijd`), niet met `setTimeout`. Wie loopt, loopt op een kaart
  (`T.beweegWezens(S, w, ...)`): waar je bent, of een dorp waar je niet bent (`js/dorp.js`).
- `js/verkennen.js`: rondlopen, klikhandelingen, dwalende monsters, ontdekt worden. Dwalen gaat op een kaart met het dorp
  dat er ligt (`T.dwaal(S, w, D, dt)`; `T.laatDwalen(S, dt)` is dat voor waar je bent). Wie twee keer na elkaar geen weg
  vindt naar waar hij hoort, wacht een uur (de rem, `T.LOPEN_INSTELLINGEN` in `js/lopen.js`; Marcel, vraag 88), en per
  beeld zoeken hooguit `zoekPerBeeld` mensen een weg (de drukte 's ochtends en 's avonds, 3 okt).
- `js/gevecht.js`: de overgang, beurtvolgorde, actiepunten, handelingen, monster-AI
  (`planMonsterBeurt`, los van het scherm en dus te toetsen). Sinds 29 sep voor een groep: aan jouw kant (kant
  'speler') de schout en de militie, elk met een eigen beurt; wie aan de beurt is, zegt `T.aanDeBeurt`, en een
  vijand zoekt de man van jouw kant die het dichtst bij staat.
- `js/quests.js`: de quests als gegevens (nu nog leeg, met de vorm erboven);
  `js/quest.js`: de regels erachter, zonder scherm en dus te toetsen — fasen en wegen
  (`T.zetQuest`, `T.neemWeg`, `T.werkQuestsBij`), goud (`T.geefGoud`), de haken waarmee een
  gesprek erop let (`T.questVoorwaarde`, `T.questGevolg`), voorwerpen die aan een quest hangen,
  en `T.keurQuests`, dat de toets van drie antwoorden nakijkt.
- `js/dialoog.js`, `js/ui.js` (alle html over het beeld), `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera). **Het overzicht** (vraag 108, a): `Tab` tilt de camera van de schout af en zoomt uit
  (`T.wisselOverzicht`, `S.overzicht`, alleen scherm); slepen of de pijltjes schuiven, het wiel zoomt, en wat je klikt,
  doet de schout nog altijd. `Tab`, een klik op de schout of een gevecht brengt je terug. Op een groot scherm tekent het spel op een hele deling ervan, minstens
  1920×1080 (de tussenbuffer, `formaat`, vraag 123): op 4K 1920×1080 maal twee; wat er getekend wordt, zegt `T.tekenMaat()`,
  en de muis rekent om in `naarVlak`. Ver uitgezoomd bewaart
  `js/tekenen.js` de grond op de maat van het scherm, en het bos om de kaart heen in een buffer (`bosGebakken`). **De
  meter** (`F2`): beelden per seconde, en wat de regels en het tekenen per beeld kosten.
- `js/gl.js`: **tekenen met de videokaart** (vraag 123): een eigen kleine laag op WebGL die zich voordoet als het 2D-doek,
  zodat `js/tekenen.js` er hetzelfde op tekent. Plaatjes, vlakken, bolle vormen en ronde verlopen tekent de kaart zelf;
  de rest gaat via een kladdoek in 2D en komt als plaatje op zijn plek (`T.gl.telling` zegt hoeveel). Een buffer die
  opnieuw getekend wordt, krijgt een nieuwe `versie` (`nieuweBuffer`), anders gaat hij niet opnieuw naar de kaart.
  `T.tekenBeeld()` (`js/main.js`) tekent het scherm met of zonder, naar de spelregel "Tekenen"; zonder echte videokaart
  vanzelf zonder (`ookOpDeProcessor` zet het voor de proeven hier toch aan, ook nadat het spel geladen is). Het gewone
  doek ligt erboven en vangt de muis. **Het licht** (vraag 125, A): de nacht is met de videokaart een lichtkaart op de
  halve maat (de kleur van het uur, `T.lichtKleurVan` in `js/dag.js`, en per lamp een warme plas die flakkert,
  `lichtenInBeeld` en `T.LICHT_INSTELLINGEN` in `js/tekenen.js`), waarmee de wereld vermenigvuldigd wordt
  (`tekenLichtkaart`); zonder videokaart blijft het de donkere laag van hiervoor. **De schaduwen** (vraag 125, B): wat in
  de tekenlijst staat, nog een keer als silhouet scheef over de grond (`tekenZonneschaduw`, `T.zonStand` in `js/dag.js`),
  op een masker dat in één keer over de grond gaat (`beginSchaduw`, `eindSchaduw`); de spelregel "Schaduwen".
- `js/doorkijk.js`: wie je door een boom of een huis heen ziet (`T.zichtbaarDoor`,
  `T.werkDoorkijkBij`), en hoe: het kijkvenster (`T.tekenKijkgat`) of het raster (`T.tekenGerasterd`),
  een keuze in de spelregels (`beeld.md`, "Doorkijk"). `js/tekenen.js` vraagt het aan. Het eerste stuk
  dat uit `tekenen.js` ging (vraag 25, D, 26 sep).
- `js/mensen.js`: **wie de mensen van het dorp zijn, op één plek.** `T.MENSEN.<id>` zegt hoe hij
  heet, hoe snel hij loopt, hoe ver hij dwaalt, welk gesprek hij voert en welk vel hij krijgt —
  zijn eigen (zijn id is de naam van het vel), een geleend vel (`vel: 'boer'`) of dat van een
  gewone dorpeling (`zaad: 14`). De kaart zegt alleen nog wáár hij staat:
  `{ x, y, wie: 'koster' }`. Dat is er gekomen omdat het er honderd kunnen worden (Marcel,
  22 sep): een mens stond over vier plekken verdeeld en niets verbond ze, dus kon dezelfde persoon
  op twee plekken staan zonder dat iets klaagde. `T.naamVanMens`, `T.gesprekVanMens`,
  `T.maakDorpeling` en `T.maakMens` zijn de vragen eromheen.
  **Wie geen naam hoeft te hebben, staat er niet in:** `{ x, y, zaad: 7 }` is menigte.
  **`T.WEZENS` gaat over wat een wezen ís** — wat vecht, met hoeveel levenspunten, wat in code
  wordt neergezet — en een dorpeling is dat niet. Daar staan alleen de schout en de monsters.
  Er staan ook mensen in `mensen.js` zonder plek op een kaart (de smid, de herbergierster, de
  molenaar, ...): voor als het gehucht een dorp wordt. Wie over de weg komt en op geen kaart staat
  (de heer, de inner, de marskramer), heeft `bezoeker: true`.
- `js/bewoners.js`: **wie er in het dorp woont, met wie, in welk huis, en wie waar werkt** (3b,
  stap 2; `ontwerp/spel.md`, "Mensen worden poppetjes"). Het getal in de balk (`D.bevolking`) blijft
  de waarheid; de bewoners (`D.bewoners.mensen`) volgen het, één per mond, elk met een naam, een
  leeftijd (`T.LEEFTIJDEN`, die ook zijn vel kiest), een huis, een gezin en een poppetje
  (`e.bewoner`). De schout en de boeren zijn ook bewoners, met het wezen dat de kaart al neerzette.
  Hoeveel handen een gebouw krijgt, zegt `T.verdeelHanden` (`js/gebouwen.js`); wíé dat zijn,
  `T.wijsWerkToe`, en wie werk heeft, houdt het. Waar iemand op welk uur hoort, zegt `T.dagAnker`
  (`js/dag.js`) voor iedereen; de plekken daarvoor (zijn deur, de put, zijn werk, waar hij vrij is)
  zet dit bestand. Komen en gaan zie je (`T.werkBewonersBij`, elk beeld): een nieuw gezin komt overdag
  over de weg binnen, op dezelfde manier als een bezoeker (`T.bezoekerKomtAan`), en wie wegtrekt,
  loopt de weg af; het bericht zegt wie het zijn. Werk telt in uren (`T.werkUrenVan`, een optie): een
  werkplaats maakt naar de uren dat zijn mensen er echt zijn, min de weg van hun deur erheen. Hoe lang
  iemand ergens heen loopt, zegt `T.looptijdVan` (ook voor de herberg).
- `js/erven.js`: **het dorp bouwt zelf** (stap 1 van de proef, vraag 52, 28 sep): jij wijst een erf aan met het
  bouwmenu (10 bij 10 tegels, `T.ERVEN_INSTELLINGEN`; land, geen gebouw: `D.erven`), en is het dorp vol, dan
  neemt een nieuw gezin een vrij erf (`T.kiesErf`) en zet er zelf een hut op met hout uit de voorraad
  (`T.zetHutOpErf`; zonder hout wacht de bouwplaats, `T.tikErvenDag`), op de plek die bij het aanwijzen al vastlag, met
  drie tegels looppad rondom (`erf.plan`, `T.huisPlekOp`; Marcel, 3 okt). Het woont er al terwijl de hut oprijst
  (`T.telWoonruimte` in `js/gebouwen.js`), en de hut weet welk huis hij wordt (`wordtTekening`), zodat hij binnen
  zijn erf doorgroeit. Zonder vrij erf zegt het dorp dat er geen plaats is (`T.gezinZoektEenErf`). Wat in het
  bouwmenu staat, zegt `T.inBouwmenu`: het erf, en de woningen niet, tenzij de spelregel "Huizen" anders zegt. Op
  een akker, een weide, een pad, een erf of zand (het strand van het eiland) bouw je niet (`T.waaromNietOpDezeGrond`). De paaltjes op een vrij erf
  tekent `js/tekenen.js` (`T.paaltjesVan`, `T.sprites.paaltje`). **Een erf mag op struiken en bomen** (vraag 110, e, 6
  okt): wat te rooien is (`T.ontginWerkOp` in `js/bos.js`) houdt het niet tegen (`T.rooiTekst` voor de muis), ook niet in
  het looppad om de hut buiten het erf; het gezin dat het neemt, rooit het erf met dat looppad zelf (`T.kavelVanErf`), en
  zolang wacht de hut, nog niet op de kaart (`js/bos.js`). Een erf in het bos van de heer kost zijn gunst. **Een erf houdt
  plaats voor een put en een kapel** (vraag 117, 2d): het komt niet waar zijn huis straks geen put of kapel kan halen, of
  waar het een ander huis de laatste plek ervoor afneemt; waar er nog een kan komen, op open grond of na het rooien, zegt
  `T.kringGrond` (`js/wensen.js`, met `T.kanHierKomen` in `js/verzoeken.js`), één keer per stand van het dorp, en de
  plekken pas als een huis er straks geen haalt. Een hut op een erf telt daarbij met zijn hut en het huis dat hij wordt
  (`T.kringVoetenVan`), en wil wat dat huis wil (`T.wilStraks`: de kapel); het dorp zet een put of kapel voor hem waar
  hij die allebei haalt (`T.kringTeller` met `straks`, in `T.plekVoor`).
- `js/bos.js`: **het bos: omhakken, rooien, planten en groeien** (vraag 110, e, met 115, 6 okt; Marcel: "A ja B ja C ja D
  zo"), met de getallen in `T.BOS_INSTELLINGEN`. Wat te rooien is, zegt `T.ontginWerkOp` ('hakken' voor een boom,
  'rooien' voor een stronk, een struik, een boompje of een jonge boom); een boom om met `T.hakBoom` (het hout naar de
  schuur: `houtPerBoom`, wie hem ook omhakt) of `T.velBoom` (zonder), en de rest eruit met `T.rooi`. Bos is waar minstens
  `bosBomen` bomen in de vijf bij vijf tegels staan (`T.isBos`; ook de bosrand waar de boeren sprokkelen). **De
  houthakker** (vraag 115; de spelregel "De houthakker") maakt zijn hout zoals altijd (2 per dag, in `T.tikGebouwenDag`),
  maar uit een boom: de dichtste binnen `hakStraal` van zijn schuur (`T.boomVanHouthakker`, `g.boom`), en elke
  `houtPerBoom` hout is die om (`T.houthakkerHakte`, `g.gehakt`): een stronk (`v.gehaktOp`, vergaat na `stronkDagen`, en
  staat niet in de weg), en stond hij in het bos, twee boompjes ernaast (`boompjesPerBoom`, `T.plantNaast`, `v.geplant`,
  `v.wordt`; wat hij kapt en inplant, blijft bos: `T.isBos` met `ookJong`, vraag 129, f), die in een jaar of twee via een
  jonge boom een boom worden (`T.tikBosDag`; de tekeningen `boompje`, `jongeEik`, `jongeDen`, `jongeBerk` in het vel van
  de bomen). Staat er binnen zijn bereik geen boom meer, dan staat hij stil (`T.waaromHaktHijNiet`) en wil hij geen handen
  (`T.houthakkerZonderBoom`, in `T.verdeelHanden`): zijn hand werkt elders tot er weer een boom staat; de raad zegt het
  (`geenBoom`), en een nieuwe houthakker vraagt het dorp pas als het hout de winter niet haalt (vraag 129, e). Hij komt
  alleen bij minstens 30 bomen binnen tien tegels (`bij` in `T.GEBOUWEN`; vraag 129, b). Zijn poppetje hakt aan zijn
  boom en brengt het hout in bundels naar de schuur (`hakHout` in `js/veldwerk.js`). **Rooien:** een gebouw op een stuk
  waar nog iets te rooien staat (een boom, een stronk, een struik: `T.teRooienOp`, `T.watTeRooien`), wacht erop
  (`g.wachtOpRooien`, met `g.kavel` en `g.rooienTot`), nog niet op de kaart (`T.bouwGebouw` zet het er pas met
  `T.zetOpDeKaart` op), maar telt al mee: de hut van een gezin op zijn erf (`js/erven.js`), of een werkplaats die een
  inwoner vroeg waar geen open grond meer was (`T.plekVoor` in `js/verzoeken.js`; `rooien` bij `T.plaatsGebouw` en
  `T.waaromPastHetNiet`). Wie rooit (`T.rooitHij`: het hoofd van het gezin, of wie de werkplaats vroeg, `p.rooit`), hakt en
  rooit met de bijl zoals een boer ontgint (`T.werkVeldwerkBij` in `js/veldwerk.js`; het gezin van een erf helpt,
  `T.helpAnker`; net zo het hoofd van een huis dat wil doorgroeien, `g.groeitNaRooien`, vraag 130) en werkt zolang nergens; is het stuk vrij, dan ligt de bouwplaats er de volgende dag, en na `rooiDagen`
  rooien de buren de rest (`T.tikRooienDag`). Een stuk in het bos van de heer (`T.inHetBosVanDeHeer`: zoveel bomen als een
  stuk bos bij het ontginnen) kost zijn gunst. Een appelboom is van iemand, behalve waar het huis van een gezin groter
  wordt: die kapt het gezin zelf, als geen vorm zonder hem kan (`T.isEigenBoom`, `v.teKappen`; vraag 130, a2).
- `js/beesten.js`: **het wild in het bos** (vraag 116, stap 1, 7 okt; Marcel: "Rode ogen uit het duister", en "a ja, b
  ja, c ja"): roedels wolven en groepjes herten, zoveel als het bos groot is, uit het nummer van het land (`T.zetBeesten`,
  de eerste keer dat het dorp leeft: `T.werkBeestenBij`, elk beeld vanuit js/main.js en `T.werkDorpBij`), elk met een plek
  diep in het bos (`G.thuis`) en plekken aan de bosrand (`G.rand`). Overdag rusten ze thuis; de wolven lopen 's nachts
  langs de rand, de herten grazen er in de schemering (`T.beestenWillen`). Komt er een mens dichtbij (voor een hert ook een
  wolf), dan gaan ze weg (`G.weg`, `G.vluchtNaar`); wie sluipt, komt dichterbij. Een groep is een ding dat de dieren delen
  (`e.groep`, zoals `e.praatje`): alleen de leider zoekt een weg, de anderen lopen zijn weg af (`G.spoor`), en in
  `T.ontwijk` ruilt de leider met wie van zijn groep in de weg staat. Een dier heeft `e.beest` (geen `e.dier`: dat is vee,
  dat de inner telt), en `e.rust` en `e.rent` voor js/sprites.js (liggen, grazen, rennen). Een wolf begint geen gevecht
  (`T.zoekOntdekking`), de schout kan hem aanvallen; 's nachts lichten zijn ogen rood op (`tekenOgen` in js/tekenen.js,
  met `beelden/ogen.js` uit `gereedschap/pixelart/ogen.cjs`). Het hert komt uit `gereedschap/pixelart/wild.cjs`. **Het
  leven in het bos** (stap 2a; elke nacht `T.tikBeestenDag`, vanuit `T.tikGebouwenDag` na het bos): eerst de herten, en
  een roedel alleen waar hij herten kan halen; in de winter krijgt een roedel honger (`G.honger`) en jaagt hij op de
  dichtste herten (`jaag`, `G.gevangen`); elke lente jongen tot zes (`jongen`), en dan splitst de groep (`splits`): de
  helft zoekt een eigen thuis of trekt weg (`G.trektWeg`: `T.werkBeestenBij` haalt hem van de kaart, niet midden in een
  gevecht); wie honger leed, krijgt geen jongen (`G.leedOp`); een thuis dat niet meer diep in het bos ligt, verhuist of de
  groep trekt weg (`blijfOfVerhuis`; wat de houthakker inplant, telt als bos). **De dreiging** (stap 2b): wie aan het werk
  een roedel ziet, rent naar huis (`schrik`; `T.blijftThuis` in js/bewoners.js, `p.thuisTot`: hij werkt niet, en
  `T.dagAnker` houdt hem binnen), en zijn werkplaats maakte die dag de helft; een roedel met honger is in het donker stout
  (`T.wolvenStout`) en zoekt prooi (`kiesProoi`: een schaap, wie alleen in het donker loopt, of de schout), en slaat toe
  (`slaToe`): een schaap (`T.verliesDier` in js/vee.js, en het voorval "wolven" de ochtend erna, met de vlag
  `wolvenNamenSchaap`: dan doen de jacht, `T.jaagOpDeWolven`, en het hek, `T.hekOmDeSchapen`, echt iets), een mens
  (`bijt`: gewond, `p.gewond`, of dood), of de schout zonder licht (een gevecht); bij zijn lantaarn blijft hij aan de rand
  van het licht (`randVanHetLicht`). De status "Wolven" (`T.wolvenBijHetDorp`, in `T.OORZAKEN`) en de raad. De spelregel
  "Beesten" (aan, zonder doden of uit); de getallen in `T.BEESTEN_INSTELLINGEN`. **De jager** (stap 3a): de helft van zijn vlees
  is klein wild, de rest komt uit de herten in zijn bereik (`T.wildVanJager`, `g.wild`; `T.watDeJagerSchiet` en
  `T.jagerJaagde` vanuit `T.tikGebouwenDag`), twee per groepje laat hij staan, en een roedel van meer dan drie maakt hij
  kleiner; vindt hij geen hert (`g.zonderHerten`, `T.jagersZonderHerten`), dan vraagt het dorp geen nieuwe jager en de heer
  van hem geen vlees. Zijn poppetje loert in het bos (`jaag` in `js/veldwerk.js`). **Het hol** (`zetHol`, `T.holVan`):
  elke roedel heeft er een op de kaart, naast zijn thuis, dat meegaat als hij verhuist (`gereedschap/pixelart/hol.cjs`).
  **De jacht te voet** (stap 3b): "Een jacht" in het voorval (`doe.jacht`, `T.beginJacht`, `D.beesten.jacht`) roept de
  militie op (`T.roepOp`, `T.laatGaan`, `T.militieVan` in `js/rovers.js`), het hol ligt in goud (`T.holVanDeJacht`), bij
  de roedel is het een gevecht (`T.naJacht` vanuit `T.eindeGevecht`), en na twee dagen gaan de mannen zonder je. **Om hulp
  roepen** (3c, `G.aanval`, `e.roeptOmHulp`): wie de wolven aanvallen, roept, de mannen die het horen komen (`moetNaar`
  met `hulp`), een buur jaagt ze weg, de schout vecht, en na een kwartier bijten ze. **Het hek** (3d,
  `T.hekOmDeSchapen`): latten om de meent, met hekjes.
- `js/graanschuur.js`: **de graanschuur en de wachters bij het zaaigraan** (vraag 132, 8 okt; Marcel: "bij honger grijpen
  mensen alles aan. Je moet mensen inzetten om het warenhuis te beschermen", en "Ja, er moet een graanschuur komen"): het
  zaaigraan ligt in de graanschuur (`T.GEBOUWEN.graanschuur`, `T.graanschuurVan`; het dorp vraagt er een zodra er
  zaaigraan apart ligt, `T.watTeBouwen`); komt de honger eraan (`T.zaaigraanInGevaar`, vanuit `T.eetVandaag`), dan zoekt
  een boer je (het voorval `zaaigraanHonger`), en met `doe.bewaak` staan er wachters bij de schuur (`T.bewaakZaaigraan`:
  een per twintig mensen, minstens twee, `T.wachtersNodig`; `p.wacht`, ze werken niet, en `moetNaar` met `wacht`), die
  zoveel beschermen als er staan (`T.zaaigraanBeschermd`). Honger kost dan elke dag vertrouwen, en bij het zaaien gaan ze
  naar huis (`T.tikGraanschuurDag`). De spelregel "Zaaigraan" (bewaken, pas bij nood, als ander graan); de getallen in
  `T.GRAANSCHUUR_INSTELLINGEN`.
- `js/wijngaard.js`: **de wijngaard van de wijnboerderij** (vraag 136, 8 okt; Marcel: "Dat je de boeren ziet plukken,
  volle en lege ranken", en "Alles telt pas als het binnen is"): de wijnboerderij (`T.GEBOUWEN.wijnboerderij`, `wijngaard`)
  is een huis (`gebouwen/wijnhuis`, alleen dat is vast) met in zijn voet van 10 bij 8 rijen ranken als voorwerpen
  (`wijnrank`, `T.zetRanken`, `T.rankenVan`, `T.wijngaardOp`: daar bouw je niet). Een rank staat erbij naar de maand
  (`T.rankStand`: kaal, blad, vol, of leeg als hij geplukt is, `v.geplukt`; het vel `beelden/wijnrank.png` uit
  `gereedschap/pixelart/wijnrank.cjs`). In wijnmaand (`alleenIn`, `T.isPluktijd`) plukt het gezin dat er woont (`g.plukt`,
  elke nacht `T.tikWijngaardDag`; zolang werkt het nergens anders) rank voor rank met een mand (`pluk` in
  `js/veldwerk.js`, `e.mand`, de plukker of plukster), en pas als de mand in het huis is, is de wijn binnen
  (`T.wijnBinnen`, `wijnPerRank`). De getallen in `T.WIJNGAARD_INSTELLINGEN`.
- `js/bouwstijl.js`: **de bouwstijl van een land** (vraag 114, stap 2, 4 okt): elk land van de maker bouwt in één stijl
  (`w.stijl`, uit het nummer van het land, `T.stijlVoorLand`; het ontworpen gehucht heeft er geen en bouwt zoals altijd),
  met per soort een paar vormen, elk met de deur naar elke kant. De huizenbouwer noemt dat een stand; in het spel heet het
  de kant van de deur (`T.deurKantVan`, `T.metDeurNaar`), want een stand is in het spel die van de mensen (`T.STANDEN`,
  `T.standVan` in `js/wensen.js`). Een nieuw huis krijgt het dak van de trede (dat van het gehucht, leien in een dorp,
  pannen met marktrecht), en een stenen huis baksteen pas met een steenbakkerij (`T.stijlTekeningen`, via
  `T.tekeningenVan` en `T.volgendeTekening` in `js/gebouwen.js`); wie doorgroeit, houdt zijn kant en krijgt het dak van nu
  (`T.zoalsNu`, `kiesGroei` in `js/behoeften.js`). Op een erf kijkt de deur naar de weg en staat het huis achteraan
  (`T.zijdenNaarDeWeg`, `js/erven.js`), een verzoek keert zijn deur naar de weg (`T.keerNaarDeWeg`, `js/verzoeken.js`),
  en de maker zet een huis ook vóór het plein, met zijn deur ernaartoe (`T.vormenVanStijl`). Elke tekening zegt in
  `tegels.js` wat ze is (`stijl`, en met `ook` de andere stijlen die haar nemen), uit `STIJLEN` in
  `gereedschap/pixelart/huizen.cjs`; wie doorgroeit, zoekt zijn nieuwe tekening in de stijl van zijn dorp. **De grote
  gebouwen** (stap 3, 7 okt): elke stijl heeft ook de kleine en de grote herberg, de kapel, de woontoren en het huis van
  de schout (`grootGebouw` in `huizen.cjs`); de maker legt het huis van de schout en de herberg in de stijl, een stenen
  gebouw krijgt de steen van zijn stijl of baksteen (`nu`), de herberg groeit in een dorp mee tot de grote (`groeitMee`,
  `laatMeegroeien` in `js/behoeften.js`, met zijn deur aan dezelfde kant, `groeiSchuif`; waar hij groot wordt, blijft
  de grond vrij, `T.meegroeiGrond`), en een stenen huis wordt met marktrecht een woontoren voor drie gezinnen
  (`wordtVanaf`; de stand ambachtslieden kent hem met `ook`). Sinds 8 okt zijn de kapel en de woontoren in de stijl van
  de huizen: het schip en de toren gepleisterd in de kalk van de stijl (wand `kalk` en `gepleisterd` in `huis-sdf.cjs`),
  de woontoren een hoog huis; de proefplaat is `huis-sdf-export.cjs groot3`. De bouwfasen kennen een gebouw uit delen
  (`fasenVanDelen` in `huizen.cjs`), maar een kapel kost zo'n kwartier per stand: render ze in delen van acht à zestien.
- `js/paden.js`: **de paadjes en de lantaarns** (vraag 108, b en d, 3 okt): van elke deur een paadje naar de weg, of naar
  het paadje van een buur (`T.aangelegdNet`, uit de kaart en de gebouwen, niet in S: na `T.kaartVeranderd` opnieuw, met
  `T.kaartVersie` in `js/wereld.js`); waar mensen lopen, slijt het gras (`T.telStap` vanuit `js/anim.js`, een dier telt
  niet; elke nacht `T.tikPadenDag`, in S als `w.paden`), en waar niemand meer loopt, groeit het dicht. Hoe het eruitziet:
  `T.zandHoeken` en `T.hoekenMetPaden` (de hoeken van de grond, zoals `T.sprites.grondHoeken`), in de buffer van de grond
  (`js/tekenen.js`). Een lantaarn bij de deur van wat `lantaarn` heeft in `T.GEBOUWEN` (de kapel, de herberg, de markt,
  het wachthuis) en op de kruisingen (`T.zetLantaarns`; op een lantaarn bouw je niet). De ramen van een huis waar iemand
  thuis is, branden 's avonds (`T.lichtBronnen` in `js/zien.js`). De spelregel "Paadjes"; de getallen in
  `T.PADEN_INSTELLINGEN`. Een pad loopt nog niet sneller.
- `js/treden.js`: **van gehucht tot dorp, en tot marktrecht** (stap 2 van de proef, vraag 53, 29 sep; sinds 2 okt uit de
  standen, vraag 90): zoals in Anno 1602 wordt het gehucht een dorp bij 20 dorpelingen (wie in een huis of een stenen
  huis woont, `T.mensenVanStand` in `js/wensen.js`), en krijgt het marktrecht bij 20 ambachtslieden
  (`T.TREDEN_INSTELLINGEN`, in de werkbank; de spelregel "Treden" zet de proef van 28 sep terug: 50 mensen met een kapel
  en een smidse). De volgorde van de treden is `T.GEBOUW_TREDEN` (`js/gebouwen.js`). `T.tredeDoel` geeft het doel voor
  het vak linksboven (js/main.js, als er geen quest is), `T.tredeMensenNodig` hoeveel mensen het nog vraagt (voor de
  raad), `T.tikTredeDag` zet `D.trede` (en die gaat nooit terug), en de heer schrijft dan (`T.ui.toonBrief(D, trede)` in
  js/brieven.js, een brief per trede). Het bouwmenu toont deze trede en de treden ervoor (`T.inBouwmenu`; de markt en de
  weverij al in een dorp, vraag 90, B); wat pas in een dorp komt, vraagt `T.tredeMinstens`, en hoe een trede heet,
  `T.tredeNaam`. Hoe je dorp heet (`D.dorpsnaam`, `T.dorpsnaam`, `T.zetDorpsnaam`), kies je bij Nieuw spel
  (js/menu.js), met een voorstel uit `T.DORPSNAMEN` (vraag 60).
- `js/raad.js`: **de raad onder het doel** (stap 5 van de proef, vraag 58, 29 sep; de eerste weken, vraag 47,
  herschreven): één regel onder het doel linksboven die zegt wat nu tussen jou en een dorp staat, met de toets erbij
  (`[B]` wordt een toets): de eerste uit `T.RADEN` die nu geldt (`T.raadNu`). Hij vraagt het aan de regels zelf: of er
  een gezin komt aan de groei (`T.waaromGeenGezin` en `T.volgendeGezinDag` in `js/gebouwen.js`), het hout en het eten
  aan de winter, wat de huizen missen aan de wensen (`T.watDeHuizenMissen`, vóór het doel; vraag 87), en wat je mist voor
  wat het doel vraagt aan de treden (`T.doelGebouwen`), met waar het vandaan komt. Na de laatste trede telt hij tot de
  maat van de winst (`T.mensenVoorDeWinst` in `js/einde.js`), en is die gehaald (`T.maatGehaald`), dan zegt hij dat je
  een vrij erf weghaalt (vraag 102, c). Haalt het eten de winter niet, dan zegt hij wat helpt (`T.watHelptAanEten`, vraag
  133, b: ontginnen, een visser per dertig mensen, een jager als er herten zijn, een graanschuur, meer weide, zaaigraan
  kopen), en vraagt het dorp het gebouw dat hij noemt. Na een voorjaar met honger maakt een boer zelf een veld weide
  (`weideErbij` in `T.boerenKiezenVelden`, `D.behoeften.voorjaarsHonger`). Vanaf de herfst zegt hij of vis en vlees de
  winter halen, als de beek dichtligt (`T.visEnVleesVoorDeWinter` in `js/behoeften.js`, `T.visEnVleesRaad`; vraag 132,
  B): hoeveel zout er bij moet (de marskramer heeft er in de herfst het meest), en een visser of jager als er dan te
  weinig ligt. Wie eet, eet eerst wat ongezouten is. Uit te zetten in de spelregels ("Raad").
- `js/wensen.js`: **de wensen van de mensen, per stand** (stap 2 van vraag 79, vraag 80 en 85, 1 okt; zoals in Anno
  1602): elk huis met mensen heeft een stand naar zijn soort (`T.standVan`: een hut keuters, een huis dorpelingen, een
  stenen huis ambachtslieden, een boerderij boeren; het huis van de schout en de herberg geen), en elke stand wil wat de
  stand eronder wil, en meer (`T.STANDEN`, `T.WENSEN`, `T.wensenVanStand`): goederen uit de voorraad (bier, vlees of
  vis, brood, laken; **de hoogste stand neemt eerst**) en plekken in een kring om het huis (`T.inDeKring`; een put,
  een kapel; de herberg en een markt zijn één voor het hele dorp, zonder kring, de spelregel "De herberg en de markt";
  waar ze staan, zegt `T.plekkenVan` in `js/gebouwen.js`). `T.berekenWensen` geeft
  per huis wat het heeft en zijn tevredenheid (eten, brandhout en de rest, met wat het dorp erbij doet), en
  `T.berekenTevredenheid` (`js/behoeften.js`) maakt er het gemiddelde van, naar mensen; de huizen nemen hun goederen
  vóór het eten (`T.gebruikGoederen`), en wat eten is (brood, vis, vlees: `T.voedtAlsGraan`), eet het dorp dan minder
  aan graan (vraag 92); brood weegt minder in hoe blij een huis is (`blijheid`). Wat een huis wil en heeft, staat op het
  huis (`g.wensen`); wat een huis laat zien (2c, vraag 100), zegt `T.huisToestand` (het briefje bij de muis,
  `js/huisbriefje.js`, in de stijl van de schrijftafel, vraag 98, C) en `T.tekenVanHuis` (het teken bij zijn deur,
  `js/tekenen.js`); met een erf in de hand zegt `T.erfKringTekst` welke put en kapel een huis daar haalt. **Wat de huizen
  missen en wat helpt, zegt `T.watDeHuizenMissen`** (vraag 87): de raad, het rapport en de bouwer van de speeltest vragen
  het alle drie, eerst een huis dat op bouwstof wacht, dan wat de meeste mensen missen, met de ketens (vraag 90, D: wat
  een werkplaats nodig heeft, `maakt.in`, en wie dat maakt: "de bakkerij heeft geen meel, bouw een molen [B]"). Met een put, een
  kapel, de herberg of een markt in de hand zie je de kring (`js/tekenen.js`) en zegt de muis wie hij bereikt
  (`T.kringTekst`). **Doorgroeien per huis** (2b, in `js/behoeften.js`): heeft een huis een maand op rij alles, dan
  groeit het door naar de volgende stand, als de bouwstof er is (`bouwstof`: een huis hout, een stenen huis steen), ook
  de woningen van het begin (`T.zetBestaandeGebouwen` geeft ze hun tekening als voorwerp), en het rijst op in de laatste
  bouwfasen terwijl zijn mensen erin blijven wonen (alleen het voorwerp is `inAanbouw`, `groeiVanafFase`; G, vraag 114).
  Staat er alleen iets te rooien waar het groter wordt, dan rooit het gezin dat eerst (`T.groeiRooiPlan`,
  `T.rooiOmTeGroeien` in `js/bos.js`, `g.groeitNaRooien`), en anders zegt het briefje waarom (`T.waaromGroeitHetNiet`;
  vraag 130), en de raad ook als het genoeg mensen is voor de winst (c2); een erf komt niet waar het een huis elke vorm
  afneemt waarin het nog kan groeien (`T.groeiGrond`, in `T.waaromPastErfNiet`; d). Achteruitgaan is zacht (een
  gezin trekt alleen weg uit een huis onder de vertrekdrempel) of streng (de spelregel "Achteruitgaan"); een hogere stand
  betaalt meer belasting (`T.belastbaar`). De spelregel "Wensen" op "Het dorp als geheel" is het spel van vóór 1 okt; de
  getallen in `T.WENSEN_INSTELLINGEN`.
- `js/wetten.js`: **de wetten** (stap 3 van de proef, vraag 54, 29 sep; eerst keuren genoemd): een menu zoals in
  Democracy 3 (`js/wettenmenu.js`, onder `W` en als knop in de balk), met het rantsoen, vreemden welkom, houtkap in
  het bos van de heer en de belasting. Wat een wet doet, staat als getallen per stand in één blok
  (`T.WETTEN_INSTELLINGEN`, in de werkbank); de regels vragen het aan `T.wetFactor` en `T.wetSom`: wat een mens eet
  (`T.etenPerMens` in `js/behoeften.js`, één plek voor het rantsoen), de tevredenheid (`T.wettenTevredenheid`), om de
  hoeveel dagen een gezin kan komen (`T.gezinDagen`) en wat een houthakker hakt (`T.maaktUit`, met `bos` op het
  gebouw) in `js/gebouwen.js`, en de boete voor de houtkap op de rekening van de heer (`T.houtkapBoete`). Wat een
  kaart in het menu zegt, komt uit dezelfde getallen (`T.watDeWetDoet`). Wat je aannam, staat in `D.wetten`; zonder
  staat elke wet op zijn standaard, en speelt het spel zoals ervoor.
- `js/herberg.js`: **de herberg** (werklijst punt 2, 27 sep): wie er 's avonds heen gaat
  (`T.herbergGasten`: naar karakter, seizoen en looptijd, en niet meer dan er bier is), het anker voor de
  avond (`T.herbergAnker`, dat `T.dagAnker` vraagt), de afrekening elke nacht (`T.tikHerbergDag`: bier op,
  en wie er was, maakt het dorp tevredener), en de lantaarn 's avonds (`T.herbergLicht`). Het brouwen is
  gewoon werk van het gebouw (`T.GEBOUWEN.herberg.maakt`), tot er genoeg ligt, zoals elke werkplaats die iets omzet
  (`T.maaktTot` in `js/gebouwen.js`, vraag 91, b), boven het bier dat ze apart houdt voor de huizen tot de oogst
  (`T.bierApart`, `T.dagenTotDeOogst` in `js/akkers.js`; vraag 102, b): de gasten drinken wat erboven ligt. In het gehucht
  staat hij vanaf het begin, en de herbergierster woont er. In de herberg wordt gepraat: de roddelaar
  vertelt er wat er in zijn kelder ligt (`g.verteld`, `js/verstoppen.js`), de herbergierster vertelt jou
  wie er zat, en de marskramer logeert er (`T.logiesAnker`). 's Avonds branden de ramen van de herberg,
  met de gasten erachter als schimmen: de huizenbouwer geeft per huis door waar de ramen zitten (`ramen`
  in `tegels.json`), en `js/tekenen.js` tekent ze zo dat wat ervoor staat ze afdekt (`brandendeRamen`). Sinds vraag 104
  kan er een tweede herberg komen (`js/ondernemers.js`): `T.herbergenVan` geeft ze allemaal, `T.herbergVan` de eerste
  (waar de herbergierster woont en de marskramer logeert), en wie 's avonds gaat, gaat naar de dichtste
  (`T.herbergVanGast`).
- `js/doorzoeken.js`: **de soldaten doorzoeken het dorp** (werklijst punt 4, stuk 1, 27 sep): op
  Sint-Maarten onder de grens van de argwaan op twee of drie plekken (`T.beginDoorzoeken`, vanuit
  `T.heerStaatErOp`). Ze lopen met de schout mee (`T.loopNaastDeSchout` in `js/inner.js`, zoals de inner)
  en doorzoeken plek voor plek wat zijn route vlak passeert (`T.zoekOpPlek` in `js/verstoppen.js`); na een
  paar uur kiezen ze zelf, en zo vaak als zijn argwaan kiest de heer (`T.werkDoorzoekenBij`, elk beeld).
  De rechthoek van een gebouw vraag je aan `T.voetVanGebouw` (`js/gebouwen.js`).
- `js/rovers.js`: **de rovers en de militie** (stap 4 van de proef, vraag 55, 29 sep): wie wegtrekt, gaat het bos in en
  komt terug als rover (`D.rovers.bende`, `T.wordtRover` vanuit `js/bewoners.js`), en er komen wilde rovers van buiten
  (`T.tikRoversDag`). Een aanval (`D.rovers.aanval`, `T.werkRoversBij`): tegen de avond van de rand van de kaart
  (`T.roverIngang`) naar een akker, twee uur roven (graan uit de voorraad, en soms de akker kapot: `T.vertrapAkker` in
  `js/akkers.js`), en weer weg. De mannen van het wachthuis lopen dan met de schout mee (`opgeroepen`, zodat
  `T.dagAnker` en het dwalen ze met rust laten) en vechten mee (`T.militieInGevecht`). Wie valt, is dood: een rover
  is uit de bende (`T.roverVerslagen`), een wachter een mond minder (`T.sneuvelt`, via `T.wijzigBevolking` met wie
  het is), en wie het overleeft, geneest na een nacht. De getallen in `T.ROVERS_INSTELLINGEN` (in de werkbank).
  Ook de veteranen van de heervaart vechten mee (`p.veteraan`, met het leven van `T.WEZENS.veteraan`).
- `js/heervaart.js`: **de heervaart** (vraag 60, A en B, 29 sep): in een dorp vraagt de heer op 1 hooimaand een man per
  tien zielen voor zijn oorlog, of goud (`T.vraagHeervaart`, `T.heervaartKeuzes` voor de knoppen onder zijn brief).
  Sturen (`T.stuurHeervaart`): wie gaat (`T.weerbareMannen` in `js/bewoners.js`), blijft bewoner, telt mee en eet,
  maar werkt nergens en loopt de weg af (`T.stuurWeg`, `p.weg`); op 1 herfstmaand komt hij terug (`T.komtTerug`), een
  op de vier niet, en wie terugkomt, is veteraan. Vrijkopen (`T.koopHeervaartAf`) kost goud en argwaan. Wie niet
  kiest, stuurt ze na een week. De getallen in `T.HEERVAART_INSTELLINGEN` (in de werkbank), de spelregel "Heervaart".
- `js/voorvallen.js`: **het dorp spreekt je aan** (vraag 65, A, 29 sep): om de paar dagen, in de winter vaker, komt
  iemand de schout zoeken met een vraag, een ruzie of een ramp (`T.tikVoorvallenDag`, `T.kiesVoorval`, dat loot naar
  `T.gewichtVanVoorval`: een probleem met een oorzaak uit `T.OORZAKEN`, honger, kou, vol of onvrede, komt vaker als die
  speelt en zelden als hij niet speelt, vraag 74, B; `T.oorzaakVan` zegt welke, en het bericht zegt waarom): hij krijgt een
  uitroepteken, loopt naar je toe (`T.werkVoorvallenBij`, met `T.loopNaastDeSchout` zoals de inner; `e.zoektSchout` laat
  het dagritme, het dwalen en het maaien hem met rust) en spreekt je aan zodra je stilstaat (`T.ui.spreekAan`); de tijd
  staat stil tot je kiest. Wanneer en over wie staat in `T.VOORVALLEN`, de woorden onder dezelfde naam in
  `js/gesprekken.js` (naam `'{wie}'`, en `{ander}` in een zin), zodat je ze in de gespreksschrijver leest. Een antwoord
  zegt vooraf wat het kost (`T.prijsVanKeuze`, in het venster onder elk antwoord); wat het doet, staat in zijn gevolg:
  de voorraad, `tevreden` (een stemming die wegslijt, `T.voorvalStemming` in de tevredenheid), `argwaan`, `verban`,
  `sterfkans`, `gezin` (`T.gezinKomt` in `js/gebouwen.js`, dezelfde als de groei), het vee (`T.verliesVee`), en
  `voorval` (een vervolg, later, over dezelfde mensen). Wie je niet sprak, gaat na twee dagen voorbij; ben je weg (een
  ander gebied), dan beslist je raadsman (vraag 68, B). De spelregel "Voorvallen", de getallen in
  `T.VOORVALLEN_INSTELLINGEN`.
- `js/feesten.js`: **de feesten** (vraag 97, 3 okt; Marcel: het oogstfeest "Ja, een hele dag vrij", en "De meiboom"): een
  antwoord met `feest: 'dag'` of `'avond'` (`T.zetFeest`, vanuit `T.voorvalGevolg`) laat het dorp het voorval vieren op
  het plein: een hele dag, en dan werkt niemand (`T.vrijeDag`: de werkplaatsen in `T.tikGebouwenDag` en het maaien in
  `T.werkOogstBij`), of een avond. Wie er is, staat rond het midden (`T.feestAnker`, voor `T.dagAnker`), er brandt licht
  (`T.feestLicht`, in `T.lichtBronnen`), en niemand gaat naar de herberg (`T.feestAvond`). De meiboom komt op een vaste dag
  (`op` in `T.VOORVALLEN`, 30 grasmaand) en staat een maand op het plein (een voorwerp, `gereedschap/pixelart/meiboom.cjs`).
  De spelregel "Feesten"; de getallen in `T.FEESTEN_INSTELLINGEN`.
- `js/zaak.js`: **de verdwenen graanzak** (vraag 128, 8 okt; Marcel: "akkoord, bouwen maar"): de proef voor informatie,
  de zitting en gevolgen, één keer per spel in de eerste herfst (`T.tikZaakDag`, vóór `T.tikVoorvallenDag`). Wat er echt
  gebeurde, staat in `D.zaak` (de dader, het zieke kind, de schuur, de aanklager, de verkeerde verdachte, de buur, het
  spoor; `T.mensenVoorDeZaak`); wat je weet, in `Z.weet`, elk met een soort uit `T.ZAAK_WETEN` (feit, getuige, gerucht)
  en een vlag voor de gesprekken (`zaakBewijs` als het naar de dader wijst). De boer komt het zeggen (het voorval
  `graanzak`); tot de zitting vraag je wie je aanklikt ernaar (`T.zaakGesprekVan` in `js/verkennen.js`, de gesprekken
  `zaakBuur`, `zaakHerberg`, ...; `doe.weet`), en wie bij het spoor staat, ziet het (`T.werkZaakBij`; het spoor tekent
  `tekenSpoor` in `js/tekenen.js`). Het papier "De zaak" is een soort in `js/brieven.js`, onder de knop `#zaak-knop`. De
  zitting is een voorval met `L.plein` (`js/voorvallen.js`): wie erbij hoort, staat 's middags op het plein
  (`T.zaakAnker`, voor `T.dagAnker`), en komt de schout bij het midden (`T.schoutBijDeZitting`), dan begint ze. Een vonnis
  is `doe.zaak` (`T.zaakGevolg`): de zaak is af, het vervolg wacht (`T.ZAAK_INSTELLINGEN.vervolg`), en een zak die nergens
  staat, leest de inner op Sint-Maarten voor (`T.heerLeestHetBoek`, vanuit `T.heerStaatErOp`). De spelregel "De zaak".
- `js/markt.js`: **de markt op het plein, die meegroeit** (vraag 110, d, en vraag 127, 6 okt; Marcel: "Grotere stad =
  grotere markt"): met de spelregel "De markt" op "Op het plein" (`T.MARKT_INSTELLINGEN.opHetPlein`) komt een markt niet
  als gebouw van 6 bij 6, maar als een marktblok op het plein: twee rijen kramen tegenover elkaar met een looppad
  ertussen en een mand naast elke kraam (`T.marktBlok`: het grootste open stuk buiten het feest, `T.feestMidden`, en weg
  van de heer, dat niemand tegenhoudt). Hij komt zoals elk gebouw (een verzoek of je oproep): `T.plekVoor`,
  `T.waaromPastHetNiet` en `T.plaatsGebouw` vragen het hier (`T.marktPlek`, `T.zetMarktOpHetPlein`). Elke nacht
  (`T.tikMarktDag`) komt er een kraam bij tot er een per 15 mensen is (`T.kramenNodig`), eerst in het blok (`g.blok`),
  dan langs de weg vanaf het plein (`T.straatPlek`, de marktstraat); en een kraam ligt vol als het dorp zijn waar heeft
  (`T.heeftWaar`, `waren`), anders leeg. De markt staat in `D.gebouwen` met `opHetPlein`, `kramen`, `manden` en `blok`
  (voorwerpen `kraam`, met `waar` en `leeg`, en `mand`, met `wat`), zonder voet, op het midden van het plein
  (`T.marktMidden`). Wat hij kost, zegt `T.GEBOUWEN.markt.kosten`, naar de spelregel. De kramen per waar en de manden:
  `gereedschap/pixelart/marktkraam.cjs` (`T.sprites.kraam(waar, leeg, richting)`, `T.sprites.mand(naam)`).
- `js/einde.js`: **het eind en het jaar in het kort** (2e, vraag 101, 3 okt): elke nacht (`T.tikEindeDag`, vanuit
  `T.tikGebouwenDag`) telt het dorp de dagen op rij dat iedereen super gelukkig is (`T.iedereenGelukkig`: elk huis met
  mensen heeft alles, in de hoogste stand of ernaast, vanaf 100 mensen; `D.eind`; een slechte week zet de teller stil,
  niet terug, de spelregel "Het eind", vraag 102, d); na 360 is het gewonnen, viert het
  dorp het grote feest (`T.vierVandaag` in `js/feesten.js`) en komt het eindscherm (`T.werkEindeBij`,
  `T.ui.toonGewonnen` in `js/hud.js`). Onder 10 mensen is het spel uit (`D.einde`, reden `'leeg'`). Het jaarboek
  (`D.jaarboek`, uit het dagboek en de oogst, `T.telOogstInJaarboek`) wordt op 1 lentemaand het jaarverslag (een brief,
  soort `'jaarverslag'`). Het doel linksboven na de laatste trede: `T.eindDoel`. De getallen in `T.EINDE_INSTELLINGEN`.
- `js/verzoeken.js`: **de stad groeit door haar mensen** (vraag 103, 3 okt; Marcel: "De inwoners bouwen zelf een weverij
  etc. Ze vragen alleen toestemming om te bouwen"): met de spelregel "Wie bouwt" op "De mensen"
  (`T.VERZOEKEN_INSTELLINGEN.mensen`) staat alleen het erf in het bouwmenu, en vraagt een inwoner je wat het dorp mist
  (`T.watTeBouwen` in `js/raad.js`): een voorval `bouwverzoek` (`T.beginBouwverzoek`, vanuit `T.tikVoorvallenDag`), met `L.bouw` = { soort, x,
  y, waarom, nut } en de woorden `{wil}`, `{gebouw}`, `{plek}`, `{waarom}`, `{kosten}`. Waar het komt, zegt `T.plekVoor` (met drie tegels looppad rondom, zoals elk gebouw; is er geen open grond meer, dan een plek die hij eerst rooit, `js/bos.js`);
  ja (`doe.bouw`) zet het neer (`T.verzoekToegestaan`, met `g.meester`), nee (`doe.weiger`) onthoudt het (`D.verzoeken`).
  Een oproep op het plein (`T.doeOproep`, de rij Oproepen in het bouwmenu) gaat voor, met een premie bovenop de kosten.
  Wat er mag (de trede), vraag je aan `T.magGebouwd`; wat jij in het bouwmenu hebt, aan `T.inBouwmenu` (`js/gebouwen.js`).
- `js/ondernemers.js`: **wie iets wil beginnen wat niemand mist** (vraag 104, 3 okt; Marcel: "Stel er is een ondernemende
  inwoner die wapens wil maken etc"): een op de zes volwassenen is ondernemer, uit het zaad en wie hij is
  (`T.ondernemingVan`, `T.ONDERNEMINGEN`); wat hij nu wil vragen, geeft `T.eigenVerzoeken` aan `js/verzoeken.js` (na je
  oproepen, vóór wat het dorp mist), met een eigen voorval (`wapenverzoek`, `herbergverzoek`) en `L.bouw.eigen`. Ja
  (`T.eigenToegestaan`) en nee (`T.eigenGeweigerd`: na twee keer trekt hij weg) laten een stemming op zijn huis
  (`g.stemming`, `T.huisStemming` in `T.berekenWensen`), en wat een onderneming verder doet, staat bij haar (`ja`, `nee`,
  `prijs` in `T.ONDERNEMINGEN`): de tweede herberg maakt de herbergierster boos (`g.weigert`: ze brouwt een tijd niet). De wapenmaker: wapens (`T.wapensInHetDorp`, `T.bewapen` bij een aanval,
  `T.slagSchade` in `js/gevecht.js`), en die zijn niet verboden (Marcel, 7 okt: "Het is logisch dat er wapens zijn om de
  stad te verdedigen. Alleen weerstand tegen de heer is inacceptabel"; vraag 131): de inner en de heer laten hem met rust,
  en wat de heer niet mocht zien (`verdacht` in `T.GEBOUWEN`), is er niet meer. De getallen in `T.ONDERNEMERS_INSTELLINGEN`.
- `js/bazen.js`: **twee bazen, de heer en het dorp** (vraag 106, 3 okt; Marcel: "106 a b c d ja"): de gunst van de heer
  en het vertrouwen van het dorp in jou (`D.bazen`, 0 tot 100), veranderd met `T.wijzigGunst(D, n, waarom)` en
  `T.wijzigVertrouwen(D, n, waarom)` vanuit de regels waar het gebeurt (de schatting via `T.gunstNaSchatting` in
  `T.gevolgVanBetaling`, de heervaart, de schandpaal, de soldaten, `T.vertrouwenNaVoorval`, `T.vertrouwenNaBevolking` in
  `T.wijzigBevolking`, en elke dag `T.tikBazenDag`: het vertrouwen gaat een stukje naar de tevredenheid, vraag 106,
  stap 3). Onder 20 een waarschuwing (de brief `waarschuwing` in `js/brieven.js`, en de raad), op 0 weg (`T.ambtKwijt` met waarom, of `D.einde` met reden 'verjaagd'), maar altijd eerst
  de waarschuwing. Betrapt op verstoppen: `T.betrapt` (vanuit `T.zoekOpPlek`). De twee gezichten in de balk:
  `T.ui.toonBazen` (`js/hud.js`). De spelregels "Twee bazen" en "Betrapt"; de getallen in `T.BAZEN_INSTELLINGEN`.
- `js/grillen.js`: **elke maand een gril van de heer in een brief** (vraag 106, stap 2): `T.GRILLEN` (veertien, elk met
  zijn brief, antwoorden met `doe` zoals een voorval, en `stil` voor wie niet antwoordt), `T.tikGrillenDag` (op de
  twaalfde, niet in wijnmaand en slachtmaand, als er geen andere brief van de heer wacht), de vraag die wacht
  (`D.grillen.vraag`, `T.grilNu`), de knoppen (`T.grilKeuzes`, met de prijs van `T.prijsVanKeuze`) en het antwoord
  (`T.beantwoordGril`); de brief is soort `gril` in `js/brieven.js`. Een voorval kan nu ook `gunst` en `vertrouwen` in
  zijn `doe` hebben.
- `js/raadsman.js`: **de raadsman** (vraag 66, 30 sep): een van de boeren (`T.isBoer` in `js/boeren.js`), met twee gelote
  vaardigheden (`T.vaardighedenVan`: uit het zaad en zijn naam, zodat het lot van de boeren niet verandert). Is de schout
  weg (niet in het dorp als wie hem zoekt, gaat zoeken, of als diens tijd om is), dan beslist hij het voorval; wie je in
  het dorp niet op tijd spreekt, gaat voorbij (vraag 68, B; de spelregel "Raadsman" kan hem ook dan laten beslissen,
  `nietGesproken`). Hij beslist met `T.raadsmanBeslist` (vanuit `js/voorvallen.js`): het antwoord dat zijn karakter het
  meest waard vindt (`T.raadsmanKeuze`, de neigingen in `T.RAADSMAN_INSTELLINGEN.karakters`), met wat hij kan erin
  (`T.metVaardigheden`).
  Wie het is, staat op zijn poppetje (`e.raadsman`), want ook het maaien kijkt ernaar (`T.boerFactor`: hij maait
  trager). Uit wie je kiest: `T.raadsmanKandidaten`; kiezen: `T.kiesRaadsman`, in het venster Raadsman
  (`js/raadsmanvenster.js`, onder `R` en als knop in de balk; vraag 67, B). Ging er een voorval voorbij dat een
  raadsman had beslist, dan zegt de raad het (`js/raad.js`, `laatstVoorbij` in `D.voorvallen`).
- `js/ochtendrapport.js`: **het rapport van de raadsman, 's ochtends** (vraag 75, 3a, 1 okt; de dag in fasen): wat er
  gebeurde, schrijft het dorp in een dagboek (`T.schrijfOp`, `D.dagboek`: `T.wijzigBevolking` met wie het zijn, wat de
  boeren uit zichzelf deden, wat de raadsman besliste, wie je niet sprak), en elke nacht maakt hij er als laatste stap
  van de dag zijn rapport van (`T.tikOchtendrapportDag`, `D.ochtendrapport`): wat er gebeurde, hoe het graan en het hout
  gaan sinds gisteren, de winter, de oorzaken (`T.oorzakenNu` in `js/voorvallen.js`) en wat er komt. Het zegt wat de
  balk niet zegt, en wat de huizen missen, als status (vraag 87), en zijn rekenen kleurt de getallen (`T.rekenaarVan`).
  Hij brengt het: hij staat aan je deur als je
  opstaat (`T.rapportAnker`, voor `T.dagAnker`), en naast je opent het papier (`T.werkOchtendrapportBij`, het venster
  van de brieven, soort `rapport`); anders ligt het onder de knop Rapport. De spelregel "Het rapport".
- `js/land.js`: **het land** (vraag 63 en 69, 30 sep; stap 1a, stuk 1): een kaart met provincies uit het zaad van het
  spel (`T.nieuwLand`, in `S.land`), wegen met hoeveel dagen reizen, en wat je zag (`gezien`; de rest is donker). Reizen:
  `T.reisNaar` (over wegen die je kent) en `T.beginReis`; `T.werkLandBij` (elk beeld) laat je aankomen of thuiskomen, en
  opent de kaart als de schout op de weg het dorp uit staat (`T.wegInEnUit`). **Wie reist, verlaat de kaart van het
  dorp niet:** de schout gaat uit de wezens, en het dorp blijft `S.wereld`, zodat de heer, de inner, de marskramer en de
  rovers thuis hun werk doen. Of de schout weg is, zegt `T.schoutIsWeg(D)` (`js/dorp.js`; ook een ander gebied), of hij op reis is,
  `T.opReis`; berichten (`js/ui.js`) en brieven (`js/brieven.js`) wachten dan in `S.land` (`T.bewaarVoorLater`,
  `T.briefVoorLater`), en een bezoeker zet de reis niet op 1× (`T.naarGewoneSnelheid`). Achter de spelregel "Land"
  (standaard uit, tot het buurdorp er is); de getallen in `T.LAND_INSTELLINGEN`. Het scherm: `js/landkaart.js` (de kaart
  als SVG, en het venster als je terug bent).
- `js/maker.js`: **de maker, elk spel een ander land** (vraag 69 en 70, 30 sep; sinds 4 okt de standaard, 100 bij 100,
  met natuur, vraag 112): `T.maakGehucht(zaad)` legt een plan uit dezelfde delen als het ontworpen gehucht (het plein als
  hart, de schout erachter, de herberg en hutten eromheen, vijf boerderijen met hun akkers aan de buitenkant, samen 209
  tegels, de heide met de kooi, de weg met het bruggetje), met een bosrand met inhammen, bosjes, struiken, vijvers,
  rotsen en ondergroei; een huis houdt het looppad en achter zich zijn dak vrij (`erfRand`, `dakRand`). Hij keurt het
  zelf (`T.keurGehucht`) en probeert het anders tot het deugt; `T.kaartVanGehucht(plan)` maakt er een kaart met
  betekenisbestand van, zoals Tiled en `gereedschap/wereld.html` ze maken (de grondtegels uit de groep van de
  rand-tegels: "gras over zandpad: boven+rechts"), en `T.laadGemaaktGehucht` leest het in met `T.laadKaart`. Welk land
  een nieuw spel krijgt, zegt `T.landVoorNieuwSpel` (`js/gebied.js`; de spelregel "Je gehucht", een nummer van vijf
  cijfers, in het menu bij Nieuw spel); `T.beginOpKaart` legt alleen met een nummer een land van de maker, dus de
  toetsen spelen op het ontworpen gehucht. De boeren worden uit hetzelfde nummer geloot (`D.lot.zaad`). Het gehucht
  blijft `'gehucht'` heten, zodat alles wat het ontworpen gehucht kent, ook hier werkt; `w.maker` zegt uit welk zaad
  het komt. **Op het eiland** (`land`, vraag 117, stap 2a): het water, het bos, de heide, het zand, de rotsen en de wegen
  komen van het eiland (`js/eiland.js`), en het gehucht is een dorp dat er al was: eerst de huizen om het plein, dan de
  weg van het eiland ernaartoe (`wegenOpEiland`: A\* om het water en de huizen heen, met rechte bruggetjes, `plan.bruggen`),
  dan de boerderijen, akkers en de meent (liever op open land en de heide), en pas dan het bos van het eiland, met een
  gerooide kern (`eilandKern`); lukt het op jouw plek niet, dan op die van een ander dorp (`gehuchtOpEiland`). Zonder
  `land` legt hij byte voor byte wat hij altijd legde. **Wat er ligt, doet ertoe:** een houthakker bij het bos, een steengroeve bij de rotsen, een visser en een
  rietsnijder aan het water (`bij` in `T.GEBOUWEN`, `T.natuurBij` in `js/gebouwen.js`). Wat plat op de
  grond ligt (niet vast, laag), tekent `js/tekenen.js` in de buffer van de grond (`isPlat`), en het maakt plaats voor
  een gebouw.
- `js/zien.js`: **het zichtveld en de getuigen** (werklijst punt 3, 27 sep): wie buiten is, ziet de
  schout als het licht het toelaat (`T.zichtOp`: overdag acht tegels, 's nachts twee, in het licht
  verder), met niets ertussen (`T.zietTegel` in `js/wereld.js`, zoals de inner kijkt). Het licht in het
  dorp staat op één plek (`T.lichtBronnen`: de herberg en de lantaarns op de kaart, die 's avonds
  branden, en de lantaarn van de schout, `T.draagtLantaarn`: buiten in het donker, tot hij sluipt, vraag 125, C),
  voor wie wat ziet én voor het licht in `js/tekenen.js`. Wie de schout iets ziet wegzetten of
  terughalen, is getuige (`T.werdGezien`: de plek onthoudt het in `g.getuigen`, en boven zijn hoofd
  staat een oogje); wie er woont, telt niet. Het venster van de plek zegt vooraf wie je ziet
  (`T.kijkersTekst`). Wie het rondvertelt (de roddelaar, `T.vertelInDeHerberg` in `js/verstoppen.js`),
  vertelt het de eerstvolgende avond in de herberg (`T.getuigenVertellen`, vanuit `T.tikHerbergDag`):
  dan vinden de soldaten die plek makkelijker (`g.verteldDoor`), en de herbergierster vertelt het je
  (`{getuige}`, `{gezien}`). Of je een getuige meteen ziet, is een keuze in de spelregels (`meteen`).
- Een zin in een gesprek kan iets uit het spel noemen: `{woord}` vult `T.GESPREK_WOORDEN` in
  (`js/gesprek.js`), zoals `{gisteravond}` (`js/herberg.js`), en in een voorval `{wie}` en `{ander}`
  (`js/voorvallen.js`).
- `js/akkers.js`: **alleen het gehucht** (`ontwerp/spel.md`): welk stadium een
  akker heeft op welke dag (`T.AKKER_STADIA`, één tabel, `T.akkerStadium`), het windbeeld per
  tegel (`T.windBeeld`) en zijn vaste variant (`T.akkerVariant`), waar een boer zonder bewoners (het gereedschap) in
  het groeiseizoen dwaalt (`T.wandelAnker`, anders gewoon bij zijn huis) en de oogst zelf, tegel voor
  tegel (`T.werkOogstBij`, met een vangnet: haalt hij het seizoen niet, dan wordt bij de volgende
  ploegtijd toch de hele akker in één keer "gemaaid"). Na de oogst, op 1 herfstmaand, kiezen de boeren wat hun velden
  volgend jaar worden (`T.boerenKiezenVelden`, vraag 74, stap 2): een uitgeputte akker rust of krijgt mest, een braak
  wordt weer akker; wat jij koos (`T.zetPlan`, `veld.planDoor`), laten ze staan, en het veldenvenster zegt wie wat koos
  (`T.planTekst`). `js/tekenen.js` tekent ermee (achterlaag,
  wezen, voorlaag, zodat iemand tot zijn middel in het graan staat); `js/kaart.js` koppelt een
  boer aan zijn akker(s) via `huis`, dezelfde id op de boer als op de akker. **Het graan is pas binnen in de schuur**
  (vraag 140, 8 okt; Marcel: "Alles telt pas als het binnen is"): wat de boer maait, blijft als zwad op de tegel liggen
  (`a.schoven`), de boerin en de kinderen (en de boer als er niets meer te maaien is) binden het tot hokken
  (`T.bindSchoof`), die drogen `droogDagen`, en dan dragen ze de schoven naar de schuur (`T.neemSchoven`, `e.vracht`,
  `T.haalSchovenBinnen`; het werk is `haalBinnen` in `js/veldwerk.js`); een tegel is zwad, hokken of stoppels
  (`T.akkerTegelStadium`). **De dagloners** (Marcel: "Dagloners is een goed idee", en "mensen in het dorp"): elke nacht
  kiest het dorp wie morgen helpt (`T.kiesDagloners` in `js/veldwerk.js`, `p.dagloner`): wie niet op een boerderij woont
  en geen werk heeft (`T.kanWerken` in `js/bewoners.js`), bij de dichtste boerderij met de oogst op het veld, tot
  `daglonersPerBoerderij`; de spelregel "Dagloners". Het vangnet op 1 herfstmaand haalt ook de schoven binnen, en `T.graanOpHetVeld` telt mee voor
  de winter. In de winter dorst de boer na het sprokkelen in de deur van zijn schuur (`dors`, alleen beeld). De getallen
  in `T.SCHOVEN_INSTELLINGEN`.
- `js/veldwerk.js`: **de boeren aan het werk** (vraag 111, 5 okt; Marcel: "Ze moeten zaaien en op het veld bezig
  zijn"): overdag werkt een boer op zijn eigen land, naar het seizoen (`T.veldwerkVandaag`: zaaien, wieden, mest
  uitrijden, spitten, sprokkelen aan de bosrand), rij voor rij (`T.veldwerkTegels`), elk beeld na het maaien en vóór het
  dwalen (`T.werkVeldwerkBij`, vanuit `js/main.js` en `T.werkDorpBij`). Wat hij doet, staat op zijn poppetje (`e.werkt`,
  `e.draagt`, `e.veldwerk`); wie werkt, dwaalt niet, praat niet en gaat niet opzij, en `js/sprites.js` geeft hem het vel
  van zijn werk (`WERKFIGUREN`: de zaaier, de wieder, de sprokkelaar, en de hakker met de bijl in het bos; een boerin die van een
  vrouw, `werkVelVan`; wie naast zijn werk staat, kijkt ernaar, `e.werkt.op`). De schaft houdt hij op de akker. Zijn boerin en
  grote kinderen helpen bij het zaaien, de oogst en het ontginnen (`T.helpAnker`, voor `T.dagAnker`; een anker dat
  meeloopt, zonder veld: `veld: false`). Net zo rooit wie zijn erf of de plek van zijn werkplaats rooit, en hakt de
  houthakker aan zijn boom (`js/bos.js`). De regels veranderen niet; de getallen in `T.VELDWERK_INSTELLINGEN`.
- `js/ontginnen.js`: **ontginnen** (vraag 107, stap 1 en 2, 5 okt; Marcel: "107 a b c d e ja", en voor het bos "A a2, B
  ok, C ja, D ok, E ok, F Ja, G ok, H goed idee"): komt het dorp graan tekort (`T.graanTekort`), dan wijst een boer of
  zijn zoon een stuk heide en een stuk bos aan, dertig tegels elk, en jij kiest (a2): een voorval `ontginverzoek`
  (`T.beginOntginverzoek`, in `T.tikVoorvallenDag` vóór de bouwverzoeken), met `L.ontgin` = { heide, bos (elk { x, y, b,
  h } of null; het bos met `bomen` en `verborgen`), boer, nut, vertrouwen, gunst }, en zolang het loopt de vlaggen
  `ontginHeide` en `ontginBos` (`L.vlaggen`, die js/voorvallen.js wist als het om is), zodat het gesprek alleen toont wat
  kan. De heide: zo dicht bij zijn akker als ze komt, niet op een paadje van een deur (`T.ontginPlekVoor`,
  `T.isAangelegdPaadje` in `js/paden.js`), en ja kost het vertrouwen van het dorp, elk stuk meer (`T.ontginVertrouwen`;
  f3). Het bos: het stuk het dichtst bij zijn akker dat de inner van zijn ronde niet ziet (`T.bosPlekVoor`,
  `T.innerZietStuk`: van de wegen, het plein, de akkers en om de gebouwen, met `open` in `T.zietTegel`, js/wereld.js),
  anders het dichtste; gemeld (`doe.ontgin: 'bos'`) kost het de gunst van de heer, stiekem (`'stiekem'`) staat het niet
  in zijn boeken (`veld.stiekem`, `T.inDeBoeken`: de inner zoekt het niet, de heer telt het niet), maar ziet de inner
  het (`T.innerZietBosAkker`, vanuit `T.innerKijkt`), dan ben je op Sint-Maarten betrapt (`T.heerVindtBosAkkers`,
  `T.betrapt` in `js/bazen.js` met een eigen tekst), en de soldaten lopen elk jaar op Sint-Maarten door het bos
  (`T.doorzoekHetBos` vanuit `T.heerStaatErOp`; vraag 107, g1) en vinden het zelden, doorzoeken ze het hele dorp soms
  (`T.zoekBosAkkers` vanuit `T.zoekVerstopt`), en met een spoor erheen vaak (`T.vindKansVanBosAkker`, `T.spoorNaar`,
  `T.isSpoor` in `js/paden.js`: gras dat slijt, ook voor het een paadje is; vraag 107, h). Wat het kost,
  zegt `T.ontginPrijs` (voor `T.prijsVanKeuze`). Ja (`T.ontginToegestaan(D, L, soort)`) maakt er een veld van zijn
  boerderij van, met `veld.ontginning` = { tot, op ('heide' of 'bos'), gestoken } en `veld.ontgonnen`; een nieuw veld
  meldt `T.kaartVeranderd`. Het werk staat in `js/veldwerk.js` (`ontgin`, `T.volgendeOntginning`): plaggen steken, en
  in het bos van recht naast de tegel een boom omhakken (`T.hakBoom` in `js/bos.js`: 10 hout, een stronk, en de tegel
  wordt weer vloer) en een stronk of struik rooien (`T.rooi`, `T.ontginWerkOp`), en omspitten (`T.steekPlag`, die ook wat laag groeit
  weghaalt); een half werk onthoudt hij in `e.veldwerk.over`, en wat hij niet af heeft, is nog heide of bos
  (`T.akkerTegelStadium`). Is het af, of is de maand of de winter om, dan is het ontgonnen, en doen zijn mensen de rest
  (`T.tikOntginnenDag`). De plekken liggen in goud op de grond, met een rand bovenop (`tekenOntginRand` in
  `js/tekenen.js`: in het bos staan de bomen erover). De schapen grazen
  niet op ontgonnen heide (`T.weideStand` en `T.graaslandVan` in `js/vee.js`). Na een verzoek pas na dertig dagen een
  nieuw (`D.ontginnen`, ook `gezocht` als er nergens een plek was). De spelregel "Ontginnen" (de heide en het bos,
  alleen de heide, of uit); de getallen in `T.ONTGINNEN_INSTELLINGEN`.
- **Het nieuwe spel (het gehucht), verder:** `js/tijd.js` (de kalender met oude maandnamen en het
  uur: een dag duurt vijf minuten bij 1×, een maand dertig dagen; eigen klok naast `S.tijd`; de
  versneller `T.SNELHEDEN`; `T.wereldFactor` en `S.wereldTijd`; wie de tijd stilzet,
  `T.houdTijdStil`), `js/dag.js` (de zon per seizoen, de dagindeling, het licht, het ritme van de
  boeren, slapen tot de ochtend, en bezoekers die overdag komen, `T.bezoekerKomtAan`),
  `js/voorraad.js` (`D.voorraad`; alles verandert via
  `T.wijzigVoorraad`), `js/gebouwen.js` (`T.GEBOUWEN`: 45
  soorten op één plek, zoals `T.MENSEN`; bevolking, woonruimte, handen, productie per dag,
  `T.plaatsGebouw`, bouwfases via `T.bouwFaseIndex`; niet op iemand en niet op een deur, `T.waaromNietOpIemand`, vraag 88, en altijd met drie tegels looppad rondom, `T.looppadOm` (Marcel, 3 okt); een gebouw maakt alleen wat zijn grondstof
  toelaat, wie iets omzet maakt tot er genoeg ligt, `T.maaktTot`, en gereedschap laat harder werken; wie stilligt, zegt
  `T.stilOp`: in een seizoen, `stilIn`, of buiten zijn maanden, `alleenIn`, zoals de wijnboerderij, die alleen in wijnmaand
  plukt (vraag 136: een boerderij met een gezin van boeren en wijngaarden; wijn is drank, de wens `bier` heet "drank" en
  neemt bier of wijn, en de heer wil er wijn voor)), `js/behoeften.js` (tevredenheid uit eten, brandhout
  en wat elk huis wil, `js/wensen.js`; de winter, en of het hout en het eten hem halen, `T.houtVoorDeWinter` en
  `T.etenVoorDeWinter`, uit één regel met het hooi, `T.haaltDeWinter` en `T.raaktOp`; vanaf 90 dagen ervoor kijkt het dorp
  ernaar, `T.winterInZicht`, voor de raad, het rapport en de groei: haalt het hem niet, dan komt er geen gezin,
  `T.watDeWinterNietHaalt`, de spelregel "Groei"; het hout dat de mensen elke dag
  sprokkelen, `T.sprokkelHout`, zo'n 40% van wat de winter vraagt, zodat een houthakker nodig blijft; een huis dat
  doorgroeit; zout dat vis en vlees goed houdt; vis en vlees vullen ook een maag, `T.eetVandaag`, de spelregels "Vlees" en
  "Vis"),
  `js/handel.js` (de marskramer: drie bezoeken per jaar, prijzen per bezoek, `T.kanKopen` en
  `T.kanVerkopen`; in de lente ook zaaigraan, dat de boeren nazaaien tot 1 bloeimaand, en in een dorp laken (vraag 99), `T.zaaiNa` in `js/akkers.js`, waar
  ook staat hoeveel zaaigraan ze van de oogst tot het zaaien achterhouden, `T.zaaigraanApart`: het dorp eet het pas bij nood; hij staat op de plek `"marskramer"` uit het betekenisbestand), `js/heer.js`
  (Sint-Maarten: zijn brief in wijnmaand, wat hij vraagt naar wat hij ziet via `T.eisVanDeHeer` en
  `T.GEBOUWEN[soort].heer`, `T.gevolgVanBetaling` voor venster en knop, de straffen tot je ambt
  kwijt; zaaien en braak staan in `js/akkers.js`), `js/inner.js` (de inner in oogstmaand: wat hij
  ziet, in een rechte lijn en niet door huizen, `T.innerKijkt`; zijn rapport, `T.maakRapport`, dat
  `T.eisVanDeHeer` als rekening neemt; de argwaan, `T.zetArgwaan`, en wat ze doet; zijn poppetje dat
  zijn eigen ronde loopt of met de schout mee, tot zonsondergang, `T.werkInnerBij`; en `T.heerKijktRond` op
  Sint-Maarten; sinds 25 sep telt hij ook de kist, en vertelt de marskramer hem wat hij je betaalde,
  `T.boekMarskramer` in `js/handel.js`; sinds 27 sep kun je hem bespelen: wie met hem praat, houdt hem op,
  en een geschenk in zijn gesprek (`doe: { omkopen: 10 }`, `T.koopInnerOm`) laat hem minder opschrijven,
  `T.innerKorting`), `js/verstoppen.js` (de verstopplekken: de kelder van een
  huis of boerderij en de kapel, `T.verstopPlekVan`; wegzetten en terughalen, `T.verstop` en
  `T.haalTerug`; het karakter van wie er woont, via `huis` op de boerderij, dezelfde id als op de
  boer; en wat de soldaten vinden, `T.zoekVerstopt`), `js/boeren.js` (wie de boeren zijn, geloot per
  spel: een karakter uit `T.KARAKTERS` in `js/mensen.js`, met een eigen gesprek onder dezelfde naam,
  en de eigenschappen maaien, opbrengst, zaaien en aanzien; de regels vragen `T.boerFactor` en
  `T.aanzienVan`, het scherm `T.overBoerTekst`), `js/vee.js` (het vee: `T.VEE` en `T.maakDier`,
  koeien en schapen die grazen, staan en liggen, `T.rustVanDier`; velden naast elkaar als één weide,
  `T.weideGroepen`; waar een dier graast, op een weide of op de meent (de heide), `T.graaslandVan`;
  het hooi in de winter, `T.voerHooi`; slachten, `T.slacht` en `T.slachtVoorstel`, en op 1 slachtmaand doen de boeren
  het zelf, `T.boerenSlachten`; en de schaapskooi,
  met scheren en mest), `js/opties.js` (de spelregels: `T.OPTIES` op
  één plek, zoals `T.GEBOUWEN`; een keuze zet alleen waarden in de instellingenblokken, zodat elk
  getal één plek houdt; de namen; en `T.WERKBANK` met alle getallen, die vóór een keuze gaan. Het
  komt ná alle regels en gesprekken, want het neemt hun waarden als standaard, en het gereedschap
  laadt het bewust niet), `js/hud.js` (de balk, het bouwmenu onder
  `B`, het veldenvenster onder `V`, het handelsvenster en het betalen aan de heer), en `js/brieven.js`: **de
  brieven van de heer op één plek** (vraag 60, het eerste stuk van hud.js splitsen): de benoeming waarmee een nieuw
  spel begint, de schatting op 1 wijnmaand, de heervaart, en een brief bij elke trede (het dorp, marktrecht), elk een
  soort in `BRIEVEN`, getoond met
  `T.ui.toonBrief(D, soort)`, en alleen die aan jouw dorp komt in beeld; de knop Brief opent een brief die op je antwoord wacht. Een nieuw spel begint in
  het gehucht met `T.beginOpKaart`
  (`js/gebied.js`; `?kaart=<naam>` begint op een andere kaart, zonder brief); de kaart komt uit
  `gereedschap/tiled/maak-gehucht.cjs`, de
  bouwfases uit `gereedschap/pixelart/bouwfasen.cjs` (`tegels/bouwfasen/<tekening>.png` + `bouwfasen.json`). Getallen
  om bij te stellen staan telkens bovenaan in één blok (`T.GEBOUWEN_INSTELLINGEN`,
  `T.BEHOEFTEN_INSTELLINGEN`, `T.AKKER_STADIA`, `T.GRAAN_PER_TEGEL`, `T.HANDEL_INSTELLINGEN`,
  `T.HEER_INSTELLINGEN`, `T.INNER_INSTELLINGEN`).
- Wiens gesprek een wezen voert, vraag je aan `T.gesprekIdVan(e)` (`js/gesprek.js`): zijn `gesprek`
  als hij er een heeft, anders zijn soort. Zo delen honderd figuranten één soort (`dorpeling`)
  zonder alle honderd hetzelfde te zeggen.
- `gereedschap/pixelart/`: de beelden komen uit code. Figuren en voorwerpen zijn kleine
  3D-modellen die uit acht richtingen tot pixel art worden gerenderd; zie de README daar.
  `naar-spel.cjs` zet er `beelden/` uit klaar voor het spel. De huizen komen van de huizenbouwer
  (`huis-sdf.cjs`); welke het spel heeft, staat in `huizen.cjs` (elk een eigen bestand in `tegels/huizen/`), elk met
  zijn voet en de tegel voor zijn deur, waar `T.deurVan` (`js/bewoners.js`) de bewoners heen stuurt. De bouwstijlen
  staan daar ook (`STIJLEN`, vraag 114, stap 2): wit, oker, planken en roze, per stijl 108 tekeningen, elke vorm in vier
  standen onder elk dak, met zijn `stijl` in `tegels.js`. Elke stijl heeft eigen huizen en boerderijen (vormen die alleen
  een stijl heeft, staan in `VORMEN`); oker en roze nemen de hutten van wit (`hut: 'wit'`, en de tekening krijgt `ook`).
  `node gereedschap/pixelart/huis-sdf-export.cjs stijl oker` maakt er de proefplaat van (`groot` die van de grote
  gebouwen), `npm run tiled huizen` bewaart elke tekening in `uit/huizen-cache/` en gaat in een tweede taak verder, en `bouwfasen.cjs --erbij`
  rendert alleen de bouwfasen die er nog niet zijn, met namen in delen (45 tekeningen is zo'n anderhalf uur; een taak op
  de achtergrond stopt na twee uur). **Een stand is hetzelfde huis, een kwartslag gedraaid** (vraag 124, B): een huis van een stijl is gebouwd met elke
  muur ingevuld (`rondom` in `huis-sdf.cjs`), en de tekenaar draait de camera en de zon eromheen (`tekenWereld` met
  `o.draai` in `toren.cjs`), zodat de zon linksboven blijft en elke steen van elke kant op zijn plek ligt; zonder draai
  tekent hij pixel voor pixel als vroeger. De proefplaat: `huis-sdf-export.cjs rondom`.
  Elk vel gaat ingepakt naar het spel (`inpakken.cjs`): een raster kost de browser elke lege pixel, en een
  vel groter dan 8192 pixels laadt niet elke videokaart. Een leeg vak in een vel kost dus niets meer.
- Het spel tekent met sprites zodra `beelden/` er is, en anders met vlakken. Wat de kunst niet
  dekt (raster, bereik, zwevende tekst, de pilaar) blijft altijd
  vlakken. `Spel.debug.vlakken = true` zet alles terug naar vlakken, om te vergelijken.

## Het spel in het kort

Gekozen door Marcel op 23 sep 2026; het ontwerp staat in `ontwerp/spel.md`.

- Je bent de **schout**, een poppetje dat door het dorp loopt, geen hand van bovenaf. Je breidt
  het dorp uit en bestuurt het met **wetten** (eerst keuren genoemd), in een menu zoals in Democracy 3
  (Marcel, 29 sep), en later samen met de schepenen.
- **Meer een management sim** (Marcel, 30 sep, vraag 73): het poppetje is de manier waarop je bestuurt, en het
  concept dat Marcel meebracht (`ontwerp/concept.md`) is het kompas: wat elders één klik is, gaat hier via een persoon,
  een plek, een papier of een handeling. De boeren zaaien, oogsten en halen de winter zelf (sinds 30 sep: ze kiezen hun
  velden, slachten en sprokkelen; de spelregel "Het seizoen"); jij houdt een oogje in het zeil. Een probleem heeft een
  oorzaak die je had kunnen zien (`T.OORZAKEN`). Eerst de kern (vraag 74), dan het buurdorp.
- **Twee bazen** (Marcel, 3 okt, vraag 106: "106 a b c d ja"): de heer en het dorp kunnen je allebei wegsturen. De
  gunst van de heer en het vertrouwen van het dorp in jou zijn twee meters in de balk, met een waarschuwing onder een
  grens, en op 0 ben je weg; bijna elke keuze kost aan de ene kant wat de andere wint. Verstoppen is één kaart met echte
  gevolgen, niet de haak (Marcel: "als de grote hook, te slap").
- **Mensen en informatie eerst** (Marcel, 6 okt, vraag 128: "A tot g allemaal, en de proef komt erna"; uit een analyse
  van buiten: "kleiner in omvang, dieper in menselijke gevolgen"): wat je weet, komt ergens vandaan (wat er gebeurde,
  wat er gezegd wordt, en wat jij weet), 's middags is er een zitting met getuigen en bewijs, het vertrouwen van het
  dorp is per groep, mensen onthouden wat je deed, de heer leert van je, en een grote keuze komt later terug. Eerst een
  proef met één keten (de verdwenen graanzak), na het beeld in de werklijst (`spel.md`, "Informatie, de zitting en
  mensen die onthouden").
- De **heer** is verward en ziet alleen geld. Levert het dorp te weinig, dan straft hij: in het dorp, jou zelf, met
  hogere eisen, en met soldaten. Zijn **inner** komt kijken, en wat je opzij zet, moet uit zijn zicht. Wapens zijn niet
  verboden (Marcel, 7 okt: "Alleen weerstand tegen de heer is inacceptabel"): hij straft niet wat je hebt, maar wat je
  tegen hem doet. Hij stelt geen doelen (Marcel, 1 okt, vraag 78, a): "de heer moet alleen betaald worden, en hij mag
  wel eisen stellen. Maar meer om het je moeilijk te maken." Sinds 6 okt is hij ook de tegenstander: met een kasteel,
  bondgenoten en per spel een ander karakter (vraag 126).
- Het dorp groeit tot een stad met boeren, winkels, een markt en handel. Het zit vol **groepen**
  met eigen belangen (de politiek) en mensen met een verhaal (het avontuur).
- Vrij word je door **stadsrechten** te kopen of door een **opstand**, een gevecht in beurten op
  dezelfde kaart. Dan word je burgemeester. Sinds 6 okt (vraag 126) zijn het drie wegen: de opstand (je dorp
  verdedigen, dan het kasteel bestormen), de koning (die zet de heer af en geeft jou stadsrechten), en trouw (je
  onderwerpt de rest voor hem en wordt zijn erfgenaam). Een bond sluit je te voet, niet in een menu.
- **Het einddoel** (Marcel, 1 okt, vraag 78, B en C; eerder, 29 sep: "al het land veroveren of met iedereen vriendjes
  maken. Denk aan civilisation"): "totale verovering van de wereld", en "dat mensen super gelukkig zijn en in al hun
  wensen zijn voorzien. Denk aan eisen van mensen zoals in anno 1602". Dat zijn twee manieren om te winnen (vraag
  79: "a twee manieren"). **Eerst een speelbare kern** ("Daarna komt oorlog etc erbij en de rest van het land
  diplomatie trading etc"): één stad die je wint als iedereen een jaar lang super gelukkig is, met wensen per stand en
  per huis (vraag 79 en 80), en klein: eerst drie standen op de huizen die er al zijn (vraag 82). Sinds 3 okt is dat eind
  gebouwd (vraag 101, `js/einde.js`): een jaar lang alle huizen alles, vanaf 100 mensen, en het dorp viert het. Sinds 6
  okt (vraag 126) is de heer het eind (Marcel: "Het doel van het spel wordt de heer verstoten en verslaan"), met
  veroveren en bevriend raken als de weg erheen; het jaar van geluk blijft het eind van de demo, en wordt in het hele
  spel kracht op weg naar de heer (`spel.md`, "De heer als tegenstander"). In de code verandert er nu niets.
- **Tegenspelers** (Marcel, 29 sep, vraag 60, D): aan het begin kies je hoeveel. Het zijn dorpen met een AI, die
  tegelijk met jou beginnen, ergens op de kaart waar je ze nog moet vinden, en zelf bouwen om de grootste te worden;
  "intelligent genoeg om echt weerstand te bieden". Marcel koos (vraag 61 en 62): een land met provincies waar je
  dagen reist, zoals Lords of the Realm ("Denk in dagen"); een tegenspeler met een willekeurig dorp, een eigen weg en
  een voorsprong; een moeilijkheidsgraad; winnen is voor nu alles veroveren (sinds 6 okt de heer verslaan, met
  veroveren als de weg erheen, vraag 126), en een veroverd dorp blijft bestaan en
  leid je erbij; 5 of 6 spelers kan. Het land (vraag 63, besloten): een kaart met provincies waarop je reist, en per
  provincie een kaart waar je loopt en vecht; elke tegenspeler een karakter met een voorsprong; een provincie zonder
  karakter bestuurt zichzelf en is zwakker. Met 0 tegenspelers blijft het spel zoals nu. Je eigen dorp krijgt bij
  Nieuw spel een naam die je zelf kiest.
- **De raadsman** (Marcel, 29 sep, vraag 64): elk dorp heeft er een, met een karakter en gelote eigenschappen, en
  jij kiest hem; hij voert je regels uit waar je niet bent. Sinds 30 sep (vraag 66): een van de boeren, die vanzelf de
  voorvallen beslist als de schout weg is, en alleen dan (vraag 68, B) (`js/raadsman.js`); je kiest hem wanneer je wilt,
  met de knop Raadsman (vraag 67, B). Sinds 1 okt brengt hij je elke ochtend een rapport, de eerste fase van de dag
  (vraag 75, `js/ochtendrapport.js`). En "Het voelt
  gewoon nog leeg nu": sinds 29 sep spreekt het dorp je aan, met voorvallen (vraag 65, `js/voorvallen.js`); het dorp
  van bovenaf komt er niet (vraag 74, d).
- **Het hart is besturen en groeien** (Marcel, 28 sep, vraag 50): knoppen met een prijs (keuren) én
  bouwen en plannen. **Rijk worden en arm lijken** (de heer, de inner en het verstoppen), eerst de
  kern, blijft als de druk van boven. **Vechten** begint met aanvallen op je eigen dorp (rovers, de
  heervaart, dan een rivaal), in beurten op je eigen kaart met je militie; daarna de streek als
  kaarten naast elkaar; tussen dorpen sinds 6 okt al vóór de vrijheid, op weg naar de heer (vraag 126; eerst
  was het: pas na de vrijheid).
- Toon: zwarte satire. De heer is lachwekkend, zijn straffen niet (voorstel).
- **Geld verdienen** (Marcel, 1 okt): "we moeten echt denken aan het commerciële deel van het project. Ik wil hier
  eigenlijk geld mee verdienen." En: "Volgens mij is ons idee dieper dan wat er op Steam staat? Ook de art stijl speelt
  een grote rol." Wat het spel verkoopt, is het concept (je bestuurt als één mens in het dorp) en de beeldstijl; de
  heer, de inner en het verstoppen zijn de satire daarin (`commercieel.md`). Het tijdpad (vraag 83): de kern dit jaar,
  in januari 2027 de naam, geluid, Engels en de Steam-pagina, in juni 2027 de demo in Next Fest. Er is weinig geld
  ("Ik gebruik jou ☺️"): wat kan, maakt Claude, zoals de beelden uit code; Marcel kiest, luistert en plaatst.
- **Een toestand is een status** (Marcel, 1 okt, als richtlijn: "Honger, droogte of een plaag, moet een status zijn",
  en "Iets wat begint en eindigt. Mogelijk in verschillende niveaus. Ernstige droogte, en droogte bijvoorbeeld"): wat
  een tijd duurt, heeft een begin en een eind, soms in niveaus, en is te zien zolang het duurt; een bericht of het
  rapport zegt het als het begint, erger of minder wordt, of ophoudt, niet elke dag (vraag 76). Nu zijn dat de oorzaken
  (`T.OORZAKEN`: honger, kou, vol, onvrede); de rest hoort bij het plan voor de vertical slice (vraag 77).
- **Het doel is de vertical slice uit het concept** (Marcel, 1 okt: "Laten we eerst eens een speelbaar spel maken van
  begin tot eind", en "Gebruik de slice in de pdf"): één kleine stad met 100 tot 200 mensen, markt, woonwijk,
  ambachtswijk, raadhuis, kerk en stadspoort, dag en nacht, voedsel en economie, wacht en misdaad, 3 of 4 ambtenaren,
  10 tot 20 mensen met echte banden, een paar bouwprojecten, 5 tot 10 soorten gebeurtenissen, en één volledig speelbare
  bestuurlijke cyclus (`concept.md`; het plan is vraag 77). **Van gehucht tot de maat van de slice** (Marcel: "we
  starten vanaf de slice kwa afmeting een gehucht met 50 is echt te klein", en "Nee, we starten wel als gehucht"): je
  begint als gehucht, zoals nu, en groeit naar een kleine stad van 100 tot 200 mensen; een dorp van 50 is als doel te
  klein. **Uiteindelijk** is het doel een stad van mogelijk 5000 of meer mensen (Marcel, 1 okt): bouw zo dat dat later
  kan ("we moeten een manier zoeken zodat we toch 5k man kunnen hebben"; vraag 79, D: buiten beeld een vast pad, en
  heel veel mensen als getal per huis; vraag 74: nu tot zo'n 150 vloeiend op 30×).
  Uiteindelijk heeft elke tak van het bestuur een ambtenaar die je steunt, en komt er een scherm met de statussen en
  de laatst bekende inventarisatie: wat je weet, is wat er het laatst geteld werd, niet wat er nu ligt.
- **Niet te ingewikkeld** (Marcel, 29 sep): "er is geen gelijkenis met de werkelijkheid. We zijn gewoon een
  schout die een dorp runt en land wil uitbreiden." De eenvoudige regel gaat voor de regel die klopt met vroeger.
- **Instelbaar** (Marcel, 24 sep): waar een ontwerpvraag meer dan één goed antwoord heeft, wordt het
  een optie in de spelregels (`js/opties.js`), en wat Marcel koos, is de standaard. Bouw een nieuwe
  keuze dus als optie, niet als vaste regel.
- **Eerst speelbaar** (Marcel, 26 sep): "We moeten oppassen voor functie creep. Anders blijven we
  toevoegen voor we bij een speelbaar product komen." Een nieuw idee, ook een goed idee van Claude,
  gaat naar `ontwerp/opmerkingen.md` of achteraan de werklijst, niet in de stap die loopt. Wie iets
  nieuws wil beginnen, vraagt eerst: brengt dit een speelbaar product dichterbij?
- **Niets erbij zonder overleg** (Marcel, 8 okt: "Er blijven steeds dingen bijkomen zo. ... We moeten stoppen met het
  ene op te lossen met iets anders", en "geen erbij zonder overleg"): wat een speeltest scheef laat zien, los je eerst op
  met een getal uit de werkbank, niet met een nieuwe regel, een nieuw gebouw of een nieuwe grondstof. Iets nieuws komt er
  alleen als Marcel het kiest, als eigen punt achteraan de werklijst, en een grondstof alleen met iets dat hem gebruikt.
  Op 7 en 8 okt groeide vraag 116 en 133 zo uit tot een graanschuur, wachters, advies, weides, vissers, meer graan en zout.

In een gevecht heeft de schout levenspunten, net als een vijand. Wie valt, is dood (Marcel, 29 sep, vraag 55:
"mensen kunnen sterven"): valt de schout, dan is het spel uit. Wie het overleeft, geneest na een nacht.

## Afspraken in de code

**Begrijpelijk en aan te passen houden** (Marcel, 26 sep: "Laten we wel zorgen dat de code goed te
begrijpen blijft en te onderhouden / aan te passen"). Dus: één manier per ding (kijk eerst of het er
al is, en maak geen tweede variant ernaast); getallen in één blok bovenaan; regels zonder scherm, met
toetsen; en na een groot stuk werk een opruimronde vóór het volgende. Wat daar concreet nog voor
moet, staat in de werklijst (vraag 25).

**Alles in `Spel.S` wordt bewaard** (28 sep, vraag 48; `js/opslaan.js`), zonder dat een regel dat hoeft te
zeggen, ook de dorpen (`S.dorpen`) met wat ze delen (de kalender) als één ding. Dus: wat het spel onthoudt, staat in `S`, als gewone gegevens (objecten, lijsten, Set, Map; geen
functie, geen canvas, geen Date), en nergens in een losse variabele in een bestand. Wat alleen scherm is (de
muis, een flits), komt in `T.schermVelden`; wat alleen scherm is binnen een ding (hoe de tekening van een wezen
erbij staat, `e.beeldStand`), in `SCHERM_SLEUTELS` in `js/opslaan.js`. Verandert de vorm van `S` zo dat een oud spel niet meer past (iets
heet anders, of betekent iets anders), verhoog dan `T.OPSLAAN_INSTELLINGEN.versie`; een veld erbij hoeft dat
niet. `test/opslaan.test.cjs` bewaakt dat bewaren en laden hetzelfde spel geeft.

**Geen bewakers voor regels** (27 sep, vraag 25 E): een toets laadt het hele spel, dus `T.x && T.x(...)`
of `if (T.x)` voor een regel uit `js/` doet niets, behalve lezen alsof een deel van het spel er soms
niet is. Ze blijven alleen waar een bladzijde een deel van het spel laadt (`gereedschap/wereld.html`
zonder het vee, de heer en de bewoners, en de gespreksschrijver zonder de inner), op `T.ui`, en op
gegevens (`T.MENSEN.x && ...`).

**Zo dat samen spelen later kan** (Marcel, 6 okt, vraag 126, f: na de release, met een speler als heer). Twee regels
voor nieuw werk: wat de heer (of een ander dorp) beslist, kiest hij uit dezelfde handelingen als een mens in zijn plaats
zou hebben, zoals de raadsman kiest uit de antwoorden van een voorval (`T.raadsmanKeuze`), en niet langs een eigen weg
eromheen; en een keuze die op de speler wacht, heeft ook een termijn en een uitkomst als die om is, zoals een gril (tien
dagen) of een voorval (twee dagen, en ben je weg, dan beslist de raadsman). De pauze is gemak voor wie alleen speelt,
geen regel. Wat er later nog
bij moet (de regels in vaste tikken, geen `Math.random`), staat in `ontwerp/spel.md`, "De heer als tegenstander".

Over het raster, het gevecht in beurten en de overgang ernaartoe.

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
- Toetsen in een gevecht: klik op een vijand om te slaan (de knop Slaan zegt wat het kost),
  `D` deur dicht, `spatie` einde beurt; bij het rondlopen `S` sluipen. De actiepunten en de knoppen
  schuiven onderaan in beeld zodra een gevecht begint, ook in het gehucht.
- Monsters openen geen deuren. Kan geen enkel monster de schout nog zien of bereiken, dan eindigt
  het gevecht ('kwijt').
- Twee klokken (26 sep): wat in de wereld gebeurt (lopen, maaien, dwalen, het geduld van de inner),
  loopt op de tijd van de wereld, de schermtijd maal de snelheid (`dtWereld` in `js/main.js`,
  opgeteld in `S.wereldTijd`); wat alleen op het scherm beweegt (de wind, een flits, zwevende tekst),
  op `S.tijd`. Zo kost een tocht op elke snelheid even veel uren. Een gevecht loopt altijd op 1×.
- Het getal in de balk verandert op één manier (26 sep): `T.wijzigBevolking(S, verschil, reden,
  waarom)` (`js/gebouwen.js`), zoals de voorraad via `T.wijzigVoorraad`. Zo gaan de bewoners mee
  (`js/bewoners.js`): een nieuw gezin krijgt een huis, en wie sterft of wegtrekt, gaat; met `waarom`
  ("De kou is hard, want het hout is op") zegt het bericht wie het zijn.
- De tijd stilzetten gaat op één manier (26 sep): `T.houdTijdStil(S, reden)` en
  `T.laatTijdGaan(S, reden)` (`js/tijd.js`), met een naam per venster ('brief', 'handel', ...).
  `S.kalender.snelheid` is alleen wat de speler koos; hoe snel het nu echt gaat, zegt
  `T.snelheidNu(S)`. Een venster zet dus nooit zelf `snelheid` en onthoudt ook niets.
- Een bezoeker (de marskramer, de heer, de inner, en wie er nog bij komt) komt aan via
  `T.bezoekerKomtAan(S, bezoek)` (`js/dag.js`), met zijn bericht in `bezoek.aankomst`: overdag,
  het bericht één keer, en naar 1× als hij ertoe doet.

## Testen in de browser

`Spel.S` is de spelstaat, en `Spel.S.dorp` je eigen dorp (`js/dorp.js`). `Spel.debug.naarBeeld(x, y)` geeft de schermpositie van een tegel
(css-pixels), `await Spel.debug.stap(seconden)` laat het spel vooruitlopen zonder op beelden te
wachten. Dat is nodig omdat een verborgen browserpaneel maar af en toe een beeld tekent; ook
css-overgangen staan dan vrijwel stil. Het testgereedschap stuurt de spatiebalk niet goed door
(lege `key`), dus test einde beurt met de knop of met een `KeyboardEvent`.
`Spel.debug.quest('<quest>', '<fase>')` zet een quest in een fase zonder hem te spelen ('uit'
haalt hem weg, beloning en al); zonder fase zegt hij waar hij staat. Er zijn nog geen quests
(`js/quests.js` is leeg). `Spel.debug.gaNaar('proefbos')` springt naar een ander gebied.
`await Spel.debug.schermafdruk('naam')` bewaart het doek als PNG in
`gereedschap/pixelart/uit/schermen/` (via de server, zonder de html-balken): zo laat je Marcel een
blik op het spel zien zonder de afbeelding door je eigen gesprek te halen. In het gehucht:
`Spel.debug.kalender(dag, snelheid)` springt door het jaar, `Spel.debug.uur(21)` naar een uur van deze
dag (zonder getal zegt het hoe laat het is; een dag duurt vijf minuten bij 1×, dus `stap` gaat op 10×
tien keer zo ver), `Spel.debug.geenNacht = true` zet de nacht uit, `Spel.debug.bouw('huis', x, y)` bouwt,
`Spel.debug.marskramer()` laat de marskramer nu komen (`(2)` voor zijn herfstbezoek),
`Spel.debug.brief()` stuurt de brief van de heer nu, `Spel.debug.heer()` laat hem nu komen,
`Spel.debug.inner()` de inner (`(true)`: onverwacht; is hij er, dan zegt het tot hoe laat hij blijft, hoe
lang je hem aan de praat hield en wat je hem gaf), en `Spel.debug.argwaan(0.6)` zet zijn argwaan.
`Spel.debug.verstopt()` zegt wat er waar verstopt ligt en hoe vaak de soldaten het er vinden;
`Spel.debug.verstopt('boer1', 30, 5)` zet 30 graan en 5 goud in die kelder (of `'schout'`, `'kapel'`),
en `Spel.debug.zoeken()` laat de soldaten nu zoeken, zoals op Sint-Maarten: staat de heer op het plein,
dan op twee of drie plekken met de schout mee (`('dorp')`: het hele dorp in één keer).
`Spel.debug.vee('koe', 4)` zet vier koeien op de weide met de meeste plaats, bij de kudde: ze
blijven binnen de weide en geven melk (`js/vee.js`); een schaap gaat naar de heide. Zonder weide rond
een open plek bij de schout. `Spel.debug.bewoners()` zegt per bewoner wie het is, zijn huis, zijn werk,
waar hij staat en waar hij nu hoort (`('herder')` zoekt er een). `Spel.debug.gezin()` laat nu een
gezin komen (overdag over de weg; is het dorp vol, dan neemt het een vrij erf), `(-4)` laat er een wegtrekken.
`Spel.debug.bouw('erf', 48, 50)` wijst een erf aan (daar is plaats, ten zuidoosten van het plein), en
`Spel.debug.erven()` zegt per erf of het vrij is, wie er woont, en hoe ver de hut is. `Spel.debug.trede()` zegt
hoe ver het gehucht is met de volgende trede, en `('dorp')` maakt er nu een dorp van, met de brief van de heer
(`('marktrecht')` net zo).
`Spel.debug.rovers()` zegt wie er in de bende zit, wanneer die en de wilde rovers komen, en hoe een aanval ervoor
staat; `(3)` laat nu drie wilde rovers komen, `('bende')` de bende.
`Spel.debug.heervaart()` zegt wat de heer vraagt, wie er weg is en tot wanneer, en wie veteraan is; `('vraag')` laat
hem nu mannen vragen (ook in een gehucht), `('terug')` laat ze nu terugkomen.
`Spel.debug.raad()` zegt welke raad er onder het doel staat en welke er nu allemaal gelden.
`Spel.debug.feest()` zegt welk feest er komt of nu is, waar het dorp staat en de meiboom; `('meiboom')` laat het vandaag
beginnen, de hele dag (`('oogstfeest', 'avond')` alleen vanavond); zet er het uur bij met `Spel.debug.uur(11)` of `(20)`.
`Spel.debug.einde()` zegt hoe ver het is met winnen (het doel, de dagen op rij, het jaarboek); `('winst')` zet de teller
op één dag ervoor, `('gewonnen')` wint nu (het feest, en het eindscherm 's avonds of bij het feest), `('jaarverslag')`
toont het jaar in het kort nu.
`Spel.debug.verzoek()` zegt wat het dorp nu zou willen bouwen en waarom, wie er nu om vraagt en waar, en waar je nee op
zei; `('nu')` laat het eerste nu vragen, `('oproep', 'steengroeve')` hangt een oproep op (of haalt hem weg), `('jij')` of
`('mensen')` zet de spelregel "Wie bouwt". De oude toetsen spelen
met "Jij bouwt" (`T.zetOptie('wieBouwt', 'jij')`); die van de verzoeken staan in `test/verzoeken.test.cjs`.
`Spel.debug.ondernemers()` zegt wie wat wil beginnen, of hij het nu zou vragen, wat hij onthoudt en hoeveel wapens er
zijn; `('wapens')` laat de eerste die wapens wil het nu vragen, alsof de rovers net kwamen (in een dorp:
`Spel.debug.trede('dorp')`, en sluit dan de brief van de heer), `('herberg')` de eerste die een tweede herberg wil (vanaf
`T.ONDERNEMERS_INSTELLINGEN.herberg.vanaf` mensen).
`Spel.debug.beesten()` zegt per groep wolven of herten hoeveel het er zijn, waar de leider is en wat hij doet, wat de groep
wil (thuis, aan de rand, of weg van iemand), zijn thuis en zijn plekken aan de rand, de honger van een roedel en hoeveel
herten hij ving, en wanneer de groep jongen kreeg; `('hier')` zet de schout tien tegels van de dichtste groep, om ze te
bekijken, `('opnieuw')` legt de groepen opnieuw, `('jongen')` geeft elke groep nu jongen (en wie groot wordt, splitst),
`('jacht')` laat elke roedel nu jagen, `('honger')` geeft elke roedel zoveel honger dat hij in het donker naar het dorp
komt (met `Spel.debug.uur(21)`), en `('schaap')` laat de eerste roedel nu een schaap nemen. Onder `jagers` staat per jager waar hij op jaagt, wat hij
schoot en of hij herten vindt.
`Spel.debug.gril()` zegt welke gril op je antwoord wacht, met de keuzes en wat ze kosten; `('jacht')` laat die nu komen.
`Spel.debug.bazen()` zegt de gunst van de heer en het vertrouwen van het dorp, waarom ze het laatst veranderden en of je
gewaarschuwd bent; `('gunst', 15)` zet de gunst op 15 (met de brief als hij onder 20 komt), `('vertrouwen', 0)` jaagt je
weg als je al gewaarschuwd was. De oude toetsen van de heer en het verstoppen spelen met "Alleen de heer"
(`T.zetOptie('tweeBazen', 'uit')`); die van de twee bazen staan in `test/bazen.test.cjs`.
`Spel.debug.wensen()` zegt per huis met mensen zijn stand, wie er woont, hoe tevreden het is en wat het wil, met ✓ of ✗,
hoe het met doorgroeien staat (wat het gezin rooit, of waarom het niet groeit), en daarboven het dorp per stand en wat er
gemist wordt; `('dorpelingen')` laat alleen die stand zien.
`Spel.debug.hoogte()` zegt of de kaart hoogte heeft, waar het hoogste punt is, de richel en zijn helling, en hoe hoog de
schout staat; `(5)` begint een nieuw spel op land 5 met heuvels (de spelregel "Hoogte" op "Heuvels"), `('top')` zet de
schout op het hoogste punt.
`Spel.debug.gehucht()` zegt of dit het ontworpen gehucht is of een van de maker, en uit welk zaad; `(3)` begint nu een
nieuw spel op het gehucht van zaad 3 (zonder brief), zoals op de pagina "Gehuchten van de maker": het land van de maker
zonder het eiland, waarop de vaste schermafdrukken, de tekenmeting en de samenvatting spelen.
`Spel.debug.eiland(5)` begint nu een spel op het eiland van 5 (zonder brief); zonder nummer zegt het in welk dorp je op het
eiland ligt, wat voor plek het is en waar de uitgang is.
`Spel.debug.voorval()` zegt welk voorval er loopt, welke vervolgen nog komen, welke voorvallen er nu kunnen (met hoe
zwaar ze wegen) en welke oorzaken er spelen;
`('brand')` laat er nu een beginnen, over mensen die erbij passen, en wie het zegt, zoekt je meteen.
`Spel.debug.zaak()` zegt hoe de graanzak ervoor staat: wie het nam en wie verdacht wordt, het spoor, wat je weet, de
zitting en hoe het afliep; `('nu')` laat de zak nu verdwijnen (de boer zoekt je meteen), `('zitting')` maakt vandaag de
dag van de zitting (met `Spel.debug.uur(13)` staan ze er), `('boek')` laat de inner het boek nu voorlezen.
`Spel.debug.raadsman()` zegt wie je raadsman is en wat hij kan, uit wie je kiest, en wat hij besloot; `('Aaltje')` of
`('boer2')` maakt die boer raadsman. Ga dan met `Spel.debug.gaNaar('proef')` weg, en hij beslist het volgende voorval.
`Spel.debug.rapport()` zegt wat er in zijn rapport staat, of hij het bracht en je het las, hoe hij rekent en wat het
dagboek van vandaag heeft; `('nu')` maakt nu een rapport, `('open')` opent het papier. Hij brengt het 's ochtends:
slaap bij je huis (`Z`), en bij het opstaan staat hij er.
`Spel.debug.land()` zegt waar de schout is in het land, of hij reist, wat hij zag en welke wegen er zijn (en zet de
spelregel Land aan); `('open')` opent de kaart, `('reis', 'De heide')` reist erheen, `('alles')` laat het hele land
zien, `('nieuw')` maakt het opnieuw uit het zaad.
`Spel.debug.wetten()` zegt per wet de stand en wat hij doet, en `('rantsoen', 'krap')` zet er eerst een, zoals
het menu (`W`). `Spel.debug.herberg()` zegt wie er vanavond naar de herberg gaat, hoe ver ze lopen en waar ze nu zijn,
en het bier (`(30)` zet eerst 30 bier). `Spel.debug.meter()` (of `F2`) zet de meter in beeld. `Spel.debug.vellen()` zegt welke plaatjes de browser nu vasthoudt, samen en per map, in MB (`('alles')` noemt elk vel). `Spel.debug.paden()` zegt hoeveel tegels paadje zijn, waar het meest gelopen wordt en waar de lantaarns staan;
`('nacht')` doet nu wat de nacht doet. `Spel.debug.lopen()` zegt wie er met een doel onderweg is, wie daarvan staat te
wachten en op wie, en hoeveel wegen en velden de kaart onthoudt (vraag 119). `Spel.debug.praatjes()` zegt wie er waar
staat te praten en tot hoe laat, en hoeveel er vrij zijn; `('nu')` laat de twee vrije bekenden die het dichtst bij elkaar
staan nu beginnen (vraag 120). `Spel.debug.veldwerk()` zegt per boer wat hij vandaag op zijn land doet, wat hij nu doet
en waar, hoe ver hij is, wie hem helpt (vraag 111) en zijn dagloners (vraag 140). `Spel.debug.ontginnen()` zegt of het dorp graan tekortkomt, welk
stuk heide elke boer zou vragen, hoeveel stukken er al af zijn en wat het volgende kost, wat er ontgonnen wordt en hoe
ver; `('nu')` laat het verzoek nu komen, ook zonder tekort
(vraag 107). `Spel.debug.bos()` zegt per houthakker zijn boom, hoeveel hout hij er al uit hakte, wat er binnen zijn bereik
staat (bomen, jonge bomen, boompjes, stronken), of hij stilstaat en wat zijn hand doet; `('hak')` laat elke houthakker nu
zijn boom omhakken, `('groei')` laat elk boompje en elke jonge boom nu een maat groeien (vraag 115). `Spel.debug.getuigen()` zegt hoe ver je de schout nu ziet waar
hij staat, wie er kijkt, en welk licht er brandt.
`Spel.debug.slachten()` opent het slachtvenster nu (anders op 1
slachtmaand). `Spel.debug.opslaan('2')` zet het spel op plek 2, `Spel.debug.laden('auto')` laadt wat er vanzelf
bewaard is, en `Spel.debug.spellen()` zegt wat er op de plekken staat.
De spelregels die de browser onthield (`localStorage`, `aardschok.spelregels`) gelden ook voor wie
test, behalve een spelregel voor de proeven (`voorProeven`, zoals "Je gehucht"): die alleen als een proef hem daar
zette (`proef`, zoals de speeltest); `Spel.optiesTerug()` zet alles op de standaard, en een nieuwe Playwright-context begint leeg.
Een sprong met `kalender` tikt alle dagen ertussen af: valt 1 wijnmaand erin, dan staat de brief
open en de tijd stil tot je hem sluit.

Drie bladzijden gereedschap draaien op dezelfde server, en alle drie gebruiken ze de regels uit
`js/` zelf, nooit een eigen kopie:

- `gereedschap/gesprekken.html` voor de gesprekken en `gereedschap/quests.html` voor de quests
  (fasen, wegen, het dorp per fase, en de controle die de toets van drie antwoorden nakijkt).
  **In de gespreksschrijver kijk je door één situatie tegelijk** (22 sep): bovenin staan de
  situaties, je klikt er een, en het gesprek wordt getekend zoals het dán loopt — één zin per
  knoop, alleen de antwoorden die je dan kunt geven, ingesprongen zoals een gesprek loopt. Wat in
  die situatie niet klinkt, zakt naar onderen met de situatie erachter waarin het wél klinkt. Dat
  is er gekomen omdat het scherm de gegevens liet zien en niet het gesprek: vijf versies van één
  zin stonden onder elkaar, alsof iemand ze achter elkaar zei.
  Een situatie staat bij de persoon (`situaties` in `js/gesprekken.js`), is geschreven in dezelfde
  woorden als een voorwaarde, en het spel leest hem nooit. **De fasen van een quest zíjn
  situaties** en staan er vanzelf bij bij wie hem geeft; de quest staat daarom op dezelfde
  bladzijde, met erbij welk antwoord welke weg neemt. `test/situaties.test.cjs` bewaakt dat elke
  zin met een voorwaarde ergens wint. Boven het gesprek klapt een **kaartje** open: de vorm van
  het gesprek in deze situatie, vanzelf neergelegd, klikken springt naar de tekst — een kaartje
  erbij en geen canvas in plaats van, want slepen is een tweede baan en een canvas zet alle
  voorwaarden weer tegelijk in beeld. In de kopbalk **zoek je over alle mensen heen**; klikken
  brengt je naar een situatie waarin die zin ook echt klinkt.
  Allebei starten ze zichzelf niet meer: de bladzijde die ze gebruikt roept
  `T.gesprekkenTool.start()` of `T.questsTool.start()` aan, met `.kies(...)` en `.begin(...)` /
  `.beginVoor(...)` erbij. Zo zet `wereld.html` dezelfde bewerkers in een paneel, zonder een
  tweede te bouwen — want twee bewerkers voor hetzelfde bestand lopen vroeg of laat uit elkaar.
- **Een bewerker schrijft alleen het blok dat hij kent.** `gereedschap/bronblok.js` knipt een
  bestand in kop, blok en staart (`T.bronBlok(tekst, 'T.GESPREKKEN')`); de bewerker regenereert
  alleen het blok, en kop en staart gaan letterlijk mee terug. Dat is geen netheid maar noodzaak:
  vóór 22 sep schreef de gespreksbewerker `js/gesprekken.js` helemaal opnieuw, kende het draaiboek
  niet dat achter het blok stond, en wiste één keer opslaan dus dat hele draaiboek. Wie
  een bewerker bouwt of uitbreidt, houdt zich hieraan; `test/bronblok.test.cjs` bewaakt het op de
  echte bestanden. Commentaar in het bestand hangt aan wat eronder staat — een persoon, een knoop,
  één regel tekst, één antwoord — en komt bij het opslaan terug op zijn plek.
- `gereedschap/wereld.html` voor de kaarten, en dat is de bladzijde waar het spel gemaakt wordt.
  **Tiled tekent alleen nog de grond; alles wat betekenis heeft ontstaat en verandert hier**
  (Marcel, 22 sep; `ontwerp/kaarten.md`). Het tekent de kaart met `js/tekenen.js` zelf, kent lagen
  die aan en uit kunnen (begaanbaar, mensen met hun dwaalstraal, questvoorwerpen, uitgangen),
  zegt bij een klik wat het spel denkt dat daar is, en keurt de kaart. Ver uitgezoomd tekent het
  zijn eigen plattegrond, want de tekencode van het spel is er niet op gebouwd.
  - Het leest de `.tmj` rechtstreeks van schijf: opslaan in Tiled, verversen, zien.
  - **Het schrijft alleen `kaarten/<naam>.betekenis.json`** — mensen, dorpelingen, deuren,
    geheime doorgangen, aansluitingen en voorwerpen met hun `quest=`. Eén ding per
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
    `quest:fase` te typen; de kaart springt meteen naar die fase, zodat je ziet wat je legt.
  - De controle staat in `gereedschap/keuring.js` (`T.keurKaart` en `T.keurDekking`, zonder scherm
    en dus getoetst): wat op de kaart staat en niet kan, en omgekeerd wat het spel vraagt en
    nergens staat. Die tweede zegt precies wat er nog neergezet moet worden.

Drie dingen die bij het mikken misgaan:

- een open venster vangt de klik. Het spel opent op het titelscherm: klik eerst Nieuw spel
  (`#menu [data-actie="nieuw"]`; staat er al iets vanzelf bewaard, dan vraagt het eerst, en is het
  `[data-actie="ja"]`), dan Begin onder de naam van je dorp (`#menu [data-actie="begin"]`; het veld is
  `#dorpsnaam`, met een voorstel erin). Dan komt de benoemingsbrief, en zolang die openstaat, staat de tijd stil en valt elke
  klik op de brief: sluit hem eerst (de knop "Aan het werk", `.heer-geef-knop`, of Esc). Op `?kaart=proef`
  komen er geen titelscherm en geen brief, en wordt er niet opgeslagen;
- de camera glijdt mee, dus reken de schermpositie pas uit als hij stilstaat (een seconde
  `stap` na elke verplaatsing), anders klik je een tegel ernaast;
- wat vooraan staat, vangt de muis. Mik op het lijf van een wezen (zo'n 16 pixels boven zijn
  tegel), niet op zijn voeten, anders klik je de kist die ervoor staat.
