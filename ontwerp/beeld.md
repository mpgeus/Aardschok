# Beeld

## Besloten

- **De maat voor alles: Marcels plaat van de heerstoet** (18 okt 2026; `voorbeelden/heerstoet-doel.webp`, elders
  gemaakt). Marcel: "dit is wat ik wil", "ziet er 100x beter uit, het detail, realisme etc.", "DAT is wat ik wil voor
  alles"; en over onze proefplaat van dezelfde dingen (`uit/heerstoet-proef.png`): het lijkt er in de verste verte niet
  op. Wat de plaat heeft: dieren en mensen met echte anatomie (gewrichten, spieren, gewicht), stof met plooien, franje en
  borduursel, heraldiek (een gouden leeuw op rood, op het kleed, de vaandels, de wapenrokken en de wagen), hout met nerf en
  ijzerbeslag, en veel kleine dingen (een lantaarn aan de wagen, kruiken, balen, een haam met koperen beslag); veel
  contrast, donkere omlijning, warm licht. De render uit code bijschaven haalt dat niet: de weg erheen is vraag 180 in
  de werklijst. De ronde "het paard en de os beter" (hieronder) is daarom gestopt. Wat de HD-proef met het wagenwiel
  vond (18 okt, `gereedschap/ai/hd-wielproef.md`, nog niet besloten): de plaat is ruwweg twee keer onze pixeldichtheid,
  overdrijft de maten (onderdelen anderhalf keer zo fors), en heeft het handschrift van een tekenaar (lichte randlijnen,
  een donkere lijn om elk onderdeel, weinig tinten); toon, licht en materiaal halen we al met AI-texturen in onze renderer.
  Marcel koos daarna 4× intern en een sprite van 2× (`hd-resolutie.md`); de stijlproef (`hd-stijl.md`, nog niet
  besloten) haalt het handschrift met een afwerking op de doelmaat (`stijl.cjs`): per materiaal zes à zeven tonen die van
  koel naar warm schuiven, het hout vooral donker (75% donker, 3% licht, zoals het doel), de lichtste toon alleen voor
  lichte randen, glimlichten en nagelkoppen, donkere lijnen waar onderdelen elkaar raken, en een omlijning in de kleur van
  het materiaal. **De maat in beeld blijft** (Marcel, 19 okt, bij de proefplaat met het wiel anderhalf en twee keer zo
  groot: "het doel, zoals nu blijft de scherpte houden zoals ik wil. Dus groter zou niet moeten hoeven"): het ChatGPT-wiel
  is op onze maat getekend en toont toch elke nagel; detail kleiner dan een pixel moet getekend worden, niet verkleind.
- **De maatstaf: "wow, wat een detail"** (9 okt 2026, Marcel, bij de fasen van een afgebrand huis: "Ik wil dat mensen
  denken: wow, wat een detail alles heeft zn eigen art. Zo uitgebreid. Zo mooi, zo leuk om te zien", en eerder: "Art
  maakt of breekt een spel", "Moet wel handgetekend lijken", "dit is te ai, ik moet iets natuurlijker hebben iets
  'echts'"). Elke toestand van een ding heeft zijn eigen tekening, met de details die je in het echt zou zien, en een
  materiaal gedraagt zich als zichzelf (steen blijft staan, riet brandt, lei breekt). Wat in code gemaakt wordt, mag
  niet naar code ruiken: geen gladde ruis of herhaalde patronen zonder reden.
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
- **Het licht van de dag en de lampen komt er in het spel bovenop** (4 okt, vraag 125, A; `T.lichtKleurVan` in
  `js/dag.js`, `T.LICHT_INSTELLINGEN` in `js/tekenen.js`, de lichtkaart in `js/gl.js`): met de videokaart wordt de
  wereld vermenigvuldigd met de kleur van het uur (roze bij het opkomen, neutraal overdag, oranje bij het ondergaan,
  blauw in de nacht) en met een warme plas licht per lamp, die flakkert. Het licht in de plaatjes blijft van linksboven
  komen; dit heeft geen richting. Zonder videokaart blijft het de donkere laag van vóór 4 okt.
- **Schaduwen die met de zon meegaan** (4 okt, vraag 125, B; `T.zonStand` in `js/dag.js`, `tekenZonneschaduw` in
  `js/tekenen.js`): met de videokaart werpt alles wat staat zijn silhouet over de grond, op de middag kort naar
  rechtsonder (zoals het licht van linksboven in de plaatjes), 's ochtends lang naar rechtsboven, 's avonds lang naar
  linksonder. De plaatjes zelf hebben geen schaduw op de grond; de spelregel "Schaduwen".
- **Stijl van Mystic Towers.** De kamer staat als een diorama in het donker, en de voorste muren
  zijn laag weggesneden.
- **De maat voor de huizen is de nabewerkte herberg** (17 okt 2026, Marcel, vraag 177: "de def is een nabewerkte versie.
  Dat is de norm die ik wil aan gaan houden"; `voorbeelden/herberg-stijl-doel.webp`): zachter licht, rustiger en rijker
  materiaal, wel pixel art en scherpe silhouetten, voor alle gebouwen, en niet huis voor huis opnieuw getekend. Hoe:
  hieronder, "De nieuwe stijl".

## Alles valt en staat met overtuiging (Marcel, 21 sep 2026)

De maat waar al het beeldwerk aan getoetst wordt: gelooft de speler dat hier mensen wonen? De
regels hieronder zijn manieren om dat te bereiken. En het werkt ook andersom: **overtuiging gaat
kapot aan één ding dat niet klopt** — een figuur die half in een put staat, grastufts in een
raster, een huis waarvan alleen het dak boven het gras uitsteekt. Zo'n breuk gaat voor op nieuw
moois, want één ervan doet meer kwaad dan tien mooie huizen goedmaken.

## Eerst goedkeuring, dan renderen (Marcel, 14 okt 2026)

"Eerst voortaan even goedkeuring vragen, want anders is het zonde van de render tijd." Op 14 okt maakte Claude voor de
zagerij (werklijst vraag 157) twee tekeningen na elkaar zonder te vragen, en allebei gingen ze weg: de open loods "ziet
er niet uit", en het huis zoals de bakkerij was "veel te stijf" (alles recht, waar de huizen uit de huizenbouwer zakken
en golven; zie hieronder, "Niets is waterpas"). Dus voor elke nieuwe tekening, of een tekening die verandert:

1. **Eerst in woorden:** wat het wordt, waar het op lijkt (welk huis van de huizenbouwer, welke stijl), wat erbij staat,
   en hoeveel tekeningen het worden. Marcel zegt ja of anders.
2. **Dan één proefplaat**, één stijl en één kant, in een paar seconden. Marcel zegt ja of anders.
3. **Pas dan alles**: de stijlen, de kanten, de oude versies en de bouwfasen, en het spel.

## Niets is waterpas (Marcel, 21 sep 2026)

"Het moet echt aanvoelen. In de middeleeuwen was er geen laserlijn, er was geen waterpas. Dingen
werden op het oog gedaan. Dingen waren niet perfect, het mag een beetje afwijken. Zo wordt een
wereld uniek en blijft het spannend." Een dorp vol huizen die we op 21 sep hadden, voelde volgens
hem "ongelooflijk saai om doorheen te lopen, er zit geen leven in".

Dit is een regel voor **alles wat uit code komt**, niet alleen voor huizen: een computer maakt
uit zichzelf alles recht, gelijk en herhaald, en dat is precies wat een plek dood maakt.

- **Niets is recht.** Een nok zakt in het midden door, een dakrand golft, een muur helt een fractie,
  een schoorsteen leunt. Een hek staat scheef, een pad slingert.
- **Niets is haaks.** Een plattegrond is een fractie scheef, een hoek niet precies negentig graden.
- **Niets is gelijk.** Elke balk een andere dikte, planken van verschillende breedte, stenen van
  verschillende maat, ramen op net verschillende hoogtes, een luik dat scheef hangt, een deur die
  niet helemaal past.
- **Alles heeft een geschiedenis.** Gelapt riet in een andere kleur, een vervangen plank, een
  aanbouw die later is aangezet, een muur die met een schoor overeind wordt gehouden.
- **Maar een beetje.** Het moet op het oog gemaakt lijken, niet kapot of lachwekkend. En het moet
  op pixelmaat te zien zijn: een doorzakking van een paar pixels, niet een halve pixel die bij het
  terugbrengen tot pixel art verdwijnt of alleen een rafelige lijn geeft.
- **Per zaad anders, en vast.** Elk huis is op zijn eigen manier scheef, en dat blijft zo: hetzelfde
  zaad geeft hetzelfde huis.

Technisch betekent dit dat de huizen uit **ronde vormen** moeten komen (afstandsfuncties, zoals de
figuren en de toren al doen), niet uit dozen en vlakken. Een doos is per definitie recht; een
afstandsfunctie kun je laten doorbuigen, uitpuilen en golven.

### Ook de kaart is niet waterpas (Marcel, 26 sep 2026)

Na de beelden van het nieuwe gehucht (een plein van 10 bij 8 tegels vóór het huis van de schout):
"Let ook op de gebouwen, [ze staan] te dicht op elkaar. De brink is vaak het hart van een dorp. Zou
een redelijk open ruimte zijn lijkt mij." En: "Ook de vorm moet variëren, he? En niet alles dus strak
en waterpas."

Wat Claude daarin zag: de regel van 21 sep gold tot nu toe alleen voor wat de huizenbouwer rendert,
nooit voor de kaart zelf (`gereedschap/tiled/maak-gehucht.cjs`). Die is wél strak: het plein is een
rechthoek met rechte randen, de weg een rechte lijn, de akkers liggen als gelijke stroken op een rij,
en alle huizen staan in rijen met hun voorkant naar het zuiden. Dus ook voor de kaart:
- **Het plein is het hart, en open:** groot, met een paar oude bomen, en niet volgebouwd; op het
  plein wordt niet gebouwd. (Sinds 26 sep heet de brink gewoon het plein.) De huizen staan eromheen,
  ook aan de kant van de camera: "Ik wil wel dat er huizen voor kunnen staan. We hebben daar het
  kijkvenster voor. Misschien huizen volledig transparant maken" (Marcel, 26 sep; "Doorkijk"
  hieronder). En de velden liggen daar weer omheen.
- **Geen rechthoek:** de rand van het plein golft, een weg slingert (en wordt later een pad dat slijt
  waar gelopen wordt, "Straten en paden" in `spel.md`), en een erf staat een eindje verder of dichterbij
  dan dat van de buren.
- **Niet alles dezelfde kant op:** een huis kan in ons beeld niet vrij draaien, maar de huizenbouwer
  kan elk huis een kwartslag gedraaid of gespiegeld renderen, zodat een boerderij met de zijkant of de
  achterkant naar het plein kan staan (voorstel van Claude).

**Zo is het gebouwd** (26 sep, de vierde versie van het gehucht): het plein, de slingerende weg en de
paden, en een beek die kronkelt, maar recht onder de brug door loopt. De weg is een vloeiende lijn door
steunpunten (Catmull-Rom); de rand van het plein en het uitgesleten zand zijn een veelhoek. De huizen
staan nog wel allemaal met hun voorkant naar het zuiden: gedraaid of gespiegeld komt met ronde 4b van
de huizenbouwer. Wat bleek: een geknotte wilg is hoog, en een rij wilgen vóór de beek verstopte hem
helemaal; nu staan er minder, en bij de brug geen.

### De huizenbouwer op ronde vormen (Marcel, 21 sep 2026)

Het proefhuis (`gereedschap/pixelart/huis-sdf.cjs`, plaat in `uit/proefhuis/vergelijk.png`)
bewees dat het kan: "ja zeker doen, dit ziet er al zoveel beter uit". Het dikke riet deed het
meeste, daarna de grove maten; scheef is op spelmaat subtiel, en maakt huizen niet van elkaar
verschillend. Wat de nieuwe bouwer moet kunnen, in Marcels woorden en daarna uitgewerkt:

- **Plattegronden:** rechthoek, **L** en **T** (en later een U of een binnenplaats). Bij een L of T
  krijg je waar twee daken elkaar raken een kil, en het riet moet daar doorlopen.
- **Losse, vrijstaande huizen,** niet alleen rijen.
- **Verdiepingen:** één laag, anderhalf (een zolder met dakkapellen in het riet), en **twee lagen**,
  met de bovenverdieping die een eindje overkraagt — dat is het middeleeuwse vakwerkhuis bij uitstek.
- **Wanden:** vakwerk met pleister en veldsteen zijn er; planken, vlechtwerk en een blokhut van
  gestapelde stammen komen erbij.
- **Daken:** riet is er; spanen, leien en pannen komen erbij, in lagen zoals het riet. **Een plat
  dak** (Marcel vroeg ernaar) alleen op steen, met een borstwering of kantelen eromheen: een
  wachttoren, een poortgebouw, de toren van een kapel. Op een gewoon huis niet, want in een land
  met riet en regen zijn daken steil, en een plat dak op vakwerk leest als Zuid-Europa.
- **Renderen gebeurt één keer:** een huis kost zo'n twintig seconden, maar dat is het maken van het
  plaatje in het tegelvel. Het spel tekent het daarna af; de speler merkt er niets van.
- **Uitbouwen:** dakkapellen die zacht in het riet zijn opgenomen, erkers op klossen, een aanbouw
  met een eenzijdig dak, een buitentrap, luiken, bloembakken, schoorstenen, en **een houten
  balkonnetje of galerij** langs de bovenverdieping (Marcel vroeg ernaar; ook de referentieplaat
  heeft er een, op palen, met een raam erin). Past vooral bij de huizen met twee lagen.
- **Een tuintje erbij** (Marcel, 21 sep 2026), maar **in losse stukken, niet vast aan het huis:**
  een hek in stukken met een hekje, rijen groente, een kruidenbed, bloemen langs de muur, een
  bankje, een regenton. Marcel zet ze zelf neer in Tiled. Dan krijgt elk huis een andere tuin, en
  omdat elk stuk op zijn eigen tegel staat, klopt voor- en achterlangs lopen ook — een tuin die in
  het huis gebakken zit, zou juist daar misgaan. Ook niet waterpas: een hek staat scheef, een rij
  kool loopt net niet recht.
- **Hekjes van wilgentenen en van latten** (Marcel, 22 sep 2026). Het eerste hek uit ronde 3 was
  een dicht staketsel van planken, en op ware grootte las dat als een palissade om een fort. Een
  moestuin krijgt een laag, open hekje: gevlochten wilgentenen tussen paaltjes, of een paar latten
  op palen. Twee soorten, zodat niet elke tuin hetzelfde hek heeft.
- **Wat vast is** (Marcel akkoord, 22 sep 2026): het hek, de bank en de regenton houden je tegen;
  het hekje en de bedden niet. Door een hekje loop je de tuin in, en door een bed stap je heen.
- **Niets is waterpas** in alles, en per zaad anders: plattegrond, verdiepingen, materiaal en
  ouderdom, zodat geen twee huizen op elkaar lijken.
- **Het blijft bruikbaar:** elk huis komt in `tegels/gebouwen.tsx` met de goede voetafdruk en het
  goede anker (`test/tegelanker.test.cjs` moet slagen), en nieuwe huizen komen **achteraan** in de
  volgorde (`ontwerp/kaarten.md`, "Een tegelnummer verandert nooit").

### Ronde 4b: de huizen in het spel (Marcel, 26 sep 2026)

**Marcels keuzes** (achtste sessie, op het plan van Claude):
- **In het spel stap 1 en 2 van de ladder, de rest op een plaat** ("1 en 2 in spel, rest op plaat"):
  echte hutten van vlechtwerk onder riet en huizen van vakwerk onder riet. De hele ladder (half steen,
  twee lagen, baksteen onder pannen; `spel.md`, "Beter bouwen") komt voor twee huizen op een plaat, zodat
  je ziet waar het heen gaat. In het spel komt hij bij punt 5 van de werklijst, Bouwen, want in het
  gehucht is geen steen.
- **De schout woont in vakwerk op een stenen voet** ("Vakwerk op stenen voet"): het enige huis in het
  gehucht dat half steen is (stap 3 van de ladder). Zo zie je dat hij de schout is, en de inner ziet
  het ook. Tot nu toe stond hij in een helemaal stenen huis uit de oude bouwer.

**Wat Claude vond** (bij het plan, 26 sep):
- Er stond nog geen enkel huis van de huizenbouwer in het spel: alle gebouwen kwamen uit de oude
  bouwer van dozen (`dorp.cjs`, `dorp2.cjs`, via `naar-tiled.cjs`).
- **Draaien is bijna gratis.** De bouwer bouwt altijd de kant die de camera ziet (de muren aan de +x- en
  de +y-kant; wat je niet ziet, krijgt geen deur, ramen of vakwerk). Hij kan al spiegelen (`nok: 'y'`,
  in de diagonaal, zodat het licht van linksboven blijft komen) en een vleugel naar voren of naar
  achteren laten steken: samen alle acht standen van een huis. Wat ontbrak: een deur aan de kant die je
  níet ziet. Dan staat een huis met zijn achterkant naar de camera, en met zijn deur naar het plein.
- **Het spel wist niet waar een deur zit:** `T.deurVan` nam altijd het midden van de zuidkant. Bij de
  nieuwe huizen zit de deur links- of rechtsvoor, of achter, dus krijgt elke tekening haar eigen deur,
  en die komt uit de bouwer zelf.
- **De bouwfasen** (een huis dat in vijf stappen oprijst, `bouwfasen.cjs`) werkten alleen voor de oude
  bouwer. Zonder fasen zou een nieuw huis alleen invloeien, een stap terug; ze moeten dus mee.

**Zo is het gebouwd** (26 sep, achtste sessie; `gereedschap/pixelart/README.md`):
- `gereedschap/pixelart/huizen.cjs` houdt de huizen van het spel bij, elk met een vaste opgave, ook
  de uitbouwen en de schoor: 4 hutten, 6 huizen, 5 boerderijen en het huis van de schout. Ze staan op
  een eigen vel, `tegels/huizen.png`, en het gehucht gebruikt ze (`maak-gehucht.cjs`), elk in het vak
  van het huis dat er stond.
- **Voet en deur worden gemeten aan het huis zelf:** welke tegels het net boven de grond beslaat
  (muren, een aanbouw, een trap, een schoor), en de tegel voor de deur. Die deur staat bij de tekening
  (`deur` in de .tsx), en het spel stuurt de bewoners daarheen. Bij een aanbouw neemt de boer de
  staldeur: de bouwer zet een aanbouw altijd naast de voordeur, en de voet (een rechthoek) liep dan
  voor de voordeur langs.
- **Echte hutten:** de bouwer kreeg lage muren (`laag`), een lage plint (`plint`) en een schoorsteen
  van leem of geen (`schoorsteen`). Op de eerste plaat waren de hutten nog kleine huizen, met een
  stenen plint tot halverwege de muur en een stenen schoorsteen; dat hoort volgens de ladder bij half
  steen.
- **De bouwfasen worden uit het huis zelf gesneden:** de muren als schil tot een hoogte, een geraamte
  en steigers erbij, het dak in latten boven een donkere zolder. Zo past elke fase, ook bij een L of
  een T. Een ronde voor alle gebouwen duurt een kwartier; met een naam maakt `bouwfasen.cjs` alleen
  een proefplaat, en laat het spelvel staan (tot nu toe schreef het dan een vel met alleen dat gebouw).
- **De ladder** staat op `uit/proefhuis/ladder.png` (`node huis-sdf-export.cjs ladder`): een hut en
  een huis, elk in de vijf treden. Baksteen kent de bouwer nog niet; de vijfde trede is daar veldsteen.

**Marcel na de beelden** (27 sep):
- Over de boerderijen die met hun achterkant naar je toe staan: "Ja dat mag, geeft het wat meer leven.
  Iedereen heeft zn voorkeur, en soms vroeger bouwden mensen praktisch. Als het zo past dan is het
  goed." Een huis mag dus elke kant op staan, zolang het past.
- Over de plaat van de ladder: "De ladder is goed zo."

### De vellen zijn ingepakt (4 okt 2026, werklijst vraag 114, 2a)

Marcel: "1 ja 2 alleen nog de grond" (alle vellen inpakken, en Tiled hoeft alleen de grond nog goed te tonen). Een
browser houdt een vel uitgepakt vast, vier bytes per pixel, ook de lege. Met vakken van gelijke maat was dat bijna
900 MB: de bouwfasen 271 MB (en 8303 pixels hoog, boven de 8192 van veel videokaarten), de gebouwen 157 MB voor 22 MB
aan tekeningen, de figuren 362 MB. Nu (`gereedschap/pixelart/inpakken.cjs`):
- **Een vel met voorwerpen** (bomen, begroeiing, gebouwen, erf, tuin, huizen) heeft elke tekening strak gesneden,
  met per tegel zijn eigen rechthoek en anker in `tegels.js`. Op de vellen met planten houdt een tekening de hoogte van
  zijn oude vak, want de wind buigt naar de hoogte in het vak. In Tiled is zo'n vel een verzameling met een rechthoek
  per tegel; de voorwerpen staan daar niet precies op hun plek, het spel wel.
- **De grond** (grond, rand) blijft een raster, want Tiled schildert ermee.
- **De bouwfasen** hebben per gebouw een eigen vel (`tegels/bouwfasen/<tekening>.png`), dat het spel pas laadt als
  er een in aanbouw staat. Tot het er is, tekent het gebouw bleker, zoals vóór er fases waren.
- **Een figuur** blijft een raster (een rij per kijkrichting, een kolom per beeld), maar zijn cel krimpt tot wat er
  in alle cellen samen staat.
Elke tekening is pixel voor pixel dezelfde gebleven, rond hetzelfde anker. Een leeg vak kost nu niets meer, dus voor
meer tekeningen (de afwisseling, 2b) is er ruimte.

### De afwisseling en de grote gebouwen: twee proefplaten (4 okt 2026, werklijst vraag 114, 2b en 2c)

Marcel: "1 ja 2 ja 3 allebei 4 allebei 5 ja" (eerst twee platen, nog niets in het spel; kalk in drie kleuren; de
kapel met een zadeldaktoren én met een naaldspits, de woontoren met kantelen én met een dak, om te kiezen als hij ze
ziet). Bij de eerste torens: "Torens zijn wel wat grijzig", en bij de baksteen: "Waren er in die tijd al bakstenen?
Dit was eigenlijk natuurstenen blokken". De platen: `node huis-sdf-export.cjs afwisseling`, `verhouding` en `steen`
(`gereedschap/pixelart/uit/proefhuis/`, niet in git).

**Wat de huizenbouwer erbij kreeg** (`huis-sdf.cjs`, bovenaan; elk huis dat er al was, bleef pixel voor pixel hetzelfde):
- **Kalk** op het pleister van het vakwerk: wit, oker of zacht roze (`kalk`). Het zaad kiest hem nooit zelf.
- **Baksteen en zandsteen** (`steen`): veldsteen onder leien is samen te grijs. Baksteen: rode en bruine stenen in
  halfsteens verband met een lichte voeg, een enkele donkere klinker; de lijsten van een toren en de afdekking van een
  topgevel blijven natuursteen. Baksteen kwam hier rond 1200 terug via de kloosters (de kloostermoppen), juist waar
  weinig natuursteen was; daarvoor bouwde men in tufsteen, zandsteen of veldkeien. Bij een schout en een heer passen dus
  allebei, en het spel heeft al een steenbakkerij (bij marktrecht). Zandsteen: gehakte blokken in rechte lagen,
  geelgrijs, warm in de zon, de natuurstenen blokken die Marcel bedoelde. Idee (Claude): eerst natuursteen, baksteen
  pas met een steenbakkerij, zodat je aan de muren ziet hoe ver het dorp is, zoals aan de daken.
- **Een toren met een steil dak** in plaats van de borstwering (`torendak`): een zadeldak tussen twee topgevels
  (zoals de dorpskerken in Groningen), een tentdak (vier vlakken naar één punt) of een naaldspits met een kraag die
  uitwaaiert; lood op de nok en de graten, en een gouden bol en een vaan erop. Gedekt met leien, pannen of spanen
  (`dekking`), met dezelfde patronen als een dun dak.
- **Ramen per soort**: een woontoren heeft op elke verdieping ramen (`ramen: 'woon'`, een appartement per laag), een
  kerktoren spleten en bovenin twee galmgaten met een ronde boog en galmborden (`'kerk'`), en het schip van een
  kapel hoge smalle ramen met een spitsboog en glas in lood. Een gat kan nu een boog hebben (`gatVorm`).
- **Een uithangbord** naast de deur van de herberg (`bord`): een ijzeren arm met een bord met een gouden kroes.
- **Een gebouw uit meer delen** (`samen`): de herberg met zijn stal, de kapel met haar toren, als één wereld, zodat de
  zon over alles gaat en de toren zijn schaduw op het schip werpt.

**Plaat 1, de afwisseling** (2b): bovenaan één huis in zijn vier standen (de deur linksvoor of rechtsvoor op een muur
die je ziet, of achter), daaronder drie straatjes: het gehucht (riet en spanen), het dorp (ook leien, en de eerste
stenen huizen) en marktrecht (ook pannen, een huis van twee lagen). De vormen zijn die van de huizen van het spel
(`huizen.cjs`), in andere wanden, kalk en luiken.

**Plaat 2, in verhouding** (2c), per rij op één grondlijn, met een boer voor de maat: de hut, het huis, het stenen
huis, de boerderij, en de woontoren van baksteen (vier lagen op 5 bij 5) met kantelen en met een tentdak van pannen;
daaronder de herberg zoals hij nu is en de nieuwe (twee lagen, 12 tegels, met een stal aan een binnenplaats en het
bord), en de kapel zoals ze nu is en de nieuwe, van baksteen onder leien, met een zadeldaktoren en met een naaldspits.

**Plaat 3, de steen**: de kapel met haar zadeldaktoren en de woontoren met zijn tentdak, elk in veldsteen, zandsteen
en baksteen.

**Besloten** (Marcel, 4 okt: "1. Afwisselen, je stelde eerder voor kleuren per soort land. 2. Zelfde als 1. 3. Ja,
baksteen na de steenbakker. 4. Ja prima. 5. Ja graag"): de kapel krijgt een zadeldaktoren of een naaldspits, en de
woontoren kantelen of een tentdak, naar de bouwstijl van het land (werklijst vraag 114, 2d); eerst natuursteen, en
baksteen pas als het dorp een steenbakkerij heeft; de kalk en de straatjes zoals op de plaat; en de binnenplaats van
de herberg krijgt een muur met een poort.

### Een vel per tekening (4 okt 2026, werklijst vraag 114, stap 1)

Marcel: "A ja B ja C meteen erna" (ook de gebouwen, laden wat er staat, en daarna de figuren). Bij het begin stonden er
10 van de 23 huizen en 1 van de 27 gebouwen op de kaart, terwijl de browser beide vellen helemaal vasthield (55 MB); met
de bouwstijlen van stap 2, zo'n 500 tekeningen, zou een vel ruim 500 MB worden. Nu:
- **Elke tekening van de huizen en de gebouwen is een eigen bestand** (`tegels/huizen/<naam>.png`,
  `tegels/gebouwen/<naam>.png`), strak gesneden zoals op een ingepakt vel, met zijn maat en anker in `tegels.js`
  (`npm run tiled`, `snijLos` in `inpakken.cjs`). In Tiled is zo'n vel een verzameling met een plaatje per tegel. De
  andere vellen (bomen, begroeiing, erf, tuin; samen 5 MB, en overal op de kaart) bleven zoals ze waren.
- **Het spel laadt wat er staat**: de tekeningen op de kaart zodra die er is (een nieuw spel, laden, een ander gebied),
  en een nieuwe als er iets gebouwd wordt of doorgroeit (`T.kaartVersie`). Tot een tekening er is, tekent hij niets; een
  huis dat doorgroeit, houdt zijn oude plaatje tot het nieuwe er is. Een vlak alleen als het bestand echt ontbreekt.
- **Gemeten** (`npm run schermen`, in Chromium zonder videokaart): bij het begin 153 MB aan plaatjes in plaats van 197,
  met twee bouwplaatsen 162 in plaats van 204; Chromium samen zo'n 540 MB in plaats van 580. Het eerste beeld na het
  uitzoomen bleef ongeveer gelijk (rond de 190 ms tegen 225: dat is de grond en het bos, vraag 113). Alle 50 tekeningen
  zijn pixel voor pixel dezelfde gebleven, rond hetzelfde anker, en 19 van de 20 vaste schermafdrukken byte voor byte;
  in het verste overzicht (0,35) kiest het verkleinen in 232 pixels (0,02%) de buurpixel, bij dezelfde tekenopdrachten.
- **De figuren net zo** (stap 1b): een figuur laadt pas als zijn wezen op de kaart staat, met al zijn houdingen; wie
  maait, krijgt de maaier erbij. Wie van figuur wisselt (een kind dat opgroeit, een boer die gaat maaien), houdt zijn
  oude beeld tot het nieuwe er is, en wie net op de kaart komt (de marskramer over de weg), staat er pas als zijn figuur
  er is. Bij het begin 20 van de 48 figuren (49 van de 122 vellen): de monsters van het oude spel, de soldaten, de heer en de inner laden pas
  als ze komen. Samen nu 81 MB aan plaatjes bij het begin, in plaats van 197 bij het begin van de dag; de twintig vaste
  schermafdrukken bleven byte voor byte dezelfde als na stap 1.

### De eerste bouwstijl: wit (4 okt 2026, werklijst vraag 114, stap 2a)

Marcel: "A ja B ja C ik wil overal bouwfase voor. Dat maakt het toch wel leuker. Kost meer tijd. Maar is eenmalig toch?
D ja E ja". Elk land van de maker bouwt in één stijl (`STIJLEN` in `gereedschap/pixelart/huizen.cjs`); de eerste is
**wit**: wit vakwerk, groene luiken, veldsteen en riet, met hut 1, 3 en 4, huis 1, 3 en 6 (en hun stenen broertjes) en
boerderij 1 en 4 (de vormen van ronde 4b). Elke andere stijl krijgt straks zijn eigen drietal vormen (B), zodat je een
land ook aan zijn vormen herkent.
- **Vier standen:** de deur naar zuid, oost, noord of west, altijd op de lange muur van de hoofdvleugel, of (bij een T of
  een L met de vleugel naar voren) op de gevel die dezelfde kant op kijkt (`deurOp: 'hoofd'` in `huis-sdf.cjs`). Zonder
  die regel koos de bouwer de muur die het best uitkwam, en dan wezen bij de T twee standen dezelfde kant op. Oost en
  west zijn gespiegeld in de diagonaal (nok 'y'), noord en west staan met hun achterkant naar je toe. Spiegelen is niet
  overal een spiegel: de bouwer zet iets langs een muur van links naar rechts in beeld, dus een schoor stond gespiegeld
  vooraan op zijn gevel en stak buiten de voet; bij een huis van een stijl keert hij die plek nu om. De draaibare huizen
  (vraag 124, B; Marcel: "124b Ja dan") lossen dat op, want dan ligt alles vast per muur.
- **De daken van de treden:** een hut houdt riet; een huis en een boerderij komen onder riet, leien en pannen, en een
  stenen huis in veldsteen onder leien of pannen, en in baksteen onder pannen. Samen 12 hutten, 36 huizen, 36 stenen
  huizen en 24 boerderijen: 108 tekeningen, elk met bouwfasen.
- **De proefplaat:** `node gereedschap/pixelart/huis-sdf-export.cjs stijl wit` (de vormen, een huis en een hut in de vier
  standen, de daken en de steen, en drie straatjes: het gehucht, een dorp, marktrecht met een steenbakkerij).
- Een huis kost zo'n 35 seconden, zijn vijf bouwfasen ruim drie minuten (op één kern); `bouwfasen.cjs --erbij` rendert
  alleen wat nog geen fasen heeft.

### De draaibare huizen (4 okt 2026, werklijst vraag 124, B)

Marcel: "124b Ja dan", en op het plan "A ja en het idee opslaan, hier komt later ook iets van een moestuin bij. B ja C
ja". Een huis van een stijl is één huis van vier kanten, en zijn vier standen zijn dat huis een kwartslag gedraaid, niet
gespiegeld. Dan is een stand meteen een aanzicht: als de camera straks draait (vraag 124), neemt het spel de tekening van
de stand ernaast (`T.metDeurNaar`).
- **De camera draait om het huis, niet het huis om de camera.** `tekenWereld` (`toren.cjs`) krijgt `o.draai` (0 tot en met
  3): de camera, de zon en het randlicht gaan een kwartslag om de wereld, zodat de zon op het scherm altijd linksboven
  staat, en de wereld zelf blijft zoals hij is. Zo ligt elke steen, balk en lap riet van elke kant op dezelfde plek: de
  patronen rekenen in de maten van het huis (de stenen uit de normaal, het riet uit zijn plek op het dak). Een kwartslag is
  wisselen en een minteken, dus zonder draai rekent alles precies zoals ervoor: de oude huizen zijn pixel voor pixel
  dezelfde gebleven (nagekeken op tien huizen, ook het wit van nu).
- **Elke muur ingevuld** (`rondom` in `huis-sdf.cjs`): ook achter en aan de linker gevel vakwerk, ramen, luiken en
  bloembakken, en beide kopse kanten een gevel met een raampje in de top en windveren. Elke muur zie je in twee standen: één
  keer links in de zon, één keer rechts in de schaduw. Wat je ziet, is wat je van een van de vier kanten ziet; elke muur
  heeft zijn eigen lot, zodat wat aan de ene muur verandert, de andere niet verschuift.
- **Een huis houdt een gezicht naar de straat** (Marcel: "A ja"): de uitbouwen (een aanbouw, een erker, een dakkapel, een
  schoor tegen de gevel) blijven waar het zaad ze zet, voor en rechts; er komt geen tweede deur. De bloembakken komen aan
  elke kant evenveel, liefst op de lange muur. Een achterkant met leven (een achterdeur, een houtstapel, een regenton, een
  moestuin) staat in `opmerkingen.md`.
- **De voordeur zie je van zuid en van oost**, de twee standen waarin hij naar je toe kijkt. In de binnenhoek van een T of
  een L met de vleugel naar voren zie je de muur maar van één kant; dan komt de deur in de gevel van die vleugel.
- **De bouwfasen** komen uit hetzelfde huis en draaien mee, met de steiger rondom (Marcel: "B ja"): de bouwplaats is van
  elke kant dezelfde. In de laatste fase staat hij nog langs de voor- en de achterkant.
- **De standen** (`STANDEN` in `huizen.cjs`) zijn de draai: zuid 0, oost 1, noord 2, west 3; de namen van de tekeningen
  bleven. De voet, de deur en het anker meet `meetHuis` zoals het huis in het beeld ligt.
- **Wat uitsteekt, komt in een van de standen vooraan.** Bij het renderen stak de schoor van hut 1 in stand west over de
  rand van zijn voet: het meten miste de dunne stok, en bij het gespiegelde wit stond hij altijd achteraan. Rondom staat
  een schoor nu steiler, binnen één tegel voor de gevel, en telt hij altijd mee in de voet (hut 1 6 bij 4, huis 3 9 bij
  7).
- **De proefplaat:** `node gereedschap/pixelart/huis-sdf-export.cjs rondom` (huis 1, de L-hut en de T in hun vier standen,
  en huis 1 in aanbouw van vier kanten). De toetsen staan in `test/draaibare-huizen.test.cjs`.

### De andere drie bouwstijlen: oker, planken en roze (5 okt 2026, werklijst vraag 114, stap 2b)

Marcel: "A ja B ja C delen D stap 3 E tuurlijk", en na de proefplaten "1 ja 2 is goed zo". Elke stijl heeft zijn eigen
huizen en boerderijen, met een uitbouw als kenmerk, zodat je een land ook aan zijn vormen herkent:
- **oker, "de zolders":** oker kalk, rode luiken, zandsteen, riet; huis 2, 4 en 5 (anderhalve laag met een dakkapel, de L
  naar achter, smal en hoog met een schoorsteen op de gevel), een T-boerderij en boerderij 3 in vakwerk.
- **planken, "het houtland":** alles van hout onder spanen, blauwgrijze luiken, veldsteen met planken erboven; een huis van
  twee lagen met een galerij op palen, een L met een stenen buitentrap, een huis met een aanbouw en een schoor; de T van
  planken en de blokhut. Ook de hutten zijn van planken.
- **roze, "het rijke vakwerk":** roze kalk, kale luiken, zandsteen, riet; twee lagen die overkragen, een erker op de gevel,
  een T met de vleugel naar achter; een L en een lange boerderij van anderhalve laag.
- **De hutten delen ze** ("C delen"): oker en roze nemen die van wit, want vlechtwerk onder riet ziet er in elke stijl
  hetzelfde uit (de kalk komt niet op leem). Alleen de plankenstijl heeft eigen hutten.
- **Wat de bouwer niet zegt:** met `rondom` staat de voordeur op de lange muur van de hoofdvleugel, en past hij daar niet
  meer naast een trap of een erker, dan laat de bouwer die stil weg. Planken huis 8 en roze huis 11 zijn daarom 6 tegels
  diep. Een dakkapel valt soms weg onder een dun dak (oker huis 5 en roze huis 12; Marcel: "goed zo").
- Het huis van de schout, de herberg en de kapel krijgen hun stijl met de grote gebouwen (stap 3).
- De proefplaten: `node gereedschap/pixelart/huis-sdf-export.cjs stijl oker` (en `planken`, `roze`).

## Ontwerpcanvas

https://claude.ai/artifact/K4frzQ2o5Ak3owGhA4AJms (privé). Daarop staan:

- de hal, op 84, 92 en 99 jaar;
- het gevecht in de voorraadkamer;
- de vergelijking van 32 naar 64 pixels;
- de figuren in acht richtingen;
- muren, vloeren en voorwerpen.

## Het dorp: het werk van Knights and Merchants, in warm licht met diepte (Marcel, 20 sep 2026)

Het eerste dorp werd te sprookjesachtig: wit vakwerk, rode pannen, fel groen gras. Marcel noemde
eerst Knights and Merchants, en liet daarna een referentie zien (een pixel art-scène met
huisjes met rode pannendaken langs een pad over een klif, een rivier eronder, en een kasteel in
de nevel). Die twee samen:

**Van Knights and Merchants:** het werkdorp. Huizen dicht op elkaar, modderige paden met sporen,
werkplaatsen met een erf waar je het werk ziet (stapels stammen, zakken meel, een aambeeld en
kolen, droogrekken, tonnen, karren), akkers in verschillende stadia, omheiningen van ruwe palen.

**Van de referentie:** de sfeer.
- **Warm licht met hard contrast:** zonlicht op de daken, diepe schaduw onder de overstek. Geen
  vlak fel groen, maar diep groen met zonnevlekken.
- **Vooral hout en stro** (Marcel, 20 sep 2026): riet op zo'n twee derde van de gebouwen,
  schaliën op een paar, en rode pannen als uitzondering op de herberg, de kapel en een enkel
  beter huis. Wanden van stapelhout, ruwe planken en vlechtwerk; veldsteen voor plinten,
  schoorstenen en een enkele hele muur. Met variatie: verweerd grijs naast warmer bruin, vers
  stro naast oud en gelapt.
- **Huizen mogen niet op elkaar lijken** (Marcel, 20 sep 2026). Een dorp groeit in een eeuw,
  het komt niet uit één catalogus. Varieer de plattegrond (ook een L-vorm, een aanbouw, een
  afdak, een buitentrap), de hoogte en de dakhelling, de ouderdom (een doorgezakte nok, een
  gelapt dak, een scheve luik), de ramen en deuren, en het erf: bij de een een houtstapel, bij
  de ander een kippenren, kruidenbed of drooghekken.
- **Diepte in lagen:** begroeiing als lijst aan de randen, en naar achteren toe waziger en
  doffer. Daarmee verdwijnt ook de harde rand van onze eilandjes.
- **Hoogteverschil:** een pad dat over een richel loopt, met een leuning en lantaarns, en water
  op een lager niveau. Onze dozen kennen al een hoogte, en het water uit `dorp2.cjs` ligt al
  onder het maaiveld, dus terrassen met een rotswand en trappen kunnen.
- **Een silhouet in de verte:** iets om naartoe te kijken, in lage contrasten. Bij ons: de toren.

De maten uit `wereld.md` blijven gelden, en de schaal is goed zoals hij is (Marcel, 20 sep
2026). In het spel kijk je namelijk ingezoomd: op 1080p toont het spel ×2, dus zo'n 960 bij 540
pixels, ongeveer vijftien bij zeventien tegels. Dan vullen twee of drie huizen het scherm en
zijn de mensen groot genoeg. De brede platen die we renderen zijn overzichtskaarten, niet wat
de speler ziet.

**Het overzicht** (Marcel, 3 okt 2026, vraag 108, a: "108 a tab"): met `Tab` kijk je over je dorp, op 0,5 (een
kwart van wat je op 1080p ziet, in elke richting twee keer zo ver) en met het wiel op 0,35. Daar zijn de mensen nog
te zien, maar klein; de kunst is gemaakt voor ×2, en het overzicht is om te kijken en te plannen, niet om te genieten.
Het tekenen kost daar meer (gemeten op 3 okt, zonder scherm: 10 ms per beeld bij het volgen, 30 ms op 0,5 en 49 ms
op 0,35), omdat er vier tot acht keer zoveel tegels in beeld zijn.

De toren en zijn kamers houden hun eigen sfeer, die uit Mystic Towers.

### De leidende referentie: de boerderij met de watermolen (Marcel, 20 sep 2026)

**Dit is referentie nummer één** (Marcel: "deze laatste ref is bij mij nr 1"). Waar deze plaat
botst met de eerdere referenties, wint deze. Knights and Merchants blijft gelden voor wat er in
een dorp gebeurt (werkdorpen, erven, akkers), en de kliffenplaat voor het warme licht, maar hoe
een gebouw eruitziet, komt hiervandaan.

Marcel liet een isometrische pixel art-plaat zien van een boerderij met een watermolen aan een
beek, en noemde die stijl "echt passend". De plaat:
https://i.pinimg.com/originals/3b/7c/c8/3b7cc846ee7b292b5407a84939a1e821.gif (van iemand anders;
alleen de link, niet het beeld zelf in de opslagplaats). Wat we eruit overnemen:

