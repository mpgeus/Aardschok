// De inner zonder scherm (js/inner.js): de oogst en het rekenboek, verstopplekken, zijn bezoek met
// de argwaan die daaruit volgt, het vinden van een verstopplek, en wat de heer met zijn rapport doet.
// Zie ontwerp/spel.md, "Rijk worden en arm lijken: de inner" (Marcel, 24 sep 2026), werklijst punt 6.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
require('../js/handel.js');
require('../js/behoeften.js');
require('../js/heer.js');
require('../js/inner.js');
const T = globalThis.Toren;
const I = T.INNER_INSTELLINGEN;

// Dag 0 is 1 lentemaand van het eerste jaar (1323): 1 herfstmaand is dag 180, de aankondiging 191,
// het bezoek 194, de brief van de heer 220.
const REKENBOEK = 180;
const BEZOEK = 194;
const BRIEF = 220;

function maakS() {
  const tegels = [];
  for (let y = 0; y < 30; y++) tegels.push(new Array(30).fill('vloer'));
  return {
    wereld: { b: 30, h: 30, tegels, voorwerpen: [], wezens: [], deuren: [], akkers: [{ x: 20, y: 2, b: 5, h: 10 }] },
    voorraad: T.nieuweVoorraad(),
    gebouwen: [{ soort: 'boerderij', x: 2, y: 2, klaar: true, voortgang: 1, handen: 0 }],
    bevolking: 20,
    woonruimte: 0,
    kalender: { dag: 0 },
  };
}

// Een oogst van `n` graan in het eerste jaar, zoals js/akkers.js hem telt.
function oogst(S, n) {
  S.kalender.dag = 150;
  T.telOogst(S, n);
  T.zetVoorraad(S, 'graan', n);
}

// Een verstopplek die af is, naast de schuur (de schuur staat op (2, 2); de inner kijkt aan de voorkant).
function kuil(S) {
  const v = T.gebouwVoet('boerderij');
  const b = { soort: 'verstopplek', x: 2 + v.b + 1, y: 2 + v.h, klaar: true, voortgang: 1, handen: 0 };
  S.gebouwen.push(b);
  return b;
}

test('T.telOogst en T.schrijfOp: het echte getal, en wat je opgeeft met een reden', () => {
  const S = maakS();
  oogst(S, 400);
  assert.equal(T.oogstVan(S, 1323), 400);
  assert.deepEqual(T.schrijfOp(S, 'hagel', 1323), { echt: 400, opgegeven: 320, reden: 'hagel' });
  assert.equal(T.schrijfOp(S, 'alles', 1323).opgegeven, 400);
});

test('verstoppen: zoveel als je hebt en als er plaats is, en goud neemt weinig plaats in', () => {
  const S = maakS();
  const b = kuil(S);
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', 500);
  const r = T.verstop(S, b, 'graan', 100);
  assert.equal(r.aantal, I.verstopRuimte, 'zoveel als er past');
  assert.equal(S.voorraad.graan, 100 - I.verstopRuimte);
  assert.equal(T.verstop(S, b, 'goud', 10).gelukt, false, 'vol is vol');
  T.haalOp(S, b, 'graan', 10);
  assert.equal(T.verstop(S, b, 'goud', 500).aantal, Math.floor(10 / I.ruimte.goud), 'tien graan ruimte is tweehonderd goud');
  assert.equal(T.verstop(S, b, 'eieren', 1).gelukt, false, 'eieren verstop je niet');
  assert.equal(T.verstopplekOp(S, b.x, b.y), b);
});

// Een heel bezoek zonder scherm tot na de brief: de schout zwijgt overal.
function totNaDeBrief(S, voorVanBezoek) {
  for (let d = 151; d < BEZOEK; d++) T.tikInnerDag(S, d);
  if (voorVanBezoek) voorVanBezoek();
  T.tikInnerDag(S, BEZOEK);
  return S.inner.rapport;
}

