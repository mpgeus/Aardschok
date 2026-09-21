# Wereld: de plekken, het dorp, het bos

De klim en het herstel van de toren staan in `toren.md`; het tekenen van kaarten in `kaarten.md`.

## Eén doorlopende wereld, zonder overgangen (Marcel, 21 sep 2026)

"Uiteindelijk wil ik één doorlopende wereld eigenlijk — geen overgangen zeg maar." Het erf, het
bos en het dorp liggen op één doek: je loopt van je toren door het bos het dorp in zonder dat er
iets laadt. Alleen binnenkanten (de toren, straks huizen, kelders en mijnen) zijn aparte kaarten
waar je door een deur in gaat; dat volgt uit "Buiten leest, binnen speelt" hieronder, want een
binnenkant is groter dan het huis van buiten. Hoe dat in Tiled gaat, staat in `kaarten.md`.

## De indeling van de wereld (Marcel, 20 sep 2026)

Drie gebieden, en je reist ertussen:

1. **Het erf van de toren:** jouw eigen plek, de toren met het bos eromheen. Zoals in Stardew
   Valley heb je een eigen gebied dat je opknapt en inricht.
2. **Het bos:** waar je doorheen reist, met eenvoudige vijanden.
3. **Het dorp:** waar de mensen en de quests zijn. Het moet flink groter dan nu.

## De maten (Marcel, 20 sep 2026: de schaal klopt niet)

De mensen leken te groot naast de huizen. Nagerekend: een tegel is 64×32 pixels en de tovenaar
is 88 pixels bij 1,75 meter, dus **een tegel is ongeveer 80 centimeter**. Een huis van 3×3
tegels is dan 2,4 bij 2,4 meter: een schuurtje.

Binnen klopte het al (de hal is 9×7 tegels, ruim 7 bij 5,5 meter). Buiten moet alles ruimer:

| Wat | Plattegrond | Hoogte |
|---|---|---|
| Klein huisje | 5×7 tegels | één verdieping, muur ~100 px |
| Gewoon huis | 6×8 tegels | anderhalve verdieping |
| Herberg | 7×9 tegels | twee verdiepingen, muur ~200 px |
| Kapel | 5×10 tegels | hoge muur, steil dak |
| Deur | ~1,5 tegel breed | ~2 meter (96 px), net boven de tovenaar |

## Buiten leest, binnen speelt (Marcel, 20 sep 2026)

Toen de toren om zijn hal heen was gebouwd, werd hij te groot: "in verhouding nu toch wel wat
aanwezig". Marcel stelde er meteen de vraag bij die het beslecht: "de huizen in het dorp zijn
ook niet zoals ze aan de binnenkant zijn waarschijnlijk?" Nee, en dat hoort ook niet.

Geen enkel spel in dit genre laat een binnenruimte in zijn buitenkant passen. In Stardew Valley
is je huis van buiten een schuurtje en van binnen een woning; Fallout, Zelda en Baldur's Gate
doen hetzelfde. Daaruit de regel:

- **Een buitenkant is gemaakt om te lezen op het scherm.** Hoe groot iets is, volgt uit hoe het
  zich verhoudt tot de figuren en de gebouwen ernaast, en uit hoeveel van het beeld het mag
  vullen. Het spel toont ingezoomd ongeveer vijftien bij zeventien tegels.
- **Een binnenruimte is gemaakt om in te spelen.** Er moet een gevecht op passen, met
  actiepunten, dekking en een deur om dicht te gooien. De hal is daarom 9x7 tegels, en dat
  blijft zo, ook al past dat niet in de romp van de toren.
- **Probeer die twee niet te laten kloppen.** Dat kostte ons vandaag twee verbouwingen van de
  toren: eerst te smal omdat hij nergens uit volgde, daarna te breed omdat hij uit de hal volgde.

### De toren moet om zijn eigen hal passen (Marcel, 20 sep 2026)

Marcel bij het eerste rondlopen buiten: "de toren voelt wat ielig aan, drie tovenaars naast
elkaar is ongeveer de breedte". Nagerekend klopte dat: de romp had een straal van 60 eenheden,
dus een doorsnede van 120, en met een tegel van 45,25 is dat 2,6 tegels, ruim twee meter.

De hal die erin zit is 9×7 tegels. Het binnenwerk was dus meer dan drie keer zo breed als de
buitenkant. Daaruit volgt de maat:

Let op: de maat hieronder is daarna teruggeschroefd, zie het besluit eronder.

