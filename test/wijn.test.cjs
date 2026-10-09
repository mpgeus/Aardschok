// De wijnboerderij (werklijst vraag 136; Marcel, 8 okt: "Ik wil z.s.m. aan een wijnboerderij", en "Wijn wordt drank, zoals
// bier. Mensen dronken geen water"): een boerderij met een gezin en wijngaarden, de pluk in wijnmaand, wijn als drank, en
// de heer wil er wijn voor.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, stil en met een vaste worp, met een wijnboerderij die klaar is; jij bouwt.
function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 7;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  const D = S.dorp;
  T.zetOptie('wieBouwt', 'jij');
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'wijnboerderij', T.deurVan(D.wereld, huis));
  assert.ok(plek, 'er is plaats voor een wijnboerderij');
  const u = T.plaatsGebouw(D, 'wijnboerderij', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  u.instantie.klaar = true;
  return { S, D, g: u.instantie };
}

const eersteVan = (maand) => T.MAANDEN.findIndex((m) => m.naam === maand);
function dagIn(maand, dagVanMaand = 10) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (x.maand === eersteVan(maand) && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (zoals in test/veldwerk.test.cjs).
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

test('de wijngaard: het huis is vast, de ranken staan in rijen met een pad ertussen, en bouwen kan er niet', () => {
  const { D, g } = gehucht();
  try {
    const IN = T.WIJNGAARD_INSTELLINGEN;
    const ranken = T.rankenVan(D, g);
    assert.ok(ranken.length >= 15, `${ranken.length} ranken`);
    for (const v of ranken) {
      assert.ok(v.x >= g.x + IN.stuk.x && v.x < g.x + IN.stuk.x + IN.stuk.b && v.y >= g.y && v.y < g.y + IN.stuk.h, 'in de wijngaard');
      assert.equal((v.y - g.y - IN.stuk.y) % IN.rijOm, 0, 'in een rij');
      assert.ok(T.isBegaanbaar(D.wereld, v.x, v.y + 1) || v.y + 1 >= g.y + IN.stuk.h, 'met een pad ernaast');
    }
    assert.ok(T.isVast(D.wereld, g.x, g.y), 'het huis is vast');
    assert.ok(T.waaromNietOpDezeGrond(D, g.x + IN.stuk.x, g.y + 1), 'op het pad in de wijngaard bouw je niet');
  } finally {
    T.optiesTerug();
  }
});

test('een rank door het jaar: kaal, blad, vol, en leeg als hij geplukt is', () => {
  const v = { soort: 'wijnrank', geplukt: null };
  assert.equal(T.rankStand(v, dagIn('louwmaand')), 'kaal');
  assert.equal(T.rankStand(v, dagIn('zomermaand')), 'blad');
  assert.equal(T.rankStand(v, dagIn('wijnmaand')), 'vol');
  T.plukRank(v, dagIn('wijnmaand'));
  assert.equal(T.rankStand(v, dagIn('wijnmaand', 20)), 'leeg', 'geplukt');
  assert.equal(T.rankStand(v, dagIn('wijnmaand') + T.DAGEN_PER_JAAR), 'vol', 'het jaar erna weer vol');
  assert.equal(T.rankStand({ geplukt: null }, dagIn('slachtmaand')), 'leeg', 'na de pluk is wat er hing, verloren');
});

test('in wijnmaand plukt het gezin dat er woont, en de wijn is er pas als de mand binnen is', () => {
  const dag = dagIn('wijnmaand', 3);
  const { S, D, g } = gehucht();
  const uren = T.BEWONERS_INSTELLINGEN.werkInUren;
  try {
    T.zetOptie('voorvallen', 'uit');
    // Twee volwassenen van het dorp gaan in de wijnboerderij wonen.
    const wie = D.bewoners.mensen.filter((p) => p.wezen && !p.schout && !p.wie && !T.isBoer(p.wezen) && T.LEEFTIJDEN[p.leeftijd].werkt != null).slice(0, 2);
    assert.equal(wie.length, 2);
    for (const p of wie) p.huis = g;
    S.kalender.dag = dag + 6 / 24;
    D.gebouwenDag = dag;
    T.zetVoorraad(D, 'wijn', 0);
    T.tikWijngaardDag(D, dag);
    assert.ok(g.plukt, 'het gezin plukt');
    totUur(S, dag, 17);
    const geplukt = T.rankenVan(D, g).filter((v) => T.rankStand(v, S.kalender.dag) === 'leeg').length;
    assert.ok(geplukt >= T.WIJNGAARD_INSTELLINGEN.mand, `${geplukt} ranken geplukt`);
    const inDeMand = wie.reduce((n, p) => n + (p.wezen.mand || 0), 0);
    assert.equal(D.voorraad.wijn, (geplukt - inDeMand) * T.WIJNGAARD_INSTELLINGEN.wijnPerRank, 'binnen is wat in het huis is');
    // 's Nachts gaat wat nog in de mand zat, mee naar huis.
    T.tikWijngaardDag(D, dag);
    assert.equal(D.voorraad.wijn, geplukt * T.WIJNGAARD_INSTELLINGEN.wijnPerRank);
  } finally {
    T.BEWONERS_INSTELLINGEN.werkInUren = uren;
    T.optiesTerug();
  }
});

test('er woont een gezin van boeren, en de heer wil er wijn voor', () => {
  const { D, g } = gehucht();
  try {
    assert.equal(T.standVan(g), 'boeren');
    assert.ok(T.GEBOUWEN.wijnboerderij.woonruimte > 0);
    assert.ok(T.GEBOUWEN.wijnboerderij.heer.wijn > 0);
    assert.equal(T.GEBOUWEN.wijnboerderij.trede, 'dorp', 'pas in een dorp');
  } finally {
    T.optiesTerug();
  }
});

test('wijn is drank: wie bier wil, neemt wijn als er geen bier is', (t) => {
  // Het dorp als geheel; per huis, met een beurs, staat in test/geld.test.cjs.
  T.zetOptie('geld', 'beurzen');
  t.after(() => T.optiesTerug());
  assert.deepEqual(T.WENSEN.bier.goed, ['bier', 'wijn']);
  assert.equal(T.WENSEN.bier.naam, 'drank');
  const D = { voorraad: T.nieuweVoorraad() };
  T.zetVoorraad(D, 'bier', 0);
  T.zetVoorraad(D, 'wijn', 10);
  const wensen = { goederen: { bier: { dorpelingen: { krijgt: 3 } } } };
  T.gebruikGoederen(D, wensen);
  assert.equal(D.voorraad.wijn, 7, 'drie wijn gedronken');
});
