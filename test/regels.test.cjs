// De regels die zonder scherm te toetsen zijn: padzoeken, zicht en deuren. Het gevecht staat in test/gevecht.test.cjs. De bestanden hangen zich aan globalThis.Spel, net als in de browser.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const aanvoerderMag = (w, aanvoerder) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: aanvoerder });
const monsterMag = (w, m) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: false, wezensBlokkeren: true, wie: m });
const vast = (w) => (x, y) => T.isVast(w, x, y);
const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
}

test('in een lege kamer loopt de aanvoerder de kortste weg; schuin telt als één stap', () => {
  const w = T.maakProefkamers();
  const aanvoerder = wezen(w, 'aanvoerder');
  zet(aanvoerder, 1, 7);
  const pad = T.zoekPad({ x: 1, y: 7 }, { x: 8, y: 1 }, aanvoerderMag(w, aanvoerder), vast(w));
  assert.equal(pad.length, 7);
  assert.deepEqual(pad[pad.length - 1], { x: 8, y: 1 });
});

test('een deur neem je recht, niet schuin om de muurhoek', () => {
  const w = T.maakProefkamers();
  const aanvoerder = wezen(w, 'aanvoerder');
  zet(aanvoerder, 8, 3);
  const pad = T.zoekPad({ x: 8, y: 3 }, { x: 10, y: 5 }, aanvoerderMag(w, aanvoerder), vast(w));
  assert.deepEqual(pad, [{ x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 }]);
});

test('een deur op slot houdt iedereen tegen, een dichte deur alleen de monsters', () => {
  const w = T.maakProefkamers();
  const aanvoerder = wezen(w, 'aanvoerder');
  const skelet = wezen(w, 'skelet');
  zet(aanvoerder, 4, 7);
  assert.equal(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, aanvoerderMag(w, aanvoerder), vast(w)), null);
  T.deurOp(w, 4, 8).staat = 'dicht';
  assert.notEqual(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, aanvoerderMag(w, aanvoerder), vast(w)), null);
  assert.equal(T.zoekPad({ x: 5, y: 13 }, { x: 4, y: 7 }, monsterMag(w, skelet), vast(w), { naast: true }), null);
});

test('zicht: een dichte deur houdt het tegen, een open deur niet', () => {
  const w = T.maakProefkamers();
  assert.equal(T.zichtTussen(w, { x: 7, y: 4 }, { x: 11, y: 4 }), false);
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.zichtTussen(w, { x: 7, y: 4 }, { x: 11, y: 4 }), true);
});

test('kisten houden het zicht tegen, de fontein niet', () => {
  const w = T.maakProefkamers();
  assert.equal(T.zichtTussen(w, { x: 11, y: 5 }, { x: 16, y: 5 }), false);
  assert.equal(T.zichtTussen(w, { x: 6, y: 6 }, { x: 8, y: 6 }), true);
});

test('schuin om een muurhoek raak je niets', () => {
  const w = T.maakProefkamers();
  // (8,3) en (9,4): de deur ligt schuin, maar (9,3) is muur
  assert.equal(T.raakt(w, { x: 8, y: 3 }, { x: 9, y: 4 }), false);
  assert.equal(T.raakt(w, { x: 8, y: 4 }, { x: 9, y: 4 }), true);
  assert.equal(T.raakt(w, { x: 3, y: 3 }, { x: 4, y: 4 }), true);
});

test('het bereik telt schuine stappen als één', () => {
  const w = T.maakProefkamers();
  const aanvoerder = wezen(w, 'aanvoerder');
  const bereik = T.bereik({ x: 3, y: 5 }, 2, aanvoerderMag(w, aanvoerder), vast(w));
  assert.equal(bereik.size, 24); // een blok van 5 bij 5 zonder de aanvoerder zelf
  assert.equal(bereik.get('5,7'), 2);
});

// Klikken op een open deur naast je deed eerst iets anders dan je verwacht: de deur ging
// dicht, terwijl je erdoor wilde. Een klik op een deur is nu altijd erheen lopen.
test('een open deur is een doorgang: links valt er niets te kiezen (rechts stuurt je mannen erheen, js/kiezen.js)', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, dorp: { aanvoerder: wezen(w, 'aanvoerder') }, inventaris: new Set() };
  zet(S.dorp.aanvoerder, 8, 4);
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.handelingVerkennen(S, { x: 9, y: 4 }), null);
});

// Sinds 25 sep heeft de aanvoerder levenspunten, net als een monster (Marcel koos het, voorlopig:
// ontwerp/spel.md, onder Open). Daarvoor was zijn leeftijd zijn levensbalk.
test('de aanvoerder heeft twintig levenspunten, en loopt op zijn eigen vaste maat', () => {
  const w = T.maakProefkamers();
  const aanvoerder = wezen(w, 'aanvoerder');
  assert.equal(aanvoerder.leven, 20);
  assert.equal(aanvoerder.maxLeven, 20);
  assert.equal(T.snelheidVan(aanvoerder), T.AANVOERDER_SNELHEID);
  assert.equal(T.snelheidVan(wezen(w, 'slijm')), 1.4); // een monster houdt zijn eigen snelheid
});

test('geen monster velt de aanvoerder in minder dan vier klappen', () => {
  // De klappen stonden tot 25 sep in maanden; ze zijn gedeeld door twee, zodat de monsters
  // onderling even sterk bleven. Dit bewaakt dat er niet per ongeluk één uitschiet.
  const leven = T.WEZENS.aanvoerder.leven;
  for (const [soort, s] of Object.entries(T.WEZENS)) {
    if (!s.aanval) continue;
    const [min, max] = s.aanval.schade;
    assert.ok(min >= 1 && min <= max, `${soort}: ${min}–${max}`);
    assert.ok(max * 4 <= leven, `${soort} slaat tot ${max}, en dan is de aanvoerder in ${Math.ceil(leven / max)} klappen neer`);
  }
});