test('het jaar: het rekenboek op 1 herfstmaand, de aankondiging, en het bezoek op 15 herfstmaand', () => {
  const S = maakS();
  oogst(S, 400);
  for (let d = 151; d < REKENBOEK; d++) T.tikInnerDag(S, d);
  assert.equal(S.rekenboek, undefined);
  T.tikInnerDag(S, REKENBOEK);
  assert.equal(S.rekenboek[1323].opgegeven, 400, 'zonder scherm geeft hij alles op');
  for (let d = REKENBOEK + 1; d < BEZOEK - 3; d++) T.tikInnerDag(S, d);
  T.tikInnerDag(S, BEZOEK - 3);
  assert.equal(S.inner.komtOp, BEZOEK);
  for (let d = BEZOEK - 2; d <= BEZOEK; d++) T.tikInnerDag(S, d);
  assert.ok(S.inner.rapport);
  assert.equal(S.inner.rapport.jaar, 1323);
});

test('wie alles opgeeft en niets verstopt, wekt weinig argwaan', () => {
  const S = maakS();
  oogst(S, 400);
  const r = totNaDeBrief(S);
  assert.ok(r.argwaan < 25, `argwaan ${r.argwaan}`);
});

test('wie de helft opgeeft en niets verstopt, valt door de mand', () => {
  const S = maakS();
  oogst(S, 400);
  S.rekenboek = { 1323: { echt: 400, opgegeven: 200, reden: 'nat' } };
  const r = totNaDeBrief(S);
  assert.ok(r.argwaan > 60, `argwaan ${r.argwaan}`);
});

test('wie een vijfde minder opgeeft met de hagel, en dat verstopt, komt er redelijk mee weg', () => {
  const S = maakS();
  oogst(S, 400);
  const b = kuil(S);
  S.rekenboek = { 1323: { echt: 400, opgegeven: 320, reden: 'hagel' } };
  T.verstop(S, b, 'graan', 60); // de kuil is maar zo groot; de rest is opgegeten of verkocht
  const vinden = I.vinden.kans;
  I.vinden.kans = 0; // hier gaat het om de telling, niet om het zoeken
  try {
    const r = totNaDeBrief(S);
    assert.ok(r.argwaan < 40, `argwaan ${r.argwaan}`);
  } finally {
    I.vinden.kans = vinden;
  }
});

test('uitleggen, afleiden, omkopen en wegblijven werken elk anders', () => {
  const uitkomst = (keuze, goud = 0) => {
    const S = maakS();
    oogst(S, 400);
    S.rekenboek = { 1323: { echt: 400, opgegeven: 200, reden: 'nat' } };
    T.zetVoorraad(S, 'goud', goud);
    for (let d = 151; d < BEZOEK; d++) T.tikInnerDag(S, d);
    T.beginBezoek(S, BEZOEK);
    const voor = S.inner.argwaan;
    const r = T.antwoord(S, keuze); // bij de akkers
    return { S, erbij: S.inner.argwaan - voor, r };
  };
  const zwijgen = uitkomst('zwijgen').erbij;
  assert.ok(Math.abs(uitkomst('uitleggen').erbij - zwijgen * (1 - I.uitleggen)) < 1e-9);
  const af = uitkomst('afleiden');
  assert.equal(af.r.gelukt, false, 'van de akkers leid je hem niet weg');
  assert.equal(af.S.inner.bezoek.i, 0, 'en hij staat er nog');
  assert.ok(Math.abs(uitkomst('weg').erbij - (zwijgen + I.wegblijven)) < 1e-9);
  assert.equal(uitkomst('omkopen', 0).r.gelukt, false, 'zonder goud koop je niemand om');
  const om = uitkomst('omkopen', 100);
  assert.ok(om.erbij < zwijgen, 'omkopen helpt');
  assert.ok(om.S.voorraad.goud < 100, 'en kost goud');
  assert.equal(om.S.inner.omgekocht, 1);
});

test('afleiden laat hem een plek overslaan, en de tweede keer merkt hij het beter', () => {
  const S = maakS();
  oogst(S, 400);
  S.gebouwen.push({ soort: 'stenenHuis', x: 10, y: 20, klaar: true, voortgang: 1, handen: 0, voorwerp: {} });
  for (let d = 151; d < BEZOEK; d++) T.tikInnerDag(S, d);
  T.beginBezoek(S, BEZOEK);
  assert.deepEqual(S.inner.bezoek.stops.map((s) => s.soort), ['akkers', 'schuur', 'nieuw']);
  T.antwoord(S, 'zwijgen'); // de akkers
  const a0 = S.inner.argwaan;
  T.antwoord(S, 'afleiden'); // de schuur
  const a1 = S.inner.argwaan;
  T.antwoord(S, 'afleiden'); // het nieuwe huis
  assert.equal(a1 - a0, I.afleiden);
  assert.equal(S.inner.argwaan - a1, 2 * I.afleiden);
});

