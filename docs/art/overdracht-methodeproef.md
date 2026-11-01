# Overdracht: de methodeproef van de speerman

Stand van 31 okt 2026. Voor wie hier verdergaat zonder het gesprek te kennen, mens of AI. De uitkomsten en cijfers staan in [`methodeproef.md`](methodeproef.md); dit bestand zegt hoe je verdergaat.

**Later op 31 okt:** Marcel keurde D8 artistiek niet goed en vroeg eerst een vormcorrectie. Die is gemaakt en wacht op zijn beoordeling: [`vormproef.md`](vormproef.md). Lees dat bestand na dit stuk. De grote zip is van vóór deze ronde; de lichte zip met `vormproef` in de naam niet.

**Nog later op 31 okt:** vormproef V4, ook wachtend op zijn beoordeling: [`v4/OVERDRACHT.md`](v4/OVERDRACHT.md). Dat is nu de actuele stand; de zip is `Tithebreaker-vormproef-V4-overdracht-2026-10-31.zip`.

## 1. De stand in het kort

**Het spel:** Tithebreaker (map en opslagplaats heten nog Aardschok), een isometrisch spel in de browser (WebGL2) met de economie van The Settlers en gevechten in real time. Het wordt op Steam verkocht. Het beeld komt uit code. De sprites worden uit 3D gerenderd in acht richtingen en verkleind tot 80 pixels hoog.

**De vraag (vraag 192):** de speerman moet dichter bij Marcels AI-plaat (`docs/art/referentie/aardschok-speerman-detail.png`), met een reproduceerbaar proces dat ook voor de rest van de wereld werkt, terwijl skelet, animaties en camera blijven.

**De uitkomst:** methode D8 is de beste, en zichtbaar beter dan de huidige render. De vorm loopt nog achter op de plaat.

| Onderwerp | Stand |
|---|---|
| Proef en rapport | **Af** |
| Marcels oordeel over D8 | **Technische basis, artistiek niet goedgekeurd** |
| Vormronde (de grootste winst die overblijft) | **Proef klaar, wacht op Marcels oordeel** (`vormproef.md`). D8 pas na zijn expliciete akkoord |
| Spel en productie | **Niet veranderd.** Het spel draait op zijn eigen vellen |
| Git | **Niets gecommit** (zie kop 7) |
| `npm test` | Groen op 31 okt: 1084 van 1084 |
| Processen | ComfyUI, de server en de ketens zijn gestopt |

**Dit is een technische proef, geen artistiek afgerond product.** Goedkeuren doet Marcel.

## 2. Wat er op Marcels besluit wacht

1. **Is de nieuwe vorm goed genoeg voor D8, of eerst verder aanpassen?** Kijk naar `bewijs/vormproef/vorm-naast-elkaar.png`. Mijn advies: eerst verder aanpassen, want elke modelwijziging kost daarna zo'n 50 minuten D8.
2. **Mag de staande pose veranderen, en blijft het kleinere hoofd?** Zie `vormproef.md`, "Besluiten voor Marcel".
3. **Mag het de git in?** Marcel: "commit of push niets zonder mijn toestemming."

Twee keuzes maakte ik zelf voor het eindbeeld, die hij nog kan terugdraaien: de halve AI-laag op de helm, en de staalwaarden uit de plaat (`stijl.json`, en `bewijs/methoden/helm-laag.png`, `staal-proef.png`).

## 3. Afspraken die gelden

Uit Marcels opdrachten:

- "Download niets zonder de licentie, herkomst en toepasselijkheid te controleren."
- "Gebruik geen auteursrechtelijk beschermde game-assets zonder toestemming."
- "Bewaar bestaande bestanden en functionaliteit; voer geen destructieve wijzigingen uit zonder expliciete toestemming."
- "Presenteer een technisch werkend prototype niet als een artistiek afgerond product."
- "Forceer geen positieve conclusie." Toon bij elke verbetering de render.
- "We willen niet dat AI ieder animatieframe afzonderlijk opnieuw tekent."
- "Voer geen grootschalige productie van nieuwe assets uit." Eerst de methode.

Over de stijl:

