// De huizen van de huizenbouwer in het spel (ronde 4b; ontwerp/beeld.md, "Ronde 4b: de huizen in het
// spel"): het vel tegels/huizen.png uit gereedschap/pixelart/huizen.cjs, en de deur die elk huis
// meebrengt (T.deurVan, js/bewoners.js). Het anker van elk huis bewaakt test/tegelanker.test.cjs, net
// als bij de andere vellen.
const test = require('node:test');
const assert = require('node:assert/strict');

const TEGELS = require('../tegels/tegels.json');
const { HUIZEN } = require('../gereedschap/pixelart/huizen.cjs');

for (const f of [
  'js/tijd.js', 'js/dag.js', 'js/voorraad.js', 'js/wereld.js', 'beelden/beschrijving.js', 'tegels/tegels.js',
  'kaarten/kaarten.js', 'js/mensen.js', 'js/vee.js', 'js/gebouwen.js', 'js/behoeften.js', 'js/handel.js',
  'js/heer.js', 'js/inner.js', 'js/verstoppen.js', 'js/kaart.js', 'js/gebied.js', 'js/pad.js', 'js/akkers.js',
  'js/boeren.js', 'js/bewoners.js',
]) require('../' + f);
const T = globalThis.Spel;

const opHetVel = () => TEGELS.huizen.tiles.filter((t) => t && t.naam);

test('elk huis uit huizen.cjs staat op het vel, en er staat niets anders op', () => {
  assert.ok(TEGELS.huizen, 'geen vel "huizen" in tegels.json: draai npm run tiled huizen');
  // Een huis dat in huizen.cjs bijkomt of verandert, staat pas in het spel als het vel opnieuw gemaakt is.
  assert.deepEqual(opHetVel().map((t) => t.naam).sort(), Object.keys(HUIZEN).sort());
});

test('elke opgave ligt vast, ook de uitbouwen', () => {
  // Zonder `uit` kiest het zaad de uitbouwen, en dan zet een nieuwe kans in huis-sdf.cjs stil een
  // ander huis op het vel (werklijst, "Tegelijk: de huizenbouwer", ronde 4).
  for (const [naam, o] of Object.entries(HUIZEN)) {
    assert.ok(o.uit !== undefined, `${naam}: geen uit`);
    assert.ok(Number.isInteger(o.zaad), `${naam}: geen zaad`);
    assert.ok(o.vorm && o.b && o.d && o.lagen && o.nok && o.dak && o.wand, `${naam}: de opgave is niet helemaal uitgeschreven`);
    assert.ok(['hut', 'huis', 'boerderij'].includes(o.gebouw), `${naam}: onbekend gebouw ${o.gebouw}`);
  }
});

test('de deur van elk huis ligt net buiten zijn voet, aan de rand', () => {
  for (const t of opHetVel()) {
    const [b, d] = t.beslaat;
    assert.ok(Array.isArray(t.deur), `${t.naam}: geen deur`);
    const [dx, dy] = t.deur;
    const buiten = dx < 0 || dy < 0 || dx >= b || dy >= d;
    const rand = dx >= -1 && dy >= -1 && dx <= b && dy <= d;
    assert.ok(buiten && rand, `${t.naam}: deur ${dx},${dy} ligt niet net buiten een voet van ${b}×${d}`);
  }
});

test('T.deurVan neemt de deur van de tekening, en anders het midden van de zuidkant', () => {
  const hut = T.opzoekTegelNaam('huizen/hut1');
  const [b, d] = hut.eig.beslaat;
  const [dx, dy] = hut.eig.deur;
  const g = { soort: 'hut', x: 10, y: 20, voet: { b, h: d }, tekening: 'huizen/hut1' };
  assert.deepEqual(T.deurVan(null, g), { x: 10 + dx, y: 20 + dy });
  // een gebouw zonder tekening met een deur: zoals het altijd was
  const oud = { soort: 'huis', x: 10, y: 20, voet: { b: 5, h: 4 }, tekening: 'gebouwen/dorpKlein2' };
  assert.deepEqual(T.deurVan(null, oud), { x: 12, y: 24 });
  const zonder = { soort: 'huis', x: 10, y: 20, voet: { b: 5, h: 4 } };
  assert.deepEqual(T.deurVan(null, zonder), { x: 12, y: 24 });
});

