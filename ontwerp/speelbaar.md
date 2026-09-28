# Het eerste speelbare product (vraag 33)

Marcel, 26 sep: "We moeten oppassen voor functie creep. Anders blijven we toevoegen voor we bij een
speelbaar product komen." Dit bestand zegt wat daarvoor nog nodig is, en wat kan wachten. Bovenaan
staat wat besloten is, daaronder het voorstel, en onderaan de speeltest die het onderbouwt.

## Besloten

- **Wat "goed" is na het eerste jaar** (vraag 33a; Marcel, 28 sep: "Goed idee. Maar spelen bepaalt waar ik
  vind dat we staan uiteindelijk. Dit wordt later nog regelmatig aangepast."). De afrekening komt zoals
  voorgesteld: geen punten, maar drie getallen naast elkaar (wat je echt hebt, ook wat verstopt ligt; wat de
  heer denkt dat je hebt; hoe het dorp erbij staat), met een zin van de heer en een van het dorp. Waar goed
  ophoudt en slecht begint, beslist spelen, en dat verandert nog vaak: die grenzen en de zinnen staan daarom
  in één blok, in de werkbank van de spelregels, en niet in de code verspreid.
- **Opslaan** (vraag 33b; Marcel, 28 sep: "Auto opslaan, maar ook zelf kunnen kiezen. Er moet ook een menu
  komen titel scherm etc"). Het spel slaat vanzelf op, en je kunt ook zelf opslaan en kiezen wat je laadt.
  Er komt een menu, met een titelscherm. Het plan staat in de werklijst, vraag 48.
- **De naam** (vraag 8): Aardschok, voor nu, en op één plek, zodat hij later in één keer anders kan
  (`verpakken.md`, "De naam").

Wat hieronder staat, is het voorstel van Claude (27 sep, tiende sessie), met daarin wat Marcel sindsdien koos.

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
   plek, en bij het openen "Verder" (vraag 33b). **Af** (28 sep, dertiende sessie; werklijst, vraag 48):
   vanzelf elke ochtend, en vijf eigen plekken.
3. **Een titelscherm**: Nieuw spel, Verder, Spelregels. Marcel koos op 25 sep de benoemingsbrief in
   plaats van een titelscherm; met opslaan is er één nodig om te kiezen tussen nieuw en verder. De brief
   blijft het begin van een nieuw spel. **Af** (28 sep): het titelscherm, met het gehucht erachter, en een
   menu onder `Esc`.
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
4. Een speeltest op de stand van nu, en de getallen bijstellen. **Gespeeld** (28 sep): een script speelde
   twaalf jaren (hieronder, "De speeltest van 28 sep"). Het bijstellen komt later, met een menu met opties
   (Marcel, 28 sep: "Niet nu. Dit stellen we later in."; werklijst, vraag 46).
5. ~~Opslaan, Verder en een titelscherm.~~ Af (28 sep).
6. De afrekening na het eerste jaar.
7. De eerste weken als opdrachten.
8. Een tester die het niet kent laten spelen, en kijken waar hij vastloopt.

## Vragen aan Marcel

- **33a.** ~~Wat is "goed" na het eerste jaar? Voorstel: drie getallen naast elkaar: wat je hebt (ook
  verstopt), wat de heer denkt dat je hebt, en hoe het dorp erbij staat (mensen, tevredenheid). Geen
  punten, wel een zin van de heer en een van het dorp.~~ Beantwoord (28 sep): zo, en spelen beslist waar de
  grenzen liggen (zie Besloten).
- **33b.** ~~Opslaan: vanzelf elke ochtend op één plek, of ook zelf opslaan op meer plekken?~~ Beantwoord
  (28 sep): allebei, met een menu en een titelscherm (zie Besloten).
- **33c.** ~~Stap 3 van de inner (praten, afleiden, omkopen): vóór de proef of erna?~~ Ingehaald: het is er (27 sep).
- **33d.** Hoe krijgt een tester het: een bladzijde op internet, of een programma?

## De speeltest van 28 sep

Een script speelde het gehucht twaalf jaren, van 1 lentemaand 1323 tot 1 grasmaand 1324: vier spelers,
elk met zaad 1, 2 en 3 (Marcel koos het zo, werklijst, vraag 45). Het spel stond op commit `9f59661`, zoals
op `main` (`ba8ff55`), en er is niets bijgesteld. Het script staat in `gereedschap/speeltest/`
(`npm run speeltest`): het speelt het spel zoals het draait, klikt en drukt op de knoppen van de vensters, en
hetzelfde zaad geeft precies hetzelfde jaar. De cijfers per maand, in grafieken, staan op de pagina "Een jaar
in het gehucht" (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr), boven die van 27 sep.

De spelers:
- **Braaf** geeft de heer alles wat hij vraagt.
- **Lui, 30% en 60% weg**, zoals B en C van 27 sep: hij zet overdag graan en goud weg in de kelders die het
  dichtst bij zijn, de dag vóór de inner komt en op 1 slachtmaand; hij loopt niet mee en haalt niets terug.
- **Slim, 60% weg**: hij bouwt een kapel, zet 's nachts weg als niemand kijkt (niet bij de roddelaar),
  wacht de inner op bij de weg, praat drie uur met hem, geeft hem een geschenk, loopt met hem heen en weer
  waar hij niets nieuws ziet, leidt de soldaten langs lege kelders, betaalt de heer 90%, en haalt na
  Sint-Maarten alles terug.
- Alle vier bouwen een houthakker als het dorp zegt dat het hout de winter niet haalt.

**Het jaar loopt.** Twaalf keer dertien maanden zonder één fout in de console, en geen venster bleef hangen.

| gemiddeld over drie zaden | braaf | lui, 30% weg | lui, 60% weg | slim, 60% weg |
|---|---|---|---|---|
| De inner zag | 11 van 11 gebouwen, 170 van 209 akkertegels | 11, 172 | 11, 173 | **0 van 12, 0** |
| De heer vroeg | 88 graan, 25 goud | 71 graan, 25 goud | 55 graan, 24 goud | **28 graan, 2 goud** |
| Gegeven | 85%: boete | 75%: boete | 62%: boete en soldaten | 83%: boete van 3 goud |
| Weggezet | niets | 230 graan, 5 goud | 250 graan, 10 goud | 250 graan, 5 goud |
| De soldaten vonden | niets | niets | niets | niets |
| Na Sint-Maarten (graan, goud) | 397, 0 | 414, 5 (230 verstopt) | 429, 10 (250 verstopt) | 437, 5 |
| Mensen (begin 26) | 37 | 33 | 28 | 37 |
| Dood van de kou, van de honger | 0, 0 | 0, 4 | 0, 9 | 0, 0 |
| Tevreden aan het eind | 52% | 52% | 54% | 67% |
| Ongezaaid in lentemaand 1324 | 4% | 100% | 100% | 0% |

**Wat opviel, van belangrijk naar minder:**

1. **De inner is uit te schakelen.** Bij de slimme speler zag hij in alle drie de jaren niets: geen gebouw en
   geen akkertegel. Wie hem opwacht waar de weg de kaart op komt, drie uur met hem praat (dan kijkt hij niet)
   en daarna met hem heen en weer loopt waar hij niets nieuws ziet, houdt hem tot zonsondergang bezig. Hij
   volgt wie naast hem loopt, en niets dwingt hem het dorp te zien. Zijn rapport is dan alleen het graan in
   de schuur en de kist, en de heer vraagt 23 tot 35 graan en 1 tot 3 goud, tegen 85 tot 91 graan en 25 goud
   bij wie niets doet. Dat is heel "arm lijken" in één zet, en er hoeft niets voor verstopt te worden. Wie
   niet meeloopt, laat hem 10 of 11 van de 11 gebouwen en zo'n 172 van de 209 akkertegels zien.
2. **Verstoppen levert weinig op.** De heer vraagt 15% van het graan dat de inner telde. Wie 250 graan
   wegzet, betaalt er zo'n 33 minder (lui 60%: 55 in plaats van 88). Het goud dat hij vraagt, blijft gelijk
   (24 of 25), want dat is hoofdgeld, per gebouw en een deel van de kist.
3. **Wie verstopt en niet terughaalt, verhongert.** Wat verstopt ligt, eet niemand en zaait niemand. De luie
   spelers lieten in lentemaand 1324 alle 179 akkertegels ongezaaid, en in louwmaand en sprokkelmaand stierven
   er gemiddeld 4 (30%) en 9 (60%) van de honger, in één jaar 15. Het bericht op 1 slachtmaand zei in alle zes
   "Het hout en het eten halen de winter": het rekent niet met wat de heer neemt, met zijn soldaten die
   meeëten, en met wat in de kelders ligt. Het bericht in de winter ("Het eten is over 15 dagen op") zegt niet
   dat er nog 240 graan verstopt ligt.
   De slimme speler haalde alles terug: niemand dood, alles gezaaid.
4. **De soldaten vonden in twaalf jaren niets, en de argwaan bleef 0 tot 4%.** De slimme speler leidde ze
   langs lege kelders, zoals bedoeld. Bij de luie spelers zochten ze in volle kelders, ook in die van de
   schout (60% kans), maar het lot viel drie keer boven de 60% (0,85, 0,96 en 0,89; nagerekend, het lot zelf
   is eerlijk). Met drie zaden zegt dat weinig: gemiddeld zou een luie speler per jaar zo'n 36 graan en de helft
   van zijn verstopte goud kwijtraken, ongeveer wat verstoppen hem aan de rekening scheelt. Omdat de argwaan niet steeg, koos de heer
   nooit zelf waar ze zochten, en werd het hele dorp nooit doorzocht. Er valt dus nog niets te gokken: wie
   het weet, leidt ze; wie het niet weet, heeft geluk of pech.
5. **Ook wie alles geeft, krijgt een boete.** De heer vraagt 25 goud: hoofdgeld, per gebouw, en 15% van de
   kist. Het gehucht begint met 20 goud, de houthakker kost er 4, en alleen de marskramer brengt meer. Braaf
   gaf al zijn goud (16) en kwam op 85%: een boete van 14 goud erbij, volgend jaar.
6. **De winter: de waarschuwing werkt.** Op 1 herfstmaand zei het dorp "Het hout haalt 26 van de 90 dagen",
   de spelers bouwden een houthakker, en niemand stierf van de kou (op 27 sep 17 van de 37). De slimme speler
   kon hem pas op 1 slachtmaand betalen (zijn goud ging op aan de kapel en het geschenk), en ook dat was op
   tijd. Eén houthakker is ruim genoeg: aan het eind lag er gemiddeld 135 tot 228 hout.
7. **Getuigen.** Wie overdag verstopte, werd drie tot vijf keer per jaar gezien, en één keer vertelde de
   roddelaar het in de herberg; 's nachts zag niemand de slimme speler. Omdat de soldaten niets vonden, had het
   geen gevolg.
8. **De kapel maakt tevreden.** De slimme speler eindigde op 67% (braaf 52%): de kapel geeft het dorp een kerk.
9. **Voorjaarshonger, zoals op 27 sep.** Van bloeimaand tot hooimaand ligt er geen graan, en op 1 grasmaand
   1324 weer niet: de oogst haalt het jaar net niet.

Wat onderweg aan de regels opviel (betalen op de weg, de inner vanaf middernacht, de schout die blijft staan),
staat in `opmerkingen.md`, bovenaan "Het spel". Wat bijgesteld zou kunnen worden, is vraag 46 in de
werklijst; Marcel (28 sep): "Niet nu. Dit stellen we later in. We maken dan een menu met opties etc."

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
