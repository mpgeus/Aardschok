---
name: modelleren
description: Hoe Claude in Tithebreaker een 3D-model uit code maakt, verbetert of beoordeelt; een poppetje, wapen of ding als Blender-script (gereedschap/blender/), naar een referentie, gerenderd in acht richtingen en afgewerkt tot een vel op spelmaat. Lees dit voor je een model bouwt of aanpast, een skelet of beweging maakt (lopen, steek, geraakt, sterven), een render beoordeelt, of aan een nieuw poppetje begint (soldaat, dorpeling, vijand).
---

# Modelleren uit code

De lessen van vraag 190 (24 tot 27 okt 2026), kort. Het hele verhaal met het waarom staat in `ontwerp/beeld.md`, vanaf
"## Blender als basis?" (de koppen hieronder tussen aanhalingstekens zijn de vette koppen daar); de opdrachten staan in
`ontwerp/gereedschap.md`, bij "Blender als basis". Zoek daar het stuk dat je nodig hebt, lees niet alles.

Blender 5.2 staat op Marcels pc en draait zonder venster: `"C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
-b -P <script> -- <argumenten>`. De Python met PIL voor de meetscripts is die van ComfyUI.

**Sinds 30 okt (vraag 192) is er een nieuwe richting:** de stijl van Settlers II, gedrongen en cartoonachtig. Een nieuwe figuur begint
bij `docs/art/aardschok-art-bible.md` en `gereedschap/blender/stijl/` (`npm run stijl`), niet bij de basismens of HumGen; onder
"De stijlpijplijn" staan de lessen. Wat hieronder over de oude figuren gaat, geldt nog als werkwijze en als waarschuwing.

## De werkwijze

1. **Eerst in woorden, dan één proefplaat, dan alles** (`beeld.md`, "Eerst goedkeuring, dan renderen"). Een nieuw
   poppetje begint met een voorstel: wat het wordt, waar het op lijkt, en welke onderdelen anders zijn dan bij de speerman.
2. **Ontleed eerst de referentie, onderdeel voor onderdeel** (zoals "De referentie, onderdeel voor onderdeel"): de maten
   als deel van de lengte (van de zolen omhoog), de kleuren als mediaan van een vak van 7 bij 7 pixels (licht, midden,
   schaduw), en de zijaanzichten en de rug voor wat van voren niet zeker is. Op één vergroting las ik de wapenrok als
   gevierendeeld en de baard als kinriem: kijk in meer richtingen voor je iets vastlegt.
3. **Bouw op wat er is.** Voor een nieuw figuur zonder de vorm van de speerman is er de basismens
   (`gereedschap/blender/basismens/`, `npm run basismens`): een man van 1,75 m met skelet, GLB, acht richtingen en
   controles; `beeld.md`, "De basismens". Daarop staat de soldaat (`soldaat.py`): kleren en uitrusting als losse meshes
   aan hetzelfde skelet, het voorbeeld voor een volgend figuur in kleren; de gedrongen variant (`variant.py`) en de
   texturen en de realtime GLB (`textuur.py`) zijn ronde 4. `speerman_hd.py` heeft het lijf (MakeHuman), het skelet en de onderdelen, `bakken.py` de
   bewegingen, `eigen.py` rendert. Een nieuw poppetje is een eigen `kies()` die onderdelen vervangt (zoals
   `kruisboog_hd.py`), geen model van nul.
4. **Meet, kijk niet alleen.** `omtrek.py` (hoe de omtrek samenvalt, per strook te smal of te breed), `vergelijk.py`
   (tot op de pixel: omtrek, kleurverschil en licht), `palet.py` (de kleur per deel in Lab) en `patroon.py` (het patroon
   rond het lijf). Stel alleen bij waar het meer dan 2 pixels scheelt. Haal alle verschillen uit één vergelijking en pas
   ze in één keer aan: losse stapjes zonder meting maakten het "steeds gekker" (de voeten).
5. **Zet een ijkpunt.** Een stand die Marcel goedkeurt, krijgt een tag in git (`speerman-oke-25okt`). Wordt het
   slechter, ga dan terug. Eén maat kan stijgen terwijl het beter wordt: het kleurverschil per pixel telt elke hand die
   een paar pixels anders ligt.
6. **Beoordeel op spelmaat** (74 pixels van zool tot helm), niet alleen groot. "Duidelijk op spelmaat" is de maatstaf,
   niet hoe mooi het van dichtbij is.
7. **Kijk het zelf na voor Marcel het ziet** (de lijst hieronder).
8. **Render zuinig.** Een proef op halve maat met 16 monsters duurt een minuut; vergelijk alleen renders van dezelfde
   maat. Volle kwaliteit (100 procent, 48 monsters, uren) pas voor het spel, in een terminaltab met
   `uit/blender/vol/keten.sh`. Test een stand eerst zonder te renderen: alleen de houding en hoe de polsen wringen.
9. **Laat beweging zien als MP4.** APNG en GIF speelden bij Marcel niet af.

## Nakijken voor Marcel het ziet

Dit vond Marcel, en had ik zelf moeten zien. Loop het na op elke plaat:

- **Staat alles goed om?** De laars stond sinds het begin met de schacht ondersteboven; de kruisboog draaide mee met de
  pols (boog onder, de hand met de rug naar hemzelf).
