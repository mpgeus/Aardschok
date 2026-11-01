# De kwaliteitsronde van de speerman

30 okt 2026, vraag 192. **De speerman staat duidelijk dichter bij de plaat, maar is er nog niet.** De beelden beslissen; ze staan in
`bewijs/kwaliteit/`. Begin bij `ab-acht-richtingen.png` en `ab-details.png`.

De backup van vóór deze ronde staat in `gereedschap/pixelart/uit/stijl/backup-v1/` (model, code, instellingen, renders en vellen).

## De uitkomst in het kort

| Op dezelfde hoogte gemeten | Plaat | Voor | Na |
|---|---|---|---|
| Verzadiging blauw (330 px, chroma) | 60,4 | 40,2 | **57,7** |
| Verzadiging geel | 78,2 | 63,8 | **71,6** |
| Verzadiging bruin | 39,4 | 31,6 | **33,9** |
| Verzadiging blauw op 80 pixels | 58,7 | 39,1 | **57,0** |
| Helderste 5% van het staal (L\*) | 82,7 | 87,8 | **79,9** |
| Klein contrast blauw | 3,84 | 2,51 | **2,92** |
| Klein contrast bruin | 5,52 | 4,31 | **4,79** |

De metingen laten zien wat er is veranderd, maar niet of het mooi is. Bruin en het kleine contrast blijven duidelijk achter op de plaat.

## De oorzaak: waarom de render minder rijk oogt

Voor ik iets veranderde, heb ik gemeten (`oorzaak.py`, `licht_proef.py`). Mijn eerste vermoeden, te weinig schaduw, klopte niet: het lichtbereik
was bijna gelijk aan de plaat (L\* 11 tot 72 tegen 13 tot 76).

| Probleem | Hoe het was | Oorzaak | Bewijs | Oplossing | Effect |
|---|---|---|---|---|---|
| Kleuren flets | Basiskleuren uit de spec, warme zon, witte spiegeling op alles | De kleuren waren te licht en te weinig verzadigd; witte spiegeling legt een waas over de stof | Zonder spiegeling blauw 40→44, geel 64→68, bruin 32→37; witte zon blauw 40→47 maar bruin 32→30 | Kleuren teruggerekend naar de plaat; spiegeling per materiaal, stof bijna nul | Blauw 40→58, geel 64→72, gemeten |
| Helm te glanzend | Staal met een sterk glanslicht (6 W) | Het glanslicht, niet de verf | Zonder glanslicht L95 88→72 | Glanslicht 3,2 W en breder; staal ruwer (0,34→0,44), hamerslag in de vorm | L95 88→80, helm leest nog als staal |
| Stof vlak | Effen kleur op een gladde vorm | Plooien, randen en stiksels ontbraken in de mesh | Klein contrast op stof 20 tot 35% onder de plaat | Plooien, bloes bij de riem, verdikte zoom in de vorm; licht in de verf | Blauw 2,51→2,92, nog onder de plaat (3,84) |
| Weinig kledinggevoel | De mouw prikte door de tabberd en de broek was goed zichtbaar | Armsgat te ver naar buiten, zoom te hoog, omslag te laag | Close-ups: doorsteek, slierten, band broek | Armsgat naar binnen, mouw zakt onder de stof, zoom lager, omslag hoger | Op het oog duidelijk beter |
| Gezicht te oud en te realistisch | Veel oogwit, diepe kassen | Te veel fijne anatomie voor deze stijl | Close-up tegen de plaat | Eenvoudige donkere ogen, zware wenkbrauw, rondere neus, volle baard | Op het oog beter; wel kleiner dan op de plaat |
| Leer dof | Ruwheid 0,65 tot 0,85 volgens de spec | De plaat heeft duidelijk meer glans op het leer dan de spec zegt | Plaat tegen render | Ruwheid 0,45 tot 0,5, spiegeling per soort leer | Leer leest als leer; geen plastic |

### De acht vragen

1. **Materialen.** Voor de ronde: één Principled BSDF voor alle delen, met de verf per punt uit een recept (kleur, vlekken, korrel, holten en randen).
   Geen enkele textuur. Nu: dezelfde shader, met lagen in de verf en de spiegeling per materiaal.
