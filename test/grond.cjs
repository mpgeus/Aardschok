// De grond onder de toetsen (snoeien, ronde 2, stap 3; Marcel, 12 okt: "B: lege begin met een proefdorp"). Tot 12 okt
// speelden de meeste toetsen op het ontworpen gehucht (kaarten/gehucht.tmj, met zijn vijf boeren); dat begin is weg,
// dus spelen ze nu wat de speler speelt: het lege begin op het eiland, en een dorp dat met de regels van het spel
// gebouwd is (T.plaatsGebouw, T.legVeld), meteen af.
//
//   const { leegBegin, proefDorp, dagen } = require('./grond.cjs');
//   const { S, D, w } = leegBegin(T);       // de kar, het kamp en vier gezinnen, op dag 1
//   const { S, D, w, ... } = proefDorp(T);  // en het dorp erop, op dag 2, iedereen thuis
//   proefDorp(T, { gebouwen: ['herberg'], weide: true, boerderijen: 3 })   // met meer erbij (zie T.proefdorp.maak, js/begin.js)
// proefDorp geeft ook: raadhuis (het town hall, waar de aanvoerder woont), boerderijen, hutten, akkers, weide, gebouw(soort) en boer(boerderij).
//
// Het bouwen zelf staat in het spel (T.proefdorp, js/begin.js), zodat het gereedschap in de browser hetzelfde dorp ziet
// (Spel.debug.proefdorp); hier staan de toegang voor de toetsen en het bewaren. Met een vaste reeks toeval, zodat elke
// toets hetzelfde dorp krijgt. `npm test` draait ook dit bestand (het staat in test/): dan toetst het onderaan wat het
// proefdorp is.
const assert = require('node:assert/strict');

// Doe `doe` met een vaste reeks toeval (Math.random), en zet daarna het echte terug (T.proefdorp.metVastToeval: ook
// zonder scherm).
const metVastToeval = (begin, doe) => globalThis.Spel.proefdorp.metVastToeval(begin, doe);

// Een nieuw spel op het eiland van `zaad` (dat van het proefdorp, T.proefdorp.zaad), met het lege begin, stil
// (T.proefdorp.begin).
function leegBegin(T, zaad = T.proefdorp.zaad) {
  const S = T.proefdorp.begin(zaad);
  return { S, D: S.dorp, w: S.dorp.wereld };
}

// De stappen van het proefdorp, los (js/begin.js): dagen zoals het spel ze tikt, een bouwplaats meteen af, iets bij het
// kampvuur neerzetten, en een veld bij een boerderij.
const dagen = (T, S, van, tot) => T.proefdorp.dagen(S, van, tot);
const bouwAf = (T, D, g, dag) => T.proefdorp.bouwAf(D, g, dag);
const zetBijHetVuur = (T, D, soort) => T.proefdorp.zetBijHetVuur(D, soort);
const legVeldBij = (T, D, soort, g, b, h) => T.proefdorp.legVeldBij(D, soort, g, b, h);

