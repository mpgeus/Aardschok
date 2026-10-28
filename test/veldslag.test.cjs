// De veldslag (vraag 187 en 188, stap 3; js/veldslag.js; ontwerp/scenario.md, 7): skirmish zonder economie. Stap 3a1: een
// kaart is een klein eiland uit een recept (T.KAARTEN, levels/kaarten.js; js/eiland.js), met variatie uit het zaad.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const ford = (zaad) => {
  const w = T.veldslagWereld('ford', zaad);
  return { w, E: T.eilandVan(w.eiland), R: T.eilandVan(w.eiland).recept };
};
const grond = (w, x, y) => (T.grondOp(w, x, y) || {}).naam;

test('The Ford: een klein eiland met een rivier, twee voorden, een brug, een pas van rotsen en open stroken', () => {
  const { w, E, R } = ford(1);
  assert.deepEqual(w.eiland, { zaad: 1, recept: 'ford' }, 'de wereld draagt het recept');
  assert.equal(R.maat, 96);
  // zee om het land, en het land binnen de rand
  assert.equal(grond(w, R.x0 - 4, Math.round(R.cy)), 'zee');
  const rand = T.kaartGrens(w);
  assert.ok(rand.x <= R.x0 && rand.x + rand.b >= R.x0 + R.maat, 'het land ligt binnen de rand');
  // de rivier: water tussen links en rechts, behalve bij de brug en de voorden
  assert.equal(E.bruggen.length, 1, 'één brug');
  assert.equal(R.voorden.length, 2, 'twee voorden');
  for (const v of R.voorden) {
    assert.equal(grond(w, Math.round(v.x), Math.round(v.y)), 'strand', 'een voorde is zand');
    assert.ok(T.isBegaanbaar(w, Math.round(v.x), Math.round(v.y), {}), 'je loopt door een voorde');
  }
  // tussen de voorden en de brug is de rivier water
  const tussen = { x: Math.round((R.voorden[0].x + R.brug.x) / 2), y: Math.round((R.voorden[0].y + R.brug.y) / 2) };
  const water = [];
  for (let d = -6; d <= 6; d++) water.push(grond(w, tussen.x + d, tussen.y - d));
  assert.ok(water.includes('water'), `water tussen voorde en brug: ${water.join(' ')}`);
  // de rotsen van de pas staan er, en zijn niet te begaan
  assert.ok(R.rotsen.length >= 20, `${R.rotsen.length} rotsen`);
  const gezet = R.rotsen.filter((p) => w.voorwerpen.some((v) => v.soort === 'rots' && v.x === p.x && v.y === p.y));
  assert.ok(gezet.length >= R.rotsen.length * 0.8, `${gezet.length} van de ${R.rotsen.length} rotsen staan`);
  for (const p of gezet) assert.ok(!T.isBegaanbaar(w, p.x, p.y, {}), 'een rots staat in de weg');
  // van de ene strook naar de andere over land, en de stroken zijn open (bijna geen bomen)
  const midden = (st) => ({ x: Math.round(st.hoeken.reduce((s, h) => s + h[0], 0) / 4), y: Math.round(st.hoeken.reduce((s, h) => s + h[1], 0) / 4) });
  const [links, rechts] = R.stroken.map(midden);
  assert.ok(T.zoekRoute(w, links, rechts, {}), 'van links naar rechts');
  for (const st of R.stroken) {
    const m = midden(st);
    let bomen = 0;
    let tegels = 0;
    for (let y = m.y - 5; y <= m.y + 5; y++) {
      for (let x = m.x - 5; x <= m.x + 5; x++) {
        tegels++;
        const v = T.voorwerpOp(w, x, y);
        if (v && T.BOMEN[v.soort]) bomen++;
      }
    }
    assert.ok(bomen <= tegels * 0.08, `de strook is open: ${bomen} bomen op ${tegels} tegels`);
  }
  // de heuvels steken boven het land uit
  for (const h of R.heuvels) assert.ok(T.hoogteOp(w, h.x, h.y) > R.land + 30, `een heuvel: ${T.hoogteOp(w, h.x, h.y)}`);
});

test('The Ford: hetzelfde zaad is dezelfde kaart, een ander zaad een andere', () => {
  const a = ford(1).R;
  const b = ford(1).R;
  const c = ford(2).R;
  const vorm = (R) => JSON.stringify({ h: R.heuvels, b: R.bos, v: R.voorden, r: R.rotsen });
  assert.equal(vorm(a), vorm(b), 'hetzelfde zaad');
  assert.notEqual(vorm(a), vorm(c), 'een ander zaad');
});

test('het grote eiland blijft wat het was, en een kaart en het eiland wisselen elkaar af', () => {
  const groot = T.eilandVan(5);
  assert.equal(groot.recept, undefined);
  assert.ok(groot.plekken.length > 5, 'dorpen, een kasteel, een stad');
  const kaart = T.eilandVan({ zaad: 5, recept: 'ford' });
  assert.ok(kaart.recept, 'met een recept is het een kaart');
  assert.equal(kaart.plekken.length, 0, 'een kaart heeft geen dorpsplekken');
  assert.notEqual(T.eilandVan(5), kaart, 'en het eiland van 5 is weer het grote');
  assert.throws(() => T.eilandVan({ zaad: 1, recept: 'nergens' }), /geen kaart nergens/);
});
