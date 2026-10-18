# Het gereedschap: draaien, testen en de bladzijden

Dit stond tot 11 okt in CLAUDE.md (vraag 153), en staat hier woord voor woord: elke `npm run`-opdracht in detail, testen in
de browser met alle `Spel.debug`-opdrachten, en de drie bladzijden gereedschap. CLAUDE.md houdt van elk een regel. Wie een
opdracht of een `Spel.debug` erbij maakt of verandert, werkt het hier bij.

## Draaien en testen

- `index.html` los openen werkt: de scripts zijn gewone `<script>`-bestanden, geen modules.
  Dat is een bewuste keuze. Modules werken niet vanaf `file://`, en er is geen bouwstap nodig.
- `npm start` start `server.cjs` op poort 8123 (geen afhankelijkheden) en drukt meteen af waar
  alles zit. `.claude/launch.json` heeft dezelfde server onder de naam `aardschok`. Het
  browserpaneel kan een los bestand wel tonen maar niet bedienen, vandaar deze server.
  - het spel: `http://localhost:8123/`
  - **het gereedschap: `http://localhost:8123/gereedschap/`** — een bladzijde die naar alle drie
    wijst. De belangrijkste is `gereedschap/wereld.html`: daar wordt het spel gemaakt.
  - **alle getallen: `http://localhost:8123/gereedschap/instellingen.html`** (vraag 142; Marcel: "een bladzijde met
    duidelijk overzicht van alles", "Gelijk veranderen"): elk getal uit de blokken `*_INSTELLINGEN` (in de volgorde en met
    de namen van `T.WERKBANK`), de standaard van elke spelregel en de getallen van elk gebouw, met het commentaar uit de
    code als uitleg en wat de spelregels erop zetten. Wat je verandert, schrijft de server meteen in het bestand
    (alleen dat getal, met een `.bak` ernaast), en de knop Toetsen draaien draait `npm test`. De lezer staat in
    `gereedschap/instellingen/bron.js` (zonder scherm, `test/instellingen.test.cjs`); hij voert niets uit, dus wat geen
    gewoon getal is (een som, `maandIdx(...)`), toont hij maar verandert hij niet. Verandert Marcel er iets, dan staat het
    als een gewone wijziging in de werkmap: commit het, en pas een toets die het oude getal verwacht aan. Bovenaan staat
    **de speeltest** (stap 3, `gereedschap/instellingen/speeltest.js`; Marcel: een set getallen probeer je in de code):
    Start speelt `npm run speeltest` met een naam (standaard snel: de kolonist, zaad 1) en zet hem
    naast de vorige: welke waarden anders waren, met een link naar hun rij, en per spel wat er anders afliep; een knop zet
    de waarden terug zoals ze bij de vorige waren. Zolang hij loopt, slaat de server geen getal op.
- `npm test` draait `node --test`: de toetsen in `test/`, de regels zonder scherm. Een toets laadt het
  spel zoals het draait, met `require('./laad.cjs').spel()`: de scripts uit `index.html`, in die
  volgorde, zonder wat alleen scherm is (`test/laad.cjs`). Een toets van het gereedschap laadt wat
  zijn bladzijde laadt (`.pagina('gereedschap/wereld.html')`). Nooit een eigen lijstje: dan mist er
  vroeg of laat een bestand, en toetst de toets een ander spel dan er draait. `test/namen.test.cjs` kijkt bij het laden
  mee of geen bestand een naam in `Spel` zet die een ander al zette (13 okt: `T.nieuwLand` stond in `js/land.js` en in
  `js/wereld.js`, en het laatste won stil); alleen `js/opties.js` mag de blokken van de werkbank terugzetten. Een toets die een dorp nodig heeft, speelt
  op het proefdorp (`test/grond.cjs`; sinds ronde 2 van het snoeien, stap 3, 12 okt): het lege begin op eiland 2 met het
  raadhuis, boerderijen met hun akker en hutten, gebouwd met de regels van het spel en meteen af, op vast
  toeval; met opties meer (`gebouwen: ['herberg']`, `weide: true`, `boerderijen: 3`; een `'wijnboerderij'` erbij heeft nog geen
  wijngaard: die leg je met `T.legVeld`, zoals `test/wijn.test.cjs`). Het wordt één keer per proces
  gebouwd en elke toets krijgt een vers exemplaar via opslaan en herstellen, dus een getal dat een toets vóór het
  proefdorp verandert, telt niet bij het bouwen. `leegBegin(T, zaad)` geeft alleen het lege begin. Het bouwen zelf staat
  sinds stap 6 in het spel (`T.proefdorp.maak`, `js/begin.js`), zodat het gereedschap in de browser hetzelfde dorp laadt
  (`Spel.debug.proefdorp`).
