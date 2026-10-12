# De code, per onderwerp

Wat elk bestand in `js/` doet, per onderwerp, met een kop per bestand. Dit stond tot 11 okt in CLAUDE.md (vraag 153); het
staat hier woord voor woord. **Lees alleen het stuk van het bestand waaraan je werkt:** `grep -n 'js/bos.js' ontwerp/code.md`
geeft de kop, en het stuk loopt tot de volgende `###`. Wie een bestand bouwt of verandert, werkt zijn stuk hier bij, niet in
CLAUDE.md; een nieuw bestand krijgt hier een kop en in CLAUDE.md een naam in de inhoudsopgave (`test/claude.test.cjs`).

Veel stukken vertellen nog het spel van vóór 11 okt (het dorp dat zelf bouwt, de voorvallen, de raadsman, de inner).
De snoeironde (vraag 153, stap 3) haalt weg wat eruit gaat, samen met de code.

## De afspraken in de code, uitgebreid

In het kort in CLAUDE.md; hier met het waarom.

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
zonder het vee, de heer en de bewoners), op `T.ui`, en op
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
- Twee klokken (26 sep): wat in de wereld gebeurt (lopen, maaien, dwalen, het geduld van wie op een ander wacht),
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
- Een bezoeker (de marskramer, de heer, en wie er nog bij komt) komt aan via
  `T.bezoekerKomtAan(S, bezoek)` (`js/dag.js`), met zijn bericht in `bezoek.aankomst`: overdag,
  het bericht één keer, en naar 1× als hij ertoe doet.


## Opbouw

Alles hangt aan één naamruimte, `globalThis.Spel` (in de code `T`), zodat hetzelfde bestand in
de browser en in de Node-tests werkt. De volgorde van de scripts in `index.html` telt.

## Spel en dorp

### js/dorp.js: het spel en zijn dorpen

- `js/dorp.js`: **het spel en zijn dorpen** (werklijst vraag 71, 30 sep). `S` is het spel: de kalender, het land, de
  schout van de speler (`S.schout`), waar hij is (`S.wereld`), het scherm, en de dorpen (`S.dorpen`); je eigen dorp is
  `S.dorp`. Een dorp (`D`) heeft alles van zichzelf: zijn kaart (`D.wereld`), voorraad, gebouwen, bewoners, wetten, hoe
  de heer ertegenover staat, rovers, voorvallen, raadsman, trede, vee, de vlaggen van wat er speelt
  (`D.vlaggen`), en zijn eigen schout (`D.schout`; in jouw dorp ben jij dat). `D.kalender` is `S.kalender`.
  **Een regel over een dorp krijgt het dorp mee** (`T.tikGebouwenDag(D, dag)`, `T.wijzigVoorraad(D, ...)`); wat ook
  het spel nodig heeft (of je vecht, praat of slaapt, de klok van het scherm), krijgt allebei: `T.werkOogstBij(S, D, dt)`,
  en een gesprek `T.doeGevolg(S, D, doe)` (je tas en je quests van het spel, de vlaggen en
  het goud van het dorp). De balk en de vensters gaan over je eigen dorp (`S.dorp`, vraag 71, C); wat getekend,
  aangeklikt of gevochten wordt, over het dorp dat er ligt (`T.dorpHier(S)`, of geen). Een venster dat een dorp zelf
  opent (`T.ui.toonBrief(D, ...)`, `T.ui.openSlachten(D)`, het rekenboek met `T.ui.toonVoorraad(D)`), komt alleen voor je
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


### js/opslaan.js en js/menu.js: opslaan en laden, het titelscherm

- `js/opslaan.js`: **opslaan en laden** (werklijst punt 3, vraag 48): het bewaart heel `Spel.S` behalve wat
  alleen scherm is (`T.schermVelden`), met de verzamelingen en alles wat elkaar aanwijst heel
  (`T.bewaarSpel`, `T.leesSpel`, `T.zetSpel`). Een plek die vanzelf gaat, elke ochtend als de mensen opstaan
  (`T.werkOpslaanBij`; op 30× om de drie dagen, want het kost een hapering), en vijf eigen (`T.slaOp`, `T.opgeslagenSpellen`); waar het blijft, zegt één functie
  (`T.opslagPlek`: de opslag van de browser, straks een bestand). Na het laden meldt het de soorten aan van wat er op de
  kaarten ligt (`T.kenSoortVan` in `js/kaart.js`): een verse bladzijde kent alleen wat ze zelf neerzette, niet een gebouw
  uit het spel (gevonden met de proef met opslaan, 4 okt), en laat een voorval gaan dat het spel niet meer kent (een
  weggehaald voorval, zoals `ontginverzoek`: `T.vergeetOnbekendeVoorvallen` in `js/voorvallen.js`). `js/menu.js` is het scherm erbij: het
  titelscherm, waarop het spel opent, en het menu onder `Esc`. `js/main.js` begint een nieuw spel
  (`T.nieuwSpel`, dat een vorig spel helemaal wist), laadt er een (`T.laadSpel`), en gaat terug naar het
  titelscherm (`T.naarTitelscherm`).


### js/taal.js: de taal

- `js/taal.js`: **de taal** (vraag 147, 9 okt): `T.t('Engelse zin', woorden)` geeft de zin in de taal van nu; de Engelse zin is
  de sleutel, en een taal in `taal/` (`Spel.taal({ code, naam, locale, zinnen })`, gegevens, geen code) zegt wat hij erin is.
  Het eerste argument is altijd een gewone tekst (geen variabele of sjabloon), zodat `npm run teksten` hem leest. In een
  zin: `{wie}`, het meervoud `{n|# man|# men}` (de vormen van de taal, `T.meervoudsVormen`) en een keuze
  `{g|man:he|vrouw:she}`. De taal ligt vast bij het laden (een tabel vraagt zijn zinnen dan al), dus een andere kiezen
  (Taal op het titelscherm, `T.kiesTaal`) herlaadt; `?taal=<code>` in het adres gaat voor. **Sinds 11 okt is er geen
  Nederlands meer** (Marcel: "Nederlands mag je mee stoppen"; `taal/nl.js` is weg): het spel is Engels, en de toetsen
  spelen in het Engels (`test/laad.cjs`). De woorden en de toon staan in `ontwerp/engels.md`; een naam met *a* of *an*
  geeft `T.eenNaam`. Een taal uit de community staat in de browser (`T.EIGEN_TALEN_SLEUTEL`). Wat er mis is aan een
  vertaling, zegt `T.keurVertaling`. **Alles in `js/` is om** (vraag 147, stap 2, 11 okt, in zeven
  delen): `test/taal.test.cjs` kijkt elk bestand na (`OMGEZET` is heel `js/`), dus een tekst buiten `T.t` in een nieuw bestand
  maakt de toets rood; wat alleen wij zien (de console, `Spel.debug`), krijgt `// geen tekst`. In `T.GEBOUWEN` staan de tekeningen en de `opmerking` voor ons, niet de speler: die regels hebben `// geen tekst`.
- **De tekst van het scherm** (vraag 147, deel 3, 11 okt): `js/hud.js`, `js/tafel.js`, `js/ui.js`, `js/huisbriefje.js`,
  `js/dialoog.js`, `js/verkennen.js`, `js/landkaart.js`, `js/land.js` en `js/main.js` zijn om. **`index.html` heeft zelf geen
  tekst voor de speler meer**: een element zegt met `data-t` (tekst), `data-t-html` (tekst met toetsen) of `data-t-title` (de
  uitleg bij de muis) welke zin erin hoort, en die staat in `PAGINA` onderaan `js/ui.js`; de tafel vult haar eigen stukken
  (de koppen van het rekenboek, het plaatje van elk ding uit `DINGEN[...].naam`, de lat uit `SNELHEDEN`), en `document.title`
  en `lang` komen ook uit `js/ui.js`. Een toets staat als `<kbd>` (`kbd('Esc')`, nooit in de zin), en `Spel.debug` en de
  meldingen in de console blijven Nederlands (`// geen tekst`, `main.js` heeft er zo'n honderd). De klok in de balk is
  `T.uurTekst` (`js/dag.js`: "seven o'clock", "half past seven"; ook bij een bewaard spel in `js/menu.js`), met het deel
  van de dag uit `DAGDELEN` in `js/hud.js`. De namen van de provincies staan met een kleine letter (`T.LANDSOORTEN`: "the castle"), zodat ze in
  een zin passen ("You are in the castle"); de kaart zet de hoofdletter.
- **Een zin uit de gegevens** (vraag 147, deel 5): een tabel die een bewerker terugschrijft (`T.bronBlok`), de gesprekken
  (`T.GESPREKKEN`) en de quests (`T.QUESTS`), houdt zijn Engelse zinnen als gewone tekst, want de bewerker kent geen
  `T.t`. Wie zo'n zin toont, vraagt hem aan `T.tGegevens(zin, woorden)` (hetzelfde als `T.t`, voor een zin die geen gewone
  tekst in de code is): een gesprek doet dat in `T.vulWoordenIn` (`js/gesprek.js`), waar alles langs komt wat een gesprek
  toont, en een quest in `js/quest.js`. `npm run teksten` leest die zinnen uit de tabel (`GEGEVENS` in
  `gereedschap/teksten.cjs`: per tabel welke velden de speler ziet, en wat alleen voor de schrijver is, zoals de situaties),
  zodat ze in `taal/bron.js` staan. Een tabel die gewone code is (`T.VOORVALLEN`, `T.OORZAKEN`, `T.KARAKTERS`), krijgt
  gewoon `T.t`.

### js/naam.js: de naam van het spel

- `js/naam.js`: de naam van het spel (`T.NAAM`, sinds 11 okt Tithebreaker), op één plek, want hij kan nog
  veranderen (Marcel, 28 sep); een titel schrijft `{naam}`. De sleutel waaronder de browser iets bewaart (`T.OPSLAG_SLEUTEL`) staat ernaast en
  verandert nooit mee. `test/naam.test.cjs` bewaakt dat de naam nergens anders staat. `T.STAND` is leeg, behalve in
  een proefversie (`npm run proefversie` zet er de datum en de commit in).

### js/tijd.js, js/dag.js, js/voorraad.js, js/gebouwen.js, js/behoeften.js, js/handel.js, js/heer.js, js/boeren.js, js/vee.js, js/opties.js, js/hud.js, js/brieven.js, js/gebied.js: het gehucht verder

