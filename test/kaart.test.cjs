// Toetst T.laadKaart (js/kaart.js) tegen kaarten/proef.tmj: een stukje gras met een zandpad, twee
// bomen, een huis en een monster, precies zoals Marcel het in Tiled zou tekenen. De inhoud van
// proef.tmj staat ook even hierboven per test, zodat een lezer niet heen en weer hoeft te kijken:
// grond 12×10, gras overal behalve rij y = 8 (zandpad), een eik op (9, 2), een den op (10, 4),
// een vakwerkhuis met zijn achterste voethoek op (1, 1) (beslaat 7×5, dus tegels 1..7 × 1..5), een
// dichte deur op (4, 6), een slijmkruiper op (9, 7) en op (0, 8) een overgang terug naar het erf
// (elke kaart is vanzelf een gebied, zie js/gebied.js, en een gebied zonder uitgang is een val).
//
// En tegen kaarten/proefbos.tmj: dezelfde soort kaart, maar met randtegels (tegels/rand.tsx) —
// een zandpad dat in gras overloopt, een beek met een brug eroverheen, bomen en een reuzenspin.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/kaart.js');
const T = globalThis.Spel;

test('een ingelezen kaart heeft de goede afmeting en een begaanbare wereld', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  assert.equal(w.b, 12);
  assert.equal(w.h, 10);
  assert.equal(T.tegel(w, 0, 0), 'vloer'); // gras: geen tegel-eigenschap "vast"
  assert.equal(T.isBegaanbaar(w, 0, 0), true);
});

test('het zandpad is begaanbaar, net als het gras ernaast', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  assert.equal(T.tegel(w, 3, 8), 'vloer');
  assert.equal(T.isBegaanbaar(w, 3, 8), true); // op het pad (rij y = 8)
  assert.equal(T.isBegaanbaar(w, 3, 7), true); // op het gras ernaast
});

test('de hele voet van het huis is vast, en er net naast niet', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  for (let y = 1; y <= 5; y++) {
    for (let x = 1; x <= 7; x++) {
      assert.equal(T.isVast(w, x, y), true, `(${x}, ${y}) hoort bij de voet van het huis`);
      assert.equal(T.isBegaanbaar(w, x, y), false);
    }
  }
  assert.equal(T.isVast(w, 8, 1), false); // net buiten de voet (7 breed vanaf x = 1)
  assert.equal(T.isVast(w, 1, 6), false); // net buiten de voet (5 diep vanaf y = 1)
  const huis = w.voorwerpen.find((v) => v.soort === 'vakwerkhuis');
  assert.deepEqual(huis && { x: huis.x, y: huis.y }, { x: 1, y: 1 });
});

test('twee verschillende bomen blijven twee verschillende soorten (niet allebei de eerste boom)', () => {
  // Ving eerder een fout op: grond.png kreeg met de stempel-lap veel meer tegels, waardoor de
  // met de hand uitgerekende gid's van bomen.tsx niet meer klopten en de den als een herfsteik
  // inlas (beide "vast", dus de test hierboven zag het verschil niet). Nu blijft elke boom zijn
  // eigen naam houden, wat er ook aan grond.tsx verandert.
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  const den = T.voorwerpOp(w, 10, 4);
  assert.ok(den);
  assert.equal(den.soort, 'den');
});

test('een boom is een vast voorwerp op zijn eigen tegel', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  assert.equal(T.isVast(w, 9, 2), true);
  const eik = T.voorwerpOp(w, 9, 2);
  assert.ok(eik);
  assert.equal(eik.soort, 'eik');
  assert.equal(T.VOORWERPEN.eik.blokkeert, true);
});

test('het monster staat op de goede tegel, met zijn gewone spullen uit T.WEZENS', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  const monster = w.wezens.find((e) => e.soort === 'slijm');
  assert.ok(monster);
  assert.equal(monster.tx, 9);
  assert.equal(monster.ty, 7);
  assert.equal(monster.kant, 'monster');
  assert.equal(monster.leven, 10); // komt uit T.maakWezen, dus uit dezelfde WEZENS-tabel als T.maakProefkamers()
});

test('een deur uit de kaart doet mee als een echte deur, met de goede richting', () => {
  const w = T.laadKaart(T.KAARTEN.proef, T.BETEKENIS.proef);
  assert.equal(T.tegel(w, 4, 6), 'deur');
  const deur = T.deurOp(w, 4, 6);
  assert.ok(deur);
  assert.equal(deur.staat, 'dicht');
  // ten noorden van de deur ligt de voet van het huis (vast): dan staat het deurpaneel dwars op x,
  // net als T.maakProefkamers() dat voor de deuren in de toren uitrekent.
  assert.equal(deur.richting, 'ns');
  assert.equal(T.isBegaanbaar(w, 4, 6, { deurenOpenen: false }), false);
  assert.equal(T.isBegaanbaar(w, 4, 6, { deurenOpenen: true }), true);
});

