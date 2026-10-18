# De stijlproef: van 3D-render naar handgemaakte pixel art

Werklijst vraag 180, Marcels zesde opdracht (letterlijk in `opdracht-comfyui.md`, "Zesde opdracht"), 18 okt 2026. Stand:
`main` na 340b939c. De platen staan in `gereedschap/pixelart/uit/hdstijl/` (niet in git); opnieuw maken kost een
minuut: `node gereedschap/pixelart/hdstijl.cjs alles`.

Het wiel is variant C van de HD-proef: dezelfde geometrie, afwikkeling, camera, standen en wereldschaal, gerenderd op de
productiestandaard (4× intern, een sprite van 2×). Alleen wat er na de render gebeurt, verschilt per variant.

## Kort

- **D komt het dichtst bij het doel**, ook op spelgrootte. Het hout is donker en warm (de tonen en de verdeling van het
  doel: 75% donker, 3% licht), de band grijs met een lichte bovenrand en glimlichten, en de spaken hebben goudkleurig licht.
  Elke nagel is een lichte en een donkere pixel. Er lopen donkere lijnen waar onderdelen voor elkaar liggen of elkaar
  raken, met contactschaduw eronder. De omlijning heeft de donkerste kleur van het materiaal.
- **Het blijft vast bij draaien.** Hoeveel een vaste plek op het wiel flikkert, als deel van de kleurspreiding: A 0,15,
  B 0,13, C 0,14, D 0,16. Een nerf verspringt op 4% van de plekken. Na een volle slag is het beeld 100% gelijk aan het
  begin, in elke variant. Op spelgrootte blijft 94% van de nagels zichtbaar in D, tegen 46% in A.
- **Wat de afwerking niet haalt, is geometrie en camera.** Het doel heeft:
  - een velg van brede planken;
  - dikke vierkante spaken met beslag;
  - een grote koperen naaf;
  - een band vol nagels;
  - een wiel dat rechter staat dan onze camera het laat zien.

  De extra kolom op de vergelijkingsplaat (D op de forsere maten van de ChatGPT-wagen, buiten de opdracht) laat zien dat
  de geometrie de volgende stap is.
- **Het kost bijna niets.** Per beeld 20 ms voor de G-buffer en 30 ms voor de stijl, naast 2,2 s render. De renderer zelf
  blijft gelijk: 65 van de 65 beelden zijn pixel voor pixel hetzelfde, en hij is even snel (16 beelden van de ossenkar:
  26,4 s voor en na).

## Wat er gemaakt is (opdracht 2)

Optioneel en herbruikbaar, na de render; zonder de nieuwe opties verandert er niets.

- `kern.cjs`: `tekenModel` met `o.gbuffer` (en `o.rust`) bewaart per pixel in `B.g`:
  - de afwikkeling (`mat.uv` uit `textuurMateriaal`);
  - het licht en de glans;
  - de holte en de bolle rand (de kromming);
  - de zon (1, of minder in een slagschaduw);
  - de normaal maal het licht.

  Daarnaast staan er al het onderdeel, het materiaal, de diepte, de normaal, de plek in rust en het albedo.
- `stijl.cjs`: `gbuffer` brengt die naar de doelmaat. Per doelpixel neemt hij het onderdeel met de meeste subpixels en het
  gemiddelde daarvan, plus de dekking van de nerf op 4×. Op de doelmaat maakt `stileer` er pixel art van, met de stappen
  hieronder, elk aan of uit. De drempels tussen de tonen ijkt `kalibreer` één keer per ding, niet per beeld.
- `stijlmaat.cjs ontleed`: haalt een sprite en een voorbeeld op dezelfde manier uit elkaar. Het materiaal herkent hij aan
  de kleur.
- `hdstijl.cjs`: de proef (ijken, renderen, meten, platen).

| Stap (Marcels punt) | Wat | Waaraan het hangt |
|---|---|---|
| kleurreeksen (1) | per materiaal 7 tonen (hout) of 6 (ijzer), op vaste drempels in het licht; de lichtste toon in D alleen voor accenten | licht, albedo, glans |
| warm licht, koele schaduw (2) | in de reeks zelf: `reeks()` in OKLab, de tint schuift naar blauwpaars in de schaduw en naar geel in het licht | — |
| contactschaduw (3) | een holte donkerder, en een pixel naast een onderdeel dat ervoor ligt één toon donkerder | holte, diepte, onderdeel |
| nerf (4) | korte lijnen langs de nerf (u van de afwikkeling: de lengte van een spaak, rondom de velg), golvend en onderbroken, twee tonen donkerder | afwikkeling |
| variatie (5) | elk onderdeel een eigen toon (±8%: elke spaak iets anders), en grote vlekken uit ruis | onderdeel, plek in rust |
| clusters (6) | het licht eerst glad binnen een onderdeel, daarna de drempels: grotere vlakken | onderdeel |
| randaccenten en binnenlijnen (7) | een lichte pixel aan de rand van een onderdeel dat naar het licht kijkt; een donkere lijn waar een onderdeel voor een ander ligt (meer dan 1,2 eenheid) of waar twee soorten onderdelen elkaar raken | normaal maal licht, zon, diepte, soort |
| slijtage (8) | een bolle rand één toon lichter, onderbroken op vaste plekken | kromming, plek in rust |
| metaal | waar de glans hoog is de lichtste toon; elke nagelkop een lichte pixel (waar hij het meest naar het licht kijkt) en een donkere | glans, normaal |
| omlijning in kleur | de omlijning in de donkerste kleur van het materiaal ernaast, aan de lichte kant de donkerste toon | materiaal |