- **Het nieuwe spel (het gehucht), verder:** `js/tijd.js` (de kalender met oude maandnamen en het
  uur: een dag duurt vijf minuten bij 1×, een maand dertig dagen; eigen klok naast `S.tijd`; de
  versneller `T.SNELHEDEN`; `T.wereldFactor` en `S.wereldTijd`; wie de tijd stilzet,
  `T.houdTijdStil`), `js/dag.js` (de zon per seizoen, de dagindeling, het licht, het ritme van de
  boeren, slapen tot de ochtend, en bezoekers die overdag komen, `T.bezoekerKomtAan`),
  `js/voorraad.js` (`D.voorraad`; alles verandert via
  `T.wijzigVoorraad`), `js/gebouwen.js` (`T.GEBOUWEN`: 45
  soorten op één plek, zoals `T.MENSEN`; elk huis van de huizenbouwer jong en oud, vraag 144: wat er bij het begin al
  stond, is oud, wat gebouwd wordt, is jong en na `oudNaDagen` oud, en alleen het voorwerp wisselt van tekening, `T.maakOud`,
  `T.tikVerwerenDag`; bevolking, woonruimte, handen, productie per dag,
  `T.plaatsGebouw`, bouwfases via `T.bouwFaseIndex`; niet op iemand en niet op een deur, `T.waaromNietOpIemand`, vraag 88, en altijd met drie tegels looppad rondom, `T.looppadOm` (Marcel, 3 okt); een gebouw maakt alleen wat zijn grondstof
  toelaat, wie iets omzet maakt tot er genoeg ligt, `T.maaktTot`, en gereedschap laat harder werken; wie stilligt, zegt
  `T.stilOp`: in een seizoen, `stilIn`, of buiten zijn maanden, `alleenIn`, zoals de wijnboerderij, die alleen in wijnmaand
  plukt (vraag 136: een boerderij met een gezin van boeren en wijngaarden; de dorpelingen willen bier, de ambachtslieden
  er wijn bij, de wens `wijn`, en de heer wil er wijn voor)), `js/behoeften.js` (tevredenheid uit eten, brandhout
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
  (Sint-Maarten: zijn brief in wijnmaand, wat hij vraagt naar wat het dorp op dat moment heeft (het graan in de
  schuren, de mensen, de kist zoals hij hem telde toen hij kwam, en elk gebouw) via `T.eisVanDeHeer` en
  `T.GEBOUWEN[soort].heer`, `T.gevolgVanBetaling` voor venster en knop, de straffen tot je ambt
  kwijt, de gunst na het betalen, `T.gunstNaSchatting`; zaaien en braak staan in `js/akkers.js`; sinds 11 okt, vraag 151, optie 1, deel B1, kijkt hij
  niet meer op een rapport en kent hij geen argwaan, toeslag of rond kijken meer;
  de inner zelf ging er op 11 okt ook uit), `js/boeren.js` (wie de boeren zijn, geloot per
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
  laadt het bewust niet. Alles wat de speler erin leest is Engels (`T.t`, vraag 147, deel 7): de naam en de uitleg van een
  spelregel en van een keuze, de koppen van de werkbank, en de naam van elk getal, uit `NAAM_VAN_SLEUTEL` per sleutel van
  het pad (`NAAM_VAN_PAD` voor een sleutel die in één blok iets anders is; `T.werkbankNaam(pad)`; een getal zonder naam
  laat `test/opties.test.cjs` rood worden). De bladzijde met getallen leest de naam en de uitleg uit de tekst van `T.t('…')`:
  `I.tekstVan` in `gereedschap/instellingen/bron.js`), `js/hud.js` (de kalender, het bouwmenu onder
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
  `T.HEER_INSTELLINGEN`).

## Wereld en lopen

### js/wereld.js: wezens, voorwerpen, bomen, en de vragen over een kaart

- `js/wereld.js`: wat een wezen is (`T.WEZENS`) en wat een voorwerp is (`T.VOORWERPEN`), de bomen en de struiken op één
  plek (`T.BOMEN`, vraag 148: wat een boom van het bos is, `T.isBosBoom`, wat je rooit, wat de houthakker inplant, de
  wind en de bosrand; een nieuwe soort telt zo overal mee), de
  vragen over een kaart (`isBegaanbaar`, `isVast`, `raakt`, `zicht`/`zichtTussen`/`zietTegel`, `isZichtbaar`,
  `opHetPlein`: op het plein wordt niet gebouwd, en `T.pleinTegels`: de tegels van het plein, één keer per kaart),
  wat er op een tegel staat (`T.voorwerpOp`, uit een lijst per tegel die de kaart zelf bijhoudt, niet in `S`; een voorwerp
  zet je erbij en haal je weg met `T.zetVoorwerp` en `T.haalVoorwerpWeg`, vraag 71: dit was 85% van een speeldag),
  en de proefkamers (`T.maakProefkamers`): drie kamers in code voor de toetsen van het gevecht. De naam van een wezen staat
  met een kleine letter ("the wolf" in de zin, `T.t('The {wezen} sees you.')`), en wat een monster doet, is
  `aanval.zin` met `{doel}` erin (`T.t('bites {doel}')`): `js/gevecht.js` vult *you* of de naam van de man van de militie in
  (`T.vulTekst`), zodat een vertaler de hele zin kan bouwen.
  Elke kaart van het spel komt uit Tiled (`js/kaart.js`). De speler is `S.schout`, met soort
  'schout' en kant 'speler' (Marcel, 26 sep: een man van de militie vecht later ook aan kant
  'speler' zonder de schout te zijn); hij draagt het vel van een gewone dorpeling (`js/sprites.js`).

### js/pad.js: A* en de eilanden

- `js/pad.js`: A* (`zoekPad`, acht richtingen, schuin kost ook 1, geen hoeken afsnijden; sinds 2 okt met een hoop, die
  in precies dezelfde volgorde kiest als de lijst ervoor; tijdens het zoeken staat iedereen stil, `T.iedereenStil` in
  `js/wereld.js`, zodat wie op een tegel staat in één stap bekend is, 3 okt) en `bereik` (alle tegels binnen N stappen). **De eilanden**
  (`T.eilandOp`, `T.kanErKomen` in `js/wereld.js`, vraag 88): welke tegels samen één gebied vormen, ruim gerekend, zodat
  wie naar een ander eiland wil, meteen weet dat er geen weg is. Verandert er een tegel of een voorwerp, dan zegt
  `T.kaartVeranderd(w)` het (een toets kijkt dat niemand het vergeet).

### js/lopen.js: lopen tussen anderen

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
  **Meelopen met de schout** (`T.loopNaastDeSchout`): wie hem volgt (een voorval dat je zoekt, de militie, de jacht)
  loopt naast hem, en staat hij er niet, dan op een vrije tegel dicht erbij.

### js/praatje.js: een praatje

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

### js/anim.js: beweging en effecten

- `js/anim.js`: beweging en effecten. `T.anim.*` geeft beloftes, zodat een beurt als gewone
  code met `await` leest. Wachten gaat in speltijd (`S.tijd`), niet met `setTimeout`. Wie loopt, loopt op een kaart
  (`T.beweegWezens(S, w, ...)`): waar je bent, of een dorp waar je niet bent (`js/dorp.js`).

### js/verkennen.js: rondlopen en dwalen

- `js/verkennen.js`: rondlopen, klikhandelingen, dwalende monsters, ontdekt worden. Dwalen gaat op een kaart met het dorp
  dat er ligt (`T.dwaal(S, w, D, dt)`; `T.laatDwalen(S, dt)` is dat voor waar je bent). Wie twee keer na elkaar geen weg
  vindt naar waar hij hoort, wacht een uur (de rem, `T.LOPEN_INSTELLINGEN` in `js/lopen.js`; Marcel, vraag 88), en per
  beeld zoeken hooguit `zoekPerBeeld` mensen een weg (de drukte 's ochtends en 's avonds, 3 okt).

## Het land

### js/eiland.js: het eiland

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

### js/maker.js: de maker

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

### js/hoogte.js: de hoogte van het land

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
  wel over een helling; een gebouw niet op steile grond (`T.teSteil`, "te steil" in `T.waaromPastHetNiet`), en waar het komt, wordt de grond vlak (`T.egaliseer`, vanuit `zetGebouwVoorwerp` en het
  doorgroeien: een vlak stuk vooraan in `w.hoogte.vlakken`); een heuvel houdt het zicht tegen (`T.heuvelTussen` in
  `T.zichtTussen`) en wie hoog staat, ziet verder (`T.verderVanBoven` in `T.zietTegel`); en een tegel die iets achter zich
  afdekt (`T.dektAf`), komt nog eens in de tekenlijst (`heuvelsErvoor` in `js/tekenen.js`). De proefplaat:
  `gereedschap/pixelart/hoogte-proef.cjs`.

### js/land.js en js/landkaart.js: het land met provincies

- `js/land.js`: **het land** (vraag 63 en 69, 30 sep; stap 1a, stuk 1): een kaart met provincies uit het zaad van het
  spel (`T.nieuwLand`, in `S.land`), wegen met hoeveel dagen reizen, en wat je zag (`gezien`; de rest is donker). Reizen:
  `T.reisNaar` (over wegen die je kent) en `T.beginReis`; `T.werkLandBij` (elk beeld) laat je aankomen of thuiskomen, en
  opent de kaart als de schout op de weg het dorp uit staat (`T.wegInEnUit`). **Wie reist, verlaat de kaart van het
  dorp niet:** de schout gaat uit de wezens, en het dorp blijft `S.wereld`, zodat de heer, de marskramer en de
  rovers thuis hun werk doen. Of de schout weg is, zegt `T.schoutIsWeg(D)` (`js/dorp.js`; ook een ander gebied), of hij op reis is,
  `T.opReis`; berichten (`js/ui.js`) en brieven (`js/brieven.js`) wachten dan in `S.land` (`T.bewaarVoorLater`,
  `T.briefVoorLater`), en een bezoeker zet de reis niet op 1× (`T.naarGewoneSnelheid`). Achter de spelregel "Land"
  (standaard uit, tot het buurdorp er is); de getallen in `T.LAND_INSTELLINGEN`. Het scherm: `js/landkaart.js` (de kaart
  als SVG, en het venster als je terug bent).

## Beeld en scherm

### js/iso.js: de projectie

- `js/iso.js`: de isometrische projectie (tegel 64×32) en tekenhulpen (`ruit`, `blok`).

### js/dialoog.js, js/ui.js, js/tafel.js, js/tekenen.js, js/main.js: de vensters, de tafel, het tekenen en de spellus

- `js/dialoog.js`, `js/ui.js` (alle html over het beeld; **één manier om een venster te openen en te sluiten**, vraag 146,
  b2: een venster meldt zich aan met `T.ui.meldVenster`, zijn open en sluit roepen `T.ui.openVenster` en `T.ui.sluitVenster`,
  en er is hooguit één open, `T.ui.vensterOpen()`; **elk venster is papier**: een nieuw venster komt in de
  rij onderaan `stijl.css`, en zijn opmaak gebruikt de kleurnamen `--inkt`, `--gedempt`, `--goud`, `--rand`, nooit een vaste
  kleur; de letters zijn Grenze, `--kop`, en Alegreya, `--boek`, in `letters/`), `js/tafel.js` (**de tafel van de schout**
  onderin, vraag 146, c: het rekenboek met de voorraad en het dorp, en de dingen die een venster openen, elk met het id
  van de knop die het was; wat een ding is en zijn toets staan op het briefje bij de muis, `#wenk`, niet op het ding; de
  kunst uit `gereedschap/pixelart/tafel.cjs`, op ware pixels: één pixel van de kunst op een hele schermpixel, 1080 één,
  4K twee, `pasSchaal`, en wat erboven ligt rekent met `--tafel-zoom`; bovenaan liggen alleen briefjes, vraag 146, d: het
  doel met de raad en de statussen linksboven, de datum en het lipje Menu rechtsboven, en het briefje bij de muis werkt
  daar ook), `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera). **Het overzicht** (vraag 108, a): `Tab` tilt de camera van de schout af en zoomt uit
  (`T.wisselOverzicht`, `S.overzicht`, alleen scherm); slepen of de pijltjes schuiven, het wiel zoomt, en wat je klikt,
  doet de schout nog altijd. `Tab`, een klik op de schout of een gevecht brengt je terug. **De fotomodus** (vraag 146,
  e): `H` (of Fotomodus in het menu) haalt alles van het beeld (`body.foto` in `stijl.css`, en wat ui is op het doek,
  `S.foto` in `js/tekenen.js`) en laat de camera los zoals het overzicht, tot twee keer dichterbij; een klik doet niets,
  en `Enter` bewaart het beeld als PNG op de maat van het scherm (`bewaarFoto`; in de versie voor Windows in Afbeeldingen). Op een groot scherm tekent het spel op een hele deling ervan, minstens
  1920×1080 (de tussenbuffer, `formaat`, vraag 123): op 4K 1920×1080 maal twee; wat er getekend wordt, zegt `T.tekenMaat()`,
  en de muis rekent om in `naarVlak`. De grond ligt in stukken van 512 pixels die aan de wereld vastzitten
  (`werkStukkenBij` in `js/tekenen.js`, 9 okt): wat in beeld komt, wordt getekend, en slepen tekent alleen de stukken aan
  de rand; wie de grond wil (het kijkgat), vraagt `T.tekenGrondStukken`. Ver uitgezoomd liggen ze op de maat van het
  scherm, en het bos om de kaart heen ook in stukken (`bosGebakken`). **De
  meter** (`F2`): beelden per seconde, en wat de regels en het tekenen per beeld kosten.

### js/gl.js: tekenen met de videokaart

- `js/gl.js`: **tekenen met de videokaart** (vraag 123): een eigen kleine laag op WebGL die zich voordoet als het 2D-doek,
  zodat `js/tekenen.js` er hetzelfde op tekent. Plaatjes, vlakken, bolle vormen en ronde verlopen tekent de kaart zelf;
  de rest gaat via een kladdoek in 2D en komt als plaatje op zijn plek (`T.gl.telling` zegt hoeveel). Een buffer die
  opnieuw getekend wordt, krijgt een nieuwe `versie` (`nieuweBuffer`), anders gaat hij niet opnieuw naar de kaart.
  Wat klein is en niet meer verandert (een plaatje, een doek met versie 1), staat op een paar grote texturen, de bladen
  (`plekOpBlad`), zodat een beeld in een paar tientallen opdrachten gaat, niet in een per plaatje (10 okt: Firefox haperde
  ver uitgezoomd).
  `T.tekenBeeld()` (`js/main.js`) tekent het scherm met of zonder, naar de spelregel "Tekenen"; zonder echte videokaart
  vanzelf zonder (`ookOpDeProcessor` zet het voor de proeven hier toch aan, ook nadat het spel geladen is). Het gewone
  doek ligt erboven en vangt de muis. **Het licht** (vraag 125, A): de nacht is met de videokaart een lichtkaart op de
  halve maat (de kleur van het uur, `T.lichtKleurVan` in `js/dag.js`, en per lamp een warme plas die flakkert,
  `lichtenInBeeld` en `T.LICHT_INSTELLINGEN` in `js/tekenen.js`), waarmee de wereld vermenigvuldigd wordt
  (`tekenLichtkaart`); zonder videokaart blijft het de donkere laag van hiervoor. **De schaduwen** (vraag 125, B): wat in
  de tekenlijst staat, nog een keer als silhouet scheef over de grond (`tekenZonneschaduw`, `T.zonStand` in `js/dag.js`),
  op een masker dat in één keer over de grond gaat (`beginSchaduw`, `eindSchaduw`); de spelregel "Schaduwen".

### js/sprites.js en js/kaart.js: de pixel art in het spel

- `js/sprites.js`: de pixel art uit `beelden/`. `T.sprites.figuur/tegel/muur/voorwerp` wijzen
  een cel op een vel aan, `T.sprites.houding(S, wezen)` kiest houding, richting en fase uit de
  spelstaat zelf (pad, uitval, flits, dood), en
  `T.sprites.teken` legt het anker van de cel op het midden van de tegel. **Elke boom anders** (vraag 148, a): een soort
  heeft op het vel meer tekeningen met zijn naam en een `vorm` (`BOOM_VORMEN` in `naar-tiled.cjs`), en welke een boom
  krijgt, zegt zijn tegel (`T.sprites.tekeningVan(v)`, een vaste hasj; `v.id` blijft de eerste, dus een bewaard spel past).
  Wat een voorwerp tekent, vraagt het daaraan (`{ vel, id }`, of `T.sprites.buitenVan(v, wind)`), niet aan `v.id`. **De
  bomen in het jaar** (stap 2): per seizoen een vel met dezelfde nummers (`bomen-lente`, `-herfst`, `-winter`, `-sneeuw`,
  met `seizoen` in `tegels.js`), dat pas laadt in zijn seizoen (`T.sprites.zetSeizoen`, elk beeld uit `T.boomSeizoen(S)`
  in `js/bos.js`: per maand `bomenInHetJaar`, en sneeuw op de takken vanaf `sneeuwOpDeBomen`; de spelregel "De bomen in
  het jaar"); tot het er is, en wat in een seizoen niet anders is, staat in de zomer. Een kale boom rendert zo'n
  anderhalve minuut, dus `npm run tiled bomen-winter` en `bomen-sneeuw` elk ruim een uur, in een eigen taak. **Het groen
  eronder net zo** (stap 3, 11 okt): de begroeiing in vormen (`BEGROEIING_VORMEN` in `naar-tiled.cjs`) en per seizoen
  (`begroeiing-lente`, ...; alle vier in een paar minuten), met de nieuwe soorten klaproos, korenbloem, brandnetel, heide,
  brem, distel, lisdodde, waterlelie en braam (de braam en de brem zijn struiken in `T.BOMEN`); wat plat in de grond ligt,
  tekent de grond opnieuw als het seizoen er is (`T.sprites.seizoenVanDeBomen`). De maker legt de nieuwe soorten met een
  vaste keus per tegel (`ANDERE_BOMEN` in `js/maker.js`, en het groen eronder langs de akkers, achter de huizen, op de
  heide, aan en op het water en aan de bosrand: `akkerrand` en verder in `T.MAKER_INSTELLINGEN.groei`), zonder zijn lot
  te raken. Een kaart leest een gid zoals Tiled (`js/kaart.js`),
  dus een vel mag groeien. Laadt alles met
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

### js/doorkijk.js: de doorkijk

- `js/doorkijk.js`: wie je door een boom of een huis heen ziet (`T.zichtbaarDoor`,
  `T.werkDoorkijkBij`), en hoe: het kijkvenster (`T.tekenKijkgat`) of het raster (`T.tekenGerasterd`),
  een keuze in de spelregels (`beeld.md`, "Doorkijk"). `js/tekenen.js` vraagt het aan. Het eerste stuk
  dat uit `tekenen.js` ging (vraag 25, D, 26 sep).

### js/bouwstijl.js: de bouwstijl van een land

- `js/bouwstijl.js`: **de bouwstijl van een land** (vraag 114, stap 2, 4 okt): elk land van de maker bouwt in één stijl
  (`w.stijl`, uit het nummer van het land, `T.stijlVoorLand`; het ontworpen gehucht heeft er geen en bouwt zoals altijd),
  met per soort een paar vormen, elk met de deur naar elke kant. De huizenbouwer noemt dat een stand; in het spel heet het
  de kant van de deur (`T.deurKantVan`, `T.metDeurNaar`), want een stand is in het spel die van de mensen (`T.STANDEN`,
  `T.standVan` in `js/wensen.js`). Een nieuw huis krijgt het dak van de trede (dat van het gehucht, leien in een dorp,
  pannen met marktrecht), en een stenen huis baksteen pas met een steenbakkerij (`T.stijlTekeningen`, via
  `T.tekeningenVan` en `T.volgendeTekening` in `js/gebouwen.js`); wie doorgroeit, houdt zijn kant en krijgt het dak van nu
  (`T.zoalsNu`, `kiesGroei` in `js/behoeften.js`). `T.plekVoor` keert een deur naar de weg (`T.keerNaarDeWeg`, `js/bouwstijl.js`),
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

### js/kleinleven.js: het kleine leven

- `js/kleinleven.js`: **het kleine leven** (vraag 145, 3; Marcel: "het voelt gewoon wat 'saai' in het dorp"): alleen
  beeld, niets ervan in `Spel.S`: rook uit de schoorsteen van wie thuis is (`T.rookUitHuizen`; het punt per tekening is
  `schoorsteen` of `nok` in `tegels.js`, uit `rookVan` in `huizen.cjs`), water dat stroomt of glinstert (`T.waterOp`),
  kinderen die tikkertje spelen (`T.speel`, vanuit `T.dwaal`), kippen op het erf van een boerderij (`T.kippenOp`), een
  hond bij een deel van de gezinnen die zijn baas volgt en blaft naar vreemden (`T.hondenVan`, `T.vreemdeBij`), en de
  was aan de lijn (`T.wasVan`). `js/tekenen.js` tekent het (`kleinLevenInLijst`, `tekenWaterLeven`,
  `tekenSchoorsteenRook`); de kip en de hond komen uit `gereedschap/pixelart/klein.cjs`. De spelregel "Klein leven"; de
  getallen in `T.KLEIN_LEVEN_INSTELLINGEN`.

### js/zien.js: het licht

- `js/zien.js`: **het licht in het dorp** (werklijst vraag 108, d, en 125, C; tot 11 okt ook het zichtveld en de
  getuigen, vraag 151): het licht staat op één plek (`T.lichtBronnen`: de herberg en de lantaarns op de kaart, die
  's avonds branden, de ramen van de huizen waar iemand thuis is, een feest, een brand, de bode, en de lantaarn van de
  schout, `T.draagtLantaarn`: buiten in het donker, tot hij sluipt, vraag 125, C), voor het licht in `js/tekenen.js` en
  voor de wolven, die aan de rand van zijn licht blijven (`js/beesten.js`); `T.huizenMetIemandThuis` zegt welke huizen
  een raam en een schoorsteen hebben die rookt. De getallen in `T.ZIEN_INSTELLINGEN`.

### gereedschap/pixelart/: de beelden uit code

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
  tekent hij pixel voor pixel als vroeger. De proefplaat: `huis-sdf-export.cjs rondom`. **De knoppen van het voorbeeldhuis op
  elke tekening** (vraag 144, de ronde van alle tekeningen, 11 okt): `inDeRonde` in `huizen.cjs` zet ze naar het dak en de
  soort, en elke tekening heeft een oude naast zich (`<naam>-oud`, `OUD`) en de sneeuw op zijn dak in drie lagen
  (`sneeuwVan`, alleen op het dak: `GEEN_SNEEUW`; `schrijfDaksneeuw`); de proefplaat: `huis-sdf-export.cjs ronde wit`. De
  bouwfasen opnieuw in delen: `bouwfasen.cjs --opnieuw wit` (een stijl, een naam, of `huizen`); de brandfasen:
  `ruines.cjs spel [--erbij]`.
  Elk vel gaat ingepakt naar het spel (`inpakken.cjs`): een raster kost de browser elke lege pixel, en een
  vel groter dan 8192 pixels laadt niet elke videokaart. Een leeg vak in een vel kost dus niets meer.

### Sprites of vlakken

- Het spel tekent met sprites zodra `beelden/` er is, en anders met vlakken. Wat de kunst niet
  dekt (raster, bereik, zwevende tekst, de pilaar) blijft altijd
  vlakken. `Spel.debug.vlakken = true` zet alles terug naar vlakken, om te vergelijken.


## De mensen

### js/mensen.js: wie de mensen zijn

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
  (de heer, de marskramer), heeft `bezoeker: true`.

### js/bewoners.js: wie er woont en waar hij werkt

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
  loopt de weg af; het bericht zegt wie het zijn. Werk telt in uren (`T.werkUrenVan`; tot 11 okt een optie, nu altijd): een
  werkplaats maakt naar de uren dat zijn mensen er echt zijn, min de weg van hun deur erheen. Hoe lang
  iemand ergens heen loopt, zegt `T.looptijdVan` (ook voor de herberg).

### js/leven.js: ouder worden, geboren worden en sterven

- `js/leven.js`: **ouder worden, geboren worden en sterven** (vraag 145, 9 okt; Marcel: "mensen moeten ook ouder kunnen
  worden", en "1. C 2. Ja 3. Ja"): elke bewoner heeft een geboortedag (`p.geboren`; wie er al was, krijgt er een in zijn
  fase), elke fase duurt vaste jaren (`fasen`), en elke nacht (`T.tikLevenDag`, na `T.tikKoortsDag`) gaat wie zijn fase
  uit is een verder (`T.poppetjeNaarLeeftijd` in `js/bewoners.js`, met een nieuw uiterlijk), sterft een oude van
  ouderdom, en krijgt een gezin met plaats soms een kind (`T.plaatsInHuis`). De schout en wie een naam heeft (`p.wie`)
  worden niet ouder (`T.wordtOuder`). **Het uiterlijk** (vraag 145, 1): elke bewoner draagt een van de 24 uiterlijken van
  zijn lijf (12 voor een kind of een oude; `p.uiterlijk`, `T.kiesUiterlijk`: het minst gebruikte, niet als de buren, een
  kind met het haar van zijn ouders), ook in zijn werk (`boer-u7`, `zaaier-u7`; `T.UITERLIJK_LIJF`, en in js/sprites.js
  `figuurVanUiterlijk`); de uiterlijken staan in `gereedschap/pixelart/uiterlijk.cjs`, de vellen komen uit
  `uiterlijk-anim.cjs`. De spelregel "Ouder worden"; de getallen in `T.LEVEN_INSTELLINGEN`. **De kleren naar stand**
  (vraag 149, 10 okt; Marcel: "Hogere niveau sociale mensen moeten duurdere kleren krijgen"): het gezicht blijft, de
  kleren zijn die van de stand van het huis (`T.klerenVan` in `js/bewoners.js`): arm in een hut (vaal, lappen, een
  gerafelde zoom, blote voeten), gewoon in een huis of boerderij, deftig in een stenen huis of woontoren als het huis
  zijn laken krijgt (diepe verf, leer, een buidel, bont, en een man in een jas tot onder de knie); alleen de
  volwassenen, staand en lopend (`boer-u7-arm`, `boerin-u3-deftig`, `T.sprites.inKleren`), want aan het werk dragen ze
  hun gewone kleren. Alleen beeld. Uit `kleren()` in `uiterlijk.cjs`; de spelregel "Kleren".

### js/gesprek.js en js/gesprekken.js: wiens gesprek

- Wiens gesprek een wezen voert, vraag je aan `T.gesprekIdVan(e)` (`js/gesprek.js`): zijn `gesprek`
  als hij er een heeft, anders zijn soort. Zo delen honderd figuranten één soort (`dorpeling`)
  zonder alle honderd hetzelfde te zeggen.

### js/gesprek.js: woorden uit het spel in een zin

- Een zin in een gesprek kan iets uit het spel noemen: `{woord}` vult `T.GESPREK_WOORDEN` in
  (`js/gesprek.js`), zoals `{gisteravond}` (`js/herberg.js`), en in een voorval `{wie}` en `{ander}`
  (`js/voorvallen.js`). `T.vulWoordenIn` zet de zin eerst in de taal van nu (`T.tGegevens`, `js/taal.js`): de zinnen in
  `js/gesprekken.js` zijn Engels en gegevens (de gespreksschrijver schrijft ze terug), dus de naam boven een gesprek, de
  tekst van een knoop en een antwoord gaan allemaal hierlangs (`js/dialoog.js`, en de raadsman in `js/raadsman.js`).

### js/quests.js en js/quest.js: de quests

- `js/quests.js`: de quests als gegevens (nu nog leeg, met de vorm erboven);
  `js/quest.js`: de regels erachter, zonder scherm en dus te toetsen — fasen en wegen
  (`T.zetQuest`, `T.neemWeg`, `T.werkQuestsBij`), goud (`T.geefGoud`), de haken waarmee een
  gesprek erop let (`T.questVoorwaarde`, `T.questGevolg`), voorwerpen die aan een quest hangen,
  en `T.keurQuests`, dat de toets van drie antwoorden nakijkt.

## Bouwen en groeien

### js/begin.js: het lege begin

- `js/begin.js`: **het lege begin** (vraag 152, stap 1b, 11 okt; Marcel: "We moeten ook zelf alles vanaf de start gaan
  bouwen", en "Rijdt nu binnen"): met de spelregel "Het begin" op "Leeg" (`T.MAKER_INSTELLINGEN.leeg`, alleen op het
  eiland; standaard nog het gehucht dat er al was, tot 1f) legt de maker geen gehucht maar alleen het land (`leeg` in
  `js/maker.js`): het plein met `leegRand` tegels open eromheen en verder het bos van het eiland, een paar eiken, de plek
  van de marskramer waar de weg het plein raakt, en de plek van het kamp (`w.kamp`). `T.zetKamp` (vanuit `T.nieuwDorp`):
  de voorraad uit de kar (`T.BEGIN_INSTELLINGEN.kar`), een tent per gezin (`T.GEBOUWEN.tent`, `tijdelijk`: zo groot als
  zijn gezin, `T.woonruimteVan` in `js/gebouwen.js`, dus geen plaats voor een nieuw gezin; zijn deur zegt hij zelf,
  `g.deur`), die van de schout met `huis: 'schout'` (slapen, het rapport, de bode), en de huifkar als wezen (`e.kar`, het
  vel `huifkar`) aan de rand op de weg; in elke andere tent een gezin dat meekwam (`kampGezin` in `js/bewoners.js`). Elk
  beeld (`T.werkBeginBij`): de kar rijdt naar het plein, de gezinnen komen over de weg erachter (`p.komt`), de schout loopt
  naast de kar tot je zelf klikt (`padDoel.metDeKar`), en is de kar er, dan gaan de tenten en het kampvuur op
  (`T.zetKampOp`; het vangnet elke nacht, `T.tikBeginDag`). Het vuur brandt als de mensen op zijn en smeult als ze werken
  of slapen (`T.kampvuurStand`, `T.kampLicht`; `T.sprites.kamp` en `T.sprites.kampvuur`, uit
  `gereedschap/pixelart/kamp.cjs`). De benoeming is een andere (de wildernis, js/brieven.js), en het eerste jaar vraagt de
  heer niets (`T.heerLaatMetRust`, `heerVrij`: geen schatting en geen grillen; in wijnmaand de brief `gespaard`). Wat het
  dorp van het begin weet, staat in `D.begin`. **Verhuizen uit het kamp** (1c, 11 okt): jij zet de hut en het huis neer (de spelregel
  "Huizen", waarin een gezin zelf een hut op een erf zette, is weg sinds ronde 2 van het snoeien). Elke nacht, na de gebouwen die af zijn en vóór de
  groei (`T.tikGebouwenDag`), trekt er in elke woning (`woning` in `T.GEBOUWEN`) die af is en plaats heeft een gezin uit
  het kamp: het eerste dat past, of anders het eerste in een woning waar nog niemand woont, krap (`T.verhuisUitHetKamp`;
  het verhuizen zelf is `T.verhuis` in `js/bewoners.js`: zijn thuis en zijn plekken gaan mee, en wie binnen is, komt de
  oude deur uit). Een lege tent gaat uit `D.gebouwen` en van de kaart, met de laatste ook het kampvuur (`D.begin.kamp`
  wordt `'weg'`); de tent van de schout blijft zijn huis tot zijn eigen huis af is (hieronder). `T.kampTenten` zijn de tenten van de gezinnen: zolang
  er een is, zegt `T.waaromGeenGezin` `'kamp'` en komt er geen nieuw gezin. **Het bouwbereik** (1d, 11 okt): je bouwt
  binnen `bouwBereik` tegels van het plein en van elke opslag die af is (`opslag` in `T.GEBOUWEN`); `bouwBereik(D)` rekent
  per tegel de afstand uit, alleen in het vak om het plein en de opslagen (`x0`, `y0`, `b`, `h`; de wereld wordt het hele
  eiland), één keer tot er een opslag bij komt (een WeakMap op de kaart, niet in S, want het volgt uit de kaart en de
  gebouwen), `T.inBouwBereik` en `T.waaromBuitenBouwBereik` (als eerste in `T.waaromPastHetNiet`) vragen
  het, en `tekenBouwBereik` in `js/tekenen.js` tekent het als je bouwt (`T.bouwBereikVan`). Zonder `D.begin` (het oude
  begin) ligt alles erin. Let op: `S.bereik` is iets anders, waar de schout in een gevecht deze beurt kan komen. **Het
  huis van de schout** (1d): `schout` in `T.GEBOUWEN`, met `leeg` (alleen met `D.begin`), `eenmalig` (één keer, ook in
  aanbouw telt) en `opslag` (bereik); `nogTeBouwen` in `T.magGebouwd` en `T.plaatsGebouw` vraagt het. Zijn tekening komt uit de bouwstijl (`schout`, net als de maker), nog zonder
  bouwfasen. Is hij af, dan verhuist de schout met zijn gezin erin (`verhuisDeSchout`, als eerste in
  `T.verhuisUitHetKamp`): het huis krijgt `huis: 'schout'`, de tent verliest het en gaat weg, en de kar heet de ossenkar
  met het vel `ossenkar-leeg`. Rooien en meebouwen: `js/bouwen.js`, hieronder; boeren en velden: `js/boerderij.js`.
  `T.verhuisUitHetKamp` zet een gezin ook in een boerderij die af is (één gezin per boerderij), en zegt dat de man de
  boer is.

### js/bouwen.js: meebouwen

- `js/bouwen.js`: **meebouwen** (vraag 152, 1d, 11 okt; Marcel: "d ja", en "a1"): in het lege begin (`T.bouwenMetHanden`,
  `D.begin`) rijst een gebouw niet vanzelf op in zijn bouwtijd. `T.plaatsGebouw` maakt er een bouwplaats van
  (`T.zetBouwplaats`: `g.bouw`, `klaarOp` null), met als kavel de voet en het looppad (`T.bouwKavel`, dezelfde vraag voor
  de muis in `js/main.js` en de klik); staat daar iets, dan `wachtOpRooien`, en staat hij nog niet op de kaart
  (`tekenRooiPlaatsen` in `js/tekenen.js` laat de voet zien; `T.tikRooienDag` in `js/bos.js` laat zo'n plaats aan de
  bouwers, zonder buren). Elke ochtend na `T.verdeelHanden` kiest `T.kiesBouwers` wie bouwt (`p.bouwt`): wie kan werken,
  volwassen of jong, zonder werk en geen dagloner, hooguit `perPlaats` per plaats, in de volgorde van `D.gebouwen`; net
  als de handen zonder te vragen of het poppetje er al is. Elke nacht doet `T.tikBouwenDag` het werk van gisteren
  (`werkAan`): eerst het rooien, tegel voor tegel (`rooiBoom`, `rooiStruik`; `T.rooiTegel` in `js/bos.js`, dus een boom
  geeft zijn hout), dan het bouwen (`gedaan` tot `werk`, de bouwtijd keer `werkPerBouwdag`); is het af, dan `klaarOp`, en
  zet `T.tikGebouwenDag` hem op klaar zoals elk gebouw. Overdag doet `T.werkBouwenBij` (vanuit `T.werkDorpBij`) hetzelfde
  werk naar hoe ver de werkdag is (`g.bouw.vandaag`, dat de nacht niet nog eens doet: met of zonder beelden hetzelfde), en
  stuurt de bouwers naar een tegel naast een boom of de voet (`e.werkt` met `bouw`, de hakker met de bijl in
  `js/sprites.js`; `T.magWerken` en `T.stopWerk` uit `js/veldwerk.js`). De bouwfase volgt het werk (`v.voortgang`,
  `T.bouwFaseIndex`), het briefje zegt het (`T.bouwToestand`), en het bouwmenu zegt werkdagen in plaats van dagen. De
  getallen in `T.BOUWEN_INSTELLINGEN` (de werkbank: "Meebouwen"). Een veld (js/boerderij.js) is ook een bouwplaats:
  zijn werk is per tegel (`veldWerk`, in `T.bouwWerkVan(soort, voet)`), en na het rooien komt hij niet als gebouw op de
  kaart (geen `T.zetOpDeKaart`).
- **Waar een gebouw komt** (tot ronde 2 van het snoeien, 12 okt, in `js/verzoeken.js`): `T.plekVoor(D, soort, bij)` geeft
  de plek zo dicht mogelijk bij `bij` waar het past, op open grond of anders waar het minst te rooien is (`rooien`: de
  kavel; `T.plaatsGebouw` neemt in het lege begin zelf de kavel, `T.bouwKavel`); een plek met een kring (een put, een kapel) waar hij de meeste huizen bereikt die er nog
  geen hebben. `T.kanHierKomen` vraagt het voor één plek (de kringen van `js/wensen.js`). De kolonist van de speeltest
  zoekt zo zijn plek.

### js/boerderij.js: boeren uit het niets

- `js/boerderij.js`: **boeren uit het niets** (vraag 152, 1e, 11 okt; Marcel: "A2", "Inderdaad met b2", "Ja dat is goed.
  De bouwers pakken het op", en "De karakters zetten we even opzij"; `spel.md`, "Zo werkt het lege begin nu"). Alleen in
  het lege begin (`D.begin`). **De boer:** een boerderij is een thuis voor één gezin (uit het kamp,
  `T.verhuisUitHetKamp` in `js/begin.js`; is het kamp leeg, dan elke nacht een gezin uit een hut, `bemanDeBoerderijen`:
  het gezin met de minste mensen die al werk hebben), en het hoofd van dat gezin is de boer (`T.boerVan`), zonder
  karakter of eigenschappen (het lot van `js/boeren.js` geldt alleen voor de boeren van de kaart). Elke nacht krijgt zijn
  poppetje de akkers van zijn boerderij (`T.werkDeBoerenBij`: `e.werkAkkers`, waar `js/akkers.js` en `js/veldwerk.js`
  naar kijken, zoals bij de boeren van de kaart). Een boerderij zonder akker wil geen handen
  (`T.boerderijZonderAkker`, in `T.verdeelHanden`): haar boer werkt elders of bouwt mee. **De velden:** de akker en de
  wijngaard staan in `T.GEBOUWEN` met `veld` (en `leeg`; `T.isVeldSoort`), en in het bouwmenu zodra er een boerderij is
  die ze kan nemen (`nogTeBouwen` in `js/gebouwen.js`). Je trekt een rechthoek met twee klikken (`werkVeldHoverBij` en
  `klikMetVeld` in `js/main.js`, de eerste hoek in `S.veldHoek`, alleen scherm; `T.veldRechthoek`); de muis en de klik
  vragen hetzelfde, `T.waaromPastVeldNiet`: groot genoeg en niet te groot, binnen het bouwbereik, niet op het plein, een
  pad, een ander veld of iets vasts (wat te rooien is mag), een tegel vrij rond elk gebouw, niet te steil, en bij een
  boerderij die hem kan nemen (`T.boerderijVoorVeld`: de dichtste binnen `veldAfstand` die nog geen veld heeft of
  dezelfde soort verbouwt). `T.legVeld` zet een bouwplaats in `D.gebouwen` (met `boerderij`), die de bouwers rooien en
  ploegen of planten (`js/bouwen.js`); haar eerste veld zet `g.veld` ('akker' of 'wijngaard', `T.veldVan`; de
  wijnboerderij van het gehucht is een wijngaard). Is hij af (`T.tikBoerderijenDag`, vanuit `T.tikGebouwenDag` na het
  kamp), dan gaat hij uit `D.gebouwen` en wordt hij land: een akker in `D.wereld.akkers` met `boerderij` en nog
  ongezaaid (`T.zaaiNa` zaait hem in de nazaaitijd, anders in de lente), of een wijngaard in `D.wereld.wijngaarden` met
  ranken (`T.zetRanken`, `js/wijngaard.js`); wat er laag groeide, gaat weg (`T.ruimLaagOp` in `js/gebouwen.js`). Tot
  dan tekent `tekenRooiPlaatsen` hem in goud. De getallen in `T.BOERDERIJ_INSTELLINGEN` (de werkbank: "Boeren uit het
  niets").

### gereedschap/speeltest/kolonist.js: de kolonist

- **Een speler in code voor het lege begin** (werklijst B, 1f; Marcel, 12 okt: "a1, b1, c1, d ja"). `T.kolonistDag(D,
  dag)` loopt elke dag zijn regels af en doet wat er vandaag kan: het huis van de schout, een boerderij met akkers tot al
  het zaaigraan uit de kar erop past (zolang `T.isNazaaitijd`), een houthakker als het hout laag wordt, hutten tot elk
  gezin in het kamp een woning heeft, een jager als het spel zegt dat het eten niet haalt (`T.watDeWinterNietHaalt`, of
  de status honger; hooguit één per `jagerNa` dagen; Marcel, 12 okt: "a ja"), en na de oogst een wijngaard op een tweede
  boerderij als het eten de winter niet haalt. Hij vraagt `T.inBouwmenu`, dus hij speelt onder de spelregel "Leeg". Hij bouwt met de handelingen van het bouwmenu: `T.plaatsGebouw` op de plek van `T.plekVoor` (open grond, of
  waar het minst te rooien is), en `T.legVeld` op de rechthoek die hij zelf zoekt (de grootste maat die past, het minst
  te rooien, het dichtst bij de boerderij). Hij geeft terug wat hij deed (`{ soort, gelukt, reden, tekst, instantie }`),
  en wat hij nog niet kan betalen met `wacht`. Het is gereedschap, geen spel: het spel laadt hem niet.
- **Twee die hem laden, met dezelfde keuzes** (a1): de speeltest (`speler.js`, de speler `kolonist`, die altijd op het
  eiland met "Leeg" speelt) en `test/begin.test.cjs`, per dag. Zonder beelden lopen de mensen niet, dus zet de toets wie
  nog onderweg is 's nachts thuis (`komAan`), anders werkt hij nooit (p.komt, `T.werkUrenVan`).
- **Wat vastloopt** (b1) schrijft de speeltest op in `boek.eersteJaar` (`eersteJaar` in `speler.js`) en zet het in de
  tabellen "Het eerste jaar" (`samenvatting.cjs`): wanneer elk gebouw af was en hoe lang het werk stilstond, waarop hij
  wachtte, wanneer het kamp leeg was, wie er in de winter in een tent woont, wie na een dag nog onderweg is, welke
  werkplaats niet werkt zonder dat het spel zegt waarom; en het eten en het hout.

### js/treden.js: van gehucht tot dorp en marktrecht

- `js/treden.js`: **van gehucht tot dorp, en tot marktrecht** (stap 2 van de proef, vraag 53, 29 sep; sinds 2 okt uit de
  standen, vraag 90): zoals in Anno 1602 wordt het gehucht een dorp bij 20 dorpelingen (wie in een huis of een stenen
  huis woont, `T.mensenVanStand` in `js/wensen.js`), en krijgt het marktrecht bij 20 ambachtslieden
  (`T.TREDEN_INSTELLINGEN`, in de werkbank; de eis van de proef van 28 sep, 50 mensen met een kapel en een smidse, was tot
  11 okt een spelregel "Treden" en is weggehaald, snoeironde vraag 153; het eisformaat kan het nog). De volgorde van de treden is `T.GEBOUW_TREDEN` (`js/gebouwen.js`). `T.tredeDoel` geeft het doel voor
  het vak linksboven (js/main.js, als er geen quest is), `T.tredeMensenNodig` hoeveel mensen het nog vraagt (voor de
  raad), `T.tikTredeDag` zet `D.trede` (en die gaat nooit terug), en de heer schrijft dan (`T.ui.toonBrief(D, trede)` in
  js/brieven.js, een brief per trede). Het bouwmenu toont deze trede en de treden ervoor (`T.inBouwmenu`; de markt en de
  weverij al in een dorp, vraag 90, B); wat pas in een dorp komt, vraagt `T.tredeMinstens`, en hoe een trede heet,
  `T.tredeNaam`. Hoe je dorp heet (`D.dorpsnaam`, `T.dorpsnaam`, `T.zetDorpsnaam`), kies je bij Nieuw spel
  (js/menu.js), met een voorstel uit `T.DORPSNAMEN` (vraag 60).

### js/wensen.js en js/huisbriefje.js: de wensen per stand

- **Het Engels** (vraag 147): `T.WENSEN[x].naam` en `T.STANDEN[x].naam` zijn Engelse zinnen met hun lidwoord waar de naam er een
  nodig heeft ("a well", "bread"), en `D.behoeften.mist` (js/behoeften.js) bevat die zinnen zelf: de balk (`js/tafel.js`) toont ze,
  en `js/voorvallen.js` vergelijkt ermee ("firewood for the winter"). `T.raaktOp(wat, ...)` neemt de naam met lidwoord ("the
  wood", "the hay"). De zinnen met een stuk dat eraan hangt, zijn vol: `{waarom}, and {hulp}`; de toets staat als [B] in de zin.

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
  `js/tekenen.js`). Waar nog een put of kapel kan komen, op open grond of na het rooien, zegt `T.kringGrond` (met
  `T.kanHierKomen` in `js/bouwen.js`), één keer per stand van het dorp; een gebouw met een gezin komt niet waar het een
  ander huis de laatste plek ervoor afneemt (`T.waaromGeenKringPlek`; vraag 117, 2d, en 136). **Wat de huizen
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
  vraag 130; de raad die het zei, hoorde bij het winnen en is op 11 okt weggehaald). Achteruitgaan is zacht (een
  gezin trekt alleen weg uit een huis onder de vertrekdrempel) of streng (de spelregel "Achteruitgaan"); een hogere stand
  betaalt meer belasting (`T.belastbaar`). De spelregel "Wensen" op "Het dorp als geheel" is het spel van vóór 1 okt; de
  getallen in `T.WENSEN_INSTELLINGEN`.

### js/paden.js: de paadjes en de lantaarns

- `js/paden.js`: **de paadjes en de lantaarns** (vraag 108, b en d, 3 okt): van elke deur een paadje naar de weg, of naar
  het paadje van een buur (`T.aangelegdNet`, uit de kaart en de gebouwen, niet in S: na `T.kaartVeranderd` opnieuw, met
  `T.kaartVersie` in `js/wereld.js`); waar mensen lopen, slijt het gras (`T.telStap` vanuit `js/anim.js`, een dier telt
  niet; elke nacht `T.tikPadenDag`, in S als `w.paden`), en waar niemand meer loopt, groeit het dicht. Hoe het eruitziet:
  `T.zandHoeken` en `T.hoekenMetPaden` (de hoeken van de grond, zoals `T.sprites.grondHoeken`), in de buffer van de grond
  (`js/tekenen.js`). Een lantaarn bij de deur van wat `lantaarn` heeft in `T.GEBOUWEN` (de kapel, de herberg, de markt,
  het wachthuis) en op de kruisingen (`T.zetLantaarns`; op een lantaarn bouw je niet). De ramen van een huis waar iemand
  thuis is, branden 's avonds (`T.lichtBronnen` in `js/zien.js`). De spelregel "Paadjes"; de getallen in
  `T.PADEN_INSTELLINGEN`. Een pad loopt nog niet sneller. `T.isSpoor`: een paadje, of gras dat slijt waar elke dag gelopen
  wordt; het hek om de schapen laat er een hekje open (`js/beesten.js`).

### js/markt.js: de markt op het plein

- `js/markt.js`: **de markt op het plein, die meegroeit** (vraag 110, d, en vraag 127, 6 okt; Marcel: "Grotere stad =
  grotere markt"): met de spelregel "De markt" op "Op het plein" (`T.MARKT_INSTELLINGEN.opHetPlein`) komt een markt niet
  als gebouw van 6 bij 6, maar als een marktblok op het plein: twee rijen kramen tegenover elkaar met een looppad
  ertussen en een mand naast elke kraam (`T.marktBlok`: het grootste open stuk buiten het feest, `T.feestMidden`, en weg
  van de heer, dat niemand tegenhoudt). Hij komt zoals elk gebouw (uit het bouwmenu): `T.plekVoor`,
  `T.waaromPastHetNiet` en `T.plaatsGebouw` vragen het hier (`T.marktPlek`, `T.zetMarktOpHetPlein`). Elke nacht
  (`T.tikMarktDag`) komt er een kraam bij tot er een per 15 mensen is (`T.kramenNodig`), eerst in het blok (`g.blok`),
  dan langs de weg vanaf het plein (`T.straatPlek`, de marktstraat); en een kraam ligt vol als het dorp zijn waar heeft
  (`T.heeftWaar`, `waren`), anders leeg. De markt staat in `D.gebouwen` met `opHetPlein`, `kramen`, `manden` en `blok`
  (voorwerpen `kraam`, met `waar` en `leeg`, en `mand`, met `wat`), zonder voet, op het midden van het plein
  (`T.marktMidden`). Wat hij kost, zegt `T.GEBOUWEN.markt.kosten`, naar de spelregel. De kramen per waar en de manden:
  `gereedschap/pixelart/marktkraam.cjs` (`T.sprites.kraam(waar, leeg, richting)`, `T.sprites.mand(naam)`).

### js/herberg.js: de herberg

- `js/herberg.js`: **de herberg** (werklijst punt 2, 27 sep): wie er 's avonds heen gaat
  (`T.herbergGasten`: naar karakter, seizoen en looptijd, en niet meer dan er bier is), het anker voor de
  avond (`T.herbergAnker`, dat `T.dagAnker` vraagt), de afrekening elke nacht (`T.tikHerbergDag`: bier op,
  en wie er was, maakt het dorp tevredener), en de lantaarn 's avonds (`T.herbergLicht`). Het brouwen is
  gewoon werk van het gebouw (`T.GEBOUWEN.herberg.maakt`), tot er genoeg ligt, zoals elke werkplaats die iets omzet
  (`T.maaktTot` in `js/gebouwen.js`, vraag 91, b), boven het bier dat ze apart houdt voor de huizen tot de oogst
  (`T.bierApart`, `T.dagenTotDeOogst` in `js/akkers.js`; vraag 102, b): de gasten drinken wat erboven ligt. In het gehucht
  staat hij vanaf het begin, en de herbergierster woont er. In de herberg wordt gepraat: de herbergierster vertelt jou
  wie er zat, en de marskramer logeert er (`T.logiesAnker`). 's Avonds branden de ramen van de herberg,
  met de gasten erachter als schimmen: de huizenbouwer geeft per huis door waar de ramen zitten (`ramen`
  in `tegels.json`), en `js/tekenen.js` tekent ze zo dat wat ervoor staat ze afdekt (`brandendeRamen`). Er kan een
  tweede herberg komen (je bouwt hem zelf; tot ronde 2 van het snoeien vroeg een ondernemer erom): `T.herbergenVan` geeft ze allemaal, `T.herbergVan` de eerste
  (waar de herbergierster woont en de marskramer logeert), en wie 's avonds gaat, gaat naar de dichtste
  (`T.herbergVanGast`). De grote herberg, van twee lagen (`T.isDorpsVorm` in `js/bouwstijl.js`), trekt meer gasten:
  de kans dat iemand gaat, maal `groteHerberg` (vraag 133).

## Het land bewerken en de natuur

### js/akkers.js: de akkers en de oogst

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
  en geen werk heeft (`T.kanWerken` in `js/bewoners.js`), bij de dichtste boerderij met graan te maaien of schoven op het
  veld, tot `daglonersPerBoerderij`. Ze maaien het graan van die boerderij (`akkersVanDagloner` in `T.werkOogstBij`; twee
  maaiers nemen nooit dezelfde tegel), en ligt er meer zwad dan `zwadGrens`, dan binden en dragen ze eerst; de spelregel
  "Dagloners". Het vangnet op 1 herfstmaand haalt ook de schoven binnen, en `T.graanOpHetVeld` telt mee voor
  de winter. In de winter dorst de boer na het sprokkelen in de deur van zijn schuur (`dors`, alleen beeld). De getallen
  in `T.SCHOVEN_INSTELLINGEN`.

### js/veldwerk.js: de boeren aan het werk

- `js/veldwerk.js`: **de boeren aan het werk** (vraag 111, 5 okt; Marcel: "Ze moeten zaaien en op het veld bezig
  zijn"): overdag werkt een boer op zijn eigen land, naar het seizoen (`T.veldwerkVandaag`: zaaien, wieden, mest
  uitrijden, spitten, sprokkelen aan de bosrand), rij voor rij (`T.veldwerkTegels`), elk beeld na het maaien en vóór het
  dwalen (`T.werkVeldwerkBij`, vanuit `js/main.js` en `T.werkDorpBij`). Wat hij doet, staat op zijn poppetje (`e.werkt`,
  `e.draagt`, `e.veldwerk`); wie werkt, dwaalt niet, praat niet en gaat niet opzij, en `js/sprites.js` geeft hem het vel
  van zijn werk (`WERKFIGUREN`: de zaaier, de wieder, de sprokkelaar, en de hakker met de bijl in het bos; een boerin die van een
  vrouw, `werkVelVan`; wie naast zijn werk staat, kijkt ernaar, `e.werkt.op`). De schaft houdt hij op de akker. Zijn boerin en
  grote kinderen helpen bij het zaaien, de oogst en het ontginnen (`T.helpAnker`, voor `T.dagAnker`; een anker dat
  meeloopt, zonder veld: `veld: false`). Net zo rooit het hoofd van een huis dat wil doorgroeien, en hakt de
  houthakker aan zijn boom (`js/bos.js`). De regels veranderen niet; de getallen in `T.VELDWERK_INSTELLINGEN`.

### js/ontginnen.js: ontginnen

- `js/ontginnen.js`: **het plaggen steken en het ontginnen van bos** (vraag 107, 5 okt; **het verzoek is op 11 okt
  weggehaald**, snoeironde vraag 153: de boer die vroeg om heide of bos, het voorval `ontginverzoek` met zijn gesprek,
  `T.beginOntginverzoek`, `T.ontginPlekVoor`, `T.bosPlekVoor`, `T.ontginVertrouwen`, `T.ontginPrijs`,
  `T.ontginToegestaan`, `T.graanTekort`, `T.ontgonnenStukken`, de spelregel "Ontginnen", `Spel.debug.ontginnen`, de plekken
  in goud op de grond en het advies "land ontginnen" van de raad; git bewaart het). Wat bleef, slaapt tot stap 1d, als jij een
  akker op heide legt: een veld met `veld.ontginning` = { tot, op ('heide' of 'bos'), gestoken } (er maakt nu niets meer zo
  een veld; de toetsen zetten het zelf). Het werk staat in `js/veldwerk.js` (`ontgin`, `T.volgendeOntginning`): plaggen
  steken, en in het bos van recht naast de tegel een boom omhakken (`T.hakBoom` in `js/bos.js`: 10 hout, een stronk, en de
  tegel wordt weer vloer) en een stronk of struik rooien (`T.rooi`, `T.ontginWerkOp`), en omspitten (`T.steekPlag`, die ook
  wat laag groeit weghaalt, `T.groeitLaag`); een half werk onthoudt hij in `e.veldwerk.over`, en wat hij niet af heeft, is
  nog heide of bos (`T.akkerTegelStadium`, `T.isGestoken`). Is het af, of is de maand of de winter om, dan is het
  ontgonnen, en doen zijn mensen de rest (`T.tikOntginnenDag`, vanuit `T.tikGebouwenDag`); in lentemaand wordt het een
  akker (`js/akkers.js`). `T.inOntginning(w)` zegt welke velden dat zijn. Een veld op de meent maakt haar kleiner voor de
  schapen (`T.weideStand` en `T.graaslandVan` in `js/vee.js`). `T.ONTGINNEN_INSTELLINGEN` heeft nog twee getallen, die het
  bos van de heer nodig heeft: `bosBomen` (een stuk is bos bij minstens zoveel bomen: `js/bos.js`) en `gunst` (wat een erf in
  zijn bos kostte, tot ronde 2 van het snoeien). De toetsen
  (`test/ontginnen.test.cjs`) zetten zelf een veld in ontginning.

### js/bos.js: het bos

- `js/bos.js`: **het bos: omhakken, rooien, planten en groeien** (vraag 110, e, met 115, 6 okt; Marcel: "A ja B ja C ja D
  zo"), met de getallen in `T.BOS_INSTELLINGEN`. Wat te rooien is, zegt `T.ontginWerkOp` ('hakken' voor een boom,
  'rooien' voor een stronk, een struik, een boompje of een jonge boom); een boom om met `T.hakBoom` (het hout naar de
  schuur: `houtPerBoom`, wie hem ook omhakt; in het lege begin `rooiHout`, `T.rooiHoutPerBoom`, behalve voor de
  houthakker, die niet met `T.hakBoom` hakt) of `T.velBoom` (zonder), en de rest eruit met `T.rooi`. Bos is waar minstens
  `bosBomen` bomen in de vijf bij vijf tegels staan (`T.isBos`; ook de bosrand waar de boeren sprokkelen). **De
  houthakker** (vraag 115; "Hout uit het niets" is op 11 okt weggehaald, snoeironde vraag 153) maakt zijn hout zoals altijd (2 per dag, in `T.tikGebouwenDag`),
  maar uit een boom: de dichtste binnen `hakStraal` van zijn schuur (`T.boomVanHouthakker`, `g.boom`), en elke
  `houtPerBoom` hout is die om (`T.houthakkerHakte`, `g.gehakt`): een stronk (`v.gehaktOp`, vergaat na `stronkDagen`, en
  staat niet in de weg), en stond hij in het bos, twee boompjes ernaast (`boompjesPerBoom`, `T.plantNaast`, `v.geplant`,
  `v.wordt`; wat hij kapt en inplant, blijft bos: `T.isBos` met `ookJong`, vraag 129, f), die in een jaar of twee via een
  jonge boom een boom worden (`T.tikBosDag`; de tekeningen `boompje`, `jongeEik`, `jongeDen`, `jongeBerk` in het vel van
  de bomen). Staat er binnen zijn bereik geen boom meer, dan staat hij stil (`T.waaromHaktHijNiet`) en wil hij geen handen
  (`T.houthakkerZonderBoom`, in `T.verdeelHanden`): zijn hand werkt elders tot er weer een boom staat; de raad zegt het
  (`geenBoom`), en een nieuwe houthakker vraagt het dorp pas als het hout de winter niet haalt (vraag 129, e). Hij komt
  alleen bij minstens 30 bomen binnen tien tegels (`bij` in `T.GEBOUWEN`; vraag 129, b). Zijn poppetje hakt aan zijn
  boom en brengt het hout in bundels naar de schuur (`hakHout` in `js/veldwerk.js`). **Rooien:** een bouwplaats van het lege begin op een stuk
  waar nog iets te rooien staat (een boom, een stronk, een struik: `T.teRooienOp`, `T.watTeRooien`), wacht erop
  (`g.wachtOpRooien`, met `g.kavel`), nog niet op de kaart (`T.bouwGebouw` zet het er pas met `T.zetOpDeKaart` op); dat
  rooien de bouwers (`js/bouwen.js`). Een huis dat wil doorgroeien (`g.groeitNaRooien`, vraag 130) rooit het gezin zelf:
  het hoofd (`T.rooitHij`) hakt en rooit met de bijl zoals een boer ontgint (`T.werkVeldwerkBij` in `js/veldwerk.js`; wie
  van zijn gezin geen werk heeft, helpt, `T.helpAnker`) en werkt zolang nergens, en na `rooiDagen` rooien de buren de rest
  (`T.tikRooienDag`). Tot ronde 2 van het snoeien (12 okt) rooide ook een gezin zijn erf (`js/erven.js`) en wie een
  werkplaats vroeg zijn plek (`js/verzoeken.js`). Een stuk in het bos van de heer (`T.inHetBosVanDeHeer`: zoveel bomen als een
  stuk bos bij het ontginnen) kost zijn gunst. Een appelboom is van iemand, behalve waar het huis van een gezin groter
  wordt: die kapt het gezin zelf, als geen vorm zonder hem kan (`T.isEigenBoom`, `v.teKappen`; vraag 130, a2).

### js/beesten.js: het wild

- `js/beesten.js`: **het wild in het bos** (vraag 116, stap 1, 7 okt; Marcel: "Rode ogen uit het duister", en "a ja, b
  ja, c ja"): roedels wolven en groepjes herten, zoveel als het bos groot is, uit het nummer van het land (`T.zetBeesten`,
  de eerste keer dat het dorp leeft: `T.werkBeestenBij`, elk beeld vanuit js/main.js en `T.werkDorpBij`), elk met een plek
  diep in het bos (`G.thuis`) en plekken aan de bosrand (`G.rand`). Overdag rusten ze thuis; de wolven lopen 's nachts
  langs de rand, de herten grazen er in de schemering (`T.beestenWillen`). Komt er een mens dichtbij (voor een hert ook een
  wolf), dan gaan ze weg (`G.weg`, `G.vluchtNaar`); wie sluipt, komt dichterbij. Een groep is een ding dat de dieren delen
  (`e.groep`, zoals `e.praatje`): alleen de leider zoekt een weg, de anderen lopen zijn weg af (`G.spoor`), en in
  `T.ontwijk` ruilt de leider met wie van zijn groep in de weg staat. Een dier heeft `e.beest` (geen `e.dier`: dat is vee), en `e.rust` en `e.rent` voor js/sprites.js (liggen, grazen, rennen). Een wolf begint geen gevecht
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

### js/weer.js: het weer

- `js/weer.js`: **het weer** (vraag 77, stap 2, en 82, c, 9 okt; Marcel: "1. Beiden 2. Ook in beeld 3. Ja kleine beekjes
  ook, goed idee!"): elke nacht als eerste (`T.tikWeerDag`, vanuit `T.tikGebouwenDag`) het weer van de dag die begint, in
  `D.weer` (`vandaag`: zon, wolken, regen of sneeuw; `droog`, de dagen zonder regen; `tekort`, het watertekort; `verlies`),
  uit het nummer van het land en de dag (een eigen lot, geen `Math.random`), met het weer van gisteren erbij (wie nat
  begint, blijft vaker nat) en een jaar dat wat droger of natter is (`T.natVanJaar`). Telt het tekort in het groeiseizoen
  op tot `droogteVanaf`, dan is het droogte, tot `ernstigVanaf` ernstige droogte (`T.droogteNiveau`): elke dag kost de
  oogst van dat jaar een deel (`T.droogteFactor` in `T.oogstPerTegel`, js/akkers.js, tot 1 lentemaand), en de beekjes
  vallen droog (`T.isBeek`: water dat nergens `meerBreed` tegels breed is, per kaart één keer; `T.staatDroog`): een visser
  vangt naar wat er van zijn water over is (`T.visserWater`, `T.waaromVistHijNiet` in `T.tikGebouwenDag`). Het beeld in
  `js/tekenen.js`: de kleur van het licht maal die van het weer (`tint` in `tekenNacht`, zonder videokaart een waas), regen
  en sneeuw als vlakjes over het beeld op de klok van het scherm (`tekenNeerslag`), en de droge beek als zandpad in de
  grond (`T.hoekenDroog`, zoals een paadje) met barsten en keien (`tekenDrogeBeek`). Op een natte dag zaait niemand
  (`nietInDeRegen` in `T.VELDEN_INSTELLINGEN`, js/akkers.js: `w.zaaienNaRegen`, en het veldwerk), en na een droog jaar
  (`D.weer.vorigJaar`) neemt de marskramer in de lente meer zaaigraan mee (`naDroogte` in js/handel.js). Sneeuw blijft
  liggen (`D.weer.sneeuw`, 0 tot 1, `sneeuwLaag`), en `js/tekenen.js` legt hem per tegel op de grond, de weides en de kale
  akkers (`tekenSneeuwOp`, in de buffer van de grond: plukjes die dichter worden, `sneeuwDrempel` en `sneeuwRuis`); op de daken
  van de huizen de laag die erbij past (`T.dakSneeuwLaag`, `dakSneeuw`: een beetje, half of dik, uit dezelfde render als het
  huis, `tegels/daksneeuw/`, `T.sprites.daksneeuw`; vraag 144, 4b). Het weer van vandaag staat bij de
  datum (`T.ui.toonKalender`). De spelregel "Het weer" (met droogte, zonder, of altijd zon); de getallen in
  `T.WEER_INSTELLINGEN`.

### js/graanschuur.js: de graanschuur

- `js/graanschuur.js`: **de graanschuur en de wachters bij het zaaigraan** (vraag 132, 8 okt; Marcel: "bij honger grijpen
  mensen alles aan. Je moet mensen inzetten om het warenhuis te beschermen", en "Ja, er moet een graanschuur komen"): het
  zaaigraan ligt in de graanschuur (`T.GEBOUWEN.graanschuur`, `T.graanschuurVan`); komt de honger eraan (`T.zaaigraanInGevaar`, vanuit `T.eetVandaag`), dan zoekt
  een boer je (het voorval `zaaigraanHonger`), en met `doe.bewaak` staan er wachters bij de schuur (`T.bewaakZaaigraan`:
  een per twintig mensen, minstens twee, `T.wachtersNodig`; `p.wacht`, ze werken niet, en `moetNaar` met `wacht`), die
  zoveel beschermen als er staan (`T.zaaigraanBeschermd`). Honger kost dan elke dag vertrouwen, en bij het zaaien gaan ze
  naar huis (`T.tikGraanschuurDag`). De spelregel "Zaaigraan" (bewaken, pas bij nood, als ander graan); de getallen in
  `T.GRAANSCHUUR_INSTELLINGEN`.

### js/wijngaard.js: de wijngaard

- `js/wijngaard.js`: **de wijngaard van de wijnboerderij** (vraag 136, 8 okt; Marcel: "Dat je de boeren ziet plukken,
  volle en lege ranken", en "Alles telt pas als het binnen is"): de wijnboerderij (`T.GEBOUWEN.wijnboerderij`, `wijngaard`)
  is een huis (`gebouwen/wijnhuis`, alleen dat is vast) met in zijn voet van 10 bij 8 rijen ranken als voorwerpen
  (`wijnrank`, `T.zetRanken`, `T.rankenVan`, `T.wijngaardOp`: daar bouw je niet). Een rank staat erbij naar de maand
  (`T.rankStand`: kaal, blad, vol, of leeg als hij geplukt is, `v.geplukt`; het vel `beelden/wijnrank.png` uit
  `gereedschap/pixelart/wijnrank.cjs`). In wijnmaand (`alleenIn`, `T.isPluktijd`) plukt het gezin dat er woont (`g.plukt`,
  elke nacht `T.tikWijngaardDag`; zolang werkt het nergens anders) rank voor rank met een mand (`pluk` in
  `js/veldwerk.js`, `e.mand`, de plukker of plukster), en pas als de mand in het huis is, is de wijn binnen
  (`T.wijnBinnen`, `wijnPerRank`). Het dorp kijkt vooruit (`T.wijnNaDePluk`, met `T.haaltDeWinter`): haalt wat er bij de
  pluk nog ligt plus de pluk het jaar niet? Tot ronde 2 van het snoeien vroeg het dan een wijnboerderij erbij; nu vraagt
  niemand het, en slaapt het tot vraag 155 (de wijnboerderij als eigen gebouw). De getallen in
  `T.WIJNGAARD_INSTELLINGEN`. **Sinds 11 okt (vraag 152, 1e) hoort een wijngaard bij een boerderij**: in het lege
  begin leg je hem als veld (`js/boerderij.js`, `D.wereld.wijngaarden`), en de ranken dragen hun boerderij (`v.boerderij`;
  tot dan `v.wijnboerderij`, opslaan versie 5). Welke boerderij er een heeft, zegt `T.heeftWijngaard` (`T.veldVan`), de
  pluk is in de maanden van `pluk`, en `T.zetRanken` zet ze op een rechthoek (zonder: het stuk van de voet van de
  wijnboerderij).

## Voorraad en handel

### js/bode.js: de bode naar de marskramer

- `js/bode.js`: **de bode naar de marskramer** (vraag 143, 9 okt; Marcel: "soort van brief sturen met een bode", en "1.
  Alleen bij een status ... 3. Ja, je vraagt om goederen, enkele keer heeft hij iets niet ... in de winterperiode ...
  misschien ook bescherming mee?"): speelt er een status uit `statussen` (honger, kou, droogte; `T.statusVoorDeBode`), dan
  staat de knop Bode in de balk (`#bode-knop`, `T.kanBodeSturen` met `zichtbaar`), en bij je huis schrijf je de brief (het
  papier `bode` in js/brieven.js: per goed uit `waren` hoeveel pakken, en tot drie weerbare mannen mee, met het gevaar
  eronder, `T.bodeGevaarTekst`). `T.stuurBode`: loon uit de kas, wie geen werk heeft brengt hem (`T.bodeBegeleiders` uit
  `T.weerbareMannen`), samen de weg op (`T.stuurWeg`, `waarom` 'bode'; bij de uitgang wachten ze op elkaar,
  `T.wachtOpDeAnderen`), in `D.bode`. **Onderschept** (Marcel: "De bode moet "onderschept" kunnen worden", en "iedereen
  kan dood"): bij het vertrekken valt een vast lot (`T.vastLot` in js/weer.js) of de mannen van de heer hem aanhouden
  (`heer`: de brief weg en de gunst van de heer omlaag; de kans is `basis`) of de rovers (`T.bodeGevaar`: hun bende, de winter, het donker; `onderschept` in
  `D.bode`). Tegen de rovers vechten wie meegaan (`T.bodeKracht`, `T.bodeSlaatAf`: een veteraan dubbel, wapens), en hoe het
  afloopt, zegt `T.bodeOnderweg` (afgeslagen of beroofd, wie sneuvelt, wie gewond is, `p.gewond`, en een rover van de bende
  die valt). Het gebeurt op je eigen kaart (Marcel: "alles onze eigen kaart"; alleen buiten beeld als er al rovers
  zijn): de aanval met soort 'hinderlaag' in js/rovers.js
  (`R.aanval`, `D.bode.hinderlaag`): bij de uitgang houden ze hem aan (`e.aangehouden`, in `T.dagAnker`), wie meegaat vecht
  aan jouw kant (`T.roepOp`), en de militie komt; komt de schout, dan is het een gevecht in beurten (`T.naGevecht`:
  `T.bodeWegVrij`), anders loopt het na `hinderlaag.uren` af (`T.bodeAangehouden`). Elke nacht (`T.tikBodeDag`, na
  `T.tikHandelDag`): in het donker dragen ze een lantaarn (`T.bodeLicht`, in `T.lichtBronnen`). Zijn ze er, dan komt de
  marskramer op bestelling (`T.marskramerOpBestelling` in js/handel.js:
  `m.bestelling` met de prijzen, maal `prijsMaal`, soms iets niet of de helft; de vlag `marskramerBode` voor zijn gesprek;
  valt zijn vaste ronde ertussen, dan komt die erna, `m.daarna`), en de bode is terug (`T.komtTerug`). Het handelsvenster
  en `T.kanKopen` lezen wat hij nu verkoopt via `T.verkooptNu` en `T.waarVanDeMarskramer`. De spelregel "De bode"; de
  getallen in `T.BODE_INSTELLINGEN`.

## De heer en het bestuur

### js/bazen.js: twee bazen

- `js/bazen.js`: **twee bazen, de heer en het dorp** (vraag 106, 3 okt; Marcel: "106 a b c d ja"): de gunst van de heer
  en het vertrouwen van het dorp in jou (`D.bazen`, 0 tot 100), veranderd met `T.wijzigGunst(D, n, waarom)` en
  `T.wijzigVertrouwen(D, n, waarom)` vanuit de regels waar het gebeurt (de schatting via `T.gunstNaSchatting` in
  `T.gevolgVanBetaling`, de heervaart, de schandpaal, de soldaten, `T.vertrouwenNaVoorval`, `T.vertrouwenNaBevolking` in
  `T.wijzigBevolking`, en elke dag `T.tikBazenDag`: het vertrouwen gaat een stukje naar de tevredenheid, vraag 106,
  stap 3). **De heer heeft één meter, de gunst** (11 okt, vraag 151, optie 1, deel B1): wat vroeger de argwaan
  veranderde (antwoorden met `doe.gunst`, de bode, de heervaart), verandert nu de gunst, en de raadsman
  weegt hem met wat de argwaan woog (`gunst` in `T.RAADSMAN_INSTELLINGEN.karakters`). Onder 20 een waarschuwing (de brief `waarschuwing` in `js/brieven.js`, en de raad), op 0 weg (`T.ambtKwijt` met waarom, of `D.einde` met reden 'verjaagd'), maar altijd eerst
  de waarschuwing. De twee gezichten in de balk:
  `T.ui.toonBazen` (`js/hud.js`). De spelregel "Twee bazen"; de getallen in `T.BAZEN_INSTELLINGEN`. `T.bazenStemming`
  geeft een naam waar de regels op letten (`'boos'`, `js/tafel.js`); `T.bazenTekst` zegt hem in het Engels (*angry*).
  Zo ook de straffen van Sint-Maarten: `'boete'` in de regels, `T.STRAF_TOON` (`js/heer.js`) voor wat de speler leest.

### js/grillen.js: de grillen van de heer

- `js/grillen.js`: **elke maand een gril van de heer in een brief** (vraag 106, stap 2): `T.GRILLEN` (veertien, elk met
  zijn brief, antwoorden met `doe` zoals een voorval, en `stil` voor wie niet antwoordt), `T.tikGrillenDag` (op de
  twaalfde, niet in wijnmaand en slachtmaand, als er geen andere brief van de heer wacht), de vraag die wacht
  (`D.grillen.vraag`, `T.grilNu`), de knoppen (`T.grilKeuzes`, met de prijs van `T.prijsVanKeuze`) en het antwoord
  (`T.beantwoordGril`); de brief is soort `gril` in `js/brieven.js`. Een voorval kan nu ook `gunst` en `vertrouwen` in
  zijn `doe` hebben.

### js/heervaart.js: de heervaart

- `js/heervaart.js`: **de heervaart** (vraag 60, A en B, 29 sep): in een dorp vraagt de heer op 1 hooimaand een man per
  tien zielen voor zijn oorlog, of goud (`T.vraagHeervaart`, `T.heervaartKeuzes` voor de knoppen onder zijn brief).
  Sturen (`T.stuurHeervaart`): wie gaat (`T.weerbareMannen` in `js/bewoners.js`), blijft bewoner, telt mee en eet,
  maar werkt nergens en loopt de weg af (`T.stuurWeg`, `p.weg`); op 1 herfstmaand komt hij terug (`T.komtTerug`), een
  op de vier niet, en wie terugkomt, is veteraan. Vrijkopen (`T.koopHeervaartAf`) kost goud en gunst van de heer (`gunstPerGoud`, min wat het hem waard is). Wie niet
  kiest, stuurt ze na een week. De getallen in `T.HEERVAART_INSTELLINGEN` (in de werkbank), de spelregel "Heervaart".

### js/wetten.js en js/wettenmenu.js: de wetten

- `js/wetten.js`: **de wetten** (stap 3 van de proef, vraag 54, 29 sep; eerst keuren genoemd): een menu zoals in
  Democracy 3 (`js/wettenmenu.js`, onder `W` en als knop in de balk), met het rantsoen, vreemden welkom, houtkap in
  het bos van de heer en de belasting. Wat een wet doet, staat als getallen per stand in één blok
  (`T.WETTEN_INSTELLINGEN`, in de werkbank); de regels vragen het aan `T.wetFactor` en `T.wetSom`: wat een mens eet
  (`T.etenPerMens` in `js/behoeften.js`, één plek voor het rantsoen), de tevredenheid (`T.wettenTevredenheid`), om de
  hoeveel dagen een gezin kan komen (`T.gezinDagen`) en wat een houthakker hakt (`T.maaktUit`, met `bos` op het
  gebouw) in `js/gebouwen.js`, en de boete voor de houtkap op de rekening van de heer (`T.houtkapBoete`). Wat een
  kaart in het menu zegt, komt uit dezelfde getallen (`T.watDeWetDoet`). Wat je aannam, staat in `D.wetten`; zonder
  staat elke wet op zijn standaard, en speelt het spel zoals ervoor. De standen (`'krap'`, `'aangenomen'`) zijn namen
  waar de regels op letten; wat de speler van een stand ziet, staat in `T.WETTEN[id].toon` (vraag 147: *short, normal,
  generous*).

### js/raad.js: de raad onder het doel

- `js/raad.js`: **de raad onder het doel** (stap 5 van de proef, vraag 58, 29 sep; de eerste weken, vraag 47,
  herschreven): één regel onder het doel linksboven die zegt wat nu tussen jou en een dorp staat, met de toets erbij
  (`[B]` wordt een toets): de eerste uit `T.RADEN` die nu geldt (`T.raadNu`). Hij vraagt het aan de regels zelf: of er
  een gezin komt aan de groei (`T.waaromGeenGezin` en `T.volgendeGezinDag` in `js/gebouwen.js`), het hout en het eten
  aan de winter, wat de huizen missen aan de wensen (`T.watDeHuizenMissen`, vóór het doel; vraag 87), en wat je mist voor
  wat het doel vraagt aan de treden (`T.doelGebouwen`), met waar het vandaan komt. Na de laatste trede is er geen doel
  meer (het winnen is op 11 okt weggehaald, `js/einde.js`), dus telt hij geen mensen meer. Haalt het eten de winter niet, dan zegt hij wat helpt (`T.watHelptAanEten`, vraag
  133, b: een visser per dertig mensen, een jager als er herten zijn, een graanschuur, meer weide, zaaigraan
  kopen), en vraagt het dorp het gebouw dat hij noemt. Na een voorjaar met honger maakt een boer zelf een veld weide
  (`weideErbij` in `T.boerenKiezenVelden`, `D.behoeften.voorjaarsHonger`). Vanaf de herfst zegt hij of vis en vlees de
  winter halen, als de beek dichtligt (`T.visEnVleesVoorDeWinter` in `js/behoeften.js`, `T.visEnVleesRaad`; vraag 132,
  B): hoeveel zout er bij moet (de marskramer heeft er in de herfst het meest), en een visser of jager als er dan te
  weinig ligt. Wie eet, eet eerst wat ongezouten is. Uit te zetten in de spelregels ("Raad").

### js/raadsman.js en js/raadsmanvenster.js: de raadsman

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

### js/ochtendrapport.js: het rapport

- `js/ochtendrapport.js`: **het rapport van de raadsman, 's ochtends** (vraag 75, 3a, 1 okt; de dag in fasen): wat er
  gebeurde, schrijft het dorp in een dagboek (`T.schrijfOp`, `D.dagboek`: `T.wijzigBevolking` met wie het zijn, wat de
  boeren uit zichzelf deden, wat de raadsman besliste, wie je niet sprak), en elke nacht maakt hij er als laatste stap
  van de dag zijn rapport van (`T.tikOchtendrapportDag`, `D.ochtendrapport`): wat er gebeurde, hoe het graan en het hout
  gaan sinds gisteren, de winter, de oorzaken (`T.oorzakenNu` in `js/voorvallen.js`) en wat er komt. Het zegt wat de
  balk niet zegt, en wat de huizen missen, als status (vraag 87), en zijn rekenen kleurt de getallen (`T.rekenaarVan`).
  Hij brengt het: hij staat aan je deur als je
  opstaat (`T.rapportAnker`, voor `T.dagAnker`), en naast je opent het papier (`T.werkOchtendrapportBij`, het venster
  van de brieven, soort `rapport`); anders ligt het onder de knop Rapport. De spelregel "Het rapport".

### js/voorvallen.js: het dorp spreekt je aan

- `js/voorvallen.js`: **het dorp spreekt je aan** (vraag 65, A, 29 sep): om de paar dagen, in de winter vaker, komt
  iemand de schout zoeken met een vraag, een ruzie of een ramp (`T.tikVoorvallenDag`, `T.kiesVoorval`, dat loot naar
  `T.gewichtVanVoorval`: een probleem met een oorzaak uit `T.OORZAKEN`, honger, kou, vol of onvrede, komt vaker als die
  speelt en zelden als hij niet speelt, vraag 74, B; `T.oorzaakVan` zegt welke, en het bericht zegt waarom): hij krijgt een
  uitroepteken, loopt naar je toe (`T.werkVoorvallenBij`, met `T.loopNaastDeSchout`; `e.zoektSchout` laat
  het dagritme, het dwalen en het maaien hem met rust) en spreekt je aan zodra je stilstaat (`T.ui.spreekAan`); de tijd
  staat stil tot je kiest. Wanneer en over wie staat in `T.VOORVALLEN`, de woorden onder dezelfde naam in
  `js/gesprekken.js` (naam `'{wie}'`, en `{ander}` in een zin), zodat je ze in de gespreksschrijver leest. Een antwoord
  zegt vooraf wat het kost (`T.prijsVanKeuze`, in het venster onder elk antwoord); wat het doet, staat in zijn gevolg:
  de voorraad, `tevreden` (een stemming die wegslijt, `T.voorvalStemming` in de tevredenheid), `gunst` (de gunst van de heer, `T.wijzigGunst`), `verban`,
  `sterfkans`, `gezin` (`T.gezinKomt` in `js/gebouwen.js`, dezelfde als de groei), het vee (`T.verliesVee`), en
  `voorval` (een vervolg, later, over dezelfde mensen). Wie je niet sprak, gaat na twee dagen voorbij; ben je weg (een
  ander gebied), dan beslist je raadsman (vraag 68, B). De spelregel "Voorvallen", de getallen in
  `T.VOORVALLEN_INSTELLINGEN`. **De statussen** (vraag 77, stap 2, 9 okt): een oorzaak uit `T.OORZAKEN` is een status met
  een `naam` en een tweede niveau (`erger`: hongersnood, strenge kou, overvol, onrust, ernstige droogte), en `helpt` zegt
  wat helpt; `T.oorzakenNu` geeft `niveau` en `naam` mee. Elke nacht onthoudt het dorp sinds wanneer (`T.tikStatussenDag`,
  `D.statussen`), voor de kaartjes naast het doel linksboven (`T.statussenVan`, `T.ui.toonStatussen` in js/hud.js,
  `#statussen`); het rapport zegt het begin, erger, minder (`erger.minder`) en het eind (js/ochtendrapport.js).

### js/feesten.js: de feesten

- `js/feesten.js`: **de feesten** (vraag 97, 3 okt; Marcel: het oogstfeest "Ja, een hele dag vrij", en "De meiboom"): een
  antwoord met `feest: 'dag'` of `'avond'` (`T.zetFeest`, vanuit `T.voorvalGevolg`) laat het dorp het voorval vieren op
  het plein: een hele dag, en dan werkt niemand (`T.vrijeDag`: de werkplaatsen in `T.tikGebouwenDag` en het maaien in
  `T.werkOogstBij`), of een avond. Wie er is, staat rond het midden (`T.feestAnker`, voor `T.dagAnker`), er brandt licht
  (`T.feestLicht`, in `T.lichtBronnen`), en niemand gaat naar de herberg (`T.feestAvond`). De meiboom komt op een vaste dag
  (`op` in `T.VOORVALLEN`, 30 grasmaand) en staat een maand op het plein (een voorwerp, `gereedschap/pixelart/meiboom.cjs`).
  De kerstboom (10 okt) komt op 20 wintermaand, staat met ja meteen tot en met 6 louwmaand, met kaarsjes als licht, en het
  dorp viert kerstavond: een feest met een eigen datum (`vast` in `T.FEESTEN`); de boom van een feest staat in `D.feesten.boom`
  (`soort`). De spelregel "Feesten"; de getallen in `T.FEESTEN_INSTELLINGEN`.

### js/brand.js: de brand

- `js/brand.js`: **de brand** (vraag 144, 3, 9 okt; Marcel: "Ziekte en brand als status is ook goed. We hebben dan nog
  wel vuur nodig en huizen die 'afgefikt' zijn als art. Dan kunnen ze weer worden opgebouwd"): brandgevaar is een status
  (`T.brandgevaarNiveau`: in de droogte, groot in een ernstige droogte of een vol dorp; `brandgevaar` in `T.OORZAKEN`), en
  het voorval `brand` komt dan vaker. Begint het (`L.vanaf`, `T.werkBrandBij` vanuit `T.werkDorpBij`), dan brandt het huis
  van wie het betreft echt (`g.brand`, op het voorwerp `v.brand`, `L.brandHuis`); met de emmers (`doe.blus`, `T.blusBrand`)
  is het `blusUren` na het antwoord uit en blijft het meestal staan (`T.redKans`); laat je het branden (`doe.brand`
  'laat', `T.laatBranden`), dan is het `blusUren` later puin, en doet niemand iets, na `brandUren`. Het gezin woont
  bij de buren, en na `puinDagen` bouwt het zijn huis weer op met hout (`T.tikBrandDag`, `T.herbouwHout`), in de
  bouwfasen zoals een huis dat doorgroeit (`v.inAanbouw` met `vanFase`). Het beeld in `js/tekenen.js`: vuurtongen over
  het dak, vonken en een gloed (`tekenVuur`, na de nacht), rook (`tekenRook`), licht (`T.brandLicht` in
  `T.lichtBronnen`), en de fasen van het afbranden (`T.brandfaseVan`, vraag 144: terwijl het brandt geschroeid en het dak
  dat valt, dan binnengestort, ingestort en opgeruimd; uit het huis zelf gesneden, `node gereedschap/pixelart/ruines.cjs
  spel`, `tegels/brandfasen/`, `T.sprites.brandfase`; zonder fasen de verkoolde bouwfase `puinFase`, `puinVan`), een paar
  dagen smeulend (`T.smeult`, sintels). Bij groot brandgevaar, als niemand blust, slaat het vuur soms over op het dichtste huis
  ernaast als het eerste afbrandt (`T.slaatOver`, `overslaan`; één keer, `g.brand.overgeslagen`). De spelregel "Brand";
  de getallen in `T.BRAND_INSTELLINGEN`.

### js/koorts.js: de koorts

- `js/koorts.js`: **de koorts** (vraag 144, 3): het voorval `ziekte` is het begin (`T.tikKoortsDag`): wie het betreft en
  zijn gezin zijn ziek (`p.ziek`, de dag dat hij beter is, en `p.thuisTot`: in bed), elke nacht steekt een zieke soms een
  ander aan (`besmet`, maal `vol` en `kou`, maal wat je antwoordde: `doe.koorts` in procenten, `T.koortsMaatregel`), een
  enkele keer sterft iemand (`sterft` per leeftijd), en wie het had, krijgt het deze keer niet weer (`D.koorts.gehad`).
  De status `koorts` in `T.OORZAKEN` (`T.koortsNiveau`: Koorts, en Epidemie als een tiende ziek is). Naast de deur van
  een huis met een zieke staat de pestbos (`T.pestbossen`, alleen beeld; `gereedschap/pixelart/pestbos.cjs`). De spelregel
  "Koorts"; de getallen in `T.KOORTS_INSTELLINGEN`.

### js/rovers.js: de rovers en de militie

- `js/rovers.js`: **de rovers en de militie** (stap 4 van de proef, vraag 55, 29 sep): wie wegtrekt, gaat het bos in en
  komt terug als rover (`D.rovers.bende`, `T.wordtRover` vanuit `js/bewoners.js`), en er komen wilde rovers van buiten
  (`T.tikRoversDag`). Een aanval (`D.rovers.aanval`, `T.werkRoversBij`): tegen de avond van de rand van de kaart
  (`T.roverIngang`) naar een akker, twee uur roven (graan uit de voorraad, en soms de akker kapot: `T.vertrapAkker` in
  `js/akkers.js`), en weer weg. De mannen van het wachthuis lopen dan met de schout mee (`opgeroepen`, zodat
  `T.dagAnker` en het dwalen ze met rust laten) en vechten mee (`T.militieInGevecht`). Wie valt, is dood: een rover
  is uit de bende (`T.roverVerslagen`), een wachter een mond minder (`T.sneuvelt`, via `T.wijzigBevolking` met wie
  het is), en wie het overleeft, geneest na een nacht. De getallen in `T.ROVERS_INSTELLINGEN` (in de werkbank).
  Ook de veteranen van de heervaart vechten mee (`p.veteraan`, met het leven van `T.WEZENS.veteraan`).
- **De wapens** (sinds ronde 2 van het snoeien, 12 okt; tot dan in `js/ondernemers.js`, dat weg is; Marcel: "h ja wapens
  blijven ook voor later"; de wapenmaker zet jij neer, `Spel.debug.rovers()` telt ze): `T.wapensInHetDorp` (de wapens in de schuur) en `T.bewapen` (bij een aanval krijgen zoveel mannen van de
  militie er een als er zijn), en wie er een heeft, slaat `wapens.schade` harder (`T.slagSchade`, `js/gevecht.js`).

### js/einde.js: het eind

- `js/einde.js`: **het eind en het jaar in het kort** (2e, vraag 101, 3 okt). Elke nacht (`T.tikEindeDag`, vanuit
  `T.tikGebouwenDag`) is het spel uit onder 10 mensen (`D.einde`, reden `'leeg'`, het eindscherm in `js/hud.js`, getal
  `T.EINDE_INSTELLINGEN.minstensOver`), en schrijft het dorp op wat er gebeurde in zijn jaarboek (`D.jaarboek`, uit het
  dagboek en de oogst, `T.telOogstInJaarboek`), dat op 1 lentemaand het jaarverslag wordt (`T.jaarverslagRegels`; een
  brief, soort `'jaarverslag'`, `D.jaarverslag`). **Het winnen staat er niet meer** (11 okt, snoeironde, vraag 153;
  Marcel koos "Weg"): de teller van dagen op rij (`D.eind`), `T.iedereenGelukkig`, het doel linksboven (`T.eindDoel`),
  het eindscherm (`T.ui.toonGewonnen`), het grote feest (`T.FEESTEN.stad`) en de spelregel "Het eind" zijn weg, en met
  hen de raad `groeitNiet` ("Genoeg mensen voor de winst") en de tweede knop van het overlay. Het nieuwe doel van de demo
  wacht op Marcel (werklijst). Een bewaard spel met de oude velden (`D.eind`, `D.jaarboek.gelukkig`) blijft laden: niets
  leest ze meer (`test/einde.test.cjs`). `T.vierVandaag` (`js/feesten.js`) bleef: een toets gebruikt hem.

## Het gevecht

### js/gevecht.js: het gevecht in beurten

- `js/gevecht.js`: de overgang, beurtvolgorde, actiepunten, handelingen, monster-AI
  (`planMonsterBeurt`, los van het scherm en dus te toetsen). Sinds 29 sep voor een groep: aan jouw kant (kant
  'speler') de schout en de militie, elk met een eigen beurt; wie aan de beurt is, zegt `T.aanDeBeurt`, en een
  vijand zoekt de man van jouw kant die het dichtst bij staat.