// ---------------------------------------------------------------- randtegels, oevers en de brug

test('een kaart met randtegels krijgt zijn grondsoorten uit rand.tsx, op naam en niet op nummer', () => {
  // Zelfde valkuil als bij "twee verschillende bomen" hierboven, maar dan een vel verder:
  // rand.png groeide van 246 naar 262 tegels, en dan schuiven alle gid's van de vellen erachter
  // op. Deze toets kijkt daarom naar de NAAM van de grond onder een tegel, niet naar een nummer:
  // rij y = 6 van proefbos is van west naar oost een zandpad, dan gras, dan drie brugtegels, en
  // daarachter weer gras. Klopt dat niet meer, dan is er iets verschoven.
  const w = T.laadKaart(T.KAARTEN.proefbos, T.BETEKENIS.proefbos);
  const naam = (x, y) => w.grond[y][x] && w.grond[y][x].naam;
  assert.equal(naam(4, 6), 'zandpad');
  assert.equal(naam(9, 6), 'brug');
  assert.equal(naam(10, 6), 'brug');
  assert.equal(naam(11, 6), 'brug');
  assert.equal(naam(16, 6), 'gras');
  assert.equal(naam(10, 3), 'water'); // de beek, een rij verderop, naast de brug
  // En de vellen die ACHTER rand staan in deze kaart (bomen, begroeiing): hun gid's beginnen waar
  // rand ophoudt, dus groeit of krimpt rand.png, dan schuiven ze allemaal op. Twee soorten die er
  // ver uit elkaar staan, en een plant, vangen dat op — de naam moet blijven wat hij was.
  const soortOp = (x, y) => { const v = T.voorwerpOp(w, x, y); return v && v.soort; };
  assert.equal(soortOp(3, 2), 'eik');
  assert.equal(soortOp(21, 13), 'herfstEik');
  assert.equal(soortOp(5, 4), 'varen');
});

test('water is vast, de brug niet — ook waar hij over het water ligt', () => {
  // De kern van de brug: de beek loopt van noord naar zuid dwars over de kaart en is overal vast,
  // behalve op de drie tegels waar de brug ligt. Kan de schout daar niet overheen, dan is het bos
  // aan de overkant onbereikbaar.
  const w = T.laadKaart(T.KAARTEN.proefbos, T.BETEKENIS.proefbos);
  assert.equal(T.isVast(w, 10, 3), true, 'de beek stroomt en daar loop je niet doorheen');
  assert.equal(T.isVast(w, 10, 9), true);
  for (const x of [9, 10, 11]) {
    assert.equal(T.isVast(w, x, 6), false, `de brug op (${x}, 6) draag je`);
    assert.equal(T.isBegaanbaar(w, x, 6), true);
  }
  // en de hele rij ligt open, van het pad in het westen tot waar je vandaan komt in het oosten
  for (let x = 2; x <= 21; x++) assert.equal(T.isBegaanbaar(w, x, 6), true, `(${x}, 6) hoort begaanbaar te zijn`);
});

test('een bosvijand uit Tiled is een gewoon wezen, met een figuur dat het spel kan tekenen', () => {
  const w = T.laadKaart(T.KAARTEN.proefbos, T.BETEKENIS.proefbos);
  const spin = w.wezens.find((e) => e.soort === 'reuzenspin');
  assert.ok(spin, 'de reuzenspin staat in het bos');
  assert.equal(spin.kant, 'monster');
  assert.equal(spin.dwaalt, true); // "straal" in Tiled laat hem rondlopen
  // Wat Marcel kan neerzetten, moet het spel kunnen tekenen: de soort is tegelijk de naam van het
  // figuur in beelden/beschrijving.js (js/sprites.js zoekt hem daar op de soort op).
  assert.ok(T.BEELDEN.figuren[spin.soort], `beelden/figuren kent "${spin.soort}"`);
  for (const h of ['staan', 'lopen', 'aanval', 'geraakt', 'sterven']) {
    assert.ok(T.BEELDEN.figuren[spin.soort].houdingen[h], `de reuzenspin kan ${h}`);
  }
});

test('elk wezen dat Marcel in Tiled kan neerzetten, heeft een figuur in beelden/', () => {
  // Wie nog niet getekend is, mag een vel lenen (vel: 'boer') — dan moet dát vel er wel zijn,
  // anders staat er straks niets op de kaart. De schout draagt het vel van een gewone
  // dorpeling (js/sprites.js); tot 25 sep was hij de tovenaar van het oude spel.
  for (const [soort, w] of Object.entries(T.WEZENS)) {
    const eigen = soort === 'schout' ? 'dorpeling0' : soort;
    const vel = T.BEELDEN.figuren[eigen] ? eigen : w.vel;
    assert.ok(
      vel && T.BEELDEN.figuren[vel],
      `"${soort}" staat in T.WEZENS maar heeft geen figuur in beelden/ en leent er ook geen (vel:) — of draai npm run pixelart:spel`,
    );
  }
});
