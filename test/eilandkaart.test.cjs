// De kaart van het eiland (js/wereld.js, B2b; ontwerp/kaarten.md, "Het hele eiland"): het hele eiland in stukken van
// T.STUK bij T.STUK tegels, gemaakt uit het nummer (T.landStuk) met wat er anders werd erover. Bewaard wordt alleen wat
// er anders werd en welke stukken open zijn; een geladen spel maakt de stukken opnieuw, en dan is alles hetzelfde.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const E = T.eilandVan(5);
const jij = E.plekken.find((p) => p.jij);
const vak = { x: Math.round(jij.x) - 50, y: Math.round(jij.y) - 50, b: 100, h: 100 };
const nieuweKaart = () => {
  const w = T.eilandKaart(5, vak);
  T.openVak(w, vak);
  return w;
};
// Een kaart zoals een geladen spel hem krijgt: alleen wat in S staat, in een nieuw ding.
const geladen = (w) => ({ ...w, open: new Set(w.open), tegelsAnders: new Map(w.tegelsAnders), grondAnders: new Map(w.grondAnders), gerooid: new Set(w.gerooid), voorwerpen: w.voorwerpen.slice() });

test('eilandkaart: de tegels, de grond en wat er groeit komen uit het stuk van het eiland', () => {
  const w = nieuweKaart();
  const L = T.landStuk(E, vak.x, vak.y, 32, 32);
  for (let y = vak.y; y < vak.y + 32; y++) {
    for (let x = vak.x; x < vak.x + 32; x++) {
      const gid = L.grond[(y - vak.y) * 32 + (x - vak.x)];
      assert.equal(T.grondOp(w, x, y), T.grondVanGid(gid), `de grond op (${x}, ${y})`);
      const d = L.dingen.find((q) => q.x === x && q.y === y);
      const v = T.voorwerpOp(w, x, y);
      assert.equal(v ? v.soort : null, d ? T.opzoekTegelNaam(T.natuurTegel(d.naam)).eig.naam : null, `wat er staat op (${x}, ${y})`);
      const vast = T.grondVanGid(gid).vast || (v && T.opzoekTegelNaam(T.natuurTegel(d.naam)).eig.vast);
      assert.equal(T.tegel(w, x, y), vast ? 'muur' : 'vloer', `de tegel op (${x}, ${y})`);
    }
  }
  assert.equal(T.kaartVak(w).b, 100);
  assert.ok(T.heeftTegels(w) && T.heeftGrond(w));
});

test('eilandkaart: een stuk dat niet open is, is buiten', () => {
  const w = nieuweKaart();
  const ver = { x: vak.x + 400, y: vak.y };
  assert.equal(T.tegel(w, ver.x, ver.y), 'buiten');
  assert.equal(T.grondOp(w, ver.x, ver.y), null);
  assert.equal(T.voorwerpOp(w, ver.x, ver.y), null);
  assert.ok(!T.isBegaanbaar(w, ver.x, ver.y));
  assert.equal(T.tegel(w, -1, 5), 'buiten');
  T.openVak(w, { x: ver.x, y: ver.y, b: 1, h: 1 });
  assert.notEqual(T.tegel(w, ver.x, ver.y), 'buiten');
});

test('eilandkaart: wat er anders werd, blijft na het laden, en de rest komt terug uit het nummer', () => {
  const w = nieuweKaart();
  const boom = T.voorwerpenIn(w, vak).find((v) => v.natuur && T.isBosBoom(v.soort));
  assert.ok(boom, 'er staat een boom van het eiland');
  assert.equal(T.tegel(w, boom.x, boom.y), 'muur');
  T.haalVoorwerpWeg(w, boom);
  T.zetTegel(w, boom.x, boom.y, 'vloer');
  assert.equal(T.voorwerpOp(w, boom.x, boom.y), null);
  const muur = { x: boom.x + 1, y: boom.y };
  T.zetTegel(w, muur.x, muur.y, 'muur');
  const gezet = { soort: 'lantaarn', x: boom.x, y: boom.y + 1 };
  T.zetVoorwerp(w, gezet);

  const n = geladen(w);
  assert.equal(T.voorwerpOp(n, boom.x, boom.y), null, 'de boom is weg');
  assert.equal(T.tegel(n, boom.x, boom.y), 'vloer');
  assert.equal(T.tegel(n, muur.x, muur.y), 'muur');
  assert.equal(T.voorwerpOp(n, gezet.x, gezet.y), gezet);
  for (let y = vak.y; y < vak.y + vak.h; y += 3) {
    for (let x = vak.x; x < vak.x + vak.b; x += 3) {
      assert.equal(T.tegel(n, x, y), T.tegel(w, x, y), `de tegel op (${x}, ${y})`);
      assert.equal(T.grondOp(n, x, y), T.grondOp(w, x, y), `de grond op (${x}, ${y})`);
      const a = T.voorwerpOp(w, x, y);
      const b = T.voorwerpOp(n, x, y);
      assert.equal(b && b.soort, a && a.soort, `wat er staat op (${x}, ${y})`);
    }
  }
  // en in het bewaarde spel staat het land zelf niet: alleen wat er anders werd
  assert.equal(n.gerooid.size, 1);
  assert.equal(n.tegelsAnders.size, 2);
});

