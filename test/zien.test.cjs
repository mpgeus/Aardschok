// Het licht in het dorp (js/zien.js; werklijst vraag 108, d, en 125, C): de lantaarns die 's avonds branden en de lantaarn
// van de aanvoerder. Het zichtveld en de getuigen (wie de aanvoerder zag verstoppen, 27 sep) zijn er sinds 11 okt uit (vraag 151).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const HERFST = dagVan('wijnmaand', 10);
const WINTER = dagVan('louwmaand', 5);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het proefdorp (test/grond.cjs), met een herberg erin (die heeft een lantaarn naast de deur), op een uur dat de toets
// kiest.
function gehucht(dag) {
  const { S } = proefDorp(T, { gebouwen: ['herberg'] });
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  Object.assign(S.kalender, { dag, snelheid: 1 });
  T.zetVoorraad(S.dorp, 'graan', 100);
  return S;
}
// Zet een wezen op een tegel, buiten.
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });

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
  assert.ok(lantaarns.length >= 2, 'een bij de deur van elk gebouw dat een lantaarn krijgt (ook die van de herberg)');
  // De ramen van een huis waar iemand thuis is, branden ook (werklijst vraag 108, d); hier gaat het om de lantaarns.
  const herbergen = T.herbergenVan(S.dorp);
  const bronnen = T.lichtBronnen(S.dorp).filter((b) => b.soort !== 'raadhuis' && (!b.ramenVan || herbergen.includes(b.ramenVan)));
  for (const v of lantaarns) {
    const hier = bronnen.filter((b) => T.afstand(b, v) <= 1);
    assert.equal(hier.length, 1, `de lantaarn op ${v.x},${v.y} brandt, en één keer (die van de herberg is het licht van de herberg)`);
  }
  S.kalender.dag = bijUur(WINTER, 12);
  assert.equal(T.lichtBronnen(S.dorp).length, 0, 'overdag brandt er niets');
  S.kalender.dag = bijUur(WINTER + 1, 2);
  // Behalve de lantaarns van de bode, als hij onderweg is (js/bode.js).
  assert.ok(T.lichtBronnen(S.dorp).every((b) => b.ramenVan || b.soort === 'drager'), 'na bedtijd alleen nog de herberg, als er iemand binnen zit');
});
