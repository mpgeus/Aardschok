# Werklijst: wat we doen, in welke volgorde

Begin een sessie hier. Bovenaan staat de stand: wat loopt, wat op Marcel wacht, en wat klaarstaat.
Daaronder komt wat volgt, in volgorde. Elk punt heeft een "klaar als", zodat afwerken iets is wat
je kunt nakijken. Een punt dat af is, gaat naar onderen met een datum; een nieuw punt krijgt een
plek met een reden. **De stand wordt aan het eind van elke sessie bijgewerkt,** zodat een nieuwe
sessie meteen weet waar we zijn.

**Waarom deze volgorde:** eerst een dorp dat draait, dan de heer die eraan trekt (en daarmee de
kern: rijk worden en arm lijken), dan verhalen en besturen, dan het verzet, en pas aan het eind de
groei naar vrijheid en de afwerking. Zie "Daarna, in deze volgorde".

## De stand (einde sessie 25 sep 2026): de overdracht

**Het spel** (sinds 23 sep): je bent de schout van een gehucht onder een heer die alleen geld ziet,
en je probeert rijk te worden terwijl je arm lijkt. Wat er nu speelt en hoe het werkt, staat per
onderwerp in `spel.md`: bovenaan "Waar staat wat", en elk onderwerp begint met **Zo werkt het nu**.
Een overzicht met het jaar maand voor maand, de kringlopen en de drempels van de heer en de inner
staat op de pagina "Stand van het gehucht" (een artifact op claude.ai, 25 sep). Spelen: `npm start`,
dan `localhost:8123/?kaart=gehucht`. `npm test`: 513/513.

**Deze sessie (25 sep)** bouwde verstoppen deel 1 (de kelders, de kapel, de kist die de inner telt,
en het spoor van goud via de marskramer), bracht het ontwerp op orde (`spel.md` per onderwerp, de
overzichtspagina), en verwerkte vijf antwoorden van Marcel: vlees vult een maag, de schapen groeien
langzamer, en de heer kijkt rond naar gelang zijn argwaan; verstoppen deel 1b en het plein staan in
de rij. Zie "Af" onderaan.

**Waar het werk staat.** De cloudomgeving geeft elke sessie een eigen branch; deze sessie werkte op
`claude/werklijst-vervolg-yp9f6m`, en alles staat sinds het eind van de sessie ook in `main` (Marcel:
"push it naar main"). Begin de volgende sessie dus gewoon vanaf `main`. Werkt een sessie weer op een
eigen branch, zet die dan aan het eind in `main` als Marcel dat vraagt, anders begint de sessie erna
op een oude stand. Haal ook eerst de hele geschiedenis op (`git fetch --unshallow`):
`test/tegelvolgorde.test.cjs` leest een oude commit, en in een ondiepe kloon falen er dan twee toetsen
die niets met je werk te maken hebben.

**Loopt nu:** niets.

**Volgende: punt 7, het oude spel eruit.** Marcel haalde het op 25 sep naar voren en koos: het gevecht
in beurten blijft, de namen gaan nu om, en de oude kaart gaat weg. De stappen en de valkuilen staan
hieronder bij punt 7. Het is een groot stuk werk; begin er een verse sessie voor, en lees eerst die
stappen.

