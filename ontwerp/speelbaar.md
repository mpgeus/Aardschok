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
   getuige alles en doet hij niets. **Af** (27 sep, negende sessie): de roddelaar vertelt het in de herberg.
6. **Een risico bij verstoppen.** Nu zoeken de soldaten alleen als de inner argwaan heeft, en die
   krijgt hij pas onder 60% van wat de velden beloven. In de speeltest werd daarom nooit gezocht:
   verstoppen was gratis. Marcel koos op 25 sep al dat de soldaten op Sint-Maarten altijd op twee of drie
   plekken zoeken, ook zonder argwaan (werklijst punt 4, verstoppen deel 1b). **Af** (27 sep, negende
   sessie, punt 4, stuk 1).
7. **De winter die je ziet aankomen.** In de speeltest stierf bijna de helft van het dorp aan de kou,
   zonder waarschuwing vooraf, en het bericht zegt niet waaraan. Wie het spel niet kent, weet niet dat
   hij hout moet hakken. **Af** (28 sep, elfde sessie; werklijst, vraag 44).
8. **De getallen, met Marcel.** De speeltest hieronder laat zien waar het schuurt. Bijstellen doet
   Marcel met de werkbank in de spelregels.

### Wat nog niet hoeft, maar wel beslist moet worden

- **Stap 3 van de inner: praten, afleiden, omkopen** (punt 4 van de werklijst). Zonder is zijn bezoek
  iets wat je laat gebeuren. Vraag 33c: vóór de proef of erna? Voorstel: erna, tenzij de speeltest of
  Marcels eigen spel laat zien dat het bezoek saai is. **Ingehaald:** de negende sessie bouwde het
  tegelijk, op Marcels antwoord op vraag 42 (27 sep; werklijst, onder Af).
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

1. ~~Punt 3, stuk 2 afmaken (de getuigen).~~ Af (27 sep).
2. ~~Verstoppen deel 1b: de soldaten zoeken altijd op twee of drie plekken. Zonder is er geen gok.~~ Af
   (27 sep).
3. ~~De winter zichtbaar maken: een waarschuwing als het hout of het eten de winter niet haalt, en in het
   bericht waaraan iemand stierf.~~ Af (28 sep).
4. Een speeltest door Marcel zelf, met de speeltest hieronder erbij, en de getallen bijstellen. Op de
   stand van nu: de speeltest hieronder liep zonder stap 1 tot en met 3, en zonder de inner die je kunt
   bespelen.
5. Opslaan, Verder en een titelscherm.
6. De afrekening na het eerste jaar.
7. De eerste weken als opdrachten.
8. Een tester die het niet kent laten spelen, en kijken waar hij vastloopt.

## Vragen aan Marcel

- **33a.** Wat is "goed" na het eerste jaar? Voorstel: drie getallen naast elkaar: wat je hebt (ook
  verstopt), wat de heer denkt dat je hebt, en hoe het dorp erbij staat (mensen, tevredenheid). Geen
  punten, wel een zin van de heer en een van het dorp.
- **33b.** Opslaan: vanzelf elke ochtend op één plek, of ook zelf opslaan op meer plekken?
- **33c.** ~~Stap 3 van de inner (praten, afleiden, omkopen): vóór de proef of erna?~~ Ingehaald: het is er (27 sep).
- **33d.** Hoe krijgt een tester het: een bladzijde op internet, of een programma?

## De speeltest van 27 sep

Een agent speelde het gehucht drie keer een jaar, van 2 lentemaand 1323 tot 1 grasmaand 1324, op 30× met
nacht, zonder iets bij te stellen. A gaf de heer alles. B zette 30% van het graan en het goud weg, vóór de
inner kwam en op 1 slachtmaand. C deed hetzelfde met 60%. Het was een luie speler: hij bouwde niets,
handelde niet met de marskramer, liep niet met de inner mee en haalde niets terug. Wat hier staat, zegt dus
wat de regels doen als je weinig doet, niet hoe een goede speler het doet. De cijfers per maand, in
grafieken, staan op de pagina "Een jaar in het gehucht" (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr).