| Wat | Maat |
|---|---|
| Buitendoorsnede aan de voet | ~~11 à 12 tegels~~ → **8,7 tegels** (Marcel, 20 sep 2026), straal 163 eenheden |
| Muurdikte | ongeveer een tegel |
| Verdiepingen | vier van ongeveer drie meter, plus de kegel erop |
| Hoogte van het beeld | ruim 800 pixels |

Daarmee is de toren het baken van het spel: je ziet hem vanuit het dorp staan, en je kijkt
ertegenop. Dat maakt doorkijk (hierboven) meteen belangrijker, want zo'n romp bedekt veel.

**Teruggeschroefd naar 8,7 tegels** (Marcel, 20 sep 2026). Bij twaalf tegels vulde de toren ruim
vier vijfde van het spelbeeld: een burcht, geen toren. We hebben hem in drie breedtes naast
elkaar gerenderd (12,3 / 10,2 / 8,7), telkens met de tovenaar en een dorpshuis van 6×8 ernaast,
en Marcel koos de smalste. Die vult iets meer dan de helft van het beeld, is nauwelijks breder
dan een dorpshuis, en leest door zijn hoogte en de kegel nog altijd meteen als toren. De
monumentaliteit zit in de hoogte, niet in de breedte — en dit is je huisbasis, waar je elke dag
omheen loopt, geen eindbaas. Het gereedschap om zo'n keuze te maken staat in
`gereedschap/pixelart/toren-maten.cjs`.

## Ideeën van Marcel (19 sep 2026), nog niet uitgewerkt

- **Een startdorp** met huizen en mensen die quests geven. Het dorp is de basis waar je tussen de
  klimmen naar terugkeert: Lords of the Realm naast Mystic Towers.
- **Een bos naast het dorp** met eenvoudige vijanden.
- **De krakkemikkige toren van de oude meester,** buiten het dorp. Die kun je door het spel heen
  opknappen.
- **Goud** verdien je met quests (en vind je onderweg). Je besteedt het aan:
  - het opknappen van de toren;
  - een nieuwe staf;
  - uitrusting.

## Een flink dorp (Marcel, 19 sep 2026)

Het dorp moet flink zijn: veel mensen, ook stellen en kinderen, en plekken die de moeite waard
zijn.

**Al getekend, met een karakter als haakje voor quests (voorstellen):**

| Dorpeling | Wie het is |
|---|---|
| De smid | Nors maar behulpzaam; repareert wat de aardschok brak. |
| De smidsvrouw | Doet de handel van de smidse, en voert iedereen die stil blijft staan. |
| De herbergierster | Weet alle roddels. |
| De boer | Zwijgzaam; zijn land is gespleten. |
| De boerin | Ruilt eieren, en weet welke akkers zijn gescheurd. |
| De dorpsoudste | De oudste van het dorp, nog jonger dan de tovenaar, en ze herinnert zich hem van veertig jaar geleden. |
| De oude man | Haar man. Hij vergeet dingen, dus zijn aanwijzingen komen er in stukjes uit. |
| De bruid en de bruidegom | Hun bruiloft ging niet door: de aardschok was juist die nacht. Zij staat nog in haar jurk. |
| De jongen | Speelt dat hij een held is, met een houten zwaard en de pet van zijn vader. |
| Het meisje | Haar zwarte kat verdwijnt op de dagen dat er een quest is. |
| De kleuter | Sjokt achter iedereen aan die tegen hem praat, met een houten paardje. |

**De beroepen, met hun haakje (voorstellen van de agent):**

| Beroep | Waar zijn quest over gaat |
|---|---|
| De bakker | Zijn oven is koud sinds de aardschok de schoorsteen spleet. |
| De molenaar | De schok klemde de vang van de molen; er is geen meel tot iemand naar boven klimt. |
| De kruidenvrouw | Woont aan de bosrand en weet welk kruid waarvoor dient, tegen betaling in iets uit de toren. |
| De jager | Sinds de schok loopt er een nieuw spoor in het bos, en dat volgt hij niet alleen. |
| De marskramer | Hij koopt ook. Vorige week kocht hij een sleutel van iemand die hem bij de toren zou hebben gevonden. |
| De koster | Sluit elke avond elke deur en telt de graven. Eén telling klopte niet. |
| De wachter | Sliep door de nacht waarin het zegel brak, en praat er liever niet over. |

Let op bij de kruidenvrouw: kruiden mogen geen jaren teruggeven, want genezen bestaat niet. Wat
ze wel mag verkopen, zijn middelen om een gevecht te ontlopen: rook, lokaas, slaapkruid.

Naast deze mensen is er een maker voor gewone dorpelingen: per zaad een ander postuur, kapsel,
kleding, hoofddeksel en iets in de handen. Daarmee kan het dorp druk aanvoelen.

