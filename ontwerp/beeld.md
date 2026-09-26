# Beeld

## Besloten

- **HD-pixel art** (19 sep 2026, Marcel: "meer high def, maar wel pixel art"). De eerste pixel art,
  met tegels van 32×16, vond hij te grof.
- **Maten, zoals in het spel:** een tegel is 64×32, een muur 128 pixels hoog. De tovenaar is zo'n
  88 pixels, Wim zo'n 76. Op 1080p toont het spel alles twee keer vergroot.
- **De beelden komen uit code** (`gereedschap/pixelart/`, zie de README daar). Figuren en
  voorwerpen zijn kleine 3D-modellen die uit acht richtingen worden gerenderd en daarna tot pixel
  art worden teruggebracht. Muren en vloeren zijn dozen met een textuur per pixel.
- **Palet:** rampen van donker naar licht, met schaduwen naar paars en licht naar geel.
- **Texturen** geven hele stappen; alleen licht maakt tussenwaarden. Er wordt alleen gedithered
  waar het licht van tint verandert.
- **Licht komt van linksboven,** met een omlijning van één pixel in de donkerste tint van de kleur
  ernaast. Per kamer wordt het licht berekend: lampen, kaarsen, de bol op de staf, en de zon die
  door het glas-in-lood valt.
- **Stijl van Mystic Towers.** De kamer staat als een diorama in het donker, en de voorste muren
  zijn laag weggesneden.

## Alles valt en staat met overtuiging (Marcel, 21 sep 2026)

De maat waar al het beeldwerk aan getoetst wordt: gelooft de speler dat hier mensen wonen? De
regels hieronder zijn manieren om dat te bereiken. En het werkt ook andersom: **overtuiging gaat
kapot aan één ding dat niet klopt** — een figuur die half in een put staat, grastufts in een
raster, een huis waarvan alleen het dak boven het gras uitsteekt. Zo'n breuk gaat voor op nieuw
moois, want één ervan doet meer kwaad dan tien mooie huizen goedmaken.

## Niets is waterpas (Marcel, 21 sep 2026)

"Het moet echt aanvoelen. In de middeleeuwen was er geen laserlijn, er was geen waterpas. Dingen
werden op het oog gedaan. Dingen waren niet perfect, het mag een beetje afwijken. Zo wordt een
wereld uniek en blijft het spannend." Een dorp vol huizen die we op 21 sep hadden, voelde volgens
hem "ongelooflijk saai om doorheen te lopen, er zit geen leven in".

Dit is een regel voor **alles wat uit code komt**, niet alleen voor huizen: een computer maakt
uit zichzelf alles recht, gelijk en herhaald, en dat is precies wat een plek dood maakt.

- **Niets is recht.** Een nok zakt in het midden door, een dakrand golft, een muur helt een fractie,
  een schoorsteen leunt. Een hek staat scheef, een pad slingert.
- **Niets is haaks.** Een plattegrond is een fractie scheef, een hoek niet precies negentig graden.
- **Niets is gelijk.** Elke balk een andere dikte, planken van verschillende breedte, stenen van
  verschillende maat, ramen op net verschillende hoogtes, een luik dat scheef hangt, een deur die
  niet helemaal past.
- **Alles heeft een geschiedenis.** Gelapt riet in een andere kleur, een vervangen plank, een
  aanbouw die later is aangezet, een muur die met een schoor overeind wordt gehouden.
- **Maar een beetje.** Het moet op het oog gemaakt lijken, niet kapot of lachwekkend. En het moet
  op pixelmaat te zien zijn: een doorzakking van een paar pixels, niet een halve pixel die bij het
  terugbrengen tot pixel art verdwijnt of alleen een rafelige lijn geeft.
- **Per zaad anders, en vast.** Elk huis is op zijn eigen manier scheef, en dat blijft zo: hetzelfde
  zaad geeft hetzelfde huis.

Technisch betekent dit dat de huizen uit **ronde vormen** moeten komen (afstandsfuncties, zoals de
figuren en de toren al doen), niet uit dozen en vlakken. Een doos is per definitie recht; een
afstandsfunctie kun je laten doorbuigen, uitpuilen en golven.

### Ook de kaart is niet waterpas (Marcel, 26 sep 2026)

Na de beelden van het nieuwe gehucht (een plein van 10 bij 8 tegels vóór het huis van de schout):
"Let ook op de gebouwen, [ze staan] te dicht op elkaar. De brink is vaak het hart van een dorp. Zou
een redelijk open ruimte zijn lijkt mij." En: "Ook de vorm moet variëren, he? En niet alles dus strak
en waterpas."

Wat Claude daarin zag: de regel van 21 sep gold tot nu toe alleen voor wat de huizenbouwer rendert,
nooit voor de kaart zelf (`gereedschap/tiled/maak-gehucht.cjs`). Die is wél strak: het plein is een
rechthoek met rechte randen, de weg een rechte lijn, de akkers liggen als gelijke stroken op een rij,
en alle huizen staan in rijen met hun voorkant naar het zuiden. Dus ook voor de kaart:
- **Het plein is het hart, en open:** groot, met een paar oude bomen, en niet volgebouwd; op het
  plein wordt niet gebouwd. (Sinds 26 sep heet de brink gewoon het plein.) De huizen staan eromheen,
  ook aan de kant van de camera: "Ik wil wel dat er huizen voor kunnen staan. We hebben daar het
  kijkvenster voor. Misschien huizen volledig transparant maken" (Marcel, 26 sep; "Doorkijk"
  hieronder). En de velden liggen daar weer omheen.
- **Geen rechthoek:** de rand van het plein golft, een weg slingert (en wordt later een pad dat slijt
  waar gelopen wordt, "Straten en paden" in `spel.md`), en een erf staat een eindje verder of dichterbij
  dan dat van de buren.
- **Niet alles dezelfde kant op:** een huis kan in ons beeld niet vrij draaien, maar de huizenbouwer
  kan elk huis een kwartslag gedraaid of gespiegeld renderen, zodat een boerderij met de zijkant of de
  achterkant naar het plein kan staan (voorstel van Claude).

