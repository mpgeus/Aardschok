// De hoogte van het land (js/hoogte.js; werklijst vraag 121, stap 1; Marcel, 7 okt: "ik doel ook meer op heuvels in het
// landschap", en "a ja 32, b hoger"): met de spelregel "Hoogte" op "Heuvels" legt de maker hoge heuvels in het wilde
// land, een zachte glooiing en een richel bij de rotsen; vlak waar het plein, een gebouw van de speler of het water ligt.
// Op "Vlak" (de standaard) is er geen hoogte, en tekent en klikt alles als vroeger. De toetsen spelen op het land van het
// lege begin (sinds ronde 2 van het snoeien, stap 6, het enige land van de maker).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const grond = require('./grond.cjs');

// Het land van het lege begin op het eiland van `zaad`, met of zonder heuvels (de spelregel "Hoogte").
function land(zaad, heuvels) {
  const echt = console.warn;
  console.warn = () => {};
  T.zetOptie('hoogte', heuvels ? 'heuvels' : 'vlak');
  try {
    return T.laadGemaaktGehucht(zaad);
  } finally {
    T.zetOptie('hoogte', 'vlak');
    console.warn = echt;
  }
}

test('hoogte: op "Vlak" heeft een land geen hoogte, en ligt alles op de grond zoals vroeger', () => {
  const w = land(5, false);
  assert.equal(w.hoogte, undefined);
  assert.equal(T.hoogteOp(w, 40.3, 51.7), 0);
  assert.deepEqual(T.naarSchermOp(w, 40.3, 51.7), T.naarScherm(40.3, 51.7));
  assert.deepEqual(T.naarWereldOp(w, 123, 456), T.naarWereld(123, 456));
  assert.equal(T.isSchuin(w, 40, 51), false);
  assert.deepEqual(T.wandenVan(w, 40, 51), []);
});

test('hoogte: uit hetzelfde nummer hetzelfde land, met heuvels en dalen die doorlopen, en een richel', () => {
  const a = land(5, true);
  const b = land(5, true);
  assert.deepEqual(a.hoogte, b.hoogte);
  const K = T.kaartVak(a);
  let laag = Infinity;
  let hoog = -Infinity;
  for (let y = K.y; y < K.y + K.h; y++) for (let x = K.x; x < K.x + K.b; x++) {
    const h = T.hoogteOp(a, x, y);
    laag = Math.min(laag, h);
    hoog = Math.max(hoog, h);
  }
  assert.ok(hoog - laag >= 200, `van dal tot top ${Math.round(hoog - laag)} pixels`);
  assert.ok(Object.keys(a.hoogte.niveau).length >= 12, 'een richel bij de rotsen');
  assert.ok(Object.keys(a.hoogte.hellingen).length >= 1, 'met een helling erop');
  // het landschap loopt door buiten het land: geen vlakke rand (ver weg: de toets hieronder, per stuk)
  assert.notEqual(T.hoogteOp(a, K.x - 5, K.y + 40), 0);
  assert.equal(T.hoekHoogte(a, K.x - 1, K.y + 40, 1), T.hoekHoogte(a, K.x, K.y + 40, 0), 'de hoek buiten het land past op die erbinnen');
  // wat bewaard wordt, is klein: het nummer en de vlakke stukken, niet een getal per hoekpunt
  assert.ok(JSON.stringify(a.hoogte).length < 20000);
  // een ander land is anders
  const ander = land(7, true);
  assert.notDeepEqual(T.hoekHoogten(ander, T.kaartVak(ander).x + 20, T.kaartVak(ander).y + 20), T.hoekHoogten(a, K.x + 20, K.y + 20));
});

