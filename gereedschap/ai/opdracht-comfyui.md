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

# Vervolg: een aparte SDXL-werkstroom

Van Marcel, 18 okt 2026, letterlijk (na de proef met SD 1.5).

Onze huidige SD 1.5-resultaten zijn veelbelovend, maar missen het detailniveau van de gewenste Aardschok-sprites.
Maak een aparte SDXL-workflow. Behoud de huidige SD 1.5-workflow volledig.

Hardware:

- GTX 1080 Ti, 11 GB VRAM
- 24 GB systeem-RAM

Doel: hoogwaardige, zeer gedetailleerde isometrische HD-pixelart met rijke houtstructuren, realistische
dierenanatomie, leren harnassen, metaalreflecties en sterke licht-schaduwcontrasten.

Gebruik:

- Een kwalitatief SDXL-checkpoint
- SDXL-compatibele ControlNet
- Img2img met 1024 × 768 als eerste testresolutie
- 30–35 steps
- CFG 5–6
- Denoise 0.40–0.55
- Vaste seed

Gebruik onze goedgekeurde os-en-wagen-sprite als stijlreferentie met een SDXL-compatibele referentiemethode.
Controleer alle modellen en nodes op compatibiliteit met de GTX 1080 Ti.
Maak eerst één resultaat en vergelijk dat rechtstreeks met de bestaande SD 1.5-output. Beoordeel zowel de hoeveelheid
detail als het behoud van de oorspronkelijke geometrie.

# Derde opdracht: een proof of concept met één wagenwiel

Van Marcel, 18 okt 2026, letterlijk (na het rapport `hybride-voorstel.md`).

Ik ga akkoord met de richting van je hybride AI-textuurpipeline. We gaan voorlopig niet verder met het optimaliseren van
volledige SDXL-animatieframes. Ik wil echter eerst een kleine technische proof of concept voordat we de volledige os en
wagen aanpakken. Gebruik één bestaand wagenwiel als testcase.

Doel: bewijzen dat we hoogwaardige, AI-gegenereerde materiaaltexturen kunnen toepassen in onze eigen
raymarchingrenderer, waarbij de textuur volledig consistent blijft over alle kijkrichtingen en rotatiestanden.

Eisen:

1. Behoud de bestaande renderer volledig. Voeg de RGB-textuurondersteuning optioneel toe.
2. Gebruik de bestaande rusthoudingcoördinaten voor stabiele textuurmapping.
3. Maak een hoogwaardige houttextuur en een afzonderlijke metaaltextuur.
4. Render het wiel in acht kijkrichtingen en meerdere rotatiestanden.
5. Controleer of materiaalpatronen correct aan het oppervlak vast blijven zitten.
6. Test op de daadwerkelijke spritegrootte in het spel.
7. Controleer op flikkering, vervorming, naden en aliasing.
8. Vergelijk de resultaten met de bestaande procedurele materialen.
9. Zorg dat de oude renderer pixel voor pixel identieke resultaten blijft geven wanneer AI-texturen uitgeschakeld zijn.

Gebruik voorlopig geen automatische terugprojectie vanuit meerdere AI-meesterbeelden. Dat onderzoeken we nadat de
basistechniek bewezen werkt. Lever een visuele vergelijking en technische evaluatie op.

Belangrijk: bouw dit als herbruikbaar materiaalsysteem, niet als een speciale oplossing die uitsluitend voor dit
wagenwiel werkt.
