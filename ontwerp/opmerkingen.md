# Opmerkingen om later na te lopen

Marcel (25 sep 2026): "Notities van alle opmerkingen maken, kunnen we later revisiten." Hier staat
alles wat onderweg opviel en nog niet af is: wat ruw is, wat niet helemaal goed staat, en wat
Claude erbij bedacht zonder dat Marcel het al koos. Niets hiervan houdt het werk op.

Wie iets ziet, zet het erbij, met een datum; wie iets oplost, haalt het weg (`git log` bewaart
het). De keuzes die op Marcel wachten, staan in de werklijst onder "Wacht op Marcel".

## Het spel

- **Een toets die soms faalt** (4 okt, dertigste sessie, gezien bij vraag 114, stap 1, die geen spelregel raakt):
  "in het gehucht is iedereen 's nachts binnen, overdag waar hij hoort, en 's avonds thuis" (`test/bewoners.test.cjs`)
  faalde één keer op drie in de hele reeks (`npm test`), en slaagde alleen achttien keer op achttien. Het gehucht van
  die toets speelt met ongezaaid toeval (`Math.random`: het dwalen, het lot), en de toets laat er hooguit één naast zijn
  plek toe. Na te lopen: een vast zaad voor die toets, of zien wie er dan niet thuis is.

- **Het praatje, wat er nog niet is** (4 okt, zevenentwintigste sessie; vraag 120). Na te lopen:
  - Lopen is langzaam tegenover de dag: van een boerderij aan de rand van het gehucht naar het plein is anderhalf uur
    (een dag duurt 300 seconden, een mens loopt 1,35 tegel per seconde). Wie 's avonds naar de herberg gaat, loopt zo de
    halve avond, en in een stad van 200 op 160 bij 160 nog meer.
  - Wie langs wil, loopt om een praatje heen; staat het op een smal pad, dan gaat er een even opzij. Zo houdt een
    praatje het verkeer niet op, maar een praatje in een deur of op een brug is nog niet te zien geweest.
  - Meet de snelheid voor en na achter elkaar: de eerste nulmeting (1,1 ms per beeld bij 200 mensen) lag een derde lager
    dan dezelfde meting een uur later (1,4 ms). Achter elkaar gemeten kostte het praatje niets meetbaars.

