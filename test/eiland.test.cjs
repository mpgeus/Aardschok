// Het eiland, de kaartenmaker (js/eiland.js; werklijst vraag 117, stap 1; Marcel, 8 okt: "Ik wil 1 aaneengesloten
// landschap", "B 1", en "ja begin met de plaat"): uit één nummer een eiland met water rondom, een bergrug met passen,
// rivieren die in zee uitkomen, de streken, het kasteel, de stad en de dorpen, en de wegen ertussen. Hetzelfde nummer
// geeft hetzelfde eiland, en een stuk van het eiland is hetzelfde, hoe je het ook vraagt: zo kan het spel het land later
// maken aan de rand van de mist.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const T = require('./laad.cjs').spel();

const eilanden = new Map();
const eiland = (zaad) => {
  if (!eilanden.has(zaad)) eilanden.set(zaad, T.maakEiland(zaad));
  return eilanden.get(zaad);
};
const ZADEN = [5, 62707];

test('eiland: hetzelfde nummer geeft hetzelfde eiland, een ander nummer een ander', () => {
  const a = eiland(5);
  const b = T.maakEiland(5);
  for (const veld of ['hoogte', 'zee', 'afvoer', 'stroomPeil', 'meer', 'streek']) assert.deepEqual(b[veld], a[veld], veld);
  assert.deepEqual(b.plekken, a.plekken);
  assert.deepEqual(b.wegen, a.wegen);
  assert.deepEqual(b.rivieren, a.rivieren);
  const c = eiland(62707);
  assert.notDeepEqual(c.hoogte, a.hoogte);
  assert.notDeepEqual(c.plekken, a.plekken);
});

test('eiland: water rondom, en het land is één groot eiland met de bergrug', () => {
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const n = E.n;
    for (let i = 0; i < n; i++) {
      for (const k of [i, (n - 1) * n + i, i * n, i * n + n - 1]) assert.equal(E.zee[k], 1, `de rand is zee (land ${zaad})`);
    }
    let land = 0;
    let hoofd = 0;
    let hoogst = 0;
    for (let k = 0; k < n * n; k++) {
      if (!E.zee[k]) land++;
      if (E.hoofdland[k]) hoofd++;
      if (E.hoogte[k] > hoogst) hoogst = E.hoogte[k];
    }
    assert.ok(land > 0.3 * n * n && land < 0.75 * n * n, `land ${zaad}: ${Math.round((land / n / n) * 100)}% land`);
    assert.ok(hoofd > 0.9 * land, `land ${zaad}: het hoofdland is bijna al het land`);
    // de bergrug (Marcel: "B 1"): hoog, met passen
    assert.ok(hoogst > 800, `land ${zaad}: het hoogste punt is ${Math.round(hoogst)} pixels`);
    assert.ok(E.vorm.passen.length >= 2);
  }
});

test('eiland: het water stroomt naar zee, en nooit omhoog', () => {
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const n = E.n;
    let rivieren = 0;
    for (let k = 0; k < n * n; k++) {
      if (E.zee[k]) continue;
      // elk vak heeft een weg naar zee, en het water zakt of blijft gelijk
      let v = k;
      let stappen = 0;
      while (!E.zee[v]) {
        const a = E.afwaarts[v];
        assert.ok(a >= 0, `land ${zaad}: vak ${v} stroomt ergens heen`);
        if (!E.zee[a]) assert.ok(E.stroomPeil[a] <= E.stroomPeil[v] + 1e-3, `land ${zaad}: het water stroomt niet omhoog bij vak ${v}`);
        v = a;
        assert.ok(++stappen < n * n);
      }
      if (E.rivier[k]) rivieren++;
    }
    assert.ok(rivieren > 0);
    assert.ok(E.rivieren.some((r) => r.zee), `land ${zaad}: er komen rivieren in zee uit`);
    // een rivier eindigt in zee of op een andere rivier
    const begins = new Set(E.rivieren.map((r) => r.punten[0].slice(0, 2).join(',')));
    for (const r of E.rivieren) {
      const eind = r.punten[r.punten.length - 1];
      assert.ok(r.zee || begins.has(eind.slice(0, 2).join(',')), `land ${zaad}: een rivier stopt nergens`);
    }
    // de meren: niet te veel, en elk met zijn peil
    assert.ok(E.meren.length <= T.EILAND_INSTELLINGEN.meer.aantal);
    for (const m of E.meren) assert.ok(m.vakken > 0 && m.peil > 0);
  }
});

