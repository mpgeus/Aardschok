// De paadjes en de lantaarns (js/paden.js; werklijst vraag 108, b en d; Marcel, 3 okt: "Paadjes, stenen en zand.
// Lantaarns voor in de avond etc.", en "108 a tab, b c d e ja"): van elke deur een paadje naar de weg, gras dat slijt
// waar veel gelopen wordt en weer dichtgroeit waar niemand meer loopt, een lantaarn bij wat van het dorp is en op de
// kruisingen, en 's avonds de ramen van een huis waar iemand thuis is.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.PADEN_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const ZOMER = dagVan('hooimaand', 10);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht, met een vast zaad (zoals test/zien.test.cjs).
function gehucht(dag = ZOMER) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  const echtLot = T.lootBoeren;
  console.warn = () => {};
  T.BOEREN_INSTELLINGEN.loten = false;
  T.lootBoeren = (S2) => echtLot(S2, 1234);
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    T.lootBoeren = echtLot;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() }, T.schermVelden());
  Object.assign(S.kalender, { dag, snelheid: 1 });
  return S;
}
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });
const breedte = (w) => w.tegels[0].length;

// Kom je van deze tegel over het net (vier richtingen) bij de weg van de kaart?
function naarDeWeg(D, start) {
  const w = D.wereld;
  const b = breedte(w);
  const net = T.aangelegdNet(D);
  const gezien = new Set([start.x + start.y * b]);
  const rij = [start];
  while (rij.length) {
    const t = rij.pop();
    if (net[t.x + t.y * b] === 1) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = t.x + dx;
      const y = t.y + dy;
      const k = x + y * b;
      if (x < 0 || y < 0 || x >= b || y >= w.tegels.length || gezien.has(k) || !net[k]) continue;
      gezien.add(k);
      rij.push({ x, y });
    }
  }
  return false;
}

// Een tegel gras waar niets is: geen veld, geen pad, niets erop, en ver van de deuren.
function losGras(D) {
  const w = D.wereld;
  const net = T.aangelegdNet(D);
  for (let y = 60; y < w.tegels.length - 4; y++) {
    for (let x = 50; x < breedte(w) - 4; x++) {
      if (T.isBegaanbaar(w, x, y) && !T.veldOp(w, x, y) && !T.voorwerpOp(w, x, y) && !net[x + y * breedte(w)]) return { x, y };
    }
  }
  throw new Error('geen los gras');
}

test('van elke deur loopt een paadje naar de weg', () => {
  const S = gehucht();
  const D = S.dorp;
  const net = T.aangelegdNet(D);
  const b = breedte(D.wereld);
  assert.ok(net.some((v) => v === 2), 'er zijn paadjes van de deuren');
  for (const g of D.gebouwen) {
    const deur = T.deurVan(D.wereld, g);
    assert.ok(net[deur.x + deur.y * b] >= 1, `de deur van ${g.soort} op ${g.x},${g.y} ligt aan het net`);
    assert.ok(naarDeWeg(D, deur), `en van daar kom je over het net bij de weg (${g.soort} op ${g.x},${g.y})`);
  }
});

test('een nieuw gebouw krijgt meteen een paadje, en wie later bouwt, sluit aan', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const schout = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'houthakker', T.deurVan(D.wereld, schout));
  const r = T.plaatsGebouw(D, 'houthakker', plek.x, plek.y);
  assert.ok(r.gelukt, r.reden);
  const deur = T.deurVan(D.wereld, r.instantie);
  assert.ok(T.aangelegdNet(D)[deur.x + deur.y * breedte(D.wereld)] >= 1, 'in aanbouw ligt er al een paadje');
  assert.ok(naarDeWeg(D, deur));
  // Het paadje loopt nergens over het nieuwe gebouw.
  const net = T.aangelegdNet(D);
  const v = T.voetVanGebouw(r.instantie);
  for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.b; x++) assert.equal(net[x + y * breedte(D.wereld)], 0);
});