Eén les: **niets mag per beeld beslissen.** De eerste clusterstap voegde kleine eilandjes achteraf samen; naar zuidwest
liet dat het flikkeren stijgen van 0,18 naar 0,25, want een eilandje is in de ene stand één pixel en in de volgende
twee. Het licht eerst glad maken binnen een onderdeel geeft hetzelfde rustige beeld zonder dat (0,17).

## Opdracht 1: het doel ontleed

Het doel is het wiel vooraan op de ChatGPT-wagen. Het is herbemonsterd tot de wielhoogte van onze sprite (100 pixels, de
kleur in het midden van elke pixel, geen nieuwe kleuren) en vergeleken met A (variant C nu) naar zuidwest, stand 0. Alle
getallen op dezelfde manier: het materiaal herkend aan de kleur, de helderheid van 0 tot 255. Plaat:
`0-ontleding.png`.

| | doel | A | B | C | D |
|---|---|---|---|---|---|
| hout, ijzer, lijn (deel van het wiel) | 57 / 21 / 21% | 42 / 26 / 31% | 54 / 36 / 10% | 54 / 36 / 10% | 49 / 33 / 17% |
| hout: gemiddelde kleur | 109,62,28 | 120,74,43 | 129,82,48 | 124,77,44 | 105,60,27 |
| hout: verzadiging | 0,74 | 0,64 | 0,65 | 0,67 | 0,74 |
| hout: donker / middel / licht | 75 / 21 / 3% | 55 / 32 / 13% | 32 / 59 / 10% | 38 / 54 / 8% | 80 / 17 / 3% |
| hout: tint schaduw → licht | 20° → 31° | 23° → 26° | 22° → 30° | 21° → 29° | 20° → 30° |
| ijzer: gemiddelde kleur | 86,89,97 | 76,83,97 | 102,107,113 | 106,111,117 | 85,87,95 |
| ijzer: donker / middel / licht | 52 / 32 / 16% | 50 / 47 / 2% | 39 / 47 / 13% | 39 / 45 / 16% | 57 / 25 / 18% |
| ijzer: het lichtste (p95) | 175 | 142 | 179 | 179 | 218 |
| spaken: spreiding, buurverschil | 30, 18 | 47, 33 | 40, 24 | 40, 24 | 34, 22 |
| velg: verschil tussen vakken rondom | 10 | 22 | 16 | 19 | 10 |
| losse pixels / in vlakken van 10+ | 30 / 30% | 23 / 40% | 16 / 51% | 11 / 59% | 14 / 51% |
| buitenrand donker, dikte | 78%, 2,0 px | 100%, 2,5 | 100%, 1,2 | 99%, 1,3 | 100%, 2,2 |
| donkere lijnen binnenin | 18% | 34% | 13% | 14% | 22% |
| lichtste kant van de band | linksboven, 3,3× | boven, 2,4× | boven, 2,1× | linksboven, 2,2× | linksboven, 3,0× |
| hout naast ijzer of lijn (contact) | 0,87 | 0,68 | 0,82 | 0,81 | 0,80 |
| kleuren | ~4000 (AI) | 64 | 33 | 34 | 15 |

**Echt te zien, en aan de afwerking te doen:**

- **Hout.** A is oranje als koper, met een groot bereik en veel licht (13%). Het doel is donker, warm en verzadigd bruin:
  driekwart donker, en het licht (goud) alleen op randen. De tint schuift in het doel van roodbruin in de schaduw naar
  goud in het licht (20° naar 31°); in A nauwelijks (23° naar 26°).
- **Spaken.** In A zijn ze druk: een verloop uit de 3D-render en ruis uit de textuur (spreiding 47, buurverschil 33). In
  het doel zijn ze rustig: twee à drie vlakke tonen (30 en 18).
- **Metaal.** Het doel is blauwgrijs met bijna witte glimlichten (4% op 219). A is donkerder en blauwer, zonder
  glimlichten (het lichtste 142, en blauw).
