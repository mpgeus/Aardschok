// De maker (js/maker.js; werklijst vraag 69, C, en 70, Marcel, 30 sep: "De maker nu", en "c ja"): een gehucht dat
// elk spel anders ligt, uit dezelfde delen als het ontworpen gehucht, met de spelregel "Je gehucht" ook als je eigen
// gehucht.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

test('de maker: hetzelfde zaad geeft hetzelfde gehucht, en een ander zaad een ander', () => {
  const een = T.maakGehucht(1);
  assert.deepEqual(T.maakGehucht(1), een);
  const twee = T.maakGehucht(2);
  assert.notDeepEqual(twee.huizen, een.huizen);
});

test('de maker: elk gehucht deugt, met dezelfde delen als het ontworpen gehucht', () => {
  for (const zaad of [1, 2, 3, 4]) {
    const g = T.maakGehucht(zaad); // gooit een fout als geen enkele poging deugt
    assert.equal(T.keurGehucht(g), null, `zaad ${zaad}`);
    const rollen = g.huizen.map((h) => h.rol).sort();
    assert.deepEqual(rollen, ['boerderij', 'boerderij', 'boerderij', 'boerderij', 'boerderij', 'herberg', 'huis', 'hut', 'hut', 'kooi', 'schout']);
    // elke boerderij een andere tekening, en elke boer zijn akkers, samen zo groot als in het ontworpen gehucht
    assert.equal(new Set(g.huizen.filter((h) => h.rol === 'boerderij').map((h) => h.tekening)).size, 5);
    assert.equal(g.akkers.reduce((n, a) => n + a.b * a.h, 0), 209);
    assert.equal(g.akkers.filter((a) => a.bestemming === 'weide').reduce((n, a) => n + a.b * a.h, 0), 30);
    for (const h of g.huizen.filter((x) => x.rol === 'boerderij')) assert.ok(g.akkers.some((a) => a.huis === h.huis), `${h.huis} heeft geen akker`);
    // de marskramer staat op het zand, op het plein, en de uitgang ligt op de rand van de kaart
    assert.ok(T.binnenRand(g.plein, g.marskramer.x + 0.5, g.marskramer.y + 0.5));
    assert.ok([0, g.b - 1].includes(g.uitgang.x) || [0, g.h - 1].includes(g.uitgang.y));
  }
});

test('de maker keurt het ontworpen gehucht goed: zijn keuring is niet strenger dan wat Marcel goedkeurde', () => {
  const { ontworpen } = require('../gereedschap/maker/schets.cjs');
  const g = ontworpen();
  assert.equal(g.fout, undefined, g.fout);
  assert.equal(g.maat.pleinTegels, 214);
  assert.equal(g.maat.akkerTegels, 209);
});

// ---------------------------------------------------------------- de maker in het spel (vraag 70, C)

T.ui = new Proxy({}, { get: () => () => {} });

// Een nieuw spel op een gehucht, stil en zonder venster, zoals test/opslaan.test.cjs het ontworpen gehucht begint;
// met `zaad` op het gehucht van de maker uit dat zaad.
function nieuwSpel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

