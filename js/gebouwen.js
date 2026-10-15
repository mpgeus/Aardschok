// De gebouwen van het dorp: welke soorten er zijn, op één plek (T.GEBOUWEN), zoals js/mensen.js
// dat voor mensen doet. Zie ontwerp/spel.md, "Gebouwen" voor het voorstel (Marcel, 23 sep 2026:
// "huis, deze zorgen ervoor dat je populatie kan groeien; boerderij, meer mensen op de akker.
// Smidse, timmerman, wapenmaker. En alle anderen.") en ontwerp/werklijst.md, punt 2. (De timmerman is sinds 14 okt de zagerij.)
//
// ── Vorm van één soort ──
//
//   T.GEBOUWEN.<id> = {
//     naam:        'huis',           // zoals hij heet
//     trede:       'gehucht',        // gehucht | dorp | marktrecht | stad (wanneer hij vrijkomt)
//     voet:        { b: 6, h: 6 },   // maat in tegels, als de tekening nog niet bekend is (of
//                                    // geen tekening heeft); T.gebouwVoet(soort) gebruikt liever
//                                    // de echte maat van de tekening zelf ("beslaat" in de .tsx).
//     kosten:      { hout: 16, goud: 4 },  // eenmalig, bij het neerzetten (later ook "steen")
//     heer:        { goud: 2 },      // wat de heer er elk jaar op Sint-Maarten voor wil, omdat hij
//                                    // hem ziet (js/heer.js, T.eisVanDeHeer; ook in aanbouw). {}
//                                    // is niets: een hut oogt arm.
//                                    // Hij vraagt naar wat hij ziet: wol bij schapen, eieren bij
//                                    // kippen, hout voor zijn bos; de rest in goud. Het bouwmenu
//                                    // laat het zien (js/hud.js).
//     bouwtijd:    4,                // dagen tot hij klaar is
//     handen:      0,                // hoeveel mensen hij als werkplaats vraagt
//     liefst:      'jong',           // wie hij het liefst neemt (T.LEEFTIJDEN, js/bewoners.js): de
//                                    // schaapskooi een knaap. Ontbreekt hij, dan eerst volwassenen.
//     woonruimte:  5,                // hoeveel mensen erbij kunnen als hij klaar is
//     meervoud:    'huizen',         // alleen bij een woning met een stand (js/wensen.js): "vijf hutten willen een put"
//     wordt:       'huis',           // waar hij in doorgroeit als zijn bewoners lang genoeg
//                                    // tevreden zijn (js/behoeften.js, T.tikBehoeftenDag); alleen
//                                    // bij een huis dat de speler zelf neerzette. Ontbreekt hij,
//                                    // dan groeit deze soort niet door.
//     maakt:       null,             // of { in: {hout: 1}, uit: {planken: 1} }: per dag, op volle
//                                    // bezetting (T.tikGebouwenDag schaalt mee met hoe bezet hij is
//                                    // én, sinds js/behoeften.js, met de tevredenheid). Wie iets
//                                    // omzet (met `in`), maakt tot er genoeg ligt (T.maaktTot).
//                                    // Met `keuze` (de wapenmaker) maakt hij per dag één van zijn
//                                    // waren, met keuze[wat] als wat erin gaat; `in` is dan alles
//                                    // wat hij kan vragen (T.receptVan).
//     bij:         null,             // of { natuur: 'bos', straal: 10, minstens: 30 }: hij hoort bij het
//                                    // bos, de rotsen of het water (T.NATUUR), en wordt alleen gebouwd
//                                    // waar daarvan zoveel binnen `straal` tegels van zijn voet ligt.
//                                    // Meer dan het looppad (drie tegels): een boom, een rots en water
//                                    // staan in de weg, dus ze liggen pas daarbuiten
//     stilIn:      null,             // of { winter: 'de beek ligt dicht' }: in dat seizoen maakt hij
//                                    // niets, en dit is waarom (de visser; spel.md, "Handel")
//     kerk:        false,            // telt als "een kerk" voor de behoeften (js/behoeften.js:
//                                    // T.heeftKerk) — nu alleen de kapel, later ook de kerk zelf
//     lantaarn:    true,             // van het dorp: als hij klaar is, komt er een lantaarn naast de
//                                    // deur die 's avonds brandt (js/paden.js, T.zetLantaarns)
//     woning:      true,             // een huis om in te wonen (hut, huis, stenen huis): in het lege begin
//                                    // trekt er een gezin uit het kamp in (js/begin.js)
//     leeg:        true,             // alleen in het lege begin (js/begin.js, D.begin): het huis van de schout,
//                                    // de akker en de wijngaard
//     veld:        'boerderij',      // een veld dat je bij een boerderij legt, als rechthoek (js/boerderij.js): de
//                                    // akker en de wijngaard; de bouwers maken hem, en dan is het land. De soort zegt
//                                    // bij welke boerderij hij hoort: de akker bij 'boerderij', de wijngaard bij
//                                    // 'wijnboerderij'
//     eenmalig:    true,             // staat maar één keer in het bouwmenu: is hij er (ook in aanbouw), dan niet meer
//     opslag:      true,             // een opslag: als hij af is, bouw je ook binnen bereik van hem (T.inBouwBereik)
//     kar:         true,             // en hij krijgt een eigen ossenkar als hij af is (de schuur; js/kar.js)
//     menu:        true,             // false: niet via het bouwmenu (stadsmuur, palissade — die hebben
//                                    // een eigen manier van neerzetten, geen enkele voet)
//     tekening:    'gebouwen/dorpshuis1',  // "vel/naam" uit tegels/, zoals T.laadKaart "tegel" leest
//                                    // (js/kaart.js). null: (nog) geen tekening, zie "opmerking".
//     tekeningen:  ['gebouwen/dorpshuis1', 'gebouwen/vakwerkhuis'],  // of meer dan één: dan krijgt
//                                    // elk nieuw gebouw van deze soort er een, nooit twee keer
//                                    // achter elkaar dezelfde (T.volgendeTekening). Alleen
//                                    // tekeningen met bouwfasen (tegels/bouwfasen.json).
//     beschrijving:'ruimte voor meer mensen',  // wat hij doet, voor het bouwmenu — letterlijk de
//                                    // tekst uit spel.md, "Gebouwen"
//     opmerking:   '',               // waarom hij een geleende tekening heeft, of wat er nog wringt
//   }
//
// Wat de tekening betreft (spel.md: "eerst met de tekeningen die er al zijn; wat nog niet
// getekend is, krijgt voorlopig een bestaand huis"): elke "nieuw" soort hieronder leent een
// bestaande tekening uit tegels/gebouwen.tsx (zie gereedschap/pixelart, tegels/gebouwen.volgorde.json
// voor de volledige lijst). Een akker, een stadsmuur en een palissade zijn geen los blokje van één voet en
// gaan niet via het bouwmenu (menu: false); zie de "akker" in js/kaart.js voor hoe een strook al
// werkt, en ontwerp/werklijst.md, "Een omheining is geen blok" voor hoe een muur later moet gaan.
(function (T) {
  'use strict';

  T.GEBOUW_TREDEN = ['gehucht', 'dorp', 'marktrecht', 'stad'];

  // Instellingen die Marcel kan bijstellen, in één blok (CLAUDE.md, punt 2: "Houd de getallen
  // bovenaan in één blok"). Ze sturen T.tikGebouwenDag hieronder.
  T.GEBOUWEN_INSTELLINGEN = {
    gezinDagen: 20, // om de zoveel dagen komt er, als er ruimte en eten is, een nieuw gezin bij
    gezinGrootte: 4, // hoeveel mensen zo'n gezin telt
    etenPerMensPerDag: 0.05, // graan dat één mens per dag eet (T.wijzigVoorraad haalt dit uit S.voorraad.graan)
    graanBufferVoorGroei: 20, // zonder ten minste dit in de voorraad komt er geen nieuw gezin bij:
    // zo eet een groeiend dorp zichzelf niet meteen leeg.
    // Een gezin wacht op de winter (werklijst vraag 59, B; Marcel, 1 okt, vraag 78: "D dat is prima"): haalt het hout of
    // het eten de winter niet, dan komt er geen gezin, vanaf de dag dat het dorp naar de winter kijkt
    // (T.BEHOEFTEN_INSTELLINGEN.winterVoorafDagen) tot het genoeg is of de winter voorbij. Zo groeit een dorp niet een
    // winter in die het niet haalt: de bouwer van de speeltest groeide in de herfst van 51 naar 74 mensen, en verloor er
    // in de winter 42 tot 53. Uit (de spelregel "Groei") is het spel van vóór 1 okt.
    gezinWachtOpDeWinter: true,
    // Gereedschap (van de smidse, spel.md "Handel"): wie iets maakt en er gereedschap voor heeft,
    // werkt zoveel harder (0,25 is een kwart). Eén stuk per hand aan het werk is genoeg; met de
    // helft werkt de helft harder. Een stuk in gebruik gaat zoveel dagen mee en is dan versleten.
    gereedschapBonus: 0.25,
    gereedschapSlijtDagen: 180,
    // Een huis van de huizenbouwer is jong als het gebouwd wordt, en na zoveel dagen oud (vraag 144; Marcel, 10 okt:
    // "meteen jong en oud"): twee jaar. Wat er bij het begin al stond, is oud (T.tikVerwerenDag).
    oudNaDagen: 720,
    // Een werkplaats die iets omzet (maakt.in: de molen graan tot meel, de zagerij stammen tot planken), maakt tot er
    // zoveel ligt van wat hij maakt (Marcel, 2 okt, werklijst vraag 91, b: "b ja"). Daarvoor maalde een molen elke dag
    // graan tot meel, ook als niemand brood wilde: ruim 880 graan per jaar. Wie iets uit het land haalt (de houthakker,
    // de visser), maakt door. 60 (Marcel, 8 okt: "We kunnen die opvoeren naar 60"; was 30): met 30 hield de bakkerij
    // zo'n 65 dagen brood achter de hand, en de winter vraagt er ruim 100. De herberg brouwt zo ook tot 60 bier.
    werkplaatsMaaktTot: 60,
    // Een looppad om elk nieuw gebouw (Marcel, 3 okt: "Er moet wel altijd een looppad zijn, het liefste van 3 tegels
    // breed", met een kapel die klem stond tussen twee huizen, met struiken voor de deur; en op de vraag of één tegel
    // genoeg is: "Nee ik wil 3 tegels"): rondom moeten zoveel tegels te belopen zijn, zonder gebouw en zonder boom, ook in
    // het bouwmenu en voor wie zelf een plek kiest voor een verzoek (T.plekVoor, js/bouwen.js).
    looppad: 3,
    // Het briefje van een gebouw (js/gebouwbriefje.js; werklijst vraag 156, Marcel: "1b ja") zegt wat het de laatste
    // zoveel dagen echt maakte (T.telGemaakt).
    gemaaktDagen: 7,
  };

  T.GEBOUWEN = {
    // ── Gehucht ──
    hut: {
      naam: T.t('hut'), meervoud: T.t('huts'), trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 8 }, heer: {}, bouwtijd: 2,
      handen: 0, woonruimte: 3, wordt: 'huis', maakt: null, menu: true, woning: true,
      tekening: 'huizen/hut1', beschrijving: T.t('room for a family; cheap, and poor to look at'), // geen tekst
      // Vier echte hutten van vlechtwerk en leem onder riet, laag, zonder schoorsteen (ronde 4b van de
      // huizenbouwer, gereedschap/pixelart/huizen.cjs), zodat een rij hutten niet uit één stempel komt
      // (Marcel, 26 sep: "We hebben meer afwisseling nodig in de huizen en hutten").
      tekeningen: ['huizen/hut1', 'huizen/hut2', 'huizen/hut3', 'huizen/hut4'], // geen tekst
      opmerking: '',
    },
    huis: {
      naam: T.t('house'), meervoud: T.t('houses'), trede: 'gehucht', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 4 }, heer: { goud: 2 }, bouwtijd: 4,
      handen: 0, woonruimte: 5, wordt: 'stenenHuis', maakt: null, menu: true, woning: true,
      tekening: 'huizen/huis1', beschrijving: T.t('room for more people'), opmerking: '', // geen tekst
      // Zes huizen van vakwerk onder riet, met een schoorsteen van leem, want steen hoort pas bij een
      // dorp (Marcel, 26 sep; spel.md, "Beter bouwen"; ronde 4b van de huizenbouwer).
      tekeningen: ['huizen/huis1', 'huizen/huis2', 'huizen/huis3', 'huizen/huis4', 'huizen/huis5', 'huizen/huis6'], // geen tekst
    },
    // Het huis van de schout in het lege begin (vraag 152, 1d; Marcel, 11 okt: "c ja"): je zet het één keer neer, en tot
    // het af is, woont hij in zijn tent. Dan trekt hij er met zijn gezin in (T.verhuisUitHetKamp, js/begin.js), wordt de
    // huifkar de ossenkar, en is het de eerste opslag: daaromheen kun je bouwen (T.inBouwBereik). Zo groot als het huis
    // van de schout in het gehucht dat er al was (een `huis` met `huis: 'schout'`, met plaats voor zijn gezin), en zijn
    // tekening in de stijl van het land (`schout` in js/bouwstijl.js). Nog zonder bouwfasen: in aanbouw is hij bleek.
    schout: {
      naam: T.t('reeve\'s house'), trede: 'gehucht', voet: { b: 8, h: 6 }, kosten: { hout: 16, goud: 4 }, heer: { goud: 2 }, bouwtijd: 4,
      handen: 0, woonruimte: 5, maakt: null, menu: true, leeg: true, eenmalig: true, opslag: true,
      tekening: 'huizen/schoutshuis', beschrijving: T.t('your house and the first store: you can build around it'), opmerking: '', // geen tekst
    },
    boerderij: {
      naam: T.t('farm'), meervoud: T.t('farms'), trede: 'gehucht', voet: { b: 7, h: 8 }, kosten: { hout: 20, goud: 6 }, heer: { goud: 1 }, bouwtijd: 5,
      handen: 2, woonruimte: 4, maakt: null, menu: true,
      tekening: 'huizen/boerderij1', beschrijving: T.t('farmers for the fields, and a barn for the harvest'), // geen tekst
      // De vijf boerderijen van het gehucht (ronde 4b): een L, een T, twee met hun deur achter, en een
      // blokhut onder spanen. Die met de deur achter staat met zijn achterkant naar je toe.
      tekeningen: ['huizen/boerderij1', 'huizen/boerderij2', 'huizen/boerderij3', 'huizen/boerderij4', 'huizen/boerderij5'], // geen tekst
      opmerking: 'Maakt zelf geen graan: dat komt binnen als de boeren een akkertegel maaien ' // geen tekst
        + '(T.GRAAN_PER_TEGEL in js/akkers.js). Eerst stond hier een abstracte opbrengst, en dan ' // geen tekst
        + 'telde het dubbel.', // geen tekst
    },
    // De wijnboerderij (werklijst vraag 136 en 155; Marcel, 8 okt: "Ik wil z.s.m. aan een wijnboerderij", "Wijn wordt
    // drank, zoals bier. Mensen dronken geen water", en 12 okt: "ik wil tóch een apart wijnboerderij gebouw", "A gehucht,
    // b ja, c ja"): een gewoon huis met een gezin van boeren, zoals de boerderij, maar voor wijn. Zijn velden zijn
    // wijngaarden, die je erbij legt (`veld: 'wijnboerderij'` bij de wijngaard hieronder; js/boerderij.js, js/wijngaard.js).
    // De ambachtslieden willen wijn naast hun bier (de wens `wijn` in js/wensen.js; Marcel, 10 okt). Hij maakt niets per
    // dag: in wijnmaand (`alleenIn`, T.stilOp) plukt het gezin de ranken, en de wijn is er pas als de mand in het huis is
    // (`oogst`: wat hij binnenhaalt, T.maaktGoed). De heer wil er wijn voor. `gebouwen/wijnhuis` is de enige tekening.
    wijnboerderij: {
      naam: T.t('vineyard farm'), meervoud: T.t('vineyard farms'), trede: 'gehucht', voet: { b: 5, h: 4 }, kosten: { hout: 18, goud: 8 },
      heer: { wijn: 10 }, bouwtijd: 5, handen: 0, woonruimte: 4, maakt: null, oogst: 'wijn',
      alleenIn: { maanden: ['wijnmaand'], waarom: T.t('the grapes are only picked in October') },
      menu: true, tekening: 'gebouwen/wijnhuis', beschrijving: T.t('winegrowers for the vineyards: the grapes are picked in October'), // geen tekst
      opmerking: '',
    },
    // De akker en de wijngaard: velden die je in het lege begin bij een boerderij legt, als rechthoek (vraag 152, 1e;
    // js/boerderij.js). Geen gebouw: de bouwers rooien en ploegen of planten hem (`veldWerk` in T.BOUWEN_INSTELLINGEN,
    // per tegel), en dan is het land. De soort zegt bij welke boerderij hij hoort (`veld`): de akker bij een boerderij,
    // de wijngaard bij een wijnboerderij (Marcel, 12 okt, vraag 155; tot dan bepaalde het eerste veld wat de boerderij
    // was, Marcel, 11 okt: "Dus 1 boerderij, en het veld bepaald").
    akker: {
      naam: T.t('field'), meervoud: T.t('fields'), trede: 'gehucht', voet: null, kosten: {}, heer: {}, bouwtijd: 0,
      handen: 0, woonruimte: 0, maakt: null, menu: true, leeg: true, veld: 'boerderij',
      tekening: null, beschrijving: T.t('grain by a farm: its farmer sows and reaps it'),
      opmerking: 'In het gehucht dat er al was een hele strook van de kaart: zie "akker" in js/kaart.js en ' // geen tekst
        + 'gereedschap/tiled/maak-gehucht.cjs. Het graan zelf: gereedschap/pixelart/graan.cjs.', // geen tekst
    },
    wijngaard: {
      naam: T.t('vineyard'), meervoud: T.t('vineyards'), trede: 'gehucht', voet: null, kosten: {}, heer: {}, bouwtijd: 0,
      handen: 0, woonruimte: 0, maakt: null, menu: true, leeg: true, veld: 'wijnboerderij',
      tekening: null, beschrijving: T.t('vines by a vineyard farm: its family picks the grapes in October'),
      opmerking: 'De ranken in rijen (js/wijngaard.js, gereedschap/pixelart/wijnrank.cjs).', // geen tekst
    },
    houthakker: {
      naam: T.t('woodcutter'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 4 }, heer: { hout: 20 }, bouwtijd: 3,
      // bos: hij hakt in het bos van de heer, dus de wet Houtkap laat hem meer hakken (js/wetten.js, T.maaktUit).
      handen: 1, woonruimte: 0, maakt: { uit: { hout: 2 } }, bos: true, menu: true,
      // Bij genoeg bos voor een tijd werk (werklijst vraag 129, b; Marcel, 6 okt: "Eens"): zijn bereik is tien tegels
      // (T.BOS_INSTELLINGEN.hakStraal, js/bos.js), en hij hakt 73 bomen per jaar. Tot dan 8 bomen binnen 7 tegels: dan stond
      // hij na een paar maanden stil.
      bij: { natuur: 'bos', straal: 10, minstens: 30 },
      tekening: 'gebouwen/houtschuur', beschrijving: T.t('logs from the lord\'s forest'), opmerking: '', // geen tekst
    },
    // De zagerij (werklijst vraag 157; Marcel, 14 okt: "de houthakker levert boomstammen voor de houtzagerij die er weer
    // planken van maakt"): het materiaal volgt de trede, een gehucht bouw je van stammen, een dorp van planken, een stad
    // van steen; dus staat de zagerij al in het gehucht. Tot 14 okt was dit de timmerman, in een dorp, en gebruikte niets
    // zijn planken. Hij is een kapschuur van de huizenbouwer in de stijl van het land (huizen.cjs, grootGebouw; "Het moet
    // er 1 zijn als werkplaats"), onderaan open, met de zaagbok, de stammen en de planken eronder; een land zonder stijl
    // neemt die van wit. Niemand woont er: de zager woont in zijn eigen huis.
    zagerij: {
      naam: T.t('sawmill'), trede: 'gehucht', voet: { b: 8, h: 4 }, kosten: { hout: 12, goud: 6 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 2, woonruimte: 0, maakt: { in: { hout: 2 }, uit: { planken: 2 } },
      menu: true, tekening: 'huizen/wit-zagerij-riet-z', beschrijving: T.t('logs into planks: a village is built of planks'), // geen tekst
      opmerking: '', // geen tekst
    },
    // Sinds de weides, stap 2 (25 sep 2026) maakt de kooi zelf niets: de schapen van de heide slapen
    // erin, en js/vee.js telt de mest die de herder (zijn hand) eruit haalt, en de wol als ze in
    // zomermaand geschoren worden. Tot dan maakte hij elke dag wol, zonder dat er een schaap was.
    schaapskooi: {
      naam: T.t('sheepfold'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10 }, heer: { wol: 20 }, bouwtijd: 3,
      handen: 1, liefst: 'jong', woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: T.t('the sheep from the heath sleep here: dung for the fields'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur.', // geen tekst
    },
    graanschuur: {
      naam: T.t('granary'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 15 }, heer: {}, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: T.t('the seed grain is kept here; with guards on it, the village does not eat it in a hungry winter'), // geen tekst
      opmerking: 'nieuw (vraag 132): nog niet getekend, leent voorlopig de blokhutschuur.', // geen tekst
    },
    // De schuur (werklijst C, stap 4; Marcel, 14 okt: "D2", en "a ja, b ja, c ja"): een opslag verder van het plein, met
    // zijn eigen bouwbereik (T.inBouwBereik, js/begin.js) en zijn eigen ossenkar (js/kar.js), die haalt en brengt wat het
    // dichtst bij hem ligt. De voorraad is één: wat hier ligt, telt in de balk zoals wat in het huis van de schout ligt.
    schuur: {
      naam: T.t('barn'), meervoud: T.t('barns'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 15, goud: 6 }, heer: {}, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, menu: true, leeg: true, opslag: true, kar: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: T.t('a store away from the square: you can build around it, and it has its own ox cart'), // geen tekst
      opmerking: 'nieuw (werklijst C, stap 4): nog niet getekend, leent voorlopig de blokhutschuur.', // geen tekst
    },
    kippenhok: {
      naam: T.t('henhouse'), trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 4 }, heer: { eieren: 20 }, bouwtijd: 1,
      handen: 0, woonruimte: 0, maakt: { uit: { eieren: 1 } }, menu: true,
      tekening: 'gebouwen/kippenhok', beschrijving: T.t('eggs, and the rent hens for the lord'), // geen tekst
      opmerking: '',
    },
    moestuin: {
      naam: T.t('vegetable garden'), trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 2 }, heer: {}, bouwtijd: 1,
      handen: 0, woonruimte: 0, maakt: { uit: { groente: 1 } }, menu: true,
      tekening: 'erf/moestuin', beschrijving: T.t('vegetables by the house'), opmerking: '', // geen tekst
    },
    put: {
      // Alleen hout (werklijst vraag 89, b; Marcel, 2 okt: "b ja"): een put graaf je zelf, en met 2 goud per put aten de
      // wensen van de hutten in de speeltest het goud op dat de heer en de smidse nodig hadden.
      naam: T.t('well'), trede: 'gehucht', voet: { b: 1, h: 1 }, kosten: { hout: 6 }, heer: {}, bouwtijd: 2,
      handen: 0, woonruimte: 0, maakt: null, menu: true,
      tekening: 'erf/put', beschrijving: T.t('water; without a well the village falls ill'), // geen tekst
      opmerking: 'Het effect ("zonder put wordt het dorp ziek") is nog geen regel, alleen de tekening staat er al.', // geen tekst
    },

    // ── Grondstoffen halen (Marcel, 23 sep: "houthakkers, steengroeve etc moeten we ook hebben";
    //    spel.md, "Grondstoffen halen"). De houthakker staat hierboven al. ──
    steengroeve: {
      naam: T.t('quarry'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 4 }, heer: { steen: 10 }, bouwtijd: 3,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 1 } }, menu: true,
      bij: { natuur: 'rotsen', straal: 6, minstens: 2 },
      tekening: 'gebouwen/houtschuur', beschrijving: T.t('stone for foundations and stone houses'), // geen tekst
      opmerking: 'nieuw: nog niet getekend (een groeve is een kuil met een kraan, geen huis), leent voorlopig de houtschuur.', // geen tekst
    },
    kleiput: {
      naam: T.t('clay pit'), trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { klei: 2 } }, menu: true,
      tekening: 'erf/schuurtje', beschrijving: T.t('clay for the brickworks: bricks, the way people really built here'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.', // geen tekst
    },
    rietsnijder: {
      naam: T.t('reed cutter'), trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { riet: 2 } }, menu: true,
      bij: { natuur: 'water', straal: 5, minstens: 3 },
      tekening: 'erf/schuurtje', beschrijving: T.t('reed from the brook and the marsh, for thatched roofs'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.', // geen tekst
    },
    jager: {
      naam: T.t('hunter'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 8 }, heer: { vlees: 5 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { vlees: 1, huiden: 1 } }, menu: true,
      // Geen `bij`: hij loopt het bos in. Met de eis van het bos (4 okt) vond de jager aan de bosrand al in de eerste
      // herfst geen plek meer, en at het dorp in de speeltest zijn zaaigraan op.
      tekening: 'gebouwen/jagershut', beschrijving: T.t('game from the forest, and hides for the tanner'), // geen tekst
      opmerking: 'Het bos is van de heer: stropen is ook een keuze.', // geen tekst
    },
    visser: {
      naam: T.t('fisherman'), trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { vis: 10 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { vis: 2 } }, menu: true,
      bij: { natuur: 'water', straal: 5, minstens: 3 },
      // Marcel, 24 sep: 's winters ligt de beek dicht, dus wie dan vis wil eten, heeft hem in de
      // herfst gezouten (spel.md, "Handel").
      stilIn: { winter: T.t('the brook is frozen over') },
      tekening: 'erf/schuurtje', beschrijving: T.t('fish from the brook'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.', // geen tekst
    },
    // Hier word je soldaat (vraag 159, A1; js/soldaten.js): wie geen werk heeft, pakt een wapen. Geen handen: een soldaat
    // werkt niet, en zijn plaatsen staan in T.SOLDATEN_INSTELLINGEN.
    wachthuis: {
      naam: T.t('watch house'), trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 10, goud: 4 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, menu: true, lantaarn: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: T.t('whoever has no work becomes a soldier here, with a pitchfork or a weapon from the weaponsmith'), // geen tekst
      opmerking: 'nieuw (Marcel, 23 sep: "orde bewaarders, leger etc moeten een optie zijn"): nog niet getekend, ' // geen tekst
        + 'leent voorlopig een klein dorpshuis.', // geen tekst
    },

    // Al in het gehucht (Marcel, 24 sep 2026; spel.md, "Handel"): eerst hangt hij voor zijn ijzer
    // af van de marskramer (js/handel.js), de ertsgraver (dorp) maakt hem later vrij.
    smidse: {
      naam: T.t('smithy'), trede: 'gehucht', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 10 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { ijzer: 1 }, uit: { gereedschap: 1 } },
      menu: true, tekening: 'gebouwen/smidse', beschrijving: T.t('iron into tools; better tools, faster work'), // geen tekst
      opmerking: 'Zonder ijzer staat hij stil (T.tikGebouwenDag, stap 6). IJzer komt van de marskramer, tot er een ertsgraver is.', // geen tekst
    },

    // ── Dorp ──
    molen: {
      naam: T.t('mill'), trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { planken: 18, goud: 10 }, heer: { goud: 5 }, bouwtijd: 5,
      handen: 1, woonruimte: 0, maakt: { in: { graan: 3 }, uit: { meel: 3 } },
      menu: true, tekening: 'gebouwen/watermolen', beschrijving: T.t('grain into flour. The lord wants you to grind at his mill and pay for it (his banal right); a mill of your own is defiance'), // geen tekst
      opmerking: 'Het banrecht zelf (de heer die erop heft) is nog geen regel.', // geen tekst
    },
    bakkerij: {
      naam: T.t('bakery'), trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { planken: 12, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { meel: 2 }, uit: { brood: 2 } },
      menu: true, tekening: 'gebouwen/bakkerij', beschrijving: T.t('flour into bread'), opmerking: '', // geen tekst
    },
    brouwerij: {
      naam: T.t('brewery'), trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { planken: 14, goud: 10 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { graan: 2 }, uit: { bier: 2 } },
      menu: true, tekening: 'gebouwen/dorpshuis5', beschrijving: T.t('barley into ale; the lord taxes it'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een dorpshuis. De belasting is nog geen regel.', // geen tekst
    },
    herberg: {
      naam: T.t('inn'), trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { planken: 16, goud: 12 }, heer: { goud: 5 }, bouwtijd: 4,
      // Wie er werkt, de waard, tapt en brouwt: van graan, zolang er niet genoeg bier ligt (27 sep, werklijst punt
      // 2). Een kan bier kost een veertigste graan; wie er 's avonds heen gaat, staat in js/herberg.js.
      handen: 1, woonruimte: 1, maakt: { in: { graan: 0.2 }, uit: { bier: 8 } }, menu: true, lantaarn: true,
      // In een land met een bouwstijl groeit de kleine herberg van het gehucht in een dorp door tot de grote, van twee
      // lagen met een uithangbord (groeitMee, js/behoeften.js; werklijst vraag 114, stap 3), en wie er een bouwt, krijgt
      // de grote (js/bouwstijl.js).
      groeitMee: true,
      tekening: 'gebouwen/herberg', beschrijving: T.t('travellers, news and stories, ale'), // geen tekst
      opmerking: 'In een land met een bouwstijl een eigen tekening van vakwerk onder riet (huizen/herberg1). Wie hem in een land zonder stijl bouwt, krijgt ' // geen tekst
        + 'nog de oude tekening van steen onder pannen, zonder ramen die branden. Plaatsen heeft hij niet: alleen het bier ' // geen tekst
        + 'houdt de gasten tegen; de grote trekt meer gasten (groteHerberg, js/herberg.js).', // geen tekst
    },
    kapel: {
      naam: T.t('chapel'), trede: 'gehucht', voet: { b: 5, h: 5 }, kosten: { hout: 10, goud: 8 }, heer: {}, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, kerk: true, menu: true, lantaarn: true,
      tekening: 'gebouwen/kapel', beschrijving: T.t('the church as a group, and contentment'), // geen tekst
      opmerking: 'De tevredenheid (T.heeftKerk, js/behoeften.js, werklijst.md punt 3) is er; de kerk ' // geen tekst
        + 'als groep met eigen belangen komt pas met de politiek (werklijst.md, punt 9). Zijn trede ' // geen tekst
        + 'is "gehucht" (was "dorp"): het gehucht vraagt om een kerk (js/behoeften.js), dus moet hij daar ' // geen tekst
        + 'ook te bouwen zijn; een gehucht had vaak een kapelletje. Een grotere kerk komt later.', // geen tekst
    },
    tiendschuur: {
      naam: T.t('tithe barn'), trede: 'dorp', voet: { b: 6, h: 5 }, kosten: { planken: 14, goud: 6 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: T.t('the lord\'s: here you deliver at Martinmas'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. Sint-Maarten zelf staat ' // geen tekst
        + 'al in T.SINT_MAARTEN (js/tijd.js); wat er dan gebeurt is het tweede proefje (werklijst.md, punt 3).', // geen tekst
    },

    // De markt en de weverij komen een trede eerder dan het marktrecht (Marcel, 2 okt, vraag 90, B): de ambachtslieden
    // willen brood, laken en een markt (js/wensen.js), en zo heeft een huis dat versteent meteen wat het wil.
    markt: {
      // kramen op de marktplek van het plein, geen huis (js/markt.js): 8 hout en 6 goud; een eigen gebouw kostte 16 en 14
      naam: T.t('market'), trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { planken: 8, goud: 6 }, heer: { goud: 10 }, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, menu: true, lantaarn: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: T.t('trade with the outside; traders come'), // geen tekst
      opmerking: 'nieuw in gebouwen.tsx (de kraam bestaat als model in gereedschap/pixelart/dorp.cjs, ' // geen tekst
        + 'nog niet geëxporteerd); leent voorlopig een groot dorpshuis.', // geen tekst
    },
    weverij: {
      naam: T.t('weaving shed'), trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { planken: 14, goud: 12 }, heer: { goud: 6 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { wol: 2 }, uit: { laken: 2 } },
      menu: true, tekening: 'gebouwen/dorpGroot2', beschrijving: T.t('wool into cloth, the richest trade good'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis.', // geen tekst
    },

    // ── Marktrecht ──
    pakhuis: {
      naam: T.t('warehouse'), trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { planken: 18, goud: 10 }, heer: { goud: 5 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: T.t('storage, and a good place to slip something in between'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. "Iets tussenschuiven" ' // geen tekst
        + '(voor de heer verbergen) is nog geen regel.', // geen tekst
    },
    kuiper: {
      naam: T.t('cooper'), trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { planken: 10, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { vaten: 1 } },
      menu: true, tekening: 'gebouwen/dorpKlein1', beschrijving: T.t('barrels for ale and storage'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis.', // geen tekst
    },
    slager: {
      naam: T.t('butcher'), trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { planken: 10, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/dorpKlein2', beschrijving: T.t('meat, from the livestock'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Niets levert nu nog vee aan.', // geen tekst
    },
    leerlooier: {
      naam: T.t('tanner'), trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { planken: 10, goud: 6 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: T.t('leather — it stinks, so it belongs on the edge'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. "Aan de rand" is nu ' // geen tekst
        + 'nog een advies, geen regel die het bouwmenu afdwingt.', // geen tekst
    },
    steenbakkerij: {
      naam: T.t('brickworks'), trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { planken: 20, goud: 16 }, heer: { goud: 6 }, bouwtijd: 5,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 2 } }, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: T.t('bricks for stone houses, which look rich'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. "steen" is de eerste ' // geen tekst
        + 'grondstof naast T.GRONDSTOFFEN; die vier blijven voorlopig het enige dat de voorraadbalk toont.', // geen tekst
    },
    badhuis: {
      naam: T.t('bathhouse'), trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { planken: 12, goud: 14 }, heer: { goud: 5 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: T.t('health'), opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.', // geen tekst
    },
    gasthuis: {
      naam: T.t('hospice'), trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { planken: 12, goud: 12 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: T.t('care for the poor'), opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.', // geen tekst
    },

    // ── Stad ──
    stenenHuis: {
      naam: T.t('stone house'), meervoud: T.t('stone houses'), trede: 'stad', voet: { b: 7, h: 5 }, kosten: { steen: 20, goud: 30 }, heer: { goud: 6 }, bouwtijd: 6,
      handen: 0, woonruimte: 8, wordt: 'woontoren', wordtVanaf: 'marktrecht', maakt: null, menu: true, woning: true,
      tekening: 'huizen/steen1', beschrijving: T.t('plenty of room, and rich to look at'), opmerking: '', // geen tekst
      // Het stenen broertje van elk huis, met dezelfde vorm (werklijst vraag 85, d; gereedschap/pixelart/huizen.cjs): een
      // huis dat doorgroeit, versteent op zijn eigen grond (js/behoeften.js), en je herkent het. Tot 1 okt was er één
      // stenen huis, uit de oude reeks (gebouwen/stenenHuis).
      tekeningen: ['huizen/steen1', 'huizen/steen2', 'huizen/steen3', 'huizen/steen4', 'huizen/steen5', 'huizen/steen6'], // geen tekst
      broertjes: {
        'huizen/huis1': 'huizen/steen1', 'huizen/huis2': 'huizen/steen2', 'huizen/huis3': 'huizen/steen3', // geen tekst
        'huizen/huis4': 'huizen/steen4', 'huizen/huis5': 'huizen/steen5', 'huizen/huis6': 'huizen/steen6', // geen tekst
      },
    },
    // Een stenen huis met marktrecht groeit door tot een woontoren van vier lagen op 5 bij 5, waar drie gezinnen wonen,
    // ambachtslieden zoals in het stenen huis (werklijst vraag 114, stap 3; Marcel, 7 okt, "B: Ja"): de stad groeit de
    // hoogte in. Niemand bouwt hem: hij komt alleen door doorgroeien (js/behoeften.js), en vanaf zijn trede. Elke stijl
    // heeft hem in zijn eigen steen en in baksteen (gereedschap/pixelart/huizen.cjs, TORENS); een land zonder stijl
    // krijgt die van wit.
    woontoren: {
      naam: T.t('tower house'), meervoud: T.t('tower houses'), trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { planken: 10, steen: 30 }, heer: { goud: 8 }, bouwtijd: 8,
      handen: 0, woonruimte: 12, maakt: null, menu: false, woning: true,
      tekening: 'huizen/wit-woontoren-pannen-z', beschrijving: T.t('three families on top of each other, in stone'),
      opmerking: 'Nog zonder bouwfasen: hij groeit in één nacht.', // geen tekst
    },
    // De tent of het afdak van een gezin in het kamp van het lege begin (werklijst vraag 152; js/begin.js): niemand bouwt
    // hem, de kar bracht hem mee. Hij is zo groot als zijn gezin (`tijdelijk`, T.woonruimteVan): een nieuw gezin vindt er
    // geen plaats. Zijn voet en zijn deur zegt hij zelf, naar de kant van zijn opening.
    // Wat er bij een afgebroken gebouw lag (js/afbreken.js): een stapel op zichzelf, tot de ossenkar hem haalt (js/kar.js).
    stapel: {
      naam: T.t('pile'), meervoud: T.t('piles'), trede: 'gehucht', voet: { b: 1, h: 1 }, kosten: {}, heer: {}, bouwtijd: 0,
      handen: 0, woonruimte: 0, maakt: null, menu: false,
      tekening: null, beschrijving: T.t('what lay by a demolished building, until the ox cart fetches it'),
      opmerking: 'Geen gebouw: een stapel zonder huis (werklijst C, stap 5). Getekend als elke stapel (T.stapelsOp).', // geen tekst
    },
    tent: {
      naam: T.t('tent'), meervoud: T.t('tents'), trede: 'gehucht', voet: { b: 2, h: 1 }, kosten: {}, heer: {}, bouwtijd: 0,
      handen: 0, woonruimte: 0, tijdelijk: true, maakt: null, menu: false,
      tekening: null, beschrijving: T.t('a tent or a lean-to in the camp, until there is a hut'),
      opmerking: 'Uit gereedschap/pixelart/kamp.cjs (het vel kamp): de tent van linnen, de bruine tent en het afdak, elk met zijn opening naar vier kanten.', // geen tekst
    },
    raadhuis: {
      naam: T.t('town hall'), trede: 'stad', voet: { b: 8, h: 6 }, kosten: { steen: 24, goud: 40 }, heer: { goud: 20 }, bouwtijd: 8,
      handen: 0, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: T.t('where the aldermen vote; the reeve becomes mayor'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis. De schepenen zelf komen met de politiek (werklijst.md, punt 6).', // geen tekst
    },
    stadsmuur: {
      naam: T.t('town wall and gate'), trede: 'stad', voet: null, kosten: { hout: 60, goud: 80 }, heer: { goud: 30 }, bouwtijd: 20,
      handen: 0, woonruimte: 0, maakt: null, menu: false,
      tekening: null, beschrijving: T.t('only allowed with a town charter; without one it is rebellion'),
      opmerking: 'Een muur is geen los blokje van één voet; die komt met het geschilderde-omheiningen-' // geen tekst
        + 'systeem (werklijst.md, "Omheiningen die je schildert"), niet via dit bouwmenu.', // geen tekst
    },

    // ── Verdediging: wapens zijn niet verboden (Marcel, 7 okt: "Het is logisch dat er wapens zijn om de stad te
    // verdedigen. Alleen weerstand tegen de heer is inacceptabel"; werklijst vraag 131) ──
    // In het gehucht (vraag 159, C1; Marcel, 15 okt: "iemand kan gewoon wapensmid worden. Daar moet nog een gebouw voor
    // komen"): hij maakt wat de wachthuizen vragen (T.wapensGevraagd, js/soldaten.js), één stuk per dag: speer, schild en
    // boog van planken, piek en kruisboog van planken en ijzer, het zwaard van ijzer, en het harnas van huiden (een ijzeren
    // harnas komt later). Het tuighuis en het schuttershof deden niets, en zijn weg (vraag 159, F).
    wapenmaker: {
      naam: T.t('weaponsmith'), trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 14 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0,
      maakt: {
        in: { planken: 1, ijzer: 1, huiden: 2 },
        uit: { speren: 1, pieken: 1, zwaarden: 1, schilden: 1, bogen: 1, kruisbogen: 1, harnassen: 1 },
        keuze: {
          speren: { planken: 1 }, pieken: { planken: 1, ijzer: 1 }, zwaarden: { ijzer: 1 }, schilden: { planken: 1 },
          bogen: { planken: 1 }, kruisbogen: { planken: 1, ijzer: 1 }, harnassen: { huiden: 2 },
        },
      },
      menu: true, tekening: 'gebouwen/smidse', beschrijving: T.t('weapons, shields and armour for the soldiers of the watch house, one piece a day'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het vel van de smidse; een eigen gebouw komt met de werkplaatsen in de bouwstijl (vraag 167).', // geen tekst
    },
    palissade: {
      naam: T.t('palisade'), trede: 'dorp', voet: null, kosten: { hout: 40 }, heer: { goud: 5 }, bouwtijd: 10,
      handen: 0, woonruimte: 0, maakt: null, menu: false,
      tekening: null, beschrijving: T.t('a wall of stakes around the village, against robbers and wolves'),
      opmerking: 'Zelfde reden als stadsmuur hierboven: geen los blokje, gaat niet via dit bouwmenu.', // geen tekst
    },
    kazerne: {
      naam: T.t('barracks'), trede: 'stad', voet: { b: 6, h: 6 }, kosten: { steen: 60, goud: 30 }, heer: { goud: 10 }, bouwtijd: 8,
      handen: 0, woonruimte: 6, maakt: null, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: T.t('mercenaries: expensive, but they fight for the village'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis.', // geen tekst
    },

    // ── Grondstoffen en orde die pas bij het dorp komen ──
    turfsteker: {
      naam: T.t('peat cutter'), trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { planken: 8 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 2, woonruimte: 0, maakt: { uit: { turf: 2 } }, menu: true,
      tekening: 'erf/schuurtje', beschrijving: T.t('peat from the bog, to burn when the forest is gone'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.', // geen tekst
    },
    ertsgraver: {
      naam: T.t('ore digger'), trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { planken: 14, goud: 8 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { uit: { ijzer: 1 } }, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: T.t('bog iron from the ground: iron without the merchant'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. IJzer wordt ook wapens.', // geen tekst
    },
    kalkbrander: {
      naam: T.t('lime burner'), trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { planken: 10, steen: 4 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { kalk: 1 } }, menu: true,
      tekening: 'erf/schuurtje', beschrijving: T.t('lime from shells, for mortar'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.', // geen tekst
    },
    gevang: {
      naam: T.t('gaol'), trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { planken: 8, steen: 10, goud: 6 }, heer: { goud: 2 }, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, menu: true,
      tekening: 'gebouwen/dorpKlein1', beschrijving: T.t('whoever the reeve convicts, sits here'), // geen tekst
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Hoort bij de rechtspraak (werklijst 10).', // geen tekst
    },
  };

  // De echte maat van een soort: liever de "beslaat" van zijn eigen tekening (T.opzoekTegelNaam,
  // js/kaart.js — precies zo vast als de tegel zelf zegt, net als bij een gebouw dat Marcel in
  // Tiled neerzet) dan de geschatte T.GEBOUWEN[soort].voet hierboven. Geeft null als er geen van
  // beide is (akker, stadsmuur, palissade — die gaan sowieso niet via T.plaatsGebouw).
  // De voet van een soort, of van één van zijn tekeningen (`tekening`, uit T.GEBOUWEN[soort].tekeningen):
  // wat de tekening in tegels/gebouwen.tsx beslaat, en anders de schatting in T.GEBOUWEN[soort].voet.
  T.gebouwVoet = function (soort, tekening) {
    const g = T.GEBOUWEN[soort];
    if (!g) return null;
    const t = tekening || g.tekening;
    if (t && T.opzoekTegelNaam) {
      const opz = T.opzoekTegelNaam(t);
      if (opz && opz.eig && opz.eig.beslaat) return { b: opz.eig.beslaat[0], h: opz.eig.beslaat[1] };
    }
    return g.voet;
  };

  // De rechthoek die een gebouw op de kaart beslaat, { x, y, b, h }: de tekening als die er is (die
  // kan groter zijn dan de voet uit het betekenisbestand), anders zijn voet, anders de maat van zijn
  // soort. Voor wie wil weten waar een gebouw staat. (Tot 27 sep had elk bestand er een eigen kopie van.)
  T.voetVanGebouw = function (g) {
    if (g.voorwerp && g.voorwerp.beslaat) return { x: g.x, y: g.y, b: g.voorwerp.beslaat[0], h: g.voorwerp.beslaat[1] };
    const v = g.voet || T.gebouwVoet(g.soort) || { b: 1, h: 1 };
    return { x: g.x, y: g.y, b: v.b, h: v.h };
  };

  // Waar de plekken van een soort staan, als rechthoeken { x, y, b, h }: wat er op de kaart staat (de put op het plein
  // is een voorwerp uit Tiled, geen gebouw), en de gebouwen van die soort die klaar zijn. Voor de put waar de mensen
  // water halen (js/bewoners.js) en wat een huis in de buurt wil (js/wensen.js).
  T.plekkenVan = function (D, soort) {
    const plekken = [];
    for (const v of (D.wereld && D.wereld.voorwerpen) || []) {
      if (v.soort === soort) plekken.push({ x: v.x, y: v.y, b: (v.beslaat || [1, 1])[0], h: (v.beslaat || [1, 1])[1] });
    }
    for (const g of D.gebouwen || []) if (g.soort === soort && g.klaar) plekken.push(T.voetVanGebouw(g));
    return plekken;
  };

  // Welke tekening krijgt het volgende gebouw van deze soort? Een soort met `tekeningen` (de hut, het
  // huis) krijgt er steeds een, nooit twee keer achter elkaar dezelfde, zodat een rij hutten niet uit
  // één stempel komt (Marcel, 26 sep: "We hebben meer afwisseling nodig in de huizen en hutten"). De
  // keuze ligt vast tot hij gebouwd is (S.volgendeTekening), zodat het spookbeeld van het bouwmenu de
  // voet laat zien die er echt komt. T.neemTekening zegt dat hij gebouwd is: de volgende wordt een
  // andere. In een land met een bouwstijl (js/bouwstijl.js) is het een vorm van die stijl, met het dak
  // van nu; de keuze mag zijn deur naar een andere kant hebben (T.keerNaarDeWeg keert hem naar de weg, js/bouwstijl.js).
  T.volgendeTekening = function (D, soort) {
    const g = T.GEBOUWEN[soort];
    if (!g) return null;
    const lijst = T.tekeningenVan(D, soort);
    if (!lijst) return g.tekening || null;
    const volgende = D.volgendeTekening || (D.volgendeTekening = {});
    if (!lijst.includes(T.metDeurNaar(volgende[soort], 'z'))) {
      const vorige = D.vorigeTekening && D.vorigeTekening[soort];
      const kan = lijst.length > 1 ? lijst.filter((t) => T.vormVan(t) !== T.vormVan(vorige)) : lijst;
      volgende[soort] = kan[Math.floor(Math.random() * kan.length)];
    }
    return volgende[soort];
  };
  // De tekeningen die een nieuw gebouw van deze soort kan krijgen: die van de bouwstijl van het land
  // (T.stijlTekeningen, js/bouwstijl.js), of anders `tekeningen` hierboven. Null bij één vaste tekening.
  T.tekeningenVan = function (D, soort) {
    const g = T.GEBOUWEN[soort];
    return T.stijlTekeningen(D, soort) || (g.tekeningen && g.tekeningen.length ? g.tekeningen : null);
  };
  T.neemTekening = function (D, soort) {
    const t = T.volgendeTekening(D, soort);
    (D.vorigeTekening || (D.vorigeTekening = {}))[soort] = t;
    if (D.volgendeTekening) delete D.volgendeTekening[soort];
    return t;
  };

  // ---------------------------------------------------------------------------------------------
  // Geld en goederen
  // ---------------------------------------------------------------------------------------------

  T.kanBetalen = function (D, kosten) {
    for (const wat in kosten) if ((D.voorraad[wat] || 0) < kosten[wat]) return false;
    return true;
  };

  T.betaalKosten = function (D, kosten) {
    for (const wat in kosten) T.wijzigVoorraad(D, wat, -kosten[wat]);
  };

  // Het seizoen van een dag (js/tijd.js), of null zonder dag: dan ligt er ook niets stil vanwege het
  // seizoen.
  function seizoenVan(dag) {
    return dag != null ? T.datumVanDag(dag).seizoen : null;
  }

  // Of een soort dit goed maakt: elke dag (maakt.uit), of wat hij binnenhaalt (`oogst`: de wijnboerderij plukt wijn).
  // Voor wie vraagt wie iets maakt (js/wensen.js).
  T.maaktGoed = function (soort, wat) {
    const g = T.GEBOUWEN[soort];
    return !!g && !!((g.maakt && g.maakt.uit && g.maakt.uit[wat]) || g.oogst === wat);
  };

  // Of een soort op deze dag stilligt, en waarom (of null): in een seizoen (`stilIn`: de visser als de beek dichtligt), of
  // buiten zijn maanden (`alleenIn`: de wijnboerderij plukt alleen in wijnmaand). Eén vraag voor het werk, het gereedschap,
  // de raad en wat de huizen missen. `seizoen` mag apart, voor wie zonder dag wil weten of het in een seizoen stilligt.
  T.stilOp = function (soort, dag, seizoen = seizoenVan(dag)) {
    if (!soort) return null;
    if (soort.stilIn && seizoen && soort.stilIn[seizoen]) return soort.stilIn[seizoen];
    if (soort.alleenIn && dag != null && !soort.alleenIn.maanden.includes(T.MAANDEN[T.datumVanDag(dag).maand].naam)) return soort.alleenIn.waarom;
    return null;
  };

  // Hoeveel handen er vandaag iets maken, en hoeveel daarvan gereedschap hebben: de dekking
  // (0..1) en wat dat aan harder werken geeft (factor, 1 is niets extra). Leest g.handen van
  // vandaag, dus pas na stap 5 van T.tikGebouwenDag; ook voor de balk (js/hud.js), die bij het
  // gereedschap zegt hoeveel handen het dekt.
  T.gereedschapDekking = function (D, seizoen) {
    const IN = T.GEBOUWEN_INSTELLINGEN;
    const nu = seizoen !== undefined ? seizoen : seizoenVan(D.kalender && D.kalender.dag);
    let handen = 0;
    for (const g of D.gebouwen || []) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !soort.maakt || !(g.handen > 0)) continue;
      // Wie niets te bewerken heeft (een smidse zonder ijzer, een wapenmaker zonder vraag) of in dit seizoen stilligt (de
      // visser als de beek dichtligt), gebruikt ook geen gereedschap.
      const m = T.receptVan(D, g);
      if (!m || (m.in && Object.keys(m.in).some((wat) => !((D.voorraad || {})[wat] > 0)))) continue;
      if (T.stilOp(soort, D.kalender && D.kalender.dag, nu)) continue;
      handen += g.handen;
    }
    const heeft = (D.voorraad && D.voorraad.gereedschap) || 0;
    const dekking = handen > 0 ? Math.min(1, heeft / handen) : 0;
    return { handen, heeft, dekking, factor: 1 + IN.gereedschapBonus * dekking };
  };

  // Hoe hard het dorp vandaag werkt, voor al het werk met handen: naar de tevredenheid (js/behoeften.js: "hoe hard er
  // gewerkt wordt"; T.BEHOEFTEN_INSTELLINGEN.werkBasis is de ondergrens bij 0% tevreden) en naar de afwisseling van de
  // maaltijd (T.werkVanAfwisseling; vraag 154, C1: de twee vermenigvuldigen). Zonder D.behoeften (nog geen dag getikt)
  // op volle kracht. Geeft de twee los en hun product (`factor`): de nachtlus hieronder werkt ermee, en het briefje van
  // een gebouw (js/gebouwbriefje.js) zegt welke van de twee hem tegenhoudt.
  T.werkTempo = function (D) {
    if (!D.behoeften) return { tevreden: 1, afwisseling: 1, factor: 1 };
    const basis = T.BEHOEFTEN_INSTELLINGEN.werkBasis;
    const tevreden = basis + (1 - basis) * D.behoeften.tevredenheid;
    const afwisseling = T.werkVanAfwisseling(D);
    return { tevreden, afwisseling, factor: tevreden * afwisseling };
  };

  // Wat gebouw g maakte, voor zijn briefje (js/gebouwbriefje.js; vraag 156): per dag, de laatste gemaaktDagen, en dit
  // jaar alles samen. T.opStapel (js/kar.js) telt het, want alles wat een gebouw maakt, gaat daarlangs: de nachtlus
  // hieronder, de oogst bij de boerderij, de wijn bij de wijnboerderij. Gewone gegevens in g, dus bewaard:
  //   g.gemaakt = { dagen: [{ dag, waren: { wat: hoeveel } }], jaar, ditJaar: { wat: hoeveel } }
  T.telGemaakt = function (D, g, wat, hoeveel) {
    if (!g || !(hoeveel > 0)) return;
    const dag = Math.floor((D.kalender && D.kalender.dag) || 0);
    const jaar = T.datumVanDag(dag).jaar;
    const m = g.gemaakt || (g.gemaakt = { dagen: [], jaar, ditJaar: {} });
    if (m.jaar !== jaar) {
      m.jaar = jaar;
      m.ditJaar = {};
    }
    m.ditJaar[wat] = (m.ditJaar[wat] || 0) + hoeveel;
    let d = m.dagen[m.dagen.length - 1];
    if (!d || d.dag !== dag) m.dagen.push((d = { dag, waren: {} }));
    d.waren[wat] = (d.waren[wat] || 0) + hoeveel;
    const tot = dag - T.GEBOUWEN_INSTELLINGEN.gemaaktDagen;
    while (m.dagen.length && m.dagen[0].dag <= tot) m.dagen.shift();
  };

  // Wat g de laatste gemaaktDagen maakte ({ wat: hoeveel }), en dit jaar (`jaar` true); leeg als het niets maakte.
  T.gemaaktDoor = function (D, g, jaar = false) {
    const m = g.gemaakt;
    if (!m) return {};
    const dag = Math.floor((D.kalender && D.kalender.dag) || 0);
    if (jaar) return m.jaar === T.datumVanDag(dag).jaar ? { ...m.ditJaar } : {};
    const uit = {};
    const tot = dag - T.GEBOUWEN_INSTELLINGEN.gemaaktDagen;
    for (const d of m.dagen) {
      if (d.dag <= tot) continue;
      for (const wat in d.waren) uit[wat] = (uit[wat] || 0) + d.waren[wat];
    }
    return uit;
  };

  // Het gebouw waarvan deze tegel onder de voet ligt, of null. Ook een gebouw zonder eigen voorwerp (een tent in het kamp,
  // een veld): dan telt zijn voet. De muis zegt hoe het ermee staat (js/verkennen.js).
  T.gebouwOp = function (D, x, y) {
    for (const g of D.gebouwen || []) {
      const v = g.voorwerp;
      const voet = v && v.beslaat ? { x: v.x, y: v.y, b: v.beslaat[0], h: v.beslaat[1] } : g.voet ? { x: g.x, y: g.y, b: g.voet.b, h: g.voet.h } : null;
      if (!voet) continue;
      if (x >= voet.x && x < voet.x + voet.b && y >= voet.y && y < voet.y + voet.h) return g;
    }
    return null;
  };

  // Hoe het met één gebouw staat, in één zin: voor de muis op een gebouw (js/verkennen.js). Leest
  // wat T.tikGebouwenDag de laatste dag zag (g.werkte, g.tekort), dus hij zegt wat er vandaag
  // gebeurde, niet wat er misschien zou kunnen.
  // Per soort wat er bij de muis nog achter komt, van een bestand dat meer over dat gebouw weet:
  // T.GEBOUW_ERBIJ.herberg = (S, g) => 'vanavond 4 gasten; 23 bier.' (js/herberg.js).
  T.GEBOUW_ERBIJ = T.GEBOUW_ERBIJ || {};
  T.gebouwToestand = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    if (!soort) return '';
    const zin = toestandZin(D, g, soort);
    // Wat er verder in dit gebouw gebeurt, als een ander bestand dat weet: in de herberg hoeveel gasten
    // er vanavond zijn, en het bier (js/herberg.js).
    const meer = g.klaar && T.GEBOUW_ERBIJ && T.GEBOUW_ERBIJ[g.soort] ? T.GEBOUW_ERBIJ[g.soort](D, g) : '';
    return meer ? `${zin} ${T.hoofdletter(meer)}` : zin;
  };
  function toestandZin(D, g, soort) {
    const naam = T.hoofdletter(soort.naam);
    if (!g.klaar) {
      // De mensen bouwen het zelf (js/bouwen.js): wie er bouwt, en hoe ver het is.
      if (g.bouw) return T.bouwToestand(D, g);
      const dagNu = D.kalender ? Math.floor(D.kalender.dag) : 0;
      const nog = Math.max(1, g.klaarOp - dagNu);
      return T.t('{naam}: under construction, {n|# day|# days} to go.', { naam, n: nog });
    }
    if (!soort.maakt) return T.t('{naam}: {beschrijving}.', { naam, beschrijving: soort.beschrijving });
    if (g.stilWant) return T.t('{naam}: idle, {waarom}.', { naam, waarom: g.stilWant });
    if (soort.handen > 0 && !g.handen) return T.t('{naam}: idle, there are no hands to work it.', { naam });
    if (g.tekort && !(g.werkte > 0)) return T.t('{naam}: idle, there is no {waar}.', { naam, waar: T.waarNaam(g.tekort) });
    if (g.tekort) return T.t('{naam}: working at half pace, there is too little {waar}.', { naam, waar: T.waarNaam(g.tekort) });
    if (g.vol && !(g.werkte > 0)) return T.t('{naam}: there is enough {waar} in store.', { naam, waar: T.waarNaam(g.vol) });
    const metHanden = soort.handen > 0;
    // Werk in uren (js/bewoners.js, T.werkUrenVan): hoeveel er echt gewerkt werd, en hoe lang de
    // handen onderweg waren; anders is het een straf die je niet ziet.
    // Afgerond zo dat gewerkt en onderweg samen de uren van wie er is geven, zoals je zou narekenen.
    const u = g.uren;
    if (u && u.onderweg >= 0.5) {
      const onderweg = Math.round(u.onderweg);
      const gewerkt = Math.round(u.gewerkt + u.onderweg) - onderweg;
      const nodig = Math.round(u.nodig);
      return metHanden
        ? T.t('{naam}: at work ({n} of {m} hands), {gewerkt} of {nodig} hours worked; {onderweg|# hour|# hours} on the road.', { naam, n: g.handen, m: soort.handen, gewerkt, nodig, onderweg })
        : T.t('{naam}: at work, {gewerkt} of {nodig} hours worked; {onderweg|# hour|# hours} on the road.', { naam, gewerkt, nodig, onderweg });
    }
    return metHanden ? T.t('{naam}: at work ({n} of {m} hands).', { naam, n: g.handen, m: soort.handen }) : T.t('{naam}: at work.', { naam });
  }

  // ---------------------------------------------------------------------------------------------
  // Neerzetten: past het, en dan echt neerzetten (bouwmenu, T.plaatsGebouw hieronder)
  // ---------------------------------------------------------------------------------------------

  // Waarom past soort niet op (x, y) (de linkerbovenhoek van zijn voet, net als "beslaat" bij een
  // gewoon voorwerp)? Geeft de reden, voor de speler, of null als hij past. Niet op het plein
  // (T.opHetPlein, js/wereld.js; Marcel, 26 sep: "Op het Plein wordt niet gebouwd"), en binnen de
  // kaart nergens al vast: dat dekt zowel de rand van de wereld als een ander gebouw, een boom, of
  // muur (T.isVast). Sinds 28 sep (werklijst vraag 52) ook niet op een akker of weide of een pad: tot
  // dan kon een werkplaats midden op een akker staan. Het bouwmenu laat de reden zien bij de muis en na een klik
  // (js/main.js).
  // Met `tekening` voor een andere tekening dan de volgende (een andere stand, js/bouwstijl.js).
  // `kavel` ({ x, y, b, h }, of null): een stuk dat eerst gerooid wordt (js/bos.js; werklijst vraag 110, e). Wat daarop te
  // rooien is (een boom, een stronk, een struik), telt dan als vrij, onder de voet en in het looppad.
  // `wieErStaat` false: wie er nu staat, telt niet (die is morgen weg), voor wie vooruit kijkt (T.kanHierKomen).
  T.waaromPastHetNiet = function (D, soort, x, y, tekening, kavel = null, wieErStaat = true) {
    // De markt op het plein (js/markt.js): zijn plek is het plein, waar je ook wijst.
    if (soort === 'markt') return T.waaromGeenMarktOpHetPlein(D);
    const voet = T.gebouwVoet(soort, tekening || T.volgendeTekening(D, soort));
    const w = D.wereld;
    if (!voet || !w) return T.t('It does not fit there.');
    // In het lege begin bouw je binnen het bereik van het plein en je opslagen (js/begin.js; vraag 152, 1d).
    // En alleen op land dat je kent (B2c, js/mist.js).
    const plek = { x, y, b: voet.b, h: voet.h };
    const ver = T.waaromBuitenBouwBereik(D, plek) || T.waaromOnbekendLand(D, plek);
    if (ver) return ver;
    let vast = false;
    let reden = null;
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        if (T.opHetPlein(w, x + dx, y + dy)) return T.t('Nothing is built on the square.');
        if (T.isVast(w, x + dx, y + dy) && !(kavel && T.ontginWerkOp(w, x + dx, y + dy))) vast = true;
        else if (!vast) reden = reden || T.waaromNietOpDezeGrond(D, x + dx, y + dy);
      }
    }
    if (vast) return T.t('It does not fit there.');
    if (reden) return reden;
    // De marktplek (js/markt.js): er blijft een gebouw vandaan, zodat zijn deur er niet op uitkomt.
    const markt = T.waaromNietBijDeMarkt(D, { x, y, b: voet.b, h: voet.h });
    if (markt) return markt;
    if (T.teSteil(w, { x, y, b: voet.b, h: voet.h })) return T.t('It is too steep to build there.');
    const natuur = T.waaromNietBijDeNatuur(D, soort, { x, y, b: voet.b, h: voet.h });
    if (natuur) return natuur;
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    if (!T.looppadOm(D, { x, y, b: voet.b, h: voet.h }, n, kavel)) return T.t('There must be a walkway all round it: {n|one tile|# tiles} clear, with no building or tree.', { n });
    return T.waaromNietOpIemand(D, { x, y, b: voet.b, h: voet.h }, undefined, wieErStaat) || zonderKringPlek(D, soort, { x, y, b: voet.b, h: voet.h });
  };

  // Een gebouw waar een gezin woont (een wijnboerderij, of een huis dat jij zet) komt alleen waar dat gezin straks zijn
  // put en kapel haalt, en niet waar het een ander huis de laatste plek ervoor afneemt (T.waaromGeenKringPlek, js/wensen.js; werklijst vraag 136; Marcel, 10 okt: "Wijn haalt kapel"): in de
  // speeltest kwam een wijnboerderij ver van het dorp, en wilde haar gezin een jaar lang een kapel die nergens kon komen,
  // zodat het dorp niet won. In het lege begin niet (Marcel, 12 okt: "b uit"): daar
  // vond de kolonist op drie van de vijf eilanden na de oogst geen plek meer voor een tweede boerderij, want rond het plein
  // was geen ruimte meer voor een kapel binnen 40 tegels (werklijst B, 1f; ontwerp/speelbaar.md).
  function zonderKringPlek(D, soort, r) {
    const G = T.GEBOUWEN[soort];
    if (D.begin || !G.woonruimte || !T.standVan({ soort })) return null;
    return T.waaromGeenKringPlek(D, {
      grond: r, vast: r, huis: r, wil: (wens) => T.huisWil({ soort }, wens),
      wie: () => T.t('{gebouw} here', { gebouw: T.hoofdletter(T.eenNaam(G.naam)) }), dit: T.t('{gebouw} here', { gebouw: T.eenNaam(G.naam) }),
    });
  }

  // Een gebouw komt klaar: het spookbeeld wordt de tekening zelf, en de kramen van de markt staan. De nachtlus doet het
  // (T.tikGebouwenDag, stap 1), en het debugvenster (js/debugvenster.js, werklijst 169) meteen; wat er dan nog volgt (wie
  // erin trekt, de kar van een schuur, het veld dat land wordt), doet de nacht daarna voor allebei.
  T.komtKlaar = function (D, g, dag) {
    g.klaar = true;
    if (g.voorwerp) g.voorwerp.inAanbouw = false;
    if (g.voorwerp) T.maakJong(g.voorwerp, dag);
    for (const k of g.kramen || []) k.inAanbouw = false; // de markt op het plein (js/markt.js)
  };

  // ---------------------------------------------------------------------------------------------
  // Wat er ligt, doet ertoe (werklijst vraag 112, c; Marcel, 3 okt: "Her en der wat foliage, bomen, stenen, water")
  // ---------------------------------------------------------------------------------------------
  // Een houthakker hoort bij het bos, een steengroeve bij de rotsen, een visser en een rietsnijder aan het water (`bij` in
  // T.GEBOUWEN). Op een land van de maker ligt dat elk spel ergens anders (js/maker.js), zodat elk land
  // een andere puzzel is. Wat telt, zegt T.NATUUR per soort: een voorwerp op de tegel, of de grond zelf.
  T.NATUUR = {
    // een boom van het bos (T.BOMEN, js/wereld.js)
    bos: { naam: T.t('the forest'), meervoud: T.t('trees'), telt: (w, x, y, v) => !!v && T.isBosBoom(v.soort) },
    rotsen: { naam: T.t('the rocks'), meervoud: T.t('rocks'), telt: (w, x, y, v) => !!v && v.soort === 'rots' },
    // het water van een beek, een meer of een rivier, en de zee (tegels/kust.png): een visser vist er ook
    water: { naam: T.t('the water'), meervoud: T.t('tiles of water'), telt: (w, x, y) => { const g = T.grondOp(w, x, y); return !!(g && T.isWaterGrond(g.naam)); } },
    // Wat te rooien is en geen boom (een struik, een stronk; T.ontginWerkOp, js/bos.js): voor wat er op een stuk te
    // rooien staat (T.watTeRooien, js/bos.js).
    struiken: { naam: T.t('the bushes'), meervoud: T.t('bushes and stumps'), telt: (w, x, y, v) => !!v && T.ontginWerkOp(w, x, y) === 'rooien' },
  };
  // Per kaart en per soort een optelsom over de tegels, opnieuw als de kaart veranderde (T.kaartVersie, js/wereld.js):
  // zo kost de vraag hoeveel er rond een plek ligt één stap, ook voor de duizenden plekken die een verzoek afzoekt
  // (T.plekVoor, js/bouwen.js).
  const NATUUR_SOMMEN = new WeakMap();
  function natuurSom(w, soort) {
    const versie = T.kaartVersie(w);
    let per = NATUUR_SOMMEN.get(w);
    if (!per || per.versie !== versie) NATUUR_SOMMEN.set(w, (per = { versie }));
    if (per[soort]) return per[soort];
    const vak = T.kaartVak(w);
    const b = vak.b;
    const s = new Int32Array((b + 1) * (vak.h + 1));
    const telt = T.NATUUR[soort].telt;
    for (let y = vak.y; y < vak.y + vak.h; y++) {
      let rij = 0;
      for (let x = vak.x; x < vak.x + vak.b; x++) {
        if (telt(w, x, y, T.voorwerpOp(w, x, y))) rij++;
        s[(y - vak.y + 1) * (b + 1) + (x - vak.x) + 1] = s[(y - vak.y) * (b + 1) + (x - vak.x) + 1] + rij;
      }
    }
    return (per[soort] = { s, vak });
  }
  // Hoeveel van deze soort (T.NATUUR) er binnen `straal` tegels van de rechthoek r ({ x, y, b, h }) ligt.
  T.natuurBij = function (w, soort, r, straal) {
    const { s, vak } = natuurSom(w, soort);
    const b = vak.b;
    const x1 = Math.max(vak.x, r.x - straal) - vak.x;
    const y1 = Math.max(vak.y, r.y - straal) - vak.y;
    const x2 = Math.min(vak.x + vak.b, r.x + r.b + straal) - vak.x;
    const y2 = Math.min(vak.y + vak.h, r.y + r.h + straal) - vak.y;
    if (x2 <= x1 || y2 <= y1) return 0;
    return s[y2 * (b + 1) + x2] - s[y1 * (b + 1) + x2] - s[y2 * (b + 1) + x1] + s[y1 * (b + 1) + x1];
  };
  // Waarom deze soort niet op de plek r kan omdat de natuur die hij nodig heeft er niet ligt, of null.
  T.waaromNietBijDeNatuur = function (D, soort, r) {
    const bij = T.GEBOUWEN[soort] && T.GEBOUWEN[soort].bij;
    if (!bij) return null;
    const n = T.natuurBij(D.wereld, bij.natuur, r, bij.straal);
    if (n >= bij.minstens) return null;
    const N = T.NATUUR[bij.natuur];
    const gebouw = T.hoofdletter(T.eenNaam(T.GEBOUWEN[soort].naam));
    return n
      ? T.t('{gebouw} has to be near {natuur}: there are too few {meervoud} close by ({n}).', { gebouw, natuur: N.naam, meervoud: N.meervoud, n })
      : T.t('{gebouw} has to be near {natuur}: there are no {meervoud} close by.', { gebouw, natuur: N.naam, meervoud: N.meervoud });
  };

  // Is er een looppad van `breed` tegels rondom de rechthoek r ({ x, y, b, h })? Elke tegel in die rand is te belopen
  // (T.isBegaanbaar, js/wereld.js: geen muur, geen gebouw, geen boom), of ligt buiten de kaart, waar niemand loopt. Op het
  // stuk `rooien` (een rechthoek, of null) telt wat te rooien is als vrij: de kavel van een bouwplaats die de bouwers
  // eerst rooien (js/bouwen.js).
  T.looppadOm = function (D, r, breed, rooien = null) {
    const w = D.wereld;
    // Op het stuk dat gerooid wordt, telt wat te rooien is (een boom, een stronk, een struik) als vrij: dat rooit wie er
    // komt, voor de bouwplaats er ligt (js/bos.js; werklijst vraag 110, e).
    const opHetStuk = (x, y) => rooien && x >= rooien.x && x < rooien.x + rooien.b && y >= rooien.y && y < rooien.y + rooien.h;
    for (let y = r.y - breed; y < r.y + r.h + breed; y++) {
      for (let x = r.x - breed; x < r.x + r.b + breed; x++) {
        if (x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h) continue;
        if (!T.opKaart(w, x, y)) continue;
        const vrij = T.isBegaanbaar(w, x, y, { deurenOpenen: true }) || (opHetStuk(x, y) && T.ontginWerkOp(w, x, y));
        if (!vrij) return false;
      }
    }
    return true;
  };

  // ---------------------------------------------------------------------------------------------
  // Niemand ingemetseld, geen deur dicht (werklijst vraag 88; Marcel, 2 okt: "A ja")
  // ---------------------------------------------------------------------------------------------
  // Tot 2 okt keek bouwen alleen of een tegel vast was (een muur, een boom), niet of er iemand stond of een deur was. In
  // de nulmeting van de speeltest stonden twee mensen vanaf dag 50 tot het eind ingemetseld in een hut die over hen heen
  // doorgroeide, en de bouwer die de wensen volgt, zette een put op de deur van de schout. Nu komt een gebouw niet op
  // iemand en niet op een deur (hierboven), groeit een huis niet over iemand of een deur heen (js/behoeften.js), en wie
  // toch op een bouwplaats staat, stapt eraf.

  const opRechthoek = (r, x, y) => x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h;

  // Wie er buiten op deze rechthoek staat, of null. Wie binnen is, staat in zijn deur, en op een deur komt niets.
  // Staat iedereen stil (T.iedereenStil, js/wereld.js: tijdens het zoeken van een pad of een plek), dan per tegel van de
  // rechthoek in één stap (T.wezenOp); anders alle wezens af.
  T.wieStaatOp = function (w, r) {
    if (T.iedereenStaatStil()) {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) {
        const e = T.wezenOp(w, x, y);
        if (e) return e;
      }
      return null;
    }
    return (w.wezens || []).find((e) => !e.dood && !e.binnen && opRechthoek(r, e.tx, e.ty)) || null;
  };

  // Het gebouw waarvan de deur (de tegel ervoor, T.deurVan in js/bewoners.js) op deze rechthoek ligt, of null. `behalve`
  // telt niet mee: een huis dat doorgroeit, krijgt zelf een nieuwe deur. De deuren worden bewaard tot de kaart of de
  // gebouwen veranderen (deurenVan): T.plekVoor vraagt dit voor elke tegel van de kaart, en tot 3 okt rekende het elke
  // keer alle deuren opnieuw uit (in een dorp van 200 mensen een seconde per gebouw).
  T.deurOpRechthoek = function (D, r, behalve) {
    for (const { g, x, y } of deurenVan(D)) {
      if (g !== behalve && opRechthoek(r, x, y)) return g;
    }
    return null;
  };
  const DEUREN = new WeakMap(); // dorp → { sleutel, deuren: [{ g, x, y }] }, in de volgorde van D.gebouwen
  function deurenVan(D) {
    const gebouwen = D.gebouwen || [];
    let som = gebouwen.length;
    for (const g of gebouwen) som = (som * 31 + g.x * 1009 + g.y * 9176 + (g.tekening ? g.tekening.length : 0)) % 1e9;
    const sleutel = `${T.kaartVersie(D.wereld)}|${som}`;
    const al = DEUREN.get(D);
    if (al && al.sleutel === sleutel) return al.deuren;
    const deuren = [];
    for (const g of gebouwen) {
      const d = T.deurVan(D.wereld, g);
      if (d) deuren.push({ g, x: d.x, y: d.y });
    }
    DEUREN.set(D, { sleutel, deuren });
    return deuren;
  }

  // Waarom hier niets mag komen, of null: er staat iemand, of het is de deur van een gebouw.
  T.waaromNietOpIemand = function (D, r, behalve, wieErStaat = true) {
    if (wieErStaat && T.wieStaatOp(D.wereld, r)) return T.t('Someone is standing there.');
    if (T.deurOpRechthoek(D, r, behalve)) return T.t('There is a door there.');
    return null;
  };

  // Wie toch op een bouwplaats staat (een gebouw komt op de kaart terwijl er iemand over die plek loopt), stapt eraf: naar de begaanbare tegel ernaast die het dichtst bij is. Anders staat hij ingemetseld. Ook voor
  // de kramen van de markt (js/markt.js).
  T.stapEraf = stapEraf;
  function stapEraf(D, r) {
    const w = D.wereld;
    for (const e of w.wezens || []) {
      if (e.dood || e.binnen || !opRechthoek(r, e.tx, e.ty)) continue;
      let beste = null;
      for (let ring = 1; ring <= Math.max(r.b, r.h) + 2 && !beste; ring++) {
        let afstand = Infinity;
        for (let y = e.ty - ring; y <= e.ty + ring; y++) {
          for (let x = e.tx - ring; x <= e.tx + ring; x++) {
            if (Math.max(Math.abs(x - e.tx), Math.abs(y - e.ty)) !== ring || opRechthoek(r, x, y)) continue;
            if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) continue;
            const a = Math.hypot(x - e.tx, y - e.ty);
            if (a < afstand) {
              afstand = a;
              beste = { x, y };
            }
          }
        }
      }
      if (!beste) continue;
      e.x = e.tx = beste.x;
      e.y = e.ty = beste.y;
      e.pad = [];
      e.onderweg = false;
    }
  }

  // Of er op deze tegel gebouwd mag worden: niet op een akker of weide (T.veldOp, js/akkers.js), niet op een pad
  // (T.opPad, js/wereld.js), niet in een wijngaard (T.wijngaardOp, js/wijngaard.js), en niet op een lantaarn. Geeft de reden, of null.
  T.waaromNietOpDezeGrond = function (D, x, y) {
    const w = D.wereld;
    const komt = T.bouwplaatsOp(D, x, y);
    if (komt) return T.t('{gebouw} is already coming here.', { gebouw: T.hoofdletter(T.eenNaam(T.GEBOUWEN[komt.soort].naam)) });
    if (T.veldOp(w, x, y)) return T.t('There is a field there.');
    if (T.opPad(w, x, y)) return T.t('There is a path there.');
    if (T.wegKomtOp(D, x, y)) return T.t('A road is coming here.');
    // Op zand wordt niet gebouwd (Marcel, 8 okt: "zand is geen solide basis"): het strand, de duinen en het stuifzand
    // van het eiland (tegels/kust.png; werklijst vraag 117, B van 2a).
    const g = T.grondOp(w, x, y);
    if (g && g.naam === 'strand') return T.t('Nothing is built on sand.');
    if (T.wijngaardOp(D, x, y)) return T.t('There is a vineyard there.');
    // Waar de herberg straks met het dorp meegroeit (T.meegroeiGrond, js/behoeften.js), blijft de grond vrij.
    const groeit = T.meegroeiGrondOp(D, x, y);
    if (groeit) return T.t('The {gebouw} will grow here.', { gebouw: T.GEBOUWEN[groeit.soort].naam });
    // Een lantaarn houdt niemand tegen die loopt, maar er komt geen gebouw overheen (js/paden.js).
    const v = T.voorwerpOp(w, x, y);
    if (v && v.soort === 'lantaarn') return T.t('There is a lantern there.');
    return null;
  };

  // Het gebouw dat hier komt maar nog niet op de kaart staat, omdat zijn plek eerst gerooid wordt (`wachtOpRooien`: een
  // bouwplaats van het lege begin, js/bouwen.js), of null. Zijn voet is nog geen
  // muur, maar er komt niets anders.
  T.bouwplaatsOp = function (D, x, y) {
    for (const g of D.gebouwen || []) {
      // een veld dat de bouwers nog maken (js/boerderij.js), ook als ze al ploegen: het heeft geen voorwerp op de kaart
      const veld = T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].veld;
      if (!(g.wachtOpRooien || veld) || g.voorwerp) continue;
      const r = T.voetVanGebouw(g);
      if (x >= r.x && x < r.x + r.b && y >= r.y && y < r.y + r.h) return g;
    }
    return null;
  };

  // Mag deze soort hier al gebouwd worden, door wie dan ook? Die van de trede van nu en de treden ervoor (in een dorp
  // ook de put en de kapel van het gehucht; js/treden.js), behalve wat een eigen manier van neerzetten heeft (menu:
  // false). Ook voor de raad (js/wensen.js, js/raad.js): wat mag, zegt de raad.
  T.magGebouwd = function (D, soort) {
    const g = T.GEBOUWEN[soort];
    const vrij = T.GEBOUW_TREDEN.indexOf(g && g.trede) <= T.GEBOUW_TREDEN.indexOf(D.trede);
    return !!g && vrij && g.menu !== false && nogTeBouwen(D, soort);
  };
  // Het huis van de schout (`leeg`, `eenmalig`) mag alleen in het lege begin, en één keer: staat hij er (ook in
  // aanbouw), dan niet meer. Een veld (de akker, de wijngaard) pas als er een boerderij is die hem kan nemen: de akker
  // een boerderij, de wijngaard een wijnboerderij (`veld`; js/boerderij.js).
  function nogTeBouwen(D, soort) {
    const g = T.GEBOUWEN[soort];
    if (g.leeg && !D.begin) return false;
    if (g.veld && !(D.gebouwen || []).some((x) => x.soort === g.veld)) return false;
    return !(g.eenmalig && (D.gebouwen || []).some((x) => x.soort === soort));
  }

  // Staat deze soort nu in het bouwmenu (js/hud.js)? Wat mag (T.magGebouwd): jij zet alles neer (de spelregels "Huizen"
  // en "Wie bouwt", waarin het dorp zelf bouwde op erven en de mensen het je vroegen, zijn weg sinds ronde 2 van het
  // snoeien, 12 okt).
  T.inBouwmenu = (D, soort) => T.magGebouwd(D, soort);
  T.gebouwPast = (D, soort, x, y, tekening) => !T.waaromPastHetNiet(D, soort, x, y, tekening);

  // Eén keer aan T.VOORWERPEN toevoegen, zoals kaart.js dat doet voor een tegel uit Tiled: hij
  // blokkeert altijd zijn voet (dat ís zijn voet immers al in de tegelslaag hieronder), en het
  // zicht — een half gebouw is nog altijd een heel gebouw voor het oog. Ook voor js/behoeften.js
  // (een huis dat doorgroeit naar een soort die deze sessie nog nooit is neergezet).
  T.registreerGebouwSoort = function (naam) {
    T.VOORWERPEN = T.VOORWERPEN || {};
    if (!T.VOORWERPEN[naam]) T.VOORWERPEN[naam] = { blokkeert: true, zichtDicht: true };
  };

  // Welke van de vijf bouwfases (tegels/bouwfasen.png + .json, gereedschap/pixelart/bouwfasen.cjs)
  // een gebouw in aanbouw nu toont: de bouwtijd in vijf gelijke stukken, fase 0 (fundering) in het
  // eerste stuk, fase 4 (half-gedekt) in het laatste — daarna is hij klaar (T.tikGebouwenDag zet
  // `klaar`, js/tekenen.js tekent dan de gewone, afgewerkte tekening in plaats van een fase). Puur
  // (geen S, geen scherm) en dus in een toets te vangen zonder een gebouw echt neer te zetten.
  // vanaf: de eerste fase, als een gebouw niet bij de fundering begint (een huis dat doorgroeit, vanaf de muren met
  // steigers; groeiVanafFase in js/behoeften.js): dan de bouwtijd in zoveel stukken als er fases over zijn.
  // gedaan (van 0 tot 1): hoe ver het werk is, als de mensen het zelf bouwen (js/bouwen.js); dan telt de dag niet.
  const AANTAL_BOUWFASEN = 5;
  T.bouwFaseIndex = function (dagNu, klaarOp, bouwtijd, vanaf = 0, gedaan = null) {
    if (gedaan != null) return Math.max(vanaf, Math.min(AANTAL_BOUWFASEN - 1, vanaf + Math.floor(gedaan * (AANTAL_BOUWFASEN - vanaf))));
    if (klaarOp == null) return vanaf; // nog niet begonnen
    if (!(bouwtijd > 0)) return AANTAL_BOUWFASEN - 1; // bouwtijd 0: meteen de laatste fase
    const voortgang = 1 - (klaarOp - dagNu) / bouwtijd;
    return Math.max(vanaf, Math.min(AANTAL_BOUWFASEN - 1, vanaf + Math.floor(voortgang * (AANTAL_BOUWFASEN - vanaf))));
  };

  // Jong en oud (vraag 144, de ronde van alle tekeningen; ontwerp/beeld.md; Marcel, 10 okt: "meteen jong en oud"): elk huis
  // van de huizenbouwer staat twee keer op het vel huizen, jong en verweerd ("<naam>-oud", huizen.cjs), met dezelfde vorm,
  // voet en deur. Alleen het voorwerp wisselt van tekening (v.id), want alleen het beeld verandert: het gebouw houdt zijn
  // jonge tekening (g.tekening, v.tekeningNaam), zodat de stijl, de deur, de bouwfasen en het doorgroeien er niets van
  // merken. Wat gebouwd wordt, doorgroeit of na een brand herrijst, is jong vanaf de dag dat het af is (v.gebouwdOp), en
  // oud na oudNaDagen; wat er bij het begin al stond (geen gebouwdOp), is meteen oud.
  const OUD = '-oud';
  let huizenOpNaam = null;
  function huisOpNaam(naam) {
    const vel = T.TEGELS && T.TEGELS.huizen;
    if (!vel) return null;
    if (!huizenOpNaam || huizenOpNaam.vel !== vel) {
      huizenOpNaam = { vel, ids: new Map() };
      vel.tiles.forEach((t, id) => t && t.naam && huizenOpNaam.ids.set(t.naam, id));
    }
    const id = huizenOpNaam.ids.get(naam);
    return id === undefined ? null : id;
  }
  // de naam van de jonge tekening van een voorwerp op het vel huizen, of null
  const jongeNaam = (v) => {
    const t = v && v.vel === 'huizen' && T.TEGELS && T.TEGELS.huizen && T.TEGELS.huizen.tiles[v.id];
    return t && t.naam ? t.naam.replace(/-oud$/, '') : null;
  };
  T.jongeTekeningVan = jongeNaam;
  T.isOudHuis = (v) => {
    const t = v && v.vel === 'huizen' && T.TEGELS && T.TEGELS.huizen && T.TEGELS.huizen.tiles[v.id];
    return !!(t && t.naam && t.naam.endsWith(OUD));
  };
  T.maakOud = function (v) {
    const naam = jongeNaam(v);
    const id = naam && huisOpNaam(naam + OUD);
    if (id != null) v.id = id;
  };
  T.maakJong = function (v, dag) {
    const naam = jongeNaam(v);
    const id = naam && huisOpNaam(naam);
    if (id != null) v.id = id;
    v.gebouwdOp = Math.floor(dag);
  };
  // Elke nacht: wie oud genoeg is, of geen dag heeft waarop hij af was, draagt zijn oude tekening.
  T.tikVerwerenDag = function (D, dag) {
    for (const g of D.gebouwen) {
      const v = g.voorwerp;
      if (!v || v.vel !== 'huizen' || !g.klaar || v.inAanbouw || T.isOudHuis(v)) continue;
      if (v.gebouwdOp == null || dag - v.gebouwdOp >= T.GEBOUWEN_INSTELLINGEN.oudNaDagen) T.maakOud(v);
    }
  };

  // Het voorwerp in S.wereld zetten (zo tekent js/tekenen.js hem mee, op precies dezelfde manier
  // als een gebouw dat in Tiled staat, CLAUDE.md "Testen in de browser": "via de gewone weg
  // waarop het spel gebouwen tekent") en zijn voet vast maken. Nog in aanbouw? Dan staat hij er al
  // (bleek, `inAanbouw: true` — js/tekenen.js dimt hem, of toont een bouwfase als het gebouw die
  // heeft, zie T.bouwFaseIndex hierboven en T.sprites.bouwfase in js/sprites.js), zodat de speler
  // ziet waar hij bezig is; T.tikGebouwenDag zet dat om zodra de bouwtijd om is, op hetzelfde
  // voorwerp, dus zonder dat er ooit een tweede bij komt.
  // Wat er laag groeit of ligt op rechthoek r (een varen, bloemen, een kool: wat niet in de weg staat), gaat weg: er komt
  // een gebouw op, of een veld (js/boerderij.js).
  T.ruimLaagOp = function (w, r) {
    const eronder = (o) => o.vel && !T.VOORWERPEN[o.soort].blokkeert && o.x >= r.x && o.x < r.x + r.b && o.y >= r.y && o.y < r.y + r.h;
    for (const o of T.voorwerpenIn(w, r).filter(eronder)) T.haalVoorwerpWeg(w, o);
  };

  function zetGebouwVoorwerp(D, instantie) {
    const g = T.GEBOUWEN[instantie.soort];
    const w = D.wereld;
    const tekening = instantie.tekening || g.tekening;
    const opz = tekening && T.opzoekTegelNaam(tekening);
    const voet = instantie.voet || T.gebouwVoet(instantie.soort, tekening) || { b: 1, h: 1 };
    const naam = 'gebouw:' + instantie.soort;
    T.registreerGebouwSoort(naam);
    const v = {
      soort: naam, x: instantie.x, y: instantie.y,
      vel: opz ? opz.vel : null, id: opz ? opz.id : null,
      beslaat: [voet.b, voet.h], inAanbouw: !instantie.klaar,
      // Voor de bouwfase (T.bouwFaseIndex + T.sprites.bouwfase): de kale tekeningnaam
      // ("dorpKlein2", niet "gebouwen/dorpKlein2" — dezelfde sleutel als in
      // tegels/bouwfasen.json), en wanneer hij klaar is en hoelang hij duurt. Zonder tekening
      // (g.tekening null) blijft tekeningNaam ook null: gewoon geen fases, net als voorheen.
      tekeningNaam: tekening ? tekening.split('/').pop() : null,
      klaarOp: instantie.klaarOp, bouwtijd: g.bouwtijd,
      // jong (T.maakJong): wanneer hij af is, of vandaag als hij er al staat
      gebouwdOp: Math.floor(instantie.klaarOp != null ? instantie.klaarOp : D.kalender ? D.kalender.dag : 0),
    };
    if (instantie.bouw) v.voortgang = instantie.bouw.gedaan / instantie.bouw.werk; // de mensen bouwen het zelf (js/bouwen.js)
    // Wat er laag groeit of ligt (een varen, bloemen, een kool; js/maker.js), maakt plaats: het gebouw komt erop. Wat
    // in de weg staat (een boom, een struik), hield het bouwen al tegen (T.waaromPastHetNiet).
    T.ruimLaagOp(w, { x: v.x, y: v.y, b: voet.b, h: voet.h });
    T.zetVoorwerp(w, v);
    instantie.voorwerp = v;
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const yy = instantie.y + dy;
        const xx = instantie.x + dx;
        T.zetTegel(w, xx, yy, 'muur');
      }
    }
    // op een land met hoogte komt het op vlakke grond (js/hoogte.js; vraag 121, stap 2)
    T.egaliseer(w, { x: instantie.x, y: instantie.y, b: voet.b, h: voet.h });
    T.kaartVeranderd(w, { x1: instantie.x, y1: instantie.y, x2: instantie.x + voet.b - 1, y2: instantie.y + voet.h - 1 }); // de voet is muur geworden: de eilanden (js/wereld.js)
    stapEraf(D, { x: instantie.x, y: instantie.y, b: voet.b, h: voet.h });
  }

  // Een nieuw gebouw neerzetten via het bouwmenu (js/hud.js, js/main.js): kijkt of het past en of
  // de voorraad toereikend is, trekt de kosten er dan in één keer af en zet hem neer — nog in
  // aanbouw, T.tikGebouwenDag zet hem na zijn bouwtijd op "klaar". Geeft altijd
  // { gelukt, reden } terug (reden alleen als het niet lukte), zodat de aanroeper kan zeggen
  // waarom een klik niets deed — dezelfde vorm als handelingVerkennen/handelingGevecht
  // (CLAUDE.md, "Scherm en klik stellen dezelfde vraag").
  T.plaatsGebouw = function (D, soort, x, y) {
    const g = T.GEBOUWEN[soort];
    if (!g || g.menu === false || !nogTeBouwen(D, soort)) return { gelukt: false, reden: T.t('That cannot be built from the build menu.') };
    // De markt op het plein: kramen, geen gebouw met een voet (js/markt.js; werklijst vraag 110, d).
    if (soort === 'markt') return T.zetMarktOpHetPlein(D);
    // In het lege begin bouwen de mensen het zelf, en rooien ze eerst wat er op de plek staat (js/bouwen.js; vraag 152, 1d).
    const kavel = T.bouwKavel(D, soort, x, y);
    const past = T.waaromPastHetNiet(D, soort, x, y, null, kavel);
    if (past) return { gelukt: false, reden: past };
    // Met de ossenkar betaal je nu alleen wat niet met de kar gaat (het goud); het hout brengt de kar naar de bouwplaats
    // (js/kar.js; werklijst C, stap 2, B2).
    const kosten = T.bouwKosten(D, g.kosten);
    if (!T.kanBetalen(D, kosten.nu)) return { gelukt: false, reden: T.t('The stores are not big enough for that.') };
    T.betaalKosten(D, kosten.nu);
    const dagNu = D.kalender ? Math.floor(D.kalender.dag) : 0;
    // Zijn eigen tekening en de voet die daarbij hoort (T.volgendeTekening): een hut is niet elke hut.
    const tekening = T.neemTekening(D, soort);
    const voet = T.gebouwVoet(soort, tekening);
    const instantie = { soort, x, y, tekening, voet, klaar: g.bouwtijd <= 0, klaarOp: dagNu + g.bouwtijd, handen: 0, voorwerp: null };
    const wat = kavel && T.rooiWoordenOp(D, kavel);
    if (T.bouwenMetHanden(D)) {
      T.zetBouwplaats(D, instantie, kavel);
      T.zetBouwNodig(instantie, kosten.later);
    }
    T.bouwGebouw(D, instantie);
    if (instantie.bouw) {
      const gebouw = T.hoofdletter(g.naam);
      const werk = instantie.bouw.werk;
      return { gelukt: true, instantie, bericht: instantie.wachtOpRooien
        ? T.t('{gebouw}: the builders first clear the site ({wat}), then build it ({werk} workdays).', { gebouw, wat, werk })
        : T.t('{gebouw}: the building site is ready ({werk} workdays, for whoever has no other work).', { gebouw, werk }) };
    }
    return { gelukt: true, instantie, bericht: T.t('{gebouw} under construction ({n|# day|# days}).', { gebouw: T.hoofdletter(g.naam), n: g.bouwtijd }) };
  };

  // Een gebouw in het dorp zetten: in S.gebouwen, met zijn voorwerp op de kaart (zetGebouwVoorwerp
  // hierboven). Een bouwplaats waar de bouwers eerst rooien (`wachtOpRooien`, js/bouwen.js) komt pas op de kaart als
  // zijn plek vrij is (T.zetOpDeKaart).
  T.bouwGebouw = function (D, instantie) {
    D.gebouwen.push(instantie);
    if (!instantie.wachtOpRooien) zetGebouwVoorwerp(D, instantie);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
    return instantie;
  };
  T.zetOpDeKaart = (D, instantie) => zetGebouwVoorwerp(D, instantie);

  // Woonruimte: de som van wat elk klaar gebouw geeft. Een huis telt pas als het klaar is.
  T.telWoonruimte = function (D) {
    let woonruimte = 0;
    for (const g of D.gebouwen) if (g.klaar) woonruimte += T.woonruimteVan(D, g);
    return woonruimte;
  };
  // Hoeveel mensen er in gebouw g kunnen wonen: wat zijn soort zegt, en in een tent van het kamp (`tijdelijk`, js/begin.js)
  // zoveel als er wonen, zodat een nieuw gezin er geen plaats vindt.
  T.woonruimteVan = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    if (!soort) return 0;
    if (soort.tijdelijk) return D.bewoners ? D.bewoners.mensen.filter((p) => p.huis === g).length : 0;
    return soort.woonruimte || 0;
  };

  // Het getal in de balk veranderen: de enige manier, zoals T.wijzigVoorraad voor de voorraad. Het
  // zakt nooit onder nul. De bewoners gaan mee (T.bewonersVolgen, js/bewoners.js): een nieuw gezin
  // in een huis met plaats, of wie sterft of wegtrekt. `reden`: 'begin', 'groei', 'winter', 'vertrek',
  // 'gesneuveld' of 'ziekte'; `waarom` is het begin van het bericht dat zegt wie het zijn ("De winter is hard"). `wie`:
  // als het om bepaalde mensen gaat (een wachter die sneuvelt tegen de rovers, js/rovers.js), wie dat zijn. Het dagboek
  // schrijft het op, met wie het zijn (T.schrijfOp, js/ochtendrapport.js): voor het rapport van de raadsman.
  // Geeft terug hoeveel het echt veranderde.
  T.wijzigBevolking = function (D, verschil, reden, waarom, wie) {
    const voor = D.bevolking || 0;
    D.bevolking = Math.max(0, voor + verschil);
    const echt = D.bevolking - voor;
    if (!echt || reden === 'begin') return echt;
    const wieTekst = T.bewonersVolgen ? T.bewonersVolgen(D, echt, reden, waarom, wie) : '';
    T.schrijfOp(D, 'mensen', { verschil: echt, reden, waarom: waarom || null, wie: wieTekst || null });
    // Wie verhongerde, bevroor of sneuvelde, rekent het dorp de schout aan (js/bazen.js).
    T.vertrouwenNaBevolking(D, echt, reden);
    return echt;
  };

  // De handen verdelen over de werkplaatsen, op volgorde van S.gebouwen: eerst de gebouwen die er al
  // stonden, dan wie het eerst gebouwd is ("op volgorde", ontwerp/werklijst.md punt 2). Hoeveel
  // handen er zijn: wie kan werken (T.werkendeHanden, js/bewoners.js: geen kleuter, en de schout
  // niet). Wíé er werkt, zegt daarna T.wijsWerkToe.
  T.verdeelHanden = function (D) {
    let vrij = T.werkendeHanden(D);
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      // Een houthakker zonder boom binnen zijn bereik wil geen handen: zijn hand werkt elders tot er weer een boom staat
      // (js/bos.js; werklijst vraag 129, e).
      // En een boerderij van het lege begin zonder akker (js/boerderij.js): haar boer werkt elders of bouwt mee. (Een
      // wijnboerderij vraagt geen handen: haar gezin werkt elders of bouwt mee, en plukt in wijnmaand.)
      if (!g.klaar || !soort.handen || T.houthakkerZonderBoom(g) || T.boerderijZonderAkker(D, g)) {
        g.handen = 0;
        continue;
      }
      g.handen = Math.min(soort.handen, vrij);
      vrij -= g.handen;
    }
    T.wijsWerkToe(D);
  };

  // Er komt een gezin: in een huis met plaats, of het zegt dat er geen plaats is. Voor de groei (T.tikGebouwenDag,
  // stap 4) en een voorval (js/voorvallen.js: vreemdelingen die willen blijven). Tot ronde 2 van het snoeien (12 okt) nam
  // het in een vol dorp een vrij erf en zette het er zelf een hut op (js/erven.js).
  T.gezinKomt = function (D) {
    const woonruimte = T.telWoonruimte(D);
    if (D.bevolking < woonruimte) T.wijzigBevolking(D, Math.min(woonruimte, D.bevolking + T.GEBOUWEN_INSTELLINGEN.gezinGrootte) - D.bevolking, 'groei');
    else T.zeg(D, T.t('A family wants to come, but there is no room. Build a hut or a house (B).'));
  };
  // Is er plaats voor een gezin: een huis met plaats?
  T.plaatsVoorEenGezin = (D) => (D.bevolking || 0) < T.telWoonruimte(D);

  // Om de hoeveel dagen er een nieuw gezin kan komen: gezinDagen, en met de wet Vreemden welkom vaker
  // (js/wetten.js).
  T.gezinDagen = (D) => Math.max(1, Math.round(T.GEBOUWEN_INSTELLINGEN.gezinDagen / T.wetFactor(D, 'gezinnen')));

  // De eerstvolgende dag waarop er een gezin kan komen (T.tikGebouwenDag, stap 4): na vandaag, want die dag is al
  // geteld.
  T.volgendeGezinDag = function (D) {
    const n = T.gezinDagen(D);
    return (Math.floor(Math.floor((D.kalender && D.kalender.dag) || 0) / n) + 1) * n;
  };

  // Waarom er nu geen gezin kan komen, als lijst: 'graan' (minder dan de buffer in de voorraad), 'tevreden' (onder
  // de drempel, js/behoeften.js), 'winter' (het hout of het eten haalt de winter niet, nu die in zicht is:
  // gezinWachtOpDeWinter, T.watDeWinterNietHaalt in js/behoeften.js), 'plaats' (geen huis met plaats) en 'kamp' (er woont nog een gezin in het kamp, js/begin.js). Een lege lijst als het kan. De groei vraagt het (T.tikGebouwenDag, stap 4, met de dag die hij tikt),
  // en de raad linksboven ook (js/raad.js), zodat die zegt wat de groei doet en niet wat hij zelf denkt.
  T.waaromGeenGezin = function (D, dag = D.kalender ? Math.floor(D.kalender.dag) : 0) {
    const waarom = [];
    if ((D.voorraad.graan || 0) < T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei) waarom.push('graan');
    if (D.behoeften && D.behoeften.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.groeiDrempel) waarom.push('tevreden');
    if (T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter && T.watDeWinterNietHaalt(D, dag).length) waarom.push('winter');
    if ((D.bevolking || 0) >= T.telWoonruimte(D)) waarom.push('plaats');
    // Woont er nog een gezin in het kamp van het lege begin, dan gaat een woning eerst naar hen (js/begin.js).
    if (T.kampTenten(D).length) waarom.push('kamp');
    return waarom;
  };

  // Wat een gebouw per dag maakt als het helemaal bezet is (T.GEBOUWEN[x].maakt.uit), met wat de wetten erbij
  // doen: wie in het bos van de heer hakt (bos), hakt met de wet Houtkap meer (js/wetten.js). Of null.
  T.maaktUit = function (D, soort) {
    const uit = soort.maakt && soort.maakt.uit;
    if (!uit || !soort.bos) return uit || null;
    const f = T.wetFactor(D, 'hout');
    if (f === 1) return uit;
    const r = {};
    for (const wat in uit) r[wat] = uit[wat] * f;
    return r;
  };

  // Tot hoeveel een gebouw maakt van wat het maakt: { wat: zoveel }, of null als het doormaakt. Wie iets omzet (maakt.in),
  // maakt tot er genoeg ligt (T.GEBOUWEN_INSTELLINGEN.werkplaatsMaaktTot; vraag 91, b); wie iets uit het land haalt,
  // maakt door. Bier maakt hij tot er genoeg ligt boven wat de waard apart houdt voor de huizen (T.bierApart, js/herberg.js;
  // vraag 102, b), als je het dorp meegeeft.
  T.maaktTot = function (soort, D) {
    const m = soort.maakt;
    if (!m || !m.in || !m.uit) return null;
    // De wapenmaker maakt wat de wachthuizen vragen (js/soldaten.js), niet tot er genoeg ligt.
    if (m.keuze) return D ? T.wapensGevraagd(D) : {};
    const tot = {};
    for (const wat in m.uit) tot[wat] = T.GEBOUWEN_INSTELLINGEN.werkplaatsMaaktTot + (wat === 'bier' && D ? T.bierApart(D) : 0);
    return tot;
  };

  // Wat gebouw g vandaag maakt, en waarvan: { in, uit } zoals T.GEBOUWEN[x].maakt, of null. Wie kiest (maakt.keuze: de
  // wapenmaker, vraag 159), maakt één waar per dag: die waarvan er het meest gevraagd wordt en nog niet ligt (T.maaktTot,
  // min de voorraad, de stapels en wat hij al half af heeft, g.half), het liefst een waarvoor hij heeft wat erin gaat; met
  // keuze[wat] als wat erin gaat. Hij maakt hele stukken: wat half af is, blijft in g.half tot het heel is (de nachtlus).
  // Vraagt niemand iets, dan null.
  const halfAf = (g, wat) => (g.half && g.half[wat]) || 0;
  const nogNodig = (D, g, tot, wat) => (tot[wat] || 0) - ((D.voorraad && D.voorraad[wat]) || 0) - T.opDeStapels(D, wat) - halfAf(g, wat);
  T.receptVan = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    const m = soort && soort.maakt;
    if (!m || !m.keuze) return m || null;
    const tot = T.maaktTot(soort, D);
    let beste = null;
    for (const wat in m.keuze) {
      const nodig = nogNodig(D, g, tot, wat);
      if (nodig <= 1e-9) continue;
      const kan = Object.keys(m.keuze[wat]).every((x) => T.verwerkVoorraad(D, g, x) > 1e-9);
      const score = (kan ? 1000 : 0) + nodig;
      if (!beste || score > beste.score) beste = { wat, score };
    }
    return beste ? { in: m.keuze[beste.wat], uit: { [beste.wat]: m.uit[beste.wat] } } : null;
  };

  // Wat er bij gebouw g in kan gaan, voor de ossenkar die het brengt (js/kar.js): wat hij verwerkt (maakt.in), en bij
  // wie kiest alleen wat erin gaat voor wat er gevraagd wordt. { wat: per dag }, of {}.
  T.watErIngaat = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    const m = soort && soort.maakt;
    if (!m || !m.in) return {};
    if (!m.keuze) return m.in;
    const tot = T.maaktTot(soort, D);
    const uit = {};
    for (const wat in m.keuze) {
      if (nogNodig(D, g, tot, wat) <= 1e-9) continue;
      for (const x in m.keuze[wat]) uit[x] = Math.max(uit[x] || 0, m.keuze[wat][x]);
    }
    return uit;
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag: gebouwen die klaarkomen, woonruimte, eten, groei, handen en productie
  // ---------------------------------------------------------------------------------------------

  // Eén dag bijwerken. Losstaand van T.werkGebouwenBij hieronder (die roept dit per verstreken
  // dag aan) zodat hij ook in een toets in één keer op een vaste dag te proberen is.
  T.tikGebouwenDag = function (D, dag) {
    const IN = T.GEBOUWEN_INSTELLINGEN;
    // Het weer van de dag die begint (js/weer.js): regen of zon, en of het droogte is. Als eerste, want de oogst, de
    // visser en de balk vragen ernaar.
    T.tikWeerDag(D, dag);
    T.tikBeginDag(D); // het lege begin: staat het kamp nog niet, dan nu (js/begin.js)
    // De ossenkar (js/kar.js): wat hij gisteren nog reed, tot middernacht; vóór het eten en het stoken, want wat hij
    // binnenbracht, ligt in de opslag.
    T.tikKarDag(D, dag);
    // 0. De akkers (js/akkers.js): zaaien op 1 lentemaand, en het vangnet na de oogsttijd. Als
    // eerste: de boeren zaaien 's morgens, en daarna eet het dorp van wat er over is.
    T.tikAkkersDag(D, dag);
    // Het vee (js/vee.js): jongen op 1 grasmaand, en de melk van vandaag. Ná de akkers, want op 1
    // lentemaand verhuist het vee daar naar zijn nieuwe weide; vóór de behoeften, want het dorp eet
    // de melk van vandaag als eerste (stap 3), en de tevredenheid moet hem dus al zien.
    T.tikVeeDag(D, dag);
    // De herberg (js/herberg.js): wie er gisteravond was, dronk zijn bier. Vóór de behoeften, want wie
    // er deze week was, is tevredener; en vóór het brouwen hieronder, want het bier van gisteravond
    // kwam uit de voorraad van gisteren.
    T.tikHerbergDag(D, dag);
    // Behoeften: eten, brandhout en een kerk, en de tevredenheid die daaruit volgt
    // (js/behoeften.js, T.tikBehoeftenDag) — vóór de rest, zodat stap 4 en 6 hieronder de
    // tevredenheid van vandaag gebruiken.
    const alGegeten = T.tikBehoeftenDag(D, dag); // wat de huizen aan brood, vis, vlees en wijn aten, per soort (stap 3)
    // Twee bazen (js/bazen.js): het vertrouwen van het dorp volgt langzaam hoe het gaat.
    T.tikBazenDag(D);
    // En de marskramer (js/handel.js): komt hij vandaag, of is zijn tijd om?
    T.tikHandelDag(D, dag);
    T.tikBodeDag(D, dag); // de bode met de marskramer op bestelling (js/bode.js)
    // En de heer (js/heer.js): zijn brief in wijnmaand, hijzelf op Sint-Maarten, en de soldaten.
    T.tikHeerDag(D, dag);
    // En zijn heervaart (js/heervaart.js): in een dorp vraagt hij op 1 hooimaand mannen, en op 1 herfstmaand komen
    // ze terug. Vóór het verdelen van de handen hieronder, want wie vandaag gaat, werkt vandaag niet meer.
    T.tikHeervaartDag(D, dag);
    // En zijn grillen (js/grillen.js): elke maand een brief met iets wat hij wil (met de spelregel "Twee bazen").
    T.tikGrillenDag(D, dag);
    // En de voorvallen (js/voorvallen.js): om de paar dagen komt iemand je zoeken met een vraag, een ruzie of een ramp.
    T.tikVoorvallenDag(D, dag);
    // Een huis dat afbrandde, bouwt het gezin weer op (js/brand.js); en de koorts gaat rond, of is voorbij (js/koorts.js).
    T.tikBrandDag(D, dag);
    T.tikKoortsDag(D, dag);
    T.tikLevenDag(D, dag); // ouder worden, geboren worden en sterven (js/leven.js)
    // En de feesten (js/feesten.js): begint er vandaag een, dan zegt het dorp het en staat de meiboom er; op een hele
    // feestdag werkt niemand (stap 6 hieronder).
    T.tikFeestenDag(D, dag);
    // Een huis dat wil doorgroeien en waar het gezin eerst rooit wat in de weg staat (js/bos.js).
    T.tikRooienDag(D);
    // In het lege begin: het werk van gisteren aan de bouwplaatsen (js/bouwen.js), vóór wat er vandaag klaarkomt.
    T.tikBouwenDag(D, dag);
    // Het bos (js/bos.js): een boompje wordt een jonge boom, een jonge boom een boom, en een oude stronk vergaat.
    T.tikBosDag(D);
    // En wat erin leeft (js/beesten.js): een groep die zijn thuis kwijt is, zoekt een nieuw of trekt weg; in de winter
    // jagen de wolven met honger op de herten; in de lente komen er jongen.
    T.tikBeestenDag(D, dag);
    // 1. Gebouwen die vandaag klaarkomen: het spookbeeld wordt de tekening zelf (dezelfde
    // voorwerp-ingang, zie zetGebouwVoorwerp hierboven — er komt er geen tweede bij). Een bouwplaats
    // van het lege begin (klaarOp null, js/bouwen.js) komt klaar als het werk af is, niet op een dag.
    for (const g of D.gebouwen) {
      if (!g.klaar && g.klaarOp != null && dag >= g.klaarOp) {
        T.komtKlaar(D, g, dag);
      } else if (g.klaar && g.voorwerp && g.voorwerp.inAanbouw && g.voorwerp.klaarOp != null && dag >= g.voorwerp.klaarOp) {
        // een huis dat doorgroeide (js/behoeften.js, groeiGebouw) of na een brand herrees (js/brand.js), is opgerezen
        g.voorwerp.inAanbouw = false;
        T.maakJong(g.voorwerp, dag);
      }
    }
    // Is er een hut of huis af, dan trekt er een gezin uit het kamp van het lege begin in, vóór er een nieuw gezin kan
    // komen (js/begin.js).
    T.verhuisUitHetKamp(D);
    // Een schuur die af is, krijgt zijn ossenkar (js/kar.js; werklijst C, stap 4).
    T.geefSchurenEenKar(D);
    // Een veld dat af is, wordt land; een lege boerderij krijgt een gezin; de boeren krijgen hun akkers (js/boerderij.js).
    T.tikBoerderijenDag(D, dag);
    // En wat oud genoeg is, draagt zijn oude tekening (hierboven, bij T.maakOud).
    T.tikVerwerenDag(D, dag);
    // De markt op het plein groeit mee met het dorp, en zijn kramen liggen vol of leeg (js/markt.js).
    T.tikMarktDag(D);
    // 2. Woonruimte (T.telWoonruimte hieronder).
    const woonruimte = T.telWoonruimte(D);
    D.woonruimte = woonruimte;
    // 3. Eten: iedereen eet, of er genoeg is of niet (T.wijzigVoorraad zakt nooit onder nul — een
    // dorp dat te veel monden telt, eet zijn voorraad dus leeg; wat honger doet, staat in
    // js/behoeften.js). De maaltijd, in gelijke delen van elke soort die er ligt, en daaruit de afwisseling; het
    // zaaigraan pas bij nood (T.eetVandaag, js/behoeften.js; vraag 154). Wat de huizen al aten aan brood, vis, vlees en
    // wijn van hun wensen, eet het dorp minder (vraag 92, a).
    const gegeten = T.eetVandaag(D, dag, alGegeten);
    // De wachters bij de graanschuur (js/graanschuur.js): na het zaaien naar huis, en honger kost vertrouwen.
    T.tikGraanschuurDag(D, dag, gegeten.tekort > 0);
    T.tikWijngaardDag(D, dag); // de wijn die nog in de manden zat, en of het gezin morgen plukt (js/wijngaard.js)
    // Honger in het voorjaar en de zomer, van 1 lentemaand tot de oogst: dan maken de boeren na de oogst een weide erbij
    // (T.boerenKiezenVelden, js/akkers.js; vraag 132).
    if (gegeten.tekort > 0 && D.behoeften && T.datumVanDag(dag).maand <= T.MAANDEN.findIndex((m) => m.naam === 'oogstmaand')) {
      D.behoeften.voorjaarsHonger = (D.behoeften.voorjaarsHonger || 0) + 1;
    }
    // 4. Groei: om de gezinDagen dagen komt er een gezin bij, als de voorraad een buffer overhoudt
    // (zodat een net geboren gezin niet meteen honger lijdt), het dorp tevreden genoeg is
    // (js/behoeften.js, T.BEHOEFTEN_INSTELLINGEN.groeiDrempel), en het de winter haalt als die in zicht
    // is (gezinWachtOpDeWinter); dat zegt T.waaromGeenGezin hierboven. Zonder D.behoeften (nog geen
    // dag getikt) blokkeert de tevredenheid niets. Het komt in een
    // huis met plaats, of zegt dat er geen plaats is. Met de wet Vreemden welkom kan dat vaker
    // (T.gezinDagen hierboven). Zolang er een gezin in het kamp van het lege begin woont, komt er niemand (js/begin.js).
    if (dag > 0 && dag % T.gezinDagen(D) === 0) {
      const waarom = T.waaromGeenGezin(D, dag);
      if (!['graan', 'tevreden', 'winter', 'kamp'].some((w) => waarom.includes(w))) T.gezinKomt(D);
    }
    // 5. Handen: verdeeld over de werkplaatsen, en wie waar werkt (T.verdeelHanden hierboven). Wie dan geen werk heeft,
    // kan soldaat worden (js/soldaten.js; vraag 159, B1), en wie dan nog over is, bouwt vandaag mee (js/bouwen.js).
    T.verdeelHanden(D);
    T.tikSoldatenDag(D);
    T.kiesBouwers(D);
    // 6. Productie: wat een gebouw maakt, gaat per dag naar de voorraad — naar rato van hoe bezet
    // hij is (de helft van zijn handen geeft de helft van zijn opbrengst), en van het werktempo van het dorp: de
    // tevredenheid en de afwisseling van de maaltijd van vandaag (T.werkTempo hieronder).
    const werkFactor = T.werkTempo(D).factor;
    // Gereedschap: wie iets maakt en er gereedschap voor heeft, werkt harder (alleen wie handen
    // heeft: een kippenhok werkt niet harder met een hamer), en het slijt (hieronder, na het werk).
    // Wie vandaag stilligt (T.stilOp: de visser als de beek dichtligt, de wijnboerderij buiten de pluk), maakt vandaag
    // niets; de eerste dag dat het zo is, zegt het dorp het (de pluk niet: die stilte hoort bij het jaar).
    const seizoen = seizoenVan(dag);
    const gereedschap = T.gereedschapDekking(D, seizoen);
    // Op een hele feestdag (js/feesten.js, T.vrijeDag) werkt niemand: wie handen heeft, maakt vandaag niets.
    const vrij = T.vrijeDag(D, dag);
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      const wasStil = g.stilWant;
      g.tekort = null;
      g.vol = null;
      g.werkte = 0;
      g.stilWant = null;
      g.uren = null;
      if (!g.klaar) continue;
      // Wie niets per dag maakt, maar in zijn maanden oogst (de wijnboerderij, `alleenIn`), ligt daarbuiten stil; dan zegt
      // de raad dat (T.watDeHuizenMissen), en niet dat hij te weinig maakt.
      if (!soort.maakt) {
        if (soort.alleenIn) g.stilWant = T.stilOp(soort, dag, seizoen);
        continue;
      }
      if (vrij && soort.handen > 0) {
        g.stilWant = T.t('the village is feasting');
        continue;
      }
      // Wie in dit seizoen stilligt, of een houthakker die binnen zijn bereik geen boom meer vindt (js/bos.js).
      // En een visser aan een beek die in de droogte droogvalt (js/weer.js).
      const stil = T.stilOp(soort, dag, seizoen) || T.waaromHaktHijNiet(D, g) || T.waaromVistHijNiet(D, g);
      if (stil) {
        g.stilWant = stil;
        if (!wasStil && T.ui && T.ui.bericht && !soort.alleenIn) T.zeg(D, T.t('The {naam} is idle: {waarom}.', { naam: soort.naam, waarom: stil }));
        continue;
      }
      // Wat hij vandaag maakt (T.receptVan): voor de meesten wat hij altijd maakt, voor de wapenmaker wat er gevraagd wordt.
      const m = T.receptVan(D, g);
      g.maaktNu = m && m !== soort.maakt ? Object.keys(m.uit)[0] : null;
      if (!m) {
        g.stilWant = T.t('nobody has asked for weapons');
        continue;
      }
      // Werk telt in uren (js/bewoners.js, T.werkUrenVan; Marcel koos op 26 sep de looptijd): wie ver van zijn werk
      // woont, is langer onderweg, en de werkplaats maakt naar de uren dat hij er echt is. Zonder bewoners (een toets
      // met een eigen, kleine wereld), naar het aantal handen.
      g.uren = soort.handen > 0 ? T.werkUrenVan(D, g, dag) : null;
      const bezet = g.uren ? (g.uren.nodig > 0 ? g.uren.gewerkt / g.uren.nodig : 0) : g.handen / soort.handen;
      // Een visser vangt in de droogte naar wat er van zijn water over is (js/weer.js).
      let factor = (soort.handen > 0 ? bezet * werkFactor * gereedschap.factor : werkFactor) * T.visserWater(D, g);
      if (factor <= 0) continue;
      // Wat hij nodig heeft, bepaalt hoeveel hij kan: een smidse zonder ijzer staat stil, met ijzer
      // voor een halve dag werkt hij een halve dag. Tot 24 sep maakte hij toch gereedschap, uit
      // niets, en maalde een molen zonder graan toch meel (spel.md, "Handel"). Het zaaigraan dat de
      // boeren achterhouden, neemt hij niet (T.zaaigraanApart, js/akkers.js; vraag 81): in de speeltest
      // van 2 okt maalde de molen het op, en bleven de akkers in de lente ongezaaid.
      if (m.in) {
        for (const wat in m.in) {
          // wat met de ossenkar gaat, uit wat bij hem ligt (js/kar.js, T.verwerkVoorraad)
          const vrij = Math.max(0, T.verwerkVoorraad(D, g, wat) - (wat === 'graan' && !T.gaatMetDeKar(D, wat) ? T.zaaigraanApart(D, dag) : 0));
          const kan = vrij / m.in[wat];
          if (kan < factor) {
            factor = kan;
            g.tekort = wat;
          }
        }
      }
      // Wie iets omzet, maakt tot er genoeg ligt (T.maaktTot: de herberg brouwt tot er 30 bier is boven wat apart ligt
      // voor de huizen, de molen maalt tot er 30 meel is), en niet meer dan wat er nog bij kan. Houdt dat hem tegen, dan is dat wat hem tegenhoudt, en
      // niet wat hij nodig heeft.
      const tot = T.maaktTot(soort, D);
      if (tot) {
        for (const wat in tot) {
          const per = (m.uit && m.uit[wat]) || 0;
          // (wat op de stapels ligt, komt nog binnen: js/kar.js)
          const kan = per > 0 ? Math.max(0, tot[wat] - (D.voorraad[wat] || 0) - T.opDeStapels(D, wat) - halfAf(g, wat)) / per : factor;
          if (kan < factor) {
            factor = kan;
            g.vol = wat;
            g.tekort = null;
          }
        }
      }
      // Met de ossenkar (js/kar.js) legt hij wat hij maakt op de stapel bij zijn deur, en maakt hij niet meer dan erop
      // past: is de stapel vol, dan staat hij stil tot de kar komt (werklijst C, stap 1).
      const perDag = m === soort.maakt ? T.maaktUit(D, soort) : m.uit;
      const ruimte = T.ruimteOpStapel(D, g);
      if (ruimte < Infinity) {
        const per = perDag;
        let opStapel = 0;
        for (const wat in per) if (T.gaatMetDeKar(D, wat)) opStapel += per[wat];
        if (opStapel > 0 && ruimte / opStapel < factor) factor = ruimte / opStapel;
        if (factor <= 0) {
          g.stilWant = T.t('its stack is full, waiting for the ox cart');
          if (!wasStil) T.zeg(D, T.t('The {naam} is idle: {waarom}.', { naam: soort.naam, waarom: g.stilWant }));
          continue;
        }
      }
      g.werkte = factor;
      if (factor <= 0) continue;
      if (m.in) for (const wat in m.in) T.verwerk(D, g, wat, m.in[wat] * factor);
      // De jager schiet klein wild, en herten als er een is dat hij mag nemen (js/beesten.js).
      const uit = T.watDeJagerSchiet(D, g, perDag);
      // Wat met de kar gaat, op zijn stapel; de rest meteen in de voorraad (T.opStapel, js/kar.js). Wie kiest (de
      // wapenmaker), legt er alleen hele stukken neer, en onthoudt wat half af is (g.half): een halve speer haalt de kar
      // niet, en kan niemand pakken.
      if (uit && soort.maakt.keuze) {
        const half = g.half || (g.half = {});
        for (const wat in uit) {
          half[wat] = (half[wat] || 0) + uit[wat] * factor;
          const heel = Math.floor(half[wat] + 1e-9);
          half[wat] = Math.max(0, half[wat] - heel);
          if (heel > 0) T.opStapel(D, g, wat, heel);
        }
      } else if (uit) for (const wat in uit) T.opStapel(D, g, wat, uit[wat] * factor);
      // Het hout van de houthakker kwam uit zijn boom: is die om, dan staat er een stronk, en hakt hij morgen de volgende
      // (js/bos.js).
      if (uit && uit.hout) T.houthakkerHakte(D, g, uit.hout * factor);
      // Het vlees van de jager kwam ook uit de herten: elke zoveel is er een hert minder, en hij houdt de roedels klein
      // (js/beesten.js).
      if (uit && uit.huiden) T.jagerJaagde(D, g, (uit.vlees || 0) * factor, dag, factor);
    }
    // Wat in gebruik was, slijt: één stuk per hand die vandaag echt iets maakte (een smidse zonder
    // ijzer slijt zijn hamers niet).
    let aanHetWerk = 0;
    for (const g of D.gebouwen) if (g.werkte > 0 && g.handen > 0) aanHetWerk += g.handen;
    const slijt = Math.min(D.voorraad.gereedschap || 0, aanHetWerk) / IN.gereedschapSlijtDagen;
    if (slijt > 0) T.wijzigVoorraad(D, 'gereedschap', -slijt);
    // 7. De wetten (js/wetten.js): wie vandaag in het bos van de heer hakte, en de belasting op de eerste van de maand.
    T.tikWettenDag(D, dag);
    // En de rovers (js/rovers.js): de doden begraven, wie het overleefde geneest, en komen ze vandaag?
    T.tikRoversDag(D, dag);
    // 8. De trede (js/treden.js): met genoeg mensen, en een kapel en een smidse klaar, wordt het gehucht een dorp.
    T.tikTredeDag(D);
    // 9. Het eind (js/einde.js): het jaarboek telt wat er vandaag in het dagboek staat (dus vóór het rapport, dat het
    // dagboek opnieuw laat beginnen), op 1 lentemaand het jaarverslag, en of het verloren is.
    T.tikEindeDag(D, dag);
    // De paadjes (js/paden.js): waar vandaag gelopen werd, slijt het gras; en een lantaarn bij wat er van het dorp klaar
    // kwam, en op een nieuwe kruising.
    T.tikPadenDag(D);
    // 10. Als laatste het rapport (js/ochtendrapport.js): de raadsman schrijft op wat er gebeurde en hoe het gaat, en
    // brengt het je morgenvroeg; het dagboek begint opnieuw.
    T.tikStatussenDag(D, dag); // wat er speelt, en sinds wanneer, voor de balk (js/voorvallen.js)
    T.tikOchtendrapportDag(D, dag);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(D);
  };

  // Wordt elk beeld aangeroepen (js/main.js, werkBij, net als T.tikKalender) en merkt zelf wanneer
  // er een hele dag voorbij is — op de eigen kalenderklok, dus dit loopt vanzelf mee met pauze en
  // met 1×/2×/3× (js/tijd.js). Kan er meer dan één dag in één stap voorbij zijn (een grote dt),
  // dan komt elke dag apart aan de beurt, zodat groei en verbruik niet worden overgeslagen.
  T.werkGebouwenBij = function (D) {
    if (!D.kalender || !D.gebouwen) return;
    const dagNu = Math.floor(D.kalender.dag);
    if (D.gebouwenDag == null) {
      D.gebouwenDag = dagNu; // eerste keer: alleen onthouden waar we beginnen
      return;
    }
    while (D.gebouwenDag < dagNu) {
      D.gebouwenDag++;
      T.tikGebouwenDag(D, D.gebouwenDag);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
