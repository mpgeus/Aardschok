# Een AI-afwerking op onze sprites

Werklijst vraag 180, Marcels zevende opdracht (letterlijk in `opdracht-comfyui.md`, "Zevende opdracht"), 18 okt 2026.
Marcel vroeg fase 1 tot en met 3. Stand: `main` na 480c1928. De beelden staan in `gereedschap/pixelart/uit/ai/afwerking/`
(niet in git); het script is `gereedschap/ai/afwerking.cjs`.

## Fase 1: wat er is, en het plan

### Onderzochte bestanden

- **De ComfyUI-koppeling:**
  - `gereedschap/ai/beeld-ai.cjs`: `comfy`, `upload` en het ChatGPT-beeld in `uit/ai/hand/`;
  - `doek.cjs`: het doek, onze lijnen, het masker, `voerUit` en de silhouetcontrole;
  - `sdxl.cjs` en `werkstroom-sdxl.json`: SDXL met ControlNet union en IP-Adapter, 18 okt, voor de hele wagen;
  - `sd15.cjs`;
  - `textuur-ai.cjs`: de SDXL-texturen.
- **De renderer en de stijl:**
  - `gereedschap/pixelart/kern.cjs`: de G-buffer, `o.gbuffer`;
  - `stijl.cjs`;
  - `hdstijl.cjs`: wiel D en zijn ijking `uit/hdstijl/ijk.json`;
  - `hdproef.cjs`: de geometrie van het wiel.
- **Wat eerder bleek:** `ontwerp/werklijst.md`, vraag 180. SD 1.5 en SDXL op de hele wagen hielden de vorm (96 tot 98%
  overlap), maar de lading en het tuig wisselden tussen de loopbeelden. Flux Kontext werd toen "te zwaar voor de 1080 Ti"
  genoemd.

### Vastgesteld

Gemeten via de API van ComfyUI (`/system_stats`, `/models`, `/object_info`) en `nvidia-smi`.

- **ComfyUI** 0.41.0, portable in `C:\ComfyUI\ComfyUI_windows_portable`, met Python 3.12.10 en PyTorch 2.14.0+cu126.
  Hij draait op 127.0.0.1:8188.
- **GPU**: GTX 1080 Ti met 11 GB (Pascal), driver 560.94, CUDA 12.6.
  - Hij heeft geen tensorkernen, fp16 is traag, en bf16 en fp8 kan hij niet rekenen.
  - Bij de meting was zo'n 8 GB vrij: Windows en de apps houden zo'n 4 GB vast.
- **Werkgeheugen** 25,7 GB; schijf C: 747 GB vrij.
- **Modellen**:
  - `sd_xl_base_1.0`, en `DreamShaper_8` (SD 1.5);
  - `controlnet-union-sdxl-promax` (één ControlNet voor canny/lineart, depth, normal, segment, tile en meer), en
    lineart en softedge voor SD 1.5;
  - `ip-adapter-plus_sdxl_vit-h` en `ip-adapter-plus_sd15`, met `CLIP-ViT-H-14-laion2B-s32B-b79K`.
- **Custom nodes**: alleen `ComfyUI_IPAdapter_plus`.
- **Nodes** (1023):
  - alles voor Route A: `ControlNetApplyAdvanced`, `SetUnionControlNetType`, `SetLatentNoiseMask`,
    `InpaintModelConditioning`, `Canny`, `ImageCompositeMasked`, en de hele IP-Adapter-familie;
  - en, nieuw sinds de vorige keer, de nodes voor **Flux Kontext in de kern**: `ReferenceLatent`,
    `FluxKontextImageScale`, `FluxGuidance`, `FluxKontextMultiReferenceLatentMethod`, `UNETLoader`, `DualCLIPLoader`.
    Wat ontbreekt is alleen een lader voor GGUF (`UnetLoaderGGUF`, de custom node ComfyUI-GGUF).

### Wat er nog geïnstalleerd moet worden

- **Route A: niets.** SDXL, ControlNet union, IP-Adapter Plus SDXL en CLIP ViT-H staan er al (14,7 GB, 18 okt).
- **Route B (FLUX.1 Kontext [dev]): nog niets geïnstalleerd**, zoals de opdracht zegt. Wat nodig zou zijn:

  | Bestand | Bron | Grootte |
  |---|---|---|
  | het model, het volle model | Black Forest Labs, `flux1-kontext-dev.safetensors` | 23,8 GB (past niet) |
  | het model, verkleind (GGUF Q5_K_M of Q4_K_M) | QuantStack, `FLUX.1-Kontext-dev-GGUF` | 8,42 of 6,93 GB |
  | de GGUF-lader | custom node ComfyUI-GGUF (city96, git) | klein |
  | de tekstencoders | comfyanonymous, `flux_text_encoders`: `t5xxl_fp8_e4m3fn_scaled` en `clip_l` | zo'n 5,2 GB en 246 MB |
  | de VAE | Black Forest Labs, `ae.safetensors` | 335 MB |

  Samen zo'n 13 tot 14,5 GB op schijf. In het geheugen past Q5_K_M (8,4 GB) net naast wat Windows vasthoudt; T5 moet
  dan naar het werkgeheugen.

### Route B onderzocht (nog niets gedraaid)

- **Hardware.** De 1080 Ti rekent fp32; de gewichten in GGUF of fp8 worden onderweg uitgepakt. Voor deze kaart vond ik
  geen meting. Een schatting uit onze eigen SDXL-tijd (103 s voor 32 stappen op 1024²; SDXL is 2,6 miljard parameters,
  Flux 12 miljard, en Kontext verdubbelt het aantal tokens met het referentiebeeld): **zo'n 5 tot 15 minuten per beeld**.
  Eerst meten.
- **Compatibiliteit.** ComfyUI 0.41.0 heeft de Kontext-nodes in de kern; voor GGUF is één custom node nodig.
- **Referentiebeelden.** Kontext bewerkt een beeld met een tekstopdracht. Een tweede beeld (het ChatGPT-wiel) kan erbij,
  aan elkaar geplakt of als tweede referentie (`ReferenceLatent`). Dat stuurt de stijl minder direct dan IP-Adapter. Er is
  geen ControlNet: de vorm moet uit het beeld zelf komen. Ons masker kan achteraf alles buiten het silhouet weghalen,
  maar niet voorkomen dat een spaak binnen het silhouet verandert.
