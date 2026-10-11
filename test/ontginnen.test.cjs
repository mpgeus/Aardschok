// Het plaggen steken en het ontginnen van bos (js/ontginnen.js, js/veldwerk.js, js/akkers.js). Het verzoek van een boer om
// te ontginnen is op 11 okt weggehaald (snoeironde, vraag 153): akkers leg jij nu zelf. Wat bleef, slaapt tot stap 1d, en
// deze toetsen zetten daarom zelf een veld in ontginning: dertig tegels heide (een maand plaggen steken) of bos (een winter
// bomen hakken, stobben rooien en omspitten), bij de akker van een boer. In lentemaand is het een akker.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

// Het ontworpen gehucht, met een vast zaad, op `dag` (40: 11 grasmaand, zeven uur 's ochtends).
function gehucht(dag = 40 + 7 / 24) {
  // Deze toetsen gaan niet over het weer: er wordt gezaaid op 1 lentemaand, ook als het die dag regent (vraag 144, 1).
  T.VELDEN_INSTELLINGEN.nietInDeRegen = false;
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
const opVeld = (v, x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
const afstand = (a, v) => Math.max(0, v.x - (a.x + a.b - 1), a.x - (v.x + v.b - 1), v.y - (a.y + a.h - 1), a.y - (v.y + v.h - 1));
const boeren = (w) => w.wezens.filter((e) => !e.dood && e.werkAkkers && e.werkAkkers.length);

// Een stuk van dertig tegels (zes bij vijf, of vijf bij zes) waarvan elke tegel `mag` en dat `past` (bijvoorbeeld: genoeg
// bomen), zo dicht bij een akker van een boer als het kan; bij gelijk de eerste, van boven naar beneden. { x, y, b, h, boer }.
function zoekStuk(S, mag, past = () => true) {
  const w = S.wereld;
  let beste = null;
  for (const boer of boeren(w)) {
    for (const [b, h] of [[6, 5], [5, 6]]) {
      for (let y = 0; y + h <= w.tegels.length; y++) {
        for (let x = 0; x + b <= w.tegels[0].length; x++) {
          const stuk = { x, y, b, h };
          const d = Math.min(...boer.werkAkkers.map((v) => afstand(stuk, v)));
          if (beste && d >= beste.d) continue;
          let alles = true;
          for (let dy = 0; dy < h && alles; dy++) for (let dx = 0; dx < b && alles; dx++) alles = mag(x + dx, y + dy);
          if (alles && past(stuk, boer)) beste = { ...stuk, d, boer };
        }
      }
    }
  }
  assert.ok(beste, 'een plek voor een stuk van dertig tegels');
  return beste;
}
// Mag deze tegel in een stuk heide of bos: te belopen (of iets wat de boer opruimt), en geen veld, weg, erf, lantaarn, plein,
// deur of paadje van een deur.
const vrij = (S) => (x, y) => {
  const w = S.wereld;
  const D = S.dorp;
  if (T.opHetPlein(w, x, y) || T.bijDeur(w, x, y) || T.isAangelegdPaadje(D, x, y) || T.waaromNietOpDezeGrond(D, x, y)) return false;
  return T.isBegaanbaar(w, x, y) || !!T.ontginWerkOp(w, x, y);
};
const opMeent = (S, x, y) => S.wereld.meenten.some((m) => m.meent && opVeld(m, x, y));
const bomenOp = (w, s) => T.akkerTegels(s).filter((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken').length;

// Kan de boer erbij? Recht naast een tegel van de rand van het stuk kan hij komen, vanaf zijn deur.
function bereikbaar(w, boer, stuk) {
  const van = boer.thuis || { x: boer.tx, y: boer.ty };
  for (let y = stuk.y; y < stuk.y + stuk.h; y++) {
    for (let x = stuk.x; x < stuk.x + stuk.b; x++) {
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const n = { x: x + dx, y: y + dy };
        if (!opVeld(stuk, n.x, n.y) && T.isBegaanbaar(w, n.x, n.y) && T.kanErKomen(w, van, n)) return true;
      }
    }
  }
  return false;
}

// Een veld in ontginning, zoals het verzoek het maakte: van de boerderij van de boer, braak tot het klaar is, en in
// lentemaand een akker. `soort` is 'heide' (een maand) of 'bos' (een winter, met minstens tien bomen erop).
function ontgin(S, soort, dagen = soort === 'bos' ? 90 : 30) {
  const D = S.dorp;
  const w = S.wereld;
  const mag = vrij(S);
  const stuk = soort === 'heide'
    ? zoekStuk(S, (x, y) => opMeent(S, x, y) && mag(x, y) && T.isBegaanbaar(w, x, y))
    : zoekStuk(S, (x, y) => !opMeent(S, x, y) && !T.isWaterGrond((w.grond[y][x] || {}).naam) && mag(x, y),
      (s, boer) => T.akkerTegels(s).filter((t) => T.NATUUR.bos.telt(w, t.x, t.y, T.voorwerpOp(w, t.x, t.y))).length >= T.ONTGINNEN_INSTELLINGEN.bosBomen && bereikbaar(w, boer, s));
  const dag = Math.floor(S.kalender.dag);
  const veld = {
    naam: `${stuk.boer.huis}-ontgonnen-1`, x: stuk.x, y: stuk.y, b: stuk.b, h: stuk.h,
    huis: stuk.boer.huis, bestemming: 'braak', plan: 'akker', planDoor: 'boer',
    vruchtbaarheid: T.VELDEN_INSTELLINGEN.beginVruchtbaarheid,
    ontginning: { tot: dag + dagen, op: soort, gestoken: new Set() },
  };
  w.akkers.push(veld);
  stuk.boer.werkAkkers.push(veld);
  T.kaartVeranderd(w);
  return { veld, boer: stuk.boer, D };
}

test('een veld in ontginning op de heide: braak tot het klaar is, geen paadje erover, en wat nog niet gestoken is, is heide', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const meentVoor = new Map(w.meenten.filter((m) => m.meent).map((m) => [m, T.weideStand(D, m).tegels]));
  const { veld, boer } = ontgin(S, 'heide');
  assert.deepEqual(T.inOntginning(w), [veld]);
  assert.equal(veld.b * veld.h, 30);
  const meent = w.meenten.find((m) => m.meent && opVeld(m, veld.x, veld.y));
  assert.ok(meent, 'op de heide');
  assert.ok(boer.werkAkkers.includes(veld), 'van zijn boerderij');
  assert.equal(T.boerVanVeld(D, veld), boer);
  assert.equal(T.bestemmingVan(veld), 'braak', 'het rust tot het klaar is');
  assert.equal(T.planVan(veld), 'akker', 'en wordt in lentemaand een akker');
  const net = T.aangelegdNet(D);
  for (const t of T.akkerTegels(veld)) assert.notEqual(net[t.x + t.y * w.tegels[0].length], 2, `geen paadje over ${t.x},${t.y}`);
  assert.equal(T.akkerTegelStadium(veld, veld.x, veld.y, 'groen'), 'heide', 'wat hij nog niet stak, is heide');
  assert.ok(!T.isGestoken(veld, veld.x, veld.y));
  T.steekPlag(veld, veld.x, veld.y);
  assert.ok(T.isGestoken(veld, veld.x, veld.y));
  assert.equal(T.akkerTegelStadium(veld, veld.x, veld.y, 'groen'), 'geploegd', 'wat hij stak, is kale grond');
  // De schapen grazen er niet meer: de meent is dertig tegels kleiner (js/vee.js).
  assert.equal(meentVoor.get(meent) - T.weideStand(D, meent).tegels, 30);
});

test('plaggen steken haalt weg wat laag groeit, en laat een boom staan', () => {
  const S = gehucht();
  const w = S.wereld;
  const { veld } = ontgin(S, 'heide');
  const t = T.akkerTegels(veld)[0];
  assert.ok(T.groeitLaag({ soort: 'varen' }) && T.groeitLaag({ soort: 'kleineRots' }));
  assert.ok(!T.groeitLaag({ soort: 'eik' }) && !T.groeitLaag(null));
  T.zetVoorwerp(w, { soort: 'grasPol', x: t.x, y: t.y });
  assert.equal(T.voorwerpOp(w, t.x, t.y).soort, 'grasPol');
  T.steekPlag(veld, t.x, t.y, w);
  assert.equal(T.voorwerpOp(w, t.x, t.y), null, 'het gras is weg');
  // Een veld dat niet (meer) ontgonnen wordt, is overal gestoken.
  const eigen = w.akkers.find((v) => !v.ontginning);
  assert.ok(T.isGestoken(eigen, eigen.x, eigen.y));
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
    const { veld, boer } = ontgin(S, 'heide');
    D.voorraad.graan = 600; // zodat het dorp niet hongert, en er zaaigraan is
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
    assert.ok(berichten.some((t) => /has been cleared/.test(t)), berichten.slice(-3).join(' | '));
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

// Een stuk dat in de winter begint, wacht geen jaar: zolang het ontgonnen wordt, wisselt het niet op 1 lentemaand (dan zou
// er op de heide gezaaid worden), en is het klaar terwijl de boeren nazaaien, dan wordt het meteen een akker.
test('begint het in sprokkelmaand: op 1 lentemaand wisselt het nog niet, en is het in lentemaand klaar, dan zaaien de boeren het na', () => {
  const S = gehucht(345 + 7 / 24);
  const D = S.dorp;
  const { veld } = ontgin(S, 'heide');
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
  assert.ok(berichten.some((t) => /sow it late/.test(t)), berichten.slice(-3).join(' | '));
});

test('een veld in ontginning gaat mee in een bewaard spel, met wat al gestoken is, en blijft van zijn boerderij', () => {
  const S = gehucht();
  const { veld, boer } = ontgin(S, 'heide');
  T.steekPlag(veld, veld.x, veld.y);
  const gelezen = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(gelezen.gelukt, gelezen.reden);
  const terug = gelezen.staat.wereld.akkers.find((v) => v.naam === veld.naam);
  assert.equal(terug.ontginning.tot, veld.ontginning.tot);
  assert.ok(terug.ontginning.gestoken.has(`${veld.x},${veld.y}`));
  const boerTerug = gelezen.staat.wereld.wezens.find((e) => e.wie === boer.wie);
  assert.ok(boerTerug.werkAkkers.includes(terug), 'en het blijft van zijn boerderij');
});

// ---------------------------------------------------------------------------------------------
// Het bos
// ---------------------------------------------------------------------------------------------

test('een veld in ontginning in het bos: wat nog niet omgespit is, is bos, en daar tekent het spel wat er staat', () => {
  const S = gehucht();
  const w = S.wereld;
  const { veld } = ontgin(S, 'bos');
  assert.equal(veld.ontginning.op, 'bos');
  assert.ok(bomenOp(w, veld) >= T.ONTGINNEN_INSTELLINGEN.bosBomen, 'bomen om te hakken');
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'bos');
});

test('een boom omhakken geeft hout en laat een stronk, die hij rooit; na de winter doen zijn mensen de rest', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const { veld } = ontgin(S, 'bos');
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  const hout = D.voorraad.hout;
  assert.ok(T.hakBoom(D, boom.x, boom.y));
  assert.equal(D.voorraad.hout, hout + T.BOS_INSTELLINGEN.houtPerBoom, 'het hout gaat naar de schuur');
  assert.equal(T.ontginWerkOp(w, boom.x, boom.y), 'rooien', 'een stronk');
  assert.ok(T.isBegaanbaar(w, boom.x, boom.y), 'tussen de stronken loop je door (js/wereld.js, boomstronk)');
  assert.ok(T.rooi(D, boom.x, boom.y));
  assert.equal(T.ontginWerkOp(w, boom.x, boom.y), null);
  assert.ok(T.isBegaanbaar(w, boom.x, boom.y));
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'bos', 'nog niet omgespit');
  T.steekPlag(veld, boom.x, boom.y, w);
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'geploegd', 'kale grond');
  // De winter is om: wat er nog staat, hakken en rooien zijn mensen, en het hout gaat ook naar de schuur.
  const rest = bomenOp(w, veld);
  const voor = D.voorraad.hout;
  D.gebouwenDag = veld.ontginning.tot - 1;
  S.kalender.dag = veld.ontginning.tot + 0.3;
  T.tikGebouwenDag(D, veld.ontginning.tot);
  assert.equal(veld.ontginning, undefined, 'ontgonnen');
  for (const t of T.akkerTegels(veld)) assert.equal(T.voorwerpOp(w, t.x, t.y), null, `${t.x},${t.y} is leeg`);
  assert.ok(D.voorraad.hout >= voor + rest * T.BOS_INSTELLINGEN.houtPerBoom - 1e-9, `${rest} bomen: ${D.voorraad.hout - voor} hout`);
  assert.ok(berichten.some((t) => /The forest of .* has been cleared/.test(t)), berichten.slice(-2).join(' | '));
});