test('waar veel gelopen wordt, slijt het gras tot een paadje; waar niemand meer loopt, groeit het dicht', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const t = losGras(D);
  assert.equal(T.isPaadje(D, t.x, t.y), false);
  for (let d = 0; d < 30; d++) {
    for (let i = 0; i < 10; i++) T.telStap(w, t.x, t.y);
    T.tikPadenDag(D);
  }
  assert.equal(T.isPaadje(D, t.x, t.y), true, 'tien stappen per dag, een maand lang: een paadje');
  const versie = T.padVersie(D);
  for (let d = 0; d < 20; d++) T.tikPadenDag(D);
  assert.equal(T.isPaadje(D, t.x, t.y), true, `na twintig stille dagen nog (gemiddeld ${w.paden.slijt[t.x + t.y * breedte(w)]} per dag, boven ${IN.blijftPad})`);
  for (let d = 0; d < 20; d++) T.tikPadenDag(D);
  assert.equal(T.isPaadje(D, t.x, t.y), false, 'na veertig niet meer');
  assert.notEqual(T.padVersie(D), versie, 'de grond wordt opnieuw getekend');
  for (let d = 0; d < 60; d++) T.tikPadenDag(D);
  assert.equal(w.paden.slijt[t.x + t.y * breedte(w)], undefined, 'na honderd dagen telt het niet meer, en wordt het niet bewaard');
});

test('op een veld slijt geen paadje, en een dier telt niet', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const akker = w.akkers[0];
  for (let d = 0; d < 30; d++) {
    for (let i = 0; i < 10; i++) T.telStap(w, akker.x, akker.y);
    T.tikPadenDag(D);
  }
  assert.equal(T.isPaadje(D, akker.x, akker.y), false, 'de boer maait en ploegt daar');
  // Een koe en de schout lopen elk een stap naar los gras.
  const t = losGras(D);
  const koe = T.maakDier('koe', t.x, t.y, 1);
  zet(koe, t.x, t.y);
  w.wezens.push(koe);
  koe.pad = [{ x: t.x + 1, y: t.y }];
  T.beweegWezens(S, w, 10);
  assert.equal(koe.x, t.x + 1, 'de koe liep');
  assert.equal(w.paden.vandaag[t.x + 1 + t.y * breedte(w)], undefined, 'een koe slijt geen paadje');
  zet(D.schout, t.x, t.y + 1);
  D.schout.pad = [{ x: t.x + 1, y: t.y + 1 }];
  T.beweegWezens(S, w, 10);
  assert.equal(w.paden.vandaag[t.x + 1 + (t.y + 1) * breedte(w)], 1, 'een mens wel');
});

test('de spelregel "Paadjes": alleen van de deuren, of geen', (t) => {
  t.after(() => T.optiesTerug());
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const plek = losGras(D);
  T.zetOptie('paadjes', 'deuren');
  T.telStap(w, plek.x, plek.y);
  assert.equal(w.paden.vandaag[plek.x + plek.y * breedte(w)], undefined, 'alleen van de deuren: lopen telt niet');
  assert.ok(T.aangelegdNet(D).some((v) => v === 2), 'maar de deuren hebben hun paadje');
  T.zetOptie('paadjes', 'uit');
  assert.ok(!T.aangelegdNet(D).some((v) => v === 2), 'geen: alleen de weg van de kaart');
  assert.ok(T.zandHoeken(D).every((v) => v === 0), 'en er wordt niets zand');
});

test('hoe het eruitziet: een recht paadje is zand, de weg blijft zoals de kaart hem legde', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const b = breedte(w);
  const net = T.aangelegdNet(D);
  const zand = T.zandHoeken(D);
  const gras = ['gras', 'gras', 'gras', 'gras'];
  // Een tegel midden in een recht paadje: zijn vier hoeken worden zand.
  let midden = null;
  for (let k = 0; k < net.length && !midden; k++) {
    const x = k % b;
    const y = (k - x) / b;
    if (net[k] === 2 && net[k - 1] === 2 && net[k + 1] === 2 && x > 0) midden = { x, y };
  }
  assert.ok(midden, 'er is een recht paadje');
  assert.deepEqual(T.hoekenMetPaden(D, zand, midden.x, midden.y, gras), ['zandpad', 'zandpad', 'zandpad', 'zandpad']);
  assert.deepEqual(T.hoekenMetPaden(D, zand, midden.x, midden.y, ['heide', 'gras', 'water', 'gras']), ['heide', 'zandpad', 'water', 'zandpad'], 'alleen gras wordt zand');
  // Een tegel van de weg zonder paadje ernaast: daar verandert niets.
  let weg = null;
  for (let k = 0; k < net.length && !weg; k++) {
    if (net[k] !== 1) continue;
    const x = k % b;
    const y = (k - x) / b;
    let paadje = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (net[x + dx + (y + dy) * b] === 2) paadje = true;
    if (!paadje) weg = { x, y };
  }
  assert.ok(weg);
  assert.equal(T.hoekenMetPaden(D, zand, weg.x, weg.y, gras), null);
});

