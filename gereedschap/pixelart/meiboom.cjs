// De meiboom (ontwerp/werklijst.md, vraag 97; Marcel, 3 okt: "De meiboom"): op 1 bloeimaand zetten de jongeren een
// berk op het plein, ontdaan van zijn takken op de kroon na, met een krans van groen met bloemen erin, en linten in vier
// kleuren die eraan hangen. Hij blijft een maand staan (js/feesten.js): zo zie je ook na het feest dat het dorp feest
// vierde.
//
// Eén tekening, geen delen, op beelden/meiboom.png (naar-spel.cjs --alleen meiboom), zoals het paaltje (paaltje.cjs):
// een voorwerp draait niet mee. Het model kijkt naar Z: lokaal +y is naar de camera, +x is links in beeld, z omhoog.
// Het anker is het midden van de tegel, op de grond.
//
//   node gereedschap/pixelart/meiboom.cjs    (de proefplaat: uit/meiboom-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, ruis3 } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- maten

// Eén cel: smal en hoog, met onder het anker nog plaats voor de hoop aarde.
const CEL = [48, 196];
const ANKER = [24, 184];
// Zo tekent het spel de figuren (dorpelingen-anim.cjs), voor de proefplaat.
const FIG_CEL = [112, 124];
const FIG_ANKER = [56, 110];

// De stam: van de grond tot de kroon, onderaan dikker. De krans hangt een eind onder de kroon, en de linten eraan.
const STAM = { top: 142, onder: 2.4, boven: 1.2 };
const KROON = { z: 147, breed: 9.5, hoog: 15 };
const KRANS = { z: 116, R: 8.5, r: 2.0 };
const LINT = { aantal: 10, lang: 40, dik: 0.3, breed: 1.1 };

// ---------------------------------------------------------------- materialen

const M = { stam: 0, kroon: 1, krans: 2, aarde: 3, kei: 4, lint: 5 };
const LINT_KLEUREN = ['rood', 'goud', 'gewaad', 'perkament'];

const materialen = () => {
  const mat = [];
  // Berkenbast: wit, met de donkere streepjes dwars op de stam die een berk een berk maken, en onderaan, waar hij in de
  // grond stond, grijzer.
  mat[M.stam] = {
    ramp: 'berk',
    lo: 1.4,
    hi: 5.6,
    patroon: (x, y, z) => {
      let p = 0;
      const hoek = Math.atan2(y, x);
      if (Math.sin(z * 0.9 + ruis3(hoek * 2, z * 0.15, 1, 4) * 6) > 0.86 && ruis3(hoek * 3, z * 0.3, 2, 9) > 0.45) p -= 2.4;
      if (z < 10) p -= (10 - z) * 0.12;
      return p;
    },
  };
  // Het jonge blad van de kroon: licht en fris groen, in plukjes.
  mat[M.kroon] = {
    ramp: 'blad',
    lo: 2.6,
    hi: 7.4,
    patroon: (x, y, z) => (ruis3(x * 0.7, y * 0.7, z * 0.7, 13) > 0.6 ? -1.2 : 0),
  };
  // De krans: donker groen (dennengroen), met hier en daar een bloem in rood of geel.
  mat[M.krans] = {
    ramp: 'den',
    lo: 1.6,
    hi: 6.0,
    patroon: (x, y, z) => {
      const b = ruis3(x * 0.9, y * 0.9, z * 0.9, 31);
      if (b > 0.74) return { ramp: 'rood', plus: 2.5 };
      if (b < 0.2) return { ramp: 'goud', plus: 2 };
      return 0;
    },
  };
  mat[M.aarde] = {
    ramp: 'aarde',
    lo: 2.0,
    hi: 5.8,
    patroon: (x, y, z) => (ruis3(x * 0.7, y * 0.7, z * 0.6, 21) > 0.62 ? -0.8 : 0),
  };
  mat[M.kei] = { ramp: 'bot', lo: 1.4, hi: 4.6 };
  // De linten: ongebleekt linnen en geverfd doek, met een omslag zodat ook de kant die van het licht af hangt kleur heeft.
  const lo = { rood: 3.2, goud: 3.0, gewaad: 3.4, perkament: 2.4 };
  const hi = { rood: 7.8, goud: 6.8, gewaad: 7.6, perkament: 6.2 };
  LINT_KLEUREN.forEach((k, i) => {
    mat[M.lint + i] = { ramp: k, lo: lo[k], hi: hi[k], omslag: 0.6 };
  });
  return mat;
};

