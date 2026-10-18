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

# Vierde opdracht: HD-pixelartkwaliteit, geometrie en resolutie

Van Marcel, 18 okt 2026, letterlijk (na de proef met het wagenwiel, `wielproef-evaluatie.md`); de koppen een niveau lager.
Het antwoord: `hd-wielproef.md`.

## Doel

We hebben inmiddels aangetoond dat onze eigen JavaScript-raymarchingrenderer AI-texturen kan toepassen op objecten en dat deze texturen tijdens rotaties en vanuit verschillende kijkrichtingen aan de geometrie gekoppeld blijven.

Dit is een belangrijke technische stap, maar de visuele kwaliteitsverbetering is nog onvoldoende.

**Ons uiteindelijke doel is de hoogwaardige HD-pixelartkwaliteit van de goedgekeurde ChatGPT-sprites reproduceren, volledig consistent over alle kijkrichtingen en animatieframes.**

We gaan nu onderzoeken waar de belangrijkste kwaliteitsbeperking zit:

1. De kwaliteit van de gebruikte materialen en texturen.
2. De detaillering van de procedurele 3D-geometrie.
3. De interne renderresolutie.
4. De pixelartverwerking, belichting en sampling.

Voer dit experiment uit met het bestaande wagenwiel. Verander de productieversie van de renderer niet.

## Experiment 1 — Drie kwaliteitsniveaus

Maak drie afzonderlijke varianten van exact hetzelfde wagenwiel.

### Variant A — Origineel

Gebruik de bestaande procedurele geometrie, kleuren en materialen.

Dit is onze referentie waarmee we alle verbeteringen vergelijken.

### Variant B — Hoogwaardige AI-materialen

Behoud exact dezelfde geometrie als variant A.

Verbeter uitsluitend de materiaalafwerking:

- Zichtbare, natuurlijke houtnerven.
- Subtiele slijtage en beschadigingen.
- Warme highlights op houten oppervlakken.
- Donkere naden en materiaalschaduwen.
- Realistische ijzerstructuur.
- Metaalreflecties en klinknagelaccenten waar de bestaande geometrie die ondersteunt.
- Rijkere kleurvariatie zonder visuele ruis.

Gebruik bij voorkeur AI-gegenereerde texturen via ComfyUI, toegepast met de bestaande stabiele rusthoudingcoördinaten.

De texturen moeten tijdens rotaties en vanuit alle kijkrichtingen aan het oppervlak gekoppeld blijven.

### Variant C — Verbeterde geometrie + hoogwaardige materialen

Gebruik dezelfde materiaaltechniek als variant B, maar verbeter daarnaast de geometrie.

Concentreer je op:

- Diepere en overtuigender gevormde houten spaken.
- Een duidelijk gelaagde wielnaaf.
- Een stevigere ijzeren wielband.
- Kleine metalen bevestigingen en klinknagels.
- Meer diepte in de verbindingen.
- Subtiele afschuiningen aan houten randen.
- Sterkere licht-schaduwovergangen.
- Overtuigende materiaalscheiding.

**Belangrijk:** behoud de oorspronkelijke buitendiameter, dikte, positie, rotatieas en wereldschaal. Kleine interne geometrische verbeteringen zijn toegestaan, maar het wiel moet zonder aanpassingen in de bestaande wagen passen.

## Experiment 2 — Interne renderresolutie

Render alle drie de varianten op:

- 1× huidige interne resolutie.
- 2× huidige interne resolutie.
- 4× huidige interne resolutie.

Gebruik voor alle resoluties:

- Identieke geometrie per variant.
- Identieke materialen.
- Identieke camerahoek.
- Identieke belichting.
- Identieke wereldschaal.
- Identieke rotatiestand.

Verhoog daadwerkelijk de interne rasterresolutie. Vergroot niet simpelweg een reeds gerenderde afbeelding.

### Verplichte vergelijking

Toon iedere variant op twee manieren:

**A. Native pixelweergave**

Toon de volledige render op zijn eigen interne resolutie, zodat de hoeveelheid beschikbare details duidelijk zichtbaar is.

**B. Werkelijke spelgrootte**

Toon alle resoluties op exact dezelfde fysieke weergavegrootte in het spel.

Gebruik hiervoor een expliciet vastgelegde downsampling- of displaymethode.

