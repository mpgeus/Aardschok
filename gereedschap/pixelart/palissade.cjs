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
//   node gereedschap/pixelart/palissade.cjs --stukken   (uit/palissade-stukken.png: het vel voor het spel, om te bekijken)
//   node gereedschap/pixelart/naar-spel.cjs --alleen palissade   (naar het spel: beelden/palissade.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { TEGEL, ruis3, rnd, sdf } = K;
const { model, kegel, capsule, blok, ellips, naarRamp } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');

// ---------------------------------------------------------------- maten (eenheden: een eenheid is zo'n twee centimeter)

const PAAL = {
  r: 7.4, // een stam van dertig centimeter (Marcel, 27 okt: "1", een muur en geen hek)
  tussen: 13.8, // van hart tot hart: dicht tegen elkaar, zonder kieren
  hoog: [130, 165], // anderhalf tot twee keer een man (een man is zo'n 88)
  punt: 14, // zo lang is de geslagen punt
  scheef: 0.1, // zoveel uit het lood staat een scheve paal (de soort 'scheef', SOORTEN_PAAL)
};
const POORT = { r: 11, hoog: 194, breed: 3, balk: 176 }; // de zware palen aan weerskanten van de opening, de opening in tegels, en de balk erover
const LIGGER = { z: [34, 104], r: 3.6, binnen: -8.5 }; // de twee dwarsliggers, aan de binnenkant (-y)

const M = { schors: 0, kern: 1, touw: 2, plank: 3, lap: 4, bot: 5, oog: 6, nieuw: 7, mos: 8 };

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
  // Een nieuwe paal (de soort 'nieuw'): de schors nog bruin, zonder mos.
  mat[M.nieuw] = Bm.schorsMat({ zaad: 12, ramp: 'schors', lo: 1.0, hi: 4.8, rek: 0.05 });
  // Een paal vol mos (de soort 'mos'): tot halverwege groen, grillig.
  mat[M.mos] = {
    ...schors,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const tot = 55 + (ruis3(x * 0.15, y * 0.15, 0, 67) - 0.5) * 50;
      if (z < tot && ruis3(x * 0.3, y * 0.3, z * 0.12, 68) > 0.32) return naarRamp('mos', stap, [0.5, 3.6], [0.6, 4.0]);
      return schors.patroon(x, y, z);
    },
  };
  // De hertenschedel: gebleekt bot, en de oogkassen donker.
  mat[M.bot] = { ramp: 'bot', lo: 3.0, hi: 7.2, patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.6, z * 0.6, 66) > 0.7 ? -0.8 : 0) };
  mat[M.oog] = { ramp: 'inkt', lo: 0.2, hi: 1.0 };
  return mat;
}

// ---------------------------------------------------------------- het model

// Eén paal op (x, y): de stam (schors), de geslagen punt (licht hout), en scheef als `kant` (dx, dy per eenheid hoogte).
function paal(d, x, y, h, r, kant, deel, mat = M.schors) {
  const top = [x + kant[0] * h, y + kant[1] * h, h];
  const hals = [x + kant[0] * (h - PAAL.punt), y + kant[1] * (h - PAAL.punt), h - PAAL.punt];
  d.push(kegel([x, y, -2], hals, r, r * 0.92, mat, deel));
  d.push(kegel(hals, top, r * 0.9, 0.6, M.kern, deel, 1.2));
}
// Een afgebroken paal: tot hoogte h, zonder punt, met een paar splinters van licht hout boven op de breuk.
function afgebroken(d, x, y, h, r, zaad, i, deel) {
  d.push(kegel([x, y, -2], [x, y, h], r, r * 0.95, M.schors, deel));
  d.push(kegel([x, y, h - 1], [x, y, h + 1.2], r * 0.92, r * 0.86, M.kern, deel, 0.8));
  for (let j = 0; j < 4; j++) {
    const a = rnd(zaad, i, 30 + j) * Math.PI * 2;
    const l = 4 + rnd(zaad, i, 34 + j) * 9;
    const [px, py] = [x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5];
    d.push(kegel([px, py, h], [px + Math.cos(a) * 1.5, py + Math.sin(a) * 1.5, h + l], 2.2, 0.4, M.kern, deel, 0.6));
  }
}

