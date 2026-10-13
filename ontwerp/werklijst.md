# Werklijst: wat we doen, in welke volgorde

Sinds 11 okt 2026, voor de nieuwe richting: de economie van The Settlers met gevechten in beurten (vraag 151,
`gameloop.md`). Marcel, 11 okt: "We hebben een nieuwe lijst nodig met werk. We hebben nu een nieuwe richting. Vergeet
wat er nu openstaat voor de oude game." De lijst van daarvoor staat in `archief/werklijst-tot-11-okt.md`; een
vraagnummer tot 153 dat elders genoemd wordt, vind je daar. Nieuwe punten tellen verder vanaf 154.

Houd deze lijst kort: wat af is, gaat eruit (één regel onder "Af"), en het hoe staat in het ontwerpbestand van het
onderwerp, niet hier. Wie aan een punt begint, zet er "**Bezig in sessie `<branch>`** (datum)" bij, in `main` (CLAUDE.md).

## Nu en daarna (13 okt)

**Ronde 1 van het snoeien is af** (A, 11 okt): de graanzak, het oude doel van de demo, het ontginnen als verzoek en
drie oude keuzes in de spelregels zijn eruit; het land en de quests blijven (`snoeien.md`). **B, 1c tot 1e zijn af** (11
okt): het bouwmenu, verhuizen uit het kamp, het bouwbereik, het huis van de schout, meebouwen, bouwen in het bos, en
boeren uit het niets (de boerderij, de velden die jij legt, wijn is eten). **Het spel is Engels** (11 okt, G). **B, 1f
is af** (12 okt): de kolonist speelt het lege begin op vijf eilanden een jaar zonder fouten. **Ronde 2 van het
snoeien is af** (A, 12 okt, stap 1 tot 6): de verzoeken, de ondernemers, de erven en het ontginnen zijn weg; "Leeg" is
het enige begin, een boer is de man op een boerderij, alleen de kolonist speelt nog in de speeltest; het plein heeft
een vaste marktplek (de spelregel "De markt" is weg), en de maker legt alleen nog het lege land: alles bouwt de speler.
De toetsen en het gereedschap spelen op het proefdorp (`T.proefdorp`, `Spel.debug.proefdorp`). **B1 is af** (12 okt): de
wijnboerderij is een eigen gebouw, met de wijngaard als veld ernaast. **B2 is bezig** (13 okt): het plan staat
(`kaarten.md`, "Het hele eiland"), B2a, B2b (de kaart in stukken) en B2d zijn af; B2c (de mist) is het volgende. Daarna de afwisseling (B3), en ronde 3 na C.

