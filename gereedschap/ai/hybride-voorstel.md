# Een hybride pijplijn: onze 3D-modellen met AI-texturen

Rapport en voorstel van Claude, 18 okt 2026, op Marcels opdracht (werklijst vraag 180): "Analyseer onze huidige
renderer", met zes vragen, en "Verander voorlopig niets aan de bestaande renderer." Er is niets veranderd. Wat hieronder
over de code staat, is nagelezen in `gereedschap/pixelart/kern.cjs` (de renderer), `houding.cjs` (de animatie),
`figuren.cjs` en `vee.cjs` (de modellen en materialen).

## De zes vragen

### 1. Welke rendertechniek?

Twee verschillende dingen:

- **De sprites maken** (de tekenstraat, `gereedschap/pixelart/`): **een eigen renderer in gewoon JavaScript**, in Node
  op de processor. Geen Three.js, geen WebGL, geen Canvas 2D. Hij schiet per pixel een straal de scène in
  (*sphere tracing* op afstandsfuncties), uit acht kijkrichtingen, en brengt het resultaat terug tot pixel art.
- **Het spel tekenen** (`js/gl.js`): WebGL2, met die kant-en-klare sprites als textuur. Dat staat hier los van.

### 2. Echte 3D-meshes met materialen en UV-coördinaten?

**Nee.** Er zijn geen meshes en geen UV's. Een model is een lijst **onderdelen**, elk een afstandsfunctie (bol,
ellipsoïde, capsule, ronde kegel, doos, cilinder, torus), samengevoegd met een zachte naad. Een **materiaal** is geen
textuur maar een **kleurenramp uit een vast palet** (`{ ramp, lo, hi, patroon, glans, gloei, detail }`), plus eventueel
een **patroon in code** (nerf, strengen, stenen) dat de stap in die ramp of de ramp zelf verandert. De kleur van een
pixel is dus altijd *één ramp, één stap*: een geïndexeerde kleur, geen RGB.

Wat wel bestaat, en dat is belangrijk: **elk onderdeel kent zijn eigen rusthouding.** Materiaal en patroon worden
uitgerekend in de coördinaten van het onderdeel in rust (`naarDeel` met `terug` in `kern.cjs`). Zo beweegt de nerf
van een staf met de staf mee als die zwaait, en draait hij mee als de kijkrichting draait. Die coördinaten zijn in
feite **3D-textuurcoördinaten**: een vaste plek op het oppervlak van een onderdeel, in elk beeld dezelfde.

### 3. Kunnen we depth, normal, object-ID en material-ID exporteren?

**Ja, bijna allemaal staan ze al per pixel in het geheugen** (de klasse `Beeld` in `kern.cjs`):

| Kaart | Nu | Wat er nodig is |
|---|---|---|
| Diepte | `B.diep` | alleen wegschrijven |
| Normaal (wereld) | `B.nrm` | alleen wegschrijven |
| Object-ID | `B.obj` | alleen wegschrijven |
| Onderdeel-ID | `B.deel` | alleen wegschrijven |
| Plek in de wereld | `B.pos` | alleen wegschrijven |
| Ramp (kleurfamilie) | `B.ramp` | alleen wegschrijven |
| Materiaal-ID | wordt berekend (`matI`), niet bewaard | één buffer erbij |
| Plek in de rusthouding (de "3D-UV") | wordt berekend (`naarDeel`), niet bewaard | één buffer erbij |
| Licht (los van de kleur) | wordt berekend (licht, schaduw, AO), maar zit opgeteld in de stap | één buffer erbij |

De lijnen voor ControlNet maken we al uit deze buffers (`gereedschap/ai/doek.cjs`, `lijnenOpDoek`).

### 4. Kunnen we losse AI-texturen op de objecten toepassen?

**Nu niet, maar de haak zit er al.** De renderer heeft geen pad voor RGB-kleur: alles eindigt als ramp en stap uit het
vaste palet. Het `patroon` krijgt wel al de rusthouding en de normaal mee, precies wat een textuur nodig heeft. Er moet
dus één pad bij: een materiaal met een **textuur**, waarvan de renderer per pixel de kleur haalt op de plek in de
rusthouding, en die met zijn eigen licht belicht.

### 5. Dezelfde texturen in alle kijkrichtingen en animatiebeelden?

**Ja, en dat is de grote winst.** Omdat elk punt van het oppervlak een vaste plek heeft in de rusthouding van zijn
onderdeel, haalt elke kijkrichting en elk loopbeeld dezelfde texels op. De animatie verplaatst alleen botten star
(`houding.cjs`: draaien en verschuiven, geen vervorming), dus een textuur glijdt niet over een poot. Het verschil tussen
twee beelden is dan alleen nog het licht, en dat is precies wat het hoort te zijn: **geen flikkeren van de textuur, per
definitie.**

Twee kanttekeningen: waar twee onderdelen met een zachte naad samensmelten (een hals in een romp), moeten de texturen
daar in elkaar overlopen; en een textuur voegt geen vorm toe: het silhouet blijft dat van ons model.

### 6. Wat is er nodig?

Zie het voorstel hieronder. In het kort: drie kleine, optionele uitbreidingen van de renderer (buffers erbij, een
materiaal met een textuur, een kleurpad met een eigen palet per ding), en nieuw gereedschap eromheen voor de texturen.
Zolang een model geen textuur heeft, blijft alles pixel voor pixel gelijk, en dat toetsen we met hashes, zoals bij de
proefplaat van de heerstoet.

## Het voorstel