- **De ondernemers, wat er nog niet is** (3 okt, vijfentwintigste sessie; vraag 104). Ideeën van Claude, niet gekozen:
  - Een omgekochte inner (`T.koopInnerOm`) schrijft minder op, maar wat hij zag, onthoudt hij: de wapenmaker staat in zijn
    rapport, en de heer verzegelt hem toch. Een idee: wie de inner genoeg geeft, laat hem de wapenmaker vergeten. Dan
    wordt omkopen de manier om met een wapenmaker te leven.
  - De wapenmaker maakt wapens van hout en ijzer, en ijzer komt van de marskramer (of een ertsgraver). Zonder ijzer staat
    hij stil, en alleen de muis op het gebouw zegt het; de raad en het rapport zwijgen. Een regel in de raad ("De
    wapenmaker heeft geen ijzer: de marskramer verkoopt het") zou de keten laten zien zonder dat je hem bouwt.
  - Wat de heer verzegelt, blijft verzegeld. Een vervolg: de meester breekt het zegel (een voorval: "Mag ik weer
    smeden?"), met argwaan als prijs, of de heer haalt het zegel na een jaar weg.
  - Met twee herbergen weet de herbergierster alleen wie er bij háár zat. De tweede herbergier heeft nog geen gesprek; een
    eigen gesprek met zijn gasten en zijn roddel maakt van de twee herbergen twee bronnen.

- **Het eind, wat er nog niet is** (3 okt, vijfentwintigste sessie; vraag 101, 2e). Na te lopen:
  - Wie wint, viert het grote feest op de dag zelf (`T.vierVandaag`). Stond er al een feest klaar voor later (een
    oogstfeest voor morgen), dan gaat dat verloren. Zeldzaam; na te lopen als het voorkomt.
  - Een nieuw gezin in een hut is een keuter, en dan is niet iedereen meer in de hoogste stand: de teller begint opnieuw.
    Wie wil winnen, moet de groei dus een jaar stilzetten (geen erf meer aanwijzen). Dat is een keuze die het spel nergens
    uitlegt; de raad zou het kunnen zeggen als het doel "een jaar gelukkig" is.
  - Het jaarverslag en het eindscherm zijn nog in de stijl van vóór de schrijftafel (vraag 98, C); ze worden papier met de
    rest van de ui.
  - Het eindscherm komt 's avonds of bij het feest. Wie op reis is (de spelregel Land), krijgt het die avond over de kaart
    van het land, zonder het feest te zien.
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
- **De heer als eerste tegenstander** (1 okt, eenentwintigste sessie; een idee van Claude, niet gekozen). Met de
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

## Het beeld

**De tegelvellen worden groot** (26 sep, achtste sessie, bij ronde 4b). Een vel heeft vakken van
gelijke maat, zo groot als de grootste tekening, en een vast aantal (zodat de tegelnummers blijven).
De browser pakt een vel helemaal uit in het geheugen: `gebouwen.png` (5184×7584, met 27 van de 96
vakken gevuld) kost zo'n 157 MB, `huizen.png` (5296×3028) zo'n 64 MB, en `bouwfasen.png` (8170×7187,
vijf fases per gebouw, sinds ronde 4b in rijen, want één rij per gebouw werd 15.593 pixels hoog) zo'n
235 MB. Voor een stad met honderden huizen is dat te veel. Voorstel: de vellen inpakken,
met per tekening een eigen uitsnede en een eigen anker, zoals `bouwfasen.json` dat al doet. Dat raakt
de vorm van `tegels.json`, `js/sprites.js` en hoe Tiled een vel leest; vóór het verpakken (punt 18).
**Opgelost op 4 okt** (werklijst vraag 114, 2a; `beeld.md`, "De vellen zijn ingepakt"): bij het begin zo'n 210 MB in
plaats van 900, en de bouwfasen per gebouw, pas als er een in aanbouw staat.

**Een vel kan de browser weer weggooien** (4 okt, achtentwintigste sessie, bij het inpakken; vraag 114, 2a). Een
browser houdt een uitgepakt vel niet altijd vast: is het geheugen krap, of is het een tijd niet getekend (Firefox), dan
pakt hij het opnieuw uit zodra het weer in beeld komt, en dat is een hapering. Ingepakt is dat veel kleiner dan het was.
Helpt het niet genoeg (de meter in Firefox, vraag 113, a), dan kan het spel elk vel als ImageBitmap houden
(`createImageBitmap`): dan blijft het uitgepakt, maar kost het die 210 MB ook altijd. `img.decode()` bij het laden werkt
niet: dat wacht in Chromium tot de bladzijde een beeld tekent, en in een verborgen tabblad komt dat niet.

**Een tekening die niet meer op de kaart staat, blijft geladen** (4 okt, dertigste sessie; vraag 114, stap 1). Een huis
dat doorgroeit, laadt zijn nieuwe tekening, maar de oude blijft in de browser tot de bladzijde herlaadt. In één spel
is dat begrensd (één bouwstijl, stap 2: hooguit een paar tientallen tekeningen van een MB); wordt het toch te veel, dan
kan het spel een tekening weer vrijgeven als hij een tijd nergens meer staat.

**De wereldbouwer tekent op ware grootte geen huizen** (4 okt, dertigste sessie, gezien bij vraag 114, stap 1; was er
al vóór die stap). `gereedschap/wereld.html` heeft geen kalender, en `T.tekenScene` (`js/tekenen.js`, de akkers:
`T.datumVanDag(S.kalender.dag)`) valt daar elk beeld om, na de grond en vóór de voorwerpen: "Cannot read properties
of undefined (reading 'dag')". Ver uitgezoomd tekent het gereedschap zijn eigen plattegrond, en dan is er niets aan de
hand. Een regel: de akkers alleen met een kalender, of een vaste datum in het gereedschap.

**De grond tekent helemaal opnieuw als er een paadje verandert** (3 okt, vijfentwintigste sessie; vraag 108, b,
`js/paden.js`). De paadjes liggen in de buffer van de grond (`werkGrondBij` in `js/tekenen.js`), en die wordt helemaal
opnieuw getekend als er een bij komt of verdwijnt: hooguit één keer per speldag, 's nachts, en bij een nieuw gebouw.
Gemeten zonder videokaart kost dat één keer 13 ms bij het volgen, 50 ms in het overzicht op 0,5 en 70 ms op 0,35. Op
30× is dat in het overzicht een hapering om de tien seconden. Voorstel als het opvalt: alleen de tegels opnieuw tekenen
die veranderden (elke grondtegel past precies in zijn ruit), of de verandering meenemen als de camera toch al schuift.

**De doorkijk** (26 sep, zevende sessie; `beeld.md`, "Doorkijk"):
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

## Voorstellen van Claude die nog niet gekozen zijn

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
- **Een toets die soms omvalt** (4 okt, sessie van het licht, vraag 125). Van acht keer `npm test` op dezelfde stand
  (commit 6cb27a0) viel één keer één toets om (909 van 910); welke, liet de uitvoer niet zien, en de zeven keer erna
  was alles groen. Er hangt dus ergens een toets van het toeval of de klok af. Draai bij twijfel
  `npm test > uit.log` en kijk naar `not ok`, zodat de naam bewaard blijft als het weer gebeurt.
  **Gevonden (later die dag):** het is "in het gehucht is iedereen 's nachts binnen, overdag waar hij hoort, en 's avonds
  thuis" (`test/bewoners.test.cjs`): om elf uur staan er soms twee mensen (Aleid, Geertje) niet waar ze horen, waar de
  toets er hooguit één toestaat. Ook op `main` zonder het licht: 2 van 30 keer, met het licht 1 van 30. Er speelt dus
  ergens toeval mee dat niet uit het zaad komt (het lopen of de praatjes van vraag 119 en 120?). Nog uitzoeken.
