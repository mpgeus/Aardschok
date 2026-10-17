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
een cijfer, en een bericht brengt je erheen. **Stap 2 is af** (15 okt, in `main`; `spel.md`, "Zo werkt het gevecht
nu"): het gevecht in real time, in de tik; aanvallen en dan terug naar de post;
niemand vanzelf; een rover slaat ook een dorpeling, die vlucht naar het **town hall** (het huis van de schout); het
gevecht is een status met de tijd op 1×; het gevecht in beurten is eruit. **Stap 3 is af** (16 okt, in `main`; `spel.md`, "Zo werkt kijken, kiezen en sturen nu", bij Formaties): *Line* en
*Ring*, op wapen gesorteerd, één kijkrichting, de knoppen op het briefje en het groen na de klik. **Stap 4 is af** (16 okt, in `main`; `spel.md`, "Zo werkt kijken, kiezen en sturen nu", bij De diensten): een dag- of
nachtdienst per soldaat (*Day* en *Night*), *To arms* op het wachthuis, en rovers op elk uur, de helft 's nachts. **Stap 5
is af** (16 okt, in `main`; `spel.md`, "Zo werkt de held nu"): de schout heet aanvoerder (*commander*), en valt hij, dan neemt een veteraan of de soldaat die het langst dient het
over; de reis over het land, sluipen, de lantaarn, oprapen, slapen en het praten zijn weg. **Marcel kwam erna met vraag
171** (bij I): elke groep soldaten heeft een groepsleider die een lantaarn draagt (besloten: "A1, B1, C1, D2"). **De
regel en het licht zijn af, en de proefplaat van de lantaarn in de hand is goed** (16 okt, in `main`; Marcel: "goed zo
voor nu"). **Het lantaarntje in de hand is af** (16 okt, in `main`; Marcel: "A1, B1"; `beeld.md`,
"De lantaarn van de groepsleider"), en zijn licht is op het scherm kleiner (Marcel: "het ligt vóór het poppetje", en
koos L3). Daarna **stap 6, samen spelen** (bij
I). Het plan is besloten (Marcel: "A1 b1 c2 d1"). **6a, één kaart met meer dorpen, is af** (16 okt, in `main`; `spel.md`, "Zo werken meer dorpen op één eiland nu"): een tweede dorp op het eiland, elk met zijn
eigen wezens, velden, plek en mist, en wie van een ander dorp is, is een vijand. **Marcel kwam erna met "de wereld van
iedereen"** (bij I: het wild en de rovers van het eiland, losse spelers; besloten: "W1, R1, Rb, maar dit wisselt ze leren,
N1, V1", en "K1 en L1"): **6a2 loopt** (het plan bij I, in vier stukken: a de wereld werkt haar eigen wezens bij, b het
wild van het eiland, c de roverskampen, d de rooftocht die leert), dan 6b, alles een opdracht. **Stuk a is af** (16 okt,
in `main`; Marcel: "A1"; `spel.md`, "Het wild is van de wereld"): het wild is van geen dorp, de
wereld werkt het één keer per kaart bij, wie het aangaat zijn dorp zegt het en vecht, en elke roedel gooit met zijn
eigen dobbelsteen. **Stuk b is af** (16 okt, in `main`; Marcel: "D1 e1"; `spel.md`, "Het wild is
van de wereld", bij Over het hele eiland): elk stuk land krijgt zijn wild als het opengaat, zoals zijn bomen. **Het
volgende is stuk c**, de roverskampen (eerst een plan voor Marcel). **Bezig in sessie
`ccr-b0684dee-kk0n5b`** (17 okt): stuk c, het plan voor Marcel. Let op: CLAUDE.md zit tegen de grens van 20 KB; haal eerst iets naar een ontwerpbestand als er een
afspraak bij moet.

**Marcel kwam op 16 okt met vraag 172, een volledig menu** (bij J: "We hebben een volledig menu nodig geen a.i slop"),
en koos: het titelscherm als tekst over de wereld, *Settings*, *New game* als eigen scherm, *Credits* en *Quit*, de
spelregels vast bij het begin, en een woordmerk in pixel art. **Stap 1 tot 6 zijn af** (16 okt, in `main`; `code.md` bij
`js/menu.js`, `spel.md` bij "Instelbaar"), en **172b, Settings in tabbladen met het venster en de beelden per seconde,
ook** (Marcel: "Zaken als resolutie etc hebben we nodig"; `code.md` bij `js/instellingen.js`). **De proefplaat van het
woordmerk wacht op Marcel** (`beeld.md`, "Het woordmerk").

**Ronde 3 van het snoeien is af** (A): **stap 1 tot 5 zijn af** (15 okt, in `main` sinds 16 okt; `snoeien.md`, "Ronde 3"): de voorvallen, de raadsman, het rapport en de feesten zijn
weg; brand, koorts en wolven beginnen zelf met een bericht met een plek; de statussen zeggen zelf wanneer ze beginnen en
ophouden; de meiboom en de kerstboom staan als versiering op het plein; het werk volgt alleen de afwisseling; de wetten
zijn het rantsoen en de belasting. Zo'n 2900 regels spelcode en 2000 regels toetsen minder. **Stap 6 is af** (16 okt, in
`main`; Marcel: "Groei op afwisseling, doe maar"; `spel.md`, "De groei van de huizen"): de
wensen per huis zijn weg, en een huis groeit door als het dorp een maand tevreden is en genoeg soorten eet (een hut 3,
een huis 4, een stenen huis 5), voor bouwstof. In de speeltest wordt elk eiland in het eerste jaar een dorp, met drie
stenen huizen. **Ronde 3 is af.**

**Wacht op Marcel:**
- **Het wild over het hele eiland bekijken** (vraag 170, stap 6a2, stuk b, 16 okt, in `main`):
  Nieuw spel (een bewaard spel van vóór stuk b laadt niet meer: versie 19), zoom uit, en loop met mensen het land uit: in
  het bos dat opengaat, leven herten en wolven, ook ver van je dorp; `Spel.debug.beesten()` zegt wat er bij je dorp leeft.
  **Om naar te kijken:** (1) rond het begin leven nu meer herten dan vroeger (het bos in de rand die bij het begin opengaat,
  heeft ook zijn wild; roedels ongeveer evenveel), en in de speeltest had eiland 1 aan het eind geen hout en één dode van
  honger, en groeide eiland 3 minder (`opmerkingen.md`): als het te veel is, zijn de getallen `bosPerKudde` (400) en
  `maxKuddes` (3) in de werkbank ("Animals in the forest"); (2) het kost wat meer rekenwerk, zo'n 4% van één kern op 30× in
  plaats van 2%; zeg het als je haperen ziet. **Wat Claude erbij koos** (zeg het als het anders moet): (1) het aantal per
  stuk wordt afgerond met de dobbelsteen van het stuk (1.050 tegels bos is anderhalve roedel: de helft van de stukken
  krijgt er twee); (2) de status "Wolves" telt het wild binnen 100 tegels van het plein, en dat dorp zegt het ook als zijn
  wild wegtrekt; (3) de toetsen van het wild spelen nu op eiland 14 (en de jager op 2), waar alles slaagt.
