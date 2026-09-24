// Bouwen zonder scherm (js/bouwen.js): een ploeg uit de bevolking, voortgang uit gedaan werk, de
// vorst, het hoogste punt met het pannenbier, en de bouwers als poppetjes op de bouwplaats. Zie
// ontwerp/spel.md, "Bouwen kost handen" (Marcel, 24 sep 2026).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
require('../js/behoeften.js');
const T = globalThis.Toren;

function maakLegeWereld(b, h) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('vloer'));
  return { b, h, tegels, voorwerpen: [], wezens: [], deuren: [] };
}

// Een gehucht zonder behoeften (dus iedereen werkt op volle kracht), op een lentedag.
function maakS(bevolking) {
  return {
    wereld: maakLegeWereld(30, 30),
    voorraad: T.nieuweVoorraad(),
    gebouwen: [],
    bevolking: bevolking || 0,
    woonruimte: 0,
    kalender: { dag: 0 },
  };
}

function zetNeer(S, soort, x, y) {
  T.zetVoorraad(S, 'hout', 999);
  T.zetVoorraad(S, 'goud', 999);
  const r = T.plaatsGebouw(S, soort, x, y);
  assert.equal(r.gelukt, true, r.reden);
  return r.instantie;
}

// Eén dag bouwen zonder de rest van T.tikGebouwenDag (eten, groei, behoeften).
const bouwDag = (S, dag) => T.tikBouwDag(S, dag, S.bevolking);

// dag 280 valt in wintermaand, dag 30 in grasmaand (zie test/behoeften.test.cjs).
const WINTERDAG = 280;

// ── De bouwfase ──

test('T.bouwFaseIndex: vijf gelijke stukken van de voortgang, en fase 3 begint op het hoogste punt', () => {
  assert.equal(T.bouwFaseIndex(0), 0);
  assert.equal(T.bouwFaseIndex(0.19), 0);
  assert.equal(T.bouwFaseIndex(0.21), 1);
  assert.equal(T.bouwFaseIndex(0.59), 2);
  assert.equal(T.bouwFaseIndex(T.BOUWEN_INSTELLINGEN.hoogstePunt), 3);
  assert.equal(T.bouwFaseIndex(0.99), 4);
});

test('T.bouwFaseIndex: klemt tussen 0 en 4, ook bij onzin', () => {
  assert.equal(T.bouwFaseIndex(-1), 0);
  assert.equal(T.bouwFaseIndex(1), 4);
  assert.equal(T.bouwFaseIndex(7), 4);
  assert.equal(T.bouwFaseIndex(NaN), 0);
  assert.equal(T.bouwFaseIndex(undefined), 0);
});

test('een gebouw dat laat op de dag wordt neergezet, begint gewoon bij fase 0 (de fout van vóór 24 sep)', () => {
  const S = maakS(3);
  S.kalender.dag = 10.9;
  const b = zetNeer(S, 'huis', 2, 2);
  assert.equal(T.bouwFaseIndex(b.voorwerp.voortgang), 0);
});

// ── De ploeg ──

test('T.ploegVan: naar de grootte van de soort, of wat de soort zelf zegt', () => {
  assert.equal(T.ploegVan('kippenhok'), 1);
  assert.equal(T.ploegVan('hut'), 2);
  assert.equal(T.ploegVan('huis'), 3);
  T.GEBOUWEN._proefPloeg = { ...T.GEBOUWEN.huis, bouwers: 5 };
  try {
    assert.equal(T.ploegVan('_proefPloeg'), 5);
  } finally {
    delete T.GEBOUWEN._proefPloeg;
  }
});

// (Een kippenhok, want dat heeft geen hoogste punt: bij een huis zou de onbeantwoorde vraag om
// pannenbier de ploeg laten mopperen, en dan is hij juist niet op tijd af.)
test('met een volle ploeg is een gebouw af na precies zijn bouwtijd', () => {
  const S = maakS(T.ploegVan('kippenhok'));
  const b = zetNeer(S, 'kippenhok', 2, 2);
  for (let d = 1; d < T.GEBOUWEN.kippenhok.bouwtijd; d++) bouwDag(S, d);
  assert.equal(b.klaar, false);
  bouwDag(S, T.GEBOUWEN.kippenhok.bouwtijd);
  assert.equal(b.klaar, true);
  assert.equal(b.voorwerp.inAanbouw, false);
});

test('met een halve ploeg gaat het half zo snel', () => {
  const S = maakS(1);
  const b = zetNeer(S, 'hut', 2, 2); // ploeg 2
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) bouwDag(S, d);
  assert.ok(Math.abs(b.voortgang - 0.5) < 1e-9, `voortgang ${b.voortgang}`);
  assert.equal(b.bouwers, 1);
});