test('een gemaakt gehucht leest het spel in zoals het ontworpen gehucht: dezelfde mensen, akkers en gebouwen', () => {
  const echt = console.warn;
  console.warn = () => {};
  const w = T.laadGemaaktGehucht(3);
  console.warn = echt;
  assert.deepEqual(w.maker.zaad, 3);
  const wie = w.wezens.map((e) => e.wie || e.soort).sort();
  assert.deepEqual(wie, ['boer1', 'boer2', 'boer3', 'boer4', 'boer5', 'herbergierster', 'schout']);
  for (const e of w.wezens.filter((x) => /^boer/.test(x.wie || ''))) assert.ok(w.akkers.some((a) => a.huis === e.wie), `${e.wie} heeft geen akker`);
  assert.deepEqual(w.gebouwenOpKaart.map((g) => g.soort).sort(), ['boerderij', 'boerderij', 'boerderij', 'boerderij', 'boerderij', 'herberg', 'huis', 'huis', 'hut', 'hut', 'schaapskooi']);
  assert.equal(w.meenten.length, 1);
  assert.deepEqual(w.overgangen.map((o) => o.naar), ['wereld']);
  // elke tegel heeft grond, en het plein en de plek van de marskramer liggen erop
  for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) assert.ok(w.grond[y][x], `geen grond op (${x}, ${y})`);
  assert.ok(T.opHetPlein(w, w.marskramer.x, w.marskramer.y));
  // en je loopt van de deur van de schout naar de uitgang, de marskramer en de deur van elke boer
  const schout = w.wezens.find((e) => e.soort === 'schout');
  const loop = (doel) => T.zoekPad({ x: schout.tx, y: schout.ty }, doel, (x, y) => T.isBegaanbaar(w, x, y, {}), (x, y) => T.isVast(w, x, y), { naast: true });
  assert.ok(loop(w.overgangen[0]), 'de uitgang is niet te bereiken');
  assert.ok(loop(w.marskramer), 'de marskramer is niet te bereiken');
  for (const e of w.wezens) assert.ok(e === schout || loop({ x: e.tx, y: e.ty }), `${e.wie} is niet te bereiken`);
});

test('een nieuw spel op een gemaakt gehucht: 26 mensen, en het zaad van het spel is het zaad van het gehucht', () => {
  const S = nieuwSpel(5);
  assert.equal(S.wereld.maker.zaad, 5);
  assert.equal(S.dorp.lot.zaad, 5);
  assert.equal(S.dorp.bevolking, 26);
  assert.equal(S.dorp.bewoners.mensen.length, 26);
  assert.equal(S.dorp.gebouwen.length, 11);
  // hetzelfde zaad geeft hetzelfde spel, ook de boeren
  assert.deepEqual(nieuwSpel(5).dorp.lot, S.dorp.lot);
});

test('de spelregel "Je gehucht": standaard elk spel een ander land (vraag 112, a), en het ontworpen gehucht blijft een keuze', () => {
  const o = T.OPTIES.find((x) => x.id === 'gehucht');
  assert.equal(o.standaard, 'maker');
  assert.equal(T.MAKER_INSTELLINGEN.eigenGehucht, true);
  // een nieuw spel krijgt een land van vijf cijfers, of het land dat je koos
  const zaad = T.landVoorNieuwSpel();
  assert.ok(Number.isInteger(zaad) && zaad >= 1 && zaad <= 99999, `zaad ${zaad}`);
  assert.equal(T.landVoorNieuwSpel(4321), 4321);
  const S = nieuwSpel(T.landVoorNieuwSpel(7));
  assert.equal(S.wereld.maker.zaad, 7);
  assert.equal(S.dorp.lot.zaad, 7);
  // zonder zaad is het het ontworpen gehucht: daar spelen de toetsen op
  assert.equal(nieuwSpel().wereld.maker, undefined);
  T.pasOptiesToe({ keuzes: { gehucht: 'ontworpen' } });
  try {
    assert.equal(T.MAKER_INSTELLINGEN.eigenGehucht, false);
    assert.equal(T.landVoorNieuwSpel(), null);
    assert.equal(T.landVoorNieuwSpel(4321), null, 'met het ontworpen gehucht telt het gekozen land niet');
  } finally {
    T.pasOptiesToe({});
  }
  assert.equal(T.MAKER_INSTELLINGEN.eigenGehucht, true);
});

test('een spel op een gemaakt gehucht bewaren en weer laden geeft precies hetzelfde spel', () => {
  const S = nieuwSpel(2);
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = nieuwSpel();
  const r = T.herstelSpel(S2, tekst);
  assert.equal(r.gelukt, true, r.reden);
  assert.equal(S2.wereld.maker.zaad, 2);
  assert.equal(T.bewaarSpel(S2, { nu: 1790000000000 }), tekst);
});
