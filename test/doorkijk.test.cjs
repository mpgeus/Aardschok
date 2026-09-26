// De doorkijk zonder scherm (js/doorkijk.js): wie je door een boom of een huis heen ziet, en welk
// voorwerp daarvoor opengaat. Het tekenen zelf (het kijkvenster, het raster) is voor de browser. Zie
// ontwerp/beeld.md, "Doorkijk" (Marcel, 26 sep, vraag 34: "Ja dit is een goede optie" en "Raster ook
// als keuze"). Dat het venster en het raster keuzes zijn, toetst test/opties.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/iso.js');
require('../js/sprites.js');
require('../js/anim.js');
require('../js/verkennen.js');
require('../js/gevecht.js');
require('../js/doorkijk.js');
require('../js/tekenen.js');
const T = globalThis.Spel;

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

const standaard = { ...T.DOORKIJK_INSTELLINGEN };
test.afterEach(() => Object.assign(T.DOORKIJK_INSTELLINGEN, standaard));

// Het gehucht, met alleen de schout erin (aan de rand van de kaart); wie er verder nodig is, zet de
// toets er zelf bij.
function gehucht() {
  const w = T.laadKaart(T.KAARTEN.gehucht, T.BETEKENIS.gehucht);
  const S = { wereld: w, spreektMet: null };
  S.schout = T.maakWezen('schout', 20, 20);
  w.wezens = [S.schout];
  return S;
}
const erbij = (S, e) => {
  S.wereld.wezens.push(e);
  return e;
};
// Een huis vóór het plein, aan de kant van de camera, zoals in de proef van 26 sep.
const huisVoorHetPlein = () => ({ soort: 'huis', x: 43, y: 46, vel: 'gebouwen', id: 4, beslaat: [7, 5] });

test('wie je door een boom of een huis heen ziet: wie ertoe doet overal, het plein alleen door een huis', () => {
  const S = gehucht();
  const w = S.wereld;
  assert.ok(T.opHetPlein(w, 40, 38) && !T.opHetPlein(w, 20, 21), 'de proef staat op en naast het plein');
  const kind = erbij(S, T.maakDorpeling(3, 40, 38));
  const buiten = erbij(S, T.maakDorpeling(4, 20, 21));
  const kramer = erbij(S, T.maakMens('marskramer', 21, 20));
  const inner = erbij(S, T.maakMens('inner', 22, 20));
  assert.equal(T.zichtbaarDoor(S, S.schout), 'alles', 'de schout altijd');
  assert.equal(T.zichtbaarDoor(S, kramer), 'alles', 'een bezoeker ook, waar hij ook staat');
  assert.equal(T.zichtbaarDoor(S, inner), 'alles');
  assert.equal(T.zichtbaarDoor(S, kind), 'huis', 'wie op het plein staat: alleen door een huis heen');
  assert.equal(T.zichtbaarDoor(S, buiten), null, 'wie ergens anders loopt, verdwijnt erachter');
  S.spreektMet = buiten;
  assert.equal(T.zichtbaarDoor(S, buiten), 'alles', 'wie je spreekt wel');
  T.DOORKIJK_INSTELLINGEN.plein = false;
  assert.equal(T.zichtbaarDoor(S, kind), null, 'alleen wie ertoe doet: dan telt het plein niet mee');
  kramer.binnen = true;
  assert.equal(T.zichtbaarDoor(S, kramer), null, 'wie binnen is, zie je niet door een dak heen');
});

test('achter een huis vóór het plein gaat het huis open; achter een eik alleen voor wie ertoe doet', () => {
  const S = gehucht();
  const huis = huisVoorHetPlein();
  const eik = S.wereld.voorwerpen.find((v) => v.soort === 'eik' && T.opHetPlein(S.wereld, v.x, v.y));
  assert.ok(T.isGebouw(huis) && !T.isGebouw(eik), 'een huis beslaat meer dan één tegel, een eik niet');
  const achterHuis = erbij(S, T.maakDorpeling(3, 41, 43));
  const achterEik = erbij(S, T.maakDorpeling(5, eik.x - 2, eik.y - 2));
  assert.ok(T.opHetPlein(S.wereld, achterHuis.tx, achterHuis.ty) && T.opHetPlein(S.wereld, achterEik.tx, achterEik.ty));
  T.werkDoorkijkBij(S, 1, [huis, eik]);
  assert.equal(huis.doorkijk, 1, 'het huis gaat open');
  assert.ok(huis.kijkgat.includes(achterHuis), 'voor wie op het plein erachter staat');
  assert.equal(eik.doorkijk, 0, 'de eik niet: dan zat hij vol gaten zolang de kinderen spelen');
  S.spreektMet = achterEik;
  T.werkDoorkijkBij(S, 1, [huis, eik]);
  assert.equal(eik.doorkijk, 1, 'maar wie je spreekt, zie je ook door een boom heen');
  assert.deepEqual(eik.kijkgat, [achterEik]);
  // Met "alleen wie ertoe doet" blijft het huis dicht voor wie op het plein speelt.
  S.spreektMet = null;
  T.DOORKIJK_INSTELLINGEN.plein = false;
  T.werkDoorkijkBij(S, 1, [huis]);
  assert.equal(huis.doorkijk, 0);
});

test('wie vóór het huis staat, laat het dicht; wie erachter staat, laat het in `tijd` seconden open en weer dicht', () => {
  const S = gehucht();
  const huis = huisVoorHetPlein();
  const e = erbij(S, T.maakDorpeling(3, 41, 43));
  const t = T.DOORKIJK_INSTELLINGEN.tijd;
  T.werkDoorkijkBij(S, t / 2, [huis]);
  assert.ok(Math.abs(huis.doorkijk - 0.5) < 1e-9, 'halverwege open');
  T.werkDoorkijkBij(S, t, [huis]);
  assert.equal(huis.doorkijk, 1);
  // Hij loopt om het huis heen naar de voorkant: het huis gaat dicht, en het kijkgat weet nog even
  // wie erachter stond, zodat het vloeiend dichtgaat.
  e.x = e.tx = 44;
  e.y = e.ty = 52;
  assert.ok(T.staatVoorGebouw(e.tx, e.ty, huis));
  T.werkDoorkijkBij(S, t / 2, [huis]);
  assert.ok(huis.doorkijk > 0 && huis.doorkijk < 1, 'halverwege dicht');
  assert.deepEqual(huis.kijkgat, [e]);
  T.werkDoorkijkBij(S, t, [huis]);
  assert.equal(huis.doorkijk, 0);
});
