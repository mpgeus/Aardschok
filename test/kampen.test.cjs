// De roverskampen (werklijst vraag 170, stap 6a2, c1; Marcel, 17 okt: "V2 G2 P1 B1", "M1"): het eiland legt er drie,
// in het woud, ver van de dorpsplekken, de stad, het kasteel, de wegen en elkaar (js/eiland.js, legKampen), elk met een
// open plek om het vuur en een paadje naar de dichtste weg (P1). In het spel staat een kamp er als het land eromheen
// opengaat (T.zetRoverskampenBij, js/rovers.js): een tent per twee man en het vuur, en de kaart onthoudt het (w.kampen).
// In c2 heeft elk kamp zijn bende vanaf het begin (twee man, een erbij per jaar tot vier, en wie wegtrekt), en staan de
// mannen om hun vuur; in de nacht slapen ze in hun tent, op een na (N1).
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

// Opent het land om kamp k (zoals Spel.debug.kampen('erheen')), en geeft zijn kamp op de kaart.
function openKamp(S, w, k) {
  const r = K().open;
  T.openVak(w, { x: k.x - r, y: k.y - r, b: 2 * r + 1, h: 2 * r + 1 });
  T.wereldTik(S);
  return w.kampen.find((q) => q.nr === k.nr);
}
const mannenVan = (w, nr) => w.wezens.filter((e) => e.kamp === nr && e.rover && !e.dood);
// Het lege begin, met wat het scherm erbij zet (zwevende tekst, de vlaggen), na de eerste tik: dan kent de kaart zijn
// kampen.
function nieuwSpel() {
  const uit = leegBegin(T);
  Object.assign(uit.S, { vlaggen: new Set() }, T.schermVelden());
  T.wereldTik(uit.S);
  return uit;
}

test('roverskampen: in het spel staat een kamp er als zijn land opengaat, en de kaart onthoudt het', () => {
  const { S, w } = nieuwSpel();
  const E = T.eilandVan(w.eiland.zaad);
  const R = T.ROVERS_INSTELLINGEN;
  // c2: de kaart kent alle kampen vanaf het begin, elk met zijn bende, ook waar het land nog dicht is
  assert.deepEqual(w.kampen.map((q) => [q.nr, q.x, q.y, q.staat]), E.kampen.map((k) => [k.nr, k.x, k.y, false]));
  for (const q of w.kampen) {
    assert.equal(q.bende.length, R.kampBende, `kamp ${q.nr} begint met twee man`);
    assert.ok(q.bende.every((l) => l.naam && l.vel && l.uit === null), 'van buiten, met een naam en een uiterlijk');
  }
  assert.ok(!w.voorwerpen.some((v) => v.kamp != null));
  assert.equal(w.wezens.filter((e) => e.kamp != null).length, 0, 'en geen mannen op de kaart');
  const k = E.kampen[0];
  const kamp = openKamp(S, w, k);
  assert.equal(kamp.staat, true);
  const tenten = w.voorwerpen.filter((v) => v.soort === 'tent' && v.kamp === k.nr);
  assert.equal(tenten.length, Math.ceil(R.kampBende / R.manPerTent), 'een tent per twee man');
  assert.equal(kamp.tenten, tenten.length);
  assert.ok(tenten.every((v) => v.vorm === 'tent-rover'));
  const vuur = w.voorwerpen.filter((v) => v.soort === 'kampvuur' && v.kamp === k.nr);
  assert.equal(vuur.length, 1);
  assert.deepEqual([vuur[0].x, vuur[0].y], [k.x, k.y]);
  assert.ok(!T.isBegaanbaar(w, tenten[0].x, tenten[0].y), 'een tent staat in de weg');
  // de mannen: rovers van geen dorp, elk op zijn eigen plek om het vuur, met zijn gezicht ernaartoe
  const mannen = mannenVan(w, k.nr);
  assert.equal(mannen.length, R.kampBende);
  for (const e of mannen) {
    const lid = T.lidVan(w, e);
    assert.ok(lid, 'hij is van de bende');
    assert.equal(e.dorp, undefined, 'van geen dorp');
    assert.equal(e.kant, 'monster');
    const d = Math.hypot(e.tx - k.x, e.ty - k.y);
    assert.ok(d >= R.rondHetVuur[0] && d <= R.rondHetVuur[1], `${lid.naam} staat ${d.toFixed(1)} tegels van het vuur`);
    assert.deepEqual([e.tx, e.ty], [lid.plek.x, lid.plek.y]);
    assert.deepEqual(e.kijkt, { x: k.x, y: k.y });
  }
  assert.ok(mannen[0].tx !== mannen[1].tx || mannen[0].ty !== mannen[1].ty, 'niet op dezelfde plek');
  // nog een tik: er komt niets bij
  T.wereldTik(S);
  assert.equal(w.voorwerpen.filter((v) => v.kamp === k.nr).length, tenten.length + 1);
  assert.equal(mannenVan(w, k.nr).length, R.kampBende);
  // bewaard en geladen: het kamp staat er nog, één keer, met dezelfde mannen
  const S2 = {};
  const uit = T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 }));
  assert.ok(uit.gelukt, uit.reden);
  T.wereldTik(S2);
  T.wereldTik(S);
  assert.deepEqual(S2.wereld.kampen, w.kampen);
  assert.equal(S2.wereld.voorwerpen.filter((v) => v.kamp === k.nr).length, tenten.length + 1);
  assert.deepEqual(mannenVan(S2.wereld, k.nr).map((e) => [e.lid, e.tx, e.ty]), mannenVan(w, k.nr).map((e) => [e.lid, e.tx, e.ty]));
  // het vuur brandt in het donker, en geeft dan licht; overdag smeult het; alleen een kamp dat er staat
  const dag = Math.floor(S.kalender.dag);
  assert.equal(T.roverskampVuur(dag + 23 / 24), 'brandt');
  assert.equal(T.roverskampVuur(dag + 12 / 24), 'smeult');
  assert.equal(T.roverskampenLicht(w, dag + 23 / 24).length, 1);
  assert.equal(T.roverskampenLicht(w, dag + 12 / 24).length, 0);
});

