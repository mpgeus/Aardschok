// Toetst T.laadKaart (js/kaart.js) tegen kaarten/proef.tmj: een stukje gras met een zandpad, twee
// bomen, een huis en een monster, precies zoals Marcel het in Tiled zou tekenen. De inhoud van
// proef.tmj staat ook even hierboven per test, zodat een lezer niet heen en weer hoeft te kijken:
// grond 12×10, gras overal behalve rij y = 8 (zandpad), een eik op (9, 2), een den op (10, 4),
// een vakwerkhuis met zijn achterste voethoek op (1, 1) (beslaat 7×5, dus tegels 1..7 × 1..5), een
// dichte deur op (4, 6) en een slijmkruiper op (9, 7).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
const T = globalThis.Toren;

test('een ingelezen kaart heeft de goede afmeting en een begaanbare wereld', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  assert.equal(w.b, 12);
  assert.equal(w.h, 10);
  assert.equal(T.tegel(w, 0, 0), 'vloer'); // gras: geen tegel-eigenschap "vast"
  assert.equal(T.isBegaanbaar(w, 0, 0), true);
});

test('het zandpad is begaanbaar, net als het gras ernaast', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  assert.equal(T.tegel(w, 3, 8), 'vloer');
  assert.equal(T.isBegaanbaar(w, 3, 8), true); // op het pad (rij y = 8)
  assert.equal(T.isBegaanbaar(w, 3, 7), true); // op het gras ernaast
});

test('de hele voet van het huis is vast, en er net naast niet', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  for (let y = 1; y <= 5; y++) {
    for (let x = 1; x <= 7; x++) {
      assert.equal(T.isVast(w, x, y), true, `(${x}, ${y}) hoort bij de voet van het huis`);
      assert.equal(T.isBegaanbaar(w, x, y), false);
    }
  }
  assert.equal(T.isVast(w, 8, 1), false); // net buiten de voet (7 breed vanaf x = 1)
  assert.equal(T.isVast(w, 1, 6), false); // net buiten de voet (5 diep vanaf y = 1)
  const huis = w.voorwerpen.find((v) => v.soort === 'vakwerkhuis');
  assert.deepEqual(huis && { x: huis.x, y: huis.y }, { x: 1, y: 1 });
});

test('twee verschillende bomen blijven twee verschillende soorten (niet allebei de eerste boom)', () => {
  // Ving eerder een fout op: grond.png kreeg met de stempel-lap veel meer tegels, waardoor de
  // met de hand uitgerekende gid's van bomen.tsx niet meer klopten en de den als een herfsteik
  // inlas (beide "vast", dus de test hierboven zag het verschil niet). Nu blijft elke boom zijn
  // eigen naam houden, wat er ook aan grond.tsx verandert.
  const w = T.laadKaart(T.KAARTEN.proef);
  const den = T.voorwerpOp(w, 10, 4);
  assert.ok(den);
  assert.equal(den.soort, 'den');
});

test('een boom is een vast voorwerp op zijn eigen tegel', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  assert.equal(T.isVast(w, 9, 2), true);
  const eik = T.voorwerpOp(w, 9, 2);
  assert.ok(eik);
  assert.equal(eik.soort, 'eik');
  assert.equal(T.VOORWERPEN.eik.blokkeert, true);
});

test('het monster staat op de goede tegel, met zijn gewone spullen uit T.WEZENS', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  const monster = w.wezens.find((e) => e.soort === 'slijm');
  assert.ok(monster);
  assert.equal(monster.tx, 9);
  assert.equal(monster.ty, 7);
  assert.equal(monster.kant, 'monster');
  assert.equal(monster.leven, 10); // komt uit T.maakWezen, dus uit dezelfde WEZENS-tabel als T.maakWereld()
});

test('een deur uit de kaart doet mee als een echte deur, met de goede richting', () => {
  const w = T.laadKaart(T.KAARTEN.proef);
  assert.equal(T.tegel(w, 4, 6), 'deur');
  const deur = T.deurOp(w, 4, 6);
  assert.ok(deur);
  assert.equal(deur.staat, 'dicht');
  // ten noorden van de deur ligt de voet van het huis (vast): dan staat het deurpaneel dwars op x,
  // net als T.maakWereld() dat voor de deuren in de toren uitrekent.
  assert.equal(deur.richting, 'ns');
  assert.equal(T.isBegaanbaar(w, 4, 6, { deurenOpenen: false }), false);
  assert.equal(T.isBegaanbaar(w, 4, 6, { deurenOpenen: true }), true);
});
