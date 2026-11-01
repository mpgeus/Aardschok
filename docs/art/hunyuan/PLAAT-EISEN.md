# Wat een bronplaat nodig heeft

Marcel, 31 okt: "Ok, dus als ik een beter base plaat aanlever is het beter". Ja. De proeven in `KWALITEITSRAPPORT.md` laten zien dat de plaat de grootste hefboom is: meer stappen of meer meshresolutie gaven geen nieuwe vorm, en dezelfde stappen op een plaat met één pose gaven de grootste sprong. Elke eis hieronder komt uit iets wat in deze proef misging.

## De eisen, belangrijkste eerst

| # | Eis | Wat er nu misgaat |
|---|---|---|
| 1 | **Eén pose in alle richtingen**: handen, voeten en speer precies gelijk | Op `detail` staan de handen in W en O voor de buik, en in O ontbreekt de speer. W en O passen daardoor nergens op |
| 2 | **Eén ontwerp rondom**: dezelfde rokverdeling, tassen op dezelfde plek | `detail` is van voren gekwartierd en van achter in tweeën. `acht` is overal in tweeën, en in O wisselt de kleur onderaan |
| 3 | **De speer in dezelfde hand, op de juiste plek** | Op `acht` staat de speer in ZW, NW en ZO rechts. Een echte draaiing zet hem links of voor het lijf |
| 4 | **Camera op ooghoogte, recht van opzij**: geen hoek van boven, geen perspectief | Het model leest elke plaat als vlak aanzicht. De hoek van 20° wordt een kegel in de mesh: de helmrand hangt en de zolen staan scheef. Dat moet nu achteraf gecorrigeerd worden. Bij een vlakke plaat vervalt die stap |
| 5 | **Armen en speer los van het lijf**: de vrije arm iets naar buiten, de speer een handbreed van lijf en helm, de benen iets uit elkaar | Het model plakt wat elkaar raakt aan elkaar vast: speer aan hand, rok aan benen. Dat kost losse onderdelen en maakt de loop slechter |
| 6 | **Effen achtergrond die niet op de figuur lijkt**: wit of magenta, geen grijs | Staal op grijs: een drempel hapt uit de helm, en de omtrek moet met een omweg worden bepaald |
| 7 | **Geen slagschaduw, geen grond, geen tekst of tegels** | De schaduw bij de voeten telt anders als vorm |
| 8 | **Zacht, gelijkmatig licht**, zonder diepe schaduw onder de helm | Het licht zit in de verf. Hoe harder het is, hoe minder het klopt als de figuur beweegt |
| 9 | **Groot**: de figuur van helm tot zool minstens 900 pixels, per richting een eigen vak of bestand | Nu 341 en 390 pixels. Fijne lijnen op de verf kunnen niet scherper dan de plaat |
| 10 | **Zelfde schaal en voetlijn** in elke richting | Op `acht` verschilt de figuurhoogte per richting: spreiding 7 procent |

Nummer 1 tot en met 5 doen het meest. Bij 6 tot en met 10 volstaat "zo goed mogelijk".

## De plaat van Marcel van 31 okt

`referentie/aardschok-speerman-draai-vrij.png` voldoet aan 1, 2, 5, 6 en 7, en de figuur is met zo'n 545 pixels groter dan op de vorige platen. De camera staat op zo'n 10 graden, dicht bij eis 4. Er zit geen speer op: die komt nu los. Nog niet: 900 pixels. De omtrek van de mesh past daarop voor 79 tot 94 procent, tegen 65 tot 86 op de vorige platen, en de zolen staan vanzelf vlak.

## De platen met alle kanten (31 okt, avond)

`referentie/aardschok-speerman-draai-speer.png` is die van de speerman, en `aardschok-speerman-draai-alle.png` dezelfde man zonder speer. Ze voldoen aan 1, 2, 3 en 4. W en O tonen echt zijn twee kanten, en voor en achter passen bij elkaar; op een plaat daarvoor toonden W en O allebei zijn rechterkant. TripoSplat gebruikt alleen Z en N (`TRIPOSPLAT.md`), dus daar telt de scherpte het meest. De grijze achtergrond en de schaduw haalt BiRefNet er goed uit, dus eis 6 en 7 tellen daar minder. Eis 5 geldt hier anders: de vuist om de speer is juist goed, want dan hoeft de rig die niet te maken.

## De plaat van de boogschutter (1 nov)

`referentie/aardschok-boogschutter-draai.png` werkt, met één ding om na te kijken: **de koker wisselt van schouder** (rechts in Z, ZO en NO, links in ZW, NW en N), en de boog staat in ZW anders dan in de rest. Elk gedragen ding moet in elke richting aan dezelfde kant zitten. Alleen Z en N tellen voor de vorm, en die twee moeten dus zeker kloppen. Het prompt om dat in GPT te herstellen: `prompt-boogschutter.txt`.

## Wat je aanlevert

- **Plaat A (nodig):** Z, W, N en O op ooghoogte, en liefst ook de vier diagonalen. Hier komen de vorm en het grootste deel van de verf uit.
- **Plaat B (mooi, niet nodig):** dezelfde figuur in dezelfde pose vanuit de spelcamera (30°). Daarmee zijn de bovenkant van de helm en de schouders beter te verven. Plaat A ziet die amper.

Zet hem in `docs/art/referentie/`, of los per richting. Dan is er verder niets nodig: het vak per richting en de keten staan klaar (`hy_invoer.py`, `keten_hy_proeven.sh`). De mesh en de bewerkingen kosten samen zo'n 10 minuten.

## Een opdracht om te plakken

Niet getest: dit is een voorstel. Bij een eerdere plaat hielden AI-beelden zich niet altijd aan één pose, dus kijk de eisen 1 tot en met 3 na voor je hem aanlevert.

```text
Character turnaround sheet of one single medieval spearman, stylized stocky game character,
same character design as the attached reference (steel kettle hat with band and rivets,
broad bearded face, blue and yellow quartered tabard, quilted brown sleeves, leather belt
with steel buckle, two leather pouches, tall leather boots with turned-down cuffs).

Eight views in one row: front, front-left, left, back-left, back, back-right, right, front-right.
Orthographic projection, camera exactly at eye level, no perspective, no view from above.
The pose is IDENTICAL in every view, as if the same 3D model rotates on a turntable:
neutral standing pose, legs slightly apart, left arm hanging slightly away from the body,
right hand holding a tall spear upright one hand-width away from the body and the helmet.
The spear is always in his right hand. The tabard pattern and the pouches are the same on every side.

Same scale and same ground line in every view, each figure in its own cell with clear space around it.
Soft even lighting, no cast shadows, no ground plane, no labels, no text.
Plain flat pure white background. Very high resolution, crisp details.
```

## Wat een betere plaat niet oplost

- Het model plakt nog steeds alles tot één stuk. De helm en de speer blijven dus losse onderdelen, en de rok moet nog van de benen af voor een goede loop.
- Fijne vorm (klinknagels, quilt) zit ook dan vooral in de verf.
- Een andere figuur vraagt opnieuw om de maten van zijn harde delen.