// De soorten paal (Marcel, 27 okt: "ik wil wat variatie erin, her en der een gaatje, etc.", "als een soort random tile"):
// elke paal kiest er een met een vast lot uit zijn nummer, met deze kansen; twee gaatjes of twee afgebroken naast elkaar
// komen niet voor (dan wordt het een gewone). Dezelfde set dient later de palissade die je zelf legt (werklijst, 158).
const SOORTEN_PAAL = { gewoon: 0.6, nieuw: 0.08, scheef: 0.07, afgebroken: 0.07, gat: 0.06, plank: 0.06, mos: 0.06 };
function kiesSoort(zaad, i, vorige) {
  let r = rnd(zaad, i, 20) * Object.values(SOORTEN_PAAL).reduce((a, b) => a + b, 0);
  for (const [soort, kans] of Object.entries(SOORTEN_PAAL)) {
    if ((r -= kans) >= 0) continue;
    return (soort === 'gat' || soort === 'afgebroken') && soort === vorige ? 'gewoon' : soort;
  }
  return 'gewoon';
}

// De palen van een recht stuk langs x, van a tot b (eenheden), de buitenkant naar +y: elke paal anders (`zaad`, en `i`, het
// nummer van de eerste), hier en daar een plank waar er een ontbreekt, en de twee dwarsliggers aan de binnenkant (-y) van
// `liggerVan` tot `liggerTot`, met om de paar palen een sjorring van touw. Geeft het nummer na de laatste paal.
function palen(d, a, b, zaad, i = 0, liggerVan = a + 2, liggerTot = b - 2) {
  const kanten = [];
  for (let x = a + PAAL.tussen / 2; x < b - PAAL.tussen / 2 + 0.1; x += PAAL.tussen, i++) {
    const h1 = rnd(zaad, i, 1);
    if (h1 < SOORTEN_PAAL.gat) {
      // er ontbreekt er een: een plank ertussen gespijkerd, schuin over het gat
      d.push(blok([x, 1, 70 + h1 * 300], [PAAL.tussen * 0.75, 1.2, 6], 0.6, M.plank, 9));
      continue;
    }
    const h = PAAL.hoog[0] + rnd(zaad, i, 2) * (PAAL.hoog[1] - PAAL.hoog[0]);
    const r = PAAL.r * (0.85 + rnd(zaad, i, 3) * 0.35);
    const s = rnd(zaad, i, 4) < SOORTEN_PAAL.scheef ? (rnd(zaad, i, 5) - 0.5) * 2 * PAAL.scheef : (rnd(zaad, i, 5) - 0.5) * 0.02;
    const kant = [s, (rnd(zaad, i, 6) - 0.5) * 0.03];
    paal(d, x + (rnd(zaad, i, 7) - 0.5) * 2.5, (rnd(zaad, i, 8) - 0.5) * 3, h, r, kant, 1 + (i % 3));
    kanten.push(x);
  }
  for (const z of LIGGER.z) {
    d.push(capsule([liggerVan, LIGGER.binnen, z + (rnd(zaad, a, z) - 0.5) * 4], [liggerTot, LIGGER.binnen, z + (rnd(zaad, b, z) - 0.5) * 4], LIGGER.r, M.schors, 5));
    for (const x of kanten.filter((k) => rnd(zaad, k, z) < 0.45)) d.push(capsule([x, LIGGER.binnen + 3, z - 4.5], [x, -3, z + 4.5], 1.2, M.touw, 6));
  }
  return i;
}
// Een zware paal van de opening op x, met de sjorringen, en met `lap` de rode lap van de rovers aan de buitenkant.
function poortPaal(d, x, lap) {
  paal(d, x, 0, POORT.hoog, POORT.r, [0, 0], 7);
  for (const z of LIGGER.z) d.push(capsule([x - 4, -2, z - 6], [x - 4, 3, z + 6], 1.5, M.touw, 6));
  if (!lap) return;
  d.push(blok([x + 1, POORT.r + 1.8, 128], [5.5, 0.9, 13], 0.8, M.lap, 8));
  d.push(blok([x + 4.5, POORT.r + 2.2, 110], [3, 0.8, 7], 0.8, M.lap, 8));
}

// ---------------------------------------------------------------- de ring (Marcel, 27 okt: "1, 2, 3 en 5")