- **Pakken de handen echt vast?** Vingertoppen door de schacht, een vuist naast de speer, een speerblad dat los zweeft.
- **Gaat er iets door iets anders?** De kruisboog viel door de schouder: jak en kraag maakten het lijf 11 cm dikker.
  Controleer het bereik voor je een houding bedenkt: zijn armen zijn kort (40 cm).
- **Beweegt het hele lijf mee?** Alleen de benen laten lopen is houterig.
- **Klopt de lengte?** Lopend even lang als staand (niet "als dwerg"), de nek recht, het hoofd boven de voeten.
- **Past alles in het beeld?** Sterven werd "een propje" met "onderdelen die ontbreken": het beeld was te klein.
- **Is het in elke richting hetzelfde?** De wapenrok had per richting een ander patroon, en het vel staat niet om de 45
  graden.
- **Leest het op spelmaat?** Een speer als "saté-prikker", een gezicht dat onder de helm verdwijnt, een zwarte lijn om de
  figuur die de referentie niet heeft.
- **Voelt het echt?** "En zwaartekracht?" (kleren moeten hangen), "te plastic" (te veel glans).

## De lessen

### Bouw en maten
- Gedrongen, zoals de referentie: het hoofd met helm is een kwart van de man, hoofd maal 1,25 en breder dan echt. De
  benen kort met de botten (0,65), want de knoppen van MakeHuman gaan niet ver genoeg.
- Overdrijf wat dun is, want op spelmaat moet het minstens twee pixels breed zijn: de speerschacht 2,2 cm, het blad maal
  1,4, de speer 1,32 keer de man. Donker hout en een dunne stalen boog verdwenen; licht hout en een dikkere boog lezen.
- Een derde van het fijne detail is genoeg; meer wordt ruis. Texturen groter dan echt (linnen 70 cm, jute en leer 50
  cm), anders zijn de draden kleiner dan een pixel.
- Let op de houding van het lijf: een holle rug zette het hoofd 4 tot 5 cm achter de voeten. Een heel korte nek oogt als
  "hoofd intrekken"; schouders half laten zakken, niet helemaal (dan afhangend en smal).
- Een laars volgt de vorm van het been, met de voet als één bol langs de voet vervormd; in plakken werd het een rups,
  als losse bol een narrenschoen. De maten op het vel gemeten (`LAARS_OM`, `LAARS_BREDER`, `LAARS_LANGER`).

### Kleren en onderdelen
- Een wapenrok als gesloten koker hangt in de stofsimulatie als een zak: bouw hem als voor- en achterpand, open opzij en
  vast aan de riem, met plooien in vorm (schuin, ongelijk, een ongelijke zoom). Bij beweging trekt het skelet de onderkant
  licht naar zijn vorm (`ROK_TREK` 0,2 in `bakken.py`); stugger, zwaarder of botsend hielp niet.
- Elk kledingdeel volgt alleen zijn eigen bot (het armstuk de onderarm, de laars onderbeen en voet, de helm stijf het
  hoofd). Gewichten van het dichtstbijzijnde punt scheurden.
- Een patroon rekent op de plek van elk punt in rust (`oorsprong`), anders schuift het weefsel; één as per arm en een
  heel aantal ruiten rondom.
- De wapenrok loopt over de schouder, de mouw komt eronder uit; een los schouderstuk leek een afzakkend hemd.
- Handen: de IK zet de pols op het doel, niet de vuist; schuif het doel tot de holte van de vuist op de schacht ligt, in
  elk beeld. Krul de vingers kootje voor kootje tot ze raken. Een elleboogrichtpunt per arm, en 80 procent van het wringen
  in de onderarm (anders draait de huid als een snoepwikkel).
- Een voorwerp aan een geschaald skelet hangt met de volle matrix als parent-inverse, anders zweeft het.
- Een baard is een vorm met strengen in de verf, geen 60.000 haren ("fake"). Het gezicht leest met de helm wat naar
  achteren, het hoofd recht vooruit en donkere oogkassen.

### Kleren op een lijf met skelet (de soldaat van de basismens, 28 okt)
- Kleren uit de huid krijgen de gewichten van de huid eronder vóór ze naar buiten gaan (DataTransfer op de huid zelf);
  dan buigen ze zoals de huid en blijven de lagen op volgorde. Een rok of iets wat vrij hangt: eigen gewichten (de
  wortel, naar de zoom wat van de benen).
- Solidify zonder 'even offset': die maakt pieken van meters waar de stof plooit (de rand van een zool, een tabberd).
- Een rand langs een gebogen vlak (een armsgat om de bovenarm): snijd langs f = 0 (`soldaat.snijd`); punten naar het
  vlak schuiven gaf een gekartelde rand.
- Een laars uit de huid van de voet heeft tenen, en gladstrijken krimpt de hiel tot onder de huid: smelt een schacht,
  een cilinder om de enkel en een bol langs het midden van de voet (voxel remesh), zoals `speerman_hd.laarzen`.
- Dikke vulling zakt in het lijf waar de huid sterk buigt (de oksel als de arm uit de A-houding omlaag gaat): maak hem
  daar dun, zoals een echte gambeson.
- Een straal die niets raakt, geeft `speerman_hd.vul` een straal van 10 cm: begin een ring net binnen wat er is (de
  omslag van de laars werd een platte rand).
- Bewaar `v.co.copy()`, nooit `v.co`: na een bewerking elders wijst de verwijzing in het niets.
- Doorsteek meet je met een kenmerk 'bedekt' per vlak (wat onder een laag erboven hoort) dat in een render magenta
  gloeit, met een tegenproef (zonder de bovenste laag moet het oplichten). Het lijf onder de kleren gaat weg op wat je
  ziet: onder een laag én in geen van 48 renders te zien (elk vlak een eigen kleur, één monster, 'Raw', geen dither).