**Zo is het gebouwd** (26 sep, de vierde versie van het gehucht): het plein, de slingerende weg en de
paden, en een beek die kronkelt, maar recht onder de brug door loopt. De weg is een vloeiende lijn door
steunpunten (Catmull-Rom); de rand van het plein en het uitgesleten zand zijn een veelhoek. De huizen
staan nog wel allemaal met hun voorkant naar het zuiden: gedraaid of gespiegeld komt met ronde 4b van
de huizenbouwer. Wat bleek: een geknotte wilg is hoog, en een rij wilgen vóór de beek verstopte hem
helemaal; nu staan er minder, en bij de brug geen.

### De huizenbouwer op ronde vormen (Marcel, 21 sep 2026)

Het proefhuis (`gereedschap/pixelart/huis-sdf.cjs`, plaat in `uit/proefhuis/vergelijk.png`)
bewees dat het kan: "ja zeker doen, dit ziet er al zoveel beter uit". Het dikke riet deed het
meeste, daarna de grove maten; scheef is op spelmaat subtiel, en maakt huizen niet van elkaar
verschillend. Wat de nieuwe bouwer moet kunnen, in Marcels woorden en daarna uitgewerkt:

- **Plattegronden:** rechthoek, **L** en **T** (en later een U of een binnenplaats). Bij een L of T
  krijg je waar twee daken elkaar raken een kil, en het riet moet daar doorlopen.
- **Losse, vrijstaande huizen,** niet alleen rijen.
- **Verdiepingen:** één laag, anderhalf (een zolder met dakkapellen in het riet), en **twee lagen**,
  met de bovenverdieping die een eindje overkraagt — dat is het middeleeuwse vakwerkhuis bij uitstek.
- **Wanden:** vakwerk met pleister en veldsteen zijn er; planken, vlechtwerk en een blokhut van
  gestapelde stammen komen erbij.
- **Daken:** riet is er; spanen, leien en pannen komen erbij, in lagen zoals het riet. **Een plat
  dak** (Marcel vroeg ernaar) alleen op steen, met een borstwering of kantelen eromheen: een
  wachttoren, een poortgebouw, de toren van een kapel. Op een gewoon huis niet, want in een land
  met riet en regen zijn daken steil, en een plat dak op vakwerk leest als Zuid-Europa.
- **Renderen gebeurt één keer:** een huis kost zo'n twintig seconden, maar dat is het maken van het
  plaatje in het tegelvel. Het spel tekent het daarna af; de speler merkt er niets van.
- **Uitbouwen:** dakkapellen die zacht in het riet zijn opgenomen, erkers op klossen, een aanbouw
  met een eenzijdig dak, een buitentrap, luiken, bloembakken, schoorstenen, en **een houten
  balkonnetje of galerij** langs de bovenverdieping (Marcel vroeg ernaar; ook de referentieplaat
  heeft er een, op palen, met een raam erin). Past vooral bij de huizen met twee lagen.
- **Een tuintje erbij** (Marcel, 21 sep 2026), maar **in losse stukken, niet vast aan het huis:**
  een hek in stukken met een hekje, rijen groente, een kruidenbed, bloemen langs de muur, een
  bankje, een regenton. Marcel zet ze zelf neer in Tiled. Dan krijgt elk huis een andere tuin, en
  omdat elk stuk op zijn eigen tegel staat, klopt voor- en achterlangs lopen ook — een tuin die in
  het huis gebakken zit, zou juist daar misgaan. Ook niet waterpas: een hek staat scheef, een rij
  kool loopt net niet recht.
- **Hekjes van wilgentenen en van latten** (Marcel, 22 sep 2026). Het eerste hek uit ronde 3 was
  een dicht staketsel van planken, en op ware grootte las dat als een palissade om een fort. Een
  moestuin krijgt een laag, open hekje: gevlochten wilgentenen tussen paaltjes, of een paar latten
  op palen. Twee soorten, zodat niet elke tuin hetzelfde hek heeft.
- **Wat vast is** (Marcel akkoord, 22 sep 2026): het hek, de bank en de regenton houden je tegen;
  het hekje en de bedden niet. Door een hekje loop je de tuin in, en door een bed stap je heen.
- **Niets is waterpas** in alles, en per zaad anders: plattegrond, verdiepingen, materiaal en
  ouderdom, zodat geen twee huizen op elkaar lijken.
- **Het blijft bruikbaar:** elk huis komt in `tegels/gebouwen.tsx` met de goede voetafdruk en het
  goede anker (`test/tegelanker.test.cjs` moet slagen), en nieuwe huizen komen **achteraan** in de
  volgorde (`ontwerp/kaarten.md`, "Een tegelnummer verandert nooit").

## Ontwerpcanvas

https://claude.ai/artifact/K4frzQ2o5Ak3owGhA4AJms (privé). Daarop staan:

- de hal, op 84, 92 en 99 jaar;
- het gevecht in de voorraadkamer;
- de vergelijking van 32 naar 64 pixels;
- de figuren in acht richtingen;
- muren, vloeren en voorwerpen.

## Het dorp: het werk van Knights and Merchants, in warm licht met diepte (Marcel, 20 sep 2026)

Het eerste dorp werd te sprookjesachtig: wit vakwerk, rode pannen, fel groen gras. Marcel noemde
eerst Knights and Merchants, en liet daarna een referentie zien (een pixel art-scène met
huisjes met rode pannendaken langs een pad over een klif, een rivier eronder, en een kasteel in
de nevel). Die twee samen:

**Van Knights and Merchants:** het werkdorp. Huizen dicht op elkaar, modderige paden met sporen,
werkplaatsen met een erf waar je het werk ziet (stapels stammen, zakken meel, een aambeeld en
kolen, droogrekken, tonnen, karren), akkers in verschillende stadia, omheiningen van ruwe palen.

**Van de referentie:** de sfeer.
- **Warm licht met hard contrast:** zonlicht op de daken, diepe schaduw onder de overstek. Geen
  vlak fel groen, maar diep groen met zonnevlekken.
- **Vooral hout en stro** (Marcel, 20 sep 2026): riet op zo'n twee derde van de gebouwen,
  schaliën op een paar, en rode pannen als uitzondering op de herberg, de kapel en een enkel
  beter huis. Wanden van stapelhout, ruwe planken en vlechtwerk; veldsteen voor plinten,
  schoorstenen en een enkele hele muur. Met variatie: verweerd grijs naast warmer bruin, vers
  stro naast oud en gelapt.
