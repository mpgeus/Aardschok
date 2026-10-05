# Pixel art uit code

De HD-pixel art van Aardschok wordt niet getekend maar gerenderd. Elke figuur en elk voorwerp is
een klein 3D-model. De renderer fotografeert het uit acht kijkrichtingen en brengt het daarna
terug tot pixel art: vaste kleurrampen, harde randen, een donkere omlijning, licht van linksboven
en weinig dithering. Zo kloppen de acht kanten altijd met elkaar, en kunnen er later
loopanimaties bij. Fallout en Diablo maakten hun poppetjes op dezelfde manier.

Maten zoals in het spel: een tegel is 64×32, een muur 128 pixels hoog, de tovenaar zo'n 88.

```bash
npm run pixelart            # stilstaande beelden naar uit/
npm run pixelart:animaties  # animaties naar uit/animaties/ (ruim een minuut, alle kernen)
```

Dat schrijft alle beelden naar `uit/` (niet in git). Er zijn geen afhankelijkheden, alleen Node.

## Bestanden

- `kern.cjs`: het palet, de camera en de renderer. Muren en vloeren zijn dozen met een textuur
  per pixel; figuren en voorwerpen zijn afstandsfuncties (SDF). Verder: licht, omlijning,
  terugbrengen tot vaste kleuren, en PNG.
- `figuren.cjs`: bouwstenen en de tovenaar, die met de jaren krommer wordt, een langere baard
  krijgt en een hoed waarvan de punt omzakt.
- `figuren2.cjs`: Wim, het skelet en de slijmkruiper.
- `voorwerpen.cjs`: tafel, fontein, kist, ton, zak, wandrek, wandlamp, puin, sleutel, vuurschicht.
- `kamers.cjs`: stenen, vloeren, deuren, ramen, het wandkleed, de hal en de voorraadkamer, en
  het zonlicht door het glas-in-lood.
- `portret.cjs`: hoofd en schouders voor het gesprek en het leeftijdspaneel.
- `houding.cjs`: het gereedschap om figuren te laten bewegen. Een figuur bestaat uit botten,
  groepen delen die samen star bewegen; een houding zet ze per beeld neer. Verder: de loopcyclus
  van een voet (die op de grond precies met de loopsnelheid meeschuift, dus niet glijdt), de
  elleboog bij een verplaatste hand, en de grensbol om een figuur in een nieuwe houding.
- `export.cjs`: alles wegschrijven. `bekijk.cjs`: één figuur vergroot, om details te beoordelen.
- `animaties-export.cjs`: de animaties. Per figuur en houding een vel (rij per richting, kolom
  per beeld), een JSON met cel, anker, snelheid en houdingen, en bewegende PNG's om te kijken.
  Een bouwfunctie krijgt de houding mee: `tovenaar(leeftijd, { houding, fase })`. Zonder houding
  komt er precies de stilstaande figuur uit; de vellen van `npm run pixelart` blijven gelijk.
- `apng.cjs`: een reeks beelden als bewegende PNG, om animaties te bekijken.
- `effecten.cjs` (`npm run pixelart:effecten`): wat een spreuk laat zien. De kop van de
  vuurschicht in zestien richtingen, het opbouwen in de bol, de inslag, het dwaallicht, en de
  grijze zucht in drie maten die van een tovenaar opstijgt als hij betaalt. Het meet ook de bol en
  het gezicht op de vellen van de figuren, zodat een spreuk precies uit de bol komt; draai het
  dus opnieuw als er een figuur bijkomt. Schrijft naar `uit/effecten/` (tot 25 sep naar
  `beelden/effecten/`; sinds de spreuken uit het spel zijn, laadt het spel ze niet meer).

De buitenwereld, elk met een eigen exportscript (`node <bestand>-export.cjs`):

- `bomen.cjs`: eik, herfsteik, den, berk, dode boom, treurwilg en appelboom, plus struiken,
  varens, gras, bloemen, paddenstoelen, stronken en rotsen, en een grasvloer.