// De ring om het hol: een paal op elke `tussen` langs een cirkel van `straal` tegels om het vuur (0, 0), elk op zijn eigen
// plek, met de buitenkant naar buiten; de dwarsliggers aan de binnenkant, als korte stukken van paal tot paal; en een
// opening van POORT.breed tegels rond de hoek `poort` (graden, in het vlak van het model), met de poort erin. Hier en daar
// staat er een scheef, en soms is er een plank over de buitenkant gespijkerd. Geeft een lijst modellen, een per stuk van
// de ring (`stukken` graden), zodat de renderer ze een voor een tekent.
function ring({ straal = 7, poort = 45, zaad = 7, stukken = 30 } = {}) {
  const R = straal * TEGEL;
  const halfGat = ((POORT.breed / 2) * TEGEL) / R; // in radialen
  const poortHoek = (poort * Math.PI) / 180;
  const stap = PAAL.tussen / R;
  const n = Math.floor((2 * Math.PI - 2 * halfGat) / stap);
  const palenOp = []; // [hoek] van de palen, van de ene poortpaal naar de andere
  for (let i = 0; i <= n; i++) palenOp.push(poortHoek + halfGat + (POORT.r + PAAL.r) / R + i * ((2 * Math.PI - 2 * halfGat - 2 * (POORT.r + PAAL.r) / R) / n));
  const op = (a, r = R) => [Math.cos(a) * r, Math.sin(a) * r];
  const delen = new Map(); // stuk → delen
  const bij = (a, d) => {
    const k = Math.floor((((a * 180) / Math.PI) % 360 + 360) % 360 / stukken);
    if (!delen.has(k)) delen.set(k, []);
    delen.get(k).push(d);
  };
  let vorige = null;
  palenOp.forEach((a, i) => {
    const [x, y] = op(a);
    const d = [];
    const soort = kiesSoort(zaad, i, vorige);
    vorige = soort;
    const h = PAAL.hoog[0] + rnd(zaad, i, 2) * (PAAL.hoog[1] - PAAL.hoog[0]);
    const r = PAAL.r * (0.88 + rnd(zaad, i, 3) * 0.24);
    // een kleine wiebel bij elke paal; scheef: flink naar buiten of naar binnen (s) of langs de ring (t)
    let s = (rnd(zaad, i, 5) - 0.5) * 0.02;
    let t = (rnd(zaad, i, 6) - 0.5) * 0.03;
    if (soort === 'scheef') [s, t] = rnd(zaad, i, 4) < 0.5 ? [(rnd(zaad, i, 7) < 0.5 ? -1 : 1) * PAAL.scheef, t] : [s, (rnd(zaad, i, 7) < 0.5 ? -1 : 1) * PAAL.scheef];
    const kant = [Math.cos(a) * s - Math.sin(a) * t, Math.sin(a) * s + Math.cos(a) * t];
    const deel = 1 + (i % 3);
    if (soort === 'gat') {
      // er ontbreekt er een; soms staat er nog een stomp
      if (rnd(zaad, i, 8) < 0.5) {
        const hs = 12 + rnd(zaad, i, 9) * 16;
        d.push(kegel([x, y, -2], [x, y, hs], r, r * 0.95, M.schors, deel));
        d.push(kegel([x, y, hs - 0.5], [x, y, hs + 1], r * 0.94, r * 0.9, M.kern, deel, 0.6));
      }
    } else if (soort === 'afgebroken') afgebroken(d, x, y, h * (0.5 + rnd(zaad, i, 10) * 0.25), r, zaad, i, deel);
    else paal(d, x, y, soort === 'nieuw' ? h * 0.96 : h, soort === 'nieuw' ? r * 0.8 : r, kant, deel, soort === 'nieuw' ? M.nieuw : soort === 'mos' ? M.mos : M.schors);
    if (soort === 'plank') {
      // een plank over de buitenkant gespijkerd, over deze paal en zijn buren
      const [x0, y0] = op(a - stap * 1.2, R + PAAL.r + 1.5);
      const [x1, y1] = op(a + stap * 1.2, R + PAAL.r + 1.5);
      const z = 45 + rnd(zaad, i, 11) * 65;
      d.push(capsule([x0, y0, z], [x1, y1, z + (rnd(zaad, i, 12) - 0.5) * 9], 2.6, M.plank, 9));
    }
    d.forEach((q) => bij(a, q));
  });
  // de dwarsliggers aan de binnenkant: van paal tot paal, met om de paar palen een sjorring
  const Rl = R - PAAL.r - LIGGER.r - 1;
  for (let i = 0; i + 1 < palenOp.length; i++) {
    const [a, b] = [palenOp[i], palenOp[i + 1]];
    for (const z of LIGGER.z) {
      const [x0, y0] = op(a, Rl);
      const [x1, y1] = op(b, Rl);
      bij(a, capsule([x0, y0, z + (rnd(zaad, i, z) - 0.5) * 3], [x1, y1, z + (rnd(zaad, i + 1, z) - 0.5) * 3], LIGGER.r, M.schors, 5));
      if (rnd(zaad, i, z + 1) < 0.35) {
        const [xi, yi] = op(a, Rl + 2);
        const [xo, yo] = op(a, R - PAAL.r + 1);
        bij(a, capsule([xi, yi, z - 4.5], [xo, yo, z + 4.5], 1.3, M.touw, 6));
      }
    }
  }
  // de poort: twee zware palen, een balk erover met touw, de lap aan de linker, en een hertenschedel midden op de balk
  const poortD = [];
  const posten = [-1, 1].map((k) => poortHoek + k * halfGat);
  for (const [j, a] of posten.entries()) {
    const [x, y] = op(a);
    paal(poortD, x, y, POORT.hoog, POORT.r, [0, 0], 7);
    for (const z of [...LIGGER.z, POORT.balk]) poortD.push(capsule(op(a, R - POORT.r - 1).concat(z - 7), op(a, R + POORT.r + 1).concat(z + 7), 1.6, M.touw, 6));
    if (j === 0) {
      const [lx, ly] = op(a, R + POORT.r + 1.5);
      poortD.push(blok([lx, ly, 128], [5.5, 1, 14], 0.8, M.lap, 8));
      poortD.push(blok([lx + 2, ly + 1, 108], [3.2, 0.9, 8], 0.8, M.lap, 8));
    }
  }
  const [b0, b1] = posten.map((a) => op(a, R + 1));
  const uit = [(b0[0] - b1[0]) / 2, (b0[1] - b1[1]) / 2].map((v) => v * 0.16); // de balk steekt een eindje over
  poortD.push(capsule([b0[0] + uit[0], b0[1] + uit[1], POORT.balk], [b1[0] - uit[0], b1[1] - uit[1], POORT.balk], 7, M.schors, 10));
  poortD.push(...schedel(...op(poortHoek, R + 9), POORT.balk - 4, poortHoek));
  return [...[...delen.values()].map((d) => model([...d, Bm.onderGrond], materialen(), Bm.omhul(d))), model([...poortD, Bm.onderGrond], materialen(), Bm.omhul(poortD))];
}

