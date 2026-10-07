// De beesten in het bos (js/beesten.js; werklijst vraag 116, stap 1; Marcel, 4 okt: "Ik wil dat er beesten kunnen
// rondlopen in het bos. Wolven etc. Die de houthakker kunnen bedreigen. Rode ogen uit het duister.", en 7 okt: "a ja, b
// ja, c ja"): roedels wolven en groepjes herten, elk met een plek diep in het bos; overdag rusten ze, de wolven lopen 's
// nachts langs de bosrand en de herten grazen er in de schemering; komt er iemand, dan gaan ze weg; een wolf begint geen
// gevecht.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Een land van de maker, zoals een nieuw spel begint, stil en met een vaste worp.
function landVanDeMaker(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}

// Het spel zoveel uur laten lopen, zoals js/main.js het doet als je rondloopt: de beesten, en dan het lopen. Een beeld is
// `stap` seconden van de wereld (een dag is T.DAG_LENGTE seconden).
function uren(S, n, stap = 0.5) {
  const D = S.dorp;
  const beelden = Math.round((n * T.DAG_LENGTE) / 24 / stap);
  for (let k = 0; k < beelden; k++) {
    S.tijd += stap / 10;
    S.wereldTijd += stap;
    S.kalender.dag += stap / T.DAG_LENGTE;
    T.werkBeestenBij(S, D);
    T.beweegWezens(S, D.wereld, stap / 10, stap);
  }
}

// Op dit uur van een zomerdag, en de schout ver weg (de schout van het gehucht staat bij zijn huis, midden in het dorp).
function opUur(S, uur, dag = 60) {
  S.kalender.dag = dag + uur / 24;
}

const groepVan = (S, soort) => T.beestenVan(S.dorp).find((g) => g.G.soort === soort);
const leiderVan = (g) => g.leden.find((e) => e.leider);

test('elk land van de maker heeft een roedel wolven en herten, uit het zaad: hetzelfde land geeft dezelfde', () => {
  for (const zaad of [62707, 73425, 72022]) {
    const S = landVanDeMaker(zaad);
    const groepen = T.zetBeesten(S.dorp);
    assert.ok(groepen.some((G) => G.soort === 'wolf'), `${zaad}: een roedel`);
    assert.ok(groepen.some((G) => G.soort === 'hert'), `${zaad}: herten`);
    for (const { G, leden } of T.beestenVan(S.dorp)) {
      const [van, tot] = G.soort === 'wolf' ? T.BEESTEN_INSTELLINGEN.roedel : T.BEESTEN_INSTELLINGEN.kudde;
      assert.ok(leden.length >= van && leden.length <= tot, `${zaad}: ${leden.length} ${G.soort}`);
      assert.equal(leden.filter((e) => e.leider).length, 1, 'één leider');
      assert.ok(T.isBos(S.dorp.wereld, G.thuis.x, G.thuis.y), 'het hol ligt in het bos');
      assert.ok(G.rand.length >= 1, 'en hij heeft plekken aan de rand');
      for (const p of G.rand) assert.ok(T.zoekRoute(S.dorp.wereld, G.thuis, p, { tot: 0 }).length <= T.BEESTEN_INSTELLINGEN.randLopen);
    }
    const nog = landVanDeMaker(zaad);
    T.zetBeesten(nog.dorp);
    const kort = (S2) => T.beestenVan(S2.dorp).map(({ G, leden }) => [G.soort, G.thuis, G.rand, leden.map((e) => [e.tx, e.ty, e.vel || e.soort])]);
    assert.deepEqual(kort(nog), kort(S), 'hetzelfde land: dezelfde dieren op dezelfde plek');
  }
});

test('de herten: twee hindes en een hert met een gewei dat de groep leidt', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  const g = groepVan(S, 'hert');
  assert.equal(leiderVan(g).vel, 'hert2');
  for (const e of g.leden) if (!e.leider) assert.ok(['hert0', 'hert1'].includes(e.vel));
  for (const e of g.leden) assert.ok(!e.dier, 'geen vee: de inner telt ze niet, en ze grazen niet op de weide');
  assert.ok(!T.veeVan(S.dorp).some((e) => e.beest));
});

