# Scenario's: de campagne, de editor en skirmish (vraag 187 en 188)

**Zo werkt het nu** (23 okt): dit is het ontwerp; er is niets van gebouwd, en bouwen komt na de demo (Marcel, 20 okt,
6a1). Marcel koos op 23 okt in twee rondes (hieronder, en samen in 9); J en K staan nog open.

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
- **Op dit ontwerp** (Marcel, 23 okt): "A, ik wil losse maps zoals de campaign in Knights and merchants of age of
  Empires. B, B2. C, 1 land kan, maar dan moet je groot genoeg zijn voor verschillende 'verhalen' je speelt steeds
  chapters die je uiteindelijk naar de finale brengen. Denk aan levels op een map Knights and merchants, dungeon keeper
  level select etc. D, leg even extra uit. E, leg even extra uit. F, in skirmisch geen heer. G, gaan weg met tiled."
  Dus: **elk level is een losse kaart** (1); **de editor zit in het spel, ook voor spelers, eerst voor ons** (5);
  **de campagne is een land met hoofdstukken, gekozen op een kaart** (6); **in skirmish geen heer** (7); **de quests van
  het oude spel gaan weg met Tiled** (4 en 8).
- **En daarna** (Marcel, 23 okt): "D, de skirmisch geeft elke speler x punten om soldaten en leger van te kopen. Nadat
  beide partijen zich hebben voorbereid, begint direct het gevecht op een random map. De tijd is gewoon x1 voor
  iedereen. E, 1 speler kiest een kasteel, de andere speler valt het kasteel aan. Ook een mogelijkheid tot zelf een
  kasteel bouwen in de orep fase. Dat houdt het spannend en nieuw. Eigenlijk e3. Een multiplayer is er zoizo, daarin
  spelen spelers het hele spel tegen elkaar of met elkaar. Ik zou ook een multiplayer campaign willen. Waarin je samen
  missies doet. H, h3. I, I1." Dus: **skirmish is een veldslag of een belegering, zonder economie** (7); van niets tegen
  elkaar (7a1 van 20 okt) is de multiplayer van het hele spel; **er komt een campagne voor samen** (6); een hoofdstuk is
  een uitsnede of een eigen eiland (H3), en alleen het verhaal gaat mee (I1).

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

## 1. Een level is een losse kaart, bewaard als recept

