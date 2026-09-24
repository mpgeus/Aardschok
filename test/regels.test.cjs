// De regels die zonder scherm te toetsen zijn: padzoeken, zicht, deuren en wat een monster
// in zijn beurt doet. De bestanden hangen zich aan globalThis.Toren, net als in de browser.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/spreuken.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
const T = globalThis.Toren;

const heldMag = (w, held) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: held });
const monsterMag = (w, m) => (x, y) => T.isBegaanbaar(w, x, y, { deurenOpenen: false, wezensBlokkeren: true, wie: m });
const vast = (w) => (x, y) => T.isVast(w, x, y);
const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
}

test('in een lege kamer loopt de held de kortste weg; schuin telt als één stap', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  zet(held, 1, 7);
  const pad = T.zoekPad({ x: 1, y: 7 }, { x: 8, y: 1 }, heldMag(w, held), vast(w));
  assert.equal(pad.length, 7);
  assert.deepEqual(pad[pad.length - 1], { x: 8, y: 1 });
});

test('een deur neem je recht, niet schuin om de muurhoek', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  zet(held, 8, 3);
  const pad = T.zoekPad({ x: 8, y: 3 }, { x: 10, y: 5 }, heldMag(w, held), vast(w));
  assert.deepEqual(pad, [{ x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 10, y: 5 }]);
});

test('een deur op slot houdt iedereen tegen, een dichte deur alleen de monsters', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const skelet = wezen(w, 'skelet');
  zet(held, 4, 7);
  assert.equal(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, heldMag(w, held), vast(w)), null);
  T.deurOp(w, 4, 8).staat = 'dicht';
  assert.notEqual(T.zoekPad({ x: 4, y: 7 }, { x: 4, y: 10 }, heldMag(w, held), vast(w)), null);
  assert.equal(T.zoekPad({ x: 5, y: 13 }, { x: 4, y: 7 }, monsterMag(w, skelet), vast(w), { naast: true }), null);
});

test('zicht: een dichte deur houdt het tegen, een open deur niet', () => {
  const w = T.maakWereld();
  assert.equal(T.zichtTussen(w, { x: 7, y: 4 }, { x: 11, y: 4 }), false);
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.zichtTussen(w, { x: 7, y: 4 }, { x: 11, y: 4 }), true);
});

test('kisten houden het zicht tegen, de fontein niet', () => {
  const w = T.maakWereld();
  assert.equal(T.zichtTussen(w, { x: 11, y: 5 }, { x: 16, y: 5 }), false);
  assert.equal(T.zichtTussen(w, { x: 6, y: 6 }, { x: 8, y: 6 }), true);
});

test('schuin om een muurhoek raak je niets', () => {
  const w = T.maakWereld();
  // (8,3) en (9,4): de deur ligt schuin, maar (9,3) is muur
  assert.equal(T.raakt(w, { x: 8, y: 3 }, { x: 9, y: 4 }), false);
  assert.equal(T.raakt(w, { x: 8, y: 4 }, { x: 9, y: 4 }), true);
  assert.equal(T.raakt(w, { x: 3, y: 3 }, { x: 4, y: 4 }), true);
});

test('het bereik telt schuine stappen als één', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const bereik = T.bereik({ x: 3, y: 5 }, 2, heldMag(w, held), vast(w));
  assert.equal(bereik.size, 24); // een blok van 5 bij 5 zonder de held zelf
  assert.equal(bereik.get('5,7'), 2);
});

test('een monster loopt naar de held en slaat toe als het nog genoeg punten heeft', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const skelet = wezen(w, 'skelet');
  zet(held, 2, 12);
  const plan = T.planMonsterBeurt(w, skelet, held);
  assert.equal(plan.pad.length, 2); // twee stappen tot naast de held
  assert.equal(plan.aanvallen, 1); // 6 punten: 2 lopen, dan past één klap van 3
});

test('een monster dat de held niet haalt, komt zo dichtbij als het kan en slaat niet', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const slijm = wezen(w, 'slijm');
  zet(held, 10, 4);
  zet(slijm, 17, 4);
  const plan = T.planMonsterBeurt(w, slijm, held);
  assert.equal(plan.pad.length, 4);
  assert.equal(plan.aanvallen, 0);
});

test('achter een dichte deur kan een monster de held niet bereiken', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const slijm = wezen(w, 'slijm');
  zet(held, 5, 4);
  assert.equal(T.planMonsterBeurt(w, slijm, held).kanNiet, true);
});

test('wie in de kamer van de held staat, doet mee aan het gevecht, ook zonder zicht', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  zet(held, 11, 5);
  zet(slijm, 16, 5); // de kisten op (13,5) en (14,5) staan ertussen
  assert.equal(T.zichtTussen(w, T.tegelVan(held), T.tegelVan(slijm)), false);
  const skeletAanleiding = T.deelnemers(w, held, skelet);
  assert.equal(skeletAanleiding.includes(slijm), true);
  assert.equal(T.deelnemers(w, held, slijm).includes(skelet), false);
});

test('een monster ziet je vanaf vijf stappen, niet vanaf zes', () => {
  const w = T.maakWereld();
  const S = { wereld: w, held: wezen(w, 'held') };
  const slijm = wezen(w, 'slijm');
  zet(slijm, 16, 4);
  zet(S.held, 10, 4);
  assert.equal(T.zoekOntdekking(S), null);
  zet(S.held, 11, 4);
  assert.equal(T.zoekOntdekking(S), slijm);
});

