# Scenario's: de campagne, de editor en skirmish (vraag 187 en 188)

**Zo werkt het nu** (23 okt): dit is het ontwerp; er is niets van gebouwd, en bouwen komt na de demo (Marcel, 20 okt,
6a1). Onderaan staan de vragen aan Marcel; wat hij kiest, komt hier en in de werklijst (R).

## Wat Marcel vroeg en koos

- **187** (20 okt): "Uiteindelijk wil ik ook een 'Campaign' modus; hierin een aantal levels die met de hand gemaakt zijn
  op een gemaakt eiland. Hiervoor is er een editor nodig die de huidige generator gebruikt voor de basislaag, maar hier
  ook aanpassingen in kan maken", "We hebben dus alles 'inhouse'", en "De editor moet wel wat functionaliteit hebben om
  een verhaal te maken, checkpoints en een 'quest' systeem zoals bij age of empires." **Gekozen:** nu alleen het
  ontwerp (6a1); Tiled eruit in een snoeironde, de proefkaarten naar het proefdorp (6b1); een checkpoint is een plek die
  iets in gang zet (6c).
- **188** (20 okt): "In het uiteindelijke spel wil ik ook een skirmisch modus hebben, zowel vs AI als vs andere spelers.
  Hierin bouw je een kasteel, en vecht je één groot gevecht." **Gekozen:** allebei: zoals Age of Empires, van niets tot
  er één valt (7a1), en een verdediger tegen een belegeraar (7a3); eerst tegen de AI, dan samen (7b).

## Wat er al ligt (nagelopen op 23 okt)

- **Bewaren** (`js/opslaan.js`): heel `S` behalve het scherm, als JSON; het eiland als zaad plus wat per tegel anders is
  (`tegelsAnders`, `grondAnders`, `gerooid`, `hoogte.vlaktes`; `T.eilandKaart` in `js/wereld.js`). Een leeg begin is zo'n
  23 kB, het proefdorp 43 kB. Een spel van een andere versie (`T.OPSLAAN_INSTELLINGEN.versie`, nu 24) wordt geweigerd.
- **Een dorp uit een recept:** `T.proefdorp.maak` (`js/begin.js`) bouwt het proefdorp elke keer opnieuw uit een paar
  woorden (hoeveel hoeven, hutten, welke gebouwen), met de gewone regels (`zetBijHetVuur`, `legVeldBij`, `bouwAf`).
- **Het eiland heeft zijn plekken al** (`E.plekken`, `js/eiland.js`): het kasteel op een heuvel, de stad aan de grootste
  monding, acht dorpsplekken met een naam, en de roverskampen; met de wegen ertussen.
- **Voorwaarden en gevolgen:** `T.voorwaardeGeldt` (`js/gesprek.js`) kent `vlag`, `heeft` (de tas), `quest` en `goud`;
  `T.doeGevolg` kent vlaggen, de tas en goud. De quests (`js/quest.js`) worden elke tik nagekeken (`T.werkQuestsBij`),
  maar alleen voor `S.dorp`, en `T.QUESTS` is leeg: het is de vorm uit het oude spel (fasen met wegen die jaren, goud,
  gunst of risico kosten, voorwerpen en geheime deuren op een Tiled-kaart).
- **De demo zit verspreid:** `T.DEMO_INSTELLINGEN.aan` (`js/einde.js`) wordt gelezen in `begin.js` en `bewoners.js` (de
  wacht van drie), `gebouwen.js` (wat dicht is), `rovers.js` (de ene overval), `heer.js` (betalen is het eind), `hud.js`
  (de punten) en `debugvenster.js`.
- **De regie** (`js/regie.js`) leidt de scène af uit de wereld (`T.welkeScene(D)`), per beeld, niet in de tik.
- **Gereedschap:** `gereedschap/wereld.html` bewerkt alleen de Tiled-kaarten (mensen, deuren, voorwerpen; de grond niet),
  en kent het eiland en `S` niet. De bewerkers van de gesprekken en de quests schrijven hun blok terug (`T.bronBlok`) en
  hebben een proefdorp-stand.
- **Er is geen AI:** niets kiest handelingen voor een dorp (`T.geefOpdracht` komt alleen uit een klik), en het leger van
  de heer loopt naar het plein en vecht niet. **Er is geen kasteel:** alleen de plek op het eiland; `palissade` en
  `stadsmuur` staan als gebouw zonder tekening en zonder bouwmenu. Belegeren, torens en poorten zijn er niet.
