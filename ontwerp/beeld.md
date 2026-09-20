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
beek, en noemde die stijl "echt passend". Wat we eruit overnemen:

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

## Open

- **Bewegende omgeving:** vlammen, water, en de stofjes in de zonnebundel. De wind staat hierboven.
- **Effecten** van spreuken, en portretten van dorpelingen voor de gesprekken.
