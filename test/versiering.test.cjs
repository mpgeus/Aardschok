// De versiering van het plein (js/versiering.js; ronde 3 van het snoeien, 15 okt; Marcel: "Blijven als versiering"): de
// meiboom en de kerstboom staan vanzelf in hun tijd op het open midden van het plein, zonder feest.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');
T.ui = new Proxy({}, { get: () => () => undefined });

// De dag van het spel met deze datum, in het eerste jaar (het spel begint op 1 lentemaand).
function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}
const boomOpDeKaart = (D) => D.wereld.voorwerpen.filter((v) => v.soort === 'meiboom' || v.soort === 'kerstboom');

test('de meiboom staat in bloeimaand op het plein, en daarna niet meer', () => {
  const { S } = proefDorp(T);
  const D = S.dorp;
  T.tikVersieringDag(D, dagVan('grasmaand', 30));
  assert.equal(boomOpDeKaart(D).length, 0, 'nog niet');
  const midden = T.openMidden(D.wereld, true);
  T.tikVersieringDag(D, dagVan('bloeimaand', 1));
  const [boom] = boomOpDeKaart(D);
  assert.ok(boom && boom.soort === 'meiboom', 'op 1 bloeimaand');
  assert.ok(T.opHetPlein(D.wereld, boom.x, boom.y), 'op het plein');
  assert.deepEqual({ x: boom.x, y: boom.y }, midden, 'op het open midden');
  T.tikVersieringDag(D, dagVan('bloeimaand', 30));
  assert.equal(boomOpDeKaart(D).length, 1, 'de hele maand, en één');
  T.tikVersieringDag(D, dagVan('zomermaand', 1));
  assert.equal(boomOpDeKaart(D).length, 0, 'daarna weg');
  assert.equal(D.versiering.boom, null);
});

test('de kerstboom staat over de jaarwisseling, met kaarsjes; een spel dat in die tijd begint, heeft hem ook', () => {
  const { S } = proefDorp(T);
  const D = S.dorp;
  T.tikVersieringDag(D, dagVan('lentemaand', 1)); // geen tijd van een boom
  assert.equal(boomOpDeKaart(D).length, 0);
  assert.deepEqual(T.versieringLicht(D), []);
  T.tikVersieringDag(D, dagVan('louwmaand', 3)); // midden in zijn tijd, de eerste keer
  assert.equal(boomOpDeKaart(D)[0].soort, 'kerstboom');
  const [kaars] = T.versieringLicht(D);
  assert.ok(kaars && kaars.straal === T.VERSIERING_INSTELLINGEN.kerstboom.kaarsStraal, 'zijn kaarsjes');
  T.tikVersieringDag(D, dagVan('louwmaand', 7));
  assert.equal(boomOpDeKaart(D).length, 0, 'na 6 louwmaand weg');
  T.tikVersieringDag(D, T.DAGEN_PER_JAAR + dagVan('wintermaand', 20));
  assert.equal(boomOpDeKaart(D)[0].soort, 'kerstboom', 'en op 20 wintermaand weer');
});
