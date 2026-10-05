# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst een dorp dat draait, dan de heer die eraan trekt (en daarmee de
kern: rijk worden en arm lijken), dan verhalen en besturen, dan het verzet, en pas aan het eind de
groei naar vrijheid en de afwerking. Zie "Daarna, in deze volgorde".

## De stand (5 okt 2026, drieëndertigste sessie): eerst een kleine speelbare demo, één gehucht dat je wint door iedereen een jaar lang super gelukkig te maken; de snelheid gaat voor alles (vraag 113); elk spel een ander, wijder land met natuur (vraag 112, stap 1), het lopen (vraag 119) en het praatje (vraag 120) zijn gebouwd; de vellen zijn ingepakt en het spel laadt alleen wat er staat (vraag 114, 2a, stap 1 en 1b); sinds de eenendertigste sessie bouwt elk land van de maker in een bouwstijl, met het dak van zijn trede en de deur naar de weg (vraag 114, stap 2a: de stijl wit), en tekent het spel met WebGL, gebouwd in een eigen sessie naast de huizen (vraag 123); sinds de tweeëndertigste sessie bouwt de huizenbouwer elk huis van vier kanten en tekent hij het een kwartslag gedraaid, en staat wit zo in het spel, met alle bouwfasen (vraag 124, B, en G); sinds de drieëndertigste sessie werken de boeren overdag op hun land, naar het seizoen en in het vel van hun werk, een boerin in dat van een vrouw (vraag 111, stap 1 en 2), en vraagt een boer heide te ontginnen als het graan tekortkomt (vraag 107, stap 1); sinds de tweede sessie daarnaast bouwt elk land in een van vier stijlen, wit, oker, planken of roze, elk met eigen huizen en boerderijen en alle bouwfasen (vraag 114, 2b); dan de herberg, de kapel en de woontoren (stap 3), dan de houthakker die hakt en plant en de wolven (vraag 115 en 116), het draaien van de camera (vraag 124) en de hoogteverschillen (vraag 121)

**Het spel** (sinds 23 sep): je bent de schout van een gehucht onder een heer die alleen geld ziet. Het hart is het
gehucht besturen terwijl het groeit, terwijl de heer eraan trekt; rijk worden en arm lijken blijft de druk van boven.
Wat er nu speelt en hoe het werkt, staat per onderwerp in `spel.md`: bovenaan "Waar staat wat", en elk onderwerp begint met
**Zo werkt het nu**. Spelen: `npm start`, dan `localhost:8123/`: het spel opent op het titelscherm, en Nieuw spel geeft de
naam van je dorp en de benoemingsbrief van de heer; `W` zijn de wetten, `R` de raadsman, `Z` is slapen bij je huis, `Esc`
het menu, en het spel slaat elke ochtend zelf op; onder het doel linksboven staat de raad. **Sinds 3 okt bouw je niet
meer zelf** (vraag 103, de spelregel "Wie bouwt"): wat het dorp mist, komt een inwoner je vragen, met de plek in goud op
de grond en wat het kost, en jij zegt ja of nee; in het bouwmenu (`B`) wijs je erven aan en hang je oproepen op het plein
("Het dorp zoekt een steengroeve", met een premie). Elk huis heeft een stand met zijn wensen (zoals in Anno 1602): wie een
huis aanwijst, ziet een briefje met wat het wil, en een huis dat iets mist, heeft een teken bij zijn deur (2c, vraag 100).
Linksboven staat de volgende trede, en daarna het eind: een jaar lang iedereen gelukkig, vanaf 100 mensen, en dan viert
het dorp het grote feest (2e, vraag 101). Op 1 lentemaand brengt de raadsman het jaarverslag. **Sinds vraag 104** vraagt
een ondernemer je ook wat hij zelf wil: wapens maken (na de rovers; verboden: ziet de inner het, dan verzegelt de heer de
werkplaats) of een tweede herberg (de herbergierster wordt boos); wie twee keer nee hoort, trekt weg. **Sinds vraag 106**
heb je twee bazen: in de balk staan de gunst van de heer (een kroon) en het vertrouwen van het dorp (een hoed), van 0 tot
100. Onder 20 komt er een waarschuwing, en op 0 ben je je ambt kwijt, of jaagt het dorp je weg. Elke maand wil de heer in
een brief iets geks (een gril: een standbeeld, een vet varken, de bruiloft van zijn neef), en wat je antwoordt, kost de
een of de ander iets. Wie de soldaten betrappen op verstoppen, krijgt de laatste waarschuwing. **Sinds vraag 108** kijk je met `Tab` over
je dorp, loopt er van elke deur een paadje, slijt het gras waar veel gelopen wordt, en branden 's avonds de lantaarns en
de ramen van wie thuis is. **Sinds vraag 112** is elk spel een ander land van 100 bij 100, met bossen, vijvers en rotsen,
en het nummer van het land staat bij Nieuw spel; een houthakker hoort bij het bos, een steengroeve bij de rotsen, een
visser aan het water. **Sinds vraag 119** lopen de mensen om wat vaststaat, en lossen ze onderweg op wie er staat:
wachten, langs elkaar, opzij. **Sinds vraag 120** blijft wie vrij is en toevallig een buur of iemand van zijn werk
treft, soms staan voor een praatje, met een wolkje boven wie praat. **Sinds vraag 111** werken de boeren overdag op
hun land: ze zaaien, wieden, rijden mest uit, spitten en sprokkelen, en hun boerin en grote kinderen helpen bij het
zaaien en de oogst. **Sinds vraag 107** komt een boer of zijn zoon je vragen om een stuk heide te ontginnen als het
graan tekortkomt: ja kost het vertrouwen van het dorp, want de meent is van iedereen, en na een maand plaggen steken is
het een akker die in lentemaand gezaaid wordt. `npm test`: 944/944.

**Sinds de sessie van het licht (4 okt, vraag 125, in `main`):** met de videokaart kleurt het dorp met het uur (roze
bij het opkomen, oranje bij het ondergaan, blauw in de nacht), geven de lantaarns, de ramen en de herberg warme plassen
licht die flakkeren, en werpt alles wat staat een schaduw die met de zon meegaat. De schout draagt 's avonds buiten een
lantaarn: dan zien ze je van verder, en sluipen (`S`) dooft hem. Nog open bij vraag 125: de proefplaat van C (licht op
de muren, "mag later").

**Waar het werk staat:** in `main` (4 okt; Marcel: "ja" op "push main") staan de snelheid van 3 okt (vraag 113, de
meter onder `F2`), het wijdere land met natuur (vraag 112, stap 1), een bewaard spel half zo groot, het sneller zoeken
van een weg, en het bos om de kaart alleen aan de kant van het bos. Sinds het eind van de zesentwintigste sessie ook het
lopen (vraag 119, D en A; Marcel: "ja push main"), en sinds de zevenentwintigste sessie het praatje (vraag 120;
Marcel: "2 ja push main"), en de reparatie van het laden (Marcel: "ja push main"). Sinds de achtentwintigste sessie
ook het inpakken van de vellen (vraag 114, 2a) en de snelheid via Steam (vraag 122; Marcel: "push main"). De
proefplaten van de negenentwintigste sessie (vraag 114, 2b en 2c: de huizenbouwer, niets in het spel) staan er ook in
(Marcel: "Push alles maar en zet alles op main"). Ook het werk van de dertigste sessie (een vel per tekening, de
figuren, de meter en de proef met schermafdrukken; Marcel: "Ja maar main"). Het werk van de eenendertigste sessie (de
bouwstijl wit, vraag 114, stap 2a) staat sinds 4 okt ook in `main` (Marcel: "ja push main"), net als WebGL (vraag 123)
en het licht (vraag 125: A en C, en de schaduwen met de zon). Hoe een eigen branch en `main` samengaan, staat in
`CLAUDE.md`, onder Git.

**Het lopen is af** (vraag 119, D en A, 4 okt; Marcel: "Je kunt nu eenmaal niet over iemand heen", en "eerst, voor de
huizen"): een weg gaat om wat vaststaat, wie onderweg een ander treft, wacht, schuift langs hem, laat hem opzij gaan of
loopt er even omheen, en waar velen heen gaan, komt de weg uit een veld (`js/lopen.js`). B blijft zoals het is (Marcel:
"B akkoord"): hooguit 8 wegen per beeld, want een tijdsbudget kost de vergelijkbaarheid van de speeltest.

**Het praatje is af** (vraag 120, a en b, 4 okt; Marcel: "geen praatjes forceren. Alleen als mensen een reden hebben en
elkaar toevallig tegenkomen"): wie vrij is en toevallig een buur of iemand van zijn werk treft, blijft soms staan, ook
onderweg; wie langskomt, schuift aan, tot vier; boven wie praat staat om de beurt een leeg wolkje (`js/praatje.js`).
Niemand gaat ergens heen om te praten: c (een deel 's avonds naar het plein) ging er weer uit. Waar ze het over hebben
(het tekentje in het wolkje) komt met de mensen aan het werk.

**Het laden van een bewaard spel is gerepareerd** (Marcel, 4 okt: "1 ja" op "Mag ik dat eerst repareren, vóór de
huizen?"): een gebouw uit het spel kende een verse bladzijde niet na het laden; nu meldt het laden de soorten aan van wat
er op de kaarten ligt, en de proef met opslaan speelt weer letter voor letter hetzelfde jaar. Zie onder Af.

**De vellen zijn ingepakt** (vraag 114, 2a, 4 okt; Marcel: "1 ja 2 alleen nog de grond"): elke tekening strak gesneden,
de bouwfasen per gebouw (pas geladen als er een in aanbouw staat), en de cellen van de figuren gekrompen. Elke tekening
is pixel voor pixel dezelfde gebleven; het geheugen van de browser ging in het overzicht van zo'n 1.000 naar 730 MB, en
het eerste keer uitzoomen van 290 naar 165 ms. Zie onder Af, en `beeld.md`, "De vellen zijn ingepakt".

**De proefplaten van de huizen zijn er** (vraag 114, 2b en 2c, 4 okt; Marcel: "1 ja 2 ja 3 allebei 4 allebei 5 ja"):
`node gereedschap/pixelart/huis-sdf-export.cjs afwisseling` (een huis in zijn vier standen, en drie straatjes waarin de
daken de treden volgen, met kalk in wit, oker en roze), `verhouding` (de hut tot de boerderij, de woontoren met kantelen
en met een tentdak, de herberg en de kapel zoals ze nu zijn en nieuw, de kapel met een zadeldaktoren en met een
naaldspits) en `steen` (de kapel en de woontoren in veldsteen, zandsteen en baksteen: Marcel vond de torens "wel wat
grijzig", en vroeg of er toen al bakstenen waren). Marcel koos: de torenvorm en de natuursteen per land (vier
bouwstijlen), baksteen na de steenbakkerij, en de herberg met een muur en een poort om de binnenplaats. Zie `beeld.md`,
"De afwisseling en de grote gebouwen", en vraag 114.

**Het spel laadt alleen wat er staat** (vraag 114, stap 1 en 1b, 4 okt; Marcel: "A ja B ja C meteen erna"): elk huis en
gebouw is een eigen bestand (`tegels/huizen/`, `tegels/gebouwen/`), en een tekening laadt pas als hij op de kaart staat;
een figuur pas als zijn wezen er is. Een huis dat doorgroeit, of een kind dat opgroeit, houdt zijn oude beeld tot het
nieuwe er is. Bij het begin 81 MB aan plaatjes in plaats van 197, en elke tekening pixel voor pixel dezelfde. Nieuw
gereedschap: `Spel.debug.vellen()` (wat de browser vasthoudt) en `npm run schermen` (twintig vaste schermafdrukken,
byte voor byte te vergelijken; ook voor stap 2 en 3 en WebGL). Zie onder Af, en `beeld.md`, "Een vel per tekening".
Gezien en niet gerepareerd (`opmerkingen.md`): de wereldbouwer tekent op ware grootte geen huizen (dat was er al: hij
valt om op de akkers zonder kalender). De toets in `bewoners.test.cjs` die soms faalde, is gerepareerd (zie onder Af).

**Elk land bouwt in een bouwstijl** (vraag 114, stap 2a, 4 okt; Marcel: "A ja B ja C ik wil overal bouwfase voor ... D ja E
ja", en "H1 is oke"): een land van de maker bouwt in de stijl wit (wit vakwerk, groene luiken, veldsteen, riet; hut 1, 3
en 4, huis 1, 3 en 6 en hun stenen broertjes, boerderij 1 en 4), elke vorm met zijn deur naar elke kant (`js/bouwstijl.js`,
108 tekeningen uit `STIJLEN` in `huizen.cjs`). Een huis dat gebouwd wordt of doorgroeit, krijgt het dak van zijn trede
(riet, leien in een dorp, pannen met marktrecht), een stenen huis baksteen pas met een steenbakkerij; op een erf kijkt de
deur naar de weg, met de moestuin ervoor; een verzoek keert zijn deur naar de weg; de maker zet de huizen ook vóór het
plein, met hun deur ernaartoe. Het ontworpen gehucht speelt zoals altijd. Sinds de tweeëndertigste sessie zijn
de witte huizen draaibaar en hebben ze alle bouwfasen (vraag 124, B; zie hieronder). Zie onder Af, en `beeld.md`, "De eerste bouwstijl: wit".
**WebGL, in een eigen sessie naast de huizen** (vraag 123; Marcel, 4 okt: "Kunnen we een andere agent starten die
alvast het webgl deel uitvoert?"): het tekenen met WebGL loopt naast de huizen, op een eigen branch
(`claude/webgl-tekenen`), en blijft uit de bestanden van de huizen. Marcel koos het plan (A tot en met D). Stap 1 is af:
de tussenbuffer, waarmee 4K zo snel tekent als 1920×1080. De proefversie voor Windows is er
(`npm run proefversie -- --windows`), zodat Marcel op zijn eigen pc meet. Stap 2 tot en met 5 zijn gebouwd: de WebGL-laag
(`js/gl.js`), de spelregel "Tekenen" (standaard met de videokaart, zonder als er geen is). Volgende: Marcel meet op zijn
pc (een nieuwe proefversie; vraag E: ja), en dan schaduwen en licht (vraag 125: A bouwen, B en C als proefplaat;
Marcel: "A ja B ja C ja D na webgl"). Het draaien
van de camera (vraag 124) komt na WebGL, en de huizen worden alvast draaibaar gerenderd (Marcel: "124b Ja dan").

**De draaibare huizen staan in het spel** (vraag 124, B, tweeëndertigste sessie; Marcel: "A ja ... B ja C ja", en na de
proefplaat "ja start maar"): de huizenbouwer bouwt een huis van een stijl als één huis met alle vier de muren ingevuld (`rondom`),
en de tekenaar draait de camera en de zon er een kwartslag omheen, zodat de vier standen de vier aanzichten zijn en de zon
linksboven blijft; de uitbouwen blijven voor en rechts, de steiger van de bouwfasen staat rondom, en de deur zie je van
zuid en van oost. Wit staat zo in het spel, met alle bouwfasen, en een huis dat doorgroeit, rijst op in zijn laatste
fasen (G). De oude huizen en het ontworpen gehucht bleven pixel voor pixel dezelfde. Het plan en wat er gebouwd is, staan
bij vraag 114 (onder "Schets voor de draaibare huizen"), en in `beeld.md`, "De draaibare huizen".

**De boeren aan het werk** (vraag 111, stap 1 en 2, drieëndertigste sessie, terwijl 2b rendert; Marcel: "A. Ja prima B
ja graag C doe maar", en na de proefplaat "a ja b ja c nu"): overdag werkt een boer op zijn eigen land, naar het seizoen
(`js/veldwerk.js`): hij zaait rij voor rij, wiedt tot de oogst, rijdt in de herfst mest uit en spit, en raapt in de
winter hout aan de rand van een echt stuk bos; de schaft houdt hij op de akker. Zijn boerin en grote kinderen helpen bij
het zaaien en de oogst. Hij draagt het vel van zijn werk (de zaaier, de wieder, de sprokkelaar, de maaier), en een
boerin dat van een vrouw. De regels veranderen niet; de speeltest liep zonder fouten, met de treden op dezelfde dagen.
En de militie die onderweg is, rent nu naar het gevecht en vecht mee als ze er is (`0c`, punt 4). Zie onder Af.

**Ontginnen op de heide** (vraag 107, stap 1, drieëndertigste sessie; Marcel: "1 en 3, 107 a b c d e ja"): komt het dorp
graan tekort, dan vraagt een boer of zijn zoon je om dertig tegels heide, met de plek in goud op de grond
(`js/ontginnen.js`). Ja kost vertrouwen, elk stuk 5 meer (5, 10, 15: f3), en dan steekt hij een maand plaggen, tegel
voor tegel, met de schoffel; in
lentemaand wordt het gezaaid. Nee, of je sprak hem niet: pas na dertig dagen vraagt er weer iemand. **Wat Claude erin
zag:** "naast zijn akker" kan bijna nooit, want de heide ligt apart (op de landen van de maker in een hoek, 8 tot 40
tegels van de dichtste boerderij). Dus kiest hij de plek zo dicht bij zijn akker als het kan, en wordt de heide van de
kant van het dorp af ontgonnen. De speeltest (`speelbaar.md`): een derde tot ruim de helft meer oogst in het tweede jaar,
geen honger meer, en op 72022 nu wel marktrecht; maar de hele heide is in het eerste jaar op. Marcel koos daarop f1 met
f3 (vraag 107, f: "We gaan met jouw suggestie"): het tempo blijft, en elk volgend stuk kost meer vertrouwen. Zie onder
Af, en `spel.md`, "Ontginnen". Stap 2 (het bos) en 3 (vier jaar spelen) volgen.

**Waar de volgende sessie begint:** het werk van de drieëndertigste sessie staat sinds 5 okt in `main` (Marcel: "ja push
main"), ook het ontginnen op de heide met de prijs die per stuk oploopt (vraag 107, stap 1 en f; Marcel: "Push main"),
net als het werk van de tweeëndertigste (Marcel: "1 ja" op "Zal ik het in main zetten?"). Het volgende van vraag 107 is
stap 2, het bos, met eerst een kort plan voor Marcel. **Stap 2b loopt in een eigen sessie** (Marcel: "Kun je alvast een extra agent starten
voor het volgende punt op de werklijst?"), op de branch `claude/bouwstijlen-2b`: de andere drie stijlen. Marcel
beantwoordde daar haar vragen (A tot en met E; zie vraag 114), en nu het wit in `main` staat, mag ze `main` samenvoegen
en renderen. Daarna stap 3, de herberg, de kapel en de woontoren, meteen draaibaar, en dan de houthakker die hakt en
plant en de wolven (vraag 115 en 116; de boeren aan het werk, vraag 111, zijn af). Uit de speeltest na te lopen: op land 72022 liep het dorp vast op plaats (`speelbaar.md`). Voor de schaduwen met de zon (vraag 125, B) hoeft de bouwer niets te
veranderen: de huizen in `tegels/` hebben geen schaduw op de vloer, en het spel tekent hun schaduw zelf. **Vraag 121 is besloten**
(hoogteverschillen op de kaart; Marcel, 4 okt: "Hoogte verschillen op de kaart. 😁", en "121 a terrassen, b ja, c na de
boeren"): terrassen met wanden en hellingen, en de hoogte raakt het lopen, het zicht en het bouwen; na de boeren, vóór
het eiland. Een proefplaat van de hoogte kan met die van de huizen mee. **Vraag 122** (de snelheid via Steam;
Marcel: "lag, geheugen tekort etc is geen optie straks") is half besloten: JavaScript en Electron blijven, en haalt het
spel de lat niet, dan de middenweg (WebGL, dan een Worker of WebAssembly; Marcel: "snelheid, middenweg is goed"). De lat
geldt op 1920 bij 1080 en op 4K (Marcel: "heb ik zelf"); nog open: 4K tekenen zoals 1920 bij 1080 (c), en een
proefverpakking (b), die komt als het spel met WebGL tekent (Marcel: "Proefversie wil ik als we de draws doen met
webgl"). **Vraag 123 is besloten** (Marcel: "1 ja 2 voor de boeren"): tekenen met WebGL, met een eigen kleine laag, 4K
via een tussenbuffer op 1920 bij 1080, en het 2D-tekenen als spelregel ernaast; na de proefplaat van de huizen, vóór de
boeren; daarna de proefversie voor Marcels 4K-scherm.
**Marcel zei ja** (4 okt) op de woontoren zoals voorgesteld (een stenen huis dat alles heeft, groeit door tot woontoren
met drie appartementen, vanaf marktrecht) en op de houthakker die hakt en plant (**vraag 115**). De meter in Firefox
(vraag 113, a) komt van hem. Ook besloten (4 okt): **vraag 116** (beesten in het bos: wolven die de houthakker bedreigen,
rode ogen in het donker; "doden mag") en **vraag 117** (één kaart: een eiland van 2500 bij 2500 met de zee rondom en de
mist; "uiteindelijk"). De volgorde (Marcel: "akkoord"): de huizen (vraag 114), dan **vraag 111** (de boeren op hun
veld) met 115 en 116, dan de hoogte (**vraag 121**; Marcel: "na de boeren"), dan 117, dat begint met een proef die meet of
een kaart in stukken loopt. Tussen de huizen en de boeren komt het tekenen met WebGL (**vraag 123**; Marcel: "voor de
boeren"). Ook besloten: **vraag 118**
(inwoners met stats: levenspunten, vaardigheden die groeien met het werk, en eigenschappen, zoals in Dwarf Fortress),
samen met de mensen aan het werk. Voor het eiland gebruiken we Marcels technieken voor het zoeken van paden (vraag 117 en
**vraag 119**: HPA\* over de stukken, flow fields, time-slicing, sturen in plaats van iedereen als muur, Jump Point
Search). **Vraag 120 is besloten** (een levendig dorp; Marcel: "120 a b d ja"): het praatje nu, het wolkje met waar ze
het over hebben (b) met de mensen aan het werk; de kleine dingen (c: groeten, water halen, een bankje) koos hij niet.
Nog open: **vraag 107**, stap 2 en 3 (het bos, openlijk en stiekem, en de speeltest van vier jaar; stap 1, de heide, is
af), **vraag 109** (de stenen en het erf: bestraten als
verzoek, het plein bij marktrecht, de tuin en het hek binnen het looppad) en **vraag 110** (de maat van de winst: op het
wijdere land is er grond genoeg, maar de speeltest speelt standaard nog het ontworpen gehucht). De speeltest van vier
jaar staat in `speelbaar.md`, en een volgende speeltest van vier jaar splitst de spelers over twee taken, want een taak
op de achtergrond stopt na twee uur. Uit de speeltests: een schout die alleen tegen drie wilde rovers viel, omdat de
militie onderweg was; sinds 5 okt rent wie onderweg is erheen en vecht hij mee als hij er is. De rest van **vraag 105** (wat ons uniek maakt) komt na de kern. De ui wordt de
schrijftafel (vraag 98, C): het briefje bij een huis is het eerste papier, en de rest volgt later (januari, met de
Steam-pagina).

**Wat wacht:** het buurdorp (vraag 72) tot de kern staat, en het land eromheen naar de provincie (vraag 70, B); de
zitting (3b) en de herberg als plek van gesprekken (3c); staande orders voor de raadsman (vraag 66, D) met het land; de
balk die volloopt (`opmerkingen.md`); de proefversie op itch.io en de eerste tester (33d; de laatste proefversie is van 3
okt, `36c713e`, met de feesten); vraag 59 is geparkeerd. Het dorp van bovenaf komt er niet (vraag 74, d). De pagina
"Stand van het gehucht" (25 sep) loopt achter op de dag, en de speeltest van vraag 96 is nooit opgeschreven.

**De demo, klein** (vraag 79, 80, 82 en 85): drie standen, op de huizen die er al zijn; de poorters en hun huis komen
later.

| Stand | Huis | Gebruikt | Wil in de buurt (een kring om het gebouw) |
|---|---|---|---|
| keuters | hut (3 mensen) | eten; brandhout in de winter | een put (12 tegels) |
| dorpelingen | huis (5) | daarbij bier, en vlees of vis | een kapel (40) en de herberg (in het dorp) |
| ambachtslieden | stenen huis (8) | daarbij brood en laken | een markt (in het dorp) |
| boeren | boerderij (4) | eten; brandhout in de winter | een kapel (40) |

Doorgroeien kost bouwstof (een huis 8 hout, een stenen huis 12 steen), en **gewonnen** is: alle woningen stenen huizen
die alles hebben, en de boerderijen wat zij willen, een jaar lang (360 dagen op rij), vanaf 100 mensen (2e, vraag 101).
De volgorde (vraag 79 en 82; Marcel: "82: correct"): het zaaigraan (vraag 81), de wensen klein (vraag 80), het eind, de
speeltest (nu: vraag 102); dan het weer en de eisen van de heer; het vaste pad buiten beeld voor 5.000 als het dorp
groter moet. Hoe we hier kwamen, staat in de vragen zelf (vraag 73 tot en met 102) en onder Af; ouder dan twee weken in
`git log`.

**Al het werk, op prioriteit** (Marcel, 27 sep: "Al het werk ordenen op prioriteit"; opnieuw geordend op 28 sep,
vraag 51, na de nieuwe richting, en op 1 okt, vraag 77). De maat is Marcels eigen regel, eerst speelbaar: sinds 1 okt
is dat de vertical slice uit het concept, van gehucht tot kleine stad. Elk stuk begint met een plan voor Marcel.

*0. Nu: de vertical slice* (Marcel, 1 okt, vraag 77: "Laten we eerst eens een speelbaar spel maken van begin tot eind",
"Gebruik de slice in de pdf", "A we starten vanaf de slice kwa afmeting ... D prima", en "Nee, we starten wel als
gehucht"). Je begint als gehucht, zoals nu, en groeit naar een kleine stad van 100 tot 200 mensen; een dorp van 50 is
als doel te klein. In zes stappen, elk eerst een plan, en na elke stap de speeltest:
1. **Nu: de wensen van de mensen, zoals in Anno 1602,** met als eind dat iedereen super gelukkig is, een jaar dat te
   winnen is, het jaar in het kort, de heer met eisen die het moeilijk maken, en het vaste pad buiten beeld voor 5.000
   man (vraag 78; eerst "de cyclus" genoemd, met doelen van de heer, maar die stelt hij niet). Het plan is vraag 79,
   gekozen: twee manieren om te winnen (veroveren, of iedereen super gelukkig), en eerst een speelbare kern; oorlog,
   de rest van het land, diplomatie en handel komen daarna. Stap 1, een jaar dat te winnen is, en het zaaigraan (vraag
   81) zijn af (zie onder Af), en van stap 2, de wensen per stand, klein (vraag 80, 82 en 85), ook 2a en 2b: de wensen per
   huis en doorgroeien, met zes stenen huizen. Sinds 2 okt zeggen de raad en het rapport wat de huizen missen, en volgt de
   bouwer van de speeltest ze (vraag 86, a en b, en 87); niemand staat nog ingemetseld (vraag 88). 2d, de treden uit de
   standen, is af (vraag 90), het goud, de werkplaatsen en het laken ook (vraag 91), brood als eten (vraag 92), en de
   sluwe bouwer (vraag 94), en brood 0,01 met erven binnen de kringen (vraag 95). Daarna de ligging van de herberg
   en de markt (vraag 96), de feesten (vraag 97), het laken (vraag 99), de pagina met ontwerpen voor de ui (vraag 84, a;
   gekozen: de schrijftafel, vraag 98), 2c en 2e (vraag 100 en 101): af. De stad groeit door haar mensen (vraag 103), met
   ondernemers (vraag 104) en twee bazen (vraag 106): af. **Nu: een jaar dat te winnen is (vraag 102, opnieuw).**
   Het graan van buiten op de markt komt bij stap 6.
2. Statussen met niveaus (droogte, ernstige droogte), in de balk en in het rapport, en de crises uit het concept; en het
   weer, met zaaien dat dagen kost (Marcel, 1 okt: "Stel er is slecht weer"; vraag 82).
3. Ambtenaren: de marktmeester, de wachtmeester en de rentmeester; uiteindelijk één voor elke tak van het bestuur.
4. Wacht en misdaad: patrouilles, een misdaadgolf als status, het gevang.
5. Mensen met banden: 10 tot 20 mensen met wat ze van jou en van elkaar vinden.
6. De kleine stad: de kaart voor 200 mensen, de wijken, de markt, het raadhuis en de poort die iets doen, en sneller
   paden zoeken; zo gebouwd dat het later een stad van 5000 of meer kan worden (Marcel, 1 okt; `opmerkingen.md`).
Later: een scherm met de statussen en de laatst bekende inventarisatie (vraag 77, b).

*0b. Het tijdpad naar Steam* (Marcel, 1 okt, vraag 83: "Tijdspan is goed"; `commercieel.md`). Tot december 2026 de
kleine speelbare kern (stap 1 en 2 hierboven, en de eisen van de heer), met de eerste filmpjes en testers. In januari
2027 de naam (vraag 8), geluid (eerst, vóór de seizoenen in beeld en het weer; vraag 84, b), Engels (de spelteksten op
één plek), de ui als papieren in de beeldstijl met een fotomodus (vraag 84, a; 83, e), en de Steam-pagina: een capsule,
vijf plaatjes en een trailer van een minuut. In juni 2027 de demo in Steam Next Fest (aanmelden vóór 25 april 2027).
Daarna early access. Er is weinig geld ("Ik gebruik jou ☺️"): wat kan, maakt Claude, en Marcel kiest, luistert en
plaatst.

*0c. Wat er nog open staat, naar de kern en de demo* (Claude, 3 okt, op Marcels vraag "Wat staat er nog open voor de
kleine slice? / Demo versie"; een overzicht, geen besluit). **De kern** (tot december): de wensen, het eind, het dorp
dat zelf bouwt, de ondernemers en de twee bazen met de grillen staan. Open, in de volgorde die Claude aanraadt:
1. De twee bazen afmaken (vraag 106, stap 3): de tweede speeltest is gedaan (`speelbaar.md`). De gunst werkt; het
   vertrouwen zakt bij iedereen, en het voorstel is dat het de tevredenheid volgt.
2. **Een jaar dat te winnen is** (vraag 102, opnieuw, met de maat eerst): geen dorp van de speeltest wint in twee jaar.
   De groei stopt op eten en op de winter, niet op plaats; en elk nieuw gezin in een hut zet de teller terug. Het plan
   staat er (3 okt): het is één knoop, het land, en het voorstel begint met ontginnen als verzoek.
3. Een nieuwe proefversie en de **eerste tester** (33d): de laatste (`36c713e`) heeft nog geen verzoeken en geen twee
   bazen. Of de haak werkt, zegt een mens, niet de speeltest.
4. Wat de speeltests lieten zien: drie of vier herbergen door de keten van het bier, en een schout die alleen tegen
   drie rovers valt omdat de militie onderweg niet meedoet (dat laatste is af, 5 okt: wie onderweg is, rent erheen en
   vecht mee zodra hij er is).
5. Wat ons uniek maakt (vraag 105): vooral b, wat je weet is wat je zag, omdat het verandert hoe je vanaf het begin
   speelt.
6. Stap 2 van de slice: statussen met niveaus en het weer (droogte, ernstige droogte; zaaien dat dagen kost).
Stap 3 tot en met 6 van de slice (ambtenaren, wacht en misdaad, banden, de kleine stad) horen niet bij de demo, maar bij
early access. **De demo** (januari de Steam-pagina, juni 2027 Next Fest, aanmelden vóór 25 april): de naam (vraag 8)
en de zin (vraag 83, c); Engels, met alle teksten op één plek (het grootste werk); geluid (er is nog niets); de ui als
papier (de schrijftafel, vraag 98) met een fotomodus, en wat het nu nog browserig maakt (`verpakken.md`); het dorp zoals mensen het bouwen (paadjes van zand en steen, lantaarns, een moestuin) en een overzicht naast het volgen
(vraag 108; Marcel, 3 okt: "Dit moet allemaal straks staan voor de demo"); de schil
(Electron) en opslaan in een bestand; de Steam-pagina (een capsule, vijf plaatjes, een trailer van een minuut); welk
stuk van het spel de demo is; en filmpjes en testers voor de verlanglijstjes.

*1. Gebouwd (28 en 29 sep): naar de proef "van gehucht tot dorp"* (Marcel, 28 sep, vraag 51: "A ja B ja C ja D ja";
sinds 1 okt opgegaan in de vertical slice, hierboven).
Je begint zoals nu, met de brief van de heer en 26 mensen, en het doel is dat het gehucht in zo'n twee jaar een dorp
wordt. De proef eindigt met een brief van de heer: "Wij vernemen dat Ons gehucht een dorp is geworden.
Gefeliciteerd. Dat kost u vanaf nu meer."
1. **Af (28 sep, veertiende sessie): het dorp bouwt zelf** (vraag 52). Jij wijst erven aan met het bouwmenu, en
   is het dorp vol, dan zet een nieuw gezin er zelf een hut op, met hout uit de voorraad. Zie onder Af.
2. **Af (29 sep, veertiende sessie): de eerste trede, van gehucht tot dorp** (vraag 53). Het doel staat linksboven
   en in de benoemingsbrief; bij 50 mensen met een kapel en een smidse wordt het een dorp, en schrijft de heer. Zie
   onder Af.
3. **Af (29 sep, vijftiende sessie): de eerste wetten** (vraag 54; eerst keuren genoemd). Een menu zoals in
   Democracy 3 onder `W`, met het rantsoen, vreemden welkom, houtkap in het bos van de heer en de belasting. Zie
   onder Af.
4. **Af (29 sep, vijftiende sessie): rovers en een militie** (vraag 55). Wie wegtrekt, komt als rover terug, en er
   komen wilde rovers; ze roven een akker, de mannen van het wachthuis vechten mee, en wie valt, is dood. Zie onder Af.
5. **Nu: de proef afmaken:** de eerste weken als opdrachten (vraag 47, herschreven voor de nieuwe richting), een
   speeltest van twee jaar, en een tester die het niet kent (33d). Het plan is vraag 58. **Gebouwd (29 sep, zestiende
   sessie):** de raad onder het doel, de bouwer in de speeltest en de proefversie voor itch.io. Wat de bouwer liet
   zien, werd vraag 59: geparkeerd (Marcel, 29 sep). De tester komt als Marcel de proefversie op itch.io zet.

*Eerder af, voor de proef van één jaar met de heer (27 en 28 sep):* de winter zichtbaar (elfde sessie), de
speeltest als script (twaalfde; het bijstellen komt later, vraag 46), en opslaan, het menu en het titelscherm
(dertiende). Geparkeerd: de afrekening (vraag 49). Zie onder Af.

*2. Wacht op Marcel:* vraag 102 (naar een jaar dat te winnen is, opnieuw, met de maat eerst), en of het werk van de vijfentwintigste sessie in `main` gaat; de rest van vraag 105 (wat ons uniek maakt) na de kern; welke zin de haak wordt, nu hij is nagezocht tegen Steam (vraag 83, c; de rest van 83 en heel 84 is beantwoord, `commercieel.md`); het plan voor het buurdorp (vraag 72: A tot en met E), als de kern staat; het bijstellen van het land komt later (Marcel, 30 sep: "we finetunen later"); het dorp van bovenaf
is beslist (vraag 74, d: geen camera van bovenaf); de proefversie op itch.io zetten als hij
thuis is, en wie de eerste tester is; vraag 59 is
geparkeerd (wanneer het een dorp is, een rem op de groei, en waar goud vandaan komt); en later vraag 54, C (hoe de
heer in het hogere doel past). Op 28 sep beantwoordde Marcel 33a, 33b, 8, 48, 50 en 51; het bijstellen na de
speeltest (vraag 46) komt later, met een menu met opties.

*3. Nu: na de proef* (vraag 51; Marcel, 29 sep: "we gaan naar het volgende punt"; het eerste is het volgende):
- de heervaart, en een rivaal: een ander dorp van dezelfde heer (vraag 50, D). De heervaart is gebouwd (vraag 60, A en
  B); de rivaal wordt de eerste tegenspeler (vraag 61, stap 1);
- tegenspelers die zelf bouwen, in een land met provincies (Marcel, 29 sep, vraag 60, D, 61 en 62); het plan is
  vraag 63, en de eerste stap is het buurdorp;
- ontginnen (6b) en straten en paden (6c), tenzij de kaart al eerder te klein is;
- beter bouwen: de ladder tot baksteen, en de herberg die meegroeit (het tweede deel van 3b, stap 5);
- de groepen en de schepenen (de rest van punt 9), de nacht (11), de eigen buidel (12); voorvallen (8) en rechtspraak
  (10) zijn er sinds 29 sep als voorvallen (vraag 65, A), en de raadsman sinds 30 sep (vraag 66 en 67);
- marktrecht en de stad (14), stadsrechten (15), de opstand (16), en de streek als kaarten naast elkaar, met het
  buurdorp (vraag 50, C);
- de rest van punt 4: het bos met de kudde (vraag 43), de marskramer die vee koopt en verkoopt, de twee
  rekenboeken; en de afrekening als jaaroverzicht (vraag 49);
- deel F: geluid, en verpakken voor Steam als de proef goed is; sneeuw of rijp in de winter (vraag 44, C). Sinds 1 okt
  op het tijdpad naar Steam (blok 0b, hierboven): eerst geluid, dan de seizoenen in beeld en het weer (vraag 84, b);
- de kazerne, met de oorlog (vraag 84, c: "later, met de oorlog"; `spel.md`, bij de rovers);
- dorpsfeesten bij het seizoen, waar het hele dorp aan meedoet, en een bruiloft die groots gevierd wordt (Marcel, 1 okt:
  "Voor nu een notitie later pas bouwen"; `spel.md`, "Dorpsfeesten").

*4. Opruimen, als die bestanden toch open moeten:* `hud.js` en `tekenen.js` splitsen (vraag 25, C en D).

*5. Vragen zonder haast:* 6 (de groepen; de eerste wetten zijn er sinds stap 3), 7 (ijs op de beek), 13 (een eigen figuur voor
de schout: die helpt een tester zichzelf te vinden, dus misschien toch vóór de proef), 22 (de tijdsversneller) en
26 (de volgorde: deze lijst is het nieuwe voorstel).

*Wat nog ruw is:* `opmerkingen.md`, bovenaan.

**Wat er in de negentiende sessie gebeurde** (30 sep; Marcel: "We zetten de werklijst voort"):
- **Eerst gemeten** (op `4463e2d`, `npm test` 680/680): wat een speeldag kost, waar die tijd heen gaat, en wat een dorp met
  al zijn poppetjes per beeld kost. Een dag: 30 tot 39 ms, voor 85% één zoektocht (`T.plekOpHetPlein`, dat voor elke tegel
  van het plein alle bomen en huizen afloopt). Met een lijst per tegel, als wegwerpproef in de kladmap: 0,5 ms, en een jaar
  lang dag voor dag hetzelfde. Een dorp per beeld: 0,4 tot 1,5 ms, met de lijst 0,1 tot 0,2 ms. Aan het spel is niets
  veranderd.
- **Het plan voor stuk 2** (vraag 71): een dorp waar je niet bent, leeft met poppetjes, alleen niet getekend (anders een
  tweede manier in getallen voor de oogst, de inner, de heer, de rovers, de marskramer en de voorvallen); alles van een dorp
  bij elkaar, met een eigen schout per dorp; en een dorp spreekt alleen tegen jou als het jouw dorp is. In drie stappen: de
  snellere dag, het dorp bij elkaar, elk dorp leeft; bewezen met de speeltest (letter voor letter hetzelfde jaar) en een
  toets met twee dorpen naast elkaar. **Marcel koos** (vraag 71): "A ja B ja C ja, oud spel mag vervallen".
- **Stap 1 en 2 gebouwd** (zie onder Af): de snellere dag, en één dorp als één ding. De nulmeting (de hele speeltest op de
  stand ervoor) draaide in een losse kopie (`git worktree`), en daarna speelden alle 18 jaren letter voor letter gelijk.
  Onderweg: de speeltest had een haak op `T.werdGezien` die zijn argumenten miste toen die functie het spel én het dorp
  kreeg; alleen de boekhouding van de speeltest miste daardoor de getuigen, het spel niet. Twee agents zetten zo'n 60
  toetsen om naar het nieuwe model (Sonnet, samen zo'n 500.000 tokens); een wacht in de toetsen (een regel over een dorp
  die het hele spel krijgt, faalt) vond daarna nog zes toetsen die per ongeluk groen waren.
- **Stap 3 gebouwd** (zie onder Af): elk dorp leeft, en een ander dorp spreekt niet tegen jou. Een schets van de toets van
  twee dorpen liet eerst zien dat de berichten van het buurdorp nog bij jou kwamen ("Geertje heeft je niet gesproken");
  nu gaan ze via `T.zeg`, en bewaart het buurdorp ze. De speeltest speelt er letter voor letter hetzelfde jaar op.
- **Het plan voor stuk 3, het buurdorp** (vraag 72): een eigen provincie twee tot vier dagen verderop, eigen namen, een
  schout die nog niets beslist, erheen over de kaart van het land, 0 of 1 tegenspeler bij Nieuw spel (voorstel: 0 als
  standaard tot stap 1b), en dezelfde heer en inner. Nagekeken wat er nog ontbreekt: dezelfde vijf boeren en
  herbergierster (hun naam staat één keer in `T.MENSEN`), zijn schout aan jouw kant, plaats voor één gehucht in het land,
  `Math.random` op drie plekken, en een bewaard spel van 750 kB.

**Wat er in de achttiende sessie gebeurde** (30 sep; Marcel: "Werklijst doorzetten"):
- **Eerst gekeken wat er is** (op `a0e5e78`, `npm test` 673/673): het ontworpen gehucht komt uit
  `gereedschap/tiled/maak-gehucht.cjs`, met vaste plekken voor alles; de huistekeningen hebben elk een vaste maat en een
  deur aan een vaste kant (zuid, oost of west, nooit noord).
- **De maker, als schets** (vraag 69, C; zie onder Af): `gereedschap/maker/maker.js` legt een gehucht uit een zaad, keurt
  het zelf en probeert het anders tot het deugt. Onderweg: een ring van huizen die allemaal binnen twee tegels van het
  plein staan, paste nooit (in het ontworpen gehucht staat een hut acht tegels van het plein, met een pad); en pal aan
  het plein kon een huis maar aan één kant staan, want het huis staat recht in het raster en de rand van het plein
  schuin. Daarom loopt het zand van de deur van de schout het plein op, zoals in het ontworpen gehucht. Het ontworpen
  gehucht komt door dezelfde keuring (23 van de 214 tegels van het plein liggen er achter een dak; de maker blijft
  daaronder).
- **De schets voor Marcel:** de pagina "Gehuchten van de maker" (https://claude.ai/artifact/KqCC7EzyVKbAQ9gcEYCmkX), met
  het ontworpen gehucht naast zaad 1, 2 en 3, en zaad 4 tot en met 12 klein. Het plan voor wat volgt, met vraag 70.
- **Marcel koos** (vraag 70): "A Ja, b nu alleen ligging later de rest, c ja". **Gebouwd: de maker in het spel** (zie
  onder Af): de spelregel "Je gehucht", en een gemaakt gehucht dat het spel inleest zoals het ontworpen gehucht. Onderweg
  gevonden: Nieuw spel begint het spel dat al klaarstond toen de bladzijde opende, dus wie de spelregel op het
  titelscherm omzette, begon nog op het oude gehucht; nu komt er dan eerst een vers spel.
- **De speeltest op gehuchten van de maker** (`speelbaar.md`): de bouwer, zaad 1, 2 en 3, twee jaar, zonder één fout; een
  dorp na zes maanden, en dezelfde tweede winter als op het ontworpen gehucht.

**Wat er in de zeventiende sessie gebeurde** (29 sep; Marcel: "Werklijst doorzetten"):
- **Eerst gekeken wat er is** (op `7c00e01`, `npm test` 624/624): de heer vraagt alleen goud en graan, zijn brieven
  hebben geen keuzes, tijdelijk weg zijn bestaat niet, en het buurdorp bestaat alleen in wat de nieuwkomer zegt. Een
  zoekagent met acht vragen deed er 106 stappen over (235.000 tokens): voortaan liever twee kleine, of zelf zoeken.
- **Een plan voor de heervaart en een rivaal** (vraag 60): allebei pas in het dorp. De heer vraagt op 1 hooimaand
  mannen of goud, en wie terugkomt, is veteraan. Het buurdorp komt twee keer per jaar met een vraag, met één getal
  voor hoe jullie staan: vrienden betalen terug, vijanden roven.
- **Marcel koos** (vraag 60): "A ja B ja C ja, speler mag zelf de naam voor zijn dorp kiezen aan het begin", en voor D
  een nieuwe richting: tegenspelers met een AI, die tegelijk met jou beginnen, ergens waar je ze nog moet vinden, en
  zelf bouwen om de grootste te worden. Gebouwd: de heervaart, de veteranen, de brieven van de heer op één plek, en de
  naam van je dorp (zie onder Af). In de browser gezien: de brief met zijn knoppen, sturen, de mannen die de kaart
  aflopen en terugkomen, de naamstap op het titelscherm, en een gevecht met drie veteranen. Daar viel op dat twee
  veteranen op kinderen leken: nu gaan eerst de volwassen mannen.
- **Een plan voor de tegenspelers** (vraag 61). Wat het mogelijk maakt: geen enkel regelbestand kijkt naar het ene
  spel van de speler, dus een tweede dorp kan op dezelfde regels draaien. Voorstel: de streek als kaarten naast elkaar,
  gelijk beginnen met dezelfde regels, een schout in code die kiest zoals een speler, en in vier stappen, te beginnen
  met één tegenspeler in getallen, met het buurdorp uit vraag 60 (C) erin. C is daarom nog niet gebouwd.
- **Marcel koos** (vraag 61): "A een grote kaart. B Ja in de basis wel, dit kunnen we later aanpassen. C afhankelijk
  van het moeilijkheidsniveau. D kan beide kanten op, basis voor nu is alles veroveren. En ja we starten met het
  buurdorp erbij." Eén grote kaart in plaats van de streek, en dat verandert stap 1. Nagekeken: zo'n vijftien
  regelbestanden gaan uit van één dorp op de kaart (de akkers, het plein, de weg in en uit); meer poppetjes kan (337
  poppetjes kosten 4,7 ms rekenwerk per beeld op 30×); en donker tot je het ziet, bestaat al half (`w.bekend`, uit het
  torenspel). Daaruit het plan voor stap 1 op één grote kaart (vraag 62), met een schets van de kaart. Niets gebouwd.
- **Marcel koos** (vraag 62): "reistijd moet groter zijn. Denk in dagen. Het moet voelen meer als Lords of the Realm.
  Met een land met provincies", een tegenspeler met een eigen weg en een voorsprong, een veroverd dorp dat blijft en
  dat je erbij leidt, en uitzoeken of 5 of 6 spelers kan. Gemeten: een dorp draait ook zonder poppetjes op dezelfde
  regels (twee jaar met alleen de dagtik: 26 → 37 in het eerste jaar, zoals met poppetjes); een speeldag kost 44 ms
  per dorp, bijna allemaal in `T.voorwerpOp`, dat voor elke tegel alle voorwerpen afloopt; een bewaard spel is 370 kB
  per dorp. Daaruit het plan voor het land (vraag 63), met een schets. Niets gebouwd.
- **Marcel koos** (vraag 63 en 64): het land met provincies en de raadsman, en "Het voelt gewoon nog leeg nu". Gemeten:
  een jaar vroeg een keuze of acht. Het plan werd vraag 65; Marcel: "A ja B ja C nee niet bovenaf, ik denk hier nog over
  na. D ja". **Gebouwd: de voorvallen** (A; zie onder Af). In de browser gezien, en in de speeltest: de eerste keer nam
  de speler altijd het eerste antwoord, verbande een dief, die kwam terug als rover en vertrapte een akker, en het dorp
  verhongerde (26 → 16); met verstandige antwoorden speelt het jaar zoals zonder voorvallen, met een keuze per ruim een
  minuut. Daaruit: het venster zegt nu "moet het bos in", en een opmerking voor later (`opmerkingen.md`).
- **Het plan voor de raadsman** (vraag 66); **Marcel koos** (30 sep): "A Ja, b Nee, c Nee, wordt automatisch als de
  schout er niet is. D prima". **Gebouwd: de raadsman** (zie onder Af): een van de boeren, die de voorvallen beslist als
  de schout er niet is. In de browser gezien. Hoe je hem kiest, werd vraag 67; Marcel: "B", en dat is gebouwd: de knop
  Raadsman, en de raad die het zegt.
- **De speeltest met de raadsman** (de bouwer, zaad 1, `speelbaar.md`): Klaas besliste 87 van de 88 voorvallen, minstens
  zo goed als de bouwer zelf. Maar de bouwer drukte bij elk voorval `Esc`, en had daarmee geen voorvallen meer. Dat werd
  **vraag 68: telt wegsturen als er niet zijn?** A, zo laten: wie `Esc` drukt, laat het na twee dagen aan de raadsman.
  B (voorstel), zoals Marcel het zei ("als de schout er niet is"): de raadsman beslist alleen als je echt weg bent (een
  ander gebied, straks op reis); wie in het dorp is en wegstuurt, laat het voorbijgaan, met de prijs die dat nu al
  heeft (tevredenheid −2%). C, wegsturen mag, maar kost iets (wie je wegstuurde, onthoudt het), en de raadsman beslist.
  Wat Marcel niet kiest, kan een spelregel worden. En: het getal in de balk zakte in de tweede winter naar 0, terwijl
  er elf mensen bleven rondlopen (`opmerkingen.md`, bij vraag 59). **Marcel koos B** ("Ja B inderdaad. Dan alles push
  en main"); gebouwd, met A als spelregel (zie onder Af), en alles staat in `main`.
- **Het plan voor het land, stap 1a** (vraag 69; Marcel: "Ja, begin aan het land"), in drie stukken, met een schets van
  de kaart van het land (de pagina "Het land met provincies"). **Marcel koos** (30 sep): "De maker nu": het buurdorp
  krijgt een gehucht dat elk spel anders ligt. **Gebouwd: stuk 1**, de kaart van het land en reizen (zie onder Af).
  Marcel: "Op main, we finetunen later": alles staat in `main`, en het bijstellen (de dagen, de snelheid, de kaart)
  komt later.
- **Marcel vroeg hoe het leuk blijft** ("zelf als persoon rond hobbelen in je eigen stad maakt het wel lastig.
  Misschien voelt het handiger als we een soort raadsman en aansturen die je regels oplegt?"). Nagekeken: de camera
  volgt altijd de schout en je ziet maar een klein stuk van je dorp, dus bouwen gaat alleen waar hij staat. Het
  meedenken staat in vraag 64 (besturen van bovenaf met één toets, een raadsman per dorp met een bouwlijst en staande
  orders, de schout voor wat persoonlijk is), met een schets van de raadsman in het spel. Niets gebouwd.
- **Marcel koos** (vraag 63): het land met provincies, zelf reizen, tegenspelers met een karakter, en provincies zonder
  karakter die zichzelf besturen en zwakker zijn. En (vraag 64) een raadsman met een geloot karakter, die jij kiest; maar
  over besturen van bovenaf: "Het voelt gewoon nog leeg nu." Gemeten: een jaar van braaf heeft 60 berichten, maar maar
  een keer of acht een keuze (een per zeven minuten op 30×), en de winter bijna niets. Op 23 sep stond al dat voorvallen
  met een keuze het spel maken ("zonder wordt een bouwspel een spreadsheet"); die zijn er nog niet. Het voorstel is vraag
  65: het dorp spreekt je aan. Niets gebouwd.

**Wat er in de zestiende sessie gebeurde** (29 sep; Marcel: "Werklijst doorzetten"):
- **Eerst gemeten:** een speeljaar van nu (braaf, zaad 1, op `6750a21`), zonder fouten. Het gehucht groeit van 26 naar
  37 en staat dan stil, want de huizen zijn vol: van herfstmaand tot sprokkelmaand zegt het dorp negen keer "geen
  plaats, wijs een erf aan", terwijl er in de herfst zo'n 450 graan ligt en het 70% tevreden is. Wie erven aanwijst,
  kan rond slachtmaand van het eerste jaar een dorp hebben: negen maanden, of nooit. Het tweede jaar begint armer (op 1
  lentemaand geen graan, 44% van de akkers ongezaaid, 47% tevreden). En het spel draait en bewaart ook als los bestand.
- **Een plan voor stap 5, de proef afmaken** (vraag 58): A, eerst meten met een vijfde speler in de speeltest, de
  bouwer, twee jaar; B, de eerste weken als een raad onder het doel, die zegt wat nu tussen jou en een dorp staat
  (en anders "het volgende gezin komt over 7 dagen"); C, de tester krijgt een zip. Niets gebouwd.
- **Marcel koos** (vraag 58): "A Ja goed idee. B onder het doel. C itch io. Als ik thuis ben want heb alleen telefoon
  hier". Gebouwd: de raad onder het doel, de bouwer in de speeltest, en `npm run proefversie`, een zip voor itch.io
  met de stappen in `verpakken.md`. Zie onder Af. In de browser gezien: de raad in goud onder het doel, met de toets
  als toetsje, en de proefversie uitgepakt in een schone browser, zonder fouten en zonder één ontbrekend bestand.
- **Wat de bouwer liet zien** (zaad 1 tot en met 3, `speelbaar.md`): een dorp op 1 herfstmaand van het eerste jaar,
  in alle drie, en daarna de ondergang: geen goud voor een houthakker, 42 tot 53 doden in de eerste winter, geen
  zaaigraan in de lente, en aan het eind één mens of het ambt kwijt. Dat werd vraag 59.
- **Onderweg:** een tweede bouwer die de raad volgde, bouwde elke tien dagen een jager (de raad bleef zeggen dat het
  eten de winter niet haalde), en werd te traag; hij ging eruit, en de raad zegt nu hoe ver het hout en het eten komen
  ("haalt 26 van de 90 dagen"). De raad rekende elk beeld de hele winter uit (0,7 ms, en meer met een grotere kudde):
  nu om de halve seconde, en het eten pas vlak voor de winter. Braaf speelt met de raad erbij letter voor letter
  hetzelfde jaar als ervoor.
- **Marcel parkeerde vraag 59** ("Parkeer deze vraag, alles op main, we gaan naar het volgende punt in nieuwe
  sessie"): alles staat in `main`, en de volgende sessie begint bij de heervaart en een rivaal.

**Wat er in de vijftiende sessie gebeurde** (29 sep; Marcel: "Werklijst doorzetten"):
- **Een plan voor stap 3, de eerste keuren** (vraag 54): één venster onder `K`, een keuze die de volgende ochtend
  op het plein wordt afgekondigd, en per keur twee of drie keuzes die vooraf in getallen van nu zeggen wat ze
  doen. Twee agents zochten vooraf uit hoe eten, tevredenheid, groei, hout en de inner nu werken. Wat ze vonden:
  alle groei komt van vreemden (er wordt niemand geboren), meer eten maakt nu niet tevredener, en hout is niet
  schaars (één houthakker hakt ruim 600 per jaar), dus een houtkap die alleen meer hout geeft, kiest niemand.
  Daarom stelt het plan voor dat de houthakker zonder keur alleen sprokkelt, half zoveel als nu. Niets gebouwd.
- **Marcel: eenvoudiger, en een hoger doel.** "Het wordt gewoon een menu zoals in diplomacy 3, waar je weten kunt
  aannemen etc. Maak het niet te ingewikkeld, er is geen gelijkenis met de werkelijkheid." En: "Ons hogere doel is
  al het land veroveren of met iedereen vriendjes maken. Denk aan civilisation". Opgeschreven in `spel.md` en
  `CLAUDE.md`; het plan werd eenvoudig: een menu Wetten onder `W`, drie wetten met een voordeel en een nadeel,
  en belasting als idee voor een vierde (vraag 54).
- **Stap 3 is af: de eerste wetten** (Marcel: "A ja B ja, C later"). Zie onder Af. In de browser gezien: het
  menu onder `W`, de kaarten met wat een wet doet, en de tevredenheid in de balk die meteen meegaat. De balk paste
  met de extra knop niet meer op 1280 pixels breed; op een smaller scherm staan de knoppen nu zonder toetsletters,
  en past het toch niet, dan gaan ze naar een tweede regel. Een speeljaar van de
  speeltest (braaf, zaad 1, met de wetten op hun standaard) liep zonder fouten, en letter voor letter hetzelfde als
  dat jaar op de stand van vóór de wetten (`fa47629`, in een losse kopie met `git worktree`): dezelfde 57 berichten,
  26 naar 37 mensen, niemand dood, de houthakker op 1 herfstmaand.
- **Alles staat in `main`** (Marcel: "Graag alles naar main, en begin met stap 4").
- **Een plan voor stap 4, rovers en een militie** (vraag 55): wie wegtrekt, komt als rover terug, en eens per jaar
  komt er een bende van buiten; ze stelen op het plein; de mannen van het wachthuis vechten mee, elk met een eigen
  beurt; en wie valt, is gewond tot de ochtend. Nagekeken: het gevecht draait nu helemaal om de schout, en in het
  gehucht staat nog geen enkele vijand. Niets gebouwd.
- **Stap 4 is af: rovers en een militie** (Marcel: "A, Ja en ook 'wilde' rovers. B, ze roven de velden, graan etc
  ook maken ze soms velden kapot. C, Ja. D, mensen kunnen sterven"). Zie onder Af. Een speeljaar van de speeltest
  (braaf, zaad 1) liep zonder fouten, met twee keer wilde rovers (twee man): in zomermaand was de schuur leeg en
  vertrapten ze de akker van Trijn, in louwmaand namen ze 20 graan mee. De speler had geen wachthuis en ging ze niet
  te lijf. In de browser veertien gevechten gespeeld, zonder fouten: tegen drie rovers valt een schout die voorop
  loopt, en wint wie de wachters voor laat gaan; tegen twee wint iedereen. Dat werd vraag 56.
- **Marcel beantwoordde vraag 56:** "A laten zo, geen bericht. B schout kan sterven. C. We bouwen het langzaam op".
  Hoe de rovers langzaam opbouwen, werd vraag 57 (elk jaar een man meer, of naar de grootte van het dorp).
- **Marcel koos vraag 57 A** ("A, ja naar main, graan uit de schuur is goed"): de wilde rovers komen elk jaar van je
  ambt met een man meer, van twee tot vier. Gebouwd, en alles staat in `main`. Een speeljaar van de speeltest
  (braaf, zaad 1) liep daarna letter voor letter als ervoor (dezelfde 60 berichten): beide aanvallen vielen in het
  eerste jaar, met twee man, zoals het lot ze eerder ook koos.

**Wat er in de veertiende sessie gebeurde** (28 sep; Marcel: "Werklijst doorzetten"):
- **Een plan voor punt 4, de afrekening na het eerste jaar** (vraag 49): op 1 lentemaand, na de winter, de
  twee boeken naast elkaar (je eigen boek en dat van de heer) en het dorp, met een zin van de heer en een van
  het dorp. Hoe arm je leek, meet het aan wat de heer vroeg tegen wat hij gevraagd had als hij alles zag.
- **Nagekeken vóór het plan:** het spel houdt nu niet bij wat je aan het begin had, wat de soldaten vonden
  (alleen als zin in een bericht) en wie er stierf en waaraan; het rapport van de inner en het bezoek van de
  heer zijn na Sint-Maarten weg. De afrekening heeft dus een jaarboek nodig.
- **Marcel parkeerde de afrekening** ("Laten we afrekening even parkeren maar later kan dat? Ik denk dat het een
  minder interessant spel element is dan ik aanvankelijk dacht"), en noemde een andere nadruk: "Mogelijk wil ik
  meer de richting op van management van het dorp en het groeien. Ook het vechten met omliggende steden etc."
  Opgeschreven in `spel.md` ("Een nieuwe richting?"), met vier vragen van Claude in vraag 50. Niets gebouwd.
- **Marcel koos de richting** (vraag 50: "A ja B allebei C ja D ja"): besturen en groeien worden het hart, met
  keuren én bouwen en plannen; de heer blijft als de druk van boven; vechten begint met aanvallen op je eigen
  dorp, en tussen steden pas na de vrijheid. Opgeschreven in `spel.md` en `CLAUDE.md`.
- **Een plan voor de nieuwe volgorde** (vraag 51): het eerste speelbare product wordt "van gehucht tot dorp", in
  vijf stukken: het dorp bouwt zelf, de eerste trede, de eerste keuren, rovers en een militie, en de proef
  afmaken. Nagekeken: de trede staat al in de spelstaat en het bouwmenu, maar gaat nooit omhoog; het gevecht
  kent nog maar één man aan jouw kant.
- **Marcel koos de nieuwe volgorde** (vraag 51: "A ja B ja C ja D ja"): de proef wordt "van gehucht tot dorp", een
  dorp is 50 mensen, een kapel en een smidse, en de eerste keuren zijn vreemden, rantsoen en houtkap. De
  prioriteit bovenaan is opnieuw geordend, en `speelbaar.md` begint met de nieuwe proef.
- **Een plan voor stap 1, het dorp bouwt zelf** (vraag 52): erven van 10 bij 10 die je één voor één aanwijst, een
  gezin dat zelf zijn hut bouwt met hout uit de voorraad, en de hut en het huis uit het bouwmenu. Een agent zocht
  vooraf uit hoe bouwen en groeien nu werken, en hoeveel plaats de kaart heeft: genoeg voor zo'n acht erven. Hij
  vond ook dat je nu op een akker of een pad kunt bouwen, en dat een gezin zonder plaats niets zegt.
- **Stap 1 is af: het dorp bouwt zelf** (Marcel: "A ja B ja C ja D ja"). Zie onder Af. In de browser gespeeld: een
  erf met paaltjes, een gezin dat over de weg komt en voor zijn hut staat terwijl die oprijst, en na twee dagen
  de hut; zonder fouten. `npm test`: 578/578.
- **Alles staat in `main`** (Marcel: "Graag alles naar main, en begin met stap 2").
- **Stap 2 is af: de eerste trede** (vraag 53; Marcel: "A ja B ja C ja D ja"). Zie onder Af. In de browser gezien:
  het doel linksboven ("26 van 50 mensen · nog geen kapel · nog geen smidse"), de regel in de benoemingsbrief, en
  de brief van de heer met zijn twee knoppen; de tijd staat stil zolang hij openstaat. Eén speeljaar van de
  speeltest (braaf, zaad 1, op de werkmap met stap 1 en 2 erin) liep zonder fouten: 26 naar 37 mensen, niemand dood,
  de houthakker op 1 herfstmaand, net als op 28 sep.
- **Een plan voor stap 2, de eerste trede** (vraag 53): het doel linksboven en in de benoemingsbrief, een brief van
  de heer met twee knoppen als het een dorp is, en het bouwmenu van het dorp erbij. Nagekeken: de trede staat in de
  spelstaat maar gaat nooit omhoog, het bouwmenu toont alleen de trede van nu, en het gehucht begint zonder kapel
  en smidse (samen 18 van de 20 goud).

**Wat er in de dertiende sessie gebeurde** (28 sep; Marcel: "Werklijst doorzetten"):
- **Een plan voor punt 5, de eerste weken als opdrachten** (vraag 47): het schrift van je voorganger als stem
  in het vak linksboven, zes stappen voor de eerste weken, en drie momenten later in het jaar.
- **Marcel beantwoordde 33a, 33b en 8.** De afrekening zoals voorgesteld, en spelen beslist waar de grenzen
  liggen; vanzelf opslaan en ook zelf, met een menu en een titelscherm; de naam blijft Aardschok, voor nu
  (`speelbaar.md` en `verpakken.md`, onder Besloten).
- **De naam staat op één plek** (`js/naam.js`, `T.NAAM`), zodat een andere naam één regel is. De sleutel van de
  opslag in de browser verandert bewust niet mee. Zie onder Af.
- **Een plan voor punt 3, opslaan, het menu en het titelscherm** (vraag 48), na een meting: alles wat het spel
  onthoudt, zit in `Spel.S`, 380 kB, en wegschrijven kost 5 ms. Dus alles in één keer bewaren.
- **Punt 3 is af** (Marcel: "A ja B ja C ja D ja, push it"): het spel slaat elke ochtend zelf op, je hebt vijf
  eigen plekken, het opent op een titelscherm met het gehucht erachter, en `Esc` is het menu. Zie onder Af.
- **De proef met opslaan** (in de speeltest, `--opslaan`): een jaar dat halverwege opslaat, de bladzijde
  herlaadt en verder gaat met Verder, loopt letter voor letter af als hetzelfde jaar zonder opslaan, ook met
  volle kelders vlak voor de heer. Eerst vond de proef nog vier verschillen, alle vier scherm (zie onder Af).
- **Een fout gevonden en gerepareerd:** een nieuw spel wiste niet wat de regels onderweg in de spelstaat
  zetten (de heer, de inner, het slapen, het einde). "Opnieuw beginnen" na een val in een gevecht nam dat dus
  mee naar het volgende spel; na je ambt kwijt herlaadde de bladzijde, en daar viel het niet op.

**Wat er in de twaalfde sessie gebeurde** (28 sep; Marcel: "Werklijst doorzetten"):
- **De speeltest als script** (vraag 45; Marcel: "A ja B ja C ja D ja, push it"). `gereedschap/speeltest/`
  speelt het spel zoals het draait, in een onzichtbare browser: de speler klikt, loopt en drukt op de knoppen
  van de vensters, en een luisteraar op de regels schrijft op wat er gebeurt. Hetzelfde zaad geeft precies
  hetzelfde jaar (daarvoor moest het lot bij het begin van het jaar opnieuw op het zaad, en de klok van het
  scherm op nul, want of een koe ligt, hangt daarvan af). Een jaar kost twee tot zeven minuten.
- **Twaalf jaren gespeeld**, op het spel van `9f59661` (zoals `main`), zonder iets bij te stellen. De uitslag
  staat in `speelbaar.md`, en in grafieken op de pagina "Een jaar in het gehucht"
  (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr), boven die van 27 sep. Wat nu bij te stellen is,
  staat in vraag 46.
- **Drie gaten in de regels gevonden** (`opmerkingen.md`, bovenaan): wie de heer op de weg betaalt, krijgt
  geen soldaten; vanaf middernacht van zijn dag telt de inner al als in het dorp; en de schout blijft staan
  als er iemand op de volgende tegel staat, en dan is de klik weg. Niets veranderd (Marcel koos D).
- **Marcel over het bijstellen** (vraag 46): "Niet nu. Dit stellen we later in. We maken dan een menu met
  opties etc." En: "Graag alles naar main", en een nieuwe sessie voor het volgende werk.

**Wat er in de elfde sessie gebeurde** (28 sep; Marcel: "Werklijst doorzetten"):
- **De winter is zichtbaar** (punt 1 van de prioriteit, vraag 44). Op 1 herfstmaand en 1 slachtmaand zegt
  het dorp of het hout en het eten de winter halen, en wat helpt; in de winter één keer wanneer het op is,
  zoals het hooi; het hout staat rood in de balk als het de winter niet haalt; en wie sterft, sterft van
  de kou of de honger. Zie onder Af, en `spel.md`, "Het dorp: mensen, behoeften en de winter".
- **Een fout gevonden en gerepareerd:** vlees vulde wel een maag, maar telde niet mee als het dorp keek
  of er eten was. Met alleen vlees in de schuur stierven er in de winter mensen van de honger.
- **Opgevallen, voor later** (`opmerkingen.md`): het bericht vooraf rekent niet met wat de heer op
  Sint-Maarten neemt, en het hooi en het hout zeggen allebei "de winter duurt nog", terwijl de winter
  van het vee langer duurt dan die van het dorp.

**Wat er in de tiende sessie gebeurde** (27 sep, terwijl Marcel twee uur vloog; hij koos vooraf 1, 3 en
4 uit een lijst van Claude, en niet stuk 2 van de getuigen):
- **Opgeruimd (vraag 25, E):** elke toets laadt het spel zoals het draait (`test/laad.cjs`). Twaalf
  toetsen bleken een ander spel te toetsen dan er draait; ruim honderd bewakers gingen weg. Zie onder Af.
- **Een jaar gespeeld:** een agent speelde het gehucht drie keer een jaar (alles geven, 30% en 60%
  verstoppen), zonder iets bij te stellen. Het jaar loopt zonder fouten. De winter kost bijna de helft van
  het dorp aan kou, verstoppen is zonder risico (de soldaten zoeken alleen bij argwaan), en goud is het
  knelpunt. Alles staat in `speelbaar.md`, en in grafieken op de pagina "Een jaar in het gehucht"
  (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr).
  Het jaar liep op `main`, zonder wat de negende sessie daarna deed (stuk 2 van het zichtveld, en stuk 1
  en 2 van punt 4): de soldaten zoeken daar alleen bij argwaan, en de inner valt niet te bespelen.
- **Vraag 33 uitgewerkt** in `speelbaar.md`: wat er nog ontbreekt voor een proefversie van één jaar, de
  kortste weg, en vier vragen (33a tot en met 33d).
- **Vraag 8, een naam:** voorstel Martinmas, of Schout (`verpakken.md`, "De naam").
- **Marcel koos:** het gezin van de schout zwijgt over wat het zag (`spel.md`, bij stuk 2 van het
  zichtveld).

**Eerst speelbaar** (Marcel, 26 sep): "We moeten oppassen voor functie creep. Anders blijven we
toevoegen voor we bij een speelbaar product komen." Houd je aan de volgorde hieronder. Een nieuw idee,
ook een goed idee van Claude, gaat naar `opmerkingen.md` of achteraan, niet in de stap die loopt
(`CLAUDE.md`, "Het spel in het kort"). Wat het eerste speelbare product is, is vraag 33.

**Wat er op 26 sep gebeurde** (acht sessies; de details staan onder Af en in `spel.md`):
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
- In de zevende sessie: **de doorkijk is af** (vraag 34). Een proef liet zien dat het raster in het oog
  toch mengt; Marcel wilde het toch als keuze. Nu zie je door een huis heen ook de bezoekers en wie op
  het plein staat, en staan het kijkvenster en het raster als keuze in de spelregels. De doorkijk staat
  in een eigen bestand, `js/doorkijk.js`: het eerste stuk dat uit `tekenen.js` ging (vraag 25, D).
- In de achtste sessie: **ronde 4b van de huizenbouwer is af** (punt 1). Marcel koos het plan: in het
  spel stap 1 en 2 van de ladder, de rest op een plaat, en de schout in vakwerk op een stenen voet. Het
  gehucht heeft nu echte hutten, huizen van vakwerk, vijf boerderijen die niet allemaal dezelfde kant
  op staan, en elk huis weet waar zijn deur is. Marcel kreeg schermafdrukken en de plaat van de ladder.

**Wat er op 27 sep gebeurde** (negende sessie; details onder Af en in `spel.md`):
- **De herberg, stuk 1** (punt 2; vraag 35 tot en met 37, Marcel: "Werklijst doorzetten"): de herberg
  staat er vanaf het begin, in de hoek tussen het plein en de weg, van vakwerk onder riet. De
  herbergierster woont er en brouwt zelf, en 's avonds gaan er twee à drie mensen heen, in de winter
  meer; bij bedtijd lopen ze in het donker naar huis, en de lantaarn brandt. Marcel kreeg twee
  schermafdrukken.
- **De herberg, stuk 2** (Marcel koos B, vraag 38): in de herberg wordt gepraat. De roddelaar vertelt er
  wat er in zijn kelder ligt (pas dan vinden de soldaten het makkelijker), de herbergierster vertelt je de
  volgende dag wie er zat en wat er gezegd werd, en de marskramer logeert er.
- **De herberg, stuk 3** (vraag 39, Marcel: "Prima", en "Ja idd" op de schimmen): de herberg is groter,
  een T van acht bij elf tegels, en staat aan de westkant van het plein, waar de lege hut stond (die
  staat nu in de oude hoek). 's Avonds branden zijn ramen, met de gasten erachter als schimmen, en wat
  ervoor staat, dekt ze af. Omdat de meeste boeren oost en noord wonen, lopen ze nu verder en komen er
  iets minder gasten (in de herfst 2,0 per avond in plaats van 2,2). Marcel kreeg schermafdrukken.
- **Het zichtveld, stuk 1** (punt 3, vraag 40; Marcel: "A ja B ja C ja D ja"): wie buiten is, ziet de
  schout als het licht het toelaat (overdag acht tegels, 's nachts twee, bij een lantaarn zes), en wie hem
  iets ziet wegzetten of terughalen, is getuige: een oogje boven zijn hoofd en een bericht. Er brandt 's
  avonds een lantaarn bij de put. Het venster van de plek zegt vooraf wie je ziet. Marcel kreeg
  schermafdrukken.
- **Het zichtveld, stuk 2** (Marcel: "Doorzetten"): zag een roddelaar je, dan vertelt hij het de
  eerstvolgende avond in de herberg, en dan vinden de soldaten het op die plek twee keer zo makkelijk;
  de herbergierster vertelt het je de volgende dag. De rest zwijgt. In de spelregels kies je of je een
  getuige meteen ziet of pas later. Daarmee is punt 3 af.
- **De kern, stuk 1: de soldaten zoeken altijd** (punt 4, vraag 41; Marcel: "A ja B ja C ja"): ook onder de
  grens zoeken ze op Sint-Maarten, op twee of drie plekken. Ze lopen met de schout mee en doorzoeken wat
  zijn route vlak passeert; na twee uur kiezen ze zelf, zijn eigen kelder eerst; zo vaak als zijn argwaan
  wijst de heer ze zelf aan. Marcel kreeg een schermafdruk.
- **De kern, stuk 2: de inner bespelen** (punt 4, vraag 42; Marcel: "Ja ab goed zo"): zijn bezoek duurt
  tot zonsondergang; wie met hem praat, houdt hem op terwijl de dag doorloopt (drie uur per bezoek), en
  een geschenk van 5, 10 of 20 goud laat hem minder opschrijven, tot de helft, maar een op de vijf keer
  hoort de heer het. Wie niets doet, betaalt nu meer: alleen ziet hij het hele gehucht.
- **Een fout gevonden en gerepareerd:** in het spel telde het karakter van wie er woont bij de kelders
  niet (de vrome weigerde niet, de woekeraar hield niets). Twee bestanden hadden twee namen gemeen, en
  het laatste won; de toetsen laadden dat bestand niet. Dat is precies waar vraag 25, E voor is.

**Punt 2, de herberg, en punt 3, het zichtveld en de getuigen, zijn af** (27 sep), **en van punt 4 stuk
1 en 2** (de soldaten zoeken altijd; de inner afleiden en omkopen). **Het tweede proefje is gespeeld**
(de tiende sessie, hierboven), maar op `main` van vóór stuk 1 en 2. Wat er nu te doen is, staat hierboven
onder "Al het werk, op prioriteit". Wat Marcel kan bekijken, staat onder "Spelen, en zeggen hoe het voelt".

**De volgorde van het werk** (Marcel vroeg erom, 26 sep). Wat hij koos, staat erbij; de rest is een
voorstel van Claude, en daar gaat vraag 26 over. Sinds 27 sep staat al het werk op prioriteit bovenaan
(Marcel: "Al het werk ordenen op prioriteit"); wat hieronder staat, zijn per punt de details.

1. **Af (achtste sessie): ronde 4b van de huizenbouwer** (3b, stap 4; naar voren gehaald, vraag 29;
   zie onder Af). Wat hieronder staat, was het plan: elk huis in elk
   materiaal en elke vorm, niet waterpas (`beeld.md`, "De huizenbouwer op ronde vormen"), en ook een
   kwartslag gedraaid of gespiegeld, zodat een boerderij met de zijkant naar het plein kan staan. Zwaar
   tekenwerk met agents: vraag vooraf het verbruik op (`CLAUDE.md`, "Zuinig werken met agents").
   **Het plan, met Marcels keuzes (26 sep, achtste sessie; `beeld.md`, "Ronde 4b: de huizen in het
   spel"),** in drie stukken, met na elk een plaat:
   - **Stuk 1, de weg erheen:** de huizen van de bouwer naar een eigen vel (`tegels/huizen`), met voet,
     anker, een eigen deur per tekening (het spel nam altijd het midden van de zuidkant) en bouwfasen,
     gerenderd in vier draden.
   - **Stuk 2, het gehucht:** echte hutten (vlechtwerk onder riet) en huizen (vakwerk onder riet) in
     het bouwmenu, de vijf boerderijen elk een eigen, niet allemaal dezelfde kant op, en de schout in
     vakwerk op een stenen voet (Marcel: "Vakwerk op stenen voet"; het enige huis dat half steen is).
     De werkplaatsen houden voorlopig hun oude tekening.
   - **Stuk 3, de rest van de ladder:** in het spel alleen stap 1 en 2; de hele ladder (half steen, twee
     lagen, baksteen onder pannen) komt voor twee huizen op een plaat, zodat Marcel ziet waar het heen
     gaat (Marcel: "1 en 2 in spel, rest op plaat"). In het spel komt hij bij punt 5, Bouwen.
2. **Af (negende sessie): de herberg en de kleine zaken** (3b, stap 3): de avond krijgt een doel
   (`spel.md`, "Zaken waar de mensen zelf heen gaan"). In drie stukken (27 sep): de herberg staat er en de
   avond gaat erheen; er wordt gepraat; en hij is groter, aan de westkant van het plein, met ramen die
   branden. Zie onder Af.
3. **Af (negende sessie): het zichtveld en de getuigen** (vraag 23; Marcels idee): 's nachts iets doen
   in een donker steegje, zonder dat iemand het ziet. "Wie vlak langs een plek loopt, kan iets vinden"
   uit verstoppen deel 1b ging hierin op: wie je ziet, weet het. Het plan staat bij vraag 40; zie onder Af.
4. **Nu: de kern afmaken** (punt 6 en 6a), en daarmee de vraag van het tweede proefje: is dit leuk?
   De volgorde koos Marcel bij vraag 41 (C): stuk 1 en 2, dan het proefje, dan de rest.
   - **Af (27 sep), stuk 1:** verstoppen deel 1b, de rest: de soldaten zoeken op Sint-Maarten altijd op
     2 of 3 plekken, en je bepaalt de route zelf, maar soms kiest de heer;
   - **Af (27 sep), stuk 2:** van stap 3 van de inner praten, afleiden en omkopen (vraag 42);
   - **gespeeld (27 sep, tiende sessie): het tweede proefje,** een heel jaar, maar op `main` van vóór stuk
     1 en 2 (`speelbaar.md`, "De speeltest van 27 sep"); een nieuwe staat bovenaan, bij de prioriteit;
   - deel 2, het bos met de kudde (Marcel, 25 sep): een plek in het bos voor graan en goud (ver lopen,
     muizen en vocht), en een deel van de kudde het bos in voor de inner komt; hij telt de kudde, de
     heer vraagt per dier, en kaas en wol zijn sporen (dat is ook stap 3 van de weides). Een plan staat
     als idee in `opmerkingen.md` (vraag 43; Marcel: "alles als idee opslaan");
   - deel 3: de marskramer koopt en verkoopt vee, kaas, wol en hooi;
   - de rest van stap 3 van de inner: de twee rekenboeken, en de marskramer als spoor van het goud.
5. **Bouwen:** het dorp bouwt zelf, en beter (3b, stap 5): op bouwgrond die jij aanwijst, voor
   materiaal en goud, met steen per trede. (Ronde 4b van de huizenbouwer staat sinds vraag 29 hierboven,
   bij 1.) Dan komen ook de treden 3 tot 5 van de ladder in het spel (Marcel, 27 sep: "De ladder is goed
   zo"); baksteen moet daarvoor nog in de huizenbouwer. Ook de herberg groeit dan mee, met plaatsen
   (Marcel, 27 sep: "De herberg kan ook meegroeien met capaciteit"; `spel.md`, "De herberg: het plan").
6. **Daarna zoals onder "Daarna, in deze volgorde":** straten en paden (6c; het plein is er sinds 26
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
8. ~~Een naam; "Aardschok" past niet meer. Voorstel van Claude (27 sep): **Martinmas** (de dag waarop de
   heer int), met als ondertitel "Get rich. Look poor."; of **Schout**. Acht namen met waarom staan in
   `verpakken.md`, "De naam". Steam zelf is nog niet nagekeken.~~ **Beantwoord (Marcel, 28 sep): "De naam
   blijft aardschok voor nu. We maken later iets anders. Zorg dat we dat makkelijk door het hele spel kunnen
   aanpassen."** De naam staat nu op één plek, `js/naam.js` (`verpakken.md`, "De naam").
10. De monsters van het oude spel: de slijmkruiper, de skeletwacht, de reuzenspin en de kobold passen
    niet in het nieuwe spel, de wolf wel. Weg ermee, of bewaren tot er rovers zijn om de toetsen van
    het gevecht op te draaien? (`opmerkingen.md`, "Het gevecht na de leeftijd".) **Opgelost bij stap 4 (29 sep,
    vraag 55):** ze blijven alleen op de proefkaart, voor de toetsen; in het gehucht vechten de rovers.
11. Komt het leven van de schout terug (elke dag een beetje, of na een nacht rust), of wachten we
    daarmee tot punt 13, als vallen iets anders gaat betekenen? **Opgelost bij stap 4 (29 sep, vraag 55):** wie
    valt, is dood (Marcel: "mensen kunnen sterven"), en wie het overleeft, geneest na een nacht.
12. De knop Slaan draagt nog het toetsje `1`, dat sinds 7b niets doet: weg ermee, of laat 1 het
    monster slaan dat het dichtst bij staat? (`opmerkingen.md`, "Het gevecht na de leeftijd".) **Opgelost bij
    stap 4 (29 sep):** het toetsje is weg; slaan doe je door op een vijand te klikken.
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
23. ~~Komen het zichtveld voor iedereen en de getuigen (Marcels idee, 26 sep) als stap in 3b, of later
    bij punt 11 (de nacht)?~~ Het werd punt 3, na de herberg, en is af (27 sep).
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
    creep. Uitgewerkt op 27 sep, tiende sessie, in `speelbaar.md`: wat er is, wat ontbreekt, de kortste
    weg, en vier vragen, 33a tot en met 33d.) Voorstel: een proefversie van één jaar in het gehucht, van de benoemingsbrief tot
    Sint-Maarten, met de kern (rijk worden en arm lijken: verstoppen, de inner, de heer), opslaan en een
    titelscherm. Dan wordt duidelijk welke punten van de volgorde daarvoor nodig zijn, en welke kunnen
    wachten tot daarna.
34. **De doorkijk: alleen het kijkvenster, of ook het raster?** (Claude, 26 sep, zevende sessie, na
    een proef met een huis vóór het plein; `beeld.md`, "Doorkijk".) Het raster mengt in het oog toch:
    het rieten dak werd weer geelgroen, en grover wordt het een dambord. Voorstel: (1) alleen het
    kijkvenster, voor de schout, wie je spreekt, wie vecht, de bezoekers (heer, marskramer, inner,
    soldaten), en achter een huis ook iedereen op het plein, maar niet achter een boom, anders zitten
    de vijf eiken vol gaten; (2) in de spelregels in plaats van het raster de keuze of je door een huis
    ook iedereen op het plein ziet, of alleen wie ertoe doet; (3) de doorkijk naar een eigen bestand,
    `js/doorkijk.js`, met zijn getallen in één blok: een eerste stuk van vraag 25, D. Of wil Marcel
    het raster toch in het spel zien bewegen? Als proef is het er al; als keuze erbij is het klein.
    **Beantwoord (Marcel, 26 sep): "Ja dit is een goede optie", en daarna "Raster ook als keuze".**
    Dus in de spelregels twee keuzes: hoe je door iets heen kijkt (het kijkvenster, standaard, of het
    raster) en wie je door een huis ziet (ook iedereen op het plein, standaard, of alleen wie ertoe
    doet).

*De herberg* (27 sep, negende sessie; `spel.md`, "Zaken waar de mensen zelf heen gaan"). Bij het kijken
zag Claude dat de herberg bij de trede dorp hoort, en in het gehucht dus niet te bouwen is; de brouwerij
ook niet, en bier drinkt nog niemand. 's Avonds staat iedereen op zijn eigen erf. Het plan van Claude: een
herberg aan het plein, waar de weg binnenkomt, met de herbergierster die zelf brouwt; 's avonds gaat een
deel van de volwassenen erheen, naar karakter en seizoen, en wie ver woont minder vaak; elk bezoek drinkt
bier, en de bezoeken maken het dorp tevredener (stuk 1). Daarna de inner die een volle herberg ziet, het
nieuws van de herbergierster, en de marskramer die er slaapt (stuk 2). Marcel antwoordde op de drie vragen
met "Werklijst doorzetten"; Claude nam dat als ja op het voorstel. Zeg het als het anders moet.
35. ~~Hoe komt de herberg in het gehucht?~~ A, hij staat er van het begin; B, jij bouwt hem; of C, pas als
    het gehucht een dorp wordt. **Het voorstel: A.**
36. ~~Brouwt de herbergierster zelf van graan, of moet er eerst een brouwerij komen?~~ **Het voorstel:
    zelf** (dat deden herbergiers vaak).
37. ~~"Een huis groeit door wat zijn bewoners kunnen bereiken": nu, of bij punt 5?~~ **Het voorstel: bij
    punt 5,** want pas dan klimmen de huizen de ladder op.
38. **Stuk 2 van de herberg: wat doet hij voor de kern?** (Claude, 27 sep, na stuk 1.) A: **de heer heft
    op bier.** De inner vraagt de herbergierster wat er getapt is, zoals de marskramer hem vertelt wat hij
    je betaalde, en de heer wil er een deel van in goud. Eenvoudig, maar je kunt er nog niets tegen doen;
    dat komt met de keuren (bier belasten, een avondklok). B: **in de herberg wordt gepraat.** De
    roddelaar vertelt daar wat er in zijn kelder ligt: wat je bij hem verstopt, is alleen riskant als hij
    naar de herberg gaat. En de herbergierster vertelt jou wie er gisteravond was en wat er gezegd werd.
    Zo speelt de herberg mee in het verstoppen, en krijg je informatie in plaats van een getal; het is
    ook het begin van de getuigen (punt 3). C: allebei. Bij alle drie slaapt de marskramer in de herberg:
    hij staat tien dagen op het plein. **Voorstel: B.** **Beantwoord (Marcel, 27 sep): "Het wordt B."**
39. **Moet de herberg groter, of komt er een los café?** (Marcel, 27 sep, bij het antwoord op 38: "ik denk
    dat de herberg ook groter moet zijn? Of maken we nog een los cafe?") Claude: een café bestaat in 1323
    nog niet, want koffie kwam hier pas rond 1660. Wat er wel was: de herberg, met bedden en een stal voor
    wie op reis is, en de tapperij of kroeg, alleen drank voor het dorp zelf, vaak in de voorkamer van
    een gewoon huis. Een tweede in een gehucht van 26 mensen is veel; een tapperij past bij het dorp (punt
    14, de treden). Groter: ja, want hij is nu zo groot als een boerderij, terwijl hij het enige gebouw van
    iedereen is. Drie vormen op een plaat, allemaal vakwerk onder riet: A, een L (7×10); B, een T met de
    topgevel naar voren (8×11); C, twee lagen (6×9), maar dat is trede 4 van de ladder. In de hoek tussen
    het plein en de weg past geen groter huis: de weide, het pad van Wouter en de weg zitten eromheen.
    **Voorstel: B, aan de westkant van het plein, waar nu de lege hut staat, met zijn deur naar het plein.
    De lege hut ruilt van plek en komt waar nu de herberg staat.** Achter de herberg is dan ook plaats
    voor de stal (punt 13).
    **Marcel (27 sep): "Misschien een raam waar je mensen doorheen ziet."** Voorstel van Claude: 's avonds
    branden de ramen van de herberg, en daarin zie je de gasten als schimmen bewegen, meer naarmate er
    meer binnen zitten. De huizenbouwer weet van elk raam waar het zit; die moet dat aan het spel
    doorgeven. Daarna kan het ook voor elk huis: licht achter het raam zolang er iemand wakker is. Dat
    helpt punt 3, want een verlicht raam is een getuige. Goedkoper: 's zomers blijven de gasten buiten op
    het bankje zitten, 's winters gaan ze naar binnen. Een doorkijk in de herberg zelf (tafels, een
    tapkast) is veel tekenwerk en hoort er nu niet bij.
    **Beantwoord (Marcel, 27 sep): de schimmen achter een verlicht raam, "Ja idd"; en B aan de westkant
    van het plein, "Prima".**
40. **Punt 3, het zichtveld en de getuigen: het plan** (Claude, 27 sep, na de herberg; wacht op Marcel).
    Wat er al is: zien langs een lijn waar huizen de blik tegenhouden (`T.zichtTussen`, `js/wereld.js`),
    de inner die zo kijkt (`T.innerKijkt`), en de plekken waar je iets wegzet of terughaalt (`T.verstop`,
    `T.haalTerug`, `js/verstoppen.js`), op het moment dat je bij de deur staat. Voorstel, in twee stukken:
    - **Stuk 1, iedereen ziet, en 's nachts minder ver:** wie buiten is, ziet de schout als hij dichtbij
      genoeg is en er niets tussen staat: overdag acht tegels, in de schemering vijf, 's nachts twee, en
      bij een brandende lantaarn of een verlicht raam (de herberg) verder. Wie binnen is of slaapt, ziet
      niets. Zet je iets weg of haal je iets terug terwijl iemand je ziet, dan is hij getuige: een oogje
      boven zijn hoofd en een bericht ("Trijn zag je graan in de kelder van Gerrit zetten"); zag
      niemand het, dan zegt het bericht dat ook.
    - **Stuk 2, wat een getuige doet, naar zijn karakter:** de roddelaar vertelt het die avond in de
      herberg; dan vinden de soldaten die plek twee keer zo makkelijk (zoals nu zijn eigen kelder), en de
      herbergierster vertelt het je de volgende dag. De vrome zwijgt, of biecht het later (de kapelaan
      komt nog); de verklikker (punt 10) komt later. De rest zwijgt, tot de inner het vraagt (punt 4).
    Vragen: **A**, zie je meteen dat iemand je zag (het oogje), of pas later (de herbergierster, de
    soldaten)? Voorstel: meteen, en later als keuze in de spelregels. **B**, telt alleen de handeling bij
    de plek, of ook met een zak graan door het dorp lopen? Voorstel: alleen de handeling; sjouwen komt
    pas als goederen echt gedragen worden. **C**, een lantaarn voor de schout (je ziet verder, maar wordt
    ook eerder gezien): nu of later? Voorstel: later, bij punt 11, de nacht.
    **Marcel (27 sep): "Denk wel dat we ook losse lantaarns / lichtbronnen in het dorp nodig hebben.
    Hadden we vroeger niet iemand die de lampen 's avonds aanstak?"** Claude: de lantaarnopsteker kwam
    met de straatverlichting, in 1669; in 1323 hing er hooguit een lantaarn aan de deur, en in sommige
    steden was dat een regel (`spel.md`, "lichtbronnen in het dorp"). Wie ze aansteekt, hebben we al in
    de kunst: de koster, met een brandende lantaarn en de sleutels van de kerk. **D**, voorstel: in stuk
    1 een paar vaste lantaarns in het gehucht (bij de put op het plein; de herberg heeft er al een), die
    branden van de avond tot bedtijd: daar zie je verder, en word je eerder gezien, dus zoek je voor je
    nachtwerk de donkere hoeken op. Wie ze aansteekt, komt later: de koster (als er een kapel is), de
    keur "een lantaarn aan elke deur" (deel C) en de nachtwacht (punt 11).
    **Beantwoord (Marcel, 27 sep): "A ja B ja C ja D ja".** Stuk 1 en 2 zijn af.
41. **Punt 4, de kern afmaken: het plan** (Claude, 27 sep, na het zichtveld; wacht op Marcel). Punt 4 heeft
    vier delen; voorstel: eerst wat verstoppen spannend maakt, dan het tweede proefje (is dit leuk?), en
    de rest daarna.
    - **Stuk 1, deel 1b: de soldaten zoeken altijd** (Marcel koos het op 25 sep). Nu doorzoeken ze het
      dorp pas vanaf 50% argwaan, en daaronder is verstoppen dus altijd veilig. Voortaan zoeken ze op
      Sint-Maarten altijd op twee of drie plekken, en wie vlak langs een plek loopt, kan iets vinden.
    - **Stuk 2, de inner bespelen** (stap 3, het eerste deel): als hij komt, kun je met hem praten: zolang
      je praat, kijkt hij niet rond (afleiden), en voor goud kijkt hij de andere kant op (omkopen), maar
      wat je hem geeft, telt de heer als hij het hoort. De twee rekenboeken komen later.
    - **Dan het tweede proefje:** een heel jaar spelen, van het voorjaar tot Sint-Maarten, en kijken of
      rijk worden en arm lijken leuk is. Marcel speelt het ook.
    - **Daarna:** deel 2 (het bos met de kudde), deel 3 (de marskramer koopt en verkoopt vee, kaas, wol
      en hooi) en de rekenboeken.
    Vragen: **A**, de route van de soldaten. Voorstel: de schout loopt voor, de soldaten lopen mee (zoals
    de inner nu met je meeloopt), en doorzoeken elke plek die ze vlak passeren; passeren ze er minder dan
    twee, dan kiezen ze er zelf bij, en je eigen kelder eerst. Of: je wijst de plekken aan in een lijst.
    **B**, hoe vaak de heer zelf kiest. Voorstel: zo vaak als zijn argwaan (bij 30% argwaan een op de
    drie keer), en dan kiest hij de plekken die het rijkst ogen. **C**, de volgorde hierboven: eerst
    stuk 1 en 2, dan het proefje, dan de rest?
    **Beantwoord (Marcel, 27 sep): "A ja B ja C ja".** Stuk 1 is af.
42. **Punt 4, stuk 2: de inner bespelen** (Claude, 27 sep, na stuk 1; wacht op Marcel). Wat er al is:
    zolang je met de inner praat, staat hij stil en kijkt hij niet. Maar het kost hem niets: zijn bezoek
    duurt tot zijn geduld op is (90 stappen), en praten telt daar niet mee, dus daarna telt hij gewoon
    verder. Voorstel:
    - **Afleiden:** zijn bezoek duurt tot zonsondergang, want hij moet voor donker terug zijn op het
      kasteel. Zolang je met hem praat, loopt de dag door (dat doet hij nu al). Wie hem aan de praat
      houdt, laat hem minder zien.
    - **Omkopen:** in zijn gesprek geef je hem een geschenk van 5, 10 of 20 goud. Dan schrijft hij minder
      op: per 5 goud een tiende minder op zijn rapport, tot de helft. Maar met een kans (een op de vijf)
      hoort de heer het: dan telt het geschenk als goud in de kist, en wordt hij argwanend.
    Vragen: **A**, afleiden zo (tot zonsondergang, en praten kost hem zijn dag)? **B**, omkopen zo (goud
    tegen minder op het rapport, met een kans dat de heer het hoort)?
    **Beantwoord (Marcel, 27 sep): "Ja ab goed zo".** Stuk 2 is af (zie onder Af). Twee dingen kwamen
    erbij om het te laten werken: hij praat hooguit drie uur per bezoek (anders houd je hem met een open
    gesprek de hele dag op), en naast een schout die stilstaat, wacht hij een half uur (anders was
    stilstaan hetzelfde als praten). Allebei in de werkbank. Of de getallen goed zijn (is de helft
    minder voor 25 goud te goedkoop?), zien we later: "We gaan later finetunen" (Marcel, 27 sep).
43. ~~**Punt 4, deel 2: het bos met de kudde, het plan**~~ (Claude, 27 sep, terwijl een andere agent het
    proefje speelt). **Bewaard als idee** (Marcel, 27 sep: "Push en alles als idee opslaan"): het hele
    plan, met de vier open vragen (A tot en met D), staat in `opmerkingen.md` onder "Voorstellen van
    Claude die nog niet gekozen zijn". Niet bouwen tot Marcel erom vraagt.
44. **De winter zichtbaar maken: het plan** (Claude, 27 sep; Marcel: "Goed zo, begin met de winter";
    wacht op Marcel). Wat er nu is: de winter duurt drie maanden (wintermaand tot en met sprokkelmaand), en
    dan stookt elk huishouden 0,15 hout per dag. Voor het gehucht (26 mensen, 7 huishoudens) is dat zo'n
    95 hout; het begint met 40, en alleen een houthakker brengt meer (2 per dag, het hele jaar; de
    marskramer verkoopt geen hout). Is het hout of het eten op, dan sterft er elke dag een deel van het
    dorp, en het bericht zegt "De winter is hard: Folkert is gestorven", niet waaraan. Vooraf zegt niets
    het: de tevredenheid noemt het brandhout pas als het vandaag op is. Voor het vee bestaat het wel: "Het
    hooi is over 12 dagen op, en de winter duurt nog 40 dagen." Voorstel, in één stuk:
    - **Vooraf:** op 1 herfstmaand (drie maanden vooraf) en op 1 slachtmaand (een maand vooraf) zegt een
      bericht of het hout en het eten de winter halen, naar wat er ligt en wat er nu per dag bijkomt (wat
      de houthakkers gisteren hakten). Haalt het de winter niet, dan zegt het ook wat helpt: "Over een
      maand is het winter. Het hout haalt 38 van de 90 dagen. Een houthakker hakt 2 hout per dag."
    - **In de winter:** zoals bij het hooi, één keer per winter: "Het hout is over 12 dagen op, en de
      winter duurt nog 40 dagen." Het hooi en het hout zeggen het op dezelfde manier, uit één regel.
    - **In de balk:** bij de muis op het hout staat voor hoeveel van de 90 winterdagen het genoeg is, en
      het cijfer wordt rood als dat de winter niet haalt.
    - **Waaraan iemand stierf:** "De kou is hard, want het hout is op: Folkert is gestorven." Of de
      honger, want het eten is op, of allebei.
    - Het eten gaat net zo (graan, kaas en vlees, en de melk van de koeien, tegen wat het dorp eet), maar
      dat was in de speeltest niet het probleem.
    Vragen: **A**, wanneer waarschuwen: drie maanden en een maand vooraf, en dan in de winter zelf? **B**,
    het rode cijfer in de balk ook? **C**, sneeuw of rijp in het beeld, zodat je de winter ook ziet (nu is
    het gehucht in de winter alleen donkerder)? Voorstel: niet nu, want dat is tekenwerk voor elke tegel,
    boom en elk dak; wel op de lijst, na de proefversie.
    **Beantwoord (Marcel, 27 sep): "A ja B ja C ja, push it".** A: drie maanden en een maand vooraf, en in
    de winter zelf; B: het rode cijfer in de balk; C: geen sneeuw nu, wel op de lijst na de proefversie
    (Claude las "ja" als ja op het voorstel; zeg het als het anders bedoeld was). Het besluit staat in
    `spel.md`, "Het dorp: mensen, behoeften en de winter". **Gebouwd (28 sep, elfde sessie):** zie onder Af.
45. **De speeltest op de stand van nu: het plan** (Claude, 28 sep, twaalfde sessie; Marcel: "Werklijst
    doorzetten"; wacht op Marcel). Hij speelt op `main`, commit `ba8ff55`. Sinds de speeltest van 27 sep kwam
    erbij: de soldaten zoeken op Sint-Maarten altijd op twee of drie plekken, met de schout mee; de inner
    blijft tot zonsondergang, en je houdt hem op met praten of koopt hem om (5, 10 of 20 goud, en een op de
    vijf keer hoort de heer het); een roddelaar die je iets zag wegzetten, vertelt het in de herberg; de
    winter waarschuwt; en vlees telt als eten. De test moet laten zien of verstoppen nu een gok is: wat het
    kost als het gevonden wordt, tegen wat het oplevert. Daarin telt het lot mee: bij een zoekbeurt vinden
    de soldaten een kelder voor 30%, die van de schout voor 60%, een kapel voor 5%. Eén jaar per manier zegt
    dan bij toeval weinig. Voorstel:
    - **Wie speelt: een script dat blijft** (`gereedschap/speeltest/`), geen agent die met de hand speelt
      zoals op 27 sep. Het spel draait zoals het draait, in een onzichtbare browser (`Spel.debug.stap`), en
      een speler in code doet wat een speler doet: lopen, verstoppen, met de inner praten, de soldaten
      leiden, en de vensters (de brief, slachten, betalen) met hun eigen knoppen. Elk jaar krijgt een vast
      zaad: hetzelfde zaad geeft dezelfde boeren en hetzelfde lot. Waarom: na het bijstellen van een getal
      speel je hetzelfde jaar opnieuw en zie je precies wat de wijziging deed (het finetunen van straks),
      en dat kost dan alleen rekentijd, zo'n twee minuten per jaar. Het script van 27 sep is er niet meer:
      elke speeltest begint nu opnieuw. De eerste keer is het wel meer werk dan een agent laten spelen.
    - **Vier spelers.** (1) **Braaf**: geeft alles; de maatstaf. (2) en (3) **Lui, 30% en 60% weg**, zoals
      B en C van 27 sep (overdag, in de kelders die het dichtst bij zijn, niet meelopen, niets terughalen),
      zodat je ziet wat de nieuwe regels met dezelfde speler doen. (4) **Slim, 60% weg**: verstopt 's nachts
      als niemand kijkt, niet bij de roddelaar; praat met de inner en geeft hem 10 goud; loopt met hem mee
      langs de armste huizen; leidt de soldaten langs lege kelders; verkoopt graan aan de marskramer; en
      haalt na Sint-Maarten terug wat nodig is om te eten en te zaaien. Alle vier luisteren naar de winter:
      zegt het dorp dat het hout de winter niet haalt, dan bouwen ze een houthakker. Anders sterft weer
      bijna de helft en zegt de test niets over de kern; zo toetst hij meteen of de waarschuwing op tijd
      komt.
    - **Drie jaren per speler,** elk met een ander zaad: twaalf jaren.
    - **Wat hij meet.** Per maand: de voorraad (graan, goud, hout), wat waar verstopt ligt, de mensen en
      waaraan ze stierven, de tevredenheid en de argwaan. Per jaar: wat de inner zag tegen wat er was, zijn
      rapport, wat de heer vroeg en kreeg, de straf, welke plekken de soldaten doorzochten en wat ze vonden,
      de getuigen en wie het vertelde, wat de inner kreeg en of de heer het hoorde, wanneer de winter
      waarschuwde, en de fouten in de console.
    - **Waar hij op let:** of er één zet is die altijd wint, want dan valt er niets te kiezen. Een die nu
      al opvalt: een kapel (10 hout en 8 goud) houdt 120 graan, de soldaten vinden hem voor 5% en kiezen hem
      als laatste, en de heer vraagt er niets voor. De slimme speler bouwt er daarom een.
    - **De uitslag** komt in `speelbaar.md`, en in grafieken op de pagina "Een jaar in het gehucht",
      naast die van 27 sep.
    - **Niets bijstellen tijdens de test,** ook niet wat al schuurt (een kelder houdt 40 graan, de heer
      vraagt 15% van het graan): eerst meten, dan samen bijstellen.
    Marcel speelt ook, op `main` (commit `ba8ff55`); wat er te bekijken is, staat onder "Spelen, en zeggen
    hoe het voelt" (de inner bespelen, de winter). Vragen: **A**, een script dat blijft (voorstel), of een
    agent zoals op 27 sep? **B**, deze vier spelers? **C**, drie jaren per speler? **D**, niets bijstellen
    tijdens de test?
    **Beantwoord (Marcel, 28 sep): "A ja B ja C ja D ja, push it".** Een script dat blijft, deze vier
    spelers, drie jaren per speler, en niets bijstellen tijdens de test. **Gespeeld (28 sep, twaalfde
    sessie):** de uitslag staat in `speelbaar.md`, "De speeltest van 28 sep", en wat nu bij te stellen is,
    in vraag 46.
46. **Wat bijstellen na de speeltest van 28 sep** (Claude, 28 sep, twaalfde sessie; later). Twaalf
    jaren liepen zonder fout, en de winter doodt niet meer: iedereen bouwde na de waarschuwing een
    houthakker. Maar de kern is nog geen gok. Wie weet hoe het werkt, lijkt arm met één zet, en verstoppen
    doet er weinig toe (`speelbaar.md`, "De speeltest van 28 sep"). Voorstellen, elk als optie in de
    spelregels zoals altijd, met jouw keuze als standaard:
    - **A, de inner laat zich niet uitschakelen.** Nu volgt hij wie naast hem loopt zo lang die loopt: met
      drie uur praten en heen en weer lopen waar hij niets ziet, zag hij in drie van de drie jaren niets, en
      vroeg de heer 28 graan en 2 goud in plaats van 88 graan en 25 goud. Voorstel: hij volgt je hooguit twee
      uur per bezoek, zoals hij drie uur praat ("Genoeg gewandeld, schout: ik moet tellen"); daarna loopt hij
      zijn eigen ronde, en meelopen stuurt hem alleen nog. Zo blijft meelopen de moeite waard (hij ziet
      minder, of later), maar het hele dorp verbergen kan niet meer.
    - **B, verstoppen levert meer op.** De heer vraagt 15% van het graan dat de inner telde, dus wie 250 graan
      wegzet, spaart er 33 (en loopt het risico dat de soldaten het vinden). Voorstel: niets aan verstoppen
      zelf, maar A en C maken de inner scherper, en dan telt wat hij níet ziet weer. Wil je meer, dan kan de
      heer een groter deel van het graan vragen (de werkbank, "wat de heer van het graan vraagt").
    - **C, de argwaan kan stijgen.** Hij groeit pas onder 60% van het graan dat de velden beloven die de inner
      zag; in twaalf jaren bleef hij 0 tot 4%. Voorstel: de inner weet hoe groot het gehucht is (de heer
      stuurde hem met een lijst), en wat hij niet zag, maakt hem argwanend ("Drie boerderijen? Ik heb er vijf
      op mijn lijst."). Dan kiest de heer soms zelf waar de soldaten zoeken, en kan leiden mislukken: de gok.
    - **D, het goud.** De heer vraagt 25 goud, het gehucht heeft er 16: ook wie alles geeft, krijgt elk jaar
      een boete. Voorstel: het hoofdgeld en de prijs per gebouw zo dat een braaf gehucht dat niet handelt, het
      net haalt (zo'n 15 goud), en wie meer wil, verkoopt graan aan de marskramer.
    - **E, de kleine gaten** (`opmerkingen.md`, bovenaan): pas betalen als de heer op het plein staat (nu kun
      je hem op de weg betalen, en dan zoeken de soldaten niet); verstoppen kan tot de inner echt binnenloopt,
      niet tot middernacht; en de winterberichten rekenen met de heer, zijn soldaten en het verstopte graan.
    Na het bijstellen speelt `npm run speeltest` dezelfde twaalf jaren opnieuw, en zie je precies wat het deed.
    Vragen: **A**, **B**, **C**, **D** en **E**: ja, anders, of niet nu? En wil je eerst zelf een jaar spelen
    voor we iets veranderen?
    **Beantwoord (Marcel, 28 sep): "Niet nu. Dit stellen we later in. We maken dan een menu met opties etc."**
    Niets gebouwd. De voorstellen blijven hier staan voor als het zover is, en de gaten uit de speeltest in
    `opmerkingen.md`.
47. **De eerste weken als opdrachten: het plan** (Claude, 28 sep, dertiende sessie; Marcel: "Werklijst
    doorzetten"; wacht op Marcel). Punt 5 van de prioriteit. Wat er al is: het vak linksboven voor "de
    opdracht van dit moment" (`T.ui.opdracht`, `js/ui.js`), en quests met fasen, een doel per fase, een melding
    en wegen die vanzelf gaan (`klaarAls`, `js/quest.js`), met een eigen bewerker (`gereedschap/quests.html`).
    Er staat nog geen quest in. Wat een nieuwe speler nu krijgt: de benoemingsbrief, en dan niets. Hij staat
    bij zijn eigen deur, twee tegels van het plein; het zaaien gaat vanzelf; de marskramer komt op 5 grasmaand,
    de inner op 15 oogstmaand, de heer op Sint-Maarten. Voorstel:
    - **A, wie het zegt: het schrift van je voorganger.** De brief zegt dat hij "nu elders" is; zijn schrift
      zegt wat hij deed, en waar het misging. De kop in het vak is "Het schrift van je voorganger", en elke regel
      is een raad in zijn stem, met de toets erbij. Zo gebeurt het in de wereld zelf, zonder uitlegger en zonder
      scène (Marcel, 25 sep), en leert het de kern: wat hij verborg, en wat ze vonden. De benoemingsbrief krijgt
      een regel erbij: "Uw voorganger liet een schrift achter. Wij hebben het niet gelezen: er stonden geen
      bedragen in." Het andere: een gewoon "Te doen", in de stem van het spel.
    - **B, de eerste weken: zes stappen**, één tegelijk in het vak, elk klaar zodra je het doet:
      1. *Het plein:* "Loop naar het plein: klik op de grond. Daar komt de marskramer om te verkopen, en de heer
         om te halen." (Lopen, en waar de bezoekers staan.)
      2. *Praten:* "Praat met een boer: klik hem aan. De ene houdt zijn mond, de andere niet." (Gesprekken, en
         dat het karakter van een boer telt voor zijn kelder.)
      3. *De kelder:* "Klik op je huis. In de kelder zet je weg wat de inner niet hoeft te zien. Mijn kelder
         zochten ze altijd het eerst." (Het venster van de plek; de kern.)
      4. *Bouwen:* "Het hout haalt de winter niet. Bouw een houthakker: `B`." (Het bouwmenu, en de winter
         vóór de waarschuwing van 1 herfstmaand.)
      5. *De tijd:* "Een dag duurt lang. Zet de tijd sneller met `+` of de knoppen bij de datum; 's avonds slaap
         je thuis: `Z`."
      6. *De marskramer:* eerst "Op 5 grasmaand komt de marskramer", en als hij er is: "Verkoop hem graan: de heer
         wil goud, en daar heb je te weinig van." (De enige weg naar goud; in de speeltest haalde ook wie alles
         gaf, het goud van de heer niet.)
    - **C, ook drie momenten later in het jaar**, in hetzelfde vak: (7) vóór de inner: "Op 15 oogstmaand komt de
      inner. Wat hij niet ziet, telt hij niet", en als hij er is: "Wie met hem praat, houdt hem op"; (8) op
      Sint-Maarten: "Praat met de heer en betaal. Wat je achterhoudt, zoeken zijn soldaten"; (9) na Sint-Maarten:
      "Haal terug wat je verstopte: wat in een kelder ligt, eet niemand en zaait niemand." Daarna: "Hier houdt
      het schrift op." Waarom: de duurste fout uit de speeltest van 28 sep is precies die van een nieuwkomer. De
      luie spelers verstopten en haalden niets terug; in de winter stierven er gemiddeld 4 en 9 van de honger,
      en in lentemaand bleef elke akker ongezaaid. De eerste weken alleen vangen dat niet.
    - **Hoe het werkt** (geen vraag, wel goed om te weten): het schrift is een quest met één weg per fase, zodat
      er één systeem blijft, met één vak en één bewerker; daar kun je de zinnen zelf herschrijven. De toets van
      drie antwoorden (elke quest drie wegen die elk iets anders kosten) komt uit het oude spel en past niet op
      uitleg; een quest met `uitleg: true` slaat hem over. Een weg weet nu alleen van vlaggen, voorwerpen, quests
      en goud; er komen een paar vragen aan het spel bij, op één plek (staat de schout op het plein, is er een
      houthakker, heb je gehandeld, is de inner er). Wat je al deed, slaat het schrift stil over. Wie een stap
      laat liggen, zit niet vast: na een paar dagen bladert het schrift verder, en wat aan een dag hangt (de
      marskramer, de inner, de heer), komt op die dag, wat je ook deed. In de spelregels (`O`) zet je het uit,
      standaard staat het aan; op `?kaart=proef` is het er niet. De regels krijgen toetsen zonder scherm, en
      `npm run speeltest` schrijft erbij op welke dag elke stap af was, of dat het schrift zonder verder ging.
      De spelers van de speeltest veranderen niet.
    Klaar als een nieuw spel na de brief de eerste stap toont, elke stap afgaat zodra je hem doet (ook als je
    hem al deed), niemand op een stap blijft hangen, het schrift uit kan, `npm test` groen is, en de speeltest
    het schrift bij alle vier de spelers tot het eind ziet komen. Vragen: **A**, het schrift van je voorganger,
    of een gewoon "Te doen"? **B**, deze zes stappen, en de zinnen zo? **C**, ook de drie momenten later in het
    jaar?
    **Herschreven (29 sep, zestiende sessie):** voor de nieuwe richting, in vraag 58, B.
48. **Opslaan, het menu en het titelscherm: het plan** (Claude, 28 sep, dertiende sessie; na Marcels antwoord
    op 33b: "Auto opslaan, maar ook zelf kunnen kiezen. Er moet ook een menu komen titel scherm etc"; wacht op
    Marcel). Punt 3 van de prioriteit. Wat er nu is: wie de bladzijde opent of herlaadt, begint een nieuw spel,
    met nieuwe boeren; alleen de spelregels onthoudt de browser. Gemeten in een half jaar spelen: **alles wat
    het spel onthoudt, zit in `Spel.S`** (geen enkel bestand houdt iets apart bij), er zit geen functie in, wel
    twaalf verzamelingen en zo'n 140 plekken waar het ene het andere aanwijst (een bewoner zijn poppetje, zijn
    huis en zijn werk). Alles samen is 380 kB, waarvan vier vijfde de kaart zelf, en het wegschrijven kost 5
    ms. Voorstel:
    - **Hoe (geen vraag): alles in één keer.** Het spel bewaart heel `Spel.S`, behalve wat alleen scherm is
      (de camera, de muis, de buffer van de grond), en houdt daarbij de verzamelingen en wie wie aanwijst heel.
      Zo hoeft niets te zeggen wat het bewaart, en vergeet niemand iets als er straks iets bijkomt. Het staat
      achter één functie: in de browser in de opslag van de browser, in de verpakking voor Steam een bestand
      (`verpakken.md`, "Wat we tot die tijd niet mogen breken", 3). Een opgeslagen spel draagt een
      versienummer: past het niet meer bij het spel, dan zegt het menu dat, in plaats van een spel dat
      halverwege stukloopt. Zolang een tester speelt, veranderen we de vorm dan liever niet.
    - **A, vanzelf opslaan:** elke ochtend bij zonsopgang, op één plek die steeds overschreven wordt. Staat er
      dan een venster open, dan zodra het dicht is. Een klein "Opgeslagen" in de hoek zegt dat het gebeurde.
    - **B, zelf opslaan:** vijf plekken, elk met de dag in het spel en wanneer je opsloeg ("12 grasmaand 1323,
      ochtend · vandaag 21:40"). Overschrijven vraagt eerst. Laden kan uit alle zes, de nieuwste bovenaan.
    - **C, het titelscherm:** de naam (`T.NAAM`), met **Verder** (het nieuwste spel, vanzelf of zelf
      opgeslagen; alleen als er een is), **Nieuw spel** (dan de benoemingsbrief, zoals nu), **Laden** en
      **Spelregels** (het venster van `O`, met de werkbank: daar komt later het bijstellen, vraag 46). Achter het
      scherm ligt het gehucht al, stil, met de camera die langzaam over het plein glijdt: het nieuwe spel wacht
      er klaar. Zo laadt ook de pixel art achter het scherm, en zie je geen vlakken meer bij het opstarten
      (`verpakken.md`, "Wat het wél browserig laat voelen"). Op `?kaart=proef` blijft het weg.
    - **D, het menu in het spel:** `Esc` (als er niets anders open is om te sluiten) of een knop rechtsboven.
      **Verder spelen**, **Opslaan**, **Laden**, **Spelregels**, **Naar het titelscherm**. De tijd staat stil
      zolang het open is; in een gevecht kan opslaan niet. En de twee eindschermen ("Je ambt kwijt" en
      "Gevallen") gaan allebei naar het titelscherm. Nu herlaadt het ene de bladzijde en begint het andere een
      nieuw spel: twee manieren voor één ding.
    - **Getoetst:** opslaan, laden en weer opslaan geeft precies hetzelfde; en de speeltest speelt een jaar
      waarin hij op 1 oogstmaand opslaat, de bladzijde herlaadt en verder speelt vanaf het titelscherm. Dat
      jaar moet precies zo aflopen als hetzelfde jaar zonder opslaan (hetzelfde zaad). Voortaan klikt de
      speeltest ook zelf op "Nieuw spel".
    Klaar als het spel opent op het titelscherm, Verder het nieuwste spel laadt, het spel elke ochtend zelf
    opslaat, het menu opslaat, laadt en naar het titelscherm gaat, een geladen jaar afloopt als een jaar dat
    nooit bewaard werd, en `npm test` groen is. Vragen: **A**, elke ochtend op één plek? **B**, vijf eigen
    plekken? **C**, het titelscherm zo, met het gehucht erachter? **D**, het menu zo?
    **Beantwoord (Marcel, 28 sep): "A ja B ja C ja D ja, push it".** Alle vier zoals voorgesteld. (Claude las
    het als het antwoord op vraag 48, want alleen die had een D; vraag 47 staat nog open.)
49. **De afrekening na het eerste jaar: het plan** (Claude, 28 sep, veertiende sessie; Marcel: "Werklijst
    doorzetten"; wacht op Marcel). Punt 4 van de prioriteit. Marcel koos bij 33a drie getallen naast elkaar (wat
    je echt hebt, ook verstopt; wat de heer denkt dat je hebt; hoe het dorp erbij staat), een zin van de heer en
    een van het dorp, geen punten, en de grenzen in de werkbank. Wat er al is: het eindscherm als je je ambt
    kwijt bent (`T.ui.toonEinde`, `js/hud.js`), en per jaar welk deel je de heer gaf en welke straf erop volgde
    (`S.heer.jaren`). Wat er niet is: het spel onthoudt niet wat je aan het begin van het jaar had, wat de
    soldaten vonden (alleen als zin in een bericht), en wie er stierf en waaraan; en het rapport van de inner en
    het bezoek van de heer worden na Sint-Maarten gewist. Voorstel:
    - **A, wanneer: op 1 lentemaand, na de winter,** bij zonsopgang: dan gaan de soldaten weg en begint het
      nieuwe jaar van de velden. Zo telt de winter mee, en daar valt de rekening van het verstoppen: in de
      speeltest van 28 sep stierven bij de luie spelers 4 en 9 mensen van de honger, naast volle kelders. De
      tijd staat stil tot je kiest: **Verder spelen** of **Naar het titelscherm**. Elk jaar komt dezelfde
      afrekening, over dat jaar; voor een tester is de eerste het eind van de proef. Het andere moment, meteen
      als de heer vertrekt, maakt de proef bijna een derde korter, maar dan zie je niet wat verstoppen kostte.
      (Wil je allebei, dan wordt het een keuze in de spelregels.)
    - **B, de drie getallen als twee boeken en het dorp.** In `spel.md` staat al "het rekenboek: het echte en
      dat voor de heer" (punt 6); de eerste twee getallen zíjn die twee boeken, hier voor het eerst te zien. Een
      voorbeeld, ongeveer de slimme speler van de speeltest:

      ```
                              Je eerste jaar als schout
                                  1 lentemaand 1324

      Je eigen boek             Het boek van de heer            Het dorp
      240 graan, 5 goud         190 graan, 13 goud              37 mensen, 67% tevreden
      niets in de kelders;      zo telde zijn inner in          bij je komst 26;
      bij je komst 60 graan     oogstmaand, met 0 van je 12     niemand gestorven
      en 20 goud                gebouwen (er was 620 graan
                                en 18 goud). De heer vroeg
                                28 graan en 2 goud; had hij
                                alles gezien: 100 en 26.

      Sint-Maarten: je gaf 83% van wat hij vroeg, een boete van 3 goud. De soldaten
      zochten op twee plekken, en vonden niets.

      De heer: "Wat een armoedig gat, schout. Wij zouden u bijna iets geven. Bijna."
      Het dorp: "In de herberg drinken ze op de schout. Zachtjes, want de heer heeft oren."

                        [ Verder spelen ]    [ Naar het titelscherm ]
      ```

      Je eigen boek is wat je nu hebt, in de schuur, de kist en de kelders (rijk worden). Het boek van de heer
      is wat zijn inner telde, want daar maakte de heer zijn rekening op (arm lijken). Het dorp: mensen en
      tevredenheid, en wie er stierf of wegtrok, en waaraan. De regel over Sint-Maarten is wat je gaf, wat je
      achterhield en wat daarvan gevonden werd (punt 4).
    - **C, hoe arm je leek: wat de heer vroeg, naast wat hij gevraagd had als hij alles zag.** In goud, zoals
      hij rekent: alle gebouwen en akkers, en ook wat in de kelders lag toen de inner telde. Dat is precies wat
      arm lijken oplevert, met de gebouwen en het hoofdgeld erbij. Zo rekent de heer al als hij alles zelf ziet
      (de regel 'alles' in `js/heer.js`), maar dan met de kelders erbij. Naar schatting uit de speeltest van 28
      sep: braaf 0,93, lui (30% weg) 0,84, lui (60% weg) 0,74, slim 0,19. Daarop kiest de heer zijn zin: onder
      0,5 arm, vanaf 0,85 rijk, daartussen gewoon. Wat opvalt: 250 graan in de kelders maakt je nauwelijks armer
      (van 0,93 naar 0,74), de inner ontlopen doet alles. Dat zag de speeltest al (vraag 46, A en B); de
      afrekening laat het elke speler zien, en is straks het meetlint als het bijstellen komt.
    - **D, de zinnen: drie van de heer, drie van het dorp, en een bijzondere.**
      - De heer. Arm: "Wat een armoedig gat, schout. Wij zouden u bijna iets geven. Bijna." Gewoon: "Een gewoon
        jaar, schout. Niets te straffen en niets te vieren. Wij weten niet wat Wij erger vinden." Rijk: "Wat een
        rijk gehucht, schout! Het doet Ons deugd. Wij komen volgend jaar graag weer."
      - Het dorp. Goed (60% tevreden of meer, en niemand stierf van kou of honger): "In de herberg drinken ze op
        de schout. Zachtjes, want de heer heeft oren." Gewoon: "Het dorp mort, zoals een dorp mort. Dat is een
        goed teken, zegt de oudste." Slecht (onder 40%, of meer dan een twintigste van het dorp gestorven): "In
        de herberg wordt het stil als de schout binnenkomt."
      - Bijzonder, als er iemand van de honger stierf terwijl er graan in je kelders lag: "Vier stierven van de
        honger, en in je kelders lag 240 graan. Het dorp weet het." Dat is de duurste fout uit de speeltest, en
        zo leert een nieuwe speler hem aan het eind van zijn eerste jaar.
      In de speeltest zou braaf "gewoon" krijgen (52% tevreden), slim "goed" (67%), en lui de bijzondere. De
      grenzen staan in de werkbank, de zinnen in hetzelfde blok in het bestand: de werkbank kent alleen
      getallen. Zinnen herschrijven in het spel zelf kan later, bij het menu met opties (vraag 46).
    - **Hoe het werkt** (geen vraag, wel goed om te weten): een jaarboek in de spelstaat (`S.jaarboek`), dus
      vanzelf bewaard. Het schrijft op wat je had bij het begin van het jaar; bij de inner wat hij telde en wat
      er echt was; op Sint-Maarten wat de heer vroeg, wat je gaf en wat er verstopt lag; wat de soldaten vonden,
      nu als getal; en wie er stierf of wegtrok, en waaraan. De regels staan in een nieuw bestand,
      `js/afrekening.js`, zonder scherm en dus getoetst, met bovenaan één blok (`T.AFREKENING_INSTELLINGEN`: de
      grenzen en de zinnen), dat in de werkbank komt als "De afrekening". Het scherm komt bij het titelscherm,
      in `js/menu.js`, en het einde van "je ambt kwijt" wordt hetzelfde scherm, met het ontslag als zin van de
      heer en alleen Naar het titelscherm: één scherm voor twee eindes, en `js/hud.js` wordt kleiner. Een spel
      dat vóór deze stap bewaard werd, krijgt een afrekening met wat er dan bekend is. De speeltest klikt Verder
      spelen, en schrijft per speler de afrekening in `samenvatting.md`.
    Klaar als op 1 lentemaand de afrekening van het jaar opent, met de twee boeken, het dorp, Sint-Maarten en de
    twee zinnen; Verder spelen en Naar het titelscherm werken; wie zijn ambt kwijtraakt, hetzelfde scherm ziet;
    de grenzen in de werkbank staan; een jaar dat halverwege opslaat en herlaadt dezelfde afrekening geeft; `npm
    test` groen is; en de speeltest bij alle vier de spelers de afrekening opschrijft. Vragen: **A**, op 1
    lentemaand na de winter, elk jaar, met Verder spelen? **B**, de drie getallen zo, als twee boeken en het
    dorp? **C**, hoe arm je leek zo meten? **D**, deze zinnen, met de bijzondere?
    **Geparkeerd (Marcel, 28 sep): "Laten we afrekening even parkeren maar later kan dat? Ik denk dat het een
    minder interessant spel element is dan ik aanvankelijk dacht."** Niets gebouwd. Het plan blijft hier staan
    voor later; een jaaroverzicht kan ook bij een spel over groeien passen (hoeveel mensen erbij, wat er gebouwd
    werd), maar dat is voor als de richting er staat (vraag 50).
50. **Een nieuwe richting: besturen, groeien, en vechten met omliggende steden** (Marcel, 28 sep, veertiende
    sessie: "Mogelijk wil ik meer de richting op van management van het dorp en het groeien. Ook het vechten met
    omliggende steden etc"; de vragen zijn van Claude; wacht op Marcel). Het staat ook in `spel.md`, "Een nieuwe
    richting?". Het is minder een draai dan het lijkt: op 23 sep beschreef Marcel het spel als "Management sim
    met groeiende aantallen van mensen", en "rijk worden en arm lijken" was het voorstel van Claude voor de
    kern, "nog te toetsen" (`CLAUDE.md`). Dat is nu getoetst, en groeien wint. Nieuw is vechten met de buren:
    tot nu toe vocht je alleen in de opstand, tegen de heer. Vragen:
    - **A, het hart:** groeien en besturen worden het hart. De heer met zijn inner en het verstoppen blijven als
      de druk van boven, maar niet meer als de puzzel waar alles om draait. Er gaat niets weg: het werkt en het
      is getoetst. Voorstel: zo, want de heer is ook wat ons spel eigen maakt. Manor Lords (2024) doet groeien
      en vechten met een rivaal al, en was een groot succes op Steam; een schout onder een verwarde heer heeft
      het niet. Of moet de heer verder naar achteren, bijvoorbeeld als keuze in de spelregels?
    - **B, wat is besturen?** Nu heeft de schout weinig knoppen: bouwen, de velden, slachten, de heer betalen en
      verstoppen. Wat ontbreekt, zijn knoppen met een prijs, en die stonden al gepland als keuren (punt 9;
      Marcel, 23 sep: "policies implementeren"): het rantsoen, de werkuren, een belasting voor de dorpskas, een
      avondklok, bier in de herberg. Groeien is daarnaast vooral bouwen en plannen: bouwgrond aanwijzen (het
      dorp bouwt dan zelf), ontginnen (6b), straten (6c), en de treden van gehucht naar dorp (14). Wat bedoel je
      vooral: meer knoppen, meer bouwen en plannen, of allebei?
    - **C, vechten: hoe groot?**
      1. *Aanvallen op je eigen dorp,* in beurten op je eigen kaart, met je eigen militie: rovers, een buurdorp,
         soldaten. Het gevecht in beurten is er al; het moet groeien van één schout naar een groepje.
      2. *De streek als kaarten naast elkaar:* over de weg loop je naar het buurdorp, en daar vecht je, ook in
         beurten. Zo werkt Jagged Alliance 2, al het voorbeeld voor ons gevecht: steden in sectoren, een militie
         die je traint, en een tegenstander die terugslaat. Kaarten met aansluitingen ertussen kan het spel al
         (het wereldgereedschap).
      3. *Een kaart van de streek van bovenaf, met legers,* zoals Lords of the Realm 2. Dat is een nieuwe laag,
         en daar ben je een hand van bovenaf, geen poppetje in het dorp (besloten op 23 sep).
      Voorstel: eerst 1, dan 2. Nummer 3 past slecht bij de schout als poppetje.
    - **D, wie zijn de buren, en wanneer vecht je?** Onder de heer: zijn oorlog (de heervaart: hij vraagt
      mannen, midden in de oogst; `spel.md`, "Lords of the Realm 2 als voorbeeld", idee 1), rovers, en andere
      dorpen van dezelfde heer als rivalen. Na de vrijheid: andere steden, met jouw stad als vrije stad tussen
      de anderen. (In Holland begonnen in 1350, zevenentwintig jaar na het begin van ons spel, de Hoekse en
      Kabeljauwse twisten, waarin steden en edelen partij kozen: stof genoeg.) Voorstel: eerst onder de heer
      (rovers en de heervaart, dan een rivaal), en vechten tussen steden na de vrijheid.
    Wat eruit volgt (geen vraag): als A tot en met D staan, maakt Claude een nieuwe volgorde voor de werklijst,
    en een nieuw eerste speelbaar product. Nu is dat een jaar met de heer; het wordt eerder iets als "een
    gehucht dat in een paar jaar een dorp wordt". Vraag 47 (de eerste weken als opdrachten) blijft tot dan
    liggen, want die gaat over de kelder en de inner.
    **Beantwoord (Marcel, 28 sep): "A ja B allebei C ja D ja".** A: groeien en besturen worden het hart; de
    heer, de inner en het verstoppen blijven als de druk van boven, en er gaat niets weg. B: allebei, meer
    knoppen (keuren) én meer bouwen en plannen. C: eerst aanvallen op je eigen dorp, in beurten op je eigen
    kaart, met je militie; daarna de streek als kaarten naast elkaar; geen kaart van bovenaf met legers. D:
    eerst onder de heer (rovers en de heervaart, dan een rivaal), en vechten tussen steden na de vrijheid.
    Opgeschreven in `spel.md` ("Een nieuwe richting") en `CLAUDE.md` ("Het spel in het kort"). De nieuwe
    volgorde en het eerste speelbare product: vraag 51.
51. **De nieuwe volgorde, en het eerste speelbare product: het plan** (Claude, 28 sep, veertiende sessie; na
    Marcels antwoord op vraag 50; wacht op Marcel). De prioriteit bovenaan was gebouwd op een proef van één jaar
    met de heer, en die vervalt. Wat er al is en past: 45 soorten gebouwen, bewoners met werk en een dagritme,
    de heer die elk jaar komt, een gevecht in beurten (nog voor één schout tegen monsters), en de trede in de
    spelstaat (`S.trede`), die nu altijd 'gehucht' is. Het bouwmenu kent de treden al: met het dorp komen onder
    meer de timmerman, de molen, de wapenmaker, het schuttershof en de palissade. Voorstel:
    - **A, het eerste speelbare product: van gehucht tot dorp.** Je begint zoals nu, met de benoemingsbrief en
      26 mensen, en het doel is dat het gehucht een dorp wordt, in zo'n twee jaar. Onderweg groei je
      (bouwgrond), bestuur je (de eerste keuren), komt de heer elk jaar (dat is er al), en verdedig je het
      gehucht tegen rovers. De proef eindigt op het moment dat het een dorp is, met een brief van de heer: "Wij
      vernemen dat Ons gehucht een dorp is geworden. Gefeliciteerd. Dat kost u vanaf nu meer." Zo heeft wie
      speelt een doel om naartoe te werken, waar de afrekening alleen terugkeek. De heer hoeft er niet voor te
      veranderen: hij vraagt per huis en per ziel, dus wie groeit, betaalt meer. Dat is precies de druk van
      boven uit vraag 50 (A).
    - **B, de volgorde,** elk stuk met eerst een eigen plan:
      1. *Het dorp bouwt zelf* (`spel.md`, "Het dorp bouwt zelf"; gekozen op 26 sep): jij wijst bouwgrond aan,
         en een nieuw gezin zet er zelf een hut op, met hout uit de voorraad. Groeien wordt plannen, in plaats
         van elk huis zelf neerzetten.
      2. *De eerste trede* (punt 14): wanneer het gehucht een dorp is, wat dat vrijzet, en de brief van de heer.
         Daarmee heeft de proef een doel en een eind.
      3. *De eerste keuren* (punt 9, nog zonder groepen en schepenen): drie knoppen met een prijs, in één
         venster, en elke keur zegt vooraf wat hij doet (`spel.md`, "Lords of the Realm 2 als voorbeeld", idee
         5).
      4. *Rovers en een militie* (punt 13): rovers vallen het gehucht aan, en je verdedigt het in beurten op je
         eigen kaart, met naast de schout een paar mannen uit het wachthuis (dat staat al in het bouwmenu). Het
         gevecht groeit daarvoor van één schout naar een groepje; de kant 'speler' voor een man van de militie
         is er sinds 26 sep. En wie wegtrekt, wordt rover (idee 2): wie slecht bestuurt, maakt zijn eigen
         vijanden.
      5. *De proef afmaken:* de eerste weken als opdrachten (vraag 47, herschreven voor de nieuwe richting), een
         speeltest van twee jaar, en een tester die het niet kent (33d).
      Na de proef: de heervaart, ontginnen (6b) en straten (6c), groepen en schepenen, marktrecht, de streek als
      kaarten naast elkaar (vraag 50, C), en de afrekening als jaaroverzicht (vraag 49). Heeft de kaart van nu
      (76 bij 76 tegels) te weinig plaats voor een dorp, dan komt ontginnen naar voren; dat zoekt het plan voor
      stap 1 uit.
    - **C, wanneer is het een dorp?** Voorstel: 50 mensen, een kapel en een smidse (allebei al te bouwen in het
      gehucht), met de getallen in de werkbank, zodat spelen het beslist. Vroeger was het verschil vaak de kerk:
      een gehucht had er geen, een dorp wel. Een kapel die een kerk wordt, kan later. In de speeltest van 28 sep
      groeide het gehucht in een jaar van 26 naar 37 mensen; met bouwgrond en de keur voor vreemden gaat het
      sneller.
    - **D, de eerste drie keuren.** Voorstel: *vreemden* (nieuwkomers toelaten: meer handen en meer monden; de
      knop voor groei), *rantsoen* (meer eten maakt tevredener, minder laat meer over voor de heer of de
      kelder), en *houtkap* in het bos van de heer (hout om te stoken en te bouwen, maar de inner telt de
      stronken). Andere uit de lijst van 23 sep (`spel.md`, "Keuren en politiek"): een avondklok, de
      herendienst, marktgeld, bier belasten, of armenzorg.
    Staan A tot en met D, dan komt de nieuwe volgorde bovenaan de werklijst, en begint stap 1 met een eigen
    plan. Vragen: **A**, van gehucht tot dorp als eerste speelbare product? **B**, deze volgorde, of het vechten
    eerder? **C**, 50 mensen, een kapel en een smidse? **D**, deze drie keuren?
    **Beantwoord (Marcel, 28 sep): "A ja B ja C ja D ja".** Alle vier zoals voorgesteld. De nieuwe volgorde staat
    bovenaan, onder "Al het werk, op prioriteit", en de proef in `speelbaar.md`, bovenaan.
52. **Het dorp bouwt zelf: het plan** (Claude, 28 sep, veertiende sessie; stap 1 van de proef "van gehucht tot
    dorp", vraag 51; wacht op Marcel). Het ontwerp is gekozen op 26 sep (`spel.md`, "Het dorp bouwt zelf"): jij
    wijst bouwgrond aan, een nieuw gezin kiest er een erf, zet er zelf een hut op met hout uit de voorraad, en
    een erf is meteen zo groot als het huis ooit wordt. Wat er nu is (nagekeken door een agent):
    - Jij zet elk gebouw neer met het bouwmenu (`B`), ook de hut (8 hout, 2 dagen, plaats voor 3) en het huis
      (16 hout en 4 goud, 4 dagen, plaats voor 5). Het rijst vanzelf in vijf fases op, zonder dat iemand erheen
      loopt.
    - Om de 20 dagen komt er een gezin van hooguit vier, als er een huis met plaats is, 20 graan en 55%
      tevreden. Het gehucht begint met plaats voor 37 en 26 mensen, dus na drie gezinnen is het vol. Is er geen
      plaats, dan gebeurt er niets, en niets zegt het je.
    - Een hut groeit na 30 tevreden dagen vanzelf door tot een huis, op dezelfde plek, maar in een willekeurige
      tekening die groter kan zijn (tot 10 bij 7 of 8 bij 9 tegels), zonder dat er plaats voor gereserveerd is.
    - Een gebouw mag nu niet op het plein en niet op iets vasts (water, bomen, een ander gebouw), maar wél op
      een akker, een weide of een pad.
    - De kaart heeft plaats: buiten de donkere rand en de heide passen zo'n acht erven van 10 bij 10 tegels. Om
      van 37 naar 50 plaatsen te komen, zijn er vier à vijf nodig (een hut is 3, een huis 5). Ontginnen hoeft
      dus niet naar voren. Dicht bij het plein is het krap: de eerste erven liggen op 9 tot 15 tegels ervan.
    Voorstel:
    - **A, erven aanwijzen, één voor één.** In het bouwmenu komt "Erf": je zet het neer zoals een gebouw, een
      vak van 10 bij 10 tegels, groot genoeg voor elk huis dat er ooit komt, met zijn deur en een moestuin. Het
      andere is een rechthoek bouwgrond trekken die het spel zelf in erven deelt, zoals in Manor Lords. Dat is
      sneller bij honderd erven, maar op deze kaart, waar de vrije plekken grillig liggen en een erf 10 bij 10
      is, verspilt een rechthoek veel ruimte, en het kost een nieuwe manier van aanwijzen. Voorstel: één voor
      één nu, met het bouwmenu dat er al is; de rechthoek komt als de stad groeit, samen met ontginnen (6b), dat
      ook velden moet kunnen trekken.
    - **B, het gezin bouwt zelf.** Het komt over de weg binnen, loopt naar het vrije erf dat het dichtst bij
      zijn werk ligt (zonder werk: bij het plein), en werkt op de bouwplaats terwijl zijn hut in twee dagen
      oprijst; het slaapt in de halve hut. Het hout gaat eraf als het begint. Ligt er te weinig, dan wacht de
      bouwplaats, met een bericht ("Het gezin van Albert wacht op hout voor zijn hut"). Een huis met plaats gaat
      nog altijd voor: een erf is voor als het dorp vol is. Het andere: de hut staat er eerst, en het gezin komt
      pas als hij klaar is. Eenvoudiger, maar je ziet niemand bouwen.
    - **C, de hut en het huis gaan uit het bouwmenu,** want jij zet geen huizen meer neer; werkplaatsen en wat
      van het hele dorp is (de put, de kapel, de smidse) zet je neer zoals nu. Als keuze in de spelregels, zoals
      altijd: "Huizen: het dorp bouwt zelf" (de standaard) of "jij zet ze neer" (zoals tot nu).
    - **D, een vrij erf zie je aan paaltjes** op zijn hoeken, in de wereld, zodat je ook zonder bouwmenu ziet
      dat er plaats is; met het bouwmenu open staat de rand van elk erf op de grond. Het andere: alleen de rand,
      en alleen als het bouwmenu open is.
    - **Ook in deze stap** (geen vraag): niemand bouwt nog op een akker, een weide of een pad (één regel,
      `T.waaromPastHetNiet`, voor alles wat je neerzet); een gezin dat wil komen maar geen plaats vindt, zegt
      het ("Er wil een gezin komen, maar er is geen plaats. Wijs een erf aan."); een hut groeit door tot een
      huis binnen zijn eigen erf, en zijn deur gaat mee (nu blijft die misschien achter; dat zoek ik na).
    - **Wat het doet** (inzicht): hout wordt een keuze. Een hut kost 8 hout, de winter zo'n 95, en het gehucht
      begint met 40: de houthakker wordt belangrijker. En met plaats genoeg kan er elke 20 dagen een gezin
      komen, dus de 50 mensen van de trede kunnen al in het eerste jaar. Wat dan remt, is de tevredenheid (55%),
      het graan en het hout; de speeltest van stap 5 laat zien of "zo'n twee jaar" klopt, en anders stellen we
      de trede bij.
    Klaar als je in het bouwmenu een erf kunt neerzetten (niet op het plein, een veld of een pad), een vrij erf
    paaltjes heeft, een gezin komt als er een huis met plaats of een vrij erf is en anders zegt dat er geen
    plaats is, het naar zijn erf loopt en er zijn hut bouwt met hout uit de voorraad (of erop wacht), de hut
    doorgroeit binnen zijn erf, de hut en het huis niet meer in het bouwmenu staan (tenzij de spelregel het
    anders zegt), opslaan en laden de erven houdt, `npm test` groen is, en een schermafdruk voor Marcel een
    gezin op zijn erf laat zien. Vragen: **A**, erven één voor één? **B**, het gezin bouwt zelf, en wacht op
    hout? **C**, hut en huis uit het bouwmenu, met een spelregel? **D**, paaltjes?
    **Beantwoord (Marcel, 28 sep): "A ja B ja C ja D ja".** Alle vier zoals voorgesteld; het wordt gebouwd.
53. **De eerste trede, van gehucht tot dorp: het plan** (Claude, 28 sep, veertiende sessie; stap 2 van de proef,
    vraag 51; Marcel: "begin met stap 2"; wacht op Marcel). Marcel koos bij vraag 51 wanneer het gehucht een
    dorp is: 50 mensen, een kapel en een smidse, met de getallen in de werkbank; en dat de proef dan eindigt met
    een brief van de heer. Wat er nu is:
    - De trede staat in de spelstaat (`S.trede`), maar is altijd "gehucht": niets zet hem hoger.
    - Het bouwmenu toont alleen de gebouwen van precies deze trede. Wordt het een dorp, dan zouden de put, de
      kapel en het erf verdwijnen. Met het dorp komen er twaalf bij, onder meer de timmerman, de molen, de
      bakkerij, de wapenmaker en het schuttershof; de meeste lenen nog een tekening.
    - Het gehucht begint zonder kapel en zonder smidse. Samen kosten ze 24 hout en 18 goud (van de 40 hout en 20
      goud waarmee je begint), en de smidse kost je op Sint-Maarten elk jaar 4 goud.
    - Nergens staat het doel. Linksboven is een vak voor "de opdracht van dit moment" (`T.ui.opdracht`), maar
      dat vult alleen een quest, en er zijn er nog geen.
    Voorstel:
    - **A, het doel staat in beeld, en de heer zegt het.** Vanaf het begin staat linksboven "Naar een dorp", met
      hoe ver je bent: "43 van 50 mensen · een kapel · nog geen smidse". De benoemingsbrief krijgt er een regel
      bij: "Wij verwachten dat Ons gehucht een dorp wordt, met een kapel, een smidse en vijftig zielen. Een dorp
      brengt Ons meer op." Zo komt het doel uit de wereld zelf, zoals de heer is: hij wil groei omdat hij eraan
      verdient. Komen later de opdrachten voor de eerste weken (vraag 47), dan gaan die in het vak voor.
    - **B, het moment: een brief met twee knoppen.** Elke dag kijkt het spel of er 50 mensen zijn en een kapel
      en een smidse klaar staan. Is dat zo, dan is het gehucht een dorp (en dat blijft het, ook als er mensen
      wegtrekken). De tijd staat stil, en de heer schrijft: "Wij vernemen dat Ons gehucht een dorp is geworden.
      Gefeliciteerd. Dat kost u vanaf nu meer." Onder de brief staan "Verder als dorp" en "Naar het
      titelscherm": voor een tester is dit het eind van de proef, en wie wil, speelt door. Geen apart
      eindscherm, want de brief is het moment.
    - **C, wat het dorp vrijzet:** het bouwmenu toont voortaan de gebouwen van deze trede én die ervoor, dus in
      het dorp staan de gebouwen van het gehucht er nog in, met die van het dorp erbij. Verder niets: de
      schepenen, de voerman met stenen en de tapperij horen bij punt 14, na de proef.
    - **D, "Dat kost u vanaf nu meer": alleen woorden, of echt?** De heer vraagt al per huis, per ziel en per
      gebouw (de smidse 4 goud), dus een dorp betaalt vanzelf meer. Het kan ook echt: in een dorp een hoger
      hoofdgeld per mens. Voorstel: alleen woorden, en in de werkbank een getal voor het hoofdgeld in een dorp
      dat op 1 staat, zodat het later hoger kan als spelen dat vraagt.
    - **Wat het doet** (inzicht): de kapel en de smidse vragen 18 van de 20 goud, en de heer wil op Sint-Maarten
      zo'n 25. Wie ze meteen bouwt, moet graan verkopen aan de marskramer, of de heer tekortdoen. En de kapel
      maakt het dorp tevredener (een kerk telt voor een vijfde mee), en tevredenheid laat het groeien: de kapel
      is dus een goede eerste zet. Zo zit er in het doel al een keuze, zonder dat er iets nieuws bij hoeft.
    - **Hoe het werkt** (geen vraag): een klein nieuw bestand, `js/treden.js`, zonder scherm en dus getoetst,
      met bovenaan één blok (`T.TREDEN_INSTELLINGEN`: 50 mensen, de kapel en de smidse, het hoofdgeld in een
      dorp), dat in de werkbank komt. `T.tredeDoel` geeft de tekst voor het vak, en een dagelijkse tik zet de
      trede. De brief komt in hetzelfde venster als de andere brieven van de heer. Op een proefkaart (`?kaart=`)
      gebeurt het niet. Opslaan houdt de trede vanzelf (`S.trede`).
    Klaar als het doel vanaf het begin linksboven staat met de voortgang, de benoemingsbrief het noemt, het
    gehucht bij 50 mensen met een klare kapel en smidse een dorp wordt, de brief van de heer dan komt met zijn
    twee knoppen, het bouwmenu de gebouwen van het dorp erbij toont (en die van het gehucht houdt), de getallen
    in de werkbank staan, `npm test` groen is, en een schermafdruk de brief laat zien. Vragen: **A**, het doel
    linksboven en in de benoemingsbrief? **B**, de brief met twee knoppen als eind van de proef? **C**, alleen
    het bouwmenu erbij? **D**, alleen woorden, met het getal op 1?
    **Beantwoord (Marcel, 29 sep): "A ja B ja C ja D ja".** Alle vier zoals voorgesteld; het wordt gebouwd.
54. **De eerste keuren: het plan** (Claude, 29 sep, vijftiende sessie; stap 3 van de proef "van gehucht tot dorp",
    vraag 51; Marcel: "Werklijst doorzetten"; wacht op Marcel). Marcel koos bij vraag 51 drie keuren: vreemden,
    rantsoen en houtkap, in één venster, en elke keur zegt vooraf wat hij doet (`spel.md`, "Lords of the Realm 2 als
    voorbeeld", idee 5). Wat er nu is (nagekeken door twee agents):
    - Van keuren is er nog niets: geen knop, geen venster, niets in de spelstaat.
    - **Groei komt alleen van vreemden.** Er wordt niemand geboren en niemand wordt ouder. Om de 20 dagen komt er een
      gezin, als er 20 graan ligt, het dorp 55% tevreden is en er plaats is (een huis, of een vrij erf waarop het
      een hut zet voor 8 hout). Die regel staat nergens in beeld: wie niemand ziet komen, weet niet waarom.
    - **Tevredenheid** wordt elke dag opnieuw uitgerekend: voor de helft het eten, voor drie tiende het brandhout,
      voor een vijfde de kerk, met de herberg erbij en de straffen van de heer eraf. Meer eten maakt niet
      tevredener, alleen afwisseling (groente, vis, vlees). Een gehucht met alleen graan en zonder kapel komt zo op
      zo'n 67% (de herberg geeft er soms een paar bij), met een kapel op 75%. Vanaf 55% komen er gezinnen, onder 25%
      trekken ze weg, vanaf 70% groeit een hut door tot een huis, en hoe tevredener, hoe harder er gewerkt wordt.
    - **Eten:** ieder eet 0,05 graan per dag (26 mensen: 1,3), en dat getal wordt op acht plekken gelezen. Van
      bloeimaand tot de oogst ligt er geen graan: de voorjaarshonger uit beide speeltesten.
    - **Hout is niet schaars.** Het komt alleen van de houthakker: 2 per dag, het hele jaar, zonder bos (ruim 600
      per jaar), en het dorp stookt er 95 (26 mensen) tot 176 (50 mensen) per winter. Er valt geen boom om. In de
      speeltest van 28 sep lag er aan het eind 135 tot 228 hout over. Een keur die alleen méér hout geeft, kiest
      dus niemand.
    - **Het bos van de heer** staat nog nergens, maar de bosrand is er: 226 bomen in de zeven noordelijke rijen. Een
      stronk bestaat al als tekening (bij de begroeiing), maar staat nergens op de kaart.
    - **De inner** ziet geen eten en geen bomen: hij telt gebouwen, woonruimte, akkertegels, graan en goud, en loopt
      alleen langs gebouwen en velden. De heer vraagt 0,2 goud hoofdgeld per plaats om te wonen, en 20 hout per
      houthakker.
    Voorstel:
    - **A, één venster onder `K`,** met een knop in de balk: "Keuren". De drie keuren staan onder elkaar, elk met
      twee of drie keuzes, en bij elke keuze staat in getallen van nu wat hij doet (zie B tot en met D). De tijd
      staat stil zolang het open is. Een keuze geldt vanaf de volgende ochtend: dan wordt hij op het plein
      afgekondigd, en een bericht zegt het ("Op het plein afgekondigd: vanaf vandaag is het rantsoen karig.");
      bedenk je je vóór de ochtend, dan kost dat niets. De heer noemt de keuren in de benoemingsbrief: "U mag keuren
      uitvaardigen over wat Ons gehucht eet, wie er komt wonen en het sprokkelhout. Over Ons bos gaat u niet." Het
      andere: keuren worden eens per maand afgekondigd, op de eerste. Dat geeft een ritme, maar een keur die je nu
      nodig hebt, laat dan tot een maand op zich wachten (op 10× een kwartier).
    - **B, het rantsoen: karig, gewoon (zoals nu) of ruim.** Karig is driekwart: 1,0 graan per dag voor 26 mensen in
      plaats van 1,3, en het dorp is 15 punten minder tevreden. Ruim is anderhalf: 2,0 per dag, en 10 punten
      tevredener. Het venster zegt het in getallen van nu, bijvoorbeeld: "Karig: 1,0 graan per dag; het graan haalt
      12 bloeimaand in plaats van 20 grasmaand; tevreden 67% → 52%: dan komen er geen gezinnen meer, en er wordt
      minder hard gewerkt." Wat het doet: karig in het voorjaar, tegen de voorjaarshonger, en ruim na de oogst, als
      er genoeg ligt (boven de 70% groeien de hutten door). Zo stel je een keur per seizoen bij, zoals in Lords of the
      Realm 2, maar met drie knoppen in plaats van een schuif per graafschap. En een kapel maakt karig betaalbaar:
      van 75% naar 60%, en dan komen er nog gezinnen. De inner ziet het rantsoen nog niet; dat een doorvoed dorp dat
      arm doet hem argwanend maakt (idee 4 uit Lords of the Realm 2), is voor na de proef.
    - **C, vreemden: niemand, tegen inkoopgeld, of iedereen (zoals nu).** Iedereen: om de 20 dagen een gezin, en het
      venster zegt waar het op wacht ("als er plaats is: 2 vrije erven; 20 graan: er ligt 60; 55% tevreden: het dorp
      is 67%"). Tegen inkoopgeld: een gezin betaalt 2 goud voor zijn plaats, maar niet iedereen kan dat, dus er
      komen er ongeveer half zoveel; het goud gaat in de kist, waar de inner het telt. Niemand: het gehucht blijft
      zo groot als het is, een rem voor een krappe winter, en er eten geen nieuwe monden mee. Wat het doet:
      inkoopgeld is een tweede bron van goud naast de marskramer (de heer vraagt 25 goud, het gehucht begint met
      20). En het venster legt eindelijk uit waarom er niemand komt, wat een tester nu nergens ziet.
    - **D, houtkap in het bos van de heer: verboden (alleen sprokkelen) of kappen.** Omdat hout nu niet schaars is:
      zonder de keur raapt de houthakker alleen dood hout, 1 per dag, half zoveel als nu (dood hout rapen mocht
      vroeger, kappen niet). Met kappen hakt hij 2 per dag, zoals nu, en per 20 hout valt er een boom aan de
      zuidkant van de bosrand, zo'n 30 per jaar: de boom wordt een stronk, en het bos wijkt zichtbaar terug. De inner
      loopt voortaan ook langs de bosrand en telt de stronken die hij ziet; de heer rekent op Sint-Maarten een goud
      per vijf stronken ("voor 15 bomen uit Ons bos: 3 goud"), en elke stronk maakt de inner iets argwanender. Wat
      het doet: hout wordt een keuze tussen een tweede houthakker (10 hout, 4 goud en een hand, en de heer wil er 20
      hout per jaar van) en het bos van de heer (meteen, zonder goud, maar zichtbaar en later te betalen). Vroeg in
      het spel is goud schaars (de kapel en de smidse vragen er 18 van de 20), dus dan is kappen verleidelijk. Een
      dorp van 50 mensen met zijn hutten, zijn kapel en zijn smidse vraagt zo'n 250 tot 280 hout per jaar, en één
      sprokkelaar raapt er zo'n 290: krap, niet onmogelijk. In stap 4 komt er een palissade tegen de rovers bij (40
      hout), en na de proef is wat gekapt is grond om te ontginnen (6b). Het andere: de houthakker hakt zoals nu, en
      kappen verdubbelt het. Dan verandert het evenwicht niet, maar kiest ook niemand het, tot er later meer hout
      nodig is.
    - **Wat het doet, alles samen** (inzicht): de drie keuren zijn precies de drie kranen van de groei: of het dorp
      tevreden genoeg is (het rantsoen), wie er komt (vreemden), en hout voor de hutten (houtkap). En elk trekt aan
      een andere kant van de heer: het rantsoen aan wat er op Sint-Maarten overblijft, vreemden aan zijn hoofdgeld
      en de kist, en houtkap aan zijn bos.
    - **Hoe het werkt** (geen vraag): een nieuw bestand, `js/keuren.js`, zonder scherm en dus getoetst: de drie
      keuren als gegevens op één plek (`T.KEUREN`, zoals `T.GEBOUWEN`), de getallen in één blok
      (`T.KEUREN_INSTELLINGEN`, in de werkbank), en wat je koos in de spelstaat (`S.keuren`, dus vanzelf bewaard).
      Wat een keuze vooraf zegt, komt uit één functie, die het venster en de toetsen allebei vragen. Wat een mens
      eet, vraagt het spel voortaan aan één functie in plaats van op acht plekken aan het getal; de tevredenheid
      krijgt één term erbij (met de reden bij de muis: "karig rantsoen"); de groei vraagt de keur of er een gezin mag
      komen; de houthakker krijgt een factor. Het bos van de heer wordt de bosrand in het noorden, en de stronk komt
      uit de begroeiing die er al is. Het venster krijgt een eigen bestand, want `hud.js` is al 1.533 regels (vraag
      25, C). De speeltest kent het nieuwe venster, en speelt verder met de keuren zoals ze beginnen.
    Klaar als het venster onder `K` en de knop opengaat met de drie keuren, elke keuze vooraf in getallen van nu
    zegt wat hij doet, een keuze de volgende ochtend geldt met een bericht, het rantsoen het eten en de tevredenheid
    verandert, vreemden de groei (en inkoopgeld goud in de kist brengt), de houthakker zonder keur sprokkelt en met
    keur bomen kapt die stronken worden, de inner de stronken telt die hij ziet en de heer ze rekent, de
    benoemingsbrief de keuren noemt, de getallen in de werkbank staan, opslaan en laden de keuren en de stronken
    houdt, `npm test` groen is, een speeljaar van de speeltest zonder fouten loopt (en laat zien wat het halve hout
    doet), en een schermafdruk het venster laat zien. Vragen: **A**, het venster onder `K`, afgekondigd de volgende
    ochtend? **B**, karig, gewoon en ruim, met deze getallen? **C**, niemand, tegen inkoopgeld en iedereen? **D**,
    sprokkelen als standaard (half zoveel hout als nu), en kappen met stronken die de inner telt?
    **Marcels antwoord (29 sep):** "Het wordt gewoon een menu zoals in diplomacy 3, waar je weten kunt aannemen etc.
    Maak het niet te ingewikkeld, er is geen gelijkenis met de werkelijkheid. We zijn gewoon een schout die een dorp
    runt en land wil uitbreiden. Ons hogere doel is al het land veroveren of met iedereen vriendjes maken. Denk aan
    civilisation". (Bedoeld is vast Democracy 3, het spel waarin je wetten aanneemt en ziet wat ze doen.)
    Opgeschreven in `spel.md` ("Een nieuwe richting") en `CLAUDE.md` ("Het spel in het kort"). Het plan hierboven
    was dus te ingewikkeld: stronken die de inner telt, sprokkelen, afkondigen op het plein, inkoopgeld.
    **Het plan, eenvoudig** (Claude, 29 sep; wacht op Marcel):
    - **Het menu Wetten,** onder `W` en met een knop in de balk, zoals in Democracy 3. Elke wet is een kaart: zijn
      naam, één zin, wat hij doet in groen en rood ("10% tevredener", "anderhalf keer zoveel graan: 2,0 per dag in
      plaats van 1,3"), en een knop Aannemen of Afschaffen. Het rantsoen heeft drie standen. Een wet werkt meteen
      en kost niets om aan te nemen: zijn nadeel is de prijs. De tijd staat stil zolang het menu open is. Wetten
      horen bij een trede, zoals de gebouwen in het bouwmenu: het gehucht heeft er drie, en het dorp krijgt er later
      meer bij, zoals je in Civilization nieuwe keuzes krijgt als je verder komt. In het spel heten ze wetten, niet
      keuren: dat woord kent bijna niemand.
    - **De drie wetten van het gehucht,** met de getallen in de werkbank:
      - *Rantsoen* (krap, gewoon of ruim): krap is driekwart eten en 15% minder tevreden; ruim is anderhalf keer
        zoveel eten en 10% tevredener.
      - *Vreemden welkom:* er komt twee keer zo vaak een gezin (om de 10 dagen in plaats van 20), en het dorp is 5%
        minder tevreden.
      - *Houtkap in het bos van de heer:* de houthakker hakt twee keer zoveel, en de heer rekent op Sint-Maarten 5
        goud boete. Hout is nu niet schaars, dus deze wet gaat pas tellen als het dorp groeit.
    - **Idee, een vierde wet: belasting.** Elke maand wat goud per mens in de kist, en het dorp is minder tevreden.
      Goud is nu het krapst: de heer vraagt 25, en een braaf gehucht heeft er op Sint-Maarten 16.
    - **Hoe het werkt** (geen vraag): `js/wetten.js` zonder scherm, met de wetten als gegevens op één plek
      (`T.WETTEN`), de getallen in één blok (`T.WETTEN_INSTELLINGEN`, in de werkbank) en wat je aannam in de spelstaat
      (`S.wetten`, dus vanzelf bewaard). Het menu krijgt een eigen bestand, en elke wet één haakje: in het eten, de
      tevredenheid, de groei, de houthakker en de rekening van de heer.
    Klaar als het menu onder `W` opengaat met de drie wetten, elke kaart zegt wat de wet doet, aannemen en afschaffen
    het spel verandert zoals de kaart zegt, de getallen in de werkbank staan, opslaan en laden de wetten houdt,
    `npm test` groen is, een speeljaar van de speeltest zonder fouten loopt, en een schermafdruk het menu laat zien.
    Vragen: **A**, zo bouwen? **B**, belasting erbij? **C** (geen haast): is vrij worden van de heer een stap op weg
    naar het hogere doel, of is de heer zelf een van de partijen die je verovert of te vriend maakt?
    **Beantwoord (Marcel, 29 sep): "A ja B ja, C later".** Het menu en de drie wetten zoals voorgesteld, met
    belasting als vierde; het wordt gebouwd. Vraag C (de heer en het hogere doel) komt later.
55. **Rovers en een militie: het plan** (Claude, 29 sep, vijftiende sessie; stap 4 van de proef "van gehucht tot
    dorp", vraag 51; Marcel: "Graag alles naar main, en begin met stap 4"; wacht op Marcel). Marcel koos bij vraag 51:
    rovers vallen het gehucht aan, en je verdedigt het in beurten op je eigen kaart, met naast de schout een paar
    mannen uit het wachthuis; wie wegtrekt, wordt rover. En op 29 sep: "Maak het niet te ingewikkeld". Wat er nu is:
    - **Het gevecht in beurten werkt, maar voor één man.** Alles draait om de schout: lopen, slaan, de actiepunten, en
      de vijand die hem zoekt (`js/gevecht.js`). Het begint vanzelf als een vijand hem ziet (`T.zoekOntdekking`), en
      buiten ligt het raster negen tegels om de vechters. In het gehucht staat nog geen enkele vijand: de wolf en de
      oude monsters staan alleen op de proefkaart.
    - **Het wachthuis staat al in het bouwmenu:** 10 hout en 4 goud, twee handen, het maakt niets, en de heer wil er
      2 goud per jaar voor.
    - **Wie wegtrekt,** loopt de weg af, eerst een gezin dat later kwam. Dat gebeurt alleen onder 25% tevreden, en in
      de speeltesten gebeurde het nooit.
    - **Vallen** is nu het einde van het spel, en het leven van de schout komt niet terug (vraag 11).
    Voorstel:
    - **A, wanneer komen er rovers?** Wie wegtrekt, gaat het bos in en wordt rover: dezelfde mensen, met hun naam en
      hun vel ("Albert, die in grasmaand wegtrok"), dus zonder nieuwe tekeningen. Na zo'n tien dagen komen ze terug,
      tegen de avond, uit het bos in het noorden. En omdat een goed bestuurd dorp niemand kwijtraakt, komt er ook eens
      per jaar een bende van buiten (drie man, in wintermaand, als ze honger hebben): zo komt elke speler ze tegen.
      Het andere: alleen wie wegtrok, komt terug, en wie goed bestuurt, vecht nooit.
    - **B, wat willen ze?** Ze lopen naar het plein en nemen mee wat ze kunnen dragen: per rover 10 graan en 2 goud.
      Een bericht zegt het ("Rovers uit het bos! Ze gaan naar het plein."), en de tijd gaat naar 1×. Ziet een rover de
      schout, dan begint het gevecht, daar waar ze staan. Houd je ze niet tegen, dan pakken ze het en gaan ze weer
      het bos in.
    - **C, de militie is het wachthuis.** De twee mannen die er werken, komen bij een aanval naar de schout (zoals de
      inner meeloopt) en vechten naast hem. Elk heeft zijn eigen beurt en actiepunten, en jij bestuurt ze, zoals in
      Jagged Alliance 2. Zonder wachthuis vecht je alleen; een tweede wachthuis geeft twee man meer.
    - **D, vallen is niet meer het einde.** Wie valt, is gewond en doet niet meer mee; de volgende ochtend staat hij
      weer op, met al zijn leven, ook de schout (dat beantwoordt vraag 11). Valt de schout, dan is het gevecht
      verloren: de rovers pakken wat ze kwamen halen, en hij wordt thuis wakker. Een rover die valt, is verslagen en
      komt niet terug. Het spel eindigt dan alleen nog via de heer. Het andere: wie valt, is dood (een wachter die
      sneuvelt, is een mond minder).
    - **Ook in deze stap** (geen vraag): het gevecht groeit van één schout naar een groepje (wie aan de beurt is, de
      knoppen, de camera en de volgorde); een rover zoekt de man van jouw kant die het dichtst bij staat. De oude
      monsters blijven alleen op de proefkaart, voor de toetsen (vraag 10), en de knop Slaan verliest het toetsje `1`,
      dat niets doet (vraag 12). De getallen (hoeveel dagen, wat ze meenemen, leven en schade) staan in de werkbank,
      en opslaan houdt de bende.
    - **Wat het doet** (inzicht): de rovers laten de wetten bijten. Een krap rantsoen en de belasting maken het dorp
      minder tevreden, en wie daardoor wegtrekt, komt terug om te stelen: wie slecht bestuurt, maakt zijn eigen
      vijanden. En het wachthuis kost goud dat je ook voor de kapel en de smidse nodig hebt.
    Klaar als er rovers komen (wie wegtrok, en eens per jaar een bende van buiten), ze naar het plein lopen en daar
    stelen als niemand ze tegenhoudt, het gevecht begint als ze de schout zien, de mannen van het wachthuis
    meevechten en elk hun eigen beurt hebben, wie valt tot de ochtend gewond is, een verloren gevecht geen einde van
    het spel is, verslagen rovers weg zijn, de getallen in de werkbank staan, opslaan de bende houdt, `npm test`
    groen is, een speeljaar van de speeltest zonder fouten loopt, en een schermafdruk een gevecht met de militie
    laat zien. Vragen: **A**, rovers uit wie wegtrok, en eens per jaar van buiten? **B**, naar het plein, 10 graan
    en 2 goud per rover? **C**, de militie is het wachthuis? **D**, vallen is gewond tot de ochtend?
    **Beantwoord (Marcel, 29 sep): "A, Ja en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms
    velden kapot. C, Ja. D, mensen kunnen sterven".** Zo wordt het gebouwd (Claude): A, wie wegtrekt, komt als
    rover terug, en daarnaast komen er wilde rovers van buiten, op een dag die je niet ziet aankomen (zo'n twee keer
    per jaar; het getal in de werkbank). B, ze gaan niet naar het plein maar naar een akker, roven daar graan, en
    soms maken ze de akker kapot: wat erop staat, is dan weg. C, zoals voorgesteld. D, wie valt, is dood: een
    wachter die sneuvelt, is een mond minder, een rover komt niet terug, en valt de schout, dan is het spel uit,
    zoals nu. Wie een gevecht overleeft, staat de volgende ochtend weer met al zijn leven op (vraag 11).
    **Gebouwd (29 sep);** zie onder Af, en vraag 56 voor wat de gevechten lieten zien.
56. **Valt de schout, is het spel dan uit?** (Claude, 29 sep, vijftiende sessie; na stap 4, vraag 55; wacht op
    Marcel.) In de browser veertien gevechten gespeeld tegen wilde rovers, met twee wachters naast de schout. Een
    rover slaat wie van jouw kant het dichtst bij staat, en dat is eerst de schout: hem zien ze het eerst.
    - **Tegen drie rovers, als de schout voorop loopt:** alle drie slaan op hem, en hij valt in de tweede of derde
      ronde (5 van de 5 keer). Dan is het spel uit; de wachters zijn niet eens geraakt.
    - **Tegen drie rovers, als de schout achterblijft** en de wachters voorop gaan: de rovers zijn in twee of drie
      rondes verslagen (5 van de 5), en meestal sneuvelt er een wachter (4 van de 5).
    - **Tegen twee rovers** wint ook wie blind aanvalt (4 van de 4, niemand dood).
    Het gevecht is dus een echte keuze. Maar een tester die het spel niet kent (stap 5), loopt voorop, en is bij de
    eerste aanval van drie man zijn spel kwijt. Het spel bewaart wel elke ochtend, dus hij kan die dag overdoen.
    - **A.** Zo laten, en het bericht bij een aanval zegt het erbij: "Blijf achter je wachters: val jij, dan is het
      uit."
    - **B.** Een spelregel (CLAUDE.md, "Instelbaar"): valt de schout, dan is het spel uit, zoals nu, of hij is
      gewond. Dan is het gevecht verloren, nemen de rovers mee wat ze kwamen halen, en wordt hij de volgende ochtend
      thuis wakker. De standaard kies jij.
    - **C.** De eerste wilde rovers komen met twee man, daarna met twee tot vier (een getal in de werkbank).
    Voorstel: A en C, voor de proef; ze kosten een zin en een getal. B als je vindt dat een tester zijn spel niet
    mag verliezen door één misstap.
    **Beantwoord (Marcel, 29 sep): "A laten zo, geen bericht. B schout kan sterven. C. We bouwen het langzaam op".**
    Dus: geen waarschuwing bij een aanval, en valt de schout, dan is het spel uit; dat wordt geen spelregel. De
    rovers bouwen langzaam op; hoe precies, is vraag 57.
57. **Hoe bouwen de rovers langzaam op?** (Claude, 29 sep, vijftiende sessie; na vraag 56; wacht op Marcel.) Nu
    komen er twee tot vier wilde rovers, door het lot gekozen, al bij de eerste aanval. Wat de gevechten lieten zien
    (vraag 56): tegen twee rovers wint iedereen, tegen drie moet je nadenken en kost het meestal een wachter, en
    vier is niet geprobeerd. Een tweede wachthuis geeft twee man meer; dat werkt al.
    - **A. Elk jaar een man meer** (voorstel): het eerste jaar komen ze met twee man, het tweede met drie, daarna
      met vier. Dat is voorspelbaar. Wie weet dat ze volgend jaar met drie komen, bouwt op tijd een tweede
      wachthuis, en dat kost goud dat ook de kapel en de smidse nodig hebben. Het worden twee getallen in de
      werkbank: met hoeveel man ze beginnen, en hoeveel er elk jaar bij komen.
    - **B. Naar de grootte van het dorp:** één rover per vijftien mensen, minstens twee. Een gehucht van 26 mensen
      krijgt er twee, een dorp van 50 drie. Wie groeit, trekt rovers aan, net als de heer, die per ziel vraagt.
    De bende van wie wegtrok, blijft zoals hij is: die is zo groot als je hem zelf maakt.
    **Beantwoord (Marcel, 29 sep): "A, ja naar main, graan uit de schuur is goed".** Gebouwd: de wilde rovers
    komen elk jaar van je ambt met een man meer, van twee tot vier (`wildeEerst`, `wildeErbijPerJaar` en
    `wildeMeest` in `T.ROVERS_INSTELLINGEN`, in de werkbank). Het graan blijven ze uit de schuur halen, en stap 4
    ging naar `main`.
58. **De proef afmaken: het plan** (Claude, 29 sep, zestiende sessie; stap 5 van de proef "van gehucht tot dorp",
    vraag 51; Marcel: "Werklijst doorzetten"; wacht op Marcel). Drie stukken: de eerste weken (vraag 47, herschreven
    voor de nieuwe richting), een speeltest van twee jaar, en een tester die het niet kent (33d). En Marcel, 29 sep:
    "Maak het niet te ingewikkeld". Wat er nu is:
    - **Een nieuwe speler krijgt het doel, niet de weg.** De benoemingsbrief noemt een kapel, een smidse en vijftig
      zielen, linksboven staat "26 van 50 mensen · nog geen kapel · nog geen smidse", en de knoppen staan in de
      balk. Wat nergens staat: dat de huizen plaats hebben voor 37, waarom er soms maanden niemand komt, en waar
      goud vandaan komt.
    - **Een speeljaar van nu** (braaf, zaad 1, op `6750a21`; 3½ minuut, zonder fouten). Om de 20 dagen kan er een
      gezin komen, als er 20 graan ligt, het dorp 55% tevreden is en er plaats is. Er kwam drie keer iemand (21
      lentemaand, 21 hooimaand, 11 oogstmaand), van 26 naar 37, en toen waren de huizen vol. In de lente en de zomer
      kwam er vijf keer niemand omdat er geen graan lag, en dat zegt het spel niet. Van herfstmaand tot sprokkelmaand
      zei het dorp negen keer "Er wil een gezin komen, maar er is geen plaats. Wijs een erf aan (B).", terwijl er in
      de herfst zo'n 450 graan lag en het dorp 70% tevreden was.
    - **Dus: negen maanden, of nooit.** Wie in de herfst erven aanwijst, kan rond slachtmaand van het eerste jaar 50
      mensen hebben (vier gezinnen, op de groeidagen van herfstmaand tot slachtmaand); wie dat bericht mist, blijft
      op 37. De kapel en de smidse kosten samen 18 van de 20 goud waarmee je begint: dan blijft er voor de heer niets
      over.
    - **Het tweede jaar begint armer.** Op 1 lentemaand 1324 lag er geen graan meer: de heer nam er 75, de rovers 20
      (en in zomermaand vertrapten ze een akker), en 37 monden aten de winter door. Er was zaaigraan voor 100 van de
      179 akkertegels (op 28 sep, vóór de rovers, bleef bij braaf gemiddeld 4% ongezaaid), en het dorp was 47%
      tevreden: geen groei in de tweede lente. De heer kreeg 16 van de 25 goud, dus komt er volgend jaar 14 bij.
    - **De speeltest speelt één jaar, met vier spelers die over verstoppen gaan.** Geen van hen wijst een erf aan,
      neemt een wet aan of bouwt een smidse.
    - **Het spel draait ook als los bestand** (nagekeken in Chromium): `index.html` openen, Nieuw spel, opslaan en
      herladen gaat zonder fouten. Dat is sinds 20 sep een bewuste keuze (`verpakken.md`).
    Voorstel, in deze volgorde:
    - **A, eerst meten: een vijfde speler, de bouwer, speelt twee jaar.** Hij doet wat het doel vraagt: hij houdt
      steeds één erf vrij, neemt Vreemden welkom aan, bouwt de kapel en de smidse zodra het goud en het hout er zijn,
      een houthakker als het dorp waarschuwt, verkoopt graan als het goud tekortschiet, en betaalt de heer alles. Hij
      vecht niet, net als de anderen. Hij speelt tot 1 grasmaand van het derde jaar, ook als het eerder een dorp is:
      dan zien we of dat dorp de tweede winter en de tweede heer haalt. De samenvatting zegt per zaad op welke dag
      het een dorp werd, en op elke groeidag waarom er geen gezin kwam. Die reden vraagt hij aan het spel zelf, aan
      dezelfde vraag die de groei stelt (`T.waaromGeenGezin` in `js/gebouwen.js`), zodat de speeltest niet naast het
      spel telt; B gebruikt hem ook. De vier spelers van nu blijven zoals ze zijn. Waarom eerst: het zegt hoe lang
      de proef duurt voor wie het weet, wat hem tegenhoudt, en dus wat de eerste weken moeten leren. Duurt het veel
      korter of langer dan twee jaar, dan leg ik je dat voor, en kies jij of er een getal in de werkbank verandert
      voordat een tester speelt (het bijstellen zelf blijft voor later, vraag 46).
    - **B, de eerste weken: een raad onder het doel.** Onder "26 van 50 mensen · ..." komt één regel die zegt wat nu
      tussen jou en een dorp staat, met de toets erbij. Wat het zwaarst weegt, gaat voor:
      - "Er komt geen gezin: het dorp is vol. Wijs een erf aan: `B`, dan Erf."
      - "Er komt geen gezin: er ligt minder dan 20 graan." Of: "het dorp is 52% tevreden, en een gezin wil 55%"
        (waar het last van heeft, zegt de balk al).
      - "Het hout haalt de winter niet: bouw een houthakker, `B`." (vanaf 1 herfstmaand, zoals de waarschuwing)
      - "De heer wil 25 goud, en je hebt er 16. De marskramer koopt graan, zolang hij er is." (in wijnmaand)
      - "De rovers komen terug. Een wachthuis (`B`) geeft je twee man die meevechten." (na een aanval, zonder
        wachthuis)
      - "De inner komt over drie dagen. Wat hij niet ziet, telt de heer niet." En na Sint-Maarten: "In de kelders
        ligt nog 80 graan. Dat eet niemand en zaait niemand." (de duurste fout uit de speeltest van 28 sep)
      - en als niets de groei tegenhoudt: "Het volgende gezin komt over 7 dagen", zoals een stad in Civilization
        zegt wanneer hij groeit. De eerste dag staat er: "Een dag duurt lang: `+` zet de tijd sneller, en `Z` is
        slapen tot de ochtend."
      Het is geen rij die je afwerkt, maar wat nu telt. Zo blijft niemand op een stap hangen, komt een toets pas als
      je hem nodig hebt, en blijft het na de eerste weken nuttig. De regels staan in één lijst, in volgorde, zonder
      scherm en met toetsen (`js/raad.js`). Het andere: vijf opdrachten voor de eerste weken, één tegelijk, als een
      quest (erf, wetten, de tijd, de marskramer, het wachthuis), zoals vraag 47 voorstelde.
    - **C, de tester krijgt een zip.** `npm run proefversie` maakt een zip met alleen wat het spel nodig heeft (zo'n
      15 MB), met de datum en de commit in de naam en klein op het titelscherm, zodat we weten op welke stand hij
      speelde. Uitpakken en `index.html` openen in Chrome of Edge: geen installatie, geen internet, en opslaan gaat
      in de browser. Het andere: dezelfde zip op itch.io, als bladzijde met een geheime link (gratis, en zo testen
      veel spellen voordat ze naar Steam gaan), of een programma (Electron, zo'n 150 MB), dat pas voor Steam nodig
      is. Waar hij vastloopt, zie je het best door mee te kijken bij de eerste tester (naast hem, of met een gedeeld
      scherm), zonder te helpen, en na afloop drie dingen te vragen: wat was het doel, waar liep je vast, en wat
      wilde je doen dat niet kon.
    Klaar als de bouwer met zaad 1 tot en met 3 twee jaar speelt zonder fouten, en de samenvatting per zaad de dag
    van het dorp en de redenen zonder gezin geeft; het vak het doel met een raad eronder toont, elke regel van de raad
    een toets heeft, en de bouwer opschrijft welke raad hij hoe lang zag; `npm run proefversie` een zip geeft die met
    een dubbelklik speelt en opslaat; en `npm test` groen is. Vragen: **A**, eerst meten met een bouwer, twee jaar?
    **B**, een raad onder het doel, of vijf opdrachten na elkaar? **C**, een zip, itch.io of een programma; en wie
    is de eerste tester?
    **Beantwoord (Marcel, 29 sep): "A Ja goed idee. B onder het doel. C itch io. Als ik thuis ben want heb alleen
    telefoon hier".** A en B worden gebouwd zoals voorgesteld. Voor C maakt Claude de zip klaar die itch.io wil
    (`index.html` bovenin), met de stappen voor het uploaden in `verpakken.md`; Marcel zet hem erop als hij thuis is.
    Wie de eerste tester is, staat nog open.
    **Gebouwd (29 sep, zestiende sessie);** zie onder Af, en `speelbaar.md`, "De speeltest van 29 sep", voor wat de
    bouwer liet zien. Daaruit volgt vraag 59.
59. **De proef is in zes maanden klaar, en wie verder speelt, verliest alles** (Claude, 29 sep, zestiende sessie; na
    de bouwer in de speeltest, vraag 58, A; wacht op Marcel). Wat de bouwer liet zien, met zaad 1, 2 en 3
    (`speelbaar.md`, "De speeltest van 29 sep"): wie de kapel en de smidse op de eerste dag bouwt, steeds een erf vrij
    houdt en Vreemden welkom aanneemt, heeft op 1 herfstmaand van het eerste jaar een dorp van 51 mensen, vóór de heer
    komt en vóór de winter. Daarna groeit het door tot 74, is er geen goud voor een houthakker (2 over op de eerste
    dag, en het graan is nodig), sterven er in de eerste winter 42 tot 53 mensen, en is er in de lente geen zaaigraan:
    het tweede jaar heeft het dorp niets, de heer krijgt niets, en aan het eind is er één mens over of het ambt kwijt.
    Een tweede bouwer, die de houthakker vóór de smidse bouwde, kwam nooit aan de smidse toe (twee goud te kort).
    Drie vragen, van belangrijk naar minder:
    - **A, wanneer is het een dorp?** Nu: zodra er 50 mensen, een kapel en een smidse zijn. Voorstel: pas op 1
      lentemaand, na de winter: heeft het dorp dan nog 50 mensen, een kapel en een smidse, dan schrijft de heer. Zo
      zit de hele proef erin (de inner, de heer, de winter), duurt hij minstens een jaar, en telt wat na zes maanden
      gebeurt ook. Het is één datum en één regel, en het doel linksboven zegt het ("op 1 lentemaand"). Het andere: op
      Sint-Maarten, als de heer het ziet (dan zonder de winter), of zoals nu.
    - **B, groei zonder rem.** Er komt een gezin zolang er 20 graan ligt en het dorp tevreden genoeg is, ook als het
      hout en het eten de winter niet halen. Voorstel: er komt geen gezin als het hout of het eten de winter niet
      haalt (vanaf drie maanden ervoor, zoals het dorp het zegt), en de raad zegt waarom ("Er komt geen gezin: het
      hout haalt de winter niet"). Het is een spelregel, standaard aan. Het andere: zo laten, en de speler moet het
      zelf zien (de raad waarschuwt nu al).
    - **C, goud.** 20 goud bij het begin, 18 voor de kapel en de smidse, 25 tot 30 per jaar voor de heer, en alleen
      graan en belasting brengen goud. Voorstel: de getallen laten zoals ze zijn (het is de keuze van het eerste jaar:
      een dorp of een houthakker), en de raad zegt waar goud vandaan komt als je het nodig hebt: "Voor de smidse mis
      je 8 goud: de marskramer koopt graan, en belasting [W] brengt elke maand goud." Het andere: meer goud bij het
      begin, of een goedkopere smidse, in de werkbank.
    En opgevallen, zonder vraag: zonder zaaigraan in lentemaand komt een dorp nooit meer boven, want de marskramer
    verkoopt geen graan (`opmerkingen.md`). Vragen: **A**, pas een dorp op 1 lentemaand? **B**, geen gezin als het
    hout of het eten de winter niet haalt? **C**, de raad zegt waar goud vandaan komt?
    **Geparkeerd (Marcel, 29 sep): "Parkeer deze vraag", alles naar `main`, en naar het volgende punt in een nieuwe
    sessie.** Niets gebouwd; de voorstellen blijven hier staan voor later.
60. **De heervaart en een rivaal: het plan** (Claude, 29 sep, zeventiende sessie; het eerste punt na de proef, vraag
    51; Marcel: "Werklijst doorzetten"; wacht op Marcel). Marcel koos bij vraag 50 (D): eerst vechten onder de heer,
    met rovers, de heervaart en dan een rivaal, een ander dorp van dezelfde heer. En op 29 sep: "Maak het niet te
    ingewikkeld", met als hoger doel al het land veroveren of met iedereen bevriend raken, zoals in Civilization. Wat
    er nu is:
    - **De heer vraagt alleen goud en graan,** op Sint-Maarten. "Dat kost u vanaf nu meer", in zijn brief als het
      gehucht een dorp is, is nog alleen woorden: het hoofdgeld in een dorp staat op 1 (vraag 53, D).
    - **Een brief van de heer heeft geen keuzes.** De benoeming, de schatting en de dorpsbrief zijn drie kopieën van
      hetzelfde venster in `js/hud.js`; betalen gaat in een eigen venster.
    - **Wie het dorp verlaat, is weg:** uit de bewoners en uit het getal in de balk. Tijdelijk weg zijn en terugkomen
      bestaat niet; alleen wie wegtrekt, komt terug, als rover.
    - **De militie is het wachthuis:** twee man met 16 leven, die even hard slaan als de schout. Wie vaker vocht, is
      niet beter.
    - **Er is één weg naar buiten,** naar het oosten; daarover komen de marskramer, de heer, de inner en nieuwe
      gezinnen. Andere dorpen bestaan alleen als woord: de nieuwkomer "kwam vorig jaar uit het buurdorp, en niemand
      weet waarom", en daar "deed de schout andere dingen".
    - **Het jaar is vol vanaf de zomer** (hooi en graan in hooimaand en oogstmaand, de inner op 15 oogstmaand, de
      brief op 1 wijnmaand, Sint-Maarten op 11 slachtmaand); in de lente komt alleen de marskramer langs.
    Voorstel, in twee stukken: eerst de heervaart, want die bouwt op wat er is, en dan de rivaal. Allebei pas als het
    gehucht een dorp is, zodat de proef blijft zoals hij getest is.
    - **A, de heervaart is "Dat kost u vanaf nu meer".** In een dorp schrijft de heer elk jaar op 1 hooimaand: "Wij
      trekken ten strijde tegen de heer van Kromwijk, die Ons niet groette. Zend Ons vijf weerbare mannen, of vijftien
      goud." Hij vraagt een man per tien zielen, of drie goud per man (werkbank), en de dorpsbrief kondigt het aan.
      Onder de brief staan twee knoppen, die vooraf zeggen wat ze doen:
      - *Stuur ze.* Het spel kiest wie: mannen, jong of volwassen, eerst wie geen werk heeft, een boer het laatst.
        De brief noemt ze bij naam, met het werk dat stil komt te liggen. Ze lopen de weg af en komen op 1
        herfstmaand terug, na de oogst. Hun plaats in huis blijft van hen, en het dorp voedt ze (de heer doet dat
        niet). Van elke vier komt er gemiddeld één niet terug.
      - *Koop ze vrij.* Het goud, en de argwaan stijgt: wie kan betalen, is niet arm.
    - **B, wie terugkomt, is veteraan.** Hij vecht mee als er rovers komen, ook zonder wachthuis, en met meer leven
      (20 in plaats van 16). Zo is sturen niet alleen verlies: je krijgt minder mannen terug, maar hardere. Het andere:
      wie terugkomt, is gewoon weer een bewoner, en alleen het wachthuis vecht.
    - **C, de rivaal is het buurdorp** waar de nieuwkomer vandaan kwam: een dorp van dezelfde heer, over de weg, met
      een naam in de werkbank (voorstel: Zevenhuizen, uit `spel.md`). Je ziet het niet, want de streek als kaarten
      naast elkaar komt later (vraag 50, C), maar je merkt het:
      - *Hoe jullie staan,* is één getal, van vijandig tot bevriend, in woorden. Het staat op één plek, zodat het later
        voor elke buur werkt: het begin van "met iedereen bevriend, of alles veroveren".
      - *Zijn schout komt twee keer per jaar* over de weg met een vraag, op twee plekken die nu leeg zijn: op 20
        grasmaand "leen ons twintig graan tot de oogst", op 20 herfstmaand "geef ons hout voor de winter". Geven maakt
        jullie beter, weigeren slechter, en elk antwoord zegt vooraf wat het kost.
      - *Vrienden* betalen terug met rente (dertig voor twintig), en verkopen je in de lente zaaigraan: wat een dorp
        nu mist als de schuur leeg is (vraag 59). *Vijanden* vragen niet maar eisen ("geef, of we halen het"); weiger
        je, dan komen zijn mannen roven zoals de rovers, van de oostkant, en je militie vecht. Elke man van hem die
        valt, maakt het erger.
      - *De heer vergelijkt,* in zijn brieven, en altijd in je nadeel: "Zevenhuizen zond Ons zeven man." Ben je
        bevriend, dan zegt hun schout: "Zegt hij u ook dat wij meer brachten? Ons zegt hij hetzelfde over u."
    - **D, zelf terugslaan: nu, of met de streek?** Vijanden komen naar jou; naar hen toe gaan kan pas als hun dorp een
      kaart is. Het kan eerder, op de manier van de heervaart: je stuurt je veteranen drie dagen over de weg, en ze
      komen terug met graan, met minder, en met een buurman die je meer haat. Voorstel: met de streek, want nu is het
      een knop zonder gevecht.
    - **Wat het doet** (inzicht): elke trede krijgt zijn eigen druk, zoals de tijdperken in Civilization: het gehucht
      de rovers, het dorp de heervaart en een buurman. Groeien is dan niet alleen meer, maar ook anders. De heervaart
      zet de kern op een nieuwe plek: goud geven zegt dat je niet arm bent, en mannen geven kost werk en levens, maar
      maakt je militie sterk. En het buurdorp geeft een idee voor de open vraag hoe de heer in het hogere doel past
      (vraag 54, C): de heer speelt zijn dorpen tegen elkaar uit. Wie met iedereen bevriend raakt, staat samen tegen
      hem (de vrijheid), en wie alles verovert, wordt zelf heer. Niet voor nu, wel om te onthouden.
    - **Hoe het werkt** (geen vraag): twee nieuwe bestanden zonder scherm, met toetsen: `js/heervaart.js` (de eis, wie
      gaat, weg en terug, de veteraan) en `js/buren.js` (het buurdorp, hoe jullie staan, de bezoeken), elk met één
      blok getallen in de werkbank en als spelregel aan en uit te zetten. Een aanval van het buurdorp gaat door
      `js/rovers.js`, als derde soort naast de bende en de wilde rovers: één manier om aan te vallen. De brieven van de
      heer worden één functie met knoppen, in een eigen bestand (`js/brieven.js`): het eerste stuk van `hud.js`
      splitsen (vraag 25, C), nu dat bestand toch open moet. Wie op heervaart is, blijft bewoner (hij telt mee en
      eet), maar heeft geen poppetje en geen werk. Alles staat in `S`, dus opslaan houdt het. `Spel.debug.heervaart()`
      en `Spel.debug.buren()` laten het nu gebeuren.
    Klaar als de heer in een dorp op 1 hooimaand mannen vraagt, met twee knoppen die vooraf zeggen wat ze doen; wie
    gaat, de weg afloopt en op 1 herfstmaand terugkomt, minder, als veteraan die meevecht; vrijkopen goud en argwaan
    kost; de schout van het buurdorp twee keer per jaar komt, en hoe jullie staan verandert met wat je antwoordt;
    vrienden terugbetalen en zaaigraan verkopen, en vijanden eisen en roven; de heer vergelijkt; de getallen in de
    werkbank staan; opslaan alles houdt; `npm test` groen is; en schermafdrukken de brief van de heervaart en een
    aanval van het buurdorp laten zien. Vragen: **A**, de heervaart pas in het dorp, op 1 hooimaand, sturen of
    vrijkopen? **B**, wie terugkomt, vecht mee? **C**, het buurdorp zo: bezoeken, hoe jullie staan, en roven als
    jullie vijanden zijn? **D**, zelf terugslaan pas met de streek?
    **Beantwoord (Marcel, 29 sep): "A ja B ja C ja, speler mag zelf de naam voor zijn dorp kiezen aan het begin. D we
    moeten toe naar een scenario waarin we aan het begin kiezen hoeveel tegenspelers we hebben. We hebben dan een AI
    nodig om tegen de speler te spelen. Deze worden gelijk aan het begin op de kaart gespawned, maar de exacte locatie
    is nog onbekend voor de speler. Ze bouwen zelf een dorp met als doel de grootste te worden. Ze moeten intelligent
    genoeg zijn om echt weerstand te bieden."** A, B en C zoals voorgesteld, en de speler geeft zijn dorp aan het
    begin zelf een naam. D wordt een eigen stuk, met een eigen plan: tegenspelers die zelf bouwen (vraag 61). Het
    buurdorp uit C is er straks de eerste van, en wat C bouwt (hoe jullie staan, de bezoeken, het roven, de heer die
    vergelijkt), wordt hoe je met elke tegenspeler omgaat.
    **Gebouwd (29 sep, zeventiende sessie):** A en B, de heervaart en de veteranen, en de naam van je dorp bij Nieuw
    spel; zie onder Af. C wacht op het plan voor D (vraag 61), want met D wordt het buurdorp een echte tegenspeler.
61. **Tegenspelers die zelf bouwen: het plan** (Claude, 29 sep, zeventiende sessie; Marcels antwoord D op vraag 60;
    wacht op Marcel). Marcel: "we moeten toe naar een scenario waarin we aan het begin kiezen hoeveel tegenspelers we
    hebben. We hebben dan een AI nodig om tegen de speler te spelen. Deze worden gelijk aan het begin op de kaart
    gespawned, maar de exacte locatie is nog onbekend voor de speler. Ze bouwen zelf een dorp met als doel de
    grootste te worden. Ze moeten intelligent genoeg zijn om echt weerstand te bieden." Wat er nu is:
    - **De regels werken al per dorp.** Elke regel krijgt het dorp mee (`S`), en geen enkel regelbestand kijkt naar
      het ene spel van de speler (`T.S` staat alleen in de schermbestanden). Een tweede dorp kan dus met precies
      dezelfde regels draaien: dezelfde bouwkosten, dezelfde winter, dezelfde heer.
    - **Maar ze zijn gebouwd voor één dorp op één kaart.** De akkers zijn tegels, de oogst doen poppetjes, en elk
      bericht gaat naar jouw scherm. Waar geen poppetjes zijn, vangen de regels het al op: wat niet gemaaid werd, gaat
      bij de volgende ploegtijd in één keer (het vangnet), en zonder bewoners telt het getal.
    - **Kaarten naast elkaar kan het spel al** (gebieden met overgangen, zoals het proefbos), maar alleen de kaart
      waar je bent, leeft. En de kaart van het gehucht komt uit code (`maak-gehucht.cjs`): een tweede gehucht kan ook.
    - **Er speelt al een computer**: de spelers van de speeltest, die klikken zoals een mens. De bouwer haalde een dorp
      in zes maanden, en ging in de eerste winter ten onder (vraag 59).
    Voorstel:
    - **A, de wereld is de streek: kaarten naast elkaar** (zoals vraag 50, C). Elk dorp ligt op een eigen kaart, met
      land ertussen (bos, heide). Je loopt over de weg naar de volgende kaart, en waar de tegenspelers liggen, weet je
      niet: je vindt ze door te gaan kijken. Van het begin af weet je wel dat ze er zijn, want de heer vergelijkt
      jullie in zijn brieven. Een dorp waar je niet bent, draait door op dezelfde regels, maar zonder poppetjes; kom
      je er, dan zie je het zoals het nu is. Het andere: één grote kaart met alle dorpen erop, waar je ze ziet
      groeien als je in de buurt komt. Dat is mooier, maar zwaar voor de computer (honderden poppetjes tegelijk), en
      elke regel moet dan leren van welk dorp een akker of een huis is.
    - **B, eerlijk: gelijk beginnen, met dezelfde regels.** Elke tegenspeler begint zoals jij: een gehucht van 26
      mensen, een schout, dezelfde heer, en de kaart uit dezelfde code met een ander zaad. Hij speelt zonder vals
      spelen, en moeilijker betekent dat hij beter kiest, niet dat hij meer krijgt. Zo zegt de computer ook iets over
      het spel: wat hij niet overleeft, is te zwaar.
    - **C, hoe slim: een schout in code die kiest zoals een speler.** Elke dag kijkt hij wat nu het meest nodig is
      (eten, hout, woonruimte, goud voor de heer, verdediging, de volgende trede), en doet hij het nuttigste: bouwen,
      een erf, een wet, mannen in het wachthuis, of een tocht naar een buurman. Hij vraagt het aan dezelfde regels als
      de raad, en hij kent zijn buren: hij valt aan wie zwakker is en hem iets weigerde, en zoekt vriendschap als hij
      zelf zwak is. De maat, gemeten met de speeltest (computer tegen computer, bij elk zaad): een tegenspeler wordt
      in twee jaar een dorp, en haalt de winters. Dat haalt vraag 59 terug: een tegenspeler die in de eerste winter
      sterft, biedt geen weerstand.
    - **D, zo ga je met ze om: het buurdorp uit vraag 60 (C).** Hoe jullie staan (één getal, van vijandig tot
      bevriend), bezoeken van hun schout, roven als jullie vijanden zijn, en de heer die vergelijkt. Maar de
      tegenspeler kiest nu zelf wat hij vraagt en wanneer: heeft hij in de lente geen graan, dan komt hij lenen. En
      wie wint? De tegenspelers willen de grootste worden. Voorstel: jij ook, als eerste eind (na een aantal jaar, of
      wie het eerst een stad is), en "alles veroveren of met iedereen bevriend" (het hogere doel) als de twee grote
      eindes voor later.
    - **Het begin:** bij Nieuw spel, onder de naam van je dorp, kies je Tegenspelers: 0 tot 3 (met 0 speel je zoals
      nu, de proef).
    - **In stappen, elk speelbaar:**
      1. *Eén tegenspeler, met zijn eigen dorp in getallen:* het buurdorp draait op dezelfde regels, op een eigen kaart
         waar je nog niet heen kunt (de regels hebben er een nodig: de akkers zijn tegels), met een schout in code die
         bouwt en groeit, en die naar jou komt (C van vraag 60). Je weet hoe groot hij is, en hij groeit echt.
      2. *De streek:* zijn dorp op een eigen kaart, over de weg. Je kunt erheen, zien wat hij bouwde, en daar vechten
         (zelf terugslaan, D van vraag 60).
      3. *Kiezen hoeveel, en ze zoeken:* een streek van meer kaarten, met de tegenspelers op een plek die je nog niet
         kent.
      4. *Slimmer:* de computer tegen zichzelf in de speeltest, tot hij echt weerstand biedt.
    - **Hoe het werkt** (geen vraag): elke tegenspeler is een dorp van dezelfde vorm als het jouwe, in
      `S.tegenspelers`, en dus vanzelf bewaard. De dagtik draait voor elk dorp; wat er in zijn dorp gebeurt, gaat niet
      naar jouw berichten maar naar zijn eigen kroniek, en dat hoor je via zijn bezoeken en de herbergierster ("in
      Wolfsdonk is de smidse af"). Zijn schout staat in een nieuw bestand, `js/tegenspeler.js`, zonder scherm en dus
      getoetst, met één blok getallen in de werkbank.
    Klaar als (stap 1): er bij Nieuw spel één tegenspeler bij kan, zijn dorp op dezelfde regels groeit, zijn schout
    bouwt, erven aanwijst en wetten kiest, hij naar je toe komt met een vraag of om te roven, hoe jullie staan
    verandert met wat je doet, de heer jullie vergelijkt, opslaan zijn dorp houdt, `npm test` groen is, en de
    speeltest laat zien dat hij bij elk zaad in twee jaar een dorp wordt en de winters haalt. Vragen: **A**, de streek
    als kaarten naast elkaar, of één grote kaart? **B**, eerlijk: gelijk beginnen, dezelfde regels? **C**, de maat:
    een dorp in twee jaar, en de winters door? **D**, winnen: de grootste worden, en veroveren of bevriend raken voor
    later? En: beginnen met stap 1, met het buurdorp uit vraag 60 (C) erin?
    **Beantwoord (Marcel, 29 sep): "A een grote kaart. B Ja in de basis wel, dit kunnen we later aanpassen. C
    afhankelijk van het moeilijkheidsniveau. D kan beide kanten op, basis voor nu is alles veroveren. En ja we starten
    met het buurdorp erbij."** Dus: A, niet de streek maar één grote kaart met alle dorpen erop; B, gelijk beginnen
    met dezelfde regels, voor nu; C, hoe goed een tegenspeler is, hangt af van een moeilijkheidsgraad (een spelregel);
    D, winnen kan op twee manieren, en voor nu is het alles veroveren. Stap 1 begint met het buurdorp. Omdat het één
    kaart wordt, verandert het plan voor stap 1: zie vraag 62.
62. **Het buurdorp op één grote kaart: het plan voor stap 1** (Claude, 29 sep, zeventiende sessie; na Marcels
    antwoord op vraag 61: "A een grote kaart ... En ja we starten met het buurdorp erbij"; wacht op Marcel). Wat er
    nu is, nagekeken:
    - **Eén kaart, één dorp.** Het gehucht is 76 bij 76 tegels, en veel regels gaan ervan uit dat alles op de kaart
      van dat ene dorp is: de akkers, het plein, de weide, de heide, de plek van de marskramer, en de weg in en uit aan
      de rand, waar de heer, de inner, de marskramer, nieuwe gezinnen en de rovers vandaan komen. Zo'n vijftien
      regelbestanden kijken ernaar.
    - **Wat per dorp is, is dat al:** de voorraad, de gebouwen, de bewoners, de wetten, de heer en de trede staan in
      het dorp (`S`), niet op de kaart.
    - **Meer poppetjes kan.** Gemeten op 30×: 37 poppetjes kosten 0,9 ms rekenwerk per beeld, 187 kosten er 2,2, en
      337 kosten er 4,7 (een beeld heeft er 16). Het tekenen doet al alleen wat in beeld is.
    - **Donker tot je het ziet, bestaat al half:** in het oude torenspel ging een kamer pas open als je erin kwam
      (`w.bekend`); het gehucht is nu één kamer die je meteen kent.
    - **De kaart komt uit code** (`maak-gehucht.cjs`), met vaste plekken voor elk huis, elke akker en de weg.
    Voorstel: stap 1 in drie stukken, elk speelbaar.
    - **1a, de grote kaart, en het buurdorp dat leeft.** De kaart wordt drie bij drie gehuchten groot (228 bij 228
      tegels; de schets stond in het gesprek): jouw gehucht linksonder, precies zoals het nu is, en het buurdorp
      rechtsboven, met wild land ertussen (bos, heide, een beek) en de weg, een ochtend lopen (de schout loopt zo'n 27
      tegels per uur). Wat je nog niet zag, is donker. Het buurdorp begint als jouw gehucht, met dezelfde indeling en
      andere namen (eerlijk, vraag 61, B), en het leeft op dezelfde regels, met zijn eigen voorraad, mensen, akkers en
      heer. Het beslist nog niets: het maait, eet, stookt en groeit vanzelf, zoals bij een schout die niets doet. Je
      kunt erheen lopen en het zien; wat er daar gebeurt, komt niet in jouw berichten.
    - **1b, de schout van het buurdorp beslist,** met een moeilijkheidsgraad bij Nieuw spel. Hij bouwt, wijst erven
      aan, neemt wetten aan, betaalt de heer, en stuurt mannen of koopt ze vrij. Op normaal wordt zijn gehucht in twee
      jaar een dorp en haalt het de winters; op makkelijk minder, op moeilijk meer (vraag 61, C).
    - **1c, hoe jullie staan** (vraag 60, C): bezoeken, vragen, de heer die vergelijkt, en roven, nu echt: zijn mannen
      lopen over de kaart naar je toe.
    - **Het grootste werk** (inzicht) is niet het tweede dorp, maar dat op één kaart elke regel moet leren welke
      akker, welk plein en welke weide van welk dorp is, en dat bezoekers en rovers niet meer van de rand komen, maar
      over de weg naar hun eigen dorp. Dat is 1a; daarna gaat het sneller.
    - **Hoe het werkt** (geen vraag): elk dorp is een eigen deel van het spel (voorraad, gebouwen, bewoners, wetten,
      heer), zoals het jouwe nu; ze delen de kaart en de kalender, en alles blijft in `S`, dus wordt het bewaard. De
      grote kaart komt uit dezelfde code als het gehucht, die dan een gehucht op een plek zet in plaats van op de hele
      kaart.
    Klaar als (1a): je bij Nieuw spel kiest tussen 0 en 1 tegenspeler; met 0 is het het spel van nu, en met 1 de grote
    kaart; jouw gehucht is daar zoals nu, en het buurdorp een gehucht met een eigen naam, mensen, voorraad en akkers,
    dat op dezelfde regels leeft (het maait, eet, groeit en stookt, en ook daar komen de inner en de heer); wat je
    nog niet zag, donker is; je erheen kunt lopen; opslaan allebei houdt; `npm test` groen is; braaf met 0
    tegenspelers letter voor letter hetzelfde jaar speelt; en met 1 tegenspeler een speeljaar zonder fouten loopt,
    met minder dan 8 ms rekenwerk per beeld. Vragen: **A**, de kaart zo: drie bij drie, jij linksonder, het buurdorp
    rechtsboven, een ochtend lopen? **B**, het buurdorp begint als een kopie van jouw gehucht, met andere namen, en
    een eigen indeling komt later? **C**, 0 tegenspelers is het spel van nu, op de kleine kaart, zodat de proef blijft
    zoals hij is, en 1 is de grote kaart met het buurdorp? **D**, veroveren (dat is stap 2, maar het bepaalt nu hoe we
    bouwen): verover je een dorp, dan wordt het van jou en ben je de schout van allebei; of komen hun mensen naar jou,
    en blijft hun dorp leeg achter?
    **Beantwoord (Marcel, 29 sep): "A, Nee, reistijd moet groter zijn. Denk in dagen. Het moet voelen meer als Lords of
    the Realm. Met een land met provincies. B het buurdorp mag random zijn, mag zijn eigen weg bepalen. Heeft mogelijk
    een voorsprong op bepaalde gebieden van het spel. Kunnen we later aanpassen en finetunen. C dat is goed. D ja dat
    dorp blijft bestaan. Je wordt inderdaad leider van 2. E uitzoeken of we ook met 5 - 6 spelers kunnen."** Dus: A,
    reizen duurt dagen, in een land met provincies, zoals Lords of the Realm; B, een tegenspeler heeft een eigen
    indeling (willekeurig), kiest zijn eigen weg, en kan ergens een voorsprong in hebben, met de getallen later bij
    te stellen; C, 0 tegenspelers is het spel van nu op de kleine kaart, zoals voorgesteld; D, een veroverd dorp blijft
    bestaan, en je bent de leider van allebei; E, uitzoeken of het met 5 of 6 spelers kan. A verandert het plan
    opnieuw: zie vraag 63.
63. **Een land met provincies: het plan** (Claude, 29 sep, zeventiende sessie; na Marcels antwoord op vraag 62: "Denk
    in dagen. Het moet voelen meer als Lords of the Realm. Met een land met provincies", en "E uitzoeken of we ook met
    5 - 6 spelers kunnen"; wacht op Marcel). Wat er nu is, nagekeken:
    - **Reizen in dagen op één doorlopende tegelkaart wordt een kaart van duizenden tegels.** De schout loopt zo'n 27
      tegels per uur, dus een dag lopen is zo'n 300 tegels. Zes dorpen die dagen uit elkaar liggen, vragen een kaart van
      duizenden tegels breed, en bijna alles daarvan is leeg land waar je doorheen loopt.
    - **Lords of the Realm doet het met een kaart van het land:** graafschappen, en daartussen reis je; het gevecht
      speelt op een eigen kaart. Jagged Alliance 2, ons voorbeeld voor het gevecht, net zo: je reist over de kaart van
      het land, en je loopt en vecht op de kaart van één stuk ervan.
    - **Een dorp waar je niet bent, kan draaien zonder poppetjes.** Gemeten: het gehucht twee jaar met alleen de
      dagtik, zonder dat iemand iets beslist, groeit in het eerste jaar van 26 naar 37, precies zoals in de speeltest
      mét poppetjes; de oogst komt binnen, en de winter kost mensen. Alleen de bezoekers (de heer, de inner, de
      marskramer) doen nu hun werk als poppetje; voor een dorp zonder poppetjes moet dat anders.
    - **5 of 6 spelers (E): het kan, met twee dingen erbij.** Per beeld kost alleen de provincie waar je bent iets (337
      poppetjes: 4,7 ms van de 16). Maar (1) een speeldag kost nu 44 ms rekenwerk per dorp, bijna allemaal omdat elke
      bewoner elke dag een plek zoekt en het spel daarbij voor elke tegel alle honderden bomen en huizen afloopt
      (`T.voorwerpOp`); met een lijst van wat waar staat, gaat dat vele malen sneller, en dat helpt het spel van nu
      ook (dat hapert nu elke speeldag even). En (2) een bewaard spel is 370 kB per dorp: met zes dorpen past het niet
      zes keer in de opslag van de browser (5 MB). Op Steam is het een bestand, en speelt dat niet; voor de browser
      (itch.io) moet het kleiner (samengeperst), of met minder plekken.
    Voorstel:
    - **A, het land is een kaart met provincies, zoals in Lords of the Realm**, en elke provincie heeft zijn eigen kaart
      waar je loopt, bouwt en vecht, zoals het gehucht nu. Loop je je provincie uit over de weg, dan open je de kaart
      van het land: daar zie je de provincies die je kent, en hoeveel dagen reizen het is. Kies je er een, dan gaan
      de dagen snel voorbij (zoals slapen), en kom je daar aan. Wat je nog niet zag, is donker. Een land voor jou en
      één tegenspeler heeft zo'n negen provincies, met één tot drie dagen reizen per stap; het buurdorp ligt een paar
      stappen verder. Met meer tegenspelers groeit het land (tot zo'n twintig provincies voor zes spelers). Het
      andere: één doorlopende tegelkaart, dagen lopen.
    - **B, wie reist, en wat thuis gebeurt.** Je reist zelf, als schout, en neemt mee wie je wilt: je wachters en je
      veteranen (voor het veroveren, stap 2). Je dorp draait door terwijl je weg bent, op zijn eigen regels en jouw
      wetten; komt de heer op Sint-Maarten en ben je er niet, dan neemt hij zelf wat hij wil, zoals nu. Wat er thuis
      gebeurde, hoor je als je terugkomt.
    - **C, elke tegenspeler heeft een karakter, zoals de rivalen in Lords of the Realm 2,** met zijn eigen weg en een
      voorsprong daarin (Marcel: "mag zijn eigen weg bepalen. Heeft mogelijk een voorsprong"): de bouwer (bouwt eerst
      een sterk dorp, en begint met meer hout), de groeier (wil groot worden, en neemt te veel hooi op zijn vork), de
      krijger (bewapent zich en valt aan, en begint met een wachthuis), de handelaar (verdient aan de marskramer, en
      begint met meer goud). Zijn gehucht ligt elke keer anders (willekeurig), uit dezelfde code als het jouwe. De
      getallen staan in de werkbank.
    - **D, provincies zonder dorp:** voor nu land waar je doorheen reist (bos, heide, het kasteel van de heer, de stad
      waar de marskramer vandaan komt). Later: ontginnen en een nieuw dorp stichten (land uitbreiden), een roversnest,
      of grondstoffen.
    - **In stappen, elk speelbaar:**
      1. *Het land, met het buurdorp* (vraag 60, C, en 61, stap 1): (a) de kaart van het land en reizen in dagen; je
         dorp draait door als je weg bent; het buurdorp in zijn eigen provincie, met een willekeurig gehucht dat op
         dezelfde regels leeft; en de dagtik sneller. (b) Zijn schout beslist, naar zijn karakter en de
         moeilijkheidsgraad. (c) Hoe jullie staan: bezoeken, vragen, roven, en de heer die vergelijkt.
      2. *Veroveren:* met je mannen erheen, vechten in zijn dorp, en leider van twee (vraag 62, D).
      3. *Kiezen hoeveel, tot 5 of 6,* met een land dat meegroeit.
      4. *Slimmer, en bijstellen.*
    - **Wat het doet** (inzicht): reizen in dagen maakt afstand een keuze. Wie een week weg is om een buurman te
      veroveren, laat zijn eigen dorp alleen, met de rovers en de heer; bij Lords of the Realm speelde je dat met
      legers, hier met jezelf. En de heer kan niet op zes plekken tegelijk zijn: zijn ronde op Sint-Maarten gaat van
      dorp naar dorp, zodat hij kan vertellen wat de anderen hem gaven.
    Klaar als (stap 1a): met 1 tegenspeler begint het spel in jouw provincie (het gehucht zoals nu); over de weg kom je
    op de kaart van het land, waar je reist en de dagen voorbijgaan; het buurdorp ligt in een eigen provincie, met een
    gehucht dat elke keer anders ligt en op dezelfde regels leeft; je dorp draait door als je weg bent; wat je nog niet
    zag, is donker; een speeldag kost per dorp een fractie van nu; opslaan houdt het land en alle dorpen; `npm test`
    groen; en met 0 tegenspelers speelt het spel letter voor letter zoals nu. Vragen: **A**, het land zo: een kaart met
    provincies waarop je reist, en per provincie de kaart waar je loopt? **B**, je reist zelf, met wie je meeneemt, en
    thuis draait het door? **C**, elke tegenspeler een karakter met een voorsprong? **D**, provincies zonder dorp voor
    nu alleen om doorheen te reizen?
    **Beantwoord (Marcel, 29 sep):** "A ... Ja goed idee. B ... Ja dan moet je als speler de afweging maken waar
    prioriteit ligt. C ... Ja dit maakt tegenstanders moeilijker in te schatten. D ... Ja, dit zijn zelfsturende
    provincies, vaak zwakker dan die aangestuurd door een karakter." Dus: A, het land is een kaart met provincies
    waarop je reist, en elke provincie heeft een eigen kaart waar je loopt en vecht; B, je reist zelf met wie je
    meeneemt, en thuis draait het door, ook als de heer komt: waar je bent, is een afweging; C, elke tegenspeler heeft
    een karakter met een voorsprong, zodat je hem moeilijker inschat; D, een provincie zonder karakter bestuurt zichzelf
    en is vaak zwakker (zoals de vrije graafschappen in Lords of the Realm 2): voor nu land om doorheen te reizen,
    later ook om in te nemen. Nog niets gebouwd: eerst vraag 65 (Marcel, bij vraag 64: "Het voelt gewoon nog leeg nu").
64. **Hoe blijft het leuk: besturen zonder te lopen, en een raadsman** (Marcel, 29 sep, zeventiende sessie: "Ook
    moeten we even nadenken over hoe we het spel 'leuk' houden. Want zelf als persoon rond hobbelen in je eigen stad
    maakt het wel lastig. Misschien voelt het handiger als we een soort raadsman en aansturen die je regels oplegt?
    Denk hierbij even mee"; het meedenken is van Claude; wacht op Marcel). Wat er nu is:
    - **Om te besturen moet je lopen.** De camera volgt altijd de schout, en je ziet maar een klein stuk van je dorp
      (inzoomen of de camera verschuiven kan niet). Bouwen en een erf aanwijzen kan dus alleen waar hij staat; de
      marskramer en de heer spreek je op het plein; wie je iets wilt vragen, loop je achterna. Alleen de wetten (`W`)
      en de velden (`V`) gaan van overal.
    - **Het stond al onder Open** (`spel.md`, "Een poppetje en honderden mensen"): met vijf boeren kun je ieder
      aanspreken, met vijfhonderd niet. Met een land waar je dagen reist en twee dorpen leidt (vraag 62 en 63), wordt
      het een muur: je bent maar op één plek.
    - **Lopen is leuk als het iets betekent:** 's nachts iets wegzetten waar niemand kijkt, de inner om de schuur heen
      leiden, met je wachters tegen de rovers, iemand spreken die een verhaal heeft. **Lopen is een klus als het vervoer
      is:** naar de andere kant van het dorp om een houthakker neer te zetten, naar het plein voor de marskramer.
    - **Leuk zijn keuzes met een prijs, en verrassingen.** De beste momenten tot nu toe zijn allemaal keuzes: de
      schatting van de heer, wat je verstopt en waar, de brief voor de heervaart, een wet. Klusjes halen de tijd weg
      bij de keuzes.
    Voorstel (meedenken; een schets van de raadsman stond in het gesprek):
    - **A, besturen van bovenaf, van overal.** Met één toets (`Tab`) til je de camera van de schout af en kijk je over
      je dorp, verder uitgezoomd: daar bouw je, wijs je erven aan, en zie je wat er gebeurt. De schout blijft staan waar
      hij stond. Je bent nog steeds de schout, maar je hoeft niet te lopen om te besturen.
    - **B, een raadsman in elk dorp, die jouw regels uitvoert.** Een man uit het dorp, met een naam en een karakter
      zoals de boeren, die doet wat je hem opdraagt: een bouwlijst (wat hij bouwt, in welke volgorde, zodra er hout en
      goud is) en staande orders voor als je er niet bent (wat hij de heer geeft, of hij mannen stuurt voor de
      heervaart of ze vrijkoopt, wat hij de marskramer verkoopt). De raad onder het doel wordt zijn stem ("Heer schout,
      het hout haalt de winter niet"). In een dorp waar je niet bent, je tweede dorp of je eigen als je reist, bestuurt
      hij het naar jouw regels. Hij doet de klussen, jij maakt de keuzes.
    - **C, de schout als persoon, voor wat persoonlijk is:** spreken, verstoppen, de inner, vechten en reizen. En waar
      het vervoer is, sneller: te paard (een idee van 26 sep), of klik een plek op de kaart van je dorp en je loopt
      erheen.
    - **D, wie wordt raadsman?** Jij kiest hem uit het dorp, en zijn karakter telt: een roddelaar vertelt in de herberg
      wat jij verstopt, een gierige houdt iets voor zichzelf, een vrome geeft de kapel wat van jou was, een heethoofd
      is goed tegen rovers. Zo wordt besturen ook politiek, en zijn de schepenen van later (punt 9) er al half.
    - **Het andere, zwaarder:** geen poppetje meer om te besturen, maar een hand van bovenaf, zoals in Lords of the
      Realm; de schout verschijnt alleen nog als het persoonlijk wordt (een gevecht, de inner, verstoppen). Dat
      verandert wat het spel is (Marcel, 23 sep: "een poppetje, geen hand van bovenaf").
    - **Wat het doet** (inzicht): de tijd gaat naar keuzes in plaats van naar lopen, je kunt sneller spelen zonder
      iets te missen, en het maakt het land met provincies mogelijk (vraag 63): je bent maar op één plek, dus moet iemand
      anders de rest doen. Het gevaar: als alles vanzelf gaat, is er niets meer te doen. Daarom voert de raadsman uit,
      en beslist hij niets zelf.
    Vragen: **A**, besturen van bovenaf met één toets, terwijl de schout blijft staan? **B**, een raadsman per dorp,
    met een bouwlijst en staande orders, en de raad als zijn stem? **C**, de schout voor wat persoonlijk is, en sneller
    waar het vervoer is? **D**, jij kiest de raadsman uit het dorp, en zijn karakter telt? Of het andere: geen poppetje
    meer om te besturen?
    **Beantwoord (Marcel, 29 sep):** "A ... Hier moeten nog even dieper op ingaan. Het voelt gewoon nog leeg nu. B ...
    Een raadsman moet een karakter hebben. Gerandomiseerde eigenschappen en skills wat hem in bepaalde scenarios beter
    maakt. C ... Dit valt samen met A. D ... Jij kiest een raadsman, op basis van skills en karakter." Dus: B en D, een
    raadsman met een karakter en eigenschappen die per spel geloot worden, en die hem in bepaalde gevallen beter maken;
    jij kiest hem op zijn karakter en wat hij kan. A en C samen: dieper op ingaan, want het spel voelt nu leeg. Dat is
    vraag 65.
65. **Het voelt leeg: het dorp spreekt je aan** (Marcel, 29 sep, zeventiende sessie, bij vraag 64: "Hier moeten nog even
    dieper op ingaan. Het voelt gewoon nog leeg nu"; het meedenken is van Claude; wacht op Marcel). Wat er nu is,
    gemeten:
    - **Het spel vraagt weinig van je.** Een jaar van braaf in de speeltest (zaad 1): 60 berichten, maar een keuze vraagt
      het spel een keer of acht: drie keer de marskramer, de inner, Sint-Maarten, twee keer de rovers, en het slachten.
      Daarnaast bouw je en kies je wetten wanneer je wilt. Op 30× duurt een jaar een uur: een keuze per zeven minuten.
    - **De winter is dood.** Van wintermaand tot sprokkelmaand komen er twee berichten, in oogstmaand negentien.
    - **De mensen hebben een naam en een karakter, maar vragen niets.** Ze gaan hun dag door, en zeggen iets als je ze
      aanspreekt. Quests zijn er nog niet (`js/quests.js` is leeg).
    - **Het stond er al.** Op 23 sep (`spel.md`, "Welke gameplay er nog nodig is"): "De drie die het spel maken:
      voorvallen met een keuze (zonder wordt een bouwspel een spreadsheet), argwaan met verstopplekken en het bezoek van
      de inner, en behoeften met de winter." De argwaan en de winter zijn gebouwd, de voorvallen nog niet, en
      rechtspraak, "de vierde", ook niet.
    - **Lopen of van bovenaf lost dit niet op.** Van bovenaf ga je sneller, maar als er niets gebeurt, zie je alleen
      sneller dat er niets gebeurt.
    Voorstel:
    - **A, het dorp spreekt je aan: voorvallen.** Om de paar dagen gebeurt er iets: iemand met een naam en een karakter
      komt naar de schout met een vraag, een ruzie of een ramp, en jij kiest uit twee of drie antwoorden, elk met een
      prijs die je vooraf ziet. Soorten:
      - *Rechtspraak* (de vierde van 23 sep): een dief, een vechtpartij in de herberg, twee boeren om een akkergrens.
        Streng houdt de orde, mild houdt vrienden, en wie je veroordeelde, vergeet het niet.
      - *Verzoeken:* een lening, een erf voor een zoon, een vreemdeling die wil blijven.
      - *Rampen:* brand in een rieten dak, ziekte uit een vuile put, wolven bij de schapen: iets doen kost iets, niets
        doen ook.
      - *Kansen:* een marskramer met gestolen goed, spotgoedkoop; een smid uit de stad die wil komen.
      - *Feesten:* een bruiloft, een oogstfeest: graan op en een tevreden dorp, en wat op is, telt de inner niet (Lords
        of the Realm, idee 4).
      - *De grillen van de heer* (een idee van 23 sep): "Een standbeeld van Ons, voor Pasen."
      Sommige komen terug: de dief die je liet gaan, steelt weer, of redt later je leven. In de winter komen ze vaker,
      zodat ook die tijd iets vraagt.
    - **B, de raadsman, zoals je koos (vraag 64, B en D):** iemand uit het dorp, met een karakter en eigenschappen die
      per spel geloot worden: rechtspreken, rekenen (de handel), bouwen, vechten (de militie), zwijgen (tegenover de
      inner). Je kiest hem uit twee of drie mensen, op wat hij kan en wie hij is. Ben je er niet, dan handelt hij de
      voorvallen af naar wat hij kan, en hoor je het als je terugkomt ("Terwijl u weg was, heb ik de dief laten gaan. Hij
      was mijn neef."). Zo telt zijn karakter, en bevalt je keuze je soms niet.
    - **C, het dorp van bovenaf laat zien waar je nodig bent** (A en C van vraag 64 samen). Met één toets kijk je over je
      dorp, en waar iets speelt, staat een teken boven het huis: een vraag, rook, twee mensen die ruziën. Klik erop, en de
      schout gaat erheen, te paard; of je laat het aan de raadsman. Zo heeft kijken van bovenaf een doel: zien waar je
      nodig bent, en niet alleen bouwen.
    - **D, de volgorde:** eerst één dorp vol leven (de voorvallen, de raadsman, het dorp van bovenaf), dan het land met
      het buurdorp. Een land vol dorpen waarin niets gebeurt, is nog leger.
    - **Hoe het werkt** (geen vraag): een voorval is een gesprek dat de ander begint. Het staat in dezelfde vorm als de
      gesprekken en de quests die er al zijn (met situaties, voorwaarden en een prijs per antwoord), dus je kunt ze
      zelf schrijven en nalezen in de gespreksschrijver. Wanneer er een komt en welke, zegt een klein nieuw bestand
      zonder scherm (`js/voorvallen.js`), met de getallen in de werkbank en een spelregel voor hoe vaak.
    - **Wat het doet** (inzicht): elke paar minuten een keuze die ertoe doet, uit het dorp zelf; de winter krijgt
      verhalen; de mensen worden mensen, omdat ze iets van je willen; en rijk worden en arm lijken krijgt nieuwe kanten
      (een feest dat een overschot laat verdwijnen, een raadsman die zwijgt of juist niet). Het maakt ook reizen
      spannend: wie weg is, mist wat er thuis gebeurt, en dan beslist de raadsman.
    - **Ook leeg, om te onthouden** (geen vraag): het dorp is stil. Geluid (vogels, een hamer, de herberg 's avonds)
      doet veel voor weinig; het staat in deel F.
    Klaar als (A): er om de paar dagen een voorval komt, meer in de winter; de mens die het betreft naar de schout loopt
    (of het wacht tot hij er is); elk antwoord vooraf zijn prijs zegt; er een stuk of dertig voorvallen zijn, van elke
    soort een paar; sommige terugkomen; de spelregel "Voorvallen" zegt hoe vaak; `npm test` groen is; en de speeltest ze
    beantwoordt, met in een speeljaar een keuze per één tot twee minuten op 30×. Vragen: **A**, voorvallen: om de paar
    dagen, meer in de winter, van mensen met een naam, en soms komen ze terug? **B**, de raadsman zo: geloot, gekozen
    uit twee of drie, en ben je er niet, dan beslist hij naar wat hij kan? **C**, het dorp van bovenaf met tekens waar
    je nodig bent, en erheen te paard? **D**, eerst één dorp vol leven, dan het land?
    **Beantwoord (Marcel, 29 sep): "A ja B ja C nee niet bovenaf, ik denk hier nog over na. D ja".** Dus: voorvallen
    zoals voorgesteld; de raadsman zoals voorgesteld; geen dorp van bovenaf (Marcel denkt er nog over na, dus het
    blijft open); en eerst één dorp vol leven, dan het land. Wordt gebouwd: eerst de voorvallen, dan de raadsman.
    **A gebouwd (29 sep, zeventiende sessie):** zie onder Af, en `spel.md`, "De voorvallen". Nog: B, de raadsman; het
    plan is vraag 66.
66. **De raadsman: het plan** (Marcel, 29 sep, vraag 64, B en D, en 65, B: "Een raadsman moet een karakter hebben.
    Gerandomiseerde eigenschappen en skills wat hem in bepaalde scenarios beter maakt", "Jij kiest een raadsman, op
    basis van skills en karakter"; het plan is van Claude; wacht op Marcel). Wat er nu is: een voorval dat je niet
    beantwoordt, gaat na twee dagen voorbij, en dat kost wat tevredenheid; verder hangt alles aan jou. Voorstel:
    - **A, wie het kan worden: een van de boeren.** Ze hebben al een naam, een karakter (de weduwe, de woekeraar, de
      roddelaar, ...), een aanzien (geliefd, gewoon, gehaat) en gelote eigenschappen, en je kent ze uit de voorvallen.
      Erbij komen twee gelote vaardigheden uit vijf: rechtspreken, rekenen, bouwen, vechten en zwijgen, elk goed of
      slecht. Wie raadsman is, maait minder: dat is zijn prijs.
    - **B, kiezen:** in de eerste week stelt de herbergierster het voor ("U kunt niet overal zijn, schout"), en een
      venster toont drie kandidaten: naam, karakter, aanzien en wat hij kan. Later kun je hem vervangen; wie je ontslaat,
      neemt het je kwalijk.
    - **C, wat hij eerst doet: de voorvallen.** Elk voorval krijgt een antwoord "Dat laat ik aan Klaas over": hij beslist
      naar zijn karakter (de vrome mild, de heethoofd streng, de woekeraar zuinig en hard voor wie schuld heeft, de zanger
      kiest het feest). Een voorval dat je mist, beslist hij ook, in plaats van dat het voorbijgaat, en hij vertelt het je
      als hij je ziet: "Terwijl u weg was, heb ik de dief laten gaan. Hij was mijn neef." Van zijn vaardigheden tellen
      eerst rechtspreken (zijn vonnis maakt meer of minder tevreden) en zwijgen (wat de inner van hem hoort); rekenen,
      vechten en bouwen komen met het land, als je dagen weg bent.
    - **D, staande orders** (de schets van vraag 64: wat hij doet met de heer op Sint-Maarten, de heervaart en de
      marskramer) komen pas met het land: nu ben je er altijd zelf.
    - **Wat het doet** (inzicht): de raadsman is er meteen, en niet pas als je gaat reizen. Wie het druk heeft, geeft een
      voorval aan hem, en ziet zijn karakter in wat hij beslist; zo bevalt je keuze je soms niet, zoals Marcel wilde. En
      hij maakt het land mogelijk: wie vier dagen naar het buurdorp reist, laat een dorp achter dat doorloopt.
    Klaar als (A tot C): je kiest in de eerste week uit drie boeren; elk voorval heeft "Dat laat ik aan ... over"; wat je
    mist, beslist hij, en hij zegt wat hij deed; twee karakters kiezen verschillend; rechtspreken en zwijgen tellen; de
    spelregel "Raadsman"; `npm test` groen; en de speeltest geeft er een deel aan hem. Vragen: **A**, een van de boeren
    als raadsman? **B**, kiezen in de eerste week, voorgesteld door de herbergierster? **C**, eerst de voorvallen, met
    "Dat laat ik aan ... over"? **D**, staande orders pas met het land?
    **Beantwoord (Marcel, 30 sep): "A Ja, b Nee, c Nee, wordt automatisch als de schout er niet is. D prima".** Dus: de
    raadsman is een van de boeren, met twee gelote vaardigheden erbij, en hij maait minder; niet gekozen in de eerste
    week via de herbergierster (hoe en wanneer dan wel, is een nieuwe vraag: vraag 67); geen antwoord "Dat laat ik aan
    ... over": hij beslist vanzelf als de schout er niet is; en staande orders komen met het land. Wordt gebouwd: de
    raadsman die beslist als je er niet bent (Claude leest "er niet is" als: je bent niet in het dorp, of je sprak wie
    je zocht niet op tijd). **Gebouwd (30 sep, zeventiende sessie):** zie onder Af, en `spel.md`, "De raadsman". Het
    kiezen zelf is vraag 67.
67. **Hoe je de raadsman kiest** (Marcel, 30 sep, bij vraag 66: "b Nee" op "in de eerste week, voorgesteld door de
    herbergierster"; wacht op Marcel). Wat er is: de regels kiezen de drie boeren waaruit je kiest (vast per spel), en
    `Spel.debug.raadsman('Aaltje')` maakt er een raadsman; in het spel kan een speler hem nog niet kiezen, dus beslist hij
    nu nooit, en gaat wat je mist voorbij zoals eerst. Een inzicht: aan het begin ken je de boeren nog niet. Hun karakter
    zie je pas in de voorvallen, en in wat ze zeggen als je met ze praat. Voorstel, kies er een:
    - **A, bij Nieuw spel**, na de naam van je dorp: drie kaarten met wie ze zijn en wat ze kunnen, en je kiest. Eén keer,
      aan het begin, zoals straks het aantal tegenspelers.
    - **B, wanneer je wilt:** een knop in de balk ("Raadsman") opent een venster met de drie; tot je kiest, is er geen.
      De raad onder het doel zegt het, zodra een voorval voorbijging: "Wat je mist, gaat voorbij: kies een raadsman."
    - **C, de heer wijst hem aan** in zijn benoemingsbrief (satire: zijn keuze is de rijkste, of de gehaatste), en met
      de knop uit B kies je later een ander.
    Claude raadt B aan: je kiest als je ze kent, en de raad zorgt dat je het niet vergeet. Klaar als: je kunt hem kiezen
    zoals gekozen, ook een ander later; de speeltest kiest er een; `npm test` groen. Vraag: **A, B of C?**
    **Beantwoord (Marcel, 30 sep): "B".** Een knop "Raadsman" in de balk opent een venster met de drie; tot je kiest,
    is er geen, en zodra een voorval voorbijging, zegt de raad onder het doel het. Later kies je er een ander mee.
    **Gebouwd (30 sep, zeventiende sessie):** zie onder Af, en `spel.md`, "De raadsman".
68. **Telt wegsturen als er niet zijn?** (Claude, 30 sep, na de speeltest met de raadsman: de bouwer drukte bij elk
    voorval `Esc`, en had geen voorvallen meer.) **Beantwoord (Marcel, 30 sep): "Ja B inderdaad"**: de raadsman beslist
    alleen als je weg bent, en wie je in het dorp wegstuurt, gaat voorbij. Gebouwd, met A als spelregel; zie onder Af.
69. **Het land, stap 1a: het plan** (Claude, 30 sep, zeventiende sessie; Marcel, bij vraag 65, D: "Ja, begin aan het
    land"; wacht op Marcel). Wat vraag 63 besloot: een kaart van het land met provincies waarop je in dagen reist, per
    provincie een kaart waar je loopt, en stap 1a: de kaart van het land en reizen, je dorp dat doordraait, het buurdorp
    in een eigen provincie, en een snellere dagtik. Wat er nu is, nagekeken:
    - **Er is plaats voor één dorp.** Alles wat bij het dorp hoort, staat los in de spelstaat: de voorraad, de gebouwen,
      de bevolking, de bewoners, de erven, de wetten, de heer, de inner, de rovers, de voorvallen, de raadsman, de trede
      en het vee (samen honderden plekken in 19 bestanden). Een tweede dorp kan pas als dat per dorp bij elkaar staat.
    - **Een ander gebied kan al:** de schout gaat naar een andere kaart (`S.gebieden`, `js/gebied.js`), en het dorp
      draait door met al zijn poppetjes. Reizen kan dus op dezelfde manier beginnen.
    - **De kaart van het gehucht is met de hand ontworpen** (het plein als hart, naar de schets die Marcel goedkeurde) en
      wordt buiten het spel gemaakt (`gereedschap/tiled/maak-gehucht.cjs`). Een gehucht dat elke keer anders ligt (vraag
      63, C), vraagt een nieuwe maker die in het spel zelf draait, en die legt eerst een kaler gehucht dan het jouwe.
    - **Een speeldag kost nu 29 ms per dorp** (gemeten), en een bewaard spel is 374 kB per dorp; voor twee dorpen past dat
      in de browser.
    Voorstel, in drie stukken, elk af en getoetst voordat het volgende begint:
    1. **De kaart van het land, en reizen** (dat zie je meteen): loop je over de weg je provincie uit, dan opent de kaart
       van het land: zo'n negen provincies, met je gehucht erin, wegen ertussen met hoeveel dagen reizen, het kasteel van
       de heer en de stad, en wat je nog niet zag donker. Kies je een provincie, dan gaan de dagen snel voorbij, zoals bij
       slapen, en ben je er. Een provincie zonder dorp is voor nu land om doorheen te reizen (vraag 63, D), zonder eigen
       kaart. Thuis draait het door zoals nu als je in een ander gebied bent: de raadsman beslist de voorvallen, en de
       heer, de inner en de marskramer doen hun werk zonder jou. Kom je terug, dan zegt een bericht wat er gebeurde.
       Tot het buurdorp er is, staat het land achter een spelregel, en speelt de proef zoals nu.
    2. **Eén dorp als één ding** (dat zie je niet): alles wat bij een dorp hoort, komt bij elkaar in de spelstaat, zodat er
       twee kunnen zijn; een dorp waar je niet bent, draait op zijn dagtik, zonder poppetjes die lopen; en de dagtik wordt
       sneller (een lijst van wat waar staat, in plaats van voor elke tegel alle bomen en huizen aflopen), wat ook het
       haperen van nu weghaalt. Klaar als de speeltest met hetzelfde zaad letter voor letter hetzelfde jaar speelt.
    3. **Het buurdorp:** in een eigen provincie, een paar dagen reizen, met een eigen gehucht, eigen mensen (andere namen
       en karakters) en dezelfde regels. Je kunt erheen en er rondlopen; zijn schout beslist nog niets (dat is stap 1b).
       Bij Nieuw spel kies je dan 0 of 1 tegenspeler, en met 0 is het spel zoals nu (vraag 62, C).
    Klaar als: zoals vraag 63 zegt voor stap 1a. Vraag: **C**, het buurdorp eerst met een tweede gehucht dat met de hand
    ontworpen is (snel, en even mooi als het jouwe, maar elk spel hetzelfde), en de maker die elke keer een ander gehucht
    legt pas bij stap 3 van het land (kiezen hoeveel, tot 5 of 6), waar hij echt nodig is? Of die maker nu al? Claude
    raadt het eerste aan. De kaart van het land als schets, met het plan en de vraag: de pagina "Het land met
    provincies" (https://claude.ai/artifact/KJHyaEbye8LQCjJk75vXWT).
    **Beantwoord (Marcel, 30 sep): "De maker nu".** Het buurdorp krijgt een gehucht van een maker die elk spel een ander
    gehucht legt, in het spel zelf, uit dezelfde delen als het jouwe (het plein als hart, huizen eromheen, boerderijen
    met hun velden verder naar buiten, de weg, de beek). Hij komt als eigen stuk vóór het buurdorp, met eerst een schets
    van een paar gemaakte gehuchten voor Marcel. Jouw eigen gehucht blijft het ontworpen gehucht. Over de volgorde en de
    schets zei Marcel niets, dus stuk 1 begint: de kaart van het land en reizen.
    Uitgewerkt bij het bouwen van stuk 1 (nagekeken): de heer, de inner, de marskramer en de rovers lopen in het gebied
    waar de schout is (`S.wereld`), niet in het dorp. Wie reist, verlaat daarom niet de kaart van het dorp: de schout
    gaat eruit, en het dorp blijft de wereld van het spel, zodat thuis alles zijn werk doet zonder hem.
    **Stuk 1 gebouwd (30 sep, zeventiende sessie):** de kaart van het land en reizen; zie onder Af, en `spel.md`, "Het
    land". **De maker als schets (30 sep, achttiende sessie):** zie vraag 70.
70. **De schets van de maker** (Claude, 30 sep, achttiende sessie; Marcel, bij vraag 69: "De maker nu"; wacht op
    Marcel). De maker bestaat, als gereedschap: `gereedschap/maker/maker.js` legt een gehucht uit een zaad
    (`T.maakGehucht`), uit dezelfde delen als het ontworpen gehucht, keurt zijn eigen werk en probeert het anders tot het
    deugt (gemiddeld twee pogingen, een halve seconde); `npm run maker` tekent ze als plattegrond. Aan het spel is niets
    veranderd. De schets, met drie gehuchten naast het jouwe en negen andere zaden: de pagina "Gehuchten van de maker"
    (https://claude.ai/artifact/KqCC7EzyVKbAQ9gcEYCmkX). Wat opviel: de herberg staat altijd links van het plein, want
    elke tekening heeft haar deur aan een vaste kant, en een deur kijkt naar het plein (gespiegelde tekeningen zouden
    helpen; voor later, `opmerkingen.md`). Vragen:
    - **A. Kloppen de delen?** Of mist er iets, of is er iets te veel? Voorstel: ja, het zijn dezelfde delen als het
      ontworpen gehucht, zodat dezelfde regels erop werken.
    - **B. Hoeveel verschil?** Alleen de ligging, zoals in de schets, of ook het land eromheen naar de provincie waar het
      dorp ligt (in het woud meer bos, op de heide een grote heide, in het broek meer water; de kaart van het land kent
      die soorten al). Voorstel: alleen de ligging nu; het land eromheen later, als er meer tegenspelers zijn.
    - **C. Ook je eigen gehucht?** Een spelregel "Je gehucht": het ontworpen gehucht (de standaard) of elk spel een
      ander. Voorstel: ja, en als eerste. Dan gaat de maker het spel in waar je hem meteen speelt, en speelt de speeltest
      de proef op drie gemaakte gehuchten, zodat we weten dat de heer, de inner, de rovers en de oogst er werken voordat
      het buurdorp er een krijgt. En een spel dat elke keer anders begint, is goed voor Steam. De volgorde wordt dan: de
      maker in het spel, stuk 2, het buurdorp. Zonder C komt stuk 2 eerst, en gaat de maker pas met het buurdorp het
      spel in.
    Klaar als (de maker in het spel): met de spelregel aan begint een nieuw spel op een gemaakt gehucht, met dezelfde 26
    mensen, de boeren bij hun akkers, en de heer, de inner en de marskramer die de weg vinden; de speeltest speelt de
    proef op zaad 1 tot en met 3; `npm test` groen. Vraag: **A, B en C?**
    **Beantwoord (Marcel, 30 sep): "A Ja, b nu alleen ligging later de rest, c ja".** De delen kloppen; de maker
    verschilt voor nu alleen in de ligging, en het land eromheen naar de provincie komt later; en de maker mag ook je
    eigen gehucht leggen, als spelregel, met het ontworpen gehucht als standaard. Daarmee is de volgorde: eerst de maker
    in het spel (voor je eigen gehucht, en de speeltest op drie gemaakte gehuchten), dan stuk 2, dan het buurdorp.
    **Gebouwd (30 sep, achttiende sessie):** de maker in het spel; zie onder Af, en `spel.md`, "Het land".
71. **Stuk 2 van het land: één dorp als één ding, het plan** (Claude, 30 sep, negentiende sessie; vraag 69, stuk 2; wacht
    op Marcel). Wat er nu is, gemeten op `4463e2d` (`npm test` 680/680):
    - **Een speeldag kost 30 tot 39 ms, en 85% daarvan is één ding.** Elke dag zoekt het spel voor elk kind en elke
      werkloze opnieuw een plek op het plein (`T.plekOpHetPlein`, `js/bewoners.js`), en vraagt daarbij voor elke tegel
      van het plein aan alle 290 tot 325 bomen, huizen en bankjes of ze daar staan (`T.voorwerpOp`): zo'n 4.000 keer per
      dag. Met een lijst per tegel van wat er staat, en de vrije plekken op het plein één keer per dag in plaats van per
      mens, kost een dag 0,5 ms: zestig keer sneller. Nagekeken met dezelfde dobbelsteen: een jaar lang dag voor dag
      dezelfde voorraad, dezelfde mensen, en iedereen op dezelfde plek en aan hetzelfde werk, op het ontworpen gehucht en
      op zaad 1 van de maker. Het haperen van nu (een beeld of twee elke speeldag, op 30× elke tien seconden) is dan weg.
    - **Een dorp met al zijn poppetjes kost weinig.** Het rekenwerk voor één dorp per beeld, zonder tekenen, gemeten in de
      browser: 0,4 tot 0,7 ms op 30×, en 1,5 ms op 60× (de reissnelheid), van de 16 ms die een beeld heeft. Met dezelfde
      lijst per tegel (lopen vraagt het ook, bij elke stap die een poppetje overweegt) 0,1 tot 0,2 ms. Zes dorpen van
      honderd mensen zijn dan samen een paar ms.
    - **Het dorp staat los in de spelstaat:** 25 velden (de voorraad, de gebouwen, de bevolking, de bewoners, de heer, de
      inner, de rovers, de voorvallen, de raadsman, de trede, het vee, ...), met zo'n 700 plekken in 35 bestanden die ze
      lezen, waarvan 116 in het scherm. De kaart van het dorp is `S.bewoners.wereld`, naast `S.wereld`, waar de schout is.
    - **De regels spreken rechtstreeks tegen het scherm**, zo'n honderd keer: een bericht ("De smidse staat stil"), de
      brief van de heer, het venster van de marskramer, de argwaan in de balk. Met twee dorpen hoor je dan wat er in het
      buurdorp gebeurt, alsof het in het jouwe was.
    Voorstel, met één verandering tegenover vraag 69:
    - **A, een dorp waar je niet bent, leeft zoals het jouwe: met poppetjes, alleen niet getekend.** Vraag 69 zei: alleen
      de dagtik, zonder poppetjes die lopen. Maar dan vraagt alles wat nu met poppetjes gebeurt een tweede manier, in
      getallen, die naast de eerste moet blijven kloppen: de oogst tegel voor tegel, de ronde van de inner en wat hij ziet,
      de heer met zijn soldaten, de rovers op de akker, de marskramer, een gezin dat binnenkomt, en wie je zoekt met een
      voorval. Twee manieren per ding lopen vroeg of laat uit elkaar. Met poppetjes overal is er één manier, en wat je in
      het buurdorp ziet als je aankomt, is wat er echt gebeurde: de inner loopt er net zijn ronde, de oogst is half binnen.
      Zo draait je eigen dorp nu al als je op reis bent (stuk 1), en met de lijst per tegel kost het weinig (hierboven).
    - **B, alles van een dorp bij elkaar.** `S` wordt het spel: de kalender, het land, jij, wat op het scherm is, en de
      dorpen. Een dorp heeft alles van zichzelf: zijn kaart, voorraad, mensen en wetten, hoe de heer en de inner ertegenover
      staan, zijn rovers, voorvallen en raadsman, en zijn eigen schout (in jouw dorp ben jij dat; in het buurdorp later een
      schout in code, stap 1b). Een regel over een dorp krijgt het dorp mee, zoals nu `S`. Wat de dorpen delen (de
      kalender, het land), is voor allemaal hetzelfde ding; het opslaan houdt dat al heel.
    - **C, een dorp spreekt alleen tegen jou als het jouw dorp is.** Een regel zegt het tegen zijn dorp, en alleen jouw
      dorp zegt het tegen het scherm (ben je weg, dan wacht het, zoals nu op reis). Van het buurdorp hoor je vanzelf niets:
      je ziet het als je er rondloopt, en je balk blijft over je eigen dorp gaan, ook daar. Wat het buurdorp zei, bewaart
      het wel, zodat later de marskramer, of iemand die je stuurt, kan vertellen hoe het er staat.
    - **In drie stappen, elk af en getoetst voor de volgende:**
      1. *De snellere dag* (zichtbaar: het haperen is weg): de lijst per tegel, bijgehouden op de zes plekken waar een
         voorwerp bijkomt, weggaat of groeit, en de vrije plekken op het plein één keer per dag. Klein.
      2. *Het dorp bij elkaar* (niet zichtbaar, en het grootste stuk werk tot nu toe dat niets laat zien): eerst krijgen de
         regels het dorp bij naam, terwijl het nog hetzelfde ding is als `S`; dan krijgt het dorp zijn eigen plek. Bestand
         voor bestand, en na elk stuk `npm test` en de speeltest.
      3. *Elk dorp leeft:* de dag en de poppetjes voor elk dorp in de lijst, het scherm tekent alleen waar jij bent, en een
         dorp spreekt alleen tegen jou als het het jouwe is (C). Met één dorp verandert er niets.
    - **Hoe we weten dat het klopt:** na elke stap speelt de speeltest met hetzelfde zaad letter voor letter hetzelfde jaar
      als nu (braaf, lui, slim en de bouwer; op het ontworpen gehucht, op de maker, en met opslaan). En een nieuwe toets:
      twee dorpen naast elkaar (het jouwe en een van de maker), een jaar lang, en het ene staat op slot zolang het andere
      tikt; lekt er iets van het ene in het andere, dan faalt hij op die plek.
    - **Wat het kost:** een spel dat nu bewaard is, laadt daarna niet meer, want de vorm van het spel verandert (het menu
      zegt het; `T.OPSLAAN_INSTELLINGEN.versie` gaat omhoog). Omzetten kan ook, als je een spel wilt houden.
    - **Wat het later makkelijk maakt** (inzicht): met een eigen schout per dorp komt stap 1b vanzelf goed. Een schout in
      code loopt in zijn dorp zoals jij in het jouwe, de inner loopt met hem mee, en wie een voorval heeft, zoekt hem. En de
      bouwer uit de speeltest kiest al van gehucht tot dorp (wanneer een erf, een houthakker, een kapel): zijn keuzes kunnen
      het begin van de eerste tegenspeler worden.
    Klaar als: `S` is het spel, met een lijst dorpen; alles van een dorp staat in dat dorp; een dag kost een fractie van nu;
    de speeltest speelt letter voor letter hetzelfde jaar; de toets met twee dorpen is groen; `npm test` groen. Dan kan het
    buurdorp (stuk 3) erbij zonder dat er een regel verandert. Vragen: **A**, een dorp waar je niet bent, leeft met
    poppetjes, alleen niet getekend? **B**, zo bij elkaar, met een eigen schout per dorp? **C**, van het buurdorp hoor je
    niets vanzelf, en je balk blijft over je eigen dorp gaan? En mag een spel dat je nu bewaard hebt, vervallen?
    **Beantwoord (Marcel, 30 sep): "A ja B ja C ja, oud spel mag vervallen".** Een dorp waar je niet bent, leeft met
    poppetjes, alleen niet getekend; alles van een dorp komt bij elkaar, met een eigen schout per dorp; van het buurdorp
    hoor je niets vanzelf, en je balk blijft over je eigen dorp gaan; en een spel dat nu bewaard is, mag vervallen (de
    versie van het opslaan gaat omhoog, zonder omzetten). Stap 1, de snellere dag, begint.
    **Gebouwd (30 sep, negentiende sessie):** stap 1, 2 en 3; zie onder Af. Het plan voor stuk 3 is vraag 72.
72. **Stuk 3 van het land: het buurdorp, het plan** (Claude, 30 sep, negentiende sessie; vraag 69, stuk 3; wacht op
    Marcel). Wat er nu is, na stuk 2: er kunnen twee dorpen naast elkaar leven (`S.dorpen`, `js/dorp.js`), elk met zijn
    eigen kaart, mensen en voorraad; een dorp waar je niet bent, leeft met poppetjes; een ander dorp spreekt niet tegen
    jou; en `test/dorpen.test.cjs` bewijst het met jouw gehucht en een van de maker. Wat er nog niet is, nagekeken:
    - **Dezelfde namen.** Een gehucht van de maker heeft dezelfde vijf boeren (Klaas, Aaltje, Gerrit, Trijn, Wouter) en
      dezelfde herbergierster als het jouwe, want hun naam staat één keer in `T.MENSEN`. De andere bewoners krijgen al
      een eigen naam uit het lot van hun dorp.
    - **Zijn schout is een schout zoals jij:** op de kaart van de maker staat een schout, van dezelfde soort als jij, dus
      aan jouw kant in een gevecht.
    - **Het land heeft plaats voor één gehucht:** de andere provincies zijn het kasteel, de stad en wildernis.
    - **De dobbelsteen:** een paar dingen gebruiken nog `Math.random` (het dwalen, een nieuw poppetje, de tekening van
      een nieuw huis), dus verandert jouw dorp een beetje zodra er een buurdorp naast leeft. Met eigen dobbelstenen per
      dorp blijft jouw dorp hetzelfde, met of zonder buur.
    - **Opslaan:** een spel met twee dorpen is zo'n 750 kB; zes plekken in de browser (5 MB) worden dan krap.
    - **Wat jij doet:** de rovers en de inner kijken of jij vecht of met de inner praat (`S.modus`); in een ander dorp
      mag dat niet meetellen (daar wacht een aanval nu tot jouw gevecht thuis voorbij is).
    Voorstel:
    - **A, het buurdorp ligt in een eigen provincie, twee tot vier dagen reizen van jou**, met een gehucht van de maker
      uit zijn eigen zaad, en eigen mensen: zijn boeren en zijn herbergierster krijgen een naam uit het lot van hun dorp.
      Het heet naar een naam uit dezelfde lijst als die van jouw dorp (vraag 60). Wat je nog niet zag, is donker: je
      moet het vinden.
    - **B, zijn schout is een poppetje dat nog niets beslist** (dat is stap 1b): hij woont in zijn huis, loopt zijn dorp
      rond zoals een boer, en spreek je hem aan, dan zegt hij wie hij is ("Je bent ver van huis, schout van ...").
      Hij is niet van jouw kant in een gevecht. Zijn voorvallen beslist zijn raadsman, die het dorp zelf kiest (de
      eerste uit zijn kandidaten, zoals `T.raadsmanKandidaten` ze loot); nu heeft een ander dorp er nog geen, en gaan zijn
      voorvallen voorbij.
    - **C, erheen:** je reist over de kaart van het land (de spelregel Land gaat vanzelf aan met een tegenspeler), en
      komt het buurdorp binnen over zijn weg. Je balk blijft over je eigen dorp gaan (vraag 71, C), en je eigen dorp leeft
      door. Terug gaat zoals nu.
    - **D, bij Nieuw spel kies je 0 of 1 tegenspeler**, naast de naam van je dorp. Met 0 speelt het spel zoals nu, en
      bewijst de speeltest dat letter voor letter; met 1 is er een buurdorp. Voorstel: 0 als standaard, tot zijn schout
      in stap 1b iets doet, want een buurdorp dat niets doet, is voor een tester een verrassing zonder reden.
    - **E, dezelfde heer en dezelfde inner:** hij vraagt het buurdorp wat hij het jouwe vraagt, en de inner komt er ook.
      Voorlopig komt hij op Sint-Maarten in beide dorpen op dezelfde dag; een ronde van dorp naar dorp (vraag 63: dan
      kan hij vertellen wat de ander gaf) komt later.
    - **Wat je niet ziet:** elk dorp een eigen dobbelsteen, en een bewaard spel dat kleiner is (vier vijfde is de kaart;
      de grond van een gehucht van de maker ligt vast in zijn zaad, of het geheel kan samengeperst: eerst meten).
    Klaar als: met 1 tegenspeler ligt het buurdorp ergens in het land, met eigen namen, en kun je erheen reizen en er
    rondlopen, terwijl het leeft en jouw dorp thuis ook; met 0 speelt de speeltest letter voor letter hetzelfde jaar; een
    spel met twee dorpen gaat mee in het opslaan; `npm test` groen. Vragen: **A**, zo, twee tot vier dagen verderop en met
    eigen namen? **B**, zijn schout een poppetje dat nog niets beslist? **C**, erheen zoals naar elke provincie? **D**, 0
    of 1 tegenspeler bij Nieuw spel, met 0 als standaard tot stap 1b? **E**, dezelfde heer en inner, voorlopig op
    dezelfde dag?
73. **Het concept: de schout als de manier waarop je bestuurt** (Marcel, 30 sep, negentiende sessie: een concept van 15
    bladzijden, "De Schout: Game Concept & Mini GDD", met "Ik denk dat we hiermee een goede kant opgaan"; wacht op
    Marcel). Wat erin staat en hoe het naast ons spel ligt: `concept.md`. Kort: zijn regel is dat wat in een
    managementspel één klik is, hier via een persoon, een plek, een papier of een handeling in de wereld gaat, en zijn
    toets is of je na een uur denkt "ik moet even gaan kijken wat daar aan de hand is". Veel ervan is er al (het
    poppetje, de voorvallen, de raadsman, de herberg, de proef als eerste versie), maar de toets haalt het spel nu niet:
    lopen doe je voor klusjes (bouwen kan alleen waar de schout staat), en om iets te weten of te beslissen hoef je
    nergens heen: wie een voorval heeft, loopt naar jou, de balk zegt elk getal precies, en de wetten gaan van overal
    (verbeterd: eerst stond hier dat ook bouwen van overal gaat). Alleen de inner
    haalt hem (wat hij ziet, hangt af van waar hij staat). Het schuurt met het land: het concept zegt klein en diep,
    zonder grote wereld of diplomatie, in de eerste versie.
    Voorstel (Claude): eerst de kern door de toets van één uur, met drie kleine stappen, en dan het buurdorp (vraag 72):
    - **A, het ochtendrapport:** de raadsman meldt 's ochtends wat er gisteren gebeurde en wat er opraakt; hoe beter hij
      rekent, hoe beter het rapport. Uit handen geven wordt groeien, en het is een weg uit de balk die volloopt.
    - **B, voorvallen met een oorzaak:** diefstal bij honger, koorts in een vol dorp, brand bij huizen dicht op elkaar,
      in plaats van vooral uit de lucht; het bericht zegt waarom.
    - **C, zelf gaan kijken:** bij rechtspraak het antwoord "Ik kom kijken": je loopt erheen, hoort of ziet meer, en
      beslist met meer kennis.
    - Later, als optie: wat je weet, is wat je zag (de voorraad in de balk is wat er het laatst geteld is).
    Vragen: **1**, is dit ons kompas (zijn regel en zijn acht principes), naast wat wij al hebben (de heer, de inner, de
    satire, de seizoenen)? **2**, eerst de kern door de toets, en dan het buurdorp? **3**, welke van A, B en C (voorstel:
    B, dan A, dan C)? **4**, is dit ook het antwoord op het dorp van bovenaf (vraag 65, C): niet bovenaf, want het
    poppetje is hoe je bestuurt?
    **Beantwoord (Marcel, 30 sep):** "We zetten eerst de kern goed neer. Ik wil meer naar management sim toe. Het zaaien
    wordt gewoon iets wat de boeren doen, zo ook het oogsten en de winter. Jij moet als schout wel een oogje in het zeil
    houden dat alles goed blijft verlopen. Godot hoeft niet, maar ik wil wel onderzoeken hoe groot een dorp / stad kan
    worden? A dit moet toch richting de dag verdeling van de pdf. Meerdere fasen op een dag. B goed idee. C zelf kijken is
    altijd een optie als je het niet vertrouwd of meer wil weten. 1. Als je bovenstaande bedoeld, Ja 2. Eens 3. Prima 4.
    Wat bedoel je hier". Dus: het concept is ons kompas; eerst de kern, dan het buurdorp; meer een management sim, waarin
    de boeren het seizoen doen en jij een oogje in het zeil houdt; B, dan A (de dag in fasen), dan C (zelf kijken kan
    altijd); en een meting van hoe groot een dorp kan worden. Wat besloten is, staat bovenaan in `concept.md`. Het plan:
    vraag 74. Vraag 4 is daar uitgelegd (d).
74. **De kern goed neerzetten: het plan** (Claude, 30 sep, negentiende sessie; vraag 73; wacht op Marcel). Wat er nu is,
    nagekeken: de voorvallen komen op gewicht en seizoen (`T.VOORVALLEN`), niet uit wat er in het dorp speelt; alleen de
    muizen (een volle schuur) en de wolven (schapen in de winter) hebben een oorzaak. De boeren maaien al zelf, en het
    zaaien gaat al vanzelf op 1 lentemaand. Wat jij doet: de velden kiezen (`V`: akker, weide of braak, en de mest), en op
    1 slachtmaand het slachten (een venster met een voorstel). Wat het dorp mist, weet het spel al (`D.behoeften.mist`:
    eten, brandhout, een kerk, bier).
    Voorstel, in deze volgorde:
    - **Stap 1, B: voorvallen met een oorzaak.** Vier oorzaken die je in het dorp kunt zien en zelf kunt veranderen:
      *honger* (het eten haalt het niet, of het rantsoen is krap), *kou* (het hout haalt de winter niet), *vol* (geen
      plaats meer in de huizen) en *onvrede* (het dorp is ontevreden). Diefstal, de stroper, de lening en de woeker komen
      van honger; de vechtpartij van onvrede; de koorts van kou en een vol dorp; de brand van een vol dorp (en in de
      winter, zoals nu). Met een oorzaak komt zo'n voorval drie keer zo vaak, zonder een kwart zo vaak (de getallen in de
      werkbank; op 1 en 1 speelt het zoals nu). Het bericht zegt waarom ("Er is gestolen. Er is honger: het rantsoen is
      krap"), en een gesprek kan het zeggen met `{oorzaak}`. De storm blijft uit de lucht; kansen, feesten, verzoeken en
      de grillen van de heer zijn geen problemen.
    - **Stap 2: de boeren doen het seizoen.** Elke boer kiest op 1 lentemaand zelf wat zijn velden worden, met één regel:
      een veld dat uitgeput raakt, rust een jaar, of krijgt mest als die er is. Het slachtvenster verdwijnt: de boeren
      slachten op 1 slachtmaand wat het voorstel zegt (zo weinig als kan, zodat het hooi de winter haalt), en het bericht
      zegt wat. Het veldenvenster (`V`) blijft, als je oogje in het zeil: het toont wat elke boer koos en waarom, en jij
      kunt het veranderen. Een spelregel "Het seizoen": de boeren (standaard) of jij (zoals nu). Later, met C: een boer
      met een slecht karakter maakt fouten, en dat merk je als je gaat kijken.
    - **Stap 3, A: de dag in fasen** (het plan komt als we daar zijn). Een schets: 's ochtends staat je raadsman aan je
      deur met wat er gisteren gebeurde, wat er opraakt en welke oorzaak er speelt (stap 1); overdag loop je, kijk je en
      spreek je mensen; 's middags is er zitting, waar de rechtszaken op je wachten in plaats van dat ze je achternalopen;
      's avonds hoor je in de herberg wat er speelt; 's nachts sluit de dag. De tijd staat alleen stil als iets je nodig
      heeft, zodat een stille dag op 30× voorbijgaat, en het jaar houdt zijn 360 dagen.
    - **Stap 4, C: zelf gaan kijken** kan altijd, bij elk voorval en bij het rapport: je loopt erheen en ziet hoe het
      echt zit. Een raadsman die slecht rekent, of een gierige, meldt het niet altijd goed.
    - **Ernaast: hoe groot kan een dorp worden.** Een meting, zonder iets te veranderen: met 26 tot 1.600 poppetjes wat
      een beeld kost aan de wereld en aan het tekenen, wat een dag kost, en hoe groot een bewaard spel wordt. **De
      uitslag** (30 sep; een agent, op een vaste kopie van `ad0b8b3`, met echte bewoners op erven en een grotere kaart
      naarmate het dorp groeit, op deze machine in de cloud: 4 trage kernen en Chromium zonder videokaart, een gewone pc
      is 1,5 tot 2 keer sneller):

      | mensen | kaart | wereld per beeld op 30× (gemiddeld, traagste 5%) | op 1× | een dag | bewaard | beelden per seconde, 1× en 30× |
      |---|---|---|---|---|---|---|
      | 26 | 76² | 0,17 en 2 ms | 0,03 ms | 1,2 ms | 385 kB | 60 en 59 |
      | 100 | 100² | 1,1 en 13 ms | 0,13 ms | 4 ms | 791 kB | 58 en 51 |
      | 200 | 128² | 6,9 en 72 ms | 0,4 ms | 8 ms | 1,4 MB | 53 en 41 |
      | 400 | 192² | 43 en 425 ms | 1,9 ms | 19 ms | 3,3 MB | 39 en 8 |
      | 800 | 256² | 283 ms en 2,8 s | 11 ms | 58 ms | 6,7 MB (past niet meer) | |
      | 1.600 | 384² | 15 s | | 149 ms | 18 MB (past niet) | |

      - Tot zo'n **150 mensen** speelt het vloeiend op 30×, en op 1× tot 300 à 400. Het gehucht zelf (76 bij 76 tegels)
        is vol bij 76 tot 102 mensen; de proef wil er 50.
      - **Het tekenen is geen grens:** alleen wat in beeld is telt (13 tot 16 ms per beeld bij elke grootte, hier zonder
        videokaart), en gebouwen kosten bijna niets (2.011 gebouwen: 0,7 ms per beeld).
      - **De grens is het zoeken van paden:** bij 1.600 mensen 99,6% van de tijd. In de ochtend- en avondspits zoekt
        iedereen tegelijk een pad (`T.dwaal` → `T.zoekPad`), en voor elke tegel die A* bekijkt, loopt `T.wezenOp` alle
        wezens af. Zo groeit het met het kwadraat: 0,4 ms per zoektocht bij 26 mensen, 13 ms bij 400, 392 ms bij 1.600. Op
        een lege kaart van 256 bij 256 kost een zoektocht naar een plek die je niet kunt bereiken een hele seconde.
      - **Opslaan:** de opslag van de browser (5 MB) is vol bij zo'n 600 mensen, want de kaart gaat mee (55 bytes per
        tegel); het opslaan zelf is bij 400 mensen al een beeld van 125 ms. Als bestand (Steam) valt die grens weg.
      - **Wat helpt, als het groter moet** (voor later, `opmerkingen.md`): wie waar staat per tegel bijhouden, zoals de
        voorwerpen sinds stuk 2; A* met een heap en getallen als sleutel; de vaste wegen (huis, werk, put, herberg)
        onthouden in plaats van elke dag opnieuw zoeken; en de kaart niet opslaan, want die komt uit het zaad of het
        bestand. Hoe groot het dan kan, meten we dan opnieuw, met `npm run grootte` (Marcel, 1 okt: "scripts bewaren").
        De grens zit in hoe we paden zoeken, niet in JavaScript of het tekenen: Godot is ervoor niet nodig.
    - **d, het dorp van bovenaf** (vraag 73, 4: "Wat bedoel je hier"). Op 29 sep stelde Claude voor dat je met één toets
      (`Tab`) de camera van de schout af tilt en over je dorp kijkt, om te bouwen en te plannen zonder te lopen (vraag 64,
      A); Marcel zei toen "nee niet bovenaf, ik denk hier nog over na" (vraag 65, C). Het concept kiest: geen oog van
      bovenaf, want dan ben je weer de god boven de stad. Wat je niet zelf ziet, hoor je (het rapport, de mensen) of ga je
      bekijken (C). Voorstel: zo. Wordt het dorp later groot, dan kan het overzicht een papier worden: een kaart van je
      dorp op tafel in je huis, waarop je bouwt en plant, en die laat zien wat je weet (voor later, `opmerkingen.md`).
    Klaar als (stap 1 en 2): een toets per oorzaak; zonder oorzaak komen de problemen zelden; de boeren kiezen hun velden
    en slachten zelf; met de getallen van B op 1 en de spelregel "Het seizoen" op jij speelt de speeltest letter voor
    letter hetzelfde jaar als nu; `npm test` groen. Vragen: **a**, B zo, met deze vier oorzaken? **b**, de boeren kiezen
    hun velden en slachten zelf, en jij kunt het in het veldenvenster veranderen, met de spelregel "Het seizoen"? **c**,
    het hout: sprokkelen de mensen het zelf in het bos, of blijft de houthakker iets wat jij bouwt? **d**, geen camera van
    bovenaf: de schout blijft in beeld, en het overzicht komt via rapporten en zelf kijken?
    **Beantwoord (Marcel, 30 sep):** "a ja b ja c zelf sprokkelen, maar lost niet volledig op. Houthakker is nodig d
    ja". Dus: B zoals voorgesteld; de boeren kiezen hun velden en slachten zelf, en jij kunt het veranderen; de mensen
    sprokkelen zelf hout, maar dat is niet genoeg voor de winter, dus een houthakker blijft nodig; en geen camera van
    bovenaf. Stap 1 (B) is het eerste werk, dan stap 2.
75. **De dag in fasen: het plan** (Claude, 30 sep, negentiende sessie; vraag 74, stap 3, A; Marcel bij vraag 73: "dit
    moet toch richting de dag verdeling van de pdf. Meerdere fasen op een dag"; wacht op Marcel). Wat er nu is: de dag
    heeft al delen (`T.dagdeelVan` in `js/dag.js`: nacht, ochtend, werk, schaft, avond), maar alleen voor de mensen van
    het dorp: zij halen 's ochtends water, werken, schaften en gaan 's avonds naar de herberg. De schout is de hele dag
    vrij. Een voorval loopt je tussen negen en twee uur achterna, en slapen doe je met `Z`. Voorstel, op die delen:
    - **'s Ochtends: het rapport van je raadsman.** Bij het opstaan (of als je thuiskomt) staat hij aan je deur met wat
      er gisteren gebeurde (wie kwam en wie ging, wat de boeren deden), wat er opraakt (de winter, het hout, het eten),
      welke oorzaak er speelt (stap 1: "Er is honger, want het rantsoen is krap") en wat er vandaag komt (de zitting, een
      bezoeker). Hoe goed het klopt, zegt zijn rekenen: wie slecht rekent, zit ernaast, en dan loont zelf kijken (stap
      4). Zonder raadsman geen rapport: dan ga je zelf rond (het concept: "Vroeger moest ik zelf naar de markt").
      Het is een papier, zoals de brief van de heer: een knop in de balk tot je het las, en de tijd staat stil zolang
      het open is. Op een dag zonder iets bijzonders is het één regel.
    - **Overdag: rondgaan.** Zoals nu: kijken, bouwen, praten. Een ramp (brand, wolven) komt je nog steeds halen.
    - **'s Middags, na het schaften: de zitting.** De rechtszaken (de diefstal, de vechtpartij, de akkergrens, de
      stroper, de heks, de woeker) lopen je niet meer achterna, maar wachten bij je huis tot je zitting houdt. Ben je er
      niet, dan wachten ze tot morgen; na twee dagen beslist je raadsman, of het gaat voorbij, zoals nu.
    - **'s Avonds: de herberg.** Wat er speelt, hoor je daar eerder dan in het rapport: de herbergierster vertelt wie er
      klaagt, met de oorzaken van stap 1 als gepraat ("Ze zeggen dat het rantsoen krap is"), en de roddelaar wat hij
      zag, zoals nu.
    - **'s Nachts** slaap je; het spel slaat 's ochtends op, zoals nu.
    - De tijd staat alleen stil als iets je nodig heeft: een stille dag gaat op 30× voorbij zoals nu. Zo krijgt de dag
      een route (thuis, rond, thuis voor de zitting, de herberg), en wordt het dorp groter, dan wordt die route langer:
      daar is de raadsman voor.
    Klaar als: het rapport, de zitting en het gepraat in de herberg werken, met toetsen; een voorval dat geen rechtszaak
    is, gaat zoals nu; met de spelregels op "zoals vóór 30 sep" speelt de speeltest letter voor letter hetzelfde jaar;
    `npm test` groen. Vragen: **a**, het rapport zo, aan je deur, met zijn rekenen erin, en zonder raadsman geen rapport?
    **b**, de zitting zo, na het schaften bij je huis, voor de rechtszaken? **c**, de herberg zo, met de oorzaken als
    gepraat? **d**, in die volgorde: a, dan b, dan c?
    **Beantwoord (Marcel, 1 okt):** "A Ja dat is goed. b zitting als die er zijn. C herberg als 1 van de mogelijkheden om
    dingen op te vangen. Later ook door je eigen mensen die iets horen op straat. D prima". Dus: het rapport zoals
    voorgesteld; een zitting alleen op een dag dat er rechtszaken zijn; de herberg als een van de plekken waar je dingen
    opvangt (en later ook je eigen mensen die iets horen op straat, `opmerkingen.md`); en in die volgorde: eerst het
    rapport (3a), dan de zitting (3b), dan de herberg (3c).
    **Hoe 3a gebouwd wordt** (Claude, 1 okt; uitgezocht, nog niet gebouwd):
    - **Een eigen bestand,** `js/ochtendrapport.js`, na `js/raadsman.js` in `index.html`, met `T.OCHTENDRAPPORT_INSTELLINGEN`
      (in de werkbank) en de spelregel "Het rapport" (aan of uit; uit is zoals vóór 1 okt). Niet `T.maakRapport`
      noemen: dat is het rapport van de inner (`js/inner.js`).
    - **Wat er gebeurde,** houdt het dorp bij in een klein dagboek: `T.wijzigBevolking` (`js/gebouwen.js`, de enige weg)
      schrijft elke verandering erin (`D.dagboek`: dag, verschil, reden, waarom), en het rapport leest wat er sinds het
      vorige rapport in kwam en maakt het dagboek leeg. Zo staat het ook in een bewaard spel.
    - **Het rapport ontstaat op de dagtik** (`T.tikOchtendrapportDag`, als laatste stap van `T.tikGebouwenDag`), alleen
      met een raadsman (`T.raadsmanVan`), in `D.ochtendrapport` ({ dag, door, regels, gebracht, gelezen }). Wat erin
      staat, zo kort mogelijk, en op een dag zonder iets bijzonders één regel ("Niets bijzonders, heer schout."):
      wie er kwam, stierf of wegtrok (uit het dagboek, met het waarom); wat er in de schuur ligt (graan, hout) en in de
      kist; of het hout en het eten de winter halen, zodra die binnen `winterVooraf` dagen is (zoals de raad,
      `js/raad.js`); welke oorzaak er speelt (`T.OORZAKEN`); en wat er komt (de raden `inner`, `rovers` en `heerGoud`
      uit `T.RADEN`, zonder de `[B]`).
    - **Zijn rekenen** (`T.vaardighedenVan`): goed is precies, niets is afgerond op vijf, slecht zit er tot 30% naast
      (geloot per dag, met `T.dobbelsteen`, zodat de speeltest hetzelfde jaar speelt). Het geldt voor de getallen
      (voorraad en de dagen van de winter), niet voor wie er kwam of ging.
    - **Hij brengt het:** 's ochtends is zijn plek de deur van de schout (`T.dagAnker` in `js/dag.js`, in plaats van de
      put), tot hij het gaf. Staat de schout binnen twee tegels en lopen ze geen van beiden, dan opent het rapport
      (`T.werkOchtendrapportBij`, vanuit `T.werkDorpBij` in `js/dorp.js`). Was je er niet, dan gaat hij aan het werk, en
      ligt het rapport klaar.
    - **Het papier:** het venster van de brieven (`js/brieven.js`), met een soort `rapport`: `venster()` krijgt een eigen
      titel ("Het rapport van Klaas") en groet ("Klaas, uw raadsman"); de knop Brief heet "Rapport" zolang er een
      ongelezen rapport ligt, en opent het. De speler van de speeltest sluit een open brief al vanzelf.
    Klaar als: toetsen voor het dagboek, de inhoud, het rekenen en het brengen; met `--regel rapport=uit` speelt de
    speeltest letter voor letter hetzelfde jaar; `npm test` groen.
    **Bij het nakijken** (Claude, 1 okt, twintigste sessie; Marcel: "a ja b ja c ja"): drie dingen die het plan raken.
    - **a. Hij komt te laat.** De boeren wonen 16 tot 27 stappen van de deur van de schout (gemeten in het gehucht): bij
      1,5 tegel per seconde is dat 0,9 tot 1,5 uur speltijd, en de ochtend (opstaan tot het werk) duurt precies een uur.
      Wie wakker wordt en op pad gaat, ziet hem nooit. Voorstel: de raadsman staat een uur eerder op dan de rest, en
      staat al aan je deur als je wakker wordt.
    - **b. De balk verraadt hem.** De balk zegt de voorraad precies (`T.ui.toonVoorraad`): zegt een raadsman die niet
      kan rekenen "zo'n 150 graan" naast een balk met 118, dan zie je het meteen, en loont zelf kijken niet. Voorstel:
      het rapport zegt wat de balk niet zegt: hoe het gaat ("het graan: 12 minder dan gisteren") en hoe lang het duurt
      ("het hout haalt 60 van de 90 winterdagen"), en zijn rekenen werkt op die vooruitblik, niet op wat er ligt.
    - **c. Niemand ziet het.** Een nieuw spel begint zonder raadsman (je kiest er een met `R`), en zonder raadsman
      geen rapport: een tester komt het dus nooit tegen. Voorstel: de raad onder het doel zegt het de eerste dagen
      ("Een raadsman brengt je elke ochtend een rapport: kies er een [R]"), alleen met de spelregel "Het rapport" aan.
    Verder zonder vraag, want het staat in het plan dat Marcel koos ("wat de boeren deden"): het rapport zegt ook wat de
    boeren uit zichzelf deden (hun velden kiezen, slachten) en wat de raadsman zelf besliste, uit hetzelfde dagboek. En
    de speler van de speeltest moet het rapport van een brief van de heer onderscheiden: hij schrijft nu bij elke open
    brief de eis van de heer op.
    **Gebouwd** (1 okt, twintigste sessie; zie onder Af), met a, b en c.
76. **Het rapport zegt bijna elke dag hetzelfde** (Claude, 1 okt, twintigste sessie; de speeltest na 3a, in
    `speelbaar.md`; wacht op Marcel). Bij de bouwer staat "Er is honger, want er is niet genoeg eten." in twee van de drie
    rapporten (393 tot 532 van de 610 tot 748 in twee jaar), en vanaf herfstmaand elke dag de winter; een stille dag kwam
    20 tot 44 keer voor. Het klopt (zijn dorp heeft bijna altijd honger), maar wie het elke dag leest, leest er overheen,
    en het concept wil "alleen ingrijpen als er iets afwijkt". Vragen: **a**, een oorzaak alleen zeggen als hij begint of
    ophoudt ("Sinds gisteren is er honger", "De honger is voorbij"), en zolang hij duurt één keer per week ("Er is nog
    steeds honger, al twaalf dagen")? **b**, de winter net zo: alleen als het getal flink verandert, en anders één keer
    per week? **c**, nu, vóór de zitting (3b), of later, als je het zelf gespeeld hebt?
    **Beantwoord (Marcel, 1 okt):** "a ja b ja c nu. We gaan ook eerst verder 3b kan later. Laten we eerst eens een
    speelbaar spel maken van begin tot eind". Dus: a en b nu; de zitting (3b) en de herberg (3c) wachten; en daarna eerst
    een spel dat van begin tot eind te spelen is (het plan daarvoor is vraag 77). En als richtlijn (Marcel, 1 okt):
    "Honger, droogte of een plaag, moet een status zijn" (in `CLAUDE.md` en `spel.md`). **Gebouwd** (1 okt, twintigste
    sessie; zie onder Af).
77. **Een speelbaar spel van begin tot eind: de vertical slice** (Claude, 1 okt, twintigste sessie; Marcel: "Laten we
    eerst eens een speelbaar spel maken van begin tot eind", "Gebruik de slice in de pdf", en als richtlijn "Honger,
    droogte of een plaag, moet een status zijn ... Iets wat begint en eindigt. Mogelijk in verschillende niveaus"; wacht
    op Marcel). Het eerste voorstel (één bestuursjaar als een heel spel, met het oordeel van de heer) is hieronder stap
    1 geworden. **De slice naast ons spel:**

    | De slice | Wat er is | Wat ontbreekt |
    |---|---|---|
    | Eén kleine stad, 100 tot 200 mensen | een gehucht van 26 dat een dorp wordt bij 50 (de bouwer haalt 74) | de stad: het gehucht (76 bij 76 tegels) is vol bij 76 tot 102 mensen, en het spel loopt vloeiend tot zo'n 150 op 30× (vraag 74) |
    | Markt, woonwijk, ambachtswijk, raadhuis, kerk, stadspoort | huizen en erven, de werkplaatsen (smidse, molen, bakker, brouwer, ...), de kapel; de markt, het raadhuis en de stadsmuur met poort staan in `T.GEBOUWEN` | dat de markt, het raadhuis en de poort iets doen; nu komen ze pas met marktrecht of de stad, en doen ze niets |
    | Dag en nacht | ja, met het ritme van de mensen | |
    | Voedsel en economie | graan, melk, kaas, vlees, hout, goud, de marskramer, de belasting, de heer | prijzen, en een markt waar je ze ziet |
    | Wacht en misdaad | het wachthuis en de militie tegen de rovers; diefstal, de stroper, de heler en de woeker als voorvallen | misdaad als status (een misdaadgolf), een wacht die patrouilleert, het gevang |
    | 3 of 4 ambtenaren | de raadsman, met zijn rapport | twee of drie anderen, elk met een eigen terrein en een eigen rapport |
    | 10 tot 20 mensen met echte banden | de vijf boeren met een karakter en aanzien, de herbergierster, de roddelaar, de heer, de inner, de marskramer | wat ze van jou vinden (vertrouwen), en wat ze van elkaar vinden |
    | Een paar bouwprojecten | erven, de kapel, de smidse, de houthakker, het wachthuis, en meer | |
    | 5 tot 10 soorten gebeurtenissen | 35 voorvallen, de rovers, de heervaart, de inner, de heer, de marskramer | crises als status met niveaus: droogte, een ziekte, een brand, een misdaadgolf (`concept.md`, p.10) |
    | Eén volledig speelbare bestuurlijke cyclus | het jaar, met de heer op Sint-Maarten | een eind: winnen kan na zes maanden, en wie doorspeelt, verliest alles (vraag 59) |

    **Voorstel: we groeien naar de slice toe, met een eind per jaar.** Je begint zoals nu, als schout van een gehucht, en
    het spel gaat over gehucht, dorp en kleine stad (de stad van de slice) in een paar bestuursjaren; elk jaar eindigt
    met het oordeel van de heer. Zo blijft wat er is en getest werd, en is groeien meer verantwoordelijkheid (het
    concept: "Uit handen geven is groeien"): de ambtenaren komen als het dorp groeit. Het andere: meteen beginnen als
    schout van een kleine stad van 100 mensen, zoals het concept zelf, met een nieuwe kaart en alles er tegelijk. In
    stappen, elk eerst een plan voor Marcel, en na elke stap de speeltest:
    - **Stap 1, de cyclus: een jaar met een eind.** De heer oordeelt op 1 lentemaand: een dorp (pas dan geteld, vraag 59,
      A) is een trede verder; geen dorp maar je ambt en je mensen nog: nog een jaar; je ambt kwijt, gevallen of
      uitgestorven (minder dan tien mensen): verloren. Het eind laat het jaar in het kort zien (wie kwam, stierf en
      wegtrok, wat de heer kreeg, de voorvallen en wat je koos; de afrekening, vraag 49). En een jaar dat te winnen is
      (vraag 59, B en C): geen gezin als het hout of het eten de winter niet haalt, de raad zegt waar goud vandaan komt,
      en in de lente verkoopt de marskramer zaaigraan. Daarna is het spel al van begin tot eind te spelen, als gehucht.
    - **Stap 2, statussen met niveaus** (de richtlijn): wat een tijd duurt, is een status met een begin, een eind en
      niveaus, te zien in de balk zolang hij duurt (sinds wanneer, waarom, wat helpt), en het rapport zegt het begin, het
      erger of minder worden en het eind. Eerst wat er is (honger en hongersnood, kou en strenge kou, vol en overvol,
      onvrede en onrust), dan de crises uit het concept: droogte en ernstige droogte (de akkers geven minder), een ziekte
      (wie ziek is, werkt niet), een brand, elk met een oorzaak die je kon zien. Samen met de voorvallen de 5 tot 10
      soorten gebeurtenissen van de slice.
    - **Stap 3, ambtenaren:** naast de raadsman twee of drie, elk met een terrein en een rapport: een marktmeester (de
      markt, de prijzen), een wachtmeester (de wacht, de misdaad) en een rentmeester (het geld, de belasting, wat de heer
      vraagt). Je kiest ze uit je mensen, zoals de raadsman, en wat ze kunnen, kleurt hun rapport.
    - **Stap 4, wacht en misdaad:** een wacht die patrouilleert, misdaad als status (een misdaadgolf), en het gevang.
    - **Stap 5, mensen met banden:** 10 tot 20 mensen (de boeren, de ambtenaren, de herbergierster, de smid, ...) met
      wat ze van jou vinden (vertrouwen) en van elkaar, dat verandert door wat je beslist en terugkomt in wat ze doen.
    - **Stap 6, de kleine stad:** de markt, het raadhuis en de poort die iets doen (de markt met prijzen en kramen die je
      ziet, het raadhuis waar de ambtenaren zitten, de poort waar alles binnenkomt), een kaart met plaats voor 200
      mensen, en het zoeken van paden sneller, zodat 200 mensen vloeiend lopen (vraag 74).
    Vragen: **a**, groeien naar de slice (gehucht, dorp, kleine stad, in een paar jaar), of meteen beginnen als kleine
    stad? **b**, de statussen zo, met niveaus, in de balk en in het rapport? **c**, welke ambtenaren: de marktmeester, de
    wachtmeester en de rentmeester? **d**, in deze volgorde, en beginnen met stap 1, de cyclus?
    **Beantwoord (Marcel, 1 okt):** "A we starten vanaf de slice kwa afmeting een gehucht met 50 is echt te klein. B Ja,
    er komt later ook ui met status overzicht en laatst bekende inventarisatie. C ja, uiteindelijk ambtenaar voor alle
    'takken' van overheid om je te ondersteunen. D prima". Dus:
    - **a, we beginnen als gehucht en groeien naar de maat van de slice** (Marcel, daarna: "Nee, we starten wel als
      gehucht"; Claude las het eerst als "beginnen als stad"): je begint zoals nu, en het doel is een kleine stad van 100
      tot 200 mensen; een dorp van 50 is als doel te klein. Het dorp blijft een trede onderweg. **Het plan voor stap 1
      begint dus met de vraag** welke doelen de heer per jaar stelt op weg naar die stad (het dorp, en dan de stad), en
      wat hij op 1 lentemaand beoordeelt. De kaart met plaats voor 200 mensen en sneller paden zoeken blijven stap 6.
      En verder (Marcel, 1 okt): "Uiteindelijk is het doel wel een stad die mogelijk 5000+ inwoners heeft". Dat vraagt
      bij stap 6 meer dan snellere paden: niet iedereen loopt altijd zijn eigen pad (`opmerkingen.md`).
    - **b, statussen met niveaus,** en later een scherm met een overzicht van de statussen en **de laatst bekende
      inventarisatie**: wat je weet, is wat er het laatst geteld werd (door jou of een ambtenaar), niet wat er nu ligt.
      Dat past bij "informatie is een grondstof" (`concept.md`) en bij wat het rapport liet zien: de balk die alles
      precies zegt, maakt zelf kijken overbodig (vraag 75, b).
    - **c, uiteindelijk een ambtenaar voor elke tak van het bestuur,** om je te steunen; de marktmeester, de
      wachtmeester en de rentmeester eerst.
    - **d, deze volgorde,** te beginnen met stap 1, de cyclus.
78. **Stap 1 van de slice, de cyclus: het plan** (Claude, 1 okt, eenentwintigste sessie; vraag 77, a en d; wacht op
    Marcel). **Wat er nu is:** één trede, van gehucht tot dorp bij 50 mensen met een kapel en een smidse, die op elk
    moment valt. De bouwer van de speeltest haalt hem op 1 herfstmaand van het eerste jaar, vóór de heer en de winter,
    en verliest daarna in de winter de helft van zijn mensen (vraag 59). Na het dorp is er geen doel meer, en geen eind
    behalve verliezen: je ambt kwijt op Sint-Maarten, of de schout die valt. Een dorp kan uitsterven tot één mens, en
    speelt dan door. Het plan, in vier delen:
    - **A, de ladder van de heer: elk jaar één doel, drie treden.** De heer stelt per jaar één doel, het eerste in zijn
      benoemingsbrief en het volgende in zijn brief op 1 lentemaand. Hij wil groei, want groei levert hem geld op:

      | Jaar | Het doel van de heer | Wat het opent |
      |---|---|---|
      | 1 (1323) | een dorp: 50 zielen, een kapel en een smidse (zoals nu) | de gebouwen van een dorp, en de heervaart |
      | 2 (1324) | marktrecht: 75 zielen, een molen en een bakkerij | de gebouwen met marktrecht, met de markt |
      | 3 (1325) | een kleine stad: 100 zielen en een markt | gewonnen: het eind van het spel |

      De molen en de bakkerij omdat ze van de heer zijn, een banmolen en een banoven: wie maalt of bakt, betaalt hem (hij
      vraagt er nu al 5 en 3 goud voor op Sint-Maarten). "Wij verwachten een molen en een oven. Onze molen en Onze oven,
      uiteraard." De getallen staan in de werkbank, en de ladder is een lijst: een trede erbij is een regel erbij.
      Waarom 75 en 100 en niet meer: de kaart van nu is vol bij 76 tot 102 mensen (vraag 74); met de kaart voor 200
      (stap 6) gaat het laatste doel omhoog. Een heel spel duurt dan drie jaar, op 30× zo'n uur per jaar, met wat je
      stilzet erbij. Wat opviel bij het nalopen:
      - **De molen en de bakkerij kosten nu eten.** Ze maken meel en brood van graan, en brood telt niet als eten
        (alleen graan, kaas, vlees en melk; vis, eieren en groente ook niet). Wie het doel van het tweede jaar haalt,
        heeft dus minder te eten. Voorstel: brood is eten, en vult beter dan het graan waar het van komt (een brood als
        anderhalf graan, in de werkbank). Dan is het doel ook wat een groter dorp nodig heeft om te eten: de akkers van
        het gehucht voeden zo'n 25 mensen, de rest komt van het vee, de jager en straks de bakker.
      - **De markt doet nog niets** (dat komt in stap 6, met het graan van buiten dat Marcel op 26 sep koos). Daarom
        het andere voor het laatste doel: **stadsrechten kopen.** Met 100 zielen biedt de heer je stadsrechten aan,
        voor 100 goud (werkbank), en wie betaalt, is vrij en wint ("Vrij word je door stadsrechten te kopen",
        `CLAUDE.md`). Dan wordt het laatste jaar rijk worden en arm lijken: honderd goud sparen, terwijl de heer elk jaar
        15% wil van wat de inner in de kist telt. De markt, het raadhuis en de poort bouw je daarna, als je verder speelt.
    - **B, het oordeel op 1 lentemaand, na de winter.** Een trede telt pas dan (vraag 59, A): heb je het doel gehaald en
      gehouden tot na de winter, dan schrijft de heer, en geeft hij het volgende doel. Zo telt de winter mee, en wint
      groei alleen niet: wie tot 74 groeit en er 50 verliest, haalt het niet. Wie het doel vroeg haalt, ziet het vinkje
      linksboven, met "de heer telt op 1 lentemaand". Niet gehaald, maar je ambt en je mensen nog: nog een jaar, met
      hetzelfde doel; twee keer achter elkaar niet: je ambt kwijt, zoals twee keer veel te weinig op Sint-Maarten.
      Verloren ook als de schout valt, en als er minder dan tien mensen over zijn (de heer geeft het dorp op). Gewonnen:
      de laatste trede. Alle eindes krijgen één scherm, met het jaar in het kort; wie wint, kan verder spelen.
    - **C, het jaar in het kort, onder de brief.** Geen afrekening met twee boeken (die blijft geparkeerd, vraag 49),
      maar een paar regels onder de brief van 1 lentemaand: hoeveel zielen bij het begin en nu, wie kwam, stierf
      (waaraan) en wegtrok, wat er gebouwd werd, wat de heer op Sint-Maarten kreeg, en hoeveel voorvallen je zelf
      besliste, je raadsman besliste of voorbij gingen. Uit hetzelfde dagboek als het rapport, opgeteld in een jaarboek
      (in `S`, dus bewaard).
    - **D, een jaar dat te winnen is** (vraag 59, B en C; geparkeerd, maar nu nodig, want anders haalt ook de bouwer het
      eerste doel niet): geen gezin als het hout of het eten de winter niet haalt, vanaf drie maanden ervoor (de raad
      zegt waarom; een spelregel, standaard aan); de raad zegt waar goud vandaan komt als het doel goud vraagt; en de
      marskramer verkoopt in de lente zaaigraan, zodat een dorp na een slechte winter weer boven kan komen.
    **In deze volgorde,** elk met toetsen: 1a de ladder en het oordeel, met de eindes; 1b het jaar in het kort; 1c een
    jaar dat te winnen is, met brood als eten; 1d de speeltest: de bouwer speelt tot het eind (drie jaar, of tot hij
    verliest), met een plan voor elke trede, en de vier anderen een jaar, zoals nu.
    **Klaar als** de heer op 1 lentemaand oordeelt (gehaald, nog een jaar, ontslagen, gewonnen), met het jaar in het
    kort eronder; de ladder in de werkbank staat; elk eind hetzelfde scherm heeft; opslaan en laden midden in een jaar
    hetzelfde oordeel geeft; `npm test` groen is; en de speeltest zegt hoe ver de bouwer komt.
    Vragen: **a**, deze ladder (een dorp, marktrecht, een kleine stad; 50, 75 en 100 zielen), met brood als eten?
    **b**, het laatste doel: een stad tellen (100 zielen en een markt), of stadsrechten kopen (100 zielen en 100 goud)?
    **c**, niet gehaald: één jaar erbij, en dan je ambt kwijt; en onder de tien mensen is het uit? **d**, het jaar in
    het kort onder de brief, en een jaar dat te winnen is zoals in D?
    **Beantwoord (Marcel, 1 okt):** "a Nee, de heer moet alleen betaald worden, en hij mag wel eisen stellen. Maar meer
    om het je moeilijk te maken. B einddoel is totale verovering van de wereld C het einddoel wordt dat mensen super
    gelukkig zijn en in al hun wensen zijn voorzien. Denk aan eisen van mensen zoals in anno 1602 D dat is prima E let
    op, we moeten een manier zoeken zodat we toch 5k man kunnen hebben". En erna: "Eerder gaf je het idee om een aantal
    mensen gewoon een vast pad te geven wanneer ze niet in het zicht zijn" (`opmerkingen.md`, de 5.000). Dus:
    - **a, de heer stelt geen doelen:** hij wil betaald worden, en zijn eisen zijn er om het je moeilijk te maken. De
      ladder van de heer gaat niet door, en daarmee ook het oordeel op 1 lentemaand en "niet gehaald".
    - **B en C, het einddoel:** de hele wereld veroveren, en je mensen super gelukkig, in al hun wensen voorzien, met
      eisen zoals in Anno 1602. Hoe die twee samengaan, is vraag 79, a.
    - **D, prima:** het jaar in het kort, en een jaar dat te winnen is (vraag 59, B en C, en zaaigraan).
    - **E, 5.000 man moet kunnen:** buiten zicht een vast pad, en meer (vraag 79, D).
    Het nieuwe plan is vraag 79.
79. **De wensen van de mensen, de heer die het moeilijk maakt, en 5.000 man: het plan** (Claude, 1 okt,
    eenentwintigste sessie; na Marcels antwoord op vraag 78; wacht op Marcel). **Wat het antwoord verandert:** de heer
    stelt geen doelen meer, en het eind van het spel is de hele wereld veroveren (B) en je mensen super gelukkig (C).
    Veroveren kan pas als het land en de tegenspelers er zijn (vraag 61 tot 63, 72); gelukkige mensen kan in één stad.
    **Voorstel: in de slice is "iedereen super gelukkig" het eind, en veroveren komt erbij met het land.**
    **Wat er al is:** een huis groeit door als het hele dorp dertig dagen tevreden genoeg is (70%): een hut wordt een
    huis, een huis een stenen huis (`js/behoeften.js`). Die tevredenheid is één getal voor het hele dorp, uit het eten (en
    of er groente, vis of vlees is), het brandhout, de kapel, de herberg, de wetten, de voorvallen en de heer. En vier
    werkplaatsen maken iets wat niemand gebruikt: de molen (meel), de bakkerij (brood), de weverij (laken) en de kuiper
    (vaten). In Anno zijn de wensen precies waar zulke ketens voor zijn.
    - **A, wensen per stand, per huis.** Elk huis heeft een stand, en elke stand wil iets: goederen die het huis
      gebruikt, en plekken in de buurt (gemeten met de looptijd vanaf de deur, `T.looptijdVan`). Heeft een huis een
      maand lang alles wat zijn stand wil, dan groeit het door naar de volgende stand, met meer mensen en meer belasting;
      mist het iets, dan wordt het ontevreden, en ten slotte trekt het weg. Zoals nu, maar per huis en met eigen wensen,
      in plaats van één getal voor het hele dorp. De tevredenheid van het dorp wordt het gemiddelde van zijn huizen,
      zodat alles wat er nu naar kijkt (de groei, het werk, de voorvallen, de raad), blijft werken. Een eerste voorstel,
      op de huizen die er zijn:

      | Stand | Huis | Gebruikt | Wil in de buurt |
      |---|---|---|---|
      | keuters | hut | eten; brandhout in de winter | een put |
      | dorpelingen | huis | daarbij bier, en vlees of vis | een kapel en de herberg |
      | ambachtslieden | stenen huis | daarbij brood en laken | een markt |
      | poorters | nieuw: twee lagen, in baksteen | daarbij zout | een badhuis en een gasthuis |

      Wat een stand wil, komt in het bouwmenu als er genoeg mensen zijn in de stand eronder, zoals in Anno: zo gaan de
      treden (gehucht, dorp, marktrecht, stad) op in de standen, en komt wat je mag bouwen met je mensen, niet met een
      brief van de heer. **Super gelukkig** is: al je huizen in de hoogste stand, met alles wat ze willen (hoeveel er
      moeten, staat in de werkbank). Dan heb je gewonnen, en kun je verder spelen. Wat een huis mist, zie je eerst in de
      wereld (een teken bij de deur, zoals het uitroepteken) en hoor je van je raadsman, niet eerst in een tabel.
    - **B, de heer maakt het moeilijk.** Hij wordt betaald op Sint-Maarten, zoals nu, en zijn benoemingsbrief noemt geen
      doel meer. Een of twee keer per jaar stelt hij een eis die pijn doet, uit een lijst in één blok, zoals de
      voorvallen: zijn dochter trouwt (goud), zijn jachtpartij eet bij jou (vlees), een tol op de weg (de marskramer
      komt minder), zijn bos gaat dicht, een knecht voor zijn kasteel (een hand minder). Weigeren kan, met een prijs:
      argwaan, of een straf.
    - **C, het eind en het jaar in het kort.** Gewonnen als iedereen super gelukkig is; verloren als je je ambt kwijt
      bent of de schout valt (zoals nu), of als er minder dan tien mensen over zijn. Eén scherm voor elk eind. Het jaar
      in het kort (D, prima) komt op 1 lentemaand als een papier, zoals het rapport: hoeveel mensen bij het begin en nu,
      wie kwam, stierf en wegtrok, wat er gebouwd werd, hoeveel huizen doorgroeiden, en wat de heer kreeg. Een jaar dat
      te winnen is (D, prima): geen gezin als het hout of het eten de winter niet haalt, de raad zegt waar goud vandaan
      komt als je iets wilt bouwen, en de marskramer verkoopt in de lente zaaigraan.
    - **D, 5.000 man, in drie lagen** (Marcel: "we moeten een manier zoeken zodat we toch 5k man kunnen hebben"):
      1. **In beeld:** een poppetje met een eigen pad, zoals nu.
      2. **Buiten beeld: een vast pad** (Marcels herinnering). Iemands wegen (deur, werk, put, herberg) worden één keer
         gezocht, als hij een huis of werk krijgt, en onthouden. Buiten beeld loopt hij die, of staat hij gewoon waar het
         uur hem wil (`T.dagAnker`); komt hij in beeld, dan loopt hij van daar verder. Dat haalt de spits weg, waar nu
         99,6% van de tijd zit (vraag 74), en 200 mensen haperen nu al op 30×: dit is ook voor de slice nodig.
      3. **Heel veel:** een huis telt zijn bewoners als getal, met de wensen per huis (A); een eigen mens met een naam
         blijft wie dat nodig heeft (de boeren, de raadsman, de ambtenaren, de 10 tot 20 met banden). Wie in beeld loopt,
         is een deel van de bewoners, zoals in Anno.
      Daarbij: wie waar staat per tegel bijhouden, A* met een heap, en opslaan in een bestand (de browser is vol bij zo'n
      600 mensen). Na elke laag meten met `npm run grootte`. Omdat de wensen per huis gaan, houdt niets van dit plan de
      5.000 tegen.
    **In deze volgorde:** 1, een jaar dat te winnen is (D, al goed); 2, de wensen per stand, met het eind; 3, het vaste
    pad buiten beeld; 4, de eisen van de heer; 5, de speeltest, met een bouwer die naar super gelukkig speelt. De rest van
    de slice (statussen, ambtenaren, wacht en misdaad, banden) volgt, en laag 3 komt met stap 6.
    Vragen: **a**, B en C: twee manieren om te winnen, zoals in Civilization (de wereld veroveren, of iedereen super
    gelukkig), of samen één eind; en in de slice is super gelukkig het eind? **b**, de wensen zo: per huis, met deze vier
    standen, en de treden die erin opgaan? **c**, de eisen van de heer zo, na de wensen? **d**, 5.000 man in drie lagen,
    met het vaste pad meteen na de wensen?
    **Beantwoord (Marcel, 1 okt):** "a twee manieren b ja c ja d ja. We focussen ons op een speelbare kern. Daarna komt
    oorlog etc erbij en de rest van het land diplomatie trading etc". Dus: twee manieren om te winnen (de wereld veroveren,
    of iedereen super gelukkig); de wensen per huis, met de vier standen en de treden die erin opgaan; de eisen van de heer
    na de wensen; en 5.000 man in drie lagen, met het vaste pad meteen na de wensen. **Eerst een speelbare kern,** en dat
    is één stad die je wint door iedereen super gelukkig te maken; oorlog, de rest van het land, diplomatie en handel
    komen daarna. Gebouwd wordt in de volgorde hierboven, te beginnen met een jaar dat te winnen is.
80. **Stap 2: de wensen per stand, het plan** (Claude, 1 okt, eenentwintigste sessie; vraag 79, A en C; wacht op
    Marcel). **Wat er al is:** een huis groeit door als het hele dorp dertig dagen 70% tevreden is (een hut van 3 mensen
    wordt een huis van 5, een huis een stenen huis van 8; een boerderij groeit niet), en die tevredenheid is één getal
    voor het hele dorp. De molen, de bakkerij, de weverij en de kuiper maken iets wat niemand gebruikt (meel, brood,
    laken, vaten), en de markt, het badhuis en het gasthuis doen niets.
    - **A, elk huis een stand, met zijn wensen.** De stand hoort bij het huis: een hut is van keuters, een huis van
      dorpelingen, een stenen huis van ambachtslieden, en een nieuw huis van twee lagen in baksteen (de huizenbouwer kan
      het, zoals het huis van de schout) van poorters. Elke dag kijkt een huis of het heeft wat zijn stand wil, uit de
      tabel van vraag 79 (de getallen in de werkbank): **goederen** die het per mens per dag gebruikt, uit de voorraad
      (eten en in de winter brandhout, zoals nu; bier van de herberg of de brouwerij; vlees of vis; brood van de bakkerij,
      met meel van de molen; laken van de weverij, met wol van de kooi; zout van de marskramer), en **plekken in de
      buurt** (een put, een kapel, de herberg, een markt, een badhuis, een gasthuis). Zo krijgen de ketens die nu niets
      doen een doel, zoals in Anno.
    - **B, in de buurt is een kring om het gebouw,** zoals in Anno: de put reikt 12 tegels, een kapel, de herberg en een
      markt 25, het badhuis en het gasthuis 30 (werkbank). Als je bouwt, zie je de kring op de grond, en welke huizen
      erin vallen. Het andere is hoe lang je loopt, langs de wegen (`T.looptijdVan`): dat klopt beter, maar je ziet het
      niet als je bouwt, en bij 5.000 man is het veel rekenwerk.
    - **C, doorgroeien en achteruitgaan, per huis.** Heeft een huis een maand lang alles, dan groeit het door naar de
      volgende stand, met meer mensen erin (hut 3, huis 5, stenen huis 8, poortershuis 12) en meer belasting. Doorgroeien
      kost bouwstof uit de voorraad, zoals in Anno: een huis 8 hout, een stenen huis 12 steen, een poortershuis 20 steen
      en 5 goud (werkbank). Zo krijgt steen een doel (de steengroeve, en later de steenbakkerij). Mist een huis een maand
      iets, dan wordt het ontevreden, en trekt er een gezin weg. De tevredenheid van het dorp wordt het gemiddelde van
      zijn huizen, zodat alles wat er nu naar kijkt (de groei, het werk, de voorvallen, de raad), blijft werken. De
      boerderijen groeien niet: hun boeren willen eten, brandhout, een kapel en de herberg, en tellen zo mee.
    - **D, de treden gaan op in de standen.** Wat een stand wil, komt in het bouwmenu als er genoeg mensen zijn in de stand
      eronder, zoals in Anno: de markt, de molen, de bakkerij en de weverij bij 20 dorpelingen; het badhuis, het gasthuis
      en de steenbakkerij bij 20 ambachtslieden. Het dorp heet naar zijn mensen: een dorp zodra er 20 dorpelingen zijn,
      marktrecht bij 20 ambachtslieden, een stad bij 20 poorters (werkbank). De heervaart en de brief "Dat kost u vanaf nu
      meer" blijven aan het dorp hangen. Linksboven staat hoeveel huizen super gelukkig zijn, en wat de volgende stand
      nog mist.
    - **E, je ziet het eerst in de wereld.** Een huis dat iets mist, heeft een klein teken bij de deur; loop erheen of klik
      het, en je ziet wat het wil, met ✓ en ✗. Je raadsman zegt in zijn rapport wat het meest gemist wordt ("Zes huizen
      willen een kapel dichterbij"), en de raad zegt het onder het doel.
    - **F, het eind.** Gewonnen als alle woningen in de hoogste stand zijn en alles hebben wat ze willen, en de boerderijen
      ook, een maand lang (werkbank). Verloren als je je ambt kwijt bent, als de schout valt, of als er minder dan tien
      mensen over zijn. Eén scherm voor elk eind, met het jaar in het kort (vraag 78, D); wie wint, kan verder spelen.
    **In deze volgorde,** elk met toetsen: 2a de stand en de wensen per huis, met de tevredenheid als gemiddelde; 2b
    doorgroeien en achteruitgaan; 2c zien wat een huis wil (het teken, het venster, het rapport, het doel); 2d de treden
    uit de standen, en het poortershuis; 2e het eind en het jaar in het kort. Daarna het vaste pad buiten beeld (vraag
    79, stap 3) en de speeltest, met een bouwer die naar super gelukkig speelt.
    **Klaar als** een huis zegt wat zijn stand wil en of het dat heeft; een huis doorgroeit als het alles heeft, en er een
    gezin wegtrekt als er lang iets ontbreekt; de tevredenheid van het dorp het gemiddelde is; de treden uit de standen
    komen; je kunt winnen en verliezen, met één scherm; `npm test` groen is; en de speeltest zegt hoe ver de bouwer komt.
    Vragen: **a**, de wensen zo, uit de tabel van vraag 79, met de getallen in de werkbank? **b**, in de buurt als een
    kring om het gebouw, zoals in Anno? **c**, doorgroeien kost bouwstof (hout, steen), zodat steen een doel krijgt?
    **d**, gewonnen als alles een maand lang super gelukkig is?
    **Beantwoord (Marcel, 1 okt):** "80: a, Ja. B, Ja. C, Ja. D, een jaar". Dus de wensen zo, in de buurt als een kring
    om het gebouw, doorgroeien kost bouwstof, en **gewonnen als alles een jaar lang super gelukkig is**. En klein (vraag
    82, a): eerst drie standen, op de huizen die er al zijn.
81. **Het dorp eet zijn zaaigraan op** (Claude, 1 okt, eenentwintigste sessie; de speeltest na stap 1 van vraag 79, in
    `speelbaar.md`; wacht op Marcel). Na stap 1 sterft niemand meer van de kou, en 20 tot 31 mensen minder in twee jaar.
    Maar op 1 lentemaand van het tweede jaar was er bij alle drie de zaden geen korrel zaaigraan: in de winter at het dorp
    alles op, en zonder zaaigraan is er dat jaar geen oogst. De bouwer wilde het van de marskramer kopen, maar het goud
    was op (alleen bij zaad 2 één zak). En het eten is te weinig voor een dorp: de akkers voeden zo'n 25 mensen, het doel
    vraagt er 50, en de bouwer bouwt geen jager, al zei de raad 212 tot 323 dagen dat het eten de winter niet haalt.
    Voorstel:
    - **a, de boeren houden het zaaigraan apart.** Na de oogst leggen ze het zaaigraan voor volgend jaar opzij (één graan
      per akkertegel), en dat eet het dorp niet, ook niet in de winter: liever honger in de winter dan een jaar zonder
      oogst. Zo doen de boeren het seizoen ook zelf (vraag 74). In de balk staat bij het graan hoeveel daarvan zaaigraan
      is, en de raad, het rapport en de winter rekenen het eten zonder. Een spelregel, standaard aan. Het andere: zo
      laten, en de raad waarschuwt als het zaaigraan opgaat.
    - **b, de bouwer bouwt een jager** als de raad zegt dat het eten de winter niet haalt, hooguit één per maand, zoals een
      speler die de raad volgt. Dan meet de speeltest wat een speler kan, en niet alleen wat het doel vraagt.
    In stap 2 vraagt het doel geen 50 mensen meer (vraag 80, D): eten wordt de eerste wens van elke stand, en een dorp
    groeit dan zo ver als het te eten heeft. Vragen: **a**, het zaaigraan apart? **b**, de bouwer met een jager?
    **Beantwoord (Marcel, 1 okt):** "81: zaaigraan wordt bij nood opgegeten, anders sterven er mensen". Dus niet strikt
    apart: van de oogst tot het zaaien houden de boeren het zaaigraan achter, en het dorp eet het pas als er niets anders
    meer is (na het andere graan, de kaas en het gezouten vlees); liever geen oogst dan doden. Het dorp zegt het als het
    zover is, en de winter rekent het eten zonder het zaaigraan. Over b zei Marcel niets; het is gereedschap, geen spel,
    dus de bouwer krijgt de jager bij de volgende speeltest, tenzij Marcel het anders wil.
82. **Een kleine speelbare variant, en zaaien dat dagen kost** (Marcel, 1 okt, eenentwintigste sessie: "De focus op een
    speelbare kleine variant lijkt mij het beste toch?", en "Moet het zaaien niet meerdere dagen in beslag nemen? Stel er
    is slecht weer. Dan wordt er minder gezaaid waardoor er minder eten is en er meer gehandeld moet worden om aan eten
    te komen"; wacht op Marcel).
    - **a, klein: ja.** De speeltest laat zien dat wat nu een speelbaar spel tegenhoudt, klein en basaal is (het dorp
      eet zijn zaaigraan op, de akkers voeden 25 mensen), en dat zit er in elke maat in. Klein is: één gehucht dat groeit
      tot zo'n 100 mensen op de kaart van nu; de wensen met **drie standen, op de huizen die er al zijn** (hut, huis,
      stenen huis), zonder nieuw huis voor de poorters (dat komt later, met de vierde stand); de heer zoals hij is; de
      winter; winnen als iedereen super gelukkig is, verliezen als je je ambt kwijt bent, valt, of als het dorp leegloopt.
      Geen nieuwe kaart, geen 5.000, geen land of oorlog; wel alles per huis, zodat het later groter kan. Dan spelen,
      bijstellen, en een tester. De volgorde wordt: het zaaigraan (vraag 81), de wensen klein (vraag 80, met drie
      standen), het eind, de speeltest; dan het weer en de eisen van de heer; het vaste pad als het dorp groter moet.
    - **b, zaaien zoals maaien.** Wat er nu is: op 1 lentemaand zaaien de boeren in één ochtend alles wat het zaaigraan
      toelaat, en sinds vandaag zaaien ze na tot 1 bloeimaand. Maaien gaat al tegel voor tegel, met de boer op het land
      (`T.werkOogstBij`). Voorstel: zaaien net zo, in lentemaand, zoveel tegels per dag als een boer haalt, met zaaigraan
      uit de voorraad; wat op 1 bloeimaand niet gezaaid is, blijft kaal. Eén regel in plaats van twee (het zaaien en het
      nazaaien), en je ziet de boeren zaaien.
    - **c, het weer als status** (de richtlijn: een toestand is een status, met niveaus): regen in de lente (op een natte
      dag zaait niemand; "aanhoudende regen" een week lang), en droogte in de zomer (de akkers geven minder; "ernstige
      droogte" nog minder), geloot uit het zaad van het spel. Nu geeft een akker elk jaar hetzelfde, en is er dus geen
      reden om iets opzij te leggen of te handelen; het weer geeft die reden. De marskramer verkoopt dan ook in de zomer
      en de herfst graan, duur na een slecht jaar, en de heer wil in een slecht jaar evenveel. Het hoort bij stap 2 van
      de slice (statussen met niveaus, vraag 77), waar de droogte al staat.
    **Wanneer b en c:** na de wensen, samen met de statussen. Eerst moet een gewoon jaar te halen zijn (vraag 81): een slecht
    jaar bovenop een dorp dat zijn zaaigraan al opeet, maakt het alleen erger. Het andere: nu, vóór de wensen.
    Vragen: **a**, klein zo, met drie standen op de huizen die er zijn? **b** en **c**, zaaien over dagen en het weer, na de
    wensen?
    **Beantwoord (Marcel, 1 okt):** "82: correct". Dus klein, met drie standen op de huizen die er zijn, en zaaien over
    dagen en het weer na de wensen, samen met de statussen. De volgorde: het zaaigraan (vraag 81), de wensen klein (vraag
    80), het eind, de speeltest; dan het weer en de eisen van de heer; het vaste pad als het dorp groter moet.
83. **Het commerciële deel: geld verdienen** (Marcel, 1 okt, eenentwintigste sessie: "Ik wil toevoegen dat we echt moeten
    denken aan het commerciële deel van het project. Ik wil hier eigenlijk geld mee verdienen"; wacht op Marcel). Het
    voorstel staat in `commercieel.md`, met wat er nagezocht is: middeleeuws bouwen verkoopt maar is druk, verlanglijstjes
    beslissen de verkoop (8.000 is een goede indie-release, en de eerste week verkoop je er 15 tot 25% van), en Steam Next
    Fest mag een spel maar één keer doen. Wat wij hebben en de rest niet, is de heer, de inner en het verstoppen: "Word
    rijk. Lijk arm.", *Papers, Please* in een middeleeuws dorp. Vragen: **a**, dit tijdpad: de kleine kern dit jaar; in
    januari 2027 de naam, geluid, Engels en een Steam-pagina; in juni 2027 de demo in Next Fest; daarna early access?
    **b**, Engels als hoofdtaal op Steam, Nederlands erbij, met de spelteksten op één plek, na de kleine kern? **c**, de
    haak vooraan: de eisen van de heer horen in de eerste demo, vóór het weer? **d**, wat er aan geld en tijd in kan:
    geluid (kopen of laten maken), een tekenaar voor de capsule en het logo, en de 100 dollar voor Steam?
    **Marcel, daarna (1 okt):** "Dat verstoppen vind ik niet sterk genoeg eigenlijk. Volgens mij is ons idee dieper dan wat
    er op Steam staat? Ook de art stijl speelt een grote rol denk ik." Bijgewerkt in `commercieel.md`: de haak is het
    concept, **je bent geen god boven het dorp, maar de schout erin** (wie je nodig heeft, komt je zoeken, je raadsman
    brengt het rapport, in de herberg hoor je wat er speelt), met de heer als de satire erin; en de beeldstijl is een
    troef, maar de vensters erover maken de plaatjes zwakker. Dus c en een vijfde vraag worden: **c**, de haak zo, en
    wat hem zichtbaar maakt ("wat je weet, is wat er het laatst geteld werd", vraag 77, b) naar voren, vóór de demo?
    **e**, een fotomodus en vensters en een letter in de beeldstijl, vóór de Steam-pagina?
    **Beantwoord (Marcel, 1 okt):** "1. Tijdspan is goed 2. Engels is prima 3. De nieuwe hook nogmaals checken tegen
    steam 4. Geld is beperkt. Ik gebruik jou ☺️ 5. Foto modus is ingeschakeld en goed idee voor de Steam pagina" (en
    daarna: "Ik bedoelde goed idee"). Dus **a** en **b** ja (het tijdpad staat als blok 0b bovenaan), **d**: wat kan,
    maakt Claude (de capsule uit de pijplijn van de pixel art, geluid uit vrije bibliotheken en code, de vertaling, de
    teksten voor de Steam-pagina), en Marcel kiest, luistert en plaatst; alleen de 100 dollar voor Steam staat vast.
    **e** ja: de fotomodus komt met de ui (vraag 84, a). **c** is nagezocht (`commercieel.md`, "De haak, nagezocht
    tegen Steam"): de twee helften bestaan elk apart, "tussen je dorpelingen lopen" in *Noble Legacy* (als heer, en met
    een knop naar boven) en "de ambtenaar tussen de heer en het dorp" in *The Reeve* (een keuzespel zonder dorp, en het
    woord "reeve" is dus bezet); allebei samen heeft niemand. Daarom een scherpere zin, met de plek ertussen. Nog open,
    **c**: welke zin? 1, "De heer wil geld. Het dorp wil leven. Jij staat ertussen." (advies, als de zin onder de naam);
    2, "Je bent geen god boven het dorp. Je bent de schout erin." (zoals het was; advies: als de gedachte in de
    beschrijving); of 3, "Bestuur een dorp te voet, voor een heer die alleen geld ziet." En komt wat de haak zichtbaar
    maakt ("wat je weet, is wat er het laatst geteld werd") naar voren, vóór de demo?
84. **De sfeer, de ui, en een kazerne** (Marcel, 1 okt, eenentwintigste sessie: "De atmosfeer moet goed zijn. Trekken als
    het ware. De ui moeten we nog maken. De losse info panelen etc ook. Extra gebouwen als barakken of iets om te soldaten
    te trainen / rekruteren"; wacht op Marcel). Het voorstel staat in `commercieel.md` ("De sfeer en de ui") en `spel.md`
    (bij de rovers, de kazerne). Kort: de sfeer trekt als het dorp klinkt (er is nog geen enkel geluid), de seizoenen te
    zien zijn en het weer meedoet; de ui wordt papieren in de stijl van de pixel art (het rapport, de brieven, een boek
    van de wetten, een kaart van je dorp op tafel), want zo maakt hij de haak zichtbaar ("je bent de schout in het dorp")
    in plaats van het dorp te bedekken. Vragen: **a**, de ui zo, als papieren in de beeldstijl, met eerst een pagina met
    ontwerpen om uit te kiezen, vóór de wensen zichtbaar worden (vraag 80, 2c)? **b**, voor de sfeer eerst geluid
    (omgeving en muziek), dan de seizoenen in beeld en het weer? **c**, de kazerne: nu, zodat je militie tegen de rovers
    beter wordt, of later, met de oorlog?
    **Beantwoord (Marcel, 1 okt):** "a ja b ja c later, met de oorlog". Dus vóór 2c eerst de pagina met ontwerpen voor de
    ui (zie "Waar de volgende sessie begint"); voor de sfeer eerst geluid, dan de seizoenen en het weer (blok 0b); en de
    kazerne komt met de oorlog (onder 3). In hetzelfde bericht: "Later wil ik ook dorpsfeesten die passen bij het seizoen,
    hier wil ik het hele dorp wat mee doet etc. Ook een bruiloft wordt groots gevierd. Er zijn veel soorten feesten die we
    kunnen gebruiken hiervoor. Voor nu een notitie later pas bouwen." Dat staat in `spel.md`, "Dorpsfeesten", en onder 3.
85. **Stap 2a en 2b: de wensen per huis, en doorgroeien: het plan** (Claude, 1 okt, tweeëntwintigste sessie; vraag 80;
    wacht op Marcel). Vraag 80 is besloten; dit is hoe het in de code komt, met wat er bij het uitzoeken opviel.
    **Wat er al is:** de tevredenheid is één getal voor het hele dorp: eten (de helft, en meer als er groente, vis of
    vlees bij is), brandhout in de winter (0,3) en een kapel (0,2), met de herberg, de wetten, de voorvallen en de heer
    erbij of eraf. Het gehucht begint op 67%. Een huis groeit door als het hele dorp 30 dagen 70% tevreden is. Gemeten
    in het gehucht:
    - **De drie woningen van het begin groeien nooit.** Ze zijn in Tiled getekend, en alleen een huis dat jij of een
      gezin bouwde, kan zijn tekening wisselen. Dan is "alle woningen stenen huizen" niet te halen. Ruimte is er wel:
      beide hutten passen een huis, en het huis een stenen huis.
    - **Het stenen huis heeft één tekening, uit de oude reeks** (`gereedschap/pixelart/dorp.cjs`), niet van de
      huizenbouwer.
    - **Een kring van 25 tegels is klein voor dit gehucht.** De boerderijen staan aan de rand, 21 tot 26 tegels van het
      midden van het plein: een kapel op het plein haalt er dan drie van de vijf. De herberg staat in de hoek, en drie
      boerderijen liggen er 37 tot 42 tegels vandaan. De put op het plein haalt met 12 tegels alleen de hut van het oude
      stel; het huis van het jonge gezin staat op 13.
    - In het huis van de schout wonen vijf mensen, en de herbergierster woont in de herberg.
    - **A, de wensen per huis (2a).** Elk huis met mensen heeft een stand naar zijn soort: een hut keuters, een huis
      dorpelingen, een stenen huis ambachtslieden, en een boerderij boeren (die groeien niet). Het huis van de schout en
      de herberg hebben geen wensen: die zijn van jou en van de herbergierster. Een stand wil wat de stand eronder wil, en
      meer, zoals in Anno:

      | Stand | Gebruikt | Wil in de buurt |
      |---|---|---|
      | keuters | eten; brandhout in de winter | een put (12 tegels) |
      | dorpelingen | daarbij bier, en vlees of vis | daarbij een kapel en de herberg (30) |
      | ambachtslieden | daarbij brood en laken | daarbij een markt (30) |
      | boeren | eten; brandhout in de winter | een kapel (30) |

      Goederen deelt het dorp eerlijk: is er te weinig bier, dan heeft niemand genoeg, en dat zie je aan één getal ("het
      bier is voor 60% genoeg"); zo rekent het ook voor 5.000 man. Elk huis heeft zijn eigen tevredenheid, uit zijn
      wensen: eten de helft, brandhout 0,3 en de rest samen 0,2 (waar nu de kapel staat), met de herberg, de wetten, de
      voorvallen en de heer erbij of eraf, zoals nu. Een huis dat alles heeft, staat op 100%: dat is super gelukkig. Het
      dorp is het gemiddelde, naar mensen, dus de groei, het werk, de voorvallen en de raad werken gewoon door. De
      afwisseling (groente, vis of vlees maakt tevredener) gaat op in de wensen: vlees of vis voor de dorpelingen.
      Daardoor begint het gehucht hoger, op zo'n 85% in plaats van 67%, en wordt er in het begin iets harder gewerkt; groente
      telt dan niet meer voor de tevredenheid, alleen nog bij de marskramer. Zien doe je in 2a nog weinig: het getal in
      de balk, bij de muis wat de huizen missen, en de kring op de grond als je een put, een kapel, een herberg of een
      markt neerzet, met de huizen die erin vallen. De vensters komen in 2c, na de pagina met ontwerpen voor de ui.
      `Spel.debug.wensen()` zegt per huis wat het wil en wat het heeft.
    - **B, doorgroeien (2b).** Heeft een huis 30 dagen op rij alles, dan groeit het door, als de bouwstof er is: een
      huis kost 8 hout, een stenen huis 12 steen. Zonder bouwstof wacht het, en zegt het dorp het één keer. De drie
      woningen van het begin groeien ook: ze krijgen hun tekening als eigen voorwerp, zoals een huis dat een gezin
      bouwde. Een hogere stand betaalt meer belasting, als die wet is aangenomen (werkbank). **Het stenen huis:** de
      huizenbouwer maakt er zes, elk het stenen broertje van een van de zes huizen, met dezelfde vorm en voet. Zo
      versteent een huis op zijn eigen grond: er is altijd plaats, en je herkent je huis.
    - **C, achteruitgaan.** In vraag 80 staat: mist een huis een maand iets, dan trekt er een gezin weg. Bij het
      uitwerken bijt dat met het doorgroeien, dat vanzelf gaat: een hut die een huis wordt, wil meteen bier, vlees of
      vis, een kapel en de herberg. Staat er nog geen kapel, dan verliest elk huis dat doorgroeit na een maand zijn
      gezin, en jij kon het niet tegenhouden. Twee manieren, allebei als spelregel ("Achteruitgaan"), met wat Marcel
      kiest als standaard:
      1. **Zacht, zoals in Anno 1602** (advies): mist een huis iets, dan groeit het niet verder en is het minder
         tevreden; er trekt pas een gezin weg als het huis onder de 25% zakt, en dat gebeurt alleen als het eten of het
         brandhout mist. Dat is de regel van nu, maar per huis.
      2. **Streng, zoals in vraag 80:** mist een huis een maand iets, dan trekt zijn gezin weg. Dan hoort er een rem bij,
         bijvoorbeeld: het gezin vraagt de schout eerst of het mag doorgroeien ("Mogen we een huis bouwen? Het kost 8
         hout"), als voorval, en ben je weg, dan beslist je raadsman.
    **In deze volgorde:** 2a, met toetsen; 2b, met toetsen; de zes stenen huizen; de speeltest. Daarna de pagina met
    ontwerpen voor de ui (vraag 84, a), en dan 2c.
    **Klaar als** elk huis zijn stand en zijn wensen heeft, met wat het heeft en een getal; het dorp het gemiddelde is;
    je de kring ziet als je bouwt; een huis doorgroeit na 30 dagen alles, met bouwstof, ook de drie van het begin; een
    huis versteent op zijn eigen grond; achteruitgaan gaat zoals gekozen; `npm test` groen is; en de speeltest zegt wat
    het deed.
    Vragen: **a**, de wensen zo: een stand wil ook wat die eronder wil, goederen eerlijk gedeeld, en het getal per huis
    (eten 0,5, brandhout 0,3, de rest 0,2), zodat het gehucht op zo'n 85% begint? **b**, de kring 30 voor de kapel, de
    herberg en de markt, en de boeren willen een kapel maar niet de herberg? **c**, achteruitgaan zacht (advies) of
    streng? **d**, het stenen huis als stenen broertje van elk huis, met dezelfde voet?
    **Beantwoord (Marcel, 1 okt):** "a ja, maar een hogere stand eigent zich spullen toe. Dus stel er is te weinig bier,
    dan nemen zij het laatste. b ja voor nu. c zacht d ja". Dus de wensen zo, maar goederen worden niet eerlijk gedeeld:
    **de hoogste stand neemt eerst**, en wat er over is, gaat naar de stand eronder (binnen een stand gelijk op). De kring
    30 voor de kapel, de herberg en de markt, en de boeren willen een kapel, niet de herberg, "voor nu". Achteruitgaan
    zacht (de standaard; streng als spelregel). En het stenen huis als stenen broertje van elk huis.
    **Gebouwd** (tweeëntwintigste sessie): 2a, 2b en de zes stenen huizen; zie onder Af, en de speeltest in `speelbaar.md`.
86. **Na de speeltest van 2a en 2b** (Claude, 1 okt, tweeëntwintigste sessie; `speelbaar.md`; wacht op Marcel). De wensen
    doen wat ze moeten: wie ze niet geeft, blijft een gehucht van hutten. De bouwer van de speeltest groeide vóór 2b tot 59
    à 104 mensen, doordat elk huis vanzelf doorgroeide als het dorp tevreden was; nu groeit alleen de hut bij de put op het
    plein, en komt hij tot 38 à 51. Elke nieuwe hut kost 8 hout, en een bouwplaats neemt het hout zodra het er is: bij zaad 2
    kwam de houthakker er nooit, en de winter kostte 64 mensen. En wie lui is, verliest bij honger nu ook gezinnen die
    wegtrekken. Maar de speler ziet de wensen nog nauwelijks: alleen de balk zegt bij de muis wat er gemist wordt. Voorstel:
    - **a, de woorden van 2c eerst.** De raad onder het doel en het rapport van de raadsman zeggen wat de huizen het meest
      missen, en wat helpt: "Vijf hutten willen een put binnen 12 tegels [B]", of "Twee hutten kunnen een huis worden, maar
      er is geen 8 hout". Dat zijn zinnen, geen vensters, dus het hoeft niet te wachten op de pagina met ontwerpen voor de ui;
      het teken bij de deur en het venster van een huis wel (vraag 84, a).
    - **b, de bouwer van de speeltest volgt de wensen** (stap 5 van vraag 79), zoals hij nu de raad volgt: een put waar hutten
      er een missen, en wat de dorpelingen willen. Een houthakker gaat dan vóór een nieuw erf, als er nog geen is. Zo meet de
      speeltest hoe ver een speler komt naar super gelukkig, en niet hoe ver iemand komt die de wensen niet kent.
    - **c, wegtrekken bij honger zo laten** (advies): het is de zachte regel zoals Marcel hem koos (alleen bij honger of kou),
      en de raad en het rapport zeggen de honger op tijd. Het andere: een huis dat iets mist, telt bij de drempel alleen het
      eten en het brandhout, zodat een kapel er niet meer toe doet.
    Vragen: **a**, de raad en het rapport over de wensen nu, vóór de ui? **b**, de bouwer zo? **c**, wegtrekken bij honger zo
    laten?
    **Beantwoord (Marcel, 1 okt):** "a ja b ja c ja". Dus eerst de woorden van 2c: de raad onder het doel en het rapport
    van de raadsman zeggen wat de huizen het meest missen en wat helpt, vóór de pagina met ontwerpen voor de ui; dan een
    bouwer in de speeltest die de wensen volgt, met een houthakker vóór een nieuw erf; en wegtrekken bij honger blijft zo.
87. **Vraag 86, a en b: de raad en het rapport over de wensen, en een bouwer die ze volgt: het plan** (Claude, 1 okt,
    drieëntwintigste sessie; wacht op Marcel). Vraag 86 is besloten; dit is hoe het in de code komt, met wat er bij het
    uitzoeken opviel.
    **Wat er al is:** elk huis onthoudt wat het wil en heeft (`g.wensen`), en het dorp wat er gemist wordt en in hoeveel
    huizen (`D.behoeften.gemist`). Dat zegt alleen de balk, bij de muis op de tevredenheid; een huis dat op bouwstof wacht,
    zegt het één keer in een bericht. De raad en het rapport weten van geen van beide. Aan het begin van het gehucht missen
    zes huizen een kapel (de vijf boerderijen en het huis), en het huis ook een put (het staat 13 tegels van de put op het
    plein, de kring is 12) en vlees of vis; de hut heeft alles.
    **Wat opviel:**
    - **Eén kapel haalt nooit alle zes.** De boerderijen liggen aan de rand: met een kring van 30 haalt de beste plek er
      vier. Met 38 zijn er 20 plekken die alle zes halen, met 40 zijn het er 50. Nu moet je dus twee kapellen bouwen (16
      goud) om iedereen super gelukkig te maken.
    - **Een stenen huis wordt in een gehucht nooit super gelukkig.** De ambachtslieden willen brood, laken en een markt, en
      een bakkerij komt pas in een dorp, een weverij en een markt pas met marktrecht. Een huis dat versteent, zakt dus van
      100% naar zo'n 92%. In Anno 1602 gaat het ook zo: wie een stand bereikt, maakt de gebouwen vrij die die stand wil.
      Dat is 2d, de treden uit de standen.
    - **De herberg bouw je in een gehucht niet**, en een huis wil hem binnen 30 tegels. Van de 704 plekken waar een erf
      past, liggen er 113 zo dicht bij (`opmerkingen.md`; hoort bij 2c).
    **Het plan:**
    - **A, één vraag voor alle drie.** In `js/wensen.js` zegt `T.watDeHuizenMissen(D)` wat de huizen missen en wat helpt,
      van wat het zwaarst weegt naar het lichtst: eerst huizen die een maand alles hadden en op bouwstof wachten, dan wat de
      meeste mensen missen. Per stuk: welke huizen ("vijf boerderijen en een huis"), wat helpt (een gebouw uit het
      bouwmenu, of wat er al staat), en of je er nu iets aan kunt doen. De raad, het rapport en de bouwer vragen het alle
      drie, zodat ze niet uit elkaar lopen.
    - **B, de raad** (`js/raad.js`): twee raden, na wat dringend is (de inner, het goud voor de heer, de rovers, de winter,
      de kelders), de eerste dagen en "het dorp is vol", en vóór wat je mist voor de kapel en de smidse en waarom er geen
      gezin komt. Zo zegt hij meestal iets over de wensen, want daarmee win je. "Twee hutten kunnen een huis worden, maar
      er is geen 8 hout: een houthakker [B] hakt hout." "Vijf boerderijen en een huis willen een kapel binnen 30 tegels
      [B]." "Een huis wil vlees of vis: een visser [B] vangt 2 vis per dag." Wat je nu niet kunt bouwen (de herberg, brood,
      laken, een markt), slaat hij over, zodat hij niet blijft hangen op iets waar je niets aan kunt doen.
    - **C, het rapport** (`js/ochtendrapport.js`): bij wat er gebeurde ook wie doorgroeide ("De hut van Geert en Grietje
      is een huis geworden: ze horen nu bij de dorpelingen."), en de wensen als status (de richtlijn van 1 okt, en vraag
      76): wat er gemist wordt, zegt hij als het begint, als het aantal huizen verandert en als het ophoudt ("Wie een kapel
      wilde, heeft er nu een."), en anders om de zeven dagen. De drie die het meest gemist worden, met wat helpt, ook wat
      nog niet kan ("De ambachtslieden willen brood; een bakkerij komt pas in een dorp."). Heeft elk huis alles: "Alle
      huizen hebben wat ze willen."
    - **D, de bouwer** (`gereedschap/speeltest/speler.js`) volgt dezelfde lijst: een put of een kapel op de plek die de
      meeste huizen zonder bereikt (zoals een speler die met de put in de hand kijkt wat de muis zegt), een visser als de
      dorpelingen vlees of vis missen, en een houthakker of een steengroeve als er een huis op bouwstof wacht; hooguit één
      bouwwerk voor de wensen per maand, zodat er hout overblijft voor de hutten. En een houthakker vóór een nieuw erf, als
      er nog geen staat. De speeltest telt erbij hoeveel huizen alles hebben.
    **In deze volgorde:** A met toetsen, B, C, D, en de speeltest (alle vijf spelers, zaad 1 tot 3, vóór → na in
    `speelbaar.md`). Daarna de pagina met ontwerpen voor de ui (vraag 84, a).
    **Klaar als** de raad de wensen zegt met wat helpt en de toets; het rapport ze als status zegt, met wie er
    doorgroeide; de bouwer ze volgt; `npm test` groen is; en de speeltest zegt hoe ver de bouwer komt naar super gelukkig.
    Vragen: **a**, de raad en het rapport zo, met de wensen vóór de kapel en de smidse van het doel? **b**, de bouwer zo?
    **c**, één kapel haalt nooit alle zes: de kring van een kapel naar 40 ("zo ver als je de klok hoort"; de herberg en de
    markt blijven 30), of twee kapellen? **d**, een stenen huis in een gehucht: zo laten tot 2d, en het rapport zegt wat
    nog niet kan (advies), of groeit een huis pas door als zijn nieuwe stand kan krijgen wat hij wil?
    **Beantwoord (Marcel, 2 okt):** "a ja b ja c 40, misschien wordt de kapel een kerk en dan een kathedraal met meer
    bereik? d zo laten". Dus de raad en het rapport zo, met de wensen vóór de kapel en de smidse van het doel; de bouwer
    zo; de kring van een kapel wordt 40 (de herberg en de markt blijven 30); en een stenen huis blijft zo tot 2d. De kapel
    die een kerk en dan een kathedraal wordt, met een grotere kring, is een idee voor later, bij 2d (`spel.md`, "De
    wensen van de mensen, per stand").
88. **Mensen ingemetseld, en paden die de hele kaart afzoeken** (Claude, 2 okt, drieëntwintigste sessie; wacht op
    Marcel). Met de bouwer die de wensen volgt (vraag 87, D) groeide het dorp beter (bij zaad 2 op dag 250 zes huizen in
    plaats van drie), maar een speeljaar duurde geen 2,5 minuut meer, maar meer dan een kwartier, en elke dag trager.
    Gemeten: bijna alle tijd gaat naar het zoeken van paden (A*, `js/pad.js`), voor wie dwaalt (`T.dwaal`).
    - **Een gebouw komt over mensen heen, en over deuren.** Bouwen en doorgroeien kijken alleen of een tegel vast is (een
      muur, een boom), niet of er iemand staat of een deur is. Dat zit al in de nulmeting: Otto en Hille staan vanaf dag 50
      tot het eind ingemetseld in de hut van het oude stel, die over hen heen doorgroeide (2b). Bij de nieuwe bouwer kwam
      de kapel over Geertje, groeiden twee huizen over Egbert, Diewer en Berend, en staat er een put op de deur van de
      schout. Wie ingemetseld is, probeert elke paar seconden naar huis, en wie naar een dichtgebouwde deur wil, laat A*
      de hele kaart afzoeken: 4.000 keer per tien dagen, vanaf dag 320 elke keer zo'n 1.200 tegels.
    - **A* zocht de beste tegel elke stap door de hele lijst**, zodat een zoektocht die niet slaagt, de kaart in het
      kwadraat kostte. Sinds 2 okt een hoop, met precies dezelfde paden: 3.400 willekeurige zoektochten van 3.400 gelijk,
      ook die geen weg vinden, en de nulmeting speelt er alle vijftien jaren letter voor letter mee zoals ervoor, 8%
      sneller (912 → 842 seconden). Dat helpt waar een zoektocht niet slaagt; de ingemetselde mensen lost het niet op.
    **Marcel (2 okt):** "Zoizo bezette tegels zijn uit te sluiten toch? Bomen, versiering etc", en vier technieken: flow
    fields, time-slicing, HPA* en group steering (`opmerkingen.md`, "Een dorp van meer dan zo'n 150 mensen hapert").
    Voorstel:
    - **a, nu: niet bouwen op iemand of op een deur.** Het bouwmenu zegt "Daar staat iemand" of "Daar is een deur", de
      bouwer kiest een andere plek, en een huis groeit niet over iemand heen (dan morgen) of over een deur. Zo blijft
      niemand ingemetseld, en meet de speeltest van vraag 87 het dorp zoals het hoort.
    - **b, nu: eilanden**, Marcels "bezette tegels uitsluiten": het dorp rekent één keer uit, en opnieuw als er gebouwd
      wordt, welke begaanbare tegels samen één gebied vormen. Ligt het doel in een ander gebied, dan weet A* meteen dat er
      geen weg is, in plaats van na de hele kaart. Hetzelfde spel, alleen sneller.
    - **c, later, met stap 6 van de slice (de kleine stad) en de 5.000:** flow fields voor wat veel mensen delen (de put,
      de kerk, de herberg, de markt, het plein; soldaten naar de poort); voor wat ieder alleen heeft (zijn deur, zijn werk)
      de vaste wegen onthouden, wat op hetzelfde neerkomt; time-slicing tegen de spits 's ochtends en 's avonds; HPA* over
      de wijken, met de eilanden als eerste laag; group steering voor wie achter één leider loopt (de militie met de
      schout, de soldaten van de heer, de rovers). Bij 5.000 loopt het grootste deel van de stad toch niet als poppetje
      (`opmerkingen.md`: wat je niet ziet, telt per wijk).
    Vragen: **a**, niet bouwen op iemand of op een deur, nu? **b**, de eilanden nu? **c**, de rest later, met stap 6?
    **Marcel, daarna (2 okt):** "Als het alleen het dwaalgedrag is, kun je toch na 2x falen om route te vinden overslaan?
    Vaste routes zullen geen probleem zijn". Claude: dat kan, als rem in plaats van de eilanden (b): wie twee keer geen
    weg vindt, wacht een uur speltijd voor hij het opnieuw probeert, niet voor altijd, want wie even niet langs een
    ander kon, moet later nog naar huis. Maar het dwalen is ook de weg naar huis, naar het werk en naar de put (het
    anker van de dag), en de rem verbergt alleen de kosten: Otto en Hille blijven in de muur staan, en het gezin van de
    schout komt niet meer door zijn deur. Dus a blijft nodig, met de rem erbij en zonder de eilanden.
    **Beantwoord (Marcel, 2 okt):** "A ja, B, mag C wat zijn de eilanden". Dus a: een gebouw komt niet meer op iemand of
    op een deur, en een huis groeit niet over iemand of een deur heen. b: de eilanden mogen, naast zijn rem (na twee keer
    geen weg een uur wachten): de eilanden maken een zoektocht naar een plek die nooit te halen is gratis, de rem begrenst
    wat overblijft (iemand staat even in de weg). c: de rest blijft voor later, met stap 6.
89. **Na de speeltest van vraag 87 en 88** (Claude, 2 okt, drieëntwintigste sessie; `speelbaar.md`; wacht op Marcel). De
    bouwer die de wensen volgt, groeit in twee jaar tot 100 à 104 mensen zonder één dode (ervoor 38 à 51, met 28 à 64
    doden), en twaalf à veertien huizen groeiden door. Maar alleen de vijf boerderijen hebben alles. Wat de rest aan het eind
    mist, zoals de raad het zegt: **bier** ("de herberg maakt te weinig": één herberg brouwt niet genoeg voor honderd man),
    **de herberg binnen 30 tegels** (zes à acht huizen op erven verder weg), **een kapel** voor de verste erven, en voor
    de stenen huizen **brood, laken en een markt**. Een tweede herberg, een brouwerij en een bakkerij komen pas in een
    dorp, een weverij en een markt met marktrecht. En bij zaad 1 en 3 werd het **geen dorp**: het goud ging naar de wensen
    (vijf à negen putten van 2 goud, een kapel, een steengroeve), bleef rond nul, en de smidse kwam er niet; de heer kreeg
    25 à 62%, zoals ervoor (goud was al de rem, vraag 59, C, geparkeerd).
    Voorstel:
    - **a, 2d nu, vóór de pagina met ontwerpen voor de ui.** De pagina gaat over hoe je de wensen ziet (2c); 2d zijn regels.
      Zoals in Anno 1602: wie een stand bereikt, maakt vrij wat die stand wil, bijvoorbeeld een dorp als er genoeg
      dorpelingen zijn (met een tweede herberg, een brouwerij en een bakkerij), en marktrecht als er genoeg
      ambachtslieden zijn (een weverij en een markt). Zonder dat is super gelukkig niet te halen. Eerst een plan.
    - **b, een put kost alleen hout** (6, geen 2 goud: een put graaf je zelf), zodat de wensen van de hutten het goud niet
      opeten dat de heer en het doel nodig hebben. Het andere: zo laten, en het goud regelen bij 2d of vraag 59, C.
    - **c, de bouwer** verkoopt de marskramer graan ook voor zijn volgende wens, niet alleen voor de heer en het doel. Dat
      is gereedschap, geen spel.
    Vragen: **a**, 2d nu, vóór de pagina met ontwerpen voor de ui? **b**, een put alleen voor hout? **c**, de bouwer zo?
    **Beantwoord (Marcel, 2 okt):** "a ja b ja c ja, en naar main". Dus 2d nu, vóór de pagina met ontwerpen voor de ui,
    met eerst een plan (vraag 90); een put kost alleen hout; de bouwer verkoopt ook graan voor zijn volgende wens; en het
    werk van de drieëntwintigste sessie gaat naar `main`.
90. **Stap 2d: de treden uit de standen, het plan** (Claude, 2 okt, drieëntwintigste sessie; vraag 80, D, en 89, a;
    beantwoord). Bij vraag 80 werd besloten: "de treden gaan op in de standen", zoals in Anno 1602; klein (vraag 82): drie
    standen, de poorters later. De speeltest (vraag 89) liet zien waarom het nu moet: wat de huizen missen voor super
    gelukkig (bier genoeg, een herberg dichtbij, brood, laken, een markt), komt pas met een trede.
    **Wat er al is:** het gehucht wordt een dorp bij 50 mensen met een kapel en een smidse (`js/treden.js`), en de heer
    schrijft dan; een volgende trede is er niet. Elk gebouw heeft een trede: in een dorp komen de herberg, de brouwerij,
    de molen, de bakkerij, de timmerman en de tiendschuur in het bouwmenu, met marktrecht de markt, de weverij, het
    pakhuis, de steenbakkerij, het badhuis en het gasthuis. Aan het dorp hangen de heervaart en het hoofdgeld.
    - **A, een trede komt met de mensen van een stand.** Een dorp zodra er 20 dorpelingen zijn (wie in een huis woont),
      marktrecht zodra er 20 ambachtslieden zijn (in een stenen huis): de getallen in de werkbank. De kapel en de smidse
      zijn geen eis meer (de kapel willen de huizen toch al). Linksboven staat dan "12 van 20 dorpelingen", en de heer
      vraagt in zijn benoemingsbrief een dorp van huizen in plaats van "een kapel, een smidse en vijftig zielen". De oude
      eis blijft als spelregel ("Treden": zoals de proef van 28 sep).
    - **B, wat een stand wil, komt een trede eerder** (vraag 80, D: "de markt, de molen, de bakkerij en de weverij bij 20
      dorpelingen"). Zo kun je de bakkerij, de molen, de weverij en de markt al bouwen vóór je huizen versteenen, en heeft
      een stenen huis meteen wat het wil, in plaats van een tijd bij 92% te staan. Daarvoor gaan de markt en de weverij
      van marktrecht naar het dorp. Marktrecht brengt dan wat de poorters straks willen (het badhuis, het gasthuis, de
      steenbakkerij), en de pakhuizen en ambachten.
    - **C, bij marktrecht schrijft de heer**, zoals bij het dorp: "Wij vernemen dat in Ons dorp gehandeld wordt. Wij
      verlenen u marktrecht. Dat kost u vanaf nu meer." Voorlopig alleen woorden, zoals bij het dorp.
    - **D, de raad en de bouwer kennen de ketens.** Brood komt van de bakkerij, die meel nodig heeft van de molen, en laken
      van de weverij, met wol van de schapen. Mist een huis brood en heeft de bakkerij geen meel, dan zegt de raad "bouw
      een molen [B]" in plaats van "de bakkerij heeft geen meel", en de bouwer van de speeltest volgt dat.
    Niet nu: de kapel die een kerk en een kathedraal wordt (Marcels idee bij vraag 87), de poorters en hun huis, en een
    stad; dat komt na de speelbare kern.
    **In deze volgorde:** A met toetsen, B, C, D, en de speeltest (komt de bouwer tot marktrecht, en hoeveel huizen
    hebben dan alles?). Daarna de pagina met ontwerpen voor de ui (vraag 84, a), 2c en 2e.
    **Klaar als** het gehucht een dorp wordt bij 20 dorpelingen en marktrecht krijgt bij 20 ambachtslieden, elk met een
    brief; linksboven staat wat de volgende trede nog mist; het bouwmenu de gebouwen van de trede geeft; de raad een keten
    volgt; `npm test` groen is; en de speeltest zegt hoe ver de bouwer komt.
    Vragen: **a**, de treden zo, met de oude eis als spelregel? **b**, de markt en de weverij al in een dorp? **c**, een
    brief bij marktrecht? **d**, de raad en de bouwer met de ketens?
    **Beantwoord (Marcel, 2 okt):** "a ja b ja c ja d ja". Dus alle vier, in de volgorde van het plan. **Af** (zie onder
    Af); de speeltest staat in `speelbaar.md`, en wat eruit volgt, is vraag 91.
91. **Na 2d: het goud, de werkplaatsen en het laken** (Claude, 2 okt, drieëntwintigste sessie; beantwoord). De
    speeltest van 2d (`speelbaar.md`): de treden komen snel (een dorp in slachtmaand, met 50 à 54 mensen, en marktrecht
    nog in het eerste jaar), niemand sterft in de winter, en alles wat de stenen huizen missen, staat nu in het bouwmenu
    ("Drie stenen huizen willen brood: bouw een bakkerij en een molen [B]."). Maar de bouwer bouwt het niet: het goud
    staat het hele tweede jaar tussen 0 en 8, en de heer kreeg 23 à 27% (de schandpaal). Super gelukkig blijft bij de
    vijf boerderijen. Bij zaad 1 viel de schout tegen één wilde rover (`opmerkingen.md`). Voorstel, in deze volgorde:
    - **a, de bouwer volgt ook wat de raad over goud zegt** (gereedschap, geen spel). Hij neemt de belasting aan als de
      raad zegt dat er goud mist ("belasting [W] brengt elke maand goud"; bij honderd man zo'n 10 goud per maand, voor 10%
      minder tevredenheid), en neemt de eerste wens die hij kan betalen, in plaats van te wachten op de duurste (de
      bakkerij, 8 goud, terwijl er een put voor 6 hout achter staat). Dan weten we of het spel met de regels van nu te
      winnen is, of dat het goud zelf anders moet (vraag 59, C, geparkeerd).
    - **b, een werkplaats maakt tot er genoeg ligt,** zoals de herberg nu al (`maakt.tot`): de molen, de bakkerij, de
      brouwerij en de weverij, en ook wie hout opmaakt (de timmerman, de kuiper, de kalkbrander). Eén getal in de werkbank,
      bijvoorbeeld 30. Nu maalt een molen elke dag graan tot meel, ook als niemand brood wil, en meel en brood zijn geen
      eten: ruim 880 graan per jaar, en de raad raadt hem sinds 2d aan.
    - **c, laken.** Een ambachtsman wil 0,01 laken per dag (3,6 per jaar), en de wol komt van de schapen: acht schapen
      geven 32 wol, en de heer vraagt er 20 per schaapskooi. Dat is laken voor vier à vijf ambachtslieden; er zijn er 24 à
      32. Voorstel: 0,005 laken per mens per dag (de werkbank). Dan dekt een volle kooi (20 schapen, 80 wol, min 20 voor de
      heer) zo'n 33 ambachtslieden, en de kudde groeit met lammeren zolang er plaats is in de kooi. Andere wegen: meer wol
      per schaap, of wol te koop bij de marskramer.
    - **d, eerst a, b en c, en de bouwer nog eens;** dan de pagina met ontwerpen voor de ui (vraag 84, a), 2c en 2e. 2e is
      het eind (een jaar lang iedereen super gelukkig), en dat vraagt een jaar dat te winnen is.
    Vragen: **a**, de bouwer zo? **b**, een werkplaats tot er genoeg ligt? **c**, laken naar 0,005, of liever een andere
    weg? **d**, die volgorde?
    **Beantwoord (Marcel, 2 okt):** "a ja b ja c ja d ja". Dus alle vier: de bouwer volgt ook het goud van de raad, een
    werkplaats maakt tot er genoeg ligt, laken 0,005 per mens per dag, en dan de bouwer nog eens, vóór de pagina met
    ontwerpen voor de ui. **Af** (zie onder Af); de speeltest staat in `speelbaar.md`, en wat eruit volgt, is vraag 92.
92. **Na vraag 91: het graan** (Claude, 2 okt, drieëntwintigste sessie; beantwoord). De speeltest (`speelbaar.md`):
    met de belasting heeft de bouwer goud (tot 26 à 63 in het tweede jaar), en hij bouwt alles wat de treden vrijmaken
    (een bakkerij, een molen, een weverij, een markt, een tweede herberg). Bij zaad 1 hebben aan het eind drie van de
    vier stenen huizen alles: voor het eerst is een stenen huis super gelukkig (10 van de 19 huizen). Maar:
    - **Het brood eet het graan op.** Een ambachtsman wil 0,03 brood per dag, en dat brood komt bovenop wat hij eet: de
      molen maalt er graan voor (eerst zo'n 60 voor de voorraad meel en brood, dan een graan per dag voor dertig
      ambachtslieden). Het graan van de 179 akkertegels is bij honderd man na een maand of drie op, ook zonder molen;
      daarna eet het dorp melk, kaas en vlees. Met de molen erbij at het dorp bij zaad 2 en 3 in de tweede winter zijn
      zaaigraan op, en bleef in het derde jaar vrijwel alles ongezaaid (172 à 179 van de 179 tegels): dan komt er geen
      oogst. En zonder graan brouwt de herberg geen bier en maalt de molen niets.
    - **De heer:** in het tweede jaar 26 à 46% (de schandpaal); bij zaad 1 was het ambt op Sint-Maarten van het tweede
      jaar kwijt. **Laken:** bij zaad 3 waren er 49 ambachtslieden; een volle kooi dekt er 33.
    Voorstel:
    - **a, brood is eten.** Wat een huis aan brood krijgt, eet het minder aan graan; en net zo met het vlees en de vis die
      de dorpelingen willen. Dan kost een bakkerij geen graan extra: hij maakt van graan brood, en wie brood eet, eet
      geen pap. De eenvoudigste regel, en hij klopt ook. Nu verdwijnt dat graan twee keer.
    - **b, graan van buiten op de markt.** Marcel koos het op 26 sep ("Ja er wordt graan van buiten gebracht naar de
      markt"), en het is nooit gebouwd: zo kan een dorp groter worden dan zijn akkers, en gaat het goud van de belasting
      naar graan. Eerst een plan.
    - **c, de bouwer nog eens na a**; de heer en zijn eis (vraag 59, C) en het laken voor meer dan 33 ambachtslieden
      (een tweede kooi) daarna.
    - **d, de volgorde:** a, de bouwer, dan het plan voor b; de pagina met ontwerpen voor de ui (vraag 84, a) daarna.
    Vragen: **a**, brood (en vlees en vis) als eten? **b**, graan op de markt, eerst een plan? **c** en **d**, zo?
    **Beantwoord (Marcel, 2 okt):** "A ja, maar brood is wel minder lekker en levert minder blijheid op. B prima, maar
    moet dat nu? We focussen op een kleine speelbare demoversie. C en d prima". Dus: brood, vlees en vis zijn eten, en
    brood telt minder mee in hoe blij een huis is dan de andere wensen; het graan van de markt komt later (achteraan bij
    "Daarna", na de demo); dan de bouwer nog eens, en daarna de pagina met ontwerpen voor de ui. **Af** (zie onder Af),
    met erbij een fout die de speeltest liet zien: de molen maalde het zaaigraan. Wat eruit volgt, is vraag 93.
93. **Na vraag 92: wie de heer bedriegt, heeft graan over?** (Claude, 2 okt, drieëntwintigste sessie; beantwoord).
    De speeltest (`speelbaar.md`): brood als eten houdt het ambt (de heer kreeg bij zaad 1 77 en 67% in plaats van 49 en
    26%), en sinds een werkplaats het zaaigraan laat liggen, blijven er in het derde jaar 30 à 96 van de 179 akkertegels
    ongezaaid in plaats van vrijwel allemaal; wat er dan nog weggaat, zijn rovers, een bruiloft en de soldaten van de
    heer. Maar **het graan is de kern geworden:** wat er van de oogst overblijft na het eten, het zaaigraan en de heer, is
    wat er aan bier en brood kan komen, en met "Graan" op "Honger" (Marcel, 24 sep: "wie alles betaalt, komt elk jaar
    graan tekort: de heer bedriegen is nood") is dat bij honderd man bijna niets. De bouwer betaalt de heer alles en
    verstopt niets; aan het eind van de tweede winter missen elf à dertien huizen bier en de stenen huizen brood, en
    hebben alleen de boerderijen alles. Dat is precies de spanning van het spel: betaal je de heer, of maak je je mensen
    blij? Voorstel:
    - **a, een sluwe bouwer** in de speeltest (gereedschap, geen spel): de bouwer, maar hij verstopt graan voor de inner en
      de heer zoals de slimme speler (60% weg, 's nachts, niet bij de roddelaar) en betaalt de heer 90%. Dan zien we of de
      kern zelf, rijk worden en arm lijken, een jaar met iedereen super gelukkig haalbaar maakt, of dat het graan voor
      honderd man te krap is.
    - **b, daarna kiezen:** is het ook dan te krap, dan voor de demo meer graan (bijvoorbeeld "Graan" op "Net rond") of
      minder bier en brood per mens; anders zo laten.
    - **c, de volgorde:** eerst a en die speeltest, dan de pagina met ontwerpen voor de ui (vraag 84, a), in een nieuwe
      sessie, want deze is groot.
    Vragen: **a**, een sluwe bouwer? **b**, zo kiezen? **c**, die volgorde?
    **Beantwoord (Marcel, 2 okt):** "A. Ja goed idee. De bouwer mag alles er aan doen, totale vrijheid. B. Ja inderdaad
    C. Ja prima, moeten we dit al in nieuwe sessie doen?" Dus een sluwe bouwer met **totale vrijheid**, in een nieuwe
    sessie (deze was groot). Wat dat kan zijn, als begin voor het plan: alles wat de bouwer nu doet (de wensen, de
    belasting, de erven, de treden), en daarbij alles wat de slimme speler doet (60% graan en goud weg, 's nachts als
    niemand kijkt en niet bij de roddelaar; met de inner praten en hem 10 goud geven; met hem lopen waar hij niets nieuws
    ziet; de soldaten langs lege kelders leiden; de heer 90% betalen; na Sint-Maarten alles terughalen), en wat er verder
    aan knoppen is: houtkap in het bos van de heer, het rantsoen, graan verkopen en zaaigraan kopen, een wachthuis tegen
    de rovers. De uitslag zegt of rijk worden en arm lijken een jaar met iedereen super gelukkig haalbaar maakt (B).
94. **Het plan voor vraag 93, a: de sluwe bouwer** (Claude, 2 okt, vierentwintigste sessie; beantwoord). Eerst wat de regels
    zelf zeggen, want dat verandert de vraag een beetje:
    - **Bier kost bijna geen graan.** De herberg brouwt 8 kan van 0,2 graan (`T.GEBOUWEN.herberg.maakt`); honderd man
      drinken samen zo'n 30 graan per jaar.
    - **Het dorp eet het graan als eerste op,** vóór de kaas en het gezouten vlees, en vóór de werkplaatsen hun deel nemen
      (`T.tikGebouwenDag`: eerst eten, dan maken). Daarna ligt er alleen nog het zaaigraan, en dat laten de herberg en de
      molen liggen (vraag 92). Zo staat de herberg zo'n negen maanden per jaar stil, terwijl er kaas en vlees genoeg is: er
      stierf niemand. **Het tekort aan bier is dus een kwestie van volgorde, niet van hoeveelheid.** Bij brood ligt het
      anders: een brood kost een graan, maar brood is eten, dus wie brood eet, eet minder pap.
    Voorstel: de sluwe bouwer doet alles wat de bouwer doet (`gereedschap/speeltest/speler.js`, dezelfde code, met een
    vlag erbij), en daarbij:
    - **a, de heer bedriegen, elk jaar,** zoals de slimme speler: de nacht vóór de dag vóór de inner 60% van het graan
      (boven het zaaigraan) en van het goud weg, waar niemand kijkt en niet bij de roddelaar; de inner opwachten, met hem
      praten, hem 10 goud geven en meelopen waar hij niets nieuws ziet; op Sint-Maarten de soldaten langs lege kelders; de
      heer 90%. Na Sint-Maarten haalt hij het goud terug, om te bouwen.
    - **b, het graan blijft verstopt, voor de herberg en de molen.** Dat is het nieuwe: hij haalt telkens een beetje terug
      als de herberg of de molen stilstaat, en vóór 1 lentemaand wat er aan zaaigraan mist. Hij verstopt het dus ook voor
      zijn eigen dorp, zodat het de kaas eet en het graan voor bier en brood blijft.
    - **c, de andere knoppen, alleen als de raad erom vraagt:** een krap rantsoen als het eten de winter niet haalt, en
      houtkap in het bos van de heer als het hout de winter niet haalt (de boete is 5 goud). Geen wachthuis: vechten kan
      de schout het leven kosten, en de rovers namen in twee jaar 30 graan. Wat opviel: een krap rantsoen maakt het dorp
      minder tevreden, maar een huis heeft dan nog steeds "alles", en dat is wat super gelukkig nu telt (voor 2e).
    - **d, meten:** twee jaar, zaad 1 tot en met 3, naast de bouwer van vraag 92, met een **graanboek** per jaar: waar
      het graan bleef (de oogst, het zaaigraan, gegeten, de heer, bier, brood, verkocht, rovers, soldaten, verstopt).
      Dan weten we bij B (vraag 93) waar het knelt. Helpt b het meest, dan is de keuze voor de demo misschien niet meer
      graan, maar een regel: het dorp laat graan liggen voor de herberg en de molen, zoals nu al het zaaigraan.
    Niet nu: langzamer groeien (geen nieuw erf als de huizen bier of brood missen); eerst zien of bedriegen genoeg is bij
    dezelfde groei als de bouwer.
    Vragen: **a**, **b** en **c** zo? **d**, met het graanboek?
    **Beantwoord (Marcel, 2 okt):** "ja prima". Dus a tot en met d, zoals hierboven. **Af** (zie onder Af); de speeltest
    staat in `speelbaar.md`, en wat eruit volgt, is vraag 95.
95. **Na vraag 94: het brood, en een jaar dat te winnen is** (Claude, 2 okt, vierentwintigste sessie; beantwoord). De speeltest
    (`speelbaar.md`): de sluwe bouwer heeft meer bier en brood dan de bouwer (in het tweede jaar 34 à 80 dagen zonder bier,
    tegen 122 à 141), de heer krijgt bijna niets en het ambt blijft, maar ook hij heeft nooit een dag waarop alle huizen
    alles hebben. Het graan is niet te krap voor het bier (een kan is een veertigste graan), wel voor het brood. Een
    gewonnen dorp heeft alleen stenen huizen, en het brood van één stenen huis (8 ambachtslieden, elk 0,03 per dag) kost 86
    graan per jaar. De 179 akkertegels geven na het zaaigraan, de heer en de rovers zo'n 380. Dat is genoeg voor vier
    stenen huizen, een dorp van zo'n 55 mensen. Meer graan ("Net rond", 4 per tegel) geeft er 90 bij: één stenen huis.
    Voorstel:
    - **a, brood naar 0,01 per ambachtsman per dag** (één getal in de werkbank, `T.WENSEN_INSTELLINGEN.perMens.brood`; nu
      0,03). Dan kost het brood van een stenen huis 29 graan per jaar, en zijn er met hetzelfde graan tien à elf stenen
      huizen te voeden: met de boeren een dorp van zo'n 100 à 110 mensen, de maat van de demo. De molen maalt dan ook
      minder (hij maalt tot er 30 meel ligt), zodat er graan overblijft voor het bier. De andere weg is ontginnen: meer
      akkers voor een groter dorp, zoals in Anno 1602 (6b, later).
    - **b, de ligging.** In elk spel missen een paar huizen het hele tweede jaar de herberg of een markt binnen 30 tegels,
      en er past er geen meer bij ("vindt geen plek waar een herberg iemand helpt"). Voorstel: de bouwers wijzen een erf
      alleen aan waar het nieuwe huis de herberg, een kapel en een put in zijn kring heeft, zoals een speler die naar de
      kringen kijkt. In het spel zelf komt dat met 2c: bij het aanwijzen van een erf zeggen in welke kringen het valt
      (`opmerkingen.md`, 1 okt).
    - **c, "Daar kun je niet bij" repareren** (`opmerkingen.md`): `T.randVanGebouw` kiest eerst de randtegels waar de
      schout kan komen (`T.kanErKomen`). Eén functie, met een toets.
    - **d, daarna** de sluwe bouwer en de bouwer nog eens: komen er dagen, of een jaar, waarop alle huizen alles hebben?
      Dan het laken (een volle kooi dekt 33 ambachtslieden, en tien stenen huizen zijn er 80), en de pagina met ontwerpen
      voor de ui (vraag 84, a). De inner die uit te schakelen is (vraag 46, A), blijft voor het bijstellen.
    Vragen: **a**, brood naar 0,01? **b**, de bouwers zo, en het spel met 2c? **c**, repareren? **d**, die volgorde?
    **Beantwoord (Marcel, 3 okt):** "A. Ok, maar er moet altijd druk zijn om voldoende eten. Het mag niet te makkelijk.
    Verder akkoord met b c d". Dus brood naar 0,01, en de speeltest kijkt erbij of er druk blijft om eten: zegt de raad
    nog dat het eten de winter niet haalt, moeten er jagers bij, en raakt het graan op? Is het te makkelijk geworden, dan
    eerst een voorstel aan Marcel. En b, c en d zoals voorgesteld. **Af** (zie onder Af); de speeltest staat in
    `speelbaar.md`, en wat eruit volgt, is vraag 96.
96. **Na vraag 95: de herberg en de markt, en de keten** (Claude, 3 okt, vierentwintigste sessie; beantwoord). De speeltest
    (`speelbaar.md`): brood 0,01 maakt het eten niet makkelijker (honger in de eerste zomer, in het tweede jaar op 162 à 175
    dagen "het eten haalt de winter niet", zes jagers), maar het bier en het brood wel: het bier ontbrak in het tweede jaar 0
    à 62 dagen in plaats van 69 à 199. Bij de sluwe bouwer met zaad 1 hadden alle huizen op 79 dagen alles. Een gewonnen
    jaar (een jaar lang alle huizen alles) haalt nog geen spel; de langste reeks is 26 dagen. Wat nu remt:
    - **de ligging:** in elk spel pasten er maar drie erven binnen de kring van de herberg (30 tegels). De erven daarna
      kwamen verder weg, en hun huizen missen de herberg of een markt: in vijf van de zes spellen misten een paar stenen
      huizen het hele tweede jaar een markt binnen 30 tegels, en een tweede herberg of markt "vindt geen plek waar hij
      iemand helpt". Een dorp dat alleen erven binnen de kring aanwijst, blijft steken rond de 50 mensen, en dat is te klein
      (vraag 77);
    - **de keten:** de bakkerij kwam vóór de molen, bij zaad 2 een half jaar eerder, en zolang is er geen brood.
    Voorstel:
    - **a, de kring van de herberg en de markt naar 40** (de werkbank), zoals de kapel (vraag 87, c, om dezelfde reden):
      dan past er bijna twee keer zoveel binnen, en bereikt één markt bij het midden de huizen eromheen. Of eenvoudiger:
      één herberg en één markt zijn genoeg voor het hele dorp, zonder kring.
    - **b, de bouwers bouwen een keten in één keer:** zegt de raad "bouw een bakkerij en een molen", dan allebei.
    - **c, daarna** de speeltest, dan het laken, en dan de pagina met ontwerpen voor de ui (vraag 84, a). De honger na de
      eerste zomer staat in `opmerkingen.md`: na de eerste oogst heeft niemand meer honger, met of zonder brood, want de
      jagers en de melk voeden iedereen. Hoort dat bij de demo, of later?
    Vragen: **a**, de herberg en de markt naar 40, of één van elk voor het hele dorp? **b**, de bouwers zo? **c**, die
    volgorde, en de honger na de eerste zomer: nu of later?
    **Beantwoord (Marcel, 3 okt):** "A. Ja, 1 markt 1 herberg voor nu. B prima. C dat kan later, we hebben een speelbaar
    dorp nodig. Wel met 1 of 2 feesten erin voor de demo". Dus één herberg en één markt zijn genoeg voor het hele dorp
    (voor nu: een spelregel, met de kring als andere keuze), de bouwers bouwen een keten in één keer, de honger na de eerste
    zomer komt later, en eerst een speelbaar dorp, met één of twee feesten voor de demo (het plan is vraag 97).
97. **Eén of twee feesten voor de demo** (Claude, 3 okt, vierentwintigste sessie; open). Marcel, 3 okt: "Wel met 1 of 2
    feesten erin voor de demo". Wat er al is (`spel.md`, "Dorpsfeesten"): drie voorvallen zijn feesten (de bruiloft, het
    oogstfeest, het lied over de heer). Bij het oogstfeest komt een boer na de oogst vragen of er een feest komt (groot: −40
    graan en −15 bier; klein: −15 graan; geen), en het dorp is er een tijd blijer of bozer om. Maar je ziet er niets van: het
    is een gesprek en een getal. Voorstel:
    - **a, het oogstfeest wordt een echt feest:** zeg je ja, dan gaat de avond erna het hele dorp naar het plein (een anker
      voor die avond, zoals de herberg 's avonds: `T.dagAnker`), met lantaarns die branden (`T.lichtBronnen`) en de
      herbergierster die tapt; de schout kan erbij gaan staan. Het kost wat het nu kost, en de stemming blijft. Wat op is,
      kan de inner niet tellen: als het voor zijn komst valt, telt hij minder graan (dat doet het nu al).
    - **b, een tweede feest,** te kiezen: de **kermis** (eens per jaar op de dag dat de kapel klaarkwam: "kermis" is
      "kerkmis"; kost bier, en de marskramer komt die dag mee), of de **meiboom** op 1 bloeimaand (een lichte avond in de
      lente, vóór de hongerige zomer). Het werkt zoals a.
    - **c, een feest is zichtbaar,** voor de demo en de trailer (`commercieel.md`): iedereen op één plek, met licht in de
      avond. Muziek komt met het geluid (januari, vraag 84, b).
    - **d, de volgorde:** eerst A en B van vraag 96 en de speeltest, dan a, b en c.
    Vragen: **a**, het oogstfeest zo? **b**, de kermis of de meiboom? **c** en **d**, zo?
    **Beantwoord (Marcel, 3 okt, vlak voor een vlucht van twee uur):** het oogstfeest "Ja, een hele dag vrij", het tweede
    feest "De meiboom", en voor tijdens de vlucht: "De feesten bouwen, Schetsen voor de ui, Plan voor het laken"; pushen
    "Ook naar main" (na elk af stuk, met de controle uit `CLAUDE.md`). Dus: zeg je ja op het oogstfeest, dan werkt de dag
    erna niemand en is het hele dorp op het plein, tot in de avond; dat kost een dag werk bovenop het graan en het bier. De
    meiboom werkt net zo, op 1 bloeimaand, het eerste feest dat een speler ziet (het spel begint op 1 lentemaand). De
    speeltest van vraag 96 koos hij niet. **Af** (zie onder Af).
98. **De ui als papieren: welke richting?** (Claude, 3 okt, vijfentwintigste sessie, tijdens Marcels vlucht; vraag 84, a;
    open). De pagina met ontwerpen staat er: "De ui als papieren" (https://claude.ai/artifact/JRKq7fwaANmLd3fGc4EbD8), vier
    borden met hetzelfde spelscherm (13 lentemaand, Wolfsdonk), elk met de balk, het venster van een huis (wat het wil,
    voor 2c) en een papier (het rapport van de raadsman, of de brief van de heer met zijn lakzegel). Het papier, het hout,
    het leer en de lakzegel zijn uit de kleurrampen van het spel gerenderd (`gereedschap/pixelart/kern.cjs`), als schets.
    - **A, perkament:** alles is papier op het beeld: de balk een strook, de knoppen een lijstje, het huis een briefje aan
      een spijker, het rapport een vel. Gotische pixelletter voor de koppen, oud drukwerk voor de tekst.
    - **B, hout en ijzer:** een houten paneel onderin met ijzeren hoeken, zoals Anno 1602; de brief op perkament met de
      lakzegel; het huis op een plankje.
    - **C, de schrijftafel:** geen balk bovenin: onderin de tafel van de schout, met het rekenboek open (de voorraad, "geteld
      vanochtend, door Aaltje", zoals vraag 77, b wil: wat je weet, is wat er het laatst geteld werd), de brief, het wetboek
      en de velden als dingen op tafel, en bij het huis een briefje aan een spijker (2c: het teken bij de deur). Het dorp
      blijft het meest vrij.
    - **D, licht en stil:** de ui van nu, maar met vierkante pixelranden en een pixelletter; alleen brieven en het rapport
      zijn papier. Het minste werk.
    - **De letter:** vijf naast elkaar (twee gotische pixelletters, oud drukwerk, een pixelletter, en Georgia van nu).
    Voorstel van Claude: **C**, met het venster van A en de letter van A (Jacquarda Bastarda 9 voor koppen, IM Fell English
    voor tekst). C maakt de haak zichtbaar ("je bent de schout in het dorp": wat je weet, ligt op je tafel), laat het dorp
    het meest vrij voor de beelden en de trailer, en het rekenboek is meteen de plek voor de laatst bekende telling. Nadeel:
    het meeste werk, en de tafel neemt onderin 100 pixels.
    Vragen: **a**, welke richting, of welke mengeling (de balk van, het venster van, het papier van)? **b**, welke letter?
    **c**, eerst alleen de nieuwe vensters van 2c in die stijl, en de rest van de ui later (januari, met de Steam-pagina)?
    **Beantwoord (Marcel, 3 okt, na zijn vlucht):** "98 C". Dus de schrijftafel: onderin de tafel van de schout met het
    rekenboek, de papieren als dingen op tafel, en bij een huis een briefje aan een spijker; de letter van C (Jacquarda
    Bastarda 9 voor koppen, IM Fell English voor tekst). Op b en c gaf hij geen apart antwoord: zoals voorgesteld komt
    eerst wat 2c nieuw maakt in die stijl (het briefje bij een huis), en de rest van de ui later (januari, met de
    Steam-pagina).
99. **Het laken: genoeg voor een stad van stenen huizen?** (Claude, 3 okt, vijfentwintigste sessie, tijdens Marcels vlucht;
    open). Na vraag 96 was het laken de volgende stap. Uitgerekend uit de regels (`js/wensen.js`, `js/vee.js`,
    `js/gebouwen.js`):
    - **Wat een stad vraagt:** een ambachtsman wil 0,005 laken per dag, 1,8 per jaar. Een stenen huis (8 mensen) is 15
      laken per jaar; tien stenen huizen, de maat van de demo, 146.
    - **Wat er is:** het gehucht begint met 8 schapen en één kooi. Een schaap geeft 4 wol per jaar (scheren op 1
      zomermaand, een lam van dat voorjaar nog niet), de weverij maakt van 1 wol 1 laken, en de heer vraagt 20 wol per
      kooi. Een schaap werpt met 30% kans een lam in grasmaand, en de kooi bergt er 20; de heide heeft plaats voor 92.
    - **Wat dat geeft:** het eerste jaar 32 wol, min 20 voor de heer: 12 laken, genoeg voor 6 ambachtslieden, nog geen
      stenen huis. Het tweede jaar zo'n 10 schapen: 21 laken, voor zo'n 12. Een volle kooi (na een jaar of vijf) geeft 60 laken,
      voor 33. Tien stenen huizen halen het dus nooit met één kooi, en met een tweede kooi pas na jaren (en de heer vraagt
      dan 40 wol). Zolang er laken mist, is niemand super gelukkig, en is de demo niet te winnen.
    Voorstel:
    - **a, een schaap geeft 8 wol** (één getal in de werkbank, `T.VEE_INSTELLINGEN.wolPerSchaap`; nu 4): het eerste jaar 44
      laken (24 ambachtslieden, drie stenen huizen), een volle kooi 140 (76 ambachtslieden). Net als bij het brood (vraag
      95): de eenvoudige regel die het spel speelbaar maakt, gaat voor de werkelijkheid.
    - **b, de kudde groeit sneller:** 50% kans op een lam (nu 30%), zodat de kooi in een jaar of drie vol is in plaats van
      vijf. Dan is een tweede kooi iets om over na te denken, met de 20 wol voor de heer als prijs.
    - **c, de marskramer verkoopt laken,** in een dorp, voor goud (zoals in Anno 1602: wat je niet maakt, koop je): een
      paar pakken per bezoek, duur. Dan heeft het goud van de belasting een doel, en kan een tekort overbrugd worden. Of
      later, met de markt van de kleine stad (stap 6), waar ook het graan van buiten komt.
    - **d, de speeltest telt de dagen zonder laken,** zoals nu die zonder bier of brood, en daarna een speeltest.
    - Niet nu: vlas als tweede bron van laken (een gewas en een keten erbij), en minder laken per mens (de wens wordt dan
      onzichtbaar klein).
    Vragen: **a**, 8 wol per schaap? **b**, 50% lammeren? **c**, de marskramer met laken, nu of met de markt? **d**, zo?
    **Beantwoord (Marcel, 3 okt):** "99 a b c d ja". Dus 8 wol per schaap, 50% kans op een lam, de marskramer verkoopt
    laken in een dorp, voor goud, en de speeltest telt de dagen zonder laken; daarna een speeltest. **Gebouwd** (3 okt,
    zie onder Af). De speeltest erna (`speelbaar.md`): het laken loopt zodra de weverij er staat, maar de bouwers bouwen
    hem soms pas in de zomer van het tweede jaar, en het laken van de marskramer kon bijna niemand betalen. Wat eruit
    volgt, is vraag 102.
100. **2c, zien wat een huis wil: het plan** (Claude, 3 okt, vijfentwintigste sessie, tijdens Marcels vlucht; vraag 80, E,
    besloten; open). Wat er al is: elk huis weet wat het wil en heeft (`g.wensen`: stand, mensen, ✓ en ✗, tevredenheid),
    en de raad en het rapport zeggen wat de huizen het meest missen, met wat helpt (vraag 87). Wat er nog niet is, is het
    zien in de wereld. Voorstel, in deze volgorde:
    - **a, het teken bij de deur:** een huis dat iets mist, heeft boven zijn deur een klein teken met wat het het meest mist
      (het pictogram van bier, vis, brood, laken, of een kapel), zoals het uitroepteken van een voorval. Zo zie je over het
      hele dorp wat er ontbreekt, zonder venster. Een huis dat alles heeft, krijgt geen teken; een huis dat doorgroeit, kort
      een sterretje.
    - **b, het venster van een huis:** klik een huis, en je ziet wie er wonen (namen, zoals de muis nu), de stand, hoe
      tevreden, de wensen met ✓ en ✗ en wat helpt ("bouw een visser of een jager [B]"), en hoe ver het is met doorgroeien
      ("nog 12 dagen alles, dan een stenen huis; daarvoor 12 steen, je hebt er 0"). In de stijl die je kiest bij vraag 98.
    - **c, bij het aanwijzen van een erf de kringen:** welke put en kapel het nieuwe huis zou halen (`opmerkingen.md`, 1
      okt); de herberg en de markt hebben sinds vraag 96 geen kring meer.
    - **d, eerst de regels, dan het scherm:** één functie die zegt wat een huis toont (`T.huisToestand`, met toetsen), en
      dan het teken en het venster. Daar hoort het opsplitsen van `js/hud.js` bij (vraag 25, C), want het venster komt erin.
    Vragen: **a**, het teken altijd, of alleen als de schout in de buurt is (een spelregel)? **b**, het venster zo? **c**, de
    kringen bij het erf nu ook? **d**, wachten op vraag 98 (de stijl), of eerst a en c, die geen venster nodig hebben?
    **Beantwoord (Marcel, 3 okt):** "100 ja". Dus zoals voorgesteld: het teken bij de deur (altijd), het venster van een
    huis (in de stijl van vraag 98, C: een briefje aan een spijker bij het huis), de kringen bij het aanwijzen van een
    erf, en eerst de regels met toetsen, dan het scherm. Vraag 98 is beantwoord, dus er hoeft niets te wachten.
101. **2e, het eind en het jaar in het kort: het plan** (Claude, 3 okt, vijfentwintigste sessie, tijdens Marcels vlucht;
    vraag 80, F, besloten; gebouwd 3 okt). Wat er al was: twee eindschermen, je ambt kwijt en de schout gevallen (`T.ambtKwijt`,
    `js/heer.js`; `T.ui.toonEinde`). Er is nog geen winst. Voorstel:
    - **a, winnen:** elke dag telt het dorp of alle woningen stenen huizen zijn die alles hebben, en de boerderijen wat zij
      willen (`g.wensen.alles`, `js/wensen.js`); dan loopt er een teller, en een dag waarop één huis iets mist, zet hem op
      nul. Na een jaar (360 dagen, de werkbank) is het gewonnen. Linksboven staat het zolang het loopt: "Iedereen super
      gelukkig: 12 van 360 dagen".
    - **b, alleen een stad wint:** pas vanaf een aantal mensen (voorstel: 100, de maat van de demo; vraag 77: "een dorp van
      50 is als doel te klein"), anders win je met één stenen huis in een gehucht.
    - **c, de winst is een feest:** op de dag dat je wint, viert het hele dorp het op het plein (de feesten van vraag 97), en
      over dat beeld komt het eindscherm, met het jaar in het kort. Wie wint, kan verder spelen.
    - **d, verliezen:** naast je ambt kwijt en gevallen ook als er minder dan tien mensen over zijn (vraag 80, F), met
      hetzelfde scherm.
    - **e, het jaar in het kort:** op 1 lentemaand brengt de raadsman een jaarverslag, in de vorm van zijn rapport: hoeveel
      mensen er kwamen, stierven en wegtrokken, wat er geoogst werd en wat de heer kreeg, welke huizen doorgroeiden, welke
      feesten er waren, en wat het dorp het meest miste. Het eindscherm toont het laatste jaar zo.
    Vragen: **a**, een jaar lang, zoals besloten, of eerst korter om te testen (de werkbank)? **b**, vanaf 100 mensen? **c**,
    de winst als feest? **d**, ook bij minder dan tien mensen? **e**, het jaarverslag zo?
    **Beantwoord (Marcel, 3 okt):** "101 ja". Dus zoals voorgesteld: gewonnen na een jaar (360 dagen, in de werkbank)
    waarin alle huizen alles hebben, vanaf 100 mensen; de winst is een feest op het plein met het eindscherm erover;
    verloren ook bij minder dan tien mensen; en op 1 lentemaand een jaarverslag van de raadsman. **Gebouwd** (3 okt, zie
    onder Af).
102. **Naar een jaar dat te winnen is: wat er tussen een dorp van 100 en de winst staat** (Claude, 3 okt, vijfentwintigste
    sessie; stap 5 van vraag 79, de speeltest; opnieuw na vraag 106, met de maat eerst; open). Sinds 2e is er een eind, en de speeltest van het laken
    (`speelbaar.md`, 3 okt) zegt hoe ver het weg is. De dorpen halen 100 mensen in twee jaar (101 à 112), met 7 à 12
    stenen huizen. Maar geen spel kwam in de buurt van een gewonnen jaar: de langste reeks dagen waarop alle huizen alles
    hadden, was 51 (de sluwe bouwer), en bij de eerlijke bouwer 19. Vier dingen staan ertussen:
    1. **Het graan.** De eerlijke bouwer heeft na twee jaar geen graan meer, en zijn huizen missen bier (38 à 97 dagen in
       het tweede jaar). De oogst (433 à 564) gaat naar het zaaien, de molen, de herberg, de heer en de rovers, en dat is
       meer dan er is. Alleen wie de heer bedriegt, houdt graan over.
    2. **Het laken komt laat:** pas met de weverij, en die bouwt de bouwer soms pas in de zomer van het tweede jaar (105 à
       145 dagen zonder laken); het laken van de marskramer kon bijna niemand betalen.
    3. **De groei stopt niet:** elk nieuw gezin begint in een hut, en dan is niet iedereen in de hoogste stand. De bouwers
       wijzen erven aan zolang er gezinnen komen.
    4. **Eén slechte dag zet het jaar terug:** de teller begint opnieuw als één huis één dag iets mist.
    Het eerste voorstel (a: de bouwer speelt vier jaar; b: meer graan, door ontginnen, bij de marskramer, of zo laten; c:
    de raad noemt de weverij; d: een week mag; e: de groei stilzetten) wachtte op vraag 103, en c is door de verzoeken
    beantwoord: de weverij komt nu van een verzoek. Het staat in git (`21080e9`). De speeltest van de verzoeken liet zien
    dat de maat het eerst knelt: geen dorp haalde 100 mensen (76 à 98).
    **Opnieuw, met de maat eerst** (Claude, 3 okt, na vraag 106; Marcel: "ja, eerst plan voor 102"). Dit zegt de speeltest
    van de twee bazen (`0ed04ab`, `speelbaar.md`) over de eerlijke bouwer, zaad 1 tot en met 3, in zijn tweede jaar:
    - **De maat:** 96, 100 en 85 mensen (de sluwe bouwer 74 à 90). Van de 75 groeidagen in twee jaar kwam er op 18 à 21
      een gezin. Op 23 à 26 was er te weinig graan, op 29 à 32 haalde het eten de winter niet, en plaats was er altijd.
    - **Het graan:** de oogst (433 à 564) is kleiner dan wat eraf gaat (533 à 595): het zaaien 173 à 192, de molen 151 à
      177, de rovers, de soldaten en de voorvallen 79 à 101, de herberg 63 à 89, en de heer 41 à 69. Op 75 à 162 dagen lag
      er geen graan boven het zaaigraan, en op 173 à 175 dagen haalde het eten de winter niet.
    - **Het bier:** op 70 à 156 dagen was er geen bier, bijna precies op de dagen zonder graan boven het zaaigraan. Een kan
      bier kost een veertigste graan. Maar de herberg brouwt alleen van graan dat over is (`T.zaaigraanApart`), en
      hooguit 30 kannen vooruit (`werkplaatsMaaktTot`), genoeg voor een week.
    - **De reeks:** alle huizen hadden alles op 79 à 195 dagen. De langste reeks in twee jaar was 56 à 106 dagen. Zonder
      hut of huis (wat de winst vraagt) bleven er 35 à 111 dagen over. Het laken mist nog in de lente van het tweede jaar
      (5 à 65 dagen), tot de weverij er is.
    - **De heer:** zijn gunst eindigt op 28 à 42, en zakte tot 14 à 18. Wie eerlijk speelt, geeft hem te weinig, want het
      graan is er niet.
    **Wat Claude erin ziet: het is één knoop, en dat is het land.** De 209 tegels akker van het gehucht zijn in het derde
    jaar dezelfde als in het eerste. Bij zo'n 90 mensen is het land vol. Op de dagen dat er geen graan over is, breekt dan
    alles tegelijk. Er komt geen gezin (de maat), de herberg brouwt niet (het bier, en daarmee de reeks), en de heer krijgt
    te weinig (de gunst). In elk bouwspel groeit het land mee met de mensen; hier nog niet. En land is in ons spel politiek:
    de heide is de meent, van iedereen (er grazen de schapen van de herder, en zo komen de wol en het laken), en het bos is
    van de heer. Meer land is dan een beslissing over mensen, zoals vraag 103 wil, en geen rekensom.
    Voorstel:
    - **a, de maat: 100 blijft, en het land groeit mee door ontginnen, als een verzoek.** Een boerenzoon of een nieuw gezin
      komt het vragen, met de plek erbij: "Klaas wil het stuk heide achter de kooi ontginnen: een boerderij met 24 tegels
      akker." Ja helpt de een en kost de ander iets. Op de heide grazen dan minder schapen: de herder moppert, en er komt
      minder wol. Het bos is van de heer: de inner telt de nieuwe akker, en de pacht gaat omhoog. Of je ontgint diep in het
      bos, uit zijn zicht, stiekem, en dan is betrapt de laatste waarschuwing. Ontginnen kost een winter werk. Het is al
      besloten (25 sep, punt 6b). De open vragen staan in `spel.md` ("Ontginnen"), en het wordt eerst een eigen plan.
      Kleiner kan ook: **graan kopen**, bij de marskramer in de zomer, als het schaars en duur is (en later elke week op de
      markt, stap 6 van de slice). Dat is weinig werk, en het goud krijgt een doel, maar het land blijft hetzelfde. Of **de
      maat omlaag**, naar 75 à 80, wat het land nu voedt. Dat gaat het snelst, maar het dorp is dan kleiner dan de slice
      (100 tot 200).
    - **b, het bier breekt het eerst, en is het goedkoopst te redden.** Een jaar bier voor 100 mensen kost hooguit 45
      graan. Voorstel: na de oogst brouwt de herberg vooruit voor de magere maanden, tot de volgende oogst, zoals de boeren
      het zaaigraan apart houden. En mist het dorp bier omdat er geen graan is, dan vraagt de keten geen nieuwe herberg,
      maar zegt ze dat. Dat verklaart ook de drie of vier herbergen uit de speeltests (`0c`, punt 4).
    - **c, groeien en winnen:** een nieuw gezin op een erf begint in een hut, en dan begint de teller opnieuw. Voorstel:
      bij 100 mensen zegt de raad "Wie een jaar gelukkig wil, wijst geen erf meer aan." Nieuwe gezinnen trekken dan nog
      alleen in de plaats die doorgroeiende huizen vrijmaken, en daar breken ze niets. Een wet die de poort dichtzet (een
      derde stand van "Vreemden welkom": gesloten) is dan niet nodig. Een idee voor later: in een stad met marktrecht komen
      er ambachtslieden die meteen in steen bouwen, zodat groeien en winnen samengaan.
    - **d, een slechte dag:** een spelregel "Het eind", met "Een jaar op rij" (zoals nu) en "Een week mag": een slechte
      reeks van hooguit zeven dagen zet de teller stil, niet terug. Voorstel: "Een week mag" als standaard. Nu kost één
      aanval van de rovers of één late marskramer een heel jaar, en dat is pech, geen spel. Een jaar lang blijft het.
    - **e, de speeltest naar de winst:** de bouwer en de sluwe bouwer spelen vier jaar, en wijzen bij 100 mensen geen erf
      meer aan (c). Per jaar komen erin: het jaarverslag, de langste reeks en wat hem brak, en de twee bazen. Klaar als de
      eerlijke bouwer in het derde of vierde jaar wint zonder zijn ambt kwijt te raken, en de sluwe eerder wint, of
      betrapt wordt. Hoe lang dat is: een jaar duurt een uur op 30× en drie uur op 10×. Een winst in het derde jaar is dus
      drie à negen uur spelen, zoals een scenario in Anno. Voor een demo (Next Fest, een half uur à een uur) is dat te
      lang; die gaat dan over het eerste stuk, van gehucht tot dorp. Welk stuk de demo wordt, is een eigen vraag (`0c`).
    De volgorde, als het ja is: b, c en d (klein, één sessie), met het vertrouwen van vraag 106, stap 3. Dan de speeltest
    van vier jaar (e), die zegt hoeveel land er tekort is. Dan het plan voor ontginnen (a), en de speeltest opnieuw.
    Vragen: **a**, de maat 100, met ontginnen als verzoek (eerst een plan), of graan kopen, of de maat omlaag? **b**, de
    herberg brouwt na de oogst vooruit? **c**, de raad zegt het bij 100, zonder wet? **d**, "een week mag" als standaard?
    **e**, de speeltest zo, met de winst in het derde of vierde jaar als doel?
    **Marcel koos (3 okt): "102 a b c d e ja".** Dus alle vijf zoals voorgesteld, in de volgorde hierboven: eerst b, c en d,
    met het vertrouwen van vraag 106, stap 3; dan de speeltest van vier jaar; dan het plan voor ontginnen.
103. **De stad groeit door haar mensen, en jij bepaalt de richting** (Marcel, 3 okt, vijfentwintigste sessie: "Ik wil een
    iets andere richting op. De inwoners bouwen zelf een weverij etc. Ze vragen alleen toestemming om te bouwen. Jij
    beslist niet wie welk ambacht start natuurlijk. Stel er is een ondernemende inwoner die wapens wil maken etc. Zo groeit
    de stad zelf, door de mensen. Jij bepaalt alleen de richting?", en: "Ik ben bang dat het te snel saai wordt. Weer een
    bouw spelletje zelfde kettingen van materialen etc"; plan van Claude; open).
    **Wat Claude erin ziet.** De zorg klopt, en de speeltest laat het zien: een bot die de raad volgt ("bouw een weverij
    [B]"), speelt het spel al bijna zo goed als het kan. Zegt de raad wat je moet bouwen, en is dat altijd goed, dan valt
    er niets te kiezen: dan is het een rekensom, en dat is Anno. Het concept zegt iets anders ("De stad genereert de
    agenda"; de mensen hebben "een rol, een belang en een band met jou"; "bijna elke beslissing helpt de een en benadeelt
    de ander"), en Marcel zei het op 26 sep al als iets voor later: "misschien kunnen we later iets doen dat iemand een
    aanvraag komt doen om iets te bouwen". **De ketens blijven, maar onder water:** de huizen willen brood en laken, en
    een bakker of een wever maakt het, maar jij bouwt de keten niet; je ziet hem pas als hij hapert ("de bakker heeft
    geen meel"). Jouw beslissingen gaan over mensen: wie mag wat, waar, op wiens kosten, en wie heeft er last van.
    Voorstel:
    - **a, verzoeken in plaats van bouwen.** De werkplaatsen gaan uit het bouwmenu. Een inwoner die een ambacht wil
      beginnen, komt het je vragen, met een plek die hij zelf koos: "Geert wil een weverij beginnen op het erf achter de
      kapel." Je kunt gaan kijken, en dan: ja, nee, of ja met een voorwaarde (ergens anders; het dorp betaalt mee en hij
      begint meteen; hij betaalt een jaar geen belasting). Wie ja hoort, bouwt het met zijn gezin en is er de meester: het
      is zijn werkplaats. Het verzoek komt zoals een voorval (hij komt je zoeken), of als een papier op je tafel (de
      schrijftafel, vraag 98, C). Ben je weg, dan beslist je raadsman naar zijn karakter: een zuinige raadsman zegt
      eerder nee. Een spelregel "Wie bouwt": de mensen (nieuw), of jij (zoals nu).
    - **b, wie vraagt wat.** Meestal wat het dorp mist: de huizen willen laken, en wie kan weven, ziet zijn kans (dezelfde
      vraag die de raad nu stelt, `T.watDeHuizenMissen`). Maar soms wat iemand zelf wil, naar zijn karakter: de
      wapensmid, een tweede herberg die de eerste klanten afneemt, een woekeraar, een stokerij. Om die verzoeken gaat het:
      ja maakt de een rijk en de ander boos, en een wapensmid maakt de militie sterker, terwijl de heer zich afvraagt
      waarom zijn dorp wapens maakt. Wie nee hoort, onthoudt het, en kan het ook stiekem doen.
    - **c, de richting: oproepen en wetten.** Wat jij zelf doet: een oproep op het plein ("Het dorp zoekt een wever"),
      met een premie uit de kist, zodat iemand het oppakt of er een nieuwkomer met dat vak komt (met vreemden welkom gaat
      dat sneller); en de wetten, zoals nu. Zo trek je aan het dorp, maar je bouwt het niet.
    - **d, wat van iedereen is:** de put, de kapel, de markt en het wachthuis bouw jij, uit de kist van het dorp, want die
      zijn van niemand in het bijzonder. Of komen ook die als verzoek ("de buurt wil een put"), en wijs jij alleen nog
      erven aan?
    - **e, eerst klein:** de weverij, de bakkerij, de molen, de brouwerij en de smidse als verzoek, uit wat het dorp mist,
      met een handvol meesters met een naam en een karakter; de speeltest speelt met een bestuurder die verzoeken tekent
      en oproepen doet, in plaats van een bouwer. Daarna de verzoeken uit eigen wil (b), want die vragen gevolgen: wie
      boos is, wat de heer ervan vindt.
    **Wat het betekent voor wat er is:** de wensen, het doorgroeien, de erven, de voorvallen, de raadsman, de wetten en de
    heer blijven; ze krijgen er een taak bij. Vraag 102 wacht hierop: de weverij komt dan van een wever, en ook ontginnen
    kan een verzoek worden ("een boerenzoon wil het bos achter de heide ontginnen"). De meesters die verzoeken doen, zijn
    ook de "mensen met banden" van stap 5 van de slice, die zo naar voren komt. En het scherpt de haak (`commercieel.md`,
    vraag 83, c): "Je bouwt het dorp niet. Je bestuurt het."
    Vragen: **a**, verzoeken in plaats van bouwen, met de spelregel? **b**, uit wat het dorp mist én uit eigen wil? **c**,
    oproepen met een premie als jouw manier van sturen? **d**, de put, kapel en markt nog van jou, of ook als verzoek?
    **e**, eerst klein zo, en vraag 102 wacht?
    **Beantwoord (Marcel, 3 okt):** "103 a b c ja d ook verzoek e ja". Dus: de werkplaatsen komen als verzoek van de
    mensen, met een spelregel "Wie bouwt" (de mensen, of jij zoals vroeger); een verzoek komt uit wat het dorp mist én uit
    eigen wil; jij stuurt met oproepen met een premie en met de wetten; **ook de put, de kapel, de markt en het wachthuis
    komen als verzoek**, zodat jij alleen nog erven aanwijst; en eerst klein: de verzoeken uit wat het dorp mist, met een
    bestuurder in de speeltest, en daarna die uit eigen wil. Vraag 102 wacht.
    **Stap 1, 2 en 3 gebouwd** (3 okt, zie onder Af): de verzoeken uit wat het dorp mist, oproepen met een premie, en de
    speeltest die bestuurt in plaats van bouwt. Daarna: de verzoeken uit eigen wil.
104. **Verzoeken uit eigen wil: het plan** (Claude, 3 okt, vijfentwintigste sessie; het laatste deel van vraag 103, b;
    beantwoord). Er is nu: wat het dorp mist, vraagt iemand je (stap 1), je stuurt met oproepen (stap 2), en de speeltest
    bestuurt (stap 3). Wat er nog niet is: iemand die iets wil wat niemand mist, uit zichzelf, zoals Marcels voorbeeld
    ("Stel er is een ondernemende inwoner die wapens wil maken"). Daar zitten de keuzes die het spel anders maken dan een
    bouwspel: ja maakt de een rijk en de ander boos. Voorstel, klein:
    - **a, twee ondernemers om mee te beginnen,** met wat er al is:
      1. **De wapenmaker.** Het gebouw is er al ("ijzer en hout tot wapens, voor de opstand. Verboden, dus verstopt").
         Na een aanval van de rovers, of in een dorp met een smidse, wil iemand wapens maken. Ja: de wachters vechten
         beter, maar het is verboden: ziet de inner hem, dan stijgt de argwaan, en vinden de soldaten hem, dan straft de
         heer. Nee: hij onthoudt het.
      2. **De tweede herberg.** In een dorp met één herberg wil iemand er een tweede beginnen. Ja: meer bier en plaats,
         maar de herbergierster is boos, en ze vechten om de gasten. Nee: de herbergierster is je dankbaar.
    - **b, wie nee hoort, onthoudt het:** zijn huis is een tijd minder tevreden, en na twee keer nee trekt hij weg (en kan
      als rover terugkomen, zoals nu wie wegtrekt). De wapenmaker kan het ook stiekem doen: een verstopte werkplaats in
      zijn kelder, die de inner niet ziet maar de soldaten op Sint-Maarten kunnen vinden.
    - **c, wie ja hoort, is je dankbaar:** de meester (die er nu al is) onthoudt het; met stap 5 van de slice (mensen met
      banden) wordt dat een band met jou.
    - **d, wie ondernemer is:** een bewoner met ondernemingszin, geloot uit het zaad van het spel zoals het karakter van de
      boeren, zodat elk spel andere ondernemers heeft.
    Vragen: **a**, deze twee om mee te beginnen? **b**, nee onthouden, wegtrekken, en stiekem? **c**, zo? **d**, geloot uit
    het zaad?
    **Beantwoord (Marcel, 3 okt):** "104 a b c d ja". Dus: eerst de wapenmaker en de tweede herberg; wie nee hoort,
    onthoudt het, trekt na twee keer weg en kan stiekem beginnen; wie ja hoort, is je dankbaar; en wie ondernemer is,
    komt uit het zaad van het spel. De volgorde: eerst de wapenmaker (Marcels eigen voorbeeld), dan de tweede herberg.
    **Gebouwd** (3 okt, zie onder Af; hoe het werkt in `spel.md`, "De verzoeken").
105. **Wat ons uniek maakt** (Marcel, 3 okt, vijfentwintigste sessie: "Ik ben op zoek naar meer mogelijkheden om ons spel
    'uniek' te maken"; na Norland, `commercieel.md`; voorstel van Claude; open). **Het inzicht:** uniek is pas uniek als je
    het ziet: op één plaatje, in één zin, en in het eerste kwartier van de demo. Ons diepste idee (je bestuurt als één mens,
    tussen de heer en het dorp) zit nu in regels die je niet ziet: de inner telt wat hij ziet, de raadsman beslist als je
    weg bent. De sterkste ideeën maken die regels zichtbaar. Ze komen ná de speelbare kern (vraag 102), en vóór de demo.
    - **a, het zicht van de inner, te zien:** tijdens zijn bezoek zie je zijn blik als een kegel over het dorp, zoals in
      een sluipspel (Commandos); wat erin valt, telt hij. Je loopt met hem mee en leidt hem langs de arme kant. In een
      snelle zoektocht vond ik geen bouwspel waarin de belastinginner een zichtveld heeft. Klein tot middel: zijn zicht
      bestaat al (`T.innerKijkt`, `T.zietTegel`); nieuw zijn het tekenen en een teller van wat hij nu ziet. Dit is de
      GIF voor de Steam-pagina: "Lead the tax collector around your village."
    - **b, wat je weet, is wat je zag:** de balk toont wat er het laatst geteld werd, en hoe oud dat is ("graan 140,
      eergisteren"). Tellen doe je door langs de schuur te lopen, of via het rapport van je raadsman. Dit staat al in het
      concept (vraag 77, b), en het maakt de haak echt: Norland en Manor Lords tonen alles live. Middel: de balk, de raad
      en het rapport lezen nu de echte voorraad.
    - **c, twee boeken:** op Sint-Maarten geef je de heer je eigen boek, dat je zelf invult; de inner legt zijn rapport
      ernaast, en wat hij kan bewijzen, kost argwaan. Papers, Please in een dorp. Middel tot groot: een stap op
      Sint-Maarten en een papier op de schrijftafel.
    - **d, de brieven van de heer als de stem van het spel:** elke maand een brief met een gril (een standbeeld van
      hemzelf, belasting op ramen, de mooiste geit), en je kiest je antwoord (vleien, uitstellen, weigeren). Weinig
      bouwspellen hebben deze zwarte humor, en een brief is een schermafdruk die mensen delen. Klein: de brieven en de
      grillen bestaan al; het is vooral schrijven.
    - **e, het dorp praat, en je ziet het gaan:** wat een getuige zag, vertelt hij in de herberg, en daarna gaat het van
      mond tot mond verder, met een wolkje boven wie het zegt, tot de inner het hoort. Je kunt zelf ook iets laten
      rondgaan, via de herbergierster. Middel: de getuigen en de roddel bestaan al; het doorvertellen is nieuw.
    - **f, je dag is schaars:** mensen vragen je op een tijd en een plek (de molenaar om twaalf uur bij de molen). Wie je
      mist, regelt je raadsman, of het gaat mis. Een agenda op de schrijftafel: het bestuursspel als de dag van één mens.
      Middel.
    Wat al uniek is en alleen getoond moet worden: het gevecht in beurten in je eigen straten, met mensen die je bij naam
    kent (de rovers). En een zin die niet van ons is: "Middle management in the Middle Ages" heeft al een klein spel op
    itch.io (*Medieval Middle Manager*); als zin in de beschrijving kan hij, als haak niet.
    **Advies:** a, b en d voor de demo. Samen laten ze in één GIF, één schermafdruk en één lach zien dat je een mens bent
    tussen de heer en het dorp. c en e daarna, f misschien.
    Vragen: **a** tot en met **f**: welke ja, en welke voor de demo? En komt b (wat je weet, is wat je zag) vóór de demo,
    omdat het verandert hoe je vanaf het begin speelt?
    **Marcel (3 okt), over a en c:** "Kijk dat hele verstoppen verhaal is een beetje lame. Dat is 1x leuk en dan niet
    langer boeiend. Of de gevolgen moeten echt groter zijn. Je wordt weg gevraagd als je niet ophoest wat ze willen hebben
    van je ofzo. Maar als de grote hook, te slap." Dus a en c niet als haak: ze zijn verstoppen in een nieuw jasje. Wat dan
    wel: vraag 106. De rest (b, d, e, f) wacht op zijn antwoord.
106. **Twee bazen: de heer en het dorp kunnen je allebei wegsturen** (Claude, 3 okt, vijfentwintigste sessie, na Marcels
    reactie op vraag 105; voorstel; open). **Waarom verstoppen maar één keer leuk is:** het is een puzzel met één
    oplossing. Weet je eenmaal waar de inner kijkt, dan is hij opgelost; hij komt één keer per jaar, en een fout kost
    weinig. Wat blijft boeien, is een keuze waarvan het goede antwoord elke keer anders is, omdat de mensen, de eisen en
    de toestand anders zijn. **Het voorstel:** haak 1 ("De heer wil geld. Het dorp wil leven. Jij staat ertussen.",
    `commercieel.md`) wordt de kern van het spel, en niet alleen een zin. Nu is alleen het dorp echt: je wint door
    iedereen gelukkig te maken, en de heer is een rekening.
    - **a, de heer kan je wegsturen, en dat voel je.** Hij eist zijn schatting, en elke maand een gril in een brief:
      mannen voor zijn oorlog, een feest voor zijn bezoek, een standbeeld, zijn jacht in jouw bos. Wie niet levert, ziet
      zijn gunst zakken, met een duidelijke waarschuwing ("Nog één keer, schout."), en dan ben je je ambt kwijt. Dat
      bestaat nu ook, maar pas na twee jaar onder de helft, dus het komt zelden en je ziet het niet aankomen.
    - **b, het dorp kan je ook wegsturen.** Niet hoe tevreden ze zijn, maar wat ze van jóú vinden. Elke nee, elke
      schandpaal en elke man die je naar de oorlog stuurt, onthouden ze; de wrok van de ondernemers is daar het begin
      van. Elke ja en elk feest ook. Zakt het te ver, dan vragen ze je niets meer, en uiteindelijk staan ze voor je deur.
    - **c, verstoppen wordt één kaart, met echte gevolgen** (Marcel: "Of de gevolgen moeten echt groter zijn"): wie
      betrapt wordt, krijgt de laatste waarschuwing, of is meteen zijn ambt kwijt. Zo speel je hem zelden, en dan is het
      spannend.
    - **d, op één plaatje:** twee gezichten in de balk, de heer en het dorp, die meebewegen met wat je doet. In bijna
      elk bouwspel ben jij de baas; hier heb je er een, en je mensen kunnen je ook wegsturen.
    **Wat er al is:** de schatting, de straffen tot je ambt kwijt, de heervaart, de grillen van de heer (het standbeeld,
    de jacht, de ramen), de wrok per huis, de voorvallen. **Nieuw:** twee meters met waarschuwingen, een brief met een
    gril elke maand, en een tweede manier om te verliezen. **Wat het met het eind doet:** winnen blijft een jaar lang
    iedereen gelukkig (vraag 101), maar terwijl de heer krijgt wat hij wil. Dat is precies het knelpunt: wat de mensen
    gelukkig maakt, kost wat de heer wil hebben. Het hoort dus vóór vraag 102, want het verandert wat winnen is.
    Vragen: **a**, de heer zichtbaar en sneller? **b**, kan het dorp je wegsturen? **c**, wie betrapt wordt: de laatste
    waarschuwing, of meteen weg? **d**, twee gezichten in de balk? En dit vóór vraag 102?
    **Beantwoord (Marcel, 3 okt):** "106 a b c d ja, push main". Dus: de heer kan je wegsturen, en je ziet het aankomen;
    het dorp kan je ook wegsturen; verstoppen wordt één kaart met echte gevolgen; en twee gezichten in de balk. Bij c
    koos hij niet tussen de laatste waarschuwing en meteen weg: dat wordt een spelregel, met de laatste waarschuwing als
    standaard (Claude), tot Marcel anders kiest. Of het vóór vraag 102 komt, zei hij niet; Claude doet het eerst, omdat
    het verandert wat winnen is.
    **Het plan** (Claude, 3 okt):
    - **Stap 1, de twee meters.** De gunst van de heer en het vertrouwen van het dorp in jou, elk van 0 tot 100, met
      wat ze nu al beweegt: de schatting op Sint-Maarten, de heervaart, de schandpaal, wapens die hij vindt (de heer); de
      antwoorden op de voorvallen, de ondernemers, doden door honger of kou, en soldaten in huis (het dorp). Onder een
      grens een waarschuwing, op 0 ben je weg: de heer ontslaat je, of het dorp jaagt je weg. Betrapt op verstoppen: de
      laatste waarschuwing (c). En de twee gezichten in de balk, met bij de muis waarom (d).
    - **Stap 2, de brieven.** Elke maand een gril van de heer in een brief, met antwoorden die de een tevreden maken en
      de ander niet: zijn gunst tegen het vertrouwen van het dorp. Een stuk of vijftien grillen, zodat twee jaar niet
      herhaalt.
    - **Stap 3, de speeltest.** Wordt er iemand weggestuurd, en is het te streng of te slap? De getallen in de werkbank.
      **Twee keer gespeeld** (Claude, 3 okt; `speelbaar.md`). De gunst werkt: wie de heer betaalt, houdt hem (de
      slimme 77 à 98, de sluwe 94 à 100), en wie te weinig geeft, zakt; drie spellen kregen een waarschuwing, en niemand
      raakte zijn ambt kwijt. Het vertrouwen nog niet. De eerste keer liep het vol (89 à 100). Na het bijstellen
      (`00d25a5`: een voorval telt half, en per dag komt er alleen iets bij boven 75% tevreden) zakt het bij iedereen.
      Ook een dorp dat 90% tevreden is, eindigt op 30 à 48, en de bouwer na twee jaar op 2, 11 en 9, met een
      waarschuwing van het dorp. De klappen komen vooral van de heer: zijn soldaten (−10, elk jaar dat je te weinig
      betaalt) en de heervaart (−8). Per dag komt er bij 85% tevreden maar een half punt per maand bij. Zo telt het
      vertrouwen alleen de klappen op, en zakt het bij iedereen die lang genoeg speelt.
      **Voorstel (open): het vertrouwen volgt hoe tevreden het dorp is.** Elke dag gaat het een zestigste van de weg naar
      de tevredenheid (bij 85% tevreden naar 85), zodat een klap in een paar maanden wegslijt. Dan jaagt het dorp je weg
      als het slecht gaat (honger, kou) en je het daarbij nog eens raakt, en niet omdat de heer twee keer soldaten
      stuurde naar een dorp dat verder tevreden is. Dit moet vóór de speeltest van vier jaar (vraag 102, e). Vraag:
      **zo?** **Marcel (3 okt): "vertrouwen ook ja".**

107. **Ontginnen als verzoek: het land groeit mee** (Claude, 3 okt, vijfentwintigste sessie; vraag 102, a, Marcel: "102 a
    b c d e ja", en daar stond "eerst een eigen plan"; besloten op 25 sep als punt 6b, `spel.md`, "Ontginnen"; open).
    **Waarom:** de velden van het gehucht (179 tegels akker en 30 weide) zijn in elk jaar dezelfde, en bij zo'n 90 mensen
    is het graan op voordat de nieuwe oogst er is (vraag 102). De speeltest van vier jaar (vraag 102, e; `speelbaar.md`)
    zegt hoeveel: de oogst valt van zo'n 600 graan in het eerste jaar tot 340 à 450 in het vierde (een uitgeputte akker
    rust), terwijl de molen er 200 à 265 van wil, het zaaien 160 à 180, de herberg en de heer elk zo'n 40 à 60, en de
    rovers, de soldaten en de voorvallen 60 à 130. Op 150 à 280 dagen per jaar is er geen graan boven het zaaigraan, en
    in het vierde jaar mist het brood 150 dagen (de eerlijke bouwer). Wat tekort is, is zo'n 150 à 250 graan per jaar:
    drie à vijf velden van dertig tegels. De heide heeft er 184, waarvan de schapen er 40 nodig hebben. **En niet alleen
    het akkerland:** vanaf het derde jaar vindt de bouwer geen plek meer voor een erf, en zo blijft het dorp op 99
    mensen, één onder de 100 van de winst (vraag 102, e). Ontginnen kan ook bouwgrond geven.
    Een akker brengt per tegel 2,4 à 3,5 graan (de oogst in de speeltest), min 1 zaaigraan en 0,5 pacht voor de heer:
    netto 1 à 2. Een nieuw veld van dertig tegels geeft dus 30 à 60 graan per jaar, en stiekem, zonder pacht, 15 meer.
    Voorstel:
    - **a, wie, en wat het wordt:** als het dorp graan tekortkomt (de herberg of de molen staat stil om graan, of er komt
      geen gezin om het graan: dezelfde vraag die de raad stelt), komt een boer of zijn zoon het vragen: "Jan, de zoon
      van Klaas, wil het stuk heide naast hun akker ontginnen, dertig tegels." Ja: het veld hoort bij zijn boerderij, en
      zijn boeren zaaien en maaien het. Geen nieuwe boerderij en geen nieuw gezin: zo is het het kleinst, en groeit het
      land waar het dorp het nodig heeft. Een nieuw boerengezin met een eigen boerderij kan later, als er meer moet.
    - **b, waar, en wat het kost: de heide of het bos.** Zo kost elke keuze iets bij een van de twee bazen (vraag 106).
      De heide is de meent, van iedereen. Plaats is er genoeg: de kooi heeft 20 schapen, en die hebben 40 tegels nodig
      van de 184. Maar het dorp vindt het zijn grond: het vertrouwen −5 ("de meent is van ons allemaal"). Het bos is van
      de heer. Openlijk kost het zijn gunst (−5: hij wil erom gevraagd worden), en de inner telt de nieuwe akker, zodat
      de pacht omhooggaat. Stiekem, diep in het bos waar de inner niet komt, betaal je geen pacht en kost het geen gunst.
      Maar vinden zijn soldaten het, dan ben je betrapt: de laatste waarschuwing. Wie bos ontgint, krijgt er het hout bij.
    - **c, hoe lang:** de heide een maand (plaggen steken), het bos een winter (stobben trekken). Daarna wordt het in
      lentemaand gezaaid, met zaaigraan zoals elke akker.
    - **d, op de kaart:** de akker komt erbij als een veld van die boer, op de grond die er lag, en de bomen gaan weg. Op
      een pad, een plein, een erf of een gebouw komt hij niet. De plek kiest de boer zelf, naast zijn akker als het kan,
      en je ziet hem in goud op de grond, zoals bij elk verzoek.
    - **e, de spelregel "Ontginnen"** (aan of uit). Ben je weg, dan beslist je raadsman, zoals bij elk verzoek. De bouwers
      van de speeltest zeggen ja: de eerlijke op de heide, de sluwe stiekem in het bos.
    **In stappen:** 1. ontginnen op de heide, als verzoek, met het vertrouwen (één sessie); 2. het bos, openlijk en
    stiekem, met de inner, de soldaten en het hout; 3. de speeltest van vier jaar opnieuw.
    Vragen: **a**, een boer die zijn veld groter maakt, of een nieuw boerengezin? **b**, de heide tegen het vertrouwen van
    het dorp, het bos tegen de gunst van de heer, en stiekem met betrapt als ze het vinden? **c**, een maand en een
    winter? **d**, dertig tegels per keer? **e**, in deze stappen?
    **Marcel koos (5 okt, drieëndertigste sessie, terwijl 2b rendert): "1 en 3, 107 a b c d e ja".** Dus a tot en met e
    zoals voorgesteld, nu te bouwen (1), en tussendoor een nieuwe proefversie (3). Vraag 110 (de maat van de winst) is
    nog open.
    **Stap 1 is gebouwd** (5 okt, drieëndertigste sessie; `js/ontginnen.js`, `spel.md`, "Ontginnen"). Drie dingen gingen
    anders dan in het voorstel, omdat het voorstel ze niet zag:
    - **"Naast zijn akker" kan bijna nooit** (d): de heide ligt apart, op het ontworpen gehucht tien tegels van de
      dichtste akker, op de landen van de maker in een hoek, 8 tot 40 tegels van de dichtste boerderij. Het voorstel zei
      "naast zijn akker als het kan"; dus vraagt de boer met een akker het dichtst bij de heide het, en kiest hij het stuk
      zo dichtbij als het kan. Wat ontgonnen is, ligt de volgende keer het dichtst bij, dus de heide wordt van de kant van
      het dorp af ontgonnen. Het bos (stap 2) ligt wel vaak naast de akkers.
    - **Een plag is acht uur werk**, langer dan een halve dag (en een werkdag in de winter is zes uur): wie ophoudt voor
      de schaft of de avond, maakt hem daarna af. Zo steekt hij er in de lente zo'n 1,25 per dag, in de herfst 1 en in de
      winter 0,6; wat na de maand nog heide is, steken zijn mensen dan (c: "een maand").
    - **Na elk verzoek dertig dagen**, ook als je hem niet sprak: anders kwam hij elke dag terug zolang het graan
      tekortkomt (een jaar kreeg zo 199 voorvallen in plaats van 25 à 60), en nam hij elke dag de plek in van wie iets
      anders wilde vragen.
    **Vraag f, het tempo** (Claude, 5 okt, uit de speeltest; open): vóór de eerste oogst komt een gehucht altijd graan
    tekort, dus het eerste verzoek komt al op 28 lentemaand, en daarna elke twee maanden (een maand ontginnen, een maand
    wachten). Elke bouwer ontgon zo in het eerste jaar vier à vijf stukken: de hele heide, op wat de schapen nodig hebben
    na. De oogst van het tweede jaar was 800 à 1000 graan in plaats van zo'n 600, en de honger van 76 à 78 dagen in het
    eerste jaar was in het tweede weg (`speelbaar.md`, de speeltest van 5 okt). Maar het is vijf keer dezelfde vraag in
    één jaar, en daarna is de heide op. Mogelijkheden:
    - **f1, zo laten:** snel lucht, en is de heide op, dan wordt het bos de volgende stap (stap 2, tegen de gunst van de
      heer of stiekem). Dan heeft het spel een lijn: eerst de heide en het dorp, later het bos en de heer.
    - **f2, trager:** na een ja pas weer een verzoek als het nieuwe stuk één keer geoogst is: zo'n stuk per jaar, en de
      vraag komt elk jaar terug.
    - **f3, elk stuk kost meer:** het eerste 5 vertrouwen, het tweede 10, het derde 15: hoe kleiner de meent, hoe meer
      het dorp eraan hecht. Dan wordt de vijfde ja een echte afweging.
    Voorstel van Claude: f1 met f3. Het tempo houdt de druk om eten in het eerste jaar, en f3 maakt van dezelfde vraag
    elke keer een zwaardere.
    **Marcel koos (5 okt, drieëndertigste sessie): "We gaan met jouw suggestie".** Dus f1 met f3: het tempo blijft, en
    elk stuk kost 5 vertrouwen meer dan het vorige (5, 10, 15, ...), naar hoeveel stukken er al van de meent af gingen.
    Gebouwd op 5 okt (`f520b22`). **Gezien in de speeltest:** de bouwer zei elke keer ja (tot 25), en het vertrouwen kwam
    nooit onder de 50, want het gaat elke dag een zestigste van het verschil terug naar de tevredenheid (`volgDagen`): in
    een tevreden dorp is een dip van 25 na twee maanden voor tweederde weg. De prijs bijt dus alleen in een ontevreden
    dorp. Voorstel van Claude: zo laten, en in de speeltest van vier jaar (stap 3) kijken of een dorp in moeilijkheden het
    voelt; zo niet, dan kan het verlies van de meent ook de tevredenheid een tijd laten zakken (een stemming, zoals bij
    een voorval), zodat het vertrouwen minder hoog terugkomt.
108. **Het dorp zoals mensen het bouwen, en een overzicht** (Marcel, 3 okt, vijfentwintigste sessie: "Ja, maar we hebben
    misschien toch een overview modus nodig. Dus dat we wisselen tussen volgen van de speler en een overview. De gebouwen
    moeten menselijk gebouwd zijn. Paadjes, stenen en zand. Lantaarns voor in de avond etc. Dit moet allemaal straks staan
    voor de demo."; plan van Claude; a, b en d gebouwd op 3 okt, c en e volgen).
    **Wat er al is:** het besluit over straten en paden (25 sep, punt 6c, `spel.md`): paadjes ontstaan vanzelf waar veel
    gelopen wordt, zoals in Foundation, jij verhardt ze met keien, een pad loopt sneller, en een zandpad wordt modder in de
    natte maanden. Er zijn lantaarns op de kaart die 's avonds branden (`T.lichtBronnen`), en de ramen van de herberg
    branden. En sinds vandaag heeft elk nieuw gebouw drie tegels looppad rondom. Wat er niet is: de camera volgt altijd de
    schout, en zoomen doet alleen het venster (1 tot 2 keer).
    **Wat Claude erin ziet: het overzicht raakt de haak.** Op 30 sep koos het plan geen oog van bovenaf (vraag 74, d), want
    het concept zegt: "dan ben je weer de god boven de stad". Wat het spel verkoopt, is dat je de schout ín het dorp bent
    (`commercieel.md`). Maar een dorp van 100 mensen op 76 bij 76 tegels zie je niet als je alleen meeloopt, en een speler
    in een demo wil zijn dorp zien. Het kan allebei: kijken van boven, maar doen als de schout.
    Voorstel:
    - **a, overzicht en volgen** (een toets, `Tab`). In het overzicht zoom je uit tot je het hele gehucht ziet, en schuif
      je met de muis of de pijltjes. De schout loopt door waar je hem heen stuurde. Je kijkt en je plant (een erf, een
      oproep, het briefje bij een huis), maar wie je wilt spreken, daar loopt de schout naartoe: het poppetje blijft de
      manier waarop je bestuurt. `Tab` of een klik op de schout brengt je terug. Een andere manier, die de haak nog meer
      houdt: het overzicht is een plek, de toren van de kapel of de heuvel bij de heide, en vanaf daar zie je het hele dorp.
      Eerst meten of het tekenen ver uitgezoomd vlot blijft (`npm run grootte -- --browser`): de gereedschapspagina tekent
      ver uitgezoomd een plattegrond, omdat de tekencode van het spel daar niet op gebouwd is.
    - **b, paadjes** (punt 6c, zoals besloten): waar veel gelopen wordt, slijt het gras tot een zandpad. Elk nieuw gebouw
      krijgt meteen een paadje van zijn deur naar het dichtste pad, zodat het er vanaf de eerste dag bij hoort.
    - **c, stenen:** jij verhardt een pad met keien (kinderkopjes), en het plein en de straat erheen worden van steen als
      het dorp marktrecht krijgt. De keien komen van de heide, van het ontginnen (vraag 107).
    - **d, lantaarns:** een lantaarn bij de deur van wat van het dorp is (de kapel, de herberg, de markt, het wachthuis)
      en op de kruisingen van de paden, die 's avonds brandt. En 's avonds gaan de ramen van de huizen aan, zoals die van
      de herberg nu (`brandendeRamen`). Wie 's avonds buiten loopt, ziet in het licht verder (`T.zichtOp`).
    - **e, wat het verder bewoond maakt** ("etc"): een moestuin voor het huis op een erf (daar is het erf al op gemaakt),
      een hek, een stapel hout bij de houthakker, een kar bij de molen. Kleine dingen bij een gebouw, getekend uit code
      zoals de rest.
    **De volgorde, voor de demo:** eerst a (het overzicht staat los van de rest), dan b en d (het dorp ziet er bewoond uit),
    dan c en e. Het hoort bij de demo (`0c`), na de kern.
    Vragen: **a**, een overzicht met `Tab` waarin je kijkt en plant, maar spreken doet de schout? Of een plek in het dorp
    vanwaar je overziet? **b**, paadjes die ontstaan, en meteen een paadje van elke nieuwe deur? **c**, stenen zo (keien,
    en het plein bij marktrecht)? **d**, lantaarns bij de gebouwen van het dorp en op kruisingen, en ramen die 's avonds
    branden? **e**, eerst de moestuin en een stapel hout, of iets anders?
    **Marcel koos (3 okt): "108 a tab, b c d e ja".** Dus een overzicht met `Tab` (kijken en plannen, spreken doet de
    schout), en b tot en met e zoals voorgesteld, in deze volgorde: eerst a, dan b en d, dan c en e.
109. **De stenen en het erf: hoe het dorp bestraat, en wat er bij een huis staat** (Claude, 3 okt, vijfentwintigste
    sessie; vraag 108, c en e, uitgewerkt nu a, b en d er zijn; open).
    **Wat er al is:** de paadjes (108, b): van elke deur, en waar veel gelopen wordt. De grondtegels kennen kasseien naast
    gras en zand, met de overgangen ertussen. Steen komt uit de steengroeve (een per dag met twee handen), en de stenen
    huizen hebben het nodig om door te groeien. Voor het erf is er al getekend: een moestuin (5 bij 5), kool, prei, bonen,
    een kruidenbed, bloemen, een houtstapel, een waslijn, een regenton, een bank, en hekken van tenen en van latten, met
    hoeken en eindjes. Een kar is er niet.
    **c, de stenen.** Sinds vraag 103 bouwt het dorp door zijn mensen, en jij zegt ja of nee. Bestraten past daarin:
    - Een inwoner vraagt het, zoals een gebouw: "Lambert wil het paadje van de put naar de herberg bestraten, achttien
      tegels, voor achttien steen." Hij kiest het stuk dat het meest belopen wordt (uit de paadjes), en je ziet het in goud
      op de grond. Zeg je ja, dan liggen de keien er in een paar dagen, en daar slijt niets meer en groeit niets dicht.
    - Bij marktrecht wordt het plein bestraat, zoals de heer het in zijn brief vraagt ("een markt staat op stenen"), met
      steen uit de voorraad; is die er niet, dan wacht het.
    - De steen komt voorlopig uit de steengroeve, en straks ook van het ontginnen (vraag 107): wie heide ontgint, raapt
      keien. Bestraten en stenen huizen vragen dan allebei steen, en dat is een keuze.
    - Sneller lopen over steen (besloten op 25 sep, de getallen nog open) laat ik voor later: het verandert wie waar loopt,
      en daarmee de hele speeltest.
    **e, het erf.** Kleine dingen bij een huis, uit wat er al getekend is:
    - Bij een huis op een erf: een moestuin, of een paar bedden kool en prei, en een regenton of een waslijn bij de muur,
      naar het zaad van het huis, zodat niet elk erf hetzelfde is. Een hek van tenen langs de rand van het erf, open waar
      het paadje naar buiten gaat; een stenen huis krijgt een hek van latten.
    - Bij de houthakker een houtstapel, groter naarmate er meer hout ligt. Een kar bij de molen moet nog getekend worden:
      later.
    - **Het looppad.** Rond een gebouw blijven drie tegels vrij van andere gebouwen en bomen (Marcel: "Nee ik wil 3
      tegels"). Een moestuin en een hek zijn geen gebouw, maar je loopt er ook niet doorheen. Het voorstel: de drie tegels
      gelden tussen gebouwen, en de tuin en het hek mogen erin, als er rond het huis en langs het paadje naar de deur één
      tegel vrij blijft.
    **In stappen:** 1. het erf (e), want alles is al getekend (één sessie); 2. het plein bij marktrecht; 3. bestraten als
    verzoek, na het ontginnen (vraag 107).
    Vragen: **a**, bestraten als verzoek van een inwoner, op het paadje dat het meest belopen wordt? **b**, het plein
    bij marktrecht, met steen uit de voorraad? **c**, de tuin en het hek binnen de drie tegels, als er één tegel rond het
    huis en langs het paadje vrij blijft? **d**, in deze stappen, met het erf eerst?
110. **De maat van de winst, en de grond om te bouwen** (Claude, 3 okt, vijfentwintigste sessie; uit de speeltest van
    vier jaar, vraag 102, e, `speelbaar.md`; open).
    **Wat de speeltest liet zien:** het dorp loopt vol op 99 mensen. Vijf boerderijen van vier en negen stenen huizen van
    acht, en de herbergierster en het gezin van de schout: samen 99. Voor een tiende erf is er vanaf het derde jaar geen
    plek meer, en met het looppad van drie tegels past er in het gehucht nog een erf minder (12 in plaats van 13 in een
    leeg gehucht). De winst vraagt 100 mensen. De sluwe bouwer met zaad 1 had het vierde jaar alle 360 dagen alles, in
    steen, en won niet.
    Voorstel, van klein naar groot:
    - **a, de winst vanaf 90 mensen** (een getal in de werkbank, `T.EINDE_INSTELLINGEN.minstensMensen`). Dan is het
      gehucht te winnen zoals het is, met negen stenen huizen. Maar het is minder dan de maat van de slice ("een kleine
      stad van 100 tot 200 mensen").
    - **b, een stenen huis voor tien in plaats van acht.** Dan haalt het dorp 117 met dezelfde negen huizen, en is 100 te
      halen. Maar meer monden, en het graan is al op (vraag 107).
    - **c, ontginnen geeft ook bouwgrond** (bij vraag 107): wie bos ontgint, krijgt grond voor een erf. Dat is het grootst,
      en het past bij "het land groeit mee".
    Wat Claude zou doen: a nu, zodat de demo te winnen is, en c met het ontginnen; b niet, want het graan is de krapste
    knoop. Vragen: **a**, **b** of **c**, of meer dan één? **Sinds vraag 112:** een groter land, met het dorp losser,
    geeft ook bouwgrond genoeg; dan is a misschien niet nodig.
111. **De boeren aan het werk op hun veld** (Marcel, 3 okt, vijfentwintigste sessie: "Ook wil ik dat boeren op hun veld
    aan het werk zijn. Nu hebben ze wel velden, maar lopen ze gewoon random door het dorp. Ze moeten zaaien en op het
    veld bezig zijn."; plan van Claude; open).
    **Waarom het nu zo is:** een boer is een bewoner, en overdag stuurt het dagritme hem naar de deur van zijn boerderij
    (`T.dagAnker`, `plek.werk`, met een straal van twee tegels). De regel die hem in het groeiseizoen naar zijn akker
    stuurt (`T.wandelAnker` in `js/akkers.js`), komt daardoor nooit aan de beurt. Alleen bij de oogst is hij echt op zijn
    veld: dan maait hij tegel voor tegel, met een eigen figuur (de maaier). Een boer heeft verder alleen staan en lopen.
    Voorstel:
    - **a, het werk per seizoen,** overdag, op zijn eigen velden:
      - lentemaand: **zaaien**, rij voor rij over zijn akker, met een zak op zijn heup en een zwaaiende arm;
      - grasmaand tot hooimaand: **wieden en schoffelen**, gebukt, tegel voor tegel, met rustpozen;
      - de hooitijd: **hooien** op zijn weide, met de maaier die er al is; het vee nakijken;
      - oogstmaand: **maaien**, zoals nu;
      - herfstmaand: **mest uitrijden** op een akker die mest krijgt, en **spitten** voor volgend jaar;
      - de winter: **sprokkelen** aan de bosrand (het hout dat de mensen sprokkelen, `T.sprokkelHout`, is er al als getal)
        en dorsen bij de boerderij.
    - **b, de figuren:** een zaaier en een wieder (met een schoffel, ook om te spitten), uit code zoals de maaier; het
      sprokkelen met een bundel hout op de rug.
    - **c, wat het aan de regels verandert: niets.** Het zaaien, de oogst en het sprokkelen blijven zoals ze zijn; alleen
      waar de boer is en wat hij doet. 's Avonds en 's nachts is hij thuis, zoals nu. De boerin en de grote kinderen
      helpen bij het zaaien en de oogst, de rest van het jaar doen ze wat ze nu doen.
    Vragen: **a**, dit werk per seizoen? **b**, de zaaier en de wieder als nieuwe figuren? **c**, alleen hoe het eruitziet,
    en de regels zoals ze zijn?
    **Marcel koos (3 okt): "ja die zijn goed. volgorde is oke."** Dus a, b en c zoals voorgesteld, na vraag 112.
    **Marcel (5 okt, terwijl de sessie van 2b de bouwfasen rendert): "A. Ja prima B ja graag C doe maar".** Dus 111 gaat
    vóór stap 3 van de huizen (die zit in dezelfde bestanden als 2b): eerst waar de boer is en wat hij doet, zonder
    renderen (stap 1), en meteen erna de figuren, naast 2b, want die komen in `beelden/figuren` en niet in `tegels/`
    (stap 2). De houthakker die hakt en plant (115) en de wolven (116) komen na 2b: hun stronken en boompjes zijn
    voorwerpen in `tegels/`. En erbij, als kleine klus: de militie die onderweg niet meevecht (een schout viel alleen
    tegen drie wilde rovers; `0c`, punt 4).
    **Na de proefplaat van de figuren (5 okt; Marcel: "a ja b ja c nu"):** a, de zaaier, de wieder en de sprokkelaar
    gaan zo in het spel; b, een boerin krijgt een eigen werkvel (de zaaister, de wiedster, de sprokkelaarster, en ook de
    maaister, want een boerin die maait, droeg tot nu toe het vel van een man); c, de zwakke punten nu verbeteren: het
    rapen (hij bukt zo diep dat je van voren alleen zijn hoed en de bundel ziet), de schoffel (leest van sommige kanten
    als een hamertje) en de hand van de zaaier (een platte peddel; het zaad is stipjes van 2 à 3 pixels).
    **Af (5 okt, drieëndertigste sessie):** stap 1 en 2, met a, b en c (zie onder Af). Nog over: de houthakker (115) en de
    wolven (116), na de huizen; wat aan de figuren nog beter kan, staat in `opmerkingen.md`, "Het beeld".
112. **Elk spel een ander land: de maker als standaard, wijder, met natuur en meer huizen** (Marcel, 3 okt,
    vijfentwintigste sessie: "Alles moet denk ik ook wijder opgezet worden. En meer variatie in de huizen. Her en der wat
    foliage, bomen, stenen, water. Eigenlijk een random map generator per nieuwe game. Doe is ook wel belangrijk voor de
    demo. Zodat je kunt herspelen"; plan van Claude; open).
    **Wat er al is:** de maker (vraag 69 en 70, `js/maker.js`) legt elk spel een ander gehucht, uit dezelfde delen als
    het ontworpen gehucht: het plein, het huis van de schout, de herberg, hutten, vijf boerderijen met hun akkers, de
    heide met de kooi, de weg met een brug over de beek, en bos langs een of twee kanten. Maar alleen met de spelregel
    "Je gehucht" op "Elk spel een ander"; de standaard is het ontworpen gehucht. Allebei zijn ze 76 bij 76 tegels, met de
    huizen dicht om het plein, daaromheen een leeg grasveld met kleine akkers, en een dichte bosrand. Aan natuur legt de
    maker twee eiken, een wilg en de beek. Getekend is er veel meer: struiken, bessenstruiken, varens, graspollen, hoog
    gras, bloemen, paddenstoelen, boomstronken, rotsen en kleine stenen, en water met zijn oevers.
    Voorstel:
    - **a, elk nieuw spel een eigen land.** De standaard wordt "Elk spel een ander", en het zaad staat in het menu: een
      land dat je mooi vond, speel je opnieuw door het zaad in te typen bij Nieuw spel. Het ontworpen gehucht blijft als
      keuze, en de toetsen spelen erop.
    - **b, wijder.** Een grotere kaart (zo'n 100 bij 100), en het dorp losser: tussen de huizen minstens het looppad van
      drie tegels, de boerderijen verder naar buiten, elk tussen zijn eigen velden. Dan is er ook bouwgrond genoeg: het
      dorp liep in de speeltest vol op 99 mensen (vraag 110).
    - **c, natuur, uit wat er al getekend is.** Losse bomen en bosjes, struiken, varens, bloemen en hoog gras langs de
      randen, stenen en rotsen, boomstronken; water: de beek en een of twee vijvers; een bosrand met inhammen en open
      plekken. Wat er ligt, doet er ook toe: bos voor de houthakker, stenen voor de steengroeve (en de keien, vraag 109),
      water voor de visser. Zo is elk land een andere puzzel.
    - **d, meer huizen.** De huizenbouwer maakt meer tekeningen: andere kleuren voor muren, luiken en daken (riet,
      pannen, leien), gespiegeld met de deur aan de andere kant, en meer maten. Elk spel kiest er andere uit.
    **In stappen:** 1. de maker wijder en met natuur (b en c), en de standaard (a): een à twee sessies; 2. de huizen
    (d): tekenwerk, een sessie; 3. de speeltest op gemaakte landen (`npm run speeltest -- --maker`), en meten hoe groot een
    dorp kan worden. De boeren op hun veld (vraag 111) kan ervoor of erna.
    Vragen: **a**, elk spel een eigen land, met het zaad om opnieuw te spelen? **b**, 100 bij 100, en het dorp losser?
    **c**, deze natuur, en dat ze ertoe doet? **d**, meer huizen zo? **e**, eerst de kaart, dan de boeren?
    **Marcel koos (3 okt): "ja die zijn goed. volgorde is oke."** Dus a tot en met e zoals voorgesteld: eerst het land,
    dan de boeren (vraag 111). Hij zag ook in het ontworpen gehucht twee huizen "over elkaar vallen": het huis van de
    schout en het huis ernaast staan drie tegels uit elkaar, en in beeld reikt het dak van het voorste over de muur van
    het achterste. De tekenvolgorde klopt (Marcel: "volgorde is oke"); het land legt hoge gebouwen verder uit elkaar,
    vooral naar achteren in beeld.
    **Stap 1 is gebouwd (4 okt, zesentwintigste sessie):** a, b en c, zoals hierboven (zie onder Af, en `spel.md`, "Het
    wijdere land, met natuur"). Wat anders liep dan het plan: een hut mag zijn deur van het plein af hebben (elke deur in
    de tekeningen zit aan de kant van de camera, dus wie vóór het plein staat, keert het zijn rug toe; gespiegelde
    tekeningen met de deur aan de andere kant lossen dat op, bij stap 2); het hoge gras in de wei ging eruit (het stond
    als dorre stokjes) en staat nu alleen als riet aan het water; wilgen alleen aan de achterkant van het water; en het
    bos liever achteraan, want vooraan dekt het het land af. Het overzicht (`Tab`) laat op 0,35 zo'n driekwart van het
    land zien. De jager hoort niet bij het bos (dat was van Claude; in de speeltest vond hij aan de bosrand geen plek meer
    en verhongerde het dorp), en een verzoek om iets dat bij de natuur hoort, zoekt over de hele kaart. **De speeltest op
    gemaakte landen** (stap 3, 4 okt; `speelbaar.md`): de bouwer haalt op drie landen de twee jaar, met marktrecht in het
    eerste jaar en twee keer 100 mensen; maar met het dorp wijder vraagt bijna elk huis zijn eigen put (9 à 11 putten), en
    op één land kwam daardoor nooit een molen. **Nog te doen:** stap 2 (de huizen, met vraag 114), en de putten
    (een grotere kring op een groter land, of erven binnen de kring van een put).
113. **De snelheid** (Marcel, 3 okt, vijfentwintigste sessie: "oh en nog 1 heel belangrijke... de performance", "loopt
    nogal traag", en "Als de performance slecht is, hebben we niks"; gaat voor alles; voor een deel gebouwd).
    **Gemeten** (zonder videokaart, Chromium; Marcel speelt in Firefox): in het overzicht 13 beelden per seconde, want
    elk beeld tekende 2600 plaatjes, waarvan 2100 bomen van het bos om de kaart heen; van dichtbij 50 à 60 beelden per
    seconde. De haperingen kwamen uit de regels: bij 100 mensen beelden tot 115 ms als iedereen tegelijk op weg gaat
    (A* liep bij elke tegel alle wezens af), een nacht van 15 ms, en het opslaan elke ochtend 25 à 50 ms; bij 200 mensen
    een nacht van 210 ms, soms een seconde (de plek voor een bouwverzoek).
    **Gedaan (3 okt):** het overzicht bewaart de grond op de maat van het scherm en het bos in een buffer (34 beelden per
    seconde); wie waar staat in één stap tijdens het zoeken, de deuren bewaard, een put of kapel telt eerst wat hij
    bereikt, hooguit acht mensen per beeld op zoek naar een weg, en op 30× om de drie dagen vanzelf opslaan. Bij 100
    mensen nu gemiddeld 0,64 ms aan regels per beeld (was 1,5), de traagste 5% 5,7 ms (was 17), de nacht 10 ms; bij 200
    mensen 2,1 ms (was 9,1), de traagste 5% 17 ms (was 106), de nacht 25 ms (was 210). En de meter onder `F2`.
    **Nog te doen, als het nodig blijkt:** het tekenen van dichtbij (10 à 18 ms zonder videokaart: 's avonds de nacht,
    de ramen en het licht), de eerste nacht van een spel (80 ms), het opslaan zelf kleiner (twee derde is de kaart, die
    niet verandert), de bomen en het graan in het overzicht, en een land van 100 bij 100 (vraag 112) opnieuw meten.
    Vraag: **a**, wil je met `F2` in Firefox kijken wat de meter zegt, van dichtbij en in het overzicht, overdag en 's
    avonds, en op 30×? Dan weten we of het tekenen van dichtbij ook nog moet. **Marcel (4 okt): ja**; de getallen
    wachten nog (alles staat sinds 4 okt in `main`).
    **Op het wijdere land (4 okt, zesentwintigste sessie):** het tekenen kost er evenveel als op het ontworpen gehucht
    (zonder videokaart 55 beelden/s van dichtbij, 43 en 30 in het overzicht), want de lage begroeiing ligt in de buffer
    van de grond. Wel kost de eerste keer uitzoomen naar 0,35 één beeld van een seconde (de browser maakt dan verkleinde
    versies van de grote tekenvellen; daarna 130 à 180 ms per zoomstap, zoals op het ontworpen gehucht): het inpakken van
    de vellen bij vraag 114 helpt daar. Het zoeken van een weg kostte er drie keer zoveel per zoektocht (langere wegen,
    meer struiken); A* is nu 2,8 keer zo snel, met dezelfde wegen: bij 100 mensen op land 5 op 30× 1,3 ms aan regels per
    beeld (de traagste 5% 12 ms), bij 200 mensen 3,0 ms (20 ms). Een bewaard spel is half zo groot (331 kB op een
    gemaakt land, 162 kB op het ontworpen gehucht).
114. **Gebouwen in verhouding, en een woontoren** (Marcel, 3 okt, vijfentwintigste sessie: "Gebouwen moeten in
    verhouding komen. Een herberg is vaak veel groter dan een huis. Een kapel zelfde verhaal. Een warehouse ook.
    Misschien moeten we ook een woontoren hebben"; plan van Claude; open).
    **Hoe het nu is:** een huis is 7 bij 5 tot 10 bij 7 tegels, een boerderij 6 bij 8 tot 9 bij 8. De herberg is 9 bij 7
    (die op de kaart 8 bij 11), nauwelijks groter dan een huis. De kapel is 5 bij 10, smal, en met zijn dak niet hoger
    dan een huis. Het pakhuis en de tiendschuur lenen een blokhutschuur van 5 bij 7, kleiner dan een huis; de markt en
    de meeste werkplaatsen lenen ook een tekening (een klein dorpshuis of een schuurtje).
    Voorstel:
    - **a, een ladder van maten:** klein (een hut, een schuurtje, de put: 3 tot 5 tegels), een huis (het huis, het
      stenen huis, een ambacht zoals de smidse en de bakkerij: 6 tot 8), groot (de boerderij met zijn schuur, de herberg
      met een stal en een binnenplaats, het pakhuis, de tiendschuur, de molen: 9 tot 12 lang, en hoger), en het grootst:
      de kapel met een toren, het hoogste punt van het dorp (en later de kerk). De markt is een plein met kramen.
    - **b, de woontoren:** een kleine voet (5 bij 5) maar hoog, van steen, met kantelen. Wat is hij? (1) Het huis van de
      schout groeit door tot een woontoren als het dorp marktrecht krijgt: jouw stand, een sterke plek tegen de rovers,
      en een kelder die de soldaten niet zomaar doorzoeken. (2) Een nieuwe stand bovenaan: de rijken, zoals in een stad.
      (3) De toren van de heer in het dorp, waar de inner zit en de tiend heen gaat. Claude zou 1 nemen: het past bij
      "je bent de schout", je ziet je eigen macht groeien, en het is satire (de man van de heer bouwt zijn eigen toren).
    - **c, wie het tekent:** de huizenbouwer, in dezelfde stijl als de huizen: een grote herberg, een kapel met toren,
      een lang pakhuis met een grote deur, de tiendschuur, de woontoren, en per gebouw een paar varianten.
    - **d, de ruimte:** grote gebouwen vragen plaats, en hoge vragen meer ruimte vóór zich in beeld: dat hoort bij het
      wijdere land (vraag 112, b). Daarom samen met 112, stap 2 (de huizen).
    Vragen: **a**, deze ladder? **b**, de woontoren als 1, 2 of 3? **c**, met "warehouse" bedoel je het pakhuis (de
    voorraad van het dorp), of de tiendschuur (van de heer)? **d**, eerst de herberg, de kapel en de woontoren?
    **Marcel koos (4 okt, zesentwintigste sessie): "1. Ja 2. Appartementen, niet historisch correct, maar dat is ook niet
    nodig. 3. Ja een pakhuis, maar we gaan over naar het Engels uiteindelijk. 4. Dat is goed. 5. Vergeet niet dat we meer
    afwisseling willen. Je gaf eerder aan andere kleuren etc te gaan gebruiken".** Dus: a, de ladder zoals voorgesteld;
    b, geen van de drie: de woontoren is een gebouw met appartementen, meer gezinnen op een kleine voet, de hoogte in;
    c, het pakhuis (en het spel gaat uiteindelijk naar het Engels, dus een naam is niet heilig: `commercieel.md`); d, eerst
    de herberg, de kapel en de woontoren; en de afwisseling uit vraag 112, d hoort erbij: andere kleuren voor muren,
    luiken en daken, ander materiaal, gespiegeld, en meer maten.
    **Voorstel van Claude voor de woontoren (wacht op Marcel):** een stenen huis dat een maand alles heeft, groeit door tot
    woontoren, zoals een hut tot huis groeit: op zijn eigen erf, vanaf marktrecht, met steen. Dezelfde stand (de
    ambachtslieden, met dezelfde wensen), maar drie appartementen: 24 mensen in plaats van 8. Zo groeit het dorp verder
    als de grond op is (vraag 110), zonder nieuwe regel ernaast: het is gewoon de volgende trap van het doorgroeien. Een
    spelregel "Woontoren" kan hem ook als verzoek van een inwoner laten komen, of uitzetten. **Marcel (4 okt): "ja op de
    openstaande vragen"**, dus zo.
    **Plan voor de huizen (Claude, 4 okt; samen met vraag 112, stap 2):** de huizenbouwer
    (`gereedschap/pixelart/huis-sdf.cjs`) kan al veel meer dan het spel gebruikt: daken van riet, spanen, leien en
    pannen, wanden van vakwerk, vlechtwerk, planken, blokhut en veldsteen, luiken in kaal hout, groen, rood en
    blauwgrijs, en een vierkante stenen toren met een plat dak en kantelen (`matenToren`). Het spel heeft 32 tekeningen,
    bijna allemaal riet.
    - **2a, eerst de vellen inpakken** (snelheid, vraag 113): elke tekening strak gesneden, met zijn eigen rechthoek en
      anker, in plaats van een raster van even grote cellen. `tegels/huizen.png` is nu 32 cellen van 662 bij 789, in de
      browser 64 MB, en de eerste keer uitzoomen kost daardoor een seconde; met twintig tekeningen erbij wordt het het
      dubbele. Ingepakt zo'n de helft. Raakt `js/sprites.js` en de stap naar Tiled en het spel (`naar-tiled.cjs`,
      `naar-spel.cjs`).
      **Gemeten (4 okt, achtentwintigste sessie): niet de huizen wegen het meest.** Uitgepakt, zoals de browser ze
      vasthoudt, laadt het spel bij het begin bijna 900 MB aan vellen. `tegels/bouwfasen.png` is 271 MB (195 tekeningen,
      strak 137 MB, en 8303 pixels hoog: boven de 8192 van veel videokaarten), `tegels/gebouwen.png` 157 MB (27 van zijn
      96 cellen hebben een tekening, samen 22 MB), `tegels/huizen.png` 67 MB (strak 25), `bomen.png` en `erf.png` 14 en
      13 MB (strak elk 1), en de figuren in `beelden/figuren/` samen 362 MB (de cellen zijn veel groter dan wat erin
      staat). Een browser houdt een uitgepakt vel niet altijd vast: is het geheugen krap, dan pakt hij het opnieuw uit
      als het weer getekend wordt, en bij 271 MB is dat een hapering. Voorstel (wacht op Marcel):
      1. de vellen met voorwerpen (huizen, gebouwen, bomen, erf) ingepakt: elke tekening met zijn eigen rechthoek en
         anker in `T.TEGELS`, zo gesneden dat Tiled ze nog goed neerzet (links en rechts even ver van het anker; strak
         kan ook, dat scheelt nog 15 MB). De grondvellen blijven een raster, want Tiled schildert ermee. 251 MB wordt
         zo'n 75.
      2. de bouwfasen per gebouw een eigen klein vel, pas geladen als er een in aanbouw staat (tot dan tekent hij
         bleker, zoals zonder fases): een paar MB tegelijk in plaats van 271.
      3. de figuren: elke cel krimpt tot wat er in alle cellen van dat vel samen staat; het raster blijft, het anker
         schuift mee. 362 MB wordt 124.
      4. elk vel bij het laden al uitpakken (`img.decode()`), zodat het eerste beeld met een gebouw niet hapert.
      Samen bij het begin zo'n 210 MB in plaats van 900. Klaar als: het spel en `gereedschap/wereld.html` pixel voor
      pixel hetzelfde tekenen (schermafdrukken ervoor en erna), `npm test` groen, en gemeten: de eerste keer uitzoomen
      en het geheugen, ervoor en erna. Bij 2b: de bouwfasen per vorm, niet per kleur, anders groeien ze vijf keer zo
      hard als de tekeningen.
      **Marcel (4 okt): "1 ja 2 alleen nog de grond."** Dus alle vier de stappen, en strak gesneden: Tiled hoeft alleen
      de grond nog goed te tonen. De voorwerpen staan er in Tiled dan niet precies op hun plek; het spel zet ze neer met
      hun eigen anker.
      **Gebouwd (4 okt, achtentwintigste sessie; zie onder Af).** Wat anders liep dan het plan: (4) het uitpakken bij het
      laden (`img.decode()`) ging er weer uit, want dat wacht in Chromium tot de bladzijde een beeld tekent, en in een
      verborgen tabblad blijft het spel dan bij zijn vlakken; een ingepakt vel is klein genoeg om bij het eerste beeld
      uit te pakken (het eerste beeld van een bouwplaats met vijf gebouwen tegelijk: 50 à 80 ms, voorheen 50). Een plant die in de wind
      buigt, kreeg aan beide kanten plaats, want strak gesneden viel zijn kruin over de rand. En de vellen met planten
      (bomen, begroeiing, erf) houden de hoogte van hun oude vak, want de wind buigt naar de hoogte in het vak. Wat er bij
      het eerste keer uitzoomen nog over is (165 ms), is zo groot als elke volgende zoomstap: de grond en het bos opnieuw in
      hun buffer (vraag 113).
    - **2b, de afwisseling** (vraag 112, d, en Marcel: "andere kleuren etc"): per soort meer tekeningen uit wat de bouwer
      al kan, en elk ook gespiegeld, met de deur aan de andere kant (dan kan een huis vóór het plein er ook zijn deur
      naartoe keren). De daken volgen de treden: in het gehucht riet en spanen, in een dorp ook leien, met marktrecht
      pannen; zo zie je aan de daken hoe ver het dorp is. De wanden en de luiken wisselen per huis.
    - **2c, de grote gebouwen** (vraag 114, eerst deze drie): de herberg groter (twee lagen, met een stal aan een
      binnenplaats, 12 à 14 tegels lang), de kapel met een toren (het hoogste punt van het dorp), en de woontoren (de
      stenen toren van de bouwer, vier lagen hoog, met per laag een appartement). Daarna het pakhuis: lang, van planken,
      met een grote deur.
    - **2d:** de maker kiest per land uit de tekeningen (elk spel ziet het dorp er anders uit), de verzoeken en het
      doorgroeien ook, en wat gebouwd wordt, krijgt bouwfases (`bouwfasen.cjs`).
      - **Een vel per tekening** (Claude, 4 okt, negenentwintigste sessie; Marcel: "5 ja"): meer tekeningen kosten nu
        geheugen, want het hele vel `tegels/huizen.png` laadt bij het begin (28 MB in de browser voor 23 huizen, met 100
        ruim 120). Zoals de bouwfasen (vraag 114, 2a): een vel per tekening, pas geladen als hij op de kaart staat (tot
        dan bleker, zoals een bouwfase die nog laadt). Dan kost een tekening die er niet staat niets, en mogen het er
        honderden zijn. Komt met het in het spel zetten van de afwisseling (2b); meten zoals bij 2a.
      - **Een eigen bouwstijl per land** (Claude, idem; Marcel: "5 ja"): in plaats van elk huis los te loten, kiest de
        maker per land één stijl: het ene land bouwt met planken, spanen en groene luiken, het andere met oker kalk en
        riet. Het dorp oogt als één geheel, en elk spel als een andere streek. Bij 2d.
    Een proefplaat eerst, om naar te kijken, zoals bij ronde 4b.
    **Plan voor de proefplaten (Claude, 4 okt, negenentwintigste sessie):** twee platen, nog niets in het spel. Plaat 1,
    de afwisseling (2b): drie straatjes naast elkaar, het gehucht (riet en spanen), het dorp (ook leien) en marktrecht (ook
    pannen), met hutten, huizen, stenen huizen en een boerderij in andere wanden en luiken, elk ontwerp in vier standen
    (de deur linksvoor, rechtsvoor, linksachter, rechtsachter), en nieuw in de bouwer: kalk op het vakwerk in drie kleuren.
    Plaat 2, in verhouding (2c): op één grondlijn een hut, een huis, een stenen huis en een boerderij, de nieuwe herberg
    (twee lagen, 12 à 14 tegels, met een lagere stal aan een binnenplaats), de kapel met een toren, en de woontoren (vier
    lagen steen op 5 bij 5), met de oude herberg en kapel ernaast. Vragen: 1, zo? 2, kalk in wit, oker en zacht roze? 3,
    de kapel met een zadeldaktoren (stoer, zoals de dorpskerken in Groningen) of een naaldspits (slank, het hoogste punt)?
    4, de woontoren met kantelen of met een steil dak van leien? 5, het vel per tekening en de stijl per land op de
    werklijst?
    **Marcel (4 okt): "1 ja 2 ja 3 allebei 4 allebei 5 ja".** Dus de twee platen zoals voorgesteld, kalk in drie kleuren,
    de kapel met allebei de torens op de plaat en de woontoren in allebei de vormen, om te kiezen als hij ze ziet; het vel
    per tekening en de stijl per land staan hierboven bij 2d.
    **De platen zijn gemaakt (4 okt, negenentwintigste sessie; `beeld.md`, "De afwisseling en de grote gebouwen"):**
    `node gereedschap/pixelart/huis-sdf-export.cjs afwisseling`, `verhouding` en `steen`. De huizenbouwer kreeg kalk,
    baksteen en zandsteen, torens met een steil dak (zadeldak, tentdak, naaldspits), de ramen van een kapel en een woontoren, een uithangbord
    en gebouwen uit meer delen (`samen`); elk huis van het spel bleef pixel voor pixel hetzelfde (nagekeken op zes huizen
    en de wachttoren). Bij de eerste torens zei Marcel: "Torens zijn wel wat grijzig" (veldsteen onder leien); daarom zijn
    de kapel en de woontoren op de plaat van baksteen, en heeft de woontoren met een dak rode pannen. Daarop: "Waren er in
    die tijd al bakstenen? Dit was eigenlijk natuurstenen blokken". Baksteen kwam hier rond 1200 terug via de kloosters,
    daarvoor bouwde men in natuursteen; het spel heeft al een steenbakkerij (bij marktrecht). Dus kwam er zandsteen bij,
    gehakte blokken, geelgrijs, en de plaat `steen` zet de kapel en de woontoren in veldsteen, zandsteen en baksteen
    naast elkaar. Idee van Claude: eerst natuursteen, baksteen pas met een steenbakkerij, zodat je aan de muren ziet hoe
    ver het dorp is, zoals aan de daken.
    **Nu aan Marcel:** a, welke toren krijgt de kapel (zadeldak of naaldspits)? b, welke woontoren (kantelen of
    tentdak)? c, welke steen: zandsteen, baksteen, of eerst zandsteen en baksteen pas met een steenbakkerij? d, de kalk en
    de straatjes zo? e, krijgt de binnenplaats van de herberg een muur met een poort?
    **Marcel (4 okt): "1. Afwisselen, je stelde eerder voor kleuren per soort land. 2. Zelfde als 1. 3. Ja, baksteen na
    de steenbakker. 4. Ja prima. 5. Ja graag".** Dus: a en b, allebei, en welke een dorp krijgt, hangt af van zijn land
    (de bouwstijl per land, 2d hierboven): het ene land bouwt zijn kapel met een zadeldaktoren en zijn woontoren met
    kantelen, het andere met een naaldspits en een tentdak; c, eerst natuursteen, baksteen pas als het dorp een
    steenbakkerij heeft (die komt bij marktrecht); d, de kalk en de straatjes zoals op de plaat; e, de binnenplaats van
    de herberg krijgt een muur met een poort.
    **Plan voor de huizen in het spel (Claude, 4 okt, negenentwintigste sessie; een sessie of twee)**, in drie stappen,
    elk apart te zien en te meten:
    1. **Een vel per tekening** (eerst, want de snelheid gaat voor alles; 2d hierboven): elk huis zijn eigen plaatje,
       pas geladen als het op de kaart staat, zoals de bouwfasen (`T.sprites.bouwfase`); tot dan tekent het bleker. Dan
       kost een tekening die er niet staat geen geheugen, hoeveel het er ook zijn. Klaar als: elke tekening pixel voor
       pixel dezelfde, en het geheugen en het eerste keer uitzoomen gemeten, ervoor en erna (zoals bij 2a).
    2. **Vier bouwstijlen, en de tekeningen ervoor** (de stijl per land, 2d): een stijl is de kalk, de luiken, hout of
       vakwerk, de natuursteen, en de vorm van de kapeltoren en de woontoren: (1) wit vakwerk, groene luiken, veldsteen,
       zadeldaktoren, kantelen; (2) oker vakwerk, rode luiken, zandsteen, naaldspits, tentdak; (3) planken onder spanen,
       blauwgrijze luiken, veldsteen, naaldspits, kantelen; (4) roze vakwerk, kale luiken, zandsteen, zadeldaktoren,
       tentdak. De maker kiest de stijl uit het nummer van het land (`w.maker`), en het ontworpen gehucht houdt zijn
       eigen huizen. Elk ontwerp in zijn vier standen, zodat een nieuw huis zijn deur naar de weg keert; de daken volgen
       de trede (riet of spanen, dan leien, dan pannen; `T.volgendeTekening` en `kiesGroei` vragen het aan de trede), en
       baksteen pas met een steenbakkerij. Zo'n 120 tekeningen per stijl, bijna 500 in totaal (een uur renderen, zo'n
       30 MB op schijf); een spel laadt er een paar tientallen (stap 1). De bouwfasen per vorm, niet per kleur.
    3. **De grote gebouwen:** de herberg met stal, binnenplaats, muur en poort; de kapel met de toren van de stijl; de
       woontoren als regel (een stenen huis dat een maand alles heeft, groeit vanaf marktrecht door tot woontoren, met
       drie appartementen); en hun bouwfasen. Een gebouw uit delen (`samen`) krijgt zijn voet en zijn deur van het
       geheel (`meetHuis` in `huizen.cjs`).
    **Marcel (4 okt): "A. Ja prima voor nu. B. Ja".** Dus vier stijlen zoals hierboven, en de natuursteen hoort bij de
    stijl (het ene land veldsteen, het andere zandsteen). En: "Push alles maar en zet alles op main dan maak ik nieuwe
    sessie". De volgende sessie begint met stap 1.
    **Plan voor stap 1, een vel per tekening (Claude, 4 okt, dertigste sessie; wacht op Marcel).** Gemeten: bij het
    begin staan er op het ontworpen gehucht en op elk land van de maker 10 tekeningen uit `tegels/huizen.png` (23 erop)
    en 1 uit `tegels/gebouwen.png` (27 erop), samen 12 MB, terwijl de browser beide vellen helemaal vasthoudt: 55 MB.
    Met de bouwstijlen (stap 2, zo'n 500 tekeningen van gemiddeld 1 MB) zou een vel ruim 500 MB worden.
    - **a, elke tekening een eigen bestand:** `tegels/huizen/<naam>.png` en `tegels/gebouwen/<naam>.png`, strak
      gesneden zoals nu, met zijn maat en anker in `tegels.js`; `npm run tiled` maakt ze zo. In Tiled wordt zo'n vel een
      echte verzameling met een plaatje per tegel. De andere vellen (bomen, begroeiing, erf, tuin: samen 5 MB, en overal
      op de kaart) blijven zoals ze zijn.
    - **b, laden wat er staat:** zodra de kaart er is (nieuw spel, laden, een ander gebied), laadt het spel de
      tekeningen die erop staan; een nieuw gebouw als het neergezet wordt (de bouwplaats duurt dagen), en een huis dat
      doorgroeit, houdt zijn oude plaatje tot het nieuwe er is. Nooit een grijs blok. "Bleker", zoals hierboven in het
      plan, kan niet: van een huis dat nog niet geladen is, is er niets om bleker te tekenen.
    - **c, meten:** `Spel.debug.vellen()` zegt welke vellen en tekeningen de browser nu vasthoudt, en hoeveel MB;
      daarmee ervoor en erna, en in stap 2 en 3 weer. Verwacht bij het begin 12 MB in plaats van 55 (van zo'n 200 MB aan
      plaatjes); het eerste keer uitzoomen verandert niet (die 165 ms zijn de grond en het bos).
    - **d, nakijken:** elke nieuwe tekening pixel voor pixel gelijk aan zijn stuk van het oude vel, rond hetzelfde anker;
      vaste schermafdrukken (het gehucht, het overzicht, een bouwplaats, een huis dat doorgroeit) byte voor byte gelijk;
      toetsen erbij; `npm test` groen. Een sessie.
    Gezien onderweg, niet in deze stap: ook de figuren laden altijd alles (werd stap 1b).
    Vragen: **A**, ook de gebouwen, niet alleen de huizen? **B**, zo laden? **C**, de figuren op de lijst, of meteen
    erna?
    **Marcel (4 okt): "A ja B ja C meteen erna".** Dus de huizen en de gebouwen elk een eigen bestand, laden wat er
    staat zoals hierboven, en meteen daarna dezelfde regel voor de figuren (stap 1b): een figuur laadt als zijn wezen op
    de kaart komt.
    **Stap 1 gebouwd (4 okt, dertigste sessie; zie onder Af, en `beeld.md`, "Een vel per tekening").** Bij het begin 153
    MB aan plaatjes in plaats van 197; alle 50 tekeningen pixel voor pixel dezelfde. Erbij: `Spel.debug.vellen()` en
    `npm run schermen` (twintig vaste schermafdrukken, byte voor byte te vergelijken), ook voor stap 2 en 3 en WebGL.
    **Stap 1b gebouwd (4 okt, dertigste sessie; zie onder Af):** de figuren laden net zo, als hun wezen op de kaart
    staat. Bij het begin 81 MB aan plaatjes; de twintig schermafdrukken byte voor byte dezelfde als na stap 1. De
    volgende stap is 2, de vier bouwstijlen.
    **Marcel (4 okt, dertigste sessie): "En optie 2 over het dak. Alleen als het doorgroeit of gebouwd wordt daarna."**
    Dus een huis krijgt het dak van de trede waarin het gebouwd wordt of doorgroeit; wat er al staat, houdt zijn dak, en
    aan de daken zie je de geschiedenis van het dorp. En hij vroeg: "Hoeveel ontwerpen zijn acceptabel?"
    **Antwoord van Claude:** het geheugen is geen grens meer (een spel heeft één stijl, en laadt
    alleen wat er staat). De grenzen zijn nu de tijd van het renderen (een huis kost zo'n 40 seconden rekenen, hier op
    vier kernen 10 seconden per huis, en een bouwfase per ontwerp en stand ook) en de opslagplaats: een huis is zo'n 60
    kB, die is nu 44 MB, en elke keer dat de huizenbouwer zo verandert dat alle huizen anders worden, komt de hele reeks
    er in de geschiedenis bij (elke sessie in de cloud haalt die geschiedenis op). Gerekend, met de daken per trede
    (riet of spanen, leien, pannen) en baksteen pas met een steenbakkerij:
    - **drie ontwerpen per soort, twee boerderijen** (voorstel): per stijl 12 hutten (die houden riet of spanen: een hut
      is een hut), 36 huizen, 36 stenen huizen (natuursteen onder leien of pannen, baksteen onder pannen) en 24
      boerderijen, samen 108; vier stijlen 432 tekeningen, met hun bouwfasen zo'n twee uur renderen, en de opslagplaats
      van 44 naar zo'n 90 MB. In één straat van tien huizen herhaalt er zelden een (drie ontwerpen maal vier standen
      maal het dak van wanneer het gebouwd werd);
    - **twee per soort:** 80 per stijl, 320 samen, anderhalf uur, zo'n 80 MB;
    - **alle ontwerpen van nu** (4 hutten, 6 huizen, 6 stenen huizen, 5 boerderijen): 220 per stijl, bijna 900 samen,
      vijf uur, en de opslagplaats drie keer zo groot.
    En eerst één stijl helemaal in het spel (renderen, de maker, de daken, nakijken met `npm run schermen`), dan de
    andere drie in één keer: zo kost een fout één stijl renderen en niet vier.
    **Marcel (4 okt): "ja drie per soort, hutten houden riet".** Dus per stijl drie ontwerpen per soort en twee
    boerderijen: 12 hutten, 36 huizen, 36 stenen huizen en 24 boerderijen, 108 per stijl en 432 samen; de hutten houden
    hun riet (in de plankenstijl spanen, zoals voorgesteld), en de huizen, de stenen huizen en de boerderijen krijgen het
    dak van de trede waarin ze gebouwd worden of doorgroeien. Eerst één stijl helemaal in het spel (stap 2a), dan de
    andere drie (stap 2b).
    **Plan voor stap 2a, de eerste stijl helemaal in het spel (Claude, 4 okt, eenendertigste sessie; wacht op
    Marcel).** Nagekeken vóór het plan (op `75c681a`, `npm test` 908/908): het spel kiest de tekening van een nieuw huis
    los van waar het komt (`T.volgendeTekening`, uit een lijst per soort); een erf zet zijn huis zo ver mogelijk naar
    achteren (noord), waar de weg ook ligt; de maker zet een huis alleen achter het plein (noord of west), want elke deur
    zit aan de kant van de camera (zuid of oost); en wie doorgroeit, doet dat zonder bouwfasen (`groeiGebouw` in
    `js/behoeften.js`): alleen de hut op een erf, de boerderij op verzoek en, met de spelregel "Huizen", een huis dat jij
    neerzet, rijzen op in fases. De vormen van nu stonden voor Marcel op één blad ("De vormen van nu").
    1. **Een proefplaat van de eerste stijl, wit** (wit vakwerk, groene luiken, veldsteen, riet): de gekozen hutten,
       huizen, hun stenen broertjes en boerderijen in de stijl; één huis in zijn vier standen (de deur naar zuid, oost,
       noord of west); dat huis onder riet, leien en pannen, en zijn stenen broertje in veldsteen onder leien en onder
       pannen, en in baksteen onder pannen; en drie straatjes (het gehucht, een dorp, marktrecht met een steenbakkerij).
       Terwijl Marcel kijkt, komen de regels.
    2. **Renderen:** de 108 tekeningen en hun bouwfasen, zo'n drie kwartier op de achtergrond; `npm run tiled` zet ze in
       `tegels/huizen/`, elk met zijn voet en zijn deur.
    3. **In het spel:** (a) **de stijl per land:** de maker geeft elk land een stijl, die het dorp onthoudt (`D.stijl`),
       dus een bewaard spel houdt hem; in 2a krijgt elk land wit, in 2b kiest het nummer van het land er een van de vier.
       Het ontworpen gehucht en een spel dat eerder bewaard is, hebben geen stijl en blijven precies zoals nu (en dus de
       toetsen en de speeltest ook). (b) **Het dak van de trede** (`T.volgendeTekening`, `kiesGroei`): riet in het
       gehucht (in de plankenstijl spanen), leien in een dorp, pannen met marktrecht; een hut houdt riet, en wat er
       staat, houdt zijn dak tot het doorgroeit. Een stenen huis in een gehucht krijgt leien (er zijn er drie per ontwerp,
       zoals besloten). (c) **De steen:** een stenen huis in de natuursteen van zijn stijl, en baksteen onder pannen pas
       als het dorp een steenbakkerij heeft. (d) **De stand:** op een erf staat het huis achteraan, met zijn deur naar de
       weg en de moestuin ervoor, zodat zijn paadje kort is; een boerderij op verzoek keert zijn deur naar de weg; wie
       doorgroeit, houdt zijn stand. Het huis van de schout is al wit vakwerk op veldsteen en past bij wit; in 2b krijgt
       het de stijl van zijn land.
    4. **Nakijken:** toetsen erbij (de stijl, het dak per trede, de baksteen, de stand, het doorgroeien), `npm test`
       groen; `npm run schermen`: het ontworpen gehucht byte voor byte hetzelfde, land 5 van de maker in de nieuwe stijl;
       de speeltest met de bouwer op landen van de maker (`--maker`, zaad 1 tot 3, twee jaar): geen fout, en een dorp
       dat door de daken heen groeit; en schermafdrukken van zo'n dorp voor Marcel.
    Per stijl zo'n 10 MB in de opslagplaats (die is nu 48 MB), en `tegels/tegels.js` groeit van 245 naar zo'n 460 kB.
    Een sessie. Vragen: **A**, de eerste stijl wit, met hut 1, 3 en 4, huis 1, 3 en 6 (en hun stenen broertjes) en
    boerderij 1 en 4? Per soort zo verschillend mogelijk (recht, met een aanbouw, een T; een L-hut); boerderij 2
    (planken) en 5 (blokhut onder spanen) passen bij de plankenstijl. **B** (idee van Claude), elke stijl een eigen
    drietal vormen, zodat je een land ook aan zijn vormen herkent en niet alleen aan zijn kleur (oker bijvoorbeeld huis
    2, 4 en 5)? **C**, bouwfasen alleen voor wat het dorp met een bouwplaats bouwt, de hut en de boerderij (36 per stijl
    in plaats van 108)? Een huis dat jij neerzet met de spelregel "Huizen", rijst dan bleek op, zoals vóór de fases.
    **D**, de maker zet de huizen rondom het plein met hun deur ernaartoe, ook vóór het plein (dan met hun achterkant
    naar je toe, zoals twee boerderijen nu)? Elk land ziet er dan anders uit dan nu, ook land 5. **E**, tussendoor de
    toets die soms faalt (`opmerkingen.md`, bovenaan) een vast zaad geven, zodat een push er niet op stukloopt?
    **Marcel vroeg erbij (4 okt): "Kunnen we een andere agent starten die alvast het webgl deel uitvoert?"** Dus loopt
    vraag 123 (tekenen met WebGL) sinds 4 okt in een eigen sessie naast de huizen, op een eigen branch, met een eigen
    plan voor Marcel; die sessie blijft uit de bestanden van de huizen, en schrijft onder vraag 123.
    **Marcel (4 okt): "A ja B ja C ik wil overal bouwfase voor. Dat maakt het toch wel leuker. Kost meer tijd. Maar is
    eenmalig toch? D ja E ja".** Dus: de stijl wit met hut 1, 3 en 4, huis 1, 3 en 6 (en steen 1, 3 en 6) en boerderij 1
    en 4; elke stijl een eigen drietal vormen (bij 2b); bouwfasen voor alle 108 tekeningen; de maker zet de huizen rondom
    het plein met hun deur ernaartoe; en de toets die soms faalt, krijgt een vast zaad. Het renderen is eenmalig: rekentijd
    van de machine, en alleen opnieuw als de huizenbouwer zo verandert dat alle huizen anders worden. Wat blijft, is de
    opslagplaats: met alle bouwfasen zo'n 18 MB per stijl, samen zo'n 75 MB. Daarna gevraagd, **G**: met "overal" ook een huis
    dat doorgroeit? Dat gebeurt nu in één nacht, zonder fases (`groeiGebouw` in `js/behoeften.js`). Voorstel van Claude:
    het nieuwe huis rijst op in de laatste drie fases (muren met steigers, het dakgebinte, half gedekt) over de bouwtijd
    van zijn soort, en de mensen blijven erin wonen. **Marcel (4 okt): "G ja".** Het komt met de bouwfasen van wit, dus
    met de draaibare huizen (Marcel: "G bij de draaibare huizen is goed"; eerder zie je het alleen op het ontworpen
    gehucht, want de huizen van de maker hebben nog geen fases); tot dan groeit een huis in één nacht, zoals nu.
    **Marcel vroeg erbij: "ik wil ook de camera kunnen draaien. Is dat mogelijk"**, aan de sessie van WebGL gegeven (die
    schrijft het als vraag 124). Voor de huizen: de vier standen zijn nu gespiegeld in de diagonaal (`nok: 'y'`), niet
    gedraaid, en de bouwer vult alleen de muren in die je ziet. Voor een draaiende camera moet een huis van vier kanten
    hetzelfde huis zijn, en dan zijn de vier standen meteen de vier aanzichten. Voor wit maakt dat weinig uit (opnieuw
    renderen is een uur rekenen); vóór 2b moet het besluit er zijn.
    **Besloten in de sessie van WebGL (vraag 124; Marcel, 4 okt: "A prima", "124b Ja dan", en het draaien "mag na
    webgl"):** de camera draait in kwartslagen (Q en E), na WebGL, en de huizen worden draaibaar gerenderd: één 3D-huis
    met deur, ramen en vakwerk vast op alle vier de muren, echt gedraaid in plaats van gespiegeld, zodat de vier standen
    de vier aanzichten zijn. Dat komt vóór 2b, en wit gaat dan opnieuw door de bouwer; de herberg, de kapel en de
    woontoren (stap 3) worden meteen draaibaar. Taken (afgestemd met die sessie): de bouwer en de huizen hier; de camera
    in het spel, de oude huizen van het ontworpen gehucht, de oude gebouwen (`dorp.cjs`), de bomen en de grond daar, na
    WebGL. Het spel kiest het aanzicht met `T.metDeurNaar` (`js/bouwstijl.js`). De gespiegelde bouwfasen van wit zijn
    daarom gestopt; wat er met de gespiegelde tekeningen gebeurt, is vraag **H** (H1: nu in het spel, zonder bouwfasen,
    tot de draaibare ze vervangen; H2: alleen hier toetsen). **Marcel (4 okt): "H1 is oke, we vervangen als we zover
    zijn".** Dus wit staat nu gespiegeld in het spel, zonder bouwfasen (een hut op een erf rijst bleek op), tot de
    draaibare huizen er zijn.
    **Schets voor de draaibare huizen (Claude, 4 okt, eenendertigste sessie; nog geen plan voor Marcel, eerst nader
    lezen):** de tekenaar (`tekenWereld` in `toren.cjs`) tekent een wereld van losse delen, elk met zijn afstandsveld `f(x,
    y, z)`, een grens en een materiaal dat ook naar de plek kijkt. Een kwartslag draaien kan dus op de afgewerkte wereld:
    elk deel vraagt zijn punt gedraaid op, met zijn grens en zijn lichten mee (een `draai: k` op de opgave). De zon blijft
    linksboven, zoals bij elke tekening. Het eigenlijke werk zit in de bouwer, die nu alleen de muren invult die je ziet
    (`maakStukken` maakt alleen de stukken aan de +q- en de +a-kant, `verdeel` zet ramen alleen waar `zicht` is, en een
    dakkapel en een aanbouw komen aan de kant van de kijker): met `rondom: true` krijgt elke muur van elke vleugel zijn
    stukken, ramen, vakwerk en luiken, vast per muur en niet naar wat de camera ziet, met de deur op de lange muur van de
    hoofdvleugel. De vier standen zijn dan `draai` 0 tot en met 3 van één huis; spiegelen (`nok: 'y'`) is voor de stijlen
    niet meer nodig. De oude huizen blijven zoals ze zijn (zonder `rondom`). Nakijken: één huis van vier kanten op een
    plaat, en een muur die je in twee aanzichten ziet, moet in beide hetzelfde zijn.
    **Plan voor de draaibare huizen (Claude, 4 okt, tweeëndertigste sessie; wacht op Marcel).** Nagelezen op `988a7fd`
    (`huis-sdf.cjs`, `huizen.cjs`, `tekenWereld`): de doos van een huis is rondom dicht, maar alles wat de bouwer óp een
    muur zet, staat alleen aan de twee kanten naar de camera: de stukken muur (`maakStukken`), de deur en de ramen
    (`verdeel`, alleen waar `zicht` is), het vakwerk, de gevel met zijn topraam en de windveren (alleen de +a-kop), de
    bulten, de dakkapellen, de aanbouw, de erker en de gevelschoorsteen, en de steiger van de bouwfasen ('xy'). De
    achterkant en de linker gevel zijn nu een kale muur in de kleur van de wand. `zicht` meet met de kijkrichting
    (`zichtbaar`, `K.V`). Het tekenen kent de camera en de zon op één plek (`EX`, `EY`, `V`, `LICHT` en `RANDLICHT` in
    `tekenWereld`); de patronen rekenen in de maten van het huis zelf (de stenen uit de normaal, het riet uit zijn plek op
    het dak), alleen het korrelige in schermpixels.
    1. **De camera draait om het huis, niet het huis om de camera:** `tekenWereld` krijgt `draai` (0 tot en met 3), en de
       camera, de zon en het randlicht gaan een kwartslag om het huis, zodat de zon op het scherm linksboven blijft. Het
       huis zelf blijft precies hetzelfde, dus elke steen, balk en lap riet ligt in alle vier op dezelfde plek. (Het huis
       draaien, zoals de schets zei, kan ook, maar dan vallen de patronen die met de assen van de wereld rekenen per stand
       anders uit: de stenen, de helling van het huis, de steenlijn.) Een kwartslag is wisselen en een minteken, dus draai
       0 rekent precies zoals nu: de oude huizen blijven byte voor byte dezelfde. Het kader, de voet, de deur en het anker
       (`kaderVan`, `meetHuis`, `renderHuis`) rekenen met de draai; de ramen die 's avonds branden, komen al uit de pixels.
    2. **De bouwer met `rondom: true`:** elke muur van elke vleugel krijgt stukken (ook aan de -q- en de -a-kant, van links
       naar rechts zoals je hem van buiten ziet, wat voor de muren van nu op hetzelfde uitkomt), met ramen, vakwerk,
       luiken en bakken, en beide kopse kanten een gevel met topraam en windveren. "Wat je ziet" wordt "wat je van een van
       de vier kanten ziet" (`zichtVanStukken` met de vier kijkrichtingen). De deur staat op de lange muur van de
       hoofdvleugel; `nok: 'y'` en `deur: 'achter'` zijn voor een huis rondom niet meer nodig. Elke muur krijgt zijn eigen
       lot (uit het zaad, de vleugel, de kant en de verdieping), zodat wat er aan de ene muur verandert, de andere niet
       verschuift.
    3. **De standen** (`STANDEN` in `huizen.cjs`) worden de draai: zuid is draai 0, oost, noord en west hetzelfde huis een,
       twee en drie kwartslagen verder. De namen blijven (`wit-huis1-riet-o`), dus het spel hoeft niets te veranderen, en
       `T.metDeurNaar` is straks ook het draaien van de camera. Elke muur zie je in twee standen: één keer links in de zon,
       één keer rechts in de schaduw. Bij een L of een T wijst de vleugel dan echt de andere kant op, niet gespiegeld.
    4. **De bouwfasen** komen uit hetzelfde huis en draaien mee; de steiger komt rondom, zodat de bouwplaats van vier
       kanten dezelfde is.
    5. **Nakijken:** een proefplaat (`huis-sdf-export.cjs rondom`): huis 1, de L-hut (hut 4) en de T (huis 6), elk van
       vier kanten naast elkaar, en een bouwfase van vier kanten. Toetsen: een muur die je in twee standen ziet, heeft in
       beide dezelfde ramen op dezelfde plek (gemeten aan de bouwer); een oud huis is byte voor byte zijn plaat van nu; de
       voet en de deur van een stand zijn die van zuid, gedraaid. `npm test` groen, en `npm run schermen` byte voor byte
       op het ontworpen gehucht.
    6. **Dan wit opnieuw door de bouwer**, met alle bouwfasen (`bouwfasen.cjs --erbij`; hier op vier kernen zo'n twee
       uur, in twee delen, want een taak op de achtergrond stopt na twee uur), en daarmee **G**: een huis dat doorgroeit,
       rijst op in de laatste drie fases over zijn bouwtijd, en de mensen blijven erin wonen. Een bewaard spel houdt zijn
       tekeningen (dezelfde namen); alleen de deur van een L of T kan een tegel verschuiven, want gedraaid is niet
       gespiegeld.
    Niet in dit plan: de camera draaien in het spel, de oude huizen van het ontworpen gehucht, de gebouwen uit `dorp.cjs`,
    de bomen en de grond (vraag 124, na WebGL). Stap 1 tot en met 5 is een sessie; 6 rekent op de achtergrond. Vragen:
    **A**, de achterkant en de linker gevel krijgen wat de voorkant heeft (vakwerk, ramen, luiken, bakken, een gevel met
    topraam), maar de uitbouwen blijven waar ze nu staan (vooral voor en rechts), en er komt geen tweede deur? **B**, de
    steiger rondom? **C**, eerst de proefplaat, en pas na jouw blik wit opnieuw renderen?
    **Marcel (4 okt): "A ja en het idee opslaan, hier komt later ook iets van een moestuin bij. B ja C ja".** Dus: de
    achterkant en de linker gevel zoals de voorkant, de uitbouwen blijven waar ze staan, geen tweede deur; de steiger
    rondom; en eerst de proefplaat. Het idee van een achterkant met leven (een achterdeur naar het erf, een houtstapel,
    een regenton, en later een moestuin achter het huis) staat in `opmerkingen.md`, onder Het beeld.
    **Gebouwd (4 okt, tweeëndertigste sessie): stap 1 tot en met 5; de proefplaat wacht op Marcel (C).** De tekenaar
    draait de camera, de zon en het randlicht om de wereld (`tekenWereld` met `o.draai`, `draaiNaar` en `lichtenNaar` in
    `toren.cjs`); de bouwer vult met `rondom` elke muur in (`huis-sdf.cjs`: een stuk muur heeft een `kant`, het zicht telt
    van vier kanten, elke muur heeft zijn eigen lot, `lotVan`); `STANDEN` in `huizen.cjs` zijn de draai, en `meetHuis`,
    `renderHuis` en `renderHuisFasen` meten en tekenen gedraaid, met de steiger rondom. Onderweg bleek: in de binnenhoek van
    een T of een L met de vleugel naar voren zie je de deur maar van één van de twee kanten waar hij naar je toe kijkt (bij
    zuid zat de vleugel ervoor); nu moet de deur te zien zijn van zuid én van oost (`zichtDeur`), en komt hij dan in de
    gevel van die vleugel. Nagekeken: tien oude huizen (ook het witte gespiegelde van nu) pixel voor pixel dezelfde;
    alle acht standen van de L en de T met hun deur aan de goede kant, en voet en deur precies elkaars kwartslag;
    `test/draaibare-huizen.test.cjs` (ook: een wereld die de tekenaar draait, is pixel voor pixel die wereld zelf
    gedraaid); `npm test` 925/925. Aan het spel (`js/`, `tegels/`) is niets veranderd: in het spel staat nog het witte
    gespiegelde, tot stap 6. De proefplaat: `node gereedschap/pixelart/huis-sdf-export.cjs rondom`. Zie `beeld.md`, "De
    draaibare huizen".
    **Marcel (4 okt), na de proefplaat:** "En dus zonder schaduw he? Want dat doet webgl nu" (ja: de tekeningen voor het
    spel hebben geen schaduw op de grond, alleen het licht op het huis zelf; het gras en de schaduw op de proefplaat zijn
    alleen daar), en "ja start maar". Dus stap 6: wit opnieuw door de bouwer, eerst de huizen (`npm run tiled huizen`), dan
    de bouwfasen in twee delen (`bouwfasen.cjs --erbij hut huis`, dan `--erbij stenenHuis boerderij`; met namen schrijft
    `--erbij` sinds vandaag zijn fasen erbij, zodat een deel niet verloren gaat als een taak stopt).
    **G is gebouwd** (tweeëndertigste sessie, terwijl wit renderde): een huis dat doorgroeit, rijst op in de laatste drie
    bouwfasen van zijn nieuwe tekening (vanaf `groeiVanafFase`, 2: de muren met steigers) over de bouwtijd van zijn
    nieuwe soort, en wie erin woont, blijft erin wonen. Alleen het beeld: het voorwerp is `inAanbouw`, het gebouw blijft
    `klaar`, dus de regels zien het nieuwe huis meteen, en de speeltest speelt hetzelfde jaar; een tekening zonder
    bouwfasen groeit in één nacht, zoals altijd (`groeiGebouw` in `js/behoeften.js`, `T.bouwFaseIndex` met `vanaf`, en
    `T.tikGebouwenDag` zet hem af; drie toetsen in `test/behoeften.test.cjs`).
    **Marcel vroeg erbij (4 okt): "Kun je alvast een extra agent starten voor het volgende punt op de werklijst?"** Dus
    loopt stap 2b (de andere drie bouwstijlen: oker, planken, roze, elk met een eigen drietal vormen) sinds 4 okt in een
    eigen sessie, op de branch `claude/bouwstijlen-2b`, begonnen op `ccr-9fc8b85a-tfgsyn` (met de draaibare bouwer en G).
    Die sessie maakt eerst een plan en proefplaten voor Marcel, en schrijft onder vraag 114, stap 2b. Afgesproken: ze
    blijft uit `tegels/` tot het wit van deze sessie in `main` staat, ze verandert de bouwer zelf alleen als een stijl het
    vraagt, en ze rendert in delen onder twee uur (`bouwfasen.cjs --erbij <soorten>`).
    **Stap 6 is af (tweeëndertigste sessie):** wit staat draaibaar in het spel, met alle bouwfasen (108 tekeningen, elk
    met vijf fasen; de bouwfasen in drie delen, want een taak op de achtergrond stopt na twee uur, en één deel ging
    verloren toen de container herstartte). Onderweg bleek dat de schoor van hut 1 in stand west vooraan over de rand
    van zijn voet stak (de toets van het anker zag het): bij een huis rondom staat een schoor nu binnen één tegel voor
    de gevel en telt hij mee in de voet (hut 1 6 bij 4, huis 3 9 bij 7). Nagekeken: alleen de witte tekeningen
    veranderden, de oude bleven pixel voor pixel dezelfde; geen deur aan de verkeerde kant; `npm test` 928/928;
    `npm run schermen` tegen de stand van vóór (`6bfd3ba`, gemaakt in een losse kopie met `git worktree`): 21 van 23
    beelden byte voor byte gelijk (het hele ontworpen gehucht, de nacht, de herberg, de bouwplaatsen), en alleen land 5
    van de maker anders, met het nieuwe wit en een iets ander gelegd land (de maker legt het anders nu de voet van hut 1
    en huis 3 veranderde).
    **Plan voor stap 2b, de andere drie stijlen (Claude, 4 okt, tweede sessie naast de draaibare huizen; wacht op
    Marcel).** Nagelezen op `5b1793f` (de branch van de draaibare huizen). Wit gebruikt hut 1, 3 en 4, huis 1, 3 en 6 en
    boerderij 1 en 4. Over zijn nog maar hut 2, huis 2, 4 en 5 en boerderij 2, 3 en 5: genoeg voor één stijl, dus er
    komen nieuwe vormen bij. De bouwer kan al alles wat de stijlen vragen: kalk oker en roze, luiken rood (`rood`),
    blauwgrijs (`pet`) en kaal (het hout zelf), zandsteen op een muur, wanden van planken en blokhut, en spanen. Hij heeft
    ook uitbouwen die het spel nog nergens gebruikt: een galerij op palen (`balkon`), een buitentrap naar een opkamer
    (`trap`), een erker op klossen, en twee lagen met een overkragende verdieping (alleen het huis van de schout). Daarmee
    kan elke stijl een eigen karakter krijgen, niet alleen een eigen kleur:
    - **(2) oker, "de zolders":** oker kalk, rode luiken, zandsteen, riet. Huis 2 (anderhalve laag met een dakkapel),
      huis 4 (de L met de vleugel naar achter) en huis 5 (smal en hoog, met een schoorsteen op de gevel); hut 2 en twee
      nieuwe (een kleine vierkante van 4 bij 4 met een schoor, een lange van 7 bij 4); boerderij 3 (anderhalve laag, twee
      kapellen) en een nieuwe: een T met de vleugel naar voren, 10 bij 5.
    - **(3) planken, "het houtland":** planken onder spanen, blauwgrijze luiken, veldsteen. Alles van hout: de huizen van
      planken (nu vakwerk), de hutten van planken of stammen (nu vlechtwerk), het stenen broertje veldsteen met planken
      erboven. Drie nieuwe huizen: een lang huis van 9 bij 5 met een galerij op palen, een L met een buitentrap, en een
      van 8 bij 5 met een aanbouw en een schoor; drie nieuwe hutten (planken 5 bij 4, stammen 6 bij 4, een L van planken);
      boerderij 2 (de T van planken) en 5 (de blokhut onder spanen).
    - **(4) roze, "het rijke vakwerk":** roze kalk, kale luiken, zandsteen, riet. Drie nieuwe huizen: twee lagen met een
      overkragende verdieping (7 bij 5), een met een erker (8 bij 5), en een T met de vleugel naar achter en anderhalve
      laag; drie nieuwe hutten; twee nieuwe boerderijen (een L met de vleugel aan de andere kant, en een lange van 10 bij 6
      met twee lagen boven de woning).
    Wat de bouwer er nog voor mist (klein, in `huizen.cjs`, niet in de bouwer zelf): een stijl die de wand zet (de
    planken), en wat er op het stenen broertje boven de steen komt; een vorm die alleen voor een stijl is, zodat hij
    niet ook als losse tekening in het spel komt; een hut zonder luiken, ook als zijn vorm ze had (hut 2). Wat de
    proefplaat moet laten zien: of de galerij, de trap en de erker goed gaan met `rondom` en de draai (ze zijn nooit
    van vier kanten getekend; ze blijven voor en rechts, zoals de andere uitbouwen).
    Volgorde: (1) per stijl een proefplaat (`huis-sdf-export.cjs stijl oker`, `planken`, `roze`), zoals die van wit:
    de vormen, een huis en een hut in de vier standen, de daken en de steen, drie straatjes. Alleen in
    `gereedschap/pixelart/uit/`, niets in `tegels/`. (2) Na jouw ja, en pas als het wit van de draaibare huizen in
    `main` staat: renderen, per stijl in drie delen van minder dan twee uur (de huizen, de bouwfasen van de hutten en
    de huizen, die van de stenen huizen en de boerderijen), samen zo'n zeven uur; de opslagplaats groeit zo'n 55 MB.
    (3) De maker kiest de stijl uit het nummer van het land (`T.stijlVoorLand`, nu altijd wit), dan `npm test`,
    `npm run schermen` en de speeltest op landen van de maker.
    Vragen: **A**, de vormen zo, met de galerij, de trap, de erker en twee lagen als kenmerk van een stijl? **B**, de
    plankenstijl helemaal van hout (ook de hutten en boven het stenen broertje)? **C**, eigen hutten per stijl (acht
    nieuwe), of delen de stijlen de hutten (een hut verschilt dan alleen in dak en wand)? **D**, het huis van de schout in
    de stijl van zijn land (het stond bij 2a voor 2b), nu, of met de grote gebouwen (stap 3)? **E**, zo'n zeven uur
    renderen en 55 MB erbij in de opslagplaats?
    **Marcel (4 okt): "A ja B ja C delen D stap 3 E tuurlijk".** Dus: de vormen zoals hierboven, met de galerij, de trap,
    de erker en twee lagen als kenmerk; de plankenstijl helemaal van hout (de huizen en de hutten van planken, boven het
    stenen broertje planken); de stijlen delen de hutten van wit (hut 1, 3 en 4), elk in zijn eigen dak, wand en kalk, dus
    er komen geen nieuwe hutten; het huis van de schout krijgt de stijl van zijn land pas met de grote gebouwen (stap 3);
    en het renderen mag.
    **De stijlen staan in de bouwer, en de proefplaten zijn gemaakt (4 okt, tweede sessie naast de draaibare huizen; nog
    niets in `tegels/`):** `STIJLEN` in `huizen.cjs` heeft oker, planken en roze, de nieuwe vormen staan in `VORMEN`
    (nooit een losse tekening op het vel), en `stijlHuizen` maakt van een nieuw huis zelf zijn stenen broertje
    (`steenVan`). Een stijl kan de wand zetten (`wand`, de planken) en wat er boven de steen komt (`boven`), en `hut: 'wit'`
    zegt dat oker en roze de hutten van wit nemen: die tekening krijgt `ook: ['oker', 'roze']`, en `js/bouwstijl.js` zet
    hem dan ook onder die stijlen. Een huis dat doorgroeit, zoekt zijn nieuwe tekening nu in de stijl van zijn dorp, niet
    in die van zijn oude tekening (anders werd een hut van wit in een dorp van oker een wit huis). Samen 300 nieuwe
    tekeningen: oker en roze 96, planken 108; wit en de oude huizen bleven precies dezelfde opgaven. De proefplaten:
    `node gereedschap/pixelart/huis-sdf-export.cjs stijl oker` (en `planken`, `roze`). Onderweg bleek dat de bouwer met
    `rondom` een trap of een erker stil weglaat als de voordeur er op de lange muur niet meer naast past; planken huis 8 en
    roze huis 11 zijn daarom 6 tegels diep in plaats van 5. Oker huis 5 en roze huis 12 houden hun dakkapel niet onder
    elk dak (onder leien en pannen valt hij weg, bij roze huis 12 ook onder riet). `test/bouwstijl.test.cjs` faalt tot de
    stijlen gerenderd zijn (hij telt de opgaven tegen de tekeningen op het vel).
    **Marcel (5 okt), na de proefplaten: "1 ja 2 is goed zo".** Dus de drie stijlen zoals op de platen, en oker huis 5 en
    roze huis 12 mogen onder een dun dak hun dakkapel missen. Het renderen begint als het wit van de draaibare huizen in
    `main` staat.
    **Stap 2b is af (5 okt, tweede sessie naast de draaibare huizen, op `claude/bouwstijlen-2b`):** de 300 huizen van oker,
    planken en roze staan in `tegels/huizen/` (`npm run tiled huizen`, 64 minuten), elk met zijn vijf bouwfasen
    (`bouwfasen.cjs --erbij` met namen, in zes delen; 45 tekeningen is zo'n anderhalf uur, en een deel ging verloren toen de
    container herstartte). Het vel van de huizen heeft nu 512 vakken (huizen is het laatste vel in elke kaart, dus er
    schuift geen nummer op). Nagekeken: alle bestaande tekeningen, wit en de oude huizen, byte voor byte dezelfde; geen deur
    aan de verkeerde kant; `npm test` 946/946, met toetsen voor de vier stijlen, eigen vormen per stijl, de gedeelde hutten
    en het doorgroeien in de stijl van het dorp; `npm run schermen` tegen `main` (`aca768e`): 21 van 23 beelden byte voor
    byte gelijk, alleen land 5 van de maker anders, want dat bouwt nu in planken; de speeltest met de bouwer op landen van
    de maker (zaad 1 tot en met 4, twee jaar): geen fouten in de console, elk land een dorp en marktrecht in het eerste
    jaar, 26 naar 67 tot 82 mensen, geen doden van kou of honger. Opslagplaats: `tegels/huizen/` 24 MB, `tegels/bouwfasen/`
    58 MB. Nog niet in `main`. Het huis van de schout, de herberg en de kapel krijgen hun stijl in stap 3.
115. **De houthakker hakt bomen om, en plant nieuwe** (Marcel, 4 okt, zesentwintigste sessie, terwijl het wijdere land
    gebouwd werd: "De houthakker hakt bomen om uiteindelijk en plant nieuwe boompjes terug"; plan van Claude; open).
    **Hoe het nu is:** een houthakker hoort sinds 4 okt bij het bos (minstens 8 bomen binnen 7 tegels van zijn voet; vraag
    112, c), maar hij hakt geen boom om: zijn hout komt uit het niets, 2 per dag, en het bos blijft zoals het was.
    Voorstel:
    - **a, hakken:** de houthakker loopt naar een boom in zijn buurt (zoals een boer naar zijn akker, vraag 111), hakt hem
      om (een tijdje werk, met een eigen beweging), en er blijft een stronk staan. Een boom geeft zoveel hout (zo'n 10);
      zijn hout per dag komt dan uit wat hij omhakte en naar huis bracht.
    - **b, planten:** na het hakken plant hij een boompje op een vrije plek in de buurt, of op de stronk zodra die
      vergaan is; een boompje groeit in een jaar of twee tot een boom (drie maten: boompje, jonge boom, boom).
    - **c, het bos doet ertoe:** hakt hij harder dan het bos aangroeit (meer houthakkers, of de wet Houtkap), dan wordt
      het bos om hem heen dunner en zie je de bosrand wijken; onder de 8 bomen hakt hij minder. Zo is een bos een
      voorraad die je ziet, en een keuze (hout nu, of bos later). De bomen in het bos van de heer: de wet Houtkap.
    - **d, wie hem ziet:** de stronken en de boompjes zijn te zien, en de houthakker is een poppetje aan het werk, net als
      de boeren op hun veld. Daarom samen met vraag 111: dezelfde manier van een plek om te werken, een weg erheen en
      een beweging erbij (een bijl, zoals de maaier een zeis heeft).
    Vragen: **a**, zo? **b**, groeit een boompje in een jaar, of langer (dan is het bos echt schaars)? **c**, samen met
    de boeren (vraag 111), dus na de huizen (vraag 114)?
    **Marcel (4 okt): "ja op de openstaande vragen".** Dus a zoals voorgesteld, b een jaar of twee (drie maten), en c
    samen met de boeren en de beesten in het bos (vraag 116), na de huizen.
116. **Beesten in het bos** (Marcel, 4 okt, zesentwintigste sessie: "Ik wil dat er beesten kunnen rondlopen in het bos.
    Wolven etc. Die de houthakker kunnen bedreigen. Rode ogen uit het duister."; plan van Claude; open).
    **Wat er al is:** de wolf staat in `T.WEZENS` (`js/wereld.js`): een monster om mee te vechten, uit het oude spel, met
    een tekening en een loopbeweging (`gereedschap/pixelart/bosvijanden.cjs`, met de reuzenspin en de kobold), en hij kan
    al dwalen. Het voorval "wolven" kost een schaap. Op de kaart loopt nog geen dier in het bos.
    Voorstel:
    - **a, wie er leven:** wolven, in roedels van twee tot vier, diep in het bos; herten, schuw, die wegrennen (de jager
      jaagt op wat er rondloopt); later een wild zwijn of een beer. Hoeveel, zegt het bos van het land.
    - **b, dag en nacht:** overdag blijven de wolven diep in het bos; tegen de avond komen ze naar de rand, en 's nachts
      zie je in het donker alleen hun ogen: twee rode puntjes die bewegen, ook waar je de wolf zelf niet ziet.
    - **c, de dreiging:** wie aan de bosrand werkt (de houthakker, de jager, wie sprokkelt), vooral in de schemering,
      kan een wolf tegenkomen: hij vlucht naar huis, en zijn werk van die dag is half. In de winter hebben de wolven
      honger: ze pakken een schaap van de meent, of vallen iemand aan (gewond, en een enkele keer dood).
    - **d, wat je ertegen doet:** de jager houdt ze klein; een jacht (het voorval dat er al is), of de schout met de
      militie in een gevecht in beurten (de wolf is al een monster om mee te vechten); een hek om de schapen; een lantaarn
      aan de bosrand.
    - **e, wanneer:** samen met de houthakker die hakt en plant (vraag 115) en de boeren op hun veld (vraag 111): dan
      werkt de houthakker echt in het bos, en is er iets om bang voor te zijn.
    Vragen: **a**, deze dieren? **b**, mag een wolf iemand doden (de spelregel kan het zachter)? **c**, samen met 111 en
    115?
    **Marcel koos (4 okt): "1 ja, doden mag"**: deze dieren, een wolf mag iemand doden, en samen met de boeren (111) en de
    houthakker (115), na de huizen.
117. **Eén kaart: het eiland** (Marcel, 4 okt, zesentwintigste sessie: "Ik wil uiteindelijk toch alles op dezelfde kaart.
    Dus de hele spelwereld als het ware. Zo kun je steeds stukken 'ontdekken' in de fog of war. Het idee is een eiland. Met
    water rondom. Je krijgt een random positie op het land. Kan aan de buitenkant zijn of binnen in het land."; plan van
    Claude; open).
    **Wat er nu is:** het land is een aparte kaart met provincies waar je in dagen reist (vraag 63, `js/land.js`, achter de
    spelregel Land, die standaard uit staat), en elke provincie zou een eigen kaart krijgen. Dit vervangt dat: één grote
    kaart, een eiland met de zee rondom, waarop alles ligt.
    Voorstel, in stappen:
    - **a, het eiland uit de maker:** een kust met de zee rondom (de zee in plaats van het donker aan de rand), binnenin
      bossen, heide, veen, heuvels met rotsen en een rivier; je dorp op een plek die het lot kiest, aan de kust (dan vis,
      en later een haven) of binnenin.
    - **b, de mist:** wat niemand van jou zag, is donker; wat je eerder zag, maar nu niet ziet, is grijs, zoals je het
      je herinnert (dat past bij Marcels "laatst bekende inventarisatie", 1 okt). De schout ontdekt lopend; later ook
      anderen (de jager, een verkenner), en de marskramer vertelt wat hij zag.
    - **c, de rest op het eiland:** het kasteel van de heer (de heer, de inner en de soldaten komen dan over de weg van
      daar, en je ziet waar ze vandaan komen), de stad, en later het buurdorp en de tegenspelers (vraag 72 en 60), elk met
      een eigen dorp ergens op het eiland. De kaart van de provincies gaat weg; reizen is lopen (en later rijden).
    - **d, de maat en de snelheid:** een eiland van 300 bij 300 is negen keer het land van nu. Het tekenen maakt dat niets
      uit (alleen wat in beeld is), de regels wel: een dorp ver weg loopt dan niet met al zijn poppetjes tegel voor tegel,
      maar als getallen (vraag 79, D), en dichtbij als poppetjes. Een bewaard spel houdt alleen wat veranderde; het eiland
      zelf komt uit het nummer.
    - **e, wanneer:** eerst de kern (vraag 114, dan 111 met 115 en 116), dan a en b, dan c met het buurdorp.
    Vragen: **a**, hoe groot? **b**, het kasteel en de stad ook op het eiland? **c**, kun je van het eiland af (met een
    schip)? **d**, de mist zo, zwart en grijs? **e**, deze volgorde?
    **Marcel koos (4 okt): "2500x2500 is goed"** en "akkoord" op de volgorde (eerst de huizen, dan de boeren met de
    houthakker en de beesten, dan het eiland). Het kasteel, de stad, het schip en de mist zijn nog niet beantwoord: het
    voorstel hierboven staat, en dat vragen we opnieuw als het eiland begint.
    **Wat 2500 bij 2500 betekent (Claude, 4 okt):** 6,25 miljoen tegels, 625 keer het land van nu. Het kan, maar niet zoals
    de kaart nu in het spel zit, en het is de grootste technische stap tot nu toe. Vijf dingen moeten anders, en daarom
    eerst een proef die het meet, vóór er iets op het eiland komt:
    - **De kaart in stukken.** Nu staat elke tegel als tekst en als ding in het geheugen (op 100 bij 100 zo'n 10.000);
      bij 6,25 miljoen is dat honderden MB. Het eiland komt in stukken van zo'n 64 bij 64 tegels, als compacte getallen,
      en een stuk wordt pas gemaakt (uit het nummer van het eiland) als je in de buurt komt, zoals in Minecraft.
    - **Opslaan wat veranderde.** Het eiland zelf komt uit het nummer; een bewaard spel houdt alleen wat er gebouwd,
      gehakt en ontdekt is. Dan moet de maker zijn versie onthouden: verandert hij, dan legt hetzelfde nummer een ander
      eiland, en past een oud spel niet meer (of de oude maker blijft bewaard).
    - **Ver lopen, met Marcels vier technieken** (2 okt, bij vraag 88; Marcel, 4 okt: "kunnen we de a* technieken niet
      gebruiken die ik eerder in de lijst aan je gaf?"): ja, en ze passen beter dan het idee van de wegen. **HPA\*** is
      gemaakt voor precies dit: de stukken van 64 bij 64 zijn zijn blokken; per blok onthoudt het eiland waar je van het ene
      blok in het andere kunt, en hoe ver dat binnen het blok is. Een lange tocht zoekt eerst over die blokken (een kaart
      van 39 bij 39 blokken in plaats van 2500 bij 2500 tegels) en daarna A* binnen het blok waar je nu bent, onderweg
      steeds het volgende. De eilanden (vraag 88) zijn de eerste laag: is het doel onbereikbaar, dan weet hij het meteen.
      **Flow fields** voor wat veel mensen in een dorp delen (de put, de kerk, de herberg, de markt): één zoektocht vanaf
      het doel, en iedereen volgt de pijl op zijn tegel. **Time-slicing**: de zoektochten over een paar beelden spreiden
      (dat doet het spel al een beetje: hooguit acht per beeld). **Group steering**: alleen de leider zoekt, de rest volgt
      hem: een roedel wolven (vraag 116), de soldaten van de heer, de rovers, de militie met de schout.
    - **Wat ver weg is, als getallen.** Een dorp, een roedel wolven of de heer die onderweg is, loopt dichtbij met zijn
      poppetjes en ver weg als getallen (vraag 79, D).
    - **De tijd.** Op 1× loopt de schout zo'n kwartier van de ene kust naar de andere, op 30× minder dan een minuut; later
      een paard. Dat past bij het ontdekken.
118. **Inwoners met stats, zoals in Dwarf Fortress** (Marcel, 4 okt, zesentwintigste sessie: "Inwoners krijgen ook
    'stats' hp, skills, eigenschappen, etc ala dwarf fortress"; plan van Claude; open).
    **Wat er al is:** elke bewoner heeft een naam, een leeftijd, een huis, een gezin en werk (`js/bewoners.js`); de vijf
    boeren hebben een karakter (`T.KARAKTERS`, tien soorten, met een eigen gesprek) en gelote eigenschappen (maaien,
    opbrengst, zaaien, aanzien; `js/boeren.js`); de raadsman twee vaardigheden (`js/raadsman.js`). Levenspunten hebben
    alleen wie vechten: de schout, de militie en de veteranen.
    Voorstel:
    - **a, levenspunten voor iedereen:** wie een wolf of een rover treft, raakt gewond of sterft (vraag 116: "doden
      mag"); een wond geneest in een paar nachten, ziekte en kou kosten ook leven.
    - **b, vaardigheden die groeien:** per soort werk (hakken, maaien, jagen, vissen, bouwen, brouwen, bakken, weven,
      smeden, vechten) een getal dat groeit met wie het doet: wie een jaar houthakker is, hakt sneller dan wie net begint.
      Wat een werkplaats maakt, hangt dan af van wie er werkt, en wie er weggaat (de heervaart, een wolf), laat een gat.
    - **c, eigenschappen:** iedereen een karakter, zoals nu de boeren, en een of twee eigenschappen uit het zaad (sterk,
      snel, lui, moedig, bang, handig, gierig, ...): ze sturen wat hij doet (wie vlucht voor een wolf en wie vecht, wie
      naar de herberg gaat, wie je iets komt vragen) en wat hij zegt.
    - **d, te zien:** klik iemand, en een papier (zoals het briefje bij een huis) zegt wie hij is: zijn leven, zijn
      vaardigheden, zijn eigenschappen, zijn familie en waar hij werkt.
    - **e, later:** wie met wie bevriend is of ruzie heeft, en verhalen die daaruit komen (zoals in Dwarf Fortress).
    - **f, wanneer:** met de mensen aan het werk (vraag 111, 115 en 116): dan doen de levenspunten ertoe (de wolven) en de
      vaardigheden (het hakken, het maaien). Een dorp van 5000 (vraag 79, D) houdt het per persoon klein: een handvol
      getallen.
    Vragen: **a**, deze stats? **b**, vaardigheden die groeien met het werk? **c**, samen met 111, 115 en 116?
    **Marcel koos (4 okt): "1 ja 2 ja 3 akkoord"**: deze stats, vaardigheden die groeien met het werk, en samen met de
    boeren, de houthakker en de beesten.
119. **Paden zoeken voor veel mensen en een groot eiland** (Marcel, 4 okt, zesentwintigste sessie: een lijst technieken,
    met "Wat ik typte bedoel ik": flow fields of Dijkstra-kaarten, time-slicing, hiërarchisch A* (HPA\*, ook in meer lagen),
    sturen en elkaar ontwijken (ORCA, RVO), Jump Point Search, tegels samenvoegen (2×2, 4×4), en vooraf berekende
    snelwegen (contraction hierarchies); de uitgebreide versie van zijn lijst van 2 okt, vraag 88; plan van Claude; open).
    **Hoe het nu zoekt:** A* met een hoop en een tabel van getallen (2,8 keer zo snel sinds 4 okt), een raster van wat
    vaststaat, de eilanden (een onbereikbaar doel weet hij meteen), en hooguit acht zoektochten per beeld. Maar bij het
    zoeken telt iedereen die ergens staat als een muur (`wezensBlokkeren`): daardoor is elke zoektocht uniek en niets te
    hergebruiken, mislukt een zoektocht als er iemand in een deur staat (vandaar de rem, vraag 88), en kan een flow field
    niet, want dat kent alleen wat vaststaat.
    Wat waar past:
    - **D, sturen in plaats van iedereen als muur (het belangrijkste):** A* alleen over wat vaststaat (muren, huizen,
      bomen, water); wie een ander op zijn volgende tegel treft, wacht even, ruilt van plaats of stapt opzij. ORCA en RVO
      zijn voor vrij bewegen; op ons raster wordt het wachten, ruilen of uitwijken. Dan is een weg te hergebruiken (van
      huis naar werk elke dag dezelfde, tot de kaart verandert), en kunnen A en C erbovenop.
    - **A, flow fields** voor wat veel mensen delen: de put, de kerk, de herberg, de markt, het plein, de weg uit het dorp.
      Eén zoektocht terug vanaf het doel, opnieuw als de kaart verandert, en iedereen volgt de pijl op zijn tegel.
    - **B, time-slicing:** nu acht per beeld; beter een tijdsbudget (zoveel milliseconden per beeld), zodat een goedkoop
      beeld er meer doet en een duur beeld minder.
    - **C, HPA\* in lagen** voor het eiland (vraag 117): tegels, stukken van 64 bij 64, wijken en streken, het eiland;
      eerst de route over de grove lagen, dan A* in het stuk waar je bent.
    - **Jump Point Search:** ons raster heeft overal dezelfde stapkosten, dus het past, vooral in de open wei van het
      wijdere land; de wegen zijn even kort, maar niet letter voor letter dezelfde.
    - **Tegels samenvoegen** (2×2, 4×4): voor de grove lagen van HPA\* en voor wat ver weg als getallen loopt.
    - **Vooraf berekende snelwegen:** op het eiland over de wegen en kruispunten; HPA\* onthoudt de wegen tussen de
      ingangen van een stuk al, en dat is hetzelfde idee. Pas als dat niet genoeg is.
    **Twee soorten lopen** (het begin van Marcels lijst: "All 1,000 moving to different targets" of "to the same
    target"): het dorp heeft ze allebei. In de spits 's ochtends en 's avonds gaat iedereen naar zijn eigen doel (zijn
    werk, zijn deur): daar helpen D (dezelfde weg elke dag, onthouden), B en op het eiland C. Op andere momenten gaan veel
    mensen naar hetzelfde (de herberg 's avonds, de put, de kerk, het plein bij een feest, de soldaten naar de poort, de
    rovers naar een akker): daar helpt A, één berekening voor iedereen.
    **Voorstel voor wanneer:** D, A en B met de mensen aan het werk (vraag 111, 115, 116 en 118), want dan lopen er veel
    meer mensen naar akkers en het bos, en het is ook de weg naar de 5000 (vraag 79). C, Jump Point Search, het
    samenvoegen en de snelwegen met het eiland (vraag 117).
    Vragen: **a**, D is een andere manier van lopen (de mensen plannen niet meer om elkaar heen, maar wachten of wijken
    uit), dus de speeltest speelt daarna niet meer letter voor letter hetzelfde jaar: goed? **b**, D, A en B met de
    mensen aan het werk, of eerst, vóór de huizen?
    **Marcel koos (4 okt):** a, "ja, dat werkt in het 'echt' ook zo denk ik. Je kunt nu eenmaal niet over iemand heen";
    b, "eerst, voor de huizen". Dus D, A en B nu, in die volgorde, en dan de huizen (vraag 114). Na elk stuk meten met
    `npm run grootte` (ook `--maker 5`) en een speeltest, zodat te zien is wat het deed.
    **Gebouwd (4 okt, zesentwintigste sessie): D en A** (`js/lopen.js`, toetsen in `test/lopen.test.cjs`).
    - **D:** een weg gaat alleen om wat vaststaat (`T.zoekRoute`), en de kaart onthoudt hem tot hij verandert. Wie
      onderweg een ander op zijn volgende tegel treft, lost het daar op (`T.ontwijk`): lopen ze elkaar tegemoet, dan
      schuiven ze langs elkaar (na even wachten ook als de ander dwars wil); loopt de ander door, dan wacht hij even;
      staat de ander maar wat, dan gaat die een stap opzij, of ze ruilen van plaats als hij nergens heen kan; om wie bezig
      is (maaien, een gesprek, een koe) loopt hij een korte omweg; en anders wacht hij tot zijn geduld op is (8 seconden
      van de wereld, zo'n veertig minuten van de dag) en zoekt het later opnieuw. Zo lopen de dorpelingen, de schout, de
      inner, de rovers, het vee en de maaiers; een gevecht niet (daar telt elke tegel). Een drukte die van twee kanten
      door een doorgang van één tegel breed wil: 20 mensen zijn er na 28 seconden van de wereld allemaal, 40 na 47, 60
      na 68 (zonder het ruilen in een drukte liepen 40 vast).
    - **A:** waar velen heen gaan (de plekken van het dagritme: hun deur, hun werk, de put, de herberg), komt de weg uit
      een veld: vanaf het doel ring voor ring hoeveel stappen elke tegel ervan af ligt, zo ver als de verste die erheen
      wilde. Even kort als A* (een toets kijkt het na op een doolhof), en omdat een veld alleen uit de kaart is, dezelfde
      weg hoe ver het veld ook al gegroeid was, en na het laden.
    - **Gemeten** (`npm run grootte` op land 5 van de maker, de wereld per beeld op 30×, gemiddeld en de traagste 5%):
      | mensen | vóór | na D | na D en A |
      | --- | --- | --- | --- |
      | 100 | 1,3 ms (12 ms) | 0,84 ms (7,6 ms) | 0,68 ms (5,4 ms) |
      | 200 | 3,9 ms (24 ms) | 2,7 ms (19 ms) | 2,2 ms (14 ms) |
      | 400 | 10 ms (63 ms) | 9,8 ms (63 ms) | 7,4 ms (50 ms) |
      Het zoeken van een weg was 50 à 53% van een beeld; nu 16% (de meting telt sinds 4 okt ook de velden, en niet alleen
      A*). Na D vroeg het dwalen bij 200 mensen 828 wegen per dag, maar maar een kwart kende de kaart al: wie dwaalt,
      vertrekt elke dag van een andere tegel; daarvoor is A. Een veld groeit door het raster van wat vaststaat direct te
      lezen (`T.vastRaster`); toen het per buur T.isBegaanbaar vroeg, was dat bij 400 mensen de helft van het zoeken.
      De bouwer speelt zoals ervoor: een dorp en marktrecht op dezelfde dagen, aan het eind een paar mensen minder
      (`speelbaar.md`).
    - **Wat nog kan, als het nodig is:** een veld nu alleen vergeten als de kaart vlak bij zijn tegels verandert (de
      houthakker van vraag 115 verandert de kaart bij elke boom); de lantaarns van één nacht in één keer zetten (nu
      rekent het raster na elke lantaarn opnieuw: bij 400 mensen een hapering van zo'n 150 ms 's nachts).
    - **B, open bij Marcel.** Mijn voorstel was een tijdsbudget: zoveel milliseconden per beeld voor het zoeken. Dat
      heeft een prijs die ik eerst niet zag: dan loopt het spel op een snelle computer anders dan op een trage, en een
      geladen spel anders dan hetzelfde spel zonder laden. De speeltest geeft dan bij hetzelfde zaad niet meer hetzelfde
      jaar (daarmee zien we wat een bijgesteld getal deed), en de proef met opslaan kan niet meer letter voor letter
      vergelijken. Wat er nu is, is wat Marcels lijst onder B noemt ("a fixed number per frame"): hooguit 8 wegen per
      beeld (`zoekPerBeeld`). Gemeten op 30×: bij 200 mensen zit het dwalen in 8% van de beelden aan die grens, bij 400 in
      18% (de ochtend en de avond); met 32 per beeld werd het traagste beeld twee keer zo traag. De grens doet dus wat
      hij moet. Voorstel: B blijft zoals het is, en een budget in werk (hoeveel tegels het zoeken bekijkt, op elke
      computer hetzelfde) pas met het eiland (vraag 117), als een zoektocht daar veel meer kan kosten.
      **Marcel koos (4 okt): "B akkoord".** B blijft zoals het is: hooguit 8 wegen per beeld (`zoekPerBeeld`).
120. **Een levendig dorp: een praatje als ze even niets te doen hebben** (Marcel, 4 okt, zesentwintigste sessie: "Het
    dorp moet echt levendig en realistisch aanvoelen. Mensen die een praatje staan te maken als ze even niets te doen
    hebben etc"; plan van Claude; open).
    **Wat er nu is:** iedereen heeft per uur een plek (`T.dagAnker`: zijn deur, de put, zijn werk, waar hij vrij is), en
    daar dwaalt hij in een straal rond (`T.dwaal`); 's avonds gaan er een paar naar de herberg, en bij een feest staat het
    dorp op het plein. Maar wie vrij is, dwaalt alleen, en wie elkaar tegenkomt, ziet elkaar niet.
    Voorstel:
    - **a, een praatje:** wie vrij is en een bekende tegenkomt die ook vrij is (een buur, familie, wie bij hem werkt),
      blijft staan, en ze draaien naar elkaar toe; wie langskomt, schuift aan, tot een groepje van drie of vier. Na een
      kwartier tot een uur gaan ze verder. Op vaste plekken vaker: bij de put 's ochtends, op het plein, voor de kerk na de
      mis, voor de herberg.
    - **b, waarover:** een wolkje boven het groepje met een tekentje van waar ze het over hebben, uit het spel zelf: het
      graan (honger), het hout (kou), de heer (een kroon, na een gril), de inner, de rovers, een bruiloft, het weer. Sta je
      erbij, dan hoor je een zin ("Ze zeggen dat de heer een standbeeld wil, van zichzelf"). Zo voel je hoe het dorp
      ervoor staat zonder venster, zoals het concept het wil: wat elders één klik is, gaat hier via een persoon. En wat een
      getuige zag, vertelt hij dan niet alleen in de herberg (`T.getuigenVertellen`), maar ook in een praatje.
    - **c, wat het dorp verder laat leven** (om uit te kiezen): wie langs elkaar loopt, groet (een knik); 's ochtends
      halen ze water bij de put, met een emmer; een oude man op een bankje voor zijn deur, in de zon; kinderen die
      tikkertje spelen op het plein; een hond die meeloopt, kippen bij een boerderij; rook uit de schoorsteen als er iemand
      thuis is en het koud is; wie iets maakt, brengt het weg (de bakker met brood naar de markt).
    - **d, de regels:** a en c veranderen niets aan de regels (alleen waar iemand staat en wat hij doet); b laat de roddel
      ook in een praatje rondgaan. Met vraag 118 (e) zegt wie met wie praat ook wie bevriend is, en een praatje maakt
      vrienden; de eigenschappen zeggen wie graag praat en wie stil is.
    - **e, wanneer:** het praatje (a) past bij vraag 119, D: daar komen twee mensen elkaar op het raster tegen, en in
      plaats van uit te wijken blijven ze staan als ze allebei vrij zijn. Het waarover (b) en c met de mensen aan het werk
      (vraag 111, 115, 116 en 118), want die geven de figuren (de emmer, de bundel hout) en de eigenschappen.
    Vragen: **a**, het praatje zo? **b**, het wolkje met waar ze het over hebben, uit het spel? **c**, welke van c? **d**,
    het praatje met 119 D, en de rest met de mensen aan het werk?
    **Marcel koos (4 okt): "120 a b d ja".** Dus het praatje zoals voorgesteld (a), het wolkje met waar ze het over
    hebben, uit het spel (b), en de volgorde (d): het praatje bij het lopen van vraag 119, D, dus als eerste nu dat af is,
    en het wolkje met de mensen aan het werk (vraag 111, 115, 116 en 118). De kleine dingen (c) koos hij niet: die blijven
    liggen, tot hij er een wil.
    **Het plan voor het praatje** (4 okt, zevenentwintigste sessie; Claude, eerst gemeten met een paar gespeelde dagen):
    in het ontworpen gehucht komen vrije mensen elkaar zo'n 70 keer per dag tot op twee tegels na, maar meer dan de helft
    daarvan is een gezin op zijn eigen erf. Tussen twee huizen is het zo'n 30 keer, vooral overdag op het plein (de
    kinderen en de ouden) en bij de put. In een dorp van 100 is het zo'n 250 keer, en ook daar is ruim de helft een gezin
    op zijn erf; de rest vooral 's avonds op straat. Wie vrij is, blijft bij zijn deur, en het ene huis komt het andere
    zelden tegen.
    - **Wie:** wie vrij is: 's ochtends, in de schaft, 's avonds, en overdag wie geen werk heeft. Geen kleuter, en niet
      wie maait, aan zijn hut bouwt, de schout zoekt, opgeroepen is, wegtrekt of net komt; de herbergierster 's avonds
      ook niet, want dan tapt ze.
    - **Met wie:** iemand uit een ander huis die hij kent: een buur (de deuren binnen 20 tegels; in het gehucht is dat
      bijna iedereen) of wie bij hem werkt. Zijn eigen gezin niet: dat spreekt hij binnen, en anders is meer dan de
      helft van de praatjes een gezin voor zijn eigen deur.
    - **Waar:** waar ze elkaar tot op twee tegels naderen, en vaker op de vaste plekken: de put, het plein, voor de
      herberg en de kapel, en op een feest. Na de mis kan nog niet, want er is geen zondag.
    - **Hoe vaak en hoe lang:** een op de drie keer dat twee bekenden elkaar zien, op een vaste plek twee op de drie;
      een kwartier tot een uur (op 1× 3 tot 12 seconden, op 10× een tiende daarvan), en nooit langer dan het deel van de
      dag (de schaft eindigt om één uur, het werk begint, het is bedtijd). Daarna een uur niet weer. Hooguit vier in een
      groepje. Geschat: in het gehucht zo'n tien praatjes per dag, en staat er een derde van de tijd ergens een; in een
      dorp van 100 zo'n twintig, in een van 200 zo'n vijftig, anderhalf tegelijk.
    - **Hoe het eruitziet:** wie een bekende ziet, loopt tot naast hem, liefst links of rechts op het scherm, zodat je
      ze van opzij ziet, en ze draaien naar elkaar toe (`e.kijkt`, zoals aan de schandpaal). Met drie of vier staan ze in
      een kringetje en kijken ze naar het midden. Ze staan stil en ademen; een houding "praten" is er nog niet (die hoort
      bij de mensen aan het werk). Wie langs wil, loopt om ze heen, zoals om een maaier, en in een smalle doorgang gaat
      er een even opzij. Spreek je er een aan, dan stapt hij uit het groepje.
    - **De regels:** niets verandert: een werkplaats rekent met de looptijd, niet met waar iemand staat
      (`T.werkUrenVan`). Wel valt het toeval anders, dus de speeltest speelt een ander jaar dan ervoor. De snelheid: wie
      vrij is, kijkt alleen bij zijn dwaalstap wie er binnen twee tegels staat (gemeten met `npm run grootte`, bij 200).
      Het groepje staat in `S`, dus het blijft na het laden.
    - **Instelbaar:** de spelregel "Praatjes" (aan of uit), de getallen in de werkbank (`T.PRAATJE_INSTELLINGEN`).
      `Spel.debug.praatjes()` zegt wie er waar staat te praten. Toetsen in `test/praatje.test.cjs`.
    Vragen: **a**, met buren en wie bij hem werkt, en niet met zijn eigen gezin? **b**, nu al een leeg wolkje (drie
    puntjes), om de beurt boven wie praat, of alleen naar elkaar toe gedraaid? Met het wolkje zie je een praatje ook van
    verder, en met b (later) komt er het tekentje in. **c**, het gehucht blijft zo stil: een derde van de tijd één
    groepje. Zal een deel van wie vrij is 's avonds een uur naar het plein gaan (in de proef met de helft verdubbelde dat
    de praatjes van de avond), of eerst zo spelen?
    **Marcel koos (4 okt): "120 a b c ja".** Dus: een praatje tussen twee huizen, met buren en wie bij hem werkt, en niet
    met zijn eigen gezin (a); nu al het lege wolkje met drie puntjes, om de beurt boven wie praat (b); en 's avonds gaat
    een deel van wie vrij is het eerste uur na het werk naar het plein (c).
    **Gebouwd (4 okt, zevenentwintigste sessie; `js/praatje.js`, zie onder Af).** Zoals het plan, met vier dingen die
    het bouwen liet zien:
    - **Tot een uur voor bedtijd op het plein, niet een uur.** Van een boerderij aan de rand van het gehucht is het
      anderhalf uur lopen naar het plein; wie een uur ging, kwam er nauwelijks aan. Ze staan rond het midden (waar de
      marskramer staat), zodat de weg erheen voor iedereen uit één veld komt, en alleen wie binnen 40 tegels van het
      plein woont, gaat: in een stad van 200 op 160 bij 160 liep anders een derde 's avonds de hele kaart over.
    - **Geen rust op een vaste plek.** Na een praatje een uur geen nieuw, behalve op het plein, bij de put of voor de
      herberg of de kapel: daar blijven ze praten, met steeds een ander. Dat verdrievoudigde de praatjes in het gehucht.
    - **Onderweg** (d, vraag 119): treffen twee vrije bekenden elkaar op het raster, dan blijven ze soms staan in plaats
      van uit te wijken. In een dorp van 100 of 200 is dat de helft van de praatjes, want daar woont iedereen verder
      uit elkaar.
    - **Wie begint, neemt de mooiste plek:** links of rechts van de ander op het scherm, ook als hij er al schuin achter
      stond, zodat de een de ander niet verbergt.
    Gemeten (twee gespeelde dagen op 3×): het ontworpen gehucht zo'n 24 praatjes per dag, en bijna altijd staat er ergens
    een; vier landen van de maker 21 tot 47; een dorp van 100 zo'n 21, van 200 zo'n 32, 's avonds drie tegelijk. De
    snelheid: bij 200 mensen voor en na achter elkaar gemeten geen verschil (1,43 tegen 1,39 ms per beeld, de avond 3,0
    tegen 3,1).
    **Marcel (4 okt, na het bouwen): "Praatjes hoeven niet geforceerd. Als het niet gebeurt dan is het zo. Let op wat ik
    zei, geen praatjes forceren. Alleen als mensen een reden hebben en elkaar toevallig tegenkomen. Dus dat 's avonds
    naar het plein mag eruit."** Dus: c gaat eruit (niemand gaat ergens heen om te praten), en ook de rust die op een vaste
    plek niet gold (die zette Claude erbij om de aantallen op te krikken: dat is forceren). Wat blijft, is toeval: wie
    vrij is en onderweg of bij het dwalen een bekende treft, die er ook toevallig is, met de kans uit het plan.
    Gedaan (dezelfde dag): het plein en die rust eruit. Gemeten zoals hierboven: het ontworpen gehucht zo'n 10 praatjes
    per dag, en een derde van de tijd staat er ergens een; landen van de maker 6 tot 17; een dorp van 100 zo'n 16, van
    200 zo'n 25, 's avonds anderhalf tegelijk. De oude toetsen van het dagritme zijn weer zoals ze waren.
121. **Hoogteverschillen op de kaart** (Marcel, 4 okt, achtentwintigste sessie: "Ik heb wel 1 extra verzoek. Hoogte
    verschillen op de kaart. 😁"; plan van Claude; open).
    **Wat er al is:** het ontwerp van 20 sep (`kaarten.md`, "Hoogte is een getal per tegel", Marcels keuze toen): een
    getal per tegel, de wand tussen twee hoogtes afgeleid zoals een randtegel tussen twee grondsoorten, een helling waar
    je over mag, alles op een hogere tegel een trede omhoog, en wie hoog staat, ziet verder. Dat was nog voor Tiled en de
    toren; gebouwd is er niets. Sinds 4 okt maakt de maker het land (vraag 112), dus de hoogte komt nu uit de maker.
    Voorstel:
    - **a, terrassen, geen glooiing:** het land in een paar niveaus (zo'n drie: het dal met de beek, het maaiveld, een
      heuvel of richel), met een wand waar twee niveaus elkaar raken (een rotswand in de heuvels, een begroeide wal
      elders) en hellingen waar je over kunt. Glooiende heuvels (zoals in Age of Empires) ogen zachter, maar dan moet elke
      grondtegel in negentien schuine vormen, en staat een huis scheef; terrassen houden de grondtegels zoals ze zijn.
    - **b, wat het doet:** lopen gaat over een helling en niet tegen een wand op (de wegen, de eilanden en de velden van
      vraag 88 en 119 krijgen dat mee); wie hoog staat, ziet verder, en een heuvel houdt het zicht tegen (de schout, de
      getuigen, de inner: iets verstoppen achter de heuvel); een gebouw en een erf staan op één niveau; de beek loopt
      door het dal. Later: een windmolen of de kapel op de heuvel, het wachthuis dat van boven verder ziet, en in een
      gevecht het hoge punt.
    - **c, waar:** de maker legt heuvels en richels per land, vooral aan de randen en achter het dorp, met de rotsen erop
      (de steengroeve); het hart (het plein, de huizen, de akkers) blijft grotendeels vlak. Het ontworpen gehucht blijft
      vlak, zodat de toetsen erop blijven spelen.
    - **d, eerst een proefplaat:** een stukje land met twee niveaus, een rotswand, een wal, een helling met een pad en een
      huis erop, om naar te kijken vóór er iets in het spel komt. Die kan al met de proefplaat van de huizen mee.
    - **e, wanneer:** het raakt veel (het tekenen en de volgorde ervan, lopen, zien, bouwen, de maker, opslaan): twee à
      drie sessies. Het hoort bij het land: na de boeren (vraag 111 met 115 en 116) en vóór het eiland (vraag 117), dan
      begint het eiland er meteen mee. Commercieel telt het mee: een land met heuvels oogt op een schermafdruk veel beter
      (`commercieel.md`, de beeldstijl als troef).
    Vragen: **a**, terrassen? **b**, dat het lopen, het zicht en het bouwen raakt? **e**, na de boeren en vóór het
    eiland, of eerder?
    **Marcel koos (4 okt): "121 a terrassen, b ja, c na de boeren".** Dus a, terrassen met wanden en hellingen (een
    rotswand in de heuvels, een begroeide wal elders); b, de hoogte raakt het lopen (over een helling, niet tegen een
    wand op), het zicht (verder vanaf een heuvel, en een heuvel houdt het zicht tegen) en het bouwen (een gebouw en een
    erf op één niveau); en e, na de boeren (vraag 111 met 115 en 116), vóór het eiland (vraag 117). Eerst een proefplaat,
    die met die van de huizen mee kan. Nog niet gekozen: c (waar de maker de heuvels legt) en d (de proefplaat zelf);
    die volgen het voorstel, tenzij Marcel bij de proefplaat iets anders ziet.
122. **De snelheid in de browser en via Steam** (Marcel, 4 okt, achtentwintigste sessie: "Ik wil nu ook weten wat het
    verschil in performance is tussen nu spelen in de browser en straks via Steam. Want lag, geheugen tekort etc is geen
    optie straks"; plan van Claude; open). Uitgewerkt in `verpakken.md`, "Snelheid: in de browser of via Steam".
    **Gemeten (dezelfde dag):** via Steam draait het in Electron, en dat is Chromium; in een venster van 1280 bij 800
    zonder videokaart was de kleinste schil even snel als een Chromium-venster (dichtbij 60 beelden per seconde, het
    overzicht op 0,35 57 tegen 49) en zuiniger (zo'n 985 tegen 1.140 MB voor alles samen). Marcel speelt in Firefox, een
    andere motor: wat hij ziet, is niet wat een speler op Steam krijgt. Het echte risico zit in het spel zelf (de regels
    bij veel mensen, grote schermen zonder videokaart, het eiland), en dat is in beide hetzelfde.
    Voorstel: **a**, een lat (op een machine als de Steam Deck 60 beelden per seconde, geen beeld boven de 50 ms in gewoon
    spel, onder 1,5 GB bij 200 mensen); **b**, een proefverpakking voor Marcels pc (Windows, Electron), zodat hij met `F2`
    Firefox en de Steam-versie naast elkaar meet; **c**, `npm run grootte` ook in de schil, zodat groei tegen de lat
    gemeten wordt. Vragen: **a**, deze lat? **b**, de proefverpakking nu, of bij het echte verpakken (januari)?
    **Marcel vroeg erbij: "Is er een manier om te bouwen naar een native exe?"** Een .exe maakt Electron al; echt native
    is het spel opnieuw schrijven (30.000 regels, maanden). De middenweg, als de lat niet gehaald wordt: eerst tekenen met
    WebGL, dan het zwaarste rekenwerk in een Web Worker of WebAssembly (`verpakken.md`, "Een native exe?").
    **Marcel koos (4 okt): "snelheid, middenweg is goed."** Het gaat om de snelheid, niet om consoles: JavaScript en
    Electron blijven, en haalt het spel de lat niet, dan de middenweg. Nog open: **a** (deze lat?) en **b** (de
    proefverpakking voor zijn pc nu, of bij het echte verpakken in januari?).
    **Marcel (4 okt): "122 is goed, maar scherm wordt voor 1920x1080 en ook 4k (heb ik zelf)".** De lat geldt dus op
    1920 bij 1080 en op 4K. Gemeten in de schil zonder videokaart: 1920 bij 1080 zo'n 48 beelden per seconde dichtbij en
    30 in het overzicht, ~950 MB; 4K 15 beelden per seconde en ~1,4 GB. Voorstel van Claude: **4K zoals 1920 bij 1080**,
    tekenen op 1920 bij 1080 (of een hele deling van het scherm) en met een hele factor vergroten: hetzelfde beeld voor
    pixel art, een kwart van het werk, en op elk scherm ongeveer hetzelfde stuk van het land (`verpakken.md`). Vraag:
    **c**, zo? En **b** blijft: de proefverpakking nu (dan meet Marcel op zijn eigen 4K-scherm), of in januari?
    **Marcel (4 okt): "Proefversie wil ik als we de draws doen met webgl".** Dus b: de proefverpakking komt met het
    tekenen met WebGL (vraag 123), en daarmee de middenweg niet pas als de lat niet gehaald wordt, maar als werk.
123. **Tekenen met WebGL** (Marcel, 4 okt, achtentwintigste sessie: "Proefversie wil ik als we de draws doen met webgl";
    na vraag 122, de snelheid via Steam, en de meting op 4K; plan van Claude; open).
    **Wat er nu is:** het spel tekent met het 2D-doek van de browser: de tekenlaag is `js/tekenen.js`, `js/sprites.js`,
    `js/doorkijk.js` en `js/iso.js`, zo'n 3.100 regels, met plaatjes (`drawImage`), vlakken, verlopen en samenstelmodi
    voor de nacht, het licht en de ramen, het raster en het kijkgat van de doorkijk, tekst, en een paar buffers (de grond,
    het bos). De regels (27.000 regels) tekenen niets. Op 4K tekent het zonder videokaart 15 beelden per seconde.
    Voorstel:
    - **a, een eigen kleine WebGL-laag**, zonder bibliotheek (geen afhankelijkheden, gewone scripts): de ingepakte vellen
      (vraag 114, 2a) worden texturen, en alle plaatjes van een beeld gaan in een paar opdrachten naar de videokaart, in
      dezelfde volgorde als nu. De nacht, het licht van de lantaarns, de ramen en de gloed worden één bewerking in een
      shader in plaats van verlopen en samenstelmodi.
    - **b, 4K zoals 1920 bij 1080** (vraag 122, c): het beeld gaat naar een tussenbuffer op 1920 bij 1080 (of een hele
      deling van het scherm), en de videokaart vergroot het met een hele factor.
    - **c, wat klein is, blijft eerst 2D** op een doek erboven: de tekst, de wolkjes, het raster van een gevecht.
    - **d, het 2D-tekenen blijft als spelregel** ("Tekenen: met de videokaart / zonder"), voor een browser zonder WebGL en
      om te vergelijken; de proef met vaste schermafdrukken (vraag 114, 2a) kijkt na dat beide hetzelfde tekenen.
    - **e, dan de proefversie** (Windows, in Electron) voor Marcels 4K-scherm, met `F2`, naast Firefox. Hier is geen
      videokaart: of het klopt, zien we hier; hoe snel het is, alleen op een echte machine.
    - **f, hoe groot:** twee à drie sessies. Eerst meten waar het tekenen nu zijn tijd kwijt is, per laag.
    - **g, wanneer:** na de proefplaat van de huizen (die is tekenwerk in de pixel art-keten, los van het spel) en vóór
      de boeren (vraag 111): de snelheid gaat voor alles (vraag 113), en wat daarna getekend wordt (de boeren aan het
      werk, de terrassen van vraag 121), komt dan meteen op de nieuwe laag. Of na de boeren, maar in elk geval vóór de
      hoogte, want terrassen tekenen en dan overzetten is dubbel werk.
    Vragen: **a**, dit plan? **g**, vóór of na de boeren?
    **Marcel koos (4 okt): "1 ja 2 voor de boeren".** Dus het plan zoals het hier staat, na de proefplaat van de huizen
    en vóór de boeren (vraag 111). De volgorde is nu: de proefplaat van de huizen (vraag 114, 2b en 2c), tekenen met
    WebGL met de proefversie erna (vraag 123), de boeren met de houthakker en de beesten (vraag 111, 115 en 116), de
    hoogte (vraag 121), en dan het eiland (vraag 117).
    **Naast de huizen** (Marcel, 4 okt: "Kunnen we een andere agent starten die alvast het webgl deel uitvoert?"): WebGL
    loopt nu in een eigen sessie, tegelijk met de huizen (vraag 114, stap 2), en niet erna. Die sessie blijft uit de
    bestanden van de huizen; een nieuwe tekening komt binnen zoals nu (een bestand per tekening, `T.sprites.laadWatErStaat`),
    en wordt een textuur op het moment dat hij geladen is, dus de huizen werken vanzelf.
    **Gemeten (f, 4 okt, `npm run tekenmeting`):** land 5 van de maker, zonder videokaart, ms per beeld (de mediaan, met
    een pixel teruggelezen zodat de browser het werk ook doet), en de beelden per seconde van de echte spellus:

    | | 1920×1080 | 4K (3840×2160) | 4K op 200% (1920×1080, ratio 2) |
    |---|---|---|---|
    | dichtbij, dag | 19 ms, 41/s | 64 ms, 13/s | 65 ms, 14/s |
    | dichtbij, avond | 28 ms, 35/s | 99 ms, 10/s | 96 ms, 10/s |
    | overzicht 0,5, dag | 30 ms, 29/s | 75 ms, 11/s | 68 ms, 11/s |
    | overzicht 0,35, dag | 33 ms, 25/s | 74 ms, 12/s | 96 ms, 9/s |
    | overzicht 0,35, avond | 42 ms, 23/s | 109 ms, 7/s | 123 ms, 6/s |

    Per laag: **het rekenwerk van het tekenen is klein** (uitzoeken wat in beeld staat, sorteren, sprites kiezen: 1 à 4
    ms, op elk scherm hetzelfde); **de rest is de browser die pixels zet**, en dat groeit met het scherm (4K is 3,5 keer
    1920×1080). De grond (één buffer, één plaatje): 2 à 3 ms, op 4K 8 à 12. De nacht, het licht en de ramen: zo'n 10 ms,
    op 4K 35 ms (verlopen en samenstelmodi over het hele scherm). De huizen, bomen en mensen: de rest, dichtbij zo'n 100
    plaatjes per beeld, in het overzicht zo'n 930, plus de doorkijk (een uitsnede die het doek laat wachten). De tekst en
    de wolkjes: niet te meten, onder 0,1 ms. Het langste beeld in de spellus: 50 à 80 ms op 1920×1080, 120 tot 500 op 4K.
    **Wat dat zegt:** WebGL wint juist waar de tijd zit (pixels zetten, de nacht als één bewerking), en de tussenbuffer
    (b) maakt van 4K vanzelf 1920×1080: de kolom van 4K wordt de eerste kolom. Die stap kan ook al in 2D.
    **Plan van Claude (4 okt), in deze volgorde:**
    1. **De tussenbuffer, eerst in 2D** (b): het doek is nooit groter dan 1920×1080 (een hele deling van het scherm), en
       de browser vergroot het met een hele factor (`image-rendering: pixelated`). Een kleine stap in `js/main.js`, die
       4K meteen zo snel maakt als 1920×1080, ook zonder WebGL. Je ziet op 4K hetzelfde stuk land als op 1920×1080.
    2. **De WebGL-laag** (a): een nieuw bestand (`js/gl.js`, gewone script, geen bibliotheek) met wat het tekenen nodig
       heeft: een plaatje uit een vel op een plek, met doorzichtigheid, alle plaatjes van een beeld samen in een paar
       opdrachten. Een vel wordt een textuur zodra het geladen is. `js/tekenen.js` tekent naar "een doek" dat het 2D-doek
       of de WebGL-laag is, in dezelfde volgorde als nu: eerst de grond (de buffer blijft eerst in 2D gebakken, en gaat als
       één textuur mee), dan de huizen, bomen en mensen.
    3. **De nacht, het licht en de ramen als shader**: één bewerking over het beeld, met de lichtbronnen
       (`T.lichtBronnen`) als lijst, in plaats van verlopen en samenstelmodi. Daarna de doorkijk (het kijkgat en het
       raster) in dezelfde shader.
    4. **Wat klein is, op een doek erboven** (c): de tekst, de wolkjes, de oogjes, de tekens bij de deur, het raster en
       de markeringen van een gevecht, de kringen en het spookbeeld van het bouwmenu. Wat op de grond ligt (de kring, het
       raster) komt dan boven een huis te staan; past dat niet, dan gaat het als laag op de grond mee naar WebGL.
    5. **De spelregel** (d): "Tekenen: met de videokaart / zonder". Zonder WebGL in de browser gaat het vanzelf zonder.
    6. **De proefversie** (e): Windows, Electron, met `F2` en de spelregel, zodat Marcel op zijn 4K-scherm beide meet.
    **Nakijken dat beide hetzelfde tekenen:** `npm run schermen` krijgt een keuze voor de manier van tekenen, en vergelijkt
    WebGL met 2D op dezelfde commit (niet met een oude reeks: de huizen veranderen land 5). De maat: overdag (de plaatjes
    zijn pixel art, op hele pixels) mag hooguit 0,1% van de pixels verschillen, en dan hooguit 2 op 255 per kleur (afronding
    van doorzichtigheid); 's avonds rekent het licht anders, dus mag elke pixel tot 8 op 255 verschillen, gemiddeld onder 2,
    en Marcel ziet de avond één keer naast elkaar. Wat erboven ligt, is een fout, of een besluit dat hier komt te staan.
    Hier is geen videokaart (WebGL draait in de cloud op de processor, SwiftShader): of het klopt, zien we hier; hoe snel
    het is, alleen op een echte machine.
    **Wat Marcel daarna kan proberen:** na stap 1 het spel op zijn 4K-scherm (in Firefox, en `F2`); na stap 5 de spelregel
    aan en uit; na stap 6 de proefversie naast Firefox.
    Vragen: **A**, dit plan, in deze volgorde? **B**, de tussenbuffer (stap 1) ook voor wie een 4K-scherm op 150% heeft
    (dan is het doek nu 2560×1440: naar 1920×1080 is geen hele factor, dus 1280×720 maal twee, of zo laten)? Voorstel:
    zo laten, alleen een hele factor. **C**, deze maat voor wat anders mag zijn? **D**, de proefversie al na stap 1? Met een
    videokaart tekent Chrome ook het 2D-doek al op de kaart; dan weet je vooraf op je eigen pc hoeveel WebGL wint, en
    daarna meet je het nog een keer. Voorstel: ja, het is een uur werk.
    **Marcel koos (4 okt): "A prima B oke C dat is goed D graag".** Dus het plan in deze volgorde; op 150% blijft het doek
    zoals het is (alleen een hele factor); de maat voor wat anders mag zijn, zoals hierboven; en de proefversie al na
    stap 1.
    **Stap 1 is af (4 okt): de tussenbuffer.** Op een groot scherm tekent het spel op de grootste hele deling ervan die nog
    minstens 1920×1080 is (`T.TEKENEN_INSTELLINGEN.tussenbuffer` in `js/tekenen.js`, `formaat` in `js/main.js`), en de
    browser vergroot het; de muis rekent om (`naarVlak`, `vanVlak`). Gemeten, zonder videokaart: 4K dichtbij van 13 naar
    36 beelden per seconde, 4K op 200% van 14 naar 45, in het overzicht van 7 à 12 naar 17 à 28: 4K is nu 1920×1080.
    Op 1280×800 zijn de twintig schermafdrukken byte voor byte gelijk, en klikken klopt op vijf schermen.
    **De proefversie voor Windows is er (4 okt, `npm run proefversie -- --windows`):** het spel in Electron 44.5.1 (de
    versie van de meting in `verpakken.md`), een zip van 161 MB met `Aardschok/Aardschok.exe`; F11 is het hele scherm,
    Ctrl+Shift+I het gereedschap van de browser. Hier nagekeken met Electron voor Linux: het venster opent het spel vanaf
    een los bestand, met de stand op het titelscherm, en `F2` meet. **Wat Marcel kan proberen:** uitpakken, `Aardschok.exe`
    starten (Windows waarschuwt voor een onbekende uitgever: "Meer info", dan "Toch uitvoeren"), F11, en met `F2` de
    beelden per seconde en het traagste beeld noteren: dichtbij, in het overzicht (`Tab`, en met het wiel ver uit), en
    's avonds. Daarna hetzelfde in Firefox, met `Aardschok/resources/app/index.html` (hetzelfde spel). Dan weten we wat
    zijn videokaart al doet met het 2D-tekenen, en wat WebGL er nog bij moet winnen.
    **Stap 2 is gebouwd (4 okt): de WebGL-laag** (`js/gl.js`). Hij doet zich voor als het 2D-doek, zodat
    `js/tekenen.js` er hetzelfde op tekent, in dezelfde volgorde. Wat de kaart zelf kan, tekent ze: plaatjes, vlakken,
    bolle vormen (de schaduw onder een figuur, de ruitjes van een raam) en ronde verlopen (de nacht, de lantaarns, het
    vignet), met de samenstelmodi van de nacht en de ramen als mengstanden. De rest (tekst, lijnen, een uitsnede) gaat via
    een kladdoek in 2D en komt als plaatje op zijn plek, zodat alles meteen klopt; daarmee zijn stap 3 en 4 al grotendeels
    gedaan, en wat nog via het kladdoek gaat, zegt `Spel.gl.telling`. De spelregel "Tekenen" (stap 5): standaard met de
    videokaart. Zonder echte videokaart (WebGL op de processor, SwiftShader, is hier zes keer trager dan het 2D-doek:
    125 tegen 19 ms per beeld) of als de browser het niet kan, tekent het spel vanzelf zonder; de meter (`F2`) zegt welke.
    **Nagekeken met `npm run schermen -- --tekenen met`** (dat zet WebGL ook op de processor aan): dichtbij en 's avonds
    is hooguit 0,04% van de pixels echt anders; de rest is afronding (1 of 2 op 255) of een buurpixel (bij een zoom die
    geen heel getal is, kiest de kaart soms de pixel ernaast). In het overzicht (0,5 en 0,35) is 0,2 tot 1,4% echt anders:
    daar laat het spel van een tekening maar één op de twee of drie pixels zien, en de browser en de kaart kiezen daarbij
    elk andere; je ziet het niet. Dat valt buiten de maat van C, en is dus een vraag aan Marcel (**E**). Gevonden
    onderweg, ook voor 2D: de grondbuffer werd ver uitgezoomd een fractie verkleind, met een kolom pixels die wegviel; nu
    gaat hij er 1 op 1 op. Electron opent het spel vanaf een los bestand en mag de plaatjes naar de kaart sturen.
    Vraag **E**: in het overzicht mag WebGL andere pixels kiezen dan 2D? Voorstel: ja. Later kan WebGL het overzicht zelfs
    mooier maken (verkleinen met gemiddelde kleuren in plaats van pixels overslaan), maar dat is dan een keuze, geen
    stap van dit plan.
    **Marcel (4 okt): "Ja"** op E: in het overzicht mag WebGL andere pixels kiezen dan 2D. En over de proefversie: "Ik
    maak hem straks wel zelf" (hij kon niet mee: de zip van 161 MB, en ook een stuk van 55 MB, gaf bij het sturen een 502).
124. **De camera draaien** (Marcel, 4 okt, gevraagd in de sessie van de huizen en doorgegeven aan die van WebGL: "ik wil
    ook de camera kunnen draaien. Is dat mogelijk"; plan van Claude; open).
    **Kan het?** Ja, in kwartslagen (`Q` en `E`, zoals in Anno, The Sims en Project Zomboid). Vrij draaien niet: pixel art
    is getekend voor één hoek, en tussenstanden worden vlekken. Bij een kwartslag blijft de kaart dezelfde (Tiled, de
    regels, het lopen, het zicht: niets verandert); alleen hoe hij op het scherm komt, draait.
    **Wat het vraagt, nagegaan per deel:**
    - *Het spel* (zo'n sessie): `T.naarScherm` en `T.naarWereld` (`js/iso.js`) draaien mee, en wat daarop leunt: de
      volgorde van tekenen (`diepteVan`, `staatVoorGebouw`: "ten zuiden of oosten" wordt per stand een andere kant), de
      doorkijk, het klikken (de tegel onder de muis), de camera, de buffers van de grond en het bos (opnieuw bij een
      draai), het bos om de kaart (nu alleen aan de kant van het bos, en de kant die vooraan staat, verandert), de
      voet en de deur van een gebouw van meer tegels.
    - *De figuren, het vee en de rovers*: niets, ze hebben al acht richtingen; een draai kiest een andere.
    - *De grond*: bijna niets. De randtegels ("gras over zandpad: boven+rechts") zijn er voor alle zestien combinaties
      van hoeken, en hun patroon zit aan het scherm vast; na een draai kiest het spel de tegel waarvan de hoeken op het
      scherm kloppen. De akkers: de rijen hebben een richting, dus twee varianten in plaats van één.
    - *De huizen*: geen extra tekeningen, als de bouwer ze draaibaar rendert (zie B). Een huis in stand zuid, een
      kwartslag gedraaid, is dan de tekening van stand oost.
    - *De andere gebouwen* (`tegels/gebouwen`, uit `dorp.cjs`, een aanzicht; de herberg, het huis van de schout, de
      kapel) en hun bouwfasen: vier aanzichten renderen in plaats van een. De beelden komen uit code, dus dat is rekenen,
      geen tekenen; de bouwers moeten wel een kijkhoek krijgen (de patronen rekenen nu in schermpixels).
    - *Bomen, struiken, rotsen, voorwerpen*: vier aanzichten, of de bestaande als ze rond genoeg zijn; het licht valt dan
      van dezelfde kant van het scherm, wat niemand opvalt.
    - *Het geheugen*: alleen de stand die je ziet, is geladen (een vel per tekening, zoals nu); na een draai laadt de
      nieuwe stand, met een korte wachttijd de eerste keer.
    **Hoe groot:** het spel een sessie, de beelden twee à drie (de bouwers een kijkhoek geven, en renderen).
    **Waar in de volgorde:** WebGL staat het niet in de weg (beide tekenen met dezelfde `naarScherm`), en het hoort vóór de
    hoogte (vraag 121): terrassen hebben een wand die je per stand anders ziet, en dat moet in één keer goed.
    Vragen: **A**, kwartslagen, met `Q` en `E`? **B** (nu nodig, voor de sessie van de huizen): de huizen draaibaar
    renderen, met alle vier de muren ingevuld (deur, ramen en vakwerk op elke muur), zodat de vier standen de vier
    aanzichten zijn? Het kost geen tekeningen, alleen werk aan de bouwer; de eerste stijl (wit) is nu gespiegeld en moet
    dan een uur opnieuw rekenen, en het besluit moet er zijn vóór de andere drie stijlen (vraag 114, 2b). Voorstel: ja, want
    het houdt de deur open. **C**, wanneer: na WebGL en na de boeren (vraag 111), vóór de hoogte (vraag 121)? Voorstel: ja;
    voor de demo is het mooi, niet nodig, want de doorkijk laat al zien wat achter een huis staat.
    **Marcel (4 okt): "Mag na webgl"**, en hij vroeg erbij: "Als we de modellen maar 3d modellen maken? Is dat een optie?
    Of zijn de extra richtingen beter? Vraag me af of volledige camera rotatie niet beter is?" Antwoord van Claude: vrij
    draaien vraagt echte 3D in het spel (de huizen en mensen als modellen die de videokaart elk beeld tekent), en dan is
    het geen pixel art meer, of pixel art die bij elke graad flikkert (de trapjes in de randen verspringen); spellen die
    het toch doen, tekenen klein en vergroten met veel shaderwerk, en het blijft een andere stijl. Dat is maanden werk,
    en de beeldstijl is de troef van het spel (`commercieel.md`). Acht richtingen (om de 45 graden) maken van de ruiten
    rechte vierkanten: een tweede set grond en acht tekeningen per gebouw, voor weinig. Voorstel: kwartslagen. Vraag B
    (de huizen draaibaar renderen) is hieronder beantwoord.
    **Marcel (4 okt): "124b Ja dan."** De huizen worden draaibaar gerenderd: alle vier de muren ingevuld (deur, ramen en
    vakwerk op elke muur), zodat de vier standen de vier aanzichten zijn. Dat is werk voor de sessie van de huizen,
    vóór de andere drie stijlen (vraag 114, 2b); de eerste stijl (wit) gaat dan opnieuw door de bouwer.
    **Afgesproken tussen de twee sessies (4 okt; Marcel aan de sessie van de huizen: "Praat even met de webgl sessie over
    draaiende camera en welke gevolgen dat heeft"):** de sessie van de huizen maakt de huizen draaibaar (de bouwer bouwt
    één 3D-huis met alle vier de muren vast ingevuld, en draait het echt), ook de herberg, de kapel, de woontoren en het
    huis van de schout (stap 3). Het spel kiest het aanzicht met `T.metDeurNaar(tekening, kant)` (`js/bouwstijl.js`, op
    de branch van de huizen). De oude huizen van het ontworpen gehucht, de gebouwen uit `dorp.cjs`, de bomen, de grond en
    de akkers horen bij het draaien zelf, na WebGL. Drie afspraken voor de bouwer:
    - **Het licht blijft in elk aanzicht van linksboven op het scherm komen**, de zon draait niet mee met de wereld. Alleen
      dan is een stand ook een aanzicht: een huis met de deur naar het zuiden, een kwartslag gedraaid, ís de tekening
      met de deur naar het oosten, licht en al. Draaide de zon mee, dan moest elk aanzicht apart belicht worden: vier
      keer zoveel tekeningen. Het past ook bij `beeld.md` (één lichtrichting). Het licht van de dag en de lantaarns komt
      er later bovenop (vraag 125).
    - **Het anker ligt in elke stand op dezelfde manier**: op de achterste tegel van de voet op het scherm, zoals nu. Het
      spel rekent bij een draai uit welke tegel van de wereld dan achteraan ligt; de voet en de deur in de wereld
      veranderen niet, alleen welke tekening erop komt.
    - **De schaduw op de vloer los te zetten** (een keuze in de bouwer, nu niets aan het beeld): komen de schaduwen met de
      zon (vraag 125, B), dan moet de ingebakken schaduw eruit, en dan hoeven de huizen alleen nog één keer door de bouwer.
      **Vervallen** (4 okt): de huizen in het spel hebben geen schaduw op de vloer (zie vraag 125, "Bij het nakijken
      bleek").
125. **Schaduwen en licht met de videokaart** (Marcel, 4 okt, na WebGL: "Ja schaduwen en licht etc"; plan van Claude;
    open). Nu: de pixel art heeft zijn licht ingebakken (van linksboven, met een schaduw op de vloer, `belicht` en
    `schaduwOpVloer` in `gereedschap/pixelart/kern.cjs`; `beeld.md`), en de nacht is een donkere laag met lichtere
    kringen rond de schout en de lantaarns. Met WebGL kan er meer, in drie stappen, van goedkoop naar duur:
    - **A, licht** (een sessie, geen nieuwe kunst): de nacht en de lampen als één shader, met licht dat kleurt in plaats
      van alleen minder donker te zijn: warme plassen licht onder een lantaarn, bij een brandend raam en de deur van de
      herberg, een flakkerende vlam, de schout met een lantaarn in de hand; en de dag in kleuren in plaats van een laag
      erover: roze bij het opkomen, neutraal op de middag, oranje bij het ondergaan, blauw in de nacht.
    - **B, schaduwen die met de zon meegaan** (een à twee sessies, en de kunst opnieuw renderen): elke figuur, boom en
      elk huis werpt zijn eigen silhouet scheef over de grond, 's ochtends lang naar het westen, 's middags kort, 's avonds
      lang naar het oosten, en 's nachts weg van een lantaarn als je erlangs loopt. Dan moet de ingebakken schaduw op de
      vloer uit de kunst (de huizen raakt dat: de sessie van de huizen).
    - **C, echt licht op de muren** (twee à drie sessies, alle kunst opnieuw): omdat de beelden uit code komen, kan elke
      tekening naast zijn kleuren ook de richting van elk vlakje meekrijgen (een normal map). Dan verlicht een lantaarn de
      muur die naar hem toe staat, en klopt het licht ook als de camera draait (vraag 124). Het mooiste, en het grootste
      risico voor de stijl: het palet en het ditheren (`beeld.md`) laten dan los, en het geheugen voor plaatjes verdubbelt.
    Commercieel: een dorp in de schemering met warme ramen en lange schaduwen is het plaatje voor de Steam-pagina
    (`commercieel.md`, de beeldstijl als troef).
    Voorstel: A meteen na WebGL; B met eerst een proefplaat; C alleen als proefplaat, om de stijl te beoordelen.
    Vragen: **A**, licht zoals hierboven, en meteen? **B**, schaduwen met de zon, na een proefplaat (en dan de vloerschaduw
    uit de kunst, ook bij de huizen)? **C**, een proefplaat met echt licht op de muren? **D**, waar in de volgorde: vóór
    of na de camera draaien (vraag 124) en de boeren (vraag 111)?
    **Marcel koos (4 okt): "A ja B ja C ja D na webgl".** Dus: A (licht) bouwen, B (schaduwen met de zon) en C (echt licht op
    de muren) eerst als proefplaat, en alles direct na WebGL, dat nu staat. De volgorde wordt: Marcel meet WebGL op zijn
    pc, dan vraag 125 (A, en de proefplaten van B en C), dan het draaien (vraag 124) en de boeren (vraag 111).
    **Plan van Claude voor A, licht (4 okt; nog niet gebouwd).** Nu is de nacht een donkerblauwe laag eroverheen
    (`tekenNacht`, 'source-atop'), met lichtere kringen rond de schout en een gele gloed eroverheen bij de lantaarns: het
    licht maakt alleen minder donker. Voortaan wordt het licht een **lichtkaart** waarmee de wereld vermenigvuldigd wordt:
    - **De lichtkaart:** eerst de kleur van het uur over het hele beeld, dan per lichtbron een warme plas erbij (opgeteld).
      Dan gaat de lichtkaart in één keer over de wereld, als vermenigvuldiging (in `js/gl.js` een mengstand, zonder extra
      buffer; een gat voor een raam blijft een gat, zoals nu met 'source-atop'). Twee keer vermenigvuldigen, met de helft
      als "gewoon", zodat een lantaarn een muur ook warmer en lichter kan maken dan overdag, in plaats van alleen minder
      donker. Daarna de ramen (`vulRamen`, zoals nu), de tekens en het vignet. Op de kaart is dat een paar opdrachten,
      hoeveel lantaarns er ook branden.
    - **De kleur van het uur** komt uit de regels, niet uit het tekenen: `T.lichtKleurVan(dag)` naast `T.lichtVan` in
      `js/dag.js`, met een paar sleutelkleuren in `T.DAG_INSTELLINGEN` (in de werkbank): roze bij het opkomen, neutraal
      (wit, dus de kunst zoals hij is) van de ochtend tot de middag, oranje bij het ondergaan, blauw in de nacht, en
      ertussen vloeiend. Te toetsen zonder scherm.
    - **De lampen:** `T.lichtBronnen` (`js/zien.js`) krijgt per bron een kleur en of het een vlam is. Een vlam flakkert
      (op de klok van het scherm, `S.tijd`, elk met zijn eigen ritme uit zijn plek, zodat ze niet samen knipperen); een
      brandend raam geeft een zachte plas voor het huis op de grond; de deur van de herberg een grotere. De schout draagt
      's avonds en 's nachts buiten een lantaarn: zijn plas licht komt van zijn hand, en gaat met hem mee. Dat is de
      lichtere kring van nu, maar warm. Welke lichten in beeld staan en waar, zegt één functie (`T.lichtenInBeeld`), die
      2D en WebGL allebei vragen.
    - **Wat niet verandert:** het licht in de plaatjes blijft van linksboven komen (vraag 124); het licht van het uur en
      van de lampen komt erbovenop, zonder richting. Het zicht en de getuigen (`T.zichtOp`) blijven zoals ze zijn: dit is
      alleen beeld.
    - **Zonder videokaart** (de spelregel "Tekenen" op "Zonder"): zie vraag B.
    - **Laten zien:** `npm run schermen -- --tekenen met` (WebGL op de processor) met vier nieuwe schermen: de dageraad,
      de middag, de zonsondergang en de nacht bij de herberg met de lantaarns. Ik beoordeel op uitsneden, en Marcel krijgt
      ze naast het oude beeld. De maat van vraag 123, C (2D en WebGL 's avonds tot 8 op 255) geldt dan alleen als 2D
      dezelfde lichtkaart krijgt; anders vergelijkt de proef alleen overdag. En `npm run tekenmeting` 's avonds, voor en
      na, zodat we weten wat het kost.
    - **Hoe groot:** een sessie.
    Vragen: **A**, dit plan, met de kleuren in de werkbank? **B**, het 2D-tekenen erbij: zo dicht mogelijk bij hetzelfde
    (dezelfde lichtkaart, klein getekend op een eigen doek en er met 'multiply' overheen; dan oogt het bijna gelijk, maar
    de avond kost in 2D wat meer tijd, en het "lichter dan overdag" valt weg), of bewust eenvoudiger (de nacht zoals nu,
    alleen getint met de kleur van het uur, zonder plassen)? Voorstel: zo dicht mogelijk, want wie zonder videokaart speelt,
    ziet anders een ander spel, en de proef met de schermen blijft dan ook 's avonds vergelijken. **C**, de lantaarn van de
    schout alleen als beeld, of ook in het spel (met een lantaarn zien ze je 's nachts van verder, en sluipen, `S`, dooft
    hem)? Voorstel: nu alleen beeld; het spel-deel gaat naar `opmerkingen.md`, want het is een nieuw idee (functie creep).
    **Marcel koos (4 okt): "A ja", B: "zonder videokaart wordt er bijna niet meer gespeeld...", C: "ook spel. Voegt leuke
    elementen toe".** Dus: het plan zoals het hier staat; zonder videokaart bewust eenvoudiger (de nacht zoals hij was,
    met de lantaarn van de schout als gloed erbij), en de proef met de schermen vergelijkt 2D en WebGL dan alleen overdag;
    en de lantaarn van de schout is ook spel: 's avonds en 's nachts buiten brandt hij, en dan zien ze je van verder (je
    staat in je eigen licht, `bijLicht`), en sluipen (`S`) dooft hem: dan ben je in het donker, en zie je zelf ook minder.
    Een spelregel ("De lantaarn van de schout": ook spel, of alleen beeld), zoals alles met meer dan één goed antwoord.
    **A is gebouwd (4 okt, op de branch `claude/licht-videokaart`).** Met de videokaart is de nacht een lichtkaart op de
    halve maat van het doek (`js/gl.js`, `tekenLichtkaart`): de kleur van het uur (`T.lichtKleurVan` in `js/dag.js`, de
    vier kleuren en `kleurUren` in de werkbank onder "De dag") en per lamp een warme plas die flakkert (`lichtenInBeeld`
    en `T.LICHT_INSTELLINGEN` in `js/tekenen.js`, in de werkbank onder "Het licht": de kracht, de maat van een plas, de
    kleur per soort lamp, het flakkeren). De wereld wordt ermee vermenigvuldigd, tot twee keer zo licht; een gat voor een
    brandend raam blijft een gat. Op de kaart zijn het drie opdrachten, hoeveel lampen er ook branden. Zonder videokaart
    is de nacht zoals hij was, met de lantaarn van de schout als gloed erbij. De lantaarn van de schout is ook spel
    (`T.draagtLantaarn` in `js/zien.js`, `lantaarn` in `T.ZIEN_INSTELLINGEN`): buiten in het donker brandt hij, dan zien ze
    je van zes tegels, en sluipen dooft hem; de spelregel "De lantaarn van de schout". Sluip je zonder lantaarn, dan geeft
    het beeld nog een zwak licht om je heen (`ogen`), zodat je ziet waar je loopt.
    Gevonden onderweg: zette een proef WebGL op de processor pas aan nadat het spel geladen was (`npm run schermen --
    --tekenen met`), dan bleef het 2D: het spel had al besloten dat er geen videokaart was. Nu probeert het dan opnieuw.
    De schermafdrukken van vraag 123 met `--tekenen met` tekenden dus ook met 2D. Nu WebGL er echt in zit, verschilt
    overdag 22% van de pixels 1 of 2 op 255 (afronding van doorzichtigheid), en echt anders hooguit 0,04% (dichtbij, land 5
    van de maker) en 0,22% op 0,5. Het echt andere valt binnen de maat van vraag 123 (C en E), maar de afronding niet: C
    stond hooguit 0,1% van de pixels toe, ook voor 1 of 2 op 255. Zien doe je het niet. Vraag **D** (aan Marcel): telt
    afronding tot 2 op 255 voortaan niet mee in de maat? Voorstel: ja; wat telt, is wat echt anders is.
    **Marcel (4 okt): "D ja".** Afronding tot 2 op 255 telt niet mee in de maat van vraag 123, C; wat telt, is wat echt
    anders is (`npm run schermen` telt het al apart).
    **Het weer** (Marcel vroeg: "Hoort het weer hier ook bij?"). Het weer als spel is vraag 82, c (regen bij het zaaien,
    droogte in de zomer, als status), na de wensen. Het beeld ervan past op de lichtkaart: een grijze of juist felle kleur
    die met de kleur van het uur wordt vermenigvuldigd, mist als waas over de verte, regen en sneeuw als strepen en vlokjes
    erbovenop (sneeuw op de grond en de daken vraagt nieuwe kunst). Voorstel van Claude: het beeld van het weer bouwen
    samen met de regels ervan, niet los. **Marcel koos (4 okt): "A"**: zo, bij vraag 82, c. De plek waar het weer zijn
    kleur inzet, is `tekenNacht` in `js/tekenen.js`: de kleur van het uur maal die van het weer, vóór de lichtkaart.
    **En: "B graag, C mag later".** De proefplaat van B (schaduwen met de zon) komt nu; die van C (licht op de muren)
    later.
    **Plan voor de proefplaat van B (4 okt), Marcel: "A ja, B zoals je voorstelt, C ja".** Elk ding in de tekenlijst
    werpt zijn silhouet scheef over de grond, met de zon mee; beginnen met de figuren en de bomen, en de sessie van de huizen
    vragen om de schakelaar voor de ingebakken vloerschaduw (gevraagd op 4 okt); een huis klopt ongeveer, en dat is goed
    genoeg voor de proef.
    **De proefplaat is gebouwd (4 okt).** De spelregel "Schaduwen" op "Met de zon" (standaard "Ingebakken"; alleen met de
    videokaart): `T.zonStand` in `js/dag.js` zegt de richting en de lengte (de zon op de middag 50 graden hoog, een schaduw
    hooguit 2,5 keer zo lang als wat hem werpt), `tekenZonneschaduw` in `js/tekenen.js` tekent de tekenlijst nog een keer
    als silhouet, en `js/gl.js` legt alle silhouetten op een masker en dat in één keer over de grond (`beginSchaduw`,
    `eindSchaduw`), zodat twee schaduwen over elkaar niet donkerder worden. **De richting past bij de plaatjes:** op de
    middag valt hij kort naar rechtsonder, net als de schaduw die erin gebakken is (licht van linksboven); 's ochtends
    lang naar rechtsboven, 's avonds lang naar linksonder. Het graan op de akkers werpt geen schaduw. Wat nog ontbreekt:
    de huizen en de bomen hebben hun ingebakken schaduw er nog bij (de schakelaar van de bouwer), en een schaduw valt
    alleen op de grond, niet op een muur erachter.
    Vragen: **A**, zo verder (de schakelaar, dan de huizen opnieuw door de bouwer), of niet? **B**, de lengte en de
    donkerte (in de werkbank, "Het licht" en "De dag")?
    **Marcel (4 okt): "A ja, B goed zo".** Dus verder: de bouwer krijgt een schakelaar voor de ingebakken vloerschaduw
    (de huizen in `huis-sdf.cjs`, en de bomen in `bomen.cjs`: allebei in `gereedschap/pixelart/`, het werk van de sessie
    van de huizen), dan gaan de huizen en de bomen zonder vloerschaduw opnieuw door de bouwer, en dan staat de spelregel
    "Schaduwen" standaard op "Met de zon". De lengte en de donkerte blijven zoals ze zijn.
    **Bij het nakijken bleek (4 okt): er is geen ingebakken schaduw in het spel.** De plaatjes van de huizen, de gebouwen
    en de bomen in `tegels/` hebben geen schaduw op de grond (de bouwer snijdt ze zonder: `huizen.cjs`, "zonder gras en
    zonder schaduw op de grond"; de bomen gaan los door de renderer, zonder slagschaduw). Alleen onder een figuur tekent
    het spel een ovaaltje (`tekenWezen`). De dubbele schaduw die Claude op de proefplaat meldde, was er dus niet, en de
    bouwer hoeft niets los te zetten. De spelregel "Schaduwen" staat nu standaard op "Met de zon" (met de videokaart);
    "Zonder" is het spel van vóór 4 okt. Het verzoek aan de sessie van de huizen om een schakelaar vervalt.
    `npm run schermen` heeft drie beelden erbij: de dageraad, de zonsondergang en het plein 's avonds vóór bedtijd (om
    20.8 uur slaapt het dorp al, en zijn de lantaarns uit). Hoe snel de lichtkaart is, zien we alleen op een echte
    videokaart (hier tekent WebGL op de processor).
    **Wat Marcel kan proberen:** een nieuw spel, en tegen de avond (`Spel.debug.uur(19)`) naar het plein: de lantaarn bij
    de put, de ramen, de herberg. Druk `S` en kijk hoe je lantaarn uitgaat. Bij zonsopgang en zonsondergang kleurt het
    dorp. De kleuren en de kracht staan in de werkbank (`O`), onder "De dag" en "Het licht".
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
      Begonnen op 26 sep (zevende sessie): de doorkijk staat nu in `js/doorkijk.js`, en `tekenen.js`
      heeft 1.404 regels.
    - **E. Eén laadlijst voor de toetsen (af, 27 sep, tiende sessie; zie onder Af),** in de volgorde van
      `index.html`. Dan zijn de bewakers van de vorm `T.x && T.x(...)` niet meer nodig, en toetsen de
      toetsen het spel zoals het draait. B liet zien waarom: vijf toetsen laadden `js/dag.js` niet, en
      draaiden dus zonder werkuren en zonder bezoekuur, zonder dat iets klaagde.
    Voorstel: A en B nu, zolang de dag vers is; C en D als die bestanden toch open moeten (de
    poppetjes raken ze allebei); E later.

*De volgorde* (26 sep; de volgorde van het werk staat bovenaan, in de stand):
26. Klopt de volgorde na de poppetjes? Voorstel van Claude, met twee verschuivingen tegenover het plan
    in `spel.md`: de herberg vóór het zichtveld, want in de herberg vertelt een getuige straks door wat
    hij zag, en dan komt dat er meteen bij; en de kern (verstoppen, de inner) vóór het bouwen, want
    bouwen is het grootste werk, en of de kern leuk is (de vraag van het tweede proefje), wil je weten
    vóór je veel bouwt.

*Spelen, en zeggen hoe het voelt:*
- **Het praatje** (4 okt, zevenentwintigste sessie; vraag 120). Begin een nieuw spel en kijk overdag op het plein (de
  kinderen en de ouden komen elkaar daar tegen) en bij de put 's ochtends: wie toevallig een buur treft, blijft soms
  staan, en boven wie praat staat om de beurt een wolkje. `Spel.debug.praatjes()` zegt wie waar staat te praten en tot
  hoe laat; `('nu')` laat er nu een beginnen. Voelt het als toeval? De getallen (de kans, hoe lang, de rust) staan in de
  werkbank (`O`), onder "De praatjes"; uit kan ook.
- **De feesten** (3 okt, vijfentwintigste sessie; vraag 97). Begin een nieuw spel en speel tot 30 grasmaand (op 10× een
  paar minuten): de jongeren komen vragen of de meiboom mag. Zeg "Zet hem maar op" en kijk de dag erna op het plein,
  overdag en 's avonds. Sneller: `Spel.debug.feest('meiboom')` laat hem nu beginnen, en `Spel.debug.uur(20)` zet de
  avond. Het oogstfeest komt na de oogst (`Spel.debug.voorval('oogstfeest')`). Is een hele dag vrij te duur, of juist
  goed? Is de meiboom groot genoeg, en moet hij blijven staan? En kies je bij het oogstfeest weleens "Een klein feest"?
- **De herberg** (27 sep, negende sessie; stuk 1 en 2). Loop naar de hoek tussen het plein en de weg, en
  blijf er tot de avond (`Spel.debug.uur(17)`): wie gaat erheen, en brandt de lantaarn? Zijn twee à drie
  gasten per avond genoeg, en is de herberg herkenbaar zonder uithangbord? Praat de volgende ochtend met
  de herbergierster: weet ze wie er zat? Verstop iets bij de roddelaar en kijk wanneer zij het weet.
  `Spel.debug.herberg()` zegt wie er vanavond gaat, `Spel.debug.marskramer()` laat de marskramer komen
  (hij logeert er). De getallen staan in de spelregels (`O`), onder "De herberg".
- **De nieuwe huizen** (26 sep, achtste sessie; ronde 4b). Op de beelden beantwoord (Marcel, 27 sep):
  de boerderijen van Gerrit en Trijn mogen met hun achterkant naar je toe staan ("geeft het wat meer
  leven"), en de ladder is goed zo. Nog te spelen: bouw een hut en een huis (`B`) en kijk hoe ze in vijf
  fases oprijzen.
- **De doorkijk** (26 sep, zevende sessie): loop achter een huis langs, bijvoorbeeld achter de
  boerderij aan de oostkant van het plein, en kies in de spelregels (`O`) bij "Door een huis heen
  kijken" het kijkvenster of het raster. **Wat je kiest, wordt de standaard** (vraag 31). Vóór het plein
  staat nog geen huis; bouw er een (`B`) om ook de tweede keuze te zien, "Wie je door een huis heen
  ziet".
- Het gehucht rond het plein (26 sep, zesde sessie): loop over het plein en om de huizen, kijk bij de
  brug, de heide en de weide, en probeer met `B` iets op het plein te bouwen. Voelt het plein als het
  hart? Staan de vijf eiken te dicht, of zijn ze goed zo?
- Het gehucht na de namen (26 sep): Marcel zou het na 7e nog eens openen. Het hernoemen veranderde
  niets aan hoe het speelt, dus alles hoort te zijn zoals je het kende.
- Het nieuwe begin: open `localhost:8123/` en lees de benoemingsbrief. Klopt de toon van de heer? Een
  gevecht probeer je op `localhost:8123/?kaart=proef`: klik op de slijmkruiper.
- Een heel jaar: hoe snel het gaat, de winter, en Sint-Maarten (is de honger te veel of te weinig;
  mag de heer harder, of juist zachter?).
- **De inner bespelen** (27 sep, negende sessie; punt 4, stuk 2). Laat hem komen (`Spel.debug.uur(9)`,
  dan `Spel.debug.inner()`, of wacht tot oogstmaand), klik hem aan en praat: vraag hoe het op het kasteel
  gaat, en kijk op de klok hoeveel van zijn dag dat kost. Geef hem een geschenk en kijk bij zijn vertrek
  wat er in zijn rapport staat. Voelt meelopen goed, nu hij tot zonsondergang blijft? Is de helft minder
  voor 25 goud te goedkoop, en een op de vijf kans dat de heer het hoort te weinig? `Spel.debug.inner()`
  zegt tot hoe laat hij blijft en wat je hem gaf; de getallen staan in de spelregels (`O`), onder "De
  inner".
- De winter van het vee: `Spel.debug.slachten()` opent het slachtvenster, en in het veldenvenster
  (`V`) staan de mest en wat het hooi van volgend jaar de winter door helpt.
- Verstoppen: klik een boerderij. `Spel.debug.verstopt()` zegt wat er waar ligt,
  `Spel.debug.verstopt('boer1', 30, 5)` zet iets weg zonder te lopen, en `Spel.debug.zoeken()` laat
  de soldaten nu zoeken.

*Lezen:*
- **De speeltest van 28 sep** (twaalfde sessie): vier spelers, twaalf jaren, op de pagina "Een jaar in het
  gehucht" (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr) en in `speelbaar.md`; wat nu bij te stellen is,
  in vraag 46.
- De speeltest van een jaar en het voorstel voor een eerste speelbare versie (27 sep, tiende sessie), op
  de pagina "Een jaar in het gehucht" (https://claude.ai/artifact/WVebn7ycRcPLNuJrtzvQbr) en in
  `speelbaar.md`: vier vragen, 33a tot en met 33d. En de namen in `verpakken.md` (vraag 8).
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
    een kar, die stenen brengt (`spel.md`, "Handel"), en een tapperij of kroeg naast de herberg
    (Marcel, 27 sep).
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
4. **In gebruik** (4a af, 22 sep; 4b af, 26 sep, achtste sessie: de huizen staan op een eigen vel,
   `tegels/huizen.png`, zie onder Af). Klaar als de nieuwe huizen in `gebouwen.tsx` staan met de goede
   voet en het goede anker, achteraan in de volgorde, en het dorp ermee getekend kan worden. Wat ronde
   3 hiervoor opschreef:
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

- 5 okt 2026 — **De andere drie bouwstijlen: oker, planken en roze** (tweede sessie naast de draaibare huizen; vraag 114,
  stap 2b; Marcel: "A ja B ja C delen D stap 3 E tuurlijk", en na de proefplaten "1 ja 2 is goed zo"). Elke stijl eigen
  huizen en boerderijen met een uitbouw als kenmerk (oker de zolders, planken de galerij en de buitentrap, roze twee
  lagen en een erker), de plankenstijl helemaal van hout; oker en roze nemen de hutten van wit. 300 huizen met hun
  bouwfasen; wie doorgroeit, krijgt de stijl van zijn dorp. Wit en de oude huizen byte voor byte dezelfde, `npm test`
  946/946, 21 van 23 schermafdrukken gelijk (alleen land 5, nu planken), de speeltest op vier landen van de maker zonder
  fouten. Op `claude/bouwstijlen-2b`, nog niet in `main`. Zie vraag 114, stap 2b, en `beeld.md`.
- 5 okt 2026 — **Ontginnen op de heide** (drieëndertigste sessie; vraag 107, stap 1; Marcel: "1 en 3, 107 a b c d e ja").
  Komt het dorp graan tekort (`T.graanTekort`: er komt geen gezin om het graan, of het eten haalt de winter niet), dan
  vraagt een boer of zijn grote zoon je om dertig tegels heide (een voorval `ontginverzoek`, vóór de bouwverzoeken; de
  plek in goud op de grond). De boer met een akker het dichtst bij de heide vraagt het, en hij kiest het stuk zo dicht bij
  zijn akker als het kan (`T.ontginPlekVoor`), want de heide ligt apart. Ja (`T.ontginToegestaan`) maakt er een veld van
  zijn boerderij van en kost vertrouwen, elk stuk 5 meer: 5, 10, 15 (`T.ontginVertrouwen`; vraag 107, f3, Marcel: "We
  gaan met jouw suggestie"); een maand steekt hij plaggen met de schoffel (`ontginnen` in
  `js/veldwerk.js`; een halve plag maakt hij na de schaft of de volgende dag af), en in lentemaand wordt het gezaaid, of
  meteen als het klaar is terwijl de boeren nazaaien (`T.isNazaaitijd`). De schapen grazen er niet meer en houden
  altijd wat ze nodig hebben (`js/vee.js`). Na elk verzoek dertig dagen geen nieuw. Ben je weg, dan zegt de raadsman ja
  op het eerste stuk, en nee op een volgend. De spelregel "Ontginnen", `T.ONTGINNEN_INSTELLINGEN`,
  `Spel.debug.ontginnen()`, en `test/ontginnen.test.cjs` (zeven
  toetsen). Het stuk houdt de paadjes van de deuren vrij. De speeltest op drie landen van de maker liep zonder fouten,
  met een derde tot ruim de helft meer oogst in het tweede jaar (`speelbaar.md`). `npm test` 944/944. Zie `spel.md`,
  "Ontginnen", en vraag 107 (f: het tempo is open).
- 5 okt 2026 — **De boeren aan het werk** (drieëndertigste sessie; vraag 111, stap 1 en 2; Marcel: "A. Ja prima B ja graag
  C doe maar", en "a ja b ja c nu"). Overdag werkt een boer op zijn eigen land (`js/veldwerk.js`, `T.werkVeldwerkBij`):
  zolang het graan moet kiemen zaait hij rij voor rij, daarna wiedt hij met rustpozen, in de herfst rijdt hij mest uit
  en spit hij, en in de winter raapt hij hout aan de rand van een echt stuk bos (minstens vier bomen, de bomen achter hem,
  geen gebouw ervoor) en brengt een bundel naar huis; de schaft houdt hij op de akker. Zijn boerin en grote kinderen
  blijven bij hem bij het zaaien en de oogst (`T.helpAnker`). Wie werkt, dwaalt niet, praat niet en gaat niet opzij. De
  regels veranderen niet. De werkfiguren kwamen van twee agents, uit code zoals de maaier: de zaaier, de wieder en de
  sprokkelaar met staan, lopen en hun werk, en daarna de zaaister, de wiedster, de sprokkelaarster en de maaister, met
  het rapen door de knieën, een schoffel met een blad en een hand met vingers (`gereedschap/pixelart/werkfiguren.cjs`);
  `js/sprites.js` kiest het vel van het werk, en voor een boerin dat van een vrouw. `Spel.debug.veldwerk()`. De speeltest
  op drie landen van de maker liep zonder fouten (`speelbaar.md`). `npm test` 937/937. Zie `spel.md`, "De boeren aan het
  werk", en `beeld.md`, "De werkfiguren".
- 5 okt 2026 — **De militie die onderweg is, vecht mee** (drieëndertigste sessie; `0c`, punt 4; Marcel: "C doe maar"). Een
  wachter die bij het begin van een gevecht verder dan twaalf tegels van de schout stond, deed het hele gevecht niet
  mee, en in de speeltest viel een schout zo alleen tegen drie rovers. Nu rent hij elke ronde zo ver als zijn punten
  reiken, en vecht hij mee vanaf de ronde dat hij er is (`T.militieKomtErbij` in `js/rovers.js`), met een bericht.
- 4 okt 2026 — **De draaibare huizen, en G** (tweeëndertigste sessie; vraag 124, B, en vraag 114, G; Marcel: "A ja ... B
  ja C ja", "ja start maar", "G ja"). De tekenaar draait de camera, de zon en het randlicht een kwartslag om de wereld
  (`tekenWereld` met `o.draai`), de bouwer vult met `rondom` elke muur in (de deur voor, zichtbaar van zuid en van
  oost; de uitbouwen voor en rechts; elke muur zijn eigen lot), de standen van een stijl zijn de draai van één huis, en
  de bouwfasen hebben de steiger rondom. Wit is opnieuw gerenderd, nu met alle bouwfasen (108 tekeningen); een schoor
  staat rondom binnen één tegel en telt mee in de voet. Een huis dat doorgroeit, rijst op in de laatste drie bouwfasen
  terwijl zijn mensen erin blijven wonen (alleen het beeld). De oude huizen en het ontworpen gehucht bleven pixel voor
  pixel dezelfde (21 van 23 schermen gelijk, alleen land 5 anders); de speeltest op drie landen van de maker liep
  zonder fouten. `npm test` 928/928. Zie `beeld.md`, "De draaibare huizen", en `speelbaar.md`.
- 4 okt 2026 — **Elk land van de maker bouwt in een bouwstijl: wit** (eenendertigste sessie; vraag 114, stap 2a; Marcel:
  "A ja B ja C ik wil overal bouwfase voor ... D ja E ja", en "H1 is oke"). De huizenbouwer kreeg de bouwstijlen
  (`STIJLEN` in `huizen.cjs`): wit vakwerk, groene luiken, veldsteen en riet, met hut 1, 3 en 4, huis 1, 3 en 6 (en hun
  stenen broertjes) en boerderij 1 en 4, elk in vier standen en onder elk dak van de treden: 108 tekeningen, met hun
  `stijl` in `tegels.js` (`tegels/huizen/` van 1,5 naar 6,9 MB, `tegels.js` van 245 naar 534 kB). De voordeur zit op de
  lange muur van de hoofdvleugel (`deurOp`), zodat elke stand een andere kant op kijkt; de proefplaat is
  `huis-sdf-export.cjs stijl wit`. In het spel (`js/bouwstijl.js`): de maker geeft een land zijn stijl (`w.stijl`), een
  huis krijgt het dak van de trede waarin het gebouwd wordt of doorgroeit, een stenen huis baksteen pas met een
  steenbakkerij, op een erf kijkt de deur naar de weg met het huis achteraan, een verzoek keert zijn deur naar de weg,
  en de maker zet de huizen ook vóór het plein met hun deur ernaartoe. Het ontworpen gehucht en eerder bewaarde spellen
  spelen zoals altijd; de 23 oude huizen zijn byte voor byte dezelfde gebleven. Voorlopig gespiegeld en zonder
  bouwfasen: de draaibare huizen vervangen ze (vraag 124, B). Onderweg: een controle vooraf of alles op het vel past
  (`nodigeCapaciteit`), en `bouwfasen.cjs --erbij`. Nagespeeld (`speelbaar.md`): de bouwer twee jaar op drie landen
  van de maker, zonder fouten, met een dorp en marktrecht in het eerste jaar en zeven à acht stenen huizen van veldsteen.
- 4 okt 2026 — **De toets die soms faalde, speelt een vaste dag** (eenendertigste sessie; vraag 114, E; Marcel: "E
  ja"). "In het gehucht is iedereen 's nachts binnen, overdag waar hij hoort, en 's avonds thuis"
  (`test/bewoners.test.cjs`) faalde ongezaaid in 7 van de 200 dagen, en het was steeds een paar dat om elf uur een
  praatje maakte (vraag 120): wie vrij is, blijft onderweg staan voor een bekende en loopt daarna terug. Geen fout in
  het spel, dus: wie praat of net praatte (`e.praatRust`), is waar hij hoort, en de toets heeft een vast zaad, zoals
  dertien andere toetsbestanden. Met de uitzondering alleen slaagde hij in 398 van de 400 dagen. De sessie van het licht
  vond hem ook (op `main` 2 van de 30 keer); na het samenvoegen met `main` 20 van de 20 keer groen.
- 4 okt 2026 — **De figuren laden als hun wezen op de kaart staat** (dertigste sessie; vraag 114, stap 1b; Marcel: "C
  meteen erna"). Alle 122 figuurvellen laadden bij het begin (124 MB), ook de monsters van het oude spel, de soldaten,
  de heer en de inner. Nu laadt een figuur met al zijn houdingen pas als zijn wezen op de kaart staat
  (`T.sprites.laadWatErStaat`, ook als er iemand bij komt of weggaat; wie maait, krijgt de maaier erbij); wie van figuur
  wisselt, houdt zijn oude beeld tot het nieuwe er is, en wie net komt, staat er pas als zijn figuur er is
  (`T.sprites.laadtWezen`, in `tekenWezen`). Gemeten: bij het begin 81 MB aan plaatjes in plaats van 153 (en 197 bij
  het begin van de sessie); de twintig vaste schermafdrukken byte voor byte dezelfde als na stap 1; een nieuw spel via
  het menu met de marskramer en drie rovers zonder fouten. `npm test` 908/908.
- 4 okt 2026 — **Een vel per tekening: de huizen en de gebouwen laden wat er staat** (dertigste sessie; vraag 114,
  stap 1; Marcel: "A ja B ja C meteen erna"). Elke tekening van de huizen en de gebouwen is een eigen bestand
  (`tegels/huizen/`, `tegels/gebouwen/`; `npm run tiled`, `snijLos` in `inpakken.cjs`), en het spel laadt er een pas als
  hij op de kaart staat (`T.sprites.laadWatErStaat`, vanuit `js/tekenen.js` bij een andere kaart of als `T.kaartVersie`
  verandert); tot dan tekent hij niets, en een huis dat doorgroeit, houdt zijn oude plaatje tot het nieuwe er is
  (`T.sprites.wachtOp`). Erbij: `Spel.debug.vellen()` (wat de browser aan plaatjes vasthoudt) en `npm run schermen`
  (twintig vaste schermafdrukken, byte voor byte te vergelijken; de proef van 2a was niet bewaard). Gemeten: bij het
  begin 153 MB aan plaatjes in plaats van 197, met twee bouwplaatsen 162 in plaats van 204, Chromium zo'n 540 MB in
  plaats van 580; het eerste beeld na het uitzoomen ongeveer gelijk. Nagekeken: alle 50 tekeningen pixel voor pixel
  dezelfde rond hetzelfde anker, 19 van de 20 schermafdrukken byte voor byte (op 0,35 kiest het verkleinen in 232
  pixels de buurpixel, bij dezelfde tekenopdrachten), een doorgroeiend huis in de browser, en de wereldbouwer. Zeven
  nieuwe toetsen (`test/vellen.test.cjs`, `test/inpakken.test.cjs`); `npm test` 907/907. Gezien, niet gerepareerd
  (`opmerkingen.md`): de wereldbouwer tekent op ware grootte geen huizen, al van voor deze stap.
- 4 okt 2026 — **De proefplaten van de huizen** (negenentwintigste sessie; vraag 114, 2b en 2c; Marcel: "1 ja 2 ja 3
  allebei 4 allebei 5 ja", en bij de eerste torens "Torens zijn wel wat grijzig"). De huizenbouwer
  (`gereedschap/pixelart/huis-sdf.cjs`) kreeg kalk in wit, oker en zacht roze, baksteen en zandsteen (Marcel: "Torens
  zijn wel wat grijzig", en "Dit was eigenlijk natuurstenen blokken"), torens met een steil dak
  (zadeldak, tentdak, naaldspits met een kraag) met lood, een bol en een vaan, de ramen van een woontoren en een kapel
  (galmgaten, spitsbogen met glas in lood), een uithangbord, en gebouwen uit meer delen (`samen`: de kapel met haar
  toren, de herberg met zijn stal). Drie platen: `node huis-sdf-export.cjs afwisseling`, `verhouding` en `steen`. Nagekeken: zes
  huizen van het spel en de wachttoren zijn pixel voor pixel hetzelfde gebleven. Wacht op Marcels keuze (vraag 114,
  "Nu aan Marcel"); `beeld.md`, "De afwisseling en de grote gebouwen".
- 4 okt 2026 — **De vellen ingepakt** (achtentwintigste sessie; vraag 114, 2a; Marcel: "1 ja 2 alleen nog de grond";
  `gereedschap/pixelart/inpakken.cjs`). Gemeten: de browser hield bij het begin bijna 900 MB aan vellen vast, waarvan de
  bouwfasen 271 MB (8303 pixels hoog), de gebouwen 157 MB (69 van de 96 vakken leeg) en de figuren 362 MB. Nu: elk vel
  met voorwerpen (bomen, begroeiing, gebouwen, erf, tuin, huizen) heeft elke tekening strak gesneden, met per tegel een
  eigen `cel` en `anker` in `tegels.js` (`T.sprites.celVan`; de grond blijft een raster, want Tiled schildert ermee, en
  in Tiled is zo'n vel een verzameling met een rechthoek per tegel); de bouwfasen hebben per gebouw een eigen vel in
  `tegels/bouwfasen/`, dat het spel pas laadt als er een in aanbouw staat; en de cel van een figuur krimpt tot wat erin
  staat (362 → 124 MB). `npm run tiled`, `bouwfasen.cjs` en `naar-spel.cjs` doen het voortaan zelf. Nagekeken: alle
  6.934 tekeningen (elke tegel, elke bouwfase, elk beeld van elke figuur) pixel voor pixel gelijk rond hetzelfde anker,
  en elf vaste schermafdrukken van het spel (het gehucht, het plein, het overzicht, een bouwplaats in vijf fases, het vee,
  de herberg 's avonds, een land van de maker) byte voor byte gelijk, op de twee verste overzichten na (op 0,35 kiest
  het verkleinen in 0,6% van de pixels de buurpixel). De render van de gebouwen, de huizen en de bouwfasen bleek
  byte voor byte te herhalen, dus de vellen zijn door de nieuwe stappen zelf gemaakt (de bouwfasen omgezet uit het oude
  vel, met dezelfde code). Gemeten in Chromium zonder videokaart: het geheugen in het overzicht van zo'n 1.000 naar 730
  MB (met een bouwplaats erbij van 1.130 naar 745), het langste beeld bij het eerste keer uitzoomen van 290 naar 165 ms,
  en in het overzicht 50 beelden per seconde in plaats van 38. De kaarten in Tiled kregen objecten op de maat van hun
  tegel. Vijf nieuwe toetsen (`test/inpakken.test.cjs`); `npm test` 900/900.
- 4 okt 2026 — **Een bewaard spel laden in een verse bladzijde** (zevenentwintigste sessie; Marcel: "1 ja"). Een gebouw
  meldt zijn soort aan als het neergezet wordt, en een kaart bij het laden; een verse bladzijde die een bewaard spel
  laadt, deed geen van beide, en viel om zodra iets vroeg of zo'n tegel vaststaat ("reading 'blokkeert'"). Nu meldt het
  laden de soorten aan van wat er op de kaarten ligt (`T.zetSpel` in `js/opslaan.js`, met `T.kenSoortVan` in
  `js/kaart.js`), zoals ze erbij kwamen. Een nieuwe toets doet een verse bladzijde na (een huis op een land van de
  maker, geladen in een nieuw spel op het ontworpen gehucht), en faalt zonder de reparatie; de proef met opslaan
  (`npm run speeltest -- lui60 --zaad 1 --opslaan`) speelt weer precies hetzelfde jaar. `npm test` 895/895.
- 4 okt 2026 — **Een praatje: wie vrij is en toevallig een buur of iemand van zijn werk treft, blijft soms staan**
  (zevenentwintigste sessie; vraag 120, a en b; Marcel: "Het dorp moet echt levendig en realistisch aanvoelen", en "geen
  praatjes forceren. Alleen als mensen een reden hebben en elkaar toevallig tegenkomen"; `js/praatje.js`). Wie vrij is
  ('s ochtends, in de schaft, 's avonds, en overdag wie geen werk heeft) en een bekende uit een ander huis treft, blijft
  soms staan: bij een stap van het dwalen, en onderweg in plaats van uit te wijken. De een loopt tot naast de ander,
  liefst links of rechts op het scherm, en ze kijken naar elkaar; wie langskomt, schuift aan, tot vier. Een kwartier tot
  een uur, dan een uur niet weer. Boven wie praat staat om de beurt een leeg wolkje met drie puntjes. Wie langs wil,
  loopt om een praatje heen. Niemand gaat ergens heen om te praten (het avondplein, c, ging er dezelfde dag weer uit).
  De regels van het spel veranderen niet, en het kost geen meetbare snelheid. De spelregel "Praatjes",
  `Spel.debug.praatjes()`. Dertien nieuwe toetsen (`test/praatje.test.cjs`). Onderweg gevonden: het laden van een
  bewaard spel in een verse bladzijde is stuk, al op `main` (`opmerkingen.md`).
- 4 okt 2026 — **Lopen tussen anderen: een weg om wat vaststaat, en onderweg wachten, langs elkaar of opzij** (zesentwintigste
  sessie; vraag 119, D en A; Marcel: "Je kunt nu eenmaal niet over iemand heen", en "eerst, voor de huizen";
  `js/lopen.js`). Een weg gaat alleen om huizen, bomen en water (`T.zoekRoute`), en de kaart onthoudt hem; wie onderweg
  iemand op zijn volgende tegel treft, lost het daar op (`T.ontwijk`): langs elkaar schuiven, even wachten, de ander
  opzij of van plaats ruilen, of een korte omweg. Waar velen heen gaan (hun deur, hun werk, de put, de herberg), komt
  de weg uit een veld. Een beeld bij 200 mensen op een gemaakt land is 44% sneller (3,9 → 2,2 ms), bij 400 26%; het
  zoeken van een weg ging van de helft van een beeld naar 16%. De bouwer speelt zoals ervoor (`speelbaar.md`).
  `Spel.debug.lopen()` zegt wie op wie wacht. Twaalf nieuwe toetsen (`test/lopen.test.cjs`); `npm run grootte` telt nu
  ook de velden.
- 4 okt 2026 — **Vraag 112, stap 1: elk spel een ander, wijder land, met natuur die ertoe doet** (zesentwintigste sessie;
  Marcel: "ja die zijn goed. volgorde is oke"; `js/maker.js`). Het land van de maker is 100 bij 100, en de standaard: bij
  Nieuw spel staat het nummer van het land onder de naam van je dorp, met een knop Ander land; wie een nummer typt,
  speelt precies dat land opnieuw. Huizen staan verder uit elkaar (het looppad, en achter zich hun dak), boerderijen
  verder naar buiten. Een bosrand met inhammen en open plekken, bosjes, losse bomen en struiken in de wei, een of twee
  vijvers, een of twee rotspartijen, en varens, paddenstoelen, stronken, graspollen, bloemen en riet. Een houthakker
  hoort bij het bos, een steengroeve bij de rotsen, een visser en een rietsnijder aan het water; het ontworpen gehucht
  kreeg een rotspartij. De bouwer van de speeltest haalt op drie gemaakte landen de twee jaar (`speelbaar.md`). De toetsen en de speeltest spelen nog op het ontworpen gehucht (de speeltest met
  `--maker` op gemaakte landen). Vijf nieuwe toetsen (`test/natuur.test.cjs`).
- 4 okt 2026 — **Het bos om de kaart alleen aan de kant van het bos** (zesentwintigste sessie; Marcel: "Ik denk dat we
  het niet moeten afbakenen met die bomen vierkant er omheen. Alleen aan de kant van het bos"; `js/tekenen.js`). Het bos
  buiten de kaart volgt het bos erbinnen; aan een open kant loopt het land door en vervaagt het in het donker. De rand
  van de kaart vervaagt alleen nog naar een kant met bos.
- 4 okt 2026 — **Vraag 113, verder: een weg zoeken 2,8 keer zo snel, en een bewaard spel half zo groot**
  (zesentwintigste sessie). Zie vraag 113. `npm test` 868/868.
- 3 okt 2026 — **Vraag 113: sneller** (vijfentwintigste sessie; Marcel: "Als de performance slecht is, hebben we
  niks"). Het overzicht bewaart de grond op de maat van het scherm en het bos om de kaart heen in een buffer (van 13 naar
  34 beelden per seconde, zonder videokaart). Tijdens het zoeken van een pad of een plek staat iedereen stil
  (`T.iedereenStil`), de deuren worden bewaard, een put of kapel telt eerst wat hij bereikt (`T.kringTeller`), en hooguit
  acht mensen per beeld zoeken een weg: bij 100 mensen van 1,5 naar 0,64 ms per beeld, de nacht van 15 naar 10 ms; bij
  200 mensen van 9,1 naar 2,1 ms, de nacht van 210 ms naar 25 ms. Op 30× om de drie dagen vanzelf opslaan. De meter
  onder `F2`. `npm test` 863/863.
- 3 okt 2026 — **Vraag 108, b en d: paadjes, lantaarns en ramen die 's avonds branden** (vijfentwintigste sessie; Marcel:
  "108 a tab, b c d e ja"; `js/paden.js`). Van elke deur loopt een paadje naar de weg, of naar het paadje van een buur,
  recht en met een hoek; een nieuw gebouw heeft het meteen, en het loopt om een later gebouw heen. Waar veel gelopen
  wordt, slijt het gras tot zand (een gemiddelde over twintig dagen: vanaf vier stappen per dag een paadje, onder twee
  groeit het dicht), en een koe telt niet; in een maand vooral voor de deuren en op het grasdeel van het plein. Getekend
  met de grondtegels die de kaart al had. Een lantaarn naast de deur van de kapel, de herberg, de markt en het wachthuis,
  en op de kruisingen, niet dichter dan acht tegels bij ander licht; op een lantaarn bouw je niet. 's Avonds en 's morgens
  vroeg branden de ramen van een huis waar iemand thuis is. De spelregel "Paadjes" (waar gelopen wordt, alleen van de
  deuren, of geen). Kosten: een maand spelen kost in de browser zes seconden, het tekenen blijft gelijk, maar als er een
  paadje bij komt, tekent de grond opnieuw (`opmerkingen.md`). Een pad loopt nog niet sneller. 10 nieuwe toetsen,
  `npm test` 861/861.
- 3 okt 2026 — **Vraag 108, a: het overzicht onder `Tab`** (vijfentwintigste sessie; Marcel: "108 a tab"; `js/main.js`).
  `Tab` tilt de camera van de schout af en zoomt uit tot 0,5, zodat je over het dorp kijkt; slepen of de pijltjes
  schuiven het beeld, het wiel zoomt verder uit (0,35) of terug. Wat je klikt, doet de schout nog altijd: hij loopt erheen
  en spreekt wie je aanklikt, en het bouwmenu, een erf en het briefje bij een huis werken zoals altijd. `Tab`, een klik
  op de schout of een gevecht brengt je terug. Het tekenen kost op 0,5 drie keer zoveel als bij het volgen (30 ms per
  beeld zonder scherm, op 0,35 49 ms; `beeld.md`).
- 3 okt 2026 — **Een looppad van drie tegels om elk nieuw gebouw, en de tekenvolgorde** (vijfentwintigste sessie; Marcel:
  "Er moet wel altijd een looppad zijn, het liefste van 3 tegels breed", en "Nee ik wil 3 tegels"). Rondom elk nieuw
  gebouw blijven drie tegels te belopen, zonder gebouw of boom (`T.looppadOm`), bij een verzoek en in het bouwmenu; een
  erf legt bij het aanwijzen vast waar zijn huis komt (`erf.plan`), zo dat ook dat huis drie tegels houdt. En een fout
  in het tekenen: een lang gebouw (de kapel, 5 bij 10) kwam over de hut ervóór, omdat twee gebouwen alleen naar een hoek
  keken; nu vergelijken ze hun hele voet (`T.gebouwVoorGebouw`). `npm test` 851/851.
- 3 okt 2026 — **Vraag 102, b, c en d, en het vertrouwen dat de tevredenheid volgt** (vijfentwintigste sessie; Marcel:
  "102 a b c d e ja, vertrouwen ook ja"). **b:** de herbergierster houdt bier apart voor de huizen tot de oogst binnen is
  (hooguit 150 dagen; `T.bierApart`), zoals de boeren het zaaigraan: de gasten drinken alleen wat erboven ligt. **c:** na
  de laatste trede telt de raad tot de 100 mensen van de winst, en zijn het er genoeg, dan zegt hij dat je het vrije erf
  weghaalt (een gezin op een erf begint in een hut, en zet de teller terug). **d:** de spelregel "Het eind": een slechte
  reeks van hooguit zeven dagen zet de teller stil in plaats van op nul, en het doel zegt hoeveel dagen je nog hebt.
  **Vraag 106, stap 3:** het vertrouwen van het dorp gaat elke dag een zestigste van het verschil naar hoe tevreden het
  dorp is, zodat een klap in een paar maanden wegslijt, en een tevreden dorp je niet meer langzaam wegjaagt.
- 3 okt 2026 — **Vraag 106, stap 2: elke maand een gril van de heer** (vijfentwintigste sessie; `js/grillen.js`). Op de
  twaalfde van elke maand (niet in de eerste, en niet in wijnmaand en slachtmaand) een brief met iets wat hij wil,
  geloot uit veertien en pas na een jaar weer: het standbeeld, zijn jacht in je velden, het bier voor de bruiloft van
  zijn neef, belasting op ramen, zijn ontsnapte valk ("We vonden hem. Gebraden, helaas."). Elk antwoord is een knop met
  wat het kost; wie hem geeft wat hij wil, betaalt het met het dorp, en wie het dorp spaart, ergert hem. Geen antwoord
  binnen tien dagen ergert hem ook. Wie een jaar lang alles weigert, is binnen dat jaar weg. Onderweg twee oude
  fouten: bij een nieuw of geladen spel bleef de balk leeg tot er iets veranderde (`T.ui.reset` gaf het spel mee in
  plaats van het dorp), en de mensen stonden op 0/0 tot de eerste nacht. 9 nieuwe toetsen, `npm test` 841/841.
- 3 okt 2026 — **Vraag 106, stap 1: twee bazen** (vijfentwintigste sessie; Marcel: "106 a b c d ja"; `js/bazen.js`). De
  gunst van de heer en het vertrouwen van het dorp in jou, elk van 0 tot 100, als twee gezichten in de balk (de heer met
  een kroon, het dorp met een boerenhoed), met bij de muis waarom. Wat ze nu al beweegt: de schatting, de heervaart, de
  schandpaal, de soldaten, wapens en wat je verstopte (de heer); de antwoorden op de voorvallen en verzoeken, wie
  verhongerde, bevroor of sneuvelde, en elke dag hoe het gaat (het dorp). Onder 20 een waarschuwing (een brief van de
  heer, of het dorp mort), op 0 weg, maar altijd eerst de waarschuwing. Betrapt: de laatste waarschuwing, en daarna weg
  (de spelregel "Betrapt" kan "Meteen weg"). De oude toetsen van de heer en het verstoppen spelen met "Alleen de heer".
  Onderweg: `Spel.debug.raad()` gaf het spel mee in plaats van het dorp. 12 nieuwe toetsen, `npm test` 832/832.
- 3 okt 2026 — **Vraag 104: de ondernemers, de wapenmaker en de tweede herberg** (vijfentwintigste sessie; Marcel: "104
  a b c d ja"; `js/ondernemers.js`). Een op de zes volwassenen is ondernemer, uit het zaad zoals het karakter van de
  boeren, en vraagt je iets wat niemand mist, na je oproepen en vóór wat het dorp mist. Ja: zijn huis is je dankbaar.
  Nee: zijn huis neemt het je kwalijk, en na twee keer trekt hij weg met zijn gezin, het bos in; het venster zegt het
  vooraf, het briefje bij zijn huis ook. **De wapenmaker** (na de rovers of met een smidse): de militie slaat met een
  wapen 2 harder; de inner die hem ziet, wordt argwanend, en op Sint-Maarten laat de heer hem verzegelen (wapens weg, 20
  goud boete volgend jaar) als zijn inner of hijzelf hem zag of zijn soldaten het hele dorp doorzoeken. Na een nee smeedt
  hij stiekem in zijn kelder, wat de soldaten daar kunnen vinden. **De tweede herberg** (in een dorp vanaf 50 mensen):
  ja, en ze vechten om de gasten (elk gaat naar de dichtste herberg), maar de herbergierster is boos en brouwt 60 dagen
  niet; nee, en zij zet een vat bier klaar. `js/herberg.js` rekent nu met meer herbergen; met één verandert er niets. 16
  nieuwe toetsen, `npm test` 820/820.
- 3 okt 2026 — **Vraag 103, stap 2 en 3: oproepen met een premie, en de speeltest bestuurt** (vijfentwintigste sessie).
  **Oproepen:** in het bouwmenu staat onder het erf een rij Oproepen; een klik hangt op het plein "Het dorp zoekt een
  steengroeve", met een premie van 5 goud voor wie het bouwt, nog een klik haalt hem weg (`T.doeOproep`). Wat erop staat,
  vraagt iemand als eerste, ook wat niemand mist; hangt hij er een week en kan het dorp hem niet betalen, dan zegt de raad
  wat er mist. **De speeltest:** onder "De mensen" bouwen de spelers zelf niets behalve erven, en zeggen ja op een
  bouwverzoek als het dorp het kan betalen. Een eerste speeltest (op `1991fc5`) zei op alle verzoeken nee, omdat de
  speler voor een voorval het "verstandige" antwoord kiest, en dat is geen hout uitgeven dat de winter nodig heeft: alle
  dorpen liepen leeg. Een hut die op hout wacht, laat nu een houthakker vragen, en de bouwer wijst erven aan zonder op
  een houthakker te wachten. 3 nieuwe toetsen, `npm test` 803/803.
- 3 okt 2026 — **Vraag 103, stap 1: de verzoeken** (vijfentwintigste sessie; Marcel: "103 a b c ja d ook verzoek e ja";
  `js/verzoeken.js`). Met de spelregel "Wie bouwt" op "De mensen vragen het" (de standaard) staat in het bouwmenu alleen
  nog het erf. Wat het dorp mist (wat de raad je vroeger liet bouwen, `T.watTeBouwen`), komt een inwoner je vragen, zoals
  een voorval: een put of een kapel namens de buurt, een werkplaats iemand zonder werk, met de plek die hij koos
  (`T.plekVoor`, overgenomen van de bouwer van de speeltest) in goud op de grond, en wat het kost onder het antwoord. Ja:
  het komt er, en hij is er de meester. Nee: dertig dagen niet weer. Ben je weg, dan weegt je raadsman wat het helpt tegen
  wat het kost, naar zijn karakter. De raad zegt "zou helpen" in plaats van "bouw ... [B]", en wie je erom vraagt. De
  oude toetsen spelen met "Jij bouwt"; 8 nieuwe toetsen, `npm test` 800/800. Nog niet: oproepen (stap 2), de bestuurder in
  de speeltest (stap 3), verzoeken uit eigen wil.

- 3 okt 2026 — **2e: het eind en het jaar in het kort** (vijfentwintigste sessie; vraag 101, Marcel: "101 ja";
  `js/einde.js`). **Winnen:** elke nacht telt het dorp of elk huis met mensen alles heeft, in de hoogste stand of
  ernaast, vanaf 100 mensen (`T.iedereenGelukkig`); na 360 dagen op rij (de werkbank, "Het eind") is het gewonnen: het
  dorp viert het grote feest op het plein, de hele dag, en die avond (of eerder, bij het feest) komt het eindscherm
  "Iedereen gelukkig" met het jaar tot nu toe, en Verder spelen of Naar het titelscherm. Linksboven staat het doel zodra
  er geen trede meer is: mensen, huizen, dan dagen (`T.eindDoel`). **Verliezen** ook onder 10 mensen ("Het dorp is
  leeg"). **Het jaar in het kort:** een jaarboek uit het dagboek van de raadsman en de oogst, en op 1 lentemaand het
  jaarverslag als brief in zijn hand: groei, wie kwam, stierf en wegtrok, de oogst, wat doorgroeide, de feesten, de heer,
  wat het meest gemist werd, en de dagen dat iedereen alles had. De speeltest schrijft het verslag op (`jaarverslagen`),
  telt een leeg dorp apart van een ambt kwijt, en speelt na een winst verder. `Spel.debug.einde()`. 7 nieuwe toetsen,
  `npm test` 792/792.
- 3 okt 2026 — **2c: zien wat een huis wil** (vijfentwintigste sessie; vraag 100, Marcel: "100 ja", in de stijl van vraag
  98, "98 C"). Een huis dat iets mist, heeft boven zijn deur een teken met wat het als eerste mist (pixel art,
  `gereedschap/pixelart/papieren.cjs`); staat de muis op een huis, dan hangt er een briefje aan een spijker naast de deur
  met wie er woont, wat het wil met ✓ en ✗, wat helpt en hoe ver het is met doorgroeien (`T.huisToestand`,
  `js/huisbriefje.js`); en met een erf in de hand zegt de muis welke put en kapel een huis daar haalt
  (`T.erfKringTekst`). Wat helpt, zegt het briefje zoals de raad (één functie, `hulpVoorWens`). Het briefje is het eerste
  in de stijl van de schrijftafel: papier, de spijker, en de letters Jacquarda Bastarda 9 en IM Fell English
  (`letters/`, met hun licentie, ook in de proefversie). 2 nieuwe toetsen, `npm test` 785/785.
- 3 okt 2026 — **Het laken: 8 wol per schaap, meer lammeren, en laken bij de marskramer** (vijfentwintigste sessie, na
  Marcels vlucht; vraag 99; Marcel: "99 a b c d ja"). **a:** een schaap geeft 8 wol (was 4): het eerste jaar laken voor
  zo'n 24 ambachtslieden, een volle kooi voor 76. **b:** een schaap werpt met 50% kans een lam (was 30%). **c:** in een
  dorp verkoopt de marskramer in de zomer en de herfst laken, drie pakken van vier voor 6 à 7 goud (`trede` in
  `T.HANDEL_INSTELLINGEN.verkoopt`), en de bouwer van de speeltest koopt het als de ambachtslieden het tekortkomen. **d:**
  het graanboek van de speeltest telt de dagen zonder laken (als er ambachtslieden zijn). 1 nieuwe toets, `npm test`
  783/783. De speeltest erna staat in `speelbaar.md`.
- 3 okt 2026 — **De feesten: het oogstfeest als vrije dag, en de meiboom** (vijfentwintigste sessie, tijdens Marcels
  vlucht; vraag 97; Marcel: het oogstfeest "Ja, een hele dag vrij", en "De meiboom"). Een antwoord op een voorval kan nu
  een feest zijn (`feest: 'dag'` of `'avond'`, `js/feesten.js`): het hele dorp staat dan op het plein rond het midden, de
  herbergierster tapt, 's avonds brandt er licht, en niemand gaat naar de herberg. Een hele dag kost een dag werk: de
  werkplaatsen staan stil ("het dorp viert feest") en de boeren maaien niet. Het oogstfeest: groot is morgen de hele dag,
  klein is vanavond. De meiboom: een voorval op een vaste dag (30 grasmaand, `op`), zonder bier (in de lente is er bijna
  geen), en een meiboom in pixel art die dertig dagen op het plein staat (`gereedschap/pixelart/meiboom.cjs`). De
  spelregel "Feesten" ("Alleen de stemming" is het spel van ervoor), `Spel.debug.feest()`, en een schermafdruk van het
  feest 's avonds (`gereedschap/pixelart/uit/schermen/feest-avond.png`, niet in git). Wat er nog niet is (de schout op het
  feest, een ton, het oogstfeest pas na de laatste schoof), staat in `opmerkingen.md`. 7 nieuwe toetsen (de laatste op
  drie gehuchten van de maker), `npm test` 782/782.
- 3 okt 2026 — **Eén herberg en één markt voor het hele dorp, en de keten in één keer** (vierentwintigste sessie; vraag 96,
  a en b; Marcel: "A. Ja, 1 markt 1 herberg voor nu. B prima"). **a:** de herberg en de markt hebben geen kring meer
  (`T.WENSEN_INSTELLINGEN.kring`: null); staat er een in het dorp, dan heeft elk huis dat hem wil hem. De kring van 30 is
  de spelregel "De herberg en de markt" op "Binnen een kring". **b:** wat de raad over een keten zegt, geeft de rest mee
  (`ook` in `T.watDeHuizenMissen`), en de bouwers van de speeltest bouwen een bakkerij en een molen samen. 1 nieuwe toets,
  `npm test` 775/775. De speeltest erna staat in `speelbaar.md`.
- 3 okt 2026 — **Brood 0,01, erven binnen de kringen, en "Daar kun je niet bij"** (vierentwintigste sessie; vraag 95;
  Marcel: "A. Ok, maar er moet altijd druk zijn om voldoende eten. Het mag niet te makkelijk. Verder akkoord met b c d").
  **a:** een ambachtsman wil 0,01 brood per dag (was 0,03): het brood van een stenen huis kost nu 29 graan per jaar.
  **b:** de bouwers van de speeltest wijzen een erf aan waar het huis de herberg, een markt, een kapel en een put in zijn
  kring heeft, de herberg eerst. **c:** `T.randVanGebouw` kiest eerst een randtegel waar de schout kan komen, en "Daar
  kun je niet bij" bij een huis met een open deur is weg (een toets erbij). De speeltest telt nu ook de druk om eten: honger,
  "het eten haalt de winter niet", geen graan, en de jagers. De uitslag (`speelbaar.md`): meer bier en brood, dezelfde druk
  om eten, en bij de sluwe bouwer met zaad 1 op 79 dagen alle huizen alles; nu remt vooral de ligging van de herberg en
  de markt (vraag 96).
  `npm test` 774/774.
- 2 okt 2026 — **De sluwe bouwer en het graanboek** (vierentwintigste sessie; vraag 93, a, en 94; Marcel: "ja prima").
  In de speeltest een zesde speler, `sluw`: de bouwer, maar hij bedriegt de heer elk jaar zoals de slimme speler (het
  verstoppen en het wachten op de soldaten staan daarvoor nu op één plek), houdt het graan verstopt en haalt 's nachts
  10 graan terug als de herberg of de bakkerij stilvalt, en neemt een krap rantsoen en houtkap als de raad erom vraagt.
  Wie twee jaar speelt, krijgt een graanboek: per jaar waar het graan bleef (een luisteraar op `T.wijzigVoorraad`), op
  hoeveel dagen er geen bier of brood was, en hoeveel huizen alles hadden. De uitslag (`speelbaar.md`): meer bier en
  brood, en de heer krijgt bijna niets, maar ook de sluwe bouwer heeft nooit een dag waarop alle huizen alles hebben: het
  brood van een dorp met alleen stenen huizen kost meer graan dan de akkers geven (vraag 95). Ernaast een fout in het
  spel, nagespeeld bij zaad 1 en 2: "Daar kun je niet bij" bij een huis waarvan de deur open ligt (`opmerkingen.md`).
  Alleen gereedschap, `npm test` 773/773.
- 2 okt 2026 — **Brood is eten, en het zaaigraan is niet voor de molen** (drieëntwintigste sessie; vraag 92; Marcel: "A ja,
  maar brood is wel minder lekker en levert minder blijheid op. B prima, maar moet dat nu? ... C en d prima"). Wat een huis
  aan brood, vis en vlees krijgt, eet het dorp minder aan graan (`T.voedtAlsGraan`, `T.eetVandaag`), en brood weegt half
  zo zwaar in hoe blij een huis is (`blijheid` in de werkbank). De speeltest liet een fout zien: een werkplaats nam ook het
  zaaigraan dat de boeren achterhouden (vraag 81), en de molen maalde het op; nu laat hij het liggen. Het graan van buiten
  op de markt komt later (stap 6, de kleine stad). 3 nieuwe toetsen, `npm test` 773/773.
- 2 okt 2026 — **Het goud, de werkplaatsen en het laken** (drieëntwintigste sessie; vraag 91; Marcel: "a ja b ja c ja d
  ja"). **a:** de bouwer van de speeltest neemt de belasting aan als de raad zegt dat die goud brengt, en bouwt de eerste
  wens die hij kan betalen. **b:** een werkplaats die iets omzet (de molen, de bakkerij, de brouwerij, de weverij, de
  timmerman, de kuiper, de kalkbrander, de smidse, de wapenmaker en de herberg), maakt tot er 30 ligt (`T.maaktTot`, één
  getal in de werkbank); een molen maalde ervoor ruim 880 graan per jaar. **c:** laken 0,005 per mens per dag. In de
  speeltest: goud in het tweede jaar, de bakkerij, de molen, de weverij en de markt komen er, en bij zaad 1 hebben drie
  van de vier stenen huizen alles; maar het brood eet het graan op (vraag 92). 1 nieuwe toets, `npm test` 770/770.
- 2 okt 2026 — **2d: de treden uit de standen, marktrecht, en de ketens** (drieëntwintigste sessie; vraag 90; Marcel: "a
  ja b ja c ja d ja"). **A:** een trede komt met de mensen van een stand, zoals in Anno 1602 (`js/treden.js`): een dorp
  bij 20 dorpelingen, marktrecht bij 20 ambachtslieden (de werkbank). Een dorpeling is wie in een huis of een stenen huis
  woont (`T.mensenVanStand`): een huis dat versteent, blijft meetellen. Linksboven "2 van 20 dorpelingen", de heer vraagt
  "twintig zielen in huizen, niet in hutten", en de oude eis (50 mensen, een kapel en een smidse) is de spelregel
  "Treden". **B:** de markt en de weverij komen al in een dorp. **C:** bij marktrecht schrijft de heer ("Wij vernemen dat
  in Ons dorp gehandeld wordt. Wij verlenen u marktrecht. Dat kost u vanaf nu meer."). **D:** de raad kent de ketens:
  "bouw een bakkerij en een molen [B]", "de bakkerij heeft geen meel, bouw een molen [B]", "de weverij heeft geen wol, en
  wol komt van de schapen", en een werkplaats zonder genoeg handen krijgt geen "nog een" meer. In de speeltest: een dorp in
  slachtmaand en marktrecht nog in het eerste jaar, maar geen goud voor wat ze vrijmaken (vraag 91). 5 nieuwe toetsen,
  `npm test` 769/769.
- 2 okt 2026 — **Niemand ingemetseld, de rem op zoeken, de eilanden en A* met een hoop** (drieëntwintigste sessie; vraag
  88; Marcel: "A ja, B, mag", en zijn eigen rem: "na 2x falen om route te vinden overslaan"). Bouwen keek alleen of een
  tegel vast was: in de nulmeting van de speeltest stonden twee mensen vanaf dag 50 ingemetseld in een hut die over hen
  heen doorgroeide, en de bouwer zette een put op de deur van de schout. Nu komt een gebouw niet op iemand of op een deur
  ("Daar staat iemand.", "Daar is een deur."), laat een erf een deur vrij, groeit een huis niet over iemand of een deur
  heen, komt wie binnen is door de nieuwe deur naar buiten, en stapt wie toch op een bouwplaats staat eraf. Wie twee keer
  na elkaar geen weg vindt, wacht een uur (`T.LOPEN_INSTELLINGEN`). De eilanden (`T.kanErKomen`, `js/wereld.js`): een
  zoektocht naar een ander eiland stopt meteen; ruim gerekend, dus nooit "geen weg" waar er een is (6.000 zoektochten
  nagekeken). Een tegel of voorwerp dat verandert, zegt het met `T.kaartVeranderd`. A* kiest met een hoop, in precies
  dezelfde volgorde: de nulmeting speelt er alle vijftien jaren letter voor letter mee. 8 nieuwe toetsen, `npm test`
  764/764.
- 2 okt 2026 — **De raad en het rapport over de wensen, en een bouwer die ze volgt** (drieëntwintigste sessie; vraag 86,
  a en b, en het plan, vraag 87; Marcel: "a ja b ja c 40 ... d zo laten"). Eén vraag, `T.watDeHuizenMissen`
  (`js/wensen.js`), zegt wat de huizen missen en wat helpt, voor de raad, het rapport en de bouwer. **De raad** (vóór het
  doel): "Een hut kan een huis worden, maar er is geen 8 hout: bouw een houthakker [B].", "Vijf boerderijen en een huis
  willen een kapel binnen 40 tegels [B].", alleen wat je nu kunt doen, en kun je het niet betalen, met wat je mist en
  waar het vandaan komt. **Het rapport**: wat er gemist wordt als status (als het begint, verandert of ophoudt, en om de
  week), ook wat pas in een dorp kan, "Alle huizen hebben wat ze willen.", en wie er doorgroeide. **De kring van een
  kapel is 40** (met 30 haalde één kapel hooguit vier van de zes huizen die er een willen). **De bouwer** van de
  speeltest volgt dezelfde lijst (een put of kapel waar hij de meeste huizen haalt, een visser of jager, een houthakker
  of steengroeve), met een houthakker vóór een nieuw erf. In de speeltest: 100 à 104 mensen zonder één dode, en twaalf à
  veertien huizen groeiden door (`speelbaar.md`; wat eruit volgt, is vraag 89). 13 nieuwe toetsen.
- 1 okt 2026 — **Stap 2a en 2b: de wensen per huis, doorgroeien, en zes stenen huizen** (tweeëntwintigste sessie; vraag
  80 en 85; Marcel: "a ja, maar een hogere stand eigent zich spullen toe ... b ja voor nu. c zacht d ja"). **2a**
  (`js/wensen.js`): elk huis met mensen heeft een stand naar zijn soort (een hut keuters, een huis dorpelingen, een stenen
  huis ambachtslieden, een boerderij boeren; het huis van de schout en de herberg geen), en een stand wil wat de stand
  eronder wil, en meer: goederen uit de voorraad (bier, vlees of vis, brood, laken; **de hoogste stand neemt eerst**), en
  plekken in een kring om het huis (een put 12 tegels, een kapel, de herberg en een markt 30). Elk huis heeft zijn eigen
  tevredenheid (eten 0,5, brandhout 0,3, de rest 0,2), en het dorp is het gemiddelde, naar mensen; het gehucht begint zo
  op 83% in plaats van 67%, want de afwisseling ging op in de wensen. De balk zegt de tevredenheid per stand en in hoeveel
  huizen iets gemist wordt; met een put, kapel, herberg of markt in de hand zie je de kring, en zegt de muis wie hij
  bereikt (de kring is groter dan het scherm, `opmerkingen.md`). **2b** (`js/behoeften.js`): heeft een huis 30 dagen op
  rij alles, dan groeit het door, voor 8 hout (een huis) of 12 steen (een stenen huis); zonder bouwstof wacht het, en zegt
  het dorp het één keer. De woningen van het begin groeiden nooit (ze hadden geen voorwerp); nu wel. Achteruitgaan is
  zacht (een gezin trekt alleen weg uit een huis onder de vertrekdrempel), en de spelregel "Achteruitgaan" kan het
  streng. Een hogere stand betaalt meer belasting. **De stenen huizen:** zes stenen broertjes van de zes huizen, van
  veldsteen onder riet (`huizen.cjs`, met bouwfases); een huis versteent op zijn eigen grond. De spelregel "Wensen" op
  "Het dorp als geheel" is het spel van vóór 1 okt: daarmee speelt de speeltest alle vijftien jaren letter voor letter
  zoals op de stand ervoor (`d51ff59`). `Spel.debug.wensen()`. 21 nieuwe toetsen, `npm test` 743/743.
- 1 okt 2026 — **Het zaaigraan, pas bij nood** (eenentwintigste sessie; vraag 81; Marcel: "zaaigraan wordt bij nood
  opgegeten, anders sterven er mensen"). Van de oogst tot het zaaien houden de boeren het zaaigraan voor volgend jaar
  achter (`T.zaaigraanApart`, wat de akkers van volgend jaar vragen), en het dorp eet het pas na het andere graan, de
  kaas en het gezouten vlees; dan zegt het dat één keer per winter, en staat het in het rapport. De winter rekent het
  eten zonder het zaaigraan, en bij de muis op het graan in de balk staat hoeveel ervan zaaigraan is. De spelregel
  "Zaaigraan". 1 nieuwe toets, `npm test` 722/722. In de speeltest stierven minder mensen, maar at een dorp van 52 het
  zaaigraan toch op; met een bouwer die een jager per maand bouwt (vraag 81, b) stierf niemand meer van de honger, en
  groeide zaad 3 tot 104 mensen zonder één dode (`speelbaar.md`).
- 1 okt 2026 — **Een jaar dat te winnen is** (eenentwintigste sessie; stap 1 van vraag 79, met vraag 59, B en C, die
  geparkeerd was; Marcel: "D dat is prima"). **Een gezin wacht op de winter:** haalt het hout of het eten de winter niet,
  dan komt er vanaf 1 herfstmaand geen gezin, tot het genoeg is (`T.watDeWinterNietHaalt`, `T.waaromGeenGezin`:
  'winter'; de spelregel "Groei"); het dorp en de raad zeggen het erbij, en het venster van 90 dagen staat nu één keer
  (`T.winterInZicht`), voor de groei, de raad en het rapport. **De raad zegt wat je mist** voor de kapel en de smidse, en
  waar het vandaan komt: de marskramer (nu, of in welke maand), de belasting [W], en voor hout een houthakker [B]
  (`T.doelGebouwen`). **Zaaigraan:** de marskramer verkoopt in de lente tien pakken graan van tien, voor 5 goud per pak,
  en omdat hij pas na het zaaien komt, zaaien de boeren na wat niet gezaaid kon worden, tot 1 bloeimaand (`T.zaaiNa`; ook
  met graan uit een kelder; wat rovers vertrapten niet). De bouwer in de speeltest koopt het als er akkers kaal liggen.
  In de speeltest (`speelbaar.md`) stierf niemand meer van de kou, en 20 tot 31 mensen minder in twee jaar; maar het dorp
  at zijn zaaigraan op, en het eten blijft te weinig voor 50: dat werd vraag 81. 5 nieuwe toetsen, `npm test` 721/721.
- 1 okt 2026 — **Het rapport zegt wat verandert** (twintigste sessie; vraag 76; Marcel: "a ja b ja c nu"). Een oorzaak
  zegt de raadsman als hij begint, één keer per week zolang hij blijft ("Er is nog steeds honger, al twaalf dagen: het
  rantsoen is krap."), en als hij voorbij is ("De honger is voorbij."); de winter als hij omslaat, als de dag waarop
  het op is tien dagen verschuift, en anders één keer per week. Las je een rapport niet, dan geldt wat erin stond als
  niet gezegd. Elke oorzaak heeft er zijn woorden voor (`nog` en `voorbij` in `T.OORZAKEN`). Bij de bouwer werd de helft
  van de rapporten stil (299 tot 431 van de 610 tot 748, was 20 tot 44), en "Er is honger" kwam 3 keer in plaats van
  393 tot 532. 3 nieuwe toetsen, `npm test` 717/717.
- 1 okt 2026 — **Het rapport van de raadsman, 's ochtends** (twintigste sessie; vraag 75, 3a, de eerste fase van de dag;
  Marcel: "A Ja dat is goed", en bij het nakijken van het plan "a ja b ja c ja"). Heb je een raadsman, dan brengt hij je
  elke ochtend een papier (`js/ochtendrapport.js`): wie er kwam, stierf of wegtrok (met namen en waarom), wat de boeren
  uit zichzelf deden, wat hij besliste toen je weg was en wie je niet sprak; hoe het graan en het hout gaan sinds
  gisteren; vanaf drie maanden voor de winter of het hout en het eten hem halen; welke oorzaken er spelen; en wat er
  komt. Een stille dag is één regel ("Niets bijzonders."). Bij het nakijken van de code vond Claude drie dingen, en
  Marcel koos ze alle drie: **a**, de raadsman vertrekt zo vroeg dat hij aan je deur staat als je opstaat (de boeren
  wonen 16 tot 27 stappen weg, bijna een uur lopen, en zo lang duurt de ochtend), en sta je buiten bij huis, dan komt hij
  naar je toe; **b**, het rapport zegt wat de balk niet zegt, en zijn rekenen kleurt die getallen (precies, afgerond op
  vijf, of tot 30% ernaast; anders verraadt de balk een slechte rekenaar meteen); **c**, de raad zegt de eerste dagen
  "Een raadsman brengt je elke ochtend een rapport: kies er een [R]". Wat er gebeurde, schrijft het dorp in een dagboek
  (`T.schrijfOp`; `T.wijzigBevolking` geeft wie het zijn mee), en elke nacht maakt hij er als laatste stap van de dag zijn
  rapport van; een rapport dat je niet las, gaat op in het volgende. Het papier is het venster van de brieven, in zijn
  hand; de knop Brief heet Rapport zolang er een ongelezen ligt. De spelregel "Het rapport", `Spel.debug.rapport()`. 13
  nieuwe toetsen, `npm test` 714/714. De speeltest (`speelbaar.md`): met het rapport uit alle 15 jaren letter voor letter
  zoals ervoor, en op de nieuwe standaard ook de vier spelers zonder raadsman, op de raad van de eerste dagen na. Wat
  opviel, werd vraag 76: het rapport zegt bijna elke dag hetzelfde.
- 30 sep 2026 — **De boeren doen het seizoen** (negentiende sessie; vraag 74, stap 2; Marcel: "Het zaaien wordt gewoon
  iets wat de boeren doen, zo ook het oogsten en de winter. Jij moet als schout wel een oogje in het zeil houden", en
  "zelf sprokkelen, maar lost niet volledig op. Houthakker is nodig"). Na de oogst, op 1 herfstmaand, kiest elke boer wat
  zijn velden volgend jaar worden (`T.boerenKiezenVelden` in `js/akkers.js`): een akker die volgend voorjaar onder 75%
  zou zakken, krijgt mest als die er is en rust anders een jaar, een braak wordt weer akker, een weide blijft weide. Het
  bericht zegt wat ze kozen, het veldenvenster bij elk veld wie het koos en waarom (`T.planTekst`), en wat jij kiest,
  laat de boer staan (`veld.planDoor`). Op 1 slachtmaand slachten de boeren wat het hooi niet haalt (`T.boerenSlachten`
  in `js/vee.js`, met het voorstel dat het venster al had). Het hele jaar sprokkelt elk huishouden 0,015 hout per dag
  (`T.sprokkelHout` in `js/behoeften.js`), zo'n 40% van wat het in de winter stookt: het gehucht haalt met zijn 40 hout
  52 van de 90 winterdagen in plaats van 38, en zonder houthakker nooit de hele winter, en het bericht zegt dat ("ook met
  wat de mensen sprokkelen"). De spelregel "Het seizoen" (de boeren, of jij: zoals vóór 30 sep). De toetsen die het
  stoken en de houthakker precies nameten, draaien met die spelregel op jij; 6 nieuwe toetsen.
- 30 sep 2026 — **Voorvallen met een oorzaak** (negentiende sessie; vraag 74, stap 1, B; Marcel: "a ja"). Vier oorzaken
  die je kunt zien en zelf kunt veranderen (`T.OORZAKEN` in `js/voorvallen.js`): honger (een krap rantsoen, of het dorp
  mist eten), kou (in de winter, als het hout het niet haalt), vol (geen plaats in de huizen) en onvrede (onder 50%).
  Diefstal, de stroper, de lening en de woeker komen van honger, de vechtpartij van onvrede, de koorts van kou of een vol
  dorp, de brand van een vol dorp: met de oorzaak drie keer zo vaak, zonder een kwart zo vaak (`T.gewichtVanVoorval`; de
  getallen in de werkbank, op 1 en 1 zoals ervoor). Het bericht zegt waarom ("Trijn zoekt je. Er is honger, want het
  rantsoen is krap."), ook als de raadsman beslist, en een gesprek kan het zeggen met `{oorzaak}`.
  `Spel.debug.voorval()` zegt welke oorzaken spelen en hoe zwaar elk voorval weegt. 5 nieuwe toetsen.
- 1 okt 2026 — **`npm run grootte`** (negentiende sessie; Marcel: "scripts bewaren"): de meting van hoe groot een dorp
  kan worden, als gereedschap (`gereedschap/grootte/`), zodat we na een verbetering precies hetzelfde opnieuw meten.
- 30 sep 2026 — **Speeltest met een andere spelregel of een ander getal** (negentiende sessie): `--regel seizoen=jij` en
  `--getal VOORVALLEN_INSTELLINGEN.metOorzaak=1`, zoals de browser ze onthoudt als een speler ze kiest.
- 30 sep 2026 — **Elk dorp leeft** (negentiende sessie; vraag 71, stap 3 van stuk 2, A en C). `T.werkDorpBij(S, D, dt,
  dtWereld)` (`js/dorp.js`) doet elk beeld alles van een dorp, voor elk dorp in `S.dorpen` (`js/main.js`); ligt het niet
  waar je bent, dan lopen, maaien en dwalen zijn poppetjes daar ook, op zijn eigen kaart en niet getekend
  (`T.beweegWezens` in `js/anim.js`, `T.dwaal` in `js/verkennen.js`). Een ander dorp (`D.ander`) spreekt niet tegen jou:
  een regel over een dorp zegt iets met `T.zeg(D, tekst, soort)` (alle hulpjes `bericht` in de dorpsbestanden gingen
  eruit), en een ander dorp bewaart het (`D.gezegd`, de laatste twintig); een venster dat het zou openen, komt niet bij
  jou, en het zet de tijd niet op 1× of stil. Een voorval in een ander dorp beslist zijn raadsman, als het er een heeft
  (kiezen doet het nog niet; zie vraag 72, B), tot zijn schout in code kiest (stap 1b). `test/dorpen.test.cjs`: jouw gehucht en een van de maker naast elkaar; een jaar van het een laat
  het ander letter voor letter ongemoeid en zegt jou niets, in een dorp waar je niet bent lopen de mensen rond, en geen
  dorpsbestand spreekt nog rechtstreeks tegen het scherm. In het spel is er nog één dorp: `npm test` 689/689, en de
  speeltest letter voor letter hetzelfde jaar.
- 30 sep 2026 — **Eén dorp als één ding** (negentiende sessie; vraag 71, stap 2 van stuk 2; Marcel: "A ja B ja C ja, oud
  spel mag vervallen"). Alles van een dorp staat bij elkaar: `S` is het spel (de kalender, het land, jij, het scherm) met
  zijn dorpen (`S.dorpen`), je eigen dorp is `S.dorp`, en een dorp heeft zijn kaart, voorraad, mensen, wetten, heer en
  inner, rovers, voorvallen, raadsman, trede, vee, vlaggen en zijn eigen schout (`js/dorp.js`, `T.nieuwDorp`). Eerst
  kregen de regels over een dorp het dorp bij naam (`D`, stap 2a, met de ontleder van eslint: alleen de S die de
  parameter is); dan kreeg het dorp zijn plek (2b). Wat het spel én het dorp nodig heeft, krijgt beide
  (`T.werkInnerBij(S, D)`, een gesprek `T.doeGevolg(S, D, doe)`); de balk en de vensters gaan over je eigen dorp, en wat
  getekend, aangeklikt of gevochten wordt, over het dorp dat er ligt (`T.dorpHier`). Een venster dat een ander dorp zou
  openen, komt niet bij jou. Het opslaan ging naar versie 2. Bewezen: `npm test` 683/683, ook met een wacht die faalt
  als een regel over een dorp het hele spel krijgt (hij vond zes toetsen die per ongeluk groen waren), en de speeltest
  speelt letter voor letter hetzelfde jaar als ervoor (18 van 18 jaren, en de proef met opslaan). De toetsen zette
  Claude voor een deel met een eigen hulpmiddel om, en twee agents deden de rest (zonder één fout in het spel te vinden).
- 30 sep 2026 — **De snellere dag** (negentiende sessie; vraag 71, stap 1 van stuk 2). Een speeldag kostte 30 tot 39 ms,
  voor 85% omdat `T.plekOpHetPlein` elke dag voor elk kind en elke werkloze voor elke tegel van het plein alle bomen en
  huizen afliep (`T.voorwerpOp`). Nu houdt elke kaart een lijst per tegel bij (`js/wereld.js`; `T.zetVoorwerp`,
  `T.haalVoorwerpWeg`, en een toets die kijkt dat niemand het anders doet), en liggen de tegels van het plein klaar
  (`T.pleinTegels`): een dag kost 0,5 ms, met dag voor dag dezelfde uitkomst. Lopen werd ook goedkoper (een dorp met al
  zijn poppetjes: 0,1 tot 0,2 ms per beeld), en een speeltestjaar duurt nu 30 seconden in plaats van drie minuten (de
  bouwer: 80 tot 140 seconden voor twee jaar, was 10 tot 21 minuten).
- 30 sep 2026 — **De maker in het spel: de spelregel "Je gehucht"** (achttiende sessie; vraag 70, C; Marcel: "c ja"). Met
  "Elk spel een ander" begint een nieuw spel op een gehucht van de maker; het ontworpen gehucht blijft de standaard, en
  dan speelt alles zoals ervoor. De maker staat in `js/maker.js`: een plan wordt een kaart met een betekenisbestand
  (`T.kaartVanGehucht`), die het spel inleest zoals het ontworpen gehucht (`T.laadKaart`); de grondtegels kiest hij uit
  de groep van de rand-tegels ("gras over zandpad: boven+rechts"), dus zonder Tiled. Het zaad van het spel legt ook het
  gehucht (`T.beginOpKaart` in `js/gebied.js`, en de boeren uit hetzelfde zaad), een bewaard spel komt met zijn gehucht
  terug, en Nieuw spel volgt de spelregel ook als je hem op het titelscherm omzette (`T.gehuchtNaarDeSpelregel` in
  `js/main.js`). `Spel.debug.gehucht(3)` begint een spel op zaad 3; de speeltest met `--maker`. Toetsen in
  `test/maker.test.cjs`; de speeltest op zaad 1, 2 en 3 in `speelbaar.md`.
- 30 sep 2026 — **De schets van de maker** (achttiende sessie; vraag 69, C, en 70; Marcel: "Werklijst doorzetten").
  `gereedschap/maker/maker.js`: een gehucht uit een zaad (`T.maakGehucht`), uit dezelfde delen als het ontworpen gehucht:
  het plein als hart, de schout erachter met het zand van zijn deur het plein op, de herberg, een huis en twee hutten
  eromheen, vijf boerderijen met hun akkers aan de buitenkant (samen 209 tegels, per boer zoals nu), de heide met de
  kooi aan de rand, de weg met het bruggetje over de beek, en het bos. Het lot kiest de vorm van het plein, waar de weg,
  de beek, het bos en de heide liggen, de tekeningen, en waar elke boerderij staat. Hij keurt zelf (iedereen komt
  overal, niet meer dan 12% van het plein achter een dak) en probeert het opnieuw tot het deugt. `npm run maker` tekent
  gehuchten naast het ontworpen gehucht (`gereedschap/maker/schets.cjs`), en `test/maker.test.cjs` bewaakt dat hetzelfde
  zaad hetzelfde gehucht geeft en dat het ontworpen gehucht door de keuring komt. Nog niet in het spel: dat wacht op
  vraag 70.
- 30 sep 2026 — **De kaart van het land, en reizen** (zeventiende sessie; vraag 69, stuk 1 van stap 1a; Marcel: "Ja, begin
  aan het land"). `js/land.js`: loop je over de weg je gehucht uit, dan opent de kaart van het land (`js/landkaart.js`):
  negen provincies uit het zaad van het spel (je gehucht, het kasteel van de heer, de stad, zes soorten wildernis), met
  wegen van één tot drie dagen, en wat je niet zag in het donker. Klik een provincie en het venster zegt hoe ver het is;
  met Reis erheen gaan de dagen snel voorbij, en ben je er. Een provincie zonder dorp is voor nu land om doorheen te
  reizen. Wie reist, verlaat de kaart van het dorp niet: de schout gaat eruit en het dorp blijft de wereld van het spel,
  zodat er gemaaid en gedwaald wordt, de heer en de inner hun werk doen, de raadsman de voorvallen beslist
  (`T.schoutIsWeg`), niemand de militie roept, en een bezoeker de reis niet op 1× zet. Berichten en brieven wachten tot
  je thuis bent; dan zegt een venster hoe lang je weg was, wat er gebeurde en hoe het dorp ervoor staat. Achter de
  spelregel Land (standaard uit), met de getallen in de werkbank en `Spel.debug.land()`. Getoetst:
  `test/land.test.cjs` (11 toetsen: het land uit het zaad, alles bereikbaar, het donker, een reis over meer provincies,
  thuiskomen net binnen de weg, de weg die de kaart opent, de raadsman onderweg, de spelregel uit, bewaren midden in een
  reis); `npm test` 673/673; in de browser een reis heen en terug met het venster erna, zonder fouten; en de speeltest
  (braaf, zaad 1) met het land uit, op de stand van vóór het land en erna: letter voor letter hetzelfde jaar.
- 30 sep 2026 — **De raadsman beslist alleen als je weg bent** (zeventiende sessie; vraag 68, Marcel: "Ja B inderdaad").
  In de speeltest liet de bouwer met `Esc` elk voorval aan zijn raadsman, en had hij geen voorvallen meer. Nu beslist
  de raadsman alleen als de schout niet in het dorp is (een ander gebied, straks op reis); wie je in het dorp niet op
  tijd spreekt, gaat voorbij, ook met een raadsman, en de balk zegt dan "een schout die geen tijd had" (weg: "een
  schout die er niet was"). De raad zegt "kies een raadsman" alleen nog als een raadsman had beslist ("Wat je mist als
  je weg bent, gaat voorbij: kies een raadsman [R]"), en het venster Raadsman zegt wanneer hij beslist. De spelregel
  "Raadsman" heeft drie keuzes: "Als je weg bent" (de standaard), "Ook als je niet spreekt" (A, zoals het was:
  `nietGesproken` in `T.RAADSMAN_INSTELLINGEN`) en uit. De bouwer in de speeltest kiest nog een raadsman, maar
  beantwoordt de voorvallen weer zelf. Getoetst: een toets erbij in `test/raadsman.test.cjs`, en de toetsen die "niet
  op tijd gesproken" als weg telden, spelen nu met de schout weg; `npm test` 662/662; in de browser de spelregel met
  drie keuzes, het venster zonder en met raadsman, en een voorval in het dorp dat voorbijgaat zonder dat de raadsman
  beslist, zonder fouten in de console.
- 30 sep 2026 — **De raadsman** (zeventiende sessie; vraag 66, Marcel: "A Ja, b Nee, c Nee, wordt automatisch als de
  schout er niet is. D prima"). `js/raadsman.js`: een van de boeren wordt raadsman, met zijn karakter en aanzien en twee
  gelote vaardigheden uit vijf (rechtspreken, zwijgen, rekenen, bouwen, vechten; goed of slecht, vast per spel, zonder
  dat het lot van de boeren verandert). Is de schout niet in het dorp als iemand hem met een voorval gaat zoeken, dan
  beslist de raadsman meteen, en sprak de schout wie hem zocht niet binnen twee dagen, dan beslist hij dan: het
  antwoord dat zijn karakter het meest waard vindt, uit wat er te betalen valt, met wat hij kan erin (wie goed recht
  spreekt, maakt het dorp tevredener; wie niets voor zich kan houden, maakt de inner argwanender). Een bericht zegt wat
  hij deed, en in de balk heet het naar hem. Wie raadsman is, maait trager, en bij de muis staat "je raadsman". Erbij:
  `T.isBoer` op één plek (ook voor de voorvallen), de spelregel "Raadsman", de werkbank met de neigingen per karakter, en
  `Spel.debug.raadsman()`. Getoetst: `test/raadsman.test.cjs` (9 toetsen); `npm test` 660/660; in de browser een
  raadsman gekozen, naar een ander gebied, en daar besliste Aaltje (vroom, spreekt goed recht) over een diefstal.
  **Het kiezen** (vraag 67, Marcel: "B"): de knop Raadsman in de balk (of `R`) opent een venster met de drie
  (`js/raadsmanvenster.js`), elk een kaart met wie hij is, hoe hij beslist ("Beslist streng: wie steelt, moet het bos
  in") en wat hij kan, goed in groen en slecht in rood; daar kies je hem, en later een ander; onderaan wat hij besloot.
  De tijd staat stil zolang het open is. Ging er een voorval voorbij zonder dat iemand besliste, dan zegt de raad tien
  dagen lang: "Wat je mist, gaat voorbij: kies een raadsman [R]". De bouwer in de speeltest kiest er een met die knop,
  en laat de voorvallen aan hem. Getoetst: een toets in `test/raad.test.cjs` en een in `test/voorvallen.test.cjs`;
  `npm test` 661/661; in de browser de raad, `R`, kiezen, van het venster door naar de wetten met `W`, en `Esc`. De
  speeltest (de bouwer, zaad 1, `speelbaar.md`): Klaas besliste 87 van de 88 voorvallen, zonder één fout, minstens zo
  goed als de bouwer zelf (de heer kreeg in 1323 66%, tegen 45%); daardoor bleef het ambt in 1324, en in de tweede
  winter zakte het getal naar 0 terwijl er elf mensen bleven, want de schout, zijn gezin en de boeren sterven niet
  (`opmerkingen.md`, bij vraag 59).
- 29 sep 2026 — **De voorvallen: het dorp spreekt je aan** (zeventiende sessie; vraag 65, A, Marcel: "A ja"). `js/voorvallen.js`:
  om de paar dagen (gemiddeld om de tien, in de winter om de zes, niet in de eerste vier) komt iemand uit het dorp de
  schout zoeken met een vraag, een ruzie of een ramp. Hij krijgt een uitroepteken, het bericht zegt "Trijn zoekt je."
  (bij een ramp "Brand! Harm komt je halen."), hij loopt naar je toe, en staat de schout stil, dan spreekt hij hem aan;
  de tijd staat stil tot je kiest. Twee of drie antwoorden, elk met zijn prijs eronder ("+1 goud, tevredenheid +2%",
  "Geert moet het bos in", "30% kans op een dode"); wat er niet is, kun je niet geven, met waarom. 35 voorvallen van zes
  soorten (rechtspraak, verzoeken, rampen, kansen, feesten, de grillen van de heer), van wie het past (een karakter als
  de weduwe of de zanger in het dorp is), en sommige komen terug (de dief, de lening, het zaaigraan, de woekeraar).
  Een antwoord doet: de voorraad, de tevredenheid (een stemming die in dertig dagen wegslijt, in de balk), de argwaan,
  verbannen (het bos in, en dan als rover terug), een kans op een dode, een gezin erbij, schapen voor de wolven, en een
  vervolg. Wie je niet sprak, komt de volgende ochtend terug, en gaat na twee dagen voorbij ("een schout die er niet
  was"). De woorden staan als gesprekken in `js/gesprekken.js` (naam `'{wie}'`), zodat je ze in de gespreksschrijver
  leest en schrijft; die kent de nieuwe gevolgen. Erbij: een gezin komt op één manier (`T.gezinKomt`), de tevredenheid
  opnieuw op één manier (`T.tevredenheidOpnieuw`, ook voor de wetten), `T.verliesVee`, een antwoord dat uit staat in
  het venster, `{wie}` en `{ander}` ook in een antwoord, de spelregel "Voorvallen" (vaak, gewoon, zelden, uit), de
  werkbank, `Spel.debug.voorval()`, en de speeltest beantwoordt ze (tabel "De voorvallen" in `samenvatting.md`).
  Getoetst: `test/voorvallen.test.cjs` (16 toetsen); `npm test` 651/651; in de browser iemand die je zoekt, aanspreekt,
  wacht na Esc en met een klik weer praat, een knop die uit staat, en na een antwoord weer de tijd. De speeltest braaf
  (zaad 1 tot 3): 47 tot 53 voorvallen in een jaar, dus met de acht keuzes die er al waren een keuze per ruim een
  minuut op 30×, en het jaar eindigt zoals zonder voorvallen (26 → 37, niemand dood); de bouwer (zaad 1) ook: een dorp
  tien dagen eerder, en hetzelfde einde in het tweede jaar (vraag 59). De eerste keer, toen de speler altijd het eerste
  antwoord nam, verhongerde het dorp: zie `opmerkingen.md` en `speelbaar.md`. Open: B, de raadsman.
- 29 sep 2026 — **De heervaart, veteranen, en de naam van je dorp** (zeventiende sessie; vraag 60, Marcel: "A ja B ja
  C ja, speler mag zelf de naam voor zijn dorp kiezen aan het begin"). `js/heervaart.js`: in een dorp (niet in het
  gehucht, dus niet in de proef) vraagt de heer elk jaar op 1 hooimaand een man per tien zielen voor zijn oorlog, of
  drie goud per man; de dorpsbrief kondigt het aan. Sturen: het spel kiest wie (zonder werk eerst, dan de volwassen
  mannen, de jongens het laatst; nooit de schout, zijn gezin of een boer), en ze lopen de weg af tot 1 herfstmaand.
  Ze blijven bewoner (ze tellen mee en eten, hun plaats in huis blijft), maar werken nergens (`p.weg`, `T.stuurWeg`
  en `T.komtTerug` in `js/bewoners.js`); een op de vier komt niet terug. Wie terugkomt, is veteraan en vecht mee als er
  rovers komen, ook zonder wachthuis, met 20 leven (`T.WEZENS.veteraan`, de militie in `js/rovers.js`). Vrijkopen kost
  het goud en 0,5% argwaan per goud; wie niet kiest, stuurt ze na een week. De brieven van de heer staan nu op één
  plek, `js/brieven.js`, met één venster en knoppen (het eerste stuk van hud.js splitsen, vraag 25, C), en de knop
  Brief opent elke brief die op je wacht. Bij Nieuw spel kies je de naam van je dorp, met een voorstel; de heer schrijft
  hem in zijn brieven, en hij staat in het doel en bij een opgeslagen spel. De spelregel "Heervaart" en de werkbank
  ("De heervaart"); `Spel.debug.heervaart('vraag')` en `('terug')`. Getoetst: `test/heervaart.test.cjs` (9 toetsen)
  en twee in `test/treden.test.cjs`; `npm test` 635/635; in de browser de brief, sturen en terugkomen, de naamstap, en
  een gevecht met drie veteranen; de speeltest braaf (zaad 1) speelt zijn jaar zoals eerst (26 → 37), en de bouwer
  (zaad 1) zijn eerste jaar ook, zonder fouten; in zijn tweede jaar stuurde hij op 1 hooimaand drie man, en op 1
  herfstmaand kwamen er twee terug ("Wolter sneuvelde voor de heer. Hij laat weten dat hij dapper was."). Open: C (het
  buurdorp) wacht op het plan voor tegenspelers, vraag 61.
- 29 sep 2026 — **De proef afmaken: de raad, de bouwer en de proefversie** (zestiende sessie; stap 5 van de proef,
  vraag 58, Marcel: "A Ja goed idee. B onder het doel. C itch io"). **B:** `js/raad.js`: onder het doel linksboven
  één regel, in goud, die zegt wat nu tussen jou en een dorp staat, met de toets erbij: de inner (drie dagen vooraf),
  het goud voor de heer als de marskramer er in de herfst is, een wachthuis na een aanval, het hout en het eten voor de
  winter (vanaf drie maanden ervoor, met hoe ver het komt), het graan dat na Sint-Maarten nog in de kelders ligt, de
  eerste dag hoe de tijd sneller gaat, en dan de groei: waarom er geen gezin komt, of wanneer het volgende komt. Hij
  vraagt het aan de regels zelf: de groei zegt nu waarom er geen gezin komt (`T.waaromGeenGezin`, `T.volgendeGezinDag`
  in `js/gebouwen.js`), en de winter hoe ver het hout en het eten komen. De spelregel "Raad" zet hem uit, de dagen staan
  in de werkbank, `Spel.debug.raad()` zegt wat er geldt. **A:** de speeltest heeft een vijfde speler, de bouwer, die
  twee jaar speelt (`npm run speeltest -- bouwer`), en van elke speler schrijft hij op waarom er op een groeidag geen
  gezin kwam, op welke dag het een dorp werd, en welke raad er hoe lang stond (een tabel in `samenvatting.md`). **C:**
  `npm run proefversie`: een zip met alleen wat het spel laadt, `index.html` bovenin, de stand (datum, commit) klein
  op het titelscherm (`T.STAND`), en de stappen voor itch.io in `verpakken.md`. Getoetst: `test/raad.test.cjs` (11
  toetsen) en twee in `test/erven.test.cjs`; `npm test` 624/624; braaf speelt met de raad letter voor letter hetzelfde
  jaar; de bouwer drie keer twee jaar zonder fouten (`speelbaar.md`); en de proefversie uitgepakt in een schone
  browser. Open: vraag 59, de proefversie op itch.io (Marcel, thuis), en de eerste tester.
- 29 sep 2026 — **Rovers en een militie** (vijftiende sessie; stap 4 van de proef, vraag 55, Marcel: "A, Ja en ook
  'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen
  sterven"). `js/rovers.js`: wie wegtrekt, gaat het bos in en komt na tien dagen als rover terug, met zijn naam en
  zijn vel, en daarna om de twintig dagen, zolang er een van de bende leeft. Daarnaast komen er zo'n twee keer per
  jaar wilde rovers van buiten, op een dag die je niet ziet aankomen (de eerste niet vóór dag 60); ze bouwen
  langzaam op: het eerste jaar van je ambt met twee man, het tweede met drie, daarna met vier (vraag 57).
  Tegen de avond komen ze van de rand die het dichtst bij een akker ligt, roven daar twee uur, en gaan ervandoor
  met 10 graan per rover uit de voorraad; drie van de tien keer vertrappen ze de akker, en wat erop stond, groeit
  dat jaar niet meer (`T.vertrapAkker`). Een bericht zegt het, en de tijd gaat naar 1×. De mannen van het wachthuis
  zijn de militie: bij een aanval lopen ze met de schout mee, en ziet een rover hem, dan vechten ze naast hem, elk
  met een eigen beurt (16 leven, 8 punten), en jij bestuurt ze. `js/gevecht.js` vecht nu met een groep: de
  volgorde, de actiepunten, de knoppen en de camera gaan over wie er aan de beurt is (`T.aanDeBeurt`), en een
  rover slaat de man van jouw kant die het dichtst bij staat. Wie valt, is dood: een wachter is een mond minder
  (`T.sneuvelt`, met de reden "gesneuveld"), een verslagen rover komt niet terug, en valt de schout, dan is het
  spel uit, zoals eerder. Wie het overleeft, staat de volgende ochtend weer met al zijn leven op (vraag 11). De
  getallen staan in de werkbank (`T.ROVERS_INSTELLINGEN`), en opslaan houdt de bende. De knop Slaan verloor het
  toetsje `1` (vraag 12); de oude monsters blijven op de proefkaart, voor de toetsen (vraag 10). Getoetst:
  `test/rovers.test.cjs` (13 toetsen), een speeljaar van de speeltest, en in de browser veertien gevechten (vraag
  56).
- 29 sep 2026 — **De eerste wetten** (vijftiende sessie; stap 3 van de proef, vraag 54, Marcel: "Het wordt gewoon een
  menu zoals in diplomacy 3, waar je weten kunt aannemen etc. Maak het niet te ingewikkeld", en "A ja B ja, C later").
  De keuren heten nu wetten. `js/wettenmenu.js`: een menu onder `W` en als knop in de balk, elke wet een kaart met
  wat hij doet in groen en rood, met de getallen van nu, en een knop Aannemen of Afschaffen (het rantsoen: krap,
  gewoon, ruim). Een wet geldt meteen, ook in de balk, en kost niets om aan te nemen. `js/wetten.js`: vier wetten
  in het gehucht, met hun getallen in één blok in de werkbank (`T.WETTEN_INSTELLINGEN`): het rantsoen (krap:
  driekwart eten en 15% minder tevreden; ruim: anderhalf en 10% tevredener), vreemden welkom (om de 10 dagen een
  gezin in plaats van 20, en 5% minder tevreden), houtkap in het bos van de heer (een houthakker hakt twee keer
  zoveel, en wie dat jaar kapte, betaalt de heer op Sint-Maarten 5 goud boete) en belasting (0,05 goud per mens per
  maand in de kist, en 10% minder tevreden). Wat een mens eet, vraagt het spel nu op één plek (`T.etenPerMens`), en
  de balk zegt bij de tevredenheid waar het dorp last van heeft en blij mee is. De benoemingsbrief: "Wetten mag u
  maken, zoveel u wilt. Over Ons bos gaat u niet." Onderweg: de werkbank kan nu ook negatieve getallen aan, en de
  knoppen in de balk passen weer op 1280 breed (op een scherm tot 1500 breed zonder de toetsletters, en met een
  tweede regel als het toch niet past; Menu viel er al half af).
  Getoetst: `test/wetten.test.cjs` (12 toetsen), en in de browser.
- 29 sep 2026 — **De eerste trede, van gehucht tot dorp** (veertiende sessie; stap 2 van de proef, vraag 53, Marcel:
  "A ja B ja C ja D ja"). `js/treden.js`: het gehucht wordt een dorp bij 50 mensen met een kapel en een smidse
  klaar (`T.TREDEN_INSTELLINGEN`, in de werkbank), en dat blijft het. Het doel staat vanaf het begin linksboven met
  de voortgang, zolang geen quest het vak nodig heeft (`T.tredeDoel`), en de benoemingsbrief noemt het ("Een dorp
  brengt Ons meer op"). Is het zover, dan staat de tijd stil en schrijft de heer: "Wij vernemen dat Ons gehucht een
  dorp is geworden. Gefeliciteerd. Dat kost u vanaf nu meer.", met "Verder als dorp" en "Naar het titelscherm"
  (`T.ui.toonDorpsbrief`): het eind van de proef. Het bouwmenu toont voortaan deze trede en de treden ervoor. Het
  hoofdgeld in een dorp staat in de werkbank op 1: alleen woorden, voorlopig. Getoetst: `test/treden.test.cjs`
  (8 toetsen), en in de browser.
- 28 sep 2026 — **Het dorp bouwt zelf** (veertiende sessie; stap 1 van de proef "van gehucht tot dorp", vraag 52,
  Marcel: "A ja B ja C ja D ja"). `js/erven.js`: in het bouwmenu staat "Erf", een vak van 10 bij 10 tegels
  (`T.ERVEN_INSTELLINGEN`, ook in de werkbank) dat je neerzet als een gebouw; het is land, geen gebouw
  (`S.erven`), en een vrij erf heeft paaltjes op zijn hoeken (`gereedschap/pixelart/paaltje.cjs`,
  `T.sprites.paaltje`); een klik met het erf in de hand op een vrij erf haalt het weg. Een huis met plaats gaat
  voor; is het dorp vol, dan neemt een nieuw gezin op een groeidag het vrije erf bij de werkplaats die de meeste
  handen mist, komt over de weg, en zet er zelf een hut op (8 hout, twee dagen), woont er al en is er overdag
  bij; zonder hout wacht de bouwplaats, met een bericht. Zonder vrij erf zegt het dorp dat er geen plaats is. De
  hut weet welk huis hij wordt, zodat hij binnen zijn erf doorgroeit, en de bewoners gaan dan naar de nieuwe deur
  (dat laatste ging tot nu voor elk huis mis). De hut en het huis staan niet meer in het bouwmenu; de spelregel
  "Huizen" (`O`) zet ze terug. En op een akker, een weide of een pad bouw je niet meer: dat kon tot nu. Getoetst:
  `test/erven.test.cjs` (13 toetsen), en in de browser.
- 28 sep 2026 — **Opslaan, Verder en een titelscherm** (dertiende sessie; punt 3 van de prioriteit, vraag 48,
  Marcel: "A ja B ja C ja D ja, push it"). `js/opslaan.js` bewaart heel `Spel.S` behalve het scherm
  (`T.schermVelden`), met de verzamelingen en alles wat elkaar aanwijst heel, achter één functie
  (`T.opslagPlek`, de opslag van de browser; straks een bestand). Elke ochtend, als de mensen opstaan, slaat het
  spel zelf op (A; "Opgeslagen" rechtsonder), en er zijn vijf eigen plekken (B). Het spel opent op het
  titelscherm (C, `js/menu.js`): de naam, Verder, Nieuw spel, Laden en Spelregels, met het gehucht erachter en
  de camera die langzaam rond het plein glijdt. In het spel opent `Esc` of de knop Menu het menu (D): Verder
  spelen, Opslaan, Laden, Spelregels, Naar het titelscherm; de twee eindschermen gaan ook daarheen. Een
  proefje (`?kaart=`) slaat niets op. Getoetst: `test/opslaan.test.cjs` (bewaren, laden en weer bewaren geeft
  dezelfde tekst; wat elkaar aanwijst, blijft aan elkaar vast), en de proef met opslaan in de speeltest
  (`npm run speeltest -- braaf --zaad 1 --opslaan`): de speler slaat via het menu op, de bladzijde herlaadt, hij
  gaat verder met Verder, en het jaar moet aflopen als hetzelfde jaar zonder opslaan. **Gespeeld:** braaf,
  opgeslagen op 1 oogstmaand, en lui 60%, opgeslagen op 6 slachtmaand met volle kelders (`--opslaan 245`; daarna
  de heer, de soldaten, de winter en het zaaien): allebei precies hetzelfde jaar, gelijk tot de laatste letter
  (393 en 399 kB). Onderweg vond de proef vier dingen die in de spelstaat stonden maar alleen scherm zijn: het
  laatst getekende beeld van een wezen, de klok van de doorkijk, de muis, en de volgorde van de velden na het
  laden. Die gaan nu niet meer mee. En een gewoon jaar (braaf, zaad 1) liep op de nieuwe stand in alle 24
  onderdelen precies als op de stand van vóór vandaag. De speeltest klikt voortaan zelf Nieuw spel.
- 28 sep 2026 — **De naam op één plek** (dertiende sessie; vraag 8, Marcel: "De naam blijft aardschok voor nu.
  We maken later iets anders. Zorg dat we dat makkelijk door het hele spel kunnen aanpassen"). `T.NAAM` in
  `js/naam.js`, het eerste script van elke bladzijde: het tabblad van het spel en van het gereedschap (`{naam}`
  in de titel), de kop van `gereedschap/index.html` (`data-spelnaam`), de server en de meldingen in de console
  lezen hem daar. De sleutel van de opslag in de browser (`T.OPSLAG_SLEUTEL`) staat ernaast en verandert niet
  mee, zodat een nieuwe naam niemand zijn spel kost. `test/naam.test.cjs` bewaakt dat de naam nergens anders
  staat (`verpakken.md`, "De naam").
- 28 sep 2026 — **De speeltest op de stand van nu** (twaalfde sessie; punt 2 van de prioriteit, vraag 45,
  Marcel: "A ja B ja C ja D ja"). `npm run speeltest` speelt het gehucht een jaar in een onzichtbare browser,
  met vier spelers in code (braaf, lui 30%, lui 60%, slim), elk met zaad 1 tot en met 3
  (`gereedschap/speeltest/`: `speeltest.cjs` draait de jaren, `speler.js` speelt in de bladzijde,
  `samenvatting.cjs` maakt de tabellen in `uit/samenvatting.md`). De speler klikt zoals een mens
  (`T.handelingVerkennen`) en drukt op de knoppen van de vensters, dus de getuigen en wat de inner ziet
  tellen zoals in het spel; een luisteraar op de regels schrijft op wat er gebeurt, zonder iets te
  veranderen. Hetzelfde zaad geeft precies hetzelfde jaar. De uitslag van twaalf jaren staat in
  `speelbaar.md`, "De speeltest van 28 sep"; wat nu bij te stellen is, in vraag 46; drie gaten in de regels in
  `opmerkingen.md`.
- 28 sep 2026 — **De winter zichtbaar** (elfde sessie; punt 1 van de prioriteit, vraag 44, Marcel: "A ja B
  ja C ja"). Op 1 herfstmaand en 1 slachtmaand zegt het dorp of het hout en het eten de winter halen,
  naar wat er ligt en wat er de laatste dag bijkwam, en zo niet, wat helpt: "Over drie maanden is het
  winter. Het hout haalt 33 van de 90 dagen: een houthakker hakt 2 hout per dag. Het eten haalt de
  winter." In de winter zegt het één keer "Het hout is over 15 dagen op, en de winter duurt nog 79
  dagen", uit dezelfde regel als het hooi (`T.haaltDeWinter` en `T.raaktOp` in `js/behoeften.js`; de
  lengte van een winter uit `T.periodeVanaf` in `js/tijd.js`). Het hout staat rood in de balk als het
  de winter niet haalt, met bij de muis voor hoeveel dagen, en de tevredenheid mist dan "brandhout voor
  de winter". Wie sterft, sterft van de kou, de honger of allebei, en het bericht zegt het ("De kou is
  hard, want het hout is op: de oude Folkert is gestorven."). Het eten rekent met graan, kaas, vlees, de
  melk die nog komt en de soldaten van de heer (`T.soldatenEten`). Onderweg gerepareerd: vlees telde niet
  mee als het dorp keek of er eten was (`T.berekenTevredenheid`), terwijl het wel gegeten werd. Een jaar
  in een script, zonder dat de schout iets doet: de drie waarschuwingen komen, en daarna sterven er
  zeventien van de kou; met een houthakker vanaf herfstmaand zegt 1 slachtmaand dat het hout de winter
  haalt, en sterft er niemand. In de browser nagekeken: het rode hout, de tekst bij de muis, en het
  bericht op 1 herfstmaand. `npm test`: 550/550.
- 27 sep 2026 — **De kern, stuk 2: de inner bespelen** (negende sessie; punt 4, vraag 42, Marcel: "Ja ab
  goed zo"). Zijn bezoek duurt tot zonsondergang (`T.werkInnerBij`, `js/inner.js`), niet meer 90 stappen.
  Afleiden: wie met hem praat, houdt hem op terwijl de dag doorloopt, drie uur per bezoek; staat de schout
  stil naast hem, dan wacht hij een half uur en telt hij daarna zelf verder. Omkopen: in zijn gesprek
  geef je 5, 10 of 20 goud (`doe: { omkopen }`, `T.koopInnerOm`); per 5 goud schrijft hij een tiende
  minder op, tot de helft (`T.innerKorting`, `T.maakRapport`); een op de vijf keer hoort de heer het, en
  dan telt het geschenk als goud in de kist (`T.eisVanDeHeer`) en groeit de argwaan. Zijn gesprek kreeg
  een praatje over het kasteel. `npm test`: 537/537.
- 27 sep 2026 — **De kern, stuk 1: de soldaten zoeken altijd** (negende sessie; punt 4, vraag 41, Marcel:
  "A ja B ja C ja"). Onder de grens van de argwaan zoeken de soldaten op Sint-Maarten op twee of drie
  plekken (`js/doorzoeken.js`): ze lopen met de schout mee en doorzoeken wat zijn route vlak passeert; na
  twee uur bij hem kiezen ze zelf, zijn eigen kelder eerst; zo vaak als zijn argwaan wijst de heer ze
  aan; gaat hij weg voor ze klaar zijn, dan doorzoeken ze de rest nog. Vooraf opgeruimd: één rechthoek
  per gebouw (`T.voetVanGebouw`), meelopen gedeeld met de inner (`T.loopNaastDeSchout`), en plek voor
  plek zoeken (`T.zoekOpPlek`). `npm test`: 533/533.
- 27 sep 2026 — **Het zichtveld, stuk 2: wat een getuige doet** (negende sessie; punt 3, vraag 40,
  Marcel: "Doorzetten"). Zag een roddelaar je iets wegzetten of terughalen, dan vertelt hij het de
  eerstvolgende avond dat hij in de herberg zit (`T.getuigenVertellen`, `js/zien.js`): de soldaten
  vinden het op die plek dan twee keer zo makkelijk, tot je hem leeghaalt (`g.verteldDoor`,
  `js/verstoppen.js`), en de herbergierster vertelt het je de volgende dag. Wie in de herberg vertelt, is
  één vraag voor de kelder van de roddelaar en voor wat hij zag (`T.vertelInDeHerberg`). In de
  spelregels: een getuige meteen zien, of pas later. Daarmee is punt 3 af. `npm test`: 527/527.
- 27 sep 2026 — **Een jaar gespeeld, en een voorstel voor speelbaar** (tiende sessie; vraag 33 en 8).
  Een agent speelde het gehucht drie keer een jaar in de browser (`Spel.debug.stap`, twee minuten per
  jaar), zonder iets bij te stellen: alles geven, 30% en 60% verstoppen. Wat opviel, staat in
  `speelbaar.md` en `opmerkingen.md`, met grafieken op de pagina "Een jaar in het gehucht". Daarbij het
  voorstel voor een proefversie van één jaar (vraag 33a tot en met 33d) en acht namen (`verpakken.md`).
- 27 sep 2026 — **Eén laadlijst voor de toetsen** (tiende sessie; vraag 25, E, Marcel koos het vóór zijn
  vlucht). Elke toets laadt het spel zoals het draait: de scripts uit `index.html`, in die volgorde,
  zonder wat alleen scherm is (`test/laad.cjs`); een toets van het gereedschap laadt wat zijn bladzijde
  laadt. Twaalf toetsen vielen om en lieten zien dat ze een ander spel toetsten dan er draait: de boeren
  maaiden er om middernacht, de kelder van de roddelaar was riskant zonder dat ze iets verteld had, twee
  spellen hadden dezelfde boeren, een huis groeide naar een geschatte voet, en een werkplaats werkte op
  volle kracht zonder eten. Aan het spel veranderde niets. Daarna gingen ruim honderd bewakers weg die er
  alleen voor de toetsen waren (`T.x && T.x(...)` en dergelijke), met hun commentaar; 23 blijven, want
  `gereedschap/wereld.html` laadt een deel van het spel. `npm test`: 523/523, met de controle op de
  bosvijanden en de laadlijst zelf.
- 27 sep 2026 — **Het zichtveld, stuk 1** (negende sessie; punt 3, vraag 40, Marcel: "A ja B ja C ja D
  ja"). Wie buiten is, ziet de schout als hij dichtbij genoeg is en er niets tussen staat: overdag acht
  tegels, 's nachts twee, in het licht van een lantaarn of de herberg zes (`js/zien.js`, `T.zichtOp`,
  `T.getuigenVan`). Het licht staat op één plek (`T.lichtBronnen`), en er brandt 's avonds een lantaarn
  bij de put. Wie de schout iets ziet wegzetten of terughalen, is getuige (`T.werdGezien`): een oogje
  boven zijn hoofd, een bericht, en de plek onthoudt het (`g.getuigen`). Het venster van de plek zegt
  vooraf wie je ziet en staat op een breed scherm opzij. `npm test`: 522/522.
- 27 sep 2026 — **De herberg, stuk 3: groter, aan het plein, en de ramen branden** (negende sessie;
  vraag 39, Marcel: "Prima" en "Ja idd"). De herberg is een T van vakwerk onder riet, acht bij elf tegels,
  met de deur midden op de lange kant, naar het plein; hij staat aan de westkant ervan, en de lege hut
  staat nu in de oude hoek. De huizenbouwer geeft van elk huis door waar zijn ramen zitten (`ramen` in
  `tegels.json`, per raam zijn ruitjes); 's avonds branden die van de herberg, met in zoveel ramen als er
  gasten zijn een schim. Wat ervoor staat, dekt ze af: na de herberg gaat er een gat in het doek, en dat
  wordt na de nacht licht (`brandendeRamen` in `js/tekenen.js`). Daarmee is punt 2 af. `npm test`:
  513/513.
- 27 sep 2026 — **De herberg, stuk 2: er wordt gepraat** (negende sessie; vraag 38, Marcel koos B). De
  roddelaar vertelt in de herberg wat er in zijn kelder ligt: pas dan vinden de soldaten het met
  Sint-Maarten twee keer zo makkelijk (`g.verteld`, `js/verstoppen.js`). De herbergierster vertelt de
  volgende dag wie er aan de tap zat en wie te veel zei (haar gesprek, met `{gisteravond}` en
  `{roddelaar}`: een zin kan nu iets uit het spel noemen, `T.GESPREK_WOORDEN`). De marskramer logeert er:
  's avonds en 's nachts in de herberg, overdag bij zijn waar. `npm test`: 512/512.
- 27 sep 2026 — **De herberg, stuk 1** (negende sessie; punt 2, vraag 35 tot en met 37). De herberg staat
  vanaf het begin in het gehucht, in de hoek tussen het plein en de weg, in een eigen tekening van de
  huizenbouwer (`herberg1`: vakwerk onder riet, trede 2; de oude was van steen onder pannen). De
  herbergierster woont er alleen (26 mensen) en brouwt van graan tot er dertig bier ligt. 's Avonds gaan
  volwassenen erheen naar karakter, seizoen en looptijd, niet meer dan er bier is; ze gaan naar binnen
  en lopen bij bedtijd naar hun eigen deur. Elke nacht gaat het bier op, en wie er die week was, maakt
  het dorp tevredener. De lantaarn brandt 's avonds. `js/herberg.js`, `test/herberg.test.cjs`.
  `npm test`: 507/507.
- 27 sep 2026 — **De kelders telden het karakter niet** (negende sessie). `js/verstoppen.js` en
  `js/bewoners.js` hadden `T.bewonerVan` en `T.overBewonerTekst` allebei, en het laatste bestand won:
  in het spel weigerde de vrome niet en hield de woekeraar niets. Nu heten die van het verstoppen
  `T.bewonerVanGebouw` en `T.overKelderTekst`, en laadt de toets ook `js/bewoners.js`.
- 26 sep 2026 — **Ronde 4b van de huizenbouwer** (achtste sessie; punt 1, en ronde 4 van "Tegelijk: de
  huizenbouwer"). Marcel koos het plan ("1 en 2 in spel, rest op plaat"; de schout "Vakwerk op stenen
  voet"). De huizen van de huizenbouwer staan op een eigen vel, `tegels/huizen.png`, elk met een vaste
  opgave in `gereedschap/pixelart/huizen.cjs`: vier echte hutten (laag, vlechtwerk en leem, zonder
  schoorsteen), zes huizen van vakwerk onder riet (met een schoorsteen van leem), vijf boerderijen en
  het huis van de schout. Wat het plan liet zien: draaien hoefde niet (de bouwer kan alle acht standen),
  maar een deur aan de kant die je niet ziet ontbrak, en het spel wist niet waar een deur zit. Nu meet
  elke tekening haar voet en de tegel voor haar deur, en daar gaan de bewoners heen (`T.deurVan`). De
  bouwfasen worden uit het huis zelf gesneden. Het gehucht gebruikt de nieuwe huizen, elk in het vak van
  het vorige: Gerrit en Trijn staan met hun achterkant naar je toe en hun deur naar het plein. De ladder
  staat op een plaat (`node huis-sdf-export.cjs ladder`). `npm test`: 498/498.
- 26 sep 2026 — **De doorkijk** (zevende sessie; vraag 31 en 34). Wie je hoort te zien, zie je door een
  boom of een huis heen: de schout, wie je spreekt, wie vecht, en nu ook de bezoekers (de heer, de
  marskramer, de inner, de soldaten); door een huis ook iedereen op het plein, door een boom niet (anders
  zitten de eiken vol gaten). In de spelregels twee keuzes: het kijkvenster (standaard) of het raster, om
  de andere pixel; en of het plein meetelt (standaard wel). Een proef met een huis vóór het plein liet
  eerst zien dat het raster in het oog toch mengt; Marcel wilde het toch als keuze ("Raster ook als
  keuze"). De doorkijk staat in een eigen bestand, `js/doorkijk.js`, met zijn getallen in één blok en in
  de werkbank; het eerste stuk dat uit `tekenen.js` ging (vraag 25, D). Welke manier de standaard wordt,
  kiest Marcel in het spel. `npm test`: 491/491.
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