Doel: de HD-pixelartstijl van de goedgekeurde ChatGPT-sprites (`uit/ai/hand/`), met **maximale consistentie tussen
animatiebeelden**. Het idee: de AI tekent niet meer elk beeld, maar het **oppervlak**, één keer. Onze renderer doet de
vorm, de kijkrichting, de beweging en het licht, zoals nu.

### Stap A: de buffers exporteren (optioneel, de renderer blijft gelijk)

Een vlag in `tekenModel` die naast het beeld ook schrijft: materiaal-ID, de plek in de rusthouding, de normaal in de
rusthouding, en het licht apart (direct licht, eigen schaduw, omgevingsschaduw). Zonder de vlag verandert er niets.

### Stap B: een textuurruimte per onderdeel

Uit de plek in de rusthouding een 2D-textuurcoördinaat, naar de vorm van het onderdeel:

- capsules en kegels (poten, hoorns, stokken, spaken): **cilindrisch** (de hoek om de as, en de plek langs de as);
- dozen (planken, panelen, kisten): **per vlak** (de zes kanten);
- de rest (romp, kop, zakken): **triplanair**, drie projecties gemengd naar de normaal in rust.

Geen uitvouwen met de hand: het volgt uit de afstandsfunctie van elk onderdeel. Twee tot vier texels per eenheid is
genoeg, want het eindbeeld is pixel art op zo'n één pixel per eenheid.

### Stap C: de texturen maken met AI

Twee bronnen, die elkaar aanvullen:

- **C1. Projecteren van een goedgekeurd meesterbeeld** (het belangrijkste). We laten het ding in rust uit twee of drie
  kanten (zuidwest, noordoost, opzij) door de AI in de goede stijl overtekenen, **exact op onze render** (SDXL in
  ComfyUI, met onze lijnen in ControlNet en de ChatGPT-sprite als stijl: dat werkt al, `sdxl.cjs`). Omdat elke pixel van
  dat beeld bij een bekend onderdeel en een bekende plek in rust hoort, schrijven we de kleur terug in de textuur van
  dat onderdeel. **Het licht eruit halen:** we weten welk licht onze renderer op die pixel zette, dus we delen dat eruit
  (kleur gedeeld door licht), en houden de eigen kleur van het oppervlak over. Wat in geen enkel meesterbeeld te zien
  was, vullen we aan uit C2.
- **C2. Materiaaltegels** die naadloos herhalen: hout met nerf, geverfd hout, ijzer, leer, de huid van de os, jute,
  goud. Gemaakt met SDXL (vlak licht, "albedo"), met de ChatGPT-sprite als stijl. En **decals**: de gouden leeuw op een
  paneel, het wapen op een vaandel, één keer gemaakt en op een vaste plek op het onderdeel gezet.

### Stap D: renderen met de texturen

In het materiaal: is er een textuur, dan is de kleur van de pixel de textuur op zijn plek in rust, **belicht met ons
eigen licht** (direct licht, schaduw, omgevingsschaduw, randlicht en glans, zoals nu). Dan terug naar pixel art:

- **één palet per ding**, uit al zijn texturen (median cut, zo'n 48 tot 64 kleuren), en **hetzelfde palet voor elke
  kijkrichting en elk beeld**: anders verspringt een kleur tussen twee loopbeelden;
- het rasteren (dither) alleen waar het licht verloopt, zoals nu;
- de donkere omlijning zoals nu (`omlijn`).

Een normaal- of hoogtekaart uit de AI-textuur (nerf, haar, naden) kan het licht ook op kleine schaal laten reageren:
dan "beweegt" de nerf mee met het licht, terwijl hij op zijn plek blijft.

### Stap E (alleen als het nodig blijkt): een lichte AI-afwerking

Een laatste pas met heel weinig vrijheid (denoise 0,15 tot 0,25, ControlNet tile, vaste seed, hetzelfde meesterbeeld)
voor schilderachtig fijn detail. Dat brengt een klein risico op flikkeren terug; met de controles van nu meten we dat.
Liefst niet.

## Wat het oplost, en wat niet

- **Opgelost:** het flikkeren tussen loopbeelden en kijkrichtingen (dezelfde texels, hetzelfde palet), het silhouet
  (100% het onze, per definitie), de maat en de ankers van de vellen (het spel verandert niet), en de kosten: de AI
  tekent een paar meesterbeelden en tegels per ding, niet 117.000 beelden; de rest rendert onze eigen renderer, zoals
  nu.
- **Niet opgelost: de vorm.** Een textuur maakt de os niet minder blokkig. Een deel van de kwaliteit van de
  ChatGPT-sprites zit in de vorm: anatomie, plooien, de buik van een zak. Dat moet in de modellen zelf beter: meer en
  ronder gevormde onderdelen (spieren, een halskwab, de bil van de os). Dat is werk in code, zoals de proefplaat van de
  heerstoet, maar nu met de ChatGPT-sprite als maat. De hoogtekaart uit stap D helpt op kleine schaal (plooien, haar),
  niet op grote.

## De eerste proef

De os en de wagen van de heer, van begin tot eind:

1. stap A (de buffers, met de hashcontrole dat de rest gelijk blijft);
2. stap B voor de onderdelen van de os en de wagen;
3. stap C1 met twee meesterbeelden uit SDXL (zuidwest en noordoost), en C2 voor hout, ijzer en de huid;
4. stap D, en dan de acht loopbeelden naar zuidwest, en de wagen uit alle acht richtingen;
5. dezelfde controles en vergelijkingsplaten als nu (`etiket.cjs`), naast de ChatGPT-sprite en de SDXL-uitkomst.

Schatting: vier tot zes sessies voor die eerste proef. Daarna is elk nieuw ding vooral: een betere vorm, twee
meesterbeelden en de tegels die het nog niet heeft.
