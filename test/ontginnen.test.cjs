// Ontginnen (js/ontginnen.js; werklijst vraag 107; Marcel, 5 okt: "107 a b c d e ja"): komt het dorp graan tekort, dan
// vraagt een boer of zijn zoon je om een stuk heide naast zijn akker te ontginnen, dertig tegels. Ja kost het vertrouwen
// van het dorp, want de meent is van iedereen; een maand plaggen steken, en in lentemaand is het een akker.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

// Het ontworpen gehucht, met een vast zaad, op `dag` (40: 11 grasmaand, zeven uur 's ochtends).
function gehucht(dag = 40 + 7 / 24) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
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
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  T.S = S;
  return S;
}
const lopend = (D) => D.voorvallen && D.voorvallen.lopend;
const antwoord = (n) => T.GESPREKKEN.ontginverzoek.knopen.begin.keuzes[n];
function zeg(S, n) {
  const L = lopend(S.dorp);
  T.doeGevolg(S, S.dorp, antwoord(n).doe);
  T.voorvalBeantwoord(S.dorp, L.id);
}
// Een verzoek om te ontginnen, nu: het dorp heeft geen graan meer boven wat de groei vraagt.
function verzoek(S) {
  const D = S.dorp;
  D.voorraad.graan = 0;
  assert.ok(T.graanTekort(D), 'het dorp komt graan tekort');
  assert.ok(T.beginOntginverzoek(D, Math.floor(S.kalender.dag)), 'er komt iemand vragen');
  return lopend(D);
}
const opVeld = (v, x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;

test('komt het dorp graan tekort, dan vraagt een boer of zijn zoon om het stuk heide het dichtst bij zijn akker, dertig tegels', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  D.voorraad.graan = 500;
  assert.ok(!T.graanTekort(D));
  assert.equal(T.beginOntginverzoek(D, 40), false, 'zonder tekort vraagt niemand het');
  const L = verzoek(S);
  assert.equal(L.id, 'ontginverzoek');
  const o = L.ontgin;
  assert.equal(o.b * o.h, 30);
  const meent = w.meenten.find((m) => m.meent && opVeld(m, o.x, o.y));
  assert.ok(meent, 'op de heide');
  for (let y = o.y; y < o.y + o.h; y++) {
    for (let x = o.x; x < o.x + o.b; x++) {
      assert.ok(opVeld(meent, x, y) && T.isBegaanbaar(w, x, y) && !T.veldOp(w, x, y), `${x},${y} is vrije heide`);
    }
  }
  // Naast zijn akker als het kan, en anders zo dichtbij als het kan (vraag 107, d): op het ontworpen gehucht ligt de
  // heide tien tegels van de dichtste akker (die van boer5), en het stuk komt in de hoek die daar het dichtst bij ligt.
  const boer = o.boer;
  const afstand = (a, v) => Math.max(0, v.x - (a.x + a.b - 1), a.x - (v.x + v.b - 1), v.y - (a.y + a.h - 1), a.y - (v.y + v.h - 1));
  const naarDeHeide = (e) => Math.min(...e.werkAkkers.map((v) => afstand(meent, v)));
  const boeren = w.wezens.filter((e) => e.werkAkkers && e.werkAkkers.length);
  assert.equal(naarDeHeide(boer), Math.min(...boeren.map(naarDeHeide)), 'de boer met een akker het dichtst bij de heide');
  assert.equal(Math.min(...boer.werkAkkers.map((v) => afstand(o, v))), naarDeHeide(boer), 'zo dicht bij zijn akker als de heide komt');
  const p = T.bewonerVan(D, boer);
  assert.ok(L.wie === p || (L.wie.huis === p.huis && L.wie.band === 'zoon'), 'de boer, of zijn zoon');
  const tekst = T.vulWoordenIn(D, T.GESPREKKEN.ontginverzoek.knopen.begin.tekst[0].zeg);
  assert.match(tekst, /heide/);
  assert.match(tekst, /30 tegels/);
});

