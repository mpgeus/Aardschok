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

- **Doorkijk.** Een hoog voorwerp dat de held of een wezen bedekt, wordt doorzichtig zolang dat
  zo is, of het silhouet van de figuur wordt eroverheen getekend. Zo doen Fallout, Diablo en
  Baldur's Gate het ook. Bepalen wat wat bedekt gaat op tegels en hoogte, niet op pixels, want
  het moet elk beeld kunnen. De overgang loopt in een paar tienden van een seconde op en af,
  anders klappert het.
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

## Bouwen: een huis dat groeit (onderzoek Claude, 24 sep 2026)

Marcel, 23 sep: "eerst zie je een paar stenen, dan wat hout erbij en gaandeweg steeds meer van het
gebouw tot het klaar is." En 24 sep: "De bouwfase van de gebouwen zijn nog niet goed genoeg."

**Wat er nu mis is** (in het spel bekeken, op spelgrootte):

- **Het is te kort om te zien.** Een dag duurt 2,5 seconde. Een hut staat er in 5 seconden, een
  huis in 10; elke fase is 1 tot 2 seconden in beeld, op 3× een halve.
- **Er vallen fases weg.** Neerzetten rondt de dag naar beneden af (`klaarOp`), de fase rekent met
  de dag mét breuk. Wie laat op de dag bouwt, begint in fase 2 of 3 en is ook eerder klaar.
- **Het wisselt in plaats van te groeien.** De stenen ring, het houten geraamte en het hek van
  steigers verdwijnen weer in de volgende fase. Het zijn vijf losse plaatjes, geen huis dat
  aangroeit.
- **Het is geen bouwplaats.** De fundering is een dun grijs lijntje in het gras; binnen de muren
  groeit gras; de ramen branden en de luiken hangen er al; een stenen huis krijgt een houten kooi
  die er later niet meer is; de steiger leest als een hek; het dakgebinte leest op spelgrootte als
  een bruin gestreept dak, en half gedekt als een dak in twee kleuren.
- **Er gebeurt niets.** Geen bouwers, geen stof, geen geluid, geen stapel die slinkt. In elk
  bouwspel is de bouwplaats de plek waar het meest beweegt; hier is het de stilste plek van het dorp.

**Hoe anderen het doen:**

- *The Settlers II*: een bord op de plek, dan stapels planken en stenen bij de deur die één voor
  één worden aangevoerd en opgebruikt. Het huis staat er twee keer in: eerst het houten geraamte,
  dan het afgewerkte huis, allebei van onder naar boven zichtbaar naarmate er gebouwd is (in de
  nabouw Return to the Roots: `skeleton.drawPercent` en `building.drawPercent`).
- *Knights and Merchants*, onze referentie voor het dorp: ook hout en dan steen, maar niet met een
  rechte lijn. De nabouw (KaM Remake) tekent een huis in aanbouw met een alpha-toets op een tweede
  textuur: elke pixel heeft zijn eigen drempel, dus het huis groeit rafelig, steen voor steen.
- *Manor Lords*: de grond wordt geëffend, het materiaal aangevoerd, en er wordt gebouwd tot het op
  is. De maker heeft bestudeerd hoe er toen gebouwd werd (vakwerk, stijl en regel, krukspanten).
- *Anno*: bijna meteen, met stof en een steiger die opspringt. Bouwen is daar geen schouwspel.

**Hoe het echt ging:**

- Steigers waren palen, met touw gesjord. Korte balkjes staken in gaten in de muur (die gaten zie je
  nog in oude kerken en kastelen), de vloeren waren horden van vlechtwerk, en de ladders waren van
  ruwe palen.
- Riet gaat vanaf de dakvoet omhoog, laag over laag, op horizontale latten; de nok komt het laatst.
- Vakwerk: eerst het geraamte, dan de vakken dicht met vlechtwerk en leem. Het geraamte blijft
  zichtbaar in het afgewerkte huis. Een stenen huis heeft geen houten geraamte: de muren groeien
  laag voor laag.
- Het hoogste punt: als het dakgebinte staat, komt er een meiboom op de nok en krijgen de bouwers
  pannenbier. In Limburg en de Achterhoek doen ze het nog; de meiboom zelf staat al in
  13e-eeuwse Duitse bronnen.

