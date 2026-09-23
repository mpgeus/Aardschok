# Verhaal

## Besloten

- ~~**Opening** (19 sep 2026). Veertig jaar geleden sloot de tovenaar iets op en ging weg; Wim
  bleef en veegde elke dag de trap.~~ **Vervangen** op 20 sep 2026 door de opening met de levende
  meester (zie hieronder). Wat blijft: de aardschok van de titel maakte het ding boven wakker.
- **De held** is een tovenaar van 84. Zijn leeftijd is zijn levensbalk (de kernregel, zie
  `CLAUDE.md`). Aan het eind telt hoe oud hij boven aankomt.
- **Toon.** Weemoedig met een knipoog, nooit grappig ten koste van de ernst van de klim.
- **Waar de teksten staan.** De gesprekken zijn gegevens (`js/gesprekken.js`), de regels eromheen
  staan los (`js/gesprek.js`) en het venster in `js/dialoog.js`. De openingstekst staat in
  `js/main.js`.
- **Gereedschap voor gesprekken** (Marcel, 20 sep 2026, nog te bouwen). Zoals Tiled voor de
  kaarten: een pagina die de ontwikkelserver serveert, met de knopen van een persoon als boom,
  voorwaarden uit een keuzelijst in plaats van uit het hoofd, en een proefgesprek waarin je de
  leeftijd en de vlaggen zet en ziet welke regel wint. Plus controle op keuzes die nergens heen
  wijzen, knopen die niemand bereikt, en tekst die niet in het venster past. Opslaan schrijft
  `js/gesprekken.js` terug. **Het proefgesprek gebruikt `js/gesprek.js` zelf,** nooit een eigen
  kopie van de regels — anders liegt het gereedschap vroeg of laat, en dat is erger dan geen
  gereedschap. **Gebouwd** (20 sep 2026): `gereedschap/gesprekken.html`.
- **Quests in hetzelfde gereedschap** (Marcel, 21 sep 2026). Een quest en een gesprek zijn niet los
  te zien: een quest begint in een gesprek, loopt via vlaggen, en eindigt in een gesprek. Daarom
  één verhaaleditor voor allebei, met als grootste winst het proefgesprek per queststand: "wat zegt
  de herbergierster als de bakkersquest halverwege is?" De volgorde ligt vast door dezelfde regel
  als bij de gesprekken: **eerst het questsysteem in het spel, met toetsen, en pas dan het
  gereedschap erop**, want het gereedschap moet de regels van het spel zelf gebruiken.
  **Gebouwd** (22 sep 2026): `gereedschap/quests.html`, met `quests-tool.js`. Eén afwijking van
  het plan: het werd een **tweede bladzijde** naast `gesprekken.html`, niet één scherm. Dat
  gereedschap is een afgesloten geheel van achthonderd regels, en er dwars doorheen opereren kost
  meer dan het oplevert; de twee staan bovenin aan elkaar geknoopt. De eis "alles op één plek"
  wordt gehaald vanuit de quest gezien: de questbladzijde toont de fasen, wat iedereen in het dorp
  per fase zegt, welke antwoorden welke weg nemen, en waar de dingen in Tiled liggen. Alleen de
  gesprékstekst schrijf je nog op de andere bladzijde. Als dat in de praktijk schuurt, is het
  samenvoegen alsnog te doen — maar dan weten we waarom.
