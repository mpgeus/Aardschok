// Het gehucht zoals het spel het begint (T.beginOpKaart, js/gebied.js, met kaarten/gehucht.tmj en
// zijn betekenis): wat er op de echte kaart moet kunnen. Los van de andere toetsen, die met een
// lege wereld werken.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/pad.js');
require('../js/gebouwen.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/handel.js');
const T = globalThis.Toren;

function beginGehucht() {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, kalender: { dag: 0 }, bezocht: new Set() };
  assert.equal(T.beginOpKaart(S, 'gehucht'), true);
  return S;
}

test('de schout kan lopen (tot 24 sep stond hij stil: snelheid 0)', () => {
  const S = beginGehucht();
  assert.ok(T.snelheidVan(S.held) > 0);
});

test('de marskramer kan van de weg naar de brink lopen, en terug', () => {
  const S = beginGehucht();
  const w = S.wereld;
  const { ingang, standplaats } = T.marskramerPlekken(w);
  assert.ok(ingang, 'er is een plek waar hij binnenkomt');
  assert.ok(standplaats, 'er is een plek bij de brink');
  const pad = T.zoekPad(ingang, standplaats, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y), {});
  assert.ok(pad && pad.length, 'er loopt een weg van de ingang naar de brink');
});