- `npm run speeltest` speelt het lege begin een jaar met de kolonist (`gereedschap/speeltest/kolonist.js`; werklijst B,
  1f), op het eiland van elk zaad (standaard 1 tot en met 3; `--zaad 2`, `--zaden 1-5`), in een onzichtbare browser, en
  zet de uitslag in `gereedschap/speeltest/uit/` (niet in git), met een tabel in `samenvatting.md`: "Het eerste jaar"
  (wat er vastliep, en het eten en het hout), de ossenkar (werklijst C, stap 6: per kar hoeveel van de werktijd hij
  bezig was, vol, leeg of ladend, per seizoen, de ritten en wat hij vervoerde; en de stapels, hoe lang een waar erop ligt,
  en wat er op de kar wachtte; gemeten in `speler.js`, `meetKar` en `karDag`, niet in het spel), de twee
  bazen, het bos en het graanboek. `--jaren 2` speelt twee jaar in plaats van één. Hetzelfde zaad geeft
  hetzelfde jaar, dus na het bijstellen van een getal zie je precies wat het deed. `--tegelijk 4` speelt vier spellen
  tegelijk (standaard drie). Het speelt het spel zoals het draait: de speler klikt en drukt op de knoppen van de vensters
  (`gereedschap/speeltest/speler.js`). Een jaar kost zo'n twee minuten (12 okt: zaad 1 in 124 s); nodig is Playwright (in
  de cloud staat het klaar). Wat het vond, staat in `ontwerp/speelbaar.md`. Met `--opslaan` is het de proef met
  opslaan: de speler slaat op 1 oogstmaand op via het menu, de bladzijde herlaadt, hij gaat verder met Verder, en het
  jaar moet letter voor letter aflopen als hetzelfde jaar zonder opslaan (`uit/opslaan.md`). Met `--regel seizoen=jij`
  speelt het met een spelregel anders, en met `--getal BOS_INSTELLINGEN.bosVanDeHeer=20` met een getal uit de
  werkbank anders (allebei zo vaak als je wilt; de uitslag krijgt `-regels` achter zijn naam). Een taak op de achtergrond
  stopt na twee uur, dus een grote speeltest gaat in meer taken; `--samenvatting` speelt dan niet, maar maakt de
  samenvatting opnieuw uit wat er al in `uit/` ligt, zodat de taken samen één tabel geven.
  **Naast de vorige** (vraag 142, stap 3): `--naam voor` bewaart de speeltest in `uit/voor/`, met alle waarden van de
  bladzijde met getallen, en `--naam na --tegen voor` zet hem ernaast in `uit/na/vergelijking.md`: welke waarden anders
  waren, en per spel wat er anders afliep (`gereedschap/speeltest/vergelijk.cjs`).
  Tot ronde 2 van het snoeien (stap 5, 12 okt) speelden ook braaf, slim, de bouwer en de sluwe bouwer, op het gehucht dat
  er al was, met `--jaren`, `--maker` en `--eiland`; dat begin is weg.
- `npm run proefversie` maakt de zip voor een tester (itch.io, `ontwerp/verpakken.md`) in `gereedschap/proefversie/uit/`
  (niet in git): `index.html` bovenin en alleen wat het spel laadt, met de stand (datum, commit) klein op het
  titelscherm (`T.STAND`). Commit eerst. Met `-- --windows` is het het spel in Electron voor Windows, zoals straks op Steam
  (`Aardschok/Aardschok.exe`; Electron komt één keer van GitHub, in `uit/`; vraag 123, e).
- `npm run grootte` meet hoe groot een dorp kan worden (vraag 74): het bouwt het gehucht uit tot N bewoners, met hutten en
  werkplekken zoals het spel ze bouwt, en meet de wereld per beeld op 30×, de dagtik en het opslaan, elke N in een eigen
  Node (`gereedschap/grootte/`, uitleg bovenin `grootte.cjs`); `-- 26 800` voor andere N, `--browser` ook het tekenen
  (start zelf de server), `--astar` het zoeken van een pad, `--prof` een CPU-profiel, `--maker 7` op het proefdorp van
  eiland 7 in plaats van eiland 5 (tot 12 okt het gehucht dat er al was: niet te vergelijken). Het bouwen in bulk vraagt
  niet naar het bouwbereik van het lege begin. De uitslag in
  `gereedschap/grootte/uit/` (niet in git), met een tabel in `samenvatting.md`. Meet op een stille machine.
- `npm run schermen` maakt twintig vaste schermafdrukken van het spel (het plein op vier zoomstanden, de herberg 's avonds,
  de nacht, twee bouwplaatsen in hun fases, het proefdorp op eiland 5) en meet wat de browser aan plaatjes vasthoudt
  (`Spel.debug.vellen`) en hoe lang het eerste beeld na het uitzoomen duurt; `-- --naam voor`, en na een verandering aan
  het tekenen of het laden `-- --naam na --tegen voor`: dan zegt het per beeld of het byte voor byte gelijk bleef
  (vraag 114, stap 1; ook voor WebGL, vraag 123). In `gereedschap/schermen/uit/` (niet in git). Op 0,35 kan het
  verkleinen in een paar honderd pixels de buurpixel kiezen als alleen het vel van een tekening anders is.