2. **Textuurkwaliteit.** Voor de ronde: geen UV-kaart, geen normal map, geen ruwheidstextuur; de fijnheid is die van de mesh, 2,6 tot 5,2 mm per punt.
   De contactschaduw komt live uit de shader. De GLB heeft wel UV en texturen (2048). Er ontbreekt dus een echt geschilderde laag; proef B laat zien wat de textuur alleen oplevert.
3. **Geometrie.** Dit kon geen materiaal oplossen: plooien en bloes bij de riem, verdikte zoom, lage en hoge kraag, volume in de mouwen, hol in de omslag, hak en zool, neusnaad op de laars, knokkels, klep en riempje op de buidel, facetten op het speerblad. Die zitten er nu in.
4. **Belichting.** De glanzende helm komt door het glanslicht (zie boven). De vlakke stof komt vooral door de vorm: de zon meer van opzij gaf wel diepte, maar kostte kleur
   (blauw 54→46) en maakte het gezicht modderig, dus dat heb ik **teruggedraaid**. Dieptegevoel komt nu uit de vorm, de contactschaduw en het geschilderde licht.
5. **Renderpipeline.** Op 80 pixels gaat niet het contrast verloren maar het detail onder een pixel (1,5 cm): stiksels verdwijnen, de ruiten blijven als patroon. Het klein contrast is
   op spelmaat 10,22 tegen 9,74 op de plaat, dus de nabewerking houdt dat op peil. De pijplijn is dus niet de oorzaak.
6. **Alternatieven.** Getest: zie hieronder (A, B, C). Niet getest: met de hand geschilderde texturen. Die kunnen de rijkdom van de plaat waarschijnlijk wel benaderen, maar dat is mensenwerk per figuur. Een AI-laag over de render is in eerdere rondes al afgevallen op consistentie (`ontwerp/beeld.md`, ronde 14).
7. **Externe hulpmiddelen.** Geen aangeraden voor nu; niets gedownload.
   - *Poly Haven en ambientCG* (CC0 volgens eerdere controle, zie `assets/extern/ronde13/`): foto-achtige materialen, die voegen vooral korrel toe en die viel weg op spelmaat.
   - *Ucupaint* (Blender-add-on, GPL): lagen schilderen in Blender. Dit is de logische keuze als je handwerk wilt. De GPL raakt het gebruik niet, volgens de Blender-FAQ; bij verkoop van de add-on zelf wel.
   - *Material Maker* (MIT): procedurele texturen. De ontwikkelaar zegt op zijn itch-pagina dat wat je maakt van jou is; dat heb ik niet in een licentietekst gevonden.
   - Voor een verkocht spel moet je de voorwaarden per bestand nog zelf nalezen.
8. **Automatisering.** Herbruikbaar voor alle figuren en gebouwen: de verf in lagen en de spiegeling per materiaal (`materialen.py`), de kleurijking tegen een plaat (`oorzaak.py`), de lichtproeven (`licht_proef.py`), de textuurbak (`textuur.py`), de overzichten (`overzicht.py`, `resolutie.py`) en de controles.

## Proef A, B en C

Op hetzelfde model, met dezelfde camera en hetzelfde licht: `proef-abc.png` en `proef-abc-details.png`.

| | Wat | Blauw | Klein contrast blauw (80 px) | Oordeel |
|---|---|---|---|---|
| Voor | De eerste mijlpaal | 40,2 | 5,49 | Flets en vlak |
| A | Betere materialen en licht, oude vorm | 57,3 | 5,72 | **De grootste sprong in kleur** |
| B | A met texturen tot 4096 en normal maps | 57,4 | 5,71 | **Op deze schaal niet te zien**; kost 4 minuten per bak |
| C | Betere vorm én materialen | 57,7 | 5,86 | **Het dichtst bij de plaat** |

**Gekozen: C, met de verf op de punten.** Textuurresolutie is niet wat ons tegenhield: de recepten en de vorm waren het. Daarom kost de sprite-pijplijn geen UV-kaarten. `textuur.py` blijft als gereedschap, want de GLB en latere close-ups kunnen er wel van profiteren.
Let op: de waarden van C komen uit de eindstand; A en B zijn iets eerder gerenderd, op een vrijwel gelijke verf.

## De passes

