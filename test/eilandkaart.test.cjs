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
      const vast = (T.grondVanGid(gid).vast && !E.brugOp.has(y * E.maat + x)) || (v && T.opzoekTegelNaam(T.natuurTegel(d.naam)).eig.vast);
      assert.equal(T.tegel(w, x, y), vast ? 'muur' : 'vloer', `de tegel op (${x}, ${y})`);
    }
  }
  assert.equal(T.kaartVak(w).b, 100);
  assert.ok(T.heeftTegels(w) && T.heeftGrond(w));
});

test('eilandkaart: over een brug loop je, ook al is het water eronder water, en een brug is een pad', () => {
  const b = E.bruggen[0];
  const t = b.tegels.find((q) => T.grondVanGid(T.landStuk(E, q.x, q.y, 1, 1).grond[0]).vast);
  assert.ok(t, 'onder de brug is water');
  const w = T.eilandKaart(5, vak);
  T.openVak(w, { x: t.x - 2, y: t.y - 2, b: 4, h: 4 });
  assert.ok(T.isWaterGrond(T.grondOp(w, t.x, t.y).naam), 'water onder de brug');
  assert.equal(T.tegel(w, t.x, t.y), 'vloer');
  assert.ok(T.opPad(w, t.x, t.y));
  assert.deepEqual(T.brugOp(w, t.x, t.y), E.brugOp.get(t.y * E.maat + t.x));
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
  // een vak over de grens van stukken, met gebroken randen: van elk stuk alleen het deel in het vak (vraag 178)
  const S0 = Math.ceil((vak.x + 40) / 64) * 64;
  const schuin = { x: S0 - 7.5, y: vak.y + 30.25, b: 20.5, h: 70.5 };
  const tegels = [];
  for (let y = Math.ceil(schuin.y); y < schuin.y + schuin.h; y++) {
    for (let x = Math.ceil(schuin.x); x < schuin.x + schuin.b; x++) if (T.voorwerpOp(w, x, y)) tegels.push(T.voorwerpOp(w, x, y));
  }
  const gevonden = T.voorwerpenIn(w, schuin);
  assert.ok(gevonden.length > 0);
  assert.deepEqual(new Set(gevonden), new Set(tegels));
});

// Stap 5 (Marcel, 13 okt: "Al je mensen", en "Eerst meten"): waar de aanvoerder, een dorpeling of de ossenkar komt, gaat het
// land open, binnen openRond tegels, en hooguit één stuk per beeld; wie binnen is of een wolf maakt niets open.
test('eilandkaart: wie van jou bij de rand komt, maakt het stuk ernaast open, één per beeld', () => {
  const w = nieuweKaart();
  const R = T.WERELD_INSTELLINGEN.openRond;
  const D = { wereld: w };
  D.aanvoerder = Object.assign(T.maakWezen('aanvoerder', vak.x + 50, vak.y + 50), { dorp: D }); // van het dorp (T.isVanDorp)
  const S = { dorp: D };
  w.wezens.push(S.dorp.aanvoerder);
  const open = w.open.size;
  assert.equal(T.werkStukkenBij(S, D), null, 'midden in het land is alles om hem open');
  // in de hoek van wat open is: daar raakt zijn kring drie stukken die dicht zijn
  const rand = T.loopVak(w);
  Object.assign(S.dorp.aanvoerder, { x: rand.x + rand.b - 2, y: rand.y + rand.h - 2 });
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
  Object.assign(S.dorp.aanvoerder, { ...verder, binnen: true });
  assert.equal(T.werkStukkenBij(S, D), null, 'wie binnen is, maakt niets open');
  const wolf = Object.assign(T.maakWezen('aanvoerder', verder.x, verder.y), { beest: 'wolf' });
  w.wezens.push(wolf);
  assert.equal(T.werkStukkenBij(S, D), null, 'een wolf maakt niets open');
  const kar = Object.assign(T.maakWezen('aanvoerder', verder.x, verder.y), { kar: true, dorp: D });
  w.wezens.push(kar);
  assert.ok(T.werkStukkenBij(S, D) != null, 'de ossenkar maakt open');
  assert.ok(T.inVak(T.loopVak(w), verder.x - R, verder.y), 'en het lopen beslaat het nieuwe stuk');
});

test('eilandkaart: op een kaart uit Tiled gaat er niets open', () => {
  const S = { dorp: { aanvoerder: { x: 1, y: 1 } } };
  assert.equal(T.werkStukkenBij(S, { wereld: { tegels: [[1]], wezens: [S.dorp.aanvoerder] } }), null);
});

