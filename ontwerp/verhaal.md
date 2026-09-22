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
(een knop "Tutorial overslaan" hoort bij het titelscherm, werklijst punt 14).

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

**Lengte:** "tot hij sterft" mag geen half uur duren. De tutorial is één middag — hij werkt, hij
leert je wat je moet weten, er komt iets van boven de trap af dat er niet hoort te zijn, hij
handelt het af, en dat kost hem zijn laatste jaar.

**De meester loopt rond** (Marcel, 20 sep 2026). Tijdens de tutorial hoort hij bij zijn toren te
ijsberen, in een boek te kijken, de trap op te turen — niet als een standbeeld te wachten tot jij
praat. Het dwaalsysteem werkt al (Wim doet het, zie `js/verkennen.js`) en zijn sprite is klaar, dus
het is een kwestie van hem `dwaalt`, `thuis` en een straal geven.

## Open

- **Hoe lang is "te lang weg"?** Nu: verder dan twintig tegels van de moestuin, na een minuut
  roept hij je, na tweeënhalve minuut sterft hij zonder jou (`WEG` in `js/tutorial.js`). Voelen
  en bijstellen.
- **Waarom is de held "Roestig"?** De eerste trede van meesterschap heette zo omdat hij veertig
  jaar niet had getoverd (`js/spreuken.js`). In het nieuwe begin woont hij bij zijn meester; dan
  vraagt dat een andere reden, of een andere naam.
- **Wat zit er boven?** Nog niet bedacht.
