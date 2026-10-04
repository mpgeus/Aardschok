// Een praatje (js/praatje.js; werklijst vraag 120; Marcel, 4 okt: "120 a b c ja"): wie vrij is en een bekende uit een
// ander huis ziet, blijft staan; ze draaien naar elkaar toe, wie langskomt schuift aan, tot vier; na een kwartier tot een
// uur gaan ze verder. 's Avonds gaat een op de drie naar het plein. De regels van het spel veranderen er niet door.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, met een vast zaad, op dag 40 (in de lente) om `uur`.
function gehucht(uur = 20) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
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
  S.kalender.dag = 40 + uur / 24;
  S.dorp.gebouwenDag = 40;
  return S;
}

// Met een vaste worp: 0 laat elke kans slagen, 0,99 geen.
function metWorp(worp, f) {
  const toeval = Math.random;
  Math.random = () => worp;
  try {
    return f();
  } finally {
    Math.random = toeval;
  }
}

const tegel = (e) => ({ x: e.tx, y: e.ty });
const deelNu = (S) => T.dagdeelVan(S.kalender.dag, T.isOogstDag(S.kalender.dag));

// Zet een poppetje stil neer op tegel (x, y).
function zet(e, x, y) {
  Object.assign(e, { x, y, tx: x, ty: y, pad: [], padDoel: null, onderweg: false, binnen: false });
}

// Bewoners met een poppetje die vrij kunnen zijn: geen kleuter, niet de schout, niet de herbergierster.
function vrijeMensen(S) {
  const D = S.dorp;
  const herberg = T.herbergVan(D);
  return D.bewoners.mensen.filter((p) => p.wezen && !p.schout && p.leeftijd !== 'kleuter' && p.huis !== herberg);
}

// `aantal` poppetjes: de eerste is wie de meeste mensen kent, en de rest kent hem (uit een ander huis). Om aan te
// schuiven hoef je er maar één uit het groepje te kennen.
function bekenden(S, aantal) {
  const D = S.dorp;
  const mensen = vrijeMensen(S);
  const kring = (p) => mensen.filter((q) => T.kentElkaar(D, p, q));
  const eerste = mensen.reduce((a, b) => (kring(b).length > kring(a).length ? b : a));
  const rest = kring(eerste);
  assert.ok(rest.length >= aantal - 1, `${aantal - 1} die ${T.naamVanBewoner(eerste)} kennen`);
  return [eerste, ...rest.slice(0, aantal - 1)].map((q) => q.wezen);
}

// Vrije tegels op het plein, met hun buren ook vrij, zodat er een groepje kan staan.
function pleinPlek(S) {
  const w = S.wereld;
  const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true }) && !T.bijDeur(w, x, y);
  const t = T.pleinTegels(w).find((q) => {
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (!vrij(q.x + dx, q.y + dy)) return false;
    return true;
  });
  assert.ok(t, 'een open stuk plein');
  return t;
}

// Een tegel die geen vaste plek is (niet op het plein, niet bij de put, de herberg of de kapel), met ruimte eromheen.
function gewonePlek(S) {
  const w = S.wereld;
  const D = S.dorp;
  const vrij = (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true }) && !T.bijDeur(w, x, y) && !T.opVastePlek(D, w, x, y);
  for (let y = 5; y < w.h - 5; y++) {
    for (let x = 5; x < w.b - 5; x++) {
      let ok = true;
      for (let dy = -3; dy <= 3 && ok; dy++) for (let dx = -3; dx <= 3 && ok; dx++) ok = vrij(x + dx, y + dy);
      if (ok) return { x, y };
    }
  }
  assert.fail('geen gewone plek');
}

// Laat de wereld lopen zoals js/main.js, met de tijd stil zolang een venster dat vraagt niet.
function beelden(S, n, snel = 3) {
  S.kalender.snelheid = snel;
  for (let i = 0; i < n; i++) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.laatDwalen(S, dtW);
  }
}

// Alleen het praatje en het lopen, zonder het dwalen van de anderen.
function stappen(S, seconden) {
  for (let t = 0; t < seconden; t += 0.05) {
    T.werkPraatjesBij(S, S.dorp);
    T.beweegWezens(S, S.wereld, 0.05, 0.05);
  }
}