- `npm run tekenmeting` meet waar het tekenen zijn tijd kwijt is, per laag (vraag 123, f): het proefdorp op eiland 5, op
  1920×1080, 4K en 4K op 200%, dichtbij en in het overzicht, overdag en 's avonds; `-- 1920x1080@1` voor één scherm. In
  `gereedschap/schermen/uit/tekenmeting*.json` (niet in git). Zonder meer tekent Playwright met SwiftShader, een
  videokaart in software, en dan tekent het spel zonder kaart; **`--videokaart` meet met de echte** (Chromium in het
  nieuwe headless, met ANGLE op D3D11; vraag 174, c), en `--edge` hetzelfde in Edge. `--hoogte` speelt met heuvels, en
  `--dagen 3` eerst drie speeldagen op 30× met elk beeld getekend. Met de videokaart zegt elk beeld ook `Spel.gl.telling`
  (`vast`: de bomen in de vaste rijen, vraag 178), en `Spel.gl.stapel()` hoe vol de textuurstapel is.
  Meet niet naast een render of een spel: die nemen de processor in beslag.
  **Om en om tegen een oudere stand** (`-- --tegen HEAD --videokaart`, 18 okt): de stand uit git in een losse werkkopie
  met een eigen server (poort 8139), de werkmap op 8123, in één browser; per scène `--rondes` (5) keer elk 20 beelden,
  met de kaart erbij en de processor alleen (zonder wachten, zoals de spellus), en één beeld van elk pixel voor pixel
  (wat anders is, met het oude en het nieuwe beeld, in `uit/tekenmeting-tegen-*.png`). `--optie schaduwen=uit` zet een
  spelregel voor allebei; `--hoogte` en `--dagen` gelden ook (de spellus staat dan eerst stil: liep hij mee, dan liepen
  de twee werelden uiteen, 18 okt). Tegen een stand die nog niet gecommit is: maak hem als commit in een losse werkkopie
  (`git worktree add --detach`), en geef die hash. Alleen met `--videokaart`: zonder start de kale headless-shell, en
  die laadt het spel niet (`opmerkingen.md`). Het 2D-doek vergelijk je met `--optie tekenen=zonder`, maar het beeld pakt
  dan nog het doek van de kaart; vergelijk het zelf (18 okt: hetzelfde beeld en even snel).
- **De renderproef** (`gereedschap/pixiproef/`, 17 okt; `snelheid.md`, E): hetzelfde dorp met `js/gl.js`, met PixiJS
  v8 (op WebGL2 en WebGPU), en met een eigen tekenaar op WebGL2 en op WebGPU (`?wegen=huidig,gl2,gpu`, en `&vast` voor de
  vaste rijen met een dieptebuffer), los van het spel. Kijken op `/gereedschap/pixiproef/` (knoppen bovenaan, de meter eronder); meten met `node
  gereedschap/pixiproef/meting.cjs` (met `npm start`; hij wacht per blok tot de machine rustig is, want hier draaien vaak
  renders en toetsen van andere sessies), uitslag en advies in `evaluatie.md`. De weg `huidig` tekent zoals het spel tot
  18 okt (de lijst, met de schaduwen uit dezelfde plaatjes), niet met de vaste rijen van B1 en B2.
- `npm run stukmeting` meet wat nieuw land kost (B2b, stap 5): het proefdorp op eiland 2, de aanvoerder op 30× steeds naar
  de verste tegel die hij lopend haalt, naar het zuiden (de kust) en dan het westen; per beeld de regels, het maken van
  land en het tekenen apart, per stuk dat opengaat dat beeld en de drie erna, de zwaarste beelden (met een nieuwe dag
  of een stuk), en wie de kaart veranderde zonder plek. `-- --zaad 5 --richting oost,noord --duur 90 --afdruk kust.png`;
  de uitslag ook in `gereedschap/schermen/uit/stukmeting.json` (niet in git). Naast de tijd van de code ook de echte
  tijd per beeld, tot het volgende beeld (13 okt): zonder videokaart schildert de browser het beeld grotendeels na het
  tekenen, dus "tekenen" alleen zegt te weinig (`kaarten.md`, "Wat de meting mat"); en het aantal kijkgaten per beeld.
  `-- --tekenen met` meet het pad van de videokaart (hier nagedaan op de processor: dan telt alleen de tijd van de
  code), en `-- --richting zuid --reik 16 --duur 1 --stil 15` loopt hooguit 16 stappen (het bos in, waar 24 bomen een
  kijkgat om de aanvoerder tekenen) en meet dan 15 s stilstaan apart.
- `npm run samenvatting` maakt `ontwerp/het-spel-in-het-kort.pdf` uit `gereedschap/samenvatting/samenvatting.html` en de
  vier beelden in `gereedschap/samenvatting/beelden/` (alle drie in git); `-- --beelden` speelt eerst het spel en maakt
  de beelden opnieuw, elk uit een vers spel op land 5 van de maker (een minuut). Lukt een beeld niet meer, dan zegt het
  waar het vastliep, en blijft het oude staan.
- `npm run maker` legt het land van een paar eilanden met de maker (`js/maker.js`, `T.planOpEiland(zaad)`: elk spel een
  ander land, vraag 69 en 70) en tekent het als plattegrond, met het plein, het kamp, de marskramer en de weg, in
  `gereedschap/maker/uit/` (niet in git); `-- 7 12` voor andere zaden. Sinds ronde 2 van het snoeien (stap 6) zonder
  huizen of akkers: die bouwt de speler.
