# Inventarisatie: de artpijplijn op 30 okt 2026

Hoort bij vraag 192 in `ontwerp/werklijst.md`. Gemeten op Marcels pc op stand `43ec9a8d` (lokaal, 38 commits achter `origin/main`).
Licenties zijn gelezen, niet juridisch getoetst.

## Wat er is

| Onderdeel | Stand | Bewijs |
|---|---|---|
| Videokaart | NVIDIA GTX 1080 Ti, 11 GB, driver 560.94 | `nvidia-smi` |
| Blender | 5.2.3 LTS, zonder venster te draaien | `blender --version` |
| Cycles | CUDA werkt. OptiX staat in de lijst, maar `ontwerp/gereedschap.md` meldt dat het op deze kaart niet werkt; niet opnieuw getest | `get_devices()` |
| Rendersnelheid | 768 x 768, 32 monsters, met ID-beeld: 3,5 s per beeld | `staan-render.json` |
| HumGen3D | 4.0.38, volledig scriptbaar | `ontwerp/beeld.md`, ronde 9 |
| MPFB / MakeHuman | geïnstalleerd als extensie | Blender-map |
| Modellen | `speerman_hd.py` (nu in het spel), `basismens/`, HumGen-varianten tot en met ronde 14 | `gereedschap/blender/` |
| Beweging | CMU-opnames, `bakken.py`, `stand.py` | `gereedschap/blender/beweging/LEESMIJ.md` |
| Spritevel | Een rij per richting in `beelden/figuren/`, met per houding bestand, beelden, fps, cel en anker in `beelden/beschrijving.json` | `speerman3d-staan.png` is 44 x 752 |
| Renderer | WebGL2 in `js/gl.js`, figuren in `js/sprites.js` | `CLAUDE.md` |
| Meetgereedschap | `omtrek.py`, `vergelijk.py`, `palet.py`, `patroon.py`, `basismens/controle.py` | `ontwerp/gereedschap.md` |

## Wat herbruikbaar is

- **De conventies:** één vaste camera met een draaiende figuur, het anker op de voeten, en het vel met de beschrijving.
- **De lessen:** de skill `modelleren`, vooral de nakijklijst.
- **De aanpak van `spelvel-zet.cjs`:** vellen en beschrijving naar het spel.

Niet herbruikbaar voor deze stijl: de realistische lijven en hun kleren, en de bewegingen die op hun maten zijn afgestemd. Marcel
(30 okt): "Je mag de oude speerman helemaal loslaten". De bestanden blijven staan tot hij de nieuwe goedkeurt.

## Wat ontbrak

- een gestileerd lichaam
- een vastgelegde stijl (nu `aardschok-art-bible.md`)
- één opstelling voor licht en camera die voor alles geldt
- gedeelde materialen voor figuren, gebouwen en tegels
- één pijplijn: er liepen drie lijnen naast elkaar

## Licenties

| Bron | Licentie | Oordeel |
|---|---|---|
| Stijlpijplijn (`gereedschap/blender/stijl/`) | eigen code, geen externe assets | **geen risico**: de speerman gebruikt geen enkel extern bestand |
| Referentieplaten in `docs/art/referentie/` | herkomst onbekend, door Marcel aangeleverd | alleen als voorbeeld, gaan niet mee in het spel |
| The Settlers II: 10th Anniversary | beschermd | alleen als stijlinspiratie, geen assets |
| HumGen3D | code GPLv3; de assets vallen volgens de README onder een eigen royalty-free licentie | Marcel (30 okt): "Humgen heb ik, dat is geregeld". De nieuwe speerman gebruikt HumGen niet |
| Poly Haven, ambientCG | CC0 | bruikbaar (`assets/extern/ronde13/asset-onderzoek.md`), nu niet nodig |
| CMU-opnames | zie `gereedschap/blender/beweging/LEESMIJ.md` | nu niet gebruikt |
| Sketchfab, CGTrader, Fab | per model; vragen een account | niets gedownload |

## Technische risico's

1. **Hoofdmaat.** De specificatie zegt 24 procent, de nieuwste plaat ongeveer 33. Marcel koos op 30 okt A, de plaat
   (`bewijs/blockout-verhoudingen.png`).
2. **Eén hand voor de speer.** De platen wisselen van hand per richting; dat mag volgens de opdracht niet. Met de speer vast in de
   rechterhand komt hij in ZO dicht bij het gezicht. De greep staat daarom ver naar voren en opzij.
3. **Geen UV-kaart.** De verf staat nu op de punten van de mesh. De specificatie vraagt UV-maps en een budget van 15.000 tot 40.000
   driehoeken; het model heeft er nu ruim een miljoen. Voor de sprites maakt dat niet uit, voor de GLB wel: dat vraagt een stap met
   versimpelen en bakken.
4. **Vroeg afgewezen aanpak.** Een "soldaatje uit code" wees Marcel op 27 okt af. Dat waren worsten als armen met een geplakte
   plaat; dit is gesculpt met vloeiende vormen. Toch beslist alleen zijn oordeel over het beeld.
5. **Lijnen op spelmaat.** De donkere lijnen tussen de lagen zijn nabewerking (`vel.py`). Ze moeten ook in beweging rustig blijven; dat
   is nog niet getest.
