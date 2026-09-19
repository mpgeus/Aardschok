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

## Animaties (Marcel, 19 sep 2026: "moet allemaal geanimeerd zijn")

Een figuur is opgebouwd uit gewrichten. Een animatie is een reeks houdingen, gerenderd zoals een
stilstaand beeld.

**Model.** De bouwfunctie krijgt een houding mee: `maak({ houding: 'lopen', fase: 0..1 })`.
Zonder houding geeft hij de stand van nu; bestaande vellen blijven daardoor gelijk.

**Namen, beelden en snelheid:**

| Houding | Beelden | Beelden per seconde | Herhaalt | Wat het is |
|---|---|---|---|---|
| staan | 4 | 4 | ja | Ademen: een klein wiegen, de baard of het slijm deint. |
| lopen | 8 | 10 | ja | Een loopcyclus op de plaats; het spel verschuift de figuur. |
| aanval | 6 | 12 | nee | Voor monsters. De tovenaar heeft `slaan` (met de staf) en `spreuk`. |
| geraakt | 3 | 12 | nee | Terugdeinzen. |
| sterven | 8 | 10 | nee | Het laatste beeld blijft liggen. |

**Voeten die niet glijden.** Een stap moet passen bij de loopsnelheid in `js/anim.js`. Een voet
op de grond schuift mee terug met de snelheid waarmee het spel de figuur vooruit schuift.

De held liep 4,5 tegels per seconde. Dat is rennen, en met een echte loopcyclus zouden zijn
stappen belachelijk lang worden. Besloten (Marcel, 19 sep 2026):
- de held loopt 2,5 tegels per seconde op zijn 84e (een cyclus van 0,8 seconde, een tegel per
  stap);
- hoe ouder, hoe trager: 2,1 op zijn 92e en 1,8 op zijn 99e. Zo voel je zijn leeftijd ook als
  hij gewoon loopt;
- de monsters houden hun snelheid (slijm 1,4, skelet 2,2).

In het spel moet dit nog worden ingebouwd, na de spreuken.

**Vellen.** Eén PNG per figuur per houding. De rijen zijn de acht richtingen in de volgorde
Z ZW W NW N NO O ZO; de kolommen zijn de beelden. Een cel is 112×124 met de voeten op (56, 110).
Een houding die niet in de cel past (liggen bij sterven), krijgt bredere cellen en vermeldt dat.

**Beschrijving.** Bij elke figuur hoort een JSON:
`{ naam, cel, anker, houdingen: { lopen: { beelden, fps, herhaal, cel? } } }`.

**Bekijken.** `apng.cjs` maakt er een bewegende PNG van, die in elke browser en op het canvas
beweegt.

**De tovenaar loopt naar zijn leeftijd.** Op zijn 84e loopt hij kwiek; op zijn 99e schuifelt hij,
leunend op de staf.

## Open

- **Sprites in het spel.** `js/tekenen.js` tekent nog met vlakken; er is een speler nodig die
  per toestand, richting en tijd het juiste beeld kiest.
- **Bewegende omgeving:** vlammen, water, rook, bladeren, en de stofjes in de zonnebundel.
- **Effecten** van spreuken, en portretten van dorpelingen voor de gesprekken.
