// De roverskampen (werklijst vraag 170, stap 6a2, c1; Marcel, 17 okt: "V2 G2 P1 B1", "M1"): het eiland legt er drie,
// in het woud, ver van de dorpsplekken, de stad, het kasteel, de wegen en elkaar (js/eiland.js, legKampen), elk met een
// open plek om het vuur en een paadje naar de dichtste weg (P1). In het spel staat een kamp er als het land eromheen
// opengaat (T.zetRoverskampenBij, js/rovers.js): een tent per twee man en het vuur, en de kaart onthoudt het (w.kampen).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => undefined });
const { leegBegin, dagen, bouwAf, zetBijHetVuur } = require('./grond.cjs');

const eilanden = new Map();
const eiland = (zaad) => {
  if (!eilanden.has(zaad)) eilanden.set(zaad, T.maakEiland(zaad));
  return eilanden.get(zaad);
};
const ZADEN = [5, 62707];
const K = () => T.EILAND_INSTELLINGEN.kampen;

// hoe ver punt (x, y) van een lijn (een lijst punten) ligt
function totLijn(punten, x, y) {
  let d = Infinity;
  for (let i = 0; i + 1 < punten.length; i++) {
    const [ax, ay] = punten[i];
    const [bx, by] = punten[i + 1];
    const lx = bx - ax;
    const ly = by - ay;
    const ll = lx * lx + ly * ly;
    let u = ll > 0 ? ((x - ax) * lx + (y - ay) * ly) / ll : 0;
    u = Math.max(0, Math.min(1, u));
    d = Math.min(d, Math.hypot(x - ax - u * lx, y - ay - u * ly));
  }
  return d;
}

test('roverskampen: drie per eiland, in het woud, ver van de plekken, de wegen en elkaar', () => {
  const W = T.EILAND_STREKEN.indexOf('woud');
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    assert.equal(E.kampen.length, K().aantal, `land ${zaad}: ${E.kampen.length} kampen`);
    assert.deepEqual(E.plekken.filter((p) => p.soort === 'kamp'), E.kampen, 'een kamp is een plek');
    const anderen = E.plekken.filter((p) => p.soort !== 'kamp');
    for (const k of E.kampen) {
      const vak = Math.floor(k.y / E.vak) * E.n + Math.floor(k.x / E.vak);
      assert.ok(E.hoofdland[vak] && E.streek[vak] === W, `land ${zaad}: kamp ${k.nr} ligt in het woud op het hoofdland`);
      for (const p of anderen) {
        const d = Math.hypot(p.x - k.x, p.y - k.y);
        assert.ok(d >= K().vanPlek, `land ${zaad}: kamp ${k.nr} ligt ${Math.round(d)} tegels van ${p.soort} ${p.naam || ''}`);
      }
      for (const q of E.kampen) {
        if (q !== k) assert.ok(Math.hypot(q.x - k.x, q.y - k.y) >= K().onderling, `land ${zaad}: de kampen ${k.nr} en ${q.nr} liggen ver uit elkaar`);
      }
      // van een weg, gemeten tussen de vakken (een vak speling)
      const weg = Math.min(...E.wegen.map((l) => totLijn(l.punten, k.x, k.y)));
      assert.ok(weg >= K().vanWeg - E.vak, `land ${zaad}: kamp ${k.nr} ligt ${Math.round(weg)} tegels van een weg`);
      assert.ok(k.tenten.length >= 1 && k.tenten.length <= K().tentenMeest, `land ${zaad}: kamp ${k.nr} heeft plaats voor een tent`);
    }
  }
});

test('roverskampen: de plek komt uit het nummer, en de dorpsplekken en de wegen blijven wat ze waren', () => {
  const E = eiland(5);
  const F = T.maakEiland(5);
  assert.deepEqual(F.kampen, E.kampen);
  assert.deepEqual(F.paden, E.paden);
  // een eiland zonder kampen heeft dezelfde dorpsplekken (met hun namen), dezelfde stad en hetzelfde kasteel, en dezelfde
  // wegen: de kampen kiezen met hun eigen lot, na de wegen
  const echt = K().aantal;
  K().aantal = 0;
  let G;
  try {
    G = T.maakEiland(5);
  } finally {
    K().aantal = echt;
  }
  assert.deepEqual(E.plekken.filter((p) => p.soort !== 'kamp'), G.plekken);
  assert.deepEqual(E.wegen, G.wegen);
});