**Het jaar loopt.** Drie keer dertien maanden zonder één fout in de console, en geen venster bleef hangen.
Een jaar kost de computer twee minuten (`Spel.debug.stap`).

| | A, alles geven | B, 30% weg | C, 60% weg |
|---|---|---|---|
| De heer vroeg | 82 graan, 15 goud | 80 graan, 22 goud | 67 graan, 21 goud |
| Gegeven | alles | 80 graan, 10 goud (74%) | 67 graan, 3 goud (56%) |
| Straf | geen | boete: 18 goud erbij | boete en twee soldaten tot de lente |
| Argwaan van de inner | 0 | 0 | 0 |
| Verstopt aan het eind | niets | 76 graan, 10 goud | 130 graan, 16 goud |
| Mensen (begin 26) | 24 | 24 | 20 |

**Wat opviel, van belangrijk naar minder:**

1. **De winter doodt, niet de heer.** In alle drie stierven er 17 van de 37 mensen, op precies dezelfde
   dagen, van 30 wintermaand tot 27 sprokkelmaand. Het was de kou: de 40 hout waarmee het gehucht begint,
   was eind wintermaand op, en niemand hakte nieuw. Graan lag er genoeg; in de winter telt het ergste
   tekort (`js/behoeften.js`). Het bericht zegt alleen "De winter is hard: Folkert is gestorven", niet
   waarom, en vooraf waarschuwt niets. In A stierven tien van de elf nieuwkomers van de zomer, en de
   ouden.
2. **Verstoppen is nu zonder risico, en levert weinig op.** De soldaten zoeken alleen als de inner
   argwaan heeft (`js/heer.js`), en die krijgt hij pas als hij minder dan 60% ziet van wat de velden
   beloven (`graanVerwacht`, `js/inner.js`). In C zag hij nog ongeveer 72%: de argwaan bleef 0, en er werd
   nergens gezocht. Tegelijk vraagt de heer maar 15% van het graan dat de inner zag (82 van 545): wie 130
   graan wegzet, spaart er zo'n 20. Geen risico en weinig winst: er valt nog niets te kiezen.
3. **Goud is het knelpunt.** Het gehucht begint met 20 goud, en alleen de marskramer brengt er meer. De
   heer vraagt hoofdgeld per ziel en per gebouw dat de inner zag, en een deel van de kist. Bij B en C was
   dat meer dan het hele dorp had. Wie goud verstopt, kan niet betalen: B kreeg een boete, C soldaten die
   meeaten, en de tevredenheid zakte in de winter tot 32%.
4. **Wat de inner ziet, is geluk.** Bij A zag hij 3 boerderijen en 2 huizen, bij B 4 boerderijen, 2
   huizen, een hut en de herberg: 15 tegen 22 goud. Met hem meelopen en zijn route sturen zou dat
   verschil moeten maken; deze speler deed dat niet.
5. **Drie maanden honger in het voorjaar, zonder gevolg.** Het graan is eind grasmaand op, en van
   bloeimaand tot hooimaand is er niets te eten. Niemand sterft (buiten de winter kost honger standaard
   alleen tevredenheid), en de tevredenheid blijft 55%. Na het zaaien in het tweede jaar is het graan in
   grasmaand al weer op.
6. **Een kelder houdt 40 graan** (goud onbeperkt). In de kelders van het gehucht past hooguit zo'n 250
   graan, minder dan de helft van de oogst (580), en de tweede ronde verstoppen liep vast op volle kelders.
   Wat verstopt ligt, eet niemand en zaait niemand: bij C bleven 75 van de 179 akkertegels in het tweede
   jaar ongezaaid, terwijl er 130 graan in de kelders lag.

Kleiner: de eerste schermafdruk, vlak na het begin, toonde nog blokken in plaats van huizen (de tekeningen
waren nog niet geladen); en in de winter ziet het gehucht eruit als in de zomer, alleen donkerder.
