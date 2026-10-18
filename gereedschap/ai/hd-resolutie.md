# De resolutieproef: variant C op 2×, 4×, 8× en 16×

Technische evaluatie van Claude, 18 okt 2026, op Marcels vijfde opdracht (`opdracht-comfyui.md`; werklijst vraag 180).
De platen staan in `gereedschap/pixelart/uit/hdresolutie/` (niet in git; opnieuw met `node
gereedschap/pixelart/hdresolutie.cjs alles`, zo'n zes minuten op zestien kernen), de getallen in `metingen.json`.

## Het antwoord in het kort

**Nee: 8× en 16× geven geen zichtbaar betere pixel art dan 4×.** Op 1920×1080 wijkt 4× (verkleind met box) gemiddeld 6,7
af van het ideaal (16×, op een schaal van kleurverschil tot 441), 8× 2,2; met het oog is dat niet te zien, ook niet drie
keer vergroot. Ze kosten 3,6 en 12 keer zoveel rendertijd als 4×.

**Het advies:** sprites van **2×** (de HD-sprite, op halve zoom getekend: op 1080p even groot als nu), gerenderd op **4×**
en gefilterd verkleind (box, of Lanczos voor iets scherper), daarna het palet en de omlijning op de doelmaat. 2× native
mag waar het snel moet. De sprite zelf niet groter dan 2×: 4× is zestien keer het geheugen van nu en past niet meer in
één textuur per figuur.

## Wat er gerenderd is

Variant C uit `hdproef.cjs` (de betere geometrie en de AI-materialen), ongewijzigd: dezelfde geometrie, texturen,
materialen, belichting en camera, naar zuidwest in de acht standen van het lopen. Op 2×, 4×, 8× en 16× interne resolutie
(`kern.cjs`, `o.fijn`: het raster echt fijner, de stralen en de normaal op die maat; niets vergroot), en op 1× ter
vergelijking.

## 1. Op de eigen resolutie

`1-native.png` toont elke resolutie op zijn eigen pixels (de uitsnede om het wiel: 1× 50×60, 2× 100×120, 4× 200×240, 8×
400×480, 16× 800×960). `1-native-naaf.png` toont hetzelfde stukje wiel (de naaf, 20×20 eenheden) uit elke resolutie,
alleen om te bekijken vergroot tot dezelfde maat:

- **1×:** een vlek met een blauwe streep; de naaf is er niet.
- **2×:** de naaf, de kap en de banden te herkennen, blokkerig.
- **4×:** alles leesbaar: de nagels in de kap, de ringen, de afschuining van de spaken, de nerf.
- **8×:** gladder; de nagels rond, de randen zacht. Het hout wordt egaal: de textuur heeft één texel per eenheid, en
  vanaf 2× wordt hij vergroot, dus er komt geen nerf meer bij. Wat 8× toevoegt, is alleen de vorm.
- **16×:** hetzelfde als 8×, iets gladder. Geen nieuw detail.

Wat een resolutie aan detail kan geven, houdt dus op bij de fijnste textuur en het kleinste onderdeel: hier rond 4× voor
de vorm en rond 2× voor het materiaal. Meer resolutie vraagt fijnere texturen en kleinere onderdelen, en die zie je in
het spel niet.

## 2. Op dezelfde fysieke grootte bij 1920×1080

Het spel tekent een spritepixel nu als 2×2 schermpixels. Op 1080p staat het wiel dus 104 schermpixels hoog; meer pixels
dan dat kan het scherm niet tonen. Twee doelmaten, allebei even groot op het scherm:

- **`2-1080p-2x.png`: als HD-sprite** (2 pixels per eenheid, één spritepixel per schermpixel). 2× is daar native; 4×, 8×
  en 16× worden verkleind met factor 2, 4 en 8.
- **`2-1080p-1x.png`: als sprite van nu** (1 pixel per eenheid, 2×2 per pixel). Alles wordt verkleind.

Beide ook drie keer vergroot om te bekijken (`-vergroot.png`), en het draaien als HD-sprite in `3-draaien-hd.png` (APNG,
in een browser; per rij naast, box en meerderheid, per kolom 2×, 4×, 8×, 16× en het ideaal).

## 3. De filters

Elk filter in lineair licht waar het mengt, daarna voor allemaal hetzelfde: het palet van 64 kleuren (uit het ideaal) en
een omlijning van één pixel op de doelmaat. 2× native houdt de omlijning van de renderer.

- **naast** (nearest neighbour): de pixel in het midden van elk blok. Scherp, maar korrelig en kartelig: wat tussen de
  monsters valt, valt weg.
- **box:** het gemiddelde van het blok. De echte kleur van de schermpixel; het rustigst, iets zacht.
- **lanczos** (Lanczos-3): mengt met een bredere, scherpere kern. Bijna zo scherp als native, bijna zo rustig als box.
- **meerderheid:** eerst naar het palet, dan per blok de kleur die het vaakst voorkomt. Geen nieuwe kleuren, knapperig,
  maar een kleur springt van het ene beeld op het andere: het onrustigst in beweging.

## 4. De vergelijking

Als HD-sprite (doelmaat 2×), gemiddeld over de acht standen. Het ideaal is 16× met box: de echte gemiddelde kleur van
elke schermpixel. *Afwijking:* het gemiddelde kleurverschil met het ideaal (0 tot 441). *Silhouet:* pixels die in het
een wel en in het ander niet dekken. *Scherpte:* het gemiddelde helderheidsverschil met de buren (het ideaal: 39,5).
*Onrust:* hoeveel er tussen twee standen verandert, gedeeld door die van het ideaal (boven 1 is aliasing: verspringen
dat er niet hoort). *Tegen de helft:* pixels die nog veranderen ten opzichte van de halve resolutie met hetzelfde filter.

| Bron, filter | Afwijking | Silhouet | Scherpte | Onrust | Tegen de helft |
|---|---|---|---|---|---|
| 2× native | 13,1 | 0,2% | 43,6 | 1,01 | — |
| 4× naast | 21,9 | 4,1% | 46,8 | 1,05 | |
| 4× box | 6,7 | 2,0% | 40,9 | 1,03 | |
| 4× lanczos | 9,2 | 1,8% | 43,3 | 1,05 | |
| 4× meerderheid | 16,3 | 2,0% | 46,3 | 1,14 | |
| 8× naast | 16,3 | 2,0% | 47,9 | 1,07 | 55% |
| 8× box | 2,2 | 0,5% | 39,9 | 1,00 | 28% |
| 8× lanczos | 6,0 | 0,5% | 42,7 | 1,04 | 30% |
| 8× meerderheid | 13,7 | 0,5% | 45,6 | 1,14 | 45% |
| 16× naast | 13,7 | 1,1% | 48,2 | 1,08 | 38% |
| 16× box | (het ideaal) | | 39,5 | 1,00 | 12% |
| 16× lanczos | 5,4 | 0,3% | 42,4 | 1,04 | 12% |
| 16× meerderheid | 13,1 | 0,0% | 44,9 | 1,13 | 24% |

Als sprite van nu (doelmaat 1×) hetzelfde beeld: 1× native wijkt 18,3 af, 2× box 10,6, 4× box 4,2, 8× box 1,2. Op het oog:
1× native heeft de ruis in de naaf; vanaf 2× box is die weg, en 4×, 8× en 16× zijn daarna niet meer van elkaar te
onderscheiden.

Wat het zegt:

- **Detailbehoud:** zie het ideaal als het meeste dat op dat scherm kan. 4× box zit er al op 6,7, 8× op 2,2; de pixels die
  nog veranderen ("tegen de helft", 28% en 12%) veranderen naar een buurkleur in het palet. Met het oog is 8× niet van 4×
  te onderscheiden, 16× niet van 8×.
- **Scherpte:** native en de filters zonder mengen (naast, meerderheid) zijn scherper dan het ideaal, maar die scherpte is
  deels kartel. Lanczos is even scherp als native en wijkt minder af. Box is het zachtst.
- **Aliasing:** naast en meerderheid verspringen meer dan het ideaal (1,05 tot 1,14); box en Lanczos nauwelijks (1,00 tot
  1,05). Meer resolutie helpt naast een beetje (meer monsters, maar nog steeds één per pixel) en meerderheid niet.
- **Visuele kwaliteit:** 2× native is knapperig, met de forse omlijning van de renderer; 4× met box of Lanczos is
  rustiger en schoner aan de randen, met een dunnere omlijning; dat is de mooiste. 8× en 16× zien er hetzelfde uit als 4×.

## Tijd en geheugen

Gemeten met zes renders tegelijk op zestien kernen (dus per kern); piek: het hoogste geheugen van het proces.

| | 1× | 2× | 4× | 8× | 16× |
|---|---|---|---|---|---|
| Rendertijd per beeld | 0,5 s | 1,2 s | 3,4 s | 11,9 s | 40,6 s |
| Buffers van het beeld | 1,2 MB | 4,6 MB | 18 MB | 74 MB | 295 MB |
| Piekgeheugen van het proces | 113 MB | 108 MB | 123 MB | 231 MB | 472 MB |
| De uitsnede (RGBA) | 50×60, 12 KB | 100×120, 47 KB | 200×240, 188 KB | 400×480, 750 KB | 800×960, 3 MB |
| De uitsnede als PNG | 3,6 KB | 13 KB | 48 KB | 174 KB | 599 KB |

De rendertijd groeit per verdubbeling eerst met 2,4 en 2,8, en boven 4× met bijna 4 (3,6 en 3,4): dan is het alleen nog
pixels. De interne resolutie kost alleen rendertijd; wat het spel laadt, hangt aan de doelmaat.

## Wat dat betekent voor alles wat Aardschok nodig heeft

Nu: 1.947 vellen in `beelden/` (de figuren: zo'n 117.000 beelden, 812 megapixel) en 4.708 in `tegels/` (de huizen met
hun bouwfasen, brand en sneeuw: 2.453 megapixel); 358 MB aan PNG. Het plan voor de nieuwe stijl (werklijst, vraag 180,
fase 4) is rond de 10.000 tot 15.000 beelden. Gerekend met 13.500 beelden van figuren en voorwerpen (gemiddeld zo groot
als nu) en 1.500 van huizen, met de PNG-groei die het wiel liet zien (3,65 per verdubbeling):

| Doelmaat (de sprite) | Alles samen, ongecomprimeerd | Als PNG | Een figuur (320 beelden) in het videogeheugen | Een huis |
|---|---|---|---|---|
| 1× (nu) | 3,5 GB | 0,1 GB | 9 MB (2,2 Mpx) | 2,1 MB |
| **2× (HD)** | **14 GB** | **0,37 GB** | **35 MB (8,7 Mpx: past in één textuur van 4096²)** | **8,3 MB** |
| 4× | 56 GB | 1,3 GB | 140 MB (35 Mpx: vraagt 8192²) | 33 MB |
| 8× | 224 GB | 4,9 GB | 560 MB (140 Mpx: past nergens in één textuur) | 133 MB |
| 16× | 895 GB | 18 GB | 2,2 GB | 534 MB |

En de rendertijd van die 15.000 beelden, als ze zo bewerkelijk waren als het wiel (een huis is veel groter, dus dit is
de ondergrens): 1× 2 kern-uren, 2× 5, **4× 14** (met zes renders tegelijk een nacht), 8× 50, 16× 170.

## Aanbeveling

1. **De sprite: 2×.** Op 1080p even groot als nu, met vier keer zoveel pixels: daar zat de grootste stap (de HD-proef).
   Op 4K wordt hij twee keer vergroot, zoals de sprites nu op 1080p; dat is pixel art. Een sprite van 4× zou op 4K iets
   fijner zijn, maar kost zestien keer het geheugen van nu, per figuur een textuur van 8192², en 1,3 GB om te downloaden.
2. **De render: 4×, verkleind tot 2×** met box (het rustigst, het dichtst bij het ideaal) of Lanczos (even scherp als
   native, iets minder rustig); nooit met naast of meerderheid voor wat beweegt. Daarna het palet en de omlijning op de
   doelmaat. Zo'n 14 kern-uren voor de hele demo: een nacht. Waar het snel moet (een proefplaat, een iteratie), 2× native.
3. **Niet 8× of 16×:** niet zichtbaar beter, 3,6 en 12 keer zo traag als 4×, en het extra detail zit niet in de texturen
   (één texel per eenheid) en niet in de onderdelen. Alleen voor een stilstaand beeld van dichtbij (een plaat voor de
   winkel op Steam, een cinematic die inzoomt) heeft 8× zin, en dan met fijnere texturen.
4. **Het spel** moet een sprite op halve schaal kunnen tekenen (de cel en het anker maal twee); en de sprites van nu
   blijven werken zolang niet alles om is.
