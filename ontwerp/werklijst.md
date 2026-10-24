# Werklijst: wat we doen, in welke volgorde

Sinds 11 okt 2026, voor de nieuwe richting: de economie van The Settlers met gevechten in beurten (vraag 151,
`gameloop.md`). Marcel, 11 okt: "We hebben een nieuwe lijst nodig met werk. We hebben nu een nieuwe richting. Vergeet
wat er nu openstaat voor de oude game." De lijst van daarvoor staat in `archief/werklijst-tot-11-okt.md`; een
vraagnummer tot 153 dat elders genoemd wordt, vind je daar. Nieuwe punten tellen verder vanaf 154.

Houd deze lijst kort: wat af is, gaat eruit (één regel onder "Af"), en het hoe staat in het ontwerpbestand van het
onderwerp, niet hier. Wie aan een punt begint, zet er "**Bezig in sessie `<branch>`** (datum)" bij, in `main` (CLAUDE.md).

## Nu en daarna (23 okt)

Kort, in volgorde (Marcel, 8 okt: "snel, duidelijk en low cost"): wat loopt, wat op Marcel wacht, en wat erna komt. Wat
af is, gaat eruit; het hoe staat in het ontwerpbestand van het onderwerp. Het blok zoals het tot 23 okt was, met de hele
geschiedenis sinds 11 okt, staat in `archief/werklijst-nu-tot-23-okt.md`.

**De richting** (Marcel, 18 okt, O1): eerst de basis. Het doel van de demo is D2: de heer komt in het eerste jaar op
Sint-Maarten zijn tiende halen, en daar eindigt ze, met een korte cinematic (betaal je, dan rijdt hij weg met je waren;
weiger je, dan komt zijn leger). E, de heer als klok, en Q, het eerste jaar speelbaar, zijn gebouwd. Geparkeerd: de rest
van I (c3, c4, d, samen spelen in 6b en 6c), de muren en het kasteel. **Performance heeft hoge prioriteit** (CLAUDE.md).

**Loopt**
- **Bezig in sessie `lokaal-dac05521`** (op Marcels pc; de art ligt op 23 okt even stil): de beelden van de generator
  (`beelden-van-de-generator.md`). De speerman staat, loopt en valt aan in acht richtingen; als eerste vallen NO, O en ZO
  (vel 23 tot 25, de prompts staan klaar), en eventueel vel 3 en 4 opnieuw (de punt naar achteren).

**Wacht op Marcel**
- **4b bekijken: de gebouwen plat met F** (24 okt; `beeld.md`, "Zo werkt het nu" bij Zicht in een dicht dorp). Druk F
  in een dicht stuk dorp, ook 's avonds en in de winter; kijk of het teken onder de bovenbalk goed staat, en meet in
  Firefox (de meter, *drawing*) plat tegen gewoon. Daarna 4c, de werkplaatsen plat (eerst een proefplaat).