test('eiland: het kasteel, de stad en de dorpen, en de wegen brengen je overal', () => {
  const P = T.EILAND_INSTELLINGEN.plekken;
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const n = E.n;
    const vak = (p) => Math.floor(p.y / E.vak) * n + Math.floor(p.x / E.vak);
    const soorten = E.plekken.map((p) => p.soort);
    assert.equal(soorten.filter((s) => s === 'kasteel').length, 1, `land ${zaad}: een kasteel`);
    assert.equal(soorten.filter((s) => s === 'stad').length, 1, `land ${zaad}: een stad`);
    const dorpen = E.plekken.filter((p) => p.soort === 'dorp');
    assert.ok(dorpen.length >= 6, `land ${zaad}: ${dorpen.length} dorpen`);
    assert.equal(dorpen.filter((d) => d.jij).length, 1, `land ${zaad}: één dorp is van jou`);
    for (const p of E.plekken) {
      const k = vak(p);
      assert.ok(E.hoofdland[k] && !E.zee[k] && E.meer[k] < 0 && !E.rivier[k], `land ${zaad}: ${p.soort} ${p.naam || ''} ligt droog op het land`);
    }
    for (let i = 0; i < dorpen.length; i++) {
      for (let j = i + 1; j < dorpen.length; j++) {
        const d = Math.sqrt((dorpen[i].x - dorpen[j].x) ** 2 + (dorpen[i].y - dorpen[j].y) ** 2);
        assert.ok(d > P.afstand * 0.4, `land ${zaad}: ${dorpen[i].naam} en ${dorpen[j].naam} liggen ${Math.round(d)} tegels uit elkaar`);
      }
    }
    // de wegen: alles hangt aan elkaar, en elke plek ligt aan een weg
    const sleutel = (q) => Math.round(q[0]) + ',' + Math.round(q[1]);
    const ouder = new Map();
    const wortel = (a) => {
      while (ouder.get(a) !== a) a = ouder.get(a);
      return a;
    };
    const voeg = (a, b) => {
      for (const x of [a, b]) if (!ouder.has(x)) ouder.set(x, x);
      ouder.set(wortel(a), wortel(b));
    };
    for (const w of E.wegen) voeg(sleutel(w.punten[0]), sleutel(w.punten[w.punten.length - 1]));
    const aan = E.plekken.map((p) => {
      const midden = [Math.floor(p.x / E.vak) * E.vak + E.vak / 2, Math.floor(p.y / E.vak) * E.vak + E.vak / 2];
      return sleutel(midden);
    });
    for (const [i, s] of aan.entries()) assert.ok(ouder.has(s), `land ${zaad}: ${E.plekken[i].soort} ${E.plekken[i].naam || ''} ligt aan een weg`);
    const een = wortel(aan[0]);
    for (const s of aan) assert.equal(wortel(s), een, `land ${zaad}: over de weg kom je overal`);
  }
});

test('eiland: jouw dorp ligt waar een dorp kan groeien, en niet achter een berg (vraag 117, C)', () => {
  const P = T.EILAND_INSTELLINGEN.plekken;
  for (const zaad of ZADEN) {
    const E = eiland(zaad);
    const n = E.n;
    const jij = E.plekken.find((p) => p.jij);
    const x = Math.floor(jij.x / E.vak);
    const y = Math.floor(jij.y / E.vak);
    const k = y * n + x;
    assert.ok(E.geschikt[k] >= 0, `land ${zaad}: ${jij.naam} kan groeien`);
    // naar de camera toe (waar x en y groter worden) rijst het land niet hoger op dan de grens
    for (let s = 1; s <= Math.round(P.cameraVer / E.vak); s++) {
      if (x + s < n && y + s < n) assert.ok(E.hoogte[(y + s) * n + x + s] - E.hoogte[k] <= P.camera, `land ${zaad}: geen berg voor ${jij.naam}`);
    }
    // vlak, en droog in het midden
    const D = T.eilandStuk(E, Math.round(jij.x) - 8, Math.round(jij.y) - 8, 17, 17);
    for (let i = 0; i < D.streek.length; i++) assert.ok(!['zee', 'meer', 'rivier'].includes(T.EILAND_STREKEN[D.streek[i]]), `land ${zaad}: het midden van ${jij.naam} is droog`);
  }
});