We willen vaststellen:

- Hoeveel extra details daadwerkelijk zichtbaar blijven.
- Of houtnerven, klinknagels en metaalreflecties beter leesbaar worden.
- Of de pixelart scherper of juist te fijn en rommelig wordt.
- Of hogere resoluties ongewenste aliasing veroorzaken.
- Of 2× of 4× een aantoonbare visuele verbetering oplevert.
- Wat de gevolgen zijn voor rendertijd, spritegeheugen en uiteindelijke atlasgrootte.

Vergelijk ook nearest-neighbor en een geschikte gefilterde downsamplingmethode. Vermijd dat een slechte schaalmethode de resultaten vertekent.

## Experiment 3 — Animatieconsistentie

Render voor iedere variant:

**Acht kijkrichtingen**

N, NO, O, ZO, Z, ZW, W en NW.

**Wielrotatie**

Minimaal acht opeenvolgende rotatiestanden, plus een volledige omwenteling.

Controleer:

1. Of houtnerven met de spaken meedraaien.
2. Of metalen details op hun oorspronkelijke positie blijven.
3. Of de texturen niet over oppervlakken schuiven.
4. Of zichtbare naden ontstaan.
5. Of er temporele flikkering of aliasing optreedt.
6. Of het wiel na een volledige omwenteling exact overeenkomt met het beginbeeld.

Gebruik waar mogelijk geautomatiseerde controles en lever daarnaast een geanimeerde preview op.

Let op: vaste textuurcoördinaten garanderen niet automatisch flikkervrije pixelweergave. Sampling, belichting en rasterisatie kunnen nog steeds temporele artefacten veroorzaken.

## Experiment 4 — Beoordeling op artistieke kwaliteit

Vergelijk de resultaten met de goedgekeurde ChatGPT-sprites van de os en wagen.

Beoordeel:

| Criterium | Wat we willen bereiken |
|---|---|
| Materiaalrijkdom | Overtuigende hout- en metaalstructuren |
| Diepte | Duidelijke driedimensionale vorm |
| Licht | Warme highlights en sterke schaduwen |
| Pixelartstijl | Fijne, verzorgde HD-pixelart |
| Leesbaarheid | Details blijven zichtbaar op spelgrootte |
| Consistentie | Identieke constructie tussen frames |
| Geometrie | Oorspronkelijke buitenafmetingen behouden |
| Prestaties | Geschikt voor grootschalige spriteproductie |

Gebruik zowel visuele beoordeling als meetbare technische criteria. Beschouw meer hoogfrequente pixelverschillen niet automatisch als hogere artistieke kwaliteit.

## Technische randvoorwaarden

Onze hardware:

- NVIDIA GTX 1080 Ti met 11 GB VRAM.
- 24 GB systeem-RAM.
- Bestaande Pascal-compatibele ComfyUI-installatie.

Onze renderer:

- Eigen JavaScript-raymarchingrenderer in Node.js.
- Procedurele geometrie via afstandsfuncties.
- Materialen gekoppeld aan object- en rusthoudingcoördinaten.
- Bestaande ondersteuning voor meerdere kijkrichtingen en animatiestanden.

Vereisten:

- Behoud de huidige werkende renderer.
- Maak alle uitbreidingen optioneel.
- Gebruik geen speciale oplossingen die uitsluitend voor dit wiel werken.
- Ontwerp verbeteringen als herbruikbare materiaal- en geometriesystemen.
- Controleer dat de oude renderuitvoer pixel voor pixel identiek blijft wanneer de nieuwe functies uitgeschakeld zijn.
- Documenteer de technische gevolgen voor toekomstige gebouwen, dieren, personages en voertuigen.

## Gewenste oplevering

Lever op:

1. Een vergelijkingssheet met A, B en C op 1×, 2× en 4× resolutie.
2. Een tweede vergelijkingssheet waarop alle resultaten dezelfde fysieke spelgrootte hebben.
3. Een overzicht van acht kijkrichtingen.
4. Een animatiepreview van het draaiende wiel.
5. Een overzicht van rendertijden, geheugenverbruik en eventuele artefacten.
6. Een technische evaluatie van de kwaliteitswinst.
7. Een concreet advies over de beste combinatie van geometrie, materialen en resolutie.

## Belangrijkste beslisvraag