test('de boer hakt naast de boom, met zijn gezicht ernaar; zijn boerin helpt; en het hout komt binnen', () => {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    const S = gehucht();
    const D = S.dorp;
    const w = S.wereld;
    const { veld, boer } = ontgin(S, 'bos');
    D.voorraad.graan = 600;
    const bomen = bomenOp(w, veld);
    const hout = D.voorraad.hout;
    let gezien = null;
    for (let uur = 9; uur <= 17 && !gezien; uur++) {
      totUur(S, 40, uur);
      const wt = boer.werkt;
      if (wt && wt.soort === 'hakken' && wt.tot != null && !wt.rust && boer.tx === wt.x && boer.ty === wt.y) gezien = { ...wt, op: { ...wt.op } };
    }
    assert.ok(gezien, `hij hakt: ${JSON.stringify(boer.werkt)}`);
    assert.equal(Math.abs(gezien.op.x - gezien.x) + Math.abs(gezien.op.y - gezien.y), 1, 'hij staat recht naast de boom');
    assert.equal(T.veldOp(w, gezien.op.x, gezien.op.y), veld, 'de boom staat op zijn nieuwe veld');
    const helpers = D.bewoners.mensen.filter((p) => p.wezen && p.wezen !== boer && T.helpAnker(D, p.wezen));
    assert.ok(helpers.length > 0, 'zijn boerin of een groot kind helpt');
    totUur(S, 42, 18);
    const nu = bomenOp(w, veld);
    assert.ok(nu < bomen, `${bomen - nu} bomen om in drie dagen`);
    assert.ok(D.voorraad.hout > hout, 'het hout komt binnen');
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
});

