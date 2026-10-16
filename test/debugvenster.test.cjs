// Het debugvenster (js/debugvenster.js, werklijst 169) is alleen scherm en laadt niet in de toetsen; wat het aanroept,
// toetst dit: een bouwplaats die het meteen afmaakt (T.proefdorp.bouwAf en T.komtKlaar), is meteen af, en de nacht erna
// trekt er een gezin uit het kamp in, zoals bij elk gebouw dat 's nachts af kwam.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const grond = require('./grond.cjs');

test('het debugvenster: een bouwplaats meteen af, en de nacht erna trekt er een gezin uit het kamp in', () => {
  const { S, D } = grond.leegBegin(T);
  // eerst de knop +50, met de waren van T.DEBUG_INSTELLINGEN (op dag 1 staat de lading van de huifkar nog niet in de opslag)
  for (const wat of ['hout', 'planken', 'steen', 'goud']) T.wijzigVoorraad(D, wat, 50);
  const plek = T.plekVoor(D, 'hut', D.plek.kamp.vuur);
  const u = T.plaatsGebouw(D, 'hut', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  const hut = u.instantie;
  assert.ok(!hut.klaar, 'eerst een bouwplaats');
  T.proefdorp.bouwAf(D, hut, 1);
  T.komtKlaar(D, hut, 1);
  assert.ok(hut.klaar, 'meteen af');
  assert.ok(!hut.voorwerp || !hut.voorwerp.inAanbouw, 'en de tekening is de hut zelf');
  S.kalender.dag = 2.3;
  T.tikGebouwenDag(D, 2);
  assert.ok(D.bewoners.mensen.some((p) => p.huis === hut), 'de nacht erna woont er een gezin');
});
