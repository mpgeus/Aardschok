// De gebouwen van het dorp: welke soorten er zijn, op één plek (T.GEBOUWEN), zoals js/mensen.js
// dat voor mensen doet. Zie ontwerp/spel.md, "Gebouwen" voor het voorstel (Marcel, 23 sep 2026:
// "huis, deze zorgen ervoor dat je populatie kan groeien; boerderij, meer mensen op de akker.
// Smidse, timmerman, wapenmaker. En alle anderen.") en ontwerp/werklijst.md, punt 2.
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
//                                    // is niets: een hut oogt arm, een verstopplek ziet hij niet.
//                                    // Hij vraagt naar wat hij ziet: wol bij schapen, eieren bij
//                                    // kippen, hout voor zijn bos; de rest in goud. Het bouwmenu
//                                    // laat het zien (js/hud.js).
//     bouwtijd:    4,                // dagen tot hij klaar is
//     handen:      0,                // hoeveel mensen hij als werkplaats vraagt
//     liefst:      'jong',           // wie hij het liefst neemt (T.LEEFTIJDEN, js/bewoners.js): de
//                                    // schaapskooi een knaap. Ontbreekt hij, dan eerst volwassenen.
//     woonruimte:  5,                // hoeveel mensen erbij kunnen als hij klaar is
//     wordt:       'huis',           // waar hij in doorgroeit als zijn bewoners lang genoeg
//                                    // tevreden zijn (js/behoeften.js, T.tikBehoeftenDag); alleen
//                                    // bij een huis dat de speler zelf neerzette. Ontbreekt hij,
//                                    // dan groeit deze soort niet door.
//     maakt:       null,             // of { in: {hout: 1}, uit: {planken: 1} }: per dag, op volle
//                                    // bezetting (T.tikGebouwenDag schaalt mee met hoe bezet hij is
//                                    // én, sinds js/behoeften.js, met de tevredenheid)
//     stilIn:      null,             // of { winter: 'de beek ligt dicht' }: in dat seizoen maakt hij
//                                    // niets, en dit is waarom (de visser; spel.md, "Handel")
//     verdacht:    false,            // moet de heer dit niet zien? (wapenmaker, schuttershof, …)
//     kerk:        false,            // telt als "een kerk" voor de behoeften (js/behoeften.js:
//                                    // T.heeftKerk) — nu alleen de kapel, later ook de kerk zelf
//     menu:        true,             // false: niet via het bouwmenu (akker, stadsmuur, palissade —
//                                    // die hebben een eigen manier van neerzetten, geen enkele voet)
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
// voor de volledige lijst) of blijft zonder tekening als een tekening hem juist zou verraden
// (de verstopplek). Een akker, een stadsmuur en een palissade zijn geen los blokje van één voet en
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
    // Gereedschap (van de smidse, spel.md "Handel"): wie iets maakt en er gereedschap voor heeft,
    // werkt zoveel harder (0,25 is een kwart). Eén stuk per hand aan het werk is genoeg; met de
    // helft werkt de helft harder. Een stuk in gebruik gaat zoveel dagen mee en is dan versleten.
    gereedschapBonus: 0.25,
    gereedschapSlijtDagen: 180,
  };

  T.GEBOUWEN = {
    // ── Gehucht ──
    hut: {
      naam: 'hut', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 8 }, heer: {}, bouwtijd: 2,
      handen: 0, woonruimte: 3, wordt: 'huis', maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein2', beschrijving: 'ruimte voor een gezin; goedkoop, en arm om te zien',
      // Drie kleine huizen, zodat een rij hutten niet uit één stempel komt (Marcel, 26 sep: "We hebben
      // meer afwisseling nodig in de huizen en hutten"). Arm genoeg zijn ze niet: echte hutten van
      // vlechtwerk en leem komen met ronde 4b van de huizenbouwer.
      tekeningen: ['gebouwen/dorpKlein2', 'gebouwen/dorpKlein3', 'gebouwen/dorpKlein1'],
      opmerking: 'nieuw (plaggenhut): nog niet getekend, leent voorlopig de kleinste bestaande huizen.',
    },
    huis: {
      naam: 'huis', trede: 'gehucht', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 4 }, heer: { goud: 2 }, bouwtijd: 4,
      handen: 0, woonruimte: 5, wordt: 'stenenHuis', maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpshuis1', beschrijving: 'ruimte voor meer mensen', opmerking: '',
      // Vier huizen onder riet, want steen hoort pas bij een dorp (Marcel, 26 sep; spel.md, "Beter
      // bouwen").
      tekeningen: ['gebouwen/dorpshuis1', 'gebouwen/vakwerkhuis', 'gebouwen/dorpshuis5', 'gebouwen/dorpGewoon4'],
    },
    boerderij: {
      naam: 'boerderij', trede: 'gehucht', voet: { b: 7, h: 8 }, kosten: { hout: 20, goud: 6 }, heer: { goud: 1 }, bouwtijd: 5,
      handen: 2, woonruimte: 4, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuur', beschrijving: 'boeren voor de akkers, en een schuur voor de oogst',
      opmerking: 'Maakt zelf geen graan: dat komt binnen als de boeren een akkertegel maaien '
        + '(T.GRAAN_PER_TEGEL in js/akkers.js). Eerst stond hier een abstracte opbrengst, en dan '
        + 'telde het dubbel.',
    },
    akker: {
      naam: 'akker', trede: 'gehucht', voet: null, kosten: { hout: 2 }, heer: {}, bouwtijd: 1,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: false,
      tekening: null, beschrijving: 'graan (rogge, gerst)',
      opmerking: 'Geen los blokje maar een hele strook; gaat niet via het bouwmenu. Zie "akker" in '
        + 'js/kaart.js en gereedschap/tiled/maak-gehucht.cjs. Het graan zelf: gereedschap/pixelart/graan.cjs.',
    },
    houthakker: {
      naam: 'houthakker', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 4 }, heer: { hout: 20 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { uit: { hout: 2 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'hout uit het bos van de heer', opmerking: '',
    },
    // Sinds de weides, stap 2 (25 sep 2026) maakt de kooi zelf niets: de schapen van de heide slapen
    // erin, en js/vee.js telt de mest die de herder (zijn hand) eruit haalt, en de wol als ze in
    // zomermaand geschoren worden. Tot dan maakte hij elke dag wol, zonder dat er een schaap was.
    schaapskooi: {
      naam: 'schaapskooi', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10 }, heer: { wol: 20 }, bouwtijd: 3,
      handen: 1, liefst: 'jong', woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'de schapen van de heide slapen erin: mest voor de akkers',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur.',
    },
    kippenhok: {
      naam: 'kippenhok', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 4 }, heer: { eieren: 20 }, bouwtijd: 1,
      handen: 0, woonruimte: 0, maakt: { uit: { eieren: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/kippenhok', beschrijving: 'eieren, en de pachthoenders voor de heer',
      opmerking: '',
    },
    moestuin: {
      naam: 'moestuin', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 2 }, heer: {}, bouwtijd: 1,
      handen: 0, woonruimte: 0, maakt: { uit: { groente: 1 } }, verdacht: false, menu: true,
      tekening: 'erf/moestuin', beschrijving: 'groente bij het huis', opmerking: '',
    },
    put: {
      naam: 'put', trede: 'gehucht', voet: { b: 1, h: 1 }, kosten: { hout: 6, goud: 2 }, heer: {}, bouwtijd: 2,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'erf/put', beschrijving: 'water; zonder put wordt het dorp ziek',
      opmerking: 'Het effect ("zonder put wordt het dorp ziek") is nog geen regel, alleen de tekening staat er al.',
    },
    verstopplek: {
      naam: 'verstopplek', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 6 }, heer: {}, bouwtijd: 2,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: false,
      tekening: null, beschrijving: 'een plek in het bos die de inner niet ziet',
      opmerking: 'Bewust zonder tekening: een verstopplek die je wél ziet staan is geen verstopplek. '
        + 'Niet meer in het bouwmenu sinds 25 sep: Marcel wil geen kuil maar plekken die er al zijn, de '
        + 'kelders en de kapel (js/verstoppen.js). In stap 2 wordt dit misschien de plek in het bos '
        + '(spel.md, "Marcel koos voor stap 2").',
    },

    // ── Grondstoffen halen (Marcel, 23 sep: "houthakkers, steengroeve etc moeten we ook hebben";
    //    spel.md, "Grondstoffen halen"). De houthakker staat hierboven al. ──
    steengroeve: {
      naam: 'steengroeve', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 4 }, heer: { steen: 10 }, bouwtijd: 3,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'steen voor funderingen en stenen huizen',
      opmerking: 'nieuw: nog niet getekend (een groeve is een kuil met een kraan, geen huis), leent voorlopig de houtschuur.',
    },
    kleiput: {
      naam: 'kleiput', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { klei: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'klei voor de steenbakkerij: bakstenen, zo bouwde men hier echt',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    rietsnijder: {
      naam: 'rietsnijder', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { riet: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'riet uit de beek en het moeras, voor rieten daken',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.',
    },
    jager: {
      naam: 'jager', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 8 }, heer: { vlees: 5 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { vlees: 1, huiden: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/jagershut', beschrijving: 'wild uit het bos, en huiden voor de looier',
      opmerking: 'Het bos is van de heer: stropen is ook een keuze.',
    },
    visser: {
      naam: 'visser', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, heer: { vis: 10 }, bouwtijd: 2,
      handen: 1, woonruimte: 0, maakt: { uit: { vis: 2 } }, verdacht: false, menu: true,
      // Marcel, 24 sep: 's winters ligt de beek dicht, dus wie dan vis wil eten, heeft hem in de
      // herfst gezouten (spel.md, "Handel").
      stilIn: { winter: 'de beek ligt dicht' },
      tekening: 'erf/schuurtje', beschrijving: 'vis uit de beek',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.',
    },
    wachthuis: {
      naam: 'wachthuis', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 10, goud: 4 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 2, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: 'rakkers en de nachtwacht: orde houden, dieven pakken, keuren handhaven, of wegkijken',
      opmerking: 'nieuw (Marcel, 23 sep: "orde bewaarders, leger etc moeten een optie zijn"): nog niet getekend, '
        + 'leent voorlopig een klein dorpshuis. De heer vindt het goed; voor wie de rakkers echt werken, is de vraag.',
    },

    // Al in het gehucht (Marcel, 24 sep 2026; spel.md, "Handel"): eerst hangt hij voor zijn ijzer
    // af van de marskramer (js/handel.js), de ertsgraver (dorp) maakt hem later vrij.
    smidse: {
      naam: 'smidse', trede: 'gehucht', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 10 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { ijzer: 1 }, uit: { gereedschap: 1 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/smidse', beschrijving: 'ijzer tot gereedschap; betere werktuigen, sneller werk',
      opmerking: 'Zonder ijzer staat hij stil (T.tikGebouwenDag, stap 6). IJzer komt van de marskramer, tot er een ertsgraver is.',
    },

    // ── Dorp ──
    timmerman: {
      naam: 'timmerman', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 6 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 2, woonruimte: 0, maakt: { in: { hout: 2 }, uit: { planken: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpshuis3', beschrijving: 'hout tot planken en balken, nodig om te bouwen',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een dorpshuis.',
    },
    molen: {
      naam: 'molen', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 18, goud: 10 }, heer: { goud: 5 }, bouwtijd: 5,
      handen: 1, woonruimte: 0, maakt: { in: { graan: 3 }, uit: { meel: 3 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/watermolen', beschrijving: 'graan tot meel. De heer wil dat je bij zíjn molen maalt en betaalt (het banrecht); een eigen molen is verzet',
      opmerking: 'Het banrecht zelf (de heer die erop heft) is nog geen regel.',
    },
    bakkerij: {
      naam: 'bakkerij', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { meel: 2 }, uit: { brood: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/bakkerij', beschrijving: 'meel tot brood', opmerking: '',
    },
    brouwerij: {
      naam: 'brouwerij', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 10 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { graan: 2 }, uit: { bier: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpshuis5', beschrijving: 'gerst tot bier; de heer heft er belasting op',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een dorpshuis. De belasting is nog geen regel.',
    },
    herberg: {
      naam: 'herberg', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 12 }, heer: { goud: 5 }, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/herberg', beschrijving: 'reizigers, nieuws en verhalen, bier',
      opmerking: 'Zijn waarde is verhaal, geen grondstof; dat komt met het avontuur (werklijst.md, punt 8).',
    },
    kapel: {
      naam: 'kapel', trede: 'gehucht', voet: { b: 5, h: 5 }, kosten: { hout: 10, goud: 8 }, heer: {}, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, kerk: true, menu: true,
      tekening: 'gebouwen/kapel', beschrijving: 'de kerk als groep, en tevredenheid',
      opmerking: 'De tevredenheid (T.heeftKerk, js/behoeften.js, werklijst.md punt 3) is er; de kerk '
        + 'als groep met eigen belangen komt pas met de politiek (werklijst.md, punt 9). Zijn trede '
        + 'is "gehucht" (was "dorp"): het gehucht vraagt om een kerk (js/behoeften.js), dus moet hij daar '
        + 'ook te bouwen zijn; een gehucht had vaak een kapelletje. Een grotere kerk komt later.',
    },
    tiendschuur: {
      naam: 'tiendschuur', trede: 'dorp', voet: { b: 6, h: 5 }, kosten: { hout: 14, goud: 6 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'van de heer: hier lever je op Sint-Maarten, en hier zit de inner',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. Sint-Maarten zelf staat '
        + 'al in T.SINT_MAARTEN (js/tijd.js); wat er dan gebeurt is het tweede proefje (werklijst.md, punt 3).',
    },

    // ── Marktrecht ──
    markt: {
      naam: 'markt', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 14 }, heer: { goud: 10 }, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'handel met buiten; handelaars komen',
      opmerking: 'nieuw in gebouwen.tsx (de kraam bestaat als model in gereedschap/pixelart/dorp.cjs, '
        + 'nog niet geëxporteerd); leent voorlopig een groot dorpshuis.',
    },
    weverij: {
      naam: 'weverij', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 12 }, heer: { goud: 6 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { wol: 2 }, uit: { laken: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpGroot2', beschrijving: 'wol tot laken, het rijkste handelsgoed',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis.',
    },
    pakhuis: {
      naam: 'pakhuis', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 18, goud: 10 }, heer: { goud: 5 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'opslag, en een goede plek om iets tussen te schuiven',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. "Iets tussenschuiven" '
        + '(voor de heer verbergen) is nog geen regel.',
    },
    kuiper: {
      naam: 'kuiper', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { vaten: 1 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpKlein1', beschrijving: 'vaten voor bier en opslag',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis.',
    },
    slager: {
      naam: 'slager', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 8 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein2', beschrijving: 'vlees, van het vee',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Niets levert nu nog vee aan.',
    },
    leerlooier: {
      naam: 'leerlooier', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 6 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: 'leer — hij stinkt, dus hoort hij aan de rand',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. "Aan de rand" is nu '
        + 'nog een advies, geen regel die het bouwmenu afdwingt.',
    },
    steenbakkerij: {
      naam: 'steenbakkerij', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 20, goud: 16 }, heer: { goud: 6 }, bouwtijd: 5,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 2 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'stenen voor stenen huizen, die rijk ogen',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. "steen" is de eerste '
        + 'grondstof naast T.GRONDSTOFFEN; die vier blijven voorlopig het enige dat de voorraadbalk toont.',
    },
    badhuis: {
      naam: 'badhuis', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 14 }, heer: { goud: 5 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: 'gezondheid', opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.',
    },
    gasthuis: {
      naam: 'gasthuis', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 12 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: 'armenzorg', opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.',
    },

    // ── Stad ──
    stenenHuis: {
      naam: 'stenen huis', trede: 'stad', voet: { b: 6, h: 8 }, kosten: { hout: 20, goud: 30 }, heer: { goud: 6 }, bouwtijd: 6,
      handen: 0, woonruimte: 8, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/stenenHuis', beschrijving: 'veel ruimte, en rijk om te zien', opmerking: '',
    },
    raadhuis: {
      naam: 'raadhuis', trede: 'stad', voet: { b: 8, h: 6 }, kosten: { hout: 24, goud: 40 }, heer: { goud: 20 }, bouwtijd: 8,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'waar de schepenen stemmen; de schout wordt burgemeester',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis. De schepenen zelf komen met de politiek (werklijst.md, punt 6).',
    },
    stadsmuur: {
      naam: 'stadsmuur en poort', trede: 'stad', voet: null, kosten: { hout: 60, goud: 80 }, heer: { goud: 30 }, bouwtijd: 20,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: false,
      tekening: null, beschrijving: 'pas mag het met stadsrechten; zonder is het opstand',
      opmerking: 'Een muur is geen los blokje van één voet; die komt met het geschilderde-omheiningen-'
        + 'systeem (werklijst.md, "Omheiningen die je schildert"), niet via dit bouwmenu.',
    },

    // ── Verdacht: wat de heer niet mag zien ──
    wapenmaker: {
      naam: 'wapenmaker', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 14 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { in: { hout: 1, ijzer: 1 }, uit: { wapens: 1 } }, verdacht: true,
      menu: true, tekening: 'gebouwen/smidse', beschrijving: 'ijzer en hout tot wapens, voor de opstand. Verboden, dus verstopt: achter de smidse, of \'s nachts',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het vel van de smidse — toepasselijk, want hij hoort er toch achter.',
    },
    schuttershof: {
      naam: 'schuttershof', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 10, goud: 10 }, heer: { goud: 3 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/dorpKlein1', beschrijving: 'mannen oefenen; als de inner het ziet, heet het een feest',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis.',
    },
    palissade: {
      naam: 'palissade', trede: 'dorp', voet: null, kosten: { hout: 40 }, heer: { goud: 5 }, bouwtijd: 10,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: false,
      tekening: null, beschrijving: 'een muur zonder stadsrechten is een opstand die je aankondigt',
      opmerking: 'Zelfde reden als stadsmuur hierboven: geen los blokje, gaat niet via dit bouwmenu.',
    },
    tuighuis: {
      naam: 'tuighuis', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 14, goud: 10 }, heer: { goud: 3 }, bouwtijd: 4,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/schuur', beschrijving: 'waar de wapens liggen; wie een tuighuis heeft, heeft een leger',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de schuur. Bergt wat de wapenmaker maakt.',
    },
    kazerne: {
      naam: 'kazerne', trede: 'stad', voet: { b: 6, h: 6 }, kosten: { hout: 30, steen: 30, goud: 30 }, heer: { goud: 10 }, bouwtijd: 8,
      handen: 0, woonruimte: 6, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'huurlingen: duur, en een leger is een opstand',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis. Verdacht tot de stad vrij is.',
    },

    // ── Grondstoffen en orde die pas bij het dorp komen ──
    turfsteker: {
      naam: 'turfsteker', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 8 }, heer: { goud: 1 }, bouwtijd: 2,
      handen: 2, woonruimte: 0, maakt: { uit: { turf: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'turf uit het veen, om te stoken als het bos op is',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    ertsgraver: {
      naam: 'ertsgraver', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 14, goud: 8 }, heer: { goud: 4 }, bouwtijd: 4,
      handen: 2, woonruimte: 0, maakt: { uit: { ijzer: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'moerasijzer uit de grond, zoals op de Veluwe: ijzer zonder de marskramer',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. IJzer wordt ook wapens; dat ziet de inner graag van dichtbij.',
    },
    kalkbrander: {
      naam: 'kalkbrander', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 10, steen: 4 }, heer: { goud: 2 }, bouwtijd: 3,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { kalk: 1 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'kalk uit schelpen, voor metselspecie',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    gevang: {
      naam: 'gevang', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 8, steen: 10, goud: 6 }, heer: { goud: 2 }, bouwtijd: 4,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein1', beschrijving: 'wie de schout veroordeelt, zit hier',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Hoort bij de rechtspraak (werklijst 10).',
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

  // Welke tekening krijgt het volgende gebouw van deze soort? Een soort met `tekeningen` (de hut, het
  // huis) krijgt er steeds een, nooit twee keer achter elkaar dezelfde, zodat een rij hutten niet uit
  // één stempel komt (Marcel, 26 sep: "We hebben meer afwisseling nodig in de huizen en hutten"). De
  // keuze ligt vast tot hij gebouwd is (S.volgendeTekening), zodat het spookbeeld van het bouwmenu de
  // voet laat zien die er echt komt. T.neemTekening zegt dat hij gebouwd is: de volgende wordt een
  // andere.
  T.volgendeTekening = function (S, soort) {
    const g = T.GEBOUWEN[soort];
    if (!g) return null;
    const lijst = g.tekeningen && g.tekeningen.length ? g.tekeningen : null;
    if (!lijst) return g.tekening || null;
    const volgende = S.volgendeTekening || (S.volgendeTekening = {});
    if (!lijst.includes(volgende[soort])) {
      const vorige = S.vorigeTekening && S.vorigeTekening[soort];
      const kan = lijst.length > 1 ? lijst.filter((t) => t !== vorige) : lijst;
      volgende[soort] = kan[Math.floor(Math.random() * kan.length)];
    }
    return volgende[soort];
  };
  T.neemTekening = function (S, soort) {
    const t = T.volgendeTekening(S, soort);
    (S.vorigeTekening || (S.vorigeTekening = {}))[soort] = t;
    if (S.volgendeTekening) delete S.volgendeTekening[soort];
    return t;
  };

  // ---------------------------------------------------------------------------------------------
  // Geld en goederen
  // ---------------------------------------------------------------------------------------------

  T.kanBetalen = function (S, kosten) {
    for (const wat in kosten) if ((S.voorraad[wat] || 0) < kosten[wat]) return false;
    return true;
  };

  T.betaalKosten = function (S, kosten) {
    for (const wat in kosten) T.wijzigVoorraad(S, wat, -kosten[wat]);
  };

  // Het seizoen van een dag (js/tijd.js), of null. Zonder tijd.js (een toets die alleen gebouwen.js
  // laadt) is er geen seizoen, en ligt er dus ook niets stil vanwege het seizoen.
  function seizoenVan(dag) {
    return T.datumVanDag && dag != null ? T.datumVanDag(dag).seizoen : null;
  }

  // Hoeveel handen er vandaag iets maken, en hoeveel daarvan gereedschap hebben: de dekking
  // (0..1) en wat dat aan harder werken geeft (factor, 1 is niets extra). Leest g.handen van
  // vandaag, dus pas na stap 5 van T.tikGebouwenDag; ook voor de balk (js/hud.js), die bij het
  // gereedschap zegt hoeveel handen het dekt.
  T.gereedschapDekking = function (S, seizoen) {
    const IN = T.GEBOUWEN_INSTELLINGEN;
    const nu = seizoen !== undefined ? seizoen : seizoenVan(S.kalender && S.kalender.dag);
    let handen = 0;
    for (const g of S.gebouwen || []) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort || !soort.maakt || !(g.handen > 0)) continue;
      // Wie niets te bewerken heeft (een smidse zonder ijzer) of in dit seizoen stilligt (de
      // visser als de beek dichtligt), gebruikt ook geen gereedschap.
      if (soort.maakt.in && Object.keys(soort.maakt.in).some((wat) => !((S.voorraad || {})[wat] > 0))) continue;
      if (soort.stilIn && nu && soort.stilIn[nu]) continue;
      handen += g.handen;
    }
    const heeft = (S.voorraad && S.voorraad.gereedschap) || 0;
    const dekking = handen > 0 ? Math.min(1, heeft / handen) : 0;
    return { handen, heeft, dekking, factor: 1 + IN.gereedschapBonus * dekking };
  };

  // Het gebouw waarvan deze tegel onder de voet ligt, of null. Ook een gebouw dat al op de kaart
  // stond (T.zetBestaandeGebouwen): dat heeft geen eigen voorwerp, maar wel een voet uit het
  // betekenisbestand. Die telden hier eerst niet mee (ze maken niets, dus ze staan ook nooit
  // stil), maar sinds 25 sep kun je er iets in verstoppen (js/verstoppen.js).
  T.gebouwOp = function (S, x, y) {
    for (const g of S.gebouwen || []) {
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
  T.gebouwToestand = function (S, g) {
    const soort = T.GEBOUWEN[g.soort];
    if (!soort) return '';
    const naam = T.hoofdletter(soort.naam);
    if (!g.klaar) {
      const dagNu = S.kalender ? Math.floor(S.kalender.dag) : 0;
      const nog = Math.max(1, g.klaarOp - dagNu);
      return `${naam}: in aanbouw, nog ${nog} dag${nog === 1 ? '' : 'en'}.`;
    }
    if (!soort.maakt) return `${naam}: ${soort.beschrijving}.`;
    if (g.stilWant) return `${naam}: staat stil, ${g.stilWant}.`;
    if (soort.handen > 0 && !g.handen) return `${naam}: staat stil, er zijn geen handen voor.`;
    if (g.tekort && !(g.werkte > 0)) return `${naam}: staat stil, er is geen ${g.tekort}.`;
    if (g.tekort) return `${naam}: werkt maar half, er is te weinig ${g.tekort}.`;
    const handen = soort.handen > 0 ? ` (${g.handen} van ${soort.handen} handen)` : '';
    return `${naam}: aan het werk${handen}.`;
  };

  // ---------------------------------------------------------------------------------------------
  // Neerzetten: past het, en dan echt neerzetten (bouwmenu, T.plaatsGebouw hieronder) — en de
  // gebouwen die al op de kaart staan (js/gebied.js, T.zetBestaandeGebouwen)
  // ---------------------------------------------------------------------------------------------

  // Past soort op (x, y) (de linkerbovenhoek van zijn voet, net als "beslaat" bij een gewoon
  // voorwerp)? Binnen de kaart, en nergens al vast — dat dekt zowel de rand van de wereld als een
  // ander gebouw, een boom, of muur (T.isVast, js/wereld.js).
  T.gebouwPast = function (S, soort, x, y) {
    const voet = T.gebouwVoet(soort, T.volgendeTekening(S, soort));
    const w = S.wereld;
    if (!voet || !w) return false;
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        if (T.isVast(w, x + dx, y + dy)) return false;
      }
    }
    return true;
  };

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
  const AANTAL_BOUWFASEN = 5;
  T.bouwFaseIndex = function (dagNu, klaarOp, bouwtijd) {
    if (!(bouwtijd > 0)) return AANTAL_BOUWFASEN - 1; // bouwtijd 0: meteen de laatste fase
    const voortgang = 1 - (klaarOp - dagNu) / bouwtijd;
    return Math.max(0, Math.min(AANTAL_BOUWFASEN - 1, Math.floor(voortgang * AANTAL_BOUWFASEN)));
  };

  // Het voorwerp in S.wereld zetten (zo tekent js/tekenen.js hem mee, op precies dezelfde manier
  // als een gebouw dat in Tiled staat, CLAUDE.md "Testen in de browser": "via de gewone weg
  // waarop het spel gebouwen tekent") en zijn voet vast maken. Nog in aanbouw? Dan staat hij er al
  // (bleek, `inAanbouw: true` — js/tekenen.js dimt hem, of toont een bouwfase als het gebouw die
  // heeft, zie T.bouwFaseIndex hierboven en T.sprites.bouwfase in js/sprites.js), zodat de speler
  // ziet waar hij bezig is; T.tikGebouwenDag zet dat om zodra de bouwtijd om is, op hetzelfde
  // voorwerp, dus zonder dat er ooit een tweede bij komt.
  function zetGebouwVoorwerp(S, instantie) {
    const g = T.GEBOUWEN[instantie.soort];
    const w = S.wereld;
    const tekening = instantie.tekening || g.tekening;
    const opz = tekening && T.opzoekTegelNaam ? T.opzoekTegelNaam(tekening) : null;
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
    };
    w.voorwerpen.push(v);
    instantie.voorwerp = v;
    for (let dy = 0; dy < voet.h; dy++) {
      for (let dx = 0; dx < voet.b; dx++) {
        const yy = instantie.y + dy;
        const xx = instantie.x + dx;
        if (w.tegels[yy] && w.tegels[yy][xx] !== undefined) w.tegels[yy][xx] = 'muur';
      }
    }
  }

  // Een nieuw gebouw neerzetten via het bouwmenu (js/hud.js, js/main.js): kijkt of het past en of
  // de voorraad toereikend is, trekt de kosten er dan in één keer af en zet hem neer — nog in
  // aanbouw, T.tikGebouwenDag zet hem na zijn bouwtijd op "klaar". Geeft altijd
  // { gelukt, reden } terug (reden alleen als het niet lukte), zodat de aanroeper kan zeggen
  // waarom een klik niets deed — dezelfde vorm als handelingVerkennen/handelingGevecht
  // (CLAUDE.md, "Scherm en klik stellen dezelfde vraag").
  T.plaatsGebouw = function (S, soort, x, y) {
    const g = T.GEBOUWEN[soort];
    if (!g || g.menu === false) return { gelukt: false, reden: 'Dat kan niet via het bouwmenu.' };
    if (!T.gebouwPast(S, soort, x, y)) return { gelukt: false, reden: 'Daar past het niet.' };
    if (!T.kanBetalen(S, g.kosten)) return { gelukt: false, reden: 'Daar is de voorraad niet groot genoeg voor.' };
    T.betaalKosten(S, g.kosten);
    const dagNu = S.kalender ? Math.floor(S.kalender.dag) : 0;
    // Zijn eigen tekening en de voet die daarbij hoort (T.volgendeTekening): een hut is niet elke hut.
    const tekening = T.neemTekening(S, soort);
    const voet = T.gebouwVoet(soort, tekening);
    const instantie = { soort, x, y, tekening, voet, klaar: g.bouwtijd <= 0, klaarOp: dagNu + g.bouwtijd, handen: 0, voorwerp: null };
    S.gebouwen.push(instantie);
    zetGebouwVoorwerp(S, instantie);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(S);
    return { gelukt: true, instantie };
  };

  // De gebouwen die al op de kaart staan (kaarten/<naam>.betekenis.json, ding "gebouw": de vijf
  // boerderijen en het huis van de schout op het gehucht) meteen als klaar registreren, zodat het
  // dorp niet leeg begint (ontwerp/werklijst.md, punt 2). Hun tekening staat al op de kaart zelf
  // (ze zijn in Tiled neergezet, net als een boom), dus hier komt geen nieuw voorwerp bij — alleen
  // de boekhouding: woonruimte, en straks handen. De bevolking begint meteen op de woonruimte die
  // ze samen geven, want die huizen staan al vol (de boeren die je ziet lopen, wonen er al).
  T.zetBestaandeGebouwen = function (S) {
    const w = S.wereld;
    if (!w || !w.gebouwenOpKaart || !w.gebouwenOpKaart.length) return;
    let woonruimte = 0;
    for (const d of w.gebouwenOpKaart) {
      const g = T.GEBOUWEN[d.soort];
      if (!g) {
        console.warn(`T.zetBestaandeGebouwen: onbekende soort "${d.soort}" op (${d.x}, ${d.y}), overgeslagen`);
        continue;
      }
      // Zijn voet uit het betekenisbestand: die heeft de inner nodig om te weten wat hij ziet (js/inner.js).
      // En wie er woont (`huis`, de boer met dezelfde id of de schout): dat telt voor zijn kelder
      // (js/verstoppen.js).
      S.gebouwen.push({ soort: d.soort, x: d.x, y: d.y, voet: { b: d.b || 1, h: d.h || 1 }, klaar: true, klaarOp: 0, handen: 0, voorwerp: null, huis: d.huis || null });
      woonruimte += g.woonruimte || 0;
    }
    // Ze staan er al vol: de boeren die je ziet lopen, wonen al in hun huis. Wie dat zijn, zet
    // T.zetBeginBewoners (js/bewoners.js) straks, als de boeren hun karakter hebben.
    T.wijzigBevolking(S, woonruimte, 'begin');
    S.woonruimte = woonruimte;
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(S);
  };

  // Het getal in de balk veranderen: de enige manier, zoals T.wijzigVoorraad voor de voorraad. Het
  // zakt nooit onder nul. De bewoners gaan mee (T.bewonersVolgen, js/bewoners.js): een nieuw gezin
  // in een huis met plaats, of wie sterft of wegtrekt. `reden`: 'begin', 'groei', 'winter' of
  // 'vertrek'. Geeft terug hoeveel het echt veranderde.
  T.wijzigBevolking = function (S, verschil, reden) {
    const voor = S.bevolking || 0;
    S.bevolking = Math.max(0, voor + verschil);
    const echt = S.bevolking - voor;
    if (echt && T.bewonersVolgen) T.bewonersVolgen(S, echt, reden);
    return echt;
  };

  // De handen verdelen over de werkplaatsen, op volgorde van S.gebouwen: eerst de gebouwen die er al
  // stonden, dan wie het eerst gebouwd is ("op volgorde", ontwerp/werklijst.md punt 2). Hoeveel
  // handen er zijn: wie kan werken (T.werkendeHanden, js/bewoners.js: geen kleuter, en de schout
  // niet), en zonder bewoners (een toets die alleen de regels laadt) het hele getal. Wíé er werkt,
  // zegt daarna T.wijsWerkToe.
  T.verdeelHanden = function (S) {
    let vrij = T.werkendeHanden ? T.werkendeHanden(S) : S.bevolking;
    for (const g of S.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort.handen) {
        g.handen = 0;
        continue;
      }
      g.handen = Math.min(soort.handen, vrij);
      vrij -= g.handen;
    }
    if (T.wijsWerkToe) T.wijsWerkToe(S);
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag: gebouwen die klaarkomen, woonruimte, eten, groei, handen en productie
  // ---------------------------------------------------------------------------------------------

  // Eén dag bijwerken. Losstaand van T.werkGebouwenBij hieronder (die roept dit per verstreken
  // dag aan) zodat hij ook in een toets in één keer op een vaste dag te proberen is.
  T.tikGebouwenDag = function (S, dag) {
    const IN = T.GEBOUWEN_INSTELLINGEN;
    // 0. De akkers (js/akkers.js): zaaien op 1 lentemaand, en het vangnet na de oogsttijd. Als
    // eerste: de boeren zaaien 's morgens, en daarna eet het dorp van wat er over is.
    if (T.tikAkkersDag) T.tikAkkersDag(S, dag);
    // Het vee (js/vee.js): jongen op 1 grasmaand, en de melk van vandaag. Ná de akkers, want op 1
    // lentemaand verhuist het vee daar naar zijn nieuwe weide; vóór de behoeften, want het dorp eet
    // de melk van vandaag als eerste (stap 3), en de tevredenheid moet hem dus al zien.
    if (T.tikVeeDag) T.tikVeeDag(S, dag);
    // Behoeften: eten, brandhout en een kerk, en de tevredenheid die daaruit volgt
    // (js/behoeften.js, T.tikBehoeftenDag) — vóór de rest, zodat stap 4 en 6 hieronder de
    // tevredenheid van vandaag gebruiken. Zacht gekoppeld (net als T.ui hieronder): zonder
    // js/behoeften.js geladen (bijvoorbeeld in een toets die alleen gebouwen.js laadt) blijft
    // alles zoals het was.
    if (T.tikBehoeftenDag) T.tikBehoeftenDag(S, dag);
    // En de marskramer (js/handel.js): komt hij vandaag, of is zijn tijd om? Zelfde zachte koppeling.
    if (T.tikHandelDag) T.tikHandelDag(S, dag);
    // En de heer (js/heer.js): zijn brief in wijnmaand, hijzelf op Sint-Maarten, en de soldaten.
    if (T.tikHeerDag) T.tikHeerDag(S, dag);
    // En de inner (js/inner.js): hij komt in oogstmaand tellen, en soms onverwacht terug.
    if (T.tikInnerDag) T.tikInnerDag(S, dag);
    // 1. Gebouwen die vandaag klaarkomen: het spookbeeld wordt de tekening zelf (dezelfde
    // voorwerp-ingang, zie zetGebouwVoorwerp hierboven — er komt er geen tweede bij).
    for (const g of S.gebouwen) {
      if (!g.klaar && dag >= g.klaarOp) {
        g.klaar = true;
        if (g.voorwerp) g.voorwerp.inAanbouw = false;
      }
    }
    // 2. Woonruimte: de som van wat elk klaar gebouw geeft.
    let woonruimte = 0;
    for (const g of S.gebouwen) if (g.klaar) woonruimte += T.GEBOUWEN[g.soort].woonruimte || 0;
    S.woonruimte = woonruimte;
    // 3. Eten: iedereen eet, of er genoeg is of niet (T.wijzigVoorraad zakt nooit onder nul — een
    // dorp dat te veel monden telt, eet zijn voorraad dus leeg; wat honger doet, staat in
    // js/behoeften.js). Eerst de melk van vandaag, dan graan, dan kaas, en wat er van de melk over
    // is, wordt kaas (T.eetVandaag, js/behoeften.js). Zonder dat bestand alleen graan, zoals vroeger.
    if (T.eetVandaag) T.eetVandaag(S);
    else if (S.bevolking > 0) T.wijzigVoorraad(S, 'graan', -S.bevolking * IN.etenPerMensPerDag);
    // 4. Groei: om de gezinDagen dagen komt er een gezin bij, als er nog ruimte is, de voorraad
    // een buffer overhoudt (zodat een net geboren gezin niet meteen honger lijdt), en het dorp
    // tevreden genoeg is (js/behoeften.js, T.BEHOEFTEN_INSTELLINGEN.groeiDrempel). Zonder
    // S.behoeften (behoeften.js niet geladen, of nog geen dag getikt) blokkeert dat laatste
    // niets — zie de opmerking bij stap 0 hierboven.
    const tevredenGenoeg = !S.behoeften || S.behoeften.tevredenheid >= T.BEHOEFTEN_INSTELLINGEN.groeiDrempel;
    if (dag > 0 && dag % IN.gezinDagen === 0 && S.bevolking < woonruimte && S.voorraad.graan >= IN.graanBufferVoorGroei && tevredenGenoeg) {
      T.wijzigBevolking(S, Math.min(woonruimte, S.bevolking + IN.gezinGrootte) - S.bevolking, 'groei');
    }
    // 5. Handen: verdeeld over de werkplaatsen, en wie waar werkt (T.verdeelHanden hierboven).
    T.verdeelHanden(S);
    // 6. Productie: wat een gebouw maakt, gaat per dag naar de voorraad — naar rato van hoe bezet
    // hij is (de helft van zijn handen geeft de helft van zijn opbrengst), en van de tevredenheid
    // (js/behoeften.js: "hoe hard er gewerkt wordt"; T.BEHOEFTEN_INSTELLINGEN.werkBasis is de
    // ondergrens bij 0% tevreden, 1 is geen effect). Zelfde zachte koppeling als hierboven.
    const werkFactor = S.behoeften
      ? T.BEHOEFTEN_INSTELLINGEN.werkBasis + (1 - T.BEHOEFTEN_INSTELLINGEN.werkBasis) * S.behoeften.tevredenheid
      : 1;
    // Gereedschap: wie iets maakt en er gereedschap voor heeft, werkt harder (alleen wie handen
    // heeft: een kippenhok werkt niet harder met een hamer), en het slijt (hieronder, na het werk).
    // Wie in dit seizoen stilligt (T.GEBOUWEN[x].stilIn: de visser als de beek dichtligt), maakt
    // vandaag niets; de eerste dag dat het zo is, zegt het dorp het.
    const seizoen = seizoenVan(dag);
    const gereedschap = T.gereedschapDekking(S, seizoen);
    for (const g of S.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      const wasStil = g.stilWant;
      g.tekort = null;
      g.werkte = 0;
      g.stilWant = null;
      if (!g.klaar || !soort.maakt) continue;
      const stil = soort.stilIn && seizoen && soort.stilIn[seizoen];
      if (stil) {
        g.stilWant = stil;
        if (!wasStil && T.ui && T.ui.bericht) T.ui.bericht(`${T.hoofdletter(soort.naam)} staat stil: ${stil}.`);
        continue;
      }
      let factor = soort.handen > 0 ? (g.handen / soort.handen) * werkFactor * gereedschap.factor : werkFactor;
      if (factor <= 0) continue;
      // Wat hij nodig heeft, bepaalt hoeveel hij kan: een smidse zonder ijzer staat stil, met ijzer
      // voor een halve dag werkt hij een halve dag. Tot 24 sep maakte hij toch gereedschap, uit
      // niets, en maalde een molen zonder graan toch meel (spel.md, "Handel").
      if (soort.maakt.in) {
        for (const wat in soort.maakt.in) {
          const kan = (S.voorraad[wat] || 0) / soort.maakt.in[wat];
          if (kan < factor) {
            factor = kan;
            g.tekort = wat;
          }
        }
      }
      g.werkte = factor;
      if (factor <= 0) continue;
      if (soort.maakt.in) for (const wat in soort.maakt.in) T.wijzigVoorraad(S, wat, -soort.maakt.in[wat] * factor);
      if (soort.maakt.uit) for (const wat in soort.maakt.uit) T.wijzigVoorraad(S, wat, soort.maakt.uit[wat] * factor);
    }
    // Wat in gebruik was, slijt: één stuk per hand die vandaag echt iets maakte (een smidse zonder
    // ijzer slijt zijn hamers niet).
    let aanHetWerk = 0;
    for (const g of S.gebouwen) if (g.werkte > 0 && g.handen > 0) aanHetWerk += g.handen;
    const slijt = Math.min(S.voorraad.gereedschap || 0, aanHetWerk) / IN.gereedschapSlijtDagen;
    if (slijt > 0) T.wijzigVoorraad(S, 'gereedschap', -slijt);
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(S);
  };

  // Wordt elk beeld aangeroepen (js/main.js, werkBij, net als T.tikKalender) en merkt zelf wanneer
  // er een hele dag voorbij is — op de eigen kalenderklok, dus dit loopt vanzelf mee met pauze en
  // met 1×/2×/3× (js/tijd.js). Kan er meer dan één dag in één stap voorbij zijn (een grote dt),
  // dan komt elke dag apart aan de beurt, zodat groei en verbruik niet worden overgeslagen.
  T.werkGebouwenBij = function (S) {
    if (!S.kalender || !S.gebouwen) return;
    const dagNu = Math.floor(S.kalender.dag);
    if (S.gebouwenDag == null) {
      S.gebouwenDag = dagNu; // eerste keer: alleen onthouden waar we beginnen
      return;
    }
    while (S.gebouwenDag < dagNu) {
      S.gebouwenDag++;
      T.tikGebouwenDag(S, S.gebouwenDag);
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
