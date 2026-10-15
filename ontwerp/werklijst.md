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
uiterlijk. **Het volgende is C6**, meten en spelen, met de keten erin.

**Wacht op Marcel:**
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

**Daarna, in deze volgorde:** C, D, E, F (ronde 3 van A na C); G loopt ernaast op het tijdpad van `commercieel.md`.

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
   stapels worden. Dan ronde 3 van A. **Bezig in sessie `claude/wizardly-sagan-qw7f8f`** (15 okt): het plan voor het
   meten, wacht op Marcel.

Wat Claude erbij zag (14 okt): met de getallen van nu is één kar ruim genoeg voor een gehucht (hij rijdt binnen 16
tegels drie tot vier ritten per dag, een houthakker maakt 2 hout per dag); de keuze voor een tweede kar komt met de afstand
en de groei. Wil je hem eerder voelen, dan is de lading per rit het getal (de werkbank).

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
- **Nog open** (als we er zijn): **161**, het nieuws echt en bruikbaar (wat een stad tekortkomt, waar de mannen van de
  heer zijn, welk dorp morrt), en met een herberg blijven ze langer; **160**, eerst losse ritten (een kar met wat over
  is naar een stad, dagen onderweg, een escorte helpt), vaste routes later.

## Af (sinds 11 okt)

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
