// De soldaten doorzoeken het dorp (js/doorzoeken.js, sinds 27 sep; werklijst punt 4, stuk 1; vraag 41,
// Marcel: "A ja B ja C ja"): onder de grens op twee of drie plekken, waar de schout ze langs leidt; na een
// paar uur kiezen ze zelf, zijn eigen kelder eerst; zo vaak als zijn argwaan kiest de heer; en boven de
// grens het hele dorp in één keer, zoals altijd.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.DOORZOEKEN_INSTELLINGEN;
const V = T.VERSTOP_INSTELLINGEN;

const berichten = [];
T.ui = { bericht(t) { berichten.push(t); }, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
// Midden op een gewone dag: zo loopt niets anders door de toets heen.
const DAG = dagVan('wijnmaand', 10) + 10 / 24;

// Het gehucht, met graan genoeg. `heerKomt` zet de heer op het plein met zijn twee soldaten: pas dan,
// want zolang hij er is, zet je niets meer weg (T.kanVerstoppen).
function gehucht(argwaan = 0) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  console.warn = () => {};
  T.BOEREN_INSTELLINGEN.loten = false;
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  Object.assign(S.kalender, { dag: DAG, snelheid: 10 });
  S.dorp.inner = Object.assign(T.nieuweInner(), { argwaan });
  T.zetVoorraad(S.dorp, 'graan', 200);
  T.zetVoorraad(S.dorp, 'goud', 20);
  return { S, heerKomt: () => heerKomt(S) };
}
function heerKomt(S) {
  const heer = T.maakMens('heer', 37, 40, 1);
  const soldaten = [T.maakMens('soldaat', 36, 41, 2), T.maakMens('soldaat', 38, 41, 2)];
  S.dorp.heer = T.nieuweHeer();
  S.dorp.heer.bezoek = { staat: true, weg: false, wezens: [heer, ...soldaten], betaald: null };
  S.wereld.wezens.push(heer, ...soldaten);
  berichten.length = 0;
  return soldaten;
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  S.kalender.dag += (dtW / T.DAG_LENGTE) || 0;
  T.werkAnimatiesBij(S, dt, dtW);
  T.laatDwalen(S, dtW);
  T.werkDoorzoekenBij(S.dorp);
}
// Stap tot `klaar` of tot er zoveel speluren om zijn.
function loopTot(S, klaar, uren) {
  const tot = S.kalender.dag + uren / 24;
  while (!klaar() && S.kalender.dag < tot) stap(S, 0.05);
  return klaar();
}
const zetSchout = (S, x, y) => Object.assign(S.schout, { x, y, tx: x, ty: y, pad: [], onderweg: false });
const plekVan = (S, huis) => T.verstopPlekVan(S.dorp, S.dorp.gebouwen.find((g) => g.huis === huis));
// Een instelling even anders, en daarna terug.
function met(blok, pad, waarde, doe) {
  const delen = pad.split('.');
  const laatste = delen.pop();
  const o = delen.reduce((a, k) => a[k], blok);
  const was = o[laatste];
  o[laatste] = waarde;
  try {
    return doe();
  } finally {
    o[laatste] = was;
  }
}

test('onder de grens zoeken ze op twee of drie plekken, en de schout loopt voor', () => {
  const { S, heerKomt } = gehucht(0);
  heerKomt();
  const z = T.beginDoorzoeken(S.dorp);
  assert.ok(z.nodig >= IN.minst && z.nodig <= IN.meest, `twee of drie plekken (${z.nodig})`);
  assert.equal(z.heerKiest, false, 'zonder argwaan kiest de heer nooit');
  assert.equal(z.doelen, undefined, 'de schout bepaalt de route');
  assert.match(berichten.join(' '), /lopen met je mee/);
});

test('wat ze met de schout vlak passeren, doorzoeken ze; wat ze vinden, is weg', () => {
  const { S, heerKomt } = gehucht(0);
  const klaas = plekVan(S, 'boer1');
  const kelder = klaas.gebouw;
  assert.ok(T.verstop(S.dorp, kelder, 'graan', 20).kan);
  const soldaten = heerKomt();
  assert.equal(T.verstop(S.dorp, kelder, 'graan', 5).kan, false, 'zolang de heer er is, zet je niets meer weg');
  met(V, 'plekken.boerderij.vinden', 1, () => {
    const z = T.beginDoorzoeken(S.dorp);
    // De schout gaat bij de deur van Klaas staan, aan de rand van het dorp; de soldaten lopen naar hem
    // toe (dat kost wat uren), en passeren onderweg niets wat telt.
    const deur = T.deurVan(S.wereld, kelder);
    zetSchout(S, deur.x, deur.y);
    assert.ok(loopTot(S, () => z.gedaan.includes(kelder), 4), 'ze doorzochten de kelder van Klaas');
    assert.equal(z.gedaan[0], kelder, 'wat ze onderweg naar de schout passeerden, telde niet');
    assert.equal(T.inhoudTekst(kelder.verstopt), '', 'het graan is weg');
    assert.ok(z.gevonden.some((t) => t.includes(klaas.naam)));
    assert.ok(berichten.some((t) => t.startsWith(`De soldaten doorzoeken ${klaas.naam}, en vinden 20 graan`)));
    assert.ok(soldaten.every((s) => !s.dwaalt || z.klaar), 'zolang ze zoeken, lopen ze met de schout mee');
  });
});

