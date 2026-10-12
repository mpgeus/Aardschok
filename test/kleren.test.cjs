// Kleren naar stand (js/bewoners.js, T.klerenVan, en js/sprites.js, T.sprites.inKleren; werklijst vraag 149; Marcel,
// 10 okt: "Hogere niveau sociale mensen moeten duurdere kleren krijgen", en "a ja, b drie, c ja, d ja, e ja"): wie in een
// hut woont, loopt arm, wie in een stenen huis of woontoren woont, deftig als het huis zijn laken krijgt, en de rest
// gewoon; alleen de volwassenen, en aan het werk in de gewone kleren.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { proefDorp } = require('./grond.cjs');

const WORTEL = path.join(__dirname, '..');
const wacht = [];
globalThis.Image = class {
  set src(pad) {
    this.naturalWidth = 1;
    this.naturalHeight = 1;
    wacht.push(() => (fs.existsSync(path.join(WORTEL, pad)) ? this.onload() : this.onerror()));
  }
};
const beurt = () => new Promise((klaar) => setImmediate(klaar));
async function laadAlles() {
  do {
    await beurt();
    while (wacht.length) wacht.shift()();
    await beurt();
  } while (wacht.length);
}

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => undefined });

const mens = (soort, o = {}) => ({ leeftijd: 'volwassen', geslacht: 'man', uiterlijk: 3, huis: { soort, ...(o.laken != null ? { wensen: { heeft: { laken: o.laken } } } : {}) }, ...o.p });
function metOptie(keuze, doe) {
  T.zetOptie('kleren', keuze);
  try {
    return doe();
  } finally {
    T.zetOptie('kleren', 'laken');
  }
}

test('een hut is arm, een huis en een boerderij gewoon, een stenen huis of woontoren deftig met laken', () => {
  assert.equal(T.klerenVan(mens('hut')), 'arm');
  assert.equal(T.klerenVan(mens('huis')), 'gewoon');
  assert.equal(T.klerenVan(mens('boerderij')), 'gewoon');
  assert.equal(T.klerenVan(mens('stenenHuis')), 'gewoon', 'zonder wensen: nog geen laken');
  assert.equal(T.klerenVan(mens('stenenHuis', { laken: 0.6 })), 'gewoon', 'te weinig laken');
  assert.equal(T.klerenVan(mens('stenenHuis', { laken: 1 })), 'deftig');
  assert.equal(T.klerenVan(mens('woontoren', { laken: 1 })), 'deftig');
});

test('alleen de volwassenen, en het huis van de schout heeft geen stand', () => {
  for (const leeftijd of ['kleuter', 'kind', 'jong', 'oud']) assert.equal(T.klerenVan(mens('hut', { p: { leeftijd } })), 'gewoon', leeftijd);
  assert.equal(T.klerenVan({ leeftijd: 'volwassen', huis: { soort: 'huis', huis: 'schout' } }), 'gewoon');
  assert.equal(T.klerenVan({ leeftijd: 'volwassen' }), 'gewoon');
  assert.equal(T.klerenVan(null), 'gewoon');
});

test('de spelregel "Kleren": naar stand zonder laken, of iedereen gewoon', () => {
  metOptie('stand', () => assert.equal(T.klerenVan(mens('stenenHuis')), 'deftig'));
  metOptie('uit', () => {
    assert.equal(T.klerenVan(mens('hut')), 'gewoon');
    assert.equal(T.klerenVan(mens('stenenHuis', { laken: 1 })), 'gewoon');
  });
});

// In het lege begin (11 okt) woont wie het kamp verliet in een hut: de volwassenen daar lopen arm.
test('in het proefdorp: een volwassene in een hut is arm, een kind in die hut gewoon, en de rest gewoon', () => {
  const { D, boerderijen } = proefDorp(T);
  const mensen = D.bewoners.mensen;
  const vader = mensen.find((x) => x.leeftijd === 'volwassen' && x.huis && x.huis.soort === 'hut');
  assert.ok(vader, 'er woont een volwassene in een hut');
  assert.equal(T.klerenVan(vader), 'arm');
  const kind = mensen.find((x) => x.leeftijd !== 'volwassen' && x.huis === vader.huis);
  assert.ok(kind, 'er woont een kind in die hut');
  assert.equal(T.klerenVan(kind), 'gewoon');
  for (const p of mensen) {
    const arm = p.leeftijd === 'volwassen' && p.huis.soort === 'hut';
    assert.equal(T.klerenVan(p), arm ? 'arm' : 'gewoon', `${p.naam} (${p.huis && p.huis.soort})`);
  }
  // Het volgt het huis: verhuist hij naar een boerderij, dan loopt hij gewoon.
  vader.huis = boerderijen[0];
  assert.equal(T.klerenVan(vader), 'gewoon');
});

test('het vel: boer-u3-deftig als dat er is, en anders het gewone; elk uiterlijk heeft een arme en een deftige', async () => {
  const klaar = T.sprites.laad();
  await laadAlles();
  assert.equal(await klaar, true);
  const n = (T.BEELDEN.uiterlijken.boer || []).length;
  for (const lijf of ['boer', 'boerin']) {
    for (let nr = 0; nr < T.BEELDEN.uiterlijken[lijf].length; nr++) {
      for (const trap of ['arm', 'deftig']) {
        const f = T.sprites.figuurGegevens(`${lijf}-u${nr}-${trap}`);
        assert.ok(f && f.houdingen.staan && f.houdingen.lopen, `${lijf}-u${nr}-${trap}`);
      }
    }
  }
  assert.ok(n > 0);
  const e = { bewoner: mens('stenenHuis', { laken: 1 }) };
  assert.equal(T.sprites.inKleren(e, 'boer-u3'), 'boer-u3-deftig');
  assert.equal(T.sprites.inKleren({ bewoner: mens('hut') }, 'boer-u3'), 'boer-u3-arm');
  assert.equal(T.sprites.inKleren({ bewoner: mens('huis') }, 'boer-u3'), 'boer-u3');
  assert.equal(T.sprites.inKleren(e, 'boer-u999'), 'boer-u999', 'zonder vel blijft het gewone');
  assert.equal(T.sprites.inKleren(e, null), null);
});