// ---------------------------------------------------------------- de stam

function stam() {
  return {
    f: (x, y, z) => Math.max(sdf.rondeKegel(x, y, z, 0, 0, -2, 0, 0, STAM.top, STAM.onder, STAM.boven), -z - 2),
    g: [0, 0, STAM.top / 2, STAM.top / 2 + 4],
    m: M.stam,
    deel: 1,
  };
}

// ---------------------------------------------------------------- de kroon

// Een pluim jong blad, rechtop: een paar bolletjes rond de top, met ruis zodat het geen bol is maar blad.
function kroon() {
  const plukken = [
    [0, 0, KROON.z + 4, 7, 7, 10],
    [3.6, 1.6, KROON.z - 1, 4.8, 4.6, 6.5],
    [-3.4, 2.2, KROON.z, 4.6, 4.4, 6.5],
    [0.8, -3.4, KROON.z + 1, 4.6, 4.6, 6.5],
    [-1.6, -0.8, KROON.z + 11, 4, 4, 5.5],
    [2, 3.6, KROON.z + 6, 3.8, 3.8, 5],
  ];
  return {
    f: (x, y, z) => {
      let d = Infinity;
      for (const [cx, cy, cz, a, b, c] of plukken) d = Math.min(d, sdf.ellipsoide(x - cx, y - cy, z - cz, a, b, c));
      return (d + (ruis3(x * 0.55, y * 0.55, z * 0.55, 5) - 0.5) * 2.2) * 0.8;
    },
    g: [0, 0, KROON.z + 3, KROON.hoog + 4],
    m: M.kroon,
    deel: 2,
  };
}

// ---------------------------------------------------------------- de krans

function krans() {
  return {
    f: (x, y, z) => (sdf.torus(x, y, z - KRANS.z, KRANS.R, KRANS.r) + (ruis3(x * 0.8, y * 0.8, z * 0.8, 17) - 0.5) * 0.9) * 0.85,
    g: [0, 0, KRANS.z, KRANS.R + KRANS.r + 2],
    m: M.krans,
    deel: 3,
  };
}

// ---------------------------------------------------------------- de linten

// Een lint hangt van de krans naar beneden, waait een beetje uit en golft; elk een eigen lengte, en de kleuren om de
// beurt. Plat: dun naar buiten, breder langs de krans.
function lint(i) {
  const hoek = (i / LINT.aantal) * 2 * Math.PI + 0.35;
  const c = Math.cos(hoek);
  const s = Math.sin(hoek);
  const lengte = LINT.lang * (0.78 + 0.08 * ((i * 5) % 6));
  const boven = KRANS.z;
  const onder = boven - lengte;
  return {
    f: (x, y, z) => {
      const t = klem((boven - z) / lengte, 0, 1);
      const R = KRANS.R + 0.4 + 4.5 * t + 0.8 * Math.sin(t * 5 + i);
      const golf = 1.1 * Math.sin(t * 4.5 + i * 1.7) * t;
      const dr = x * c + y * s - R;
      const dt = -x * s + y * c - golf;
      return sdf.doos(dr, dt, z - (boven + onder) / 2, LINT.dik, LINT.breed, lengte / 2, 0.15) * 0.75;
    },
    g: [(KRANS.R + 2.5) * c, (KRANS.R + 2.5) * s, (boven + onder) / 2, lengte / 2 + 7],
    m: M.lint + (i % LINT_KLEUREN.length),
    deel: 10 + i,
  };
}

