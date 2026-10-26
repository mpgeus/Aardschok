// De kaart van een level, met een rand (vraag 187, stap 2a; ontwerp/scenario.md, 1): een vast eiland, een dorpsplek op
// naam, en een rand op de stukken van 64 (T.randOm in js/maker.js, T.stukBinnenRand in js/wereld.js). Buiten de rand gaat
// het land nooit open, een tocht erheen loopt tot de rand (Marcel, 24 okt: "Hij loopt tot de rand"), wie wegtrekt gaat
// niet naar een kamp erbuiten, en de minikaart toont alleen de kaart ("Alleen de kaart").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const STUK = T.STUK;
const ZAAD = T.proefdorp.zaad;
// Het eiland van het proefdorp, op de plek Fieldhurst (niet jouw plek op dat eiland: dat is Crowthorpe).
const LEVEL = { eiland: { zaad: ZAAD }, plek: 'Fieldhurst', rand: { b: 4, h: 4 } };
let spel = null;
const metRand = () => spel || (spel = T.proefdorp.begin(ZAAD, LEVEL));
const binnen = (w, n) => T.stukBinnenRand(w, n % 64, Math.floor(n / 64));
const inGrens = (g, t) => t.x >= g.x && t.y >= g.y && t.x < g.x + g.b && t.y < g.y + g.h;

test('de rand ligt om wat het begin opent, zo midden als het kan, ook aan de kust; te klein gooit', () => {
  assert.equal(T.randMinstens(), 4, 'het land van 100 met 16 eromheen beslaat hooguit 4 stukken');
  const z = T.MAKER_INSTELLINGEN.zicht;
  const bevat = (r, vak) =>
    r.sx * STUK <= vak.x - z && r.sy * STUK <= vak.y - z && (r.sx + r.b) * STUK >= vak.x + vak.b + z && (r.sy + r.h) * STUK >= vak.y + vak.h + z;
  for (const vak of [{ x: 1000, y: 1000, b: 100, h: 100 }, { x: 1037, y: 1100, b: 100, h: 100 }, { x: 1178, y: 826, b: 100, h: 100 }]) {
    for (const n of [4, 5, 7]) {
      const r = T.randOm(vak, n, n);
      assert.ok(bevat(r, vak), JSON.stringify({ vak, r }));
      const midden = (r.sx + n / 2) * STUK;
      assert.ok(Math.abs(midden - (vak.x + 50)) <= STUK / 2 + 1, `zo midden als het kan: ${midden} tegen ${vak.x + 50}`);
    }
  }
  // Aan de kust: binnen het eiland, en toch om het begin.
  const kust = { x: 5, y: 2420, b: 100, h: 100 };
  const r = T.randOm(kust, 4, 4);
  assert.deepEqual(r, { sx: 0, sy: 36, b: 4, h: 4 });
  assert.ok((r.sy + r.h) * STUK >= T.EILAND_INSTELLINGEN.maat);
  // Beslaat het begin 4 stukken, dan is 3 te klein.
  assert.throws(() => T.randOm({ x: 1037, y: 1100, b: 100, h: 100 }, 3, 4), /te klein/);
});

