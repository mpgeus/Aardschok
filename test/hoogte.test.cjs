// De hoogte van het land (js/hoogte.js; werklijst vraag 121, stap 1; Marcel, 7 okt: "ik doel ook meer op heuvels in het
// landschap", en "a ja 32, b hoger"): met de spelregel "Hoogte" op "Heuvels" legt de maker hoge heuvels in het wilde
// land, een zachte glooiing en een richel bij de rotsen; vlak waar een huis, het plein of het water ligt. Op "Vlak" (de
// standaard) is er geen hoogte, en tekent en klikt alles als vroeger.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

function land(zaad, heuvels) {
  const echt = console.warn;
  console.warn = () => {};
  T.zetOptie('hoogte', heuvels ? 'heuvels' : 'vlak');
  // een land van de maker zonder het eiland: deze toetsen leggen er het plan van de maker naast (sinds 8 okt maakt een
  // nieuw spel het eiland, vraag 117; de hoogte van het eiland is stap 2b)
  T.MAKER_INSTELLINGEN.opEiland = false;
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
  let laag = Infinity;
  let hoog = -Infinity;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.b; x++) {
    const h = T.hoogteOp(a, x, y);
    laag = Math.min(laag, h);
    hoog = Math.max(hoog, h);
  }
  assert.ok(hoog - laag >= 200, `van dal tot top ${Math.round(hoog - laag)} pixels`);
  assert.ok(Object.keys(a.hoogte.niveau).length >= 12, 'een richel bij de rotsen');
  assert.ok(Object.keys(a.hoogte.hellingen).length >= 1, 'met een helling erop');
  // het landschap loopt door buiten de kaart: geen vlakke rand
  assert.notEqual(T.hoogteOp(a, -5, 40), 0);
  assert.equal(T.hoekHoogte(a, -1, 40, 1), T.hoekHoogte(a, 0, 40, 0), 'de hoek buiten de kaart past op die erbinnen');
  // wat bewaard wordt, is klein: het nummer en de vlakke stukken, niet een getal per hoekpunt
  assert.ok(JSON.stringify(a.hoogte).length < 20000);
  // een ander land is anders
  assert.notDeepEqual(T.hoekHoogten(land(7, true), 20, 20), T.hoekHoogten(a, 20, 20));
});

test('hoogte: een huis met zijn looppad ligt vlak, en het plein ook', () => {
  for (const zaad of [3, 5, 7]) {
    const w = land(zaad, true);
    const plan = T.maakGehucht(zaad);
    const lp = T.GEBOUWEN_INSTELLINGEN.looppad;
    for (const h of plan.huizen) {
      const hoogten = new Set();
      for (let y = h.y - lp; y < h.y + h.d + lp; y++) {
        for (let x = h.x - lp; x < h.x + h.b + lp; x++) for (const v of T.hoekHoogten(w, x, y)) hoogten.add(Math.round(v * 100));
      }
      assert.equal(hoogten.size, 1, `land ${zaad}: ${h.rol} op (${h.x}, ${h.y}) ligt niet vlak`);
    }
    for (const [px, py] of plan.plein) {
      const hoeken = T.hoekHoogten(w, Math.round(px), Math.round(py));
      assert.ok(Math.max(...hoeken) - Math.min(...hoeken) < 1, `land ${zaad}: het plein op (${Math.round(px)}, ${Math.round(py)})`);
    }
  }
});

