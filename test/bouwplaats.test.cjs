// De bouwplaats zonder scherm (js/bouwen.js, T.werkBouwplaatsBij; js/gebouwen.js, T.gebouwPast): een
// type met fases uit een vel met een ring (tegels/bouwfasen-sdf.js) heeft zolang hij in aanbouw is
// een ring van tegels rond zijn voet nodig. Wat in een fase vol ligt (stapels, stenen, de leemkuil),
// is een muur; de stapels slinken; als het af is, is de ring weer vrij. Zie ontwerp/beeld.md,
// "Bouwen: een huis dat groeit" (Marcel, 24 sep 2026: eerst dit ene huis in het spel).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
const T = globalThis.Toren;

// Een proefsoort van 3×2 met drie fases. Fase 0 legt drie tegels van de ring vol, fase 1 nog één
// (de stapel slinkt), fase 2 niets meer. Zo hangt de toets niet aan het echte vel.
T.GEBOUWEN.proefhuis = {
  naam: 'proefhuis', trede: 'gehucht', voet: { b: 3, h: 2 }, kosten: {}, bouwtijd: 10,
  handen: 0, woonruimte: 0, maakt: null, verdacht: false, menu: true, tekening: 'gebouwen/proefhuis',
};
T.BOUWFASEN = T.BOUWFASEN || { bestand: 'bouwfasen.png', fasen: {} };
T.BOUWFASEN.fasen.proefhuis = {
  gebouw: 'proefhuis', bestand: 'proef.png', beslaat: [3, 2], rand: 1, hoogstePunt: 1,
  fasen: [
    { naam: 'uitzetten', vanaf: 0, bezet: [[-1, 0], [-1, 1], [3, 1]] },
    { naam: 'kap', vanaf: 0.4, bezet: [[-1, 1]] },
    { naam: 'riet', vanaf: 0.7, bezet: [] },
  ],
};

function maakS() {
  const tegels = [];
  for (let y = 0; y < 20; y++) tegels.push(new Array(20).fill('vloer'));
  return {
    wereld: { b: 20, h: 20, tegels, voorwerpen: [], wezens: [], deuren: [] },
    voorraad: T.nieuweVoorraad(),
    gebouwen: [],
    bevolking: 0,
    woonruimte: 0,
    kalender: { dag: 30 },
  };
}
const tegel = (S, x, y) => S.wereld.tegels[y][x];
function zetNeer(S, soort, x, y) {
  const r = T.plaatsGebouw(S, soort, x, y);
  assert.equal(r.gelukt, true, r.reden);
  return r.instantie;
}

test('T.bouwRandVan: alleen een type met een ring in zijn vel', () => {
  assert.equal(T.bouwRandVan('proefhuis'), 1);
  assert.equal(T.bouwRandVan('kippenhok'), 0);
});

test('neerzetten: de stapels van de eerste fase liggen er meteen, op de ring en niet erbuiten', () => {
  const S = maakS();
  const b = zetNeer(S, 'proefhuis', 5, 5);
  assert.equal(tegel(S, 4, 5), 'muur');
  assert.equal(tegel(S, 4, 6), 'muur');
  assert.equal(tegel(S, 8, 6), 'muur');
  assert.equal(tegel(S, 4, 4), 'vloer', 'een vrije tegel van de ring blijft vrij');
  assert.equal(b.ringBezet.length, 3);
});

test('de stapels slinken met de fases, en als het af is, is de ring weer vrij', () => {
  const S = maakS();
  const b = zetNeer(S, 'proefhuis', 5, 5);
  b.voortgang = 0.5;
  T.werkBouwplaatsBij(S, b);
  assert.equal(tegel(S, 4, 5), 'vloer', 'deze stapel is op');
  assert.equal(tegel(S, 8, 6), 'vloer');
  assert.equal(tegel(S, 4, 6), 'muur', 'deze ligt er nog');
  b.voortgang = 0.8;
  T.werkBouwplaatsBij(S, b);
  assert.equal(tegel(S, 4, 6), 'vloer');
  // En via de gewone bouwdag tot het af is.
  const c = zetNeer(S, 'proefhuis', 12, 12);
  S.bevolking = 20;
  for (let d = 30; d < 60 && !c.klaar; d++) T.tikBouwDag(S, d, S.bevolking);
  assert.equal(c.klaar, true);
  assert.deepEqual(c.ringBezet, []);
  for (const [x, y] of [[11, 12], [11, 13], [15, 13]]) assert.equal(tegel(S, x, y), 'vloer');
  assert.equal(tegel(S, 12, 12), 'muur', 'de voet zelf blijft vast');
});

test('wie op een tegel staat die vol moet, zit er niet in vast: die tegel wacht', () => {
  const S = maakS();
  S.wereld.wezens.push({ soort: 'dorpeling', tx: 4, ty: 5, x: 4, y: 5, pad: [] });
  const b = zetNeer(S, 'proefhuis', 5, 5);
  assert.equal(tegel(S, 4, 5), 'vloer');
  S.wereld.wezens.length = 0;
  T.werkBouwplaatsBij(S, b);
  assert.equal(tegel(S, 4, 5), 'muur', 'hij is weg, nu komt de stapel');
});

test('de ring moet vrij zijn: geen muur, en geen ander gebouw', () => {
  const S = maakS();
  S.wereld.tegels[5][4] = 'muur';
  assert.equal(T.gebouwPast(S, 'proefhuis', 5, 5), false, 'een muur op de ring');
  assert.equal(T.gebouwPast(S, 'proefhuis', 6, 5), true, 'een tegel verder past het');
  assert.equal(T.gebouwPast(S, 'proefhuis', 0, 5), false, 'de ring valt van de kaart');
});

test('niemand bouwt over de ring van een bouwplaats die nog niet af is', () => {
  const S = maakS();
  const b = zetNeer(S, 'proefhuis', 5, 5);
  // Een kippenhok (geen ring) op een vrije tegel van de ring van het proefhuis: nee.
  assert.equal(T.gebouwPast(S, 'kippenhok', 5, 7), false);
  // Een tweede proefhuis waarvan de ring die van het eerste raakt: nee.
  assert.equal(T.gebouwPast(S, 'proefhuis', 9, 5), false);
  assert.equal(T.gebouwPast(S, 'proefhuis', 10, 5), true, 'ring naast ring, zonder overlap');
  // Is het af, dan is de ring gewoon weer grond.
  b.klaar = true;
  T.werkBouwplaatsBij(S, b);
  assert.equal(T.gebouwPast(S, 'kippenhok', 5, 7), true);
});