// Vraag 174, stap a (Marcel, 17 okt: "Ja, begin met stap a"): de hoogte per stuk van T.STUK, zoals het land. Tot dan
// was ze één lijst om het eerste land, en vroeg daarbuiten elke hoek het eiland opnieuw (honderd keer duurder).
test('hoogte per stuk: ver van het eerste land één keer het eiland per stuk, met naadloze stukken', () => {
  const w = land(5, true);
  const hg = w.hoogte;
  const E = T.eilandVan(5);
  const kasteel = E.plekken.find((p) => p.soort === 'kasteel'); // op een heuvel, ver van het dorp
  const Z = T.STUK;
  const x0 = Math.floor(kasteel.x / Z) * Z;
  const y0 = Math.floor(kasteel.y / Z) * Z;
  assert.ok(Math.hypot(kasteel.x - hg.ox, kasteel.y - hg.oy) > 300, 'het kasteel ligt ver van het eerste land');
  // alle hoeken van het stuk van het kasteel: één keer het eiland (de bruggen van het eiland, vraag 174, b3, één keer
  // voor het hele eiland, hier vooraf)
  T.brugBasis(w, 0);
  const echt = T.eilandStuk;
  let gevraagd = 0;
  T.eilandStuk = (...a) => (gevraagd++, echt(...a));
  const hoeken = new Set();
  try {
    for (let y = y0; y < y0 + Z; y++) for (let x = x0; x < x0 + Z; x++) for (const h of T.hoekHoogten(w, x, y)) hoeken.add(h);
  } finally {
    T.eilandStuk = echt;
  }
  assert.equal(gevraagd, 1, 'één T.eilandStuk voor het hele stuk');
  assert.ok(hoeken.size > 1000, 'het land glooit er');
  // en het is het eiland zelf: ver van het dorp en van een vlak stuk de hoogte van het eiland op dat hoekpunt
  const naarEiland = (v, o, e) => e + v - o;
  for (const [x, y] of [[x0, y0], [x0 + 17, y0 + 40], [x0 + Z - 1, y0 + Z - 1]]) {
    const eiland = Math.max(0, echt(E, naarEiland(x, hg.ox, hg.eiland.x0) - 0.5, naarEiland(y, hg.oy, hg.eiland.y0) - 0.5, 1, 1).hoogte[0]);
    assert.ok(Math.abs(T.hoekHoogte(w, x, y, 0) - eiland) < 1e-6, `hoekpunt (${x}, ${y}): ${T.hoekHoogte(w, x, y, 0)} en het eiland ${eiland}`);
  }
  // de naad met het stuk ten oosten en ten zuiden: de hoeken die de buren delen, zijn precies gelijk
  for (let i = 0; i < Z; i++) {
    assert.equal(T.hoekHoogte(w, x0 + Z - 1, y0 + i, 1), T.hoekHoogte(w, x0 + Z, y0 + i, 0), `de naad in het oosten, rij ${i}`);
    assert.equal(T.hoekHoogte(w, x0 + i, y0 + Z - 1, 3), T.hoekHoogte(w, x0 + i, y0 + Z, 0), `de naad in het zuiden, kolom ${i}`);
    assert.equal(T.isSchuin(w, x0 + Z - 1, y0 + i), new Set(T.hoekHoogten(w, x0 + Z - 1, y0 + i)).size > 1);
  }
  // een vlak stuk over de naad: in beide stukken vlak, en net als op een kaart die de stukken pas daarna uitrekent
  const plek = { x: x0 + Z - 2, y: y0 + 20, b: 3, h: 3 };
  const vlak = T.egaliseer(w, plek);
  const vers = land(5, true);
  T.egaliseer(vers, plek);
  for (let y = plek.y - 9; y < plek.y + plek.h + 9; y++) {
    for (let x = plek.x - 9; x < plek.x + plek.b + 9; x++) assert.deepEqual(T.hoekHoogten(w, x, y), T.hoekHoogten(vers, x, y), `tegel (${x}, ${y})`);
  }
  for (let y = plek.y; y < plek.y + plek.h; y++) for (let x = plek.x; x < plek.x + plek.b; x++) assert.deepEqual(T.hoekHoogten(w, x, y), [vlak.h, vlak.h, vlak.h, vlak.h]);
});

