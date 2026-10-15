# Werklijst: wat we doen, in welke volgorde

Sinds 11 okt 2026, voor de nieuwe richting: de economie van The Settlers met gevechten in beurten (vraag 151,
`gameloop.md`). Marcel, 11 okt: "We hebben een nieuwe lijst nodig met werk. We hebben nu een nieuwe richting. Vergeet
wat er nu openstaat voor de oude game." De lijst van daarvoor staat in `archief/werklijst-tot-11-okt.md`; een
vraagnummer tot 153 dat elders genoemd wordt, vind je daar. Nieuwe punten tellen verder vanaf 154.

Houd deze lijst kort: wat af is, gaat eruit (één regel onder "Af"), en het hoe staat in het ontwerpbestand van het
onderwerp, niet hier. Wie aan een punt begint, zet er "**Bezig in sessie `<branch>`** (datum)" bij, in `main` (CLAUDE.md).

## Nu en daarna (14 okt)

**Ronde 1 van het snoeien is af** (A, 11 okt): de graanzak, het oude doel van de demo, het ontginnen als verzoek en
drie oude keuzes in de spelregels zijn eruit; het land en de quests blijven (`snoeien.md`). **B, 1c tot 1e zijn af** (11
okt): het bouwmenu, verhuizen uit het kamp, het bouwbereik, het huis van de schout, meebouwen, bouwen in het bos, en
boeren uit het niets (de boerderij, de velden die jij legt, wijn is eten). **Het spel is Engels** (11 okt, G). **B, 1f
is af** (12 okt): de kolonist speelt het lege begin op vijf eilanden een jaar zonder fouten. **Ronde 2 van het
snoeien is af** (A, 12 okt, stap 1 tot 6): de verzoeken, de ondernemers, de erven en het ontginnen zijn weg; "Leeg" is
het enige begin, een boer is de man op een boerderij, alleen de kolonist speelt nog in de speeltest; het plein heeft
een vaste marktplek (de spelregel "De markt" is weg), en de maker legt alleen nog het lege land: alles bouwt de speler.
De toetsen en het gereedschap spelen op het proefdorp (`T.proefdorp`, `Spel.debug.proefdorp`). **B1 is af** (12 okt): de
wijnboerderij is een eigen gebouw, met de wijngaard als veld ernaast. **B2 is af** (13 okt, onder "Af"), op Marcels blik
na: het hele eiland in stukken, opslaan wat veranderde, het optimaliseren, en de mist (B2c).

**B3 is af** (13 okt, onder "Af", in `main`): het dorp eet in gelijke delen van elke soort, en hoe meer soorten, hoe
harder al het werk gaat. **C, de ossenkar, loopt** (14 okt): het plan staat bij C (Marcel: "A2, B2, C1, D2, E2").
**Stap 1 tot 4 zijn af** (14 okt, in `main`; hoe het werkt: `spel.md`, "Zo werkt de kar nu"): alles wat een gebouw
maakt, ligt bij de deur tot de kar het haalt, de bouwplaats en de werkplaats krijgen hun waren met de kar, en een schuur
is een opslag met een eigen bereik en een eigen kar. **Stap 5 is af** (14 okt): wegen die jij legt, en afbreken (`spel.md`,
"Zo werken de wegen en het afbreken nu"). **Het volgende is stap 6, meten en spelen.**

