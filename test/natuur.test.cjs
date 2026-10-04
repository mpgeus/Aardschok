// Wat er ligt, doet ertoe (werklijst vraag 112, c; Marcel, 3 okt: "Her en der wat foliage, bomen, stenen, water"): een
// houthakker en een jager horen bij het bos, een steengroeve bij de rotsen, een visser en een rietsnijder aan het water
// (`bij` in T.GEBOUWEN, js/gebouwen.js). Op elk land van de maker kan dat ergens (js/maker.js), en wat laag groeit,
// maakt plaats voor een gebouw.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Het bouwmenu zoals jij bouwt (de spelregel "Wie bouwt"; werklijst vraag 103).
T.zetOptie('wieBouwt', 'jij');
T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Een nieuw spel, stil: het ontworpen gehucht, of met `zaad` een land van de maker.
function spel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

const NATUURGEBOUWEN = Object.keys(T.GEBOUWEN).filter((s) => T.GEBOUWEN[s].bij);

test('wie bij de natuur hoort: de houthakker en de jager bij het bos, de steengroeve bij de rotsen, de visser en de rietsnijder aan het water', () => {
  assert.deepEqual(NATUURGEBOUWEN.sort(), ['houthakker', 'jager', 'rietsnijder', 'steengroeve', 'visser']);
  for (const s of NATUURGEBOUWEN) assert.ok(T.NATUUR[T.GEBOUWEN[s].bij.natuur], `${s}: onbekende natuur`);
});

test('T.natuurBij telt de rotsen, de bomen en het water rond een plek', () => {
  const S = spel();
  const w = S.wereld;
  // de rotspartij in het noordoosten van het ontworpen gehucht (gereedschap/tiled/maak-gehucht.cjs)
  assert.equal(T.natuurBij(w, 'rotsen', { x: 64, y: 9, b: 1, h: 1 }, 0), 1);
  assert.equal(T.natuurBij(w, 'rotsen', { x: 63, y: 9, b: 3, h: 2 }, 0), 4);
  assert.equal(T.natuurBij(w, 'rotsen', { x: 40, y: 40, b: 4, h: 4 }, 4), 0, 'bij het plein liggen geen rotsen');
  assert.ok(T.natuurBij(w, 'bos', { x: 30, y: 0, b: 4, h: 4 }, 2) > 10, 'aan de noordkant staat het bos');
  assert.ok(T.natuurBij(w, 'water', { x: 0, y: 0, b: w.b, h: w.h }, 0) > 100, 'de beek');
  // een gebouw verandert de kaart, en dan telt hij opnieuw
  const voor = T.natuurBij(w, 'bos', { x: 0, y: 0, b: w.b, h: w.h }, 0);
  const boom = w.voorwerpen.find((v) => v.soort === 'den');
  T.haalVoorwerpWeg(w, boom);
  assert.equal(T.natuurBij(w, 'bos', { x: 0, y: 0, b: w.b, h: w.h }, 0), voor - 1);
});

test('een steengroeve bouw je alleen bij de rotsen, en het bouwmenu zegt waarom niet', () => {
  const S = spel();
  const D = S.dorp;
  const waarom = T.waaromPastHetNiet(D, 'steengroeve', 52, 20);
  assert.match(waarom, /hoort bij de rotsen: hier zijn geen rotsen in de buurt/);
  // bij de rotspartij in het noordoosten kan het
  const plek = T.plekVoor(D, 'steengroeve', { x: 60, y: 14 });
  assert.ok(plek, 'geen plek voor een steengroeve bij de rotsen');
  assert.ok(T.natuurBij(S.wereld, 'rotsen', { x: plek.x, y: plek.y, b: 4, h: 4 }, 6) >= 2);
  assert.equal(T.plaatsGebouw(D, 'steengroeve', plek.x, plek.y).gelukt, true);
});

test('op elk land van de maker kan alles wat bij de natuur hoort ergens staan', () => {
  for (const zaad of [1, 2, 3]) {
    const S = spel(zaad);
    const D = S.dorp;
    const midden = { x: Math.round(S.wereld.b / 2), y: Math.round(S.wereld.h / 2) };
    for (const soort of NATUURGEBOUWEN) {
      const plek = T.plekVoor(D, soort, midden);
      assert.ok(plek, `land ${zaad}: geen plek voor een ${soort}`);
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      const bij = T.GEBOUWEN[soort].bij;
      assert.ok(T.natuurBij(S.wereld, bij.natuur, { x: plek.x, y: plek.y, b: voet.b, h: voet.h }, bij.straal) >= bij.minstens);
    }
  }
});

test('wat laag groeit (een varen, bloemen), maakt plaats voor een gebouw; wat in de weg staat, houdt het tegen', () => {
  const S = spel(4);
  const D = S.dorp;
  const w = S.wereld;
  // een plek waar een hut past, en daar een varen op
  const plek = T.plekVoor(D, 'kapel', { x: 50, y: 50 });
  assert.ok(plek);
  const varen = T.zetVoorwerp(w, { soort: 'varen', x: plek.x + 1, y: plek.y + 1, vel: 'begroeiing', id: T.TEGELS.begroeiing.tiles.findIndex((t) => t && t.naam === 'varen'), beslaat: [1, 1] });
  T.VOORWERPEN.varen = T.VOORWERPEN.varen || { blokkeert: false, zichtDicht: false };
  assert.equal(T.GEBOUWEN.kapel.bij, undefined);
  assert.equal(T.plaatsGebouw(D, 'kapel', plek.x, plek.y).gelukt, true);
  assert.ok(!w.voorwerpen.includes(varen), 'de varen staat er nog onder de kapel');
  // een struik is vast: daar bouw je niet op
  const struik = w.voorwerpen.find((v) => v.soort === 'struik');
  assert.ok(struik);
  assert.ok(T.waaromPastHetNiet(D, 'put', struik.x, struik.y));
});