// "Alles per stuk" (Marcel, 13 okt): gaat er land open, dan nemen het raster van wat vaststaat en de eilanden van A* alleen
// het nieuwe stuk erbij. Dat moet hetzelfde geven als alles opnieuw, op een kaart zonder iets onthouden.
test('eilandkaart: een nieuw stuk erbij geeft hetzelfde raster en dezelfde eilanden als alles opnieuw', () => {
  const w = nieuweKaart();
  const D = { wereld: w };
  D.aanvoerder = Object.assign(T.maakWezen('aanvoerder', vak.x + 50, vak.y + 50), { dorp: D });
  const S = { dorp: D };
  w.wezens.push(S.dorp.aanvoerder);
  T.vastRaster(w);
  T.eilandOp(w, vak.x + 50, vak.y + 50);
  const versie = T.kaartVersie(w);
  const rand = T.loopVak(w);
  Object.assign(S.dorp.aanvoerder, { x: rand.x + rand.b - 2, y: rand.y + rand.h - 2 });
  for (let i = 0; i < 3; i++) T.werkStukkenBij(S, D);
  assert.equal(T.kaartVersie(w), versie, 'land erbij is geen verandering van de kaart');
  const nieuw = geladen(w);
  const lv = T.loopVak(w);
  assert.deepEqual(T.loopVak(nieuw), lv);
  assert.deepEqual([...T.vastRaster(w)], [...T.vastRaster(nieuw)], 'het raster');
  zelfdeEilanden(w, nieuw, lv, 3);
  // een ding erbij werkt alleen zijn tegels bij, en geeft hetzelfde als alles opnieuw; weg ook (dan gaat de tegel op in
  // de eilanden ernaast)
  const plek = { x: rand.x + rand.b + 5, y: rand.y + rand.h - 3 };
  const eik = T.zetVoorwerp(w, T.maakVoorwerp(T.opzoekTegelNaam(T.natuurTegel('eik')), plek.x, plek.y));
  assert.deepEqual([...T.vastRaster(w)], [...T.vastRaster(geladen(w))], 'het raster na een eik');
  zelfdeEilanden(w, geladen(w), { x: plek.x - 20, y: plek.y - 20, b: 40, h: 40 }, 1);
  T.haalVoorwerpWeg(w, eik);
  assert.deepEqual([...T.vastRaster(w)], [...T.vastRaster(geladen(w))], 'het raster zonder de eik');
  zelfdeEilanden(w, geladen(w), { x: plek.x - 20, y: plek.y - 20, b: 40, h: 40 }, 1);
  // een boom van het eiland om, die twee stukken land scheidde: de eilanden worden één, zoals alles opnieuw
  const boom = T.voorwerpenIn(w, T.kaartVak(w)).find((v) => v.natuur && T.VOORWERPEN[v.soort].blokkeert);
  T.haalVoorwerpWeg(w, boom);
  zelfdeEilanden(w, geladen(w), { x: boom.x - 20, y: boom.y - 20, b: 40, h: 40 }, 1);
});

// Twee tegels liggen in de ene kaart op hetzelfde eiland als in de andere (om de `stap` tegels in `vak`).
function zelfdeEilanden(w, nieuw, vak, stap) {
  const paar = new Map();
  for (let y = vak.y; y < vak.y + vak.h; y += stap) {
    for (let x = vak.x; x < vak.x + vak.b; x += stap) {
      const a = T.eilandOp(w, x, y);
      const b = T.eilandOp(nieuw, x, y);
      assert.equal(a < 0, b < 0, `(${x}, ${y})`);
      if (a < 0) continue;
      if (!paar.has(a)) paar.set(a, b);
      assert.equal(paar.get(a), b, `(${x}, ${y}) op hetzelfde eiland`);
    }
  }
  assert.equal(new Set(paar.values()).size, paar.size, 'en geen twee eilanden die er één zijn');
}

// Vooruit (Marcel, 13 okt: "het stuk wordt vooruit gemaakt voordat iemand er is"): binnen openRond + vooruit tegels maakt
// het spel het land alvast, een deel per beeld; gaat het open, dan is het hetzelfde land als in één keer gemaakt.
test('eilandkaart: een stuk dat vooruit gemaakt is, in delen, is hetzelfde als in één keer', () => {
  const w = nieuweKaart();
  const I = T.WERELD_INSTELLINGEN;
  const rand = T.loopVak(w);
  const D = { wereld: w };
  D.aanvoerder = Object.assign(T.maakWezen('aanvoerder', rand.x + rand.b - I.openRond - 4, vak.y + 50), { dorp: D });
  const S = { dorp: D };
  w.wezens.push(S.dorp.aanvoerder);
  const delen = (T.STUK / I.vooruitDeel) ** 2;
  for (let i = 0; i <= delen; i++) assert.equal(T.werkStukkenBij(S, D), null, 'binnen openRond is alles open');
  const n = T.stukVan(rand.x + rand.b, vak.y + 50);
  assert.ok(!w.open.has(n), 'het stuk is nog niet open');
  assert.equal(T.tegel(w, rand.x + rand.b, vak.y + 50), 'buiten');
  S.dorp.aanvoerder.x = rand.x + rand.b - 2;
  assert.equal(T.werkStukkenBij(S, D), n);
  const land = T.landStuk;
  let heel = 0;
  T.landStuk = (...a) => {
    if (a[3] === T.STUK) heel++;
    return land(...a);
  };
  try {
    T.tegel(w, rand.x + rand.b, vak.y + 50);
  } finally {
    T.landStuk = land;
  }
  assert.equal(heel, 0, 'het land was er al: bij het openen wordt het niet opnieuw gemaakt');
  const nieuw = geladen(w);
  for (let y = vak.y + 20; y < vak.y + 84; y++) {
    for (let x = rand.x + rand.b; x < rand.x + rand.b + T.STUK; x++) {
      assert.equal(T.tegel(w, x, y), T.tegel(nieuw, x, y), `(${x}, ${y})`);
      assert.equal(T.grondOp(w, x, y), T.grondOp(nieuw, x, y), `de grond op (${x}, ${y})`);
      const [a, b] = [T.voorwerpOp(w, x, y), T.voorwerpOp(nieuw, x, y)];
      assert.equal(a && a.soort, b && b.soort, `wat er staat op (${x}, ${y})`);
    }
  }
});