- **Clusters.** Het doel heeft 30% losse pixels, maar dat is bewust detail: nagels, glimlichten, nerf. Het heeft
  evenveel grote vlakken. De losse pixels van A (23%) zijn ruis van de textuur.
- **Lijnen.** In het doel loopt om elk onderdeel een getekende lijn (spaken, planken, beslag); 18% van het binnenste is
  lijn. Het donker van A (34%) is schaduw, geen lijn.
- **Licht.** In het doel valt het licht duidelijk linksboven (de band daar 3,3 keer zo licht als aan de donkere kant); in
  A van boven en vlakker (2,4).

**Door de camera, de geometrie of de schaal, niet door de afwerking:**

- **Camera.** Het doel staat rechter: de lange as 17° uit het lood, de ellips 0,74. Bij ons is dat 27° en 0,66. Een
  tekenaar draait het wiel naar de kijker; onze isometrische camera is vast.
- **Geometrie.** In het doel:
  - is de velg zo'n anderhalf keer zo breed, van planken met naden;
  - zijn de spaken vierkant en dik, met beslag aan beide kanten;
  - is de naaf groot, met een koperen kap;
  - is de band dieper, met nagels over zijn hele vlak.

  Bij ons laat de band vooral zijn loopvlak zien (ijzer 26 tot 36% tegen 21%). Veel lijnen in het doel komen gewoon
  doordat er meer onderdelen zijn.
- **Schaal.** Het doel is geen schoon raster: zo'n 4,7 pixels per kunstpixel, onregelmatig, zacht, met magenta randjes.
  De 4000 kleuren komen daarvandaan; per materiaal zijn het er een stuk of acht.

## Opdracht 3: de vier varianten en de ladder

- **A**: de render op 4×, met box verkleind tot 2×, 64 kleuren en een omlijning (de aanbeveling van de resolutieproef).
- **B**: kleuren en licht. Kleurreeksen uit `reeks()` op de maten van het doel (de gemiddelde kleur, de donkerste en
  lichtste toon, de tintverschuiving), en de standaardverdeling van `verdeling()` (het meeste in de tonen iets onder het
  midden, de lichtste zeldzaam). Verder niets.
- **C**: B met de nerf, de variatie, het metaal (glimlicht en nagels) en de clusters.
- **D**: alles, met de tonen van het doel zelf en zijn verdeling (in zes rondes bijgesteld op het eindbeeld, zodat ook de
  nerf en de lijnen meetellen), en de lichtste toon alleen voor accenten.

De ladder (`5-ladder.png`) zet de stappen één voor één op B. De grootste stappen naar het doel:

1. de kleurreeksen (weg van koper);
2. de nagels (de band krijgt zijn detail terug);
3. de binnenlijnen en de contactschaduw (de onderdelen worden leesbaar);
4. de verdeling van het doel (het donkere hout, het gouden licht).

De nerf is op spelgrootte subtiel: een paar donkere streepjes per spaak. Variatie en slijtage zijn klein.

B en C hebben een band die te licht is: de standaardverdeling zet het loopvlak in de zon in de lichtste tonen. Het doel
houdt zijn ijzer donkerder. Dat is het belangrijkste verschil tussen C en D.

## Opdracht 4: consistentie

Acht richtingen, acht standen en een volle slag per variant. Gemeten op de zijvlakken van het wiel: hun stand tegenover
de zon verandert bij het draaien niet, dus wat daar verandert, is flikkeren en geen licht. Alleen de slagschaduw van de
spaken loopt mee; die telt mee, dus de getallen zijn een bovengrens.

| | A | B | C | D |
|---|---|---|---|---|
| flikkeren (deel van de spreiding, 0 is vast) | 0,151 | 0,128 | 0,142 | 0,156 |
| glimlicht verspringt (de lichtste 8%) | 2,2% | 5,4% | 1,7% | 1,0% |
| lijn verspringt | 2,3% | 1,2% | 1,3% | 2,5% |
| aantal lijnpixels schommelt | 2,1% | 1,8% | 2,5% | 1,2% |
| nagels zichtbaar op spelgrootte | 46% | 56% | 98% | 94% |
| volle slag gelijk aan het begin | 100% | 100% | 100% | 100% |

- Geen variant heeft ruis per beeld. Het verschil tussen A en D (0,15 tegen 0,16) komt van het grotere contrast in D: een
  meelopende schaduw over donker hout telt zwaarder.
- De nerven zitten vast: een plek op het hout ligt in 20% van de gevallen op een nerf, en verspringt in 4%.
- Detail op spelgrootte: met box verkleind (A) verdwijnt de helft van de nagels; de stijl houdt ze.
- Richtingen: `3-richtingen.png`. Draaien: `4-draaien-ZW.png` en `4-draaien-N.png` (bewegende PNG's, van links naar
  rechts A, B, C en D).

