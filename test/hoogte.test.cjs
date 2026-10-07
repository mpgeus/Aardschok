// De hoogte van het land (js/hoogte.js; werklijst vraag 121, stap 1; Marcel, 7 okt: "ik doel ook meer op heuvels in het
// landschap", en "a ja 32, b hoger"): met de spelregel "Hoogte" op "Heuvels" legt de maker hoge heuvels in het wilde
// land, een zachte glooiing en een richel bij de rotsen; vlak waar een huis, het plein of het water ligt. Op "Vlak" (de
// standaard) is er geen hoogte, en tekent en klikt alles als vroeger.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

function land(zaad, heuvels) {
  const echt = console.warn;
  console.warn = () => {};
  T.zetOptie('hoogte', heuvels ? 'heuvels' : 'vlak');
  try {
    return T.laadGemaaktGehucht(zaad);
  } finally {
    T.zetOptie('hoogte', 'vlak');
    console.warn = echt;
  }
}

test('hoogte: op "Vlak" heeft een land geen hoogte, en ligt alles op de grond zoals vroeger', () => {
  const w = land(5, false);
  assert.equal(w.hoogte, undefined);
  assert.equal(T.hoogteOp(w, 40.3, 51.7), 0);
  assert.deepEqual(T.naarSchermOp(w, 40.3, 51.7), T.naarScherm(40.3, 51.7));
  assert.deepEqual(T.naarWereldOp(w, 123, 456), T.naarWereld(123, 456));
  assert.equal(T.isSchuin(w, 40, 51), false);
  assert.deepEqual(T.wandenVan(w, 40, 51), []);
});

test('hoogte: uit hetzelfde nummer hetzelfde land, met hoge heuvels en een richel', () => {
  const a = land(5, true);
  const b = land(5, true);
  assert.deepEqual(a.hoogte, b.hoogte);
  const I = T.HOOGTE_INSTELLINGEN;
  const hoogst = Math.max(...a.hoogte.glooiing);
  assert.ok(hoogst >= 80 && hoogst <= I.heuvelHoog[1] + I.golf, `de hoogste heuvel is ${hoogst} pixels`);
  assert.ok(Object.keys(a.hoogte.niveau).length >= 12, 'een richel bij de rotsen');
  assert.ok(Object.keys(a.hoogte.hellingen).length >= 1, 'met een helling erop');
  // een ander land is anders
  assert.notDeepEqual(land(7, true).hoogte.glooiing, a.hoogte.glooiing);
});

test('hoogte: een huis met zijn looppad en het plein liggen vlak, op het maaiveld', () => {
  for (const zaad of [3, 5, 7]) {
    const w = land(zaad, true);
    const plan = T.maakGehucht(zaad);
    const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
    for (const h of plan.huizen) {
      for (let y = h.y - lp; y < h.y + h.d + lp; y++) {
        for (let x = h.x - lp; x < h.x + h.b + lp; x++) {
          if (x < 0 || y < 0 || x >= w.b || y >= w.h) continue;
          assert.deepEqual(T.hoekHoogten(w, x, y), [0, 0, 0, 0], `land ${zaad}: ${h.rol} op (${h.x}, ${h.y}), tegel (${x}, ${y})`);
        }
      }
    }
    for (const [px, py] of plan.plein) {
      const [x, y] = [Math.round(px), Math.round(py)];
      assert.deepEqual(T.hoekHoogten(w, x, y), [0, 0, 0, 0], `land ${zaad}: het plein op (${x}, ${y})`);
    }
  }
});

test('hoogte: buren delen hun hoek, behalve waar een wand staat; een wand alleen aan de zuid- en oostkant', () => {
  const w = land(5, true);
  let wanden = 0;
  for (let y = 0; y < w.h - 1; y++) {
    for (let x = 0; x < w.b - 1; x++) {
      const hier = T.hoekHoogten(w, x, y);
      const oost = T.hoekHoogten(w, x + 1, y);
      const zuid = T.hoekHoogten(w, x, y + 1);
      const naarOost = hier[1] !== oost[0] || hier[2] !== oost[3];
      const naarZuid = hier[3] !== zuid[0] || hier[2] !== zuid[1];
      const kanten = T.wandenVan(w, x, y).map((wd) => wd.kant);
      // een wand staat waar deze tegel hoger ligt dan zijn buur; ligt hij lager, dan is het de wand van de buur aan
      // zijn noord- of westkant, die je niet ziet
      if (kanten.includes('oost')) assert.ok(naarOost);
      if (kanten.includes('zuid')) assert.ok(naarZuid);
      if (!naarOost) assert.ok(!kanten.includes('oost'));
      if (!naarZuid) assert.ok(!kanten.includes('zuid'));
      wanden += kanten.length;
    }
  }
  assert.ok(wanden > 0, 'de richel heeft een wand');
});

test('hoogte: de muis vindt de tegel terug, of een tegel ervoor die hem afdekt', () => {
  const w = land(5, true);
  let schuin = 0;
  let zelf = 0;
  let alle = 0;
  for (let y = 5; y < w.h - 5; y += 3) {
    for (let x = 5; x < w.b - 5; x += 3) {
      if (T.isSchuin(w, x, y)) schuin++;
      const p = T.naarSchermOp(w, x + 0.1, y - 0.15);
      const terug = T.naarWereldOp(w, p.x, p.y);
      const t = { x: Math.round(terug.x), y: Math.round(terug.y) };
      alle++;
      if (t.x === x && t.y === y) zelf++;
      // een andere tegel mag alleen als hij ervoor ligt (een heuvel of een richel dekt af wat erachter ligt)
      else assert.ok(t.x + t.y > x + y, `(${x}, ${y}) gaf (${t.x}, ${t.y})`);
    }
  }
  assert.ok(schuin > 20, `er lagen ${schuin} schuine tegels tussen`);
  assert.ok(zelf > alle * 0.9, `${zelf} van ${alle} tegels gevonden`);
});

test('hoogte: de hoogte op een punt ligt tussen de hoeken van zijn tegel', () => {
  const w = land(5, true);
  for (let y = 0; y < w.h; y += 7) {
    for (let x = 0; x < w.b; x += 7) {
      const h = T.hoekHoogten(w, x, y);
      assert.equal(T.hoogteOp(w, x - 0.5, y - 0.5), h[0]);
      const m = T.hoogteOp(w, x, y);
      assert.ok(m >= Math.min(...h) - 1e-9 && m <= Math.max(...h) + 1e-9);
    }
  }
});