// Een hertenschedel op (x, y, z), naar buiten kijkend langs hoek a: de schedel met de snuit omlaag, twee donkere oogkassen,
// en het gewei, twee takken met elk twee punten.
function schedel(x, y, z, a) {
  const [ux, uy] = [Math.cos(a), Math.sin(a)]; // naar buiten
  const [zx, zy] = [-uy, ux]; // opzij
  const d = [];
  d.push(ellips([x, y, z - 6], [5, 5, 9], M.bot, 11));
  d.push(kegel([x + ux * 2, y + uy * 2, z - 10], [x + ux * 3, y + uy * 3, z - 19], 3.4, 2.2, M.bot, 11));
  for (const k of [-1, 1]) {
    d.push({ f: (px, py, pz) => sdf.bol(px - (x + ux * 4 + zx * k * 2.6), py - (y + uy * 4 + zy * k * 2.6), pz - (z - 4), 1.7), g: [x, y, z - 4, 8], m: M.oog, deel: 12 });
    const voet = [x + zx * k * 3, y + zy * k * 3, z + 1];
    const top = [x + zx * k * 14 - ux * 2, y + zy * k * 14 - uy * 2, z + 16];
    d.push(capsule(voet, top, 1.4, M.bot, 13));
    const mid = voet.map((v, i) => v + (top[i] - v) * 0.5);
    d.push(capsule(mid, [mid[0] + ux * 6 + zx * k * 2, mid[1] + uy * 6 + zy * k * 2, mid[2] + 7], 1.1, M.bot, 13));
    d.push(capsule(top, [top[0] + zx * k * 3, top[1] + zy * k * 3, top[2] + 6], 1, M.bot, 13));
  }
  return d;
}

// ---------------------------------------------------------------- de stukken voor het spel

