// De palissade van het rovershol (werklijst K, 2c; ontwerp/beeld.md, "Het rovershol"; Marcel, 27 okt: "P zoals in de
// woorden"): een ring van puntige palen om het plein van een roverskamp, met één opening van drie tegels waar het paadje
// binnenkomt. Ruwe stammen met de schors er nog aan, een hand breed uit elkaar, ongelijk van hoogte (anderhalf tot twee
// keer een man), de punt naar boven geslagen (daar is het hout licht), vastgesjord met touw aan twee dwarsliggers aan de
// binnenkant; hier en daar staat er een scheef of ontbreekt er een, met een plank ertussen gespijkerd. Grijs, verweerd
// hout, mos aan de voet, en aan een zware paal bij de opening een lap van de rovers (de rode van de tent, kamp.cjs).
//
// Later in stukken van één tegel (recht, schuin, de hoek, de opening), zodat dezelfde ring om elk kamp past; en misschien
// de palissade van je eigen dorp (vraag 158). Nu alleen de proefplaat: een stuk van de ring met de opening, van één kant,
// met een boer ernaast voor de maat.
//
//   node gereedschap/pixelart/palissade.cjs      (uit/palissade-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { TEGEL, ruis3, rnd } = K;
const { model, kegel, capsule, blok, naarRamp } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');

// ---------------------------------------------------------------- maten (eenheden: een eenheid is zo'n twee centimeter)

const PAAL = {
  r: 5.2, // een stam van een voet dik
  tussen: 15.5, // van hart tot hart: een hand breed ertussen
  hoog: [130, 165], // anderhalf tot twee keer een man (een man is zo'n 88)
  punt: 14, // zo lang is de geslagen punt
  scheef: 0.08, // hooguit zoveel uit het lood (een op de zoveel staat scheef: zie `scheefKans`)
  scheefKans: 0.18,
  weg: 0.06, // de kans dat er een ontbreekt (dan een plank ertussen)
};
const POORT = { r: 8.5, hoog: 178, breed: 3 }; // de zware palen aan weerskanten van de opening, en de opening in tegels
const LIGGER = { z: [34, 104], r: 3.6, binnen: -8.5 }; // de twee dwarsliggers, aan de binnenkant (-y)

const M = { schors: 0, kern: 1, touw: 2, plank: 3, lap: 4 };

function materialen() {
  const mat = [];
  // Grijze, verweerde schors (de warme grijzen van `bot`), met nog plekken bruine schors, en mos aan de voet (tot een
  // halve meter, grillig).
  const schors = Bm.schorsMat({ zaad: 11, ramp: 'bot', lo: 0.5, hi: 3.6, rek: 0.05 });
  mat[M.schors] = {
    ...schors,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const voet = 16 + (ruis3(x * 0.2, y * 0.2, 0, 61) - 0.5) * 18;
      if (z < voet && ruis3(x * 0.35, y * 0.35, z * 0.35, 62) > 0.38) return naarRamp('mos', stap, [0.5, 3.6], [0.8, 3.6]);
      if (ruis3(x * 0.09, y * 0.09, z * 0.03, 65) > 0.66) return naarRamp('schors', stap, [0.5, 3.6], [1.0, 4.6]);
      return schors.patroon(x, y, z) - (ruis3(x * 0.05, y * 0.05, z * 0.02, 63) > 0.62 ? 0.5 : 0);
    },
  };
  // De geslagen punt: licht hout, met de slagen van de bijl.
  mat[M.kern] = { ramp: 'hout', lo: 2.6, hi: 5.6, patroon: (x, y, z) => (Math.sin(z * 1.4 + x * 0.3) > 0.7 ? -0.7 : 0) };
  mat[M.touw] = { ramp: 'stro', lo: 1.2, hi: 4.2 };
  mat[M.plank] = { ramp: 'hout', lo: 0.8, hi: 4.0, patroon: (x, y, z) => (Math.sin(x * 0.9 + z * 0.15) > 0.85 ? -0.8 : 0) };
  mat[M.lap] = { ramp: 'rood', lo: 1.6, hi: 4.8, patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 64) > 0.7 ? -0.9 : 0) };
  return mat;
}

// ---------------------------------------------------------------- het model

// Eén paal op (x, y): de stam (schors), de geslagen punt (licht hout), en scheef als `kant` (dx, dy per eenheid hoogte).
function paal(d, x, y, h, r, kant, deel) {
  const top = [x + kant[0] * h, y + kant[1] * h, h];
  const hals = [x + kant[0] * (h - PAAL.punt), y + kant[1] * (h - PAAL.punt), h - PAAL.punt];
  d.push(kegel([x, y, -2], hals, r, r * 0.92, M.schors, deel));
  d.push(kegel(hals, top, r * 0.9, 0.6, M.kern, deel, 1.2));
}