### Dorpelingen lopen rond (Marcel, 20 sep 2026)

"NPC's mogen ook wel rondlopen, vind je niet?" Ja: de loopanimaties zijn er voor alle
dorpelingen, en een dorp waar iedereen stilstaat voelt dood. Wat erbij hoort:

- **Een dorpeling heeft een plek en een straal.** Hij dwaalt binnen een paar tegels van waar hij
  hoort (de smid bij de smidse, de boerin bij de akker), blijft af en toe staan, en doet dan iets
  dat bij hem past — Wim veegt, en die houding is er al.
- **Een dorpeling begint nooit een gevecht** en telt niet mee in de beurtvolgorde. Dat is wat hem
  onderscheidt van een dwalend monster, dat hetzelfde loopwerk gebruikt.
- **Niemand blokkeert een deur of een doorgang.** Je mag nooit jaren kwijtraken omdat er iemand
  in de weg liep. Een tegel naast een deur telt als plek waar een dorpeling niet blijft staan.
- **Praten onderbreekt het dwalen:** wie tegen je praat, staat stil en kijkt je aan, en loopt pas
  verder als het gesprek uit is.

### Plekken die de moeite waard zijn (voorstel)

| Plek | Wat er te doen is |
|---|---|
| Het dorpsplein | De waterput en een prikbord met klusjes en quests. |
| De herberg ("De Scheve Toren"?) | Roddels, geruchten over de toren en het bos. |
| De smidse | Uitrusting kopen en laten maken. |
| De kapel en het kerkhof | Graven van mensen die de tovenaar kende. Misschien ligt de oude meester er. Weemoed. |
| De molen aan de beek | De aardschok brak de molensteen. |
| De boerderij | Het land is gespleten, en er komen wolven uit het bos: een brug naar het bos. |
| De kruidenvrouw aan de bosrand | Geen genezing (die bestaat niet), wel lokmiddelen en rook: middelen om een gevecht te ontlopen. |
| De markt | Op marktdag komt de marskramer met zeldzame dingen: rollen met spreuken en staven. |
| Het huis van de dorpsoudste | Herinneringen aan de tovenaar van veertig jaar geleden. |
| De brug en de vijver | Kinderen spelen er; iets glinstert in het water. |
| De jagershut aan de bosrand | De jager heeft sporen van de reuzenspin gezien. |
| De toren van de oude meester | Buiten het dorp. |

## Bosvijanden (beelden klaar, 19 sep 2026)

Dit zijn eenvoudige vijanden voor het bos. De manieren om ze te ontlopen zijn een voorstel.
Volgens de kernregel kost een gevecht dat je ontloopt geen jaren.

| Vijand | Hoe hij eruitziet | Hoe je hem ontloopt (voorstel) |
|---|---|---|
| Wolf | Grijs en mager, gele ogen, tanden bloot. | Hij jaagt op geur: vlees uit het dorp opzij gegooid leidt hem een paar beurten af, en een fakkel houdt hem op afstand. |
| Reuzenspin | Zwart, met een paarse zandloper op het achterlijf en een tros gloeiende ogen. | Hij wacht roerloos tot je een draad raakt. Webben op de tegels maken een routepuzzel: je loopt eromheen, of je brandt een draad weg met een fakkel. Met een vuurschicht kost dat een jaar. |
| Kobold | Groen en klein, met een kap en een mantel van herfstbladeren, en een speer of een knots. | Hij is hebzuchtig en laf. Een opgegooide munt stuurt hem erachteraan, in een gesprek is hij om te kopen, en een groepje vlucht als de eerste valt. |

## Welke plekken de wereld nog nodig heeft (Marcel, 20 sep 2026, nog niet besloten)

Marcels lijst: dungeons, andere tovenaarstorens, questgebieden, mijnen, en een dorp dat meer een
geheel wordt zoals Stardew Valley, met wegen. Claudes weging daarbij, want bij ons is de vraag
niet hoeveel sprites maar hoeveel generators:

- **Verbindweefsel eerst.** Wat een wereld af laat voelen zijn niet de gebouwen maar de
  verbindingen: een pad dat een hoek om gaat en netjes eindigt, een hek dat een hoek maakt, een
  oever waar water en gras elkaar raken, een brug, een poort, een wegwijzer. Nu ligt alles als
  losse eilandjes op een grasveld, en dat is wat "overvol maar leeg tegelijk" veroorzaakt.
  Technisch: randtegels per overgang tussen twee grondsoorten, met hoeken en einden, die Tiled
  zelf kan kiezen. Een generator, honderden tegels, de grootste sprong die er te halen is.