test('zonder mensen ligt het stil', () => {
  const S = maakS(0);
  const b = zetNeer(S, 'huis', 2, 2);
  for (let d = 1; d <= 30; d++) bouwDag(S, d);
  assert.equal(b.voortgang, 0);
  assert.equal(b.bouwers, 0);
});

test('bouwplaatsen krijgen hun ploeg op volgorde van neerzetten', () => {
  const S = maakS(4);
  const eerste = zetNeer(S, 'huis', 2, 2); // ploeg 3
  const tweede = zetNeer(S, 'huis', 12, 2); // ploeg 3, maar er is nog maar één over
  bouwDag(S, 1);
  assert.equal(eerste.bouwers, 3);
  assert.equal(tweede.bouwers, 1);
});

test('wie bouwt, hakt geen hout: de bouwers gaan vóór de werkplaatsen', () => {
  const S = maakS(3);
  S.gebouwen.push({ soort: 'houthakker', x: 20, y: 20, klaar: true, voortgang: 1, handen: 0 });
  zetNeer(S, 'huis', 2, 2); // ploeg 3: iedereen bouwt
  const houtVoor = S.voorraad.hout;
  T.tikGebouwenDag(S, 1);
  assert.equal(S.gebouwen[0].handen, 0);
  assert.equal(S.voorraad.hout, houtVoor, 'de houthakker had niemand, dus er kwam geen hout bij');
});

test('in de vorst ligt het werk stil, en zijn de bouwers vrij voor ander werk', () => {
  const S = maakS(3);
  S.gebouwen.push({ soort: 'houthakker', x: 20, y: 20, klaar: true, voortgang: 1, handen: 0 });
  const b = zetNeer(S, 'huis', 2, 2);
  assert.equal(T.vriestHet(WINTERDAG), true);
  T.tikGebouwenDag(S, WINTERDAG);
  assert.equal(b.voortgang, 0);
  assert.equal(b.bouwers, 0);
  assert.equal(S.gebouwen[0].handen, T.GEBOUWEN.houthakker.handen);
});

test('in de lente vriest het niet', () => {
  assert.equal(T.vriestHet(30), false);
});

// ── Het hoogste punt en het pannenbier ──

// Bouwt dagen tot het hoogste punt net gepasseerd is; geeft de dag terug.
function totHoogstePunt(S, b) {
  let dag = 0;
  while (b.voortgang < T.BOUWEN_INSTELLINGEN.hoogstePunt && dag < 100) bouwDag(S, ++dag);
  return dag;
}

test('op het hoogste punt vragen de bouwers om pannenbier, één keer', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  const dag = totHoogstePunt(S, b);
  assert.equal(b.pannenbier, 'gevraagd');
  assert.equal(b.pannenbierTot, dag + T.BOUWEN_INSTELLINGEN.pannenbierWacht);
});

test('een kippenhok, een put of een moestuin heeft geen hoogste punt', () => {
  assert.equal(T.heeftHoogstePunt('kippenhok'), false);
  assert.equal(T.heeftHoogstePunt('put'), false);
  assert.equal(T.heeftHoogstePunt('moestuin'), false);
  assert.equal(T.heeftHoogstePunt('huis'), true);
  assert.equal(T.heeftHoogstePunt('hut'), true);
});

test('pannenbier schenken kost bier als dat er is, en maakt het dorp een tijdje tevredener', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  totHoogstePunt(S, b);
  T.zetVoorraad(S, 'bier', 10);
  const goudVoor = S.voorraad.goud;
  assert.deepEqual(T.pannenbierPrijs(S, b), { bier: 3 });
  assert.equal(T.schenkPannenbier(S, b, true).gelukt, true);
  assert.equal(S.voorraad.bier, 7);
  assert.equal(S.voorraad.goud, goudVoor);
  assert.equal(b.pannenbier, 'gegeven');
  // De bonus telt in de tevredenheid, en na de feestdagen niet meer.
  const dag = Math.floor(S.kalender.dag);
  const met = T.berekenTevredenheid(S, dag).tevredenheid;
  const zonder = T.berekenTevredenheid({ ...S, feest: null }, dag).tevredenheid;
  assert.ok(met > zonder, `${met} hoort meer te zijn dan ${zonder}`);
  assert.equal(T.berekenTevredenheid(S, dag + T.BOUWEN_INSTELLINGEN.feestDagen).feest, 0);
});

