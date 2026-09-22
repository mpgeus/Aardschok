# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst wat Marcel vrijmaakt om zelf te bouwen, dan de lus die het spel
een spel maakt (quest → goud en grondstoffen → toren of jezelf → hoger), dan de inhoud, en pas
aan het eind de afwerking. Afwerking vóór de lus is poetsen aan iets wat nog niet werkt.

## De stand (einde sessie 22 sep 2026)

**Loopt nu:** niets. Er draait geen agent.

**Tempo:** gewoon door. Marcel maakt het niet uit of de week vandaag of vrijdag op is (22 sep).
Bekijk wel de vijfuursgrens voor je een zware agent start, zodat hij niet halverwege stilvalt.

**Wacht op Marcel:**
- Opmerkingen bij het draaiboek van de tutorial (gestuurd op 22 sep; de teksten staan in
  `T.TUTORIAL_TEKST` in `js/gesprekken.js`).
- In Tiled: het vel `tuin` aan `wereld.tmj` toevoegen, en de vier varens rond (51–52, 45–46) van de
  grondlaag naar `objecten` verplaatsen (`npm run kaarten` klaagt erover).
- **De koude oven samen schrijven.** De regels van het questsysteem staan er (22 sep), de quest
  nog niet: dat is een uur aan gegevens en gesprekstekst, en Marcel wilde erbij zijn. Wat er eerst
  moet zijn, staat in `toren.md` onder "Nog te schrijven".

**Klaar om te starten, in deze volgorde.** Elk stuk is een korte agent. Bekijk eerst de meter.
1. Ronde 4b: de huizen in Tiled (zie de huizenbouwer hieronder).
2. Fase B2b: de zeven vaklieden en meer gewone dorpelingen (punt 2). Daar horen nu ook de bakker
   en de marskramer bij: zonder hen kan De koude oven niet gespeeld worden.
3. Fase B3: de portretten in de gesprekken (punt 2).

**Het laatst af (22 sep):**
- de tutorial, met Marcels keuzes erin;
- huizenbouwer ronde 3 en 4a: uitbouwen, tuinstukken en hekjes in Tiled;
- twaalf dorpelingen die lopen, met knieën.

Details staan bij de punten hieronder en in `git log`.

## Tegelijk: de huizenbouwer op ronde vormen

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm** (af, 21 sep). Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één, anderhalf en
   twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het riet.
2. **Materiaal** (af, 22 sep). Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en veldsteen, en
   spanen, leien en pannen naast riet.
3. **Uitbouwen** (af, 22 sep). Dakkapellen (in het riet een bult), aanbouwen met een eenzijdig dak,
   erkers, luiken, bloembakken, buitentrappen, galerijen, gevelschoorstenen, en 21 losse
   tuinstukken in `tuin-sdf.cjs`. Plaat: `uit/proefhuis/uitbouwen.png`. Wat nog wringt: een bult
   in het riet past niet naast een aanbouw of op een L, het erkerkapje raakt bij twee lagen de rand
   van het grote dak, en het hek leest op ware grootte als een dicht staketsel.
4. **In gebruik.** Klaar als de nieuwe huizen in `gebouwen.tsx` staan met de goede voet en het goede
   anker, achteraan in de volgorde, en het dorp ermee getekend kan worden. Wat ronde 3 hiervoor
   opschreef:
   - Een aanbouw, trap of galerij steekt 1 tot 2,5 tegels voor de muur uit. Er is een `voetVan(H)`
     nodig (of opmeten zoals `meetVoet` in `naar-tiled.cjs`), met het anker op de achterste
     voethoek (+16), anders slaat `test/tegelanker.test.cjs` uit.
   - Renderen zonder gras en grondschaduw, anders wordt de slagschaduw de onderste pixelrij.
   - Per tegel een vaste opgave met een uitgeschreven `uit: {…}`, zodat andere kansen later het vel
     niet veranderen.
   - `naar-tiled.cjs` rendert in één draad (twaalf huizen: 5 tot 10 minuten); werkers of een cache
     per opgave.
   - Een huis met twee lagen en uitbouwen is zo'n 710×880 px: misschien een eigen vel.
   - Tussen de palen van een galerij en de muur kan niemand staan; die tegels moeten vast.
   - De tuinstukken krijgen een eigen vel van 1×1, anker op het midden van de tegel. Vast zijn het
     hek, de bank en de regenton; het hekje en de bedden niet (Marcel, 22 sep).
   Ronde 3 was één lange agent (235 stappen), dus ronde 4 gaat in twee stukken: **4a** (af, 22 sep) de hekjes
   van wilgentenen en latten (`beeld.md`) en de tuinstukken als eigen vel in Tiled; **4b** de
   huizen in `gebouwen.tsx`.

## Marcel, tegelijk

- **Kaarten tekenen in Tiled:** het dorp, het bos, de weg ertussen. Elke kaart in `kaarten/` is
  vanzelf een gebied. Laat weten of de randtegels de goede kant op liggen.

## Daarna, in deze volgorde