**Pass 1, geometrie.** Gezicht, helm, kap, mouwen, tabberd, riem, buidel, handschoenen, laarzen en speer (per onderdeel hieronder). Teruggedraaid: een naad over de schouder (gaatjes), de tabberd over de mouw (vierkante schouderstukken), een open hand (klauw), een kap met diepe ringen (stapel banden).

**Pass 2, materialen.** Verf in lagen, geschilderd licht, kleuren geijkt op de plaat, spiegeling per materiaal, nieuwe materialen (kap, riem, buidel, omslag, essenhout). Teruggedraaid: krassen op de helm die eruitzagen als camouflage.

**Pass 3, rendering.** Glanslicht lager en breder. Teruggedraaid: de zon meer van opzij (kost kleur en gezicht).

### Per onderdeel

| Onderdeel | Wat er was | Afwijking | Soort | Wat ik heb gedaan | Oordeel |
|---|---|---|---|---|---|
| Silhouet | Gedrongen, hoofd 32% | Tabberd kort, band broek zichtbaar | Vorm | Zoom omlaag, omslag omhoog, mouwen voller | Beter; de plaat is nog gedrongener |
| Gezicht en baard | Oogwit, geverfde kassen, rafelige baard | Te realistisch, te oud | Vorm en verf | Donkere ogen met een lichtje, zware wenkbrauw, ronde neus, volle baard | Beter; kleiner dan op de plaat |
| Helm | Glad, te glanzend | Te zilver, rand dun | Vorm en licht | Hamerslag, dikkere rand, kleinere nagels, band, minder glans, donkere binnenkant | **Goed** |
| Kap | Bivakmuts | Te hoog, geen kraag | Vorm | Kraag op de schouders met een plooi, gezichtsopening groter | Beter |
| Mouwen | Dunne lijnen | Weinig volume | Vorm en verf | Bolle ruiten, voller, naad donker, midden licht | **Goed**; op spelmaat wat druk |
| Tabberd | Vlak pand | Geen kledinggevoel | Vorm en verf | Bloes, rimpels bij de riem, spanningsplooien, wijdere rok, dikke zoom, sluiting, contrastrand, geschilderde schaduw | Beter; de plooien mogen dieper |
| Riem en buidel | Gesp als verf, blokkige buidel | Vlak, te licht | Vorm en verf | Echte gesp met pen, lus, donkerder leer, klep en riempje, bolle onderkant | **Goed** |
| Handschoenen | Emmer als kap, kale vuist | Weinig vorm | Vorm | Kap volgt de arm, banden, knokkels, vuist om de speer, vrije hand half dicht | Beter; geen stiksels |
| Broek | Effen | Te zichtbaar | Vorm | Dunner bij de laars, plooien, minder in beeld | Voldoende |
| Laarzen | Klomp met band | Geen omslag, dunne zool | Vorm en verf | Gekartelde holle omslag, dikke zool, hak, neusnaad, plooien, stiksels, gesp | **Goed** |
| Speer | Dun, vlak hout | Geen nerf, dof blad | Vorm en verf | Dikker, nerf in strepen, blad met rib en twee vlakken, lichte ringen | Beter; schacht nog dunner dan op de plaat |
| Licht | Zon, hemel, glans, rand | Te veel glans | Render | Glans lager en breder, zon iets minder warm | Beter |

## De sprite-test

`resoluties.png` en `resoluties.json`. Dezelfde pose, camera en belichting.

| Maat | Scherpte, rechtstreeks | Scherpte, uit 1536 | Randpixels, rechtstreeks | Randpixels, uit 1536 |
|---|---|---|---|---|
| 128 | 37,9 | 56,0 | 33,6% | 22,4% |
| 256 | 32,3 | 42,5 | 16,6% | 11,2% |
| 512 | 24,8 | 31,2 | 8,6% | 6,0% |

| Sprite van 80 px, bron | Scherpte | Kleur die trilt tussen beelden | Randpixels die wisselen | Voetlijn |
|---|---|---|---|---|
| 256 | 38,8 | 0,327 | 21,5 | vast |
| 512 | 44,6 | 0,298 | 16,5 | vast |
| **768 (gekozen)** | 45,8 | 0,289 | 19,5 | vast |
| 1536 | 46,8 | 0,279 | 16,5 | vast |