**Elk level is een losse kaart** (Marcel, 23 okt, A: "losse maps zoals de campaign in Knights and merchants of age of
Empires"), met een rand: wat erbuiten ligt, bestaat in dat level niet. Waar de kaart vandaan komt: een uitsnede van het
land van de campagne (6), of een eigen eiland uit de generator (H3: allebei).

Het voorstel van 20 okt was "een opgeslagen spel op minuut nul, plus triggers". **Beter: een recept dat het spel op
minuut nul maakt**, zoals het proefdorp. Een bewaard spel wordt geweigerd zodra de versie van het bewaren omhooggaat (nu
24, en die stijgt als iets anders heet of betekent); een campagne van tien levels zou dan bij elke stijging opnieuw
gemaakt moeten worden. Een recept bouwt het level elke keer met de code van vandaag. (Dit is techniek, de keuze van
Claude; Marcel zegt het als hij A anders bedoelde.)

```js
// levels/demojaar.js: één bestand per level, een script en geen JSON (dat laadt niet vanaf file://); de editor schrijft
// alleen het blok terug (T.bronBlok).
T.LEVELS.demojaar = {
  titel: 'The first year', inleiding: '...',
  eiland: { zaad: null },           // null: elk spel een ander eiland; een getal: een gemaakt eiland
  kaart: { ... },                   // de rand: een uitsnede van het eiland (x, y, breed, hoog), of het hele eiland
  land: { ... },                    // wat de editor aan het eiland veranderde, per tegel (zoals tegelsAnders nu)
  plekken: { ... },                 // de plekken van het eiland, verschoven of erbij
  dorpen: [{ wie: 'speler', plek: 'jij', begin: 'huifkar', wacht: ['speerman', 'speerman', 'kruisboogschutter'] }],
  spelregels: { ... },              // wat in dit level vastligt (T.OPTIES)
  dicht: ['wachthuis', 'wapenmaker'],
  gebieden: { ... }, triggers: [ ... ], doelen: [ ... ],
};
```

- **De rand:** het spel maakt het land al per stuk van 64 bij 64 tegels (B2, `w.open`); een level opent alleen de
  stukken binnen zijn rand, en de rand is niet te begaan en niet te zien (zwart, zoals in Knights and
  Merchants). Het demojaar en het vrije spel hebben geen rand.
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
- **De quests van het oude spel** (`js/quest.js`, `js/quests.js`, de bewerker ervan) gaan weg met Tiled (Marcel, 23 okt,
  G: "gaan weg met tiled"), en de triggers komen ervoor in de plaats; `T.QUESTS` is leeg, en de tas, de voorwerpen en de
  geheime deuren hoorden bij de toren en Tiled. De taal van de voorwaarden (`T.voorwaardeGeldt`) wordt er één voor de
  gesprekken en de triggers.

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
- **Voor wie** (Marcel, 23 okt, B2): in het spel, ook voor spelers (mods zijn welkom, `verpakken.md`), maar eerst alleen
  voor ons; *Editor* op het titelscherm komt er pas als hij af genoeg is voor een speler.
- **Bewaren:** voor ons schrijft de server `levels/<naam>.js` (zoals de gesprekken nu, met `T.bronBlok`); een speler
  bewaart in zijn eigen map (het verpakte spel, `verpakken.md`), en later deelt hij via de Steam Workshop.
- Het vervangt `gereedschap/wereld.html`, dat met Tiled weggaat.

## 6. De campagne

**Een land met hoofdstukken** (Marcel, 23 okt, C: "1 land kan, maar dan moet je groot genoeg zijn voor verschillende
'verhalen' je speelt steeds chapters die je uiteindelijk naar de finale brengen. Denk aan levels op een map Knights and
merchants, dungeon keeper level select etc.").

- **Het land is het keuzescherm**, zoals de kaart van Knights and Merchants en het land van Dungeon Keeper: één gemaakt
  eiland (een vast zaad, bijgewerkt in de editor), groot getekend, met een vaandel op de plek van elk hoofdstuk. Een
  hoofdstuk dat af is, krijgt jouw kleur, en het volgende gaat open; zo zie je het verhaal over het land naar het
  kasteel van de heer gaan, de finale. Dat beeld is er bijna: de minikaart (`js/minikaart.js`) en de schets van `npm run
  maker` tekenen het eiland al.
- **Elk hoofdstuk is een losse kaart** (1): **een uitsnede van dat land rond zijn plek**, of een eigen eiland voor een
  hoofdstuk dat over zee gaat (Marcel, 23 okt, H3; de maat van de generator is een getal, `T.EILAND_INSTELLINGEN.maat`,
  maar of hij op 300 tegels nog een goed eiland maakt, is niet geprobeerd). Met een uitsnede passen
  de kaart en het hoofdstuk bij elkaar: het hol ligt in het bos waar het vaandel staat, en het kasteel van de finale is
  het kasteel op de kaart. Een uitsnede van zo'n 250 bij 250 tegels is een kaart zoals in Knights and Merchants (die
  zijn 100 tot 200 tegels breed, maar onze tegels zijn kleiner: een hut beslaat er 5 bij 4); op een eiland van 2500 bij
  2500 is plek voor tientallen, dus het land is groot genoeg voor verschillende verhalen.
- **Tussen de hoofdstukken** een inleiding (een brief of een scène) en een kort verslag. Van hoofdstuk naar hoofdstuk
  gaat alleen het verhaal mee, niet wat je had: elk hoofdstuk is dan op zichzelf in balans, zoals in Knights and
  Merchants en Age of Empires (Marcel, 23 okt, I1).
- **Een schets van de hoofdstukken**, niet besloten; elk leert één ding, zoals de campagnes van Age of Empires:
  1. de aankomst en het eerste jaar (het demojaar);
  2. de rovers van het hol (werklijst K);
  3. het buurdorp: een bond of een strijd;
  4. de koning, of de opstand;
  5. het kasteel van de heer (de finale; met het belegeren van 7).
- **Een campagne voor samen** (Marcel, 23 okt: "Ik zou ook een multiplayer campaign willen. Waarin je samen missies
  doet."). Voorstel (vraag J): een eigen rij missies, elk gemaakt voor twee (later tot vier, zoals de lijn), en elk met
  zijn eigen dorp, zoals in het spel samen (werklijst I, 6a2: "echt losse spelers met hun eigen dorp"). De doelen zijn
  van allebei, en een trigger kent dan ook `samen` (samen 500 graan, of het hol van twee kanten); een missie geeft ieder
  een eigen rol (de een heeft het graan, de ander de mannen). Omdat de triggers in de tik draaien, is een missie op
  beide computers dezelfde, zodra de lijn er is (6c van vraag 170).

## 7. Skirmish: een veldslag of een belegering

**Skirmish heeft geen economie** (Marcel, 23 okt, D en E; zijn woorden staan bovenaan): geen huifkar, geen dorp en geen
jaar, alleen een leger, een kaart en het gevecht, op 1× voor iedereen, zonder versneller. **En geen heer** (F). Van niets
tegen elkaar spelen tot er één valt (7a1 van 20 okt) is de multiplayer van het hele spel (werklijst I, 6a tot 6c), niet
skirmish.

- **De veldslag:** elke kant krijgt evenveel punten (een getal op het scherm van de skirmish) en koopt er soldaten van.
  Dan stellen ze op, elk in zijn eigen strook aan een kant van de kaart, zonder de ander te zien (de mist). Zijn ze
  allebei klaar, of is de tijd van de voorbereiding om, dan begint het gevecht. Wie geen mannen meer heeft, verliest
  (voorstel).
- **De belegering** (E3): de verdediger kiest een kasteel uit een lijst (gemaakt in de editor, door ons en later door
  spelers), of bouwt er zelf een in de voorbereiding, met een tijd en een budget; hij koopt zijn bezetting met punten.
  De belegeraar koopt met meer punten (een getal in de werkbank) zijn leger en zijn ladders, ram en blijde (189g). De
  belegeraar wint als hij de burcht inneemt, het hart van het kasteel; de verdediger als de belegeraar niemand meer
  heeft (voorstel). Een kasteel kiezen komt eerst, zelf bouwen erna: dan is het gevecht te proberen zonder bouwfase.
- **De prijs van een soldaat is de waarde van zijn stukken.** Elke soort heeft vaste stukken (`T.SOLDAAT_SOORTEN`: de
  militie een hooivork, de speerman een speer en een harnas, en zo de piekenier, de zwaardvechter, de boogschutter en de
  kruisboogschutter), en elk stuk heeft al een waarde in goud, in de tabel van de punten van 186
  (`T.EINDE_INSTELLINGEN.waarde`: een speer 2, een harnas 2, een kruisboog 3; alleen de hooivork van de militie staat er
  nog niet in). Een speerman kost zo 4. Zo komt er geen tweede prijslijst.
- **De kaart komt uit de generator:** een willekeurig zaad, en daaruit een uitsnede van zo'n 120 bij 120 tegels (een
  getal in de werkbank), met open land, wat heuvels en bos, en de twee stroken over land te bereiken (de pad-zoeker kijkt
  het na). Voor een belegering staat het kasteel erop.
- **Een skirmish is ook een level** (1): een recept dat code maakt uit de keuzes op het scherm, met vaste triggers voor
  winst en verlies. Zo zijn er voor de campagne, skirmish en het spel één begin en één motor.
- **De AI** koopt alleen een leger (een paar mengsels per karakter), stelt op en vecht; in de belegering bemant hij de
  muren of bestormt hij ze. Een AI die een dorp opbouwt, is voor skirmish niet nodig. Het vechten en het sturen zijn er al
  (`js/gevecht.js`, `js/kiezen.js`).
- **Een proefbank voor het vechten:** nu speel je tot de overval voor een gevecht; met de veldslag zet je in een minuut
  twaalf speermannen tegen acht boogschutters, en zoek je de balans van de soldaten met de getallen uit de werkbank.
- **Samen:** een veldslag is kort en heeft geen economie, dus het is de eerste goede proef voor de lijn (6c van vraag 170).
- **Het kasteel van de heer** in het hoofdspel vraagt hetzelfde als de belegering: het kasteel (163), het belegeren en
  een AI die verdedigt. De belegering en de finale van de campagne komen daarom samen.

## 8. De volgorde van bouwen (na de demo)

0. **De snoeironde (6b1, kan eerder):** Tiled eruit, de proefkaarten naar het proefdorp; mee weg gaan
   `gereedschap/wereld.html`, `js/kaart.js`, `kaarten/` en de kaarten als gebied, en de quests van het oude spel (G).
1. **De motor:** de triggers, de gebieden, de doelen, `S.scenario`, de keuring, met toetsen. Het demojaar wordt het
   eerste level; de speeltest moet daarna hetzelfde jaar spelen als ervoor.
2. **Het level als recept**, met zijn rand, en *Campaign* op het titelscherm, met het land als keuzescherm.
3. **De veldslag:** de punten, kopen en opstellen, een kaart uit de generator, een AI die een leger koopt en vecht. Klein,
   want het vechten is er, en meteen een proefbank voor de balans.
4. **De editor**, in twee stappen: eerst de plekken, de dorpen, de gebieden, de triggers en de doelen op een eiland uit de
   generator; dan het land.
5. **De eerste hoofdstukken** van de campagne.
6. **Het kasteel** (163), **belegeren** (189g) en een AI die verdedigt en bestormt: de belegering, eerst met een kasteel
   uit de lijst, dan met zelf bouwen; en de finale van de campagne.
7. **Samen** (de lijn, 6c van vraag 170): eerst de veldslag, dan de belegering, het hele spel (werklijst I) en de
   campagne voor samen.

## 9. Besloten, en nog open

**Besloten** (Marcel, 23 okt):
- A, losse kaarten (1); B2, de editor in het spel, ook voor spelers, eerst voor ons (5); C, één land met hoofdstukken,
  gekozen op een kaart (6); F, in skirmish geen heer (7); G, de quests van het oude spel gaan weg met Tiled (4 en 8).
- D, skirmish geeft punten voor een leger, dan het gevecht op een willekeurige kaart, op 1× (7); E3, de verdediger kiest
  een kasteel of bouwt er een, de ander valt aan (7); H3, een hoofdstuk is een uitsnede of een eigen eiland (6); I1,
  alleen het verhaal gaat mee (6); en een campagne voor samen (6).

**Nog open:**
- **J, de campagne voor samen:** J1 een eigen rij missies, elk voor twee, ieder met zijn eigen dorp en een eigen rol
  (voorstel); J2 dezelfde campagne, ook samen te spelen (elk hoofdstuk krijgt een tweede dorp, en moet alleen en samen
  in balans zijn); J3 samen in één dorp, de een bouwt en de ander vecht.
- **K, een AI die een dorp opbouwt** (niet nu nodig, maar het is het grootste stuk AI): skirmish heeft hem niet meer
  nodig, en samen spelen ook niet. Hij stond er nog voor het spel alleen, met tegenspelers die zelf een dorp bouwen
  (vraag 60 tot 63, 29 sep, van voor de richting van 11 okt). K1 ja, die komen er later; K2 nee: in het spel alleen zijn
  de heer, zijn bondgenoten en de rovers de tegenstanders, en tegen een ander dorp speel je samen of in een hoofdstuk
  (voorstel, omdat het veel werk scheelt); K3 later beslissen.
- De voorstellen voor winst en verlies (7), en de schets van de hoofdstukken (6), tot Marcel er iets van zegt.