- `dorp.cjs` en `dorp2.cjs`: de grond (gras, zandpad, kasseien, water), de huizen (`huis(o)`
  bouwt er een uit onderdelen), en de plekken: kapel, kerkhof, watermolen, bakkerij, kruidenhut,
  jagershut, het huis van de dorpsoudste, het bruggetje en de vijver. De werkplaatsen van het spel
  komen nog hiervandaan (`tegels/gebouwen/`, een bestand per tekening); de huizen niet meer (zie hieronder).
- `huis-sdf.cjs`: de huizenbouwer op ronde vormen (`ontwerp/beeld.md`, "De huizenbouwer op ronde
  vormen"): elk huis in elke vorm en elk materiaal, niet waterpas, met uitbouwen. Bovenaan staat wat
  een opgave kan. `huis-sdf-export.cjs` maakt er proefplaten van (`uit/proefhuis/`), en
  `tuin-sdf.cjs` de losse tuinstukken. Sinds vraag 114 (2b en 2c) ook kalk in drie kleuren, baksteen en zandsteen,
  torens met een steil dak (zadeldak, tentdak, naaldspits), de ramen van een kapel en een woontoren, een
  uithangbord, en gebouwen uit meer delen (`samen`: de kapel met haar toren, de herberg met zijn stal);
  `node huis-sdf-export.cjs afwisseling`, `verhouding` en `steen` maken de proefplaten daarvan
  (`ontwerp/beeld.md`, "De afwisseling en de grote gebouwen").
- `huizen.cjs`: de huizen van het spel (ronde 4b): een vaste lijst opgaven (`HUIZEN`), en hoe er een
  voor het vel gerenderd wordt, met zijn voet en de tegel voor zijn deur. `node naar-tiled.cjs huizen`
  zet ze in `tegels/huizen/`, elk huis een eigen bestand dat het spel pas laadt als het op de kaart staat (vier
  minuten, in vier draden; werklijst vraag 114, stap 1), `node bouwfasen.cjs` maakt hun vijf
  bouwfasen (uit het huis zelf gesneden; een kwartier voor alle gebouwen samen), en
  `node huizen.cjs [namen]` een proefplaat met voet en deur erop (`uit/huizen/proef.png`). Een nieuw
  huis: een regel in `HUIZEN`, dan die drie stappen, en `T.GEBOUWEN` in `js/gebouwen.js`.
- `inpakken.cjs`: hoe een vel naar het spel gaat (werklijst vraag 114, 2a). `naar-tiled.cjs` pakt elk vel
  behalve de grond in (elke tekening strak gesneden, met zijn eigen rechthoek en anker in `tegels.json`),
  `bouwfasen.cjs` geeft elk gebouw een eigen vel in `tegels/bouwfasen/`, en `naar-spel.cjs` laat de cel van
  een figuur krimpen tot wat erin staat. Een tekening verandert daar niet van, alleen waar hij op het vel staat.
- `dorpelingen.cjs`, `dorpelingen2.cjs` en `dorpelingen3.cjs`: negentien dorpelingen, van de smid
  tot de kleuter, plus `dorpeling(zaad)` die uit elk zaad een andere gewone dorpeling maakt. De
  marskramer daarin kan staan en lopen, met zijn rek op de rug en zijn stok als derde voet
  (`node dorpelingen-anim.cjs marskramer`, dat ook de proefplaat `uit/dorpelingen/marskramer-proef.png`
  maakt, daarna `node naar-spel.cjs --alleen marskramer`).
- `heer.cjs`: het huis van de heer, in rood en geel: de heer, de soldaat en de inner, met staan en
  lopen (`node dorpelingen-anim.cjs heer soldaat inner`, daarna
  `node naar-spel.cjs --alleen heer,soldaat,inner`).
- `karakters.cjs`: een gezicht per karakter (`ontwerp/beeld.md`): wat een boer met een karakter
  draagt, op het lijf van de boer of de boerin. `boer(stand, opties)` en `boerin(stand, opties)`
  nemen de opties (kleuren, hoofddeksel, wat ze dragen en vasthouden, de armen); zonder opties
  blijven ze de gewone boer en boerin, en `KARAKTERS` zegt per karakter welke. Ronde 1: boer-zanger,
  boerin-zanger, boer-woekeraar, boerin-woekeraar, boer-heethoofd, boerin-heethoofd, boerin-weduwe
  en boerin-vroedvrouw. Ronde 2: de vrome, de roddelaar, de grijsaard (de oudste), de nieuwkomer en
  de drinker, elk als boer- en boerin-. `node dorpelingen-anim.cjs <namen>` maakt ook de proefplaten
  `uit/dorpelingen/karakters-ronde1.png`, `karakters-ronde2.png` en `karakters-alle.png` (alle
  achttien op een rij), daarna `node naar-spel.cjs --alleen <namen,met,komma's>` en
  `--alleen schandpaal` voor hun nek.
- `werkfiguren.cjs`: de boer en de boerin aan het werk op hun veld (werklijst vraag 111, b en c), op dezelfde manier als
  de maaier (`maaier.cjs`): het lijf van de gewone boer met strohoed en kiel (`werkBoer`), of dat van de gewone boerin
  met witte hoofddoek, terracotta jurk en blauw schort (`werkBoerin`), met eigen gereedschap en een eigen houding voor
  het werk, uit sleutelbeelden. De zaaier (staan, lopen, zaaien: breedwerpig uit een zaaidoek; de vuist gaat in de zak,
  en bij de worp gaan de vingers open en vangt een waaiertje zaad even het licht), de wieder (staan leunend op de
  schoffel, lopen met de schoffel over de schouder, wieden: hakken en trekken, met kluiten; de schoffel is een plat,
  breed blad aan een zwanenhals, dat van elke kant als schoffel leest), de sprokkelaar (een takkenbos op zijn rug;
  staan, lopen, rapen: door de knieën tot hij hurkt, de rug zo recht als zijn korte armen toelaten en het hoofd
  omhoog, een tak oprapen en over de schouder in de bundel steken, waar hij blijft) en de hakker (vraag 107, f: de
  bijl, een steel van essenhout van een kleine meter met een ijzeren wig met een licht randje aan de snede, `bijl`;
  staan met de kop op de grond naast zijn voet en de hand op de knop, lopen met de bijl over de schouder, hakken: met
  twee handen over de rechterschouder omhoog en van rechtsboven schuin naar beneden tot de snede op kniehoogte in de
  stam slaat, een tegel voor hem, even stil en terug; ook voor de wortels van een stronk). Elk heeft een vrouw met
  precies dezelfde houdingen, beelden en fps, zodat het spel bij een boerin alleen de naam wisselt: de zaaister, de
  wiedster, de sprokkelaarster, de hakster, en de maaister (de zeis en de slag van de maaier, `zeisInDeHanden` en
  `houdingMaaier`). Haar rok
  zwaait mee zoals in haar loopcyclus, en als ze hurkt, zakt hij mee en bolt hij over haar knieën (`rokProfiel`). De
  sleutels zijn voor de boer gemaakt; haar handen gaan dezelfde weg vanuit haar eigen, lagere schouders, naar de lengte
  van haar arm (`naarLijf`). Een hand die opengaat, krijgt vingers (`hand`). Staan en lopen zijn die van de boer of de
  boerin zelf, met hun eigen pas. `node werkfiguren-anim.cjs` schrijft de vellen naar `uit/<naam>/animaties/` (met een
  bewegende PNG per houding) en de proefplaat `uit/werkfiguren-proef.png` (bovenaan de gewone boer en boerin, dan per
  werk een rij voor de man en een voor de vrouw, op 1×; `--proef` alleen die), daarna
  `node naar-spel.cjs --alleen zaaier,wieder,sprokkelaar,hakker,zaaister,wiedster,sprokkelaarster,maaister,hakster`. Na elkaar zo'n
  twintig minuten; met een figuur per proces tegelijk (`node werkfiguren-anim.cjs sprokkelaarster` enzovoort, vier
  tegelijk) zo lang als de sprokkelaarster, en daarna `--proef`.
- `schandpaal.cjs`: de schandpaal, leeg en bezet, en het halsijzer als eigen laag over wie eraan
  staat (`node schandpaal.cjs` maakt de proefplaat `uit/schandpaal-proef.png`, daarna
  `node naar-spel.cjs --alleen schandpaal`). De hoogte van de nek wordt gemeten op de boer en de
  boerin zelf; komt er een vel bij dat aan de paal kan, zet het dan in `FIGUREN` daar.
- `paaltje.cjs`: het paaltje op de hoeken van een vrij erf (werklijst, vraag 52): een dunne, licht
  verweerde landmeterspaal tot de knie van een dorpeling, met een reepje doek en een hoopje aarde.
  Eén tekening (20×31, anker 10,25 op de grond in het midden van de tegel; `node paaltje.cjs`
  maakt de proefplaat `uit/paaltje-proef.png` en zegt of hij nog in zijn cel past, daarna
  `node naar-spel.cjs --alleen paaltje`). Het spel vraagt hem met `T.sprites.paaltje()`.
- `bosvijanden.cjs`: wolf, reuzenspin en kobold, met houdingen (`bosvijanden-anim.cjs`).
- `vee.cjs`: de koe en het schaap (`beeld.md`, "Het vee"), op het tuig van de wolf, met vier
  houdingen: grazen, staan, lopen en liggen. Elk in drie kleuren, een vel per kleur (`koe0..2`:
  roodbruin, zwart, zwartbont; `schaap0..2`: vuilwit, bruin, zwartkop). De koe heeft een bredere
  cel (128×108). `node vee-anim.cjs` rendert ze (met namen erachter alleen die) en maakt de
  proefplaat `uit/vee-proef.png` (`--proef` alleen die); daarna
  `node naar-spel.cjs --alleen koe0,koe1,koe2,schaap0,schaap1,schaap2`.
- `toren.cjs`: de toren van de oude meester in drie staten, met een eigen renderer voor zijn
  hoogte, en `toren-lagen.cjs` dat hem in lagen snijdt voor het spel.
- `trap.cjs`: de spiraaltrap, in dezelfde drie staten als de toren (ingestort, provisorisch,
  hersteld). Twee stukken: de spiraal om een spil die door een gat in het plafond verdwijnt, en
  het gat in de vloer waar de trap van beneden aankomt. Hij beslaat drie bij drie tegels, want
  een spiraal waar een man doorheen past is minstens twee meter breed; het anker is de voorste
  hoek van die negen tegels. `naar-spel.cjs` rendert hetzelfde vel naar `beelden/trap.png`.

## Afspraken

- Eenheden: één eenheid breed is één pixel, één eenheid hoog is 0,866 pixel. Een tegel is 45,25
  eenheden. Lokale assen van een model: x naar rechts, y naar voren, z omhoog; de voeten staan op
  z = 0, midden op de tegel.
- Een model bestaat uit delen: `{ f, g, m, deel, k, uit }`. Dat is de afstandsfunctie, de
  grensbol, het materiaal, het deelnummer voor binnenlijnen, de zachte naad, en of het deel iets
  wegsnijdt. Een materiaal is `{ ramp, lo, hi, patroon, glans, gloei, detail }`.
- Texturen geven hele stappen in een ramp; alleen licht maakt tussenwaarden. Dan wordt er alleen
  gedithered waar het licht van tint verandert, en blijven stenen en planken schoon.