test('wie vrij is: de ochtend, de schaft en de avond; overdag alleen wie geen werk heeft; nooit een kleuter of de schout', () => {
  const S = gehucht();
  const D = S.dorp;
  const werker = D.bewoners.mensen.find((p) => p.wezen && p.werk && !p.schout && p.huis !== T.herbergVan(D)).wezen;
  const zonder = D.bewoners.mensen.find((p) => p.wezen && !p.werk && !p.schout && p.leeftijd !== 'kleuter' && !p.wie).wezen;
  const kleuter = D.bewoners.mensen.find((p) => p.wezen && p.leeftijd === 'kleuter');
  for (const deel of ['ochtend', 'schaft', 'avond']) assert.ok(T.kanPraten(S, D, werker, deel), `wie werkt, is vrij in de ${deel}`);
  assert.ok(!T.kanPraten(S, D, werker, 'werk'), 'wie werkt, praat niet onder het werk');
  assert.ok(T.kanPraten(S, D, zonder, 'werk'), 'wie geen werk heeft, wel');
  assert.ok(!T.kanPraten(S, D, werker, 'nacht'), "'s nachts niet");
  if (kleuter) assert.ok(!T.kanPraten(S, D, kleuter.wezen, 'ochtend'), 'een kleuter niet');
  assert.ok(!T.kanPraten(S, D, S.schout, 'avond'), 'de schout niet: dat ben jij');
  for (const bezig of ['maait', 'zoektSchout', 'opgeroepen', 'binnen']) {
    werker[bezig] = true;
    assert.ok(!T.kanPraten(S, D, werker, 'avond'), `wie ${bezig}, niet`);
    werker[bezig] = false;
  }
  const herbergierster = D.bewoners.mensen.find((p) => p.wezen && p.huis === T.herbergVan(D));
  if (herbergierster) assert.ok(!T.kanPraten(S, D, herbergierster.wezen, 'avond'), "de herbergierster tapt 's avonds");
});

test('wie elkaar kent: buren en wie samen werkt, niet wie onder één dak woont, en niet wie ver weg woont', () => {
  const S = gehucht();
  const D = S.dorp;
  const huis = (x, y) => ({ x, y });
  const werk = {};
  const a = { huis: huis(10, 10), werk: null };
  assert.ok(!T.kentElkaar(D, a, { huis: a.huis, werk: null }), 'zijn eigen gezin spreekt hij binnen');
  assert.ok(T.kentElkaar(D, a, { huis: huis(10 + T.PRAATJE_INSTELLINGEN.buren, 12), werk: null }), 'een buur');
  assert.ok(!T.kentElkaar(D, a, { huis: huis(11 + T.PRAATJE_INSTELLINGEN.buren, 10), werk: null }), 'wie verder woont niet');
  assert.ok(T.kentElkaar(D, { huis: huis(0, 0), werk }, { huis: huis(60, 60), werk }), 'wie op hetzelfde werk werkt wel');
});

test('twee vrije bekenden blijven staan: de een loopt tot naast de ander, en ze kijken naar elkaar', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const [a, b] = bekenden(S, 2);
  const p = pleinPlek(S);
  zet(b, p.x, p.y);
  zet(a, p.x + 2, p.y);
  assert.ok(metWorp(0, () => T.zoekPraatje(S, w, D, a, deelNu(S))), 'ze beginnen een praatje');
  assert.ok(a.praatje && a.praatje === b.praatje, 'samen in één groepje');
  assert.deepEqual(a.praatje.plek, tegel(b), 'wie stond, is het midden');
  stappen(S, 5);
  assert.ok(T.staatErbij(a) && T.staatErbij(b), 'ze staan er allebei bij');
  assert.equal(T.afstand(tegel(a), tegel(b)), 1, 'naast elkaar');
  assert.ok(Math.sign(a.kijkt.x - a.x) === Math.sign(b.x - a.x) && Math.sign(a.kijkt.y - a.y) === Math.sign(b.y - a.y), 'a kijkt naar b');
  assert.ok(Math.sign(b.kijkt.x - b.x) === Math.sign(a.x - b.x) && Math.sign(b.kijkt.y - b.y) === Math.sign(a.y - b.y), 'b kijkt naar a');
  // Liefst links of rechts op het scherm: op het raster schuin, met +x en -y (of andersom).
  assert.equal((a.tx - b.tx) * (a.ty - b.ty), -1, 'van opzij te zien');
  // Wie praat, dwaalt niet.
  const waar = { ...tegel(a) };
  T.dwaal(S, w, D, 60);
  assert.ok(!a.pad.length && a.tx === waar.x && a.ty === waar.y, 'hij blijft staan');
});

