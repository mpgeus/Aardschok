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
//     bouwtijd:    12,               // dagen tot hij klaar is, met een volle ploeg bouwers
//                                    // (js/bouwen.js: minder bouwers is trager, en in de vorst
//                                    // ligt het stil)
//     bouwers:     3,                // (mag ontbreken) hoe groot die ploeg is; anders naar zijn
//                                    // voet (T.ploegVan, js/bouwen.js)
//     handen:      0,                // hoeveel mensen hij als werkplaats vraagt
//     woonruimte:  5,                // hoeveel mensen erbij kunnen als hij klaar is
//     wordt:       'huis',           // waar hij in doorgroeit als zijn bewoners lang genoeg
//                                    // tevreden zijn (js/behoeften.js, T.tikBehoeftenDag); alleen
//                                    // bij een huis dat de speler zelf neerzette. Ontbreekt hij,
//                                    // dan groeit deze soort niet door.
//     maakt:       null,             // of { in: {hout: 1}, uit: {planken: 1} }: per dag, op volle
//                                    // bezetting (T.tikGebouwenDag schaalt mee met hoe bezet hij is
//                                    // én, sinds js/behoeften.js, met de tevredenheid)
//     verdacht:    false,            // moet de heer dit niet zien? (wapenmaker, schuttershof, …)
//     kerk:        false,            // telt als "een kerk" voor de behoeften (js/behoeften.js:
//                                    // T.heeftKerk) — nu alleen de kapel, later ook de kerk zelf
//     menu:        true,             // false: niet via het bouwmenu (akker, stadsmuur, palissade —
//                                    // die hebben een eigen manier van neerzetten, geen enkele voet)
//     tekening:    'gebouwen/dorpshuis1',  // "vel/naam" uit tegels/, zoals T.laadKaart "tegel" leest
//                                    // (js/kaart.js). null: (nog) geen tekening, zie "opmerking".
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
  };

  T.GEBOUWEN = {
    // ── Gehucht ──
    hut: {
      naam: 'hut', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 8 }, bouwtijd: 6,
      handen: 0, woonruimte: 3, wordt: 'huis', maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein2', beschrijving: 'ruimte voor een gezin; goedkoop, en arm om te zien',
      opmerking: 'nieuw (plaggenhut): nog niet getekend, leent voorlopig het kleinste bestaande huis.',
    },
    huis: {
      naam: 'huis', trede: 'gehucht', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 4 }, bouwtijd: 12,
      handen: 0, woonruimte: 5, wordt: 'stenenHuis', maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpshuis1', beschrijving: 'ruimte voor meer mensen', opmerking: '',
    },
    boerderij: {
      naam: 'boerderij', trede: 'gehucht', voet: { b: 7, h: 8 }, kosten: { hout: 20, goud: 6 }, bouwtijd: 15,
      handen: 2, woonruimte: 4, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuur', beschrijving: 'boeren voor de akkers, en een schuur voor de oogst',
      opmerking: 'Maakt zelf geen graan: dat komt binnen als de boeren een akkertegel maaien '
        + '(T.GRAAN_PER_TEGEL in js/akkers.js). Eerst stond hier een abstracte opbrengst, en dan '
        + 'telde het dubbel.',
    },
    akker: {
      naam: 'akker', trede: 'gehucht', voet: null, kosten: { hout: 2 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: false,
      tekening: null, beschrijving: 'graan (rogge, gerst)',
      opmerking: 'Geen los blokje maar een hele strook; gaat niet via het bouwmenu. Zie "akker" in '
        + 'js/kaart.js en gereedschap/tiled/maak-gehucht.cjs. Het graan zelf: gereedschap/pixelart/graan.cjs.',
    },
    houthakker: {
      naam: 'houthakker', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 4 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: { uit: { hout: 2 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'hout uit het bos van de heer', opmerking: '',
    },
    schaapskooi: {
      naam: 'schaapskooi', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 10 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: { uit: { wol: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'wol, van schapen op de meent',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur.',
    },
    kippenhok: {
      naam: 'kippenhok', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 4 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: { uit: { eieren: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/kippenhok', beschrijving: 'eieren, en de pachthoenders voor de heer',
      opmerking: '',
    },
    moestuin: {
      naam: 'moestuin', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 2 }, bouwtijd: 3,
      handen: 0, woonruimte: 0, maakt: { uit: { groente: 1 } }, verdacht: false, menu: true,
      tekening: 'erf/moestuin', beschrijving: 'groente bij het huis', opmerking: '',
    },
    put: {
      naam: 'put', trede: 'gehucht', voet: { b: 1, h: 1 }, kosten: { hout: 6, goud: 2 }, bouwtijd: 6,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'erf/put', beschrijving: 'water; zonder put wordt het dorp ziek',
      opmerking: 'Het effect ("zonder put wordt het dorp ziek") is nog geen regel, alleen de tekening staat er al.',
    },
    verstopplek: {
      naam: 'verstopplek', trede: 'gehucht', voet: { b: 2, h: 2 }, kosten: { hout: 6 }, bouwtijd: 6,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: null, beschrijving: 'een kelder of kuil die de inner niet ziet',
      opmerking: 'Bewust zonder tekening: een verstopplek die je wél ziet staan is geen verstopplek. '
        + 'Hij blokkeert zijn voet en telt mee, maar tekent nu nog niets (js/tekenen.js).',
    },

    // ── Grondstoffen halen (Marcel, 23 sep: "houthakkers, steengroeve etc moeten we ook hebben";
    //    spel.md, "Grondstoffen halen"). De houthakker staat hierboven al. ──
    steengroeve: {
      naam: 'steengroeve', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 4 }, bouwtijd: 9,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'steen voor funderingen en stenen huizen',
      opmerking: 'nieuw: nog niet getekend (een groeve is een kuil met een kraan, geen huis), leent voorlopig de houtschuur.',
    },
    kleiput: {
      naam: 'kleiput', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, bouwtijd: 6,
      handen: 1, woonruimte: 0, maakt: { uit: { klei: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'klei voor de steenbakkerij: bakstenen, zo bouwde men hier echt',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    rietsnijder: {
      naam: 'rietsnijder', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, bouwtijd: 6,
      handen: 1, woonruimte: 0, maakt: { uit: { riet: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'riet uit de beek en het moeras, voor rieten daken',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.',
    },
    jager: {
      naam: 'jager', trede: 'gehucht', voet: { b: 4, h: 4 }, kosten: { hout: 8 }, bouwtijd: 6,
      handen: 1, woonruimte: 0, maakt: { uit: { vlees: 1, huiden: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/jagershut', beschrijving: 'wild uit het bos, en huiden voor de looier',
      opmerking: 'Het bos is van de heer: stropen is ook een keuze.',
    },
    visser: {
      naam: 'visser', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 6 }, bouwtijd: 6,
      handen: 1, woonruimte: 0, maakt: { uit: { vis: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'vis uit de beek',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje. Hoort aan het water.',
    },
    wachthuis: {
      naam: 'wachthuis', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: { hout: 10, goud: 4 }, bouwtijd: 9,
      handen: 2, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: 'rakkers en de nachtwacht: orde houden, dieven pakken, keuren handhaven, of wegkijken',
      opmerking: 'nieuw (Marcel, 23 sep: "orde bewaarders, leger etc moeten een optie zijn"): nog niet getekend, '
        + 'leent voorlopig een klein dorpshuis. De heer vindt het goed; voor wie de rakkers echt werken, is de vraag.',
    },

    // ── Dorp ──
    smidse: {
      naam: 'smidse', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 10 }, bouwtijd: 12,
      handen: 2, woonruimte: 0, maakt: { in: { ijzer: 1 }, uit: { gereedschap: 1 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/smidse', beschrijving: 'ijzer tot gereedschap; betere werktuigen, sneller werk',
      opmerking: 'Niets levert nu nog ijzer; de ketting begint pas te lopen zodra dat er is.',
    },
    timmerman: {
      naam: 'timmerman', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 6 }, bouwtijd: 9,
      handen: 2, woonruimte: 0, maakt: { in: { hout: 2 }, uit: { planken: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpshuis3', beschrijving: 'hout tot planken en balken, nodig om te bouwen',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een dorpshuis.',
    },
    molen: {
      naam: 'molen', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 18, goud: 10 }, bouwtijd: 15,
      handen: 1, woonruimte: 0, maakt: { in: { graan: 3 }, uit: { meel: 3 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/watermolen', beschrijving: 'graan tot meel. De heer wil dat je bij zíjn molen maalt en betaalt (het banrecht); een eigen molen is verzet',
      opmerking: 'Het banrecht zelf (de heer die erop heft) is nog geen regel.',
    },
    bakkerij: {
      naam: 'bakkerij', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 8 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: { in: { meel: 2 }, uit: { brood: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/bakkerij', beschrijving: 'meel tot brood', opmerking: '',
    },
    brouwerij: {
      naam: 'brouwerij', trede: 'dorp', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 10 }, bouwtijd: 12,
      handen: 2, woonruimte: 0, maakt: { in: { graan: 2 }, uit: { bier: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpshuis5', beschrijving: 'gerst tot bier; de heer heft er belasting op',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een dorpshuis. De belasting is nog geen regel.',
    },
    herberg: {
      naam: 'herberg', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 12 }, bouwtijd: 12,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/herberg', beschrijving: 'reizigers, nieuws en verhalen, bier',
      opmerking: 'Zijn waarde is verhaal, geen grondstof; dat komt met het avontuur (werklijst.md, punt 8).',
    },
    kapel: {
      naam: 'kapel', trede: 'gehucht', voet: { b: 5, h: 5 }, kosten: { hout: 10, goud: 8 }, bouwtijd: 12,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, kerk: true, menu: true,
      tekening: 'gebouwen/kapel', beschrijving: 'de kerk als groep, en tevredenheid',
      opmerking: 'De tevredenheid (T.heeftKerk, js/behoeften.js, werklijst.md punt 3) is er; de kerk '
        + 'als groep met eigen belangen komt pas met de politiek (werklijst.md, punt 9). Zijn trede '
        + 'is "gehucht" (was "dorp"): het gehucht vraagt om een kerk (js/behoeften.js), dus moet hij daar '
        + 'ook te bouwen zijn; een gehucht had vaak een kapelletje. Een grotere kerk komt later.',
    },
    tiendschuur: {
      naam: 'tiendschuur', trede: 'dorp', voet: { b: 6, h: 5 }, kosten: { hout: 14, goud: 6 }, bouwtijd: 9,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'van de heer: hier lever je op Sint-Maarten, en hier zit de inner',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. Sint-Maarten zelf staat '
        + 'al in T.SINT_MAARTEN (js/tijd.js); wat er dan gebeurt is het tweede proefje (werklijst.md, punt 3).',
    },

    // ── Marktrecht ──
    markt: {
      naam: 'markt', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 16, goud: 14 }, bouwtijd: 12,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'handel met buiten; handelaars komen',
      opmerking: 'nieuw in gebouwen.tsx (de kraam bestaat als model in gereedschap/pixelart/dorp.cjs, '
        + 'nog niet geëxporteerd); leent voorlopig een groot dorpshuis.',
    },
    weverij: {
      naam: 'weverij', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 14, goud: 12 }, bouwtijd: 12,
      handen: 2, woonruimte: 0, maakt: { in: { wol: 2 }, uit: { laken: 2 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpGroot2', beschrijving: 'wol tot laken, het rijkste handelsgoed',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis.',
    },
    pakhuis: {
      naam: 'pakhuis', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 18, goud: 10 }, bouwtijd: 9,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/schuurBlokhut', beschrijving: 'opslag, en een goede plek om iets tussen te schuiven',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de blokhutschuur. "Iets tussenschuiven" '
        + '(voor de heer verbergen) is nog geen regel.',
    },
    kuiper: {
      naam: 'kuiper', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 8 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { vaten: 1 } }, verdacht: false,
      menu: true, tekening: 'gebouwen/dorpKlein1', beschrijving: 'vaten voor bier en opslag',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis.',
    },
    slager: {
      naam: 'slager', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 8 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein2', beschrijving: 'vlees, van het vee',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Niets levert nu nog vee aan.',
    },
    leerlooier: {
      naam: 'leerlooier', trede: 'marktrecht', voet: { b: 4, h: 4 }, kosten: { hout: 10, goud: 6 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein3', beschrijving: 'leer — hij stinkt, dus hoort hij aan de rand',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. "Aan de rand" is nu '
        + 'nog een advies, geen regel die het bouwmenu afdwingt.',
    },
    steenbakkerij: {
      naam: 'steenbakkerij', trede: 'marktrecht', voet: { b: 6, h: 6 }, kosten: { hout: 20, goud: 16 }, bouwtijd: 15,
      handen: 2, woonruimte: 0, maakt: { uit: { steen: 2 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'stenen voor stenen huizen, die rijk ogen',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. "steen" is de eerste '
        + 'grondstof naast T.GRONDSTOFFEN; die vier blijven voorlopig het enige dat de voorraadbalk toont.',
    },
    badhuis: {
      naam: 'badhuis', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 14 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: 'gezondheid', opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.',
    },
    gasthuis: {
      naam: 'gasthuis', trede: 'marktrecht', voet: { b: 5, h: 5 }, kosten: { hout: 12, goud: 12 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/oudstehuis', beschrijving: 'armenzorg', opmerking: 'nieuw: nog niet getekend, leent voorlopig het huis van de dorpsoudste.',
    },

    // ── Stad ──
    stenenHuis: {
      naam: 'stenen huis', trede: 'stad', voet: { b: 6, h: 8 }, kosten: { hout: 20, goud: 30 }, bouwtijd: 18,
      handen: 0, woonruimte: 8, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/stenenHuis', beschrijving: 'veel ruimte, en rijk om te zien', opmerking: '',
    },
    raadhuis: {
      naam: 'raadhuis', trede: 'stad', voet: { b: 8, h: 6 }, kosten: { hout: 24, goud: 40 }, bouwtijd: 24,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'waar de schepenen stemmen; de schout wordt burgemeester',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis. De schepenen zelf komen met de politiek (werklijst.md, punt 6).',
    },
    stadsmuur: {
      naam: 'stadsmuur en poort', trede: 'stad', voet: null, kosten: { hout: 60, goud: 80 }, bouwtijd: 60,
      handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: false,
      tekening: null, beschrijving: 'pas mag het met stadsrechten; zonder is het opstand',
      opmerking: 'Een muur is geen los blokje van één voet; die komt met het geschilderde-omheiningen-'
        + 'systeem (werklijst.md, "Omheiningen die je schildert"), niet via dit bouwmenu.',
    },

    // ── Verdacht: wat de heer niet mag zien ──
    wapenmaker: {
      naam: 'wapenmaker', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 12, goud: 14 }, bouwtijd: 12,
      handen: 2, woonruimte: 0, maakt: { in: { hout: 1, ijzer: 1 }, uit: { wapens: 1 } }, verdacht: true,
      menu: true, tekening: 'gebouwen/smidse', beschrijving: 'ijzer en hout tot wapens, voor de opstand. Verboden, dus verstopt: achter de smidse, of \'s nachts',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het vel van de smidse — toepasselijk, want hij hoort er toch achter.',
    },
    schuttershof: {
      naam: 'schuttershof', trede: 'dorp', voet: { b: 6, h: 6 }, kosten: { hout: 10, goud: 10 }, bouwtijd: 9,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/dorpKlein1', beschrijving: 'mannen oefenen; als de inner het ziet, heet het een feest',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis.',
    },
    palissade: {
      naam: 'palissade', trede: 'dorp', voet: null, kosten: { hout: 40 }, bouwtijd: 30,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: false,
      tekening: null, beschrijving: 'een muur zonder stadsrechten is een opstand die je aankondigt',
      opmerking: 'Zelfde reden als stadsmuur hierboven: geen los blokje, gaat niet via dit bouwmenu.',
    },
    tuighuis: {
      naam: 'tuighuis', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 14, goud: 10 }, bouwtijd: 12,
      handen: 0, woonruimte: 0, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/schuur', beschrijving: 'waar de wapens liggen; wie een tuighuis heeft, heeft een leger',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de schuur. Bergt wat de wapenmaker maakt.',
    },
    kazerne: {
      naam: 'kazerne', trede: 'stad', voet: { b: 6, h: 6 }, kosten: { hout: 30, steen: 30, goud: 30 }, bouwtijd: 24,
      handen: 0, woonruimte: 6, maakt: null, verdacht: true, menu: true,
      tekening: 'gebouwen/dorpGroot1', beschrijving: 'huurlingen: duur, en een leger is een opstand',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een groot dorpshuis. Verdacht tot de stad vrij is.',
    },

    // ── Grondstoffen en orde die pas bij het dorp komen ──
    turfsteker: {
      naam: 'turfsteker', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 8 }, bouwtijd: 6,
      handen: 2, woonruimte: 0, maakt: { uit: { turf: 2 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'turf uit het veen, om te stoken als het bos op is',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    ertsgraver: {
      naam: 'ertsgraver', trede: 'dorp', voet: { b: 4, h: 4 }, kosten: { hout: 14, goud: 8 }, bouwtijd: 12,
      handen: 2, woonruimte: 0, maakt: { uit: { ijzer: 1 } }, verdacht: false, menu: true,
      tekening: 'gebouwen/houtschuur', beschrijving: 'moerasijzer uit de grond, zoals op de Veluwe: ijzer zonder de marskramer',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig de houtschuur. IJzer wordt ook wapens; dat ziet de inner graag van dichtbij.',
    },
    kalkbrander: {
      naam: 'kalkbrander', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 10, steen: 4 }, bouwtijd: 9,
      handen: 1, woonruimte: 0, maakt: { in: { hout: 1 }, uit: { kalk: 1 } }, verdacht: false, menu: true,
      tekening: 'erf/schuurtje', beschrijving: 'kalk uit schelpen, voor metselspecie',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig het schuurtje.',
    },
    gevang: {
      naam: 'gevang', trede: 'dorp', voet: { b: 3, h: 3 }, kosten: { hout: 8, steen: 10, goud: 6 }, bouwtijd: 12,
      handen: 1, woonruimte: 0, maakt: null, verdacht: false, menu: true,
      tekening: 'gebouwen/dorpKlein1', beschrijving: 'wie de schout veroordeelt, zit hier',
      opmerking: 'nieuw: nog niet getekend, leent voorlopig een klein dorpshuis. Hoort bij de rechtspraak (werklijst 10).',
    },
  };

  // De echte maat van een soort: liever de "beslaat" van zijn eigen tekening (T.opzoekTegelNaam,
  // js/kaart.js — precies zo vast als de tegel zelf zegt, net als bij een gebouw dat Marcel in
  // Tiled neerzet) dan de geschatte T.GEBOUWEN[soort].voet hierboven. Geeft null als er geen van
  // beide is (akker, stadsmuur, palissade — die gaan sowieso niet via T.plaatsGebouw).
  T.gebouwVoet = function (soort) {
    const g = T.GEBOUWEN[soort];
    if (!g) return null;
    if (g.tekening && T.opzoekTegelNaam) {
      const opz = T.opzoekTegelNaam(g.tekening);
      if (opz && opz.eig && opz.eig.beslaat) return { b: opz.eig.beslaat[0], h: opz.eig.beslaat[1] };
    }
    return g.voet;
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

  // ---------------------------------------------------------------------------------------------
  // Neerzetten: past het, en dan echt neerzetten (bouwmenu, T.plaatsGebouw hieronder) — en de
  // gebouwen die al op de kaart staan (js/gebied.js, T.zetBestaandeGebouwen)
  // ---------------------------------------------------------------------------------------------

  // Past soort op (x, y) (de linkerbovenhoek van zijn voet, net als "beslaat" bij een gewoon
  // voorwerp)? Binnen de kaart, en nergens al vast — dat dekt zowel de rand van de wereld als een
  // ander gebouw, een boom, of muur (T.isVast, js/wereld.js).
  T.gebouwPast = function (S, soort, x, y) {
    const voet = T.gebouwVoet(soort);
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

  // Het voorwerp in S.wereld zetten (zo tekent js/tekenen.js hem mee, op precies dezelfde manier
  // als een gebouw dat in Tiled staat, CLAUDE.md "Testen in de browser": "via de gewone weg
  // waarop het spel gebouwen tekent") en zijn voet vast maken. Nog in aanbouw? Dan staat hij er al
  // (`inAanbouw: true` — js/tekenen.js toont de bouwfase die bij zijn voortgang hoort, zie
  // T.bouwFaseIndex in js/bouwen.js en T.sprites.bouwfase in js/sprites.js, of dimt hem als het
  // gebouw geen fases heeft), zodat de speler ziet waar hij bezig is; T.tikBouwDag (js/bouwen.js)
  // zet dat om zodra hij af is, op hetzelfde voorwerp, dus zonder dat er ooit een tweede bij komt.
  function zetGebouwVoorwerp(S, instantie) {
    const g = T.GEBOUWEN[instantie.soort];
    const w = S.wereld;
    const opz = g.tekening && T.opzoekTegelNaam ? T.opzoekTegelNaam(g.tekening) : null;
    const voet = T.gebouwVoet(instantie.soort) || { b: 1, h: 1 };
    const naam = 'gebouw:' + instantie.soort;
    T.registreerGebouwSoort(naam);
    const v = {
      soort: naam, x: instantie.x, y: instantie.y,
      vel: opz ? opz.vel : null, id: opz ? opz.id : null,
      beslaat: [voet.b, voet.h], inAanbouw: !instantie.klaar,
      // Voor de bouwfase (T.bouwFaseIndex + T.sprites.bouwfase): de kale tekeningnaam
      // ("dorpKlein2", niet "gebouwen/dorpKlein2" — dezelfde sleutel als in
      // tegels/bouwfasen.json), en hoe ver hij is (0..1, T.tikBouwDag houdt het bij). Zonder
      // tekening (g.tekening null) blijft tekeningNaam ook null: gewoon geen fases.
      tekeningNaam: g.tekening ? g.tekening.split('/').pop() : null,
      voortgang: instantie.voortgang,
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
  // aanbouw: vanaf morgen bouwt er een ploeg aan (T.tikBouwDag, js/bouwen.js). Geeft altijd
  // { gelukt, reden } terug (reden alleen als het niet lukte), zodat de aanroeper kan zeggen
  // waarom een klik niets deed — dezelfde vorm als handelingVerkennen/handelingGevecht
  // (CLAUDE.md, "Scherm en klik stellen dezelfde vraag").
  T.plaatsGebouw = function (S, soort, x, y) {
    const g = T.GEBOUWEN[soort];
    if (!g || g.menu === false) return { gelukt: false, reden: 'Dat kan niet via het bouwmenu.' };
    if (!T.gebouwPast(S, soort, x, y)) return { gelukt: false, reden: 'Daar past het niet.' };
    if (!T.kanBetalen(S, g.kosten)) return { gelukt: false, reden: 'Daar is de voorraad niet groot genoeg voor.' };
    T.betaalKosten(S, g.kosten);
    // `voortgang` (0..1) en `bouwers` houdt T.tikBouwDag bij (js/bouwen.js): een gebouw is af als
    // het werk gedaan is, niet als er zoveel dagen voorbij zijn.
    const klaar = !(g.bouwtijd > 0);
    const instantie = { soort, x, y, klaar, voortgang: klaar ? 1 : 0, bouwers: 0, handen: 0, voorwerp: null };
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
      S.gebouwen.push({ soort: d.soort, x: d.x, y: d.y, klaar: true, voortgang: 1, bouwers: 0, handen: 0, voorwerp: null });
      woonruimte += g.woonruimte || 0;
    }
    // Ze staan er al vol: de boeren die je ziet lopen, wonen al in hun huis.
    S.bevolking += woonruimte;
    S.woonruimte = woonruimte;
    if (T.ui && T.ui.toonBevolking) T.ui.toonBevolking(S);
  };

  // ---------------------------------------------------------------------------------------------
  // Elke dag: bouwen, woonruimte, eten, groei, handen, productie, handel, de inner en de heer
  // ---------------------------------------------------------------------------------------------

  // Hoe hard er vandaag gewerkt wordt, van werkBasis (0% tevreden) tot 1 (helemaal tevreden):
  // js/behoeften.js, "tevredenheid bepaalt hoe hard ze werken". Voor de werkplaatsen hieronder
  // (stap 6) en voor de bouwers (js/bouwen.js). Zonder S.behoeften (behoeften.js niet geladen, of
  // nog geen dag getikt) werkt iedereen gewoon op volle kracht.
  T.werkFactor = function (S) {
    if (!S.behoeften || !T.BEHOEFTEN_INSTELLINGEN) return 1;
    const basis = T.BEHOEFTEN_INSTELLINGEN.werkBasis;
    return basis + (1 - basis) * S.behoeften.tevredenheid;
  };

  // Eén dag bijwerken. Losstaand van T.werkGebouwenBij hieronder (die roept dit per verstreken
  // dag aan) zodat hij ook in een toets in één keer op een vaste dag te proberen is.
  T.tikGebouwenDag = function (S, dag) {
    const IN = T.GEBOUWEN_INSTELLINGEN;
    // 0. Behoeften: eten, brandhout en een kerk, en de tevredenheid die daaruit volgt
    // (js/behoeften.js, T.tikBehoeftenDag) — vóór de rest, zodat stap 4 en 6 hieronder de
    // tevredenheid van vandaag gebruiken. Zacht gekoppeld (net als T.ui hieronder): zonder
    // js/behoeften.js geladen (bijvoorbeeld in een toets die alleen gebouwen.js laadt) blijft
    // alles zoals het was.
    if (T.tikBehoeftenDag) T.tikBehoeftenDag(S, dag);
    // 1. Bouwen (js/bouwen.js, T.tikBouwDag): de bouwplaatsen krijgen hun ploeg uit de bevolking,
    // vóór de werkplaatsen in stap 5 (Marcel, 24 sep: wie bouwt, hakt geen hout), en wat vandaag
    // af komt, telt hieronder al mee. Zacht gekoppeld, net als stap 0: zonder js/bouwen.js wordt
    // er niets gebouwd.
    const bouwers = T.tikBouwDag ? T.tikBouwDag(S, dag, S.bevolking || 0) : 0;
    // 2. Woonruimte: de som van wat elk klaar gebouw geeft.
    let woonruimte = 0;
    for (const g of S.gebouwen) if (g.klaar) woonruimte += T.GEBOUWEN[g.soort].woonruimte || 0;
    S.woonruimte = woonruimte;
    // 3. Eten: iedereen eet graan, of er genoeg is of niet (T.wijzigVoorraad zakt nooit onder nul —
    // een dorp dat te veel monden telt, eet zijn voorraad dus leeg in plaats van dat er iemand
    // wegkwijnt; dat laatste is een vraag voor later, geen regel nu).
    if (S.bevolking > 0) T.wijzigVoorraad(S, 'graan', -S.bevolking * IN.etenPerMensPerDag);
    // 4. Groei: om de gezinDagen dagen komt er een gezin bij, als er nog ruimte is, de voorraad
    // een buffer overhoudt (zodat een net geboren gezin niet meteen honger lijdt), en het dorp
    // tevreden genoeg is (js/behoeften.js, T.BEHOEFTEN_INSTELLINGEN.groeiDrempel). Zonder
    // S.behoeften (behoeften.js niet geladen, of nog geen dag getikt) blokkeert dat laatste
    // niets — zie de opmerking bij stap 0 hierboven.
    const tevredenGenoeg = !S.behoeften || S.behoeften.tevredenheid >= T.BEHOEFTEN_INSTELLINGEN.groeiDrempel;
    if (dag > 0 && dag % IN.gezinDagen === 0 && S.bevolking < woonruimte && S.voorraad.graan >= IN.graanBufferVoorGroei && tevredenGenoeg) {
      S.bevolking = Math.min(woonruimte, S.bevolking + IN.gezinGrootte);
    }
    // 5. Handen: verdeeld over de werkplaatsen op volgorde van S.gebouwen (eerst de gebouwen die
    // er al stonden, dan wie het eerst gebouwd is — "op volgorde", ontwerp/werklijst.md punt 2),
    // met wie er over is nadat de bouwers in stap 1 hun ploeg kregen.
    let vrij = Math.max(0, (S.bevolking || 0) - bouwers);
    for (const g of S.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort.handen) {
        g.handen = 0;
        continue;
      }
      g.handen = Math.min(soort.handen, vrij);
      vrij -= g.handen;
    }
    // 6. Productie: wat een gebouw maakt, gaat per dag naar de voorraad — naar rato van hoe bezet
    // hij is (de helft van zijn handen geeft de helft van zijn opbrengst), en van de tevredenheid
    // (js/behoeften.js: "hoe hard er gewerkt wordt"; T.BEHOEFTEN_INSTELLINGEN.werkBasis is de
    // ondergrens bij 0% tevreden, 1 is geen effect). Zelfde zachte koppeling als hierboven.
    const werkFactor = T.werkFactor(S);
    for (const g of S.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !soort.maakt) continue;
      let factor = (soort.handen > 0 ? g.handen / soort.handen : 1) * werkFactor;
      if (factor <= 0) continue;
      // Wat er niet is, kan niet verwerkt worden: zonder ijzer maakt de smidse niets (werklijst,
      // punt 4; het ijzer komt van de marskramer, js/handel.js). Is er te weinig, dan werkt hij naar
      // rato van wat er wel is. Het bericht komt één keer, als het tekort begint.
      let deel = 1;
      let gebrek = null;
      for (const wat in soort.maakt.in || {}) {
        const nodig = soort.maakt.in[wat] * factor;
        const er = S.voorraad[wat] || 0;
        if (er < nodig && er / nodig < deel) {
          deel = er / nodig;
          gebrek = wat;
        }
      }
      if (gebrek && deel <= 0 && g.gebrek !== gebrek && T.ui && T.ui.bericht) {
        T.ui.bericht(`${T.hoofdletter(soort.naam)} staat stil: er is geen ${gebrek}.`, 'gevaar');
      }
      g.gebrek = deel <= 0 ? gebrek : null;
      factor *= deel;
      if (factor <= 0) continue;
      for (const wat in soort.maakt.in || {}) T.wijzigVoorraad(S, wat, -soort.maakt.in[wat] * factor);
      if (soort.maakt.uit) for (const wat in soort.maakt.uit) T.wijzigVoorraad(S, wat, soort.maakt.uit[wat] * factor);
    }
    // 7. Handel (js/handel.js): komt de marskramer vandaag, of trekt hij verder? Zacht gekoppeld.
    if (T.tikHandelDag) T.tikHandelDag(S, dag);
    // 8. De inner (js/inner.js): het rekenboek na de oogst, en zijn bezoek. Vóór de heer, want
    // wat de inner ziet, bepaalt zijn brief.
    if (T.tikInnerDag) T.tikInnerDag(S, dag);
    // 9. De heer (js/heer.js): de brief een maand vooraf, en Sint-Maarten. Na de productie van
    // vandaag, zodat wat er vandaag binnenkwam ook mee kan.
    if (T.tikHeerDag) T.tikHeerDag(S, dag);
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
})(globalThis.Toren = globalThis.Toren || {});
