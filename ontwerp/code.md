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
- Een klik op een deur is altijd erheen lopen. Eerst ging een open deur dicht als je er
  naast stond en erop klikte, en dat is precies wat je niet wilt.
- Monsters openen geen deuren.
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
  en een gesprek `T.doeGevolg(S, D, doe)` (je tas en je quests van het spel, de vlaggen en
  het goud van het dorp). De balk en de vensters gaan over je eigen dorp (`S.dorp`, vraag 71, C); wat getekend,
  aangeklikt of gevochten wordt, over het dorp dat er ligt (`T.dorpHier(S)`, of geen). Een venster dat een dorp zelf
  opent (`T.ui.toonBrief(D, ...)`, `T.ui.openSlachten(D)`, het rekenboek met `T.ui.toonVoorraad(D)`), komt alleen voor je
  eigen dorp. `T.nieuwDorp` maakt een dorp op een kaart (vanuit `T.beginOpKaart`), en `T.aanvoerderIsWeg(D)` zegt of zijn
  aanvoerder niet op de kaart van het dorp staat (of er geen is); `T.isAanvoerder(S, e)` of e je eigen held is, ook op een
  bladzijde zonder dorp (het lopen, het gereedschap). Het gereedschap, dat niet speelt, is zijn eigen dorp (`S.dorp = S`).
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
  `T.dorpErbij(S)` (js/gebied.js) zet een tweede dorp op het eiland van het eerste (`T.legDorpOpKaart`, js/maker.js), met
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
  kaarten ligt (`T.kenSoortVan` in `js/kaart.js`): een verse bladzijde kent alleen wat ze zelf neerzette, niet een gebouw
  uit het spel (gevonden met de proef met opslaan, 4 okt). `js/main.js` begint een nieuw spel
  (`T.nieuwSpel`, dat een vorig spel helemaal wist), laadt er een (`T.laadSpel`), en gaat terug naar het
  titelscherm (`T.naarTitelscherm`).
- `js/menu.js` is het scherm erbij, sinds vraag 172 (16 okt; Marcel: "We hebben een volledig menu nodig geen a.i slop") een
  volledig menu. **Het titelscherm is tekst over de wereld**: links het woordmerk en de keuzes (`.titel-links`; Continue,
  New game, Load, Settings, Credits, en Quit alleen in Electron, `kanAfsluiten`), rechts het land (`CAMERA.titelOpzij` in
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
  (`T.GESPREKKEN`) en de quests (`T.QUESTS`), houdt zijn Engelse zinnen als gewone tekst, want de bewerker kent geen
  `T.t`. Wie zo'n zin toont, vraagt hem aan `T.tGegevens(zin, woorden)` (hetzelfde als `T.t`, voor een zin die geen gewone
  tekst in de code is): een gesprek doet dat in `T.vulWoordenIn` (`js/gesprek.js`), waar alles langs komt wat een gesprek
  toont, en een quest in `js/quest.js`. `npm run teksten` leest die zinnen uit de tabel (`GEGEVENS` in
  `gereedschap/teksten.cjs`: per tabel welke velden de speler ziet, en wat alleen voor de schrijver is, zoals de situaties),
  zodat ze in `taal/bron.js` staan. Een tabel die gewone code is (`T.VOORVALLEN`, `T.OORZAKEN`), krijgt
  gewoon `T.t`.

### js/naam.js: de naam van het spel

- `js/naam.js`: de naam van het spel (`T.NAAM`, sinds 11 okt Tithebreaker), op één plek, want hij kan nog
  veranderen (Marcel, 28 sep); een titel schrijft `{naam}`. De sleutel waaronder de browser iets bewaart (`T.OPSLAG_SLEUTEL`) staat ernaast en
  verandert nooit mee. `test/naam.test.cjs` bewaakt dat de naam nergens anders staat. `T.STAND` is leeg, behalve in
  een proefversie (`npm run proefversie` zet er de datum en de commit in).