// Vraag 174, stap b1: het tekenen vraagt per vak hoe hoog het land daar ligt (welke tegels in een stuk van het scherm
// vallen), en waar een nieuw vlak stuk de glooiing veranderde (alleen daar de grond en het licht opnieuw).
test('hoogte per stuk, voor het tekenen: de hoogste grond van een vak, en waar de hoogte veranderde', () => {
  assert.deepEqual(T.hoogteIn(land(5, false), 0, 0, 100, 100), { hoog: 0, laag: 0 }, 'zonder hoogte 0');
  const w = land(5, true);
  const hg = w.hoogte;
  const Z = T.STUK;
  const kasteel = T.eilandVan(5).plekken.find((p) => p.soort === 'kasteel');
  const x0 = Math.floor(kasteel.x / Z) * Z;
  const y0 = Math.floor(kasteel.y / Z) * Z;
  const bereik = (X0, Y0, X1, Y1) => {
    let hoog = -Infinity;
    let laag = Infinity;
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) for (const h of T.hoekHoogten(w, x, y)) (hoog = Math.max(hoog, h)), (laag = Math.min(laag, h));
    return { hoog, laag };
  };
  assert.deepEqual(T.hoogteIn(w, x0, y0, x0 + Z - 1, y0 + Z - 1), bereik(x0, y0, x0 + Z - 1, y0 + Z - 1), 'één stuk: precies zijn hoeken');
  const twee = T.hoogteIn(w, x0 + 10, y0 + 10, x0 + Z + 3, y0 + 20);
  const echt = bereik(x0 + 10, y0 + 10, x0 + Z + 3, y0 + 20);
  assert.ok(twee.hoog >= echt.hoog && twee.laag <= echt.laag, 'over twee stukken: ruim genoeg');
  // een vlak stuk: de plek die het zegt, bevat elke tegel waarvan een hoek veranderde
  const plek = { x: x0 + 30, y: y0 + Z - 2, b: 3, h: 3 }; // over de naad met het stuk ten zuiden
  const rond = 14;
  const was = new Map();
  for (let y = plek.y - rond; y < plek.y + rond; y++) for (let x = plek.x - rond; x < plek.x + rond; x++) was.set(`${x},${y}`, T.hoekHoogten(w, x, y).join());
  const versie = hg.versie || 0;
  T.egaliseer(w, plek);
  const plekken = T.hoogtePlekkenSinds(w, versie);
  assert.equal(plekken.length, 1);
  const [p] = plekken;
  let veranderd = 0;
  for (const [k, h] of was) {
    const [x, y] = k.split(',').map(Number);
    if (T.hoekHoogten(w, x, y).join() === h) continue;
    veranderd++;
    assert.ok(x >= p.x1 && x <= p.x2 && y >= p.y1 && y <= p.y2, `tegel (${x}, ${y}) veranderde buiten de plek`);
  }
  assert.ok(veranderd > 9, 'de voet en de overgang eromheen veranderden');
  // en het bereik van de stukken is bijgewerkt
  for (const sy of [y0, y0 + Z]) assert.deepEqual(T.hoogteIn(w, x0, sy, x0 + Z - 1, sy + Z - 1), bereik(x0, sy, x0 + Z - 1, sy + Z - 1));
  assert.deepEqual(T.hoogtePlekkenSinds(w, hg.versie), [], 'sinds nu niets');
  assert.equal(T.hoogtePlekkenSinds(w, hg.versie + 3), null, 'een versie die nog niet was: onbekend');
  for (let i = 0; i < 70; i++) T.egaliseer(w, { x: x0 + 2 + (i % 8) * 7, y: y0 + 4, b: 2, h: 2 });
  assert.equal(T.hoogtePlekkenSinds(w, versie), null, 'te lang geleden: onbekend');
  assert.equal(T.hoogtePlekkenSinds(w, hg.versie - 2).length, 2);
});

test('hoogte: het plein ligt vlak, en het kamp erop met zijn looppad ook', () => {
  for (const zaad of [3, 5, 7]) {
    const w = land(zaad, true);
    const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
    for (const k of w.plekken[0].kamp.plekken) {
      const hoogten = new Set();
      for (let y = k.voet.y - lp; y < k.voet.y + k.voet.h + lp; y++) {
        for (let x = k.voet.x - lp; x < k.voet.x + k.voet.b + lp; x++) for (const v of T.hoekHoogten(w, x, y)) hoogten.add(Math.round(v * 100));
      }
      assert.equal(hoogten.size, 1, `land ${zaad}: de tent op (${k.voet.x}, ${k.voet.y}) ligt niet vlak`);
    }
    for (const [px, py] of w.plekken[0].plein) {
      const hoeken = T.hoekHoogten(w, Math.round(px), Math.round(py));
      assert.ok(Math.max(...hoeken) - Math.min(...hoeken) < 1, `land ${zaad}: het plein op (${Math.round(px)}, ${Math.round(py)})`);
    }
  }
});