- **Hoe lang het duurt:** een dag is 300 seconden (`T.DAG_LENGTE`), een jaar dertig uur op 1× en een uur op 30×; een
  gevecht loopt altijd op 1×.

## 1. Een level is een recept

Het voorstel van 20 okt was "een opgeslagen spel op minuut nul, plus triggers". **Beter: een recept dat het spel op
minuut nul maakt**, zoals het proefdorp. Een bewaard spel wordt geweigerd zodra de versie van het bewaren omhooggaat (nu
24, en die stijgt als iets anders heet of betekent); een campagne van tien levels zou dan bij elke stijging opnieuw
gemaakt moeten worden. Een recept bouwt het level elke keer met de code van vandaag.

```js
// levels/demojaar.js: één bestand per level, een script en geen JSON (dat laadt niet vanaf file://); de editor schrijft
// alleen het blok terug (T.bronBlok).
T.LEVELS.demojaar = {
  titel: 'The first year', inleiding: '...',
  eiland: { zaad: null },           // null: elk spel een ander eiland; een getal: een gemaakt eiland
  land: { ... },                    // wat de editor aan het eiland veranderde, per tegel (zoals tegelsAnders nu)
  plekken: { ... },                 // de plekken van het eiland, verschoven of erbij
  dorpen: [{ wie: 'speler', plek: 'jij', begin: 'huifkar', wacht: ['speerman', 'speerman', 'kruisboogschutter'] }],
  spelregels: { ... },              // wat in dit level vastligt (T.OPTIES)
  dicht: ['wachthuis', 'wapenmaker'],
  gebieden: { ... }, triggers: [ ... ], doelen: [ ... ],
};
```

- **Beginnen:** het eiland uit het zaad, het land en de plekken eroverheen, per dorp het begin (`T.beginOpKaart`, en
  een tweede met `T.dorpErbij`), wat erop staat met dezelfde regels als het proefdorp, en dan `S.scenario` (hieronder).
- **Tussendoor bewaren** is gewoon bewaren: `S.scenario` gaat mee, zoals alles in `S`.
- **Wat het kost:** alles wat je in de editor neerzet, heeft een woord in het recept en een regel die het zet. Voor een
  gebouw, een veld, een kamp en soldaten bestaat die regel al.