**Het inzicht:** onze kunst komt uit 3D. Wat Knights and Merchants per huis als masker meegaf,
kunnen wij uitrekenen: elke pixel weet hoe hoog hij in de wereld zit. Zo groeit een muur laag voor
laag, ook de achterste, en raakt een dak vanaf de voet bedekt tot aan de nok, met wat ruis per
steen of bundel zodat het niet als een schuifje leest.

**Voorstel, in drie lagen:**

1. **Vloeiend** (spelcode, klein): de fout eruit, en tussen twee fases groeit de volgende van
   onder naar boven over de vorige heen, in plaats van vijf sprongen.
2. **Nieuwe fases** (`bouwfasen.cjs`): elke fase telt op en haalt niets weg. Per materiaal de echte
   volgorde (steen: muren laag voor laag; vakwerk: geraamte, dak, dan de vakken; blokhut: balk op
   balk). Kale grond met paaltjes en touw; stapels hout, steen en riet die slinken; een steiger met
   ladder en horden; slanke sporen met lucht ertussen, dan latten, dan riet of leien vanaf de voet;
   ramen en deur donker tot het af is; de meiboom op het hoogste punt.
3. **Leven** (raakt het spel): bouwers die er lopen en timmeren; bouwen kost handen, dus wie bouwt,
   oogst niet; in de vorst ligt het werk stil; pannenbier als klein moment.

**Besloten (Marcel, 24 sep 2026):** laag 2 en 3: nieuwe fases, bouwers op de bouwplaats, en bouwen
kost handen (met de vorst en het pannenbier, zie `spel.md`, "Bouwen kost handen"). Vloeiend groeien
niet. Een gebouw staat drie keer zo lang in de steigers als eerst (hut 6 dagen, huis 12): een halve
minuut op 1×. De fout met de overgeslagen fases verdwijnt vanzelf, want de voortgang komt nu uit
gedaan werk en niet meer uit de klok.

**Nog steeds nep (Marcel, 24 sep, na de eerste ronde):** "Gebruik ook de niet waterpas module om
de huizen 'echt' te maken. [...] Het bouwproces moet realistisch zijn en overeenkomstig met het type
gebouw. Detail is wat dit spel overeind houdt." De oorzaak: de huizen in het spel, en dus ook hun
fases, komen nog uit de oude `huis()` in `dorp.cjs`, die uit rechte dozen bouwt. De huizen die niet
waterpas zijn (`huis-sdf.cjs`, rondes 1 tot 3 van de huizenbouwer) zijn nooit in het spel gekomen:
ronde 4b staat nog open. Bouwfases op een recht huis blijven nep, hoe ze ook getekend zijn. Een
schema van vijf gelijke fases voor elk huis ook: dat is geen bouwen, dat is een diavoorstelling.

**Voorstel (Claude, 24 sep):** de fases komen uit `huis-sdf.cjs`, uit hetzelfde huis als het
afgewerkte, met hetzelfde zaad. Dan zit in elke fase dezelfde scheve balk, dezelfde doorzakkende
nok, dezelfde leunende schoorsteen: het huis groeit echt naar zichzelf toe. En elk type gaat zoals
het echt ging, met zoveel stappen als het werk vraagt, en elke stap zo lang als het werk duurt (een
dak van riet dekken kost meer dagen dan een kap opzetten). Het hoogste punt is waar de kap staat.

*Vakwerk (gepleisterd) en vlechtwerk (leem), met riet: het huis.*

1. Uitzetten: de grond geëffend en vertrapt, paaltjes met een touw op de hoeken. Ernaast eiken
   balken met telmerken, veldstenen, schoven riet, bossen tenen, een leemkuil.
2. De voet: een lage muur van veldsteen, laag voor laag in de leem gelegd.
3. Het gebint: voetbalken, stijlen, regels en schoren, en de muurplaat erop. Precies het vakwerk van
   het afgewerkte huis, dezelfde scheve balken, maar met lucht in de vakken. De kozijnen staan er al.
4. De kap (hoogste punt): sporen, hanenbalken, de nok met zijn doorzakking. De meiboom op de nok.
5. Het riet: latten op de sporen, en het riet van de voet omhoog, laag voor laag, met de ladder
   van de rietdekker op het dak en schoven erbij. De vakken dicht met staken en tenen.
