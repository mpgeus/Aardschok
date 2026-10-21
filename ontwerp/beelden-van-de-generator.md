# De beelden van de generator (werklijst Q, f; vraag 180)

Marcel, 21 okt 2026, na een dag met de eigen pijplijn (SDXL lokaal; `beeld.md`, "De soldaten van het dorp en de
poppetjes met SDXL"): de soldaat uit zijn plaat (`voorbeelden/heerstoet-doel.webp`, gemaakt met een andere generator)
was helderder dan alles wat SDXL hier maakte, en img2img eroverheen maakte hem slechter. Zijn vraag: "stel ik laat de
generator die dit hoofdbeeld heeft gemaakt, losse onderdelen van deze soldaten maken? Kunnen we die dan als basis
gebruiken en belangrijker, levert dit een beter resultaat op?" En daarna, het besluit: **"Ok, dan zullen we moeten
inventariseren welke gebouwen en poppetjes we nodig hebben. Dan kunnen we de andere generator deze 1 voor 1 laten maken.
Jij moet dan zorgen dat ze passend worden in het spel."**

Dat is W1 van vraag 180 (beelden van een beeld-AI als bron). Op 19 okt zei Marcel nog: "Ik wil niet steeds gpt moeten
gebruiken"; nu leunt alleen de bron op die generator, en de rest doen wij.

## Wie wat doet

- **Marcel** laat de generator elk ding één voor één maken, met de vaste vraag hieronder, en zet het beeld in
  `gereedschap/pixelart/bron/<soort>/<naam>.png` (of zegt waar het staat).
- **Claude** zorgt dat het in het spel past: uitknippen, de achtergrond doorzichtig, op de maat van het spel (de HD-sprite
  van 2×), het anker op de voeten (of de voet van het gebouw op het raster), de vellen en de beschrijving voor het spel,
  en waar nodig omkleuren (de livrei: blauw en goud voor het dorp, rood en geel voor de heer), spiegelen (de richtingen
  die ontbreken) en de restjes weg. En de controle: past het naast de rest (maat, licht, kleur), en klopt elk beeld van
  een animatie met de vorige.
- **Wat de generator niet goed kan** (een loopcyclus die beeld voor beeld klopt), vangen wij op: het bovenlijf uit zijn
  staande beeld, en per stap alleen de benen geschilderd met onze eigen pijplijn (`soldatenhd.cjs benen`; dat werkte).

## De vaste vraag aan de generator

Per ding één vraag, in het Engels (dat volgt hij het best), met zijn plaat erbij als voorbeeld van de stijl. De vaste
delen:

- **Stijl:** "in exactly the same style as the attached image: high-definition hand-painted pixel art, isometric
  three-quarter view from above, warm light from the upper left, dark outlines, rich but readable detail".
- **Achtergrond:** "on a plain flat solid green background (#5A7A3A), no ground shadow, no gradient, no scenery, no text".
- **Maat:** "same scale as the soldiers in the attached image" (die zijn ongeveer onze HD-maat: een man van zo'n 190
  pixels van helm tot voeten).
- **Voor een poppetje, staan:** "the same character shown in 8 directions in one row, evenly spaced, not overlapping:
  facing down, down-left, left, up-left, up (seen from behind), up-right, right, down-right". Lukt acht niet goed, dan vijf
  (omlaag, linksonder, links, linksboven, omhoog): de andere drie spiegelen wij.
- **Voor een poppetje, een beweging** (lopen, steken, vallen, een werk): "a sprite sheet of the same character
  [walking / thrusting with a spear / falling], [8] frames in one row, facing [down-left], each frame the same size, feet
  on the same baseline". Eén richting per vel.
- **Voor een gebouw:** "a single [building], seen from the same isometric angle, on a footprint of [n by m] tiles, the
  whole building visible, no people, no surrounding ground". Varianten (in aanbouw, met sneeuw, afgebrand) als losse
  beelden van hetzelfde gebouw, met "the same building as in the previous image".

## Wat wij ermee doen (het gereedschap)

`gereedschap/pixelart/generator.cjs` (`code.md`): het magenta eruit, elk poppetje in een rij los, per vel op maat (het
lijf zonder de speer gemeten, naar 74 pixels tot de helm), de kleur per stof gelijk aan die van het staande vel, het
anker op de voeten, de richtingen in de volgorde van het spel (Z, ZW, W, NW, N, NO, O, ZO; niet gespiegeld: een richting
die er nog niet is, staat voorlopig stil), en via `naar-spel.cjs --alleen speerman` naar `beelden/`.

## De eisen voor de poppetjes

Marcel, 21 okt, bij het eerste vel van de generator (de soldaat van de heer zonder wapens: staan in acht richtingen,
lopen in vier, met maatlijnen en labels; `gereedschap/pixelart/bron/soldaten/basis-1.webp`): "voordat we dingen aanpassen
eerst even duidelijke eis voor de poppetjes". De getallen komen uit het spel zoals het nu is (`beelden/beschrijving.json`,
`gereedschap/pixelart/werkfiguren.cjs`).

