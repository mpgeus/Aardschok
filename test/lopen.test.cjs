// Lopen tussen anderen (js/lopen.js; werklijst vraag 119, D; Marcel, 4 okt: "Je kunt nu eenmaal niet over iemand heen"):
// een weg gaat alleen om wat vaststaat, en wie onderweg een ander treft, lost het daar op: langs elkaar schuiven, even
// wachten, de ander opzij laten gaan, of eromheen. Deze toetsen lopen op kleine kaarten van tekens, zonder deuren.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Een kaart uit tekens: # is een muur, de rest vloer.
function kaart(plan) {
  const tegels = plan.map((r) => [...r].map((c) => (c === '#' ? 'muur' : 'vloer')));
  return { b: plan[0].length, h: plan.length, tegels, deuren: new Map(), kamers: [], voorwerpen: [], wezens: [], overgangen: [], buiten: true };
}
function mens(w, x, y, extra) {
  const e = Object.assign(
    { soort: 'dorpeling', naam: 'dorpeling', kant: 'neutraal', x, y, tx: x, ty: y, pad: [], onderweg: false, dood: false, snelheid: 1.3, dwaalt: false },
    extra,
  );
  w.wezens.push(e);
  return e;
}
function stuur(w, e, doel) {
  const pad = T.zoekRoute(w, { x: e.tx, y: e.ty }, doel, { tot: doel.tot, naast: doel.naast });
  assert.ok(pad && pad.length, 'geen weg');
  T.geefRoute(e, pad, doel);
}
const isEr = (e, doel) => !e.onderweg && !e.pad.length && T.afstand({ x: e.tx, y: e.ty }, doel) <= (doel.tot || 0);
// Laat de wereld zoveel seconden lopen. `daarna` doet wat het dwalen doet: wie stilstaat en er niet is, zoekt opnieuw.
function loop(S, w, seconden, daarna) {
  const dt = 0.05;
  for (let t = 0; t < seconden; t += dt) {
    T.beweegWezens(S, w, dt, dt);
    if (daarna) daarna();
    // nooit twee op één tegel
    const bezet = new Set();
    for (const e of w.wezens) {
      const k = e.tx + ',' + e.ty;
      assert.ok(!bezet.has(k), `twee op ${k}`);
      bezet.add(k);
    }
  }
}

const GANG = [
  '############',
  '#..........#',
  '############',
];
const BREED = [
  '############',
  '#..........#',
  '#..........#',
  '############',
];

test('een weg gaat om wat vaststaat, niet om wie er staat, en de kaart onthoudt hem tot hij verandert', () => {
  const w = kaart(BREED);
  mens(w, 5, 1); // midden op de weg
  const echt = T.zoekPad;
  let gezocht = 0;
  T.zoekPad = (...a) => {
    gezocht++;
    return echt(...a);
  };
  try {
    const pad = T.zoekRoute(w, { x: 1, y: 1 }, { x: 10, y: 1 }, {});
    assert.deepEqual(pad.map((t) => t.x + ',' + t.y), ['2,1', '3,1', '4,1', '5,1', '6,1', '7,1', '8,1', '9,1', '10,1'], 'recht door, ook over zijn tegel');
    const nog = T.zoekRoute(w, { x: 1, y: 1 }, { x: 10, y: 1 }, {});
    assert.deepEqual(nog, pad);
    assert.notEqual(nog, pad, 'een eigen lijst: wie loopt, haalt er stappen af');
    assert.equal(gezocht, 1, 'de tweede keer weet de kaart het nog');
    // een muur erbij: dan zoekt hij opnieuw
    w.tegels[1][5] = 'muur';
    T.kaartVeranderd(w);
    const om = T.zoekRoute(w, { x: 1, y: 1 }, { x: 10, y: 1 }, {});
    assert.equal(gezocht, 2);
    assert.ok(om.some((t) => t.y === 2), 'om de muur heen');
  } finally {
    T.zoekPad = echt;
  }
});

test('twee die in een gang van één breed recht op elkaar af lopen, schuiven langs elkaar', () => {
  const w = kaart(GANG);
  const S = { wereld: w };
  const a = mens(w, 1, 1);
  const b = mens(w, 10, 1);
  stuur(w, a, { x: 10, y: 1 });
  stuur(w, b, { x: 1, y: 1 });
  loop(S, w, 20);
  assert.ok(isEr(a, { x: 10, y: 1 }) && isEr(b, { x: 1, y: 1 }), `a op ${a.tx},${a.ty}, b op ${b.tx},${b.ty}`);
});