**Kunnen we met onze eigen renderer, verbeterde geometrie en hoogwaardige AI-texturen daadwerkelijk de visuele kwaliteit van de goedgekeurde ChatGPT-sprites benaderen, zonder de consistentie tussen animatieframes te verliezen?**

Als de resultaten onvoldoende zijn, benoem dan precies welke beperkingen overblijven en welke technische aanpak daarvoor nodig is.

We willen geen cosmetische verbetering van enkele procenten. We zoeken een duidelijke, zichtbare kwaliteitsstap richting professionele HD-pixelart.

Voer het experiment gecontroleerd uit, zodat we achteraf kunnen vaststellen welke wijziging verantwoordelijk is voor iedere verbetering.

# Vijfde opdracht: 2×, 4×, 8× en 16×

Van Marcel, 18 okt 2026, letterlijk (na `hd-wielproef.md`). Het antwoord: `hd-resolutie.md`.

Voer nog één resolutie-experiment uit met ons beste wagenwiel: variant C met verbeterde geometrie en hoogwaardige materialen.
Render hetzelfde wiel op 2×, 4×, 8× en 16× interne resolutie.
Gebruik exact dezelfde geometrie, texturen, materialen, belichting en camerahoek.
Toon alle vier de resultaten:

1. Op hun oorspronkelijke interne resolutie.
2. Op exact dezelfde fysieke grootte bij 1920 × 1080.
3. Met verschillende geschikte downsamplingfilters.
4. Met een vergelijking van detailbehoud, scherpte, aliasing en visuele kwaliteit.

Meet ook de rendertijd en het geheugenverbruik.
Belangrijk: verhoog daadwerkelijk de interne renderresolutie. Vergroot geen bestaande rasterafbeelding.
Onderzoek of 8× of 16× nog zichtbaar betere pixelart oplevert dan 4×.
Geef een aanbeveling voor de optimale productieresolutie, rekening houdend met visuele kwaliteit, atlasgrootte en de hoeveelheid sprites die Aardschok uiteindelijk nodig heeft.

# Zesde opdracht: van 3D-render naar handgemaakte pixel art

Van Marcel, 18 okt 2026, letterlijk (na `hd-resolutie.md`). Het antwoord: `hd-stijl.md`.

Aardschok — Van 3D-render naar hoogwaardige handgemaakte pixelart
Claude, we hebben de resolutieproef afgerond.
De productiestandaard wordt voorlopig:

* 4× interne renderresolutie.
* 2× uiteindelijke HD-sprite.
* Box of Lanczos als downsamplingmethode, afhankelijk van het bewegingsresultaat.

We gaan nu niet verder met resolutieonderzoek.
Doel
Het bestaande verbeterde wagenwiel (variant C) moet visueel dichter bij onze goedgekeurde ChatGPT-referentie komen.
De huidige versie is technisch goed, maar heeft nog te veel de uitstraling van een nette 3D-render.
We zoeken de rijke, handgemaakte HD-pixelartstijl van onze referentie.
Opdracht 1 — Analyseer de referentie
Gebruik het originele ChatGPT-wiel als artistieke referentie.
Vergelijk beide wielen op dezelfde zichtbare objectgrootte en vergelijkbare oriëntatie.
Onderzoek:

* Kleurverdeling per materiaal.
* Verhouding tussen lichte, middellichte en donkere pixels.
* Contrast binnen de houten spaken.
* Metaalafwerking en reflecties.
* Verdeling en grootte van pixelclusters.
* Randdiktes en interne contouren.
* Materiaalvariatie.
* Lichtinval en contactschaduwen.

Leg vast welke verschillen daadwerkelijk zichtbaar zijn en welke alleen ontstaan door schaal, camerahoek of geometrie.
Opdracht 2 — Bouw een artistieke stylization pass
Ontwikkel een optionele, herbruikbare artistieke afwerkingsfase.
Deze moet ondersteunen:

1. Materiaalafhankelijke kleurreeksen.
2. Warme highlights en koelere schaduwen.
3. Versterkte contactschaduwen.
4. Directionele houtnerven.
5. Onregelmatige, maar stabiele materiaalvariatie.
6. Pixelclusters met gecontroleerde grootte en vorm.
7. Selectieve randaccenten en interne contouren.
8. Subtiele slijtage op uitstekende randen.

