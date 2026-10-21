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

Nog te bouwen, als de eerste beelden er zijn: het groen eruit (op kleur, met een rand), elk poppetje in een rij los (op
de doorzichtige kolommen), op maat (de hoogte van een man naar onze HD-maat), het anker op de voeten, de richtingen in
de volgorde van het spel (Z, ZW, W, NW, N, NO, O, ZO), gespiegeld waar het ontbreekt, en naar `beelden/` met de
beschrijving zoals `naar-spel.cjs` die nu maakt. De eerste: de speerman, uit de negen soldaten van de plaat
(`soldatenhd.cjs`, `uit/soldatenhd/plaat/blauw-<n>.png`: het vaandel en het blad weg, het rood blauw).

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

Marcel: "ok, goed idee. geef me een duidelijk prompt". Met zijn plaat erbij als voorbeeld, en vanaf de tweede vraag ook
het eerste vel (de maatstaf). Gekozen bij het schrijven: staan is één beeld (het ademen maken wij, een pixel op en neer),
de richtingen heten naar het kompas, en het wapen zit in het vel (per soort soldaat een eigen vel). De speerman zelf:
staand de speer rechtop in de rechterhand, lopend schuin met twee handen, en stekend met twee handen (Marcel: "Bij
stilstaan 1 hand recht, lopen 2 handen en steken ook"); speer en harnas, geen schild.

1. **Staan, acht richtingen:**

   > Use the attached image as the reference for style, proportions and character. Draw the same medieval foot soldier as
   > in the attached image, now as a village spearman: the same face, steel kettle hat, mail coif, brown padded sleeves,
   > leather gloves, belt with pouch, brown boots and body proportions, but with a quartered deep blue and golden yellow
   > tabard worn over brown leather armour. He carries a long wooden spear with a leaf-shaped iron spearhead, about one and
   > a half times his height. No shield, no banner, no other weapons. Pose: standing at rest, the spear upright in his
   > right hand with the butt on the ground, his left arm relaxed. Show him in 8 directions in one row, left to right in
   > this order: facing south (towards the viewer), south-west (down-left), west (left), north-west (up-left, seen from
   > behind at three-quarters), north (away from the viewer, his back), north-east (up-right), east (right), south-east
   > (down-right). Every figure exactly the same size: about 220 pixels from the soles of his boots to the top of his
   > helmet. Feet on one baseline, at least 40 pixels of empty space between the figures, nothing overlapping. Style:
   > high-definition hand-painted pixel art exactly like the attached image: isometric three-quarter view from above, warm
   > light from the upper left, dark outlines, a crisp pixel grid, no blur. Background: plain flat magenta (#FF00FF). No
   > ground shadow, no text, no labels, no measurement lines, no frame.

2. **Lopen, één richting per vel** (acht keer):

   > Use the attached sheet as the reference for the character, the scale and the style. A walk cycle of this spearman
   > facing south-west (down-left): 8 frames in one row, left to right in order, the last frame flowing back into the
   > first. While walking he holds the spear diagonally across his body with both hands: his right hand low at the hip,
   > his left hand higher in front of his chest, the spearhead pointing up and forward. Every frame exactly the same scale
   > as the standing figures in the attached sheet, each in an equal-sized cell, his feet on one baseline, centered in the
   > cell, at least 40 pixels of space between frames. The same high-definition pixel art style, plain flat magenta
   > background (#FF00FF), no ground shadow, no text, no labels, no frame.

3. **Aanvallen, één richting per vel:**

   > Use the attached sheets as the reference for the character, the scale and the style. An attack animation of this
   > spearman facing south-west (down-left): 8 frames in one row, left to right in order: ready stance with the spear held
   > diagonally in both hands, drawing back, thrusting forward, full extension, holding, pulling back, recovering, back to
   > the ready stance. Every frame exactly the same scale as the attached sheets, equal-sized cells, feet on one baseline,
   > at least 40 pixels of space between frames. The same high-definition pixel art style, plain flat magenta background
   > (#FF00FF), no ground shadow, no text, no labels, no frame.

4. **Vallen, één richting per vel:**

   > Use the attached sheets as the reference for the character, the scale and the style. This spearman facing south-west
   > (down-left) is hit and falls: 7 frames in one row, left to right in order: hit and flinching, staggering back, knees
   > buckling, falling, hitting the ground, settling, and the last frame lying still on the ground with the spear beside
   > him. Every frame exactly the same scale as the attached sheets, equal-sized cells, at least 40 pixels of space between
   > frames. The same high-definition pixel art style, plain flat magenta background (#FF00FF), no ground shadow, no text,
   > no labels, no frame.

**Erbij** (21 okt, na de eerste vellen: in de aanval raakten de speren de buurbeelden, en in staan NW had hij twee
speren). Bij elke beweging, achteraan de vraag:

> Leave generous empty space between the frames: the frames must never touch or overlap. Every frame, including the
> spear at full extension, stays completely inside its own equal-width column, with at least 60 pixels of empty magenta
> between neighbouring frames. Make the sheet wide enough for this.

En een beeld laten overdoen (hier staan NW):

> Redraw only the north-west figure (facing up-left, seen from behind at three-quarters) of the attached sheet: he holds
> ONE spear, upright in his right hand, the butt on the ground; his left hand is empty and relaxed at his side. Exactly
> the same character, scale and style as the attached sheet, plain flat magenta background (#FF00FF), no ground shadow,
> no text.

## De inventaris

(volgt: de gebouwen, de mensen, de dieren en karren, en de rest, met wat de demo nodig heeft eerst)