**Conclusie:** verkleinen is altijd beter dan rechtstreeks renderen. Vanaf 512 komt er weinig bij, dus 768 blijft: 1536 kost 2,5 keer zoveel rendertijd voor 2% scherpte.

Op 80 pixels: silhouet, kleuren, helm en speer lezen sterk; het gezicht is een baard met twee donkere stippen onder de rand; de ruiten zijn een patroon, geen losse ruiten.

## De acceptatiecriteria

| Criterium | Stand | Bewijs |
|---|---|---|
| Render zichtbaar dichter bij rij 1 | **Ja** | `ab-acht-richtingen.png`; de eindbeoordeling is aan Marcel |
| Tabberd overtuigender | **Ja**, de plooien kunnen nog dieper | `ab-details.png` |
| Helm minder glanzend | **Ja**, L95 88→80 | `meting-eind.json` |
| Gewatteerde kleding met meer volume | **Ja** | `ab-details.png` |
| Laarzen en handschoenen met meer vorm | **Laarzen ja; handschoenen deels** | `ab-details.png` |
| Gezicht beter leesbaar | **Groot ja; op 80 pixels vooral de baard** | `ab-acht-richtingen.png`, rij 4 |
| Materialen rijker, niet fotorealistisch | **Deels**: veel kleuriger, maar schoner en gladder dan de plaat | `proef-abc-details.png` |
| Acht richtingen consistent | **Gemeten: ja** | `controle-vel.json`: 42 van 42 |
| Animaties werken nog | **Gemeten: ja** | `controle-model.json`: 117 van 117; `rigtest.png`; `loop-in-het-spel.mp4` |
| Spritekwaliteit beter | **Ja, vooral in kleur**; de mouwen zijn iets drukker | `ab-acht-richtingen.png`, rij 4 |

## Wat behouden is

Skelet en botnamen (met een eigen buidelbot), bewegingen, acht richtingen, camera, wereldschaal en ankermethode, de exportstructuur en WebGL2. Getest: staan en lopen in het echte spel (`in-het-spel.png`, `loop-in-het-spel.mp4`), alleen in de browser (`inspel.js`). De oude speerman staat nog in het spel. `npm test`: 1084 van 1084.

De cel is licht veranderd (lopen 84 x 140, staan 78 x 138) en `stap` is 0,34 tegen 0,34 ervoor; `vel.py` rekent die zelf uit, dus dat volgt vanzelf.

## Wat nog ontbreekt tegenover de plaat

1. **Geschilderd detail.** Slijtplekken, stiksels op het leer en kleurvariatie binnen een vlak. Hier zit de grootste resterende winst, en dit is de plek waar met de hand schilderen de doorslag kan geven.
2. **Diepere plooien in de tabberd**, ook aan de zijkanten.
3. **Dikkere speerschacht en sterkere nerf**, zoals op de plaat.
4. **Bruin nog 15% minder verzadigd** dan de plaat (33,9 tegen 39,4).
5. **Een tweede buidel en de armstukken** van de plaat: bewust niet toegevoegd, omdat ze niet in de specificatie staan.
6. **Aanvallen, geraakt worden en sterven**, en de meting in Firefox.

## Opruimen na je oordeel

De oude vorm zit nog als `vorm=1` in `figuur.py` (`G(oud, nieuw)`), alleen voor deze vergelijking. Keur je dit goed, dan gaat die eruit (CLAUDE.md: wat om is, gaat eruit). `proef/` en `backup-v1/` staan in de uitvoermap, niet in git.

## Bronnen

- [Ucupaint op Blender Extensions](https://extensions.blender.org/add-ons/ucupaint/versions/)
- [Blender FAQ over de GPL](https://www.blender.org/support/faq/)
- [Material Maker in de Godot-bibliotheek](https://godotengine.org/asset-library/asset/edit/863)
- [Reactie van de ontwikkelaar van Material Maker](https://rodzilla.itch.io/material-maker/comments?after=2)
- [Overzicht van gratis PBR-bronnen, met de licenties](https://app.cinevva.com/guides/free-textures-hdris-materials)
- [Creative Bloq over Poly Haven](https://www.creativebloq.com/design/free-textures-712366)
