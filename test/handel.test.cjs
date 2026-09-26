// De handel zonder scherm (js/handel.js): wanneer de marskramer komt en weer gaat, wat iets kost,
// kopen en verkopen, zijn poppetje en zijn gesprek. Wat er door de handel omheen veranderde, staat
// bij zijn eigen module: een gebouw dat alleen maakt wat zijn grondstof toelaat en gereedschap in
// test/gebouwen.test.cjs, zout in test/behoeften.test.cjs. Zie ontwerp/spel.md, "Handel: de
// marskramer" (besloten door Marcel op 24 sep 2026) en ontwerp/werklijst.md, punt 4.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/dag.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
require('../js/handel.js');
const T = globalThis.Spel;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum in het eerste jaar.
function dagVan(maand, dagVanMaand) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}

// Een gehucht zonder kaart: alleen een plek voor de marskramer, zodat hij mag komen. Zonder
// poppetje (T.werkMarskramerBij draait hier niet) is hij meteen weg als zijn tijd om is.
function maakS() {
  return {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0,
    kalender: { dag: 0 }, inventaris: new Set(),
    wereld: { marskramer: { x: 5, y: 5 }, overgangen: [{ x: 9, y: 5, naar: 'wereld' }], wezens: [] },
  };
}

// Laat hem komen voor het bezoek van `i` (0 lente, 1 zomer, 2 herfst).
function metMarskramer(i) {
  const S = maakS();
  T.marskramerKomt(S, i || 0, 0);
  return S;
}

// ---------------------------------------------------------------------------------------------
// Wanneer hij komt
// ---------------------------------------------------------------------------------------------

test('de marskramer komt drie keer per jaar: in grasmaand, hooimaand en wijnmaand, nooit in de winter', () => {
  const bezoeken = [];
  for (let dag = 0; dag < T.DAGEN_PER_JAAR; dag++) {
    const i = T.marskramerBegintOp(dag);
    if (i != null) bezoeken.push({ i, datum: T.datumVanDag(dag) });
  }
  assert.equal(bezoeken.length, 3);
  assert.deepEqual(bezoeken.map((b) => T.MAANDEN[b.datum.maand].naam), ['grasmaand', 'hooimaand', 'wijnmaand']);
  for (const b of bezoeken) assert.notEqual(b.datum.seizoen, 'winter');
});

test('hij komt op zijn dag, blijft tien dagen, en gaat dan weer (en zet zolang zijn vlaggen)', () => {
  const S = maakS();
  const komt = dagVan('grasmaand', 5);
  for (let dag = 1; dag < komt; dag++) T.tikHandelDag(S, dag);
  assert.ok(!S.marskramer, 'vóór grasmaand 5 is hij er nog niet');
  T.tikHandelDag(S, komt);
  assert.ok(S.marskramer, 'op grasmaand 5 komt hij');
  assert.ok(T.heeftVlag(S, 'marskramerOpBezoek'));
  assert.ok(T.heeftVlag(S, 'marskramerLente'));
  assert.ok(T.kanHandelen(S));
  for (let dag = komt + 1; dag < komt + T.HANDEL_INSTELLINGEN.blijftDagen; dag++) T.tikHandelDag(S, dag);
  assert.ok(S.marskramer, 'de negende dag is hij er nog');
  T.tikHandelDag(S, komt + T.HANDEL_INSTELLINGEN.blijftDagen);
  assert.ok(!S.marskramer, 'na tien dagen is hij weg');
  assert.ok(!T.heeftVlag(S, 'marskramerOpBezoek'));
  assert.ok(!T.heeftVlag(S, 'marskramerLente'));
  assert.ok(!T.kanHandelen(S));
});

test('waar hij geen plek heeft (het oude spel), komt hij nooit', () => {
  const S = maakS();
  S.wereld = { wezens: [] };
  for (let dag = 0; dag < T.DAGEN_PER_JAAR; dag++) T.tikHandelDag(S, dag);
  assert.ok(!S.marskramer);
  assert.ok(!T.heeftVlag(S, 'marskramerOpBezoek'));
});