### Een gestileerde variant, texturen en een realtime versie (de gedrongen soldaat, 29 okt)
- Een variant is een laag instellingen over de basismens (`variant.py`, `BASISMENS_VARIANT=gedrongen`, uitvoer in
  `<uit>/gedrongen`): dezelfde scripts, dezelfde controles, niets overschreven. De verhoudingen met doelen van MPFB
  (`head-scale-*`, `measure-*arm-length-decr`, `*legs-height-decr`, `torso-scale-*`): het skelet past zich aan, de
  botnamen blijven.
- Meet het silhouet op spelmaat tegen de speerman (`meten.py`): de speer eruit als dunne lopen over veel rijen (een dun
  been is korter), de helm als het grijze staal. Vergelijk alleen Z, N, W en O: schuin raakt de speer de helm.
- De speerman is op 15 graden gerenderd, de soldaat op 30: dan valt het gezicht onder de rand. Zet de helm hoger.
- Botten van het gezicht die weggaan (mond, kin, ogen): bewaar hun plek eerst (`rig['gezicht']`), voor baard en kap.
- Cycles bakt stil niets (`{'CANCELLED'}`, geen fout, 0,01 s) als het doelmateriaal geen uitgang heeft of de
  doelknoop niet geselecteerd is. Kijk naar de tijd per beeld en of het beeld niet effen is.
- Zoek de BSDF van een materiaal vóór je de uitgang omlegt (emissie om kleur of ruwheid te bakken): erna vind je hem
  niet meer terug. Een gemaakt beeld bewaart het .blend niet: na het opslaan `source = 'FILE'`.
- Bak uit de materialen zoals de sprites ze hebben (`materialen_voor_het_spel`), anders wordt staal in de GLB donker.
- Versimpelen tot 15.000 driehoeken met de normalen van de bron gebakken: het silhouet op spelmaat overlapt nog voor 99
  procent (`realtime-silhouet.json`).

### Art-direction: één richting, stijlen en de ontleding (ronde 5, 29 okt)
- Werk eerst één richting uit (ZW) en vergelijk op dezelfde lichaamshoogte zonder speer, met de voeten op één lijn
  (`stijlblad.py`); een hogere resolutie is geen verbetering.
- Ontleed een verschil met de speerman in vorm (klei, silhouet), materiaal (albedo), licht (dezelfde materialen in een
  ander licht) en nabewerking, elk als eigen beeld (`stijlen.py -- klei|albedo`, `ontleding.png`).
- De stofsimulatie van de speerman (`speerman_hd.hangen`) scheurde de rok als die binnen de botsafstand begon (1,6 cm
  met `thickness_outer` en `distance_min`), en ook daarna tussen de benen. Losse plooien uit een vast zaad (eigen plek,
  breedte, diepte, scheefstand, begin) zijn reproduceerbaar en lezen niet als golven.
- Het lijf heeft dichte oogkassen met geverfd oogwit (dat leest als dichte ogen): oogbollen ervoor, net door de
  oogleden, met de iris uit een kenmerk (hoe recht de plek vooruit kijkt).
- Een voet als ringen langs de as hiel-neus, nooit binnen de huid (per stuk de huid plus marge, ook na het gladstrijken:
  anders steken de tenen erdoor als lichte plekken), met een losse, vlak gearceerde zool met hak.
- Een palet over een glanzend metaal geeft vlekken van de lucht (C): staal mat of donker houden voor de kleurvlakken.

### Reconstrueren naar de speerman (ronde 6, 29 okt)
- De speerman is zelf een Blender-model (`speerman_hd.py`): neem zijn maten over (de helm: een halve bol, de rand 1,45
  keer de koepel, kam en naden, `visible_shadow = False` zodat het gezicht leesbaar blijft; het lijf: ouder, zwaarder,
  korte benen, het hoofd 1,25 keer) in plaats van op het oog te passen.
- Meet speerman en soldaat met dezelfde methode (`referentie.py`): delen uit kleur en plek, op dezelfde lichaamshoogte
  en voetlijn; een blauwe broek telt anders als tabberd (houd de tabberd op bij het laagste geel).
- De speerman staat in ZW op 40 graden gedraaid (`eigen.BEELD`), niet op 45; zijn vel is op 15 graden gerenderd, de
  wereld van het spel (`kern.cjs`) op 30.
- In de stand van de benen draait positief om Y het linkerbeen naar binnen: controleer een nieuwe stand op een
  vooraanzicht.
- Stoppels als een dunne laag die doorzichtig is waar geen haar staat: met een eigen huidkleur werd het een vlek.
- Een palet over de hele sprite (median cut) maakt een kleine grijze helm blauw; een octree houdt kleine vlakken.

### HumGen3D als basismens (ronde 9, 29 okt)
- HumGen3D 4.0.38 is volledig scriptbaar zonder venster: `from HumGen3D import Human`,
  `Human.get_preset_options('male')` (paden met het scheidingsteken van het OS, geef ze ongewijzigd door),
  `Human.from_preset(p)`, `age.set`, livekeys met `set_without_update` en dan `keys.update_human_from_key_change`. Raad
  geen methoden: kijk in de add-on (`human/`, `tests/`).