// c2 (Marcel, 17 okt: H2): elk jaar van het spel komt er van buiten een bij, tot vier; wie uit een dorp wegtrekt, komt er
// altijd bij, ook boven de vier; en een tent per twee man, tot de plekken die het eiland geeft.
test('roverskampen: een man erbij per jaar tot vier, wie wegtrekt ook daarboven, en een tent per twee man (c2)', () => {
  const { S, D, w } = nieuwSpel();
  const R = T.ROVERS_INSTELLINGEN;
  const k = T.eilandVan(w.eiland.zaad).kampen[0];
  const kamp = openKamp(S, w, k);
  const jaar = (n) => {
    S.kalender.dag = n * T.DAGEN_PER_JAAR + 0.5;
    T.werkKampenBij(S, w);
  };
  const ander = w.kampen.find((q) => q !== kamp);
  jaar(1);
  assert.equal(kamp.bende.length, R.kampBende + 1, 'na een jaar een erbij');
  assert.equal(ander.bende.length, R.kampBende + 1, 'ook in een kamp dat nog niemand zag');
  assert.equal(kamp.tenten, 2, 'de derde man krijgt de tweede tent');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent' && v.kamp === k.nr).length, 2);
  // de nieuwe komt over het paadje het kamp in, aan de rand van de open plek
  const nieuw = mannenVan(w, k.nr).find((e) => e.lid === kamp.bende[2].id);
  assert.ok(nieuw, 'hij is op de kaart');
  assert.ok(Math.hypot(nieuw.tx - k.x, nieuw.ty - k.y) >= K().open - 2.5, 'aan de rand van de open plek');
  jaar(2);
  jaar(3);
  assert.equal(kamp.bende.length, R.kampMeest, 'tot vier');
  assert.equal(ander.bende.length, R.kampMeest);
  // wie wegtrekt, gaat naar het dichtste kamp, ook boven de vier
  const plein = T.pleinVan(D);
  const dichtst = w.kampen.slice().sort((a, b) => T.afstand(a, plein) - T.afstand(b, plein))[0];
  const p = { id: 1, naam: 'Wat', leeftijd: 'volwassen', geslacht: 'man', wezen: null };
  assert.equal(T.wordtRover(D, p), dichtst);
  assert.equal(dichtst.bende.length, R.kampMeest + 1);
  assert.deepEqual(dichtst.bende[dichtst.bende.length - 1], { id: R.kampMeest, naam: 'Wat', vel: T.LEEFTIJDEN.volwassen.man, uit: D.plek.naam });
  assert.equal(T.wordtRover(D, { ...p, leeftijd: 'oud' }), null, 'een oude wordt geen rover');
  // tot zes tenten, een per twee man
  for (let i = 0; i < 9; i++) kamp.bende.push({ id: 100 + i, naam: `Rover ${i}`, vel: T.LEEFTIJDEN.jong.man, uit: null });
  for (let i = 0; i < 3; i++) T.werkKampenBij(S, w);
  assert.equal(kamp.tenten, Math.min(k.tenten.length, Math.ceil(kamp.bende.length / R.manPerTent)), 'zoveel tenten als er plek is');
  assert.equal(mannenVan(w, k.nr).length, kamp.bende.length, 'iedereen staat er');
});