test('wie een bekende ziet die al in een groepje staat, schuift aan, tot vier', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const mensen = bekenden(S, 5);
  const p = pleinPlek(S);
  zet(mensen[0], p.x, p.y);
  zet(mensen[1], p.x + 1, p.y - 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, mensen[1], mensen[0])));
  const g = mensen[0].praatje;
  zet(mensen[2], p.x - 2, p.y + 1);
  zet(mensen[3], p.x + 2, p.y + 1);
  zet(mensen[4], p.x, p.y + 2);
  assert.ok(metWorp(0, () => T.zoekPraatje(S, w, D, mensen[2], deelNu(S))), 'de derde schuift aan');
  assert.equal(mensen[2].praatje, g, 'bij hetzelfde groepje');
  assert.ok(metWorp(0, () => T.zoekPraatje(S, w, D, mensen[3], deelNu(S))), 'de vierde ook');
  assert.equal(mensen[3].praatje, g);
  assert.ok(!metWorp(0, () => T.zoekPraatje(S, w, D, mensen[4], deelNu(S))), 'de vijfde niet: het groepje is vol');
  stappen(S, 6);
  const leden = T.praatjesOp(w).get(g);
  assert.equal(leden.length, 4);
  for (const e of leden) assert.ok(T.staatErbij(e), 'iedereen staat rond het midden');
});

test('wie langsloopt en er een kent, schuift aan: één kans per keer dat hij langskomt', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const [a, b, c, d] = bekenden(S, 4);
  const p = pleinPlek(S);
  zet(a, p.x, p.y);
  zet(b, p.x + 1, p.y - 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, b, a)));
  // c loopt er vlak langs, en blijft staan.
  zet(c, p.x - 3, p.y + 2);
  T.geefRoute(c, [{ x: p.x - 2, y: p.y + 2 }, { x: p.x - 1, y: p.y + 2 }, { x: p.x, y: p.y + 2 }, { x: p.x + 1, y: p.y + 2 }], { x: p.x + 1, y: p.y + 2 });
  c.tx = p.x - 1;
  c.ty = p.y + 2;
  metWorp(0, () => T.werkPraatjesBij(S, D));
  assert.equal(c.praatje, a.praatje, 'hij schuift aan');
  // d loopt er ook langs, maar loopt door: dan een kwartier niet weer.
  zet(d, p.x + 3, p.y + 2);
  T.geefRoute(d, [{ x: p.x + 2, y: p.y + 2 }, { x: p.x + 1, y: p.y + 3 }], { x: p.x + 1, y: p.y + 3 });
  d.tx = p.x + 2;
  metWorp(0.99, () => T.werkPraatjesBij(S, D));
  assert.ok(!d.praatje, 'hij loopt door');
  assert.ok(d.praatRust > S.kalender.dag, 'en kijkt een kwartier niet weer');
  metWorp(0, () => T.werkPraatjesBij(S, D));
  assert.ok(!d.praatje, 'ook niet het beeld erna');
});

test('onderweg: twee vrije bekenden die elkaar treffen, blijven staan in plaats van uit te wijken', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const [a, b] = bekenden(S, 2);
  const p = pleinPlek(S);
  zet(a, p.x - 2, p.y);
  zet(b, p.x + 2, p.y);
  const naarRechts = [{ x: p.x - 1, y: p.y }, { x: p.x, y: p.y }, { x: p.x + 1, y: p.y }, { x: p.x + 2, y: p.y }, { x: p.x + 3, y: p.y }];
  T.geefRoute(a, naarRechts.slice(), { x: p.x + 3, y: p.y });
  T.geefRoute(b, naarRechts.slice(0, 4).reverse().concat([{ x: p.x - 2, y: p.y }, { x: p.x - 3, y: p.y }]).slice(1), { x: p.x - 3, y: p.y });
  metWorp(0, () => {
    for (let t = 0; t < 4 && !a.praatje; t += 0.05) T.beweegWezens(S, w, 0.05, 0.05);
  });
  assert.ok(a.praatje && a.praatje === b.praatje, 'ze maken een praatje');
  stappen(S, 2);
  assert.ok(T.staatErbij(a) && T.staatErbij(b), 'en staan stil naast elkaar');
  assert.ok(!a.pad.length && !b.pad.length, 'hun weg is gestopt');
});

