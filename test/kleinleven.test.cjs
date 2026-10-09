// Het kleine leven (js/kleinleven.js; werklijst vraag 145, 3; Marcel, 9 okt: "Ja, dat zijn kleine details die het echt
// levend maken"). Alleen beeld; hier wat er is en waar.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });

function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 7;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}
const opUur = (dag, uur) => Math.floor(dag) + uur / 24;

test('de rook: uit een huis waar iemand thuis is, dik in de ochtend, dun onder het werk, de hele dag in de winter', () => {
  const S = gehucht();
  const D = S.dorp;
  D.kalender.dag = opUur(10, 6.5); // lentemaand, vroeg
  const ochtend = T.rookUitHuizen(D);
  assert.ok(ochtend.length > 0, 'er rookt een huis');
  const thuis = new Set(T.huizenMetIemandThuis(D).map((h) => h.g));
  assert.ok(ochtend.every((r) => thuis.has(r.g)));
  assert.ok(ochtend.some((r) => r.dik === T.KLEIN_LEVEN_INSTELLINGEN.rook.ochtend));
  // onder het werk: dun, of niemand thuis
  D.kalender.dag = opUur(10, 11);
  for (const r of T.rookUitHuizen(D)) assert.ok(r.dik <= T.KLEIN_LEVEN_INSTELLINGEN.rook.werk);
  // in de winter, midden op de dag, stookt wie thuis is volop
  const winter = [...Array(T.DAGEN_PER_JAAR).keys()].find((d) => T.datumVanDag(d).seizoen === 'winter');
  D.kalender.dag = opUur(winter, 11);
  for (const r of T.rookUitHuizen(D)) assert.ok(r.dik >= T.KLEIN_LEVEN_INSTELLINGEN.rook.winter * (r.hut ? T.KLEIN_LEVEN_INSTELLINGEN.rook.hut : 1));
});

test('met de spelregel uit rookt er niets', () => {
  const S = gehucht();
  const D = S.dorp;
  D.kalender.dag = opUur(10, 6.5);
  T.zetOptie('kleinLeven', 'uit');
  try {
    assert.equal(T.rookUitHuizen(D).length, 0);
  } finally {
    T.zetOptie('kleinLeven', 'aan');
  }
});

test('elk huis weet waar zijn rook uitkomt: de schoorsteen, of bij een hut de nok (de kapel stookt niet)', () => {
  for (const t of T.TEGELS.huizen.tiles) {
    if (!t || !t.naam || /kapel/.test(t.naam)) continue;
    const plek = t.schoorsteen || t.nok;
    assert.ok(Array.isArray(plek) && plek.length === 2, `${t.naam} heeft geen rookpunt: node gereedschap/pixelart/rookpunten.cjs`);
    // boven de voet, binnen de tekening
    assert.ok(plek[1] < 0 && -plek[1] < t.cel[3], `${t.naam}: ${plek}`);
  }
});

test('het water: een beek stroomt langs zijn lengte, en wat geen beek is, ligt stil', () => {
  const S = gehucht();
  const w = S.dorp.wereld;
  let water = 0;
  for (let y = 0; y < w.h; y++) {
    for (let x = 0; x < w.b; x++) {
      const isWater = !!(w.grond[y] && w.grond[y][x] && w.grond[y][x].naam === 'water');
      const s = T.waterOp(w, x, y);
      assert.equal(!!s, isWater, `${x},${y}`);
      if (!s) continue;
      water++;
      if (T.isBeek(w, x, y)) assert.equal(Math.abs(s.dx) + Math.abs(s.dy), 1, `de beek op ${x},${y} stroomt één kant op`);
      else assert.ok(s.stil, `${x},${y} ligt stil`);
    }
  }
  assert.ok(water > 0, 'het gehucht heeft water');
});

test('twee kinderen die vrij zijn, gaan soms samen spelen, rennen om de plek, en houden op als het om is', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  D.kalender.dag = opUur(10, 10);
  D.weer = { vandaag: 'zon', droog: 0, tekort: 0, verlies: 0 };
  const kinderen = w.wezens.filter((e) => e.bewoner && (e.bewoner.leeftijd === 'kind' || e.bewoner.leeftijd === 'kleuter') && !e.bewoner.werk && T.kanSpelen(S, D, e, 'werk'));
  assert.ok(kinderen.length >= 2, 'er zijn twee vrije kinderen');
  const [a, b] = kinderen;
  // naast elkaar op een open plek
  b.x = b.tx = a.tx + 1;
  b.y = b.ty = a.ty;
  const kans = T.KLEIN_LEVEN_INSTELLINGEN.spelen.kans;
  T.KLEIN_LEVEN_INSTELLINGEN.spelen.kans = 1;
  try {
    assert.ok(T.speel(S, w, D, a, 'werk'), 'ze beginnen');
    assert.ok(a.spel && a.spel === b.spel, 'ze delen het spel');
    assert.ok(T.speel(S, w, D, b, 'werk'));
    const pl = a.spel.plek;
    for (const e of [a, b]) if (e.padDoel) assert.ok(Math.abs(e.padDoel.x - pl.x) <= T.KLEIN_LEVEN_INSTELLINGEN.spelen.straal && Math.abs(e.padDoel.y - pl.y) <= T.KLEIN_LEVEN_INSTELLINGEN.spelen.straal);
    // in de regen niet
    D.weer.vandaag = 'regen';
    assert.equal(T.speel(S, w, D, a, 'werk'), false);
    assert.equal(a.spel, undefined);
    D.weer.vandaag = 'zon';
    // het is om
    D.kalender.dag = b.spel.tot + 0.01;
    assert.equal(T.speel(S, w, D, b, 'werk'), false);
    assert.equal(b.spel, undefined);
    assert.ok(b.speeldTot > D.kalender.dag, 'en dan even niet');
  } finally {
    T.KLEIN_LEVEN_INSTELLINGEN.spelen.kans = kans;
  }
});
