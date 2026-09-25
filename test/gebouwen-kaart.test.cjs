// Hoe een gebouw dat al op de kaart staat bij T.laadKaart terechtkomt (js/kaart.js, "gebouw" in
// kaarten/<naam>.betekenis.json), en het beginvoorraadje van een kaart ("beginVoorraad"). Los van
// test/gebouwen.test.cjs, want dat bestand test T.gebouwVoet zonder dat kaart.js geladen is (zijn
// terugvaloptie); hier staat kaart.js er wél, tegen T.KAARTEN.proef, net als test/kaart.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/kaart.js');
const T = globalThis.Toren;

test('een "gebouw" ding in de betekenis landt in w.gebouwenOpKaart, met zijn maat', () => {
  const betekenis = { dingen: [{ gebouw: 'boerderij', x: 2, y: 2, b: 3, h: 4 }] };
  const w = T.laadKaart(T.KAARTEN.proef, betekenis);
  assert.deepEqual(w.gebouwenOpKaart, [{ soort: 'boerderij', x: 2, y: 2, b: 3, h: 4, huis: null }]);
});

test('zonder "b"/"h" op een gebouw-ding is de voet 1x1', () => {
  const w = T.laadKaart(T.KAARTEN.proef, { dingen: [{ gebouw: 'put', x: 2, y: 2 }] });
  assert.deepEqual(w.gebouwenOpKaart[0], { soort: 'put', x: 2, y: 2, b: 1, h: 1, huis: null });
});

// Wie er woont, zegt "huis", zoals bij een akker: de boer met dezelfde id, of de schout. Dat telt
// voor zijn kelder (js/verstoppen.js), en het komt mee tot op het gebouw in S.gebouwen.
test('"huis" op een gebouw-ding zegt wie er woont, tot op het gebouw zelf', () => {
  const betekenis = { dingen: [{ gebouw: 'boerderij', x: 2, y: 2, b: 2, h: 2, huis: 'boer1' }, { gebouw: 'huis', x: 6, y: 2, b: 2, h: 2, huis: 'schout' }] };
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  S.wereld = T.laadKaart(T.KAARTEN.proef, betekenis);
  assert.equal(S.wereld.gebouwenOpKaart[0].huis, 'boer1');
  T.zetBestaandeGebouwen(S);
  assert.deepEqual(S.gebouwen.map((g) => g.huis), ['boer1', 'schout']);
  // En een klik op zijn voet vindt hem, ook zonder eigen voorwerp (T.gebouwOp, js/gebouwen.js).
  assert.equal(T.gebouwOp(S, 3, 3), S.gebouwen[0]);
  assert.equal(T.gebouwOp(S, 5, 3), null);
});

test('"beginVoorraad" op het betekenisbestand landt op de wereld', () => {
  const betekenis = { beginVoorraad: { hout: 40, goud: 20, graan: 60 } };
  const w = T.laadKaart(T.KAARTEN.proef, betekenis);
  assert.deepEqual(w.beginVoorraad, { hout: 40, goud: 20, graan: 60 });
});

test('zonder "beginVoorraad" is w.beginVoorraad null, geen leeg object', () => {
  const w = T.laadKaart(T.KAARTEN.proef, { dingen: [] });
  assert.equal(w.beginVoorraad, null);
});

test('T.opzoekTegelNaam (door kaart.js naar buiten gezet) vindt een gewone tegel op naam', () => {
  // Dezelfde tegel als test/kaart.test.cjs gebruikt voor het huis op de proefkaart.
  const opz = T.opzoekTegelNaam('gebouwen/vakwerkhuis');
  assert.ok(opz, 'gebouwen/vakwerkhuis had gevonden moeten worden');
  assert.equal(opz.vel, 'gebouwen');
});

test('T.gebouwVoet gebruikt de echte "beslaat" van de tekening als die er is', () => {
  // "huis" leent gebouwen/dorpshuis1; wat de tekening ook precies beslaat, het moet nu de tegel
  // zelf zijn die het zegt, niet de losse schatting in T.GEBOUWEN.huis.voet.
  const voet = T.gebouwVoet('huis');
  assert.ok(voet && Number.isInteger(voet.b) && voet.b > 0 && Number.isInteger(voet.h) && voet.h > 0);
});

test('T.zetBestaandeGebouwen via een echt ingelezen wereld: de vijf boerderijen en het huis tellen mee', () => {
  const dingen = [
    { gebouw: 'boerderij', x: 2, y: 2, b: 2, h: 2 },
    { gebouw: 'boerderij', x: 4, y: 2, b: 2, h: 2 },
    { gebouw: 'huis', x: 6, y: 2, b: 2, h: 2 },
  ];
  const w = T.laadKaart(T.KAARTEN.proef, { dingen });
  const S = { wereld: w, voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  T.zetBestaandeGebouwen(S);
  assert.equal(S.gebouwen.length, 3);
  assert.equal(S.woonruimte, 2 * T.GEBOUWEN.boerderij.woonruimte + T.GEBOUWEN.huis.woonruimte);
  // Met hun voet: die heeft de inner nodig om te weten of hij ze ziet (js/inner.js).
  assert.deepEqual(S.gebouwen[2].voet, { b: 2, h: 2 });
});
