// De voetafdruk van een voorwerp: de spiraaltrap beslaat drie bij drie tegels, en dan hoort die
// hele voet te blokkeren. Anders kun je onder je eigen trap gaan staan. Zonder scherm.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');

const T = globalThis.Toren;

test('de trap blokkeert zijn hele voet van drie bij drie, en niets daarbuiten', () => {
  const w = T.maakWereld();
  const trap = w.voorwerpen.find((v) => v.soort === 'trap');
  assert.ok(trap, 'er staat een trap in het trappenhuis');

  // De tegel van de trap is zijn voorste hoek (de hoogste x+y), want daarop sorteert het tekenen.
  // De voet loopt dus naar achteren: twee tegels terug in beide richtingen.
  for (let dx = -2; dx <= 0; dx++) {
    for (let dy = -2; dy <= 0; dy++) {
      assert.equal(T.isBegaanbaar(w, trap.x + dx, trap.y + dy, {}), false,
        `tegel ${trap.x + dx},${trap.y + dy} hoort onder de trap te vallen`);
    }
  }
  // Net ernaast mag je gewoon staan.
  assert.equal(T.isBegaanbaar(w, trap.x - 3, trap.y, {}), true);
  assert.equal(T.isBegaanbaar(w, trap.x, trap.y - 3, {}), true);
});

test('een voorwerp zonder voet beslaat nog gewoon één tegel', () => {
  const w = T.maakWereld();
  const fontein = w.voorwerpen.find((v) => v.soort === 'fontein');
  const voet = T.voetVan(fontein);
  assert.deepEqual(voet, { x1: fontein.x, y1: fontein.y, x2: fontein.x, y2: fontein.y });
  assert.equal(T.voorwerpOp(w, fontein.x + 1, fontein.y), null);
});