// palissade({ van, tot, zaad }): een recht stuk langs x, van `van` tot `tot` tegels, de buitenkant naar +y, met de opening
// van POORT.breed tegels in het midden (x = 0).
function palissade(o = {}) {
  const van = (o.van ?? -4) * TEGEL;
  const tot = (o.tot ?? 4) * TEGEL;
  const gat = (POORT.breed * TEGEL) / 2;
  const zaad = o.zaad ?? 7;
  const d = [];
  let i = 0;
  const kanten = [];
  for (const [a, b] of [[van, -gat], [gat, tot]]) {
    for (let x = a + PAAL.tussen / 2; x < b - PAAL.tussen / 2 + 0.1; x += PAAL.tussen, i++) {
      const h1 = rnd(zaad, i, 1);
      if (h1 < PAAL.weg) {
        // er ontbreekt er een: een plank ertussen gespijkerd, schuin over het gat
        d.push(blok([x, 1, 70 + h1 * 300], [PAAL.tussen * 0.75, 1.2, 6], 0.6, M.plank, 9));
        continue;
      }
      const h = PAAL.hoog[0] + rnd(zaad, i, 2) * (PAAL.hoog[1] - PAAL.hoog[0]);
      const r = PAAL.r * (0.85 + rnd(zaad, i, 3) * 0.35);
      const s = rnd(zaad, i, 4) < PAAL.scheefKans ? (rnd(zaad, i, 5) - 0.5) * 2 * PAAL.scheef : (rnd(zaad, i, 5) - 0.5) * 0.02;
      const kant = [s, (rnd(zaad, i, 6) - 0.5) * 0.03];
      paal(d, x + (rnd(zaad, i, 7) - 0.5) * 2.5, (rnd(zaad, i, 8) - 0.5) * 3, h, r, kant, 1 + (i % 3));
      kanten.push(x);
    }
    // de dwarsliggers aan de binnenkant, met om de paar palen een sjorring van touw
    for (const z of LIGGER.z) {
      d.push(capsule([a + 2, LIGGER.binnen, z + (rnd(zaad, a, z) - 0.5) * 4], [b - 2, LIGGER.binnen, z + (rnd(zaad, b, z) - 0.5) * 4], LIGGER.r, M.schors, 5));
      for (const x of kanten.filter((k) => k > a && k < b && rnd(zaad, k, z) < 0.45)) {
        d.push(capsule([x, LIGGER.binnen + 3, z - 4.5], [x, -3, z + 4.5], 1.2, M.touw, 6));
      }
    }
  }
  // de zware palen van de opening, met een lap van de rovers aan de linker
  for (const s of [-1, 1]) {
    const x = s * (gat + POORT.r * 0.6);
    paal(d, x, 0, POORT.hoog, POORT.r, [0, 0], 7);
    for (const z of LIGGER.z) d.push(capsule([x - s * 4, -2, z - 6], [x - s * 4, 3, z + 6], 1.5, M.touw, 6));
  }
  const xl = -(gat + POORT.r * 0.6);
  d.push(blok([xl + 1, POORT.r + 1.8, 128], [5.5, 0.9, 13], 0.8, M.lap, 8));
  d.push(blok([xl + 4.5, POORT.r + 2.2, 110], [3, 0.8, 7], 0.8, M.lap, 8));
  d.push(Bm.onderGrond);
  return model(d, materialen(), Bm.omhul(d));
}

// ---------------------------------------------------------------- de proefplaat

function teken(m, cel, anker, kant) {
  const B = new K.Beeld(cel[0], cel[1], anker[0], anker[1]);
  K.tekenModel(B, m, { richting: kant });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function kader(p) {
  let x0 = p.b, x1 = -1, y0 = p.h, y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, x1, y0, y1 };
}

// Op ware grootte: het stuk palissade van buiten (ZO), met een boer in de opening en een ernaast; daaronder twee keer
// vergroot.
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const CEL = [560, 340];
  const ANKER = [280, 250];
  const wand = teken(palissade(), CEL, ANKER, 'ZO');
  const { boer } = require('./dorpelingen.cjs');
  const FIG = [112, 124];
  const FIG_ANKER = [56, 110];
  const man = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG[0], h: FIG[1], anker: FIG_ANKER, richting: 'Z' });
  // De boer in de opening: het midden van het stuk (x = 0, y = 0) ligt op het anker; een stap naar buiten (+y) is op het
  // scherm schuin naar rechts onder.
  const plaat = new K.Plaat(CEL[0], CEL[1]);
  plaat.plak(wand, 0, 0);
  const op = (p, dx, dy) => {
    for (let y = 0; y < p.h; y++) {
      for (let x = 0; x < p.b; x++) {
        const k = p.lees(x, y);
        const px = x + dx;
        const py = y + dy;
        if (k && px >= 0 && py >= 0 && px < plaat.b && py < plaat.h) plaat.zet(px, py, k[0], k[1]);
      }
    }
  };
  op(man, ANKER[0] - FIG_ANKER[0] + 14, ANKER[1] - FIG_ANKER[1] + 10);
  const k = kader(plaat);
  if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= plaat.b - 1 || k.y1 >= plaat.h - 1) console.log('LET OP: de palissade raakt de rand van de cel');
  const R = 4;
  const snede = plaat.uitsnede(Math.max(0, k.x0 - R), Math.max(0, k.y0 - R), Math.min(plaat.b, k.x1 - k.x0 + 1 + 2 * R), Math.min(plaat.h, k.y1 - k.y0 + 1 + 2 * R));
  const groot = new K.Plaat(snede.b * 2, snede.h * 2);
  for (let y = 0; y < snede.h; y++) {
    for (let x = 0; x < snede.b; x++) {
      const c = snede.lees(x, y);
      if (c) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) groot.zet(x * 2 + i, y * 2 + j, c[0], c[1]);
    }
  }
  const samen = new K.Plaat(groot.b, snede.h + 8 + groot.h);
  samen.plak(snede, 0, 0);
  samen.plak(groot, 0, snede.h + 8);
  fs.writeFileSync(path.join(uit, 'palissade-proef.png'), K.png(samen, 1, '#5e6a44'));
  console.log(`uit/palissade-proef.png (${samen.b}×${samen.h})`);
}

if (require.main === module) proef();

module.exports = { palissade, PAAL, POORT, LIGGER };
