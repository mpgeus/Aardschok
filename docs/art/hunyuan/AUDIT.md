# Technische audit: Hunyuan3D op de speerman

31 okt 2026. Opdracht: "Aardschok Hunyuan 3D: kwaliteitsverbetering en productieproef", sectie 3. Alles hieronder is nagelezen in de bestanden en uitvoer, of gemeten. Bewijs staat in `docs/art/bewijs/hunyuan/`, de uitvoer in `gereedschap/pixelart/uit/stijl/hunyuan/` (niet in git), de scripts in `gereedschap/blender/stijl/proef/` (`hy_*.py`, `keten_hy_*.sh`, `hy_config.json`).

**De belangrijkste correctie op de vraagstelling:** "Hunyuan vlak" en "Hunyuan 25 graden" zijn niet twee modellen. Het is **dezelfde mesh**, met een andere rendercamera. Zie vraag 5.

## A. De generatie

### 1. Welk model?

| | |
|---|---|
| Model | `tencent/Hunyuan3D-2mv`, map `hunyuan3d-dit-v2-mv` |
| Bestand | `model.fp16.safetensors`, revisie `3a761b5`, 4,93 GB |
| Sha256 | `d36f5881bcdc56726b73e517cd444c13c60732431622da7268145355c8d38e9c`, gecontroleerd na het downloaden |
| Uitvoering | ComfyUI 0.41.0, de eigen knopen, zonder Pinokio. Op schijf: `ComfyUI/models/checkpoints/hunyuan3d-dit-v2-mv_fp16.safetensors` |
| Licentie | Publiek sluit hij de EU uit. Marcel heeft een mail met akkoord van Tencent; Claude heeft die niet gezien (`docs/art/methodeproef.md`, kop 12) |

De instellingen (`hy_comfy.py`, het sjabloon van ComfyUI als basis):

| Instelling | Sjabloon | Eindkeuze |
|---|---|---|
| Stappen, cfg, sampler, planner | 20, 7,5, euler, normal | Gelijk |
| ModelSamplingAuraFlow shift | 1,0 | Gelijk |
| Latents (`EmptyLatentHunyuan3Dv2`) | 3072 | **8192** |
| Octree (`VAEDecodeHunyuan3D`) | 256, 8000 brokken | **512**, 8000 brokken |
| Mesh (`VoxelToMesh`) | surface net, drempel 0,6 | Gelijk |
| Zaad | Willekeurig | 1 |

### 2. Rechtstreeks uit de generatie?

In de vorige vergelijking wel: de kolommen "Hunyuan" waren de ruwe mesh, alleen op schaal gezet en gecentreerd, in klei. Geen remesh, geen textuur, geen nabewerking.

### 3. Welke invoer?

| Plaat | Bestand | Pose | Figuur |
|---|---|---|---|
| `detail` | `referentie/aardschok-speerman-detail.png` | Spreekt zichzelf tegen: W en O andere armen, in O geen speer | 341 px |
| `acht` | `referentie/aardschok-speerman-acht.png` | Eén pose, maar de speer staat in ZW, NW en ZO aan de verkeerde kant | 390 px |
| `draai` | `referentie/aardschok-speerman-draai.png` (Marcel, 31 okt) | Eén pose, geen speer, grijze achtergrond | 500 px |
| `vrij` | `referentie/aardschok-speerman-draai-vrij.png` (Marcel, 31 okt) | Dezelfde opzet, echte alfa | **545 px** |

Per richting los van de achtergrond, op wit en vierkant, op één schaal, de as in het midden, de zolen op één lijn (`hy_invoer.py`).

### 4. Eén afbeelding of meer?

Meer: vier aanzichten (voor, links, achter, rechts = Z, W, N, O). De andere vier richtingen zitten niet in de mesh en niet in de verf: daarmee toets ik of de figuur rondom klopt.

### 5. Wat betekenen "vlak" en "25 graden"?