Gebruik waar mogelijk bestaande materiaal-ID's, diepte, normalen en objectcoördinaten.
Vermijd willekeurige ruis per frame.
Alle details moeten consistent blijven bij rotatie en animatie.
Opdracht 3 — Maak vier artistieke varianten
Gebruik exact dezelfde geometrie en camera.
A — Huidige variant C
Onze bestaande kwaliteitsreferentie.
B — Artistieke kleuren en belichting
Pas uitsluitend kleurreeksen, contrast, schaduwen en highlights aan.
C — Materiaalgerichte pixelart
Voeg aan B de gerichte houtnerven, metaalaccenten en stabiele pixelclusters toe.
D — Volledige stijlbenadering
Combineer alle verbeteringen en optimaliseer de afwerking op basis van de goedgekeurde ChatGPT-referentie.
Opdracht 4 — Controleer consistentie
Render iedere variant vanuit acht richtingen en met acht rotatiestanden.
Controleer op:

* Flikkerende details.
* Verschuivende houtnerven.
* Veranderende highlightpatronen.
* Ongewenste contourverschillen.
* Verlies van detail op spelgrootte.

Let op dat lichtafhankelijke highlights wel mogen veranderen wanneer de oriëntatie ten opzichte van de lichtbron verandert.
Opdracht 5 — Vergelijk de resultaten
Maak één vergelijkingsplaat met:

* De originele ChatGPT-referentie.
* Variant A.
* Variant B.
* Variant C.
* Variant D.

Toon alles op dezelfde zichtbare grootte, zonder vervorming.
Maak daarnaast een vergelijking op daadwerkelijke spelgrootte bij 1920 × 1080.
Beoordeel niet alleen technische scherpte, maar vooral artistieke overeenkomst.
Randvoorwaarden

* Behoud de bestaande geometrie.
* Behoud de huidige textuurmapping.
* Behoud de bestaande animaties.
* Verander de wereldschaal niet.
* Houd de nieuwe afwerking optioneel.
* Zorg dat het systeem herbruikbaar is voor alle objecten in Aardschok.
* Verander de bestaande productieversie niet.

Eindvraag
Welke combinatie van materiaalbehandeling, belichting, kleurreeksen en pixelartafwerking brengt ons zichtbaar het dichtst bij de goedgekeurde ChatGPT-stijl?
Geef een onderbouwd advies en laat de resultaten zien.
Het doel is niet de hoogste technische scherpte, maar de beste artistieke overeenkomst bij de werkelijke spelgrootte.

# Zevende opdracht: een AI-afwerking op onze sprites

Van Marcel, 18 okt 2026, letterlijk (na `hd-stijl.md`; "Graag eerst fase 1 tm 3 uitvoeren"). Het antwoord:
`ai-afwerking.md`.

Aardschok — Experiment AI Style Transfer Pipeline

Je hebt inmiddels een procedurele renderer gebouwd die reproduceerbare sprites genereert. De geometrie, kleuren, materialen en belichting worden grotendeels door code bepaald.

De resultaten zijn technisch consistent, maar bereiken nog niet de artistieke kwaliteit van de ChatGPT-referentie.

We gaan onderzoeken of een AI-afwerkingsstap dit verschil kan verkleinen.

1. Doelstelling

Bouw een experimentele pipeline waarin:

- Onze bestaande renderer verantwoordelijk blijft voor geometrie, perspectief en afmetingen.
- Een generatief beeldmodel verantwoordelijk wordt voor de artistieke afwerking.
- De ChatGPT-referentie dient als visueel stijlvoorbeeld.
- De uiteindelijke sprite zijn oorspronkelijke afmetingen, positie en silhouet behoudt.
- Het resultaat reproduceerbaar en geschikt voor batchverwerking is.

We willen uiteindelijk honderden Aardschok-sprites op dezelfde manier kunnen produceren.

2. Gebruik de bestaande infrastructuur

We beschikken al over:

- ComfyUI op "127.0.0.1:8188".
- SDXL Base 1.0.
- Een bestaande texture-AI-integratie.
- Een procedurele renderer.
- Het oorspronkelijke ChatGPT-wiel als referentie.
- Wielvariant D als beste huidige benadering.

Behoud deze infrastructuur.

Onderzoek welke aanvullende modellen, nodes en workflows nodig zijn.

