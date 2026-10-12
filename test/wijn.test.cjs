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
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
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
    const erbij = D.bewoners.mensen.filter((p) => p.wezen && !p.schout && p.huis !== g && !T.isBoer(D, p) && T.LEEFTIJDEN[p.leeftijd].werkt != null).slice(0, 2);
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
    assert.equal(D.voorraad.wijn, (geplukt - inDeMand) * T.WIJNGAARD_INSTELLINGEN.wijnPerRank, 'binnen is wat in het huis is');
    // 's Nachts gaat wat nog in de mand zat, mee naar huis.
    T.tikWijngaardDag(D, dag);
    assert.equal(D.voorraad.wijn, geplukt * T.WIJNGAARD_INSTELLINGEN.wijnPerRank);
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

// Marcel, 10 okt: "Inwoners willen wijn en bier. Afwisseling. Je kunt niet leven op 1 ding", en "B1, 0,02 is goed".
test('de ambachtslieden willen wijn naast hun bier, en wijn telt niet als bier', () => {
  assert.deepEqual(T.WENSEN.bier.goed, ['bier']);
  assert.deepEqual(T.WENSEN.wijn.goed, ['wijn']);
  assert.ok(!T.wensenVanStand('dorpelingen').includes('wijn'), 'de dorpelingen willen bier');
  assert.ok(T.wensenVanStand('ambachtslieden').includes('bier') && T.wensenVanStand('ambachtslieden').includes('wijn'));
  assert.ok(T.maaktGoed('wijnboerderij', 'wijn'), 'de wijnboerderij maakt hem, dus de raad noemt haar');
  assert.equal(T.WENSEN_INSTELLINGEN.perMens.wijn, 0.02);
  const D = { voorraad: T.nieuweVoorraad() };
  T.zetVoorraad(D, 'bier', 0);
  T.zetVoorraad(D, 'wijn', 10);
  T.gebruikGoederen(D, { goederen: { bier: { dorpelingen: { krijgt: 3 } }, wijn: { ambachtslieden: { krijgt: 2 } } } });
  assert.equal(D.voorraad.wijn, 8, 'twee wijn gedronken, en geen wijn in plaats van bier');
});

// Marcel, 10 okt: "Laten we vooruitkijken doen". Wat er na de pluk ligt, moet het jaar halen, zoals het hout de winter.
test('vooruitkijken: wat er bij de pluk ligt plus de pluk moet een jaar halen', () => {
  const huis = { soort: 'stenenHuis', x: 10, y: 10, voet: { b: 4, h: 4 }, klaar: true };
  const boerderij = { soort: 'wijnboerderij', x: 30, y: 10, voet: { b: 5, h: 4 }, klaar: false };
  const D = { gebouwen: [huis, boerderij], bewoners: { mensen: [] }, voorraad: T.nieuweVoorraad(), wereld: { voorwerpen: [] } };
  const mensen = (n) => (D.bewoners.mensen = Array.from({ length: n }, () => ({ huis })));
  const IN = T.WIJNGAARD_INSTELLINGEN;
  const dag = dagIn('hooimaand', 1);
  const heer = T.GEBOUWEN.wijnboerderij.heer.wijn;
  mensen(20);
  let v = T.wijnNaDePluk(D, dag);
  assert.equal(v.tot, 90, 'van 1 hooimaand tot 1 wijnmaand');
  assert.equal(v.pluk, -heer, 'een wijnboerderij zonder wijngaard plukt niets, en de heer wil toch zijn wijn');
  assert.ok(!v.haalt && v.dagen === 0, 'twintig ambachtslieden drinken, en er komt niets: dat haalt het jaar niet');
  // Een wijngaard die de bouwers nog planten, telt mee met de ranken die er straks staan (een rij om de rij).
  const aanleg = { soort: 'wijngaard', x: 36, y: 10, voet: { b: 5, h: 6 }, klaar: false, boerderij };
  D.gebouwen.push(aanleg);
  const ranken = Math.ceil(6 / IN.rijOm) * 5;
  const pluk = ranken * IN.wijnPerRank - heer;
  v = T.wijnNaDePluk(D, dag);
  assert.equal(v.pluk, pluk);
  assert.ok(v.haalt, `twintig ambachtslieden drinken ${20 * 0.02} per dag, en ${pluk} haalt het jaar`);
  // Is hij land, dan telt het wat er hangt: de ranken die nog niet geplukt zijn.
  D.gebouwen.pop();
  for (let i = 0; i < ranken; i++) D.wereld.voorwerpen.push({ soort: 'wijnrank', x: 36 + i, y: 10, boerderij, geplukt: null });
  assert.equal(T.wijnNaDePluk(D, dag).pluk, pluk, 'ranken op de kaart tellen zoals ranken in aanleg');
  mensen(50);
  v = T.wijnNaDePluk(D, dag);
  assert.ok(!v.haalt && v.dagen === pluk, 'vijftig drinken een per dag: de pluk haalt het jaar niet');
  T.zetVoorraad(D, 'wijn', 90);
  assert.ok(!T.wijnNaDePluk(D, dag).haalt, 'wat ze tot de pluk drinken, komt uit wat er nu ligt');
  T.zetVoorraad(D, 'wijn', 90 + T.DAGEN_PER_JAAR - pluk);
  assert.ok(T.wijnNaDePluk(D, dag).haalt, 'wat er bij de pluk nog ligt, telt mee');
  mensen(0);
  assert.ok(T.wijnNaDePluk(D, dag).haalt, 'wie geen wijn wil, drinkt niets');
  // Een wijnboerderij is er niet: dan is er niets om te plukken, en niets dat de heer vraagt.
  D.gebouwen.splice(D.gebouwen.indexOf(boerderij), 1);
  assert.equal(T.wijnNaDePluk(D, dag).pluk, 0);
});