test('ja: het wordt een veld van zijn boerderij dat nog ontgonnen wordt, de schapen grazen er niet meer, en het vertrouwen zakt', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const L = verzoek(S);
  const o = { ...L.ontgin };
  const meent = w.meenten.find((m) => m.meent && opVeld(m, o.x, o.y));
  const meentVoor = T.weideStand(D, meent).tegels;
  const vertrouwen = T.bazenNu(D).vertrouwen;
  zeg(S, 0);
  const veld = w.akkers.find((v) => v.ontginning);
  assert.ok(veld, 'een veld in ontginning');
  assert.deepEqual([veld.x, veld.y, veld.b, veld.h], [o.x, o.y, o.b, o.h]);
  assert.ok(o.boer.werkAkkers.includes(veld), 'van zijn boerderij');
  assert.equal(T.boerVanVeld(D, veld), o.boer);
  assert.equal(T.bestemmingVan(veld), 'braak', 'het rust tot het klaar is');
  assert.equal(T.planVan(veld), 'akker', 'en wordt in lentemaand een akker');
  assert.equal(veld.ontginning.tot, 40 + T.ONTGINNEN_INSTELLINGEN.heideDagen, 'een maand');
  assert.equal(T.bazenNu(D).vertrouwen, vertrouwen - 5, 'de meent is van iedereen');
  assert.equal(T.weideStand(D, meent).tegels, meentVoor - 30, 'de meent is dertig tegels kleiner');
  const schaap = T.veeVan(D).find((e) => e.weide === meent);
  if (schaap) assert.ok(!T.graaslandVan(w, schaap).op(o.x, o.y), 'een schaap graast er niet meer');
  const net = T.aangelegdNet(D);
  for (const t of T.akkerTegels(veld)) assert.notEqual(net[t.x + t.y * w.tegels[0].length], 2, `geen paadje over ${t.x},${t.y}`);
  assert.equal(T.akkerTegelStadium(veld, o.x, o.y, 'groen'), 'heide', 'wat hij nog niet stak, is heide');
  T.steekPlag(veld, o.x, o.y);
  assert.equal(T.akkerTegelStadium(veld, o.x, o.y, 'groen'), 'geploegd', 'wat hij stak, is kale grond');
  assert.equal(T.beginOntginverzoek(D, 41), false, 'zolang er een stuk ontgonnen wordt, vraagt niemand een tweede');
});

