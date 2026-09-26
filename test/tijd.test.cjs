// De kalender zonder scherm (js/tijd.js): de datum bij een dagteller, Sint-Maarten, de
// seizoenen, en het tikken op haar eigen klok, los van S.tijd (waar animaties op wachten;
// CLAUDE.md, "Testen in de browser").
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
const T = globalThis.Spel;

test('dag 0 is de eerste dag van de lente, in het startjaar', () => {
  const d = T.datumVanDag(0);
  assert.equal(T.MAANDEN[d.maand].naam, 'lentemaand');
  assert.equal(d.dagVanMaand, 1);
  assert.equal(d.jaar, T.TIJD_START_JAAR);
  assert.equal(d.seizoen, 'lente');
});

test('een maand later begint grasmaand', () => {
  const d = T.datumVanDag(T.DAGEN_PER_MAAND);
  assert.equal(T.MAANDEN[d.maand].naam, 'grasmaand');
  assert.equal(d.dagVanMaand, 1);
});

test('de laatste dag van een maand, vlak voor de volgende', () => {
  const d = T.datumVanDag(T.DAGEN_PER_MAAND - 1);
  assert.equal(T.MAANDEN[d.maand].naam, 'lentemaand');
  assert.equal(d.dagVanMaand, T.DAGEN_PER_MAAND);
});

test('een heel jaar verder is het weer 1 lentemaand, een jaar later', () => {
  const d = T.datumVanDag(T.DAGEN_PER_JAAR);
  assert.equal(T.MAANDEN[d.maand].naam, 'lentemaand');
  assert.equal(d.dagVanMaand, 1);
  assert.equal(d.jaar, T.TIJD_START_JAAR + 1);
});

test('Sint-Maarten valt op 11 slachtmaand, en alleen dan', () => {
  const slachtIndex = T.MAANDEN.findIndex((m) => m.naam === 'slachtmaand');
  let dag = 0;
  for (; dag < T.DAGEN_PER_JAAR; dag++) {
    const d = T.datumVanDag(dag);
    if (d.maand === slachtIndex && d.dagVanMaand === 11) break;
  }
  assert.equal(T.datumVanDag(dag).sintMaarten, true);
  assert.equal(T.datumVanDag(dag - 1).sintMaarten, false);
  assert.equal(T.datumVanDag(dag + 1).sintMaarten, false);
  // en een jaar later weer, op dezelfde afstand
  assert.equal(T.datumVanDag(dag + T.DAGEN_PER_JAAR).sintMaarten, true);
});

test('elke maand hoort bij een van de vier seizoenen, en de sfeervolle namen kloppen', () => {
  for (const m of T.MAANDEN) assert.ok(['lente', 'zomer', 'herfst', 'winter'].includes(m.seizoen));
  assert.equal(T.MAANDEN.find((m) => m.naam === 'wintermaand').seizoen, 'winter');
  assert.equal(T.MAANDEN.find((m) => m.naam === 'oogstmaand').seizoen, 'zomer');
  assert.equal(T.MAANDEN.find((m) => m.naam === 'slachtmaand').gewoon, 'november');
});

test('de tekst leest als "3 oogstmaand 1323"', () => {
  const oogstIndex = T.MAANDEN.findIndex((m) => m.naam === 'oogstmaand');
  let dag = 0;
  for (; dag < T.DAGEN_PER_JAAR; dag++) {
    const d = T.datumVanDag(dag);
    if (d.maand === oogstIndex && d.dagVanMaand === 3) break;
  }
  assert.equal(T.datumVanDag(dag).tekst, `3 oogstmaand ${T.TIJD_START_JAAR}`);
});

test('een nieuwe kalender begint op dag 0, om zeven uur, op gewone snelheid', () => {
  const k = T.nieuweKalender();
  assert.deepEqual(k, { dag: T.TIJD_START_UUR / 24, snelheid: 1 });
  assert.equal(Math.floor(k.dag), 0, 'nog steeds 1 lentemaand');
  assert.ok(Math.abs(T.uurVanDag(k.dag) - 7) < 1e-9);
});

test('het uur is wat er achter de komma van de dagteller staat', () => {
  assert.equal(T.uurVanDag(0), 0);
  assert.ok(Math.abs(T.uurVanDag(12.5) - 12) < 1e-9);
  assert.ok(Math.abs(T.uurVanDag(3 + 21 / 24) - 21) < 1e-9);
});