- **Het wild van de wereld bekijken** (vraag 170, stap 6a2, stuk a, 16 okt, in `main`): Nieuw
  spel (een bewaard spel van vóór vandaag laadt niet meer: het opslaan is versie 18). Het spel speelt zoals het speelde;
  het verschil zit onder de motorkap, met twee dorpen. `Spel.debug.tweedeDorp()`, dan `Spel.debug.wissel()`, en
  `Spel.debug.beesten()`: in het bos van het tweede dorp leeft zijn eigen wild, van niemand. Dat een roedel de mensen van
  het tweede dorp aanvalt, dat dorp het zegt en vecht, en het eerste van niets weet, toetst `test/meer-dorpen.test.cjs`; in
  de browser is het lastig op te wekken (de aanvoerder draagt 's nachts zijn lantaarn, en een wolf vlucht voor wie hem
  achterna zit; `opmerkingen.md`). **Wat Claude erbij koos** (zeg het als het anders moet): (1) het wild komt in de tik na
  de dorpen, zijn nacht na die van de dorpen en hun bos; (2) een roedel vecht tegen het dorp van de man die hem het laatst
  sloeg, of naar wie hij kwam (`G.tegen`), en een wolf die vecht, neemt de dichtste man die hij ziet, van welk dorp ook;
  (3) wat je toetst (`test/meer-dorpen.test.cjs`): het eerste dorp speelt twintig dagen letter voor letter hetzelfde met of
  zonder een tweede, nu met het wild in zijn bos erbij. **Om naar te kijken:** een toets die zei dat de mensen van een
  dorp buiten beeld rondlopen, slaagde tot nu toe bij toeval (hij telde de wolven die het dorp neerzette); hij tikt nu de
  hele wereld, en het klopt.
- **Settings bekijken** (vraag 172b, 16 okt, in `main`): het menu, *Settings*, en de vier
  tabbladen. Het venster en zijn formaat zie je alleen in de verpakte versie: `npm run proefversie -- --windows`, en
  *Display*. **Wat Claude erbij koos** (zeg het als het anders moet): (1) de Steam-versie opent op het hele scherm (tot nu
  gemaximaliseerd); (2) pauze als je wegklikt staat standaard aan; (3) de helderheid in vijf stappen (80 tot 120%), alleen
  op de wereld, niet op de vensters; (4) F2 en *The meter* zijn hetzelfde; (5) de formaten tellen in de pixels van
  Windows: met een schaal van 150% past 1920×1080 niet op een scherm van 1080, en 1280×720 vult het dan.
- **Het menu bekijken** (vraag 172, 16 okt, in `main`): open het spel. Links het woord en de
  keuzes als tekst, rechts het land; de muis of de pijltjes zetten het vaantje, Enter neemt. *Credits* en (met een spel
  bewaard) *Load* liggen op papier ernaast; *Settings* heeft het beeld, het hele scherm, de taal en de toetsen. *New game*:
  de naam, het land met het eiland, *Game rules* (*Standard*, of kies er zelf; dan maakt *Begin* het land opnieuw), en
  *Begin*. In het spel Esc: het menu op papier, *Game rules* lees je daar alleen; in D zit *Game rules and the workbench*
  om te proberen. **De proefplaat van het woordmerk** (gebroken goud, `beeld.md`, "Het woordmerk"): goed zo, of wat
  anders? **Wat Claude erbij koos** (zeg het als het anders moet): (1) onder *Settings* staan *Drawing*, *Shadows*, de
  twee keuzes voor de doorkijk, *Trees through the year*, *Small life*, *Clothes* en *Advice*: die raken de wereld niet;
  (2) een nieuw spel krijgt de spelregels die je het laatst koos, en een spel van vóór vandaag speelt met wat de browser
  had; (3) de werkbank staat alleen nog in D, niet bij *New game* of in het menu; (4) *Continue* heeft één regel eronder
  (het dorp, de dag, de mensen), en verder heeft alleen *Game rules* en *Photo mode* een regel; (5) Credits zegt "A game by
  Marcel, made with Claude", en de letters met hun licentie; (6) *Quit* staat er alleen in de Electron-versie.
- **Meer dorpen op één eiland bekijken** (vraag 170, stap 6a, 16 okt, in `main`): Nieuw spel, en
  in de console `Spel.debug.tweedeDorp()`: er komt een tweede dorp op de dichtste andere dorpsplek (op 430 tot 2100
  tegels), met zijn eigen huifkar en gezinnen. `Spel.debug.wissel()` maakt jou dat dorp: de camera gaat erheen, en de
  balk, de mist, de minikaart en de berichten zijn van hem; nog eens `wissel()` en je bent terug. Zet in het ene dorp een
  wachthuis met militie, stuur ze naar het andere (rechts klikken, op de minikaart kijken): ze vallen de aanvoerder en de
  dorpelingen van de ander aan (C2), die vluchten naar hun eigen town hall, en allebei de dorpen vechten. **Wat Claude
  erbij koos** (zeg het als het anders moet): (1) elk wezen hoort bij één dorp, ook het vee, de wolven, de rovers en de
  bezoekers, en elk dorp werkt alleen zijn eigen bij, met zijn eigen dobbelsteen: zo speelt het eerste dorp een half jaar
  letter voor letter hetzelfde, met of zonder het tweede; (2) elk dorp heeft zijn eigen mist; (3) de muis op een mens, een
  gebouw of een veld van de ander zegt alleen wat het is en van wie ("Gilbert, of Oldland"); (4) je bouwt niet in het
  bereik van de ander; (5) wie aangevallen wordt, krijgt ook de status en het bericht van het gevecht; (6) de werkbank
  heeft er één getal bij: *another village at least* (200 tegels, "The maker"). **Om naar te kijken:** het licht, de rook
  en de paadjes tekent het scherm alleen voor het dorp waar je kijkt, en "Hoogte" en de bouwstijl volgen het eerste dorp
  (`opmerkingen.md`).
- **De groepsleider met de lantaarn bekijken** (vraag 171, 16 okt, in `main`): Nieuw spel, zet een wachthuis (B) met twee man militie (+), zet er een op
  *Night*, en kijk 's nachts (`Spel.debug.uur(23)`): om de aanvoerder en de leider van wie dienst heeft, staat een warm
  licht, een kleine plas om hem heen (L3), en de wolven vallen niemand binnen 3 tegels van hem aan. In zijn hand hangt een lantaarntje met een gloeiend hoorn,
  dat bij het lopen meeschommelt; loopt hij achter een huis, dan is het mee weg. **Wat Claude erbij koos** (zeg het als
  het anders moet): (1) de leider is, van wie *nu* dienst heeft, wie het langst dient, zodat de nachtwacht 's nachts
  haar eigen leider heeft; (2) het lantaarntje komt in de diepte, direct na zijn figuur, en het hoorn gloeit zoals de
  ramen (`beeld.md`): zo zweeft het niet boven een dak; (3) de bode en wie meegaat krijgen er ook een, als ze een vel
  met handen hebben (wie in een werkvel loopt, krijgt er geen: zijn licht blijft).
- **De held en het opruimen bekijken** (vraag 170, stap 5, 16 okt, in `main`): Nieuw spel. De held heet nu *commander* (ook in de brieven van de heer), Tab kiest hem. Zet een
  wachthuis (B) met twee man militie (+), en laat hem vallen: `Spel.debug.aanvoerder('val')`. Het spel gaat door: een
  bericht zegt dat de soldaat die het langst dient het overneemt, en dat zijn gezin in het town hall trekt (en het gezin
  van wie viel in zijn huis, C2); Tab kiest nu hem, en hij vecht met zijn eigen wapen (B1). Zonder soldaat zegt het dorp
  dat er niemand is, tot er een soldaat komt. Een klik op de marskramer opent meteen zijn handel, op de heer zijn
  venster om te betalen; S (sluipen) en Z (slapen) doen niets meer. **Wat Claude erbij koos** (zeg het als het anders
  moet): (1) onder veteranen gaat de eerste in het dorp voor (wie het langst veteraan is, onthoudt het spel niet); (2)
  de nieuwe aanvoerder staat waar je hem zet, dag en nacht, zoals de eerste, en heet in de teksten *the commander*
  (zijn eigen naam valt weg: "Martin, son of the commander"); zijn gezin werkt, zoals dat van de eerste, alleen als er
  niemand anders is; (3) de brief aan de marskramer schrijf je nu overal (het was "bij je huis"); (4) in de code heet
  het town hall `raadhuis`, en zijn 85 tekeningen ook (hernoemd, niet opnieuw gerenderd). **Om naar te kijken:**
  zonder lantaarn is de held 's nachts buiten prooi voor de wolven als hij alleen staat. In de speeltest (zaad 1) viel hij
  zo op 7 februari, en nam Reginald het over. (Marcel antwoordde met vraag 171, de groepsleider met een lantaarn.)
