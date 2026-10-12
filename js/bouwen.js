// Meebouwen (werklijst vraag 152, 1d; Marcel, 11 okt: "d ja", en bij het plan voor stap 1: "bouwen met handen (wie geen
// werk heeft, bouwt mee, en hoe meer handen, hoe sneller)"): in het lege begin rijst een gebouw niet vanzelf op in zijn
// bouwtijd, maar bouwen de mensen het. Een gebouw vraagt zijn bouwtijd keer `werkPerBouwdag` werkdagen. Elke ochtend
// kiest het dorp wie vandaag bouwt: wie kan werken en geen werk heeft (zoals de dagloners in js/veldwerk.js), hooguit
// `perPlaats` per bouwplaats, de bouwplaatsen in de volgorde waarin je ze neerzette. Elke bouwer doet er per dag één
// werkdag aan; zonder bouwers staat het stil. Elke man in een werkplaats is dus een bouwer minder.
//
// Staat er iets op de plek (de voet en het looppad eromheen, de kavel, T.kavelVan in js/bos.js), dan rooien de bouwers
// dat eerst (Marcel, 11 okt: "a1"): een boom omhakken en zijn stobbe eruit kost `rooiBoom` werkdagen, een struik, een
// stronk of een boompje `rooiStruik`, en een boom geeft zijn hout, wie hem ook omhakt (T.hakBoom, js/bos.js). Tot de
// kavel vrij is, staat het gebouw nog niet op de kaart (`wachtOpRooien`, zoals een werkplaats die een inwoner vroeg), en
// js/tekenen.js laat zijn voet zien.
//
// De regel is de nacht (T.tikBouwenDag): het werk van gisteren, van wie er gisteren bouwde. Overdag laten de beelden
// hetzelfde eerder zien (T.werkBouwenBij): het werk van vandaag naar hoe ver de werkdag is, zodat een boom valt terwijl
// ze hakken; en de bouwers lopen erheen en werken er met de bijl. Wat de beelden vandaag al deden (`vandaag`), doet de
// nacht niet nog eens, dus met of zonder beelden komt er hetzelfde uit (de toetsen spelen zonder).
//
//   g.bouw    { werk, gedaan, tegoed, vandaag, hout }: `werk` is wat het bouwen vraagt en `gedaan` wat er al gebouwd
//             is (in werkdagen, zonder het rooien); `tegoed` wat er al aan het rooien gedaan is maar nog geen hele tegel
//             was; `vandaag` wat de beelden vandaag al deden; `hout` wat het rooien opbracht (voor het bericht).
//   p.bouwt   de bouwplaats waar deze bewoner vandaag aan bouwt.
//   e.werkt   { soort: 'hakken' | 'bouwen', x, y, op, tot, rust, bouw }: een bouwer aan het werk, op (x, y), naar `op`
//             toe (de boom of de voet); js/sprites.js kiest er de hakker bij.
// Regels zonder scherm, dus te toetsen (test/begin.test.cjs).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank van de spelregels, js/opties.js).
  T.BOUWEN_INSTELLINGEN = {
    // Een gebouw vraagt zijn bouwtijd keer zoveel werkdagen: een hut (bouwtijd 2) 4, het huis van de schout (4) 8.
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
  };
  const IN = () => T.BOUWEN_INSTELLINGEN;

  // Bouwen de mensen zelf? In het lege begin (js/begin.js); in het gehucht dat er al was, rijst een gebouw vanzelf op.
  T.bouwenMetHanden = (D) => !!(D && D.begin);

  // Hoeveel werkdagen het bouwen van deze soort vraagt, zonder het rooien; een veld naar zijn tegels (`voet`).
  T.bouwWerkVan = (soort, voet) => (T.isVeldSoort(soort)
    ? Math.round(voet.b * voet.h * IN().veldWerk[soort] * 100) / 100
    : T.GEBOUWEN[soort].bouwtijd * IN().werkPerBouwdag);

  // Het stuk dat de bouwers eerst rooien als dit gebouw op (x, y) komt: zijn voet met het looppad eromheen (T.kavelVan,
  // js/bos.js), of null als de mensen niet zelf bouwen. Eén vraag voor de muis (js/main.js) en de klik (T.plaatsGebouw).
  T.bouwKavel = function (D, soort, x, y) {
    if (!T.bouwenMetHanden(D) || !T.GEBOUWEN[soort]) return null;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort));
    return voet ? T.kavelVan(D, x, y, voet) : null;
  };

  // Een nieuw gebouw dat de mensen zelf bouwen (T.plaatsGebouw, js/gebouwen.js): het wacht op zijn werk, niet op een dag.
  // Moet er eerst gerooid worden, dan staat het nog niet op de kaart.
  T.zetBouwplaats = function (D, instantie, kavel) {
    const rooien = !!(kavel && T.teRooienOp(D, kavel).length);
    Object.assign(instantie, { klaar: false, klaarOp: null, bouw: { werk: T.bouwWerkVan(instantie.soort, instantie.voet), gedaan: 0, tegoed: 0, vandaag: 0, hout: 0 } });
    if (rooien) Object.assign(instantie, { wachtOpRooien: true, kavel });
    return instantie;
  };

  const bouwplaatsen = (D) => (D.gebouwen || []).filter((g) => g.bouw && !g.klaar);

  // Wat een tegel van de kavel aan rooien kost, in werkdagen.
  const rooiKost = (D, t) => (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken' ? IN().rooiBoom : IN().rooiStruik);

  // Werk aan een bouwplaats (in werkdagen): eerst het rooien, tegel voor tegel in de volgorde van de kavel, en wat over is
  // naar het bouwen. Is de kavel vrij, dan komt het gebouw op de kaart; is het werk af, dan is hij vannacht klaar
  // (T.tikGebouwenDag zet hem dan op klaar, zoals elk gebouw).
  function werkAan(D, g, werk, dag) {
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
        T.rooiTegel(D, t);
      }
      if (T.teRooienOp(D, g.kavel).length) return;
      over = B.tegoed;
      B.tegoed = 0;
      g.wachtOpRooien = false;
      const gebouw = T.hoofdletter(T.GEBOUWEN[g.soort].naam);
      // Een veld komt niet als gebouw op de kaart: het wordt land als het af is (js/boerderij.js).
      if (T.isVeldSoort(g.soort)) {
        T.zeg(D, B.hout
          ? T.t('{gebouw}: the ground is cleared (+{hout} wood), and now they work it.', { gebouw, hout: B.hout })
          : T.t('{gebouw}: the ground is cleared, and now they work it.', { gebouw }));
      } else {
        T.zetOpDeKaart(D, g);
        T.zeg(D, B.hout
          ? T.t('{gebouw}: the site is cleared (+{hout} wood), and now they build.', { gebouw, hout: B.hout })
          : T.t('{gebouw}: the site is cleared, and now they build.', { gebouw }));
      }
    }
    B.gedaan = Math.min(B.werk, B.gedaan + over);
    if (g.voorwerp) g.voorwerp.voortgang = B.gedaan / B.werk;
    if (B.gedaan >= B.werk - 1e-9) g.klaarOp = dag;
  }

  // Wie er vandaag aan deze bouwplaats bouwt (en het nog kan).
  const bouwersVan = (D, g) => D.bewoners.mensen.filter((p) => p.bouwt === g && T.kanWerken(p) && !p.werk);

  // Elke nacht (T.tikGebouwenDag, vóór de gebouwen die klaarkomen): het werk van gisteren, voor wie er gisteren bouwde, min
  // wat de beelden al deden. Niet na een hele feestdag (js/feesten.js), want toen werkte niemand.
  T.tikBouwenDag = function (D, dag) {
    if (!T.bouwenMetHanden(D) || !D.bewoners) return;
    const gisteren = dag - 1;
    const vrij = gisteren >= 0 && T.vrijeDag(D, gisteren);
    for (const g of bouwplaatsen(D)) {
      const werk = vrij ? 0 : bouwersVan(D, g).length;
      if (werk > g.bouw.vandaag) werkAan(D, g, werk - g.bouw.vandaag, dag);
      g.bouw.vandaag = 0;
    }
  };

  // Elke ochtend (T.tikGebouwenDag, na het verdelen van de handen): wie vandaag bouwt. Wie kan werken, groot genoeg is
  // (volwassen, of een grote zoon of dochter), geen werk heeft en geen dagloner is, gaat naar de eerste bouwplaats met
  // plaats, de dichtsten bij zijn deur eerst. Net als de handen (T.verdeelHanden) zonder te vragen of zijn poppetje er al
  // is: wie nog over de weg komt, telt mee (zonder beelden komt hij nooit aan).
  T.kiesBouwers = function (D) {
    const B = D.bewoners;
    if (!B || !B.mensen) return;
    for (const p of B.mensen) if (p.bouwt) p.bouwt = null;
    if (!T.bouwenMetHanden(D)) return;
    const vrij = B.mensen.filter((p) => T.kanWerken(p) && !p.werk && !p.dagloner && (p.leeftijd === 'volwassen' || p.leeftijd === 'jong'));
    const deur = (p) => (p.wezen && p.wezen.thuis) || (p.huis && T.deurVan(D.wereld, p.huis)) || { x: 0, y: 0 };
    for (const g of bouwplaatsen(D)) {
      const r = g.wachtOpRooien ? g.kavel : T.voetVanGebouw(g);
      const midden = { x: r.x + r.b / 2, y: r.y + r.h / 2 };
      vrij.sort((p, q) => T.afstand(deur(p), midden) - T.afstand(deur(q), midden));
      for (const p of vrij.splice(0, IN().perPlaats)) p.bouwt = g;
      if (!vrij.length) break;
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Overdag, elk beeld
  // ---------------------------------------------------------------------------------------------

  // Hoe ver de werkdag van vandaag is, van 0 tot 1 (js/dag.js).
  function werkdagGedaan(D) {
    const dag = D.kalender.dag;
    const d = T.dagindeling(dag);
    const eind = T.isOogstDag(dag) ? d.werkEindOogst : d.werkEind;
    if (!(eind > d.werkBegin)) return 0;
    return Math.max(0, Math.min(1, (T.uurVanDag(dag) - d.werkBegin) / (eind - d.werkBegin)));
  }
  const uur = () => (T.DAG_LENGTE || 300) / 24;

  // Elk beeld (T.werkDorpBij, js/dorp.js): het werk van vandaag tot nu, en de bouwers aan het werk. In de werkuren loopt
  // elke bouwer naar een tegel naast wat er nu te doen is (de dichtste boom op de kavel, of de voet), en werkt daar; buiten
  // de werkuren, of als hij iets anders moet, houdt hij op (T.stopWerk, js/veldwerk.js), en neemt het ritme van de dag
  // het over (T.dwaal).
  T.werkBouwenBij = function (S, D) {
    if (!T.bouwenMetHanden(D) || !D.bewoners || !D.kalender || !D.wereld) return;
    const dag = D.kalender.dag;
    const werktijd = T.dagdeelVan(dag, T.isOogstDag(dag)) === 'werk' && !T.vrijeDag(D, dag);
    const plaatsen = bouwplaatsen(D);
    if (werktijd) {
      const f = werkdagGedaan(D);
      for (const g of plaatsen) {
        const doel = bouwersVan(D, g).length * f;
        if (doel > g.bouw.vandaag + 1e-6) {
          werkAan(D, g, doel - g.bouw.vandaag, Math.floor(dag) + 1);
          g.bouw.vandaag = doel;
        }
      }
    }
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
    const soort = g.wachtOpRooien ? 'hakken' : 'bouwen';
    // nog te doen: de boom waar hij naar kijkt, of de voet
    const opNogTeDoen = (op) => (soort === 'hakken' ? !!T.ontginWerkOp(w, op.x, op.y) : true);
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
    const alle = soort === 'hakken' ? T.teRooienOp(D, g.kavel) : randVan(T.voetVanGebouw(g));
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
    if (g.wachtOpRooien) {
      return n
        ? T.t('{gebouw}: {n|# builder clears|# builders clear} the site first: {wat}.', { gebouw, n, wat: T.rooiWoordenOp(D, g.kavel) })
        : T.t('{gebouw}: the site still has to be cleared ({wat}), and everyone has other work.', { gebouw, wat: T.rooiWoordenOp(D, g.kavel) });
    }
    const gedaan = Math.floor(g.bouw.gedaan);
    return n
      ? T.t('{gebouw}: {n|# builder|# builders}, {gedaan} of {werk} workdays done.', { gebouw, n, gedaan, werk: g.bouw.werk })
      : T.t('{gebouw}: {gedaan} of {werk} workdays done; nobody is building, everyone has other work.', { gebouw, gedaan, werk: g.bouw.werk });
  };

  // ---------------------------------------------------------------------------------------------
  // Waar een gebouw komt (tot ronde 2 van het snoeien, 12 okt, in js/verzoeken.js)
  // ---------------------------------------------------------------------------------------------

  // Een plek met een kring (een put, een kapel; js/wensen.js): de kring telt de huizen die hij bereikt.
  const heeftKring = (soort) => T.WENSEN_INSTELLINGEN.kring[soort] != null;

  // Waar een gebouw van deze soort komt, zoals wie het wil bouwen het kiest: { x, y }, of null. Een plek met een kring (een
  // put, een kapel; js/wensen.js): waar hij de meeste huizen bereikt die er nog geen hebben (T.kringTeller), bij
  // gelijk spel het dichtst bij `bij` (met `zonder`: hoeveel); bereikt hij nergens zo'n huis, dan nergens. De rest: zo
  // dicht mogelijk bij `bij`
  // (een deur), in ringen, op de eerste plek waar het past (T.gebouwPast). Zo zoekt de kolonist van de speeltest
  // (gereedschap/speeltest/kolonist.js), en zo zochten de mensen die om een gebouw vroegen (js/verzoeken.js, tot ronde 2). Met een looppad rondom, zoals elk gebouw
  // (T.GEBOUWEN_INSTELLINGEN.looppad, js/gebouwen.js; Marcel, 3 okt: "Nee ik wil 3 tegels").
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
    const w = D.wereld;
    // De markt op het plein (js/markt.js): het midden van het plein, met de kramen.
    if (soort === 'markt' && T.marktOpHetPlein(D)) return T.marktPlek(D);
    if (heeftKring(soort)) {
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      const kring = T.kringTeller(D, soort);
      let beste = null;
      for (let y = 0; y < w.tegels.length; y++) {
        for (let x = 0; x < w.tegels[0].length; x++) {
          // Eerst wat de plek bereikt (tellen), en alleen als hij beter is dan de beste tot nu toe, of hij past (duur).
          const zonder = kring({ x, y, b: voet.b, h: voet.h }).zonder;
          const d = Math.hypot(x - bij.x, y - bij.y);
          if (!(zonder > 0) || (beste && (zonder < beste.zonder || (zonder === beste.zonder && d >= beste.d)))) continue;
          if (T.gebouwPast(D, soort, x, y)) beste = { x, y, d, zonder };
        }
      }
      return beste && { x: beste.x, y: beste.y, zonder: beste.zonder };
    }
    // Wat bij de natuur hoort (een jager bij het bos, een visser aan het water; `bij` in js/gebouwen.js), zoekt over de
    // hele kaart: het bos kan verder liggen dan 44 tegels van wie het vraagt. Op een land van de maker van 100 bij 100
    // vroeg zo nooit iemand om een jager, en at het dorp zijn zaaigraan op (de speeltest van 4 okt; vraag 112). Eerst de
    // vraag of de natuur er ligt: die kost één stap (T.natuurBij), gebouwPast veel meer.
    const g = T.GEBOUWEN[soort];
    const natuur = g.bij ? T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet : null;
    const tot = natuur ? Math.max(45, w.tegels.length, w.tegels[0].length) : 45;
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
  // Een plek met een kring (een put, een kapel) moet net als hierboven de huizen bereiken die er nog geen hebben, de
  // meeste eerst, en zoekt dus ook over de hele kaart: in de speeltest van 6 okt kwam er anders elke maand een put bij het
  // hart van het dorp, terwijl de hut die erom vroeg er niets aan had (op 72022 48 putten in vier jaar).
  // Eerst wat er op elke plek te rooien staat (één stap per plek, T.watTeRooien), dan van de beste plek af of hij past.
  // Geeft { x, y, rooien: het stuk dat eerst vrij moet }, of null.
  function zoekPlekOmTeRooien(D, soort, bij) {
    const w = D.wereld;
    const g = T.GEBOUWEN[soort];
    if (!g || soort === 'markt') return null;
    const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || g.voet;
    const kring = heeftKring(soort) ? T.kringTeller(D, soort) : null;
    const tot = g.bij || kring ? Math.max(45, w.tegels.length, w.tegels[0].length) : 45;
    const plekken = [];
    for (let y = Math.max(0, bij.y - tot); y < Math.min(w.tegels.length, bij.y + tot); y++) {
      for (let x = Math.max(0, bij.x - tot); x < Math.min(w.tegels[0].length, bij.x + tot); x++) {
        const zonder = kring ? kring({ x, y, b: voet.b, h: voet.h }).zonder : 0;
        if (kring && !(zonder > 0)) continue;
        const kavel = T.kavelVan(D, x, y, voet);
        const wat = T.watTeRooien(D, kavel);
        if (wat.bomen || wat.struiken) plekken.push({ x, y, kavel, zonder, bomen: wat.bomen, d: Math.hypot(x - bij.x, y - bij.y) });
      }
    }
    plekken.sort((a, b) => b.zonder - a.zonder || a.bomen - b.bomen || a.d - b.d);
    const plek = plekken.find((p) => !T.waaromPastHetNiet(D, soort, p.x, p.y, null, p.kavel));
    return plek ? { x: plek.x, y: plek.y, rooien: plek.kavel } : null;
  }
  T.plekOmTeRooien = zoekPlekOmTeRooien; // ook voor test/rooien.test.cjs

  // Kan hier een gebouw van deze soort komen (met `voet` zijn voet), op open grond of nadat wie het vraagt er rooit, zoals
  // hierboven? Wie er nu staat, telt niet: die is morgen weg. Voor de plekken waar nog een put kan komen (T.kringGrond,
  // js/wensen.js).
  T.kanHierKomen = function (D, soort, x, y, voet) {
    if (!T.waaromPastHetNiet(D, soort, x, y, null, null, false)) return true;
    const kavel = T.kavelVan(D, x, y, voet);
    const wat = T.watTeRooien(D, kavel);
    return !!(wat.bomen || wat.struiken) && !T.waaromPastHetNiet(D, soort, x, y, null, kavel, false);
  };
})(globalThis.Spel = globalThis.Spel || {});