test('tikKalender staat stil op pauze (snelheid 0)', () => {
  const S = { kalender: T.nieuweKalender() };
  const begin = S.kalender.dag;
  T.zetSnelheid(S, 0);
  T.tikKalender(S, 5);
  assert.equal(S.kalender.dag, begin);
});

test('tikKalender telt mee met de snelheid, in dagen per T.DAG_LENGTE seconden', () => {
  const S = { kalender: T.nieuweKalender() };
  const begin = S.kalender.dag;
  T.zetSnelheid(S, 3);
  T.tikKalender(S, T.DAG_LENGTE);
  assert.ok(Math.abs(S.kalender.dag - begin - 3) < 1e-9);
});

test('een dag duurt bij 1× vijf minuten, en een jaar bij 30× een uur (Marcel, 26 sep)', () => {
  assert.equal(T.DAG_LENGTE, 5 * 60);
  assert.equal(T.DAGEN_PER_MAAND, 30, 'een maand blijft dertig dagen');
  assert.deepEqual(T.SNELHEDEN, [0, 1, 3, 10, 30]);
  assert.equal((T.DAGEN_PER_JAAR * T.DAG_LENGTE) / 30, 60 * 60);
});

test('de wereld loopt met de kalender mee: op pauze staat ze stil, zonder kalender of in een gevecht op 1×', () => {
  assert.equal(T.wereldFactor({ kalender: { snelheid: 10 } }), 10);
  assert.equal(T.wereldFactor({ kalender: { snelheid: 0 } }), 0);
  assert.equal(T.wereldFactor({}), 1, 'de proefkaarten hebben geen kalender');
  assert.equal(T.wereldFactor({ kalender: { snelheid: 30 }, gevecht: {} }), 1, 'een gevecht loopt op zijn eigen maat');
  assert.equal(T.wereldFactor({ kalender: { snelheid: 30 }, modus: 'overgang' }), 1);
});

test('tikKalender raakt nooit S.tijd aan: de kalender loopt op haar eigen klok', () => {
  const S = { tijd: 42, kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 3);
  T.tikKalender(S, 10);
  assert.equal(S.tijd, 42);
});

test('pauzeren en hervatten onthoudt de laatste snelheid', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 3);
  T.zetSnelheid(S, 0);
  assert.equal(S.kalender.snelheid, 0);
  T.zetSnelheid(S, S.kalender.laatsteSnelheid);
  assert.equal(S.kalender.snelheid, 3);
});

// ---------------------------------------------------------------------------------------------
// Wie de tijd stilzet: een reden per venster, en daarna de snelheid die de speler koos
// ---------------------------------------------------------------------------------------------

test('een venster zet de tijd stil, en daarna loopt hij weer op de snelheid die de speler koos', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 10);
  T.houdTijdStil(S, 'handel');
  assert.equal(T.snelheidNu(S), 0);
  assert.equal(S.kalender.snelheid, 10, 'wat de speler koos, blijft staan');
  const dag = S.kalender.dag;
  T.tikKalender(S, 60);
  assert.equal(S.kalender.dag, dag, 'de kalender staat stil');
  assert.equal(T.wereldFactor(S), 0, 'en de wereld ook');
  T.laatTijdGaan(S, 'handel');
  assert.equal(T.snelheidNu(S), 10);
});

test('twee redenen tegelijk: de tijd loopt pas weer als ze allebei weg zijn', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 3);
  T.houdTijdStil(S, 'brief');
  T.houdTijdStil(S, 'handel');
  T.houdTijdStil(S, 'handel'); // twee keer dezelfde reden telt één keer
  T.laatTijdGaan(S, 'brief');
  assert.equal(T.snelheidNu(S), 0, 'het handelsvenster staat nog open');
  T.laatTijdGaan(S, 'handel');
  assert.equal(T.snelheidNu(S), 3);
});

test('wie zelf op pauze zette, houdt pauze als een venster sluit', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 0);
  T.houdTijdStil(S, 'velden');
  T.laatTijdGaan(S, 'velden');
  assert.equal(T.snelheidNu(S), 0);
});

test('naar gewone snelheid: wie sneller speelt, gaat naar 1×; 1× en pauze blijven', () => {
  for (const [voor, na] of [[30, 1], [10, 1], [3, 1], [1, 1], [0, 0]]) {
    const S = { kalender: T.nieuweKalender() };
    T.zetSnelheid(S, voor);
    T.naarGewoneSnelheid(S);
    assert.equal(S.kalender.snelheid, na, `${voor}×`);
  }
});