- **De diensten bekijken** (vraag 170, stap 4, 16 okt, in `main`): Nieuw
  spel, zet een wachthuis (B) met drie man militie (+). Kies er een, en druk op zijn briefje bij *Watch* op *Night*: hij
  gaat naar huis en slaapt overdag, en vanaf het slapen (`Spel.debug.uur(22)`) staat hij bij het wachthuis terwijl de
  twee anderen slapen. Op het briefje van het wachthuis: *On watch by day 2, by night 1*, met *To arms*. Laat 's nachts
  rovers komen (`Spel.debug.uur(2)`, dan `Spel.debug.rovers(3)`) en druk *To arms*: wie slaapt, komt naar buiten. Een
  rechtsklik met een slapende man gekozen (een groep onder een cijfer vindt hem) wekt hem ook. In een spel komen de
  rovers nu op elk uur, de helft 's nachts (de werkbank, "The robbers": `nachtKans`, 0,5). **Wat Claude erbij koos**
  (zeg het als het anders moet): (1) *To arms* stuurt wie een post heeft naar zijn post, de rest naar het wachthuis; (2)
  wie opstaat, blijft op tot zijn eigen dienst begint, net als na een bevel: een man met dagdienst die je om twee uur
  wekt, waakt door tot de avond erna; (3) de dagdienst staat ook 's ochtends en 's avonds bij het wachthuis, en een
  soldaat gaat niet meer naar de put of de herberg (A1).
- **De formaties bekijken** (vraag 170, stap 3, 16 okt, in `main`): Nieuw spel,
  zet een wachthuis (B) met drie man militie (+), en maak er in de console een speerman en een boogschutter van
  (`m = Spel.militieVan(Spel.S.dorp); m[1].bewoner.soldaat.soort = 'speerman'; m[2].bewoner.soldaat.soort =
  'boogschutter'`). Kies ze (een kader), en klik rechts op open grond: hun plekken liggen een halve seconde in groen, en
  ze gaan in een *Line* staan, de militie voor, de speer erachter, de boog achteraan, allemaal de kant op waar ze heen
  liepen. Op hun briefje *Formation*: druk *Ring*, en ze staan in een kring om hun plek, naar buiten kijkend, de boog in
  het midden; de volgende rechtsklik houdt de *Ring*. Te kiezen in de werkbank ("Choosing and sending"): hoeveel naast
  elkaar (8) en hoe lang het groen blijft (0,5). **Om naar te kijken:** (1) het midden van de *Line* komt op de plek
  waar je klikt, niet de voorste rij (zo kun je wisselen tussen *Line* en *Ring* zonder dat de troep verschuift); (2)
  wie gevochten had, keek tot nu toe altijd naar het zuiden als hij stilstond (een fout, nu weg).
- **Ronde 3 van het snoeien bekijken** (15 okt, in `main`): Nieuw spel. Er komt niemand meer
  met een uitroepteken naar je toe, R en de knop Rapport zijn weg, en de wetten (W) zijn het rantsoen en de belasting.
  Een status zegt het nu zelf in een bericht ("It is cold in the houses, for ..."; en als hij over is). In de droogte
  kan er een huis gaan branden: een bericht brengt je erheen, de buren blussen (`Spel.debug.brand('nu')`); de koorts
  begint zelf in de kou of een vol dorp (`Spel.debug.koorts('nu')`). In bloeimaand staat de meiboom op het plein, en
  vanaf 20 wintermaand de kerstboom met kaarsjes (`Spel.debug.versiering()`). Erbij gedaan, zeg het als het anders
  moet: **een leeg bord telt als één soort** (60% werk), want zonder de tevredenheid werkte een dorp zonder eten op 100%.