- `npm run teksten` leest elke `T.t('…')` uit `js/`, en de zinnen uit de gegevens die een bewerker terugschrijft (de
  gesprekken en de quests: `GEGEVENS` in `gereedschap/teksten.cjs`), en schrijft `taal/bron.js` (de lijst voor de vertaaltool), en zegt per taal
  in `taal/` wat ontbreekt, wat over is en wat niet past (`gereedschap/teksten.cjs`; vraag 147). Draai het na elke zin die
  erbij komt of verandert; `test/taal.test.cjs` faalt anders. **De vertaaltool** is `gereedschap/vertalen.html` (voor de
  community, dus in het Engels, en ook zonder server: wat je vertaalt, bewaart de browser, en het spel in dezelfde browser
  kent het); op onze server schrijft Opslaan `taal/<code>.js`.
- `npm run pixelart` rendert alle HD-pixel art naar `gereedschap/pixelart/uit/` (niet in git).
- `npm run pixelart:spel` zet daaruit alleen wat het spel tekent in `beelden/` (wél in git,
  want het spel heeft het nodig als het draait), met de cellen van de figuren gekrompen tot wat erin staat
  (`gereedschap/pixelart/inpakken.cjs`). Draai het opnieuw als de kunst verandert. `npm run tiled` en
  `bouwfasen.cjs` pakken hun vellen net zo in.
- `npm run tiled huizen -- --erbij` rendert alleen de huizen die nog niet op het vel staan (vraag 157), zoals
  `bouwfasen.cjs --erbij`; zonder `--erbij` gaan alle huizen opnieuw, ruim twee uur op vier kernen (`code.md`, bij
  `gereedschap/pixelart/`). **Eerst goedkeuring, dan renderen** (Marcel, 14 okt): een nieuwe tekening eerst in woorden,
  dan één proefplaat, dan pas alles (`beeld.md`). Een proefplaat van één huis: `HZ.renderHuis(HZ.HUIZEN[naam])` uit
  `gereedschap/pixelart/huizen.cjs`, zo'n halve minuut.


## Testen in de browser

**In het spel zelf: het debugvenster onder D** (werklijst 169; Marcel, 15 okt): +50 stammen, planken, steen en goud,
een gezin, de bouwplaatsen meteen af, en de marskramer nu, zodat je het groeien test zonder te wachten
(`js/debugvenster.js`). Aan tot de Steam-versie.

