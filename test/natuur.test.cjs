// Wat er ligt, doet ertoe (werklijst vraag 112, c; Marcel, 3 okt: "Her en der wat foliage, bomen, stenen, water"): een
// houthakker hoort bij het bos, een steengroeve bij de rotsen, een visser en een rietsnijder aan het water
// (`bij` in T.GEBOUWEN, js/gebouwen.js). Waar die natuur op het eiland ligt, kan dat ergens, en wat laag groeit, maakt
// plaats voor een gebouw; een struik rooien de bouwers eerst, een rots blijft staan. De toetsen spelen op het lege begin
// (sinds ronde 2 van het snoeien, stap 6, het enige begin).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

// Een nieuw spel, stil: het lege begin op het eiland van `zaad` (zonder zaad eiland 5), zoals de speler het begint. (Tot
// ronde 2 van het snoeien, stap 6, was het een land van de maker zonder het eiland, met het gehucht dat er al was.) Het
// bouwbereik (16 tegels, test/begin.test.cjs) is hier niet het onderwerp maar de natuur: met een bereik over de hele
// kaart komt elke plek in aanmerking.
const { leegBegin, bouwAf } = require('./grond.cjs');
T.BEGIN_INSTELLINGEN.bouwBereik = 120;
function spel(zaad = 5) {
  const { S } = leegBegin(T, zaad);
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  return S;
}

const NATUURGEBOUWEN = Object.keys(T.GEBOUWEN).filter((s) => T.GEBOUWEN[s].bij);

test('wie bij de natuur hoort: de houthakker bij het bos, de steengroeve bij de rotsen, de visser en de rietsnijder aan het water', () => {
  // de jager niet: hij loopt het bos in, en met de eis van het bos vond hij in de speeltest van 4 okt al in de eerste
  // herfst geen plek meer
  assert.deepEqual(NATUURGEBOUWEN.sort(), ['houthakker', 'rietsnijder', 'steengroeve', 'visser']);
  for (const s of NATUURGEBOUWEN) assert.ok(T.NATUUR[T.GEBOUWEN[s].bij.natuur], `${s}: onbekende natuur`);
});

// Wat er in het land staat (T.voorwerpenIn: ook wat er op het eiland groeit), en de rotsen ervan.
const alles = (w) => T.voorwerpenIn(w, T.kaartVak(w));
const rotsenVan = (w) => alles(w).filter((v) => v.soort === 'rots');
const verVan = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
// Waarom `soort` niet op (x, y) kan, zoals de speler het vraagt: met de kavel die de bouwers eerst rooien (T.bouwKavel,
// js/bouwen.js), want in het lege begin bouwen de mensen zelf.
const waarom = (D, soort, x, y) => T.waaromPastHetNiet(D, soort, x, y, null, T.bouwKavel(D, soort, x, y));

test('T.natuurBij telt de rotsen, de bomen en het water rond een plek', () => {
  const S = spel(4);
  const w = S.wereld;
  const [rots] = rotsenVan(w);
  assert.ok(rots, 'eiland 4 heeft rotsen');
  assert.equal(T.natuurBij(w, 'rotsen', { x: rots.x, y: rots.y, b: 1, h: 1 }, 0), 1);
  const rond = rotsenVan(w).filter((r) => verVan(r, rots) <= 2).length;
  assert.equal(T.natuurBij(w, 'rotsen', { x: rots.x, y: rots.y, b: 1, h: 1 }, 2), rond, 'met een straal telt hij wat eromheen ligt');
  assert.equal(T.natuurBij(w, 'rotsen', { x: w.marskramer.x, y: w.marskramer.y, b: 1, h: 1 }, 2), 0, 'op het plein liggen geen rotsen');
  const boom = alles(w).find((v) => T.isBosBoom(v.soort));
  assert.ok(T.natuurBij(w, 'bos', { x: boom.x, y: boom.y, b: 1, h: 1 }, 0) === 1, 'een boom van het bos');
  assert.ok(T.natuurBij(w, 'water', T.kaartVak(w), 0) > 50, 'het water');
  // een gebouw verandert de kaart, en dan telt hij opnieuw
  const voor = T.natuurBij(w, 'bos', T.kaartVak(w), 0);
  T.haalVoorwerpWeg(w, boom);
  assert.equal(T.natuurBij(w, 'bos', T.kaartVak(w), 0), voor - 1);
});