- **Licentie.** FLUX.1 [dev] Non-Commercial License v1.1.1.
  - Wat eruit komt mag commercieel gebruikt worden: "You may use Output for any purpose (including for commercial
    purposes)".
  - Maar het model zelf gebruiken voor een "revenue-generating activity" is geen niet-commercieel gebruik. Sprites maken
    voor een spel dat we verkopen, valt daar waarschijnlijk onder.
  - **Voor de productie is dus een commerciële licentie van Black Forest Labs nodig.** Dit is mijn lezing, geen
    juridisch advies.
  - SDXL (CreativeML Open RAIL++-M), ControlNet union (Apache 2.0) en IP-Adapter (Apache 2.0) mogen commercieel.

### Het plan

1. **Render passes** (punt 4 van de opdracht), uit de G-buffer van de stijlproef, op precies de maat en plek van de sprite:
   - silhouet (alfa);
   - materiaal (hout, ijzer);
   - onderdelen;
   - een basis zonder textuur;
   - licht en schaduw;
   - diepte.

   En op de interne resolutie (4×), voor ControlNet: lijnen en diepte. In `stijl.cjs` (`passen`, `lijnenVan`,
   `diepteVan`); de renderer zelf verandert niet.
2. **Route A** (`afwerking.cjs`):
   - **het doek**: wiel D van 2× maal 8 op 1024 × 1024, op #FF00FF;
   - **image-to-image** vanaf D, met een instelbare denoise;
   - **een latent masker** (ons silhouet plus 4 doekpixels), zodat SDXL alleen het wiel bewerkt;
   - **ControlNet union twee keer**: onze lijnen en onze diepte, exact uit de render en niet uit een Canny op het beeld;
   - **IP-Adapter Plus SDXL** met het ChatGPT-wiel;
   - **een vaste seed**.

   Daarna terug naar 2×: per spritepixel het gemiddelde van zijn 8 × 8, de alfa exact die van D, de omlijning van D, en
   een palet van 32 kleuren uit het resultaat. Alles wat erin ging, staat naast het beeld (`instellingen.json`,
   `werkstroom.json`).
3. **Een matrix** naar zuidwest, stand 0 (denoise, soort en kracht van IP-Adapter, kracht van ControlNet, het voorbeeld).
   Daarna de beste instelling over acht standen, en stand 0 nog eens na het legen van ComfyUI (reproduceerbaarheid).
4. **Meten** (punt 6): silhouet, maat en plek, spaken, materiaal, kleur, contrast en schaduw, detail en nagels, tijd,
   reproduceerbaarheid, en ook het flikkeren bij draaien (zoals in de stijlproef). Dan het vergelijkingsvel.
5. **Route B** pas na Marcels akkoord op de downloads en de licentievraag.

## Fase 2: Route A gebouwd

`gereedschap/ai/afwerking.cjs` volgt het plan hierboven, en `stijl.cjs` heeft de passes (`passen`, `lijnenVan`,
`diepteVan`). Plaat: `uit/ai/afwerking/passen.png`. De renderer zelf is niet veranderd.

- **Het voorbeeld.** Standaard het voorste wiel uit het originele ChatGPT-beeld (`uit/ai/hand/wagen-zw.png.png`),
  uitgeknipt. Achtergrond en bak worden #FF00FF; de pixels zelf blijven onbewerkt.
- **Het hele ChatGPT-beeld** (Marcel tijdens de proef: "Gebruik de chatgpt bron als referentie") is als instelling
  `voorbeeld: 'heel'` ook gedraaid. Dan neemt SDXL de kleuren van de bak over: een beige band, een groenige naaf, oranje
  spaken. Voor het wiel stuurt het uitgeknipte wiel uit dezelfde bron beter.
- **Twee manieren terug naar 2×.** Box: het gemiddelde van elk blok van 8 × 8. Detailbehoudend: ligt er een lijn of een
  glimlicht in het blok, dan wint die.

  Waarom die tweede: SDXL tekent zijn details op het doek fijner dan één spritepixel, en box middelt ze weg.
- **Bewaard per beeld**: alle invoer (`init`, `masker`, `lijnen`, `diepte`), `werkstroom.json`, `ai.png`, de twee
  sprites, en `instellingen.json` met:
  - de prompts, de seed en de modellen;
  - de versies van ComfyUI en PyTorch en de GPU;
  - de tijd en de controles.

## Fase 3: gemeten

Platen in `uit/ai/afwerking/`:

- `vergelijking.png`: het vergelijkingsvel, op dezelfde zichtbare grootte, op 1080p en maal 3;
- `matrix.png`: alle instellingen;
- `draaien.png`: D en SDXL draaiend;
- `metingen.json`: alle getallen.

Alles naar zuidwest, uitgelijnd op dezelfde cel en uitsnede als D.

### De matrix (stand 0)

| instelling | tijd | vorm | spaken | detail box / detail | nagels box / detail |
|---|---|---|---|---|---|
| denoise 0,35 | 74 s | 99,5% | 8 | 28,5 / 27,8 | 17 / 9 van 31 |
| denoise 0,50 | 94 s | 98,6% | 8 | 24,3 / 24,7 | 9 / 3 |
| denoise 0,50, IP "style transfer" 0,9 | 94 s | 98,8% | 8 | 23,3 / 24,3 | 11 / 5 |
| denoise 0,50, het hele ChatGPT-beeld | 94 s | 98,7% | 8 (1 extra stuk) | 26,8 / 28,1 | 5 / 3 |
| denoise 0,65 | 101 s | 97,3% | 8 | 30,2 / 33,1 | 11 / 9 |
| denoise 0,65, IP "style transfer precise" | 103 s | 97,6% | 8 | 27,9 / 30,5 | 8 / 8 |
| denoise 0,65, ControlNet lichter (0,6 en 0,4) | 103 s | 97,1% | 8 | 30,0 / 34,6 | 10 / 5 |

Vaste instellingen: IP-Adapter "strong style transfer" 1,0, lijnen 0,8, diepte 0,6 (tot 85% van de stappen), seed
180, 32 stappen, CFG 5,5. Ter vergelijking: wiel D heeft detail 33,9 en 29 van 31 nagels, het doel detail 47.

- **Vorm.** Het deel van wat SDXL tekende dat met ons silhouet samenvalt (doorsnede gedeeld door vereniging), vóór de alfa
  terugkomt. Daarna is het silhouet exact het onze.
- **Spaken.** Geteld op twee ellipsen tussen naaf en velg, in wat SDXL tekende. Een stuk korter dan een spritepixel is
  een spikkel; er zijn er nul tot vier, en die verdwijnen met onze alfa.