- **Een gesprek schrijf je als een script, niet als een formulier** (Marcel, 22 sep 2026: "totaal
  onlogisch, dat moet echt beter"). Wat er stond: honderdzeven invoervelden in één kolom voor één
  persoon; een boom links die knoopnamen, antwoorden en "komt hierboven al voor" door elkaar zette
  en vijftien regels diep nestte; de velden van de persoon en die van een knoop in hetzelfde
  paneel zonder scheiding; velden die over de opslag gingen in plaats van over het gesprek
  ("Opmerking — blijft alleen bewaard boven deze knoop in het bestand"); en de zin die iemand zegt
  even zwaar opgemaakt als de voorwaarde ernaast. Marcel wees twee dingen aan als het ergste: je
  ziet niet hoe het gesprek loopt, en het is een formulier in plaats van tekst.

  **Wat ervoor in de plaats kwam:** het hele gesprek op één bladzijde, van de start naar beneden,
  waarin een knoop eruitziet als een scène — wat hij zegt, en wat jij kunt antwoorden. De zin is
  tekst (geen rand tot je erin klikt, en hij groeit mee); de voorwaarde staat er klein achter in
  gewone taal ("zolang niet meesterDood", "als je sleutel hebt") en klapt pas open als je hem
  aanraakt. Waar een antwoord heen gaat, is een link: zo loop je door het gesprek zoals een speler
  dat doet. Links geen uitgerolde boom meer maar een lijst knopen met hun eerste zin eronder en
  wie ernaar verwijst. Het proefgesprek en de controle bleven, want die deden het wél.

  De regel eronder: **wat je alleen nodig hebt als je ergens mee bezig bent, is er pas als je
  erbij bent.** De knoppen om een regel te verplaatsen, de keuzelijst om een antwoord te verzetten,
  het formulier achter een voorwaarde — ze houden hun plek, maar ze staan er niet.

- **Je kijkt door één situatie tegelijk** (Marcel, 22 sep 2026: "het is nogsteeds niet intuïtief…
  rommelig, onduidelijk, ik weet niet wat ik hier mee moet"). Het script hierboven loste de opmaak
  op maar niet het probleem, en het probleem zat een laag dieper: het scherm liet de **gegevens**
  zien, niet het gesprek. Wim heeft vijf versies van zijn openingszin — de speler hoort er altijd
  precies één — en ze stonden alle vijf onder elkaar, alsof hij ze achter elkaar zei. Daaronder
  elf antwoorden, waarvan er in geen enkele toestand meer dan vijf tegelijk te zien zijn. Plus
  een knopenlijst met technische namen en een kolom "NU VERBORGEN": drie weergaven van hetzelfde,
  en geen ervan was het gesprek.

  Marcel zei wat hij wil, en dat is de maat: *"Ik wil gewoon character selecteren. Gesprek maken.
  Aantal zinnen met reacties. En eventuele hooks eraan zetten."*

  **Eén keuze draagt de rest.** Bovenin staan de situaties; je klikt er een, en het gesprek wordt
  getekend zoals het dán loopt: één zin per knoop, alleen de antwoorden die je dan echt kunt
  geven, ingesprongen zoals een gesprek loopt. Wat in deze situatie niet klinkt, zakt naar onderen
  met de situatie erachter waarin het wél klinkt. Daaruit volgt de rest:

  - **Een situatie schrijf je in dezelfde woorden als een voorwaarde** ("meesterDood is gezet,
    sleutel in je tas"). Zo is er één woordenlijst voor het hele scherm en kan dezelfde editor
    hem bewerken. Ze staan bij de persoon (`situaties` in `js/gesprekken.js`); het spel leest ze
    nooit. Marcel benoemt ze zelf — een situatie is een moment in het verhaal ("Na zijn dood",
    "Sleutel in de hand"), en dat weet alleen hij.
  - **De fasen van een quest zíjn situaties** en staan er vanzelf bij bij wie hem geeft. Daar
    raken gesprek en quest elkaar, en daarom staat de quest op dezelfde bladzijde: zijn fasen,
    doelen, meldingen en wegen, met erbij welk antwoord uit dit gesprek welke weg neemt. Marcel,
    22 sep: "een quest kan ook aan een dialoog hangen, dus ze horen bij elkaar."
  - **Een antwoord springt in als het gesprek doorloopt** (één vraag komt op die zin uit) en
    krijgt een eigen blok als er meer op uitkomen — Wims "Nog iets anders", waar vijf vragen op
    uitkomen, is een plek waar je steeds terugkomt en geen vervolg. Zo wordt het nooit acht
    niveaus diep, en heet een stuk gesprek naar zijn eerste zin in plaats van naar `beursGeweigerd`.
  - **Een haakje is een keuzelijst, geen tekstvak.** Een gevolg deed tot nu toe alleen vlaggen,
    terwijl een antwoord in het spel al goud gaf en quests startte; die waren dus alleen in de
    code te bewerken. Nu staat dezelfde lijst in het scherm als in het bestand, en kies je een
    quest, een fase en een weg uit een lijst in plaats van `bakker:zoeken` te typen.

  Wat weg is: de knopenlijst, de kolom "NU VERBORGEN" en de vlaggenvinkjes. "Proberen" nam het
  proefgesprek over en speelt het gewoon af vanaf de situatie die bovenin staat, met de regels uit
  `js/gesprek.js` zelf.

  **En een toets eromheen** (`test/situaties.test.cjs`): elke zin met een voorwaarde moet in
  minstens één situatie wínnen, en elk antwoord met een voorwaarde ergens te zien zijn. Een zin
  die nergens klinkt is bijna altijd een vergeten situatie, en de schrijver zegt dat wel op het
  scherm — maar alleen als je die persoon toevallig openslaat.

- **De tutorial legt uit in plaats van te spelen** (Marcel, 22 sep 2026: "veel te cringe"). Wat
  eraan gedaan is en waarom, staat hieronder bij "De opening".

- **Een quest moet makkelijk te bouwen zijn** (Marcel, 21 sep 2026). Dat is de eis waar het
  gereedschap op wordt afgerekend. Wat dat vraagt:
  - **vormen om mee te beginnen.** De meeste quests zijn één van een handvol vormen: haal iets,
    breng iets, ruim iets op, maak een keuze, praat met iemand. Kies een vorm en je hebt een
    werkend geraamte met fasen, dat je alleen nog invult;
  - **alles op één plek:** de quest zelf, de gesprekken die ernaar verwijzen, en de beloning — niet
    drie bestanden die je bij elkaar moet zoeken;
  - **een proef per fase:** zet de quest op "halverwege" en zie wat iedereen in het dorp zegt;
  - **controle die meedenkt:** een quest die nooit af kan (het voorwerp ligt nergens in de wereld,
    de gever bestaat niet), een beloning die nooit gegeven wordt, en — onze eigen regel — een quest
    met maar één manier om hem op te lossen. Het gereedschap telt de routes en waarschuwt onder de
    drie;
  - **de wereld erbij:** waar liggen de dingen die de quest nodig heeft? Een eigenschap `quest` op
    een object in Tiled koppelt het, en het gereedschap laat zien op welke kaart het ligt.

  **Stand (22 sep 2026).** Alle vijf zitten erin, met twee gaten die erbij horen te staan:

  - **vormen:** drie van de vijf (haal iets, ruim iets op, maak een keuze). "Breng iets" en "praat
    met iemand" nog niet; die komen erbij als we ze nodig hebben, want een vorm verzinnen zonder
    quest die hem gebruikt is gokken. Elke vorm levert meteen iets op dat de toets van drie
    antwoorden haalt — dat is het punt van een vorm.
  - **een proef per fase** doet er iets bij dat niet gevraagd was en dat het nuttigst blijkt: naast
    wat iedereen zegt, staat erbij **wie het merkt**. Het gereedschap vergelijkt de regel die wint
    met de regel die zou winnen als de quest niet liep, en zet een merkje bij wie anders praat. Zo
    zie je in één oogopslag of het dorp je quest eigenlijk wel opvalt.
  - **controle** telt de routes (`T.keurQuests`, dezelfde als `npm test` draait) en kijkt
    daarnaast: begint een gesprek deze quest wel, bestaat de gever, is er een weg die nergens
    genomen wordt, wacht een weg op iets wat niets in de wereld of in een gesprek geeft, noemt een
    Tiled-object een fase die niet bestaat, en staat een raakpunt op geen enkele kaart.
  - **nog niet:** raakpunten (`T.RAAKPUNTEN`) worden wel bewaard bij het opslaan en gecontroleerd,
    maar je kunt ze nog niet in een formulier bewerken; dat gaat met de hand in `js/quests.js`.

## Personen

- **De tovenaar (84).** Blauw gewaad, hoed met ster, witte baard, staf met gloeiende bol. Wordt
  krommer met de jaren; de punt van zijn hoed zakt om.
- **Wim** (besloten, Marcel 21 sep 2026). **De knecht van de meester.** Hij heeft zijn hele leven
  voor hem gewerkt, en je erft hem samen met de toren. Nu zelf grijs; schort, pet, brilletje,
  bezem. Hij rouwt om de meester als die sterft, en is daarna de enige die nog weet hoe het
  vroeger was. Hij zegt "meester" — eerst tegen hem, en na de dood, aarzelend, tegen jou.
- **De oude meester (tegen de honderd).** Jouw leermeester, van wie je de toren erft, en die de
  tutorial doet. Krijgt een eigen sprite (Marcel, 20 sep 2026): dezelfde school als de tovenaar,
  maar veertig jaar verder. Voorstel: een wijnrood gewaad in plaats van blauw, een hoed waarvan de
  punt helemaal is omgezakt, een baard tot op zijn gordel, en een kromme staf met een steen in een
  klauw in plaats van een gladde bol. Die staf erf je na zijn dood, en die ruil je later met goud
  in voor een betere.
- **Monsters tot nu toe.** Een slijmkruiper in de voorraadkamer, en een skelet met een zwaard bij
  de trap ("het staat daar maar, alsof het op iemand wacht").

## De opening: de meester doet de tutorial en sterft (Marcel, 20 sep 2026)

Het spel begint bij de toren, met de meester er nog. Hij leeft, hij doet de tutorial, en door een
stuk verhaal gaat hij dood. Daarna neem jij het over. Daarmee is ook de vraag beantwoord of de
toren geërfd is: ja, en je krijgt hem niet in een brief maar voor je ogen.

Gekozen (voorstel van Claude, Marcel op 20 sep 2026: "ja heel goed idee"): **hij sterft aan de
kernregel zelf.** Hij is tegen de honderd. Terwijl hij je leert toveren, kost elke spreuk hem een jaar, en
zie je zijn balk korter worden. Aan het eind is er nog één spreuk nodig, hij doet hem toch, en
dan is hij honderd. Zo heeft de speler de regel zien gebeuren in plaats van gelezen.

Wat de tutorial dan onderwijst, in de volgorde waarin het spel het nodig heeft: lopen en kijken,
slaan met de staf (kost niets), een vuurschicht (kost hem een jaar, en dat zie je), sluipen om
een gevecht te ontlopen, en een deur dichtgooien. De laatste les is de dood zelf.

Dit verandert het begin van de wereld: de speler start op het erf van de toren, niet in het
dorp. Het dorp komt na de dood van de meester, als er een reden is om erheen te gaan.

**Hij speelt met zijn leeftijd, zodat jij begrijpt dat het meetelt** (Marcel, 20 sep 2026). De
meester laat het getal boven zijn hoofd expres heen en weer gaan. Hij schiet een vuurschicht op
een oude ton en lacht erom: zevenennegentig wordt achtennegentig. Dan schept hij uit de fontein
en staat hij weer op zesennegentig, met zoiets als "zie je wel, het is maar een getal". Daarna
mept hij de ton kapot met de staf, en wijst erbij dat dat het enige is wat niets kost.

Zo leert de speler de hele afweging zonder uitlegscherm: magie kost jaren, de staf kost niets,
en er is maar één manier om jaren terug te krijgen. En daarmee hangt het geweer aan de muur. De
laatste slok uit de fontein staat aan het eind in de hal, en hij staat buiten bij zijn moestuin.
Hij haalt zijn honderdste met een spreuk die hij niet had hoeven doen, en dat is meteen de laatste
les: dit overkomt jou ook, als je te makkelijk tovert.

**De fontein houdt één slok over** (Marcel, 22 sep 2026: "In de fontein blijft 1 slok over. Dat
is die laatste slok."). Je schept een kom water voor de meester, en in de fontein blijft één slok
staan: de laatste. Die is van jou. Zo blijft "de fontein maakt één keer twee jaar jonger"
(`CLAUDE.md`) ook voor de speler waar, en zie je in de tutorial al waar hij staat.

**Weglopen mag** (Marcel, 22 sep 2026: "te lang wegblijven = meester is dood zonder dat je weet
waarom"). De meester houdt je niet vast, maar de middag gaat door zonder jou. Wie te lang
wegblijft, hoort hem eerst in de verte roepen, en vindt hem daarna dood terug bij zijn moestuin.
Wat er de trap af kwam, gebeurde terwijl je er niet was, en niemand legt het je uit. Dat past bij
een spel dat vrij is: de wereld wacht niet op je. In de toren ben je niet weg; daar doe je zijn
boodschappen.

**Wat de eerste speelbare versie verder koos** (22 sep 2026; Marcel had geen bezwaar): een ton in
plaats van een kraai (er is nog geen kraai om te tekenen, en de ton rijmt op de tweede, die jij
kapotslaat); wat de trap af komt, is een tweede skelet van dezelfde soort, niet het skelet dat in
het trappenhuis staat; een ton breekt met de staf, ook buiten een gevecht, en dat kost niets; de
deurles is een echt gevecht met de slijmkruiper achter de deur van de voorraadkamer; monsters op
het erf staan stil zolang de les loopt; en Escape slaat een hoofdstuk over, niet de hele tutorial
(een knop "Tutorial overslaan" hoort bij het titelscherm; zie het werklijstpunt over opslaan
en het titelscherm).

## Wat er boven zit, en waarom het los is (Marcel, 20 sep 2026)

De meester heeft het daar opgesloten — **en is het door ouderdom vergeten.** Jarenlang hield het
zich rustig, tot de aardschok het wakker maakte.

Daarmee is de kernregel ook de oorzaak van het verhaal, en niet alleen de inzet ervan. Ouderdom
is niet de vijand in de laatste akte maar de reden voor de eerste: het ding boven is los omdat
een man oud werd en vergat. Jij bent vierentachtig en moet erheen. Dat hoeft niemand uit te
leggen; de speler voelt het.

Wat dat oplost, en wat het betekent:

- de toren is geërfd én van de meester, zonder dat het botst: hij sloot het op, hij vergat het,
  hij laat het aan jou na;
- de meester weet aan het begin dus zelf niet wat er boven zit. Als hij het zich herinnert, is
  dat een moment in het verhaal, geen uitleg vooraf;
- Wim hoeft niet meer te kloppen met "veertig jaar wachten op zijn meester": hij is de knecht van
  de meester (besloten 21 sep 2026, zie Personen).

**De andere tovenaars.** De meester heeft contact met andere tovenaars, elk met een eigen toren en
een eigen probleem. Zij zijn de enigen die begrijpen waar hij het over heeft, en ze zijn allemaal
oud. Wat dat het spel geeft, staat in `wereld.md`.

## Waarom de verdiepingen gevaarlijk zijn: verzuurde nalatenschap (20 sep 2026)

Marcel vroeg hoe je verhalend verklaart dat er allerlei lastige verdiepingen zijn. Het goedkope
antwoord is "er zijn monsters ingetrokken"; dat werkt, maar het vertelt niets. Het antwoord dat we
nemen komt uit de opening zelf:

**Een toren van een tovenaar is een werkplaats, en de meester heeft veertig jaar lang dingen
begonnen en niet afgemaakt.** Een kweekkamer waar de planten nooit gestopt zijn met groeien. Een
bibliotheek waar de woorden van de bladzijden zijn gekropen. Een spiegelkamer waar een opgeroepen
gedaante nog staat te wachten tot iemand hem wegstuurt. Een alchemieverdieping waar iets al vier
decennia pruttelt.

**En magie veroudert slecht, net als alles in dit spel.** Een banspreuk die veertig jaar met rust
wordt gelaten, wordt wild. Een gedienstige geest die nooit is afgedankt, wordt iets anders. Dat is
het thema van het spel, toegepast op een gebouw: de tovenaar veroudert, de meester vergat, en de
magie die niemand onderhield is verzuurd.

Wat daar gratis uit komt:

- **een moeilijkheidsverloop met een reden.** Hoe hoger, hoe dichter bij het ding dat sinds de
  aardschok lekt. De bovenste verdiepingen zijn niet moeilijker omdat het einde nadert, maar omdat
  je dichter bij de bron zit;
- **verdiepingen die allemaal anders zijn** zonder dat het willekeurig voelt: elke verdieping is
  een ander experiment van dezelfde man;
- **je leert de meester kennen door zijn rommel.** Je klimt door zijn leven, en hij kan er zelf
  maar stukjes van navertellen — soms verkeerd, en dat merk je pas boven. Dat is een gespreksmiddel
  dat de hele klim meegaat.

Het verandert ook wat herstellen betekent: je bent geen bouwvakker, je ruimt de nalatenschap op van
iemand die te lang is doorgegaan. Dat past bij de toon: weemoedig, met een knipoog.

## De leerling (Marcel, 20 sep 2026)

"Ik wil ook nadenken over een leerling. Deze komt mogelijk voort uit een quest uit het dorp."

Hij staat al half in `wereld.md`: de jongen die speelt dat hij een held is, met een houten zwaard
en de pet van zijn vader, en die met je mee wil. Dat is de quest — een kind dat aandringt, ouders
die het niet zien zitten, en jij die weet wat het kost.

- **Hij is jouw spiegelbeeld.** Jong: veel actiepunten, zwakke magie. Jij oud: weinig beurten,
  spreuken als mokers. Samen dekken jullie elkaars gat, en dat is een ander gevecht dan alleen.
- **Hij draagt wat jij niet kunt** — maar hij komt alleen waar een trap staat. Dus hij is een réden
  om die trap te herstellen, geen manier om eromheen te werken (zie `toren.md`).
- **Hij onthoudt wat jij hem leert.** Jij gaat door ouderdom vergeten (`spreuken.md`); een spreuk
  doorgeven vóórdat je hem kwijtraakt is het thema van dit spel in één handeling. Jij verliest, hij
  houdt.
- **Hij is je getuige.** Verdort je bomen en trek je dieren leeg, dan staat hij ernaast. Een dorp
  dat je nakijkt is erg; een kind dat je ziet veranderen is erger.
- **Dezelfde drie remmen als bij de huurlingen,** anders vecht je nooit meer zelf: hij is zwak, hij
  kan echt dood, en hij komt niet waar geen trap is.
- **En hij maakt de estafette mogelijk:** word je honderd, dan neemt hij de toren over met alles
  wat jij herstelde nog overeind. Niet nodig, wel mogelijk. Nog niet besloten.

### Hij doet zijn moestuin, tot hij sterft (Marcel, 20 sep 2026)

"Misschien dat die zich bezighoudt met de moestuin. Oud en krakkemikkig. Tot hij sterft?"

De laatste grote tovenaar van zijn tijd, op zijn knieën tussen de bonenstaken. Iemand die iets
verschrikkelijks boven heeft opgesloten en het vergeten is, en nu wortels verbouwt. Dat is de toon
van dit spel in één beeld. De moestuin staat er al, op het erf.

**Het lost ook de tutorial op.** Iemand die stilstaat en uitlegt is een tutorial; een oude man die
doorwerkt terwijl hij praat is een scène. Hij legt niets uit, hij vraagt je dingen: hou dit eens
vast, haal eens water, doe die deur dicht want het tocht. Ondertussen zie je alles wat je moet
weten. Ook zijn demonstratie hoort daar: hij schiet een vuurschicht op de oude ton waar de kraaien
op zitten (97 wordt 98, en hij lacht erom), drinkt de laatste slok uit de fontein en staat weer op
96.

**Hij sterft bij zijn moestuin,** met aarde aan zijn handen — niet in een kamer met een boek. Dat
is het beeld dat blijft hangen.

**En dan is die tuin van jou.** Je erft niet alleen een kapotte toren en een probleem, maar ook
zijn tuin: onderhouden of laten verwilderen. Kies je het duistere pad en laat je alles om je toren
verdorren, dan verdort die tuin mee. Dat hoeft niemand te zeggen.

**Het vak linksboven is eruit** (Marcel, 22 sep 2026: "veel te cringe"). Daar stond wat je moest
doen én welke knop je daarvoor indrukte — "Loop naar de meester, bij zijn moestuin. Klik op de
grond om te lopen." — naast de scène die het al deed. Dat is precies wat hierboven staat: iemand
die stilstaat en uitlegt. Bij het weghalen bleek het niets te zeggen wat er niet al gezegd werd:
sluipen en de deur dichtgooien staan in de vraag van de meester zelf, en welke toets dat is staat
rechtsboven bij de andere toetsen.

Wat ervoor in de plaats komt is een mens. Sta je een poos stil op hetzelfde moment, dan zegt Wim
er iets over als hij in de buurt is, en anders de meester (`vastMeester`, `vastKom`, `vastZak`,
`vastBrengen`, `vastGezien`, `vastSlaan` in `T.TUTORIAL_TEKST`). Zolang daar niets staat, zegt er
ook niemand iets — beter stil dan een uitlegger. En wat er komt te staan, hoort te klinken als
iemand die zich ermee bemoeit, niet als een aanwijzing: "Hij staat daar. Bij zijn bonen." zegt
hetzelfde als "Loop naar de meester", maar er is iemand die het zegt.

**De regels zelf schrijft Marcel** (22 sep). Claude doet de vorm — wanneer wie praat, wat er
verdwijnt — en de woorden blijven van hem.

**Lengte:** "tot hij sterft" mag geen half uur duren. De tutorial is één middag — hij werkt, hij
leert je wat je moet weten, er komt iets van boven de trap af dat er niet hoort te zijn, hij
handelt het af, en dat kost hem zijn laatste jaar.

**De meester loopt rond** (Marcel, 20 sep 2026). Tijdens de tutorial hoort hij bij zijn toren te
ijsberen, in een boek te kijken, de trap op te turen — niet als een standbeeld te wachten tot jij
praat. Het dwaalsysteem werkt al (Wim doet het, zie `js/verkennen.js`) en zijn sprite is klaar, dus
het is een kwestie van hem `dwaalt`, `thuis` en een straal geven.

## Meer dan één einde, meer dan één weg (Marcel, 22 sep 2026)

Marcel: meerdere eindes, en verschillende wegen die naar de finish leiden. Nog niet besloten hoe;
hieronder het voorstel. Het hangt aan "wat zit er boven?", dat nog open is.

**Het einde is de optelsom van het spel, niet een keuze in de laatste zin.** Een einde dat je
kiest uit drie knoppen boven in de toren, maakt twintig uur spelen onbelangrijk. Hier volgt het
uit wat je deed: hoe oud je boven komt, welke verdiepingen je herstelde en welke jaren je
terugkocht, welke spreuken je hebt, of de leerling nog leeft en wat hij weet, en wat het dorp van
je vindt. Pas boven kies je nog, maar alleen uit wat je dan nog kúnt.

**Wegen naar boven.** Er is geen vaste volgorde (`toren.md`: vrij, niet lineair). Een verdieping
kun je herstellen, of er duur langs zweven; een bewaker verslaan, ompraten of ontlopen. Wie sluipt
en afleidt, komt ergens anders uit dan wie vecht, en met een andere set spreuken (`spreuken.md`).

**Eindes om over te praten**, uit wat er al ligt:

- **Verslaan.** Oud aankomen geeft spreuken als mokers, jong aankomen ruimte om te ontwijken. Het
  voor de hand liggende einde.
- **Opnieuw opsluiten.** Dat deed de meester ook, en hij vergat het. Jij gaat ook vergeten. Dus
  werkt dit einde alleen als iemand het onthoudt: de leerling, aan wie je het doorgeeft. Zonder
  hem is het uitstel, en dat zegt het einde je ook.
- **De laatste spreuk.** Alle resterende jaren in één keer, zoals de meester bij zijn moestuin.
  Hoe meer jaren er nog over zijn, hoe groter hij. Wie zuinig speelde, heeft hier het meest te
  geven.
- **Begrijpen.** Als het ding boven iets is wat de meester onrecht deed (de verzuurde nalatenschap
  hierboven), kan praten een einde zijn. Alleen als je de stukjes verhaal onderweg vond, en de
  goede stukjes geloofde.
- **De estafette.** Word je onderweg honderd, dan is dat geen game over: de leerling neemt het
  over met wat jij herstelde (zie De leerling). Een eigen einde, en misschien het droevigste.

**Daarna een nawoord per plek**, zoals in Fallout 1 en 2: een plaat en een paar zinnen over het
dorp, de bakker, Wim, de leerling, de toren. Goedkoop om te maken (een gespreksvariant per
uitkomst), en het maakt zichtbaar dat kleine keuzes onderweg meetelden.

## Het doel staat weer open (Marcel, 23 sep 2026)

Marcel: "Ik vind de stijl tof, het isometrische etc. De artstyle ook. Het spel en doel ben ik nog
niet happy mee. Het idee van de toren beklimmen is leuk, maar niet als einddoel." De kunst blijft
dus, en de toren als plek ook. De vraag is wat het spel van je wil.

**Waarom het wringt, vermoedelijk** (nog na te vragen bij Marcel):

- het doel is een plek, geen reden. "Naar boven" is het doel van een kerker; het dorp wordt een
  winkel voor grondstoffen, en niemand daar heeft iets te verliezen;
- de lus is sleutels halen: verdieping dicht, grondstof halen, verdieping open. `toren.md` waarschuwt
  zelf al voor haalwerk;
- de leeftijd vraagt iets groters dan het doel: "waar geef je je laatste jaren aan?" De toren
  vraagt alleen hoe oud je boven komt.

**Vijf richtingen**, allemaal met dezelfde kunst, het dorp, het bos, de toren als plek en de
leeftijd als levensbalk:

1. **De opvolger.** Je gaat dood; het spel is wie je achterlaat. Kandidaten in het dorp (de jongen
   met het houten zwaard, de dochter van de smid, Wim). Wat je doorgeeft, houden ze; wat je door
   ouderdom vergeet, is weg. Word je honderd of kies je je laatste spreuk, dan speel je het laatste
   bedrijf als de leerling, met wat jij doorgaf, herstelde en aan vrienden maakte. De estafette
   hierboven wordt dan het hele spel, en het begin (de meester sterft en laat na) wordt het einde.
2. **Het dal.** De aardschok opende scheuren in het hele dal (bos, mijn, molen, buurdorp). Jij bent
   de laatste tovenaar; wat je beveiligt, blijft veilig. Het dal moet de winter door. De toren is
   je thuisbasis. Zoals Jagged Alliance 2: het dorp zelf staat op het spel.
3. **De laatste reis.** Wat boven zat, kan alleen opgesloten worden waar het vandaan kwam, ver weg
   (of: de meester wil begraven waar hij geboren is). Een reis met Wim langs kaarten die elk een
   eigen plek zijn; terug gaat niet. Het doel is aankomen. Veel afwisseling, maar ook nieuwe
   landschappen om te maken.
4. **Wat je zestig jaar geleden deed.** Een mysterie: jij hielp het ooit opsluiten en bent het ook
   vergeten. De oudsten in het dorp weten meer dan jij, de verdiepingen zijn stukken van je eigen
   verleden, en het verleden zien kost jaren. Gesprekken worden het hart; het meeste schrijfwerk.
5. **De verleiding.** Het ding boven biedt je jeugd terug. Hoe meer je tovert, hoe beter dat
   klinkt. Het einde is een beslissing, geen gevecht. Kan los, of als laag onder 1 of 4.

Voorstel van Claude: 1, eventueel met 5 erdoorheen, omdat het bijna alles gebruikt wat er ligt en
van de leeftijd het onderwerp maakt in plaats van een levensbalk. Nog niet besloten.

### Ronde 2: alles open behalve de kunst (Marcel, 23 sep 2026)

Marcel: "Nee, geen van allen. Verzin eens iets nieuws zonder te leunen op wat we hebben behalve de
art dan." Dus ook de tovenaar, de leeftijd, de toren en het gevecht in beurten staan ter discussie.
Wat blijft: het isometrische beeld, de HD-pixel art, en dat huizen, mensen en bos uit code komen —
waardoor we eindeloos verschillende dorpen kunnen maken.

1. **Zeven dagen.** "Het dorp betaalt je in graan. Over zeven dagen komen de rovers." Je bent de
   aanvoerder van een troepje huurlingen. Zes dagen bereid je een arm dorp voor (mensen leren
   kennen, sloten, palissade, brug weg, boeren trainen); de zevende nacht is het gevecht in beurten
   op de kaart die jij klaarzette. Daarna het volgende dorp. Materiaal doet ertoe: riet brandt,
   steen houdt. De Zeven Samoerai met Jagged Alliance erin.
2. **De weerwolf.** "Het hele dorp zoekt de weerwolf. Jij bent het." Overdag dorpeling (werken,
   praten, verdenking sturen, elke avond een stemming), 's nachts sluipend jagen. Honger dwingt, en
   elke dode maakt het dorp banger en slimmer. Weerwolven van Wakkerdam, omgedraaid, voor één
   speler.
3. **Eén dag.** "Om middernacht brandt het dorp af. Morgenochtend word je weer wakker." Een dag die
   zich herhaalt, tachtig mensen met een dagindeling, en je houdt alleen wat je weet. Majora's Mask,
   Outer Wilds. Klein van oppervlak, veel schrijfwerk.
4. **De rattenvanger.** "Ze betaalden hem niet. Toen nam hij de kinderen mee." Van stad naar stad
   met een fluit; met melodieën drijf je zwermen door steegjes en de rivier in. Vooraf onderhandelen,
   achteraf bedrogen worden, en dan kiezen. Je naam reist voor je uit.
5. **De vloed.** "Het is november 1421, en het water komt." Dijkgraaf van een dorp in de delta:
   dijken, molens, terpen, en een storm per najaar tot de Sint-Elisabethsvloed. Een bouwspel met
   water als tegenstander; het verst van Marcels voorbeelden.

Voorstel van Claude: 1, omdat het het dichtst bij Jagged Alliance en Fallout ligt en de
huizenbouwer speelgoed maakt; 2 als het om de haak op Steam gaat. Nog niet besloten.

## Open

- **Wat voor spel wordt het?** Alles behalve de kunst staat open; zie "Het doel staat weer open" en
  "Ronde 2" hierboven. Tot dat besloten is, hangt ook de rest van dit bestand in de lucht.
- **Welke eindes?** Hangt aan wat er boven zit. Zie "Meer dan één einde" hierboven.

- **Hoe lang is "te lang weg"?** Nu: verder dan twintig tegels van de moestuin, na een minuut
  roept hij je, na tweeënhalve minuut sterft hij zonder jou (`WEG` in `js/tutorial.js`). Voelen
  en bijstellen.
- **Waarom is de held "Roestig"?** De eerste trede van meesterschap heette zo omdat hij veertig
  jaar niet had getoverd (`js/spreuken.js`). In het nieuwe begin woont hij bij zijn meester; dan
  vraagt dat een andere reden, of een andere naam.
- **Wat zit er boven?** Nog niet bedacht.
