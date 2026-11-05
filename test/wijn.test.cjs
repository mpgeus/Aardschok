// De wijnboerderij (werklijst vraag 136 en 155; Marcel, 8 okt: "Ik wil z.s.m. aan een wijnboerderij", "Wijn wordt drank, zoals
// bier. Mensen dronken geen water", en 12 okt: "ik wil tóch een apart wijnboerderij gebouw"): een huis met een gezin en een
// wijngaard ernaast, de pluk in wijnmaand, wijn als wens van de ambachtslieden (10 okt), en de heer wil er wijn voor.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, legVeldBij, bouwAf, dagen, zetBijHetVuur, metVastToeval } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs) met een wijnboerderij en haar wijngaard: de wijngaard is een veld naast de wijnboerderij (vraag
// 155). Het proefdorp heeft alleen boerderijen met een akker, dus komt er een wijnboerderij bij, waar na de eerste nacht een
// gezin uit een hut intrekt, en de wijngaard als veld erbij, meteen af (de nacht erop is het land, met zijn ranken). `g` is
// de wijnboerderij, `veld` de wijngaard.
function dorp() {
  const { S, D, w } = proefDorp(T, { boerderijen: 1 });
  Object.assign(S, { vlaggen: new Set() });
  T.S = S;
  const dag = Math.floor(S.kalender.dag);
  const echt = T.BEGIN_INSTELLINGEN.bouwBereik;
  T.BEGIN_INSTELLINGEN.bouwBereik = 40; // rond het vuur is het krap, zoals in test/grond.cjs
  let g;
  let veld;
  try {
    metVastToeval(7, () => {
      for (const [wat, k] of Object.entries(T.GEBOUWEN.wijnboerderij.kosten || {})) T.wijzigVoorraad(D, wat, k);
      g = zetBijHetVuur(T, D, 'wijnboerderij');
      bouwAf(T, D, g, dag);
    });
    dagen(T, S, dag + 1);
    bouwAf(T, D, legVeldBij(T, D, 'wijngaard', g), dag + 1);
    dagen(T, S, dag + 2);
  } finally {
    T.BEGIN_INSTELLINGEN.bouwBereik = echt;
  }
  veld = w.wijngaarden.find((v) => v.boerderij === g);
  assert.ok(g.klaar && T.isWijnboerderij(g) && veld, 'een wijnboerderij met een wijngaard');
  return { S, D, g, veld };
}

const eersteVan = (maand) => T.MAANDEN.findIndex((m) => m.naam === maand);
function dagIn(maand, dagVanMaand = 10) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (x.maand === eersteVan(maand) && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (zoals in test/veldwerk.test.cjs).
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    T.wereldTik(S); // een tik van de wereld, zoals het spel (js/tik.js)
  }
}

test('de wijngaard: de ranken staan in rijen met een pad ertussen naast het huis, en bouwen kan er niet', () => {
  const { D, g, veld } = dorp();
  try {
    const IN = T.WIJNGAARD_INSTELLINGEN;
    const ranken = T.rankenVan(D, g);
    assert.ok(ranken.length >= 15, `${ranken.length} ranken`);
    for (const v of ranken) {
      assert.ok(v.x >= veld.x && v.x < veld.x + veld.b && v.y >= veld.y && v.y < veld.y + veld.h, 'in de wijngaard');
      assert.equal((v.y - veld.y) % IN.rijOm, 0, 'in een rij');
      assert.ok(T.isBegaanbaar(D.wereld, v.x, v.y + 1) || v.y + 1 >= veld.y + veld.h, 'met een pad ernaast');
    }
    assert.ok(T.isVast(D.wereld, g.x, g.y), 'het huis is vast');
    assert.ok(!ranken.some((v) => v.x >= g.x && v.x < g.x + 5 && v.y >= g.y && v.y < g.y + 4), 'de ranken staan niet in het huis');
    assert.ok(T.waaromNietOpDezeGrond(D, veld.x + 1, veld.y + 1), 'op het pad in de wijngaard bouw je niet');
  } finally {
    T.optiesTerug();
  }
});

test('een rank door het jaar: kaal, blad, vol, en leeg als hij geplukt is', () => {
  const v = { soort: 'wijnrank', geplukt: null };
  assert.equal(T.rankStand(v, dagIn('louwmaand')), 'kaal');
  assert.equal(T.rankStand(v, dagIn('zomermaand')), 'blad');
  assert.equal(T.rankStand(v, dagIn('wijnmaand')), 'vol');
  T.plukRank(v, dagIn('wijnmaand'));
  assert.equal(T.rankStand(v, dagIn('wijnmaand', 20)), 'leeg', 'geplukt');
  assert.equal(T.rankStand(v, dagIn('wijnmaand') + T.DAGEN_PER_JAAR), 'vol', 'het jaar erna weer vol');
  assert.equal(T.rankStand({ geplukt: null }, dagIn('slachtmaand')), 'leeg', 'na de pluk is wat er hing, verloren');
});

