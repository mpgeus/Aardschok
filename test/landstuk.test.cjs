// Het land van een stuk van het eiland (T.landStuk in js/maker.js; B2b, ontwerp/kaarten.md, "Het hele eiland"; Marcel,
// 13 okt: "Het eiland, overal"): de grond, de bomen, de rotsen en het groen komen alleen uit het nummer en de plek. Een
// stuk is dus hetzelfde in welke volgorde je het maakt, en twee stukken passen aan hun naad: waar ze elkaar overlappen,
// zeggen ze precies hetzelfde.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Wat een stuk over tegel (x, y) en hoekpunt (x, y) zegt.
const tegelVan = (s, x, y) => s.grond[(y - s.y0) * s.b + (x - s.x0)];
const hoekVan = (s, x, y) => s.hoek[(y - s.y0) * (s.b + 1) + (x - s.x0)];
const dingVan = (s) => {
  const op = new Map();
  for (const d of s.dingen) op.set(d.x + ',' + d.y, d.naam);
  return (x, y) => op.get(x + ',' + y) || null;
};

// Op een paar plekken van het eiland: jouw dorp, de stad aan de monding (water, strand, wegen) en het kasteel.
const plekken = (E) => ['dorp', 'stad', 'kasteel'].map((soort) => E.plekken.find((p) => p.soort === soort && (soort !== 'dorp' || p.jij)));

// Eén groot stuk tegen zestien kleine over hetzelfde land: dan liggen er overal naden, door de weg, het water en het bos.
test('landStuk: zestien kleine stukken zeggen precies wat één groot stuk zegt', () => {
  const E = T.eilandVan(5);
  for (const p of plekken(E)) {
    const x = Math.round(p.x) - 48;
    const y = Math.round(p.y) - 48;
    const groot = T.landStuk(E, x, y, 96, 96);
    const dingGroot = dingVan(groot);
    for (let sy = 0; sy < 4; sy++) {
      for (let sx = 0; sx < 4; sx++) {
        const s = T.landStuk(E, x + sx * 24, y + sy * 24, 24, 24);
        const ding = dingVan(s);
        for (let ty = s.y0; ty < s.y0 + 24; ty++) {
          for (let tx = s.x0; tx < s.x0 + 24; tx++) {
            assert.equal(tegelVan(s, tx, ty), tegelVan(groot, tx, ty), `${p.soort}: de grond op (${tx}, ${ty})`);
            assert.equal(ding(tx, ty), dingGroot(tx, ty), `${p.soort}: wat er staat op (${tx}, ${ty})`);
          }
        }
        for (let vy = s.y0; vy <= s.y0 + 24; vy++) for (let vx = s.x0; vx <= s.x0 + 24; vx++) assert.equal(hoekVan(s, vx, vy), hoekVan(groot, vx, vy), `${p.soort}: hoekpunt (${vx}, ${vy})`);
      }
    }
  }
});

test('landStuk: hetzelfde stuk is twee keer hetzelfde, en een ander eiland geeft ander land', () => {
  const E = T.eilandVan(5);
  const p = plekken(E)[0];
  const a = T.landStuk(E, Math.round(p.x), Math.round(p.y), 32, 32);
  const b = T.landStuk(E, Math.round(p.x), Math.round(p.y), 32, 32);
  assert.deepEqual(b, a);
  const F = T.eilandVan(62707);
  const q = plekken(F)[0];
  const c = T.landStuk(F, Math.round(q.x), Math.round(q.y), 32, 32);
  assert.notDeepEqual(c.dingen, a.dingen);
});

test('landStuk: bomen in het bos, groen in de wei, en niets wat vaststaat in het water', () => {
  const E = T.eilandVan(5);
  const tel = {};
  for (const p of plekken(E)) {
    const s = T.landStuk(E, Math.round(p.x) - 32, Math.round(p.y) - 32, 64, 64);
    for (const d of s.dingen) {
      tel[d.naam] = (tel[d.naam] || 0) + 1;
      const hoeken = [hoekVan(s, d.x, d.y), hoekVan(s, d.x + 1, d.y), hoekVan(s, d.x + 1, d.y + 1), hoekVan(s, d.x, d.y + 1)];
      if (hoeken.some((l) => l === 'w' || l === 'e')) assert.ok(['waterlelie'].includes(d.naam), `${d.naam} in het water op (${d.x}, ${d.y})`);
    }
  }
  const bomen = Object.keys(tel).filter((n) => T.BOMEN[n] && !T.BOMEN[n].struik);
  assert.ok(bomen.reduce((n, b) => n + tel[b], 0) > 300, `bomen: ${JSON.stringify(tel)}`);
  for (const naam of ['varen', 'grasPol', 'struik']) assert.ok(tel[naam] > 0, `${naam}: ${JSON.stringify(tel)}`);
});

// De wegen van het eiland gaan over een rivier of een meer met een recht bruggetje (js/eiland.js, legBruggen; Marcel,
// 13 okt: "Die van het eiland"), en een stuk legt het over het water.
test('landStuk: een bruggetje van het eiland ligt recht over het water, van droog naar droog', () => {
  const E = T.eilandVan(5);
  assert.ok(E.bruggen.length > 0, 'op eiland 5 kruisen de wegen het water');
  for (const b of E.bruggen) {
    assert.ok(b.tegels.length <= T.EILAND_INSTELLINGEN.wegen.brugLang, `een bruggetje van ${b.tegels.length}`);
    const op = b.tegels.slice().sort((p, q) => p.x + p.y - (q.x + q.y));
    const [dx, dy] = b.as === 'x' ? [1, 0] : [0, 1];
    op.forEach((t, i) => assert.ok(i === 0 || (t.x === op[i - 1].x + dx && t.y === op[i - 1].y + dy), `recht langs ${b.as}`));
    const s = T.landStuk(E, op[0].x - 8, op[0].y - 8, 24, 24);
    const nat = (x, y) => [hoekVan(s, x, y), hoekVan(s, x + 1, y), hoekVan(s, x + 1, y + 1), hoekVan(s, x, y + 1)].some((l) => l === 'w' || l === 'e');
    for (const t of op) {
      assert.match(T.TEGELS.rand.tiles[tegelVan(s, t.x, t.y) - 1].groep, new RegExp(`^brug ${b.as} `), `de grondtegel op (${t.x}, ${t.y})`);
      assert.ok(nat(t.x, t.y), `onder het bruggetje is water op (${t.x}, ${t.y})`);
      assert.ok(!s.dingen.some((d) => d.x === t.x && d.y === t.y), `er staat niets op het bruggetje op (${t.x}, ${t.y})`);
    }
    assert.ok(!nat(op[0].x - dx, op[0].y - dy) && !nat(op[op.length - 1].x + dx, op[op.length - 1].y + dy), 'aan beide kanten droog');
  }
});
