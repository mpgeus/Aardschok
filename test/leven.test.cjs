// Ouder worden, geboren worden en sterven (js/leven.js; werklijst vraag 145; Marcel, 9 okt: "mensen moeten ook ouder
// kunnen worden", en "1. C 2. Ja 3. Ja").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });
const IN = new Proxy({}, { get: (_, k) => T.LEVEN_INSTELLINGEN[k] });
const JAAR = T.DAGEN_PER_JAAR;

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
  return S;
}
const begin = (fase) => ['kleuter', 'kind', 'jong', 'volwassen', 'oud'].slice(0, ['kleuter', 'kind', 'jong', 'volwassen', 'oud'].indexOf(fase)).reduce((n, f) => n + IN.fasen[f], 0) * JAAR;

test('wie er al was, krijgt een geboortedag in zijn fase; de schout en de boeren niet', () => {
  const S = gehucht();
  const D = S.dorp;
  T.tikLevenDag(D, 0);
  for (const p of D.bewoners.mensen) {
    if (!T.wordtOuder(p)) {
      assert.equal(p.geboren, undefined, `${p.naam || p.wie} wordt niet ouder`);
      continue;
    }
    const dagen = 0 - p.geboren;
    assert.ok(dagen >= begin(p.leeftijd) && dagen <= begin(p.leeftijd) + IN.fasen[p.leeftijd] * JAAR, `${p.naam} is ${p.leeftijd}`);
  }
  assert.ok(D.bewoners.mensen.some((p) => p.schout) && D.bewoners.mensen.some((p) => p.wie));
});

test('een kleuter wordt een kind, met het vel en de snelheid van een kind, en de handen gaan mee', () => {
  const S = gehucht();
  const D = S.dorp;
  T.tikLevenDag(D, 0);
  const p = D.bewoners.mensen.find((x) => x.leeftijd === 'kleuter' && T.wordtOuder(x));
  assert.ok(p, 'er is een kleuter');
  p.geboren = -begin('kind') + 1; // morgen is hij een kind
  T.tikLevenDag(D, 0);
  assert.equal(p.leeftijd, 'kleuter');
  T.tikLevenDag(D, 1);
  assert.equal(p.leeftijd, 'kind');
  assert.equal(p.wezen.vel, T.LEEFTIJDEN.kind[p.geslacht]);
  assert.equal(p.wezen.snelheid, T.BEWONERS_INSTELLINGEN[T.LEEFTIJDEN.kind.snelheid]);
});

test('wie oud is, sterft na zijn jaren van ouderdom', () => {
  const S = gehucht();
  const D = S.dorp;
  T.tikLevenDag(D, 0);
  const p = D.bewoners.mensen.find((x) => x.leeftijd === 'oud' && T.wordtOuder(x));
  assert.ok(p, 'er is een oude');
  const voor = D.bevolking;
  p.geboren = -(begin('oud') + IN.fasen.oud * JAAR + IN.sterftBinnen * JAAR) - 1;
  T.tikLevenDag(D, 0);
  assert.equal(D.bevolking, voor - 1);
  assert.ok(!D.bewoners.mensen.includes(p));
  assert.ok(D.dagboek.regels.some((g) => g.soort === 'mensen' && g.reden === 'ouderdom'));
});

test('een gezin met een vader en een moeder krijgt een kind als er plaats is, en niet zonder plaats', () => {
  const S = gehucht();
  const D = S.dorp;
  T.tikLevenDag(D, 0);
  const kans = IN.geboorte.kans;
  T.LEVEN_INSTELLINGEN.geboorte.kans = JAAR * 2; // elke dag
  try {
    const moeders = () => D.bewoners.mensen.filter((p) => p.geslacht === 'vrouw' && p.leeftijd === 'volwassen' && !p.wie && T.plaatsInHuis(D, p.huis) > 0);
    const moeder = moeders()[0];
    assert.ok(moeder, 'er is een moeder met plaats');
    const voor = D.bevolking;
    T.tikLevenDag(D, 1);
    assert.ok(D.bevolking > voor);
    const kind = D.bewoners.mensen.find((p) => p.geboren === 1);
    assert.ok(kind, 'er is een kind geboren');
    assert.equal(kind.leeftijd, 'kleuter');
    assert.ok(D.bewoners.mensen.some((m) => m.gezin === kind.gezin && m.huis === kind.huis && m !== kind));
    assert.ok(kind.wezen, 'het kind heeft een poppetje');
    // Vol: geen kind meer
    for (const g of D.gebouwen) while (T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].woonruimte && T.plaatsInHuis(D, g) > 0) T.wijzigBevolking(D, 1, 'groei');
    const nu = D.bevolking;
    T.tikLevenDag(D, 2);
    assert.equal(D.bevolking, nu);
  } finally {
    T.LEVEN_INSTELLINGEN.geboorte.kans = kans;
  }
});

test('met de spelregel uit wordt niemand ouder', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetOptie('ouderWorden', 'uit');
  try {
    const voor = D.bewoners.mensen.map((p) => p.leeftijd).join();
    for (let d = 0; d < 5 * JAAR; d += 30) T.tikLevenDag(D, d);
    assert.equal(D.bewoners.mensen.map((p) => p.leeftijd).join(), voor);
    assert.ok(D.bewoners.mensen.every((p) => p.geboren == null));
  } finally {
    T.zetOptie('ouderWorden', 'aan');
  }
});
