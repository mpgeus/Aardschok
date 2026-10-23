# Werklijst: het blok "Nu en daarna" tot 23 okt

Op 23 okt is het blok "Nu en daarna" bovenaan `ontwerp/werklijst.md` gesnoeid tot wat loopt, wat op Marcel wacht en wat
erna komt (Marcel, 23 okt: "Ja, snoei het"; het was 450 regels, en elke sessie leest het als eerste). Hier staat het
zoals het toen was, letterlijk: de geschiedenis van 11 tot 23 okt, met wie wat koos. Het hoe staat in het ontwerpbestand
van elk onderwerp, en alles ook in git.

## Nu en daarna (14 okt, tot 23 okt)


**Sinds 18 okt eerst de basis** (Marcel: "O1: c3 en de wereld van iedereen parkeren. Eerst het doel van de demo kiezen,
dan de heer als klok, dan een speelbaar eerste jaar"; zijn vraag: "Het lijkt mij dat bodes en rovers pas later komen
nadat de basis goed ligt?"). Geparkeerd: de rest van I (c3, c4, d, samen spelen in 6b en 6c), de muren en het kasteel; de
wilde rovers blijven zolang de dreiging. **Het doel van de demo is gekozen: D2, met weigeren** (Marcel, 18 okt: "Ik denk
dat het leuk is om D2 te doen, je kunt dan weigeren, maar dan eindigt het met een korte cinematic waarin je het leger van
de heer ziet aankomen met death als gevolg"): de heer komt al in het eerste jaar op Sint-Maarten zijn tiende halen, en
daar eindigt de demo; weiger je, dan zie je in een korte cinematic zijn leger aankomen, en het eind is de dood. **Betaal
je, dan eindigt ze ook** (Marcel, 18 okt: "maar zie je een cinematic waar je de heer en zijn mannen met karren goederen
en goud ziet wegrijden"; de keuzes waren P1 ook een eind, P2 doorspelen). **Het volgende is E**, de heer als klok, op
dat doel: het plan staat bij E, besloten (Marcel: A1 met drie maanden, B2 voor het hele spel, C2); stap 1 tot 3, 5 en 6
zijn gebouwd en staan in `main` (gepusht 20 okt). **Stap 4, de scènes, is gebouwd** (20 okt, in `main`;
Marcel: "A1 B1 C1"): met de tekeningen die er zijn, in de wereld (het leger
loopt echt over de weg, de wagen van de heer laadt echt), en een regie erover (`js/regie.js`); bekijken: stap 7 van de
speellijst (`speelbaar.md`). De tekeningen (de heer te paard, zijn wagen, de vaandels, de fakkels) komen met **vraag 180** (de
eigen pijplijn voor de beelden; stand op 19 okt: ERNIE-Image-Turbo schildert het rijkst, `gereedschap/ai/ai-afwerking.md`).
**Q, het eerste jaar speelbaar, is gebouwd** (vraag 181, 20 okt, in `main`): minder vast in het bos (d), de wacht en het slot in de demo (e), vee in het lege begin (b), geen visser of
rietsnijder zonder water (c), en de speellijst (a). **Wacht op Marcel** (hieronder): het demojaar spelen met de
speellijst, en wat scheef zit eerst met een getal uit de werkbank. Ernaast, lokaal op Marcels pc: betere poppetjes met
de pijplijn van vraag 180 (Q, f; niet in de cloud). **Bezig in sessie `lokaal-dac05521`** (20 en 21 okt, op Marcels pc):
**nieuwe weg** (Marcel, 21 okt: "Ok, dan zullen we moeten inventariseren welke gebouwen en poppetjes we nodig hebben. Dan
kunnen we de andere generator deze 1 voor 1 laten maken. Jij moet dan zorgen dat ze passend worden in het spel"): de
generator van zijn plaat maakt de bron, wij maken het passend; eerst de inventaris (`beelden-van-de-generator.md`). De
speerman staat en loopt in het spel in acht richtingen (21 okt, de masterprompt); de aanval in alle acht richtingen en alle 25 vellen staan erin, lopen O, W en NO opnieuw met bewegende benen en de bouw van vel 1, aanvallen O, ZW en NO opnieuw zodat de punt op spelafstand het lijf raakt (22 okt; de speer steekt opzij van ernaast, verder van twee tegels, `steekReik`), en alle aanvallen in de stijl van vel 1; **wacht op Marcel, als eerste op 23 okt** (Marcel: "morgen laatste 3 pakken we als eerste op"): vallen NO, O en ZO (vel 23 tot 25) in de stijl van vel 1, met de prompts in `beelden-van-de-generator.md` (18 tot 22 zijn binnen), `beelden-van-de-generator.md` (in
het nieuwe gesprek, `beelden-van-de-generator.md`), en eventueel 3 en 4 opnieuw (de punt naar achteren).

**Marcels acht punten van 20 okt** (R, vraag 182 tot 189: egaliseren met de schop, de maat van de huizen, dragers, een
overval in de demo, punten, een campagne met een editor, skirmish, en wat er van het middeleeuwse leven mist): **besloten**
(bij R, "Besloten"), met de volgorde: 2a1, dan 184 met 182, dan 185 en 186; 187 en 188 na de demo, nu het ontwerp.
**183 in één keer, bij Marcel** (20 okt): de maat (65 procent) en de werkplaatsen in de huizenbouwer liggen klaar achter
de schakelaar `NIEUW` in `huizen.cjs`; Marcel rendert eerst de poppetjes en de stijl, dan alle huizen in één keer, met de
negen stappen bij R, 183. Daarna 184 met 182 (dragers en egaliseren). **Bezig in sessie `claude/gracious-pascal-llq8tv`**
(23 okt): 184 met 182, de regels, met figuren die er al zijn (de art ligt vandaag stil).

**Performance heeft hoge prioriteit** (Marcel, 17 okt: "maak van performance een hoge prio, spelers haken af als dat
niet op orde is"; CLAUDE.md, "Hoe we kiezen"). **Het tekenen is af** (17 okt, in `main`): de opdrachten aan de
videokaart, het filter in de mist, elk voorwerp onthoudt zijn plaatje, ronde 1 en 2 van elk plaatje goedkoper, en alleen
het veranderde stukje grond opnieuw. De meter in Firefox (17:56, Crowthorpe): ver uitgezoomd vol bos 11,7 ms tekenen en
60 beelden per seconde (eerst 55 ms en 16); op 30× met bouwers die rooien 58 beelden per seconde, het traagste beeld 33
ms (eerst 100 à 117). Optie 2, het bos in de mist in de grondbuffer bakken (dan wuiven de bomen in de mist niet meer),
blijft staan voor zwakkere machines zoals de Steam Deck, maar zou het haperen bij gevelde bomen erger maken. Hoe en wat
het mat: `code.md` bij `js/gl.js` en `js/sprites.js`, en `opmerkingen.md`.

**Ver uitgezoomd moet veel sneller** (Marcel, 17 okt: "Maar de perfomance moet echt wel veel beter"; vraag 178, bij P).
**Stand op 18 okt, alles in `main`** (`snelheid.md`, met de metingen; `code.md` bij `js/gl.js` en `js/tekenen.js`): A1
en A2, de renderproef (`js/gl.js` houden en naar WebGL2, niet naar Pixi of WebGPU), B5 met B3 en E1 (WebGL2, een plaatje
als instantie, een textuurstapel, de schaduwen uit dezelfde plaatjes), B1 en B2 (de bomen en het groen per stuk land in
een vaste rij op de kaart, met de wind, de mist en de schaduw in de shader en de volgorde uit een dieptebuffer), en de
regen en het masker van de mist op de kaart. Helemaal uitgezoomd (0,35, het proefdorp, Chromium met de videokaart) van
zo'n 30 ms per beeld vóór A1 naar 4,4 ms met de kaart erbij, waarvan 1,7 ms voor de processor; en steeds hetzelfde beeld.
WebGPU helpt hier niet meer (Marcel vroeg het; `snelheid.md`, "Na B1 en B2"). **Wacht op Marcel**: meten in Firefox
(hieronder, "Wacht op Marcel"); daarna eventueel D1 (de haperingen) of E3 en E4 (die zie je: eerst een proefplaat).
**De tik is sneller** (18 okt; `snelheid.md`, "De tik"; alles onder "Af"): middernacht 13,6 naar 3,3 ms (H1 tot H3), de
gewone tik 1,8 naar 0,8 ms (G1 en G2), het vooruit maken van het land onder 3 ms per stap (F1), en na het laden eerst
het land, met de voortgang in het menu (F2). **H4 en de meter met de videokaart zijn af** (onder "Af"; in Edge, 18 okt,
Marcels pc, 30×, nacht en regen, half uitgezoomd: 60 beelden per seconde, regels 0,7 ms, tekenen 2,6, de kaart 2,8). **Na
H4: de grond** (Marcel, 18 okt: "Maak notitie voor na h4"; `snelheid.md`, "Het advies van buiten"): de
grond is het laatste wat de processor nog bakt, en elke stap met het wiel en elk ander seizoen tekent hem helemaal
opnieuw. **Gemeten** (18 okt; `snelheid.md`, "Gemeten"; `Spel.debug.meetGrond()`): op 0,35 bij het dorp één beeld van
83 tot 100 ms vlak, en met heuvels 300 tot 335 ms; een stand sneeuw op de grond (elke middernacht in de winter) 283 ms
vlak en 340 met heuvels. **Het spreiden is af** (18 okt, Marcel: "Doe eerst het spreiden"; `snelheid.md`,
"Spreiden"): een stap met het wiel is nu 8 tot 14 beelden van hooguit 34 ms vlak en 90 met heuvels, pixel voor pixel
hetzelfde eindbeeld; Marcel zag de haperingen ("in en uitzoomen zorgt nu wel voor spikes in de fps"). **De
renderproef van de grond is af** (18 okt, onder "Af"; `snelheid.md`, vanaf "Het plan voor de renderproef van de
grond"): de grond ligt op de videokaart, en dat is de standaard (Marcel: "ja dat gaat perfect, dit wordt de nieuwe
standaard"). **Wacht op Marcel**: meten in Firefox. **Later: de world gen bijstellen** (Marcel, 18 okt: "We moeten
later nog wel wat tweaken aan de world gen"; wat precies, zegt Marcel). Later F3, F4 en F6 (het voorstel onderaan "De tik"). Niet in de browser nagekeken: de headless Chromium in de cloud loopt vast zodra de spellus draait
(`opmerkingen.md`).

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
**Stap 1 tot 4 zijn af** (14 okt, in `main`; hoe het werkt: `spel.md`, "Zo werkte de kar", en sinds 23 okt "Zo werken de dragers nu"): alles wat een gebouw
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
volgende is stuk c**, de roverskampen: het plan bij I is besloten (Marcel: "V2 G2 P1 B1", en sturen naar land dat je
niet kent). **c0, L1, de bruggen en vraag R zijn af** (17 okt, in `main`): rechts op land dat je niet kent, in beeld of
op de minikaart, en je mannen gaan erheen (`spel.md`, bij "Op tocht"); elke weg heeft zijn brug en loopt erover, zodat
alle dorpsplekken, de stad en het kasteel te voet in één stuk land liggen (L1, `code.md` bij `js/eiland.js`); en de
bruggen zijn in het spel: drie tegels breed (schuin vier rijen, haaks over het water), oud, steen of hout naar de plek,
en wie erop loopt gaat mee omhoog (`beeld.md`, "De bruggen", met Marcels punten op de stenen, de oprit en het wegdek).
**c1, de kampen op het eiland, is af** (17 okt, in `main`; Marcel: "M1"; `spel.md`, bij "De roverskampen"; `code.md`
bij `js/eiland.js` en `js/rovers.js`): drie per eiland in het woud, elk met een open plek, een vuur, een tent per twee man
(de tent T1, nu in het vel) en een paadje naar de dichtste weg; ze staan er als hun land opengaat, en wie ze zag, ziet
ze rood op de minikaart. **c2, de bende, is af** (17 okt, in `main`; Marcel: "N1", "D1", "H2"; `spel.md`, bij "De
bende van een kamp"; `code.md` bij `js/rovers.js`): elk kamp leeft vanaf het begin, met twee man en een erbij per jaar
tot vier, wie wegtrekt gaat naar het dichtste kamp (ook boven de vier, tot zes tenten), overdag staan ze om hun vuur en
's nachts slapen ze in hun tent op één wacht na; de bende van een dorp is weg, en een overval is tot c3 wild. **Het
volgende was c3**, de overval uit een kamp: **geparkeerd** (Marcel, 18 okt: O1, bovenaan dit blok); het plan staat bij
I ("c3 in detail"), met de keuzes A, B en C nog open. **Marcel kwam op 17 okt met 174**
(bij L): de heuvels van vraag 121 staan nog standaard uit en zijn niet klaar voor het hele eiland. **Stap a, de
hoogte per stuk, is af** (17 okt), en **stap b ook** (17 okt, in `main`): het licht per stuk, elk dorp een vlakte, de
brug op zijn oevers, de mist op de heuvels. **Stap c, meten, is af** (17 okt; bij L): met heuvels ver uitgezoomd van zo'n
40 naar 30 ms per beeld, 2 à 5 ms boven vlak (ook in Firefox, Marcel mat het), en de kolonist speelt er een jaar mee.
**Het volgende is d**: de heuvels altijd aan en de spelregel *Height* eruit (wacht op Marcel, hieronder). Let op: CLAUDE.md zit tegen de grens van
20 KB; haal eerst iets naar een ontwerpbestand als er een afspraak bij moet.

**Marcel kwam op 17 okt met 176** (bij N): zicht in een dicht dorp, de aanpak van Stronghold (gebouwen plat, het
land lager, draaien, zoomen). **Stap 1, de proef, is af** (17 okt): plat laat in de dichtste straat alle inwoners en 83%
van de straat zien, gewoon 1 van de 6 en 8%. Plat wordt een weergave in het spel (stap 4, het plan en de keuzes bij N);
**4a is af** (17 okt; Marcel keurde de proefplaat goed): de platte tekening van elk huis, in `tegels/plat/`. Het
volgende is 4b, plat in het spel.

**Marcel kwam op 17 okt met 177** (bij O): de nabewerkte herberg is de nieuwe maat voor alle huizen, zonder ze een
voor een opnieuw te tekenen. **De eerste proef is af** (17 okt; `beeld.md`, "De nieuwe stijl"; de plaat
`gereedschap/pixelart/uit/stijlproef/plaat.png`): het riet zo rustig als het doel, in lagen met punten, de nok in
bundels, blauwe ramen, een plint met donkere voegen, zachtere schaduw en fijnere kleur, van vier kanten gelijk, even
duur. Wacht op Marcel (hieronder). **Huis1 is het tweede doel** (Marcel, 17 okt: "Neem de plaat als tweede doel");
de proefplaat is af (`beeld.md`, "Het tweede doel: huis1"; `uit/stijlproef/huis1/plaat.png`): de vorm blijft (het
silhouet op 284 pixels van de rafelrand van het riet na), maar het riet van huis1 vraagt het omgekeerde van de herberg.
**Marcel koos het riet van de herberg** (17 okt: "ik laat het dak van de herberg gebruiken"), **en het oude mos**: na een
proef met fijner mos langs de lagen (17 okt: "nee, het oude mos was beter"; `beeld.md`, "Het mos op verweerd riet").
Van het tweede doel blijft verder niets open.

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
- **Het demojaar spelen, met de speellijst** (werklijst Q, vraag 181, a; 20 okt): `speelbaar.md`, "De speellijst van het
  demojaar": van de huifkar tot Sint-Maarten in acht stappen, met alles wat hier om te bekijken stond (van 11 tot 20 okt),
  en wat buiten het demojaar valt eronder. Zeg per stap wat scheef zit.
- **Vraag 180: de weg naar de stijl van Marcels plaat, voor alles** (18 okt; `beeld.md`, bovenaan "Besloten";
  `voorbeelden/heerstoet-doel.webp`; Marcel: "DAT is wat ik wil voor alles", en onze render "lijkt er in de verste verte
  niet op"). De render uit code bijschaven haalt het niet. Te kiezen: **W1** beelden van een beeld-AI als bron (zoals de
  herberg met ChatGPT, vraag 177): elk ding in die stijl laten maken, en wij knippen ze en zetten ze in het spel; snel op
  dat niveau, maar acht kanten en loopbeelden die precies kloppen zijn het moeilijke deel. **W2** onze 3D-modellen als
  vorm, en een beeld-AI eroverheen per beeld (img2img met ControlNet, lokaal op Marcels videokaart): de kanten en de
  beweging kloppen door het model, de AI geeft het detail; het risico is flikkeren tussen de beelden, en het opzetten
  kost een paar sessies. **W3** een pixelartiest voor de sleutelstukken (de heer, een soldaat, het paard, de os, de wagen):
  het mooist, maar het kost geld. **W4** een gekocht pakket in die stijl, aangevuld: goedkoop, maar niet van ons, en
  zelden isometrisch in acht richtingen. Bij W1 en W2: Steam vraagt dat je meldt dat er AI in zit (dat mag). Voorstel van
  Claude: eerst één proef, de wagen van de heer met de os, langs W1 en W2 naast elkaar, en dan kiezen.
  **Uitgewerkt** (Claude, 18 okt, op Marcels vraag "Hoe gaan we nu zorgen dat wij dat level van detail en die mooie
  plaatjes ook kunnen maken?"): W2 als gereedschap in code. (1) Onze 3D-modellen blijven het skelet: de vorm, de kant en
  de houding, beeld voor beeld; (2) een beeld-AI tekent het detail eroverheen, met per beeld onze render als leidraad
  (diepte en randen) en Marcels plaat als stijl, zodat het paard in elk beeld hetzelfde paard blijft; (3) daarna onze
  eigen pixelbewerking (terug naar de maat van het spel, vaste kleuren, een donkere omlijning), zodat het pixel art in één
  stijl wordt en niet naar AI ruikt (Marcel eerder: "dit is te ai", "geen a.i slop"). De AI: via internet (OpenAI, een
  API-sleutel, een paar cent per beeld) of lokaal op Marcels videokaart (ComfyUI met Stable Diffusion en ControlNet,
  gratis, 8 tot 12 GB videogeheugen, een paar sessies opzetten). Risico: wat beweegt kan tussen beelden flikkeren; wat
  stilstaat (gebouwen, karren, spullen) gaat makkelijker. De proef: de wagen van de heer (stil, twee kanten) en de os in
  acht loopbeelden (beweging), naast Marcels plaat. **Gekozen** (Marcel, 18 okt): "Via internet (OpenAI). Ik regel een
  API-sleutel". De sleutel staat buiten de opslag, in `C:\Users\mpgeu\.openai-sleutel` (of in de omgeving als
  `OPENAI_API_KEY`); het gereedschap leest hem daar en stuurt hem alleen naar `api.openai.com`, en hij komt nooit in git
  of in een gesprek. **De sleutel lukt niet** (Marcel, 18 okt: "sleutel gaat niet, ik heb 11gb ram op gfx kaart, zou
  dat werken lokaal?"). Lokaal kan het op 11 GB: ComfyUI met Stable Diffusion XL, ControlNet (de vorm van onze render) en
  IP-Adapter (de stijl van Marcels plaat); Flux alleen verkleind en traag. Een paar sessies opzetten, zo'n 15 GB aan
  modellen, en SDXL volgt een opdracht minder goed dan het model van ChatGPT. Voorstel van Claude: eerst de proef met de
  hand in ChatGPT (de leidraden staan in `gereedschap/pixelart/uit/ai/`, Marcel sleept ze met zijn plaat erin, slaat het
  antwoord op, en `naarPixels` maakt er pixel art van); haalt dat het niveau, dan ComfyUI lokaal voor de honderden beelden.
  **De proef met de hand is gedaan** (18 okt; Marcel: "Eerst de proef met de hand in ChatGPT"; `uit/ai/hand-proef.png`,
  `hand-lopen.png`): de wagen van twee kanten en drie loopbeelden. ChatGPT volgt de vorm en de houding van onze render
  heel nauw, met het detail van Marcels plaat (leeuwen op de panelen, een haam met koperen beslag, de kist met goud); de
  lading verschuift tussen de loopbeelden een beetje (een kruik, het deksel), en terug in de maat van het spel is het iets
  zachter dan onze scherpe pixels. **Marcel: "Ja, dit is de weg. Maak een plan om het voor alles op te zetten (lokaal
  met ComfyUI of anders)."**
  **Het plan voor alles** (Claude, 18 okt; wacht op Marcel). Wat er nu is: 767 figuren, samen zo'n 117.000 beelden (8
  richtingen maal elke houding; de boer en de boerin alleen al 72 uiterlijken, elk met zijn werk), zo'n 4.700 beelden van
  huizen (1.214 huizen, en de sneeuw op het dak, de bouwfasen, het afbranden en plat) en zo'n 1.500 tegels (de bomen en
  het groen per seizoen, de grond, de kust). Elk beeld door een AI is met de hand onmogelijk, via de API duizenden
  dollars, en lokaal weken rekenen. Dus: eerst minder, dan lokaal en 's nachts. In vijf fasen:
  1. **De motor**: ComfyUI lokaal op Marcels videokaart (11 GB): Stable Diffusion XL, ControlNet en IP-Adapter, zo'n 15
     tot 20 GB aan modellen; Claude helpt installeren. Dan dezelfde proef (de wagen en drie loopbeelden) lokaal, naast die
     van ChatGPT: haalt het het niveau? Zo niet, dan een ander model, of voor wat stilstaat de API.
  2. **Het gereedschap voor elk vel**: `beeld-ai.cjs` praat met ComfyUI (op de eigen pc, zonder sleutel) en neemt elk vel
     van de tekenstraat: per beeld onze render als leidraad, en ook de diepte en de randen uit ons eigen 3D-model (exact,
     niet geschat), per ding een goedgekeurd "meesterbeeld" als ijkpunt voor de rest, een cache (niets twee keer), en
     `naarPixels` met een vast palet per soort, zodat alles bij elkaar past. Het vel komt terug in dezelfde maat en met
     dezelfde ankers, dus het spel verandert niet (`naar-spel.cjs` en het inpakken zoals nu).
  3. **De eerste reeks: de heerstoet** voor de cinematics (E, stap 4): de heer te paard, de wagens, de soldaten met
     vaandel en fakkel. Eerst een proefplaat, dan het hele vel.
  4. **Kiezen wat er in de nieuwe stijl komt** (Marcel): minder uiterlijken (bijvoorbeeld twaalf in plaats van 72),
     minder werkhoudingen, vijf richtingen en de andere drie gespiegeld, minder soorten huizen; en wat het spel niet meer
     gebruikt (de monsters van het oude spel), gaat eruit. Doel: rond de 10.000 tot 15.000 beelden, een paar nachten
     rekenen.
  5. **De demo, in volgorde van wat je ziet**: de ossenkar, de huizen van het eerste jaar, de dorpelingen en de soldaten
     (staan en lopen eerst), het wild, de bomen; de grond en de kust het laatst. Per soort eerst een proefplaat
     (CLAUDE.md: eerst goedkeuring, dan renderen). Daarna de rest, en een opruimronde.
  Erbij: in de winkel van Steam melden dat er AI in de beelden zit; en de vraag of de figuren groter mogen (meer detail in
  beeld, maar alles moet mee), voor later.
  **Fase 1 loopt** (18 okt; Marcel: "Ja, begin met fase 1", en toestemming voor de downloads): ComfyUI v0.41.0 (de versie
  voor de 10-serie, cu126) staat in `C:\ComfyUI\`, met SDXL, ControlNet union en IP-Adapter Plus (14,7 GB), en draait op
  `127.0.0.1:8188` (`node gereedschap/ai/beeld-ai.cjs lokaal`). Met SDXL zo'n 60 seconden per beeld; met veel vrijheid
  (denoise 0,75, ControlNet los) heeft elk beeld mooi detail, maar wisselen de loopbeelden van lading en tuig
  (`uit/ai/lokaal-proef.png`). Marcel gaf daarna een opdracht voor de werkstroom (`gereedschap/ai/opdracht-comfyui.md`):
  SD 1.5, weinig vrijheid (denoise 0,3 tot 0,5) en een strakke ControlNet (0,75 tot 1,0), een testmatrix, een
  deterministisch masker voor de achtergrond, kwaliteitscontrole, en een importeerbare werkstroom. **Gedaan** (18 okt;
  `gereedschap/ai/sd15.cjs`, `werkstroom-sd15.json`; Marcel: "maak de lijnen zelf uit ons 3D-model"): SD 1.5
  (DreamShaper 8) zo'n 23 seconden per beeld; de vorm blijft (95 tot 98% overlap, de achtergrond exact #FF00FF), maar
  binnen de matrix (denoise 0,30 tot 0,50) komt er weinig bij, en wordt de wagen bruin; ControlNet 0,75 of 1,00 maakt
  bijna niets uit. Met de wagen van ChatGPT als **meesterbeeld** (IP-Adapter, denoise 0,60) wordt hij rood met gouden
  tekens, maar wisselen de lading en de kop van de os nog tussen de loopbeelden. Marcel: "ik denk toch sdxl? of is er nog
  iets beters?" Voorstel van Claude: SDXL (beter detail; zo'n 60 tot 75 seconden per beeld), met het meesterbeeld, onze
  lijnen, en de loopbeelden samen in één beeld getekend, zodat het één os en één lading wordt; nieuwere modellen (Flux
  Kontext, Qwen-Image-Edit) zijn te zwaar voor de 1080 Ti, en kunnen later op een gehuurde kaart.
  **De SDXL-werkstroom** (18 okt; Marcels tweede opdracht, in `opdracht-comfyui.md`: "Maak een aparte SDXL-workflow.
  Behoud de huidige SD 1.5-workflow volledig"; `gereedschap/ai/sdxl.cjs`, `werkstroom-sdxl.json`; wat ze delen staat in
  `doek.cjs`, en SD 1.5 geeft daarna byte voor byte hetzelfde): SDXL 1.0 base, ControlNet union (lineart, onze lijnen),
  1024 × 768, 32 stappen, CFG 5,5, de goedgekeurde wagen van ChatGPT als stijl via IP-Adapter Plus SDXL; zo'n 75 seconden
  per beeld. Gemeten tegen SD 1.5 (`uit/ai/sdxl/wagen-zw-vergelijking.png`; detail is het gemiddelde verschil in
  helderheid tussen buren, binnen het ding): met "style transfer" op denoise 0,50 de beste vorm (97,2%) maar weinig detail
  (35 in de maat van het spel, onze render 31); met **"strong style transfer" op denoise 0,55 het meeste detail (48) bij
  96,5% van de vorm, een rode wagen met gouden leeuwen**; SD 1.5 met het meesterbeeld (denoise 0,60) 47 bij 94,8%. De os
  blijft blokkig: ControlNet houdt de vorm van ons model vast. Elke plaat heeft sinds 18 okt opschriften (Marcel: "ik
  weet nu niet welke plaatjes SD1.5 en welke SDXL zijn", "graag even markeren"; `etiket.cjs`).
  **De hybride pijplijn onderzocht** (18 okt; Marcels opdracht: "onderzoeken of we AI vooral voor materiaaltexturen en
  visuele afwerking kunnen gebruiken", "Verander voorlopig niets aan de bestaande renderer"; het rapport en het voorstel
  in `gereedschap/ai/hybride-voorstel.md`, niets veranderd): onze renderer is een eigen raymarcher op afstandsfuncties,
  zonder meshes of UV's en met kleuren uit een vast palet, maar elk onderdeel kent zijn rusthouding, en dat zijn in feite
  vaste textuurcoördinaten voor elke kijkrichting en elk loopbeeld. Voorstel: de AI tekent het oppervlak één keer
  (meesterbeelden teruggeprojecteerd, het licht eruit gedeeld, plus naadloze materiaaltegels en decals zoals de leeuw),
  en onze renderer belicht en rastert, met één palet per ding: geen flikkeren per definitie. De vorm (de blokkige os)
  lost het niet op; die moet in de modellen beter. Marcel: "Daarna kijken we naar een ander model."
  **De proef met één wagenwiel** (18 okt; Marcel: "Ik ga akkoord met de richting van je hybride AI-textuurpipeline", "Gebruik
  één bestaand wagenwiel als testcase", de eisen in `opdracht-comfyui.md`; de uitkomst in
  `gereedschap/ai/wielproef-evaluatie.md`): de renderer draagt nu optioneel AI-texturen (`kern.cjs`, `textuur.cjs`), en
  de oude renderer blijft pixel voor pixel gelijk (65 beelden, `gelijk.cjs`). Het hout en het ijzer uit SDXL, naadloos;
  het wiel uit 8 richtingen en 9 standen: de textuur zit vast (1,21 tegen 3,44 voor dezelfde textuur zonder rusthouding,
  en 4,41 voor het oude procedurele hout), een volle slag geeft hetzelfde beeld, geen naden, en de mip-niveaus zijn nodig
  tegen kartelen. Op spelmaat is een wiel klein: een textuur loont vooral op grote vlakken (planken, huid, zeil). Het
  ijzer is matig.
  **De HD-proef** (18 okt; Marcels vierde opdracht in `opdracht-comfyui.md`: waar zit de grens, in de materialen, de
  geometrie, de resolutie of de pixelverwerking?; het verslag in `gereedschap/ai/hd-wielproef.md`, de platen in
  `uit/hdproef/`): A (zoals nu), B (AI-materialen met reliëf, holtes, randen, warm licht, glans), C (een beter wiel uit
  `onderdelen.cjs`, dezelfde buitenmaat), en een ladder met één verandering per trede, op 1×, 2× en 4× (`o.fijn` in
  `kern.cjs`). Uitkomst: B en C halen het ChatGPT-wiel in toon, licht en materiaal (contrast, warmte en drukte binnen een
  paar procent), de textuur zit vast (94% op 2×), een volle slag is het beginbeeld, de buitenmaat gelijk, en de oude
  renderer pixel voor pixel gelijk en even snel. Wat nog mist: (1) de pixeldichtheid: het doel is ruwweg een sprite van
  2× onze maat, en het spel tekent nu elke spritepixel als 2×2 schermpixels, dus **een HD-sprite van 2× past op dezelfde
  grootte** (4× alleen zichtbaar op 4K, vier keer duurder); (2) forsere verhoudingen (zoals ChatGPT: spaken, velg en band
  anderhalf keer zo fors); (3) het handschrift van pixel art (een lichte lijn op elke rand naar het licht, een donkere om
  elk onderdeel, weinig tinten); (4) het licht op het vlak vooraan. Op 2× kost het vier keer videogeheugen en twee à drie
  keer rendertijd.
  **De resolutieproef** (18 okt; Marcels vijfde opdracht: C op 2×, 4×, 8× en 16×, "Onderzoek of 8× of 16× nog zichtbaar
  betere pixelart oplevert dan 4×"; het verslag in `gereedschap/ai/hd-resolutie.md`, de platen in `uit/hdresolutie/`):
  nee. Op 1080p wijkt 4× (verkleind met box) 6,7 af van het ideaal (16×), 8× 2,2: met het oog niet te zien; 8× en 16× zijn
  3,6 en 12 keer zo traag als 4× (16×: 41 s en 470 MB per beeld), en hun detail zit niet in de texturen. Nearest
  neighbour kartelt, meerderheid verspringt in beweging; box en Lanczos zijn goed. Marcel koos (18 okt): **4× intern,
  een sprite van 2×, box of Lanczos**; geen resolutieonderzoek meer.
  **De stijlproef** (18 okt; Marcels zesde opdracht: van een nette 3D-render naar handgemaakte pixel art; het verslag in
  `gereedschap/ai/hd-stijl.md`, de platen in `uit/hdstijl/`): een G-buffer uit de render (`kern.cjs` `o.gbuffer`) en een
  stijlafwerking op de doelmaat (`stijl.cjs`: kleurreeksen, nerf, variatie, metaal, clusters, contactschaduw, lichte
  randen, binnenlijnen, slijtage, omlijning in kleur), alles vast aan het ding. D (alles, met de tonen en de verdeling van
  het doel) komt het dichtst bij het ChatGPT-wiel, ook op spelgrootte, en flikkert niet meer dan A (0,16 tegen 0,15; een
  volle slag 100%; 94% van de nagels zichtbaar tegen 46%). Wat overblijft is geometrie (een brede velg van planken,
  dikke spaken met beslag, een koperen naaf) en de camera (het doel staat rechter). **Wacht op Marcel:** D als stijl, en
  de volgende proef: het wiel naar de geometrie van het doel met D, of D op de hele ossenkar.
  **De AI-afwerking** (18 en 19 okt; Marcels zevende opdracht, fase 1 tot 3: een beeldmodel werkt onze sprite bij, met
  het ChatGPT-wiel als stijl; het verslag in `gereedschap/ai/ai-afwerking.md`, de platen in `uit/ai/afwerking/`): voor
  Route A (SDXL, ControlNet union met onze eigen lijnen en diepte, IP-Adapter, een latent masker) was alles er al; render
  passes in `stijl.cjs` (`passen`, `lijnenVan`, `diepteVan`), de werkstroom in `gereedschap/ai/afwerking.cjs`. Uitkomst:
  de vorm blijft (97 tot 99% overlap, acht spaken, maat binnen 0,4 pixel), byte voor byte reproduceerbaar, zo'n 95 s per
  sprite. Op het doek van 1024 lijkt het sterk op het ChatGPT-wiel, op spelgrootte maar ten dele (lijnen, koperen naaf),
  in kleur en contrast is D beter, en **bij draaien flikkert het twee à drie keer zo veel** (0,37 tot 0,41 tegen 0,16):
  elke stand wordt los beschilderd. Route B (Flux Kontext) is onderzocht, niet geïnstalleerd: hetzelfde probleem, 5 tot
  15 minuten per beeld op de 1080 Ti, en voor de productie een commerciële licentie. Marcel koos (19 okt): **"Ai on
  surface"**. Gedaan (19 okt; `pixelart/bakken.cjs`, `gereedschap/ai/oppervlak.cjs`, de platen in `uit/ai/oppervlak/`):
  de SDXL-beelden (zuidwest en noordoost) op het oppervlak gebakken, per groep gelijke onderdelen, en door onze renderer
  in elke stand opnieuw belicht. **Het flikkeren is weg** (0,157, net als D; per beeld 0,40); de lijnen en het
  schilderwerk van SDXL blijven deels te zien, D heeft de schonere kleuren en de nagels. Marcel koos (19 okt): **eerst de
  geometrie**. Proefplaat (19 okt; `hdproef.cjs wielDoel`, `doelwiel.cjs proef`, `uit/doelwiel/proef.png`): het wiel
  naar de opgemeten verhoudingen van het ChatGPT-wiel (een velg van 0,62 tot 0,92 R in acht stukken met naden en nagels,
  acht brede platte spaken, een naaf met een koperen kap, 24 nagels op de band), dun langs de as zodat je van zuidwest
  door de gaten kijkt. Marcel (19 okt): de band breder, en dus het wiel, en details op de naafkap: gedaan (band ±2,4, velg
  ±2,0, een kap met rand, zes nagels en een knop met kraal). Marcel: "Yea, but i feel like the filter destroys detail
  when we scale down". Gemeten (`doelwiel.cjs filters`): **het gedeelde palet van 64 kleuren deed het meeste kwaad** (het
  koper werd bruin); nu detailbehoudend verkleinen (`stijl.cjs verkleinDetail`) en een palet per materiaal. SDXL op dit
  wiel en gebakken (`oppervlak.cjs --wiel doel`, met een ijking van de helderheid per materiaal): vast in alle richtingen,
  maar op spelgrootte vlak (contrast 94 tegen 140); wat kleiner is dan een pixel (nagels, naden) haalt geen filter en geen
  AI, dat moet getekend worden. Marcel: "Wat als wij onze ingame resolutie voor sprites verhogen?" Proefplaat (19 okt;
  `doelwiel.cjs groter`, `uit/doelwiel/groter.png`): op 1080p zie je meer pixels alleen als alles groter in beeld komt;
  anderhalf keer zo groot laat ruim twee keer zoveel nagels zien (34 tegen 15 van 63), maar dan past er 44% van de wereld
  in beeld (twee keer: 25%), de render kost 2 tot 3,3 keer zo lang; het ChatGPT-wiel op de maat van nu heeft nog altijd
  meer karakter dan ons wiel op twee keer. **Besloten** (Marcel, 19 okt: "Maar het doel, zoals nu blijft de scherpte
  houden zoals ik wil. Dus groter zou niet moeten hoeven"): **de maat in beeld blijft** (een sprite van 2×); het detail
  moet uit het handschrift komen. **Het handschrift** (19 okt; `stijl.cjs` detailsWinnen, nagelLicht, binnenlijnen.naden;
  `doelwiel.cjs hand`, `uit/doelwiel/hand.png`): elke nagel een lichte stip (64 van 64 te zien, D had er 57), naden in de
  velg, het koper brons; in alle acht richtingen hetzelfde wiel. Marcel: "Ja die drie nog toevoegen, we zitten echt heel
  dicht op waar we willen zijn": gedaan (19 okt): beslag op de spaken (een plaatje met twee nagels aan elke kant), lijnen
  om de spaken (`binnenlijnen.om`), de nerf dichter en donkerder; 80 van 80 nagels te zien, flikkeren 0,231 (D 0,205).
  Marcel koos daarna (19 okt): het nieuwe wiel en het handschrift op de hele ossenkar, SDXL alleen op wat groot genoeg is
  (de bak). **Tussenstap** (`karhd.cjs proef`, `uit/karhd/proef.png`): de kar met de nieuwe wielen en het handschrift
  (ook op wat geen textuur heeft: `kern.cjs` schrijft dat met `o.gbuffer` nu in de G-buffer, `stijl.cjs rampStijl`); nog
  zonder leeuwen; 33 s per beeld (de nagels van de wielen moeten één onderdeel per kring worden). Marcel daarbij: "onze kar
  lijkt in verhouding echt een kneusje ten opzichte van die van GPT". Gemeten op dezelfde wielmaat: even groot in beeld,
  maar de ChatGPT-bak heeft bijna twee keer zoveel rood (4073 tegen 2146 pixels): hogere wanden, zware rongen, een brede
  bovenrand, de lading hoog opgestapeld; de os gedrongen en zwaar. **Wacht op Marcel:** het voorstel in woorden (de bak
  hoger en zwaarder, de lading hoger, de os forser, de dissel en het juk zwaarder; alleen in de HD-kar), dan een
  proefplaat, en daarna de leeuwen met SDXL op de grotere wanden. Daarna vroeg Marcel waarom niet de pixels van ChatGPT
  zelf, en of een pixelart-LoRA kan: op dezelfde maat heeft ChatGPT 25.009 kleuren, wij 95 (`gereedschap/ai/ai-afwerking.md`,
  "Waarom niet de pixels van ChatGPT zelf"). Voorstel: één proefplaat van het wiel met drie versies: zoals nu, de pixels van
  het ChatGPT-wiel erop gebakken in volle kleur, en SDXL met Pixel Art XL (170,5 MB, wacht op toestemming om te downloaden).
  Marcel noemde ook `Super_PixelArt_XL_M_V2.0` en `PixelArt_Krea2_5X5_V1`: van allebei verbiedt de maker het verkopen
  van de beelden (Civitai: alleen "Run on Civitai"), en Krea 2 past niet op de 1080 Ti. Marcel koos de proef zonder
  download: **gedaan** (19 okt, `oppervlak.cjs --wiel gpt`, `uit/ai/oppervlak-gpt/`; verslag in `ai-afwerking.md`, "De
  pixels van ChatGPT op het wiel"). De ChatGPT-pixels worden geprojecteerd: in de bakrichting komen ze bijna precies terug,
  en in de andere richtingen is het hout rijk. Naar zuidwest is het op spelmaat minder scherp, omdat ons wiel niet tot op
  de pixel het hare is. Marcel: "het lijkt erop, maar er is tóch minder detail als ik zou hopen", en over de eerste versie
  op 4×: "deze kwam heel dichtbij die van gpt". Een strenger kleurfilter had het slechter gemaakt: terug naar de eerste
  versie, met alleen het paars eruit. Op 4× (een 4K-scherm, of alles twee keer zo groot) blijft het detail, op 2× (de
  spelmaat op 1920×1080) gaat er een deel verloren (`uit/ai/oppervlak-gpt/maat.png`). Marcel koos 2× scherper ("Prima,
  probeer maar"): **gedaan** (19 okt). De spaken van ChatGPT staan niet om de 45° (tot 12° ernaast): het beeld wordt per
  spaak bijgebogen (`oppervlak.cjs buigSpaken`), en op spelmaat hebben de spaken weer de randen en glimlichten van
  ChatGPT. Marcel: "Naar de kar": **gedaan** (19 okt, `karhd.cjs gpt`, `uit/karhd/gpt.png`; verslag in
  `ai-afwerking.md`, "De pixels van de ChatGPT-wagen op de kar"). Op het voorste wiel uitgelijnd was de vorm van de bak al
  dichtbij, dus eerst de pixels op de kar zoals hij is: naar zuidwest is het bijna de ChatGPT-wagen, met de leeuwen. Wat
  nog niet past, is de vorm: de os (romp breder, poten korter en dikker), de dissel en de hoekpalen dikker. Marcel: "Ja
  proefplaat": **gedaan** (19 okt; `ai-afwerking.md`, "De vorm naar de ChatGPT-wagen"): de os forser (`vee.cjs o.bouw`)
  en apart op de ChatGPT-os gelegd, de rongen en de dissel dikker, een onderrand, en het licht op wat geprojecteerd wordt
  zachter (`kern.cjs mat.zacht`). Naar zuidwest lijkt het op spelmaat heel erg op de ChatGPT-wagen. Daarna Marcel (19
  okt): "We moeten zelf een betrouwbare pipeline hebben om te bouwen. Ik wil niet steeds gpt moeten gebruiken."
  **Wacht op Marcel:** het voorstel (`ai-afwerking.md`, "Een eigen pijplijn"): SDXL lokaal schildert meesterbeelden op
  onze eigen render (zodat ze er vanzelf op liggen), met één vaste stijlplaat, en die worden geprojecteerd. Eerste proef:
  de kar. Marcel vroeg daarna om een beter SDXL-checkpoint: de korte lijst staat in `ai-afwerking.md`, "Een beter
  SDXL-checkpoint" (AlbedoBase XL, Cor Epica, FaeTastic; allemaal de beelden verkopen toegestaan). Marcel: "Prima alle
  3". FaeTastic staat erin; AlbedoBase en Cor Epica vragen een inlog bij Civitai (Marcel kan ze zelf downloaden). De
  eerste proef (`karhd.cjs meester`; `ai-afwerking.md`, "De eigen pijplijn: de eerste proef"): de pijplijn werkt, en
  FaeTastic schildert beter dan het base, maar SDXL weet niet wat waar hoort (de zakken worden goud, geen leeuwen).
  Marcel: "Ja maar we kunnen niet voor elk plaatje een referentie maken. Ik wil dat wij onze eigen art maken met onze
  eigen pipeline" (`beeld.md`, "Onze eigen art, met onze eigen pijplijn"). **Gedaan** (19 okt, `karhd.cjs eigen`,
  `uit/karhd/meester/eigen.png`; `ai-afwerking.md`, "De eigen pijplijn zonder referentie"): zonder referentie, de huisstijl
  en een zin per materiaal per gebied (`gereedschap/ai/huisstijl.cjs`), de leeuw zelf getekend (`wapen.cjs`). De inhoud
  klopt nu (jute, de kist, de leeuwen), maar het is minder rijk dan ChatGPT (een gladde os) en traag (714 s). Marcel
  daarna: pixelart-modellen ("LoRA's is ook goed, ik wil het maximale eruit halen met mijn hardware"; de lijst in
  `ai-afwerking.md`, "Pixelart-modellen voor SDXL"). **Gedaan** (19 okt; "Zes groepen, en de pixelart-LoRA"): zes groepen
  halveren de tijd (406 s); PixelArtRedmond (LoRA, 166 MB, beelden verkopen mag) helpt niet op deze maat (blokken drie
  keer zo grof als onze pixels). Daarna stap 1, een rijker begin (`ai-afwerking.md`, "Stap 1: een rijker begin";
  `stoffen.cjs`: vacht, jute, schors): helpt een beetje (de os krijgt vacht bij denoise 0,65), een hogere denoise laat de
  inhoud weglopen; geen variant haalt ChatGPT. Marcel: "Handschrift proberen maar": **gedaan** (`karhd.cjs hand`,
  `uit/karhd/meester/handschrift.png`; `ai-afwerking.md`, "Ons handschrift over de eigen pijplijn"): de scherpe randen van
  ChatGPT komen erbij (H2: de geschilderde pixels met onze lijnen; H3: met meer contrast), het schilderwerk blijft armer.
  Marcel daarna: "Kunnen wij aan 'rijker' schilderwerk komen?": **gedaan** (`karhd.cjs rijker`; `ai-afwerking.md`,
  "Rijker schilderwerk: drie wegen"): plaatselijk contrast in onze eigen code is de sterkste hefboom (buurverschil 70 bij
  0,7 en 77 bij 1,0; ChatGPT 76); schilderwoorden helpen een beetje; een tweede beurt in tegels werkt op deze maat tegen.
  Wat nog verschilt is de tekening (de lading, de kop van de os, de warmte). Marcel: "Ok, laten we de w5 gebruiken"
  (`huisstijl.cjs HUISSTIJL.pijplijn`: het rijke begin, de schilderwoorden, H3, contrast 1,0), en: "kunnen we betere zinnen
  maken voor het materiaal?" Geprobeerd (`karhd.cjs zinnen`; `ai-afwerking.md`, "De betere zinnen per materiaal"): de
  inhoud is beter (jute zakken, geen broden), maar alles werd donkerder en kouder (de woorden "blackened", "deep",
  "dark"). Marcel gaf daarna de stijlspecificatie (`ontwerp/stijlspecificatie.md`, letterlijk). **Wacht op Marcel:** het
  voorstel (`ai-afwerking.md`, "De stijlspecificatie in de pijplijn"): de zinnen uit de specificatie, zachtere
  binnenlijnen, warm licht en koele schaduw uit ons eigen licht, minder verscherping, en vergelijken op 4× en 2× met een
  oordeel per punt. Marcel: "Ja proef draaien maar": **gedaan** (`karhd.cjs spec`; `ai-afwerking.md`, "De
  stijlspecificatie: de eerste proef"). Beter: geen zwart, zachtere binnenlijnen, warm hout. Slechter: SDXL nam "blue-grey"
  letterlijk (blauwe banden en stam), de zakken werden bollen, de os plastic. Daarna Cor Epica (Marcel downloadde hem;
  `karhd.cjs checkpoint`; `ai-afwerking.md`, "Cor Epica naast FaeTastic"): net zo blauw, gladder, niet beter; het checkpoint
  is niet de bottleneck. En twee LoRA's van Marcel ("Twee LoRA's van Marcel"): niet voor SDXL; de ERNIE-LoRA mag
  commercieel maar vraagt ERNIE-Image-Turbo. Daarna (19 okt): de zinnen zonder schaduwkleuren (spec2: het blauw is weg, de
  stam heeft een eigen gebied), en ERNIE-Image-Turbo (gedownload met toestemming; `karhd.cjs ernie`; "ERNIE-Image-Turbo in
  de eigen pijplijn"): duidelijk rijker dan SDXL, de grootste stap tot nu toe, zo'n 12 minuten per meesterbeeld. Marcel
  vroeg ook of het voorstel van ChatGPT (SDXL herschildert de render met de ChatGPT-wagen als referentie en ControlNet) al
  getest is: ja, op 18 en 19 okt ("Is het voorstel van ChatGPT nieuw?"). **Wacht op Marcel:** hoe verder (ERNIE als
  schilder van de eigen pijplijn, of eerst iets anders); geen nieuwe proeven tot hij dat zegt.
- **De platen van de andere materialen bekijken** (vraag 177, 17 okt; Marcel koos eerder: de richting is goed, eerst de
  andere materialen): `gereedschap/pixelart/uit/stijlproef/materiaal-<leien, pannen, spanen, planken, baksteen,
  leem>.png` (opnieuw met `node gereedschap/pixelart/stijlproef.cjs materialen`, anderhalve minuut), de hele plaat
  `plaat.png`, en `beeld.md`, "De andere materialen". Dan: welke goed zijn, en wat anders moet; daarna de haken in de
  bouwer.
- **Ver uitgezoomd in Firefox na A1, A2, B5, B1 en B2** (vraag 178, 17 en 18 okt; bij P): meet zoals bij de heuvels
  (het proefdorp, F2, helemaal uitgezoomd; eerst 24,8 ms vlak en 28,9 met heuvels), en kijk of het bos in Firefox nog
  goed staat: de bomen in de wind, in het grijs van de mist, achter een huis, en de aanvoerder tussen de bomen (de
  doorkijk), en de regen, de sneeuw en de rand van de mist. Hier alleen in Chromium getoetst. Wat daarna kan
  (`snelheid.md`, "Na B1 en B2"): D1 (de haperingen), of E3 en E4, die je wel ziet: eerst een proefplaat.
  Marcel koos eerst sneller en dan d van de heuvels ("Maar de perfomance moet echt wel veel beter"). Bij de heuvels
  (vraag 174, c) **wat Claude erbij koos** (zeg het als het anders moet): (1) het graan op een helling
  houdt zijn stroken van 8 pixels, al is het met heuvels het duurste wat overblijft (`opmerkingen.md`); (2) de speeltest
  draait nu in de volle Chromium, want de kale headless-shell van Playwright laadt het spel niet meer (`opmerkingen.md`).
- **Het Engels lezen** (11 okt): de woorden die de agents kozen staan in `engels.md`, met per deel een tabel "Erbij in
  deel …"; de keuzes om na te kijken: *the innkeeper*, *the moneylender*, *the tradesmen* (de ondernemers), *rent* (de
  pacht), *the ledger* (het rekenboek), *Martinmas*, *Good day* (het afscheid van een boer), de oorlogsplaatsen Crookwick
  en Eastwold, en de namen (Nicholas, Alice, Gerard, Kate, Walter; Heathside). Een woord veranderen is één regel in
  `engels.md` en een zoekslag.
- De spullen bij de huizen (vraag 148, d): mee in een ronde van de huizen, of weg.
- De ronde van alle huizen bekijken (vraag 144, in `main` sinds 11 okt): de knoppen A tot J op elke tekening, jong en
  oud, sneeuw op de daken, de fasen van het afbranden (`beeld.md`, "De ronde van alle tekeningen"; wat daar nog open is,
  staat in het archief bij de ronde).
- Het geluid (vraag 145, 2): de sleutel `FREESOUND_KEY` in de omgeving en de domeinen van Freesound erbij; dan maakt een
  sessie het.

**Daarna, in deze volgorde** (Marcel, 18 okt: O1, bovenaan dit blok): het doel van de demo, E (de heer als klok), en het
eerste jaar speelbaar; G loopt ernaast op het tijdpad van `commercieel.md`. Geparkeerd: de rest van I (c3, c4, d, 6b en 6c).