test('een level met een vast eiland, een plek op naam en een rand: alles wat open is, ligt binnen de rand', () => {
  const S = metRand();
  const w = S.wereld;
  assert.equal(S.dorp.plek.naam, 'Fieldhurst');
  assert.equal(w.eiland.zaad, ZAAD);
  assert.deepEqual(w.rand, T.randOm(S.dorp.plek.vak, 4, 4));
  assert.ok(w.open.size > 0 && [...w.open].every((n) => binnen(w, n)), 'het begin opent alleen binnen de rand');
  assert.deepEqual(T.kaartGrens(w), { x: w.rand.sx * STUK, y: w.rand.sy * STUK, b: 4 * STUK, h: 4 * STUK }, 'de camera en het tekenen blijven erbinnen');
  // Een plek die er niet is, of een level dat niet door de keuring komt: geen spel.
  assert.throws(() => T.proefdorp.begin(ZAAD, { ...LEVEL, plek: 'Nergenshuizen' }), /geen dorpsplek Nergenshuizen/);
  const fouten = (level) => T.keurScenario(level).join(' | ');
  assert.match(fouten({ rand: { b: 3, h: 4 } }), /minstens 4 bij 4/);
  assert.match(fouten({ plek: 'Fieldhurst' }), /vraagt een vast eiland/);
  assert.match(fouten({ eiland: { zaad: 0 } }), /een heel getal vanaf 1/);
  assert.deepEqual(T.keurScenario(LEVEL), []);
  // Zonder rand blijft alles zoals het was.
  const vol = T.proefdorp.begin(ZAAD);
  assert.equal(vol.wereld.rand, undefined);
  assert.deepEqual(T.kaartGrens(vol.wereld), { x: 0, y: 0, b: T.EILAND_INSTELLINGEN.maat, h: T.EILAND_INSTELLINGEN.maat });
});

test('wie bij de rand staat, maakt alleen land binnen de rand open; zonder rand ook erbuiten', () => {
  const S = metRand();
  const w = S.wereld;
  const D = S.dorp;
  const e = D.aanvoerder;
  const was = { x: e.x, y: e.y, tx: e.tx, ty: e.ty };
  const open = new Set(w.open);
  try {
    // Op de rechterrand, halverwege.
    const x = (w.rand.sx + w.rand.b) * STUK - 2;
    const y = (w.rand.sy + 2) * STUK;
    Object.assign(e, { x, y, tx: x, ty: y });
    for (let i = 0; i < 20 && T.werkStukkenBij(S, D, 0) != null; i++);
    assert.ok([...w.open].every((n) => binnen(w, n)), 'niets buiten de rand');
    assert.ok(w.open.has(T.stukVan(x, y)), 'zijn eigen stuk wel');
    // Zonder rand gaat het land erachter wel open (zo weten we dat de rand het tegenhield).
    const rand = w.rand;
    delete w.rand;
    for (let i = 0; i < 20 && T.werkStukkenBij(S, D, 0) != null; i++);
    assert.ok([...w.open].some((n) => !T.stukBinnenRand({ rand }, n % 64, Math.floor(n / 64))), 'zonder rand wel erbuiten');
    w.rand = rand;
  } finally {
    Object.assign(e, was);
    w.open.clear();
    for (const n of open) w.open.add(n);
  }
});

test('een tocht naar een plek buiten de rand loopt tot de rand, en blijft daar staan', () => {
  const S = metRand();
  const w = S.wereld;
  const D = S.dorp;
  const e = D.aanvoerder;
  const was = { x: e.x, y: e.y, tx: e.tx, ty: e.ty };
  const open = new Set(w.open);
  const g = T.kaartGrens(w);
  const doel = { x: g.x + g.b + 300, y: g.y + g.h / 2 };
  let van = { x: e.tx, y: e.ty };
  try {
    let gelopen = 0;
    for (let i = 0; i < 60; i++) {
      const pad = T.zoekRoute(w, van, doel, { tocht: true });
      if (pad === null) break;
      if (!pad.length) {
        // Het land voor hem is nog dicht: hij wacht, en het gaat open waar hij staat (zoals elke tik, js/dorp.js).
        Object.assign(e, { x: van.x, y: van.y, tx: van.x, ty: van.y });
        if (T.werkStukkenBij(S, D, 0) == null) break;
        continue;
      }
      assert.ok(pad.every((t) => inGrens(g, t)), 'hij loopt niet buiten de rand');
      van = pad[pad.length - 1];
      gelopen += pad.length;
    }
    assert.ok(gelopen > 0, 'hij liep');
    assert.ok(inGrens(g, van));
    assert.ok(g.x + g.b - van.x <= 24, `hij staat bij de rand: ${van.x} tegen ${g.x + g.b}`);
    assert.equal(T.zoekRoute(w, van, doel, { tocht: true }), null, 'verder komt hij niet, en hij wacht niet');
  } finally {
    Object.assign(e, was);
    w.open.clear();
    for (const n of open) w.open.add(n);
  }
});

