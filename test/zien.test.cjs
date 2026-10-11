// Het licht in het dorp (js/zien.js; werklijst vraag 108, d, en 125, C): de lantaarns die 's avonds branden en de lantaarn
// van de schout. Het zichtveld en de getuigen (wie de schout zag verstoppen, 27 sep) zijn er sinds 11 okt uit (vraag 151).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const HERFST = dagVan('wijnmaand', 10);
const WINTER = dagVan('louwmaand', 5);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht, met een vast zaad (zoals test/herberg.test.cjs), op een uur dat de toets kiest.
function gehucht(dag) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  const echtLot = T.lootBoeren;
  console.warn = () => {};
  T.BOEREN_INSTELLINGEN.loten = false;
  T.lootBoeren = (S2) => echtLot(S2, 1234);
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    T.lootBoeren = echtLot;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  Object.assign(S.kalender, { dag, snelheid: 1 });
  T.zetVoorraad(S.dorp, 'graan', 100);
  return S;
}
// Zet een wezen op een tegel, buiten.
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });

// Op het plein, in de rij y = 38, staat niets tussen x = 32 en 45: geen boom, geen put.
const RIJ = 38;

test('hoe donker het is, van 0 tot 1: T.lichtVan(dag).nacht', () => {
  assert.equal(T.lichtVan(bijUur(HERFST, 12)).nacht, 0);
  assert.equal(T.lichtVan(bijUur(HERFST, 0)).nacht, 1);
  const zon = T.zonVan(HERFST);
  const schemer = T.lichtVan(bijUur(HERFST, zon.onder + T.DAG_INSTELLINGEN.schemerUren / 2)).nacht;
  assert.ok(schemer > 0.3 && schemer < 0.7, `in de schemering half (${schemer})`);
});

test('\'s avonds branden de lantaarns; overdag en na bedtijd niet', () => {
  const S = gehucht(bijUur(WINTER, 19));
  assert.equal(T.dagdeelVan(S.kalender.dag), 'avond');
  const lantaarns = S.wereld.voorwerpen.filter((v) => v.soort === 'lantaarn');
  assert.ok(lantaarns.length >= 2, 'een op het plein, bij de put, en die van de herberg');
  // De ramen van een huis waar iemand thuis is, branden ook (werklijst vraag 108, d); hier gaat het om de lantaarns.
  const herbergen = T.herbergenVan(S.dorp);
  const bronnen = T.lichtBronnen(S.dorp).filter((b) => b.soort !== 'schout' && (!b.ramenVan || herbergen.includes(b.ramenVan)));
  for (const v of lantaarns) {
    const hier = bronnen.filter((b) => T.afstand(b, v) <= 1);
    assert.equal(hier.length, 1, `de lantaarn op ${v.x},${v.y} brandt, en één keer (die van de herberg is het licht van de herberg)`);
  }
  S.kalender.dag = bijUur(WINTER, 12);
  assert.equal(T.lichtBronnen(S.dorp).length, 0, 'overdag brandt er niets');
  S.kalender.dag = bijUur(WINTER + 1, 2);
  // Behalve de lantaarn van de schout, als hij buiten is (vraag 125, C; de toets hieronder).
  assert.ok(T.lichtBronnen(S.dorp).every((b) => b.ramenVan || b.soort === 'schout'), 'na bedtijd alleen nog de herberg, als er iemand binnen zit');
});

test('de schout draagt in het donker buiten een lantaarn; sluipen dooft hem', () => {
  const S = gehucht(bijUur(WINTER, 19));
  T.ui.toonSluipen = () => {};
  zet(S.schout, 36, RIJ);
  assert.ok(T.draagtLantaarn(S.dorp), 'het is donker en hij is buiten');
  const eigen = T.lichtBronnen(S.dorp).filter((b) => b.soort === 'schout');
  assert.equal(eigen.length, 1, 'zijn lantaarn is een lichtbron');
  T.wisselSluipen(S);
  assert.ok(S.sluipen && !T.draagtLantaarn(S.dorp), 'sluipen dooft hem');
  assert.equal(T.lichtBronnen(S.dorp).filter((b) => b.soort === 'schout').length, 0, 'en zijn licht gaat uit');
  T.wisselSluipen(S);
  assert.ok(T.draagtLantaarn(S.dorp), 'gewoon lopen steekt hem weer aan');
  // Overdag, of binnen, brandt hij niet.
  S.schout.binnen = true;
  assert.ok(!T.draagtLantaarn(S.dorp), 'binnen niet');
  zet(S.schout, 36, RIJ);
  S.kalender.dag = bijUur(WINTER, 12);
  assert.ok(!T.draagtLantaarn(S.dorp), 'overdag niet');
});