- "Je mag de oude speerman helemaal loslaten." "Het mag meer 'cartoony'."
- Verhouding A, die van de plaat ("Laten we A proberen"): hoofd met helm 32 % van de lengte.
- De nieuwste plaat leidt. Botst tekst met plaat, leg het hem voor met beelden ernaast.
- Eerst in woorden, dan één proefplaat, dan pas alles. Eerst het model, dan de animatie.
- Beoordeel op spelmaat. Laat beweging zien als MP4: APNG en GIF speelden bij hem niet af.

Uit `CLAUDE.md`: code, commentaar en documenten in het Nederlands, spelteksten in het Engels. Geen `Math.random` in de wereld. `CLAUDE.md` blijft onder de grens van de toets (`test/claude.test.cjs`), dus nieuwe kennis gaat naar `ontwerp/`. Tokens zijn duur: zuinig met agents.

## 4. Hoe D8 werkt

```
figuur.py            model, skelet, verf op de punten          bron/speerman.blend
   |
textuur_b.py         UV-texturen, AO, per texel plek en normaal methoden/tex/speerman-tex.blend, tex/texturen/
   |
schilder.py          verf per texel, met een reden per laag     tex/B0/
   |
gbuffer.py + verlicht.py   een vaste render per richting        ai/D-r/
   |
ai_invoer.py         init, masker, diepte, lijnen               ai/D-inv/
   |
textuur-proef.cjs    SDXL binnen het silhouet, 8 aanzichten     ai/D-ai/
   |
projecteer.py laag   AI min invoer, terug op de UV, per richting tex/D-laag/<richting>/<deel>-verschil.png
   |
gbuffer.py           G-buffer per beeld, met verf en laag       vol/g-staan, vol/g-lopen
   |
verlicht.py          het geschilderde licht, plus de laag       vol/r-staan, vol/r-lopen
   |
vel.py               de afwerking uit de productie              vol/vellen/speerman-*.png en .json
```

Vier dingen die je moet begrijpen:

1. **Het licht is geen Cycles-licht.** Cycles levert alleen de G-buffer: witte materialen, de zon voor de schaduw, en AOV's. `verlicht.py` rekent per pixel de lichtwaarde uit en zoekt per materiaalsoort de kleur op in een verloop uit de plaat (`ramps-d.json`). Daarom verschuift de tint van schaduw naar licht.
2. **De AI levert een verschil, geen kleur.** Per richting gaat ΔLab = AI min invoer op de UV (8 bit: Δ/100 + 0,5). `verlicht.py` telt dat op bij het eindbeeld. In rust is het dus precies de AI-verf. In beweging blijft de verf op het oppervlak en verandert het licht mee.
3. **Het palet blijft staan.** Per onderdeel en richting gaat het midden van Δ eruit (`nul_L`, `nul_ab` in `projecteer.py`), en positieve ΔL telt niet in diepe schaduw (`laag_diep`).
4. **Spritevel en anker komen ongewijzigd uit de productie** (`vel.py`). Het spel merkt het verschil dus niet.

## 5. Verdergaan

### De vormronde

Gedaan als variant in `proef/vorm3.py`, zonder `figuur.py` te wijzigen. Wat er nog anders is dan op de plaat, staat in `vormproef.md`. Een wijziging aan de vorm en alle controles opnieuw: `bash gereedschap/blender/stijl/proef/keten_vorm.sh` (15 min).

**Na Marcels akkoord, niet eerder:**

1. Maak het textuurmodel van `uit/stijl/vormproef/speerman-v3.blend` (zie kop 6, met dat bestand in plaats van `bron/speerman.blend`).
2. Draai `keten_d.sh`. **Let op:** de ketens wijzen nu naar `methoden/tex/speerman-tex.blend` en overschrijven de lagen van de vorige vorm: zet de uitvoer in een eigen map. Kijk de AI-aanzichten na vóór de lagen: één raar aanzicht wordt één rare richting.
3. Draai `keten_d8.sh`, verbeter gezicht en helm apart, en controleer acht richtingen, animaties, 80 pixels en het spel. Rapporteer kosten en stabiliteit.

### Daarna

