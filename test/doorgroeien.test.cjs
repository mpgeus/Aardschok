// Een huis dat niet kon doorgroeien (werklijst vraag 130; Marcel, 6 okt: "Eens alle 3"). Op een op de vier landen van de
// maker staat een hut waar het grotere huis niet past, meestal om één struik, en dan wint het dorp nooit. Nu rooit het
// gezin eerst wat in de weg staat (a), ook zijn eigen appelboom (a2); het briefje (c) en de raad (c2) zeggen waarom een
// huis niet kan groeien; en een erf komt niet waar het een huis elke vorm afneemt (d).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Een nieuw spel, stil en met een vaste worp: het ontworpen gehucht, of met `zaad` een land van de maker.
function spel(zaad = null, dag = 0) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  T.S = S;
  return S;
}

// Jij bouwt en er zijn geen voorvallen, met een vaste worp, en na afloop alles terug.
function zo(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('wieBouwt', 'jij');
  T.zetOptie('voorvallen', 'uit');
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (zoals test/rooien.test.cjs).
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
  }
}

// De hut van de maker die vastzit: een hut die alleen kan doorgroeien als het gezin eerst iets rooit.
const vastgezet = (D) => D.gebouwen.find((g) => g.soort === 'hut' && (T.groeiPlan(D, g, { mensen: false }) || {}).rooien);

// Een kleine wereld zoals in test/behoeften.test.cjs, met een huis van 3 bij 3 dat doorgroeit tot 6 bij 6 (twee soorten
// zonder tekening, zodat de toets niet van het vel afhangt), en het dorp tevreden genoeg om te groeien.
function kleineWereld(f) {
  T.GEBOUWEN._proefKlein = { naam: 'klein', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 1, wordt: '_proefGroot', maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  T.GEBOUWEN._proefGroot = { naam: 'groot', trede: 'gehucht', voet: { b: 6, h: 6 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 2, maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  try {
    const tegels = [];
    for (let y = 0; y < 30; y++) tegels.push(new Array(30).fill('vloer'));
    const S = { wereld: { b: 30, h: 30, tegels, voorwerpen: [] }, voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 4, woonruimte: 0, kalender: { dag: 0 }, behoeften: T.nieuweBehoeften() };
    const huis = { soort: '_proefKlein', x: 5, y: 5, klaar: true, klaarOp: 0, handen: 0, voorwerp: { soort: 'gebouw:_proefKlein', vel: null, id: null, beslaat: [3, 3] } };
    S.gebouwen.push(huis);
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) S.wereld.tegels[5 + dy][5 + dx] = 'muur';
    for (const [wat, n] of [['graan', 100000], ['groente', 1000], ['vis', 1000], ['vlees', 1000]]) T.zetVoorraad(S, wat, n);
    S.gebouwen.push({ soort: 'kapel', x: 20, y: 20, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
    return f(S, huis);
  } finally {
    delete T.GEBOUWEN._proefKlein;
    delete T.GEBOUWEN._proefGroot;
  }
}
// Iets uit de natuur op de kaart, zoals de kaart het neerzet: met een muur eronder, dus vast.
function zetNeer(S, soort, x, y) {
  T.zetVoorwerp(S.wereld, { soort, x, y, beslaat: [1, 1] });
  S.wereld.tegels[y][x] = 'muur';
  T.kaartVeranderd(S.wereld);
  return T.voorwerpOp(S.wereld, x, y);
}
function tikTot(S, tot) {
  while ((S.kalender.dag || 0) < tot) {
    S.kalender.dag = (S.kalender.dag || 0) + 1;
    T.tikGebouwenDag(S, S.kalender.dag);
  }
}

test('a: een huis dat alleen om een struik niet past, rooit hem eerst, en groeit dan', () => {
  kleineWereld((S, huis) => {
    zetNeer(S, 'struik', 9, 6); // in het grotere huis (5 tot 10), buiten het kleine (5 tot 7)
    assert.deepEqual(T.groeiPlan(S, huis), { tekening: null, voet: { b: 6, h: 6 }, rooien: [{ x: 9, y: 6 }] });
    tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen);
    assert.equal(huis.soort, '_proefKlein', 'het groeit nog niet');
    assert.equal(huis.rooitVoorGroei, true, 'het gezin rooit eerst');
    assert.deepEqual(huis.kavel, { x: 5, y: 5, b: 6, h: 6 }, 'de grond van het grotere huis');
    // Niemand rooit hier (een wereld zonder bewoners): na een maand doen de buren het, en de nacht erna groeit het.
    tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + T.BOS_INSTELLINGEN.rooiDagen);
    assert.equal(T.voorwerpOp(S.wereld, 9, 6), null, 'de struik is weg');
    assert.ok(!huis.rooitVoorGroei);
    tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + T.BOS_INSTELLINGEN.rooiDagen + 1);
    assert.equal(huis.soort, '_proefGroot');
  });
});

test('a: wat niet te rooien is (een rots), houdt het tegen, en dan zegt het plan waarom', () => {
  kleineWereld((S, huis) => {
    zetNeer(S, 'rots', 9, 6);
    assert.deepEqual(T.groeiPlan(S, huis), { reden: 'er staat een rots in de weg' });
    tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5);
    assert.equal(huis.soort, '_proefKlein');
    assert.ok(!huis.rooitVoorGroei, 'het rooit niets');
  });
});