test('eiland: een stuk is hetzelfde, hoe je het ook vraagt (voor het land aan de rand van de mist)', () => {
  const E = eiland(5);
  const jij = E.plekken.find((p) => p.jij);
  const x0 = Math.round(jij.x) - 30;
  const y0 = Math.round(jij.y) - 30;
  const groot = T.eilandStuk(E, x0, y0, 60, 60);
  const klein = T.eilandStuk(E, x0 + 17, y0 + 23, 12, 9);
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 12; x++) {
      const g = (y + 23) * 60 + x + 17;
      const k = y * 12 + x;
      assert.equal(klein.hoogte[k], groot.hoogte[g]);
      assert.equal(klein.streek[k], groot.streek[g]);
      assert.equal(klein.weg[k], groot.weg[g]);
      assert.equal(klein.boom[k], groot.boom[g]);
    }
  }
  // en een stuk om de twee tegels is wat de tegels zelf zijn
  const om2 = T.eilandStuk(E, x0, y0, 30, 30, 2);
  assert.equal(om2.streek[5 * 30 + 7], groot.streek[10 * 60 + 14]);
  assert.equal(om2.hoogte[5 * 30 + 7], groot.hoogte[10 * 60 + 14]);
});

test('eiland: alleen rekenen dat in elke browser hetzelfde uitkomt (geen sinus, macht of hypot)', () => {
  const bron = fs.readFileSync(path.join(__dirname, '..', 'js', 'eiland.js'), 'utf8').replace(/\/\/.*$/gm, '');
  for (const verboden of [/Math\.(sin|cos|tan|asin|acos|atan|atan2|pow|exp|log|log2|log10|hypot|cbrt|random)\b/, /\*\*/]) {
    assert.doesNotMatch(bron, verboden);
  }
});

// ---- stap 2: je dorp op het eiland (Marcel, 8 okt: "a1", en "A ja B later C dorp dat er al was") ----

// Het eiland is de standaard; dit hulpje zegt het in de toets erbij, voor wie hem leest.
function opEiland(f) {
  assert.equal(T.MAKER_INSTELLINGEN.opEiland, true);
  return f();
}
function nieuwSpel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

test('je dorp op het eiland: elk nieuw spel maakt het eiland, zonder keuze; zonder land legt de maker zoals altijd', () => {
  // Marcel, 8 okt: "Het eiland wordt gewoon altijd gegenereerd bij een nieuw spel. Ergens op dat eiland staat je gehucht."
  const o = T.OPTIES.find((x) => x.id === 'gehucht');
  assert.equal(o.standaard, 'eiland');
  assert.equal(o.voorProeven, true);
  assert.equal(T.MAKER_INSTELLINGEN.opEiland, true);
  // zonder land weet het gehucht van de maker niets van het eiland
  const plan = T.maakGehucht(5);
  assert.equal(plan.eiland, undefined);
  assert.equal(plan.bruggen, undefined);
});