**De elevatie van de rendercamera, meer niet.** Dezelfde invoer, dezelfde mesh, dezelfde oriëntatie. Vlak leek het best omdat het model de plaat ook als vlak aanzicht leest: dat is precies de camera waarop de mesh is gebouwd. Op de oude plaat van zo'n 20 graden werd de hoek daardoor als een kegel in de mesh gebakken: de zolen hellen 25,3 graden en de helmrand hangt. Een vlakke rendercamera verbergt die fout, maar het spel kijkt op 30 graden en dan kantelt de fout nog een keer.

Op de plaat van 31 okt is die helling weg: 0,2 graden op de 256-mesh en 3,3 graden op de maximale mesh, omdat de plaat zelf bijna vlak is (zo'n 10 graden).

**De camera van de platen**, afgelezen op een liniaal (`plaat-camera-liniaal.png`, plus of min 3 graden):

| Plaat | Camera | Helm achterover |
|---|---|---|
| `detail` | 20° | 12° |
| `acht` | 21° | 9 tot 13° |
| `draai`, `vrij` | 6 tot 14° | 8 tot 11° |

De V4-vergelijkingen stonden op 25 graden, het spel staat op 30. Dat verschil is nooit bewust gekozen.

### 6 en 7. De geometrische resolutie

Alle op de plaat van 31 okt (`vrij`), behalve waar het erbij staat:

| Mesh | Punten | Vlakken | Stukken | Randen niet dicht | Tijd | Piek VRAM | Piek RAM |
|---|---|---|---|---|---|---|---|
| Plaat `detail`, 3072 latents, octree 256 | 113.355 | 232.658 | 1 | 8.614 | 277 s | 6,8 GB | 13,5 GB |
| Plaat `detail`, octree 384 | 255.904 | 518.150 | 1 | 9.350 | 508 s | 8,0 GB | 23,2 GB (Blender liep mee) |
| 3072 latents, octree 256 | 115.821 | 237.524 | 1 | 8.374 | 342 s | 8,0 GB | 17,0 GB |
| 8192 latents, octree 256 | 120.144 | 252.454 | 15 | 16.260 | 589 s | 6,8 GB | 13,7 GB |
| **8192 latents, octree 512** | **486.380** | **994.968** | **19** | **29.528** | **1425 s** | **8,2 GB** | **23,9 GB** |

**Het maximum:** de VRAM is niet de grens (8,2 van 11 GB). Het RAM wel: de maximale mesh gebruikt alle 23,9 GB. Hoger gaat op deze pc niet zonder meer geheugen.

**Wat het oplevert:** 8192 latents maken gezicht, kap, tas en vingers scherper. Maar er komen ook kraters en spikes bij op vlakke stof en de zoom. Octree 512 voegt daarna vooral punten toe, en weinig nieuwe vorm. Meer stappen (40) gaven geen nieuwe vorm. Andere zaden veranderen kleine dingen, niet de identiteit.

### 8. UV's en texturen?

Nee. De generatie maakt alleen vorm. Geen UV, geen textuur, geen materiaal. `hy_uv.py` maakt nu een UV met texturen; dat gaat niet goed genoeg (zie `KWALITEITSRAPPORT.md`).

### 9. Wat zit in de vorm en wat in de kleur?

| In de vorm | Alleen in de kleur (tot de detailpass) |
|---|---|
| Helm met kam en rand, kap, riem met gesp als bult, tassen, rok met split, mouwboorden, handen met vingers als klomp, laarzen met omslag, neus | Klinknagels, quilt, naden, ogen, wenkbrauwen, baardharen, gespdetail, de tweedeling van de tabberd, metaal, leer |

### 10. Wat gebeurt er tussen de generatie en de render?

Vroeger: schalen, centreren, klei. Nu, in deze volgorde (`hy_bouw.py`, per variant aan of uit in `hy_config.json`):

1. Kraters uit de maximale mesh.
2. Per richting de plaat zacht op de mesh vervormen, en de kleur projecteren.
3. De speer als los onderdeel erbij (de plaat heeft er geen).
4. De verf scherper en de relief uit de plaat in de mesh (de detailpass).
5. Render met verf, deels echt licht en contactschaduw.

Niet meer nodig op de nieuwe plaat: de kegelcorrectie, de zolen plat zetten, de losse helm en de vorm naar de plaat buigen. Die staan in de code voor een plaat van schuin boven.

## B. De render

| | Waarde | Bron |
|---|---|---|
| Engine | Cycles op CUDA (OptiX werkt niet op de 1080 Ti) | `licht.py`, `videokaart` |
| Camera | Orthografisch, op 20 m, de figuur draait en de camera staat stil | `licht.py`, `camera` |
| Vergelijkingen | Elevatie 10°, ortho 2,0 m, doel z 0,85 m, 1024 px | `hy_kijk.py` |
| Spel | Elevatie 30°, ortho 3,0 m, doel z 0,74 m, 768 px | `instellingen.json` |
| Zon | Richting (-0,62, -0,60, 0,78), kleur (1,0, 0,92, 0,78), sterkte 3,1, hoek 12° | `instellingen.json` |
| Glanslicht | Richting (-0,5, -0,75, 0,55), sterkte 3,2, hoek 42°, alleen in de glans, geen schaduw | idem |
| Randlicht | Richting (0,75, 0,55, 0,45), koel, sterkte 1,1, geen schaduw | idem |
| Hemel | Verloop boven koel, onder warm, sterkte 0,46 | idem |
| Klei | Basiskleur (0,42, 0,40, 0,38), ruwheid 0,75 | `render.py`, `klei` |
| Tone mapping | `Standard`, look `None`, belichting 0 | `licht.py` |
| Monsters, ruisfilter | 24 tot 32 monsters, ruisfilter aan | `hy_kijk.py`, `instellingen.json` |
| Supersampling, antialias | Geen, alleen de standaard pixelfilter van Cycles | `licht.py` |
| Naar spelmaat | `vel.py`: verkleinen tot 80 px per 1,354 m langs de camera, scherpte 0,2, verzadiging 1,0, donkere rand 0,62 | `vel.py` |
| Nabewerking in de render | Geen | |

**Ontstaat het verschil deels doordat de plaat anders belicht is? Ja, en sterk.** De plaat is geen render: het licht is erin geschilderd. Uit de plaat zelf geschat (`licht_van_de_plaat`) komt het van voren en iets van links, tegen de zon van het spel, die meer van opzij en boven komt. Die schatting is zwak (R² 0,04 tot 0,2), dus lees hem als richting, niet als maat. Proef B laat het direct zien: dezelfde kleur onder echt licht wordt dof, en staal gaat spiegelen. Geen van de vier lichtopstellingen uit proef C haalt dat terug.

## C. Wat kan op de 1080 Ti (11 GB VRAM, 24 GB RAM)?

| Stap | Lokaal? | Gemeten |
|---|---|---|
| Eenmalige generatie | **Ja** | 6 tot 24 minuten; 6,8 tot 8,2 GB VRAM; 13,7 tot 23,9 GB RAM. Het RAM is de grens |
| Mesh bewerken | **Ja** | Alleen numpy, 26 tot 45 s op de maximale mesh |
| Textuur uit de plaat | **Ja** | Projectie per punt, in de bouw meegerekend |
| UV en bakken | **Ja** | Onder de minuut, maar de UV is slecht (rapport) |
| Tencent-textuurmodel | **Getest**, na deze audit, op verzoek van Marcel | 9,51 GB, in `ComfyUI/models/hunyuan3d-2` (hashes gecontroleerd). Draait buiten ComfyUI, met de officiële code in `C:/ComfyUI/hunyuan_tex`. Piek 9,33 GB VRAM. Het vervangt de verf uit de plaat niet, maar vult aan wat de plaat niet zag (`hy_paint.py`, `KWALITEITSRAPPORT.md`) |
| Rig en animatie | **Ja** | Rigtoets lokaal. Een productierig kan in Blender, zoals bij V4 |
| Sprites renderen | **Ja** | Zo'n 3 s per beeld op 768 px, zie het rapport |
| Realtime in WebGL2 | **Niet getest** | Het spel tekent sprites (`js/gl.js`). Skinning van 60.000 vlakken per figuur past daar nu niet in: er is geen skinned-mesh-weg in de engine |

Andere hardware is voor deze proef niet nodig. Meer RAM zou de grens van de mesh verleggen, maar die stap levert al weinig op.
