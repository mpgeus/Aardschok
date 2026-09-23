// De kalender zonder scherm (js/tijd.js): de datum bij een dagteller, Sint-Maarten, de
// seizoenen, en het tikken op haar eigen klok, los van S.tijd (waar animaties op wachten;
// CLAUDE.md, "Testen in de browser").
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
const T = globalThis.Toren;

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

test('een nieuwe kalender begint op dag 0, op gewone snelheid', () => {
  assert.deepEqual(T.nieuweKalender(), { dag: 0, snelheid: 1 });
});

test('tikKalender staat stil op pauze (snelheid 0)', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 0);
  T.tikKalender(S, 5);
  assert.equal(S.kalender.dag, 0);
});

test('tikKalender telt mee met de snelheid, in dagen per T.DAG_LENGTE seconden', () => {
  const S = { kalender: T.nieuweKalender() };
  T.zetSnelheid(S, 2);
  T.tikKalender(S, T.DAG_LENGTE);
  assert.ok(Math.abs(S.kalender.dag - 2) < 1e-9);
});

test('een jaar duurt op 3x een minuut of vijf', () => {
  const secondenPerJaar = T.DAGEN_PER_JAAR * (T.DAG_LENGTE / 3);
  assert.ok(secondenPerJaar >= 60 && secondenPerJaar <= 5 * 60 + 30, `was ${secondenPerJaar}s`);
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