1. **De tutorial.** Klaar als het spel op het erf begint; de meester in zijn moestuin werkt en je
   laat lopen, slaan, sluipen en een deur dichtgooien; een vuurschicht op een oude ton schiet (97
   wordt 98), uit de fontein drinkt (weer 96) en de ton kapotmept met de staf (kost niets); er iets
   van boven de trap komt; hij sterft aan zijn laatste spreuk bij zijn moestuin; Wim om hem rouwt;
   en de oude openingsteksten ("na veertig jaar") zijn herschreven. Zie `verhaal.md`.
   **Stand (22 sep):** speelbaar van begin tot eind, met Marcels keuzes erin: er blijft één slok
   in de fontein, en wie te lang wegblijft, vindt de meester dood terug. Nog te doen: de teksten
   poetsen (`T.TUTORIAL_TEKST` in `js/gesprekken.js`), voelen hoe lang "te lang weg" is (`WEG` in
   `js/tutorial.js`), en een droge fontein in de kunst (hij rimpelt niet meer, maar toont nog water).
2. **Dorpelingen die er echt zijn.** Klaar als de negentien dorpelingen en de gewone
   `dorpeling(zaad)` loopanimaties hebben (en dus niet meer als Wim getekend worden), en er
   portretten zijn voor de gesprekken.
   **Fase A (af, 22 sep):** de smid en twee gewone dorpelingen lopen en ademen, ook in het spel
   (`T.WEZENS.smid`, en een `zaad` kiest zijn vel). Plaat: `uit/dorpelingen/lopen-proef.png`.
   **Besloten:** knieën, zoals bij Wim (Marcel, 22 sep; `wereld.md`). Fase B in korte stukken:
   - B1 (af, 22 sep): knieën voor de smid en de twee gewone dorpelingen. De uitleg staat boven de
     sectie "lopen en staan" in `dorpelingen.cjs`, met de smid als voorbeeld.
   - B2a (af, 22 sep): de herbergierster, de boer, de dorpsoudste en de acht uit
     `dorpelingen2.cjs`. Plaat: `uit/dorpelingen/lopen-proef-b2a.png`.
   - B2b: de zeven vaklieden uit `dorpelingen3.cjs` (daar neemt `been()` de knie al mee), en meer
     gewone varianten (`dorpeling2`, … in `dorpelingen-anim.cjs`).
   - B3: de portretten in de gesprekken.
3. **Het questsysteem, met één quest helemaal af.** Klaar als quests gegevens zijn (zie
   `toren.md`), de stand van een quest een voorwaarde is in een gesprek, er goud bestaat, en één
   quest — bijvoorbeeld "De koude oven" — van begin tot eind speelt en de toets van drie antwoorden
   haalt.
   **Stand (22 sep):** de regels staan er en zijn getoetst — fasen en wegen, goud, het vak
   linksboven, de Tiled-eigenschappen `quest` en `raak`, en `T.keurQuests`, dat de toets van drie
   antwoorden door `npm test` laat bewaken. Nog te doen: De koude oven schrijven (samen met
   Marcel), en daarvoor de bakker, de marskramer, de smidsvrouw, de leemkuil en de oven in de
   wereld zetten.
4. **De verhaaleditor.** Klaar als het gesprekkengereedschap ook quests kan: vormen om mee te
   beginnen, alles op één plek, een proef per fase, controle die de routes telt, en de koppeling
   met Tiled. Zie `verhaal.md`, "Een quest moet makkelijk te bouwen zijn".
5. **Grondstoffen en de verdeelvraag.** Klaar als magische grondstoffen voorwerpen zijn die je aan
   de toren óf aan jezelf geeft (jaren terug), ze eindig zijn in de wereld, en je er per saldo op
   achteruitgaat. Zie `toren.md`.
6. **De toren in verdiepingen.** Klaar als elke verdieping een eigen gebied is met de spiraaltrap
   als overgang; zweven kan voor twee jaar (drie als de vloer weg is), je dan niets draagt en het
   iets boven stoort; en er een torenpaneel in doorsnede is waarin je herstelt. Zie `toren.md`.
7. **De eerste verdieping, helemaal af.** Klaar als één verdieping — bijvoorbeeld de kweekkamer —
   drie geloofwaardige antwoorden heeft die verschillend kosten, en na herstel iets anders wordt
   (een kruidentuin).
8. **Verdorren.** Klaar als de spreuk er is met zijn vier regels (wat je verdort komt nooit terug,
   alleen buiten een gevecht, opbrengst naar hoeveel leven erin zit, meesterschap geeft toegang
   maar geen grotere opbrengst), er dieren zijn om te verdorren, en het dorp het ziet. Zie
   `spreuken.md`.
9. **Vergeten door ouderdom, en een dorp dat het ziet.** Klaar als meesterschap terugzakt als je een
    spreuk laat versloffen, en dorpelingen reageren op je leeftijd — ouder én jonger.
