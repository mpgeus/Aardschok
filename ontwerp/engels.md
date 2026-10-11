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