test('wie wegtrekt, gaat niet naar een kamp buiten de rand; zonder rand wel naar het dichtste', () => {
  const S = metRand();
  const D = S.dorp;
  const p = D.bewoners.mensen.find((m) => m.leeftijd === 'volwassen');
  assert.equal(T.wordtRover(D, p), null, 'een kamp ligt minstens 150 tegels van een dorpsplek, dus nooit binnen 4 bij 4');
  const rand = S.wereld.rand;
  delete S.wereld.rand;
  try {
    const K = T.wordtRover(D, p);
    assert.ok(K && K.bende.some((l) => l.naam === p.naam));
    K.bende.pop();
  } finally {
    S.wereld.rand = rand;
  }
});

test('de minikaart toont alleen de kaart: het vierkant om de rand, even groot als anders het eiland', () => {
  const S = metRand();
  const w = S.wereld;
  const g = T.kaartGrens(w);
  const veld = T.minikaartVeld(w);
  assert.deepEqual(veld, { x: g.x, y: g.y, maat: 256, stap: 1, rand: g });
  assert.deepEqual(T.minikaartVeld(null), { x: 0, y: 0, maat: T.EILAND_INSTELLINGEN.maat, stap: T.MINIKAART_INSTELLINGEN.stap, rand: null });
  // De hoeken van de kaart zijn de hoeken van de ruit, en terug.
  assert.deepEqual(T.minikaartPunt(g.x, g.y, 328, veld), { x: 164, y: 0 });
  assert.deepEqual(T.minikaartPunt(g.x + 256, g.y + 256, 328, veld), { x: 164, y: 164 });
  const t = T.minikaartTegel(100, 60, 328, veld);
  const p = T.minikaartPunt(t.x, t.y, 328, veld);
  assert.ok(Math.abs(p.x - 100) < 1e-9 && Math.abs(p.y - 60) < 1e-9);
  // Het beeld: alles binnen de rand, ook de zee, en de lijn om de rand.
  const E = T.eilandVan(w.eiland.zaad);
  assert.equal(T.maakMinikaart(E, Infinity, veld), true);
  const m = T.minikaartBeeld(E, veld);
  assert.equal(m.n, 256);
  let dicht = 0;
  for (let i = 0; i < m.n * m.n; i++) dicht += m.rgba[i * 4 + 3] === 255 ? 1 : 0;
  assert.equal(dicht, m.n * m.n);
  assert.ok(m.binnen.every((b) => b === 1));
  // Een rand die niet vierkant is: wat buiten de rand valt, is doorzichtig.
  const smal = { ...w, rand: { ...w.rand, h: 5 } };
  const v2 = T.minikaartVeld(smal);
  assert.equal(v2.maat, 320);
  assert.equal(v2.stap, 2);
  T.maakMinikaart(E, Infinity, v2);
  const m2 = T.minikaartBeeld(E, v2);
  assert.equal(m2.rgba[(10 * m2.n + 150) * 4 + 3], 0, 'rechts van de rand niets');
  assert.equal(m2.rgba[(150 * m2.n + 10) * 4 + 3], 255, 'onder in de rand wel');
  // Wat je kent: de aanvoerder staat op een vak dat je kent.
  const gekend = T.minikaartGekend(S.dorp, veld);
  const a = S.dorp.aanvoerder;
  assert.equal(gekend[Math.floor(a.y - g.y) * 256 + Math.floor(a.x - g.x)], 1);
});

test('de rand gaat mee in een bewaard spel', () => {
  const S = metRand();
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = {};
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.deepEqual(S2.wereld.rand, S.wereld.rand);
});
