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

## Wat we tot die tijd niet mogen breken

1. **Geen bouwstap, gewone scripts.** Bewust gekozen, en het maakt verpakken bijna niets.
2. **Geen `fetch` voor spullen.** `beelden/beschrijving.js` is met opzet een gewoon script. Dat
   lijkt een detail maar het is precies wat `file://` en de meeste schillen breekt.
3. **Opslaan meteen als aparte laag.** In de browser opslag in de browser, in de schil een echt
   bestand. Achter één functie, dan hoeft er later niets om. **Zo gebouwd** (28 sep, werklijst vraag 48):
   `T.opslagPlek` in `js/opslaan.js` is die functie; de opgeslagen spellen en de spelregels gaan er allebei
   langs. In de schil geeft hij iets met `getItem`, `setItem` en `removeItem` dat in een bestand schrijft.

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
de spelcode zelf, een paar duizend regels, zou opnieuw moeten.

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