### Twee reeksen over acht standen

Denoise 0,50 en 0,65, elk met stand 0 opnieuw na het legen van ComfyUI (de modellen opnieuw geladen):

| | doel | D | SDXL 0,50 box | 0,50 detail | 0,65 box | 0,65 detail |
|---|---|---|---|---|---|---|
| kleurverschil hout / ijzer met het doel (OKLab) | — | 1,0 / 0,6 | 1,8 / 2,8 | 2,3 / 3,1 | 1,1 / 3,2 | 1,7 / 3,9 |
| hout donker / middel / licht | 75 / 21 / 3% | 80 / 17 / 3% | 73 / 27 / 0% | 79 / 21 / 0% | 59 / 38 / 2% | 66 / 34 / 0% |
| ijzer donker / middel / licht | 52 / 32 / 16% | 57 / 25 / 18% | 63 / 29 / 8% | 64 / 28 / 8% | 62 / 29 / 9% | 70 / 22 / 8% |
| contrast | 140 | 135 | 122 | 117 | 117 | 113 |
| lijnen | 21% | 17% | 12% | 12% | 14% | 15% |
| materiaal herkend (hout / ijzer) | — | 100 / 100% | 97 / 96% | 97 / 96% | 97 / 92% | 97 / 92% |
| detail op spelgrootte | 47 | 33,9 | 24,3 | 24,7 | 30,2 | 33,1 |
| onze nagels nog te zien | — | 29 / 31 | 9 | 3 | 11 | 9 |
| **flikkeren bij draaien** (0 is vast) | — | **0,16** | **0,37** | **0,36** | **0,41** | **0,40** |
| lijn verspringt | — | 5% | 11% | 11% | 11% | 12% |
| volle slag (stand 0 opnieuw) gelijk | — | 100% | 100% | 100% | 100% | 100% |

Verder:

- **Maat en plek.** De breedte van wat SDXL tekende wijkt hooguit 0,13 spritepixel af (0,50) en 0,38 (0,65); het midden
  hooguit 0,07.
- **Spaken.** Acht in elke stand, in beide reeksen.
- **Vorm.** 98,5 tot 98,8% (0,50) en 96,9 tot 97,3% (0,65).
- **Reproduceerbaar.** Dezelfde instellingen geven na het legen van ComfyUI een **byte voor byte gelijk** beeld.
- **Tijd per sprite.** 92 s (0,50) of 101 s (0,65) in SDXL, plus zo'n 4 s render op 4× en een halve seconde terug. Met de
  modellen opnieuw geladen 100 tot 112 s.

### Wat de getallen niet zeggen

Zie `vergelijking.png`.

- **Op het doek van 1024 komt SDXL wel duidelijk dichter bij het ChatGPT-wiel**:
  - een band vol nagels;
  - een velg van planken met nagels;
  - een koperen naaf met glans;
  - donkere lijnen om elk onderdeel.
- **Op spelgrootte blijft daar een deel van over.** Met de detailbehoudende weg terug (vooral bij 0,65) zijn er donkere
  lijnen om de spaken, een koperen naaf en nagelstippen op de velg. Dat zijn trekken van het doel die D mist.
- **Maar het kost veel:**
  - de band wordt blauwer en vlakker;
  - de kleuren liggen verder van het doel dan D (D is op het doel geijkt);
  - het contrast is lager;
  - onze eigen nagels verdwijnen;
  - en vooral: **bij het draaien flikkert het twee à drie keer zo veel als D**. Elke stand wordt los opnieuw beschilderd;
    een nagel of nerf van SDXL zit niet vast op het wiel, hij komt in de volgende stand ergens anders.

  De geometrie blijft goed (silhouet, spaken, maat), maar het oppervlak zit niet vast.

### Voorlopig oordeel

**Route A haalt het succescriterium niet:** "zichtbaar dichter bij de ChatGPT-referentie, zonder de bruikbaarheid en
geometrische consistentie te verliezen".

- In één stilstaand beeld komt het er op spelgrootte iets dichter bij, in lijnen en in de naaf.
- In beweging verliest het de consistentie.
- In kleur en contrast is D al beter.

Wat het zou kunnen redden (nog niet geprobeerd):

1. **De acht standen samen in één beeld.** Een raster van 2 × 4 op één doek, zoals bij de loopbeelden voorgesteld; dan
   tekent SDXL één wiel in acht standen.
2. **Een keten.** Elke stand begint vanaf de vorige, terug gedraaid, met weinig denoise.
3. **De AI één keer op het oppervlak, niet per beeld.** De weg van de texturen en de stijlproef: wat SDXL tekent, wordt
   een textuur in rust, en onze renderer zet het in elke stand vast neer.

   Dit sluit het best aan op wat we hebben, en lost het flikkeren per definitie op.

**Route B (Flux Kontext) heeft hetzelfde probleem van elk beeld los**, zonder ControlNet, op deze kaart 5 tot 15 minuten
per beeld, en met een licentie die voor de productie geld kost. Daarom vind ik Route B nu niet zinvol om te installeren;
dat is fase 4, en Marcels keus.

## De AI op het oppervlak (19 okt)

Marcels keus na fase 3: "Ai on surface". SDXL beschildert het wiel één keer, en die beschildering wordt op het oppervlak
van ons model gebakken. Daarna rendert onze renderer het wiel in elke stand en richting met zijn eigen licht, en draait
wat SDXL schilderde mee.

- **De bron.** De SDXL-beelden van Route A op denoise 0,65: zuidwest stand 0 (de buitenkant van het wiel) en noordoost
  stand 0 (de binnenkant, één beeld erbij, 101 s).
- **Bakken** (`gereedschap/pixelart/bakken.cjs`):
  - Het wiel wordt opnieuw gerenderd op de maat van het doek (16×, alleen het vak van het wiel, 20 s per kant). Zo is van
    elke doekpixel bekend welk onderdeel het is en waar op zijn afwikkeling (u, v) hij ligt.
  - De kleur van SDXL wordt gedeeld door de helft van ons licht (licht tot de macht 0,5). Met al het licht eruit werd een
    vlak in de zon fel oranje: SDXL schildert een vlak in de schaduw al donkerder dan het is.
  - Bewaard per groep gelijke onderdelen. De groepen worden zelf gevonden: acht spaken, vier stukken velg, vier plaatjes;
    de band gevouwen om de 90°, de naaf om de 45°.
  - Per texel wint de kopie die het meest te zien was, niet het gemiddelde. Zo is het hele wiel bedekt, ook wat in het
    beeld net niet te zien was.
  - Samen 50.143 texels (acht per eenheid).