test('omkopen wordt elk jaar duurder, en duurder naarmate hij argwaniger is', () => {
  const S = maakS();
  S.inner = T.nieuweInner();
  const eerst = T.omkoopPrijs(S);
  S.inner.argwaan = 80;
  assert.ok(T.omkoopPrijs(S) > eerst);
  const nu = T.omkoopPrijs(S);
  S.inner.omgekocht = 2;
  assert.ok(T.omkoopPrijs(S) > nu);
});

test('een verstopplek bij de schuur kan hij vinden; wat erin zit neemt hij mee; afleiden helpt', () => {
  const vinden = I.vinden.kans;
  I.vinden.kans = 1; // hij vindt hem zeker, als hij kijkt
  try {
    const S = maakS();
    oogst(S, 400);
    const b = kuil(S);
    T.verstop(S, b, 'graan', 50);
    T.zetVoorraad(S, 'goud', 40);
    T.verstop(S, b, 'goud', 40);
    const r = totNaDeBrief(S);
    assert.equal(r.gevonden.length, 1);
    assert.deepEqual(r.gevonden[0].inhoud, { graan: 50, goud: 40 });
    assert.deepEqual(T.verstoptIn(S, b), {}, 'leeg: hij nam het mee');
    assert.ok(r.argwaan >= I.vinden.argwaan);

    // Afleiden bij de schuur: dan kijkt hij daar niet rond.
    const S2 = maakS();
    oogst(S2, 400);
    const b2 = kuil(S2);
    T.verstop(S2, b2, 'graan', 50);
    for (let d = 151; d < BEZOEK; d++) T.tikInnerDag(S2, d);
    T.beginBezoek(S2, BEZOEK);
    T.antwoord(S2, 'zwijgen'); // de akkers
    const bij = T.antwoord(S2, 'afleiden'); // de schuur
    assert.deepEqual(bij.gevonden, []);
    assert.equal(T.verstoptIn(S2, b2).graan, 50);
  } finally {
    I.vinden.kans = vinden;
  }
});

test('een lege verstopplek valt niet op', () => {
  const vinden = I.vinden.kans;
  I.vinden.kans = 1;
  try {
    const S = maakS();
    oogst(S, 400);
    kuil(S);
    const r = totNaDeBrief(S);
    assert.equal(r.gevonden.length, 0);
  } finally {
    I.vinden.kans = vinden;
  }
});

test('de brief van de heer rekent met het rapport: de opgegeven oogst, en meer naarmate de argwaan', () => {
  const S = maakS();
  oogst(S, 400);
  S.rekenboek = { 1323: { echt: 400, opgegeven: 320, reden: 'hagel' } };
  totNaDeBrief(S);
  const r = S.inner.rapport;
  S.kalender.dag = BRIEF;
  const a = T.aanslag(S, 1);
  const verwacht = Math.ceil((r.opgegeven + (r.geteld - r.opgegeven) * (r.argwaan / 100)) * T.HEER_INSTELLINGEN.pachtDeel);
  assert.equal(a.graan, verwacht);
  // Meer argwaan: meer graan en meer goud.
  S.inner.rapport = { ...r, argwaan: 90 };
  const argwanend = T.aanslag(S, 1);
  assert.ok(argwanend.graan > a.graan);
  assert.ok(argwanend.goud > a.goud);
  // En de brief zegt het.
  S.heer = T.nieuweHeer();
  S.heer.aanslag = argwanend;
  assert.match(T.briefVanDeHeer(S).tekst, /inner/);
});

test('in het oude spel (geen mensen) komt er geen inner', () => {
  const S = maakS();
  S.bevolking = 0;
  for (let d = 1; d <= BEZOEK; d++) T.tikInnerDag(S, d);
  assert.equal(S.inner, undefined);
});
