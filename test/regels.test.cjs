// De regels die zonder scherm te toetsen zijn: padzoeken, zicht, deuren en wat een monster
// in zijn beurt doet. De bestanden hangen zich aan globalThis.Spel, net als in de browser.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
const T = globalThis.Spel;

const schoutMag = (w, schout) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: schout });
const monsterMag = (w, m) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: false, wezensBlokkeren: true, wie: m });
const vast = (w) => (x, y) => T.isVast(w, x, y);
const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
}

test('in een lege kamer loopt de schout de kortste weg; schuin telt als één stap', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  zet(schout, 1, 7);
  const pad = T.zoekPad({ x: 1, y: 7 }, { x: 8, y: 1 }, schoutMag(w, schout), vast(w));
  assert.equal(pad.length, 7);
  assert.deepEqual(pad[pad.length - 1], { x: 8, y: 1 });
});

test('een deur neem je recht, niet schuin om de muurhoek', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  zet(schout, 8, 3);
  const pad = T.zoekPad({ x: 8, y: 3 }, { x: 10, y: 5 }, schoutMag(w, schout), vast(w));
  assert.deepEqual(pad, [{ x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 }]);
});

test('een deur op slot houdt iedereen tegen, een dichte deur alleen de monsters', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const skelet = wezen(w, 'skelet');
  zet(schout, 4, 7);
  assert.equal(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, schoutMag(w, schout), vast(w)), null);
  T.deurOp(w, 4, 8).staat = 'dicht';
  assert.notEqual(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, schoutMag(w, schout), vast(w)), null);
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
  const schout = wezen(w, 'schout');
  const bereik = T.bereik({ x: 3, y: 5 }, 2, schoutMag(w, schout), vast(w));
  assert.equal(bereik.size, 24); // een blok van 5 bij 5 zonder de schout zelf
  assert.equal(bereik.get('5,7'), 2);
});

test('een monster loopt naar de schout en slaat toe als het nog genoeg punten heeft', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const skelet = wezen(w, 'skelet');
  zet(schout, 2, 12);
  const plan = T.planMonsterBeurt(w, skelet, schout);
  assert.equal(plan.pad.length, 2); // twee stappen tot naast de schout
  assert.equal(plan.aanvallen, 1); // 6 punten: 2 lopen, dan past één klap van 3
});

test('een monster dat de schout niet haalt, komt zo dichtbij als het kan en slaat niet', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const slijm = wezen(w, 'slijm');
  zet(schout, 10, 4);
  zet(slijm, 17, 4);
  const plan = T.planMonsterBeurt(w, slijm, schout);
  assert.equal(plan.pad.length, 4);
  assert.equal(plan.aanvallen, 0);
});

test('achter een dichte deur kan een monster de schout niet bereiken', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const slijm = wezen(w, 'slijm');
  zet(schout, 5, 4);
  assert.equal(T.planMonsterBeurt(w, slijm, schout).kanNiet, true);
});

test('wie in de kamer van de schout staat, doet mee aan het gevecht, ook zonder zicht', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  zet(schout, 11, 5);
  zet(slijm, 16, 5); // de kisten op (13,5) en (14,5) staan ertussen
  assert.equal(T.zichtTussen(w, T.tegelVan(schout), T.tegelVan(slijm)), false);
  const skeletAanleiding = T.deelnemers(w, schout, skelet);
  assert.equal(skeletAanleiding.includes(slijm), true);
  assert.equal(T.deelnemers(w, schout, slijm).includes(skelet), false);
});

test('een monster ziet je vanaf vijf stappen, niet vanaf zes', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, schout: wezen(w, 'schout') };
  const slijm = wezen(w, 'slijm');
  zet(slijm, 16, 4);
  zet(S.schout, 10, 4);
  assert.equal(T.zoekOntdekking(S), null);
  zet(S.schout, 11, 4);
  assert.equal(T.zoekOntdekking(S), slijm);
});

