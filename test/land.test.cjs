// Het land (js/land.js; werklijst vraag 63 en 69, Marcel, 30 sep: "Ja, begin aan het land"): een kaart met provincies
// uit het zaad van het spel, waarop de schout in dagen reist. Wie reist, gaat de kaart van het dorp uit, en thuis gaat
// alles door zonder hem; wat er gebeurde, hoort hij als hij terug is.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/voorvallen.test.cjs).
function gehucht(zaad = 7) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender.dag = 10.4;
  S.kalender.snelheid = 3;
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  return S;
}

// Met de spelregel Land aan, voor één toets.
function metLand(fn) {
  try {
    T.zetOptie('land', 'aan');
    return fn();
  } finally {
    T.optiesTerug();
  }
}

// Het gehucht met zijn land.
function metZijnLand(zaad) {
  const S = gehucht(zaad);
  S.land = T.nieuwLand(S);
  return S;
}

// Laat de tijd gaan tot `dag`, zoals de spellus het land bijwerkt.
function tot(S, dag) {
  S.kalender.dag = dag;
  T.werkLandBij(S);
}

// Ligt punt p binnen de veelhoek v?
function binnen(v, p) {
  let in_ = false;
  for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
    const [xi, yi] = v[i];
    const [xj, yj] = v[j];
    if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) in_ = !in_;
  }
  return in_;
}

test('het land komt uit het zaad: negen provincies, een kasteel en een stad, en overal een weg heen', () => {
  for (const zaad of [1, 2, 3, 7, 11]) {
    const S = gehucht(zaad);
    const L = T.nieuwLand(S);
    assert.deepEqual(T.nieuwLand(gehucht(zaad)), L, 'hetzelfde zaad, hetzelfde land');
    assert.equal(L.provincies.length, T.LAND_INSTELLINGEN.provincies);
    const soorten = L.provincies.map((p) => p.soort);
    assert.equal(soorten.filter((s) => s === 'gehucht').length, 1);
    assert.equal(soorten.filter((s) => s === 'kasteel').length, 1);
    assert.equal(soorten.filter((s) => s === 'stad').length, 1);
    assert.equal(T.provincie(L, L.thuis).soort, 'gehucht');
    assert.equal(L.waar, L.thuis);
    for (const p of L.provincies) {
      assert.ok(p.vlak.length >= 3, `${p.id} heeft een vlak`);
      assert.ok(binnen(p.vlak, p), `${p.id} ligt in zijn eigen vlak`);
      assert.ok(T.provincieNaam(S, p), `${p.id} heeft een naam`);
    }
    for (const w of L.wegen) {
      assert.ok(w.dagen >= T.LAND_INSTELLINGEN.dagenMin && w.dagen <= T.LAND_INSTELLINGEN.dagenMax, `${w.van}-${w.naar}: ${w.dagen} dagen`);
    }
    // Overal een weg heen: vanaf het gehucht is elke provincie te bereiken.
    const bereikt = new Set([L.thuis]);
    for (let rond = 0; rond < L.provincies.length; rond++) {
      for (const id of [...bereikt]) for (const b of T.buurProvincies(L, id)) bereikt.add(b);
    }
    assert.equal(bereikt.size, L.provincies.length, `zaad ${zaad}: alles bereikbaar`);
  }
  assert.notDeepEqual(T.nieuwLand(gehucht(1)).provincies, T.nieuwLand(gehucht(2)).provincies, 'een ander zaad, een ander land');
});

test('het gehucht heet naar je dorp, en ligt niet in het midden', () => {
  const S = metZijnLand(3);
  S.dorp.dorpsnaam = 'Wolfsveen';
  assert.equal(T.provincieNaam(S, T.provincie(S.land, S.land.thuis)), 'Wolfsveen');
  for (const zaad of [1, 2, 3, 4, 5, 6]) {
    const L = T.nieuwLand(gehucht(zaad));
    const midden = L.provincies.reduce((m, p) => (Math.hypot(p.x - L.breed / 2, p.y - L.hoog / 2) < Math.hypot(m.x - L.breed / 2, m.y - L.hoog / 2) ? p : m));
    assert.notEqual(L.thuis, midden.id, `zaad ${zaad}`);
  }
});