`Spel.S` is de spelstaat, en `Spel.S.dorp` je eigen dorp (`js/dorp.js`). `Spel.debug.naarBeeld(x, y)` geeft de schermpositie van een tegel
(css-pixels), `await Spel.debug.stap(seconden)` laat het spel vooruitlopen zonder op beelden te
wachten. Dat is nodig omdat een verborgen browserpaneel maar af en toe een beeld tekent; ook
css-overgangen staan dan vrijwel stil. Het testgereedschap stuurt de spatiebalk niet goed door
(lege `key`), dus test einde beurt met de knop of met een `KeyboardEvent`.
`Spel.debug.quest('<quest>', '<fase>')` zet een quest in een fase zonder hem te spelen ('uit'
haalt hem weg, beloning en al); zonder fase zegt hij waar hij staat. Er zijn nog geen quests
(`js/quests.js` is leeg). `Spel.debug.gaNaar('proefbos')` springt naar een ander gebied.
`await Spel.debug.schermafdruk('naam')` bewaart het doek als PNG in
`gereedschap/pixelart/uit/schermen/` (via de server, zonder de html-balken): zo laat je Marcel een
blik op het spel zien zonder de afbeelding door je eigen gesprek te halen. De camera naar een plek: sluit na
`Spel.debug.begin(n)` eerst het titelscherm (`Spel.ui.sluitTitel(Spel.S)`; zolang het open staat, volgt de camera het
titelscherm), dan `Spel.glijNaar(x, y)` (een tegel; sinds vraag 170, stap 1, volgt de camera de aanvoerder niet meer) en
`Spel.S.zoom = 1.8`, en `stap(3)` laat hem erheen glijden (`Spel.kijkNaar(px, py)` springt er meteen heen, in pixels van de
wereld). Wat je koos, staat in `Spel.S.gekozen`, en je gekozen mannen geeft `Spel.gekozenMannen(Spel.S)` (`js/kiezen.js`). Een brief die de klok stilzet, sluit `Spel.ui.sluitBrief(Spel.S)`, een gesprek
`Spel.sluitDialoog(Spel.S)`. In het gehucht:
`Spel.debug.kalender(dag, snelheid)` springt door het jaar, `Spel.debug.uur(21)` naar een uur van deze
dag (zonder getal zegt het hoe laat het is; een dag duurt vijf minuten bij 1×, dus `stap` gaat op 10×
tien keer zo ver), `Spel.debug.geenNacht = true` zet de nacht uit, `Spel.debug.geenMist = true` de mist in het beeld (B2c; de regels blijven), `Spel.debug.bouw('huis', x, y)` bouwt,
`Spel.debug.marskramer()` laat de marskramer nu komen (`(2)` voor zijn herfstbezoek),
`Spel.debug.brief()` stuurt de brief van de heer nu, `Spel.debug.heer()` laat hem nu komen,
`Spel.debug.vee('koe', 4)` zet vier koeien op de weide met de meeste plaats, bij de kudde: ze
blijven binnen de weide en geven melk (`js/vee.js`); een schaap gaat naar de heide. Zonder weide rond
een open plek bij de aanvoerder. `Spel.debug.bewoners()` zegt per bewoner wie het is, zijn huis, zijn werk,
waar hij staat en waar hij nu hoort (`('herder')` zoekt er een). `Spel.debug.gezin()` laat nu een
gezin komen (overdag over de weg; is het dorp vol, dan zegt het dat er geen plaats is), `(-4)` laat er een
wegtrekken. `Spel.debug.trede()` zegt
hoe ver het gehucht is met de volgende trede, en `('dorp')` maakt er nu een dorp van, met de brief van de heer
(`('marktrecht')` net zo).
`Spel.debug.kampen()` zegt waar de drie roverskampen van het eiland liggen, hoe ver van je plein, of ze er al staan (met
hoeveel tenten), en wie er woont, met het dorp van wie wegtrok (`js/rovers.js`, werklijst vraag 170, stap 6a2, c1 en c2); `('erheen')` maakt het land om het dichtste kamp open, zet het
kamp neer, laat je dorp het kennen (de rode stip op de minikaart) en kijkt erheen. In een verborgen paneel tekent de
minikaart pas opnieuw met `Spel.ui.werkMinikaartBij(Spel.S)`.
`Spel.debug.rovers()` zegt wanneer de wilde rovers komen, hoe een aanval ervoor
staat, wie er soldaat is, hoe je mannen ervoor staan (leven, wapen, en tegen wie ze vechten), of er gevochten wordt
(`gevecht`, js/gevecht.js), wie er in het town hall schuilt, en hoeveel wapens er in de opslag liggen; `(3)` laat nu
drie wilde rovers komen. `Spel.debug.aanvoerder()` zegt wie de aanvoerder is, met welk wapen, en
wie het overneemt als hij valt; `('val')` laat hem nu vallen (vraag 170, stap 5).
`Spel.debug.tweedeDorp()` zet een tweede dorp op het eiland, op de dichtste andere dorpsplek, met het lege begin (vraag
170, stap 6a), en `Spel.debug.wissel()` maakt jou het volgende dorp: de camera gaat erheen, en de balk, de mist, de
berichten en wie je stuurt, zijn dan van dat dorp. Zo speel je twee dorpen in één browser.
`Spel.debug.heervaart()` zegt wat de heer vraagt, wie er weg is en tot wanneer, en wie veteraan is; `('vraag')` laat
hem nu mannen vragen (ook in een gehucht), `('terug')` laat ze nu terugkomen.
`Spel.debug.raad()` zegt welke raad er onder het doel staat en welke er nu allemaal gelden.
`Spel.debug.versiering()` zegt welke boom er op het plein staat (de meiboom of de kerstboom) en waar.
`Spel.debug.einde()` zegt wat het jaarboek tot nu telt en wat het laatste jaarverslag zei; `('jaarverslag')` toont het jaar
in het kort nu. (Het winnen, met `('winst')` en `('gewonnen')`, is er sinds 11 okt niet meer.)
`Spel.debug.beesten()` zegt per groep wolven of herten hoeveel het er zijn, waar de leider is en wat hij doet, wat de groep
wil (thuis, aan de rand, of weg van iemand), zijn thuis en zijn plekken aan de rand, de honger van een roedel en hoeveel
herten hij ving, en wanneer de groep jongen kreeg; `('hier')` zet de aanvoerder tien tegels van de dichtste groep, om ze te
bekijken, `('opnieuw')` legt het wild opnieuw in elk open stuk land (vraag 170, stap 6a2, b), `('jongen')` geeft elke groep nu jongen (en wie groot wordt, splitst),
`('jacht')` laat elke roedel nu jagen, `('honger')` geeft elke roedel zoveel honger dat hij in het donker naar het dorp
komt (met `Spel.debug.uur(21)`), en `('schaap')` laat de eerste roedel nu een schaap nemen. Onder `jagers` staat per jager waar hij op jaagt, wat hij
schoot en of hij herten vindt.
`Spel.debug.gril()` zegt welke gril op je antwoord wacht, met de keuzes en wat ze kosten; `('jacht')` laat die nu komen.
`Spel.debug.bazen()` zegt de gunst van de heer en het vertrouwen van het dorp, waarom ze het laatst veranderden en of je
gewaarschuwd bent; `('gunst', 15)` zet de gunst op 15 (met de brief als hij onder 20 komt), `('vertrouwen', 0)` jaagt je
weg als je al gewaarschuwd was. De oude toetsen van de heer spelen met "Alleen de heer"
(`T.zetOptie('tweeBazen', 'uit')`); die van de twee bazen staan in `test/bazen.test.cjs`.
`Spel.debug.weer()` zegt het weer van vandaag, hoe lang het droog is, het watertekort, de droogte en wat die de oogst
kost, hoe nat het jaar is, de beekjes en per visser hoeveel van zijn water er is; `('regen')` zet het weer van vandaag
(`'zon'`, `'wolken'`, `'regen'`, `'sneeuw'`; `('sneeuw', 0.3)` met zoveel sneeuw op de grond), `('droogte')` maakt het nu droog, `('ernstig')` ernstig droog, `('nat')` maakt
er een eind aan.
`Spel.debug.bode()` zegt of je nu een bode kunt sturen en waarom niet, wie er onderweg is en wanneer de marskramer komt,
het gevaar onderweg, wie hem onderschept en hoe het afloopt, en wat hij op bestelling bij zich heeft; `('stuur', { graan:
3 }, 2)` stuurt hem nu (met twee mannen erbij), `('rovers')` of `('heer')` laat wie onderweg is onderscheppen, `('nu')`
laat ze nu aankomen, `('open')` opent de brief.
`Spel.debug.groei()` zegt hoe tevreden het dorp is en wat het at, en per huis met mensen wie er woont en hoe het met
doorgroeien staat: hoeveel dagen van de dertig, hoeveel soorten eten het vraagt, wat het gezin rooit, of waarom het niet
groeit (tot 16 okt was dit `Spel.debug.wensen()`, met de wensen per huis).
`Spel.debug.hoogte()` zegt of de kaart hoogte heeft, waar het hoogste punt is, de richel en zijn helling, en hoe hoog de
aanvoerder staat; `(5)` begint een nieuw spel op land 5 met heuvels (de spelregel "Hoogte" op "Heuvels"), `('top')` zet de
aanvoerder op het hoogste punt.
`Spel.debug.bomen = 'herfst'` laat de bomen en het groen eronder zien in een seizoen naar keus (`'lente'`, `'zomer'`, `'winter'`, `'sneeuw'`;
`null` weer dat van de kalender), zonder door het jaar te springen.
`Spel.debug.proefdorp(5)` speelt het proefdorp waarop de toetsen spelen (`T.proefdorp.maak`, `js/begin.js`), op het
eiland van 5 (zonder nummer 2), met de opties erbij (`(2, { gebouwen: ['herberg'] })`): stil gebouwd en geladen zoals een
bewaard spel. De vaste schermafdrukken, de tekenmeting en de samenvatting spelen erop (tot 12 okt `Spel.debug.gehucht`,
het gehucht dat er al was op een land van de maker).
`Spel.debug.eiland(5)` begint nu een spel op het eiland van 5 (zonder brief); zonder nummer zegt het in welk dorp je op het
eiland ligt, wat voor plek het is en waar de uitgang is.
`Spel.debug.kar()` zegt wat de ossenkar doet (waar hij is, wat hij draagt, waar hij heen rijdt en hoe laat hij er is), en
wat er op de stapels bij de deuren ligt (`js/kar.js`, werklijst C).
`Spel.debug.begin(5)` begint nu een spel op het eiland van 5 (`('nieuw')` op een nieuw eiland), zonder brief; zonder
iets zegt het hoe het kamp ervoor staat: waar de kar is en heen gaat, of de
aanvoerder meeloopt, wie er in welke tent woont, het vuur, en tot wanneer de heer niets vraagt.
`Spel.debug.brand()` zegt het brandgevaar, de kans dat de emmers een huis redden, en welke huizen branden, in puin liggen of
op hout wachten; `('nu')` laat de brand nu beginnen (ook zonder brandgevaar), `('puin')` laat wat brandt nu afbranden, `('herbouw')` laat het puin
nu weer opbouwen. `Spel.debug.koorts()` zegt wie er ziek is en tot wanneer, en hoeveel het hadden; `('nu')` laat de koorts
nu beginnen.
`Spel.debug.kleren()` zegt hoeveel volwassenen arm, gewoon en deftig lopen, en per volwassene zijn kleren, zijn huis (met
hoeveel laken het kreeg) en welk vel hij draagt (vraag 149).
`Spel.debug.wetten()` zegt per wet de stand en wat hij doet, en `('rantsoen', 'krap')` zet er eerst een, zoals
het menu (`W`). `Spel.debug.herberg()` zegt wie er vanavond naar de herberg gaat, hoe ver ze lopen en waar ze nu zijn,
en het bier (`(30)` zet eerst 30 bier). `Spel.debug.meter()` (of `F2`, dat ook de instelling *The meter* onder Settings omzet) zet de meter in beeld: beelden per seconde, wat de regels en het tekenen aan de processor kosten, het traagste beeld, en hoe lang de videokaart zelf over een beeld doet ("graphics card … ms", 18 okt; `T.gl.meetKaart`, `T.gl.kaartTijden`) als de browser dat zegt: Chromium en Electron meestal wel, Firefox niet; dan staat er "with the graphics card". Wat de grond kost als hij helemaal opnieuw moet, meet `Spel.debug.meetGrond()`: helemaal uitgezoomd, dan elke stap met het wiel, drie seizoenen, en met een dorp ook de sneeuw (die komt, een andere stand, en weg) en de droge beek, per actie het eerste beeld erna met de videokaart erbij, het traagste tot de grond heel is en in hoeveel beelden (de
grond komt gespreid, `code.md` bij `js/tekenen.js`; met `Spel.debug.grondProef = 'nieuw'` de grond op de kaart), naast een gewoon beeld, zonder alt-tab ertussen (die telt de meter sinds 18 okt ook niet meer als traag beeld). `Spel.gl.telling` zegt na een beeld wat het met de videokaart deed, zoals `opdrachten` (rond de twintig is goed) en `plaatjes`. Meet een verandering aan het tekenen ook na een paar speeldagen met elk beeld getekend (`await Spel.debug.stap(1 / 30)` en `Spel.tekenBeeld()` om en om): op 17 okt werden het zo 800 opdrachten in plaats van 60 (`code.md` bij `js/gl.js`). `Spel.debug.vellen()` zegt welke plaatjes de browser nu vasthoudt, samen en per map, in MB (`('alles')` noemt elk vel). `Spel.debug.paden()` zegt hoeveel tegels paadje zijn, waar het meest gelopen wordt en waar de lantaarns staan;
`('nacht')` doet nu wat de nacht doet. `Spel.debug.lopen()` zegt wie er met een doel onderweg is, wie daarvan staat te
wachten en op wie, en hoeveel wegen en velden de kaart onthoudt (vraag 119). `Spel.debug.praatjes()` zegt wie er waar
staat te praten en tot hoe laat, en hoeveel er vrij zijn; `('nu')` laat de twee vrije bekenden die het dichtst bij elkaar
staan nu beginnen (vraag 120). `Spel.debug.veldwerk()` zegt per boer wat hij vandaag op zijn land doet, wat hij nu doet
en waar, hoe ver hij is, wie hem helpt (vraag 111) en zijn dagloners (vraag 140). `Spel.debug.bos()` zegt per houthakker zijn boom, hoeveel hout hij er al uit hakte, wat er binnen zijn bereik
staat (bomen, jonge bomen, boompjes, stronken), of hij stilstaat en wat zijn hand doet; `('hak')` laat elke houthakker nu
zijn boom omhakken, `('groei')` laat elk boompje en elke jonge boom nu een maat groeien (vraag 115).
`Spel.debug.slachten()` opent het slachtvenster nu (anders op 1
slachtmaand). `Spel.debug.opslaan('2')` zet het spel op plek 2, `Spel.debug.laden('auto')` laadt wat er vanzelf
bewaard is, en `Spel.debug.spellen()` zegt wat er op de plekken staat.
De spelregels die de browser onthield (`localStorage`, `aardschok.spelregels`) gelden ook voor wie
test (een keus voor een spelregel die er niet meer is, telt niet); `Spel.optiesTerug()` zet alles op de standaard, en een nieuwe Playwright-context begint leeg.
Een sprong met `kalender` tikt alle dagen ertussen af: valt 1 wijnmaand erin, dan staat de brief
open en de tijd stil tot je hem sluit.