// Klikken op een open deur naast je deed eerst iets anders dan je verwacht: de deur ging
// dicht, terwijl je erdoor wilde. Een klik op een deur is nu altijd erheen lopen.
test('een klik op een open deur is erheen lopen, ook als je ernaast staat', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, schout: wezen(w, 'schout'), inventaris: new Set() };
  zet(S.schout, 8, 4);
  T.deurOp(w, 9, 4).staat = 'open';
  const h = T.handelingVerkennen(S, { x: 9, y: 4 });
  assert.equal(h.tekst, null);
  assert.equal(typeof h.doe, 'function');
});

test('de deurknop hoort bij een open deur naast de schout waar niemand in staat', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, schout: wezen(w, 'schout') };
  zet(S.schout, 8, 4);
  assert.equal(T.deurNaastSchout(S), null); // de deur is nog dicht
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.deurNaastSchout(S), T.deurOp(w, 9, 4));
  zet(wezen(w, 'slijm'), 9, 4);
  assert.equal(T.deurNaastSchout(S), null); // er staat iemand in de opening
});

// Sinds 25 sep heeft de schout levenspunten, net als een monster (Marcel koos het, voorlopig:
// ontwerp/spel.md, onder Open). Daarvoor was zijn leeftijd zijn levensbalk.
test('de schout heeft twintig levenspunten en acht actiepunten, en loopt op zijn eigen vaste maat', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  assert.equal(schout.leven, 20);
  assert.equal(schout.maxLeven, 20);
  assert.equal(schout.maxAp, 8);
  assert.equal(T.snelheidVan(schout), T.SCHOUT_SNELHEID);
  assert.equal(T.snelheidVan(wezen(w, 'slijm')), 1.4); // een monster houdt zijn eigen snelheid
});

test('geen monster velt de schout in minder dan vier klappen', () => {
  // De klappen stonden tot 25 sep in maanden; ze zijn gedeeld door twee, zodat de monsters
  // onderling even sterk bleven. Dit bewaakt dat er niet per ongeluk één uitschiet.
  const leven = T.WEZENS.schout.leven;
  for (const [soort, s] of Object.entries(T.WEZENS)) {
    if (!s.aanval) continue;
    const [min, max] = s.aanval.schade;
    assert.ok(min >= 1 && min <= max, `${soort}: ${min}–${max}`);
    assert.ok(max * 4 <= leven, `${soort} slaat tot ${max}, en dan is de schout in ${Math.ceil(leven / max)} klappen neer`);
  }
});

test('een klap kost levenspunten; op nul is een monster verslagen, en valt de schout', () => {
  const w = T.maakProefkamers();
  const schout = wezen(w, 'schout');
  const slijm = wezen(w, 'slijm');
  const S = { wereld: w, schout, gevecht: null, modus: 'verkennen', bezig: false, tijd: 0 };
  const gemeld = [];
  T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => gemeld.push(t) : () => {}) });
  T.anim = { tekst() {}, wacht: () => new Promise(() => {}) };
  T.raak(S, slijm, 3);
  assert.equal(slijm.leven, 7);
  assert.equal(slijm.dood, false);
  T.raak(S, slijm, 30);
  assert.equal(slijm.leven, 0, 'nooit onder nul');
  assert.equal(slijm.dood, true);
  T.raak(S, schout, 5);
  assert.equal(schout.leven, 15);
  assert.equal(S.modus, 'verkennen', 'een klap is nog geen einde');
  T.raak(S, schout, 30);
  assert.equal(schout.leven, 0);
  assert.equal(schout.dood, true);
  assert.equal(S.modus, 'dood', 'wie valt, speelt niet verder');
  assert.ok(gemeld.some((t) => /valt/.test(t)), gemeld.join(' | '));
});

test('wie sluipt, wordt pas van twee tegels dichterbij opgemerkt', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, schout: wezen(w, 'schout'), sluipen: false };
  const slijm = wezen(w, 'slijm');
  zet(slijm, 16, 4);
  zet(S.schout, 12, 4); // vier tegels
  assert.equal(T.zoekOntdekking(S), slijm);
  S.sluipen = true;
  assert.equal(T.zoekOntdekking(S), null);
  zet(S.schout, 13, 4); // drie tegels
  assert.equal(T.zoekOntdekking(S), slijm);
});
