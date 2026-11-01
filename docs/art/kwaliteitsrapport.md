# Kwaliteitsrapport: de eerste mijlpaal van de stijlpijplijn

30 okt 2026, vraag 192. Stand: de werkmap op `43ec9a8d` met de nog niet gecommitte `gereedschap/blender/stijl/`. **Dit is een technisch
werkend prototype. Het artistieke oordeel is aan Marcel.** Alle beelden staan in `bewijs/`; de cijfers komen uit de controles.

**Dit rapport is de stand vóór de kwaliteitsronde. De nieuwste stand en cijfers staan in `kwaliteitsronde.md`.**

## Het oordeel

| | |
|---|---|
| Vorm en verhouding | Dicht bij de plaat, en vanuit alle acht richtingen dezelfde man |
| Herkenbaarheid op spelmaat | Sterk: helm, tabberd, speer en laarzen lezen op 80 pixels |
| Materialen | Schoon en verzorgd, maar **vlakker dan de plaat**: dit is het grootste verschil |
| Beweging | De loop werkt technisch; **de stijl van bewegen heeft jouw oog nodig** |
| Productie | Van niets tot vellen en GLB met één opdracht (`npm run stijl`), in bijna 11 minuten, zonder handwerk |

## Wat goed werkt

- **Eén model, acht echte richtingen.** Geen spiegeling en geen losse tekeningen, dus de kleuren en de speerhand blijven kloppen.
- **Op spelmaat:** de grote vormen uit de plaat maken het leesbaar. In het spel staat hij duidelijk tussen de dorpelingen (`bewijs/in-het-spel.png`).
- **Helm:** leest echt als staal, met ribben, band en nagels (`bewijs/close-ups.png`).
- **Voeten en handen:** een voet die staat, glijdt niet (gemeten), en de rechterhand zit binnen 2 mm op de speer.
- **Geen externe assets:** geen licentievragen voor deze figuur.
- **Snelheid:** bouwen 39 s, 3,8 s per beeld (64 monsters, met ID-beeld), de hele keten 621 s, op de 1080 Ti.

## Wat nog niet voldoet

1. **Materialen.** De plaat heeft rijkere geschilderde schaduw in stof en leer. Dit oogt nu nog wat als klei, vooral groot; op spelmaat minder. Hier zit de
   meeste winst.
2. **Tabberd.** Weinig plooien bovenaan, en de overgang van de rand naar het pand is wat vaag.
3. **Broek.** Een grote, eenvoudige vorm boven de laars, zonder plooien en met een ronde knie.
4. **Speer in ZO.** De speer loopt daar langs de rand van het gezicht. Je platen wisselen van hand; dat mag volgens de opdracht niet, dus hier ontkom je er niet helemaal aan.
5. **Verhoudingen tegenover de wereld.** De nieuwe speerman staat naast oude, langere dorpelingen en huizen. Hij past pas echt als die ook omgaan.
6. **Handschoenen.** Mooie vuist op de speer, maar minder uitgewerkt dan de plaat (geen stiksels, geen slijtplekken).
7. **Maten.** Schouders (0,67 m) en laarzen (0,38 m) zijn groter dan de specificatie, en de lengte is 1,39 m in plaats van 1,65 m: dat hoort bij keuze A.
8. **Lijnen op spelmaat in beweging.** De donkere lijnen tussen de lagen zijn alleen op beelden en in de films bekeken, niet lang in het spel.

## Wat nodig is om productiegeschikt te worden

1. **Marcels oordeel** over de stijl en de beweging.
2. **Een schilderronde** voor de materialen, op basis van wat hij als eerste wil.
3. **De andere bewegingen:** aanvallen, geraakt worden en sterven. Staan en lopen zijn er nu; in `inspel.js` zijn de andere nog de oude vellen.
4. **Dan pas in het spel:** `speerman3d-*` vervangen, plus de werklijst bijwerken. Daarna de tweede eenheid als proef of de pijplijn schaalt.
5. **Een eerste gebouw** volgens de art bible (de opdracht: architectuur eerst). **Niet gedaan in deze mijlpaal**: de opdracht zegt dat de eerste mijlpaal stopt na de speerman.

## Toetsbare checklist

| # | Criterium | Stand | Bewijs |
|---|---|---|---|
| 1 | Visueel overtuigend in de Settlers-stijl | **Aan Marcel**: dichtbij, de materialen vlakker dan de plaat | `bewijs/acht-richtingen.png` |
| 2 | Acht richtingen uit één model, reproduceerbaar | **Gemeten: ja** | `render.py`, `npm run stijl` (de hele keten van niets af gedraaid, 621 s); `controle-vel.json`: acht verschillende beelden |
| 3 | Loop natuurlijk en vloeiend | **Technisch ja, oordeel aan Marcel** | `bewijs/loop-in-het-spel.mp4`, `loop-8-12-24-beelden.mp4` |
| 4 | Kleding en uitrusting consistent | **Gemeten: ja** | blauw en geel leesbaar in elke richting (`controle-vel.json`) |
| 5 | Geen plastic of primitieve uitstraling | **Deels**: geen primitieven; groot nog wat kleiachtig | `bewijs/close-ups.png`, `bewijs/materialen.png` |
| 6 | Leesbaar op spelschaal | **Ja, op het oog** | onderste rij van `bewijs/acht-richtingen.png`, `bewijs/in-het-spel.png` |
| 7 | Sprites technisch correct geëxporteerd | **Gemeten: ja** | `controle-vel.json`: 42 van 42 |
| 8 | Sprites werken in WebGL2 | **Getest in het echte spel** (alleen in de browser) | `bewijs/in-het-spel.png`, `inspel.js` |
| 9 | Opnieuw te draaien zonder handwerk | **Gemeten: ja** | `npm run stijl` |
| 10 | Rig: schouder, elleboog, heup, knie, nek | **Op het oog: geen scheuren** | `rigtest.py` |
| 11 | Model: delen, verf, gewichten, beweging | **Gemeten: ja** | `controle-model.json`: 117 van 117 |
| 12 | GLB met skelet, UV, textuur en bewegingen | **Gemeten en opnieuw ingelezen** | `export/kijk/glb-controle.json`: 38.681 driehoeken, 26 botten, UV-kaart, 2 texturen, 2 acties |