### js/tijd.js, js/dag.js, js/voorraad.js, js/gebouwen.js, js/behoeften.js, js/handel.js, js/heer.js, js/vee.js, js/opties.js, js/hud.js, js/brieven.js, js/gebied.js: het gehucht verder

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
  (Sint-Maarten: zijn brief in wijnmaand, wat hij vraagt naar wat het dorp op dat moment heeft (het graan in de
  schuren, de mensen, de kist zoals hij hem telde toen hij kwam, en elk gebouw) via `T.eisVanDeHeer` en
  `T.GEBOUWEN[soort].heer`, `T.gevolgVanBetaling` voor venster en knop, de straffen tot je ambt
  kwijt, de gunst na het betalen, `T.gunstNaSchatting`; zaaien en braak staan in `js/akkers.js`; sinds 11 okt, vraag 151, optie 1, deel B1, kijkt hij
  niet meer op een rapport en kent hij geen argwaan, toeslag of rond kijken meer;
  de inner zelf ging er op 11 okt ook uit; de schandpaal kost het dorp `schandpaalKost`, en er kan alleen een boer met
  een naam op de kaart aan, `e.wie`, dus in het lege begin alleen de aanvoerder), `js/vee.js` (het vee: `T.VEE` en `T.maakDier`,
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
  `B`, het veldenvenster onder `V`, het handelsvenster en het betalen aan de heer), en `js/brieven.js`: **de
  brieven van de heer op één plek** (vraag 60, het eerste stuk van hud.js splitsen): de benoeming waarmee een nieuw
  spel begint, de schatting op 1 wijnmaand, de heervaart, en een brief bij elke trede (het dorp, marktrecht), elk een
  soort in `BRIEVEN`, getoond met
  `T.ui.toonBrief(D, soort)`, en alleen die aan jouw dorp komt in beeld; de knop Brief opent een brief die op je antwoord wacht. Een nieuw spel begint
  met `T.beginOpKaart` (`js/gebied.js`; `?kaart=<naam>` begint op een andere kaart, zonder brief), op het land van de
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
  (`T.kaartVak(w)`: `{ x, y, b, h }`), de kamers om een tegel (`T.burenKamersOp`), of een kaart tegels en grond heeft
  (`T.heeftTegels`, `T.heeftGrond`), en een tegel als getal dat niet van de maat afhangt (`T.tegelNummer`,
  `T.tegelVanNummer`, voor wat per tegel bewaard wordt). Alleen `js/wereld.js` en `js/kaart.js` lezen `w.tegels`,
  `w.grond`, `w.b` en `w.h` (`test/tegels.test.cjs`). Een lijst over de hele kaart (het vaste raster, de eilanden, de
  velden van het lopen, het net van de paadjes, de natuur bij een gebouw, de beken, het bos van de beesten, de lichtkaart)
  beslaat `T.kaartVak(w)`, met tegel (x, y) op plek `(y - vak.y) * vak.b + (x - vak.x)`; in B2b krijgt elk zijn eigen vak.
