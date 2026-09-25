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
  dus opnieuw als er een figuur bijkomt. Schrijft naar `beelden/effecten/`.

De buitenwereld, elk met een eigen exportscript (`node <bestand>-export.cjs`):

- `bomen.cjs`: eik, herfsteik, den, berk, dode boom, treurwilg en appelboom, plus struiken,
  varens, gras, bloemen, paddenstoelen, stronken en rotsen, en een grasvloer.
- `dorp.cjs` en `dorp2.cjs`: de grond (gras, zandpad, kasseien, water), de huizen (`huis(o)`
  bouwt er een uit onderdelen), en de plekken: kapel, kerkhof, watermolen, bakkerij, kruidenhut,
  jagershut, het huis van de dorpsoudste, het bruggetje en de vijver.
- `dorpelingen.cjs`, `dorpelingen2.cjs` en `dorpelingen3.cjs`: negentien dorpelingen, van de smid
  tot de kleuter, plus `dorpeling(zaad)` die uit elk zaad een andere gewone dorpeling maakt.
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
- `schandpaal.cjs`: de schandpaal, leeg en bezet, en het halsijzer als eigen laag over wie eraan
  staat (`node schandpaal.cjs` maakt de proefplaat `uit/schandpaal-proef.png`, daarna
  `node naar-spel.cjs --alleen schandpaal`). De hoogte van de nek wordt gemeten op de boer en de
  boerin zelf; komt er een vel bij dat aan de paal kan, zet het dan in `FIGUREN` daar.
- `bosvijanden.cjs`: wolf, reuzenspin en kobold, met houdingen (`bosvijanden-anim.cjs`).
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