- **Gezicht:** de AI maakt het ouder en strenger dan de plaat. Probeer de zin in `textuur-proef.cjs` (`POSITIEF`) en een lagere sterkte voor het hoofd.
- **Helm:** nog te korrelig (fijnste band 3,24 tegen 0,93 op de plaat), en de hoogste lichten zijn te zwak. De korrel komt **niet** van de AI-laag (gemeten). Zoek in `staal_omgeving` in `verlicht.py` en de overdreven normalen.
- **Bruin:** schiet door in klein detail (3,16 tegen 2,50). Kijk naar `fijn` en `grof` in `stijl.json`, en naar leer in `schilder.json`.
- **Laarzen en buidel:** laarzen lichter dan de plaat, en de buidel wisselt per richting het sterkst van kleur.
- **Schaal bewijzen:** één andere eenheid, de kruisboogschutter, voor er meer komt. Die moet op hetzelfde skelet.
- **Nog meten:** Firefox en de beeldtijd in de browser (`npm run tekenmeting`). Aanvallen, geraakt worden en sterven zijn nog niet in deze stijl.
- **Voor de verkoop:** de actuele voorwaarden van FaeTastic lezen, en de AI-inhoud melden bij Steam.
- **Als D8 wordt gekozen:** de productievoorstellen in `methodeproef.md`, kop 13. Pas dan `speerman-*` in het spel vervangen en `vorm=1` uit `figuur.py` halen.

## 6. Draaien

### De omgeving

| Wat | Versie of plek |
|---|---|
| Windows 11, Git Bash | Alle ketens zijn Bash |
| Blender | 5.2.3 LTS, `C:/Program Files/Blender Foundation/Blender 5.2/blender.exe` |
| Python voor de meetscripts | 3.12.10 van ComfyUI: `C:/ComfyUI/ComfyUI_windows_portable/python_embeded/python.exe`, met numpy 2.5.3, scipy 1.18.1, Pillow 12.3.0, av en torch. Geen opencv of OpenEXR |
| Node | 24.16.0 |
| GPU | GTX 1080 Ti, 11 GB. Cycles op CUDA. SDXL laat zo'n 4,3 GB vrij |
| Paden | Vast in de ketens: pas `PY` en `BL` aan op een andere pc |

**Modellen van ComfyUI, niet in de zip** (12,8 GB, elk met een eigen licentie; zie `methodeproef.md`, kop 12), in `C:/ComfyUI/ComfyUI_windows_portable/ComfyUI/models/`:

| Bestand | Bytes |
|---|---|
| `checkpoints/civitai-faetastic/SDXLFaetastic_v24.safetensors` | 6.938.040.682 |
| `controlnet/controlnet-union-sdxl-promax.safetensors` | 2.513.342.408 |
| `clip_vision/CLIP-ViT-H-14-laion2B-s32B-b79K.safetensors` | 2.528.373.448 |
| `ipadapter/ip-adapter-plus_sdxl_vit-h.safetensors` | 847.517.512 |

ComfyUI starten, alleen nodig voor de AI-stappen, en daarna weer stoppen:

```bash
cd /c/ComfyUI/ComfyUI_windows_portable && ./python_embeded/python.exe -s ComfyUI/main.py --windows-standalone-build --disable-auto-launch
```

### De ketens

Alle ketens gaan vanzelf naar de hoofdmap. Korte namen hieronder: `P` = `gereedschap/blender/stijl/proef`, `M` = `gereedschap/pixelart/uit/stijl/methoden`.

| Doel | Opdracht | Duur |
|---|---|---|
| Stijl gewijzigd (`stijl.json`, `verlicht.py`): licht, vellen, platen en metingen opnieuw | `bash $P/keten_licht.sh` | 4 min |
| `projecteer.py` gewijzigd: lagen, G-buffers en alles daarna | `bash $P/keten_d8.sh` | 20 min |
| Verf en AI opnieuw (ComfyUI aan) | `bash $P/keten_d.sh` | 25 min |
| Alle methoden opnieuw naast elkaar | `bash $P/keten_vergelijk.sh` | 15 min |
| De huidige productie | `npm run stijl` | |