// Klikken op een open deur naast je deed eerst iets anders dan je verwacht: de deur ging
// dicht, terwijl je erdoor wilde. Een klik op een deur is nu altijd erheen lopen.
test('een klik op een open deur is erheen lopen, ook als je ernaast staat', () => {
  const w = T.maakWereld();
  const S = { wereld: w, held: wezen(w, 'held'), inventaris: new Set() };
  zet(S.held, 8, 4);
  T.deurOp(w, 9, 4).staat = 'open';
  const h = T.handelingVerkennen(S, { x: 9, y: 4 });
  assert.equal(h.tekst, null);
  assert.equal(typeof h.doe, 'function');
});

test('de deurknop hoort bij een open deur naast de held waar niemand in staat', () => {
  const w = T.maakWereld();
  const S = { wereld: w, held: wezen(w, 'held') };
  zet(S.held, 8, 4);
  assert.equal(T.deurNaastHeld(S), null); // de deur is nog dicht
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.deurNaastHeld(S), T.deurOp(w, 9, 4));
  zet(wezen(w, 'slijm'), 9, 4);
  assert.equal(T.deurNaastHeld(S), null); // er staat iemand in de opening
});

// De laatste klim: je leeftijd is je levensbalk.
test('de held begint op zijn vierentachtigste en sterft op zijn honderdste', () => {
  const w = T.maakWereld();
  assert.equal(wezen(w, 'held').leeftijd, 84 * 12);
  assert.equal(T.EINDLEEFTIJD, 100 * 12);
  assert.equal(wezen(w, 'slijm').leeftijd, null); // monsters hebben levenspunten, geen leeftijd
});

test('het lijf wordt trager met de jaren: 8, vanaf 90 jaar 7, vanaf 95 jaar 6 actiepunten', () => {
  assert.equal(T.apVoorLeeftijd(89 * 12 + 11), 8);
  assert.equal(T.apVoorLeeftijd(90 * 12), 7);
  assert.equal(T.apVoorLeeftijd(94 * 12 + 11), 7);
  assert.equal(T.apVoorLeeftijd(95 * 12), 6);
});

test('de magie wordt sterker met de jaren: +1 schade per vijf jaar boven de tachtig', () => {
  assert.equal(T.magieBonus(84 * 12 + 11), 0);
  assert.equal(T.magieBonus(85 * 12), 1);
  assert.equal(T.magieBonus(90 * 12), 2);
  const held = { leeftijd: 90 * 12 };
  assert.deepEqual(T.schichtSchade(held), [7, 10]);
});

test('leeftijd en duur staan er zoals je ze zegt', () => {
  assert.equal(T.leeftijdTekst(84 * 12), '84 jaar');
  assert.equal(T.leeftijdTekst(84 * 12 + 1), '84 jaar en 1 maand');
  assert.equal(T.leeftijdTekst(84 * 12 + 7), '84 jaar en 7 maanden');
  assert.equal(T.duurTekst(4), '4 maanden');
  assert.equal(T.duurTekst(12), 'een jaar');
  assert.equal(T.duurTekst(24), '2 jaar');
  assert.equal(T.duurKort(4), '+4 mnd');
  assert.equal(T.duurKort(12), '+1 jaar');
  assert.equal(T.duurKort(-24), '−2 jaar');
});

// Hoe ouder, hoe trager de pas: dat moet je aan hem zien lopen.
test('de held loopt trager naarmate hij ouder wordt, met rechte lijnen tussen de ijkpunten', () => {
  const bijna = (a, b) => Math.abs(a - b) < 0.0001;
  assert.equal(T.loopSnelheid(84 * 12), 2.5);
  assert.equal(T.loopSnelheid(92 * 12), 2.1);
  assert.equal(T.loopSnelheid(99 * 12), 1.8);
  assert.equal(bijna(T.loopSnelheid(88 * 12), 2.3), true); // halverwege 84 en 92
  assert.equal(bijna(T.loopSnelheid(95 * 12 + 6), 1.95), true); // halverwege 92 en 99
  assert.equal(T.loopSnelheid(80 * 12), 2.5); // jonger dan het eerste ijkpunt
  assert.equal(T.loopSnelheid(T.EINDLEEFTIJD), 1.8); // ouder dan het laatste
  const w = T.maakWereld();
  assert.equal(T.snelheidVan(wezen(w, 'held')), 2.5);
  assert.equal(T.snelheidVan(wezen(w, 'slijm')), 1.4); // een monster houdt zijn vaste snelheid
});

test('wie sluipt, wordt pas van twee tegels dichterbij opgemerkt', () => {
  const w = T.maakWereld();
  const S = { wereld: w, held: wezen(w, 'held'), sluipen: false };
  const slijm = wezen(w, 'slijm');
  zet(slijm, 16, 4);
  zet(S.held, 12, 4); // vier tegels
  assert.equal(T.zoekOntdekking(S), slijm);
  S.sluipen = true;
  assert.equal(T.zoekOntdekking(S), null);
  zet(S.held, 13, 4); // drie tegels
  assert.equal(T.zoekOntdekking(S), slijm);
});
