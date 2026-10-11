# Snoeien: wat blijft, wat slaapt, wat weg gaat (vraag 153, stap 3)

Marcel, 11 okt: "Dan starten we met snoeien." De afspraak (vraag 153): wat om is, gaat eruit en blijft niet als
spelregel staan; git bewaart het. **Blijft**: hoort bij de nieuwe richting. **Slaapt**: de code blijft, er wordt niet
aan gebouwd. **Weg**: eruit, met de toetsen en de spelregel. In drie ronden (`werklijst.md`, A): ronde 1 nu, ronde 2 na
1f (wat het oude begin draaiende houdt), ronde 3 na de proef met de kar (wat de proef moet uitwijzen).

## Ronde 1: voorstel van Claude (11 okt), Marcel vinkt af

1. **De verdwenen graanzak** (`js/zaak.js`, 372 regels; spelregel "De zaak"): de proef voor rechtspraak, loop B van
   vraag 151, die niet gekozen is. **Weg.**
2. **Het doel "iedereen een jaar super gelukkig"** (`js/einde.js`; spelregel "Het eind"): het doel van de oude demo.
   **Weg**; het jaarverslag in hetzelfde bestand blijft. Het nieuwe eind komt met het doel van de demo (wacht op Marcel),
   en dan gaat ook de regel erover in CLAUDE.md om.
3. **Het land met provincies en reizen** (`js/landkaart.js` en het meeste van `js/land.js`; spelregel "Land",
   standaard uit): het eiland (vraag 117) kwam ervoor in de plaats. **Weg**; de weg het dorp in en uit
   (`T.wegInEnUit`, in zeven bestanden gebruikt) blijft.
4. **Ontginnen als verzoek** (`js/ontginnen.js`; spelregel "Ontginnen"): een boer vraagt een stuk heide of bos, tegen
   het vertrouwen, gemeld tegen de gunst, of stiekem. Akkers leg jij nu zelf (besloten 11 okt). **Weg**; het plaggen
   steken (heide wordt akker, te zien) slaapt tot 1d, als je een akker op heide legt.
5. **Drie oude varianten in de spelregels:** "De houthakker: Hout uit het niets" (van vóór vraag 115), "Werk telt in
   uren: Een hele dag" (met de kar telt de weg juist), en "Treden: Zoals de proef van 28 sep". **Weg**; de regel blijft
   op de standaard staan, zonder keuze.
6. **De quests** (`js/quest.js` en `js/quests.js`, met haken in `js/gesprek.js`): een raamwerk uit het oude spel, en
   de lijst is leeg. **Slaapt** (een opdracht van een dorpeling past bij Jagged Alliance 2), of weg.

## Later

- **Ronde 2, na 1f:** `js/verzoeken.js` en `js/ondernemers.js` (de mensen vragen wat ze bouwen), `js/erven.js` (het
  dorp bouwt zelf op een erf), de vaste boeren van de kaart en `kaarten/gehucht.tmj`; de spelregels "Het begin", "Je
  gehucht", "Wie bouwt", "Huizen", "Wie de boeren zijn" en "De markt" (op het plein vanzelf, of een gebouw dat jij zet).
- **Ronde 3, na de proef (C):** `js/voorvallen.js`, `js/raad.js`, `js/raadsman.js` en het venster, `js/ochtendrapport.js`,
  `js/wensen.js` met het huisbriefje, `js/treden.js`, `js/behoeften.js` (de groei), `js/wetten.js` met het menu,
  `js/feesten.js`; de spelregels "Voorvallen", "Raad", "Raadsman", "Het rapport", "Wensen", "Treden", "Achteruitgaan",
  "De herberg en de markt" en "Feesten".
- **Bij de heer (E):** `js/heer.js`, `js/brieven.js`, `js/grillen.js`, `js/heervaart.js`, `js/bazen.js`; de spelregels
  "Waarin de heer betaald wil worden", "Hoe de heer telt", "Het goud in de kist", "Wat de heer van het graan vraagt", "De
  schout aan de schandpaal", "Heervaart" en "Twee bazen".

## Blijft, zonder keuze

- **Spel en dorp:** `dorp`, `opslaan`, `menu`, `taal`, `naam`, `tijd`, `dag`, `opties`, `main`.
- **Wereld en lopen:** `wereld`, `pad`, `lopen`, `praatje`, `anim`, `verkennen`.
- **Het land:** `eiland`, `maker`, `hoogte`, `kaart`, `gebied` (de proefkaarten), `begin`.
- **Beeld en scherm:** `iso`, `tekenen`, `gl`, `sprites`, `doorkijk`, `bouwstijl`, `kleinleven`, `zien`, `ui`, `dialoog`,
  `tafel`, `hud`.
- **De mensen:** `mensen`, `bewoners`, `leven`, `boeren` (verandert in 1e), `gesprek` en `gesprekken`.
- **Bouwen en de economie:** `gebouwen`, `akkers`, `veldwerk`, `bos`, `vee`, `weer`, `graanschuur`, `wijngaard`,
  `herberg`, `markt`, `paden`, `voorraad`, `handel` (de marskramer), `bode`.
- **Wat het dorp overkomt:** `brand`, `koorts`, `beesten`, `rovers` (met de militie), `gevecht`.
- **De spelregels die een echte keuze zijn:** "Graan", "Honger buiten de winter", "Vruchtbaarheid", "Het vee", "Het vee
  in de winter", "Wat de schapen 's winters eten", "De mest uit de schaapskooi", "Het seizoen", "Vlees", "Vis",
  "Dagloners", "Het weer", "De bode", "Brand", "Ouder worden", "Kleren", "Klein leven", "Koorts", "Door een huis heen
  kijken", "Tekenen", "Wie je door een huis heen ziet", "Schaduwen", "Hoogte", "Paadjes", "De bomen in het jaar",
  "Praatjes", "Beesten", "Groei" en "Zaaigraan".