test('bij zijn vertrek zegt hij wanneer hij terugkomt, gerekend vanaf zijn eigen dag', () => {
  const S = maakS();
  S.kalender.dag = dagVan('wijnmaand', 20); // de kalender sprong al verder
  const berichten = [];
  const oudeUi = T.ui;
  T.ui = { bericht: (t) => berichten.push(t) };
  try {
    const komt = dagVan('hooimaand', 5);
    for (let dag = komt; dag <= komt + T.HANDEL_INSTELLINGEN.blijftDagen; dag++) T.tikHandelDag(S, dag);
  } finally {
    T.ui = oudeUi;
  }
  assert.match(berichten[berichten.length - 1], /terug in wijnmaand/);
});

test('na wijnmaand komt hij pas in grasmaand terug', () => {
  assert.equal(T.volgendeMarskramer(dagVan('wijnmaand', 20)), 'grasmaand');
  assert.equal(T.volgendeMarskramer(dagVan('grasmaand', 20)), 'hooimaand');
});

// ---------------------------------------------------------------------------------------------
// Prijzen, kopen en verkopen
// ---------------------------------------------------------------------------------------------

test('graan brengt in de lente het dubbele op van na de oogst', () => {
  const lente = metMarskramer(0);
  const herfst = metMarskramer(2);
  lente.voorraad.graan = herfst.voorraad.graan = 100;
  assert.equal(T.kanVerkopen(lente, 'graan', 1).opbrengst, 2 * T.kanVerkopen(herfst, 'graan', 1).opbrengst);
  assert.equal(T.prijsVanHetJaar(lente, 'graan', 'koopt'), 'duur');
  assert.equal(T.prijsVanHetJaar(herfst, 'graan', 'koopt'), 'goedkoop');
});

test('kopen: goud eraf, ijzer erbij, en zijn voorraad en beurs gaan mee', () => {
  const S = metMarskramer(0);
  S.voorraad.goud = 20;
  const prijs = T.HANDEL_INSTELLINGEN.verkoopt.ijzer.prijs[0];
  const r = T.koop(S, 'ijzer', 2);
  assert.ok(r.kan);
  assert.equal(S.voorraad.goud, 20 - 2 * prijs);
  assert.equal(S.voorraad.ijzer, 2);
  assert.equal(S.marskramer.heeft.ijzer, T.HANDEL_INSTELLINGEN.verkoopt.ijzer.heeft - 2);
  assert.equal(S.marskramer.beurs, T.HANDEL_INSTELLINGEN.beurs + 2 * prijs);
  assert.ok(S.gehad.ijzer, 'de balk mag ijzer nu laten zien');
});

test('kopen kan niet zonder goud, en niet meer dan hij bij zich heeft', () => {
  const S = metMarskramer(0);
  S.voorraad.goud = 1;
  const arm = T.kanKopen(S, 'ijzer', 1);
  assert.equal(arm.kan, false);
  assert.match(arm.reden, /goud/);
  S.voorraad.goud = 1000;
  const teVeel = T.kanKopen(S, 'ijzer', T.HANDEL_INSTELLINGEN.verkoopt.ijzer.heeft + 1);
  assert.equal(teVeel.kan, false);
  assert.equal(T.kanKopen(S, 'stenen', 1).kan, false, 'stenen verkoopt hij niet: die komen met de voerman');
  assert.equal(S.voorraad.goud, 1000, 'wat niet kan, kost ook niets');
});

test('verkopen gaat per pak, tot zijn beurs leeg of zijn mars vol is', () => {
  const S = metMarskramer(0);
  S.voorraad.graan = 1000;
  const { per, prijs } = T.kanVerkopen(S, 'graan', 1);
  T.verkoop(S, 'graan', 1);
  assert.equal(S.voorraad.graan, 1000 - per);
  assert.equal(S.voorraad.goud, prijs);
  assert.equal(S.marskramer.plaats, T.HANDEL_INSTELLINGEN.plaats - 1);
  // Blijf verkopen tot het niet meer kan: dan is of zijn beurs leeg, of zijn mars vol.
  let n = 0;
  while (T.verkoop(S, 'graan', 1).kan) n++;
  assert.ok(n > 0);
  const m = S.marskramer;
  assert.ok(m.plaats === 0 || m.beurs < prijs, 'hij stopt pas als hij niet meer kan');
  assert.equal(T.kanVerkopen(S, 'graan', 1).kan, false);
});