test('a2: een appelboom laat een erf staan, maar het gezin kapt hem voor zijn grotere huis, voor 10 hout', () => {
  // Zonder sprokkelen (de spelregel "Het seizoen" op jij), zodat het hout alleen van de appelboom komt.
  T.zetOptie('seizoen', 'jij');
  try {
    kleineWereld((S, huis) => {
      const appel = zetNeer(S, 'appelboom', 8, 9);
      assert.equal(T.ontginWerkOp(S.wereld, 8, 9), null, 'een appelboom is van iemand: wie ontgint of een erf rooit, laat hem staan');
      assert.deepEqual(T.groeiPlan(S, huis).rooien, [{ x: 8, y: 9 }], 'maar hier is hij van het gezin zelf');
      tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen);
      assert.equal(appel.teKappen, true);
      assert.equal(T.ontginWerkOp(S.wereld, 8, 9), 'hakken', 'nu is hij een boom als elke andere');
      const hout = S.voorraad.hout || 0;
      tikTot(S, T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + T.BOS_INSTELLINGEN.rooiDagen + 1);
      assert.equal(T.voorwerpOp(S.wereld, 8, 9), null, 'om, en de stronk eruit');
      assert.equal((S.voorraad.hout || 0) - hout, T.BOS_INSTELLINGEN.houtPerBoom);
      assert.equal(huis.soort, '_proefGroot');
    });
  } finally {
    T.optiesTerug();
  }
});

test('a2: houdt het rooien op (er woont niemand meer), dan is de appelboom weer van iemand', () => {
  kleineWereld((S, huis) => {
    const appel = zetNeer(S, 'appelboom', 8, 9);
    T.rooiVoorGroei(S, huis, { x: 5, y: 5, b: 6, h: 6 }, [{ x: 8, y: 9 }]);
    assert.equal(appel.teKappen, true);
    T.stopRooienVoorGroei(S, huis);
    assert.ok(!appel.teKappen);
    assert.ok(!huis.rooitVoorGroei && !huis.kavel && huis.rooienTot == null);
    assert.equal(T.ontginWerkOp(S.wereld, 8, 9), null);
  });
});