**Marcel kwam op 14 okt met acht punten** (H, vraag 156 tot 163: een gebouw aanklikken, de keten van stammen tot
planken, muren, soldaten uit wapens, handel, reizende gezelschappen, provincies, een kasteel), en koos de volgorde en de
eerste antwoorden (bij H). **156, een gebouw aanklikken, is af** (14 okt, in `main`; `spel.md`, "Zo werkt het briefje
van een gebouw nu"), en **164, een minimale balk onderaan, 165, een minimap van het hele eiland, en 166, een dunne balk
bovenaan, ook** (14 okt, in `main`; het scherm zo leeg mogelijk, CLAUDE.md). **157, de zagerij en de planken, is af**
(14 okt, op de branch `claude/village-economy-gameplay-lmsnyg`; `spel.md`, "Zo werkt de keten van stammen tot planken
nu"): een kapschuur in de stijl van het land, na vijf proefplaten. **168, de zager aan het werk, is af** (15 okt, op
dezelfde branch; `spel.md`, bij de keten): de eerste hand staat voor de deur en zaagt aan de zaagbok, in zijn eigen
uiterlijk. **C6 is gemeten** (15 okt; `speelbaar.md`, "De speeltest van 15 okt"): één kar is ruim genoeg voor een gehucht
(45 tot 60% bezig), een waar ligt minder dan een dag op een stapel, en weinig wacht op de kar; maar het dorp groeit niet
(de kolonist bouwt geen put en geen hut voor wie erbij wil), dus de planken meet het nog niet. Dat laten we zo (Marcel, 15
okt: "Uiteindelijke balancing wordt later gedaan", "Ikzelf test het echte spel wel", "jij hoeft alleen te testen of het
werkt zoals het moet werken"): **de speeltest toetst of het werkt, niet de balans**, en het groeien test Marcel zelf, met
een debugvenster. **169, het debugvenster onder D, is af** (15 okt, op de branch `claude/wizardly-sagan-qw7f8f`;
`code.md`, bij `js/debugvenster.js`). **159 met 158 loopt** (het plan bij H, besloten 15 okt): **stap 1, de soldaten,
is af** (15 okt, in `main`; `spel.md`, "Zo werken de soldaten nu"): zes soorten in het wachthuis, de wapenmaker in het
gehucht met zeven stukken, en elk wapen een eigen slag. **Stap 2 werd vraag 170** (Marcel, 15 okt: "de schout verdwijnt", "Het concept gaan om naar RTS"; `gameloop.md`,
"Bijgesteld op 15 okt"): je stuurt en bouwt van bovenaf als een god, de schout wordt een held (*Commander*) die kan
meevechten, het gevecht is in real time, en live samen spelen zit al in de demo, in lockstep. Het plan staat bij I,
besloten. **Stap 0 is af** (15 okt, in `main`; `code.md` bij `js/tik.js`): de wereld tikt zestig keer per seconde, los
van de beelden, haar toeval komt uit het zaad (nooit `Math.random`), en bouwen, wegen, velden, afbreken en de soldaten
zijn opdrachten die op een tik ingaan. **Stap 1 is af** (15 okt, in `main`;
`spel.md`, "Zo werkt kijken, kiezen en sturen nu"): de camera los, links kiezen, rechts sturen (de post), groepen onder
een cijfer, en een bericht brengt je erheen. **Het volgende is stap 2, het gevecht in real time** (bij I). Let op:
CLAUDE.md zit tegen de grens van 20 KB; haal eerst iets naar een ontwerpbestand als er een afspraak bij moet.

**Wacht op Marcel:**
- **Kijken, kiezen en sturen bekijken** (vraag 170, stap 1, 15 okt): Nieuw spel. De
  camera volgt de schout niet meer: de pijltjes of de muis tegen de rand van het scherm schuiven het beeld, het wiel zoomt,
  een klik op de minikaart kijkt daar, en Tab kiest de held en kijkt naar hem. Zet een wachthuis (B) en op zijn briefje
  twee man militie (+). Klik op een soldaat (een gouden ring om zijn voeten, rechts zijn briefje), trek een kader om
  allebei, of dubbelklik op een van hen (alle militie in beeld). Klik rechts op de grond (*Send 2 men here*): daar staan
  ze voortaan van het opstaan tot het slapen, tot je *Back to the guardhouse* drukt op hun briefje. Shift+1 maakt er groep
  1 van (Ctrl+1 neemt Chrome zelf), 1 kiest hem, en 1 twee keer kijkt ernaar. Klik op een dorpeling: zijn briefje; de
  waard heeft *Talk*. Laat rovers komen (`Spel.debug.rovers(3)`): het bericht is onderstreept, een klik erop of Spatie
  brengt je erheen, en de plek knippert op de minikaart; rechts op een rover stuurt je mannen erop af. Slaan doen ze pas in
  stap 2: tot dan begint het gevecht in beurten als een rover de held ziet. Te kiezen in de werkbank ("Choosing and
  sending"): hoe dicht bij de rand de muis schuift (8 pixels; 0 zet het uit) en hoe snel (900).
- **Spelen na stap 0** (vraag 170, 15 okt): het spel moet er precies zo uitzien en zo spelen als ervoor; de wereld rekent
  nu in vaste tikken van een zestigste seconde. Let op of het lopen hortend oogt, vooral op een scherm van meer dan 60 Hz:
  het beeld schuift tussen twee tikken nog niet mee (dat kan erbij, als je het ziet).
- **De soldaten bekijken** (159, stap 1, 15 okt): Nieuw spel, en zet een wachthuis (B). Klik erop als het af is: op zijn
  briefje zes soorten met − en +. Druk + bij Militia: wie geen werk heeft, pakt een hooivork en staat overdag bij het
  wachthuis. Zet dan een wapenmaker (in het gehucht, 12 stammen en 14 goud), geef jezelf planken (D, +50), en druk +
  bij Spearman: de wapenmaker maakt een speer en een schild, de kar brengt ze binnen, en dan wordt er een speerman.
  Laat rovers komen (in de console `Spel.debug.rovers(3)`), en kijk in het gevecht: de speerman steekt van twee tegels
  ("Thrust"), een boogschutter schiet ("Shoot"), en schild en harnas vangen een deel af. De getallen in de werkbank
  ("Soldiers"). Het briefje van een gebouw is nu even breed als de andere kaartjes (het groeide met zijn regels mee).
- **Het debugvenster bekijken** (169, 15 okt): Nieuw spel, en druk D bij het rondlopen: +50 stammen, planken, steen en
  goud, een gezin (zonder plaats zegt het spel dat), de bouwplaatsen meteen af (wie erin trekt, komt die nacht), en de
  marskramer nu. De tijd staat stil zolang het open is; D of Esc sluit het. Voor Steam gaat het uit
  (`T.DEBUG_INSTELLINGEN.aan`, `verpakken.md`).
- **De zager bekijken** (168, 15 okt): zet een zagerij, en kijk overdag (niet in de schaft): de eerste hand staat op de
  tegel voor de deur en zaagt met de spanzaag aan de stam op de bok. Heeft de zagerij geen stammen, of is zijn stapel
  vol, dan staat er niemand.
- **De zagerij bekijken** (157, 14 okt): Nieuw spel, zet een houthakker en een zagerij (in het bouwmenu, *Sawmill*). Hij
  is een kapschuur in de stijl van je eiland, en bouwt op in fasen; eronder de zaagbok, de stammen en de planken. Klik
  erop: zijn briefje zegt hoeveel planken hij maakt. Een dorp vraagt planken in plaats van stammen.
- **Het briefje van een gebouw bekijken** (156, 14 okt): Nieuw spel, zet een houthakker, en klik erop als hij af is:
  rechts onder de balk ligt zijn briefje, even breed als het doel, en het spel loopt door. Wat hij maakt op volle kracht, vandaag, de laatste 7
  dagen en dit jaar, wie er werkt, wat hem tegenhoudt (weinig afwisseling, de tevredenheid, uren onderweg, de stapel
  vol), en de stapel bij zijn deur. Klik ergens anders, of Esc, en het is weg. Probeer ook het huis van de schout (wat
  de kar doet), een boerderij (haar velden en de oogst) en een bouwplaats. In de console: `Spel.S.gekozen`.
- **De balken bekijken** (164 tot 166, 14 okt): Nieuw spel. Bovenaan een dunne balk: het goud, de inwoners, de
  tevredenheid, de datum en het uur (het seizoen en het weer bij de muis), de snelheid, de twee bazen en Menu. Onderaan
  linksonder de waren die je hebt, in het midden Build, en rechtsonder de minikaart: het hele eiland, levendig, met een
  lijn langs de kust en een zoom die in het beeld vervaagt (geen ruit), wat je kent in kleur; klik of sleep erop en de
  camera kijkt daar (Tab of een klik op de schout brengt je terug). Wijs een getal
  aan: het briefje zegt wat het is. De velden, het wetboek en de raadsman openen nog met V, W en R. De minimap bijstellen:
  `verzadiging`, `onbekend`, `zeeTotOmtrek` en `omtrek` in `js/minikaart.js`.
- **De wegen en het afbreken bekijken** (C, stap 5, 14 okt): Nieuw spel, en in het bouwmenu (B) bovenaan **Road**: klik
  het begin en dan het eind, en zie de weg in groen, recht en haaks, met wat hij kost; na de klik is het eind het begin
  van het volgende stuk, en een rechtsklik houdt op. Wie geen werk heeft, legt hem (na de gebouwen), en de ossenkar rijdt
  er twee keer zo snel over. Dan **Demolish**: de muis zegt wat een klik doet. Breek een bewoonde hut af: het gezin
  slaapt op het plein (de status Homeless) tot er een woning met plaats is. Wat opviel (`opmerkingen.md`): een weg ziet
  eruit als een paadje, en de kolonist legt wegen naar elk gebouw van de kar (hij bouwt geen schuur).
- **De ossenkar bekijken** (C, stap 1, 14 okt): Nieuw spel. De huifkar komt aan, en pas dan staat zijn lading in de balk.
  Zet een houthakker: elke nacht legt hij zijn hout op een stapel naast zijn deur (klein, half of vol), en overdag rijdt
  de kar erheen, laadt, en brengt het naar het huis van de schout (zolang dat er niet is, naar zijn plek in het kamp).
  Bij de muis zegt de kar wat hij doet; in de console `Spel.debug.kar()`. Te kiezen in de werkbank ("The ox cart"): de
  lading per rit (8) en wanneer een stapel vol is (16). Wat opviel (`opmerkingen.md`): een stapel achter een gebouw zie
  je niet. **Stap 2:** zet een hut neer: het hout blijft in de balk staan, de kar haalt het uit de opslag en brengt het,
  en het briefje van de bouwplaats zegt hoeveel er is ("5 of 8 here"); bouw meer dan je hout hebt, en zie de plaatsen
  wachten. Wat opviel: een akker kan nu af zijn vóór zijn boerderij. **Stap 3:** zet een jager, een moestuin en een
  kippenhok: bij hun deur staan een ton, een mand kool en een mand; het dorp eet ze pas als de kar ze binnen heeft. Na
  de oogst ligt het graan in zakken bij de boerderij, en rijdt de kar er een week lang heen en weer. **Stap 4:** bouw een
  schuur (B, "barn") aan de rand van het bereik: het bereik groeit om hem heen, en als hij af is, staat er een tweede
  ossenkar bij zijn deur, die haalt wat bij de schuur ligt. Zo kom je bij de rotsen (de steengroeve) en het water.
- **De afwisseling bekijken, en de lat kiezen** (B3, 13 okt; `spel.md`, "Zo werkt de afwisseling nu"): Nieuw spel, en
  kijk in de balk naar **Plain fare** (bij de muis wat helpt); laat de kaas en het vlees uit de kar opgaan zonder jager
  of moestuin, en zie het werk naar 60% zakken (**One dish**). De speeltest (`speelbaar.md`, 13 okt, avond): de kolonist
  heeft met een moestuin, een jager en een kippenhok (14 hout) rond dag 40 vier soorten, en werkt dan het jaar op vol.
  Zo is de afwisseling een klein klusje, nog geen kern. Te kiezen, met getallen in de werkbank ("Needs and the winter"):
  **a** zo laten tot het dorp groeit (C), want een soort moet met het dorp meegroeien; **b** vol werk pas bij vijf
  soorten (`werkPerSoortErbij` 0,1): dan moet er wijn, vis of brood bij, en blijft een dorp zonder water tot de eerste
  wijn op 90%; **c** groente en eieren minder laten voeden (`groenteAlsGraan`, `eierenAlsGraan`), zodat er bij een groter
  dorp meer moestuinen nodig zijn. Voorstel van Claude: **b**, omdat het de ketens (de wijngaard, de molen en de bakker)
  een reden geeft, met de getallen die er al zijn.
- **De mist bekijken** (B2c, 13 okt; `spel.md`, "Zo werkt de mist nu"): Nieuw spel, en zoom uit (het wiel, of `Tab`):
  zwart wat je niet kent, grijs (donkerder en ontkleurd) de kring van 50 tegels die je bij het begin kent, en helder
  rond je mensen. Loop met de schout het zwart in. Is het grijs goed zo? Het zijn getallen in de werkbank ("The fog":
  hoeveel kleur eruit, hoeveel donkerder, hoe zacht de rand). Twee dingen die ik erbij deed: **het plein kijkt ook**,
  zoals een gebouw (anders werd je eigen plein grijs als er niemand stond), en **zonder videokaart** is het grijs één
  laag, grijzer in plaats van ontkleurd (twee lagen kostten daar de helft van de beelden per seconde).
- **Meten op je eigen pc** (13 okt, Marcel: "kan ik straks wel even doen"): Nieuw spel, loop met de schout het bos in
  ten zuiden van het kamp, blijf staan en druk `F2`: hoeveel beelden per seconde, en wat zegt de meter over tekenen?
- **Het hele eiland bekijken** (B2b): Nieuw spel, en loop met de schout het land uit, naar de kust (met `F2` de meter):
  het land gaat open waar hij komt. Op 30× zou het niet meer moeten haperen (13 okt: alle stukken lagen klaar); zeg het
  als je het toch ziet. Wat opviel en te kiezen is (`opmerkingen.md`): een richel zonder helling blijft onbereikbaar, en een hol kan
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

**Daarna, in deze volgorde:** I (vraag 170, met D en F erin), C, E (ronde 3 van A na C); G loopt ernaast op het tijdpad van
`commercieel.md`.

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
3. **Ronde 3, na C:** **Bezig in sessie `ccr-74384ea2-mxeou7`** (15 okt): het plan voor Marcel, per systeem blijft,
   slaapt of weg, met wat eraan hangt. Wat de proef moet uitwijzen (`gameloop.md`, "Open"): de voorvallen, de raad, de raadsman, het
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

## B3. Afwisseling (vraag 154)

Af op 13 okt (onder "Af"); hoe het werkt: `spel.md`, "Zo werkt de afwisseling nu". De lat (vier of vijf soorten voor vol
werk) wacht op Marcel.

## C. De ossenkar (vraag 152, de proef)

Besloten (Marcel, 11 okt): bouwen binnen bereik van het plein en elke opslag, geen grens en geen vlaggen; de kar rijdt
overal, over een weg sneller; een ossenkar; de eerste opslag is het huis van de schout. **Het plan** (Marcel, 14 okt:
"A2, B2, C1, D2, E2", op een voorstel van Claude):
1. **De stapel en de kar, voor hout:** wat de houthakker maakt en de bouwers rooien, ligt op een stapel bij de deur (of
   op de plek); de ossenkar rijdt overdag vanaf de opslag, haalt de stapels, en het hout telt pas in de opslag. Een
   volle stapel zet het gebouw stil, zodat je ziet waar het stokt. De lading van de huifkar telt pas als hij aankomt.
2. **De bouwplaats krijgt haar hout met de kar** (B2, zoals in The Settlers): je zet neer wanneer je wilt, en betaalt
   alleen het goud meteen; de kar brengt het hout in de volgorde waarin je bouwde, de bouwers komen zo ver als het hout
   reikt ("4 of 16 wood"), en wat ze op de plek rooien, gaat eerst in dat gebouw. De timmerman krijgt zijn hout ook
   met de kar.
3. **De rest** (A2): alles wat een gebouw maakt (vlees, vis, groente, eieren, steen, ...), en de oogst bij de boerderij
   en de wijnboerderij. Niet met de kar: wat mensen zelf thuisbrengen (sprokkelhout), de marskramer, en goud. Marcel, 14
   okt ("a ja, b ja, c ja, d ja"): **a** eten telt pas (en wordt pas gegeten) als de kar het binnen heeft, ook voor de
   afwisseling; **b** de schoven en de wijn blijven bij de boerderij tot de kar ze haalt (na de oogst dagen werk); **c**
   wat van het vee komt (wol, melk en kaas, vlees bij het slachten, mest) gaat voorlopig meteen de voorraad in; **d** de
   stapels van eten zijn de manden, tonnen en zakken van de markt, en voor steen komt een eigen stapel.
4. **De schuur** (D2): een eigen gebouw, een opslag met zijn eigen bereik en zijn eigen kar, met de tekening van de
   blokhutschuur tot er een eigen is. De kar rijdt zelf, zonder hand (C1), en kost hout en goud. Zo komen ook de rotsen
   en het water binnen bereik (`opmerkingen.md`: de steengroeve, de visser). Marcel, 14 okt ("a ja, b ja, c ja"): **a**
   één voorraad voor alle opslagen (de kar lost en laadt bij zijn eigen opslag, en de balk telt alles samen); **b** 15
   hout en 6 goud, vanaf het gehucht, met bereik 16 zoals het huis van de schout; **c** elke schuur heeft één kar, die
   haalt en brengt wat het dichtst bij zijn schuur ligt (een losse kar kopen komt later als het nodig blijkt).
5. **Wegen die jij legt** (E2), **af** (14 okt; `spel.md`, "Zo werken de wegen en het afbreken nu"). Marcel, 14 okt ("a ja, b ja, c1, d ja, e we moeten een 'demolition' knop hebben ja, f ja"): **a** je legt een
   weg zoals een veld: klik begin en eind, het spel trekt de kortste weg ertussen, recht en haaks (schuin raken twee
   tegels elkaar alleen op een hoek, en dan is het geen band zand), en je ziet hem voor je klikt; **b** hij kost alleen
   werk (0,1 werkdag per tegel, en eerst rooien wat in de weg staat); **c1** alleen de kar gaat er sneller over (twee
   keer), de mensen niet (hun gedeelde velden in `js/lopen.js` tellen elke tegel even zwaar; dat komt pas als de proef
   het vraagt); **d** de weg van de kaart telt ook als weg: een weg is zandpad in `w.grondAnders`, dus `T.opPad`, niet
   bouwen op een pad en de paadjes van de deuren gelden vanzelf; **e** een knop om af te breken (demolition) in het
   bouwmenu, voor wegen en gebouwen (Marcel: "Wegen en gebouwen, nu"): er komt niets terug, wie erin woonde, loopt los
   (Marcel: "ze lopen los, met een melding dat er huizen nodig zijn": dakloos, een toestand, tot er een woning met plaats
   is; het kamp is dan vaak al weg), wie er werkte is vrij, de kar haalt de stapel nog op, een bouwplaats legt haar hout op een stapel, en
   de velden van een boerderij gaan mee; niet af te breken zijn het huis van de schout en het plein; **f** de kolonist legt ook wegen, van elke schuur naar het huis van de schout, zodat stap 6 meet wat een
   weg doet.
6. **Meten en spelen:** de speeltest vanaf een lege plek: hoeveel van de dag de kar rijdt, wat er wacht, hoe groot de
   stapels worden. Dan ronde 3 van A. **Af** (15 okt, op de branch `claude/wizardly-sagan-qw7f8f`). **Besloten**
   (Marcel, 15 okt, op twee vragen van Claude): **de kolonist zet een schuur richting de rotsen**, zodat de speeltest ook
   een tweede kar meet en de steengroeve binnen bereik komt; en **vijf eilanden spelen een jaar, twee spelen door tot
   het tweede jaar**, zodat het dorp er komt en de planken ook gebruikt worden. Na de zagerij bleek het goud op (de 20
   uit de kar), en de speeltest verkocht nooit iets, dus de schuur (6 goud) kwam er pas na een jaar; **de kolonist
   verkoopt nu aan de marskramer** wat de winter niet nodig heeft als hij op goud wacht (Marcel, 15 okt). Het meten zit in de speeltest, niet in
   het spel: wat elke kar doet (rijden, vol of leeg, laden, stil), de ritten, hoe groot de stapels worden en hoe lang
   een waar erop ligt, en wat er op de kar wacht (een bouwplaats, een werkplaats zonder stammen, een volle stapel).
   **Gemeten** (15 okt; `speelbaar.md`, "De speeltest van 15 okt"). Daarna koos Marcel eerst dat de kolonist het dorp
   laat groeien (een put, een hut voor wie erbij wil), en toen, terwijl dat liep: de balans komt later, hij test het
   groeien zelf met een debugvenster (169), en de speeltest toetst alleen of het werkt. Wat die proef al liet zien,
   staat in `opmerkingen.md`.

Wat Claude erbij zag (14 okt): met de getallen van nu is één kar ruim genoeg voor een gehucht (hij rijdt binnen 16
tegels drie tot vier ritten per dag, een houthakker maakt 2 hout per dag); de keuze voor een tweede kar komt met de afstand
en de groei. Wil je hem eerder voelen, dan is de lading per rit het getal (de werkbank).

## D. De besturing en de klok

De camera los, en de schout een held die je aanklikt (A van vraag 151): sinds 15 okt deel van vraag 170 (bij I). De
klok: een jaar is nu 30 uur op 1×; de proef laat zien op welke snelheid het goed oogt.

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

## H. Marcels acht punten (vraag 156 tot 163, 14 okt)

Marcel, 14 okt: "We gaan verder:", met acht punten; wat er al is, zocht een agent uit (14 okt). Zijn antwoorden staan
onder "Besloten".

- **156, een gebouw aanklikken:** "De speler moet op een gebouw kunnen klikken om informatie over het gebouw te
  krijgen, wat het doet en hoeveel indien aan de orde, het produceert." Nu geeft een klik dezelfde ene regel als de muis
  (`T.gebouwToestand`, `js/verkennen.js`); de getallen zijn er al (`maakt`, `g.werkte`, `g.tekort`, `g.vol`).
- **157, de keten:** "de houthakker levert boomstammen voor de houtzagerij die er weer planken van maakt." De timmerman
  (dorp) maakt al planken van hout, met de kar, maar niets gebruikt ze; alles kost hout en goud, een paar ook steen.
- **158, muren:** "eerst van houten palen en dan upgraden naar steen als we naar een stad gaan." `palissade` en
  `stadsmuur` staan in `T.GEBOUWEN`, zonder plaatsing; de weg (`js/wegen.js`) en het hek (`zetHek`, `js/beesten.js`)
  zijn het voorbeeld. De trede stad is nog niet te halen (`js/treden.js`).
- **159, soldaten uit wapens:** "Iedereen is een mens, elk mens kan iets worden. Iemand pakt een zwaard en schild ->
  zwaardvechter. Speer - spearman etc. Zoals Knights and merchants het doet." Nu is de militie de wachters van het
  wachthuis en de veteranen van de heervaart, en `wapens` is één waar die 2 schade erbij geeft (`js/rovers.js`).
- **160, handel:** "Het verzamelen van producten met overschot en afrijden naar andere steden of dorpen om deze
  producten te verkopen." Nu alleen de marskramer en de bode; de andere dorpen leven niet (`S.dorpen` is je dorp).
- **161, reizende gezelschappen:** "die gossip hebben en verhalen van steden dichtbij." Er is `T.bezoekerKomtAan`, de
  herberg, en drie vaste zinnen van de marskramer ("Any news?").
- **162, provincies:** "Elke provincie heeft 1 hoofdstad en een aantal kleine dorpjes. Je kunt hiermee handelen of
  vechten natuurlijk." Het eiland heeft een kasteel, een stad en acht dorpen als punten, met wegen (`js/eiland.js`);
  `js/land.js` heeft negen losse provincies, los van het eiland en standaard uit.
- **163, een kasteel:** "Uiteindelijk wil ik ook dat je verdedigingen als een kasteel kunt bouwen. Dit zoals bij Lords of
  the realm." Er is niets; de vijf maten uit Lords of the Realm 2 staan in `spel.md`.

**Besloten** (Marcel, 14 okt: "V1, 1a1, 1b ja, 2a2, 2b ja, 3 steen is gelijk beschikbaar. 4a. 7. Iets specifieks hoeft
niet perse. 8. Los ontwerp", op de vragen van Claude; in het gesprek heetten de punten 1 tot 8):
- **De volgorde** (V1): 156, dan 157, dan C6 (meten, nu met de keten erin), dan 159 met 158 (het verdedigen van F, en het
  eind van de demo: het eerste gevecht), dan 162, 161, 160 en 163. Voor de demo tellen 156 tot 159; 160 tot 163 hangen
  aan 162 (zonder levende plaatsen is er niets om mee te handelen, over te roddelen of te veroveren). D gaat mee met 159
  (je soldaten aanklikken), E met 162 (de heer in zijn provincie).
- **156** (1a1, 1b ja), **af** (14 okt; `spel.md`, "Zo werkt het briefje van een gebouw nu"; `js/gebouwbriefje.js`):
  een klik op een gebouw legt rechts een briefje, dat blijft tot je ergens anders klikt, terwijl het spel doorloopt (The
  Settlers, Anno). Erop: wat het doet, wie er werkt, wat het maakt op vol, vandaag, de laatste zeven dagen en dit jaar,
  wat erin gaat en wat er ligt, en wat het tegenhoudt (en wat helpt: gereedschap); nog geen knoppen. Marcel erbij (14
  okt): "Kaartjes in de ui moeten wel even breed zijn": het doel, de statussen, de datum en het briefje nemen nu één maat
  (`--kaart` in `stijl.css`, `code.md` bij `js/ui.js`). En als notitie: beter gereedschap als upgrade (`opmerkingen.md`).
- **157** (2a2, 2b ja): het materiaal volgt de trede: een gehucht bouw je van stammen, een dorp van planken, een stad van
  steen. De zagerij (gehucht) vervangt de timmerman, en hout heet stammen (*logs*). **Het plan** (Claude, 14 okt, wacht
  op Marcel): **a** de zagerij (*sawmill*) neemt de plaats en de getallen van de timmerman over (2 handen, 2 stammen tot
  2 planken per dag, 12 stammen en 6 goud), maar in het gehucht; **b** in de code blijft de waar `hout`, op het scherm
  heet hij *logs* (ook het sprokkelhout en wat het dorp stookt: dat zijn dan stammen); **c** de kosten volgen de trede,
  met hetzelfde getal: gehucht stammen (zoals nu), dorp en marktrecht planken, stad steen (het stenen huis 20 steen in
  plaats van 20 hout), ook als een huis doorgroeit; goud en steen die er al staan, blijven; **d** wat een werkplaats
  van hout maakt (de wapenmaker, de kuiper, de kalkbrander), blijft voorlopig stammen: de wapens komen bij 159; **e** de
  kolonist van de speeltest bouwt een zagerij vóór het dorp, en de speeltest speelt vijf eilanden een jaar zonder fouten;
  **f** een oud spel past niet meer (de timmerman heet anders): opslaan een versie omhoog. **Besloten** (Marcel, 14 okt:
  "Plan ja, zagerij nu een eigen tekening"): het plan zoals hier, en de zagerij krijgt meteen een eigen tekening uit
  code. **Af** (14 okt, op de branch `claude/village-economy-gameplay-lmsnyg`). De eerste eigen tekening, een open
  loods onder een zwaar rieten dak, zag er niet uit (Marcel: "Maak het meer zoals onze mooie huizen?"); de tweede, een
  huis zoals de bakkerij, paste nog niet bij de huizen, want die komen uit de huizenbouwer in de bouwstijl van het land,
  en geen werkplaats doet dat. **Besloten** (Marcel, 14 okt, op de vraag): de zagerij komt in de huizenbouwer, zoals
  de kleine herberg: in de vier stijlen, met de deur naar elke kant en met bouwfasen, met stammen en planken ernaast.
  De andere werkplaatsen volgen later (vraag 167). Ook dat huis was "veel te stijf", en Marcel: "Eerst voortaan even
  goedkeuring vragen" (`beeld.md`). **Gekozen** (Marcel, 14 okt, op het voorstel): **A**, een werkplaats van één laag met
  een aanbouw, in de wand, de luiken en het dak van de stijl, zonder schoorsteen (er brandt geen vuur), en ernaast drie
  nieuwe stukken van de huizenbouwer die met het huis meedraaien: een zaagbok met een stam, een stapel stammen en een
  stapel planken (geen open loods: die kent de huizenbouwer niet); de bouwfasen **eerst alleen onder het dak van het
  gehucht** (16 tekeningen; leien en pannen later); de **proefplaat in planken**, deur naar het zuiden. Op de
  proefplaat (een huis met een dichte aanbouw, en de stammen, planken en zaagbok ernaast) vroeg Marcel: "Toch nog een
  werkplaats erbij?", en koos **een open loods tegen de gevel**: vier palen en een schuin dak van planken (een los stuk,
  zoals de stammen), eronder de zaagbok en de planken, de stammen ernaast in de open lucht; de dichte aanbouw eraf. En
  het vel van de huizen **eerst leren aanvullen** (zoals `bouwfasen --erbij`), zodat niet alle 1214 tekeningen opnieuw
  hoeven, maar alleen de 96 nieuwe. Op de tweede proefplaat (met de loods): "Ik wil wel dat je iemand ziet werken".
  **Gekozen** (14 okt): de zaagbok gaat naar de rand van de loods, half onder het dak, zodat er later een zager buiten
  naast staat (een figuur ten zuiden of oosten van een voet staat ervoor, `T.staatVoorGebouw`); de tekening zegt waar
  (`werk`, zoals `deur`). De zager zelf is vraag 168, direct na 157. Toen een open zaaghal met een schuurtje ernaast:
  "Nee het lijken nu 2 gebouwen. Het moet er 1 zijn als werkplaats. De persoon heeft een eigen huis ernaast" (de zager
  woont al in zijn eigen huis: de zagerij heeft geen bedden). **Gekozen: een kapschuur in de stijl**, één gebouw uit de
  huizenbouwer, onderaan open tussen palen met schoren (een nieuwe optie, `open`), met het dak en de dichte gevels
  erboven in de stijl van het dorp; eronder de stammen en de planken, aan de rand de zaagbok, en een stapel stammen
  tegen één kant. De bouwfasen komen met de huizenbouwer mee.
- **158** (3): een muur leg je zoals een weg, en waar een weg hem kruist, komt vanzelf een poort (je mensen en de kar
  erdoor, rovers en wolven niet). **Steen is meteen te gebruiken**: de stenen muur wacht niet op een trede.
- **159** (4a, gelezen als de eerste keuze): een soldaat is voltijds: hij legt zijn werk neer en eet, en kan zijn wapen
  weer inleveren. Eerst drie wapens: de speer (planken), de boog (planken), zwaard en schild (ijzer en planken); zonder
  wapen een hooivork.
- **Het plan voor 159 met 158** (Claude, 15 okt; **besloten**, Marcel: "A1, B1, C1, D1, E1, F ja, G1", dus steeds de eerste; wat er is, zochten twee agents uit). Nu: de militie is
  wie in het wachthuis werkt (2 handen) plus de veteranen; `wapens` is één waar (+2 schade); het gevecht kent alleen
  slaan op de tegel ernaast; het tuighuis, het schuttershof en de kazerne staan in het bouwmenu maar doen niets; een
  muur is alleen gegevens, `js/wegen.js` kent alleen de weg, begaanbaar is voor iedereen gelijk (alleen de schout opent
  deuren), en vinden rovers geen weg, dan komen ze stil niet. Wat Claude erin ziet: 158 en 159 versterken elkaar (de
  speer reikt twee tegels en de boog schiet ver, dus achter de palissade tellen ze; zwaard en schild houden de poort).
  Vier stappen: **1** soldaten zonder nieuwe tekeningen (drie waren, de wapenmaker, voltijds, inleveren, elk wapen een
  eigen slag in het gevecht); **2** een soldaat aanklikken (D): zijn briefje, en (Marcel, 15 okt: "bij stap 2 gelijk meer.
  Soldaten moeten te sturen zijn. Ook wil ik basis formaties. Dit doen we in een nieuwe sessie") ze sturen, en eenvoudige
  formaties; **3** muren: de weg wordt een lijn met een
  soort (weg, palissade, stenen muur), een poort waar een weg kruist, open voor je mensen en de kar, dicht voor rovers en
  wolven; een palissade 1 stam per tegel, een stenen muur 2 steen, en steen over een palissade bouwt hem om; **4** de
  tekeningen, eerst in woorden, dan één proefplaat. De vragen (voorstel van Claude steeds de eerste): **A** waar wordt
  iemand soldaat: A1 in het wachthuis (knoppen op zijn briefje, 6 plaatsen; het werk van wachter vervalt), A2 een eigen
  kazerne in het gehucht, A3 je geeft een dorpeling zelf een wapen; **B** wie: B1 alleen wie geen werk heeft, B2 ook
  iemand uit een werkplaats; **C** de wapenmaker: C1 naar het gehucht (speren in het eerste jaar), C2 blijft in het dorp;
  **D** het gevecht: D1 elk wapen een eigen slag (de hooivork zwak, de speer reikt twee tegels, de boog schiet tot 8
  tegels waar hij ziet maar niet met een vijand naast zich, zwaard en schild slaan hard en vangen 2 schade af), D2 alleen
  de schade verschilt; **E** rovers voor een dichte muur: E1 ze nemen wat erbuiten ligt, en anders komen ze niet, E2 ze
  hakken op de poort tot hij open is (een poort met leven); **F** het tuighuis en het schuttershof eruit (ze doen niets),
  de kazerne blijft voor later; **G** de volgorde: G1 stap 1 tot 4 zo, G2 de proefplaat van de soldaten al na stap 1. Marcel erbij (15 okt): "iemand kan gewoon wapensmid worden. Daar moet nog een gebouw voor komen": de wapenmaker is een werkplaats in het gehucht waar een dorpeling wapensmid is; hij leent nu het beeld van de smidse, en zijn eigen tekening komt met de werkplaatsen in de bouwstijl (167). **De wapens** (Marcel, 15 okt: "kwa wapens wil ik: sword, spear, shield, pike, bow, crossbow, armor", en op vier vragen: vaste soorten, "Piek reikt 2, slaat harder", "Kruisboog door het harnas", "Allebei, later"): zes vaste soorten soldaten, zoals in Knights and Merchants, en een soort wacht tot al zijn stukken er zijn: militie (hooivork), speerman (speer en schild), piekenier (piek en harnas), zwaardvechter (zwaard, schild en harnas), boogschutter (boog), kruisboogschutter (kruisboog en harnas). De speer en de piek reiken twee tegels, de piek slaat harder en kost ijzer; de kruisboog schiet zo ver en zo vaak als de boog, maar schild en harnas vangen van een bout niets af; het harnas is nu van huiden (de jager), een ijzeren harnas komt later, als het dorp ijzer heeft. De wapenmaker maakt ze alle zeven. **Stap 1 is af** (15 okt, in `main`; `js/soldaten.js`, `spel.md`, "Zo werken de soldaten nu"): het tuighuis en het schuttershof zijn weg, en de kolonist van de speeltest zet een wachthuis en een wapenmaker en vraagt twee speermannen (regel 7c).
- **Het plan voor stap 2: kiezen, sturen en formaties** (Claude, 15 okt). **Besloten** (Marcel, 15 okt: "A. Age of
  Empires stijl. Maar groepen maken met control + 1. B. B2. C. C1 voor nu. Later kijken we verder wat er nodig is. D. D1.
  E. Je kunt shifts instellen. Anders zou een vijand standaard in de nacht kunnen aanvallen. F. Zie mijn eerdere punt
  over RTS. G. G2"), en daarmee werd stap 2 vraag 170 (bij I): het vechten in real time, zonder de schout als held. Het
  plan zoals het was: Nu: een soldaat staat
  overdag bij zijn wachthuis en slaapt thuis; bij een aanval rent hij naar de schout (`T.loopNaastDeSchout`); het
  gevecht begint alleen als een rover de schout ziet (`T.zoekOntdekking`), en alleen wie binnen 12 tegels van de schout
  staat, vecht mee (`T.militieInGevecht`). Een klik op een soldaat zegt alleen wie hij is. Wat Claude erin ziet:
  **1** sturen en formaties horen bij het rondlopen, zoals in Jagged Alliance 2: in het gevecht heeft elk al zijn eigen
  beurt, dus een formatie is de plek waar het gevecht begint; **2** zolang het gevecht om de schout draait, zegt sturen
  niets: een troep bij de akker vecht pas als de schout erbij is; **3** de formatie geeft de zes soorten van stap 1 hun
  zin: een speer en een piek steken langs wie ervoor staat, en een boog schiet niet met een vijand naast zich, dus zwaard
  en schild voor, speer en piek erachter, de bogen achteraan; **4** in de winter stopt het werk rond vier uur en komen
  de rovers om vijf: een post die alleen onder het werk geldt, is dan leeg. De vragen (voorstel van Claude steeds de
  eerste): **A** wie kies je: A1 een troep per wachthuis, een klik op een soldaat kiest ze allemaal (Knights and
  Merchants), A2 elke soldaat los, meer met een kader slepen (Age of Empires), A3 allebei; **B** de muis: B1 zoals een
  gebouw in de hand: met de troep gekozen stuurt een klik op de grond ze erheen (hun plekken in groen bij de muis, zoals
  de weg), een klik op een rover valt hem aan, rechtsklik of Esc laat los, en de schout blijft staan, B2 links kiezen,
  rechts sturen (Age of Empires); **C** de formaties: C1 twee, *Line* (twee rijen: wie slaat voor, wie steekt erachter,
  wie schiet een rij verder) en *Ring* (in een kring om de plek, de schutters in het midden: een akker of de bode van
  alle kanten), C2 drie (*Line*, *Block* en *Ring*), C3 alleen de breedte (rijen erbij en eraf, Knights and Merchants);
  **D** de richting: D1 ze kijken de kant op waar ze heen liepen, D2 klikken en slepen, waar je loslaat kijken ze heen;
  **E** hoe lang: E1 een post houden ze van het opstaan tot het slapen, 's nachts slapen ze thuis en 's ochtends gaan ze
  terug, tot je ze terugroept (*Back to the guardhouse*), E2 ook 's nachts (de wacht), E3 alleen tot het eind van de dag;
  **F** bij een aanval: F1 wie een post heeft, houdt hem, en de rest komt naar de schout zoals nu; het gevecht begint ook
  als een rover een soldaat ziet, en wie van jouw kant dicht bij een vechter staat, doet mee, ook zonder de schout (dan
  speel je alleen je soldaten), F2 alles blijft om de schout, en de post geldt alleen in vrede; **G** het briefje: G1 van
  de troep (wie erin zitten met soort en leven, wat ze doen, de formatie, *Back to the guardhouse*), G2 van één man.
  Geen nieuwe tekeningen: een gekozen troep krijgt een ring onder de voeten, en de plekken liggen in groen op de grond,
  zoals de weg. De volgorde: **2a** kiezen en het briefje, **2b** sturen en de post, **2c** de formaties, **2d** het
  gevecht zonder de schout (F1); elke stap met toetsen, en de speeltest speelt zonder fouten.
- **162** (7): de provincies op het eiland, zo'n vijf, elk met een hoofdstad en een paar dorpen; iets eigens per
  provincie hoeft niet. Op de rest van het voorstel (op het eiland zelf, `js/land.js` eruit, wat ver weg is leeft als
  getallen tot je er bent) zei Marcel niets: bevestigen als we er zijn.
- **163** (8, "Los ontwerp"): vrij bouwen, zoals Stronghold: muren, torens en poorten los, niet de vaste ontwerpen van
  Lords of the Realm. Zo is het kasteel het vervolg van 158.
- **164, een minimale balk onderaan** (Marcel, 14 okt, na 156: "De oude ui balk aan de onderkant moet leeg. En we
  hebben een minimale nodig"). Nu ligt onderaan de tafel van de schout (vraag 146, c; `js/tafel.js`): het rekenboek (de
  voorraad, de kas, de mensen, de tevredenheid), het bouwplan, de velden, het wetboek, de bel van de raadsman, de brief,
  het rapport en de bode zolang ze er zijn, de lantaarn (sluipen), de kaars (slapen), de zandloper met de snelheden, en de
  twee bazen. **Besloten** (Marcel, 14 okt, op drie vragen van Claude): **kaartjes in de hoeken**, zoals bovenaan en even
  breed (`--kaart`): linksonder de voorraad, rechtsonder de snelheid met de twee bazen, in het midden één knop Build; **de
  voorraad toont wat je hebt** (de waren waarvan er iets is, met een pictogram en het getal, en het goud en de mensen);
  **eraf**, alleen nog met hun toets: de velden (V), het wetboek (W) en de raadsman (R), de lantaarn (sluipen, S) en de
  kaars (slapen); en **de tekeningen van de tafel gaan eruit** (`beelden/tafel/`, git bewaart ze). De brief, het rapport en
  de bode koos Marcel niet om weg te halen: die blijven in beeld, naast Build, zolang ze er zijn. **Af** (14 okt, op de
  branch `claude/village-economy-gameplay-lmsnyg`; `js/balk.js`, `code.md` bij `js/ui.js`).
- **165, een minimap** (Marcel, 14 okt: "Vergeet mn minimal niet"; zijn "we hebben een minimale nodig" bij 164 was ook
  al de minimap). Besloten (Marcel, 14 okt, op drie vragen): **onderaan in de ui, zoals bij Age of Empires**, en **het hele
  eiland**. Voorstel van Claude: rechtsonder in de hoek, een kaartje even breed als de rest (`--kaart`), met de snelheid en
  de bazen erboven; een ruit die net zo ligt als het beeld (zoals in Age of Empires), wat je kent in kleur en de rest
  zwart (de mist), je gebouwen en wegen, een kader waar de camera kijkt, en een klik schuift de camera erheen. **Af**
  (14 okt, op de branch `claude/village-economy-gameplay-lmsnyg`; `js/minikaart.js`): de ruit in de hoek, zonder rand en
  licht doorschijnend (Marcel: "zonder 'rand' dus de kaart licht transparant"), levendig, en zonder ruit: de zee vervaagt
  vanaf de kust met een rafelige rand, zodat er een eiland overblijft ("Ik bedoelde meer vibrant. En een echte
  gefeatherde rand"), met een lijn van 1 pixel om het eiland ("Het gaat toch wat teveel op in het land"); wat je niet
  kent, een donkere tint;
  wat je niet kent is donker maar laat de vorm van het eiland zien (een getal, `onbekend`); de wegen zijn te klein om te
  zien (een weg is een tegel, een pixel is er acht), dus alleen je gebouwen, de schout en de plekken die je kent.
- **166, een dunne balk bovenaan** (Marcel, 14 okt, na 164 en 165: "Minimap bedoel ik. Zoals bij age of Empires in de
  onderste ui. Bovenaan een dunne ui balk met goud, aantal inwoners, happiness jaar en tijd"). Dus zijn "minimale" bij 164
  was de minimap, en die ligt onderaan zoals in Age of Empires; bovenaan komt een dunne balk met het goud, de inwoners,
  de tevredenheid, het jaar en de tijd (nu in de voorraad linksonder en op de datum rechtsboven). En (Marcel, 14 okt): "Ik
  probeer het zo leeg mogelijk te houden zonder info te missen" (in CLAUDE.md, "Hoe we kiezen"). Zo gebouwd (Claude,
  14 okt, naar dat principe): één dunne balk over de hele breedte bovenaan, met het goud, de inwoners, de tevredenheid,
  de datum met het jaar en de tijd, en ernaast de snelheid, de twee bazen en Menu; het seizoen en het weer op het
  briefje bij de muis op de datum (Sint-Maarten blijft staan). Het kaartje met de datum en de klok rechtsonder vervallen:
  rechtsonder alleen de minimap, linksonder alleen de waren. **Af** (14 okt, op de branch
  `claude/village-economy-gameplay-lmsnyg`; `code.md` bij `js/ui.js`).
- **168, de zager aan het werk** (Marcel, 14 okt, bij 157: "Ik wil wel dat je iemand ziet werken", en "1 nu, 2 en 3
  direct erna"). **Af** (15 okt, op de branch `claude/village-economy-gameplay-lmsnyg`; Marcel op de proefplaat: "Ja,
  zo", de zaag uit de bok: "Ja, eruit", en de uiterlijken: "Ja, alle 48"). Het plan was: een nieuwe werkfiguur, de zager en de zaagster, zoals de hakker (`werkfiguren.cjs`): staan, lopen en
  zagen (de zaag heen en weer, het lijf leunt mee), eerst één proefplaat. In het spel staat een van de twee handen van de
  zagerij aan de zaagbok te zagen zolang hij werkt (`werk` bij de tekening, `js/bewoners.js` werkplekVan, `e.werkt`); staat
  hij stil, dan zaagt niemand. Een werkplek per soort werk stond al in `opmerkingen.md`.
- **167, de werkplaatsen in de bouwstijl** (Marcel, 14 okt, bij 157: na de zagerij "Alle werkplaatsen in de bouwstijl"
  als eigen punt): de houthakker, de smidse, de bakkerij en de andere werkplaatsen komen nog uit de oude tekeningen
  (`dorp.cjs`, `dorp2.cjs`), en passen niet bij de huizen uit de huizenbouwer. Zoals de zagerij (157): in de vier
  stijlen, met de deur naar elke kant en met bouwfasen. Later, na de zagerij.
- **169, een debugvenster** (Marcel, 15 okt, bij C6: "we kunnen ook een debug venster toevoegen. Uiteindelijke balancing
  wordt later gedaan. misschien letter "D" en dan debug menu op laten komen. +50 voor bouwmaterialen etc.", en "dan kunnen
  we gewoon het daadwerkelijke groeien testen"). D is vrij bij het rondlopen (in een gevecht sluit D een deur, en dat
  blijft); het venster komt in de lijst van vensters met een toets (`VENSTERS`, `js/ui.js`), zoals O, V, W en R.
  **Besloten** (Marcel, 15 okt, op twee vragen van Claude): vier knoppen, elk met wat er al is: **+50 stammen, planken,
  steen en goud**, **een gezin erbij** (zoals `Spel.debug.gezin`), **de bouwplaatsen meteen af**, en **de marskramer
  nu** (`Spel.debug.marskramer`); en het venster blijft **aan tot de Steam-versie**, ook in de proefversie, en gaat bij
  het verpakken voor Steam uit met één schakelaar. **Af** (15 okt, op de branch `claude/wizardly-sagan-qw7f8f`;
  `js/debugvenster.js`, en `T.komtKlaar` in `js/gebouwen.js`: de nacht en het venster maken een gebouw op dezelfde
  manier af).
- **Nog open** (als we er zijn): **paarden, voor ruiters en ridders** (Marcel, 15 okt, bij de soldaten van 159: "noteer
  ook even dat ik uiteindelijk paarden wil. voor ruiters en ridders"): uiteindelijk, na de zes soorten van stap 1; een
  stal en een stalmeester stonden al als idee in `spel.md` ("Paarden: de stal en de stalmeester"). **161**, het nieuws
  echt en bruikbaar (wat een stad tekortkomt, waar de mannen van de heer zijn, welk dorp morrt), en met een herberg
  blijven ze langer; **160**, eerst losse ritten (een kar met wat over is naar een stad, dagen onderweg, een escorte
  helpt), vaste routes later.

## I. Van bovenaf en in real time (vraag 170, 15 okt)

Marcel, 15 okt: "de schout verdwijnt. Hij of zij is de embodiment van de speler, en kan meevechten en leeft in het dorp.
Maar we gaan toch als 'god' sturen en bouwen. Je speelt dus niet meer de schout zelf", en "het vechten moeten we
herzien, ik dacht dat turn based een optie was, maar als je met meerdere live spelers wil spelen gaat dat niet. Het
concept gaan om naar RTS. We houden wel vast aan het isometrische" (`gameloop.md`, "Bijgesteld op 15 okt").

**Wat er nu is:** de schout is wie je speelt: een klik laat hem lopen (`T.handelingVerkennen`), de camera loopt met hem
mee, je praat met iemand door erheen te lopen, en hij sluipt (S), draagt een lantaarn, slaapt (Z), raapt op en opent
deuren met een sleutel; het gevecht is in beurten (`js/gevecht.js`: de overgang, de actiepunten, het raster, einde beurt,
een deur dicht), en het begint alleen als een vijand de schout ziet; de soldaten rennen naar hem toe. De zes soorten
van 159 (de wapens, het bereik, de schade, schild en harnas) gaan mee: de actiepunten van een slag worden de tijd tussen
twee slagen.

**Besloten** (Marcel, 15 okt, op de vragen van Claude): **1** "de schout wordt een 'held' een 'general' of 'commander'
wanneer hij valt kan er een ander opstaan. Deze uit veteranen gekozen. De naam wordt ook veranderd naar general, of
commander"; **2** "praten parkeren we even we focussen ons nu als richting op RTS en minder op de RPG elementen het praten
vind ik ook moeilijk passen in dit spel het voegt voor nu weinig toe"; **3b** live samen spelen al in de demo; **4a** je
stuurt de soldaten en de held, een dorpeling werkt vanzelf (en heeft een briefje); **5a** twee diensten per soldaat, dag
en nacht, standaard dag; **6a** wat de schout als held was en het gevecht in beurten, gaat eruit.

**Het plan** (Claude, 15 okt, bijgesteld op die antwoorden; **besloten**, hieronder):
- **0, de grond voor samen spelen:** de wereld loopt in vaste stappen (los van de beelden per seconde), het lot van de
  wereld komt uit het zaad (los van wat alleen scherm is: nu trekt het scherm soms uit hetzelfde lot), en elke opdracht
  van een speler (bouwen, een weg, afbreken, soldaten in het wachthuis, sturen) is een handeling met gegevens, die op
  een stap ingaat. Een toets: twee werelden met hetzelfde zaad en dezelfde opdrachten blijven letter voor letter gelijk
  (de speeltest doet dat al met opslaan: "de proef met opslaan", `--opslaan`).
- **1, kijken en kiezen als een god:** **af** (15 okt, in `main`; `spel.md`,
  "Zo werkt kijken, kiezen en sturen nu"). De camera los (de pijltjes, de rand van het scherm, de minikaart, een toets naar
  de held); links kiest, een kader kiest je soldaten, rechts stuurt (de grond: erheen, een vijand: aanvallen); Ctrl+1 tot
  9 maakt een groep (in de browser neemt Chrome Ctrl+1 zelf, daar ook Shift+1), 1 tot 9 kiest hem; het briefje van één
  man, en met meer gekozen een lijstje; een klik op een dorpeling geeft zijn briefje.
  **Het plan** (Claude, 15 okt; **besloten**, Marcel: "Een post, tot je terugroept", "Muis tegen de zijkant van het scherm
  bewegen, beweegt het beeld in die richting", en erbij "Een bericht brengt je erheen" en "Dubbelklik kiest zijn soort"):
  **1a** de camera volgt de schout niet meer (alleen het gevecht in beurten kijkt nog mee, tot stap 2): de pijltjes, de
  muis tegen de rand van het scherm en de minikaart schuiven, het wiel zoomt altijd (het overzicht van Tab is weg), en
  **Tab** kiest de held en kijkt naar hem; slepen met de muis schuift niet meer. **1b** links kiest een soldaat, een
  veteraan of de held (Shift erbij), een kader met links kiest je mannen, een dubbelklik alle van zijn soort in beeld; een
  ring onder de voeten (in code); links op een dorpeling zijn briefje, op een gebouw zoals nu; het briefje van één man en
  een lijstje van meer, op de plek van het briefje van een gebouw. Wie een gesprek heeft (een voorval, de waard, de
  marskramer), krijgt op zijn briefje *Talk*: het gesprek gaat meteen open, zonder lopen, tot stap 5. **1c** rechts op de
  grond: erheen, en die plek is zijn **post**: daar staat hij van het opstaan tot het slapen, 's nachts thuis, tot je hem
  terugroept (*Back to the guardhouse* op zijn briefje; in stap 4 wordt het zijn dienst); rechts op een vijand: ze lopen
  hem achterna (slaan doen ze pas in stap 2; tot dan begint het gevecht in beurten als een vijand de held ziet). Een bevel
  is een opdracht (js/tik.js). **1d** Ctrl+1 tot 9 (en Shift+1 tot 9) maakt een groep, 1 tot 9 kiest hem, twee keer en de
  camera gaat erheen; een groep is alleen scherm. **Erbij:** een bericht met een plek (rovers, een brand) brengt de camera
  erheen met een klik of Spatie, en de plek knippert op de minikaart.
- **2, het gevecht in real time:** **Bezig in sessie `ccr-c0f9d2a2-6j0scf`** (15 okt): het plan voor Marcel. Elk kiest de dichtste vijand die hij ziet, loopt tot hij raakt en slaat, met de regels
  van 159; de actiepunten van een slag worden de tijd tussen twee slagen; rovers en wolven vallen aan wie ze tegenkomen.
- **3, formaties en de post:** *Line* en *Ring* (C1), op wapen gesorteerd, kijkend waar ze heen liepen (D1).
- **4, de diensten** (5a), en vijanden kunnen op elk uur komen.
- **5, de held en het opruimen:** de schout heet voortaan anders (vraag A), en valt hij, dan staat er een veteraan op; het
  praten is geparkeerd (een klik op iemand geeft zijn briefje, de marskramer opent zijn handel met een klik; de code van
  de gesprekken blijft tot we weten wat ermee gebeurt); eruit: sluipen, de lantaarn, sleutel en kist, oprapen, de camera
  die hem volgt, reizen met hem over de landkaart, en het gevecht in beurten; en wat sinds stap 1 niets meer doet: het
  lopen na een klik (`S.naLopen` en zijn afloop in `T.bijAankomst`), de tekst *Pick up the key* en de uitleg `hulp` in
  `js/ui.js` ("Click to walk, talk or use something").
- **6, samen spelen:** de vensters zetten de tijd niet meer stil (E1), en wat erin gebeurt (de handel, de velden, het
  slachten, de heer, de wetten, de raadsman, de brieven, de bode), de snelheid en het debugvenster worden opdrachten,
  zoals bouwen al is (stap 0); twee spelers (vraag C), eerst over onze eigen server (`npm start`, twee browsers), later over
  Steam; meedoen is het opgeslagen spel krijgen (alles staat al in `S`), en een controle dat de werelden gelijk blijven.
Daarna de muren (158) en de tekeningen van de soldaten.

**Besloten** (Marcel, 15 okt: "A1, B1, C1, D1, E1, F1"): de held heet *Commander* (in de code `aanvoerder`); valt hij
zonder veteraan, dan de soldaat die het langst dient; ieder een eigen dorp op hetzelfde eiland, met z'n tweeën in de demo;
*lockstep*; één snelheid voor iedereen, een gevecht zet iedereen op 1×; en stap 0 eerst. De vragen waren: **A** de naam: A1 *Commander* (in de code `aanvoerder`): een
generaal voert een leger aan, een commander past bij een dorp met een paar troepen en kan meegroeien; A2 *General*
(`generaal`); in beide gevallen ook in de code (zo'n 590 plaatsen), in stap 5, met het opslaan een versie omhoog; **B**
valt de held en is er geen veteraan: B1 dan de soldaat die het langst dient, en is er niemand, dan staat er een op
zodra er weer een soldaat is (het spel gaat door), B2 dan is het spel uit; **C** samen spelen, met wie: C1 elk een eigen
dorp op hetzelfde eiland, vrij om elkaar aan te vallen, en de heer tegen iedereen; in de demo met z'n tweeën, C2 elk een
dorp, samen tegen de heer, C3 samen één dorp; **D** hoe: D1 *lockstep*, zoals Age of Empires en The Settlers: elke
computer rekent de hele wereld, en alleen de opdrachten gaan over de lijn (weinig, ook over Steam); dat kan omdat de
wereld al letter voor letter gelijk speelt met hetzelfde lot, en het risico is een klein verschil ergens (dan lopen de
werelden uiteen), dus een controle om de zoveel stappen; D2 één computer rekent, en de ander krijgt wat er verandert
(eenvoudiger gelijk, maar veel verkeer met honderden lopende mensen, en de ander loopt achter); **E** de klok samen (een
jaar is 30 uur op 1×, en een gevecht loopt op 1×): E1 één snelheid voor iedereen, de laagste die iemand kiest, een gevecht
ergens zet iedereen op 1× tot het voorbij is, pauze kan ieder, en een venster zet de tijd niet stil (alleen bij wie
alleen speelt), E2 beslissen bij stap 6, met een proef; **F** de volgorde: F1 stap 0 eerst, dan 1 tot 6 (de grond
achteraf leggen onder code die zonder gebouwd is, kost meer), F2 eerst de RTS (1 tot 5), dan 0 en 6.

## Af (sinds 11 okt)

- 169, het debugvenster onder D (15 okt; `code.md`, bij `js/debugvenster.js`): +50 bouwmateriaal en goud, een gezin, de
  bouwplaatsen meteen af, en de marskramer nu; aan tot de Steam-versie.
- C6, meten en spelen (15 okt; `speelbaar.md`, "De speeltest van 15 okt"): de speeltest meet de ossenkar (tabel "De
  ossenkar"), speelt met `--jaren 2` twee jaar, en de kolonist zet een schuur richting de rotsen en verkoopt de
  marskramer wat over is als hij op goud wacht. Eén kar is ruim genoeg voor een gehucht.
- B3, de afwisseling (vraag 154; 13 okt, Marcel: "A1, B1, C1, D1"; `spel.md`, "Zo werkt de afwisseling nu"): het dorp
  eet zijn maaltijd in gelijke delen van elke soort (graan, brood, vlees, vis, wijn, kaas, groente, eieren), en de
  soorten die minstens een tiende waren, bepalen al het werk (60% met één, 100% met vier): de werkplaatsen (maal de
  tevredenheid), de bouwers en het veldwerk. De status Plain fare (erger: One dish), de raad bij twee soorten of minder,
  de kar met kaas en gezouten vlees, en de kolonist bouwt een moestuin, een jager en een kippenhok. De speeltest: vijf
  eilanden zonder fouten (`speelbaar.md`).
- De toets voor dubbele namen (13 okt, Marcel: "ja, bouw die toets"): `test/namen.test.cjs` kijkt bij het laden of geen
  bestand een naam in `Spel` zet die een ander al zette (`gereedschap.md`, bij `npm test`).

- B2, het hele eiland (vraag 117, stap 3; 13 okt, Marcel: "A ja, B1, C2"; alles in `kaarten.md`, "Het hele eiland"): één
  weg naar de tegels (B2a), het eiland in stukken van 64 bij 64 die opengaan waar je mensen komen (B2b), opslaan wat
  veranderde (B2d, 15 kB, was 473), en de mist (B2c; "A2, B1, C ok"). De kolonist speelt de eilanden 1 tot 5 het jaar
  uit zonder fouten. Nog voor later: de hoogte per stuk (de spelregel Hoogte, standaard uit); de lange tochten (HPA\*) en
  wat ver weg is als getallen gaan naar F.

- Eerst optimaliseren (13 okt, Marcel: "volgorde 1 tot 4 is goed", "2 ja", "3 optie a"; ook zonder videokaart: "Het
  liefste wel"). De meetlat: `npm run stukmeting` geeft ook de echte tijd per beeld (zonder videokaart schildert de
  browser na het tekenen; `kaarten.md`, "Wat de meting mat"). Eén kijkgat per wezen (in het bos 24 naar 1, 83 naar 67
  ms per beeld). Een kaartverandering tekent alleen de grond rond die plek opnieuw (28 naar 4 ms, pixel voor pixel
  gelijk), en het wegennet kijkt alleen die plekken na (10 naar 2 ms, hetzelfde net). Het land vooruit maken kiest wat
  het eerst nodig is en krijgt zijn tijd per seconde: op de tocht naar de kust van 8 naar 0 van de 18 stukken niet
  klaar. Niet gedaan (Marcel: "Nee, je hebt gelijk, dat is zinloos"): het bos op halve maat tekenen zonder videokaart
  (67 naar 17 ms per beeld), want een goedkope laptop heeft wel een videokaart in de processor.

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