test('wat je nog niet zag, is donker, en je reist alleen over wegen die je kent', () => {
  const S = metZijnLand(5);
  const L = S.land;
  assert.deepEqual([...L.gezien], [L.thuis], 'alleen je eigen gehucht');
  const buren = T.buurProvincies(L, L.thuis);
  const r = T.reisNaar(S, buren[0]);
  assert.deepEqual(r.route, [buren[0]], 'een buur: één stap, het donker in');
  assert.equal(r.dagen, T.wegTussen(L, L.thuis, buren[0]).dagen);
  // Een provincie die geen buur is: daar kom je pas als je de weg erheen kent.
  const ver = L.provincies.find((p) => p.id !== L.thuis && !buren.includes(p.id));
  assert.equal(T.reisNaar(S, ver.id), null, 'door het donker reis je niet');
  for (const p of L.provincies) L.gezien.add(p.id);
  const lang = T.reisNaar(S, ver.id);
  assert.ok(lang && lang.route.length >= 2, 'als je het land kent, wel');
  assert.equal(lang.dagen, lang.route.reduce((som, id, i) => som + T.wegTussen(L, i ? lang.route[i - 1] : L.thuis, id).dagen, 0), 'de dagen van de route');
  assert.equal(T.reisNaar(S, L.thuis), null, 'waar je bent, reis je niet heen');
});

test('op reis: de schout gaat het dorp uit, de dagen gaan snel, en hij komt aan', () => {
  metLand(() => {
    const S = metZijnLand(5);
    const L = S.land;
    const naar = T.buurProvincies(L, L.thuis)[0];
    T.openLand(S);
    assert.equal(S.modus, 'land');
    assert.equal(T.snelheidNu(S), 0, 'wie naar de kaart kijkt, zet de tijd stil');
    const r = T.beginReis(S, naar);
    assert.ok(r.kan, r.reden);
    assert.ok(!S.wereld.wezens.includes(S.schout), 'hij is niet meer in het dorp');
    assert.ok(T.opReis(S) && T.schoutIsWeg(S.dorp));
    assert.equal(T.snelheidNu(S), T.LAND_INSTELLINGEN.reisSnelheid, 'de dagen gaan snel voorbij');
    assert.equal(T.beginReis(S, L.thuis).kan, false, 'onderweg begin je geen tweede reis');
    const aankomst = L.reis.aankomst;
    tot(S, aankomst - 0.01);
    assert.ok(L.reis, 'nog onderweg');
    tot(S, aankomst);
    assert.equal(L.reis, null);
    assert.equal(L.waar, naar);
    assert.ok(L.gezien.has(naar), 'wat je zag, is niet meer donker');
    assert.equal(S.kalender.snelheid, 3, 'de snelheid van voor de reis');
    assert.equal(S.modus, 'land');
    assert.equal(T.snelheidNu(S), 0, 'daar staat de tijd stil tot je verder kiest');
    assert.ok(T.opReis(S), 'hij is in een andere provincie');
  });
});

test('een reis over meer provincies: hij ziet elke provincie waar hij doorheen komt', () => {
  metLand(() => {
    const S = metZijnLand(2);
    const L = S.land;
    const eerste = T.buurProvincies(L, L.thuis)[0];
    L.gezien.add(eerste);
    const verder = T.buurProvincies(L, eerste).find((id) => id !== L.thuis && !T.buurProvincies(L, L.thuis).includes(id));
    assert.ok(verder, 'er is een provincie achter de eerste');
    T.openLand(S);
    const r = T.beginReis(S, verder);
    assert.ok(r.kan, r.reden);
    assert.deepEqual(L.reis.route, [eerste, verder]);
    tot(S, L.reis.volgende);
    assert.equal(L.waar, eerste, 'onderweg, in de eerste');
    assert.ok(L.reis, 'en nog niet klaar');
    tot(S, L.reis.aankomst);
    assert.equal(L.waar, verder);
    assert.ok(L.gezien.has(verder));
  });
});