- **Het dak is het gebouw.** Het riet is de grootste massa, ruim de helft van de hoogte, en het
  zakt laag over de muren heen. Je ziet de lagen riet per rij liggen, de nok is een dikke rol, en
  onder de overstek zit diepe schaduw. Onze daken zijn te klein en te vlak.
- **Steen onder, hout boven.** Een onderbouw van ruwe veldsteen (koel grijsblauw), daarboven hout
  en vakwerk (warm oranjebruin). Twee temperaturen per huis; dat is wat het rijk maakt.
- **Dingen die uitsteken.** Een erker op klossen, een dakkapel met een eigen rieten kapje, een
  schoorsteen met een kap, gesneden windveren langs de gevel. Zulke randen maken het silhouet van
  een huis van ver herkenbaar, en meteen anders dan dat van de buren.
- **Elk huis is een werkplek.** Een rad in de beek, akkers in rijen, varkens in de modder, een kar
  met een gebroken wiel, stapels stammen, een koe, een boer. Het erf vertelt wat er gebeurt.
- **Het bijgebouw is geen klein huisje** maar een half ingegraven schuur met het dak bijna tot op
  de grond en een gemetselde boogdeur.
- **Bomen met variatie,** waaronder een kale dode boom tussen het groen, en slagschaduwen van de
  bomen op het gras.

De plaat is een diorama op een schuin afgesneden plak grond. Dat is presentatie; onze wereld loopt
door, dus die harde rand nemen we niet over.

### Water is modderig, en een pad heeft karrensporen (Marcel, 20 sep 2026)

Op de eerste proefplaat van de randtegels was het water fel korenbloemblauw met witte fonkeling,
terwijl de rest van de wereld naar olijf en gedempt is gegaan en het water op de referentie
modderig grijsgroen is. Hetzelfde soort uitschieter als de blauwe veldsteen.

- **Water is modderig:** gedempt grijsgroen, donkerder naar het midden, warmer en ondieper bij de
  kant. Fonkeling mag, maar spaarzaam en gedempt.
- **Een pad heeft karrensporen:** twee sporen in de rijrichting met een hogere strook ertussen, en
  een getrapte rand waar het gras uitdunt in plaats van een harde grens. Zonder dat leest een pad
  als een modderplek, en een dorp moet juist een geheel worden met wegen die ergens heen gaan.
- **Een kasseiplein heeft een rand:** een kantlaag van grotere stenen, zodat het gelegd oogt en
  niet gemorst.

## Binnen is grijs, en kleur betekent iets (Marcel, 20 sep 2026)

Naar aanleiding van een isometrische plaat die Marcel liet zien: een kelderhoek als diorama in een
donkere doos, kasseivloer, ruwe stenen muren, een gesneden boog met een zwarte doorgang, een
lantaarn, en klimop met witte bloemen die naar binnen kruipt. Bijna alles grijs. "Lijkt heel erg
goed te passen bij onze stijl." Dat geldt voor kelders, grafkelders en mijnen — de toren en het
dorp houden hun eigen sfeer.

- **Bijna grijs, en kleur alleen waar het ertoe doet.** Dit is de belangrijkste regel, en hij is
  niet alleen mooi maar ook speelbaar: in een grijze ruimte is alles met kleur meteen belangrijk.
  Een gloeiende grondstof, een vijand, een deur die open kan — je ziet het zonder pijl. Het zet
  ook het contrast aan met buiten, waar we juist warm en olijf zijn.
- **Een donkere doorgang is een zwart gat,** geen deur met details. Dat is de gang die je nog niet
  kent. Kost niets, werkt altijd.
- **Klimop en planten kruipen naar binnen.** Veertig jaar niemand die iets onderhield, dus het
  leven neemt het over. De plantengeneratoren bestaan al.
- **Wat we niet overnemen:** op die plaat is de figuur een ornament, een zesde van de kamerhoogte.
  Bij ons is de tovenaar 88 pixels op een tegel van 64×32 en dat blijft zo, want je moet in een
  gevecht zijn houding en zijn gezicht kunnen lezen. En een gesloten doos met twee hele muren werkt
  voor een plaat maar niet voor een spel: de voorste muren blijven laag weggesneden.
- **Wat een kelder vooral nodig heeft, is een omgeving die leeft:** de vlam in de lantaarn,
  druppelend water, stof in het licht, klimop die meebeweegt met de wind. Zie de open punten
  onderaan.
- **Het reliëf in een gesneden boog is echt snijwerk in code.** Dat bewaren we voor een of twee
  belangrijke plekken, niet voor elke deur. Ruw gestapelde steen kunnen we wel gewoon.

## Zelf maken, niet kopen (20 sep 2026)

Marcel liet twee gekochte kits zien, een voor kelders en een voor buiten, als inspiratie. Ze zijn
bruikbaar als **boodschappenlijst**, niet als kunst. Waarom we ze niet gebruiken:

- alles bij ons komt uit één renderer, met één palet, één lichtrichting en één omlijningsregel. Dat
  is waarom het dorp, de toren en de figuren als één wereld aanvoelen, en waarom één beslissing —
  veldsteen grijs in plaats van paars — alles tegelijk kon bijstellen. Een gekochte kit zet een
  tweede lichtrichting en een tweede palet in hetzelfde beeld, en dat zie je meteen;
- gekochte kunst ligt vast. Onze klimop moet meebewegen met de wind, onze verdieping moet van
  krakkemikkig naar hersteld kunnen, onze boom moet kunnen verdorren tot een dode boom. Dat kan
  alleen als het uit code komt;
- voor verkoop moet de licentie van zo'n pak nagelopen worden, en dat gedoe kunnen we onszelf
  besparen.

**Wat die twee kits wél opleverden — wat wij nog missen.**

Voor een kelder (we hebben al: muren met negen versieringen in twee richtingen, deuren open, dicht
en op slot, vloeren, kisten, tonnen, puin, wandrek, wandlamp): **trap** (die tekent het spel nu nog
als vlak, want er is geen kunst voor), ladder, vloerrooster, ingestorte vloer, stalagmieten, vuur,
botten, en mos en klimop op muren. En de les uit hun muurrijen: de rijkdom komt uit acht varianten
van dezelfde muur — gaaf, gebarsten, bemost, begroeid, half ingestort — niet uit acht verschillende
muren.

Voor buiten: **dieren** (zie `spreuken.md`, ze zijn voer voor het verdorren), **klifranden** voor
het hoogtesysteem, wegwijzers (horen bij "de doelen zijn zichtbaar"), tent en kampvuur voor
questplekken, een stenen brug naast onze houten, en meer grondsoorten — elke soort erbij is een
terreinset erbij.

### Onze eigen art, met onze eigen pijplijn (Marcel, 19 okt 2026)

Marcel: "We moeten zelf een betrouwbare pipeline hebben om te bouwen. Ik wil niet steeds gpt moeten gebruiken", en "we
kunnen niet voor elk plaatje een referentie maken. Ik wil dat wij onze eigen art maken met onze eigen pipeline."

- **Per ding is er niets anders nodig dan het model in code.** Geen referentiebeeld per ding, en geen ChatGPT, ook niet als
  stijlplaat.
- **Wat de stijl maakt, ligt één keer vast voor het hele spel:**
  - het SDXL-checkpoint, lokaal;
  - één zin voor de huisstijl;
  - één zin per materiaal (hout, rode verf, ijzer, jute, vacht, goud);
  - de instellingen en de seed.
- **De gebieden komen uit onze render.** Elke pixel weet welk materiaal hij is, dus SDXL krijgt per gebied zijn zin.
- **Wat zeker moet kloppen** (een wapen, een leeuw), tekenen we zelf in code, als embleem op het model; SDXL werkt het af.
- **Daarna de projectie:** het geschilderde beeld op het model, alle richtingen en standen door onze renderer
  (`gereedschap/ai/ai-afwerking.md`, "Een eigen pijplijn").
- **Later kan de stijl helemaal van ons worden:** een eigen LoRA, getraind op onze eigen goedgekeurde resultaten.
- **De maatstaf** is Marcels stijlspecificatie (19 okt 2026, `ontwerp/stijlspecificatie.md`): warm licht van linksboven,
  koelere schaduw, materialen met hun eigen kleur, drie lagen detail, zachtere binnenlijnen, geen ruis.

### Kinderkopjes in plaats van kasseien (Marcel, 21 sep 2026)

"Mooie stenen straatjes, kinderkopjes zoals ze die hier noemen." Onze kasseien zijn platte,
gezaagde stenen; kinderkopjes zijn bolle, ronde veldkeien. Elk een bolletje dat bovenop het licht
vangt, met diepe donkere voegen, mos en gras ertussen, niet op een rij (zie "Niets is waterpas"),
en in een straat vaak een goot van platte stenen in het midden waar het regenwater doorloopt.

Het zijn dezelfde tegels in `tegels/rand.tsx`, alleen met een andere tekening, dus de paden die
Marcel al heeft geschilderd worden vanzelf kinderkopjes. De volgorde en het aantal tegels blijven
gelijk (`kaarten.md`, "Een tegelnummer verandert nooit").

## Wat er staat (20 sep 2026)

Klaar en in `gereedschap/pixelart/`, met een exportscript per onderdeel:

- de hal en de voorraadkamer, de figuren, de voorwerpen, muren en vloeren;
- bomen en begroeiing, het dorp met zijn plekken, negentien dorpelingen, de bosvijanden, en de
  toren in drie staten;
- de huizen op de leidende referentie, de schuur als eigen type, en de wereldkaart daarop
  herbouwd (dorp linksonder, de weg naar de toren rechts);
- het erf van de toren: de krakkemikkige toren met moestuin, waslijn, schuur en bosrand;
- animaties voor de tovenaar, Wim, het skelet, de slijmkruiper, de wolf, de spin en de kobold.

In de maak: het bos als reisgebied, de sprite van de oude meester, en de tegelvellen waarmee
Marcel de kaarten in Tiled kan tekenen (zie `wereld.md`).

Een les uit het werk met meerdere agents: drie tegelijk die renderen, gaan hard door het
budget. Eén tegelijk, en sprites hergebruiken in plaats van elke boom opnieuw uitrekenen.

## Wat je niet kunt zien, kun je niet spelen (Marcel, 20 sep 2026)

Bij het eerste rondlopen buiten: "je kunt niets zien achter de toren" en "ik word aangevallen
door een wolf die ik niet kan zien". Daar volgen drie regels uit, die voor alle buitengebieden
gelden.