test('nee, of je sprak hem niet: pas na dertig dagen vraagt er weer iemand; met de spelregel uit vraagt niemand het', () => {
  const S = gehucht();
  const D = S.dorp;
  verzoek(S);
  zeg(S, 1);
  assert.ok(!S.wereld.akkers.some((v) => v.ontginning), 'geen veld');
  assert.equal(T.beginOntginverzoek(D, 41), false);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw - 1), false);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw), true, 'na dertig dagen weer');
  // Wie je niet sprak, gaat voorbij (js/voorvallen.js), en komt ook pas na dertig dagen terug, niet morgen.
  T.voorvalBeantwoord(D, lopend(D).id);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw + 1), false, 'niet de dag erna');
  T.zetOptie('ontginnen', 'uit');
  try {
    D.ontginnen = { gevraagd: null, klaar: null };
    assert.equal(T.beginOntginverzoek(D, 100), false);
  } finally {
    T.optiesTerug();
  }
});

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`.
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

test('de boer steekt er plaggen, tegel voor tegel; na een maand is het ontgonnen, en in lentemaand een akker die gezaaid wordt', () => {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    const S = gehucht();
    const D = S.dorp;
    const L = verzoek(S);
    const boer = L.ontgin.boer;
    zeg(S, 0);
    D.voorraad.graan = 600; // zodat het dorp niet hongert, en er zaaigraan is
    const veld = S.wereld.akkers.find((v) => v.ontginning);
    totUur(S, 40, 12);
    assert.equal(boer.werkt && boer.werkt.soort, 'ontginnen', 'hij werkt op de heide');
    assert.ok(T.veldOp(S.wereld, boer.tx, boer.ty) === veld, 'op zijn nieuwe veld');
    totUur(S, 43, 18);
    const gestoken = veld.ontginning.gestoken.size;
    assert.ok(gestoken >= 2 && gestoken < 30, `${gestoken} plaggen in drie dagen`);
    // De maand is om: wat hij niet stak, steken zijn mensen nog; het stuk rust tot lentemaand.
    D.gebouwenDag = veld.ontginning.tot - 1;
    S.kalender.dag = veld.ontginning.tot + 0.3;
    T.tikGebouwenDag(D, veld.ontginning.tot);
    assert.equal(veld.ontginning, undefined, 'ontgonnen');
    assert.ok(berichten.some((t) => /is ontgonnen/.test(t)), berichten.slice(-3).join(' | '));
    assert.equal(T.bestemmingVan(veld), 'braak');
    // 1 lentemaand van het jaar erna: het wordt een akker, en gezaaid.
    S.kalender.dag = 360 + 0.3;
    D.voorraad.graan = 600;
    T.tikGebouwenDag(D, 360);
    assert.equal(T.bestemmingVan(veld), 'akker', 'een akker');
    assert.equal(T.akkerTegelStadium(veld, veld.x, veld.y, 'groen'), 'groen', 'gezaaid');
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
});

// Wie in de winter ja zei, wacht geen jaar: zolang het stuk ontgonnen wordt, wisselt het niet op 1 lentemaand (dan zou
// er op de heide gezaaid worden), en is het klaar terwijl de boeren nazaaien, dan wordt het meteen een akker.
test('ja in sprokkelmaand: op 1 lentemaand wisselt het nog niet, en is het in lentemaand klaar, dan zaaien de boeren het na', () => {
  const S = gehucht(345 + 7 / 24);
  const D = S.dorp;
  verzoek(S);
  zeg(S, 0);
  const veld = S.wereld.akkers.find((v) => v.ontginning);
  assert.equal(veld.ontginning.tot, 375, '15 lentemaand');
  // 1 lentemaand van het jaar erna: de velden wisselen en de boeren zaaien, maar dit stuk wordt nog ontgonnen.
  D.voorraad.graan = 600;
  D.gebouwenDag = 359;
  S.kalender.dag = 360.3;
  T.tikGebouwenDag(D, 360);
  assert.ok(veld.ontginning, 'nog heide');
  assert.equal(T.bestemmingVan(veld), 'braak', 'het wisselt nog niet');
  // 15 lentemaand: ontgonnen, meteen een akker, en de boeren zaaien hem na.
  D.voorraad.graan = 600;
  D.gebouwenDag = 374;
  S.kalender.dag = 375.3;
  T.tikGebouwenDag(D, 375);
  assert.equal(veld.ontginning, undefined, 'ontgonnen');
  assert.equal(T.bestemmingVan(veld), 'akker', 'een akker');
  assert.equal(veld.ongezaaid.size, 0, 'nagezaaid');
  assert.ok(berichten.some((t) => /zaaien hem na/.test(t)), berichten.slice(-3).join(' | '));
});

test('ben je weg, dan zegt je raadsman ja als het dorp graan tekortkomt; en het stuk gaat mee in een bewaard spel', () => {
  const S = gehucht();
  const D = S.dorp;
  const L = verzoek(S);
  const raadsman = D.bewoners.mensen.find((p) => p.wezen && T.isBoer(p.wezen) && p.wezen !== L.ontgin.boer);
  const keus = T.raadsmanKeuze(D, raadsman, 'ontginverzoek');
  assert.ok(keus && keus.doe.ontgin, `${raadsman.wezen.karakter} zegt: ${keus && keus.zeg}`);
  zeg(S, 0);
  const veld = S.wereld.akkers.find((v) => v.ontginning);
  T.steekPlag(veld, veld.x, veld.y);
  const gelezen = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(gelezen.gelukt, gelezen.reden);
  const terug = gelezen.staat.wereld.akkers.find((v) => v.naam === veld.naam);
  assert.equal(terug.ontginning.tot, veld.ontginning.tot);
  assert.ok(terug.ontginning.gestoken.has(`${veld.x},${veld.y}`));
  const boerTerug = gelezen.staat.wereld.wezens.find((e) => e.wie === L.ontgin.boer.wie);
  assert.ok(boerTerug.werkAkkers.includes(terug), 'en het blijft van zijn boerderij');
});
