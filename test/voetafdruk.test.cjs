// De voetafdruk van een voorwerp: een voorwerp met een voet (T.VOORWERPEN, `voet`) beslaat meer dan
// één tegel, en dan hoort die hele voet te blokkeren. Anders kun je eronder gaan staan. Zonder
// scherm. (Tot 25 sep was de spiraaltrap in de toren zo'n voorwerp; die ging weg met het oude spel,
// dus zet deze toets er zelf een neer, op een kleine kaart van vloer.)
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

function kaart() {
  const tegels = [];
  for (let y = 0; y < 16; y++) tegels.push(new Array(12).fill('vloer'));
  return { b: 12, h: 16, tegels, voorwerpen: [], wezens: [] };
}

test('een voorwerp met een voet van drie bij drie blokkeert die hele voet, en niets daarbuiten', () => {
  T.VOORWERPEN.proefblok = { blokkeert: true, zichtDicht: false, voet: { dx: -2, dy: -2, b: 3, h: 3 } };
  try {
    const w = kaart();
    // Met zijn voorste hoek (de hoogste x+y) op deze tegel, want daarop sorteert het tekenen. De voet loopt dus naar achteren: twee tegels terug.
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
  const w = kaart();
  const mand = { soort: 'mand', x: 5, y: 5 };
  w.voorwerpen.push(mand);
  const voet = T.voetVan(mand);
  assert.deepEqual(voet, { x1: mand.x, y1: mand.y, x2: mand.x, y2: mand.y });
  assert.equal(T.voorwerpOp(w, mand.x + 1, mand.y), null);
});