test('wie maar wat staat, gaat een stap opzij; wie bezig is, daar loopt hij omheen', () => {
  for (const bezig of [false, true]) {
    const w = kaart(BREED);
    const S = { wereld: w, spreektMet: null };
    const a = mens(w, 1, 1);
    const b = mens(w, 6, 1);
    if (bezig) S.spreektMet = b; // in gesprek met de schout: die gaat niet opzij
    stuur(w, a, { x: 10, y: 1 });
    loop(S, w, 20);
    assert.ok(isEr(a, { x: 10, y: 1 }), `${bezig ? 'bezig' : 'staat'}: a op ${a.tx},${a.ty}`);
    if (bezig) assert.deepEqual([b.tx, b.ty], [6, 1], 'wie bezig is, blijft staan');
    else assert.notDeepEqual([b.tx, b.ty], [6, 1], 'wie maar wat stond, ging opzij');
  }
});

test('kan hij er niet langs, dan wacht hij tot zijn geduld op is, en geeft het dan op', () => {
  const w = kaart(GANG);
  const S = { wereld: w, spreektMet: null };
  const a = mens(w, 1, 1);
  const b = mens(w, 6, 1);
  S.spreektMet = b;
  stuur(w, a, { x: 10, y: 1 });
  loop(S, w, 4);
  assert.ok(a.pad.length, 'eerst wacht hij');
  assert.equal(a.tx, 5, 'voor de ander');
  loop(S, w, T.LOPEN_INSTELLINGEN.geduld + 1);
  assert.equal(a.pad.length, 0, 'dan geeft hij het op');
  assert.equal(a.padDoel, null);
  // gaat de ander weg, dan kan hij weer
  S.spreektMet = null;
  b.tx = b.x = 10;
  stuur(w, a, { x: 9, y: 1 });
  loop(S, w, 10);
  assert.ok(isEr(a, { x: 9, y: 1 }));
});

test('is hij dichtbij genoeg en staat er op zijn laatste tegel iemand, dan is hij er', () => {
  const w = kaart(BREED);
  const S = { wereld: w, spreektMet: null };
  const a = mens(w, 1, 1);
  const b = mens(w, 8, 1);
  S.spreektMet = b;
  const doel = { x: 9, y: 1, tot: 1 };
  stuur(w, a, doel);
  assert.deepEqual(a.pad[a.pad.length - 1], { x: 8, y: 1 }, 'de weg eindigt op de tegel van b');
  loop(S, w, 10);
  assert.ok(!a.pad.length);
  assert.ok(T.afstand({ x: a.tx, y: a.ty }, doel) <= 2, 'naast b, vlak bij zijn doel');
});

test('twintig mensen door een doorgang van één breed, van beide kanten: iedereen komt aan', () => {
  const w = kaart([
    '#####################',
    '#.........#.........#',
    '#.........#.........#',
    '#.........#.........#',
    '#...................#',
    '#.........#.........#',
    '#.........#.........#',
    '#.........#.........#',
    '#####################',
  ]);
  const S = { wereld: w, spreektMet: null };
  const wie = [];
  for (let i = 0; i < 10; i++) {
    const y = 1 + (i % 7);
    const l = mens(w, 2 + Math.floor(i / 7), y);
    const r = mens(w, 18 - Math.floor(i / 7), y);
    wie.push([l, { x: 16 - Math.floor(i / 7), y }], [r, { x: 4 + Math.floor(i / 7), y }]);
  }
  for (const [e, doel] of wie) stuur(w, e, doel);
  // zoals het dwalen: wie het opgaf, zoekt het opnieuw
  const opnieuw = () => {
    for (const [e, doel] of wie) if (!e.pad.length && !e.onderweg && !isEr(e, doel)) stuur(w, e, doel);
  };
  loop(S, w, 120, opnieuw);
  const niet = wie.filter(([e, doel]) => !isEr(e, doel)).map(([e, doel]) => `${e.tx},${e.ty} wil naar ${doel.x},${doel.y}`);
  assert.deepEqual(niet, []);
});

