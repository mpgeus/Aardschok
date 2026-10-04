# Verpakken: van map met bestanden naar programma op Steam

Het doel uit `CLAUDE.md`: verkopen, Steam eerst, als los programma verpakt.

## Hoe (20 sep 2026, nog niet gebouwd)

Ons spel is gewone HTML en JavaScript zonder bouwstap, dus er komt een schil omheen die een
webpagina toont alsof het een programma is.

| | Wat het is | Voor | Tegen |
|---|---|---|---|
| **Electron** | Chromium plus Node in één pakket (Discord, VS Code) | dezelfde motor als waarin we testen, op elk systeem gelijk; veel voorbeelden; Steam-koppeling werkt | ~150 MB voor een spel van vijf |
| **Tauri** | kleine Rust-schil op de webweergave van het systeem | 5 à 10 MB; op Windows is dat óók Chromium (WebView2) | Rust erbij; op macOS is het Safari's motor, dus daar opnieuw testen |

**Advies: Electron voor de eerste uitgave.** Niet omdat het mooier is, maar omdat het saai is.
Tauri is de elegantere keuze voor later, als de omvang gaat storen.

**Het trucje:** in de schil starten we `server.cjs` mee — dezelfde server waarop we nu testen — en
laat het venster daarheen kijken. Dan draait het spel in de verpakking precies zoals bij ons, en is
er geen apart pad voor "in het echt".

## Snelheid: in de browser of via Steam (Marcel, 4 okt 2026: "lag, geheugen tekort etc is geen optie straks")

Marcel: "Ik wil nu ook weten wat het verschil in performance is tussen nu spelen in de browser en straks via Steam."
Werklijst vraag 122.

**Wat er verschilt.** Via Steam draait het spel in Electron, en Electron ís Chromium: dezelfde motor als Chrome en Edge,
met dezelfde JavaScript (V8) en hetzelfde tekenen. Marcel speelt nu in Firefox, een andere motor; wat hij daar ziet,
is dus niet wat een speler op Steam krijgt, maar wel wat een tester op itch.io in Firefox krijgt. Wat in de schil
beter is: de versie van de motor kiezen wij (een update van de browser verandert niets), er draait niets naast (geen
tabbladen, geen extensies), een verborgen venster wordt niet afgeremd, en opslaan gaat naar een bestand in plaats van
naar de opslag van de browser (die heeft een grens van een paar MB). Wat erbij komt: Electron zelf, zo'n 150 MB op
schijf.

**Gemeten (4 okt, achtentwintigste sessie)**, op dezelfde machine zonder videokaart (alles tekent dan op de processor,
dus het is de slechtste kant), in een venster van 1280 bij 800 (de maat van de Steam Deck), op het ontworpen
gehucht, elk twee keer, met de kleinste schil die dit plan volgt (server.cjs in het programma, een venster erop;
Electron 44):

| | Chromium-venster | Electron (Steam) |
|---|---|---|
| beelden per seconde, dichtbij | 60 | 60 |
| beelden per seconde, overzicht 0,5 | 53 | 59 |
| beelden per seconde, overzicht 0,35 | 49 | 57 |
| langste beeld, eerste keer uitzoomen | 150 à 200 ms | 167 ms |
| geheugen, alles samen | ~1.140 MB | ~985 MB |

Electron is dus even snel als een Chromium-venster, en wat sneller in het overzicht, met minder geheugen (een
Chromium-venster draagt de hele browser mee). Met een videokaart tekent allebei op de kaart en gaat het sneller.

**Waar het echte risico zit:** niet in de schil, maar in het spel zelf, en dat is in de browser en in de schil hetzelfde.
- Wat het spel per beeld doet: de regels groeien met het aantal mensen (vraag 113: bij 200 mensen gemiddeld 2 à 3 ms
  per beeld, het traagste beeld 20 ms), en het tekenen met wat er in beeld staat.
- Het scherm: een speler op Steam heeft vaak 1920 bij 1080 of 4K, twee tot zes keer zoveel pixels als hier. Met een
  videokaart is dat geen punt; zonder (een oude laptop) wel.
- Het geheugen groeit met het land: het eiland van 2500 bij 2500 (vraag 117) is het grootste risico, en daarom komt het
  in stukken.
- Een hapering uit het opruimen van het geheugen (garbage collection) is in beide hetzelfde.

**Voorstel (vraag 122, wacht op Marcel):**
- **Een lat**, zodat "geen lag" iets is wat je kunt nakijken: op een machine zoals de Steam Deck 60 beelden per
  seconde, geen beeld boven de 50 ms in gewoon spel, en het hele programma onder 1,5 GB bij 200 mensen; en een
  minimum voor de Steam-pagina (4 GB geheugen, een ingebouwde videokaart).