- **Huizen mogen niet op elkaar lijken** (Marcel, 20 sep 2026). Een dorp groeit in een eeuw,
  het komt niet uit één catalogus. Varieer de plattegrond (ook een L-vorm, een aanbouw, een
  afdak, een buitentrap), de hoogte en de dakhelling, de ouderdom (een doorgezakte nok, een
  gelapt dak, een scheve luik), de ramen en deuren, en het erf: bij de een een houtstapel, bij
  de ander een kippenren, kruidenbed of drooghekken.
- **Diepte in lagen:** begroeiing als lijst aan de randen, en naar achteren toe waziger en
  doffer. Daarmee verdwijnt ook de harde rand van onze eilandjes.
- **Hoogteverschil:** een pad dat over een richel loopt, met een leuning en lantaarns, en water
  op een lager niveau. Onze dozen kennen al een hoogte, en het water uit `dorp2.cjs` ligt al
  onder het maaiveld, dus terrassen met een rotswand en trappen kunnen.
- **Een silhouet in de verte:** iets om naartoe te kijken, in lage contrasten. Bij ons: de toren.

De maten uit `wereld.md` blijven gelden, en de schaal is goed zoals hij is (Marcel, 20 sep
2026). In het spel kijk je namelijk ingezoomd: op 1080p toont het spel ×2, dus zo'n 960 bij 540
pixels, ongeveer vijftien bij zeventien tegels. Dan vullen twee of drie huizen het scherm en
zijn de mensen groot genoeg. De brede platen die we renderen zijn overzichtskaarten, niet wat
de speler ziet.

De toren en zijn kamers houden hun eigen sfeer, die uit Mystic Towers.

### De leidende referentie: de boerderij met de watermolen (Marcel, 20 sep 2026)

**Dit is referentie nummer één** (Marcel: "deze laatste ref is bij mij nr 1"). Waar deze plaat
botst met de eerdere referenties, wint deze. Knights and Merchants blijft gelden voor wat er in
een dorp gebeurt (werkdorpen, erven, akkers), en de kliffenplaat voor het warme licht, maar hoe
een gebouw eruitziet, komt hiervandaan.

Marcel liet een isometrische pixel art-plaat zien van een boerderij met een watermolen aan een
beek, en noemde die stijl "echt passend". De plaat:
https://i.pinimg.com/originals/3b/7c/c8/3b7cc846ee7b292b5407a84939a1e821.gif (van iemand anders;
alleen de link, niet het beeld zelf in de opslagplaats). Wat we eruit overnemen:

- **Het dak is het gebouw.** Het riet is de grootste massa, ruim de helft van de hoogte, en het
  zakt laag over de muren heen. Je ziet de lagen riet per rij liggen, de nok is een dikke rol, en
  onder de overstek zit diepe schaduw. Onze daken zijn te klein en te vlak.
- **Steen onder, hout boven.** Een onderbouw van ruwe veldsteen (koel grijsblauw), daarboven hout
  en vakwerk (warm oranjebruin). Twee temperaturen per huis; dat is wat het rijk maakt.
- **Dingen die uitsteken.** Een erker op klossen, een dakkapel met een eigen rieten kapje, een
  schoorsteen met een kap, gesneden windveren langs de gevel. Zulke randen maken het silhouet van
  een huis van ver herkenbaar, en meteen anders dan dat van de buren.
- **Elk huis is een werkplek.** Een rad in de beek, akkers in rijen, varkens in de modder, een kar
  met een gebroken wiel, stapels stammen, een koe, een boer. Het erf vertelt wat er gebeurt.
- **Het bijgebouw is geen klein huisje** maar een half ingegraven schuur met het dak bijna tot op
  de grond en een gemetselde boogdeur.
- **Bomen met variatie,** waaronder een kale dode boom tussen het groen, en slagschaduwen van de
  bomen op het gras.

De plaat is een diorama op een schuin afgesneden plak grond. Dat is presentatie; onze wereld loopt
door, dus die harde rand nemen we niet over.

### Water is modderig, en een pad heeft karrensporen (Marcel, 20 sep 2026)

Op de eerste proefplaat van de randtegels was het water fel korenbloemblauw met witte fonkeling,
terwijl de rest van de wereld naar olijf en gedempt is gegaan en het water op de referentie
modderig grijsgroen is. Hetzelfde soort uitschieter als de blauwe veldsteen.

- **Water is modderig:** gedempt grijsgroen, donkerder naar het midden, warmer en ondieper bij de
  kant. Fonkeling mag, maar spaarzaam en gedempt.
- **Een pad heeft karrensporen:** twee sporen in de rijrichting met een hogere strook ertussen, en
  een getrapte rand waar het gras uitdunt in plaats van een harde grens. Zonder dat leest een pad
  als een modderplek, en een dorp moet juist een geheel worden met wegen die ergens heen gaan.
- **Een kasseiplein heeft een rand:** een kantlaag van grotere stenen, zodat het gelegd oogt en
  niet gemorst.

## Binnen is grijs, en kleur betekent iets (Marcel, 20 sep 2026)

Naar aanleiding van een isometrische plaat die Marcel liet zien: een kelderhoek als diorama in een
donkere doos, kasseivloer, ruwe stenen muren, een gesneden boog met een zwarte doorgang, een
lantaarn, en klimop met witte bloemen die naar binnen kruipt. Bijna alles grijs. "Lijkt heel erg
goed te passen bij onze stijl." Dat geldt voor kelders, grafkelders en mijnen — de toren en het
dorp houden hun eigen sfeer.

- **Bijna grijs, en kleur alleen waar het ertoe doet.** Dit is de belangrijkste regel, en hij is
  niet alleen mooi maar ook speelbaar: in een grijze ruimte is alles met kleur meteen belangrijk.
  Een gloeiende grondstof, een vijand, een deur die open kan — je ziet het zonder pijl. Het zet
  ook het contrast aan met buiten, waar we juist warm en olijf zijn.
- **Een donkere doorgang is een zwart gat,** geen deur met details. Dat is de gang die je nog niet
  kent. Kost niets, werkt altijd.
- **Klimop en planten kruipen naar binnen.** Veertig jaar niemand die iets onderhield, dus het
  leven neemt het over. De plantengeneratoren bestaan al.
- **Wat we niet overnemen:** op die plaat is de figuur een ornament, een zesde van de kamerhoogte.
  Bij ons is de tovenaar 88 pixels op een tegel van 64×32 en dat blijft zo, want je moet in een
  gevecht zijn houding en zijn gezicht kunnen lezen. En een gesloten doos met twee hele muren werkt
  voor een plaat maar niet voor een spel: de voorste muren blijven laag weggesneden.
