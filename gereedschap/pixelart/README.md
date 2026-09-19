# Pixel art uit code

De HD-pixel art van Aardschok wordt niet getekend maar gerenderd. Elke figuur en elk voorwerp is
een klein 3D-model. De renderer fotografeert het uit acht kijkrichtingen en brengt het daarna
terug tot pixel art: vaste kleurrampen, harde randen, een donkere omlijning, licht van linksboven
en weinig dithering. Zo kloppen de acht kanten altijd met elkaar, en kunnen er later
loopanimaties bij. Fallout en Diablo maakten hun poppetjes op dezelfde manier.

Maten zoals in het spel: een tegel is 64×32, een muur 128 pixels hoog, de tovenaar zo'n 88.

```bash
npm run pixelart
```

Dat schrijft alle beelden naar `uit/` (niet in git). Er zijn geen afhankelijkheden, alleen Node.

## Bestanden

- `kern.cjs`: het palet, de camera en de renderer. Muren en vloeren zijn dozen met een textuur
  per pixel; figuren en voorwerpen zijn afstandsfuncties (SDF). Verder: licht, omlijning,
  terugbrengen tot vaste kleuren, en PNG.
- `figuren.cjs`: bouwstenen en de tovenaar, die met de jaren krommer wordt, een langere baard
  krijgt en een hoed waarvan de punt omzakt.
- `figuren2.cjs`: Wim, het skelet en de slijmkruiper.
- `voorwerpen.cjs`: tafel, fontein, kist, ton, zak, wandrek, wandlamp, puin, sleutel, vuurschicht.
- `kamers.cjs`: stenen, vloeren, deuren, ramen, het wandkleed, de hal en de voorraadkamer, en
  het zonlicht door het glas-in-lood.
- `portret.cjs`: hoofd en schouders voor het gesprek en het leeftijdspaneel.
- `export.cjs`: alles wegschrijven. `bekijk.cjs`: één figuur vergroot, om details te beoordelen.

## Afspraken

- Eenheden: één eenheid breed is één pixel, één eenheid hoog is 0,866 pixel. Een tegel is 45,25
  eenheden. Lokale assen van een model: x naar rechts, y naar voren, z omhoog; de voeten staan op
  z = 0, midden op de tegel.
- Een model bestaat uit delen: `{ f, g, m, deel, k, uit }`. Dat is de afstandsfunctie, de
  grensbol, het materiaal, het deelnummer voor binnenlijnen, de zachte naad, en of het deel iets
  wegsnijdt. Een materiaal is `{ ramp, lo, hi, patroon, glans, gloei, detail }`.
- Texturen geven hele stappen in een ramp; alleen licht maakt tussenwaarden. Dan wordt er alleen
  gedithered waar het licht van tint verandert, en blijven stenen en planken schoon.
