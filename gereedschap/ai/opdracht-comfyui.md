# Opdracht: ComfyUI-workflow voor Aardschok

Van Marcel, 18 okt 2026 (werklijst vraag 180, fase 1), letterlijk. Wat ervan gebouwd is en hoe, staat in
`ontwerp/gereedschap.md` bij `beeld-ai.cjs`.

Bouw een reproduceerbare ComfyUI image-to-image-workflow voor het omzetten van ruwe isometrische 3D-renders naar
hoogwaardige middeleeuwse HD-pixelart.

## Hardware

- NVIDIA GTX 1080 Ti, 11 GB VRAM
- 24 GB systeem-RAM
- Bestaande, werkende ComfyUI-installatie
- Behoud de huidige compatibele PyTorch/CUDA-omgeving.

## Benodigde modellen

Gebruik in de eerste test:

- Een SD 1.5-checkpoint dat geschikt is voor gedetailleerde pixelart.
- ControlNet SD 1.5 SoftEdge of Lineart.
- IP-Adapter Plus SD 1.5.
- Bijbehorende CLIP Vision ViT-H-encoder.
- Een compatibele VAE.

Controleer eerst de onderlinge compatibiliteit en gebruik bij voorkeur bewezen workflows.

## Node-workflow

1. Load Checkpoint
2. Load Image: ruwe 3D-render
3. Resize/pad naar testresolutie met behoud van beeldverhouding
4. VAE Encode
5. Load Image: goedgekeurde Aardschok-stijlreferentie
6. IP-Adapter Plus voor stijlconditionering
7. SoftEdge/Lineart-preprocessor voor de ruwe render
8. Load ControlNet
9. Apply ControlNet
10. CLIP Text Encode: positieve en negatieve prompt
11. KSampler
12. VAE Decode
13. Save Image

Verbind de nodes correct volgens de gebruikte versies. De bovenstaande lijst beschrijft de componenten, niet hun exacte
uitvoeringsvolgorde.

## Startinstellingen

- Steps: 30
- CFG: 6.5
- Sampler: DPM++ 2M
- Scheduler: Karras
- Denoise: 0.40
- ControlNet strength: 0.85
- ControlNet start/end: 0.0 / 1.0
- IP-Adapter weight: 0.65
- Seed: vast
- Resolutie: 768 × 576 voor de eerste test

Maak een testmatrix met denoise 0.30, 0.40 en 0.50 en ControlNet strength 0.75 en 1.00.

## Visuele vereisten

De AI moet:

- De oorspronkelijke isometrische camerahoek behouden.
- De exacte positie en pose van het dier respecteren.
- De geometrie van de wagen zo goed mogelijk behouden.
- Gedetailleerde HD-pixelart produceren.
- Consistente donkere contouren, rijke texturen en warme belichting gebruiken.
- De rode wagen, gouden afwerking en gouden leeuwen behouden.
- De achtergrond uiteindelijk exact #FF00FF maken.
- Geen grond, schaduw of extra objecten toevoegen.

Gebruik voor de achtergrond een deterministische maskering/compositingstap. Vertrouw niet op de prompt om de exacte
achtergrondkleur te garanderen.

## Kwaliteitscontrole

Bewaar:

- Originele render
- Gegenereerde sprite
- Gebruikte seed
- Alle generatieparameters
- Workflow JSON
- Generatietijd
- Vergelijkingsafbeelding

Controleer automatisch de canvasafmetingen, achtergrondkleur en afwijking van het oorspronkelijke silhouet.

Belangrijk: optimaliseer niet uitsluitend voor een mooie losse afbeelding. De uiteindelijke pipeline moet geschikt zijn
voor meerdere animatieframes met identieke objectconstructie en visuele stijl.

Lever een werkende, importeerbare ComfyUI-workflow in JSON-formaat op. Meld ontbrekende modellen, incompatibele nodes en
hardwareproblemen expliciet. Test eerst één afbeelding voordat batchverwerking wordt toegevoegd.
