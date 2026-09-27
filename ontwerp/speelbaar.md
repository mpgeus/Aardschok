# Het eerste speelbare product (vraag 33)

Marcel, 26 sep: "We moeten oppassen voor functie creep. Anders blijven we toevoegen voor we bij een
speelbaar product komen." Dit bestand zegt wat daarvoor nog nodig is, en wat kan wachten. Bovenaan
staat wat besloten is, daaronder het voorstel, en onderaan de speeltest die het onderbouwt.

## Besloten

Nog niets. Alles hieronder is een voorstel van Claude (27 sep, tiende sessie), voor als Marcel landt.

## Het voorstel: een proefversie van één jaar

Een jaar in het gehucht, van de benoemingsbrief tot en met de winter na Sint-Maarten, met de kern:
rijk worden en arm lijken. Een ander moet het kunnen spelen zonder dat Marcel of Claude ernaast zit, en
aan het eind moet het zeggen hoe het ging. Op 30× duurt zo'n jaar ongeveer een uur, op 10× drie uur
(met slapen tot de ochtend iets minder).

### Wat er al is

- Het begin: de benoemingsbrief van de heer, met wat hij komt halen en wanneer.
- Het gehucht rond het plein: vijf boerderijen met hun velden, huizen, de herberg; mensen met een naam,
  een huis, werk en een dagritme; de boeren met een geloot karakter.
- Het jaar: zaaien, maaien, hooien, vee op de weide, de marskramer drie keer, de inner in oogstmaand, de
  brief in wijnmaand, slachten op 1 slachtmaand, de heer op Sint-Maarten, en de winter.
- De kern: verstoppen in kelders, de kapel en de kist; getuigen die het zien (stuk 1); de inner die telt
  en argwaan krijgt; de heer die vraagt naar wat hij ziet; soldaten die zoeken; straffen tot je ambt
  kwijt, met een eindscherm.
- De spelregels (`O`), de snelheden, slapen (`Z`).

### Wat er ontbreekt

1. **Een einde dat zegt hoe het ging.** Er is alleen een eind als je verliest (je ambt kwijt). Wie het
   jaar haalt, speelt door zonder te weten of hij het goed deed. Nodig: een afrekening na het eerste
   jaar: wat je de heer gaf, wat je achterhield en wat daarvan gevonden werd, hoe het dorp erbij staat.
   Wat daar "goed" is, beslist Marcel (vraag 33a). Het eindscherm en wat de heer elk jaar kreeg
   (`S.heer.jaren`, `T.ui.toonEinde` in `js/hud.js`) zijn er al; dit is hetzelfde scherm voor wie wint.
2. **Opslaan en verder spelen.** Nu begint elk herladen een nieuw spel, met nieuwe boeren. Een jaar is
   een uur of meer; zonder opslaan speelt niemand het uit. Voorstel: vanzelf opslaan elke ochtend, één
   plek, en bij het openen "Verder" (vraag 33b).
3. **Een titelscherm**: Nieuw spel, Verder, Spelregels. Marcel koos op 25 sep de benoemingsbrief in
   plaats van een titelscherm; met opslaan is er één nodig om te kiezen tussen nieuw en verder. De brief
   blijft het begin van een nieuw spel.
4. **Uitleg voor wie het niet kent.** Nu is er alleen de brief. Het spel heeft al een vak voor "de
   opdracht van dit moment" (linksboven, `T.ui.opdracht` in `js/ui.js`) en een questsysteem met
   gereedschap, maar er zijn nog geen quests. Voorstel: de eerste weken als een paar korte opdrachten
   ("loop naar de kelder van je huis", "de inner komt: zet iets opzij"), zonder nieuw systeem.
5. **Punt 3, stuk 2: wat een getuige doet.** De stap die loopt, en hij hoort bij de kern: nu ziet een
   getuige alles en doet hij niets.
6. **De getallen, met Marcel.** De speeltest hieronder laat zien waar het schuurt. Bijstellen doet
   Marcel met de werkbank in de spelregels.

### Wat nog niet hoeft, maar wel beslist moet worden

- **Stap 3 van de inner: praten, afleiden, omkopen** (punt 4 van de werklijst). Zonder is zijn bezoek
  iets wat je laat gebeuren. Vraag 33c: vóór de proef of erna? Voorstel: erna, tenzij de speeltest of
  Marcels eigen spel laat zien dat het bezoek saai is.
- **Hoe een tester het krijgt** (vraag 33d): een bladzijde op internet (het draait al in de browser)
  of een programma om te downloaden (Electron, `verpakken.md`). Marcel wil geen browserspel als
  product; voor een proef met een paar mensen is een bladzijde het snelst.
- **Geluid.** Er is nog geen enkel geluid. Voor een proef niet nodig, voor een product wel (punt 17).

### Wat kan wachten tot na de proef

De rest van punt 4 (het bos met de kudde, de marskramer die vee koopt), punt 5 (het dorp bouwt zelf,
de ladder tot baksteen, de herberg die meegroeit), straten en ontginnen (6b, 6c), en alles van deel C
tot en met E (voorvallen, groepen en keuren, rechtspraak, de nacht, de eigen buidel, de militie, de
treden, stadsrechten, de opstand). Van deel F alleen wat hierboven staat; verpakken voor Steam
(punt 18) komt pas als de proef goed is.

### De kortste weg, in volgorde

1. Punt 3, stuk 2 afmaken (de getuigen).
2. Een speeltest door Marcel zelf, met de lijst hieronder erbij, en de getallen bijstellen.
3. Opslaan, Verder en een titelscherm.
4. De afrekening na het eerste jaar.
5. De eerste weken als opdrachten.
6. Een tester die het niet kent laten spelen, en kijken waar hij vastloopt.

## Vragen aan Marcel

- **33a.** Wat is "goed" na het eerste jaar? Voorstel: drie getallen naast elkaar: wat je hebt (ook
  verstopt), wat de heer denkt dat je hebt, en hoe het dorp erbij staat (mensen, tevredenheid). Geen
  punten, wel een zin van de heer en een van het dorp.
- **33b.** Opslaan: vanzelf elke ochtend op één plek, of ook zelf opslaan op meer plekken?
- **33c.** Stap 3 van de inner (praten, afleiden, omkopen): vóór de proef of erna?
- **33d.** Hoe krijgt een tester het: een bladzijde op internet, of een programma?

## De speeltest van 27 sep

(Volgt: een jaar op drie manieren, door een agent, zonder iets bij te stellen.)