test('verkopen kan niet wat je niet hebt, en niet meer als hij vertrekt', () => {
  const S = metMarskramer(0);
  S.voorraad.wol = 3; // minder dan één baal
  assert.equal(T.kanVerkopen(S, 'wol', 1).kan, false);
  S.voorraad.wol = 50;
  assert.equal(T.kanVerkopen(S, 'wol', 1).kan, true);
  S.marskramer.weg = true;
  assert.equal(T.kanVerkopen(S, 'wol', 1).kan, false);
  assert.equal(T.kanKopen(S, 'zout', 1).kan, false);
});

// ---------------------------------------------------------------------------------------------
// Zijn poppetje: over de weg binnen, naar de brink, en weer weg
// ---------------------------------------------------------------------------------------------

test('zijn poppetje komt over de weg, zijn dagen tellen pas op de brink, en daarna loopt hij weer weg', () => {
  const S = maakS();
  const komt = dagVan('grasmaand', 5);
  S.kalender.dag = komt;
  T.tikHandelDag(S, komt);
  T.werkMarskramerBij(S);
  assert.equal(S.marskramer.wezen, null, 'om middernacht wacht hij nog: hij komt overdag (js/dag.js)');
  S.kalender.dag = komt + 10 / 24;
  T.werkMarskramerBij(S);
  const e = S.marskramer.wezen;
  assert.ok(e, 'er staat een marskramer in de wereld');
  assert.deepEqual([e.tx, e.ty], [9, 5], 'hij komt binnen over de weg (de uitgang)');
  assert.deepEqual([e.thuis.x, e.thuis.y], [5, 5], 'en loopt naar zijn plek op de brink');
  // Onderweg telt zijn tijd niet: ook na tien dagen gaat hij nog niet weg.
  const tienLater = komt + T.HANDEL_INSTELLINGEN.blijftDagen;
  T.tikHandelDag(S, tienLater);
  assert.ok(T.kanHandelen(S), 'wie nog onderweg is, vertrekt niet');
  // Hij staat er: nu beginnen zijn dagen.
  e.tx = e.x = 5;
  e.ty = e.y = 5;
  S.kalender.dag = tienLater;
  T.werkMarskramerBij(S);
  assert.ok(S.marskramer.staat);
  assert.equal(S.marskramer.gaatOp, tienLater + T.HANDEL_INSTELLINGEN.blijftDagen);
  T.tikHandelDag(S, S.marskramer.gaatOp);
  assert.ok(S.marskramer && S.marskramer.weg, 'zijn tijd is om: hij vertrekt');
  assert.ok(T.heeftVlag(S, 'marskramerVertrekt'));
  T.werkMarskramerBij(S);
  assert.deepEqual([e.thuis.x, e.thuis.y], [9, 5], 'hij loopt terug naar de weg');
  e.tx = e.x = 9;
  T.werkMarskramerBij(S);
  assert.ok(!S.marskramer, 'aan de weg is hij weg');
  assert.equal(S.wereld.wezens.indexOf(e), -1, 'ook uit de wereld');
  assert.ok(!T.heeftVlag(S, 'marskramerOpBezoek'));
});

// ---------------------------------------------------------------------------------------------
// Zijn gesprek
// ---------------------------------------------------------------------------------------------

test('in het gehucht opent zijn gesprek de handel, en buiten zijn bezoek niet', () => {
  const S = metMarskramer(2);
  const knoop = T.gesprekKnoop(S, 'marskramer', 'welkom');
  assert.match(knoop.tekst, /winter/);
  assert.ok(knoop.keuzes.some((k) => k.doe && k.doe.handel), 'er is een antwoord dat de handel opent');
  // Buiten een bezoek (geen vlag marskramerOpBezoek) valt er niets te handelen. Tot 25 sep had hij
  // daar nog een gesprek uit het oude spel, over een sleutel bij de toren.
  const buiten = { inventaris: new Set(), schout: {} };
  const buitenKnoop = T.gesprekKnoop(buiten, 'marskramer', 'welkom');
  assert.ok(!buitenKnoop.keuzes.some((k) => k.doe && k.doe.handel));
  assert.ok(buitenKnoop.keuzes.some((k) => k.sluit), 'wel een afscheid');
});

test('doe: { handel: true } in een gesprek opent het venster', () => {
  const S = metMarskramer(0);
  const oudeUi = T.ui;
  let geopend = 0;
  T.ui = { openHandel: () => geopend++ };
  try {
    T.doeGevolg(S, { handel: true });
  } finally {
    T.ui = oudeUi;
  }
  assert.equal(geopend, 1);
});
