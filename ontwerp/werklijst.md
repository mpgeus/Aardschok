# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst een dorp dat draait, dan de heer die eraan trekt (en daarmee de
kern: rijk worden en arm lijken), dan verhalen en besturen, dan het verzet, en pas aan het eind de
groei naar vrijheid en de afwerking. Zie "Daarna, in deze volgorde".

## De stand (26 sep 2026, zesde sessie): het gehucht rond het plein staat

**Het spel** (sinds 23 sep): je bent de schout van een gehucht onder een heer die alleen geld ziet,
en je probeert rijk te worden terwijl je arm lijkt. Wat er nu speelt en hoe het werkt, staat per
onderwerp in `spel.md`: bovenaan "Waar staat wat", en elk onderwerp begint met **Zo werkt het nu**.
Spelen: `npm start`, dan `localhost:8123/`: het spel begint in het gehucht, met de benoemingsbrief van
de heer; `Z` is slapen bij je huis. De pagina "Stand van het gehucht" (25 sep) loopt achter op de dag.
`npm test`: 487/487.

**Waar het werk staat:** de zesde sessie van 26 sep staat in de branch van die sessie
(`claude/werklijst-vervolg-wriko0`) en gaat naar `main` zodra Marcel dat vraagt ("push it"); alles
daarvóór staat al in `main`. Kijk dus vóór je begint of `main` die sessie al heeft (`git log`); hoe een
eigen branch en `main` samengaan, staat in `CLAUDE.md`, onder Git.

**Eerst speelbaar** (Marcel, 26 sep): "We moeten oppassen voor functie creep. Anders blijven we
toevoegen voor we bij een speelbaar product komen." Houd je aan de volgorde hieronder. Een nieuw idee,
ook een goed idee van Claude, gaat naar `opmerkingen.md` of achteraan, niet in de stap die loopt
(`CLAUDE.md`, "Het spel in het kort"). Wat het eerste speelbare product is, is vraag 33.