- `height.set` rekent met 184 cm en zet maar één van `height_150`/`height_200`: zet beide op 0 en stel bij op
  `height.meters`.
- Bakken van de huid, een andere rust (`set_t_pose_as_rest`) en de spelrig vragen het pakket HG_Export; de gewone
  exporteurs (`export.to_glb`) werken zonder, maar dan zonder huidtextuur, en ze bakken de livekeys in de mens (exporteer
  vanuit een geladen bestand en sla dat niet op).
- Vergelijk twee skeletten met draaiingen om dezelfde assen in de wereld, niet om de lokale assen van de botten.
- Een andere mens in de bestaande pijplijn (ronde 10): maak er een bestand van in de vorm van `basismens.blend` (de
  botnamen die de code kent, met hulpbotten die niets vervormen, de livekeys in de vorm gebakken met de correctieve
  shape keys als verschil erop), in plaats van een tweede pijplijn.
- Het hoornvlies van HumGen (`Eyes_Outer`, glas of doorzichtig) laat de glTF-export van Blender bij het afsluiten
  vastlopen; haal het alleen in de kopie voor de export weg (zonder schil lezen de ogen in de render rood).
- Een betere mens onder dezelfde procedurele kleren levert weinig op: de kleren bepalen het beeld. Wie de soldaat beter
  wil, moet de kleren beter maken.

### Kleding en gezicht op HumGen (ronde 11, 29 okt)
- Rode ogen zijn geen SSS of emissie: de ogen van HumGen hebben hun UV in `map1`, het lijf in `UVMap`. Bij het
  samenvoegen verliest het oog zijn UV en leest de textuur één hoek (rood). Hernoem de UV vóór `join`.