- **De kaart van het eiland** (B2b, 13 okt; `kaarten.md`, "Het hele eiland"): `T.eilandKaart(zaad, vak)` is het hele
  eiland in stukken van `T.STUK` (64) bij 64, achter dezelfde vragen als een kaart uit Tiled. In S staat alleen wat er
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
  gaan ze op in de eilanden ernaast (`maakVrij`). De kaart onthoudt de laatste 64 plekken (`T.kaartPlekkenSinds(w,
  versie)`, null als het niet bekend is, alleen scherm): de lijst platte dingen en de grondbuffer in `js/tekenen.js`
  werken alleen die plekken bij, een bufferstuk per beeld (`vergeetVeranderdeKaart`, 13 okt; eerst alle grond in beeld,
  49 ms), en waar het zand van de paadjes anders werd (`T.zandHoeken`) net zo. Van zo'n stuk alleen het deel dat
  veranderde (`buf.vuil`, `tekenBufferDeel`, 17 okt; eerst het hele stuk van 512 bij 512): op een los doek in precies de
  stand van het stuk, en dan op zijn plek, want met een clip of op een verschoven doek rondt de browser ver uitgezoomd net
  anders af. Het land wordt **vooruit** gemaakt (`maakVooruit`): binnen `vooruit`
  tegels voorbij `openRond`, in delen van `vooruitDeel`, `vooruitMsPerSeconde` (minstens een deel per beeld), eerst wat het eerst nodig is
  (`nodigOver`, 13 okt: wie loopt, langs zijn pad; wie stilstaat, daarna); het wacht in de
  stukken tot het open gaat. De stukken zelf (`maakStuk`: `T.landStuk` met wat er anders werd
  erover, en de dingen van het eiland als voorwerpen met `v.natuur`) staan niet in S: een geladen spel maakt ze opnieuw
  (`test/eilandkaart.test.cjs`). `T.kaartVak(w)` is daar het vak om het dorp (`w.vak`), en wie wil weten wat er in een
  stuk land staat (ook wat er groeit), vraagt `T.voorwerpenIn(w, vak)`. Een voorwerp maak je op één manier
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
  zet je erbij en haal je weg met `T.zetVoorwerp` en `T.haalVoorwerpWeg`, vraag 71: dit was 85% van een speeldag),
  en de proefkamers (`T.maakProefkamers`): drie kamers in code voor de toetsen van het gevecht. De naam van een wezen staat
  met een kleine letter ("the wolf" in de zin, `T.t('The {wezen} sees you.')`), en wat een monster doet, is
  `aanval.zin` met `{doel}` erin (`T.t('bites {doel}')`): `js/gevecht.js` vult *you* of de naam van de man van de militie in
  (`T.vulTekst`), zodat een vertaler de hele zin kan bouwen.
  Elke kaart van het spel komt uit Tiled (`js/kaart.js`). De speler is `S.dorp.aanvoerder`, met soort
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
  het land gaat verder open dan iemand kijkt (`openRond`, 16), dus dat gaat zoals op elke tegel. Een kaart uit Tiled heeft
  geen mist. De getallen in `T.MIST_INSTELLINGEN` (de werkbank, "The fog"); het tekenen in `js/tekenen.js` (`tekenMist`,
  `mistOverLijst`) en `js/gl.js` (`tekenMist`, grayscale). Getoetst in `test/mist.test.cjs`.

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
  eiland van wie loopt (`kostVoor`, met `T.eilandOp`). Kan hij er niet komen (`delenVan`, `doelVak`), dan naar het vak
  van zijn deel dat er het dichtst bij ligt. Alles uit het nummer van het eiland en het open land, geen spelstaat; per
  kaart opnieuw als de kaart of het open land verandert (`grofVan`). Wat het kost, valt weg tegen het maken van het
  land zelf (`T.landStuk`, een profiel van 17 okt); de getallen `grofOnthouden` en `grofVooruit` in
  `T.LOPEN_INSTELLINGEN`.

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
  betalen, zonder gesprek; oprapen, sluipen en `S.naLopen` zijn weg), dwalende monsters, ontdekt worden. Dwalen gaat op een kaart met het dorp
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
  browser hetzelfde eiland maakt. **Je dorp op het eiland** (stap 2a, Marcel: "Het eiland wordt gewoon altijd gegenereerd bij
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
  plein (`leegRand`; binnen het plein wordt de weg gras), de plek van het kamp op het plein (`kamp`: het vuur, een tent
  per gezin en de kar; js/begin.js zet het op), de plek van de marskramer en de heer, een paar eiken op het plein (niet aan
  de voorkant, `eikenTot`, want daar komt de markt), en een rotspartij met plaats voor de steengroeve. Hij keurt het zelf
  (`T.keurGehucht`: kom je overal, staat er niets op het plein dat er niet hoort) en probeert het anders tot het deugt.
  Op het eiland keurt `T.planOpEiland` ook de marktplek: rijen korter dan `marktRij` (3) deugen niet. Daarvoor maakt hij
  de kaart al (`wereldVanPlan`), en die krijgt `T.laadGemaaktGehucht` mee in plaats van hem opnieuw te maken.
  `T.maakGehucht(zaad, land, pogingen, ookKeuren)` legt het plan op een stuk van het eiland (`plan.voorwerpen` alles wat er staat,
  `plan.gelegd` wat hij erbij legde, `plan.gerooid` wat er van het eiland weg moest), `T.planOpEiland(zaad)` kiest het stuk
  (jouw plek, anders die van een ander dorp), en `T.laadGemaaktGehucht(zaad)` maakt er een kaart van het eiland van, die
  alleen het verschil met het eiland overneemt, met de plek van het dorp in `w.plekken` (zijn land, plein, kamp, marskramer, uitgang en marktplek: `T.zoekMarktPlek` in `js/markt.js`; `T.nieuwDorp` neemt hem als `D.plek`). Het leggen zelf (`legPlanOp`) legt een plan op een kaart die er al is: zo legt `T.legDorpOpKaart(w, { bij, niet })` een tweede dorp op de dichtste andere dorpsplek die minstens `anderDorp` (200) tegels weg ligt (`T.planOpEiland(zaad, { bij, niet })`), en groeit het vak van de kaart om beide (vraag 170, stap 6a).
  Open zijn de stukken om het land, tot `zicht` tegels erbuiten. Welk land een
  nieuw spel krijgt, zegt `T.landVoorNieuwSpel` (`js/gebied.js`; een nummer van vijf cijfers, in het menu bij Nieuw
  spel); `T.beginOpKaart(S, 'gehucht', zaad)` legt het, met het lege begin erop. Het zaad van het dorp is hetzelfde
  nummer (`D.lot.zaad`); de kaart heet `'gehucht'`, en `w.maker` zegt uit welk zaad hij komt. **Hetzelfde zaad,
  hetzelfde land**, maar sinds B2b een ander land dan ervoor: wat er groeit komt per tegel uit het eiland, niet meer uit
  de dobbelsteen van de maker (die trok tot B2b nog getallen die niets meer legden, om het land van een bewaard spel
  gelijk te houden; een bewaard spel past sinds B2b toch niet meer). `npm run maker` schetst het lege land
  (`gereedschap/maker/schets.cjs`). **Wat er ligt, doet ertoe:** een houthakker bij het bos, een steengroeve bij de rotsen, een visser en een
  rietsnijder aan het water (`bij` in `T.GEBOUWEN`, `T.natuurBij` in `js/gebouwen.js`). Wat plat op de
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
  vlakte om het dorp, en vlak op de vlakke stukken (`w.hoogte.vlakken`: een huis met zijn looppad, het plein, het water),
  dus een bewaard spel onthoudt alleen het nummer en die stukken, en het landschap loopt door als het land groter wordt.
  Voor het tekenen staan de hoeken in een lijst (met een rand van 48 tegels om de kaart), opnieuw als `w.hoogte.versie`
  verandert. De vragen: `T.hoekHoogte`, `T.hoogteOp` (op een punt, op de driehoeken van de tegel), `T.isSchuin`,
  `T.naarSchermOp` en `T.naarWereldOp` (het scherm en de muis, met de hoogte, en op een brug van het eiland het wegdek:
  `T.dekOp`, zodat wie erop loopt meegaat en de muis op het dek de brug kiest; de grond zelf, ook onder een brug, ligt op
  `T.naarSchermGrond`, in `js/tekenen.js` `opMaaiveld`), `T.lichtOpHoekpunt` en
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
  scherm. Het tekenen knipt af op `T.kaartGrens` (op het eiland het hele eiland: wat niet open is, is 'buiten' en blijft
  donker; **de mist**, B2c: na de grond en de schaduwen één masker met een pixel per tegel, schuin over de grond, links
  hoeveel kleur eruit gaat en rechts hoeveel donkerder (`tekenMist`; zonder videokaart één laag, grijzer en donkerder, op
  een klein doek en dan opgeschaald, `MIST_KLEIN`, want twee schuine lagen over het scherm kostten daar 50 ms), en
  wat erop staat naar zijn tegel (`mistOverLijst`: in het zwart niets, in het grijs grijs en zonder wie er loopt; zonder
  videokaart een grijze kopie van het stukje, `grijsStuk`, want een filter bewerkt daar het hele vel;
  `Spel.debug.geenMist`), en zoekt wat er staat met `T.voorwerpenIn` (ook wat er op het eiland groeit); tot B2b stond er een bosrand om
  de kaart, ver uitgezoomd in een eigen buffer (`bosGebakken`). **De
  meter** (`F2`): beelden per seconde, en wat de regels en het tekenen per beeld kosten.

### js/gl.js: tekenen met de videokaart

- `js/gl.js`: **tekenen met de videokaart** (vraag 123): een eigen kleine laag op WebGL die zich voordoet als het 2D-doek,
  zodat `js/tekenen.js` er hetzelfde op tekent. Plaatjes, vlakken, bolle vormen en ronde verlopen tekent de kaart zelf;
  de rest gaat via een kladdoek in 2D en komt als plaatje op zijn plek (`T.gl.telling` zegt hoeveel). Een buffer die
  opnieuw getekend wordt, krijgt een nieuwe `versie` (`nieuweBuffer`), anders gaat hij niet opnieuw naar de kaart.
  Wat klein is en niet meer verandert (een plaatje, een doek met versie 1), staat op een paar grote texturen, de bladen
  (`plekOpBlad`), zodat een beeld in een paar tientallen opdrachten gaat, niet in een per plaatje (10 okt: Firefox haperde
  ver uitgezoomd). Eén opdracht (de rij, `plekVoor` en `legRijAf`) tekent uit tot `RIJ_TEXTUREN` (8) texturen tegelijk:
  elk hoekpunt zegt op welke plaats zijn textuur staat (`aBron`), en de rij breekt pas bij een negende textuur of een
  andere mengstand. Tot 17 okt brak elke andere textuur de rij, en een plaatje komt op het blad waar plaats is als het
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
  de tekenlijst staat, nog een keer als silhouet scheef over de grond (`tekenZonneschaduw`, `T.zonStand` in `js/dag.js`),
  op een masker dat in één keer over de grond gaat (`beginSchaduw`, `eindSchaduw`); de spelregel "Schaduwen".
  **De mist** (B2c, `js/mist.js`): elk hoekpunt heeft een vijfde getal, hoeveel kleur eruit gaat (`aGrijs`; het filter
  `grayscale(..) brightness(..)` zet het, `grijsNu`), zodat wat in het grijs staat zonder extra opdrachten grijs wordt; en
  `tekenMist` kopieert wat er tot dan getekend is (de grond en de schaduwen) naar een textuur en legt het ontkleurd en
  donkerder terug naar het masker (`FRAG_MIST`), want ontkleuren kan geen mengstand.

### js/sprites.js en js/kaart.js: de pixel art in het spel

- `js/sprites.js`: de pixel art uit `beelden/`. `T.sprites.figuur/tegel/muur/voorwerp` wijzen
  een cel op een vel aan, `T.sprites.houding(S, wezen)` kiest houding, richting en fase uit de
  spelstaat zelf (pad, uitval, flits, dood), en
  `T.sprites.teken` legt het anker van de cel op het midden van de tegel. **Elke boom anders** (vraag 148, a): een soort
  heeft op het vel meer tekeningen met zijn naam en een `vorm` (`BOOM_VORMEN` in `naar-tiled.cjs`), en welke een boom
  krijgt, zegt zijn tegel (`T.sprites.tekeningVan(v)`, een vaste hasj; `v.id` blijft de eerste, dus een bewaard spel past).
  Wat een voorwerp tekent, vraagt het daaraan (`{ vel, id }`, of `T.sprites.buitenVan(v, wind)`), niet aan `v.id`. Elk
  voorwerp onthoudt dat op zichzelf (`v.getekend`, `onthoudVoorwerp`; alleen scherm, in `SCHERM_SLEUTELS` van
  `js/opslaan.js`): zijn tekening (ook die van de zomer), het gewicht van de wind erop, het stuk stil en per stand, en
  de doos van zijn beeld (`T.sprites.doosVan`, voor de doorkijk); opnieuw als zijn `vel`, `id` of plek, het seizoen of
  het aantal geladen beelden (`geladenNr`) anders is. Elk beeld opnieuw opzoeken was in Firefox 9% van het tekenen, en
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
  en roze) of baksteen bij de stad. Een kaart leest een gid zoals Tiled (`js/kaart.js`),
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
  de doos van alles in beeld uit.

### js/bouwstijl.js: de bouwstijl van een land

- `js/bouwstijl.js`: **de bouwstijl van een land** (vraag 114, stap 2, 4 okt): elk land van de maker bouwt in één stijl
  (`w.stijl`, uit het nummer van het land, `T.stijlVoorLand`; het ontworpen gehucht heeft er geen en bouwt zoals altijd),
  met per soort een paar vormen, elk met de deur naar elke kant. De huizenbouwer noemt dat een stand; in het spel heet het
  de kant van de deur (`T.deurKantVan`, `T.metDeurNaar`), want een stand is in het spel die van de mensen (`T.STANDEN`,
  `T.standVan` in `js/treden.js`). Een nieuw huis krijgt het dak van de trede (dat van het gehucht, leien in een dorp,
  pannen met marktrecht), en een stenen huis baksteen pas met een steenbakkerij (`T.stijlTekeningen`, via
  `T.tekeningenVan` en `T.volgendeTekening` in `js/gebouwen.js`); wie doorgroeit, houdt zijn kant en krijgt het dak van nu
  (`T.zoalsNu`, `kiesGroei` in `js/behoeften.js`). `T.plekVoor` keert een deur naar de weg (`T.keerNaarDeWeg`, `js/bouwstijl.js`),
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
  en de aanvoerder en de groepsleiders (`T.lantaarnDragers`, `js/soldaten.js`; vraag 171; tot vraag 170, stap 5 had
  alleen de schout er een, `T.draagtLantaarn`), voor het licht in `js/tekenen.js` en voor de
  wolven, die niemand in het licht aanvallen (`js/beesten.js`); wie er nu een brandende draagt, geeft `T.lichtDragers(D)`
  (voor zijn licht, en voor het lantaarntje in zijn hand), en zijn licht ziet er kleiner uit dan het voor de wolven is
  (`beeldStraal`, vraag 171, L3; `js/tekenen.js` tekent elke bron met `getekendeStraal`); `T.huizenMetIemandThuis` zegt welke huizen
  een raam en een schoorsteen hebben die rookt. De getallen in `T.ZIEN_INSTELLINGEN`.

### gereedschap/pixelart/: de beelden uit code

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

### js/gesprek.js: woorden uit het spel in een zin

- Een zin in een gesprek kan iets uit het spel noemen: `{woord}` vult `T.GESPREK_WOORDEN` in
  (`js/gesprek.js`), zoals `{gisteravond}` (`js/herberg.js`). `T.vulWoordenIn` zet de zin eerst in de taal van nu (`T.tGegevens`, `js/taal.js`): de zinnen in
  `js/gesprekken.js` zijn Engels en gegevens (de gespreksschrijver schrijft ze terug), dus de naam boven een gesprek, de
  tekst van een knoop en een antwoord gaan allemaal hierlangs (`js/dialoog.js`).

### js/quests.js en js/quest.js: de quests

- `js/quests.js`: de quests als gegevens (nu nog leeg, met de vorm erboven);
  `js/quest.js`: de regels erachter, zonder scherm en dus te toetsen — fasen en wegen
  (`T.zetQuest`, `T.neemWeg`, `T.werkQuestsBij`), goud (`T.geefGoud`), de haken waarmee een
  gesprek erop let (`T.questVoorwaarde`, `T.questGevolg`), voorwerpen die aan een quest hangen,
  en `T.keurQuests`, dat de toets van drie antwoorden nakijkt.

## Bouwen en groeien

### js/begin.js: het lege begin

- `js/begin.js`: **het lege begin** (vraag 152, stap 1b, 11 okt; Marcel: "We moeten ook zelf alles vanaf de start gaan
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

### js/bouwen.js: meebouwen

- `js/bouwen.js`: **meebouwen** (vraag 152, 1d, 11 okt; Marcel: "d ja", en "a1"): in het lege begin (`T.bouwenMetHanden`,
  `D.begin`) rijst een gebouw niet vanzelf op in zijn bouwtijd. `T.plaatsGebouw` maakt er een bouwplaats van
  (`T.zetBouwplaats`: `g.bouw`, `klaarOp` null), met als kavel de voet en het looppad (`T.bouwKavel`, dezelfde vraag voor
  de muis in `js/main.js` en de klik); staat daar iets, dan `wachtOpRooien`, en staat hij nog niet op de kaart
  (`tekenRooiPlaatsen` in `js/tekenen.js` laat de voet zien; `T.tikRooienDag` in `js/bos.js` laat zo'n plaats aan de
  bouwers, zonder buren). Elke ochtend na `T.verdeelHanden` kiest `T.kiesBouwers` wie bouwt (`p.bouwt`): wie kan werken,
  volwassen of jong, zonder werk en geen dagloner, hooguit `perPlaats` per plaats, in de volgorde van `D.gebouwen`; net
  als de handen zonder te vragen of het poppetje er al is. Een nieuwe bouwplaats (`T.nieuweBouwplaats`, vanuit
  `T.plaatsGebouw`, `T.legVeld` en `T.legWeg`) krijgt meteen wie vandaag nog nergens bouwt, niet pas de volgende ochtend
  (17 okt: op de dag van aankomst rooide niemand), en telt wat de werkdag al achter de rug had als gedaan (`vandaag`),
  zodat de bomen van de ochtend niet in één klap vallen. Elke nacht doet `T.tikBouwenDag` het werk van gisteren
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
  kavel; `T.plaatsGebouw` neemt in het lege begin zelf de kavel, `T.bouwKavel`). (Tot 16 okt kwam een put of een kapel
  waar hij de meeste huizen bereikte die er een wilden: de kringen van de wensen per huis.) De kolonist van de speeltest
  zoekt zo zijn plek.

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
  het vak linksboven (js/main.js, als er geen quest is), `T.tredeMensenNodig` hoeveel mensen het nog vraagt (voor de
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
  wolven en de herten elke nacht, en dat was het zwaarste van de nacht, 13 okt), die in een jaar of twee via een
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
  wolf), dan gaan ze weg (`G.weg`, `G.vluchtNaar`). Een groep is een ding dat de dieren delen
  (`e.groep`, zoals `e.praatje`): alleen de leider zoekt een weg, de anderen lopen zijn weg af (`G.spoor`), en in
  `T.ontwijk` ruilt de leider met wie van zijn groep in de weg staat. Een dier heeft `e.beest` (geen `e.dier`: dat is vee), en `e.rust` en `e.rent` voor js/sprites.js (liggen, grazen, rennen). Een wolf begint geen gevecht;
  je mannen kunnen hem aanvallen, en dan vecht zijn roedel terug (`T.wolvenVechten`, `G.vecht`; js/gevecht.js); 's nachts lichten zijn ogen rood op (`tekenOgen` in js/tekenen.js,
  met `beelden/ogen.js` uit `gereedschap/pixelart/ogen.cjs`). Het hert komt uit `gereedschap/pixelart/wild.cjs`. **Het
  leven in het bos** (stap 2a; elke nacht `T.tikBeestenDag`, vanuit `T.tikGebouwenDag` na het bos): eerst de herten, en
  een roedel alleen waar hij herten kan halen; in de winter krijgt een roedel honger (`G.honger`) en jaagt hij op de
  dichtste herten (`jaag`, `G.gevangen`); elke lente jongen tot zes (`jongen`), en dan splitst de groep (`splits`): de
  helft zoekt een eigen thuis of trekt weg (`G.trektWeg`: `T.werkBeestenBij` haalt hem van de kaart, niet midden in een
  gevecht); wie honger leed, krijgt geen jongen (`G.leedOp`); een thuis dat niet meer diep in het bos ligt, verhuist of de
  groep trekt weg (`blijfOfVerhuis`; wat de houthakker inplant, telt als bos; het bos en hoe diep, over het vak om
  het dorp: `bosKaart`, met `T.bosInVak` uit `js/bos.js`). **De dreiging** (stap 2b): wie aan het werk
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

