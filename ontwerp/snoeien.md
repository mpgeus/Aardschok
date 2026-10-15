# Snoeien: wat blijft, wat slaapt, wat weg gaat (vraag 153, stap 3)

Marcel, 11 okt: "Dan starten we met snoeien." De afspraak (vraag 153): wat om is, gaat eruit en blijft niet als
spelregel staan; git bewaart het. **Blijft**: hoort bij de nieuwe richting. **Slaapt**: de code blijft, er wordt niet
aan gebouwd. **Weg**: eruit, met de toetsen en de spelregel. In drie ronden (`werklijst.md`, A): ronde 1 nu, ronde 2 na
1f (wat het oude begin draaiende houdt), ronde 3 na de proef met de kar (wat de proef moet uitwijzen).

## Ronde 1: voorstel van Claude (11 okt), Marcel vinkte af

**Marcel (11 okt): "1. Weg 2. Weg 3. Nee, dit blijft toch? Deel van het eiland. 4. Weg 5. Weg 6. voor nu houden".**
Dus 1, 2, 4 en 5 gaan eruit; 3 en 6 blijven. Bij 3 (Claude): het land is nu een eigen kaart met provincies uit het
zaad, los van het eiland, maar het is wat de strategische kaart in Jagged Alliance 2 is (reizen in dagen, wat je
niet zag is donker), dus het slaapt tot F, en laat dan de dorpen en wegen van het eiland zien in plaats van eigen
provincies.

**Ronde 1 is af** (11 okt, sessie `ccr-ba1fa562-g7kz8h`): de graanzak (`fb791e8`), het oude doel (`7616cb5`), het
ontginnen als verzoek (`09fb582`) en de drie oude keuzes (`18d086a`); netto zo'n 2.250 regels minder, waarvan 1.470 in
`js/`. Een bewaard spel van vóór vandaag laadt niet meer (`T.OPSLAAN_INSTELLINGEN.versie` 4), en een geladen spel laat een
voorval dat niet meer bestaat stil vallen (`T.vergeetOnbekendeVoorvallen`). Het overzicht van het spel voor een
gamedesigner (`het-spel-in-het-kort.pdf`) beschrijft nog het oude spel; dat staat in de werklijst bij G.

1. **De verdwenen graanzak** (`js/zaak.js`, 372 regels; spelregel "De zaak"): de proef voor rechtspraak, loop B van
   vraag 151, die niet gekozen is. **Weg.**
2. **Het doel "iedereen een jaar super gelukkig"** (`js/einde.js`; spelregel "Het eind"): het doel van de oude demo.
   **Weg**; het jaarverslag in hetzelfde bestand blijft. Het nieuwe eind komt met het doel van de demo (wacht op Marcel),
   en dan gaat ook de regel erover in CLAUDE.md om.
3. **Het land met provincies en reizen** (`js/landkaart.js` en het meeste van `js/land.js`; spelregel "Land",
   standaard uit): Claude dacht dat het eiland (vraag 117) ervoor in de plaats kwam. **Blijft, slaapt tot F** (Marcel).
4. **Ontginnen als verzoek** (`js/ontginnen.js`; spelregel "Ontginnen"): een boer vraagt een stuk heide of bos, tegen
   het vertrouwen, gemeld tegen de gunst, of stiekem. Akkers leg jij nu zelf (besloten 11 okt). **Weg**; het plaggen
   steken (heide wordt akker, te zien) slaapt tot 1d, als je een akker op heide legt.
5. **Drie oude varianten in de spelregels:** "De houthakker: Hout uit het niets" (van vóór vraag 115), "Werk telt in
   uren: Een hele dag" (met de kar telt de weg juist), en "Treden: Zoals de proef van 28 sep". **Weg**; de regel blijft
   op de standaard staan, zonder keuze.
6. **De quests** (`js/quest.js` en `js/quests.js`, met haken in `js/gesprek.js`): een raamwerk uit het oude spel, en
   de lijst is leeg. **Blijft voor nu** (Marcel).

## Ronde 2: voorstel van Claude (12 okt), Marcel vinkte af