- **Dungeons en mijnen zijn hetzelfde probleem,** en het goedkoopst. De binnenbouwdoos bestaat
  al: muren van 128 pixels, vloeren, deuren, licht per kamer. Een grafkelder is die doos in
  ander gesteente met ander licht; een mijn is dezelfde doos met stutbalken, rails, ertsaders en
  lantaarns. Twee generators geven beide categorieen, met zoveel kamers als we tekenen.
- **Andere tovenaarstorens zijn bijna gratis,** want `toren.cjs` is al een generator met drie
  staten en een instelbare maat. Een andere hoogte, een ander dak, een ander palet. Thematisch
  het sterkste van de lijst: als de held de laatste van een uitstervend vak is, hoort het land
  vol te staan met torens van mensen die het niet gehaald hebben.
- **Questgebieden zijn geen beeldcategorie maar een bouwdoos:** een kampement met tenten en een
  vuur, een ruine met omgevallen zuilen, een schrijn, een grotmond, een kerkhof, een gebroken
  brug. Tien losse stukken geven vijftig plekken; een aparte questgebied-generator zou duur en
  saai zijn.

**De waarschuwing die erbij hoort.** Elke plek moet een reden hebben binnen de kernregel, anders
verdunt het onderwerp van het spel. Het kader dat past: alles buiten de toren is een manier om
goud te verdienen of een spreuk te leren, en elk gevecht daar kost jaren. Dan is de wereld een
winkel waar je met je leven betaalt. Een dungeon is geen inhoud maar een aanbod: hier ligt goud,
en het kost je waarschijnlijk drie jaar.

**Wat niet op de lijst stond maar wel nodig is:** binnenkanten van dorpshuizen (je wilt de smidse
in om te handelen), portretten van de dorpelingen voor gesprekken (de generator bestaat al voor
de tovenaar en Wim), en de top van de toren, want dat is het einde van het spel en het enige
decor dat er echt toe doet.

**Voorgestelde volgorde na buiten-af:** randtegels, dan de mijn, dan de andere torens.

### Water en een brug vragen de speler iets (Marcel, 20 sep 2026)

Marcel koos de randtegels als eerste, en wilde er water en een bruggetje bij. Dat is geen
decoratie maar het goedkoopste middel om een kaart vragen te laten stellen. Een beek met een
brug maakt een plek waar je langs moet; staat daar een wolf, dan is er een echte keuze, want
eromheen lopen kost tijd en erlangs vechten kost jaren. Een open grasveld vraagt je niets.

Daarmee is landschap ook een middel om een gevecht te ontlopen, en dus een steun onder de
kernregel in plaats van een versiering erbovenop.

### Mensen die echt leven (Marcel, 20 sep 2026)

In oplopende kosten:

1. **Ze zijn ergens en doen iets** — vegen, hakken, de was ophangen, met elkaar praten. Het dwalen
   werkt al, de animaties zijn er.
2. **'s Ochtends ergens anders dan 's avonds.** Drie momenten is genoeg: aan het werk, in de
   herberg, thuis.
3. **Ze onthouden wat je deed.** Een paar vlaggen per persoon: geholpen, laten zitten, of hij die
   dode bomen langs de weg heeft gezien. Daar hangen een handvol zinnen aan.
4. **Ze willen iets van zichzelf,** los van jou. De bruid wil haar bruiloft alsnog, de jongen wil
   mee, de koster wil weten waarom die telling niet klopte. Dan praat je met iemand die ergens mee
   bezig is in plaats van met een luidspreker voor een quest.

Drie en vier zijn wat "ze onthouden je" echt betekent, en kosten vooral tekst.

## Open vragen

- **Welke upgrades heeft de toren?** Denkrichtingen:
  - een werkplaats (vallen maken);
  - een bibliotheek (spreuken herontdekken, zie `spreuken.md`);
  - een hersteld trapgat (een kortere route);
  - een kamer voor Wim (hij doet klusjes).
- **Loopt de tijd door tussen quests?** Dan wordt de tovenaar ook buiten gevechten ouder, en telt
  elke reis.
- **Hoe verhouden bos en toren zich?** Is het bos een plek om te oefenen, of hoort het bij de klim?
  Volgens de kernregel kost vechten daar ook jaren.

## Beelden

In de maak: bomen en begroeiing, huizen en grond van het dorp, dorpelingen, bosvijanden (wolf,
reuzenspin, kobold) en de toren in drie staten (krakkemikkig, half hersteld, hersteld). Zie
`beeld.md`.