// ---------------------------------------------------------------- de aarde

// Omgewoelde aarde om de voet, waar de stam is ingegraven, met drie keien die hem rechtop houden.
function hoop() {
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const d = sdf.ellipsoide(x, y - 0.3, z + 0.4, 7, 6, 2.6) + (ruis3(x * 0.55, y * 0.55, z * 0.5, 9) - 0.5) * 1.1;
      return Math.max(d, -z - 0.2);
    },
    g: [0, 0, 1, 10],
    m: M.aarde,
    deel: 4,
  });
  for (const [cx, cy, sz] of [[4.6, 2.6, 1.2], [-4.0, 3.2, 1.0], [0.8, -4.4, 1.1]]) {
    delen.push({ f: (x, y, z) => sdf.ellipsoide(x - cx, y - cy, z - sz * 0.4, sz * 1.4, sz * 1.2, sz * 0.9), g: [cx, cy, sz * 0.4, sz * 1.8], m: M.kei, deel: 5 });
  }
  return delen;
}

// ---------------------------------------------------------------- het model

function meiboom() {
  const linten = [];
  for (let i = 0; i < LINT.aantal; i++) linten.push(lint(i));
  const delen = [stam(), kroon(), krans(), ...linten, ...hoop()];
  return model(delen, materialen(), { midden: [0, 0, 80], straal: 90 });
}

// ---------------------------------------------------------------- tekenen

function meiboomCel() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenModel(B, meiboom(), { richting: 'Z' });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// ---------------------------------------------------------------- het vel

function vel() {
  return meiboomCel();
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs): het bestand, de maat van de cel en het anker.
function beschrijving(bestand) {
  return { bestand, cel: CEL, anker: ANKER };
}

// ---------------------------------------------------------------- de proefplaat

// Hoeveel pixels een tekening van de rand van zijn cel afblijft, om te zien of hij nog past.
function ruimte(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { boven: y0, links: x0, rechts: p.b - 1 - x1, onder: p.h - 1 - y1 };
}

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

// Een stuk plein van vijf bij vijf tegels met de meiboom in het midden en twee boeren ervoor, samengesteld zoals het
// spel het doet (van achter naar voor, elk met zijn anker op het midden van zijn tegel), twee keer vergroot; ernaast de
// meiboom alleen, drie keer.
function proef() {
  const cel = meiboomCel();
  const { boer } = require('./dorpelingen.cjs');
  const figuur = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG_CEL[0], h: FIG_CEL[1], anker: FIG_ANKER, richting: 'Z' });
  const B = 320;
  const H = 300;
  const plein = new K.Plaat(B, H);
  const legOp = (p, anker, gx, gy) => plein.plak(p, 160 + (gx - gy) * 32 - anker[0], 140 + (gx + gy) * 16 - anker[1]);
  legOp(figuur, FIG_ANKER, 0, 1);
  legOp(cel, ANKER, 1, 1);
  legOp(figuur, FIG_ANKER, 2, 1);
  legOp(figuur, FIG_ANKER, 2, 3);
  const groot = vergroot(cel, 3);
  const links = vergroot(plein, 2);
  const plaat = new K.Plaat(links.b + 24 + groot.b + 12, Math.max(links.h, groot.h + 24));
  plaat.plak(links, 0, 0);
  plaat.plak(groot, links.b + 24, 12);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'meiboom-proef.png'), K.png(plaat, 1, '#5e6a44'));
  const r = ruimte(cel);
  console.log(`uit/meiboom-proef.png (${plaat.b}×${plaat.h}); cel ${CEL.join('×')}, anker ${ANKER.join(',')}, ruimte ${JSON.stringify(r)}`);
  if (Math.min(r.boven, r.links, r.rechts, r.onder) < 1) console.log('LET OP: de tekening raakt de rand van zijn cel');
  return { plaat, ruimte: r };
}

module.exports = { meiboom, meiboomCel, vel, beschrijving, proef, CEL, ANKER };

if (require.main === module) proef();