test('hoogte: buren delen hun hoek, behalve waar een wand staat; een wand alleen aan de zuid- en oostkant', () => {
  const w = land(5, true);
  const K = T.kaartVak(w);
  let wanden = 0;
  for (let y = K.y; y < K.y + K.h - 1; y++) {
    for (let x = K.x; x < K.x + K.b - 1; x++) {
      const hier = T.hoekHoogten(w, x, y);
      const oost = T.hoekHoogten(w, x + 1, y);
      const zuid = T.hoekHoogten(w, x, y + 1);
      const naarOost = hier[1] !== oost[0] || hier[2] !== oost[3];
      const naarZuid = hier[3] !== zuid[0] || hier[2] !== zuid[1];
      const kanten = T.wandenVan(w, x, y).map((wd) => wd.kant);
      // een wand staat waar deze tegel hoger ligt dan zijn buur; ligt hij lager, dan is het de wand van de buur aan
      // zijn noord- of westkant, die je niet ziet
      if (kanten.includes('oost')) assert.ok(naarOost);
      if (kanten.includes('zuid')) assert.ok(naarZuid);
      if (!naarOost) assert.ok(!kanten.includes('oost'));
      if (!naarZuid) assert.ok(!kanten.includes('zuid'));
      wanden += kanten.length;
    }
  }
  assert.ok(wanden > 0, 'de richel heeft een wand');
});

test('hoogte: de muis vindt de tegel terug, of een tegel ervoor die hem afdekt', () => {
  const w = land(5, true);
  let schuin = 0;
  let zelf = 0;
  let alle = 0;
  const K = T.kaartVak(w);
  for (let y = K.y + 5; y < K.y + K.h - 5; y += 3) {
    for (let x = K.x + 5; x < K.x + K.b - 5; x += 3) {
      if (T.isSchuin(w, x, y)) schuin++;
      const p = T.naarSchermOp(w, x + 0.1, y - 0.15);
      const terug = T.naarWereldOp(w, p.x, p.y);
      const t = { x: Math.round(terug.x), y: Math.round(terug.y) };
      alle++;
      if (t.x === x && t.y === y) zelf++;
      // een andere tegel mag alleen als hij ervoor ligt (een heuvel of een richel dekt af wat erachter ligt)
      else assert.ok(t.x + t.y > x + y, `(${x}, ${y}) gaf (${t.x}, ${t.y})`);
    }
  }
  assert.ok(schuin > 20, `er lagen ${schuin} schuine tegels tussen`);
  assert.ok(zelf > alle * 0.9, `${zelf} van ${alle} tegels gevonden`);
});

test('hoogte: de hoogte op een punt ligt tussen de hoeken van zijn tegel', () => {
  const w = land(5, true);
  const K = T.kaartVak(w);
  for (let y = K.y; y < K.y + K.h; y += 7) {
    for (let x = K.x; x < K.x + K.b; x += 7) {
      const h = T.hoekHoogten(w, x, y);
      assert.equal(T.hoogteOp(w, x - 0.5, y - 0.5), h[0]);
      const m = T.hoogteOp(w, x, y);
      assert.ok(m >= Math.min(...h) - 1e-9 && m <= Math.max(...h) + 1e-9);
    }
  }
});

// ── Wat de hoogte doet (vraag 121, stap 2; Marcel, 8 okt: "Akkoord") ──