**Daarna:**
- **Verstoppen, deel 1b: ook onder de 40% een risico** (Marcel koos op 25 sep; `spel.md`, "Marcel
  koos (25 sep, als opmerking op de overzichtspagina)"). De soldaten zoeken op Sint-Maarten altijd op
  2 of 3 plekken, ook zonder argwaan; wie vlak langs een plek loopt, kan iets vinden; en je bepaalt de
  route zelf, maar soms wil de heer kiezen.
- **Verstoppen, deel 2: het bos, met de kudde** (Marcel koos op 25 sep dat het bos samen met de
  kudde komt). Een plek in het bos voor graan en goud (ver lopen, muizen en vocht), en een deel van
  de kudde het bos in voor de inner komt. De inner telt de kudde en de heer vraagt per dier, met kaas
  en wol als sporen. Dat is ook stap 3 van de weides, zonder de handel.
- **Deel 3: de marskramer koopt en verkoopt vee, kaas, wol en hooi.** Daarna stap 3 van de inner:
  praten, afleiden, omkopen (ook de marskramer, die nu het spoor van goud is) en de rekenboeken.
- **Het plein** (Marcel koos op 25 sep; `spel.md`, "Sint-Maarten"): het gehucht rond een plein met
  het huis van de schout eraan, en daar de schandpaal of het blok; een galg misschien later. Zo komt
  de brink in beeld. Voorstel van Claude: samen met straten en paden (6c), want op het plein komen
  de paden samen.

**Wat nog ruw is of niet helemaal goed staat,** staat in `opmerkingen.md`: alle opmerkingen bij
elkaar, om later na te lopen (Marcel, 25 sep). Zet er een bij als je iets ziet.

**Wacht op Marcel** (gesorteerd op 25 sep, zoals op de overzichtspagina "Stand van het gehucht").
De vragen hebben een nummer, zodat een antwoord kort kan.

*Beslissen* (1 tot en met 5 en 9 beantwoordde Marcel op 25 sep; zie `spel.md` en punt 7):
6. De kern voor het tweede proefje (`spel.md`, "De kern voor het tweede proefje"): de drie groepen en
   vijf keuren, nodig vóór punt 9.
7. Moet het ijs op de beek te zien zijn (tekenwerk), en vangt de jager 's winters minder?
8. Een naam; "Aardschok" past niet meer.

*Spelen, en zeggen hoe het voelt:*
- Een heel jaar: hoe snel het gaat, de winter, en Sint-Maarten (is de honger te veel of te weinig;
  mag de heer harder, of juist zachter?).
- Het bezoek van de inner (`Toren.debug.inner()`, of wachten tot oogstmaand): voelt meelopen goed,
  en is 90 stappen geduld te veel of te weinig?
- De winter van het vee: `Toren.debug.slachten()` opent het slachtvenster, en in het veldenvenster
  (`V`) staan de mest en wat het hooi van volgend jaar de winter door helpt.
- Verstoppen: klik een boerderij. `Toren.debug.verstopt()` zegt wat er waar ligt,
  `Toren.debug.verstopt('boer1', 30, 5)` zet iets weg zonder te lopen, en `Toren.debug.zoeken()` laat
  de soldaten nu zoeken.

*Lezen:*
- De tien karakters en hun zinnen, in `gereedschap/gesprekken.html`. Ze zijn een voorstel van Claude;
  de vrome, de roddelaar, de oudste, de nieuwkomer en de drinker zijn nieuw. De namen van de heer en
  de boeren stel je zelf in (spelregels).

## Daarna, in deze volgorde (Marcel: "Ik wil het allemaal. Welke volgorde?", 23 sep)

De volgorde volgt wat op wat steunt: eerst een dorp dat draait, dan de heer die eraan trekt (en
daarmee de kern), dan verhalen die elk jaar anders maken, dan het besturen, dan het verzet, en pas
aan het eind de groei naar vrijheid en de afwerking. Alles staat in `spel.md`, "Welke gameplay er
nog nodig is".

*A. Een dorp dat draait*

3. **Behoeften en de winter** (af, 23 sep 2026). Klaar als mensen
   eten, brandhout en een kerk willen, tevredenheid bepaalt hoe hard ze werken en of ze blijven,
   een huis groeit (hut, huis, stenen huis) als zijn bewoners krijgen wat ze willen, en een winter
   zonder brandhout of voorraad mensen kost.
4. **Handel** (af, 24 sep 2026). Klaar als de marskramer drie keer per jaar langskomt (niet in
   de winter), ijzer en zout verkoopt en koopt wat je over hebt, tegen een prijs die per bezoek
   verschilt; een gebouw alleen maakt wat zijn grondstof toelaat, zodat de smidse zonder ijzer
   stilvalt; gereedschap sneller werk geeft en slijt; en zout vis en vlees bewaart. Besloten op
   24 sep, zie `spel.md`, "Handel". Stenen komen niet van hem maar bij punt 14, met een voerman
   met een kar.

*B. De heer, en de kern (dit is het tweede proefje)*

5. **Sint-Maarten** (af, 24 sep 2026). Klaar als de heer zelf op 11 slachtmaand naar de brink
   komt (met in wijnmaand een brief vooraf), zijn deel vraagt in goederen en goud, naar wat hij
   ziet, en je betaalt in een venster; als tekortschieten oploopt van een boete en hogere eisen,
   via soldaten die inkwartieren en de schandpaal (jij wijst aan wie), tot je ambt kwijt; en als
   zaaigoed telt: wat je hem geeft, kun je niet zaaien. Besloten op 24 sep, zie `spel.md`,
   "Sint-Maarten"; wat nog open is, staat daar onderaan.
6. **Rijk worden en arm lijken.** Klaar als de inner argwaan heeft die stijgt als wat hij ziet niet
   klopt met wat je levert, er verstopplekken zijn met plaats voor zoveel, je twee rekenboeken
   bijhoudt, en zijn bezoek een scène is waarin jij meeloopt, de route kiest, praat, afleidt of
   omkoopt. De vraag van het proefje: is dit leuk? Besloten op 24 sep, zie `spel.md`, "Rijk worden
   en arm lijken". In drie stappen: het bezoek, het rapport en de argwaan (af, 24 sep); de
   verstopplekken (deel 1 af, 25 sep: de kelders, de kapel en de kist; deel 2: het bos, met de
   kudde; deel 3: de marskramer handelt in vee); praten, afleiden, omkopen en de rekenboeken.
6a. **Weides met vee** (Marcel, 25 sep; `spel.md`, "Weides met koeien en schapen"). Klaar als je
   weides aanlegt zoals akkers, koeien erop grazen en schapen op de meent, en ze geven wat bij ze
   hoort: melk en kaas, vlees en huiden in slachtmaand, wol, en mest voor de akkers. En als de
   inner de kudde telt, zodat wie slim is een deel het bos in drijft voordat hij komt. In drie
   stappen (`spel.md`): velden en vee op de weide (af, 25 sep); de winter en de wol (af, 25 sep);
   vee dat telt (komt samen met deel 2 en 3 van de verstopplekken, punt 6).
6b. **Ontginnen** (Marcel, 25 sep; `spel.md`, "Ontginnen"). Klaar als je bos of heide tot een nieuw
   veld kunt maken, de heer er zijn deel van wil en de inner het telt, en een veld diep in het bos
   buiten zijn zicht blijft: een verstopplek voor land. Hier, omdat vee na stap 2 van de weides land
   kost, en omdat de geheime akker bij de verstopplekken van punt 6 hoort.
6c. **Straten en paden** (Marcel, 25 sep; `spel.md`, "Straten en paden"). Klaar als er vanzelf een
   pad slijt waar veel gelopen wordt, je een pad met keien verhardt tot kinderkopjes, iedereen over
   een pad sneller loopt en over kinderkopjes nog sneller, een zandpad in de natte maanden modder
   wordt, en de keien van een keienraper komen (in plaats van de steengroeve) en van het ontginnen.
   Hier, omdat de keien van het ontginnen komen (6b).
7. **Het oude spel eruit** (Marcel haalde dit op 25 sep naar voren: het komt nu eerst, vóór de rest
   van punt 6). Klaar als de toren, de spreuken, de leeftijd, de tutorial en de oude kaart uit de code
   zijn, het spel zonder `?kaart=` in het gehucht begint, de namen om zijn, `npm test` groen is, en
   `CLAUDE.md` alleen nog het nieuwe spel beschrijft. Waarom nu: van de 17.000 regels zijn er zo'n
   1.850 alleen voor het oude spel (spreuken, toveren, tutorial, regie, leeftijd), en er komt steeds
   meer nieuwe code bovenop.
   **Marcel koos (25 sep):** "Gevecht houden, namen nu hernoemen, oude kaart weg." Het gevecht in
   beurten blijft, met alleen slaan, voor de rovers, de wolven en de opstand; de namen gaan nu om; en
   de oude kaart gaat weg (het erf, het bos, het dorp en de toren).
   In stappen, elk met `npm test` groen en een eigen commit (voorstel van Claude):
   - **7a. Het gehucht wordt het begin.** `index.html` opent zonder `?kaart=` meteen het gehucht. De
     tutorial eruit: `js/tutorial.js`, `js/regie.js`, en het draaiboek `T.TUTORIAL_TEKST` met zijn
     plek in de gespreksschrijver (`gereedschap/gesprekken-tool.js`; `test/bronblok.test.cjs` kijkt
     op de echte bestanden).
   - **7b. De spreuken, het toveren en de leeftijd eruit:** `js/spreuken.js`, `js/toveren.js`,
     `js/leeftijd.js`, `T.verouder`, het meesterschap, de spreukbalk en de toetsen 2 tot 4. Het
     gevecht blijft (`js/gevecht.js`), met alleen slaan.
   - **7c. De oude kaart en zijn mensen eruit:** `kaarten/wereld.tmj` (het erf, het bos, het dorp, de
     toren) met zijn betekenis, `kaarten/oud/`, de gebieden erf en toren, en Wim, de meester, de
     bakker, de smidsvrouw en de andere dorpelingen van het oude dorp, met hun gesprekken en de quest
     De koude oven. Het questsysteem, de gespreksschrijver en het wereldgereedschap blijven, voor het
     avontuur; het wereldgereedschap opent dan het gehucht. De proefkaarten (`proef`, `proefbos`)
     blijven: de toetsen gebruiken ze. **Let op:** de marskramer, de heer en de inner komen het
     gehucht binnen over de weg, via de uitgang "De weg de wereld in" (een overgang naar 'wereld',
     `T.wegInEnUit`), en veel toetsen leggen zo'n overgang aan. Die weg moet blijven, ook als de kaart
     erachter weg is.
   - **7d. De kunst die alleen het oude spel tekent** (de tovenaar, de toren, de spreukeffecten) uit
     `beelden/`; de modellen in `gereedschap/pixelart/` blijven. Het vel van een gewone dorpeling
     blijft: de schout draagt het.
   - **7e. De namen om**, als laatste en in een eigen commit, zodat de rest leesbaar blijft:
     `globalThis.Toren` wordt `globalThis.Spel` (in de code blijft het `T`, en `Toren.debug` wordt
     `Spel.debug`), en de held wordt de schout (`S.held` wordt `S.schout`, de soort 'held' wordt
     'schout'). Dat raakt zo'n 160 regels met `Toren` in 96 bestanden en zo'n 550 met `held`, ook in
     de toetsen, het gereedschap, `server.cjs` en `CLAUDE.md`. De sleutel waaronder de browser de
     spelregels onthoudt (`aardschok.spelregels`) blijft, anders is wat Marcel instelde weg. `Spel` en
     `schout` waren het voorstel van Claude; Marcel koos "nu hernoemen".
   - **7f. `CLAUDE.md` alleen nog over het nieuwe spel;** de oude afspraken staan in `git log`
     (`git show 0eb8269:CLAUDE.md`).

*C. Verhalen en besturen*

8. **Voorvallen.** Klaar als er dingen gebeuren die een keuze vragen, met twee of drie antwoorden
   die elk iets kosten (zoals de quests), als gegevens op één plek, en de eerste reeks er is: weer
   (hagel, droogte), brand, ziekte, een vreemdeling die wil blijven, een bruiloft, een
   grensruzie, en de grillen van de heer als brieven.
9. **Groepen en keuren.** Klaar als boeren, landlozen en de kerk (later meer) elk een gezicht en
   vertrouwen in jou hebben, en je keuren kunt uitvaardigen die elk iets kosten.
10. **Rechtspraak en verklikkers.** Klaar als je als schout oordeelt over een dief, een vechtpartij
    of een verdachte vreemdeling, streng of mild met gevolgen, en er iemand in het dorp met de inner
    praat die je kunt ontmaskeren.

*D. De nacht en het verzet*

11. **De nacht.** Klaar als er dag en nacht is (ook voor de sfeer), met een avondklok, wachters en
    lantaarns, en verstoppen en smokkelen 's nachts veiliger is.
12. **Eigen buidel en dorpskas.** Klaar als jij zelf iets overhoudt, en wie te veel in eigen zak
    steekt, het dorp verliest.
13. **Een militie in het geheim.** Klaar als je mensen kunt laten oefenen (een feest als de inner
    kijkt), en rovers en wolven een reden en een gevecht in beurten geven.

*E. Groeien naar vrijheid*

14. **De treden.** Klaar als het gehucht een dorp wordt, dan marktrecht krijgt (markt, kramen,
    handelaars) en een stad wordt, met schepenen die stemmen. Met het dorp komt de voerman met
    een kar, die stenen brengt (`spel.md`, "Handel").
15. **Stadsrechten kopen.**
16. **De opstand:** trainen, wapens verbergen, en het gevecht in beurten.

*F. Afwerking*

17. **Opslaan, titelscherm, instellingen, geluid.** Zie `verpakken.md`. Het venster Spelregels
    komt dan ook bij Nieuw spel, met drie voorinstellingen: Mild, Zoals bedoeld en Streng
    (`spel.md`, "Instelbaar").
18. **Verpakken.** Klaar als er een programma is dat vanuit Steam start.

Het tweede proefje (één jaar met de heer: is rijk worden en arm lijken leuk?) zijn nu de punten 5 en 6.

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

- 25 sep 2026 — **Op orde gebracht, en vijf antwoorden van Marcel.** Een overzichtspagina "Stand van
  het gehucht"; `spel.md` per onderwerp met "Zo werkt het nu"; verouderde getallen recht. Van Marcels
  antwoorden meteen gebouwd: vlees vult een maag (`js/behoeften.js`, een optie), de schapen groeien
  langzamer (`js/vee.js`), en de heer kijkt rond naar gelang zijn argwaan (`js/inner.js`).
- 25 sep 2026 — **Verstoppen, deel 1 (punt 6, stap 2).** De kelders van de huizen en boerderijen en
  de kapel, elk met hun eigen kans en prijs; het karakter van wie er woont; de soldaten die plek voor
  plek zoeken; de inner die de kist telt; en de marskramer die vertelt wat hij je betaalde
  (`js/verstoppen.js`, `js/inner.js`, `js/handel.js`, `js/hud.js`). Een proef van één jaar staat in
  `spel.md`.
- 25 sep 2026 — **De weides, stap 2 (punt 6a).** Hooi in hooimaand, vee dat 's winters hooi eet of
  sterft, het slachtvenster op 1 slachtmaand, velden naast elkaar als één weide, de schapen op de
  heide met een schaapskooi, scheren en mest per veld, en drie opties (`js/vee.js`, `js/akkers.js`,
  `js/hud.js`, `test/weides.test.cjs`, `test/hooi.test.cjs`). Een proef van drie jaar staat in
  `spel.md`.
- 25 sep 2026 — **De weides, stap 1 (punt 6a).** Elk veld is akker, weide of braak en wisselt op
  1 lentemaand; een akker put het land uit tot 40%, een weide mest het. Vee graast binnen zijn
  weide en geeft melk en kaas, en de kudde groeit in grasmaand als er plaats is. Het veldenvenster
  onder `V` (`js/akkers.js`, `js/vee.js`, `js/hud.js`). Een proef van drie jaar staat in `spel.md`.
- 25 sep 2026 — **Het vee.** Een koe en een schaap, elk in drie kleuren, die grazen, staan, lopen
  en liggen, en rustig om beurten gaan liggen (`gereedschap/pixelart/vee.cjs`, `js/vee.js`,
  `beeld.md`). De weides zelf komen nog (punt 6a).
- 25 sep 2026 — **De marskramer loopt.** Zijn eigen figuur (rek vol potten en pannen, lappenjas,
  stok) kan nu staan en lopen, en in het spel leent hij niet meer het vel van Wim (`beeld.md`).
- 25 sep 2026 — **Een gezicht per karakter.** Alle tien karakters zie je van ver, op het lijf van
  de boer en van de boerin: achttien vellen, in twee rondes (`gereedschap/pixelart/karakters.cjs`,
  `beeld.md`).
- 24 sep 2026 — **De schandpaal.** Een eiken paal met een halsijzer en het wapen van de heer. Hij komt
  er de eerste keer dat de heer iemand straft en blijft staan; wie gestraft wordt, staat ervoor met
  de halsband om (`js/heer.js`, `gereedschap/pixelart/schandpaal.cjs`, `beeld.md`).
- 24 sep 2026 — **Het huis van de heer, in rood en geel.** De heer (klein en dik onder een veel te
  grote hoed), zijn soldaten en de inner zijn eigen figuren, met staan en lopen
  (`gereedschap/pixelart/heer.cjs`, `beeld.md`). Er kunnen nu ook losse figuren gerenderd en in het
  spel gezet worden, zonder de rest.
- 24 sep 2026 — **De inner komt tellen (punt 6, stap 1).** Op 15 oogstmaand loopt hij zijn ronde
  of met de schout mee; wat hij ziet, is de rekening van de heer, en argwaan doet vier dingen
  (`js/inner.js`). Onderweg hersteld: de schout kon in het gehucht niet lopen (sinds 23 sep), en
  na een gesprek bleef wie liep halverwege een stap staan.
- 24 sep 2026 — **Geloote boeren.** Elk spel een ander karakter (tien, elk met een gesprek) en
  andere eigenschappen (maaien, opbrengst, zaaien, aanzien), zichtbaar bij de muis, in het gesprek
  en bij de schandpaal; geloot of vast in de spelregels (`js/boeren.js`).
- 24 sep 2026 — **De spelregels.** Marcel wil geen vaste antwoorden waar er meer goede zijn: één
  venster (`O`) met de keuzes van Sint-Maarten, honger buiten de winter, de namen, en alle
  getallen als werkbank (`js/opties.js`). De standaard is wat hij koos; de browser onthoudt de rest.

- 24 sep 2026 — **Sint-Maarten (punt 5).** De heer stuurt in wijnmaand een brief, komt op
  Sint-Maarten zelf met twee soldaten, en vraagt naar wat hij ziet (`js/heer.js`). Je betaalt in
  een venster dat vooruitrekent. Wie tekortschiet, krijgt een boete, soldaten, de schandpaal (jij
  wijst aan wie, ook jezelf), en de tweede keer ben je je ambt kwijt. Zaaien kost graan, en daarom
  klopt het graan nu: een boer maait al zijn akkers, en het vangnet haalt de rest binnen. Marcel
  koos vóór het bouwen; wat Claude zag en wat een proef van drie jaar liet zien, staat in
  `spel.md`, "Sint-Maarten".

- 24 sep 2026 — **Handel (punt 4).** De marskramer komt drie keer per jaar, je handelt met hem
  in een venster (`js/handel.js`, `js/hud.js`), en de prijzen verschillen per bezoek. Een gebouw
  maakt alleen wat zijn grondstof toelaat, de smidse kan al in het gehucht, gereedschap laat
  harder werken, en zout houdt vis en vlees goed. Het eerste voorstel ging aan Marcel voor, en hij
  koos alle vier de keuzes; wat Claude zag voordat er gebouwd werd, staat in `spel.md`, "Handel".

- 23 sep 2026 — **Het gehucht speelt.** Punt 1: graan als plaat en in het spel (groeit met de
  kalender, wuift, boeren maaien, de oogst brengt het graan binnen). Punt 2 en 2b: 45 soorten
  gebouwen (`js/gebouwen.js`) met bouwmenu, bevolking, handen, en een huis dat in vijf fases
  oprijst (`bouwfasen.cjs`). Punt 3: behoeften, tevredenheid en de winter (`js/behoeften.js`).
  Verder de interface (kalender, voorraad), de kale kaart met de es, het kijkgat, de maaier, en
  `Toren.debug.schermafdruk`. Details in `git log`.

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
