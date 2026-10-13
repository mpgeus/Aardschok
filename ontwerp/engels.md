# Engels: de woordenlijst en de toon (vraag 147, stap 2)

Marcel, 11 okt: "Alles gelijk in het Engels maken. Nederlands mag je mee stoppen", en op vier vragen: alleen wat de
speler ziet (de code, het commentaar en `ontwerp/` blijven Nederlands), het Nederlands weg maar `T.t` blijft (de haak
voor een vertaling uit de community), gewone maanden en Engelse namen, en elk deel naar `main` zodra de toetsen groen
zijn (`commercieel.md`, vraag 147). Dit bestand houdt het Engels gelijk over alle sessies en agents die omzetten: wie een
zin omzet, neemt de woorden van hieronder, en wie een woord verandert, verandert het hier en overal.

## Hoe een zin eruitziet

- **Brits Engels** (`en-GB`, zoals `T.BRONTAAL`): *colour, favour, labourer, ploughed, grey, harbour*; datums als
  "1 March", getallen met een punt als decimaalteken ("1.5 workdays").
- **Kort en droog, zoals het Nederlands nu.** Geen uitroeptekens, geen moderne woorden (*okay, cool, stuff*), geen
  sprookjestaal (*thee, thou, verily*). Wat de speler moet weten, staat vooraan.
