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
niet is. Ze blijven alleen waar een bladzijde een deel van het spel laadt (`gereedschap/gesprekken.html`:
alleen de gesprekken; tot 23 okt ook `gereedschap/wereld.html`, zonder het vee, de heer en de bewoners), op `T.ui`,
en op gegevens (`T.MENSEN.x && ...`).

**Zo dat samen spelen later kan** (Marcel, 6 okt, vraag 126, f: na de release, met een speler als heer). Twee regels
voor nieuw werk: wat de heer (of een ander dorp) beslist, kiest hij uit dezelfde handelingen als een mens in zijn plaats
zou hebben (tot 15 okt koos de raadsman zo uit de antwoorden van een voorval, `T.raadsmanKeuze`), en niet langs een eigen weg
eromheen; en een keuze die op de speler wacht, heeft ook een termijn en een uitkomst als die om is, zoals een gril (tien
dagen). De pauze is gemak voor wie alleen speelt,
geen regel. Wat er later nog
bij moet (de regels in vaste tikken, geen `Math.random`), staat in `ontwerp/spel.md`, "De heer als tegenstander".

Over het raster en het gevecht.

- Eén raster voor rondlopen én vechten. Een wezen heeft een vloeiende positie (`x`, `y`) en
  een tegel (`tx`, `ty`); bezetting vraag je altijd aan `tx`/`ty`. Het gevecht is in real time, in de tik van de wereld
  (`js/gevecht.js`; vraag 170, stap 2): er is geen overgang, geen raster op de vloer en geen beurt meer.
- Scherm en klik stellen dezelfde vraag: `handelingVerkennen` (links) en `handelingSturen` (rechts) geven
  `{ tekst, kan, doe }` terug. De tekst bij de muis en de klik komen uit hetzelfde antwoord.
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

- `js/dorp.js`: **het spel en zijn dorpen** (werklijst vraag 71, 30 sep). `S` is het spel: de kalender, het land, waar je
  kijkt (`S.wereld`), het scherm, en de dorpen (`S.dorpen`); je eigen dorp is `S.dorp`, en je held `S.dorp.aanvoerder`
  (tot vraag 170, stap 5 ook `S.schout`). Een dorp (`D`) heeft alles van zichzelf: zijn kaart (`D.wereld`), voorraad, gebouwen, bewoners, wetten, hoe
  de heer ertegenover staat, rovers, trede, vee, de vlaggen van wat er speelt
  (`D.vlaggen`), en zijn eigen aanvoerder (`D.aanvoerder`, de held; valt hij, dan neemt een ander het over, `js/soldaten.js`). `D.kalender` is `S.kalender`.
  **Een regel over een dorp krijgt het dorp mee** (`T.tikGebouwenDag(D, dag)`, `T.wijzigVoorraad(D, ...)`); wat ook
  het spel nodig heeft (of je vecht, praat of slaapt, de klok van het scherm), krijgt allebei: `T.werkOogstBij(S, D, dt)`,
  en een gesprek `T.doeGevolg(S, D, doe)` (de vlaggen van het dorp, en een venster voor jou). De balk en de vensters gaan over je eigen dorp (`S.dorp`, vraag 71, C); wat getekend,
  aangeklikt of gevochten wordt, over het dorp dat er ligt (`T.dorpHier(S)`, of geen). Een venster dat een dorp zelf
  opent (`T.ui.toonBrief(D, ...)`, `T.ui.openSlachten(D)`, het rekenboek met `T.ui.toonVoorraad(D)`), komt alleen voor je
  eigen dorp. `T.nieuwDorp` maakt een dorp op een kaart (vanuit `T.beginOpEiland`, `js/begin.js`), en `T.aanvoerderIsWeg(D)`
  zegt of zijn aanvoerder niet op de kaart van het dorp staat (of er geen is); `T.isAanvoerder(S, e)` of e je eigen held
  is, ook op een bladzijde zonder dorp (het lopen). De gesprekkenbewerker, die niet speelt, geeft zijn proefstaat als spel
  en als dorp tegelijk.
  **Elk dorp leeft** (vraag 71, A): `T.werkDorpBij(S, D, dt, dtWereld)` doet elke tik alles van een dorp (`T.wereldTik`,
  js/tik.js, voor elk dorp in `S.dorpen`), en ligt het niet waar je bent, dan lopen, maaien en dwalen zijn poppetjes daar ook, op
  zijn eigen kaart, niet getekend (`T.beweegWezens` in js/anim.js, `T.dwaal` in js/verkennen.js). Een ander dorp dan het
  jouwe (`D.ander`, het buurdorp) spreekt niet tegen jou: **een regel over een dorp zegt iets met `T.zeg(D, tekst,
  soort)`, nooit rechtstreeks met `T.ui.bericht`** (`test/dorpen.test.cjs` kijkt het na); een ander dorp bewaart wat
  het zei (`D.gezegd`).
  `test/dorpen.test.cjs` zet twee dorpen naast elkaar (jouw gehucht en een van de maker): een jaar van het ene laat het
  andere letter voor letter ongemoeid.
- **Meer dorpen op één kaart** (vraag 170, stap 6a; Marcel, 15 okt: "elk een eigen dorp op hetzelfde eiland", 16 okt: "A1
  b1 c2 d1"; getoetst in `test/meer-dorpen.test.cjs`): **een wezen draagt zijn dorp mee** (`e.dorp`, gezet waar het
  ontstaat: `T.nieuwDorp` voor de aanvoerder, het poppetje van een bewoner, `T.maakKar`, het vee, de rovers van een
  overval, en de marskramer, de heer en zijn soldaten), en een veld ook (`a.dorp`). **Elk dorp werkt alleen zijn eigen
  wezens en velden bij** (`T.hoortBij(D, e)`, js/wereld.js, streng sinds stap 6a2: een wezen of veld zonder dorp is van de
  wereld, en hoort alleen bij `null`, een kaart zonder dorp zoals het gereedschap; een toets die zelf een kaartje bouwt,
  geeft zijn wezens en velden dus hun dorp; `T.veldenVan(D)`, js/boerderij.js), met zijn eigen dobbelsteen: het dwalen,
  de praatjes, de oogst, het veldwerk, het vee, het gevecht. **Wat van geen dorp is, werkt de wereld bij** (stap 6a2, a;
  Marcel, 16 okt: "Het wild is van iedereen"): het wild (js/beesten.js), één keer per kaart in `T.wereldTik`. Zo raakt het ene dorp het andere niet:
  de toets speelt het proefdorp twintig dagen met en zonder een tweede op de kaart, letter voor letter gelijk (gemeten op 16
  okt ook een half jaar). Wat een mens van het dorp is (`T.isVanDorp`: zijn aanvoerder, een bewoner, een kar; geen dier of
  bezoeker), kijkt door de mist en maakt het land open. **De plek van een dorp** staat in het dorp (`D.plek`, `T.legePlek` in
  js/wereld.js: zijn land `vak`, zijn `plein`, `kamp`, `markt`, de plek van de `marskramer` en de `heer`, zijn `uitgang`,
  en de `naam` van de dorpsplek op het eiland); de kaart geeft haar plekken door (`w.plekken`, met `p.dorp` als er een dorp
  op woont) en houdt haar pleinen (`w.pleinen`: op geen enkel plein wordt gebouwd, `T.opHetPlein(w, x, y)`). Wat over het
  land van één dorp zoekt, neemt `T.dorpVak(D)`; wat van de kaart is (het tekenen, het lopen, de paadjes), `T.kaartVak(w)`,
  het vak om alle dorpen. **De tik** werkt elk dorp bij (`T.werkDorpBij`), en het lopen één keer per kaart (js/tik.js).
  `T.dorpErbij(S)` (js/begin.js) zet een tweede dorp op het eiland van het eerste (`T.legDorpOpKaart`, js/maker.js), met
  een zaad uit dat van het eiland en zijn nummer. **`S.dorp` is alleen scherm**: wat de balk, de mist, de minikaart, de
  berichten (`T.ui.bericht` krijgt het dorp mee, en toont alleen wat `S.dorp` zegt) en wie je stuurt, laten zien; de
  wereld leest het nergens (nog wel `S.modus` in `T.wereldTik`, tot stap 6b). `T.dorpHier(S)` is het dorp waar de camera
  het dichtst bij is, voor het tekenen en de muis. Een vijand van een dorp is ook elk mens van een ander dorp
  (`T.isVijandVan`, js/gevecht.js; C2), en je bouwt niet in het bereik van een ander dorp (`T.waaromBuitenBouwBereik`).
- **Het toeval van de wereld** (vraag 170, stap 0): `T.dobbelsteen(zaad)` geeft een dobbelsteen met een zaad
  (mulberry32), `T.vastLot(D, a, b)` (js/weer.js) een vaste worp uit het zaad van een dorp, en `T.toeval(D)` een
  dobbelsteen die doorrolt, met zijn stand in het dorp (`D.lot.stand`, of `w.lot` op een kaart zonder dorp), zodat hij
  meegaat in wat bewaard wordt. **Wat de wereld kiest, komt daaruit, nooit uit `Math.random`**: dat is op elke computer
  anders, en in lockstep (live samen spelen) moet de wereld op elke computer precies zo lopen. `Math.random` is alleen
  voor wat het scherm doet, en voor het zaad van een nieuw spel (dat gaat in lockstep mee met het begin). Een keuze die
  ook het scherm vraagt (de tekening van het volgende huis, voor het spookbeeld van het bouwmenu), is een vaste worp
  (`T.vastLot`): wie het ook eerst vraagt, het antwoord is hetzelfde, en vragen verandert niets. Een toets die een
  kans wil laten slagen, zet `T.toeval` even op een vaste worp (`metWorp` in test/praatje.test.cjs).

### js/tik.js: de wereld in vaste tikken

- `js/tik.js` (werklijst vraag 170, stap 0; Marcel, 15 okt: live samen spelen al in de demo, in lockstep): **de wereld
  loopt in vaste tikken**, zestig per seconde echte tijd (`T.TIK`), los van hoeveel beelden een computer tekent; per tik
  schuift ze de tik maal de snelheid op (`T.wereldFactor`, js/tijd.js). `T.wereldTik(S)` is de ene tik: de kalender, de
  klok van het scherm (`S.tijd`, die ook mee bewaard wordt), elk dorp (`T.werkDorpBij`), wie loopt (`T.beweegWezens`,
  één keer per kaart: op één kaart kunnen meer dorpen leven, vraag 170, stap 6a), en waar je kijkt het maaien, het veldwerk,
  het wild en het dwalen van elk dorp dat er ligt, elk met zijn eigen wezens; `S.tik` telt ze. Na de dorpen, één keer per
  kaart, **wat van geen dorp is** (vraag 170, stap 6a2): het wild van de stukken land die open gingen (`T.zetWildBij`), de
  nacht van het wild (`T.werkBeestenDagBij`, na de nacht en het bos van de dorpen), wie van de wereld vecht (`T.werkGevechtVanDeWereldBij`), en waar je niet kijkt het wild in het bos
  (`T.werkBeestenBij`; waar je kijkt na het veldwerk, als er rondgelopen wordt). js/main.js tikt
  zo vaak als er tijd verstreek (`T.tikBij`: een tik gaat al als er een halve klaarligt, zodat bij zestig beelden per
  seconde elke tik in een eigen beeld valt, en hooguit drie per beeld: een trage computer laat de wereld dan langzamer
  lopen, zoals tot nu). **Spel.debug.stap, de speeltest, de toetsen en `npm run grootte` tikken dezelfde tik**: geen eigen
  lijstje meer (tot 15 okt bouwden negen toetsen en het harnas van de meting de spellus van js/main.js elk na, en
  het harnas miste al het veldwerk en het wild). Een toets met maar een deel van de wereld (alleen de bewoners, alleen
  het lopen) roept die delen zelf. Wat alleen scherm is (de camera, de muis, de briefjes, de zwevende teksten en wie in
  een beurt op een animatie wacht: `T.werkEffectenBij`, js/anim.js), werkt js/main.js elk beeld bij; ook het vanzelf
  opslaan, want wat een computer bewaart en wanneer, is van hem alleen.
- **De opdrachten van de spelers** (js/tik.js): een klik die de wereld verandert, roept de regel niet zelf aan, maar geeft
  een opdracht, als gegevens (`T.geefOpdracht(S, { soort, ... })`: namen, plekken en nummers, geen dingen; een gebouw
  heeft geen nummer, dus zijn plek). Ze staat in `S.opdrachten` tot de volgende tik, en daar doet `T.OPDRACHTEN[soort]`
  hem in het dorp (`o.dorp`, het nummer in `S.dorpen`). In lockstep gaat precies die opdracht over de lijn en gaat hij
  bij elke computer in dezelfde tik in. Het scherm vraagt vooraf hetzelfde als de regel (`hover.ok`, `T.handelingAfbreken`),
  en wat er gebeurde, zegt de regel tegen het dorp (`T.zeg`). Nu: bouwen, een weg, een veld, afbreken (js/main.js) en de
  soldaten (de knoppen op het briefje van het wachthuis dragen een `opdracht`, js/huisbriefje.js). `test/tik.test.cjs`
  kijkt na dat het scherm die regels niet zelf aanroept. **Nog niet** (stap 6 van vraag 170, als een venster de tijd niet
  meer stilzet): de vensters (de handel, de velden, het slachten, de heer, de wetten, de brieven, de bode),
  de snelheid, en het debugvenster; het lopen van de schout en het gevecht in beurten zijn eruit (stap 2 en 5). De kolonist van de speeltest roept de regels nog zelf aan, tussen de tikken.


### js/opslaan.js, js/menu.js en js/instellingen.js: opslaan en laden, het titelscherm, het menu en Settings

- `js/opslaan.js`: **opslaan en laden** (werklijst punt 3, vraag 48): het bewaart heel `Spel.S` behalve wat
  alleen scherm is (`T.schermVelden`), met de verzamelingen en alles wat elkaar aanwijst heel
  (`T.bewaarSpel`, `T.leesSpel`, `T.zetSpel`). Een plek die vanzelf gaat, elke ochtend als de mensen opstaan
  (`T.werkOpslaanBij`; op 30× om de drie dagen, want het kost een hapering), en vijf eigen (`T.slaOp`, `T.opgeslagenSpellen`); waar het blijft, zegt één functie
  (`T.opslagPlek`: de opslag van de browser, straks een bestand). Na het laden meldt het de soorten aan van wat er op de
  kaart ligt (`T.kenSoortVan` in `js/kaart.js`): een verse bladzijde kent alleen wat ze zelf neerzette, niet een gebouw
  uit het spel (gevonden met de proef met opslaan, 4 okt). `js/main.js` begint een nieuw spel
  (`T.nieuwSpel`, dat een vorig spel helemaal wist), laadt er een (`T.laadSpel`), en gaat terug naar het
  titelscherm (`T.naarTitelscherm`). Na het laden maakt de lus eerst het land van alle open stukken (`laden`,
  `T.maakOpenStukken`, een paar per beeld) en dan wat de tik anders koud uitrekent (`T.opwarmStappen` in `js/tik.js`: het
  raster om te lopen en zijn eilanden, wat er op elke tegel staat, het bos van het wild, het net van de paadjes; H4), en
  tikt en tekent pas daarna; het menu zegt zolang hoe ver het is ("Loading the land… 4 of 9", `T.ui.landLaadt`), doet
  niets op een klik of Esc, en gaat dan dicht (18 okt; `snelheid.md`, F2 en H4: anders deed de eerste tik het allemaal
  tegelijk, 0,5 s op het proefdorp en seconden na veel verkennen).
- `js/menu.js` is het scherm erbij, sinds vraag 172 (16 okt; Marcel: "We hebben een volledig menu nodig geen a.i slop") een
  volledig menu. **Het titelscherm is tekst over de wereld**: links het woordmerk en de keuzes (`.titel-links`; Continue,
  Campaign (niet in de demo; de hoofdstukken op een rij, `campagneScherm`, en een hoofdstuk begint met `speelHoofdstuk`;
  `js/campagne.js`), New game, Load, Settings, Credits, en Quit alleen in Electron, `kanAfsluiten`), rechts het land (`CAMERA.titelOpzij` in
  `T.titelCamera`, `js/main.js`). Elke keuze is een `.menu-keuze`, tekst zonder kader; wat je hebt, is wat de focus
  heeft (de muis zet hem, de pijltjes stappen, Enter neemt), en een vaantje (`--vaantje` in `stijl.css`, zeven bij tien
  pixels op twee keer) staat ervoor. **New game** is een eigen scherm op die plek: de naam, het land (het nummer, *Other
  land*, en het eiland als ruit, `tekenEiland`, uit het beeld van de minikaart), de spelregels (`T.ui.openSpelregels(S,
  'nieuw')`; *Standard* of *Custom*, `T.spelregelsAnders`), en Begin, dat het land opnieuw maakt als de regels anders
  zijn dan waarmee het gemaakt is (`landRegels`). Load en Credits liggen op papier ernaast (`.menu-venster.naast`).
  **Het menu onder `Esc`** is papier in het midden, met een regel per keuze: Resume, Save, Load, Settings, Game rules (de
  stand `'lezen'`), Photo mode, To the title screen, en Quit. Een venster erbovenop (Settings, de spelregels) heeft de
  toetsen; als het dichtgaat, tekent `T.ui.werkMenuBij` het menu opnieuw.
- `js/instellingen.js`: **Settings** (vraag 172 en 172b): wat van jou is en niet van het spel, als venster
  (`T.ui.meldVenster`, zonder toets), in vier tabbladen: *Display*, *Graphics*, *Game* en *Controls*. Wat er te kiezen
  is, zijn de opties met `instelling` in `js/opties.js`, en die noemt zijn tabblad ('beeld', 'tekening', 'spel'); een rij
  is `T.ui.optieRij` (`js/hud.js`, met `kan` voor een keuze die nu niet kan). Erbij: de taal (`T.kiesTaal` herlaadt) en de
  toetsen (`toetsen()`, alleen om te lezen: komt er een toets bij in `js/main.js` of een venster, zet hem hier erbij).
  **Het venster:** in Electron over de brug `window.schil` (`verpakken.md`, "Het venster en de brug"; `pasVensterToe`,
  bij `DOMContentLoaded` en na een keuze), in de browser alleen het hele scherm (`requestFullscreen`, niet te onthouden).
  **Wat de keuzes doen:** de waarden staan in `T.TEKENEN_INSTELLINGEN` (`venster`, `vensterMaat`, `beeldenPerSeconde`,
  `meter`, `helderheid`), `T.TIJD_INSTELLINGEN.pauzeAlsWeg` en `T.OPSLAAN_INSTELLINGEN.vanzelf`; `js/main.js` past ze
  toe: de lus slaat beelden over tot de grens (`lus`, in de maat van de grens, ook op 144 Hz; de wereld loopt hetzelfde),
  `T.ui.pasBeeldToe` zet de meter (F2 is dezelfde instelling) en de helderheid (een filter op de doeken, niet op de
  vensters), en `blur` en `focus` zetten de tijd stil onder de reden `'weg'`. `T.werkOpslaanBij` (`js/opslaan.js`) kent
  `vanzelf`. Geen schuif voor het geluid zolang er geen geluid is. Alleen scherm (`ALLEEN_SCHERM` in `test/laad.cjs`).


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
- **De tekst van het scherm** (vraag 147, deel 3, 11 okt): `js/hud.js`, `js/balk.js`, `js/ui.js`, `js/huisbriefje.js`,
  `js/dialoog.js`, `js/verkennen.js` en `js/main.js` zijn om. **`index.html` heeft zelf geen
  tekst voor de speler meer**: een element zegt met `data-t` (tekst), `data-t-html` (tekst met toetsen) of `data-t-title` (de
  uitleg bij de muis) welke zin erin hoort, en die staat in `PAGINA` onderaan `js/ui.js`; de balk onderaan vult haar eigen
  stukken (de knoppen uit `KNOPPEN`, de namen van de bazen, de lat uit `SNELHEDEN`), en `document.title`
  en `lang` komen ook uit `js/ui.js`. Een toets staat als `<kbd>` (`kbd('Esc')`, nooit in de zin), en `Spel.debug` en de
  meldingen in de console blijven Nederlands (`// geen tekst`, `main.js` heeft er zo'n honderd). De klok in de balk is
  `T.uurTekst` (`js/dag.js`: "seven o'clock", "half past seven"; ook bij een bewaard spel in `js/menu.js`), met het deel
  van de dag uit `DAGDELEN` in `js/hud.js`. De namen van de provincies staan met een kleine letter (`T.LANDSOORTEN`: "the castle"), zodat ze in
  een zin passen ("You are in the castle"); de kaart zet de hoofdletter.
- **Een zin uit de gegevens** (vraag 147, deel 5): een tabel die een bewerker terugschrijft (`T.bronBlok`), de gesprekken
  (`T.GESPREKKEN`; tot 23 okt ook de quests), houdt zijn Engelse zinnen als gewone tekst, want de bewerker kent geen
  `T.t`. Wie zo'n zin toont, vraagt hem aan `T.tGegevens(zin, woorden)` (hetzelfde als `T.t`, voor een zin die geen gewone
  tekst in de code is): een gesprek doet dat in `T.vulWoordenIn` (`js/gesprek.js`), waar alles langs komt wat een gesprek
  toont. `npm run teksten` leest die zinnen uit de tabel (`GEGEVENS` in
  `gereedschap/teksten.cjs`: per tabel welke velden de speler ziet, en wat alleen voor de schrijver is, zoals de situaties),
  zodat ze in `taal/bron.js` staan. Een tabel die gewone code is (`T.VOORVALLEN`, `T.OORZAKEN`), krijgt
  gewoon `T.t`.

### js/naam.js: de naam van het spel

- `js/naam.js`: de naam van het spel (`T.NAAM`, sinds 11 okt Tithebreaker), op één plek, want hij kan nog
  veranderen (Marcel, 28 sep); een titel schrijft `{naam}`. De sleutel waaronder de browser iets bewaart (`T.OPSLAG_SLEUTEL`) staat ernaast en
  verandert nooit mee. `test/naam.test.cjs` bewaakt dat de naam nergens anders staat. `T.STAND` is leeg, behalve in
  een proefversie (`npm run proefversie` zet er de datum en de commit in).

### js/tijd.js, js/dag.js, js/voorraad.js, js/gebouwen.js, js/behoeften.js, js/handel.js, js/heer.js, js/vee.js, js/opties.js, js/hud.js, js/brieven.js: het gehucht verder

