# Beeld

## Besloten

- **HD-pixel art** (19 sep 2026, Marcel: "meer high def, maar wel pixel art"). De eerste pixel art,
  met tegels van 32×16, vond hij te grof.
- **Maten, zoals in het spel:** een tegel is 64×32, een muur 128 pixels hoog. De tovenaar is zo'n
  88 pixels, Wim zo'n 76. Op 1080p toont het spel alles twee keer vergroot.
- **De beelden komen uit code** (`gereedschap/pixelart/`, zie de README daar). Figuren en
  voorwerpen zijn kleine 3D-modellen die uit acht richtingen worden gerenderd en daarna tot pixel
  art worden teruggebracht. Muren en vloeren zijn dozen met een textuur per pixel.
- **Palet:** rampen van donker naar licht, met schaduwen naar paars en licht naar geel.
- **Texturen** geven hele stappen; alleen licht maakt tussenwaarden. Er wordt alleen gedithered
  waar het licht van tint verandert.
- **Licht komt van linksboven,** met een omlijning van één pixel in de donkerste tint van de kleur
  ernaast. Per kamer wordt het licht berekend: lampen, kaarsen, de bol op de staf, en de zon die
  door het glas-in-lood valt.
- **Stijl van Mystic Towers.** De kamer staat als een diorama in het donker, en de voorste muren
  zijn laag weggesneden.

## Ontwerpcanvas

https://claude.ai/artifact/K4frzQ2o5Ak3owGhA4AJms (privé). Daarop staan:

- de hal, op 84, 92 en 99 jaar;
- het gevecht in de voorraadkamer;
- de vergelijking van 32 naar 64 pixels;
- de figuren in acht richtingen;
- muren, vloeren en voorwerpen.

## In de maak (19 sep 2026)

Vijf agents werken tegelijk aan:

- bomen en begroeiing;
- huizen en grond van het dorp;
- dorpelingen;
- bosvijanden;
- de toren van de oude meester in drie staten.

Hun code komt daarna ook in `gereedschap/pixelart/`.

## Open

- **Sprites in het spel.** `js/tekenen.js` tekent nog met vlakken.
- **Loopanimaties.** De modellen kunnen bewegen; per richting zijn een paar standen nodig.
- **Effecten** van spreuken, en portretten van dorpelingen voor de gesprekken.