- **De groei op de afwisseling bekijken** (ronde 3, stap 6, 16 okt, in `main`): Nieuw spel.
  Een moestuin, een kippenhok en een jager naast het graan: dan worden de hutten na een maand huizen (voor 8 stammen), en
  met een vierde soort en een steengroeve stenen huizen. De muis op een huis zegt hoe ver het is ("It grows into a stone
  house after 30 days in which the village eats 4 kinds of food; now it eats 3"); `Spel.debug.groei()` zegt het voor
  elk huis. **Wat Claude erbij koos** (zeg het als het anders moet; `snoeien.md`, stap 6): een ladder van soorten (3, 4,
  5) in plaats van één lat; groeien kost bouwstof; de put en de markt hebben geen koper meer, bier is voor de herberg en
  laken voor de heer; een stenen huis loopt deftig zonder laken; en de raad over zout voor de winter is weg.
- **Het gevecht in real time bekijken** (vraag 170, stap 2, 15 okt): Nieuw spel, zet een wachthuis (B) met twee man
  militie (+), en laat rovers komen (`Spel.debug.rovers(3)`). Het bericht zegt waar ze heen gaan en hoe je stuurt: kies
  je soldaten en klik rechts op een rover. Ze lopen erheen en slaan (een levensbalk boven wie vecht, de schade zweeft
  boven het hoofd, een pijl vliegt), *Fighting* staat in de balk, de randen kleuren rood, en de tijd loopt op 1×. Een
  dorpeling die een rover ziet, rent naar het **town hall** (zo heet het huis van de schout nu) en komt eruit als de
  rovers weg zijn. Een soldaat bij het wachthuis valt uit zichzelf aan wat binnen 8 tegels komt, en laat het gaan op 10
  tegels van zijn post. Opslaan mag midden in een gevecht. Te kiezen in de werkbank ("Fighting"). **Twee dingen om naar te
  kijken:** (1) de held kiest zelf geen vijand, maar vecht als je hem stuurt of als hij geraakt wordt (een keuze van
  Claude: anders liep hij van zijn plek een gevecht in dat het spel kan beëindigen); (2) het is nu dodelijk: twee wilde
  rovers in de oogst doodden in een toets drie dorpelingen, en twee man militie verliest van drie rovers. De balans komt
  later; de knoppen zijn `vluchtZicht`, `zicht` en `leiband` ("Fighting"), en de rovers in "The robbers".
- **Kijken, kiezen en sturen bekijken** (vraag 170, stap 1, 15 okt): Nieuw spel. De
  camera volgt de schout niet meer: de pijltjes of de muis tegen de rand van het scherm schuiven het beeld, het wiel zoomt,
  een klik op de minikaart kijkt daar, en Tab kiest de held en kijkt naar hem. Zet een wachthuis (B) en op zijn briefje
  twee man militie (+). Klik op een soldaat (een gouden ring om zijn voeten, rechts zijn briefje), trek een kader om
  allebei, of dubbelklik op een van hen (alle militie in beeld). Klik rechts op de grond (*Send 2 men here*): daar staan
  ze voortaan van het opstaan tot het slapen, tot je *Back to the guardhouse* drukt op hun briefje. Shift+1 maakt er groep
  1 van (Ctrl+1 neemt Chrome zelf), 1 kiest hem, en 1 twee keer kijkt ernaar. Klik op een dorpeling: zijn briefje; de
  waard heeft *Talk*. Laat rovers komen (`Spel.debug.rovers(3)`): het bericht is onderstreept, een klik erop of Spatie
  brengt je erheen, en de plek knippert op de minikaart; rechts op een rover stuurt je mannen erop af (sinds stap 2 slaan
  ze ook, hierboven). Te kiezen in de werkbank ("Choosing and
  sending"): hoe dicht bij de rand de muis schuift (8 pixels; 0 zet het uit) en hoe snel (900).
- **Spelen na stap 0** (vraag 170, 15 okt): het spel moet er precies zo uitzien en zo spelen als ervoor; de wereld rekent
  nu in vaste tikken van een zestigste seconde. Let op of het lopen hortend oogt, vooral op een scherm van meer dan 60 Hz:
  het beeld schuift tussen twee tikken nog niet mee (dat kan erbij, als je het ziet).
- **De soldaten bekijken** (159, stap 1, 15 okt): Nieuw spel, en zet een wachthuis (B). Klik erop als het af is: op zijn
  briefje zes soorten met − en +. Druk + bij Militia: wie geen werk heeft, pakt een hooivork en staat overdag bij het
  wachthuis. Zet dan een wapenmaker (in het gehucht, 12 stammen en 14 goud), geef jezelf planken (D, +50), en druk +
  bij Spearman: de wapenmaker maakt een speer en een schild, de kar brengt ze binnen, en dan wordt er een speerman.
  Laat rovers komen (in de console `Spel.debug.rovers(3)`), stuur ze erop af, en kijk in het gevecht: de speerman steekt
  van twee tegels, een boogschutter schiet van ver, en schild en harnas vangen een deel af. De getallen in de werkbank
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
3. **Ronde 3, na C: af** (16 okt, in `main`). Het plan en wat Marcel koos staan in `snoeien.md`, "Ronde 3": de
   voorvallen, de raadsman, het rapport en de feesten weg; het werk alleen op de afwisseling; van de wetten rantsoen en
   belasting; de huizen groeien op de afwisseling, de wensen per huis zijn weg (stap 6; Marcel: "Groei op afwisseling,
   doe maar").

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
  `stadsmuur` staan in `T.GEBOUWEN`, zonder plaatsing; de weg (`js/wegen.js`) en het hek (`zetHek`, tot 15 okt in `js/beesten.js`, in git)
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
- **2, het gevecht in real time:** **af** (15 okt, in `main`; `spel.md`, "Zo werkt het gevecht nu"; `code.md` bij
  `js/gevecht.js`). Elk kiest de dichtste
  vijand die hij ziet, loopt tot hij raakt en slaat, met de regels van 159; de actiepunten van een slag worden de tijd
  tussen twee slagen; rovers en wolven vallen aan wie ze tegenkomen.
  **Het plan** (Claude, 15 okt; **besloten**, Marcel: "Aanvallen, dan terug", "Niemand vanzelf", "Iedereen, wie kan
  vlucht", "We hebben dan een 'town hall' nodig. Daar kunnen mensen schuilen", "Huis schout wordt town hall", "Iedereen"):
  **2a** de slag in de tik (`js/gevecht.js`, zonder scherm, met toetsen): wie geen doel heeft, kiest de dichtste vijand die
  hij ziet, loopt tot hij raakt (`T.kanRaken`) en slaat; de kosten van een slag maal de seconden per punt (0,4) is de tijd
  tot de volgende; toeval uit `T.toeval`, geen `await`. Wie vijand is, zegt één vraag (in stap 6 de mannen van een andere
  speler erbij). **2b** wie wat doet: een man valt aan wat hij ziet (8 tegels), loopt het hooguit 10 tegels van zijn post na,
  en gaat dan terug; bij een aanval komt niemand vanzelf (jij stuurt; het bericht brengt je erheen); een bevel erheen is
  lopen, een vijand aanklikken is die aanvallen. Rovers slaan wie ze tegenkomen, ook een dorpeling; een dorpeling die een
  vijand ziet, vlucht naar het **town hall** en blijft daar tot het rustig is (wie ze inhalen, kan vallen). De wolven
  houden hun jacht (wie ze kiezen, het licht, om hulp roepen), maar vechten in real time met wie ze aanvallen en wie hen
  aanvalt. **Het town hall** is het huis van de schout (de eerste opslag, het midden van je bereik), vanaf dag 1, en
  iedereen past erin; het oude raadhuis (stad, de schepenen) gaat eruit. **2c** het gevecht is een status (de tijd op 1×,
  E1; een bericht als het begint en ophoudt, met de plek); opslaan mag ook in een gevecht. **2d** het beeld: een levensbalk
  boven wie vecht, de schade als getal, de uitval, en een pijl of bout als korte streep (in code). **2e** het gevecht in
  beurten gaat er nu al uit (het raster, de actiepunten, einde beurt, de deur), niet pas in stap 5; de held die valt,
  blijft tot stap 5 het eind. De speeltest vecht niet meer zelf. De getallen in de werkbank ("Fighting").
- **3, formaties en de post:** *Line* en *Ring* (C1), op wapen gesorteerd, kijkend waar ze heen liepen (D1). **Af** (16 okt, in `main`; `spel.md`, "Zo
  werkt kijken, kiezen en sturen nu", bij Formaties; `code.md` bij `js/kiezen.js`).
  **Het plan** (Claude, 16 okt; **besloten**, Marcel: "A1, B1, C1, D1, E1"): **3a** de plekken: een *Line* is rijen dwars
  op de looprichting, voor wie slaat (hooivork, zwaard, de held), erachter wie steekt (speer en piek reiken 2 tegels),
  een rij verder de schutters; een soort die er niet is, valt weg; een *Ring* zet wie slaat en steekt in een kring om de
  plek, de schutters binnenin; een plek op een boom, huis of water schuift naar de dichtste vrije tegel. **3b** de
  richting: de hele groep kijkt één kant op, van hun midden naar de klik, afgerond op de 8 kanten van de figuren (elk naar
  zijn eigen laatste stap gaf een rij die alle kanten op keek); de richting hoort bij de post; alleen beeld, geen schade
  van opzij. **3c** op het briefje van meer mannen *Line* en *Ring*: een druk zet ze meteen zo, rond hun post, en elke
  volgende rechtsklik houdt die vorm; zonder keuze *Line*; een opdracht. De keuzes: **A1** de vorm hoort bij de mannen
  (elke troep zijn eigen); **B1** hooguit 8 naast elkaar, wie er meer is, staat een rij erachter bij zijn soort (de
  werkbank); **C1** in de *Ring* kijken ze naar buiten; **D1** in een gevecht zoals nu: wie een vijand ziet, gaat erop af
  en komt terug naar zijn plek (de vorm die houdt, D2, naar `opmerkingen.md`); **E1** na de rechtsklik een halve seconde
  de plekken in groen op de grond. Erbij: `js/gevecht.js` gebruikte `e.kijkt` als klok, en `js/sprites.js` als
  kijkrichting, zodat wie gevochten had naar het zuiden keek als hij stilstond.
- **4, de diensten** (5a), en vijanden kunnen op elk uur komen. **Af** (16 okt, in `main`; `spel.md`, "Zo werkt
  kijken, kiezen en sturen nu", bij De diensten; `code.md` bij `js/kiezen.js`).
  **Het plan** (Claude, 16 okt; **besloten**, Marcel: "A1, B1, C2, D2"): **4a** de dienst hoort bij de soldaat (een
  veteraan en de held hebben er geen): in zijn dienst staat hij op zijn post of bij het wachthuis, daarbuiten slaapt hij
  thuis; **A1** de dagdienst is van opstaan tot slapen, de nachtdienst van slapen tot opstaan (geen gat; een soldaat gaat
  niet meer naar de herberg); **B1** per man, met *Day* en *Night* op het briefje van wie je koos, zoals *Line* en
  *Ring*; een opdracht. **4b** wie een bevel krijgt terwijl hij rust, staat op en blijft in dienst tot zijn eigen dienst
  begint (tot nu toe alleen 's nachts, `post.wakker`). **C2** *To arms* op het briefje van het wachthuis: wie van zijn
  soldaten slaapt, staat op en gaat in dienst (zijn post, of het wachthuis), tot zijn eigen dienst begint, zoals na een
  bevel (een keuze van Claude). **D2** de rovers komen op elk uur, vaker in het donker: de helft van de overvallen valt
  's nachts (van slapen tot opstaan), het uur uit het zaad; de werkbank. Op het briefje van een soldaat zijn dienst, en
  op dat van het wachthuis hoeveel er overdag en 's nachts waken. Wat erbuiten bleef (`opmerkingen.md`): een fakkel bij
  de nachtwacht, 's nachts minder ver zien, en een patrouille.
- **5, de held en het opruimen:** **af** (16 okt, in `main`; `spel.md`, "Zo werkt de held nu"; `code.md` bij
  `js/soldaten.js`). De schout heet voortaan
  anders (vraag A), en valt hij, dan staat er een veteraan op; het praten is geparkeerd; eruit wat alleen voor een lopende
  schout was.
  **Het plan** (Claude, 16 okt; **besloten**, Marcel: "A1, B1, C2"), in vier commits: **5a weg** wat alleen voor een
  lopende schout was: de reis over de landkaart (de spelregel "Land", zo'n 850 regels), sluipen (S), de lantaarn van de
  held (de wolven zien hem als ieder ander; de lantaarns van de bode blijven), sleutel, kist en oprapen (met
  `T.questGrendel` en wat het gereedschap van de quests daarvan las), `T.roepOp` en `opgeroepen`, `S.naLopen`, de uitleg
  `hulp`, de dode code in `js/lopen.js`, en **A1** slapen met Z (de snelheid in de balk spoelt de nacht ook door, en
  samen spelen heeft één klok). **5b het praten geparkeerd:** een klik op de marskramer opent zijn handel, een klik op de
  heer zijn venster om te betalen, de waard heeft geen *Talk* meer; de code van de gesprekken blijft. **5c de naam:** de
  held heet `aanvoerder` (*commander*, ook in de brieven, voor *reeve*), `S.schout` gaat op in `S.dorp.aanvoerder` (één
  weg), het town hall heet `raadhuis` (en de 85 tekeningen `schoutshuis` ook, hernoemd, niet opnieuw gerenderd), wie velden
  plant heet `speler`, en het opslaan gaat naar versie 16. **5d de held valt, een ander staat op**, in elk dorp: een
  veteraan, anders wie het langst soldaat is (een soldaat onthoudt sinds wanneer), anders de eerste die soldaat wordt; een
  bericht met de plek; "Fallen" is weg en het spel gaat door. **B1** hij houdt zijn uiterlijk en zijn wapen, en telt niet
  meer mee in het wachthuis (geen dienst). **C2** zijn gezin trekt in het town hall, en het gezin van wie viel, trekt in
  zijn huis (ze ruilen; had hij geen huis, dan is het oude gezin dakloos, zoals na afbreken). Blijft staan: de overgang
  tussen de kaarten van Tiled en de kamers met deuren (alleen op de proefkaarten; `opmerkingen.md`, ronde 4).
- **171, de groepsleider met de lantaarn** (Marcel, 16 okt, na stap 5, waar de held zonder lantaarn 's nachts prooi werd
  voor de wolven: **"elke groep soldaten heeft een groepsleider die een lantaarn draagt"**). **De regel en het licht
  zijn af** (16 okt, in `main`; `spel.md`, "Zo werkt de held nu"; `code.md` bij `js/soldaten.js`), en **de proefplaat van
  de lantaarn in de hand is goed** (Marcel: "goed zo voor nu"; `beeld.md`, "De lantaarn van de groepsleider";
  `gereedschap/pixelart/lantaarn.cjs`), en **het lantaarntje in de hand is af** (16 okt, in `main`; `beeld.md`, "Hoe het spel hem tekent"; `code.md` bij `js/sprites.js`): het vel in
  `beelden/lantaarn.png`, de handen in `beelden/handen.js`, en het tekenen in `js/tekenen.js` (`tekenLantaarn`). Het licht
  om de drager is op het scherm kleiner dan voor de regel (Marcel: "het licht is beetje lelijk, het ligt vóór het
  poppetje", en koos **L3** uit vier proeven: een plas van 1,5 tegel en 0,35 fel, `beeldStraal` in
  `T.ZIEN_INSTELLINGEN.lantaarn`; de wolven blijven op 3 tegels). Gekozen voor het tekenen (Marcel, 16 okt: "A1, B1"): **A1** wie een hand in de zij heeft (boer 5
  en 23, boerin 3), draagt de lantaarn aan die hand, op de heup; **B1** het schommelen bij het lopen in drie standen die
  vooraf gerenderd zijn (scheef naar links, recht, scheef naar rechts), naar de stap, zodat het scherp blijft. **Besloten** (Marcel, 16 okt: "A1, B1, C1, D2"): **A1** een groep zijn de soldaten van één
  wachthuis, en de leider is wie het langst dient; **B1** de lantaarn is licht, zoals bij de bode (de wolven vallen
  niemand in het licht aan); **C1** de aanvoerder draagt er ook een; **D2** een lantaarn in zijn hand op het figuur (eerst
  in woorden, dan één proefplaat, `beeld.md`).
- **6, samen spelen:** de vensters zetten de tijd niet meer stil (E1), en wat erin gebeurt (de handel, de velden, het
  slachten, de heer, de wetten, de raadsman, de brieven, de bode), de snelheid en het debugvenster worden opdrachten,
  zoals bouwen al is (stap 0); twee spelers (vraag C), eerst over onze eigen server (`npm start`, twee browsers), later over
  Steam; meedoen is het opgeslagen spel krijgen (alles staat al in `S`), en een controle dat de werelden gelijk blijven.
  **Wat de code nu aanneemt** (16 okt, gezocht): **één dorp per kaart**, op zo'n twintig plekken: `T.dorpHier` vindt
  hét dorp van een kaart, `T.isVanJou` en `T.isMan` tellen elke bewoner op de kaart als de jouwe, een vijand is alleen een
  monster (`T.isVijandig`), en het plein, het kamp, de markt, de plek van de marskramer, het bouwbereik en de mist
  (`w.gekend`) liggen één keer op de kaart; de maker maakt voor elk dorp een eigen kaart (`wereldVanPlan`), al kent het
  eiland meer dorpsplekken (`E.plekken`). Verder **leest de wereld wat per computer verschilt**: `S.dorp` (de quests,
  wie het land openmaakt), `S.wereld` (wie loopt) en `S.modus === 'verkennen'` (de oogst, het veldwerk, de wolven en het
  dwalen lopen in `T.wereldTik` alleen als er geen venster open is); **de spelregels** onthoudt elke browser zelf, en ze
  gaan niet mee in een bewaard spel; en **de server** luistert alleen op deze pc, en schrijft bestanden voor het gereedschap.
  **Het plan** (Claude, 16 okt; **besloten**, Marcel: "A1 b1 c2 d1"), in drie delen, elk met toetsen en elk ook los te
  spelen: **6a één kaart, meer dorpen**: elk wezen weet van welk dorp het is, `T.isVanJou` en `T.isMan` vragen het dorp,
  en een vijand is ook wie van een ander dorp is; wat nu één keer op de kaart ligt en van één dorp is (het plein, het
  kamp, de markt, het bouwbereik, de mist), gaat naar het dorp; elke tik werkt elk dorp (de oogst, het veldwerk, het
  dwalen), en wat van de kaart is (de wolven, het lopen) één keer; de maker legt een tweede dorpsplek op dezelfde kaart.
  `S.dorp` is dan alleen nog scherm (wat jij ziet, jouw mist, jouw berichten), en de wereld leest het nergens meer. Te
  proberen in één browser: `Spel.debug.wissel()` maakt jou het andere dorp. Het is ook de grond voor het kasteel van de
  heer (vraag 126), als dorp op het eiland. **6b alles een opdracht**: wat in een venster de wereld verandert (de handel,
  het slachten, de heer betalen, de wetten, de velden, de knoppen van een brief en een gril, de bode), de snelheid en het
  debugvenster; de wereld leest `S.modus` niet meer. Wie alleen speelt: een venster zet de tijd nog stil (E1); samen niet.
  De snelheid is een wens per dorp, de laagste geldt, pauze kan ieder, en een gevecht ergens zet iedereen op 1×. **6c de
  lijn**: de server geeft de opdrachten door (zonder nieuw pakket: `EventSource` en `POST`); een opdracht gaat in op een
  vaste tik even later (zo'n zes tikken, een tiende seconde), en een computer die de ander voor die tik nog niet hoorde,
  wacht; elke seconde een controlegetal van de wereld. Meedoen is het bewaarde spel krijgen, met de spelregels en de
  stand van de code erbij (die moeten gelijk zijn), en zolang je samen speelt, staan de spelregels vast. Eerst twee
  browsers op één pc (de server blijft op deze pc); voor een tweede pc in huis een schakelaar die alleen het spel en de
  lijn openzet, nooit het schrijven van het gereedschap. Samen in dezelfde browser (Chrome met Chrome): een sinus mag per
  browser in het laatste cijfer verschillen, en dan lopen de werelden uiteen; Steam heeft er één. Steam vervangt later
  alleen de lijn. **Te kiezen:** **A** waar de tweede begint: A1 op een andere dorpsplek van hetzelfde eiland, de
  dichtste die minstens zoveel tegels weg is (de werkbank, voorstel 200); A2 dichtbij (binnen 100 tegels: je ziet elkaar
  meteen); A3 de eerste kiest op de minikaart. **B** meedoen: B1 het spel begint als je er allebei bent (de een opent, de
  ander komt erbij, en allebei rijden jullie op dag 1 met de huifkar binnen), en wie wegvalt, komt terug met het bewaarde
  spel; B2 meedoen kan altijd, en het tweede dorp begint als hij erbij komt. **C** wie vanzelf vecht: C1 een soldaat valt
  de soldaten en de aanvoerder van de ander aan die hij ziet (zoals een rover), een dorpeling van de ander alleen als je
  hem aanklikt, en een dorpeling vlucht voor de soldaten van de ander naar zijn town hall; **C2** (gekozen) alles van de
  ander vanzelf, ook zijn dorpelingen: een soldaat valt elk mens van een ander dorp aan dat hij ziet; C3 niets vanzelf, alleen op bevel. **D** als de werelden toch uiteenlopen: D1 het spel staat even
  stil, schrijft op waar het verschil zat (voor ons), en de eerste stuurt zijn wereld opnieuw, zoals bij meedoen; D2 het
  spel stopt. Het voorstel van Claude was A1, B1, C1, D1, met erbij (zeg het als het anders moet): één heer voor allebei,
  met per dorp zijn gunst en zijn brieven (zoals nu al); de marskramer komt bij elk dorp op zijn eigen plek; je bouwt niet
  in het bereik van de ander; wie het spel opende, bewaart het (allebei de dorpen); en gebouwen van de ander aanvallen of
  in brand steken komt er nu niet bij (`opmerkingen.md`).
  **De lobby** (Marcel, 16 okt, na 6a: "We hebben ook een menu nodig met een lobby etc. Of gebruiken we dat van steam"):
  Steam geeft de lobby als dienst, niet het scherm; besloten in 6d (hieronder, in een andere sessie): ons eigen scherm
  onder *Play together*, met Steam eronder, voor vrienden.
  **De wereld van iedereen** (Marcel, 16 okt, na 6a: "Maar het moet echt full multiplayer worden. Niet 2 spelers op 1
  map. Het wild is van iedereen. Wolven etc. Rovers trekken rond en hebben kampen. Echt losse spelers met hun eigen dorp";
  **besloten**, Marcel: "W1, R1, Rb, maar dit wisselt ze leren, N1, V1"). Wat Claude in 6a koos, gaat om: daar hoorden de wolven, de herten en de rovers bij een dorp (rond
  zijn plein gezet, door zijn tik bewogen, met zijn dobbelsteen). **Het voorstel** (Claude, 16 okt), een stap 6a2 vóór 6b:
  het eiland krijgt **wezens van de wereld**, zonder dorp, die de wereld één keer per tik bijwerkt met haar eigen
  dobbelsteen (uit het nummer van het eiland); een dorp werkt alleen nog zijn eigen mensen, kar en vee bij. **Het wild**:
  de roedels en de kuddes wonen in het bos van het eiland, niet om een dorp; ieder jaagt erop, en een wolf valt aan wie in
  zijn buurt komt, van welk dorp ook (de mannen van dat dorp komen helpen). **De rovers**: het eiland heeft roverskampen
  (een nieuwe soort plek, ver van de dorpen en de wegen), elk met een bende die over de wegen trekt, een dorp beloert,
  rooft, en met de buit terug naar haar kamp gaat; een kamp kun je aanvallen en opruimen; wie uit een dorp wegtrekt, kan
  bij een kamp gaan. De heer is er al één, met zijn kasteel, tegen iedereen; de marskramer komt nog bij elk dorp apart.
  **Losse spelers**: elk zijn eigen computer en zijn eigen dorp, en hij ziet alleen het zijne (6c; `Spel.debug.wissel()`
  is alleen gereedschap om het te proberen). Te kiezen: **W** het wild: W1 over het hele eiland, gezet waar het land open
  gaat (zoals het land zelf); W2 alleen in de bossen rond de dorpen, maar van iedereen. **R** de rovers: R1 een vast aantal
  kampen uit het nummer van het eiland, en een kamp dat je opruimt, blijft leeg (het eiland wordt veiliger door te
  spelen); R2 een opgeruimd kamp komt na een tijd ergens anders terug; en wie ze beroven: Ra het dorp dat ze het eerst
  tegenkomen; Rb het dorp met het meeste graan en de minste soldaten. **N** hoeveel spelers: N1 twee in de demo, en later
  zoveel als er dorpsplekken zijn (acht per eiland); N2 al acht in de demo. **V** de volgorde: V1 de wereld van iedereen
  eerst (6a2), dan 6b en 6c; V2 eerst samen spelen (6b, 6c), dan de wereld. Gekozen: W1, R1, Rb (en ze leren), N1, V1.
  **Het plan voor 6a2** (Claude, 16 okt, op die keuzes; **besloten**, Marcel: "K1 en L1"), in vier stukken, elk
  met toetsen: **a, de wereld werkt haar eigen wezens bij**: een wezen zonder dorp is van de wereld, en de wereld werkt het
  één keer per tik bij, met haar eigen dobbelsteen (`w.lot`, uit het nummer van het eiland); een dorp alleen nog zijn eigen
  mensen, kar en vee (`T.hoortBij` wordt streng); wat de wereld van de dorpen wil weten (hun licht voor de wolven, hun
  mannen die komen helpen, of ze vechten), vraagt ze aan het dorp van wie het aangaat. **b, het wild van het eiland**
  (W1): roedels en kuddes uit het nummer van het eiland, per stuk gezet als het land daar opengaat (zoals de bomen), in het
  bos; ieder jaagt erop, een wolf valt aan wie in zijn buurt komt, en de mannen van dat dorp komen helpen; het zetten om
  een dorp (`T.zetBeesten(D)`) gaat eruit. **c, de roverskampen** (R1): het eiland krijgt een nieuwe soort plek, het
  roverskamp, ver van de dorpen en de wegen maar te bereiken; zoveel per eiland als de werkbank zegt (voorstel 3), elk
  met een bende van een paar rovers en tenten met een vuur (de tent en het kampvuur van het lege begin, in een andere
  kleur: geen nieuwe tekening, wel eerst een proefplaat); een kamp waarvan de bende verslagen is, verdwijnt en komt niet
  terug, en wie uit een dorp wegtrekt, gaat naar het dichtste kamp (de bende van nu); de wilde rovers die aan de rand van
  je land opdoken, gaan eruit. **d, de rooftocht** (Rb, en ze leren): om de zoveel tijd (de getallen van nu: twee keer per
  jaar per kamp, de helft 's nachts) kiest een kamp een dorp: het dorp met het meeste graan en de minste mannen, gewogen
  met wat het kamp onthoudt: wie hen afsloeg (verliezen, geen buit), slaan ze een tijd over, waar het makkelijk was, komen
  ze eerder terug; het geheugen vervaagt. Ze trekken over de wegen, roven een akker (zoals nu), en gaan met de buit terug
  naar hun kamp. Te kiezen: **K** de buit: K1 wie een kamp opruimt, vindt wat er nog ligt (het geroofde graan en goud);
  K2 de buit is weg. **L** hoe ze leren: L1 zoals hierboven, per dorp een getal dat stijgt na een makkelijke tocht en
  daalt na een slechte, en terugzakt naar het midden; L2 alleen onthouden waar het misging (een dorp met soldaten mijden ze
  een seizoen). Gekozen: K1, L1.
  **Stuk a in detail** (Claude, 16 okt; **besloten**, Marcel: "A1"): het wild is van niemand; de wereld werkt het één
  keer per tik bij (na de dorpen) en één keer per nacht (honger, jagen, jongen, splitsen, verhuizen). Wat het van een
  dorp wil weten, vraagt het aan het dorp van wie het aangaat: wie schrikt, verliest werk voor zijn eigen dorp; een prooi
  is een schaap of wie alleen in het donker is, van welk dorp ook; wie om hulp roept, krijgt de mannen van zijn eigen dorp,
  en het bericht, het gevecht en de 1× zijn van dat dorp; een jager schiet elk hert in zijn bereik. Waar het wild woont,
  blijft tot b (om elk dorp gezet), de rovers blijven tot c bezoekers van het dorp dat ze beroven. **A1**: elke roedel en
  kudde gooit met een eigen dobbelsteen uit zijn zaad, `w.lot` is voor wat de wereld zelf kiest (c); zo verandert wat bij
  jouw dorp gebeurt niet door een gevecht ver weg. Erbij (zeg het als het anders moet): licht is licht (ook de lantaarn
  van het andere dorp), wie iemand naast zich heeft is niet alleen (van welk dorp ook), de status "Wolves" gaat over de
  roedels in het land van het dorp, en een oud bewaard spel laadt niet meer (de versie omhoog).
  **Stuk b in detail** (Claude, 16 okt; **besloten**, Marcel: "D1 e1"): gaat een stuk land (64 bij 64 tegels) open, dan
  krijgt het zijn wild, zoals zijn bomen: hoeveel en welke uit het nummer van het eiland en van het stuk, waar uit het land
  zoals het dan is. Zoveel als nu per tegel bos (een roedel per 700, een groepje herten per 400), per stuk hooguit twee
  roedels en drie groepjes; het thuis diep in het bos van zijn stuk, de wolven aan de rand met het dichtste dorp in zicht
  (als er een in de buurt is), anders bij hun hol. `T.zetBeesten(D)` gaat eruit; de kaart onthoudt welke stukken hun wild
  kregen. Wild ver van iedereen (zo'n 80 tegels) blijft thuis, zijn nacht loopt door. **D1:** overal even dicht, alleen naar
  het bos (D2 een rustiger begin, D3 wilder naar het binnenland). **E1:** wordt het bos van een groep te klein, dan trekt
  hij weg en is weg, zoals nu (E2, naar het dichtste open bos met plaats, ook bij een ander dorp, staat in
  `opmerkingen.md`). Erbij: een thuis 18 tegels van elk ander, ook over de grens van een stuk; de jager schiet wat in zijn
  bereik is; het opslaan een versie omhoog.
  **6a is af** (16 okt, in `main`; `spel.md`, "Zo werken meer dorpen op één eiland nu"; `code.md`
  bij `js/dorp.js`, "Meer dorpen op één kaart"; `test/meer-dorpen.test.cjs`). Wat erbij kwam: een wezen en een veld dragen
  hun dorp (`e.dorp`, `a.dorp`), elk dorp werkt alleen zijn eigen bij (`T.hoortBij`), de plek en de mist staan in het dorp
  (`D.plek`, `D.gekend`), het lopen gaat één keer per kaart, de maker legt een tweede plan op dezelfde kaart
  (`T.legDorpOpKaart`, `T.dorpErbij`), en `S.dorp` is alleen scherm; een vijand is ook wie van een ander dorp is (C2). Wat
  nog op `S.modus` leunt (`T.wereldTik`), gaat in 6b weg.
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

**6d, de menu's voor samen spelen: besloten** (Marcel, 16 okt: "1. A 2. A 3. A 4. B 5. A", en daarna bij 4: "Ik wil
ook dat degene die het spel opstart het spel opslaat", dus 4a; het voorstel van Claude in sessie
`ccr-85982f04-49h797`). Het plan voor stap 6 (6a tot 6c; 6a is in `main`, en 6a2, de wereld van iedereen, komt ervoor) gaat over de techniek;
dit is het scherm erbij. Vraag A van dat plan is daarmee gekozen (A1), en het opslaan gaat zoals daar voorgesteld.
- **Het titelscherm** krijgt *Play together*: dezelfde kaart als *New game* (de naam van je dorp, het land), uitgebreid
  tot de lobby. Wie opent, kiest het land en de spelregels (vast zodra je begint); ieder typt de naam van het eigen dorp
  en zegt *Ready*, en wie opende, drukt *Begin*. Is de stand van de code anders (`T.STAND`), dan zegt de lobby dat
  meteen. Wie meedoet, ziet het ontvangen van de wereld, met een balk.
- **1a de startplek vanzelf** (A1), te zien op de minikaart in de lobby.
- **2a een kleur per speler**, te kiezen in de lobby: een vaantje bij de soldaten, en die kleur op de minikaart. Eerst in
  woorden, dan één proefplaat (`beeld.md`).
- **3a gaat de ander weg**, dan pauzeert het spel, met *Wait* of *Play on* bij wie overblijft. Het andere dorp leeft
  vanzelf door (de dorpelingen werken vanzelf, de soldaten blijven op hun post), en wie wegging, komt terug met een
  uitnodiging: de wereld en het eigen dorp.
- **4a alleen wie het spel opstartte, slaat op**: allebei de dorpen, en wie het andere dorp speelde, ook het vanzelf
  opslaan. Wie zo'n spel laadt, opent de lobby en nodigt de ander uit, die het eigen dorp terugkrijgt.
- **Het menu onder Esc, samen:** *Resume*, *Pause for both* (bij allebei staat wie pauzeerde; E1), *Save* (bij de ander
  grijs: *The host saves this game*), *Game rules* (alleen lezen), *Photo mode*, en *Leave game* in plaats van *To the
  title screen*; *Load* is grijs, met de reden.
- **5a eerst onze eigen lijn** (6c: `npm start`, twee browsers), Steam in januari, met het eigen App ID en de
  Steam-pagina (G). Het menu weet niet welke lijn er is: *Invite a friend* geeft bij onze server een code, op Steam de
  overlay. Op Steam: een lobby voor vrienden, voor twee, met het zaad, de stand en de spelregels erin; uitnodigen met de
  overlay of *Join game* in de vriendenlijst (draait het spel niet, dan start Steam het, met de lobby); wat je doet, in de
  vriendenlijst (*rich presence*); de verbinding via de relays van Steam, zonder eigen server. In Electron met
  `steamworks.js`, in het hoofdproces met een smalle brug naar het spel, niet met `nodeIntegration` (`verpakken.md`).
  Testen vraagt twee pc's met Steam en twee accounts; vanuit de cloud kan Claude dat niet.
- **Voor 6c, nog open** (Claude): een opdracht die zes tikken later ingaat (een tiende seconde), kan over internet te
  kort zijn (Age of Empires nam 200 tot 500 ms), en dan hapert het spel. Beter een getal in de werkbank, of een
  vertraging die meegroeit met wat de lijn meet.

## J. Een volledig menu (vraag 172, 16 okt)

Marcel, 16 okt: **"We hebben een volledig menu nodig geen a.i slop"**. Wat Claude zag: het titelscherm is een stapel
gelijke, donkere, doorzichtige kaders met ronde hoeken, een gouden rand en kleine grijze bijschriften, met koppen in
kleine hoofdletters met spatie ertussen; zo ziet elke webapp eruit, en niets komt uit het spel. Het menu onder Esc is zes
even grote kaders. Er mist wat een spel op Steam heeft (instellingen, credits, afsluiten), en onder *Game rules* staan
echte spelregels door elkaar met keuzes voor het beeld (*Drawing*, *Shadows*, *Seeing through a house*). Er is nog geen
geluid, dus geen schuif voor het volume: een knop die niets doet, is precies wat Marcel niet wil.

**Besloten** (Marcel, 16 okt, op vier vragen van Claude):
- **De stijl: tekst over de wereld.** Geen kaders: links het woordmerk en de keuzes als tekst, over een donker verloop,
  en rechts glijdt de camera over het land; bij de muis een vaantje. De vensters erachter (laden, instellingen, het menu
  onder Esc) op het papier van de balk en de briefjes: één taal.
- **Erin:** *Settings* (het beeld en de toetsen), *New game* als eigen scherm (de naam, het land, de spelregels), en
  *Credits* en *Quit* (*Quit* alleen in de Steam-versie). Laden blijft een lijst, zonder kaarten en verwijderen.
- **De spelregels liggen vast bij het begin:** je kiest ze bij *New game*, en in het spel kun je ze alleen lezen; zo
  werkt het ook samen (6d). Ze gaan dus mee in het bewaarde spel (`S`), en niet meer in de browser.
- **Het woordmerk in pixel art uit code:** eerst in woorden, dan één proefplaat (`beeld.md`); ook voor de Steam-pagina
  (`commercieel.md`, "De capsule en het logo").

**Stap 1 tot 6 zijn af** (16 okt, in `main`); stap 7, de proefplaat van het woordmerk, wacht op
Marcel (`beeld.md`, "Het woordmerk").

**172b, instellingen zoals in een echt spel** (Marcel, 16 okt, na stap 1 tot 6: **"Zaken als resolutie etc hebben we
nodig"**). **Besloten** (Marcel, 16 okt, uit het voorstel van Claude): de vensterstand en het formaat, de beelden per
seconde (en de meter), pauze als je wegklikt, hoe vaak het vanzelf opslaat, en de helderheid; Settings in tabbladen. Niet
gekozen: de schaal van de wereld en de balken, de tekenresolutie, en het scrollen langs de rand. De uitwerking (Claude):
- **Tabbladen:** *Display* (het venster, het formaat, de beelden per seconde, de meter, de helderheid), *Graphics* (wat
  er al was: de tekening, de schaduwen, de doorkijk, de bomen, het kleine leven, de kleren), *Game* (pauze als je
  wegklikt, vanzelf opslaan, de raad, de taal), en *Controls* (de toetsen).
- **Resolutie:** in Electron is het hele scherm altijd zonder rand, op de resolutie van je scherm (Electron kan de
  monitor niet omzetten, en een spel van nu doet dat ook niet meer); in een venster kies je het formaat (1280×720 tot
  3840×2160, alleen wat past). Een smalle brug in de schil (`gereedschap/proefversie/maak.cjs`, een preload), zoals
  `verpakken.md` vraagt. In de browser alleen het hele scherm aan of uit.
- Alles zijn opties met `instelling` (`js/opties.js`), zodat de browser ze op één manier onthoudt.
- **Af** (16 okt, in `main`; `code.md` bij `js/instellingen.js`, `verpakken.md`, "Het venster en
  de brug"), en in Electron 44 voor Linux getest (het hele scherm, een venster van 1280×720, terug, en Quit).

**Het plan: besloten** (Marcel, 16 okt: "Ja, bouw het zo", en voor het woordmerk "Gebroken goud"):
1. **Het titelscherm:** links een donker verloop met het woordmerk, de keuzes als tekst in Grenze (*Continue* met het
   dorp, de dag en de mensen eronder, *New game*, *Load*, *Settings*, *Credits*, *Quit*), een vaantje bij de muis, en
   kiezen met de pijltjes en Enter; de camera legt het land rechts naast de tekst. *Play together* komt erbij met 6d.
2. **De vensters op papier:** het menu onder Esc, *Load*, *Settings* en *Credits*, met regels in plaats van kaders. Onder
   Esc: *Resume*, *Save*, *Load*, *Settings*, *Game rules* (lezen), *Photo mode*, *To the title screen*, *Quit*.
3. ***Settings*, met één regel:** wat de wereld raakt (de tik), is een spelregel; wat alleen het beeld is, een instelling
   (lockstep: samen dezelfde regels, ieder zijn eigen beeld). Naar *Settings*: *Drawing*, *Shadows*, *Seeing through a
   house*, *Who you see through a house*, *Trees through the year*, *Small life*, *Clothes* en *Advice*; erbij
   *Fullscreen*, *Language* (van het titelscherm) en de toetsen.
4. ***New game*:** de naam van je dorp, het land (het nummer, *Other land*, het eiland op een kaartje), de spelregels
   (*Standard*, of *Custom*), en *Begin*.
5. **De spelregels in het bewaarde spel** (`S.spelregels`); een oud spel krijgt wat de browser had. De werkbank blijft
   van de browser, en in het debugvenster (D) kun je de spelregels midden in een spel omzetten, om te proberen.
6. ***Credits*** ("A game by Marcel, made with Claude", de letters, OFL) en ***Quit*** (alleen in Electron).
7. **Het woordmerk:** *TITHEBREAKER* in eigen kapitalen van pixels, zo'n 20 hoog, op 3×; het goud van de heer (oker,
   licht van linksboven, donkere rand), en tussen TITHE en BREAKER een barst: BREAKER zakt een pixel en kantelt iets,
   met twee splinters goud in de kier. Eén proefplaat; tot hij goed is, staat er de letter.

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