// N1 (Marcel, 17 okt): 's nachts slapen ze in hun tent, op één na, die bij het vuur waakt; heeft een van hen een vijand,
// dan komt iedereen naar buiten.
test('roverskampen: in de nacht slapen ze in hun tent, op één na die waakt, en een vijand maakt ze wakker (N1)', () => {
  const { S, D, w } = nieuwSpel();
  const k = T.eilandVan(w.eiland.zaad).kampen[0];
  openKamp(S, w, k);
  const loop = (seconden) => {
    for (let i = 0; i < seconden / T.TIK; i++) {
      S.tijd += T.TIK;
      S.wereldTijd += T.TIK;
      T.werkKampenBij(S, w);
      T.beweegWezens(S, w, T.TIK, T.TIK);
    }
  };
  const dag = Math.floor(S.kalender.dag) + 1;
  S.kalender.dag = dag + 2 / 24; // twee uur 's nachts
  loop(15);
  const mannen = mannenVan(w, k.nr);
  assert.equal(mannen.filter((e) => e.binnen).length, mannen.length - 1, 'op één na in de tent');
  const wacht = mannen.find((e) => !e.binnen);
  assert.deepEqual([wacht.tx, wacht.ty], [T.lidVan(w, wacht).plek.x, T.lidVan(w, wacht).plek.y], 'de wacht staat bij het vuur');
  for (const e of mannen.filter((x) => x.binnen)) assert.ok(T.afstand(T.tegelVan(e), k.tenten[0].deur) <= 1, 'bij de deur van zijn tent');
  // een vijand: iedereen naar buiten
  wacht.doelwit = D.aanvoerder;
  loop(1);
  assert.equal(mannen.filter((e) => e.binnen).length, 0, 'iedereen is wakker');
  delete wacht.doelwit;
  S.kalender.dag += (T.ROVERS_INSTELLINGEN.wakkerUren + 0.5) / 24;
  loop(15);
  assert.equal(mannen.filter((e) => e.binnen).length, mannen.length - 1, 'een uur later slapen ze weer');
  // overdag staat iedereen op zijn plek, met zijn gezicht naar het vuur
  S.kalender.dag = dag + 12 / 24;
  loop(15);
  for (const e of mannen) {
    assert.ok(!e.binnen);
    assert.deepEqual([e.tx, e.ty], [T.lidVan(w, e).plek.x, T.lidVan(w, e).plek.y]);
  }
});

test('roverskampen: wie van een kamp valt, is uit zijn bende, en een kamp ver weg houdt niemand binnen', () => {
  const { S, D, w } = nieuwSpel();
  const k = T.eilandVan(w.eiland.zaad).kampen[0];
  const kamp = openKamp(S, w, k);
  const [e] = mannenVan(w, k.nr);
  assert.ok(!T.hoortBij(D, e), 'hij hoort bij geen dorp');
  const id = e.lid;
  T.raak(S, D, e, 100, null);
  assert.ok(e.dood);
  assert.ok(!kamp.bende.some((l) => l.id === id), 'uit de bende');
  assert.equal(kamp.bende.length, T.ROVERS_INSTELLINGEN.kampBende - 1);
  // een dorpeling die schuilt, komt naar buiten: er is geen rover in het land van het dorp, alleen in het kamp
  const p = D.bewoners.mensen.find((x) => x.wezen);
  p.schuilt = { x: 0, y: 0 };
  D.schuilen = true;
  T.werkGevechtBij(S, D);
  assert.equal(D.schuilen, false);
  assert.equal(p.schuilt, undefined);
});

// A1, zoals het wild: een kamp gooit met zijn eigen dobbelsteen, dus wat het doet, verandert niets aan het dorp.
test('roverskampen: een kamp met zijn mannen verandert niets aan wat het dorp gooit', () => {
  const spel = (open) => {
    const { S, D, w } = nieuwSpel();
    if (open) openKamp(S, w, T.eilandVan(w.eiland.zaad).kampen[0]);
    else T.wereldTik(S);
    for (let i = 0; i < 600; i++) T.wereldTik(S);
    return { lot: JSON.stringify(D.lot), kampen: w.kampen.map((q) => q.bende.map((l) => l.naam)) };
  };
  const met = spel(true);
  const zonder = spel(false);
  assert.equal(met.lot, zonder.lot, 'de dobbelsteen van het dorp');
  assert.deepEqual(met.kampen, zonder.kampen, 'dezelfde mannen, met of zonder dat je ze zag');
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
