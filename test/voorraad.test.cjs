// De voorraad zonder scherm (js/voorraad.js): goud, graan, wol en hout, en de ene plek
// (T.wijzigVoorraad) waarlangs ze veranderen, zoals in het oude spel de jaren via T.verouder liepen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/voorraad.js');
const T = globalThis.Toren;

test('een nieuwe voorraad begint op nul', () => {
  assert.deepEqual(T.nieuweVoorraad(), { goud: 0, graan: 0, wol: 0, hout: 0 });
});

test('wijzigVoorraad telt op en trekt af, en zakt nooit onder nul', () => {
  const S = { voorraad: T.nieuweVoorraad() };
  T.wijzigVoorraad(S, 'graan', 12);
  assert.equal(S.voorraad.graan, 12);
  T.wijzigVoorraad(S, 'graan', -20);
  assert.equal(S.voorraad.graan, 0);
});

test('goud wijzigen houdt S.goud (de oude naam, js/quest.js) gelijk op', () => {
  const S = { goud: 0, voorraad: T.nieuweVoorraad() };
  T.wijzigVoorraad(S, 'goud', 15);
  assert.equal(S.goud, 15);
  assert.equal(S.voorraad.goud, 15);
  assert.equal(S.goudGehad, true);
});

test('zetVoorraad zet een absoluut aantal neer', () => {
  const S = { voorraad: T.nieuweVoorraad() };
  T.zetVoorraad(S, 'hout', 7);
  assert.equal(S.voorraad.hout, 7);
  T.zetVoorraad(S, 'hout', 3);
  assert.equal(S.voorraad.hout, 3);
});

test('de vier grondstoffen staan in T.GRONDSTOFFEN, in de volgorde van het scherm', () => {
  assert.deepEqual(T.GRONDSTOFFEN, ['goud', 'graan', 'wol', 'hout']);
});