- **Doorkijk.** Een hoog voorwerp dat de schout of een wezen bedekt, wordt doorzichtig zolang dat
  zo is, of het silhouet van de figuur wordt eroverheen getekend. Zo doen Fallout, Diablo en
  Baldur's Gate het ook. Bepalen wat wat bedekt gaat op tegels en hoogte, niet op pixels, want
  het moet elk beeld kunnen. De overgang loopt in een paar tienden van een seconde op en af,
  anders klappert het.
  **Zo werkt het nu** (26 sep, zevende sessie; `js/doorkijk.js`): wie je hoort te zien, zie je door
  een boom of een huis heen. Dat zijn de schout, wie je spreekt, wie vecht of je net ontdekte, wie je zoekt met een
  voorval, en de bezoekers (de heer, de marskramer, de inner en de soldaten); door een huis heen ook iedereen op het
  plein (`T.zichtbaarDoor`), behalve op een feest (sinds 10 okt; Marcel: "Ja akkoord"): dan staat het hele dorp er, en
  kreeg het dak van een huis ervoor twintig gaten naast elkaar (`pleinOpEenFeest`). Hoe je erdoorheen kijkt, is een keuze in de spelregels ("Door een huis
  heen kijken"): het **kijkvenster** (de standaard), een zacht rond venster rond wie erachter staat,
  waarin de grond achter het huis en wie daar staat opnieuw getekend worden (`T.tekenKijkgat`), één per wezen, na
  het voorste voorwerp dat hem bedekt (sinds 13 okt: in een bos tekenden 20 tot 30 bomen elk hetzelfde gat, en
  daardoor was het gat daar groter en harder van rand dan bedoeld; Marcel: "Dat is prima"); of het
  **raster**, waarin het hele huis of de hele boom om de andere pixel opengaat (`T.tekenGerasterd`).
  Of het plein meetelt, is de tweede keuze ("Wie je door een huis heen ziet": ook het plein, behalve op een feest, de
  standaard; het plein, ook op een feest; of alleen wie ertoe doet). Een boom van de bosrand
  valt helemaal weg. Een gebouw vervaagt nooit als geheel, want een half doorzichtig rieten dak werd
  een geelgroen spook (Marcel, 23 sep). Tot 26 sep kwam in het venster alleen de schout zelf terug, met
  het dak eromheen, en dan leek hij óp het dak te staan (Marcel: "In al je plaatjes staan er mensen op
  het dak van huizen").
  **Misschien helemaal doorzichtig** (Marcel, 26 sep): nu er ook huizen vóór het plein komen, stelde
  Marcel voor huizen misschien volledig transparant te maken. Het geelgroene spook van 23 sep kwam
  doordat een half doorzichtig rieten dak zich mengde met het gras erachter. Voorstel van Claude, om
  als optie in de spelregels te proberen: (1) het kijkvenster zoals nu, maar ook voor de heer, de
  marskramer en wie je spreekt; (2) van het huis blijft alleen de omtrek staan, als een dunne lijn;
  (3) het huis wordt in een raster doorzichtig, om de andere pixel, zoals oude spellen dat deden: dan
  mengt er geen kleur. **Marcel koos (26 sep): "Zoals jij voorstelt"**: de eerste en de derde, allebei
  als keuze in de spelregels, na de kaart; wat hij in het spel kiest, wordt de standaard.
  **De proef** (26 sep, zevende sessie): een huis vóór het plein, met de schout en drie mensen erachter,
  in vier beelden naast elkaar. Het raster mengt toch: om de andere pixel is op ons scherm één of twee
  schermpixels per vakje, en dan mengt het oog de kleuren alsnog. Het rieten dak over het gras werd weer
  geelgroen, het spook van 23 sep, alleen scherper. Oude spellen rasterden juist omdat het er half
  doorzichtig uitziet. Een grover raster (vier schermpixels) mengt niet meer, maar legt een dambord
  over het hele huis en hakt de mensen erachter in blokjes. Het kijkvenster houdt het huis heel en de
  mensen scherp, ook met vier vensters naast elkaar. Twee dingen vielen verder op: vóór het plein staat
  nog geen huis (alleen de boerderij op de oosthoek dekt een strook af), dus het venster is vooral
  nodig voor wat nog komt; en als iedereen op het plein meetelt, krijgen de vijf eiken er gaten van
  zolang de kinderen spelen. Voorstel van Claude (vraag 34 in de werklijst): alleen het kijkvenster,
  voor meer mensen; het plein telt alleen achter een huis, niet achter een boom.
  **Marcel koos (26 sep, zevende sessie):** "Ja dit is een goede optie", en daarna "Raster ook als
  keuze". In de spelregels komen dus twee keuzes: hoe je door iets heen kijkt (het kijkvenster, de
  standaard, of het raster om de andere pixel) en wie je door een huis ziet (ook iedereen op het plein,
  de standaard, of alleen wie ertoe doet). De doorkijk krijgt een eigen bestand, `js/doorkijk.js`.
- **Niets valt je aan van buiten beeld.** Een wezen dat jou kan zien, moet jij kunnen zien. Als
  het je ontdekt, gaat de camera ernaartoe en komt de melding.
- **Waar je loopt, staat niets.** Dichte begroeiing hoort aan de rand, waar je niet komt. Wat er
  op een begaanbare tegel staat, hoort daar niet; staat er iets, dan is die tegel vast.

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

## De sprites zitten in het spel (20 sep 2026)

`npm run pixelart:spel` zet uit `uit/` precies neer wat het spel tekent, in `beelden/` (wél in
git). De muurstukken worden daar opnieuw gerenderd, zonder de strook vloer die op de
overzichtsplaat voor de muur ligt, en in beide richtingen: een noordmuur kijkt naar het
zuidwesten, een westmuur naar het zuidoosten. Een muurstuk is een halve tegel dik, zoals in
`kamers.cjs`, dus krijgt elke muurtegel er twee achter elkaar; het voorste draagt de
versiering. Vloeren zijn lappen van twee bij twee tegels waar het spel per tegel een ruit uit
knipt, zodat het verband doorloopt.

`js/sprites.js` kiest het beeld, en leidt de houding af uit de spelstaat zelf in plaats van uit
een tweede boekhouding: een pad is lopen, `uitval` is uithalen, `flits` is net geraakt, `dood`
is sterven, en jaren die erbij komen zonder klap zijn een spreuk. De pas komt uit de afgelegde
afstand en niet uit de klok, dus de voeten glijden niet, ook niet als een monster in een
gevecht wat vlotter loopt. De tovenaar loopt op het vel van zijn leeftijd (84, 92 of 99).

Nog niet in de kunst: de pilaar en de trap (die blijven vlakken), en een houding voor sluipen.

## Eén wind door alles heen (Marcel, 20 sep 2026)

"Mag allemaal wel wat beweging in, die doeken enzo. Kan me voorstellen dat het soms waait?"

Niet elk ding apart laten wiebelen, maar één windwaarde in de spelstaat waar alles aan hangt.
Die loopt langzaam op en af, met vlagen, zodat het als weer leest en niet als speelgoed.

- **Wat meebeweegt:** de doeken aan de waslijn, de boomkruinen en struiken, het gras, de rook uit
  een schoorsteen, en de windwijzer op de toren, die met de richting meedraait.
- **Hoe:** de sprites blijven stilstaand. Bij het laden wordt een beeld in horizontale plakken
  verschoven, meer naar boven dan naar onder, zodat een boom buigt in plaats van te schuiven.
  Dat levert een handvol standen per voorwerp op, die aan de windwaarde hangen. Zo blijft het
  tekenen gewoon plakken, en hoeft er niets per beeld te worden uitgerekend.
- **Niet alles even hard:** een zwaar ding (een schuur, een muur) beweegt niet, een boom een
  beetje, een doek veel. De uitslag hoort bij het ding, de wind is voor iedereen gelijk.
- **Uit de pas lopen:** elk voorwerp krijgt een eigen verschuiving in de tijd, anders wappert het
  dorp als één vlag.

## Het huis van de heer draagt rood en geel (Marcel, 24 sep 2026)

Toen we aan het tekenwerk begonnen, koos Marcel:

- **Eerst de heer, zijn soldaten en de inner.** Zij liepen in andermans kleren (de mantel van de
  meester, de smid, de bruidegom), en ze komen elk jaar langs.
- **De heer is klein en dik, met een veel te grote hoed:** een rond mannetje in een mantel met bont,
  gouden kettingen over zijn buik, en een hoed met veren die veel te groot is. IJdel en een beetje
  belachelijk. Zwarte satire: hij is lachwekkend, zijn straffen niet.
- **Het huis van de heer draagt rood en geel.** Zijn soldaten en de inner dragen die kleuren ook,
  zodat je meteen ziet wie van hem is.

Voorstel van Claude voor de andere twee, te beoordelen op de proefplaat:

- **De soldaten zijn geen grap:** groot en zwaar, een wapenrok in rood en geel over een gewatteerd
  wambuis, een ijzeren hoed en een hellebaard.
- **De inner is mager en sober,** in donkere kleren, met een rekenboek onder de arm en een pen
  achter zijn oor. Alleen zijn hozen dragen de livrei: het ene been rood, het andere geel.

**Gemaakt (24 sep 2026)** in `gereedschap/pixelart/heer.cjs`, met staan en lopen in acht
richtingen; de proefplaat is `uit/dorpelingen/huis-van-de-heer.png`. Naast een boer (kruin 66 px)
is de heer 48 px tot zijn kruin en 61 tot 69 px met hoed en veren, en is zijn hoed 45 px breed
tegen 37 voor de boer. De soldaat is 70 px, 93 met hellebaard; de inner 68 px. Wat onderweg bleek:

- de heer trippelt: hij loopt met 20 beelden per seconde, want met 10 was elke pas langer dan zijn
  beentjes;
- hermelijn onder zijn ronde gezicht leek een witte baard, dus is zijn bont bruin, met een kraag
  die voorop open is;
- de rand van zijn hoed wipt voorop op, anders zie je van boven zijn ogen niet;
- het gezicht van de soldaat ligt in de schaduw van zijn hoed: grimmig, en bewust klein.

Twee nieuwe gereedschappen maakten het klein werk: `dorpelingen-anim.cjs heer soldaat inner`
rendert alleen de genoemde figuren, en `naar-spel.cjs --alleen heer,soldaat,inner` zet alleen die in
het spel. Zonder `--alleen` bouwt het de hele beschrijving opnieuw op uit `uit/`, en in een verse
kopie is die map leeg: dan verdwijnen alle andere figuren.

## De schandpaal: een paal met een halsijzer (Marcel, 24 sep 2026)

Een dikke eiken paal op een stenen trede, met een ijzeren halsband aan een ketting, en bovenop een
bordje met het wapen van de heer in rood en geel. Wie eraan staat, staat rechtop: dat kunnen de
poppetjes al, en de halsband komt vóór hem in beeld. Marcel koos dit boven een schandblok (hoofd
en handen door een plank, wat een nieuwe gebogen houding voor elk vel had gevraagd) en een
verhoogde kaak met een trapje. Wanneer hij er staat, is een spelregel: zie `spel.md`,
"Sint-Maarten".

**Gemaakt (24 sep 2026)** in `gereedschap/pixelart/schandpaal.cjs`, als eigen vel
`beelden/schandpaal.png` met drie delen:
- **leeg:** het halsijzer hangt open tegen de paal;
- **bezet:** de ketting loopt naar wie ervoor staat;
- **het halsijzer** zelf, als laag over die persoon heen.

De balk leunt een paar pixels, heeft droogscheuren en is onderaan bemost. Het wapen is gevierendeeld
rood en geel, zoals de wapenrok van de soldaten, met hier en daar afgebladderde verf. De paal komt
92 px boven zijn voet uit, zo'n 58 px boven het hoofd van wie ervoor staat, en de halsband zit 51
px boven diens voeten (gemeten op de boer en de boerin). Wie eraan staat, kijkt naar voren, met zijn
rug naar de paal.

Nog niet goed:
- de boer houdt aan de paal zijn hooivork vast, want zo is zijn vel voor staan;
- in het gehucht staat de paal, net als de heer en de marskramer, achter het dak van een huis: zie
  de werklijst.

## Een gezicht per karakter (Marcel, 25 sep 2026)

Elk spel loot iedere boer een karakter (`js/boeren.js`), maar dat zag je alleen bij de muis en
boven het gesprek: alle boeren waren de boer of de boerin. Marcel koos het voorstel van Claude:
ieder karakter krijgt iets herkenbaars, zodat je de weduwe of de drinker van ver ziet lopen.

| Karakter | Wat je ziet |
|---|---|
| zanger | bonte muts met een veer, luit op de rug |
| weduwe | zwart, met een kap |
| woekeraar | nette bruine jas met bont, buidel aan de riem |
| vroedvrouw | wit schort, hoofddoek, tas |
| heethoofd | opgestroopte mouwen, rood gezicht |
| vrome | sober grijs, rozenkrans in de handen |
| roddelaar | bonte omslagdoek, mand aan de arm |
| de oudste | grijs haar en baard, stok, wat krom |
| nieuwkomer | vreemde groene kiel, bundel op de rug |
| drinker | rode neus, dikke buik, kroes in de hand |

- **Op het lijf van de boer én van de boerin.** Een boer kan elk karakter loten dat bij hem past, dus
  acht karakters komen er twee keer. De weduwe en de vroedvrouw zijn altijd vrouw: achttien vellen.
- **In twee rondes.** Eerst de vijf van de vaste verdeling (zanger, weduwe, woekeraar, vroedvrouw,
  heethoofd) als proef, dan de andere vijf. Wie nog geen eigen vel heeft, blijft de gewone boer of
  boerin.

**Ronde 1 gemaakt (25 sep 2026):** acht vellen, van `boer-zanger` tot `boerin-vroedvrouw`. De
karakters zijn opties op `boer()` en `boerin()`; de tabel met die opties staat in
`gereedschap/pixelart/karakters.cjs`. De proefplaat is `uit/dorpelingen/karakters-ronde1.png`.
Zonder opties komen de gewone boer en boerin er pixel voor pixel hetzelfde uit. Wat erbij gekozen
werd, buiten de tabel:
- de zanger heeft geen hooivork of mand meer: zijn armen hangen, de luit hangt aan een band;
- de weduwe houdt haar mandje eieren;
- het bont van de woekeraar is grijs (grauwerk), want licht bont viel samen met de witte doek, en de
  woekeraar-boer draagt een vilten hoed en leren schoenen in plaats van stro en klompen;
- het heethoofd staat met de vuisten in de zij, en de boer heeft geen hoed maar haar dat rechtop
  staat.

Nog niet goed:
- van voren zie je van de luit alleen de kop boven de schouder;
- het rode gezicht van het heethoofd is het hele hoofd, en dat kan op een masker lijken;
- het gezicht van de woekeraar valt donker onder zijn hoedrand.

**Ronde 2 gemaakt (25 sep 2026):** tien vellen, van `boer-vrome` tot `boerin-drinker`. Daarmee
heeft elk karakter een eigen vel, achttien in totaal. De proefplaten zijn
`uit/dorpelingen/karakters-ronde2.png` en `karakters-alle.png`: alle achttien naast elkaar, en ze
zijn van elkaar te onderscheiden. Wat erbij gekozen werd, buiten de tabel:
- de vrome houdt de handen gevouwen, met een koperen kruisje aan de rozenkrans. De boer draagt een
  grijze kap met een schoudermanteltje;
- de roddelaar draagt een omslagdoek, geruit geel en paars, en houdt een hand bij de mond;
- de oudste loopt wat krom (13°), met een geschilde stok die als een derde voet meeloopt. De boer is
  kaal, met grijze plukken en een baard; de boerin draagt een donkere doek;
- de nieuwkomer draagt een gele zoom met een rode zigzag, en de boer een scheve blauwe baret; de
  banden van de bundel zijn op de borst geknoopt;
- de drinker heeft alleen een rode neus, geen rood gezicht zoals het heethoofd, en een hand op
  zijn buik.

De nek van de oudste zit lager (47 en 48 px, tegen 51 bij de rest), omdat zijn lijf krom is. Het
halsijzer zit bij alle achttien onder de kin.

## De marskramer loopt (Marcel, 25 sep 2026)

Marcels volgende keus voor het tekenwerk. De marskramer komt drie keer per jaar, maar leende het
vel van Wim, de knecht uit het oude spel. Zijn eigen figuur bestond al in `dorpelingen3.cjs`
(klein en krom onder een draagrek vol potten en pannen, met een lappenjas, gestreepte kousen, een
rode hoed met een gele veer en een wandelstok), maar kon nog niet staan en lopen. Dat komt erbij,
net als bij de andere dorpelingen, zonder dat zijn stilstaande beeld verandert.

**Gemaakt (25 sep 2026):** het vel `marskramer`, met staan en lopen in acht richtingen; de
proefplaat is `uit/dorpelingen/marskramer-proef.png`.
- Zijn stilstaande platen zijn pixel voor pixel gelijk gebleven.
- Het rek gaat met zijn romp mee en kantelt lopend iets na. De ketel en de pan schudden bij elke
  stap, en de linten wapperen, 1 à 2 pixels.
- Zijn stok loopt als een derde voet met de linkervoet mee, en staat een kwart van de cyclus op de
  grond.
- In het spel leent hij niets meer van Wim.

## De werkfiguren: de boer en de boerin aan het werk (5 okt 2026, werklijst vraag 111, b)

Een boer die op zijn land werkt (`js/veldwerk.js`), draagt zolang het vel van zijn werk, zoals hij in de oogst de maaier
leent (`js/sprites.js`, `WERKFIGUREN`): dezelfde gewone boer met strohoed en kiel, voor elk werk één vel. Wie een
boerin is, draagt dat van een vrouw: de gewone boerin, met haar rode jurk, blauwe schort en witte muts (Marcel, 5 okt:
"b ja"). Uit code, zoals de maaier (`gereedschap/pixelart/werkfiguren.cjs`; `werkfiguren-anim.cjs --proef` maakt de
proefplaat `uit/werkfiguren-proef.png`):
- **de zaaier en de zaaister:** staan met de hand in de zaaizak, lopen met de zak op de heup, en zaaien: een vuist in de
  zak, en bij de worp een open hand met een waaiertje korrels dat even licht vangt;
- **de wieder en de wiedster:** staan leunend op de schoffel (zijn rustpoos), lopen met de schoffel over de schouder, en
  wieden, gebukt, met een plat blad schuin op de steel; ook voor spitten en mest uitrijden;
- **de sprokkelaar en de sprokkelaarster:** met een bundel takken op de rug staan, lopen (de bundel deint mee) en rapen:
  door de knieën, de tak van de grond via de hand naar de bundel;
- **de maaister,** naast de maaier, met dezelfde zeis en slag;
- **de zager en de zaagster** (vraag 168, 15 okt; Marcel: "Ja, zo"): staan en lopen met de spanzaag aan het kruishout,
  en zagen aan de zaagbok van de zagerij: de rechterhand aan de greep, de linker op het kruishout, de zaag heen en weer
  en het lijf leunt mee. De zaagbok in de tekening heeft geen zaag meer ("Ja, eruit"): die heeft de zager bij zich, en de
  snede ligt waar zijn zaag komt als hij op de tegel voor de deur staat (`ZAGEN` in `werkfiguren.cjs`, de zaagbok in
  `huizen.cjs`).

Zolang hij aan dit werk is, ook op weg naar de volgende tegel of even rustend, houdt hij het vel, zodat hij niet bij elke
tegel van kleren wisselt. De lopen-houding is de loopcyclus van de boer of de boerin zelf. Eerst kwamen de drie van de
man (Marcel: "a ja"), daarna die van de vrouw en de betere houdingen ("b ja c nu"): het rapen ging van diep bukken naar
hurken (van voren zag je eerst alleen de hoed), de schoffel kreeg een blad (hij leek een hamertje), en de hand vingers
(het was een peddel). Wat nog beter kan, staat in `opmerkingen.md`, "Het beeld".

## Kleren naar stand (10 okt 2026, werklijst vraag 149)

Marcel: "Hogere niveau sociale mensen moeten duurdere kleren krijgen", en "a ja, b drie, c ja, d ja, e ja". Het gezicht
van een uiterlijk blijft (haar, kapsel, baard, neus, wenkbrauwen), de kleren gaan met de stand van zijn huis mee, in drie
trappen (`kleren()` in `gereedschap/pixelart/uiterlijk.cjs`; de proefplaat is `node gereedschap/pixelart/uiterlijk.cjs
kleren`, in `uit/uiterlijk/`):
- **arm** (de keuters in de hut): zijn eigen kleur, maar vaal (van wede, meekrap en wouw na veel wassen) of ongeverfd,
  met lappen, een gerafelde zoom (`rafel`, `rafelZoom`) en een vuile zoom, om en om blote voeten of klompen met modder;
  een wollen muts in plaats van vilt; geen halsdoek, geen vest, geen buidel; een vrouw zonder schort en zonder rijglijf,
  om en om met opgestroopte mouwen (Marcel, na de eerste plaat: "1 armer");
- **gewoon** (de dorpelingen en de boeren): de uiterlijken zoals ze zijn (vraag 145);
- **deftig** (de ambachtslieden): zijn kleur diep en vol (blauw wordt diepblauw, rood scharlaken, grijs en linnen
  zwart), fijne wol zonder lappen, leren schoenen, een buidel aan de riem, vilt in plaats van stro; een man in een jas
  tot onder de knie (`jas: 'lang'` in `boer()`, wijd uitlopend zodat de benen erin stappen), om en om met donker
  marterbont aan kraag, zoom en polsen, of een kraag van gebleekt linnen (Marcel: "2 alle", de lange jas); een vrouw met
  marterbont en zonder schort ("3 ja"), en een witte doek. Het bont is donker (`bontKleur`): licht bont op scharlaken
  met een groene muts was een kerstman.

Aan het werk draagt iedereen zijn gewone kleren (de werkfiguren van vraag 145). De deftige kleren komen pas als het huis
zijn laken krijgt (e; `T.klerenVan` in `js/bewoners.js`, de spelregel "Kleren"). De vellen: `boer-u7-arm`,
`boerin-u3-deftig`, staand en lopend (`uiterlijk-anim.cjs`). De kinderen en de ouden houden voorlopig hun gewone kleren.

## De mensen naar Marcels voorbeelden (10 okt 2026, werklijst vraag 150)

Marcel: "We moeten de mensen zoizo een beetje upgraden, want zien er niet geweldig uit", en bij vier voorbeelden (in
`ontwerp/voorbeelden/`, `mensen-*.jpg`): "De plaatjes demonstreren een verscheidenheid aan mensen. Het is niet perse de
stijl. Ik wil wel vasthouden aan de pixel art. Maar ik heb meer afwisseling nodig." Wat de voorbeelden laten zien, en
wat onze mensen nu hebben:
- **lichaamsbouw:** groot en klein, dik en dun, krom en recht, breed en smal (vooral de schurken); bij ons heeft iedereen
  hetzelfde lijf;
- **een silhouet uit lagen:** een mantel met een kap, een schoudermanteltje, een overkleed over een onderkleed, een lange
  jas, een pij; bij ons een kiel met een broek, of een jurk met een schort;
- **het hoofd:** een witte linnen kap, een kaproen, een vilthoed, een muts, een kale kop; bij ons al een deel;
- **spullen en riemen:** een tas aan de riem, een riem schuin over de borst, een mes, een boek in de hand, laarzen met een
  omslag; bij ons een riem met buidel en mes, een tas;
- **kleur:** elke figuur een eigen combinatie, met contrast tussen de lagen (een groene jurk over een bruin onderkleed,
  een bruine mantel erover); bij ons liggen kiel en broek dicht bij elkaar, en is alles gedempt;
- **verhoudingen:** de boogschutter, de schurken en de vrouw zijn slanker, met langere benen en een kleiner hoofd (zo'n
  zes à zeven hoofden); het spritevel is gedrongen (drie). De onze zijn er zo'n vijf.
Wat Claude zag bij drie hoofden die Marcel omcirkelde ("Deze zien er niet uit"): de camera kijkt van boven, dus je ziet
vooral de kruin; zonder nek zakt het hoofd in de kraag, en het gezicht kijkt naar de grond. Een tekenaar draait het gezicht
daarom wat naar de camera: proefplaat 1 deed dat met een nek en het gezicht 15 graden omhoog, met de lagen uit de
voorbeelden (teruggedraaid, zie onder).
Afwisseling kost geen vellen erbij: elk van de 24 uiterlijken krijgt zijn eigen bouw, lagen, hoofd en spullen.
Marcel bij proefplaat 1: "ik vind de poppetjes gewoon niet echt mooi zoals ze nu zijn", en daarna met twee voorbeelden in
low-poly (`mensen-lowpoly-*.jpg`): "deze verhoudingen zijn mooi. Maar laten we A eens proberen" (een nieuw lijf in code,
geen tekenaar). Wat die twee mooi maakt: vlakken in plaats van klei (elk vlak één kleur, scherpe overgangen), kleurvlakken
per kledingstuk met randen en manchetten, en een gezicht dat iets zegt; gedrongen zijn ze net als de onze. Wat wel
kost: de werkfiguren (`werkfiguren.cjs`) lenen het hoofd en de kiel, maar hebben hun eigen lijf; een andere bouw moet daar
ook in, anders verandert iemand van postuur als hij gaat maaien.
Daarna, bij Marcels voorbeelden in pixel art (`mensen-pixel-*`, `mensen-soldaat-48.png`, `mensen-kap-64.png`): het ligt
niet aan de maat (zijn strijder verkleind tot onze 73 pixels ziet er nog goed uit), maar aan het tekenen; een poppetje
moet gezet worden, niet uit een 3D-model gerekend, en met de hand haalde Claude dat niveau niet. **Geparkeerd** (Marcel,
10 okt: "ok we houden het even bij de kleding voor onze poppetjes. de rest kan weg"): de code is teruggedraaid; als de
mensen ooit getekend worden, door een tekenaar of met een AI-gereedschap, zijn dit de voorbeelden: 48 pixels hoog, in het
spel anderhalf keer vergroot (op zoom 2 drie schermpixels per pixel), een zwarte rand, licht van linksboven, drie à vier
tinten per kleur.

## Het vee: een koe en een schaap (Marcel, 25 sep 2026)

Voor de weides met vee (`spel.md`, "Weides met koeien en schapen"). Marcel koos: eerst de dieren
tekenen, dan de regels. Een koe en een schaap, net als de dorpelingen uit acht richtingen, met:
- **grazen**, de kop omlaag, en het meeste van de tijd;
- **staan**, kauwend, met de staart en de oren;
- **lopen**;
- **liggen**.

Middeleeuws vee was klein. Niet elk dier is hetzelfde ("Niets is gelijk"): een paar kleuren per
soort, zodat een kudde leeft.

**Gemaakt (25 sep 2026)** in `gereedschap/pixelart/vee.cjs`, op het tuig van de wolf; de
proefplaat is `uit/vee-proef.png`.

| | kleuren | maat |
|---|---|---|
| koe | roodbruin (`koe0`), zwart (`koe1`), zwartbont met witte sokken en een bles (`koe2`) | zo'n 1,05 m in de schoft, met haar rug ter hoogte van de borst van een boer; bijna twee tegels lang; een bredere cel (128×108) |
| schaap | vuilwit met modder (`schaap0`), bruin (`schaap1`), vuilwit met een zwarte kop en zwarte poten (`schaap2`) | tot de knie of dij van een boer |

- **Vier houdingen, elk een lus van acht beelden.** Grazen, met de kop tot op het gras en twee
  rukken aan een pluk. Staan, herkauwend, met een zwiepende staart en een oor dat draait. Lopen,
  in een stapgang van vier tellen: de koe 0,9 tegel per seconde, het schaap 1,1. Liggen, op de
  borst en een beetje op één zij.
- **Welke rust een stil dier kiest,** komt uit zijn zaad en de tijd, zonder toeval per beeld
  (`T.rustVanDier`, `js/vee.js`). Gemiddeld graast een koe 60% van de tijd, staat ze 25% en ligt ze
  15%; het schaap graast meer. Nooit ligt de hele kudde tegelijk, en dieren slaan niet op
  hetzelfde moment om.

## Het wild: een edelhert (7 okt 2026)

Voor de beesten in het bos (`werklijst.md`, vraag 116, stap 1: herten die in kleine groepjes aan de bosrand grazen en
wegrennen als iemand dichtbij komt; Marcel, 7 okt: "de herten al in stap 1"). Een edelhert, net als de koe en het schaap uit
code en op hetzelfde tuig (dat van de wolf): `gereedschap/pixelart/wild.cjs`, gerenderd door `wild-anim.cjs`; het wilde zwijn
en de beer komen er later bij. De proefplaat is `uit/wild-proef.png`, met de drie herten naast de boer op ware grootte.

Slank, met lange dunne poten (35 van de 58 eenheden in de schoft is been), een lange hals, grote oren, een korte staart in een
lichte spiegel, en een lichte buik en lichte binnenkant van de poten. Middeleeuws vee is klein, maar wild niet: met de kop omhoog
komt een hinde bijna tot de hoed van een boer (82 eenheden), en een hert met zijn gewei erboven.

| | kleuren | maat in de schoft |
|---|---|---|
| hert0 | roodbruine hinde, een gele spiegel | 52 eenheden (1,08 m) |
| hert1 | grijsbruine hinde, een bijna witte spiegel | 51 eenheden (1,06 m) |
| hert2 | hert met gewei: bruin, een donkere hals met manen, zes punten per kant (ogentak, ijsvogeltak, middentak en een kroon van drie) | 58 eenheden (1,2 m) |

- **Vijf houdingen, elk een lus van acht beelden.** Grazen (5 fps): de kop tot op het gras, een ruk aan een pluk, een oor dat
  flikkert, en eens per rondje de kop omhoog om rond te kijken. Staan (5 fps), alert: de kop omhoog en heen en weer, de oren
  draaien om de beurt, de staart tikt en een voorhoef komt even omhoog. Lopen (8 fps): stapvoets, 1,0 tegel per seconde, een
  pas is 0,5 tegel. Rennen (12 fps): in sprongen, 4,0 tegel per seconde, een pas is 1,333 tegel: eerst komen de achterpoten
  neer en duwen af, dan de voorpoten, en twee keer per rondje zweeft het dier met alle vier de poten van de grond; de oren
  liggen plat en de staart staat omhoog, met de spiegel wijd open. Liggen (4 fps): op de borst, de kop omhoog, herkauwend,
  met een oor dat draait.
- **De snelheden** staan bovenaan `wild.cjs` (`SNELHEID.hert`: lopen 1,0, rennen 4,0). Het spel moet ze overnemen, anders
  glijden de voeten: lopen en rennen hebben in `beelden/beschrijving.json` elk hun `snelheid` en hun `stap` (tegels per pas, een
  half rondje; `js/sprites.js` rekent `cyclus = 2 × stap`), en een voet op de grond schuift per beeld precies zo ver terug als
  het spel het dier vooruit schuift (nagerekend op de botten, ook voor het rennen).
- **De cel** is 160×148 met het anker op (80, 118): gemeten (`node wild-anim.cjs --meet hert2`) reikt het hert met gewei 111
  pixels boven de grond, 71 opzij (grazend, met het gewei naar voren) en 22 eronder. `naar-spel.cjs` krimpt hem per houding;
  dat is samen zo'n 40 MB aan plaatjes in de browser als alle drie de vellen geladen zijn (het hert met gewei 17).

Nog ruw: het rennen is een gestileerde sprong van acht beelden en geen echte galop; de hoef heeft geen spleet; het hert heeft
één vacht (geen zomer- en winterkleed) en één gewei (geen kaal gewei of fluweel); en de oren kunnen naar voren en achteren
draaien, maar niet apart opzij.

## De ossenkar en het kamp van het lege begin (11 okt 2026, werklijst vraag 152)

Voor het lege begin (`werklijst.md`, vraag 152, stap 1: je begint op een lege plek met een kar met wat spullen en een paar
gezinnen; Marcel, 11 okt: "Huifkar wordt ossenkar", en "Tent en afdak"). Alleen de kunst; wat het spel ermee doet, is 1b en 1c
van dat punt. Twee bestanden in `gereedschap/pixelart/`, elk met een proefplaat in `uit/`.

- **De ossenkar** (`ossenkar.cjs`, `uit/ossenkar-proef.png` en de rijdende huifkar `uit/ossenkar-rijden.png`): een kar op twee
  hoge wielen (een meter, acht spaken, een ijzeren band), een bak van 1,8 bij 0,9 meter van planken tussen rongen, en
  disselbomen tot het juk van een os. Hij komt aan als **huifkar**: een zeil van vergeeld linnen over vijf bogen, met lappen
  van ander goed erop, aan de uiteinden samengetrokken, en achter een opening waar een zak, een kist en een deken uit kijken;
  achteraan hangen een ketel en een emmer. Is het huis van de schout er, dan gaat het zeil eraf en is het de **ossenkar**,
  met spullen, stammen, stenen, zakken of leeg (`LADINGEN`).
- **De os** is de koe uit `vee.cjs` met `os` en `juk`: op ware maat (`SCHAAL.os` 1,0; een koe staat op 0,9), zonder uier,
  met een spierbult op de schoft, een dikke hals en lange horens, en een juk van essenhout op de hals met een pen aan elke
  kant en een riem onder de keel. Twee kleuren (`OS_KLEUREN`): vaal, licht grijsbeige met een donkere voorhand, en
  roodbruin, donkerder dan de koe. De gewone koe en het schaap zijn er pixel voor pixel hetzelfde door gebleven.
- **Rijden zonder glijden:** de kar rijdt in het tempo van de os (0,9 tegel per seconde, `SNELHEID.os`), en zijn wiel is zo
  groot gemaakt dat het in een rondje van de os (acht beelden) precies een kwartslag draait, twee spaken ver: de omtrek is
  vier keer de weg van een rondje (`WIEL`). Zo sluit de lus en rolt het wiel over de grond.
- **Twee houdingen**, elk een lus van acht beelden, in de acht richtingen: staan (de os herkauwt en zwiept met zijn staart)
  en rijden. Het anker ligt halverwege de achterkant van de kar en de snuit van de os; de cel is 216×156 met het anker op
  (108, 116), gemeten over alle richtingen (de kar met os is vier tegels lang).
- **Het kamp** (`kamp.cjs`, `uit/kamp-proef.png`, het vuur bewegend in `uit/kampvuur.png`, en met `--plein` het kamp met de
  huifkar zoals het op het plein kan staan, `uit/kamp-plein.png`): een **tent** van hetzelfde linnen als het zeil (of van
  bruin wol, `bruin`), een nokentent op twee palen met de flappen opzij gebonden, scheerlijnen en haringen; een **afdak**
  van takken op twee gaffels, met vier huiden op het dak (een koe, een geit, een schaap en een rund, elk met pootjes en
  een rafelige rand), de zijkanten dicht met een huid (van voren zie je het steile dak bijna op de kant), en stro en een
  deken eronder; en het **kampvuur**: de vuurkuil van de kolenbrander (`bosgebied.cjs`) met zes vlammen die op en neer gaan
  (acht beelden, 10 per seconde) en een driepoot met een ketel aan een ketting, in drie standen: het brandt, het smeult, of
  het is uit. De tent en het afdak hebben een open kant en komen elk in vier richtingen (de opening naar ZO, ZW, NW of NO,
  langs de tegels, zoals een deur); het vuur is één tekening. Het licht en de vonken komen uit de code, zoals bij de brand.

Marcel koos de vale os (11 okt: "Vaal"): je ziet je kar meteen tussen de bruine koeien. De roodbruine blijft in
`OS_KLEUREN`, voor een tweede kar later.

**De vellen in het spel** (11 okt; Marcel: "Vellen voor het spel"): drie figuren in `beelden/figuren/`, elk met de vale os,
in staan en lopen (lopen is de kar die rijdt, zoals het spel het noemt als iets onderweg is, met `snelheid` 0,9 en `stap`
0,45): `huifkar`, `ossenkar-leeg` en `ossenkar-hout` (`ossenkar-anim.cjs`, dan `naar-spel.cjs --alleen
huifkar,ossenkar-leeg,ossenkar-hout`); de andere ladingen komen als het spel ze vraagt. En het kamp als los vel
(`naar-spel.cjs --alleen kamp`): `beelden/kamp.png`, een rij per soort (`tent`, `tent-bruin`, `afdak`) en een kolom per
richting van de opening, en `beelden/kampvuur.png`, acht beelden van het brandende vuur en dan een cel voor smeulen en uit;
de beschrijving staat onder `kamp`. Het spel tekent ze nog niet: dat is 1b en 1c van vraag 152 (een `T.sprites` erbij, zoals
`S.kraam` voor de markt). `test/ossenkar.test.cjs` kijkt na dat het wiel rolt zonder te glijden en dat de vellen kloppen.

**De tent van een roverskamp** (17 okt, werklijst vraag 170, stap 6a2, c1; Marcel: "T1", op de proefplaat met de bruggen):
de nokentent van het kamp, in grijsgroen en vuil doek (een eigen ramp, `grijsgroen`, achteraan in de tabellen van
`kern.cjs`), met roet bij de nok, twee lappen gestolen goed (een rode en een blauwe) en rafels aan de flappen
(`kamp.cjs`, `tent({ rover: true, zaad: 5 })`). In het vel is hij de rij `tent-rover`, tussen `tent-bruin` en `afdak`;
het vuur is dat van het lege begin. `js/rovers.js` zet hem neer met zijn opening naar het vuur.

## De stapels bij de deuren (14 okt 2026, werklijst C, stap 1)

Wat een gebouw maakte en de ossenkar nog moet halen, ligt naast zijn deur (`js/kar.js`, `T.stapelsOp`).
`gereedschap/pixelart/stapels.cjs` (de proefplaat `uit/stapels-proef.png`, naast een boer), en `naar-spel.cjs --alleen
stapels` zet `beelden/stapels.png`: een rij per waar (stap 1: `hout`) en een kolom per maat (`klein`, `half`, `vol`), één
richting, want een stapel draait niet mee; cel 80×60, anker (40, 44). Het hout is een hoop stammen met de gezaagde kop naar
de kijker (oker met jaarringen, de schors grijsbruin), op wat zaagsel en schors. Eerst een nette piramide; Marcel, 14 okt:
"mag de houtstapel iets minder 'perfect'": nu ligt elke stam een eind uit zijn rij, scheef en gekanteld, dikker of dunner,
korter of langer en naar één kant smaller, met bij half en vol een stam dwars bovenop en bij vol een op de grond ernaast
(`MATEN`, met een vaste reeks toeval per maat). Het spel kiest de maat naar hoe vol de stapel is (`S.stapel(wat, vol)`);
zonder kunst een blok hout, zo hoog als hij vol is.

**Stap 3** (14 okt; Marcel: "d ja"): een tweede rij, `steen`: een hoop ruw gehakte blokken met afgeronde hoeken, elk
gedraaid en gekanteld op een heuvel die naar het midden oploopt, op wat gruis (4, 8 en 17 blokken; `steenhoop`). De klei
en de kalk liggen op de steenhoop, de planken op de houthoop. De rest ligt in wat de markt al had (`beelden/marktmanden.png`):
de groente in de mand kool, de eieren in de lege mand, het brood in de krat brood, de wol, het laken en de huiden in de
krat wol, het vlees, de vis, het bier en de wijn in de ton, en het graan, het meel, het hooi en de rest in de zak; een,
twee of drie naast elkaar, naar hoe vol de stapel is (`S.stapelDelen` in `js/sprites.js`). En de ossenkar kreeg drie
ladingen erbij uit `LADINGEN` in `ossenkar.cjs`: `ossenkar-stenen`, `ossenkar-zakken` en `ossenkar-spullen`
(`ossenkar-anim.cjs`, dan `naar-spel.cjs --alleen ossenkar-stenen,ossenkar-zakken,ossenkar-spullen`).

## De lantaarn van de groepsleider (16 okt 2026, werklijst vraag 171, D2)

In woorden (Marcel koos de manier en wanneer: "M2, E1"; nog geen proefplaat): een lantaarn zoals een man te voet hem in
de veertiende eeuw droeg. Een vierkant kooitje van zwart ijzer, smaller dan hoog (zo'n 6 bij 9 pixels met het hengsel,
tegen 60 voor de man), met vier ruitjes van hoorn, melkig en warm oranjegeel als hij brandt; een spits ijzeren dakje met
een rij gaatjes, een ring bovenop en een hengsel; binnenin één vlammetje dat flakkert (twee beelden). Hij draagt hem aan
het hengsel, in de hand aan de kant van de kijker, langs het lijf op heuphoogte: lopend gaat hij met de hand mee en
schommelt hij een paar graden, staand hangt hij stil. De gloed op de grond doet het spel al (de lichtkaart, zoals bij de
bode); de tekening is het lantaarntje met een klein waasje eromheen.

- **M2:** een eigen laag over elk figuur (zoals het halsijzer van de schandpaal, en de ogen van de wolf: een plek per
  beeld), niet een vel per uiterlijk zoals de zager: één klein vel, voor elk figuur, elk uiterlijk en alle kleren. De
  arm zelf verandert niet.
- **E1:** alleen in beeld als hij brandt (buiten in het donker, `T.draagtLicht` in `js/zien.js`); overdag niet.
- **De proefplaat** (16 okt; `node gereedschap/pixelart/lantaarn.cjs`, `uit/lantaarn-proef.png`): het kooitje een
  kwartslag gedraaid (een ruit recht, de volgende schuin), met dunne stijlen, zodat het hoorn het meest te zien is: zo'n
  6 bij 11 pixels; de hand komt uit het model, en welke hand per richting vast is (de dichtste in het eerste beeld van
  staan, recht van voren en van achteren de rechter), zodat hij bij het lopen niet van hand wisselt. Op de boer, de
  boerin en de jongen, 's nachts. **Marcel: "goed zo voor nu".**
- **In het spel** (Marcel, 16 okt: "A1, B1"): **A1** wie een hand in de zij heeft (boer 5 en 23, boerin 3), draagt hem
  aan die hand, op de heup (drie van de 72 volwassen uiterlijken, en op 6 bij 11 pixels zie je het nauwelijks); **B1**
  lopend schommelt hij in drie standen die vooraf gerenderd zijn (de onderkant naar links, recht, naar rechts; 9 graden),
  want een pixeltekening draaien in het spel rafelt de randen. Hij draait om de kijkrichting, zodat zijn vlakken even ver
  naar de camera kijken en het hoorn schuin net zo gloeit als recht (om een liggende as werd het een zigzag). Hij zwaait
  mee met de arm, een beeld later, zoals een lantaarn die doorzwaait: is de hand op het scherm naar rechts uitgezwaaid,
  dan hangt de onderkant daarna naar rechts. Recht van voren of van achteren gaat de hand vooral op en neer, en hangt hij
  recht.
- **Hoe het spel hem tekent** (`js/tekenen.js`, `tekenLantaarn`): direct na zijn figuur, zodat een dak of een boom
  ervoor hem met zijn drager bedekt. Eerst stond hij ná de nacht, zoals de ogen van de wolf: dan zweefde hij boven een dak
  als zijn drager erachter liep. Maar in de diepte valt de nacht erover, en dan gloeit het hoorn niet. Daarom gaat het
  zoals bij de ramen: het vel heeft een tweede laag met alleen wat gloeit (het hoorn en de vlam), daarmee gaat er een gat
  in het doek, daar valt de nacht niet in, en na de nacht komt dezelfde laag erin terug.

## Het woordmerk: gebroken goud (16 okt 2026, werklijst vraag 172, 7)

Marcel, 16 okt: het woordmerk "Pixel art uit code", en voor de richting **"Gebroken goud"**. In woorden, vooraf:
*TITHEBREAKER* in eigen kapitalen van pixels, geen letter van de computer, zo'n 20 hoog en op 3×; het goud van de heer
(oker, licht van linksboven, een donkere rand, zoals alles uit de renderer); en het woord is zelf gebroken: tussen TITHE
en BREAKER een barst, BREAKER zakt en kantelt iets, met splinters goud.

**Hoe het gemaakt wordt** (`gereedschap/pixelart/woordmerk.cjs`): elke letter uit balken en schuine streken op een raster
van 16 hoog, met een staande streek van 3 en schreven van een pixel, zodat ze even dik en even hoog zijn. Het licht: de
linker- en bovenrand glanst (`#fbe8a3`), de rechter- en onderrand ligt in de schaduw (`#6e3a16`), en de letter loopt van
licht boven naar donker onder (`#e5b94c`, `#c98d2c`, `#a5641d`), met hier en daar een putje, als gegoten en gesleten; een
rand van een pixel in `#24120a` en een halve schaduw rechtsonder. De breuk: E en B raken elkaar, een gekartelde barst loopt
erdoor (de rand maakt er een donkere lijn van), BREAKER schuift twee pixels op en zakt twee (B, R, E) en drie (A, K, E, R)
pixels, en drie kruimels goud vallen onder de breuk weg. 179 bij 27 pixels.

**De proefplaat** (16 okt): het titelscherm op 1920 bij 1080, met het woordmerk op 3× in plaats van de letter. Wacht op
Marcel. Daarna: `node gereedschap/pixelart/woordmerk.cjs --spel` schrijft `beelden/woordmerk.png`, en het titelscherm
toont het op 3× (op een smal scherm 2×), op ware pixels.

## De bruggen: oud, drie tegels breed, van steen en van hout (17 okt 2026, werklijst vraag 170, stap 6a2)

Marcel, 17 okt: "bruggen moeten ook oud zijn, en we hebben nieuwe stenen bruggen nodig, met boogje etc", en op de vragen
"Wat bij de plek past" en **S1** (een brug heeft echte hoogte: een stuk per tegel in twee lagen, zoals het graan, en wie
erop loopt, gaat mee omhoog). Op de eerste proefplaat: "Ook hout mag met boogje, afwisselend. Gewoon mooie bruggen. Dit
ziet er te slap uit. Bruggen moeten breder. Er moeten ook soldaten pelotons overheen. Niemand bouwt een brug voor 1
persoon." Op de tweede: **"Goed zo, zet ze in het spel"**.

- **Drie soorten, allemaal drie tegels breed** (zo breed als de weg; `gereedschap/pixelart/bruggen.cjs`). *De stenen
  boogbrug* van veldsteen, zandsteen of baksteen: bogen van twee tegels (bij een oneven lengte in het midden één van
  drie, over één tegel een klein boogje), pijlers met een spitse kop naar de kijker, een lijst onder een stevige
  borstwering met een dekzerk, een bol wegdek van kinderkopjes, en een landhoofd op elke oever waar de weg op klimt. *De
  houten jukbrug* (een lange oversteek): een plankdek op langsliggers, jukken van vier palen met een kesp, een leuning met
  een middenregel. *De houten boogbrug* (een korte, tot zes tegels): een gebogen dek op twee boogribben met stijltjes, een
  leuning met andreaskruisen. Oud: mos en varens in de voegen, korstmos, waterstrepen, een steen die eruit is, een natte
  rand, klimop op een landhoofd; grijs hout, hier en daar nog bruin, mos aan de voet van de palen.
- **Waar welke** (`js/eiland.js`, `brugSoort`): steen bij de stad (baksteen) en het kasteel, bij rotsen en op de heide, en
  over een brede oversteek; hout in het woud, het veen en het broek, en over een smalle, om de andere een boogbrug. De
  steen is die van het land: zandsteen bij de stijlen oker en roze, anders veldsteen.
- **De stenen in het spel** (Marcel, 17 okt, op de eerste beelden uit het spel: "de stenen van de brug nog niet goed
  genoeg", "deze zijn te fijn", "die rode lijken wel dakpannen", "de ramp op de grijze stenen is ook te verschillend met
  de rest"): het wegdek is van grote, ronde kinderkopjes (`wegdekPixel`: rijen van 8 pixels dwars op de brug, stenen van
  8 tot 13, met ronde hoeken en een bredere voeg waar vier stenen samenkomen), grijs op een brug van veldsteen en van
  baksteen (de baksteen zit alleen in de muren), zandkleurig op een brug van zandsteen; en het grijs is dat van de
  huizen, `veldsteenWarm` (`huis-sdf.cjs`), niet het koele `veldsteen` van `dorp.cjs`. Daarna (Marcel: "de stenen moeten
  echter. het lijken nu platte platen"): elke kinderkop is bol, met de kant naar het licht lichter en de andere donkerder,
  een glimlicht, korrel, af en toe een warmere steen, en zand of mos in de voegen. En "de knak in de brug mag er niet
  zijn", "moet natuurlijk overlopen": het wegdek loopt op een landhoofd in een S-bocht van de oever naar het dek, vlak aan
  beide uiteinden (`sBocht`, in acht vlakke plakken), en de houten boogbrug buigt als sin², zodat ook hij zonder knik op
  zijn landhoofd aansluit. Wie erop loopt, volgt dezelfde bocht (`dekOp`, `S.brugDek`). En "op een brug kan geen
  looppaadje ontstaan": het wegdek is overal even sleets (geen lichte strook in het midden), en in het spel slijt er op een
  brug geen paadje (`js/paden.js`). En "je moet altijd het materiaal waarvan de brug gemaakt is zien bij het pad": het
  wegdek is van de steen van de brug (`wegdekVan`): kinderkopjes van veldsteen, gehakte blokken zandsteen in rijen, en
  klinkers in visgraat op een brug van baksteen (een straat, geen dak), elk met een afgeschuinde rand.
- **In acht richtingen** (Marcel, 17 okt: "De bruggen moeten in 8 richtingen", "Zoals hoe de poppetjes lopen"; op de
  proefplaat `bruggen.cjs schuin`: "r2, zet maar in het spel"): een brug ligt ook schuin, haaks over het water: recht
  opzij (je ziet de bogen van de zijkant) of recht omhoog (je kijkt over de brug, met de pijlerkoppen aan beide kanten),
  vier rijen breed. Schuin heeft de stenen brug een boog per stap (√2 tegel). De tekening werkt in een raam per brug
  (`raam` in `bruggen.cjs`: langs, dwars en de stappen), zodat alle stukken in elke richting dezelfde blijven.
- **In het spel** (`bruggen-vel.cjs`, `beelden/bruggen.png`): stukken van één tegel in drie lagen, geknipt uit hele
  bruggen, zodat er geen naad op een tegelrand komt: het dek (met de zijkant en de bogen) als de grond van wie erop staat,
  zodat een ossenkar er niet in zakt (Marcel: "de ossenkar lijkt nog in de brug te zakken"), de borstwering aan de
  overkant vóór wie erop loopt, en die aan de kant van de kijker erna. In het spel ligt het water
  op het maaiveld, op de proefplaat 7 pixels lager; daarom ligt het dek in het spel 7 hoger (steen 33, hout 22 boven het
  maaiveld), zodat de bogen hun maat houden en de palen in zicht blijven. Een landhoofd loopt in één tegel op.
- **Op de heuvels** (vraag 174, stap b3, 17 okt; Marcel: "Toch B2: de brug op de oevers, met de pijlers in code
  verlengd"): een brug ligt vlak, op het gemiddelde van zijn twee oevers (nooit onder zijn water), en de grond van elk
  landhoofd en de tegel erachter ligt vlak op die hoogte. Boven het water ligt een stuk dan zoveel hoger, en zijn voeten
  lopen door tot het water: het vel zegt per stuk van het dek welke kolommen het water raken (`bruggen-vel.cjs`,
  `voetenVan`), en het spel trekt hun onderste rij steen of hout zoveel omlaag (`js/tekenen.js`, `tekenBrugStuk`). Geen
  render erbij. Gemeten op vijf eilanden: midden op een brug meestal 0 à 4 pixels, hooguit zo'n 9; met 20 pixels erbij
  (een proef) lopen de pijlers en de zijkant van een landhoofd als kolommen met de strepen van hun steen door
  (`gereedschap/pixelart/uit/schermen/brug-b3-proef-20px-hoger.png`, en zoals het is: `brug-b3-echt.png`).

## Zicht in een dicht dorp: de aanpak van Stronghold (17 okt 2026, werklijst vraag 176)

Marcels opdracht van 17 okt, in het kort. Het vervolg op "Wat je niet kunt zien, kun je niet spelen" (hierboven), nu de
speler zelf bouwt: compacte dorpen met huizen direct naast elkaar en smalle straten, waarin hoge gebouwen en grote daken
de gebouwen, wegen en inwoners erachter verbergen. De weg van de klassieke Stronghold-spellen: **het gewone beeld blijft
mooi, en er zijn eenvoudige, directe middelen om het verborgene te zien.** De camera hoeft niet vrij of 3D te worden.

- **Gebouwen plat** (Stronghold: spatie). Een weergave die je aan en uit zet, ook gewoon tijdens het spelen, niet alleen
  bij het bouwen: elk hoog gebouw wordt een lage tekening, met dezelfde voet en plek, zodat wegen, inwoners en wat
  erachter staat te zien zijn. Herkenbaar en aan te klikken. Liefst vooraf gerenderde tekeningen uit de huizenbouwer, niet
  de bestaande samengedrukt. Alleen beeld: geen spelregel verandert.
- **Het land lager** (Stronghold: V). Onderzoeken of heuvels gebouwen of inwoners verbergen; zo ja, een weergave waarin
  het land in beeld vlak is, met de echte hoogte en de regels zoals ze zijn, en alles op zijn eigen plek. Lage prioriteit
  zolang heuvels geen zichtprobleem zijn.
- **De camera draaien** (X en C). Vier vaste standen (0°, 90°, 180°, 270°), met de tekeningen die er al per kant zijn,
  hetzelfde punt in het midden, en de muis, de grond, de gebouwen, de mensen en de schaduwen die blijven kloppen; de
  stand van nu blijft de standaard. Een extra, geen oplossing voor slecht zicht in de gewone stand. Later, niet nu (de
  cameraproef van 17 okt: `gereedschap/cameraproef/evaluatie.md`).
- **Zoomen** (Z). Een prettig overzicht waarin een groter dorp leesbaar blijft, met scherpe pixel art zonder flikkeren
  of verlies van wat belangrijk is; eventueel apart gerenderde of voorgefilterde tekeningen voor ver uitgezoomd; geen
  gebouwen die verspringen; kiezen en plaatsen betrouwbaar op elke zoom. **Hoge prioriteit.**
- **Vrij bouwen blijft** (een eigen toepassing voor Aardschok). Compact bouwen mag zolang de bouwregels het toestaan,
  niet verboden omdat gebouwen elkaar in beeld overlappen. Bij het plaatsen: de hele voet, de ingang en de aansluiting op
  de weg in beeld, de bestaande gebouwen even plat als dat helpt, en geen gebouw per ongeluk op de verkeerde tegel.
- **Wie verborgen staat, kiezen** (een eigen voorstel, geen sneltoets van Stronghold). Een inwoner achter een gebouw is
  nog te vinden en te kiezen: een zachte omtrek, een cirkel of een teken waar hij staat. Een gekozen gebouw blijft
  herkenbaar als er andere voor staan; eventueel worden de gebouwen ervoor even plat. Geen vaste grote tekens boven alle
  inwoners.
- **De volgorde in het beeld.** De gebouwen mogen rijk en sfeervol zijn, maar wat je voor het spel moet zien, gaat voor:
  de kunst blijft zo goed als ze is, wat gekozen is, is duidelijk, de tekens voor ingangen, bouwplaatsen en wat niet
  loopt zijn overal dezelfde, en versiering verbergt nooit wat je moet doen. Geen onnodige doorzichtigheid, felle randen
  of vaste lagen over het beeld.

De volgorde: (1) een proef naast elkaar, gewoon tegenover plat; (2) in een extreem dichte middeleeuwse straat; (3)
kijken of inwoners, wegen en gebouwen echt beter te zien zijn; (4) dan een schakelbare weergave in de renderer; (5) dan
de tekens bij het plaatsen en het kiezen van wie verborgen staat; (6) de zoom apart; (7) pas daarna draaien en het land
lager.

**De eerste opdracht: alleen een proef.** Hetzelfde dichte dorp, minstens 8 gebouwen, een paar bomen, wegen en
inwoners, uit dezelfde camera en zoom in drie varianten: **A** gewoon (elk gebouw met zijn dak en zijn eigen pixel art),
**B** alle gebouwen plat (laag en herkenbaar, zoals de functionele weergave van Stronghold), en **C** alleen plat wat
het zicht neemt op één gekozen inwoner of één gekozen gebouw. Met een vergelijkingsplaat en een korte technische
beoordeling, met de bestaande pixelartgenerator waar het kan. Het spel, de tekeningen en de regels veranderen niet: de
vraag is alleen of deze aanpak het zicht genoeg beter maakt om draaien minder nodig te maken.

**De proef** (17 okt; `gereedschap/zichtproef/`, met `evaluatie.md`): een straat van twee tegels met elf huizen
zonder ruimte ertussen, zes inwoners en zes bomen, door het spel zelf getekend. **De platte tekening** komt uit de
huizenbouwer (`plat.cjs`, gesneden zoals de bouwfasen): geen dak, geen ramen; de muren aan de kant van de camera (zuid en
oost op het scherm) tot de heup, met hun hout of steen en de deur, en die aan de achterkant vlak boven de grond, als een
doorsnede; een vloer en een randje op de muren in de kleur van het eigen dak (pannen oranje, leien grijs, spanen
bruin); dezelfde voet, maat en anker als het huis. Alle muren tot de heup was niet genoeg: dat dekte de rij tegels
erachter nog af. **De uitkomst:** gewoon is 1 van de 6 inwoners te zien, 8% van de straat en 1 van de 11 deuren; plat
alle 6, 83% en 10 van de 11. Alleen plat wat het zicht neemt op wie je kiest: voor een inwoner in de straat één huis,
voor een hut aan de overkant vier. Plat lost op wat draaien niet oploste (de cameraproef: de inwoner in een smalle
straat was in alle vier de standen weg). De keuzes voor een weergave in het spel staan onderaan `evaluatie.md`.

**Plat in het spel** (besloten 17 okt, werklijst vraag 176, stap 4): de muren als de doorsnede van de proef, de vloer in
de kleur van het dak met rijen zoals een dak (het dambord van de proef leest op spanen als een tegelvloer), de F zet
plat aan en uit, met een klein teken zolang het aan staat.

**Zo werkt het nu** (4b, 24 okt; Marcel: "A", met F): F zet de gebouwen plat en weer recht, ook tijdens het spelen; een
teken onder de bovenbalk zegt het zolang ze plat staan ("Buildings flat · F to raise them"), en de toetsen in het menu
noemen het. Plat tekent elk huis van de huizenbouwer (ook de zagerij en de kapel) zijn platte tekening, op zijn plek en
in zijn volgorde; er zijn dan geen ramen die branden, geen rook uit de schoorsteen, geen sneeuw op het dak en geen
doorkijk (er is niets meer achter te zien). Een bouwplaats is zijn fundering (de eerste fase), ook bij de werkplaatsen.
Wat brandt, blijft zoals het is: dat moet je zien. De werkplaatsen staan gewoon tot 4c. In een scène (de cinematic op
Sint-Maarten) staat alles recht, en het teken is weg. De platte tekeningen laden pas als je F voor het eerst indrukt; tot
een tekening er is, staat er het gewone huis. Het kiezen verandert niet: de muis kiest eerst een mens en dan pas wat op
de tegel staat, dus wie achter een huis staat, is ook gewoon te kiezen. Gemeten in de cloud (SwiftShader, het proefdorp,
1280×800, zoom 1): gewoon 4,9 à 6,3 ms per beeld, plat 4,8 à 5,3; de platte tekeningen van vijf huizen laden in 0,14 s.
In Firefox nog niet gemeten.

## De nieuwe stijl: de nabewerkte herberg als maat (17 okt 2026, werklijst vraag 177)

Marcel bracht twee plaatjes: de herberg uit onze huizenbouwer (`voorbeelden/herberg-stijl-origineel.png`, byte voor byte
`tegels/huizen/herberg1.png`) en dezelfde herberg met ChatGPT nabewerkt (`voorbeelden/herberg-stijl-doel.webp`), "de
norm die ik wil aan gaan houden". De vraag: een manier om alle huizen zo te krijgen zonder ze een voor een opnieuw te
tekenen, zonder een filter over het plaatje, met de gegevens die de tekenaar al heeft. De proef staat los
(`gereedschap/pixelart/stijlproef.cjs`); geen bestand van de bouwer en geen tekening van het spel is veranderd. De plaat:
`node gereedschap/pixelart/stijlproef.cjs` (vier minuten, zes draden), naar `uit/stijlproef/plaat.png`.

**Wat het verschil is, gemeten.** Het doel is anderhalf keer zo groot als ons huis; op de maat van het spel (0,66,
gemeten aan de schoorsteen en de breedte) heeft zijn riet bijna onze kleuren: dezelfde lichtheid (mediaan 0,52 tegen
0,54 in OKLab), dezelfde kleurkracht, een tint iets roder (66 tegen 71). Het verschil zit in de rust: de lichtheid
verschilt van pixel tot pixel 0,029 tegen onze 0,076, bijna drie keer zo rustig. Het doel legt zijn donker in de lijn
onder elke laag (ronde lichte punten, dan een smalle schaduw), wij strooien het over het hele dak in halmen van één
pixel. Verder: ramen blauw met de lucht erin in plaats van zwart; de plint ronde grijze stenen met donkere voegen in
plaats van lichte; het hout warmer; onder de dakrand minder zwart; een nok in bundels.

**De aanpak: drie lagen, op wat de tekenaar per pixel al weet.** De tekenaar (`tekenWereld` in `toren.cjs`) kent per
pixel het materiaal, de plek in de wereld, de normaal, de zon, de omgevingsschaduw en de diepte, en geeft na het tekenen
de vorm van het hele huis terug (het afstandsveld). Daar haakt de stijl aan, met de knop `stijl` in de opgave:
1. **Het materiaal** (de patronen): een nieuw patroon voor riet (bossen van twee pixels en zo'n acht lang, lagen een
   derde dichter en rechter, de onderrand van elke laag een rij ronde lichte punten met donkere spleten, eronder een
   smalle schaduw, en een laag die naar zijn punten toe lichter wordt), de nok (bundels met een binding, elke bundel
   bol), pleister (zachte vlekken in twee maten), hout (een nerf in lange strepen, warmer en wat lichter), veldsteen
   (kleiner, boller, met donkere voegen) en glas (blauw, bovenin licht, een schuine streep). Alles in de maten van de
   wereld, dus van vier kanten dezelfde textuur.
2. **Het licht:** een zachte schaduw van de zon uit het afstandsveld (de rand verloopt, zoals op de grond al), een
   lichtere diepste hoek (0,42 in plaats van 0,3), en een baan onder de dakrand die korter hard is en langer verloopt.
3. **De kleur:** elke ramp krijgt drie tussentinten per stap, langs dezelfde lijn door OKLab, zodat licht verloopt in
   plaats van in banden te springen, zonder dithering; en een tint per steen, per balk en per plek in het riet en het
   pleister (warmer of koeler, in halve stappen). Een omlijning houdt precies zijn oude tint. Het blijft pixel art: een
   vast palet per ramp, alleen fijner.

**Hoe het ingehaakt is.** De proef laadt `toren.cjs` en `huis-sdf.cjs` met negentien regels erbij, alleen in het geheugen
(`HAKEN` bovenaan de proef): elk is een `if (H.kn.stijl)` of `if (W.stijl)` voor een bestaand patroon of een getal.
Zonder de knop is een tekening byte voor byte de oude (de proef rendert de herberg ook oud, en vergelijkt hem met het
spel: gelijk). Die negentien regels zijn wat er later in de bouwer komt.

**De eerste proef** (de plaat, 17 okt): zes gebouwen oud en nieuw, de herberg naast het doel, en twee van vier kanten.
Gekozen op materiaal en dakvorm: de herberg (vakwerk, riet, een T), een hut (vlechtwerk en leem, riet), oker vakwerk onder
leien met een dakkapel, veldsteen onder pannen (een T), planken onder spanen met een galerij, en de kapel (baksteen en
kalk, een toren); van vier kanten de witte herberg en het stenen huis onder pannen.

**Wat de proef zegt, op Marcels vragen:**
- *Lijkt het op de herberg?* Het riet, de nok, de ramen, de plint en het hout wel: het riet van de nieuwe herberg meet
  0,038 (doel 0,029, oud 0,076), tint 67 (doel 66), dezelfde lichtheid, en het leest als lagen met punten. Niet: de
  lange schaduw van de schoorsteen over het dak (ons licht staat hoger), de stenen schoorsteen (de herberg heeft er een
  van leem, dat is de opgave), en wat het doel om het huis zet (uithangbord, tonnen, struiken, grond): dat zijn
  uitbouwen en tuinstukken (vraag 148), geen stijl. **Kanttekening bij die maat** (de sessie van huis1, 17 okt): het
  doel is voor het meten verkleind door te middelen, en dat maakt elk plaatje rustiger; op zijn eigen maat meet het
  0,031, maar daar is een "pixel" van het doel zo'n anderhalve pixel. Het tweede doel, huis1, meet 0,069, zo levendig
  als ons oude riet: de twee doelen zijn het over de rust van het riet niet eens (hieronder, "Het tweede doel").
- *Mooier dan het origineel?* Marcels oordeel. Wat Claude ziet: rustiger, warmer, de lagen en de stenen lezen beter;
  het risico is dat riet zonder ruis "glad" gaat ogen, daarom de spleten tussen de punten en de naden tussen de bossen.
- *Scherp genoeg voor een RTS?* De vorm, de omlijning en de silhouetten zijn dezelfde tekening; alleen binnenin is het
  rustiger. Te toetsen in het spel, uitgezoomd, als Marcel de richting goed vindt.
- *Vier kanten gelijk?* Ja voor alles van de stijl (in de maten van de wereld; het licht komt zoals altijd van
  linksboven). Wat nog per pixel op het scherm hangt, uit de oude code: de korrels van het mos, de stoppels aan de
  gevel, het warme glas.
- *Automatisch op alles?* Ja: de knop gaat door de bestaande weg (`naar-tiled.cjs`, `bouwfasen.cjs`, de brandfasen en
  de sneeuw), zonder werk per huis. In de eerste proef hadden **alleen riet, nok, pleister, hout, veldsteen en glas een
  eigen patroon**; de andere materialen kregen alleen het licht en de kleur, en dat zag je nauwelijks. Die ronde is erna
  gedaan (hieronder, "De andere materialen"); zandsteen en het vlechtwerk zelf hebben nog geen eigen patroon. De
  werkplaatsen in `tegels/gebouwen/` (29, uit `dorp.cjs`) gaan langs een andere tekenaar en vallen erbuiten.
- *Wat kost het?* Renderen even lang als nu (de herberg naast elkaar onder dezelfde last: 141 tegen 143 s; de zachte
  schaduw kost niets dat je meet), de kleurlaag 0,02 s per huis. Voor de hele verzameling dus wat het nu kost: de 1214
  tekeningen zo'n twee uur, de bouwfasen zes, de brandfasen zes en een half, op acht kernen (in een terminaltab met een
  ketenscript). Omdat de tekeningen veranderen, kan de huizencache niet hernoemd worden: alles opnieuw.

**Als Marcel ja zegt, de weg naar het spel:** (1) de negentien haken in de bouwer, achter de knop `stijl` in `inDeRonde`
(`huizen.cjs`); (2) de kleurlaag in `kern.cjs`, zo dat een `Plaat` blijft wat hij is: de fijne en getinte rampen als
eigen rampen aanmelden, zodat de bouwfasen, de brandfasen, de sneeuw en het inpakken niets merken; (3) de andere
materialen, een voor een op een proefplaat; (4) eventueel de stap en de tint per pixel in de cache, dan kost het
bijstellen van alleen de kleur seconden in plaats van uren; (5) de ronde van alle tekeningen.

**Marcel (17 okt), op de plaat:** "Yes, this is the direction. Do the other materials next, one by one on a proof plate:
slate, tiles, shingles, planks, brick and daub." Dus eerst (3), dan pas de haken in de bouwer. Voor die materialen is er
geen doel: de regels van de herberg gelden (rust binnen een element, het contrast in de voegen en de randen, een tint
per element, zacht licht), en elk krijgt een plaat oud en nieuw.

**De andere materialen (17 okt):** een plaat per materiaal, `node gereedschap/pixelart/stijlproef.cjs materialen`
(anderhalve minuut, naar `uit/stijlproef/materiaal-<naam>.png`): een stuk oud en nieuw, twee keer vergroot, en het hele
huis oud en nieuw op ware grootte. Zes haken erbij (negentien in alles), elk voor een bestaand patroon; de getallen in
`STIJL_INSTELLINGEN` (`lei`, `spaan`, `pan`, `plank`, `baksteen`, `leem`).
- **Leien** (`oker-huis2-leien-z`): elke lei een eigen toon en een koele tint, van blauw- tot paarsgrijs; aan de onderrand
  licht, naar boven donkerder waar de rij erboven eroverheen ligt; een smalle schaduwlijn onder elke rij, een naad
  links. Donkerder dan het oude lichte grijs (dat las als bestrating), en het leest nu als lei.
- **Pannen** (`wit-steen6-pannen-z`): de ronde pannen waren al in de geest van de herberg (rustig per pan, de schaduw
  onder de staart); erbij een tint per pan. Eerst gaf een koelere tint zalmroze pannen: bij terracotta varieert de toon,
  niet de kleur, dus de tint is klein en rond nul.
- **Spanen** (`planken-huis7-spanen-z`, het dak): eerst te vlekkerig (een mozaïek van grijs en bruin); nu rustig binnen
  een spaan, een smalle nerf langs de helling, en een kleine tint tussen vers en verweerd.
- **Planken** (hetzelfde huis, de muren): een rustige nerf in lange strepen in plaats van losse streepjes, elke plank
  een eigen toon en tint, een donkere kier en een lichte rand; de kwasten, de spijkers en een vervangen plank bleven.
- **Baksteen** (`wit-steen1-baksteen-z`): elke steen een eigen tint van rood tot oranje en een eigen toon, een schuine
  rand (licht boven en links, donker onder), de kalkvoeg licht maar onder een steen in zijn schaduw. Een kleine stap: de
  baksteen was al rustig.
- **Leem** (`wit-hut1-riet-z`, en de schoorsteen van leem op de herberg): zacht gevlekt in twee maten, warm of grauwer,
  lange vegen van de hand in plaats van streepjes en spikkels; de schoorsteen zwart van het roet in een verloop. Op de
  hut ligt vooral vlechtwerk bloot, dus het leem is er een klein stuk; het vlechtwerk zelf is nog het oude.

### Het tweede doel: huis1 (17 okt 2026)

Marcel bracht een tweede nabewerkte plaat (`voorbeelden/huis1-stijl-doel.webp`): `huis1` schoon en verweerd, links
"Origineel", rechts "Verbeterd". Zijn eerste vraag was of de verbeterde twee meteen tekeningen voor het spel konden
worden. **Nee, gemeten:** de plaat is een webp met verlies en zonder alfa, op zwart (onze tekening heeft 96 kleuren en
een harde alfa; de plaat 49.000 kleuren, en een rand die met het zwart gemengd is). Het huis is 0,96 zo breed en 0,89 zo
hoog. En ook het "Origineel" is opnieuw getekend: na de beste pas liggen de deur, de luifel, de schoorsteen en de nok 5
tot 13 pixels verkeerd, en zijn ze tot 13% groter of kleiner, elk anders (de nabewerking zelf schuift daarbovenop
gelijkmatig zo'n 3,5 pixel). Schoon en verweerd vallen ook niet samen: tot 8 pixels in het dak. Passend schalen of
vervormen kan dus niet zonder dat de planken en ramen krom worden. Marcel koos toen: "Neem de plaat als tweede doel voor
de stijlproef van vraag 177, naast de herberg, en maak eerst een proefplaat van huis1 en huis1-oud."

**De proefplaat:** `node gereedschap/pixelart/stijlproef-huis1.cjs` (een minuut, vier draden), naar
`uit/stijlproef/huis1/plaat.png`: huis1 schoon en verweerd, het spel, de stijl en het doel, en de voorgevel twee keer
vergroot. Het script neemt `render()` uit `stijlproef.cjs` en meet de vorm:
- **De vorm blijft.** De tekening is 478 bij 558, net als in het spel, en schoon en verweerd hebben in de nieuwe stijl
  precies hetzelfde silhouet (0 pixels verschil). Ten opzichte van het spel verschillen er 284 pixels, allemaal in de
  rafelrand van het riet, nooit verder dan één pixel. De muren, de deur, de ramen, de plint en de voet verschillen
  nergens. Moet het helemaal gelijk blijven, dan neemt de stijl het silhouet van de oude render over.
- **Het riet: het tweede doel vraagt het omgekeerde van de herberg.** Gemeten op het voorste dakvlak, in OKLab, zoals bij
  de herberg. Van pixel tot pixel: spel 0,071, nieuw 0,038, doel 0,069. Het doel is dus zo levendig als ons riet nu, niet
  zo rustig als de herberg (0,029). Het is ook lichter (mediaan 0,74 tegen 0,68 in de nieuwe stijl), heeft meer licht in
  de toppen (p90 0,86 tegen 0,72) en een kwart meer kleurkracht (0,121 tegen 0,097); de tint is gelijk (73 tegen 70). Het
  leest als dikke gouden lagen met lichte halmen erin, waar de nieuwe stijl vilt laat zien. Let op: de herberg is gemeten
  na verkleinen tot 0,66 door te middelen, en dat maakt elk plaatje rustiger; huis1 staat op 0,92.
- **Het verweren:** het doel houdt zijn riet goud (tint 77), met het mos fijn langs de onderrand van elke laag, rode
  plekken in de kalk en mos aan de voet van de plint. De nieuwe stijl maakt het riet groener (tint 84) en het mos grove
  vlekken, nog grover dan het spel nu. Dat mos komt uit het verweren in `huis-sdf.cjs`, niet uit de stijl.
- **Wat al klopt:** de plint van grijze ronde stenen met donkere voegen (die van het doel is wat lichter), de blauwe
  ramen, het zachte licht. Het hout van het doel is roder en voller (verzadiging 0,55 tegen 0,48), met een licht randje
  op elke balk.

**Marcel koos het riet van de herberg** (17 okt: "ik laat het dak van de herberg gebruiken"): het rustige riet in lagen
met lichte punten blijft zoals het in `stijlproef.cjs` staat; het levendige gouden riet van huis1 niet.

**Het mos op verweerd riet: het oude blijft (17 okt).** Marcel vroeg het mos fijner, "langs de onderrand van de lagen
zoals in het doel van huis1". De proef: een haak op `mosOpRiet` in `huis-sdf.cjs`, die het mos alleen op de rand van een
laag zette, per punt een rond plukje, in stukken met veel of weinig, lichter dan het oude. Op het voorste dakvlak van
huis1-oud werd 5,9% groen (het spel 13,4%, de stijl met het oude mos 12,3%, het doel 4,0%), als fijne, gebroken groene
randen langs de lagen. Marcel, op de plaat: "nee, het oude mos was beter". Dus blijft het mos van het verweren zoals
het is, in plukken over het dak, en is de haak er weer uit (`stijlproef.cjs` is weer zoals hij gecommit was). Niet
opnieuw proberen zonder Marcel.

## De heide (25 sep 2026)

Nieuwe grondsoort voor de meent, waar de schapen van het gehucht grazen (Marcel koos dit op 25 sep,
`spel.md`, "Marcel koos voor stap 2"). Gemaakt in `gereedschap/pixelart/randtegels.cjs`: de
grondsoort `heide` en de terreinset `Heide over gras` (`a: 'gras', b: 'heide'`), met de acht vlakke
varianten en de veertien hoekcombinaties × vier varianten, net als de vier bestaande paren.

**Heide het hele jaar door,** dus geen felle paarse bloei — augustus is maar één maand.
Eén eigen ramp (`heide` in `kern.cjs`-stijl, net als `modderwater` en `veldsteen` ervoor: een eigen
ramp toevoegen zonder `dorp.cjs` aan te raken), die zelf van donker olijfbruin naar gedempt
grijsgroen drift, zoals `gras` en `aarde` dat ook binnen één ramp doen. De klontjes van de struik
komen uit hetzelfde verspringende rooster als de grasplukjes (`plukOp`), maar kleiner en ronder
(`heideBolOp`/`HEIDE_BOL`): heide is een bos twijgjes, geen los blad. Een deel van de lichte koppen
valt in de `mos`-ramp (grijsgroen tussen het bruin door) en heel af en toe in de `steen`-ramp
(gedempt paarsgrijs — die ramp trekt toch al naar paars, en hier is dat voor het eerst precies de
bedoeling). Verspreid ook een enkele kale plek wit-geel zand of een schapenpaadje, met de lichte
stappen van de bestaande `zand`-ramp.

**Twee dingen die niet werkten, voor wie hieraan verder bouwt:**
- Een harde grens tussen twee ramen (bruin/groen) voor de grove kleurzones gaf grote, hard
  omlijnde vlekken — precies het "flikkeren op een groot vlak" dat juist niet mocht. De oplossing:
  de kleurdrift IN de ramp laten zitten, en groen/paars alleen als klein accent op een klontkop.
- Een lagere ruisfrequentie dan `grasToon` (of meer dan drie stappen) liet de ruis zelf als lange
  diagonale strepen zien: het isometrische aanzicht trekt de rasterrichting van `ruis2` recht bij
  weinig octaven. Op precies het ritme van `grasToon` (dezelfde twee schalen, dezelfde drie
  stappen) verdween dat. Wie hier een volgende grondsoort op bouwt, begint dus bij die frequentie.

**Bewijs dat er niets verschoof:** de eerste 262 tegels van `rand.tsx`/`rand.png` (alles van vóór
25 sep) zijn met een apart controlescript vergeleken op naam, groep, vast-waarde én op pixel, en
zijn onveranderd; de vier bestaande terreinsets houden dezelfde tegel-ids en wangids. "Heide over
gras" telt 72 tegels (8 gras-vlak, gedeeld met de bestaande terreinsets + 8 heide-vlak + 56
hoektegels); de 64 nieuwe daarvan staan pas achteraan, vanaf id 262, ruim binnen de
`RAND_CAPACITEIT` van 600 in `naar-tiled.cjs`.

**Op speelschaal (Claude, later op 25 sep):** op de kaart liet elke tegel een lichte ruit zien, en
daarna een dambord van lichte en donkere tegels. Twee oorzaken, allebei in `heideToon`: de
roosterpunten van `ruis2` (waarde-ruis op hele getallen) lagen op 1,05 vrijwel op de hoeken van de
tegels, en een grove toonvlek zo groot als een tegel houdt op aan zijn rand, want elke tegel is uit
een andere plek van de ruis gesneden. Nu is de ruis 37 graden gedraaid (`heideRuis`), op schalen die
niet op de tegels passen, en doet de fijne ruis het werk; de grove geeft alleen een zweem. De
zandplekjes zijn zeldzamer. Het leest nu als lage, gevlekte heide. Wie een volgende grondsoort
maakt: begin niet bij een lage frequentie, en houd het rooster van de ruis los van dat van de
tegels.

**Nog ruw:**
- Het blijft aan de rustige kant — vooral van dichtbij (zie `uit/heide-proef.png`) oogt het wat
  uniform, met weinig echt uitgesproken paarse of groene plukken. Dat was bewust: de eerdere,
  drukkere versies flikkerden over een groot vlak. Een tussenweg (iets meer, iets grotere
  plukken) is nog niet geprobeerd.
- Geen apart element voor een schapenpaadje als LIJN (een echt platgelopen spoor); de zandplekjes
  van nu zijn los en willekeurig, niet een pad dat ergens heen loopt zoals de karrensporen op het
  zandpad.
- Nog niet op een echte kaart gelegd of in het spel bekeken op speelschaal (alleen als losse
  proefplaat) — dat komt zodra de heide bij het gehucht getekend wordt.

## De grond van het eiland: de zee, het strand, het veen en het broek (8 okt 2026, werklijst vraag 117, B van 2a)

Vier nieuwe grondsoorten voor het eiland (Marcel, 8 okt: "dan gaan we de eigen tegels maken", en "A. Ja, lijkt mij
goed"), gemaakt zoals de heide in `gereedschap/pixelart/randtegels.cjs`, elk met een eigen ramp en acht vlakke
varianten, en vijf overgangen van veertien hoeken in vier vormen: strand aan zee, gras over strand, heide over strand,
veen over gras en broek over gras (en water in zee, voor waar een rivier de zee in loopt). Ze staan op een eigen vel,
`tegels/kust.png` (`node randtegels.cjs kust`, dan `naar-tiled.cjs kust`), zodat geen tegel van `rand.png` verschuift.
De proefplaat: `node gereedschap/pixelart/kusttegels-proef.cjs` (in `uit/kust/`).

- **De zee** is blauwer en kouder dan het modderige water in het dorp (Marcel: "Ja hoor, geen probleem"), maar gedempt:
  grijsblauw van diep tot het schuim. Ondiep aan het strand schemert de zandbodem door, op de waterlijn ligt gebroken
  schuim, en daarachter de branding: drie gebroken lijnen die de kust volgen, verder van het strand flauwer. Midden in
  de zee is het overal even diep, dus rustig.
- **Het strand** (ook de duinen en het stuifzand): licht, droog zand uit de zand-ramp (lichter en geler dan het zandpad),
  fijn gekorreld, met hier en daar een schelpje; naar de zee toe nat en donkerder; ver van het water een pol helm.
- **Het veen**: donkerbruin en nat, met pollen pijpenstrootje en hier en daar een plas.
- **Het broek**: nat gras, donkerder en blauwer dan het gras van het dorp, met biezen in pollen en een plas.

**Wat niet goed was op de eerste plaat** (Marcel: "voer gelijk verbeteringen door voor de punten die je zelf nog niet
goed vind"): te veel witte spikkels (glinsteringen en goud in het zand), een natte strook die je niet zag, vlekkerig
zand, plassen die te licht waren, een te donker broek, en op de vlakke zee een rooster van witte spikkels (de ruis van de
kustlijn liep door in het vlak; nu dooft hij uit van de kust af). De branding werd breder, en de heide op het zand staat
in pollen, niet als vlak.

**In het spel** (Marcel: "Ja, ziet er goed uit zo"): de maker legt ze op het eiland (`kaarten.md`, "Het eiland"); waar
niets past, wijkt de zwakke grond voor strand (naast de zee) of gras. Golven die bewegen, komen later.

## De heer rijdt weg, of zijn leger komt (18 okt 2026, werklijst E, stap 4: C2)

Voor de twee cinematics aan het eind van de demo (Marcel, 18 okt: "een korte cinematic waarin je het leger van de heer
ziet aankomen met death als gevolg", en bij betalen "de heer en zijn mannen met karren goederen en goud ziet wegrijden";
C2: met nieuwe tekeningen). **In woorden, wacht op Marcel**; daarna één proefplaat. Alles in de kleuren van zijn huis,
rood en geel, en in de stijl van de heer en zijn soldaten (`heer.cjs`, hierboven): hij is de grap, zijn mannen niet.

- **De heer te paard.** Het paard is te groot voor hem en te mooi: een appelgrijze schimmel, hoog en slank (een nieuw dier,
  op de maat van de os, met lange benen, een gebogen hals, manen en een staart die met de wind meegaat), onder een kleed
  tot op de knieën in rood en geel, in vlakken, met franje. De heer zit er rond en klein op, zijn korte beentjes steken
  opzij zonder de stijgbeugels te halen, en zijn hoed met veren wipt bij elke pas. Stappen in acht richtingen, een lus van
  acht beelden, zoals de os; en staan. Het paard loopt in de pas van een man.
- **De wagens van de heer.** De ossenkar (`ossenkar.cjs`) met een os ervoor, maar met de bak in zijn kleuren: de planken
  rood geverfd met een gele bies, en voorop een stok met een geel-rood vaantje met zwaluwstaart, dat met de wind wappert. Een
  nieuwe lading, **buit**: zakken graan tot boven de rand, een ton, een bos stammen, en bovenop een kist met ijzeren
  banden en het deksel open, waarin het goud blinkt (twee beelden: het blinken verspringt). Twee wagens, en een soldaat
  loopt naast elke os.
- **Het vaandel.** Een soldaat (de soldaat van de heer, 70 px) met een vaandel aan een lange stok in plaats van zijn
  hellebaard: een rechthoekig doek, half rood, half geel, met zijn wapen, **zijn eigen hoed** in goud, met de veren. Het
  doek waait met de ene wind (hierboven, "Eén wind door alles heen"), drie standen.
- **De fakkels.** De soldaat met in zijn andere hand een fakkel: een stok met een kop van pek en een vlam die flakkert
  (drie beelden), als laag over het figuur, zoals de lantaarn van de groepsleider. Het licht op de grond doet het spel
  (de lichtkaart, `js/zien.js`), zoals bij de lantaarn, maar warmer en wat groter.
- **Het leger** zijn de soldaten zoals ze er zijn, zo'n twintig, in een rij van drie breed over de weg: voorop twee
  vaandels, en om de paar man een fakkel. Geen nieuwe figuur.

**De zegels bij de heer** (18 okt; Marcel: "dat moeten mooie grote knoppen worden", "misschien in de stijl van een zegel,
kaarsvet", "middeleeuwen enzo, koning heer"): de twee keuzes op Sint-Maarten zijn zegels van rode lak, zoals onder zijn
brieven. **Pay** is zijn zegel heel, **Refuse** hetzelfde zegel in tweeën gebroken: je breekt zijn zegel (de naam van
het spel). Een ronde klodder die net niet rond is, met een uitgelopen rand, een ingedrukte ring van het stempel en een
kroon in reliëf; de naam eronder in de letter van de koppen. Nu een proef in CSS (`stijl.css`, bij `#heer`, en `zegel` in
`js/hud.js`), geen pixel art: goed zo, of later uit code getekend zoals de rest.

**De proefplaat** (als Marcel dit goed vindt): de heer te paard en een wagen met buit, van twee kanten, overdag; en een
stuk van het leger, 's nachts, met de fakkels en een vaandel. Te kiezen, als iets anders moet: het wapen (zijn hoed, of
iets anders), en het paard (de schimmel, of een donker paard). **Marcel: "De tekeningen in woorden zijn goed: maak de
proefplaat."**

**De proefplaat is er** (18 okt; `node gereedschap/pixelart/heerstoet.cjs`, `uit/heerstoet-proef.png`, twee keer
vergroot; wacht op Marcel): het paard als eigen model op het tuig van het vee, de heer erop (`heer(null, { zit: true })`
in `heer.cjs`: de beentjes opzij, de linkerhand met de teugels op zijn buik), de wagen (`ossenkar.cjs`, `bak: 'heer'` en
de lading `buit`), het vaandel (`soldaat(stand, { vaandel })`) en de fakkel als eigen model in de linkerhand. Alle
opties staan standaard uit: de heer, de soldaat en de karren zijn pixel voor pixel hetzelfde gebleven. Erbij gekozen:
het kleed in vieren zoals de wapenrok (voor links rood, voor rechts geel, achter andersom), met een gouden bies boven de
franje; manen en staart donkergrijs met zilver, een rood hoofdstel met gouden knopjes; het vaandel waait naar rechts op
het scherm, en de hoed erop heeft op het gele vlak een donkere rand; het vaantje op de voorste rechterstijl van de wagen,
de kist wat scheef met het deksel naar achteren open. **Nog niet goed** (zegt de plaat zelf): het kleed is een zwaar
blok met een vlakke voorkant, in het stappen steekt een knie erdoor, en van zuidwest zie je de gele hozen van de heer
nauwelijks op het gele kleed; het wapen is 28 bij 24 pixels, op het randje; de fakkel zit links, dus van noordoost, oost
en zuidoost zie je hem niet; 's nachts waait het vaandel over de hellebaarden van de rij erachter; van noordoost dekt het
deksel het goud half.

**Marcel op de plaat** (18 okt): "ja tof, maar dat paard moet echt beter", "en de os eigenlijk ook wel". In woorden, wat
beter is (Claude), voor beide dieren: (1) **benen met gewrichten**: een knie voor en een hak achter die je ziet, een koot
en een hoef (het paard een ronde hoef met wat behang erboven, de os een gespleten klauw), geen rechte stokjes; (2) **een
lijf met vorm**: een diepe borst, een ronde buik die terugloopt naar de flank, een sterke bil, en schaduw die de spieren
volgt (de schouder, de dij); (3) **een kop met karakter en op maat**: het paard een lange kop met kaak, neusgat, oog en
spitse oren op een gebogen, dikke hals; de os een zware, brede kop met een kwab onder de hals, de schoft met zijn bult,
uitstekende heupknobbels, en de horens; (4) **een stap met gewicht**: in het lopen gaan de benen in de volgorde van een
stap, de kop knikt mee, en het lijf deint. Het kleed van het paard volgt het lijf: korter (boven de knie), in plooien, met
een geschulpte rand en de gouden bies, en een apart borststuk, zodat je het paard eronder ziet. De koe en het schaap
blijven zoals ze zijn. Eerst een nieuwe proefplaat, oud en nieuw naast elkaar; pas als Marcel hem goedkeurt, komt de
nieuwe os in het spel (de vellen van de ossenkar opnieuw).

## De soldaten van het dorp en de poppetjes met SDXL (20 okt 2026, werklijst Q, f)

Marcel, 20 okt: "wil je eens een aantal nieuwe poppetjes maken voor het spel? en SDXL gebruiken? Ik heb ook een set
soldaten nodig", en: "Let op, ik heb de maximale kwaliteit met pracht en praal nodig", en meteen erna: "Pracht en praal
betekent hier, gewoon goed, hd, passend en exact wat ik zoek". Dus geen opsmuk: de maat is zijn plaat
(`voorbeelden/heerstoet-doel.webp`, de soldaten onderaan) en de stijlspecificatie (`stijlspecificatie.md`).

Wat er was: de soldaten van de speler hebben geen eigen tekening (een speerman is een dorpeling, `boer-u7`); alleen de
soldaat van de heer heeft er een (hierboven, "Het huis van de heer draagt rood en geel"). De dorpelingen: 7 lijven, 108
uiterlijken, 66 tot 80 pixels, 8 richtingen, staan, lopen en 9 werkhoudingen.

**Besloten** (Marcel, 20 okt, op drie vragen):
- **Het wapen van het dorp: een gouden korenschoof op diep blauw** (tegenover de gouden leeuw op rood van de heer; past
  bij Tithebreaker: het dorp houdt zijn graan). Op de wapenrok, het schild en later de vaandels.
- **De houdingen van een soldaat:** staan, lopen, aanvallen (steken, schieten en herladen) en vallen. Aanvallen en vallen
  zijn nieuw: het spel moet ze ook tonen (een kleine stap in `js/sprites.js` en het gevecht).
- **De schilder:** SDXL (FaeTastic, de huisstijl), en op de proefplaat één meesterbeeld van ERNIE-Image-Turbo ernaast.

**De weg** (de eigen pijplijn van de kar, `gereedschap/ai/ai-afwerking.md`): het poppetje in code (vorm, botten,
houdingen, acht richtingen); SDXL schildert een meesterbeeld van voren (zuidwest) en een van achteren (noordoost) op onze
render van 6×, met ControlNet op onze lijnen en diepte en een zin per gebied; die verf gaat terug op het model (de
projectie, `bakken.cjs`), zodat het in elke richting en elk loopbeeld hetzelfde poppetje blijft; dan ons handschrift (H4)
naar de sprite van 2×.

**De speerman in woorden** (eerst de proefplaat): de bouw van de soldaat van de heer (groot en zwaar), een gewatteerd
wambuis met leren mouwen en handschoenen, een maliënkraag, een ijzeren ketelhoed met brede rand, een blauwe wapenrok met de
gouden schoof op borst en rug, een langwerpig schild in blauw met de schoof en een ijzeren rand, en een speer met een
bladvormige ijzeren punt. **De kruisboogschutter:** een harnas van huiden met koperen klinknagels, een leren kap onder een
ijzeren kalot, een kruisboog met een ijzeren boog, en een koker met bouten op de heup. Daarna de aanvoerder, de militie,
de piekenier, de zwaardvechter en de boogschutter, en dan de dorpelingen (zo'n 4 à 5 uur SDXL voor alle 108
uiterlijken, 's nachts; de werkhoudingen krijgen dezelfde verf).

**De proefplaat:** de speerman en één boer, elk als meesterbeeld en op spelmaat in acht richtingen met een loopcyclus,
naast de boer van nu en de soldaat van de heer.

**De eerste proef, en Marcels omkering** (20 okt; `gereedschap/pixelart/soldatenhd.cjs`): het model in code staat
(`heer.cjs soldaat` met `livrei: 'dorp'`, `wapen: 'speer'`, `schild`, `kraag`; de schoof in `wapen.cjs`). SDXL over onze
render (zoals de kar, denoise 0,65, lijnen en diepte, een zin per gebied) gaf een slecht meesterbeeld: een groene helm,
paarse maliën (het magenta van de achtergrond), een esdoornblad als wapen, een stripgezicht. Marcel: "Maar, kun je niet
met ai een mooi poppetje genereren en dat als basis gebruiken voor een schilderbeurt? Want dingen uit code worden gewoon
niet zo mooi". Dus andersom (`soldatenhd.cjs concept`, `uit/soldatenhd/concept-speerman.png` en `-spelmaat.png`): SDXL
vrij (denoise 1, geen kleur en geen lijnen van ons), alleen de diepte van ons model zacht (0,45 tot 60% van de stappen)
voor de houding en de hoek; zo'n 55 seconden per beeld. Veel mooier, ook op spelmaat: een ketelhoed met rand en
klinknagels, maliën, een gewatteerde blauwe wapenrok, een schild met beslag. Wat niet klopt: "wheat sheaf" werd een losse
korenaar boven het hoofd, het schild goud in plaats van blauw, en het wapen op de borst ontbreekt. Het moeilijke deel
blijft acht richtingen en de loopbeelden die bij elkaar horen.
Marcel koos zaad 44 als richting, en "Eerst meer concepten". **Ronde 2** (wat 44 heeft in de zin, de schoof als wapen
op een blauw schild): de schilden blauw, geen losse aren meer, maar het wapen een lelie of kruis (SDXL kent "wheat sheaf"
niet als wapen), en nog de gladde stijl van SDXL. **Ronde 3** (Marcel: "Kun je niet de plaat die onze lat is gebruiken om
sdxl te voeden"): de rij soldaten uit zijn plaat als stijl via de IP-Adapter (0,5 en 0,8): de stijl schuift naar de plaat
(maliënkappen onder de ketelhoed, donkerder lijnen, textuur, zijn groen erachter), maar zijn rood en geel komen mee.
**Ronde 4:** de stijlplaat omgekleurd (het verzadigde rood van zijn livrei wordt blauw, het goud blijft: blauw en goud zijn
de kleuren van ons wapen), en rood in de negatieve zin: wapenrokken in blauw en goud, blauwe schilden met een gouden wapen,
in de stijl van de plaat; zaad 101 en 106 het sterkst (`uit/soldatenhd/concept-speerman-4.png`). **Het wapen** tekenen we
zelf (de schoof, `wapen.cjs`) en zetten we er na de AI op, zoals de leeuw van de kar. Marcel vroeg waarom dit niet bij de
os en kar kon: daar was onze render altijd het begin (SDXL schilderde eroverheen), en de ene vrije proef (19 okt) was
zonder onze diepte en zonder zijn plaat.
Marcel koos **zaad 106 op stijl 0,6** als basis van de speerman, en: "Eerst de os en kar zo". **De ossenkar vrij**
(`karhd.cjs concept`, `gereedschap/ai/vrij.cjs`, dat de speerman en de kar delen; `uit/karhd/vrij/ossenkar-1.png` en
`-spelmaat.png`): de linker ossenkar uit zijn plaat als stijl op 0,6, onze diepte zacht, zo'n 90 seconden per beeld. Voor
het eerst een echte os met horens en tuig voor een rode kar met spaakwielen, ijzeren banden, het vaantje en kruiken; de
beste kar tot nu toe. Wat nog niet klopt: de lading is vooral goud (geen zakken en tonnen), de leeuwen worden krullen (die
zetten we er zelf op, `wapen.cjs`), de os is wat lief (gouden horens, een roze neus), en het is gladder dan de korrelige
pixels van de plaat.
**De speerman in acht richtingen** (`soldatenhd.cjs richtingen`): zaad 106 als referentie (IP-Adapter, 'linear' 0,7: ook
de inhoud), per richting de diepte van ons model (0,6), hetzelfde zaad; zo'n 55 seconden per richting
(`uit/soldatenhd/richtingen-speerman.png`). Hij blijft dezelfde man (ketelhoed, gele sjaal, maliën, blauwe wapenrok, het
schild), maar van achteren (N, NO, NW) tekent SDXL toch een gezicht naar ons toe, en twee keer een sokkel. Ronde 2: per
richting een eigen zin ("seen from behind, no face visible"), voor de rug gezicht en baard in de negatieve zin, geen
sokkel, de diepte 0,7 (`richtingen-speerman-2.png`): van achteren nu echt de rug (het achterhoofd, de maliënkap), W en O in
profiel; nog twee speren bij N, een sokkel bij ZW, en de achterkant van de wapenrok wisselt van kleur. Marcel: "Controlnet
toevoegen?" en "En misschien met de pixel art addon?". **De pixelart-LoRA** (`soldatenhd.cjs lora`,
`uit/soldatenhd/lora-speerman.png`): PixelArtRedmond op zaad 106, vrij: op 0,5 echte pixel art met strakke blokjes, op
spelmaat dichter bij de plaat dan de gladde versie, maar hij zet een gele pluim op de helm en maakt hem puntig; op 0,9
Minecraft. **Ronde 3 van de richtingen:** erbij OpenPose uit onze eigen gewrichten (`soldatenhd.cjs poseBeeld`: de
gewrichten van de soldaat per richting naar het scherm, in de kleuren van OpenPose; van achteren zonder neus en ogen) op
0,8, en de buitenlijn van ons silhouet (`vrij.cjs omtrekVan`) op 0,4; zonder en met de LoRA op 0,5 (pluim en veer in de
negatieve zin). Uitkomst (`richtingen-speerman-3.png`): in alle acht richtingen precies op ons model (dezelfde maat en
houding, één speer, van achteren echt de rug), maar stijver en gedrongener dan het vrije concept; blauwe plassen onder de
voeten (die vallen weg: we knippen op ons silhouet); de LoRA doet op 0,5 met de referentie weinig.

**Van de acht beelden naar sprites** (`soldatenhd.cjs sprites`, `uit/soldatenhd/sprites-speerman.png`): de acht beelden
op het model gezet (`metAI`: per punt de eerste richting die het zag, in de volgorde Z, ZW, ZO, W, O, NW, NO, N), en
daaruit de sprites van 2× met H4, staand en lopend; ernaast de AI direct (op ons silhouet geknipt en verkleind). De AI
direct is op spelmaat mooi en blijft dezelfde man. Via het model: van voren te hard en glimmend (het licht van de AI en
dat van ons over elkaar, plus H4), van achteren donker en rommelig; lopend wel steeds dezelfde man zonder flikkeren, maar
even hard, en de benen vlekken. Het idee daarna (nog niet geprobeerd): een schilderbeurt over het beeld via het model
(SDXL licht, denoise 0,4, met het beeld van de AI direct van die richting als referentie), zodat de loopbeelden hun vaste
begin houden en toch het schilderwerk van de AI krijgen.

**Pixel Art Base** (Marcel: "We hadden toch ook dat sdxl model met pixel art checkpoint?"; het stond op de lijst van 19
okt, Marcel downloadde het, `huisstijl.cjs CHECKPOINTS.pixelartbase`; ronde 5, `concept-speerman-4-5.png`): precies ronde
4, alleen het checkpoint anders. Echte pixel art: strakke blokjes, donkere lijnen, een beperkt palet, de korrel van de
plaat, en zijn blokjes vallen op de HD-maat zo goed als één op één op onze pixels. Maar drukker: pluimen op de helm,
rommeliger op spelmaat; zaad 106 kreeg een wimpel aan de speer. FaeTastic is gladder en schoner, meer geschilderd.
**Marcel koos Pixel Art Base, en voor de animatie de schilderbeurt over het model.** De acht richtingen met Pixel Art Base
(ronde 4, `richtingen-speerman-4.png`): echte pixel art, dezelfde man, van achteren de rug; feller blauw en drukker, W en O
rommelig. **De schilderbeurt over het model** (`soldatenhd.cjs beurt`, `beurt-speerman.png`; denoise 0,4, het beeld van
die richting als referentie): lopend dezelfde man zonder flikkeren, maar het begin is te slecht: via het model te fel,
druk en hard (het licht van de AI en het onze over elkaar), en de benen blijven bruine vlekken, want de benen worden per
loopbeeld opnieuw gebouwd (de knie per stand uitgerekend) en de verf van het staan vindt ze niet terug. Marcel: "Ernie ook
nog een keer proberen?": ERNIE als schilder van die beurt (`beurt speerman ernie`, `beurt-speerman-ernie.png`, denoise
0,5, zo'n minuut per beeld op dit doek) legt meer textuur, maar redt het slechte begin ook niet. Die weg laten we los.
**Lopen van de AI zelf** (`soldatenhd.cjs lopen`): per loopbeeld het staande beeld van de AI als begin, de benen in die
stap via OpenPose (`gewrichtenIn`: `heer.cjs soldaat` geeft met `o.gewrichten` de heup, knie en enkel van elk been in
die stand), onze diepte en buitenlijn, het staande beeld als referentie, denoise 0,5 en 0,7 (`lopen-speerman.png`, en
bewegend `lopen-speerman-0.5.png` en `-0.7.png`): de beste stap voor de animatie tot nu toe. Het bovenlijf blijft dezelfde
man (helm, sjaal, schild, speer), met wat flikkeren in de details (het patroon van de maliën, de lelie); op 0,5 schemert
waar het been eerst stond de achtergrond door, op 0,7 zijn de benen geschilderd, niet in elk beeld even mooi. Het
volgende idee: alleen de benen opnieuw laten schilderen en het bovenlijf ongewijzigd uit het staande beeld nemen (de
soldaat loopt met zijn bovenlijf stil), met het been van ons model als begin waar het been nu staat.

Marcel vroeg ook of alle poppetjes gelijk zijn (een lijf per soort, met uiterlijken), en of een hogere "bitrate" het model
meer detail kan geven: de render staat voor de AI al op 10×, en fijne vormen in code voegen weinig toe nu de AI schildert;
wat wel helpt, zijn de verhoudingen: ons model is gedrongen (een groot hoofd, korte benen) en de AI volgt dat; de soldaten
van zijn plaat zijn langer en echter van bouw. Pixel Art Base ("Ik vond ook de pixel art base erg mooi"): staan in acht
richtingen werkt; lopen is de proef hierboven.

**Alleen de benen** (Marcel koos het, 21 okt; `soldatenhd.cjs benen`, `uit/soldatenhd/lopen-speerman-benen.png` en
bewegend `-benen-bewegend.png`): elk loopbeeld is het staande beeld van de AI; alleen waar de benen zijn (de hozen en
laarzen van ons model, staand en in die stap, acht pixels ruimer) schildert SDXL opnieuw, op denoise 0,85, met de benen
van ons model in die stap als begin en het skelet van die stap; daarna in pixels buiten de benen precies het staande
beeld. **Dit werkt:** het bovenlijf is in alle acht beelden pixel voor pixel hetzelfde (geen flikkeren), en de benen
stappen echt, met laarzen in de goede stand. Nog niet goed: de laarzen worden glimmend oranje-goud in plaats van
donkerbruin leer, een grijze vlek bij de benen in beeld 0, 1 en 4, en de benen verschillen per beeld nog wat in tekening.
Het bovenlijf deint niet mee (het staande beeld); dat mag, of later een pixel op en neer.
Marcel: "Laten we met 1 beginnen" (de laarzen en de vlekjes, dan alle richtingen). Wat er gebeurde: op 0,85 schilderde
SDXL het voorste been goed en maakte van het achterste een doorzichtige schim; Pixel Art Base schildert leer graag
glimmend oranje. **Ronde 2** (`lopen-speerman-benen-2.png`): het begin krijgt op de benen van ons model de kleuren van de
benen in het staande beeld (per deel, hozen en laarzen, op lichtheid gelegd), denoise 0,6, en na afloop gaat elk nieuw
beenpixel naar het palet van dat deel in het staande beeld (`paletVan`, `naaste`). Bruine laarzen zoals in het staande
beeld, beide benen echt, geen schim meer; alleen een gele wig op de scheen in beeld 4 (het palet pakte aan de rand het
geel van de zoom mee). **Ronde 3:** het palet alleen uit het midden van het staande been (vier pixels van de rand), en alle
acht richtingen (`soldatenhd.cjs lopen-alle`, `lopen-speerman-alle.png` en `-alle-bewegend.png`; zo'n anderhalf uur).
Z, ZW, W en NW werden gemaakt: het werkt in elke richting, ook van achteren (de benen stappen, de laarzen bruin, het
bovenlijf staat vast). Daarna Marcel: **"Hij is nog wat te shiny?"** Pixel Art Base zet harde glimlichten (de helm bijna
chroom). Twee knoppen: een afwerking achteraf (`soldatenhd.cjs matter`: de lichtste tonen samengedrukt en daar wat
verzadiging eraf; `matter-speerman.png` met mat 1, 2 en 3) en de zin. **Marcel koos mat 3 plus de zin** (21 okt): mat 3
is de vaste afwerking van elke sprite (`MAT`), en conceptronde 6 heeft mat in de zin (dull matte iron, matte worn
surfaces) en glans, chroom, de pluim en de wimpel in de negatieve zin (`concept-speerman-5-6.png`). Zaad 106 mat is
dezelfde man als 106 glanzend, zonder wimpel en met een doffere helm; dat is de nieuwe basis. De run met de oude, glanzende
beelden is gestopt na NW; de acht richtingen en het lopen gaan opnieuw op de matte basis (`soldatenhd.cjs alles`:
richtingen ronde 5, lopen ronde 4).

**Geen schild** (Marcel, 21 okt: "Voordat we ook er te diep inzitten. Ik denk dat een speerman geen schild moet hebben.
Speer is een 2 handed weapon"): de run op de matte basis is gestopt. In het spel heeft de speerman nu speer en harnas
(Marcel koos het, zoals de lansdrager in Knights and Merchants; `js/soldaten.js`, `spel.md`). Voor de houding drie
modellen zonder AI (`soldatenhd.cjs greep`, `greep.png`: A rechtop opzij met één hand, B schuin voor het lijf met twee
handen, C rechtop voor het lijf met twee handen, waar de schacht door het gezicht liep). **Marcel: "Bij stilstaan 1 hand
recht, lopen 2 handen en steken ook", en "Bij lopen schuin".** Dus staan in A, lopen en steken in B (`heer.cjs soldaat`
`o.greep` 'schuin'; het model geeft ook de schouders, ellebogen en polsen door voor OpenPose). Conceptronde 7 zonder schild
(`concept-speerman-6-7.png`): zaad 106 is dezelfde man, nu met het wapen op de borst; dat is de basis. De richtingen in
twee sets per richting (ronde 6): staan (A) en de basis voor het lopen (B), waarop het lopen alleen de benen schildert
(lopen ronde 5); de basis B wordt ook het begin van het steken.

De staande set zonder schild (`richtingen-speerman-6.png`): dezelfde man in acht richtingen, het wapen op de borst, wat
bleker dan het concept. De basis voor het lopen (`richtingen-speerman-6-lopen.png`): schuin met twee handen in Z, W, NW,
N, O en ZO; naar ZW wijst de speer naar ons (je ziet vooral de handen), bij NO tekende SDXL een tweede speer. Lopen naar Z
op die basis is niet mooi (een witte helm, een rood vlekkerig gezicht, bleek en druk), omdat de basis al zwak was.
**Marcel: "en de plaatjes worden niet echt mooi, misschien eerst alles kwa geometrie bouwen en dan pas refinen? of werkt
dat niet".** Dat is de klassieke weg; onze eerste proef (SDXL over de render) ging mis omdat het model niet op het doel
leek en het recept er nog niet was (geen Pixel Art Base, geen plaat, geen referentie, geen skelet, geen palet). Dus:
(1) het model zoals het concept (`heer.cjs soldaat` `o.concept`: een dikke gele sjaal over de schouders, ijzeren
schouderstukken, een gouden zoom langs de wapenrok, de jas en de mouwen blauw, de maliënkap zonder cape eronder), (2) alles
uit het model renderen (in elke richting en elk beeld precies hetzelfde), (3) één verfbeurt erover: Pixel Art Base binnen
ons silhouet op een lage denoise (0,45 en 0,6), het concept als referentie, ons skelet, onze diepte en buitenlijn, en als
variant daarna het palet van het concept (`soldatenhd.cjs verf`, `verf-speerman.png`; met `CONCEPT=1` zolang het een proef
is). Marcel liet de run van het lopen afmaken; de proef komt erna.
Uitkomst (`verf-speerman.png`, en na de maten uit zijn plaat `verf-speerman-2.png`; `maat.png`): de verfbeurt geeft de
meeste samenhang (in elke richting dezelfde soldaat), en met de maten uit de plaat (forsere handen, laarzen en mouwen,
een bredere borst, een diepere helm, het hoofd 14% kleiner) is de bouw die van de plaat. Maar Marcel: **"Maar ze zijn
eigenlijk niet duidelijk meer"** (ruis, kleuren die in elkaar lopen). Zijn vraag daarna: "kun je img2img gebruiken om de
soldaat van de hoofdplaat te kopieren?" De negen soldaten op zijn plaat zijn dezelfde man in negen richtingen; uitgeknipt,
het vaandel en het blad weg en het rood blauw (`uit/soldatenhd/plaat/blauw-rij.png`) zijn het al speermannen, helderder
dan alles van SDXL. img2img met Pixel Art Base eroverheen (`plaat-img2img-speerman.png`, 0,35 en 0,5) maakt ze slechter.
**Besluit** (Marcel, 21 okt): de generator van zijn plaat maakt de bron, één ding tegelijk, en wij maken het passend:
`beelden-van-de-generator.md`.

## Blender als basis? (24 okt 2026, vraag 190)

Marcel, 24 okt: "onderzoeken of we hogere kwaliteit art krijgen door als basis een 3d model te gebruiken die jij in
blender maakt". Een onderzoek, nog zonder render: Blender staat niet op deze pc, en een proefplaat komt pas na een ja
(hierboven, "Eerst goedkeuring, dan renderen").

**Wat we nu hebben.** Twee wegen. (1) Onze renderer in Node (`kern.cjs`): modellen uit afstandsfuncties (bollen,
capsules, dozen), licht, omgevingsschaduw, zachte schaduw, een vast palet en een omlijning. Voor de gebouwen goed, en na
de stijlproef dicht bij het doel (hierboven, "De nieuwe stijl"). Voor de mensen het zwakke punt: houterig, en de botten
bewegen star, zonder huid die meebuigt (`houding.cjs`). (2) Sinds 21 okt de generator als bron voor de poppetjes
(`beelden-van-de-generator.md`): per beeld mooier dan alles uit code, maar één speerman kostte zo'n 25 vellen met redo's,
de speer wees soms naar achteren, de kleur liep weg (de vallen oranjer), en in `speerman-staan.webp` heeft NW twee speren.

**Wat Blender toevoegt, tegen onze renderer:**
- *Vorm:* echte meshes met subdivision (ronde, organische vormen uit een grove kooi, waar wij capsules aan elkaar
  smelten), bevel (de lichte randjes langs elke kant, die de stijlspecificatie vraagt), cloth (een wapenrok die valt en
  plooit), haar en curves (baard, vacht, riet), en displacement (stenen in een plint).
- *Beweging:* een skelet met een huid: ellebogen, knieën en kleren buigen mee. En één loopcyclus geldt voor elk
  poppetje met hetzelfde skelet.
- *Licht:* Cycles rekent het licht door, ook wat van de grond in de schaduw kaatst, met echte zachte schaduwen. Wij
  benaderen dat.
- *Lagen per pixel:* diepte, normaal, object- en materiaalnummer en omgevingsschaduw, voor onze omlijning en ons palet
  (zoals `B.diep` en `B.nrm` nu).
- *Vrije bouwstenen:* MakeHuman (MPFB2, CC0) geeft een mens met een goede bouw en een skelet, zonder boetseren.

**Wat hetzelfde blijft:**
- Claude maakt het model in code (`blender -b -P script.py`), niet met de hand, en beoordeelt het op een render, zoals
  nu. Een model uit losse vormen blijft er zo uitzien, in Blender of hier: de winst zit in de gereedschappen
  (subdivision, cloth, skelet), niet in Blender zelf.
- Blender maakt geen pixel art. Een verkleinde 3D-render oogt als "a photograph converted into pixel art", wat de
  stijlspecificatie verbiedt. Het palet, de clusters en de omlijning blijven ons werk, op elke weg. Blender rendert dus
  vier keer zo groot met de lagen erbij, en onze Node-code maakt er pixel art van.
- Per beeld haalt een model van Claude de generator waarschijnlijk niet: die schildert. De winst is dat elke richting en
  elk beeld klopt, en dat een tweede poppetje (andere kleren, ander wapen, andere livrei) minuten kost in plaats van 25
  vellen. En de maatstaf blijft de les van de verfbeurt hierboven: duidelijk op spelmaat.

**Wat het kost:**
- Blender is gratis (GPL; wat het rendert, is van ons, ook voor verkoop): de draagbare zip van blender.org, zo'n 400 MB,
  zonder installatie. Het gereedschap is dan niet meer "alleen Node"; het spel merkt niets.
- De GTX 1080 Ti rendert met Cycles op de videokaart (CUDA); voor sprites van een paar honderd pixels is de processor
  ook genoeg.
- In de cloud moet Blender elke sessie opnieuw binnenkomen (de Linux-versie, ook zo'n 400 MB).
- De huizen overzetten loont niet: de huizenbouwer is af (1214 tekeningen, de bouwfasen, de brand, de sneeuw, plat) en
  ligt na de stijlproef dicht bij het doel.

**Het oordeel van Claude:** voor de gebouwen nee; voor de poppetjes waarschijnlijk wel, als het model en het skelet uit
Blender komen (vorm en beweging kloppen in elke richting), de afwerking tot pixel art van ons, en eventueel de kleur van
de generator, zijn staande beeld op het model geprojecteerd (het idee van `gereedschap/ai/hybride-voorstel.md`, met de
projectie van Blender). Te toetsen met één proefplaat.

**De proefplaat, in woorden** (wacht op Marcels ja, en op Blender op deze pc): de speerman van het dorp, door Claude in
Blender gemaakt, naar de plaat van de generator: gedrongen, met de ketelhoed, de maliënkraag, de gewatteerde mouwen, de
wapenrok in blauw en geel, de riem met tas, de laarzen en de speer, op één skelet. Op de plaat, op spelmaat en twee keer
vergroot: staan in acht richtingen en lopen in één richting (ZW), naast de speerman van de generator en een figuur uit
onze renderer. Valt de bouw tegen, dan daarna MPFB2 als basis; valt de kleur tegen, dan de projectie van de generator.

**De proef (24 okt).** Marcel had Blender 5.2 al op zijn pc ("blender heb ik al geinstalleerd"). Het model en de renders:
`gereedschap/blender/speerman.py`, de plaat: `gereedschap/blender/proef.cjs` (`gereedschap.md`). Het lijf is samengesmolten
uit bollen en capsules (voxel remesh), de kleren, de helm en de speer zijn eigen delen, en een skelet met een huid laat het
lopen. Zestien beelden renderen in twintig seconden.
- *De eerste plaat* (acht richtingen en lopen ZW, naast de generator en de soldaat uit onze renderer): elke richting is
  dezelfde man en het lopen beweegt echt, maar hij was te dun, de speer te fijn en het gezicht verdween onder de helm.
  Marcel: "oh, kan dat niet beter?", en daarna: **"laten we de focus houden op het basisbeeld, waarin hij staat Z. kijken
  of we die gelijk kunnen krijgen aan de referentie"**, en: "je mag ook de plugin [MPFB] gebruiken".
- *Wat het verschil maakte*, in volgorde van belang: (1) **de camera van de poppetjes op 15 graden** in plaats van 30. De
  generator tekent zijn mannen veel vlakker dan de wereld (de rand van de helm is een smalle ellips), en alleen dan zie je
  het gezicht onder de helm. (2) **Gedrongen**: hoofd en helm groter (maal 1,4), de man breder dan echt (maal 1,35), de
  speer overdreven dik. (3) **Het licht meer van voren** dan dat van de wereld, zoals de generator belicht, en de
  omgevingsschaduw alleen binnen een deel (anders maakt de helm het gezicht zwart). (4) De verdeling van de plaat: de
  wapenrok gevierendeeld (van hemzelf rechtsboven geel, rechtsonder blauw), de riem in het midden, de zoom op een derde, en
  daaronder blauwe hozen boven de laarzen. (5) Aflopende schouders en de armen in een lichte boog. (6) Lijnen om elk deel
  (Freestyle), die op spelmaat een donkere pixel geven.
- *Twee manieren van licht*, naast elkaar op de plaat: Cycles (doorgerekend) en geschilderd (EEVEE, het licht in vier vaste
  banden). Met het licht van voren scheelt het op spelmaat weinig.
- *Waar het nu staat* (`uit/blender/z.png`): op spelmaat dezelfde opbouw als de speerman in het spel (helm, gezicht met
  baard, maliënkraag, gevierendeelde wapenrok, riem met gesp, hozen, laarzen, speer). Wat de generator nog meer heeft: een
  geschilderde huid met textuur en meer contrast, en de kleine dingen die het leven geven (de leren armstukken, de schede,
  de tas aan de riem, de omgeslagen laarzen, de voeten naar buiten). MPFB is nog niet gebruikt: onder de kleren is van het
  lijf alleen het gezicht te zien, op spelmaat zo'n acht pixels breed.
- *De kleine onderdelen* (Marcel: "Ga door op Z: de kleine onderdelen erbij [...] en meer textuur en contrast"): leren
  armstukken met lichte randen over de onderarm, donkere handschoenen met een kap, een brede riem met een grote gesp en
  een hangende tong, de tas met klep en gespje aan de linkerheup, de schede met dolk aan de rechter, laarzen met een
  omgeslagen rand van licht leer, de voeten 24 graden naar buiten, en klinknagels langs de kam van de helm. De stof is
  gevlekt in twee maten (eerst te sterk: krassen in het blauw), de naden van het wambuis dieper, de ringen van de maliën
  donkerder, en het licht harder (de schaduwband donkerder en koeler, de zon sterker, de lucht zwakker). Op spelmaat lezen
  het armstuk, de omslag van de laarzen, de tas en de gesp; de schede valt achter de hand en de speer weg, en de
  klinknagels zijn er alleen groot.
- *Het vel van de bron*: het vel `speerman-staan` heeft de wapenrok anders gevierendeeld (van hemzelf rechtsboven blauw)
  dan de speerman in het spel (uit vel 01, rechtsboven geel); het model volgt het spel. (Rechtgezet hieronder: vel 01 is
  van voren niet gevierendeeld.)

**De referentie, onderdeel voor onderdeel (24 okt).** Marcel, bij de HD-versie: "blijf kritisch", "hou de referentie in
gedachten. Alles valt en staat met deze poppetjes", en: "ik wil dat je eerst de hele referentie nog eens nakijkt, zodat je
alles écht duidelijk hebt." De referentie is **vel 01** (`gereedschap/pixelart/bron/soldaten/speerman/01.webp`, ontleed
in `uit/generator/bron/speerman-01.png`): daar komt de speerman in het spel vandaan. Nagelopen op 2 tot 5 keer vergroot,
staan naar Z, en waar het van voren niet zeker is in de zijaanzichten (W, ZW) en de rug (N). De kleuren zijn de mediaan van
een vak van 7 bij 7 pixels (licht / midden / schaduw).
- *Bouw:* heel gedrongen. Van de koepel van de helm tot de zolen 100: de schouders (met de mouwen) 47 breed, de wapenrok 32,
  de rand van de helm 27, het gezicht 17, de laarzen samen 36. Van de zolen omhoog: de laarsrand op 22, de zoom op 25, de
  riem op 47, de schouders op 77, de kin op 74, de ogen op 82, de helmrand op 85. Het hoofd met helm is dus een kwart van de
  man, bijna twee keer zo groot als echt.
- *De helm:* een ketelhoed van vier delen: een kam van voor naar achter met een korte punt bovenop, en aan weerszijden een
  naad. De koepel hoog en rond, de rand zo'n anderhalf keer zo breed als de koepel, wat naar beneden. Mat grijs staal, koel
  in de schaduw: #b7b4b8 / #6f6d79 / #514b5f.
- *Het gezicht:* gebruind (#c27952, in de schaduw #954326), zware donkere wenkbrauwen, kleine diepe ogen, een brede neus.
  **Een korte volle baard met grijze spikkels** (#493a34) over kaak en kin, en een dikke snor die over de lip hangt
  (#3e3630). In het zijaanzicht staat de baard duidelijk vooruit onder de lip: het is een baard, geen kinriem. Om het gezicht
  zit de maliënkap: onder de helm langs de wangen, over de oren, en verder als kraag.
- *De maliënkraag:* groot en rond, over de schouders tot op de borst, ringen met lichte stippen, warm grijsbruin
  (#765444 / #423830). Daaronder op de schouder een smalle gele rand van de wapenrok.
- *De wapenrok:* **van voren blauw met een brede gele baan in het midden**, van de kraag tot de zoom (de gesp staat op het
  geel); op de rok is het blauw aan de buitenkant breder. Op de rug is hij wel gevierendeeld (de generator is daar niet
  consequent). Recht en wat stijf, tot net boven de knie, met verticale plooien. Geel #f9b423 / #db931a / #c37a1a, blauw
  #1c3477 / #18295e / #151c41.
- *De mouwen:* een gewatteerd wambuis, donkerbruin (#61301e / #522e1c), grote bolle ruiten, de schouders breed en bol.
- *De linkerarm* (hangt): over de onderarm een breed armstuk van donker grijsbruin leer (#4d3730), boven en onder een lichtere
  band met klinknagels (#593324); dan een grote bruine handschoen met kap (#7f563b), de vingers half gebogen.
- *De rechterarm:* de onderarm omhoog, de vuist om de speer op borsthoogte, de handschoen donkerder (#563a2f) met duidelijke
  vingers; achter de vuist de rand van het armstuk.
- *De riem:* breed roodbruin leer (#793a28), een grote rechthoekige zilveren gesp (#615859, de rand lichter), aan beide
  heupen een smalle leren hanger die tot halverwege de rok hangt: van hemzelf rechts een schede (#984f35), links een riempje
  met een klein beslag.
- *De benen:* donkere marineblauwe hozen (#141529), alleen een smalle strook tussen zoom en laars.
- *De laarzen:* kort (tot halverwege de kuit), warm bruin leer (#643822, in de schaduw #462318), een omgeslagen rand, om de
  enkel een riempje met een gespje aan de buitenkant (#643d24), ronde dikke neuzen, een donkere zool, de voeten wat naar
  buiten.
- *De speer:* een donkere roodbruine schacht (#603327) van de grond tot ver boven de helm; bovenaan een koker omwonden met
  koord (zes, zeven slagen, koperbruin); een blad als een ruit met afgeronde zijden en een middenrib (licht vlak links, donker
  rechts), wat roestspikkels (#72697a).
- *Licht en afwerking:* licht van linksboven, de schaduw koel (paarsgrijs op staal, diep blauw op de rok), een donkere
  omlijning om alles, geschilderde plooien en slijtage.
- *Wat ik eerder verkeerd las:* de wapenrok als gevierendeeld (dat is het vel `speerman-staan` en de rug), en op 5 keer de
  baard als "grijs als de maliën"; de zijaanzichten laten zien dat het een baard is.

**De HD-speerman naar de referentie (24 okt).** Marcel: "pas het HD-model aan naar de lijst uit de referentie".
`gereedschap/blender/speerman_hd.py`, de vergelijking op gelijke hoogte in `uit/blender/hd-naast.png`, op spelmaat in
`uit/blender/hd-spelmaat.png`.
- *De bouw:* de knoppen van MakeHuman (zwaar, gespierd, breed in de schouders, korte nek, een breder en korter hoofd, grote
  handen, dikke armen), en daarna de botten van de benen in de lengte op 0,65: de doelen van MakeHuman gaan niet verder
  dan 1, en de man op de plaat is bijna een dwerg. Het hoofd maal 1,35. Gemeten: de riem op 48 procent (plaat 47), het hoofd
  met helm ruim een kwart.
- *Wat nu klopt:* de ketelhoed van vier delen met kam, naden en punt, de rand anderhalf keer de koepel; het gezicht met een
  volle korte baard en snor van echt haar, grijs gespikkeld, de maliënkap om het gezicht; een ronde maliënkraag met grote
  ringen; de wapenrok blauw met de gele baan, het lijf recht naar beneden en de rok recht met lange plooien (de
  stofsimulatie hing onderaan als een zak, dus de rok is nu gebouwd: recht van de heupen, met plooien); bolle gewatteerde
  mouwen, armstukken met lichte banden en klinknagels, grote handschoenen; de riem met de grote gesp en de twee hangers;
  de hozen zichtbaar; korte laarzen met omslag, enkelriempje met gespje en ronde neuzen; de speer met koord om de koker en
  een blad met roestspikkels.
- *Wat nog anders is, in HD:* de kraag bedekt nog wat van de bovenkant van de mouwen; het gezicht is jonger en gladder dan
  het verweerde gezicht op de plaat; de plaat heeft donkere lijnen en geschilderde plooien en slijtage, de render is
  belicht zoals het is.
- *Op spelmaat* (de HD-render verkleind tot 74 pixels, naast de speerman in het spel): dezelfde soldaat, maar slechter
  leesbaar: donkerder en modderiger (het gezicht verdwijnt tussen baard en maliën, de kraag en de mouwen worden één
  donkere massa), breder, en de speer te fijn. De generator overdrijft voor de kleine maat (lichtere kleuren, harde lijnen,
  een groot speerblad); een HD-render die eerlijk is, moet voor het spel een eigen afwerking krijgen.

**De verbeterronde (24 okt).** Marcel: "Dus we moeten nog een verbeter ronde doen."
- *HD:* een ouder, gebruind gezicht met een frons en een brede neus (de doelen van MakeHuman voor de wenkbrauwen en de
  neus, leeftijd 0,78); de baard grijzer; een zacht licht van voren, zodat het gezicht onder de helm licht is zoals op de
  plaat; lijnen om de kleren (niet om het lijf: die tekenden door de baard heen); een vuile zoom. De kraag is nu een dikke
  ronde rol om hals en kin, op de romp gelegd, met de mouwen ernaast. Onder de kleren heeft het lijf de kleur van het
  wambuis, zodat er nergens bloot vel door een kier valt.
- *Wat misging en terug is gedraaid:* lichte vlekken op de stof (leken verfspatten), en de schouders in de mouw (werden
  kussens tot de helm).
- *Op spelmaat* (`speerman_hd.py -- <uitmap> spel`, vier keer de spelmaat): lijnen van een pixel in het spel, meer
  contrast (de look *Medium High Contrast*), het speerblad en de schacht overdreven (maal 1,9 en 1,4). Naast de speerman
  in het spel (`uit/blender/spel-spelmaat.png`): dezelfde opbouw en dezelfde leesbaarheid van helm, gezicht, kraag,
  wapenrok, riem en laarzen; de generator is nog iets helderder en verzadigder, en zijn kleine dingen (de hangers, het
  koord) lezen beter. Dat is nu afstellen, geen opbouw meer.
- *De detailronde* (Marcel: "De helm is denk ik nog wat groot", "Doe donkere zwarte lijnen op de helm zijn ook niet zo",
  "we moeten nog dichter op de referentie", "In game is het rommelig", "Te platgedrukt"): de helm strakker om het hoofd en
  lager, de rand op de wenkbrauwen (de rand nu zo'n 28 procent van de lengte, plaat 27); de kam, de naden, de punt en de
  klinknagels zonder lijnen (op de plaat zachte ribben); de baard grijszwart; grovere maliën in warm grijsbruin; het
  wambuis lichter bruin; kortere laarzen met meer hozen; een steviger speer. Minder breed (de schouders en de armen minder
  dik, de benen op 0,72): hij was breder dan de man op de plaat. Op spelmaat een derde van het fijne detail (bobbels,
  vlekken, de ringen grover): het werd daar gespikkelde ruis.
- *Wat misging:* de wapenrok over de schouders trekken (de breedte van de schouders liep door tot de zoom: een doos om de
  armen); teruggedraaid. Open: bij de schouders nog een rafelige rand tussen kraag, wapenrok en mouw.
- *Schouders, hoofd en borst* (Marcel: "De schouders breder en het rafelige oplossen. Hij lijkt nu te smal", "En het hoofd
  lijkt toch wat groot naast dat van de referentie", "Borstkas ligt ook verder terug dan de referentie, die lijkt borst
  vooruit te hebben"): brede schouders met MakeHuman (de schouderbreedte, dikkere bovenarmen) zonder de romp breder; het
  wambuis loopt nu door tot de hals, plat bij de hals en bol op de schouderkop en de arm, zodat de rand onder de kraag valt
  en er niets meer rafelt. Het hoofd maal 1,25 in plaats van 1,35. De borst vooruit: een diepere borst (MakeHuman), de
  bovenrug 7 graden achterover, de nek en het hoofd houden hun richting (eerst keek hij daardoor omlaag). Het armstuk meet
  alleen nog aan de mouw dicht bij de onderarm (met de diepere borst raakte het de borst: een bruine waaier). De kraag valt
  voor lager, over de bovenrand van de wapenrok (die liep als een rechte streep over de borst). De kraag is nu wat groter
  dan op de plaat.
- *De schouders zakken* (Marcel: "De schouders moeten zakken, nu alsof hij zn hoofd in trekt"): het intrekken kwam vooral
  van de heel korte nek; die is weer wat langer (de nek van MakeHuman op 0,4 korter in plaats van helemaal). De
  sleutelbeenderen en de schouders gaan in de houding wat omlaag. Helemaal omlaag gaf afhangende schouders, smal bovenaan
  (vel 01 heeft brede, rechte schouders), dus half; het bolle van het wambuis begint pas op de schouderkop. Naast elkaar,
  half gezakt en in de gewone stand: `uit/blender/schouders-vergelijk.png`.
- *SDXL over het model* (Marcel: "Is er een mogelijkheid om de basis 3d vorm te gebruiken en te verven met sdxl? Met de
  pixel lora?", en "ok, laten we sdxl met de pixel lora proberen"): `gereedschap/blender/schilder.cjs`, met de werkstroom
  van `afwerking.cjs`. Het begin is de HD-render op magenta, de vorm komt van zijn lijnen en zijn diepte (`speerman_hd.py
  -- <map> stuur`, dezelfde camera), vel 01 is het voorbeeld voor de stijl (IP-Adapter 0,5), SDXL schildert alleen binnen
  ons silhouet, daarna mat 3. Plaat: `uit/blender/sdxl/plaat.png`. De vorm blijft staan. Op 0,35 verandert weinig (wat meer
  geschilderd, de maliën groenig); op 0,5 echte pixelblokjes, maar de kleuren schuiven (de maliën olijfbruin, het geel
  oranjer); op 0,65 de sterkste pixel art, maar de kleuren lopen weg en de blokjes vallen op spelmaat niet op onze pixels.
  Op spelmaat leest geen versie beter dan de Blender-render zelf. Pixel Art Base op 0,5 en 0,65 wachtten in ComfyUI achter
  twee opdrachten met TRELLIS 2 die niet van deze sessie waren.
- *Projecteren* (Marcel: "en hoe krijgen we dit dichter op de referentie? uv wrapping?"): het beeld van de generator als verf
  op het model leggen, vanuit de camera van die richting (een UV-kaart uit de camera, het beeld als textuur, onbelicht).
  In de richting van het beeld is de render dan de referentie zelf; in de loop- en aanvalsbeelden beweegt de verf met het
  model mee, dus die kloppen met het staande beeld (het probleem van de generator). Wat ervoor nodig is: het model moet op
  het beeld passen (anders komt de riem op de rok terecht), dus eerst het beeld naar onze render buigen met vaste punten
  (helm, kin, riem, handen, zoom, laarzen); wat in die richting verborgen is (de binnenkant van een arm), krijgt verf uit een
  andere richting van vel 01; en het licht zit in de verf, dus die richt zich naar de richting waaruit hij komt. Het idee
  stond al in `gereedschap/ai/hybride-voorstel.md` (de projectie), toen op ons oude model.
- *De proef met projecteren* (Marcel: "projecteer vel 01 (staan Z) op het model, met het beeld eerst naar onze render
  gebogen, en laat zien hoe het eruitziet in Z en een paar graden gedraaid"): `gereedschap/blender/verf.cjs` buigt staan
  naar Z van vel 01 op de HD-render (een thin-plate spline door 26 vaste punten, afgelezen op een raster: helm, ogen, neus,
  kin, kraag, schouders, vuisten, gesp, riem, zoom, laarzen, speer), naar `render/verf-Z.png` (`uit/blender/verf-buigen.png`
  om het buigen te beoordelen). `speerman_hd.py -- <map> verf` legt het als textuur op het model, met een UV-kaart uit de
  camera, onbelicht; de speer houdt zijn eigen materiaal (het buigen trok er paarse strepen en een kromme schacht), het haar
  valt weg (de baard zit in de verf). Uitkomst (`uit/blender/verf-hoeken.png`): recht van voren is de render vel 01 in de
  vorm van ons model; gedraaid (20 en 45 graden) beweegt de verf mee en blijven de wapenrok, de riem, het gezicht en de helm
  kloppen, maar op de zijkanten die de camera van voren schuin ziet (de rand van de helm, de zijkant van de armen en de
  laarzen) rekt de verf uit tot strepen. De baard wordt groter dan op de plaat (zijn baard en kraag vullen onze grotere
  kraag).
- *Uitvouwen en bakken* (Marcel: "kunnen we de uv niet unwrappen en in blender inbrengen als mesh"): ja, dat is de volgende
  stap. Het model krijgt een echte UV-kaart (uitgevouwen), en de verf wordt in een textuur gebakken die bij de mesh hoort.
  Dan kan elke richting van vel 01 erin, elk op de plekken die hij het best ziet (naar de hoek en of hij ze ziet), en draagt
  elk loop- en aanvalsbeeld dezelfde textuur; de textuur is ook met de hand bij te werken.
- *De proef met bakken* (Marcel: "vouw het model uit en bak de verf van vel 01 in een textuur op de mesh, eerst met Z, ZW en
  W (en gespiegeld voor de andere kant)"): `verf.cjs` buigt nu Z, ZW en W (vaste punten per richting, op renders van het
  model uit die richting: `speerman_hd.py -- <map> kijk`), ZO en O gespiegeld; `gereedschap/blender/bakken.py` maakt van
  het model één mesh, vouwt hem uit (smart project), weegt per punt elke richting naar de hoek met de camera (nul als iets
  ervoor zit) en bakt alles in één textuur van 4096 (`render/atlas.png`); daarna hangt de mesh aan het skelet (de staande
  houding als rust, de gewichten van het dichtste punt van het lijf). Marcel: **"meh"**. Wat er mis is: waar richtingen
  elkaar overlappen, mengt de verf tot vlekken, want de generator tekent de wapenrok in elke richting anders (van voren
  een gele baan in het midden, uit ZW en W op andere plekken): de wapenrok wordt een blauw-gele modder, het gezicht
  vlekkerig. In de loopbeelden scheurt de rok tussen de benen (hij volgt het dichtste punt van het lijf, dus de dijen), en
  de achterkant van de armstukken is zwart (daar had geen richting verf). Mengen werkt dus niet met beelden die het onderling
  niet eens zijn.
- *Per richting projecteren, zonder mengen* (Marcel: "Probeer per richting projecteren zonder mengen: lopen ZW alleen met
  de verf van ZW, en de rok aan de heupen in plaats van de dijen"): `bakken.py -- <map> richting ZW` legt alleen de verf van
  ZW op het model (vanuit de camera van ZW, onbelicht), rendert staan en acht loopbeelden; de rok, de riem en wat eraan hangt
  volgen het bekken (spine05). `lopen.cjs ZW` zet ze op spelmaat naast het lopen ZW van de generator in het spel
  (`uit/blender/lopen-ZW.png`, en bewegend `lopen-ZW-bewegend.png` naast `lopen-ZW-generator-bewegend.png`). Voor de
  laarzen kwamen er vijf vaste punten bij (de stand van de benen op vel 01 wijkt af van het model: eerst paarse strepen op
  het achterste been). Uitkomst: het bovenlijf is in elk loopbeeld pixel voor pixel de referentie, de rok scheurt niet meer,
  en de benen stappen met laarzen in hun eigen kleur. Nog fout: waar een been of de linkerarm iets laat zien dat in het
  staande beeld verborgen was (het achterste been, de arm als die naar voren zwaait), komt uitgerekte verf (donkere vegen);
  en ons model is breder dan de man op vel 01 ZW, dus op spelmaat oogt hij zwaarder dan de speerman van de generator. De
  generator draagt de speer bij het lopen schuin; hier blijft hij rechtop in de hand.
- *De vegen, de breedte en naar voren hangen* (Marcel: "Los op ZW eerst de vegen op (de verborgen delen vullen met de verf
  ernaast, de linkerarm minder zwaaien) en maak het model wat smaller", en "de soldaat moet eigenlijk ook iets naar voren
  'hangen' als hij loopt"). In `bakken.py`: per punt hoe goed de camera van ZW hem ziet (de hoek, en of iets ervoor zit);
  waar niet of maar schuin, krijgt hij de verf van de punten ernaast, van buur naar buur over de mesh doorgegeven
  (`vul_verborgen`). De linkerarm zwaait een derde zo ver. Na het projecteren (de verf zit dan vast) wordt het model
  smaller, de mesh en de botten in rust: het lijf maal 0,9, naar de voeten maal 0,8 (gemeten op spelmaat tegen staan ZW van
  de generator: borst en rok nu 1,00 en 1,03 van zijn breedte, de laarzen nog 0,83: hij staat wat breder op zijn benen).
  Bij het lopen leunt het bovenlijf vanaf de taille 8 graden voorover, het hoofd half terug; de rok en de riem blijven aan
  het bekken. En in `verf.cjs` gaat de omlijning van de generator eraf voor het aanvullen (die gaf donkerpaarse randjes
  langs de laarzen). De vegen op het achterste been en de arm zijn weg, de laarzen hebben schone randen.
- *De voeten* (Marcel: "voeten ziet er nog raar uit"). Wat raar was: het riempje om de enkel volgde de bovenkant van de voet
  en stond als een platte schotel om de voet; de omslag waaierde uit als een klok; de neus was een klomp; en bij het lopen
  kantelde de voet mee met de knie (de achterste voet wipte omhoog alsof hij trapte), met grote stappen. Nu: de omslag en het
  riempje zijn strakke ringen om de schacht (het riempje gemeten aan de laars, met het gespje buiten), de voet en de neus
  compacter; bij het lopen kleinere stappen (de dij 0,3 radiaal), de voet vlak op de grond met de teen wat omhoog bij het
  neerzetten en de hiel bij het afzetten. Twee vaste punten erbij (de riempjes), en het aanvullen in `verf.cjs` neemt het
  gemiddelde van de buren. Overblijft: onder de neus en de zool rekt de zool van vel 01 uit tot strepen (onze laars is
  onderaan breder dan de zijne); op spelmaat een donkere onderrand van een pixel. Schuine vlakken eerder vullen hielp daar
  niet en maakte de omslag glad als plastic, dus dat is terug. HD: `uit/blender/lopen-ZW-voeten.png`.
- *De speer* (Marcel: "ze raken de speer. ook de speer zelf mag nog beter", "maar we gaan de goede kant op", en "lopen moet
  ook speer schuin vasthouden hadden we besproken": de afspraak van 21 okt, staand rechtop met een hand, lopend en stekend
  schuin met twee handen, de punt altijd vooruit). De speer zelf naar vel 01: een breed blad als een ruit met afgeronde
  zijden, het breedst op een derde, met een middenrib, de brede kant naar de camera; het koord slag tegen slag om de koker;
  en in `bakken.py` geschilderd in drie vaste tonen (licht, midden, donker naar de hoek met het licht van linksboven op het
  scherm), met de kleuren van vel 01 en roestvlekken op het blad, zoals het lijf onbelicht. Lopen: de handen met IK naar
  hun plek (rechts laag voor de heup, links hoger en verder voor het lijf; de maten van `heer.cjs` zelf zetten de linkerhand
  bij dit bredere lijf in het midden, en dan liep de speer naar achteren tussen de benen door), aan de borst vast zodat ze
  meeleunen, en de speer door beide vuisten, kort vastgehouden (de voet bij de heup, achter de rok). De render voor het lopen
  is breder (de speer wijst ver vooruit). Twee dingen die daarbij misgingen en opgelost zijn: het armstuk bleef achter bij
  de heup als de arm naar voren ging (wat aan de arm zit, volgt nu alleen de arm), en waar de hangende arm de wapenrok had
  afgedekt, gaf het aanvullen een vlakke beige schim; daar laat het model nu zijn eigen materiaal zien, belicht. Op spelmaat
  (`uit/blender/lopen-ZW.png`): de punt schuin omhoog naar voren, buiten de benen; de speer van de generator gaat schuin
  over het lijf naar achteren (het gebrek van 21 okt).
- *Schuin voor het lijf, zoals de generator* (Marcel: "hij moet hem schuin voor zich dragen zoals in de generator file", en
  "ik heb ook het idee dat de rechter schouder uit de generator verder naar voren staat"). `bakken.py` kent nu manieren van
  dragen (`DRAGEN`, `-- <map> richting ZW draag <manier>`): het midden van de speer voor de borst, de speer schuin langs een
  vaste lijn (in ZW zo'n 45 graden), de handen om dat midden (de vuisten komen niet precies op hun doel, dus de speer ligt
  langs de lijn tussen de doelen, met de lage vuist als greep). Bij het dragen draait het bovenlijf 12 graden, de
  rechterschouder naar voren, het hoofd half terug. `lopen.cjs ZW generator gespiegeld` zet ze onder elkaar naast de
  generator (`uit/blender/lopen-ZW.png`). *generator*: dwars voor het lijf van linksonder naar rechtsboven, zoals in het vel
  (de punt in ZW naar achteren, het gebrek van 21 okt); *gespiegeld*: de punt naar voren, maar vlakker, als een gevelde
  speer. *vooruit* (de eerste poging) stak de speer ver voor hem uit.
- *Proef (a): het model met zijn eigen kleuren, als vel in het spel* (Marcel: "we proberen de proef die de andere sessie
  doorgaf"; de opdracht kwam via de sessie van de GLB: "staan en lopen in acht richtingen met de eigen gebakken kleuren,
  licht bijgesteld voor spelmaat, en in het spel naast de generator te zien"). Het plan, voor de proefplaat:
  1. *Het model:* `speerman_hd.py` zoals hij nu is (de speer, de laarzen en de schouders van vandaag), met zijn eigen
     kleuren, niet de verf van vel 01, en mat afgewerkt zoals de GLB: de materialen tijdelijk overschreven (ruwheid 0,75,
     geen bump, het staal metaal 0,7), zodat de baard echt haar blijft en het skelet loopt zoals in `bakken.py`. Smaller
     zoals bij de verf (het lijf 0,9, de voeten 0,8): toen had hij op spelmaat de breedte van de generator.
  2. *Het licht voor spelmaat,* per richting met de camera meegedraaid: een zachte zon van linksboven, een zacht licht van
     voren dat onder de helmrand komt (het gezicht moet lezen), wat feller en meer contrast; op spelmaat de donkere rand.
  3. *De bewegingen:* staan (een beeld, de speer rechtop in een hand) en lopen (acht beelden, de speer schuin voor het lijf
     zoals de generator, met de rechterschouder naar voren en wat voorover), in de acht richtingen. Wat vandaag aan het
     lopen opviel (de kleine stap, de voeten in ZW bijna over elkaar), neem ik mee: de stap iets groter.
  4. *De vellen* in de maten van nu (`beelden/beschrijving.json`: staan 44 bij 94, lopen 89 bij 91, 74 pixels van de zool
     tot de helm), als een eigen figuur, zodat de vellen van de generator (van de sessie `lokaal-dac05521`) blijven staan.
  5. *In het spel:* een paar speermannen in het proefdorp, staand en lopend, twee schermafdrukken op dezelfde plek: een met
     de vellen van de generator en een met die van het model, het tweede alleen in de browser omgezet. Niets blijvends in
     het spel zonder Marcel.
  Eerst één proefplaat: Z en ZW, staan en vier loopbeelden, groot en op spelmaat naast de generator.
- *De proefplaat van proef (a)* (Marcel: "Ja, maak de proefplaat: Z en ZW, staan en vier loopbeelden, groot en op spelmaat
  naast de generator"). `gereedschap/blender/eigen.py` (het model met zijn eigen materialen, mat gemaakt: ruwheid 0,75,
  geen bump, metaal hooguit 0,7, geen lak; het lijf met de echte baard als eigen deel aan het skelet, de kleren een mesh
  zoals in `bakken.py`; smaller met de schaal van het skelet, 0,9; het licht met de camera mee: de zon zachter, 4,0 met een
  hoek van 12 graden, licht van voren 2,0, de lucht 0,6, belichting +0,25, *Medium High Contrast*; de stap 0,38), en
  `eigen.cjs` voor de plaat (`uit/blender/eigen.png`, bewegend `eigen-Z-bewegend.png` en `eigen-ZW-bewegend.png`; acht
  minuten voor twee richtingen). Op spelmaat: staand dezelfde opbouw als de generator en het gezicht leest onder de helm;
  het beweegt zonder te flikkeren. Wat nog anders is: de kleuren bleker dan bij de generator (het geel lichter, het blauw
  grijzer), de helm bijna wit en zonder lijn, de maliën een grauwe vlek; en lopend houdt hij de speer lager en steiler dan
  de generator (de handen voor de buik, het lange eind naar beneden, in Z bijna rechtop voor het lijf), waar de generator
  hem voor de borst draagt met het lange eind omhoog.
- *De kleuren en de linkerhand* (Marcel: "Dan moeten we de kleuren iets dichterbij brengen. Ook heeft hij zijn linker hand
  niet om de speer"). De kleur: in `eigen.cjs` per beeld op spelmaat de kleur per stof (staal en maliën, het geel, het
  blauw, de rest) gelijkgetrokken met het staande beeld van de generator in die richting, met `kleurGelijk` uit
  `generator.cjs` (waarmee die zijn eigen vellen gelijktrekt; nu ook uitgevoerd). Het geel is nu goudgeel, het blauw voller,
  het leer warm bruin en de helm grijs in plaats van wit. Dat gebeurt na het renderen, op de vellen; de render uit Blender zelf
  is nog bleek. De hand: de IK zette de pols op het doel en de vuist zat verder, dus de linkerhand hing naast de speer; nu
  schuift het doel tot de vuist zelf op de lijn van de speer staat (op 0,4 en 1,4 millimeter), en beide handen zitten om de
  schacht. Marcel daarna: **"Het gaat uiteindelijk om de gebakken render uit blender."**
- *De speer los, en te ver naar beneden* (Marcel, met rode cirkels: "Gaat niet helemaal goed nog", en "De speer steekt
  verder door"). Het blad zweefde boven de schacht: het skelet heeft in `eigen.py` een ongelijke schaal (smaller), en bij
  het opnieuw ophangen van de speer gooide Blender de scheefheid weg, voor elk deel van de speer anders (elk heeft een eigen
  middelpunt). Nu hangt de speer exact (een volle matrix als parent-inverse, de geometrie in de mesh). En hij werd te ver
  naar het midden vastgehouden: het lange eind ging naar beneden. Nu kort vastgepakt (de lage hand op 15 procent van de
  voet), zodat onder de lage hand een kort eind uitsteekt en het lange eind omhoog gaat, zoals bij de generator.
- *De schaduwen* (Marcel: "En de schaduwen in het origineel zijn ook beter. Op de kleding etc.", "Dat maakt alles veel
  dieper en echter"). Een lichtproef op staan Z (`eigen.py -- <map> lichtproef`, plaat `eigen.cjs licht`,
  `uit/blender/eigen-licht.png`): een hardere zon, minder vullicht en lucht, en diepere holtes (de AO van de materialen
  niet meer alleen binnen een deel, verder en donkerder). Het verschil is klein, en op spelmaat bijna weg. De diepte van de
  generator zit niet in het licht maar in de vorm en de verf: plooien in de wapenrok (lichte en donkere banen), de ruiten
  van de mouwen met een schaduwlijn, schaduw onder de kraag en tussen arm en lijf, en een donkere schaduwkant. Onze
  wapenrok is een vlak zonder plooien, dus daar valt niets te schaduwen; en `kleurGelijk` maakt de spreiding van de
  lichtheid hoogstens zo groot als bij de generator, nooit groter, dus wat vlak is, blijft vlak.
- *De diepte en de kleur in het model* (Marcel: "1 inderdaad"). In `speerman_hd.py`: plooien in het lijf van de wapenrok
  (van de borst naar de riem dieper) en dieper in de rok, diepere ruiten in de mouwen (bolle kussens, smalle naden); het
  blauw voller, het geel en de helm lichter. In `eigen.py`: de schaduw van de materialen over de delen heen (de kraag op de
  wapenrok, de arm op het lijf), en het licht een stop donkerder, met minder vullicht en lucht en de zon meer van opzij.
  Gemeten op spelmaat (Lab per stof, tegen staan Z van de generator; in Z en ZW): het blauw, het leer en de huid op een
  of twee punten, het geel en het staal op vijf tot zeven, zonder correctie achteraf (`eigen.cjs` doet dat alleen nog met
  `--2d`).
- *De baard, de maliën en de stof* (Marcel: "De baard moet nog wat beter", "Maliënkolder ook nog wat", "Moeten meer plooien
  in zijn outfit", "En minder symmetrisch links en rechts", "In de stof"). De baard voller (60.000 haren), twee keer zo lang,
  wat krullig, dikker en grijzer gespikkeld, en de kraag voor lager, zodat hij er zoals op vel 01 overheen valt. De maliën:
  lichtere ringen met een toon per plek, een diepere voeg, en ze houden hun glans (mat maken haalde de glinstering weg die ze
  leesbaar maakt). De plooien: per plooi een golf met een eigen fase, die naar beneden verschuift (schuine plooien), links
  sterker dan rechts, en een ongelijke zoom. Marcel daarop: **"De baard ziet er fake uit"**, "Van veraf wel beter", en
  **"Kunnen we de stof texture nog wat aanpakken? Desnoods blender plugins of addons"**.
- *Echte stof en een baard als vorm* (Marcel: "Allebei"). Drie CC0-texturen van Poly Haven in
  `gereedschap/blender/texturen/` (met een `LEESMIJ.md`): grof linnen voor de wapenrok en de mouwen, jute voor de hozen, bruin
  leer voor de riem, de laarzen, de armstukken, de handschoenen en de schede. `Knopen.met_textuur` legt ze in een doos
  geprojecteerd op het model: van de kleur alleen het licht en donker (de kleur blijft die van het model), en de normal map,
  onder de bobbels die er al waren; `eigen.py` laat dat reliëf staan bij het mat maken. Op de echte maat (een tegel van
  27 cm) waren de draden kleiner dan een pixel van de HD-render; nu groter dan echt (70 cm linnen, 50 cm jute en leer), zodat
  het weefsel te zien is. De baard is een vorm over kin en kaak: de huid naar buiten gezet, onder de mond dik en wat omlaag
  over de kraag, met strengen in de verf (fijne strepen omlaag, plukken, grijze strengen) en reliëf; het echte haar nog
  alleen als een zachte rand. Gemeten op spelmaat liggen de kleuren nog op een paar punten van de generator (het licht een
  derde stop lichter, omdat het reliëf alles wat donkerder maakte). Marcel daarop: **"En zwaartekracht?"**
- *Zwaartekracht* (Marcel: "En zwaartekracht?"). De rok van de wapenrok is nu wat een wapenrok is: een voorpand en een
  achterpand, aan de zijkant open vanaf de heup, vast aan de riem, en met de stofsimulatie van Blender onder zijn eigen
  gewicht over de benen gevallen (`hangen` in `speerman_hd.py`; de eerste simulatie hing als een zak, omdat de rok toen een
  gesloten koker was). Boven de riem bolt de stof wat over en zakt door, voor meer dan opzij. Bij het lopen hangt de rok aan
  het bekken; hij valt niet per beeld opnieuw.
- *Stoffig, niet plastic, en schaduw op de helm* (Marcel: "Dit is nog wat gek" bij de baard van opzij, "kan de kleding nog
  wat meer stoffiger gerenderd worden? Het ziet er nog wat te plastic uit ofzo", en "Ook wat schaduw op de helm?"). In
  `eigen.py` per soort materiaal (`SOORTEN`): stof helemaal mat, zonder glans, met een zachte, wollige rand in het licht in
  de kleur van de stof (sheen; wit maakte de donkerblauwe hozen grijs) en het matte licht van ruwe stof (diffuse
  roughness); leer met een lichte glans; het staal glanzend. De lucht heeft een verloop (licht boven, donker onder), zodat
  de helm licht en schaduw krijgt in plaats van overal even licht. De baard loopt naar zijn rand dun uit in het gezicht (de
  afstand tot de rand over de mesh), en is van opzij geen plaat meer. Met de matte stof een kleiner stop lichter (+0,4) en
  een lichter, schoner blauw; gemeten op spelmaat liggen de kleuren per stof weer op een paar punten van de generator
  (het geel van voren wat donkerder).
- *Laarzen van leer, met een gesp* (Marcel, 24 okt: "Laarzen zijn nog niet naar mn zin, moeten leer zijn met gesp"; ze
  waren glad als klei of rubber). De schacht stond sinds het begin ondersteboven (de kegel wijd bij de enkel en smal bij
  de knie), en hing zo als een slobkous over de voet: nu smal naar de enkel, en om de hiel door tot de zool. De voet is
  één bol, langs de voet vervormd (in plakken werd hij een rups): laag bij de hiel, het hoogst op de wreef, op de bal het
  breedst, de neus laag, rond en stomp (als bol werd hij de schoen van een nar). Een zool die net uitsteekt, donker tot
  een naad; kreukels bij de enkel, meest van voren en niet recht; de omslag strak om het been met een opgerolde boord.
  Om de enkel een riem met een echte gesp van rond smeedijzer, met een pen en het eind van de riem dat eruit hangt. Het
  leer met de nerf duidelijker (de textuur met meer contrast en reliëf), lichter op de bolle delen (slijtage), en leer
  met een zachte glans (ruwheid 0,48). De voet van het lijf krijgt een masker, anders piept hij door de zool.
- *Bol, om de kuit, de speer in de vuist en een donkerdere helm* (Marcel, 24 okt: "De vorm van de laars is wel te puntig,
  ik vind het bollere van de referentie beter staan", "Materiaal is goed", bij de kuit die achter de omslag uitstak "Dat
  gaat nog niet goed ook", "Rechter hand ook niet heel goed om de speer", "Ik vind de helm ook nog te licht"). De voet
  korter, met een hoge, bolle neus die tot voorin breed blijft. De schacht, de omslag en de enkelriem volgen de vorm van
  het been (de koker van de kleren, `passend` voor de opgerolde rand) in plaats van rond te zijn: als ronde kegel met de
  gemiddelde dikte stak de kuit eruit. De speer gaat door de holte van de vuist (`vuistholte`: het midden van de lussen
  die de gekrulde middel- en ringvinger maken, bewaard in de ruimte van de pols), bij staan en bij lopen; het oude punt
  lag op de handrug. Zoeken in de mesh naar het meest omsloten punt vond een punt in de vinger: binnen of buiten het vlees
  is op de mesh van MakeHuman niet te zeggen. En bij staan stond de speer los op de plek van het bouwen, terwijl de hand
  met het binden en het smaller maken verschoof: nu zet `eigen.py` hem op de holte zoals die op het eind is. De helm
  donkerder staal (#6c6a74).
- *Echte materialen, een greep om de schacht en een skelet om mee te animeren* (Marcel, 24 okt: "kunnen we echte
  materialen gebruiken", "Moeten we het model een skelet geven? Zodat we goed kunnen animeren", en "Allebei download
  maar"; bij de vuist nog eens een rode cirkel: de toppen staken door de schacht). Van Poly Haven erbij plaatstaal met
  patina (helm, blad, gespen) en essenhout (de schacht; de nerf langs de schacht via het kenmerk `oorsprong`, want bij
  het dragen staat de mesh schuin). Het staal houdt in `eigen.py` zijn ruwheid uit de textuur: blank en mat door elkaar
  (gelijk overal oogde het als plastic, en met alleen de patina als dof lood). De greep (`greep`): een vuist van MakeHuman
  met alle kootjes even ver gekruld sluit zich tot in de palm, zonder plek voor een schacht van bijna 4 cm; nu ligt de
  schacht tegen de palm onder de knokkels, en krult elk kootje van de knokkel naar de top tot de vinger met handschoen de
  schacht raakt (zoeken naar een gat in de mesh vond telkens het binnenste van de pols). Het skelet was er al (dat van
  MakeHuman, met vingers), maar elk punt van de kleren nam de gewichten van het dichtstbijzijnde punt van het lijf: de
  laars volgt nu alleen het onderbeen en de voet (de omslag boog met de knie mee), de helm zit stijf aan het hoofd
  (`bakken.py`, `deel_van`). De benen lopen met IK in de code (`benen`): elke enkel op een doel, de dij en de knie uit de
  cosinusregel; de voet die staat schuift vlak over de grond naar achteren, de andere zwaait met een boog naar voren, bij
  het afzetten draait de voet om de bal, en het bekken zakt zo ver dat het achterste been niet gestrekt hoeft.
  Daarna, bij het lopen (Marcel: "Handen", met rode cirkels om de onderste hand): de greep is gemaakt om een staande
  schacht, en de schuine speer liep dwars door de handrug. Nu draait de pols tot de as van de vuist langs de speer ligt
  (`draag_schuin`), en die draai houdt het skelet vast in elk loopbeeld (`rig['pols.k']`). Met de IK zwaaide de dij
  verder naar voren, en kwam de knie door de rok, die stijf aan het bekken hing: de rok gaat nu vanaf halverwege tot 80
  procent met de dij aan zijn kant mee, in het midden geleidelijk. En de wapenrok gaat vlak boven de riem over op het
  bekken, zoals de riem: leunde hij voorover, dan stak de riem er rood doorheen. Op spelmaat is de helm nu bijna zwart
  naast het zilver van de generator.
- *Het lijf loopt mee* (Marcel, 24 okt, bij de eerste lopende video: "Het lijf beweegt niet, ziet er heel onnatuurlijk
  uit"; de APNG's speelden bij hem niet, nu een MP4 en een GIF, `eigen-lopen.mp4`). Alleen de benen bewogen. Nu draait
  het bekken (het onderste bot, `root`) 6 graden mee met het been dat naar voren gaat, zakt het 4 graden aan de kant van
  het zwaaiende been, en schuift het 1,8 cm over de voet die staat; de borst draait en kantelt terug, het hoofd kijkt
  recht vooruit, en hij veert 2 cm (`bekken`, de getallen bovenaan in `bakken.py`). De benen rekenen vanaf waar de heup
  nu is, draaien opzij en om hun lengte mee, zodat de voeten op hun spoor blijven, de knie vooruit wijst en de zool vlak
  blijft.
- *De armen en de speer lopen mee* (Marcel: "En de armen?", "En dus ook de speer", "Moet allemaal meebewegen"). Beide
  handen dragen de speer, dus de armen zwaaien niet, maar de speer schommelt met de pas zoals armen zwaaien (de lage,
  rechterhand naar voren met het linkerbeen, de hoge naar achteren; 1,5 cm aan de handen) en veert 0,8 cm na op het
  veren van het lijf (`speer_mee`). Speer en handen bewegen als één stuk, zodat de vuisten om de schacht blijven; de
  ellebogen volgen met de IK.
- *De steek* (Marcel: "En nu er een skelet is, kunnen we ook een steek aanval doen?"; `eigen.py -- <map> ZW steek`, naar
  `eigen-<r>-steek-<i>.png`). Acht beelden uit de wacht: de speer laag bij de rechterheup, de punt naar voren en iets
  omhoog, links voor en rechts achter, door de knieën (`WACHT`). Aanhalen (de speer 11 cm terug, de rechterschouder
  naar achteren), steken (het bekken 6 cm naar voren, de borst 14 graden gedraaid en 12 voorover, de speer 20 cm vooruit
  met gestrekte armen) en terug (`STEEK` in `bakken.py`; de benen met dezelfde IK als het lopen, `been_ik`). Aan de borst
  vast kantelde de speer mee met het voorover leunen en dook de punt naar de grond: bij de steek houdt hij zijn richting
  in de wereld en schuift hij alleen mee. In ZW wijst de speer naar de kijker, en is hij dus sterk verkort.
  Daarna (Marcel: "De steek klopt niet", "De speer moet naar voren komen. Ik wil ook de poppetjes in isometrisch zien",
  en "Die handen zijn nog niet gefixed"): met beide handen samen kwam de speer maar 20 cm vooruit, zo ver als de armen
  reiken. Nu valt hij uit: het voorste been stapt 14 cm uit, het bekken gaat 10 cm naar voren, de borst draait 18 graden
  en leunt 14 voorover, en de achterste hand duwt de speer 34 cm vooruit door de voorste hand heen, die 30 procent
  meegaat (met 15 eindigden de vuisten in elkaar, de linker als een zwevende vuist boven de schacht; met 50 reikte de
  linkerarm niet). Daarom staat de wacht dichter bij het lijf (12 cm voor de schouders) en de handen verder uit elkaar
  (40 cm). De handen: de IK zet de pols op zijn doel, niet de holte van de vuist; eenmaal goed gezet in rust draaide de
  vuist bij een andere stand van de arm van de schacht af. Nu draait in elk beeld de pols langs de speer en schuift het
  doel tot de holte op zijn plek op de schacht zit (`handen_op_speer`), bij lopen en steken; en de as waarlangs de
  speer schuift, gaat door de holtes van de vuisten, niet door de doelen van de polsen (dan schoof hij schuin langs zijn
  eigen as en zweefde de voorste vuist halverwege de steek 6 cm boven de schacht). Isometrisch: `eigen.py --
  <map> ... iso` zet de camera op 30 graden zoals de wereld (in plaats van de 15 van de generator), naar
  `eigen-<r>-iso-...png`; van bovenaf is een speer die naar de kijker wijst twee keer zo lang in beeld.
- *Polsen, armstukken en de rok als stof* (Marcel: "Die handen maken toch nog een rare knik", "Laten we de kleding
  fixen, de helm en de volledige speerman renderen daarna", en bij de steek in ZW "Arm nogsteeds niet"). De knik: met
  de kleinste draai die de vuist langs de speer legt, knikte de hand haaks op de pols, want de onderarm liep bij de
  bovenste hand bijna evenwijdig aan de speer. Nu krijgt de IK van elke arm een richtpunt voor de elleboog (van 24
  standen die waarin de pols het minst knikt, zonder dat de elleboog door het lijf gaat; `kies_ellebogen`), blijft de
  hand zo veel mogelijk in het verlengde van de onderarm (`pols_langs`), en zit de wring om de onderarm voor 80 procent
  in de twee botten van de onderarm (de IK laat die draai staan) in plaats van in de pols, waar de huid ging draaien
  als een snoepwikkel. Bij de wacht van de steek knikt de rechterpols nog zo'n 30 graden, zoals bij een echte wacht.
  Het armstuk volgt alleen de onderarm (het scheurde in latten als de pols draaide), en de kap van de handschoen ook,
  met alleen het smalle eind bij de pols mee (hij rekte uit tot een trechter). De rok is geen deel van de ene mesh
  meer: hij hangt aan de riem en valt bij elk beeld met de stofsimulatie van Blender tegen het bewegende lijf (bij het
  lopen drie rondes, zodat de stof op gang is; `rok_als_stof`, `met_stof`). Vrij verfrommelde de pand bij elke stap,
  bleef hij achter de knie haken en rolde hij zich op tot een prop; stugger, zwaarder of tegen zichzelf botsend hielp
  niet (dat laatste trok de plooien uit elkaar en de rok omhoog). Nu trekt het skelet de onderkant licht naar zijn
  vorm (`ROK_TREK`, 0,2): hij zwaait en valt, maar haakt niet meer. Alle patronen rekenen nu op de plek van elk punt toen het model af was (het
  kenmerk `oorsprong`), anders schuiven de banen en het weefsel over de stof. De helm lichter (#8c8a94): op spelmaat
  was hij zwart naast het zilver van de generator. En acht richtingen: NW, N en NO erbij.
- *De volledige speerman* (25 okt): staan, lopen en steken in de acht richtingen, isometrisch (`eigen.py -- <map> Z ZW W
  NW N NO O ZO iso`, en nog eens met `steek`; zo'n anderhalf uur op de GTX 1080 Ti), in `uit/blender/render/eigen-<r>-iso-
  <soort>-<i>.png`, met de rasters `uit/blender/eigen-acht-lopen-iso.mp4` en `eigen-acht-steek-iso.mp4` en het vel
  `eigen-acht-vel-iso.png` (alles op één schaal, de voeten op één lijn). Wat nog opvalt: de blauwe pand kreukelt bij
  het lopen nog wat aan de zijkant, en van achteren eindigt de mouw van het wambuis met een harde rand.
- *De wapenrok en de mouw van achteren* (Marcel, 25 okt, bij NO en O: "Dat klopt niet en hij loopt nog echt houterig"):
  het gele bovenstuk van de wapenrok hing als een flap over de rechterschouder, want het volgde bij de schouder de
  botten van de arm; nu alleen de romp (de wapenrok heeft geen mouwen). En de ruiten van het wambuis braken achter op de
  arm in scherven: ze werden per armbot berekend (het patroon sprong waar het ene bot het andere afloste) en rondom paste
  geen heel aantal ruiten (6,28), zodat achter op de arm een naad zat. Nu om één as per arm, met precies 6 ruiten rondom.
- *Lopen uit een echte opname* (Marcel: "hij loopt nog echt houterig", "Zijn er geen addons voor natuurlijke bewegingen",
  over Human Generator "Zou de human generator addon beter werken?", en "Cmu dan maar"). Van opzij schuifelde hij:
  kleine passen, de knieën nauwelijks omhoog, de voeten sloffend. Human Generator maakt mooiere mensen, maar geen
  bewegingen, en op spelmaat is een gezicht een paar pixels. Nu de motion capture van CMU (`beweging/`, met de
  voorwaarden in `beweging/LEESMIJ.md`: vrij te kopiëren, te veranderen en te verspreiden), gelezen door `mocap.py`:
  per bot de draai in de wereld ten opzichte van de ruststand, met de ruststand van de opname eerst gelijkgezet aan de
  onze (de opname staat met de benen twintig graden gespreid); één pas uit `35_02` (van de linkerhiel tot de
  linkerhiel, 1,1 s), op de plaats, sluitend gemaakt, en het bekken zo laag dat de laagste voet de grond raakt. Benen,
  bekken, rug en hoofd komen uit de opname; de armen houden met de IK de speer. (Een eerste poging lag plat op de grond:
  `Bone.vector` staat in de ruimte van het ouderbot.) De gerekende pas (`bekken`, `benen` in `bakken.py`) blijft als
  terugval tot Marcel de opname goedkeurt, en gaat er dan uit.
- *Lopen naar de referentie, en gestopt: de basis zit te ver van de referentie* (Marcel, 25 okt: "De loop animatie van de
  referentie is veel beter", en daarna "Nee stop maar, de basis is gewoon niet goed. We zitten te ver van de referentie
  met het 3d model", "Hoe gaan we dat verbeteren"). Het lopen van de referentie (`beelden/figuren/speerman-lopen.png`) heeft
  grote passen (van teen tot hiel zo'n 70 procent van de man; bij ons 43), duidelijke standen (in beeld 0 en 4 de benen
  wijd als een schaar, in 2 en 6 de knie omhoog), en een rustig bovenlijf met de speer stil. Laatste poging: het ritme
  uit de opname, de benen met IK op de pas van de referentie (`PAS_HALF` 0,28), de speer naar voren. Het vel van de
  referentie is niet in 3D getekend (in W wijst de speer sterk naar voren, in ZW en Z rechtsboven).
  De omtrek van de staande man naast die van de referentie, even hoog (`uit/blender/omtrek-staan-z.png`, met
  `omtrek.py` in de kladmap): de referentie is over de hele hoogte veel breder en gedrongener (schouders, armen, lijf,
  laarzen die als blokken uit elkaar staan; ons model is smal, en nog eens versmald met `BREED` 0,9); zijn helm is breed
  en plat met een grote rand laag over de ogen (de onze een hoge koepel); baard en kap zijn één donkere massa (bij ons
  glimmende maliën); de armen hangen verder van het lijf met grote bruine handschoenen; en hij is donkerder en
  verzadigder, met donkere zijkanten.
  Plan om te verbeteren, in deze volgorde: (1) de omtrek eerst: per rij de breedte van de referentie en van het model
  meten in Z, ZW en W, en de maten van het model (lijf, armen, helm, laarzen, `BREED`) bijstellen tot de omtrekken
  samenvallen; (2) dan licht en kleur per deel op spelmaat (zoals de kleurmeting van 24 okt), met de kap donker; (3) dan
  de bewegingen naar de standen van de referentie, beeld voor beeld.
- *De omtrek gemeten* (Marcel, 25 okt: "Begin maar met de omtrek"; `omtrek.py`, met de man even hoog als op het vel van
  het spel en de voeten op één lijn, zonder de speer). De omtrek valt al voor 84 procent samen (Z 0,83, ZW 0,86, W 0,83):
  op het oog leek het verschil groter, maar dat kwam doordat de speer en de helm mee telden. Bijgesteld waar het meer dan
  twee pixels van het vel scheelde: de rechterarm met de speer verder van het lijf (`arm` 0,4; in Z links 5 pixels te
  smal), de voeten 8 graden naar buiten in plaats van 14 en de dijen 2 graden naar binnen, de laarzen 3 cm naar achteren
  (van opzij te ver naar voren), wijdere dijen en kuiten, en een diepere borst. Daarna 0,83: wat overblijft, een tot drie
  pixels, valt binnen wat de stof en het uitlijnen per keer verschuiven. Het verschil zit dus vooral binnen de omtrek, op
  spelmaat naast elkaar (`uit/blender/omtrek-spelmaat.png`): de helm is bij de referentie helder zilver met een bredere
  rand en een lagere koepel (bij ons donkergrijs en hoger; Marcel vond hem eerder te licht), de kap en de baard zijn een
  donkere massa (bij ons lichtgrijze maliën en een licht, oranje gezicht), de laarzen lichtbruin en breed met grote
  omslagen, en het geheel helderder en verzadigder.
- *Helm, kap, laarzen en kleuren naar de referentie* (Marcel: "Ja doe dat"). `omtrek.py ... kleur` meet per strook de
  gemiddelde kleur (Lab) op spelmaat, de referentie en het model elk binnen zijn eigen lijf. Eerst was het model 4 tot
  13 punten donkerder en veel minder geel (b 10 tot 24 lager), de helm 12 donkerder en geler, de laarzen donkerder en
  minder warm. Nu: de helm helder blauwig zilver (#a0a6bc, de patina zachter), de kap van maliën en de baard donker (de
  baard bijna zwart, minder grijze strengen), het geel en het blauw van de wapenrok voller (#ffbc12, #2258c8), de gele
  baan naar zijn rechterkant en breed zoals op het vel van het spel (in Z links in beeld; op de rok bijna even breed),
  het wambuis warmer (#a05824), de laarzen lichter en warmer bruin met een hogere, wijdere omslag, en het geheel iets
  helderder belicht (`belichting` 0,6). Per strook nu meestal binnen een paar punten (`uit/blender/omtrek-spelmaat-kleur.png`);
  de benen nog 4 tot 8 te licht, en in W de schouders minder geel (bij de referentie zie je daar de wapenrok, bij ons
  valt de mouw ervoor). De speer is nog dikker en donkerder dan die van de referentie, met een kleiner blad.
- *De rand, de speer, en de helm van achteren* (Marcel: "Ja fix dat eerst, en de referentie heeft ook niet zomaar zwarte
  lijn eromheen toch?", en "De helm is ook wat anders van vorm aan de achterzijde"). De rand: het vel van het spel heeft
  geen lijn om de figuur, maar zijn eigen randpixels zijn donkerder, het meest aan de schaduwkant (gemeten op het hele
  vel: een randpixel is links 0,92 keer zo licht als twee pixels naar binnen, boven 0,77, onder 0,60, rechts 0,68).
  `omlijn` in `lopen.cjs` legde er een bijna zwarte lijn van een pixel omheen; nu maakt het de eigen randpixels per kant
  donkerder (`RAND`), met het verschil tussen het vel en het model zonder rand. De speer: langer (1,32 keer de man, de
  punt zo ver boven de helm als bij de referentie), dunner, roodbruin, met een groter (`BLAD` 1,4) en helder blad, dat
  per richting met zijn brede kant naar de camera draait (`blad_naar_camera` in `eigen.py`, zoals een tekenaar het per
  richting zet: anders was het in de meeste richtingen een streepje). De helm: wat wijder, de rand breder (1,45 keer de
  koepel), lager over de ogen, en achteraan lager over het achterhoofd en de nek; de maliënkraag een kraag om de hals in
  plaats van een cape over de schouders (bij de referentie loopt de wapenrok door tot de nek), en de rug van de
  wapenrok gevierendeeld zoals op het vel. Vergelijking in de acht richtingen: `uit/blender/omtrek-spelmaat-acht.png`.
  Wat er nog van achteren scheelt: bij de referentie valt de kap breed en donker over de schouders, en is de helm van
  achteren ronder en lager.
- *Richtingen, gezicht, mouwen en kap* (Marcel, 25 okt, met rode cirkels: "Het gezicht lijkt op de referentie met wat
  verder onder de helm uit te komen", "bij de referentie zie je hier een mooiere overgang in het materiaal met meer
  details en schaduwen / kleurverschillen", "Bij NO zie je ook de aansluiting tussen de kleding minder goed", "De
  richtingen lijken ook wat af te wijken", "De arm ZO staat ook wat anders"). De richtingen gemeten: elke richting om
  de vijf graden gedraaid, en per richting de stand waarin de omtrek het best met het vel samenvalt. Het vel staat niet om
  de 45 graden: Z 5, ZW 40, W 65 (25 graden meer naar de kijker), NW 155, N 185, NO -145; en O en ZO zijn er gespiegelde
  westkanten (W op 65 en ZW op 25), met de speer in de linkerhand. Dat verklaart de arm in ZO. `eigen.py` rendert nu zo
  (`BEELD`), gespiegeld met het licht meegespiegeld, zodat het na het omkeren van linksboven blijft komen; bij het zoeken
  ging de omtrek van gemiddeld 0,79 naar 0,83, en met de bredere kap en de verschoven helm erbij meet hij 0,80. Het gezicht: de helm 2,2 cm naar achteren op het hoofd (`HELM_ACHTER`), de rand van
  voren hoger en smaller (`HELM_RAND_HOOGTE` 0,05, `HELM_VOOR` 0,6) en achteraan lager (`HELM_ZAK` 2): de ogen en het
  voorhoofd komen onder de rand uit. De mouwen: een eigen materiaal (`mat_wambuis`), donkerder bruin met donkere naden
  tussen de ruiten (het kenmerk `kussen` uit `wambuis`), zodat ze op spelmaat geruit lezen in plaats van vlak oranje. De
  kap weer breed en donker over de schouders, waar hij de overgang van de wapenrok naar de mouwen bedekt.
- *Rechter op, en vollere armen* (Marcel, 25 okt: "Referentie lijkt ook wat meer overeind te staan. Iets naar voren tov
  wat we hebben", en "Armen zijn bij de referentie ook wat bulkier"). Gemeten met het midden van elke strook ten opzichte
  van de voeten: in W en ZW stond het hoofd bij de referentie 1 à 2 pixels voor de voeten, bij ons 1 erachter (4 à 5 cm),
  door de holle rug (`borst` 7: de bovenrug achterover). Nu leunt de bovenrug 4 graden voorover (`borst` -4); het hoofd
  staat nu boven de voeten, nog zo'n pixel achter dat van de referentie. De armen: MakeHuman dikker (bovenarm 1,
  onderarm 0,9), de watten van het wambuis dikker (1,2 tot 4,6 cm in plaats van 0,8 tot 3), en de linkerarm wat verder
  van het lijf; in Z waren de schouders aan elke kant 3 à 4 pixels te smal. De omtrek valt gemiddeld voor 0,82 samen
  (was 0,80).
- *De wapenrok over de schouders* (Marcel, 25 okt: "Schouders lijken nog niet aan te sluiten. Bij de referentie lijkt de
  kleding over de schouder heen te lopen", "Snap je wat ik bedoel"). De wapenrok hield op aan de rand van de romp en de
  mouw liep door tot in de kap, met een harde naad (van achteren het best te zien). Nu valt over elke schouder een stuk
  van dezelfde stof (`schouderstukken`), als een poncho: van boven op de schouder langs de bovenarm 7 cm naar beneden,
  naar onderen wat wijder, en de mouw komt eronder uit; aan het skelet zoals de mouw. Met 11 cm leek het korte mouwen
  van een T-shirt. Daarna (Marcel, bij ZW: "Is te dik"): het stuk 5 cm lang en strak over de mouw (2 tot 7 mm), en de
  watten van het wambuis bovenaan de arm dunner (45 procent bij de schouder, vol op 14 cm), zodat de schouder rond
  verloopt in plaats van een blok te worden.
- *ZW: het hoofd, de armen, de speerhand* (Marcel omcirkelde ZW in zijn geheel). Naast elkaar: bij het vel kijkt hij naar
  links en omlaag, de neus in profiel, bij ons recht in de camera; bij ons waren de armen lang (de handschoen tot over
  de dij, bij het vel bij de heup) en stond de speerarm ver uit, met de hand laag. Nu: het hoofd 20 graden naar zijn
  rechterkant (de speer) en 10 omlaag (`kijk`), de onderarmen korter (`armlengte` 0,85, de pols zonder de schaal van de
  arm), de speerarm dichter bij het lijf (`arm` 0,3) en de speerhand op borsthoogte. In ZW viel de omtrek van 0,82 naar
  0,87, gemiddeld 0,83 (`uit/blender/omtrek-zw-naast.png`). Nog anders in ZW: bij ons hangt de linkerhand nog wat lager,
  zie je meer van de donkere broek, en zijn de laarzen minder grof.
- *Helm, schouder, armstukken, laarzen, gezicht, speer, vuist en schaduw* (Marcel, 25 okt, bij ZW: "De helm past nog niet
  goed", "De schouder mist de overloop van het geel / goud", "De bracers verschillen nog", "De schoenen lijken wel dunne
  dingetjes. De referentie is voller, robuuster, echte boots voor een soldaat", "Het gezicht is heel onduidelijk", "Speer
  kop is ook onduidelijk, de helm is ongelijk. De hand rondom de speer die hem vasthoudt is onduidelijk. De schaduwen op
  zijn kleed"). De helm dieper op het hoofd (`HELM_RAND_HOOGTE` 0,036) en de rand weer gelijk rondom (`HELM_VOOR` 0,
  `HELM_ZAK` 0,5: smaller voor en diep zakkend achter maakten hem scheef). Over de schouder een gouden zoom (de
  onderrand van het schouderstuk, `wapenrok-goud`). De armstukken compacter en de randen donker. De laarzen vol: de
  schacht 2 cm om het been, de voet breder, langer en hoger, de rand hoger, de omslag in de kleur van de laars (geen
  lichte band). Het gezicht: donkere oogkassen in de huid op de plek van de ogen (`mat_huid(rig)`) en zwaardere
  wenkbrauwen. Het speerblad een ruit met een diepe middenrib, lichter staal dat half spiegelt: een lichte en een donkere
  helft. De handschoen donker, zodat de vuist loskomt van de schacht. De wapenrok dieper geplooid met meer schaduw in de
  plooien, minder vullicht (`vul` 0,65), en de riem 2 cm lager. De omtrek valt gemiddeld voor 0,84 samen.
- *Het hemd zakt niet meer af* (Marcel, bij ZW: "Lijkt alsof zijn hemd afzakt nog"). Het losse stuk om de bovenarm hing
  schuin over de arm als een afzakkende kraag; het is eruit (`schouderstukken`). Nu loopt de wapenrok zelf boven de
  oksel over het binnenste deel van de schouder (de koker raakt daar ook de top van de mouw, tot het schoudergewricht)
  en keert hij bij het armsgat terug naar de romp; de buitenkant van de schouder is de ronde, bruine mouw, zoals op het
  vel in ZW. Tot de buitenkant van de schouder werd het een breed, plat juk. De gouden rand: boven op de schouder (boven
  de oksel, opzij); waar de stof de mouw raakt gaf losse gele vlekken in het blauw (de arm hangt ook voor de borst).
  Daarna (Marcel: "Maar nu missen we het gele bandje / randje of overgang", "Ja doe maar"): de rand is een eigen deel
  geworden (`armsgat_zoom`), een gouden koord van 7 mm om elk armsgat, in een staand vlak iets buiten het
  schoudergewricht (`ZOOM_UIT` 1,12; op 0,97 lag het als een lijn midden op de borst), per hoek op de buitenkant van
  wapenrok, mouw en lijf; aan het skelet zoals de wapenrok. Op spelmaat een smalle gouden rand tussen het blauw en de
  mouw, in alle richtingen. Daarna (Marcel: "De helm steekt aan achterkant te ver uit, wat beter verdelen"): de helm 1 cm naar
  achteren op het hoofd in plaats van 2,2 (`HELM_ACHTER`); het gezicht blijft eronder zichtbaar. En (Marcel: "de bovenkant van de laarzen wat te groot, lijken nu grote ringen", en "de arm van de
  referentie lijkt verder naar voren gedraaid dan wat wij hebben. Staat net iets meer westelijker"): de omslag lager
  (4 cm in plaats van 5,8) en strakker om de laars, en de linkerarm naar voren met de onderarm gebogen, zodat de hand
  voor het lijf hangt zoals op het vel in W. (Met de hand nog verder naar voren raakte de stof van de rok in de knoop
  met de arm, en vond de schede aan de riem geen plek meer.) Daarna (Marcel: "Arm toch nog verder naar voren. Ook het gezicht in
  Zuid is onduidelijk", en "De ring om de laars is mij nog steeds te dik"): de linkerhand verder naar voren (de schede
  valt nu terug op een vaste plek als de meting mist); de omslag van de laars een dun randje (2 tot 4 mm, de rol 2,8 mm);
  het gezicht: het hoofd recht vooruit (`kijk` -12, 0: 10 graden omlaag verborg de ogen onder de rand), de rand iets hoger
  (`HELM_RAND_HOOGTE` 0,048), de oogkassen kleiner en lichter, de baard lager op de wangen, de maliënkap wijder open
  (82 graden), en de huid lichter (helder perzik, zoals het vel). Het gezicht leest nu, maar is nog smaller en wat
  donkerder dan bij de referentie (L 5 lager). En (Marcel: "Speer is ook te dun", "Lijkt wel saté prikker", en "Schoenen staan
  niet op dezelfde manier"): de schacht 2,2 cm dik (was 1,3; op spelmaat nu twee pixels zoals het vel), de koker en het
  koord mee, en de greep om de dikkere schacht; de voeten per kant naar buiten zoals op het vel (de rechter 45 graden,
  de linker 28: van voren zie je de lengte van de voet schuin naar buiten) en de stand iets wijder (`benen_in` -2).
- *De laarzen opnieuw, in één keer naar het vel, en de linkerarm in een boog* (Marcel: "Aub die boots man, meer zoals de
  referentie", "Hey wordt steeds gekker", "En de arm aan de rechterkant", "Loopt ook anders"). Met steeds een klein stapje
  werd het rommeliger (de voeten op 45 graden naar buiten maakten het gekker), dus nu in één keer, uit de vergelijking
  stuk voor stuk: de laars korter, tot halverwege de kuit (0,2 van de man), met de hozen erboven in blauw (#26357a, eerst
  bijna zwart); warm, licht tanbruin (#d07a3c) en dof (een eigen soort `laars` in `eigen.py`: de glans gaf grijze plekken);
  de voet langer en breder (een grove soldatenlaars); de voeten weer gematigd naar buiten (rechts 24, links 12 graden), de
  stand recht. De linkerarm (rechts in beeld in Z) in een boog naar buiten, de elleboog uit en de hand naast de heup en
  naar voren, zoals de lijn van de arm op het vel. Daarna (Marcel: "Maar die laarzen zijn nog steeds te groot en lomp"): de maat
  van de laars in drie getallen bovenaan (`LAARS_OM` 1,2 cm om het been, `LAARS_BREDER` 2,2 cm, `LAARS_LANGER` 4 cm), op het
  vel gemeten; de strook laarzen scheelt nu meestal 0 tot 2 pixels.

**De stand "oké" (25 okt).** Marcel: "Deze als staat 'oké' noteren en dan de verschillen aanpakken". De staande speerman
van commit df35dbbd is het ijkpunt: in git het label `speerman-oke-25okt` (`git show speerman-oke-25okt`, of een losse
kopie met `git worktree add`), en de renders in de acht richtingen met de vergelijking in
`uit/blender/staat-oke-25okt/`. Wat hierna verandert, wordt daarmee vergeleken; wordt het slechter, dan gaat het terug.

**Analyse tot op de pixel (25 okt).** Marcel: "Maak nu eens een goed analyse tussen de referentie en ons model. Zoek in
detail uit waar de verschillen zitten. Tot op de laatste pixel." Gereedschap: `gereedschap/blender/vergelijk.py` (per
richting de referentie en het model op spelmaat, uitgelijnd op de beste overlap van de omtrek, met kaarten van de omtrek,
het kleurverschil per pixel en licht en donker, en per strook de breedte en de kleur; naar `uit/blender/vergelijk-acht.png`)
en `palet.py` (per materiaal het lichtbereik, licht, midden en schaduw, over alle richtingen samen). Op de stand van 25 okt
(de staande man, halve maat gerenderd). Wat eruit komt, het grootste eerst:
- *De bruinen (mouwen, laarzen, leer; de meeste pixels van de man)*: bij het vel warm roodbruin met sterke, goudgele
  lichten (licht L46 a21 b50, midden L28 a18 b21); bij ons donkerder, minder rood en zonder die lichten (licht L35 a27 b34,
  midden L23 a8 b30). De mouwen lezen daardoor als vlak oranjebruin, niet als glanzend gewatteerd leer. En er zijn bij ons
  een kwart minder bruine pixels: een deel valt in de schaduw weg naar olijfkleurig.
- *Het geel van de wapenrok*: bij het vel vlak en fel (L70 tot 76, verzadigd); bij ons met een veel groter lichtbereik
  (L63 tot 78) en in de schaduw modderig olijf (de 772 pixels "anders" bij ons, tegen 173 bij het vel, zijn bijna allemaal
  geel in de schaduw). Het vel schaduwt geel nauwelijks.
- *Het grijs (de kap, de baard, de armstukken)*: bij het vel koel blauwgrijs (b -11), bij ons warm bruingrijs (b +8 tot
  +10) en donkerder (midden L23 tegen 29).
- *Het staal (helm, blad)*: bij het vel lichter en koeler (licht L80, midden L65, blauwig); bij ons licht L67, midden L55
  en in het midden geelachtig (b +9).
- *Het gezicht*: bij het vel 117 pixels huid, bij ons 44 (38 procent). De kleur van de huid klopt (L57 tot 71), maar er
  is te weinig van te zien: rand, baard en kap nemen het gezicht in.
- *De speer per richting*: in Z staat de speer bij het vel zo'n 4 pixels verder naar buiten (bij ons dichter bij het
  lijf; ook de schouder aan die kant is 5 pixels smaller), in ZW 2, en in W staat hij juist minder ver naar voren. De
  speerhand moet meer opzij en minder naar voren.
- *NW is op het vel gespiegeld*: in NW houdt de man de speer links (in zijn linkerhand), zoals in NO maar gespiegeld, net
  als O en ZO gespiegelde westkanten zijn. Ons NW is ongespiegeld, met de speer rechts; daardoor scheelt de strook riem in
  NW 35 en de rok 26 (de kwartieren van de wapenrok staan andersom).
- *De voeten*: de rechtervoet staat te ver naar buiten (in Z 4 pixels, in ZO 6,6 pixels buiten de omtrek van het vel).
- *Kleine dingen*: de speer heeft op het vel een donkere, onderbroken rand langs de schacht; de handschoenen zijn bij het
  vel donkerbruin, bij ons grijzig licht; aan de riem hangen op het vel in Z een tas en de schede duidelijk voor het lijf.
- *Wat klopt*: de omtrek valt in de meeste richtingen voor 0,80 tot 0,85 samen, de breedte per strook scheelt meestal
  0 tot 2 pixels, het blauw van de wapenrok en de hozen ligt in hetzelfde bereik (L10 tot 32), de huid heeft de goede
  kleur, en de helm, de laarzen en de rok hebben de goede maat.

**De verschillen aangepakt (25 okt).** Op de stand oké, gemeten met `vergelijk.py` (nu ook het kleurverschil per pixel,
per richting en gemiddeld) en `palet.py` (nu eerst per vlak). Het kleurverschil per pixel ging gemiddeld van 27,3 naar
23,9, in elke richting omlaag; de omtrek (`omtrek.py`, gemiddeld) van 0,79 naar 0,84. Renders en het vel met drie rijen
(het vel van het spel, oké, nu): `uit/blender/staat-kleur-25okt/vel-oke-nu.png`. Wat er veranderde, en waarom:
- *Per vlak meten, niet per kleurgroep*: de groep "grijs" van het vel bevatte ook de schaduw van de helm, en zei daardoor
  dat kap en armstuk koel blauwgrijs moesten. Per vlak (een rechthoek per deel op Z, `palet.VLAK`) zijn ze warm
  grijsbruin (de kap L40 a5 b9), en was de helm al gelijk (L46). Die stap uit de analyse was fout: terug, en de kap
  lichter (`mat_malien`).
- *Het patroon van de wapenrok per richting*: het vel is per richting getekend, niet één lijf; in NO ligt het geel op de
  rug aan de andere kant dan in N. Eerst keerde `BEELD` het patroon om in NO en NW (NO van 43,5 naar 24,5); Marcel wilde
  dat niet ("de wapenrok moet inderdaad overal gelijk zijn"): zie hieronder, "Eén wapenrok voor alle richtingen".
- *NW gespiegeld*, een gespiegelde NO zoals O en ZO gespiegelde westkanten zijn: de omtrek in NW van 0,77 naar 0,84.
- *De wapenrok gloeit wat na* (`GEEL_GLOED` 0,12): het geel blijft in de schaduw oranje in plaats van olijf (geel boven
  L57 naar 73, het vel 71), en de blauwe rok zakt minder weg (L15 naar 17, het vel 21). Het geel iets dieper (`#f0a812`).
- *De mouwen* roodbruin met een zacht licht op de kussens (L23 a20 b19, het vel L24 a16 b17; was b24). Een eerste poging
  met fel goudgeel licht werd oranje: het felle licht van de groep "bruin" kwam van de laarzen, niet van de mouwen.
- *De riem* lichter en 7 cm hoog met een grotere gesp (op het vel 3 pixels, met een gesp van 3 bij 2); de hozen iets
  lichter.
- *De speerhand* verder opzij (`arm` 0,4, de onderarm minder naar voren): Z van 0,80 naar 0,86.
- *De rechtervoet* minder naar buiten (`voeten` R 12): ZO van 0,67 naar 0,86.
- *Handschoenen en armstukken* dof, zonder glans (in `eigen.py` bij `LAARS`); de baard iets lager op de wangen.
- *Wat nog scheelt*: de helm een tikje licht (L51 tegen 46), de schaduwkant van de kap te licht (L28 tegen 19), de hozen
  te donker (L7 tegen 12); de schubben op de mouwen zijn scherper dan het gemêleerde van het vel; de speer heeft geen
  onderbroken donkere rand.

**Eén wapenrok voor alle richtingen (25 okt).** Marcel, bij NW omcirkeld: "dit gaat niet goed nog", en "de wapenrok moet
inderdaad overal gelijk zijn". Dus geen patroon per richting meer, maar één lijf dat over de acht richtingen samen het best
past. Gereedschap: de hoekpas (`eigen.py ... staan hoek`: elke pixel van de wapenrok krijgt de plek waar hij gemaakt is als
kleur) en `patroon.py`, dat per vak van 10 graden rond het lijf telt hoe vaak het vel daar geel of blauw is, boven en onder
de riem, per richting. Wat eruit kwam:
- *Voor* (Z, ZW, ZO, W, O) is het vel eenduidig: een gele baan van de kraag tot de zoom, wat naar zijn rechterkant (van -60
  tot +15 graden), de rest blauw. Zo was het al.
- *De rok op de rug*: in N, NO en NW samen een gele baan in het midden (van 140 tot -125 graden), de zijkanten blauw. Het
  oude patroon had daar gevierendeeld, met het geel op één helft.
- *De rug boven de riem* spreekt zichzelf tegen: N heeft het geel links (zijn linkerkant), NO en NW rechts. Twee
  richtingen tegen één: zijn rechterhelft geel. Daarmee is boven de wapenrok in twee helften gedeeld, voor en achter:
  rechts geel, links blauw.
- Hoeveel pixels van de wapenrok de goede kleur hebben, over alle richtingen: het oude patroon overal gelijk 67 procent,
  omgekeerd in NO en NW 82, het nieuwe 83 (Z 95, ZW 88, W 79, NW 97, N 55, NO 92, O 84, ZO 81). Alleen N verliest (van 77
  naar 55): daar staat de bovenkant van de rug nu andersom dan op het vel.
- Verder in deze ronde: de kap in de rugaanzichten was een lichte, bobbelige bult (per vlak in N en NW L28 tot 40 tegen 17
  tot 34 op het vel): donkerder en doffer. De helm een tikje donkerder (L47, het vel 46), de hozen lichter (L11 tegen 12),
  de naden van de mouwen zachter en de mouwen meer gevlekt, en de schacht van de speer gloeit wat na, zodat zijn
  schaduwkant geen doorlopende zwarte rand meer is.
- Samen, tegen de stand oké: het kleurverschil per pixel van 27,3 naar 23,4 (Z 20,2  ZW 23,3  W 26,3  NW 18,3  N 33,7
  NO 21,6  O 22,2  ZO 21,9), de omtrek van 0,79 naar 0,84. Renders en het vel met het vel, oké en nu:
  `uit/blender/staat-een-lijf-25okt/`.

**De linkerarm naar voren (25 okt).** Marcel, met een streep door W: "De armen van de referentie staan verder naar voren
gedraaid", "West gaat het dan vooral over". Op het vel hangt de arm aan onze kant (zijn linker, zonder speer) in W midden
op de zij, de onderarm schuin naar voren en de hand voor de buik op riemhoogte; bij ons hing hij aan de achterkant van het
lijf, recht omlaag, de hand bij de dij. Geprobeerd (W, ZW en Z, halve maat):
- *W meer in profiel* (75 en 85 graden in plaats van 65): de arm komt meer in het midden, maar de omtrek valt van 0,84
  naar 0,81 en 0,78, en het kleurverschil wordt groter. W blijft 65.
- *Het bovenlijf gedraaid*, de linkerschouder naar voren (10 en 20 graden, `ARM_VOOR['draai']`): de mouw schuift wat naar
  voren, maar ZW wordt slechter (kleur 23,3 naar 26,2). Niet gebruikt.
- *De onderarm naar voren* alleen: de hand komt voor de buik, maar de mouw blijft achteraan.
- *Sleutelbeen en schouder naar voren, de bovenarm recht omlaag en de onderarm naar voren* (`ARM_VOOR`): de voorkant van
  de mouw in W scheelt nog 1,3 pixel met het vel in plaats van 2,7, en de hand zit voor de buik zoals op het vel. Dat is
  het geworden. Een onderarm wat steiler (45 in plaats van 32 graden onder de horizon) gaf hetzelfde.
- Het kleurverschil per pixel gaat over alle richtingen samen wel iets omhoog, van 23,4 naar 24,1 (W 26,3 naar 26,9,
  O 22,2 naar 24,8, ZW 23,3 naar 25,3; Z iets omlaag): die maat telt elke pixel van de hand en de mouw die een paar
  pixels anders ligt. De omtrek gemiddeld 0,83. Renders, het vel met het vel, oké en nu, en W, O, ZW en Z met de vorige
  stand: `uit/blender/staat-arm-25okt/`.

**In het spel (26 okt).** Marcel: "kun je nu eens een animatie maken in game?". Staan en lopen uit `eigen.py` (de stand
hierboven, halve maat; het lopen met het ritme uit de opname en de pas van de referentie, de speer schuin voor het lijf,
`DRAGEN['generator']`) tot vellen voor het spel met `spelvel.py`, in de cellen van de generator, en in de browser aan de
speermannen van de wacht in de demo gegeven, zonder de vellen van de generator te raken (`ontwerp/gereedschap.md`). Een
rondje door de acht richtingen, opgenomen op zoom 2: `uit/blender/spel/speerman3d-in-het-spel.mp4`. Wat opviel: hij is op
spelmaat iets kleiner en smaller dan de dorpelingen van de generator ernaast; in Z draagt hij de speer zoals de generator,
in W wijst de punt bij ons naar achteren en bij de generator naar voren (het vel van de generator is daar niet in 3D
getekend, hierboven).
Marcel: "hij loopt nog wat te horkig". Naast het lopen van de generator (`uit/blender/spel/lopen-generator-model.gif`):
de generator loopt rechtop, de handen laag (de speer schuin voor de buik, de armen ontspannen langs het lijf), en de
romp blijft stil. Bij ons hangt hij voorover, de schouders hoog en het hoofd ertussen, de ellebogen wijd met beide handen
op borsthoogte om de speer, en de dikke mouwen maken daar één bult van; in W ook kortere passen. Het sleutelbeen en de
schouder naar voren (`ARM_VOOR`, voor de staande man in W) maken het lopen nog krommer.
Daarna: "bij de onze lijkt het alsof hij zn nek te ver naar achter zet", en "de referentie is mooier kwa beweging". De
referentie houdt het bovenlijf rechtop en stil, het hoofd boven de borst; alleen de benen bewegen (twee keer wijd als een
schaar, twee keer bij elkaar). Bij ons zette de opname (`mocap.py`) rug, nek en hoofd zoals de proefpersoon ze hield:
voorover, de nek naar achteren. Nu krijgt de rug nog 30 procent van de opname en blijven nek en hoofd in de staande houding
(`OPNAME_RUG`, `OPNAME_HOOFD` in `bakken.py`; `mocap.zet` met `rug` en `hoofd`); bekken en benen blijven uit de opname,
met de pas van de referentie. Geprobeerd en niet gebruikt: de handen lager en de punt meer naar voren (de speer werd veel
vlakker dan bij de generator, en verdween in W achter het lijf), en de ellebogen naar binnen (de speer ook vlakker, en de
linkerpols moest 77 graden wringen). Op spelmaat naast de generator: `uit/blender/spel/lopen-nek.gif`.
Daarna: "hij loopt een beetje als 'dwerg'; laat ik het zo zeggen: 'ongelukkig'". Gemeten: lopend was hij 17 tot 25
procent korter dan staand, de generator is lopend even lang of langer (100 tot 106 procent). Ons model heeft korte benen
(`'been'` 0,72; de heup op 0,49 m, het hoofd op 1,09 m), en met de pas van de referentie (de halve pas 0,63 maal het been,
net als op het vel) zakte het bekken het hele rondje 10 cm: de knieën 70 tot 120 graden gebogen, ook van het been waar
hij op staat, en de voeten 30 cm uit elkaar. De tekenaar van de referentie rekt de benen in de wijde stand op in plaats
van het lijf te laten zakken. Nu ook zo (`BEKKEN_ZAKT` 0,15, `BEEN_REIK` 0,99, `SPOOR` 0,6 in `bakken.py`): het bekken
zakt nog 1,5 cm, dij en onderbeen rekken waar het been te kort is (de voet en de laars niet), de knie van het standbeen
staat op zo'n 17 graden, de voeten 18 cm uit elkaar, en hij is lopend 97 tot 101 procent zo lang als staand.
In het spel (`uit/blender/spel/speerman3d-in-het-spel-3.mp4`), Marcel: "Ja dit is al heel veel beter zo!"

**Geraakt worden (26 okt, voorstel in woorden).** Marcel: "We hebben ook een 'hit' animatie nodig bij soldaten. Waarin je
ziet dat ze geraakt worden." Het spel heeft het al: bij elke klap speelt een figuur eenmalig zijn houding `geraakt`, als
hij die heeft (`js/sprites.js`, bij "Eenmalige houdingen"), met de rode flits erover (`js/tekenen.js`); de wolf, het
skelet en de kobold hebben er een (3 beelden, 12 per seconde, 0,25 s). De speerman heeft er nog geen, ook die van de
generator niet. Voorstel voor het model, in dezelfde maat (3 beelden, 12 per seconde, niet herhalen), altijd naar achteren
ten opzichte van waar hij kijkt (hij kijkt naar wie hem slaat):
- *Beeld 0, de klap*: hij schokt achteruit, het bovenlijf 12 graden achterover vanuit de heupen, het hoofd erachteraan,
  de schouders op; de speer blijft in beide handen, de punt zwiept wat omhoog.
- *Beeld 1, het verst*: 18 graden achterover, de voorste voet schuift een halve voet terug, de knieën wat door.
- *Beeld 2, terug*: nog 6 graden achterover, op weg naar staan; daarna neemt het spel zelf staan of lopen weer op.
Marcel: "Geraakt worden is akkoord". Gebouwd als `geraakt` in `bakken.py` (de getallen in `GERAAKT`), met `eigen.py ...
geraakt` (drie beelden vanuit staan) en in `spelvel.py` een eigen cel (89 bij 110, de speer past erin). De proefplaat in
Z, ZW, W en N, groot en op spelmaat: `uit/blender/spel/geraakt-proef.png`. Op spelmaat is het achterover gaan klein maar
te zien (vooral in W, het hoofd en de speer naar achteren); in het spel komt de rode flits erover.
Marcel: "het geraakt worden is oké".
Daarna in acht richtingen, met het lopen (P2) opnieuw, als vellen voor het spel (`speerman3d-geraakt.png` in een eigen cel,
`spelvel.py`). In het spel een gevecht opnemen lukte niet: de wacht van de demo vecht nog niet (`opmerkingen.md`), en
uitval en flits met de hand zetten gaf een nachtbeeld met regen achter het kampvuur. Op spelmaat, staan, de steek en
geraakt achter elkaar: `uit/blender/spel/steek-en-geraakt.gif`. Daarna toch een echt gevecht: de wacht vecht wel (dat
klopte niet: de wolven stonden waar geen route naartoe was, `opmerkingen.md`). Drie rovers (18 leven) op open grond naast de
wacht; de mannen kozen ze zelf. Onze speerman stak drie keer, de rovers vielen; geraakt werd hij deze keer niet.
`uit/blender/spel/gevecht-in-het-spel.mp4` (en `-traag`, half zo snel). Let op bij een proef in de browser: zet de vellen
vóór er een speerman op de kaart staat, na het herladen van de pagina; een figuur die al geladen is, laadt geen nieuwe paden.

**Sterven (26 okt).** Marcel: "Ik wil bij het sterven dat hij op zn knieën valt en dan zijn hoofd naar de grond laat vallen
op zn gezicht". Het spel speelt `sterven` eenmalig af en houdt het laatste beeld vast (`js/sprites.js`); de generator heeft
7 beelden, 8 per seconde. Voor het model in 7 beelden, vanuit staan: (0) de klap, wat achterover, de speer glijdt uit de
hand; (1) de knieën knikken; (2) op zijn knieën, rechtop, het hoofd hangt, de speer valt naast hem; (3) en (4) het
bovenlijf valt vanuit de heupen voorover; (5) het gezicht op de grond, de knieën nog gebogen; (6) zo blijft hij liggen.
Gebouwd als `sterven` in `bakken.py` (de getallen in `STERVEN`; `eigen.py ... sterven`). Een fout onderweg: het bekken
draaide niet mee, omdat ik de stand van het bot las vóór Blender de draai had bijgewerkt (`pb.matrix` zette hem terug);
nu eerst schuiven, dan draaien. De speer valt opzij, naar zijn rechterkant: naar achteren leek hij van voren rechtop te
staan.
Marcel: "Hij moet een beetje plat komen te liggen nu is het meer een propje", en "er lijken 'onderdelen' van het poppetje
te ontbreken". Het laatste: het beeld was zo smal als bij staan, en wat languit lag of opzij viel, viel eruit; nu breder
(zoals het lopen). Het eerste: van de knieën valt hij nu languit (beeld 5 en 6): het bekken op de grond, het hoofd 58 cm
ervoor, de benen gestrekt achter hem. Met de IK van de benen bleven die onder hem gevouwen; liggend volgen ze nu gewoon het
bekken (`STERVEN['plat']`). En het beeld was onderaan te kort: languit ligt hij in Z naar de camera toe, en onder de
voeten was maar 90 pixels; bij sterven is het beeld nu 600 pixels hoger (de bovenrand, de maat en het anker blijven), en in
`spelvel.py` heeft sterven een eigen, ruimere cel (150 bij 124, het anker op 75, 84). Op spelmaat naast de generator:
`uit/blender/spel/sterven-generator-model.gif`. Hij ligt compacter dan de generator, die zijn armen wijd uitstrekt.
De uitval van de steek (leunen vanuit de heupen, `STEEK_HEUP`, een wijdere stap) gaf op spelmaat weinig verschil; nog te
doen.

**Een tweede aanval, voor de afwisseling (26 okt, voorstel in woorden).** Marcel: "En we hebben een 2e aanvals animatie
nodig voor de afwisseling". Voorstel: een stoot van boven, 8 beelden zoals de eerste. (0) uit de wacht; (1) en (2) hij
heft de speer tot boven zijn rechterschouder, de punt omlaag naar voren, het gewicht naar achteren; (3) en (4) hij
stoot hard vooruit en omlaag, een korte stap, het lijf erachteraan; (5) de punt het verst, laag; (6) en (7) terug in de
wacht. In het spel: bij elke uithaal om en om de eerste en de tweede (`js/sprites.js`, bij de eenmalige houdingen; een
teller per figuur, geen toeval, zodat het op elke computer hetzelfde is).

**De steek (26 okt).** Marcel: "De steek maar doen", en "De punt in W ook oppakken". In 3D stak hij wel vooruit (de speer
86 procent naar voren), maar met de punt wat omhoog en naar links: in Z een kort stokje opzij, in W kort; de generator laat
de punt in Z schuin omlaag naar de kijker wijzen en in ZW en W lang naar voren. Nu de wacht wat omlaag (`WACHT['as']`, z
-0,2). Bij de oude steek (`eigen-acht-steek-iso.mp4`, 25 okt) zei Marcel bij N, NO en O: "Die armen zien er nog beetje
slecht uit zo. Ook zn wapenrok lijkt aan achterkant nog niet te kloppen".
Daarna, in stappen (op spelmaat naast de generator, beeld 4, het verst): de wacht iets omlaag; een grotere uitval (`STEEK`:
een wijdere stap, meer voorover, de speer verder, de schouder meer mee; de benen rekken zoals bij het lopen); en de speer
achteraan vast (`WACHT['greep']` 0,12 in plaats van 0,32: er stak een halve meter voor de voorste hand uit, nu ruim 80 cm).
De handen hoger en de speer vlakker gaf de linkerpols 142 graden wringen: terug. Stand: in Z, ZW, W, O en ZO steekt hij
schuin omlaag naar voren, zoals de generator in Z; maar de generator maakt een echte uitval (de voeten heel wijd, het lijf
gestrekt naar voren, de armen op schouderhoogte, de speer lang en vlak), en de onze blijft gebogen en compact, van achteren
(N, NO) met de armen nauwelijks te zien. Bewegend naast elkaar: `uit/blender/spel/steek-generator-model.gif`.
Marcel: "de steek lijkt wat aan de lage kant bij ons model". De punt zat bij het verst op 0,30 m, kniehoogte. Zonder te
renderen een paar wachten geprobeerd (`wachtproef` in de kladmap: alleen de stand en hoe de polsen wringen): de handen 20 cm
onder de schouders, de speer vlak en de handen 32 cm uit elkaar zet de punt op 0,68 m, de buik van wie voor hem staat, met
de linkerpols op 15 graden wringen (met 40 cm uit elkaar 136). Van achteren steekt de speer nu schuin boven het lijf uit,
zoals bij de generator in N. Laag en hoger naast de generator: `uit/blender/spel/steek-hoger.gif`.

**De punt in W bij het lopen (26 okt).** Marcel: "De punt in W ook oppakken". De generator is daar niet in 3D getekend: in Z
wijst de punt rechtsboven (schuin over het lijf), in W sterk naar voren. Met één speer in 3D gaat het een ten koste van het
ander (`uit/blender/spel/lopen-punt-in-w.gif`, Z, ZW en W): de punt meer naar voren (`DRAGEN['generator']['as']` (0,4,
-0,9, 0,6)) wijst in W naar voren maar ligt in Z plat; (0,45, -0,55, 0,7) zonder de draai van de schouders zet hem in W
rechtop en houdt Z schuin. Uitgelegd met `uit/blender/spel/punt-in-w-uitleg.png`; Marcel: "P2 denk ik". Nu de punt naar
voren (`DRAGEN['generator']['as']` (0,4, -0,9, 0,6)).
- *Voorstel: de piekenier* (Marcel, 24 okt: "Ook een variatie, de pikeman, deze heeft een ijzeren harnas en een Pike als
  wapen"; eerst in woorden, dan één proefplaat). Hetzelfde lijf en skelet als de speerman, zodat staan, lopen en
  steken meekomen; wat anders is:
  - *Het harnas*: een borstkuras van ijzer met een middenrib en klinknagels, een rugplaat, een kraag van ijzer om de
    hals in plaats van de maliënkap, en onder het kuras twee rijen dijplaten over de dijen. De mouwen blijven het
    gewatteerde wambuis, maar blauw en geel gestreept, zodat de kleuren van het dorp blijven lezen; onder de dijplaten
    nog een stuk van de gevierendeelde rok.
  - *De helm*: een stormhoed (morion) met een kam en een omgebogen rand, zodat hij van de speerman te onderscheiden is.
  - *De piek*: twee keer zo lang als de man (echt was hij drie keer zo lang, maar dan past hij niet op een tegel), een
    schacht van es, een smal blad zonder koord, met twee ijzeren strips langs de schacht.
  - *Dragen en steken*: bij het lopen op de schouder, de punt schuin omhoog naar achteren; de steek met beide handen op
    borsthoogte, de piek vlak naar voren.
  - *Het gezicht*: een jongere man met een korte baard, zodat ze in een groep uit elkaar te houden zijn.
- *Een GLB uit ComfyUI* (Marcel, 24 okt: "check dit", met `ComfyUI_00002.glb`, waarschijnlijk TRELLIS 2): een heel vel in 3D,
  de stoet van de heer (de heer te paard in vijf richtingen, twee ossenkarren met de tiende, negen hellebaardiers met
  vaandels, groepjes), in rood en geel. Eén mesh van 694.000 driehoeken in 15.768 losse stukken, texturen van 4096 (kleur,
  ORM) en 2048 (normalen), 78 MB. Elke figuur is rond, met een achterkant, maar het geheel staat 24 graden naar de camera
  gekanteld (de schuine blik van het vel zit in de vorm), en de figuren zijn geen losse objecten: knippen gaat met een vak
  vanuit de camera. Eén hellebaardier krijgt zo'n 13.500 driehoeken en een dertigste van de textuur: van dichtbij klonterig
  (wanten als handen, de benen aan elkaar, de verf uitgesmeerd), en wat op het vel niet te zien was, is donker en modderig.
  Op spelmaat (`uit/blender/trellis-glb.png`, rechtop gezet, naast de speerman van de generator) leest het silhouet, maar
  hij is smal en vaag, zonder gezicht: de generator is veel beter. Als bron voor figuren dus niet; wel misschien als
  vorm voor wat moeilijk met de hand te maken is (de ossenkar, de heer te paard). Beter: één figuur per keer, recht van
  voren op een effen grond, dan krijgt hij de hele resolutie.
- *Onze speerman als GLB* (Marcel, 24 okt: "geef mij nog eens ons basis soldaat blender bestand", "in glb"; daarna: "deze
  ziet er veel beter uit nu!!!"): uit de huidige `speerman_hd.py`, alles in één mesh (152.000 vlakken), de kleur van de
  procedurele materialen met Cycles in één textuur van 4096 gebakken (van de echte delen naar de ene mesh), het staal
  (helm, blad, maliën, gespen) tijdelijk niet-metaal voor de bak en daarna een eigen materiaal (metaal 0,7). Het haar gaat
  niet mee: de baard, de snor en de brauwen zijn verf op de huid. Naar `uit/blender/render/speerman-hd.glb`. Waarom hij
  er beter uitziet dan de HD-render: hij is mat (ruwheid 0,75, geen bump, geen glans), de AO van de materialen zit in de
  verf, het licht van de kijker is zacht in plaats van een harde zon met randlicht en 'Medium High Contrast', en de
  fijne ruis (de spikkels op het leer, de vlekken op de helm) is door het bakken zachter. Het oogt geschilderd in plaats
  van als plastic speelgoed. Op spelmaat (`uit/blender/gebakken-spelmaat.png`: de GLB in vijf richtingen met de camera van
  `speerman_hd.py`, onbelicht en met zacht licht, naast de generator en de HD-render) valt de winst grotendeels weg: zacht
  belicht is hij bijna gelijk aan de HD-render, het gezicht verdwijnt in de schaduw van de helm, en alles is donkerder en
  minder fel dan bij de generator, die nog het best leest. Onbelicht is hij plat (de helm een grijze vlek). Het bakken
  helpt dus van dichtbij; op 74 pixels zit het verschil in het licht en het contrast, niet in de verf.
- *De gebakken modellen in het spel?* (Marcel, 24 okt: "Waarom gebruiken we niet de gebakken variant in game? En zetten
  de wereld om naar 3d, met iso view? ... want dit kunnen we redelijk goed maken vind ik, dat neemt een hoop problemen weg
  m.b.t. art", en "of een andere manier om deze te gebruiken in onze bestaande engine mag ook"). Op 4 okt vroeg hij al
  naar 3D-modellen in het spel; toen werd het kwartslagen, omdat echte 3D geen pixel art meer is en maanden werk
  (archief, vraag 124). Wat sindsdien anders is: we kunnen een man in 3D maken die Marcel goed vindt, en de vellen van de
  generator kloppen niet tussen de richtingen en de beelden (vraag 190). Het zijn twee keuzes. **Eén: de figuren komen
  uit 3D-modellen** in plaats van de generator; dat neemt het probleem weg (elke richting en elk loopbeeld komt uit
  hetzelfde model), en het geldt voor allebei de wegen. **Twee: hoe ze op het scherm komen.** (a) In de bestaande motor:
  het gebakken model uit Blender gerenderd tot vellen in acht richtingen met alle bewegingen, zoals The Settlers 3 en 4
  en Age of Empires 2 het deden. De regels en `js/gl.js` blijven; alleen de bron van de vellen verandert. (b) Echte 3D in
  het spel: de tekenlaag opnieuw (zo'n 10.000 van de 46.000 regels: `iso`, `tekenen`, `gl`, `sprites`, `doorkijk`,
  `bouwstijl`, `kleinleven`, `zien`, `anim`, `kiezen`), het land als mesh met hoogte, figuren met een skelet en een
  lichtere versie van het model (152.000 vlakken is voor één man; in het spel zo'n 5.000 met een normal map), en
  alles in 3D, ook de dieren en de bomen. Dat geeft vrij zoomen tot HD, vrij draaien en echte schaduwen, maar het kost
  maanden, en de Steam-pagina komt in januari. Op spelmaat ziet een 3D-model er live net zo uit als vooraf gerenderd
  (`gebakken-spelmaat.png`), dus (b) lost het lezen op 74 pixels niet op. Marcel erbij: "zonder dat we de kwaliteit
  naar beneden hoeven te brengen", en "knights and merchants is volgens mij ook 3d?" (dat is (a): vooraf gerenderde
  modellen in een 2D-spel). Juist (a) houdt de kwaliteit: het rendert vooraf, dus het volle model met echt haar en
  Cycles mag; (b) moet live een lichter model tekenen, zonder het haar. **Advies van Claude: (a) nu, (b) later
  mogelijk**; de modellen gaan dan gewoon mee. **Marcel (24 okt): "ik wil a wel proberen, maar kunnen we daar een proef
  van maken?"**

## Open

- **Bewegende omgeving:** vlammen, water, en de stofjes in de zonnebundel. De wind staat hierboven.
- **Portretten** van dorpelingen voor de gesprekken. (De effecten van spreuken zijn er sinds 21 sep 2026, zie `spreuken.md`.)
- **De huizen naar Marcels voorbeelden (9 okt 2026; werklijst, bij vraag 144).** Marcel: "De huizen voelen op dit moment
  nog niet fantastisch", met acht voorbeelden (platen "Medieval Buildings" en "Isometric Medieval Village", een dorp in de
  stijl van Stronghold, en vier losse vakwerkhuizen; met AI gemaakt of van een stockbureau, dus alleen als voorbeeld en
  niet in git). Wat ze delen, en wat we eruit nemen:
  1. **Een silhouet met karakter:** hoog en smal, twee lagen met een overstek, een steil dak dat de helft van het huis
     is, meer gevels en dakkapellen, een afdakje boven de deur, een buitentrap of balkon, een of twee schoorstenen.
  2. **Niets is recht:** een nok die doorzakt, dakranden die krullen en golven, grove pannen die elk anders liggen,
     balken die niet recht zijn.
  3. **Verweerd materiaal:** gevlekt pleister met de steen erdoor, mos op het dak, riet dat grijsbruin is en niet geel,
     oud hout; een stenen voet onder het vakwerk.
  4. **Diepte in het licht:** diepe schaduw onder het dak en het overstek, donker in de hoeken, en het huis staat
     zwaar op de grond.
  5. **Een eigen stukje grond met spullen:** keien of vertrapte aarde voor de deur, gras en struiken tegen de voet,
     tonnen, kratten, een bankje, potten, een houtstapel, een karrenwiel, een lantaarn.
  6. **Aardse kleuren:** room, bruin, terracotta, grijze steen en dof groen, niets fel.
  **Wat Claude zag:** veel hiervan kan de huizenbouwer al (`huis-sdf.cjs`: `scheef`, het pak riet, twee lagen die
  overkragen, dakkapellen, een aanbouw, een erker, een balkon, een buitentrap, een gevelschoorsteen, een schoor; en dit
  bestand zei het al op 20 en 21 sep: "Niets is waterpas", "Het dak is het gebouw", "Dingen die uitsteken"), maar de
  huizen van het spel gebruiken het zuinig (`HUIZEN` in `huizen.cjs`: bijna alles één laag, en `uit` meestal één ding
  of niets). Wat er nog niet is: het verweren (vlekken, mos, steen door het pleister), dakranden die krullen, het
  afdakje boven de deur, de schaduw in de hoeken, en het stukje grond met spullen bij het huis. **Voorstel:** één
  vakwerkhuis van twee lagen met alle zes, als proefplaat; dan pas de regels voor alle tekeningen, in één ronde met de
  bouwfasen, de brandfasen en de sneeuw. **Marcel (9 okt): "De huizen moeten een goede balans zijn tussen
  'sprookjesachtig' en 'echt'; het blijft een game uiteindelijk, dus het mag ook wel een beetje 'mooi' en 'leuk' zijn."**
  Dus: het materiaal echt en verweerd (3, 6), de vorm met karakter en een beetje overdreven (1, 2), en het geheel uitnodigend.
  **Het voorbeeldhuis (10 okt; Marcel: "1 riet, 2 akkoord"):** een vakwerkhuis van twee lagen onder riet (riet, omdat
  een speler en elk plaatje op Steam eerst het gehucht zien), in vier stappen, elk een knop in de huizenbouwer, zodat
  het straks voor alle huizen werkt: A verweren, B diepte, C vorm, D het stukje grond (alleen op de plaat; in het spel
  is dat vraag 148). Marcels voorbeelden zelf staan niet in git en waren deze sessie niet meer te vinden; Marcel stuurt
  ze opnieuw, en dan komen ze in `ontwerp/voorbeelden/` (Marcel, 10 okt: "zet ze in git"). De plaat: `node gereedschap/pixelart/huis-sdf-export.cjs voorbeeld` (`uit/proefhuis/voorbeeld.png`).
  **A, verweren** (`knoppen.verweer`, `verweer` en `VERWEER` in `huis-sdf.cjs`; staat uit tot de ronde van alle
  tekeningen): het riet op de grijsbruine ramp `riet` in plaats van het gele `stro`, met mos in korrels die naar de
  goot en de schaduw toe dichter worden, en de lap een tint lichter in plaats van goud (Marcel: "Dit ziet er raar uit",
  over de gouden lap); het pleister minder wit, met vochtvlekken, vuil boven de plint, en hier en daar afgevallen met de
  baksteen erdoor; het hout op `houtOud`, half naar het grijs van schors; de plint nat aan de voet en met mos; een
  schoorsteen zwart van het roet naar zijn top, in strepen; mos op een dun dak. Alles uit de plek in de wereld, dus in
  elke stand op dezelfde plek.
  **B, diepte** (`knoppen.diepte`, `diepte` en `DIEPTE` in `huis-sdf.cjs`, `W.diepte` in `tekenWereld`, toren.cjs; staat
  ook uit): de tekenaar kijkt verder weg (tot 26 eenheden) naar wat het licht van de hemel afdekt, en een hoek kan dieper
  donker worden, zodat de muur onder de dakrand, de balkkoppen onder het overstek en de naad tussen aanbouw en huis in de
  schaduw liggen; de voet van de muren mist licht, de schaduw van de zon is donkerder, en de baan onder de dakrand ook.
  Het kost een paar procent rendertijd. De schaduw op de grond om het huis legt het spel, niet de tekening
  (`opmerkingen.md`).
  **C, vorm** (keuzes in de opgave, het zaad kiest ze niet, dus de huizen die er zijn blijven gelijk): `helling` (het
  voorbeeldhuis 58 graden in plaats van 51, zodat het dak de helft van het huis is), `uit.afdak` (een afdakje van
  planken op twee sporen met schoren boven de voordeur, `afdakVan`) en `uit.gevelschoorsteen: 'ook'` (twee
  schoorstenen). De aanbouw is eraf: die bezette de voorkant van het dak. Het balkon (Marcel: "Ik vind het balkon wel
  mooi") stond op palen van de grond af, wat op een steiger leek en de deur verstopte; nu kan het ook op schoren uit de
  muur (`uit.balkon: 'schoren'`), en staat het boven de deur, dan is het zijn afdak. Marcel koos het balkon op schoren
  ("3").
  Geprobeerd en weer weggelaten: een dakkapel in het riet (de bult is gemaakt voor anderhalve laag;
  bij twee lagen tilde hij de dakrand te ver op en werd zijn raam een spleet). Een dakkapel past beter op het huis
  onder pannen, waar de huizenbouwer er een echte voor heeft (`kapellenVan`).
  **Een voorbeeld in git (10 okt, na D):** `ontwerp/voorbeelden/huis-vakwerk-op-steen.jpg` (`voorbeelden/README.md`).
  Wat het laat zien: beneden grote veldstenen met lichte voegen en een rondboogdeur met een boog van gehakte steen,
  vakwerk alleen boven; een steil dak van grove, ronde oranje pannen met een dwarsgevel aan de voorkant en een stenen
  kruisbloem op de top; klimop tegen de schoorsteen, struiken tegen de voet, een lantaarn bij de deur; een plein van
  keien met een trap en een muurtje. **Het grootste verschil met ons huis is de maat van de vormen:** een steen is er
  zo'n twintig pixels, een pan vijftien, met weinig ruis, zodat alles in één oogopslag leest; ons riet en ons pleister
  zijn fijn gespikkeld en lezen druk.
  **D, het stukje grond** (alleen op de plaat): nieuwe tuinstukken in `tuin-sdf.cjs`, elk op één tegel zoals de hekken
  en de regenton, zodat vraag 148, d, ze in het spel kan neerzetten: `keien` (een stoep van keien in de aarde met een
  rafelige rand; voor de deur twee tegels), `houtstapel-x`/`-y` (brandhout tegen een muur, de kopse kanten met
  jaarringen naar voren) en `tonnen` (twee dichte tonnen en een krat van latten); met het bankje dat er al was. De plaat
  zet ze om de voordeur (`stukjeGrond` in `huis-sdf-export.cjs`, met `HS.samen`). Ze staan in `GRONDSTUKKEN`, nog niet op
  het vel van het spel (`STUKKEN`, `tegels/tuin.png`): dat is vraag 148, d.
  **E, grover** (`knoppen.grof`; Marcel, 10 okt, na zijn voorbeeld: "Ja, begin met E op het riethuis"): grotere
  vormen met minder ruis, omdat een huis meestal uitgezoomd te zien is en fijne ruis dan een vlek wordt: het riet in
  bossen van zo'n drie pixels breed en langer (`rietPatroon`), het pleister in grote zachte vlekken zonder spikkels
  (`pleisterPatroon`), de stenen van de plint en de schoorsteen groter en warm, zonder blauw, met een brede lichte rand
  boven en links en een brede schaduw onder en rechts, en geen spikkels (`steenStap` met `grof` in toren.cjs), en het mos
  in korrels van vier pixels. Daarna (Marcel: "Allebei", op nog grover en de kleuren uit elkaar): het riet in minder en
  dikkere lagen (`laagL` maal 1,5, het trapje `laagH` ruim twee keer zo hoog, een dikkere zoom en een sterker verloop),
  en een knop `contrast`: het pleister lichter en warm (de ramp `pleisterWarm`), het houtwerk donkerder (`CONTRAST`).
  **F, ruig riet** (`knoppen.ruig`; Marcel, 10 okt, bij `voorbeelden/rieten-huisje.jpg`: "dit riet vind ik leuker staan",
  en "rossiger, rauwer, prikkeliger, en wat rieteriger"): lange, dunne, rechte stengels in rechte, dikke lagen (zo'n zes
  op een dakvlak), en onder elke laag de punten van de stengels die licht vangen en over een donkere, rafelige schaduw
  hangen (`ruigRiet`); aan de goot steekt elke bos een eind uit, zodat de onderrand van het dak pluizig is
  (`gootSprieten`), en aan de gevel elke rij (`dakVeld`); geen lap; de ramp `rietRos` (goud met een rode gloed). **Het
  verweren is nu een maat** (`knoppen.verweer`, 0 tot 1, true is 1): een jong dak (0,3) houdt zijn kleur en heeft
  nauwelijks mos, vlekken of gaten; vanaf 0,5 wordt het riet grijsbruin en het hout grijs. Zo kan een dorp jonge en oude
  daken naast elkaar hebben (voorstel; het voorbeeldhuis is jong).
  **Marcel (10 okt) daarop:** "Ja, maar niet te geel. Het moet wel oke zijn. Het gaat me ... niet om de kleur, maar meer
  de vorm en textuur van het riet. Verweren over tijd vind ik logisch, dat maakt het echt"; "Ik kan mij voorstellen dat
  het destijds niet perfect hoefde te zijn, maar meer praktisch. Naarmate een stad zich ontwikkelt, wordt dat beter door
  technologie"; en "golven en ongelijkheid mogen er wel in blijven, maar ik wil graag het sprieterige zien". Dus:
  `rietRos` is warm stro geworden, tussen het gele `stro` en het grijsbruine `riet`; de lagen golven weer; de nok is
  ruig (stengels dwars over de worst, en plukken die aan zijn onderkant over het dak hangen) en de gevelrand rafelt
  sterker. **Voor de ronde van alle tekeningen:** hoe ruig een dak is, hangt af van de trede (het gehucht ruig en
  praktisch, een dorp netter), en hoe verweerd het is, van hoe lang het huis er staat (een maat, `knoppen.verweer`; welke
  tekening een huis van een zekere leeftijd krijgt, is dan een vraag voor het spel).
  **Het oude dak** (10 okt): hetzelfde huis met `verweer: 1` is alleen een render, de maat bestond al. Wat opviel: het mos
  ligt als platte, felgroene vlekken op het riet, als stickers; echt mos op riet is donkerder en zit in de schaduw onder
  de lagen. Dat komt na het stenen huis (Marcel: "Na het stenen huis"). **Gebouwd (10 okt)** (`mosOpRiet` in
  `huis-sdf.cjs`): het mos groeit in de schaduw onder de punten van de laag erboven en loopt van daar in strepen langs de
  stengels naar beneden, in plukken en meer naar de goot toe; donker olijfgroen, met korrels langs de stengels en het riet
  eromheen vochtig en wat donkerder. Hoeveel: `VERWEER.mos`, op 0,58 (Marcel, 10 okt: "Meer mos"; met 0,68 minder). Een
  jonger dak krijgt vanzelf minder (de maat van het verweren).
  **Het stenen huis onder pannen** (10 okt, naar `voorbeelden/huis-vakwerk-op-steen.jpg`): de vorm kan de huizenbouwer al
  (een T met de dwarsgevel voorop, `wand: 'veldsteen'` met twee lagen is steen onder en vakwerk boven, `dak: 'pannen'`);
  het verschil is het materiaal. Vier stappen, elk een knop die uit staat, op de plaat `huis-sdf-export.cjs voorbeeld
  steen`: **G** veldsteen (grote, ronde stenen van zo'n twintig pixels, warm grijs, met lichte voegen, in plaats van nette
  blokken), **H** grove pannen, **I** een rondboogdeur met een boog van gehakte steen (alleen in een stenen muur), **J**
  klimop tegen de schoorsteen en een hoek, zoveel als het huis verweerd is. Marcel koos: **ronde pannen** (beverstaarten
  zoals in zijn voorbeeld, elk iets anders, met een rij halfronde nokpannen; niet de golfpannen van nu, die van ver een
  streepjespatroon zijn), en **netter dan de rieten hut** (rechtere rijen, jonger verweerd): pannen komen in het spel met
  marktrecht, en bouwen wordt beter naarmate de stad groeit.
  **Gebouwd (10 okt), op de plaat `voorbeeld steen`** (`uit/proefhuis/voorbeeld-steen.png`: het huis met A tot F, dan elke
  stap erbij; verweer 0,15): **G** `knoppen.rond` (`veldkeiPatroon`): ronde stenen in rijen die elk anders verspringen,
  elk middelpunt wat van zijn plek en een grote steen ruimer (Voronoi met gewichten), een lichte voeg met een zakje kalk
  waar drie stenen samenkomen, en elke steen bol (licht boven en links, een donkere lijn eronder); geen hoekstenen, want
  de hoek is ook een ronde steen; de schoorsteen houdt zijn blokken. **H** `knoppen.bever` (`DUN.bever`, `beverPlek`,
  `beverPatroon`): platte pannen met een ronde staart, rijen die een halve pan verspringen, tussen twee staarten de pan
  eronder in hun schaduw, elke pan het dikst aan zijn staart (het reliëf) en daar het lichtst; netjes: de banen verlopen
  een derde van de holle pannen, en de rijen golven een derde. **I** `boogdeur: true`: de voordeur in een muur van
  veldsteen met een ronde boog (de boog boven de hoogte van de deur), en een ring van gehakte zandsteen eromheen, de
  boogstenen als een waaier, de stijlen in blokken (`boogPatroon`). **J** `uit.klimop: true` (`klimop`, `klimopPixel`):
  een zuil om een as die van de grond opgroeit, langs de schoorsteen op de gevel en op de hoek van de eerste vleugel, zo
  hoog als het huis verweerd is; de blaadjes zoals de klimop van de toren. Alles staat uit, en een huis zonder deze
  knoppen is byte voor byte zoals ervoor. **Warmer** (Marcel, 10 okt, bij de plaat: "Het ziet er goed uit, maar misschien
  wel iets warmer?"): de ronde veldsteen (en de schoorsteen erbij) in warm grijs en beige (`veldsteenWarm`) in plaats van
  het koele grijs van de oude veldsteen, en de ronde pannen dieper oranje met een gouden glans (`panWarm`), met de
  lichtste tint alleen als glans, zodat de zonkant oranje blijft en niet geel wordt. **Open:** de ring van de boog is in zijn stijlen een rechte band (in het
  voorbeeld steken de stenen om en om de muur in); de klimop is bij een jong huis bescheiden; en het mos op het oude riet
  (hierboven).
  **De ronde van alle tekeningen (10 okt; Marcel: "pak het de huizen op, alle knoppen staan nog uit die het uiterlijk
  veranderen").** Gemeten: met de knoppen aan kost een huis 10 à 20 seconden (een tiende meer), de bouwfasen van een huis
  zo'n tweeënhalve minuut, en de voet en de deur blijven gelijk. Marcel koos op het plan: **meteen jong en oud** (elke
  tekening twee keer; een nieuw huis is jong en wordt na een paar jaar oud, wat er bij het begin al stond, is oud; de
  bouwfasen alleen jong, want wat gebouwd wordt, is nieuw), **de vorm C** op de huizen, boerderijen en stenen huizen (het
  steilere dak en een afdakje boven de voordeur; een tweede schoorsteen en het balkon blijven per tekening zoals ze zijn;
  de hutten blijven laag), en **alles in één ronde**: de tekeningen, de bouwfasen, de sneeuw op de daken (vraag 144, 4b)
  en de brandfasen (vraag 144, 3). Welke knop waar (het voorstel; eerst een proefplaat): overal B diepte en E grover met
  contrast; op riet F ruig; op pannen H ronde pannen; op veldsteen G ronde stenen, I de rondboogdeur en J klimop (zandsteen
  en baksteen houden hun blokken); leien krijgen geen eigen stap (open). Hoe verweerd, naar de trede van het dak: riet en
  spanen (het gehucht) jong 0,3 en oud 0,9, een oude hut 1; leien (een dorp) jong 0,15 en oud 0,6; pannen en baksteen
  (marktrecht) jong 0,1 en oud 0,5.
  **Gebouwd (10 en 11 okt):** de knoppen per tekening (`inDeRonde` in `huizen.cjs`) en de proefplaat `huis-sdf-export.cjs
  ronde wit` (Marcel kreeg hem). **Jong en oud in het spel:** wat er bij het begin al stond, is oud; wat gebouwd wordt,
  doorgroeit of na een brand herrijst, is jong en na twee jaar oud (`oudNaDagen`). **De sneeuw op de daken** komt uit
  dezelfde render als het huis: wat naar boven kijkt (de normaal van elke pixel), met een rafelige grens uit ruis, wit uit
  de ramp 'baard' zo licht als het materiaal eronder, in drie lagen (een beetje: plekken op het dak; half; dik: het hele
  dak, behalve de onderkant van de lagen riet), elk een eigen plaatje over het huis; het spel kiest de laag naar de sneeuw
  op de grond. Alleen op het dak, de schoorsteen, het afdak en wat uitsteekt, niet op de muren: op een blokhut werd de
  bovenkant van elke stam anders een witte streep. Een laag is zo groot als het dak, en de browser houdt alleen de laag
  vast die er ligt (een bestand per laag). Een oud huis draagt de sneeuw van zijn jonge (dezelfde vorm). **De brandfasen in het spel:** terwijl het
  brandt eerst het huis, dan geschroeid en het dak dat valt; afgebrand binnengestort, ingestort (twee varianten) en
  opgeruimd; de verkoolde bouwfase alleen nog voor wat niet van de huizenbouwer is. **Open:** de toren van de kapel is
  boven de eerste band bruin in plaats van in de kalk van de stijl (in het spel nu grijs; het zit in de kalk van de toren
  zelf, niet in de ronde veldsteen); het pleister van de kapel laat bij een jong huis al rode baksteen zien, waar het steen
  zou moeten zijn; tussen jong en oud is bij leien en pannen weinig verschil.
- **Meer variatie in het groen, de bomen en de versiering (9 okt 2026; werklijst, vraag 148).** Marcel: "Ik wil meer
  variatie in de vegetatie, ook bomen en versieringen van het dorp." Nu heeft elke soort één tekening en verandert het
  groen niet met het jaar. Het voorstel staat bij vraag 148: elke boom anders (vormen per soort, en de beuk, de linde,
  de populier, de els, de knotwilg, de meidoorn en de hazelaar), de bomen in het jaar (bloesem, herfstkleuren, kaal in de
  winter), meer groen eronder, en spullen bij de huizen naar hun stand, die met het dorp meegroeien. Het stukje grond
  met spullen bij het huis (punt 5 hierboven) gaat daarin op.
- **De spar (10 okt 2026; werklijst, vraag 148).** Marcel: "kunnen we de dennenboom beter maken?", met een pixel-art spar
  en een plaat van tien sparren als voorbeeld (niet in git): "dit is een spar". Wat ze delen: een volle, gesloten kegel van
  bijna vlakke takken, laag op laag, met de punten als stekels in de rand; per tak een lichte bovenkant en een donkere
  band eronder, en naaldstreepjes; frisse kleuren, blauwgroen, groen of olijf, elke boom een andere; de stam zichtbaar
  onder de kegel. Onze den was een stapel gladde rokken, donker en overal even groen. Nu een spar uit losse takken per
  krans (`sparTak` en `den` in `bomen.cjs`), en de grove den erbij voor de heide. Met sneeuw werd hij helemaal wit, want
  elke tak ligt bijna vlak; sinds 10 okt draagt een spar (en de kerstboom) dunner sneeuw (`sneeuwDikte` 0,25 op het
  model, de rest 0,45), zodat het groen onder elke witte tak blijft.