test('hoogte, lopen: niet door een wand, wel over een helling; op "Vlak" verandert er niets', () => {
  const vlak = land(5, false);
  assert.equal(T.kanStappen(vlak, 40, 40, 41, 41), true);
  // (op sommige eilanden ligt de richel in het bos, zonder open weg vanaf het plein: die staan hier niet bij)
  for (const zaad of [1, 7, 10]) {
    const w = land(zaad, true);
    const hel = w.hoogte.hellingen;
    // waar een wand staat, kun je er niet langs, van geen van beide kanten
    let wanden = 0;
    const K = T.kaartVak(w);
    for (let y = K.y + 1; y < K.y + K.h - 1; y++) {
      for (let x = K.x + 1; x < K.x + K.b - 1; x++) {
        for (const wd of T.wandenVan(w, x, y)) {
          const [nx, ny] = wd.kant === 'oost' ? [x + 1, y] : [x, y + 1];
          assert.equal(T.kanStappen(w, x, y, nx, ny), false);
          assert.equal(T.kanStappen(w, nx, ny, x, y), false);
          wanden++;
        }
      }
    }
    assert.ok(wanden > 0);
    // de richel: elke tegel waar je kunt staan, is te halen vanaf het plein, en de weg erheen gaat over de helling
    const plein = T.pleinTegels({ wereld: w, plek: w.plekken[0] }).find((t) => T.isBegaanbaar(w, t.x, t.y));
    const richel = Object.keys(w.hoogte.niveau).map((s) => s.split(',').map(Number));
    const [rx, ry] = richel.find(([x, y]) => T.isBegaanbaar(w, x, y) && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => w.hoogte.niveau[x + a + ',' + (y + b)]));
    const pad = T.zoekRoute(w, plein, { x: rx, y: ry }, {});
    assert.ok(pad, `land ${zaad}: geen weg de richel op`);
    assert.ok(pad.some((t) => hel[t.x + ',' + t.y]), `land ${zaad}: de weg de richel op gaat over de helling`);
    let vorige = plein;
    for (const t of pad) {
      assert.ok(T.kanStappen(w, vorige.x, vorige.y, t.x, t.y), `land ${zaad}: een stap door een wand bij (${t.x}, ${t.y})`);
      vorige = t;
    }
    // zonder de hoogte was de weg korter: recht door de wand
    const recht = T.zoekPad(plein, { x: rx, y: ry }, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y), {});
    assert.ok(recht.length <= pad.length);
  }
});

// Een nieuw spel op het eiland van `zaad` met heuvels, stil en zonder venster (het lege begin, test/grond.cjs).
function spelMetHeuvels(zaad) {
  T.zetOptie('hoogte', 'heuvels');
  try {
    const { S } = grond.leegBegin(T, zaad);
    Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
    return S;
  } finally {
    T.zetOptie('hoogte', 'vlak');
  }
}

test('hoogte, bouwen: niet op steile grond, en waar het komt, wordt de grond vlak', () => {
  const S = spelMetHeuvels(5);
  const D = S.dorp;
  const w = D.wereld;
  assert.ok(w.hoogte);
  {
    // ergens is het te steil, en dat zegt het
    let steil = null;
    let vrij = null;
    const K = T.kaartVak(w);
    for (let y = K.y + 2; y < K.y + K.h - 8 && !(steil && vrij); y++) {
      for (let x = K.x + 2; x < K.x + K.b - 8 && !(steil && vrij); x++) {
        const reden = T.waaromPastHetNiet(D, 'houthakker', x, y);
        if (!steil && reden && /too steep/.test(reden)) steil = { x, y };
        if (!vrij && !reden) vrij = { x, y };
      }
    }
    assert.ok(steil, 'nergens te steil');
    assert.ok(vrij, 'nergens plaats');
    // bouwen: de voet ligt vlak, en zijn buren delen hun hoeken nog (geen wand)
    for (const [k, n] of Object.entries(T.GEBOUWEN.houthakker.kosten || {})) T.wijzigVoorraad(D, k, n + 10);
    const versie = w.hoogte.versie || 0;
    const stappen = [];
    for (let y = vrij.y - 10; y < vrij.y + 16; y++) for (let x = vrij.x - 10; x < vrij.x + 16; x++) stappen.push([x, y, T.kanStappen(w, x, y, x + 1, y) && T.kanStappen(w, x, y, x, y + 1)]);
    const r = T.plaatsGebouw(D, 'houthakker', vrij.x, vrij.y);
    assert.ok(r.gelukt, r.reden);
    assert.ok((w.hoogte.versie || 0) > versie);
    const voet = r.instantie.voet;
    const hoogten = new Set();
    for (let y = vrij.y; y < vrij.y + voet.h; y++) for (let x = vrij.x; x < vrij.x + voet.b; x++) for (const h of T.hoekHoogten(w, x, y)) hoogten.add(h);
    assert.equal(hoogten.size, 1, 'de voet ligt vlak');
    // geen nieuwe wand: wie er langs kon lopen, kan het nog
    for (const [x, y, open] of stappen) assert.equal(T.kanStappen(w, x, y, x + 1, y) && T.kanStappen(w, x, y, x, y + 1), open, `een wand bij (${x}, ${y})`);
    // het vlakke stuk wordt bewaard
    const terug = T.leesSpel(T.bewaarSpel(S)).staat;
    assert.deepEqual(terug.dorp.wereld.hoogte.vlakken[0], w.hoogte.vlakken[0]);
  }
});

