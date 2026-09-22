# Kaarten: van Tiled naar het spel

Wat er op die kaarten komt te staan, staat in `wereld.md` en `toren.md`.

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
| `wezen` | `smid`, `herbergierster`, `boer`, `boerin`, `dorpsoudste`, `oudeman`, `smidsvrouw`, `bruid`, `bruidegom`, `jongen`, `meisje`, `kleuter` | een dorpeling met een naam; hij dwaalt rond waar je hem neerzet (met `straal` kies je hoe ver) |
| `wezen` | `bakker`, `marskramer` | de twee van De koude oven. Ze zijn nog niet getekend en lenen tot fase B2b het vel van Wim, dus ze lopen wel, maar ze zien er als Wim uit |
| `straal` | een getal | hoe ver het rondloopt |
| `quest` | `bakker:zoeken` | dit voorwerp ligt er alleen zolang die quest in die fase staat (meer fasen mag: `bakker:zoeken,terug`). Zo ligt de leem pas in de kuil als de bakker erom vroeg. Het voorwerp mag niet vast zijn |
| `raak` | `oven` | dit voorwerp wacht op een spreuk (de lijst is `T.RAAKPUNTEN` in `js/quests.js`). Zet het op een tegel waar je bij kunt, niet in een muur: een spreuk vraagt vrij zicht |
| `overgang` | naam van een kaart | wie hier stapt, gaat naar die kaart |
| `komt` | `x,y` | de tegel in déze kaart waar je landt als je van die andere kaart terugkomt |
| `tekst` | bijvoorbeeld `Naar binnen` | wat er bij de muis staat boven een overgang (zonder: "Naar" en de naam van de kaart) |
| `zaad` | een getal | een gewone dorpeling; het getal kiest zijn uiterlijk, en hetzelfde getal geeft altijd dezelfde |

Het beginbestand heeft er al een als voorbeeld: *pad terug naar het erf*.

**Proberen in het spel.** Sla op in Tiled, draai `npm run kaarten`, en open het spel. Een nieuwe
kaart is vanzelf een gebied, maar het erf heeft nog geen weg ernaartoe: zeg welke kaart het is,
dan komt er een pad vanaf het erf. Tot die tijd kun je er in de browserconsole heen springen met
`Toren.debug.gaNaar('dorp')`.

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
  wordt de capaciteit bewust verhoogd én worden de kaarten meeverhuisd.

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