- **Renderen** (`gereedschap/ai/oppervlak.cjs`): op 4×, met box naar 2×, een vast palet van 48 kleuren en een omlijning.
  Zo'n 3,4 s per beeld, even snel als zonder bak.

De platen staan in `uit/ai/oppervlak/`: `vergelijking.png`, `richtingen.png` (acht richtingen), `draaien.png` (D, SDXL
per beeld en gebakken, draaiend) en `metingen.json`.

| | D (procedureel) | SDXL per beeld (Route A) | gebakken, licht eruit 1,0 | gebakken, licht eruit 0,5 |
|---|---|---|---|---|
| **flikkeren bij draaien** (acht richtingen) | **0,156** | **0,404** (zuidwest) | **0,157** | **0,157** |
| glimlicht verspringt | 1,0% | 0,7% | 7,7% | 6,4% |
| lijn verspringt | 2,5% | 12,2% | 1,6% | 3,3% |
| volle slag gelijk | 100% | 100% | 100% | 100% |
| kleurverschil hout / ijzer met het doel | 1,0 / 0,6 | 1,7 / 3,9 | 1,7 / 2,1 | 3,1 / 2,4 |
| contrast (doel 140) | 135 | 113 | 116 | 130 |
| lijnen (doel 21%) | 17% | 15% | 21% | 33% |
| detail op spelgrootte (doel 47) | 33,9 | 33,1 | 29,3 | 27,4 |
| onze nagels te zien | 29 / 31 | 9 | 1 | 6 |

Het kleurverschil, het contrast, de lijnen, het detail en de nagels zijn gemeten naar zuidwest, in stand 0.

### Wat dit laat zien

- **Het flikkeren is weg.** De beschildering van SDXL zit vast: even rustig als D (0,157 tegen 0,156), in alle acht
  richtingen en aan beide kanten. Per beeld beschilderd was dat 0,40.

  Recht van voren (noord en zuid) zie je bijna geen zijvlak (10 tot 25 meetplekken); daar zegt het getal niets.
- **Wat SDXL schilderde, blijft op spelgrootte deels te zien**: donkere lijnen om de onderdelen, planken in de velg, de
  naaf, en het doel zijn aandeel lijnen (21%).
- **D ligt in kleur dichter bij het doel**, want D is erop geijkt.
- **Onze eigen nagels vallen weg.** Ze hebben geen afwikkeling en krijgen dus geen beschildering; SDXL's eigen nagels
  zitten wel in de bak.
- **Het licht eruit halen is het moeilijke stuk.**
  - Alles eruit (1,0): de kleur ligt dichter bij het doel, maar een vlak dat in het bronbeeld in de schaduw lag, wordt in
    de zon fel oranje.
  - De helft eruit (0,5): in elke richting bruin, maar in de richting van het bronbeeld zelf te donker (33% lijn).

  Dat valt bij te stellen per materiaal (de helderheid van het albedo op die van het doel zetten), maar dat is nog niet
  gedaan.
- **F: de bak met stijl D erop.** Geprobeerd, niet in de platen. Het lijkt op D: de kleurreeksen van D nemen de kleur
  over, en van de beschildering blijft alleen een vleug.

### Oordeel