test('onderweg: lopen ze door, dan is het één kans per keer dat ze elkaar treffen, ook op het plein', () => {
  const S = gehucht(20);
  const w = S.wereld;
  const [a, b] = bekenden(S, 2);
  const p = pleinPlek(S);
  zet(b, p.x, p.y);
  zet(a, p.x - 2, p.y);
  T.geefRoute(a, [{ x: p.x - 1, y: p.y }, { x: p.x, y: p.y }, { x: p.x + 1, y: p.y }, { x: p.x + 2, y: p.y }], { x: p.x + 2, y: p.y });
  metWorp(0.99, () => {
    for (let t = 0; t < 2 && !(a.praatRust > S.kalender.dag); t += 0.05) T.beweegWezens(S, w, 0.05, 0.05);
  });
  assert.ok(!a.praatje, 'ze lopen door');
  assert.ok(a.praatRust > S.kalender.dag, 'en hij kijkt een kwartier niet');
  metWorp(0, () => {
    for (let t = 0; t < 6; t += 0.05) T.beweegWezens(S, w, 0.05, 0.05);
  });
  assert.ok(!a.praatje && !b.praatje, 'ook niet als hij nog even achter hem staat');
  assert.deepEqual(tegel(a), { x: p.x + 2, y: p.y }, 'hij kwam erlangs');
});

test('het praatje is om na zijn tijd, en dan een uur rust; op een vaste plek niet', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const [a, b] = bekenden(S, 2);
  const p = gewonePlek(S);
  zet(a, p.x, p.y);
  zet(b, p.x + 1, p.y - 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, a, b)));
  const g = a.praatje;
  const minuten = (g.tot - S.kalender.dag) * 24 * 60;
  assert.ok(minuten >= 15 - 1e-6 && minuten <= 60 + 1e-6, `een kwartier tot een uur (${minuten.toFixed(0)} minuten)`);
  S.kalender.dag = g.tot;
  T.werkPraatjesBij(S, D);
  assert.ok(!a.praatje && !b.praatje, 'het is om');
  assert.equal(a.kijkt, null, 'hij kijkt weer waar hij wil');
  assert.ok(Math.abs((a.praatRust - S.kalender.dag) * 24 - T.PRAATJE_INSTELLINGEN.rust) < 1e-9, 'een uur rust');
  assert.ok(!metWorp(0, () => T.zoekPraatje(S, w, D, a, deelNu(S))), 'dus nu geen nieuw');
  // Op het plein blijven ze praten, met steeds een ander.
  const q = pleinPlek(S);
  zet(a, q.x, q.y);
  zet(b, q.x + 1, q.y - 1);
  assert.ok(metWorp(0, () => T.zoekPraatje(S, w, D, a, deelNu(S))), 'op het plein wel');
});

test('wie niet meer vrij is, gaat; staat er nog maar één, dan is het praatje om', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const [a, b, c] = bekenden(S, 3);
  const p = pleinPlek(S);
  zet(a, p.x, p.y);
  zet(b, p.x + 1, p.y - 1);
  zet(c, p.x - 1, p.y + 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, b, a)));
  c.praatje = a.praatje;
  c.zoektSchout = true; // een voorval: hij komt de schout zoeken
  T.werkPraatjesBij(S, D);
  assert.ok(!c.praatje, 'wie de schout zoekt, gaat');
  assert.ok(a.praatje && b.praatje, 'de andere twee praten door');
  b.zoektSchout = true;
  T.werkPraatjesBij(S, D);
  assert.ok(!a.praatje && !b.praatje, 'alleen praat je niet');
  // 's Nachts gaat iedereen naar huis.
  b.zoektSchout = false;
  c.zoektSchout = false;
  assert.ok(metWorp(0, () => T.beginPraatje(D, b, a)));
  S.kalender.dag = Math.floor(S.kalender.dag) + 23.5 / 24;
  T.werkPraatjesBij(S, D);
  assert.ok(!a.praatje && !b.praatje, "'s nachts niet");
});