3. Bouw twee experimentele routes

Route A: SDXL + ControlNet

Gebruik onze huidige SDXL-installatie.

Onderzoek en implementeer:

- Image-to-image.
- ControlNet Canny of Lineart voor vormbehoud.
- Een geschikte referentie-adapter, bijvoorbeeld IP-Adapter, voor stijlsturing.
- Instelbare denoise strength.
- Vaste seeds.
- Transparantieherstel met het oorspronkelijke silhouetmasker.

De referentie moet de stijl sturen. De bestaande render moet de geometrie bepalen.

Route B: FLUX Kontext

Onderzoek of een geschikte FLUX Kontext-variant lokaal kan draaien.

Gebruik de ChatGPT-referentie om de bestaande wielrender artistiek te bewerken.

Controleer eerst:

- Hardwarevereisten en beschikbaar VRAM.
- Modelcompatibiliteit met onze ComfyUI-versie.
- Ondersteuning voor referentiebeelden.
- Geheugengebruik en rendertijd.
- Licentievoorwaarden voor commercieel gebruik.

Installeer geen grote modellen voordat je de benodigde middelen en verwachte voordelen hebt gerapporteerd.

4. Maak render passes

Breid de procedurele renderer waar praktisch mogelijk uit met:

1. Een exact silhouet-/alfamasker.
2. Een materiaal-ID-masker voor hout en ijzer.
3. Een basisrender zonder procedurele textuurdetails.
4. Een belichtings- of schaduwlaag, indien beschikbaar.

Deze moeten exact dezelfde canvasafmetingen en coördinaten gebruiken.

Gebruik de maskers om AI-wijzigingen buiten de oorspronkelijke geometrie te beperken.

5. Eerste test: uitsluitend wiel D

Maak drie resultaten:

A. De huidige procedurele wielrender.

B. SDXL met AI-afwerking.

C. FLUX Kontext met AI-afwerking, indien technisch haalbaar.

Vergelijk ze allemaal met het oorspronkelijke ChatGPT-wiel.

Gebruik identieke canvasafmetingen en dezelfde zichtbare schaal. Lijn de beelden eerst uit voordat je verschillen meet.

Maak daarnaast een vergelijking op de werkelijke spelresolutie.

6. Kwaliteitscontrole

Meet en rapporteer:

- Silhouetovereenkomst.
- Afwijkingen in afmetingen en positie.
- Behoud van het aantal spaken.
- Materiaalherkenbaarheid.
- Kleurverschillen.
- Overeenkomst in contrast en schaduwen.
- Detailbehoud na terugschalen.
- Rendertijd per sprite.
- Reproduceerbaarheid bij identieke instellingen.

Gebruik objectieve metingen waar mogelijk, maar presenteer pixelverschillen niet als volledige maatstaf voor artistieke kwaliteit.

Maak een vergelijkingsvel met de referentie en alle varianten.

7. Belangrijke randvoorwaarden

- Verander de bestaande renderer niet destructief.
- Maak de AI-afwerking optioneel.
- Behoud de oorspronkelijke sprites en bronbestanden.
- Sla prompts, seeds, modelversies en instellingen op.
- Houd rekening met de commerciële toepassing van Aardschok.
- Voorkom dat de AI onderdelen toevoegt, verwijdert of vervormt.
- Gebruik geen automatische goedkeuring uitsluitend op basis van een AI-score.

8. Rapportage

Werk gefaseerd.

Fase 1: Onderzoek de bestaande code, ComfyUI-installatie, hardware en beschikbare modellen. Presenteer een technisch implementatieplan.

Fase 2: Implementeer uitsluitend Route A als eerste proof-of-concept.

Fase 3: Genereer een vergelijkingsvel en meet de resultaten.

Fase 4: Adviseer of Route B nog zinvol is.

Fase 5: Ontwerp pas na een succesvolle proef een schaalbare batchpipeline.

Begin nu met fase 1. Geef aan welke bestanden je hebt onderzocht, wat je daadwerkelijk hebt vastgesteld en welke onderdelen nog geïnstalleerd moeten worden.

Belangrijkste succescriterium: het resultaat moet zichtbaar dichter bij de ChatGPT-referentie komen, zonder de bruikbaarheid en geometrische consistentie van onze huidige sprites te verliezen.
