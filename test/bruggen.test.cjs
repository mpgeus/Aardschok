// De bruggen van het eiland in het spel (werklijst vraag 170, stap 6a2; Marcel, 17 okt: "Goed zo, zet ze in het spel";
// ontwerp/beeld.md, "De bruggen"): een brug is drie tegels breed (js/eiland.js), je loopt erover (js/wereld.js), het vel
// heeft voor elke tegel van elke brug een stuk (gereedschap/pixelart/bruggen-vel.cjs, js/sprites.js), en wie erop staat,
// gaat met het wegdek mee omhoog (js/hoogte.js). Hier zonder browser: een nagemaakt Image laadt alles wat er is.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const gevraagd = [];
globalThis.Image = class {
  set src(pad) {
    gevraagd.push(pad);
    this.naturalWidth = 1;
    this.naturalHeight = 1;
    setImmediate(() => (fs.existsSync(path.join(WORTEL, pad)) ? this.onload() : this.onerror()));
  }
};
const beurt = () => new Promise((klaar) => setImmediate(klaar));

const T = require('./laad.cjs').spel();
const Br = require('../gereedschap/pixelart/bruggen.cjs');

const E = T.eilandVan(5);
const STENEN = ['veldsteen', 'zandsteen', 'baksteen'];
const tegelVan = (b, i, k) => (b.as === 'x' ? { x: b.ga + i, y: b.gc - 1 + k } : { x: b.gc - 1 + k, y: b.ga + i });
// een kaart van het eiland met het land om deze brug open
function kaartBij(b) {
  const m = tegelVan(b, Math.floor(b.L / 2), 1);
  const vak = { x: m.x - 20, y: m.y - 20, b: 40, h: 40 };
  const w = T.eilandKaart(5, vak);
  T.openVak(w, vak);
  return w;
}

test('het vel van de bruggen laadt pas als er een brug getekend wordt, en heeft dan een stuk voor elke tegel van elke brug', async () => {
  const klaar = T.sprites.laad();
  for (let i = 0; i < 20; i++) await beurt();
  await klaar;
  const vel = `beelden/${T.BEELDEN.bruggen.bestand}`;
  assert.ok(!gevraagd.includes(vel), 'niet bij het begin');
  assert.equal(T.sprites.brugStuk(E.bruggen[0], 'veldsteen', 0, 1, 0), null, 'het vel laadt nog');
  assert.ok(gevraagd.includes(vel));
  for (let i = 0; i < 5; i++) await beurt();
  let n = 0;
  for (const zaad of [3, 5, 7]) {
    for (const b of T.eilandVan(zaad).bruggen) {
      for (const steen of b.soort === 'steen' ? STENEN : [null]) {
        for (let i = -1; i <= b.L; i++) {
          for (let k = 0; k < 3; k++) {
            // de achterlaag (het dek) is er altijd; de voorlaag alleen waar een borstwering of leuning vóór je staat
            assert.ok(T.sprites.brugStuk(b, steen, i, k, 0), `eiland ${zaad}, een brug ${b.soort} van ${b.L} langs ${b.as}: tegel ${i}, rij ${k}`);
            n++;
          }
        }
      }
    }
  }
  assert.ok(n > 500, `${n} stukken`);
});

test('een stenen brug van elke lengte komt uit stukken van een boog van dezelfde maat, op dezelfde plek, met dezelfde pijlers', () => {
  const boogOp = (L, i) => {
    const bg = Br.bogen(L);
    const [v, t] = bg.find(([a, b]) => i >= a && i < b);
    return { maat: t - v, plek: i - v, pijlerVoor: v > 0, pijlerNa: t < L };
  };
  for (let L = 1; L <= 24; L++) {
    for (let i = -1; i <= L; i++) {
      const [m, mi] = T.sprites.brugMonster('steen', L, i);
      const Lm = Number(m.slice(1));
      assert.ok(Br.bogen(Lm), m);
      if (i === -1 || i === L) {
        assert.equal(mi, i === -1 ? -1 : Lm, `L ${L}: het landhoofd`);
        continue;
      }
      assert.deepEqual(boogOp(Lm, mi), boogOp(L, i), `L ${L}, tegel ${i}: ${m} tegel ${mi}`);
    }
  }
});

test('de maten van het wegdek in de beschrijving zijn die van de tekening', () => {
  const m = T.BEELDEN.bruggen.maten;
  assert.deepEqual(m, { aanloop: Br.BRUG.aanloop, dek: { steen: Br.BRUG.dek, juk: Br.HOUT.dek, boog: Br.HOUT.dek }, bult: Br.HOUT.bult });
  for (const soort of ['steen', 'juk', 'boog']) {
    const brug = { soort, L: 4, as: 'x' };
    for (const a of [-1, -0.5, 0, 1.3, 2, 4, 4.5, 5]) assert.ok(Math.abs(T.sprites.brugDek(brug, a) - Br.dekOp(soort, 4, a)) < 1e-9, `${soort} op ${a}`);
  }
});

test('wie op een brug staat, gaat met het wegdek mee omhoog; het water eronder niet, en de muis op het wegdek kiest de brug', () => {
  const b = E.bruggen.find((q) => q.soort === 'steen');
  const w = kaartBij(b);
  const dek = T.BEELDEN.bruggen.maten.dek.steen;
  const t = tegelVan(b, 1, 1);
  assert.equal(T.naarSchermGrond(w, t.x, t.y).y - T.naarSchermOp(w, t.x, t.y).y, dek, 'boven het water');
  // het landhoofd loopt op, van de aanloop aan de buitenkant tot het dek
  const kop = tegelVan(b, -1, 1);
  const langs = b.as === 'x' ? [1, 0] : [0, 1];
  const hoog = (u) => T.dekOp(w, kop.x + langs[0] * u, kop.y + langs[1] * u);
  assert.ok(hoog(-0.45) < hoog(0) && hoog(0) < hoog(0.45), 'het landhoofd loopt op');
  assert.ok(hoog(0.45) <= dek);
  // naast de brug niets
  const naast = tegelVan(b, -3, 1);
  assert.equal(T.dekOp(w, naast.x, naast.y), 0);
  // de muis: het punt op het wegdek hoort bij de tegel van de brug, niet bij de grond die erachter in beeld ligt
  const p = T.naarSchermOp(w, t.x, t.y);
  const terug = T.naarWereldOp(w, p.x, p.y);
  assert.deepEqual([Math.round(terug.x), Math.round(terug.y)], [t.x, t.y]);
  const vlak = T.naarWereld(p.x, p.y);
  assert.notDeepEqual([Math.round(vlak.x), Math.round(vlak.y)], [t.x, t.y], 'zonder het wegdek was het een andere tegel');
});

test('over een brug loop je van het ene landhoofd naar het andere, door elke rij', () => {
  const b = E.bruggen[0];
  const w = kaartBij(b);
  for (let k = 0; k < 3; k++) {
    const van = tegelVan(b, -1, k);
    const naar = tegelVan(b, b.L, k);
    const pad = T.zoekRoute(w, van, naar, {});
    assert.ok(pad, `rij ${k}`);
    assert.equal(pad.length, b.L + 1, `rij ${k}: recht over de brug`);
    for (const s of pad) assert.ok(T.brugOp(w, s.x, s.y), `rij ${k}: (${s.x}, ${s.y}) is brug`);
  }
});