test('thuis: hij staat net binnen de weg, en hoort wat er gebeurde', () => {
  metLand(() => {
    const S = metZijnLand(5);
    const L = S.land;
    const naar = T.buurProvincies(L, L.thuis)[0];
    T.openLand(S);
    T.beginReis(S, naar);
    tot(S, L.reis.aankomst);
    // Terwijl hij weg is: een bericht, en het dorp verandert.
    T.bewaarVoorLater(S, 'Er komt een nieuw gezin over de weg.', '');
    T.wijzigVoorraad(S.dorp, 'graan', -5);
    T.beginReis(S, L.thuis);
    tot(S, L.reis.aankomst);
    assert.equal(L.waar, L.thuis);
    assert.ok(!T.opReis(S) && !T.schoutIsWeg(S.dorp));
    assert.ok(S.wereld.wezens.includes(S.schout), 'hij is terug in het dorp');
    assert.equal(S.modus, 'verkennen');
    const uit = T.wegInEnUit(S.wereld);
    const h = S.schout;
    assert.ok(Math.max(Math.abs(h.tx - uit.x), Math.abs(h.ty - uit.y)) === 1, 'net binnen de weg, niet erop');
    assert.ok(T.isBegaanbaar(S.wereld, h.tx, h.ty));
    assert.ok(L.terug, 'wat er gebeurde, voor het venster');
    assert.equal(L.terug.gemist.length, 1);
    assert.equal(L.gemist.length, 0);
    assert.ok(L.terug.dagen >= 2);
    const regels = T.watVeranderde(L.terug);
    assert.ok(regels.some((r) => /graan \(−5\)/.test(r)), regels.join(' / '));
    assert.equal(T.snelheidNu(S), 3, 'thuis loopt de tijd weer zoals je hem zette');
  });
});

test('de weg het dorp uit opent de kaart, en wie er net terugkwam, moet er eerst af', () => {
  metLand(() => {
    const S = metZijnLand(5);
    const L = S.land;
    const uit = T.wegInEnUit(S.wereld);
    const h = S.schout;
    const zet = (x, y) => {
      h.x = h.tx = x;
      h.y = h.ty = y;
      h.pad = [];
      h.onderweg = false;
    };
    zet(uit.x, uit.y);
    T.werkLandBij(S);
    assert.equal(S.modus, 'land', 'op de weg het dorp uit: de kaart');
    assert.ok(T.sluitLand(S));
    assert.equal(S.modus, 'verkennen');
    T.werkLandBij(S);
    assert.equal(S.modus, 'verkennen', 'hij staat er nog: eerst eraf');
    const naast = [[0, 1], [1, 0], [0, -1], [-1, 0]].map(([dx, dy]) => ({ x: uit.x + dx, y: uit.y + dy })).find((t) => T.isBegaanbaar(S.wereld, t.x, t.y));
    zet(naast.x, naast.y);
    T.werkLandBij(S);
    zet(uit.x, uit.y);
    T.werkLandBij(S);
    assert.equal(S.modus, 'land', 'weer erop: weer de kaart');
    // Onderweg naar de weg (nog een pad) gaat hij niet open.
    T.sluitLand(S);
    zet(naast.x, naast.y);
    T.werkLandBij(S);
    h.x = h.tx = uit.x;
    h.y = h.ty = uit.y;
    h.pad = [{ x: naast.x, y: naast.y }];
    T.werkLandBij(S);
    assert.equal(S.modus, 'verkennen', 'wie doorloopt, loopt door');
    assert.equal(L.reis, null);
  });
});