- Wenkbrauwen uit HumGen-deeltjes: zet ze om naar curves (`bpy.ops.curves.convert_from_particle_system`), zet het
  attribuut `radius` (zo'n 0,00008) en de melanine, en hang ze aan het bot `head`. Zonder radius worden het zwarte blokken.
- De huid van HumGen (`Skin_tone`): een hogere `Tone` is lichter, niet donkerder. Warmer is `Tone` omlaag en `Redness`
  omhoog. De stoppels zitten in `Gender_Group` (`Beard Opacity`, `Mustache Opacity`).
- Een rok die valt: maak de vorm met de bestaande bouw, laat hem dan als stof vallen (`soldaat.doek`). De pin-groep
  ligt langs de schouders en de riem, en de rok botst alleen met het lijf; met de gambeson erbij kreukt hij. Stijf 40,
  buig 2, kwaliteit 10 en 50 beelden, en pas het daarna toe als rustvorm, vóór de dikte en de skinning. Lees een groep
  na het toepassen met `vertex_groups.get`, want het toepassen kan haar weghalen.
- PBR-korrel (vuil, slijtage, weefsel) middelt weg op 74 pixels: daar zijn B (eenvoudig) en C (PBR) bijna gelijk. Wat
  op spelmaat leest, is contrast in grote vormen (zomen, een groot ruitpatroon, vuil onderaan) en een gezicht dat onder
  de helm uitkomt. Beoordeel een materiaal dus op spelmaat, niet groot.
- Een nieuw soort object (curven voor haar) moet mee in elke meting die "de man verbergt": de elevatietoets mat de
  wenkbrauwen als tegel.
- De doorsteektoets markeert 'bedekt' in de rusthouding. Een kledingstuk dat opzij open is, laat in de idle de laag
  eronder zien; dat telt dan als doorsteek, ook als het in beeld klopt. Kijk naar de magenta pixels over de render
  heen voor je iets verandert.

### Artistiek bijsturen op spelmaat (ronde 12, 29 okt)
- Meet eerst op 74 pixels tegen de speerman (`humgen/ronde12.py`): de kleurverdeling liet meteen zien waar het zat
  (ronde 11 was voor 25 procent grijs, de speerman voor 8,5). Vergelijk elke proef los met dezelfde camera en hetzelfde
  licht, en kies dan pas de combinatie.
- Een proef vervangt de lijst proeven van de variant (`variant.py`): zet die van de variant ervoor (`proef12.sh` doet
  dat), anders vergelijk je met een andere soldaat. Een nieuwe baseline eerst tegen de oude render leggen.
- Wat op spelmaat het verschil maakte, was vorm en toon in grote vlakken: een kleinere en donkerdere kap, het gezicht
  onder de helm uit (de rand op en achterover, de helm hoger), een breder silhouet (dikkere mouwen, grotere laarzen),
  een langere rok. Kleur in een materiaal dat al klopt (gedempter bruin) en zachter licht zag je op 74 pixels niet, of
  het maakte de figuur vlak.
- Stem een kleur af op de sprite, niet op de albedo: de albedo van de speerman gaf op 74 pixels juist een verder blauw
  (zijn vel heeft een eigen afwerking). Reken terug van de mediaan in Lab op 74 pixels naar de albedo.
- `soldaat_render.SOORTEN` zet de glans per soort voor het spel (het staal op metaal 0,9), boven op het materiaal: een
  matter staal moet daar ook (`soldaat.stijlen.C.soorten`).
- De halssnede van de gambeson is 16 cm breed: een kortere maliënkap legt de trapezius bloot. Geef de gambeson dan een
  opstaande kraag ('hals' boven de nek) in plaats van de kap langer.
- Een wijde kap aan de handschoen werd een zak met een plooi en volgde de huid niet meer: grotere handen eerst groot
  bekijken, niet alleen op spelmaat.

### Kleding uit bestaande assets (ronde 13, 29 okt)
- Human Generator heeft zelf kleding die op dit lijf past: `outfit.set` en `footwear.set` passen hem aan de vorm (de
  shape key 'Body Proportions'), en `outfit.add_obj` maakt van een vreemd kledingstuk HumGen-kleding: gewogen, met
  correctieve vormen, aan het skelet. Doe het vóór de botten hernoemd worden; dan gaan de vertexgroepen mee.
- Professioneel detail in weefsel en naden verdwijnt op 74 pixels. Wat telt, is of de vorm van het stuk past bij het
  ontwerp. Kleding voor een gewone man ombouwen (een slanke parka tot gambeson, een hemd voor in de broek tot tabberd)
  kost juist de professionele vorm. Zoek een stuk dat al de juiste vorm heeft.
- Een andere kleur over een vreemde textuur: deel door de helderheid van de textuur zelf, niet na de kleurknopen van
  HumGen, en reken de kleur per materiaal terug naar de sprite. Een witte sjerp in de textuur wordt anders een lichte
  band.
- Een basisbestand met meer kledingstukken dan de soldaat draagt: haal de ongebruikte weg, anders draagt hij ze toch.
- Kijk naar de realtime-GLB, niet alleen naar de bron: het rode gezicht zat er sinds ronde 10 in.

### Blender + AI voor animatieframes (ronde 14, 29 okt)
- Laat de AI alleen binnen het silhouet werken (img2img met een masker), met diepte als ControlNet. Dan blijven de
  benen, de speer en de vorm altijd staan; de AI kan alleen het oppervlak veranderen.
- Werk frames van één animatie samen af, naast elkaar in één beeld (een modelblad). Apart, met dezelfde seed, tekent
  SDXL per frame een ander kledingstuk.
- Een stijlbeeld (IP-Adapter) trekt het ontwerp mee: de speerpunt werd een knop en de hozen grijs. Zet in de prompt
  wat moet blijven, en meet het (de kwartiering op het materiaal-ID).
- Een diepte voor ControlNet: meet het bereik aan de figuur zelf, en geef alle frames hetzelfde bereik.
- Een andere stand in een stijlrender: `STAND=<json>#<naam>` voor `stijlen.py`. Controleer met een overlay van de
  silhouetten dat de benen echt wisselen.

### Drie experimenten naast elkaar (ronde 7, 29 okt)
- Een proef is een JSON in `proeven/` over de variant heen, in een eigen map (`BASISMENS_PROEF`); de variant houdt de
  gekozen proeven in zijn lijst `proeven`. Zo is elke wijziging los te bekijken en terug te draaien, zonder kopie van
  een script.
- Beoordeel op spelmaat met het hoofd 8x ernaast: wat groot een verbetering lijkt (de ogen onder de rand door de helm
  te kantelen), kan op 74 pixels een pet worden die achterover staat. Wat daar telt, is de grootte en de helderheid van
  de helm, en een lichte maliënkap in plaats van een bruine kraag.
- Vanaf 30 graden verbergt een brede rand de ogen altijd: de rand steekt zo'n 14 cm voor de ogen uit en had er 8 cm
  boven moeten zitten. Bij de speerman op 30 graden zijn ze ook weg. Meet het (een straal van de oogbol naar de camera,
  `stijlen.py -- kop`) in plaats van te raden.
- Stoppels in de huid: kenmerken per punt van het lijf (dichtheid, wenkbrauw, blos) en dan in Cycles de kleur in de
  textuur bakken (DIFFUSE, alleen COLOR), dus geen laag en geen doorzichtigheid. Zoek de lippen op het profiel van het
  gezicht: het bot `oris01` zit onder de onderlip, niet in de mondnaad.
- Een kap of kraag uit ringen om een schuine as loopt op de schouders langs de stof, zodat wat eronder ligt er tussen
  twee ringen doorheen steekt. Zet elk punt daarna nog buiten wat eronder ligt, gezocht langs zijn eigen normaal en tot
  een paar centimeter ver (`bovenop`), en maak het wat glad.

### Kleur, licht en materiaal
- Meet kleur per deel (een rechthoek per deel), niet per kleurgroep: "grijs" mengde helm en schaduw.
- Licht van linksboven en meer van voren dan de wereld, zodat het gezicht onder de helmrand leest. Een hardere zon en
  diepere omgevingsschaduw geven op spelmaat bijna niets; de omgevingsschaduw alleen binnen een deel.
- Geel blijft in de schaduw oranje, niet olijf (`GEEL_GLOED` 0,12).
- Stof mat met sheen in de eigen kleur (wit sheen maakte blauw grijs), leer zacht glanzend, staal met de ruwheid uit de
  textuur (overal gelijk is plastic). Texturen van Poly Haven (CC0): alleen licht en donker en de normal map.
- Een helm kan op spelmaat ineens zwart worden naast zilver: zoek de waarde door te meten.
- De referentie heeft geen zwarte lijn om de figuur: de randpixels zijn per kant donkerder. Lijnen om de kleren, niet om
  het lijf.

### Camera en richtingen
- De poppetjes standaard met de camera op 15 graden zoals de generator (`speerman_hd.py`, `'camera': 15`); `iso` zet
  hem op 30 zoals de wereld.
- Het vel staat niet om de 45 graden: per richting de draai waarin de omtrek het best past (Z 5, ZW 40, W 65, NW 155, N
  185, NO -145). O en ZO zijn gespiegelde westkanten, met het wapen dan in de andere hand; het licht spiegelt mee.
- Een plat voorwerp draait met zijn brede kant naar de camera (het speerblad), anders wordt het een streep.
- Ook een plaat van GPT staat niet om de 45 graden: het schuine aanzicht van het model sheet paste op 25 (`kopie_hd.py`).
  Een GLB uit een plaat van schuin boven helt mee met die camera (23,5 graden): zet hem rechtop met de eerste hoofdas
  (`glb_kijk.py`).
- Meet bij een nieuwe bron eerst de ogen, de kin en de voet van de helm als deel van de lengte: met de lengte tot de top
  van de helm vast, duwt een te hoge koepel het hele lijf omlaag.
- Wat na de stofsimulatie gemaakt wordt (een wijde broek), prikt door de gevallen rok: maak het alleen eronder.
- Een vlak in de verf (stoppels) moet sterk: de huid dempt het (de helft naar donker werd 10 procent donkerder). Toets
  met fel groen of het vlak op de goede plek ligt, voor je aan de sterkte draait.
- Fijne ruis in een bobbel leest als haar: plooien zijn brede ruis met weinig detail.

### Beweging en skelet
- Lopen met het hele lijf: het bekken draait, zakt, schuift en veert, de borst kantelt terug, armen en wapen schommelen als
  één stuk mee. Benen met IK: de standvoet schuift vlak, de zwaaivoet maakt een boog, het afzetten draait om de bal.
- Tegen "lopen als een dwerg": rek de benen in de wijde stand in plaats van het bekken te laten zakken (`BEEN_REIK` 0,99,
  `BEKKEN_ZAKT` 0,15 in `bakken.py`).
- Mocap van CMU (`mocap.py`) geeft bekken en benen; neem 30 procent van de rug, en houd nek en hoofd in de staande houding
  (anders neemt hij de houding van de proefpersoon over).
- Een steek: het wapen houdt zijn richting in de wereld; de uitval zit in de stap, het bekken en de duwende achterhand.
- Sterven: liggend volgen de benen het bekken, niet de IK. Eerst schuiven, dan draaien, en lees een botstand pas als
  Blender de draai heeft bijgewerkt.

### Van render naar spel
- Blender rendert vier keer de spelmaat; daarna `spelvel.py` (de vellen, één schaal, het anker op de voeten) en
  `spelvel-zet.cjs` (naar `beelden/figuren` en `beelden/beschrijving.json`). Niets blijvends in het spel zonder Marcel.
- Wat op spelmaat telt, zijn licht en contrast; een rijkere verf of een textuur van 4096 zie je pas van dichtbij.
- Een verkleinde render mag niet ogen als "a photograph converted into pixel art" (de stijlspecificatie): palet, clusters
  en omlijning blijven ons werk.

### De stijlpijplijn (vraag 192, 30 okt)
- **Meet de plaat vóór je bouwt:** hoofd, rand, romp, totale breedte en schacht als deel van de lengte. De eerste bouw zat er tot 33
  procent naast, en dat zie je pas als je het naast elkaar zet. Grote vormen zijn de stijl.
- **Vloeiende vormen uit afstandsvelden** (`vorm.py`): `smin` tussen de delen, surface nets naar de mesh. Elk kledingstuk is een veld om het
  lijf, dus de lagen passen vanzelf. Het vak moet groter zijn dan de vorm, anders snijdt hij recht af.
- **Kijk naar close-ups voor je 80 pixels vertrouwt.** Op spelmaat verborgen: een gesp die alleen verf was en binnen de riem lag, een
  mouw door de tabberd, oren door de kap, een pols die 60 graden knikte.
- **De hand ligt in het verlengde van de onderarm:** de vingers wijzen ongeveer waar de onderarm heen wijst, de speer ligt aan de
  binnenkant van de hand. Een greep die "goed op de speer" zit, kan toch een geknakte pols geven.
- **Marge tussen lagen:** minder dan een centimeter tussen twee velden geeft een rafelrand (de omslag en de broek), en een wijde omslag
  raakt het andere been. Maak de laag eronder dunner waar de laag erboven begint.
- **Een pand boven de dij:** de zoom hangt het meest aan de dij van zijn eigen kant, het midden is gespleten. Anders steekt de knie
  erdoor bij elke zwaai.
- **Op 30 graden dekt een rok meer af dan op de plaat:** wat vooruitsteekt, dekt ongeveer 0,58 keer zijn afstand extra af. Laat de zoom
  hoger hangen dan op een plaat van 12 graden.
- **Glans zonder de kleur aan te tasten:** een zon die alleen in de glans telt (`visible_diffuse = False`). Metaal leest daardoor, en
  de stof houdt zijn kleur.
- **Een gezicht:** geen contactschaduw en geen slagschaduw van de rand, anders verdwijnt het op spelmaat. Eenvoudige ogen met een
  zware bovenrand lezen beter dan een rond oog met wit eromheen ("uitpuilend").
- **Een negatief getal tot een macht is NaN** (`np.sin(pi * t) ** 0.8` bij `t = 1`): dat gaf een zwarte speerpunt.
- **De voet in het spel:** `stap` in de beschrijving is tegels per pas. `vel.py` rekent het uit de paslengte; dan glijdt hij niet, ook al
  loopt het spel sneller dan de cyclus.
- **Na het bakken:** lees de pixels vóór je `source = 'FILE'` zet; erna is een gemaakt beeld leeg (een GLB die overal glansde). Een
  relatief pad in `scene.render.filepath` schrijft niet waar je denkt: gebruik `os.path.abspath`.
- **Meet eerst waar het verschil zit** (`oorzaak.py`). Het voelde als te weinig schaduw; het lichtbereik was gelijk aan de plaat, en de verzadiging 30 procent lager. Schakel licht voor licht uit
  (`licht_proef.py`): zo bleek de glans van de helm een lamp en niet de verf, en kostte witte spiegeling op stof 4 punten verzadiging. Stem de kleur af op het scherm, niet op de hexwaarde uit een opdracht.
- **Texturen lossen dit niet op.** Dezelfde recepten per texel (tot 4096, met normal map) gaven dezelfde meting en geen zichtbare winst. Vorm en recept tellen; pas als je echt met de hand schildert, kan een textuur meer.
- **De zon meer van opzij** geeft vorm, maar kost kleur en maakt het gezicht modderig. Diepte komt uit de vorm en het geschilderde licht.
- **Een laag die over een andere loopt, moet erboven blijven of eronder zakken.** Rakende lagen geven slierten: laat de mouw onder de tabberd zakken waar die begint, en maak geen schouderstukken om een doorsteek te verbergen.
- **Vergelijk nooit met oude schermafdrukken in de map:** een nieuwe opname van minder beelden laat de oude staan. Maak de map eerst leeg.
- **De browser op de achtergrond:** `requestAnimationFrame` loopt dan bijna niet. Laat een opname van het spel zonder wachten op een beeld
  werken, in stukken korter dan 45 seconden.

### De methodeproef (31 okt, `docs/art/methodeproef.md`)
- **De rijkdom van een AI-referentie zit vooral in het licht, niet in het oppervlak.** Verf of een AI-beeld op de textuur in fysiek licht geeft bijna niets. Reken eerst het licht om (G-buffer, per soort een kleurverloop uit de plaat).
- **Geef de AI de beste invoer die je hebt:** AI over geschilderd licht en verf is veel beter dan AI over de oude render.
- **Leg het verschil op de UV, niet de kleur:** ΔLab = AI min invoer, per richting een eigen laag, en haal per onderdeel het midden eruit, anders verschuift het palet. De AI-kleur als verf geeft dubbel licht. Eén laag voor alle richtingen wordt vlekkerig.
- De AI licht diepe schaduwen op: tel positieve ΔL daar niet mee. Denoise .5 is de grens; bij .8 verandert het ontwerp.
- **Toets je eigen verklaring.** Ik dacht dat de AI-laag het staal korrelig maakte; zonder laag werd de fijnste band juist hoger.
- Multilayer-EXR uit Blender 5 is multi-part (`proef/exr.py`).
- **Een keten van uren:** `set -eo pipefail` (zonder pipefail loopt hij door na een fout vóór `| tail`), `timeout` per stap, een logboek, en een controle dat de uitvoer echt nieuw is. Geen numpy in zes draden tegelijk: dat hing een nacht lang, zonder fout. `TaskStop` kan kindprocessen laten doorlopen: kijk na of ze weg zijn.

### De vormproef (31 okt, `docs/art/vormproef.md`)
- **Een variant zonder productiebestanden te raken:** vervang in een eigen script de velden in de module `figuur` (`setattr(F, naam, f)`); `delen()` en de verf zoeken ze op bij het aanroepen. Skelet en bewegingen blijven dan vanzelf gelijk, en dat is te controleren (`skelet_vergelijk.py`).
- **Beoordeel vorm in klei** (`render.py ... klei`), naast de plaat op gelijke hoogte. De verf verbergt de fouten.
- **Meet per onderdeel, niet per rij:** in een omtrekmeting per rij telt de speer mee en vallen de rijen niet samen. De ID-beelden geven de maat per onderdeel; lees de plaat met het oog af. Een slechter getal zoek je uit, en een beter getal uit dezelfde meting vertrouw je dan ook niet.
- **Controleer na elke ronde je eigen correctie:** het hoofd kleiner maken maakte ook het gezicht te smal, terwijl de opdracht grotere gezichtsvlakken vroeg.
- `baard` en `hoofd` hebben dezelfde ID-kleur (`render.py`, `ID_KLEUR`).

### Vormproef V4: pose en armen (31 okt, `docs/art/v4/`)
- **Lees de pose van de referentie uit meer richtingen af.** Van voren leek de vrije hand langs de heup te hangen; pas zij en schuin lieten de gebogen arm zien met de vuist voor het lijf. Vergelijk op gelijke schaal, armen naast elkaar, in alle acht de richtingen (`armvgl`-plaat): pas dan zag ik elleboog en speerhand kloppen of niet.
- **Een arm is geen buis:** breed bij de schouder, taps, en van opzij dieper dan breed. Geen bol bij de schouder (pofmouw); een te sterke taper wordt een "sate stok". Overdrijven is makkelijk: stap voor stap en bekijken.
- **Meet de hoeken:** een elleboog onder de 60 graden oogt onnatuurlijk; laat de hand de onderarm volgen (`pose4.hand_recht`), anders krijg je rare polsen. De duim van een vrije hand staat loodrecht op de onderarm.
- **Zichtbare doorsteek (`doorsteek4.py`):** telt driehoeken die snijden én vanaf een spelcamera vrij liggen. Het vond de broek door de rok en de speer door de voet. Het is een bovengrens: bedoeld contact telt mee, dus kijk op beeld.
- **Rok:** hol met dikte en betere gewichten (A) werkte beter dan hulpbotten per pand (B).
- **Kijk of een masker doet wat je denkt:** vergelijk de hoogte van een masker zonder speer met de echte figuurhoogte. Een dunne rand van de speer bleef staan, en dat drukte de overlap van V3 en V4 ongemerkt tot 0,6. Op een grijze achtergrond hapt een drempel ook uit het staal: gebruik een waterscheiding (`hy_invoer.py`).
- **Een mesh uit Hunyuan3D staat of valt met de plaat:** één pose rondom, op ooghoogte, armen los. Op zo'n plaat vervielen de kegelcorrectie, de vlakke zolen en de losse helm. Kijk eerst naar de plaat (`docs/art/hunyuan/PLAAT-EISEN.md`) voor je een probleem in de mesh oplost. Meer stappen en een hogere octree geven geen nieuwe vorm.
- **TripoSplat (`hy_splat.py`, `docs/art/hunyuan/TRIPOSPLAT.md`) geeft één goede kant per run:** snijd twee runs langs de zij, in plaats van te mengen of te projecteren; dat gaf vlekken of waas. De naad per hoogte op het midden van wat daar staat, want de helm staat niet boven het midden van het lijf. Laat de vaste houding op de plaat staan: dan hoeft de rig hem niet na te maken.
- **Een wolk zonder vlakken kan riggen:** buren uit de dichtste punten zijn genoeg, per Gaussian de gewogen draaiing. Zoek stippen in de lucht in de gewichten en het masker: wat half aan twee botten hangt, wordt een lijn zodra die uit elkaar gaan. Haal de speer weg en render de rest in rust: dan zie je wat er overblijft.
- **Vraag hoe iemand iets vasthoudt, voor je een beweging bouwt:** een steek met één hand werkte technisch, maar "je kunt met 1 hand geen kracht zetten". Armen van een gedrongen figuur zijn kort: reken de reikwijdte na voor je een greep kiest.
- **Wat dun is en de run niet goed zet, komt uit code:** de boog stond op de verkeerde diepte, achter de arm. In elke horizontale plak is zo'n ding een los stukje naast het lijf: één gladde lijn door die stukjes vindt hem, en dan gaat hij uit de wolk en komt hij als Gaussians in de hand. Een schuin aanzicht als invoer werkt niet: het model kiest dan zelf hoe de figuur staat.
- **Verf uit de plaat op de mesh:** op de fijne mesh en niet erna, één richting per punt (mengen geeft paars), een zachte vervorming per richting, en wat geen richting ziet donker. Beoordeel in de richtingen die niet in de verf zaten, en op 80 pixels: detail dat groot helpt, is op spelmaat ruis.
- **AI van meer aanzichten leest een schuine plaat als vlak:** bij Hunyuan3D-2mv ging de rand van de helm rondom hangen, en op de spelcamera kantelt het dan nog een keer. Kijk de mesh dus altijd na vanaf de spelcamera. Geef alle aanzichten één schaal, één as en één voetlijn.
- **Vergelijk op gelijke figuurhoogte, zonder speer:** schaal op de hoogte met speer en de referentie staat ongemerkt groter, en dan klopt je oordeel over de verhouding niet. Rekent de sprite op een oude lengte, dan wordt de figuur kleiner in beeld.
- **Een plaat kan zichzelf tegenspreken** (speer in de andere hand in ZW): spiegel dan die richting voor de vergelijking, en zet het erbij.

## Doodlopende wegen

Probeer dit niet opnieuw zonder nieuwe reden (`beeld.md` zegt waarom):
- Een AI-verfbeurt over de render (SDXL, img2img): op spelmaat nooit beter dan de render zelf. Een zwakke basis wordt er
  niet beter van.
- De verf van het vel op het model projecteren of bakken: strepen op de zijkanten, en modder als de richtingen mengen.
- Human Generator met onze delen, de platen van Marcel op 3D, een soldaatje helemaal uit code, en TRELLIS als bron:
  Marcel koos terug voor ons Blender-model (27 okt).
- Een rok uit stofsimulatie als koker, een poncho over de schouders, voeten 45 graden naar buiten, een gerekende pas
  (te klein naast de referentie).
- Echte 3D in het spel: maanden werk, en het lost het lezen op 74 pixels niet op.

## De algemene Blender-skills

Naast deze staan een paar skills uit `arjun988/blender-skills` (MIT; `.claude/skills/LEESMIJ-blender-skills.md`):
algemene kennis over modifiers, skeletten, gewichten, stof, licht en renderen. Ze gaan uit van een Blender met MCP en een
spel met 3D-modellen: voor ons geldt dat niet. Geen MCP (wij draaien scripts zonder venster), geen voorvoegsels als
`SM_` (de namen zijn Nederlands, zoals in de code), en geen polycount of engine-export. Waar ze iets anders zeggen dan
deze skill of `beeld.md`, gaan deze en `beeld.md` voor. Het nuttigst is `references/reference-image-match.md`: de
volgorde daar (eerst de referentie ontleden, dan de camera, dan de omtrek, dan het detail) is ook de onze.

## Bijwerken

Leer je iets nieuws, zet het dan kort onder de juiste kop hier, en het verhaal met het waarom in `beeld.md`. Wat om is,
gaat naar "Doodlopende wegen" of eruit.
