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

test('de wijnboerderij plukt in wijnmaand, en de rest van het jaar maakt hij niets', () => {
  const { D, g } = gehucht();
  const uren = T.BEWONERS_INSTELLINGEN.werkInUren;
  T.BEWONERS_INSTELLINGEN.werkInUren = false;
  try {
    const soort = T.GEBOUWEN.wijnboerderij;
    assert.ok(T.stilOp(soort, dagIn('bloeimaand')), 'in bloeimaand is het geen pluktijd');
    assert.equal(T.stilOp(soort, dagIn('wijnmaand')), null, 'in wijnmaand wel');
    for (const [maand, wijn] of [['bloeimaand', false], ['wijnmaand', true]]) {
      const dag = dagIn(maand);
      D.kalender.dag = dag + 0.3;
      T.zetVoorraad(D, 'wijn', 0);
      T.tikGebouwenDag(D, dag);
      assert.equal((D.voorraad.wijn || 0) > 0, wijn, `${maand}: ${D.voorraad.wijn} wijn, ${g.handen} handen, ${g.stilWant}`);
    }
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

test('wijn is drank: wie bier wil, neemt wijn als er geen bier is', () => {
  assert.deepEqual(T.WENSEN.bier.goed, ['bier', 'wijn']);
  assert.equal(T.WENSEN.bier.naam, 'drank');
  const D = { voorraad: T.nieuweVoorraad() };
  T.zetVoorraad(D, 'bier', 0);
  T.zetVoorraad(D, 'wijn', 10);
  const wensen = { goederen: { bier: { dorpelingen: { krijgt: 3 } } } };
  T.gebruikGoederen(D, wensen);
  assert.equal(D.voorraad.wijn, 7, 'drie wijn gedronken');
});