test('leidt de schout ze nergens langs, dan kiezen ze na een paar uur zelf, zijn eigen kelder eerst', () => {
  const { S, heerKomt } = gehucht(0);
  const eigen = plekVan(S, 'schout');
  assert.ok(T.verstop(S.dorp, eigen.gebouw, 'graan', 10).kan);
  heerKomt();
  met(V, 'vindenBijSchout', 1, () => {
    const z = T.beginDoorzoeken(S.dorp);
    // Midden op het plein, ver genoeg van elke kelder.
    zetSchout(S, 37, 38);
    loopTot(S, () => z.gedaan.length > 0, IN.wachtUren - 0.25);
    assert.equal(z.gedaan.length, 0, 'zolang ze de schout volgen, passeren ze niets');
    assert.ok(loopTot(S, () => z.doelen, 1), 'dan kiezen ze zelf');
    assert.equal(z.zelf, true);
    assert.equal(z.doelen[0], eigen.gebouw, 'de kelder van de schout eerst');
    assert.ok(loopTot(S, () => z.gedaan.includes(eigen.gebouw), 3), 'ze lopen erheen en zoeken');
    assert.equal(T.inhoudTekst(eigen.gebouw.verstopt), '', 'en vinden het');
    assert.ok(loopTot(S, () => z.klaar, 6), 'tot ze er genoeg hebben gehad');
    assert.equal(z.gedaan.length, z.nodig);
  });
});

test('zo vaak als zijn argwaan kiest de heer zelf, en dan wat het rijkst oogt', () => {
  const { S, heerKomt } = gehucht(1);
  heerKomt();
  const z = T.beginDoorzoeken(S.dorp);
  assert.equal(z.heerKiest, true, 'bij volle argwaan altijd');
  assert.equal(z.doelen.length, z.nodig);
  assert.equal(z.doelen[0], plekVan(S, 'schout').gebouw, 'de kelder van de schout eerst');
  const grootte = (g) => T.voetVanGebouw(g).b * T.voetVanGebouw(g).h;
  const anderen = T.verstopPlekken(S.dorp).filter((p) => !p.vanSchout && p.gebouw.soort !== 'kapel').map((p) => p.gebouw);
  assert.equal(grootte(z.doelen[1]), Math.max(...anderen.map(grootte)), 'dan het grootste gebouw');
  assert.match(berichten.join(' '), /De heer wijst zelf aan/);
  // Zonder argwaan nooit, en daartussen ongeveer zo vaak als de argwaan zegt.
  let keer = 0;
  for (let d = 0; d < 200; d++) {
    const t = gehucht(0.3);
    t.heerKomt();
    t.S.kalender.dag = DAG + d;
    if (T.beginDoorzoeken(t.S.dorp).heerKiest) keer++;
  }
  assert.ok(keer > 30 && keer < 90, `bij 30% argwaan kiest hij ongeveer een op de drie keer (${keer} van 200)`);
});

test('gaat de heer weg voor ze klaar zijn, dan doorzoeken ze de rest nog voor ze gaan', () => {
  const { S, heerKomt } = gehucht(0);
  const soldaten = heerKomt();
  const z = T.beginDoorzoeken(S.dorp);
  S.dorp.heer.bezoek.weg = true;
  T.werkDoorzoekenBij(S.dorp);
  assert.equal(z.klaar, true);
  assert.equal(z.gedaan.length, z.nodig);
  assert.equal(z.gedaan[0], plekVan(S, 'schout').gebouw, 'hun eigen volgorde: de kelder van de schout eerst');
  assert.ok(soldaten.every((s) => s.dwaalt), 'en ze lopen weer op hun eigen maat, de weg af');
  assert.match(berichten.join(' '), /Voor ze gaan, doorzoeken de soldaten nog/);
});

test('boven de grens doorzoeken ze het hele dorp in één keer, zoals altijd', () => {
  const { S, heerKomt } = gehucht(T.INNER_INSTELLINGEN.doorzoekenVanaf);
  for (const g of S.dorp.gebouwen) if (T.verstopPlekVan(S.dorp, g) && !T.verstopPlekVan(S.dorp, g).weigert) T.verstop(S.dorp, g, 'goud', 1);
  heerKomt();
  S.dorp.heer.bezoek.staat = false;
  met(V, 'vindenBijSchout', 1, () => met(V, 'plekken.boerderij.vinden', 1, () => met(V, 'plekken.huis.vinden', 1, () => {
    T.heerStaatErOp(S.dorp);
    assert.equal(S.dorp.heer.bezoek.zoeken, undefined, 'geen route: het hele dorp');
    assert.match(berichten.join(' '), /doorzoeken het dorp/);
  })));
});