// `zonderAkker`: een dorp met alleen een wijnboerderij (een wijnboer zonder een akker in het dorp) plukt ook (vraag 155).
function pluktInWijnmaand(zonderAkker) {
  const dag = dagIn('wijnmaand', 3);
  const { S, D, g } = dorp();
  try {
    T.zetOptie('voorvallen', 'uit');
    if (zonderAkker) {
      D.wereld.akkers.length = 0;
      for (const e of D.wereld.wezens) delete e.werkAkkers;
    }
    assert.equal(!!(D.wereld.akkers && D.wereld.akkers.length), !zonderAkker);
    // Twee volwassenen van het dorp gaan bij het gezin van de boer wonen, op de wijnboerderij.
    const erbij = D.bewoners.mensen.filter((p) => p.wezen && !p.aanvoerder && p.huis !== g && !T.isBoer(D, p) && T.LEEFTIJDEN[p.leeftijd].werkt != null).slice(0, 2);
    assert.equal(erbij.length, 2);
    for (const p of erbij) p.huis = g;
    const wie = D.bewoners.mensen.filter((p) => p.huis === g && p.wezen);
    S.kalender.dag = dag + 6 / 24;
    D.gebouwenDag = dag;
    T.zetVoorraad(D, 'wijn', 0);
    T.tikWijngaardDag(D, dag);
    assert.ok(g.plukt, 'het gezin plukt');
    totUur(S, dag, 17);
    const geplukt = T.rankenVan(D, g).filter((v) => T.rankStand(v, S.kalender.dag) === 'leeg').length;
    assert.ok(geplukt >= T.WIJNGAARD_INSTELLINGEN.mand, `${geplukt} ranken geplukt`);
    const inDeMand = wie.reduce((n, p) => n + (p.wezen.mand || 0), 0);
    // Binnen is bij het huis: op zijn stapel tot een drager of een kar hem haalt, onderweg, of al in de opslag (js/kar.js;
    // C, stap 3, en vraag 184).
    const vervoerders = () => T.karrenVan(D).concat(D.bewoners.mensen.map((p) => p.vervoer).filter(Boolean));
    const onderweg = () => vervoerders().reduce((n, v) => n + ((v.lading && v.lading.wijn) || 0), 0);
    const wijn = () => D.voorraad.wijn + T.opDeStapels(D, 'wijn') + onderweg();
    assert.equal(wijn(), (geplukt - inDeMand) * T.WIJNGAARD_INSTELLINGEN.wijnPerRank, 'binnen is wat in het huis is');
    // 's Nachts gaat wat nog in de mand zat, mee naar huis.
    T.tikWijngaardDag(D, dag);
    assert.equal(wijn(), geplukt * T.WIJNGAARD_INSTELLINGEN.wijnPerRank);
  } finally {
    T.optiesTerug();
  }
}

test('in wijnmaand plukt het gezin dat er woont, en de wijn is er pas als de mand binnen is', () => pluktInWijnmaand(false));
test('ook in een dorp zonder een akker plukt het gezin van de wijnboerderij, en komt de wijn binnen', () => pluktInWijnmaand(true));

test('buiten wijnmaand plukt niemand, en in wijnmaand het gezin dat er woont', () => {
  const { S, D, g } = dorp();
  try {
    const nacht = (dag) => {
      S.kalender.dag = dag + 0.3;
      T.tikWijngaardDag(D, dag);
    };
    nacht(dagIn('zomermaand'));
    assert.equal(g.plukt, false, 'in zomermaand hangt er niets te plukken');
    nacht(dagIn('wijnmaand', 1) - 1);
    assert.equal(g.plukt, true, 'de nacht voor wijnmaand: morgen plukt het gezin');
    nacht(dagIn('wijnmaand', 20));
    assert.equal(g.plukt, true, 'zolang er volle ranken hangen');
  } finally {
    T.optiesTerug();
  }
});

test('de wijnboerderij is een boerenhuis: er woont een gezin van boeren', () => {
  const { D, g } = dorp();
  try {
    assert.equal(T.standVan(g), 'boeren');
    assert.ok(D.bewoners.mensen.some((p) => p.huis === g), 'er woont een gezin');
    assert.ok(T.boerVan(D, g), 'met een boer');
  } finally {
    T.optiesTerug();
  }
});
