# Kaarten: van Tiled naar het spel

Wat er op die kaarten komt te staan, staat in `wereld.md` en `toren.md`.

**Sinds 12 okt** (ronde 2 van het snoeien, stap 3c) is er geen ontworpen gehucht meer: `kaarten/gehucht.tmj`, zijn
betekenis en `gereedschap/tiled/maak-gehucht.cjs` zijn weg (git bewaart ze). Je dorp is het land van de maker op het
eiland, met het lege begin erop; in Tiled staan nog de proefkaarten (`proef`, `proefbos`). Wat hieronder over het
gehucht in Tiled staat, is hoe het was.

## Het eiland: de kaartenmaker (vraag 117, 8 okt 2026)

Marcel (7 en 8 okt): "Uiteindelijk wil ik een random map generator met alles", "Ik wil 1 aaneengesloten landschap", en
"Fog of war maakt de rest van het land 'onzichtbaar' tot je het verkent". Het plan en zijn stappen staan bij vraag 117
in de werklijst.

**Zo werkt het nu (stap 1, alleen de plaat; het spel gebruikt het nog niet):** `js/eiland.js` maakt uit één nummer een
eiland van 2500 bij 2500 tegels, in twee lagen, zoals een schilder eerst grof zet waar de zee, de bergrug en de rivieren
komen, en daarna elk blaadje schildert. Het is één landschap; de schets zie je nooit.

