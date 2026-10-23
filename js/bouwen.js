// Meebouwen (werklijst vraag 152, 1d; Marcel, 11 okt: "d ja", en bij het plan voor stap 1: "bouwen met handen (wie geen
// werk heeft, bouwt mee, en hoe meer handen, hoe sneller)"): in het lege begin rijst een gebouw niet vanzelf op in zijn
// bouwtijd, maar bouwen de mensen het. Een gebouw vraagt zijn bouwtijd keer `werkPerBouwdag` werkdagen. Elke bouwer doet
// er per dag één werkdag aan, minder als het dorp eentonig eet (T.werkVanAfwisseling, js/behoeften.js; vraag 154, B1);
// zonder bouwers staat het stil. Elke man in een werkplaats is dus een bouwer minder.
//
// Bouwen en dragen zijn één rij klusjes (vraag 184; Marcel, 20 okt: "3a1", wie het dichtst is): wie kan werken en geen werk
// heeft (zoals de dagloners in js/veldwerk.js), bouwt of draagt. Elke ochtend kiest het dorp wie vandaag bouwt: per
// bouwplaats, in de volgorde waarin je ze neerzette, zoveel bouwers als er werk is (`bouwersNodig`: bij het rooien
// `perPlaats`, en daarna zoveel als het bouwmateriaal dat er ligt werk geeft), de dichtsten bij eerst. Wie overblijft,
// draagt (T.dragersVan; js/kar.js). Wie bouwmateriaal brengt naar een bouwplaats waar niemand bouwt, blijft er bouwen
// (T.blijftBouwen): zo begint het bouwen nog dezelfde dag.
//
// Staat er iets op de plek (de voet en het looppad eromheen, de kavel, T.kavelVan in js/bos.js), dan rooien de bouwers
// dat eerst (Marcel, 11 okt: "a1"): een boom omhakken en zijn stobbe eruit kost `rooiBoom` werkdagen, een struik, een
// stronk of een boompje `rooiStruik`, en een boom geeft zijn hout, wie hem ook omhakt (T.hakBoom, js/bos.js). Dan maken
// ze de grond vlak, op een land met hoogte (vraag 182; Marcel, 20 okt: "Ik wil dat bouwers eerst de grond 'levelen' met
// een schop, zoals in knights and merchants", "1a3", "1b1"): een klein vast deel plus wat de helling vraagt
// (`egaliseerVast`, `egaliseerPerHoogte`), en de grond zakt of rijst in `egaliseerStappen` stappen naar het vlak (23 okt).
// Tot de kavel vrij en vlak is, staat het gebouw nog niet op de kaart (`wachtOpRooien`, en tijdens het egaliseren ook
// `egaliseert`), en js/tekenen.js laat zijn voet zien.
//
// De regel is de nacht (T.tikBouwenDag): het werk van gisteren, van wie er gisteren bouwde. Overdag laten de beelden
// hetzelfde eerder zien (T.werkBouwenBij): het werk van vandaag naar hoe ver de werkdag is, zodat een boom valt terwijl
// ze hakken; en de bouwers lopen erheen en werken er met de bijl. Wat de beelden vandaag al deden (`vandaag`), doet de
// nacht niet nog eens, dus met of zonder beelden komt er hetzelfde uit (de toetsen spelen zonder).
//
//   g.bouw    { werk, gedaan, tegoed, vandaag, hout, egaliseerWerk }: `werk` is wat het bouwen vraagt en `gedaan` wat er
//             al gebouwd is (in werkdagen, zonder het rooien en het egaliseren); `tegoed` wat er al aan het rooien gedaan
//             is maar nog geen hele tegel was, of aan het egaliseren; `vandaag` wat de beelden vandaag al deden; `hout` wat
//             het rooien opbracht (voor het bericht); `egaliseerWerk` wat het egaliseren vraagt.
//   g.vlak    het vlakke stuk onder het gebouw (js/hoogte.js), zodra de bouwers egaliseren; `g.egaliseert` zolang ze bezig zijn.
//   p.bouwt   de bouwplaats waar deze bewoner vandaag aan bouwt.
//   e.werkt   { soort: 'hakken' | 'bouwen', x, y, op, tot, rust, bouw }: een bouwer aan het werk, op (x, y), naar `op`
//             toe (de boom of de voet); js/sprites.js kiest er de hakker bij.
// Regels zonder scherm, dus te toetsen (test/begin.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.BOUWEN_INSTELLINGEN = {
    // Een gebouw vraagt zijn bouwtijd keer zoveel werkdagen: een hut (bouwtijd 2) 4, het raadhuis (4) 8.
    werkPerBouwdag: 2,
    // Zoveel bouwers werken hooguit op één bouwplaats.
    perPlaats: 4,
    // Rooien, in werkdagen per tegel: een boom omhakken en zijn stobbe eruit, of een struik, een stronk of een boompje.
    // Op de plek van een hut in het bos (9 bij 9 tegels met zijn looppad) staan zo'n 35 bomen: ruim acht werkdagen.
    rooiBoom: 0.25,
    rooiStruik: 0.1,
    // Een veld (js/boerderij.js; vraag 152, 1e) vraagt zoveel werkdagen per tegel, na het rooien: een akker ploegen, een
    // wijngaard planten. Een akker van 30 tegels is zo anderhalve werkdag, een wijngaard drie.
    veldWerk: { akker: 0.05, wijngaard: 0.1 },
    // Egaliseren (vraag 182, "1a3"), in werkdagen: een vast deel, en zoveel per pixel dat de grond onder het vlakke stuk
    // moet zakken of rijzen, opgeteld over zijn hoekpunten (T.egaliseerVerschil, js/hoogte.js). In stappen (23 okt: "In een
    // paar stappen"): elke stap tekent alleen dat stukje grond opnieuw.
    egaliseerVast: 0.25,
    egaliseerPerHoogte: 0.004,
    egaliseerStappen: 4,
  };
  const IN = () => T.BOUWEN_INSTELLINGEN;

  // Bouwen de mensen zelf? In het lege begin (js/begin.js); in het gehucht dat er al was, rijst een gebouw vanzelf op.
  T.bouwenMetHanden = (D) => !!(D && D.begin);

  // Hoeveel werkdagen het bouwen van deze soort vraagt, zonder het rooien; een veld naar zijn tegels (`voet`).
  T.bouwWerkVan = (soort, voet) => (T.isVeldSoort(soort)
    ? Math.round(voet.b * voet.h * IN().veldWerk[soort] * 100) / 100
    : T.GEBOUWEN[soort].bouwtijd * IN().werkPerBouwdag);

  // Het stuk dat de bouwers eerst rooien als dit gebouw op (x, y) komt: zijn voet met het looppad eromheen (T.kavelVan,
  // js/bos.js), of null als de mensen niet zelf bouwen. Eén vraag voor de muis (js/main.js) en de klik (T.plaatsGebouw);
  // `tekening` is die van het gebouw in de hand, als je hem draaide (T.bouwTekening, js/gebouwen.js).
  T.bouwKavel = function (D, soort, x, y, tekening) {
    if (!T.bouwenMetHanden(D) || !T.GEBOUWEN[soort]) return null;
    const voet = T.gebouwVoet(soort, tekening || T.volgendeTekening(D, soort));
    return voet ? T.kavelVan(D, x, y, voet) : null;
  };

  // Moet de grond onder gebouw g eerst vlak (vraag 182)? Op een land met hoogte (js/hoogte.js), voor een gebouw: een veld
  // blijft liggen zoals het ligt.
  T.moetEgaliseren = (D, g) => !!(D.wereld && D.wereld.hoogte) && !T.isVeldSoort(g.soort);

  // Een nieuw gebouw dat de mensen zelf bouwen (T.plaatsGebouw, js/gebouwen.js): het wacht op zijn werk, niet op een dag.
  // Moet er eerst gerooid of geëgaliseerd worden, dan staat het nog niet op de kaart.
  T.zetBouwplaats = function (D, instantie, kavel) {
    const rooien = !!(kavel && T.teRooienOp(D, kavel).length);
    Object.assign(instantie, { klaar: false, klaarOp: null, bouw: { werk: T.bouwWerkVan(instantie.soort, instantie.voet), gedaan: 0, tegoed: 0, vandaag: 0, hout: 0 } });
    if (kavel && (rooien || T.moetEgaliseren(D, instantie))) Object.assign(instantie, { wachtOpRooien: true, kavel });
    return instantie;
  };

  // De bouwplaatsen in de volgorde waarin je ze neerzette, en dan de wegen in aanleg (js/wegen.js): eerst een dak.
  const bouwplaatsen = (D) => (D.gebouwen || []).filter((g) => g.bouw && !g.klaar).concat(D.wegwerk || []);
  const isWeg = (g) => g.soort === 'weg';

  // Wat een tegel van de kavel aan rooien kost, in werkdagen.
  const rooiKost = (D, t) => (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken' ? IN().rooiBoom : IN().rooiStruik);

  // Werk aan een bouwplaats (in werkdagen): eerst het rooien, tegel voor tegel in de volgorde van de kavel, en wat over is
  // naar het bouwen, zo ver als het hout reikt dat de ossenkar bracht (T.bouwMateriaalDeel, js/kar.js; werklijst C, stap
  // 2). Is de kavel vrij, dan komt het gebouw op de kaart; is het werk af, dan is hij vannacht klaar (T.tikGebouwenDag zet
  // hem dan op klaar, zoals elk gebouw). Geeft het werk dat bleef liggen omdat het hout er nog niet was: overdag doen de
  // bouwers het later die dag, als de kar het bracht.
  function werkAan(D, g, werk, dag) {
    if (isWeg(g)) return T.werkAanWeg(D, g, werk);
    const B = g.bouw;
    let over = werk;
    if (g.wachtOpRooien) {
      B.tegoed += over;
      over = 0;
      for (const t of T.teRooienOp(D, g.kavel)) {
        const kost = rooiKost(D, t);
        if (B.tegoed + 1e-9 < kost) break;
        B.tegoed -= kost;
        if (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken') B.hout += T.rooiHoutPerBoom(D);
        T.rooiTegel(D, t, g); // het hout op de stapel van de bouwplaats (js/kar.js)
        B.gerooid = true;
      }
      if (T.teRooienOp(D, g.kavel).length) return 0;
      // de plek is vrij: dan de grond vlak (vraag 182), en dan komt het gebouw op de kaart
      if (T.moetEgaliseren(D, g) && !egaliseer(D, g)) return 0;
      over = B.tegoed;
      B.tegoed = 0;
      g.wachtOpRooien = false;
      const gebouw = T.hoofdletter(T.GEBOUWEN[g.soort].naam);
      // Een veld komt niet als gebouw op de kaart: het wordt land als het af is (js/boerderij.js).
      if (!B.gerooid) {
        // er stond niets: alleen geëgaliseerd, en dat zie je
        if (!T.isVeldSoort(g.soort)) T.zetOpDeKaart(D, g);
      } else if (T.isVeldSoort(g.soort)) {
        T.zeg(D, B.hout
          ? T.t('{gebouw}: the ground is cleared (+{hout|# log|# logs}), and now they work it.', { gebouw, hout: B.hout })
          : T.t('{gebouw}: the ground is cleared, and now they work it.', { gebouw }));
      } else {
        T.zetOpDeKaart(D, g);
        T.zeg(D, B.hout
          ? T.t('{gebouw}: the site is cleared (+{hout|# log|# logs}), and now they build.', { gebouw, hout: B.hout })
          : T.t('{gebouw}: the site is cleared, and now they build.', { gebouw }));
      }
    }
    const mag = Math.max(B.gedaan, B.werk * T.bouwMateriaalDeel(g));
    const nieuw = Math.min(B.werk, mag, B.gedaan + over);
    const liggen = mag < B.werk ? Math.max(0, B.gedaan + over - nieuw) : 0;
    B.gedaan = nieuw;
    if (g.voorwerp) g.voorwerp.voortgang = B.gedaan / B.werk;
    if (B.gedaan >= B.werk - 1e-9) g.klaarOp = dag;
    return liggen;
  }

  // Het egaliseren (vraag 182): is de plek vrij, dan maakt het werk van de bouwers (`B.tegoed`) de grond vlak, in
  // `egaliseerStappen` stappen (T.egaliseer en T.zetEgaliseerDeel, js/hoogte.js). Het vlakke stuk komt er bij het eerste
  // werk, op de gemiddelde hoogte van wat er dan ligt, en het werk is een klein vast deel plus wat de grond moet zakken of
  // rijzen (T.egaliseerVerschil). Geeft true als de grond vlak is; wat er dan nog over is, blijft in `B.tegoed`.
  function egaliseer(D, g) {
    const B = g.bouw;
    const w = D.wereld;
    if (!g.vlak) {
      g.vlak = T.egaliseer(w, T.voetVanGebouw(g), null, 0);
      g.egaliseert = true;
      B.egaliseerWerk = Math.round((IN().egaliseerVast + IN().egaliseerPerHoogte * T.egaliseerVerschil(w, g.vlak)) * 100) / 100;
    }
    if (!g.egaliseert) return true;
    if (B.tegoed + 1e-9 < B.egaliseerWerk) {
      const n = IN().egaliseerStappen;
      const deel = Math.floor((B.tegoed / B.egaliseerWerk) * n + 1e-9) / n;
      if (deel !== (g.vlak.deel || 0)) T.zetEgaliseerDeel(w, g.vlak, deel);
      return false;
    }
    B.tegoed -= B.egaliseerWerk;
    T.zetEgaliseerDeel(w, g.vlak, 1);
    g.egaliseert = false;
    return true;
  }

  // Wacht deze bouwplaats op hout: gerooid, en de bouwers kwamen zo ver als het hout reikt.
  T.wachtOpHout = (g) => !!(g.bouw && !g.klaar && !g.wachtOpRooien && T.bouwMateriaalDeel(g) < 1 && g.bouw.gedaan >= g.bouw.werk * T.bouwMateriaalDeel(g) - 1e-9);

  // Wie er vandaag aan deze bouwplaats bouwt (en het nog kan).
  const bouwersVan = (D, g) => D.bewoners.mensen.filter((p) => p.bouwt === g && T.kanWerken(p) && !p.werk);
  // Hoeveel werkdagen zij samen per dag doen: één per bouwer, naar hoe hard er gewerkt wordt (de afwisseling van de
  // laatste maaltijd; de nacht rekent zo met dezelfde maaltijd als de beelden overdag).
  const werkdagenVan = (D, g) => bouwersVan(D, g).length * T.werkVanAfwisseling(D);

  // Elke nacht (T.tikGebouwenDag, vóór de gebouwen die klaarkomen): het werk van gisteren, voor wie er gisteren bouwde, min
  // wat de beelden al deden.
  T.tikBouwenDag = function (D, dag) {
    if (!T.bouwenMetHanden(D) || !D.bewoners) return;
    for (const g of bouwplaatsen(D)) {
      const werk = werkdagenVan(D, g);
      if (werk > g.bouw.vandaag) werkAan(D, g, werk - g.bouw.vandaag, dag);
      g.bouw.vandaag = 0;
    }
  };

  // Wie kan meebouwen: wie kan werken, groot genoeg is (volwassen, of een grote zoon of dochter), geen werk heeft en geen
  // dagloner is. Net als de handen (T.verdeelHanden) zonder te vragen of zijn poppetje er al is: wie nog over de weg komt,
  // telt mee (zonder beelden komt hij nooit aan).
  const kanBouwen = (p) => T.kanWerken(p) && !p.werk && !p.dagloner && (p.leeftijd === 'volwassen' || p.leeftijd === 'jong');
  // Bouwt hij vandaag aan een bouwplaats die er nog is?
  const bouwtNu = (D, p) => !!p.bouwt && !p.bouwt.klaar && bouwplaatsen(D).includes(p.bouwt);

  // Wie nu draagt (vraag 184; js/kar.js): wie kan meebouwen maar niet bouwt, en niet schuilt of thuisblijft; wie het huis
  // van zijn gezin vrijmaakt (js/bos.js), rooit. Net als bij het bouwen zonder te vragen of zijn poppetje er al is: de regel
  // kent zijn eigen plek (p.vervoer), en het poppetje loopt erachteraan.
  T.dragersVan = function (D) {
    if (!T.metVervoer(D) || !D.bewoners || !D.kalender) return [];
    const dag = D.kalender.dag;
    const plaatsen = new Set(bouwplaatsen(D));
    const bouwt = (p) => !!p.bouwt && !p.bouwt.klaar && plaatsen.has(p.bouwt);
    return D.bewoners.mensen.filter((p) => !p.schuilt && kanBouwen(p) && !bouwt(p) && !(p.huis && p.huis.groeitNaRooien) && !T.blijftThuis(p, dag));
  };

  // Hoeveel bouwers bouwplaats g kan gebruiken, nog voor `rest` van de werkdag (1: de hele dag): bij het rooien en aan een
  // weg `perPlaats`; daarna zoveel als het bouwmateriaal dat er ligt werk geeft (T.bouwMateriaalDeel, js/kar.js), want
  // de rest draagt het aan.
  function bouwersNodig(D, g, rest) {
    if (isWeg(g) || g.wachtOpRooien) return IN().perPlaats;
    const B = g.bouw;
    const kan = B.werk * T.bouwMateriaalDeel(g) - B.gedaan;
    const perBouwer = T.werkVanAfwisseling(D) * rest;
    if (kan <= 1e-6 || !(perBouwer > 0)) return 0;
    return Math.min(IN().perPlaats, Math.ceil(kan / perBouwer - 1e-9));
  }

  // De bouwers van bouwplaats g uit `vrij` (die gaan eruit): zoveel als hij kan gebruiken, de dichtsten bij zijn deur eerst.
  function stuurBouwers(D, g, vrij, rest) {
    const n = bouwersNodig(D, g, rest) - bouwersVan(D, g).length;
    if (n <= 0) return;
    const r = isWeg(g) ? { ...T.wegNogTeDoen(g)[0], b: 1, h: 1 } : g.wachtOpRooien ? g.kavel : T.voetVanGebouw(g);
    if (r.x == null) return; // een weg die af is
    const deur = (p) => (p.wezen && p.wezen.thuis) || (p.huis && T.deurVan(D.wereld, p.huis)) || { x: 0, y: 0 };
    const midden = { x: r.x + r.b / 2, y: r.y + r.h / 2 };
    vrij.sort((p, q) => T.afstand(deur(p), midden) - T.afstand(deur(q), midden));
    for (const p of vrij.splice(0, n)) p.bouwt = g;
  }

  // Elke ochtend (T.tikGebouwenDag, na het verdelen van de handen): wie vandaag bouwt. Wie kan meebouwen, gaat naar de
  // eerste bouwplaats die nog bouwers kan gebruiken; wie overblijft, draagt.
  T.kiesBouwers = function (D) {
    const B = D.bewoners;
    if (!B || !B.mensen) return;
    for (const p of B.mensen) if (p.bouwt) p.bouwt = null;
    if (!T.bouwenMetHanden(D)) return;
    const vrij = B.mensen.filter(kanBouwen);
    for (const g of bouwplaatsen(D)) {
      stuurBouwers(D, g, vrij, 1);
      if (!vrij.length) break;
    }
  };

  // Een nieuwe bouwplaats (T.plaatsGebouw, T.legVeld, T.legWeg): wie vandaag nog nergens bouwt en kan, begint er meteen
  // aan, niet pas morgenochtend (T.kiesBouwers). Anders rooide op de dag van aankomst niemand (Marcel, 17 okt: "ze
  // beginnen nu op dag 2"). Wat de werkdag al achter de rug had, telt voor hem als gedaan (`vandaag`): het werk begint
  // nu, en de nacht (T.tikBouwenDag) rekent alleen wat er na het neerzetten nog over was. Wie iets draagt, maakt eerst
  // zijn rit af.
  T.nieuweBouwplaats = function (D, g) {
    if (!T.bouwenMetHanden(D) || !D.bewoners || !D.kalender) return;
    const vrij = D.bewoners.mensen.filter((p) => kanBouwen(p) && !bouwtNu(D, p) && !(p.vervoer && p.vervoer.rit));
    stuurBouwers(D, g, vrij, 1 - werkdagGedaan(D, D.kalender.dag));
    g.bouw.vandaag = werkdagenVan(D, g) * werkdagGedaan(D, D.kalender.dag);
  };

  // Een drager bracht op moment t bouwmateriaal naar bouwplaats g (js/kar.js): bouwt daar niemand en is er nu werk, dan
  // blijft hij er bouwen, de rest van de werkdag. Alleen waar niemand bouwt, anders bouwt na een paar ritten iedereen en
  // draagt er niemand meer; morgenochtend verdeelt het dorp opnieuw (T.kiesBouwers). Wat de werkdag al achter de rug had,
  // telt voor hem als gedaan (`vandaag`), zoals bij een nieuwe bouwplaats.
  T.blijftBouwen = function (D, p, g, t) {
    if (!p || !g.bouw || g.klaar || !bouwplaatsen(D).includes(g) || bouwtNu(D, p) || bouwersVan(D, g).length) return;
    const gedaan = werkdagGedaan(D, t);
    if (!bouwersNodig(D, g, 1 - gedaan)) return;
    p.bouwt = g;
    g.bouw.vandaag += T.werkVanAfwisseling(D) * gedaan;
  };

  // ---------------------------------------------------------------------------------------------
  // Overdag, elk beeld
  // ---------------------------------------------------------------------------------------------

  // Hoe ver de werkdag van de dag van moment `dag` is, van 0 tot 1 (js/dag.js).
  function werkdagGedaan(D, dag) {
    const d = T.dagindeling(dag);
    const eind = T.isOogstDag(dag) ? d.werkEindOogst : d.werkEind;
    if (!(eind > d.werkBegin)) return 0;
    return Math.max(0, Math.min(1, (T.uurVanDag(dag) - d.werkBegin) / (eind - d.werkBegin)));
  }
  const uur = () => (T.DAG_LENGTE || 300) / 24;

  // Het werk aan bouwplaats g van vandaag, tot moment t (naar hoe ver de werkdag dan is). Wat bleef liggen omdat het hout
  // er nog niet was, doen ze later vandaag (of vannacht, T.tikBouwenDag). Zo vaak als je wilt: het werk komt op hetzelfde uit.
  function werkTot(D, g, t) {
    const doel = werkdagenVan(D, g) * werkdagGedaan(D, t);
    if (doel <= g.bouw.vandaag + 1e-6) return;
    const liggen = werkAan(D, g, doel - g.bouw.vandaag, Math.floor(t) + 1);
    g.bouw.vandaag = doel - liggen;
  }

  // Elk beeld (T.werkDorpBij, js/dorp.js): het werk van vandaag tot nu, en de bouwers aan het werk. In de werkuren loopt
  // elke bouwer naar een tegel naast wat er nu te doen is (de dichtste boom op de kavel, of de voet), en werkt daar; buiten
  // de werkuren, of als hij iets anders moet, houdt hij op (T.stopWerk, js/veldwerk.js), en neemt het ritme van de dag
  // het over (T.dwaal).
  T.werkBouwenBij = function (S, D) {
    if (!T.bouwenMetHanden(D) || !D.bewoners || !D.kalender || !D.wereld) return;
    const dag = D.kalender.dag;
    const werktijd = T.dagdeelVan(dag, T.isOogstDag(dag)) === 'werk';
    const plaatsen = bouwplaatsen(D);
    if (werktijd) for (const g of plaatsen) werkTot(D, g, dag);
    const nu = S.wereldTijd || 0;
    for (const p of D.bewoners.mensen) {
      const e = p.wezen;
      if (!e || e.dood) continue;
      const g = p.bouwt;
      const bezig = e.werkt && e.werkt.bouw;
      if (!werktijd || !g || g.klaar || !plaatsen.includes(g) || !T.magWerken(S, D, e)) {
        if (bezig) T.stopWerk(e);
        continue;
      }
      werkAanDePlaats(D, e, g, nu);
    }
  };

  // Een bouwer bij zijn bouwplaats: staat hij naast wat er te doen is, dan werkt hij (de bijl); anders loopt hij erheen.
  function werkAanDePlaats(D, e, g, nu) {
    const w = D.wereld;
    const wt = e.werkt && e.werkt.bouw === g ? e.werkt : null;
    if (wt && wt.wacht && nu < wt.wacht) return; // hij kwam er niet: over een uur weer
    // Aan een weg (js/wegen.js) werken ze aan de eerste tegels die nog niet liggen: hakken als daar iets staat.
    const weg = isWeg(g) ? T.wegNogTeDoen(g).slice(0, IN().perPlaats) : null;
    const soort = weg ? (weg.some((t) => T.ontginWerkOp(w, t.x, t.y)) ? 'hakken' : 'bouwen') : g.egaliseert ? 'egaliseren' : g.wachtOpRooien ? 'hakken' : 'bouwen';
    // nog te doen: de boom waar hij naar kijkt, de tegel weg, of de voet
    const opNogTeDoen = (op) => (soort === 'hakken' ? !!T.ontginWerkOp(w, op.x, op.y) : weg ? !T.opPad(w, op.x, op.y) : true);
    if (wt && wt.soort === soort && opNogTeDoen(wt.op)) {
      if (e.pad.length) return; // onderweg
      if (e.tx === wt.x && e.ty === wt.y) {
        if (wt.tot == null) wt.tot = nu + 24 * uur(); // hij werkt hier tot er iets anders te doen is
        return;
      }
    }
    if (e.werkt && !wt) T.stopWerk(e);
    // Waar hij naartoe kijkt: de dichtste tegel die nog gerooid moet, of de dichtste tegel van de voet, en liefst een die geen
    // andere bouwer al neemt (zoals twee maaiers nooit dezelfde tegel nemen, js/akkers.js).
    const hier = { x: e.tx, y: e.ty };
    const bezet = new Set();
    for (const q of D.bewoners.mensen) {
      const o = q.wezen && q.wezen !== e && q.wezen.werkt;
      if (o && o.bouw === g && o.op) bezet.add(o.op.x + ',' + o.op.y);
    }
    const alle = weg ? (soort === 'hakken' ? weg.filter((t) => T.ontginWerkOp(w, t.x, t.y)) : weg)
      : soort === 'hakken' ? T.teRooienOp(D, g.kavel) : randVan(T.voetVanGebouw(g));
    const vrij = alle.filter((t) => !bezet.has(t.x + ',' + t.y));
    const tegels = vrij.length ? vrij : alle;
    let op = null;
    let naast = null;
    for (const t of tegels.sort((a, b) => T.afstand(a, hier) - T.afstand(b, hier)).slice(0, 12)) {
      naast = vrijNaast(w, t, e);
      if (naast) {
        op = t;
        break;
      }
    }
    if (!op) {
      if (e.werkt) T.stopWerk(e);
      return;
    }
    e.werkt = { soort, x: naast.x, y: naast.y, op: { x: op.x, y: op.y }, tot: null, rust: false, bouw: g };
    if (e.tx === naast.x && e.ty === naast.y) return;
    const pad = T.zoekRoute(w, hier, naast, {});
    if (pad && pad.length) T.geefRoute(e, pad, naast);
    else Object.assign(e.werkt, { x: e.tx, y: e.ty, rust: true, wacht: nu + uur() }); // geen weg: hij wacht waar hij is
  }

  // De tegels van de voet die aan de rand liggen (daar staat wie bouwt, ernaast).
  function randVan(r) {
    const uit = [];
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.b; x++) if (x === r.x || y === r.y || x === r.x + r.b - 1 || y === r.y + r.h - 1) uit.push({ x, y });
    }
    return uit;
  }
  // Een tegel naast t waar e kan staan (niet schuin), of null.
  function vrijNaast(w, t, e) {
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const x = t.x + dx;
      const y = t.y + dy;
      if ((x === e.tx && y === e.ty) || T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) return { x, y };
    }
    return null;
  }

  // ---------------------------------------------------------------------------------------------
  // In woorden
  // ---------------------------------------------------------------------------------------------

  // Wat een bouwplaats doet, voor het briefje bij een gebouw (T.gebouwToestand, js/gebouwen.js).
  T.bouwToestand = function (D, g) {
    const gebouw = T.hoofdletter(T.GEBOUWEN[g.soort].naam);
    const n = D.bewoners ? bouwersVan(D, g).length : 0;
    // het egaliseren (vraag 182): bezig, of nog niet begonnen op een plek waar niets te rooien is
    if (g.egaliseert || (g.wachtOpRooien && !T.teRooienOp(D, g.kavel).length)) {
      const pct = g.egaliseert ? Math.floor((100 * g.bouw.tegoed) / g.bouw.egaliseerWerk) : 0;
      return n
        ? T.t('{gebouw}: {n|# builder levels|# builders level} the ground first ({pct}% done).', { gebouw, n, pct })
        : T.t('{gebouw}: the ground still has to be levelled, and everyone has other work.', { gebouw });
    }
    if (g.wachtOpRooien) {
      return n
        ? T.t('{gebouw}: {n|# builder clears|# builders clear} the site first: {wat}.', { gebouw, n, wat: T.rooiWoordenOp(D, g.kavel) })
        : T.t('{gebouw}: the site still has to be cleared ({wat}), and everyone has other work.', { gebouw, wat: T.rooiWoordenOp(D, g.kavel) });
    }
    const gedaan = Math.floor(g.bouw.gedaan);
    // Het hout dat de dragers brengen (js/kar.js): wacht hij erop, of hoeveel is er al.
    const B = g.bouw;
    if (B.nodig && T.bouwMateriaalDeel(g) < 1) {
      const wat = Object.keys(B.nodig)[0];
      const hout = { gebouw, er: Math.floor(B.er[wat] || 0), nodig: B.nodig[wat], waar: T.waarNaam(wat), gedaan, werk: B.werk };
      return T.wachtOpHout(g)
        ? T.t('{gebouw}: waiting for carriers to bring {waar} ({er} of {nodig} here); {gedaan} of {werk} workdays done.', hout)
        : T.t('{gebouw}: {gedaan} of {werk} workdays done, as far as the {waar} goes ({er} of {nodig} here).', hout);
    }
    return n
      ? T.t('{gebouw}: {n|# builder|# builders}, {gedaan} of {werk} workdays done.', { gebouw, n, gedaan, werk: g.bouw.werk })
      : T.t('{gebouw}: {gedaan} of {werk} workdays done; nobody is building, everyone has other work.', { gebouw, gedaan, werk: g.bouw.werk });
  };

  // ---------------------------------------------------------------------------------------------
  // Waar een gebouw komt (tot ronde 2 van het snoeien, 12 okt, in js/verzoeken.js)
  // ---------------------------------------------------------------------------------------------

  // Waar een gebouw van deze soort komt, zoals wie het wil bouwen het kiest: { x, y }, of null. Zo dicht mogelijk bij
  // `bij` (een deur), in ringen, op de eerste plek waar het past (T.gebouwPast). Zo zoekt de kolonist van de speeltest
  // (gereedschap/speeltest/kolonist.js), en zo zochten de mensen die om een gebouw vroegen (js/verzoeken.js, tot ronde 2).
  // Met een looppad rondom, zoals elk gebouw (T.GEBOUWEN_INSTELLINGEN.looppad, js/gebouwen.js; Marcel, 3 okt: "Nee ik wil
  // 3 tegels"). (Tot 16 okt kwam een put of een kapel waar hij de meeste huizen bereikte die er een wilden, js/wensen.js.)
  // Tijdens het zoeken staat iedereen stil (T.iedereenStil, js/wereld.js): wie er op een tegel staat, vraagt het dan in
  // één stap, voor elke tegel van de kaart.
  // Een huis of boerderij van een bouwstijl keert daar zijn deur naar de weg (T.keerNaarDeWeg, js/bouwstijl.js).
  T.plekVoor = function (D, soort, bij) {
    T.iedereenStil(true);
    try {
      const plek = zoekPlek(D, soort, bij) || zoekPlekOmTeRooien(D, soort, bij);
      if (plek) T.keerNaarDeWeg(D, soort, plek.x, plek.y);
      return plek;
    } finally {
      T.iedereenStil(false);
    }
  };
  function zoekPlek(D, soort, bij) {
    const vak = T.dorpVak(D);
    // De markt op het plein (js/markt.js): het midden van het plein, met de kramen.
    if (soort === 'markt') return T.marktPlek(D);
    // Wat bij de natuur hoort (een jager bij het bos, een visser aan het water; `bij` in js/gebouwen.js), zoekt over de
    // hele kaart: het bos kan verder liggen dan 44 tegels van wie het vraagt. Op een land van de maker van 100 bij 100
    // vroeg zo nooit iemand om een jager, en at het dorp zijn zaaigraan op (de speeltest van 4 okt; vraag 112). Eerst de
    // vraag of de natuur er ligt: die kost één stap (T.natuurBij), gebouwPast veel meer.
    const g = T.GEBOUWEN[soort];
    const natuur = g.bij ? T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet : null;
    const tot = natuur ? Math.max(45, vak.h, vak.b) : 45;
    const probeer = (x, y) => (!natuur || !T.waaromNietBijDeNatuur(D, soort, { x, y, b: natuur.b, h: natuur.h })) && T.gebouwPast(D, soort, x, y);
    // ring na ring om `bij`, en in elke ring van boven naar onder en van links naar rechts
    for (let r = 3; r < tot; r++) {
      for (let dy = -r; dy <= r; dy++) {
        const rand = Math.abs(dy) === r;
        for (let dx = -r; dx <= r; dx += rand ? 1 : 2 * r) {
          if (probeer(bij.x + dx, bij.y + dy)) return { x: bij.x + dx, y: bij.y + dy };
        }
      }
    }
    return null;
  }

  // Geen open grond meer (werklijst vraag 110, e; Marcel, 6 okt: "A ja B ja"): dan een plek waar wie het vraagt eerst
  // rooit (een boom, een stronk, een struik, onder de voet en in het looppad), met zo weinig mogelijk bomen, en dan het
  // dichtst bij `bij`. Wat bij de natuur hoort, zoekt over de hele kaart, de rest binnen 45 tegels, zoals hierboven.
  // Eerst wat er op elke plek te rooien staat (één stap per plek, T.watTeRooien), dan van de beste plek af of hij past.
  // Geeft { x, y, rooien: het stuk dat eerst vrij moet }, of null.
  function zoekPlekOmTeRooien(D, soort, bij) {
    const vak = T.dorpVak(D);
    const g = T.GEBOUWEN[soort];
    if (!g || soort === 'markt') return null;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet;
    const tot = g.bij ? Math.max(45, vak.h, vak.b) : 45;
    const plekken = [];
    for (let y = Math.max(vak.y, bij.y - tot); y < Math.min(vak.y + vak.h, bij.y + tot); y++) {
      for (let x = Math.max(vak.x, bij.x - tot); x < Math.min(vak.x + vak.b, bij.x + tot); x++) {
        const kavel = T.kavelVan(D, x, y, voet);
        const wat = T.watTeRooien(D, kavel);
        if (wat.bomen || wat.struiken) plekken.push({ x, y, kavel, bomen: wat.bomen, d: Math.hypot(x - bij.x, y - bij.y) });
      }
    }
    plekken.sort((a, b) => a.bomen - b.bomen || a.d - b.d);
    const plek = plekken.find((p) => !T.waaromPastHetNiet(D, soort, p.x, p.y, null, p.kavel));
    return plek ? { x: plek.x, y: plek.y, rooien: plek.kavel } : null;
  }
  T.plekOmTeRooien = zoekPlekOmTeRooien; // ook voor test/rooien.test.cjs
})(globalThis.Spel = globalThis.Spel || {});
