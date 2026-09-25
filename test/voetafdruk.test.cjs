// De voetafdruk van een voorwerp: een voorwerp met een voet (T.VOORWERPEN, `voet`) beslaat meer dan
// één tegel, en dan hoort die hele voet te blokkeren. Anders kun je eronder gaan staan. Zonder
// scherm. (Tot 25 sep was de spiraaltrap in de toren zo'n voorwerp; die ging weg met het oude spel,
// dus zet deze toets er zelf een neer.)
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');

const T = globalThis.Toren;

test('een voorwerp met een voet van drie bij drie blokkeert die hele voet, en niets daarbuiten', () => {
  T.VOORWERPEN.proefblok = { blokkeert: true, zichtDicht: false, voet: { dx: -2, dy: -2, b: 3, h: 3 } };
  try {
    const w = T.maakProefkamers();
    // In de zuidoosthoek van het trappenhuis, met zijn voorste hoek (de hoogste x+y) op deze tegel,
    // want daarop sorteert het tekenen. De voet loopt dus naar achteren: twee tegels terug.
    const blok = { soort: 'proefblok', x: 8, y: 14 };
    w.voorwerpen.push(blok);
    for (let dx = -2; dx <= 0; dx++) {
      for (let dy = -2; dy <= 0; dy++) {
        assert.equal(T.isBegaanbaar(w, blok.x + dx, blok.y + dy, {}), false,
          `tegel ${blok.x + dx},${blok.y + dy} hoort onder het blok te vallen`);
      }
    }
    // Net ernaast mag je gewoon staan.
    assert.equal(T.isBegaanbaar(w, blok.x - 3, blok.y, {}), true);
    assert.equal(T.isBegaanbaar(w, blok.x, blok.y - 3, {}), true);
  } finally {
    delete T.VOORWERPEN.proefblok;
  }
});

test('een voorwerp zonder voet beslaat nog gewoon één tegel', () => {
  const w = T.maakProefkamers();
  const fontein = w.voorwerpen.find((v) => v.soort === 'fontein');
  const voet = T.voetVan(fontein);
  assert.deepEqual(voet, { x1: fontein.x, y1: fontein.y, x2: fontein.x, y2: fontein.y });
  assert.equal(T.voorwerpOp(w, fontein.x + 1, fontein.y), null);
});