- **Wat een kelder vooral nodig heeft, is een omgeving die leeft:** de vlam in de lantaarn,
  druppelend water, stof in het licht, klimop die meebeweegt met de wind. Zie de open punten
  onderaan.
- **Het reliëf in een gesneden boog is echt snijwerk in code.** Dat bewaren we voor een of twee
  belangrijke plekken, niet voor elke deur. Ruw gestapelde steen kunnen we wel gewoon.

## Zelf maken, niet kopen (20 sep 2026)

Marcel liet twee gekochte kits zien, een voor kelders en een voor buiten, als inspiratie. Ze zijn
bruikbaar als **boodschappenlijst**, niet als kunst. Waarom we ze niet gebruiken:

- alles bij ons komt uit één renderer, met één palet, één lichtrichting en één omlijningsregel. Dat
  is waarom het dorp, de toren en de figuren als één wereld aanvoelen, en waarom één beslissing —
  veldsteen grijs in plaats van paars — alles tegelijk kon bijstellen. Een gekochte kit zet een
  tweede lichtrichting en een tweede palet in hetzelfde beeld, en dat zie je meteen;
- gekochte kunst ligt vast. Onze klimop moet meebewegen met de wind, onze verdieping moet van
  krakkemikkig naar hersteld kunnen, onze boom moet kunnen verdorren tot een dode boom. Dat kan
  alleen als het uit code komt;
- voor verkoop moet de licentie van zo'n pak nagelopen worden, en dat gedoe kunnen we onszelf
  besparen.

**Wat die twee kits wél opleverden — wat wij nog missen.**

Voor een kelder (we hebben al: muren met negen versieringen in twee richtingen, deuren open, dicht
en op slot, vloeren, kisten, tonnen, puin, wandrek, wandlamp): **trap** (die tekent het spel nu nog
als vlak, want er is geen kunst voor), ladder, vloerrooster, ingestorte vloer, stalagmieten, vuur,
botten, en mos en klimop op muren. En de les uit hun muurrijen: de rijkdom komt uit acht varianten
van dezelfde muur — gaaf, gebarsten, bemost, begroeid, half ingestort — niet uit acht verschillende
muren.

Voor buiten: **dieren** (zie `spreuken.md`, ze zijn voer voor het verdorren), **klifranden** voor
het hoogtesysteem, wegwijzers (horen bij "de doelen zijn zichtbaar"), tent en kampvuur voor
questplekken, een stenen brug naast onze houten, en meer grondsoorten — elke soort erbij is een
terreinset erbij.

### Kinderkopjes in plaats van kasseien (Marcel, 21 sep 2026)

"Mooie stenen straatjes, kinderkopjes zoals ze die hier noemen." Onze kasseien zijn platte,
gezaagde stenen; kinderkopjes zijn bolle, ronde veldkeien. Elk een bolletje dat bovenop het licht
vangt, met diepe donkere voegen, mos en gras ertussen, niet op een rij (zie "Niets is waterpas"),
en in een straat vaak een goot van platte stenen in het midden waar het regenwater doorloopt.

Het zijn dezelfde tegels in `tegels/rand.tsx`, alleen met een andere tekening, dus de paden die
Marcel al heeft geschilderd worden vanzelf kinderkopjes. De volgorde en het aantal tegels blijven
gelijk (`kaarten.md`, "Een tegelnummer verandert nooit").

## Wat er staat (20 sep 2026)

Klaar en in `gereedschap/pixelart/`, met een exportscript per onderdeel:

- de hal en de voorraadkamer, de figuren, de voorwerpen, muren en vloeren;
- bomen en begroeiing, het dorp met zijn plekken, negentien dorpelingen, de bosvijanden, en de
  toren in drie staten;
- de huizen op de leidende referentie, de schuur als eigen type, en de wereldkaart daarop
  herbouwd (dorp linksonder, de weg naar de toren rechts);
- het erf van de toren: de krakkemikkige toren met moestuin, waslijn, schuur en bosrand;
- animaties voor de tovenaar, Wim, het skelet, de slijmkruiper, de wolf, de spin en de kobold.

In de maak: het bos als reisgebied, de sprite van de oude meester, en de tegelvellen waarmee
Marcel de kaarten in Tiled kan tekenen (zie `wereld.md`).

Een les uit het werk met meerdere agents: drie tegelijk die renderen, gaan hard door het
budget. Eén tegelijk, en sprites hergebruiken in plaats van elke boom opnieuw uitrekenen.

## Wat je niet kunt zien, kun je niet spelen (Marcel, 20 sep 2026)

Bij het eerste rondlopen buiten: "je kunt niets zien achter de toren" en "ik word aangevallen
door een wolf die ik niet kan zien". Daar volgen drie regels uit, die voor alle buitengebieden
gelden.

