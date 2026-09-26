# Opmerkingen om later na te lopen

Marcel (25 sep 2026): "Notities van alle opmerkingen maken, kunnen we later revisiten." Hier staat
alles wat onderweg opviel en nog niet af is: wat ruw is, wat niet helemaal goed staat, en wat
Claude erbij bedacht zonder dat Marcel het al koos. Niets hiervan houdt het werk op.

Wie iets ziet, zet het erbij, met een datum; wie iets oplost, haalt het weg (`git log` bewaart
het). De keuzes die op Marcel wachten, staan in de werklijst onder "Wacht op Marcel".

## Het spel

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
- **Het nieuwe gehucht, wat nog ruw is** (26 sep, na de derde versie van de kaart): er lopen nog geen
  paden van de boerderijen naar het plein (die komen met "Straten en paden", punt 6c: ze slijten waar
  gelopen wordt); het plein is kale zandgrond, geen gras zoals een Drentse brink; en de teksten zeggen
  nog "op de brink" waar het plein bedoeld is. Wat de speler zelf bouwt, kan het plein nog wel
  afdekken: een hoog huis vóór het plein (het bouwmenu zou daar kunnen waarschuwen).
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
- **De marskramer loopt op 1× een week** van de weg naar de brink.
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
  - Vlees vult sinds 25 sep een maag (Marcel koos het); vis nog niet. Moet dat ook?
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

## Het beeld

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
  de blokhutschuur: een Drentse kooi is laag, met een groot rieten dak tot bijna op de grond;
- hooioppers op een gemaaide weide, en een hek om een weide;
- bouwfases voor de kapel, de watermolen en de put;
- misschien ijs op de beek (een vraag aan Marcel).

**Kleine beeldfouten:**
- in een huis in aanbouw branden de ramen al;
- het zwad van de maaier staat als paaltjes, en zijn slag is symmetrisch.

## Voorstellen van Claude die nog niet gekozen zijn

- **De heer kijkt op Sint-Maarten zelf rond vanaf de brink** (24 sep, gebouwd). Wat hij ziet en niet
  in het rapport van de inner staat, komt alsnog op de rekening en kost argwaan. Te keuren; uit te
  zetten met "heer zicht" op 0 in de werkbank.
- **Een vondst van de soldaten kost argwaan** (25 sep, gebouwd): 15% per plek waar ze iets vinden.
  Uit te zetten met "argwaan per vondst" op 0 in de werkbank.
- **Een eigen figuur voor de schout** (26 sep). Hij draagt het vel van een gewone dorpeling, dus
  zodra er meer dorpelingen rondlopen, zoek je jezelf in de menigte. Iets van zijn ambt (een
  ketting, een staf, een hoed) maakt hem vindbaar, en past bij een spel waarin de heer, de inner en
  de soldaten ook hun eigen figuur hebben. In `js/sprites.js` is dat daarna één regel: nu krijgt
  de soort 'schout' altijd een dorpelingvel, ook als er een vel 'schout' zou zijn.