10. **Hoogte.** Klaar als er een hoogtelaag is in Tiled, rotswanden vanzelf worden afgeleid, en
    lopen alleen kan bij gelijke hoogte of over een helling. Zie `kaarten.md`.
11. **Kelders en mijnen.** Klaar als de grijze binnenbouwdoos er is (trap omlaag, ladder, rooster,
    ingestorte vloer, stalagmieten, vuur, botten, begroeide muren) en er één mijn te bezoeken is.
    Zie `beeld.md`.
12. **Een andere tovenaarstoren.** Klaar als er één te bezoeken is, met een eigen oude eigenaar,
    een eigen probleem en eigen grondstoffen.
13. **De leerling.** Klaar als de quest met de jongen er is en hij met je meegaat, met zijn drie
    remmen. Zie `verhaal.md`.
14. **Opslaan, titelscherm, instellingen, geluid.** Klaar als het spel een avond te spelen is en
    niets op de lijst "wat het browserig laat voelen" nog geldt, en wie opnieuw begint de
    tutorial kan overslaan. Zie `verpakken.md`.
15. **Verpakken.** Klaar als er een programma is dat vanuit Steam start. Zie `verpakken.md`.

## Klein, tussendoor als het past

- **Kringen en leeftijd:** de beste speler krijgt nu de minste spreuken. Kiezen uit de vier
  richtingen in `spreuken.md`. Moet vóór het verdorren besloten zijn.
- **Een omheining is geen blok** (om samen te bespreken). Het kerkhof, de kippenren en de moestuin
  staan in het spel als één vast blok, dus je kunt niet tussen de graven lopen, en een boomstronk
  die Marcel binnen de kerkhofmuurtjes zette, staat technisch "in" het kerkhof. Een omheining zou
  alleen zijn rand vast moeten hebben.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag met een terreinset in Tiled. Eén systeem, later ook voor een stadsmuur.
  Zie `wereld.md`, "Een dorp heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing op de erfkaart:** grassprieten, varens en bloemen staan er nog niet op.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

- 22 sep 2026 — **Het questsysteem, de regels:** quests als gegevens (`js/quests.js`) met de
  regels erachter (`js/quest.js`), goud naast de leeftijd, het vak linksboven dat nu ook van een
  quest kan zijn, en in Tiled `quest="bakker:zoeken"` op een voorwerp. Twee dingen die uit het
  bouwen kwamen: een weg door een quest is nu een ding in de gegevens met een `kost`, zodat
  `npm test` de toets van drie antwoorden bewaakt en het spel onthoudt *hoe* je iets oploste; en
  een spreuk kan een ding raken in plaats van alleen een wezen (`raak="oven"`), waarmee de
  toverweg van De koude oven kan bestaan zonder dat de oven een uitzondering wordt.

- 22 sep 2026 — Wachter voor gebouwen die elkaar overlappen: `npm run kaarten` klaagt als twee
  gebouwen van meer dan één tegel over elkaar staan.

- 22 sep 2026 — Huizenbouwer ronde 1 en 2: elke vorm (rechthoek, L, T; één, anderhalf en twee
  lagen, met riet dat in de kil doorloopt) en alle materialen (vakwerk, vlechtwerk, planken,
  blokhut, veldsteen; riet, spanen, leien, pannen; een wachttoren met plat dak). Platen in
  `gereedschap/pixelart/uit/proefhuis/`.

- 21 sep 2026 — **Eén doorlopende wereld:** `kaarten/wereld.tmj` met het erf (nu met randtegels)
  en het dorp op één kaart, en een strook ertussen voor het bos; de losse kaarten staan in
  `kaarten/oud/`. De camera volgt de held altijd, en om elke buitenkaart staat bos. De gebouwen
  staan op hun voet, en een tegelnummer verandert nooit meer.

- 21 sep 2026 — De meester in het spel: zes houdingen, een eigen leeftijd, en hij scharrelt bij
  zijn moestuin. Meldingen die zich herhalen worden één regel met een teller.
- 21 sep 2026 — Spreukanimaties met een worp, een vlucht en een inslag, en een grijze zucht die
  van de tovenaar opstijgt als hij betaalt (zie `spreuken.md`, "Je ziet de prijs gebeuren").
- 21 sep 2026 — Twaalf nieuwe gebouwen naar referentie één, met aanbouw en L-vorm; en
  tegelnummers die nooit meer verschuiven, zodat kaarten die Marcel tekent blijven kloppen.
- 21 sep 2026 — Fundering van de tutorial: `T.verouder` voor elk wezen, en een regieboek
  (`js/regie.js`) waarin overslaan dezelfde eindtoestand geeft als uitkijken.
- 21 sep 2026 — De verhaalsamenvatting in `CLAUDE.md` bijgewerkt; Wim is de knecht van de meester.
- 20 sep 2026 — Sprites in het spel; naar buiten lopen; wereld en dorp op referentie één; de
  toren op 8,7 tegels; randtegels met water en brug; elke kaart een gebied; gesprekken als
  gegevens met een editor; de spiraaltrap in drie staten.