test('overdag rust de roedel bij zijn hol; vanaf zonsondergang loopt hij langs de bosrand, en na zonsopgang terug', () => {
  const S = landVanDeMaker(62707);
  opUur(S, 12);
  uren(S, 1);
  const g = groepVan(S, 'wolf');
  const thuis = g.G.thuis;
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), thuis) <= 4), 'overdag bij het hol');
  assert.ok(g.leden.every((e) => e.rust === 'liggen'), 'en ze liggen (zonder vel om te liggen staan ze)');
  // De avond en de nacht: de leider komt bij een plek aan de rand.
  const zon = T.zonVan(S.kalender.dag);
  opUur(S, zon.onder);
  let aanDeRand = false;
  for (let u = 0; u < 8 && !aanDeRand; u++) {
    uren(S, 0.5);
    aanDeRand = g.G.rand.some((p) => T.afstand(T.tegelVan(leiderVan(g)), p) <= 1);
  }
  assert.ok(aanDeRand, 'de leider staat aan de rand');
  // En de anderen lopen achter hem aan.
  uren(S, 0.5);
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), T.tegelVan(leiderVan(g))) <= 6), 'de roedel blijft bij elkaar');
  // De ochtend: terug naar het hol.
  opUur(S, zon.op + 2, 61);
  uren(S, 3);
  assert.ok(g.leden.every((e) => T.afstand(T.tegelVan(e), thuis) <= 4), 'na zonsopgang weer bij het hol');
});

test('de herten grazen in de schemering aan de bosrand, en liggen de rest van de tijd op hun legerplek', () => {
  const S = landVanDeMaker(62707);
  opUur(S, 13);
  uren(S, 1);
  const g = groepVan(S, 'hert');
  assert.ok(g.leden.every((e) => e.rust === 'liggen' && T.afstand(T.tegelVan(e), g.G.thuis) <= 4), 'midden op de dag liggen ze');
  const zon = T.zonVan(S.kalender.dag);
  opUur(S, zon.onder - 1);
  uren(S, 1);
  const l = leiderVan(g);
  assert.ok(g.G.rand.some((p) => T.afstand(T.tegelVan(l), p) <= 1), 'bij zonsondergang aan de rand');
  assert.ok(!T.isBos(S.dorp.wereld, l.tx, l.ty), 'op open grond');
  assert.ok(g.leden.every((e) => e.rust === 'grazen' || e.rust === 'staan'), 'ze grazen, of kijken om zich heen');
});

test('komt er iemand dichtbij, dan gaan ze weg: de herten rennen; wie sluipt, komt dichterbij', () => {
  const S = landVanDeMaker(62707);
  const zon = T.zonVan(60);
  opUur(S, zon.onder - 0.5);
  uren(S, 1.5);
  const g = groepVan(S, 'hert');
  const l = leiderVan(g);
  const lt = T.tegelVan(l);
  // De schout op een vrije tegel, zes tegels van de leider: binnen hoe schuw een hert is (zeven), maar sluipend niet.
  let plek = null;
  for (let dy = -6; dy <= 6 && !plek; dy++) {
    for (let dx = -6; dx <= 6 && !plek; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== 6 || !T.isBegaanbaar(S.wereld, lt.x + dx, lt.y + dy, { wezensBlokkeren: true })) continue;
      if (g.leden.some((e) => T.afstand(T.tegelVan(e), { x: lt.x + dx, y: lt.y + dy }) < 6)) continue;
      plek = { x: lt.x + dx, y: lt.y + dy };
    }
  }
  assert.ok(plek, 'een plek voor de schout');
  Object.assign(S.schout, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
  S.sluipen = true;
  g.G.keek = 0;
  uren(S, 0.05);
  assert.ok(!(g.G.weg > S.kalender.dag), 'wie sluipt, zien ze niet zo snel');
  S.sluipen = false;
  g.G.keek = 0;
  uren(S, 0.05);
  assert.ok(g.G.weg > S.kalender.dag, 'nu wel: ze gaan weg');
  assert.ok(g.leden.some((e) => e.rent), 'en ze rennen');
  assert.equal(l.snelheid, T.BEESTEN.hert.vlucht);
  const voor = T.afstand(T.tegelVan(l), plek);
  uren(S, 0.5);
  assert.ok(T.afstand(T.tegelVan(l), plek) > voor, 'verder van de schout');
});