test('hoogte: buren delen hun hoek, behalve waar een wand staat; een wand alleen aan de zuid- en oostkant', () => {
  const w = land(5, true);
  let wanden = 0;
  for (let y = 0; y < w.h - 1; y++) {
    for (let x = 0; x < w.b - 1; x++) {
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
  for (let y = 5; y < w.h - 5; y += 3) {
    for (let x = 5; x < w.b - 5; x += 3) {
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
  for (let y = 0; y < w.h; y += 7) {
    for (let x = 0; x < w.b; x += 7) {
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
  for (const zaad of [3, 5, 7]) {
    const w = land(zaad, true);
    const hel = w.hoogte.hellingen;
    // waar een wand staat, kun je er niet langs, van geen van beide kanten
    let wanden = 0;
    for (let y = 1; y < w.h - 1; y++) {
      for (let x = 1; x < w.b - 1; x++) {
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
    const plein = T.pleinTegels(w).find((t) => T.isBegaanbaar(w, t.x, t.y));
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

// Een nieuw spel op land `zaad` van de maker met heuvels, stil en zonder venster (zoals test/bouwstijl.test.cjs).
function spelMetHeuvels(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  const opEiland = T.MAKER_INSTELLINGEN.opEiland;
  T.MAKER_INSTELLINGEN.opEiland = false;
  T.zetOptie('hoogte', 'heuvels');
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    T.zetOptie('hoogte', 'vlak');
    T.MAKER_INSTELLINGEN.opEiland = opEiland;
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
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
    for (let y = 2; y < w.h - 8 && !(steil && vrij); y++) {
      for (let x = 2; x < w.b - 8 && !(steil && vrij); x++) {
        const reden = T.waaromPastHetNiet(D, 'houthakker', x, y);
        if (!steil && reden && /te steil/.test(reden)) steil = { x, y };
        if (!vrij && !reden) vrij = { x, y };
      }
    }
    assert.ok(steil, 'nergens te steil');
    assert.ok(vrij, 'nergens plaats');
    // een erf ook niet
    let erfSteil = false;
    for (let y = 2; y < w.h - 12 && !erfSteil; y += 2) for (let x = 2; x < w.b - 12 && !erfSteil; x += 2) erfSteil = /te steil/.test(T.waaromPastErfNiet(D, x, y) || '');
    assert.ok(erfSteil, 'nergens te steil voor een erf');
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

test('hoogte, zien: een heuvel ertussen houdt het zicht tegen, en wie hoog staat, ziet verder', () => {
  const vlak = land(5, false);
  assert.equal(T.heuvelTussen(vlak, { x: 10, y: 10 }, { x: 30, y: 30 }), false);
  assert.equal(T.verderVanBoven(vlak, { x: 10, y: 10 }, { x: 30, y: 30 }), 0);
  const w = land(5, true);
  // ergens ligt een heuvel tussen twee tegels die elkaar op een vlak land wel zagen
  let achter = null;
  for (let y = 2; y < w.h - 2 && !achter; y += 3) {
    for (let x = 2; x < w.b - 14 && !achter; x += 3) {
      const a = { x, y };
      const b = { x: x + 12, y };
      if (T.zicht(w, a, b) && T.zicht(w, b, a) && T.heuvelTussen(w, a, b)) achter = [a, b];
    }
  }
  assert.ok(achter, 'nergens een heuvel ertussen');
  const [a, b] = achter;
  assert.equal(T.zichtTussen(w, a, b), false);
  assert.equal(T.zietTegel(w, a, b, 20), false);
  assert.equal(T.heuvelTussen(w, b, a), true, 'twee kanten op hetzelfde');
  // de top: wie daar staat, ziet verder naar beneden, een tegel per twee treden
  let top = { x: 0, y: 0 };
  let dal = { x: 0, y: 0 };
  for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) {
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
  for (let y = 0; y < w.h; y++) for (let x = 0; x < w.b; x++) if (T.dektAf(w, x, y)) dekkers.push([x, y]);
  // de rand van de richel, niet de zachte glooiing
  assert.ok(dekkers.length > 0 && dekkers.length < w.b * w.h * 0.02, `${dekkers.length} tegels dekken af`);
  // elke tegel die afdekt, ligt hoger dan een tegel achter hem, meer dan een halve tegel op het scherm (16 pixels)
  for (const [x, y] of dekkers) {
    const hoog = Math.max(...T.hoekHoogten(w, x, y));
    const achter = Math.min(T.hoogteOp(w, x - 1, y), T.hoogteOp(w, x, y - 1), T.hoogteOp(w, x - 1, y - 1));
    assert.ok(hoog - achter > 16, `(${x}, ${y})`);
  }
});