Het textuurmodel opnieuw, nodig na elke modelwijziging, en ook na het uitpakken van de zip voor alles wat `schilder.py` of `projecteer.py` gebruikt (6 min):

```bash
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b gereedschap/pixelart/uit/stijl/bron/speerman.blend -P gereedschap/blender/stijl/proef/textuur_b.py -- gereedschap/pixelart/uit/stijl/methoden/tex/speerman-tex.blend
```

**Van nul af, in deze volgorde:** `npm run stijl`, `textuur_b.py`, `keten_d.sh`, `keten_vergelijk.sh`, `keten_d8.sh`.

**Eerlijk:** dit is nooit in één keer van nul gedraaid; de stukken zijn apart gedraaid en de ketens daarna opgeschreven. En de invoer van methode C (`ai/gb`, `ai/basis-r`) is destijds met de hand gemaakt en zit in geen keten. C is afgewezen: als hij ontbreekt, laat je dat stuk van `keten_vergelijk.sh` weg. `keten_d.sh` en `keten_vergelijk.sh` hebben nog geen `pipefail`, en `keten_vergelijk.sh` vraagt ComfyUI om geheugen vrij te geven en heeft die dus aan.

### De sprites in het spel bekijken

Op de server (`npm start`, poort 8123), in de console:

```js
const T = Spel; const WEB = 'gereedschap/pixelart/uit/stijl/methoden/vol/vellen/';
const f = T.sprites.figuurGegevens('speerman');
for (const h of ['staan', 'lopen']) {
  const g = await (await fetch(`${WEB}speerman-${h}.json`)).json();
  f.houdingen[h] = { ...f.houdingen[h], bestand: `../../${WEB}${g.bestand}`, beelden: g.beelden, fps: g.fps, herhaal: true, cel: g.cel, anker: g.anker };
  if (g.stap) f.houdingen[h].stap = g.stap;
}
T.ui.sluitTitel(T.S); T.beginOpEiland(T.S, 5, T.LEVELS.demojaar); T.debug.geenNacht = true; T.debug.geenMist = true;
```

Dit blijft alleen tot je de bladzijde opnieuw laadt. Stap daarna 50 seconden vooruit (`await T.debug.stap(45)`, in stukken), dan staan de soldaten op het plein. Zoom 2 vraagt een venster van 1800 bij 1080. `T.soldatenVan(T.S.dorp)` geeft de soldaten; vanaf de eerste seconden zijn ze er nog niet of staan ze achter bomen. Lopen: `T.geefOpdracht(T.S, { soort: 'stuur', wie: T.nummersVan(D, wezens), naar: { x, y } })`.

## 7. Git: lees dit voor je commit

- **Nog niet in git, en dus alleen op Marcels pc en in deze zip:** heel `docs/`, heel `gereedschap/blender/stijl/`, `gereedschap/ai/textuur-proef.cjs`. Ook van eerdere rondes en niet in deze zip: `gereedschap/blender/basismens/`, `humgen/`, `glb_kijk.py`, `kopie_*.py`, `gereedschap/ai/loop14.cjs`, `soldaat-ai.cjs`, `gereedschap/pixelart/bron/soldaten/gpt/`, `EXTRA/` en `assets/`. Die heb ik niet nagekeken.
- **Gewijzigd maar niet gecommit:** `.claude/skills/modelleren/SKILL.md`, `CLAUDE.md` (1 regel), `ontwerp/beeld.md` (+366 regels, vanaf vraag 190), `ontwerp/gereedschap.md` (+130), `package.json` (de opdrachten `basismens` en `stijl`).
- **`gereedschap/pixelart/uit/` staat in `.gitignore`:** het model `bron/speerman.blend`, de lagen en de AI-beelden gaan nooit mee met git. `npm run stijl` bouwt het model opnieuw, maar de AI-beelden komen alleen terug met dezelfde modellen en hetzelfde zaad. **De zip is nu de enige kopie buiten deze pc.**
- **`main` loopt achter:** HEAD is `43ec9a8d`, en `origin/main` is 38 commits verder (`6f0e8172`). Eerst `git fetch origin main` en samenvoegen.
- **Het teken:** in `origin/main` staat "**Bezig in sessie `lokaal-510618ba`**" bij 192. Haal het weg zodra het werk in `main` staat of stopt. Lokaal staat het er nog niet, en het blok "Nu en daarna" in `ontwerp/werklijst.md` is hiervoor nog niet bijgewerkt: doe dat na het samenvoegen.
- **Meer sessies in één map:** ze delen de git-index. Nooit `git add` in de gedeelde index. Maak een eigen index (`GIT_INDEX_FILE=<kladmap>/x.index git read-tree HEAD`), en voor gedeelde bestanden een patch van alleen de eigen stukken met `git apply --cached`. Lees vóór het committen `git diff --cached --stat` met dezelfde index na.
- **Pushen:** alleen op Marcels vraag, en zo: `git fetch origin main && git merge-base --is-ancestor origin/main HEAD && npm test && git push`.