test('roverskampen: een open plek om het vuur, zonder bomen, en een vlak plein van vertrapte grond', () => {
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const { plein, open } = K();
    for (const k of E.kampen) {
      const r = Math.ceil(open);
      const [x0, y0, b] = [k.x - r, k.y - r, 2 * r + 1];
      const st = T.eilandStuk(E, x0, y0, b, b);
      const land = T.landStuk(E, x0, y0, b, b);
      const bomen = new Set(land.dingen.filter((d) => T.BOMEN[d.naam] && !T.BOMEN[d.naam].struik).map((d) => d.y * E.maat + d.x));
      for (let j = 0; j < b; j++) {
        for (let i = 0; i < b; i++) {
          const [x, y] = [x0 + i, y0 + j];
          const d = Math.hypot(x - k.x, y - k.y);
          if (d >= open) continue;
          const o = j * b + i;
          assert.equal(st.kamp[o], 1, `land ${zaad}: (${x}, ${y}) hoort bij kamp ${k.nr}`);
          assert.equal(st.boom[o], 0, `land ${zaad}: geen boom op (${x}, ${y}) in kamp ${k.nr}`);
          assert.ok(!bomen.has(y * E.maat + x), `land ${zaad}: geen boom op het land op (${x}, ${y}) in kamp ${k.nr}`);
          if (d < plein) {
            assert.equal(st.weg[o], 1, `land ${zaad}: (${x}, ${y}) in kamp ${k.nr} is vertrapte grond`);
            assert.ok(Math.abs(st.hoogte[o] - k.h) < 1, `land ${zaad}: het plein van kamp ${k.nr} is vlak op (${x}, ${y})`);
          }
        }
      }
      // de tenten: op de vertrapte grond, en niets van het land eronder of ervoor
      for (const t of k.tenten) {
        for (let y = t.voet.y; y < t.voet.y + t.voet.h; y++) {
          for (let x = t.voet.x; x < t.voet.x + t.voet.b; x++) {
            assert.ok(Math.hypot(x - k.x, y - k.y) < plein, `land ${zaad}: de tent op (${x}, ${y}) staat op het plein van kamp ${k.nr}`);
            assert.ok(!land.dingen.some((d) => d.x === x && d.y === y), `land ${zaad}: er staat niets onder de tent op (${x}, ${y})`);
          }
        }
      }
    }
  }
});

// P1 (Marcel, 17 okt): een smal paadje van de dichtste weg naar het kamp, zodat elk kamp te bereiken is en je het pad
// kunt volgen; over water een brug, zoals een weg (L1).
test('roverskampen: het paadje loopt aan de grond van het kamp naar een weg (P1)', () => {
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const S = Object.fromEntries(T.EILAND_STREKEN.map((s, i) => [s, i]));
    // per stuk van 64: wat er begaanbaar is (een brug, of geen water en geen boom), zoals in de toets van de wegen (L1)
    const stukken = new Map();
    const vrij = (x, y) => {
      const k = Math.floor(y / 64) * 64 + Math.floor(x / 64);
      if (!stukken.has(k)) {
        const [x0, y0] = [(k % 64) * 64, Math.floor(k / 64) * 64];
        const hoek = T.eilandStuk(E, x0 - 0.5, y0 - 0.5, 65, 65).streek;
        const bomen = T.eilandStuk(E, x0, y0, 64, 64).boom;
        const v = new Uint8Array(64 * 64);
        for (let j = 0; j < 64; j++) {
          for (let i = 0; i < 64; i++) {
            const nat = [j * 65 + i, j * 65 + i + 1, (j + 1) * 65 + i, (j + 1) * 65 + i + 1].some((h) => hoek[h] <= S.rivier);
            v[j * 64 + i] = E.brugOp.has((y0 + j) * E.maat + x0 + i) ? 1 : nat || bomen[j * 64 + i] ? 0 : 1;
          }
        }
        stukken.set(k, v);
      }
      return stukken.get(k)[(y % 64) * 64 + (x % 64)] === 1;
    };
    for (const k of E.kampen) {
      const pad = E.paden.find((p) => p.kamp === k.nr);
      assert.ok(pad, `land ${zaad}: kamp ${k.nr} heeft een paadje`);
      assert.deepEqual(pad.punten[0], [k.x, k.y], 'het paadje begint bij het vuur');
      const eind = pad.punten[pad.punten.length - 1];
      assert.ok(Math.min(...E.wegen.map((l) => totLijn(l.punten, eind[0], eind[1]))) < 0.01, `land ${zaad}: het paadje van kamp ${k.nr} komt op een weg`);
      // een strook van twee tegels om het paadje; daarover van het vuur naar de weg
      const rij = [];
      for (let i = 0; i + 1 < pad.punten.length; i++) {
        const [ax, ay] = pad.punten[i];
        const [bx, by] = pad.punten[i + 1];
        const st = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * 2));
        for (let s = 0; s <= st; s++) rij.push({ x: Math.round(ax + ((bx - ax) * s) / st), y: Math.round(ay + ((by - ay) * s) / st) });
      }
      const strook = new Set();
      for (const t of rij) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) strook.add((t.y + dy) * E.maat + t.x + dx);
      const van = rij[0];
      const naar = rij.filter((t) => vrij(t.x, t.y)).pop();
      assert.ok(vrij(van.x, van.y), `land ${zaad}: het vuur van kamp ${k.nr} staat op open grond`);
      const gezien = new Set([van.y * E.maat + van.x]);
      const rand = [van];
      for (let q = 0; q < rand.length; q++) {
        const t = rand[q];
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const [x, y] = [t.x + dx, t.y + dy];
          const n = y * E.maat + x;
          if (gezien.has(n) || !strook.has(n) || !vrij(x, y) || (dx && dy && !(vrij(t.x + dx, t.y) && vrij(t.x, t.y + dy)))) continue;
          gezien.add(n);
          rand.push({ x, y });
        }
      }
      assert.ok(gezien.has(naar.y * E.maat + naar.x), `land ${zaad}: van het vuur van kamp ${k.nr} kom je langs het paadje bij de weg (${naar.x}, ${naar.y})`);
    }
  }
});