**Marcel (12 okt): "III. OK", en "e Mag weg, f alle vier weg, g weg, h ja wapens blijven ook voor later".** Dus de
volgorde hieronder (met "Leeg" als enige begin in stap 3); het ontworpen gehucht gaat ook als proefkaart weg (de toetsen
krijgen een andere grond); alle vier de oude spelers gaan uit de speeltest; de karakters gaan weg; de wapens blijven.

Na 1f (de kolonist speelt het lege begin een jaar zonder fouten). Marcel, 12 okt: "d ja": "Leeg" als standaard is de
eerste stap. Een agent bracht in kaart wat eraan hangt; wat opviel:

- **Het ontworpen gehucht is het proefveld van bijna alle toetsen:** 49 toetsbestanden beginnen er met
  `T.beginOpKaart(S, 'gehucht')`, met zijn vijf boeren en hun akkers. Wie `kaarten/gehucht.tmj` weghaalt, moet die allemaal
  op een nieuwe grond zetten.
- **Wat het lege begin nog gebruikt, staat in bestanden die weg zouden gaan:** de plekzoeker (`T.plekVoor`,
  `T.kanHierKomen`) in `js/verzoeken.js`; `T.dobbelsteen` en het zaad van het spel (`D.lot.zaad`, door 14 bestanden
  gelezen) in `js/boeren.js`; de wapens van de militie (`T.bewapen`, `wapens.schade`) in `js/ondernemers.js`. Die
  verhuizen eerst.
- **`T.tikGebouwenDag` roept de erven en de ondernemers elke dag aan**, en `T.inBouwmenu` kijkt naar "Huizen" en "Wie
  bouwt".
- **Ronde 3 hangt eraan:** de raad en de raadsman gebruiken de verzoeken, het lot en de karakters.
- **"Leeg" als standaard** maakt nu 53 toetsen rood; de meeste horen bij wat in deze ronde weggaat.

Voorstel, in stappen, elk met de toetsen groen:
1. **Verhuizen wat blijft:** de plekzoeker naar `js/bouwen.js`, de dobbelsteen en het zaad naar `js/dorp.js`, de wapens
   naar `js/rovers.js`.
2. **Weg:** de verzoeken en de ondernemers (met hun voorvallen, gesprekken en de rijen in de balk), de erven (met het erf
   in het bouwmenu), de wijnboerderij en het ontginnen door de boer, met hun toetsen en de spelregels "Wie bouwt" en
   "Huizen": wat "Leeg" zette, is gewoon zo.
3. **"Leeg" is het enige begin:** de spelregels "Het begin" en "Je gehucht" gaan eruit. Na stap 2 zijn de meeste van de 53
   rode toetsen al weg, met wat ze toetsten; de rest krijgt het lege begin. Het ontworpen gehucht blijft als proefkaart
   voor de toetsen (zoals `?kaart=proef`), niet als begin dat een speler kiest. (Dat is een stap later dan Marcels "d ja":
   "Leeg" eerst als standaard zou betekenen dat 53 toetsen eerst omgebouwd worden en een stap later weggaan.)
