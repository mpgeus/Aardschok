# Opmerkingen om later na te lopen

Marcel (25 sep 2026): "Notities van alle opmerkingen maken, kunnen we later revisiten." Hier staat
alles wat onderweg opviel en nog niet af is: wat ruw is, wat niet helemaal goed staat, en wat
Claude erbij bedacht zonder dat Marcel het al koos. Niets hiervan houdt het werk op.

Wie iets ziet, zet het erbij, met een datum; wie iets oplost, haalt het weg (`git log` bewaart
het). De keuzes die op Marcel wachten, staan in de werklijst onder "Wacht op Marcel".

## Het spel

- **Waar de tik nog hapert** (18 okt, Marcel: "Waar komen de performance hits vandaan?"): uitgezocht per deelgebied
  in `snelheid.md`, "De tik" (het land en het laden, de kuddes, middernacht), met wat het kost en wat het oplevert; de
  keuze is aan Marcel. Onderweg: `npm run grootte` werkt niet op het eiland (`gereedschap/grootte/bouw.cjs` zoekt alleen
  kaarten tot 512 tegels, bouwt niets en meldt een lege reden).

- **De speeltest laadt het spel niet** (17 okt, bij c2 van 6a2): `npm run speeltest` stopt met `page.goto: Timeout
  30000ms exceeded` op `file:///.../index.html`, en ook met drie minuten wachten komt er geen "load"; op de stand zonder
  c2 (een losse kopie met `git worktree add`) net zo, dus het ligt niet aan c2. Via de server (`npm start`, in de
  browser van de app) laadt het spel gewoon. Nog niet uitgezocht wat er via `file://` blijft hangen (een plaatje, een
  lettertype van buiten, of Chromium van Playwright zelf).
- **Wat c0 van 6a2 liet zien** (17 okt, op tocht naar land dat je niet kent): het eiland was te voet in stukken
  gebroken: een weg kreeg geen bruggetje waar de oversteek breed of schuin was, en het proefdorp zat opgesloten in 7%
  van het land. Dat is opgelost met L1 (Marcel: "L1"; `code.md` bij `js/eiland.js`): tegel voor tegel gemeten liggen op
  eiland 1 tot 20 alle dorpsplekken, de stad en het kasteel nu in één stuk land, 63 tot 80% van het belopen land. Wat
  overblijft: (a) **het woud** (60% bomen per tegel) is een muur met holtes, en in de kampen staan bosjes van ruim 50%
  die dat ook zijn; een doel in een open plek midden in het woud haal je niet (de tocht gaat zo dicht als het kan:
  van zes lange tochten vanuit het proefdorp kwamen er vier aan, twee tot op 37 en 97 tegels); (b) een tocht die land
  in een dood eind open laat gaan, loopt eerst dat eind in en dan terug (hij leert het land pas kennen als het open is);
  (c) wie snel nieuw land in loopt, laat het spel het land maken (`T.landStuk`, zo'n 45 ms per stuk; in de proef in
  Node duurde de traagste tik 160 tot 320 ms), wat op 30× een hapering kan geven. Het land vooruit maken langs de tocht
  zou helpen, als je het ziet.
- **Wat stuk b van 6a2 liet zien** (16 okt, het wild per stuk land; buiten de stap gehouden): (a) `T.isBos` zonder het
  jonge bos telt de bomen alleen binnen het vak om de dorpen (`T.kaartVak`, via `T.natuurBij`): daarbuiten is er volgens
  hem nergens bos. Het wild telt nu per tegel (met het jonge bos); wie verder T.isBos vraagt (de raad, het bouwen), doet
  dat bij een dorp, maar een regel die later ver van een dorp naar het bos vraagt, krijgt nee. (b) Er is nu meer wild rond
  het begin (de rand van 16 tegels die bij het begin opengaat, heeft zijn eigen wild), en dat kost rekenwerk: tien
  speldagen op 30× vragen in Node 4,1 s, waar het 1,9 s was (de speeltest duurt 7 in plaats van 3 minuten). Het meeste
  gaat naar de volgers van een groep die in elkaar vastlopen (een omweg die er niet is, `omweg` in `js/lopen.js`: 12.000
  keer in tien dagen, waarvan 8.600 zonder weg); dat deden ze al, het zijn er nu meer. Een volger die vastloopt, zou kunnen
  wachten of op de plek van een ander gaan staan, in plaats van elke keer een omweg te zoeken. (c) In de speeltest van
  16 okt (na stuk b) had eiland 1 aan het eind geen hout (was 1), 90 dagen kou en één dode van honger, en groeide
  eiland 3 tot 27 in plaats van 33 mensen; of dat het wild is (meer herten voor de jager, meer roedels die een houthakker
  laten schrikken) of een ander lot, is niet uitgezocht (de balans komt later). (d) Een stuk dat opengaat, kost voor zijn
  wild hooguit zo'n 40 ms (gemeten in Node, met het land en het raster van het lopen al klaar): op 30× nog geen
  hapering, maar wel iets. Het wild over meer tikken spreiden kan, als je het ziet.