test('je dorp op het eiland: het water en de wegen zijn die van het eiland, en het gehucht deugt', () => {
  for (const zaad of [5, 62707]) {
    const E = eiland(zaad);
    const jij = E.plekken.find((p) => p.jij);
    const land = T.landVanEiland(E, jij, 100, 100);
    const plan = T.maakGehucht(zaad, land, 30); // gooit een fout als geen poging deugt
    assert.deepEqual(plan.eiland, { zaad, x0: land.x0, y0: land.y0 });
    // het water: elk hoekpunt water waar het eiland water is, en nergens anders
    for (let y = 0; y <= 100; y++) {
      for (let x = 0; x <= 100; x++) {
        const nat = ['zee', 'meer', 'rivier'].includes(land.hoek(x, y));
        assert.equal(plan.grond[y][x] === 'w', nat, `land ${zaad}: hoekpunt (${x}, ${y})`);
      }
    }
    // de uitgang ligt aan de rand, bij een plek waar een weg van het eiland het land verlaat
    const u = plan.uitgang;
    assert.ok(u.x === 0 || u.y === 0 || u.x === 99 || u.y === 99, `land ${zaad}: de uitgang (${u.x}, ${u.y}) ligt aan de rand`);
    assert.ok(land.uitgangen.some((v) => Math.abs(v.x - u.x) + Math.abs(v.y - u.y) <= 24), `land ${zaad}: de uitgang ligt aan een weg van het eiland`);
    // een bruggetje ligt over het water, recht, in zijn richting
    for (const b of plan.bruggen) {
      for (const t of b.tegels) assert.ok(['w'].includes(plan.grond[t.y][t.x]) || ['w'].includes(plan.grond[t.y + 1][t.x + 1]), `land ${zaad}: een bruggetje over water`);
      assert.ok(b.tegels.every((t) => (b.as === 'x' ? t.y === b.tegels[0].y : t.x === b.tegels[0].x)), `land ${zaad}: een recht bruggetje`);
    }
  }
});

test('een nieuw spel op het eiland: je dorp op jouw plek, 26 mensen, en bewaren en laden geeft hetzelfde spel', () => {
  opEiland(() => {
    const S = nieuwSpel(5);
    assert.equal(S.wereld.eiland.zaad, 5);
    assert.equal(S.wereld.eiland.dorp, eiland(5).plekken.find((p) => p.jij).naam);
    assert.equal(S.wereld.maker.zaad, 5);
    assert.equal(S.dorp.bevolking, 26);
    const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
    const S2 = nieuwSpel(3);
    const r = T.herstelSpel(S2, tekst);
    assert.equal(r.gelukt, true, r.reden);
    assert.deepEqual(S2.wereld.eiland, S.wereld.eiland);
    assert.equal(T.bewaarSpel(S2, { nu: 1790000000000 }), tekst);
  });
});

test('het eiland om je land: buiten de kaart de grond en de bomen van het eiland, en aan de naad past elke tegel (vraag 117, 2b)', () => {
  const echt = console.warn;
  console.warn = () => {};
  try {
    for (const zaad of [1, 5]) {
      const w = T.laadGemaaktGehucht(zaad);
      const R = T.randVanHetEiland(w);
      assert.equal(T.randVanHetEiland(w), R, 'één keer per kaart');
      const D = R.diep;
      const n = w.b + 2 * D + 1;
      const punten = T.eilandStuk(T.eilandVan(zaad), w.eiland.x0 - D - 0.5, w.eiland.y0 - D - 0.5, n, w.h + 2 * D + 1);
      const streek = (vx, vy) => T.EILAND_STREKEN[punten.streek[(vy + D) * n + vx + D]];
      const ring = (vx, vy) => Math.max(-vx, -vy, vx - w.b, vy - w.h);
      const hoek = (vx, vy) => R.hoek(vx, vy) || T.sprites.grondHoekOp(w, vx, vy);
      let water = 0;
      for (let vy = -D; vy <= w.h + D; vy++) {
        for (let vx = -D; vx <= w.b + D; vx++) {
          const opKaart = ring(vx, vy) <= 0;
          assert.equal(R.hoek(vx, vy) === null, opKaart, `land ${zaad}: (${vx}, ${vy}) op de kaart heeft de rand niets`);
          if (opKaart) continue;
          const nat = T.grondVanStreek(streek(vx, vy)) === 'w';
          if (R.hoek(vx, vy) === 'water') water++;
          // water waar het eiland water is, en nergens anders (op de naad mag het gras worden)
          if (R.hoek(vx, vy) === 'water') assert.ok(nat, `land ${zaad}: water op (${vx}, ${vy}) waar het eiland droog is`);
          else if (ring(vx, vy) >= 2) assert.ok(!nat, `land ${zaad}: geen water op (${vx}, ${vy}) waar het eiland water is`);
        }
      }
      let dingen = 0;
      for (let y = -D; y < w.h + D; y++) {
        for (let x = -D; x < w.b + D; x++) {
          if (x >= 0 && y >= 0 && x < w.b && y < w.h) continue;
          // elke tegel om de kaart heeft een tegel in tegels/rand.tsx: één soort grond, of gras met één andere
          const soorten = [...new Set([hoek(x, y), hoek(x + 1, y), hoek(x + 1, y + 1), hoek(x, y + 1)])];
          assert.ok(soorten.length === 1 || (soorten.length === 2 && soorten.includes('gras')), `land ${zaad}: tegel (${x}, ${y}) is ${soorten}`);
          // een boom of een rots staat op gras
          if (R.voorwerp(x, y)) {
            dingen++;
            assert.deepEqual(soorten, ['gras'], `land ${zaad}: ${R.voorwerp(x, y)} op (${x}, ${y}) staat op ${soorten}`);
          }
        }
      }
      if (zaad === 1) assert.ok(water > 2000, `land 1 ligt aan zee (${water} hoekpunten water om de kaart)`);
      if (zaad === 5) assert.ok(dingen > 2000, `land 5 ligt in het bos (${dingen} bomen en rotsen om de kaart)`);
    }
  } finally {
    console.warn = echt;
  }
});