Bakken lost het grootste probleem van een AI-afwerking op: wat de AI schildert, zit vast. Het is herbruikbaar voor elk
ding met een afwikkeling, kost één SDXL-beeld per kant (zo'n anderhalve minuut) en 20 s bakken, en daarna niets extra per
sprite.

Het wiel ligt nu, naar mijn oog, op spelgrootte even dicht bij het ChatGPT-wiel als D, op een andere manier:

- de bak heeft meer getekende lijnen en schilderwerk;
- D heeft de schonere kleuren en de nagels.

Wat het echt dichterbij brengt, blijft de geometrie: een brede velg, dikke spaken met beslag, een grote naaf. Daarna
loont het bakken meer: SDXL schildert dan op de goede vormen.

Volgende stappen (Marcels keus):

1. **De helderheid per materiaal ijken.** Het albedo van de bak naar het doel zetten, zodat het in elke richting klopt.
2. **De nagels mee bakken.** Een afwikkeling voor een nagel, of de kleur op de plek in rust.
3. **Het wiel naar de geometrie van het doel, en dan pas bakken.**

## Het wiel naar het doel (19 okt, proefplaat)

Marcels keus na het bakken: "Ok geometry first". Volgens de afspraak (CLAUDE.md: eerst in woorden en één proefplaat,
dan renderen) staat hier alleen de geometrie, nog zonder SDXL en zonder bak. De plaat: `uit/doelwiel/proef.png`; het
script: `gereedschap/pixelart/doelwiel.cjs proef`.

**Opgemeten op het ChatGPT-wiel**, langs zestien stralen in zijn eigen ellips (R is de straal van het wiel):

| | ChatGPT-wiel | wiel C |
|---|---|---|
| band | 0,92 tot 1,0 R, met een rij nagels | 0,93 tot 1,0 R |
| velg | 0,62 tot 0,92 R, breed, in stukken met naden en nagels | 0,73 tot 0,91 R |
| gat tussen de spaken begint bij | zo'n 0,38 R | zo'n 0,25 R |
| spaken | acht, halverwege zo'n 15 tot 20° breed (bijna 4 eenheden) | acht, smaller |
| naaf | een ring van hout met ijzer, en een koperen kap met knop | klein en ijzer |

**Het wiel naar het doel** (`hdproef.cjs wielDoel`, 52 onderdelen; dezelfde buitenmaat, plek en as als C):

- **De band** van 0,92 tot 1,0 R, met 24 nagels op elk zijvlak.
- **De velg** van 0,62 tot 0,92 R, in acht stukken met een naad midden tussen twee spaken, een nagel aan elke kant van de
  naad en een nagel op elke spaak.
- **Acht brede, platte spaken** (4,6 bij 2,0 bij de naaf, 3,3 bij 1,7 bij de velg).
- **De naaf**: een ton van hout tot 0,24 R met twee ijzeren banden, acht nagels op elk kopvlak, en een kleine kap van
  koper met een bolle knop. Koper is een nieuw materiaal: het gesmede ijzer getoond naar koper, op de plek van het goud
  van de ossenkar.
- **Dun langs de as** (velg ±1,2, band ±1,6, spaken 2,0). Van zuidwest kijk je door een gat tegen de binnenkant van de
  velg aan de overkant. Met de dikte van C vulde die het gat half; het doel is van voren getekend en kijkt erdoorheen.
- **Wat eerst te zwaar was**: ijzeren plaatjes over de naden, hulzen om de spaken, en een ijzeren schijf over de naaf.
- **Wat niet kan**: het doel staat rechter dan onze camera het wiel laat zien.

**Op de plaat:**

- De vorm ligt duidelijk dichter bij het doel: de brede velg, de naden, de nagels, de dikke spaken, de koperen kap.
- De kleur nog niet. Stijl D (opnieuw geijkt op dit wiel) maakt de grote velg te oranje en te licht. Dat is de volgende
  stap: SDXL beschildert dit wiel, en dat wordt gebakken.

**Bijgesteld** (19 okt; Marcel: "make the iron band wider and so also the wheel. And maybe some details on the hub cap"):

- **De band** is breed langs de as (±2,4), en de velg eronder breed mee (±2,0), de spaken iets dikker (2,4 bij 2,0). Op
  het doel is de band een brede grijze strook vol nagels; links zie je zijn loopvlak.

  De gaten tussen de spaken worden daardoor van zuidwest weer wat kleiner: je kijkt tegen de binnenkant van de velg.
- **De kap van koper** is iets groter (0,15 R), met:
  - een opstaande rand;
  - zes koperen nagels in een kring;
  - een kleinere bolle knop met een kraal erop;
  - een smalle ijzeren ring eromheen.

  Van dichtbij: `uit/doelwiel/kap-8x.png`. Op spelgrootte is het een koperen schijf met een paar spikkels.

## Verkleinen zonder detail te verliezen, en het wiel naar het doel gebakken (19 okt)

Marcel bij de bijgestelde proefplaat: "Yea, but i feel like the filter destroys detail when we scale down."

### Wat het detail kost: het filter of het palet?

Gemeten met `doelwiel.cjs filters` (plaat: `uit/doelwiel/filters.png`, getallen: `filters.json`):

- Het wiel naar het doel, naar zuidwest, acht standen.
- Op 4× gerenderd, en met vier filters naar 2× verkleind:
  - box;
  - Lanczos-3;
  - nearest neighbour;
  - **detailbehoudend** (`stijl.cjs verkleinDetail`): een klein onderdeel, zoals een nagel, wint zijn blok; een
    duidelijke donkere lijn of een glimlicht wint van het gemiddelde; anders box.
- Daarna op drie manieren naar een palet:
  - 64 kleuren gedeeld, zoals tot nu;
  - een palet per materiaal: hout 20, ijzer 16, koper 10, elk uit zijn eigen pixels;
  - geen palet.

| filter · palet | nagels te zien (van 63) | flikkeren | detail |
|---|---|---|---|
| box · 64 gedeeld (tot nu) | 12 | 0,166 | 23,8 |
| box · per materiaal | 10 | 0,158 | 23,7 |
| Lanczos · per materiaal | 6 | 0,180 | 25,4 |
| nearest · per materiaal | 19 | 0,255 | 29,5 |
| **detailbehoudend · per materiaal** | **16** | **0,180** | 24,4 |

- **Het gedeelde palet deed het meeste kwaad**, niet het filter. Een mediaansnede geeft de kleuren aan wie veel pixels
  heeft: het koper van de kap kreeg geen eigen kleur en werd bruin, met elk filter. Een palet per materiaal houdt het
  koper.
- **Van de filters houdt nearest de meeste nagels**, maar het flikkert bij draaien het meest. Detailbehoudend houdt er 16
  tegen 10 à 12 bij box, bijna even rustig.
- **Wat kleiner is dan een spritepixel, haalt geen enkel filter.** De zes nagels en de rand op de kap zijn op 2× minder
  dan één pixel.

Voor het wiel naar het doel nu: detailbehoudend verkleind, met een palet per materiaal uit de acht richtingen.

### Het wiel naar het doel, met SDXL erop en gebakken

- **SDXL.** De beelden naar zuidwest en noordoost (101 s elk, de vorm 98,3 en 98,8%). Op het doek lijkt het sterk op het
  ChatGPT-wiel: een band vol nagels, een velg van planken met nerf en nagels, dikke spaken, een naaf van rood koper met
  nagels. Binnen voegde SDXL een paar donkere sleuven in de velg toe.

  De telling van de spaken op het doek werkt bij dit wiel niet meer: door de gaten zie je de brede velg aan de overkant.
- **Gebakken.** Eerst met de helft van ons licht eruit (zoals bij wiel C). Dan werd de grote velg in de zon geel.
  Opgelost met een ijking per materiaal (`bakken.cjs o.ijk`):
  - eerst al het licht eruit;
  - dan per materiaal de helderheid op de mediaan van ons eigen materiaal: hout maal 0,8, ijzer maal 0,9;
  - het patroon van SDXL blijft, het licht komt helemaal van onze renderer.
- **De uitkomst** (`uit/ai/oppervlak-doel/`: `vergelijking.png`, `richtingen.png`, `draaien.png`, `metingen.json`):

| | D (wiel C) | naar het doel, zonder bak | naar het doel, gebakken | doel |
|---|---|---|---|---|
| flikkeren (acht richtingen) | 0,156 | 0,167 | 0,179 | — |
| kleurverschil hout / ijzer | 1,0 / 0,6 | 7,1 / 2,9 | 5,7 / 5,1 | — |
| contrast | 135 | 102 | 94 | 140 |
| lijnen | 17% | 25% | 21% | 21% |
| nagels te zien (zuidwest, van 63) | — | 15 | 5 | — |

### Wat dit laat zien

- **Het bakken werkt.** De stukken velg, de naden en de nagels van SDXL zitten vast in alle acht richtingen, en de kleur
  is overal hetzelfde bruin.
- **Op spelgrootte blijft er weinig van het schilderwerk over.** Het contrast is laag (94), en de nerf, de glimlichten en
  het koper van de naaf verdwijnen. Het wiel zonder bak, met het nieuwe filter en palet, is even goed of beter.
- **De oorzaak is de maat, niet het filter.** Op 2× is een nagel of een naad kleiner dan één pixel. Het ChatGPT-wiel is
  op bijna dezelfde maat getekend (het wiel zo'n 89 pixels hoog) en toont toch elke nagel. Het tekent ze bewust als één
  pixel met veel contrast: licht met een donkere schaduw, en een donkere lijn om elk onderdeel. Dat is het handschrift van
  pixel art. Geen filter en geen AI op 1024 pixels maakt dat vanzelf; het moet op de doelmaat getekend worden, zoals stijl
  D nagels en lijnen tekent.

### Advies

De volgende stap is **het handschrift op het wiel naar het doel**: stijl D (kleurreeksen, nagels als lichte en donkere
pixel, binnenlijnen, lichte randen, contactschaduw) bijgesteld op deze geometrie. Op de proefplaat was D hier te oranje en
te licht: de verdeling van het doel moet per vlak kloppen, niet over het hele wiel.

Met de nieuwe geometrie en het palet per materiaal brengt dat het wiel waarschijnlijk het dichtst bij het doel. Bakken
blijft nuttig voor grote vlakken (planken, muren, huiden), waar het schilderwerk groter is dan een pixel.

## Groter in beeld (19 okt, proefplaat)

Marcel: "Wat als wij onze ingame resolutie voor sprites verhogen?" Op 1920×1080 tekent het spel een sprite van 2× al één op
één. Meer pixels zie je daar dus alleen als alles groter in beeld komt.

Het wiel naar het doel op drie maten, elk één op één (`doelwiel.cjs groter`, `uit/doelwiel/groter.png`), detailbehoudend
verkleind met een palet per materiaal:

| | zoals nu | anderhalf keer zo groot | twee keer zo groot |
|---|---|---|---|
| sprite (interne render) | 2× (4×) | 3× (6×) | 4× (8×) |
| het wiel op het scherm | 82×103 px | 121×152 px | 161×203 px |
| nagels te zien | 15 van 63 | 34 van 64 | 44 van 64 |
| rendertijd per beeld | 2,7 s | 5,4 s | 8,9 s |
| een figuur van 320 beelden (RGBA) | 12 MB | 26 MB | 45 MB |
| wat er van de wereld in beeld past | alles | 44% | 25% |

- **Groter helpt het detail.** Anderhalf keer zo groot laat ruim twee keer zoveel nagels zien.
- **Maar het kost overzicht.** Op een schermafdruk van het spel past bij anderhalf keer nog het dorp met wat bos eromheen,
  bij twee keer alleen het dorp. Voor een spel waarin je van bovenaf bouwt en vecht is dat een ontwerpkeus.
- **Het kost ook rendertijd** (2 tot 3,3 keer) en geheugen (2,1 tot 3,6 keer).
- **Het ChatGPT-wiel op de maat van nu heeft nog altijd meer karakter dan ons wiel op twee keer die maat.** Zijn nagels,
  lijnen en contrast zijn getekend. Groter maken vervangt het handschrift niet; het geeft het alleen meer ruimte.

## Het handschrift op het wiel naar het doel (19 okt)

Marcel besloot bij de proefplaat "groter in beeld": "het doel, zoals nu blijft de scherpte houden zoals ik wil. Dus
groter zou niet moeten hoeven". **De maat blijft**; het detail moet uit het handschrift komen.

**Ontleed.** Stijl D op het nieuwe wiel zat in kleur en verdeling al op het doel:

| | stijl D op het nieuwe wiel | doel |
|---|---|---|
| hout gemiddeld | 108,62,28 | 109,62,28 |
| hout donker / middel / licht | 79 / 19 / 2% | 75 / 21 / 3% |
| lijnen | 13% | 21% |
| losse pixels | 15% | 30% |

Wat ontbrak, was het handschrift. Van dichtbij heeft het doel:

- elke nagel als een lichte stip, op de band en op het hout;
- naden tussen de planken van de velg;
- donkere lijnen om de spaken.

Bij ons waren de nagels vaag of weg, en de velg één glad vlak.

**Gebouwd** in `stijl.cjs`, alles als optie. Zonder de opties blijft de stijlproef hetzelfde.

- **`detailsWinnen`**: een klein onderdeel (een nagel) wint zijn blok in de G-buffer al met één subpixel. Anders verliest
  een nagel die kleiner is dan een spritepixel het van de band.
- **`nagelLicht`**: elke kop een lichte stip (de lichtste toon van het ijzer) en, vanaf twee pixels, een donkere pixel aan
  de kant van de schaduw.
  - Een nagel wordt dan nooit een binnenlijn. Eerst gebeurde dat wel: een nagel is een ander soort onderdeel dan het hout
    eronder, en werd een donkere stip.
  - Een eerste versie maakte een nagel op een lichte ondergrond donker; het doel doet dat nergens.
- **`binnenlijnen.naden`**: een naad tussen twee onderdelen van dezelfde soort die naast elkaar liggen, zoals de stukken
  velg.
- **Het koper** zonder de twee lichtste tonen van de ramp `goud`: brons in plaats van knalgeel.

**Gemeten** (`doelwiel.cjs hand`; `uit/doelwiel/hand.png`, `hand-richtingen.png`, `hand-draaien.png`; zuidwest, acht
standen en een volle slag):

| | stijl D | met het handschrift | doel |
|---|---|---|---|
| nagels te zien | 57 van 64 | **64 van 64** | elke |
| lijnen | 13% | 14% | 21% |
| losse pixels | 15% | 17% | 30% |
| detail | 32,3 | 38,5 | — |
| kleurverschil hout / ijzer | 0,5 / 0,4 | 0,5 / 0,2 | — |
| flikkeren | 0,206 | 0,216 | — |
| volle slag gelijk | 100% | 100% | — |

**Op de plaat:**

- Elke nagel is een lichte stip, de velg heeft zijn naden, en de kap is brons.
- In alle acht richtingen blijft het hetzelfde wiel. Recht van opzij (west) lijkt het al sterk op het doel.
- Het draait even rustig als D. Een nagel springt van pixel naar pixel, maar zit vast op het wiel.

**Wat nog mist:**

- donkere lijnen om de spaken over hun hele lengte (de lijnen: 14% tegen 21%);
- nerf in de planken;
- beslag op de spaken, waar het doel blokjes heeft;
- de camera. Het doel staat rechter.

**De drie erbij** (19 okt; Marcel: "Ja die drie nog toevoegen, we zitten echt heel dicht op waar we willen zijn"):

1. **Beslag op de spaken** (geometrie, `hdproef.cjs wielDoel`): aan elke kant van elke spaak een dun ijzeren plaatje op het
   vlak, waar de spaak in de velg gaat, met twee nagels. Een plaatje op het vlak, geen huls om de spaak: een huls maakte het
   wiel eerder zwaar.
   - Het wiel heeft nu 103 onderdelen (was 55).
   - De render op 4× kost 3,4 s per beeld (was 2,7 s).
2. **Lijnen om de spaken** (`stijl.cjs binnenlijnen.om`): een soort onderdeel (hier de spaken) krijgt een donkere lijn op
   wat er direct achter ligt, al bij een fractie diepte. Ook tegen de binnenkant van de velg aan de overkant, die je van
   zuidwest door de gaten ziet.
3. **De nerf dichter en donkerder** (afstand 1,3 in plaats van 1,6, drie tonen donkerder in plaats van twee), in de velg
   en in de spaken.

| | stijl D | met het handschrift | doel |
|---|---|---|---|
| nagels te zien | 65 van 80 | **80 van 80** | elke |
| donkere lijnen binnenin | 19% | 28% | 18% |
| detail | 33,8 | 44,9 | — |
| kleurverschil hout / ijzer | 0,5 / 0,4 | 1,4 / 0,2 | — |
| flikkeren | 0,205 | 0,231 | — |
| volle slag gelijk | 100% | 100% | — |

Op de plaat heeft de velg nerf, naden en nagels, de spaken hebben nerf en een lijn langs hun kanten, en waar ze in de velg
gaan zit het beslag met nagels. In alle acht richtingen blijft het hetzelfde wiel. Het flikkert iets meer dan D, omdat er
meer getekende pixels meedraaien, maar het zit vast.

## De ossenkar in HD (19 okt, tussenstap)

Marcel: "Ok" op het voorstel: het nieuwe wiel en het handschrift op de hele ossenkar, en SDXL alleen op wat groot genoeg
is. Eerst de kar zonder AI (`gereedschap/pixelart/karhd.cjs proef`, `uit/karhd/proef.png`). Het is de ossenkar van
`ossenkar.cjs`, onveranderd, als de wagen van de heer met de buit, zoals de ChatGPT-wagen.

- **De twee wielen** zijn het wiel naar het doel. Zijn soorten onderdelen staan 100 hoger, want de buit gebruikt 30 tot 35
  ook.
- **Hout, ijzer, koper en de rode verf** krijgen een textuur, met hun eigen licht en patroon (de naden van de planken, de
  munten).
- **De rest** (de zakken, het vaantje, de os) houdt de ramp van nu.
  - Daarvoor schrijft `kern.cjs` met `o.gbuffer` nu ook een materiaal zonder textuur in de G-buffer, met de stap in zijn
    ramp als licht.
  - `stijl.cjs` leest zo'n materiaal onder `~` plus de rampnaam (`rampStijl`): zijn eigen ramp als kleurreeks, de toon
    zoals `kwantiseer` hem kiest.
  - Zo krijgt het het handschrift (de omlijning, en lijnen waar iets ervoor ligt) en houdt het de kleuren van nu.
  - De renderer blijft gelijk: 65 van 65 beelden pixel voor pixel.
- **Een les:** de lijnen tussen onderdelen van een andere soort, en de naden, horen bij hout en ijzer, niet bij een dier.
  De os werd een lappenpop. Op wat geen textuur heeft, alleen de lijn waar iets ervoor ligt.

**Op de plaat:**

- De wielen, de rode bak met naden, de koperen bies en de buit staan.
- De gouden leeuwen op de bak ontbreken nog; dat wordt de stap met SDXL.
- De os is vlak en grijs, waar het doel een romige os met tekening heeft.
- **De render kost 33 s per beeld op 4×** (358 onderdelen). Het meeste zit in de twee nieuwe wielen (103 onderdelen elk,
  vooral losse nagels). Die moeten één onderdeel per kring worden, zoals de nagels op de band al zijn.

## Waarom niet de pixels van ChatGPT zelf (19 okt)

Marcel: "Waarom is het nou zo dat we dit niet gewoon gelijk kunnen krijgen aan de GPT variant. Je kunt de pixels letterlijk
kopieren toch?", en "de gpt variant heeft zoveel meer detail".

- **Het ChatGPT-beeld is één schilderij:** één richting, één stand, 1434×1097 pixels, het wiel 420 pixels hoog (bij ons in
  het spel zo'n 100). Er is geen pixelraster in: 64 procent van de kleurvlakjes op een rij is één pixel breed. Het spel
  wil acht richtingen, een draaiend wiel, een lopende os en licht dat blijft.
- **Gemeten op dezelfde maat als in het spel** (`karhd.doelWagen` tegen `uit/karhd/ZW-0.png`):

  | | pixels | kleuren | buurverschil |
  |---|---|---|---|
  | ChatGPT, op onze maat | 30.927 | 25.009 | 73 |
  | onze HD-kar | 32.431 | 95 | 45 |

  Het verschil zit dus niet alleen in de maat, maar in onze stijl. Het zesde verzoek vroeg handgemaakte pixel art: een paar
  tonen per materiaal, vlakken die rustig worden gemaakt. Dat gooit precies weg wat ChatGPT heeft: bijna elke pixel een
  eigen kleur, een schilderij op pixelmaat.
- **Wat wel kan, de pixels kopiëren en vandaar verder:** het ChatGPT-beeld op ons model bakken, zoals SDXL (`bakken.cjs`),
  en dan de acht richtingen en de standen renderen. De pixels uit het beeld worden dan de kleur op het oppervlak, met de
  verborgen kant gespiegeld. Daarvoor moet ons model dezelfde vorm hebben als het beeld, en moet het beeld erop passen. Bij
  het wiel kan dat nu al, want dat is naar het ChatGPT-wiel gebouwd. Bij de kar komt eerst de vorm (de kar forser).
  Daarna de kleur van het bakken doorlaten (`renderKleur`), zonder hem terug te brengen tot een paar tonen.
- **Een pixelart-LoRA:** Pixel Art XL (`nerijs/pixel-art-xl` op Hugging Face, `pixel-art-xl.safetensors`, 170,5 MB,
  CreativeML OpenRAIL-M). Hij schildert in blokken van 8×8, die je met de naaste buur acht keer verkleint, precies onze
  maat voor het wiel (Z = 8). Zo komt het detail op onze pixels, in plaats van eronder. Maar hij duwt naar weinig kleuren
  en vlakke pixel art, de andere kant op dan wat ChatGPT doet. Niet gedownload.
- **Twee modellen die Marcel noemde** (19 okt), allebei van de maker YoDaR2 op Civitai:
  - `Super_PixelArt_XL_M_V2.0` (Civitai 822320): een heel model (geen LoRA), SDXL Lightning,
    `superPixelartXLMV20.safetensors`, 6,9 GB (fp16). Het maakt sprites van 128×128 op een doek van 1024, dus acht keer
    verkleinen, zoals ons wiel. Het zou op onze kaart draaien, met dezelfde ControlNet en IP-Adapter.
  - `PixelArt_Krea2_5X5_V1` (Civitai 2890305): een LoRA van 218 MB voor Krea 2, een raster van 5×5. Krea 2 zelf (22 juni
    2026, open gewichten) heeft 12,9 miljard parameters, 24,8 GiB in bf16 en 12 GiB in fp8, en vraagt 16 GB of meer. De
    1080 Ti heeft er 11, en kent geen bf16 of fp8. Lokaal draait dat dus niet goed.
  - **De vergunning van allebei:** `allowCommercialUse: ["RentCivit"]`, wat Civitai toont als "Run on Civitai", en
    "Sell images they generate" staat uit ("No commercial use"; nagekeken in `PermissionIndicator.tsx` van Civitai).
    Voor een spel op Steam mogen we de beelden dus niet gebruiken, tenzij de maker het toestaat. Pixel Art XL (CreativeML
    OpenRAIL-M) mag dat wel.

## De pixels van ChatGPT op het wiel (19 okt, proefplaat)

Marcel: "Maak de proefplaat zonder download: zoals nu, en de ChatGPT-pixels gebakken in volle kleur."
(`node gereedschap/ai/oppervlak.cjs --wiel gpt alles`, `uit/ai/oppervlak-gpt/`: `vergelijking.png`, `richtingen.png`,
`draaien.png`.)

**De weg:**
1. Het ChatGPT-wiel (`hdstijl.cjs doelWiel`) gaat op onze render van zuidwest, stand 0, op 8×. De ellips van ons wiel gaat
   naar een cirkel, en de cirkel naar de ellips van het hare (`ellipsVan`). Ertussen zit de draaiing (4,3°) waarbij wat
   dekt het best samenvalt: 87 procent.
2. Bakken via (u, v), zoals bij SDXL, gaf strepen: de acht spaken delen één beschildering, en de voor- en zijkant van een
   spaak vallen op dezelfde texels. Daarom **projecteren** (`bakken.cjs projectie`). Elk punt van het oppervlak neemt de
   ChatGPT-pixel waar het naar zuidwest op valt, zonder ons licht. Wat ChatGPT niet laat zien, neemt de pixel van een
   gedraaide (om de 45°) of gespiegelde kopie.
3. Onze renderer belicht het opnieuw, in elke richting en stand. Met de naaste pixel van 4× naar 2×: box en
   detailbehoudend waren even modderig (`verkleinen.png`).

**Wat het laat zien:**
- **Kopiëren werkt.** Waar ChatGPT het oppervlak laat zien, geeft de render naar zuidwest op 8× zijn pixels terug: gemiddeld
  3 op 255 verschil. Elders draait het mee en krijgt het ons licht. Naar west, noordwest, oost en zuidoost ziet het wiel er
  rijk uit, met het hout en de glimlichten van ChatGPT. Met het handschrift erover (de lijnen) vind ik het daar het
  rijkst van alles tot nu toe.
- **Naar zuidwest is het minder scherp dan het origineel op dezelfde maat.** Ons wiel is niet tot op de pixel het hare.
  - Ongeveer één op de vijf pixels van ons wiel heeft naar zuidwest geen eigen ChatGPT-kleur:
    - de helft zag ChatGPT niet. Dat zijn de randen van de spaken, die net anders liggen, en de binnenkant van de velg aan
      de overkant: ChatGPT tekent daar de rode bak, wij laten de velg zien;
    - de andere helft valt door het filter hieronder.
  - Zo'n pixel leent van een kopie, en dan breken de spaken op 2×.
  - Een donkerrood randje van de bak werd door ons licht paars. Daarom telt een paarse pixel niet mee (rood en blauw
    allebei boven groen).
  - **Een strenger filter maakte het slechter.** Ik gooide alles weg wat roder was dan oranje, en liet niets meer dan ruim
    twee keer lichter worden. Daarmee verdween ook de roodbruine schaduw op de spaken, en die werden olijfkleurig
    (`filter.png`). Marcel over de eerste versie: "deze kwam heel dichtbij die van gpt". Terug naar die versie, met alleen
    het paars eruit.
  - **Vullen hielp niet.** Een pixel die ChatGPT niet zag, nam de naaste pixel die hij wel zag (vaak de donkere rand). Dat
    maakte de spaken naar zuidwest strakker, maar de gaten ertussen zwart, en in de andere richtingen kwamen er zwarte
    vlekken (`plafond.png`). Weer weggehaald.
- **De gemeten maten (alle acht richtingen, acht standen en een volle slag):**

  | | flikkeren | nagels (ZW) | lijnen (ZW) |
  |---|---|---|---|
  | zoals nu (stijl D met het handschrift) | 0,217 | 66/77 | 14% |
  | ChatGPT, volle kleur | 0,275 | 29/77 | 26% |
  | ChatGPT, met het handschrift | 0,194 | 12/77 | 26% |

  - In volle kleur flikkert het meer: de naaste pixel springt bij draaien.
  - Met het handschrift (de kleur van de render, de lijnen erover) flikkert het minder dan nu.
  - De nagels van ChatGPT zijn op 2× te klein, en onze nagels (losse onderdelen) liggen niet op die van ChatGPT.
- **4× tegen 2×** (`maat.png`, even groot in beeld). Marcels "heel dichtbij" ging over een plaat op 4× en 8×, twee à vier
  keer zo fijn als de sprite in het spel. Op 4× houdt de projectie het hout, de randen en de glimlichten van ChatGPT. Op 2×
  gaat daar een deel van verloren; het ChatGPT-wiel zelf ook, maar minder, omdat zijn randen precies op zijn eigen vorm
  liggen. Op 1920×1080 tekent het spel de sprite van 2× één op één. Een sprite van 4× zou je zien op een 4K-scherm, of
  op 1920×1080 als alles twee keer zo groot in beeld komt (zie "Groter in beeld").
- **Wat het voor de kar betekent:** de pixels van ChatGPT kunnen erop, als ons model dezelfde vorm heeft als het
  ChatGPT-beeld. Hoe beter de vorm past, hoe minder er geleend wordt. Daarom eerst de vorm (de kar forser), en dan de
  pixels van de wagen projecteren.