test('a: het hoofd van het gezin rooit met de bijl, wie geen werk heeft helpt, en dan past het grotere huis', () => {
  zo(() => {
    const S = spel(62707, 1 + 7 / 24);
    const D = S.dorp;
    const hut = vastgezet(D);
    assert.ok(hut, 'op 62707 zit een hut van de maker vast');
    const plan = T.groeiPlan(D, hut, { mensen: false });
    const hoofd = D.bewoners.mensen.find((p) => p.huis === hut && !p.hoofd);
    assert.ok(hoofd && hoofd.wezen, 'er woont een gezin');
    T.rooiVoorGroei(D, hut, { x: hut.x, y: hut.y, b: plan.voet.b, h: plan.voet.h }, plan.rooien);
    assert.equal(T.rooitHij(hoofd), hut, 'het hoofd rooit');
    // Hier woont een oud stel, en wie oud is, helpt niet (T.helpAnker): een zoon zonder werk wel, een zoon met werk niet.
    const zoon = (werk) => ({ bewoner: { huis: hut, hoofd, leeftijd: 'volwassen', werk } });
    let gerooid = false;
    let geholpen = false;
    let naarZijnWerk = false;
    for (let dag = 1; dag <= 4 && hut.rooitVoorGroei; dag++) {
      for (let uur = 8; uur <= 17; uur += 0.5) {
        totUur(S, dag, uur);
        const e = hoofd.wezen;
        if (!e.werkt || (e.werkt.soort !== 'hakken' && e.werkt.soort !== 'rooien')) continue;
        gerooid = true;
        const a = T.helpAnker(D, zoon(null));
        if (a && a.x === e.tx && a.y === e.ty) geholpen = true;
        if (!T.helpAnker(D, zoon(D.gebouwen.find((g) => g.soort === 'herberg')))) naarZijnWerk = true;
      }
      totUur(S, dag + 1, 7);
    }
    assert.ok(gerooid, 'hij rooide');
    assert.ok(geholpen, 'wie geen werk heeft, helpt');
    assert.ok(naarZijnWerk, 'wie werk heeft, gaat daarheen');
    assert.ok(!hut.rooitVoorGroei, 'de grond is vrij');
    const nu = T.groeiPlan(D, hut, { mensen: false });
    assert.ok(nu.tekening && !nu.rooien && !nu.reden, 'en het grotere huis past');
  });
});

test('c: het briefje zegt wat het gezin eerst rooit, dat het eraan werkt, of waarom het huis niet kan groeien', () => {
  zo(() => {
    const S = spel(62707);
    const D = S.dorp;
    const hut = vastgezet(D);
    hut.wensen = { stand: 'keuters', mensen: 2, heeft: {}, alles: false, tevredenheid: 0.5 };
    const plan = T.groeiPlan(D, hut, { mensen: false });
    assert.equal(T.huisToestand(D, hut).groei.rooit, 'een struik');
    assert.equal(T.huisToestand(D, hut).groei.bezig, false);
    T.rooiVoorGroei(D, hut, { x: hut.x, y: hut.y, b: plan.voet.b, h: plan.voet.h }, plan.rooien);
    assert.equal(T.huisToestand(D, hut).groei.bezig, true);
    // Een muur op alle grond waar het kan groeien: dan kan het niet, en het briefje zegt waarom.
    T.stopRooienVoorGroei(D, hut);
    for (const h of T.groeiRuimte(D).filter((h) => h.g === hut)) for (const v of h.vormen) for (const t of v) if (!T.voorwerpOp(S.wereld, t.x, t.y)) S.wereld.tegels[t.y][t.x] = 'muur';
    T.kaartVeranderd(S.wereld);
    const groei = T.huisToestand(D, hut).groei;
    assert.equal(groei.waarom, 'er staat een muur in de weg');
    assert.equal(groei.rooit, undefined);
  });
});

test('c2: de raad zegt het als een huis dat alles heeft, niet kan groeien, en het genoeg mensen is voor de winst', () => {
  zo(() => {
    const S = spel(62707);
    const D = S.dorp;
    const raad = T.RADEN.find((r) => r.id === 'groeitNiet');
    const hut = vastgezet(D);
    hut.wensen = { stand: 'keuters', mensen: 2, heeft: {}, alles: true, tevredenheid: 1 };
    while (T.volgendeTrede(D)) D.trede = T.volgendeTrede(D);
    D.bevolking = T.EINDE_INSTELLINGEN.minstensMensen;
    assert.ok(T.maatGehaald(D));
    assert.ok(!raad.als(D), 'wat het gezin kan rooien, is geen reden');
    for (const h of T.groeiRuimte(D).filter((h) => h.g === hut)) for (const v of h.vormen) for (const t of v) if (!T.voorwerpOp(S.wereld, t.x, t.y)) S.wereld.tegels[t.y][t.x] = 'muur';
    T.kaartVeranderd(S.wereld);
    assert.ok(raad.als(D));
    assert.match(raad.tekst(D), /^Genoeg mensen voor de winst, maar de hut van \S+ kan geen huis worden: er staat een muur in de weg\.$/);
    hut.wensen.alles = false;
    assert.ok(!raad.als(D), 'een huis dat iets mist, wacht daar eerst op');
    hut.wensen.alles = true;
    D.bevolking = T.EINDE_INSTELLINGEN.minstensMensen - 1;
    assert.ok(!raad.als(D), 'nog niet genoeg mensen: dan zegt de raad wat er nog komt');
  });
});