- **Wat het oplevert:** een level overleeft een nieuwe versie van het spel, is in git te lezen (een diff zegt "de molen
  staat verderop"), en is een paar kB.

## 2. De triggers: als ... dan ...

Een trigger is gegevens, geen functie: `{ id, aan, keer, als: [...], dan: [...] }`. Hij gaat af als alle voorwaarden
van `als` gelden (voor "of" maak je twee triggers), doet alles van `dan`, en gaat daarna uit, of blijft aan als `keer` meer
dan één is. Elke voorwaarde en elk gevolg noemt het dorp waar het om gaat (`wie`: de speler, een nummer, de heer, de
rovers; zonder `wie` de eerste speler); in skirmish `elk`.

**De afspraken in de code gelden ook hier:**
- Triggers draaien in de tik (`T.wereldTik`, na de opdrachten), één keer per wereldseconde: vaak genoeg voor een
  checkpoint, en goedkoop. Ze vervangen `T.werkQuestsBij`, dat alleen `S.dorp` kende.
- Een gevolg verandert de wereld in de tik zelf. Elke computer rekent dezelfde trigger op dezelfde tik, dus samen spelen
  blijft kunnen; een gevolg hoeft geen opdracht te zijn (alleen een klik is dat).
- Toeval komt uit `T.vastLot` met het zaad, nooit uit `Math.random`.
- Wat een trigger weet, staat in `S.scenario` en wordt bewaard: welke aan zijn, welke afgingen en wanneer, de tellers,
  de doelen.
- Wat alleen scherm is, gaat langs de bestaande weg: een bericht met `T.zeg(D, ...)`, een scène via de regie (de trigger
  zet de wereld, de regie leest haar, zoals nu bij de heer).
- De zinnen zijn Engels, en het zijn gegevens die een bewerker terugschrijft: `T.tGegevens`, en `npm run teksten` leest
  ook `levels/`.
- Een keuring, zoals `T.keurQuests`: rood voor een trigger die een gebied noemt dat er niet is, of een doel dat nooit af
  kan.
- Geen ronde over de hele kaart: een gebied is een rechthoek of kring van tegels, en `inGebied` kijkt alleen naar de
  mensen van het genoemde dorp.

**Als** (de voorwaarden; tussen haakjes wat er al is):
- **De tijd:** `dag` (een dag van het jaar, of een dag tussen twee, één keer getrokken uit het zaad; de kalender), `uur`
  (overdag, of van tot), `na` (zoveel uur of dagen nadat een andere trigger afging).
- **Het dorp:** `waar` (zoveel van een waar in de voorraad; nu alleen `goud`), `bevolking`, `gebouw` (zoveel van een
  soort af), `trede`, `vlag` en `nietVlag` (`T.voorwaardeGeldt`).
- **De kaart:** `inGebied` (iemand, of zoveel, van een dorp of een soort in een gebied: het checkpoint), `leegGebied`
  (geen vijand meer in een gebied).
- **Leven en dood:** `dood` (een mens met een naam, de aanvoerder, een groep), `gevallen` (een dorp zonder raadhuis en
  zonder mensen).
- **De heer:** `heer` (de stand van zijn bezoek: komt, betaald, geweigerd, weg), `gunst` en `vertrouwen` (boven of
  onder; `js/bazen.js`).
- **Het scenario zelf:** `doel` (af of mislukt), `trigger` (ging af), `teller` (zoveel of meer).

**Dan** (de gevolgen):
- **Zeggen:** `bericht` (`T.zeg`, met een plek voor de ping op de minikaart), `brief` (een brief met de tekst van het
  level; `BRIEVEN` krijgt één soort erbij), `gesprek` (een uit `T.GESPREKKEN`).
- **Sturen:** `doel` (erbij, af, mislukt), `vlag`, `teller`, `trigger` (aan of uit).
- **Mensen:** `mensen` (gezinnen, soldaten, een mens met een naam), `rovers` (zoveel, vanaf een plek, en wat ze willen:
  de akker of de stapels; de bestaande overval), `aanval` (een groep van een dorp naar een gebied; dezelfde weg als
  `T.stuurMannen`).
- **Geven en nemen:** een waar (`T.wijzigVoorraad`), gunst en vertrouwen.
- **De kaart:** `mist` (een gebied gezien; `T.kenKring`), `bouw` (een soort open of dicht; nu `T.DEMO_INSTELLINGEN.dicht`).
- **Het eind:** `scene` (de regie: een camera op een plek, de banden, een zin), `punten` (`T.telPunten`), `einde`
  (gewonnen of verloren, met een reden; `D.einde` en het eindscherm).

**Namen op de kaart:** een gebied (een rechthoek of kring van tegels), een plek (één tegel), een mens of een groep met een
naam ("the miller"). De editor geeft de namen; een trigger noemt ze. **Een checkpoint** (6c) is een gebied met een
trigger `inGebied`. Je ziet het als een doel ernaar wijst (een vaandel op de plek en de ping op de minikaart), anders niet.

**Doelen** staan in `S.scenario.doelen` (een tekst en een stand: open, af, mislukt). Het vak linksboven toont het
hoofddoel, waar nu `T.questDoel` of `T.tredeDoel` staat; de rest staat op het briefje bij de muis (het scherm zo leeg
mogelijk). Een bericht zegt het als er een doel bij komt, of als het af is.

## 3. De proef: het demojaar als triggers

Als de lijst hierboven de demo niet kan zeggen, mist er iets. Dit is de demo zoals hij nu speelt:

```js
triggers: [
  { id: 'gezien', als: [{ dag: { tussen: [59, 219], lot: 'overval' } }],
    dan: [{ bericht: 'Robbers were seen in the woods near the village. They will come soon.', toon: 'gevaar' }] },
  { id: 'overval', als: [{ na: { trigger: 'gezien', uren: 24 } }, { uur: 'overdag' }],
    dan: [{ rovers: { aantal: 3, van: 'bos', voor: ['akker', 'stapels'] } }] },
  { id: 'tiende', als: [{ heer: 'komt' }], dan: [{ punten: true }] },
  { id: 'betaald', als: [{ heer: 'weg', betaald: true }], dan: [{ scene: 'betalen' }, { einde: 'betaald' }] },
]
```

Met in het recept de wacht (`dorpen`), wat dicht is (`dicht`), en de wilde rovers uit (`spelregels`). Het lukt, met
twee dingen erbij die er al half zijn: een dag uit het zaad (nu `planDemoOverval` in `js/rovers.js`) en de stand van de
heer als voorwaarde. Weigeren hoeft er niet in: zijn leger en het eind zijn een regel van elk spel ("Ook in het volle
spel, zolang weigeren de dood is", `js/regie.js`). Daarmee wordt `T.DEMO_INSTELLINGEN.aan` in zeven bestanden één level.

## 4. Wat een trigger wordt, en wat een regel blijft

- **Een trigger** is wat één spel of één level vertelt: alles wat nu alleen in de demo gebeurt (de wacht, wat dicht is,
  de ene overval, betalen is het eind, de punten), en het verhaal van een campagne.
- **Een regel blijft** wat in elk spel gebeurt: het jaar van de heer (de brief in de oogstmaand, Sint-Maarten, de
  grillen), de wilde rovers, het weer, de bazen. Een level zet een regel aan of uit met een spelregel, zoals de demo de
  wilde rovers uitzet.
- **De regie blijft** de speler van de scènes; een trigger zegt alleen welke.
- **De quests van het oude spel** (`js/quest.js`, `js/quests.js`, de bewerker ervan) worden door de triggers vervangen;
  `T.QUESTS` is leeg, en de tas, de voorwerpen en de geheime deuren hoorden bij de toren en Tiled (vraag G). De taal van
  de voorwaarden (`T.voorwaardeGeldt`) wordt er één voor de gesprekken en de triggers.

## 5. De editor

- **Het spel in een stand om te bewerken**, niet een tweede programma: hetzelfde tekenen, dezelfde camera en minikaart,
  dus net zo snel. De wereld tikt niet. *Play from here* begint het recept als spel, en Esc brengt je terug, zoals de
  proefdorp-stand van de bewerkers van de gesprekken nu.
- **De basislaag is de generator:** kies een zaad (zoals `npm run maker` het land van een paar eilanden laat zien), en verander dan alleen
  wat je wilt; het eiland is te groot om met de hand te maken.
- **De lagen**, elk een gereedschap:
  1. het land: de hoogte (hoger, lager, vlak; `T.egaliseer` is er), het water, de grond, bomen en rotsen (een kwast
     die plant of weghaalt), en wegen (`js/wegen.js`);
  2. de plekken: dorpsplekken, het kasteel, de kampen verschuiven of erbij zetten;
  3. de dorpen: van wie (een speler, de AI, de heer, de rovers), de gebouwen (af of als bouwplaats), de mensen, de
     voorraad, wat dicht is;
  4. gebieden en plekken met een naam;
  5. triggers en doelen: een lijst, en per trigger een formulier "als ... dan ..." met keuzelijsten, en de keuring ernaast;
  6. het level: de titel, de inleiding, de spelregels die vastliggen.
- **Bewaren:** voor ons schrijft de server `levels/<naam>.js` (zoals de gesprekken nu, met `T.bronBlok`); voor een
  speler een bestand (vraag B).
- Het vervangt `gereedschap/wereld.html`, dat met Tiled weggaat.

## 6. De campagne

- **Een rij levels**, met een inleiding ertussen (een brief of een scène); af is het volgende open. Van level naar level
  gaat alleen het verhaal mee, niet wat je had: elk level is dan op zichzelf in balans (zoals Age of Empires).
- **Voorstel: één gemaakt eiland voor de hele campagne** (vraag C), waarover het verhaal naar het kasteel reist. Elk
  level speelt op een andere plek en in een ander jaar, en leert één ding, zoals de campagnes van Age of Empires. Een
  schets, niet besloten:
  1. de aankomst en het eerste jaar (het demojaar);
  2. de rovers van het hol (werklijst K);
  3. het buurdorp: een bond of een strijd;
  4. de koning, of de opstand;
  5. het kasteel van de heer.

## 7. Skirmish

**Een skirmish is ook een level**, maar gemaakt door code uit de keuzes op het scherm (het eiland, wie meedoet, de AI,
de spelregels), met vaste triggers: wie `gevallen` is, ligt eruit, en de laatste die staat, wint. Zo zijn er voor de
campagne, skirmish en het vrije spel één begin en één motor.

- **7a3, de verdediger tegen de belegeraar:** daarvoor zijn het kasteel nodig (163: muren, torens en poorten los, zoals
  Stronghold), belegeren (189g: ladders, een ram, een blijde) en een AI die vecht. **Die AI heeft geen economie nodig**, en
  het hoofdspel heeft hetzelfde nodig: de opstand eindigt met het bestormen van het kasteel van de heer, en de
  verdediger van 7a3 is zijn bezetting. Daarom als eerste. Waar het kasteel vandaan komt: vraag E.
- **7a1, van niets tot er één valt:** daarvoor is een AI nodig die een dorp opbouwt. In een economie zoals die van The
  Settlers doen de mensen het werk zelf (de dragers, de bouwers, het veldwerk), dus de AI kiest alleen wat, waar en
  wanneer, en wanneer hij aanvalt; minder dan in Age of Empires, waar de AI elke werker stuurt. Hij speelt als een mens:
  dezelfde vraag als de muis (`handelingSturen`) en `T.geefOpdracht` (CLAUDE.md: "De heer of een ander dorp kiest uit de
  handelingen van een mens in zijn plaats"). Een bouwvolgorde per karakter, zoals de heer per spel een karakter heeft.
  Dezelfde AI is ook het buurdorp en de tegenspelers van vraag 60 tot 63.
- **Hoe lang:** een jaar duurt dertig uur op 1× en een uur op 30×, en een gevecht zet iedereen op 1×. Van niets tot er
  één valt, kan zo vele uren duren (vraag D).
- **Samen** komt na de lijn (6c van vraag 170, werklijst I); omdat de triggers in de tik draaien, werkt een level dan meteen samen.

## 8. De volgorde van bouwen (na de demo)

0. **De snoeironde (6b1, kan eerder):** Tiled eruit, de proefkaarten naar het proefdorp; mee weg gaan
   `gereedschap/wereld.html`, `js/kaart.js`, `kaarten/` en de kaarten als gebied, en de quests van het oude spel (vraag G).
1. **De motor:** de triggers, de gebieden, de doelen, `S.scenario`, de keuring, met toetsen. Het demojaar wordt het
   eerste level; de speeltest moet daarna hetzelfde jaar spelen als ervoor.
2. **Het level als recept**, en *Campaign* op het titelscherm.
3. **De editor**, in twee stappen: eerst de plekken, de dorpen, de gebieden, de triggers en de doelen op een eiland uit de
   generator; dan het land.
4. **De eerste levels** van de campagne.
5. **Het kasteel** (163), **belegeren** (189g) en een AI die vecht: 7a3 tegen de AI, en het kasteel van de heer in het
   hoofdspel.
6. **Een AI die bouwt:** 7a1 tegen de AI, en de dorpen van vraag 60.
7. **Samen** (de lijn, 6c van vraag 170): skirmish tegen elkaar.

## 9. Vragen aan Marcel

- **A, een level:** A1 een recept (het zaad, wat de editor veranderde, en wat erop staat), dat een nieuwe versie van het
  spel overleeft (voorstel); A2 een bewaard spel op minuut nul (eenvoudiger, maar bij elke nieuwe versie van het bewaren
  opnieuw maken).
- **B, de editor voor wie:** B1 alleen voor ons, in het gereedschap; B2 in het spel, ook voor spelers (mods zijn welkom,
  later de Steam Workshop), eerst alleen voor ons (voorstel).
- **C, de campagne:** C1 één gemaakt eiland voor alle levels, het verhaal reist naar het kasteel (voorstel); C2 elk level
  zijn eigen eiland. En gaat er iets mee van level naar level: alleen het verhaal (voorstel), of ook de aanvoerder en
  zijn veteranen?
- **D, hoe lang een skirmish 7a1 duurt:** D1 een spelregel voor het begin, zoals Age of Empires (gewoon, rijk, of een
  dorp dat er al staat) (voorstel); D2 een kortere dag in skirmish; D3 lang mag, zoals The Settlers.
- **E, het kasteel in 7a3:** E1 het staat er (uit de editor); E2 de verdediger bouwt het eerst, met een tijd en een
  budget; E3 allebei, te kiezen, zoals Stronghold (voorstel).
- **F, de heer in skirmish:** F1 nooit; F2 een spelregel, standaard uit (voorstel); F3 altijd.
- **G, de quests van het oude spel:** G1 mee weg in de snoeironde van Tiled, en de triggers komen ervoor in de plaats
  (voorstel; de gesprekken blijven); G2 laten staan tot de triggers er zijn.