- **De schets** (`T.maakEiland`, zo'n 0,6 s): het eiland in vakken van 8 bij 8 tegels. Hij kent wat het hele eiland
  moet kennen, en dat kan geen rekensom per tegel zijn: een rivier moet weten waar de zee is. Vanaf de zee gaat hij het
  land in, steeds het laagste vak eerst (priority-flood), zodat elk vak een weg naar zee heeft; waar genoeg regen
  samenkomt, stroomt een rivier. Heuvels uit ruis hebben overal kommen (de eerste plaat had 167 meren), dus worden alleen
  de zeven grootste een meer, staat een te groot meer lager, en slijt de rivier zich door de rest een weg naar buiten.
  Dan de plekken (het kasteel op een heuvel, de stad aan de monding van de grootste rivier, acht dorpen ver genoeg uit
  elkaar) en de wegen ertussen (A\* over de vakken, door de dalen en over de passen, met een brug waar de rivier smal is,
  en samen waar het kan). Hij wordt niet bewaard: hetzelfde nummer maakt hem opnieuw.
- **Het detail** (`T.eilandStuk`, zo'n 1,5 µs per tegel: het hele eiland in 9 s, een stuk van 64 bij 64 in 6 ms): per
  tegel een rekensom uit het nummer en de schets, zoals de hoogte van vraag 121: de hoogte (de kust, het land dat naar
  binnen oploopt, de heuvels, de bergrug, de fijne glooiing, en de dalen die de rivieren uitslijten), het water, de weg,
  de streek en de bomen. Een stuk is hetzelfde hoe je het ook vraagt; zo kan het spel het land maken aan de rand van de
  mist, waar je het niet ziet gebeuren.
- **De ruis** is gradiënt-ruis op een driehoeksrooster, elke laag anders gedraaid, en het land een beetje verbogen: de
  waarde-ruis van `js/hoogte.js` liet op 2500 tegels een raster zien.
- **Alleen optellen, vermenigvuldigen, delen en wortels**, geen sinus of macht: zo maakt elke browser uit hetzelfde
  nummer hetzelfde eiland (`test/eiland.test.cjs` kijkt het na). Verandert de kaartenmaker, dan geeft hetzelfde nummer
  een ander eiland; tot de release mag dat, daarna onthoudt een spel met welke kaartenmaker het begon.
- **De plaat:** `node gereedschap/pixelart/eiland-plaat.cjs [nummer ...] [--groot]` tekent het eiland van boven, met de
  namen, en ernaast je land van 100 bij 100 met de rand die je mensen kennen, tegel voor tegel
  (`gereedschap/pixelart/uit/eiland/`). Op de plaat is x naar rechts en y naar onder; de camera van het spel kijkt dan
  van rechtsonder.

**Je dorp op het eiland (stap 2a, 8 okt; Marcel: "A ja B later C dorp dat er al was", en "Het eiland wordt gewoon altijd
gegenereerd bij een nieuw spel"):** elk nieuw spel maakt het eiland, en je land van 100 bij 100 is het stuk van het eiland
om jouw dorp (de spelregel "Je gehucht" is weg sinds ronde 2 van het snoeien, stap 3, en het land zonder eiland,
`opEiland`, sinds stap 6). `T.landVanEiland(E, plek, b, h)` geeft
de maker per tegel en per hoekpunt de streek, de bomen en waar de wegen van het eiland het land verlaten (die naar het
kasteel is de uitgang); `T.eilandVan(zaad)` onthoudt het laatste eiland, want het is uit het nummer te maken. De maker
legt er het lege land op (sinds ronde 2 van het snoeien, stap 6; Marcel: "Alles wordt door spelers geplaatst"): de open
plek voor het plein met de plek van het kamp, en de weg ernaartoe (A\* om het water heen, met een recht bruggetje over
smal water), in het bos van het eiland. Tot dan legde hij er een dorp dat er al was: huizen om het plein, boerderijen met
akkers en een meent. De grond
komt van de streek (`T.grondVanStreek`; sinds B van 2a met eigen tegels, hieronder). Een kaart van het eiland onthoudt waar hij ligt (`w.eiland`: het nummer en
de hoek van je land op het eiland). Lukt het gehucht op jouw plek niet, dan op die van een ander dorp.

**Het eiland om je land (stap 2b, 8 okt; Marcel: "A ja"):** buiten de kaart loopt het eiland door: de zee, het strand,
de heide, het bos en de rotsen die het eiland daar heeft, en de weg naar de buren, ring na ring donkerder tot het donker
(zoals het bos om een land van de maker, `js/tekenen.js`). `T.randVanHetEiland(w)` (`js/maker.js`) rekent het één keer
per kaart uit, 16 tegels ver, met de regels waarmee de maker binnen de grond en de bomen legt (`T.grondVanStreek`: water
wint, wat ernaast ligt is gras, de weg zandpad, de heide alleen naast gras; een boom waar het eiland er een heeft, op
gras); aan de naad past de rand zich aan de kaart aan, zodat elke tegel een tegel heeft. Het staat niet in `Spel.S`: het
komt uit het nummer. Onder het bos ligt op het eiland gras, net als binnen, zodat er geen naad is; om een land van de maker
blijft het zoals het was. Met "Hoogte" op "Heuvels" is het land dat van het eiland (`hg.eiland` in `w.hoogte`, `js/hoogte.js`):
de grond, een meer of een rivier op zijn peil, en de zee op 0, in plaats van de drie lagen ruis uit het nummer van het
land; het dorp ligt op zijn vlakte en de vlakke stukken liggen vlak zoals altijd, en de richel bij de rotsen blijft. Om het
dorp is het eiland zachter dan die ruis: een dorp ligt waar het vlak is (aan de kust 0 tot 80 pixels, landinwaarts zo'n
150 à 200 van laag tot hoog); de bergrug, tot 1250 pixels, ligt ver weg. De hoogten van het eiland komen voor de kaart en
48 tegels eromheen uit één lijst (`T.eilandStuk`), eens per hoogte, en ook die staat niet in `Spel.S`.

**De grond van het eiland (B van 2a, 8 okt; Marcel: "dan gaan we de eigen tegels maken"):** elke streek zijn eigen
grond, met tegels uit `tegels/kust.png` naast die van `rand.png` (`beeld.md`, "De grond van het eiland"): de zee ('e'),
een meer of een rivier (water, 'w'), het strand, de duinen en het zand (strand, 's'), het veen ('v'), het broek ('b'), de
heide ('h') en de rest gras ('g'), met de weg en de akkers zandpad ('z'). Welke twee soorten samen in één tegel kunnen,
zegt `T.grondPaar` (gras met alles behalve de zee, het strand met de zee, het gras en de heide, het water met de zee, en
het zandpad met de kasseien); wat niet past, wijkt (`T.passendeGrond`): naast de zee voor strand, anders voor gras, en het
water, de zee, een weg en de kasseien wijken nooit. Waar drie soorten in één tegel samenkomen, of een paar zonder tegel
(een rivier die in zee loopt), wordt het er een met twee of één (`T.grondTegelHoeken`). De rand om de kaart doet
hetzelfde, maar de kaart wijkt daar niet: kan wat naast de kaart ligt niet aan de zee grenzen, dan wijkt de zee ervoor
(hooguit twee hoekpunten). **Op zand wordt niet gebouwd** (Marcel: "zand is geen solide basis"; `T.waaromNietOpDezeGrond`):
geen huis of akker. De zee is water
(`T.isWaterGrond`): niet te belopen, de visser vist er, en ze ligt vlak met het andere water. Het veen en het broek zijn
als gras (er groeit wat op gras groeit). Een land van de maker zonder het eiland blijft tegel voor tegel hetzelfde.

**Wat er nog komt:** het hele eiland, met de mist en een kaart die meegroeit (B2, hieronder).

## Het hele eiland: de kaart in stukken en de mist (B2, vraag 117, stap 3; plan van 13 okt 2026)

Marcel, 11 okt: "de wereld moet 1 geheel worden het vlakke van 100x100 is niet hoe het blijft". Het plan (Claude, 13 okt,
sessie `claude/amazing-maxwell-u0hq09`; **Marcel: "A ja, B1, C2"**).

**Hoe het was (13 okt):** je land is één kaart van 100 bij 100, die de maker als een kaart uit Tiled laadt
(`T.laadGemaaktGehucht`, `T.laadKaart`): `w.tegels[y][x]` (een woord per tegel) en `w.grond[y][x]` (een gedeelde
tegel), elke boom een los voorwerp (zo'n 4000 bij een leeg begin), en eromheen 16 tegels eiland die alleen getekend
worden (`T.randVanHetEiland`; de hoogte 48, `hg.eiland`). `w.tegels[` staat 39 keer in 15 bestanden, `w.b` en `w.h` 103
keer in 12, en de afgeleide lijsten van b bij h (het vaste raster en de eilanden in `js/wereld.js`, de velden in
`js/lopen.js`, de paden, het bos van de beesten, de natuur bij een gebouw, de beken van het weer) gaan van één rechthoek
uit. Het bewaarde spel is bij een leeg begin 473 kB, vier vijfde de kaart. Er is geen mist. Wat al meewerkt: het tekenen
gaat in stukken en alleen wat in beeld is (`js/tekenen.js`, sinds 9 okt), A\* (`js/pad.js`) heeft geen raster en zijn
nummers passen op het hele eiland, en `T.eilandStuk` maakt elk stuk los (64 bij 64 in zo'n 12 ms in Node).

**De stappen** (A: "ja"):
1. **B2a, één weg naar de tegels: af** (13 okt). Niets leest de rechthoek nog zelf: alles vraagt het aan
   `js/wereld.js` (`T.tegel`, `T.zetTegel`, `T.grondOp`, `T.opKaart`, `T.kaartVak`, `code.md`), en
   `test/tegels.test.cjs` houdt het zo. Het spel veranderde niet: de speeltest (kolonist, zaad 1 tot 3) liep op alle
   drie de eilanden precies hetzelfde af, en de 23 schermen bleven byte voor byte gelijk. Wel nieuw: het slijten van
   de paadjes telt per tegelnummer (`T.tegelNummer`), dus versie 9 van het bewaarde spel. **Wat B2b nog moet weten:**
   een lijst over de hele kaart beslaat nu `T.kaartVak(w)` en moet een eigen vak krijgen; de rand van het eiland
   (`T.randVanHetEiland`, en de bosrand en de grond erbuiten in `js/tekenen.js`) rekent vanaf de hoek van de kaart en
   gaat weg; het toeval van de beesten (`lot(..., y * vak.b + x, ...)` in `js/beesten.js`) hangt aan de breedte van het
   vak; een stuk of zes toetsen maken een kaart zonder `b` en `h` (boomvormen, groen, treden, wensen, hooi, weides), en
   veel toetsen en het gereedschap (`gereedschap/grootte/`, `wereld-tool.js`, `keuring.js`) lezen `w.tegels` nog zelf.
2. **B2b, de kaart in stukken.** De kaart is het eiland, in stukken van 64 bij 64 als compacte getallen, in de
   coördinaten van het eiland. Een stuk wordt uit het nummer gemaakt als het nodig is, verspreid over de beelden; de
   bomen staan per stuk. De rand om je land en het donker erachter gaan weg, want het eiland is de kaart. Wat nu een
   lijst over de hele kaart is, wordt per stuk of per gebied. Een kaart uit Tiled (de proefkaarten) is een eiland met
   niets eromheen: één soort kaart.
   **Het plan van B2b** (Claude, 13 okt, sessie `claude/funny-fermi-5fqm1u`; Marcel: "Het eiland, overal", "Overal",
   en het opslaan "Meteen mee"). Gemeten: een stuk van 64 bij 64 met zijn hoekpunten kost in Node zo'n 12 ms
   (`T.eilandStuk` twee keer), de schets 1 s (één keer per spel). Wat in de weg zat: de maker legt zijn bomen, struiken,
   rotsen en groen met één dobbelsteen die van tegel naar tegel doorloopt, dus een stuk kan niet los; de rand om de kaart
   (`T.randVanHetEiland`) is een tweede manier, met een naad. **Besloten:**
   - **Het land komt overal van het eiland** ("Het eiland, overal"): de grond, de bomen, de rotsen en het groen per tegel
     uit het nummer en de plek, nooit uit een dobbelsteen die doorloopt, zodat een stuk hetzelfde is in welke volgorde
     je het maakt. De maker doet alleen nog wat mensen deden: het plein open, de wegen naar het plein, het kamp, de
     marktplek, de eiken op het plein, en de rotspartij bij het dorp. De rand en zijn naad gaan weg. Je dorp ligt bij
     hetzelfde zaad dus anders dan nu, en de speeltest geeft andere getallen (maar geen fouten).
   - **De schout mag overal heen** ("Overal"), al vóór de mist: een stuk wordt gemaakt als het in beeld komt of als je
     mensen in de buurt komen, hooguit één per beeld. Wat over de hele kaart rekende, rekent om je dorp of per stuk.
   - **B2d gaat mee** ("Meteen mee"): het bewaarde spel houdt alleen wat er veranderde (wat gebouwd, gehakt en gelegd
     is), niet de stukken; een geladen spel maakt ze opnieuw uit het nummer. `versie` omhoog.
   **De stappen:** (1) het stuk: één zuivere functie (nummer, schets, plek erin; tegels, grond als getal, en de dingen
   eruit), met een toets dat de naden passen en de volgorde niet uitmaakt; (2) de kaart is het eiland, in zijn
   coördinaten, en de vragen naar een tegel kijken in de stukken; (3) de maker doet alleen nog het menselijke, en de
   rand gaat weg; (4) elke lijst over de hele kaart krijgt zijn eigen vak; (5) stukken als ze nodig zijn; (6) opslaan
   wat veranderde; dan meten (de kolonist op vijf eilanden, de schout naar de kust op 30×, de schermen).
   **Stap 1 is af** (13 okt): `T.landStuk` in `js/maker.js` (`code.md`), met `test/landstuk.test.cjs`; 40 ms per stuk in
   Node, twee derde in de ruis van het eiland. **De bruggetjes van het eiland zijn af** (`E.bruggen`, 0,1 s per schets).
   **Stap 2, 3, 4 en 6 zijn af** (13 okt, sessie `claude/funny-fermi-5fqm1u`, nog niet in `main`): de kaart van het
   eiland (`T.eilandKaart`, `test/eilandkaart.test.cjs`), de maker legt alleen nog het menselijke en de kaart neemt het
   verschil over, de rand is uit het tekenen, en de hoogte rekent in de tegels van het eiland (`hg.ox`, `hg.oy`). Het
   lopen (het vaste raster, de eilanden van A\*, de velden) beslaat alle open stukken (`T.loopVak`), de lijsten om het
   dorp het dorpsvak (`T.kaartVak`). Opslaan: versie 10, het bewaarde spel is 15 kB (was 473 kB); een nieuw spel kost in
   Node zo'n 2 s. Alle toetsen zijn groen, en de kolonist speelt de eilanden 1 tot 5 het jaar uit, zonder fouten en
   zonder doden (vóór B2b viel de schout op 1 en 3). Wat het opleverde: de weg van het eiland liep tot midden op het
   plein (nu houdt hij op aan de rand), `T.ruimLaagOp` zag niet wat er op het eiland groeit (nu `T.voorwerpenIn`), wie
   buiten het dorpsvak stond vond geen weg (nu `T.loopVak`), en een boer die bij de schaft net aankwam, schafte niet. Het
   proefdorp houdt zaad 2 (vijf andere zaden gaven meer rode toetsen) en zet zijn hutten met drie tegels ruimte, zodat ze
   kunnen doorgroeien; de maker keurt nu ook de marktplek (rijen van minstens `marktRij`, 3: op eiland 8 en 9 waren het
   er twee). Wat opviel en nog te kiezen is, staat in `opmerkingen.md`: een richel zonder helling blijft onbereikbaar,
   en een hol kan tien tegels van het kamp liggen. **Nog te doen: stap 5** (stukken openen als je mensen in de buurt
   komen) en het meten (de schout naar de kust op 30×, de schermen).
   **Gemeten voor stap 5** (13 okt, Node, eiland 2, acht stukken op een rij naar het oosten): een stuk maken kost 45 tot
   70 ms (`T.landStuk` en het stuk erover), en daarna het vaste raster en de eilanden van A\* opnieuw over `T.loopVak`
   nog 20 tot 45 ms, groeiend met de rechthoek om alle open stukken (van 192 bij 192 naar 704 bij 192). Samen 70 tot
   100 ms, vijf beelden: op 30× loopt de schout zo om de seconde een nieuw stuk in, dus dat hapert. Loopt hij schuin,
   dan groeit de rechthoek in twee richtingen, met vooral stukken die niet open zijn.
   **Besloten voor stap 5** (Marcel, 13 okt): **"Eerst meten"**: eerst het eenvoudigste, een stuk per beeld openen, en
   in de browser op 30× meten hoe erg het hapert; daarna kiezen tussen verdelen (het stuk vooruit maken, een paar rijen
   per beeld, en het raster alleen voor het nieuwe stuk bijwerken) en een worker. En **"Al je mensen"**: wie van jou in
   de buurt komt (de schout, je dorpelingen, de ossenkar), maakt het land open, zoals straks in de mist elk van je
   mensen een kring ziet.
   **Stap 5 eenvoudig gebouwd en gemeten** (13 okt, `T.werkStukkenBij`): in de browser (Chromium zonder videokaart, 1920
   bij 1080, het proefdorp op eiland 2), de schout op 30× van het kamp naar de kust (112 tegels naar het zuiden) en dan
   langs de kust naar het noordwesten: 19 nieuwe stukken in 21 s, een per 1,1 s. Gewone beelden kosten 4 ms (mediaan),
   maar het beeld waarin een stuk opengaat 100 tot 170 ms: het stuk maken 20 tot 47 ms, de rest van de regels (het raster
   van het lopen en de wegen opnieuw) 11 tot 82 ms, groeiend met de rechthoek om de open stukken, en het tekenen 35 tot
   58 ms. Dat hapert: op 30× ongeveer elke seconde een zesde seconde stil, op 1× elke halve minuut. Waar het in zit, alle
   drie: het stuk zelf, het raster over de hele rechthoek (ook geheugen: een veld van het lopen is twee bytes per tegel
   van die rechthoek), en het tekenen.
   **Besloten** (Marcel, 13 okt: **"Alles per stuk"**): het raster van het lopen, het tekenen en het laden van de plaatjes
   werken alleen het nieuwe stuk bij, en het stuk wordt vooruit gemaakt voordat iemand er is. Geen worker; daarna
   opnieuw meten, en pas een worker als het stuk zelf dan nog hapert.
   **Gebouwd en opnieuw gemeten** (13 okt, hoe het werkt in `code.md` bij de kaart van het eiland): een nieuw stuk is
   geen kaartverandering meer, en alles neemt alleen het nieuwe stuk erbij. Dezelfde tocht naar de kust: het beeld
   waarin een stuk opengaat, kost nu 1 tot 7 ms aan regels (was 31 tot 129) en 5 tot 30 ms aan tekenen (was 35 tot
   58), en 13 van de 18 stukken lagen al klaar. Wat niet klaar lag (twee stukken vlak na elkaar, of de schout die van
   richting verandert), kost nog 20 tot 40 ms: dat is in deze browser van 20 beelden per seconde; in een gewone van 60 is
   er drie keer zoveel tijd om vooruit te maken. Een gevelde boom kost het lopen nu niets meer, ook als je veel land
   kent (was 13 ms bij 54 stukken). De zwaarste beelden die overblijven, zijn de nacht van het dorp (70 tot 120 ms),
   die er al was: iets voor later, niet voor de stukken (13 okt opgelost met `T.bosInVak`: nu 29 tot 38 ms). Een worker is niet nodig.
   **Wat de meting mat** (13 okt, stand 3dba66b, dezelfde browser zonder videokaart, het proefdorp op eiland 2, 30×):
   met de schout stil bij het kamp kost het tekenen 11 ms, maar ligt er 50 ms tussen twee beelden (17 per seconde);
   11 tegels zuidelijker, in het bos, 47 ms tekenen en 83 ms tussen twee beelden (12 per seconde). Twee dingen. Het
   eerste: in het bos staan 19 tot 31 bomen vóór de schout, en elk tekent zijn eigen kijkgat om hem heen
   (`T.tekenKijkgat`), elk beeld hetzelfde gat; zonder kijkgaten 10 ms tekenen en 67 ms tussen twee beelden. Het tweede:
   "tekenen" is alleen de tijd van de code; zonder videokaart schildert de browser het beeld grotendeels daarna, en een
   plaatje dat elk beeld nieuw is (zoals een kijkgat) dwingt hem dat midden in het tekenen te doen. Het getal schuift
   dus heen en weer; eerlijk is de tijd tussen twee beelden. Met een videokaart (de spelregel Tekenen, standaard) gaan
   de 1100 bomen in beeld in 57 tot 89 opdrachten, en kost elk kijkgat een plaatje naar de kaart (17 tot 32 per beeld).
   Verder: een kaartverandering tekent alle grond in beeld opnieuw (zes stukken van de buffer, 49 ms tekenen in plaats
   van 11), en 8 van de 18 nieuwe stukken lagen niet klaar (23 tot 64 ms land maken). Het plan staat in de werklijst.
   **Het ontwerp van stap 2 tot 6** (Claude, 13 okt; zo kan een volgende sessie verder):
   - *Wat in S staat* (bewaard): wat veranderde, per tegelnummer (`T.tegelNummer`): `w.tegelsAnders` (Map naar het woord),
     `w.grondAnders` (Map naar de grondtegel; alleen de maker verandert de grond, het spel nooit), `w.gerooid` (Set: een
     ding van het eiland dat weg is); de dingen die iemand zette in `w.voorwerpen`, zoals nu; en `w.open` (Set van
     stuknummers: waar je mensen kwamen; B2c maakt er de mist van). Een boom wordt al met zijn plek aangewezen
     (`g.boom = { x, y }`); `v.teKappen` gaat naar een Set op de kaart, want een ding van het eiland wordt niet bewaard.
   - *Wat niet in S staat*: de stukken zelf (een WeakMap per kaart in `js/wereld.js`, zoals de lijst per tegel), elk
     `{ tegel, grond, voorwerpen }`, gemaakt uit `T.landStuk` met wat veranderde erover; een geladen spel maakt ze opnieuw.
   - *De vragen*: `T.tegel` zegt 'buiten' op een stuk dat niet open is, zodat A\* nooit een stuk laat maken en de regels
     niet van de camera afhangen; het tekenen maakt wat in beeld is, hooguit één stuk per beeld. `T.voorwerpOp` kijkt eerst
     in `w.voorwerpen`, dan in het stuk; `T.haalVoorwerpWeg` op een ding van het eiland zet zijn tegel in `w.gerooid`.
     Wie nu alle `w.voorwerpen` afloopt om een boom te vinden (53 plekken), vraagt `T.voorwerpenIn(w, vak)`.
   - *Het vak*: `T.kaartVak(w)` wordt op een kaart van het eiland het vak om het dorp (`w.vak`, eerst het land van 100 bij
     100 van nu), zodat de lijsten om het dorp (de beesten, de paadjes, de natuur bij een gebouw) blijven werken; in stap 4
     krijgt wat niet om het dorp gaat (het tekenen, de eilanden van A\*, de lichtkaart) een eigen vak.
   - *Een kaart uit Tiled* (de proefkaarten) houdt `w.tegels` en `w.grond` achter dezelfde vragen; buiten is 'buiten'.
   - *Het tekenen* (`js/tekenen.js`): de rand (`randDof`, `randBos`, `tekenBuitenGrond`, `bosrandOp`, `bosVoorBij`,
     `T.randVanHetEiland`) gaat weg, de lichtkaart (`lichtKaartVan`) en `hoogsteVan` gaan per stuk, en de voorwerpen per
     stuk in beeld in plaats van elk beeld alle `w.voorwerpen`. De buffer van de grond werkt al in stukken van het
     scherm en hoeft niet om.
   - *De wegen zijn die van het eiland* (Marcel, 13 okt: "Die van het eiland"): ze komen al op je plek uit, en de maker
     legt geen eigen wegen meer. Waar een weg van het eiland een rivier of een meer kruist, legt het eiland een recht
     bruggetje (in de schets, `E.bruggen`, hooguit `eilandBrug.lang` tegels water), zodat je over de wegen het hele
     eiland over kunt.
   - *Nog te doen voor de spelregel Hoogte* (standaard uit): de hoogte per stuk (`w.hoogte` is nu één raster).
3. **B2c, de mist.** Zwart wat niemand van jou zag, grijs wat je zag maar nu niet ziet, helder waar je mensen kijken.
   Elk van je mensen ziet een kring om zich heen (de schout verder), en je gebouwen ook; de getallen in de werkbank. Een
   stuk wordt gemaakt aan de rand van de mist, en je bouwt alleen op land dat je kent. **Het grijs is het land zoals het
   nu is** (B1): de grond, de bomen en de gebouwen, zonder wie er loopt (mensen, beesten, rovers). Precies zoals je het
   het laatst zag (B2) kan later erbovenop, als een ander iets doet waar jij niet kijkt (F). **Bij het begin ken je een
   kring van zo'n 50 tegels om je plek** (C2, een getal in de werkbank), ongeveer je land van nu; de rest is zwart.
   **Het plan van B2c** (Claude, 13 okt, sessie `ccr-1d9fab2a-huux51`; **Marcel: "A2, B1, C ok"**):
   - *De regel* in `js/mist.js`: wat je kent staat in S en wordt bewaard (per stuk een bitpatroon, een stuk dat je
     helemaal kent als `true`; versie 11); wat je nu ziet, rekent het spel elk beeld uit waar je mensen en je gebouwen
     staan. Het land gaat open zoals in B2b (`openRond`, 16 tegels), verder dan iemand kijkt, dus wat je ziet ligt klaar.
   - *Het grijs* (A2: "donkerder en ontkleurd"): over de grond een zacht masker (een pixel per tegel, schuin over de grond
     gelegd), en elk ding (een boom, een huis) naar de tegel waar het staat, zodat een hoge boom aan de rand niet half
     grijs wordt. Wie in het grijs of het zwart loopt (beesten, rovers, mensen van een ander), teken je niet en wijs je
     niet aan.
   - *Een klik in het zwart* (B1): de schout loopt erheen als er een weg is.
   - *Hoe ver ze zien* (C: "ok"): de schout 12 tegels, een dorpeling 7, de ossenkar 7, een gebouw dat af is 6, en wat je
     bij het begin kent 50; de getallen in de werkbank.
   - *Bouwen alleen op land dat je kent*: een gebouw en een veld.
   **Gebouwd** (13 okt, sessie `ccr-1d9fab2a-huux51`; hoe het werkt in `code.md` bij `js/mist.js`, en in `spel.md`, "Zo
   werkt de mist nu"). Erbij, omdat de toetsen het lieten zien: **het plein kijkt ook**, zoals een gebouw dat af is (6
   tegels vanaf zijn rand), anders werd je eigen plein grijs als er niemand stond. Wat het tekenen leerde: zonder
   videokaart kost een filter op het doek bij elk plaatje een bewerking van het hele vel (een vel bomen is 2000 bij
   1400), en het beeld liep er vast; daar tekent het een grijze kopie van het stukje, één keer gemaakt. De schaduwen van
   de zon komen vóór de mist (anders vielen ze over het zwart), en wat ui is erna (het pad naar een tegel in het zwart zie
   je). Het bewaarde spel van een leeg begin is 23 kB (was 15): de zes stukken van de kring van 50 zijn half bekend.
   **Gemeten** (13 okt, `npm run stukmeting`, Chromium zonder videokaart, 1920 bij 1080, de schout op 30× naar de kust):
   zonder mist 32 beelden per seconde. De eerste mist (twee schuine lagen over het scherm: ontkleuren met 'saturation' en
   donker maken) gaf 16: het ontkleuren kostte 33 ms per beeld, het donker maken 17, de grijze dingen en het masker niets.
   Nu is het zonder videokaart één laag (grijzer en donkerder in één kleur per tegel), op een doek van een kwart van het
   scherm en zonder uitsmeren opgeschaald: 30 beelden per seconde. Het grijs is daar dus grijzer in plaats van ontkleurd
   (zoals de nacht zonder videokaart de eenvoudige laag bleef); met de videokaart is het precies A2. De kolonist speelt de
   eilanden 1 tot 5 het jaar uit zonder fouten. Nog niet: op een kaart met hoogte (de spelregel Hoogte, standaard uit)
   ligt het masker plat.
4. **B2d, opslaan wat veranderde** (gaat mee in B2b, Marcel 13 okt: "Meteen mee"). Het eiland komt uit het nummer; het bewaarde spel houdt per stuk alleen wat er
   gebouwd, gehakt en gelegd is, en wat je verkende. Een oud bewaard spel past dan niet meer (`versie` omhoog; tot de
   release mag dat). Het moet ook klein blijven voor de opslag van de browser (een paar MB, `verpakken.md`).

Klaar als: de kolonist speelt het lege begin op vijf eilanden een jaar zonder fouten (zoals 1f), de schout loopt van
het kamp naar de kust zonder te haperen, en het bewaarde spel is kleiner dan nu. **Naar F** (A: "ja"): de lange tochten
(HPA\* over de stukken) en wat ver weg is als getallen; C speelt in een paar honderd tegels om je dorp, en daar is A\*
door land dat je kent goed genoeg.

**Meer draden voor de stukken?** (Marcel, 13 okt: "misschien ook meerdere threads voor het maken van de blokken van
64x64?") Kan, met Web Workers: een stuk is een rekensom uit het nummer en de schets, zonder iets van het spel, dus het
kan op een andere kern, en het geeft daar hetzelfde. Wat het kost: een worker van een bestand werkt niet vanaf
`file://` (wel in Electron, en als blob uit code die al geladen is), de schets moet eenmaal naar elke worker, en een
stuk komt een paar beelden later, dus het spel moet het vooruit vragen (aan de rand van de mist) en kunnen wachten. Het
voorstel van Claude: B2b maakt het stuk met één zuivere functie (nummer, schets en plek erin, getallen eruit), zodat een
worker het later overneemt zonder herschrijven; we meten dan eerst wat een stuk in de browser kost, met de grond en de
bomen erbij, terwijl de schout op 30× loopt. Hapert het, dan workers. **Marcel (13 okt): "eerst meten is goed."**

## Werken in Tiled: zo teken je een kaart (21 sep 2026)

**Het idee in één zin:** in Tiled plak je geen losse tegels, je schildert *soorten grond* — gras,
zandpad, kasseien, water — en Tiled kiest zelf de tegel met de goede rand. Elke tegel heeft vier
hoeken; jij kleurt hoeken, Tiled zoekt de tegel waarvan de vier hoeken kloppen. Daarom heet het
"terrein".

**Beginnen.** Open `gereedschap/tiled/nieuwe-kaart.tmj` in Tiled en kies meteen *Bestand > Opslaan
als*, naar `kaarten/<naam>.tmj`. Die naam wordt de naam van het gebied (`dorp.tmj` → het dorp).
Alles staat al goed: isometrisch 64×32, een grasveld van 48×40, de lagen `grond` en `objecten`,
alle tegelvellen, en links in het midden een uitgang terug naar het erf. Groter maken kan met
*Map > Formaat veranderen*.

**Grond schilderen.**

1. Klik links bij de lagen op `grond`.
2. Open rechtsonder het tabblad **Terreinsets** (naast Tilesets).
3. Kies een set. Elke set heeft twee kleuren: de ondergrond en wat erover komt. *Gras over zand*
   voor een pad, *Gras over kasseien* voor een plein, *Gras aan water* voor een beek of vijver,
   *Zand over kasseien* waar een pad een plein raakt.
4. Klik de kleur aan die je wilt schilderen (bijvoorbeeld *zandpad*), pak de **terreinkwast** uit
   de werkbalk, en sleep over het gras. Er komt een pad met nette randen en karrensporen.
5. Weghalen = er met de andere kleur (*gras*) overheen schilderen. De gum werkt ook, maar laat een
   gat achter.

Let op: vul nooit met de stempels uit `grond.tsx` (die zitten bewust niet in het beginbestand).
Tiled herkent die niet als terrein, en dan kloppen de randen eromheen niet.

**Een beek met een brug.** Eerst het water (*Gras aan water*, kleur *water*). Dan de brug erop met
de gewone **stempelkwast**, niet met terrein: in `rand.tsx` zijn de tegels 240, 241 en 242 begin,
midden en eind van een brug die naar rechtsonder loopt, en 243, 244 en 245 van een brug naar
linksonder. Zoveel middenstukken als de beek breed is. Pas daarna het pad ertegenaan: waar een pad
een oever raakt wint er één van de twee, zo werkt terrein nu eenmaal.

**Dingen neerzetten: bomen, planten, huizen, een tuin.**

1. Klik op de laag `objecten`.
2. Kies bij Tilesets het vel (`bomen`, `begroeiing`, `gebouwen`, `tuin`) en klik een plaatje aan.
3. Pak **Tegel invoegen** uit de werkbalk en klik op de kaart. Een huis zet je neer op zijn
   achterste hoek; het beslaat de tegels rechtsonder daarvandaan. Een tuinstuk (`tuin`) staat
   anders: op het **midden** van zijn eigen tegel, dus een recht stuk hek staat voor de helft op de
   tegel ernaast — gewoon aanklikken en neerzetten, net als een boom.

**Een tuintje van losse stukken** (ronde 4a, 22 sep 2026; ontwerp/beeld.md, "Een tuintje erbij").
`tuin.tsx` heeft twee hekken — `hek-tenen-*` (gevlochten wilgentenen tussen dunne staken) en
`hek-lat-*` (een paar latten op palen), allebei met een recht stuk in beide richtingen, een hoek,
een eind en een hekje — en daarnaast los: groente (`kool`, `prei`, `bonen`), een `kruidenbed`,
`bloemen-x`/`bloemen-y` (voor een muur), `bankje-x`/`bankje-y` en `regenton`. Zet ze los rond een
huis, niet erin gebakken: dan krijgt elk huis een andere tuin, en klopt voor- en achterlangs lopen
vanzelf. Vast zijn de hekken, de bank en de regenton; het hekje, de bedden en de bloemen niet — daar
loop je doorheen of overheen. Staat `tuin` nog niet in je Tilesets-paneel (een kaart van vóór 22 sep
2026), voeg hem toe met het plusje onderaan dat paneel (een bestaande tileset toevoegen) en kies
`tegels/tuin.tsx`; nieuwe kaarten via `nieuwe-kaart.tmj` hebben hem al staan. Beoordeel de twee
hekken op ware grootte naast de tovenaar in `gereedschap/pixelart/uit/proefhuis/hekjes.png`
(`node gereedschap/pixelart/proef-hekjes.cjs` om hem opnieuw te maken).

**Wezens en uitgangen** zijn gewone objecten met een eigenschap (rechts bij *Eigenschappen*, met
het plusje *Eigenschap toevoegen*, soort *string*):

| Eigenschap | Waarde | Wat het doet |
|---|---|---|
| `wezen` | `wolf`, `reuzenspin`, `kobold`, ... | er staat hier een wezen (de lijst is `T.WEZENS` in `js/wereld.js`) |
| `wezen` | `smid`, `boer`, `boerin`, `dorpsoudste`, `oudeman`, `smidsvrouw`, `bruid`, `bruidegom`, `jongen`, `meisje`, `kleuter` | een dorpeling met een naam; hij dwaalt rond waar je hem neerzet (met `straal` kies je hoe ver) |
| `wezen` | `bakker`, `marskramer` | de twee van De koude oven. Ze zijn nog niet getekend en lenen tot fase B2b het vel van Wim, dus ze lopen wel, maar ze zien er als Wim uit |
| `straal` | een getal | hoe ver het rondloopt |
| `quest` | `bakker:zoeken` | dit voorwerp ligt er alleen zolang die quest in die fase staat (meer fasen mag: `bakker:zoeken,terug`). Zo ligt de leem pas in de kuil als de bakker erom vroeg. Het voorwerp mag niet vast zijn |
| `raak` | `oven` | dit voorwerp wacht op een spreuk (de lijst is `T.RAAKPUNTEN` in `js/quests.js`). Zet het op een tegel waar je bij kunt, niet in een muur: een spreuk vraagt vrij zicht |
| `overgang` | naam van een kaart | wie hier stapt, gaat naar die kaart |
| `komt` | `x,y` | de tegel in déze kaart waar je landt als je van die andere kaart terugkomt |
| `tekst` | bijvoorbeeld `Naar binnen` | wat er bij de muis staat boven een overgang (zonder: "Naar" en de naam van de kaart) |
| `zaad` | een getal | een gewone dorpeling; het getal kiest zijn uiterlijk, en hetzelfde getal geeft altijd dezelfde |

Het beginbestand heeft er al een als voorbeeld: *pad terug naar het erf*.

**Proberen in het spel.** Sla op in Tiled, draai `npm run kaarten`, en open het spel met
`?kaart=<naam>`: een nieuwe kaart is vanzelf een gebied. Vanuit een lopend spel spring je er in de
browserconsole heen met `Spel.debug.gaNaar('<naam>')`.

## Buiten is één grote kaart (21 sep 2026)

Marcel wil één doorlopende wereld (zie `wereld.md`). Tiled heeft daar een "World"-functie voor die
losse kaarten naast elkaar legt, maar die kiezen we niet:

- **Terrein werkt niet over de naad tussen twee kaarten.** Loopt een pad of beek van de ene kaart
  de andere in, dan weet Tiled aan de rand niet wat aan de overkant ligt, en krijg je op elke grens
  een harde snede in de randen die we net hebben opgelost.
- Een World legt kaarten neer als rechthoeken in pixels; onze kaarten zijn ruiten, en de
  documentatie zegt niets over isometrisch. Dat is een risico zonder reden.

Dus: **`kaarten/wereld.tmj` is de hele buitenwereld, op één doek.** Tiled laat alles tegelijk
zien, paden en beken lopen door, en het spel tekent al alleen wat in beeld is, dus de grootte is
geen probleem. Binnenkanten blijven aparte kaarten met een deur als overgang.

**Het erf wordt daarbij één keer gemaakt en dan van Marcel.** `erf-kaart.cjs` maakte het erf elke
keer opnieuw uit de scène van de toren; in één grote kaart zet het het erf er één keer in (met
randtegels in plaats van de oude vierkante grond), en daarna tekent Marcel alles buiten zelf. De
meester en de wolf zijn dan objecten die hij kan verplaatsen, zoals elk ander wezen.

## De kaart groeit mee (Marcel, 26 sep 2026)

"De kaart blijft wel groeien. Er is geen grens voor een max afmeting stad." Het gehucht ligt daarom
in het midden van zijn kaart, met wild land rondom om te ontginnen (`spel.md`, "Van dorp tot stad").
De kaart komt nu uit Tiled, met een vaste maat; hoe hij groeit, komt bij punt 14 van de werklijst
(de treden). Het spel tekent al alleen wat in beeld is, dus de grootte zelf is geen probleem.

## De kaarten tekenen we in een editor (Marcel, 20 sep 2026)

Claude elke boom laten neerzetten kost te veel. De wereld wordt dus in een kaarteditor getekend.
Gekozen richting: **Tiled** (mapeditor.org, open bron, al jaren de standaard in pixelspellen).
Tiled kent isometrische kaarten van 64×32 en slaat op als JSON (`.tmj`), dus het spel kan een
kaart gewoon inlezen. LDtk is moderner en prettiger, maar isometrisch is daar stiefmoederlijk
bedeeld.

Hoe het aan elkaar hangt:

1. `gereedschap/pixelart/` blijft de beelden maken, maar schrijft er voortaan ook tegelvellen bij
   met een `.tsx` per vel: het beeld, de tegelmaat, het voetpunt van hoge dingen, en wat vast
   staat. Dan hoeft niemand in Tiled honderden sprites met de hand aan te wijzen.
2. Marcel tekent in Tiled: een grondlaag (gras, pad, kasseien, water), een laag met wat vast
   staat, en een objectlaag voor huizen, bomen, mensen en monsters.
3. Eigenschappen per object vertellen het spel de rest: welk wezen, welke dorpeling (het zaad),
   welke deur, welke quest, en waar je naar een ander gebied overgaat.
4. `js/kaart.js` leest de `.tmj` en maakt daarvan wat `js/wereld.js` nu met de
   hand opschrijft: begaanbaar, vast, deuren, voorwerpen, wezens.

### Een wereldgereedschap naast Tiled (Marcel, 22 sep 2026, nog te bouwen)

**Tiled houdt de grond, wij de betekenis.** Marcel: "een eigen tool om kaarten te maken, met alles
erin — quest, tekst — dat zou het heel veel makkelijker maken."

Waar dat vandaan komt: voor één dorpeling ga je nu langs vijf plekken. Tiled (neerzetten),
`gesprekken.html` (tekst), `quests.html` (een quest eraan hangen), `npm run kaarten`, en dan het
spel om ernaartoe te lopen en te kijken. Pas aan het eind zie je of het klopt.

Tiled is goed in tékenen: terreinsets, lagen, ongedaan maken, selecties, kopiëren. Dat namaken is
een jaar werk voor iets minders, en dat doen we dus niet. Maar Tiled is slecht in *betekenis*:
voor Tiled is `wezen="bakker"` een stuk tekst. Het weet niet dat de bakker een gesprek heeft, dat
er een quest aan hangt, dat die quest leem nodig heeft, en dat die leem nergens ligt.

Daarom de scheiding (besloten, Marcel 22 sep 2026):

- **In Tiled:** de grondlaag, de terreinsets, de bomen en de huizen. Het tekenwerk.
- **In ons gereedschap:** alles wat iets betekent — mensen, questvoorwerpen, raakpunten,
  overgangen — op een kaart die je ziet, met hun tekst en hun quest in hetzelfde scherm.
- **De gegevens blijven in de `.tmj`** (besloten, Marcel 22 sep 2026), waar ze nu ook staan. Eén
  waarheid, Tiled kan alles blijven lezen en bewerken, en `npm run kaarten` verandert niet. Het
  gereedschap weigert op te slaan als het bestand intussen op schijf veranderd is, want anders
  verliest er een als Marcel de kaart tegelijk in Tiled open heeft.

**Waarom nu en niet later:** er moeten negentien dorpelingen, de bakkerij, de leemkuil en de
marskramer neergezet worden. Gebeurt dat eerst met de hand, dan komt het gereedschap te laat voor
precies het werk waar het voor bedoeld was.

De helft lag er al: `js/kaart.js` leest de `.tmj`, `js/tekenen.js` tekent hem, `npm run kaarten`
vangt al ontbrekende tegels, objecten in de verkeerde laag en gebouwen die elkaar overlappen, en
het questgereedschap leest de kaarten al uit om te zeggen waar de dingen liggen
(`wereldHaakjes` in `gereedschap/quests-tool.js`).

**In rondes, zoals de huizenbouwer, met na de eerste al iets bruikbaars:**

1. **Kijken** — *af, 22 sep 2026*. De kaart in de browser, getekend met de tekencode van het spel
   zelf. Lagen aan en uit: begaanbaar, vast, wie waar staat met zijn dwaalstraal, welke voorwerpen
   bij welke questfase horen, waar de uitgangen zitten. Klik een tegel: wat denkt het spel dat
   hier is. Schrijft niets, dus geen enkel risico — en het antwoordt al op "klopt dit?" zonder het
   spel te spelen.
2. **Neerzetten** — *af, 22 sep 2026*. Mensen, dorpelingen, deuren, geheime doorgangen,
   aansluitingen en voorwerpen plaatsen, verslepen en weghalen — niet terug de `.tmj` in, maar in
   `kaarten/<naam>.betekenis.json` (zie het besluit hierboven).
3. **Betekenis erbij** — *af, 22 sep 2026*. Klik op de bakker en zijn gesprek staat in hetzelfde
   scherm; hang er een quest aan; leg de leem neer vanuit de fase waar hij bij hoort. Alle drie
   werken ze: een breed paneel over de kaart met twee tabbladen, en daarin de hele bewerkers uit
   `gesprekken-tool.js` en `quests-tool.js` — niet nagemaakt maar hergebruikt, want twee bewerkers
   voor hetzelfde bestand lopen vroeg of laat uit elkaar. Allebei starten ze zichzelf daarom niet
   meer: `T.gesprekkenTool.start()` / `T.questsTool.start()` met `.kies(...)` en `.begin(...)` /
   `.beginVoor(...)` zijn wat een bladzijde aanroept. Een questvoorwerp hang je aan een fase met
   twee keuzelijsten, en de kaart springt mee naar die fase.
4. **Eén controle** — *af, 22 sep 2026, naar voren gehaald*. Alles wat het spel van een kaart
   nodig heeft op één plek nagekeken, in beeld in plaats van als regel in een terminal: een
   onbekend `wezen`, een `quest=` die een fase noemt die niet bestaat, een `raak=` zonder
   raakpunt, een questvoorwerp dat vast is (mag niet), een gebied zonder uitgang, gebouwen die
   elkaar overlappen.

**Wat ronde 1 werd (22 sep 2026).** `gereedschap/wereld.html`, naast de twee bladzijden die er al
waren, met `js/tekenen.js` en `js/kaart.js` van het spel zelf erin geladen. Drie dingen liepen
anders dan hierboven bedacht, en alle drie met een reden:

- **Het leest de `.tmj` rechtstreeks van schijf,** niet uit `kaarten/kaarten.js`. Opslaan in
  Tiled, verversen, zien — zonder `npm run kaarten`. Dat haalt meteen een stap uit de vijf
  waarover deze paragraaf gaat. Lukt fetchen niet (het blad los geopend), dan valt het terug op
  het gebundelde en zegt de statusregel welke van de twee je ziet. De server kreeg er één
  leesadres bij, `/gereedschap/api/kaarten`, zodat een kaart die net in Tiled getekend is meteen
  in de keuzelijst staat.
- **De controle (ronde 4) kwam meteen mee,** want de helft ervan bestond al en het is nú het
  nuttigst: er moet neergezet worden. Hij staat in `gereedschap/keuring.js` — dus zonder scherm,
  en `test/keuring.test.cjs` kijkt hem na — en kent twee vragen die tegengesteld wijzen.
  `T.keurKaart` vraagt wat er op de kaart staat dat het spel niet kan gebruiken. `T.keurDekking`
  vraagt het omgekeerde: wat vraagt het spel dat nergens staat? Die tweede is de nuttigste, want
  die zegt precies wat er nog in Tiled moet: op 22 sep zijn dat de bakker, de marskramer, de
  smidsvrouw, het raakpunt `oven` en de leem. De verdeling blijft die van hierboven: wat met de
  tékening te maken heeft (een gid die niet bestaat, een boom in de verkeerde laag, twee gebouwen
  over elkaar) blijft bij `npm run kaarten`, want dat kent de tegelvellen op schijf; de keuring
  doet de betekenis.
- **Ver uitgezoomd tekent het gereedschap zelf een plattegrond.** De tekencode van het spel zet
  de grond op een eigen vlak van venster-gedeeld-door-zoom pixels; bij 13% (nodig om 184×88 in
  één beeld te zien) is dat honderden megabytes. Onder de 40% komt er dus een schema in de plaats:
  één ruit per tegel, in de kleur van de grond, met zwart waar iets vast staat. Geen kunst, maar
  wel het hele dorp in één beeld — en het zijn de tegels zoals het spel ze léést, niet zoals Tiled
  ze tekent.

### Tiled tekent alleen nog de grond (Marcel, 22 sep 2026)

Marcel, nadat ronde 1 er stond: *"Je moet ook aansluitingen kunnen maken naar andere kaarten etc.
Ook geheime deuren, op die manier doorgangen etc. Per poppetje kunnen klikken en dialogen bekijken
en editen. Dus alleen basislaag uit Tiled halen en de rest moet hier. Hier maken we eigenlijk het
echte spel natuurlijk."*

Dat scherpt de scheiding hierboven aan. Het was: Tiled tekent, wij kijken mee. Het wordt: **Tiled
tekent alleen nog de grond, en alles wat betekenis heeft ontstaat, verhuist en verandert in ons
eigen gereedschap.** Niet alleen de mensen en de questvoorwerpen, maar ook de deuren, de
doorgangen, de geheime doorgangen en de aansluitingen tussen kaarten. Dit blad is daarmee geen
kijkglas meer naast de editor; het ís de editor, en de bladzijde waar het spel gemaakt wordt.

**Besloten, 22 sep 2026:**

- **De betekenis krijgt een eigen bestand naast de kaart:** `kaarten/<naam>.betekenis.json`, van
  ons gereedschap. Dat herroept het besluit van eerder die dag om alles in de `.tmj` te houden, en
  wel hierom: Tiled schrijft de `.tmj` ook. Schrijven wij erin, dan wordt elke opslag een diff van
  tweehonderdvijftig kilobyte waarin je nooit meer ziet wat er werkelijk veranderde, en moet er een
  botsingswacht omheen voor als de kaart in Tiled openstaat. In een eigen bestand komt Tiled nooit,
  dus is er niets om mee te botsen, blijft de diff klein en leesbaar, en kunnen er dingen in die
  Tiled niet kent: een geheime doorgang met zijn voorwaarde, een aansluiting die van allebei zijn
  kanten weet, een gesprek aan een persoon. `npm run kaarten` voegt de twee samen tot één kaart,
  net als nu.
- **Een voorwerp staat er op naam, niet op nummer.** In de `.tmj` is een boom een gid, en die
  nummers schuiven zodra `npm run tiled` een vel groter of kleiner maakt. In het betekenisbestand
  staat `"eik"` uit `bomen.tsx`, en dan maakt hernummeren niet uit.
- **Geheim is: je hoort ervan, en dan is hij er.** Een geheime doorgang ziet eruit als muur tot een
  vlag of een questfase staat — een dorpeling vertelt het, of je vindt een aantekening. Daarna is
  hij een gewone deur. Dat past op de kernregel: praten is gratis en jaren niet, en elke nieuwe
  manier om een prijs te ontlopen versterkt het spel (CLAUDE.md). Een spreuk die geheime dingen laat
  oplichten mag er later bij; dan is de goedkope weg zelf ook een kleine prijs.

Wat daar meteen uit volgt:

- **Een aansluiting heeft twee kanten,** en die horen in één handeling gelegd te worden: wijs een
  tegel op deze kaart aan, kies de kaart ernaast, wijs daar de tegel aan, en het gereedschap
  schrijft `overgang` en `komt` aan beide kanten. Nu zet je ze los van elkaar neer en merkt niemand
  het als ze niet bij elkaar passen. De keuring hoort er dan bij te zeggen dat een aansluiting maar
  één kant heeft.
- **Een geheime doorgang is nieuw voor het spel zelf,** niet alleen voor de editor. `js/wereld.js`
  kent open, dicht en opslot; geheim is een vierde staat, plus de vraag wat hem onthult. Zie de
  open vragen onderaan dit bestand.
- **Bomen en huizen blijven voorlopig in Tiled,** want dat is tekenen: terreinsets, selecties,
  kopiëren. De grens loopt bij betekenis, niet bij "object of tegel".

### Wat de keuring nakijkt (22 sep 2026)

`gereedschap/keuring.js`, met `test/keuring.test.cjs` eromheen. Twee vragen die tegengesteld
wijzen — wat staat er op de kaart dat het spel niet kan gebruiken (`T.keurKaart`), en wat vraagt
het spel dat nergens staat (`T.keurDekking`) — plus één die over de vorm van de kaart zelf gaat:

**Bereikbaarheid.** Vanaf elke uitgang een vlekvulling met de loopregels van het spel zelf
(`T.bereik` in `js/pad.js`: acht richtingen, geen hoeken afsnijden, een dichte deur mag open en
een deur op slot niet). Wat begaanbaar is maar niet bereikt wordt, is een eilandje. Een poppetje
of een questvoorwerp dat daarop staat is een fout — je spreekt hem nooit; de losse tegels zelf
zijn een "let op", want plukjes gras achter de bomen mogen er zijn. Het gereedschap heeft er een
laag voor (`o`). Op `wereld.tmj` zijn dat er op 22 sep 767 van de 6330, verspreid over de hele
kaart: gaten in het bos. Wordt dat ineens veel meer, dan is er waarschijnlijk een pad dichtgegroeid.

**Waar dit opnieuw bekeken moet worden:** hoogte (zie hieronder, en het werklijstpunt daarover). Als
een hoogtelaag in Tiled niet blijkt te werken, is dát het moment waarop een eigen editor een echte
vraag wordt. Dat weet je pas als je het probeert.

### De keten staat (20 sep 2026)

| Stap | Wat het doet |
|---|---|
| `npm run tiled` | Rendert uit `dorp.cjs`, `dorp2.cjs` en `bomen.cjs` de vellen naar `tegels/`: grond, bomen, begroeiing en de vijftien gebouwen, elk met een `.tsx` waarin `vast` en `beslaat` al staan. |
| Tiled | Marcel opent de `.tsx`-en en tekent de grond, die hij opslaat als `kaarten/<naam>.tmj`. |
| `gereedschap/wereld.html` | Marcel legt de betekenis: mensen, deuren, doorgangen, aansluitingen, questvoorwerpen. Schrijft `kaarten/<naam>.betekenis.json` en bundelt daarna zelf. |
| `npm run kaarten` | Bundelt elke `.tmj` én elk `.betekenis.json` tot `kaarten/kaarten.js` (`T.KAARTEN` en `T.BETEKENIS`), want `fetch` werkt niet vanaf `file://`. |
| `T.laadKaart(T.KAARTEN.naam, T.BETEKENIS.naam)` | Maakt er een wereld van: tegels, deuren, voorwerpen en wezens, waar `isBegaanbaar`, `isVast` en `raakt` ongewijzigd op werken. |

Wat er in een ding kan staan — `wezen`, `zaad`, `straal`, `staat` (open, dicht, opslot, geheim),
`als`, `overgang`, `komt`, `tekst`, `tegel`, `raak`, `quest` — staat uitgeschreven boven in
`js/kaart.js`, want daar wordt het uitgelegd. Dezelfde namen gelden voor een object dat nog in
Tiled staat; er is maar één stel regels. Op de tegel zelf staan `naam`, `vast` en bij een gebouw
`beslaat` ("7x5"). Een gebouw zet je neer op zijn achterste hoek en het beslaat de tegels
rechtsonder daarvandaan, dezelfde afspraak als in de export.

`kaarten/proef.tmj` is een kaart van 12×10 die met de hand is gezet, met `test/kaart.test.cjs`
eromheen; die toetst dat het pad begaanbaar is, dat de voet van het huis vast is en dat het
monster op de goede tegel staat.

Nog uit te zoeken:

- **De grond herhaalt zichtbaar.** Marcel opende `proef.tmj` in Tiled (20 sep 2026): de kaart
  klopt en de gebouwen staan op hun voettegel, maar het gras is één tegel die naast zichzelf
  ligt, dus de tufts vormen nette diagonale rijen. In een grote render valt dat niet op, want
  daar wordt de grond in één keer getekend. De oplossing: een lap van vier bij vier tegels uit
  hetzelfde ruisveld snijden, plus losse varianten om te strooien.
- **Hoogte.** Besloten, zie "Hoogte is een getal per tegel" hieronder. Nog niet gebouwd.
- **Grote gebouwen.** Een huis van 6×8 tegels is één object met een voetpunt, geen losse tegels.
  De dieptesortering van het spel (op t) moet zulke objecten op hun voettegel inplannen.
- **Wat blijft er in code?** De kamers binnen in de toren zijn klein en staan al in code. Die
  mogen zo blijven tot de editor er staat.
- **Wat er nog niet in de vellen zit:** dorpelingen, deuren en hekken als plaatje (de
  eigenschappen werken wel, maar je ziet in Tiled een kaal blokje), stromend water, en het
  bruggetje, dat geen heel aantal tegels breed is.

### Een tegelnummer verandert nooit (21 sep 2026)

Een kaart in Tiled bewaart per vel alleen een beginnummer. Groeit een vel, of komt er een tegel
midden in de lijst, dan schuiven nummers op en toont een kaart die met de hand getekend is
stilletjes de verkeerde plaatjes. Dat gebeurde toen het gebouwenvel van 15 naar 27 tegels ging.
Twee regels, allebei nodig:

- **Vaste volgorde.** Elk vel heeft `tegels/<vel>.volgorde.json`. Een nieuwe tegel komt
  achteraan; een verdwenen tegel houdt zijn plek als lege cel. **Nooit invoegen in het midden**,
  ook niet als het netter oogt naast verwante tegels. De kern staat in
  `gereedschap/pixelart/vaste-volgorde.cjs`.
- **Vaste capaciteit.** Elk vel is aangevuld met lege cellen tot een vast aantal (grond 160,
  bomen 32, begroeiing 40, gebouwen 96, toren 8, erf 24, tuin 48, rand 600), zodat het aantal nooit
  verandert als er iets bijkomt. Past er niets meer bij, dan gooit `npm run tiled` een fout; dan
  wordt de capaciteit bewust verhoogd én worden de kaarten meeverhuisd. Sinds 4 okt (werklijst vraag
  114, 2a) is elk vel behalve de grond ingepakt: een lege cel heeft daar geen plek op het vel en kost
  dus niets; de capaciteit is alleen nog het aantal nummers.

**Voor wie in Tiled werkt:** laat de lege cellen aan het eind van een vel met rust. Na een
wijziging aan de kunst eerst `npm run tiled`, dan `npm run kaarten`; dat laatste klaagt luid als
een kaart een nummer gebruikt dat nergens op uitkomt.

### Hoogte is een getal per tegel (Marcel, 20 sep 2026)

Tiled kent geen derde dimensie. Van de drie manieren die daarvoor rondgaan — een laag per
verdieping, een getal per tegel, of sorteren op y — is de tweede voor ons de juiste.

**Waarom geen laag per verdieping.** Alles in dit spel hangt aan één raster voor rondlopen én
vechten; dat is wat de overgang naadloos maakt. Lagen geven twee rasters die met trappen aan
elkaar geknoopt moeten worden, en dat raakt het lopen, het zoeken van een pad, het zicht, het
bereik van een spreuk en de beurtvolgorde. Voor een huis met een bovenverdieping is het de goede
aanpak; voor een heuvel met een beek eronder een dure omweg.

**Hoe het in Tiled werkt.** Naast de grondlaag komt een laag `hoogte` met een klein palet: acht
gekleurde ruiten met een cijfer, 0 tot en met 7, waarbij 0 het maaiveld is. Marcel schildert geen
rotsen maar hoogtes, met dezelfde emmer en stempel als voor gras, en ziet de grond eronder
doorschemeren. Eén extra tegel in dat palet is `helling`, met een richting: daar mag een
hoogteverschil overbrugd worden.

Een eigenschap per tegel in het tegelvel kan niet, want dezelfde graspol moet op elke hoogte
kunnen liggen; een eigenschap per object zou betekenen dat je elke tegel apart aanklikt. Een laag
schilder je.

**Rotswanden worden afgeleid, niet getekend.** Staat er een 1 naast een 0, dan is daar een wand.
Dat is dezelfde machinerie als de randtegels tussen twee grondsoorten, alleen tussen twee
hoogtes. Een klifrand kan daardoor nooit fout liggen.

**Wat het spel ermee doet:**

- de tegel en alles wat erop staat schuift omhoog met hoogte maal een vaste trede (begin met
  ongeveer een halve tegel; `iso.js` weet al dat één eenheid hoogte 0,866 pixel is);
- lopen mag naar een buurtegel bij gelijke hoogte, of over een helling;
- de dieptesortering krijgt hoogte als tweede sleutel: wie boven staat, komt over wie beneden
  staat heen;
- het exportstapje klaagt als een stuk is ingesloten waar geen helling heen leidt.

**Wat het de kernregel oplevert,** want anders is het alleen mooi: vanaf hoog grond zie je verder,
dus zie je een wolf eerder en kun je hem ontlopen. Een richel dwingt je te kiezen welke kant je
omloopt. Naar beneden springen kan wel maar niet terug, dus dat is een eenrichtingsroute om weg te
komen. Alle drie versterken ze de afweging tussen jaren en veiligheid.

**Wanneer:** na de randtegels en nadat elke kaart vanzelf een gebied is, want hoogte bouwen in een
wereld die nog niet af is, is de verkeerde volgorde.

**Zo werkt het nu (7 okt, vraag 121, stap 1):** niet uit Tiled en niet als getal per tegel, maar als rekensom
(`js/hoogte.js`): elke hoek van een tegel heeft een hoogte, de glooiing uit het nummer van het land (drie lagen ruis, die
ook buiten de kaart doorlopen) plus een niveau per tegel maal een trede van 32 pixels voor een richel, met een helling
erop; vlak waar een huis met zijn looppad, het plein of het water ligt. Een wand (rotswand of begroeide wal) staat waar
twee buren hun hoek niet delen, en je ziet hem alleen aan de zuid- en oostkant. Achter de spelregel "Hoogte" (standaard
vlak). **Sinds stap 2 (8 okt; Marcel: "Akkoord") doet de hoogte iets:** niemand stapt door een wand, wel over een helling
en de glooiing (`T.kanStappen`, voor A*, de eilanden en de velden); een gebouw of erf komt niet waar het te steil is (meer
dan 6 pixels per tegel over de plek met zijn looppad, of een wand of helling erop: `T.teSteil`), en waar het komt, wordt
de grond vlak (`T.egaliseer`: een vlak stuk erbij, dat met het spel bewaard wordt); een heuvel tussen twee mensen houdt
het zicht tegen (`T.heuvelTussen`, van oog tot oog), en wie hoger staat dan wat hij bekijkt, ziet een tegel verder per
twee treden (`T.verderVanBoven`); en een tegel die zo hoog ligt dat hij iets achter zich afdekt (`T.dektAf`: de rand van
een richel, een steile flank), tekent het spel nog eens over wat erachter staat, met het kijkgat van de doorkijk voor wie
je hoort te zien. Wat hieronder staat (een laag in Tiled, het palet van acht hoogtes), is
daarmee vervallen; het idee van de afgeleide wand is gebleven.

**Opnieuw gevraagd (Marcel, 4 okt: "Hoogte verschillen op de kaart. 😁"; werklijst vraag 121).** Sinds 4 okt maakt de
maker het land (`js/maker.js`), en schildert Marcel in Tiled alleen nog de grond; de hoogte komt dus uit de maker, niet
uit een laag in Tiled. Het plan (terrassen met wanden en hellingen, wat het doet aan lopen, zien en bouwen, en wanneer)
staat bij vraag 121. **Besloten (Marcel, 4 okt: "121 a terrassen, b ja, c na de boeren"):** terrassen met wanden en
hellingen, zoals op 20 sep; de hoogte raakt het lopen, het zicht en het bouwen; en het komt na de boeren (vraag 111),
vóór het eiland (vraag 117), zodat het eiland er meteen mee begint.