- **Wild dat zijn bos kwijtraakt, trekt naar de buren** (Claude, 16 okt, bij stuk b van 6a2; Marcel koos voor nu E1, "is
  weg"): E2 was dat een groep die zijn bos kwijtraakt, naar het dichtste open bos met plaats trekt, ook als dat bij een
  ander dorp ligt. Kap je je bos, dan stuur je je wolven naar je buurman: met twee spelers een reden om het bos te sparen,
  of juist niet. Meer werk dan E1 (een nieuw thuis zoeken buiten het eigen stuk).
- **Wat stuk a van 6a2 liet zien** (16 okt, het wild van de wereld; buiten de stap gehouden): (a) een wolf vlucht voor
  wie hem achterna zit (2,2 tegels per seconde), sneller dan de aanvoerder: stuur je hem op een wolf af (rechts klikken),
  dan staat *Fighting breaks out* in de balk en loopt de tijd op 1×, maar valt er geen klap, tot hij het opgeeft (dat was
  al zo vóór 6a2). Een gevecht zou pas moeten beginnen als er een klap valt, of de roedel zou moeten blijven staan als
  iemand op hem afkomt. (b) Sinds vraag 171 draagt de aanvoerder 's nachts een lantaarn, en licht houdt de wolven weg:
  een roedel met honger valt hem nooit meer aan, alleen een dorpeling die alleen in het donker is (of een schaap).
  (c) `w.lot`, de dobbelsteen van de wereld, begint nog op zaad 1, niet op het nummer van het eiland: alleen een monster
  van een toets gooit er nu mee; stuk c (de roverskampen) zet hem goed.
- **Wat vraag 172 (het menu) liet zien** (16 okt): (a) de raad onder het doel zegt aan het begin nog "A day is long: [+]
  speeds up time, and [Z] sleeps until morning" (`js/raad.js`), maar Z doet sinds stap 5 van vraag 170 niets meer. (b) De
  stand van de proefversie staat nu ook in Credits; voor Steam wil Marcel er misschien zijn achternaam of een studio bij
  ("A game by Marcel, made with Claude" was de keuze). (c) in de browser onthoudt Settings het hele scherm niet: dat mag
  pas na een klik (in Electron wel, sinds 172b). (d) Pauze als je wegklikt pauzeert bij samen spelen het spel voor
  allebei (E1): bij 6c moet hij daar uit, of alleen gelden voor wie alleen speelt.
- **Wat 6a van vraag 170 liet zien** (16 okt, meer dorpen op één eiland; buiten de stap gehouden): (a) het licht, de rook,
  de sneeuw, het kampvuur en de paadjes tekent het scherm voor het dorp waar de camera het dichtst bij is (`T.dorpHier`);
  met twee dorpen tegelijk in beeld (alleen ver uitgezoomd, ze liggen 430 tegels of meer uit elkaar) mist het andere dat.
  (b) De spelregel "Hoogte" legt alleen heuvels onder het eerste dorp, en de bouwstijl van de kaart (`w.stijl`) is die van
  het eerste. (c) Een roedel die iemand van een ander dorp aanvalt, riep de mannen van zijn eigen dorp om hulp
  (`js/beesten.js`, `hulp`), niet die van het slachtoffer (opgelost in 6a2, stuk a: het wild is van de wereld, en wie
  aangevallen wordt, krijgt de mannen van zijn eigen dorp). (d) De paadjes en de lijsten van de kaart (`T.kaartVak`) lopen
  over het vak om alle dorpen: met dorpen ver uit elkaar is dat groot (bij 600 tegels 644 bij 396), en duurder bij een
  verandering. Per stuk rekenen (zoals het land) is de echte oplossing. (e) Gebouwen van de ander aanvallen of in brand
  steken kan nog niet (vraag 170, het plan bij 6). (f) `A.veld` van een overval is het nummer onder de velden van het dorp:
  breek je een veld af terwijl de rovers komen, dan schuift het nummer (dat kon al met één dorp).

- **Ronde 4 van het snoeien** (16 okt, bij vraag 170, stap 5; buiten de stap gehouden): de overgang tussen de kaarten van
  Tiled (`js/gebied.js`, `S.naarGebied`, zo'n 240 regels en 165 regels toetsen in `test/wereld.test.cjs`) en de kamers met
  deuren (`T.maakProefkamers`, `T.ontdekBijDeur`, `w.bekend`, `deurenOpenen`) bestaan alleen nog op de proefkaarten, voor
  een held die van kaart naar kaart liep. Veel toetsen leunen op de proefkamers (regels, vee, dorpelingen, voetafdruk),
  dus het is een eigen ronde.
- **Wat stap 1 van vraag 170 liet zien** (15 okt, kijken, kiezen en sturen): (a) een post is één tegel per man; staat
  er iemand op (een dorpeling die langsloopt), dan wacht hij ernaast tot de tegel vrij is, zoals iedereen bij zijn anker.
  (b) Rechts op een gebouw stuurt je mannen naar de vrije tegels eromheen; erin gaan ze niet (een toren of een muur om op
  te staan komt met 158). (c) Wie je op een vijand afstuurt, loopt hem na zolang hij leeft, ook het bos in en ver van het
  dorp: in stap 2 hoort daar een grens bij (hoe ver een soldaat achtervolgt). (d) De muis tegen de bovenrand schuift het
  beeld ook als je naar Menu of de snelheden wilt: de rand is 8 pixels, binnen de knoppen; voelt het toch onhandig, dan is
  het één getal in de werkbank. (e) Het briefje van één man zegt nog niet tot welke groep hij hoort.
- **Beter gereedschap als upgrade voor de arbeiders** (Marcel, 14 okt, als notitie bij 156: "arbeiders kunnen upgrades
  krijgen in de vorm van beter gereedschap wat hun werk makkelijker maakt. We blijven wel in de geest van de tijd"). Wat
  er al is: de smidse maakt van ijzer gereedschap, en wie het heeft, werkt 25% harder (`gereedschapBonus`,
  `T.gereedschapDekking` in `js/gebouwen.js`); het slijt in 180 dagen, en het briefje van een gebouw zegt het onder
  "Helped by". Dat is één soort gereedschap voor iedereen. Een gedachte van Claude voor als het aan de beurt is: per
  ambacht een stap uit de tijd, zodat de smidse een keten krijgt en je ziet wat je kiest, bijvoorbeeld de houthakker van
  de bijl naar de zware bijl, de boer van de houten ploeg naar de ploeg met een ijzeren schaar en van de sikkel naar de
  zeis, de zagerij van de kuilzaag (twee man) naar de zaag op het water (een raderwerk, 13e eeuw). Niet nu (eerst
  speelbaar); de plek in de volgorde kiest Marcel.
- **Een weg ziet er net zo uit als een paadje** (14 okt, C stap 5): allebei zand (`T.zandHoeken`). Een paadje komt vanzelf
  van elke deur, een weg leg jij, en alleen over een weg rijdt de kar sneller; dat zie je nu niet. Een eigen tekening
  (karrensporen, een rand van stenen) zou het zeggen. Mee in een ronde van de beelden.
- **Het hout van wat ze voor een weg rooien, gaat meteen de opslag in** (14 okt, C stap 5): een weg heeft geen deur, dus
  geen stapel; de bouwers dragen het zelf. Een kleine uitzondering op "alles met de kar". Een losse stapel bij de weg
  (zoals bij afbreken) kan, als het stoort.
- **Een veld breek je niet los af** (14 okt, C stap 5; Marcel koos "wegen en gebouwen", de velden gaan mee met hun
  boerderij): ook een veld dat je net verkeerd legde en dat nog niet geploegd is, blijft. Als dat stoort: afbreken voor
  een veld in aanleg.
- **De kolonist laat het dorp niet groeien** (15 okt, C stap 6): hij bouwt hutten alleen voor de gezinnen uit het kamp,
  ook als het spel zegt dat er een gezin wil komen, en nooit een put, die een keuter wil voor zijn hut tot een huis groeit.
  Zo blijft het dorp twee jaar 17 mensen, wordt het nooit een dorp, en meet de speeltest de planken niet. Een proef met
  twee regels erbij (een hut als alleen de plaats een gezin tegenhoudt, `T.waaromGeenGezin`, en wat de raad zegt dat de
  huizen missen, `T.watDeHuizenMissen`) gaf zonder beelden een dorp op dag 180 en 450, tot 53 mensen; Marcel koos daarna
  dat hij het groeien zelf test (169), dus die regels zijn er niet. Wat de proef liet zien: **de raad zegt "kan" bij een
  kapel waar nergens plek is** (`kan` is: het mag gebouwd worden, niet: er is een plek; de kring van de kapel moet huizen
  bij een boerderij buiten het bouwbereik halen); **één houthakker is te weinig voor 45 mensen** (het hout op in de
  winter); en **de gebouwen van het dorp kosten 6 tot 14 goud**, dat alleen van de marskramer komt (1 goud per 20 hout).
- **In het gehucht zijn planken nergens voor** (15 okt, C stap 6): de zagerij maakt er 60 (`T.maaktTot`) en staat dan stil,
  en de marskramer koopt ze niet. Ze tellen pas als het dorp er is.
- **De kar haalt al een stapel van 1** (15 okt, C stap 6): gemiddeld 2 van de 8 per rit, en de helft van zijn rijden is
  leeg. Nu kan dat (hij is 45 tot 60% bezig); krijgt hij het druk als het dorp groeit, dan is `minstens` het getal (met 4:
  de helft van de ritten, maar een waar ligt twee dagen op de stapel in plaats van een).
- **De vergelijking ziet een `--getal` niet** (15 okt; `gereedschap/speeltest/vergelijk.cjs`): met `--getal ... --tegen`
  zegt `vergelijking.md` "Geen waarde was anders" en dat het verschil "van de code" komt, want de waarden komen uit de
  code en de stand draagt het getal in zijn naam. De tabel per spel klopt wel.
- **Een huis dat wilde groeien en dat je afbreekt** (14 okt, C stap 5): de appelbomen die het gezin ervoor zou kappen,
  houden hun teken (`v.teKappen`, `js/bos.js`), en worden door een houthakker of bouwer als boom gehakt. Klein.

- **Een stapel achter een gebouw zie je niet** (14 okt, C stap 1): de doorkijk (`js/doorkijk.js`) maakt een dak doorzichtig
  voor een wezen, niet voor een stapel. In het proefdorp, waar alles tegen het vuur staat, lag de stapel van de houthakker
  achter een boerderij. In het spel zet je meestal ruimer; als het stoort, de stapel meenemen in de doorkijk.
- **Een akker kan af zijn vóór zijn boerderij** (14 okt, C stap 2): een veld vraagt geen hout, de boerderij wel, dus met
  de kar komt de akker vaak eerder af. Is het nazaaitijd, dan zaait het dorp hem in, ook al woont er nog geen boer. Dat
  kon al als de boerderij in het bos stond; nu gebeurt het vaker. Niet erg, maar te zien.
- **Een nieuwe bouwplaats krijgt pas de volgende ochtend bouwers** (14 okt, C stap 2; dat was al zo): wie bouwt, kiest
  het dorp 's ochtends. Met de kar valt het meer op: hij brengt het hout nog dezelfde dag, en dan staat het een dag.
- **Zout voor de winter zegt de raad niet meer** (16 okt, ronde 3, stap 6): de raad over vis en vlees voor de winter
  (vraag 132, B: "buy salt from the merchant") rekende met wat de huizen voor hun wens vlees of vis aten, en ging met de
  wensen weg. Vis en vlees bederven nog zonder zout, en tellen in de afwisseling: raakt de vis in de winter op, dan eet
  het dorp een soort minder, werkt het trager en groeien de huizen niet. Kan terugkomen op de maaltijd
  (`T.maaltijdDeel`), als Marcel dat wil.
- **De raad zegt niet dat een huis op meer soorten eten wacht** (16 okt, ronde 3, stap 6): de raad over de afwisseling
  spreekt tot twee soorten (`afwisselingTot`); met drie groeien de hutten, maar een huis vraagt er vier. Het briefje bij
  een huis zegt het wel ("now it eats 3"). Misschien de raad ook, als een speeltest laat zien dat de speler het mist.
- **Het teken bij de deur is nog getekend** (16 okt, ronde 3, stap 6): `beelden/tekens.png` en zijn ingang in
  `beelden/beschrijving.js` komen van `gereedschap/pixelart/papieren.cjs`, maar het spel tekent ze niet meer. Ze gaan eruit
  bij de volgende `npm run pixelart:spel` waarin `tekens()` in `naar-spel.cjs` is weggelaten (het papier en de spijker
  blijven: die zijn van het briefje).
- **Put, kapel en markt hebben minder te doen** (16 okt, ronde 3, stap 6): de put en de markt waren een wens van een
  stand; de put is nu alleen waar de mensen water halen en praten, de markt alleen zijn kramen. De kapel telt nog in de
  tevredenheid (20%). Laken gaat naar de heer en de marskramer, bier naar de herberg.
- **Een moestuin en een kippenhok werken ook trager** (13 okt, B3): ze hebben geen handen, maar wat ze maken, gaat naar
  de tevredenheid en de afwisseling, zoals elke werkplaats (`js/gebouwen.js`, stap 6). Wie eentonig eet, krijgt dus ook
  minder groente; een kleine lus terug. Zo was het al met de tevredenheid.
- **Een kaart van het eiland onder een toets** (idee van Claude, 13 okt; Marcel: "idee ja"): het eiland van boven, met
  alleen wat je verkende en de rest in de mist, getekend zoals de plaat van de kaartenmaker
  (`gereedschap/pixelart/eiland-plaat.cjs`), met je dorp, de wegen en de namen die je kent. Na de mist (B2c), niet erin.
- **De wolven en de herten kijken elke nacht over het hele vak om het dorp** (13 okt, idee van Claude): of hun thuis
  nog in het bos ligt, rekent `bosKaart` (`js/beesten.js`) het bos en hoe diep het is uit voor alle tegels van
  `T.kaartVak`, nu 100 bij 100. Sinds `T.bosInVak` kost dat een paar ms (was 50 tot 90, het zwaarste van de nacht).
  Zuiniger kan nog: een groep hoeft alleen rond zijn thuis en zijn plekken aan de bosrand te kijken, en de hele kaart is
  pas nodig als hij verhuist of splitst. Dat hangt dan niet meer af van hoe groot het vak om het dorp wordt. Pas als
  het vak groeit of het weer opvalt.
- **Het hol vlak bij het kamp** (13 okt, B2b): het hol van een roedel ligt op een tegel diep in het bos die het lot
  kiest, zonder afstand tot het dorp (`thuisKandidaten` in `js/beesten.js`). Op eiland 7 ligt het tien tegels van de
  plek van de kar in het kamp, en een roedel schuwt de huifkar en de ossenkar zoals een mens (`mensBij`): komt hij 's
  ochtends thuis, dan vlucht hij weer. Op het oude land lagen er ook holen op 10 tot 12 tegels van het plein. Te kiezen:
  een hol minstens zoveel tegels van het plein, en of een kar een roedel wegjaagt. `test/beesten.test.cjs` houdt de kar
  daarom bij de schout.
- **Een richel zonder helling** (13 okt, B2b): de helling de richel op (`legHelling` in `js/hoogte.js`) komt alleen waar
  je op de helling en aan de voet kunt staan. Sinds het land van het eiland komt, ligt de richel vaker in het bos: op 7
  van de 10 eilanden is er geen weg van het plein naar boven (vroeger 5), en op eiland 4 staat er rondom een boom of een
  rots, dus is er geen helling. Rooit iemand die bomen later, dan komt de helling er niet alsnog: de richel blijft
  onbereikbaar. Te kiezen: de helling ook door het bos (de bomen erop gaan om, de rotsen niet), of de helling uitrekenen
  als het land verandert. `test/hoogte.test.cjs` speelt de weg naar boven op 1, 7 en 10.
- **Het eerste jaar van de kolonist, wat opviel** (12 okt, vraag 152, 1f; de speeltest staat in `speelbaar.md`). Na te
  lopen:
  - De houthakker werkt in het eerste jaar 5 tot 12 dagen zonder dat het spel zegt waarom (`werkt niet` in de tabel
    "Het eerste jaar"). In een toets zonder beelden werkt hij nooit: wie nog naar zijn huis onderweg is (`p.komt`), telt
    de hele dag als onderweg (`T.werkUrenVan`), en zonder lopen komt niemand aan.
  - Een boer die na een voorjaar met honger een akker wei maakt (`weideErbij` in `js/akkers.js`), telt de akkers van
    het lege begin als van één boer: ze hebben geen `huis`, alleen een `boerderij`. In een proef zonder beelden (dezelfde
    stappen als de toets) werd zo een akker van de enige boerderij wei, terwijl er geen koe is; in de speeltest gebeurde
    het niet.
- **De kolonist als brein van een ander dorp** (12 okt, een idee van Claude bij vraag 152, 1f; niet nu): de kolonist van
  de speeltest (`gereedschap/speeltest/kolonist.js`) kiest uit dezelfde handelingen als het bouwmenu. Zo kan hij later
  het brein zijn van de andere dorpen op het eiland (F, "erop uit"), zoals CLAUDE.md het wil: wat een ander dorp
  beslist, kiest het uit dezelfde handelingen als een mens in zijn plaats.
- **Het lege begin na 1c** (11 okt, vraag 152, 1c): het venster Spelregels laat bij "Huizen" en "Wie bouwt" nog hun eigen
  keuze zien, terwijl "Leeg" ze op "Jij" zet; dat gaat weg in ronde 2 van het snoeien, als die twee spelregels eruit gaan.
- **Na het Engels, wat opviel** (11 okt, vraag 147, stap 2). Na te lopen:
  - De uitleg van de spelregel "The levy" zegt nog dat vrijkopen de heer argwanend maakt; de argwaan is op 11 okt
    eruit gegaan (optie 1), en vrijkopen kost nu gunst per goud. Getrouw vertaald, niet verbeterd.
  - De situaties in `js/gesprekken.js` (bij welke stand een gesprek speelt) blijven Nederlands: alleen de schrijver ziet
    ze. De gespreksschrijver toont ze zo.
  - Een paar zinnen plakken nog een stukje aan (`{wie} to your side{wapens}` bij de rovers, en bij het graan): voor het
    Engels goed, maar een vertaler ziet daar geen hele zin.
- **Boeren uit het niets, wat opviel** (11 okt, vraag 152, 1e). Na te lopen:
  - Een wijngaard draagt al in het jaar dat hij geplant is volle trossen; echte ranken dragen pas na een paar jaar. Zo
    blijft het eenvoudig; na 1f zien we of wijn zo te makkelijk is.
  - Een boerderij heeft plaats voor 4 en een gezin van het kamp is 3: een nieuw gezin over de weg kan er een mens bij
    zetten (`komenErBij` in `js/bewoners.js` vult het huis met de meeste plaats). De boer blijft het hoofd van het eerste
    gezin (`T.boerVan`), maar of dat goed oogt, zien we pas als er weer gezinnen komen.
  - Wie een akker ploegt of een wijngaard plant, staat met de bijl van de bouwers (zie "Bouwen met de bijl" hieronder);
    een ploeg of een spade zou beter zijn. Mee in een ronde van de beelden.
  - In het bouwmenu staat de beschrijving van een gebouw nog in het Nederlands, ook naast de Engelse uitleg van een veld.
    Mee als de spelteksten om gaan (G).
- **Het huis van de schout heeft nog geen bouwfasen** (11 okt, vraag 152, 1d): in aanbouw staat het bleek op de
  kaart, waar een hut of huis zijn fundering, muren en steigers laat zien (`tegels/bouwfasen.json`, uit
  `gereedschap/pixelart/bouwfasen.cjs`). Mee in een ronde van de beelden.
- **Bouwen met de bijl** (11 okt, vraag 152, 1d): wie meebouwt, staat met het figuur van de hakker naast de voet en
  hakt, ook als er niets meer te rooien is (`bouwen` in `js/sprites.js`); een timmerman met een hamer en een balk zou
  beter zijn. Mee in een ronde van de beelden.
- **Een plek die gerooid wordt, ligt nog open** (11 okt, vraag 152, 1d): de voet staat pas op de kaart als de plek vrij
  is, dus de mensen lopen er nog overheen en er kan een paadje ontstaan; er komt geen gebouw en geen lantaarn op
  (`T.bouwplaatsOp`).
- **Het label van het overzicht** (10 okt, na vraag 146; Marcel: "rest in opmerkingen"): `#overzicht-label` (`Tab`) is
  nog donker glas met een Nederlandse zin in `index.html`, het enige wat er van de ui nog zo bij ligt. Wordt een briefje
  zoals `#foto-wenk` (een zin uit `T.t`), of papier zoals de briefjes bovenaan.
- **De ouden dragen kennis over** (9 okt, Marcel bij vraag 145, ouder worden: "Ouderen dragen mogelijk kennis over? Eerst
  alleen het beeld"): een oude die met een jonge werkt, maakt hem beter in zijn werk, of een dorp dat zijn ouden verliest,
  verliest wat zij wisten. Nu doet ouder worden alleen wat de leeftijd al deed.
- **Wie er in een brandend huis is, en de koorts in beeld** (9 okt, bij vraag 144, 3): het overslaan en de pestbos zijn
  er sinds 10 okt (Marcel: "Ja, zo"). Nog niet: wie er in een brandend huis is, en of de koorts verder een eigen beeld
  krijgt (iemand die hoest, een ziekbed).

- **Een huis zonder kapel, en nergens plek voor een kapel** (8 okt, de sessie van de kaartenmaker; vraag 117, 2d): de put
  zonder plek is opgelost (een erf houdt plaats voor een put, en een put voor een hut op een erf haalt ook het huis dat de
  hut wordt), maar met de kapel kan hetzelfde: op het eiland van 62707 (`main` met de grote gebouwen) vond een huis
  zestien maanden lang binnen 40 tegels nergens plek voor een kapel, en won het dorp niet; elders kwam het pas na de winst.
  `T.kringGrond` werkt al per soort, dus de regel van 2d kan ook voor de kapel gelden (een erf in `T.waaromPastErfNiet`
  vraagt het dan voor de put en de kapel). Nog niet bekeken: wat er daar de laatste plek nam. Ook kan wat er verder
  gebouwd wordt (een werkplaats, een kraam) de laatste plek nemen; de regel geldt alleen voor erven en de put zelf.
  **Ook een wijnboerderij** (10 okt, de speeltest van de wijn, `speelbaar.md`): haar gezin is van de stand boeren en wil
  een kapel binnen 40 tegels, en een wijnboerderij is groot (10 bij 8), dus komt ze vaak ver weg. Op sluw 2 stond de
  vierde zo een jaar zonder kapel, en hield ze de winst tegen. Te kiezen: een wijnboerderij komt alleen waar haar gezin
  een kapel haalt (zoals een erf, `T.plekVoor`), of de regel van 2d ook voor de kapel. **Gekozen en gebouwd** (10 okt,
  avond; Marcel: "Wijn haalt kapel"): elk gebouw met een gezin kijkt nu wat een erf nakijkt (`T.waaromGeenKringPlek`), en
  sluw 2 wint weer. Nog open: een werkplaats of een kraam die de laatste plek neemt.

- **De gunst na Sint-Maarten, en de gril in wintermaand** (8 okt, de sessie van de kaartenmaker; vraag 117, 2d): bij de
  bouwer van de speeltest staat de gunst van de heer na Sint-Maarten bijna elk jaar op 5, de laagste stand vóór 0 (eerst
  komt de waarschuwing). Komt dan op 12 wintermaand de gril van het vette varken, en heeft hij geen tien vlees, dan zegt
  hij "Onze varkens zijn mager", en is zijn ambt weg: zo verloor hij op het eiland van 72022 in 2c, in 2d en met de put
  die ook het huis haalt, en won hij alleen in de speeltest waar hij die dag tien vlees had. In 2c leek het op de rovers
  (`speelbaar.md`): die maakten de oogst klein en de gunst laag, maar de gril gaf de laatste duw. Vragen: kiest de bouwer
  van de speeltest zijn antwoord slecht (hij weet dat zijn gunst op 5 staat), of is een gril die je ambt kost bij de
  laagste gunst te hard?

- **Rovers die blijven komen als er niets te halen is** (8 okt, de sessie van de kaartenmaker; vraag 117, stap 2c): op het
  eiland van 72022 kwam de bende bij de bouwer vanaf het tweede jaar om de tien dagen, 32 keer in drie jaar (op het land
  van de maker 7), ook "met lege handen", en ze vertrapten zes keer een akker. De oogst zakte van 641 naar 190 en 92, er
  was geen bier en geen brood, hij kon de heer niet betalen, en zijn gunst raakte op. Of het door het eiland komt, zegt
  één spel niet. Een vraag voor Marcel: komt een bende minder vaak als er niets te halen viel, of valt hij uiteen?

- **Laden maakt eerst een vers spel** (8 okt, de sessie van de kaartenmaker): `T.laadSpel` (js/main.js) begint met
  `T.nieuwSpel()`, en dat legt nu een heel eiland met een gehucht (1 à 2 s), dat het bewaarde spel daarna overschrijft;
  het eerste beeld rekent dan nog het eiland van het bewaarde spel uit (0,6 s, en de rand en de hoogte). Laden kan
  sneller als het nieuwe spel het land van het bewaarde spel neemt, of geen land legt.

- **Het leven in het bos, wat nog niet te zien is** (7 okt, zevenendertigste sessie; vraag 116, stap 2a): de jongen van
  de wolven en de herten hebben nog geen eigen tekening (een welp, een kalf: nu zijn het kleine volwassenen, even groot);
  de jacht van een roedel op de herten is een lot in de nacht, niet te zien (een hert is 's ochtends weg; later de roedel
  die de kudde opjaagt, en botten bij het hol, vraag 116, f); en zijn de herten van een land op, dan komen er geen nieuwe
  van buiten, zodat de roedel elke winter honger heeft. Een vraag voor Marcel als dat te hard blijkt: een groepje herten
  dat in de lente van buiten komt als het bos leeg is.

- **Het hert kost veel plaatjes** (7 okt, zevenendertigste sessie; vraag 116, stap 1): de drie vellen van het hert
  (gereedschap/pixelart/wild.cjs) houden samen zo'n 38 MB vast als ze alle drie geladen zijn (hert2 alleen 16 MB, om het
  gewei en de sprongen), ongeveer wat de drie koeien kosten; ze staan op elk land van de maker. Een figuur laadt al zijn
  houdingen tegelijk (laadFiguur in js/sprites.js). Te verkleinen als het nodig is (vraag 113): rennen pas laden als een
  hert rent (tot dan loopt het), zes beelden in plaats van acht voor lopen en rennen, of één hinde in twee kleuren minder.

- **Als wapens mogen, waar zit dan de spanning van de opstand?** (7 okt, zevenendertigste sessie; een idee van Claude bij
  vraag 131, voor vraag 126): sinds wapens niet meer verboden zijn, gaat het niet meer om wat je hebt, maar om wat je
  ermee doet. De heer kan er zelf om vragen: wie op de heervaart gaat, neemt zijn wapen mee (`js/heervaart.js`), of een
  gril vraagt "twintig speren voor mijn oorlog" (`js/grillen.js`). Dan kost trouw je juist wat je voor een opstand nodig
  hebt, en een heer met een ander karakter (vraag 126) kijkt er anders naar. Niet nu: eerst de kern.

- **Een erf in de hand loot de volgende hut en het volgende huis** (6 okt, zevenendertigste sessie, en 7 okt, de sessie
  van de heer; gezien bij vraag 130): wie met een erf in de hand over de kaart gaat, vraagt voor elke plek welke hut en
  welk huis erop passen (`T.waaromPastErfNiet`, `kiesTekeningen` in `js/erven.js`), en dat begint met de volgende
  tekening (`opVolgorde`, `T.volgendeTekening`), die er een loot als er nog geen gekozen is; het spookbeeld van een
  gebouw in het bouwmenu net zo (`js/tekenen.js`, `js/main.js`). Dan loopt het spel anders naar waar de muis stond. De
  keus wordt wel bewaard, dus bewaren en laden geven hetzelfde spel, en de speeltest wijst niet aan met de muis, dus die
  blijft hetzelfde. Het briefje bij een huis loot sinds vraag 130 niet meer (`kiezen` in `groeiVormen`,
  `js/behoeften.js`). Waar het looppad om het huis van een erf ligt, hangt ook van de loting af, en dus ook of een erf een
  hut tegenhoudt (vraag 130, d): gemeten op zeven landen (7 okt; het ontworpen gehucht, 62707, 73425, 72022, 5, 1 en 17,
  elke loting van hut en huis) wisselt het oordeel op 62707 op 12 van de 64 plekken die ooit om een groeiend huis
  geweigerd worden, op 72022 op 1 van de 3, en op de andere vijf nergens. Het klopt wel met het erf dat er dan komt, want
  de vraag en het aanwijzen nemen dezelfde loting; alleen kan een plek die vandaag geweigerd wordt, morgen mogen, of
  andersom. Op te lossen zoals het groeien: de vraag loot niet, en de geloote vorm zit ook tussen de andere. Voor als de
  regels in vaste tikken moeten (`spel.md`, "De heer als tegenstander").

- **Een huis dat doorgroeit, kijkt niet naar de paden** (6 okt, zevenendertigste sessie; gezien bij vraag 130): waar het
  grotere huis komt, mag niets vast staan, geen deur zijn en geen grond van een ander erf (`watStaatInDeWeg` in
  `js/behoeften.js`), maar een pad houdt het niet tegen. Op 101 landen van de maker komt bij 35 van de 202 hutten het
  grotere huis op een tegel met een pad of de rand ervan; op een akker of het plein nooit. Zo was het al vóór vraag 130.
  Of dat erg is (een weg die smaller wordt, een paadje dat onder een huis verdwijnt), zie je pas in het spel.

- **Twee soorten stronken** (6 okt, zesendertigste sessie; vraag 129): een stronk die de houthakker of een boer achterlaat
  (`T.velBoom`, `js/bos.js`), staat niet in de weg (`boomstronk` in `T.VOORWERPEN`, `js/wereld.js`), want in de speeltest
  zette de houthakker zich met zijn eigen stronken vast. Een stronk die de maker in het bos legde, heeft nog een muur
  onder zich, zoals elk vast ding uit het vel (`vast` bij `boomstronk` in `gereedschap/pixelart/naar-tiled.cjs`, en zo in
  `tegels/tegels.js`). Gelijktrekken kan door dat `vast` uit te zetten, maar dan legt de maker zijn landen anders
  (`isVastNaam` in `js/maker.js`) en tekent het spel een stronk plat in de grond (`isPlat` in `js/tekenen.js`); niet
  gedaan zolang de speeltest de landen vergelijkt. Een omgehakte stronk wordt ook nog rechtop getekend: wie erop staat,
  staat ervoor of erachter.

- **De markt op het plein, wat opviel** (6 okt, zesendertigste sessie; vraag 110, d; `js/markt.js`):
  - Met de spelregel "Wie bouwt" op "Jij bouwt" toont het bouwmenu bij de markt nog het spookbeeld van 6 bij 6, maar
    waar je ook klikt, de kramen komen op het plein. Zolang de mensen bouwen (de standaard), zie je dat niet.
  - De markt heeft nog één hand, zoals het eigen gebouw: zijn "deur" is het midden van het plein, dus daar staat overdag
    iemand die er werkt. Wat hij doet, komt met de marktdag (f, later).
  - De kramen komen er pas als het mag (een dorp) en het goud er is; op een plein waar later een eik of een lantaarn bij
    komt, zoekt hij zijn plekken op dat moment.

- **Een erf dat vrij heet, maar geen hut meer neemt** (5 okt, vijfendertigste sessie; de speeltest van vier jaar, op
  62707): een buurhuis groeide door tot stenen huis, in het looppad om de plek van de hut op een vrij erf. Daarna zet
  `T.zetHutOpErf` er niets meer op (het dorp zegt "Er wil een gezin komen, maar er is geen plaats"), maar `T.kanEenErfNemen`
  vraagt alleen of er een vrij erf is, dus zien de groei (`T.waaromGeenGezin`) en de raad plaats, en wijst niemand een
  nieuw erf aan: twee en een half jaar geen gezin. Het voorstel om het te repareren is vraag 110, f, in de werklijst.
  Ook na te lopen: of een huis dat doorgroeit, het looppad om andere gebouwen zo ook kan innemen.
- **Ontginnen in het bos, wat opviel** (5 okt, vierendertigste sessie; vraag 107, stap 2). Na te lopen:
  - Een boer die midden in een bosje hakt, zie je vaak niet: de bomen voor hem dekken hem af, want de doorkijk is voor de
    schout en wie ertoe doet (`T.zichtbaarDoor`, js/doorkijk.js; Marcel, 26 sep: niet door een boom voor iedereen). Loop
    je er met de schout heen, dan zie je hem. Misschien later: wie in het bos werkt, ook.
  - In één proef in de browser zonder vast toeval stond het hakken 55 dagen stil na vijf tegels; met vast toeval, en in
    acht proeven in Node op vijf landen en in elk seizoen, kwam elk stuk af (41 à 87 dagen). Waarom is niet nagekeken
    (het toeval was niet te herhalen). Een mogelijkheid: de boer kon niet werken, of zijn gezin trok weg. Dan doen zijn
    mensen het na de winter (`T.tikOntginnenDag`), maar zie je drie maanden een half gehakt bos. Een stuk van een boer
    die weggaat, zou ook naar een andere boer kunnen.
  - Op 72022 viel de sluwe schout in het eerste jaar: twee wilde rovers zagen hem meteen toen ze de kaart op kwamen, en
    de militie was er niet. Dat is de vraag van de militie (`0c`, punt 4), niet het bos.

- **Het praatje, wat er nog niet is** (4 okt, zevenentwintigste sessie; vraag 120). Na te lopen:
  - Lopen is langzaam tegenover de dag: van een boerderij aan de rand van het gehucht naar het plein is anderhalf uur
    (een dag duurt 300 seconden, een mens loopt 1,35 tegel per seconde). Wie 's avonds naar de herberg gaat, loopt zo de
    halve avond, en in een stad van 200 op 160 bij 160 nog meer.
  - Wie langs wil, loopt om een praatje heen; staat het op een smal pad, dan gaat er een even opzij. Zo houdt een
    praatje het verkeer niet op, maar een praatje in een deur of op een brug is nog niet te zien geweest.
  - Meet de snelheid voor en na achter elkaar: de eerste nulmeting (1,1 ms per beeld bij 200 mensen) lag een derde lager
    dan dezelfde meting een uur later (1,4 ms). Achter elkaar gemeten kostte het praatje niets meetbaars.

- **De wapenmaker en de tweede herberg, wat er nog niet is** (3 okt, vijfentwintigste sessie, bij de ondernemers van vraag
  104; die zijn op 12 okt weg, ronde 2 van het snoeien, maar de wapenmaker en een tweede herberg zet je nog zelf neer).
  Ideeën van Claude, niet gekozen:
  - De wapenmaker maakt wapens van hout en ijzer, en ijzer komt van de marskramer (of een ertsgraver). Zonder ijzer staat
    hij stil, en alleen de muis op het gebouw zegt het; de raad en het rapport zwijgen. Een regel in de raad ("De
    wapenmaker heeft geen ijzer: de marskramer verkoopt het") zou de keten laten zien zonder dat je hem bouwt.
  - Met twee herbergen weet de herbergierster alleen wie er bij háár zat. De tweede herbergier heeft nog geen gesprek; een
    eigen gesprek met zijn gasten en zijn roddel maakt van de twee herbergen twee bronnen.

- **Het eind, wat er nog niet is** (3 okt, vijfentwintigste sessie; vraag 101, 2e). Het winnen is op 11 okt weggehaald
  (snoeironde, vraag 153), en met hem wat hier stond over het grote feest en de teller. Wat blijft: het jaarverslag en het
  eindscherm van het verliezen zijn nog in de stijl van vóór de schrijftafel (vraag 98, C); ze worden papier met de rest
  van de ui.
- **De feesten, wat er nog niet is** (3 okt, vijfentwintigste sessie; vraag 97, gebouwd tijdens Marcels vlucht). Ideeën
  van Claude, niet gekozen:
  - De schout kan op het feest gaan staan, maar dat doet nog niets. Een idee: wie er de schout ziet, is er een tijd wat
    blijer om ("de schout vierde mee"), zodat het poppetje er ook hier toe doet.
  - De herbergierster tapt naast de meiboom, maar er staat geen ton of tafel. Een ton (hij staat al in
    `gereedschap/pixelart/voorwerpen.cjs`) of een lange tafel zou het feest leesbaarder maken, ook voor de trailer.
  - Het oogstfeest kan komen terwijl er nog gemaaid wordt (het vraagt alleen oogstmaand of herfstmaand en 80 graan),
    terwijl de boer zegt "De oogst is binnen". Met een hele dag vrij kost het dan een dag maaien. Na te lopen: pas na de
    laatste schoof.
  - De raadsman weegt de dag werk niet mee als hij een feest kiest: hij kijkt naar graan, bier en de stemming.
  - De bruiloft kan met één regel ook een feest worden (`feest: 'avond'` in het antwoord, en de bruiloft in
    `T.FEESTEN`); Marcel wil die "groots" (1 okt). En muziek op het feest komt met het geluid (januari, vraag 84, b).
- **Na de eerste zomer heeft niemand meer honger** (3 okt, vierentwintigste sessie; de speeltest van vraag 95). Bij de
  bouwers was er alleen honger in de eerste zomer, vóór de eerste oogst (76 à 84 dagen). In het tweede jaar geen dag,
  met brood 0,01 of 0,03: de bouwers zetten een jager neer zolang het dorp zegt dat het eten de winter niet haalt (zes per
  jaar), en de jagers en de melk houden iedereen te eten, ook als het graan op is. De druk is er wel in woorden (op 162
  à 175 dagen "het eten haalt de winter niet"), maar niet in honger. Marcel (3 okt): "er moet altijd druk zijn om
  voldoende eten. Het mag niet te makkelijk". Na te lopen: of een jager zonder grens vlees mag schieten (het wild in het
  bos zou op kunnen raken), en of dat bij de demo hoort of later.
- **De schout valt tegen één wilde rover** (2 okt, drieëntwintigste sessie; de speeltest van 2d, zaad 1). Na een roof
  zag een rover de schout, en in het gevecht deelde de rover 22 schade uit en de schout 11: op 18 bloeimaand van het tweede
  jaar was het spel uit. De raad had 20 dagen gezegd dat de rovers terugkomen en een wachthuis helpt; de bouwer van de
  speeltest bouwt er geen en loopt niet weg. Na te lopen: of één rover de schout zo makkelijk hoort te verslaan (de
  levenspunten en de schade in `T.WEZENS`), of de schout wegkan als hij ziet dat hij verliest, en of de bouwer de raad over
  de rovers volgt.
- **Een erf ver van de herberg geeft een huis dat nooit alles heeft** (1 okt, drieëntwintigste sessie; vraag 87). Een huis
  (de dorpelingen) wil de herberg binnen 30 tegels, en een herberg bouw je in een gehucht niet (hij staat in het bouwmenu
  van een dorp). Van de 704 plekken waar een erf past, liggen er 113 zo dicht bij de herberg. Een hut op een erf verder weg
  groeit door tot een huis dat de herberg altijd mist, en dan is niet iedereen super gelukkig. Wie een erf aanwijst, ziet
  dat niet. Hoort bij 2c: bij het aanwijzen van een erf zeggen in welke kringen het valt (de put, de kapel, de herberg),
  zoals de muis het nu zegt met een put in de hand.
- **De kring is groter dan het scherm** (1 okt, tweeëntwintigste sessie; vraag 85, 2a). Het beeld zoomt niet uit (de zoom
  volgt het venster en is minstens 1), en al de kring van een put (12 tegels) is breder dan het scherm, die van een kapel
  (30) veel breder. Wie een put of een kapel neerzet, ziet dus alleen de rand van de huizen in beeld oplichten, en de
  muis zegt het in woorden ("Binnen 30 tegels: 6 huizen die een kapel willen. Ze hebben er nu geen."). Hoort bij 2c en de
  pagina met ontwerpen voor de ui: uitzoomen bij het bouwen, of een kaart van je dorp op tafel (vraag 84).
- **Groente en eieren hebben geen stand** (1 okt, tweeëntwintigste sessie; vraag 85, a). De afwisseling (groente, vis of
  vlees maakt tevredener) ging op in de wensen: vlees of vis voor de dorpelingen. Groente en eieren tellen dus niet meer
  voor de tevredenheid, alleen nog bij de marskramer en de heer. Een moestuin of een kippenhok heeft zo weinig zin. Ze
  passen bij een stand (de keuters, of de boeren), of als eten.
- **Een jager schiet onbeperkt** (1 okt, eenentwintigste sessie; de speeltest met de jager, `speelbaar.md`). Elke jager
  schiet elke dag 1 vlees, genoeg voor twintig mensen, en het wild raakt nooit op: twaalf jagers voedden een dorp van
  104 zonder één dode. Wild zou op kunnen raken (het bos is van de heer: stropen is ook een keuze), zodat eten weer een
  afweging wordt. Hoort bij het bijstellen, na de wensen.
- **Nazaaien gaat vóór het eten** (1 okt, eenentwintigste sessie; vraag 79 en 81). Wat er in de lente aan graan
  binnenkomt (van de marskramer, uit een kelder), zaaien de boeren meteen na, zolang er kale akkers zijn, nog vóór het dorp
  eet. In de winter is het andersom: het zaaigraan eet het dorp bij nood, "anders sterven er mensen" (Marcel). Is een
  dorp in grasmaand aan het verhongeren, dan gaat graan dat binnenkomt dus eerst de grond in. Wie het als zaaigraan kocht,
  wil dat; wie het als eten haalde, niet. Een mogelijkheid: nazaaien laat een paar dagen eten liggen. Voor Marcel.
- **De heer als eerste tegenstander** (1 okt, eenentwintigste sessie; een idee van Claude; sinds 6 okt gekozen, groter:
  de heer is het eind van het spel, werklijst vraag 126, en `spel.md`, "De heer als tegenstander"). Met de
  verovering van de wereld als einddoel (werklijst vraag 78, B) wordt de heer vanzelf de eerste die je verslaat: eerst
  betaal je hem, omdat je zwak bent, en als je sterk genoeg bent, sla je hem (de opstand uit het eerste plan, "Het
  spel in het kort"). Dan is wat je voor hem verstopte, de kas van je opstand. Voor als het land en het vechten
  tussen dorpen er zijn.
- **Je eigen mensen horen iets op straat** (Marcel, 1 okt, bij vraag 75, c: "Later ook door je eigen mensen die iets
  horen op straat"). Naast de herberg en het rapport: mensen die voor jou luisteren, en je vertellen wat er speelt
  voordat het een voorval wordt. Past bij "informatie is een grondstof" (`concept.md`): wie meer oren heeft, weet meer.
  Voor na stap 3 van de kern.
- **Een dorp van meer dan zo'n 150 mensen hapert op 30×, door het zoeken van paden** (30 sep, negentiende sessie; de
  meting bij vraag 74). In de ochtend- en avondspits zoekt iedereen tegelijk een pad (`T.dwaal` in `js/verkennen.js` →
  `T.zoekPad` in `js/pad.js`), en voor elke tegel die A* bekijkt, loopt `T.wezenOp` (`js/wereld.js`) alle wezens af. Wat
  helpt, van meeste naar minste: wie waar staat per tegel bijhouden (zoals `T.voorwerpOp` sinds stuk 2); de vaste wegen
  (huis, werk, put, herberg) onthouden in plaats van elke dag opnieuw zoeken; A* met een heap en getallen als sleutel (af,
  2 okt: dezelfde paden, letter voor letter); een zoektocht die niet slaagt, niet de hele kaart laten afzoeken (af, 2 okt:
  de eilanden, en wie twee keer geen weg vindt, wacht een uur; vraag 88). Marcel
  (2 okt, vraag 88): "Zoizo bezette tegels zijn uit te sluiten toch? Bomen, versiering etc", en vier technieken om naar
  te kijken: **flow fields** (één zoektocht terug vanaf een doel over de hele kaart, en iedereen volgt de pijl op zijn
  tegel: voor wat veel mensen delen, de put, de kerk, de herberg, de markt, het plein, en soldaten naar de poort),
  **time-slicing** (de zoektochten over een paar beelden spreiden: tegen de spits 's ochtends en 's avonds), **HPA\***
  (eerst een pad over grote stukken, zoals de wijken, dan een klein stuk A*) en **group steering** (alleen de leider
  zoekt een pad, de rest volgt hem: de militie met de schout, de soldaten van de heer, de rovers). Wat Claude erin ziet,
  staat bij vraag 88. Op 4 okt gaf Marcel de uitgebreide lijst (vraag 119), die begint met de vraag of duizend mensen
  naar verschillende doelen gaan (dan duizend zoektochten, verdeeld over de beelden, met HPA\*) of naar hetzelfde (dan
  één): flow fields of Dijkstra-kaarten (één
  berekening voor duizend mensen naar hetzelfde doel), time-slicing (15 à 20 zoektochten per beeld, een kleine
  vertraging voor wie vertrekt), hiërarchisch A* (eerst tussen kamers of stukken van 10 bij 10, dan lokaal; ook in meer
  lagen: blokken, dorpen, steden, landen), sturen en elkaar ontwijken (A* alleen voor een grove route over wat
  vaststaat, en ORCA of RVO om elkaar niet te raken: "Do not bake obstacle/agent-to-agent collision into the core A*
  calculation"), Jump Point Search (over open stukken springen in plaats van elke buur te bekijken), tegels samenvoegen
  (2×2, 4×4), en vooraf berekende snelwegen (contraction hierarchies). En de kaart hoeft niet in een bewaard spel (55 bytes per
  tegel; bij 256 bij 256 al 3,6 MB): die komt uit het zaad of uit het bestand. Pas nodig als het dorp een stad wordt.
  **Uiteindelijk wordt het een stad van mogelijk 5000 of meer mensen** (Marcel, 1 okt; vraag 77). Dat haal je niet met
  alleen snellere paden (bij 1.600 mensen kost een beeld nu 15 seconden): dan loopt niet iedereen altijd zijn eigen
  pad. Voorstel van Claude, voor stap 6 van de slice: wie in de buurt van de schout is, loopt als poppetje; de rest van
  de stad telt per wijk (wie er woont, werkt, eet en ziek is), en wordt een poppetje als je er komt. Dat past bij het
  concept ("jij bent maar één persoon": wat je niet ziet, hoor je), en bij hoe een dorp waar je niet bent nu al leeft
  zonder getekend te worden (vraag 71). Een spel van die maat bewaart ook niet meer in de browser (5 MB is vol bij zo'n
  600 mensen), maar in een bestand (Steam, `verpakken.md`). Marcel (1 okt, werklijst vraag 78, E): "we moeten een
  manier zoeken zodat we toch 5k man kunnen hebben", en hij wees op het vaste pad buiten zicht. Het plan, in drie
  lagen (in beeld een eigen pad, buiten beeld een vast pad, heel veel als getal per huis): vraag 79, D.
- **Het sprokkelen zie je niet** (30 sep, negentiende sessie; vraag 74, stap 2). Het hout komt elke dag in de voorraad
  (`T.sprokkelHout`), maar niemand loopt naar de bosrand en terug met een bos takken. Het concept wil dat je de stad
  ziet voordat je de getallen ziet: wie niets te doen heeft (de ouderen, de kinderen), zou 's middags kunnen sprokkelen,
  met het hout naar wie er echt ging (zoals het werk in uren, `T.werkUrenVan`). Past bij de dag in fasen (vraag 74, A).
- **Een boer kiest nog zonder karakter** (30 sep, vraag 74, stap 2). Elke boer kiest zijn velden met dezelfde verstandige
  regel (`T.boerenKiezenVelden`). Het plan was dat een boer met een slecht karakter fouten maakt, die je merkt als je
  gaat kijken (vraag 74, C): de drinker laat zijn akker niet rusten, de gierige legt de mest op zijn eigen veld.
- **Het overzicht als een papier: een kaart van je dorp op tafel** (30 sep, negentiende sessie, bij vraag 74, d; een
  idee van Claude, niet gekozen). Wordt het dorp groot, dan kan het overzicht een papier worden in plaats van een camera
  van bovenaf: een kaart van je dorp op tafel in je huis, waarop je bouwt en plant, en die laat zien wat je weet (wat jij
  of je raadsman het laatst zag), niet wat er nu is. Zo blijft het poppetje de manier waarop je bestuurt (`concept.md`),
  en hoef je niet voor elke bouwplaats te lopen.
- **Het slachtvenster wacht op het scherm, en geen toets kijkt dat na** (30 sep, negentiende sessie; vraag 71). Sinds
  één dorp één ding is, vraagt de regel (`T.tikVeeDag`, `js/vee.js`) elke dag van slachtmaand het venster aan het
  scherm, met het dorp, en beslist het scherm (`T.ui.openSlachten`, `js/hud.js`) of het opent: niet midden in een
  gesprek of een ander venster, want dat is de modus van het spel en niet van het dorp. Een toets laadt `js/hud.js` niet,
  dus alleen de speeltest dekt die controle nog; `test/hooi.test.cjs` doet hem na. Een regel zonder scherm voor "mag er
  nu een venster open" zou dat oplossen, als er meer vensters komen die een dorp zelf opent.
- **De speeltest haakt in op functies van het spel** (30 sep, negentiende sessie). `gereedschap/speeltest/speler.js`
  wikkelt een paar regels in (`T.werdGezien`, `T.betaalHeer`, `T.wijzigBevolking`, ...) om bij te houden wat er
  gebeurde. Kreeg zo'n regel andere argumenten (bij één dorp als één ding: `T.werdGezien(S, D, ...)`), dan faalde de haak
  stil: het spel speelde goed, maar de speeltest miste de getuigen. De fout staat wel in `luisterFouten` en in de
  samenvatting, maar niet in de regel per jaar ("0 fouten"). Voortaan: bij een andere vorm van zo'n regel ook de haak
  nalopen, of de regel per jaar laat ook de luisterfouten tellen.

- **De herberg van de maker staat altijd links van het plein** (30 sep, achttiende sessie; de schets van de maker, vraag
  70). Elke huistekening heeft haar deur aan een vaste kant (zuid, oost of west; nooit noord), en de maker zet een huis
  met zijn deur naar het plein. De herberg heeft haar deur in het oosten, dus staat ze in elk gemaakt gehucht in het
  westen van het plein, en de huizen met een deur in het zuiden staan erachter. Meer afwisseling: de huizenbouwer
  (`gereedschap/pixelart/huis-sdf.cjs`) maakt elk huis ook gespiegeld, met de deur aan de andere kant, en de maker mag
  kiezen. Niet nu (eerst speelbaar), maar wel vóór er vijf dorpen van de maker naast elkaar liggen.
- **Het getal zakt onder wie niet kan sterven** (30 sep, de speeltest van de bouwer met een raadsman; hoort bij vraag
  59). Wie sterft of wegtrekt, is nooit de schout, zijn gezin of een boer met een naam (`wieGaat` in `js/bewoners.js`:
  "die horen bij het verhaal"), en ook de herbergierster niet. Is er niemand anders meer, dan zakt alleen het getal: in
  een verse proef zakt het met 100 naar 0 in de balk, terwijl er elf mensen blijven rondlopen (vijf boeren, de schout
  met vier in zijn gezin, de herbergierster). In de speeltest stond er op 1 grasmaand 1325 0 in de balk, en zochten Trijn,
  Klaas en Aaltje de schout nog met een voorval. Een leeg dorp eindigt ook niet, terwijl `spel.md` "een leeg dorp" noemt
  als een manier van verliezen. Mogelijk: het getal zakt niet onder wie er niet kan sterven (het gehucht houdt een kern);
  of wie een naam heeft, gaat als laatste, en een leeg dorp is het eind. Dat is aan Marcel, met vraag 59.
- **De balk loopt vol** (30 sep, bij de knop Raadsman): op een scherm van 1280 breed gaan Spelregels en Menu nu naar
  een tweede regel, rechts onder de voorraad. Dat mag (stijl.css), maar het wordt druk. Mogelijk: alleen de toets
  en een teken, met de naam bij de muis; of Spelregels in het menu (Esc).
- **Wie je verbant, kan een dorp laten verhongeren** (29 sep, zeventiende sessie; de voorvallen, vraag 65). In de eerste
  speeltest met voorvallen (braaf, zaad 1) koos de speler steeds het eerste antwoord, en bij een diefstal is dat "Verban
  hem". Harm ging het bos in, kwam terug als rover (zo werken de rovers sinds vraag 55), vertrapte de akker van Gerrit en
  nam om de twintig dagen graan mee; de speler liep hem nooit achterna. Met een groot oogstfeest en een bruiloft erbij
  lag er op 1 wintermaand 28 graan, en het dorp ging van 37 naar 16 mensen. Zonder voorvallen: 489 graan op 1
  herfstmaand, en 37 mensen. Het werkt zoals bedoeld ("wie je veroordeelde, vergeet het niet"), en het venster zegt nu
  "Harm moet het bos in"; de spelers in de speeltest kiezen sindsdien verstandig (niemand het bos in, geen graan of hout
  dat de winter nodig heeft). Om over na te denken: is één verbannen dief die een akker vertrapt niet te veel? Een
  bende van één rover kan klein blijven (hij rooft, maar vertrapt niets), of een verbannen man gaat soms naar de stad.
- **Spelen op de telefoon** (Marcel vroeg het, 29 sep: "Kan ik dit spelen op mn telefoon?"; nagekeken met een
  nagebootste iPhone, rechtop en dwars). Het spel laadt en slaat op, zonder fouten, en rechtop loopt de schout waar je
  tikt. Maar speelbaar is het niet: de vakken linksboven en de uitleg rechts dekken het halve scherm, de balk loopt
  van het scherm af (Bouwen, Wetten en Menu zie je niet), dwars viel de tik op de uitleg, en wat nu aan een muis hangt
  (de tekst bij de muis, rechtsklik om een gebouw weg te leggen, zoomen met het wiel) heeft geen vinger-variant. En er
  is nog geen adres om het op een telefoon te openen. Het doel is Steam, dus een computer; een telefoon is later.
- **Wat een speeljaar op 29 sep liet zien** (zestiende sessie; braaf, zaad 1, op `6750a21`; werklijst vraag 58):
  - **Het tweede jaar begint armer dan het eerste.** Op 1 lentemaand 1324 lag er geen graan: de heer nam er 75, de
    rovers 20, en in zomermaand vertrapten ze een akker. Er was zaaigraan voor 100 van de 179 akkertegels (op 28 sep,
    vóór de rovers, bleef bij braaf gemiddeld 4% ongezaaid), en het dorp was 47% tevreden. Een proef van twee jaar
    loopt daar recht in; de speeltest met de bouwer (vraag 58, A) laat zien of een goede speler het ook raakt.
  - ~~**Waarom er geen gezin komt, zegt het spel alleen bij "geen plaats".**~~ De raad onder het doel zegt het nu
    (29 sep, `js/raad.js`).
  - **De heer "leent" zaaigraan, tegen rente** (29 sep, bij de bouwer; een idee voor de eisen van de heer, werklijst
    vraag 79, B): wie geen zaaigraan heeft, kan het van hem lenen, en betaalt het op Sint-Maarten dubbel terug. Het
    zaaigraan zelf is sinds 1 okt opgelost: de marskramer verkoopt het in de lente, en de boeren zaaien na.
  - **Een regel die blijft staan, lokt een speler die hem volgt tot te veel.** Een bouwer die deed wat de raad zei,
    bouwde om de tien dagen een jager, want "het eten haalt de winter niet" bleef staan: negen in louwmaand. Daarom
    zegt de raad nu hoe ver het komt ("26 van de 90 dagen"). Een mens rekent dan zelf; een speler in code nog niet.
  - **Huizen groeien vanzelf door** (hut, huis, stenen huis), en daarmee groeit het dorp ook zonder erven: de
    bouwer had 74 mensen in wintermaand, met vijf erven.
- **Elke speeldag hapert het spel even** (gemeten 29 sep, zeventiende sessie, werklijst vraag 63): de dagtik kost zo'n
  44 ms, en op 30× komt er elke tien seconden een. Bijna alles zit in `T.voorwerpOp` (`js/wereld.js`), dat voor één
  tegel alle honderden voorwerpen afloopt (bomen, huizen, hekjes), en dat een miljoen keer per dag, omdat elke bewoner
  elke dag een plek zoekt (`plekOpHetPlein`, via `T.isBegaanbaar`). Een lijst van wat waar staat, of de vrije plekken
  één keer per dag zoeken, maakt het vele malen sneller. Nodig voor het land met tegenspelers (een dagtik per dorp),
  en het helpt het spel van nu.
- **Wat opviel bij de heervaart** (29 sep, zeventiende sessie; `js/heervaart.js`, werklijst vraag 60):
  - **Wie er gaat, kiest het spel.** Zelf kiezen (een wachter sturen, zodat hij harder terugkomt, of juist houden) is
    een echte keuze, maar vraagt een lijst in de brief. Later, als spelen laat zien dat het ertoe doet.
  - **Het gehucht heeft 2 tot 5 weerbare mannen** (de boeren, de schout en zijn gezin gaan nooit), naar het lot van
    de boeren. In een dorp komen er met elk nieuw gezin een bij. Zijn er minder dan de heer vraagt, dan gaat wie er is,
    en de heer merkt het niet.
  - **Een veteraan ziet eruit als ieder ander**, net als een wachter: alleen in een gevecht zie je dat hij meevecht. Een
    eigen teken (een helm, een speer) zou helpen, zoals vraag 13 voor de schout.
  - **Een kleine tekst staat op zes plekken.** "Jan, Piet en Klaas" (`opsomming`) staat in zes bestanden, en het
    ontsnappen van een naam voor html (`veilig`) in vier. De telwoorden werden er vandaag één (`T.telwoord`); de rest
    kan mee als die bestanden toch open moeten (vraag 25).
- **Wat opviel bij de rovers en de militie** (29 sep, vijftiende sessie; `js/rovers.js`, werklijst vraag 55):
  - **Een rover lijkt op een boer.** Hij draagt het vel van een boer of boerin (met strohoed); alleen zijn levensbalk
    zegt dat hij een vijand is. Een eigen, donkerder vel zou helpen, of een doek voor zijn gezicht.
  - **De volgorde in een gevecht valt over de voorraadbalk** (bovenin het midden). Was al zo, maar met de militie is
    de rij langer.
  - **Rovers vallen geen dorpelingen aan**, alleen de schout en de wachters, en een boer op zijn akker loopt niet
    weg. Ze nemen alleen graan mee ("graan etc": vee of goud kan later).
  - **Wie in het wachthuis werkt, kiest het spel** (`T.wijsWerkToe`): dat kunnen ook vrouwen zijn, zoals Fenna en
    Ida in de proef. Geen probleem voor het spel, maar een keuze wie er wacht, kan later.
  - **Een gevecht dat verloren lijkt**, kun je niet opgeven of ontvluchten, behalve door een deur dicht te gooien
    (binnen). Buiten ben je ze pas kwijt als niemand je nog ziet.
  - **Ze roven uit de schuur, niet van de akker.** De akker is waar ze heen lopen en wat ze vertrappen; het graan
    komt uit de voorraad. In zomermaand staan ze dan op een akker vol graan en gaan ze "met lege handen" weg als de
    schuur leeg is (de speeltest, 27 zomermaand). **Zo blijft het** (Marcel, 29 sep: "graan uit de schuur is
    goed").
  - **In een gevecht zoek je jezelf.** De schout draagt het vel van een gewone dorpeling, de wachters dat van een
    boer of boerin, en de rovers ook; alleen de rovers hebben een levensbalk. Vraag 13 (een eigen figuur voor de
    schout) weegt daardoor zwaarder.
- **Wat opviel bij de wetten** (29 sep, vijftiende sessie; `js/wetten.js`, werklijst vraag 54):
  - **Op de eerste dag staat de tevredenheid op 100%,** tot na de eerste nacht (`T.nieuweBehoeften` begint op 1, en
    pas de dagelijkse tik rekent hem uit). Het menu Wetten zegt dan "Het dorp is nu 100% tevreden"; neem je een wet
    aan, dan springt hij naar wat hij echt is (zo'n 67%, min de wet). Was al zo; de eerste dag meteen uitrekenen
    lost het op.
  - **Wetten op een groeidag wisselen.** De tevredenheid heeft geen traagheid: wie weet dat er om de 20 dagen een
    gezin kan komen, zet het rantsoen die dag op ruim en daarna weer op krap. Marcel: niet te ingewikkeld, dus nu
    niets tegen gedaan; als spelen laat zien dat het gebeurt, kan de wet een paar dagen nodig hebben om te gelden.
  - **Hout is nog niet schaars** (één houthakker hakt ruim 600 per jaar), dus de houtkap telt pas als het dorp
    groeit (hutten, en in stap 4 een palissade van 40 hout). Stellen we bij na de speeltest van twee jaar.
- **Wat opviel bij het dorp dat zelf bouwt** (28 sep, veertiende sessie; `js/erven.js`, werklijst vraag 52):
  - **Een erf achter een huis zie je slecht.** Het eerste vrije erf bij het plein (28, 17) ligt achter twee grote
    huizen: vanuit de camera zie je er niets van, en de paaltjes ook niet. Met het bouwmenu open staat de rand op
    de grond, maar een huis dekt die af. Open grond ligt vooral ten zuidoosten van het plein (48, 50).
  - **Een gezin wordt verdeeld over huizen met één plaats.** Is er in drie huizen elk één plaats, dan komt een
    gezin van vier als drie losse mensen en één; zo ging het al vóór de erven (`komenErBij` in `js/bewoners.js`).
    Met erven kan een gezin beter samen een erf nemen dan uiteenvallen.
  - **Een hut die later een stenen huis wordt** (in de stad), kent nog geen tekening die in zijn erf past; alleen
    de stap van hut naar huis ligt vast. Voor de stad.
  - **Of een erf bereikbaar is,** kijkt niemand na: een erf dat door water of bomen is ingesloten, kan nu. Het
    gehucht heeft zulke plekken nauwelijks.
- **Wat de speeltest van 28 sep in de regels vond** (twaalfde sessie; vraag 45; `speelbaar.md`, "De speeltest
  van 28 sep"). Niets hiervan is veranderd: Marcel koos "niets bijstellen tijdens de test" (D).
  - **Wie de heer op de weg betaalt, krijgt geen soldaten.** De soldaten gaan pas zoeken, en de heer kijkt pas
    rond, als hij op het plein staat (`T.heerStaatErOp`, `js/heer.js`). Betalen kan al zodra hij over de weg
    komt (`T.heerWacht`), en wie dat doet, is hem kwijt voor er iets gebeurt. Voorstel: pas betalen als hij
    op het plein staat ("Eerst wil ik zien wat ik kom halen"), of de soldaten zoeken ook als hij al betaald
    is. De spelers van de speeltest wachten op "De heer staat op het plein".
  - **Vanaf middernacht van zijn dag is de inner "in het dorp".** Zijn bezoek begint om middernacht, maar hij
    loopt pas om negen uur binnen; daartussen zet je niets weg ("De inner is in het dorp. Wie nu graan
    versjouwt, valt op."). Bij de heer net zo. Wie de laatste nacht wil gebruiken, merkt het pas als het te
    laat is. Voorstel: `wieIsEr` (`js/verstoppen.js`) kijkt of zijn poppetje er is, niet of zijn bezoek begon.
  - **De schout blijft staan als er iemand op de volgende tegel staat, en de klik is weg** (`beweeg`,
    `js/anim.js`). Met 37 mensen gebeurt dat vaak: je klikt op een kelder, hij loopt een eind, en het venster
    gaat niet open. De speler in de speeltest klikt dan opnieuw; een mens denkt dat de klik niet werkte.
    Voorstel: een eind verder opnieuw een pad zoeken, of even wachten tot de tegel vrij is.
  - **Of een koe ligt of graast, gaat op de klok van het scherm** (`T.rustVanDier(m, S.tijd)`,
    `js/verkennen.js`), niet op die van de wereld. Op 30× wisselt een koe dus dertig keer minder vaak per dag.
    Klein, maar het is de enige regel die zo telt; de speeltest moest er de klok voor op nul zetten om
    hetzelfde jaar twee keer gelijk te spelen.
  - **De inner is uit te schakelen** (het grootste; werklijst, vraag 46, A). Wie hem bij de weg opwacht, drie uur
    met hem praat en daarna met hem heen en weer loopt waar hij niets nieuws ziet, houdt hem tot zonsondergang
    bezig: in alle drie de jaren van de slimme speler zag hij geen gebouw en geen akkertegel, en vroeg de heer
    28 graan en 2 goud in plaats van 88 graan en 25 goud. Hij volgt wie naast hem loopt zolang die loopt
    (`T.werkInnerBij`, `js/inner.js`); alleen stilstaan maakt hem ongeduldig.
  - **De argwaan stijgt bijna nooit** (vraag 46, C). In twaalf jaren bleef hij 0 tot 4%, ook bij wie 250 graan
    wegzette of de inner niets liet zien: hij groeit pas onder 60% van het graan dat de velden beloven die hij
    zag, en wie hem geen veld laat zien, belooft niets. De heer kiest dus nooit zelf waar de soldaten zoeken,
    en kijkt op het plein niet rond (dat doet hij pas met argwaan).
  - **Het goud van de heer haalt het gehucht niet** (vraag 46, D). Hij vraagt 25 goud, het gehucht heeft er na
    de houthakker 16. Ook wie alles geeft, krijgt elk jaar een boete.
  - **De winterberichten rekenen niet met wat verstopt ligt.** Op 1 slachtmaand zei het dorp bij de luie spelers
    "Het hout en het eten halen de winter", en in louwmaand stierven ze van de honger: de heer nam zijn deel,
    zijn soldaten aten mee, en 240 graan lag in de kelders. Het bericht in de winter kan zeggen "en in de
    kelders ligt nog 240 graan" (hoort bij de eerste regel onder "De winter zien aankomen" hieronder).

- **De winter zien aankomen, wat nog ruw is** (28 sep, elfde sessie, na punt 1 van de prioriteit; `spel.md`,
  "Het dorp: mensen, behoeften en de winter"):
  - Het bericht vooraf rekent met wat er ligt en wat er de laatste dag bijkwam, niet met wat de heer op
    Sint-Maarten neemt: 15% van het graan dat de inner telde, en 20 hout voor elke houthakker ("hout voor
    zijn bos"). Op 1 slachtmaand weet je dat al, want zijn brief kwam op 1 wijnmaand. Voorstel: dan zegt
    het bericht het erbij ("en 13 dagen als de heer krijgt wat hij vraagt"), en het venster van de heer
    zegt naast het graan tot de oogst ook het hout voor de winter.
  - Het ziet ook niet dat het dorp nog groeit. In een jaar in een script zei 1 herfstmaand "33 van de 90
    dagen" en 1 slachtmaand "26", omdat er gezinnen bijkwamen; het bericht in de winter zelf vangt dat op.
  - Twee winters: het vee eet hooi van slachtmaand tot en met lentemaand (150 dagen), het dorp stookt van
    wintermaand tot en met sprokkelmaand (90 dagen). Allebei zeggen ze "de winter duurt nog", dus in
    louwmaand zegt het hooi "nog 68 dagen" en het hout "nog 38". Voorstel: het hooi zegt "en het vee eet
    nog 68 dagen hooi". Zo was het al vóór 28 sep, maar nu staan ze naast elkaar.
  - Vlees zonder zout telt voor de winter als eten, maar bederft binnen een paar weken; het venster van de
    heer telt het net zo.
  - Een houthakker in aanbouw telt nog niet mee: pas als hij een dag gehakt heeft.
  - Een bericht blijft staan tot er vijf nieuwere zijn. Komen er veel tegelijk (nieuwe gezinnen, de
    inner), dan is de waarschuwing snel weg, en er is geen logboek om hem terug te lezen. Het rode hout in
    de balk blijft wel.

- **De inner afleiden en omkopen, wat nog ruw is** (27 sep, na stuk 2 van punt 4; `spel.md`, "Rijk
  worden en arm lijken: de inner"):
  - Wie niets doet, betaalt nu meer: tot zonsondergang ziet de inner het hele gehucht (11 van de 11
    gebouwen), met zijn oude geduld van 90 stappen zo'n 7. Het tweede proefje moet zeggen of dat goed
    is; met "weg voor donker" in de werkbank gaat hij eerder.
  - Praten loopt op de klok van het spel, dus wie langzaam leest, houdt hem langer op, en op 10× gaan
    drie uur praten in een paar tellen. De drie uur per bezoek houdt het binnen de perken.
  - Hij vergeet hele gebouwen: wat hij het laatst zag. Is dat de schaapskooi (20 wol per jaar), dan is
    een klein geschenk ineens veel waard.
  - Of de heer het hoort, is nu een lot van een op de vijf. Het kan ook via de getuigen (punt 3): wie
    de schout de inner goud ziet geven, vertelt het in de herberg.
  - Nagelopen en opgelost: stond de schout stil op het plein, dan bleef de inner naast hem staan tot zijn
    geduld op was, en zag hij in een op de drie spellen maar 5 gebouwen. Nu wacht hij een half uur.

- **De soldaten, wat nog ruw is** (27 sep, na stuk 1 van punt 4; `spel.md`, "De soldaten zoeken altijd"):
  - Staat de schout ver van het plein, dan lopen ze eerst een uur of twee naar hem toe. Het wachten telt
    pas vanaf dat ze bij hem zijn.
  - De kelder van de vrome is een plek waar nooit iets ligt: wie de soldaten erlangs leidt, is een
    zoektocht kwijt zonder risico. Dat mag (het is slim), maar het wordt misschien te makkelijk.
  - Ze staan naast de schout, en lopen elkaar soms in de weg als ze tegelijk naar dezelfde tegel willen.
  - `Spel.debug.heer()` laat de heer komen zonder de kalender te verzetten: het bericht zegt Sint-Maarten,
    de balk nog de dag van nu.

- **De speeltest van een jaar, wat opviel** (27 sep, tiende sessie; alles in `speelbaar.md`, "De
  speeltest van 27 sep"). Een agent speelde drie jaren zonder iets te doen behalve verstoppen:
  - De winter kost bijna de helft van het dorp aan kou (het hout is eind wintermaand op). Sinds 28 sep
    zie je het aankomen, en zegt het bericht waaraan iemand stierf; of de speler er dan ook iets aan doet,
    zegt de volgende speeltest.
  - Verstoppen is zonder risico zolang de inner meer dan 60% ziet: dan zoeken de soldaten niet. (Dat
    liep op `main`; sinds stuk 1 van punt 4, van de negende sessie, zoeken ze altijd op twee of drie
    plekken.)
  - De heer vraagt goud per ziel en per gebouw dat de inner zag; wat hij ziet, hangt af van zijn route
    (15 tegen 22 goud), en dat kan meer zijn dan het hele dorp heeft.
  - Drie maanden zonder eten in het voorjaar kosten niemand het leven, en de tevredenheid blijft 55%.
  - Een kelder houdt 40 graan: in het gehucht past hooguit de helft van de oogst.
  - De eerste seconden, vóór de tekeningen geladen zijn, tekent het spel blokken; in de winter ziet het
    gehucht eruit als in de zomer, alleen donkerder.

- **Het zichtveld, wat nog ruw is** (27 sep, na stuk 1 van punt 3; `spel.md`, "Zo werkt het nu: het
  zichtveld, stuk 1"):
  - De gloed van een lantaarn wordt over alles heen getekend, ook over wat ervóór staat: staat er een
    huis tussen de camera en de lantaarn, dan lijkt zijn dak verlicht. Daarom kwam er geen tweede
    lantaarn bij de bank (achter de hut aan de zuidoosthoek). Netjes zou het licht op de grond liggen,
    onder wat ervoor staat, zoals nu de ramen van de herberg.
  - Iedereen kijkt rondom, niet de kant op die hij loopt, en wie in de herberg zit, kijkt niet naar
    buiten. Wie je in het donker van dichtbij ziet, ziet je ook als hij met zijn rug naar je toe staat.
  - Een oogje staat vijf seconden. Op een smal scherm staat het venster van de plek nog midden in beeld,
    over de schout heen, en dan zie je het oogje pas als je het sluit.
  - Het gezin van de schout staat 's avonds vaak bij zijn deur, in het licht van de lantaarn bij de
    put: het telt niet (het is hun kelder). Of een huisgenoot het ooit doorvertelt: nee, het gezin
    zwijgt (Marcel, 27 sep; `spel.md`, bij stuk 2 van het zichtveld).
  - Na stuk 2 (27 sep): alleen de roddelaar vertelt door, en die zit in zo'n zes van de tien spellen
    onder de vijf boeren (de karakters worden geloot). In de andere spellen vertelt niemand iets, tot de
    inner gaat vragen (punt 4). Is dat te stil, dan kan ook de drinker na een paar kannen zijn mond
    voorbijpraten: een keuze voor later.
  - Een getuige vertelt alleen wat er nog ligt. Haalde je het vóór die avond weg, dan vertelt hij niets,
    en ook later niet meer.
  - Zat de verteller alleen aan de tap, dan zegt de herbergierster zijn naam twee keer: "Aan de tap
    gisteravond: Trijn. En Trijn wist te vertellen ...".

- **De herberg, wat nog ruw is** (27 sep, na stuk 1; `spel.md`, "Zaken waar de mensen zelf heen gaan"):
  - Er hangt nog geen uithangbord: je herkent de herberg aan de lantaarn en het bankje bij de deur, en
    aan zijn zolder met dakkapellen. Een bord is tekenwerk voor de huizenbouwer.
  - Wie er in het dorp een bouwt, krijgt de oude tekening van steen onder pannen. Een herberg per trede
    hoort bij punt 5 (bouwen), net als de huizen.
  - In het voorjaar kan het graan op raken, en dan staat de herberg droog: de herbergierster brouwt
    alleen van wat er na het eten over is. Het dorp mist dan bier, en tot de oogst is er niemand.
  - De drinker gaat elke avond, ook van ver: van de verste boerderij loopt hij ruim twee uur heen en
    is hij pas om half twee thuis. Dat hij 's ochtends later begint (`spel.md`, "Het karakter zie je aan
    het ritme"), is er nog niet.
  - Bij de muis zegt de herberg na bedtijd nog "vanavond": dat is dan de avond die net voorbij is.
  - Het telt maar één herberg (de eerste). Komen er meer, dan hoort ieder naar de dichtstbijzijnde te
    gaan.
  - Na stuk 2 (27 sep): de herbergierster heeft nog geen portret. Ze noemt de gasten bij hun voornaam
    ("Gerrit, Diewer en Geesje"); wie Diewer is, zie je pas met de muis ("vrouw van Gerrit").
  - Overdag spreek je haar; 's avonds is ze binnen en kun je haar niet aanklikken. Een gesprek ín de
    herberg (binnen zijn) bestaat nog niet.
  - De inner hoort in de herberg nog niets, en de roddelaar vertelt alleen over zijn eigen kelder. Wie
    jou 's nachts ziet sjouwen en het in de herberg vertelt, hoort bij de getuigen (punt 3).
  - Na stuk 3 (27 sep): de schimmen zijn een hoofd en schouders in een donkere kleur, geen echte
    figuren; een raam krijgt er hoogstens één, en ze zitten ook achter de ramen boven. Is de herberg zelf
    doorzichtig (de schout staat erachter: het kijkgat of het raster), dan branden de ramen gewoon door
    over wat je door het gat ziet; dat komt 's avonds zelden voor. Een ruitje is een vierhoek om het
    glas heen; waar een vensterbank het glas scheef afsnijdt, blijft een hoekje donker.
  - De ramen van de andere huizen weten nu ook waar ze zitten, maar branden nog niet: dat hoort bij punt
    3 (een verlicht raam is een getuige).
  - De toetsen van de dag en de bewoners kijken nu om twee uur 's nachts of iedereen binnen is, niet
    meer om half twaalf: wie van ver in de herberg zat, is later thuis.
- **De poppetjes, wat nog ruw is** (26 sep, na stap 2; `spel.md`, "Mensen worden poppetjes"):
  - Een knaap of meid draagt het vel van een jongen of meisje, en een oude vrouw dat van de boerin
    met het karakter "de oudste". Eigen vellen (een knaap, een oude vrouw, een kind in werkkleren)
    zijn tekenwerk.
  - Iedereen werkt bij de deur van zijn werkplaats. Een eigen plek per soort werk (de houthakker bij
    de bomen, de visser aan het water, de tweede hand bij de koeien) komt later; alleen de herder
    gaat al naar de heide.
  - Een nieuw gezin doet er ruim twee uur over van de rand van de kaart naar zijn huis (zo'n 26
    tegels): tussen de stappen staat het even stil, zoals bij het dwalen, en op de smalle weg wachten
    ze op elkaar. Doelgericht lopen, zonder pauzes, zou vlotter ogen.
  - Een nieuw gezin telt in de balk vanaf middernacht mee, maar komt pas om negen uur de kaart op.
    Tot dan ziet de balk er meer dan je ziet lopen.
  - Wie sterft, is meteen weg (meestal 's nachts, binnen). Een begrafenis of een graf bij de kapel
    ontbreekt nog.
  - Een nieuw gezin heeft nog geen karakter of verhaal, zoals de boeren. Een nieuwkomer met een
    geheim zou een haak zijn voor het avontuur (idee van Claude, niet besproken).
  - De herder loopt bijna twee uur naar de heide. Dat kost nu niets, want de schaapskooi maakt niets
    per dag; gaat hij ooit per dag iets maken, dan telt die weg.
  - Een bewoner heeft nog geen gesprek (klikken doet niets), en zijn karakter speelt nog niet mee:
    alleen de boeren hebben er een. Dat komt als de getuigen komen (het zichtveld, vraag 23).
  - Kinderen tellen als hand als er geen volwassene of knaap meer vrij is, net als vroeger iedereen.
    Alleen een kleuter en de schout werken niet.
- **Een huis groeit gratis, en tot steen** (26 sep). Na 30 tevreden dagen wordt een hut een huis en
  een huis een stenen huis (`js/behoeften.js`), zonder materiaal, ook in het gehucht, terwijl het
  stenen huis bij de trede stad hoort. Het wordt een andere tekening met een andere voet (5×7, 7×5,
  6×8); past die niet, dan wacht het huis voor altijd. Een voorstel om het anders te doen staat in
  `spel.md`, "Een dorp dat leeft en groeit".
- **De huizen van ronde 4b, wat opviel** (26 sep, achtste sessie; `beeld.md`, "Ronde 4b"):
  - Een huis beslaat een rechthoek, en die zet het spel helemaal vast: ook de lege hoek van een L, en
    een hele rij langs een gevel voor één schoor. Een huis met een aanbouw en een schoor (`huis3`) is
    daardoor 10×7 voor een huis van 8×5. Een voet per tegel zou kloppen, maar dan tekent het spel
    wie in de hoek van een L staat achter het huis in plaats van ervoor; dat moet eerst.
  - Een hut die doorgroeit, wordt nog steeds een ander huis met een andere voet, en een huis in het
    gehucht wordt een stenen huis uit de oude bouwer. "Hetzelfde huis in duurder materiaal" komt bij
    punt 5 van de werklijst.
  - Onder de lage goot van een hut past geen aanbouw: de bouwer slaat hem dan over.
  - De deur van de blokhut (`boerderij5`) ligt een tegel van de muur, want de koppen van de stammen
    steken uit.

- **De dag, wat nog ruw is** (26 sep, na stap 1 van punt 3b; `spel.md`, "De dag, gebouwd"):
  - Het vee gaat liggen en staat op op de klok van het scherm (`T.rustVanDier`, `S.tijd`), niet op
    de tijd van de wereld: bij 30× ligt een koe even lang als bij 1×, dus relatief kort.
  - De brief van de heer (1 wijnmaand) en het slachtvenster (1 slachtmaand) gaan om middernacht open,
    niet 's ochtends zoals de bezoekers.
  - Het vee blijft 's nachts buiten. (Dat alleen de boeren een dagritme hadden, is sinds stuk 1 van
    de poppetjes voorbij.)
  - De nacht is een donkere laag met licht rond de schout. Echte lichten (lantaarns, vuur, een
    verlicht raam dat aan en uit gaat) horen bij punt 11; de ramen van de huizen zijn nu altijd geel,
    en dat leest 's nachts vanzelf als licht.
  - De getallen per dag zijn niet veranderd, maar alles wat loopt en maait, gebeurt nu in uren van
    de dag. Het maaien is met een simulatie van het seizoen op het oude tempo gezet (80% binnen rond
    14 oogstmaand); de rest van het jaar is nog niet op die manier nagelopen.
  - De pagina "Stand van het gehucht" zegt nog dat een dag 2,5 seconde duurt, en dat de tijd stilstaat
    bij de inner en de heer.
  - Kies je een snelheid terwijl een venster de tijd stilzet, dan onthoudt het spel die keus, maar
    blijft Pauze in de balk oplichten tot het venster dicht is (sinds A, vraag 25). Dat klopt, want de
    tijd staat stil, maar het lijkt of de knop niets doet. Misschien de gekozen knop anders laten
    oplichten zolang een venster openstaat.
- **Het nieuwe gehucht, wat nog ruw is** (26 sep, na de derde versie van de kaart). Het grootste zag
  Marcel zelf: het plein was een kleine rechthoek van zand, met de gebouwen er te dicht omheen, en de
  kaart was te strak en waterpas. Dat is sinds de vierde versie anders (werklijst, punt 1). Nog wel:
  er lopen maar drie paden (van het plein naar de akker van Wouter, naar de hut en naar de deur van
  Gerrit); de rest komt met "Straten en paden", punt 6c: ze slijten waar gelopen wordt. Wat de speler
  zelf bouwt, kan het plein afdekken; dat mag (Marcel, 26 sep: "Ik wil wel dat er huizen voor kunnen
  staan"), en het kijkvenster laat zien wat erachter valt.
- **De vierde versie van het gehucht, wat opviel** (26 sep, bij het bouwen):
  - Het nieuwe huis om het plein staat in de rekening van de heer: "2 × huis" in plaats van één, dus 2
    goud per jaar meer (`T.GEBOUWEN.huis.heer`); de hutten tellen niet. En het heeft een kelder om in
    te verstoppen, een zevende plek (een hut heeft er geen).
  - Er is vanaf het begin plaats voor 11 mensen meer (36 plaatsen, 25 mensen), dus met genoeg graan
    komt er op dag 20 al een gezin bij, en is het graan in het voorjaar wat eerder op. Zo gelaten
    (`spel.md`, bij het plein); bijstellen na spelen.
  - De vijf eiken op het plein zijn groot: ze dekken een deel van het plein af, en wie erachter speelt.
    Misschien minder of kleinere bomen. De doorkijk (26 sep, zevende sessie) laat door een boom heen
    alleen wie ertoe doet zien, niet wie er speelt: anders zaten de eiken vol gaten (`beeld.md`,
    "Doorkijk").
  - De weg houdt een tegel vóór de brug op, want zand mag niet naast water liggen (er is geen
    terreinset "zandpad over water"). Dat was in de derde versie ook zo.
  - De brug was in de derde versie te kort: drie tegels over vier tegels water, en de oevertegel die
    half in het water ligt, is vast. Je kon dus niet over de beek, en de strook erachter was niet te
    bereiken (de keuring in `wereld.html` telde 357 tegels). Nu ligt de brug over het hele water; wat
    overblijft (46 tegels), is gras achter de bomen van het bos.
  - De herder is wie het best past (Marcel, 26 sep), en loopt daardoor vaak ver: meestal tweeënhalf uur
    naar de heide, soms drie. Dan is hij om half tien 's avonds nog onderweg. Voor het spel maakt dat
    niets uit; wordt het ooit wel belangrijk, dan kan een dorpsherder bij de heide wonen (het tweede
    voorstel van Claude, niet gekozen).
  - ~~Alle huizen staan nog met hun voorkant naar het zuiden; gedraaid en gespiegeld komt met ronde
    4b.~~ Sinds ronde 4b (26 sep, achtste sessie) wijzen de deuren vier kanten op.
- **De winter is hard:** zonder hout gaat het gehucht van 25 naar 2 mensen.
  `T.BEHOEFTEN_INSTELLINGEN` samen met Marcel bijstellen als hij speelt.
- **Honger valt in het voorjaar,** vlak vóór de oogst, want het zaaigraan gaat voor. Buiten de
  winter kost het standaard geen mensen, alleen tevredenheid. Wie de heer alles geeft, heeft zo elk
  jaar een maand honger, en elk jaar iets meer. Of honger meer pijn doet, stel je in de spelregels
  in.
- **Het eerste voorjaar is krap:** het gehucht begint met 60 graan voor 25 mensen, dus half
  grasmaand is het op, ruim drie maanden vóór de oogst. Bij het eerste bezoek van de marskramer
  heb je dan ook bijna niets te verkopen (wat hout). Marcel (24 sep): "het graan passen we
  gaandeweg wel aan na spelen".
- **Zout telt voor de vis,** want de beek vriest 's winters dicht. Het vlees van de jager komt het
  hele jaar binnen; slachten in slachtmaand is voor later (`spel.md`, "Handel").
- **De bevolking is een getal, geen poppetjes.** Van de nieuwe goederen staan alleen ijzer, zout
  en gereedschap in de balk, dus steen, klei, riet, vis en de rest niet. Wat de marskramer koopt,
  zie je wel in zijn venster.
- **Wat een gebouw zegt,** lees je alleen als de muis op zijn voet staat, want het dak vangt de muis
  niet. Sinds 25 sep ook bij de huizen die al op de kaart stonden (daar verstop je iets), niet alleen
  bij gebouwen die je zelf neerzette.
- **De marskramer loopt op 1× een week** van de weg naar het plein.
- **De inner** (24 sep, `spel.md`):
  - De getallen zijn een eerste gok: 90 stappen geduld, zeven tegels zicht, en een toeslag van
    argwaan × 50%.
  - Praten met hem kost nog geen geduld.
  - Graan dat al gemaaid is, ligt in de schuur, en die telt hij helemaal. Hem langs lege velden
    leiden scheelt dus weinig graan, wel gebouwen en hoofdgeld. Het graan is voor de
    verstopplekken.
- **Naast de schandpaal.** Is de tegel vóór de schandpaal bebouwd, dan staat wie gestraft wordt op
  een tegel ernaast. Dan draagt hij geen halsijzer, en kijkt hij toch naar voren, niet per se met
  zijn rug naar de paal.
- **Zolang een boer maait,** leent hij het vel van de maaier: zijn karakter zie je dan niet.
- **De weides in beeld** (25 sep, stap 1 van `spel.md`, "Weides met koeien en schapen"):
  - Een weide is gewoon gras, net als het land eromheen: waar hij ophoudt, zie je alleen aan het
    vee. Een hek, of een eigen tekening (kortgegraasd, bloemen), is tekenwerk.
  - Het blok van Gerrit (akker7) ligt half achter de bomen aan de zuidkant: maak je het weide, dan
    staat het vee tussen de boomkruinen.
  - Een klik op een veld loopt erheen, want de velden zijn groot. Het veldenvenster opent met `V` of
    de knop Velden, niet met een klik op het veld zoals `spel.md` voorstelde.
  - Het venster van de heer rekent de kaas tegen het hele tekort, ook tegen het zaaigraan, zoals
    `T.heerVooruitzicht` het zegt. Maar kaas zaai je niet, en het dorp eet eerst graan en dan pas
    kaas. Wie in de winter zijn graan opeet, heeft in lentemaand geen zaaigraan, ook met kaas genoeg.
- **De weides, stap 2** (25 sep, `spel.md`, "Gebouwd, stap 2"):
  - Een gemaaide weide ziet eruit als een ongemaaide: je ziet het hooien alleen aan de boer met zijn
    zeis. Hooioppers op de gemaaide tegels, tot het hooi binnen is, zijn tekenwerk.
  - In hooimaand staat het vee gewoon op de weide die gemaaid wordt; de boer maait om een koe heen.
    Vroeger ging het vee eraf tot het hooi binnen was.
  - Twee velden die samen één weide zijn, hebben geen hek om zich heen: je ziet het alleen aan het
    vee dat over de strook loopt, en in het venster.
  - Vlees vult sinds 25 sep een maag (Marcel koos het); vis nog niet. Moet dat ook? Brood, eieren en groente ook niet
    (1 okt): de molen en de bakkerij maken van graan iets wat niemand eet, en kosten het dorp dus eten (werklijst vraag
    78, A, met een voorstel voor brood).
  - De heer vraagt 20 wol per schaapskooi, ook in het eerste jaar; acht schapen geven er 32. In stap
    3 vraagt hij per dier.
  - Zonder herder (een hand voor de kooi) geeft de kooi geen mest. Het veldenvenster zegt nog niet
    waarom er geen mest bijkomt.
- **De verstopplekken, deel 1** (25 sep, `spel.md`, "Gebouwd, stap 2 van de inner, deel 1"):
  - Tot zo'n 40% van de oogst verstop je zonder risico: de argwaan blijft 0, dus de soldaten zoeken
    niet, en dan maakt het niet uit welke kelder je kiest. Een vraag voor Marcel (`spel.md`, "Nog
    open na deel 1").
  - Van de tien karakters doen er vier iets voor hun kelder (roddelaar, vrome, woekeraar, oudste);
    boven het venster staat ook het karakter van de andere zes, en dat lijkt dan iets te betekenen.
  - Het gesprek van de inner noemt de kist en de marskramer ook als die opties uit staan.
  - Komt de inner onverwacht terug en ligt er ineens meer goud in de kist, dan telt de heer dat wel
    (het hoogste van zijn twee tellingen), maar de argwaan groeit er niet van, zoals bij het graan.
- **Het gevecht na de leeftijd** (25 sep, werklijst punt 7b). De schout heeft nu 20 levenspunten
  en de klappen van de monsters zijn de oude maanden gedeeld door twee. Voorlopig, tot punt 13:
  - Wat hij verliest, komt niet terug: er is nog geen genezen (vroeger maakte de fontein je jonger).
  - Vallen is het einde van het spel. Marcel koos "voorlopig"; gewond, dagen rust of gevangen
    genomen worden, beslissen we als de rovers en de wolven komen.
  - Van de monsters past alleen de wolf bij het nieuwe spel. De slijmkruiper, de skeletwacht, de
    reuzenspin en de kobold horen bij de toren en het bos van het oude spel; weg ermee, of bewaren
    tot er rovers zijn om de gevechtstoetsen op te draaien?
  - De actiebalk (actiepunten, Slaan, Einde beurt) verschijnt nu ook in het gehucht. De knop Slaan
    doet zelf niets: slaan doe je door op een monster te klikken; de knop zegt wat het kost. Hij
    draagt nog het toetsje `1` uit de tijd van de spreuken (toen legde 1 een spreuk weg), maar 1
    doet sinds 7b niets meer (26 sep). Weg ermee, of laat 1 het monster slaan dat het dichtst bij
    staat?
- **Na de oude kaart** (25 sep, werklijst punt 7c):
  - Het gehucht staat nog als proefkaart gemarkeerd (`"proef": true` in zijn betekenisbestand),
    omdat zijn weg de wereld in nergens heen leidt. Nu het de enige echte kaart is, hoort dat eraf
    zodra er een tweede kaart is (een bos, het kasteel). Tot dan telt de controle hem niet mee bij
    "wie staat er nergens".
  - De mensen van het oude dorp (de smid, de herbergierster, de molenaar, de koster, de jager, de
    wachter en de anderen) staan nog in `js/mensen.js`, zonder plek op een kaart. De controle zegt
    het in één regel ("18 van de 26 mensen staan nog nergens"). Voor als het gehucht een dorp wordt.
  - Sluipen (`S`) en de spullen die je bij je hebt, hebben in het scherm van het gehucht geen plek:
    het oude scherm linksboven staat nog in `index.html`, maar verborgen.
- **Na de namen** (26 sep, werklijst punt 7e en 7f):
  - `T.NIEUWE_HUD` staat altijd aan (`js/hud.js`). De schakelaar was er voor de kaarten van het oude
    spel, en er vragen nog acht regels in `js/main.js` en `js/hud.js` naar. Hij kan eruit.
  - Elke start zegt in de console dat de weg de wereld in (op 49, 19) geen `komt` heeft: er ligt
    geen kaart achter. Onschuldig, maar het is ruis tussen echte meldingen. Weg zodra er een kaart
    achter de weg ligt, of eerder door die melding voor 'wereld' over te slaan.
- **Een questweg kan nog "jaren" kosten** (`js/quest.js`, KOSTEN, en de toets van drie antwoorden).
  In het nieuwe spel kost niets meer jaren; misschien wordt het "tijd" of "leven". Beslissen als de
  quests van het gehucht komen.
- **Opslaan, het menu en het titelscherm, wat opviel** (28 sep, dertiende sessie; werklijst, vraag 48):
  - **De kaart van het gehucht heet een proefkaart** (`"proef": true` in `kaarten/gehucht.betekenis.json`),
    zodat de keuring zijn weg naar nergens met rust laat. Daardoor zegt `w.proef` niet of je een proefje
    speelt; dat onthoudt het spel nu zelf (`S.proefje`, bij `?kaart=`). Eigenlijk hoort de keuring de weg
    naar nergens anders toe te staan, en is het gehucht geen proefkaart.
  - **De melding over de weg naar "wereld"** komt nu bij elk nieuw spel, en dus ook bij elk laden en elke
    keer terug naar het titelscherm (hieronder, "Na de namen"): laden begint eerst een nieuw spel.
  - **Een opgeslagen spel is 380 kB, en vier vijfde daarvan is de kaart.** Zes plekken passen ruim in wat
    een browser bewaart (zo'n 5 MB). Groeit de kaart met de stad mee, dan kan de kaart eruit, en bij het
    laden uit Tiled komen; in de verpakking voor Steam, met een bestand, speelt het niet.
  - **Laden vraagt niets als het titelscherm open is**, want dan is er nog geen spel om kwijt te raken; in
    het menu wel. "Nieuw spel" vraagt het ook, als er iets vanzelf bewaard is: dat wordt overschreven.
- **`server.oud.cjs` lijkt een overblijfsel** (28 sep, dertiende sessie, bij de naam op één plek). Het kwam op
  22 sep mee in een commit die met de oude server iets nagemeten had (`e8ab95b`), en niets gebruikt het:
  `npm start` draait `server.cjs`. Het mag weg.

- **Langzamer bergop, sneller bergaf** (8 okt, bij vraag 121, stap 2, "D, wat ik niet doe"; Marcel: "Akkoord"). Met de
  hoogte zou een stap tegen een helling op meer tijd kunnen kosten, en eraf minder. Niet gebouwd, om niet te blijven
  toevoegen: lopen kent nu alleen "kan wel" of "kan niet" (een wand). Als het land groter wordt (het eiland) en een tocht
  over de bergrug ertoe doet, kan het een gewicht in A* worden (een stap omhoog kost meer), met de looptijd erbij.
- **Een toets die soms faalt** (10 okt, bij vraag 149): "een gezin wacht op de winter: haalt het hout of het eten hem
  niet, dan komt er niemand (vraag 59, B)" in `test/erven.test.cjs` faalde één keer in `npm test`, en slaagde daarna los
  drie keer en in de hele reeks nog eens. Iets in die toets hangt dus van de volgorde of de tijd af; nalopen voordat het
  een push tegenhoudt.

- **In het lege begin krijgt een deur in het bos geen paadje** (12 okt, gezien bij het verhuizen van de toetsen naar het
  proefdorp, ronde 2 van het snoeien): `magPad` in js/paden.js laat geen paadje over een tegel met een voorwerp, ook
  niet over heide of een graspol. In het ontworpen gehucht lag alles open; in het lege begin staat er overal begroeiing,
  dus een boerderij aan de bosrand blijft zonder paadje (in het proefdorp de tweede boerderij). `test/paden.test.cjs`
  ruimt de begroeiing daarom zelf op. Voor de spelregel "Paadjes", als de mensen erover lopen.

- **De aanval van een wolf deelt een object, en opslaan ziet dat** (12 okt, de proef met opslaan van de kolonist, zaad
  2): in het jaar zonder opslaan verwijst `wezens[28].aanval` naar een object dat een ander wezen ook heeft (`$r` in het
  bewaarde spel), in het jaar met opslaan en herladen is het een eigen kopie (`kosten 3, schade [2, 4], "bites {doel}"`).
  Speelt hetzelfde, maar de proef zegt "VERSCHIL op 4 plekken". Waarschijnlijk krijgt een nieuwe wolf de `aanval` uit
  `T.WEZENS` zonder kopie (js/wereld.js, `T.maakWezen`), en heeft een geladen wolf er een eigen.

## Het beeld

- **Ver uitgezoomd haalt het spel in Chromium en Edge de 60 niet, ook vlak** (17 okt, vraag 174, c; de tekenmeting met
  `--videokaart`, GTX 1080 Ti, proefdorp op eiland 5, 1920×1080): op zoom 0,5 en 0,35 zo'n 16 à 21 ms per beeld, vlak of
  met heuvels, en het meeste is rekenwerk van het spel zelf (`onthoudVoorwerp`, `mistOverLijst`, `isPlat`,
  `T.isZichtbaar`, `tekenVoorwerp`, elk 1 à 2,5 ms per beeld). Marcel mat op dezelfde pc in Firefox 11,7 ms ver
  uitgezoomd vol bos (Crowthorpe), dus wat het verschil maakt (het eiland, het dorp, de browser), is nog open. De
  metingen lopen hier sterk uiteen als er iets naast draait (een andere sessie, een spel, Firefox): vlak ver uitgezoomd
  52 ms om 20:45 en 20 ms om 21:00. Vergelijk dus om en om in één browser, niet twee losse runs. **Stand 18 okt**
  (vraag 178, A1 tot en met de regen en de mist; `snelheid.md`): in Chromium op 0,35 nu 4,4 ms per beeld met de kaart
  erbij en 1,7 voor de processor; in Firefox nog niet gemeten.
- **Op 50% en 75% kiest de kaart soms de buurtexel** (18 okt, vraag 178, B1 en B2): waar een pixel precies op de grens
  van twee texels valt, beslist de kaart op een haar, en de vaste rijen rekenen hun hoeken in de shader net anders af dan
  JavaScript. Oud tegen nieuw is daar 0,3 à 0,5% van de pixels anders (de oude weg net zo willekeurig, en per videokaart
  anders); op het oog gelijk. E4 (afronden op hele pixels, `snelheid.md`) legt het vast.
- **De textuurstapel vult zich over de seizoenen** (18 okt, vraag 178, B2): alle standen in de wind van alle bomen staan
  er meteen op, ver uitgezoomd 9 bladen van 16 MB, door de vier seizoenen heen 14, en er gaat niets meer af. Bij
  `MAX_LAGEN` (32) krijgt wat erbij komt een eigen textuur, en een boom zonder plek op de stapel gaat terug door de lijst
  (langzamer). Na een lang spel met veel soorten huizen en figuren nakijken (`Spel.gl.stapel()`); zo nodig wat een
  seizoen niet meer gebruikt eraf halen.
- **Een gebouw zoekt zijn plek in de lijst zonder de bomen van de vaste rijen** (18 okt, vraag 178, B2): `tekenVolgorde`
  zet een gebouw na wat er op zijn rijen achter staat. Eerst telden de bomen daar mee, nu niet meer (een boom die het
  gebouw raakt, blijft wel in de lijst). Iets wat buiten zijn rijen over het gebouw valt (een figuur twee rijen ernaast,
  over de rand van een dak), kan zo van volgorde wisselen. Niet gezien in de proeven.
- **De kale headless-shell van Playwright laadt het spel niet meer** (17 okt, vraag 174, c): `chromium.launch()` zonder
  meer (`chrome-headless-shell`) blijft hangen in het gewone begin (het eiland en het titelscherm): geen
  `DOMContentLoaded` na 40 s, geen enkel consolebericht, en de debugger komt er niet tussen, dus het hangt in de browser,
  niet in een lus van het spel. Met `?kaart=gehucht` laadt het in 2,7 s, en de volle Chromium in het nieuwe headless
  (`channel: 'chromium'`) in 5 s, ook zonder videokaart. Zo liep de speeltest van c2 niet. De speeltest en de tekenmeting
  met `--videokaart` nemen nu de volle; `npm run schermen`, `samenvatting`, `grootte`, de proeven en de tekenmeting
  zonder `--videokaart` (ook om en om, 18 okt) starten nog de shell. Wat precies hangt, is niet gezocht.
- **Met heuvels is het graan het duurste wat overblijft** (17 okt, vraag 174, c): op een schuine akker gaat elke tegel
  graan in stroken van 8 pixels en stukjes van 20 (`tekenGraan`, `GRAAN_STROOK`, `GRAAN_STUK`), dichtbij bij het
  proefdorp 924 plaatjes per beeld (van de 2043; vlak 913 in totaal). Bredere stroken scheelt tekenwerk, maar de halmen
  volgen de grond dan grover: dat is een keuze voor Marcel.

- **De vellen van de karakters hebben geen gebruiker meer** (12 okt, ronde 2 van het snoeien, stap 4): de karakters van
  de boeren zijn weg, dus niemand draagt nog boer-zanger, boerin-weduwe en de rest (gereedschap/pixelart/karakters.cjs,
  dorpelingen-anim.cjs, schandpaal.cjs; de nek per vel in `T.BEELDEN.schandpaal`). Ze staan nog in `beelden/`. Weg bij de
  volgende ronde van de pixel art (`npm run pixelart:spel`), of houden voor de grijze oudste (`uiterlijk.cjs` leent
  `KARAKTERS.grijsaard`).

- **Het beeld werd trager naarmate het spel liep** (17 okt, Marcel in een nieuw spel in Firefox, op 30×): op 2 maart 34
  beelden per seconde, op 14 maart 5 (tekenen 169 ms, de regels 10 ms). Twee dingen samen. (1) De opdrachten aan de
  videokaart: 60 werden er 800, opgelost met de rij die uit acht texturen tegelijk tekent (`code.md` bij `js/gl.js`;
  geteld in Chromium, nog niet nagemeten in Firefox). (2) De schermafdrukken van 15 en 5 beelden per seconde zijn van
  15:41, toen er twee keer de hele toetsreeks liep (Marcel zag node op 50 à 60%); ook in Chromium kostte een beeld toen
  75 à 90 ms en anders 30. De regels groeien niet: op 30× kost een tik van dag 2 tot dag 13 steeds 0,5 à 0,7 ms
  (het lopen 0,4), met één uitschieter per dag, de tik van middernacht (16 ms, de nacht van het wild); op de dag van
  aankomst 2,3 ms. Daarna (17 okt, twee profielen van Marcel uit de Firefox Profiler, 16:27 en 16:44): het filter in de
  mist en het opzoeken van het plaatje van elk voorwerp eruit, en een beeld ging van 30,5 naar 21,6 ms. Wat overblijft:
  (a) de meter in Firefox zonder profiler, op dezelfde plekken als ervoor; (b) wat al een tijd draait, heeft zijn
  plaatjes anders op de bladen dan een vers geladen spel, en dan verschillen er aan de rand van een plaatje een paar
  honderd pixels (een plaatje op een eigen textuur rekt zijn rand uit, op een blad ligt er een doorzichtige pixel
  naast); (c) de bladen raken nooit leeg: wat eenmaal op een blad staat, houdt zijn plek, ook als het nooit meer in
  beeld komt.

- **Het beeld is opdrachten aan de videokaart** (9 okt, gemeten op 2560×1440): ver uitgezoomd zijn het zo'n 3200
  opdrachten voor 3600 plaatjes, want bijna elk plaatje heeft een eigen vel (een vel per tekening, vraag 114) en de
  tekenlijst gaat van achter naar voor. Dat is nu de grootste post (10 à 15 ms per beeld op 0,5). De schaduwen van de zon
  gaan sinds 9 okt per vel (71 opdrachten); voor het beeld zelf kan dat niet, want daar telt de volgorde. Een uitweg:
  de vellen die samen in beeld staan, in de browser op een paar grote vellen leggen.

- **De wolven en een sprong terug in de tijd** (9 okt): `Spel.debug.uur(18)` op een later uur van dezelfde dag zet de
  klok terug, en dan kan een groep beesten weer op de vlucht zijn (`G.weg` ligt na de dag) zonder plek om heen te
  vluchten: `werkGroepBij` in `js/beesten.js` valt dan om. Alleen met het gereedschap; in een spel gaat de klok niet terug.

- **De proefversie past niet meer op itch.io** (9 okt, bij `npm run proefversie -- --windows` op 0279f91): het spel is
  1433 bestanden en 127 MB (op 29 sep 189 bestanden, 11 MB). Bijna alles is `tegels/huizen` (559) en `tegels/bouwfasen`
  (545), samen 118 MB. itch.io neemt hooguit 1000 bestanden (`verpakken.md`), dus de zip voor de browser gaat er zo niet
  op; de Windows-versie (264 MB) heeft daar geen last van. Een uitweg: de losse plaatjes per huis samen op een paar
  vellen. En het laden: een tester haalt die 118 MB de eerste keer van itch.io, niet van zijn schijf.

- **De markt in ons beeld** (6 okt, zesendertigste sessie; vraag 127): vanuit onze kijkhoek ligt een groot deel van het
  plein achter de daken van de huizen ervoor; met een harde regel (geen kraam achter een dak) bleef er op vijf van de 33
  landen geen blok over. Nu wint het blok met de meeste zichtbare tegels. Een zeil van achteren gezien leest als een
  vlaggetje. En het vel met de kramen is in de browser zo'n 24 MB (veel lege ruimte rond de korte kramen); het laadt pas
  als er een markt staat, maar inpakken zoals de figuren (`inpakken.cjs`) zou het kleiner maken. Met het draaien van de
  camera (vraag 124) valt er minder achter een dak.

- Het raster kost tijd: in de proef, in een browser zonder videokaart, duurde een beeld met één groot
  huis in het raster 15 ms tegen 12 ms met het kijkvenster. Een echte browser met videokaart doet het
  sneller, maar nameten als Marcel het raster kiest (`Spel.debug.meet()`). Wordt het te traag, dan kan
  het gerasterde huis bewaard worden zolang de camera stilstaat.
- In een kijkvenster komt iedereen terug die erin staat, ook wie zelf niet meetelt: in de proef stond
  een bewoner naast de marskramer, in diens venster. Zo is het bedoeld (je kijkt door het dak de straat
  in), maar zo zie je soms iemand die zonder venster achter het huis was verdwenen.
- Vóór het plein staat nog geen huis; de keuze "Wie je door een huis heen ziet" zie je pas als er een
  staat (wat je zelf bouwt, of de stad die om het plein groeit).

**Het huis van de heer** (24 sep, `beeld.md`):
- In één richting (ZO) zie je de korte beentjes van de heer nauwelijks onder zijn mantel.
- Het gezicht van de soldaat ligt grotendeels in de schaduw van zijn hoed. Dat is bewust grimmig,
  maar klein. Het blad van zijn hellebaard is in ZO smal.
- De pen van de inner is een wit streepje, en zijn opgetrokken wenkbrauw zie je op 1× niet.
- Het naamkaartje en de plek waar de muis iemand vangt, staan voor alle dorpelingen op 60 px (de
  tabel `HOOG` in `js/sprites.js`). Bij de soldaat zit het daardoor op zijn nek.
- Het commentaar bij `DORPSOUDSTE_FPS` in `dorpelingen.cjs` zegt nog dat iedereen met 10 beelden
  per seconde loopt, maar de heer trippelt met 20.

**De schandpaal** (24 sep, `beeld.md`):
- Het laatste stuk ketting zie je niet op het halsijzer: het valt achter hoofd en hoed.
- Het halsijzer staat stil terwijl wie eraan staat ademt, dus de band kan 1 px verschuiven.
- `T.sprites.hoofd` kent de boer en de boerin niet. De nek wordt daarom in `schandpaal.cjs` gemeten,
  en die meting slaat stukjes huid kleiner dan 12 px over.
- De gewone boer houdt aan de paal zijn hooivork vast. De karakters niet meer.

**Een gezicht per karakter** (25 sep, `beeld.md`):
- Ronde 1:
  - het rode gezicht van het heethoofd is zijn hele hoofd, en dat kan op een masker lijken;
  - van voren zie je van de luit van de zanger alleen de kop;
  - het gezicht van de woekeraar valt donker onder zijn hoedrand.
- Ronde 2:
  - van voren zie je van de bundel van de nieuwkomer alleen de banden en de knoop;
  - het grijze haar van de oude boerin leest als een lichte band onder haar donkere doek, dus het
    kromme lijf en de stok moeten het doen;
  - de kralen van de rozenkrans zie je op 1× niet, alleen de gevouwen handen en het kruisje;
  - de drinker-boerin heeft de kleuren van de gewone boerin; alleen haar buik, de kroes en een
    kleine rode neus onderscheiden haar;
  - de hand bij de mond van de roddelaar is op 1× klein;
  - de stok van de oudste zet een kortere pas dan een voet, anders stak hij in één richting
    (ZW) buiten de cel.

**De marskramer** (25 sep, `beeld.md`):
- in het gehucht komt hij altijd van de oostkant binnen, dus in het spel zie je hem alleen van
  achteren, met zijn rek. Zijn voorkant staat op de proefplaat;
- het naschommelen van zijn potten en pannen is op 1× nauwelijks te zien. Dat is rustig bedoeld,
  maar het mag misschien meer;
- zijn naamkaartje staat op 66 px, bij zijn hoofd; het rek steekt tot 72 à 83 px uit.

**Het vee** (25 sep, `beeld.md`; `vee.cjs`, `js/vee.js`):
- gaan liggen en opstaan hebben nog geen eigen beelden: een dier ligt in één beeld neer, en staat
  in één beeld weer op;
- een koe is ruim twee tegels lang maar bezet er één, en wordt getekend in de volgorde van die ene
  tegel. Staan dieren dicht op elkaar of tegen een huis, dan kan de een verkeerd over de ander
  vallen. `Spel.debug.vee` houdt daarom een tegel ruimte tussen de dieren;
- dwalen gaat in vier richtingen (`T.laatDwalen`), dus na een stap kijkt een dier altijd schuin
  (ZO, ZW, NW of NO). Alleen de eerste kant, uit het zaad, kan elk van de acht zijn;
- het herkauwen en een oor dat wegdraait zie je op 1× nauwelijks; de zwiepende staart wel;
- de schaduwvlek onder een wezen (`tekenWezen`) is voor iedereen even groot, en onder een koe valt
  hij weg;
- van achteren (N) is een grazende zwarte koe vooral een donkere vlek op vier poten.

**Alle dorpelingen:** bij het neerzetten van een voet wordt de scheen wat uitgerekt, want
`beenPunten` zet de enkel altijd op het doel.

**Nog te tekenen:**
- braakland met onkruid (nu kale geploegde grond);
- de koets van de heer;
- portretten van de heer en de inner boven het gesprek;
- de gebouwen die een tekening lenen (hut, schaapskooi, timmerman, brouwerij, tiendschuur,
  wapenmaker, wachthuis en meer). De schaapskooi staat sinds 25 sep op de kaart van het gehucht, in
  de blokhutschuur: een schaapskooi is laag, met een groot rieten dak tot bijna op de grond;
- hooioppers op een gemaaide weide, en een hek om een weide;
- bouwfases voor de kapel, de watermolen en de put;
- misschien ijs op de beek (een vraag aan Marcel).

**Kleine beeldfouten:**
- in een huis in aanbouw branden de ramen al;
- het zwad van de maaier staat als paaltjes, en zijn slag is symmetrisch.

- **Bomen in het bos die doorschijnend worden** (7 okt, de sessie van de hoogte, gezien op land 5 van de maker, ook met
  de hoogte op vlak): in het grote bos rechtsonder worden hele stroken bomen half doorzichtig, ook waar geen schout of
  dorpeling staat. Waarschijnlijk de doorkijk (`js/doorkijk.js`) voor de wolven en de herten van vraag 116, die daar
  diep in het bos rusten. Nog niet nagelopen.

- **Twee uiterlijken die niet goed lezen** (10 okt, bij vraag 150; Marcel omcirkelde ze: "Deze zien er niet uit"):
  lichtblond haar (`HAAR.lichtblond` in `uiterlijk.cjs`, de ramp perkament) is bijna wit en leest als een kaal hoofd, en
  de vlecht van het kapsel 'kroon' (`kapselVrouw`) zakt voorop en ligt over de ogen (de `- 1.6 * Math.max(0, sin)` moet
  een `+` zijn). Een herstel stond even in de code en ging met vraag 150 weer weg; het vraagt dat de vellen met dat haar
  en die kroon opnieuw gerenderd worden (ook in hun werk en in andere kleren).
## Voorstellen van Claude die nog niet gekozen zijn

- **Mods als haak** (16 okt, `verpakken.md`, "Open voor mods"; Marcel: mods zijn welkom): de werkbank is al half een
  ingang voor mods (alle getallen per onderwerp in een blok). Later een map `mods/` die de schil na het spel laadt, en
  Steam Workshop om ze te delen; voor een spel als Settlers een echte haak. Niet gekozen; na de demo.

- **Een vaandel boven de aanvoerder** (16 okt, vraag 170, stap 5): in een RTS zoek je je held snel, en nu vindt alleen
  Tab hem (hij draagt het vel van een dorpeling, en een nieuwe aanvoerder zijn eigen). Een klein vaandel boven hem, in
  code; eerst in woorden en een proefplaat (`beeld.md`). Niet gekozen.
- **Ontslag en sneuvelen** (16 okt, vraag 170, stap 5): de aanvoerder kan vallen en een ander neemt het over, maar de
  twee bazen (de heer en het dorp) sturen "je" weg, en dan is het spel uit. Voorstel: ontslag gaat over het dorp (jij als
  speler), sneuvelen over de man; zo past het. En de schandpaal wordt sterker: zet de heer de aanvoerder aan de paal, dan
  mist je troep een tijd zijn held. Niet gekozen.
- **Bij de diensten** (16 okt, vraag 170, stap 4; buiten de stap gehouden): **een fakkel bij de nachtwacht**, zodat je
  wie waakt in het donker ziet staan (een tekening: eerst in woorden, `beeld.md`); **'s nachts minder ver zien**, voor
  iedereen (nu ziet een man 8 tegels ver, dag en nacht), zodat de nacht tactisch wordt en een overval in het donker
  dichterbij komt voor iemand hem ziet; en **een patrouille**: een bevel om tussen twee plekken heen en weer te lopen,
  zoals in de meeste RTS. Elk een regel erbij; niet gekozen.
- **Een formatie die houdt** (16 okt, vraag 170, stap 3, D2): nu gaat wie in een *Line* of *Ring* een vijand ziet,
  erop af (de leiband van 10 tegels), en komt daarna terug naar zijn plek. Een vorm die houdt: alleen wie vanaf zijn
  plek raakt, slaat (de schutters schieten, wie voor staat wacht tot de vijand er is). Sterker voor een *Line* voor een
  poort, maar een regel erbij; misschien als knop per troep (*Hold* en *Charge*). Niet gekozen (Marcel koos D1).
- **Verweren per stand** (10 okt, bij het voorbeeldhuis, vraag 144): een hut van keuters verweerder dan het stenen huis
  van ambachtslieden, zodat het huis zelf zegt wie er woont, zonder briefje. Kan met de knop `verweer` als getal in plaats
  van aan of uit. Niet gekozen.
- **Het huis donker op de grond** (10 okt, bij stap B van het voorbeeldhuis): de tekening maakt de voet van de muren
  donker, maar de grond om het huis legt het spel (`tekenZonneschaduw` in `js/tekenen.js`), en die wordt niet donkerder
  vlak bij de muur. Een smalle, zachte schaduw rond de voet van elk gebouw zou het huis zwaarder op de grond zetten. Niet
  gekozen.
- **De heer kijkt op Sint-Maarten zelf rond vanaf het plein** (24 sep, gebouwd). Wat hij ziet en niet
  in het rapport van de inner staat, komt alsnog op de rekening en kost argwaan. Te keuren; uit te
  zetten met "heer zicht" op 0 in de werkbank.
- **Een vondst van de soldaten kost argwaan** (25 sep, gebouwd): 15% per plek waar ze iets vinden.
  Uit te zetten met "argwaan per vondst" op 0 in de werkbank.
- **Uitzoomen** (26 sep, bij de schets van het plein). Het spel toont op de meeste schermen ongeveer
  960 bij 540 beeldpunten van de wereld: de zoom volgt alleen het venster, van 1× tot 2× (`formaat`
  in `js/main.js`). Een boerderij beslaat 7 bij 9 tegels, dus een plein van zo'n 200 tegels vult al
  een scherm, en het hele dorp zie je nooit. Een bouw- en beheerspel laat je meestal uitzoomen om het
  geheel te overzien. Nog niet gekozen.
- **Rechtspraak onder de boom op het plein** (26 sep). Een schout zat de schepenbank voor, en in veel
  dorpen werd buiten recht gesproken, onder een boom. De grote eik midden op het plein kan die plek
  worden als de rechtspraak komt (deel C).
- **Een eigen figuur voor de schout** (26 sep). Hij draagt het vel van een gewone dorpeling, dus
  zodra er meer dorpelingen rondlopen, zoek je jezelf in de menigte. Iets van zijn ambt (een
  ketting, een staf, een hoed) maakt hem vindbaar, en past bij een spel waarin de heer, de inner en
  de soldaten ook hun eigen figuur hebben. In `js/sprites.js` is dat daarna één regel: nu krijgt
  de soort 'schout' altijd een dorpelingvel, ook als er een vel 'schout' zou zijn.
- **Het bos met de kudde: hoe Claude het zou bouwen** (27 sep, het plan voor punt 4, deel 2, vraag 43;
  Marcel: "Push en alles als idee opslaan"). Wat Marcel op 25 sep al koos, staat in `spel.md` ("Rijk
  worden en arm lijken: de inner" en "Weides met koeien en schapen", stap 3): een plek in het bos voor
  graan en goud (ver lopen, muizen en vocht), een deel van de kudde het bos in voor de inner komt, de
  inner telt de kudde, de heer vraagt per dier, en wol en kaas zijn sporen. Zo zou het gaan, in twee
  stukken:
  - **Stuk 1, de inner telt de kudde.** Hij telt de koeien en schapen die hij ziet, net als de
    gebouwen. De heer vraagt dan per dier in plaats van per schaapskooi: 2 goud per koe en 2,5 wol per
    schaap (acht schapen is 20 wol, zoals nu). Wol is een spoor: een schaap geeft 4 wol, en ze worden
    een maand voor zijn komst geschoren; ligt er meer wol dan zijn schapen konden geven, dan groeit zijn
    argwaan. Kaas is in het spel nog graan (de melk telt als graan), dus voor de koeien is er nog geen
    spoor. Komt hij onverwacht terug en staan er ineens meer dieren, dan weet hij genoeg, zoals bij het
    graan.
  - **Stuk 2, het bos.** Een open plek diep in de bosrand, in het noordwesten, zo'n vijftig tegels van
    de weide: een halve dag lopen voor een koe. Daar kun je vee heen drijven (klik op de weide of de
    heide, kies hoeveel koeien en schapen, en ze lopen erheen; de inner komt er niet, want het bos
    staat niet op zijn ronde en door bomen ziet hij niet; in het bos geven koeien geen melk, elke nacht
    kan de wolf een dier halen, en voor de winter moeten ze terug, want er is geen hooi), en je kunt er
    graan en goud verstoppen (zoals in een kelder, maar zoveel je wilt, en de soldaten zoeken er nooit;
    wel eten muizen en vocht elke dag een deel van het graan, goud niet). Wie je ziet drijven of iets
    wegzetten, is getuige, zoals bij de kelders (punt 3).
  - Het past bij hoe het ging: vee liep vroeger echt in het bos (bosweide), en varkens gingen er in de
    herfst heen voor de eikels. Het bos was meestal van de heer, en wie er vee liet lopen, betaalde
    ervoor; later kan de heer het dus verbieden, met een keur.
  - Wat er nu al is: de kudde (drie koeien op de weide onder het plein, acht schapen op de heide in het
    zuidwesten) telt nergens mee; de heer vraagt 20 wol per schaapskooi; het bos is een rand van zeven
    rijen bomen aan de noordkant, en bomen houden het zicht van de inner al tegen.
  - **Vragen, nog te kiezen:**
    - **A.** Eerst stuk 1, dan stuk 2?
    - **B.** Per dier 2 goud per koe en 2,5 wol per schaap, in plaats van 20 wol per kooi?
    - **C.** Het bos als open plek op de kaart, waar je je koeien ziet staan? Of als plek buiten de
      kaart, waar ze heen lopen zoals een bezoeker de weg af? Voorstel: op de kaart.
    - **D.** Is dit de goede prijs voor het bos: geen melk en de wolf voor het vee, muizen en vocht voor
      het graan?
- **De twee boeken tijdens het jaar** (28 sep, veertiende sessie, bij het plan voor de afrekening, vraag 49).
  De afrekening zet je eigen boek en dat van de heer naast elkaar, één keer per jaar. Dezelfde twee boeken
  zouden er het hele jaar kunnen zijn, onder een toets: wat je echt hebt, en wat de heer tot nu toe van je
  weet (wat zijn inner telde, wat de marskramer hem vertelde). Dat zijn de rekenboeken van `spel.md` (punt 6),
  en het maakt de kern elke dag zichtbaar, niet pas in lentemaand. Na de proef; niet gekozen.
- **Stropen: de herten zijn van de heer** (7 okt, achtendertigste sessie, bij het plan voor vraag 116, stap 3). De
  jager jaagt in het bos van de heer, en zijn opmerking in `T.GEBOUWEN.jager` zegt al "stropen is ook een keuze". Als
  de jager echt herten neemt, kan de heer er iets van vinden (zoals de houtkap en het bos ontginnen: gemeld kost gunst,
  stiekem is betrapt worden). Niet in stap 3; misschien met de wetten (een wet "jagen in het bos van de heer").
- **Een paadje slijt alleen in gras** (8 okt, bij vraag 117, B van 2a): `T.hoekenMetPaden` (`js/paden.js`) maakt alleen
  van gras zandpad, en voor zandpad naast veen, broek, heide of strand is er geen tegel. Wie op het eiland door het veen
  of over het strand loopt, laat dus geen spoor zien (het spoor telt wel, `T.isSpoor`). Pas als het opvalt: een
  overgang erbij, of het spoor daar als stempel.

- **Na optie 1 (11 okt, vraag 151):** de figuren van de inner (`beelden/figuren/inner-*.png`, en `inner` in
  `naar-spel.cjs`, `dorpelingen-anim.cjs` en `heer.cjs`) staan er nog, maar niets gebruikt ze; ze laden alleen als iets
  ze vraagt. `T.zietTegel` (`js/wereld.js`) heeft alleen nog een toets als gebruiker. En
  `VELDWERK_INSTELLINGEN.wiedenRust` en `spittenRust` leest al een tijd niets meer.

- **Het lege begin (11 okt, vraag 152, 1b):** in het kamp is geen plaats, dus zegt het spel elke paar dagen "Er wil een
  gezin komen, maar er is geen plaats. Wijs een erf aan (B)"; de status Vol speelt vanaf de eerste dag (elke tent is vol);
  het doel linksboven is nog "Naar een dorp" (het plan noemde "haal de eerste winter"); de brief zegt "met 4 gezinnen" in
  cijfers. De weg van het eiland loopt soms dwars door het kamp op het plein. Allemaal voor 1c en 1d, als je kunt bouwen.
- **Een wankele toets** (12 okt, ronde 2 van het snoeien): `test/wetten.test.cjs`, "vreemden welkom: om de 10 dagen een
  gezin", maakt twee gehuchten zonder vast zaad en vergelijkt de bevolking van het ene op dag 10 met die van het andere
  vóór die dag. Komt er in het ene op dag 10 toevallig een kind bij, dan is hij rood (één keer gezien, 27 tegen 26; los
  veertien keer groen). Een vast zaad, of de bevolking van elk dorp met zichzelf vergelijken, maakt hem vast.
- **Geen vee in het lege begin** (12 okt, stap 6 van ronde 2): de beginkudde (`T.zetBeginKudde`, `js/vee.js`) staat
  alleen op de weide of de meent die de kaart legt, en het lege begin legt er geen; de marskramer die vee verkoopt, is er
  nog niet (`js/vee.js`, bovenaan). Dus komt er nooit een koe of schaap, en geen melk, kaas of wol (dus geen laken voor de
  weverij). Met het dorp dat er al was gaat ook de laatste meent weg. Een gat voor B: de kar brengt een paar dieren mee,
  of de marskramer verkoopt ze, of de boer krijgt vee als hij een weide legt; Marcel kiest. Tot dan slaapt de meent: een
  kaart kan er nog een leggen (`"meent"` in `js/kaart.js`), en `js/vee.js`, `js/bewoners.js`, `js/hud.js` en het hek om de
  schapen (`T.hekOmDeSchapen`, `js/beesten.js`) lezen hem, maar geen kaart heeft er een. Ook zegt het spel als de wolven
  een schaap pakken "The wolves have taken a sheep from the common.", ook als het van een weide was.
- **Het plein achter het bos** (12 okt, bij de marktplek): op eiland 9 (`?kaart=gehucht` met het vaste toeval) vallen de
  kruinen van het bos vóór het plein (naar de camera) over een groot deel van het plein, zodat je het kamp en de
  marktplek half tussen de bomen ziet. De maker houdt alleen de eiken op het plein uit de voorkant (`eikenTot`), en de
  marktplek telt alleen bomen binnen zes tegels van het plein als ze iets afdekken (`T.zoekMarktPlek`, "zicht"). Voor
  het beeld (B2 of `beeld.md`): een strook zonder hoge bomen vóór het plein, of de doorkijk (`js/doorkijk.js`) ook daar.
- **De natuur buiten het bouwbereik** (12 okt, stap 6 van ronde 2; agent A zag het bij het omzetten van de toetsen): in
  het lege begin liggen de rotsen en het water op veel eilanden verder dan 16 tegels van het plein (het bouwbereik,
  `T.BEGIN_INSTELLINGEN.bouwBereik`), dus kan daar geen steengroeve, visser of rietsnijder staan tot er een opslag in de
  buurt is. `test/natuur.test.cjs` zet het bereik daarom op 120. Een spelvraag (B2, of het bereik), geen fout.
- **De samenvatting is oud** (12 okt): `gereedschap/samenvatting/samenvatting.html` (en dus
  `ontwerp/het-spel-in-het-kort.pdf`) beschrijft nog het spel van vóór 11 okt: de inwoners die vragen, de erven, de
  oproepen, de ondernemers en de herbergierster. `npm run samenvatting -- --beelden` speelt sinds stap 6 op het
  proefdorp, maar draaide nog niet; de tekst moet eerst opnieuw, met de richting van 11 okt (`gameloop.md`).
- **Het gevecht in real time, wat opviel** (15 okt, vraag 170, stap 2): (1) wie vlucht, loopt op zijn gewone snelheid
  (1,2 tot 1,5 tegels per seconde), een rover op 2,2: wie ver van het town hall werkt, halen ze bijna altijd in. Rennen
  bij het vluchten (zoals een hert, `e.rent`) zou helpen, maar is een regel erbij. (2) Alle dorpelingen rennen naar één
  deur, die van het town hall; bij veel mensen staat er een rij voor de deur (wie naast de deur staat, mag ook naar
  binnen). (3) `Spel.debug.proefdorp()` laat het titelscherm open staan. (4) Een rover die een dorpeling najaagt,
  laat zijn akker even los; komt hij niet binnen zijn opUren terug, dan geeft de aanval het op (`T.werkRoversBij`).
- **De bruggen, wat opviel** (17 okt, vraag 170, stap 6a2, toen ze het spel in gingen): (1) een brug over een schuine
  rivier is lang: langs x of y over een beek die diagonaal loopt, en drie rijen die elk op droog land landen, maakt van
  een beek van drie tegels een brug van acht, met aan weerszijden een stuk boven het gras. Een schuine brug zou korter
  zijn, maar is een tekening erbij. (2) Met de spelregel "Hoogte" op heuvels ligt elk stuk op de grond van zijn eigen
  tegel, dus volgt een brug de glooiing; standaard staat de hoogte uit. (3) In het woud vallen de kruinen vóór de brug
  (naar de camera) over een groot deel ervan, zoals bij het plein; de doorkijk (`js/doorkijk.js`) maakt alleen een boom
  doorzichtig die iemand van je bedekt.