## 8. Valkuilen

Dit kostte tijd. De meeste staan ook in de skill `modelleren`.

**Ketens**
- **Geen numpy in zes draden tegelijk.** `projecteer.py` in een `ThreadPool(6)` hing een nacht lang, zonder fout en zonder rekenwerk (baard en helm bleven hangen). De oorzaak is niet bewezen. Eén voor één werkt het, 452 s.
- **`set -e` zonder `pipefail` ziet geen fout vóór een `| tail`.** Zo liep de keten door op halve lagen.
- **`TaskStop` kan kindprocessen laten leven.** Kijk na het stoppen in de proceslijst, en stop alleen je eigen PID's: andere sessies gebruiken dezelfde Python en Blender.
- **Bewaak op voortgang**, niet alleen op het einde: een logboek dat niet meer groeit is een alarm.
- De melding `HIPEW initialization failed` van Cycles is onschuldig: de AMD-bibliotheek ontbreekt.

**Beeld en data**
- **Blender bewaart absolute beeldpaden** tenzij je `make_paths_relative` aanroept. Zo leek de eerste toets van de zip te slagen terwijl het model zijn normal maps nog van de oude plek haalde. `textuur_b.py` doet het nu zelf; kijk bij een toets altijd waar de bestanden vandaan komen.
- **Multilayer-EXR uit Blender 5 is multi-part** (vlag 0x1000, ZIP, half float), met `im.media_type='MULTI_LAYER_IMAGE'`. Daarom de eigen lezer `exr.py`.
- **`RAMPS=ramps-d.json`** moet aan staan voor `verlicht.py` bij D en uit bij A. `vel.py` gebruikt het niet.
- **`verlicht.py ijk`** legt de percentielen van het licht eenmalig vast. Draai het opnieuw na een modelwijziging; `keten_d.sh` doet dat.
- **`speerkijkt`** moet mee naar `gbuffer.py`, anders staat de speer anders dan in de productie.
- **De speer zit niet in de AI-aanzichten van het lijf:** hij zou het lijf bedekken. Hij heeft een eigen pass (`alleen=speer`, ortho 2,0, 4 aanzichten) en één laag.
- **Een ID-kleur van 0,5 staat in sRGB als 0,735** in de PNG (`richtingen.py`).
- **Een plaat in `vergelijk.py` kan oud zijn:** kijk altijd naar de tijd van het bestand. Een eerdere keten schreef stil geen lagen weg; `dekking-hoofd.json` moet `nul_L` bevatten.
- **Vuil in bruin maakt blauw paars:** vuil is donkerder en doffer in de eigen kleur. Krassen op laarzen geven camouflagelijnen (`kras_L=0`). Lobben op stof geven vlekken.
- **De browser:** `requestAnimationFrame` loopt nauwelijks in een verborgen paneel, sprites laden traag na het herladen (wacht twee seconden voor een schermafdruk), en de eerste schermafdruk na een nieuw spel is vaak leeg.

## 9. De zip

Naam: `Tithebreaker-methodeproef-overdracht-2026-10-31.zip`, op deze pc in `gereedschap/pixelart/uit/stijl/overdracht/`. De mappen staan zoals in de opslagplaats, met `OVERDRACHT.md` en `INHOUD.txt` (elk bestand met grootte en SHA-256) bovenaan. **Pak hem uit in een lege map, niet over de werkmap:** hij bevat oudere of nieuwere kopieën van bestanden die in git staan.