test('wie langs wil, loopt om een praatje heen; in een smalle doorgang gaat er een even opzij', () => {
  // Kaarten uit tekens (zoals test/lopen.test.cjs): # is een muur, de rest vloer.
  const kaart = (plan) => ({
    b: plan[0].length, h: plan.length, tegels: plan.map((r) => [...r].map((c) => (c === '#' ? 'muur' : 'vloer'))),
    deuren: new Map(), kamers: [], voorwerpen: [], wezens: [], overgangen: [], buiten: true,
  });
  const mens = (w, x, y) => {
    const e = { soort: 'dorpeling', kant: 'neutraal', x, y, tx: x, ty: y, pad: [], onderweg: false, dood: false, snelheid: 1.3 };
    w.wezens.push(e);
    return e;
  };
  // Breed: drie rijen. Twee staan midden op de weg te praten; wie langs wil, loopt eromheen.
  const breed = kaart(['#############', '#...........#', '#...........#', '#...........#', '#############']);
  const S = { wereld: breed, spreektMet: null };
  const groep = { plek: { x: 6, y: 2 }, tot: Infinity, zaad: 0 };
  const a = mens(breed, 6, 2);
  const b = mens(breed, 7, 2);
  a.praatje = groep;
  b.praatje = groep;
  const c = mens(breed, 2, 2);
  T.geefRoute(c, T.zoekRoute(breed, tegel(c), { x: 11, y: 2 }, {}), { x: 11, y: 2 });
  for (let t = 0; t < 20 && (c.tx !== 11 || c.onderweg); t += 0.05) T.beweegWezens(S, breed, 0.05, 0.05);
  assert.deepEqual([tegel(c), tegel(a), tegel(b)], [{ x: 11, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }], 'hij is erlangs, en zij staan er nog');
  // Smal: één rij. Er kan niemand omheen, dus wie praat, gaat even opzij (hier: ze ruilen van plaats).
  const smal = kaart(['#########', '#.......#', '#########']);
  const S2 = { wereld: smal, spreektMet: null };
  const d = mens(smal, 4, 1);
  d.praatje = { plek: { x: 4, y: 1 }, tot: Infinity, zaad: 0 };
  const f = mens(smal, 1, 1);
  T.geefRoute(f, T.zoekRoute(smal, tegel(f), { x: 7, y: 1 }, {}), { x: 7, y: 1 });
  for (let t = 0; t < 20 && (f.tx !== 7 || f.onderweg); t += 0.05) T.beweegWezens(S2, smal, 0.05, 0.05);
  assert.deepEqual(tegel(f), { x: 7, y: 1 }, 'hij kon erlangs');
});

test("'s avonds gaat een op de drie naar het plein, elke avond anderen, tot een uur voor bedtijd", () => {
  const S = gehucht(19.5);
  const D = S.dorp;
  const w = S.wereld;
  const mensen = vrijeMensen(S);
  let gaan = 0;
  let keer = 0;
  const avonden = new Map();
  for (let dag = 40; dag < 100; dag++) {
    for (const p of mensen) {
      keer++;
      if (!T.gaatNaarHetPlein(D, p, dag)) continue;
      gaan++;
      avonden.set(p, (avonden.get(p) || 0) + 1);
    }
  }
  assert.ok(gaan / keer > 0.28 && gaan / keer < 0.39, `een op de drie (${(gaan / keer).toFixed(2)})`);
  assert.ok([...avonden.values()].every((n) => n < 40), 'niet elke avond dezelfden');
  const kleuter = D.bewoners.mensen.find((p) => p.leeftijd === 'kleuter');
  if (kleuter) for (let dag = 40; dag < 100; dag++) assert.ok(!T.gaatNaarHetPlein(D, kleuter, dag), 'een kleuter niet');
  // Wie vanavond gaat, hoort op het plein, en een uur voor bedtijd weer thuis.
  const p = mensen.find((q) => T.gaatNaarHetPlein(D, q, 40) && !T.herbergGasten(D, 40).includes(q));
  assert.ok(p, 'iemand gaat vanavond');
  const a = T.dagAnker(D, p.wezen, false);
  assert.ok(a && T.opHetPlein(w, a.x, a.y), 'zijn plek is op het plein');
  S.kalender.dag = 40 + (T.dagindeling(40).slapen - 0.9) / 24;
  const later = T.dagAnker(D, p.wezen, false);
  assert.ok(later && !T.opHetPlein(w, later.x, later.y), 'een uur voor bedtijd gaat hij naar huis');
});