**1. Eén persoon, overal dezelfde.** Dezelfde kleren, kleuren, uitrusting en bouw in elke richting en elk beeld. Een
nieuw vel van dezelfde persoon krijgt het vorige vel erbij als voorbeeld ("the same character as in the attached sheet").

**2. Acht richtingen**, in deze volgorde en met deze namen (de kijker staat in het zuiden):

| | richting | hij kijkt |
|---|---|---|
| Z | zuid | naar ons toe, recht omlaag |
| ZW | zuidwest | schuin naar linksonder |
| W | west | naar links |
| NW | noordwest | schuin naar linksboven (we zien zijn rug schuin) |
| N | noord | van ons af, recht omhoog (we zien zijn rug) |
| NO | noordoost | schuin naar rechtsboven |
| O | oost | naar rechts |
| ZO | zuidoost | schuin naar rechtsonder |

Niet spiegelen: een gevierendeelde wapenrok en een wapen in één hand verwisselen dan van kant.

**3. De maat.** In het spel is een volwassen man zo'n 66 pixels tot de kruin; de HD-maat (besloten: een sprite van 2×,
`hd-resolutie.md`) is twee keer zo groot. De generator tekent **ruim** (een man zo'n 200 tot 250 pixels hoog), en **alle
vellen op dezelfde maat**: het eerste vel is de maatstaf, elk volgend vel krijgt het erbij ("exactly the same scale as the
attached sheet"). Wij verkleinen naar het spel. De verhoudingen tussen de mensen (uit het spel, tot de bovenkant van het
hoofd of de hoed):

| wie | t.o.v. een man |
|---|---|
| man (boer, aanvoerder, inner) | 1 |
| vrouw | 0,9 |
| oude man, oude vrouw | 0,95 (iets gebogen) |
| jongen | 0,77 |
| meisje | 0,69 |
| kleuter | 0,65 |
| soldaat (met helm) | 1,05; het wapen mag erboven uitsteken |
| de heer | 0,92 (klein en dik, met een te grote hoed) |

**4. Het vel.**
- Eén beweging in één richting per rij; alle beelden van die beweging op die rij, van links naar rechts in de goede
  volgorde. Het liefst één richting per vel, of twee, zodat de poppetjes groot blijven.
- Elk beeld in een even groot vak, met ruimte ertussen; niets overlapt; de voeten in elk vak op dezelfde hoogte en de
  persoon in het midden (dan blijft hij bij het lopen op zijn plek).
- Staan en bewegen op dezelfde maat (in het eerste vel was lopen half zo groot).
- Geen tekst, labels of maatlijnen in het beeld. Een titel mag erboven, maar los van de rij.

**5. De achtergrond:** effen magenta (#FF00FF), zonder verloop en zonder schaduw op de grond (die tekent het spel zelf).
Magenta, omdat dorpelingen ook groen dragen.

**6. De stijl:** zoals de plaat van de heerstoet: HD pixel art, van schuin boven gezien (dezelfde hoek als de plaat), licht
van linksboven, donkere omlijning, rijk maar leesbaar detail, en een strak pixelraster (geen vage randen).

**7. De bewegingen**, met het aantal beelden dat het spel nu gebruikt (een cyclus: het laatste beeld loopt over in het
eerste):

| wie | beweging | beelden | snelheid |
|---|---|---|---|
| iedereen | staan (rustig ademen) | 4 | 4 per seconde |
| iedereen | lopen | 8 | 10 per seconde |
| boer en boerin | maaien, zaaien, wieden, hakken, plukken, binden, zagen | 12 | 8 per seconde |
| boer en boerin | dorsen | 12 | 10 per seconde |
| boer en boerin | rapen (sprokkelen) | 16 | 8 per seconde |
| boer en boerin | dragen (lopen met een zak) | 8 | 10 per seconde |
| soldaten, aanvoerder | aanvallen (steken, slaan, schieten) | 8 (voorstel) | 10 per seconde |
| soldaten, aanvoerder | vallen, en dan liggen | 6 + 1 (voorstel) | 8 per seconde |

Aanvallen en vallen bestaan in het spel nog niet als tekening; die komen er met deze vellen bij.

**8. Levering:** PNG of WebP, in `gereedschap/pixelart/bron/<soort>/` met een naam als `<wie>-<beweging>-<richting>.png`
(bijvoorbeeld `speerman-lopen-ZW.png`), of laat het mij weten en ik zet het daar.

**Nog te kiezen** (Marcel):
- **Wapens los of erin?** Een lijf en de wapens als losse onderdelen (dan moet elk wapen dezelfde acht richtingen en
  dezelfde beelden hebben, zodat het precies in de hand valt), of per soort soldaat een eigen vel met het wapen erin
  (eenvoudiger en zekerder; zo doet Knights and Merchants het). Voorstel: per soort een eigen vel.
- **Hoeveel uiterlijken voor de dorpelingen?** Nu 108 (24 boeren, 24 boerinnen, en 12 van elk ander lijf). Voorstel van
  vraag 180: zo'n 12 in plaats van 72 voor de volwassenen.
- **Minder beelden voor het werk?** 12 en 16 beelden per richting is veel voor de generator; 8 kan ook (het spel past de
  snelheid aan).

## De vragen voor de speerman (21 okt)

Marcel: "ok, goed idee. geef me een duidelijk prompt", en daarna: "de prompten even aanpassen dat alles erin zit, nu moet
ik 2 dingen kopieren". Elke vraag is één blok; bij een beweging vervang je alleen de richting. Gekozen bij het schrijven:
staan is één beeld (het ademen maken wij, een pixel op en neer), de richtingen heten naar het kompas, en het wapen zit in
het vel (per soort soldaat een eigen vel). De speerman: staand de speer rechtop in de rechterhand, lopend schuin met twee
handen, en stekend met twee handen (Marcel: "Bij stilstaan 1 hand recht, lopen 2 handen en steken ook"); speer en
harnas, geen schild. Erin verwerkt (21 okt, na de eerste vellen): ruimte tussen de beelden (de speren raakten de
buurbeelden), één speer (staan NW had er twee), en uit de correctie die GPT meegaf bij de aanval: de speer met twee
handen, de punt altijd vooruit, nooit van kant wisselen en niet over het hoofd.

De richtingen, in plaats van "south-west (down-left)": Z south (towards the viewer), ZW south-west (down-left), W west
(left), NW north-west (up-left, seen from behind at three-quarters), N north (away from the viewer, his back), NO
north-east (up-right, seen from behind at three-quarters), O east (right), ZO south-east (down-right).

1. **Staan, acht richtingen:**

   > Use the attached image as the reference for style, proportions and character. Draw the same medieval foot soldier as
   > in the attached image, now as a village spearman: the same face, steel kettle hat, mail coif, brown padded sleeves,
   > leather gloves, belt with pouch, brown boots and body proportions, but with a quartered deep blue and golden yellow
   > tabard worn over brown leather armour. He carries ONE long wooden spear with a leaf-shaped iron spearhead, about one
   > and a half times his height. No shield, no banner, no second spear, no other weapons. Pose: standing at rest, the
   > single spear upright in his right hand with the butt on the ground, his left hand empty and relaxed. Show him in 8
   > directions in one row, left to right in this order: facing south (towards the viewer), south-west (down-left), west
   > (left), north-west (up-left, seen from behind at three-quarters), north (away from the viewer, his back), north-east
   > (up-right), east (right), south-east (down-right). Every figure exactly the same size: about 220 pixels from the soles
   > of his boots to the top of his helmet, feet on one baseline. Leave generous empty space between the figures: they must
   > never touch or overlap. Every figure, including the spear, stays completely inside its own equal-width column, with at
   > least 60 pixels of empty magenta between neighbouring figures. Make the sheet wide enough for this. Style:
   > high-definition hand-painted pixel art exactly like the attached image: isometric three-quarter view from above, warm
   > light from the upper left, dark outlines, a crisp pixel grid, no blur. Background: plain flat magenta (#FF00FF). No
   > ground shadow, no text, no labels, no measurement lines, no frame.

2. **Eén staand beeld opnieuw (hier NW):**

   > Redraw only the north-west figure (facing up-left, seen from behind at three-quarters) of the attached sheet: he holds
   > ONE spear, upright in his right hand with the butt on the ground; his left hand is empty and relaxed at his side. No
   > second spear. Exactly the same character, scale and style as the attached sheet: high-definition hand-painted pixel
   > art, isometric three-quarter view from above, warm light from the upper left, dark outlines, a crisp pixel grid. Plain
   > flat magenta background (#FF00FF), no ground shadow, no text, no labels, no frame.

3. **Lopen, één richting per vel:**

   > Use the attached sheet as the reference for the character, the scale and the style. A walk cycle of this spearman
   > facing south-west (down-left): 8 frames in one row, left to right in order, the last frame flowing back into the
   > first. While walking he holds the spear diagonally across his body with both hands: his right hand low at the hip, his
   > left hand higher in front of his chest, the spearhead pointing up and forward in the direction he walks. Every frame
   > exactly the same scale as the standing figures in the attached sheet (about 220 pixels from boots to helmet), each in
   > an equal-sized cell, his feet on one baseline, centered in the cell. Leave generous empty space between the frames:
   > the frames must never touch or overlap. Every frame, including the spear, stays completely inside its own equal-width
   > column, with at least 60 pixels of empty magenta between neighbouring frames. Make the sheet wide enough for this. The
   > same high-definition pixel art style: isometric three-quarter view from above, warm light from the upper left, dark
   > outlines, a crisp pixel grid. Plain flat magenta background (#FF00FF), no ground shadow, no text, no labels, no frame.

4. **Aanvallen, één richting per vel:**

   > Use the attached sheets as the reference for the character, the scale and the style. An attack animation of this
   > spearman facing south-west (down-left): 8 frames in one row, left to right in order: ready stance with the spear held
   > diagonally in both hands, drawing the spear back horizontally, thrusting forward, full extension, holding, pulling
   > back, recovering, back to the ready stance. He holds the spear with both hands in every frame. The spearhead always
   > points in the direction he faces; the spear is one straight shaft of constant length and never swaps to the other
   > side of his body or goes over his head. Every frame exactly the same scale as the attached sheets (about 220 pixels
   > from boots to helmet when standing), equal-sized cells, feet on one baseline. Leave generous empty space between the
   > frames: the frames must never touch or overlap. Every frame, including the spear at full extension, stays completely
   > inside its own equal-width column, with at least 60 pixels of empty magenta between neighbouring frames. Make the
   > sheet wide enough for this. The same high-definition pixel art style: isometric three-quarter view from above, warm
   > light from the upper left, dark outlines, a crisp pixel grid. Plain flat magenta background (#FF00FF), no ground
   > shadow, no text, no labels, no frame.

5. **Vallen, één richting per vel:**

   > Use the attached sheets as the reference for the character, the scale and the style. This spearman facing south-west
   > (down-left) is hit and falls: 7 frames in one row, left to right in order: hit and flinching, staggering back, knees
   > buckling, falling, hitting the ground, settling, and the last frame lying still on the ground with the spear beside
   > him. Every frame exactly the same scale as the attached sheets (about 220 pixels from boots to helmet when standing),
   > equal-sized cells. Leave generous empty space between the frames: the frames must never touch or overlap. Every frame,
   > including the spear and the fallen body, stays completely inside its own equal-width column, with at least 60 pixels
   > of empty magenta between neighbouring frames. Make the sheet wide enough for this. The same high-definition pixel art
   > style: isometric three-quarter view from above, warm light from the upper left, dark outlines, a crisp pixel grid.
   > Plain flat magenta background (#FF00FF), no ground shadow, no text, no labels, no frame.

## De masterprompt voor de speerman (21 okt)

Marcel: "Denk je dat we het voor elkaar krijgen om 1 masterprompt te maken voor de speerman, 1 waar alles inzit?" Alles in
één beeld kan niet (bijna 200 poppetjes: te klein, en de man verloopt); wel één prompt die alles vastlegt (de man, de
stijl, de regels en een genummerde lijst van alle vellen), waarna de generator per antwoord één vel maakt en Marcel
"next" typt. Marcel bewaart elk vel met zijn nummer (`01.webp` tot `25.webp`) in
`gereedschap/pixelart/bron/soldaten/speerman/`; het nummer zegt welke beweging en richting het is. Klopt een vel niet:
"redo" met wat er mis is. Verloopt de man in een lang gesprek: vel 1 er opnieuw bij, "keep him exactly like this". Voor
een andere soort soldaat verandert alleen CHARACTER en POSES.

```text
You are producing the complete sprite set for one game character. Follow these rules for every sheet you make in this conversation.

CHARACTER (identical in every sheet): a medieval village spearman, the same foot soldier as in the attached reference image: the same face with a short dark beard, steel kettle hat, mail coif, brown padded sleeves, leather gloves, belt with pouch, brown boots and stocky body proportions, wearing a quartered deep blue and golden yellow tabard over brown leather armour. He carries ONE long wooden spear with a leaf-shaped iron spearhead, about one and a half times his height. No shield, no banner, no second spear, no other weapons, no rivets, no sash.

STYLE: high-definition hand-painted pixel art exactly like the attached reference image: matte colours, not glossy, not plastic, no shiny highlights, no 3D render look; isometric three-quarter view from above, warm light from the upper left, dark outlines, a crisp pixel grid, no blur.

TECHNICAL RULES (every sheet):
- Plain flat magenta background (#FF00FF). No ground shadow, no text, no labels, no numbers, no measurement lines, no frame.
- All figures at exactly the same scale in every sheet: about 220 pixels from the soles of his boots to the top of his helmet when standing.
- Frames in one row, left to right in order, each in an equal-width cell, feet on one baseline, centered in the cell.
- Generous empty space: frames never touch or overlap; every frame, including the spear at full extension or a fallen body, stays completely inside its own column, with at least 60 pixels of empty magenta between neighbouring frames. Make the sheet as wide as needed.

DIRECTIONS (the viewer is in the south):
S = facing south, towards the viewer. SW = facing down-left. W = facing left. NW = facing up-left, seen from behind at three-quarters. N = facing away from the viewer, his back. NE = facing up-right, seen from behind at three-quarters. E = facing right. SE = facing down-right, towards the viewer: we see his face, his beard and the front of his tabard.

POSES:
- Standing: at rest, the spear upright in his right hand with the butt on the ground, his left hand empty and relaxed. Seen by the viewer, his right hand (and the spear) is on the left of his body in S, SW and SE, and on the right in N, NE and NW.
- Walking: 8 frames, a looping walk cycle (the last frame flows into the first). He holds the spear diagonally across his body with both hands: right hand low at the hip, left hand higher in front of the chest, the spearhead pointing up and forward in the direction he walks: to the left of the sheet when he walks W, SW or NW, to the right when he walks E, SE or NE.
- Attacking: 8 frames: ready stance with the spear diagonally in both hands, drawing the spear back horizontally, thrusting forward, full extension, holding, pulling back, recovering, back to ready. Both hands on the spear in every frame; the spearhead always points in the direction he faces; the spear is one straight shaft of constant length that never swaps to the other side of his body and never goes over his head.
- Dying: 7 frames: hit and flinching, staggering back, knees buckling, falling, hitting the ground, settling, lying still on the ground with the spear beside him.

THE SHEETS, one per reply, in this order:
1. Standing in all 8 directions, in one row in this order: S, SW, W, NW, N, NE, E, SE.
2. Walking S.   3. Walking SW.   4. Walking W.   5. Walking NW.   6. Walking N.   7. Walking NE.   8. Walking E.   9. Walking SE.
10. Attacking S.   11. Attacking SW.   12. Attacking W.   13. Attacking NW.   14. Attacking N.   15. Attacking NE.   16. Attacking E.   17. Attacking SE.
18. Dying S.   19. Dying SW.   20. Dying W.   21. Dying NW.   22. Dying N.   23. Dying NE.   24. Dying E.   25. Dying SE.

Make sheet 1 now. After each sheet, wait until I say "next", then make the next sheet in the list. From sheet 2 on, use sheet 1 as the reference for the character and the scale, so he stays exactly the same. If I say "redo" with a remark, make the same sheet again with that correction.
```

## De eerste vellen van de masterprompt (21 okt)

Marcel stuurde vel 1 (staan) en lopen in zeven richtingen: Z, ZW, W, NW, N, NO en O. Ze staan als `01.webp` tot
`08.webp` in `bron/soldaten/speerman/` (webp met kwaliteit 92, zo'n 180 KB per vel, in plaats van de png van de
generator van 1,7 MB; op spelmaat is het verschil ruis) en lopen in het spel. Wat opviel, en wat ermee is gedaan:

- **De maat verschilt per vel**, tot een vijfde: lopen O is 337 pixels van helm tot zool, staan 424. Daarom meet
  `generator.cjs` elk vel zelf (`maatVan`). Ook de oude aanval en het oude vallen (ZW) staan nu op maat: die waren
  kleiner getekend, en werden met één vaste maat kleiner dan de staande man.
- **NW, N, NO en O zijn oranjer en glimmender getekend** dan het staande vel (het geel naar oranje, het leer roodbruin).
  Opnieuw vragen hoeft niet: `kleurGelijk` trekt per stof (staal, geel, blauw, leer) de kleur gelijk met het staande vel,
  en op spelmaat valt de glans weg.
- **Meer keer gekomen:** NO twee keer, O vier keer en nog eens met de speer laag vooruit, N ook met de speer rechtop.
  Gekozen: de speer schuin met twee handen, zoals gevraagd.
- **Bij ZW en W wijst de punt naar achteren** (schuin omhoog naar rechts, terwijl hij naar links loopt); bij NW, NO en O
  wijst hij vooruit. In de masterprompt staat de kant er nu bij. Opnieuw vragen: "redo 3: the spearhead must point up and
  to the left, forward in the direction he walks, not backwards over his shoulder", en zo ook "redo 4".
- **Bij staan NW en ZO houdt hij de speer in zijn linkerhand** (de speer springt van kant als hij draait). Klein op
  spelmaat; vel 1 opnieuw vragen verandert ook het voorbeeld voor de maat en de kleur van alle andere, dus dat laten we.
  In de masterprompt staat nu aan welke kant de speer staat.
- **Nog te maken:** 10 tot 17 (aanvallen) en 18 tot 25 (vallen). Tot dan vallen de aanval en het vallen terug op de
  oude vellen van ZW. Vel 9 (lopen ZO) kwam in het nieuwe gesprek goed (hieronder), dus hij loopt in alle acht richtingen.
- **Vel 9 verliep** (21 okt): de richting klopte, maar het was een andere man (een sjerp, klinknagels, een geplooide rok,
  geen baard) en glimmend als een 3D-render. Kleur en maat trekt `generator.cjs` gelijk, andere kleren niet. Daarom
  **een nieuw gesprek** als de man verloopt: vel 1 en vel 2 (`01.webp`, `02.webp`, de twee die goed zijn) erbij in plaats
  van de plaat, de masterprompt met in CHARACTER "exactly the man in the two attached sheets" en "the same scale as in
  the attached sheets", en als slot: "The attached sheets are sheet 1 (standing in all 8 directions) and sheet 2 (walking
  S); they are correct. Make sheet 9 now. After each sheet, wait until I say "next", then make the next sheet in the
  list. Always use the attached sheets as the reference for the character, the style and the scale, so he stays exactly
  the same." De regels mat, geen klinknagels en geen sjerp staan sindsdien ook in de masterprompt hierboven. Het werkte:
  vel 9 kwam daarna als dezelfde man, mat en met baard (Marcel: "Deze lijkt goed te werken").
- **Vel 10, aanvallen Z** (21 okt): eerst wisselde de speer drie keer van kant en stak hij recht naar beneden (op
  spelmaat leek het zwaaien en in de grond prikken). Recht naar de kijker steken is van voren lastig; met deze redo werd
  het leesbaar: "redo 10: Attacking S, with one clear thrust towards the viewer. The spear stays on one straight diagonal
  line in all 8 frames: the butt behind his right hip (on the left of the sheet), the spearhead in front of him,
  pointing down and to the right of the sheet, towards the viewer, so the whole spear stays visible. Both hands on the
  shaft in every frame. The spear never swaps to the other side, never turns around, never points up, and never points
  straight down into the ground. Frames: 1 ready, 2 drawing the spear back along the line, 3 thrusting forward, 4 full
  extension (arms stretched, the spearhead far forward), 5 holding, 6 pulling back, 7 recovering, 8 exactly the same as
  frame 1, so it loops." De punt gaat op spelmaat 13 pixels vooruit en blijft aan het eind uitgestoken; na de klap
  staat hij weer. Maar (Marcel: "Maar is dit nu echt Zuid?"): zijn lijf staat naar het zuiden, de speer wijst zo'n 45
  graden naar rechtsonder, half naar ZO. Met een steilere hoek ("about 20 degrees from straight down", de punt laag voor zijn
  voeten) kwam hij goed: echt zuid. Die steekt onder zijn voeten uit, en daarom zoekt `generator.cjs` de voeten nu zonder
  het staal, en volgen de aanval en het vallen de maat van het lopen (naar de helm): gebukt werd hij anders 15% groter.
- **Vel 11, aanvallen ZW** (21 okt): meteen goed (de speer op één lijn naar linksonder, beeld 8 weer de klaarstand). De
  generator tekende hem kleiner (de helm 89 tegen 107 bij lopen ZW); daarom wordt de helm dichtgemaakt voor hij gemeten
  wordt (de donkere ribben knipten hem in tweeën). En de punt van beeld 5 raakte de laars van beeld 4: een dun stuk gaat
  nu naar het beeld waar het met zijn hout het langst aan grenst, niet met het staal van de punt.
- **Vel 12, aanvallen W** (21 okt): goed (horizontaal, op één lijn, in beeld 4 ver uit), maar de vakken ongelijk breed
  (beeld 2 en 3 op elkaar, tot 44 pixels scheef), zodat de man op het midden van zijn vak heen en weer sprong. Een
  aanval staat daarom op zijn voeten (`anker: 'voeten'`): het eerste beeld met zijn lijf op het anker, zoals wie loopt,
  en de andere zoals de voeten schuiven (bij W nu 5 pixels heen en weer, eerst 28).
- **Vel 13, aanvallen NW** (21 okt): meteen goed, van achteren, de speer op één lijn naar linksboven. In beeld 1 en 8
  is zijn rechtermouw licht, bijna wit (zo getekend); op spelmaat een lichte vlek op de arm.
- **Vel 14, aanvallen N** (21 okt): eerst hief hij de speer boven zijn hoofd en wisselde hij van kant. Goed werd het met:
  "redo 14: Attacking N again, as one clear thrust away from the viewer, like the Attacking S sheet (sheet 10) but seen
  from behind. His hands stay low on the shaft, at his hips and chest, never above his shoulders, and he never lifts the
  spear over his head. The spear stays on one straight line in all 8 frames: the butt at his right hip (on the right of
  the sheet), the spearhead pointing up and slightly to the left of the sheet, about 20 degrees from straight up,
  passing beside his helmet on the left, never hidden behind it. [...] Matte colours exactly like the attached reference
  sheets, not glossy." Hij is nog wel glimmend; de kleur trekt `generator.cjs` gelijk. Maar (Marcel: "Maar noord is toch
  recht omhoog?"): de speer wees zo'n 30 graden naar links, half naar NW. Recht omhoog werd het met: "redo 14: Attacking
  N again, keep everything of the last version, but the spear points straight up, exactly vertical, away from the
  viewer: held at the right side of his body (his right hand side, on the right of the sheet), so it rises beside his
  helmet on the right, never behind or over the helmet. The spear stays vertical and on that same line in all 8 frames,
  it only slides up and down along that line for the thrust; frame 8 is exactly the same as frame 1." Bij een richting
  recht naar of van de kijker: de speer aan de kant van zijn hand, recht, en alleen langs zijn lijn schuivend. Bij N (vel 14), van achteren, speelt hetzelfde: dan de punt
  omhoog, van de kijker af.

## De inventaris

(volgt: de gebouwen, de mensen, de dieren en karren, en de rest, met wat de demo nodig heeft eerst)