- **Een proefverpakking voor Marcels eigen pc**: een Windows-versie in Electron (een zip, dubbelklikken), zodat hij met
  `F2` op dezelfde plek Firefox en de Steam-versie naast elkaar meet. Alleen zo weten we hoe het op echte machines
  loopt; hier is geen videokaart.
- **De meting vast in het gereedschap**: `npm run grootte` ook in de schil, zodat elke groei (meer mensen, het eiland)
  meteen tegen de lat gemeten wordt.
- Bij het echte verpakken: een Content-Security-Policy in `index.html` (Electron waarschuwt erover zonder).

## Wat we tot die tijd niet mogen breken

1. **Geen bouwstap, gewone scripts.** Bewust gekozen, en het maakt verpakken bijna niets.
2. **Geen `fetch` voor spullen.** `beelden/beschrijving.js` is met opzet een gewoon script. Dat
   lijkt een detail maar het is precies wat `file://` en de meeste schillen breekt.
3. **Opslaan meteen als aparte laag.** In de browser opslag in de browser, in de schil een echt
   bestand. Achter één functie, dan hoeft er later niets om. **Zo gebouwd** (28 sep, werklijst vraag 48):
   `T.opslagPlek` in `js/opslaan.js` is die functie; de opgeslagen spellen en de spelregels gaan er allebei
   langs. In de schil geeft hij iets met `getItem`, `setItem` en `removeItem` dat in een bestand schrijft.

## Een proefversie op itch.io (Marcel, 29 sep 2026, werklijst vraag 58, C: "C itch io")

**Zo werkt het nu:** `npm run proefversie` maakt `gereedschap/proefversie/uit/aardschok-proef-<datum>-<commit>.zip`
(niet in git), met `gereedschap/proefversie/maak.cjs`: `index.html` bovenin, de scripts en de stijl die erin staan,
en de plaatjes uit `beelden/` en `tegels/`. Op 29 sep: 189 bestanden, 11 MB. De stand (datum en commit, en "en
wijzigingen" als er nog iets niet gecommit was) staat klein rechtsonder op het titelscherm (`T.STAND` in
`js/naam.js`), zodat we weten waarop een tester speelde. Commit dus eerst. Uitgepakt speelt de zip ook los, met een
dubbelklik op `index.html`: nagekeken in een schone browser, zonder fouten en zonder één ontbrekend bestand.