test('een akker in het bos, half gehakt, gaat mee in een bewaard spel', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const { veld } = ontgin(S, 'bos');
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  T.hakBoom(D, boom.x, boom.y);
  const gelezen = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(gelezen.gelukt, gelezen.reden);
  const w2 = gelezen.staat.wereld;
  const terug = w2.akkers.find((v) => v.naam === veld.naam);
  assert.equal(terug.ontginning.op, 'bos');
  const stronk = w2.voorwerpen.find((v) => v.x === boom.x && v.y === boom.y);
  assert.equal(stronk && stronk.soort, 'boomstronk', 'de stronk staat er nog');
});

test('is het eerder af dan de maand of de winter, dan is het eerder ontgonnen', () => {
  const S = gehucht();
  const D = S.dorp;
  const { veld } = ontgin(S, 'bos');
  for (const t of T.akkerTegels(veld)) {
    T.hakBoom(D, t.x, t.y);
    T.rooi(D, t.x, t.y);
  }
  D.gebouwenDag = 40;
  T.tikGebouwenDag(D, 41);
  assert.ok(veld.ontginning, 'nog niet omgespit: nog niet af');
  for (const t of T.akkerTegels(veld)) T.steekPlag(veld, t.x, t.y, S.wereld);
  D.gebouwenDag = 41;
  T.tikGebouwenDag(D, 42);
  assert.equal(veld.ontginning, undefined, 'af, op dag 42 in plaats van 130');
});
