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

test('de schout draagt het vel van een dorpeling, en hij kan lopen', () => {
  const S = begin();
  assert.equal(S.schout.soort, 'schout');
  assert.equal(S.schout.kant, 'speler');
  // Welk vel hij draagt: in Node laadt js/sprites.js geen plaatjes, dus kijkt het hier in de
  // beschrijving zelf (T.BEELDEN, beelden/beschrijving.js), waar het spel ook uit leest.
  require('../js/sprites.js');
  const echt = T.sprites.figuurGegevens;
  T.sprites.figuurGegevens = (naam) => T.BEELDEN.figuren[naam] || null;
  try {
    assert.match(T.sprites.houding(S, S.schout).naam, /^dorpeling\d+$/);
  } finally {
    T.sprites.figuurGegevens = echt;
  }
  // Van 23 tot 24 sep stond hij stil: de held (toen nog een tovenaar) had zelf snelheid 0 en liep
  // op zijn leeftijd.
  assert.equal(T.snelheidVan(S.schout), T.SCHOUT_SNELHEID);
  assert.ok(T.SCHOUT_SNELHEID > 0);
});

test('de gebouwen die er al staan, tellen mee, met hun voet', () => {
  const S = begin();
  assert.ok(S.gebouwen.length > 0);
  for (const g of S.gebouwen) assert.ok(g.voet && g.voet.b >= 1 && g.voet.h >= 1, g.soort);
});

// De vierde versie van het gehucht (26 sep, vraag 29 tot en met 31; gereedschap/tiled/maak-gehucht.cjs):
// het plein als open hart, en de velden even groot als vroeger, zodat de oogst en de balans niet
// verschuiven.
test('het plein is het open hart, en de akkers, de weide en de heide zijn even groot gebleven', () => {
  const S = begin();
  const w = S.wereld;
  let plein = 0;
  for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) if (T.opHetPlein(w, x, y)) plein++;
  assert.ok(plein >= 200, `het plein is groot (${plein} tegels)`);
  const opPlein = (r) => {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) if (T.opHetPlein(w, x, y)) return true;
    return false;
  };
  for (const g of S.gebouwen) assert.ok(!opPlein({ x: g.x, y: g.y, b: g.voet.b, h: g.voet.h }), `${g.soort} ${g.huis || ''} staat niet op het plein`);
  for (const a of w.akkers) assert.ok(!opPlein(a), `${a.naam} ligt niet op het plein`);
  assert.equal(w.akkers.reduce((n, a) => n + a.b * a.h, 0), 209, 'de akkers en de weide samen');
  assert.equal(w.meenten.reduce((n, m) => n + m.b * m.h, 0), 23 * 8, 'de heide');
  assert.ok(T.opHetPlein(w, w.marskramer.x, w.marskramer.y), 'de marskramer en de heer staan op het plein');
  assert.equal(S.bevolking, 25, 'dezelfde 25 mensen, ook al is er plaats voor meer');
  assert.ok(S.woonruimte > S.bevolking);
});