test('d: geen erf waar het een huis elke vorm afneemt; wel als het nog een andere vorm kan nemen', () => {
  zo(() => {
    const S = spel(62707);
    const D = S.dorp;
    const maat = T.erfMaat();
    let geweigerd = null;
    for (let y = 0; y < S.wereld.tegels.length && !geweigerd; y++) {
      for (let x = 0; x < S.wereld.tegels[0].length && !geweigerd; x++) {
        const reden = T.waaromPastErfNiet(D, x, y);
        if (reden && reden.startsWith('Hier groeit')) geweigerd = { x, y, reden };
      }
    }
    assert.ok(geweigerd, 'naast een hut die nog moet groeien, komt geen erf');
    assert.match(geweigerd.reden, /^Hier groeit de hut van \S+ straks tot een huis\.$/);
    assert.equal(T.legErfAan(D, geweigerd.x, geweigerd.y).gelukt, false);
    // Het ontworpen gehucht: een erf op 48, 50 neemt de hut ernaast een paar vormen af, maar niet alle. Dat mag, en de hut
    // kan daarna nog groeien.
    const S2 = spel();
    const D2 = S2.dorp;
    const buur = T.groeiRuimte(D2).find((h) => h.vormen.some((v) => v.some((t) => t.x >= 48 && t.x < 48 + maat.b && t.y >= 50 && t.y < 50 + maat.h)));
    assert.ok(buur, 'het erf raakt de grond van een hut');
    assert.equal(T.waaromPastErfNiet(D2, 48, 50), null);
    assert.ok(T.legErfAan(D2, 48, 50).gelukt);
    T.kaartVeranderd(S2.wereld);
    const plan = T.groeiPlan(D2, buur.g, { mensen: false });
    assert.ok(plan.tekening && !plan.reden, 'de hut kan nog groeien');
  });
});

test('bewaren en laden houdt het rooien voor een groter huis, en de appelboom die eraan gaat', () => {
  zo(() => {
    const S = spel(62707);
    const D = S.dorp;
    const hut = vastgezet(D);
    const plan = T.groeiPlan(D, hut, { mensen: false });
    const kavel = { x: hut.x, y: hut.y, b: plan.voet.b, h: plan.voet.h };
    // Een appelboom erbij, op de grond van het grotere huis, waar nu niets staat.
    let plek = null;
    for (let y = kavel.y; y < kavel.y + kavel.h && !plek; y++) {
      for (let x = kavel.x; x < kavel.x + kavel.b && !plek; x++) if (!T.isVast(S.wereld, x, y) && !T.voorwerpOp(S.wereld, x, y)) plek = { x, y };
    }
    zetNeer(S, 'appelboom', plek.x, plek.y);
    T.rooiVoorGroei(D, hut, kavel, [...plan.rooien, plek]);
    const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
    const S2 = spel(62707);
    assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
    const hut2 = S2.dorp.gebouwen.find((g) => g.x === hut.x && g.y === hut.y && g.soort === 'hut');
    assert.equal(hut2.rooitVoorGroei, true);
    assert.deepEqual(hut2.kavel, kavel);
    assert.equal(hut2.rooienTot, hut.rooienTot);
    assert.equal(T.voorwerpOp(S2.wereld, plek.x, plek.y).teKappen, true);
    assert.equal(T.ontginWerkOp(S2.wereld, plek.x, plek.y), 'hakken');
  });
});