### js/kar.js: de ossenkar en de stapels

- `js/kar.js`: **de ossenkar** (werklijst C, 14 okt; Marcel: "A2, B2, C1, D2, E2"). Wat een gebouw maakt, gaat via
  `T.opStapel(D, g, wat, n)`: met een kar (`T.metDeKar`, `D.karren`) en een waar die niet in `nietMetDeKar` staat (het
  goud; `T.gaatMetDeKar`) op `g.stapel` (een veld legt het bij zijn boerderij, `g.boerderij`), anders, of zonder `g`,
  meteen in de voorraad. Zo ook de oogst (`T.haalOogstBinnen`, `T.haalSchovenBinnen(D, graan, boerderij)`, met
  `e.vrachtVoor` voor wat iemand 's nachts nog droeg, en het hooi per boerderij in `js/akkers.js`) en de wijn
  (`T.wijnBinnen(D, ranken, g)`); wat het vee geeft, heeft geen `g`. `T.maaktTot` (de nachtlus) en `T.etenVoorDeWinter`
  tellen wat op de stapels ligt mee; het dorp eet alleen uit de voorraad. Zo komen erin: de
  nachtlus van de werkplaatsen (`js/gebouwen.js`, stap 6, die ook niet meer maakt dan `T.ruimteOpStapel` toelaat; vol is
  `stilWant`), en `T.hakBoom(D, x, y, bij)` in `js/bos.js` (de bouwers via `T.rooiTegel(D, t, g)` in `js/bouwen.js`, een
  huis dat doorgroeit in `js/behoeften.js` en `js/veldwerk.js`). Wie zonder `bij` hakt, brengt het meteen binnen.
- **De kar** is een wezen (`e.kar`, in `w.wezens`); `T.karAanHetWerk` zet hem in `D.karren` als het kamp op is
  (`T.zetKampOp`, `js/begin.js`, dat dan ook pas de lading in de voorraad zet). Een rit is een regel op de kalender
  (`e.rit`: `fase` heen, laden, terug, lossen; `tot` in dagen; `naar` het gebouw; `e.klok`): `werkKar` werkt hem bij tot
  een moment, vanuit `T.werkKarBij` (elk beeld, in `T.werkDorpBij`; geeft het wezen zijn weg met `T.geefRoute`) en
  `T.tikKarDag` (elke nacht als eerste in `T.tikGebouwenDag`, tot middernacht). Aan het eind van een stuk staat het wezen
  op `rit.doel` (`staOp`), dus met of zonder beelden komt er hetzelfde uit. Een rit begint alleen in de werktijd
  (`T.dagindeling`), naar de grootste stapel (`kiesStapel`; zonder weg laat hij hem een dag liggen, `g.karKanNietTot`), en
  lost bij de dichtste opslag (een gebouw met `opslag` dat af is, anders de plek van de kar in het kamp). Het vel
  (`T.zetKarVel`): de huifkar blijft de huifkar; de ossenkar is leeg of draagt wat hij het meest heeft (`LADING_VEL`:
  `ossenkar-hout`, `-stenen`, `-spullen`, anders `-zakken`). De kar neemt geen zaaigraan mee (`beschikbaar`). Bij de muis
  `T.karTekst`; getekend: `T.stapelsOp` en `T.stapelPlek` (naast de deur, met op een bouwplaats het hout dat er al is
  maar nog niet verbouwd), met `T.sprites.stapelDelen` (`js/sprites.js`: een hoop hout of steen, of een tot drie manden
  van de markt, `IN_DE_MAND`).
- **De schuur** (stap 4): `T.GEBOUWEN.schuur` (`opslag`, `kar`, `leeg`). `T.geefSchurenEenKar` (in `T.tikGebouwenDag`, na de
  gebouwen die af kwamen) zet naast zijn deur een kar (`T.maakKar`, ook voor de huifkar van het begin) met `e.thuis` en
  `g.kar`. `thuisVan(D, e)`: waar een kar laadt en lost (zijn schuur, anders het raadhuis, anders de plek in
  het kamp); `verantwoordelijk(D, g)`: de kar met zijn opslag het dichtst bij g, en alleen die neemt g in `kiesRit`. Een
  kar zonder werk rijdt naar zijn opslag. Het bereik komt vanzelf uit `opslag` (`T.inBouwBereik`, `js/begin.js`). Getallen in `T.KAR_INSTELLINGEN` (de werkbank: "The ox cart"); getoetst in `test/kar.test.cjs`.
- **Bouwen met de kar** (stap 2, B2): `T.plaatsGebouw` betaalt alleen `T.bouwKosten(D, kosten).nu` (wat niet met de kar
  gaat) en zet de rest met `T.zetBouwNodig` in `g.bouw.nodig`; wat er is, staat in `g.bouw.er` (de kar, en `T.opStapel`
  vult eerst de bouwplaats). `T.bouwMateriaalDeel(g)` zegt hoe ver de bouwers mogen (`werkAan` in `js/bouwen.js` geeft
  terug wat bleef liggen, zodat overdag het werk na de levering alsnog gebeurt, en met of zonder beelden hetzelfde uitkomt);
  `T.wachtOpHout(g)` en `T.krijgtVandaagHout(D)` sturen `T.kiesBouwers`. Een rit heeft een `plan`: 'halen' (heen, laden,
  terug, lossen) of 'brengen' (opslag, inladen, brengen, afladen); `kiesRit` brengt eerst (bouwplaatsen in volgorde, dan
  werkplaatsen tot `voorraadIn`, met `vraag` min wat al `onderweg` is), dan halen, en anders een halve vracht. Een
  werkplaats verwerkt via `T.verwerkVoorraad` en `T.verwerk` (uit `g.in`). `T.nogTeBrengen(D, wat)`: wat de bouwplaatsen
  nog vragen (de winter van het brandhout in `js/behoeften.js`, de kolonist). `T.brengMeteen(D, g)`: alsof de kar het
  bracht (het proefdorp, `bouwAf`). Een losse stapel (`stapel` in `T.GEBOUWEN`, van een afgebroken gebouw, `js/afbreken.js`)
  ligt op zijn eigen tegel (`T.stapelPlek`), en is weg als de kar hem leeg laadt.

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
- **Aan tot de Steam-versie** (Marcel, 15 okt), ook in de proefversie: `T.DEBUG_INSTELLINGEN.aan` gaat voor Steam op
  false (`ontwerp/verpakken.md`), en dan meldt het venster zich niet aan.
- **De spelregels om te proberen** (vraag 172): in het spel lees je de spelregels alleen (ze liggen vast sinds het begin);
  de knop *Game rules and the workbench* opent ze hier in de stand `'debug'` (`T.ui.openSpelregels(S, 'debug')`, js/hud.js),
  te kiezen midden in een spel, met de werkbank. Die staat alleen bij een stand waarin je kiest en zolang dit venster aan is.

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
  dichtste roverskamp (`T.wordtRover` vanuit `js/bewoners.js`; hieronder; tot c2 kwam hij met de bende van het dorp,
  `D.rovers.bende`, terug), en er komen wilde rovers van buiten (`T.tikRoversDag`). Een aanval (`D.rovers.aanval`, `T.werkRoversBij`): tegen de avond van de rand van de kaart
  (`T.roverIngang`) naar een akker, op het uur dat het zaad zegt (`aanvalsUur`, in `aanval.uur`; met `nachtKans` 's nachts,
  vraag 170, stap 4), twee uur roven (graan uit de voorraad, en soms de akker kapot: `T.vertrapAkker` in
  `js/akkers.js`), en weer weg. Er komt niemand vanzelf (vraag 170, stap 2): het bericht zegt hoe je je soldaten stuurt,
  en het gevecht is in real time (`js/gevecht.js`); wie vecht (`e.doelwit`), laat `T.werkRoversBij` met rust. Wie valt,
  is dood: een rover van een kamp is uit zijn bende (`T.roverVerslagen`), een soldaat of een dorpeling een mond minder (`T.sneuvelt`,
  via `T.wijzigBevolking` met wie het is, en waartegen), en wie het overleeft, geneest na een nacht (`genees`); de doden
  (ook een wolf) begraaft `begraaf` de volgende dag. De laatste rover die valt, maakt de aanval af (`T.naGevecht`). De
  getallen in `T.ROVERS_INSTELLINGEN` (in de werkbank). (`T.roepOp` en `e.opgeroepen`, wie met de schout meeliep, zijn
  sinds vraag 170, stap 5 weg.)
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
  tot c3 is een overval wild.
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
  hen de raad `groeitNiet` ("Genoeg mensen voor de winst") en de tweede knop van het overlay. Het nieuwe doel van de demo
  wacht op Marcel (werklijst). Een bewaard spel met de oude velden (`D.eind`, `D.jaarboek.gelukkig`) blijft laden: niets
  leest ze meer (`test/einde.test.cjs`).

## Het gevecht

### js/gevecht.js: het gevecht in real time

- `js/gevecht.js` (werklijst vraag 170, stap 2; Marcel, 15 okt: "Aanvallen, dan terug", "Niemand vanzelf", "Iedereen,
  wie kan vlucht", en het town hall): **het gevecht loopt in de tik**, in elk dorp (`T.werkGevechtBij` vanuit
  `T.werkDorpBij`, na `T.werkSturenBij`), met het toeval van het dorp en zonder `await`, dus in lockstep gelijk
  (getoetst: twee werelden met dezelfde opdrachten blijven letter voor letter gelijk, `test/gevecht.test.cjs`). De
  getallen in `T.GEVECHT_INSTELLINGEN` (de werkbank: "Fighting").
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

### js/kiezen.js: kijken, kiezen en sturen als een god

- `js/kiezen.js` (werklijst vraag 170, stap 1; Marcel, 15 okt: "we gaan toch als 'god' sturen en bouwen", "Een post,
  tot je terugroept"): de regels zonder scherm van kijken, kiezen en sturen, met de getallen in `T.KIEZEN_INSTELLINGEN`
  (de werkbank: "Choosing and sending"), getoetst in `test/kiezen.test.cjs`; de camera, de muis, het kader en de groepen
  staan in `js/main.js`, de ring om de voeten in `tekenWezen` (`js/tekenen.js`), het briefje in `js/huisbriefje.js`.
- **Je mannen** (4a): `T.isMan(D, e)` (de held, een soldaat, een veteraan; een dorpeling werkt vanzelf), `T.mannenVan(D)`,
  en wat er gekozen is: `S.gekozen` (alleen scherm) is een gebouw, één wezen of een lijst van je mannen;
  `T.gekozenMannen(S)` haalt er je mannen uit.
- **Links en rechts stellen dezelfde vraag als het scherm:** links is `T.handelingVerkennen` (`js/verkennen.js`): `{ tekst,
  kies }` voor een man of een dorpeling, `{ tekst, doe }` voor een gebouw of wie een gesprek heeft en geen dorpeling is;
  rechts is `T.handelingSturen(S, doel, mannen)`: `{ tekst, kan, opdracht, doe }`. Bij de muis staat wat rechts doet,
  behalve boven wat links te kiezen is.
- **Een bevel is een opdracht** (`T.OPDRACHTEN` in `js/tik.js`), met de nummers van de mannen (`p.id` van hun bewoner,
  `T.nummersVan`): `stuur` (`T.stuurMannen`: elk naar zijn plek in de formatie, hieronder, en daar is `e.post`), `formatie`
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