**Wat itch.io vraagt** (hun eigen hulp, [HTML5](https://itch.io/docs/creators/html5)): een zip met `index.html`,
hooguit 1000 bestanden en 500 MB uitgepakt, geen bestand boven 200 MB, geen pad langer dan 240 tekens, en namen
waarin hoofdletters tellen. Dat halen we ruim.

**Erop zetten** (een account is gratis; wat de knoppen precies heten, kan iets anders zijn):
1. Dashboard, Create new project. Kind of project: **HTML**.
2. Bij Uploads de zip, en vink aan dat hij **in de browser gespeeld** wordt.
3. Bij Embed options: **1280 bij 800** (daar is de balk op gemaakt), met de knop voor **volledig scherm** aan.
4. Bij Visibility: niet Public zolang het een proef is. **Draft** geeft een geheime link die je kunt delen;
   **Restricted** kan met een wachtwoord ([Limited Playtests](https://itch.io/docs/creators/limited-releases)).
5. Opslaan, en het één keer zelf spelen op de pagina, vóór je de link stuurt.
6. Een nieuwe versie: dezelfde pagina, de oude zip eraf en de nieuwe erop. Een tester houdt zijn opgeslagen spel,
   want de sleutel van de opslag verandert niet (`T.OPSLAG_SLEUTEL`); verandert de vorm van het spel zo dat een oud
   spel niet meer past, dan zegt het menu dat (`T.OPSLAAN_INSTELLINGEN.versie`).

**Wat anders is dan thuis:**
- Het spel staat in een venster op de pagina. De toetsen werken pas als je er één keer in klikt. Op volledig scherm
  neemt de browser `Esc` zelf (dan ga je terug uit volledig scherm); het menu zit ook onder de knop Menu.
- Opslaan gaat in de opslag van de browser, bij itch.io. In een privévenster is het spel weg zodra het venster dicht
  is; een browser die opslag in zo'n venster helemaal blokkeert, onthoudt niets, en het spel loopt dan gewoon
  (`T.opslagPlek` geeft dan niets). Zeg een tester dus: een gewoon venster, en steeds dezelfde browser.

## Wanneer wél een bouwstap (20 sep 2026)

Drie treden, en we staan op de eerste:

1. **Zoals nu:** gewone scripts, nul afhankelijkheden, `index.html` opent los. Dit project bouwt
   over vijf jaar nog steeds, want er is niets dat kan verouderen.
2. **Echte modules, zonder bouwstap.** Browsers kunnen `import`/`export` zonder dat er iets
   gebouwd wordt. Dan zijn we van de ene grote naamruimte `Spel` af en doet de scriptvolgorde er
   niet meer toe. Prijs: `index.html` los openen werkt niet meer (modules mogen niet vanaf
   `file://`), en de tests moeten anders geladen worden — een middag werk.
3. **Bundelaar en TypeScript.** Typecontrole is echt wat waard zodra de systemen in elkaar grijpen.
   Maar er komt een keten bij die onderhoud kost, en elke wijziging moet eerst gebouwd worden —
   ook voor de agents, die daardoor trager en duurder worden.

**De drempels, zodat het geen smaakdiscussie blijft:**

- **naar trede 2** zodra een fout door scriptvolgorde ons voor de tweede keer een avond kost;
- **naar trede 3** zodra de spellogica boven ongeveer tienduizend regels komt én we structuren
  tussen systemen doorgeven. Nu zitten we daar ruim onder, en de meeste fouten zijn beeldfouten,
  waar typecontrole niet tegen helpt.

Wat af te raden is: trede 3 vóór trede 2. Dan haal je een hele keten binnen voor een probleem dat
modules alleen ook oplossen.

## "Ik wil geen browserspel" (Marcel, 20 sep 2026)

De zorg is de indruk die mensen ervan hebben. Die indruk komt van gratis spelletjes op portalen,
niet van de techniek: op een Steam-pagina staat nergens waarmee iets gemaakt is. CrossCode is
JavaScript en verkocht meer dan een miljoen keer; Vampire Survivors draait op dezelfde techniek.

**Wat het wél browserig laat voelen** — en dit is de lijst die we moeten afwerken bij het
titelscherm en het opslaan:

- wazig opgeschaalde pixels; schalen moet op hele factoren;
- alleen muis: er moet spelbesturing zijn en toetsen die je kunt omzetten;
- een witte flits bij het opstarten, of zichtbaar inladen;
- standaard browserletters in de menu's;
- de muispijl van Windows in plaats van een eigen aanwijzer;
- een venster dat tot een onmogelijke verhouding te slepen is;
- geluid dat pas laat inzet;
- geen instellingenscherm, geen fatsoenlijk opslaan.

**En de keuze blijft omkeerbaar.** Bijna alles wat er ligt is onafhankelijk van de motor: het
ontwerp, de pixel art-keten, alle beelden, en de kaarten (Tiled leest Godot net zo goed in). Alleen
de spelcode zelf zou opnieuw moeten: op 20 sep een paar duizend regels, op 4 okt 30.000 (en 18.000
regels toetsen). Zie "Een native exe?" hieronder.

## Een native exe? (Marcel, 4 okt 2026: "Is er een manier om te bouwen naar een native exe?"; werklijst vraag 122)

**Een .exe krijgen we hoe dan ook.** Electron maakt er een (`Aardschok.exe`, met de motor ernaast, zo'n 150 MB), en
Tauri ook (zo'n 10 MB, met de webweergave van Windows, WebView2, en dat is ook Chromium). Wat erin draait, blijft onze
JavaScript in Chromium. Tauri gebruikt op macOS en Linux de motor van Safari, en de Steam Deck is Linux: daarom blijft
Electron de keuze (zie "Hoe" bovenaan).

**Echt native** (de code zelf vertaald naar machinecode) kan alleen door het spel opnieuw te schrijven in een andere
motor of taal: Godot, Unity (C#), of Rust of C++ met een eigen tekenlaag. Wat meegaat: het ontwerp, de pixel art-keten
en alle beelden, de kaarten en de teksten. Wat opnieuw moet: 30.000 regels spel en 18.000 regels toetsen, maanden werk
waarin het spel niet verder komt. Wat het oplevert: het rekenwerk van de regels zo'n twee tot vijf keer sneller, geen
haperingen van het opruimen van geheugen (in Rust of C++), en consoles worden mogelijk. Een programma als Node SEA, Deno
compile of Bun compile maakt van JavaScript wel één .exe, maar zonder browser: geen canvas om op te tekenen, dus dat
helpt ons niet.

**De middenweg: native snelheid waar het telt, zonder alles opnieuw.**
- **Tekenen met WebGL** in plaats van het 2D-canvas: de videokaart tekent duizenden plaatjes in een paar opdrachten.
  Dat is de grootste winst voor het tekenen, en voor grote schermen. Het raakt de tekenlaag (`js/tekenen.js`,
  `js/sprites.js`), niet de regels.
- **Het zware rekenwerk** (paden voor duizenden mensen, de nacht) in een Web Worker, op een andere processorkern, zodat
  een beeld er niet op wacht; of de heetste stukken in WebAssembly (Rust of C, vertaald naar bijna-machinecode).
- Allebei werkt het in de browser (itch.io) én in Electron (Steam).

**Besloten (Marcel, 4 okt: "snelheid, middenweg is goed"):** het gaat om de snelheid, niet om consoles. Dus
JavaScript en Electron voor Steam; op echte machines meten tegen de lat (vraag 122); haalt het die niet, dan eerst
WebGL, dan een Worker of WebAssembly voor wat het zwaarst is. Een nieuwe motor alleen als consoles ooit een doel worden.
Een voorbeeld: Vampire Survivors begon in JavaScript (Phaser) en ging in 2023 naar Unity, ook voor de consoles.

## De naam (vraag 8; voorstel van Claude, 27 sep, tiende sessie)

"Aardschok" past niet meer. Waar een naam aan moet voldoen: kort, uit te spreken, uniek genoeg om te
vinden, en hij zegt iets over het spel: middeleeuws, een dorp, en de kern (rijk worden, arm lijken).
De spelteksten zijn Nederlands, maar Steam is vooral Engels: de naam werkt in allebei, of er komen er
twee.

Nagekeken met een zoekmachine (27 sep). Steam zelf kon Claude vanuit de cloud niet openen (het
netwerk van de werkplek laat store.steampowered.com niet toe), dus "niets gevonden" is nog geen "vrij".

- **Martinmas** (Engels voor Sint-Maarten): de dag waarop de heer komt innen. Zo was het ook echt: rond
  Sint-Maarten werden pachten en schulden betaald, en sloot het boerenjaar. Eén zeldzaam woord, dus goed
  te vinden, en het klinkt middeleeuws. "Sint-Maarten" zelf gaat niet: dan vind je het eiland. Geen
  spel met die naam gevonden.
- **Two Ledgers** (twee boeken): de kern in twee woorden, het boek voor de heer en het echte (de
  rekenboeken van punt 6). Klinkt minder middeleeuws. Niets gevonden.
- **Schout**: wie je bent. Echt, kort en uniek, maar buiten Nederland zegt het niets, en de sch is
  lastig. Met een ondertitel gaat het wel: "Schout: word rijk, lijk arm". Niets gevonden.
- **Heerlijkheid**: het gebied van een heer, en tegelijk "heerlijk". Precies de zwarte satire, maar
  alleen voor wie Nederlands kent.
- **Goudblind**: de heer ziet alleen goud. Ook alleen Nederlands.
- **Kerfstok**, in het Engels **Tally**: het stokje waarin een schuld werd gekerfd, en "iets op je
  kerfstok hebben". De heer houdt een kerfstok bij, jij twee boeken. Tally is een gewoon Engels woord,
  dus slecht te vinden.
- **A Poor Harvest**: "een slechte oogst", wat je de inner vertelt terwijl je kelder vol ligt. Er is
  al een klein spel met die naam op itch.io.
- **Bailiwick**: het ambtsgebied van een baljuw, bijna een schout. Er is al een bordspel met die naam.

**Voorstel: Martinmas,** met de kern als ondertitel: "Get rich. Look poor." ("Word rijk. Lijk arm.").
Het zegt waar elk jaar naartoe loopt, het is uniek, en het werkt in beide talen. Wie de Nederlandse
kant voorop wil: Schout, met dezelfde ondertitel.

**Vóór je kiest:** zoeken op Steam zelf, in de merkenregisters (EUIPO, en BOIP voor de Benelux), en
kijken of de domeinnaam vrij is.

**Besloten (Marcel, 28 sep): "De naam blijft aardschok voor nu. We maken later iets anders. Zorg dat we dat
makkelijk door het hele spel kunnen aanpassen."** De naam staat op één plek: `T.NAAM` in `js/naam.js`. Het
tabblad van het spel en van het gereedschap, de server en de meldingen in de console lezen hem daar, en het
titelscherm straks ook. Een andere naam is dus één regel. `test/naam.test.cjs` bewaakt dat hij nergens anders
in het spel staat.

Eén ding verandert bewust niet mee: de sleutel waaronder de browser de spelregels bewaart, en straks de
opgeslagen spellen (`T.OPSLAG_SLEUTEL`, in hetzelfde bestand, "aardschok"). Zou die meeveranderen, dan is
iedereen bij de nieuwe naam zijn opgeslagen spel kwijt. De technische naam in `package.json` en
`.claude/launch.json` ziet geen speler; die mag blijven. Als het spel verpakt wordt, neemt de schil de naam
voor het venster en de winkel ook uit `js/naam.js`.
