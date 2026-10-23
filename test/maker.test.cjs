// De maker (js/maker.js; werklijst vraag 69, C, en 70, Marcel, 30 sep: "De maker nu", en "c ja"): het land dat elk spel
// anders ligt. Sinds ronde 2 van het snoeien (stap 6, 12 okt; Marcel: "Alles wordt door spelers geplaatst") legt hij op het
// eiland alleen nog het land met een open plek voor het plein en de plek van het kamp (het lege begin, js/begin.js), en
// nooit meer huizen, boerderijen, velden, een herberg, een meent, een put of een bank: dat bouwt de speler.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

test('de maker: hetzelfde zaad geeft hetzelfde land, en een ander zaad een ander', () => {
  const een = T.planOpEiland(1);
  assert.deepEqual(T.planOpEiland(1), een);
  const twee = T.planOpEiland(2);
  assert.notDeepEqual(twee.plein, een.plein);
  assert.notDeepEqual(twee.kamp, een.kamp);
});

test('de maker: elk land deugt, en het is leeg: een plein, een plek voor het kamp, de marskramer en een uitgang, en niets gebouwd', () => {
  for (const zaad of [1, 2, 3, 4]) {
    const g = T.planOpEiland(zaad);
    assert.equal(T.keurGehucht(g), null, `zaad ${zaad}`);
    // niets van de speler of van het dorp dat er al was
    assert.deepEqual(g.huizen, [], `zaad ${zaad}: geen huizen`);
    assert.ok(!(g.akkers && g.akkers.length), `zaad ${zaad}: geen akkers`);
    assert.ok(!g.meent, `zaad ${zaad}: geen meent`);
    assert.ok(!g.voorwerpen.some((v) => ['put', 'bank'].includes(v.naam)), `zaad ${zaad}: geen put of bank`);
    // het plein is open grond, met de plek van het kamp erop: een tent per gezin en de aanvoerder, en de kar
    assert.ok(g.maat.pleinTegels > 100, `zaad ${zaad}: een plein van ${g.maat.pleinTegels} tegels`);
    assert.ok(g.kamp.plekken.length >= 1 + T.BEGIN_INSTELLINGEN.gezinnen, `zaad ${zaad}: plek voor het kamp`);
    assert.ok(T.binnenRand(g.plein, g.kamp.vuur.x + 0.5, g.kamp.vuur.y + 0.5), `zaad ${zaad}: het vuur brandt op het plein`);
    // de marskramer staat op het zand, op het plein, en de uitgang ligt op de rand van de kaart
    assert.ok(T.binnenRand(g.plein, g.marskramer.x + 0.5, g.marskramer.y + 0.5));
    assert.ok([0, g.b - 1].includes(g.uitgang.x) || [0, g.h - 1].includes(g.uitgang.y));
  }
});

// ---------------------------------------------------------------- de maker in het spel (vraag 70, C)

T.ui = new Proxy({}, { get: () => () => {} });

// Een nieuw spel op het land van de maker, stil en zonder venster, zoals test/opslaan.test.cjs het begint; met `zaad` op
// het land uit dat zaad.
function nieuwSpel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() }, T.schermVelden());
  return S;
}

test('een gemaakt land leest het spel in als het lege begin: alleen de aanvoerder, geen akkers of gebouwen, en alles is te bereiken', () => {
  const echt = console.warn;
  console.warn = () => {};
  const w = T.laadGemaaktGehucht(3);
  console.warn = echt;
  assert.deepEqual(w.maker.zaad, 3);
  assert.deepEqual(w.wezens.map((e) => e.wie || e.soort), ['aanvoerder'], 'de aanvoerder is de enige; de gezinnen komen met de kar');
  assert.equal((w.akkers || []).length, 0);
  assert.equal(w.meenten.length, 0);
  assert.deepEqual(w.overgangen.map((o) => o.naar), ['wereld']);
  // elke tegel heeft grond, en het plein en de plek van de marskramer liggen erop
  const K = T.kaartVak(w);
  for (let y = K.y; y < K.y + K.h; y++) for (let x = K.x; x < K.x + K.b; x++) assert.ok(T.grondOp(w, x, y), `geen grond op (${x}, ${y})`);
  const plek = w.plekken[0];
  assert.ok(T.opHetPlein(w, plek.marskramer.x, plek.marskramer.y));
  // en je loopt van de aanvoerder naar de uitgang, de marskramer, het kampvuur en de deur van elke tent van het kamp
  const aanvoerder = w.wezens.find((e) => e.soort === 'aanvoerder');
  const loop = (doel) => T.zoekPad({ x: aanvoerder.tx, y: aanvoerder.ty }, doel, (x, y) => T.isBegaanbaar(w, x, y, {}), (x, y) => T.isVast(w, x, y), { naast: true });
  assert.ok(loop(w.overgangen[0]), 'de uitgang is niet te bereiken');
  assert.ok(loop(plek.marskramer), 'de marskramer is niet te bereiken');
  assert.ok(loop(plek.kamp.vuur), 'het kampvuur is niet te bereiken');
  for (const p of plek.kamp.plekken) assert.ok(loop(p.deur), `de tent op (${p.deur.x}, ${p.deur.y}) is niet te bereiken`);
});

test('een nieuw spel op het land van de maker: het zaad van het dorp is het zaad van het land, en hetzelfde zaad geeft hetzelfde dorp', () => {
  const S = nieuwSpel(5);
  assert.equal(S.wereld.maker.zaad, 5);
  assert.equal(S.dorp.lot.zaad, 5);
  assert.ok(S.dorp.begin, 'het lege begin: een kar en een kamp, en nog niets gebouwd');
  assert.ok(S.dorp.gebouwen.every((g) => g.soort === 'tent'), 'alleen de tenten van het kamp');
  assert.equal(S.dorp.bevolking, S.dorp.bewoners.mensen.length);
  // hetzelfde zaad geeft hetzelfde dorp
  assert.deepEqual(nieuwSpel(5).dorp.lot, S.dorp.lot);
});

test('elk nieuw spel het eiland (vraag 117), leeg (ronde 2 van het snoeien, stap 3), en geen spelregel meer om het om te zetten', () => {
  assert.ok(!T.OPTIES.some((x) => x.id === 'gehucht' || x.id === 'begin'), 'de spelregels "Je gehucht" en "Het begin" zijn weg');
  // een nieuw spel krijgt een land van vijf cijfers, of het land dat je koos
  const zaad = T.landVoorNieuwSpel();
  assert.ok(Number.isInteger(zaad) && zaad >= 1 && zaad <= 99999, `zaad ${zaad}`);
  assert.equal(T.landVoorNieuwSpel(4321), 4321);
  const S = nieuwSpel(T.landVoorNieuwSpel(7));
  assert.equal(S.wereld.maker.zaad, 7);
  assert.equal(S.wereld.eiland.zaad, 7);
  assert.equal(S.dorp.lot.zaad, 7);
  assert.ok(S.dorp.begin && S.dorp.plek.kamp, 'het lege begin: het kamp op een open plek');
});

test('een spel op het land van de maker bewaren en weer laden geeft precies hetzelfde spel', () => {
  const S = nieuwSpel(2);
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = nieuwSpel();
  const r = T.herstelSpel(S2, tekst);
  assert.equal(r.gelukt, true, r.reden);
  assert.equal(S2.wereld.maker.zaad, 2);
  assert.equal(T.bewaarSpel(S2, { nu: 1790000000000 }), tekst);
});
