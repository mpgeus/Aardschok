// De paadjes en de lantaarns (js/paden.js; werklijst vraag 108, b en d; Marcel, 3 okt: "Paadjes, stenen en zand.
// Lantaarns voor in de avond etc.", en "108 a tab, b c d e ja"): van elke deur een paadje naar de weg, gras dat slijt
// waar veel gelopen wordt en weer dichtgroeit waar niemand meer loopt, een lantaarn bij wat van het dorp is en op de
// kruisingen, en 's avonds de ramen van een huis waar iemand thuis is.
const test = require('node:test');
const assert = require('node:assert/strict');
const { proefDorp } = require('./grond.cjs');

const T = require('./laad.cjs').spel();
const IN = T.PADEN_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const ZOMER = dagVan('hooimaand', 10);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het proefdorp (test/grond.cjs), op `dag`. `opties` gaan naar proefDorp.
function proef(dag = ZOMER, opties = {}) {
  const { S } = proefDorp(T, opties);
  Object.assign(S, { bezocht: new Set() });
  Object.assign(S.kalender, { dag, snelheid: 1 });
  return S;
}
// Rond een dorp in het lege begin staan bos en heide, en elk voorwerp houdt een paadje tegen (magPad in js/paden.js): een
// deur in het bos krijgt er geen. Een toets over het net van de deuren ruimt de begroeiing (bomen, struiken, heide) op in een
// vak rond de gebouwen, zoals een dorp dat al een tijd staat.
function ruimBegroeiingOp(D) {
  const w = D.wereld;
  const rand = 12;
  const x1 = Math.min(...D.gebouwen.map((g) => g.x)) - rand;
  const y1 = Math.min(...D.gebouwen.map((g) => g.y)) - rand;
  const x2 = Math.max(...D.gebouwen.map((g) => g.x + g.voet.b)) + rand;
  const y2 = Math.max(...D.gebouwen.map((g) => g.y + g.voet.h)) + rand;
  for (const v of T.voorwerpenIn(w, { x: x1, y: y1, b: x2 - x1 + 1, h: y2 - y1 + 1 })) {
    if (v.vel !== 'bomen' && v.vel !== 'begroeiing') continue;
    T.haalVoorwerpWeg(w, v);
    if (T.tegel(w, v.x, v.y) === 'muur') T.zetTegel(w, v.x, v.y, 'vloer');
  }
  T.kaartVeranderd(w);
}
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });
const breedte = (w) => T.kaartVak(w).b;
// Waar tegel (x, y) in het net staat (T.aangelegdNet: over het vak van de kaart, T.kaartVak).
const plekIn = (w, x, y) => {
  const K = T.kaartVak(w);
  return x - K.x + (y - K.y) * K.b;
};

