// De wijnboerderij (werklijst vraag 136; Marcel, 8 okt: "Ik wil z.s.m. aan een wijnboerderij", en "Wijn wordt drank, zoals
// bier. Mensen dronken geen water"): een boerderij met een gezin en wijngaarden, de pluk in wijnmaand, wijn als wens van
// de ambachtslieden (10 okt), en de heer wil er wijn voor.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, stil en met een vaste worp, met een wijnboerderij die klaar is; jij bouwt.
function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 7;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  const D = S.dorp;
  T.zetOptie('wieBouwt', 'jij');
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'wijnboerderij', T.deurVan(D.wereld, huis));
  assert.ok(plek, 'er is plaats voor een wijnboerderij');
  const u = T.plaatsGebouw(D, 'wijnboerderij', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  u.instantie.klaar = true;
  return { S, D, g: u.instantie };
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

test('de wijngaard: het huis is vast, de ranken staan in rijen met een pad ertussen, en bouwen kan er niet', () => {
  const { D, g } = gehucht();
  try {
    const IN = T.WIJNGAARD_INSTELLINGEN;
    const ranken = T.rankenVan(D, g);
    assert.ok(ranken.length >= 15, `${ranken.length} ranken`);
    for (const v of ranken) {
      assert.ok(v.x >= g.x + IN.stuk.x && v.x < g.x + IN.stuk.x + IN.stuk.b && v.y >= g.y && v.y < g.y + IN.stuk.h, 'in de wijngaard');
      assert.equal((v.y - g.y - IN.stuk.y) % IN.rijOm, 0, 'in een rij');
      assert.ok(T.isBegaanbaar(D.wereld, v.x, v.y + 1) || v.y + 1 >= g.y + IN.stuk.h, 'met een pad ernaast');
    }
    assert.ok(T.isVast(D.wereld, g.x, g.y), 'het huis is vast');
    assert.ok(T.waaromNietOpDezeGrond(D, g.x + IN.stuk.x, g.y + 1), 'op het pad in de wijngaard bouw je niet');
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

test('in wijnmaand plukt het gezin dat er woont, en de wijn is er pas als de mand binnen is', () => {
  const dag = dagIn('wijnmaand', 3);
  const { S, D, g } = gehucht();
  const uren = T.BEWONERS_INSTELLINGEN.werkInUren;
  try {
    T.zetOptie('voorvallen', 'uit');
    // Twee volwassenen van het dorp gaan in de wijnboerderij wonen.
    const wie = D.bewoners.mensen.filter((p) => p.wezen && !p.schout && !p.wie && !T.isBoer(p.wezen) && T.LEEFTIJDEN[p.leeftijd].werkt != null).slice(0, 2);
    assert.equal(wie.length, 2);
    for (const p of wie) p.huis = g;
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
    T.BEWONERS_INSTELLINGEN.werkInUren = uren;
    T.optiesTerug();
  }
});

test('buiten wijnmaand ligt de wijnboerderij stil, en dat zegt de nacht op het gebouw', () => {
  const { S, D, g } = gehucht();
  try {
    S.kalender.dag = dagIn('zomermaand');
    T.tikGebouwenDag(D, Math.floor(S.kalender.dag));
    assert.equal(g.stilWant, T.GEBOUWEN.wijnboerderij.alleenIn.waarom);
    S.kalender.dag = dagIn('wijnmaand');
    T.tikGebouwenDag(D, Math.floor(S.kalender.dag));
    assert.equal(g.stilWant, null, 'in wijnmaand plukt ze');
  } finally {
    T.optiesTerug();
  }
});

test('er woont een gezin van boeren, en de heer wil er wijn voor', () => {
  const { D, g } = gehucht();
  try {
    assert.equal(T.standVan(g), 'boeren');
    assert.ok(T.GEBOUWEN.wijnboerderij.woonruimte > 0);
    assert.ok(T.GEBOUWEN.wijnboerderij.heer.wijn > 0);
    assert.equal(T.GEBOUWEN.wijnboerderij.trede, 'dorp', 'pas in een dorp');
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
  assert.ok(T.maaktGoed('wijnboerderij', 'wijn'), 'de wijnboerderij maakt hem, dus de raad en de verzoeken noemen haar');
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
  const boerderij = { soort: 'wijnboerderij', x: 30, y: 10, voet: { b: 10, h: 8 }, klaar: false };
  const D = { gebouwen: [huis, boerderij], bewoners: { mensen: [] }, voorraad: T.nieuweVoorraad(), wereld: { voorwerpen: [] } };
  const mensen = (n) => (D.bewoners.mensen = Array.from({ length: n }, () => ({ huis })));
  const IN = T.WIJNGAARD_INSTELLINGEN;
  const ranken = Math.ceil(IN.stuk.h / IN.rijOm) * IN.stuk.b;
  const pluk = ranken * IN.wijnPerRank - T.GEBOUWEN.wijnboerderij.heer.wijn;
  const dag = dagIn('hooimaand', 1);
  mensen(20);
  let v = T.wijnNaDePluk(D, dag);
  assert.equal(v.tot, 90, 'van 1 hooimaand tot 1 wijnmaand');
  assert.equal(v.pluk, pluk, 'een wijnboerderij zonder ranken op de kaart plukt er zoveel als ze straks heeft, min de heer');
  assert.ok(v.haalt, `twintig ambachtslieden drinken ${20 * 0.02} per dag, en ${pluk} haalt het jaar`);
  mensen(50);
  v = T.wijnNaDePluk(D, dag);
  assert.ok(!v.haalt && v.dagen === pluk, 'vijftig drinken een per dag: de pluk haalt het jaar niet');
  T.zetVoorraad(D, 'wijn', 90);
  assert.ok(!T.wijnNaDePluk(D, dag).haalt, 'wat ze tot de pluk drinken, komt uit wat er nu ligt');
  T.zetVoorraad(D, 'wijn', 90 + T.DAGEN_PER_JAAR - pluk);
  assert.ok(T.wijnNaDePluk(D, dag).haalt, 'wat er bij de pluk nog ligt, telt mee');
  mensen(0);
  assert.ok(T.wijnNaDePluk(D, dag).haalt, 'wie geen wijn wil, drinkt niets');
});

test('haalt de wijn het jaar na de pluk niet, dan vraagt het dorp nu een wijnboerderij erbij', () => {
  const { S, D } = gehucht();
  const echt = T.wijnNaDePluk;
  try {
    D.trede = 'dorp';
    S.kalender.dag = dagIn('hooimaand', 1);
    T.wijnNaDePluk = () => ({ haalt: true, dagen: 360, winter: 360 });
    assert.ok(!T.watTeBouwen(D).some((x) => x.soort === 'wijnboerderij'), 'haalt het, dan niet');
    T.wijnNaDePluk = () => ({ haalt: false, dagen: 200, winter: 360 });
    const x = T.watTeBouwen(D).find((y) => y.soort === 'wijnboerderij');
    assert.ok(x, 'haalt het niet, dan nu, ook al staat er een');
    assert.match(x.waarom, /200 van de 360 dagen/);
  } finally {
    T.wijnNaDePluk = echt;
    T.optiesTerug();
  }
});

// Marcel, 10 okt: "Wijn haalt kapel". In de speeltest van de wijn kwam een wijnboerderij ver van het dorp, en wilde haar
// gezin (boeren) een jaar lang een kapel die nergens kon komen, zodat het dorp niet won. Nu kijkt ze wat een erf nakijkt
// (T.waaromGeenKringPlek, js/wensen.js).
test('een wijnboerderij komt alleen waar haar gezin een kapel haalt, of waar er nog een kan komen', () => {
  const { D } = gehucht();
  const echt = T.WENSEN_INSTELLINGEN.kring.kapel;
  try {
    const deur = T.deurVan(D.wereld, D.gebouwen.find((g) => g.huis === 'schout'));
    const plek = T.plekVoor(D, 'wijnboerderij', deur);
    assert.ok(plek, 'met plaats voor een kapel komt er een tweede');
    assert.equal(T.waaromPastHetNiet(D, 'wijnboerderij', plek.x, plek.y), null);
    // Een kring zo klein dat er bij geen huis een kapel kan komen: dan komt ze nergens.
    T.WENSEN_INSTELLINGEN.kring.kapel = 2;
    assert.match(T.waaromPastHetNiet(D, 'wijnboerderij', plek.x, plek.y), /^Een wijnboerderij hier kan straks geen kapel halen/);
    assert.equal(T.plekVoor(D, 'wijnboerderij', deur), null);
    // Een werkplaats zonder gezin kijkt er niet naar.
    assert.equal(T.standVan({ soort: 'brouwerij' }), null);
  } finally {
    T.WENSEN_INSTELLINGEN.kring.kapel = echt;
    T.optiesTerug();
  }
});