Er is ook een lichte zip (`Tithebreaker-overdracht-licht-2026-10-31-vormproef.zip`, onder de 30 MiB, de grens van Remote Control): de documenten, alle code met `vorm3.py`, de bewijzen van de methodeproef en de vormproef, de vellen en de referentieplaat van de speerman. Daarmee kun je alles lezen en bekijken, en met de pijplijn op de pc de nieuwe vorm in 15 minuten opnieuw bouwen. D8 opnieuw maken kan er niet mee: het oude model, de verf, de lagen en de AI-beelden zitten alleen in de grote zip.

| In de zip | Waarom |
|---|---|
| `docs/art/` | Rapporten, art bible, referenties, alle bewijzen |
| `gereedschap/blender/stijl/` | De productie en de proef, zonder `__pycache__` |
| `gereedschap/ai/` (`textuur-proef`, `beeld-ai`, `afwerking`, `doek`, `etiket`, `ai-afwerking.md`) | De AI-stap en wat die nodig heeft |
| `ontwerp/beeld.md`, `gereedschap.md`, skill `modelleren`, `CLAUDE.md`, `package.json` | De gewijzigde projectbestanden |
| `uit/stijl/bron/speerman.blend` en `.json` | Het model |
| `uit/stijl/vellen/`, `methoden/vol/vellen/` | De huidige en de nieuwe vellen |
| `methoden/tex/speerman-tex.blend`, `.json`, `texturen/*.png` | Het textuurmodel en zijn beelden |
| `methoden/tex/B0/`, `D-laag/` | De verf en de AI-lagen van D8 |
| `methoden/ai/` (`D-ai`, `D-inv`, `S-ai`, `S-inv`, `C-ai`, `C-inv`, `reeks`, `stijl-speer.png`) | AI-beelden en invoer: hiermee hoeft de AI niet opnieuw |
| `methoden/vol/r-hoog/` | De acht richtingen groot |

| Niet in de zip | Hoe je het terugkrijgt |
|---|---|
| AI-modellen (12,8 GB) | Licentie en bron per model in `methodeproef.md`, kop 12 |
| `tex/texturen/*.npz` (1,75 GB) | `textuur_b.py`, 6 min |
| G-buffers (`g/`, `vol/g-*`, `ai/gbD`, `ai/gbS`, 850 MB) | `keten_d8.sh` |
| Renders (`vol/r-staan`, `r-lopen`, `hoog/`, `spel/`, `helm/`) | `keten_licht.sh`. Hiervoor zijn de G-buffers nodig |
| `tex/B`, `tex/C`, `Cruw`, `D-laag-65`, `D-laag-test` | Methoden en proeven die afvielen; zie de ketens |
| `backup-v2/` (119 MB) | Back-up van de productie vóór de proef; blijft op deze pc. De productie is er gelijk aan |
| De rest van het spel en `EXTRA/`, `assets/` | GitHub en deze pc |

### Hoe de zip getest is

Op 31 okt, uitgepakt in een lege map, en alles vanuit die map gedraaid:

| Toets | Uitkomst |
|---|---|
| Elk bestand tegen `INHOUD.txt` | 444 van 444 goed |
| Beeldpaden in `speerman-tex.blend` | 36 van 36 relatief, en gevonden in de uitgepakte map |
| Staan: G-buffer, licht en vel | Tegen het vel uit de keten: 7 pixels anders op 312×1104, hooguit 1 op 255 |
| `textuur_b.py` van het model uit de zip | Werkt, 336 s, 24 `.npz` en 48 `.png` |
| `schilder.py` op die gegevens | Alle 12 de verfbeelden pixelgelijk aan `tex/B0` |
| `projecteer.py laag` met de AI-beelden uit de zip (laarzen, 5 van de 9 lagen vergeleken) | Pixelgelijk aan `tex/D-laag` |