- **Het nieuwe spel (het gehucht), verder:** `js/tijd.js` (de kalender met oude maandnamen en het
  uur: een dag duurt vijf minuten bij 1×, een maand dertig dagen; eigen klok naast `S.tijd`; de
  versneller `T.SNELHEDEN`; `T.wereldFactor` en `S.wereldTijd`; wie de tijd stilzet,
  `T.houdTijdStil`), `js/dag.js` (de zon per seizoen, de dagindeling, het licht, het ritme van de
  boeren, en bezoekers die overdag komen, `T.bezoekerKomtAan`; slapen tot de ochtend met Z is sinds vraag 170, stap 5 weg),
  `js/voorraad.js` (`D.voorraad`; alles verandert via
  `T.wijzigVoorraad`), `js/gebouwen.js` (`T.GEBOUWEN`: 45
  soorten op één plek, zoals `T.MENSEN`; elk huis van de huizenbouwer jong en oud, vraag 144: wat er bij het begin al
  stond, is oud, wat gebouwd wordt, is jong en na `oudNaDagen` oud, en alleen het voorwerp wisselt van tekening, `T.maakOud`,
  `T.tikVerwerenDag`; bevolking, woonruimte, handen, productie per dag (de zagerij zaagt stammen, de waar `hout`, tot
  planken, en wat je bouwt, kost stammen in het gehucht, planken in een dorp en steen in een stad: vraag 157),
  `T.plaatsGebouw`, bouwfases via `T.bouwFaseIndex`; niet op iemand en niet op een deur, `T.waaromNietOpIemand`, vraag 88, en altijd met drie tegels looppad rondom, `T.looppadOm` (Marcel, 3 okt); een gebouw maakt alleen wat zijn grondstof
  toelaat, wie iets omzet maakt tot er genoeg ligt, `T.maaktTot`, en gereedschap laat harder werken; wat hij vandaag maakt,
  zegt `T.receptVan(D, g)`: zijn `maakt`, of bij wie kiest (`maakt.keuze`, de wapenmaker, vraag 159) één stuk per dag, wat
  de wachthuizen vragen (`T.wapensGevraagd`), en de kar brengt hem `T.watErIngaat`; wie stilligt, zegt
  `T.stilOp`: in een seizoen, `stilIn`, of buiten zijn maanden, `alleenIn`, zoals de wijnboerderij, die alleen in wijnmaand
  plukt (vraag 136 en 155: een gewoon huis van 5 bij 4 met een gezin van boeren, vanaf het gehucht, met wijngaarden als
  velden ernaast; `veld` bij de akker en de wijngaard zegt bij welke boerderij hij hoort; de dorpelingen willen bier, de
  wijn is eten, en de heer wil er wijn voor)), `js/behoeften.js` (de tevredenheid van het dorp uit eten, brandhout en een
  kapel, met wat de herberg, de wetten en de heer erbij of eraf doen; de winter, en of het hout en het eten hem halen, `T.houtVoorDeWinter` en
  `T.etenVoorDeWinter`, uit één regel met het hooi, `T.haaltDeWinter` en `T.raaktOp`; vanaf 90 dagen ervoor kijkt het dorp
  ernaar, `T.winterInZicht`, voor de raad en de groei: haalt het hem niet, dan komt er geen gezin,
  `T.watDeWinterNietHaalt`, de spelregel "Groei"; het hout dat de mensen elke dag
  sprokkelen, `T.sprokkelHout`, zo'n 40% van wat de winter vraagt, zodat een houthakker nodig blijft; een huis dat
  doorgroeit op de afwisseling (hieronder, bij `js/huisbriefje.js`); zout dat vis en vlees goed houdt; vis en vlees vullen ook een maag, de spelregels "Vlees" en "Vis"; **de
  maaltijd en de afwisseling**, vraag 154: `T.eetVandaag` eet in gelijke delen van elke soort in `T.SOORTEN_ETEN` die er
  ligt, binnen een soort eerst wat bederft, het zaaigraan pas bij nood, en zet in `D.behoeften.afwisseling` de soorten die
  minstens `afwisselingDeel` van de maaltijd waren; `T.werkVanAfwisseling` maakt er het werk van, en de groei van de huizen
  vraagt er genoeg van, en dat geldt voor de werkplaatsen
  (`js/gebouwen.js` stap 6; tot 15 okt maal de tevredenheid), de bouwers (`werkdagenVan` in `js/bouwen.js`) en de duur van het
  veldwerk (`werkUur` in `js/veldwerk.js`, `begin` in `js/akkers.js`); `T.voedtAlsGraan` zegt wat een stuk vult,
  `T.etenNaastGraan` wat de andere soorten voeden, en `T.maaltijdDeel` wat het dorp per dag van één soort
  eet, voor de wijn na de pluk; de status `eentonig` staat in `js/statussen.js`, en wat een soort erbij brengt,
  `T.watHelptAanAfwisseling`, in `js/raad.js`),
  `js/handel.js` (de marskramer: drie bezoeken per jaar, prijzen per bezoek, `T.kanKopen` en
  `T.kanVerkopen`; in de lente ook zaaigraan, dat de boeren nazaaien tot 1 bloeimaand, en in een dorp laken (vraag 99), `T.zaaiNa` in `js/akkers.js`, waar
  ook staat hoeveel zaaigraan ze van de oogst tot het zaaien achterhouden, `T.zaaigraanApart`: het dorp eet het pas bij nood; hij staat op de plek `"marskramer"` uit het betekenisbestand), `js/heer.js`
  (Sint-Maarten: zijn brief op 11 oogstmaand, drie maanden ervoor, met de dagen tot hij komt in de balk
  (`T.dagenTotDeHeer`, js/hud.js; sinds 18 okt, ook in het eerste jaar: `heerVrij` 0 in js/begin.js), wat hij vraagt naar
  wat het dorp op dat moment heeft (het graan in de schuren, de mensen, de kist zoals hij hem telde toen hij kwam, en elk
  gebouw) via `T.eisVanDeHeer`, alles maal `eisMaal` (buitensporig, behalve de schuld; per gebouw `T.heerVraagtVoor`),
  `T.gevolgVanBetaling` voor venster en knop; betalen is alles wat hij vraagt, zoveel als er is, en goud voor de rest
  (`T.alWatHijVraagt`, ook als hij het zelf neemt), en weigeren (`T.weigerHeer`) laat hem gaan en zijn leger komen als het
  donker wordt (een schemering na zonsondergang, als het dorp nog op zijn erf is). **Sinds 20 okt speelt dat in de
  wereld** (werklijst E, stap 4; Marcel: "A1 B1 C1"): het leger (`h.leger`, `werkLegerBij` vanuit `T.werkHeerBij`) zijn
  `leger.mannen` echte soldaten die om de `leger.elke` seconden over de weg de kaart op komen, allemaal langs één gezochte
  weg naar het plein (`h.leger.pad`), elk met licht (`T.legerVanDeHeer`, js/zien.js); wie buiten is, vlucht naar het town
  hall (`T.schuil`, en in js/gevecht.js blijft het dorp schuilen zolang het leger er is); er wordt niet gevochten (ze zijn
  geen vijand); en is de eerste bij het plein, dan is het het eind (`legerKomt`, `D.einde.reden` 'leger'). Zonder wereld of
  tegels (een toets) is het meteen het eind, en `T.tikHeerDag` maakt het af als het een dag later nog onderweg is. **Zijn
  wagen** (C1): de heer brengt hem mee (`b.wagen`, de laatste van `b.wezens`; `T.maakKar` met `vanDeHeer`, dus niet van het
  dorp: `T.isVanDorp` in js/wereld.js, en zijn tekst `T.heerWagenTekst` via `T.karTekst`), en die staat leeg op het plein
  (`plekVoorDeWagen`). Betaal je, of neemt hij het zelf, dan laden zijn soldaten eerst (`T.heerVertrekt` → `laadDeWagen`,
  `b.laden` met de fasen 'heen' en 'terug', `werkLadenBij`): naar je voorraad (`T.deVoorraad`, js/kar.js) en terug; dan
  ligt wat hij nam op de wagen (`T.zetKarVel`), en rijden ze de weg af (`rijDeWegAf`). In de demo is het het eind als de
  wagen `wagen.demoWegNa` tegels van het plein is (`betaaldEinde`); `T.eindVanSintMaarten` is het eind meteen (overslaan in
  js/regie.js). Elke weg gaat langs `zoekWeg`, dat op een kaart zonder tegels niets zoekt. Het venster heeft sinds 18 okt geen
  schuiven meer, alleen twee zegels van lak (`zegel` in js/hud.js; Marcel, B2: "mooie grote knoppen", "in de stijl van een
  zegel"): heel is betalen, gebroken is weigeren, en weigeren vraagt één keer bevestiging; de straffen tot je ambt
  kwijt, de gunst na het betalen, `T.gunstNaSchatting`; zaaien en braak staan in `js/akkers.js`; sinds 11 okt, vraag 151, optie 1, deel B1, kijkt hij
  niet meer op een rapport en kent hij geen argwaan, toeslag of rond kijken meer;
  de inner zelf ging er op 11 okt ook uit; de schandpaal kost het dorp `schandpaalKost`, en er kan alleen een boer met
  een naam op de kaart aan, `e.wie`, dus in het lege begin alleen de aanvoerder), `js/vee.js` (het vee: `T.VEE` en `T.maakDier`,
  koeien en schapen die grazen, staan en liggen, `T.rustVanDier`; sinds 20 okt (werklijst Q, vraag 181, b) vee dat erbij
  komt, `T.veeErbij` (de kar, `metDeKar`; de marskramer, `vee` in `verkoopt`, js/handel.js, en zijn venster telt dan je
  dieren), los tot er een weide met plaats is: elke ochtend `T.losVeeNaarDeWeide` (in `T.tikVeeDag`), de grootste eerst; velden naast elkaar als één weide,
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
  `I.tekstVan` in `gereedschap/instellingen/bron.js`. **Spelregels en instellingen** (vraag 172, 16 okt): een optie met
  `instelling: true` raakt alleen het beeld of het scherm (de tekening, de schaduwen, de doorkijk, de bomen door het jaar,
  het kleine leven, de kleren, de raad), en is van wie speelt: de browser onthoudt hem, en hij staat onder Settings. De rest
  zijn spelregels, en die horen bij een spel: `S.spelregels` (`{ keuzes, namen }`, bewaard met de rest van `S`), uit
  `T.nieuweSpelregels()` bij `T.nieuwSpel` (wat je het laatst koos), en na het laden weer toegepast (`speelGelezen` in
  `js/main.js`; niet in `T.zetSpel`, want daarmee herstellen de toetsen hun proefdorp). Wat geldt, is
  `T.optiesVoor(S)`: de instellingen en de werkbank van de browser (`inBrowser`), met de spelregels van `S` erover;
  `T.pasSpelregelsToe(S)` past het toe. `T.zetOptie(id, keuze, S)` en `T.zetNaam` schrijven in de browser, en een
  spelregel ook in `S.spelregels`; `T.spelregelsTerug(S)` laat de instellingen staan, `T.optiesTerug` niet. De toets is:
  raakt het de wereld (de tik), dan is het een spelregel; zo spelen twee spelers samen met dezelfde regels, ieder met zijn
  eigen beeld), `js/hud.js` (de kalender, het bouwmenu onder
  `B`, sinds vraag 179 een raster van plaatjes boven de knop Build, bij "Bouwen en groeien", het veldenvenster onder `V`, het handelsvenster en het betalen aan de heer), en `js/brieven.js`: **de
  brieven van de heer op één plek** (vraag 60, het eerste stuk van hud.js splitsen): de benoeming waarmee een nieuw
  spel begint, de schatting op 11 oogstmaand (tot 18 okt 1 wijnmaand), de heervaart, en een brief bij elke trede (het dorp, marktrecht), elk een
  soort in `BRIEVEN`, getoond met
  `T.ui.toonBrief(D, soort)`, en alleen die aan jouw dorp komt in beeld; de knop Brief opent een brief die op je antwoord wacht. Een nieuw spel begint
  met `T.beginOpEiland` (`js/begin.js`; `?kaart=gehucht` begint meteen, zonder titelscherm en brief), op het land van de
  maker (`js/maker.js`; tot ronde 2 van het snoeien, stap 3c, het ontworpen gehucht uit
  `gereedschap/tiled/maak-gehucht.cjs`, beide weg), de
  bouwfases uit `gereedschap/pixelart/bouwfasen.cjs` (`tegels/bouwfasen/<tekening>.png` + `bouwfasen.json`). Getallen
  om bij te stellen staan telkens bovenaan in één blok (`T.GEBOUWEN_INSTELLINGEN`,
  `T.BEHOEFTEN_INSTELLINGEN`, `T.AKKER_STADIA`, `T.GRAAN_PER_TEGEL`, `T.HANDEL_INSTELLINGEN`,
  `T.HEER_INSTELLINGEN`).

## Wereld en lopen

### js/wereld.js: wezens, voorwerpen, bomen, en de vragen over een kaart

- **Eén weg naar de tegels** (B2a, 13 okt; `kaarten.md`, "Het hele eiland"): wat een tegel is (`T.tegel`, `T.zetTegel`),
  welke grond eronder ligt (`T.grondOp`), of een tegel op de kaart ligt (`T.opKaart`), wat de kaart beslaat
  (`T.kaartVak(w)`: `{ x, y, b, h }`), of een kaart tegels en grond heeft
  (`T.heeftTegels`, `T.heeftGrond`), en een tegel als getal dat niet van de maat afhangt (`T.tegelNummer`,
  `T.tegelVanNummer`, voor wat per tegel bewaard wordt). Alleen `js/wereld.js` en `js/kaart.js` lezen `w.tegels`,
  `w.grond`, `w.b` en `w.h` (`test/tegels.test.cjs`). Een lijst over de hele kaart (het vaste raster, de eilanden, de
  velden van het lopen, het net van de paadjes, de natuur bij een gebouw, de beken, het bos van de beesten, de lichtkaart)
  beslaat `T.kaartVak(w)`, met tegel (x, y) op plek `(y - vak.y) * vak.b + (x - vak.x)`; in B2b krijgt elk zijn eigen vak.
- **De kaart van het eiland** (B2b, 13 okt; `kaarten.md`, "Het hele eiland"): `T.eilandKaart(zaad, vak)` is het hele
  eiland in stukken van `T.STUK` (64) bij 64, achter dezelfde vragen als een kleine kaart van een toets. In S staat alleen wat er
  anders werd, per tegelnummer: `w.tegelsAnders` (`T.zetTegel`), `w.grondAnders` (de maker), `w.gerooid` (een ding van het
  eiland dat weg is, `T.haalVoorwerpWeg`), wat iemand zette in `w.voorwerpen`, welke stukken open zijn (`w.open`,
  `T.openVak`); wat een dorp kent, staat in het dorp (`D.gekend`, `js/mist.js`). Een stuk dat niet open is, is 'buiten'. Open gaat het waar je mensen komen (`T.werkStukkenBij`, elk
  beeld in `T.werkDorpBij`; stap 5, Marcel: "Al je mensen"): een stuk binnen `openRond` tegels (16,
  `T.WERELD_INSTELLINGEN`) van de aanvoerder, een dorpeling of de ossenkar, hooguit één per beeld. **Alles per stuk**
  (Marcel, 13 okt): een stuk dat open gaat, is geen kaartverandering (geen `T.kaartVeranderd`); wat het land beslaat,
  kijkt naar `T.openGrootte(w)` en neemt alleen de nieuwe stukken erbij (`T.nieuweStukken`): het raster van wat vaststaat
  en de eilanden van A\* (met een unie, `ouder`), de lijst platte dingen en de grondbuffer in `js/tekenen.js` (een
  bufferstuk per beeld opnieuw, `buf.oud`), en de wegen in `js/lopen.js` (alleen 'geen weg' opnieuw). `T.kaartVeranderd(w,
  plek)` met een plek (zoals `T.voetVan`) werkt alleen die tegels van het raster bij, en kwam er alleen ruimte bij, dan
  gaan ze op in de eilanden ernaast (`maakVrij`). **De rand van een level** (vraag 187, stap 2a, 24 okt; `scenario.md`,
  1): `w.rand` is `{ sx, sy, b, h }` in stukken (`T.randOm` in `js/maker.js`), en `T.stukBinnenRand(w, sx, sy)` zegt of een
  stuk erbinnen ligt (zonder rand altijd; niet te verwarren met `T.binnenRand`, een punt in een veelhoek). Alleen de twee
  plekken die `w.open` vullen (`T.openVak` en `T.werkStukkenBij`) en het vooruit maken kijken ernaar: wat nooit open gaat,
  is 'buiten', dus niet te begaan en niet getekend. `T.kaartGrens` geeft dan de rand, zodat de camera erbinnen blijft
  (`begrens`, `js/main.js`) en het tekenen erop afknipt. De kaart onthoudt de laatste 64 plekken (`T.kaartPlekkenSinds(w,
  versie)`, null als het niet bekend is, alleen scherm): de lijst platte dingen en de grondbuffer in `js/tekenen.js`
  werken alleen die plekken bij, een bufferstuk per beeld (`vergeetVeranderdeKaart`, 13 okt; eerst alle grond in beeld,
  49 ms), en waar het zand van de paadjes anders werd (`T.zandHoeken`) net zo. Van zo'n stuk alleen het deel dat
  veranderde (`buf.vuil`, `tekenBufferDeel`, 17 okt; eerst het hele stuk van 512 bij 512): op een los doek in precies de
  stand van het stuk, en dan op zijn plek, want met een clip of op een verschoven doek rondt de browser ver uitgezoomd net
  anders af. Het land wordt **vooruit** gemaakt (`maakVooruit`): binnen `vooruit`
  tegels voorbij `openRond`, in delen van `vooruitDeel` (en daarvoor de blokken van het eiland eronder, een per stap:
  `T.eilandRasterVooruit`, zodat geen stap meer dan een paar ms kost), `vooruitMsPerSeconde` (minstens een stap per beeld), eerst wat het eerst nodig is
  (`nodigOver`, 13 okt: wie loopt, langs zijn pad; wie stilstaat, daarna); het wacht in de
  stukken tot het open gaat. De stukken zelf (`maakStuk`: `T.landStuk` met wat er anders werd
  erover, en de dingen van het eiland als voorwerpen met `v.natuur`) staan niet in S: een geladen spel maakt ze opnieuw
  (`test/eilandkaart.test.cjs`), allemaal vóór de eerste tik (`T.maakOpenStukken`, `ladenMsPerBeeld` per beeld). `T.kaartVak(w)` is daar het vak om het dorp (`w.vak`), en wie wil weten wat er in een
  stuk land staat (ook wat er groeit), vraagt `T.voorwerpenIn(w, vak)` (van elk open stuk alleen het deel in het vak;
  vraag 178: eerst elk stuk helemaal, 4096 tegels); de vaste rijen in `js/tekenen.js` (vraag 178, B2) nemen een stuk
  in zijn geheel met `T.stukOpen(w, n)`. Een voorwerp maak je op één manier
  (`T.maakVoorwerp` in `js/kaart.js`), en de grond van het eiland per nummer met `T.grondVanGid`.
- **Over een brug van het eiland** (vraag 170, stap 6a2, 17 okt): `T.brugOp(w, x, y)` zegt welk stuk van welke brug er
  ligt (`E.brugOp`, `js/eiland.js`), of null. Het water eronder blijft water (`T.grondOp`), maar de tegel is vloer
  (`tegelVanGrond`, in `maakStuk` en als er iets weggaat) en een pad (`T.opPad`): je loopt erover, er wordt niets op
  gebouwd, en de ossenkar rijdt er als op een weg.
- `js/wereld.js`: wat een wezen is (`T.WEZENS`) en wat een voorwerp is (`T.VOORWERPEN`), de bomen en de struiken op één
  plek (`T.BOMEN`, vraag 148: wat een boom van het bos is, `T.isBosBoom`, wat je rooit, wat de houthakker inplant, de
  wind en de bosrand; een nieuwe soort telt zo overal mee), de
  vragen over een kaart (`isBegaanbaar`, `isVast`, `raakt`, `zicht`/`zichtTussen`/`zietTegel`, `isZichtbaar`,
  `opHetPlein`: op het plein wordt niet gebouwd, en `T.pleinTegels`: de tegels van het plein, één keer per kaart),
  wat er op een tegel staat (`T.voorwerpOp`, uit een lijst per tegel die de kaart zelf bijhoudt, niet in `S`; een voorwerp
  zet je erbij en haal je weg met `T.zetVoorwerp` en `T.haalVoorwerpWeg`, vraag 71: dit was 85% van een speeldag; voor
  een heel vak in één keer `T.voorwerpOpVak`, met op elke tegel hetzelfde, voor de nacht van het wild),
  en (tot 23 okt) de proefkamers, met deuren, kamers die je ontdekt en twee monsters: ronde 4 van het snoeien. Een toets
  die een kleine kaart nodig heeft, zet er een van tekens neer (`test/regels.test.cjs`). De naam van een wezen staat
  met een kleine letter ("the wolf" in de zin, `T.t('The {wezen} sees you.')`), en wat een monster doet, is
  `aanval.zin` met `{doel}` erin (`T.t('bites {doel}')`): `js/gevecht.js` vult *you* of de naam van de man van de militie in
  (`T.vulTekst`), zodat een vertaler de hele zin kan bouwen.
  De kaart van het spel is het eiland. De speler is `S.dorp.aanvoerder`, met soort
  'aanvoerder' en kant 'speler' (Marcel, 26 sep: een man van de militie vecht later ook aan kant
  'speler' zonder de aanvoerder te zijn); hij draagt het vel van een gewone dorpeling (`js/sprites.js`).

### js/mist.js: de mist

- `js/mist.js`: **de mist** (B2c, 13 okt; Marcel: "A2, B1, C ok"; het plan in `kaarten.md`, "Het hele eiland"). Zwart wat
  niemand van jou zag, grijs wat je zag maar nu niet ziet, helder waar je mensen kijken. **Wat je kent, is spelstaat**:
  per dorp (`D.gekend`, want elke speler heeft zijn eigen mist; vraag 170, stap 6a), per stuk (`T.stukNummer`) een lijst van 128 getallen van 32 bits (64 rijen van
  twee), of `true` als je het hele stuk kent, zodat het bewaarde spel klein blijft (een leeg begin 23 kB, was 15 kB; versie
  11). `T.kentTegel(w, x, y)`, `T.kenKring(w, x, y, r)` (geeft true als er iets bij kwam, en hoogt `T.mistVersie(w)` op,
  voor wie het bijhoudt), en `T.kenHetBegin(w, vak)`: de kring van `beginKring` (50) om het midden van je land, vanuit
  `js/maker.js`. **Wat je nu ziet, is het niet**: `T.werkMistBij(S, D)` (elk beeld in `T.werkDorpBij`, na het openen van het
  land) zet wie er kijkt in een WeakMap (`T.wieKijken(D)`): de mensen van het dorp (`T.isVanDorp`, in `js/wereld.js`, dezelfde als wie het
  land open maakt), de gebouwen die af zijn (vanaf de rand van hun voet) en het plein; wie van tegel veranderde, maakt
  zijn kring bekend. `T.zietNu(w, x, y)`, en `T.zieJeWezen(S, w, e)`: je eigen mensen altijd, een ander (een beest, een
  rover, een bezoeker) alleen waar je nu kijkt; het tekenen, de muis (`zoekDoel` in `js/main.js`), de doorkijk
  (`T.zichtbaarDoor`), de wolkjes en de ogen van de wolven vragen het. `T.waaromOnbekendLand(D, r)`: je bouwt alleen op land
  dat je kent (`T.waaromPastHetNiet`, `T.waaromPastVeldNiet`). Een klik in het zwart (B1) loopt erheen als er een weg is:
  het land gaat verder open dan iemand kijkt (`openRond`, 16), dus dat gaat zoals op elke tegel. Een kaart die niet op het
  eiland ligt (een toets), heeft geen mist. De getallen in `T.MIST_INSTELLINGEN` (de werkbank, "The fog"); het tekenen in `js/tekenen.js` (`tekenMist`,
  `mistOverLijst`) en `js/gl.js` (`tekenMist`, grayscale). **Op de heuvels** (vraag 174, stap b4, 17 okt; Marcel: "M2"):
  het masker ligt op de grond via een net per stuk van 64, een punt op het midden van elke tegel op zijn hoogte
  (`mistNetVan`, eens gemaakt en na een vlak stuk alleen opnieuw waar de glooiing veranderde, `perStukVanDeHoogte`);
  `js/gl.js` tekent het net naar een laag op de halve maat (`tekenNet`, de punten van een stuk één keer naar de kaart)
  en ontkleurt en verdonkert daarmee de grond (`FRAG_MIST`). Zonder videokaart elk vierkant van het net apart
  (`mistPerVierkant`): het klopt, maar kost bij het dorp 28 ms per beeld en ver uitgezoomd 140. Een land zonder hoogte
  gaat met de videokaart langs hetzelfde net, plat. Tot dan lag het masker plat, en op een heuvel van 300 pixels zo'n
  19 tegels naast zijn grond. Met de videokaart kost de mist bij het dorp niets meetbaars. Getoetst in
  `test/mist.test.cjs`.

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
  de kaart, dus een weg is dezelfde, hoe ver het veld ook al gegroeid was, en ook na het laden. Op het eiland beslaat
  een veld het dorp met `veldRand` tegels eromheen (`veldVak`), niet al het land dat je kent; van of naar daarbuiten, of
  als het veld geen weg vindt, zoekt hij hem zelf.
- **Door land dat nog dicht is** (vraag 170, stap 6a2, c0, 17 okt): ligt het doel van `T.zoekRoute` in land dat nog
  dicht is (`'buiten'`), of komt een man er over open land niet (de optie `tocht`: `loop` in `js/kiezen.js`, en een post
  ver van huis via `T.bevelAnker`), dan geeft `tochtRoute` de weg naar het verste vak van een grove weg dat al open is.
  De grove weg is een veld over de vakken van de schets (`E.vak`, `js/eiland.js`; Dial, 10 recht en 14 schuin, geen
  hoek afsnijden): in land dat dicht is wat de schets zegt (`grofKost`: water en woud dicht, broek drie keer zo duur, een
  weg van het eiland open, vak voor vak recht aansluitend), in land dat open is alleen een vak met een tegel van het
  eiland van wie loopt (`kostVoor`, met `T.eilandOp`), en buiten de rand van een level dicht (`T.stukBinnenRand`; stap 2a
  van vraag 187, Marcel: "Hij loopt tot de rand"). Kan hij er niet komen (`delenVan`, `doelVak`), dan naar het vak
  van zijn deel dat er het dichtst bij ligt: bij een doel buiten de rand loopt hij zo tot de rand, en daar houdt de tocht
  op (`tochtRoute` geeft null, hij wacht niet). Alles uit het nummer van het eiland en het open land, geen spelstaat; per
  kaart opnieuw als de kaart of het open land verandert (`grofVan`). Wat het kost, valt weg tegen het maken van het
  land zelf (`T.landStuk`, een profiel van 17 okt); de getallen `grofOnthouden` en `grofVooruit` in
  `T.LOPEN_INSTELLINGEN`. `T.groveWeg(w, van, doel)` (c3, 27 okt) geeft de hele grove weg als een rij middens van vakken,
  voor wie buiten beeld reist (de rovers van een kamp, `js/rovers.js`), gezien vanaf het eiland van het doel; null als er
  geen is. Gemeten op 27 okt: de eerste keer op een eiland zo'n 50 ms (de schets, `grofKost`), daarna 4 à 7 ms per nieuw
  doel, en 0,3 ms voor een doel dat het al kent.

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

- `js/anim.js`: beweging en effecten. Wie loopt, loopt in de tik van de wereld (js/tik.js) op een kaart
  (`T.beweegWezens(S, w, ...)`): waar je bent, of een dorp waar je niet bent (`js/dorp.js`); daar loopt ook de uitval van
  een slag (`e.uitval`, gegevens zonder functie). Wat alleen scherm is, staat in `S.effecten`: de zwevende schade
  (`T.anim.tekst`) en een pijl die vliegt (`T.anim.pijl`); `T.werkEffectenBij` werkt ze elk beeld bij. Tot 15 okt gaf
  `T.anim` beloftes, zodat een beurt in het gevecht als code met `await` las (vraag 170, stap 2: weg).

### js/verkennen.js: rondlopen en dwalen

- `js/verkennen.js`: wat een klik links kiest (`T.handelingVerkennen`; sinds vraag 170, stap 1, loopt de aanvoerder er niet
  meer heen: `js/kiezen.js`; sinds stap 5 opent een klik op de marskramer zijn handel, en op de heer het venster om hem te
  betalen, zonder gesprek; oprapen, sluipen en `S.naLopen` zijn weg, en sinds ronde 4 van het snoeien ook de deuren en
  de kamers van de proefkamers), dwalende monsters, ontdekt worden. Dwalen gaat op een kaart met het dorp
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
  (`E.wegen`, A\* over de vakken, die samen lopen waar het kan), met een recht bruggetje waar een weg een rivier of een
  meer kruist (`E.bruggen`, `E.brugOp`; B2b, Marcel 13 okt: de wegen zijn "die van het eiland"; een tegel is water als
  een hoekpunt nat is, zoals in `T.landStuk`; een voorselectie per vak houdt het op zo'n 0,1 à 0,25 s). **Elke weg heeft
  zijn bruggetje** (vraag 170, stap 6a2, L1, 17 okt; Marcel: "L1"): eerst recht vanaf de weg (`probeer`, hooguit
  `wegen.brugLang` tegels water, landend binnen 2 tegels van waar de weg verder gaat); lukt dat niet (breed of schuin),
  dan zoekt `zoekOmweg` in een vak van `wegen.brugZoek` tegels om de oversteek de kortste rechte brug (hooguit
  `wegen.brugLangst`), met een weg erheen en erna over droog land (een korte zoektocht over de tegels), of, als de weg
  alleen een hoekje water afsneed, alleen die weg. De weg loopt altijd over zijn brug (de punten van `E.wegen` buigen
  erheen, en `E.wegIndex` wordt opnieuw gemaakt): op een weg staan geen bomen, ernaast wel. Tot 17 okt lag een bruggetje
  alleen waar het recht en kort kon, soms naast de weg met bomen op de aanloop, en was een weg op elk eiland twee à drie
  keer onderbroken; `test/eiland.test.cjs` loopt nu elke weg af, aan de grond. Kan de weg om het water heen over droog
  land, dan gaat hij daarover (eerst `zoekOmweg(van, naar, false)`): zo komt er geen brug langs een oever. Een weg die
  vlak naast een brug die er al ligt het water kruist, gaat over die brug. **Een brug is drie tegels breed** (Marcel, 17
  okt: "Er moeten ook soldaten pelotons overheen. Niemand bouwt een brug voor 1 persoon"; `wegen.brugBreed`), **en ligt
  hij in de richting waar de oversteek het kortst is, ook schuin** (Marcel: "De bruggen moeten in 8 richtingen", "Zoals
  hoe de poppetjes lopen", "r2, zet maar in het spel"): langs x, langs y, of schuin `zn` (langs x en y samen, op het
  scherm recht omhoog) en `wo` (langs x en tegen y in, recht opzij), schuin vier rijen (`wegen.brugSchuin`, 2,8 tegel).
  `probeer` kijkt in elke richting tot 45 graden naast de weg en neemt de kortste, `zoekOmweg` in alle acht. De weg gaat
  over rij 1, met een landhoofd op elke oever; ligt de oever schuin, dan is de brug zo lang als de langste rij (`breed`,
  aan elke kant hooguit twee stappen langer). Een stap langs de brug is een tegel verder langs zijn as (schuin √2 tegel),
  en schuin liggen de rijen om en om een halve stap verschoven. **Eén plek voor de vorm**: `T.brugTegel(b, i, k)` (de
  tegel van stap i in rij k), `T.brugRijen(b)`, `T.brugSchuin(b)` en `T.brugStap(b, x, y)` (hoe ver een punt langs de
  brug ligt, voor het wegdek), gebruikt door `legBruggen`, `js/tekenen.js`, `js/hoogte.js` en de toetsen.
  `E.bruggen` is { as, ga, gc (langs x en y: de eerste tegel water en de middelste rij) of gx, gy (schuin: de eerste
  tegel water van rij 0), L (stappen water), soort, stad, tegels }, en `E.brugOp` per tegel van het dek en de
  landhoofden { brug, i (-1 tot L), k (de rij) }. **De soort past bij de plek** (`brugSoort`; Marcel: "Wat bij de plek
  past"): steen binnen `wegen.brugStad` tegels van de stad (`stad`: baksteen) of het kasteel, bij rotsen en op de heide,
  en vanaf `wegen.brugSteen` tegels; hout in het woud, het veen en het broek; een houten brug tot `wegen.brugBoog`
  tegels is om de andere een boogbrug ('boog'), anders een jukbrug ('juk'). Het water onder een brug blijft water
  (`T.landStuk` legt er geen plankentegel meer en zet er niets op); `js/wereld.js` maakt de tegel vloer en een pad, en
  `js/tekenen.js` tekent de brug erover. **De roverskampen** (vraag 170, stap 6a2, c1, 17 okt; Marcel: "V2 G2 P1 B1"):
  `legKampen`, na de wegen en vóór de bruggen, legt er `kampen.aantal` (3) in het woud op het hoofdland, als plek in
  `E.plekken` (soort `kamp`, met `nr`, de hoogte van het vuur `h` en de plekken voor de tenten) en in `E.kampen`: minstens
  `vanPlek` van een andere plek, `onderling` van elkaar, `vanWeg` tot `totWeg` van een weg (over de vakken gemeten), droog,
  niet te hoog, vlak in de vakken ernaast en met woud eromheen. Het kiest met een eigen lot (`lot(x, y, E.zaad + 1703)`),
  niet met de dobbelsteen van de plekken, zodat de dorpsplekken, hun namen en de wegen blijven wat ze waren (een toets
  kijkt het na). **Het paadje** (P1): één Dijkstra over het hele eiland vanaf de vakken met een weg, met de kosten van
  een weg (`wegKosten`, ook voor `legWegen`), geeft elk vak het goedkoopste pad naar een weg; het paadje van een kamp volgt
  dat, eindigt op de weg zelf (`dichtsteLijn` geeft nu ook het punt op de lijn, `px` en `py`), en is een lijn in
  `E.paden` ({ punten, kamp }, met een eigen index `E.padIndex`, halve breedte `padBreed`). `legBruggen` legt ook over
  een paadje een brug, en `js/lopen.js` (de grove weg) houdt het open zoals een weg. In `T.eilandStuk` is een tegel van
  het paadje een weg, en op de open plek (`kampen.open`) staat geen boom (`kamp` per tegel, dat `T.landStuk` gebruikt:
  daar geen bos, geen losse boom en geen struiken); het plein (`kampen.plein`) is vertrapte grond en ligt vlak op de
  hoogte van het vuur (`kampBij`). Een kamp is geen uitgang van je land (`uitgangen` kijkt alleen naar `E.wegen`).
  **Het detail** (`T.eilandStuk(E, x0, y0, b, h, stap)`):
  per tegel de hoogte, de streek (`T.EILAND_STREKEN`: het water, strand en duinen, en de zes van de landkaart), de weg en
  de bomen, uit het nummer en de schets; een stuk is hetzelfde hoe je het ook vraagt, zodat het spel later het land maakt
  aan de rand van de mist. Alleen optellen, vermenigvuldigen, delen en wortels (een toets kijkt het na), zodat elke
  browser hetzelfde eiland maakt. Elk punt volgt alleen uit het nummer en de plek, dus het spel vraagt het in vaste
  blokken van 16 bij 16 (`T.eilandRaster`, de laatste 1.024 onthouden, en `T.eilandRasterVooruit` één blok per stap),
  die de delen van een stuk, de stukken ernaast en de hoogte van een stuk delen (18 okt; `snelheid.md`, F1: een deel
  rekende met zijn rand ruim negen punten per tegel); in `test/eilandkaart.test.cjs` op elk punt hetzelfde als in één keer. **Je dorp op het eiland** (stap 2a, Marcel: "Het eiland wordt gewoon altijd gegenereerd bij
  een nieuw spel"): elk nieuw spel maakt het eiland, en je land is het stuk ervan om jouw dorp:
  `T.landVanEiland(E, plek, b, h)` geeft de maker de streek per tegel en per hoekpunt, de bomen en waar de wegen het land
  verlaten, en `T.eilandVan(zaad)` onthoudt het laatste eiland. De maker (`js/maker.js`) legt het lege land erop; de kaart
  onthoudt waar hij ligt (`w.eiland`). (Tot ronde 2 van het snoeien, stap 6, legde hij er een dorp dat er al was, en
  zonder `opEiland` een land zonder eiland.) **Het eiland om je land** (stap 2b, tot B2b een rand om de kaart): sinds B2b
  (13 okt) is het eiland de kaart (`T.eilandKaart` in `js/wereld.js`, met het land uit `T.landStuk`), en is er geen rand
  meer. **De grond
  van het eiland** (B van 2a): de zee, het strand, het veen en het broek hebben eigen tegels (`tegels/kust.png`, uit
  `node gereedschap/pixelart/randtegels.cjs kust`; `T.sprites.grondMetHoeken` zoekt in rand en kust); welke twee soorten
  samen een tegel hebben, zegt `T.grondPaar`, wat niet past wijkt (`T.passendeGrond`), en een tegel met drie soorten
  wordt er een met twee (`T.grondTegelHoeken`); de zee is water (`T.isWaterGrond` in `js/wereld.js`). De plaat:
  `node gereedschap/pixelart/eiland-plaat.cjs [nummer] [--groot]` (in `gereedschap/pixelart/uit/eiland/`). De getallen in
  `T.EILAND_INSTELLINGEN`.

### js/maker.js: de maker

- `js/maker.js`: **de maker, elk spel een ander land** (vraag 69 en 70, 30 sep; 100 bij 100, vraag 112; sinds ronde 2 van
  het snoeien, stap 6, 12 okt, alleen het lege land: Marcel, "Alles wordt door spelers geplaatst"): op het eiland
  (`js/eiland.js`) komt het land, en sinds B2b (13 okt; Marcel: "Het eiland, overal") ook alles wat erop groeit en de
  wegen met hun bruggetjes (`T.landStuk`, hieronder); de maker legt er alleen het menselijke over: de open plek voor het
  plein (`leegRand`; binnen het plein wordt de weg gras), met **sinds 20 okt een overgang naar het bos** (werklijst Q,
  vraag 181, d; Marcel: "Vaak zit je nu vast in een dicht bos", en M2; `overgang`): tot `overgang.tot` tegels van het plein
  gaan steeds minder bomen en struiken van het eiland weg (`blijft`, zacht van `binnen` tot 1), in plekken uit een gladde
  ruis per zaad (`openHier`, met `hash`), en waar het `wei` opener is, wordt het bos wei; de rotsen blijven (`isRotsNaam`,
  voor de steengroeve). Gemeten op vijf eilanden: ring 3 tot 6 van 25-55% naar hooguit 4% te rooien, vanaf ring 11 het bos
  zoals het was; zo kwamen de toetsen van de wolven op eiland 7 (`test/beesten.test.cjs`, LAND). Verder de plek van het kamp op het plein (`kamp`: het vuur, een tent
  per gezin en de kar; js/begin.js zet het op), de plek van de marskramer en de heer, een paar eiken op het plein (niet aan
  de voorkant, `eikenTot`, want daar komt de markt), en een rotspartij met plaats voor de steengroeve. Hij keurt het zelf
  (`T.keurGehucht`: kom je overal, staat er niets op het plein dat er niet hoort) en probeert het anders tot het deugt.
  Op het eiland keurt `T.planOpEiland` ook de marktplek: rijen korter dan `marktRij` (3) deugen niet. Daarvoor maakt hij
  de kaart al (`wereldVanPlan`), en die krijgt `T.laadGemaaktGehucht` mee in plaats van hem opnieuw te maken.
  `T.maakGehucht(zaad, land, pogingen, ookKeuren)` legt het plan op een stuk van het eiland (`plan.voorwerpen` alles wat er staat,
  `plan.gelegd` wat hij erbij legde, `plan.gerooid` wat er van het eiland weg moest), `T.planOpEiland(zaad)` kiest het stuk
  (jouw plek, anders die van een ander dorp), en `T.laadGemaaktGehucht(zaad)` maakt er een kaart van het eiland van, die
  alleen het verschil met het eiland overneemt, met de plek van het dorp in `w.plekken` (zijn land, plein, kamp, marskramer, uitgang en marktplek: `T.zoekMarktPlek` in `js/markt.js`; `T.nieuwDorp` neemt hem als `D.plek`). Het leggen zelf (`legPlanOp`) legt een plan op een kaart die er al is: zo legt `T.legDorpOpKaart(w, { bij, niet })` een tweede dorp op de dichtste andere dorpsplek die minstens `anderDorp` (200) tegels weg ligt (`T.planOpEiland(zaad, { bij, niet })`), en groeit het vak van de kaart om beide (vraag 170, stap 6a).
  **Een level** (vraag 187, stap 2a, 24 okt): `T.planOpEiland(zaad, { naam })` legt het dorp op de dorpsplek met die naam
  (de namen komen uit `T.DORPSNAMEN`, geschud per eiland, dus ze verschillen per zaad; is hij er niet, of lukt het daar
  niet, dan gooit het), en `T.laadGemaaktGehucht(zaad, { plek })` geeft hem door. `T.randOm(vak, b, h)` legt de rand van
  het level: `b` bij `h` stukken om het land van het dorp, zo midden als het kan, met wat het begin opent erbinnen (het land
  met `zicht` tegels eromheen) en op het eiland; `T.randMinstens()` (nu 4) is wat het begin hooguit beslaat. Een tweede
  dorp (`T.legDorpOpKaart`, alleen in het debugvenster) let nog niet op de rand.
  Open zijn de stukken om het land, tot `zicht` tegels erbuiten. Welk land een
  nieuw spel krijgt, zegt `T.landVoorNieuwSpel` (`js/begin.js`; een nummer van vijf cijfers, in het menu bij Nieuw
  spel); `T.beginOpEiland(S, zaad)` legt het, met het lege begin erop. Het zaad van het dorp is hetzelfde
  nummer (`D.lot.zaad`), en `w.maker` zegt uit welk zaad de kaart komt. **Hetzelfde zaad,
  hetzelfde land**, maar sinds B2b een ander land dan ervoor: wat er groeit komt per tegel uit het eiland, niet meer uit
  de dobbelsteen van de maker (die trok tot B2b nog getallen die niets meer legden, om het land van een bewaard spel
  gelijk te houden; een bewaard spel past sinds B2b toch niet meer). `npm run maker` schetst het lege land
  (`gereedschap/maker/schets.cjs`). **Wat er ligt, doet ertoe:** een houthakker bij het bos, een steengroeve bij de rotsen, een visser en een
  rietsnijder aan het water (`bij` in `T.GEBOUWEN`, `T.natuurBij` in `js/gebouwen.js`); ligt die natuur nergens in het land
  van het dorp, dan staat het gebouw niet in het bouwmenu (`T.natuurInHetLand` in `vanDeTrede`; werklijst Q, vraag 181, c,
  sinds 20 okt). Wat plat op de
  grond ligt (niet vast, laag), tekent `js/tekenen.js` in de buffer van de grond (`isPlat`), en het maakt plaats voor
  een gebouw.
- **Het land van een stuk** (`T.landStuk(E, x0, y0, b, h)`, B2b stap 1, 13 okt; `kaarten.md`, "Het hele eiland"): de
  grond per hoekpunt, de grondtegel per tegel en wat er staat (de rotsen en de bomen van het eiland, losse bomen en
  groepjes struiken in de wei, het groen), alleen uit het nummer en de plek, met de regels van de maker. Elk lot komt uit
  de plek van zijn tegel (`lotOp`, met het nummer van het eiland erin), een losse boom en een groepje struiken per vak
  (`groei.losseBomen`, `groei.struikgroepjes`), en het wijken van de grond kijkt per ronde naar de vorige: zo is een stuk
  hetzelfde in welke volgorde je het maakt (`test/landstuk.test.cjs`: zestien kleine stukken zeggen wat één groot zegt).
  Het rekent `STUK_MARGE` (8) tegels om het stuk mee, uit wat een tegel nodig heeft: de grond wijkt tot vier hoekpunten
  ver en kijkt dan één verder naar het water, en een boom twee tegels buiten het stuk (het groen eronder) kijkt vier
  tegels ver naar een weg. In de praktijk was 2 al genoeg, maar dat is geluk. Een stuk van 64 bij 64 kost in Node zo'n
  40 ms, twee derde daarvan in `T.eilandStuk` (de ruis van het eiland). Nog niet in het spel: de stappen erna maken de
  kaart van zulke stukken.

### js/hoogte.js: de hoogte van het land

- `js/hoogte.js`: **de hoogte van het land** (vraag 121, stap 1, 7 okt; Marcel: "ik doel ook meer op heuvels in het
  landschap", "a ja 32", "Ik wil dat de akkers mee bollen met de heuvel", en "De heuvels moeten niet alleen kleine bultjes
  zijn ... Uiteindelijk wilde ik een map van 2500x2500", "Waar alles doorloopt"): elke hoek van een tegel heeft een hoogte
  in pixels, de glooiing van het hoekpunt plus het niveau van de tegel maal een trede van 32 (`w.hoogte.niveau`), of per
  hoek voor een helling (`w.hoogte.hellingen`); delen buren hun hoek, dan glooit het, anders staat er een wand
  (`T.wandenVan`, alleen aan de zuid- en oostkant, want die zie je). **De glooiing is een rekensom, geen lijst**
  (`glooiingOp`): drie lagen gladde ruis uit het nummer van het land (`groot`, `midden`, `klein` in
  `T.HOOGTE_INSTELLINGEN`, van dal tot top zo'n 300 à 400 pixels), overal te vragen, ook buiten de kaart, platter op de
  vlakte om elk dorp (`w.hoogte.vlaktes`; een dorp dat erbij komt, krijgt de zijne met `T.legDorpVlakte`, vraag 174,
  stap b2), en vlak op de vlakke stukken (`w.hoogte.vlakken`: een huis met zijn looppad, het plein, het water),
  dus een bewaard spel onthoudt alleen het nummer en die stukken, en het landschap loopt door als het land groter wordt.
  Voor het tekenen staan de hoeken **per stuk** van `T.STUK` (64) in een lijst, zoals het land (vraag 174, stap a, 17
  okt): eens uitgerekend als iemand voor het eerst naar een tegel van dat stuk vraagt, waar op het eiland ook (één
  `T.eilandStuk` van zo'n 20 ms voor de hoogte van het eiland op zijn hoekpunten, dan de glooiing eens per hoekpunt met
  alleen de vlakke stukken die erbij liggen, `vlakkenBij`); wat afdekt (`T.dektAf`) ook per stuk, pas als het gevraagd
  wordt, met een lijstje erbij, zodat `T.dekkersIn(w, x0, y0, x1, y1, doe)` alleen die tegels geeft (vraag 174, c:
  `heuvelsErvoor` vroeg elke tegel in beeld, ver uitgezoomd 4 ms per beeld). **Wat de heuvels bij het tekenen kosten**
  (vraag 174, c, 17 okt; om en om gemeten met de echte videokaart, proefdorp op eiland 5, 1920×1080): eerst ver
  uitgezoomd zo'n 40 ms per beeld tegen 30 nu, door drie dingen: de tegels die afdekken over het kladdoek (nu
  `tekenUitgeknipt`, `code.md` bij `js/gl.js`), `heuvelsErvoor` (nu `T.dekkersIn`, en van de tekenlijst alleen de
  tegels achter een dekker) en `T.hoogteOp`, die voor alles wat getekend wordt via `T.hoekHoogten` vier keer het stuk
  zocht en een lijstje maakte (ver uitgezoomd 8000 keer per beeld). Wat met heuvels blijft, 2 à 5 ms boven vlak (dichtbij
  9 tegen 5), is vooral meer in beeld (wat hoog ligt, komt van onder het beeld erin) en het graan op een helling
  (`tekenGraan`, in stroken; `opmerkingen.md`). `T.egaliseer` rekent alleen opnieuw wat het nieuwe vlakke stuk raakt; een andere nieuwe `w.hoogte.versie` begint
  alles opnieuw. **Voor het tekenen** (vraag 174, stap b1, 17 okt): `T.hoogteIn(w, x0, y0, x1, y1)` geeft de hoogste en
  laagste hoek van de stukken die een vak raakt (elk stuk onthoudt ze, `bereikVan`), zodat `js/tekenen.js`
  (`tegelsMetHoogte`) weet welke tegels in een stuk van het scherm vallen: het vak in beeld gaat zo ver omlaag als de
  grond daar hoog is (met een plat vak ontbraken onderaan 30 grassen en varens, en lagen er 200 boven het beeld; het kost
  bij het dorp zo'n 2 ms per beeld, 8,6 werd 10,8 ms, ver uitgezoomd niets te meten). En `T.hoogtePlekkenSinds(w,
  versie)` zegt waar `T.egaliseer` de glooiing veranderde (het vlakke stuk met `vrijRond` + 1 eromheen), zoals
  `T.kaartPlekkenSinds`: daar tekent de grond opnieuw, en het licht twee tegels verder; tot dan alleen de voet van het
  gebouw, en lag er een ring grond op de oude hoogte (in de browser: na een vlak stuk waren 4 tot 6 van de 9 stukken
  grond anders dan helemaal opnieuw getekend, nu geen). Tot 17 okt was het één lijst om het eerste land (48 tegels erbuiten), en vroeg daarbuiten elke hoek het
  eiland opnieuw: een scherm vol tegels 160 ms in plaats van 1 (nu 0,9 ms, overal). De uitkomst is bit voor bit dezelfde,
  op twee eilanden gemeten, ook na vier vlakke stukken. De vragen: `T.hoekHoogte`, `T.hoogteOp` (op een punt, op de driehoeken van de tegel), `T.isSchuin`,
  `T.naarSchermOp` en `T.naarWereldOp` (het scherm en de muis, met de hoogte, en op een brug van het eiland het wegdek,
  op de basis van de brug: `T.brugBasis` en `T.brugOpTil`, vraag 174, stap b3, met de vlakke stukken om de landhoofden die
  `droog` zijn, zodat het water op zijn peil blijft, `bruggenVan`;
  `T.dekOp`, zodat wie erop loopt meegaat en de muis op het dek de brug kiest; de grond zelf, ook onder een brug, ligt op
  `T.naarSchermGrond`, in `js/tekenen.js` `opMaaiveld`), `T.lichtOpHoekpunt` en
  `T.helderheidVanVlak` (lichter naar de zon). De maker legt hem met de spelregel "Hoogte" op "Heuvels" (`T.legHoogte`,
  vanuit `T.laadGemaaktGehucht`), met een richel met een rotswand en een helling bij de rotsen; op het eiland is het land
  dat van het eiland (`hg.eiland`: de grond, het water op zijn peil, de zee op 0; vraag 117, 2b). Standaard staat hij op
  "Vlak", en een kaart zonder `w.hoogte` tekent pixel voor pixel als vroeger. `js/tekenen.js` tekent alles op de grond met
  `opGrond` (de hoogte eraf), een grondtegel op het vlak van zijn hoeken (`tekenSchuineTegel`, `opTegelVlak`), het licht
  zacht verlopend uit een plaatje met een pixel per hoekpunt, per stuk van 64 (`lichtStukVan`, `tekenGrondMetLicht`; vraag
  174, stap b1: eerst één plaatje om de kaart, helemaal opnieuw bij elk gebouw, en daarbuiten geen licht), de wanden uit een
  textuur in code (`tekenWanden`, `wandTextuur`), het land om de kaart ook op de helling, en het graan dat meebuigt
  (`tekenGraan`, in smalle stroken en korte stukjes die elk de hoogte van de grond volgen, ver uitgezoomd grover); de grond
  met hoogte van achter naar voren. **Wat de hoogte doet** (stap 2, 8 okt; Marcel: "Akkoord"): niemand stapt door een wand
  (`T.kanStappen`; `T.zoekPad` en `T.bereik` krijgen de kaart mee, `wereld`, en de eilanden en de velden vragen het ook),
  wel over een helling; een gebouw niet op steile grond (`T.teSteil`, "te steil" in `T.waaromPastHetNiet`), en waar het komt, wordt de grond vlak (`T.egaliseer`, vanuit `zetGebouwVoorwerp` en het
  doorgroeien: een vlak stuk vooraan in `w.hoogte.vlakken`; in het lege begin egaliseren de bouwers het, vraag 182: dan
  ligt het stuk er eerst voor een deel, `v.deel` van 0 tot 1, dat in `glooiingVan` de grond eronder dat deel naar zijn
  hoogte schuift, en `T.zetEgaliseerDeel` zet het verder; `T.egaliseerVerschil` zegt hoeveel de grond moet zakken of
  rijzen); een heuvel houdt het zicht tegen (`T.heuvelTussen` in
  `T.zichtTussen`) en wie hoog staat, ziet verder (`T.verderVanBoven` in `T.zietTegel`); en een tegel die iets achter zich
  afdekt (`T.dektAf`), komt nog eens in de tekenlijst (`heuvelsErvoor` in `js/tekenen.js`). De proefplaat:
  `gereedschap/pixelart/hoogte-proef.cjs`.

### js/minikaart.js: de minikaart

- `js/minikaart.js` (werklijst vraag 165, 14 okt; Marcel: "Vergeet mn minimal niet", "Onder in de ui zoals bij age of
  Empires", "Het hele eiland"): **het hele eiland in het klein**, in de hoek rechtsonder van de balk, als een ruit die
  ligt zoals het beeld (tegel (0, 0) bovenaan, `T.minikaartPunt` en terug `T.minikaartTegel`). De regels zonder scherm
  (`test/minikaart.test.cjs`): het beeld, een pixel per vak van `stap` (8) tegels, uit `T.eilandStuk` met een stap, in
  de kleuren van `T.MINIKAART_INSTELLINGEN` (die ook `gereedschap/pixelart/eiland-plaat.cjs` gebruikt), het licht uit
  `T.helderheidVanVlak`, de wegen en de bomen (`T.minikaartKleur`); het wordt in stukjes gemaakt (`T.maakMinikaart(E,
  rijen)`, een rij zo'n 1 ms, het hele eiland 0,3 s), en hoort bij het eiland, niet bij het spel (niet bewaard). Wat je
  kent per vak, uit de bits van de mist van je eigen dorp (`T.minikaartGekend(S.dorp)`; `D.gekend`, `js/mist.js`). Het tekenen staat in
  `js/balk.js` (alleen scherm), zonder papier eromheen en wat doorschijnend (Marcel: "zonder 'rand' dus de kaart licht
  transparant"; `#minikaart` in `stijl.css`): zo'n 4 ms per beeld aan het beeld tot het af is, de mist opnieuw als `T.mistVersie`
  verandert, en tien keer per seconde de ruit: het eiland, levendig (`verzadiging`, `helderheid`; Marcel: "Ik bedoelde
  meer vibrant"), een donkere tint over wat je niet kent alleen waar het eiland is (`onbekend`, `nevel`, met
  `source-atop`: je ziet de vorm, niet wat er is), de plekken die je kent, je gebouwen, de aanvoerder in rood, en het kader
  van de camera (`T.tekenMaat` gedeeld door `S.zoom`). **Er blijft geen ruit over** (Marcel: "een echte gefeatherde rand
  ... dat je geen ruit meer overhoud"), **met een lijn van 1 pixel erom** ("Het gaat toch wat teveel op in het land"):
  als het beeld af is, rekent `vervaagDeZee` voor de zee de afstand tot het land (rond, in twee gangen met stappen van 1
  en √2, `afstandTotLand`); tot `zeeTotOmtrek` vakken ligt de zee (van heel naar `zeeBijOmtrek`), daar ligt de lijn
  (`m.binnen`, en in `js/balk.js` `omtrekVan`: de rand ervan op de maat van het doek, één keer per maat), en daarbuiten
  vervaagt hij in `zeeVervaagt` vakken, rafelig (`rafel`, `rafelVlek`); vlak bij de rand van het vierkant altijd. Een klik of slepen kijkt daar: `T.kijkNaar` (`js/main.js`) zet het overzicht
  (Tab) aan en de camera erheen.
- **Alleen de kaart** (vraag 187, stap 2a, 24 okt; Marcel: "Alleen de kaart"): wat de minikaart toont, is een veld
  (`T.minikaartVeld(w)`: `{ x, y, maat, stap, rand }`). Zonder rand het hele eiland met `stap` 8; met de rand van een level
  (`w.rand`) het vierkant om de rand, met de stap gehalveerd zolang het beeld niet groter wordt dan dat van het eiland
  (een rand van 4 bij 4: 256 tegels, stap 1). Het beeld hoort bij het eiland en het veld (`T.minikaartBeeld(E, veld)`);
  wat buiten de rand valt (bij een rand die niet vierkant is) is doorzichtig, de zee blijft zee (de kust is daar niet de
  rand van de kaart), en de lijn loopt om de rand (`zetDeRand` in plaats van `vervaagDeZee`). `T.minikaartGekend`,
  `T.minikaartPunt` en `T.minikaartTegel` nemen het veld mee; `js/balk.js` houdt het bij in `mini.veld` (getoetst in
  `test/rand.test.cjs`).

## Beeld en scherm

### js/iso.js: de projectie

- `js/iso.js`: de isometrische projectie (tegel 64×32) en tekenhulpen (`ruit`, `blok`).

### js/dialoog.js, js/ui.js, js/balk.js, js/tekenen.js, js/main.js: de vensters, de balk onderaan, het tekenen en de spellus

- `js/dialoog.js`, `js/ui.js` (alle html over het beeld; **één manier om een venster te openen en te sluiten**, vraag 146,
  b2: een venster meldt zich aan met `T.ui.meldVenster`, zijn open en sluit roepen `T.ui.openVenster` en `T.ui.sluitVenster`,
  en er is hooguit één open, `T.ui.vensterOpen()`; **elk venster is papier**: een nieuw venster komt in de
  rij onderaan `stijl.css`, en zijn opmaak gebruikt de kleurnamen `--inkt`, `--gedempt`, `--goud`, `--rand`, nooit een vaste
  kleur; **alle kaartjes bovenaan zijn even breed** (Marcel, 14 okt: "Kaartjes in de ui moeten wel even breed zijn. Anders
  wordt het een zooitje"): het doel en de statussen linksboven, de datum en het briefje van een gebouw rechtsboven nemen
  `--kaart` (`:root` in `stijl.css`), en een nieuw kaartje ook; het briefje bij de muis en bij een huis hangen los en
  tellen niet mee; de letters zijn Grenze, `--kop`, en Alegreya, `--boek`, in `letters/`), `js/balk.js` (**de balk
  onderaan**, vraag 164, 14 okt; Marcel: "De oude ui balk aan de onderkant moet leeg. En we hebben een minimale nodig":
  kaartjes in de hoeken, `.hoek-onder` in `stijl.css`. Linksonder de voorraad, `#voorraad`: elke waar waarvan er
  minstens één is, in `VOLGORDE`, met een pictogram uit `GRONDSTOF_ICOON` (een zak als er geen is) en het getal; een post
  blijft staan zolang zijn waar er is, zodat het briefje bij de muis klopt. In het midden Build (`#bouwmenu-knop`), en de
  brief en de bode zolang ze er zijn (`T.ui.werkBriefKnopBij`, `js/brieven.js`); rechtsonder de minikaart
  (`js/minikaart.js`). **Bovenaan een dunne balk**, `#bovenbalk` (vraag 166; Marcel: "Bovenaan een dunne ui balk met
  goud, aantal inwoners, happiness jaar en tijd", en "zo leeg mogelijk zonder info te missen"): links het dorp (de kas,
  de inwoners, de tevredenheid), in het midden de datum en het uur (`T.ui.toonKalender`, `js/hud.js`; het seizoen en het
  weer op het briefje bij de muis), rechts de lat van de snelheden, de twee bazen en Menu; wat eronder begint, rekent
  met `--boven`. De velden (V) en het wetboek
  (W) hebben alleen hun toets; tot 14 okt lag hier de tafel van de schout,
  vraag 146, c, met haar kunst uit `gereedschap/pixelart/tafel.cjs`, en git bewaart haar. Wat een ding of een getal is
  en zijn toets, staan op het briefje bij de muis, `#wenk`, niet op het ding: onderaan erboven, bovenaan eronder. Alles op
  ware pixels: één pixel van de kunst op een hele schermpixel, 1080 één, 4K twee, `pasSchaal`, in `--ui-zoom`; hoe hoog
  de hoeken onderaan zijn, zet een `ResizeObserver` in `--onder-links` en `--onder-rechts`, en wat erboven ligt (de
  berichten, de meter, het bouwmenu, het briefje van een gebouw) rekent daarmee; bovenaan liggen alleen briefjes, vraag
  146, d: het doel met de raad en de statussen linksboven, onder de balk, en het briefje bij de muis werkt daar ook),
  `js/tekenen.js`, `js/main.js`
  (spellus, invoer, zoom, camera). **De camera is los** (vraag 170, stap 1; `js/kiezen.js`): hij glijdt naar `S.kijk`
  (alleen scherm), en volgt de aanvoerder niet meer; de pijltjes en de muis tegen de rand van het venster schuiven hem
  (`schuifBij`, elk beeld, met `T.KIEZEN_INSTELLINGEN.camera`), de minikaart zet hem neer (`T.kijkNaar`), `T.glijNaar`
  laat hem naar een tegel glijden (Tab naar de held), het wiel zoomt altijd (`zoomStanden`), en `begrens` houdt hem boven
  `T.kaartGrens`. Alleen een gevecht in beurten kijkt zelf mee (`cameraDoel`), tot stap 2. **Kiezen** (stap 1b; de regels in
  `js/kiezen.js`): links kiest (`kiesWezen`, `kiesMannen`; `ev.detail` 2 is een dubbelklik), slepen trekt het kader
  (`kader`, de div `#kader`), rechts geeft `S.sturen` (`T.handelingSturen`), Tab kiest de held, en de groepen (stap 1d)
  staan in `S.groepen` (alleen scherm: elke speler zijn eigen). **Een bericht met een plek** (`T.zeg(D, tekst, soort,
  plek)`, en `aankomst.plek` bij `T.bezoekerKomtAan`): `T.ui.bericht` maakt het aanklikbaar (`T.glijNaar`), Spatie kijkt
  naar `S.berichtPlek`, en `T.ui.ping` (`js/balk.js`) laat de plek op de minikaart knipperen. Tot 15 okt volgde hij de
  aanvoerder, en tilde Tab hem eraf in het overzicht (vraag 108, a; `S.overzicht`, weg). **De fotomodus** (vraag 146,
  e): `H` (of Fotomodus in het menu) haalt alles van het beeld (`body.foto` in `stijl.css`, en wat ui is op het doek,
  `S.foto` in `js/tekenen.js`); de camera schuift ook met slepen, tot twee keer dichterbij; een klik doet niets,
  en `Enter` bewaart het beeld als PNG op de maat van het scherm (`bewaarFoto`; in de versie voor Windows in Afbeeldingen). Op een groot scherm tekent het spel op een hele deling ervan, minstens
  1920×1080 (de tussenbuffer, `formaat`, vraag 123): op 4K 1920×1080 maal twee; wat er getekend wordt, zegt `T.tekenMaat()`,
  en de muis rekent om in `naarVlak`. De grond ligt in stukken van 512 pixels die aan de wereld vastzitten
  (`werkStukkenBij` in `js/tekenen.js`, 9 okt): wat in beeld komt, wordt getekend, en slepen tekent alleen de stukken aan
  de rand; wie de grond wil (het kijkgat), vraagt `T.tekenGrondStukken`. Ver uitgezoomd liggen ze op de maat van het
  scherm. Moet alles in beeld opnieuw op hetzelfde land (een stap met het wiel, een ander seizoen, de sneeuw, de beek),
  dan **spreidt** hij (18 okt, Marcel: "de nieuwe stukken een of twee per beeld"; `snelheid.md`, "Spreiden"): het oude
  beeld (`buf.vorig`) blijft, geschaald, staan in de gaten waar nog geen nieuw stuk ligt (`buf.gaten`, `tekenVorig`,
  uitgeknipt, zodat de rand aan de kust niet dubbel komt), en per beeld komt er een nieuw stuk bij, en een tweede als het
  eerste minder dan 8 ms kostte (`SPREID`): eerst wat het oude beeld niet bedekt, dan van het midden naar buiten. Is het
  af, dan is het beeld pixel voor pixel dat van alles in één keer. Een schermafdruk, een foto en `Spel.debug.stap`
  tekenen alles in één keer (`T.tekenHeel`); `T.grondBezig(S)` zegt of het nog loopt. **De grond op de kaart** (de
  renderproef, 18 okt; `snelheid.md`; Marcel: "dit wordt de nieuwe standaard"): met de videokaart tekent die de grond
  zelf, en de buffer hierboven is er dan alleen nog zonder videokaart en als het op de kaart niet kan; per stuk land een vaste rij met een instantie per tegel (`tekenGrondOpDeKaart`, `bouwGrondStuk`; in `js/gl.js`
  `VERT_GROND`, `Doek.tekenGrond`), stuk na stuk op volgorde van hun nummer, en wat erop ligt in dezelfde volgorde als
  in de oude grond (`tekenGrondIn`): de sneeuw van een tegel meteen na zijn vloer, dan de droge beek (één rij,
  `bouwBeek`), dan het platte groen (per stuk een tweede rij, `bouwPlat`), want wat over de rand van een stuk steekt,
  mag de vloer van het volgende niet bedekken. De sneeuw rekent de kaart zelf: de processor geeft per tegel de ruis mee
  (`sneeuwVanTegel`, want `beeldLot` rekent in 64 bits), de kaart dezelfde som als `sneeuwDek`, en de zestien tegels
  sneeuw staan op de stapel; een andere stand sneeuw maakt zo niets opnieuw. Wat erop ligt, komt van de stapel (een
  plaatje als doek met versie 1, `losBeeld`, zoals de bomen; de beek in vlakjes van één kleur, `kleurVlak`). Met heuvels
  (stap 4) van achter naar voor (`tegelVolgorde`), elke tegel met de hoogte van zijn vier hoeken: de kaart legt hem op
  zijn vlak zoals `opTegelVlak` (`SCHUIN_GROTER`), met het licht van zijn stuk erin (`maakLichtStuk` als textuur die
  zacht gelezen wordt, `zachteTextuur` in `js/gl.js`; Marcel koos A: geen naadje), dan zijn wanden (een instantie per
  wand, `zetWanden`, `wandMaten`, de textuur op de stapel), dan zijn sneeuw. Wat afdekt (`T.dekkersIn`), schrijft in
  een eigen ronde alleen zijn diepte (`e.dek`: de ruit en de wanden, met de sleutel van `heuvelsErvoor`), en de bomen
  en de lijst toetsen daartegen, dus `heuvelsErvoor` zet dan alleen nog de kijkgaten in de lijst (`dekt`). Het
  kijkgat (`T.tekenKijkgat`) vraagt de grond dan aan de kaart (`T.grondInHetGat`, `Doek.tekenGrondGat`: de grond van
  het beeld nog eens, zacht in de cirkel, met het filter van wat het kijkgat tekent). De keuze van de tekening per tegel
  is één functie voor beide (`hoekenVanGrond`), de sneeuw ook (`sneeuwVanTegel`), de beek (`beekStukjes`), de paadjes
  onder het groen (`opPaadjeVan`) en de wanden (`wandMaten`) ook. Het tekenen knipt af op `T.kaartGrens` (op het eiland het hele eiland: wat niet open is, is 'buiten' en blijft
  donker; **de mist**, B2c: na de grond en de schaduwen één masker met een pixel per tegel, schuin over de grond, hoeveel
  kleur eruit gaat en hoeveel donkerder (`tekenMist`; met de videokaart maakt de kaart het masker zelf, `mistOpDeKaart`:
  wat je kent als getallen, alleen als het anders is, en per beeld wie er kijkt, sinds 18 okt, vraag 178; zonder
  videokaart een doek met een verloop per kijker, één laag, grijzer en donkerder, op een klein doek en dan opgeschaald,
  `MIST_KLEIN`, want twee schuine lagen over het scherm kostten daar 50 ms), en
  wat erop staat naar zijn tegel (`mistOverLijst`: in het zwart niets, in het grijs grijs en zonder wie er loopt, in
  `grijzeItems`, en `tekenItem` tekent een item met of zonder grijs; een voorwerp is één item met de gedeelde
  `tekenVoorwerpItem` en zichzelf als `punt`, geen functietje per voorwerp per beeld; zet geen eigenschap op een item
  nadat het gemaakt is, want dan krijgen de items zoveel vormen dat het sorteren in Chromium twee keer zo traag werd, 17
  okt; zonder videokaart een grijze kopie van het stukje, `grijsStuk`, want een filter bewerkt daar het hele vel;
  `Spel.debug.geenMist`), en zoekt wat er staat met `T.voorwerpenIn` (ook wat er op het eiland groeit; met de
  videokaart zonder de vaste rijen, hieronder); tot B2b stond er een bosrand om
  de kaart, ver uitgezoomd in een eigen buffer (`bosGebakken`). **Alleen wat telt in de lijst** (vraag 178, A1, 17 okt):
  het vak is een rechthoek in tegels om het schuine beeld, en ver uitgezoomd lagen er 14.564 dingen in, waarvan 4.815
  buiten beeld en 6.710 in het zwart; `voorwerpTelt` laat die vóór het werk voor de lijst weg (in het zwart, zoals
  `mistOverLijst`; buiten beeld op de cel van zijn tekening met zijn schaduw, `T.sprites.celVan`, niet op de krappere
  doos van de doorkijk), en wat nog half doorkijkbaar is, blijft in de doorkijk tot hij dicht is. In beeld worden precies
  dezelfde plaatjes getekend als ervoor; alleen waar een boom buiten de schuine rijen van een gebouw over zijn dak valt,
  kan de volgorde anders zijn (`tekenVolgorde` voegt een gebouw in tussen wat er op zijn rijen staat, en dat was ook
  eerst al wat er toevallig in het vak lag). **Het vaste werk eens** (A2): `isPlat` en de plek op het scherm (`plekVan`,
  met de hoogte, opnieuw na `T.egaliseer`) staan op het voorwerp (`T.sprites.onthouden`, in `v.getekend`). Samen ver
  uitgezoomd 35 à 47% minder per beeld (`ontwerp/snelheid.md`). **De bomen en het groen in vaste rijen** (vraag 178, B1
  en B2, 18 okt; Marcel: "dan bouwen we nu b1 en b2", en "Misschien zoveel mogelijk offloaden naar gpu"): met de
  videokaart staat wat op een stuk van het eiland groeit één keer op de kaart, per stuk een rij (`vasteRijenVoor`,
  `bouwStuk`; `js/gl.js`, `tekenVast`), en gaat het niet meer door de lijst. Ver uitgezoomd was dat 80% van de tijd van
  de processor. Per beeld zet de processor alleen de stand per fase in de wind (97 getallen, zoals `windVoorInstantie`),
  de mist per tegel (`vasteMist`: 0 tekent niet, 128 grijs, 255 helder, zoals `voorwerpTelt` en `mistOverLijst` het per
  ding beslisten) en per stuk waar het ligt; de rest doet de kaart. **De volgorde komt uit een dieptebuffer** (B1): de
  kunst heeft alleen helemaal dichte of doorzichtige pixels, dus een boom schrijft per pixel zijn diepte, de sleutel van
  het sorteren (`diepteVanItem`: de som x + y, en bij een gelijke som de volgorde van `T.voorwerpenIn`, het stuk en de
  rij, minder dan `DIEPTE_STUK`). Wat in de lijst blijft (de mensen, de gebouwen, de akkers, wat iemand zette), sorteert
  zoals altijd, krijgt die sleutel mee (`ctx.diepte`; op dezelfde som komt wat `tekenVolgorde` eerder zette `DIEPTE_STAP`
  ervoor, de rest erna, en wie loopt tussen twee sommen in) en toetst ertegen, zonder hem te schrijven. **In de lijst
  blijft** een boom die een gebouw kan raken (`gebouwVak`, want `tekenVolgorde` zoekt de plek van een gebouw tussen wat
  ermee overlapt, en dat is geen getal), een tekening die niet op de stapel past, en wie nu doorzichtig is: de doorkijk
  van de bomen in de rijen loopt vooraf (`bomenBij` zoekt ze om wie je hoort te zien, `T.doorkijkKandidaten` in
  `js/doorkijk.js`), en wie open is, valt uit zijn rij (0 in de mist per tegel) en gaat op zijn plek in de lijst.
  `heuvelsErvoor` vraagt de rijen ook (`staatOp`). Een stuk gaat opnieuw als er op de kaart iets veranderde
  (`T.kaartPlekkenSinds`), een gebouw erbij kwam of verschoof, of het seizoen of de hoogte anders is; als er
  alleen een beeld bij kwam (`T.sprites.geladenNr`), één stuk per beeld. Zonder videokaart blijft alles in de lijst.
  **De meter** (`F2`): beelden per seconde, en wat de regels en het tekenen per beeld kosten.

### js/gl.js: tekenen met de videokaart

- **Zonder videokaart speelt niemand** (Marcel, 17 okt: "We gaan er vanuit dat software rendering, dus compleet zonder
  GFX kaart, eigenlijk niet voor gaat komen. Iedere laptop of apparaat, handheld etc. heeft een APU of GPU"): de weg
  zonder WebGL (het 2D-doek) moet kloppen, maar hoeft niet snel te zijn; meten en sneller maken doen we met de kaart.
  Wat het tekenen sneller maakte (A1 en A2, B5, B1 en B2, de regen en de mist op de kaart) en wat nog kan, met waar de
  tijd nu zit: `ontwerp/snelheid.md` (vraag 178).
- `js/gl.js`: **tekenen met de videokaart** (vraag 123): een eigen kleine laag op WebGL2 die zich voordoet als het
  2D-doek, zodat `js/tekenen.js` er hetzelfde op tekent. Plaatjes, vlakken, bolle vormen en ronde verlopen tekent de kaart
  zelf; de rest gaat via een kladdoek in 2D en komt als plaatje op zijn plek (`T.gl.telling` zegt hoeveel). Hoe lang de
  kaart zelf over een beeld doet, meet hij met de tijdmeter van de kaart (`G.meetKaart`, `G.kaartTijden`, van `G.begin` tot
  het eind van `G.klaar`; EXT_disjoint_timer_query_webgl2), alleen voor de meter (18 okt): de tijd in de processor ziet
  dat niet. Een buffer
  die opnieuw getekend wordt, krijgt een nieuwe `versie` (`nieuweBuffer`), anders gaat hij niet opnieuw naar de kaart.
  **Sinds 18 okt WebGL2** (vraag 178, B5 met B3 en E1, na de renderproef, `gereedschap/pixiproef/evaluatie.md`; zonder
  WebGL2 het 2D-doek, zoals zonder kaart): **een plaatje is één instantie** (`zetInst`, `VERT_INST`, `PER_INST` = 21:
  de vier hoeken, de plek op de textuur, een kleur, de plaats van de textuur, een vlag, de verhouding voor de schaduw,
  het grijs en sinds B1 de diepte), en ook een vlak en een driehoek van een vorm, zodat ze in dezelfde rij passen; alleen een plaatje binnen
  vierhoeken (`tekenUitgeknipt`) gaat nog als hoeken (`hoekH`, `VERT_BEELD`). De hoeken rekent JavaScript uit, niet de
  shader: anders rondt het net anders af. **Wat klein is en niet meer verandert** (een plaatje, een doek met versie 1),
  staat op de lagen van één textuurstapel (`TEXTURE_2D_ARRAY` van 2048 bij 2048, de bladen, `plekOpBlad`; tot 18 okt
  losse texturen van 4096, elk meteen 64 MB): wat erop staat, kost geen plaats in de rij; de stapel begint met vier lagen
  en groeit (`stapelVoor`, de kaart kopieert de lagen zelf). **Een beeld gaat pas in `G.klaar` naar de kaart**: elke rij
  is een opdracht in een lijst (`legRijAf`, `doe` voor wat zelf tekent: een verloop, de mist, het licht), de hoeken en de
  plaatjes van het hele beeld gaan in één keer, en elke rij tekent vanaf zijn eigen begin in die buffer (`hoekBron`,
  `instBron`). Een doek dat in één beeld vaker anders getekend wordt (het kijkgat), krijgt daarom per keer een nieuwe
  textuur (`opruimen`). Een textuur staat op de bron zelf (`bron.opDeKaart`), niet in een WeakMap (E1), en `drawImage`
  maakt geen lijstje per aanroep. Gemeten om en om (`npm run tekenmeting -- --tegen HEAD --videokaart`; 18 okt, vlak):
  de processor ver uitgezoomd overdag een kwart minder (11,0 naar 8,3 ms op 35%), 's avonds gelijk, met heuvels 0,67 à
  0,92 keer; met op de kaart wachten (een pixel teruggelezen elk beeld) 's avonds 5% meer, omdat de kaart pas in
  `G.klaar` begint (de spellus wacht niet). Het beeld is gelijk, op 100% en 35% op 0,007% na; op precies 50% valt elke
  pixel op de grens van twee texels, en daar kiest de textuurstapel op 0,3% van de pixels de buurtexel (de oude weg net
  zo goed willekeurig, en per videokaart anders; E4, afronden op 50%, maakt het vast). **Vaste rijen en een
  dieptebuffer** (vraag 178, B1 en B2, 18 okt; `js/tekenen.js`, "de vaste rijen"): een vaste rij is een lijst bomen van
  een stuk land, één keer op de kaart (`G.vasteRij`, acht getallen per boom: zijn anker vanaf het stuk, zijn tegel, zijn
  tekening en zijn fase in de wind, met een eigen lijst van attributen), met de tabel van de tekeningen (`G.vasteTabel`:
  per stand in de wind de plek op de stapel en het anker, een textuur van getallen) en hun plaatjes op de stapel
  (`G.opDeStapel`). `Doek.tekenVast` zet ze in de lijst van het beeld (soort `VAST`), en `VERT_VAST` kiest per boom zijn
  stand (`uWind`), of hij getekend wordt en grijs is (de mist per tegel, `uStand`), zijn schaduw (`uZon`, op het masker
  in `maskerRonde`) en zijn diepte. Op het doek schrijven ze hun diepte (`uHard`: een pixel is dicht of er is niets);
  wat daarna komt met `Doek.diepte`, toetst ertegen zonder te schrijven (`zetDiep`; een rij breekt als dat anders
  wordt, en het kladdoek gaat eerst af). Het doek van WebGL heeft daarvoor een dieptebuffer (`depth: true`, 24 bits),
  die `G.klaar` met de kleur leeg maakt. De stapel groeit sinds B2 met vier lagen tegelijk in plaats van twee keer zo
  groot: alle standen van alle bomen staan er meteen op (ver uitgezoomd 9 bladen, door alle seizoenen heen 14), en dat
  werden 16 lagen, 256 MB (`G.stapel` zegt hoe vol hij is). Gemeten om en om (18 okt, 5 rondes, vlak): de processor ver
  uitgezoomd een derde van wat het was (6,8 naar 2,1 ms op 35% overdag, 6,2 naar 1,7 's avonds, 4,6 naar 1,6 op 50%),
  met de kaart erbij de helft (9,5 naar 5,1 ms); met heuvels 7,6 naar 2,8, en na twee speeldagen 6,6 naar 1,9. Het
  beeld is gelijk, ook met de doorkijk, gekapte bomen, een huis tussen de bomen, de seizoenen, de nacht, op 200% en na
  twee speeldagen; alleen waar een pixel op de grens van twee texels valt (op precies 50%, en op 75%), kiest de kaart
  op 0,3 à 0,5% van de pixels de buurtexel, want de shader rekent de hoeken net anders af dan JavaScript (E4 maakt het
  vast). Een opdracht (de rij,
  `plekVoor`) tekent uit tot `RIJ_TEXTUREN` (8) losse texturen tegelijk naast de stapel: elk plaatje zegt waar zijn
  textuur staat (`bron`; onder nul een laag van de stapel), en de rij breekt pas bij een negende textuur, een andere
  mengstand of de wissel tussen hoeken en plaatjes. Een vorm als hoeken staat met vier hoeken in de rij, en een vaste lijst
  nummers op de kaart (`maakIndex`, `drawElements`) maakt er twee driehoeken van, met `MAX_HOEKEN` (65536, nummers van 16
  bits) hooguit in één opdracht. Tot 17 okt brak elke andere textuur de rij, en een plaatje komt op het blad waar plaats is als het
  voor het eerst in beeld komt: in de lente (een naaldboom houdt zijn zomervel) en met elke nieuwe stand in de wind
  stonden de bomen na een paar speeldagen op twee bladen door elkaar, en werden het 800 opdrachten per beeld in plaats
  van 60, wat in Firefox per aanroep meer kost dan in Chrome (Marcel, 17 okt: "performance is belangrijk spelelement.
  het wordt anders snel vervelend"). Meet een verandering aan het tekenen dus ook na een paar speeldagen
  (`ontwerp/gereedschap.md`), en meet niet terwijl er toetsen of een render lopen: die nemen de processor in beslag.
  Wat het kladdoek nodig heeft (`fillStyle`, `filter`), krijgt het pas in `opKlad`: de mist zet het filter om elk
  plaatje in het grijs heen en terug, en Firefox leest de tekst van een filter op een 2D-doek elke keer opnieuw; dat was
  29% van het tekenen (17 okt, een profiel van Marcel uit de Firefox Profiler; `filterVan` onthoudt per tekst wat de
  kaart ervan kent). En `G.begin` wist het kladdoek alleen als er sinds de vorige keer op getekend werd
  (`kladBeschreven`): ver uitgezoomd is dat meestal niet zo, en een doek zo groot als het scherm wissen kost.
  `T.tekenBeeld()` (`js/main.js`) tekent het scherm met of zonder, naar de spelregel "Tekenen"; zonder echte videokaart
  vanzelf zonder (`ookOpDeProcessor` zet het voor de proeven hier toch aan, ook nadat het spel geladen is). Het gewone
  doek ligt erboven en vangt de muis. **Het licht** (vraag 125, A): de nacht is met de videokaart een lichtkaart op de
  halve maat (de kleur van het uur, `T.lichtKleurVan` in `js/dag.js`, en per lamp een warme plas die flakkert,
  `lichtenInBeeld` en `T.LICHT_INSTELLINGEN` in `js/tekenen.js`), waarmee de wereld vermenigvuldigd wordt
  (`tekenLichtkaart`); zonder videokaart blijft het de donkere laag van hiervoor. **De schaduwen** (vraag 125, B): wat in
  de tekenlijst staat, als silhouet scheef over de grond (`tekenZonneschaduw`, `T.zonStand` in `js/dag.js`), op een
  masker dat in één keer over de grond gaat; de spelregel "Schaduwen". Sinds 18 okt (B3) uit de plaatjes van de lijst
  zelf: `schaduwHier` zet waar het masker komt, en `js/tekenen.js` zet per item `werptSchaduw` (aan, tenzij
  `zonderSchaduw`; uit voor het kijkgat); `G.klaar` tekent eerst het masker uit de rijen met zo'n plaatje
  (`maskerRonde`, `VERT_INST` met `uZon`). Tot dan tekende `js/tekenen.js` de hele lijst een tweede keer, tussen
  `beginSchaduw` en `eindSchaduw`.
  **De mist** (B2c, `js/mist.js`): elk hoekpunt heeft een vijfde getal, hoeveel kleur eruit gaat (`aGrijs`; het filter
  `grayscale(..) brightness(..)` zet het, `grijsNu`), zodat wat in het grijs staat zonder extra opdrachten grijs wordt; en
  `tekenMist` kopieert wat er tot dan getekend is (de grond en de schaduwen) naar een textuur en legt het ontkleurd en
  donkerder terug naar het masker (`FRAG_MIST`), want ontkleuren kan geen mengstand. Het masker maakt de kaart sinds 18
  okt zelf (`maakMistWerk`, `FRAG_MISTWERK`; vraag 178, Marcel: "Regen en mist doen maar"): wat je kent per tegel
  (rood en groen, alleen opnieuw als `js/tekenen.js` een nieuwe versie geeft), en per beeld de kijkers als een rij
  getallen, waar de shader een zachte kring om wegneemt. Tot dan tekende `js/tekenen.js` elk beeld een 2D-doek met een
  verloop per kijker, dat daarna naar de kaart ging (ver uitgezoomd 0,25 ms per beeld). **Veel vlakjes in één kleur**
  (`vlakjes`, de regen): zoals fillRect, maar zonder het werk per aanroep. **Een plaatje binnen vierhoeken**
  (`tekenUitgeknipt`, vraag 174, c): de grond van een tegel op een heuvel die iets afdekt (`tekenTegelOpnieuw` in
  `js/tekenen.js`) tekende met een knip, en een knip gaat over het kladdoek: ver uitgezoomd zeven kladjes en 3,5 miljoen
  pixels per beeld, die de kaart elke keer opnieuw kreeg. Nu elke vierhoek in twee driehoeken (`driehoekenVan`, langs de
  diagonaal die bij een holle vierhoek klopt), geknipt op het plaatje (`knipOpVak`, Sutherland-Hodgman), als waaier in
  de rij, met de plek in de textuur per hoek; zonder de kaart toch het kladdoek met een knip. Het sluit aan op de grond
  eronder op 0,7% van de pixels na, op de grens van twee texels (de knip in 2D week 23% af, een halve pixel).

### js/sprites.js en js/kaart.js: de pixel art in het spel

- `js/sprites.js`: de pixel art uit `beelden/`. `T.sprites.figuur` en `T.sprites.buiten` wijzen
  een cel op een vel aan (tot 23 okt ook `tegel`, `muur` en `voorwerp`, de vloeren, muren en spullen van de proefkamers;
  die vellen laden niet meer), `T.sprites.houding(S, wezen)` kiest houding, richting en fase uit de
  spelstaat zelf (pad, uitval, flits, dood); een uitval speelt eenmalig `slaan` of `aanval`, en heeft de figuur ook een
  `aanval2`, dan om en om de eerste en de tweede (een teller `uithalen` in zijn beeldstand, alleen scherm; de speerman uit
  het 3D-model, vraag 190: de steek en de stoot van boven), en
  `T.sprites.teken` legt het anker van de cel op het midden van de tegel. **Elke boom anders** (vraag 148, a): een soort
  heeft op het vel meer tekeningen met zijn naam en een `vorm` (`BOOM_VORMEN` in `naar-tiled.cjs`), en welke een boom
  krijgt, zegt zijn tegel (`T.sprites.tekeningVan(v)`, een vaste hasj; `v.id` blijft de eerste, dus een bewaard spel past).
  Wat een voorwerp tekent, vraagt het daaraan (`{ vel, id }`, of `T.sprites.buitenVan(v, wind)`), niet aan `v.id`. Elk
  voorwerp onthoudt dat op zichzelf (`v.getekend`, `onthoudVoorwerp`; alleen scherm, in `SCHERM_SLEUTELS` van
  `js/opslaan.js`): zijn tekening (ook die van de zomer), het gewicht van de wind erop, het stuk stil en per stand, en
  de doos van zijn beeld (`T.sprites.doosVan`, voor de doorkijk); opnieuw als zijn `vel`, `id` of plek, het seizoen of
  het aantal geladen beelden (`geladenNr`, ook `T.sprites.geladenNr()`: dan maakt `js/tekenen.js` een vaste rij
  opnieuw; `T.sprites.windStand` is de stand bij een windwaarde) anders is. Elk beeld opnieuw opzoeken was in Firefox 9%
  van het tekenen, en
  een WeakMap opzoeken kostte daar zelf nog bijna een ms per beeld (17 okt). **De
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
  te raken. **De bruggen van het eiland** (vraag 170, stap 6a2; Marcel, 17 okt: "Goed zo, zet ze in het spel";
  `bruggen-vel.cjs`): het vel `beelden/bruggen.png` heeft een brug in stukken van één tegel in twee lagen (0 achter wie
  erop loopt, 1 ervóór), geknipt uit een paar hele bruggen (monsters); `T.sprites.brugMonster(soort, L, i)` zegt welk
  monster en welke tegel daarin op tegel i van een brug van L hoort (een stenen brug uit eenheden van één boog, de naad
  midden op een pijler, schuin een boog per stap uit L1 of L3; een jukbrug uit L3; een boogbrug heel), `T.sprites.brugStuk(brug, steen, i, k, laag)` geeft het
  stuk (het vel laadt pas als er een brug in beeld komt), en `T.sprites.brugDek(brug, a)` hoe hoog het wegdek ligt, met de
  maten uit de beschrijving. Drie lagen per tegel: het dek (laag 0: het wegdek, de zijkant, de bogen), wat ervóór boven
  het wegdek uitsteekt (1) en wat erachter (2). `js/tekenen.js` legt het dek als de grond van wie erop staat: op som
  x + y min zijn hoogte gedeeld door 16 (een pixel hoger ligt een zestiende som verder naar achter), zodat een ossenkar die
  over twee tegels reikt er niet in zakt (Marcel, 17 okt: "de ossenkar lijkt nog in de brug te zakken"); de overkant op
  l 1 en de kant van de kijker op l 2,5, zoals het graan. De steen is die van het land (`steenVanLand`: zandsteen bij oker
  en roze) of baksteen bij de stad. De grond van het eiland leest een tegelnummer per vel (`T.grondVanGid`, `js/kaart.js`),
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
- **De lantaarn in de hand** (vraag 171, D2): `T.sprites.lantaarn(vlam, scheef, laag)` geeft een cel van
  `beelden/lantaarn.png` (`naar-spel.cjs --alleen lantaarn`, uit `gereedschap/pixelart/lantaarn.cjs`): een rij per stand
  van het schommelen (-1, 0, 1), een kolom per beeld van de vlam, en twee lagen, 'heel' en 'gloed' (alleen het hoorn en de
  vlam). `T.sprites.handVan(e)` zegt waar de hand zit in het beeld dat het wezen het laatst kreeg
  (`e.beeldStand.laatste`): `[dx, dy, scheef]` uit `beelden/handen.js` (`T.HANDEN`, van `lantaarn.cjs --handen`: elke set
  handen één keer, en per vel het nummer van zijn set, want de kleren en de meeste uiterlijken veranderen de hand niet).
  Een nieuw lijf of uiterlijk: draai `--handen` opnieuw (`test/lantaarn.test.cjs` kijkt of elk vel van een drager handen
  heeft). Getekend in `js/tekenen.js` (`tekenLantaarn`, in `tekenWezen` na het figuur): het hoorn gloeit zoals de ramen,
  met een gat in het doek dat na de nacht wordt gevuld (`vulLantaarns`); in een kijkgat komt het gat erna
  (`T.ponsLantaarns`, `js/doorkijk.js`).

### js/doorkijk.js: de doorkijk

- `js/doorkijk.js`: wie je door een boom of een huis heen ziet (`T.zichtbaarDoor`,
  `T.werkDoorkijkBij`), en hoe: het kijkvenster (`T.tekenKijkgat`) of het raster (`T.tekenGerasterd`),
  een keuze in de spelregels (`beeld.md`, "Doorkijk"). `js/tekenen.js` vraagt het aan: één kijkgat per wezen, na
  het voorste voorwerp in de volgorde van tekenen dat hem bedekt (`T.voorsteKijkgaten`, 13 okt). Het eerste stuk
  dat uit `tekenen.js` ging (vraag 25, D, 26 sep). Elk beeld kijkt `T.werkDoorkijkBij` voor alles in beeld of het iemand
  bedekt; eerst alleen opzij (`voorwerpDoos`: de doos uit `T.sprites.doosVan`, en de plek opzij hangt niet af van de
  hoogte van het land), en pas als dat kan de plek met de hoogte erbij. Ver uitgezoomd rekende het tot 17 okt elk beeld
  de doos van alles in beeld uit. Met de vaste rijen (vraag 178, B2) loopt de doorkijk van hun bomen vooraf, alleen om
  wie je hoort te zien (`T.doorkijkKandidaten`, dezelfde kandidaten voor beide keren).

### js/tekenen.js en js/sprites.js: de gebouwen plat

- **De gebouwen plat** (vraag 176, 4b, 24 okt; `beeld.md`, "Zicht in een dicht dorp"): F (`js/main.js`) zet
  `S.gebouwenPlat`, een veld van het scherm (`T.schermVelden`: de wereld en het bewaren merken er niets van), en
  `T.ui.toonPlat` het teken (`#plat-teken`, de klasse `gebouwen-plat` op de body). `tekenVoorwerp` (`js/tekenen.js`) neemt
  dan voor een huis van de huizenbouwer `T.sprites.platVan(v)`: de platte tekening van zijn jonge tekening
  (`tegels/plat.js`, `T.PLAT`, uit `gereedschap/pixelart/plat.cjs`), onthouden op het huis (`v.getekend.platHuis`, zoals
  `S.buitenVan`), met het anker van het huis. Plat geen doorkijk, geen daksneeuw en geen kijkgat; `brandendeRamen` en de
  rook uit de schoorsteen slaan over; een bouwplaats neemt fase 0 van zijn bouwfasen; wat brandt, tekent zijn
  brandfase. `gebouwenPlat(S)` is uit in een scène (`S.modus === 'scene'`). Let op de naam: `isPlat` en `platVan` in
  `js/tekenen.js` gaan over wat plat op de grond ligt (de grondbuffer), niet over deze weergave.

### js/bouwstijl.js: de bouwstijl van een land

- `js/bouwstijl.js`: **de bouwstijl van een land** (vraag 114, stap 2, 4 okt): elk land van de maker bouwt in één stijl
  (`w.stijl`, uit het nummer van het land, `T.stijlVoorLand`; het ontworpen gehucht heeft er geen en bouwt zoals altijd),
  met per soort een paar vormen, elk met de deur naar elke kant. De huizenbouwer noemt dat een stand; in het spel heet het
  de kant van de deur (`T.deurKantVan`, `T.metDeurNaar`), want een stand is in het spel die van de mensen (`T.STANDEN`,
  `T.standVan` in `js/treden.js`). Een nieuw huis krijgt het dak van de trede (dat van het gehucht, leien in een dorp,
  pannen met marktrecht), en een stenen huis baksteen pas met een steenbakkerij (`T.stijlTekeningen`, via
  `T.tekeningenVan` en `T.volgendeTekening` in `js/gebouwen.js`); wie doorgroeit, houdt zijn kant en krijgt het dak van nu
  (`T.zoalsNu`, `kiesGroei` in `js/behoeften.js`). Een tekening kan voor meer soorten zijn (`voor` in haar stijl: de
  werkplaatsen van vraag 167, `WERKPLAATSEN` in `huizen.cjs`), en een soort zonder steen die het dak van nu niet heeft (een
  werkplaats heeft alleen dat van haar trede), krijgt het dak dat er is. `T.plekVoor` keert een deur naar de weg (`T.keerNaarDeWeg`, `js/bouwstijl.js`),
  en de maker zet een huis ook vóór het plein, met zijn deur ernaartoe (`T.vormenVanStijl`). Elke tekening zegt in
  `tegels.js` wat ze is (`stijl`, en met `ook` de andere stijlen die haar nemen), uit `STIJLEN` in
  `gereedschap/pixelart/huizen.cjs`; wie doorgroeit, zoekt zijn nieuwe tekening in de stijl van zijn dorp. **De grote
  gebouwen** (stap 3, 7 okt): elke stijl heeft ook de kleine en de grote herberg, de kapel, de woontoren en het huis van
  de aanvoerder (`grootGebouw` in `huizen.cjs`); de maker legt het raadhuis en de herberg in de stijl, een stenen
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
  `tekenSchoorsteenRook`; de tegels met water in beeld onthoudt `waterIn` zolang het vak en het open land dezelfde
  zijn, 17 okt); de kip en de hond komen uit `gereedschap/pixelart/klein.cjs`. `T.waterOp` onthoudt per kaart; op het
  eiland tot er land opengaat, want de grond verandert daar niet in het spel (een gevelde boom liet het water tot 17 okt
  alle tegels in beeld opnieuw uitzoeken). De spelregel "Klein leven"; de
  getallen in `T.KLEIN_LEVEN_INSTELLINGEN`.

### js/zien.js: het licht

- `js/zien.js`: **het licht in het dorp** (werklijst vraag 108, d, en 125, C; tot 11 okt ook het zichtveld en de
  getuigen, vraag 151): het licht staat op één plek (`T.lichtBronnen`: de herberg en de lantaarns op de kaart, die
  's avonds branden, de ramen van de huizen waar iemand thuis is, de kaarsjes van de kerstboom, een brand, en wie een lantaarn draagt,
  soort 'drager': `T.draagtLicht(D, e)`, buiten in het donker, voor de bode en wie meegaat (`T.bodeDragers`, `js/bode.js`)
  en de aanvoerder en de groepsleiders (`T.lantaarnDragers`, `js/soldaten.js`; vraag 171), en het leger van de heer
  (`T.legerVanDeHeer`, js/heer.js: een fakkel, tot die getekend is de lantaarn; werklijst E, stap 4; tot vraag 170, stap 5 had
  alleen de schout er een, `T.draagtLantaarn`), voor het licht in `js/tekenen.js` en voor de
  wolven, die niemand in het licht aanvallen (`js/beesten.js`); wie er nu een brandende draagt, geeft `T.lichtDragers(D)`
  (voor zijn licht, en voor het lantaarntje in zijn hand), en zijn licht ziet er kleiner uit dan het voor de wolven is
  (`beeldStraal`, vraag 171, L3; `js/tekenen.js` tekent elke bron met `getekendeStraal`), en zo ook het kampvuur en de
  vuren van de roverskampen (`T.BEGIN_INSTELLINGEN.vuur`: 3 tegels en 0,45 op het scherm, 6 voor de wolven, met een warme
  kleur in `T.LICHT_INSTELLINGEN.kleuren.kampvuur`; vraag 175, Marcel koos K3; zonder kleur was het wit); `T.huizenMetIemandThuis` zegt welke huizen
  een raam en een schoorsteen hebben die rookt. De getallen in `T.ZIEN_INSTELLINGEN`.

### js/regie.js: de scènes op Sint-Maarten

- `js/regie.js` (werklijst E, stap 4; Marcel, 18 okt, C2, en 20 okt: "A1 B1 C1"): **wat er gebeurt, speelt in de wereld
  (js/heer.js), en de regie maakt er een scène van**: alles van het beeld weg behalve het doek (`body.regie` in stijl.css,
  zoals de fotomodus; op het doek `zonderUi` in js/tekenen.js), zwarte banden die erin schuiven, een zin onderin
  (`#regie-zin`), en de camera die meerijdt (`T.regieCamera`, js/main.js). Elk beeld (`T.werkRegieBij` vanuit `werkBij`)
  kijkt de regie of er een scène begint (`T.welkeScene`: 'weigeren', of in de demo 'betalen'), en wat ze nu toont
  (`T.regieShot`: de stap, waar de camera kijkt, de zin, en de snelheid van de tijd, met `T.zetSnelheid` als de stap
  verandert). Allebei puur, uit wat de wereld nu is, en getoetst (`test/regie.test.cjs`); zo speelt een spel dat midden in
  een scène geladen wordt, gewoon verder. **Weigeren:** de heer nakijken (`nakijken` seconden), de nacht valt (de tijd op
  `nacht`), en de kop van zijn leger volgen (1×). **Betalen:** tussen de wagen en je voorraad in kijken terwijl ze halen
  (`halen`) en brengen (1×), en dan de wagen. Is het spel uit (`D.einde`), dan wordt het beeld zwart (`zwart` seconden), en
  dan pas het eindscherm (`T.ui.toonEinde` wacht zolang `S.regie` niet `klaar` is, js/hud.js); het zwart blijft erachter tot
  het titelscherm. **De invoer:** `S.modus` is 'scene' (de wereld leeft door, js/tik.js; de rest van de invoer kijkt naar
  'verkennen'), een toets gaat niet naar het spel (een luisteraar die als eerste luistert), en Esc of een klik op het beeld
  (`#regie` ligt over het doek) slaat de scène over: `T.eindVanSintMaarten`, en snel zwart (`overslaan`). Dat is een klik
  die de wereld verandert zonder opdracht, net als betalen en weigeren (`opmerkingen.md`). Alleen scherm: `S.regie` staat in
  `T.schermVelden`. De getallen in `T.REGIE_INSTELLINGEN` (de werkbank: "The scenes at Martinmas").

### js/scenario.js: de triggers van een level

- `js/scenario.js` (vraag 187, stap 1a, 24 okt; het ontwerp in `scenario.md`, 2): **de motor van een scenario**, zonder
  scherm en getoetst (`test/scenario.test.cjs`). `T.startScenario(S, level)` keurt eerst (`T.keurScenario`: een lijst
  zinnen voor wie het level maakt; met een fout begint het niet) en zet dan `S.scenario`: de gebieden, een kopie van de
  triggers met wat elk van zichzelf weet (`aan`, `keer`, `gedaan`, `laatst` in uren van het spel), de doelen, de tellers,
  en de dagen uit het zaad (`lot`, meteen getrokken met `T.vastLot`). Gewone gegevens, dus het wordt bewaard zoals de rest
  van `S`, zonder nieuwe `versie` (een oud spel heeft gewoon geen scenario). **In de tik:** `T.werkScenarioBij` direct na
  de kalender (`js/tik.js`), maar alleen als er een seconde van de wereld om is (`T.SCENARIO_INSTELLINGEN.elke`); dan kijkt
  elke trigger die aan is, in de volgorde van het level, en wat een trigger verandert, ziet een trigger verderop in
  dezelfde ronde al. Gemeten (24 okt, Node, het proefdorp): zonder scenario 25 ns per tik; 17 triggers waarvan 6 op een
  gebied, bij 220 wezens, 37 µs per ronde; 31 triggers waarvan 21 op een gebied, bij 520 wezens, 160 à 180 µs.
  **De taal is die van de gesprekken:** `T.VOORWAARDEN` en `T.GEVOLGEN` staan in `js/gesprek.js` (vlag, nietVlag,
  zetVlag, wisVlag, handel, heer), en dit bestand zet de rest erbij; `T.voorwaardeGeldt` en `T.doeGevolg` lopen de woorden
  van een object af. Een voorwaarde met een woord dat niemand kent, geldt niet; `wie` kiest het dorp (`T.scenarioDorp`:
  'speler' of een nummer in `S.dorpen`). Wat elk woord doet, staat in het bestand en in `scenario.md`, 2. Het hoofddoel
  staat linksboven (`T.doelLinksboven`, vanuit `js/main.js`, anders `T.tredeDoel`); het eind is `T.spelUit` met reden
  `'scenario'` (`js/einde.js`, het scherm in `js/hud.js`). Een gebied is een vak of een kring van tegels, en een
  voorwaarde erop loopt de wezens van de kaart af, niet de tegels (`minstensIn`, zonder lijst).
- **De woorden van het rovershol** (werklijst K, 2c, stap 4, 28 okt): de voorwaarde `hol` ('staat' of 'verslagen',
  `T.holStand` in `js/rovers.js`) en `overval` (hoeveel overvallen er op je land kwamen: `D.rovers.geweest`, dat `eind`
  in `js/rovers.js` ophoogt voor een overval met rovers op de kaart, niet voor een die niet kwam). Het gebied `hol` heeft
  elk level met een hol zonder het te noemen (`gebiedVan(S, naam, D)`: `T.holGebied(D)`, een kring tot de palissade),
  want waar het ligt, weet pas het spel; een level mag geen eigen gebied zo noemen. Een doel met `gebied` wijst naar een
  plek (D2): `d.plek` (bewaard, het midden van het gebied, of zijn eigen `plek`: die van het hol is voor de poort, twee
  tegels buiten de palissade op het paadje), een klik op het bericht van een nieuw doel brengt je erheen, en
  `T.doelPlekken(S)` geeft de plekken van de open doelen: de minikaart geeft ze een gouden ring (`js/balk.js`), en
  `vaandelsInLijst` in `js/tekenen.js` zet er het vaandel (`T.sprites.vaandel(stand)`, `beelden/vaandel.png` uit
  `gereedschap/pixelart/vaandel.cjs`, 3,5 kB, laadt pas als er een doel met een plek is), dat op de klok van het scherm
  wappert (vier standen, vijf per seconde). Het item heeft geen punt, dus de mist laat het staan (`mistOverLijst`): je
  ziet het ook boven land dat je nog niet kent of dat nog niet open is; niet in de fotomodus en niet in een scène.
  Gemeten (28 okt, in de cloud, hetzelfde beeld): 1,1 ms met en 1,2 zonder, binnen de ruis;
  krijgt een doel dat er al is een gebied, dan zegt het level het met een bericht met dat gebied. De zin van het level
  voor de eerste brief is `inleiding` (`S.scenario.inleiding`; `benoemingInDeWildernis` in `js/brieven.js` zet hem vóór
  de wetten). De keuring kent ze allemaal (een hol vraagt een dorp met een hol).
- **De kaart van een level** (stap 2a, 24 okt; Marcel: "Stap 2a: kaart en rand"): `eiland: { zaad }`, `plek` (een naam)
  en `rand: { b, h }` (in stukken) gaan via `T.beginOpEiland` naar de maker (`T.laadGemaaktGehucht(zaad, { plek })`,
  `T.randOm`) en op de kaart (`w.rand`, `js/wereld.js`); de keuring wil een zaad vanaf 1, een plek alleen met een vast
  eiland, en een rand van minstens `T.randMinstens()` stukken. Het debugvenster heeft een proef: *New game with a border
  (a test)*, het land van nu met de kleinste rand (`T.LEVELS.proefRand`, gezet bij de klik). Getoetst in
  `test/rand.test.cjs`.
- **Een level** (stap 1b, 24 okt; Marcel: "1b nu"): een bestand in `levels/` (een script, geen JSON: dat laadt niet vanaf
  `file://`; in `index.html` na `js/scenario.js`) zet `T.LEVELS.<naam>`: een scenario met `dorpen` (per dorp wat het bij
  het begin anders heeft: `wacht`, `dicht`, `overvallen`). `T.nieuwSpel(makerZaad, level)` (`js/main.js`; een level, of
  null voor het volle spel; zonder: de demo als `T.DEMO_INSTELLINGEN.aan`) geeft het aan `T.beginOpEiland` (`js/begin.js`):
  dat keurt het (een fout gooit, want dat is een fout in het spel), geeft `T.nieuwDorp` wat het van het eerste dorp zegt,
  en start daarna het scenario. `T.proefdorp.begin(zaad, level)` doet hetzelfde voor de toetsen. **Het eerste level is
  het demojaar** (`levels/demojaar.js`): de wacht in een eigen tent (de tent draagt de lijst, `g.wacht`, voor
  `T.zetBeginBewoners`), het wachthuis en de wapenmaker op slot (`D.dicht`, `T.isDicht` in `js/gebouwen.js`), geen overvallen
  op het rooster (`D.rovers.overvallen === false`), een trigger op een dag uit het zaad voor de aangekondigde overval
  (`{ rovers: { aantal: 3, aangekondigd: true } }`, `js/rovers.js`), en een trigger als de heer komt (`{ heer: 'komt' }`)
  voor de punten (`punten`, `T.telPunten`) en de scène van het betalen (`scene: 'betalen'` zet `D.scene`; dan is betalen
  het eind, `js/heer.js`, en speelt `js/regie.js` de scène). Hoe een spel begon, zet wie het begint erbij (stap 2b): de
  demo is `T.demoLevel()` (`js/einde.js`: het demojaar met `demo: true`), en dan laat `S.scenario.demo` het eindscherm
  zeggen dat de demo daar eindigt (`js/hud.js`); een hoofdstuk is `T.hoofdstukLevel(id)` (`js/campagne.js`), en dan zegt
  `S.scenario.hoofdstuk` welk. Zo leest geen regel meer een vlag van de demo; wat een spel is, gaat mee in wat bewaard wordt.
  Het getal van de overval en zijn dagen staan nu in het level, niet meer in de werkbank (die houdt `vooraf` en
  `voorDonker`, `T.ROVERS_INSTELLINGEN.aangekondigd`). Nog niet: `bouw` als gevolg (iets open of dicht midden in een
  level). **Het tweede level is het rovershol** (`levels/rovershol.js`, 2c, 28 okt): de wacht, het hol (`dorpen[].hol`),
  de overvallen op het rooster, en vier triggers: het hoofddoel bij het begin, na de eerste overval het doel met het
  gebied `hol`, gewonnen als het hol verslagen is, en mislukt als de heer komt en het staat er nog. `npm run teksten`
  leest de zinnen van elk level (`zinnenVanLevel` in `gereedschap/teksten.cjs`: de inleiding, de berichten, de doelen en
  het eind; het blok `T.LEVELS.<naam>` van `levels/<naam>.js`).

### js/campagne.js: de campagne

- `js/campagne.js` (vraag 187, stap 2b, 24 okt; het ontwerp in `scenario.md`, 6; Marcel: hoofdstuk 1 "Op het
  campagne-eiland, 5×5", en voor het eiland "Kies jij er voorlopig een"): **de regels van de campagne**, zonder scherm en
  getoetst (`test/campagne.test.cjs`). De campagne zelf staat in `levels/campagne.js` (`T.CAMPAGNE`): één eiland (`eiland:
  { zaad: 5 }`; hoofdstuk 1 in Oakley, 7 bij 7, sinds c3 van vraag 170, want een overval komt uit een kamp binnen de
  rand; hoofdstuk 2, het rovershol, in Oldland, 7 bij 7), en per hoofdstuk een `id`, een `titel` (een zin uit
  gegevens: `T.tGegevens`, en `npm run teksten` leest hem daar), een `level` (`T.LEVELS`), een `plek` en een `rand`.
  `T.hoofdstukLevel(id)` maakt het level waarmee het hoofdstuk begint: het level met het eiland, de plek en de rand erover,
  en `hoofdstuk: id`, zodat `S.scenario.hoofdstuk` zegt dat het een hoofdstuk is (zoals `T.demoLevel`, `js/einde.js`,
  `demo: true` zet: hoe een spel begon, zegt niet het level). Wat af is, blijft op deze computer (`T.campagneAf`, onder
  `<OPSLAG_SLEUTEL>.campagne`, zoals de beste punten), niet in `S`. `T.hoofdstukOpen(id)`: het eerste altijd, een volgend
  als het hoofdstuk ervoor af is. `T.spelGewonnen(D)`: betaald (het demojaar), of een scenario dat gewonnen eindigt.
  `T.eindVanHoofdstuk(S, D)` (vanuit het eindscherm, `js/hud.js`) zet een gewonnen hoofdstuk af en geeft `{ hoofdstuk,
  gewonnen, volgende }`. `T.keurCampagne` keurt de campagne zoals `T.keurScenario` een level. Het scherm: *Campaign* op het
  titelscherm (`campagneScherm` en `speelHoofdstuk` in `js/menu.js`; niet in de demo), dat een hoofdstuk begint zoals Begin
  bij New game, met de naam van zijn plek; en op het eindscherm bij elk eind of het hoofdstuk af is.

### js/veldslag.js: de veldslag

- `js/veldslag.js` (vraag 187 en 188, stap 3; het ontwerp in `scenario.md`, 7; Marcel, 28 okt): **skirmish zonder
  economie**, zonder scherm en getoetst (`test/veldslag.test.cjs`). Stap 3a1 (28 okt): **de kaart uit een recept**.
  Een kaart is een recept in `levels/kaarten.js` (`T.KAARTEN`, gegevens die later de editor terugschrijft; de naam is een
  zin uit gegevens, en `npm run teksten` leest hem): de maat, de heuvels, de rivier met zijn voorden en brug, de pas van
  rotsen bij een voorde, het bos en de stroken van de spelers, in de maat van het scherm (`a` van links naar rechts, `b`
  van boven naar onder; het land is de ruit |a| + |b| <= 1). **Een kaart is een klein eiland**: `T.eilandVan(w.eiland)`
  met `{ zaad, recept }` maakt het met dezelfde stappen als het grote eiland (`maakKaart` in `js/eiland.js`), alleen de
  vorm (`receptLand`), de hoogte (`receptHoogte`), de rivier (`receptRivier`: een rivier van het recept, glad en
  slingerend zoals een rivier van het eiland, met zijn voorden en de plek van de brug), de streken (`receptStreek`: het
  bos, de voorde als strand, en verder gras met heide) en de wegen (`receptWegen`: alleen een stukje weg dwars over de
  rivier, waar `legBruggen` dan de brug legt) komen uit het recept. Zo werkt alles van het eiland er vanzelf op (de
  stukken, de grond op de videokaart, de hoogte, de mist, de minikaart, de bruggen), en is er geen tweede soort wereld.
  Het zaad schuift elk ding een stukje (`variatie` in het recept, `receptVan`): Marcel, 28 okt: "niet altijd dezelfde
  map". Een voorde is een stuk rivier dat geen water is maar zand net boven het water (`voordeOp` in `T.eilandStuk`).
  Op het open land staat hier en daar een boom (`bomen` in het recept), niet de bosjes van de kampen van het grote
  eiland. Een kaart ligt op het eiland vanaf `T.KAART_OORSPRONG`, met zee eromheen. `T.veldslagWereld(recept, zaad)`
  maakt de wereld: een kaart van dat eiland (`T.eilandKaart` met het recept), het land en een strook zee open
  (`T.VELDSLAG_INSTELLINGEN.zee`), de rand eromheen (`w.rand`), de rotsen van de pas (het recept geeft hun tegels; ze
  staan vast, dus ze zijn er altijd), en de hoogte van het eiland (`w.hoogte` met `eiland: { zaad, recept }`), ook als de
  spelregel Hoogte uit staat. `w.eiland` draagt het recept, dus alles wat het eiland van een kaart opzoekt
  (`T.eilandVan(w.eiland)`, op 19 plekken), krijgt het juiste. Gemeten (28 okt, Node): *The Ford* maken kost 300 à 550
  ms.
- Stap 3a2 (28 okt): **de slag zelf**. Een veldslag is een level (`scenario.md`, 7): `T.veldslagLevel({ kaart, zaad,
  legers, minuten })` geeft `{ veldslag: { kaart, zaad, legers }, triggers }`, met vaste triggers in de woorden van elk
  level: het doel *Defeat the enemy army.*, `mannen` (`{ minder: 1 }`, met `wie: 1` voor de vijand) voor winst en verlies,
  `seconden` voor de tijd, en het gevolg `uitslag` (wie de meeste mannen heeft, wint; js/scenario.js). De keuring kijkt de
  kaart, het zaad, het aantal legers (2 tot het aantal stroken) en de soorten na. `T.beginOpEiland` (js/begin.js) geeft
  een level met `veldslag` aan `T.beginVeldslag`: de wereld van de kaart, `S.veldslag = { kaart, zaad }`, en per strook
  een **leger als dorp** (`T.nieuwDorp` met een lege plek, het vak van de strook en een plein van 5 bij 5 in het midden;
  `D.veldslag = true`, de vijand `D.ander`): geen kar, gezinnen of voorraad, maar zijn soldaten (`T.zetSoldaatBij`,
  js/bewoners.js: een bewoner zonder huis met `p.soldaat`, en zijn poppetje) en zijn held (`T.zetHeld`: de aanvoerder
  als bewoner, zodat je hem met de rest stuurt). De opstelling is de knop Line (`T.stuurMannen`, js/kiezen.js) naar de
  voorkant van de strook, en ze staan er meteen op hun post; de held staat achter het midden. `T.legerVan(D)` zijn de
  mannen die nog staan (de militie en de held). Wat een dorp heeft en een leger niet: de dag staat stil en er is geen
  versneller (`S.veldslag` in `T.tikKalender` en `T.snelheidNu`, js/tijd.js), er zijn geen statussen dan het gevecht
  (`inVeldslag` in `T.OORZAKEN`, js/statussen.js) en geen raad (`T.raadNu`, js/raad.js), en wie valt, valt in de slag,
  niet door rovers (js/rovers.js). Getoetst: de linie, een minuut stilstaan, het gevecht tot het eind, en de tijd om.
  Een leger met `veldheer: true` speelt de AI (`js/veldheer.js`); zonder keus is dat elk leger behalve het eerste.

### js/veldheer.js: de veldheer

- `js/veldheer.js` (vraag 187 en 188, stap 3a3; `scenario.md`, 7 en 8; Marcel, 28 okt: "1. A", "2. Oke"): **de AI van een
  leger**, als een mens in zijn plaats. Hij weet alleen wat zijn dorp nu ziet (`T.zietNu`, js/mist.js) en waar de stroken
  liggen, en hij stuurt met dezelfde vraag als de muis: `T.handelingSturen(S, doel, mannen, D)` (js/kiezen.js; de vierde
  is nieuw, zonder is het `S.dorp`), dus een opdracht met `dorp` (`T.geefOpdracht`). Hij denkt in de tik
  (`T.werkVeldheerBij` in `T.werkDorpBij`, na de mist), om de `denkElke` seconden, en niet alle veldheren in dezelfde tik;
  wat hij onthoudt, staat in `D.veldheer` (`T.nieuweVeldheer`: wanneer hij weer denkt, de plek van de kaart waar hij heen
  gaat, waar hij het laatst een vijand zag, en waar hij zijn held heen stuurde). Elke keer: zijn doel is de dichtste
  vijand die hij ziet, anders waar hij er het laatst een zag, anders de volgende plek die hij kent (de stroken van de
  anderen, het midden, de voorden, de brug). Wie vecht, laat hij; wie een vijand die hij ziet vlakbij heeft (`aanval`), valt
  hem aan zoals een klik op die vijand (`volg`): zo vecht ook wie hem zelf niet ziet (een heuvel of boom ertussen,
  `T.zichtTussen`; zonder dit stonden ze op drie tegels van elkaar tot de tijd om was). De rest stuurt hij in een Line naar
  het doel, of als dat verder is dan een etappe, een etappe die kant op: met etappes van 24 tegels zakte de hoogste piek
  van 70 naar 22 ms, en ook met één weg voor de groep (js/kiezen.js) helpen ze nog (mediaan van de hoogste piek per slag
  3,6 tegen 9,4 ms). Een man wiens post al
  bij het doel ligt (`ver`), krijgt geen nieuw bevel. Een plek is bereikt als het midden er is, of als iedereen stilstaat
  op een post erbij (een plek in de rivier haal je nooit). De held loopt `achterDeLinie` tegels achter het doel; is hij
  de laatste, dan vecht hij zelf. Gemeten met de proefbank (`npm run veldslag`, 28 okt, Node): dertig slagen tussen twee
  veldheren eindigen allemaal, in gemiddeld 53 seconden; een tik kost gemiddeld 0,13 ms. Getoetst in
  `test/veldheer.test.cjs`.

### gereedschap/pixelart/: de beelden uit code

- **AI-texturen in de renderer** (18 okt, werklijst vraag 180; `gereedschap/ai/hybride-voorstel.md`, de proef in
  `gereedschap/ai/wielproef-evaluatie.md`): `kern.cjs` kan optioneel een materiaal met een textuur aan (`mat.textuur`,
  gemaakt met `textuurMateriaal` in `textuur.cjs`): de kleur op de plek in de rusthouding van het onderdeel (`naarDeel`,
  `terug`), belicht met de `stap` van de renderer, de vlag `VLAG.RGB`, en `kleurBeeld(B, { palet })` voor het beeld
  (de rest precies als `kwantiseer` en `Plaat`). Een onderdeel krijgt zijn afwikkeling **ernaast**, niet als eigenschap
  (`TX.metUv(deel, uv)` met `rond`, `langs`, `vlak`; u is de nerf, een gesloten richting geeft zijn omtrek, en op een
  dunne stok wordt hij gespiegeld); zonder valt het terug op triplanair. **Geef een onderdeel geen nieuwe eigenschappen**:
  een `uv` op de onderdelen maakte `bouwSdf` in V8 twee keer zo traag, ook voor elk model erna in hetzelfde proces.
  `o.rust` in `tekenModel` bewaart per pixel de plek in rust (om te meten). Zonder textuur loopt geen van die regels:
  `gelijk.cjs` (`bewaar` vóór een wijziging aan de renderer, `vergelijk` erna) rendert 65 bestaande beelden en
  vergelijkt hun hashes. De texturen staan in `texturen/` (uit `gereedschap/ai/textuur-ai.cjs`), de proef is
  `wielproef.cjs`.
- **De HD-proef** (18 okt, vraag 180; `gereedschap/ai/hd-wielproef.md`), allemaal optioneel: `tekenModel` met `o.fijn`
  (de interne resolutie, pixels per eenheid); `mat.afwerking` voor een materiaal met een textuur (`afwerken` in
  `kern.cjs`: reliëf uit de hoogte, holtes, randen uit de kromming, warm en koel licht, glans die erbij komt);
  `textuurMateriaal` met `contrast`, `reliëf` (de hoogte uit de helderheid, `hoogteVan`) en versiering op het onderdeel
  (`TX.metVersiering`: klinknagels langs de afwikkeling); `onderdelen.cjs` (ringstukken, taps toelopende balken en
  klinknagels, met afgeschuinde randen); `stijlmaat.cjs` (contrast, warmte, schaduw, kleuren en drukte van een sprite,
  om naast een voorbeeld te leggen). De proef zelf is `hdproef.cjs`; de resolutieproef (2× tot 16×, vier
  verkleinfilters: naast, box, Lanczos-3 en meerderheid) `hdresolutie.cjs` (`gereedschap/ai/hd-resolutie.md`).
- **De stijlafwerking** (18 okt, vraag 180; `gereedschap/ai/hd-stijl.md`), optioneel, na de render: `tekenModel` met
  `o.gbuffer` (en `o.rust`) bewaart per pixel in `B.g` (`K.GB` getallen, de volgorde in `K.G`) de afwikkeling (`mat.uv`
  van `textuurMateriaal`), het licht, de glans, de holte, de bolle rand, de zon en de normaal maal het licht; `afwerken`
  geeft die er nu bij terug. `stijl.cjs` maakt daar op de doelmaat pixel art van: `gbuffer(B, n, stijl)` (per doelpixel
  het onderdeel met de meeste subpixels en het gemiddelde daarvan, en de dekking van de nerf), `reeks(basis, n, o)` (een
  kleurreeks in OKLab: de tint schuift van koel in de schaduw naar warm in het licht), `verdeling`, `kalibreer` (de
  drempels tussen de tonen, eens per ding, niet per beeld) en `stileer(G, stijl, stappen)` met tien stappen, elk aan of
  uit (kleurreeksen, nerf, variatie, metaal, clusters, contactschaduw, lichte randen, binnenlijnen, slijtage, omlijning
  in kleur). Alles hangt aan het ding (de plek in rust, de afwikkeling, het onderdeel), niets aan toeval per beeld.
  **Voeg geen stap toe die per beeld beslist** (eilandjes samenvoegen flikkerde: 0,18 naar 0,25); maak het licht glad
  binnen een onderdeel en kies dan. `stijlmaat.cjs ontleed` haalt een sprite en een voorbeeld op dezelfde manier uit
  elkaar (materiaal op kleur, tonen, licht, middel en donker, clusters, randen). De proef is `hdstijl.cjs`.
- **De AI-afwerking** (18 okt, vraag 180; `gereedschap/ai/ai-afwerking.md`), optioneel, na de stijl: `stijl.cjs passen(G)`
  geeft de lagen van een render als beelden op de maat en plek van de sprite (silhouet, materiaal, onderdelen, basis
  zonder textuur, licht, schaduw, diepte), `lijnenVan(B)` en `diepteVan(B)` op de interne resolutie (voor ControlNet).
  `gereedschap/ai/afwerking.cjs` zet een sprite maal 8 op een doek van 1024 × 1024 en laat SDXL hem bijwerken
  (image-to-image binnen een latent masker van ons silhouet, ControlNet union met onze lijnen en diepte, IP-Adapter met
  het ChatGPT-wiel, een vaste seed), en zet hem terug op 2× met de alfa en de omlijning van de sprite. Alles wat erin ging
  staat naast het beeld (`instellingen.json`, `werkstroom.json`).
- **Bakken: de AI op het oppervlak** (19 okt, vraag 180; Marcels keus "Ai on surface"): `pixelart/bakken.cjs` zet een
  beschildering (een AI-beeld op onze render) op het oppervlak van het ding. Uit een render op de maat van het doek (met de
  G-buffer) per doekpixel het onderdeel en zijn afwikkeling (u, v), en de kleur gedeeld door ons licht (het albedo); per
  groep gelijke onderdelen (`groepen`: dezelfde soort, grootte en afstand tot de as, zoals acht spaken), voor een rond
  onderdeel gevouwen op zijn symmetrie, en per texel de kopie die het meest te zien was (niet het gemiddelde: dat wordt
  een vlek). `bakMateriaal` leest de bak terug in elke stand en richting; de afwerking die de kleur verandert (reliëf uit
  de oude textuur, warm en koel, slijtage) gaat uit, ook in de render waaruit gebakken wordt. Het nummer van een onderdeel
  staat in een WeakMap (`nummer(model)`), niet op het onderdeel. De proef: `gereedschap/ai/oppervlak.cjs`.
  **Projecteren** (19 okt; Marcel: "Je kunt de pixels letterlijk kopieren toch?"; `bakken.cjs projectie` en
  `projectieMateriaal`): zonder (u, v) en zonder groepen. Elke pixel van de render waaruit geprojecteerd wordt, weet welk
  punt in rust hij zag (`B.rust`); een punt zoekt de pixel die hetzelfde punt zag, in een rooster op de plek in rust, per
  soort onderdeel (`o.sleutel`, `o.sleutelVan`). Een lineaire functie van rust naar scherm klopte voor het wiel, maar niet
  voor de kar (de kist en het vaantje staan elk in hun eigen rust). Anders een kopie van het punt (gedraaid om de as,
  gespiegeld), en anders de eigen textuur; een materiaal zonder textuur krijgt er een. De render waaruit geprojecteerd
  wordt, gebruikt dezelfde materialen zonder beeld (`projectieMateriaal(mat, null)`): een materiaal zonder textuur schrijft
  anders de stap in zijn ramp als licht. `karhd.cjs gpt` doet het met de hele kar en de os. Via (u, v) gaf het ChatGPT-wiel strepen: de acht spaken delen één beschildering, en de voor- en zijkant van een
  spaak vallen op dezelfde texels. `oppervlak.cjs --wiel gpt` legt het ChatGPT-wiel op onze render (`hdstijl.cjs
  ellipsVan`: de ellips naar een cirkel en terug, en de draaiing waarbij wat dekt het best samenvalt), en buigt het beeld
  per spaak in hoek bij (`buigSpaken`), want ChatGPT tekent zijn spaken niet om de 45°.
- **Het wiel naar het doel** (19 okt, vraag 180): `hdproef.cjs wielDoel` (naast `wielC`, dat de eerdere proeven gebruiken)
  bouwt het wiel naar de opgemeten verhoudingen van het ChatGPT-wiel, met koper (`M.goud`, het gesmede ijzer naar koper
  getoond) voor de kap; `DOELWIEL` is de variant voor `wielModel`. De proefplaat: `doelwiel.cjs proef`.
- **Verkleinen zonder detail te verliezen** (19 okt; Marcel: "i feel like the filter destroys detail when we scale
  down"; `doelwiel.cjs filters`): **het gedeelde palet van 64 kleuren deed het meeste kwaad**, niet het filter: een
  mediaansnede geeft de kleuren aan wie veel pixels heeft, en het koper van de kap werd bruin. Daarom een palet per
  materiaal (`doelwiel.cjs paletPerMateriaal`, vast per ding, uit zuidwest en noordoost) en `stijl.cjs verkleinDetail`: een
  klein onderdeel (een nagel) wint zijn blok, een duidelijke donkere lijn of een glimlicht wint van het gemiddelde, anders
  box. Nearest neighbour houdt nog iets meer nagels, maar flikkert veel meer. Wat kleiner is dan een spritepixel (de nagels
  op de kap) haalt geen filter: dat moet getekend worden, zoals stijl D een nagel tekent. `afwerking.cjs` neemt een bron
  (welk wiel en welke sprite), en `oppervlak.cjs --wiel doel` bakt het wiel naar het doel.
- **Het handschrift** (19 okt; Marcel: de maat blijft, het detail moet getekend worden): drie opties in `stijl.cjs`,
  zonder blijft alles als voor de stijlproef. `detailsWinnen` (in `gbuffer`): een klein onderdeel (stijl.details) wint zijn
  blok al met één subpixel; `nagelLicht` (in `stileer`): elke nagelkop een lichte stip met een donkere pixel ernaast, en
  nooit een binnenlijn (anders werd een nagel op hout een donkere stip); `binnenlijnen.naden`: een naad tussen twee
  onderdelen van dezelfde soort die naast elkaar liggen; `binnenlijnen.om`: soorten onderdelen (deel.deel) die een lijn om
  zich heen krijgen, op wat er al een fractie achter ligt (de spaken). Op het wiel naar het doel: `doelwiel.cjs hand`.
- **Het handschrift op wat geen textuur heeft** (19 okt, de ossenkar): `kern.cjs` schrijft met `o.gbuffer` ook een
  materiaal zonder textuur in de G-buffer (de stap in zijn ramp als licht, zon -1 als teken); `stijl.cjs gbuffer` zet dan
  `G.kaal`, en `stileer` zoekt zijn stijl onder `~` + rampnaam (`rampStijl`: de ramp van nu als kleurreeks, de toon zoals
  `kwantiseer`). Op zo'n materiaal alleen de lijn waar iets ervoor ligt, geen naden en geen lijnen tussen soorten (anders
  wordt een dier een lappenpop). De ossenkar in HD: `karhd.cjs` (de wielen naar het doel, hout, ijzer, koper en rood met
  een textuur).
- **De vorm naar de ChatGPT-wagen** (19 okt; Marcel: "Ja proefplaat"), allemaal optioneel, zonder blijven de spelbeelden
  gelijk: `vee.cjs koe` met `o.bouw` ({ breed, diep, poot, hals, kop }: het lijf breder, de buik dieper met de rug op zijn
  plek, dikkere poten en hals, de kop groter om de nek), via `ossenkar.cjs os({ bouw })`; `kern.cjs` met `mat.zacht` (het
  licht van een materiaal met een textuur zachter: de schaduw zo ver op weg naar het volle licht, voor de pixels van
  ChatGPT, die zijn eigen licht al schildert). `karhd.cjs vormNaarDoel` maakt de rongen dikker en van hout met drie
  ijzeren banden, legt een gele onderrand langs de zijwanden en maakt de disselbomen een dikke vierkante balk
  (`onderdelen.cjs balk`); `ossenkar.cjs` geeft daarvoor ook `DISSEL` en `JUK`.
- **De eigen pijplijn** (19 okt; Marcel: "Ik wil niet steeds gpt moeten gebruiken"): `karhd.cjs meester(kant, checkpoint)`
  laat SDXL op onze eigen render schilderen, één op één (`bakRender`: de render met de materialen zonder beeld, en per pixel
  het ding en het onderdeel), en `projecteer(BR, beeld)` zet een beeld dat op de render ligt op de kar en de os; de pixels
  van ChatGPT gaan via dezelfde weg (`legWagen` legt ze eerst). `afwerking.cjs werkstroom` neemt `o.checkpoint`, zonder
  stijlplaat (`o.ip` 0) geen IP-Adapter, en `n.gebieden` (per gebied een zin, `ConditioningSetMask`). Zonder referentie
  (`karhd.cjs eigen`): `gereedschap/ai/huisstijl.cjs` (het checkpoint, de huisstijl, één zin per materiaal, `kleurWoord`
  voor een vacht) en `gebiedenVan` (de gebieden uit de materialen van de render: `NAAM_KAR`, `NAAM_OS` via
  `vee.cjs koeMaterialen`). Het wapen van de heer: `gereedschap/pixelart/wapen.cjs` (`leeuw`: een raster als dun onderdeel
  op een wand, de afstand tot de vorm één keer uitgerekend), in de HD-kar met een eigen materiaal (`EMBLEEM`). De gebieden
  standaard in zes groepen en het wapen (`huisstijl.cjs groepVoor`: elk gebied kost SDXL een eigen rekenslag per stap), en
  `werkstroom` neemt `o.lora` ({ naam, kracht }, `LoraLoader` op het model en de tekst; `huisstijl.cjs LORA`). De stoffen in
  code (`gereedschap/pixelart/stoffen.cjs`: vacht, jute, schors uit `kern.cjs ruis3`, op de plek in rust; `verrijk`) gaan
  met `bakRender(kant, fijn, rijk)` in het begin van SDXL en zijn de eigen kleur waar SDXL niet bij kwam. Ons handschrift
  over de geprojecteerde kar: `karhd.cjs handschrift` (H1, H2 de naaste pixels met de lijnen van `stileer` erover, `toon`
  -1, H3 met meer contrast; de os telt als `G.kaal`, anders een lappenpop), met `handschriftStijl` (de kleur van de render
  voor elke ramp) en `meesterTerug` (een meesterbeeld van eerder, zonder SDXL opnieuw). Rijker schilderwerk (`karhd.cjs
  rijker`): `huisstijl.cjs SCHILDER` (schilderwoorden, cfg 7), `plaatselijkContrast` (de helderheid verder van haar
  omgeving, op de render van 4×; `handschrift(R, stijl, { contrast })`), `tweedeBeurt` (dubbel formaat in tegels; op deze
  maat gladder, alleen met `TWEEDE=1`), `meesterOfTerug` en `buurverschil` (de maat voor rijkdom op spelmaat). De
  stijlspecificatie (`karhd.cjs spec`, `TAG`): H4 (`handschrift` met `o.spec`); `gebiedenVan` kiest het materiaal van een
  onderdeel dat het per plek kiest (de stam) op de plek in rust. Andere schilders: `karhd.cjs checkpoint` (Cor Epica naast
  FaeTastic, `huisstijl.cjs CHECKPOINTS`) en ERNIE-Image-Turbo (`afwerking.cjs werkstroomErnie`: fp8 bij het laden, 8
  stappen, cfg 1, zonder ControlNet; `meester` met `extra.ernie`; `karhd.cjs ernie`).
- **De soldaten van het dorp en eerst de AI** (20 okt, werklijst Q, f; `beeld.md`, "De soldaten van het dorp en de
  poppetjes met SDXL"): `heer.cjs soldaat(stand, o)` neemt `o.livrei: 'dorp'` (blauw, de schoof op borst en rug),
  `o.wapen: 'speer'`, `o.schild` (de linkerarm met het schild gaat met de romp mee) en `o.kraag` (maliën); zonder opties
  pixel voor pixel de soldaat van het spel. `SOLDAAT_M` en `SOLDAAT_D` zijn de nummers van zijn materialen en onderdelen.
  `wapen.cjs schoof(hoog)`: het wapen van het dorp, een afstandsfunctie (a, b) voor een materiaal dat goud kiest waar het
  < 0 is. `gereedschap/pixelart/soldatenhd.cjs`: de poppetjes (`POPPETJES`), hun render met de G-buffer, het meesterbeeld
  op onze render en de projectie (de eerste weg; slecht), en `concept` (de rondes van de AI eerst, `CONCEPTEN`).
  `gereedschap/ai/vrij.cjs vrijeRonde(R, o)`: de AI eerst, voor de poppetjes en de kar (`karhd.cjs concept`): denoise 1,
  onze diepte zacht (`VRIJ`), een stijlplaat via de IP-Adapter ('style transfer'), een paar zaden en sterktes naast
  elkaar. `bakken.cjs projectieMateriaal` neemt ook een lijst projecties (voor en achter: de eerste die het punt zag,
  wint). `karhd.cjs` geeft `handschrift`, `handschriftStijl`, `plaatselijkContrast`, `opRender`, `buurverschil`, `ZACHT` en
  `FMEESTER` ook aan anderen. De zinnen voor mensen staan bij die van de kar in `huisstijl.cjs` (`gezicht`, `wapenrok`,
  `malie`, ...). Meer sturing (Marcel: "Controlnet toevoegen?"): `afwerking.cjs werkstroom` neemt `o.pose` (OpenPose via
  de union-ControlNet, `n.pose`, tot `o.poseEind`), `vrij.cjs vrijeRonde` neemt `o.pose` (een beeld op de maat van de
  render), `o.omtrek` (`omtrekVan`: alleen de buitenlijn van ons silhouet, als lijnen), `o.lora` en `o.ipSoort` ('linear'
  voor hetzelfde poppetje in een andere richting), en geeft de beelden terug. `soldatenhd.cjs poseBeeld(kant, fijn)`: het
  skelet uit `GEWRICHTEN_SOLDAAT` (de gewrichten van `heer.cjs soldaat`, staand; verandert zijn bouw, dan deze ook), zoals
  `kern.cjs tekenModel` ze neerzet, met wat van ons af kijkt weggelaten (neus en ogen van achteren). Lopen
  (`soldatenhd.cjs benen`): `gewrichtenIn(naam, stand)` (de benen uit `heer.cjs soldaat` met `o.gewrichten`), `benenVan`
  (de pixels van de hozen en laarzen in een render), en `vrij.cjs vrijeRonde` met `o.masker` als beeld en `o.initOveral`;
  daarna in pixels buiten de benen het staande beeld. Wat niet werkte, staat er nog als opdracht (`sprites`, `beurt`,
  `lopen`), met de uitkomst in `beeld.md`.
- **De beelden van de generator** (21 okt; `beelden-van-de-generator.md`): `gereedschap/pixelart/generator.cjs` maakt een
  vel van de generator (een rij poppetjes op magenta, `gereedschap/pixelart/bron/<soort>/`, webp via de Python van ComfyUI
  naar png) passend: de achtergrond weg (`voorgrond`: magenta is waar rood en blauw ver boven groen liggen), de poppetjes
  los (`beeldenVan`: staan ze los van elkaar, dan elke groep grote stukken een beeld, `losseBeelden`; raken ze elkaar
  alleen met iets dunnes, dan de groepen van hun lijven (de voorgrond zonder staal en zonder wat dun is); anders per stuk
  het dichtste midden van gelijke vakken in de rij; een klein stukje bij het dichtste grote stuk; een stuk over
  meer middens: `toewijzing` vooraf, de kernen van de lijven (zonder het staal) naar hun midden en groeiend over wat dik
  is, en elk dun stuk dat overblijft, zoals een schacht met zijn punt, bij het beeld waar het met zijn gekleurde pixels
  het langst aan grenst: de schacht zit in de handen van zijn man, de punt raakt de buurman alleen met staal), het anker (opzij de romp, hoofd en schouders, in elk
  beeld op dezelfde plek, `rompMidden`: de generator zet de vakken niet even breed, en op het midden van het vak sprong
  de man; naar beneden staan op de zolen en een beweging op één grondlijn; met `anker: 'lijf'` (vallen) het midden van
  het hele lijf op het anker en het laagste ervan op de grond), de kleur per stof gelijk aan die van het staande vel
  (`kleurGelijk`: grijs, de tinten van `FIGUREN[naam].stoffen` en de rest, in Lab het gemiddelde, en de spreiding van de
  lichtheid hoogstens die van het staande vel), verkleind (`verkleind`: gemiddeld per blok, dan scherp) naar
  `FIGUREN[naam].doel` pixels tot de helm, met een maat per vel (`maatVan`: het lijf zonder de speer, met een kern van een
  vijftigste van de beeldhoogte, tot de voeten; staan de mediaan, lopen het hoogste beeld; de generator tekent niet elk
  vel even groot; de aanval en het vallen, gebukt of vallend, meten aan hun eerste beeld hoe gebukt hij staat: de
  smalste helm van het vel (`helmVan`, naar zijn vorm, niet zijn kleur) tegen die van het lopen in dezelfde richting,
  tussen 80 en 100% van de staande lengte). De voeten (`voetenVan`, ook voor het anker): zonder staal, zonder wat dun is (een opening) en
  alleen het gekleurde leer, want bij een steek naar de kijker steekt de speerpunt onder de voeten uit, en de vellen zoals `figuurvel.cjs` ze schrijft, in `uit/generator/animaties/`. Elke bron
  (webp, of de png van de generator in RGB) gaat via PIL naar een RGBA-png in `uit/generator/bron/`, want `H.lees` leest
  alleen 8-bit RGBA. De genummerde vellen van de masterprompt (`bron/<soort>/<naam>/NN`, `genummerd`) gaan voor de losse.
  `naar-spel.cjs --alleen speerman` zet ze in `beelden/`. In het spel: `js/sprites.js eigenFiguur` geeft een soldaat het
  vel van zijn soort als dat er is; de houdingen 'aanval' en 'sterven' kiest `S.houding` al (bij `e.uitval` en `e.dood`).

- `gereedschap/pixelart/`: de beelden komen uit code. Figuren en voorwerpen zijn kleine
  3D-modellen die uit acht richtingen tot pixel art worden gerenderd; zie de README daar. **De bruggen**
  (`bruggen.cjs`: de stenen boogbrug van veldsteen, zandsteen of baksteen, de houten jukbrug en de houten boogbrug, oud,
  drie tegels breed, met de proefplaat; `bruggen-vel.cjs`: het vel voor het spel, `naar-spel.cjs --alleen bruggen`, in
  vier seconden): een monster is een hele brug, en elke pixel gaat naar de tegel en de laag van de plek die hij toont
  (`B.pos`), zodat de omlijning geen naad op een tegelrand heeft; wat onder het water ligt, valt weg (in het spel ligt
  het water op het maaiveld, `BRUG.waterVlak` 0, en daarom ligt het dek 7 pixels hoger dan op de proefplaat: zo houden
  de bogen en de palen hun maat). `dekOp` is de hoogte van het wegdek; het spel rekent hetzelfde uit met de maten uit
  de beschrijving.
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
  `ruines.cjs spel [--erbij]`. **Alleen wat er nieuw bij komt** (vraag 157, 14 okt; Marcel: "Eerst aanvullen bouwen"):
  `npm run tiled huizen -- --erbij` rendert alleen de opgaven die nog niet op het vel staan; de rest houdt zijn bestand,
  zijn gegevens uit `tegels.json` en zijn sneeuw (`schrijfDaksneeuw(lijst, { erbij })`). Zonder `--erbij` gaat alles
  opnieuw, want de cache vervalt bij elke verandering aan de huizenbouwer: op vier kernen en zo'n 55 seconden per huis is
  dat ruim twee uur. Verandert de huizenbouwer iets aan huizen die er al staan, dan moet het toch zonder.
  **De zagerij** (vraag 157; Marcel, 14 okt: "Kapschuur in de stijl"): `grootGebouw(stijl, 'zagerij')` is één kapschuur,
  `open` in `huis-sdf.cjs` (`maakOpen`: wat de muren tekent, houdt op bij de muurplaat, `zOpen`; eronder palen op een steen
  met schoren en een vloer van zaagsel; de gevels en het dak blijven van de stijl), zonder ramen (`ramen: false`) en zonder
  schoorsteen. Eronder en ernaast staan delen die geen huis zijn: een deel met `tuin` in zijn opgave is een stuk van
  `tuin-sdf.cjs` (`tuinWereld` in `huizen.cjs`; `stammen-x/y`, `planken-x/y`, `zaagbok-x/y`), groter dan een tegel, en het
  draait met het gebouw mee; in de bouwfasen komt het pas als het gebouw af is (`fasenVanDelen`). Een opgave met delen
  heeft altijd een huis als eerste deel (`W.H` en de deur komen daarvan). Onder elk dak in vier standen; bouwfasen eerst
  alleen onder het dak van het gehucht (Marcel: "Eerst alleen het gehucht"), leien en pannen hebben `fasen: false`. In
  de bouwfasen staan de palen (`palen`) waar een huis zijn muren heeft (`BIJ_DE_MUREN`), en de fundering is de vloer met
  de stenen onder de palen.
  **Plat** (vraag 176, stap 4a; `ontwerp/beeld.md`, "Zicht in een dicht dorp"): `renderHuisPlat` in `huizen.cjs`, naast
  de bouwfasen en met dezelfde snede (`BIJ_DE_MUREN`, de romp als een schil), is het huis voor de weergave plat. De muren
  als een doorsnede (`platHoogte`: aan de kant van de camera tot de heup, `PLAT.voor`, achter vlak boven de grond; alles
  tot de heup dekte in de zichtproef de straat erachter nog af), geen dak, ramen, schoorsteen of licht, en een vloer en
  een randje in het eigen dak. De vloer krijgt het patroon van het dak recht erboven (`vloerPatroon`: hij zoekt het punt
  op het dak in het veld van het dak, en geeft het patroon dat punt met een normaal omhoog en het dak als deel), zodat
  riet, spanen, leien en pannen hun eigen rijen houden, ook de goot in de kil. Een gebouw uit delen gaat per deel
  (`platVanDelen`), met de snede van het geheel; de stukken uit `tuin-sdf.cjs` blijven zoals ze zijn, en een open
  kapschuur (de zagerij) toont haar eigen vloer van zaagsel. `plat.cjs` rendert ze: `proef` zet gewoon en plat naast
  elkaar, `spel [--erbij]` schrijft per jonge tekening `tegels/plat/<naam>.png`, strak gesneden met een eigen anker (de
  afspraak van `tegels.json`, zoals de daksneeuw), en `tegels/plat.json` + `.js` (`T.PLAT.platten`); een oude tekening
  deelt de platte van zijn jonge. `gereedschap/zichtproef/plat.cjs` gebruikt dezelfde snede.
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
  wordt neergezet — en een dorpeling is dat niet. Daar staan alleen de aanvoerder en de monsters.
  Er staan ook mensen in `mensen.js` zonder plek op een kaart (de smid, de molenaar, ...): voor als het gehucht een
  dorp wordt. (Tot ronde 2 van het snoeien, stap 6, ook de vijf boeren en de herbergierster van het gehucht dat er al
  was.) Wie over de weg komt en op geen kaart staat
  (de heer, de marskramer), heeft `bezoeker: true`.

### js/bewoners.js: wie er woont en waar hij werkt

- `js/bewoners.js`: **wie er in het dorp woont, met wie, in welk huis, en wie waar werkt** (3b,
  stap 2; `ontwerp/spel.md`, "Mensen worden poppetjes"). Het getal in de balk (`D.bevolking`) blijft
  de waarheid; de bewoners (`D.bewoners.mensen`) volgen het, één per mond, elk met een naam, een
  leeftijd (`T.LEEFTIJDEN`, die ook zijn vel kiest), een huis, een gezin en een poppetje
  (`e.bewoner`). De aanvoerder en de boeren zijn ook bewoners, met het wezen dat de kaart al neerzette.
  Hoeveel handen een gebouw krijgt, zegt `T.verdeelHanden` (`js/gebouwen.js`); wíé dat zijn,
  `T.wijsWerkToe`, en wie werk heeft, houdt het (en dan de plekken van iedereen, met de vrije tegels van het plein één
  keer voor allemaal: `T.pleinVrij`). Waar iemand op welk uur hoort, zegt `T.dagAnker`
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
  ouderdom, en krijgt een gezin met plaats soms een kind (`T.plaatsInHuis`). De aanvoerder en wie een naam heeft (`p.wie`)
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
- Een voorwaarde (`als`) en een gevolg (`doe`) zijn objecten met woorden, en elk woord staat één keer in `T.VOORWAARDEN`
  of `T.GEVOLGEN` (24 okt, vraag 187): hier die van de gesprekken, en `js/scenario.js` zet die van de triggers erbij. De
  gespreksschrijver laadt alleen `js/gesprek.js`, en kent dus alleen de woorden van hier.

### js/gesprek.js: woorden uit het spel in een zin

- Een zin in een gesprek kan iets uit het spel noemen: `{woord}` vult `T.GESPREK_WOORDEN` in
  (`js/gesprek.js`), zoals `{gisteravond}` (`js/herberg.js`). `T.vulWoordenIn` zet de zin eerst in de taal van nu (`T.tGegevens`, `js/taal.js`): de zinnen in
  `js/gesprekken.js` zijn Engels en gegevens (de gespreksschrijver schrijft ze terug), dus de naam boven een gesprek, de
  tekst van een knoop en een antwoord gaan allemaal hierlangs (`js/dialoog.js`).

Tot 23 okt stonden hier ook `js/quests.js` en `js/quest.js`, de quests van het oude spel (leeg sinds 25 sep), met
hun bewerker: ze gingen weg met Tiled, in ronde 4 van het snoeien (`snoeien.md`); de triggers komen ervoor in de plaats
(`scenario.md`, 2).

## Bouwen en groeien

### js/begin.js: een nieuw spel, en het lege begin

- `js/begin.js`: **een nieuw spel** (sinds ronde 4 van het snoeien, 23 okt; daarvoor in `js/gebied.js`, met de gebieden
  van Tiled): `T.beginOpEiland(S, zaad)` legt je land met de maker (`T.laadGemaaktGehucht`) en zet `S.wereld`, `S.dorp` en
  `S.dorpen`; `T.landVoorNieuwSpel` en `T.nieuwLandZaad` kiezen het zaad, en `T.dorpErbij(S)` zet een tweede dorp op het
  eiland. **Het lege begin** (vraag 152, stap 1b, 11 okt; Marcel: "We moeten ook zelf alles vanaf de start gaan
  bouwen", en "Rijdt nu binnen"): elk nieuw spel (sinds ronde 2 van het snoeien, stap 3, het enige begin; alleen op het
  eiland) legt de maker geen gehucht maar alleen het land (`leeg` in `js/maker.js`): het plein met `leegRand` tegels open eromheen en verder het bos van het eiland, een paar eiken, de plek
  van de marskramer waar de weg het plein raakt, en de plek van het kamp (`D.plek.kamp`). `T.zetKamp` (vanuit `T.nieuwDorp`):
  de voorraad uit de kar (`T.BEGIN_INSTELLINGEN.kar`), een tent per gezin (`T.GEBOUWEN.tent`, `tijdelijk`: zo groot als
  zijn gezin, `T.woonruimteVan` in `js/gebouwen.js`, dus geen plaats voor een nieuw gezin; zijn deur zegt hij zelf,
  `g.deur`), die van de aanvoerder met `huis: 'aanvoerder'`, en de huifkar als wezen (`e.kar`, het
  vel `huifkar`) aan de rand op de weg; in elke andere tent een gezin dat meekwam (`kampGezin` in `js/bewoners.js`). Elk
  beeld (`T.werkBeginBij`): de kar rijdt naar het plein, de gezinnen komen over de weg erachter (`p.komt`), de aanvoerder loopt
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
  wordt `'weg'`); de tent van de aanvoerder blijft zijn huis tot zijn eigen huis af is (hieronder). `T.kampTenten` zijn de tenten van de gezinnen: zolang
  er een is, zegt `T.waaromGeenGezin` `'kamp'` en komt er geen nieuw gezin. **Het bouwbereik** (1d, 11 okt): je bouwt
  binnen `bouwBereik` tegels van het plein en van elke opslag die af is (`opslag` in `T.GEBOUWEN`); `bouwBereik(D)` rekent
  per tegel de afstand uit, alleen in het vak om het plein en de opslagen (`x0`, `y0`, `b`, `h`; de wereld wordt het hele
  eiland), één keer tot er een opslag bij komt (een WeakMap op de kaart, niet in S, want het volgt uit de kaart en de
  gebouwen), `T.inBouwBereik` en `T.waaromBuitenBouwBereik` (als eerste in `T.waaromPastHetNiet`) vragen
  het, en `tekenBouwBereik` in `js/tekenen.js` tekent het als je bouwt (`T.bouwBereikVan`). Zonder `D.begin` (het oude
  begin) ligt alles erin. Let op: `S.bereik` is iets anders, waar de aanvoerder in een gevecht deze beurt kan komen. **Het
  raadhuis** (1d): `raadhuis` in `T.GEBOUWEN`, met `leeg` (alleen met `D.begin`), `eenmalig` (één keer, ook in
  aanbouw telt) en `opslag` (bereik); `nogTeBouwen` in `T.magGebouwd` en `T.plaatsGebouw` vraagt het. Zijn tekening komt uit de bouwstijl (`raadhuis`, net als de maker), nog zonder
  bouwfasen. Is hij af, dan verhuist de aanvoerder met zijn gezin erin (`verhuisDeAanvoerder`, als eerste in
  `T.verhuisUitHetKamp`): het huis krijgt `huis: 'aanvoerder'`, de tent verliest het en gaat weg, en de kar heet de ossenkar
  met het vel `ossenkar-leeg`. Rooien en meebouwen: `js/bouwen.js`, hieronder; boeren en velden: `js/boerderij.js`.
  `T.verhuisUitHetKamp` zet een gezin ook in een boerderij of een wijnboerderij die af is (één gezin per boerderij; `T.isBoerderij`), en zegt dat de man de
  boer is.
- **Sinds 20 okt** (werklijst Q, vraag 181): de kar brengt vee mee (`T.VEE_INSTELLINGEN.metDeKar`, in `T.zetKampOp` met
  `T.veeErbij`, js/vee.js), en in de demo een tent erbij voor de wacht (`bewoners: 'wacht'`, met de soorten in `wacht`; de
  `wacht` van het level, `T.zetKamp(S, D, wacht)`, levels/demojaar.js). Die tent is geen kamptent (`T.kampTenten`): zijn
  soldaten trekken niet in een hut en worden geen boer, en hij blijft staan als het kamp weggaat (`haalTentWeg`).

### js/bouwen.js: meebouwen

- `js/bouwen.js`: **meebouwen** (vraag 152, 1d, 11 okt; Marcel: "d ja", en "a1"): in het lege begin (`T.bouwenMetHanden`,
  `D.begin`) rijst een gebouw niet vanzelf op in zijn bouwtijd. `T.plaatsGebouw` maakt er een bouwplaats van
  (`T.zetBouwplaats`: `g.bouw`, `klaarOp` null), met als kavel de voet en het looppad (`T.bouwKavel`, dezelfde vraag voor
  de muis in `js/main.js` en de klik); staat daar iets, dan `wachtOpRooien`, en staat hij nog niet op de kaart
  (`tekenRooiPlaatsen` in `js/tekenen.js` laat de voet zien; `T.tikRooienDag` in `js/bos.js` laat zo'n plaats aan de
  bouwers, zonder buren). Elke ochtend na `T.verdeelHanden` kiest `T.kiesBouwers` wie bouwt (`p.bouwt`): wie kan werken,
  volwassen of jong, zonder werk en geen dagloner, in de volgorde van `D.gebouwen`, per plaats zoveel als er werk is
  (`bouwersNodig`: bij het rooien en aan een weg `perPlaats`, daarna zoveel als het bouwmateriaal dat er ligt werk geeft,
  hooguit `perPlaats`; vraag 184), de dichtsten bij eerst; net als de handen zonder te vragen of het poppetje er al is. Wie
  overblijft, draagt (`T.dragersVan`, js/kar.js). Een nieuwe bouwplaats (`T.nieuweBouwplaats`, vanuit `T.plaatsGebouw`,
  `T.legVeld` en `T.legWeg`) krijgt meteen wie vandaag nog nergens bouwt en niets draagt, niet pas de volgende ochtend
  (17 okt: op de dag van aankomst rooide niemand), en telt wat de werkdag al achter de rug had als gedaan (`vandaag`),
  zodat de bomen van de ochtend niet in één klap vallen. Zo ook `T.blijftBouwen`: een drager die hout bracht naar een
  bouwplaats waar niemand bouwt, blijft er bouwen (alleen daar, anders bouwt na een paar ritten iedereen). `werkTot(D, g,
  t)` rekent het werk tot een moment, zo vaak als je wilt. **Egaliseren** (vraag 182, 23 okt): op een land met hoogte
  (`T.moetEgaliseren`) is een gebouw `wachtOpRooien` tot de plek vrij én vlak is; na het rooien zet `egaliseer` het vlakke
  stuk neer (`g.vlak`, eerst met `deel` 0, op de gemiddelde hoogte van dat moment, js/hoogte.js), met als werk
  `egaliseerVast` plus `egaliseerPerHoogte` keer `T.egaliseerVerschil` (`B.egaliseerWerk`), en het werk (`B.tegoed`, zoals
  bij het rooien) zet de grond in `egaliseerStappen` stappen vlak; zolang is `g.egaliseert`, werken de bouwers met de
  schoffel (`e.werkt.soort` 'egaliseren', de wieder in js/sprites.js), en mogen de dragers al hout brengen. Dan
  `T.zetOpDeKaart`, dat de grond niet nog eens egaliseert (`g.vlak`). `B.gerooid`: of er iets gerooid werd (anders geen
  bericht). Getoetst in `test/begin.test.cjs` ("egaliseren"). Elke nacht doet `T.tikBouwenDag` het werk van gisteren
  (`werkAan`): eerst het rooien, tegel voor tegel (`rooiBoom`, `rooiStruik`; `T.rooiTegel` in `js/bos.js`, dus een boom
  geeft zijn hout), dan het bouwen (`gedaan` tot `werk`, de bouwtijd keer `werkPerBouwdag`); is het af, dan `klaarOp`, en
  zet `T.tikGebouwenDag` hem op klaar zoals elk gebouw. Overdag doet `T.werkBouwenBij` (vanuit `T.werkDorpBij`, na het
  vervoer) hetzelfde werk naar hoe ver de werkdag is (`g.bouw.vandaag`, dat de nacht niet nog eens doet: met of zonder beelden hetzelfde), en
  stuurt de bouwers naar een tegel naast een boom of de voet (`e.werkt` met `bouw`, de hakker met de bijl in
  `js/sprites.js`; `T.magWerken` en `T.stopWerk` uit `js/veldwerk.js`). De bouwfase volgt het werk (`v.voortgang`,
  `T.bouwFaseIndex`), het briefje zegt het (`T.bouwToestand`), en het bouwmenu zegt werkdagen in plaats van dagen. De
  getallen in `T.BOUWEN_INSTELLINGEN` (de werkbank: "Meebouwen"). Een veld (js/boerderij.js) is ook een bouwplaats:
  zijn werk is per tegel (`veldWerk`, in `T.bouwWerkVan(soort, voet)`), en na het rooien komt hij niet als gebouw op de
  kaart (geen `T.zetOpDeKaart`).
- **Waar een gebouw komt** (tot ronde 2 van het snoeien, 12 okt, in `js/verzoeken.js`): `T.plekVoor(D, soort, bij)` geeft
  de plek zo dicht mogelijk bij `bij` waar het past, op open grond of anders waar het minst te rooien is (`rooien`: de
  kavel; `T.plaatsGebouw` neemt in het lege begin zelf de kavel, `T.bouwKavel`). (Tot 16 okt kwam een put of een kapel
  waar hij de meeste huizen bereikte die er een wilden: de kringen van de wensen per huis.) De kolonist van de speeltest
  zoekt zo zijn plek.

### js/hud.js, js/main.js en js/tekenen.js: het bouwmenu, de ghost en draaien

- **Het bouwmenu, de ghost en draaien** (vraag 179, 18 okt; Marcel: "A. A1 B. B1, maar voor het volgende gebouw staat
  die weer op standaard. C. C2"). **Het menu** (`bouwmenuInhoud` in `js/hud.js`, `#bouwmenu` in `stijl.css`): boven de
  knop Build een venster op papier met een raster van plaatjes (zeven breed) en de naam eronder, vooraan de weg en
  afbreken, dan wat `T.inBouwmenu` toont. Wat iets kost, duurt en doet, en wat de heer wil, staat op het briefje bij de
  muis (`wenkVanSoort`; `js/balk.js` leest `data-naam` en `data-uitleg`, en zet het briefje boven het venster). Het
  plaatje van een gebouw is de tekening die je echt krijgt (`T.volgendeTekening`), verkleind door
  `T.sprites.voorbeeld` (`js/sprites.js`): een eigen `Image`, buiten de vellen om, zodat het spel niet alles vasthoudt wat
  je kunt bouwen; het doek is zo groot als het op het scherm komt (`PLAATJE` maal `--ui-zoom` en de pixels van het
  scherm). De weg, de akker en afbreken zijn drie tegels zandpad (`opRij`), de akker omgeploegd en afbreken met een
  kruis, in code; de wijngaard drie ranken, de markt een kraam. **De ghost** (`tekenBouwGhost` in `js/tekenen.js`, na
  de lijst, dus boven op alles): de tekening van `S.bouwHover.tekening` op 60%, en past hij niet, in het rood
  (`T.sprites.inKleur`: een eigen doek per stuk en kleur, want de kaart van `js/gl.js` kent alleen helderheid en grijs);
  de voet blijft eronder in groen of rood (`tekenBouwSpook`). De muis staat in het midden van de voet
  (`werkBouwHoverBij` in `js/main.js`); de plek blijft de hoek linksboven. **Draaien:** R (`draai`, Shift terug) zet
  `S.bouwKant` (alleen scherm), elk nieuw gebouw in de hand begint bij `'z'` (de klik in het menu en het neerzetten
  zetten hem op null), en de klik geeft de kant mee in de opdracht (`{ soort: 'bouw', ..., kant }`, `js/tik.js`).
  `T.bouwTekening(D, soort, kant)` (`js/gebouwen.js`) is de tekening met de deur naar die kant (`T.metDeurNaar`), voor de
  muis, de ghost en `T.plaatsGebouw(D, soort, x, y, kant)`, dat hem de volgende tekening van die soort maakt
  (`D.volgendeTekening`) voor `T.neemTekening`; `T.bouwKavel` neemt de tekening mee, dus de voet draait mee.
  `T.kanDraaien`: alleen wat in de bouwstijl is (`js/bouwstijl.js`); de rest zegt bij R twee seconden "This building
  cannot be turned yet" (`draaiNietTot`). Wie draait, laadt de andere kanten meteen, zodat de volgende kwartslag er
  meteen is. Toets: `test/bouwstijl.test.cjs`.

### js/boerderij.js: boeren uit het niets

- `js/boerderij.js`: **boeren uit het niets** (vraag 152, 1e, 11 okt; Marcel: "A2", "Inderdaad met b2", "Ja dat is goed.
  De bouwers pakken het op", en "De karakters zetten we even opzij"; `spel.md`, "Zo werkt het lege begin nu"). Alleen in
  het lege begin (`D.begin`). **De boer:** er zijn twee soorten boerderij (`T.isBoerderij`): de `boerderij`, met akkers, en
  de `wijnboerderij`, met wijngaarden (vraag 155, 12 okt; Marcel: "ik wil tóch een apart wijnboerderij gebouw", en "A
  gehucht, b ja, c ja"; tot dan bepaalde het eerste veld wat een boerderij was, `g.veld`, en de wijnboerderij van het
  gehucht dat er al was had haar wijngaard in haar eigen voet). Allebei zijn een thuis voor één gezin (uit het kamp,
  `T.verhuisUitHetKamp` in `js/begin.js`; is het kamp leeg, dan elke nacht een gezin uit een hut, `bemanDeBoerderijen`:
  het gezin met de minste mensen die al werk hebben), en het hoofd van dat gezin is de boer (`T.boerVan`; `T.isBoer(D, p)`;
  een wijnboer is ook een boer), zonder karakter of eigenschappen: het lot
  van de boeren (`js/boeren.js`, `T.KARAKTERS`) is weg sinds ronde 2 van het snoeien, stap 4 (12 okt). Elke nacht krijgt
  het poppetje van de boer van een `boerderij` de akkers van zijn boerderij (`T.werkDeBoerenBij`: `e.werkAkkers`, waar
  `js/akkers.js` en `js/veldwerk.js` naar kijken, zoals bij de boeren van de kaart). Een boerderij zonder akker wil geen
  handen (`T.boerderijZonderAkker`, in `T.verdeelHanden`): haar boer werkt elders of bouwt mee; een wijnboerderij vraagt
  nooit handen (`handen: 0`): haar gezin plukt in wijnmaand (`js/wijngaard.js`) en werkt het jaar door elders of bouwt mee.
  **De velden:** de akker en de wijngaard staan in `T.GEBOUWEN` met `veld` (en `leeg`; `T.isVeldSoort`), en dat `veld` zegt
  bij welke boerderij hij hoort: de akker bij `'boerderij'`, de wijngaard bij `'wijnboerderij'`. In het bouwmenu staan ze
  zodra er zo'n boerderij is (`nogTeBouwen` in `js/gebouwen.js`; ook een in aanbouw). Je trekt een rechthoek met twee
  klikken (`werkVeldHoverBij` en `klikMetVeld` in `js/main.js`, de eerste hoek in `S.veldHoek`, alleen scherm;
  `T.veldRechthoek`); de muis en de klik vragen hetzelfde, `T.waaromPastVeldNiet`: groot genoeg en niet te groot,
  binnen het bouwbereik, niet op het plein, een pad, een ander veld of iets vasts (wat te rooien is mag), een tegel vrij
  rond elk gebouw, niet te steil, en bij een boerderij van zijn soort (`T.boerderijVoorVeld`: de dichtste binnen
  `veldAfstand`; een boerderij neemt meer dan één veld). `T.legVeld` zet een bouwplaats in `D.gebouwen` (met
  `boerderij`), die de bouwers rooien en ploegen of planten (`js/bouwen.js`). Is hij af (`T.tikBoerderijenDag`, vanuit
  `T.tikGebouwenDag` na het kamp), dan gaat hij uit `D.gebouwen` en wordt hij land: een akker in `D.wereld.akkers` met
  `boerderij` en nog ongezaaid (`T.zaaiNa` zaait hem in de nazaaitijd, anders in de lente), of een wijngaard in
  `D.wereld.wijngaarden` met ranken (`T.zetRanken`, `js/wijngaard.js`); wat er laag groeide, gaat weg (`T.ruimLaagOp` in
  `js/gebouwen.js`). Tot dan tekent `tekenRooiPlaatsen` hem in goud. De getallen in `T.BOERDERIJ_INSTELLINGEN` (de
  werkbank: "Boeren uit het niets").

### gereedschap/speeltest/kolonist.js: de kolonist

- **Een speler in code voor het lege begin** (werklijst B, 1f; Marcel, 12 okt: "a1, b1, c1, d ja"). `T.kolonistDag(D,
  dag)` loopt elke dag zijn regels af en doet wat er vandaag kan: het raadhuis, een boerderij met akkers tot al
  het zaaigraan uit de kar erop past (zolang `T.isNazaaitijd`), een houthakker als het hout laag wordt, hutten tot elk
  gezin in het kamp een woning heeft, een jager als het spel zegt dat het eten niet haalt (`T.watDeWinterNietHaalt`, of
  de status honger; hooguit één per `jagerNa` dagen; Marcel, 12 okt: "a ja"), en na de oogst een wijnboerderij en daarna een
  wijngaard erbij als het eten de winter niet haalt (sinds vraag 155; eerst een wijngaard op een tweede boerderij). Voor
  C, stap 6 (Marcel, 15 okt): een schuur richting de rotsen (`rotsenBij`: de dichtste rotsen waar een steengroeve bij
  kan) en als die af is een steengroeve erbij, zodat de speeltest een tweede kar meet; en wacht hij op goud terwijl de
  marskramer er is, dan verkoopt hij hout en graan die de winter niet nodig heeft (`verkoopVoorGoud`, met
  `T.verkoop`, zoals de knop; regel 9). Hij vraagt `T.inBouwmenu`, dus hij speelt het lege begin. Hij bouwt met de handelingen van het bouwmenu: `T.plaatsGebouw` op de plek van `T.plekVoor` (open grond, of
  waar het minst te rooien is), en `T.legVeld` op de rechthoek die hij zelf zoekt (de grootste maat die past, het minst
  te rooien, het dichtst bij de boerderij). Hij geeft terug wat hij deed (`{ soort, gelukt, reden, tekst, instantie }`),
  en wat hij nog niet kan betalen met `wacht`. Het is gereedschap, geen spel: het spel laadt hem niet.
- **Twee die hem laden, met dezelfde keuzes** (a1): de speeltest (`speler.js`, sinds ronde 2 van het snoeien, stap 5, de
  enige speler) en `test/begin.test.cjs`, per dag. Zonder beelden lopen de mensen niet, dus zet de toets wie
  nog onderweg is 's nachts thuis (`komAan`), anders werkt hij nooit (p.komt, `T.werkUrenVan`).
- **Wat vastloopt** (b1) schrijft de speeltest op in `boek.eersteJaar` (`eersteJaar` in `speler.js`) en zet het in de
  tabellen "Het eerste jaar" (`samenvatting.cjs`): wanneer elk gebouw af was en hoe lang het werk stilstond, waarop hij
  wachtte, wanneer het kamp leeg was, wie er in de winter in een tent woont, wie na een dag nog onderweg is, welke
  werkplaats niet werkt zonder dat het spel zegt waarom; en het eten en het hout.

### js/treden.js: van gehucht tot dorp en marktrecht

- `js/treden.js`: **van gehucht tot dorp, en tot marktrecht** (stap 2 van de proef, vraag 53, 29 sep; sinds 2 okt uit de
  standen, vraag 90): zoals in Anno 1602 wordt het gehucht een dorp bij 20 dorpelingen (wie in een huis of een stenen
  huis woont, `T.mensenVanStand`), en krijgt het marktrecht bij 20 ambachtslieden
  (`T.TREDEN_INSTELLINGEN`, in de werkbank; de eis van de proef van 28 sep, 50 mensen met een kapel en een smidse, was tot
  11 okt een spelregel "Treden" en is weggehaald, snoeironde vraag 153; het eisformaat kan het nog). De volgorde van de treden is `T.GEBOUW_TREDEN` (`js/gebouwen.js`). `T.tredeDoel` geeft het doel voor
  het vak linksboven (js/main.js), `T.tredeMensenNodig` hoeveel mensen het nog vraagt (voor de
  raad), `T.tikTredeDag` zet `D.trede` (en die gaat nooit terug), en de heer schrijft dan (`T.ui.toonBrief(D, trede)` in
  js/brieven.js, een brief per trede). Het bouwmenu toont deze trede en de treden ervoor (`T.inBouwmenu`; de markt en de
  weverij al in een dorp, vraag 90, B); wat pas in een dorp komt, vraagt `T.tredeMinstens`, en hoe een trede heet,
  `T.tredeNaam`. Hoe je dorp heet (`D.dorpsnaam`, `T.dorpsnaam`, `T.zetDorpsnaam`), kies je bij Nieuw spel
  (js/menu.js), met een voorstel uit `T.DORPSNAMEN` (vraag 60).

### De groei van de huizen, de standen, en js/huisbriefje.js

- **Het Engels** (vraag 147): `T.STANDEN[x].naam` is een Engels woord ("villagers"), en `D.behoeften.mist`
  (js/behoeften.js) bevat Engelse zinnen met hun lidwoord ("a church", "firewood for the winter"): de balk (`js/balk.js`)
  toont ze, `js/statussen.js` vergelijkt ermee, en het jaarboek telt ze (`js/einde.js`). `T.raaktOp(wat, ...)` neemt de naam
  met lidwoord ("the wood", "the hay"). De zinnen met een stuk dat eraan hangt, zijn vol; de toets staat als [B] in de zin.
- **Doorgroeien** (`pasHuisGroeiToe` in `js/behoeften.js`; ronde 3 van het snoeien, stap 6, 16 okt): een huis waar iemand
  woont, telt een dag (`g.groeiDagen`) als het dorp tevreden genoeg is (`huisGroeiDrempel`: eten, warmte in de winter) en
  gisteren genoeg soorten at voor wat het huis wordt (`groeiSoorten`, `T.groeiSoortenVoor`: een hut 3, een huis 4, een
  stenen huis 5; `D.behoeften.afwisseling`); anders begint het opnieuw. Na `huisGroeiDagen` groeit het door als de
  bouwstof er is (`groeiBouwstof`, `T.groeiKosten`: een huis hout, een stenen huis en een woontoren steen; zonder wacht het,
  `g.wachtOpBouwstof`, en zegt het dorp het één keer), een woontoren pas met marktrecht (`wordtVanaf`). Het rijst op in de
  laatste bouwfasen terwijl zijn mensen erin blijven wonen (alleen het voorwerp is `inAanbouw`, `groeiVanafFase`; G, vraag
  114). Staat er alleen iets te rooien waar het groter wordt, dan rooit het gezin dat eerst (`T.groeiRooiPlan`,
  `T.rooiOmTeGroeien` in `js/bos.js`, `g.groeitNaRooien`), en anders zegt het briefje waarom (`T.waaromGroeitHetNiet`;
  vraag 130). De herberg groeit mee met het dorp (`laatMeegroeien`, voor planken). Een gezin trekt weg als het hele dorp
  onder de vertrekdrempel zakt (`pasVertrekToe`).
- **De standen** (`T.STANDEN`, `T.standVan`, `T.standOnder`, `T.mensenVanStand`, `T.mensenPerHuis` in `js/treden.js`): wie
  waar woont (een hut keuters, een huis dorpelingen, een stenen huis of woontoren ambachtslieden, een boerderij boeren;
  het raadhuis geen). Ze tellen voor de treden, de belasting (`T.belastbaar` en `belastingNaarStand` in
  `js/wetten.js`: wie hoger woont, betaalt meer), de kleren (`T.klerenVan`, `js/bewoners.js`) en wat er kan branden
  (`js/brand.js`).
- `js/huisbriefje.js`: **het briefje bij een huis** (2c, vraag 100; in de stijl van de schrijftafel, vraag 98, C): staat
  de muis op een huis met mensen, dan zegt het wie er woont, zijn stand, en hoe ver het is met doorgroeien, uit
  `T.huisToestand` (`js/behoeften.js`). `Spel.debug.groei()` zegt hetzelfde voor elk huis.
- **Tot 16 okt** (`js/wensen.js`, in git): elk huis had een stand die iets wilde (goederen als bier, vlees of vis, brood,
  laken en wijn, de hoogste stand eerst, en plekken in een kring: een put, een kapel, de herberg, een markt), zijn eigen
  tevredenheid, en groeide door als het een maand alles had; de raad zei wat de huizen misten, een teken hing bij de deur,
  en de kring stond op de kaart. Dat ging eruit met de keuze voor de afwisseling (`ontwerp/snoeien.md`, ronde 3).

### js/gebouwbriefje.js: het briefje van een gebouw

- `js/gebouwbriefje.js` (werklijst vraag 156, 14 okt; Marcel: "1a1, 1b ja"): een klik op een gebouw (`T.handelingVerkennen`
  in `js/verkennen.js` geeft `doe: T.kiesGebouw`) zet `S.gekozen` (alleen scherm, `T.schermVelden`), en
  `T.ui.werkGebouwbriefjeBij` (in `js/huisbriefje.js`, want dat bestand is alleen scherm en laadt niet in de toetsen;
  elk beeld, `js/main.js`, en vier keer per seconde opnieuw opgemaakt) legt het briefje rechts
  onder de datum, zolang je rondloopt (een gesprek, een venster of een gevecht legt het even weg). Een klik ergens anders
  of Esc legt het weg; is het gebouw afgebroken, dan ook. Het spel loopt door: het is geen venster van `T.ui.openVenster`
  (dat zet de tijd stil), maar papier zoals het huisbriefje (`#gebouwbriefje` in `stijl.css`).
- **De inhoud is een regel zonder scherm**, `T.gebouwBriefje(D, g)` → `{ kop, doet, delen: [{ titel, regels }] }`
  (`test/gebouwbriefje.test.cjs`): in aanbouw alleen `T.gebouwToestand`; anders wie er woont, wie er werkt (n van m
  handen, bij naam), wat het maakt (op volle kracht uit `T.maaktUit` en `maakt.in`, vandaag uit `g.werkte`, de laatste
  `gemaaktDagen` en dit jaar uit `T.gemaaktDoor`, de velden van een boerderij uit `w.akkers` en `w.wijngaarden`, en
  `T.GEBOUW_ERBIJ`), wat het tegenhoudt (`g.stilWant`, de handen, `g.uren.onderweg`, het werktempo, `T.visserWater`,
  `g.tekort`, `g.vol`; in de volgorde van de nachtlus), wat helpt (het gereedschap, `T.gereedschapDekking`), wat erbij
  ligt (`g.in`, `g.stapel`), en bij een opslag wat zijn kar doet (`T.karTekst`). Een ander bestand zet er een eigen deel
  bij met `T.GEBOUW_DELEN[soort](D, g)`, en een regel kan knoppen hebben (`{ tekst, knoppen: [{ tekst, uitleg, kan, doe
  }] }`, zoals een handeling): het wachthuis (`js/soldaten.js`). Op het scherm draagt een knop waar hij staat (deel,
  regel, knop), en een klik doet de `doe` uit het briefje dat er ligt (`js/huisbriefje.js`).
- **Wat het rekent, komt uit de regels zelf, met één weg:** het werktempo is `T.werkVanAfwisseling(D)` in
  `js/behoeften.js`, dat de nachtlus ook gebruikt (een leeg bord telt als één soort); wat een gebouw maakte, telt `T.telGemaakt` (in
  `g.gemaakt`, bewaard: `{ dagen: [{ dag, waren }], jaar, ditJaar }`), en dat roept `T.opStapel` (`js/kar.js`) aan, waar
  alles langs gaat wat een gebouw maakt (de nachtlus, de oogst, de wijn). Wat de bouwers rooien, telt niet:
  `T.hakBoom` (`js/bos.js`) geeft `{ gerooid: true }` mee.

### js/paden.js: de paadjes en de lantaarns

- `js/paden.js`: **de paadjes en de lantaarns** (vraag 108, b en d, 3 okt): van elke deur een paadje naar de weg, of naar
  het paadje van een buur (`T.aangelegdNet`, uit de kaart en de gebouwen, niet in S: na `T.kaartVeranderd` opnieuw, met
  `T.kaartVersie` in `js/wereld.js`; wat het per tegel nakijkt, de rasters `weg` en `mag`, alleen op de plekken die
  veranderden, `T.kaartPlekkenSinds`, 13 okt: 10 ms naar 2); waar mensen lopen, slijt het gras (`T.telStap` vanuit `js/anim.js`, een dier telt
  niet; elke nacht `T.tikPadenDag`, in S als `w.paden`), en waar niemand meer loopt, groeit het dicht (niet op een veld,
  en niet op een brug van het eiland of zijn landhoofden: `magSlijten`; Marcel, 17 okt: "op een brug kan geen looppaadje
  ontstaan"). Hoe het eruitziet:
  `T.zandHoeken` en `T.hoekenMetPaden` (de hoeken van de grond, zoals `T.sprites.grondHoeken`), in de buffer van de grond
  (`js/tekenen.js`). Een lantaarn bij de deur van wat `lantaarn` heeft in `T.GEBOUWEN` (de kapel, de herberg, de markt,
  het wachthuis) en op de kruisingen (`T.zetLantaarns`; op een lantaarn bouw je niet). De ramen van een huis waar iemand
  thuis is, branden 's avonds (`T.lichtBronnen` in `js/zien.js`). De spelregel "Paadjes"; de getallen in
  `T.PADEN_INSTELLINGEN`. Een pad loopt nog niet sneller. `T.isSpoor`: een paadje, of gras dat slijt waar elke dag gelopen
  wordt; het hek om de schapen laat er een hekje open (`js/beesten.js`).

### js/markt.js: de markt op het plein

- `js/markt.js`: **de markt op het plein, die meegroeit** (vraag 110, d, en vraag 127, 6 okt; Marcel: "Grotere stad =
  grotere markt"; de marktplek sinds 12 okt, ronde 2 van het snoeien, stap 6: "Plein krijgt plaatsen"): een markt is
  geen gebouw met een voet, maar kramen op de **marktplek** van het plein: twee rijen tegenover elkaar met een looppad
  ertussen en een mand naast elke kraam. De maker kiest die plek als hij het land legt (`T.zoekMarktPlek(w)`, vanuit
  `T.laadGemaaktGehucht` in `js/maker.js`: het grootste open stuk buiten het open midden, `T.openMidden` met
  `vanHetMidden`, tot 15 okt de kring van het feest, het kamp, de eiken en
  weg van de heer, dat niemand tegenhoudt), en zet hem in de plek van het dorp (`D.plek.markt`, `{ rijen }`; bewaard met het dorp).
  `T.marktBlok(D)` geeft die rijen leeg terug, `T.marktTegels(w)` en `T.opDeMarktPlek(w, x, y)` de tegels (de rijen en het
  looppad). Een gebouw blijft er `vrij` tegels vandaan (`T.waaromNietBijDeMarkt`, vanuit `T.waaromPastHetNiet` in
  `js/gebouwen.js`), de schandpaal komt er niet op (`vrijOpHetPlein` in `js/heer.js`), en `js/tekenen.js` laat hem
  oplichten als het bouwmenu open is (`tekenMarktPlek`, en `tekenBouwSpook` met de markt in de hand). Hij komt zoals elk
  gebouw (uit het bouwmenu): `T.plekVoor`, `T.waaromPastHetNiet` en `T.plaatsGebouw` vragen het hier (`T.marktPlek`,
  `T.waaromGeenMarktOpHetPlein`, `T.zetMarktOpHetPlein`). Elke nacht (`T.tikMarktDag`) komt er een kraam bij tot er een
  tegel toonbank per 10 mensen is (`T.tegelsNodig`), eerst op de marktplek (`g.blok`), dan langs de weg vanaf het plein
  (`T.straatPlek`, de marktstraat); en een kraam ligt vol als het dorp zijn waar heeft (`T.heeftWaar`, `waren`), anders
  leeg. De markt staat in `D.gebouwen` met `opHetPlein`, `kramen`, `manden` en `blok` (voorwerpen `kraam`, met `waar` en
  `leeg`, en `mand`, met `wat`), zonder voet, op het midden van het plein (`T.marktMidden`). Hij kost wat
  `T.GEBOUWEN.markt.kosten` zegt (8 hout en 6 goud). De kramen per waar en de manden: `gereedschap/pixelart/marktkraam.cjs`
  (`T.sprites.kraam(waar, leeg, richting)`, `T.sprites.mand(naam)`).

### js/herberg.js: de herberg

- `js/herberg.js`: **de herberg** (werklijst punt 2, 27 sep): wie er 's avonds heen gaat
  (`T.herbergGasten`: naar seizoen en looptijd, en niet meer dan er bier is), het anker voor de
  avond (`T.herbergAnker`, dat `T.dagAnker` vraagt), de afrekening elke nacht (`T.tikHerbergDag`: bier op,
  en wie er was, maakt het dorp tevredener), en de lantaarn 's avonds (`T.herbergLicht`). Het brouwen is
  gewoon werk van het gebouw (`T.GEBOUWEN.herberg.maakt`), tot er genoeg ligt, zoals elke werkplaats die iets omzet
  (`T.maaktTot` in `js/gebouwen.js`, vraag 91, b), en de gasten drinken wat er ligt (van 3 tot 16 okt hield ze bier apart
  voor de huizen die het wilden, vraag 102, b; de wensen zijn weg). De mensen
  bouwen hem zelf, en wie er werkt, is de waard (sinds ronde 2 van het snoeien, stap 6; tot dan woonde de herbergierster
  erin): hij staat 's avonds achter de tap (`T.herbergAnker`), en met hem
  praat je over wie er zat (het gesprek `waard`, `js/verkennen.js`). De marskramer logeert er (`T.logiesAnker`). 's Avonds branden de ramen van de herberg,
  met de gasten erachter als schimmen: de huizenbouwer geeft per huis door waar de ramen zitten (`ramen`
  in `tegels.json`), en `js/tekenen.js` tekent ze zo dat wat ervoor staat ze afdekt (`brandendeRamen`). Er kan een
  tweede herberg komen (je bouwt hem zelf; tot ronde 2 van het snoeien vroeg een ondernemer erom): `T.herbergenVan` geeft ze allemaal, `T.herbergVan` de eerste
  (waar de marskramer logeert), en wie 's avonds gaat, gaat naar de dichtste
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
  wezen, voorlaag, zodat iemand tot zijn middel in het graan staat); een boer hoort bij zijn akker(s) via `huis`, dezelfde
  id op de boer als op de akker. **Het graan is pas binnen in de schuur**
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
  dwalen (`T.werkVeldwerkBij`, vanuit `js/main.js` en `T.werkDorpBij`; het loopt zodra er een akker of een wijngaard is). Wat hij doet, staat op zijn poppetje (`e.werkt`,
  `e.draagt`, `e.veldwerk`); wie werkt, dwaalt niet, praat niet en gaat niet opzij, en `js/sprites.js` geeft hem het vel
  van zijn werk (`WERKFIGUREN`: de zaaier, de wieder, de sprokkelaar, en de hakker met de bijl in het bos; een boerin die van een
  vrouw, `werkVelVan`; wie naast zijn werk staat, kijkt ernaar, `e.werkt.op`). De schaft houdt hij op de akker. Zijn boerin en
  grote kinderen helpen bij het zaaien en de oogst (`T.helpAnker`, voor `T.dagAnker`; een anker dat
  meeloopt, zonder veld: `veld: false`). Net zo rooit het hoofd van een huis dat wil doorgroeien, en hakt de
  houthakker aan zijn boom (`js/bos.js`). De regels veranderen niet; de getallen in `T.VELDWERK_INSTELLINGEN`. Tot ronde 2 van het snoeien (12 okt)
  ontgon een boer ook heide of bos (`js/ontginnen.js`, `veld.ontginning`): dat is weg; wat bleef, is het rooien met de bijl
  (`rooiTegels`), dat de houthakker en een gezin dat rooit gebruiken.

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
  `v.wordt`; wat hij kapt en inplant, blijft bos: `T.isBos` met `ookJong`, vraag 129, f; voor een heel vak in één keer
  `T.bosInVak`, met een optelsom, want per tegel telt `T.isBos` met het jonge bos de 25 tegels eromheen: zo kijken de
  wolven en de herten elke nacht, en dat was het zwaarste van de nacht, 13 okt; sinds 18 okt onthoudt de kaart die lijst
  per vak tot er in het vak of op zijn rand van twee tegels iets verandert, `T.kaartPlekkenSinds`, in een WeakMap en niet
  in `S`, en komt wat er op elke tegel staat in één keer uit `T.voorwerpOpVak`: de tik van middernacht van 13 naar 3 ms,
  `snelheid.md`, H), die in een jaar of twee via een
  jonge boom een boom worden (`T.tikBosDag`; de tekeningen `boompje`, `jongeEik`, `jongeDen`, `jongeBerk` in het vel van
  de bomen). Staat er binnen zijn bereik geen boom meer, dan staat hij stil (`T.waaromHaktHijNiet`) en wil hij geen handen
  (`T.houthakkerZonderBoom`, in `T.verdeelHanden`): zijn hand werkt elders tot er weer een boom staat; de raad zegt het
  (`geenBoom`), en een nieuwe houthakker vraagt het dorp pas als het hout de winter niet haalt (vraag 129, e). Hij komt
  alleen bij minstens 30 bomen binnen tien tegels (`bij` in `T.GEBOUWEN`; vraag 129, b). Zijn poppetje hakt aan zijn
  boom en brengt het hout in bundels naar de schuur (`hakHout` in `js/veldwerk.js`). **De zager** (vraag 168, 15 okt;
  Marcel: "Ik wil wel dat je iemand ziet werken"): de eerste hand van een zagerij die vandaag zaagt (`g.werkte`), staat
  op de tegel voor haar deur en zaagt aan de zaagbok, die daar binnen ligt (`zagerijWaarHijZaagt` en `zaag`;
  `e.werkt.soort` 'zagen', met `op` de tegel binnen, naast de deur, en `tot` een groot getal zolang hij zaagt); het vel is
  de zager of de zaagster (`WERKFIGUREN` in `js/sprites.js`; `werkfiguren.cjs`, `zager`, met de spanzaag). De tweede
  hand werkt zoals elke werkplaats, bij de deur. **Rooien:** een bouwplaats van het lege begin op een stuk
  waar nog iets te rooien staat (een boom, een stronk, een struik: `T.teRooienOp`, `T.watTeRooien`), wacht erop
  (`g.wachtOpRooien`, met `g.kavel`), nog niet op de kaart (`T.bouwGebouw` zet het er pas met `T.zetOpDeKaart` op); dat
  rooien de bouwers (`js/bouwen.js`). Een huis dat wil doorgroeien (`g.groeitNaRooien`, vraag 130) rooit het gezin zelf:
  het hoofd (`T.rooitHij`) hakt en rooit met de bijl (`T.werkVeldwerkBij` in `js/veldwerk.js`; wie
  van zijn gezin geen werk heeft, helpt, `T.helpAnker`) en werkt zolang nergens, en na `rooiDagen` rooien de buren de rest
  (`T.tikRooienDag`). Tot ronde 2 van het snoeien (12 okt) rooide ook een gezin zijn erf (`js/erven.js`) en wie een
  werkplaats vroeg zijn plek (`js/verzoeken.js`). Een stuk in het bos van de heer (`T.inHetBosVanDeHeer`: minstens `bosVanDeHeer`
  bomen, in `T.BOS_INSTELLINGEN`) is van de heer. Een appelboom is van iemand, behalve waar het huis van een gezin groter
  wordt: die kapt het gezin zelf, als geen vorm zonder hem kan (`T.isEigenBoom`, `v.teKappen`; vraag 130, a2).

### js/beesten.js: het wild

- `js/beesten.js`: **het wild in het bos** (vraag 116, stap 1, 7 okt; Marcel: "Rode ogen uit het duister", en "a ja, b
  ja, c ja"): roedels wolven en groepjes herten, zoveel als het bos groot is, uit het nummer van het eiland en van het
  stuk land (`T.zetWildBij`, als het stuk opengaat; hieronder, "Per stuk land"), elk met een plek
  diep in het bos (`G.thuis`) en plekken aan de bosrand (`G.rand`). Overdag rusten ze thuis; de wolven lopen 's nachts
  langs de rand, de herten grazen er in de schemering (`T.beestenWillen`). Komt er een mens dichtbij (voor een hert ook een
  wolf), dan gaan ze weg (`G.weg`, `G.vluchtNaar`; `mensBij` kijkt alleen naar wie in het vak om de groep staat, zo
  groot als hoe schuw ze zijn, want hij loopt op 30× elke tik voor elke groep). Een groep is een ding dat de dieren delen
  (`e.groep`, zoals `e.praatje`): alleen de leider zoekt een weg, de anderen lopen zijn weg af (`G.spoor`), en in
  `T.ontwijk` ruilt de leider met wie van zijn groep in de weg staat; een volger zoekt om zijn eigen groep geen omweg,
  maar wacht even of is er (en wie bij een stilstaande leider binnen twee tegels staat, of naast een dier dat er al bij
  staat, is er: `erBij`; 18 okt, `snelheid.md`, G1: die omweg was er tussen de bomen bijna nooit, en was de helft van
  de tik). Een dier heeft `e.beest` (geen `e.dier`: dat is vee), en `e.rust` en `e.rent` voor js/sprites.js (liggen, grazen, rennen). Een wolf begint geen gevecht;
  je mannen kunnen hem aanvallen, en dan vecht zijn roedel terug (`T.wolvenVechten`, `G.vecht`; js/gevecht.js); 's nachts lichten zijn ogen rood op (`tekenOgen` in js/tekenen.js,
  met `beelden/ogen.js` uit `gereedschap/pixelart/ogen.cjs`). Het hert komt uit `gereedschap/pixelart/wild.cjs`. **Het
  leven in het bos** (stap 2a; elke nacht `T.tikBeestenDag`, vanuit `T.tikGebouwenDag` na het bos): eerst de herten, en
  een roedel alleen waar hij herten kan halen; in de winter krijgt een roedel honger (`G.honger`) en jaagt hij op de
  dichtste herten (`jaag`, `G.gevangen`); elke lente jongen tot zes (`jongen`), en dan splitst de groep (`splits`): de
  helft zoekt een eigen thuis of trekt weg (`G.trektWeg`: `T.werkBeestenBij` haalt hem van de kaart, niet midden in een
  gevecht); wie honger leed, krijgt geen jongen (`G.leedOp`); een thuis dat niet meer diep in het bos ligt, verhuist of de
  groep trekt weg (`blijfOfVerhuis`; wat de houthakker inplant, telt als bos; het bos en hoe diep, over het vak om
  het dorp: `bosKaart`, met `T.bosInVak` uit `js/bos.js`, en de diepte onthoudt hij zolang dat bos hetzelfde is).
  **De dreiging** (stap 2b): wie aan het werk
  een roedel ziet, rent naar huis (`schrik`; `T.blijftThuis` in js/bewoners.js, `p.thuisTot`: hij werkt niet, en
  `T.dagAnker` houdt hem binnen), en zijn werkplaats maakte die dag de helft; een roedel met honger is in het donker stout
  (`T.wolvenStout`) en zoekt prooi (`kiesProoi`: een schaap, of wie alleen in het donker loopt, de aanvoerder ook), en slaat toe
  (`slaToe`): een schaap (`T.verliesDier` in js/vee.js, met een bericht met de plek; tot 15 okt het voorval "wolven",
  met een jacht of een hek, weg in ronde 3 van het snoeien), een mens
  (`bijt`: gewond, `p.gewond`, of dood), en een man (de aanvoerder, een soldaat) vecht met hem (een gevecht). Tot vraag
  170, stap 5 bleef de roedel aan de rand van de lantaarn van de schout. De status "Wolven" (`T.wolvenBijHetDorp`, in `T.OORZAKEN`) en de raad. De spelregel
  "Beesten" (aan, zonder doden of uit); de getallen in `T.BEESTEN_INSTELLINGEN`. **De jager** (stap 3a): de helft van zijn vlees
  is klein wild, de rest komt uit de herten in zijn bereik (`T.wildVanJager`, `g.wild`; `T.watDeJagerSchiet` en
  `T.jagerJaagde` vanuit `T.tikGebouwenDag`), twee per groepje laat hij staan, en een roedel van meer dan drie maakt hij
  kleiner; vindt hij geen hert (`g.zonderHerten`, `T.jagersZonderHerten`), dan vraagt het dorp geen nieuwe jager en de heer
  van hem geen vlees. Zijn poppetje loert in het bos (`jaag` in `js/veldwerk.js`). **Het hol** (`zetHol`, `T.holVan`):
  elke roedel heeft er een op de kaart, naast zijn thuis, dat meegaat als hij verhuist (`gereedschap/pixelart/hol.cjs`).
  **Om hulp roepen** (3c, `G.aanval`, `e.roeptOmHulp`): wie de wolven aanvallen, roept, de mannen die het horen komen
  (`moetNaar` met `hulp`), een buur jaagt ze weg, een man van je (`hulp.man`) vecht met ze, en na een kwartier bijten ze.
  Na een gevecht gaat een roedel terug naar zijn hol (`T.wolvenNaHetGevecht`). De jacht te voet (3b) en het hek om de
  meent (3d, `zetHek`) zijn weg sinds 15 okt (ronde 3 van het snoeien): je stuurt je soldaten op de wolven af.
- **Het wild is van de wereld** (vraag 170, stap 6a2, a; Marcel, 16 okt: "Het wild is van iedereen", en "A1"; getoetst in
  `test/meer-dorpen.test.cjs`): een groep en zijn dieren hebben geen dorp (geen `G.dorp`, geen `e.dorp`; `T.hoortBij` is
  streng). De wereld werkt ze bij, één keer per kaart (js/tik.js): elke tik `T.werkBeestenBij(S, w)`, en elke nacht
  `T.tikBeestenDag(S, w, dag)` via `T.werkBeestenDagBij` (`w.beestenDag`), per stuk land: de groepen die er wonen delen hun
  bos (`G.bos = { vak, midden, zaad }`: het vak van het stuk, het plein van het dorp in de buurt of null, en het nummer van
  het eiland), en een ander thuis en de herten van een roedel tellen ook over de grens van het stuk.
  **Per stuk land** (stuk b; Marcel: "D1 e1"; getoetst in `test/beesten.test.cjs`): `T.zetWildBij(S, w)`, elke tik ook als
  er niet rondgelopen wordt, geeft elk stuk dat open ging (`w.open`) zijn wild, op volgorde van zijn nummer, en onthoudt
  het (`w.wildStukken`); `zetWildInStuk` neemt hoeveel en welke uit het nummer van het eiland en van het stuk (een
  dobbelsteen per stuk: zoveel als het bos geeft, `bosPerRoedel` en `bosPerKudde`, afgerond met die dobbelsteen, per stuk
  hooguit `maxRoedels` en `maxKuddes`), waar uit het land zoals het dan is (het bos per tegel met het jonge bos, want
  `T.isBos` zonder telt alleen in `T.kaartVak`; wat er gebouwd is, `bebouwd`, van elk dorp; de groepen in de buurt). De
  wolven kijken 's nachts naar het dorp in de buurt (`dorpBij`, het dichtste plein binnen 100 tegels; `pleinBij`), anders
  staan ze bij hun hol. Met de spelregel uit gaan het wild en `w.wildStukken` weg, en weer aan krijgt elk open stuk het
  opnieuw. Een groep zonder iemand van een dorp binnen `rustVerder` tegels rust (`G.ver`, om de twee seconden gevraagd):
  zijn leider zoekt geen weg. Snel genoeg om een stuk te laten opengaan (gemeten 16 okt: hooguit zo'n 40 ms per stuk):
  een thuis zoeken probeert `proeven` plekken, wat een plek mag (een weg naar het plein, herten in de buurt) wordt pas
  gevraagd als hij aan de beurt is (`mag`, `bijHetMidden`), `randGoed` onthoudt zijn antwoord per tegel bij de bosKaart,
  en `randVan` vraagt de stappen van het thuis één keer (`T.bereik`, js/pad.js) in plaats van een weg per plek: A* telt
  schuin als recht (1,001), dus het is dezelfde lengte, en dezelfde keuze. Wat het wild van een dorp wil weten, vraagt het
  aan het dorp van wie het aangaat: `schrik` aan het dorp van wie schrikt (`mens.dorp`), `slaToe`, `roeptOmHulp`,
  `werkAanvalBij` en `bijt` aan dat van de prooi, `T.wolvenVechten(D, G, tegen)` zet `G.tegen = D` (het gevecht is van dat
  dorp; `T.wolvenNaHetGevecht(D)` stuurt de roedels die tegen D vochten naar huis), en `kiesProoi` kijkt naar het licht en
  de mensen van elk dorp op de kaart. Het genezen van wie gebeten werd, blijft in het dorp (`T.geneesVanDeWolven`, vanuit
  `T.tikGebouwenDag`). `T.beestenOp(w)` zijn alle groepen op een kaart (de jager, het hol), `T.beestenVan(D)` die bij D
  (binnen `dorpBij` van zijn plein: de status, de raad, `Spel.debug.beesten`); het dorp in de buurt zegt het ook als zijn
  wild wegtrekt (`dorpBij`). **A1:** een groep heeft een eigen dobbelsteen (`G.lot`, uit zijn
  zaad), waarmee zijn wolven in een gevecht slaan (js/gevecht.js); de rest kwam al uit vaste worpen van zijn zaad
  (`T.lotVanDier`). Zo verandert het wild bij het ene dorp niet door een gevecht bij het andere.

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
  en sneeuw als vlakjes over het beeld op de klok van het scherm (`tekenNeerslag`: wat per druppel vaststaat één keer
  uitgerekend, `lotjes`, en met de videokaart alle vlakjes in één keer, `vlakjes` in `js/gl.js`; 18 okt, vraag 178), en de
  droge beek als zandpad in de
  grond (`T.hoekenDroog`, zoals een paadje) met barsten en keien (`tekenDrogeBeek`). Op een natte dag zaait niemand
  (`nietInDeRegen` in `T.VELDEN_INSTELLINGEN`, js/akkers.js: `w.zaaienNaRegen`, en het veldwerk), en na een droog jaar
  (`D.weer.vorigJaar`) neemt de marskramer in de lente meer zaaigraan mee (`naDroogte` in js/handel.js). Sneeuw blijft
  liggen (`D.weer.sneeuw`, 0 tot 1, `sneeuwLaag`), en `js/tekenen.js` legt hem per tegel op de grond, de weides en de kale
  akkers (`tekenSneeuwOp`, in de buffer van de grond: plukjes die dichter worden, `sneeuwDrempel` en `sneeuwRuis`); op de daken
  van de huizen de laag die erbij past (`T.dakSneeuwLaag`, `dakSneeuw`: een beetje, half of dik, uit dezelfde render als het
  huis, `tegels/daksneeuw/`, `T.sprites.daksneeuw`; vraag 144, 4b). Het weer van vandaag staat bij de
  datum (`T.ui.toonKalender`). De spelregel "Het weer" (met droogte, zonder, of altijd zon); de getallen in
  `T.WEER_INSTELLINGEN`.

### js/wijngaard.js: de wijngaard

- `js/wijngaard.js`: **de wijngaard van de wijnboerderij** (vraag 136, 8 okt; Marcel: "Dat je de boeren ziet plukken,
  volle en lege ranken", en "Alles telt pas als het binnen is"): een wijngaard hoort bij een wijnboerderij
  (`T.GEBOUWEN.wijnboerderij`, `T.isWijnboerderij`: een gewoon huis van 5 bij 4 met een gezin, `gebouwen/wijnhuis`; sinds
  vraag 155, 12 okt; tot dan was het een huis met zijn wijngaard in één voet van 10 bij 8, en daarna een wijngaard bij
  een gewone boerderij). Je legt hem als veld naast haar (`js/boerderij.js`, `D.wereld.wijngaarden`, `T.wijngaardOp`: daar
  bouw je niet); de ranken staan erin als voorwerpen (`wijnrank`, `v.boerderij` is de wijnboerderij, `T.zetRanken` op de
  rechthoek van het veld, `T.rankenVan`). Een rank staat erbij naar de maand
  (`T.rankStand`: kaal, blad, vol, of leeg als hij geplukt is, `v.geplukt`; het vel `beelden/wijnrank.png` uit
  `gereedschap/pixelart/wijnrank.cjs`). In wijnmaand (`alleenIn`, `T.isPluktijd`) plukt het gezin dat er woont (`g.plukt`,
  elke nacht `T.tikWijngaardDag`; zolang werkt het nergens anders) rank voor rank met een mand (`pluk` in
  `js/veldwerk.js`, `e.mand`, de plukker of plukster), en pas als de mand in het huis is, is de wijn binnen
  (`T.wijnBinnen`, `wijnPerRank`). `T.werkVeldwerkBij` loopt ook als er alleen een wijngaard is en geen akker (tot 12 okt
  ging het alleen met een akker op de kaart: een dorp met alleen een wijnboerderij plukte nooit; gevonden in de browser).
  **Het dorp kijkt vooruit** (`T.wijnNaDePluk`, met `T.haaltDeWinter`): haalt wat er bij de pluk nog ligt plus de pluk het
  jaar niet (de ranken die nog hangen en die van een wijngaard in aanleg, min wat de heer wil)? Is er dan een
  wijnboerderij, dan zegt de raad dat er een wijngaard bij moet (`wijn` in `T.RADEN`, `js/raad.js`); is er geen, dan noemt
  de afwisseling haar (`T.watHelptAanAfwisseling`). Wat het dorp ervan eet, is zijn deel van de maaltijd (`T.maaltijdDeel`;
  tot 16 okt dronken de ambachtslieden er ook van, een wens). De getallen in `T.WIJNGAARD_INSTELLINGEN`.

## Voorraad en handel

### js/kar.js: de stapels, de dragers en de ossenkar

- **Wie stilligt, draagt** (24 okt; Marcel: "A", na "de houthakker zit vol en wacht op carriers, maar die komen niet"):
  de nacht (`T.tikGebouwenDag`, stap 6 in `js/gebouwen.js`) geeft een werkplaats `g.draagtZelf` als hij vandaag niets
  kan: `'stapel'` als er geen dag werk meer op zijn stapel past (dan maakt hij ook niet meer wat er nog op paste), of
  `'niets'` als hij niets heeft om mee te werken (`g.tekort`; tot 24 okt viel dat door naar de stapel, die dan ten
  onrechte "vol" zei). Wie er werkt, staat die dag in `T.dragersVan` (`draagtVoorZijnWerk`, `js/bouwen.js`), hakt of
  jaagt niet (`js/veldwerk.js`), en zegt bij de muis wat hij draagt (`js/bewoners.js`); bij een volle stapel haalt hij
  eerst die (`kiesRit`). Zonder dit droeg niemand meer zodra iedereen werk had. Getoetst in `test/kar.test.cjs`; de
  kolonist, wiens stapels niet vol raken, speelt precies als ervoor.
- **De dragers** (vraag 184, 23 okt; Marcel: "3a1", "3b1", "Eén stuk, van alles"): sinds het kamp op is
  (`T.metVervoer(D)`: `D.begin.kamp` niet meer 'onderweg') wordt er gedragen; het begin heeft geen kar meer (de huifkar
  blijft in het kamp staan, en `T.deVoorraad` is ernaast tot het raadhuis af is; dan gaat hij op in het raadhuis,
  `T.laadDeHuifkarUit` in js/begin.js, in de nachtlus na het eten (`T.eetVandaag`, js/gebouwen.js): het wezen is weg,
  `D.begin.kar` null, en wat gedragen wordt uit de voorraad ligt met `T.legLosseStapel` waar hij stond; het proefdorp
  haalt die stapel meteen binnen). Wie draagt, zegt `T.dragersVan(D)` in
  `js/bouwen.js` (wie kan meebouwen maar niet bouwt, niet schuilt en niet thuisblijft). Een drager is een vervoerder zoals
  een kar, met zijn eigen regelstaat op de bewoner, `p.vervoer` (`{ drager, bewoner, tx, ty, lading, rit, klok, rust }`),
  want zonder beelden heeft een bewoner geen poppetje; met beelden loopt `p.wezen` erachteraan (`loopMee`) en staat het
  aan het eind van elk stuk waar de regel zegt (`staVervoerderOp`). Hij neemt `perDrager` (1) mee, loopt in het tempo van
  zijn leeftijd (`T.BEWONERS_INSTELLINGEN`) zonder voordeel van een weg, laadt en lost bij de dichtste opslag
  (`opslagBij`), en bedient elk gebouw; een kar alleen die bij zijn opslag, als er meer zijn (`verantwoordelijk`). Zolang hij
  een rit heeft, is zijn poppetje bezig (`e.werkt.soort` 'vervoer', `zetBezig`: geen dwalen, geen praatje) en zegt
  `e.draagt` wat je ziet (`DRAAGT`: hout als bundel, graan als schoof, de rest in een mand; js/sprites.js). **Eén klok**
  (`werkVervoerBij`): de karren en de dragers worden samen bijgewerkt, steeds de stap van wie het eerst iets te doen heeft
  (`volgendMoment`, `stap`), en wie niets vindt, kijkt over `rust` (een kwartier) weer; zo maakt het niet uit of het elk
  beeld gebeurt (`T.werkKarBij`) of één keer per nacht (`T.tikKarDag`): met of zonder beelden hetzelfde, ook met meer
  vervoerders tegelijk. Wie (weer) gaat dragen, begint op `D.vervoerKlok` (tot waar het vervoer de vorige keer was
  bijgewerkt) bij zijn deur; wie stopt, krijgt `rust` (`rustWieNietDraagt`), en wat hij nog bij zich had, gaat 's nachts de
  voorraad in. Na het afladen bij een bouwplaats waar niemand bouwt, blijft een drager er bouwen (`T.blijftBouwen`, js/bouwen.js).
  Bij de muis `T.dragerTekst` (vanuit `T.overBewonerTekst`, js/bewoners.js). In `T.werkDorpBij` gaat het vervoer vóór het
  bouwen (js/dorp.js), zodat wie blijft bouwen in hetzelfde beeld al bouwt. Getoetst in `test/kar.test.cjs` en
  `test/begin.test.cjs`. Gemeten (23 okt, het jaar van de kolonist in Node, vijf eilanden): een nacht die een hele dag
  dragen inhaalt, kost gemiddeld 9 à 10 ms (op `main` zonder dragers 5 à 8); de lijst van vervoerders gaat één keer per
  ronde mee (`alle`), anders was het 15 tot 41 ms.
- `js/kar.js`: **de stapels en de ossenkar** (werklijst C, 14 okt; Marcel: "A2, B2, C1, D2, E2"). Wat een gebouw maakt, gaat
  via `T.opStapel(D, g, wat, n)`: met vervoer (`T.metVervoer`) en een waar die niet in `nietVervoerd` staat (het goud;
  `T.gaatMetVervoer`) op `g.stapel` (een veld legt het bij zijn boerderij, `g.boerderij`), anders, of zonder `g`,
  meteen in de voorraad. Zo ook de oogst (`T.haalOogstBinnen`, `T.haalSchovenBinnen(D, graan, boerderij)`, met
  `e.vrachtVoor` voor wat iemand 's nachts nog droeg, en het hooi per boerderij in `js/akkers.js`) en de wijn
  (`T.wijnBinnen(D, ranken, g)`); wat het vee geeft, heeft geen `g`. `T.maaktTot` (de nachtlus) en `T.etenVoorDeWinter`
  tellen wat op de stapels ligt mee; het dorp eet alleen uit de voorraad. Zo komen erin: de
  nachtlus van de werkplaatsen (`js/gebouwen.js`, stap 6, die ook niet meer maakt dan `T.ruimteOpStapel` toelaat; vol is
  `stilWant`), en `T.hakBoom(D, x, y, bij)` in `js/bos.js` (de bouwers via `T.rooiTegel(D, t, g)` in `js/bouwen.js`, een
  huis dat doorgroeit in `js/behoeften.js` en `js/veldwerk.js`). Wie zonder `bij` hakt, brengt het meteen binnen.
- **De kar** is een wezen (`e.kar`, in `w.wezens`); `T.karAanHetWerk` zet hem in `D.karren` (die van een schuur;
  `T.zetKampOp`, `js/begin.js`, zet de lading van de huifkar in de voorraad). Een rit is een regel op de kalender
  (`e.rit`: `fase` heen, laden, terug, lossen; `tot` in dagen; `naar` het gebouw; `e.klok`): `werkVervoerBij` werkt hem
  bij tot een moment (op één klok met de dragers, hierboven), vanuit `T.werkKarBij` (elk beeld, in `T.werkDorpBij`; geeft
  het wezen zijn weg met `T.geefRoute`) en `T.tikKarDag` (elke nacht als eerste in `T.tikGebouwenDag`, tot middernacht).
  Aan het eind van een stuk staat het wezen op `rit.doel` (`staOp`), dus met of zonder beelden komt er hetzelfde uit. Een rit begint alleen in de werktijd
  (`T.dagindeling`), naar de grootste stapel (`kiesStapel`; zonder weg laat hij hem een dag liggen, `g.karKanNietTot`), en
  lost bij zijn opslag (zijn schuur). Het vel
  (`T.zetKarVel`): de huifkar blijft de huifkar; de ossenkar is leeg of draagt wat hij het meest heeft (`LADING_VEL`:
  `ossenkar-hout`, `-stenen`, `-spullen`, anders `-zakken`). De kar neemt geen zaaigraan mee (`beschikbaar`). Bij de muis
  `T.karTekst`; getekend: `T.stapelsOp` en `T.stapelPlek` (naast de deur, met op een bouwplaats het hout dat er al is
  maar nog niet verbouwd), met `T.sprites.stapelDelen` (`js/sprites.js`: een hoop hout of steen, of een tot drie manden
  van de markt, `IN_DE_MAND`).
- **De schuur** (stap 4): `T.GEBOUWEN.schuur` (`opslag`, `kar`, `leeg`). `T.geefSchurenEenKar` (in `T.tikGebouwenDag`, na de
  gebouwen die af kwamen) zet naast zijn deur een kar (`T.maakKar`, ook voor de huifkar van het begin, die niet rijdt) met
  `e.thuis` en `g.kar`. `thuisVan(D, e)`: waar een kar laadt en lost (zijn schuur, anders `T.deVoorraad`);
  `verantwoordelijk(D, g)`: als er meer karren zijn, de kar met zijn opslag het dichtst bij g, en alleen die neemt g in
  `kiesRit`. Een kar zonder werk rijdt naar zijn opslag. Het bereik komt vanzelf uit `opslag` (`T.inBouwBereik`,
  `js/begin.js`). Getallen in `T.KAR_INSTELLINGEN` (de werkbank: "Carriers and the ox cart"); getoetst in `test/kar.test.cjs`.
- **Bouwen met wat gebracht wordt** (stap 2, B2): `T.plaatsGebouw` betaalt alleen `T.bouwKosten(D, kosten).nu` (wat niet
  gedragen wordt) en zet de rest met `T.zetBouwNodig` in `g.bouw.nodig`; wat er is, staat in `g.bouw.er` (wat de dragers
  en de kar brachten, en `T.opStapel` vult eerst de bouwplaats). `T.bouwMateriaalDeel(g)` zegt hoe ver de bouwers mogen (`werkAan` in `js/bouwen.js` geeft
  terug wat bleef liggen, zodat overdag het werk na de levering alsnog gebeurt, en met of zonder beelden hetzelfde uitkomt);
  `T.bouwMateriaalDeel` stuurt ook hoeveel bouwers er komen (`bouwersNodig` in `js/bouwen.js`). Een rit heeft een `plan`: 'halen' (heen, laden,
  terug, lossen) of 'brengen' (opslag, inladen, brengen, afladen); `kiesRit` brengt eerst (bouwplaatsen in volgorde, dan
  werkplaatsen tot `voorraadIn`, met `vraag` min wat al `onderweg` is; een kar als de helft op is, een drager voor één
  stuk), dan halen (min wat anderen er al komen halen, `alGehaald`), en anders een halve vracht. Een
  werkplaats verwerkt via `T.verwerkVoorraad` en `T.verwerk` (uit `g.in`). `T.nogTeBrengen(D, wat)`: wat de bouwplaatsen
  nog vragen (de winter van het brandhout in `js/behoeften.js`, de kolonist). `T.brengMeteen(D, g)`: alsof de kar het
  bracht (het proefdorp, `bouwAf`, en de toetsen). Een losse stapel (`stapel` in `T.GEBOUWEN`, van een afgebroken gebouw, `js/afbreken.js`)
  ligt op zijn eigen tegel (`T.stapelPlek`; neergelegd met `T.legLosseStapel`, ook de inhoud van de huifkar), en is weg
  als hij leeg gehaald is; er komt niets meer bij, dus die halen ze ook onder `minstens` leeg. Van een stapel nemen gaat
  altijd met `T.neemVanStapel(D, g, ruimte)` (een vervoerder die laadt, en rovers die er roven, vraag 185): een stuk van
  de wapenmaker alleen heel, en een lege losse stapel is weg.

### js/wegen.js: de wegen die jij legt

- `js/wegen.js`: **de wegen** (werklijst C, stap 5, 14 okt; Marcel: "a ja, b ja, c1, d ja, ... f ja"). Een gelegde weg is
  een tegelnummer in `w.wegen` (een Set, in S); `T.opPad` (`js/wereld.js`) telt hem mee zoals de weg van de kaart en het
  plein, dus er wordt niet op gebouwd, de paadjes van de deuren sluiten erop aan, en `T.zandHoeken` (`js/paden.js`) tekent
  hem als zand. `T.planWeg(D, a, b)` is de ene vraag voor de muis en de klik: `T.trekWeg` zoekt recht en haaks (Dijkstra
  over tegel en richting, met een kleine prijs per bocht, een stuk weg dat er al ligt voor `alWegKost`), in het vak om a
  en b met een rand van 8; per tegel `T.waaromGeenWegOp`. `T.legWeg` zet een weg in aanleg in `D.wegwerk`
  (`{ soort: 'weg', plekken, af, bouw }`; een eigenschap heet nooit `tegels`, dat is de kaart, `test/tegels.test.cjs`); in
  `js/bouwen.js` is hij een bouwplaats na de gebouwen, en `T.werkAanWeg` legt hem tegel voor tegel (eerst rooien, het
  hout meteen de voorraad in, dan `werkPerTegel`). `T.wegKomtOp` (een Set per weg, in een WeakMap) houdt gebouwen,
  velden en bos van een weg in aanleg af (`T.waaromNietOpDezeGrond`). **De kar:** `T.karKostOp(w, x, y)` is wat een stap
  kost (op een weg `1 / karSneller`): `T.zoekRoute(..., { kar: true })` (`js/lopen.js`) geeft het aan A* als `kost` met
  `minKost` voor de schatting (`js/pad.js`; dan telt schuin √2), `js/kar.js` rekent er de duur van een rit mee, en
  `js/anim.js` de snelheid van het wezen, zodat regel en beeld hetzelfde zeggen. De mensen lopen niet sneller (c1). Getallen
  in `T.WEGEN_INSTELLINGEN` (de werkbank: "Roads"); getoetst in `test/wegen.test.cjs`.

### js/afbreken.js: afbreken

- `js/afbreken.js`: **afbreken** (werklijst C, stap 5, e; Marcel, 14 okt: "Wegen en gebouwen, nu", en "ze lopen los, met
  een melding dat er huizen nodig zijn"). `T.handelingAfbreken(D, x, y)` geeft `{ tekst, kan, doe, plekken }` voor de muis
  en de klik (`js/main.js`, met `S.bouwSoort` 'afbreken'): een gelegde weg (`T.haalWegWeg`), een weg in aanleg
  (`T.stopWegwerk`), of een gebouw (`T.breekAf`). Niet: het raadhuis, een tent, een losse stapel, een veld op
  zichzelf, de weg van de kaart. `T.breekAf`: de bewoners `T.wordtDakloos` (`js/bewoners.js`: `p.huis` null, `e.thuis` op
  `T.dakloosPlek`, het plein; `T.deurVanBewoner` is hun deur; ze slapen buiten, `T.dagAnker` in `js/dag.js`, en trekken in
  de eerste woning met plaats, `T.verhuisUitHetKamp` in `js/begin.js`; de status `dakloos` in `js/statussen.js`), de
  velden van een boerderij en de ranken mee, de kar van een schuur mee (`D.karren`, `w.wezens`), de lantaarn bij de deur,
  de kramen van de markt, het voorwerp van de kaart en zijn voet weer `vloer`; wat erbij lag (stapel, `bouw.er` dat nog
  niet verbouwd was, `g.in`, de lading van de kar) wordt een losse stapel; dan `T.verdeelHanden` (wie er werkte, is vrij)
  en `T.werkDeBoerenBij`. Getoetst in `test/afbreken.test.cjs`.

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
  (`heer`: de brief weg en de gunst van de heer omlaag; de kans is `basis`) of de rovers (`T.bodeGevaar`: de winter en het donker; tot c2 van vraag 170 ook de bende van het dorp; `onderschept` in
  `D.bode`). Tegen de rovers vechten wie meegaan (`T.bodeKracht`, `T.bodeSlaatAf`: een veteraan dubbel, wapens), en hoe het
  afloopt, zegt `T.bodeOnderweg` (afgeslagen of beroofd, wie sneuvelt, wie gewond is, `p.gewond`, en een rover
  die valt). Het gebeurt op je eigen kaart (Marcel: "alles onze eigen kaart"; alleen buiten beeld als er al rovers
  zijn): de aanval met soort 'hinderlaag' in js/rovers.js
  (`R.aanval`, `D.bode.hinderlaag`): bij de uitgang houden ze hem aan (`e.aangehouden`, in `T.dagAnker`), stuur je mannen erheen,
  dan vechten ze (`T.naGevecht`: `T.bodeWegVrij`), anders loopt het na `hinderlaag.uren` af (`T.bodeAangehouden`). Elke nacht (`T.tikBodeDag`, na
  `T.tikHandelDag`): in het donker dragen ze een lantaarn (`T.bodeDragers`, met `T.draagtLicht` in `T.lichtBronnen`). Zijn ze er, dan komt de
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
  veranderde (antwoorden met `doe.gunst`, de bode, de heervaart), verandert nu de gunst. Onder 20 een waarschuwing (de brief `waarschuwing` in `js/brieven.js`, en de raad), op 0 weg (`T.ambtKwijt` met waarom, of `D.einde` met reden 'verjaagd'), maar altijd eerst
  de waarschuwing. De twee gezichten in de balk:
  `T.ui.toonBazen` (`js/hud.js`). De spelregel "Twee bazen"; de getallen in `T.BAZEN_INSTELLINGEN`. `T.bazenStemming`
  geeft een naam waar de regels op letten (`'boos'`, `js/balk.js`); `T.bazenTekst` zegt hem in het Engels (*angry*).
  Zo ook de straffen van Sint-Maarten: `'boete'` in de regels, `T.STRAF_TOON` (`js/heer.js`) voor wat de speler leest.

### js/grillen.js: de grillen van de heer

- `js/grillen.js`: **elke maand een gril van de heer in een brief** (vraag 106, stap 2): `T.GRILLEN` (veertien, elk met
  zijn brief, antwoorden met `doe` zoals een voorval, en `stil` voor wie niet antwoordt), `T.tikGrillenDag` (op de
  twaalfde, niet in wijnmaand en slachtmaand, als er geen andere brief van de heer wacht), de vraag die wacht
  (`D.grillen.vraag`, `T.grilNu`), de knoppen (`T.grilKeuzes`, met hun prijs, `prijsVan`) en het antwoord
  (`T.beantwoordGril`); de brief is soort `gril` in `js/brieven.js`.

### js/heervaart.js: de heervaart

- `js/heervaart.js`: **de heervaart** (vraag 60, A en B, 29 sep): in een dorp vraagt de heer op 1 hooimaand een man per
  tien zielen voor zijn oorlog, of goud (`T.vraagHeervaart`, `T.heervaartKeuzes` voor de knoppen onder zijn brief).
  Sturen (`T.stuurHeervaart`): wie gaat (`T.weerbareMannen` in `js/bewoners.js`), blijft bewoner, telt mee en eet,
  maar werkt nergens en loopt de weg af (`T.stuurWeg`, `p.weg`); op 1 herfstmaand komt hij terug (`T.komtTerug`), een
  op de vier niet, en wie terugkomt, is veteraan. Vrijkopen (`T.koopHeervaartAf`) kost goud en gunst van de heer (`gunstPerGoud`, min wat het hem waard is). Wie niet
  kiest, stuurt ze na een week. De getallen in `T.HEERVAART_INSTELLINGEN` (in de werkbank), de spelregel "Heervaart".

### js/wetten.js en js/wettenmenu.js: de wetten

- `js/wetten.js`: **de wetten** (stap 3 van de proef, vraag 54, 29 sep; eerst keuren genoemd): een menu zoals in
  Democracy 3 (`js/wettenmenu.js`, onder `W` en als knop in de balk), met het rantsoen en de belasting (sinds 15 okt,
  ronde 3 van het snoeien; vreemden welkom en houtkap in het bos van de heer zijn weg). Wat een wet doet, staat als getallen per stand in één blok
  (`T.WETTEN_INSTELLINGEN`, in de werkbank); de regels vragen het aan `T.wetFactor` en `T.wetSom`: wat een mens eet
  (`T.etenPerMens` in `js/behoeften.js`, één plek voor het rantsoen), de tevredenheid (`T.wettenTevredenheid`) en de belasting
  (`T.tikWettenDag`). Wat een
  kaart in het menu zegt, komt uit dezelfde getallen (`T.watDeWetDoet`). Wat je aannam, staat in `D.wetten`; zonder
  staat elke wet op zijn standaard, en speelt het spel zoals ervoor. De standen (`'krap'`, `'aangenomen'`) zijn namen
  waar de regels op letten; wat de speler van een stand ziet, staat in `T.WETTEN[id].toon` (vraag 147: *short, normal,
  generous*).

### js/raad.js: de raad onder het doel

- `js/raad.js`: **de raad onder het doel** (stap 5 van de proef, vraag 58, 29 sep; de eerste weken, vraag 47,
  herschreven): één regel onder het doel linksboven die zegt wat nu tussen jou en een dorp staat, met de toets erbij
  (`[B]` wordt een toets): de eerste uit `T.RADEN` die nu geldt (`T.raadNu`). Hij vraagt het aan de regels zelf: of er
  een gezin komt aan de groei (`T.waaromGeenGezin` en `T.volgendeGezinDag` in `js/gebouwen.js`), het hout en het eten
  aan de winter, welke huizen op bouwstof wachten om door te groeien (`T.bouwstofRaad`, met wie het maakt, `T.maaktGoed`,
  vóór het doel; tot 16 okt ook wat de huizen wilden, de wensen), en wat je mist voor
  wat het doel vraagt aan de treden (`T.doelGebouwen`), met waar het vandaan komt. Is er een wijnboerderij en haalt de wijn
  het jaar na de pluk niet (`T.wijnNaDePluk`, `js/wijngaard.js`), dan zegt hij dat er een wijngaard bij moet (`wijn`: na de
  huizen, voor het doel; vraag 155). Na de laatste trede is er geen doel
  meer (het winnen is op 11 okt weggehaald, `js/einde.js`), dus telt hij geen mensen meer. Haalt het eten de winter niet, dan zegt hij wat helpt (`T.watHelptAanEten`, vraag
  133, b: een visser per dertig mensen, een jager als er herten zijn, meer weide, zaaigraan
  kopen), en vraagt het dorp het gebouw dat hij noemt. Na een voorjaar met honger maakt een boer zelf een veld weide
  (`weideErbij` in `T.boerenKiezenVelden`, `D.behoeften.voorjaarsHonger`). (Tot 16 okt zei hij vanaf de herfst ook of
  vis en vlees de winter haalden voor de huizen die ze wilden, met het zout erbij, vraag 132, B; dat ging met de wensen
  weg, `ontwerp/opmerkingen.md`.) Uit te zetten in de spelregels ("Raad").

### js/debugvenster.js: het debugvenster

- `js/debugvenster.js` (werklijst 169; Marcel, 15 okt: "misschien letter "D" en dan debug menu op laten komen. +50 voor
  bouwmaterialen etc."): een venster onder D bij het rondlopen (`T.ui.meldVenster` met `toets: 'd'`; in een gevecht
  blijft D een deur sluiten), dat alleen regels aanroept die er al zijn: +50 van `T.DEBUG_INSTELLINGEN.waren` (stammen,
  planken, steen, goud) met `T.wijzigVoorraad`; een gezin met `T.gezinKomt`; de bouwplaatsen af met `T.proefdorp.bouwAf`
  en `T.komtKlaar` (`js/gebouwen.js`, de stap "een gebouw komt klaar" uit de nachtlus, zodat de nacht en het venster
  dezelfde weg gaan; wie erin trekt, volgt de nacht erna); en de marskramer met `T.debug.marskramer`. Alleen scherm
  (`ALLEEN_SCHERM` in `test/laad.cjs`); de regels die het aanroept, hebben hun eigen toetsen.
- **De tabbladen** (23 okt; Marcel: "Ik kan al die losse dingen niet onthouden", "bouw maar"): `TABS()` is één lijst
  met per tabblad zijn knoppen (`{ id, tekst, doe }`; `doe(S, D, dag)` geeft wat er onder de knoppen komt) en eventueel
  `staat` (de regels bovenaan, wat je anders in de console vroeg). Een knop roept een regel aan die er is, of een
  `Spel.debug`-opdracht (`js/main.js`) en zegt zelf in het Engels wat er gebeurde. De tijd springt met `S.kalender.dag`
  (`spring`); `T.werkGebouwenBij` doet daarna elke nacht ertussen apart (240 nachten kosten zo'n seconde). Een nieuw spel
  (Demo) doet wat New game in het menu doet, met het level `demojaar` of zonder (`T.nieuwSpel(zaad, level)`, voor dit spel):
  op het land van nu, `T.zetDorpsnaam`, de brief `benoeming`. De overval van de demo morgen (`overvalMorgen`) is
  `T.roversKomen` met de rovers van de trigger `overval` van het demojaar, en zet die trigger in het spel uit. De
  tabbladen hebben de opmaak van Settings (`:is(#instellingen, #debug) .tab` in `stijl.css`). Het open tabblad is alleen
  scherm (`tab`). Getallen: `T.DEBUG_INSTELLINGEN` (`vee`, `gezin`, `rovers`, `uren`, `dagen`).
- **Aan tot de Steam-versie** (Marcel, 15 okt), ook in de proefversie: `T.DEBUG_INSTELLINGEN.aan` gaat voor Steam op
  false (`ontwerp/verpakken.md`), en dan meldt het venster zich niet aan.
- **De spelregels om te proberen** (vraag 172): in het spel lees je de spelregels alleen (ze liggen vast sinds het begin);
  de knop *Game rules and the workbench* opent ze hier in de stand `'debug'` (`T.ui.openSpelregels(S, 'debug')`, js/hud.js),
  te kiezen midden in een spel, met de werkbank. Die staat alleen bij een stand waarin je kiest en zolang dit venster aan is.
- **Het slot van de demo** (20 okt; Marcel: "dat we de gebouwen ook aan en uit kunnen zetten om te testen"): een knop zet
  in dit spel `D.dicht` op wat het demojaar dicht heeft, of leeg (`T.isDicht`, js/gebouwen.js), ook buiten de demo. Voor
  de demo gaat het debugvenster er echt uit (`verpakken.md`).
- **De maat van de gebouwen, een proef** (20 okt; werklijst R, vraag 183, 2a1; Marcel: "ik twijfel of de huizen 'te
  groot' zijn"): een knop wisselt `T.TEKENEN_INSTELLINGEN.gebouwMaat` door `T.DEBUG_INSTELLINGEN.gebouwMaten` (1, 0,8 en
  0,65). `tekenOpMaat` in `js/tekenen.js` tekent een gebouw (en de sneeuw op zijn dak) dan zo veel kleiner, rond het
  midden van zijn voet (`v.beslaat`); alleen voor het oog: de voet, de deur, het looppad, de rook uit de schoorsteen en
  wat de muis raakt, blijven op hun plek. Gaat eruit als Marcel gekozen heeft.

### js/statussen.js: de statussen

- `js/statussen.js`: **de statussen van het dorp** (vraag 77, stap 2, 9 okt; tot 15 okt in `js/voorvallen.js`, verhuisd
  in ronde 3 van het snoeien): `T.OORZAKEN` (honger, eentonig, dakloos, kou, vol, wolven, droogte, koorts, brandgevaar,
  onvrede) zegt per status of hij speelt en waarom (`speelt`), met een tweede niveau (`erger`: hongersnood, strenge kou,
  overvol, onrust, ernstige droogte) en wat helpt (`helpt`); `T.oorzaakNu` en `T.oorzakenNu` geven `niveau` en `naam`
  mee. Elke nacht onthoudt het dorp sinds wanneer (`T.tikStatussenDag`, `D.statussen`), voor de kaartjes naast het doel
  linksboven (`T.statussenVan`, `T.ui.toonStatussen` in js/hud.js, `#statussen`). De getallen (de grens van onvrede,
  onrust en hongersnood) in `T.STATUSSEN_INSTELLINGEN`; toetsen in `test/statussen.test.cjs`.

### js/versiering.js: de bomen op het plein

- `js/versiering.js`: **de meiboom en de kerstboom op het plein** (15 okt, ronde 3 van het snoeien; Marcel: "Blijven
  als versiering"; tot dan `js/feesten.js`, de feesten die met een voorval kwamen, in git): elke nacht
  (`T.tikVersieringDag`, vanuit `T.tikGebouwenDag`) staat de boom van zijn tijd op het open midden van het plein
  (`T.openMidden` in `js/markt.js`, `D.versiering.boom`): de meiboom in bloeimaand, de kerstboom van 20 wintermaand tot
  en met 6 louwmaand, ook in een spel dat in die tijd begint. De kaarsjes van de kerstboom geven 's avonds licht
  (`T.versieringLicht`, soort `kaars` in `T.lichtBronnen`). De data en het licht in `T.VERSIERING_INSTELLINGEN`;
  `Spel.debug.versiering()`; toetsen in `test/versiering.test.cjs`.

### js/brand.js: de brand

- `js/brand.js`: **de brand** (vraag 144, 3, 9 okt; Marcel: "Ziekte en brand als status is ook goed. We hebben dan nog
  wel vuur nodig en huizen die 'afgefikt' zijn als art. Dan kunnen ze weer worden opgebouwd"): brandgevaar is een status
  (`T.brandgevaarNiveau`: in de droogte, groot in een ernstige droogte of een vol dorp; `brandgevaar` in `T.OORZAKEN`), en
  alleen dan komt er een brand (sinds 15 okt, ronde 3 van het snoeien; tot dan het voorval `brand`): elke nacht met `kans`
  (`T.tikBrandDag`, `D.brandKomt`: de dag met het uur tussen de twee van `uur`), en op dat uur brandt een woonhuis
  (`T.werkBrandBij` vanuit `T.werkDorpBij`, geloot met `T.vastLot`; `g.brand`, op het voorwerp `v.brand`), met een
  bericht met de plek. De buren blussen altijd: na `blusUren` is het uit en blijft het meestal staan (`T.redKans`), of
  het is puin. Het gezin woont
  bij de buren, en na `puinDagen` bouwt het zijn huis weer op met hout (`T.tikBrandDag`, `T.herbouwHout`), in de
  bouwfasen zoals een huis dat doorgroeit (`v.inAanbouw` met `vanFase`). Het beeld in `js/tekenen.js`: vuurtongen over
  het dak, vonken en een gloed (`tekenVuur`, na de nacht), rook (`tekenRook`), licht (`T.brandLicht` in
  `T.lichtBronnen`), en de fasen van het afbranden (`T.brandfaseVan`, vraag 144: terwijl het brandt geschroeid en het dak
  dat valt, dan binnengestort, ingestort en opgeruimd; uit het huis zelf gesneden, `node gereedschap/pixelart/ruines.cjs
  spel`, `tegels/brandfasen/`, `T.sprites.brandfase`; zonder fasen de verkoolde bouwfase `puinFase`, `puinVan`), een paar
  dagen smeulend (`T.smeult`, sintels). Bij groot brandgevaar slaat het vuur soms over op het dichtste huis ernaast als het
  eerste afbrandt (`T.slaatOver`, `overslaan`; één keer, `g.brand.overgeslagen`). De getallen in `T.BRAND_INSTELLINGEN`;
  `Spel.debug.brand('nu')`.

### js/koorts.js: de koorts

- `js/koorts.js`: **de koorts** (vraag 144, 3): ze begint zelf in de kou of in een vol dorp (sinds 15 okt, ronde 3 van
  het snoeien; tot dan het voorval `ziekte`): elke nacht met `kans`, in de winter maal `winter` (`T.tikKoortsDag`,
  `T.beginKoorts`, met een bericht met de plek): iemand en zijn gezin zijn ziek (`p.ziek`, de dag dat hij beter is, en
  `p.thuisTot`: in bed), elke nacht steekt een zieke soms een ander aan (`besmet`, maal `vol` en `kou`), een
  enkele keer sterft iemand (`sterft` per leeftijd), en wie het had, krijgt het deze keer niet weer (`D.koorts.gehad`).
  De status `koorts` in `T.OORZAKEN` (`T.koortsNiveau`: Koorts, en Epidemie als een tiende ziek is). Naast de deur van
  een huis met een zieke staat de pestbos (`T.pestbossen`, alleen beeld; `gereedschap/pixelart/pestbos.cjs`). De getallen
  in `T.KOORTS_INSTELLINGEN`; `Spel.debug.koorts('nu')`.

### js/rovers.js: de rovers en de militie

- `js/rovers.js`: **de rovers en de militie** (stap 4 van de proef, vraag 55, 29 sep): wie wegtrekt, gaat naar het
  dichtste roverskamp (`T.wordtRover` vanuit `js/bewoners.js`; in een level met een rand alleen een kamp dat erbinnen kan
  staan, `stukkenVanKamp`, en anders vertrekt hij gewoon; hieronder; tot c2 kwam hij met de bende van het dorp,
  `D.rovers.bende`, terug), en uit dat kamp komt de overval (c3, hieronder; `T.tikRoversDag` zet hem een dag van
  tevoren). Een aanval (`D.rovers.aanval`, `T.werkRoversBij`): langs hun weg naar een akker, op het uur dat het zaad zegt (`aanvalsUur`, in `aanval.uur`; met `nachtKans` 's nachts,
  vraag 170, stap 4), twee uur roven (graan uit de voorraad, en soms de akker kapot: `T.vertrapAkker` in
  `js/akkers.js`), en weer weg. Er komt niemand vanzelf (vraag 170, stap 2): het bericht zegt hoe je je soldaten stuurt,
  en het gevecht is in real time (`js/gevecht.js`); wie vecht (`e.doelwit`), laat `T.werkRoversBij` met rust. Wie valt,
  is dood: een rover van een kamp is uit zijn bende (`T.roverVerslagen`), een soldaat of een dorpeling een mond minder (`T.sneuvelt`,
  via `T.wijzigBevolking` met wie het is, en waartegen), en wie het overleeft, geneest na een nacht (`genees`); de doden
  (ook een wolf) begraaft `begraaf` de volgende dag. De laatste rover die valt, maakt de aanval af (`T.naGevecht`). De
  getallen in `T.ROVERS_INSTELLINGEN` (in de werkbank). (`T.roepOp` en `e.opgeroepen`, wie met de schout meeliep, zijn
  sinds vraag 170, stap 5 weg.)
- **Het doel van een overval** (vraag 185, 23 okt; Marcel: "stapels ja"): `kiesDoel` kiest een akker (`aanval.veld`, het
  nummer onder `T.veldenVan`), en is er geen, de grootste stapel (`aanval.stapel`, het gebouw, en `aanval.stapelPlek`, de
  tegel), met de ingang erbij; `doelVan` en `isEr` (op de akker, of naast de stapel) gelden voor allebei, en `roofStapel`
  neemt met `T.neemVanStapel` (`js/kar.js`) `stapelPerRover` per man. Rovers horen bij een dorp dat vanaf niets begon
  (`D.begin`) of akkers heeft (`heeftRovers`), dus ook voor de eerste akker.
- **De overval van de demo** (vraag 185, 23 okt; Marcel: 4a3, 4b1, 4c1, "overdag, aankondiging ja"; sinds 24 okt een
  trigger van het demojaar, `levels/demojaar.js`): een dorp met `D.rovers.overvallen === false` krijgt van
  `T.tikRoversDag` geen overvallen op het rooster. De trigger `overval` gaat af op een dag uit het zaad (`S.scenario.lot.overval`) en roept
  `T.roversKomen(D, { aantal, aangekondigd: true })`: een aanval met `aangekondigd: true` voor morgen, op een uur van
  `overdagUur` (overdag, tot `aangekondigd.voorDonker` uur voor zonsondergang). `aangekondigd.vooraf` uur ervoor kiest
  `meld` het doel en de ingang, zegt het met de plek, en zet de tijd op 1× (`aanval.gemeld`); is er niets te roven, dan
  schuift de aanval een dag op (met het uur van die dag, zoals de nacht erna eerst opnieuw plande). De trigger gaat één
  keer af. De raad zegt niet dat ze terugkomen waar geen overvallen op het rooster komen of het wachthuis dicht is (`js/raad.js`).
- **De roverskampen** (vraag 170, stap 6a2, c1, 17 okt; Marcel: "V2 G2 P1 B1", "M1"): waar ze liggen, komt uit het eiland
  (`E.kampen`, `js/eiland.js`, `legKampen`, met de tentplekken en hun deur); wat een kamp in een spel is, staat op de
  kaart (`w.kampen`, bewaard, vanaf de eerste tik alle kampen van het eiland, `kampenVan`; de velden staan bovenaan het
  stuk in `js/rovers.js`; in c3 en c4 de buit en of het verslagen is). `T.zetRoverskampenBij(S, w)`, elke tik één keer per
  kaart vóór het wild (`T.wereldTik`, `js/tik.js`): is elk stuk dat de open plek van een kamp raakt open (`w.open`), dan
  staat het er (`K.staat`): het vuur (`soort: 'kampvuur'`), de tenten (`soort: 'tent'`, `vorm: 'tent-rover'`, een per
  `manPerTent` van de bende, op de plekken die het eiland gaf; `K.tenten` telt ze) en de mannen; vuur en tenten dragen
  `kamp` (het nummer), en zo onderscheidt de rest ze van het
  kamp van het lege begin (`js/tekenen.js` kiest zo de stand van het vuur, `js/begin.js` haalt alleen het vuur op zijn
  eigen plek weg). `T.roverskampVuur(dag)` (brandt in het donker, smeult overdag) en `T.roverskampenLicht(w, dag)` (voor
  `T.lichtBronnen`, `js/zien.js`). Op de minikaart een rode stip zodra je dorp de plek kent (`js/balk.js`, de lus over
  `E.plekken`). `Spel.debug.kampen()`; `test/kampen.test.cjs`.
- **De bende van een kamp** (vraag 170, stap 6a2, c2, 17 okt; Marcel: "N1", "D1", "H2"): `K.bende` (`{ id, naam, vel,
  uit, plek }`), twee man van buiten bij het begin (`vanBuiten`: een voornaam uit `T.VOORNAMEN` en een uiterlijk, uit de
  dobbelsteen van het kamp, `K.lot`), elk jaar van het spel een erbij tot `kampMeest` (`tikKampenDag`, elke nacht via
  `w.kampenDag`, zoals `w.beestenDag`), en wie wegtrekt, gaat naar het kamp het dichtst bij het plein van zijn dorp, ook
  boven de vier (H2; `uit` is zijn dorp). De mannen zijn rovers zonder dorp (`e.rover`, `e.kamp`, `e.lid`; `T.kampVan`,
  `T.lidVan`): `T.werkKampenBij(S, w)`, elke tik één keer per kaart na het zetten (`js/tik.js`), zet wie erbij kwam aan de
  rand van de open plek op het paadje (`aankomst`), houdt de tenten bij (`zetTenten`), en stuurt ze: overdag naar hun
  plek om het vuur (`plekVan`, uit de dobbelsteen, niet op een tentplek of het paadje; `e.kijkt` naar het vuur), 's nachts
  hun tent in (`e.binnen`, `e.deur`, zoals een dorpeling; de tegel voor de opening is `deur` op de tentplek), op de wacht
  na (N1). Heeft een van hen een doel (`e.doelwit`, js/gevecht.js), dan slaapt niemand tot `wakkerUren` erna (`K.wakker`).
  Is er niemand van een dorp binnen `rustVerder` (om de twee seconden, `K.keekVer`), dan staat `e.ver`, en kijkt hij in
  `T.werkGevechtVanDeWereldBij` niet om zich heen: gemeten op 17 okt kosten drie kampen van vier man zo 0,007 ms per tik
  (de tik 0,108 ms). In een gevecht gooit hij met de dobbelsteen van zijn kamp (`worp` in js/gevecht.js); wie valt, is
  uit zijn bende (`T.roverVerslagen`); wie het overleeft, heeft na een nacht al zijn leven. Een dorpeling vlucht alleen
  voor een vijand in het land van zijn dorp (`vlucht` in js/gevecht.js, `T.dorpVak`), zodat een kamp ver weg niemand
  binnen houdt. Bij de muis zijn naam (`T.handelingVerkennen`, js/verkennen.js). D1: de bende van een dorp
  (`D.rovers.bende`, `bendeOp`, de overval van soort `'bende'`) is weg, en de bode telt haar niet meer (js/bode.js);
  tot c3 was een overval wild.
- **De overval komt uit een kamp** (vraag 170, c3, 27 okt; Marcel: "c3 A1 B1 C1, demo mee"; `test/rovers.test.cjs`,
  `kampen`, `bode`): `T.tikRoversDag` zet de aanval een dag van tevoren (`soort: 'overval'`, `D.rovers.overvalOp`, de
  getallen `overval…` in de werkbank). Elke tik in de fase `wacht`: `plan` kiest het kamp (`kampVoor`: het dichtst bij
  het plein met mannen thuis, `thuis`, binnen de rand, `kampenBinnen`, met een grove weg, `T.groveWeg` in `js/lopen.js`)
  en de reis (`reisUren`, de weg op de pas van een rover tot `ingangAfstand` van het plein); vanaf het uur min de reis
  kiest `kiesDoel` de akker of stapel en de ingang (`ingangVan`, B1: het eerste vak van de grove weg naar het doel binnen
  `ingangAfstand` waar een begaanbare tegel ligt vanwaar ze erheen kunnen), en `vertrek` zet wie gaat op pad (`A.leden`,
  `lid.opPad = { terug: null }`; A1: tot `aantal`, met `aanvullen`, een level of het debugvenster, komen er van buiten
  bij, `vanBuiten`). Fase `onderweg`: op het uur zet `opDeKaart` ze bij de ingang (`maakRover(D, K, lid, plek)`: `e.dorp`
  het dorp, `e.kamp` en `e.lid` hun kamp), en haalt wie nog in zijn kamp liep weg. `roof` deelt de buit (`deelBuit`,
  `e.buit`); valt er een, dan legt `T.roverVerslagen` zijn deel als losse stapel (`T.legLosseStapel`, C1). `eind` (het
  enige eind van een aanval) geeft wie nog leeft `lid.opPad = { terug, buit }`, en `T.werkKampenBij` maakt hem thuis
  (`thuisVan`: `K.buit`). In het kamp (`werkKampBij`): wie `opPad` is, loopt naar de rand van de open plek (`gaatOpPad`,
  `e.naarRand`) en is daar weg, en komt niet terug op de kaart tot hij thuis is; een rover op een overval (`e.dorp`)
  telt niet als man thuis. De bode (`js/bode.js`): `T.kampVoorDeBode` bij het vertrek (`D.bode.kamp`, en `onderschept`
  'rovers' alleen als er een is), de hinderlaag uit dat kamp (`beginHinderlaag`), `T.roverValtOnderweg` en
  `T.buitNaarKamp` (het loon, `D.bode.loon`). `Spel.debug.rovers(n)` is `T.roversKomen(D, { aantal, meteen: true })`.
  Weg: `T.roverIngang` (de rand van `T.dorpVak`), `wildVel` en de wilde rovers. Het opslaan is versie 26.
- **Een kamp verslaan** (vraag 170, c4, 27 okt; `test/kampen.test.cjs`): valt de laatste man (`T.roverVerslagen`), dan
  `kampValt`: `K.verslagen`, de tenten weg (`T.haalVoorwerpWeg`), en een bericht met de plek. Een verslagen kamp telt
  nergens meer mee (`kampenBinnen`: geen overval, wie wegtrekt gaat naar een ander; `tikKampenDag`: niemand van buiten;
  `zetTenten`), zijn vuur is `'uit'` (`T.roverskampVuur(dag, K)`, ook in `js/tekenen.js`) zonder licht, en op de
  minikaart is het niet rood (`js/balk.js`). `werkKampBij` doet voor een verslagen kamp alleen `neemBuit`: wie van
  `T.mannenVan` binnen `buitAfstand` van het vuur staat, neemt tot `buitPerMan` uit `K.buit` (`e.buit`, op zijn briefje
  in `js/kiezen.js`), en het dorp onthoudt dat er buit onderweg is (`D.buitOnderweg`); `brengBuit` (in
  `T.werkRoversBij`, alleen zolang dat zo is) legt hem neer als losse stapel zodra de man in het bouwbereik is
  (`T.inBouwBereik`). Geen gewone stapel in het kamp: de dragers halen elke stapel van het dorp, hoe ver ook (`js/kar.js`).
  Wel te zien (Marcel, 27 okt: "B ja", en "b"): `T.roverskampenBuit(w)` geeft per kamp dat er staat de buit op
  `buitPlek` (twee tegels rechts van het vuur op het scherm; `plekVan` zet daar niemand), met zijn maat (`buitMaten`:
  klein, middel, groot), en `kampBuitInLijst` in `js/tekenen.js` tekent de hoop (`T.sprites.buit(maat)`, het vel
  `beelden/buit.png` uit `gereedschap/pixelart/buit.cjs`, dat pas laadt als er buit te zien is), of zolang dat laadt een
  losse stapel (`stapelInLijst`, dezelfde als de stapels bij de deuren). `neemBuit` meet vanaf de hoop.
- **Het hol van een level** (werklijst K, 2c, 27 okt; `test/kampen.test.cjs`): `dorpen[].hol: { bende, buit, palissade }`
  (gekeurd in `T.keurScenario`) laat `T.beginOpEiland` (`js/begin.js`) `T.maakHol(D, o)` doen: het dichtste kamp binnen de
  rand krijgt zijn bende (`vanBuiten`), zijn buit en `K.palissade`, en `D.hol` is zijn nummer (`T.holStand(D)`: 'staat',
  'verslagen' of null). Gaat zijn land open, dan maakt `zetPalissade` de open plek (geen natuur binnen `palissade.vrij`,
  14) en de ring: elke tegel op `palissade.straal` (9) van het vuur een voorwerp `palissade` (`blokkeert` in
  `T.VOORWERPEN`, js/wereld.js; het voorwerp zelf tekent niets), behalve `palissade.opening` (3) tegels waar het paadje
  de ring kruist (`kruisingMetPaadje`). Wat je ziet, zijn de palen: `palenVan(w, K)` (onthouden in `PALEN`, een
  WeakMap, en `T.palissadeVan(w, K)` zolang `K.palissadeStaat`) zet ze op de cirkel, `palissade.tussen` tegel uit
  elkaar, vanaf de poort rond, elk met een soort uit een vast lot (`palissade.soorten`, `kiesPaal`: twee gaatjes of twee
  afgebroken naast elkaar komen niet voor) en een van de 16 richtingen (de buitenkant); bij de poort de poortpalen
  (`paal-lap`, `paal`) en de balk (`boven`). `palissadeInLijst` in `js/tekenen.js` zet elke paal op zijn eigen plek
  (`d = x + y`, de balk een laag hoger), met `T.sprites.palissade(rij, richting)` uit `beelden/palissade.png`
  (`gereedschap/pixelart/palissade.cjs`, `vel`: 12 soorten paal en 3 poortstukken, elk in 16 richtingen, gepakt met
  `rijenVel` in `kern.cjs`; laadt pas als er een te zien is). Zo kan dezelfde tekening later de palissade van je dorp
  worden (vraag 158).
- **De tenten van het hol** (werklijst K, 2c, 27 okt; Marcel: "B; mag beetje random"): een gewoon kamp zet zijn tenten
  op de plekken van het eiland (`k.tenten`, `tentenVan` in `js/eiland.js`), het hol tegen zijn palissade:
  `tentenTegenDePalissade` (vanuit `zetPalissade`, dus vóór `zetTenten`) verdeelt `tentenMeest` plekken over de ring vanaf
  de poort, niet bij de poort en niet binnen `palissade.tentNietVoor` graden van de kijker (+x en +y samen: daar verdwijnt
  een tent achter de voorwand), op `tentAfstand` van het vuur, met een vast lot een stukje verschoven (`tentSchuif`), de
  opening naar het vuur, en minstens twee tegels tussen twee tenten. Ze staan in `K.tentPlekken` (bewaard), en
  `tentPlekken(w, K)` (`T.tentPlekkenVan`) geeft wat geldt: wie een tent neerzet, er een slaapt, een man een plek om het
  vuur zoekt of de aankleding een plek, vraagt het daar. De vorm van een tent (voet en deur) komt voor allebei uit
  `T.tentOp` en `T.tentTegels` (`js/eiland.js`).
- **De aankleding van een kamp** (werklijst K, 2c, 27 okt; Marcel: "Alles valt en staat met de aankleding"):
  `spullenVoor(w, K, k)` geeft een kamp zijn spullen als het opengaat (`K.spullen`, bewaard, dus ze verschuiven niet),
  uit de tabel `SPUL` (per ding een zone van tegels vanaf het vuur, een voet, of het op de grond ligt, en hoeveel in een
  gewoon kamp en in het hol), met een vast lot uit het zaad van het kamp: de slaapvellen voor de tentdeuren, de waslijn
  tussen de twee tenten die het dichtst bij elkaar staan, de fakkels bij de poort, en de rest op volgorde van groot naar
  klein (`VOLGORDE`), elk tot 80 pogingen in zijn zone. Een spul staat niet op een tent, het paadje, bij het vuur, op de
  buit, waar je niet kunt lopen, of op een ander spul; in het hol reikt de zone tot een tegel binnen de palissade, in een
  gewoon kamp tot `KAMP_TOT` (5,6). `plekVan` zet geen man op een spul dat niet op de grond ligt, en heeft het kamp geen
  plek meer om het vuur, dan zoekt het een tegel verder. `aankledingInLijst` tekent ze (`OP_DE_GROND`, modder, stro en
  slaapvel, op laag 0), met `T.sprites.aankleding(soort, richting)` uit `beelden/aankleding.png`
  (`gereedschap/pixelart/aankleding.cjs`, 16 rijen in 4 richtingen); `T.roverskampenLicht` geeft de fakkels licht.
  Een kamp dat valt, houdt zijn spullen (het is er nog, verlaten).
- **De wapens** (sinds vraag 159, 15 okt): de militie zijn de soldaten van het wachthuis en de veteranen (`T.militieVan`),
  en elk slaat met zijn eigen wapen (`js/soldaten.js`). Tot dan was `wapens` één waar die bij een aanval de eerste
  mannen 2 schade extra gaf (`T.bewapen`, `T.slagSchade`); die zijn weg. `T.wapensInHetDorp` telt nu alle wapens in de
  opslag (de bode, `js/bode.js`), en `Spel.debug.rovers()` toont de soldaten.

### js/einde.js: het eind

- `js/einde.js`: **het eind en het jaar in het kort** (2e, vraag 101, 3 okt). Elke nacht (`T.tikEindeDag`, vanuit
  `T.tikGebouwenDag`) is het spel uit onder 10 mensen (`D.einde`, reden `'leeg'`, het eindscherm in `js/hud.js`, getal
  `T.EINDE_INSTELLINGEN.minstensOver`), en schrijft het dorp op wat er gebeurde in zijn jaarboek (`D.jaarboek`, uit het
  dagboek en de oogst, `T.telOogstInJaarboek`). Het dagboek (`T.schrijfOp`, `D.dagboek`, `T.nieuwDagboek`) staat hier
  sinds 15 okt (ronde 3 van het snoeien): wie er kwam, stierf of wegtrok (`T.wijzigBevolking`), wat de boeren uit
  zichzelf deden, welk huis doorgroeide. Het jaarboek wordt op 1 lentemaand het jaarverslag (`T.jaarverslagRegels`;
  een brief, soort `'jaarverslag'`, `D.jaarverslag`). **Het winnen staat er niet meer** (11 okt, snoeironde, vraag 153;
  Marcel koos "Weg"): de teller van dagen op rij (`D.eind`), `T.iedereenGelukkig`, het doel linksboven (`T.eindDoel`),
  het eindscherm (`T.ui.toonGewonnen`), het grote feest (`T.FEESTEN.stad`) en de spelregel "Het eind" zijn weg, en met
  hen de raad `groeitNiet` ("Genoeg mensen voor de winst") en de tweede knop van het overlay. **Het doel van de demo**
  (18 okt; Marcel, D2): het eerste Sint-Maarten. Weiger je de heer, dan komt zijn leger (`D.einde`, reden `'leger'`,
  js/heer.js); betaal je, dan eindigt alleen de demo (met de scène van het betalen, `D.scene`, die de trigger van het
  demojaar zet; `levels/demojaar.js`), als zijn wagen een eind de weg op is (reden `'betaald'`). Er komt eerst een scène
  (js/regie.js): zolang die speelt, wacht het eindscherm tot het beeld zwart is. Het eindscherm (`T.ui.toonEinde`) zegt
  het jaar in het kort met `T.eindRegels` (het jaarverslag, met wat er staat), de punten als ze geteld zijn (`D.punten`,
  de trigger `punten`), en in de demo (`S.scenario.demo`) dat ze hier eindigt, met de link naar Steam als
  `T.DEMO_INSTELLINGEN.steam` een adres heeft. `T.DEMO_INSTELLINGEN.aan` zegt alleen nog dat een nieuw spel het demojaar
  is (aan bij het verpakken van de demo, `verpakken.md`). Een bewaard spel met de oude velden (`D.eind`, `D.jaarboek.gelukkig`) blijft laden: niets
  leest ze meer (`test/einde.test.cjs`).
- **Eén weg naar het eind** (24 okt): `T.spelUit(D, einde, zin)` zet `D.einde`, zegt de zin, zet in jouw dorp de tijd
  stil en toont het eindscherm; het dorp leeg (hier), verjaagd (`js/bazen.js`), je ambt kwijt, zijn leger en de demo
  betaald (`js/heer.js`), en een scenario (`js/scenario.js`, reden `'scenario'`) gaan er allemaal langs.
- **De punten** (vraag 186, 23 okt; Marcel: 5a3 en 5b1): `T.telVerzameld(D, wat, n)` telt in `D.jaarboek.verzameld` wat
  het dorp maakt, oogst of rooit; de enige bronnen zijn `T.opStapel` (`js/kar.js`: alles van een gebouw, een veld of
  het rooien), de wol en het slachten (`js/vee.js`), de kaas en het sprokkelhout (`js/behoeften.js`). Wat er gekocht,
  gegeven of teruggegeven wordt, gaat met `T.wijzigVoorraad` alleen en telt dus niet: wie een nieuwe bron maakt, telt
  hem erbij. `T.waardeVan(wat)` geeft de waarde in goud per stuk: wat de marskramer gemiddeld geeft (`koopt`,
  `js/handel.js`), en anders `T.EINDE_INSTELLINGEN.waarde` (in de werkbank; een waar heet daar met `T.waarNaam`).
  `T.puntenVan(D)` telt verzameld en wat er in de voorraad ligt (met het goud, zonder de stapels buiten).
  `T.telPunten(D)` staat in `T.heerKomt` (`js/heer.js`), vóór de tiende, alleen in de demo: `D.punten`, en de beste op
  deze computer onder `aardschok.punten.beste` (`T.opslagPlek`, `T.bestePunten`). Het eindscherm van de demo zet ze
  onder het jaarverslag (`js/hud.js`, `.einde-punten`). `Spel.debug.einde()` zegt ze ook.

## Het gevecht

### js/gevecht.js: het gevecht in real time

- `js/gevecht.js` (werklijst vraag 170, stap 2; Marcel, 15 okt: "Aanvallen, dan terug", "Niemand vanzelf", "Iedereen,
  wie kan vlucht", en het town hall): **het gevecht loopt in de tik**, in elk dorp (`T.werkGevechtBij` vanuit
  `T.werkDorpBij`, na `T.werkSturenBij`), met het toeval van het dorp en zonder `await`, dus in lockstep gelijk
  (getoetst: twee werelden met dezelfde opdrachten blijven letter voor letter gelijk, `test/gevecht.test.cjs`). De
  getallen in `T.GEVECHT_INSTELLINGEN` (de werkbank: "Fighting").
- **De klappen van een tik vallen aan het eind** (28 okt; Marcel: "1 tik alle klappen aan einde"): `slaan` zet de klap
  klaar in `S.klappen` (wie, wat, hoeveel, van wie; de worp en wat harnas afvangt, rekent hij meteen), en
  `T.laatKlappenVallen(S)` laat ze vallen aan het eind van `T.wereldTik`, na alle dorpen en de wereld, in de volgorde waarin
  ze geslagen werden; een klap op wie al viel, valt niet meer. `S.klappen` is er alleen binnen een tik, dus het gaat
  nooit mee in wat bewaard wordt. Waarom: de wereld werkt de dorpen een voor een bij, en wie eerst aan de beurt was,
  sloeg eerst; wie in die tik viel, sloeg niet meer terug. De proefbank (`npm run veldslag`, zestig gelijke slagen op
  *The Ford*) mat het effect van de volgorde: leger A won 46 keer, met de volgorde om 29; nu 43 en 34. De rest komt van
  het lopen en het kiezen van een doel, die ook op volgorde gaan (`opmerkingen.md`). `T.raak` zelf (de toetsen,
  `Spel.debug`) valt meteen. Een toets die `T.werkGevechtBij` los roept, laat de klappen zelf vallen.
- **Hoe ver een speer steekt** (22 okt; Marcel: "Steken van verder weg"): `T.kanRaken` laat een speer of piek van twee
  tegels steken als hij dat op het scherm reikt (`steekReik`, 72 pixels op 1×, uit de getekende speerman: 60 tot 66):
  schuin en recht voor of achter is twee tegels 58 tot 72 pixels, opzij 128, dus opzij steekt hij alleen van ernaast. De
  schermafstand van een tegelstap is `((dx - dy) * T.HB, (dx + dy) * T.HH)`. Getoetst in `test/soldaten.test.cjs`.
- **Wie van de wereld is** (vraag 170, stap 6a2, a; Marcel: "A1"): een wezen zonder dorp (de wolven van een roedel die
  vecht, een monster van een toets) vecht niet in de tik van een dorp, maar één keer per kaart in
  `T.werkGevechtVanDeWereldBij` (js/tik.js, na de dorpen). Het gevecht is van het dorp van zijn doel (`d.dorp`): daar
  begint het en houdt het aan (`aanHetVechten`). Een roedel die ging vechten (`G.tegen`), maar geen wolf vond een doel,
  gaat terug zodra dat dorp niet meer vecht (`T.wolvenNaHetGevecht`). Een worp gaat met de dobbelsteen van wie slaat: zijn
  dorp (`e.dorp`), of zijn roedel (`G.lot`) of zijn roverskamp (`K.lot`, js/rovers.js), of de kaart (`w.lot`); `kiesDoel` en `doelVan` krijgen de kaart mee, en het
  dorp mag daar `null` zijn.
- **Wie vecht:** jouw kant (`T.vechtVoor`: `T.isMan`, en wie opgeroepen is voor de jacht), en de vijand
  (`T.isVijandig`: een rover of een ander monster; een wolf als zijn roedel vecht of iemand aanvalt, `G.vecht`,
  `G.aanval`; zelf vecht een wolf pas als `G.vecht` staat). Het doel is `e.volgt` (jouw bevel, zonder leiband,
  `js/kiezen.js`) of `e.doelwit` (zelf gekozen: de dichtste die hij ziet, binnen `zicht`, en binnen `leiband` van zijn
  anker, `e.vanaf`: de post, of `T.dagAnker`, of waar hij stond). Jouw kant kijkt alleen naar de vijanden; een rover ook
  naar een dorpeling die buiten is (niet wie aangehouden is: de hinderlaag); een wolf alleen naar jouw kant. Wie geen
  doel heeft, kijkt elke `kijkElke` seconden (`e.omkijken`: wanneer weer); wie het laat gaan (dood, binnen, te ver,
  buiten de leiband), wacht `rustNaLoslaten`, en zijn dag neemt het over (`T.dwaal` en `T.werkRoversBij` laten wie vecht met rust).
- **Een slag:** `T.kanRaken(D, e, d, van)` is de ene vraag (ernaast met `T.raakt`, verder tot het bereik van
  `T.slagVan` als `T.zichtTussen` het ziet, en wie schiet, niet met een vijand naast zich; die stapt opzij). Raakt hij,
  dan blijft hij staan en slaat als `e.slagKlaar` om is: de kosten maal `secondenPerPunt`. `T.raak(S, D, doel, n, van)`
  is de ene plek waar een klap landt (de flits, de zwevende schade, en wie niets deed, slaat terug; een wolf haalt zijn
  roedel erbij, `T.wolvenVechten`; een dorpeling vlucht), `T.valt` wie op nul komt.
- **Vluchten en schuilen:** een dorpeling die een rover ziet (`vluchtZicht`), of die geraakt wordt, vlucht naar het town
  hall (`T.schuil`, `p.schuilt`, `D.schuilen`; zonder town hall naar zijn eigen huis): `T.dagAnker` zet hem daar binnen, en
  `T.blijftThuis` houdt hem van het werk. Is er geen rover meer in het land van het dorp (`T.dorpVak`; een roverskamp ligt erbuiten), dan komt iedereen weer naar buiten.
- **Het gevecht als status:** `D.gevecht = { sinds, laatst, plek }` zolang iemand een doel heeft, en `rustNa` seconden
  erna (`T.OORZAKEN.gevecht`, js/statussen.js); een bericht met de plek als het begint en ophoudt (`T.gevechtVoorbij`:
  ook `T.wolvenNaHetGevecht`), de tijd hooguit op 1× (`T.erWordtGevochten` in `T.snelheidNu`, js/tijd.js),
  en de randen van het beeld kleuren rood (`S.gevechtGloed`). Opslaan mag ook in een gevecht.
- Valt de held, dan is hij een mond minder zoals elke man (`T.sneuvelt`), en neemt een ander het over (`T.aanvoerderValt`,
  `js/soldaten.js`; vraag 170, stap 5); tot dan was het spel uit. Tot 15 okt was dit het gevecht in beurten: de
  overgang, het raster, de actiepunten, de beurtvolgorde, de deur dichtgooien en `planMonsterBeurt` (git bewaart het).

### js/soldaten.js: de soldaten en hun wapens

- `js/soldaten.js` (werklijst vraag 159, 15 okt; Marcel: "A1, B1, C1, D1", de wapens "sword, spear, shield, pike, bow,
  crossbow, armor", in vaste soorten): **in het wachthuis word je soldaat.** Per wachthuis `g.soldaten` (hoeveel je er
  per soort wilt, samen hooguit `plaatsen`), per bewoner `p.soldaat = { soort, wachthuis }`. Zes soorten met vaste
  stukken (`T.SOLDAAT_SOORTEN`: militie met een hooivork, speerman, piekenier, zwaardvechter, boogschutter,
  kruisboogschutter), en zeven stukken als waren (`T.STUKKEN`: speren, pieken, zwaarden, schilden, bogen, kruisbogen,
  harnassen; de hooivork heeft elke boer). `T.werkSoldatenBij` (elke ochtend na `T.verdeelHanden` via `T.tikSoldatenDag`,
  na het afbreken, en meteen na een knop, `T.zetSoldaten`): wie er te veel is, levert zijn stukken in, en wie er te
  weinig is, komt erbij uit wie geen werk heeft (B1: `T.kanWerken` en geen `p.werk`, volwassen of jong, niet van het
  gezin van de aanvoerder), zodra al zijn stukken in de opslag liggen. Een soldaat werkt en bouwt niet (`p.soldaat` in
  `kanWerken`, `js/bewoners.js`), staat overdag bij zijn wachthuis (`werkplekVan`) en vecht bij een aanval mee
  (`T.militieVan`, `js/rovers.js`; wie valt, zijn stukken zijn weg).
- **De wapenmaker** (in het gehucht, C1) maakt per dag één stuk van wat `T.wapensGevraagd` vraagt (`maakt.keuze` en
  `T.receptVan` in `js/gebouwen.js`); bij de muis en op zijn briefje wat er gevraagd wordt (`T.GEBOUW_ERBIJ`). **Een stuk
  bestaat alleen heel** (`T.isStuk`): wat half af is, blijft in `g.half` tot het heel is, en de kar laadt een stuk alleen
  heel (`js/kar.js`). Tot dan lag er 0,8 speer in de opslag en 0,2 op zijn stapel: samen een, dus hij maakte niets meer,
  maar de kar liet het stapeltje liggen (onder `minstens`), en met 0,8 speer kon niemand speerman worden.
- **In het gevecht** (D1): `T.slagVan(e)` (een vijand zijn aanval uit `T.WEZENS`; de eerste aanvoerder `T.SLAAN`; een
  soldaat zijn wapen, een veteraan een hooivork, een aanvoerder die het overnam het wapen dat hij had, `p.wapen`;
  `T.stukkenVan`), `T.vangtAf(doel, van)` (schild en harnas,
  niet tegen een kruisboog). De getallen in
  `T.SOLDATEN_INSTELLINGEN` (de werkbank: "Soldiers"); getoetst in `test/soldaten.test.cjs`.
- **De aanvoerder: wie het overneemt** (vraag 170, stap 5; Marcel: "wanneer hij valt kan er een ander opstaan. Deze uit
  veteranen gekozen", en B1 en C2 van 16 okt): valt de aanvoerder (`T.valt` in `js/gevecht.js`), dan zegt `T.sneuvelt` het,
  en `T.aanvoerderValt` zet `D.aanvoerder` op null en laat `T.werkAanvoerderBij` (ook elke tik, in `T.werkDorpBij`) een
  ander kiezen: `T.opvolgerVan` (een veteraan, anders de soldaat met de vroegste `p.soldaat.sinds`, dan `p.id`). Is er
  niemand, dan zegt het dorp het, en neemt de eerste die soldaat wordt of van de heervaart terugkomt het over; tot dan is
  er geen held (Tab doet niets, de camera kijkt bij het laden naar het plein). `T.wordtAanvoerder(D, p)`: hij houdt zijn
  wezen (zijn uiterlijk) en zijn wapen (`p.wapen`), `p.soldaat` en `p.veteraan` gaan weg (hij telt niet in het wachthuis,
  dat een ander zoekt, en heeft geen dienst), `e.dwaalt` is false (hij staat waar je hem zet, zoals de eerste), zijn
  leven dat van `T.WEZENS.aanvoerder`; zijn gezin trekt in het huis met `huis: 'aanvoerder'` (`T.verhuis`), en wie daar
  woonde in het zijne, of is dakloos (`T.wordtDakloos`). De eerste aanvoerder draagt zijn bewoner niet mee (`e.bewoner`):
  `T.sneuvelt` zoekt hem op met `T.bewonerVan`. Getoetst in `test/gevecht.test.cjs`.
- **De groepsleider en zijn lantaarn** (vraag 171; Marcel: "A1, B1, C1, D2"): `T.groepsleiderVan(D, g)` is, van de
  soldaten van wachthuis g die nu dienst hebben (`T.inDienst`, `js/kiezen.js`), wie het langst dient; zo heeft de
  nachtwacht 's nachts haar eigen leider, en valt hij, dan is het de volgende. `T.lantaarnDragers(D)`: de aanvoerder
  (C1) en de leider van elk wachthuis. Of zijn lantaarn brandt, en zijn licht, zegt `js/zien.js` (`T.draagtLicht`).
  Getoetst in `test/soldaten.test.cjs`.
- **De wacht van de demo** (20 okt; werklijst Q, vraag 181, e; Marcel: "S1. Maar 2 speermannen en 1 kruisboogschutter",
  en "De soldaten staan gewoon waar je ze neerzet"): `T.zetBeginBewoners` (js/bewoners.js) zet in de tent van de wacht elk
  een man met `p.soldaat = { soort, wachthuis: null }`, met zijn eigen stukken (niet uit de voorraad). Zonder wachthuis
  levert hij niet in (`T.werkSoldatenBij`); zijn post zet je met rechts (`e.post`, js/kiezen.js), en buiten zijn dienst
  slaapt hij in zijn tent (`T.dagAnker`, js/dag.js). Het wachthuis en de wapenmaker zijn in de demo op slot
  (`D.dicht`, `T.isDicht` in js/gebouwen.js). Wie meekomt en wat dicht is, zegt het demojaar (`levels/demojaar.js`).

### js/kiezen.js: kijken, kiezen en sturen als een god

- `js/kiezen.js` (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en bouwen", "Een post,
  tot je terugroept"): de regels zonder scherm van kijken, kiezen en sturen, met de getallen in `T.KIEZEN_INSTELLINGEN`
  (de werkbank: "Choosing and sending"), getoetst in `test/kiezen.test.cjs`; de camera, de muis, het kader en de groepen
  staan in `js/main.js`, de ring om de voeten in `tekenWezen` (`js/tekenen.js`), het briefje in `js/huisbriefje.js`.
- **Minder stroef** (vraag 191, 27 okt; werklijst S, S1 tot S4; gemeten in `speelbaar.md`, "De speeltest van 24 okt"):
  `T.snelheidVan(e)` (`js/wereld.js`) geeft een soldaat of veteraan `KIEZEN_INSTELLINGEN.loopt` (2,2, als de held), want
  zijn poppetje is dat van een boer; de `snelheid` van `T.WEZENS.soldaat` en `veteraan` ging eruit (niemand las hem), en
  de looptijd van een bewoner (`T.looptijdVan`, `js/bewoners.js`) vraagt ook `T.snelheidVan`. `T.kanPraten`
  (`js/praatje.js`): geen praatje voor een soldaat in zijn dienst (`T.inDienst`) of een veteraan op zijn post. Rechts
  gaat in bij het indrukken (`rechtsKlik` op `mousedown` met knop 2 in `js/main.js`, en op de minikaart in `js/balk.js`;
  `contextmenu` houdt alleen het menu van de browser tegen), met een ring waar je klikte (`S.klikTeken`, een schermveld;
  `tekenKlikTeken` in `js/tekenen.js`, `KIEZEN_INSTELLINGEN.teken` seconden, rood bij een aanval). `loop` keert wie
  midden in een stap is meteen om (`vanWaar`: de tegel een stap terug van tx en ty, door waar hij is), als die tegel
  dichter bij zijn doel ligt en vrij is: zijn tx en ty worden die tegel, en zijn weg begint daar; zijn poppetje kijkt dan
  meteen die kant op (`e.pad[0]`, `js/sprites.js`). Alleen bij een bevel, dus alleen voor je mannen.
- **Je mannen** (4a): `T.isMan(D, e)` (de held, een soldaat, een veteraan; een dorpeling werkt vanzelf), `T.mannenVan(D)`,
  en wat er gekozen is: `S.gekozen` (alleen scherm) is een gebouw, één wezen of een lijst van je mannen;
  `T.gekozenMannen(S)` haalt er je mannen uit.
- **Links en rechts stellen dezelfde vraag als het scherm:** links is `T.handelingVerkennen` (`js/verkennen.js`): `{ tekst,
  kies }` voor een man of een dorpeling, `{ tekst, doe }` voor een gebouw of wie een gesprek heeft en geen dorpeling is;
  rechts is `T.handelingSturen(S, doel, mannen)`: `{ tekst, kan, opdracht, doe }`. Bij de muis staat wat rechts doet,
  behalve boven wat links te kiezen is.
- **Een bevel is een opdracht** (`T.OPDRACHTEN` in `js/tik.js`), met de nummers van de mannen (`p.id` van hun bewoner,
  `T.nummersVan`): `stuur` (`T.stuurMannen`: elk naar zijn plek in de formatie, hieronder, langs één weg voor de groep,
  en daar is `e.post`), `formatie`
  (`T.zetFormatie`), `volg` (`T.volgVijand`: de vijand van die soort het dichtst bij waar je klikte, in `e.volgt`; een vijand heeft
  geen nummer, dus zijn soort en plek), `terug` (`T.roepTerug`), `dienst` (`T.zetDienst`) en `teWapen` (`T.roepTeWapen`, met
  de plek van het wachthuis). **De post** werkt via `T.dagAnker` (`js/dag.js`), dat
  eerst `T.bevelAnker` vraagt: de vijand die hij volgt (straal 1), of zijn post (straal 0), alleen in zijn dienst
  (`T.inDienst`, hieronder). Het dwalen (`T.dwaal`, `js/verkennen.js`) brengt hem er, zoals iedereen naar
  zijn anker; het bevel geeft hem meteen een weg. Een vijand achterna lopen en slaan doet het gevecht (`js/gevecht.js`;
  wie vecht, dwaalt niet); `T.werkSturenBij` (elke tik, in elk dorp) geeft wie zijn vijand zag vallen een post waar hij
  staat, en wie geen man meer is, verliest zijn bevel. Wie op de jacht meeloopt (`e.opgeroepen`), volgt na een bevel jouw
  bevel. Een bevel erheen laat ook zijn doel gaan (`e.doelwit`).
- **Op tocht** (stap 6a2, c0, 17 okt): `T.handelingSturen` stuurt ook naar land dat je niet kent (alleen buiten het
  eiland niet), en rechts op de minikaart doet hetzelfde (`js/balk.js`). De weg erheen zoekt `T.zoekRoute` met de optie
  `tocht` (`js/lopen.js`, "Door land dat nog dicht is"). Een post buiten het land van het dorp (`verVanHuis`, buiten
  `T.dorpVak`) houdt hem dag en nacht in dienst (`T.inDienst`), en `T.bevelAnker` geeft hem met `tocht: true`, zodat het
  dwalen de tocht vraagt. De held heeft geen post: ver weg onthoudt hij `e.tocht`, en `werkTochtBij` (vanuit
  `T.werkSturenBij`) laat hem verder zoeken als hij stilstaat, tot hij er is of niet verder komt. Een plek in land dat
  nog dicht was (`dicht: true` op `e.post` of `e.tocht`) schuift binnen `TOCHT_BIJ` tegels naar de dichtste vrije tegel
  waar hij kan komen (`vrijBij` met `T.kanErKomen`), en niet waar een ander staat of heen gaat.
- **De formatie** (stap 3; Marcel, 16 okt: "A1, B1, C1, D1, E1"): `T.formatiePlekken(D, mannen, naar, richting)` geeft
  `{ plekken: [{ e, x, y, kijk }], richting }` zonder iets te veranderen (ook voor het groen na een rechtsklik:
  `S.stuurPlekken`, alleen scherm, getekend in `tekenStuurPlekken`, `js/tekenen.js`). De rij van een man is `T.rijVan(e)`
  (0 wie slaat, 1 wie steekt, 2 wie schiet, uit `T.slagVan`); een *Line* (`lijnPlekken`) zet de rijen dwars op de
  richting met de middelste op de plek, hooguit `formatie.breedte` naast elkaar, en in een rij opzij gesorteerd zoals ze
  stonden, zodat niemand kruist; een *Ring* (`ringPlekken`) zoekt de kleinste kring van tegels waar wie slaat en steekt op
  past, met binnenin plaats voor de schutters. Een bezette of onbegaanbare plek schuift naar de dichtste vrije tegel
  (`vrijBij`, de voorste rij eerst). De formatie hoort bij de man (`e.formatie`, alleen `'ring'`; zonder is het een *Line*),
  zodat elke troep de zijne houdt; `T.formatieVan(mannen)` is die van de meesten. De richting (`achtVan`: een stap van de
  acht, `{ x, y }` van -1 tot 1) is die van hun midden naar de klik; staan ze er al, of kies je een andere formatie
  (`T.zetFormatie`: rond het midden van hun posten), dan `post.richting`. De kijkrichting van een man staat in
  `post.kijk`: `js/sprites.js` draait hem zo als hij op zijn post staat en niet vecht (`e.doelwit`); de held heeft geen
  post en kijkt naar een plek voor zich (`e.kijkt`, zoals een praatje). **Alleen gewone rekensommen** (de ruithoek in
  plaats van atan2, een kring van tegels in plaats van sin en cos): die zijn op elke computer letter voor letter gelijk,
  en dat vraagt samen spelen in lockstep. Tot 16 okt gebruikte `js/gevecht.js` `e.kijkt` ook als klok (wanneer hij weer
  om zich heen kijkt); die heet nu `e.omkijken`, want `js/sprites.js` las het getal als een plek, en wie gevochten had,
  keek dan naar het zuiden.
- **Eén weg voor de groep** (28 okt; Marcel: "per geselecteerde groep 1 pad. Je gaat niet elk mannetje los sturen in een
  veldslag"): `groepsBanen` zoekt één weg (`T.zoekRoute`, over open land) van de man in het midden van de groep naar de
  plek in het midden van hun formatie, en `baanVan` geeft elke man die weg verschoven naar zijn plek in de formatie (zijn
  baan): hij komt erop waar ze het dichtst bij hem is (in de eerste `groep` stappen), volgt haar zolang ze vrij is (en een
  schuine stap niet om een muurhoek gaat, `stapMag`), en gaat om wat in de weg staat met een korte weg naar waar ze weer
  vrij is. Zo blijft een Line onderweg een Line, en gaan ze bij een voorde of een brug vanzelf smal door. Wie alleen gaat,
  binnen is, verder dan `groep` tegels van het midden staat, of als de groep geen weg over open land heeft (een tocht),
  zoekt zijn eigen weg (`loop`), zoals voor 28 okt iedereen. Waarom: een lange weg zoeken kost zo'n 2 ms per man (70
  tegels), en twaalf man over *The Ford* was 25 tot 45 ms in één tik; nu 4 à 10 ms (de eerste keer, met de JIT, meer).
  Gemeten met `npm run veldslag`: de hoogste piek per slag heeft een mediaan van 3,6 ms. Getoetst in
  `test/kiezen.test.cjs` (één lange weg, stap voor stap te begaan, op zijn post, en naast elkaar op open land).
- **De diensten** (stap 4; Marcel, 16 okt: "A1, B1, C2, D2"): de dienst hoort bij de soldaat (`p.soldaat.dienst`, alleen
  `'nacht'`; zonder is het de dag), `T.dienstVan(e)`. `T.inDienst(D, e)` is `e.wakker` of zijn eigen dienst nu (de nacht
  is `T.dagdeelVan` 'nacht', van het slapen tot het opstaan; zonder kalender altijd). `T.dagAnker` zet een soldaat in
  zijn dienst bij het wachthuis (`p.plek.werk`), daarbuiten thuis en binnen; een veteraan heeft `T.dienstVan` 'dag', dus
  zijn post geldt als een dagdienst. Wie rust en een bevel krijgt (`stuur`, `volg`), of te wapen wordt geroepen, krijgt
  `e.wakker` (`wek`, met `dwaalTijd` 0, zodat hij meteen naar buiten komt); `T.werkSturenBij` haalt het weg zodra zijn
  eigen dienst begint. Tot 16 okt was dat `post.wakker`, alleen 's nachts; een oud spel verliest het hooguit voor één
  nacht. De regel op het briefje van het wachthuis (dag en nacht, *To arms*) staat in `T.GEBOUW_DELEN.wachthuis`
  (`js/soldaten.js`).
- **Het briefje** (`T.gekozenBriefje(S)` → `{ D, briefje, wie }`, in de vorm van `T.gebouwBriefje`): `T.manBriefje`,
  `T.mannenBriefje` (met *Line* en *Ring*: de formatie die ze hebben, is niet te kiezen; en *Day* en *Night* voor de
  soldaten onder hen, `dienstKnoppen`) en `T.dorpelingBriefje`, met een
  knop die een opdracht geeft (*Back to the guardhouse*); de waard heeft sinds vraag 170, stap 5 geen *Talk* meer (het
  praten is geparkeerd). Het leven van een man komt uit `T.levenAlsMan` (`js/rovers.js`).