**Wat er op 26 sep gebeurde** (zes sessies; de details staan onder Af en in `spel.md`):
- Punt 7 is af: het oude spel is eruit, ook uit de namen (`Spel`, `S.schout`, kant 'speler').
- Marcel kwam met een nieuwe wens: een dorp dat leeft en groeit (punt 3b). Claude schreef een voorstel
  op een pagina, "Een dorp dat leeft" (https://claude.ai/artifact/3cozedxQDPkjvFnAcmnKFE), en Marcel
  koos daar in drie opmerkingen het meeste (`spel.md`, "Een dorp dat leeft en groeit"). Hij reageert
  in etappes ("het is best veel"): op de pagina staat bij elk hoofdstuk of hij het al besprak. Werk
  die markeringen bij na elke opmerking, en zet zijn keuzes in `spel.md`.
- De dag is gebouwd (3b, stap 1), en de mensen zijn poppetjes geworden (3b, stap 2): iedereen die in de
  balk telt, heeft een naam, een huis, een gezin en werk, en volgt het ritme van de dag. Opgeruimd:
  de tijd staat op één plek stil, en bezoekers komen op één manier aan (vraag 25, A en B).
- In de vierde sessie kwamen afwisseling in wat je bouwt en een nieuw gehucht rond een plein
  (vraag 28). Op de beelden zag Marcel dat het plein een open hart moet zijn en de kaart niet waterpas
  (vraag 29).
- In de vijfde sessie: de schets voor het plein, in drie versies op de pagina "Het plein als hart"
  (https://claude.ai/artifact/NnMfi4QPWV8ct2ZtNjewud). Marcel keurde de derde goed (vraag 30 en 31):
  het heet gewoon plein, er wordt niet op gebouwd, gewone huizen staan eromheen, de boerderijen verder
  naar buiten bij hun velden, en de velden om het dorp. "Brink" en het Drentse zijn eruit, ook uit de
  code en de spelteksten: dat was een aanname van Claude. Op de pagina staat ook hoe het dorp per trede
  een stad wordt; Marcel koos daarbij (vraag 32) dat de boerderij mee naar buiten verhuist, dat graan
  van buiten naar de markt komt, en dat de kaart meegroeit, zonder grens aan de stad.
- In de zesde sessie: **punt 1 is af, het gehucht rond het plein** (de vierde versie van de kaart,
  zoals de goedgekeurde schets). Wie er in de gewone huizen woont, koos Marcel: een jong gezin in het
  huis, een oud stel in een hut, en de andere hut leeg; de schapen hoedt wie het best past (de herder
  hoeft geen boerenzoon te zijn; dat was een afleiding van Claude, geen keuze van Marcel). Op het plein
  wordt niet gebouwd, en de kinderen spelen er verspreid over. Marcel kreeg schermafdrukken (de deur van
  de schout, het midden van het plein, het hele gehucht, de brug).

**Loopt nu:** niets. **Het volgende: de doorkijk** (punt 1 hieronder; vraag 31, "Zoals jij
voorstelt"): het kijkvenster ook voor de heer, de marskramer en wie je spreekt, en een huis dat in een
raster doorzichtig wordt, om de andere pixel; allebei als keuze in de spelregels (`js/opties.js`), en
wat Marcel in het spel kiest, wordt de standaard (`beeld.md`, "Doorkijk"). Het kijkvenster zit in
`tekenKijkgat` (`js/tekenen.js`). Begin met een kort voorstel voor Marcel. Daarna: ronde 4b van de
huizenbouwer, dan de herberg.

**De volgorde van het werk** (Marcel vroeg erom, 26 sep). Wat hij koos, staat erbij; de rest is een
voorstel van Claude, en daar gaat vraag 26 over.

1. **Nu: de doorkijk** (vraag 31, "Zoals jij voorstelt"): het kijkvenster ook voor de heer, de
   marskramer en wie je spreekt, en een huis dat in een raster doorzichtig wordt, allebei als keuze in
   de spelregels (`beeld.md`, "Doorkijk"). Nu er huizen om het plein staan, ook aan de kant van de
   camera, is dat nodig. Klaar als: wie je spreekt of wie op het plein staat, is ook achter een huis te
   zien, en in de spelregels staan de twee manieren. (Het plein als hart, de vierde versie van het
   gehucht, is af: zie onder Af.)
2. **Dan: ronde 4b van de huizenbouwer** (3b, stap 4; naar voren gehaald, vraag 29): elk huis in elk
   materiaal en elke vorm, niet waterpas (`beeld.md`, "De huizenbouwer op ronde vormen"), en ook een
   kwartslag gedraaid of gespiegeld, zodat een boerderij met de zijkant naar het plein kan staan. Zwaar
   tekenwerk met agents: vraag vooraf het verbruik op (`CLAUDE.md`, "Zuinig werken met agents").
3. **Dan: de herberg en de kleine zaken** (3b, stap 3): de avond krijgt een doel. Begin met een kort
   plan voor Marcel (`spel.md`, "Zaken waar de mensen zelf heen gaan").
4. **Het zichtveld en de getuigen** (vraag 23; Marcels idee): 's nachts iets doen in een donker
   steegje, zonder dat iemand het ziet. Hierin gaat "wie vlak langs een plek loopt, kan iets vinden"
   uit verstoppen deel 1b op.
5. **De kern afmaken** (punt 6 en 6a), en daarmee de vraag van het tweede proefje: is dit leuk?
   - verstoppen deel 1b, de rest (Marcel koos het op 25 sep): de soldaten zoeken op Sint-Maarten
     altijd op 2 of 3 plekken, ook zonder argwaan, en je bepaalt de route zelf, maar soms wil de heer
     kiezen;
   - deel 2, het bos met de kudde (Marcel, 25 sep): een plek in het bos voor graan en goud (ver lopen,
     muizen en vocht), en een deel van de kudde het bos in voor de inner komt; hij telt de kudde, de
     heer vraagt per dier, en kaas en wol zijn sporen (dat is ook stap 3 van de weides);
   - deel 3: de marskramer koopt en verkoopt vee, kaas, wol en hooi;
   - stap 3 van de inner: praten, afleiden, omkopen (ook de marskramer, het spoor van het goud) en de
     rekenboeken.
6. **Bouwen:** het dorp bouwt zelf, en beter (3b, stap 5): op bouwgrond die jij aanwijst, voor
   materiaal en goud, met steen per trede. (Ronde 4b van de huizenbouwer staat sinds vraag 29 hierboven,
   bij 2.)
7. **Daarna zoals onder "Daarna, in deze volgorde":** straten en paden (6c; het plein is er sinds 26
   sep), en ontginnen (6b); dan deel C, verhalen en besturen (voorvallen, groepen en keuren, rechtspraak); deel
   D, de nacht en het verzet (de nacht, de eigen buidel, de militie, en daarbij de stal, de hoefsmid
   en de wapenmaker uit 3b); deel E, groeien naar vrijheid (de treden, stadsrechten, de opstand); en
   deel F, de afwerking en het verpakken.

Tussendoor: C en D van vraag 25 (`hud.js` en `tekenen.js` splitsen) als die bestanden toch open moeten,
en E van vraag 25 als er ruimte is. Wat Marcel kan spelen en zeggen hoe het voelt, staat onder "Spelen,
en zeggen hoe het voelt".

**Wat nog ruw is of niet helemaal goed staat,** staat in `opmerkingen.md`: alle opmerkingen bij
elkaar, om later na te lopen (Marcel, 25 sep). Zet er een bij als je iets ziet.

**Wacht op Marcel** (gesorteerd op 25 sep, zoals op de overzichtspagina "Stand van het gehucht").
De vragen hebben een nummer, zodat een antwoord kort kan.

*Beslissen* (1 tot en met 5 en 9 beantwoordde Marcel op 25 sep; zie `spel.md` en punt 7):
6. De kern voor het tweede proefje (`spel.md`, "De kern voor het tweede proefje"): de drie groepen en
   vijf keuren, nodig vóór punt 9.
7. Moet het ijs op de beek te zien zijn (tekenwerk), en vangt de jager 's winters minder?
8. Een naam; "Aardschok" past niet meer.
10. De monsters van het oude spel: de slijmkruiper, de skeletwacht, de reuzenspin en de kobold passen
    niet in het nieuwe spel, de wolf wel. Weg ermee, of bewaren tot er rovers zijn om de toetsen van
    het gevecht op te draaien? (`opmerkingen.md`, "Het gevecht na de leeftijd".)
11. Komt het leven van de schout terug (elke dag een beetje, of na een nacht rust), of wachten we
    daarmee tot punt 13, als vallen iets anders gaat betekenen?
12. De knop Slaan draagt nog het toetsje `1`, dat sinds 7b niets doet: weg ermee, of laat 1 het
    monster slaan dat het dichtst bij staat? (`opmerkingen.md`, "Het gevecht na de leeftijd".)
13. Een eigen figuur voor de schout, zodat je jezelf in een menigte terugvindt? (Voorstel van
    Claude, 26 sep; `opmerkingen.md`, onder de voorstellen.)

*Een dorp dat leeft en groeit* (26 sep; `spel.md`, "Een dorp dat leeft en groeit"):
14. ~~De dag: A, B of C?~~ Marcel koos A (26 sep): de dag wordt een echte dag.
15. ~~Wanneer?~~ De dag komt als eerste (26 sep).
16. ~~Bouwgrond?~~ Marcel wijst bouwgrond aan; later misschien een aanvraag om te bouwen.
17. ~~Vanzelf rijker?~~ Ja: groei hoort bij een dorp, en de heer verdient eraan. Een keur ertegen kan
    altijd; later beslist een raad mee.
18. ~~Ridders?~~ Die van de koning; later misschien je eigen ruiters.
19. ~~De wapenmaker?~~ Bogen, zwaarden en schilden.
20. ~~Hoe lang een dag?~~ Een maand dertig dagen, een dag vijf minuten (Marcels voorstel).
21. ~~Bouwtijd en straffen?~~ Blijven in dagen; de tijden stellen we later bij.
22. Welke standen krijgt de tijdsversneller? Voorstel: 1×, 3×, 10× en 30×, en slapen tot de ochtend
    als de schout thuis is. Een jaar duurt dan 30 uur, 10 uur, 3 uur of 1 uur. Zo gebouwd (26 sep);
    andere standen zijn één regel (`T.SNELHEDEN`, `js/tijd.js`).
23. Komen het zichtveld voor iedereen en de getuigen (Marcels idee, 26 sep) als stap in 3b, na de
    poppetjes, of later bij punt 11 (de nacht)? Voorstel: in 3b, want verstoppen wordt er meteen
    spannender door. Waar precies in 3b, is vraag 26: Claude stelt voor de herberg ervoor te doen.
24. Wat nu, na de dag: de poppetjes (3b, stap 2), of eerst verstoppen deel 1b? Voorstel: de
    poppetjes, en dan het zichtveld (vraag 23), waarin "wie vlak langs loopt, kan iets vinden" opgaat.
    **Beantwoord (Marcel, 26 sep): de poppetjes.**
27. ~~Wie woont er bij de schout?~~ Zijn huis telt vijf mensen. Marcel koos zijn eigen gezin: een vrouw
    en drie kinderen (26 sep). Wat de heer de schout aandoet, raakt hen ook. Claude leidde daaruit af
    dat de herder een boerenzoon moest zijn; dat stond daarna als Marcels keuze in de code. Sinds 26 sep
    (zesde sessie) hoedt wie het best past (Marcel: "Moet de herder perse een boerenzoon zijn?").
28. **Een nieuw gehucht: een plein, meer ruimte en meer afwisseling. Wanneer?** Marcel, 26 sep, na de
    eerste beelden van de poppetjes: "We hebben meer afwisseling nodig in de huizen en hutten. Ze staan
    ook te dicht op elkaar al begrijp ik dat dit een test is." Het plein koos hij al op 25 sep, omdat
    de brink vanuit de camera achter twee daken ligt: "Dorpen worden vaak rond een plein gebouwd waar
    ook het huis van de schout staat. Daar de schandpaal of blok zetten." (`spel.md`, "Sint-Maarten";
    Claude zag dat eerst over het hoofd en stelde dezelfde vraag nog eens.) Voorstel van Claude, in
    drie delen:
    - A. **Afwisseling, meteen:** een hut of huis dat je bouwt, krijgt een van de tekeningen die er al
      zijn. Er zijn er zo'n 25, maar nu krijgt elke hut `dorpKlein2` en elk huis `dorpshuis1`.
    - B. **Een nieuw gehucht** (`maak-gehucht.cjs`; de kaart van 23 sep was een proef): rond een plein
      met het huis van de schout eraan, de put en de schandpaal, meer ruimte tussen de huizen en
      bredere straten, en de vijf boerderijen elk in een andere tekening.
    - C. **Ronde 4b van de huizenbouwer**: elk huis in elk materiaal en elke vorm. Renderwerk, gepland
      als stap 4 van punt 3b.
    Voorstel: A en B nu, vóór stuk 2 van de poppetjes, want in een dorp met ruimte zie je ze pas echt;
    C blijft waar hij staat. **Beantwoord (Marcel, 26 sep): A en B nu.** En het kijkgat als venster in
    het dak: "Ja, zo". A is af (26 sep). Voor B liet Claude een schets zien (het plein vóór het huis
    van de schout, aan de kant van de camera; de boerderijen drie tot vijf tegels uit elkaar, in vijf
    boerderijtekeningen onder riet; de es vóór het plein; akkers, weide en heide even groot; een kaart
    van 56 bij 56), en Marcel zei: "Ja zo, maar kunnen we niet gewoon het gebouw doorzichtig maken
    wanneer je er achter langs loopt? En de kaart mag ook groter zijn, geen probleem." Claude antwoordde
    dat het venster van 26 sep precies dat doet voor wie achter een huis langsloopt (een heel gebouw
    doorzichtig vond Marcel op 23 sep "een doorzichtig geelgroen spook"), maar dat het plein ook
    zichtbaar moet zijn als de schout er niet staat: daarom vóór de huizen.
29. **Wat komt eerst, na "de brink is het hart" en "niet alles strak en waterpas"?** Marcel, 26 sep, na
    de beelden van het nieuwe gehucht: de gebouwen staan te dicht op elkaar; "de brink is vaak het hart
    van een dorp. Zou een redelijk open ruimte zijn lijkt mij"; de vorm moet variëren, en niet alles
    strak en waterpas; en of zijn opmerking over variatie in huizen en "niet waterpas" (21 sep) er nog
    was. Die stond in `beeld.md`, "Niets is waterpas", maar gold alleen voor de huizen, nooit voor de
    kaart; dat staat er nu bij ("Ook de kaart is niet waterpas"). Voorstel van Claude: eerst de brink
    (een vierde versie van het gehucht), dan ronde 4b van de huizenbouwer naar voren, dan de herberg.
    **Beantwoord (Marcel, 26 sep): "Brink, dan huizen".** En daarvoor een nieuwe sessie.
30. ~~De brink als hart: de schets~~ (26 sep; https://claude.ai/artifact/NnMfi4QPWV8ct2ZtNjewud).
    Claude vroeg of de richting klopte (de huizen alleen achter en naast het plein, de velden ervoor),
    of er een drinkpoel op kwam, en of er op gebouwd mocht worden. **Beantwoord (Marcel, 26 sep):**
    "De velden etc moeten rondom het dorp liggen. Bij verstedelijking moeten deze mee verhuizen naar
    buiten. Ik wil wel dat er huizen voor kunnen staan. We hebben daar het kijkvenster voor. Misschien
    huizen volledig transparant maken." — "Laat dat Drentse los aub. Dit is niet daarop gebaseerd. Er
    kunnen troggen geplaatst worden op dagen van markt voor het vee." — "Op het Plein wordt niet
    gebouwd. De brink heet vanaf nu ook gewoon plein. Klaar met dat Drentse. Waar dat vandaan is
    gekomen is een aanname ergens eerder." Dat klopt: het kwam van Claude (25 sep, "het Drentse
    esdorp" als kader voor het vee) en stond daarna in de code op Marcels naam. Rechtgezet op 26 sep,
    ook in de code en de spelteksten; zie `spel.md`, bij het plein.
31. ~~Het plein als hart: de derde schets~~ (26 sep; dezelfde pagina). **Beantwoord (Marcel, 26 sep):
    "Indeling klopt"; wie er woont: "Wordt C"; de doorkijk: "Zoals jij voorstelt."** Wie precies in de
    gewone huizen woont, koos Marcel in de zesde sessie: een jong gezin in het huis, een oud stel in een
    hut, de andere hut leeg; en de schapen hoedt wie het best past, want de herder hoeft geen boerenzoon te
    zijn (`spel.md`, bij het plein). Op de tweede schets zei Marcel:
    "Naast boerderijen zijn er ook 'gewone' huizen." Nu staan er twee hutten en een huis om het plein,
    en de boerderijen verder naar buiten, bij hun velden. Drie vragen. (1) Is dit het? (2) Wie woont
    er in de gewone huizen? Het spel telt de mensen bij het begin uit de woonruimte, dus: A, bewoond
    door nieuwe gezinnen (36 mensen in plaats van 25, en 44 procent meer monden: de balans moet
    opnieuw); B, leeg, en ze vullen zich zodra er eten en tevredenheid is; of C, dezelfde 25 mensen,
    maar niet allemaal op een boerderij (de herder met zijn gezin, een oud stel, een weduwe).
    Voorstel: C; dan moet het aantal mensen bij het begin los van de woonruimte kunnen, zoals de
    beginvoorraad. (3) Welke doorkijk wil je proberen, nu er huizen vóór het plein staan: het
    kijkvenster ook voor de heer, de marskramer en wie je spreekt; alleen de omtrek van het huis; of
    het huis in een raster doorzichtig, om de andere pixel? Voorstel: de eerste en de derde als keuze
    in de spelregels, na de kaart (`beeld.md`, "Doorkijk").
32. ~~Hoe het dorp een stad wordt~~ (Marcel vroeg het, 26 sep: "Verstedelijking in de binnenring?";
    het staat in `spel.md`, "Van dorp tot stad", en per trede getekend op de pagina van het plein).
    **Beantwoord (Marcel, 26 sep):** "Ja verhuist mee" (de boerderij, als haar velden bouwgrond
    worden); "Ja er wordt graan van buiten gebracht naar de markt"; en "De kaart blijft wel groeien.
    Er is geen grens voor een max afmeting stad."
33. **Wat is het eerste speelbare product?** (Claude, 26 sep, na Marcels waarschuwing voor functie
    creep.) Voorstel: een proefversie van één jaar in het gehucht, van de benoemingsbrief tot
    Sint-Maarten, met de kern (rijk worden en arm lijken: verstoppen, de inner, de heer), opslaan en een
    titelscherm. Dan wordt duidelijk welke punten van de volgorde daarvoor nodig zijn, en welke kunnen
    wachten tot daarna.

*De code begrijpelijk houden* (Marcel, 26 sep: "Laten we wel zorgen dat de code goed te begrijpen
blijft en te onderhouden / aan te passen"; de regels staan in `CLAUDE.md`, "Afspraken in de code"):
25. Welke opruimklussen, en wanneer? Gemeten op 26 sep; voorstel van Claude, van meeste naar minste
    waarde. **A en B zijn af** (26 sep; Marcel: "Ja, begin met A en B"):
    - **A. De tijd op één plek (af).** Zeven vensters zetten de tijd stil, elk met een eigen sleutel
      (`briefVoorSnelheid`, `heerVoorSnelheid`, ...; het handelsvenster met een eigen kopie), en de
      heer, de inner en het slapen zetten de snelheid ook. Nu: `T.houdTijdStil(S, reden)` en
      `T.laatTijdGaan(S, reden)` in `js/tijd.js`: de tijd staat stil zolang er een reden is, en loopt
      daarna op de snelheid die de speler koos (`S.kalender.snelheid`; wat er nu loopt, zegt
      `T.snelheidNu`). Twee vensters tegelijk gaan niet meer mis.
    - **B. De bezoekers op één manier laten komen (af).** Bij de dag kregen de marskramer, de heer en
      de inner elk een eigen variant van "overdag komen, met een bericht en naar 1×" (drie manieren
      voor één ding, gebouwd door Claude). Nu: `T.bezoekerKomtAan(S, bezoek)` in `js/dag.js`, met het
      bericht in `bezoek.aankomst`.
    - **C. `js/hud.js` (1.462 regels) in vensters splitsen:** de balk, handel, de heer, de velden,
      verstoppen, slachten en de spelregels elk in een eigen bestand.
    - **D. `js/tekenen.js` (1.499 regels) net zo:** de grond, de wezens, de weides, de nacht.
    - **E. Eén laadlijst voor de toetsen,** in de volgorde van `index.html`. Dan zijn de 24 bewakers
      van de vorm `T.x && T.x(...)` niet meer nodig, en toetsen de toetsen het spel zoals het draait.
      B liet zien waarom: vijf toetsen laadden `js/dag.js` niet, en draaiden dus zonder werkuren en
      zonder bezoekuur, zonder dat iets klaagde. Vijf doen dat nog (`akkers`, `hooi`, `vee`, `velden`
      en `weides`: daar maaien de boeren dus ook 's nachts).
    Voorstel: A en B nu, zolang de dag vers is; C en D als die bestanden toch open moeten (de
    poppetjes raken ze allebei); E later.

*De volgorde* (26 sep; de volgorde van het werk staat bovenaan, in de stand):
26. Klopt de volgorde na de poppetjes? Voorstel van Claude, met twee verschuivingen tegenover het plan
    in `spel.md`: de herberg vóór het zichtveld, want in de herberg vertelt een getuige straks door wat
    hij zag, en dan komt dat er meteen bij; en de kern (verstoppen, de inner) vóór het bouwen, want
    bouwen is het grootste werk, en of de kern leuk is (de vraag van het tweede proefje), wil je weten
    vóór je veel bouwt.

*Spelen, en zeggen hoe het voelt:*
- Het gehucht rond het plein (26 sep, zesde sessie): loop over het plein en om de huizen, kijk bij de
  brug, de heide en de weide, en probeer met `B` iets op het plein te bouwen. Voelt het plein als het
  hart? Staan de vijf eiken te dicht, of zijn ze goed zo?
- Het gehucht na de namen (26 sep): Marcel zou het na 7e nog eens openen. Het hernoemen veranderde
  niets aan hoe het speelt, dus alles hoort te zijn zoals je het kende.
- Het nieuwe begin: open `localhost:8123/` en lees de benoemingsbrief. Klopt de toon van de heer? Een
  gevecht probeer je op `localhost:8123/?kaart=proef`: klik op de slijmkruiper.
- Een heel jaar: hoe snel het gaat, de winter, en Sint-Maarten (is de honger te veel of te weinig;
  mag de heer harder, of juist zachter?).
- Het bezoek van de inner (`Spel.debug.inner()`, of wachten tot oogstmaand): voelt meelopen goed,
  en is 90 stappen geduld te veel of te weinig?
- De winter van het vee: `Spel.debug.slachten()` opent het slachtvenster, en in het veldenvenster
  (`V`) staan de mest en wat het hooi van volgend jaar de winter door helpt.
- Verstoppen: klik een boerderij. `Spel.debug.verstopt()` zegt wat er waar ligt,
  `Spel.debug.verstopt('boer1', 30, 5)` zet iets weg zonder te lopen, en `Spel.debug.zoeken()` laat
  de soldaten nu zoeken.

*Lezen:*
- De tien karakters en hun zinnen, in `gereedschap/gesprekken.html`. Ze zijn een voorstel van Claude;
  de vrome, de roddelaar, de oudste, de nieuwkomer en de drinker zijn nieuw. De namen van de heer en
  de boeren stel je zelf in (spelregels).
- De ideeën uit Lords of the Realm 2, in `spel.md`, "Lords of the Realm 2 als voorbeeld": welke wil
  je, en wanneer? Geen haast; ze horen bij de punten 8 tot 16.

## Daarna, in deze volgorde (Marcel: "Ik wil het allemaal. Welke volgorde?", 23 sep)

De volgorde volgt wat op wat steunt: eerst een dorp dat draait, dan de heer die eraan trekt (en
daarmee de kern), dan verhalen die elk jaar anders maken, dan het besturen, dan het verzet, en pas
aan het eind de groei naar vrijheid en de afwerking. Alles staat in `spel.md`, "Welke gameplay er
nog nodig is".

*A. Een dorp dat draait*

3. **Behoeften en de winter** (af, 23 sep 2026). Klaar als mensen
   eten, brandhout en een kerk willen, tevredenheid bepaalt hoe hard ze werken en of ze blijven,
   een huis groeit (hut, huis, stenen huis) als zijn bewoners krijgen wat ze willen, en een winter
   zonder brandhout of voorraad mensen kost.
4. **Handel** (af, 24 sep 2026). Klaar als de marskramer drie keer per jaar langskomt (niet in
   de winter), ijzer en zout verkoopt en koopt wat je over hebt, tegen een prijs die per bezoek
   verschilt; een gebouw alleen maakt wat zijn grondstof toelaat, zodat de smidse zonder ijzer
   stilvalt; gereedschap sneller werk geeft en slijt; en zout vis en vlees bewaart. Besloten op
   24 sep, zie `spel.md`, "Handel". Stenen komen niet van hem maar bij punt 14, met een voerman
   met een kar.
3b. **Een dorp dat leeft** (Marcel, 26 sep; `spel.md`, "Een dorp dat leeft en groeit"). Klaar als
   de dag een echte dag is, de mensen poppetjes met een dagritme zijn, ze zelf naar de herberg en de
   kleine zaken gaan, het dorp zelf bouwt op bouwgrond die jij aanwijst, huizen en werkplaatsen
   meegroeien voor materiaal en goud (steen per trede), en er een paardenstal is. Hier, omdat de dag
   onder alles ligt wat erna komt. In zes stappen: de dag (af, 26 sep); mensen worden poppetjes; de
   herberg en de kleine zaken; ronde 4b van de huizenbouwer; het dorp bouwt zelf, en beter; de stal,
   de hoefsmid en de wapenmaker, samen met de militie (punt 13).

*B. De heer, en de kern (dit is het tweede proefje)*

5. **Sint-Maarten** (af, 24 sep 2026). Klaar als de heer zelf op 11 slachtmaand naar de brink
   komt (met in wijnmaand een brief vooraf), zijn deel vraagt in goederen en goud, naar wat hij
   ziet, en je betaalt in een venster; als tekortschieten oploopt van een boete en hogere eisen,
   via soldaten die inkwartieren en de schandpaal (jij wijst aan wie), tot je ambt kwijt; en als
   zaaigoed telt: wat je hem geeft, kun je niet zaaien. Besloten op 24 sep, zie `spel.md`,
   "Sint-Maarten"; wat nog open is, staat daar onderaan.
6. **Rijk worden en arm lijken.** Klaar als de inner argwaan heeft die stijgt als wat hij ziet niet
   klopt met wat je levert, er verstopplekken zijn met plaats voor zoveel, je twee rekenboeken
   bijhoudt, en zijn bezoek een scène is waarin jij meeloopt, de route kiest, praat, afleidt of
   omkoopt. De vraag van het proefje: is dit leuk? Besloten op 24 sep, zie `spel.md`, "Rijk worden
   en arm lijken". In drie stappen: het bezoek, het rapport en de argwaan (af, 24 sep); de
   verstopplekken (deel 1 af, 25 sep: de kelders, de kapel en de kist; deel 2: het bos, met de
   kudde; deel 3: de marskramer handelt in vee); praten, afleiden, omkopen en de rekenboeken.
6a. **Weides met vee** (Marcel, 25 sep; `spel.md`, "Weides met koeien en schapen"). Klaar als je
   weides aanlegt zoals akkers, koeien erop grazen en schapen op de meent, en ze geven wat bij ze
   hoort: melk en kaas, vlees en huiden in slachtmaand, wol, en mest voor de akkers. En als de
   inner de kudde telt, zodat wie slim is een deel het bos in drijft voordat hij komt. In drie
   stappen (`spel.md`): velden en vee op de weide (af, 25 sep); de winter en de wol (af, 25 sep);
   vee dat telt (komt samen met deel 2 en 3 van de verstopplekken, punt 6).
6b. **Ontginnen** (Marcel, 25 sep; `spel.md`, "Ontginnen"). Klaar als je bos of heide tot een nieuw
   veld kunt maken, de heer er zijn deel van wil en de inner het telt, en een veld diep in het bos
   buiten zijn zicht blijft: een verstopplek voor land. Hier, omdat vee na stap 2 van de weides land
   kost, en omdat de geheime akker bij de verstopplekken van punt 6 hoort.
6c. **Straten en paden** (Marcel, 25 sep; `spel.md`, "Straten en paden"). Klaar als er vanzelf een
   pad slijt waar veel gelopen wordt, je een pad met keien verhardt tot kinderkopjes, iedereen over
   een pad sneller loopt en over kinderkopjes nog sneller, een zandpad in de natte maanden modder
   wordt, en de keien van een keienraper komen (in plaats van de steengroeve) en van het ontginnen.
   Hier, omdat de keien van het ontginnen komen (6b).
7. **Het oude spel eruit** (af, 26 sep 2026; Marcel haalde dit op 25 sep naar voren, vóór de rest
   van punt 6). Klaar als de toren, de spreuken, de leeftijd, de tutorial en de oude kaart uit de code
   zijn, het spel zonder `?kaart=` in het gehucht begint, de namen om zijn, `npm test` groen is, en
   `CLAUDE.md` alleen nog het nieuwe spel beschrijft. Waarom nu: van de 17.000 regels zijn er zo'n
   1.850 alleen voor het oude spel (spreuken, toveren, tutorial, regie, leeftijd), en er komt steeds
   meer nieuwe code bovenop.
   **Marcel koos (25 sep):** "Gevecht houden, namen nu hernoemen, oude kaart weg." Het gevecht in
   beurten blijft, met alleen slaan, voor de rovers, de wolven en de opstand; de namen gaan nu om; en
   de oude kaart gaat weg (het erf, het bos, het dorp en de toren).
   **En in een tweede sessie van 25 sep, op drie vragen van Claude** (`spel.md`, onder Open): het
   begin is een benoemingsbrief van de heer; `js/regie.js` gaat weg, want je stuurt altijd zelf; en
   in een gevecht krijgt de schout voorlopig levenspunten. 7a tot en met 7d gaan achter elkaar, met
   na elke stap een paar regels aan Marcel; voor 7e (de namen) opent hij eerst het gehucht nog eens.
   In stappen, elk met `npm test` groen en een eigen commit (voorstel van Claude):
   - **7a. Het gehucht wordt het begin** (af, 25 sep). `index.html` opent zonder `?kaart=` meteen het gehucht,
     met eerst de benoemingsbrief van de heer. De tutorial eruit: `js/tutorial.js`, `js/regie.js`,
     het titelscherm, de oude meester, en het draaiboek `T.TUTORIAL_TEKST` met zijn plek in de
     gespreksschrijver (`gereedschap/gesprekken-tool.js`; `test/bronblok.test.cjs` kijkt op de
     echte bestanden).
   - **7b. De spreuken, het toveren en de leeftijd eruit** (af, 25 sep): `js/spreuken.js`, `js/toveren.js`,
     `js/leeftijd.js`, `T.verouder`, het meesterschap, de spreukbalk en de toetsen 2 tot 4. Het
     gevecht blijft (`js/gevecht.js`), met alleen slaan, en de schout krijgt levenspunten zoals een
     monster: wie valt, is het einde (voorlopig, tot punt 13).
   - **7c. De oude kaart en zijn mensen eruit** (af, 25 sep): `kaarten/wereld.tmj` (het erf, het bos, het dorp, de
     toren) met zijn betekenis, `kaarten/oud/`, de gebieden erf en toren, en Wim, de meester, de
     bakker, de smidsvrouw en de andere dorpelingen van het oude dorp, met hun gesprekken en de quest
     De koude oven. Het questsysteem, de gespreksschrijver en het wereldgereedschap blijven, voor het
     avontuur; het wereldgereedschap opent dan het gehucht. De proefkaarten (`proef`, `proefbos`)
     blijven: de toetsen gebruiken ze. **Let op:** de marskramer, de heer en de inner komen het
     gehucht binnen over de weg, via de uitgang "De weg de wereld in" (een overgang naar 'wereld',
     `T.wegInEnUit`), en veel toetsen leggen zo'n overgang aan. Die weg moet blijven, ook als de kaart
     erachter weg is.
   - **7d. De kunst die alleen het oude spel tekent** (af, 25 sep) (de tovenaar, de toren, de spreukeffecten) uit
     `beelden/`; de modellen in `gereedschap/pixelart/` blijven. Het vel van een gewone dorpeling
     blijft: de schout draagt het.
   - **7e. De namen om** (af, 26 sep), als laatste en in een eigen commit, zodat de rest leesbaar blijft:
     `globalThis.Toren` wordt `globalThis.Spel` (in de code blijft het `T`, en `Toren.debug` wordt
     `Spel.debug`), en de held wordt de schout (`S.held` wordt `S.schout`, de soort 'held' wordt
     'schout'). Dat raakt zo'n 160 regels met `Toren` in 96 bestanden en zo'n 550 met `held`, ook in
     de toetsen, het gereedschap, `server.cjs` en `CLAUDE.md`. De sleutel waaronder de browser de
     spelregels onthoudt (`aardschok.spelregels`) blijft, anders is wat Marcel instelde weg. `Spel` en
     `schout` waren het voorstel van Claude; Marcel koos "nu hernoemen".
     **Marcel koos (26 sep), op drie vragen van Claude:** beginnen zonder eerst het gehucht te openen
     (hernoemen verandert niets aan hoe het spel werkt; hij kijkt daarna); de soort 'held' wordt
     'schout', maar de kant in een gevecht wordt `'speler'`, want soort en kant zijn twee dingen: een
     man van de militie (punt 13) vecht aan jouw kant zonder de schout te zijn; en de README gaat mee
     in 7f. Gemeten op 26 sep: 144 regels met `Toren` in 84 bestanden, 328 met `held` in 47. Niet
     blind vervangen: de herberg De Scheve Toren, de torenmodellen (`bouwToren`) en "helder" blijven,
     en de makers van de vier gegenereerde bestanden (`kaarten/kaarten.js`, `tegels/tegels.js`,
     `tegels/bouwfasen.js`, `beelden/beschrijving.js`) gaan mee, anders zet de volgende render de oude
     naam terug. De oude ontwerpbestanden (`verhaal.md`, `toren.md`, `spreuken.md`) blijven zoals ze
     zijn: daar wás de held een tovenaar.
   - **7f. `CLAUDE.md` alleen nog over het nieuwe spel** (af, 26 sep); de oude afspraken staan in `git log`
     (`git show 0eb8269:CLAUDE.md`). Met de README, die nog helemaal De laatste klim beschreef, en de
     voorbeelden die naar iets wijzen wat weg is (`debug.gaNaar('erf')`, `debug.quest('molen')`).

*C. Verhalen en besturen*

8. **Voorvallen.** Klaar als er dingen gebeuren die een keuze vragen, met twee of drie antwoorden
   die elk iets kosten (zoals de quests), als gegevens op één plek, en de eerste reeks er is: weer
   (hagel, droogte), brand, ziekte, een vreemdeling die wil blijven, een bruiloft, een
   grensruzie, en de grillen van de heer als brieven.
9. **Groepen en keuren.** Klaar als boeren, landlozen en de kerk (later meer) elk een gezicht en
   vertrouwen in jou hebben, en je keuren kunt uitvaardigen die elk iets kosten.
10. **Rechtspraak en verklikkers.** Klaar als je als schout oordeelt over een dief, een vechtpartij
    of een verdachte vreemdeling, streng of mild met gevolgen, en er iemand in het dorp met de inner
    praat die je kunt ontmaskeren.

*D. De nacht en het verzet*

11. **De nacht.** Klaar als er dag en nacht is (ook voor de sfeer), met een avondklok, wachters en
    lantaarns, en verstoppen en smokkelen 's nachts veiliger is. De klok en het licht komen al met de
    dag (punt 3b, 26 sep); hier blijven de avondklok, de wachters, de lantaarns en het smokkelen. Het
    zichtveld voor iedereen en de getuigen (Marcel, 26 sep) horen hier ook, tenzij ze in 3b komen
    (vraag 23).
12. **Eigen buidel en dorpskas.** Klaar als jij zelf iets overhoudt, en wie te veel in eigen zak
    steekt, het dorp verliest.
13. **Een militie in het geheim.** Klaar als je mensen kunt laten oefenen (een feest als de inner
    kijkt), en rovers en wolven een reden en een gevecht in beurten geven.

*E. Groeien naar vrijheid*

14. **De treden.** Klaar als het gehucht een dorp wordt, dan marktrecht krijgt (markt, kramen,
    handelaars) en een stad wordt, met schepenen die stemmen. Met het dorp komt de voerman met
    een kar, die stenen brengt (`spel.md`, "Handel").
15. **Stadsrechten kopen.**
16. **De opstand:** trainen, wapens verbergen, en het gevecht in beurten.

*F. Afwerking*

17. **Opslaan, titelscherm, instellingen, geluid.** Zie `verpakken.md`. Het venster Spelregels
    komt dan ook bij Nieuw spel, met drie voorinstellingen: Mild, Zoals bedoeld en Streng
    (`spel.md`, "Instelbaar").
18. **Verpakken.** Klaar als er een programma is dat vanuit Steam start.

Het tweede proefje (één jaar met de heer: is rijk worden en arm lijken leuk?) zijn nu de punten 5 en 6.

## Tegelijk: de huizenbouwer, en meer mensen

Een stad vraagt veel huizen en veel mensen, dus dit weegt nu zwaarder dan eerst. In het nieuwe spel
zet de speler de huizen neer, dus voet en anker doen er nog meer toe; of ze daarvoor ook in Tiled
moeten, hangt af van punt 1.

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm** (af, 21 sep). Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één,
   anderhalf en twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het
   riet.
2. **Materiaal** (af, 22 sep). Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en
   veldsteen, en spanen, leien en pannen naast riet.
3. **Uitbouwen** (af, 22 sep). Dakkapellen (in het riet een bult), aanbouwen met een eenzijdig dak,
   erkers, luiken, bloembakken, buitentrappen, galerijen, gevelschoorstenen, en 21 losse
   tuinstukken in `tuin-sdf.cjs`. Plaat: `uit/proefhuis/uitbouwen.png`. Wat nog wringt: een bult
   in het riet past niet naast een aanbouw of op een L, het erkerkapje raakt bij twee lagen de rand
   van het grote dak, en het hek leest op ware grootte als een dicht staketsel.
4. **In gebruik.** Klaar als de nieuwe huizen in `gebouwen.tsx` staan met de goede voet en het goede
   anker, achteraan in de volgorde, en het dorp ermee getekend kan worden. Wat ronde 3 hiervoor
   opschreef:
   - Een aanbouw, trap of galerij steekt 1 tot 2,5 tegels voor de muur uit. Er is een `voetVan(H)`
     nodig (of opmeten zoals `meetVoet` in `naar-tiled.cjs`), met het anker op de achterste
     voethoek (+16), anders slaat `test/tegelanker.test.cjs` uit.
   - Renderen zonder gras en grondschaduw, anders wordt de slagschaduw de onderste pixelrij.
   - Per tegel een vaste opgave met een uitgeschreven `uit: {…}`, zodat andere kansen later het vel
     niet veranderen.
   - `naar-tiled.cjs` rendert in één draad (twaalf huizen: 5 tot 10 minuten); werkers of een cache
     per opgave.
   - Een huis met twee lagen en uitbouwen is zo'n 710×880 px: misschien een eigen vel.
   - Tussen de palen van een galerij en de muur kan niemand staan; die tegels moeten vast.
   - De tuinstukken krijgen een eigen vel van 1×1, anker op het midden van de tegel. Vast zijn het
     hek, de bank en de regenton; het hekje en de bedden niet (Marcel, 22 sep).
   Ronde 3 was één lange agent (235 stappen), dus ronde 4 gaat in twee stukken: **4a** (af, 22 sep)
   de hekjes van wilgentenen en latten (`beeld.md`) en de tuinstukken als eigen vel in Tiled; **4b**
   de huizen in `gebouwen.tsx`. **Marcel (26 sep): "4b moeten we dus uitvoeren."** Het dorp dat
   zelf en beter bouwt (`spel.md`, "Een dorp dat leeft en groeit") heeft die huizen nodig, elk in
   elke stap van de ladder: van vlechtwerk onder riet tot baksteen onder pannen.

**Meer mensen:** fase B2b, de zeven vaklieden uit `dorpelingen3.cjs` (daar neemt `been()` de knie
al mee), en meer gewone varianten (`dorpeling2`, … in `dorpelingen-anim.cjs`). Renderwerk.

## Klein, tussendoor als het past

- **Een omheining is geen blok** (om samen te bespreken). Het kerkhof, de kippenren en de moestuin
  staan in het spel als één vast blok, dus je kunt niet tussen de graven lopen. Een omheining zou
  alleen zijn rand vast moeten hebben.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag. Eén systeem, later ook voor een stadsmuur. Zie `wereld.md`, "Een dorp
  heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing:** grassprieten, varens en bloemen.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

- 26 sep 2026 — **Punt 1: het gehucht rond het plein, de vierde versie** (zesde sessie; vraag 29 tot en
  met 31). De kaart zoals de goedgekeurde schets (`maak-gehucht.cjs`; het schetsbestand is erin
  opgegaan): 76 bij 76, een open plein van zo'n 214 tegels met vijf oude eiken en uitgesleten zand met de
  put voor de deur van de schout, een huis en twee hutten eromheen, de boerderijen bij hun velden, een
  slingerende weg en een kronkelende beek. Akkers, weide en heide even groot (209 en 184 tegels). Op het
  plein wordt niet gebouwd (`T.opHetPlein` in `js/wereld.js`, `T.waaromPastHetNiet` in
  `js/gebouwen.js`: de muis en het bouwmenu zeggen het). Het aantal mensen bij het begin is een eigen
  getal (`beginBevolking`: 25), en Marcel koos wie er in de gewone huizen woont (een jong gezin, een oud
  stel, een hut leeg); op een boerderij wonen er nu drie, en de schapen hoedt wie het best past (Marcel
  vroeg: "Moet de herder perse een boerenzoon zijn?"). De kinderen spelen elk op een eigen plek op het plein
  (`T.plekOpHetPlein`). Onderweg hersteld: de brug over de beek was te kort, zodat je er niet overheen
  kon. Wat opviel (het nieuwe huis kost 2 goud bij de heer, en er is plaats om meteen te groeien) staat
  in `opmerkingen.md`. `npm test`: 487/487.
- 26 sep 2026 — **De schets voor het plein, goedgekeurd (vraag 30 tot en met 32).** Drie versies op de
  pagina "Het plein als hart": het plein in het midden, waar niet gebouwd wordt, gewone huizen eromheen,
  de boerderijen bij hun velden, en de velden om het dorp; met 6 van de 219 tegels achter een dak. De
  indeling staat nu in `gereedschap/tiled/maak-gehucht.cjs`. Op dezelfde pagina: hoe het dorp per
  trede een stad wordt.
- 26 sep 2026 — **"Brink" heet plein, en het Drentse is eruit.** In de code, de spelteksten, de
  toetsen en de ontwerpstukken (`T.pleinVan`, `straalPlein`; "De heer staat op het plein en wacht op
  je"). Het Drentse kader was een aanname van Claude en stond op Marcels naam; dat is rechtgezet.
- 26 sep 2026 — **Mensen worden poppetjes, stuk 2; daarmee is stap 2 van 3b af.** Komen en gaan zie
  je: een nieuw gezin komt overdag over de weg binnen (op dezelfde manier als een bezoeker) en loopt
  naar zijn huis, wie wegtrekt loopt de weg af, en het bericht zegt wie het zijn, ook wie sterft ("de
  oude Geesje, moeder van Wouter"). Werk telt in uren: Marcel koos de looptijd, dus een werkplaats maakt
  naar de uren dat zijn mensen er echt zijn, min de weg van hun deur erheen, en zegt dat bij de muis
  (een optie in de spelregels, standaard aan). `Spel.debug.gezin()` laat een gezin komen of gaan.
- 26 sep 2026 — **Vraag 28: afwisseling en een nieuw gehucht.** A: een hut of huis dat je bouwt,
  krijgt een van drie of vier tekeningen, nooit twee keer achter elkaar dezelfde (`tekeningen` in
  `T.GEBOUWEN`, `T.volgendeTekening`). B: een nieuwe kaart van 60 bij 60 (`maak-gehucht.cjs`, derde
  versie) met een plein vóór het huis van de schout, vijf boerderijtekeningen ruim uit elkaar, en de
  es vóór het plein; het plein ligt nu in beeld, ook als de heer er staat. Eerst liet Claude Marcel
  een schets zien, en hij zei "Ja zo".
- 26 sep 2026 — **Wat Marcel zag bij de eerste beelden van de poppetjes.** Wie naar binnen gaat,
  stapt nu de deur in en vervaagt, in plaats van in één klap te verdwijnen (`js/tekenen.js`,
  `deurStap`). En het kijkgat van de schout is een venster in het dak geworden, waarin je de grond
  en wie erachter staat ziet: eerst leek de schout óp het dak te staan (`tekenKijkgat`, `beeld.md`).
- 26 sep 2026 — **Punt 3b, stap 2, stuk 1: mensen worden poppetjes.** Iedereen die in de balk telt,
  is een poppetje met een naam, een leeftijd, een huis en een gezin dat bij het karakter van de boer
  past; bij de schout zijn vrouw en drie kinderen (vraag 27). De handen van een gebouw zijn mensen, en
  wie werk heeft, houdt het; de herder was toen een boerenzoon. Iedereen volgt het ritme van de dag (de put,
  het werk, de brink, het erf, binnen). Het getal in de balk verandert op één manier
  (`T.wijzigBevolking`). Onderweg hersteld: de tekenvolgorde (wie achter een huis liep, stond soms op
  het dak) en twee mensen die in een smal steegje voor altijd op elkaar wachtten (`js/bewoners.js`,
  `js/dag.js`, `js/gebouwen.js`, `js/verkennen.js`, `js/tekenen.js`, `test/bewoners.test.cjs`).
- 26 sep 2026 — **Opruimen, A en B (vraag 25).** De tijd staat op één plek stil, met een reden per
  venster (`T.houdTijdStil`, `T.laatTijdGaan`, `T.snelheidNu` in `js/tijd.js`); de zeven sleutels
  waarmee elk venster zelf de snelheid onthield, zijn weg. De drie bezoekers komen op één manier aan
  (`T.bezoekerKomtAan` in `js/dag.js`). Toetsen erbij in `test/tijd.test.cjs` en `test/dag.test.cjs`.
- 26 sep 2026 — **Punt 3b, stap 1: de dag.** Een dag duurt vijf minuten bij 1× in een maand van
  dertig dagen (Marcels keuze), met het uur in de balk, een versneller tot 30× en slapen tot de
  ochtend (`Z`). Lopen, maaien en dwalen gaan mee met de snelheid (`S.wereldTijd`); de zon volgt het
  seizoen, de nacht is donker met licht rond de schout, de boeren gaan 's nachts naar binnen en
  maaien in de werkuren (twaalf uur per tegel, gemeten op het oude tempo), en de inner, de heer en de
  marskramer komen overdag zonder de tijd stil te zetten (`js/dag.js`, `js/tijd.js`, `js/anim.js`,
  `test/dag.test.cjs`).
- 26 sep 2026 — **Een dorp dat leeft: het voorstel, en Marcels keuzes.** Een pagina om opmerkingen bij
  te zetten ("Een dorp dat leeft"), drie opmerkingen van Marcel, en alles in `spel.md`.
- 26 sep 2026 — **Punt 7e en 7f: de namen om, en punt 7 is af.** `Toren` werd `Spel` en de held
  de schout: `S.schout`, soort 'schout', kant 'speler' (Marcel koos het). De makers van de
  gegenereerde bestanden gingen mee, en de schout houdt nu ook in het spel zijn soort in plaats van
  'dorpeling'. `CLAUDE.md` en de README gaan alleen nog over het nieuwe spel, met de gewoonten van
  de cloudsessies onder Git.
- 25 sep 2026 — **Punt 7a tot en met 7d: het oude spel eruit.** Het spel begint in het gehucht met
  een benoemingsbrief van de heer (`T.ui.toonBenoeming`, `js/hud.js`); de tutorial, `js/regie.js`,
  de spreuken, het toveren, de leeftijd, de toren, de oude kaart met zijn mensen, De koude oven, de
  raakpunten en de kunst van het oude spel zijn weg. De schout heeft levenspunten (`js/wereld.js`,
  `js/gevecht.js`), de toren leeft voort als proefkamers voor de toetsen (`T.maakProefkamers`).
- 25 sep 2026 — **Op orde gebracht, en vijf antwoorden van Marcel.** Een overzichtspagina "Stand van
  het gehucht"; `spel.md` per onderwerp met "Zo werkt het nu"; verouderde getallen recht. Van Marcels
  antwoorden meteen gebouwd: vlees vult een maag (`js/behoeften.js`, een optie), de schapen groeien
  langzamer (`js/vee.js`), en de heer kijkt rond naar gelang zijn argwaan (`js/inner.js`).
- 25 sep 2026 — **Verstoppen, deel 1 (punt 6, stap 2).** De kelders van de huizen en boerderijen en
  de kapel, elk met hun eigen kans en prijs; het karakter van wie er woont; de soldaten die plek voor
  plek zoeken; de inner die de kist telt; en de marskramer die vertelt wat hij je betaalde
  (`js/verstoppen.js`, `js/inner.js`, `js/handel.js`, `js/hud.js`). Een proef van één jaar staat in
  `spel.md`.
- 25 sep 2026 — **De weides, stap 2 (punt 6a).** Hooi in hooimaand, vee dat 's winters hooi eet of
  sterft, het slachtvenster op 1 slachtmaand, velden naast elkaar als één weide, de schapen op de
  heide met een schaapskooi, scheren en mest per veld, en drie opties (`js/vee.js`, `js/akkers.js`,
  `js/hud.js`, `test/weides.test.cjs`, `test/hooi.test.cjs`). Een proef van drie jaar staat in
  `spel.md`.
- 25 sep 2026 — **De weides, stap 1 (punt 6a).** Elk veld is akker, weide of braak en wisselt op
  1 lentemaand; een akker put het land uit tot 40%, een weide mest het. Vee graast binnen zijn
  weide en geeft melk en kaas, en de kudde groeit in grasmaand als er plaats is. Het veldenvenster
  onder `V` (`js/akkers.js`, `js/vee.js`, `js/hud.js`). Een proef van drie jaar staat in `spel.md`.
- 25 sep 2026 — **Het vee.** Een koe en een schaap, elk in drie kleuren, die grazen, staan, lopen
  en liggen, en rustig om beurten gaan liggen (`gereedschap/pixelart/vee.cjs`, `js/vee.js`,
  `beeld.md`). De weides zelf komen nog (punt 6a).
- 25 sep 2026 — **De marskramer loopt.** Zijn eigen figuur (rek vol potten en pannen, lappenjas,
  stok) kan nu staan en lopen, en in het spel leent hij niet meer het vel van Wim (`beeld.md`).
- 25 sep 2026 — **Een gezicht per karakter.** Alle tien karakters zie je van ver, op het lijf van
  de boer en van de boerin: achttien vellen, in twee rondes (`gereedschap/pixelart/karakters.cjs`,
  `beeld.md`).
- 24 sep 2026 — **De schandpaal.** Een eiken paal met een halsijzer en het wapen van de heer. Hij komt
  er de eerste keer dat de heer iemand straft en blijft staan; wie gestraft wordt, staat ervoor met
  de halsband om (`js/heer.js`, `gereedschap/pixelart/schandpaal.cjs`, `beeld.md`).
- 24 sep 2026 — **Het huis van de heer, in rood en geel.** De heer (klein en dik onder een veel te
  grote hoed), zijn soldaten en de inner zijn eigen figuren, met staan en lopen
  (`gereedschap/pixelart/heer.cjs`, `beeld.md`). Er kunnen nu ook losse figuren gerenderd en in het
  spel gezet worden, zonder de rest.
- 24 sep 2026 — **De inner komt tellen (punt 6, stap 1).** Op 15 oogstmaand loopt hij zijn ronde
  of met de schout mee; wat hij ziet, is de rekening van de heer, en argwaan doet vier dingen
  (`js/inner.js`). Onderweg hersteld: de schout kon in het gehucht niet lopen (sinds 23 sep), en
  na een gesprek bleef wie liep halverwege een stap staan.
- 24 sep 2026 — **Geloote boeren.** Elk spel een ander karakter (tien, elk met een gesprek) en
  andere eigenschappen (maaien, opbrengst, zaaien, aanzien), zichtbaar bij de muis, in het gesprek
  en bij de schandpaal; geloot of vast in de spelregels (`js/boeren.js`).
- 24 sep 2026 — **De spelregels.** Marcel wil geen vaste antwoorden waar er meer goede zijn: één
  venster (`O`) met de keuzes van Sint-Maarten, honger buiten de winter, de namen, en alle
  getallen als werkbank (`js/opties.js`). De standaard is wat hij koos; de browser onthoudt de rest.

- 24 sep 2026 — **Sint-Maarten (punt 5).** De heer stuurt in wijnmaand een brief, komt op
  Sint-Maarten zelf met twee soldaten, en vraagt naar wat hij ziet (`js/heer.js`). Je betaalt in
  een venster dat vooruitrekent. Wie tekortschiet, krijgt een boete, soldaten, de schandpaal (jij
  wijst aan wie, ook jezelf), en de tweede keer ben je je ambt kwijt. Zaaien kost graan, en daarom
  klopt het graan nu: een boer maait al zijn akkers, en het vangnet haalt de rest binnen. Marcel
  koos vóór het bouwen; wat Claude zag en wat een proef van drie jaar liet zien, staat in
  `spel.md`, "Sint-Maarten".

- 24 sep 2026 — **Handel (punt 4).** De marskramer komt drie keer per jaar, je handelt met hem
  in een venster (`js/handel.js`, `js/hud.js`), en de prijzen verschillen per bezoek. Een gebouw
  maakt alleen wat zijn grondstof toelaat, de smidse kan al in het gehucht, gereedschap laat
  harder werken, en zout houdt vis en vlees goed. Het eerste voorstel ging aan Marcel voor, en hij
  koos alle vier de keuzes; wat Claude zag voordat er gebouwd werd, staat in `spel.md`, "Handel".

- 23 sep 2026 — **Het gehucht speelt.** Punt 1: graan als plaat en in het spel (groeit met de
  kalender, wuift, boeren maaien, de oogst brengt het graan binnen). Punt 2 en 2b: 45 soorten
  gebouwen (`js/gebouwen.js`) met bouwmenu, bevolking, handen, en een huis dat in vijf fases
  oprijst (`bouwfasen.cjs`). Punt 3: behoeften, tevredenheid en de winter (`js/behoeften.js`).
  Verder de interface (kalender, voorraad), de kale kaart met de es, het kijkgat, de maaier, en
  `Toren.debug.schermafdruk`. Details in `git log`.

- 23 sep 2026 — **Het nieuwe spel gekozen:** de schout, de heer en het dorp dat een stad wordt, met
  keuren, politiek en avontuur (`spel.md`). De laatste klim is vervallen.

- 22 sep 2026 — **De verhaaleditor kan quests** (`gereedschap/quests.html`): de fasen en wegen als
  boom met hun prijs ernaast, formulieren voor fase, weg, klaarAls en beloning, drie vormen om mee
  te beginnen die meteen de toets van drie antwoorden halen, en opslaan dat `js/quests.js`
  terugschrijft met de uitleg tussen de gegevens intact. Twee dingen die er beter uit kwamen dan
  gevraagd: de proef per fase zet een merkje bij **wie het merkt** (het vergelijkt met hoe het dorp
  zou praten zonder de quest), en de controle kijkt naast het tellen van routes ook of een gesprek
  de quest wel begint, of een weg wacht op iets wat niets geeft, en of wat in Tiled aan een fase
  hangt die fase ook heeft. Eén afwijking van het plan: het werd een tweede bladzijde naast
  gesprekken.html, met een link ertussen — waarom staat in `verhaal.md`.
  Erbij: `Toren.debug.quest('bakker', 'terug')` zet een quest in een fase zonder hem te spelen.

- 22 sep 2026 — **De koude oven, de eerste quest:** vier wegen die elk iets anders kosten (de kuil
  met wat erin huist, de vuurklei van de marskramer, de vuurstenen van de smidsvrouw, en een
  vuurschicht in de oven), met de gesprekken erbij en een toets die alle vier uitspeelt. Twee
  besluiten van Marcel: een gunst moet ook echt iets kosten, dus de smidsvrouw vraagt de eerste
  grondstof uit de toren; en je erft acht munten van de meester, zeven te weinig voor de
  marskramer. De bakker en de marskramer bestaan nu als wezen en lenen tot fase B2b het vel van
  Wim.

- 22 sep 2026 — **Het questsysteem, de regels:** quests als gegevens (`js/quests.js`) met de
  regels erachter (`js/quest.js`), goud naast de leeftijd, het vak linksboven dat nu ook van een
  quest kan zijn, en in Tiled `quest="bakker:zoeken"` op een voorwerp. Twee dingen die uit het
  bouwen kwamen: een weg door een quest is nu een ding in de gegevens met een `kost`, zodat
  `npm test` de toets van drie antwoorden bewaakt en het spel onthoudt *hoe* je iets oploste; en
  een spreuk kan een ding raken in plaats van alleen een wezen (`raak="oven"`), waarmee de
  toverweg van De koude oven kan bestaan zonder dat de oven een uitzondering wordt.

- 22 sep 2026 — Wachter voor gebouwen die elkaar overlappen: `npm run kaarten` klaagt als twee
  gebouwen van meer dan één tegel over elkaar staan.

- 22 sep 2026 — Huizenbouwer ronde 1 en 2: elke vorm (rechthoek, L, T; één, anderhalf en twee
  lagen, met riet dat in de kil doorloopt) en alle materialen (vakwerk, vlechtwerk, planken,
  blokhut, veldsteen; riet, spanen, leien, pannen; een wachttoren met plat dak). Platen in
  `gereedschap/pixelart/uit/proefhuis/`.

- 21 sep 2026 — **Eén doorlopende wereld:** `kaarten/wereld.tmj` met het erf (nu met randtegels)
  en het dorp op één kaart, en een strook ertussen voor het bos; de losse kaarten staan in
  `kaarten/oud/`. De camera volgt de held altijd, en om elke buitenkaart staat bos. De gebouwen
  staan op hun voet, en een tegelnummer verandert nooit meer.

- 21 sep 2026 — De meester in het spel: zes houdingen, een eigen leeftijd, en hij scharrelt bij
  zijn moestuin. Meldingen die zich herhalen worden één regel met een teller.
- 21 sep 2026 — Spreukanimaties met een worp, een vlucht en een inslag, en een grijze zucht die
  van de tovenaar opstijgt als hij betaalt (zie `spreuken.md`, "Je ziet de prijs gebeuren").
- 21 sep 2026 — Twaalf nieuwe gebouwen naar referentie één, met aanbouw en L-vorm; en
  tegelnummers die nooit meer verschuiven, zodat kaarten die Marcel tekent blijven kloppen.
- 21 sep 2026 — Fundering van de tutorial: `T.verouder` voor elk wezen, en een regieboek
  (`js/regie.js`) waarin overslaan dezelfde eindtoestand geeft als uitkijken.
- 21 sep 2026 — De verhaalsamenvatting in `CLAUDE.md` bijgewerkt; Wim is de knecht van de meester.
- 20 sep 2026 — Sprites in het spel; naar buiten lopen; wereld en dorp op referentie één; de
  toren op 8,7 tegels; randtegels met water en brug; elke kaart een gebied; gesprekken als
  gegevens met een editor; de spiraaltrap in drie staten.