test('het eiland om je land: met "Hoogte" op "Heuvels" is het land dat van het eiland, en het dorp ligt vlak (vraag 117, 2b)', () => {
  const echt = console.warn;
  console.warn = () => {};
  T.zetOptie('hoogte', 'heuvels');
  try {
    const w = T.laadGemaaktGehucht(5);
    const hg = w.hoogte;
    assert.deepEqual(hg.eiland, { zaad: 5, x0: w.eiland.x0, y0: w.eiland.y0 });
    const E = T.eilandVan(5);
    const eilandOp = (vx, vy) => Math.max(0, T.eilandStuk(E, w.eiland.x0 + vx - 0.5, w.eiland.y0 + vy - 0.5, 1, 1).hoogte[0]);
    // ver van het dorp en van elk vlak stuk: precies de hoogte van het eiland, ook om de kaart
    const T_ = T.HOOGTE_INSTELLINGEN;
    let gekeken = 0;
    for (const [x, y] of [[-12, -12], [-12, 110], [110, 50], [50, -14], [-30, 40], [120, 120]]) {
      const vrij = hg.vlakken.every((v) => Math.max(v.x0 - x, 0, x - v.x1) >= T_.vrijRond || Math.max(v.y0 - y, 0, y - v.y1) >= T_.vrijRond);
      if (!vrij || Math.hypot(x - hg.midden[0], y - hg.midden[1]) < T_.vlakteTot) continue;
      gekeken++;
      assert.ok(Math.abs(T.hoekHoogte(w, x, y, 0) - eilandOp(x, y)) < 1e-6, `(${x}, ${y}): ${T.hoekHoogte(w, x, y, 0)} en niet ${eilandOp(x, y)}`);
    }
    assert.ok(gekeken >= 3, `zoveel hoekpunten ver van het dorp: ${gekeken}`);
    // het plein ligt vlak, op de hoogte van het dorp, en dat is die van het eiland op het midden van het plein
    const plein = hg.vlakken[0];
    assert.equal(plein.h, hg.dorpHoogte);
    assert.equal(hg.dorpHoogte, Math.round(eilandOp(hg.midden[0], hg.midden[1])));
    for (let y = Math.ceil(plein.y0); y < plein.y1; y++) for (let x = Math.ceil(plein.x0); x < plein.x1; x++) if (!hg.niveau[`${x},${y}`] && !hg.hellingen[`${x},${y}`]) assert.equal(T.hoekHoogte(w, x, y, 0), hg.dorpHoogte);
  } finally {
    T.zetOptie('hoogte', 'vlak');
    console.warn = echt;
  }
});