Drie bladzijden gereedschap draaien op dezelfde server, en alle drie gebruiken ze de regels uit
`js/` zelf, nooit een eigen kopie:

- `gereedschap/gesprekken.html` voor de gesprekken en `gereedschap/quests.html` voor de quests
  (fasen, wegen, het dorp per fase, en de controle die de toets van drie antwoorden nakijkt).
  Wat de speler leest (een zin, een antwoord, de naam boven een gesprek, het doel en de melding van een quest), schrijf
  je in het Engels (`ontwerp/engels.md`; vraag 147); het spel vertaalt het bij het tonen, en na het opslaan draai je
  `npm run teksten`. De situaties zijn alleen voor de schrijver, en mogen Nederlands blijven.
  **In de gespreksschrijver kijk je door één situatie tegelijk** (22 sep): bovenin staan de
  situaties, je klikt er een, en het gesprek wordt getekend zoals het dán loopt — één zin per
  knoop, alleen de antwoorden die je dan kunt geven, ingesprongen zoals een gesprek loopt. Wat in
  die situatie niet klinkt, zakt naar onderen met de situatie erachter waarin het wél klinkt. Dat
  is er gekomen omdat het scherm de gegevens liet zien en niet het gesprek: vijf versies van één
  zin stonden onder elkaar, alsof iemand ze achter elkaar zei.
  Een situatie staat bij de persoon (`situaties` in `js/gesprekken.js`), is geschreven in dezelfde
  woorden als een voorwaarde, en het spel leest hem nooit. **De fasen van een quest zíjn
  situaties** en staan er vanzelf bij bij wie hem geeft; de quest staat daarom op dezelfde
  bladzijde, met erbij welk antwoord welke weg neemt. `test/situaties.test.cjs` bewaakt dat elke
  zin met een voorwaarde ergens wint. Boven het gesprek klapt een **kaartje** open: de vorm van
  het gesprek in deze situatie, vanzelf neergelegd, klikken springt naar de tekst — een kaartje
  erbij en geen canvas in plaats van, want slepen is een tweede baan en een canvas zet alle
  voorwaarden weer tegelijk in beeld. In de kopbalk **zoek je over alle mensen heen**; klikken
  brengt je naar een situatie waarin die zin ook echt klinkt.
  Allebei starten ze zichzelf niet meer: de bladzijde die ze gebruikt roept
  `T.gesprekkenTool.start()` of `T.questsTool.start()` aan, met `.kies(...)` en `.begin(...)` /
  `.beginVoor(...)` erbij. Zo zet `wereld.html` dezelfde bewerkers in een paneel, zonder een
  tweede te bouwen — want twee bewerkers voor hetzelfde bestand lopen vroeg of laat uit elkaar.