// Het proefdorp (T.proefdorp.maak, js/begin.js, met de opties die daar staan) wordt één keer gebouwd (per keus van de opties) en bewaard zoals het spel opslaat (T.bewaarSpel,
// js/opslaan.js); elke toets krijgt een vers exemplaar (T.herstelSpel). Dat is sneller dan het elke keer bouwen, en zo
// toetst elke toets ook dat een bewaard spel speelt als het spel zelf. Een getal dat een toets vóór het proefdorp
// verandert, telt dus niet bij het bouwen: zet het erna.
const BEWAARD = new Map();
function proefDorp(T, opties = {}) {
  const sleutel = JSON.stringify(opties);
  if (!BEWAARD.has(sleutel)) BEWAARD.set(sleutel, T.bewaarSpel(T.proefdorp.maak(opties), { nu: 0 }));
  const S = {};
  const uit = T.herstelSpel(S, BEWAARD.get(sleutel));
  assert.ok(uit.gelukt, uit.reden);
  const D = S.dorp;
  const w = D.wereld;
  const boerderijen = D.gebouwen.filter((g) => g.soort === 'boerderij');
  const akkers = (w.akkers || []).filter((a) => boerderijen.includes(a.boerderij));
  return {
    S, D, w, boerderijen,
    raadhuis: D.gebouwen.find((g) => g.soort === 'raadhuis'),
    hutten: D.gebouwen.filter((g) => g.soort === 'hut'),
    // De akkers van de boerderijen (de weide niet), en de weide als die er is.
    akkers: akkers.filter((a) => T.bestemmingVan(a) !== 'weide'),
    weide: akkers.find((a) => T.bestemmingVan(a) === 'weide') || null,
    // Het eerste gebouw van deze soort (een van `gebouwen`), en de boer van een boerderij.
    gebouw: (soort) => D.gebouwen.find((g) => g.soort === soort) || null,
    boer: (g) => T.boerVan(D, g),
  };
}

// Het proefdorp met de heer op het plein (js/heer.js): om tien uur komt hij over de weg, met zijn twee soldaten en zijn
// wagen, en de wereld tikt tot hij er staat. Geeft wat proefDorp geeft, met `b` (zijn bezoek), `plein` (waar hij staat)
// en `tik(n)`: n tikken van de wereld, zoals het spel (js/tik.js). Voor het leger en de wagen (werklijst E, stap 4).
function heerOpHetPlein(T, opties) {
  const dorp = proefDorp(T, opties);
  const { S, D } = dorp;
  const tik = (n = 1) => {
    for (let i = 0; i < n; i++) T.wereldTik(S);
  };
  S.kalender.dag = Math.floor(S.kalender.dag) + 10 / 24;
  T.heerKomt(D, Math.floor(S.kalender.dag));
  for (let i = 0; i < 60 * 120 && !D.heer.bezoek.staat; i++) tik();
  assert.ok(D.heer.bezoek.staat, 'de heer staat op het plein');
  return { ...dorp, b: D.heer.bezoek, plein: T.plekVanDeHeer(D), tik };
}

module.exports = { leegBegin, proefDorp, heerOpHetPlein, dagen, bouwAf, zetBijHetVuur, legVeldBij, metVastToeval };

if (require.main === module) {
  const test = require('node:test');
  const T = require('./laad.cjs').spel();
  T.ui = new Proxy({}, { get: () => () => undefined });

  test('het proefdorp: het raadhuis, twee boerderijen met hun boer en akker, en hutten; het kamp is leeg', () => {
    const { D, w, raadhuis, boerderijen, akkers, hutten } = proefDorp(T);
    assert.ok(raadhuis.klaar && raadhuis.huis === 'aanvoerder', 'de aanvoerder woont in zijn huis');
    assert.equal(boerderijen.length, 2);
    for (const g of boerderijen) {
      assert.ok(g.klaar, 'de boerderij is af');
      assert.ok(T.boerVan(D, g), 'en heeft een boer');
    }
    assert.equal(akkers.length, 2, 'elke boerderij een akker');
    assert.ok(hutten.length && hutten.every((h) => h.klaar));
    assert.equal(T.kampTenten(D).length, 0, 'iedereen is het kamp uit');
    assert.ok(w.akkers.every((a) => a.boerderij), 'de akkers zijn land van hun boerderij');
  });

  test('elke toets krijgt een vers proefdorp: wat de een verandert, ziet de ander niet', () => {
    const een = proefDorp(T);
    een.D.gebouwen.pop();
    T.wijzigVoorraad(een.D, 'hout', 100);
    const twee = proefDorp(T);
    assert.notEqual(een.D, twee.D);
    assert.equal(twee.D.voorraad.hout, een.D.voorraad.hout - 100);
    assert.equal(twee.D.gebouwen.length, een.D.gebouwen.length + 1);
  });
}