test('een lantaarn bij de deur van de kapel als hij klaar is, en niet twee keer', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const schout = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'kapel', T.deurVan(w, schout));
  const r = T.plaatsGebouw(D, 'kapel', plek.x, plek.y);
  assert.ok(r.gelukt, r.reden);
  const deur = T.deurVan(w, r.instantie);
  const bijDeDeur = () => w.voorwerpen.filter((v) => v.soort === 'lantaarn' && T.afstand(v, deur) <= 2);
  T.zetLantaarns(D);
  assert.equal(bijDeDeur().length, 0, 'in aanbouw nog niet');
  r.instantie.klaar = true;
  T.zetLantaarns(D);
  assert.equal(bijDeDeur().length, 1, 'klaar: een lantaarn naast de deur');
  const l = bijDeDeur()[0];
  assert.ok(T.isBegaanbaar(w, l.x, l.y), 'je loopt er gewoon langs, zoals langs de lantaarns op de kaart');
  assert.ok(!(l.x === deur.x && l.y === deur.y), 'niet in de deur');
  const aantal = w.voorwerpen.length;
  T.zetLantaarns(D);
  assert.equal(w.voorwerpen.length, aantal, 'en niet nog een');
  assert.match(T.waaromPastHetNiet(D, 'put', l.x, l.y) || '', /.+/, 'op een lantaarn bouw je niet');
});

test('lantaarns op de kruisingen van het net, naast het pad en niet te dicht bij elkaar', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const b = breedte(w);
  const net = T.aangelegdNet(D);
  const nieuw = w.voorwerpen.filter((v) => v.vanHetDorp);
  assert.ok(nieuw.length >= 1, 'het gehucht krijgt er bij het begin al een paar');
  const alle = w.voorwerpen.filter((v) => v.soort === 'lantaarn');
  for (const l of nieuw) {
    assert.equal(net[l.x + l.y * b], 0, `${l.x},${l.y} staat niet op het pad`);
    assert.ok(!T.opHetPlein(w, l.x, l.y), 'het plein blijft open');
    let aanHetNet = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (net[l.x + dx + (l.y + dy) * b]) aanHetNet = true;
    assert.ok(aanHetNet, `${l.x},${l.y} staat aan het pad`);
    for (const m of alle) if (m !== l) assert.ok(T.afstand(l, m) >= IN.lantaarnAfstand - 1, `${l.x},${l.y} niet vlak bij ${m.x},${m.y}`);
  }
});

test('\'s avonds branden de ramen van een huis waar iemand thuis is; zijn ze allemaal weg, of slapen ze, dan niet', () => {
  const S = gehucht(bijUur(ZOMER, 21));
  const D = S.dorp;
  const w = D.wereld;
  assert.equal(T.dagdeelVan(S.kalender.dag, T.isOogstDag(S.kalender.dag)), 'avond');
  const herbergen = T.herbergenVan(D);
  const huis = D.gebouwen.find((g) => g.klaar !== false && !herbergen.includes(g) && D.bewoners.mensen.some((p) => p.huis === g));
  const wie = D.bewoners.mensen.filter((p) => p.huis === huis);
  const deur = T.deurVan(w, huis);
  const ramen = () => T.lichtBronnen(D).filter((l) => l.ramenVan === huis);
  for (const p of wie) zet(p.wezen, deur.x, deur.y);
  assert.equal(ramen().length, 1, 'thuis: de ramen branden, één keer');
  assert.equal(ramen()[0].x, deur.x);
  for (const p of wie) zet(p.wezen, 2, 2);
  assert.equal(ramen().length, 0, 'iedereen weg: donker');
  for (const p of wie) zet(p.wezen, deur.x, deur.y);
  S.kalender.dag = bijUur(ZOMER + 1, 1);
  assert.equal(ramen().length, 0, 'na bedtijd slapen ze');
  S.kalender.dag = bijUur(ZOMER + 1, 13);
  assert.equal(ramen().length, 0, 'overdag niet');
});

test('bewaren en laden houdt wat er gesleten is', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const t = losGras(D);
  for (let d = 0; d < 30; d++) {
    for (let i = 0; i < 10; i++) T.telStap(w, t.x, t.y);
    T.tikPadenDag(D);
  }
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  const P2 = S2.dorp.wereld.paden;
  assert.ok(P2.gesleten instanceof Set && P2.gesleten.has(t.x + t.y * breedte(w)));
  assert.equal(T.isPaadje(S2.dorp, t.x, t.y), true);
  assert.deepEqual(P2.slijt, w.paden.slijt);
});