test('eilandkaart: T.voorwerpenIn geeft wat er gezet is en wat er groeit, alleen in het vak', () => {
  const w = nieuweKaart();
  const klein = { x: vak.x + 10, y: vak.y + 10, b: 20, h: 20 };
  const lijst = T.voorwerpenIn(w, klein);
  assert.ok(lijst.length > 0);
  for (const v of lijst) assert.ok(v.x >= klein.x && v.y >= klein.y && v.x < klein.x + klein.b && v.y < klein.y + klein.h);
  let geteld = 0;
  for (let y = klein.y; y < klein.y + klein.h; y++) for (let x = klein.x; x < klein.x + klein.b; x++) if (T.voorwerpOp(w, x, y)) geteld++;
  assert.equal(lijst.length, geteld);
});

// Stap 5 (Marcel, 13 okt: "Al je mensen", en "Eerst meten"): waar de schout, een dorpeling of de ossenkar komt, gaat het
// land open, binnen openRond tegels, en hooguit één stuk per beeld; wie binnen is of een wolf maakt niets open.
test('eilandkaart: wie van jou bij de rand komt, maakt het stuk ernaast open, één per beeld', () => {
  const w = nieuweKaart();
  const R = T.WERELD_INSTELLINGEN.openRond;
  const S = { schout: T.maakWezen('schout', vak.x + 50, vak.y + 50) };
  const D = { wereld: w };
  w.wezens.push(S.schout);
  const open = w.open.size;
  assert.equal(T.werkStukkenBij(S, D), null, 'midden in het land is alles om hem open');
  // in de hoek van wat open is: daar raakt zijn kring drie stukken die dicht zijn
  const rand = T.loopVak(w);
  Object.assign(S.schout, { x: rand.x + rand.b - 2, y: rand.y + rand.h - 2 });
  const buiten = { x: rand.x + rand.b + 1, y: rand.y + rand.h - 2 };
  assert.equal(T.tegel(w, buiten.x, buiten.y), 'buiten');
  for (let i = 1; i <= 3; i++) {
    assert.ok(T.werkStukkenBij(S, D) != null, `stuk ${i} ging open`);
    assert.equal(w.open.size, open + i, 'één per beeld');
  }
  assert.equal(T.werkStukkenBij(S, D), null, 'en dan niets meer');
  assert.notEqual(T.tegel(w, buiten.x, buiten.y), 'buiten', 'daar is nu land');
  // wie binnen is, en een wolf: niets; de ossenkar wel
  const verder = { x: rand.x - R + 1, y: rand.y + 10 };
  Object.assign(S.schout, { ...verder, binnen: true });
  assert.equal(T.werkStukkenBij(S, D), null, 'wie binnen is, maakt niets open');
  const wolf = Object.assign(T.maakWezen('schout', verder.x, verder.y), { beest: 'wolf' });
  w.wezens.push(wolf);
  assert.equal(T.werkStukkenBij(S, D), null, 'een wolf maakt niets open');
  const kar = Object.assign(T.maakWezen('schout', verder.x, verder.y), { kar: true });
  w.wezens.push(kar);
  assert.ok(T.werkStukkenBij(S, D) != null, 'de ossenkar maakt open');
  assert.ok(T.inVak(T.loopVak(w), verder.x - R, verder.y), 'en het lopen beslaat het nieuwe stuk');
});

test('eilandkaart: op een kaart uit Tiled gaat er niets open', () => {
  const S = { schout: { x: 1, y: 1 } };
  assert.equal(T.werkStukkenBij(S, { wereld: { tegels: [[1]], wezens: [S.schout] } }), null);
});