## De specificatie, punt voor punt

| Punt | Stand |
|---|---|
| 1 Proporties | Keuze A wijkt bewust af (Marcel: "Laten we A proberen"): hoofd 32 in plaats van 24 procent |
| 2 Hoofd, baard, ogen | Gedaan; brede kaak, korte neus, donkere ogen met een klein lichtje, korte baard. Kleuren iets lichter dan de startwaarden, om onder de rand te lezen |
| 3 Helm | Gedaan: koepel, doorlopende rand, ribben, band, nagels, donkere binnenkant. De rand werpt bewust geen slagschaduw (het gezicht moet lezen); de contactschaduw geeft wel een zweem |
| 4 Kap en gambeson | Gedaan: geometrie met ruiten, ook op de mouwen. De stikselnaad is licht aangezet |
| 5 Tabberd | Gedaan: vierendelen, voor- en achterpand volgen dezelfde kant, zoom met stiksel, split. Weinig plooien bovenaan |
| 6 Riem en buidel | Gedaan: riem, grote gesp met pen, buidel met klep en knoop, eigen bot dat meezwaait |
| 7 Handschoenen | Gedaan: vuist om de speer, duim, polsrand. Geen stiksels |
| 8 Broek en benen | Gedaan, eenvoudig |
| 9 Laarzen | Gedaan: omslag, band met gesp, dikke zool, ronde neus |
| 10 Speer | Gedaan: rechte schacht, tule met ringen, blad met middenrib, eindkap. Dikte 6 cm in plaats van 4,5: dat is de plaat |
| 11 Geometrie | Dicht model voor de sprites (1,4 miljoen driehoeken), 38.681 in de GLB, met UV-kaart |
| 12 Materialen | Principled BSDF, gedeeld, met geschilderde verf; zie "Wat nog niet voldoet" |
| 13 Rig | Volledig, met speer- en buidelbot. **Geen vingerbotten**: de vuist is één vorm, wat voor nu kan omdat hij de speer altijd vasthoudt |
| 14 Camera | 12 graden voor de beoordeling; 30, 35,264 en 40 getest, 30 gekozen voor het spel |
| 15 Licht | Warme zon linksboven, kleurige hemel, zwak randlicht, reproduceerbaar in `instellingen.json` |
| 16 Output | Acht richtingen, close-ups, materiaaloverzicht, spelrender, `.blend`, GLB en dit rapport |
| 17 Acceptatie | Aan Marcel |

## Metingen

**Beelden per loopcyclus** (`bewijs/loop-8-12-24-beelden.mp4`). De voet maakt tijdens de zwaai 18 pixels op spelmaat.

| Beelden | Pixels per beeld tijdens de zwaai | Vel |
|---|---|---|
| 8 | ongeveer 5,3 | 680 x 1128 |
| **12 (gekozen)** | ongeveer 3,6 | 1020 x 1128 (0,9 MB) |
| 24 | ongeveer 1,8 | 2040 x 1128 |

Conclusie: 8 kan, 12 is merkbaar rustiger en past nog goed; 24 voegt op spelmaat weinig toe voor twee keer zoveel geheugen. In het spel
duurt een cyclus zo'n 0,46 s (bij 1,5 tegels per seconde), dus 12 beelden is 26 per seconde.

**Renderresolutie.** 768 pixels op 3 m is 3,9 keer de spelmaat; eerdere metingen (ronde 13) lieten zien dat er boven zo'n 4,5 keer niets meer bij komt. Het
voorgestelde startpunt van 256 pixels per beeld is als eindmaat te veel en als bron te weinig: de cel is 85 bij 141 pixels, het geheel op 80
pixels lengte.

## Eerlijk over de tests

- De controles meten of iets kapot is, niet of het mooi is. Dat geldt ook voor de glijtoets, die de snelheid van de voet vergelijkt met de bedoelde snelheid.
- Het spel is getest met een opstelling in de browser (`inspel.js`), niet met een echte wissel. De soldaten stonden op plekken die ik heb gezet, en de loopfilm
  is beeld voor beeld opgenomen en niet realtime gespeeld.
- **Niet gemeten:** wat de nieuwe vellen kosten in beeldsnelheid in Firefox (een afspraak in `CLAUDE.md`). Het loopvel is 2,2 keer zoveel pixels als het oude, en staan 10 keer (4 beelden in plaats van 1). Dat moet nog voor het echt in het spel gaat.
- **Reproduceerbaar:** twee keer `vel` geeft een vel met dezelfde MD5. De renders zelf zijn niet zo vergeleken; Cycles draait met een vast zaad, maar de ruisfilter kan per run licht verschillen.
- `npm test`: 1084 van 1084 groen, in deze werkmap. De toetsen raken de stijlpijplijn niet: die staat buiten het spel.
- De GLB is versimpeld: groot is hij minder fijn dan de sprites, en de sprites komen dus uit het dichte model. Ik heb hem opnieuw ingelezen en gerenderd in Blender, niet in een andere engine.
- Aanvallen en sterven zijn niet gemaakt (de opdracht: stoppen na de loop). De specificatie vroeg om een blockout vóór de afwerking: die is getoond, en Marcel koos A.