test('terwijl hij weg is, beslist de raadsman, roept niemand de militie, en vertraagt de heer de reis niet', () => {
  metLand(() => {
    const S = metZijnLand(5);
    const L = S.land;
    // Een raadsman, en een voorval dat nu begint.
    const boer = S.dorp.bewoners.mensen.find((p) => T.isBoer(p.wezen));
    assert.ok(T.kiesRaadsman(S.dorp, boer).kan);
    T.openLand(S);
    T.beginReis(S, T.buurProvincies(L, L.thuis)[0]);
    const v = T.VOORVALLEN.lening;
    const oud = { vervolg: v.vervolg, als: v.als };
    Object.assign(v, { vervolg: false, als: undefined });
    let mensen = null;
    for (let d = 11; d < 60 && !mensen; d++) {
      const m = T.voorvalKan(S.dorp, 'lening', d);
      if (m && m.wie !== boer) mensen = m;
    }
    Object.assign(v, oud);
    const Lv = T.beginVoorval(S.dorp, 'lening', mensen.wie, mensen.ander, Math.floor(S.kalender.dag));
    S.dorp.voorvallen.volgende = 1e9;
    S.kalender.dag = Lv.vanaf + 0.01;
    T.werkVoorvallenBij(S, S.dorp);
    assert.equal(S.dorp.voorvallen.lopend, null, 'het voorval is beslist');
    assert.equal(S.dorp.voorvallen.doorRaadsman, 1, 'door de raadsman');
    // De heer die op het plein staat, of een bezoeker die komt: de reis gaat op zijn snelheid door.
    T.naarGewoneSnelheid(S);
    assert.equal(S.kalender.snelheid, T.LAND_INSTELLINGEN.reisSnelheid);
  });
});

test('berichten en brieven wachten tot hij thuis is, zonder te veel', () => {
  const S = metZijnLand(5);
  for (let i = 0; i < T.LAND_INSTELLINGEN.gemistHoogstens + 5; i++) T.bewaarVoorLater(S, `bericht ${i}`);
  assert.equal(S.land.gemist.length, T.LAND_INSTELLINGEN.gemistHoogstens, 'de oudste gaan eruit');
  assert.equal(S.land.gemist[S.land.gemist.length - 1].tekst, `bericht ${T.LAND_INSTELLINGEN.gemistHoogstens + 4}`);
  T.briefVoorLater(S, 'schatting');
  T.briefVoorLater(S, 'schatting');
  T.briefVoorLater(S, 'heervaart');
  assert.deepEqual(S.land.brieven, ['schatting', 'heervaart'], 'elke brief één keer');
});

test('de spelregel uit: geen land, en wie weg was, is meteen thuis', () => {
  const S = gehucht(5);
  T.werkLandBij(S);
  assert.equal(S.land, undefined, 'uit: er komt geen land');
  metLand(() => T.werkLandBij(S));
  assert.ok(S.land, 'aan: het land komt vanzelf');
  metLand(() => {
    T.openLand(S);
    T.beginReis(S, T.buurProvincies(S.land, S.land.thuis)[0]);
  });
  assert.ok(T.opReis(S));
  T.werkLandBij(S); // de spelregel staat weer uit
  assert.ok(!T.opReis(S), 'meteen thuis');
  assert.ok(S.wereld.wezens.includes(S.schout));
  assert.equal(S.modus, 'verkennen');
});

test('bewaren en laden: het land, de reis en wat je miste blijven hetzelfde', () => {
  metLand(() => {
    const S = metZijnLand(5);
    T.openLand(S);
    T.beginReis(S, T.buurProvincies(S.land, S.land.thuis)[0]);
    T.bewaarVoorLater(S, 'De marskramer is er.');
    T.briefVoorLater(S, 'schatting');
    const S2 = gehucht(5);
    T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
    assert.deepEqual(S2.land.provincies, S.land.provincies);
    assert.deepEqual(S2.land.wegen, S.land.wegen);
    assert.deepEqual([...S2.land.gezien], [...S.land.gezien]);
    assert.deepEqual(S2.land.reis, S.land.reis);
    assert.deepEqual(S2.land.gemist, S.land.gemist);
    assert.deepEqual(S2.land.brieven, ['schatting']);
    assert.ok(!S2.wereld.wezens.includes(S2.schout), 'de schout is nog op reis');
    tot(S2, S2.land.reis.aankomst);
    assert.ok(S2.land.gezien.has(S2.land.waar), 'en komt gewoon aan');
  });
});