6. Leem in de vakken, de nok gedekt, de schoorsteen.
7. Af: gewit (vakwerk) of bruin (vlecht), deur, luiken, de steiger weg.

*Vlechtwerk met leem, met riet: de hut (Marcel, 24 sep: van vlechtwerk, en als eerste na het
vakwerkhuis).* Een lage hut van één ruimte, zoals de armsten in een dorp rond 1323 woonden. Hij
staat op de grond, zonder stenen voet, en heeft geen schoorsteen: de haard ligt midden in de hut,
en de rook trekt door een rookgat in het riet.

1. Uitzetten: vertrapte grond, de hoeken afgezet. Ernaast een bos staken, bossen wilgentenen,
   schoven riet, een leemkuil met stro.
2. Palen: de hoekpalen en de staken van de wanden in de grond, de deurstijlen en een drempel.
3. Vlechtwerk: de tenen tussen de staken gevlochten, van onder naar boven, tot de muurplaat. Het
   venstertje is een gat.
4. De kap (het hoogste punt): een paar sporen op de muurplaat, een nokbalk, en een tak op de nok.
   Ook de armen vieren het hoogste punt.
5. Riet: latten op de sporen, en het riet van de onderkant omhoog, met het rookgat.
6. Leem: leem met stro op het vlechtwerk, nog nat en donker.
7. Af: de leem droog en licht, een deur van planken.

*Veldsteen.* Uitzetten met een sleuf; de muren laag voor laag tot heuphoogte, het deurkozijn staat
er al in; op hoogte, met een steiger van gesjorde palen, korte balkjes die in gaten in de muur
steken, horden als vloer en een ladder, en lateien boven ramen en deur; de kap en de meiboom; het
dak vanaf de voet; af.

*Planken.* Uitzetten; de voet en de voetbalk; stijlen en regels; planken van onder naar boven, met
steiger; de kap en de meiboom; het dak; af.

*Blokhut.* Uitzetten met een stapel geschilde stammen; de onderste stammen op stenen, de hoeken
gekeept; stammen tot halverwege, met gaten voor deur en raam; op hoogte, met de kopgevels; de kap en
de meiboom; het dak; af.

*De boerderij (een hallehuis) gaat anders:* eerst de poeren, dan de gebinten (rijen van twee stijlen
met een ankerbalk, met touwen overeind gezet), dan de kap met de meiboom, dan het riet, en pas dan
de wanden tussen de stijlen en de grote deur in de kopgevel. De wanden dragen niets, dus ze komen
het laatst.

*In elke fase:* wat er staat, blijft staan; de stapels worden kleiner naarmate ze opgaan; binnen is
kale grond; ramen en deur zijn donkere gaten tot het gebouw af is; niets is recht, ook de steiger
niet.

**De proefplaat, en eerst dit ene huis in het spel (Marcel, 24 sep).** Het vakwerkhuis met riet staat
in zeven fases uit `gereedschap/pixelart/bouwfasen-sdf.cjs` (zaad 4, `uit/bouwfasen-sdf/`). Marcel
koos om dit ene type eerst in het spel te zetten (ronde 4b, voor één huis), vóór de andere types.
Waarom: de plaat liet zien dat de bouwplaats breder is dan de voet (stapels, steiger, leemkuil), en
het spel kent een huis nog als 6×6 terwijl dit er een van 7×5 is. Dat los je op met één type, en
dan gaan de andere types langs dezelfde weg.

**In het spel: goed (Marcel, 24 sep).** Over het gebint met de bouwers ervoor, in het gehucht: "dat
laatste plaatje ziet er goed uit". De weg ligt daarmee vast: hetzelfde model met hetzelfde zaad,
fases zo lang als het werk, en een bouwplaats in een ring rond de voet. De andere types volgen zo.

## Open

- **Bewegende omgeving:** vlammen, water, en de stofjes in de zonnebundel. De wind staat hierboven.
- **Portretten** van dorpelingen voor de gesprekken. (De effecten van spreuken zijn er sinds 21 sep 2026, zie `spreuken.md`.)