**Niet getest:** een andere pc, de AI opnieuw draaien vanuit de zip (de AI-beelden zitten erin, dus dat hoeft niet), lopen en de overige onderdelen van de lagen vanuit de zip, en de ketens als geheel vanuit de zip. Die laatste hebben vaste paden naar Blender en Python, en voor de platen ook G-buffers die er niet in zitten.

## 10. De kaart van de scripts

In `gereedschap/blender/stijl/proef/`:

| Bestand | Wat het doet |
|---|---|
| `exr.py` | Leest multi-part EXR: `lees(pad)`, `passes(pad)` |
| `gbuffer.py` | Rendert de G-buffer. Opties onder meer `beelden`, `richtingen`, `pixels`, `hoog`, `monsters`, `elevatie`, `ortho`, `doelz`, `zonder`, `alleen`, `zon`, `tex`, `laag`, `laagals`, `speerkijkt` |
| `verlicht.py` | Het licht: `verlicht.py ijk <gb> [houding] [richtingen=]`, `verlicht.py <gb> <uit> <houding>` |
| `stijl.json` | Vorm, contact, rand, staal, soorten, `laag_per_deel` |
| `ramps.json`, `ramps-d.json` | Kleurverlopen voor A, voor D |
| `ramps_plaat.py`, `plaat_vakken.py` | Meten de verlopen op de plaat |
| `textuur_b.py` | Bouwt het textuurmodel en de gegevens per texel |
| `schilder.py`, `schilder.json` | De verf: `schilder.py <texturen> <uit> [sterkte=] [delen=] [ao=]` |
| `render_tex.py` | Productie-`render.py` op het textuurmodel (methoden B en C) |
| `ai_invoer.py` | Init, masker, diepte, lijnen voor de AI |
| `projecteer.py` | `projecteer.py laag <inv> <ai> <gb> <tex> <uit> <houding> [richtingen=] [delen=] [per=] [hoogdoorlaat=] [scherp=]` |
| `oorzaak2.py`, `stabiliteit.py`, `richtingen.py` | De metingen: per schaal en tint; beweging; per richting |
| `render_id_kleuren.py` | De ID-kleuren per onderdeel |
| `vergelijk.py`, `naast_plaat.py`, `overzicht2.py`, `strook.py`, `film2.py`, `stijlblad.py` | De platen en films |
| `stijlset.json` | Globaal tegenover per asset, met de AI-instellingen |
| `vorm3.py` | De nieuwe geometrie: vervangt velden van `figuur.py`, alleen in zijn eigen proces |
| `skelet_vergelijk.py`, `doorsteek.py` | Zijn skelet en animaties gelijk; welke onderdelen snijden elkaar |
| `vormplaten.py` | De platen en de maten per onderdeel van de vormproef |
| `keten_*.sh` | Zie kop 6 |

Productie, ongewijzigd, in `gereedschap/blender/stijl/`: `figuur.py` en `vorm.py` (model), `skelet.py`, `beweging.py`, `materialen.py` en `.json`, `licht.py`, `render.py`, `vel.py`, `controle_*.py`, `oorzaak.py`, `textuur.py`, `export.py`, `maak.cjs`, `inspel.js`.

De AI-stap: `node gereedschap/ai/textuur-proef.cjs <invoer> <uit> <houding> [richtingen=] [denoise=] [ckpt=] [ip=] [seed=] [zin=speer] [stijl=<png>] [lijn=]`. Hij schrijft `verslag.json` met de tijd en het vrije videogeheugen.

## 11. Eerste stappen voor wie dit oppakt

1. Lees `methodeproef.md`: de conclusie, de tabel met succescriteria en kop 13.
2. Bekijk `bewijs/methoden/plaat-huidig-nieuw.png`, `methoden-details.png`, `in-het-spel.png` en de film `lopen-spelmaat.mp4`.
3. Lees `CLAUDE.md`, dan het blok "Nu en daarna" in `ontwerp/werklijst.md`.
4. Vraag Marcel de drie vragen uit kop 2 voordat je iets groots start.
5. Controleer dat de productie nog gelijk is: `cmp` van `gereedschap/blender/stijl/vel.py` en `render.py` tegen `uit/stijl/backup-v2/code/`.
6. Begin klein: `keten_licht.sh` is de snelste manier om te zien of alles nog draait.
