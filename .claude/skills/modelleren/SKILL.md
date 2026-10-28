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

## De werkwijze

1. **Eerst in woorden, dan één proefplaat, dan alles** (`beeld.md`, "Eerst goedkeuring, dan renderen"). Een nieuw
   poppetje begint met een voorstel: wat het wordt, waar het op lijkt, en welke onderdelen anders zijn dan bij de speerman.
2. **Ontleed eerst de referentie, onderdeel voor onderdeel** (zoals "De referentie, onderdeel voor onderdeel"): de maten
   als deel van de lengte (van de zolen omhoog), de kleuren als mediaan van een vak van 7 bij 7 pixels (licht, midden,
   schaduw), en de zijaanzichten en de rug voor wat van voren niet zeker is. Op één vergroting las ik de wapenrok als
   gevierendeeld en de baard als kinriem: kijk in meer richtingen voor je iets vastlegt.
3. **Bouw op wat er is.** `speerman_hd.py` heeft het lijf (MakeHuman), het skelet en de onderdelen, `bakken.py` de
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
