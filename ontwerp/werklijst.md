# Werklijst: wat we doen, in welke volgorde

Sinds 11 okt 2026, voor de nieuwe richting: de economie van The Settlers met gevechten in beurten (vraag 151,
`gameloop.md`). Marcel, 11 okt: "We hebben een nieuwe lijst nodig met werk. We hebben nu een nieuwe richting. Vergeet
wat er nu openstaat voor de oude game." De lijst van daarvoor staat in `archief/werklijst-tot-11-okt.md`; een
vraagnummer tot 153 dat elders genoemd wordt, vind je daar. Nieuwe punten tellen verder vanaf 154.

Houd deze lijst kort: wat af is, gaat eruit (één regel onder "Af"), en het hoe staat in het ontwerpbestand van het
onderwerp, niet hier. Wie aan een punt begint, zet er "**Bezig in sessie `<branch>`** (datum)" bij, in `main` (CLAUDE.md).

## Nu en daarna (11 okt)

**Ronde 1 van het snoeien is af** (A, 11 okt): de graanzak, het oude doel van de demo, het ontginnen als verzoek en
drie oude keuzes in de spelregels zijn eruit; het land en de quests blijven (`snoeien.md`). **B, 1c en 1d zijn af** (11
okt): het bouwmenu, verhuizen uit het kamp, het bouwbereik, het huis van de schout, meebouwen en bouwen in het bos.
**Het volgende punt is B, 1e: boeren uit het niets, met de keuze akkerbouwer of wijnboer.** Ronde 2 van het snoeien
volgt na 1f, ronde 3 na C.

**Wacht op Marcel:**
- **1c en 1d bekijken** (op branch `ccr-5dd998e4-j3q8e2` tot hij in `main` is): Spelregels, "Het begin" op "Leeg", en
  dan Nieuw spel (of in de console `Spel.debug.begin('leeg', 2)`). Is het kamp op, open dan het bouwmenu (B): het
  bouwbereik gloeit op de grond. Zet het huis van de schout neer, ook in het bos (de bouwers rooien eerst, en het hout
  komt in de voorraad), en een hut op open grond: wie geen werk heeft, loopt erheen en bouwt. Is de hut af, dan trekt
  er een gezin in; is het huis af, dan verhuist de schout en wordt de huifkar de ossenkar. Te kiezen in de werkbank
  ("Meebouwen"): twee werkdagen per bouwdag, vier bouwers per plaats, een kwart werkdag per boom.
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

**Daarna, in deze volgorde:** A, B, C, D, E, F; G loopt ernaast op het tijdpad van `commercieel.md`.

## A. Opruimen (vraag 153, stap 3)

Marcel, 11 okt: "Dan starten we met snoeien", vóór B, zodat 1c tot 1f de oude systemen niet draaiende hoeven te
houden. De afspraak (vraag 153): wat om is, gaat eruit en blijft niet als spelregel staan; git bewaart het. Per
systeem: **blijft**, **slaapt** (de code blijft, er wordt niet aan gebouwd) of **weg**; Marcel vinkt af. In drie
ronden, want een deel hangt aan het oude begin of aan de proef:

1. **Ronde 1 is af** (11 okt): wat al om was en nergens meer aan hing (`snoeien.md`).
2. **Ronde 2, na 1f:** wat het oude begin draaiende houdt: de mensen die vragen wat ze bouwen (`verzoeken`,
   `ondernemers`), de erven waarop het dorp zelf bouwt (`erven`), de vaste boeren van de kaart, en de spelregels "Het
   begin", "Je gehucht", "Wie bouwt", "Huizen" en "Wie de boeren zijn".
3. **Ronde 3, na C:** wat de proef moet uitwijzen (`gameloop.md`, "Open"): de voorvallen, de raad, de raadsman, het
   rapport, de wensen per stand en de treden, de wetten, de feesten.

Mee in elke ronde: het commentaar in de code dat "zie CLAUDE.md" zegt (een stuk of twintig) wijst naar `code.md` of
`gereedschap.md`, en `code.md` krimpt mee met de code.

## B. Zelf bouwen vanaf niets (vraag 152, stap 1)

Het plan staat in het archief bij vraag 152; 1a (optie 1), 1b (het lege land), 1c (het kamp, met het bouwmenu) en 1d
(binnen bereik, en met handen) zijn af; hoe het nu werkt: `spel.md`, "Zo werkt het lege begin nu".
- **1e, boeren uit het niets:** je bouwt een boerderij en kiest akkerbouwer of wijnboer (Marcel, 11 okt: "Je kiest dan
  agrariër of wijnboer. Zoals bij Knights and Merchants"); het gezin dat erin trekt, wordt die boer, met een geloot
  karakter; en bij een akkerbouwer leg jij de akkers (uit 1d, e: een akker zonder boer doet niets).
- **1f, een jaar zonder fouten:** een toets speelt een jaar vanaf een lege plek, met een speler in code die bouwt. Dan
  is "Leeg" het enige begin, en volgt ronde 2 van A.

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
- Erop uit, zoals in Jagged Alliance 2: het eiland met de mist (vraag 117, stap 3), een ander dorp, het kasteel van de heer.

## G. Naar Steam (`commercieel.md`)

- Engels (vraag 147, stap 2: alle tekst omzetten), na ronde 1 van A, want het raakt bijna heel `js/`. **Bezig in sessie
  `ccr-99e707bb-sla81d`** (10 okt): het plan, met Marcel.
- Een proefversie voor Marcels 4K-scherm en een eerste tester (`npm run proefversie`), na C.
- Het geluid (vraag 145, 2), zodra de sleutel er is.
- Januari 2027: de Steam-pagina (een capsule, vijf plaatjes, een trailer van een minuut); de naam is er (Tithebreaker).
- Juni 2027: de demo in Steam Next Fest.
- Het spel in het kort (`het-spel-in-het-kort.pdf`, `npm run samenvatting`) beschrijft nog het oude spel: opnieuw
  schrijven voor de nieuwe richting, als B en C er staan.

## Af (sinds 11 okt)

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
- De naam: Tithebreaker, vrij op Steam en in de merkenregisters (`commercieel.md`).
