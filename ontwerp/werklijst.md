# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst de kern op papier en een klein proefje dat laat voelen of hij leuk
is, dan het oude spel uit de code, dan de groei, de keuren en de politiek, de heer, het avontuur en
de twee wegen naar vrijheid, en pas aan het eind de afwerking. Een stad bouwen op een kern die niet
leuk is, is poetsen aan iets wat nog niet werkt.

## De stand (23 sep 2026)

**Het spel is omgegooid.** Marcel was niet blij met het doel van De laatste klim ("de toren
beklimmen is leuk, maar niet als einddoel"). Na vijf rondes ideeën van Claude die het niet waren,
kwam hij zelf met het nieuwe spel: **een bouw- en beheerspel in isometrisch beeld, met politiek en
avontuur erin.** Jij bent de schout van een dorp onder een verwarde heer die alleen geld ziet. Je
breidt het dorp uit tot een stad, bestuurt het met keuren, en maakt je aan het eind van de heer
los, met stadsrechten of een opstand. Alles staat in `spel.md`; de rondes ideeën staan in
`verhaal.md`, "Het doel staat weer open".

**Wat blijft:** de kunst en de techniek eronder. `verhaal.md`, `toren.md` en `spreuken.md` horen
bij het oude spel, net als de code voor de toren, de spreuken, de leeftijd en de tutorial; die gaat
eruit na het proefje (punt 4).

**Loopt nu (23 sep, avond):** twee agents (Sonnet). De een zet het graan in het spel (rest van 1b):
de akkers groeien met de kalender, wuiven in de wind, de boeren werken op hun akker en maaien met
de zeis. De ander bouwt de gebouwen als soorten (punt 2) in een eigen worktree op de tak
`gebouwen`: `T.GEBOUWEN`, bevolking en woonruimte, werkplaatsen, en een bouwmenu. **Die tak moet
daarna nog naar `main`.**

**Af vandaag, allemaal op `main`:**
- het graan als plaat, twee rondes (`gereedschap/pixelart/graan.cjs`, platen in `uit/graan/`): vijf
  stadia met varianten, hoogte met een achter- en voorlaag, wind als golf, schoven, rafelranden;
- de maaier met zeis (`maaier.cjs`, acht richtingen, 12 beelden; het zwad staat nog als paaltjes
  en de slag is nog symmetrisch);
- de interface (`js/tijd.js`, `js/voorraad.js`, `js/hud.js`): kalender met oude maandnamen vanaf
  1 lentemaand 1323, pauze en 1–3×, voorraad goud/graan/wol/hout, aan met `?kaart=gehucht` of `?hud`;
- het gehucht (`gereedschap/tiled/maak-gehucht.cjs`, `kaarten/gehucht.tmj`): een kale, open kaart
  van 50×50 met het dorpje in het midden en een es van vijf lange stroken ernaast;
  `index.html?kaart=gehucht` begint er zonder tutorial, de schout als gewone dorpeling;
- een kijkgat rond de schout in plaats van een doorzichtig spookhuis, en geen herfstbomen in de lente;
- de toets `bronblok` vergelijkt nu met de LF-versie, zodat hij ook op Windows groen is.

**Voor als Marcel "push it" zegt:** op GitHub staan twee commits uit de cloudsessie van 22 sep die
lokaal niet in `main` zitten (`bd0e742`, `b92336a`: een kaartje en zoeken in de gespreksschrijver,
en het draaiboek van de tutorial erin). Eerst `origin/main` samenvoegen, dan `npm test`, dan pushen.

**Wacht op Marcel:**
- De open vragen in `spel.md`, vooral: hoe je als poppetje honderden mensen bestuurt, welke
  goederen de heer vraagt, en hoe ver de politiek gaat. Die zijn nodig voor het proefje.
- **Het voorstel voor de kern** in `spel.md` ("De kern voor het tweede proefje"): goederen, wat de heer
  wil, wat de inner ziet, drie groepen en vijf keuren. Schrappen en aanvullen.
- Een naam; "Aardschok" past niet meer.

**Klaar om te starten:**
1. **Het eerste proefje: een gehucht met akkers, en de sfeer** (Marcel, 23 sep: "Ik wil iets van
   graan zien", "simpel houden", "de sfeer is belangrijk"; zie `spel.md`).
   - **1a. Graan als plaat.** Klaar als er een akker is in vijf stadia (geploegd, kiemend, groen,
     rijp, gemaaid met schoven), met hoogte zodat een boer er tot zijn middel in staat, en wind die
     als een golf over het rijpe veld rolt, en Marcel de plaat goed vindt. Renderwerk.
   - **1b. In het spel.** Klaar als je als schout door een klein gehucht loopt, het graan in een
     snel jaar ziet opkomen, rijpen en gemaaid worden, en de boeren op hun akker werken.
2. **Gebouwen als soorten** (Marcel, 23 sep: "huis, deze zorgen ervoor dat je populatie kan
   groeien; boerderij, meer mensen op de akker. Smidse, timmerman, wapenmaker. En alle anderen").
   Het voorstel met de soorten per trede staat in `spel.md`, "Gebouwen". Klaar als de soorten
   gegevens zijn op één plek (zoals `T.MENSEN` voor mensen), de schout ze met een bouwmenu kan
   neerzetten, een huis ruimte geeft zodat er mensen bij komen, en een werkplaats handen vraagt en
   iets maakt. Eerst met de tekeningen die er al zijn; wat nog niet getekend is, krijgt voorlopig een
   bestaand huis.
3. **Het tweede proefje: één jaar met de heer.** Eerst de kern op papier (het voorstel staat in
   `spel.md`, "De kern voor het tweede proefje", en wacht op Marcel). Klaar als je één keur kunt
   uitvaardigen, op Sint-Maarten de heer betaalt, de inner één keer rondloopt, en er iets te
   verbergen valt. De vraag die het moet beantwoorden: is rijk worden en arm lijken leuk?

## Daarna, in deze volgorde (voorstel)

4. **Het oude spel eruit.** Klaar als de toren, de spreuken, de leeftijd en de tutorial uit de code
   zijn, `npm test` groen is, en `CLAUDE.md` alleen nog het nieuwe spel beschrijft.
5. **Groei.** Klaar als het dorp in treden groeit (gehucht, dorp, marktrecht, stad), er winkels,
   marktkramen en handelaars van buiten komen, en het aantal mensen meegroeit.
6. **Keuren en politiek.** Klaar als er groepen zijn met vertrouwen in jou, schepenen die stemmen,
   keuren die elk iets kosten, en plakkaten van de heer die je uitvoert of niet.
7. **De heer.** Klaar als hij grillen heeft, op alle vier de manieren straft, en soldaten
   inkwartiert.
8. **Het avontuur.** Klaar als de grillen van de heer opdrachten zijn, er mensen met een verhaal
   zijn, en er buiten het dorp iets te halen valt (bos, buurdorp, handelsweg, het kasteel).
9. **Stadsrechten kopen.**
10. **De opstand:** trainen, wapens verbergen, en het gevecht in beurten.
11. **Opslaan, titelscherm, instellingen, geluid.** Zie `verpakken.md`.
12. **Verpakken.** Klaar als er een programma is dat vanuit Steam start.

## Tegelijk: de huizenbouwer, en meer mensen

Een stad vraagt veel huizen en veel mensen, dus dit weegt nu zwaarder dan eerst. In het nieuwe spel
zet de speler de huizen neer, dus voet en anker doen er nog meer toe; of ze daarvoor ook in Tiled
moeten, hangt af van punt 1.

Vier rondes, elk een eigen agent, en na elke ronde een plaat om te beoordelen. Zie `beeld.md`,
"De huizenbouwer op ronde vormen".

1. **Vorm** (af, 21 sep). Klaar als de bouwer elke maat kan, de nok langs beide richtingen, één,
   anderhalf en twee lagen (met overkraging), en rechthoek, L en T met een doorlopende kil in het
   riet.
2. **Materiaal** (af, 22 sep). Klaar als er planken, vlechtwerk en blokhut zijn naast vakwerk en
   veldsteen, en spanen, leien en pannen naast riet.
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
   Ronde 3 was één lange agent (235 stappen), dus ronde 4 gaat in twee stukken: **4a** (af, 22 sep)
   de hekjes van wilgentenen en latten (`beeld.md`) en de tuinstukken als eigen vel in Tiled; **4b**
   de huizen in `gebouwen.tsx`.

**Meer mensen:** fase B2b, de zeven vaklieden uit `dorpelingen3.cjs` (daar neemt `been()` de knie
al mee), en meer gewone varianten (`dorpeling2`, … in `dorpelingen-anim.cjs`). Renderwerk.

## Klein, tussendoor als het past

- **Een omheining is geen blok** (om samen te bespreken). Het kerkhof, de kippenren en de moestuin
  staan in het spel als één vast blok, dus je kunt niet tussen de graven lopen. Een omheining zou
  alleen zijn rand vast moeten hebben.
- **Omheiningen die je schildert:** tuinhek, palissade, haag, aarden wal met vlechtwerk, en een
  hekje, als een eigen laag. Eén systeem, later ook voor een stadsmuur. Zie `wereld.md`, "Een dorp
  heeft geen muur".
- **Kinderkopjes** in plaats van platte kasseien: bolle ronde keien met mos in de voegen. Zie
  `beeld.md`. Alleen de tekening van `rand.tsx` verandert, dus bestaande paden gaan vanzelf mee.
- **Windwijzer en schoorsteenrook** als losse elementen, zodat ze met de wind meebewegen.
- **Lage begroeiing:** grassprieten, varens en bloemen.
- **Bewegende omgeving:** vlammen, water, stof in het licht.

## Af

- 23 sep 2026 — **Het nieuwe spel gekozen:** de schout, de heer en het dorp dat een stad wordt, met
  keuren, politiek en avontuur (`spel.md`). De laatste klim is vervallen.

- 22 sep 2026 — **De verhaaleditor kan quests** (`gereedschap/quests.html`): de fasen en wegen als
  boom met hun prijs ernaast, formulieren voor fase, weg, klaarAls en beloning, drie vormen om mee
  te beginnen die meteen de toets van drie antwoorden halen, en opslaan dat `js/quests.js`
  terugschrijft met de uitleg tussen de gegevens intact. Twee dingen die er beter uit kwamen dan
  gevraagd: de proef per fase zet een merkje bij **wie het merkt** (het vergelijkt met hoe het dorp
  zou praten zonder de quest), en de controle kijkt naast het tellen van routes ook of een gesprek
  de quest wel begint, of een weg wacht op iets wat niets geeft, en of wat in Tiled aan een fase
  hangt die fase ook heeft. Eén afwijking van het plan: het werd een tweede bladzijde naast
  gesprekken.html, met een link ertussen — waarom staat in `verhaal.md`.
  Erbij: `Toren.debug.quest('bakker', 'terug')` zet een quest in een fase zonder hem te spelen.

- 22 sep 2026 — **De koude oven, de eerste quest:** vier wegen die elk iets anders kosten (de kuil
  met wat erin huist, de vuurklei van de marskramer, de vuurstenen van de smidsvrouw, en een
  vuurschicht in de oven), met de gesprekken erbij en een toets die alle vier uitspeelt. Twee
  besluiten van Marcel: een gunst moet ook echt iets kosten, dus de smidsvrouw vraagt de eerste
  grondstof uit de toren; en je erft acht munten van de meester, zeven te weinig voor de
  marskramer. De bakker en de marskramer bestaan nu als wezen en lenen tot fase B2b het vel van
  Wim.

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