- **Doorkijk.** Een hoog voorwerp dat de schout of een wezen bedekt, wordt doorzichtig zolang dat
  zo is, of het silhouet van de figuur wordt eroverheen getekend. Zo doen Fallout, Diablo en
  Baldur's Gate het ook. Bepalen wat wat bedekt gaat op tegels en hoogte, niet op pixels, want
  het moet elk beeld kunnen. De overgang loopt in een paar tienden van een seconde op en af,
  anders klappert het.
  **Zo werkt het nu** (26 sep, zevende sessie; `js/doorkijk.js`): wie je hoort te zien, zie je door
  een boom of een huis heen. Dat zijn de schout, wie je spreekt, wie vecht of je net ontdekte, en de
  bezoekers (de heer, de marskramer, de inner en de soldaten); door een huis heen ook iedereen op het
  plein (`T.zichtbaarDoor`). Hoe je erdoorheen kijkt, is een keuze in de spelregels ("Door een huis
  heen kijken"): het **kijkvenster** (de standaard), een zacht rond venster rond wie erachter staat,
  waarin de grond achter het huis en wie daar staat opnieuw getekend worden (`T.tekenKijkgat`); of het
  **raster**, waarin het hele huis of de hele boom om de andere pixel opengaat (`T.tekenGerasterd`).
  Of het plein meetelt, is de tweede keuze ("Wie je door een huis heen ziet"). Een boom van de bosrand
  valt helemaal weg. Een gebouw vervaagt nooit als geheel, want een half doorzichtig rieten dak werd
  een geelgroen spook (Marcel, 23 sep). Tot 26 sep kwam in het venster alleen de schout zelf terug, met
  het dak eromheen, en dan leek hij óp het dak te staan (Marcel: "In al je plaatjes staan er mensen op
  het dak van huizen").
  **Misschien helemaal doorzichtig** (Marcel, 26 sep): nu er ook huizen vóór het plein komen, stelde
  Marcel voor huizen misschien volledig transparant te maken. Het geelgroene spook van 23 sep kwam
  doordat een half doorzichtig rieten dak zich mengde met het gras erachter. Voorstel van Claude, om
  als optie in de spelregels te proberen: (1) het kijkvenster zoals nu, maar ook voor de heer, de
  marskramer en wie je spreekt; (2) van het huis blijft alleen de omtrek staan, als een dunne lijn;
  (3) het huis wordt in een raster doorzichtig, om de andere pixel, zoals oude spellen dat deden: dan
  mengt er geen kleur. **Marcel koos (26 sep): "Zoals jij voorstelt"**: de eerste en de derde, allebei
  als keuze in de spelregels, na de kaart; wat hij in het spel kiest, wordt de standaard.
  **De proef** (26 sep, zevende sessie): een huis vóór het plein, met de schout en drie mensen erachter,
  in vier beelden naast elkaar. Het raster mengt toch: om de andere pixel is op ons scherm één of twee
  schermpixels per vakje, en dan mengt het oog de kleuren alsnog. Het rieten dak over het gras werd weer
  geelgroen, het spook van 23 sep, alleen scherper. Oude spellen rasterden juist omdat het er half
  doorzichtig uitziet. Een grover raster (vier schermpixels) mengt niet meer, maar legt een dambord
  over het hele huis en hakt de mensen erachter in blokjes. Het kijkvenster houdt het huis heel en de
  mensen scherp, ook met vier vensters naast elkaar. Twee dingen vielen verder op: vóór het plein staat
  nog geen huis (alleen de boerderij op de oosthoek dekt een strook af), dus het venster is vooral
  nodig voor wat nog komt; en als iedereen op het plein meetelt, krijgen de vijf eiken er gaten van
  zolang de kinderen spelen. Voorstel van Claude (vraag 34 in de werklijst): alleen het kijkvenster,
  voor meer mensen; het plein telt alleen achter een huis, niet achter een boom.
  **Marcel koos (26 sep, zevende sessie):** "Ja dit is een goede optie", en daarna "Raster ook als
  keuze". In de spelregels komen dus twee keuzes: hoe je door iets heen kijkt (het kijkvenster, de
  standaard, of het raster om de andere pixel) en wie je door een huis ziet (ook iedereen op het plein,
  de standaard, of alleen wie ertoe doet). De doorkijk krijgt een eigen bestand, `js/doorkijk.js`.
- **Niets valt je aan van buiten beeld.** Een wezen dat jou kan zien, moet jij kunnen zien. Als
  het je ontdekt, gaat de camera ernaartoe en komt de melding.
- **Waar je loopt, staat niets.** Dichte begroeiing hoort aan de rand, waar je niet komt. Wat er
  op een begaanbare tegel staat, hoort daar niet; staat er iets, dan is die tegel vast.

## Animaties (Marcel, 19 sep 2026: "moet allemaal geanimeerd zijn")

Een figuur is opgebouwd uit gewrichten. Een animatie is een reeks houdingen, gerenderd zoals een
stilstaand beeld.

**Model.** De bouwfunctie krijgt een houding mee: `maak({ houding: 'lopen', fase: 0..1 })`.
Zonder houding geeft hij de stand van nu; bestaande vellen blijven daardoor gelijk.

**Namen, beelden en snelheid:**

| Houding | Beelden | Beelden per seconde | Herhaalt | Wat het is |
|---|---|---|---|---|
| staan | 4 | 4 | ja | Ademen: een klein wiegen, de baard of het slijm deint. |
| lopen | 8 | 10 | ja | Een loopcyclus op de plaats; het spel verschuift de figuur. |
| aanval | 6 | 12 | nee | Voor monsters. De tovenaar heeft `slaan` (met de staf) en `spreuk`. |
| geraakt | 3 | 12 | nee | Terugdeinzen. |
| sterven | 8 | 10 | nee | Het laatste beeld blijft liggen. |

**Voeten die niet glijden.** Een stap moet passen bij de loopsnelheid in `js/anim.js`. Een voet
op de grond schuift mee terug met de snelheid waarmee het spel de figuur vooruit schuift.

De held liep 4,5 tegels per seconde. Dat is rennen, en met een echte loopcyclus zouden zijn
stappen belachelijk lang worden. Besloten (Marcel, 19 sep 2026):
- de held loopt 2,5 tegels per seconde op zijn 84e (een cyclus van 0,8 seconde, een tegel per
  stap);
- hoe ouder, hoe trager: 2,1 op zijn 92e en 1,8 op zijn 99e. Zo voel je zijn leeftijd ook als
  hij gewoon loopt;
- de monsters houden hun snelheid (slijm 1,4, skelet 2,2).

In het spel moet dit nog worden ingebouwd, na de spreuken.

**Vellen.** Eén PNG per figuur per houding. De rijen zijn de acht richtingen in de volgorde
Z ZW W NW N NO O ZO; de kolommen zijn de beelden. Een cel is 112×124 met de voeten op (56, 110).
Een houding die niet in de cel past (liggen bij sterven), krijgt bredere cellen en vermeldt dat.

**Beschrijving.** Bij elke figuur hoort een JSON:
`{ naam, cel, anker, houdingen: { lopen: { beelden, fps, herhaal, cel? } } }`.

**Bekijken.** `apng.cjs` maakt er een bewegende PNG van, die in elke browser en op het canvas
beweegt.

**De tovenaar loopt naar zijn leeftijd.** Op zijn 84e loopt hij kwiek; op zijn 99e schuifelt hij,
leunend op de staf.

## De sprites zitten in het spel (20 sep 2026)

`npm run pixelart:spel` zet uit `uit/` precies neer wat het spel tekent, in `beelden/` (wél in
git). De muurstukken worden daar opnieuw gerenderd, zonder de strook vloer die op de
overzichtsplaat voor de muur ligt, en in beide richtingen: een noordmuur kijkt naar het
zuidwesten, een westmuur naar het zuidoosten. Een muurstuk is een halve tegel dik, zoals in
`kamers.cjs`, dus krijgt elke muurtegel er twee achter elkaar; het voorste draagt de
versiering. Vloeren zijn lappen van twee bij twee tegels waar het spel per tegel een ruit uit
knipt, zodat het verband doorloopt.

`js/sprites.js` kiest het beeld, en leidt de houding af uit de spelstaat zelf in plaats van uit
een tweede boekhouding: een pad is lopen, `uitval` is uithalen, `flits` is net geraakt, `dood`
is sterven, en jaren die erbij komen zonder klap zijn een spreuk. De pas komt uit de afgelegde
afstand en niet uit de klok, dus de voeten glijden niet, ook niet als een monster in een
gevecht wat vlotter loopt. De tovenaar loopt op het vel van zijn leeftijd (84, 92 of 99).

Nog niet in de kunst: de pilaar en de trap (die blijven vlakken), en een houding voor sluipen.

## Eén wind door alles heen (Marcel, 20 sep 2026)

"Mag allemaal wel wat beweging in, die doeken enzo. Kan me voorstellen dat het soms waait?"

Niet elk ding apart laten wiebelen, maar één windwaarde in de spelstaat waar alles aan hangt.
Die loopt langzaam op en af, met vlagen, zodat het als weer leest en niet als speelgoed.

- **Wat meebeweegt:** de doeken aan de waslijn, de boomkruinen en struiken, het gras, de rook uit
  een schoorsteen, en de windwijzer op de toren, die met de richting meedraait.
- **Hoe:** de sprites blijven stilstaand. Bij het laden wordt een beeld in horizontale plakken
  verschoven, meer naar boven dan naar onder, zodat een boom buigt in plaats van te schuiven.
  Dat levert een handvol standen per voorwerp op, die aan de windwaarde hangen. Zo blijft het
  tekenen gewoon plakken, en hoeft er niets per beeld te worden uitgerekend.
- **Niet alles even hard:** een zwaar ding (een schuur, een muur) beweegt niet, een boom een
  beetje, een doek veel. De uitslag hoort bij het ding, de wind is voor iedereen gelijk.
- **Uit de pas lopen:** elk voorwerp krijgt een eigen verschuiving in de tijd, anders wappert het
  dorp als één vlag.

## Het huis van de heer draagt rood en geel (Marcel, 24 sep 2026)

Toen we aan het tekenwerk begonnen, koos Marcel:

- **Eerst de heer, zijn soldaten en de inner.** Zij liepen in andermans kleren (de mantel van de
  meester, de smid, de bruidegom), en ze komen elk jaar langs.
- **De heer is klein en dik, met een veel te grote hoed:** een rond mannetje in een mantel met bont,
  gouden kettingen over zijn buik, en een hoed met veren die veel te groot is. IJdel en een beetje
  belachelijk. Zwarte satire: hij is lachwekkend, zijn straffen niet.
- **Het huis van de heer draagt rood en geel.** Zijn soldaten en de inner dragen die kleuren ook,
  zodat je meteen ziet wie van hem is.

Voorstel van Claude voor de andere twee, te beoordelen op de proefplaat:

- **De soldaten zijn geen grap:** groot en zwaar, een wapenrok in rood en geel over een gewatteerd
  wambuis, een ijzeren hoed en een hellebaard.
- **De inner is mager en sober,** in donkere kleren, met een rekenboek onder de arm en een pen
  achter zijn oor. Alleen zijn hozen dragen de livrei: het ene been rood, het andere geel.

**Gemaakt (24 sep 2026)** in `gereedschap/pixelart/heer.cjs`, met staan en lopen in acht
richtingen; de proefplaat is `uit/dorpelingen/huis-van-de-heer.png`. Naast een boer (kruin 66 px)
is de heer 48 px tot zijn kruin en 61 tot 69 px met hoed en veren, en is zijn hoed 45 px breed
tegen 37 voor de boer. De soldaat is 70 px, 93 met hellebaard; de inner 68 px. Wat onderweg bleek:

- de heer trippelt: hij loopt met 20 beelden per seconde, want met 10 was elke pas langer dan zijn
  beentjes;
- hermelijn onder zijn ronde gezicht leek een witte baard, dus is zijn bont bruin, met een kraag
  die voorop open is;
- de rand van zijn hoed wipt voorop op, anders zie je van boven zijn ogen niet;
- het gezicht van de soldaat ligt in de schaduw van zijn hoed: grimmig, en bewust klein.

Twee nieuwe gereedschappen maakten het klein werk: `dorpelingen-anim.cjs heer soldaat inner`
rendert alleen de genoemde figuren, en `naar-spel.cjs --alleen heer,soldaat,inner` zet alleen die in
het spel. Zonder `--alleen` bouwt het de hele beschrijving opnieuw op uit `uit/`, en in een verse
kopie is die map leeg: dan verdwijnen alle andere figuren.

## De schandpaal: een paal met een halsijzer (Marcel, 24 sep 2026)

Een dikke eiken paal op een stenen trede, met een ijzeren halsband aan een ketting, en bovenop een
bordje met het wapen van de heer in rood en geel. Wie eraan staat, staat rechtop: dat kunnen de
poppetjes al, en de halsband komt vóór hem in beeld. Marcel koos dit boven een schandblok (hoofd
en handen door een plank, wat een nieuwe gebogen houding voor elk vel had gevraagd) en een
verhoogde kaak met een trapje. Wanneer hij er staat, is een spelregel: zie `spel.md`,
"Sint-Maarten".

**Gemaakt (24 sep 2026)** in `gereedschap/pixelart/schandpaal.cjs`, als eigen vel
`beelden/schandpaal.png` met drie delen:
- **leeg:** het halsijzer hangt open tegen de paal;
- **bezet:** de ketting loopt naar wie ervoor staat;
- **het halsijzer** zelf, als laag over die persoon heen.

De balk leunt een paar pixels, heeft droogscheuren en is onderaan bemost. Het wapen is gevierendeeld
rood en geel, zoals de wapenrok van de soldaten, met hier en daar afgebladderde verf. De paal komt
92 px boven zijn voet uit, zo'n 58 px boven het hoofd van wie ervoor staat, en de halsband zit 51
px boven diens voeten (gemeten op de boer en de boerin). Wie eraan staat, kijkt naar voren, met zijn
rug naar de paal.

Nog niet goed:
- de boer houdt aan de paal zijn hooivork vast, want zo is zijn vel voor staan;
- in het gehucht staat de paal, net als de heer en de marskramer, achter het dak van een huis: zie
  de werklijst.

## Een gezicht per karakter (Marcel, 25 sep 2026)

Elk spel loot iedere boer een karakter (`js/boeren.js`), maar dat zag je alleen bij de muis en
boven het gesprek: alle boeren waren de boer of de boerin. Marcel koos het voorstel van Claude:
ieder karakter krijgt iets herkenbaars, zodat je de weduwe of de drinker van ver ziet lopen.

| Karakter | Wat je ziet |
|---|---|
| zanger | bonte muts met een veer, luit op de rug |
| weduwe | zwart, met een kap |
| woekeraar | nette bruine jas met bont, buidel aan de riem |
| vroedvrouw | wit schort, hoofddoek, tas |
| heethoofd | opgestroopte mouwen, rood gezicht |
| vrome | sober grijs, rozenkrans in de handen |
| roddelaar | bonte omslagdoek, mand aan de arm |
| de oudste | grijs haar en baard, stok, wat krom |
| nieuwkomer | vreemde groene kiel, bundel op de rug |
| drinker | rode neus, dikke buik, kroes in de hand |

- **Op het lijf van de boer én van de boerin.** Een boer kan elk karakter loten dat bij hem past, dus
  acht karakters komen er twee keer. De weduwe en de vroedvrouw zijn altijd vrouw: achttien vellen.
- **In twee rondes.** Eerst de vijf van de vaste verdeling (zanger, weduwe, woekeraar, vroedvrouw,
  heethoofd) als proef, dan de andere vijf. Wie nog geen eigen vel heeft, blijft de gewone boer of
  boerin.

**Ronde 1 gemaakt (25 sep 2026):** acht vellen, van `boer-zanger` tot `boerin-vroedvrouw`. De
karakters zijn opties op `boer()` en `boerin()`; de tabel met die opties staat in
`gereedschap/pixelart/karakters.cjs`. De proefplaat is `uit/dorpelingen/karakters-ronde1.png`.
Zonder opties komen de gewone boer en boerin er pixel voor pixel hetzelfde uit. Wat erbij gekozen
werd, buiten de tabel:
- de zanger heeft geen hooivork of mand meer: zijn armen hangen, de luit hangt aan een band;
- de weduwe houdt haar mandje eieren;
- het bont van de woekeraar is grijs (grauwerk), want licht bont viel samen met de witte doek, en de
  woekeraar-boer draagt een vilten hoed en leren schoenen in plaats van stro en klompen;
- het heethoofd staat met de vuisten in de zij, en de boer heeft geen hoed maar haar dat rechtop
  staat.

Nog niet goed:
- van voren zie je van de luit alleen de kop boven de schouder;
- het rode gezicht van het heethoofd is het hele hoofd, en dat kan op een masker lijken;
- het gezicht van de woekeraar valt donker onder zijn hoedrand.

**Ronde 2 gemaakt (25 sep 2026):** tien vellen, van `boer-vrome` tot `boerin-drinker`. Daarmee
heeft elk karakter een eigen vel, achttien in totaal. De proefplaten zijn
`uit/dorpelingen/karakters-ronde2.png` en `karakters-alle.png`: alle achttien naast elkaar, en ze
zijn van elkaar te onderscheiden. Wat erbij gekozen werd, buiten de tabel:
- de vrome houdt de handen gevouwen, met een koperen kruisje aan de rozenkrans. De boer draagt een
  grijze kap met een schoudermanteltje;
- de roddelaar draagt een omslagdoek, geruit geel en paars, en houdt een hand bij de mond;
- de oudste loopt wat krom (13°), met een geschilde stok die als een derde voet meeloopt. De boer is
  kaal, met grijze plukken en een baard; de boerin draagt een donkere doek;
- de nieuwkomer draagt een gele zoom met een rode zigzag, en de boer een scheve blauwe baret; de
  banden van de bundel zijn op de borst geknoopt;
- de drinker heeft alleen een rode neus, geen rood gezicht zoals het heethoofd, en een hand op
  zijn buik.

De nek van de oudste zit lager (47 en 48 px, tegen 51 bij de rest), omdat zijn lijf krom is. Het
halsijzer zit bij alle achttien onder de kin.

## De marskramer loopt (Marcel, 25 sep 2026)

Marcels volgende keus voor het tekenwerk. De marskramer komt drie keer per jaar, maar leende het
vel van Wim, de knecht uit het oude spel. Zijn eigen figuur bestond al in `dorpelingen3.cjs`
(klein en krom onder een draagrek vol potten en pannen, met een lappenjas, gestreepte kousen, een
rode hoed met een gele veer en een wandelstok), maar kon nog niet staan en lopen. Dat komt erbij,
net als bij de andere dorpelingen, zonder dat zijn stilstaande beeld verandert.

**Gemaakt (25 sep 2026):** het vel `marskramer`, met staan en lopen in acht richtingen; de
proefplaat is `uit/dorpelingen/marskramer-proef.png`.
- Zijn stilstaande platen zijn pixel voor pixel gelijk gebleven.
- Het rek gaat met zijn romp mee en kantelt lopend iets na. De ketel en de pan schudden bij elke
  stap, en de linten wapperen, 1 à 2 pixels.
- Zijn stok loopt als een derde voet met de linkervoet mee, en staat een kwart van de cyclus op de
  grond.
- In het spel leent hij niets meer van Wim.

## Het vee: een koe en een schaap (Marcel, 25 sep 2026)

Voor de weides met vee (`spel.md`, "Weides met koeien en schapen"). Marcel koos: eerst de dieren
tekenen, dan de regels. Een koe en een schaap, net als de dorpelingen uit acht richtingen, met:
- **grazen**, de kop omlaag, en het meeste van de tijd;
- **staan**, kauwend, met de staart en de oren;
- **lopen**;
- **liggen**.

Middeleeuws vee was klein. Niet elk dier is hetzelfde ("Niets is gelijk"): een paar kleuren per
soort, zodat een kudde leeft.

**Gemaakt (25 sep 2026)** in `gereedschap/pixelart/vee.cjs`, op het tuig van de wolf; de
proefplaat is `uit/vee-proef.png`.

| | kleuren | maat |
|---|---|---|
| koe | roodbruin (`koe0`), zwart (`koe1`), zwartbont met witte sokken en een bles (`koe2`) | zo'n 1,05 m in de schoft, met haar rug ter hoogte van de borst van een boer; bijna twee tegels lang; een bredere cel (128×108) |
| schaap | vuilwit met modder (`schaap0`), bruin (`schaap1`), vuilwit met een zwarte kop en zwarte poten (`schaap2`) | tot de knie of dij van een boer |

- **Vier houdingen, elk een lus van acht beelden.** Grazen, met de kop tot op het gras en twee
  rukken aan een pluk. Staan, herkauwend, met een zwiepende staart en een oor dat draait. Lopen,
  in een stapgang van vier tellen: de koe 0,9 tegel per seconde, het schaap 1,1. Liggen, op de
  borst en een beetje op één zij.
- **Welke rust een stil dier kiest,** komt uit zijn zaad en de tijd, zonder toeval per beeld
  (`T.rustVanDier`, `js/vee.js`). Gemiddeld graast een koe 60% van de tijd, staat ze 25% en ligt ze
  15%; het schaap graast meer. Nooit ligt de hele kudde tegelijk, en dieren slaan niet op
  hetzelfde moment om.

## De heide (25 sep 2026)

Nieuwe grondsoort voor de meent, waar de schapen van het gehucht grazen (Marcel koos dit op 25 sep,
`spel.md`, "Marcel koos voor stap 2"). Gemaakt in `gereedschap/pixelart/randtegels.cjs`: de
grondsoort `heide` en de terreinset `Heide over gras` (`a: 'gras', b: 'heide'`), met de acht vlakke
varianten en de veertien hoekcombinaties × vier varianten, net als de vier bestaande paren.

**Heide het hele jaar door,** dus geen felle paarse bloei — augustus is maar één maand.
Eén eigen ramp (`heide` in `kern.cjs`-stijl, net als `modderwater` en `veldsteen` ervoor: een eigen
ramp toevoegen zonder `dorp.cjs` aan te raken), die zelf van donker olijfbruin naar gedempt
grijsgroen drift, zoals `gras` en `aarde` dat ook binnen één ramp doen. De klontjes van de struik
komen uit hetzelfde verspringende rooster als de grasplukjes (`plukOp`), maar kleiner en ronder
(`heideBolOp`/`HEIDE_BOL`): heide is een bos twijgjes, geen los blad. Een deel van de lichte koppen
valt in de `mos`-ramp (grijsgroen tussen het bruin door) en heel af en toe in de `steen`-ramp
(gedempt paarsgrijs — die ramp trekt toch al naar paars, en hier is dat voor het eerst precies de
bedoeling). Verspreid ook een enkele kale plek wit-geel zand of een schapenpaadje, met de lichte
stappen van de bestaande `zand`-ramp.

**Twee dingen die niet werkten, voor wie hieraan verder bouwt:**
- Een harde grens tussen twee ramen (bruin/groen) voor de grove kleurzones gaf grote, hard
  omlijnde vlekken — precies het "flikkeren op een groot vlak" dat juist niet mocht. De oplossing:
  de kleurdrift IN de ramp laten zitten, en groen/paars alleen als klein accent op een klontkop.
- Een lagere ruisfrequentie dan `grasToon` (of meer dan drie stappen) liet de ruis zelf als lange
  diagonale strepen zien: het isometrische aanzicht trekt de rasterrichting van `ruis2` recht bij
  weinig octaven. Op precies het ritme van `grasToon` (dezelfde twee schalen, dezelfde drie
  stappen) verdween dat. Wie hier een volgende grondsoort op bouwt, begint dus bij die frequentie.

**Bewijs dat er niets verschoof:** de eerste 262 tegels van `rand.tsx`/`rand.png` (alles van vóór
25 sep) zijn met een apart controlescript vergeleken op naam, groep, vast-waarde én op pixel, en
zijn onveranderd; de vier bestaande terreinsets houden dezelfde tegel-ids en wangids. "Heide over
gras" telt 72 tegels (8 gras-vlak, gedeeld met de bestaande terreinsets + 8 heide-vlak + 56
hoektegels); de 64 nieuwe daarvan staan pas achteraan, vanaf id 262, ruim binnen de
`RAND_CAPACITEIT` van 600 in `naar-tiled.cjs`.