test('een steengroeve bouw je alleen bij de rotsen, en het bouwmenu zegt waarom niet', () => {
  const S = spel(4);
  const D = S.dorp;
  const w = S.wereld;
  // ver van elke rots zegt het bouwmenu waarom niet, ook waar het verder zou passen (een hut past er)
  let ver = null;
  const K = T.kaartVak(w);
  for (let y = K.y; y < K.y + K.h && !ver; y++) {
    for (let x = K.x; x < K.x + K.b && !ver; x++) {
      if (rotsenVan(w).every((r) => verVan(r, { x, y }) > 12) && !waarom(D, 'hut', x, y)) ver = { x, y };
    }
  }
  assert.ok(ver, 'op eiland 4 is er plaats ver van de rotsen');
  assert.match(waarom(D, 'steengroeve', ver.x, ver.y), /has to be near the rocks: there are no rocks close by/);
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
  const K = T.kaartVak(w);
  const hoeken = [{ x: K.x + 5, y: K.y + 5 }, { x: K.x + K.b - 6, y: K.y + 5 }, { x: K.x + 5, y: K.y + K.h - 6 }, { x: K.x + K.b - 6, y: K.y + K.h - 6 }];
  const afstand = (h) => Math.min(...rotsenVan(w).map((r) => verVan(r, h)));
  const van = hoeken.sort((a, b) => afstand(b) - afstand(a))[0];
  assert.ok(afstand(van) > 44, `de rotsen liggen dichter dan 44 tegels bij elke hoek (${afstand(van)})`);
  const plek = T.plekVoor(D, 'steengroeve', van);
  assert.ok(plek, 'geen steengroeve gevonden');
  assert.ok(verVan(plek, van) > 44);
  assert.ok(T.natuurBij(S.wereld, 'rotsen', { x: plek.x, y: plek.y, b: 4, h: 4 }, 6) >= 2);
});

test('waar de natuur op het eiland ligt, kan alles wat erbij hoort ergens staan', () => {
  let gezien = 0;
  for (const zaad of [1, 2, 3, 4, 5]) {
    const S = spel(zaad);
    const D = S.dorp;
    const w = S.wereld;
    const K = T.kaartVak(w);
    const midden = { x: Math.round(K.x + K.b / 2), y: Math.round(K.y + K.h / 2) };
    for (const soort of NATUURGEBOUWEN) {
      const bij = T.GEBOUWEN[soort].bij;
      // een eiland zonder water (2 en 3) heeft geen plek voor een visser of een rietsnijder: dat is de natuur, niet het gebouw
      if (T.natuurBij(w, bij.natuur, K, 0) < bij.minstens) continue;
      gezien++;
      const plek = T.plekVoor(D, soort, midden);
      assert.ok(plek, `eiland ${zaad}: geen plek voor een ${soort}`);
      const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort)) || T.GEBOUWEN[soort].voet;
      assert.ok(T.natuurBij(S.wereld, bij.natuur, { x: plek.x, y: plek.y, b: voet.b, h: voet.h }, bij.straal) >= bij.minstens);
    }
  }
  assert.ok(gezien >= 14, `zoveel keer lag de natuur er: ${gezien}`);
});

test('wat laag groeit (een varen, bloemen), maakt plaats voor een gebouw; wat in de weg staat (een rots), houdt het tegen, en een struik rooien de bouwers', () => {
  const S = spel(4);
  const D = S.dorp;
  const w = S.wereld;
  // een plek waar een hut past, en daar een varen op
  const K = T.kaartVak(w);
  const plek = T.plekVoor(D, 'hut', { x: K.x + 50, y: K.y + 50 });
  assert.ok(plek);
  const varen = T.zetVoorwerp(w, { soort: 'varen', x: plek.x + 1, y: plek.y + 1, vel: 'begroeiing', id: T.TEGELS.begroeiing.tiles.findIndex((t) => t && t.naam === 'varen'), beslaat: [1, 1] });
  T.VOORWERPEN.varen = T.VOORWERPEN.varen || { blokkeert: false, zichtDicht: false };
  assert.equal(T.GEBOUWEN.hut.bij, undefined);
  const uit = T.plaatsGebouw(D, 'hut', plek.x, plek.y);
  assert.equal(uit.gelukt, true);
  assert.ok(w.voorwerpen.includes(varen), 'de bouwers hebben nog niet gerooid');
  bouwAf(T, D, uit.instantie, 1);
  assert.ok(!w.voorwerpen.includes(varen), 'de varen staat er nog onder de hut');
  // een rots is vast: daar bouw je niet op, ook niet als de bouwers rooien
  for (const rots of rotsenVan(w)) assert.ok(waarom(D, 'hut', rots.x, rots.y), `een hut op de rots op (${rots.x}, ${rots.y})`);
  // een struik is te rooien: de bouwers doen het eerst, en dan staat de hut er
  const struik = alles(w).find((v) => v.soort === 'struik' && !waarom(D, 'hut', v.x, v.y));
  assert.ok(struik, 'er is een struik waar een hut op past');
  const nieuw = T.plaatsGebouw(D, 'hut', struik.x, struik.y);
  assert.equal(nieuw.gelukt, true);
  assert.equal(nieuw.instantie.wachtOpRooien, true, 'de bouwers rooien eerst');
  bouwAf(T, D, nieuw.instantie, 1);
  assert.ok(T.voorwerpOp(w, struik.x, struik.y) !== struik, 'de struik is gerooid');
});