- **Een bewerker schrijft alleen het blok dat hij kent.** `gereedschap/bronblok.js` knipt een
  bestand in kop, blok en staart (`T.bronBlok(tekst, 'T.GESPREKKEN')`); de bewerker regenereert
  alleen het blok, en kop en staart gaan letterlijk mee terug. Dat is geen netheid maar noodzaak:
  vóór 22 sep schreef de gespreksbewerker `js/gesprekken.js` helemaal opnieuw, kende het draaiboek
  niet dat achter het blok stond, en wiste één keer opslaan dus dat hele draaiboek. Wie
  een bewerker bouwt of uitbreidt, houdt zich hieraan; `test/bronblok.test.cjs` bewaakt het op de
  echte bestanden. Commentaar in het bestand hangt aan wat eronder staat — een persoon, een knoop,
  één regel tekst, één antwoord — en komt bij het opslaan terug op zijn plek.
- `gereedschap/wereld.html` voor de kaarten, en dat is de bladzijde waar het spel gemaakt wordt.
  **Tiled tekent alleen nog de grond; alles wat betekenis heeft ontstaat en verandert hier**
  (Marcel, 22 sep; `ontwerp/kaarten.md`). Het tekent de kaart met `js/tekenen.js` zelf, kent lagen
  die aan en uit kunnen (begaanbaar, mensen met hun dwaalstraal, questvoorwerpen, uitgangen),
  zegt bij een klik wat het spel denkt dat daar is, en keurt de kaart. Ver uitgezoomd tekent het
  zijn eigen plattegrond, want de tekencode van het spel is er niet op gebouwd.
  - Het leest de `.tmj` rechtstreeks van schijf: opslaan in Tiled, verversen, zien.
  - **Het schrijft alleen `kaarten/<naam>.betekenis.json`** — mensen, dorpelingen, deuren,
    geheime doorgangen, aansluitingen en voorwerpen met hun `quest=`. Eén ding per
    regel, zodat een verplaatsing ook één regel in `git diff` is. Tiled komt in dat bestand
    nooit, dus er valt niets mee te botsen; tegen een tweede open blad stuurt het mee hoe het
    bestand eruitzag toen het het las. Na het opslaan bundelt het zelf (`npm run kaarten`), zodat
    het spel het meteen ziet.
  - Een aansluiting leg je in één handeling: klik de tegel waar je vertrekt, het blad springt
    naar de andere kaart, klik waar je aankomt, en beide kanten staan er — `komt` erbij bedacht.
  - **Klik een poppetje en zijn gesprek én zijn quest staan ernaast** (dubbelklik, of de knoppen
    in het tegelpaneel): een breed paneel over de kaart met twee tabbladen, en daarin de
    volledige bewerkers uit `gesprekken-tool.js` en `quests-tool.js` — knopen, regels, fasen,
    wegen, voorwaarden, gevolgen, de proef en de controle. Geeft iemand nog geen gesprek of
    quest, dan biedt het paneel aan er een te beginnen, met hem als gever. Aanwijzen gaat op het
    lijf van een wezen, niet op zijn voeten, met dezelfde maten als `zoekDoel` in `js/main.js`.
    Esc sluit het paneel.
  - Een questvoorwerp hang je aan een fase met twee keuzelijsten (quest en fase), niet door
    `quest:fase` te typen; de kaart springt meteen naar die fase, zodat je ziet wat je legt.
  - De controle staat in `gereedschap/keuring.js` (`T.keurKaart` en `T.keurDekking`, zonder scherm
    en dus getoetst): wat op de kaart staat en niet kan, en omgekeerd wat het spel vraagt en
    nergens staat. Die tweede zegt precies wat er nog neergezet moet worden.

Drie dingen die bij het mikken misgaan:

- een open venster vangt de klik. Het spel opent op het titelscherm: klik eerst Nieuw spel
  (`#menu [data-actie="nieuw"]`; staat er al iets vanzelf bewaard, dan vraagt het eerst, en is het
  `[data-actie="ja"]`), dan Begin onder de naam van je dorp (`#menu [data-actie="begin"]`; het veld is
  `#dorpsnaam`, met een voorstel erin). Dan komt de benoemingsbrief, en zolang die openstaat, staat de tijd stil en valt elke
  klik op de brief: sluit hem eerst (de knop "Aan het werk", `.heer-geef-knop`, of Esc). Op `?kaart=proef`
  komen er geen titelscherm en geen brief, en wordt er niet opgeslagen;
- de camera glijdt mee, dus reken de schermpositie pas uit als hij stilstaat (een seconde
  `stap` na elke verplaatsing), anders klik je een tegel ernaast;
- wat vooraan staat, vangt de muis. Mik op het lijf van een wezen (zo'n 16 pixels boven zijn
  tegel), niet op zijn voeten, anders klik je de kist die ervoor staat.