test('zonder bier kost een rondje goud, en zonder allebei kan het niet', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  totHoogstePunt(S, b);
  T.zetVoorraad(S, 'bier', 0);
  T.zetVoorraad(S, 'goud', 5);
  assert.deepEqual(T.pannenbierPrijs(S, b), { goud: 3 });
  T.zetVoorraad(S, 'goud', 2);
  assert.equal(T.pannenbierPrijs(S, b), null);
  const r = T.schenkPannenbier(S, b, true);
  assert.equal(r.gelukt, false);
  assert.ok(r.reden);
  assert.equal(b.pannenbier, 'gevraagd', 'de vraag blijft open');
});

test('geen pannenbier: de ploeg moppert en werkt trager tot het af is', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  const dag = totHoogstePunt(S, b);
  T.schenkPannenbier(S, b, false);
  assert.equal(b.pannenbier, 'niets');
  const voor = b.voortgang;
  bouwDag(S, dag + 1);
  const verwacht = T.BOUWEN_INSTELLINGEN.mopperTempo / T.GEBOUWEN.huis.bouwtijd;
  assert.ok(Math.abs(b.voortgang - voor - verwacht) < 1e-9);
});

test('wie niet antwoordt, geeft niets: na de wachttijd mopperen ze', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  const dag = totHoogstePunt(S, b);
  bouwDag(S, dag + T.BOUWEN_INSTELLINGEN.pannenbierWacht);
  assert.equal(b.pannenbier, 'niets');
});

test('is het gebouw af voordat er een antwoord kwam, dan is de vraag voorbij', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  const wacht = T.BOUWEN_INSTELLINGEN.pannenbierWacht;
  T.BOUWEN_INSTELLINGEN.pannenbierWacht = 99;
  try {
    let dag = totHoogstePunt(S, b);
    while (!b.klaar && dag < 100) bouwDag(S, ++dag);
  } finally {
    T.BOUWEN_INSTELLINGEN.pannenbierWacht = wacht;
  }
  assert.equal(b.klaar, true);
  assert.equal(b.pannenbier, null);
  assert.equal(T.schenkPannenbier(S, b, true).gelukt, false);
});

// ── Wat de speler ziet ──

test('T.bouwStand: hoe ver, met hoeveel, en hoe lang nog', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 2, 2);
  bouwDag(S, 1);
  const st = T.bouwStand(S, b);
  assert.equal(st.bouwers, 3);
  assert.equal(st.ploeg, 3);
  assert.equal(st.nogDagen, T.GEBOUWEN.huis.bouwtijd - 1);
  assert.match(st.tekst, /Huis in aanbouw/);
});

test('T.bouwplaatsOp: vindt de bouwplaats onder een tegel van zijn voet, en niet ernaast', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'kippenhok', 5, 5);
  const voet = T.gebouwVoet('kippenhok');
  assert.equal(T.bouwplaatsOp(S, 5, 5), b);
  assert.equal(T.bouwplaatsOp(S, 5 + voet.b - 1, 5 + voet.h - 1), b);
  assert.equal(T.bouwplaatsOp(S, 5 + voet.b, 5), null);
});

test('T.werkBouwersBij: zoveel bouwers als er werken (hoogstens drie), rond de voet, en weg als het af is', () => {
  const S = maakS(3);
  const b = zetNeer(S, 'huis', 5, 5);
  const voet = T.gebouwVoet('huis');
  T.werkBouwersBij(S);
  assert.equal(S.wereld.wezens.length, 0, 'vóór de eerste dag bouwt er nog niemand');
  bouwDag(S, 1);
  T.werkBouwersBij(S);
  assert.equal(S.wereld.wezens.length, 3);
  for (const e of S.wereld.wezens) {
    assert.equal(e.soort, 'bouwer');
    const binnen = e.tx >= 5 && e.tx < 5 + voet.b && e.ty >= 5 && e.ty < 5 + voet.h;
    assert.equal(binnen, false, 'een bouwer staat nooit op de voet zelf');
    assert.ok(T.naarBouwplaats(e), 'en wel ernaast, met een richting naar de muur');
  }
  while (!b.klaar) bouwDag(S, 2);
  T.werkBouwersBij(S);
  assert.equal(S.wereld.wezens.length, 0);
});

test('T.naarBouwplaats: alleen naast de voet een richting, verder weg niet', () => {
  const e = { tx: 4, ty: 6, bouwVoet: { x: 5, y: 5, b: 3, h: 3 } };
  assert.deepEqual(T.naarBouwplaats(e), { dx: 1, dy: 0 });
  e.tx = 3;
  assert.equal(T.naarBouwplaats(e), null);
  e.tx = 8;
  e.ty = 8;
  assert.deepEqual(T.naarBouwplaats(e), { dx: -1, dy: -1 });
});