test('de spelregel Praatjes uit: geen praatje, geen plein, en wie praatte, gaat', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const w = S.wereld;
  const [a, b] = bekenden(S, 2);
  const p = pleinPlek(S);
  zet(a, p.x, p.y);
  zet(b, p.x + 1, p.y - 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, a, b)));
  T.zetOptie('praatjes', 'uit');
  try {
    T.werkPraatjesBij(S, D);
    assert.ok(!a.praatje && !b.praatje, 'wie praatte, gaat');
    assert.ok(!metWorp(0, () => T.zoekPraatje(S, w, D, a, deelNu(S))), 'geen nieuw praatje');
    assert.ok(vrijeMensen(S).every((q) => !T.gaatNaarHetPlein(D, q, 40)), "'s avonds niemand naar het plein");
  } finally {
    T.zetOptie('praatjes', 'aan');
  }
});

test('een bewaard spel heeft het praatje nog: één groepje, met dezelfde mensen', () => {
  const S = gehucht(20);
  const D = S.dorp;
  const [a, b] = bekenden(S, 2);
  const p = pleinPlek(S);
  zet(a, p.x, p.y);
  zet(b, p.x + 1, p.y - 1);
  assert.ok(metWorp(0, () => T.beginPraatje(D, a, b)));
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = gehucht(20);
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  const groepen = [...T.praatjesOp(S2.wereld)];
  assert.equal(groepen.length, 1, 'één groepje');
  const [g, leden] = groepen[0];
  assert.equal(leden.length, 2, 'met twee erin');
  assert.deepEqual(g.plek, a.praatje.plek);
  assert.equal(g.tot, a.praatje.tot);
});

test('een dag in het gehucht: er wordt gepraat, nooit twee op één tegel, wie praat laat het werk niet liggen, en \'s nachts is iedereen binnen', () => {
  const S = gehucht(5);
  const D = S.dorp;
  const w = S.wereld;
  const groepjes = new Set();
  let dubbel = 0;
  let onderWerk = 0;
  let nachtGezien = false;
  for (let i = 0; i < 6000; i++) {
    beelden(S, 1);
    // Om twee uur 's nachts is iedereen binnen, ook wie 's avonds op het plein stond of praatte.
    if (!nachtGezien && S.kalender.dag >= 41 + 2 / 24) {
      nachtGezien = true;
      const buiten = D.bewoners.mensen.filter((p) => p.wezen && !p.schout && !p.wezen.binnen);
      assert.deepEqual(buiten.map(T.naamVanBewoner), [], "'s nachts is iedereen binnen");
      assert.equal(T.praatjesOp(w).size, 0, "'s nachts praat niemand");
    }
    if (i % 5) continue;
    const deel = deelNu(S);
    for (const [g, leden] of T.praatjesOp(w)) {
      if (leden.filter((e) => T.staatErbij(e)).length >= 2) groepjes.add(g);
      if (deel === 'werk') for (const e of leden) if (T.bewonerVan(D, e).werk) onderWerk++;
    }
    const bezet = new Set();
    for (const e of w.wezens) {
      if (e.binnen || e.dood) continue;
      if (bezet.has(e.tx + ',' + e.ty)) dubbel++;
      bezet.add(e.tx + ',' + e.ty);
    }
  }
  assert.ok(nachtGezien, 'de nacht kwam');
  assert.ok(groepjes.size >= 5, `er wordt gepraat (${groepjes.size} praatjes)`);
  assert.equal(dubbel, 0, 'nooit twee op één tegel');
  assert.equal(onderWerk, 0, 'wie werk heeft, praat niet onder het werk');
});