4. **Weg:** het lot en de karakters van de boeren (`T.KARAKTERS` met hun gesprekken, zo'n 245 regels; de spelregel "Wie
   de boeren zijn"), en de spelregel "De markt".
5. **De speeltest:** de oude spelers (braaf, slim, bouwer, sluw) spelen het oude begin; de brave blijft als nulmeting op
   het lege begin, de rest gaat eruit. Opslaan naar versie 6 (een half gebouwde hut op een erf betekent dan iets anders).

**Stap 1 is af** (12 okt, sessie `ccr-abaf0226-9lnbtq`): de plekzoeker staat in `js/bouwen.js`, `T.dobbelsteen` in
`js/dorp.js`, de wapens (`T.bewapen`, `T.wapensInHetDorp`, `ROVERS_INSTELLINGEN.wapens.schade`) in `js/rovers.js`.

**Stap 2, het plan** (12 okt, sessie `claude/festive-cray-rovfsg`; Marcel: "1 ja 2 ja 3 houden voor nu; ik wil tóch een
apart wijnboerderij gebouw"): in drie stukjes, elk een commit met de toetsen groen: **2a** de verzoeken en de ondernemers
(met "Wie bouwt"), **2b** de erven (met "Huizen"), en opslaan naar versie 6 al hier, want een half gebouwde hut op een
erf betekent iets anders zodra de erven weg zijn, **2d** het ontginnen. **De wijnboerderij blijft** (geen 2c): Marcel wil
tóch een eigen wijnboerderij als gebouw, dus het gebouw en zijn tekening in `gereedschap/pixelart/` slapen tot vraag 155
(Marcel: "A, direct na ronde 2"; werklijst, B1).

**2a is af** (12 okt): de verzoeken en de ondernemers zijn weg, met de spelregel "Wie bouwt", de oproepen, de meester,
wat een huis nadroeg, en de lijst van de raad die alleen de verzoeken voedde (`T.watTeBouwen`). Het vooruitkijken van
de wijn (`T.wijnNaDePluk`) had geen gebruiker meer, maar Marcel koos het zelf (10 okt): het slaapt met de wijnboerderij
(vraag 155). **Voor ronde 3:** de raadsman besliste vooral over verzoeken als je weg was; nu beslist hij alleen nog over
de gelote voorvallen, en de raad zegt alleen nog wat helpt, met [B].

**2b is af** (12 okt): de erven zijn weg, met de spelregel "Huizen", de paaltjes en hun pixel art, en wat alleen voor de
erven was (`wordtTekening`, `T.groeiGrond`, het huis "van straks" in de kring); opslaan is versie 6. De oude spelers van
de speeltest bouwen nu een hut als er geen plaats is (tot stap 5), en `npm run grootte` bouwt hutten zonder erf
(`--indeling ruim`).

**2d is af** (12 okt): het ontginnen is weg (`js/ontginnen.js`, `veld.ontginning`, het plaggen steken); `bosBomen` staat
nu als `bosVanDeHeer` in `T.BOS_INSTELLINGEN`, `T.groeitLaag` in `js/bos.js`, en het rooien met de bijl heet in `js/veldwerk.js` `rooiTegels`.
**Stap 2 is daarmee af.** Het volgende is stap 3: "Leeg" is het enige begin.

**Stap 3, het plan** (12 okt, sessie `claude/gallant-faraday-d5617b`). Marcel koos "B: lege begin met een proefdorp" en
"stap 5 samen met stap 3". De toetsen die op het ontworpen gehucht spelen (44 bestanden), krijgen het lege begin als
grond: een proefdorp dat een hulp in `test/` bouwt met de regels van het spel (het huis van de schout, hutten, een
boerderij met haar akker), zodat ze spelen wat de speler speelt. Gemeten vooraf: op een dorp van de maker (het "dorp dat
er al was") bleven 450 van de 482 toetsen groen, maar dat begin bestaat voor de speler niet meer; het lege begin vraagt
meer werk, ook aan toetsen van ronde 3. De vier oude spelers van de speeltest gaan in dezelfde stap weg (stap 5), want
het begin dat zij spelen, gaat weg. In stukjes, elk met de toetsen groen: **3a** het proefdorp en de toetsen erheen,
**3b** "Leeg" als enige begin (de spelregels "Het begin" en "Je gehucht" weg), **3c** het ontworpen gehucht weg
(`kaarten/gehucht.tmj`, `gereedschap/tiled/maak-gehucht.cjs`), **3d** de oude spelers weg. Open: het dorp van de maker
(niet leeg) heeft daarna geen speler meer; het blijft tot Marcel kiest of het de andere dorpen op het eiland wordt (F).

**Stap 4 gaat mee** (Marcel, 12 okt: "Ja, nu mee"). Gemeten op het proefdorp: 188 van de 482 toetsen werden rood, en de
grootste oorzaak was dat `T.isBoer` nog "iemand met een karakter uit het lot" betekent (de vijf boeren van het oude
begin). In het lege begin heeft de boer op een boerderij geen karakter, dus telde hij voor de raadsman, de voorvallen en
de heer niet als boer; dat gold ook al in het spel zelf. Dus: **een boer is de man op een boerderij** (`T.boerVan`, de
regel uit 1e), en het lot, de karakters met hun gesprekken en de spelregel "Wie de boeren zijn" gaan eruit; een voorval
dat een karakter vroeg, vraagt een boer of een man. De spelregel "De markt" (ook stap 4) blijft een eigen stukje erna.

**Stap 3, 4 en 5: af, zonder de markt** (12 okt, sessie `claude/gallant-faraday-d5617b`; npm test 1054 van 1054):
- **3a en 4:** de 45 toetsbestanden spelen op het proefdorp (`test/grond.cjs`; vast toeval, één keer gebouwd per proces en
  per toets hersteld via opslaan). Een boer is de man op een boerderij (`T.isBoer(D, p)`); `js/boeren.js`, `T.KARAKTERS`
  met hun gesprekken, de eigenschappen en de spelregel "Wie de boeren zijn" zijn weg. De raadsman weegt met één weging
  (`RAADSMAN_INSTELLINGEN.kiest`), de schandpaal kost voor elke boer `HEER_INSTELLINGEN.schandpaalKost`, en er kan ook een
  boer van het lege begin aan. Een boer trekt niet weg, gaat niet naar de heervaart en brengt de brief niet; tegen de
  wolven helpen, in de militie en op jacht gaat hij wel (zoals in het lege begin tot dan). Onderweg gevonden en
  opgelost: in het lege begin trokken boeren weg en lagen hun boerderijen stil (die regels keken naar `p.wie`).
- **3b:** "Leeg" is het enige begin; de spelregels "Het begin" en "Je gehucht" zijn weg. `Spel.debug.begin(5)`.
- **3c:** het ontworpen gehucht is weg (`kaarten/gehucht.tmj`, `maak-gehucht.cjs`); je dorp is het land van de maker.
- **5:** alleen de kolonist speelt nog in de speeltest; hij doet ook de proef met opslaan.

**Stap 6: wat Marcel koos** (12 okt, op de twee open keuzes):
- **Het dorp dat er al was: "Alles wordt door spelers geplaatst."** De maker legt alleen nog het land met een open plek
  voor het plein, nooit meer huizen, boerderijen, velden of een herberg; ook niet voor de andere dorpen op het eiland
  (F, B2): die bouwt wie ze speelt, een mens of het spel, met dezelfde handelingen (CLAUDE.md, "Zo dat samen spelen later
  kan"). Weg: de tak `leeg` uit in de maker, de vaste boeren boer1 tot boer5 en de herbergierster in `T.MENSEN`, en de
  toetsen en het gereedschap die erop speelden gaan naar het lege begin of het proefdorp.
- **De markt: "Plein krijgt plaatsen."** Het plein van het lege begin krijgt vaste plekken voor de kramen, naast die van de
  heer en de marskramer (die is er al, `w.marskramer`). Daarmee is "een eigen gebouw" geen goed antwoord meer, en gaat
  de spelregel "De markt" weg (de afspraak van vraag 153).

**Stap 6: het plan** (12 okt; Marcel koos: de marktplek "In het bouwmenu", en het gesprek van de herbergierster "Naar de
waard"):
- **6a, de marktplek.** Gemeten op zeven eilanden: op het lege plein past de markt altijd (twee rijen van 3 tot 6
  tegels), maar op het proefdorp op twee van de zeven niet meer, want de deuren langs het plein nemen de ruimte; het spel
  zocht de plek pas als de markt kwam. Nu kiest de maker hem als hij het land legt (dezelfde zoekregel, `T.marktBlok`), en
  staat hij in de kaart, naast de plek van de heer en de marskramer. Een deur komt er niet op uit ("The market stalls go
  there."), de schandpaal ook niet, en in het bouwmenu licht hij op, zoals het bouwbereik. Een toets over twintig eilanden:
  hij past altijd. De spelregel "De markt" en de markt als eigen gebouw van 6 bij 6 gaan weg; opslaan naar een nieuwe
  versie.
- **6b, het dorp dat er al was.** In de maker alles wat hij buiten het lege begin legt (de huizen, de boerderijen, de
  herberg, de velden, de meent, de put, de bank, de beginvoorraad), en het land zonder eiland (`opEiland`; "de wereld is
  het hele eiland"). Boer1 tot boer5 en de herbergierster in `T.MENSEN`, en wat een kaart aan huizen en mensen meebrengt
  (`js/kaart.js`, `T.zetBestaandeGebouwen`): geen kaart gebruikt het nog. Het gesprek van de herbergierster ("wat er
  gisteravond gezegd werd", vraag 38) gaat naar de waard: wie in de herberg werkt. De toetsen (zo'n veertien bestanden)
  naar het lege begin of het proefdorp; het proefdorp komt in het spel (`Spel.debug.proefdorp(zaad)`), zodat `npm run
  grootte`, `maker`, `schermen`, `tekenmeting` en `samenvatting` hetzelfde dorp zien als de toetsen.
- Gezien onderweg: in het lege begin komt er nooit vee (`opmerkingen.md`); een gat voor B.

**Stap 6: af** (12 okt, sessie `claude/gallant-faraday-d5617b`):
- **6a, de marktplek:** zoals in het plan. De maker kiest hem na het land (`T.zoekMarktPlek`, buiten de tegels van het
  kamp; een ruimere rand om het kamp liet op de meeste eilanden geen plek), en hij staat in `w.markt`. Op twintig
  eilanden minstens twee rijen van drie; past er dan minder dan `beginTegels`, dan komt de markt toch (er moet één kraam
  passen) en komen de andere langs de weg, zoals wanneer hij meegroeit. Opslaan naar versie 7.
- **6b, het dorp dat er al was:** de maker (2170 naar zo'n 1290 regels; het lege land op twaalf eilanden byte voor byte
  gelijk, want waar weggehaalde code een toevalsgetal trok, trekt hij het nog), `opEiland` en het land zonder eiland,
  `T.zetBestaandeGebouwen` en wat een kaart aan gebouwen, akkers, boeren bij hun huis, voorraad en bevolking meebracht,
  de gezinnen die de kaart in een huis zette, boer1 tot boer5 en de herbergierster, en de namen van de vijf boeren in de
  spelregels (`T.NAAM_OPTIES` is alleen nog de heer). De waard doet wat de herbergierster deed: het gesprek, 's avonds de
  tap, de tap op een feest, geen praatje 's avonds. Het proefdorp staat in het spel (`T.proefdorp` in `js/begin.js`,
  `Spel.debug.proefdorp`), en `npm run grootte`, `schermen`, `tekenmeting` en `samenvatting` spelen erop (het bulkbouwen
  van `grootte` vraagt niet naar het bouwbereik). Twee agents zetten de toetsen om en snoeiden de maker; weg zijn alleen
  toetsen die niets anders toetsten dan het oude dorp.
- **Slaapt:** de meent (een kaart kan hem nog leggen, en het vee leest hem; geen kaart heeft er een), tot het vee een begin
  heeft. **Gezien:** de natuur ligt vaak buiten het bouwbereik, en de samenvatting is oud (`opmerkingen.md`).

**De kaart voor stap 2 tot 5** (een agent, 12 okt; regelnummers van toen, dus zoek op de naam):
- **Verzoeken** (`js/verzoeken.js`, 440 regels; `VERZOEKEN_INSTELLINGEN.mensen`, de spelregel "Wie bouwt"): aangeroepen uit
  `js/voorvallen.js` (de voorvallen bouwverzoek, wapenverzoek en herbergverzoek, met `T.beginBouwverzoek`,
  `T.verzoekToegestaan`, `T.verzoekGeweigerd`, `T.kostenVanVerzoek`), hun gesprekken in `js/gesprekken.js`, de rijen
  in de balk (`T.doeOproep`, `T.oproepVoor` in `js/hud.js`), `js/raad.js` en `js/raadsman.js` (`T.verzoekZin`,
  `T.kostenVanVerzoek`), `js/tafel.js`, `js/wensen.js` en debug in `js/main.js`; `T.GESPREK_WOORDEN` krijgt er woorden
  bij.
- **Ondernemers** (`js/ondernemers.js`, 285 regels): `T.tikGebouwenDag` roept `T.tikOndernemersDag` elke dag aan;
  `js/wensen.js` leest `T.huisStemming` en `T.huisNadraagtTekst`; `js/bode.js` en debug in `js/main.js`.
- **Erven** (`js/erven.js`, 484 regels; `ERVEN_INSTELLINGEN.dorpBouwtZelf`, de spelregel "Huizen"): het gebouw `erf` in
  `T.GEBOUWEN`, en in `js/gebouwen.js` `T.inBouwmenu`, `T.plaatsGebouw` (`T.legErfAan`), `T.gezinKomt`
  (`T.gezinZoektEenErf`), `T.kanEenErfNemen`, `T.tikGebouwenDag` (`T.tikErvenDag`) en het looppad (`T.huisPlekOp`);
  verder `js/paden.js`, `js/behoeften.js`, `js/bos.js` (`g.erf`, `T.kavelVanErf`), `js/tekenen.js` (`T.paaltjesVan`),
  `js/wensen.js` (`T.huisPlekVan`, `T.erfKringTekst`), `js/hud.js`, `js/main.js`, `js/raad.js`, en `g.erf` op een hut in
  `js/bewoners.js` en `js/dag.js`. Een half gebouwde hut op een erf telt als woonruimte (`g.klaar || g.erf`): opslaan
  naar versie 6.
- **Het lot en de karakters** (`js/boeren.js`, 179 regels; de spelregel "Wie de boeren zijn"): `T.nieuwDorp` loot de
  boeren, en `T.lootBoeren` zet ook het zaad van het spel (`D.lot.zaad`, gelezen door een stuk of 14 bestanden): dat
  zaad moet naar `T.nieuwDorp`. `T.isBoer`, `T.boerFactor`, `T.aanzienVan`, `T.overBoerTekst`, `T.overBoer` in
  `js/voorvallen.js`, `js/raadsman.js`, `js/akkers.js`, `js/heer.js`, `js/hud.js`, `js/dialoog.js`, `js/verkennen.js`;
  `T.KARAKTERS` in `js/mensen.js` met hun gesprekken in `js/gesprekken.js` (zo'n 245 regels), en de voorvallen die een
  karakter vragen.
- **Het ontworpen gehucht** (`kaarten/gehucht.tmj`, "e Mag weg"): 49 toetsbestanden beginnen er met
  `T.beginOpKaart(S, 'gehucht')`, 23 zetten `T.zetOptie('wieBouwt', 'jij')`, 13 raken het lot. De toetsen van
  `erven`, `verzoeken`, `ondernemers`, `boeren`, `rooien` en `gehucht` gaan grotendeels mee weg; de rest heeft een
  andere grond nodig (het lege begin met een paar gebouwen, of een kleine proefkaart).
- **De speeltest** ("f alle vier weg"): braaf, slim, bouwer en sluw, met wat alleen zij gebruiken in `speler.js` (bouwErf,
  de verzoeken, de vrije erven); de kolonist blijft.

Te kiezen (gekozen, zie boven): (e) het ontworpen gehucht als proefkaart houden, of ook weg; (f) de oude spelers: alleen de brave houden, of
alle vier weg; (g) de karakters weg of laten slapen; (h) de wapens blijven (ze horen bij F, vechten).

## Ronde 3: voorstel van Claude (15 okt), Marcel vinkte af

Na C (de ossenkar, gemeten op 15 okt), naast stap 2 van vraag 170 (sessie `ccr-74384ea2-mxeou7`; het raakt het gevecht
niet). Twee agents brachten in kaart wat elk systeem doet en wat eraan hangt; wat opviel:

- **De voorvallen zijn gesprekken** (de namen in `T.GESPREKKEN` zijn die van de voorvallen): een dorpeling loopt naar de
  schout, en de tijd staat stil tot je antwoordt. De nieuwe richting haalde alle drie weg (het praten, de schout als
  jij, en een venster dat de tijd stilzet bij samen spelen). De raadsman, het rapport en de feesten bestaan alleen door
  de voorvallen: de raadsman beslist ze als je weg bent en brengt het rapport, een feest begint alleen met een ja op een
  voorval.
- **In wat weg kan, staat wat blijft:** de statussen (`T.OORZAKEN`: honger, eentonig, dakloos, kou, vol, wolven, droogte,
  koorts, brandgevaar, onvrede) in `js/voorvallen.js`; het dagboek (`T.schrijfOp`, 17 aanroepers, en het jaarboek in
  `js/einde.js`) in `js/ochtendrapport.js`; de prijs van een antwoord (`T.prijsVanKeuze`, `T.lotVanDeDag`) die de grillen
  van de heer gebruiken; het midden van de marktplek (`T.feestMidden`, `FEESTEN_INSTELLINGEN.kring`) in `js/feesten.js`.
- **Vier voorvallen zijn de knop van een echt systeem:** de brand (blussen of laten branden), de koorts (de put, bier of
  bidden), het zaaigraan (bewaken of laten eten) en de wolven (een jacht of een hek). Zonder voorval begint elk zelf.
- **De wensen zijn de motor van een keten:** een huis met alles wat zijn stand wil, groeit door (hut, huis, stenen huis),
  wie in een huis woont is dorpeling, en twintig dorpelingen maken het een dorp (`T.TREDEN_INSTELLINGEN`), waarmee de
  planken en het bouwmenu komen (157). Wensen weg vraagt een andere motor. De wensen zijn verder hooguit een vijfde van
  de tevredenheid (0,5 eten, 0,3 brandhout, 0,2 wensen, en wat erbij komt), en de vraag naar bier en laken.
- **Het werk heeft twee vermenigvuldigers:** de tevredenheid (`0,5 + 0,5 × tevredenheid`) en de afwisseling; het eten
  telt zo twee keer (C1 van 13 okt: "voorlopig, ronde 3 beslist").
- **De wetten** (vier, alle standaard uit) lijken op Stronghold, waar rantsoen en belasting de hefboom tussen goud en
  tevredenheid zijn; de belasting is de enige vaste bron van goud uit het dorp (in C6 raakte het goud op).
- **Samen spelen:** een keuze in een venster (`T.zetWet`, `T.kiesRaadsman`, een antwoord in een gesprek) is nu geen
  opdracht. Wat blijft, moet dat in stap 6 worden; wat weggaat, niet meer.
- **De raad blijft** (Claude): de ene regel onder het doel is de uitleg van de economie voor een nieuwe speler in de
  demo, en raakt de tijd en het samen spelen niet; alleen de raden over de raadsman en het rapport gaan mee weg.

**Marcel (15 okt), op vier vragen:**
- **De voorvallen, de raadsman, het rapport en de feesten: alle vier weg.** Eerst verhuist wat blijft; brand, koorts en
  wolven beginnen voortaan zelf, als een bericht met een plek (zoals de rovers). Willen we later weer besluiten, dan
  komen die als nieuw ontwerp: met een termijn, zonder lopen naar de schout.
- **Het werk volgt alleen de afwisseling.** De tevredenheid (eten, warmte, de herberg, de heer) beslist of gezinnen
  komen of gaan, en is het vertrouwen van het dorp.
- **De wetten: rantsoen en belasting blijven** (zoals in Stronghold); vreemdelingen welkom en kappen in het bos van de
  heer gaan weg. In stap 6 wordt een klik een opdracht en zet het venster de tijd niet meer stil.
- **De wensen en de groei: nog geen keuze** ("geen voorkeur"); de vraag komt terug bij die stap. Het voorstel van Claude:
  de wensen weg, en de huizen groeien als het dorp een maand genoeg soorten eet en warm is (de spelregel "Wants" heeft
  die weg al, "het dorp als geheel", nu op de tevredenheid); de trede blijft zoals nu. De twee andere: bouwen wat je wilt
  (The Settlers: geen groei, de trede op het aantal inwoners), of de wensen houden (Anno).

**De stappen**, elk een commit met de toetsen groen, `npm run teksten`, en `code.md` en `spel.md` bij:
1. **Verhuizen wat blijft**, zonder dat het spel verandert: de statussen naar een eigen bestand (`js/statussen.js`), het
   dagboek naar `js/dag.js`, de prijs van een antwoord en het lot van de dag naar `js/grillen.js`, het midden van de
   marktplek naar `js/markt.js`.
2. **Brand, koorts, wolven en het zaaigraan zonder voorval** (de vraag hieronder). De wolven raken `js/beesten.js`, waar
   stap 2 van vraag 170 ook werkt: dat deel na stap 2, of zo klein mogelijk.
3. **Weg:** de voorvallen (met hun gesprekken, het uitroepteken en `e.zoektSchout`, de spelregel "Events"), de raadsman
   met zijn venster (R, de spelregel "Advisor", het trager maaien), het rapport (de knop, de spelregel), de feesten (de
   meiboom, de kerstboom, de vrije dag, de spelregel), en de raden die eraan hingen; het opslaan een versie omhoog; de
   speeltest antwoordt niet meer op voorvallen.
4. **Het werk alleen op de afwisseling.**
5. **De wetten:** rantsoen en belasting.
6. **De wensen en de groei**, als Marcel gekozen heeft.

## Later

- **Ronde 2, na 1f:** `js/verzoeken.js` en `js/ondernemers.js` (de mensen vragen wat ze bouwen), `js/erven.js` (het
  dorp bouwt zelf op een erf), de vaste boeren van de kaart en `kaarten/gehucht.tmj`, het lot en de karakters van de
  boeren (`js/boeren.js`, `T.KARAKTERS` met hun gesprekken; Marcel, 11 okt, bij 1e: "De karakters zetten we even opzij.
  Ik weet niet of die handig zijn in de nieuwe setting"), en (voorstel van Claude, bij 1e) de wijnboerderij en
  `js/ontginnen.js`: in het lege begin is de wijngaard een veld bij een boerderij, en rooien de bouwers een veld, niet de
  boer; de spelregels "Het begin", "Je
  gehucht", "Wie bouwt", "Huizen", "Wie de boeren zijn" en "De markt" (op het plein vanzelf, of een gebouw dat jij zet).
- **Ronde 3, na de proef (C):** `js/voorvallen.js`, `js/raad.js`, `js/raadsman.js` en het venster, `js/ochtendrapport.js`,
  `js/wensen.js` met het huisbriefje, `js/treden.js`, `js/behoeften.js` (de groei), `js/wetten.js` met het menu,
  `js/feesten.js`; de spelregels "Voorvallen", "Raad", "Raadsman", "Het rapport", "Wensen", "Achteruitgaan",
  "De herberg en de markt" en "Feesten".
- **Bij de heer (E):** `js/heer.js`, `js/brieven.js`, `js/grillen.js`, `js/heervaart.js`, `js/bazen.js`; de spelregels
  "Waarin de heer betaald wil worden", "Hoe de heer telt", "Het goud in de kist", "Wat de heer van het graan vraagt", "De
  schout aan de schandpaal", "Heervaart" en "Twee bazen".

## Blijft, zonder keuze

- **Spel en dorp:** `dorp`, `opslaan`, `menu`, `taal`, `naam`, `tijd`, `dag`, `opties`, `main`.
- **Wereld en lopen:** `wereld`, `pad`, `lopen`, `praatje`, `anim`, `verkennen`.
- **Het land:** `eiland`, `maker`, `hoogte`, `kaart`, `gebied` (de proefkaarten), `begin`.
- **Beeld en scherm:** `iso`, `tekenen`, `gl`, `sprites`, `doorkijk`, `bouwstijl`, `kleinleven`, `zien`, `ui`, `dialoog`,
  `tafel`, `hud`.
- **De mensen:** `mensen`, `bewoners`, `leven`, `boeren` (verandert in 1e), `gesprek` en `gesprekken`.
- **Bouwen en de economie:** `gebouwen`, `akkers`, `veldwerk`, `bos`, `vee`, `weer`, `graanschuur`, `wijngaard`,
  `herberg`, `markt`, `paden`, `voorraad`, `handel` (de marskramer), `bode`.
- **Wat het dorp overkomt:** `brand`, `koorts`, `beesten`, `rovers` (met de militie), `gevecht`.
- **De spelregels die een echte keuze zijn:** "Graan", "Honger buiten de winter", "Vruchtbaarheid", "Het vee", "Het vee
  in de winter", "Wat de schapen 's winters eten", "De mest uit de schaapskooi", "Het seizoen", "Vlees", "Vis",
  "Dagloners", "Het weer", "De bode", "Brand", "Ouder worden", "Kleren", "Klein leven", "Koorts", "Door een huis heen
  kijken", "Tekenen", "Wie je door een huis heen ziet", "Schaduwen", "Hoogte", "Paadjes", "De bomen in het jaar",
  "Praatjes", "Beesten", "Groei" en "Zaaigraan".