- **De heer** is verward en ziet alleen geld; zwarte satire: hij is lachwekkend, zijn straffen niet. Hij schrijft over
  zichzelf met een hoofdletter in het meervoud, zoals in het Nederlands ("Bedank Ons niet"): *We, Us, Our* ("Do not
  thank Us.").
- **Elke zin die de speler ziet, is `T.t('...')`** met de woorden erin als `{naam}` (`js/taal.js`): geen zin uit losse
  stukken plakken, want een vertaler moet de hele zin zien. Een meervoud is `{n|# hut|# huts}`. Daarna `npm run teksten`.
- **Wat geen speltekst is, blijft Nederlands:** het commentaar, `Spel.debug` (dat lezen wij, niet de speler), de
  berichten in de console, de namen in de code (`'lentemaand'`, `soort: 'boerderij'`).
- **Een naam in een zin:** zet het lidwoord in de zin, niet in de naam: `T.t('The {gebouw} is ready.')`. Moet het *a*
  of *an* zijn, geef de naam dan met zijn lidwoord mee: `T.t('{gebouw} is coming here.', { gebouw: T.eenNaam(naam) })`
  (`js/taal.js`: *an* voor een klinker, *a* voor de rest).

## De hulpjes

Wat elke zin nodig heeft, staat op één plek, al in het Engels:
- een gebouw: `T.GEBOUWEN[soort].naam` en `.meervoud` (*hut, huts*), met *a/an* `T.eenNaam(naam)`;
- een waar: `T.waarNaam(wat)` (*grain*) en met een aantal `T.hoeveel(n, wat)` (*3 grain, 1 tool*), `js/voorraad.js`;
- een maand: `T.MAANDEN[i].toon` (*March*), nooit `.naam` in een zin; een seizoen: `T.SEIZOEN_TOON[seizoen]`; een datum:
  `T.datumVanDag(dag).tekst` (*3 August 1323*), `js/tijd.js`;
- een opsomming: `T.opsomming(namen)` (*a, b and c*, `js/verkennen.js`); een klein getal in woorden: `T.telwoord(n)` (*five*,
  `js/wereld.js`); een hoofdletter: `T.hoofdletter`.

## De woorden

| Nederlands | Engels | |
|---|---|---|
| de schout | the reeve | de speler; "you" waar hij wordt aangesproken |
| de heer | the lord, his lordship | in een brief: *the Lord of ...* |
| de koning | the king | |
| het gehucht, het dorp, marktrecht, de stad | the hamlet, the village, the market town, the town | de treden |
| de gunst van de heer | the lord's favour | een van de twee bazen |
| het vertrouwen van het dorp | the village's trust | de andere |
| de schatting, de tiende | the tribute, the tithe | wat de heer int |
| Sint-Maarten | Martinmas | 11 November |
| de heervaart | the levy | mannen voor de heer |
| de grillen van de heer | the lord's whims | |
| de schandpaal | the pillory | |
| de marskramer | the peddler | |
| de bode | the messenger | |
| de raadsman, het rapport | the advisor, the morning report | |
| de raad (linksboven) | advice | |
| de herberg | the inn | |
| de wetten, de feesten, de voorvallen | the laws, the feasts, events | |
| de standen: keuters, dorpelingen, ambachtslieden, boeren | cottars, villagers, craftsmen, farmers | |
| de wensen | wants | "what the cottars want" |
| tevreden, tevredenheid | content, contentment | |
| de meent | the common | |
| de dagloners | day labourers | |
| de militie | the militia | |
| rovers, wolven | robbers, wolves | |
| het plein | the square | |
| het kamp, de tent, het afdak, het kampvuur | the camp, the tent, the lean-to, the campfire | |
| de huifkar, de ossenkar | the covered wagon, the ox cart | |
| de bouwplaats, de bouwers, meebouwen | the building site, the builders, help build | |
| rooien | clear | "clear the site" |
| een werkdag | a workday | |
| het bouwmenu | the build menu | |
| de voorraad | the stores | |
| graan, zaaigraan | grain, seed grain | |
| hout, brandhout, planken | wood, firewood, planks | |
| goud | gold | |
| gereedschap | tools | |
| meel, brood, bier, wijn | flour, bread, ale, wine | bier is *ale* (middeleeuws) |
| vlees, vis, melk, kaas, zout | meat, fish, milk, cheese, salt | |
| hooi, wol, laken, leer, ijzer, steen | hay, wool, cloth, leather, iron, stone | |
| de akker, de braak, de weide | the field, fallow, the meadow | |
| zaaien, maaien, binden, de oogst | sow, reap, bind, the harvest | |
| de schoven, de hokken, het zwad | the sheaves, the stooks, the swath | |
| de wijngaard, de rank, plukken | the vineyard, the vine, pick | |
| de hut, het huis, het stenen huis, de woontoren | the hut, the house, the stone house, the tower house | |
| de boerderij, de wijnboerderij | the farm, the vineyard farm | |
| de houthakker, de timmerman, de smidse | the woodcutter, the carpenter, the smithy | |
| de molen, de bakkerij, de brouwerij | the mill, the bakery, the brewery | |
| de weverij, de kuiper, de slager, de leerlooier | the weaver's, the cooper, the butcher, the tanner | |
| de visser, de jager, de schaapskooi | the fisherman, the hunter, the sheepfold | |
| de put, de kapel | the well, the chapel | |
| de graanschuur, de tiendschuur | the granary, the tithe barn | |
| de honger, de kou, de droogte, de koorts | hunger, cold, drought, fever | statussen |
| het erf, het looppad | the plot, the walkway | het looppad is de vrije strook om een gebouw |
| de handen (werkers van een gebouw) | hands | "at work (1 of 1 hands)" |
| akker, weide, braak (wat een veld is) | arable, meadow, fallow | `T.BESTEMMING_NAAM`; een veld is *a field* |
| de mest, een kar mest | dung, a cartload | |
| het vee, de kudde, de koe, het schaap | livestock, the herd, cow, sheep | het schaap en de schapen zijn allebei *sheep* |
| de roedel, de jacht, de jager | the pack, the hunt, the hunter | de wolven |
| de kooi | the sheepfold | de schaapskooi |

## Erbij in deel 1 (wensen, raad, rapport)

| Nederlands | Engels | |
|---|---|---|
| de herbergierster | the innkeeper | |
| de oproep op het plein, de premie | the notice, the bounty | |
| de tegel | the tile | "within 40 tiles" |
| de zielen | souls | wat de heer telt |
| de buurt | the neighbours | "the neighbours want a well" |
| het bos van de heer | the lord's forest | |
| de handen (wie werkt) | hands | "the hunter has no hands" |
| het doel | the goal | |
| het gezin | the family | "No family is coming" |
| ontbreken / missen | lack / be short of | "short of 6 gold" |
| doorgroeien | grow into | "A hut has grown into a house" |

## Erbij in deel 4 (de heer, de wetten, de feesten)

Sint-Maarten is overal *Martinmas* (de eerste brieven zeiden nog *St Martin's Day*). Wie de heer antwoordt (een knop
onder een gril), zegt *my lord*; de raadsman schrijft de schout aan met *Master reeve*.

| Nederlands | Engels | |
|---|---|---|
| het ambt, je ambt kwijt, ontslaan | office, lose your office, dismiss | "You are dismissed." |
| de boete, de schuld | a fine, what you still owed | |
| de pacht, het hoofdgeld | the rent, poll tax | wat de heer vraagt |
| de kist, de schuren | the chest, the barns | "a share of the 40 gold in your chest" |
| de soldaten in huis | the lord's soldiers billeted here | |
| aan de schandpaal | in the pillory | "You put yourself in the pillory." |
| de straffen: boete, soldaten, schandpaal | a fine, soldiers, the pillory | `T.STRAF_TOON` (`js/heer.js`) |
| hoe de heer of het dorp erbij staat: blij, tevreden, ontevreden, boos | pleased, content, displeased, angry | `T.bazenTekst` |
| het dorp mort, wegjagen | the village grumbles, drive out | |
| vrijkopen, weerbare mannen, sneuvelen | buy out, able-bodied men, fall | de heervaart |
| Kromwijk, Oosterwolde | Crookwick, Eastwold | de oorlogen van de heer |
| marktrecht verlenen | grant a market charter | |
| het jaarboek | the yearbook | |
| zilver, een pak | silver, a pack | de brief aan de marskramer |
| de wetten: Rantsoen (krap, gewoon, ruim) | Rations (short, normal, generous) | het dorp heeft last van *the short rations* |
| Vreemden welkom, Houtkap in het bos van de heer, Belasting | Strangers welcome, Felling in the lord's forest, Tax | |
| aannemen, afschaffen | pass, repeal | |
| het oogstfeest, de meiboom, kerstavond | the harvest feast, the maypole, Christmas Eve | `T.FEESTEN[x].naam` |
| de grillen: het standbeeld, het vette varken, … | the statue, the fat pig, his nephew's wedding, the hunt, the window tax, the court poet, the bishop's bell, the soldiers passing through, his birthday, the falcon, the loan, the road to the castle, the portrait, the plague in the district | `T.GRILLEN[x].titel` |

## Erbij in deel 3 (het scherm)

| Nederlands | Engels | |
|---|---|---|
| het rekenboek, de kas | the ledger, the treasury | de tafel; de kas is de post voor het goud |
| de zandloper, de lat | the hourglass, the scale | de snelheden: *pause*, 1×, 3×, 10×, 30× |
| het wetboek, de bel, de inktpot | the lawbook, the bell, the inkwell | de dingen op tafel |
| de spelregels, de werkbank | the game rules, the workbench | het venster op O |
| de fotomodus | photo mode | |
| de provincie, het land | the province, the land | de kaart van het land; een provincie heet met een kleine letter (*the castle*), de kaart zet de hoofdletter |
| de pacht | rent | graan op Sint-Maarten (`GRONDSTOF_UITLEG.graan`) |
| de wissel (van de velden) | the changeover | 1 March, als de boeren ploegen |
| het slachten | the slaughter | het venster en de knop |
| je ambt kwijt, weggejaagd | you lost your office, driven out | de schermen van het einde |
| op bestelling | on order | de marskramer die een bode haalde |
| een pak | a pack | wat de marskramer draagt |
| de klok | *half past seven*, *seven o'clock* | `T.uurTekst` in `js/dag.js`; het deel van de dag is *night, morning, work, break, evening* (`DAGDELEN` in `js/hud.js`) |

## Erbij in deel 5 (het dorp dat spreekt: de gesprekken, de voorvallen, de raadsman)

**Een zin uit de gegevens.** De gesprekken (`js/gesprekken.js`) en de quests (`js/quests.js`) zijn gegevens die een
bewerker terugschrijft (`T.bronBlok`): daar staat de Engelse zin als gewone tekst, niet in `T.t`. Wie zo'n zin toont,
vertaalt hem met `T.tGegevens(zin)` (`js/taal.js`); een gesprek doet dat in `T.vulWoordenIn` (`js/gesprek.js`), dus wat
in de gespreksschrijver staat, is meteen goed. `npm run teksten` leest de zinnen uit die tabellen (`GEGEVENS` in
`gereedschap/teksten.cjs`). Een zin schrijf je zoals elke andere: Engels, met `{wie}` en `{ander}` erin, en een string
met een apostrof tussen dubbele aanhalingstekens (zo schrijft de bewerker hem ook). De situaties zijn voor de schrijver,
en blijven Nederlands. `T.VOORVALLEN` en `T.OORZAKEN` zijn gewone code: daar staat alles in `T.t`.

De stem: wie de schout aanspreekt, zegt *reeve* ("Reeve, {ander} took two hens from my coop."), de heer zegt *We, Us*
en de schout zegt hem *my lord*; de soldaten zeggen gewoon *we*. Een uitroepteken alleen waar het Nederlands er een had
(brand, wolven, de roddelaar). De mensen praten met *don't, I'll*, de heer en de vertelling niet. Een karakter zegt nooit
*he* of *she* over zichzelf, behalve de weduwe en de vroedvrouw (zij zijn altijd een vrouw).

| Nederlands | Engels | |
|---|---|---|
| het voorval, wie je zoekt | an event, someone looking for you | "{wie} is looking for you." |
| verbannen, het bos in | banish, go into the forest | "{wie} must go into the forest" |
| de prijs: tevredenheid, gunst, vertrouwen | contentment +3%, the lord's favour +5, the village's trust −3 | `T.prijsVanKeuze` |
| "want" in een status | ", for" | "There is hunger, for the rations are short." |
| de statussen: honger, kou, vol, wolven, droogte, koorts, brandgevaar, onvrede | Hunger, Cold, Full, Wolves, Drought, Fever, Fire risk, Discontent | `T.OORZAKEN[x].naam` |
| en erger: hongersnood, strenge kou, overvol, ernstige droogte, epidemie, groot brandgevaar, onrust | Famine, Bitter cold, Overcrowded, Severe drought, Epidemic, High fire risk, Unrest | |
| de karakters: zanger, weduwe, woekeraar, vroedvrouw, heethoofd, vrome, roddelaar, oudste, nieuwkomer, drinker | singer, widow, moneylender, midwife, hothead, pious, gossip, the elder, newcomer, drinker | `T.KARAKTERS[x].kort`; boven hun gesprek *the singer*, ... |
| de eigenschappen: snelle en trage maaier, groene vingers, slordig, zuinig, kwistig, geliefd, gehaat, gewoon | fast reaper, slow reaper, green fingers, careless, thrifty sower, wasteful sower, well loved, hated, ordinary | `T.BOEREN_INSTELLINGEN` |
| de vaardigheden van de raadsman | judges well/badly, can hold their tongue / cannot keep a secret, good/bad with figures, handy / all thumbs, can fight / timid | `T.VAARDIGHEDEN` |
| hoe hij beslist | "Decides generously: ..." | `T.RAADSMAN_NEIGINGEN` |
| de woeker, de woekeraar | usury, the moneylender | |
| het buurdorp | the next village | |
| de mensen: de smid, de smidsvrouw, de boerin, de dorpsoudste, de kleuter, de kruidenvrouw, de koster, de wachter | the smith, the smith's wife, the farmer's wife, the village elder, the toddler, the herb woman, the sexton, the watchman | `T.MENSEN[x].naam` |
| de stuiver, de gilde, de drijvers | a penny, the guild, the beaters | |
| de stroper, de zwerver, de heks, de akkergrens | the poacher, the vagrant, the witch, the field boundary | titels van voorvallen |
| "Tot ziens." | "Good day." | het afscheid van een boer |

## Erbij in deel 6 (het werk en de rest)

Het gevecht schrijft kort en in de tegenwoordige tijd ("You hit the wolf: 3 damage."); geen uitroeptekens, ook niet bij
"The wolf sees you." De schout is *you* in zijn eigen gevecht en *the reeve* waar iemand anders over hem spreekt.

| Nederlands | Engels | |
|---|---|---|
| de huifkar, de ossenkar (naam van de kar) | covered wagon, ox cart | `D.begin.kar.naam`, met kleine letter |
| de band met het hoofd van het gezin | son, daughter, mother, father, daughter-in-law, wife, husband | "Gerard, son of Nicholas" |
| de oude X, de kleine X | old X, little X | "old John, father of Nicholas" |
| de tooltip bij een mens | no work, shepherd, off to the inn, leaving, new in the hamlet | "Gerard, son of Nicholas · shepherd" |
| een gezin komt over de weg | A new family is coming along the road | "They clear their plot, then build their hut." |
| ontgonnen (bos, heide) | cleared | "The forest of Gerard has been cleared" |
| de bode: het gevaar | small, real, great, very great | "The danger on the road is small (the dark)." |
| de bode: de brief aan de marskramer, de hinderlaag | the letter, "At the village exit robbers stopped them" | |
| de marskramer: zijn mars, zijn beurs | his pack, his purse | de redenen bij kopen en verkopen |
| het zaaigraan, wachters bij de graanschuur | seed grain, guards | `T.waarNaam('zaaigraan')` |
| de monsters (`T.WEZENS[x].naam`) | slime crawler, skeleton guard, wolf, giant spider, kobold, robber, guard, veteran | met kleine letter: "The {wezen} sees you." |
| de klappen (`aanval.zin`) | bites {doel}, hits {doel} with his sword, bites {doel} with her fangs, stabs {doel} with his spear, hits {doel} with a club | `{doel}` is *you* of de naam van wie geraakt wordt |
| slaan, lopen, de deur dichtgooien | hit, walk, slam the door shut | de knoppen en de berichten van het gevecht |
| gevallen | fallen | het scherm als de schout valt |
| de voorwerpen (`T.VOORWERPEN[x].naam`) | the pillory, the maypole, the Christmas tree, a wolf den, a stall, a basket, a vine, a tent, the campfire | met hun lidwoord |
| de proefkamers | the hall, the storeroom, the stairwell | |
| de koorts, van ouderdom | the fever, old age | de reden bij een sterfgeval: "Old age: Henry died." |
| een proefje, de opslag | a try-out, the browser storage | de redenen van `js/opslaan.js` |
| de weg de wereld in | the road into the world | de uitgang van het gehucht |
| de afwisseling (vraag 154, 13 okt): de status, en erger | Plain fare, One dish | "The food is plain, for the village eats only grain and wine, and works at 75%." |

## Erbij in deel 7 (de spelregels: `js/opties.js`)

De naam en de uitleg van een spelregel en van elke keuze zijn `T.t('...')`, een gewone tekst zonder woorden erin (de
bladzijde met getallen, `gereedschap/instellingen`, leest ze zo uit de tekst: `I.tekstVan`). De ids en de paden in `zet`
blijven Nederlands. **De namen van de getallen in de werkbank** staan in `NAAM_VAN_SLEUTEL` (`js/opties.js`): per sleutel
van een pad (`pachtPerAkkertegel`, `rovers` · `perRover`) één Engelse naam voor alle blokken; zegt een sleutel in één blok
iets anders, dan staat hij bij `NAAM_VAN_PAD` met het hele pad. Een nieuw getal in een blok krijgt daar zijn naam
(`test/opties.test.cjs` valt erover), en `T.werkbankNaam(pad)` geeft hem. Een label is de namen van het pad met ` · ertussen
("firewood per household per day", "buys · grain · price · spring"); bij het marskramerbezoek en de straf staat de naam
die de speler ziet (`toon`, `T.STRAF_TOON`). Een datum van Marcels besluiten ("Zoals voor 8 okt") is *As before 8 October*.

| Nederlands | Engels | |
|---|---|---|
| de spelregels, de keuzes | game rules, choices | het venster op O; een knop heet kort (*Yes*, *No*, *On*, *Off*) |
| Hoe de heer telt: slecht, precies, steeds zwaarder | How the lord counts: Badly, Exactly, Harsher each time | de uitleg zegt *short* (te weinig) in breuken: "Up to a third short, a fine" |
| geloot, vast | drawn by lot, fixed | de boeren |
| vult een maag, alleen tevredener | fills a stomach, only more content | vlees en vis |
| naar stand | by standing | de kleren |
| het kijkvenster, het raster, het kijkgat | the viewing window, the grid, the peephole | de doorkijk |
| de videokaart | the graphics card | |
| de schaft, het erf, de straal | the break, the plot, the radius | de namen in de werkbank |
| de beekjes | the brooks | het weer |
| de ondernemers (kop van de werkbank) | the tradesmen | een inwoner die een werkplaats wil beginnen |
| de gunst per goud, de wrok, de dank | favour per gold, grudge, gratitude | de ondernemers en de heervaart |

## De maanden

Gewone maanden (Marcel, 11 okt): de namen waar de regels op letten blijven in de code (`'lentemaand'`); wat de speler
ziet, is `T.MAANDEN[i].toon` (`js/tijd.js`): January, February, March, April, May, June, July, August, September,
October, November, December. De seizoenen: winter, spring, summer, autumn.

## De namen

Engelse namen uit de middeleeuwen (Marcel, 11 okt). De vijf boeren van het gehucht dat er al was, krijgen de Engelse vorm
van hun naam: Klaas → **Nicholas**, Aaltje → **Alice**, Gerrit → **Gerard**, Trijn → **Kate**, Wouter → **Walter**.

- Mannen (`T.VOORNAMEN.man`, `js/bewoners.js`): Adam, Alan, Bartholomew, Edmund, Geoffrey, Gilbert, Godfrey, Hamon,
  Henry, Hugh, John, Lambert, Laurence, Martin, Osbert, Peter, Ralph, Reginald, Richard, Robert, Roger, Simon, Stephen,
  Thomas, Wat, William.
- Vrouwen (`T.VOORNAMEN.vrouw`): Agnes, Amice, Avice, Beatrice, Cecily, Christina, Edith, Emma, Hawise, Isabel, Joan,
  Juliana, Lettice, Mabel, Margery, Matilda, Maud, Petronilla, Rose, Sybil, Thomasina.
- Dorpen (`T.DORPSNAMEN`, `js/treden.js`): Heathside, Brookfield, Wolfden, Oldland, Millcombe, Oakley, Fieldhurst,
  Crowthorpe, Lindley, Brakeham.
