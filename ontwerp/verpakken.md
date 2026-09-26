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
   bestand. Achter één functie, dan hoeft er later niets om.

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