**Op speelschaal (Claude, later op 25 sep):** op de kaart liet elke tegel een lichte ruit zien, en
daarna een dambord van lichte en donkere tegels. Twee oorzaken, allebei in `heideToon`: de
roosterpunten van `ruis2` (waarde-ruis op hele getallen) lagen op 1,05 vrijwel op de hoeken van de
tegels, en een grove toonvlek zo groot als een tegel houdt op aan zijn rand, want elke tegel is uit
een andere plek van de ruis gesneden. Nu is de ruis 37 graden gedraaid (`heideRuis`), op schalen die
niet op de tegels passen, en doet de fijne ruis het werk; de grove geeft alleen een zweem. De
zandplekjes zijn zeldzamer. Het leest nu als lage, gevlekte heide. Wie een volgende grondsoort
maakt: begin niet bij een lage frequentie, en houd het rooster van de ruis los van dat van de
tegels.

**Nog ruw:**
- Het blijft aan de rustige kant — vooral van dichtbij (zie `uit/heide-proef.png`) oogt het wat
  uniform, met weinig echt uitgesproken paarse of groene plukken. Dat was bewust: de eerdere,
  drukkere versies flikkerden over een groot vlak. Een tussenweg (iets meer, iets grotere
  plukken) is nog niet geprobeerd.
- Geen apart element voor een schapenpaadje als LIJN (een echt platgelopen spoor); de zandplekjes
  van nu zijn los en willekeurig, niet een pad dat ergens heen loopt zoals de karrensporen op het
  zandpad.
- Nog niet op een echte kaart gelegd of in het spel bekeken op speelschaal (alleen als losse
  proefplaat) — dat komt zodra de heide bij het gehucht getekend wordt.

## Open

- **Bewegende omgeving:** vlammen, water, en de stofjes in de zonnebundel. De wind staat hierboven.
- **Portretten** van dorpelingen voor de gesprekken. (De effecten van spreuken zijn er sinds 21 sep 2026, zie `spreuken.md`.)
