# Opmerkingen om later na te lopen

Marcel (25 sep 2026): "Notities van alle opmerkingen maken, kunnen we later revisiten." Hier staat
alles wat onderweg opviel en nog niet af is: wat ruw is, wat niet helemaal goed staat, en wat
Claude erbij bedacht zonder dat Marcel het al koos. Niets hiervan houdt het werk op.

Wie iets ziet, zet het erbij, met een datum; wie iets oplost, haalt het weg (`git log` bewaart
het). De keuzes die op Marcel wachten, staan in de werklijst onder "Wacht op Marcel".

## Het spel

- **De brink ligt achter twee daken** (24 sep). Vanuit de camera staan het huis van de schout en de
  boerderij van boer 3 vóór de brink. De heer, de marskramer, de schandpaal en wie eraan staat,
  vallen daardoor grotendeels achter een dak. De held zie je door een kijkgat, de rest niet. Hoe
  het op te lossen, wacht op Marcel (werklijst).
- **De winter is hard:** zonder hout gaat het gehucht van 25 naar 2 mensen.
  `T.BEHOEFTEN_INSTELLINGEN` samen met Marcel bijstellen als hij speelt.
- **Honger valt in het voorjaar,** vlak vóór de oogst, want het zaaigraan gaat voor. Buiten de
  winter kost het standaard geen mensen, alleen tevredenheid. Wie de heer alles geeft, heeft zo elk
  jaar een maand honger, en elk jaar iets meer. Of honger meer pijn doet, stel je in de spelregels
  in.
- **Het eerste voorjaar is krap:** het gehucht begint met 60 graan voor 25 mensen, dus half
  grasmaand is het op, ruim drie maanden vóór de oogst. Bij het eerste bezoek van de marskramer
  heb je dan ook bijna niets te verkopen (wat hout). Marcel (24 sep): "het graan passen we
  gaandeweg wel aan na spelen".
- **Zout telt voor de vis,** want de beek vriest 's winters dicht. Het vlees van de jager komt het
  hele jaar binnen; slachten in slachtmaand is voor later (`spel.md`, "Handel").
- **De bevolking is een getal, geen poppetjes.** Van de nieuwe goederen staan alleen ijzer, zout
  en gereedschap in de balk, dus steen, klei, riet, vis en de rest niet. Wat de marskramer koopt,
  zie je wel in zijn venster.
- **Wat een gebouw zegt,** lees je alleen als de muis op zijn voet staat, want het dak vangt de muis
  niet. En alleen bij gebouwen die je zelf neerzette.
- **De marskramer loopt op 1× een week** van de weg naar de brink.
- **De inner** (24 sep, `spel.md`):
  - De getallen zijn een eerste gok: 90 stappen geduld, zeven tegels zicht, en een toeslag van
    argwaan × 50%.
  - Praten met hem kost nog geen geduld.
  - Graan dat al gemaaid is, ligt in de schuur, en die telt hij helemaal. Hem langs lege velden
    leiden scheelt dus weinig graan, wel gebouwen en hoofdgeld. Het graan is voor de
    verstopplekken.
- **Naast de schandpaal.** Is de tegel vóór de schandpaal bebouwd, dan staat wie gestraft wordt op
  een tegel ernaast. Dan draagt hij geen halsijzer, en kijkt hij toch naar voren, niet per se met
  zijn rug naar de paal.
- **Zolang een boer maait,** leent hij het vel van de maaier: zijn karakter zie je dan niet.

## Het beeld

**Het huis van de heer** (24 sep, `beeld.md`):
- In één richting (ZO) zie je de korte beentjes van de heer nauwelijks onder zijn mantel.
- Het gezicht van de soldaat ligt grotendeels in de schaduw van zijn hoed. Dat is bewust grimmig,
  maar klein. Het blad van zijn hellebaard is in ZO smal.
- De pen van de inner is een wit streepje, en zijn opgetrokken wenkbrauw zie je op 1× niet.
- Het naamkaartje en de plek waar de muis iemand vangt, staan voor alle dorpelingen op 60 px (de
  tabel `HOOG` in `js/sprites.js`). Bij de soldaat zit het daardoor op zijn nek.
- Het commentaar bij `DORPSOUDSTE_FPS` in `dorpelingen.cjs` zegt nog dat iedereen met 10 beelden
  per seconde loopt, maar de heer trippelt met 20.

**De schandpaal** (24 sep, `beeld.md`):
- Het laatste stuk ketting zie je niet op het halsijzer: het valt achter hoofd en hoed.
- Het halsijzer staat stil terwijl wie eraan staat ademt, dus de band kan 1 px verschuiven.
- `T.sprites.hoofd` kent de boer en de boerin niet. De nek wordt daarom in `schandpaal.cjs` gemeten,
  en die meting slaat stukjes huid kleiner dan 12 px over.
- De gewone boer houdt aan de paal zijn hooivork vast. De karakters niet meer.

**Een gezicht per karakter** (25 sep, `beeld.md`):
- Ronde 1:
  - het rode gezicht van het heethoofd is zijn hele hoofd, en dat kan op een masker lijken;
  - van voren zie je van de luit van de zanger alleen de kop;
  - het gezicht van de woekeraar valt donker onder zijn hoedrand.
- Ronde 2:
  - van voren zie je van de bundel van de nieuwkomer alleen de banden en de knoop;
  - het grijze haar van de oude boerin leest als een lichte band onder haar donkere doek, dus het
    kromme lijf en de stok moeten het doen;
  - de kralen van de rozenkrans zie je op 1× niet, alleen de gevouwen handen en het kruisje;
  - de drinker-boerin heeft de kleuren van de gewone boerin; alleen haar buik, de kroes en een
    kleine rode neus onderscheiden haar;
  - de hand bij de mond van de roddelaar is op 1× klein;
  - de stok van de oudste zet een kortere pas dan een voet, anders stak hij in één richting
    (ZW) buiten de cel.

**Nog te tekenen:**
- braakland met onkruid (nu kale geploegde grond);
- de koets van de heer;
- portretten van de heer en de inner boven het gesprek;
- een eigen vel voor de marskramer (hij leent dat van Wim);
- de gebouwen die een tekening lenen (hut, schaapskooi, timmerman, brouwerij, tiendschuur,
  wapenmaker, wachthuis en meer);
- bouwfases voor de kapel, de watermolen en de put;
- misschien ijs op de beek (een vraag aan Marcel).

**Kleine beeldfouten:**
- in een huis in aanbouw branden de ramen al;
- het zwad van de maaier staat als paaltjes, en zijn slag is symmetrisch.

## Voorstellen van Claude die nog niet gekozen zijn

- **De heer kijkt op Sint-Maarten zelf rond vanaf de brink** (24 sep, gebouwd). Wat hij ziet en niet
  in het rapport van de inner staat, komt alsnog op de rekening en kost argwaan. Te keuren; uit te
  zetten met "heer zicht" op 0 in de werkbank.
- **De verstopplekken, stap 2 van de inner** (24 sep, nog niet gebouwd): zie `spel.md`, "Voorstel
  voor stap 2". Het gaat om vier punten:
  - wegzetten doe je ter plekke;
  - verstopt graan kun je niet eten;
  - wie het vindt;
  - een beetje bederf.
