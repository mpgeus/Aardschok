// Het begin op een kaart als schout (T.beginOpKaart, js/gebied.js), tegen het echte gehucht
// (kaarten/gehucht.tmj en zijn betekenis). Het gehucht zelf, zijn gebouwen en boeren staan in hun
// eigen toetsen; hier alleen wat het begin moet regelen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/kaart.js');
require('../js/gebied.js');
const T = globalThis.Spel;

function begin() {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  return S;
}

test('de schout is een dorpeling, en hij kan lopen', () => {
  const S = begin();
  assert.equal(S.held.soort, 'dorpeling');
  assert.equal(S.held.kant, 'held');
  // Van 23 tot 24 sep stond hij stil: een 'held' heeft zelf snelheid 0, en als dorpeling liep hij
  // niet meer op de leeftijd.
  assert.equal(T.snelheidVan(S.held), T.SCHOUT_SNELHEID);
  assert.ok(T.SCHOUT_SNELHEID > 0);
});

test('de gebouwen die er al staan, tellen mee, met hun voet', () => {
  const S = begin();
  assert.ok(S.gebouwen.length > 0);
  for (const g of S.gebouwen) assert.ok(g.voet && g.voet.b >= 1 && g.voet.h >= 1, g.soort);
});