// Eén tegel van de ring om een roverskamp (js/rovers.js, zetPalissade), met het midden van de tegel in het midden: 'recht'
// (een tegel lang, drie palen; de ring loopt langs een as), 'schuin' (de diagonaal van een tegel, vier palen), of 'poort'
// (een zware paal aan het eind van de ring bij de opening; `lap`: met de rode lap). De buitenkant naar +y; de richting
// van het vel draait hem (de buitenkant naar de kant van de tegel weg van het vuur). `zaad`: elke variant anders.
const VARIANTEN = 3;
function stuk({ vorm, zaad = 1, lap = false }) {
  const d = [];
  if (vorm === 'poort') poortPaal(d, 0, lap);
  else {
    const L = TEGEL * (vorm === 'schuin' ? Math.SQRT2 : 1);
    palen(d, -L / 2, L / 2, 100 + zaad, 0, -L / 2 - 1, L / 2 + 1);
  }
  d.push(Bm.onderGrond);
  return model(d, materialen(), Bm.omhul(d));
}
// De rijen van het vel: de varianten (recht of schuin, naar de richting), dan de poortpaal zonder en met lap; de kolommen
// zijn de acht richtingen van de buitenkant, in stappen van 45 graden (zoals T.RICHTING in kern.cjs telt: 0 is +x).
const RIJEN = [...Array.from({ length: VARIANTEN }, (_, v) => `${v}`), 'poort', 'poort-lap'];
const STUK_CEL = [120, 220];
const STUK_ANKER = [60, 186];
function vel() {
  const uit = new K.Plaat(STUK_CEL[0] * 8, STUK_CEL[1] * RIJEN.length);
  RIJEN.forEach((rij, r) => {
    for (let k = 0; k < 8; k++) {
      const vorm = rij.startsWith('poort') ? 'poort' : k % 2 ? 'schuin' : 'recht';
      const m = stuk({ vorm, zaad: Number(rij) || 0, lap: rij === 'poort-lap' });
      uit.plak(teken(m, STUK_CEL, STUK_ANKER, k * 45), k * STUK_CEL[0], r * STUK_CEL[1]);
    }
  });
  return uit;
}
// Wat in beelden/beschrijving.json komt (naar-spel.cjs --alleen palissade).
const beschrijving = (bestand) => ({ bestand, cel: STUK_CEL, anker: STUK_ANKER, rijen: RIJEN, richtingen: 8 });

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

// De proefplaat (Marcel, 27 okt: "1, 2, 3 en 5"): de hele ring om het vuur, zoals in het spel, met de poort naar de
// kijker, twee tenten en het vuur erin, en een boer bij de poort voor de maat; op ware grootte.
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const Kamp = require('./kamp.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const CEL = [1040, 800];
  const ANKER = [520, 400];
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  // Richting ZO: het model kijkt met +x naar wereld +y en +y naar wereld +x; de poort op 45 graden is naar de kijker.
  for (const m of ring({ poort: 45 })) K.tekenModel(B, m, { richting: 'ZO' });
  K.tekenModel(B, Kamp.kampvuur({ stand: 'smeult' }), { richting: 'Z' });
  K.tekenModel(B, Kamp.tent({ rover: true, zaad: 5 }), { richting: 'ZO', gx: -4, gy: 0 });
  K.tekenModel(B, Kamp.tent({ rover: true, zaad: 5 }), { richting: 'ZW', gx: 0, gy: -4 });
  K.tekenModel(B, boer({ houding: 'staan', fase: 0 }), { richting: 'Z', gx: 6.4, gy: 6.4 });
  K.belicht(B);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  const k = kader(plaat);
  if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= plaat.b - 1 || k.y1 >= plaat.h - 1) console.log('LET OP: de ring raakt de rand van de cel');
  const R = 6;
  const snede = plaat.uitsnede(Math.max(0, k.x0 - R), Math.max(0, k.y0 - R), Math.min(plaat.b, k.x1 - k.x0 + 1 + 2 * R), Math.min(plaat.h, k.y1 - k.y0 + 1 + 2 * R));
  // Daaronder de voorkant twee keer vergroot, om de soorten paal te zien.
  const voor = snede.uitsnede(0, Math.floor(snede.h * 0.42), snede.b, snede.h - Math.floor(snede.h * 0.42));
  const groot = new K.Plaat(voor.b * 2, voor.h * 2);
  for (let y = 0; y < voor.h; y++) {
    for (let x = 0; x < voor.b; x++) {
      const c = voor.lees(x, y);
      if (c) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) groot.zet(x * 2 + i, y * 2 + j, c[0], c[1]);
    }
  }
  const samen = new K.Plaat(groot.b, snede.h + 10 + groot.h);
  samen.plak(snede, Math.floor((groot.b - snede.b) / 2), 0);
  samen.plak(groot, 0, snede.h + 10);
  fs.writeFileSync(path.join(uit, 'palissade-proef.png'), K.png(samen, 1, '#5e6a44'));
  console.log(`uit/palissade-proef.png (${samen.b}×${samen.h})`);
}

if (require.main === module) {
  if (process.argv.includes('--stukken')) {
    const p = vel();
    fs.mkdirSync(path.join(__dirname, 'uit'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'uit', 'palissade-stukken.png'), K.png(p, 1, '#5e6a44'));
    console.log(`uit/palissade-stukken.png (${p.b}×${p.h})`);
  } else proef();
}

module.exports = { ring, stuk, SOORTEN_PAAL, kiesSoort, vel, beschrijving, RIJEN, VARIANTEN, STUK_CEL, STUK_ANKER, PAAL, POORT, LIGGER };
