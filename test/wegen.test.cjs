// De wegen die jij legt (js/wegen.js; werklijst C, stap 5; Marcel, 14 okt: "a ja, b ja, c1, d ja, ... f ja"): twee
// klikken, recht en haaks, de bouwers leggen hem tegel voor tegel, en de ossenkar rijdt er twee keer zo snel over.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, dagen } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

function dorp() {
  const r = proefDorp(T);
  Object.assign(r.S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = r.S;
  return { ...r, dag: Math.floor(r.S.kalender.dag) };
}

// Een vrij stuk van b bij h tegels in het bouwbereik, zonder weg, gebouw, veld of iets vasts: waar een toets een weg legt.
function vrijStuk(D, b, h) {
  const w = D.wereld;
  const m = T.deurVan(w, D.gebouwen.find((g) => g.soort === 'schout'));
  for (let r = 2; r < 16; r++) {
    for (let y = m.y - r; y <= m.y + r; y++) {
      for (let x = m.x - r; x <= m.x + r; x++) {
        let vrij = true;
        for (let dy = 0; dy < h && vrij; dy++) {
          for (let dx = 0; dx < b && vrij; dx++) {
            const tx = x + dx;
            const ty = y + dy;
            if (T.waaromGeenWegOp(D, tx, ty) || T.opPad(w, tx, ty) || T.isVast(w, tx, ty) || T.wezenOp(w, tx, ty)) vrij = false;
          }
        }
        if (vrij) return { x, y };
      }
    }
  }
  throw new Error('geen vrij stuk bij het huis van de schout');
}

test('een weg tussen twee klikken loopt recht en haaks, en kost alleen werk', () => {
  const { D } = dorp();
  const a = vrijStuk(D, 7, 5);
  const plan = T.planWeg(D, a, { x: a.x + 6, y: a.y + 4 });
  assert.equal(plan.reden, null, plan.reden);
  assert.deepEqual(plan.plekken[0], a, 'hij begint waar je klikte');
  assert.deepEqual(plan.plekken[plan.plekken.length - 1], { x: a.x + 6, y: a.y + 4 }, 'en eindigt waar je klikte');
  for (let i = 1; i < plan.plekken.length; i++) {
    const [p, q] = [plan.plekken[i - 1], plan.plekken[i]];
    assert.equal(Math.abs(p.x - q.x) + Math.abs(p.y - q.y), 1, 'elke stap recht, nooit schuin');
  }
  assert.equal(plan.plekken.length, 11, 'de kortste: zes opzij en vier omlaag');
  const richting = plan.plekken.slice(1).map((t, i) => `${t.x - plan.plekken[i].x},${t.y - plan.plekken[i].y}`);
  const bochten = richting.slice(1).filter((r, i) => r !== richting[i]).length;
  assert.equal(bochten, 1, 'met de minste bochten');
  assert.equal(plan.werk, Math.round(11 * T.WEGEN_INSTELLINGEN.werkPerTegel * 100) / 100);
});

test('waar geen weg kan: buiten het bouwbereik, op een gebouw, en een weg die er al ligt', () => {
  const { D, schout } = dorp();
  const r = T.voetVanGebouw(schout);
  assert.ok(T.planWeg(D, { x: r.x, y: r.y }, { x: r.x + 1, y: r.y }).reden, 'niet op het huis van de schout');
  const ver = T.planWeg(D, { x: r.x + 200, y: r.y }, { x: r.x + 202, y: r.y }).reden;
  assert.ok(ver && /Too far away|do not know/.test(ver), ver);
  const a = vrijStuk(D, 5, 1);
  for (let dx = 0; dx < 5; dx++) T.legWegTegel(D.wereld, a.x + dx, a.y);
  assert.equal(T.planWeg(D, a, { x: a.x + 4, y: a.y }).reden, T.t('There is a road there already.'));
});

test('de bouwers leggen de weg tegel voor tegel; daarna is het pad, en bouw je er niet op', () => {
  const { S, D, w, dag } = dorp();
  const a = vrijStuk(D, 8, 1);
  const b = { x: a.x + 7, y: a.y };
  const r = T.legWeg(D, a, b);
  assert.ok(r.gelukt, r.reden);
  assert.equal(D.wegwerk.length, 1);
  assert.ok(T.waaromNietOpDezeGrond(D, a.x + 3, a.y), 'waar een weg komt, komt geen gebouw');
  dagen(T, S, dag + 1);
  assert.ok(D.bewoners.mensen.some((p) => p.bouwt === r.weg) || r.weg.klaar, 'wie geen werk heeft, legt de weg');
  dagen(T, S, dag + 4);
  assert.ok(r.weg.klaar, `de weg is af (${r.weg.af} van ${r.weg.plekken.length})`);
  assert.deepEqual(D.wegwerk, []);
  for (let x = a.x; x <= b.x; x++) {
    assert.ok(T.opGelegdeWeg(w, x, a.y) && T.opPad(w, x, a.y), `(${x}, ${a.y}) is weg`);
    assert.ok(T.waaromNietOpDezeGrond(D, x, a.y), 'en daar wordt niet op gebouwd');
  }
});

test('de ossenkar zoekt een weg op, en rijdt er twee keer zo snel over; de mensen niet', () => {
  const { D, w } = dorp();
  const a = vrijStuk(D, 13, 3);
  // een weg over de bovenste rij; van links naar rechts over de onderste rij is het rechtdoor korter
  for (let dx = 0; dx < 13; dx++) T.legWegTegel(w, a.x + dx, a.y);
  const van = { x: a.x, y: a.y + 2 };
  const naar = { x: a.x + 12, y: a.y + 2 };
  const kar = T.zoekRoute(w, van, naar, { kar: true });
  const mens = T.zoekRoute(w, van, naar, {});
  assert.ok(kar.some((t) => t.y === a.y), 'de kar neemt de weg');
  assert.ok(mens.every((t) => t.y === a.y + 2), 'een mens loopt rechtdoor');
  assert.equal(T.karKostOp(w, a.x + 3, a.y), 1 / T.WEGEN_INSTELLINGEN.karSneller, 'op de weg rijdt hij sneller');
  assert.equal(T.karKostOp(w, a.x + 3, a.y + 2), 1, 'ernaast niet');
});

test('een bewaard spel weet waar de wegen liggen en welke nog komen', () => {
  const { S, D, w } = dorp();
  const a = vrijStuk(D, 6, 3);
  T.legWegTegel(w, a.x, a.y);
  T.legWegTegel(w, a.x + 1, a.y);
  assert.ok(T.legWeg(D, { x: a.x, y: a.y + 2 }, { x: a.x + 5, y: a.y + 2 }).gelukt);
  const S2 = {};
  assert.ok(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 })).gelukt);
  const D2 = S2.dorp;
  assert.ok(T.opGelegdeWeg(D2.wereld, a.x + 1, a.y));
  assert.equal(D2.wegwerk.length, 1);
  assert.ok(T.wegKomtOp(D2, a.x + 3, a.y + 2), 'de weg in aanleg is er nog');
});

test('afbreken: een stuk weg wordt weer gras, en een weg in aanleg stopt', () => {
  const { D, w } = dorp();
  const a = vrijStuk(D, 6, 3);
  T.legWegTegel(w, a.x, a.y);
  const h = T.handelingAfbreken(D, a.x, a.y);
  assert.ok(h.kan, h.tekst);
  h.doe();
  assert.ok(!T.opPad(w, a.x, a.y), 'weer gras');
  const r = T.legWeg(D, { x: a.x, y: a.y + 2 }, { x: a.x + 5, y: a.y + 2 });
  const stop = T.handelingAfbreken(D, a.x + 2, a.y + 2);
  assert.ok(stop.kan, stop.tekst);
  stop.doe();
  assert.ok(!D.wegwerk.includes(r.weg), 'die weg komt niet meer');
});