test('de schout loopt door een groepje heen: wie maar wat staat, gaat opzij', () => {
  const w = kaart(BREED);
  const schout = mens(w, 1, 1, { soort: 'schout', kant: 'speler', snelheid: 2 });
  const S = { wereld: w, schout, spreektMet: null };
  const groep = [mens(w, 4, 1), mens(w, 5, 1), mens(w, 5, 2), mens(w, 7, 1)];
  stuur(w, schout, { x: 10, y: 1 });
  loop(S, w, 15);
  assert.ok(isEr(schout, { x: 10, y: 1 }), `de schout op ${schout.tx},${schout.ty}`);
  assert.ok(groep.some((e) => e.tx !== 4 || e.ty !== 1));
});

test('in een gevecht ontwijkt niemand: wie zijn tegel bezet vindt, stopt, zoals vroeger', () => {
  const w = kaart(GANG);
  const S = { wereld: w, spreektMet: null, gevecht: {} };
  const a = mens(w, 1, 1);
  mens(w, 4, 1);
  stuur(w, a, { x: 10, y: 1 });
  loop(S, w, 5);
  assert.deepEqual([a.tx, a.ty, a.pad.length], [3, 1, 0]);
});

test('een stap van het dwalen heeft geen doel: staat er iemand, dan blijft hij staan', () => {
  const w = kaart(GANG);
  const S = { wereld: w, spreektMet: null };
  const a = mens(w, 1, 1);
  mens(w, 2, 1);
  a.pad = [{ x: 2, y: 1 }];
  a.padDoel = null;
  loop(S, w, 1);
  assert.deepEqual([a.tx, a.ty, a.pad.length], [1, 1, 0]);
});

// ── Naar hetzelfde doel: een veld (vraag 119, A) ──

const DOOLHOF = [
  '####################',
  '#......#...........#',
  '#.####.#.#######.#.#',
  '#.#....#.#.....#.#.#',
  '#.#.####.#.###.#.#.#',
  '#.#......#...#...#.#',
  '#.########.#.#####.#',
  '#..........#.......#',
  '####################',
];
// Is dit een weg die je kunt lopen: elke stap naar een buur, begaanbaar, niet schuin om een hoek, en eindigt hij binnen
// `tot` van het doel?
function klopt(w, van, pad, doel, tot) {
  let p = van;
  for (const t of pad) {
    const dx = t.x - p.x;
    const dy = t.y - p.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== 1 || !T.isBegaanbaar(w, t.x, t.y)) return false;
    if (dx && dy && (T.isVast(w, p.x + dx, p.y) || T.isVast(w, p.x, p.y + dy))) return false;
    p = t;
  }
  return T.afstand(p, doel) <= tot;
}

test('een veld geeft van elke tegel een weg die even kort is als die van A*', () => {
  const w = kaart(DOOLHOF);
  for (const tot of [0, 1]) {
    const doel = { x: 13, y: 3 };
    for (let y = 1; y < w.h - 1; y++) {
      for (let x = 1; x < w.b - 1; x++) {
        if (!T.isBegaanbaar(w, x, y) || T.afstand({ x, y }, doel) <= tot) continue;
        const veld = T.zoekRoute(w, { x, y }, doel, { tot, veld: true });
        const ster = T.zoekRoute(w, { x, y }, doel, { tot });
        assert.ok(veld && klopt(w, { x, y }, veld, doel, tot), `${x},${y}: geen goede weg uit het veld`);
        assert.equal(veld.length, ster.length, `${x},${y}: even lang als A*`);
      }
    }
  }
});

test('een veld geeft dezelfde weg, hoe ver het ook al gegroeid was (een veld is alleen uit de kaart)', () => {
  const doel = { x: 13, y: 3 };
  const van = { x: 8, y: 1 };
  const vers = T.zoekRoute(kaart(DOOLHOF), van, doel, { veld: true });
  const w = kaart(DOOLHOF);
  T.zoekRoute(w, { x: 1, y: 7 }, doel, { veld: true }); // laat het veld eerst ver groeien
  assert.deepEqual(T.zoekRoute(w, van, doel, { veld: true }), vers);
});

test('een veld weet ook dat er geen weg is, en vergeet zichzelf als de kaart verandert', () => {
  const w = kaart(DOOLHOF);
  const doel = { x: 13, y: 3 };
  assert.ok(T.zoekRoute(w, { x: 1, y: 1 }, doel, { veld: true }));
  // dicht de twee ingangen van het gangetje waar het doel in ligt (10,4 en 14,4)
  w.tegels[4][10] = 'muur';
  w.tegels[4][14] = 'muur';
  T.kaartVeranderd(w);
  assert.equal(T.zoekRoute(w, { x: 1, y: 1 }, doel, { veld: true }), null);
});