// Kom je van deze tegel over het net (vier richtingen) bij de weg van de kaart?
function naarDeWeg(D, start) {
  const w = D.wereld;
  const net = T.aangelegdNet(D);
  const gezien = new Set([plekIn(w, start.x, start.y)]);
  const rij = [start];
  while (rij.length) {
    const t = rij.pop();
    if (net[plekIn(w, t.x, t.y)] === 1) return true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = t.x + dx;
      const y = t.y + dy;
      const k = plekIn(w, x, y);
      if (!T.inVak(T.kaartVak(w), x, y) || gezien.has(k) || !net[k]) continue;
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
  const K = T.kaartVak(w);
  for (let y = K.y + 60; y < K.y + K.h - 4; y++) {
    for (let x = K.x + 50; x < K.x + K.b - 4; x++) {
      if (T.isBegaanbaar(w, x, y) && !T.veldOp(w, x, y) && !T.voorwerpOp(w, x, y) && !net[plekIn(w, x, y)]) return { x, y };
    }
  }
  throw new Error('geen los gras');
}

test('van elke deur loopt een paadje naar de weg', () => {
  const S = proef();
  const D = S.dorp;
  ruimBegroeiingOp(D);
  const net = T.aangelegdNet(D);
  assert.ok(net.some((v) => v === 2), 'er zijn paadjes van de deuren');
  for (const g of D.gebouwen) {
    const deur = T.deurVan(D.wereld, g);
    assert.ok(net[plekIn(D.wereld, deur.x, deur.y)] >= 1, `de deur van ${g.soort} op ${g.x},${g.y} ligt aan het net`);
    assert.ok(naarDeWeg(D, deur), `en van daar kom je over het net bij de weg (${g.soort} op ${g.x},${g.y})`);
  }
});

test('een nieuw gebouw krijgt meteen een paadje, en wie later bouwt, sluit aan', () => {
  const S = proef();
  const D = S.dorp;
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const schout = D.gebouwen.find((g) => g.soort === 'schout');
  const plek = T.plekVoor(D, 'houthakker', T.deurVan(D.wereld, schout));
  const r = T.plaatsGebouw(D, 'houthakker', plek.x, plek.y);
  assert.ok(r.gelukt, r.reden);
  const deur = T.deurVan(D.wereld, r.instantie);
  assert.ok(T.aangelegdNet(D)[plekIn(D.wereld, deur.x, deur.y)] >= 1, 'in aanbouw ligt er al een paadje');
  assert.ok(naarDeWeg(D, deur));
  // Het paadje loopt nergens over het nieuwe gebouw.
  const net = T.aangelegdNet(D);
  const v = T.voetVanGebouw(r.instantie);
  for (let y = v.y; y < v.y + v.h; y++) for (let x = v.x; x < v.x + v.b; x++) assert.equal(net[plekIn(D.wereld, x, y)], 0);
});

test('waar veel gelopen wordt, slijt het gras tot een paadje; waar niemand meer loopt, groeit het dicht', () => {
  const S = proef();
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
  assert.equal(T.isPaadje(D, t.x, t.y), true, `na twintig stille dagen nog (gemiddeld ${w.paden.slijt[T.tegelNummer(t.x, t.y)]} per dag, boven ${IN.blijftPad})`);
  for (let d = 0; d < 20; d++) T.tikPadenDag(D);
  assert.equal(T.isPaadje(D, t.x, t.y), false, 'na veertig niet meer');
  assert.notEqual(T.padVersie(D), versie, 'de grond wordt opnieuw getekend');
  for (let d = 0; d < 60; d++) T.tikPadenDag(D);
  assert.equal(w.paden.slijt[T.tegelNummer(t.x, t.y)], undefined, 'na honderd dagen telt het niet meer, en wordt het niet bewaard');
});

test('op een veld slijt geen paadje, en een dier telt niet', () => {
  const S = proef();
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
  assert.equal(w.paden.vandaag[T.tegelNummer(t.x + 1, t.y)], undefined, 'een koe slijt geen paadje');
  zet(D.schout, t.x, t.y + 1);
  D.schout.pad = [{ x: t.x + 1, y: t.y + 1 }];
  T.beweegWezens(S, w, 10);
  assert.equal(w.paden.vandaag[T.tegelNummer(t.x + 1, t.y + 1)], 1, 'een mens wel');
});

test('de spelregel "Paadjes": alleen van de deuren, of geen', (t) => {
  t.after(() => T.optiesTerug());
  const S = proef();
  const D = S.dorp;
  const w = D.wereld;
  const plek = losGras(D);
  T.zetOptie('paadjes', 'deuren');
  T.telStap(w, plek.x, plek.y);
  assert.equal(w.paden.vandaag[T.tegelNummer(plek.x, plek.y)], undefined, 'alleen van de deuren: lopen telt niet');
  assert.ok(T.aangelegdNet(D).some((v) => v === 2), 'maar de deuren hebben hun paadje');
  T.zetOptie('paadjes', 'uit');
  assert.ok(!T.aangelegdNet(D).some((v) => v === 2), 'geen: alleen de weg van de kaart');
  assert.ok(T.zandHoeken(D).every((v) => v === 0), 'en er wordt niets zand');
});

test('hoe het eruitziet: een recht paadje is zand, de weg blijft zoals de kaart hem legde', () => {
  const S = proef();
  const D = S.dorp;
  const w = D.wereld;
  const b = breedte(w);
  const net = T.aangelegdNet(D);
  const zand = T.zandHoeken(D);
  const gras = ['gras', 'gras', 'gras', 'gras'];
  // Een tegel midden in een recht paadje: zijn vier hoeken worden zand.
  let midden = null;
  const K = T.kaartVak(w);
  for (let k = 0; k < net.length && !midden; k++) {
    const x = k % b;
    const y = (k - x) / b;
    if (net[k] === 2 && net[k - 1] === 2 && net[k + 1] === 2 && x > 0) midden = { x: K.x + x, y: K.y + y };
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
  const S = proef();
  const D = S.dorp;
  const w = D.wereld;
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const schout = D.gebouwen.find((g) => g.soort === 'schout');
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
  const S = proef();
  const D = S.dorp;
  const w = D.wereld;
  const b = breedte(w);
  const net = T.aangelegdNet(D);
  const nieuw = w.voorwerpen.filter((v) => v.vanHetDorp);
  assert.ok(nieuw.length >= 1, 'het proefdorp heeft er al een');
  const alle = w.voorwerpen.filter((v) => v.soort === 'lantaarn');
  for (const l of nieuw) {
    assert.equal(net[plekIn(w, l.x, l.y)], 0, `${l.x},${l.y} staat niet op het pad`);
    assert.ok(!T.opHetPlein(w, l.x, l.y), 'het plein blijft open');
    let aanHetNet = false;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (net[plekIn(w, l.x + dx, l.y + dy)]) aanHetNet = true;
    assert.ok(aanHetNet, `${l.x},${l.y} staat aan het pad`);
    for (const m of alle) if (m !== l) assert.ok(T.afstand(l, m) >= IN.lantaarnAfstand - 1, `${l.x},${l.y} niet vlak bij ${m.x},${m.y}`);
  }
});

test('\'s avonds branden de ramen van een huis waar iemand thuis is; zijn ze allemaal weg, of slapen ze, dan niet', () => {
  const S = proef(bijUur(ZOMER, 21));
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
  const S = proef();
  const D = S.dorp;
  const w = D.wereld;
  const t = losGras(D);
  for (let d = 0; d < 30; d++) {
    for (let i = 0; i < 10; i++) T.telStap(w, t.x, t.y);
    T.tikPadenDag(D);
  }
  const S2 = proef();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  const P2 = S2.dorp.wereld.paden;
  assert.ok(P2.gesleten instanceof Set && P2.gesleten.has(T.tegelNummer(t.x, t.y)));
  assert.equal(T.isPaadje(S2.dorp, t.x, t.y), true);
  assert.deepEqual(P2.slijt, w.paden.slijt);
});
