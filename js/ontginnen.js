// Ontginnen: het land groeit mee (werklijst vraag 107; Marcel, 5 okt: "107 a b c d e ja", en voor het bos: "A a2, B ok,
// C ja, D ok, E ok, F Ja, G ok, H goed idee"). Komt het dorp graan tekort, dan vraagt een boer of zijn zoon je om land te
// ontginnen, dertig tegels: een stuk heide, een stuk bos, of allebei, en dan kies jij (a2). Ja: het wordt een veld van zijn
// boerderij, en zijn boeren zaaien en maaien het; geen nieuwe boerderij en geen nieuw gezin. Wat het kost, hangt af van
// waar, zodat elke keuze een van je twee bazen raakt (js/bazen.js):
//   - de heide is de meent, van iedereen: het vertrouwen van het dorp zakt, en bij elk volgend stuk meer, want hoe kleiner
//     de meent, hoe meer het dorp eraan hecht (vraag 107, f3). Een maand plaggen steken.
//   - het bos is van de heer. Je meldt het hem, dan zakt zijn gunst (hij wil erom gevraagd worden), en staat het in zijn
//     boeken, zoals elke akker. Stiekem ontginnen kan niet meer (11 okt, vraag 151: heel "arm lijken" ging eruit). Een
//     winter werk: boom voor boom omhakken (het hout gaat naar de schuur), de stobbe eruit, en omspitten.
// Hoe de boer het doet, staat in js/veldwerk.js: hij werkt er tegel voor tegel, en wat hij af heeft, is kale grond. In
// lentemaand wordt het gezaaid, met zaaigraan zoals elke akker (T.wisselVelden en T.zaaiAkkers, js/akkers.js). De schapen
// grazen niet op ontgonnen heide (js/vee.js).
//
// Het stuk bos is het dichtste bij zijn akker waar hij bij kan (T.bosPlekVoor).
//
// Het verzoek loopt zoals een bouwverzoek (js/verzoeken.js): wie het vraagt, zoekt je (het voorval 'ontginverzoek',
// js/voorvallen.js, met de woorden in js/gesprekken.js), de plekken liggen zolang in goud op de grond (js/tekenen.js), en
// ben je weg, dan beslist je raadsman (js/raadsman.js).
//   L.ontgin        op het voorval: { heide, bos (elk { x, y, b, h } of null; het bos ook met `bomen`), boer (het poppetje van de boer wiens veld het wordt), nut,
//                   vertrouwen (wat de heide kost), gunst (wat het bos kost als je het de heer meldt) }, uitgerekend als hij
//                   het vraagt, zodat het venster zegt wat je betaalt. Zolang het loopt, staan de vlaggen ontginHeide en
//                   ontginBos (L.vlaggen), zodat het gesprek alleen de antwoorden toont die kunnen.
//   veld.ontginning op een veld dat ontgonnen wordt: { tot (de dag dat het klaar is), op ('heide' of 'bos'), gestoken (Set
//                   "x,y": wat af is) }
//   veld.ontgonnen  'heide' of 'bos' op een veld dat ontgonnen werd, ook als het klaar is: zo telt het dorp de stukken
//   D.ontginnen     { gevraagd (de dag van het laatste verzoek), klaar (de dag dat het laatste stuk klaar was), gezocht (de
//                   dag dat er het laatst nergens een plek was) }
// Regels zonder scherm, met toetsen (test/ontginnen.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.ONTGINNEN_INSTELLINGEN = {
    // De spelregel "Ontginnen": aan of uit (dan blijft het land zoals het is, zoals tot 5 okt), en met het bos of alleen
    // de heide (zoals het eerst was, de eerste dag van het ontginnen).
    aan: true,
    bos: true,
    // Hoe groot een stuk is (dertig tegels, vraag 107, d), en hoe lang het duurt (c): de heide een maand plaggen steken,
    // het bos een winter. Wat de boer dan niet af heeft, doen zijn mensen.
    breed: 6,
    diep: 5,
    heideDagen: 30,
    bosDagen: 90,
    // Na een verzoek vraagt er pas na zoveel dagen weer iemand, wat je ook zei, en ook als je hem niet sprak (dan zou hij
    // elke dag terugkomen, zolang het graan tekortkomt); na een ja pas als het stuk klaar is, en dan nog zoveel dagen later.
    // Was er nergens een plek, dan kijkt het dorp ook pas na `opnieuw` dagen weer.
    opnieuw: 30,
    naKlaar: 30,
    // Wat de schapen op de meent minstens over moeten houden, bovenop wat ze nodig hebben, in tegels.
    schapenRuimte: 10,
    // Wat het verzoek de raadsman waard is, als tevredenheid (js/raadsman.js; zoals T.VERZOEKEN_INSTELLINGEN.nutTot). Hij
    // weegt het tegen wat het kost: het eerste stuk heide zegt hij ja, een volgend niet.
    nut: 6,
    // Wat een stuk heide het vertrouwen van het dorp kost, maal het hoeveelste stuk van de meent het is: het eerste 5, het
    // tweede 10, het derde 15. Hoe kleiner de meent, hoe meer het dorp eraan hecht (vraag 107, f3; Marcel, 5 okt: "We
    // gaan met jouw suggestie"). Zo wordt dezelfde vraag elke keer een zwaardere.
    vertrouwen: 5,
    // Het bos. Een stuk is bos als er minstens zoveel bomen op staan (ook een erf of een werkplaats in het bos van de heer,
    // js/bos.js). Wat een boom geeft, staat in T.BOS_INSTELLINGEN.houtPerBoom (js/bos.js).
    bosBomen: 10,
    // Wat het bos de gunst van de heer kost als je het hem meldt (vraag 107, b: hij wil erom gevraagd worden).
    gunst: 5,
  };
  const IN = () => T.ONTGINNEN_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const sleutel = (x, y) => x + ',' + y;
  const staatVan = (D) => D.ontginnen || (D.ontginnen = { gevraagd: null, klaar: null });
  const opStuk = (s, x, y) => x >= s.x && y >= s.y && x < s.x + s.b && y < s.y + s.h;

  // Komt het dorp graan tekort? Dezelfde vraag als de raad (js/raad.js, 'graan'): er komt geen gezin om het graan
  // (T.waaromGeenGezin, js/gebouwen.js), of het eten haalt de winter niet (T.watDeWinterNietHaalt, js/behoeften.js).
  T.graanTekort = (D) => T.waaromGeenGezin(D).includes('graan') || T.watDeWinterNietHaalt(D, dagNu(D)).includes('eten');

  // De velden die nu ontgonnen worden.
  T.inOntginning = (w) => ((w && w.akkers) || []).filter((v) => v.ontginning);

  // Hoeveel stukken er al van de meent af gingen (ook wat nu ontgonnen wordt).
  T.ontgonnenStukken = (w) => ((w && w.akkers) || []).filter((v) => v.ontgonnen === 'heide').length;

  // Wat het volgende stuk heide het vertrouwen van het dorp kost: vertrouwen maal het hoeveelste stuk het is. Zonder de
  // twee bazen (de spelregel, js/bazen.js) is er geen vertrouwen, en kost het niets.
  T.ontginVertrouwen = (D) => (T.bazenTellen(D) ? IN().vertrouwen * (T.ontgonnenStukken(D.wereld) + 1) : 0);

  // Hoe ver twee rechthoeken van tegels uit elkaar liggen: 1 als ze elkaar raken (ook met een hoek), 0 als ze overlappen.
  function afstandTussen(a, b) {
    const dx = Math.max(0, a.x - (b.x + b.b - 1), b.x - (a.x + a.b - 1));
    const dy = Math.max(0, a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1));
    return Math.max(dx, dy);
  }
  // Hoe ver een stuk van de velden van deze boer ligt.
  const vanZijnAkker = (boer, stuk) => Math.min(...boer.werkAkkers.map((v) => afstandTussen(stuk, v)));

  // ---------------------------------------------------------------------------------------------
  // De heide
  // ---------------------------------------------------------------------------------------------

  // Mag deze tegel ontgonnen worden? Heide van de meent, te belopen (geen boom, rots of gebouw), geen veld, weg, erf of
  // lantaarn (T.waaromNietOpDezeGrond, js/gebouwen.js), niet het plein, niet voor een deur, en geen paadje van een deur
  // ("op een pad komt hij niet", vraag 107, d; op het ontworpen gehucht loopt dat van de schaapskooi over de heide). Een
  // gesleten paadje mag wel: anders duwt het looppad van de boer zelf het volgende stuk weg.
  function magOntgonnen(D, m, x, y) {
    const w = D.wereld;
    if (x < m.x || y < m.y || x >= m.x + m.b || y >= m.y + m.h) return false;
    if (!T.isBegaanbaar(w, x, y) || T.bijDeur(w, x, y) || T.opHetPlein(w, x, y) || T.isAangelegdPaadje(D, x, y)) return false;
    return !T.waaromNietOpDezeGrond(D, x, y);
  }

  // Hoeveel tegels de meent nog heeft voor de schapen, als dit stuk eraf gaat (js/vee.js, T.weideStand): genoeg voor wie
  // er graast, met wat ruimte over?
  function schapenHoudenGenoeg(D, m, stuk) {
    const stand = T.weideStand(D, m);
    return stand.tegels - stuk.b * stuk.h >= stand.nodig + IN().schapenRuimte;
  }

  // Ligt dit stuk nog helemaal op vrije heide?
  function heideVrij(D, stuk) {
    return (D.wereld.meenten || []).some((m) => {
      for (let dy = 0; dy < stuk.h; dy++) for (let dx = 0; dx < stuk.b; dx++) if (!magOntgonnen(D, m, stuk.x + dx, stuk.y + dy)) return false;
      return true;
    });
  }

  // De plek voor een stuk heide bij de velden van deze boer: de rechthoek van breed bij diep (of andersom) op de meent die
  // het dichtst bij een van zijn velden ligt; bij gelijk de eerste, van boven naar beneden. Of null. Naast zijn akker als
  // het kan (vraag 107, d), en anders zo dichtbij als het kan: op de landen van de maker ligt de heide in een hoek, 8 tot
  // 40 tegels van de dichtste boerderij (5 okt), en wat ontgonnen is, ligt de volgende keer het dichtst bij, zodat de heide
  // van de kant van het dorp af ontgonnen wordt.
  T.ontginPlekVoor = function (D, boer) {
    const w = D.wereld;
    const meenten = (w.meenten || []).filter((m) => m.meent);
    let beste = null;
    for (const m of meenten) {
      for (const [b, h] of [[IN().breed, IN().diep], [IN().diep, IN().breed]]) {
        for (let y = m.y; y + h <= m.y + m.h; y++) {
          for (let x = m.x; x + b <= m.x + m.b; x++) {
            const stuk = { x, y, b, h };
            const d = vanZijnAkker(boer, stuk);
            if (beste && d >= beste.d) continue;
            let past = true;
            for (let dy = 0; dy < h && past; dy++) for (let dx = 0; dx < b && past; dx++) past = magOntgonnen(D, m, x + dx, y + dy);
            if (past && schapenHoudenGenoeg(D, m, stuk)) beste = { ...stuk, d, meent: m };
          }
        }
      }
    }
    return beste && { x: beste.x, y: beste.y, b: beste.b, h: beste.h };
  };

  // ---------------------------------------------------------------------------------------------
  // Het bos
  // ---------------------------------------------------------------------------------------------

  // Wat de boer in het bos opruimt (een boom hakt hij om, een stronk of een struik rooit hij), staat in js/bos.js
  // (T.ontginWerkOp, T.hakBoom, T.rooi). Wat laag groeit (varens, gras, bloemen, een keitje) gaat mee als hij de grond
  // omspit, ook op de heide; en een boompje dat de houthakker plant, maakt er plaats voor (js/bos.js).
  const LAAG = new Set(['varen', 'grasPol', 'bloemen', 'paddenstoelen', 'hoogGras', 'kleineRots']);
  T.groeitLaag = (v) => !!v && LAAG.has(v.soort);
  const isBoom = (w, x, y, v) => !!v && T.NATUUR.bos.telt(w, x, y, v);

  // Per kaart en per dag: welke tegels niet in een stuk bos mogen en welke een boom hebben, als optelsommen (zodat de vraag
  // of een stuk van dertig tegels kan, één stap is, ook voor de tienduizend plekken die de boer afzoekt). Geen spelstaat.
  const BOSKAARTEN = new WeakMap();
  function bosKaart(D) {
    const w = D.wereld;
    const nu = `${T.kaartVersie(w)}|${dagNu(D)}|${w.akkers.length}|${(D.erven || []).length}|${(D.gebouwen || []).length}`;
    const oud = BOSKAARTEN.get(w);
    if (oud && oud.nu === nu) return oud;
    const b = w.tegels[0].length;
    const h = w.tegels.length;
    const niet = new Int32Array((b + 1) * (h + 1));
    const bomen = new Int32Array((b + 1) * (h + 1));
    const meent = (x, y) => (w.meenten || []).some((m) => opStuk(m, x, y));
    const water = (x, y) => !!(w.grond && w.grond[y] && w.grond[y][x] && T.isWaterGrond(w.grond[y][x].naam));
    // Een tegel mag in een stuk bos: geen water, geen meent, geen veld, weg, erf of lantaarn (T.waaromNietOpDezeGrond),
    // niet het plein, niet voor een deur en geen paadje van een deur; en te belopen, of met iets wat hij opruimt (een
    // boom, een stronk, een struik). Een rots, een appelboom (van iemand) of een gebouw niet.
    const mag = (x, y) => {
      if (water(x, y) || meent(x, y) || T.opHetPlein(w, x, y) || T.bijDeur(w, x, y) || T.isAangelegdPaadje(D, x, y)) return false;
      if (T.waaromNietOpDezeGrond(D, x, y)) return false;
      return T.isBegaanbaar(w, x, y) || !!T.ontginWerkOp(w, x, y);
    };
    for (let y = 0; y < h; y++) {
      let rijNiet = 0;
      let rijBomen = 0;
      for (let x = 0; x < b; x++) {
        if (!mag(x, y)) rijNiet++;
        if (isBoom(w, x, y, T.voorwerpOp(w, x, y))) rijBomen++;
        niet[(y + 1) * (b + 1) + x + 1] = niet[y * (b + 1) + x + 1] + rijNiet;
        bomen[(y + 1) * (b + 1) + x + 1] = bomen[y * (b + 1) + x + 1] + rijBomen;
      }
    }
    const k = { nu, b, h, niet, bomen };
    BOSKAARTEN.set(w, k);
    return k;
  }
  // De som over een rechthoek uit een optelsom.
  const somOver = (k, s, x, y, b, h) => s[(y + h) * (k.b + 1) + x + b] - s[y * (k.b + 1) + x + b] - s[(y + h) * (k.b + 1) + x] + s[y * (k.b + 1) + x];

  // Kan de boer erbij? Recht naast een tegel van de rand van het stuk kan hij komen, vanaf zijn deur (T.kanErKomen,
  // js/wereld.js): daar hakt hij (js/veldwerk.js), en hij werkt van de rand naar binnen, dus meer hoeft niet.
  const RECHT = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  function bereikbaar(D, boer, stuk) {
    const w = D.wereld;
    const van = boer.thuis || { x: boer.tx, y: boer.ty };
    for (let y = stuk.y; y < stuk.y + stuk.h; y++) {
      for (let x = stuk.x; x < stuk.x + stuk.b; x++) {
        if (y > stuk.y && y < stuk.y + stuk.h - 1 && x > stuk.x && x < stuk.x + stuk.b - 1) continue; // de rand is genoeg
        for (const [dx, dy] of RECHT) {
          const n = { x: x + dx, y: y + dy };
          if (T.isBegaanbaar(w, n.x, n.y) && T.kanErKomen(w, van, n)) return true;
        }
      }
    }
    return false;
  }

  // Ligt dit stuk nog helemaal op bos dat hij mag ontginnen?
  function bosVrij(D, stuk) {
    return somOver(bosKaart(D), bosKaart(D).niet, stuk.x, stuk.y, stuk.b, stuk.h) === 0;
  }

  // De plek voor een stuk bos bij de velden van deze boer (vraag 107, b): breed bij diep (of andersom), met minstens
  // bosBomen bomen erop, waar hij bij kan; het dichtst bij zijn akker. Bij gelijk de eerste, van boven naar beneden.
  // { x, y, b, h, bomen }, of null.
  T.bosPlekVoor = function (D, boer) {
    if (!boer.werkAkkers || !boer.werkAkkers.length || !D.wereld.tegels.length) return null;
    const k = bosKaart(D);
    const kandidaten = [];
    for (const [b, h] of [[IN().breed, IN().diep], [IN().diep, IN().breed]]) {
      for (let y = 0; y + h <= k.h; y++) {
        for (let x = 0; x + b <= k.b; x++) {
          if (somOver(k, k.niet, x, y, b, h) > 0) continue;
          const bomen = somOver(k, k.bomen, x, y, b, h);
          if (bomen < IN().bosBomen) continue;
          const stuk = { x, y, b, h };
          kandidaten.push({ ...stuk, bomen, d: vanZijnAkker(boer, stuk) });
        }
      }
    }
    kandidaten.sort((a, c) => a.d - c.d || a.y - c.y || a.x - c.x || c.b - a.b);
    const s = kandidaten.find((c) => bereikbaar(D, boer, c));
    return s ? { x: s.x, y: s.y, b: s.b, h: s.h, bomen: s.bomen } : null;
  };

  // ---------------------------------------------------------------------------------------------
  // Het verzoek
  // ---------------------------------------------------------------------------------------------

  // Wie het komt vragen: de zoon van de boer, als hij een grote zoon heeft die je kan komen zoeken, anders de boer zelf
  // (T.kanJeKomenZoeken, js/voorvallen.js).
  function wieVraagt(D, boer) {
    const p = T.bewonerVan(D, boer);
    if (!p) return null;
    const zoon = D.bewoners.mensen.find((q) => q.huis === p.huis && q.band === 'zoon' && (q.leeftijd === 'volwassen' || q.leeftijd === 'jong') && T.kanJeKomenZoeken(D, q));
    return zoon || (T.kanJeKomenZoeken(D, p) ? p : null);
  }

  // Komt er vandaag iemand vragen om te ontginnen? Vanuit T.tikVoorvallenDag (js/voorvallen.js), als er niets anders
  // loopt, vóór de bouwverzoeken. Alleen als het dorp graan tekortkomt, er geen stuk in ontginning is, en niet kort na het
  // vorige verzoek of het vorige stuk. Elke boer zoekt een stuk heide en een stuk bos bij zijn velden (a2), en wie een
  // stuk het dichtst bij heeft, vraagt het, met allebei de zijne om uit te kiezen. Geeft of er een verzoek begon.
  T.beginOntginverzoek = function (D, dag) {
    if (!IN().aan || D.ander || !D.bewoners || !D.wereld) return false;
    const st = staatVan(D);
    if (st.gevraagd != null && dag - st.gevraagd < IN().opnieuw) return false;
    if (st.klaar != null && dag - st.klaar < IN().naKlaar) return false;
    if (st.gezocht != null && dag - st.gezocht < IN().opnieuw) return false;
    if (T.inOntginning(D.wereld).length || !T.graanTekort(D)) return false;
    let keus = null;
    for (const e of D.wereld.wezens) {
      if (e.dood || !e.werkAkkers || !e.werkAkkers.length) continue;
      const heide = T.ontginPlekVoor(D, e);
      const bos = IN().bos ? T.bosPlekVoor(D, e) : null;
      if (!heide && !bos) continue;
      const d = Math.min(...[heide, bos].filter(Boolean).map((p) => vanZijnAkker(e, p)));
      if (!keus || d < keus.d) keus = { boer: e, heide, bos, d };
    }
    if (!keus) st.gezocht = dag;
    const wie = keus && wieVraagt(D, keus.boer);
    if (!wie) return false;
    const L = T.beginVoorval(D, 'ontginverzoek', wie, null, dag);
    L.ontgin = {
      heide: keus.heide, bos: keus.bos, boer: keus.boer, nut: IN().nut,
      vertrouwen: keus.heide ? T.ontginVertrouwen(D) : 0,
      gunst: keus.bos && T.bazenTellen(D) ? IN().gunst : 0,
    };
    L.vlaggen = [keus.heide && 'ontginHeide', keus.bos && 'ontginBos'].filter(Boolean);
    for (const v of L.vlaggen) T.zetVlag(D, v);
    st.gevraagd = dag;
    return true;
  };

  // Wat je antwoord kost of oplevert, voor het venster (T.prijsVanKeuze, js/voorvallen.js): { delen, kan, waarom }. `soort`
  // is 'heide' of 'bos' (je meldt het de heer).
  T.ontginPrijs = function (D, L, soort) {
    const o = L.ontgin;
    if (soort === 'heide') {
      if (!o.heide) return { delen: [], kan: false, waarom: 'er is geen heide meer' };
      return { delen: o.vertrouwen ? [`vertrouwen van het dorp −${o.vertrouwen}`] : [], kan: true };
    }
    if (!o.bos) return { delen: [], kan: false, waarom: 'er is geen bos' };
    const delen = [`+${o.bos.bomen * T.BOS_INSTELLINGEN.houtPerBoom} hout`];
    if (o.gunst) delen.push(`gunst van de heer −${o.gunst}`);
    return { delen, kan: true };
  };

  // Ja (doe: { ontgin: 'heide' of 'bos' }, js/voorvallen.js): het stuk wordt een veld van zijn boerderij, dat
  // nog ontgonnen wordt. Het rust tot het klaar is (braak), en wordt in lentemaand een akker (het plan, js/akkers.js). Is
  // de plek intussen niet meer vrij, dan de plek die hij nu zou kiezen. De heide kost het vertrouwen dat het venster zei
  // (L.ontgin.vertrouwen), het bos de gunst (L.ontgin.gunst).
  T.ontginToegestaan = function (D, L, soort = 'heide') {
    const o = L.ontgin;
    const boer = o.boer;
    const w = D.wereld;
    const bos = soort === 'bos';
    const plek = bos ? (o.bos && bosVrij(D, o.bos) ? o.bos : T.bosPlekVoor(D, boer)) : o.heide && heideVrij(D, o.heide) ? o.heide : T.ontginPlekVoor(D, boer);
    if (!plek) {
      T.zeg(D, bos ? 'In het bos is geen plek meer om te ontginnen.' : 'Op de heide is geen plek meer om te ontginnen.');
      return null;
    }
    const dag = dagNu(D);
    const nummer = w.akkers.filter((v) => v.huis === boer.huis && /ontgonnen/.test(v.naam)).length + 1;
    const veld = {
      naam: `${boer.huis}-ontgonnen-${nummer}`, x: plek.x, y: plek.y, b: plek.b, h: plek.h,
      huis: boer.huis, bestemming: 'braak', plan: 'akker', planDoor: 'boer',
      vruchtbaarheid: T.VELDEN_INSTELLINGEN.beginVruchtbaarheid, ontgonnen: bos ? 'bos' : 'heide',
      ontginning: { tot: dag + (bos ? IN().bosDagen : IN().heideDagen), op: bos ? 'bos' : 'heide', gestoken: new Set() },
    };
    w.akkers.push(veld);
    boer.werkAkkers.push(veld);
    // Een veld waar heide of bos was: wat uit de kaart volgt (de paadjes van de deuren lopen niet over een veld, js/paden.js;
    // de wegen en de grond), wordt opnieuw uitgerekend.
    T.kaartVeranderd(w);
    const wie = T.hoofdletter(T.naamVanBewoner(L.wie));
    const zaaien = T.isNazaaitijd(veld.ontginning.tot) ? 'en dan zaaien ze het meteen' : 'en in lentemaand wordt het gezaaid';
    if (!bos) {
      if (o.vertrouwen) T.wijzigVertrouwen(D, -o.vertrouwen, 'een stuk van de meent');
      T.zeg(D, `${wie} begint de heide te ontginnen: over een maand is het een akker, ${zaaien}.`, 'goed');
    } else {
      if (o.gunst) T.wijzigGunst(D, -o.gunst, 'een stuk van zijn bos');
      T.zeg(D, `${wie} begint het bos te ontginnen. Je meldt het de heer, en hij laat weten: "Ons bos? Nu ja. Het staat in Onze boeken." Over een winter is het een akker, ${zaaien}.`, 'goed');
    }
    return veld;
  };

  // ---------------------------------------------------------------------------------------------
  // Het werk (js/veldwerk.js), en het eind
  // ---------------------------------------------------------------------------------------------

  // Een tegel van een veld in ontginning gestoken of omgespit (js/veldwerk.js): daar is het kale grond, en wat er laag
  // groeide, is weg.
  T.steekPlag = function (veld, x, y, w) {
    if (!veld.ontginning) return;
    veld.ontginning.gestoken.add(sleutel(x, y));
    const v = w && T.voorwerpOp(w, x, y);
    if (T.groeitLaag(v)) T.haalVoorwerpWeg(w, v);
  };
  T.isGestoken = (veld, x, y) => !veld.ontginning || veld.ontginning.gestoken.has(sleutel(x, y));

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, vóór T.tikAkkersDag): een stuk dat af is, of waarvan de tijd om is, is
  // ontgonnen; wat de boer niet af had, doen zijn mensen dan nog (zoals het vangnet van de oogst, js/akkers.js): in het bos
  // de bomen om (het hout naar de schuur) en de stobben eruit. Op 1 lentemaand wordt het een akker, en gezaaid (T.wisselVelden en
  // T.zaaiAkkers; zolang het ontgonnen wordt, wisselt het niet). Is het klaar terwijl de boeren nazaaien (T.isNazaaitijd),
  // dan wordt het meteen een akker, en zaaien ze het na zodra er graan is (T.zaaiNa, in dezelfde nacht): dan hoeft wie in
  // de winter ja zei, niet een jaar te wachten.
  T.tikOntginnenDag = function (D, dag) {
    const w = D.wereld;
    for (const veld of T.inOntginning(w)) {
      if (dag < veld.ontginning.tot && veld.ontginning.gestoken.size < veld.b * veld.h) continue;
      for (const t of T.akkerTegels(veld)) {
        T.hakBoom(D, t.x, t.y);
        T.rooi(D, t.x, t.y);
        T.steekPlag(veld, t.x, t.y, w);
      }
      const bos = veld.ontginning.op === 'bos';
      delete veld.ontginning;
      staatVan(D).klaar = dag;
      const boer = T.boerVanVeld(D, veld);
      const van = boer ? ` van ${boer.naam}` : '';
      const wat = bos ? `Het bos${van} is ontgonnen` : `De heide${van} is ontgonnen`;
      if (T.isNazaaitijd(dag)) {
        veld.bestemming = T.planVan(veld);
        veld.ongezaaid = new Set(T.akkerTegels(veld).map((t) => sleutel(t.x, t.y)));
        T.zeg(D, `${wat}: het is een akker, en de boeren zaaien hem na.`, 'goed');
      } else T.zeg(D, `${wat}: in lentemaand wordt het een akker.`, 'goed');
    }
  };

  // ---------------------------------------------------------------------------------------------
  // De woorden van het gesprek (js/gesprekken.js, 'ontginverzoek'; T.vulWoordenIn, js/gesprek.js)
  // ---------------------------------------------------------------------------------------------
  const ontginNu = (D) => {
    const L = D.voorvallen && D.voorvallen.lopend;
    return L && L.ontgin ? L : null;
  };
  const vanDeBoer = (L) => L.ontgin.boer === L.wie.wezen;
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  // "het stuk heide naast mijn akker", "het stuk heide naast de akker van mijn vader"
  T.GESPREK_WOORDEN.heide = (D) => {
    const L = ontginNu(D);
    if (!L) return 'de heide';
    return `het stuk heide naast ${vanDeBoer(L) ? 'mijn akker' : 'de akker van mijn vader'}`;
  };
  // "het stuk bos achter mijn akker", "het stuk bos achter de akker van mijn vader"
  T.GESPREK_WOORDEN.bos = (D) => {
    const L = ontginNu(D);
    if (!L) return 'het bos';
    return `het stuk bos achter ${vanDeBoer(L) ? 'mijn akker' : 'de akker van mijn vader'}`;
  };
  // "dertig tegels": hoe groot een stuk is
  T.GESPREK_WOORDEN.stuk = (D) => {
    const L = ontginNu(D);
    const s = L && (L.ontgin.heide || L.ontgin.bos);
    return s ? `${T.telwoord(s.b * s.h)} tegels` : 'een stuk';
  };
  // "het is de meent, en het dorp zal er wat van vinden", en bij een volgend stuk "er ging al een stuk van de meent af, en
  // het dorp zal er meer van vinden": want dat kost meer (vertrouwen, hierboven)
  T.GESPREK_WOORDEN.meent = (D) => {
    const n = D && D.wereld ? T.ontgonnenStukken(D.wereld) : 0;
    if (!n) return 'het is de meent, en het dorp zal er wat van vinden';
    if (n === 1) return 'er ging al een stuk van de meent af, en het dorp zal er meer van vinden';
    return `er gingen al ${T.telwoord(n)} stukken van de meent af, en het dorp zal er nog meer van vinden`;
  };
})(globalThis.Spel = globalThis.Spel || {});