## Opdracht 5: de platen

- `1-vergelijking.png`: het doel en A tot D op dezelfde zichtbare grootte (onze sprite maal 4 met nearest neighbour, het
  doel op dezelfde wielhoogte), plus de extra kolom (D, forser).
- `2-spelmaat-1080p.png` (één op één, zoals het spel hem toont) en `2-spelmaat-1080p-vergroot.png` (maal 3).
- `0-ontleding.png` (opdracht 1), `3-richtingen.png`, `4-draaien-*.png`, `5-ladder.png`, en alle getallen in
  `metingen.json`.

## Advies: wat brengt ons het dichtst bij de ChatGPT-stijl?

De combinatie van D:

1. **Materiaalbehandeling**: de AI-texturen blijven, maar alleen als variatie binnen de tonen (hout 0,7, ijzer 0,35),
   niet als eigen kleuren.
2. **Belichting**: het licht van de render, op vaste drempels in een paar tonen gezet (eens per ding geijkt), met de
   verdeling van het doel. Hout is vooral donker (75 / 21 / 3%), ijzer is meer gespreid, en de lichtste toon is alleen
   voor accenten.
3. **Kleurreeksen**: per materiaal zes à zeven tonen waarvan de tint schuift (hout van roodbruin naar goud, ijzer van
   blauwgrijs naar bijna wit). Een materiaal zonder voorbeeld krijgt `reeks()` met dezelfde regels.
4. **Pixelart-afwerking**:
   - lichte randen naar het licht, glimlichten en nagelkoppen;
   - donkere binnenlijnen waar onderdelen voor elkaar liggen of elkaar raken;
   - contactschaduw;
   - de omlijning in de kleur van het materiaal;
   - glad binnen een onderdeel in plaats van eilandjes samenvoegen.

Niet doen: dithering, iets wat per beeld beslist, 64 vrije kleuren (A), en de standaardverdeling voor ijzer (die maakt de
band te licht).

**De volgende stap is geometrie, niet afwerking:** de forsere maten met beslag, een brede velg van planken en een
koperen naaf. Daarmee halen we wat de afwerking niet kan. Het rechtop draaien van het wiel kan niet: onze camera is vast.

## Gevolgen voor de andere dingen

- **Wat een ding nodig heeft:**
  - materialen met een afwikkeling (voor de nerf);
  - een stijl per materiaal: een reeks en een verdeling, of een voorbeeld om op te ijken;
  - de lijst van versieringsonderdelen (nagels, knopen, gespen).

  De G-buffer schrijft nu alleen een materiaal met een textuur; een rampmateriaal (de meeste dingen nu) heeft daar nog
  een kleine uitbreiding voor nodig (het licht uit `stap`).
- **Gebouwen**: grote vlakken (planken, stenen, pannen) hebben het meest aan de reeksen, de nerf langs een plank (`vlak`)
  en binnenlijnen tussen planken of stenen. Dan moet elke plank een eigen onderdeel zijn, of de voeg een eigen kanaal
  krijgen.
- **Dieren**: reeksen per vacht. De nerf kan als haarrichting langs de ledematen. De binnenlijnen tussen poot en lijf zijn
  het belangrijkst voor de leesbaarheid.
- **Personages**: klein (op 2× zo'n 40 tot 60 pixels). Reeksen, omlijning in kleur en binnenlijnen; nerf en slijtage zijn
  er nauwelijks te zien.
- **Voertuigen**: zoals het wiel: hout en ijzer, alle stappen.
- **Kosten**: zo'n 50 ms per beeld erbij, naast seconden render, en zo'n 20 MB aan buffers tijdens het renderen. In het
  spel niets: de sprites zijn gebakken. De ijking is een seconde per ding.

## Een correctie op de HD-proef

De stijlmaten van het doel in `hd-wielproef.md` zijn gemeten met een masker (`hdproef.cjs refWiel` met `alleenWiel`) dat
ook fel oranje hout weggooide (R > 1,7 G) en resten van de bak liet staan. Met het nieuwe masker (`hdstijl.cjs
doelWiel`), op 2×:

| maat | oud masker | nieuw masker |
|---|---|---|
| warmte | 45 | 59 |
| lijn | 33% | 21% |
| drukte | 0,58 | 0,65 |
| contrast | 132 | 139 |

"Iets warmer dan het doel" uit dat verslag kwam deels door het masker.

## Open voor Marcel

- D als stijl voor de productie?
- De volgende proef: het wiel naar de geometrie van het doel (forser, beslag, brede velg, koperen naaf) met D, of D op de
  hele ossenkar.
