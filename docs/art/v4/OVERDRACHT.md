# Overdracht: vormproef V4 van de speerman

Stand van 31 okt 2026. **Dit wacht op Marcels beoordeling; er is geen artistieke goedkeuring.** Geen D8 gedraaid, productie en spel niet veranderd, niets gecommit of gepusht.

## Lees in deze volgorde

De rapporten staan in `docs/art/v4/`, de platen in `docs/art/bewijs/v4/`.

1. `V4-KWALITEITSRAPPORT.md`: de acceptatiecriteria, de cijfers en wat niet gehaald is.
2. `A-vorm-zuid.png`: referentie, V3 en V4 naast elkaar, in neutrale klei.
3. `V4-ANALYSE.md`: de vijf grootste afwijkingen, de pose, de opmerkingen van Marcel.
4. `V4-PROPORTIES.md`, `V4-ANIMATIECONTROLE.md`, `V4-CLIPPING.md`: de metingen.

Voor de achtergrond: `docs/art/overdracht-methodeproef.md` (hoe de pijplijn werkt), `docs/art/methodeproef.md`, `docs/art/vormproef.md` (V3), en `CLAUDE.md`.

## De platen

| Vergelijking | Bestand |
|---|---|
| A, vorm | `A-vorm-zuid.png`, `A-vorm-zij-rug.png` |
| B, silhouet | `B-silhouet.png` |
| C, acht richtingen | `C-acht-richtingen.png` |
| D, spelmaat | `D-80px.png`, `D-acht-80px.png` |
| E, animatie | `E-lopen-V3-V4.mp4`, `E-staan-V3-V4.mp4`, `E-loop-klei.png`, `E-loop-rok.png`, `E-staan-naar-lopen.png`, `E-TEST-steek.png`, `E-TEST-val.png` |
| F, in het spel | `F-in-het-spel.png`, `F-in-het-spel-zoom1.png` |
| Helm, tabberd | `helm-controle.png`, `tabberd-A-boven-B-onder.png` |

## Wat er staat

| Wat | Waar |
|---|---|
| De geometrie van V4 | `gereedschap/blender/stijl/proef/vorm4.py`, bovenop `vorm3.py` en `figuur.py` |
| De nieuwe rustpose, de testhoudingen, de hulpbotten van rok-variant B | `gereedschap/blender/stijl/proef/pose4.py` |
| De tabberd (gekozen: variant A) | `vorm4.py`: `veld_tabberd`, `gewichten_tabberd` |
| De bewijzen | `docs/art/bewijs/v4/` |
| Het model, de renders en de vellen (niet in git) | `gereedschap/pixelart/uit/stijl/vormproef4/eind/` |

## De opdrachten

Vanuit de hoofdmap, in Git Bash. Blender 5.2.3 en de Python van ComfyUI staan vast in de ketens (`PY`, `BL`).

```bash
bash gereedschap/blender/stijl/proef/keten_vorm.sh
```
V3, als die nog niet bestaat: de platen vergelijken ermee (15 min).

```bash
bash gereedschap/blender/stijl/proef/keten_v4_rok.sh
```
De twee tabberdvarianten, in `uit/stijl/vormproef4/a` en `b` (zo'n 8 min).

```bash
bash gereedschap/blender/stijl/proef/keten_v4.sh
```
V4 helemaal: bouwen, controleren, klei, verf, vellen, doorsteek, animatie, platen (18 min). De keten is na elke wijziging helemaal opnieuw gedraaid; de laatste run staat hier gerapporteerd.

Los bouwen, een halve minuut:

```bash
"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P gereedschap/blender/stijl/proef/vorm4.py -- gereedschap/pixelart/uit/stijl/vormproef4/eind/speerman-v4.blend rok=A
```

## Gewijzigde bestanden

**Nieuw, nog niet in git:** in `gereedschap/blender/stijl/proef/`: `vorm4.py`, `pose4.py`, `render4.py`, `controle4.py`, `anim4.py`, `doorsteek4.py`, `inventaris.py`, `platen4.py`, `keten_v4.sh`, `keten_v4_rok.sh`. En `docs/art/v4/` en `docs/art/bewijs/v4/`.

**Bijgewerkt, nog niet in git:** `docs/art/overdracht-methodeproef.md`, `docs/art/vormproef.md`, `ontwerp/beeld.md`, `ontwerp/gereedschap.md`, `.claude/skills/modelleren/SKILL.md`.

**Niet veranderd, byte voor byte nagekeken tegen de back-up:** `figuur.py`, `vorm.py`, `skelet.py`, `beweging.py`, `materialen.py`, `render.py`, `vel.py`, `controle_model.py`, `bron/speerman.blend`. Geen wijzigingen in `beelden/`, `tegels/` of `js/`.

## Wat niet in de lichte zip zit

| Wat | Waar | Opnieuw maken |
|---|---|---|
| `speerman-v4.blend` en de renders | `uit/stijl/vormproef4/eind/` (351 MB) | `keten_v4.sh` |
| `speerman-v3.blend` en zijn renders | `uit/stijl/vormproef/` | `keten_vorm.sh` |
| `bron/speerman.blend` | `uit/stijl/bron/` | `npm run stijl -- bouw` |
| De bewijzen van de methodeproef | `docs/art/bewijs/methoden/` | Grote zip van 31 okt, of `keten_licht.sh` |

## Hoe de zip getest is

Uitgepakt in een lege map: alle bestanden kloppen met `INHOUD.txt`. Vanuit die map is `vorm4.py` gebouwd en de rust gerenderd in Z en W: hooguit 1 op 255 verschil met de eindrender, en de ketens zijn syntactisch in orde. **Niet getest:** een andere pc, en de hele keten vanuit de zip (de vergelijkingen hebben ook V3 nodig, die er niet in zit).

## Git: lees dit voor je commit

Marcel: "commit of push niets zonder mijn toestemming". Alles van de stijl staat nog buiten git, en `main` loopt 38 commits achter op `origin/main`. Meer over commits met een eigen index: `../overdracht-methodeproef.md`, kop 7.
