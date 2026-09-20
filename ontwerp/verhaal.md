# Verhaal

## Besloten

- **Opening** (19 sep 2026). Veertig jaar geleden sloot de tovenaar iets op, boven in de toren,
  en ging weg. Vannacht schudde de aarde (de aardschok van de titel) en brak het zegel. Wim bleef
  al die tijd en veegde elke dag de trap, voor als de meester terug zou komen. Wat er boven zit,
  weet Wim niet; dat is het mysterie van de klim.
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
  gereedschap.

## Personen

- **De tovenaar (84).** Blauw gewaad, hoed met ster, witte baard, staf met gloeiende bol. Wordt
  krommer met de jaren; de punt van zijn hoed zakt om.
- **Wim.** Zijn vroegere leerling, nu zelf grijs. Schort, pet, brilletje, bezem. Wacht al veertig
  jaar en zegt "meester".
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

Voorstel van Claude voor de invulling, nog niet gekozen: **laat hem sterven aan de kernregel
zelf.** Hij is tegen de honderd. Terwijl hij je leert toveren, kost elke spreuk hem een jaar, en
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
fontein die hij voor een grap leegschept (of aan jou geeft), is er aan het eind niet meer als
hij hem nodig heeft. Hij haalt zijn honderdste met een spreuk die hij niet had hoeven doen, en
dat is meteen de laatste les: dit overkomt jou ook, als je te makkelijk tovert.

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
- Wim hoeft niet meer te kloppen met "veertig jaar wachten op zijn meester". Zijn rol is nog open,
  maar hij is nu eerder de knecht van de meester dan jouw oude leerling.

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
vast, jaag die kraai weg, doe die deur dicht want het tocht. Ondertussen zie je alles wat je moet
weten. Ook zijn demonstratie hoort daar: hij schiet die kraai van zijn kool (97 wordt 98, en hij
lacht erom), schept uit de fontein en staat weer op 96.

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

- **Waar is Wim in de tutorial?** Knecht van de meester, of jouw oude leerling die er al was?
  Neigt nu naar het eerste, zie hierboven.
- **Hoe gaat de meester precies dood?** Voorstel hierboven: aan zijn eigen laatste spreuk. Het
  alternatief is dat wat er boven zit hem haalt, maar dan leert de speler de regel niet.
- **De teksten in het spel gaan nog van het oude begin uit.** `js/main.js` opent met "Je bent
  terug in de hal van je toren, na veertig jaar", en Wim zegt in `js/dialoog.js` dat hij veertig
  jaar op zijn meester wachtte. Dat klopt niet meer met een spel dat bij de levende meester
  begint. Nu besloten is dat de meester het opsloot en vergat, kan dit herschreven worden zodra
  Wims rol vastligt.
- **Wat zit er boven?** Nog niet bedacht.