// Vraag 174, stap b3 (Marcel: "Toch B2: de brug op de oevers, met de pijlers in code verlengd"): een brug ligt vlak, op
// het gemiddelde van zijn oevers; de grond van een landhoofd ligt op die hoogte, het water eronder blijft op zijn peil.
test('hoogte, bruggen: vlak op de hoogte van hun oevers, met het water op zijn peil', () => {
  const w = land(5, true);
  const hg = w.hoogte;
  const E = T.eilandVan(5);
  const eilandOp = (vx, vy) => Math.max(0, T.eilandStuk(E, vx - 0.5, vy - 0.5, 1, 1).hoogte[0]);
  const ver = (x, y) => hg.vlaktes.every((v) => Math.hypot(x - v.x, y - v.y) > 40) && hg.vlakken.every((v) => Math.max(v.x0 - x, 0, x - v.x1) > 8 || Math.max(v.y0 - y, 0, y - v.y1) > 8);
  let bekeken = 0;
  let hoger = 0;
  let nat = 0;
  E.bruggen.forEach((brug, n) => {
    const R = T.brugRijen(brug);
    const [mx, my] = T.brugTegel(brug, Math.floor(brug.L / 2), 1);
    if (!ver(mx, my)) return;
    bekeken++;
    const basis = T.brugBasis(w, n);
    // het gemiddelde van het eiland onder de twee landhoofden, en nooit onder het water eronder
    let som = 0;
    for (const i of [-1, brug.L]) for (let k = 0; k < R; k++) som += Math.max(0, T.eilandStuk(E, ...T.brugTegel(brug, i, k), 1, 1).hoogte[0]);
    let water = 0;
    for (let i = 0; i < brug.L; i++) for (let k = 0; k < R; k++) water = Math.max(water, T.eilandStuk(E, ...T.brugTegel(brug, i, k), 1, 1).hoogte[0]);
    assert.equal(basis, Math.round(Math.max(som / (2 * R), water)), `brug ${n}`);
    assert.ok(T.brugOpTil(w, n, mx, my) >= -0.5, `brug ${n} ligt niet onder het water`);
    // de landhoofden en de tegel erachter liggen vlak op de basis
    for (const i of [-2, -1, brug.L, brug.L + 1]) {
      for (let k = 0; k < R; k++) assert.deepEqual(T.hoekHoogten(w, ...T.brugTegel(brug, i, k)), [basis, basis, basis, basis], `brug ${n}, ${i} ${k}`);
    }
    // het water eronder ligt op zijn peil: de hoogte van het eiland (waar het eiland water zegt; de rand is oever)
    for (let i = 0; i < brug.L; i++) {
      for (let k = 0; k < R; k++) {
        const [x, y] = T.brugTegel(brug, i, k);
        for (const [hk, [dx, dy]] of [[0, [0, 0]], [1, [1, 0]], [2, [1, 1]], [3, [0, 1]]]) {
          const streek = T.EILAND_STREKEN[T.eilandStuk(E, x + dx - 0.5, y + dy - 0.5, 1, 1).streek[0]];
          if (!['zee', 'meer', 'rivier'].includes(streek)) continue;
          nat++;
          const h = T.hoekHoogte(w, x, y, hk);
          assert.ok(Math.abs(h - eilandOp(x + dx, y + dy)) < 1e-6, `brug ${n}: het water op (${x}, ${y}) ${h} en niet ${eilandOp(x + dx, y + dy)}`);
        }
      }
    }
    // wie erop loopt, loopt op de basis met het wegdek erboven, ook boven het water
    const p = T.naarSchermOp(w, mx, my);
    const dek = T.sprites.brugDek(brug, T.brugStap(brug, mx, my));
    assert.ok(Math.abs(p.y - (T.naarScherm(mx, my).y - basis - dek)) < 1e-6, `brug ${n}: het wegdek`);
    if (T.brugOpTil(w, n, mx, my) > 0.5) hoger++;
  });
  assert.ok(bekeken >= 5, `zoveel bruggen ver van het dorp: ${bekeken}`);
  assert.ok(hoger >= 1, 'een brug die boven het water hoger kwam te liggen');
  assert.ok(nat > 50, `zoveel hoekpunten water onder een brug: ${nat}`);
  // zonder hoogte niets: het wegdek is dat van de tekening
  const vlak = land(5, false);
  assert.equal(T.brugBasis(vlak, 0), 0);
  const [x, y] = T.brugTegel(E.bruggen[0], 0, 1);
  assert.equal(T.brugOpTil(vlak, 0, x, y), 0);
});