**Eerst optimaliseren** (Marcel, 13 okt: "noteren voor de nieuwe sessie dat we eerst meer optimalisaties
uitvoeren"), vóór B2c. Meten met `npm run stukmeting` (de schout op 30× van het kamp naar de kust, in de browser; wat
het nu geeft staat in `kaarten.md`, "Het hele eiland"). De nacht van het dorp is af (onder "Af"). Uitgezocht (13 okt,
`kaarten.md`, "Wat de meting mat"): de trage tekenbeelden met een stilstaande schout en bij de meeschuivende camera
zijn het bos: daar staan 20 tot 30 bomen vóór de schout, en elk tekent zijn eigen kijkgat om hem heen. En "tekenen" in
de meting is alleen de tijd van de code: zonder videokaart schildert de browser het beeld grotendeels daarna. Het
plan (Marcel, 13 okt: "volgorde 1 tot 4 is goed"; ook zonder videokaart moet het lopen: "Het liefste wel. Je zult net
zien dat er een niche markt is voor spelers met low end hardware"). **Bezig in sessie `ccr-beba0277-q5zzk8`** (13 okt):
1. **De meetlat:** `npm run stukmeting` geeft ook de echte tijd tussen twee beelden, en meet ook met het pad van de
   videokaart.
2. **Eén kijkgat per persoon:** alleen het voorste voorwerp dat iemand bedekt, maakt het gat (Marcel: "Dat is prima";
   alleen de zachte rand gaat iets minder open).
3. **Een kaartverandering tekent alleen de grond rond die plek opnieuw** (een gevelde boom, een gebouw), een stuk per
   beeld, zoals nieuw land; nu de hele grond in beeld (49 ms in plaats van 11).
4. **Opnieuw meten, en het stuk dat niet klaar lag** (23 tot 64 ms land maken, 8 van de 18 stukken): verder vooruit
   maken langs het pad van de schout (`vooruit`, `vooruitMs` in `T.WERELD_INSTELLINGEN`).
5. **Daarna: het bos zonder videokaart.** In het bos 67 ms per beeld, ook zonder kijkgaten (1100 bomen, op de processor
   twee keer vergroot); met een videokaart gaan ze in 60 tot 90 opdrachten. Wat het kan worden, eerst met Marcel.
- Daarna, of tussendoor: de toets voor dubbele namen in `Spel` (`opmerkingen.md`).

**Wacht op Marcel:**
- **Meten op je eigen pc** (13 okt, Marcel: "kan ik straks wel even doen"): Nieuw spel, loop met de schout het bos in
  ten zuiden van het kamp, blijf staan en druk `F2`: hoeveel beelden per seconde, en wat zegt de meter over tekenen?
- **Het hele eiland bekijken** (B2b): Nieuw spel, en loop met de schout het land uit, naar de kust (met `F2` de meter):
  het land gaat open waar hij komt. Op 30× hapert het nog even als hij heel snel nieuw land in loopt; zeg het als je dat
  ziet. Wat opviel en te kiezen is (`opmerkingen.md`): een richel zonder helling blijft onbereikbaar, en een hol kan
  tien tegels van het kamp liggen.
- **De wijnboerderij bekijken** (B1): Nieuw spel, en in het bouwmenu (B) de wijnboerderij; is ze af, dan trekt er een
  gezin in, en de wijngaard leg je met twee klikken ernaast (de akker kan alleen nog bij een boerderij). In wijnmaand
  plukt het gezin. Haalt de wijn het jaar niet, dan zegt de raad onder het doel: leg een wijngaard erbij.
- **De marktplek bekijken** (stap 6a): Nieuw spel, en het bouwmenu (B): de marktplek ligt in zacht goud op het plein; met
  de markt in de hand (vanaf een dorp) licht hij groen op, en een huis mag er niet tegenaan.
- **Drie gaten die stap 6 liet zien** (`opmerkingen.md`): in het lege begin komt er nooit vee (geen melk, kaas of wol); de
  rotsen en het water liggen vaak buiten het bouwbereik (geen steengroeve, visser of rietsnijder); en de samenvatting
  (`het-spel-in-het-kort.pdf`) beschrijft nog het spel van vóór 11 okt.
- **1c tot 1e bekijken:** Nieuw spel (of in de console `Spel.debug.begin(2)`). Is het kamp op, open dan het bouwmenu (B): het bouwbereik gloeit op de grond. Zet het huis van de schout neer, ook in het bos (de bouwers rooien eerst, en het hout
  komt in de voorraad), en een hut op open grond: wie geen werk heeft, loopt erheen en bouwt. Is de hut af, dan trekt
  er een gezin in; is het huis af, dan verhuist de schout en wordt de huifkar de ossenkar. Zet een boerderij neer en kies
  in het bouwmenu de akker of de wijngaard: klik de ene hoek en dan de andere, bij de boerderij (rechtsklik haalt de
  eerste hoek weg). Het eerste veld bepaalt wat de boerderij is; is ze af, dan trekt er een gezin in en is de man boer,
  en een akker die vóór bloeimaand af is, wordt nog gezaaid. Te kiezen in de werkbank ("Meebouwen" en "Boeren uit het
  niets"): twee werkdagen per bouwdag, vier bouwers per plaats, een kwart werkdag per boom, een veld van 12 tot 40
  tegels binnen 8 tegels van de boerderij, en wat een tegel wijn voedt (`wijnAlsGraan`, 0,4).
- **Het Engels lezen** (11 okt): de woorden die de agents kozen staan in `engels.md`, met per deel een tabel "Erbij in
  deel …"; de keuzes om na te kijken: *the innkeeper*, *the moneylender*, *the tradesmen* (de ondernemers), *rent* (de
  pacht), *the ledger* (het rekenboek), *Martinmas*, *Good day* (het afscheid van een boer), de oorlogsplaatsen Crookwick
  en Eastwold, en de namen (Nicholas, Alice, Gerard, Kate, Walter; Heathside). Een woord veranderen is één regel in
  `engels.md` en een zoekslag.
- **Het doel van de demo.** CLAUDE.md zegt nog "je wint als iedereen een jaar super gelukkig is"; dat is het oude spel.
  Voorstel van Claude (11 okt): de demo is het eerste jaar: je komt met de kar, bouwt, haalt de eerste winter, en het
  eind is het eerste gevecht (de mannen van de heer of rovers), zodat een speler in Next Fest de economie, het gevecht
  in beurten en de heer alle drie ziet.
- De spullen bij de huizen (vraag 148, d): mee in een ronde van de huizen, of weg.
- De ronde van alle huizen bekijken (vraag 144, in `main` sinds 11 okt): de knoppen A tot J op elke tekening, jong en
  oud, sneeuw op de daken, de fasen van het afbranden (`beeld.md`, "De ronde van alle tekeningen"; wat daar nog open is,
  staat in het archief bij de ronde).
- Het geluid (vraag 145, 2): de sleutel `FREESOUND_KEY` in de omgeving en de domeinen van Freesound erbij; dan maakt een
  sessie het.

**Daarna, in deze volgorde:** A, B1, B2, B3, C, D, E, F; G loopt ernaast op het tijdpad van `commercieel.md`.

## A. Opruimen (vraag 153, stap 3)

Marcel, 11 okt: "Dan starten we met snoeien", vóór B, zodat 1c tot 1f de oude systemen niet draaiende hoeven te
houden. De afspraak (vraag 153): wat om is, gaat eruit en blijft niet als spelregel staan; git bewaart het. Per
systeem: **blijft**, **slaapt** (de code blijft, er wordt niet aan gebouwd) of **weg**; Marcel vinkt af. In drie
ronden, want een deel hangt aan het oude begin of aan de proef:

1. **Ronde 1 is af** (11 okt): wat al om was en nergens meer aan hing (`snoeien.md`).
2. **Ronde 2, na 1f:** het plan, met wat Marcel koos ("III. OK", "e Mag weg, f alle vier weg, g weg, h ja wapens
   blijven"), en de kaart van wat eraan hangt, staan in `snoeien.md`, "Ronde 2". **Stap 1 en 2 zijn af** (12 okt: verhuizen
   wat blijft; de verzoeken, de ondernemers, de erven en het ontginnen weg, met "Wie bouwt" en "Huizen"; de wijnboerderij
   blijft, vraag 155). **Stap 3 tot 5 zijn af** (12 okt; Marcel: "B: lege begin met een proefdorp", en stap 4 "nu mee"):
   "Leeg" is het enige begin, het ontworpen gehucht is weg, het lot en de karakters zijn weg (een boer is de man op een
   boerderij), en alleen de kolonist speelt nog in de speeltest. **Stap 6 is af** (12 okt; Marcel: "Alles wordt door spelers
   geplaatst", en "Plein krijgt plaatsen"): het dorp dat er al was is weg, ook voor de andere dorpen op het eiland, en het
   plein heeft een vaste marktplek; de spelregel "De markt" is weg (`snoeien.md`, "Stap 6"). **Ronde 2 is af.**
3. **Ronde 3, na C:** wat de proef moet uitwijzen (`gameloop.md`, "Open"): de voorvallen, de raad, de raadsman, het
   rapport, de wensen per stand en de treden, de wetten, de feesten.

Mee in elke ronde: het commentaar in de code dat "zie CLAUDE.md" zegt (een stuk of twintig) wijst naar `code.md` of
`gereedschap.md`, en `code.md` krimpt mee met de code.

## B. Zelf bouwen vanaf niets (vraag 152, stap 1)

Het plan staat in het archief bij vraag 152; 1a (optie 1), 1b (het lege land), 1c (het kamp, met het bouwmenu), 1d
(binnen bereik, en met handen), 1e (boeren uit het niets) en 1f (een jaar zonder fouten) zijn af; hoe het nu werkt:
`spel.md`, "Zo werkt het lege begin nu".

## B1. De wijnboerderij als eigen gebouw (vraag 155): af

Af op 12 okt (Marcel: "ik wil tóch een apart wijnboerderij gebouw", en "A gehucht, b ja, c ja"): een huis van 5 bij 4
met een gezin, vanaf het gehucht, 18 hout en 8 goud, de heer wil 10 wijn; de wijngaard is een veld bij een
wijnboerderij, de akker bij een boerderij; de raad zegt het als de wijn het jaar niet haalt. Hoe het werkt: `spel.md`,
"Zo werkt het lege begin nu", en `code.md` bij `js/boerderij.js` en `js/wijngaard.js`.

## B2. Het hele eiland (vraag 117, stap 3)

Marcel, 11 okt: "de wereld moet 1 geheel worden het vlakke van 100x100 is niet hoe het blijft", vóór C, want C meet
afstanden. Het plan (13 okt; Marcel: "A ja, B1, C2"), met het hoe en wat er nu is, in `kaarten.md`, "Het hele eiland":
- **B2a, één weg naar de tegels: af** (13 okt): niets leest de rechthoek van 100 bij 100 nog zelf, en het spel
  veranderde niet (de speeltest en de schermen gelijk); versie 9 van het bewaarde spel.
- **B2b, de kaart in stukken: af** (13 okt; Marcel: "Het eiland, overal", "Overal", "Die van het eiland", "Al je
  mensen", "Eerst meten", "Alles per stuk"): het hele eiland in stukken van 64 bij 64, het land overal van het eiland,
  de rand weg; het land gaat open waar je mensen komen, en alles neemt alleen het nieuwe stuk erbij, vooruit gemaakt.
  Hoe en wat het meten gaf: `kaarten.md`, "Het hele eiland". Nog voor later: de hoogte per stuk (de spelregel Hoogte,
  standaard uit).
- **B2c, de mist:** zwart, grijs (het land zoals het nu is, zonder wie er loopt), en helder waar je mensen kijken; bij
  het begin ken je een kring van zo'n 50 tegels.
- **B2d, opslaan wat veranderde: af** (met B2b; Marcel: "Meteen mee"): versie 10, het bewaarde spel 15 kB (was 473 kB).

Klaar als: de kolonist op vijf eilanden een jaar zonder fouten, de schout van het kamp naar de kust zonder haperen, en
een kleiner bewaard spel. De lange tochten (HPA\*) en wat ver weg is als getallen gaan naar F.

## B3. Afwisseling (vraag 154)

Marcel, 11 okt: "Wijn wordt ook eten. Afwisseling wordt de kern. Mensen worden anders minder productief." Wie maar één
ding eet, werkt minder; wat er al is en wat het vraagt: `gameloop.md`, "Besloten". Eerst een plan met Marcel: welke
soorten eten tellen, hoe je afwisseling meet, en wat minder productief is. Na B2 en vóór C, zodat C de echte economie
meet (Marcel: "3 ja").

## C. De ossenkar (vraag 152, de proef)

Besloten (Marcel, 11 okt): bouwen binnen bereik van het plein en elke opslag, geen grens en geen vlaggen; de kar rijdt
overal, over een weg sneller; een ossenkar; de eerste opslag is het huis van de schout.
1. Wat een gebouw maakt, ligt in een stapel bij zijn deur; één kar haalt het hout, en het telt pas in de opslag.
2. De bouwplaats en de timmerman krijgen hun hout met de kar; je ziet waar het stokt (de stapels groeien).
3. Een schuur verder weg geeft daar bereik; een tweede kar.
4. Meten en spelen: de speeltest vanaf een lege plek. Dan ronde 3 van A.

## D. De besturing en de klok

De camera los, en de schout een held die je aanklikt (A van vraag 151). De klok: een jaar is nu 30 uur op 1×; de proef
laat zien op welke snelheid het goed oogt.

## E. De heer als klok en tegenstander

Wat de loop wordt en hoe lang een ronde is, staat open (`gameloop.md`). Voorstellen van 11 okt, nog niet gekozen: de
belasting gaat met een kar over de weg (A: de heer stuurt hem naar je plein; B: de schout brengt hem zelf naar het
kasteel, en de opstand rijdt later dezelfde weg), en de heer vraagt wat hij je ziet maken. Hier beslissen we ook de
spelregels van de heer: "Waarin de heer betaald wil worden", "Hoe de heer telt", "Het goud in de kist", "Wat de heer van
het graan vraagt", de schandpaal, de heervaart en de twee bazen.

## F. Vechten

- Verdedigen: rovers en wolven tegen je dorp en je kar, met de militie (`js/rovers.js`). Voorstel van 11 okt, nog niet
  gekozen: een wapen maakt de soldaat (een hooivork militie, een speer een speerman), en elke soldaat is een werker minder.
- Erop uit, zoals in Jagged Alliance 2: over het eiland (B2) naar een ander dorp, en naar het kasteel van de heer.
  Daarvoor eerst de lange tochten (HPA\* over de stukken van B2) en wat ver weg is als getallen (Marcel, 13 okt: "A ja").

## G. Naar Steam (`commercieel.md`)

- Een proefversie voor Marcels 4K-scherm en een eerste tester (`npm run proefversie`), na C.
- Het geluid (vraag 145, 2), zodra de sleutel er is.
- Januari 2027: de Steam-pagina (een capsule, vijf plaatjes, een trailer van een minuut); de naam is er (Tithebreaker).
- Juni 2027: de demo in Steam Next Fest.
- Het spel in het kort (`het-spel-in-het-kort.pdf`, `npm run samenvatting`) beschrijft nog het oude spel: opnieuw
  schrijven voor de nieuwe richting, als B en C er staan.

## Af (sinds 11 okt)

- De nacht van het dorp (eerst optimaliseren; 13 okt, Marcel: "Ja, bouw het zo"): het beeld waarin een nieuwe dag
  begint, kostte 100 tot 150 ms, waarvan 74 tot 94 in de beesten: elke nacht vroeg `bosKaart` voor alle tegels om het
  dorp `T.isBos` met het jonge bos, 25 tegels per tegel. `T.bosInVak` (`js/bos.js`) doet het hele vak in één keer met
  een optelsom, met dezelfde uitkomst (een toets, en de kolonist op vijf eilanden speelt precies hetzelfde jaar). Nu 29
  tot 38 ms, als een gewoon beeld; de beesten 4 tot 7. Zuiniger kan nog (`opmerkingen.md`).

- B2b en B2d, het hele eiland in stukken (vraag 117, stap 3; 13 okt): de kaart is het eiland in stukken van 64 bij 64,
  het land komt overal van het eiland, en de maker legt alleen nog het plein, het kamp, de eiken en de marktplek (die
  hij nu ook keurt). Het land gaat open waar je mensen komen, alles neemt alleen het nieuwe stuk erbij, en het wordt
  vooruit gemaakt. Bewaard wordt alleen wat veranderde (15 kB, was 473). De kolonist speelt vijf eilanden het jaar uit
  zonder fouten en zonder doden. `kaarten.md`, "Het hele eiland".

- Ronde 2 van het snoeien, stap 6 (vraag 153; Marcel: "Alles wordt door spelers geplaatst", "Plein krijgt plaatsen", "In
  het bouwmenu", "Naar de waard"): het plein heeft een vaste marktplek die de maker kiest (een huis blijft ervan af, en
  hij licht op in het bouwmenu), de spelregel "De markt" is weg; de maker legt alleen nog het lege land (op twaalf
  eilanden byte voor byte gelijk gebleven), een kaart zet geen gebouwen, akkers of voorraad meer, de vijf boeren en de
  herbergierster zijn weg, en wat de herbergierster deed (het gesprek, de tap), doet de waard. Het proefdorp staat in het
  spel, en het gereedschap speelt erop. `snoeien.md`, "Stap 6".

- Ronde 2 van het snoeien, stap 3 tot 5 (vraag 153; Marcel: "B: lege begin met een proefdorp", "Ja, nu mee", "e Mag weg",
  "f alle vier weg", "g weg"): "Leeg" is het enige begin, het ontworpen gehucht is weg, een boer is de man op een
  boerderij (het lot en de karakters weg), alleen de kolonist speelt nog in de speeltest, en de toetsen spelen op een
  proefdorp (`test/grond.cjs`). Wat er onderweg bleek en mee ging (boeren trokken weg in het lege begin, de schandpaal
  voor een boer, wie te hulp schiet): `snoeien.md`, "Stap 3, 4 en 5".

- Ronde 2 van het snoeien, stap 2 (vraag 153; Marcel: "III. OK", "1 ja 2 ja 3 houden voor nu"): de verzoeken en de
  ondernemers (met "Wie bouwt"), de erven (met "Huizen", en opslaan naar versie 6) en het ontginnen zijn weg; jij bouwt
  alles uit het bouwmenu. Wat ervan afhing en mee ging, en wat bleef (de wapens, het vooruitkijken van de wijn):
  `snoeien.md`, "Stap 2".

- Een jaar zonder fouten (vraag 152, 1f; Marcel: "a1, b1, c1, d ja", "a ja, b uit, c ja", "I. 3, II. 16 tegels"): de
  kolonist (`gereedschap/speeltest/kolonist.js`), een speler in code die het lege begin speelt met de handelingen van het
  bouwmenu, in de speeltest (`npm run speeltest -- kolonist`) en in een toets; op vijf eilanden een jaar zonder fouten.
  Wat hij vond en wat erop volgde (een jager, de kapelregel uit in het lege begin, 2 hout per gerooide boom, het
  bouwbereik 16 tegels; de schout die alleen vecht, blijft tot F): `speelbaar.md`, 12 okt.

- Engels (vraag 147, stap 2; Marcel: "Alles gelijk in het Engels maken. Nederlands mag je mee stoppen", en op de vragen:
  alleen wat de speler ziet, het Nederlands weg maar `T.t` blijft, gewone maanden en Engelse namen): alle spelteksten in
  `js/` zijn Engels, zo'n 3.000 zinnen, in zeven delen door agents; `taal/nl.js` is weg, de toetsen spelen in het
  Engels, en `test/taal.test.cjs` kijkt elk bestand na. De woorden en de toon: `engels.md`. De speeltest daarna: negen
  spellen, nul fouten.

- Boeren uit het niets (vraag 152, 1e; Marcel: "A2", "Inderdaad met b2", "Ja dat is goed. De bouwers pakken het op", "De
  karakters zetten we even opzij", "2 ja"): een gezin trekt in de boerderij en de man is boer, de akker en de wijngaard
  trek je zelf met twee klikken en de bouwers maken ze, het eerste veld bepaalt de boerderij, en wijn vult een maag
  (`js/boerderij.js`).

- Binnen bereik, en met handen (vraag 152, 1d; Marcel: "a1, b ja, c ja, d ja, e ja"): het bouwbereik van 12 tegels, het
  huis van de schout in het bouwmenu (dan wordt de huifkar de ossenkar), meebouwen (`js/bouwen.js`) en bouwen in het bos.

- Het kamp, met het bouwmenu (vraag 152, 1c; Marcel: "We willen dus een bouwmenu en zelf bouwen", "Kleinere gezinnen",
  "Per tent"): "Leeg" zet "Huizen" en "Wie bouwt" op "Jij", een gezin in de kar is een man, een vrouw en een kind, is een
  hut of huis af dan trekt er een gezin uit het kamp in en gaat zijn tent weg, en zolang er een gezin in het kamp woont,
  komt er geen nieuw gezin over de weg.

- Optie 1: het verstoppen, de inner, de argwaan en "arm lijken" zijn eruit (vraag 151).
- Het lege land: de huifkar rijdt een leeg stuk van het eiland in, met het kamp op het plein (vraag 152, 1b).
- CLAUDE.md van 153 naar 19 KB (vraag 153, stap 1), deze nieuwe werklijst (stap 2), en ronde 1 van het snoeien.
- De ronde van alle huizen (vraag 144).
- De wijnboerderij als eigen gebouw (B1, vraag 155).
- De naam: Tithebreaker, vrij op Steam en in de merkenregisters (`commercieel.md`).
