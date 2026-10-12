// Het groen eronder (werklijst vraag 148, stap 3; Marcel, 11 okt: "Ja akkoord"): de struiken, varens, het gras, de bloemen
// en de paddenstoelen in een paar vormen en in het jaar, zoals de bomen (test/boomvormen.test.cjs), en de nieuwe soorten,
// die de maker legt met een vaste keus per tegel: op de heide, aan en op het water en aan de bosrand (langs de akkers en
// achter de huizen legde hij ze ook, zolang hij een dorp legde dat er al was; sinds ronde 2 van het snoeien, stap 6, is
// dat weg). De braam en de brem staan in de weg en je rooit ze zoals een struik.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const vel = T.TEGELS.begroeiing;
const eersteVan = (naam) => vel.tiles.findIndex((t) => t && t.naam === naam && !t.vorm);
const NIEUW = ['klaproos', 'korenbloem', 'brandnetel', 'heide', 'brem', 'distel', 'lisdodde', 'waterlelie', 'braam'];

test('elke plant heeft een tekening, en een struik een van zijn vier vormen per tegel', () => {
  for (const naam of NIEUW) assert.ok(eersteVan(naam) >= 0, `${naam} heeft geen tekening (npm run tiled begroeiing)`);
  const id = eersteVan('struik');
  const gezien = new Set();
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      const t = T.sprites.tekeningVan({ vel: 'begroeiing', id, x, y }).id;
      assert.equal(vel.tiles[t].naam, 'struik');
      gezien.add(t);
    }
  }
  assert.equal(gezien.size, 4);
  // de stronk heeft er maar één
  const stronk = eersteVan('boomstronk');
  assert.equal(T.sprites.tekeningVan({ vel: 'begroeiing', id: stronk, x: 7, y: 3 }).id, stronk);
});

test('wat langs de akkers en op de heide en het water groeit, ligt plat in de grond', () => {
  // plat: niet vast, en niet hoger dan 24 pixels (PLAT_HOOG in js/tekenen.js), in elke vorm
  for (const naam of ['klaproos', 'korenbloem', 'heide', 'waterlelie']) {
    for (const t of vel.tiles.filter((t) => t && t.naam === naam)) assert.ok(!t.vast && t.doos[1] <= 24, `${naam} ${t.vorm || 1} is ${t.doos[1]} hoog`);
  }
});

test('de braam en de brem staan in de weg, en je rooit ze zoals een struik', () => {
  for (const naam of ['braam', 'brem']) {
    assert.ok(vel.tiles[eersteVan(naam)].vast, naam);
    assert.ok(T.BOMEN[naam].struik && !T.isBosBoom(naam), naam);
  }
  const w = { tegels: [['vloer', 'vloer']], voorwerpen: [] };
  T.zetVoorwerp(w, { soort: 'braam', x: 0, y: 0 });
  T.zetVoorwerp(w, { soort: 'brandnetel', x: 1, y: 0 });
  assert.equal(T.ontginWerkOp(w, 0, 0), 'rooien');
  assert.equal(T.ontginWerkOp(w, 1, 0), null);
});

test('een vel per seizoen heeft elke plant op het nummer van de zomer, en de stronk en de stenen alleen met sneeuw', () => {
  for (const seizoen of ['lente', 'herfst', 'winter', 'sneeuw']) {
    const s = T.TEGELS[`begroeiing-${seizoen}`];
    assert.ok(s, `geen vel begroeiing-${seizoen} (npm run tiled begroeiing-${seizoen})`);
    assert.equal(s.seizoen, seizoen);
    assert.equal(s.van, 'begroeiing');
    s.tiles.forEach((t, i) => {
      if (!t || !t.cel) return;
      assert.equal(t.naam, vel.tiles[i].naam, `${seizoen} ${i}`);
      assert.equal(t.vorm, vel.tiles[i].vorm, `${seizoen} ${i}`);
    });
    const heeft = (naam) => s.tiles.some((t) => t && t.cel && t.naam === naam);
    for (const naam of ['struik', 'varen', 'grasPol', ...NIEUW]) assert.ok(heeft(naam), `${naam} niet in ${seizoen}`);
    for (const naam of ['boomstronk', 'rots', 'kleineRots']) assert.equal(heeft(naam), seizoen === 'sneeuw', `${naam} in ${seizoen}`);
  }
});

test('de maker legt het groen eronder met een vaste keus per tegel: verder ligt alles waar het lag', () => {
  const G = T.MAKER_INSTELLINGEN.groei;
  const plekken = ['heideGroen', 'oeverGroen', 'waterGroen', 'bosrand'];
  const bewaar = Object.fromEntries(plekken.map((k) => [k, G[k]]));
  const zonder = (() => {
    for (const k of plekken) G[k] = {};
    try {
      return T.planOpEiland(5);
    } finally {
      Object.assign(G, bewaar);
    }
  })();
  const plan = T.planOpEiland(5);
  assert.equal(plan.poging, zonder.poging);
  const sleutel = (v) => `${v.naam}@${v.x},${v.y}`;
  const nu = new Set(plan.voorwerpen.map(sleutel));
  for (const v of zonder.voorwerpen) assert.ok(nu.has(sleutel(v)), `${sleutel(v)} is weg`);
  const namen = new Set(plan.voorwerpen.map((v) => v.naam));
  for (const naam of ['heide', 'lisdodde', 'waterlelie', 'braam']) assert.ok(namen.has(naam), `geen ${naam} op eiland 5`);
  // een waterlelie op het water
  const water = (v) => [[0, 0], [1, 0], [0, 1], [1, 1]].some(([dx, dy]) => plan.grond[v.y + dy][v.x + dx] === 'w');
  for (const v of plan.voorwerpen.filter((v) => v.naam === 'waterlelie')) assert.ok(water(v), `waterlelie op (${v.x}, ${v.y})`);
});