test('roverskampen: in het spel staat een kamp er als zijn land opengaat, en de kaart onthoudt het', () => {
  const { S, w } = leegBegin(T);
  const E = T.eilandVan(w.eiland.zaad);
  assert.equal((w.kampen || []).length, 0, 'bij het begin is het land van geen kamp open');
  assert.ok(!w.voorwerpen.some((v) => v.kamp != null));
  const k = E.kampen[0];
  const r = K().open;
  T.openVak(w, { x: k.x - r, y: k.y - r, b: 2 * r + 1, h: 2 * r + 1 });
  T.wereldTik(S);
  assert.deepEqual(w.kampen, [{ nr: k.nr, x: k.x, y: k.y }]);
  const tenten = w.voorwerpen.filter((v) => v.soort === 'tent' && v.kamp === k.nr);
  const R = T.ROVERS_INSTELLINGEN;
  assert.equal(tenten.length, Math.ceil(R.kampBende / R.manPerTent), 'een tent per twee man');
  assert.ok(tenten.every((v) => v.vorm === 'tent-rover'));
  const vuur = w.voorwerpen.filter((v) => v.soort === 'kampvuur' && v.kamp === k.nr);
  assert.equal(vuur.length, 1);
  assert.deepEqual([vuur[0].x, vuur[0].y], [k.x, k.y]);
  assert.ok(!T.isBegaanbaar(w, tenten[0].x, tenten[0].y), 'een tent staat in de weg');
  // nog een tik: er komt niets bij
  T.wereldTik(S);
  assert.equal(w.voorwerpen.filter((v) => v.kamp === k.nr).length, tenten.length + 1);
  // bewaard en geladen: het kamp staat er nog, één keer
  const S2 = {};
  const uit = T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 }));
  assert.ok(uit.gelukt, uit.reden);
  T.wereldTik(S2);
  assert.deepEqual(S2.wereld.kampen, w.kampen);
  assert.equal(S2.wereld.voorwerpen.filter((v) => v.kamp === k.nr).length, tenten.length + 1);
  // het vuur brandt in het donker, en geeft dan licht; overdag smeult het
  const dag = Math.floor(S.kalender.dag);
  assert.equal(T.roverskampVuur(dag + 23 / 24), 'brandt');
  assert.equal(T.roverskampVuur(dag + 12 / 24), 'smeult');
  assert.equal(T.roverskampenLicht(w, dag + 23 / 24).length, 1);
  assert.equal(T.roverskampenLicht(w, dag + 12 / 24).length, 0);
});

// Is de laatste tent van het lege begin leeg, dan gaat het kampvuur van het dorp uit (js/begin.js); tot c1 nam het daarvoor
// het eerste kampvuur op de kaart, en dat kan dat van een roverskamp zijn.
test('roverskampen: het dorp haalt bij het verhuizen alleen zijn eigen kampvuur weg', () => {
  const { S, D, w } = leegBegin(T);
  const k = T.eilandVan(w.eiland.zaad).kampen[0];
  const r = K().open;
  T.openVak(w, { x: k.x - r, y: k.y - r, b: 2 * r + 1, h: 2 * r + 1 });
  T.wereldTik(S);
  dagen(T, S, 1);
  assert.equal(D.begin.kamp, 'op', 'het kamp van het dorp staat');
  const vuren = () => w.voorwerpen.filter((v) => v.soort === 'kampvuur');
  assert.equal(vuren()[0].kamp, k.nr, 'het vuur van het roverskamp staat eerst in de lijst');
  // een town hall en een hut per tent, meteen af (zoals het proefdorp, js/begin.js): dan trekt iedereen uit het kamp
  const echt = T.BEGIN_INSTELLINGEN.bouwBereik;
  T.BEGIN_INSTELLINGEN.bouwBereik = 40;
  try {
    const soorten = ['raadhuis', ...Array(T.kampTenten(D).length).fill('hut')];
    for (const soort of soorten) for (const [wat, n] of Object.entries(T.GEBOUWEN[soort].kosten || {})) T.wijzigVoorraad(D, wat, n);
    const dag = Math.floor(S.kalender.dag);
    for (const soort of soorten) bouwAf(T, D, zetBijHetVuur(T, D, soort, soort === 'hut' ? 3 : 0), dag);
  } finally {
    T.BEGIN_INSTELLINGEN.bouwBereik = echt;
  }
  dagen(T, S, 2);
  assert.equal(D.begin.kamp, 'weg', 'iedereen is uit het kamp');
  assert.deepEqual(vuren().map((v) => v.kamp), [k.nr], 'alleen het vuur van het roverskamp brandt nog');
});