test('een wolf begint geen gevecht, en wie hem aanklikt, kan hem aanvallen; een hert is geen getuige', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  const wolf = leiderVan(groepVan(S, 'wolf'));
  const hert = leiderVan(groepVan(S, 'hert'));
  // De schout naast de wolf: een monster dat hem ziet, begint een gevecht, een wolf niet.
  Object.assign(S.schout, { x: wolf.tx + 1, y: wolf.ty, tx: wolf.tx + 1, ty: wolf.ty });
  assert.equal(T.zoekOntdekking(S), null);
  assert.match(T.handelingVerkennen(S, { wezen: wolf }).tekst, /De wolf aanvallen/);
  assert.equal(T.handelingVerkennen(S, { wezen: hert }).tekst, 'Een hert');
  // Een hert vlak bij de schout ziet hem iets verstoppen, maar vertelt het niemand.
  Object.assign(S.schout, { x: hert.tx + 1, y: hert.ty, tx: hert.tx + 1, ty: hert.ty });
  assert.ok(!T.getuigenVan(S.dorp, null).includes(hert));
});

test('bewaren en laden houdt de groepen: hun dieren delen hun groep, en lopen verder', () => {
  const S = landVanDeMaker(73425);
  opUur(S, 19);
  uren(S, 0.5);
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  const groepen = T.beestenVan(terug.dorp);
  assert.equal(groepen.length, T.beestenVan(S.dorp).length);
  for (const { G, leden } of groepen) {
    assert.ok(leden.every((e) => e.groep === G), 'één groep, gedeeld');
    assert.equal(leden.filter((e) => e.leider).length, 1);
  }
  assert.ok(terug.dorp.beesten.gezet, 'ze komen er na het laden niet nog eens bij');
});

test('de spelregel "Beesten" uit: het bos is leeg', () => {
  const S = landVanDeMaker(62707);
  T.zetBeesten(S.dorp);
  assert.ok(S.dorp.wereld.wezens.some((e) => e.beest));
  T.zetOptie('beesten', 'uit');
  try {
    uren(S, 0.1);
    assert.ok(!S.dorp.wereld.wezens.some((e) => e.beest));
    uren(S, 0.1);
    assert.ok(!S.dorp.wereld.wezens.some((e) => e.beest), 'en er komen er geen');
  } finally {
    T.optiesTerug();
  }
  uren(S, 0.1);
  assert.ok(S.dorp.wereld.wezens.some((e) => e.beest), 'weer aan: ze zijn er weer');
});

test('de ogen van de wolf: twee van voren, een van opzij, geen van achteren, in elk beeld van zijn vellen', () => {
  const O = T.OGEN.wolf;
  const f = T.BEELDEN.figuren.wolf;
  for (const [houding, h] of Object.entries(f.houdingen)) {
    assert.equal(O[houding].length, 8, `${houding}: acht richtingen`);
    for (const rij of O[houding]) assert.equal(rij.length, h.beelden, `${houding}: elk beeld`);
  }
  const Z = f.richtingen.indexOf('Z');
  const N = f.richtingen.indexOf('N');
  const W = f.richtingen.indexOf('W');
  assert.equal(O.staan[Z][0].length, 2, 'van voren twee');
  assert.equal(O.staan[N][0].length, 0, 'van achteren geen');
  assert.equal(O.staan[W][0].length, 1, 'van opzij een');
  // Ze zitten in zijn kop: boven zijn voeten, niet verder dan de cel.
  for (const [dx, dy] of O.staan[Z][0]) assert.ok(dy < -5 && Math.abs(dx) < f.houdingen.staan.cel[0]);
});