- **185 en 186 bekijken, met het nieuwe debugvenster** (23 okt; `spel.md`, bij Rovers en de militie "In de demo één
  overval", en bij het eind "De punten"; het debugvenster: `gereedschap.md`, "Testen in de browser"). Druk D: in *Demo*
  begin je een nieuw spel als demo, en zie je de dag van de overval en je punten; in *Danger* komt de overval morgen; in
  *Time* spring je naar de dag vóór Sint-Maarten. Kijk ook of elke knop doet wat hij zegt. Een dag voor de overval een
  bericht, dan drie rovers overdag, zonder akker naar een stapel; op het eindscherm de punten onder het jaarverslag.
  Sinds 24 okt (1b) is de demo een level (`levels/demojaar.js`): het speelt hetzelfde, maar hoeveel rovers en tussen
  welke dagen staat nu daar, niet meer in de werkbank, en *Demo* geldt voor dat ene spel (niet meer tot je de bladzijde
  opnieuw laadt). In de cloud nagelopen in de browser (Demo, het slot, de overval morgen, Sint-Maarten tot het
  eindscherm, zonder fouten). Open: de korte scène van de rovers (met de cinematic), en de waarden van de waren (de
  werkbank, "The ending").
- **De dragers en het egaliseren bekijken** (184 met 182, in `main` sinds 23 okt; `spel.md`, "Zo werken de dragers nu" en
  "Zo werkt het egaliseren nu"). In het spel: het begin zonder kar (de mensen dragen één stuk per keer), de muis op een
  drager, de huifkar die opgaat in het raadhuis, en met *Height* op *Hills* de grond die in vier stappen vlak wordt.
  Sinds 24 okt: **wie stilligt, draagt** (Marcel: "A"; `spel.md`, bij de dragers): had iedereen werk, dan droeg niemand
  meer, en bleef een volle stapel liggen. Open: is één stuk per keer genoeg in de oogst (`opmerkingen.md`)? De figuren met een plank, een stam, een steen en de
  schop, en de kleinere kar bij de schuur, komen met de art.
- **Het demojaar spelen** met de speellijst (`speelbaar.md`, "De speellijst van het demojaar"); wat scheef zit, eerst
  met een getal uit de werkbank.
- **183, de huizen op 65 procent**, in één keer bij Marcel thuis, door de pijplijn: de negen stappen bij R, 183 (de
  schakelaar `NIEUW` in `huizen.cjs`).
- **Meten in Firefox**: ver uitgezoomd (vraag 178, bij P) en de grond op de videokaart (`snelheid.md`); kijk ook of het
  bos er goed staat (de wind, de mist, de doorkijk, de regen en de sneeuw).
- **d van de heuvels** (vraag 174, bij L): de heuvels altijd aan en de spelregel *Height* eruit. Daarna geldt ook het
  egaliseren overal.
- **De beeldpijplijn** (vraag 180): sinds 21 okt de nieuwe weg (de generator maakt de bron, wij maken het passend). Wat
  van de weg ervoor openstond (D als stijl, de vorm van de HD-kar, ERNIE als schilder): `gereedschap/ai/ai-afwerking.md`.
- **De proefplaten**: de andere materialen (vraag 177; `beeld.md`, "De andere materialen") en het woordmerk (`beeld.md`,
  "Het woordmerk").
- **Het Engels lezen** (`engels.md`): *the innkeeper*, *the moneylender*, *the tradesmen*, *rent*, *the ledger*,
  *Martinmas*, *Good day*, Crookwick en Eastwold, de namen, en sinds 23 okt *carriers*, de zinnen van de overval
  (*Robbers were seen in the woods near the village. They will come soon.*) en van de punten (*Score*, *A new best!*);
  sinds 24 okt die van de scenario's (*Goal*, *New goal: …*, *Goal reached: …*, *Goal failed: …*, *Victory*, *Defeat*).
- De spullen bij de huizen (vraag 148, d), de ronde van alle huizen (vraag 144), en het geluid (vraag 145, 2: de sleutel
  `FREESOUND_KEY` en de domeinen van Freesound erbij).

**Daarna, in deze volgorde** (Marcel, 20 okt, bij R: "volgorde is akkoord")
1. **Bezig in sessie `ccr-fa3e2dd5-ylm9al`** (24 okt; Marcel: "Stap 2a: kaart en rand"): het level maakt zijn kaart (een
   vast eiland, een plek op naam, de rand op de stukken van 64), nog zonder menu.
   **187 en 188 bouwen**, na de demo, in de volgorde van `scenario.md` (9); stap 0, Tiled eruit, is af (23 okt).
   **1a en 1b zijn af** (24 okt): de motor (`scenario.md`, 2), en het demojaar als eerste level (`levels/demojaar.js`;
   `scenario.md`, 3; Marcel: "1b nu"): geen regel leest nog een vlag van de demo, en de speeltest speelt precies
   hetzelfde jaar (zaad 1 tot 3). De speeltest speelt nu ook in de cloud (`opmerkingen.md`). Het volgende is **stap 2,
   het level als recept** (een eigen kaart met een rand, en *Campaign* op het titelscherm): eerst een plan voor Marcel.
2. **189** achteraan: paarden, bijen, het kerkhof, en belegeren met 188.

Ernaast, als het past: na H4 F3, F4 en F6 (`snelheid.md`, "De tik"), en D1 of E3 en E4
(`snelheid.md`, "Na B1 en B2"); later de world gen bijstellen (wat precies, zegt Marcel). G, naar Steam, loopt mee op het
tijdpad van `commercieel.md`.

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

**Het plan voor de demo** (Claude, 18 okt; **besloten**, Marcel: "A. A1 -> Maar ik wil wel iets meer speeltijd dan een
maand, misschien 3? B. B2 -> Met exhorbitante eisen C. C2", en daarna: "Brief + teller 3 mnd ervoor", en B2 voor het
"Hele spel"). Wat er was: op 1 wijnmaand zijn brief met wat hij vraagt, op Sint-Maarten komt hij met twee soldaten over
de weg naar het plein en wacht drie dagen, een klik op hem opent een venster met schuiven (je kiest wat je geeft, hij
telt slecht, en daaronder een boete, soldaten of de schandpaal), en het eindscherm (`T.ui.toonEinde`); het eerste jaar
spaarde hij je (`heerVrij: 1` in `js/begin.js`), en weigeren kon niet. In zes stappen:
1. **Hij komt al in het eerste jaar**: `heerVrij` van 1 naar 0, voor het hele spel (de demo is het begin ervan). De brief
   bij de aankomst zegt dat hij op Sint-Maarten komt halen wat hem toekomt, en zijn grillen komen dan ook het eerste
   jaar: zo leer je hem kennen vóór hij komt.
2. **De klok** (A1, drie maanden): zijn brief met wat hij vraagt komt op 11 oogstmaand (was 1 wijnmaand), en vanaf dan
   staat bij de datum in de balk hoeveel dagen het nog is tot Sint-Maarten ("Martinmas in 23 days").
3. **Op het plein** (B2, voor het hele spel): een klik op hem geeft twee knoppen, *Pay* (hij neemt wat hij vraagt,
   zoveel als er is) en *Refuse*, en zijn eisen zijn buitensporig (een getal in de werkbank, zo'n drie keer wat hij nu
   vraagt), met een brief die dat met een uitgestreken gezicht uitlegt. Het venster met schuiven gaat eruit; wat er
   ontbreekt, geeft in het volle spel de straf zoals nu (boete, soldaten, schandpaal). Weigeren is ook in het volle spel
   zijn leger en de dood, tot het gevecht er is (F). De knoppen zijn zegels van rode lak (Marcel, 18 okt: "dat moeten
   mooie grote knoppen worden", "misschien in de stijl van een zegel, kaarsvet", "middeleeuwen enzo, koning heer"): heel
   is betalen, in tweeën gebroken is weigeren (`beeld.md`, "De zegels bij de heer").
   **Stap 1 tot 3 zijn gebouwd** (18 okt, lokaal; `spel.md`, Sint-Maarten, "Bijgewerkt op 18 okt"); tot de cinematic er
   is, eindigt weigeren met het eindscherm *Death*. **Stap 5 en 6 ook** (18 okt, lokaal): het eindscherm (*Death*, of in de
   demo *Until next year*), met het jaar in een paar regels en de link naar Steam zodra er een adres is, en de vlag
   `T.DEMO_INSTELLINGEN.aan` (`js/einde.js`, `verpakken.md`). De speeltest liep zonder fouten (op `908ddcb0`), met
   de heer in het eerste jaar; wat opviel, staat in `opmerkingen.md`.
4. **De twee cinematics** (C2; **gebouwd** (20 okt, in `main`); hoe het werkt:
   `spel.md`, Sint-Maarten, "Bijgewerkt op 20 okt", en `code.md` bij `js/regie.js`): de balken en knoppen weg, zwarte banden boven en onder, de camera rijdt mee, en een zin
   onderin; een klik of Esc slaat over. **Het plan voor stap 4** (Claude, 20 okt; **besloten**, Marcel: "A1 B1 C1"):
   **A1** nu bouwen met de tekeningen die er zijn (vraag 180 wisselt later alleen plaatjes); **B1** de scène speelt in de
   wereld: het leger zijn echte soldaten die over de weg lopen, en de dorpelingen vluchten met de regel van het gevecht;
   de regie doet alleen de camera, de banden en de zin, zodat dit leger later in het volle spel te bevechten is (F);
   **C1** de heer brengt zijn wagen mee bij zijn aankomst, en die staat drie dagen leeg op het plein te wachten. Wat
   Claude erbij koos: elke soldaat het licht van de lantaarn (vraag 171) als fakkel tot de tekening er is, de vaandels
   wachten op de tekening, een scène duurt zo'n halve minuut, en in een scène klik je niets in de wereld aan. In vier
   stukken: 4a de regie (alleen scherm), 4b weigeren, 4c betalen, 4d de toetsen en de speeltest. **Betaal je**: zijn mannen laden wat hij nam op zijn wagens op het plein, en de
   heer en zijn mannen rijden ermee de weg af; het beeld wordt zwart, en een zin zegt dat hij volgend jaar terugkomt, en
   meer wil. **Weiger je**: hij draait zich om en gaat; de nacht valt, en over de weg komt zijn leger, een rij van zo'n
   twintig soldaten met fakkels en vaandels; de dorpelingen vluchten naar het town hall; als ze het plein bereiken, wordt
   het beeld zwart, en er staat *Death*. Er wordt niet gevochten: het is een scène. Nieuwe tekeningen (C2): de heer te
   paard, de vaandels en de wagens van de heer, eerst in woorden (`beeld.md`), dan één proefplaat; tot ze goed zijn,
   spelen de scènes met wat er is (de heer te voet, de ossenkar).
5. **Het eindscherm**: wat je bouwde in een paar regels (het jaarboek is er al, `js/einde.js`), wat je koos, *Wishlist
   Tithebreaker* (zodra de Steam-pagina er is), en terug naar het menu.
   **Geparkeerd** (Marcel, 20 okt: "dit parkeren we even"): een cinematic die een AI maakt; wat het kost, waar het wringt
   en drie manieren (advies: geschilderde platen uit vraag 180, met de beweging in code): `opmerkingen.md`, "Geparkeerd:
   een cinematic die een AI maakt".
6. **Alleen in de demo** eindigt het spel ook na betalen: een vlag bij het verpakken, zoals het debugvenster
   (`verpakken.md`); in het volle spel speelt het dan door. Erbij: toetsen in `test/heer.test.cjs` (hij komt in het
   eerste jaar; betalen en weigeren), en de speeltest (de kolonist betaalt op Sint-Maarten van het eerste jaar).

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
  de kazerne blijft voor later; **G** de volgorde: G1 stap 1 tot 4 zo, G2 de proefplaat van de soldaten al na stap 1. Marcel erbij (15 okt): "iemand kan gewoon wapensmid worden. Daar moet nog een gebouw voor komen": de wapenmaker is een werkplaats in het gehucht waar een dorpeling wapensmid is; hij leent nu het beeld van de smidse, en zijn eigen tekening komt met de werkplaatsen in de bouwstijl (167). **De wapens** (Marcel, 15 okt: "kwa wapens wil ik: sword, spear, shield, pike, bow, crossbow, armor", en op vier vragen: vaste soorten, "Piek reikt 2, slaat harder", "Kruisboog door het harnas", "Allebei, later"): zes vaste soorten soldaten, zoals in Knights and Merchants, en een soort wacht tot al zijn stukken er zijn: militie (hooivork), speerman (speer en schild; sinds 21 okt speer en harnas, Marcel: "Speer is een 2 handed weapon"), piekenier (piek en harnas), zwaardvechter (zwaard, schild en harnas), boogschutter (boog), kruisboogschutter (kruisboog en harnas). De speer en de piek reiken twee tegels, de piek slaat harder en kost ijzer; de kruisboog schiet zo ver en zo vaak als de boog, maar schild en harnas vangen van een bout niets af; het harnas is nu van huiden (de jager), een ijzeren harnas komt later, als het dorp ijzer heeft. De wapenmaker maakt ze alle zeven. **Stap 1 is af** (15 okt, in `main`; `js/soldaten.js`, `spel.md`, "Zo werken de soldaten nu"): het tuighuis en het schuttershof zijn weg, en de kolonist van de speeltest zet een wachthuis en een wapenmaker en vraagt twee speermannen (regel 7c).
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
  **Stuk c in detail** (Claude, 17 okt; **besloten**, Marcel: "V2 G2 P1 B1", hieronder). Wat het besluit nog niet dekt: een kamp ver van de dorpen
  ligt in land dat nog dicht is (het land bestaat pas waar je mensen komen, B2b), je stuurt alleen naar land dat je kent
  (*You do not know that land*, met een zicht van 7 tegels), en een soldaat met dagdienst loopt 's avonds naar huis om te
  slapen. Het plan, in vier delen. **c1, de kampen op het eiland**: een nieuwe soort plek (`kamp`) uit het nummer van het
  eiland, zoals het kasteel en de dorpsplekken: drie per eiland (werkbank), minstens 150 tegels van elke dorpsplek en 40
  van een weg, in het bos op het hoofdland. Waar het ligt, komt uit het nummer; wat het doet (zijn mannen, zijn buit, of
  het verslagen is) staat op de kaart (`w.kampen`) en wordt bewaard. Gaat zijn stuk open, dan staat het er: een tent per
  twee man en een vuur (de tent en het kampvuur van het lege begin, in een roverskleur; eerst in woorden, dan één
  proefplaat). **c2, de bende**: een kamp begint met 2 man en krijgt er elk jaar een bij, tot 4 (de getallen van de wilde
  rovers nu), en wie uit een dorp wegtrekt, gaat naar het dichtste kamp. Ze hebben een naam, zijn van de wereld (geen
  dorp; elk kamp een eigen dobbelsteen, zoals een roedel), en staan thuis rond hun vuur. **c3, de overval komt uit een
  kamp**: op het rooster van nu (per dorp twee keer per jaar, de eerste na 60 dagen, de helft 's nachts), met de mannen
  van het dichtste kamp dat er heeft; is dat op pad of leeg, dan niet. Ze lopen over de wegen; door land dat dicht is,
  reizen ze buiten beeld (zoals de bode), en ze komen je land op waar hun weg het binnenkomt. Met de buit gaan ze terug,
  en in hun kamp ligt hij (K1). De hinderlaag op de bode komt ook uit het dichtste kamp. De wilde rovers en de bende van
  het dorp (`D.rovers.bende`) gaan eruit. (In d kiest het kamp zelf zijn dorp en zijn tijd, en leert het.) **c4, een kamp
  opruimen**: valt de laatste man, thuis of onderweg, dan is het kamp verslagen: de tenten gaan neer, het vuur gaat uit,
  de buit ligt er, en het komt niet terug (R1). Te kiezen: **V** hoe je een kamp vindt: V1 na de eerste overval ken je
  het (ze lieten een spoor: het kamp en zijn pad staan op de minikaart), V2 zelf zoeken, V3 je kent ze vanaf het begin.
  **G** hoe je er komt: G1 rechts op een kamp dat je kent (in beeld of op de minikaart), *Attack the camp*: je mannen gaan
  op tocht over de wegen, het land gaat open waar ze komen, en op tocht blijven ze in dienst, dag en nacht, tot ze terug
  zijn (hetzelfde lopen dient later de tocht naar het kasteel, en de rovers in d); G2 alleen naar land dat je kent, zoals
  nu. **P** de weg naar een kamp: P1 een smal paadje van de dichtste weg naar het kamp, gelegd zoals de wegen (langs de
  passen, over een brug), zodat elk kamp te bereiken is en je het pad kunt volgen; P2 geen paadje (dan zoekt de tocht
  dwars door land dat nog niet gemaakt is een weg, langs richels en rivieren: het moeilijkste en minst zekere). **B** de
  buit naar huis: B1 de mannen nemen hem mee (zoveel per man als een rover draagt), en hij telt als ze terug zijn in je
  bereik (een waar telt pas als hij binnen is); wat blijft liggen, haal je een tweede keer; B2 hij gaat meteen in de
  voorraad. Voorstel: V1, G1, P1, B1. Erbij: het opslaan een versie omhoog, en het eiland verandert een beetje (de
  paadjes door het bos), dus de toetsen die op een vast eiland spelen, kijken we na. **Gekozen** (Marcel, 17 okt): V2,
  G2, P1, en "B1, dan kun je het ook nog verliezen tijdens een gevecht", en erbij: "Ook moet je gewoon soldaten maar een
  onbekend deel van de kaart kunnen sturen. Stel je stuurt een soldaat maar de andere kant van de wereld met een klik, dan
  moet dat kunnen". Daarmee: je vindt een kamp zelf (geen teken na een overval), en geen eigen bevel voor een kamp; wel
  **c0, sturen naar onbekend land**, als eerste: een rechtsklik in het zwart (in beeld of op de minikaart) stuurt je
  mannen erheen, ook naar de andere kant van het eiland; het land gaat open waar ze komen, en ze zoeken onderweg hun weg
  (over een brug als er een rivier tussen ligt). Wie de buit draagt en valt, verliest hem (B1). **c0 is af** (17 okt, op
  de branch `ccr-b0684dee-kk0n5b`; `spel.md`, bij "Op tocht"; `code.md` bij `js/lopen.js`, "Door land dat nog dicht
  is"): de weg erheen is een grove weg over de schets en precies over wat open is, en een post ver van huis houdt hem
  dag en nacht in dienst. Het liet zien dat het eiland te voet in stukken gebroken is: vraag L ("Wacht op Marcel"),
  besloten (Marcel, 17 okt: "L1"): elke weg krijgt een bruggetje waar hij over water gaat, ook breed en schuin; het woud
  blijft een muur, met de wegen als passen.
  **De bruggen zijn in het spel** (17 okt; Marcel: "Goed zo, zet ze in het spel"; `beeld.md`, "De bruggen"; `code.md`
  bij `js/eiland.js` en `js/sprites.js`): drie tegels breed, steen of hout naar de plek, in twee lagen, en wie erop loopt
  gaat mee omhoog.
  **c1 in detail** (Claude, 17 okt; **besloten**, Marcel: "M1, en bouw c1 volgens het plan"). (1) **De plek**: na de wegen legt het eiland zijn kampen
  (`legKampen` in `js/eiland.js`, in `E.plekken` als soort `kamp`), drie per eiland, in het woud op het hoofdland,
  minstens 150 tegels van elke plek (dorp, stad, kasteel), 40 van een weg en 300 van elkaar (`T.EILAND_INSTELLINGEN.kampen`).
  Het kiest met een eigen lot, zodat de dorpsplekken, hun namen en de wegen van elk eiland blijven wat ze zijn. (2) **Het
  paadje** (P1): van het kamp naar de dichtste weg, met de zoektocht van de wegen (langs de passen, waar het goedkoopst
  is), één tegel breed, als een lijn in `E.paden` (gebouwd: een eigen lijst naast `E.wegen`); gaat het over water, dan krijgt het een brug zoals
  elke weg (dezelfde code). Op het paadje en op de open plek om het vuur (straal 8) staan geen bomen. (3) **In het
  spel**: gaat het stuk van een kamp open, dan staat het er, zoals het wild (`w.kampen`, bewaard): een tent per twee man
  (de bende begint in c2 met twee: één tent, de tweede komt met de derde man) met de opening naar het vuur, en het vuur
  van het lege begin, dat 's avonds en 's nachts brandt en overdag smeult; zijn licht zie je in het bos. De tent T1 komt
  als rij `tent-rover` in het vel (`kamp.cjs`, `naar-spel.cjs --alleen kamp`). (4) **Erbij**: `Spel.debug.kampen()`
  (waar ze liggen, hoe ver van je dorp; met `'erheen'` gaat het land open en kijkt de camera erheen), de kampen en hun
  paadjes op de eilandplaat, het opslaan versie 21, en toetsen: drie kampen per eiland op de afstanden, en het paadje
  aan de grond en te voet te halen vanaf elk dorp. De wilde rovers blijven tot c3. Te kiezen: **M** de minikaart: M1 een
  kamp dat je mensen gezien hebben, krijgt een rood teken op de minikaart, zodat je het terugvindt; M2 geen teken.
  Gekozen: **M1**.
  **c2 in detail** (Claude, 17 okt; **besloten**, Marcel: "N1", "D1", "H2", hieronder). (1) **Een kamp leeft vanaf het begin**: de kaart krijgt
  bij het begin van een spel alle kampen van het eiland (`w.kampen`; in c1 pas als hun land opengaat), want de bende
  groeit ook waar je nog niet kwam, en wie wegtrekt, moet ergens heen. Elk kamp heeft zijn bende en een eigen dobbelsteen
  (`k.lot`, uit het nummer van het eiland en van het kamp, zoals een roedel). Gaat zijn land open, dan staan de tenten,
  het vuur en de mannen er; het licht van het vuur gaat alleen over die kampen. (2) **De bende** (`k.bende`, een lijst
  `{ id, naam, vel, uit }`): twee man vanaf het begin, en elk jaar van het spel komt er een bij, tot 4, op de dag dat het
  jaar om is, zoals het aantal van de wilde rovers nu (`kampBende`, `kampErbijPerJaar`, `kampMeest`, in de werkbank).
  Wie van buiten komt, krijgt een naam en een uiterlijk uit de dobbelsteen van het kamp: een voornaam van de bewoners
  (`T.VOORNAMEN`), een jongere of volwassene, meest mannen (zoals de wilde rovers nu, `wildVel`). (3) **Wie wegtrekt**
  (`T.wordtRover`, vanuit `gaanWeg` in `js/bewoners.js`): een jongere of volwassene gaat naar het kamp dat het dichtst
  bij het plein van zijn dorp ligt, met zijn naam en zijn uiterlijk (`uit`: zijn dorp). Hij loopt het dorp uit zoals nu,
  en staat dezelfde dag in het kamp; onderweg zie je hem niet. (4) **Thuis rond hun vuur**: elke man heeft een plek op
  het plein om het vuur (uit de dobbelsteen van het kamp, niet voor een tent of op het paadje), en staat daar met zijn
  gezicht naar het vuur. Een tent per twee man: komt de derde, dan staat de tweede tent er (op de plek in
  `E.kampen[i].tenten`); valt er een, dan blijft zijn tent staan. De mannen zijn rovers zonder dorp (`e.rover`, `e.kamp`
  het nummer, `e.lid`), en de wereld werkt ze bij, één keer per kaart (`T.werkKampenBij` in `T.wereldTik`, na het
  zetten van de kampen), zoals het wild; hun jaar en hun nacht lopen ook waar je niet bent (`w.kampenDag`, zoals
  `w.beestenDag`). (5) **Een gevecht**: komen je mannen in hun zicht, dan vechten ze zoals een rover nu (`js/gevecht.js`,
  met de leiband vanaf hun vuur), met de dobbelsteen van hun kamp; wie valt, is uit zijn bende, en wie het overleeft,
  geneest na een nacht (vraag 55). Dat de laatste die valt het kamp verslaat, is c4; tot dan komt er het jaar erop
  gewoon weer een bij. (6) **Erbij**: `Spel.debug.kampen()` zegt per kamp wie er woont en waar hij vandaan kwam; het
  opslaan versie 22; toetsen (`test/kampen.test.cjs`): twee man bij het begin en een erbij per jaar tot 4, wie wegtrekt
  staat in het dichtste kamp, de tweede tent komt met de derde man, de mannen staan om het vuur als het land open is en
  zijn van geen dorp, en wat bij een dorp gebeurt, blijft letter voor letter gelijk met en zonder een gevecht bij een
  kamp ver weg (zoals bij het wild). Te kiezen:
  **N** waar ze 's nachts zijn: N1 ze slapen in hun tent (binnen, niet te zien), en één houdt de wacht bij het vuur; ziet
  hij een vijand, dan komen de anderen naar buiten (wie 's nachts komt, treft één man wakker; in c3 gaan ze juist 's
  nachts op pad); N2 ze staan dag en nacht om het vuur (het eenvoudigst).
  **D** de bende van een dorp nu (`D.rovers.bende`: wie wegtrok, komt na 10 dagen terug als rover, en daarna om de 20):
  D1 die gaat in c2 al weg, want wie wegtrekt, gaat nu naar een kamp, en een man staat op één plek; tot c3 komen er dan
  alleen nog wilde rovers van de rand, en ook de hinderlaag op de bode is wild (`js/bode.js`); D2 ze blijft tot c3, en
  wie wegtrekt, staat zolang op twee plekken (in het kamp, en in de bende van zijn dorp, die hem ook laat aanvallen).
  **H** als het dichtste kamp vol is: H1 4 is het meeste, ook met wie wegtrok (twee tenten, de plekken die het eiland
  geeft): hij gaat naar het dichtste kamp met plaats, en zijn ze alle drie vol, dan trekt hij van het eiland, zoals wie
  nu te oud is; H2 wie wegtrekt komt er altijd bij, ook boven de 4 (dan zijn er meer tentplekken nodig, en het eiland
  verandert een beetje). Voorstel: **N1, D1, H1**. Wat ze overdag doen (zitten, eens naar hun tent lopen) en dat je
  ziet wie er naar welk kamp ging, gaat naar `opmerkingen.md` als je het wilt. **Gekozen** (Marcel, 17 okt): "N1",
  "D1", en "H2; en voldoende rovers bouwen een Rovers Hol, met aparte huizen en eigen infra. allemaal slechte mensen en
  uitschot wonen er. Een dorp opzich" (dat hol is vraag 173, bij K). Met H2 in c2: van buiten komt er een per jaar bij
  tot 4, maar wie wegtrekt, gaat altijd naar het dichtste kamp, ook boven de 4. Een tent per twee man, tot de zes
  plekken om het vuur die het eiland al kent (`kampen.tenten`; `tentenMeest` van 2 naar 6, min wat op het paadje
  ligt, dus tot zo'n 12 man): de plek en het paadje van een kamp blijven wat ze zijn, alleen zijn lijst tenten wordt
  langer. Wie geen plek in een tent meer heeft, slaapt bij het vuur, tot het kamp een hol wordt (173). **c2 is af** (17
  okt, in `main`; `spel.md`, "De bende van een kamp"; `code.md` bij `js/rovers.js`; `test/kampen.test.cjs`). Voor c3:
  de kans voor de bode (`T.bodeGevaar`, js/bode.js) telt sinds c2 geen bende meer; de hinderlaag uit het dichtste kamp
  kan haar weer laten meetellen.
  **c3 in detail** (Claude, 18 okt; **geparkeerd**, Marcel, 18 okt: eerst de basis, O1). (1) **Het rooster blijft**: per dorp twee keer per jaar, de eerste
  na 60 dagen, de helft 's nachts (`R.wildeOp`, `aanvalsUur`). De overval komt uit het kamp dat het dichtst bij het plein
  ligt en mannen thuis heeft; is er geen (alle kampen leeg of op pad), dan komt er deze keer niemand, en loopt het rooster
  door. (2) **De tocht**: ze vertrekken zo dat ze op het uur van de aanval bij je zijn. Hun weg is de grove weg van c0
  (`js/lopen.js`: het paadje, de wegen, de bruggen), de reistijd die lengte op hun pas. Staat het kamp er, dan zie je ze
  het paadje af lopen tot de rand van de open plek; daarna reizen ze buiten beeld, zoals de bode, op de klok. Wie op pad
  is, staat niet in het kamp (`lid.opPad`); de tenten blijven staan. (3) **Je land op** waar hun weg het binnenkomt (B).
  (4) **Op de akker zoals nu** (twee uur roven, graan uit de voorraad, soms de akker kapot), en terug langs dezelfde weg:
  aan de rand gaan ze uit beeld, en na de reistijd staan ze weer in hun kamp. De buit ligt in het kamp (`K.buit`, graan
  en goud), voor wie het in c4 opruimt (K1). Wie onderweg valt, is uit zijn bende (zoals nu). (5) **De hinderlaag op de
  bode** komt uit het dichtste kamp met mannen thuis (hooguit `aanvallers`, 2), en anders zijn er geen rovers onderweg;
  ook buiten beeld is een rover die sneuvelt uit zijn bende, en wat ze de bode afnemen, gaat naar hun kamp. (6)
  **Eruit**: de wilde rovers (`soort: 'wild'`, `wildVel`, een rover van een dorp zonder kamp). **Erbij**:
  `Spel.debug.rovers(n)` laat de mannen van het dichtste kamp meteen komen (zonder reis), `Spel.debug.kampen()` zegt wie
  op pad is en wat er aan buit ligt; het opslaan versie 24; toetsen (`test/rovers.test.cjs`, `kampen`, `bode`): de
  overval komt uit het dichtste kamp met mannen, het kamp is zolang leeg, de buit ligt erna in het kamp, en geen kamp met
  mannen is geen overval; en de speeltest. Te kiezen:
  **A** hoeveel er gaan: A1 zoveel als het rooster nu zegt (2, elk jaar een meer, tot 4), de rest blijft thuis; A2 de
  hele bende. **B** waar ze je land op komen: B1 langs hun weg, zodra ze 40 tegels van de akker zijn (of later, als het
  land daar nog dicht is); B2 aan de rand van de 100 bij 100 van je dorp, aan de kant van het kamp. **C** de buit van een
  rover die valt: C1 hij ligt er als een losse stapel (zoals na het afbreken, `js/afbreken.js`), en de kar haalt hem als
  hij in je bereik ligt; C2 hij is weg (zoals nu). Voorstel: **A1** (de balans blijft, en een kamp is zelden leeg als je
  het vindt), **B1** (niets nieuws gaat uit van de 100 bij 100, en ze komen echt over de weg en de brug), **C1** (een
  waar telt pas als hij binnen is, en zo kun je de buit terugwinnen, zoals je hem met B1 kunt verliezen).
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
- **Voor 6c, valsspel en mods** (Marcel, 16 okt: mods zijn welkom, en "Ja" op het controlegetal; `verpakken.md`, "Open
  voor mods"): het controlegetal is ook de vangst voor wie zijn wereld in de console verandert; met D1 wint de wereld van
  wie opende. Bij meedoen een getal over de geladen bestanden, niet alleen `T.STAND` (een gemodde `js/` houdt dezelfde
  commit). De mist is in lockstep alleen beeld: de hele kaart is met de console te zien; dat nemen we voor lief.
- **Lockstep blijft** (Marcel, 17 okt, "Ik denk A", op "wie speelt er samen, en met hoeveel?"): twee tot vier vrienden,
  over Steam. Een server die de wereld rekent (geen mist om doorheen te kijken, geen valsspel), is pas beter bij
  vreemden met een ranglijst, bij acht of meer spelers, of bij een eiland dat blijft bestaan; ze kost een eigen server.
  Wat er is, gaat dan niet verloren: een opdracht (`T.geefOpdracht`) gaat net zo goed naar een server. Factorio (een economie,
  mods, lockstep) als voorbeeld voor het open punt hierboven: wat jij doet, zie je meteen bij jezelf, en het gaat pas
  een paar tikken later echt in.

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

## K. Het rovershol (vraag 173, 17 okt)

Marcel, 17 okt, bij de keuzes voor c2 (bij I, "c2 in detail"): **"voldoende rovers bouwen een Rovers Hol, met aparte
huizen en eigen infra. allemaal slechte mensen en uitschot wonen er. Een dorp opzich"**. Wat al vaststaat: met H2 groeit
een kamp door wie uit de dorpen wegtrekt, tot zo'n 12 man in zes tenten; wie dan nog komt, slaapt bij het vuur, tot het
kamp een hol wordt. Nog geen plan (eerst speelbaar: niet in de stap die loopt). Wat het plan moet zeggen: hoeveel
"voldoende" is (alle tenten vol?), of het hol op de plek van het kamp komt of een eigen plek op het eiland krijgt, wat
zijn huizen en zijn infra zijn (eerst in woorden, dan een proefplaat), of het in de code een dorp is (een `D` op de kaart,
zoals het tweede dorp van 6a, dat zelf kiest uit de handelingen van een mens: 6b), wat het doet (roven, handelen met wie
wil, wegtrekkers lokken), en hoe je het verslaat. Voorstel voor de volgorde: na stuk c en 6b, omdat een hol dat zelf
bouwt een dorp is dat kiest zonder speler.

## L. De heuvels op het hele eiland (vraag 174, 17 okt)

Marcel, 17 okt: **"de map maker gebruikt ook nog geen heuvels die we eerder wel hebben gemaakt"**. Hoe het nu is: de
heuvels van vraag 121 (`js/hoogte.js`, `kaarten.md`) zitten achter de spelregel *Height*, standaard *Flat* ("vlak tot de
speeltest laat zien dat het spel er net zo goed mee loopt", `js/opties.js`), en ze zijn van vóór het hele eiland in
stukken (B2). `w.hoogte` was één raster: het eerste land van 100 bij 100 met 48 tegels eromheen. Daarbuiten vroeg
elke hoek het eiland opnieuw (`eilandOp`, een `T.eilandStuk` van één tegel): in Node gemeten (17 okt, proefdorp) kostte
een scherm vol tegels (3600, vier hoeken) daarbinnen 1,2 ms en daarbuiten zo'n 160. Ook nog open: de mist ligt plat op de heuvels (B2c), een brug volgt de glooiing (`opmerkingen.md`, bij
de bruggen), en alleen het eerste dorp krijgt zijn vlakte (`opmerkingen.md`, bij 6a).

**Stap a is af** (17 okt, in `main`; Marcel: "Ja, begin met stap a"; `code.md` bij `js/hoogte.js`): de hoogte per stuk
van 64 bij 64. Een scherm vol tegels ver van het dorp kost nu 0,9 ms (was 160), een nieuw stuk eens zo'n 20 ms, en de
uitkomst is bit voor bit dezelfde (twee eilanden, ook na vier vlakke stukken; `test/hoogte.test.cjs`). In de browser,
met heuvels en land open 230 tegels van het dorp: het eerste beeld 400 ms (met het land zelf), daarna 8,6 ms (in een
verborgen paneel, dus alleen een richting). **Wat a liet zien, voor b:** het licht op de hellingen (`lichtKaartVan`)
en de hoogste en laagste grond (`hoogsteVan`) in `js/tekenen.js` beslaan alleen het dorpsvak (`T.kaartVak`), en het
licht wordt bij elk nieuw vlak stuk (elk gebouw) helemaal opnieuw gemaakt; dat moet ook per stuk.

**Het plan (Claude; Marcel koos eerst a, b tot d volgen):** **a** de hoogte per stuk van 64 bij 64, zoals het land: de hoeken van een
stuk eens uitgerekend als het opengaat, en de vlakke stukken per stuk gezocht (alleen `js/hoogte.js`, met een toets dat
een stuk ver weg even snel is als het eerste land); **b** wat erop ligt volgt de heuvels: de mist, een brug vlak, en
elk dorp zijn eigen vlakte; **c** meten, want performance gaat voor: het zwaarste beeld in Firefox en in Edge, ook na
een paar speeldagen, en de kolonist op vijf eilanden; **d** dan staan de heuvels altijd aan en gaat de spelregel eruit
(CLAUDE.md: een spelregel die het oude alleen houdt tot het nieuwe af is). Na het tekenwerk dat loopt (b en c raken
`js/tekenen.js`); a kan ernaast.

**Stap b in detail** (17 okt; Marcel: "B. B2, K. K1, M. M2"), elk met toetsen en gemeten:
- **b1, het licht en de hoogste grond per stuk, is af** (17 okt; `code.md` bij `js/hoogte.js`): een lichtplaatje per
  stuk van 64 (was alleen het dorpsvak, en bij elk gebouw helemaal opnieuw), 2 ms per nieuw stuk; de hoogste en laagste
  grond per vak, ook voor wat er in beeld komt (een tegel onder het beeld kan op een heuvel erin liggen; bij het dorp 2
  ms per beeld erbij); en na een nieuw gebouw de grond opnieuw tot waar de glooiing veranderde (eerst alleen de voet,
  met een ring op de oude hoogte). Wat het liet zien, voor c: met heuvels kost een beeld ver uitgezoomd in Chromium zo'n
  54 ms, met 17 kladjes van samen 6 miljoen pixels per beeld (`Spel.gl.telling`), waarschijnlijk de tegels die iets
  afdekken (`heuvelsErvoor`, `tekenTegelOpnieuw`) of de wanden.
- **b2, elk dorp een vlakte, is af** (17 okt): een vlakte per dorp (`w.hoogte.vlaktes`) in plaats van één `midden`,
  en het plein van een dorp dat erbij komt een vlak stuk (`T.legDorpVlakte`, vanuit `T.legDorpOpKaart`); opslaan versie
  23. K1 was er al: het eiland legt het plein van een roverskamp vlak, op de hoogte van zijn vuur (`js/eiland.js`, c1).
- **b3, een brug ligt vlak op de hoogte van de oevers, is af** (17 okt; Marcel: "Toch B2: de brug op de oevers, met de
  pijlers in code verlengd"; `beeld.md`, "De bruggen", bij Op de heuvels): de brug op het gemiddelde van zijn oevers
  (nooit onder zijn water), de grond van de landhoofden vlak op die hoogte zonder het water mee te trekken, en de voeten
  van het dek tot het water verlengd met hun eigen onderste rij steen of hout. Midden op een brug meestal 0 à 4 pixels,
  hooguit zo'n 9.
- **b4, de mist op de heuvels, is af** (17 okt; `code.md` bij `js/mist.js`): het masker via een net per stuk, een punt
  op het midden van elke tegel op zijn hoogte, naar een laag op de halve maat, en dan de mistlaag van nu; met de
  videokaart bij het dorp niets meetbaars. Zonder videokaart precies per tegel (M2): 28 ms bij het dorp, 140 ver
  uitgezoomd, en dat mag, want **zonder videokaart speelt niemand** (Marcel, 17 okt: "Iedere laptop of apparaat,
  handheld etc. heeft een APU of GPU"; `code.md` bij `js/gl.js`). Onderweg: het licht van b1 bleef leeg (een `c` die het
  doek had moeten zijn); nu getoetst in de browser, met en zonder licht zijn alle stukken grond anders.

**Stap c, meten, is af** (17 okt; `code.md` bij `js/hoogte.js` en `js/gl.js`; `opmerkingen.md`). De tekenmeting mat tot
nu toe zonder echte videokaart (SwiftShader), dus ook de 54 ms van b1; nu kan het met (`--videokaart`, `--edge`,
`--hoogte`, `--dagen`; `gereedschap.md`). Om en om gemeten in één browser (de losse runs liepen uiteen van 20 tot 52 ms
vlak, door wat er naast draaide): met heuvels ver uitgezoomd eerst zo'n 40 ms per beeld, nu 30, door drie dingen die
alleen de heuvels hadden. De tegels die afdekken gingen met een knip over het kladdoek (3,5 miljoen pixels per beeld
naar de kaart; nu driehoeken, `tekenUitgeknipt`), `heuvelsErvoor` vroeg elke tegel in beeld en zette de hele tekenlijst
in een Set (nu `T.dekkersIn`), en `T.hoogteOp` zocht voor alles wat getekend wordt vier keer zijn stuk. Wat blijft,
vlak tegen heuvels (ms per beeld, 1920×1080, proefdorp op eiland 5): in Chromium dichtbij 5 tegen 9, op 0,5 20 tegen 29,
op 0,35 24 tegen 28; in Edge 5 tegen 9, 16 tegen 21, 18 tegen 20; na drie speeldagen hetzelfde, zonder kladjes en met 13
tot 41 opdrachten. Het verschil is vooral meer in beeld (wat hoog ligt, komt van onder het beeld erin) en het graan op
een helling (`opmerkingen.md`). Ver uitgezoomd haalt ook vlak de 60 hier niet: dat is geen zaak van de heuvels
(`opmerkingen.md`). De kolonist op vijf eilanden met heuvels (`npm run speeltest -- --zaden 1-5 --regel hoogte=heuvels`, naast dezelfde
vlak): elk eiland het jaar uit, zonder fouten, en het dorp groeit (17 naar 22 à 33). Op 3 en 5 precies als vlak (het
dorp ligt op zijn vlakte); op 1 beter (33 tegen 25 mensen, geen doden), op 2 slechter (24 tegen 33, drie doden in de
winter, kou en geen hout), op 4 iets beter. Dat patroon van kou en geen hout zit vlak op eiland 1: het is het eiland,
niet de heuvels (de balans test Marcel zelf). **In Firefox** (Marcel, 17 okt, het proefdorp op eiland 5, de browser op
120%, regen; de meter, *drawing*): dichtbij 7,9 vlak tegen 11,8 met heuvels, allebei 60 beelden per seconde;
helemaal uitgezoomd 24,8 tegen 28,9 ms (38 tegen 29 beelden per seconde), en het traagste beeld 33 tegen 50 ms. Dus
ook daar 4 ms erbij, zoals in Chromium en Edge.

## M. Het licht in de nacht (vraag 175, 17 okt)

Marcel, 17 okt: **"Het licht in de nacht is nep, ik wil dat het meer wordt zoals de lantaarns die we hebben voor de
soldaten. Dat is zachter. Nu heb je 1 felle lichtbol."** Hoe het nu is (`js/tekenen.js`, `lichtenInBeeld`; `js/gl.js`,
`FRAG_PLAS`): elke lamp (de herberg, de ramen, het kampvuur, de vuren van de kampen, een brand, wie een lantaarn draagt)
is een plas licht van dezelfde vorm, een ellips die van het midden naar de rand afneemt (`t * t`), opgeteld op de
lichtkaart; de lantaarn van een groepsleider is alleen kleiner getekend (`beeldStraal`, vraag 171, L3). **Het is het
kampvuur** (Marcel, 17 okt: "het licht waar ik op doelde was het kampvuur, dat lijkt heel fel in de nacht, maar ook
onnatuurlijk. Dit onnatuurlijke was ook zo bij de lantaarn, dat hebben we later aangepast"). Wat Claude vond: het
kampvuur (`T.kampLicht`, `js/begin.js`, en de vuren van de roverskampen, `T.roverskampenLicht`) heeft geen kleur in
`T.LICHT_INSTELLINGEN.kleuren`, dus is zijn licht wit, en het is een plas van 6 tegels met sterkte 0,9
(`T.BEGIN_INSTELLINGEN.vuur`); de lantaarn ging met L3 van 3 tegels en 0,5 naar 1,5 tegel en 0,35 op het scherm, met de 3
tegels nog voor de wolven. Zo ook hier: een warme kleur, en een kleinere en zachtere plas op het scherm, met de 6 tegels
voor de regel. **Af** (17 okt; Marcel koos K3 uit vier proeven: "K3: warm, 3 tegels, 0,45. Bouw het zo"): het kampvuur en
de vuren van de roverskampen zijn warm (255, 150, 64), 3 tegels en 0,45 op het scherm, smeulend 0,2 (was 0,35, naar
verhouding mee); de wolven blijven op 6 tegels (`code.md` bij `js/zien.js`).

## N. Zicht in een dicht dorp: de aanpak van Stronghold (vraag 176, 17 okt)

Marcel, 17 okt, met een uitgewerkte opdracht ("Aardschok — Stronghold-aanpak voor zichtbaarheid en camerabediening"):
de speler moet compact kunnen bouwen, huizen naast elkaar en smalle straten, maar hoge gebouwen en grote daken verbergen
wat erachter staat. Houd het gewone beeld mooi, en geef eenvoudige, directe middelen om het verborgene te zien, zoals
Stronghold; de camera hoeft niet vrij of 3D te worden. Het hele plan staat in `beeld.md`, "Zicht in een dicht dorp".
De punten, met Marcels prioriteit:

1. **Gebouwen plat** (Stronghold: spatie): een schakelbare weergave waarin elk gebouw een lage tekening wordt, op zijn
   eigen voet en plek, herkenbaar en aan te klikken, ook gewoon tijdens het spelen; liefst vooraf gerenderde tekeningen,
   niet de bestaande samengedrukt. Alleen beeld, geen spelregel.
2. **Het land lager** (Stronghold: V): de heuvels in beeld afvlakken, de echte hoogte blijft. Laag, zolang heuvels geen
   zichtprobleem zijn.
3. **De camera draaien** (X/C): vier vaste standen. Later, niet nu; een extra, geen oplossing voor het zicht (de
   cameraproef van 17 okt, `gereedschap/cameraproef/evaluatie.md`, zegt hetzelfde).
4. **Zoomen** (Z): een overzicht waarin een groot dorp leesbaar blijft, scherpe pixels zonder flikkeren of
   verspringen, en kiezen en plaatsen op elke zoom. **Hoog**: het raakt het spelen elke dag.
5. **Vrij bouwen blijft**: compact mag zolang de bouwregels het toestaan, niet verbieden omdat het overlapt; bij het
   plaatsen de hele voet, de ingang en de aansluiting op de weg, en de bestaande gebouwen even plat als dat helpt.
6. **Wie verborgen staat, kiezen**: een inwoner achter een huis is te vinden en te kiezen (een omtrek, een cirkel), een
   gekozen gebouw blijft herkenbaar, eventueel de gebouwen ervoor even plat; geen vaste grote tekens boven iedereen.
7. **De volgorde in het beeld**: de kunst blijft zoals ze is, maar wat je moet zien gaat voor; geen onnodige
   doorzichtigheid, felle randen of vaste lagen.

De volgorde (Marcel): een proef naast elkaar (gewoon tegenover plat) in een extreem dichte straat; kijken of het genoeg
helpt; dan een schakelbare weergave in het spel; dan de tekens bij het bouwen en het kiezen van wie verborgen staat; dan
de zoom apart; en pas daarna draaien en het land lager. **Stap 1, de proef** (alleen beeld; het spel, de kunst en de
regels blijven): hetzelfde dichte dorp (minstens 8 gebouwen, bomen, wegen, inwoners) uit dezelfde camera en zoom, als
A gewoon, B alle gebouwen plat, en C alleen plat wat het zicht neemt op één gekozen inwoner of gebouw, met een
vergelijkingsplaat en een korte beoordeling. **Stap 1 is af** (17 okt; `gereedschap/zichtproef/evaluatie.md`, de plaat
`zicht_vergelijking.png`): in een extreem dichte straat van elf huizen is in A 1 van de 6 inwoners te zien, 8% van de
straat en 1 van de 11 deuren; met alles plat (B) alle 6, 83% en 10 van de 11. C maakt voor een gekozen inwoner één huis
plat, voor een gekozen hut vier. Plat lost dus op wat draaien niet oploste (de cameraproef). De platte tekening komt uit
de huizenbouwer (`plat.cjs`): geen dak, de muren aan de kant van de camera tot de heup en achter laag (een doorsnede;
alles tot de heup dekte de straat nog af), de vloer in de kleur van het dak.

**Stap 4, plat in het spel: het plan** (17 okt; Marcel: "Ja: plat wordt een weergave in het spel"). Alleen beeld: de
wereld, de regels en het opslaan merken er niets van; plat is een veld van het scherm (`T.schermVelden`), geen
spelregel. De speler bouwt huizen uit de huizenbouwer en werkplaatsen uit `dorp.cjs`, dus twee stukken renderwerk.

- **4a, de platte tekeningen van alle huizen: af** (17 okt; Marcel keurde de proefplaat goed). De snede staat in de
  huizenbouwer (`renderHuisPlat` in `huizen.cjs`, ook voor de kapel en de zagerij; de vloer krijgt het patroon van het
  dak recht erboven), `gereedschap/pixelart/plat.cjs` rendert: 607 jonge tekeningen in 67 minuten, elk
  `tegels/plat/<naam>.png` met een eigen anker, en `tegels/plat.json` + `.js` (`T.PLAT.platten`); een oude deelt die
  van zijn jonge (`code.md` bij `gereedschap/pixelart/`, `test/plat.test.cjs`).
- **4b, in het spel: af** (24 okt; Marcel: "A", met F; `beeld.md`, "Zo werkt het nu", en `code.md` bij de gebouwen plat).
  Het plan was: een toets zet plat aan en uit; dan tekent het spel van elk huis de platte tekening (`js/tekenen.js`,
  zoals de daksneeuw en de bouwfasen: `T.sprites.plat`), op dezelfde plek en in dezelfde volgorde. In plat gaan uit: de
  ramen 's nachts, de sneeuw op het dak, de rook en de doorkijk. Een bouwplaats is plat zijn fundering (fase 1). Wat elk
  voorwerp van zijn plaatje onthoudt (`js/sprites.js`), krijgt plat erbij. Een klein teken op het scherm zolang plat aan
  staat. Toetsen: elk huis heeft een platte tekening, en plat verandert niets in `S`. Meten (performance): omschakelen
  met een vol beeld, en het tekenen plat tegen gewoon, ook in Firefox.
- **4c, de werkplaatsen** (29, `tegels/gebouwen/`): dezelfde snede op de vormen van `dorp.cjs`, zoals `bouwfasen.cjs`
  ze al op een hoogte snijdt. Tot dan staan ze in plat gewoon.
- **4d, alleen plat voor wie je kiest** (C van de proef): later, als je het wilt; de doorkijk weet al wie wie bedekt.
- Niet in stap 4: plat bij het bouwen (punt 5 van de opdracht) en wie verborgen staat kiezen (punt 6).

**Besloten** (17 okt; Marcel koos bij alle vier A): (1) de muren als de doorsnede van de proef (voor tot de heup,
achter laag); (2) de vloer in de kleur van het dak, met rijen zoals een dak in plaats van het dambord; (3) de toets is
de F (de spatie blijft het laatste bericht); (4) schakelen, zoals Stronghold, met een klein teken zolang plat aan staat.
**Het volgende is 4c**, de werkplaatsen plat (renderwerk: eerst een proefplaat).

## O. De nieuwe stijl: de nabewerkte herberg als maat (vraag 177, 17 okt)

Marcel, 17 okt, met een uitgewerkte opdracht ("Aardschok — Nieuwe definitieve artstijl") en twee plaatjes: de herberg
uit de huizenbouwer en dezelfde herberg met ChatGPT nabewerkt (`voorbeelden/herberg-stijl-origineel.png` en
`-doel.webp`): "Dat is de norm die ik wil aan gaan houden". Gevraagd: zachter licht, natuurlijker kleur binnen een
materiaal, rijker riet, pannen, hout, steen en pleister, minder harde patronen, de silhouetten scherp, en vier kanten
gelijk; geen filter over het plaatje, wel de gegevens van de tekenaar; eerst een losse proef, de tekeningen van het spel
blijven. De proef: zes gebouwen oud en nieuw, twee van vier kanten, een plaat en een kort verslag.

**De proef is af** (17 okt; het verslag in `beeld.md`, "De nieuwe stijl"; `gereedschap/pixelart/stijlproef.cjs`, los,
met haken in de bouwer die alleen in het geheugen bestaan): drie lagen op wat de tekenaar per pixel weet (nieuwe
patronen, zachte schaduw, fijnere kleur met een tint). Het riet meet zo rustig als het doel (0,038 tegen 0,029; oud
0,076), even duur om te renderen. **De andere materialen zijn af** (17 okt; Marcel: "Do the other materials next, one by
one on a proof plate"; `beeld.md`, "De andere materialen"): leien, pannen, spanen, planken, baksteen en leem, elk een
eigen patroon en een plaat (`stijlproef.cjs materialen`, `uit/stijlproef/materiaal-<naam>.png`); negentien haken in
alles. Nog zonder eigen patroon: zandsteen en het vlechtwerk zelf.

## P. Ver uitgezoomd sneller (vraag 178, 17 okt)

Marcel, 17 okt, na zijn meting van de heuvels in Firefox (bij L, "Stap c"): **"Maar de perfomance moet echt wel veel
beter"**. Hoe het nu is (`opmerkingen.md`, "Ver uitgezoomd haalt het spel in Chromium en Edge de 60 niet"): het
proefdorp op eiland 5, helemaal uitgezoomd (0,35), kost in Firefox 24,8 ms tekenen (38 beelden per seconde; met heuvels
28,9 en 29), in Chromium en Edge 16 à 24 ms; dichtbij 60 beelden per seconde. Het meeste is rekenwerk van het spel per
ding in beeld, ver uitgezoomd zo'n 4000 (vooral bomen).

**Wat het meten liet zien** (17 okt, Chromium met de videokaart, vlak, zoom 0,35, een profiel per fase): in het vak dat
het spel per beeld langsloopt, liggen zo'n 9500 dingen: 6560 in het zwart (land dat je niet kent), 2414 in het grijs
(bijna alle bomen) en 547 in zicht. Alle 9500 krijgen het hele werk (`T.voorwerpenIn`, `T.isZichtbaar`, `isGebakken`,
de diepte, een item in de tekenlijst, de doorkijk), en pas `mistOverLijst` gooit de 6560 in het zwart eruit. Van wat
blijft, tekent de lijst elk ding (`tekenVoorwerp`: het plaatje kiezen, `isPlat`, `onthoudVoorwerp`), en
`tekenZonneschaduw` loopt de hele lijst nog eens langs voor de schaduwen. De 2400 bomen in het grijs staan stil (in het
grijs loopt niemand) en worden toch elk beeld opnieuw opgebouwd.

**Het plan (Claude):**
- **1, wat je niet ziet, niet rekenen** (geen verschil in beeld): de mist vóór de tekenlijst, per tegel één vraag, zodat
  wat in het zwart ligt niet eerst het hele werk krijgt.
- **2, per ding het vaste werk eens** (geen verschil in beeld): wat voor een boom niet verandert (welk plaatje, plat,
  gebakken, de diepte), onthouden in plaats van elk beeld opnieuw, en minder losse dingen per item.
- **3, keuzes met een verschil in beeld** (na 1 en 2, op de meting): (a) het bos in het grijs in de grondbuffer bakken,
  dan wuiven de bomen in het grijs niet meer en tellen ze niet meer per stuk (de grootste winst ver uitgezoomd); (b) ver
  uitgezoomd geen zonneschaduw per boom.
- **4, later en groot**: de videokaart de diepte zelf laten doen, met vaste buffers per stuk land, zodat duizenden
  bomen geen werk per beeld meer zijn; een verbouwing van `js/gl.js`.

Na elke stap meten, om en om tegen de stand ervoor, en Marcel meet in Firefox.

**A1 en A2 zijn af** (17 okt; Marcel: "Ja, begin met A1 en A2, en meet daarna"; `snelheid.md`, met de tabel; `code.md`
bij `js/tekenen.js`): ver uitgezoomd van zo'n 30 naar 19 ms per beeld, vlak en met heuvels (om en om tegen de oude
stand, Chromium), dichtbij een kwart minder. In beeld precies dezelfde plaatjes op dezelfde plek; alleen een boom die
buiten de rijen van een gebouw over zijn dak valt, kan aan de rand van volgorde wisselen, zoals eerst bij het schuiven.
Het volgende is B (wacht op Marcel).

**Het onderzoek** (Marcel, 17 okt: "kun je eens onderzoeken welke optimalisatie technieken we nog zouden kunnen
toepassen?"): `snelheid.md`, met alles wat er nog kan (A minder werk op de processor, B de videokaart meer laten doen,
C vooraf tekenen, D rondom), elk met de winst, de prijs en of je het ziet. Wat het erbij vond: het vak dat het spel
langsloopt, is een rechthoek in tegels om het schuine beeld, dus van de 14.564 dingen erin vallen er 4.815 buiten
beeld, en 79% krijgt het werk voor niets (A1 neemt ook dat mee). En Steam is Chromium (Electron), dus Chromium is de maat
voor de Steam-versie. Voorstel van Claude: eerst 1 en 2 hierboven (A1 en A2), dan niet 3a maar 4 (B1 tot B4: een
dieptebuffer, want de bomen hebben alleen harde randen, en vaste buffers per stuk), en een lagere maat voor de wereld
als instelling (C3).

**De renderproef, B5, B1 en B2, en de regen en de mist zijn af** (17 en 18 okt, in `main`; Marcel: "Ja, bouw stap 1",
"dan bouwen we nu b1 en b2", "Misschien zoveel mogelijk offloaden naar gpu", "Regen en mist doen maar"; `snelheid.md`,
B en E, en `gereedschap/pixiproef/evaluatie.md`): `js/gl.js` is WebGL2 met instanties en een textuurstapel, de bomen en
het groen staan per stuk land in vaste rijen op de kaart met een dieptebuffer, en de regen en het masker van de mist gaan
ook naar de kaart. Om en om gemeten in Chromium, steeds met hetzelfde beeld (op de gelijke gevallen tussen twee texels
op 50% en 75% na): ver uitgezoomd nu 1,7 ms per beeld voor de processor en 4,4 met de kaart erbij. B4 is niet meer
nodig, C1 en C4 ook niet. **Het volgende**: Marcel meet in Firefox; daarna D1 (haperingen bij een ander seizoen of ver
verderop kijken, vooral de grond) of E3 en E4, op zijn keuze.

## Q. Het eerste jaar speelbaar (vraag 181, 20 okt)

Het derde stuk van O1 (Marcel, 18 okt: "dan een speelbaar eerste jaar"), na het doel van de demo en E. Het plan van
Claude (20 okt): eerst een speellijst voor het demojaar, dan speelt Marcel, en wat scheef zit eerst met een getal uit de
werkbank. Marcel koos (20 okt: "A. A1 B. B1, en B2 C. C3 [...]"), en kwam met drie punten erbij:
- **a. De speellijst** (A1): één lijst voor het demojaar, van de huifkar tot Sint-Maarten, in de volgorde waarin je het
  tegenkomt, met de punten uit "Wacht op Marcel" die erbij horen; en de rest van die lijst opgeruimd (wat geparkeerd is,
  naar zijn onderwerp).
- **b. Vee in het lege begin** (B1 en B2; `opmerkingen.md`, "Geen vee in het lege begin"): de kar brengt bij het begin een
  paar dieren mee, en de marskramer verkoopt vee.
- **c. Steen en water** (C3; `opmerkingen.md`, "De natuur buiten het bouwbereik"): zo laten, want een schuur heeft een
  eigen bereik, eerst gemeten over een paar eilanden. Marcel erbij: "maar indien er geen steen of water in de buurt is,
  houden we de gebouwen uit het bouwmenu. Heeft dan weinig zin" (de steengroeve, de visser, de rietsnijder).
- **d. De maker** (Marcel, 20 okt: "We moeten ook de generator (maker) aanpassen. Vaak zit je nu vast in een dicht bos en
  kun je moeilijk bouwen"; zo wordt "de world gen bijstellen" van 18 okt concreet).
- **e. Soldaten in de demo** (Marcel, 20 okt: "Ik wil ook een paar soldaten zodat de demo laat proeven wat vechten is,
  maar ik wil de trainings gebouwen voor de demo zelf geblokkeerd hebben om het te houden voor het 'echte' spel. Zo deden
  games het vroeger ook"): een paar soldaten om mee te vechten, en het wachthuis (en de wapenmaker?) dicht in de demo
  (`T.DEMO_INSTELLINGEN`, js/einde.js).
- **f. De poppetjes** (Marcel, 20 okt: "Ik zou anders graag een paar soldaten maken, en ook de rest van de poppetjes.
  Deze zijn namelijk niet al te best, dat breekt de immersion een beetje"): met de pijplijn van vraag 180. **Niet in de
  cloud** (gemeten 20 okt): geen videokaart, 4 kernen en 15 GB, en de netwerkregels van de omgeving weigeren
  `huggingface.co` (de modellen), `download.pytorch.org` en de diensten (Replicate, fal, OpenAI). Ook met toegang zou
  SDXL met ControlNet op 4 kernen minuten per beeld kosten, voor acht richtingen maal elke houding. Dus lokaal op Marcels pc
  (de 1080 Ti, ComfyUI), en de cloud maakt wat zonder AI kan: de modellen, de renders en de nabewerking.
  **Besloten** (Marcel, 20 okt: "wil je eens een aantal nieuwe poppetjes maken voor het spel? en SDXL gebruiken? Ik heb
  ook een set soldaten nodig"; "Pracht en praal betekent hier, gewoon goed, hd, passend en exact wat ik zoek"): het wapen
  van het dorp een gouden korenschoof op blauw; de soldaten staan, lopen, vallen aan en vallen; SDXL, met op de proefplaat
  ERNIE ernaast. De weg, de speerman in woorden en de volgorde: `beeld.md`, "De soldaten van het dorp en de poppetjes met
  SDXL". **Stand (20 okt):** SDXL over onze render werd slecht; Marcel draaide het om ("kun je niet met ai een mooi
  poppetje genereren en dat als basis gebruiken", en "de plaat die onze lat is gebruiken om sdxl te voeden"): de AI maakt
  het poppetje vrij, onze diepte zacht, zijn plaat als stijl (`gereedschap/ai/vrij.cjs`). Gekozen: **speerman zaad 106 op
  stijl 0,6** (ronde 4); de ossenkar zo is ook gedaan (ronde 1, de beste kar tot nu toe). **Het volgende:** de speerman in
  acht richtingen en lopen (106 als referentie, onze diepte per richting, op het model voor de loopbeelden), de schoof uit
  code erop, en ons handschrift naar de sprite van 2×. **Gedaan** (20 okt, `beeld.md`): de acht richtingen (met OpenPose uit
  onze gewrichten en onze buitenlijn liggen ze op het model), de eerste sprites (de AI direct mooi; via het model te hard,
  van achteren rommelig, lopend wel zonder flikkeren), en Pixel Art Base naast FaeTastic. **Besloten** (Marcel, 20 okt):
  **Pixel Art Base** voor de poppetjes, en de animatie met **een schilderbeurt over het model** (het beeld via het model
  als begin, SDXL licht erover met het beeld van die richting als referentie). Geprobeerd (ook met ERNIE): het begin via
  het model is te slecht, de benen blijven vlekken. **Wat werkt** (21 okt): staan van de AI in acht richtingen, en lopen
  met **alleen de benen** opnieuw geschilderd (het bovenlijf pixel voor pixel het staande beeld; `beeld.md`). **Het
  volgende:** de laarzen bruin en de vlekjes weg, dan alle acht richtingen lopend; dan aanvallen en vallen (die houdingen
  moet het model nog krijgen), de schoof uit code erop, en de sprites in het spel (een eigen vel per soort soldaat).
  **Stand 21 okt:** de laarzen en de vlekjes zijn opgelost (het palet van het staande been), lopen werkt in elke
  richting; Marcel vond hem te glanzend en koos mat 3 plus de zin. Daarna: **geen schild** (in het spel speer en harnas),
  staan met één hand rechtop, lopen en steken schuin met twee handen; de speerman zonder schild loopt nu door in acht
  richtingen (`soldatenhd.cjs alles`, zo'n twee uur).

**Besloten** (Marcel, 20 okt: "S. S1. Maar 2 speermannen en 1 kruisboogschutter. W. W1 L. L1", "De soldaten staan gewoon
waar je ze neerzet", "M2 B = prima C = akkoord"):
- **d, M2:** rond het plein een overgang: open in het midden, dan losse bomen en open plekken, en pas verderop dicht bos.
- **e:** in de demo komen **twee speermannen en een kruisboogschutter** mee met de huifkar (S1), met hun eigen stukken;
  valt er een, dan is hij weg. Ze hebben geen wachthuis: ze staan waar je ze neerzet. Het **wachthuis en de wapenmaker**
  zijn in de demo dicht (W1): ze staan in het bouwmenu, op slot, met *In the full game* (L1). **Later** (Marcel: "We
  moeten later wel voorkomen dat een slim iemand even iets aanpast in code om er alsnog bij te kunnen"): bij het
  verpakken van de demo wat dicht is er niet alleen met een vlag uit halen (`verpakken.md`).
- **b:** de kar brengt twee koeien en vier schapen mee, die bij het kamp blijven tot er een weide is; de marskramer
  verkoopt bij elk bezoek een koe of een schaap voor goud.
- **c:** "in de buurt" is het land van je dorp: ligt daar geen steen, dan staat de steengroeve niet in het bouwmenu, en
  zonder water de visser en de rietsnijder niet.
- **De volgorde:** d, e, b, c, dan a (de speellijst, zodat die het demojaar beschrijft zoals het dan is); f lokaal ernaast.

**d, e en b zijn gebouwd** (20 okt, in `main`; hoe het werkt: `spel.md`, "Zo werkt het lege begin
nu", en `code.md` bij `js/maker.js`, `js/soldaten.js`, `js/vee.js`, `js/debugvenster.js`): de overgang naar het bos (ring 3
tot 6 van het plein van 25-55% naar hooguit 4% te rooien; de wolventoetsen spelen nu op eiland 7), de wacht en het slot in
de demo (en een knop in het debugvenster die het slot aan en uit zet, Marcel: "voeg dan ook in debugmode het lock toe"), en
het vee van de kar en van de marskramer. **c is gebouwd** (20 okt; gemeten in `opmerkingen.md`, "De natuur buiten het
bouwbereik"): rotsen liggen in elk land (meest buiten je bereik: een of twee schuren), water ontbreekt op 5 van de 24
eilanden, en daar staan de visser en de rietsnijder niet in het bouwmenu. **a is gebouwd** (20 okt): de speellijst in
`speelbaar.md`, "De speellijst van het demojaar", met de 25 bekijk-punten van "Wacht op Marcel" in acht stappen, 7 erbuiten
(het volle spel of geparkeerd), en 3 weg (vraag L is gebouwd, de drie gaten van stap 6 staan in `opmerkingen.md`, en het
meten van 13 okt is de meting in Firefox geworden). Open: f, lokaal.

## R. Marcels acht punten (vraag 182 tot 189, 20 okt)

Marcel, 20 okt, met acht punten; wat er al is, zochten twee agents uit (20 okt). Zijn keuzes op de vragen staan onder
"Besloten" (in het gesprek heetten de punten 1 tot 8, de vragen 1a, 1b, ...). Het voorstel van Claude voor de
volgorde: eerst **2a** (de maat van een mens, want de nieuwe poppetjes van Q f worden nu gemaakt), dan **184 met 182**
(allebei de bouwplaats, en allebei nieuwe figuren), dan **185** en **186** (klein, voor de demo); 187 en 188 na de demo,
nu alleen het ontwerp; uit 189 kiest Marcel wat op de lijst komt, de rest gaat naar `opmerkingen.md`.

- **182, egaliseren met de schop:** "Ik wil dat bouwers eerst de grond 'levelen' met een schop, zoals in knights and
  merchants. Dit creeert een juiste, vlakke fundering." Nu maakt `T.egaliseer` (`js/hoogte.js`) de voet plus 2 tegels
  rand in één klap vlak, als het gebouw op de kaart komt (na het rooien); geen werkstap, geen schop, en een bouwer is
  nog de hakker met de bijl (`js/sprites.js`: "tot er een bouwer met een hamer is"). Op een helling bouwen mag tot
  `T.teSteil`. Voorstel: rooien, dan egaliseren, dan bouwen; paaltjes op de hoeken, de kavel wordt kale aarde, en de
  grond zakt of rijst in een paar stappen naar het vlak. Vragen: **1a** hoeveel werk: 1a1 altijd even veel (KaM), 1a2
  alleen naar de helling, 1a3 een klein vast deel plus de helling (voorstel: dan is vlakke grond kostbaar); **1b** wie:
  1b1 dezelfde bouwers, met een schop en een hamer (voorstel), 1b2 een eigen graver.
- **183, de maat van de huizen:** "En ik twijfel of de huizen 'te groot' zijn?" Een tegel is 64×32 px (zo'n 80 cm), een
  mens 66 px; een hut beslaat 5×4 tot 6×6 tegels (wand ±100 px), een huis 7×5 tot 10×7 (wand 130 tot 186), de kleine
  herberg 11×8, het raadhuis 8×6 (wand ±270); om elk gebouw een looppad van 3 tegels (Marcel, 3 okt), en het bouwbereik
  is 16 tegels. Naar de werkelijkheid klopt het (een muur van twee mensen), maar het voelt groot op drie manieren, elk
  apart te regelen: naast een mens (met het dak is een huis zo'n vijf mensen hoog, en spellen als The Settlers tekenen
  mensen groter dan echt), op het bouwbereik (een huis met looppad neemt zo'n 100 tegels), en op het scherm (de zoom).
  Vragen: **2a** 2a1 eerst kijken: één schermafdruk van het proefdorp met de gebouwen op 100, 80 en 65 procent, alleen
  voor het oog geschaald (voorstel), 2a2 de gebouwen kleiner (alles opnieuw renderen), 2a3 de mensen groter (mee met de
  poppetjes van Q f), 2a4 alleen het looppad van 3 naar 2 tegels (een getal; 3 was Marcels keuze op 3 okt).
- **184, dragers:** "Ik wil ook dat de mensen zonder werk zorgen voor het vervoer van materiaal. Ik wil dus mensen met
  planken, stammen, en blokken steen zien lopen. De kar met een os wordt veel kleiner om met deze mensen mee te lopen als
  latere 'upgrade'." Nu vervoert alleen de ossenkar (één van het kamp, plus één per schuur; 8 per rit, `js/kar.js`);
  wie geen werk heeft, bouwt mee (hooguit 4 per bouwplaats) of hangt op het plein; niemand draagt een stam, plank of steen
  (wel een takkenbos, een mand of een schoof: de drager met de schoof staat al in `werkfiguren.cjs`). Voorstel: zoals de
  opperman van KaM pakt wie niets doet het dichtste klusje, één stuk per keer, van een stapel naar de opslag of
  rechtstreeks naar een bouwplaats of werkplaats; de volgorde van de kar (`kiesRit`: eerst bouwplaatsen, dan werkplaatsen,
  dan de grootste stapel) wordt die van de klusjes. Elke werkplaats die je vult, is dan een drager minder. Meten in de tik
  (meer mensen die lopen). Vragen: **3a** 3a1 één rij klusjes, dragen of bouwen, wie het dichtst is (voorstel), 3a2 vaste
  rollen: Marcel kiest hoeveel bouwers, de rest draagt; **3b** de kar: "veel kleiner" als kleiner in beeld, naast de
  mensen, en pas later te krijgen (klopt dat?); hoe: 3b1 met de schuur, 3b2 met een os (van je vee of de marskramer),
  3b3 met de trede dorp.
- **185, een roversaanval in de demo:** "Voor de demo wil ik ook een keer een roversaanval; zodat de speler de combat kan
  proberen en ervaren." Nu komen de wilde rovers op toeval (de eerste tussen dag 60 en 240, Sint-Maarten is dag 250; in
  jaar 1 twee man, de helft 's nachts, alleen als er een akker is; ze roven graan), en de regie (`js/regie.js`) kent
  alleen de heer. Voorstel: in de demo één vaste overval, aangekondigd ("Robbers were seen in the woods"), overdag, met
  een korte scène van de rovers die uit het bos komen; verlies je, dan roven ze, maar de demo gaat door. Ze komen voor de
  oogst, de heer op Sint-Maarten voor de tiende: twee die nemen, de een met geweld, de ander met de wet. Vragen: **4a**
  wanneer: 4a1 een vaste datum, 4a2 na de eerste oogst (voorstel), 4a3 op toeval maar zeker één keer; **4b** hoeveel:
  4b1 drie, 4b2 vier of vijf (je hebt de commander nodig), 4b3 twee golven; **4c** de wilde rovers in de demo: 4c1 uit,
  4c2 erbij.
- **186, punten:** "Een licht puntensysteem achter de schermen voor als mensen de demo 'uitspelen'; hoe meer je hebt
  verzamelt en in je stores hebt, hoe hoger de punten. [...] Geen doden etc." Nu is er geen telling; het eindscherm
  geeft een jaarverslag in zinnen (`T.eindRegels`, `js/einde.js`). Voorstel: één getal onder het jaarverslag, tijdens
  het spel niet te zien: elke waar keer een waarde in goud (één tabel, in de werkbank), plus het goud; je beste score
  blijft op je computer bewaard. Vragen: **5a** 5a1 wat er op Sint-Maarten ligt, 5a2 wat er dit jaar binnenkwam, 5a3
  allebei (voorstel); **5b** 5b1 vóór de tiende, 5b2 erna.
- **187, een campagne en een editor:** "Uiteindelijk wil ik ook een 'Campaign' modus; hierin een aantal levels die met de
  hand gemaakt zijn op een gemaakt eiland. Hiervoor is er een editor nodig die de huidige generator gebruikt voor de
  basislaag, maar hier ook aanpassingen in kan maken", en: "Volgens mij wordt Tiled nu al helemaal niet meer gebruikt?",
  "We hebben dus alles 'inhouse'", "De editor moet wel wat functionaliteit hebben om een verhaal te maken, checkpoints en
  een 'quest' systeem zoals bij age of empires." Tiled voedt alleen nog de twee proefkaarten (`kaarten/proef.tmj`,
  `proefbos.tmj`), die acht toetsen en de wereld-bladzijde gebruiken; het eiland en je land komen uit code
  (`js/eiland.js`, `js/maker.js`). Voorstel: **een level is een opgeslagen spel op minuut nul, plus triggers**: het
  bewaren kent het eiland al als zaad plus wat er per stuk veranderde (B2), dus de editor is het spel in een stand om te
  bewerken (de hoogte, het water, de bomen en rotsen, wegen, dorpen, kampen, mensen, de voorraad), en bewaart zoals het
  spel. De triggers zoals Age of Empires: als (een datum, iemand in een gebied, een gebouw af, zoveel van een waar, iemand
  dood, een doel af) dan (een bericht, een doel, mensen erbij, een aanval, een scène, iets geven of nemen, de mist weg,
  een gebouw open of dicht, winst of verlies). Er is een begin: de fasen met `klaarAls` en `doe` (`js/quest.js`, nu leeg),
  de regie, en het slot van de demo. Het demojaar is het eerste scenario (de brief van de heer, de overval, Sint-Maarten).
  Vragen: **6a** 6a1 nu alleen het ontwerp, bouwen na de demo (voorstel), 6a2 de triggers nu, met de demo als eerste
  scenario; **6b** Tiled eruit: 6b1 in een snoeironde, de proefkaarten naar het proefdorp (voorstel), 6b2 tot de editor
  er is; **6c** een checkpoint: een plek die iets in gang zet, of ook een plek om verder te spelen als je verliest?
- **188, skirmish:** "In het uiteindelijke spel wil ik ook een skirmisch modus hebben, zowel vs AI als vs andere
  spelers. Hierin bouw je een kastaal, en vecht je één groot gevecht." De basis voor samen spelen ligt er (de wereld tikt
  vast, het toeval komt uit het zaad, een klik is een opdracht, een ander dorp is vijand), maar niet de lijn (6c), een AI
  die bouwt of vecht, het kasteel (163) en belegeren; de heer is een script. Een AI die uit een paar ontwerpen een kasteel
  zet en een leger kiest, is veel minder werk dan een AI met een economie, en een korte partij gaat makkelijker over de
  lijn. Vragen: **7a** 7a1 zoals Age of Empires, van niets tot er één valt, 7a2 eerst bouwen met een vaste tijd en een
  budget, dan het grote gevecht (voorstel, past bij "één groot gevecht"), 7a3 een verdediger en een belegeraar; **7b**
  eerst tegen de AI, dan samen (voorstel).
- **189, wat er van het middeleeuwse leven mist:** "Welke elementen van een middeleeuws bestaan missen we nog? Denk even
  mee met een aantal punten." Er is veel (49 soorten gebouwen, van molen tot badhuis, kapel, gevang en tiendschuur; geboren
  worden, oud worden, sterven; seizoenen, weer, brand, koorts, wolven). Voorstel van Claude, in volgorde: **a. de kerk en
  haar eigen tiende** (de tiende was eerst die van de kerk: de naam van het spel; nu geeft de kapel alleen tevredenheid),
  **b. de herendienst** (in de oogst werken mensen dagen op het land van de heer; in het oude ontwerp, `spel.md`, en de
  heervaart doet al iets dergelijks; met 184 zijn dat dragers minder), **c. paarden** (geen paard in het spel: geen
  stal, geen ruiters, Marcel op 2 okt: "een paardenstal nodig [...] Voor ruiters, ridders"; en de os van de kar), **d. het
  kerkelijk jaar** (de vasten: geen vlees, wel vis; november is de slachtmaand, Sint-Maarten het slachtfeest), **e. het
  kerkhof** (wie valt, krijgt een graf bij de kapel; het model staat al in `gereedschap/pixelart/dorp.cjs`), **f. bijen**
  (honing, en was voor kaarsen), **g. belegeren** (ladders, een ram, een blijde; nodig voor 188). Vraag: **8a** welke op
  de lijst.

**Besloten** (Marcel, 20 okt: "1. 1a3 2. 2a1 3. 3a1, 3b ja klopt, 3b1 4. 4a3, 4b1, 4c1 5. 5a3, 5b1 6. 6a1, 6b1, 6c zet
iets in gang. 7. 7a1 en ook siege 7a3, 7b akkoord 8. Paarden hebben we nodig, bijen wil ik, kerkhof goed idee, belegeren
hebben we zoizo nodig. volgorde is akkoord"):
- **182:** egaliseren kost een klein vast deel plus wat de helling vraagt (1a3), en dezelfde bouwers doen het, met een
  schop en een hamer (1b1; Marcel, 20 okt). **Gebouwd** (23 okt; `spel.md`, "Zo werkt het egaliseren nu"): alleen op een
  land met heuvels; de schop, de paaltjes en de kale aarde komen met de figuren.
- **183:** eerst kijken (2a1): een proef met de gebouwen op 100, 80 en 65 procent, alleen voor het oog geschaald; dan
  kiest Marcel. **De proef is er** (20 okt): het proefdorp op eiland 5, op 1920 bij 1080, op de dichtste zoom (2, dus
  alles twee keer zo groot) en half zo ver, naar Marcel gestuurd; en zelf te proberen in het spel, met een knop in het
  debugvenster (D) die de gebouwen op 100, 80 en 65 procent zet (`code.md` bij `js/debugvenster.js`). Op 100 is een huis
  met dak vier à vijf mensen hoog (het raadhuis acht), op 65 een drie (het raadhuis vijf à zes). **Besloten** (Marcel, 20 okt: "65, gebouwen kleiner"): alle
  gebouwen op 65 procent, met een kleinere voet, opnieuw gerenderd (2a2); de mensen, de bomen en de tegel blijven. Eerst
  het plan en één proefplaat (CLAUDE.md, "Eerst goedkeuring, dan renderen"), dan alles; de knop in het debugvenster gaat
  er dan uit. **Wat er is** (een agent, 20 okt): de bouwers hebben geen schaal. De camera is vast (1 eenheid is 1 px,
  `kern.cjs`), de plattegrond staat in tegels in de opgave, en de hoogtes, de deur (42×94 px), de ramen (24×30), het
  overstek en de patronen van pannen en planken zijn vaste pixels (`huis-sdf.cjs`; voor de 29 gebouwen in
  `tegels/gebouwen/` net zo in `huis(o)`, `dorp.cjs`). De voet, de deur, de ramen en de rook van een huis meet
  `huizen.cjs` uit het model, dus die volgen vanzelf. Het is veel: 1214 huistekeningen, 561 bouwfasen, 461 brandfasen,
  607 platte tekeningen en 1821 lagen sneeuw; op acht kernen samen zo'n vijftien uur (`beeld.md`, 17 okt), in de cloud
  (vier kernen, en een taak stopt na twee uur) het dubbele, al rendert een kleiner huis sneller (geschat 2,4 keer: 0,42
  van de pixels). Geen gebouw in het spel is nabewerkt (de herberg van O is een proef). **Twee manieren, de keuze aan
  Marcel:** **P1 verkleinen**: de plaatjes die er zijn naar 65 procent, met de voet, de deur, de ramen en de rook mee (een
  paar minuten, zoals de proef, maar zachter, en de pannen en planken fijner dan het hout van de bomen); **P2 opnieuw
  renderen** (voorstel): een maat in de twee bouwers, die de vormen, de hoogtes, de deur en de ramen 65 procent maakt maar
  de planken, pannen, stenen en lijnen even groot laat, zodat alles in de wereld dezelfde pixel heeft; dan één proefplaat
  (huis1, de herberg en de smidse, oud en nieuw, met mensen ernaast, 1:1 en op zoom 2, en P1 ernaast), en na goedkeuring
  alles. Daarna in het spel: de toetsen met een vaste voet, de vaste dakhoogte achter de marktplek (`achterDak: 200`,
  `js/markt.js`), het opslaan een versie hoger (een oud spel past niet meer), de knop eruit, en meten. **P2** (Marcel, 20
  okt: "p2, maar dit ga ik doen op mijn pc thuis. Ik wil de art pipeline nog wat refinen voor alles", en: "doen we dit
  met SDXL? met onze handtekening?"): het renderen gebeurt bij Marcel, door de eigen pijplijn. Nu kent alleen de kar
  (`karhd.cjs`) de AI en ons handschrift (H3); de huizen komen nog kaal uit de bouwer. Met 1214 tekeningen kan een
  meesterbeeld per tekening niet (7 tot 12 minuten elk); wel **per materiaal gebakken** (`bakken.cjs`, zoals het wiel):
  de AI schildert elk materiaal één keer (planken, pannen, riet, leem en vakwerk, steen, baksteen), dat ligt op het
  oppervlak, en de bouwer rendert er alles mee, met het handschrift erover. Voor een vlak materiaal is geen ControlNet
  nodig, dus ERNIE (rijker dan SDXL op de kar) kan ook. Voorstel: (1) de maat in de twee bouwers, en een proefplaat
  zonder AI (in de cloud); (2) de pijplijn voor gebouwen: het handschrift uit `karhd.cjs` los, voor alles, en de
  materialen gebakken; een proefplaat bij Marcel; (3) alles in één keer renderen, bij Marcel. Marcel (20 okt): "dat is
  prima". SDXL of ERNIE: allebei op één materiaal naast elkaar, in stap 2. **Stap 1, de maat in de huizenbouwer, is
  gebouwd** (20 okt; `huis-sdf.cjs`, `maat`, standaard 1, dus de tekeningen van nu blijven pixel voor pixel gelijk): het
  plan op hele tegels (met halve viel de achterste hoek op een kwart tegel, en telde de voet een rij te veel), de hoogtes,
  de plint, de deur (dan zo hoog als een mens), de ramen, de schoorsteen, de dakkapellen, de aanbouw en de erker. Alle 607
  opgaven meten op 0,65 een voet en een deur (de meeste 3×3 tot 6×5; was tot 9×7). Het riet hangt nog even ver over (mee
  geschaald scheelde het weinig). De proefplaat (huis1, een stijlhuis met pannen, het raadhuis, de herberg, een hut, een
  stijlhuis met leien en een boerderij; nu, P1 en P2, met mensen voor de deur) is naar Marcel. **De werkplaatsen** (vraag 167; Marcel, 20 okt: "de werkplaatsen mogen naar de
  huizenbouwer"): 15 vormen in `WERKPLAATSEN` (`huizen.cjs`), zoals de zagerij in de vier stijlen en standen, onder het
  dak van hun trede, met bouwfasen, en `voor`: de soorten die ze nemen (de houtschuur ook voor de steengroeve, de
  ertsgraver en de steenbakkerij; de schuur voor de schaapskooi, de graanschuur, de tiendschuur en het pakhuis; het
  schuurtje voor de kleiput, de rietsnijder, de visser, de turfsteker en de kalkbrander; de markthal ook voor de kazerne).
  Het spel zoekt ze zo op (`js/bouwstijl.js`: `voor`, en een soort zonder het dak van nu krijgt het dak dat er is). De
  watermolen blijft uit `dorp2.cjs` (geen waterrad in de huizenbouwer). De proefplaat in de stijl wit stond goed; nog
  te verbeteren: het kippenhok en het schuurtje lijken op elkaar, en de smidse krijgt op 65 procent geen schoorsteen op
  de gevel. **In één keer** (Marcel, 20 okt: "Kunnen we beter in 1x doen?", en: "Ik ben nu poppetjes aan het renderen.
  En als ik de stijl heb, dan laat ik alle huizen opnieuw doen"): de maat (0,65 voor alle tekeningen, en de plekken van
  de delen mee: `opMaat`) en de werkplaatsen staan achter één schakelaar, `NIEUW` in `huizen.cjs`, die uit staat, zodat
  de toetsen de opgaven nog met de vellen in git vergelijken. De sessie die alles opnieuw rendert, doet in één keer:
  (1) `NIEUW = true`; (2) de capaciteit van het vel `huizen` in `naar-tiled.cjs` naar 1792 (er komen er 480 bij, samen
  zo'n 1694); (3) alles renderen (de huizen, de bouwfasen, de brandfasen, de platte tekeningen, de sneeuw op het dak),
  door de pijplijn van Marcel; (4) in `T.GEBOUWEN` de tekening van de werkplaatsen naar hun nieuwe (de stijl wit, deur
  naar zuid, voor een land zonder stijl), de herberg en de kapel naar die van de stijl, en de molen tot hij een rad heeft
  het oude plaatje verkleind; (5) de toetsen die de vellen met de opgaven vergelijken (in `bouwstijl`, `huizen`,
  `draaibare-huizen` en `verweren`: bij een kleine muur passen minder ramen) en die een vaste voet noemen (de
  wijnboerderij 5×4, de deur bij een voet van 5×4, de houthakker 4×4, de hut 3×3); (6) de vaste dakhoogte achter de
  marktplek (`achterDak: 200` in `js/markt.js`, naar zo'n 130); (7) het opslaan een versie hoger (een oud spel past niet
  meer); (8) de knop in het debugvenster eruit (`gebouwMaat`, `js/tekenen.js` en `js/debugvenster.js`); (9) meten: het
  tekenen (minder pixels) en hoeveel er in het bouwbereik past.
- **184:** één rij klusjes, dragen of bouwen, wie het dichtst is (3a1); de kar wordt kleiner in beeld, naast de mensen,
  en komt later, met de schuur (3b1): het begin heeft geen kar meer, vanaf dag één dragen de mensen (Marcel: "klopt").
  **Het plan** (Marcel, 23 okt: eerst 184 met 182, de art en de animatie liggen vandaag stil): een drager is een kar met
  een lading van één, in het tempo van een mens; hij rijdt dezelfde ritten (halen en brengen, `kiesRit` in `js/kar.js`),
  zodat er één manier van vervoer is en er met of zonder beelden hetzelfde uitkomt. Stappen: (1) het vervoer los van de
  kar, zonder dat er iets verandert; (2) de dragers (de huifkar blijft na aankomst staan als eerste opslag tot het
  raadhuis er is; een schuur krijgt nog een kar), de kolonist een jaar op vijf eilanden, de tik meten, het opslaan een
  versie hoger; (3) egaliseren (182); (4) `spel.md` en `code.md` bij. De figuren (een plank, een stam, een steen, de
  schop, de kleinere kar) komen later van Marcel; tot dan lopen de dragers met wat er is (de takkenbos, de mand, de
  schoof) en houden de bouwers de bijl. **Besloten** (Marcel, 23 okt): **de huifkar verdwijnt als het raadhuis af is**
  ("deze gaat op in het raadhuis. de spullen staan dan op de grond"): wat erin zat, ligt als losse stapel waar hij stond,
  en telt pas als de dragers het binnen hebben; **één stuk per keer, van alles** (zoals de
  opperman van KaM; één getal in de werkbank), en bij 182 **zakt of rijst de grond in een paar stappen** naar het vlak
  (zo'n vier; elke stap tekent alleen dat stukje grond opnieuw). **Gebouwd** (23 okt): de dragers (`spel.md`, "Zo werken
  de dragers nu") en het egaliseren ("Zo werkt het egaliseren nu").
- **185:** de overval komt op toeval, maar zeker één keer in het demojaar (4a3), met drie rovers (4b1); de wilde rovers
  zijn in de demo uit (4c1). En 23 okt: **overdag**, met **een aankondiging** vooraf, en zonder akker komen ze voor **de
  stapels** ("stapels ja"); de korte scène van de rovers kan later, met de cinematic. **Gebouwd** (23 okt; `spel.md`,
  bij Rovers en de militie, "In de demo één overval").
- **186:** wat er dit jaar binnenkwam en wat er op Sint-Maarten ligt, allebei (5a3), geteld vóór de tiende (5b1).
  **Gebouwd** (23 okt; `spel.md`, bij "2e, het eind en het jaar in het kort", "De punten"): binnengekomen is wat je
  mensen verzamelden of maakten, niet wat je kocht (anders tel je met kopen en verkopen op); een waar is waard wat de
  marskramer ervoor geeft, en de rest staat in de werkbank.
- **187:** nu alleen het ontwerp, bouwen na de demo (6a1); Tiled eruit in een snoeironde, de proefkaarten naar het
  proefdorp (6b1); een checkpoint is een plek die iets in gang zet (6c).
- **188:** allebei: zoals Age of Empires, van niets tot er één valt (7a1), en een verdediger tegen een belegeraar (7a3);
  eerst tegen de AI, dan samen (7b). **Het ontwerp van 187 en 188** (23 okt): `scenario.md`. Marcel koos (23 okt) losse
  kaarten (A), de editor in het spel en ook voor spelers (B2), één land met hoofdstukken als keuzescherm (C), skirmish
  als veldslag of belegering zonder economie en zonder heer (D, E3, F), de oude quests weg met Tiled (G), een hoofdstuk
  als uitsnede of eigen eiland (H3) waarvan alleen het verhaal meegaat (I1), en een campagne voor samen met eigen missies (J1);
  van niets tegen elkaar is de multiplayer van het hele spel; en AI-spelers in easy, medium en hard, in het gewone spel,
  in skirmish en in de multiplayer (K), met een vierde stand *Unfair* die opengaat als de campagne op hard is uitgespeeld
  (L3). Het ontwerp is rond.
- **189:** op de lijst: paarden ("hebben we nodig"), bijen ("wil ik"), het kerkhof ("goed idee") en belegeren ("hebben we
  zoizo nodig"); de kerk met haar tiende, de herendienst en het kerkelijk jaar staan in `opmerkingen.md`.
- **De volgorde** ("akkoord"): 2a1, dan 184 met 182, dan 185 en 186; 187 en 188 na de demo, nu het ontwerp; de vier van
  189 achteraan, belegeren met 188.

## Af (sinds 11 okt)

- 1b van vraag 187: het demojaar als eerste level (24 okt; `scenario.md`, 3): `levels/demojaar.js`, met de wacht, het
  slot, de aangekondigde overval, de punten en de scène van het betalen; de speeltest speelt nu ook in de cloud.
- Ronde 4 van het snoeien: Tiled eruit (6b1 van vraag 187, 23 okt; `snoeien.md`): de kaarten uit Tiled, de quests en
  de tas, de gebieden en de proefkamers met hun deuren en monsters; zo'n 10.600 regels minder. Het spel speelt en tekent
  precies als ervoor (nagekeken). Wat bleef staan: `opmerkingen.md`, "Wat ronde 4 van het snoeien liet staan".
- Het debugvenster met tabbladen (23 okt; Marcel: "Ik kan al die losse dingen niet onthouden"; `gereedschap.md`):
  alles om te testen is een knop, in zes tabbladen.
- De overval van de demo (vraag 185, 23 okt; `spel.md`, "In de demo één overval"): één keer drie rovers, overdag, een dag
  van tevoren aangekondigd; zonder akker roven rovers de grootste stapel.
- De punten (vraag 186, 23 okt; `spel.md`, "De punten"): wat je verzamelde en wat er in de opslag ligt, in goud, op
  Sint-Maarten vóór de tiende; in de demo op het eindscherm, met je beste.
- De dragers (vraag 184, 23 okt; `spel.md`, "Zo werken de dragers nu"): geen kar meer aan het begin; wie geen werk heeft,
  bouwt of draagt, één stuk per keer, op één klok met de karren van de schuren; de huifkar gaat op in het raadhuis.
- Het egaliseren (vraag 182, 23 okt; `spel.md`, "Zo werkt het egaliseren nu"): op een land met heuvels maken de bouwers
  na het rooien de grond vlak, in vier stappen.
- Het blok "Nu en daarna" gesnoeid van 450 naar 45 regels (23 okt; Marcel: "Ja, snoei het"; het oude in
  `archief/werklijst-nu-tot-23-okt.md`).
- De renderproef van de grond (vraag 178, 18 okt; `snelheid.md`, vanaf "Het plan voor de renderproef van de grond", en
  `code.md` bij `js/tekenen.js`, "de grond op de kaart"): de vloer, de droge beek, het platte groen, de sneeuw en de
  heuvels als vaste rijen op de videokaart, met het licht in de tegel (Marcel koos A) en de dekkers in de diepte; een
  stap met het wiel, een andere stand sneeuw en de beek zijn één beeld van 3 à 22 ms in plaats van 8 à 15 beelden tot
  108 ms. Marcel: "wow, dat is snel, geeft geen krimp meer, instant wissel", en "dit wordt de nieuwe standaard": de
  schakelaar is weg, de oude buffer is er alleen nog zonder videokaart.
- Het bouwmenu, de ghost en draaien (vraag 179, 18 okt; Marcel: "A. A1 B. B1, maar voor het volgende gebouw staat die
  weer op standaard. C. C2"; `spel.md`, bij "Jij bouwt", en `code.md`, "het bouwmenu, de ghost en draaien"): een raster
  van plaatjes boven Build met de uitleg bij de muis, het gebouw zelf half doorzichtig aan de muis (rood waar het niet
  past), en R draait wat in de bouwstijl is; het volgende gebouw begint weer met de deur naar het zuiden. Marcel keek in
  het spel (18 okt): "klopt allemaal".
- De meter met de videokaart (18 okt; `gereedschap.md`, bij de meter): F2 zegt ook hoe lang de videokaart over een beeld
  doet ("graphics card … ms"), of dat de browser het niet zegt; in Edge nagekeken (de kaart 2,8 ms per beeld).
- H4, het koude werk na het laden (18 okt; `snelheid.md`, "De tik"): na het land nog vijf stappen achter de voortgang;
  de eerste tik na het laden van 39 à 52 naar 21 ms, de eerste middernacht van 60 à 63 naar 18 à 19, hetzelfde spel.
- F1, het land in gedeelde blokken (18 okt; `snelheid.md`, "De tik"): een stap van het vooruit maken van 6,3 naar 0,6 à
  1,5 ms, met precies hetzelfde land; na het laden de tikken boven 8 ms van zo'n 45 naar 5 à 11.
- G1, de kuddes (18 okt; `snelheid.md`, "De tik"): een volger zoekt geen omweg om zijn eigen kudde, maar wacht of is er;
  de gewone tik van 1,81 naar 0,81 ms, en de kudde staat iets losser.
- G2 en F2 (18 okt; `snelheid.md`, "De tik"): het wild kijkt alleen naar mensen in het vak om de groep (hetzelfde spel,
  0,3 à 0,6 ms per tik minder), en na het laden maakt het spel eerst het land, met de voortgang in het menu (geen
  hapering meer van 0,5 tot seconden in de eerste tik).
- De tik van middernacht (18 okt; `snelheid.md`, "De tik", H1 tot H3): van 13,6 naar 3,3 ms, met precies hetzelfde spel;
  het bos per vak in één keer gelezen en onthouden tot er iets verandert, en het plein één keer per dag.
- 178, ver uitgezoomd sneller (17 en 18 okt; bij P, `snelheid.md`): A1 en A2, de renderproef, B5 met B3 en E1, B1 en B2,
  en de regen en de mist op de kaart; ver uitgezoomd van zo'n 30 naar 4,4 ms per beeld in Chromium. Firefox wacht op
  Marcel.

- c1, de roverskampen op het eiland (vraag 170, stap 6a2, 17 okt; Marcel: "M1"; `spel.md`, "De roverskampen"): drie per
  eiland in het woud, met een open plek, een vuur, de tent T1 en een paadje naar de weg; ze staan er als hun land
  opengaat, met een rode stip op de minikaart als je ze zag.

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