// Vraag 174, stap b2: een dorp dat erbij komt (T.dorpErbij, js/gebied.js), ligt ook op een vlakte, met zijn plein vlak.
test('hoogte, meer dorpen: elk dorp ligt op zijn eigen vlakte, en het eerste blijft zoals het lag', () => {
  // waar het tweede dorp komt: eerst op een spel dat de hoogte daar nog niet uitrekende
  const vers = spelMetHeuvels(5);
  const D2v = T.dorpErbij(vers);
  const plein = D2v.plek.plein;
  const cx = plein.reduce((s, p) => s + p[0], 0) / plein.length;
  const cy = plein.reduce((s, p) => s + p[1], 0) / plein.length;
  // en op een spel dat het land daar en om het eerste dorp al uitrekende: de lijsten van de stukken worden bijgewerkt
  const S = spelMetHeuvels(5);
  const w = S.dorp.wereld;
  const K = T.kaartVak(w);
  T.hoogteIn(w, Math.floor(cx) - 50, Math.floor(cy) - 50, Math.floor(cx) + 50, Math.floor(cy) + 50);
  const eerste = [];
  for (let y = K.y; y < K.y + K.h; y += 3) for (let x = K.x; x < K.x + K.b; x += 3) eerste.push(T.hoekHoogten(w, x, y).join());
  const om = (w2, doe) => {
    for (let y = Math.floor(cy) - 45; y < cy + 45; y++) for (let x = Math.floor(cx) - 45; x < cx + 45; x++) doe(x, y, T.hoekHoogten(w2, x, y));
  };
  const was = [];
  om(w, (x, y, h) => was.push(h.join()));
  const D2 = T.dorpErbij(S);
  assert.deepEqual(D2.plek.plein, plein, 'hetzelfde tweede dorp');
  const hg = w.hoogte;
  assert.equal(hg.vlaktes.length, 2);
  const v = hg.vlaktes[1];
  assert.ok(Math.abs(v.x - cx) < 1e-9 && Math.abs(v.y - cy) < 1e-9, 'de vlakte om het midden van zijn plein');
  // het plein ligt vlak, op de hoogte van de vlakte, en tot `vlakteVan` tegels ook (behalve bij het water)
  for (const [x, y] of plein) assert.deepEqual(T.hoekHoogten(w, Math.round(x), Math.round(y)), [v.h, v.h, v.h, v.h], `het plein op (${x}, ${y})`);
  let vlak = 0;
  let rond = 0;
  om(w, (x, y, h) => {
    if (Math.hypot(x - cx, y - cy) > T.HOOGTE_INSTELLINGEN.vlakteVan - 1) return;
    rond++;
    if (h.every((k) => k === v.h)) vlak++;
  });
  assert.ok(vlak / rond > 0.8, `vlak om het dorp: ${vlak} van ${rond}`);
  let anders = 0;
  let i = 0;
  om(w, (x, y, h) => {
    if (h.join() !== was[i++]) anders++;
  });
  assert.ok(anders > 1000, `het land om het tweede dorp veranderde: ${anders} tegels`);
  // bijgewerkt zoals vers uitgerekend, en het eerste dorp ligt zoals het lag
  om(w, (x, y, h) => assert.deepEqual(h, T.hoekHoogten(D2v.wereld, x, y), `tegel (${x}, ${y})`));
  i = 0;
  for (let y = K.y; y < K.y + K.h; y += 3) for (let x = K.x; x < K.x + K.b; x += 3) assert.equal(T.hoekHoogten(w, x, y).join(), eerste[i++]);
  // het wordt bewaard
  const terug = T.leesSpel(T.bewaarSpel(S)).staat;
  assert.deepEqual(terug.dorp.wereld.hoogte.vlaktes, hg.vlaktes);
});

