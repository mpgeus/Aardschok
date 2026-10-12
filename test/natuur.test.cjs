// Wat er ligt, doet ertoe (werklijst vraag 112, c; Marcel, 3 okt: "Her en der wat foliage, bomen, stenen, water"): een
// houthakker hoort bij het bos, een steengroeve bij de rotsen, een visser en een rietsnijder aan het water
// (`bij` in T.GEBOUWEN, js/gebouwen.js). Op elk land van de maker kan dat ergens (js/maker.js), en wat laag groeit,
// maakt plaats voor een gebouw.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

// Een nieuw spel, stil: een land van de maker (zonder zaad land 5), zonder het eiland en met het gehucht dat er al was.
// (Tot ronde 2 van het snoeien, stap 3c, was het zonder zaad het ontworpen gehucht.)
function spel(zaad = 5) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  const opEiland = T.MAKER_INSTELLINGEN.opEiland;
  T.MAKER_INSTELLINGEN.opEiland = false; // een land van de maker zonder het eiland: deze toetsen gaan over zijn landen (sinds 8 okt maakt een nieuw spel het eiland, vraag 117)
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad, false));
  } finally {
    T.MAKER_INSTELLINGEN.opEiland = opEiland;
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

const NATUURGEBOUWEN = Object.keys(T.GEBOUWEN).filter((s) => T.GEBOUWEN[s].bij);

test('wie bij de natuur hoort: de houthakker bij het bos, de steengroeve bij de rotsen, de visser en de rietsnijder aan het water', () => {
  // de jager niet: hij loopt het bos in, en met de eis van het bos vond hij in de speeltest van 4 okt al in de eerste
  // herfst geen plek meer
  assert.deepEqual(NATUURGEBOUWEN.sort(), ['houthakker', 'rietsnijder', 'steengroeve', 'visser']);
  for (const s of NATUURGEBOUWEN) assert.ok(T.NATUUR[T.GEBOUWEN[s].bij.natuur], `${s}: onbekende natuur`);
});

// De rotsen van een land: de tegels met een rots.
const rotsenVan = (w) => w.voorwerpen.filter((v) => v.soort === 'rots');
const verVan = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

test('T.natuurBij telt de rotsen, de bomen en het water rond een plek', () => {
  const S = spel();
  const w = S.wereld;
  const [rots] = rotsenVan(w);
  assert.ok(rots, 'land 5 heeft rotsen');
  assert.equal(T.natuurBij(w, 'rotsen', { x: rots.x, y: rots.y, b: 1, h: 1 }, 0), 1);
  const rond = rotsenVan(w).filter((r) => verVan(r, rots) <= 2).length;
  assert.equal(T.natuurBij(w, 'rotsen', { x: rots.x, y: rots.y, b: 1, h: 1 }, 2), rond, 'met een straal telt hij wat eromheen ligt');
  assert.equal(T.natuurBij(w, 'rotsen', { x: w.marskramer.x, y: w.marskramer.y, b: 1, h: 1 }, 2), 0, 'op het plein liggen geen rotsen');
  const boom = w.voorwerpen.find((v) => T.isBosBoom(v.soort));
  assert.ok(T.natuurBij(w, 'bos', { x: boom.x, y: boom.y, b: 1, h: 1 }, 0) === 1, 'een boom van het bos');
  assert.ok(T.natuurBij(w, 'water', { x: 0, y: 0, b: w.b, h: w.h }, 0) > 50, 'de beek');
  // een gebouw verandert de kaart, en dan telt hij opnieuw
  const voor = T.natuurBij(w, 'bos', { x: 0, y: 0, b: w.b, h: w.h }, 0);
  T.haalVoorwerpWeg(w, boom);
  assert.equal(T.natuurBij(w, 'bos', { x: 0, y: 0, b: w.b, h: w.h }, 0), voor - 1);
});

test('een steengroeve bouw je alleen bij de rotsen, en het bouwmenu zegt waarom niet', () => {
  const S = spel();
  const D = S.dorp;
  const w = S.wereld;
  // ver van elke rots zegt het bouwmenu waarom niet, ook waar het verder zou passen (een hut past er)
  let ver = null;
  for (let y = 0; y < w.h && !ver; y++) {
    for (let x = 0; x < w.b && !ver; x++) {
      if (rotsenVan(w).every((r) => verVan(r, { x, y }) > 12) && !T.waaromPastHetNiet(D, 'hut', x, y)) ver = { x, y };
    }
  }
  assert.ok(ver, 'op land 5 is er plaats ver van de rotsen');
  assert.match(T.waaromPastHetNiet(D, 'steengroeve', ver.x, ver.y), /has to be near the rocks: there are no rocks close by/);
  // bij de rotsen kan het
  const [rots] = rotsenVan(w);
  const plek = T.plekVoor(D, 'steengroeve', { x: rots.x, y: rots.y });
  assert.ok(plek, 'geen plek voor een steengroeve bij de rotsen');
  assert.ok(T.natuurBij(S.wereld, 'rotsen', { x: plek.x, y: plek.y, b: 4, h: 4 }, 6) >= 2);
  assert.equal(T.plaatsGebouw(D, 'steengroeve', plek.x, plek.y).gelukt, true);
});

test('T.plekVoor vindt de natuur ook ver van waar je zoekt (meer dan 44 tegels)', () => {
  const S = spel();
  const D = S.dorp;
  const w = S.wereld;
  // gezocht vanuit de hoek van de kaart die het verst van alle rotsen ligt
  const hoeken = [{ x: 5, y: 5 }, { x: w.b - 6, y: 5 }, { x: 5, y: w.h - 6 }, { x: w.b - 6, y: w.h - 6 }];
  const afstand = (h) => Math.min(...rotsenVan(w).map((r) => verVan(r, h)));
  const van = hoeken.sort((a, b) => afstand(b) - afstand(a))[0];
  assert.ok(afstand(van) > 44, `de rotsen liggen dichter dan 44 tegels bij elke hoek (${afstand(van)})`);
  const plek = T.plekVoor(D, 'steengroeve', van);
  assert.ok(plek, 'geen steengroeve gevonden');
  assert.ok(verVan(plek, van) > 44);
  assert.ok(T.natuurBij(S.wereld, 'rotsen', { x: plek.x, y: plek.y, b: 4, h: 4 }, 6) >= 2);
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