test('hoogte, zien: een heuvel ertussen houdt het zicht tegen, en wie hoog staat, ziet verder', () => {
  const vlak = land(5, false);
  assert.equal(T.heuvelTussen(vlak, { x: 10, y: 10 }, { x: 30, y: 30 }), false);
  assert.equal(T.verderVanBoven(vlak, { x: 10, y: 10 }, { x: 30, y: 30 }), 0);
  // ergens ligt een heuvel tussen twee tegels die elkaar op een vlak land wel zagen (op eiland 5 staat het bos juist op
  // de heuvels, B2b: dan op een ander eiland)
  let w = null;
  let K = null;
  let achter = null;
  for (const zaad of [5, 1, 7]) {
    w = land(zaad, true);
    K = T.kaartVak(w);
    for (let y = K.y + 2; y < K.y + K.h - 2 && !achter; y += 3) {
      for (let x = K.x + 2; x < K.x + K.b - 14 && !achter; x += 3) {
        const a = { x, y };
        const b = { x: x + 12, y };
        if (T.zicht(w, a, b) && T.zicht(w, b, a) && T.heuvelTussen(w, a, b)) achter = [a, b];
      }
    }
    if (achter) break;
  }
  assert.ok(achter, 'nergens een heuvel ertussen');
  const [a, b] = achter;
  assert.equal(T.zichtTussen(w, a, b), false);
  assert.equal(T.zietTegel(w, a, b, 20), false);
  assert.equal(T.heuvelTussen(w, b, a), true, 'twee kanten op hetzelfde');
  // de top: wie daar staat, ziet verder naar beneden, een tegel per twee treden (op eiland 5, met hoge heuvels)
  w = land(5, true);
  K = T.kaartVak(w);
  let top = { x: K.x, y: K.y };
  let dal = { x: K.x, y: K.y };
  for (let y = K.y; y < K.y + K.h; y++) for (let x = K.x; x < K.x + K.b; x++) {
    if (T.hoogteOp(w, x, y) > T.hoogteOp(w, top.x, top.y)) top = { x, y };
    if (T.hoogteOp(w, x, y) < T.hoogteOp(w, dal.x, dal.y)) dal = { x, y };
  }
  const verder = T.verderVanBoven(w, top, dal);
  assert.ok(Math.abs(verder - (T.hoogteOp(w, top.x, top.y) - T.hoogteOp(w, dal.x, dal.y)) / 64) < 1e-9);
  assert.ok(verder >= 2);
  assert.equal(T.verderVanBoven(w, dal, top), 0, 'van beneden niet');
});

test('hoogte, afdekken: alleen een tegel die hoog genoeg ligt, dekt af wat erachter staat', () => {
  const vlak = land(5, false);
  assert.equal(T.dektAf(vlak, 40, 40), false);
  const w = land(5, true);
  const dekkers = [];
  const K = T.kaartVak(w);
  for (let y = K.y; y < K.y + K.h; y++) for (let x = K.x; x < K.x + K.b; x++) if (T.dektAf(w, x, y)) dekkers.push([x, y]);
  // de rand van de richel, niet de zachte glooiing
  assert.ok(dekkers.length > 0 && dekkers.length < K.b * K.h * 0.02, `${dekkers.length} tegels dekken af`);
  // elke tegel die afdekt, ligt hoger dan een tegel achter hem (tot twee rijen terug, zoals T.dektAf kijkt), meer dan een
  // halve tegel op het scherm (16 pixels)
  for (const [x, y] of dekkers) {
    const hoog = Math.max(...T.hoekHoogten(w, x, y));
    const achter = Math.min(...[[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]].map(([i, j]) => T.hoogteOp(w, x - i, y - j)));
    assert.ok(hoog - achter > 16, `(${x}, ${y})`);
  }
  // T.dekkersIn (voor het tekenen, vraag 174, c) geeft dezelfde tegels, rij voor rij, ook in een vak dat over stukken
  // heen loopt; op "Vlak" geen
  const gevonden = [];
  T.dekkersIn(w, K.x, K.y, K.x + K.b - 1, K.y + K.h - 1, (x, y) => gevonden.push([x, y]));
  assert.deepEqual(gevonden, dekkers);
  const [x0, y0, x1, y1] = [K.x + 30, K.y + 50, K.x + 70, K.y + 81];
  const binnen = [];
  T.dekkersIn(w, x0, y0, x1, y1, (x, y) => binnen.push([x, y]));
  assert.deepEqual(binnen, dekkers.filter(([x, y]) => x >= x0 && x <= x1 && y >= y0 && y <= y1));
  let opVlak = 0;
  T.dekkersIn(vlak, K.x, K.y, K.x + K.b - 1, K.y + K.h - 1, () => opVlak++);
  assert.equal(opVlak, 0);
});
