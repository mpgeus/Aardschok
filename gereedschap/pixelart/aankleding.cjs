// De aankleding van een roverskamp (werklijst K, 2c; ontwerp/beeld.md, "Het rovershol"; Marcel, 27 okt: "Ook is het kamp
// een beetje saai zo. Alles valt en staat met de aankleding", en op het voorstel "alle negen"): de spullen die laten zien
// wie er wonen en wat ze doen. Elk ding is een klein model, met zijn voorkant naar +y en het midden op de grond:
//   1. rond het vuur: een zitstam (een met een bijl erin), en een spit met een half geroosterd zwijn boven een bed kolen;
//   2. bij de tenten: een slaapvel met een deken, en een waslijn met gestolen kleren;
//   3. wapens: een rek met speren, knuppels en een boog, en een schietschijf van stro met pijlen;
//   4. hout: een hakblok met een bijl, en een stapel gekloofd brandhout;
//   5. drank: een vat bier op een bok met een kraan, met kruiken en bekers eromheen;
//   6. jacht: een hertenvel op een droograam, en een paal met gestroopte konijnen;
//   7. gestolen: een kapotte kar zonder wiel, met zakken erin;
//   8. licht: een fakkel op een paal;
//   9. de grond: een modderplas, stro, en een uitgesleten paadje.
// Het kamp krijgt ze later vanzelf, met een vast lot op vrije plekken, zoals de soorten paal (palissade.cjs); nu eerst de
// proefplaat van het aangeklede hol.
//
//   node gereedschap/pixelart/aankleding.cjs     (de proefplaat: uit/aankleding-proef.png, het hele hol)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { TEGEL, sdf, ruis3, rnd } = K;
const { model, kegel, capsule, blok, ellips, bochtKegel, naarRamp, gedraaid, omZ } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');

// ---------------------------------------------------------------- materialen

const M = {
  schors: 0, kern: 1, hout: 2, ijzer: 3, touw: 4, vacht: 5, deken: 6, jurk: 7, hemd: 8, stro: 9, leer: 10,
  gebraden: 11, bot: 12, klei: 13, vuur: 14, kolen: 15, modder: 16, pad: 17, jute: 18, huid: 19,
};

function materialen() {
  const mat = [];
  const schors = Bm.schorsMat({ zaad: 21, ramp: 'schors', lo: 0.8, hi: 4.6, rek: 0.06 });
  mat[M.schors] = schors;
  mat[M.kern] = { ramp: 'hout', lo: 2.8, hi: 5.6, patroon: (x, y, z) => (Math.sin(Math.hypot(x, y, z) * 1.6) > 0.7 ? -0.6 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 0.9, hi: 4.6, patroon: (x, y, z) => (ruis3(x * 0.3, y * 0.3, z * 0.1, 81) - 0.5) * 0.7 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.0, hi: 5.0 };
  mat[M.touw] = { ramp: 'stro', lo: 1.2, hi: 4.2 };
  mat[M.vacht] = { ramp: 'vacht', lo: 1.0, hi: 5.0, patroon: (x, y, z) => (ruis3(x * 0.7, y * 0.7, z * 0.7, 82) > 0.6 ? -0.8 : 0) };
  mat[M.deken] = { ramp: 'gewaad', lo: 1.2, hi: 4.6, patroon: (x) => (((x + 60) % 7) < 1.2 ? -1.0 : 0) };
  mat[M.jurk] = { ramp: 'rood', lo: 1.6, hi: 5.2, patroon: (x, y, z) => (Math.sin(x * 0.8) > 0.75 ? -0.7 : 0) };
  mat[M.hemd] = { ramp: 'pleister', lo: 1.6, hi: 5.6, patroon: (x, y, z) => (Math.sin(x * 0.9 + z * 0.2) > 0.8 ? -0.7 : 0) };
  mat[M.stro] = { ramp: 'stro', lo: 1.6, hi: 5.6, patroon: (x, y) => (Math.sin(x * 1.3 + y * 0.4) > 0.6 ? -0.8 : 0) };
  mat[M.leer] = { ramp: 'leer', lo: 1.0, hi: 4.8 };
  // het zwijn aan het spit: bruin gebraden, met donkere randen en glimlicht van het vet
  mat[M.gebraden] = { ramp: 'herfst', lo: 0.6, hi: 4.2, patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 83) > 0.7 ? -1.1 : ruis3(x * 0.5, y * 0.5, z * 0.5, 84) > 0.8 ? 0.8 : 0) };
  mat[M.bot] = { ramp: 'bot', lo: 3.0, hi: 7.0 };
  mat[M.klei] = { ramp: 'aarde', lo: 2.0, hi: 6.0 };
  mat[M.vuur] = { ramp: 'vuur', lo: 3.5, hi: 7.6 };
  mat[M.kolen] = { ramp: 'inkt', lo: 0.2, hi: 1.6, patroon: (x, y, z, nx, ny, nz, stap) => (ruis3(x * 0.5, y * 0.5, 0, 85) > 0.6 ? naarRamp('vuur', stap, [0.2, 1.6], [2.0, 5.0]) : 0) };
  mat[M.modder] = { ramp: 'aarde', lo: 0.4, hi: 2.2, patroon: (x, y) => (ruis3(x * 0.3, y * 0.3, 0, 86) > 0.72 ? 1.4 : 0) };
  mat[M.pad] = { ramp: 'aarde', lo: 1.6, hi: 3.6, patroon: (x, y) => (ruis3(x * 0.2, y * 0.2, 0, 87) - 0.5) * 1.2 };
  mat[M.jute] = { ramp: 'zand', lo: 1.6, hi: 5.2 };
  mat[M.huid] = { ramp: 'leer', lo: 1.8, hi: 5.6, patroon: (x, y, z) => (ruis3(x * 0.3, y * 0.3, z * 0.3, 88) > 0.65 ? -0.8 : 0) };
  return mat;
}
const MAT = materialen();
const maak = (d) => model([...d, Bm.onderGrond], MAT, Bm.omhul(d));

// Een cilinder langs x van -l tot l, met straal r, op hoogte z (een stam op de grond, een vat dat ligt).
const cilinderX = (x, y, z, l, r, m, deel) => ({
  f: (px, py, pz) => Math.max(Math.hypot(py - y, pz - z) - r, Math.abs(px - x) - l),
  g: [x, y, z, Math.hypot(l, r) + 1],
  m,
  deel,
});

// ---------------------------------------------------------------- 1. rond het vuur

// Een zitstam langs x, met de jaarringen op de kopse kanten; `bijl`: een bijl erin geslagen.
function zitstam({ lang = 30, bijl = false } = {}) {
  const r = 7.5;
  const d = [cilinderX(0, 0, r - 1, lang, r, M.schors, 1)];
  for (const s of [-1, 1]) d.push(cilinderX(s * (lang + 0.3), 0, r - 1, 0.6, r - 0.6, M.kern, 2));
  if (bijl) d.push(...bijlIn([10, 0, 2 * r - 2]));
  return maak(d);
}
// Een bijl met zijn blad in punt p (het blad langs x), de steel schuin omhoog.
function bijlIn(p) {
  return [
    blok([p[0], p[1], p[2] + 1], [5, 1, 3.5], 0.5, M.ijzer, 3),
    capsule([p[0] + 1, p[1], p[2] + 3], [p[0] + 10, p[1] + 3, p[2] + 24], 1.3, M.hout, 4),
  ];
}

// Een spit met een half geroosterd zwijn boven een bed kolen: twee gevorkte stokken, het spit, en botten in de as.
function spit() {
  const d = [];
  d.push(ellips([0, 0, 0.6], [26, 12, 2], M.kolen, 1));
  for (const s of [-1, 1]) {
    const x = s * 30;
    d.push(capsule([x, 0, 0], [x, 0, 30], 1.4, M.schors, 2));
    d.push(capsule([x, 0, 28], [x - 3, 0, 36], 1, M.schors, 2));
    d.push(capsule([x, 0, 28], [x + 3, 0, 36], 1, M.schors, 2));
  }
  d.push(capsule([-36, 0, 31], [36, 0, 31], 1, M.hout, 3));
  d.push(ellips([0, 0, 30], [17, 8, 8], M.gebraden, 4));
  d.push(ellips([18, 0, 31], [7, 5.5, 5.5], M.gebraden, 4));
  d.push(kegel([23, 0, 30], [29, 0, 28], 3, 2, M.gebraden, 4));
  for (const [x, s] of [[-9, -1], [-9, 1], [9, -1], [9, 1]]) d.push(capsule([x, s * 5, 26], [x + 3, s * 7, 21], 1.8, M.gebraden, 4));
  // botten in de as
  d.push(capsule([-14, 9, 1], [-6, 12, 1.5], 1.2, M.bot, 5), capsule([8, -10, 1], [14, -7, 1], 1.1, M.bot, 5));
  return maak(d);
}

// ---------------------------------------------------------------- 2. bij de tenten

// Een slaapvel voor een tent, met een deken half erover.
function slaapvel() {
  return maak([
    ellips([0, 0, 1.4], [20, 13, 1.6], M.vacht, 1),
    blok([5, 4, 2.6], [12, 8, 1.2], 0.8, M.deken, 2),
    cilinderX(-12, -8, 3.6, 7, 3.4, M.deken, 2),
  ]);
}

// Een waslijn tussen twee stokken (lang tegels uit elkaar), met een rode jurk, een hemd en twee kousen.
function waslijn({ lang = 2.2 } = {}) {
  const l = (lang * TEGEL) / 2;
  const d = [];
  for (const s of [-1, 1]) d.push(capsule([s * l, 0, 0], [s * l, 0, 62], 1.8, M.schors, 1));
  d.push(...bochtKegel([-l, 0, 60], [0, 0, 54], [l, 0, 60], 0.5, 0.5, 6, M.touw, 2));
  // de kleren hangen onder de lijn (die daar zo'n 56 hoog is): een jurk met mouwen, plat, wijder naar de zoom
  const jx = -l * 0.45;
  const breed = (z) => (z > 47 ? 6.5 : z > 43 ? 4.6 : 4.6 + ((43 - z) / 13) * 6.5);
  d.push({ f: (px, py, pz) => Math.max(Math.abs(py) - 0.8, Math.abs(px - jx) - breed(pz), pz - 55, 30 - pz), g: [jx, 0, 43, 16], m: M.jurk, deel: 3 });
  for (const s of [-1, 1]) d.push(capsule([jx + s * 6, 0, 53], [jx + s * 11, 0, 46], 1.8, M.jurk, 3));
  d.push(blok([l * 0.05, 0, 47], [9, 0.8, 8], 0.6, M.hemd, 4));
  for (const x of [l * 0.4, l * 0.55]) d.push(capsule([x, 0, 54], [x + 1, 0, 42], 1.8, M.deken, 5));
  return maak(d);
}

// ---------------------------------------------------------------- 3. wapens

// Een wapenrek: twee palen met een dwarslat, drie speren en twee knuppels ertegen, en een boog.
function wapenrek() {
  const d = [];
  for (const s of [-1, 1]) d.push(capsule([s * 24, 0, 0], [s * 24, 0, 50], 2, M.schors, 1));
  d.push(capsule([-27, 0, 46], [27, 0, 46], 1.6, M.schors, 1));
  for (const [i, x] of [-16, -8, 0].entries()) {
    d.push(capsule([x, -9, 0], [x + 1, 1.5, 76], 1, M.hout, 2));
    d.push(kegel([x + 1, 1.5, 76], [x + 1.15, 2, 86], 1.8, 0.2, M.ijzer, 3, 0.6 + i * 0));
  }
  for (const x of [9, 15]) d.push(kegel([x, -8, 0], [x, 1.5, 44], 1.3, 3.6, M.hout, 4));
  d.push(...bochtKegel([20, -2, 6], [28, -5, 30], [20, -2, 56], 1.1, 1.1, 6, M.hout, 5));
  d.push(capsule([20, -2, 6], [20, -2, 56], 0.4, M.touw, 6));
  return maak(d);
}

// Een schietschijf van stro op drie poten, de voorkant naar +y, met rode ringen en drie pijlen erin.
function schietschijf() {
  const d = [];
  const z = 32;
  const r = 17;
  for (const [x, y] of [[-12, -6], [12, -6], [0, -16]]) d.push(capsule([x, y, 0], [0, -2, z + 4], 1.4, M.schors, 1));
  d.push({
    f: (px, py, pz) => Math.max(Math.hypot(px, pz - z) - r, Math.abs(py) - 3.2),
    g: [0, 0, z, r + 4],
    m: M.stro,
    deel: 2,
  });
  // de rode ringen op de voorkant: een ring, en het hart
  d.push({ f: (px, py, pz) => Math.max(Math.abs(Math.hypot(px, pz - z) - 10) - 1.6, Math.abs(py - 3) - 0.6), g: [0, 3, z, 13], m: M.jurk, deel: 3 });
  d.push({ f: (px, py, pz) => Math.max(Math.hypot(px, pz - z) - 3.2, Math.abs(py - 3) - 0.6), g: [0, 3, z, 4], m: M.jurk, deel: 3 });
  for (const [x, h] of [[-4, 6], [7, -3], [2, 11]]) {
    d.push(capsule([x, 2, z + h], [x + 2, 20, z + h + 3], 0.6, M.hout, 4));
    d.push(blok([x + 2, 20, z + h + 3], [0.4, 2.2, 1.6], 0.2, M.hemd, 5));
  }
  return maak(d);
}

// ---------------------------------------------------------------- 4. hout

// Een hakblok met een bijl erin, en wat spaanders.
function hakblok() {
  const d = [
    { f: (px, py, pz) => sdf.cilinder(px, py, pz, 13, 0, 22), g: [0, 0, 11, 17], m: M.schors, deel: 1 },
    { f: (px, py, pz) => sdf.cilinder(px, py, pz - 22, 12.4, -0.2, 0.6), g: [0, 0, 22, 13], m: M.kern, deel: 2 },
    ...bijlIn([2, 0, 23]),
  ];
  for (let i = 0; i < 5; i++) {
    const a = rnd(91, i) * Math.PI * 2;
    const r = 16 + rnd(92, i) * 8;
    d.push(blok([Math.cos(a) * r, Math.sin(a) * r, 0.6], [2.4, 1.2, 0.5], 0.3, M.kern, 5));
  }
  return maak(d);
}
// Een stapel gekloofd brandhout langs x: drie lagen blokken, de kopse kanten licht.
function brandhout() {
  const d = [];
  const rij = [5, 4, 3];
  rij.forEach((n, laag) => {
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 11;
      const z = 5 + laag * 9;
      d.push({ f: (px, py, pz) => Math.max(Math.hypot(px - x, pz - z) - 5.2, Math.abs(py) - 16), g: [x, 0, z, 17], m: M.schors, deel: 1 });
      d.push({ f: (px, py, pz) => Math.max(Math.hypot(px - x, pz - z) - 4.8, Math.abs(py - 16) - 0.5), g: [x, 16, z, 6], m: M.kern, deel: 2 });
    }
  });
  return maak(d);
}

// ---------------------------------------------------------------- 5. drank

// Een vat bier op een bok, met een kraan naar +y, en twee kruiken en drie bekers eromheen (een kruik en een beker om).
function bierbok() {
  const d = [];
  for (const s of [-1, 1]) {
    d.push(capsule([s * 16, -12, 0], [s * 16, 8, 24], 1.6, M.schors, 1));
    d.push(capsule([s * 16, 12, 0], [s * 16, -8, 24], 1.6, M.schors, 1));
  }
  // het vat langs x, met zijn hoepels
  const z = 36;
  d.push({ f: (px, py, pz) => Math.max(sdf.ellipsoide(px / 1.0, py, pz - z, 24, 13, 13), Math.abs(px) - 18), g: [0, 0, z, 26], m: M.hout, deel: 2 });
  for (const x of [-15, -6, 6, 15]) d.push({ f: (px, py, pz) => Math.max(Math.abs(Math.hypot(py, pz - z) - (x * x > 100 ? 11.4 : 12.8)) - 0.9, Math.abs(px - x) - 1), g: [x, 0, z, 14], m: M.ijzer, deel: 3 });
  d.push(capsule([0, 11, z - 4], [0, 16, z - 6], 1.2, M.hout, 4));
  // kruiken en bekers
  const kruik = (x, y) => [ellips([x, y, 7], [5, 5, 7], M.klei, 5), kegel([x, y, 12], [x, y, 17], 2.6, 2, M.klei, 5), { f: (px, py, pz) => sdf.torus(px - x - 5, pz - 11, py - y, 2.6, 0.7), g: [x + 5, y, 11, 4], m: M.klei, deel: 5 }];
  d.push(...kruik(-22, 18));
  d.push(...kruik(14, 20).map((p) => gedraaid(p, [0, 1, 0], 80, [14, 20, 0])).map((p) => ({ ...p, f: (px, py, pz) => p.f(px, py, pz + 0.5) })));
  const beker = (x, y) => ({ f: (px, py, pz) => sdf.cilinder(px - x, py - y, pz, 2.6, 0, 6), g: [x, y, 3, 5], m: M.hout, deel: 6 });
  d.push(beker(-8, 22), beker(26, 6), gedraaid(beker(4, 24), [1, 0, 0], 90, [4, 24, 2.6]));
  return maak(d);
}

// ---------------------------------------------------------------- 6. jacht

// Een hertenvel gespannen op een droograam van vier stokken, schuin achterover, met de veters ertussen.
function droograam() {
  const d = [];
  const B = 24;
  const H = 52;
  const raam = [
    capsule([-B, 0, 0], [-B, -8, H + 6], 1.6, M.schors, 1),
    capsule([B, 0, 0], [B, -8, H + 6], 1.6, M.schors, 1),
    capsule([-B - 3, -1, 8], [B + 3, -1, 8], 1.4, M.schors, 1),
    capsule([-B - 3, -7.5, H], [B + 3, -7.5, H], 1.4, M.schors, 1),
  ];
  d.push(...raam);
  // het vel: een vlakke, grillige lap in het vlak van het raam
  d.push({
    f: (px, py, pz) => {
      const t = (pz - 8) / (H - 8);
      const vlak = Math.abs(py + 1 + 6.5 * t) - 0.9;
      const u = px / (B - 5);
      const v = (pz - (H + 8) / 2) / ((H - 8) / 2 - 4);
      const rand = Math.pow(Math.abs(u) ** 2.4 + Math.abs(v) ** 2.4, 1 / 2.4) - 1 + (ruis3(px * 0.2, 0, pz * 0.2, 89) - 0.5) * 0.25;
      return Math.max(vlak, rand * 10);
    },
    g: [0, -4, (H + 8) / 2, Math.hypot(B, H / 2) + 2],
    m: M.huid,
    deel: 2,
  });
  for (const [x, z] of [[-B + 2, 18], [-B + 2, 40], [B - 2, 22], [B - 2, 44]]) d.push(capsule([x, -2, z], [x + Math.sign(x) * -5, -4, z + 2], 0.5, M.touw, 3));
  return maak(d);
}
// Een paal met een dwarslat en drie gestroopte konijnen aan een touwtje.
function konijnenpaal() {
  const d = [capsule([0, 0, 0], [0, 0, 64], 2, M.schors, 1), capsule([-16, 0, 58], [16, 0, 58], 1.4, M.schors, 1)];
  for (const [i, x] of [-11, -2, 8].entries()) {
    const top = 50 - i * 2;
    d.push(capsule([x, 0, 58], [x, 0, top + 2], 0.4, M.touw, 2));
    d.push(ellips([x, 0, top - 8], [3.4, 3, 9], M.vacht, 3));
    d.push(capsule([x - 1, 0, top - 17], [x - 1.6, 0, top - 23], 1, M.vacht, 3), capsule([x + 1, 0, top - 17], [x + 1.6, 0, top - 23], 1, M.vacht, 3));
  }
  return maak(d);
}

// ---------------------------------------------------------------- 7. gestolen

// Een kapotte kar: de bak scheef op één wiel (het andere is weg, de as rust op de grond), met twee zakken erin, en de
// dissel op de grond.
function kar() {
  const d = [];
  const z = 22;
  d.push(blok([0, 0, z], [30, 17, 1.6], 0.6, M.hout, 1));
  for (const s of [-1, 1]) d.push(blok([0, s * 17, z + 7], [30, 1.2, 6], 0.4, M.hout, 1), blok([s * 30, 0, z + 7], [1.2, 17, 6], 0.4, M.hout, 1));
  d.push(capsule([0, -20, 15], [0, 20, 15], 2, M.hout, 2));
  d.push(gedraaid({ f: (px, py, pz) => sdf.torus(px, pz - 15, py - 21, 14, 1.8), g: [0, 21, 15, 17], m: M.hout, deel: 3 }, [0, 0, 1], 0, [0, 0, 0]));
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    d.push(capsule([0, 21, 15], [Math.cos(a) * 13, 21, 15 + Math.sin(a) * 13], 1, M.hout, 3));
  }
  d.push(ellips([-12, 2, z + 8], [9, 8, 9], M.jute, 4), ellips([6, -4, z + 7], [9, 8, 8], M.jute, 4));
  d.push(capsule([30, 6, 2], [80, 10, 1.6], 1.8, M.hout, 5), capsule([30, -6, 2], [80, -2, 1.6], 1.8, M.hout, 5));
  // de bak helt over naar de kant zonder wiel (-y): om de x-as, door het wiel
  return maak(d.map((p) => gedraaid(p, [1, 0, 0], -14, [0, 21, 1])));
}

// ---------------------------------------------------------------- 8. licht

// Een fakkel op een paal: een kop van gewikkelde lappen met een vlam erboven.
function fakkel() {
  return maak([
    capsule([0, 0, 0], [0, 0, 70], 2, M.schors, 1),
    ellips([0, 0, 74], [3.6, 3.6, 6], M.leer, 2),
    kegel([0, 0, 78], [0.6, 0, 96], 4.2, 0.4, M.vuur, 3),
    kegel([1.6, 0.6, 79], [2.6, 0.8, 90], 2.4, 0.3, M.vuur, 3),
  ]);
}

// ---------------------------------------------------------------- 9. de grond

// Een modderplas, met plekken water die glimmen.
const modderplas = (a = 22, b = 15) => maak([ellips([0, 0, 0.2], [a, b, 0.7], M.modder, 1)]);
// Een pluk stro op de grond: korte halmen kriskras.
function stro() {
  const d = [];
  for (let i = 0; i < 18; i++) {
    const a = rnd(93, i) * Math.PI;
    const x = (rnd(94, i) - 0.5) * 26;
    const y = (rnd(95, i) - 0.5) * 18;
    d.push(capsule([x - Math.cos(a) * 6, y - Math.sin(a) * 6, 0.6], [x + Math.cos(a) * 6, y + Math.sin(a) * 6, 0.6], 0.7, M.stro, 1));
  }
  return maak(d);
}
// Een uitgesleten paadje van lengte l (eenheden) langs x, een tegel breed, met rafelige randen.
function paadje(l) {
  return maak([{
    f: (px, py, pz) => Math.max(Math.abs(py) - 15 - (ruis3(px * 0.08, 0, 0, 96) - 0.5) * 10, Math.abs(px) - l / 2, Math.abs(pz - 0.1) - 0.15),
    g: [0, 0, 0, l / 2 + 20],
    m: M.pad,
    deel: 1,
  }]);
}

// ---------------------------------------------------------------- de proefplaat

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

// Het aangeklede hol, zoals op de proefplaat van de palissade: de ring met de poort naar de kijker (wereld +x en +y), het
// vuur in het midden, twee tenten, de grote buit, en alle negen soorten aankleding; een boer bij de poort voor de maat.
// Plekken in tegels van de wereld vanaf het vuur; een richting draait het ding (zijn voorkant, +y, wijst dan zo).
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const Kamp = require('./kamp.cjs');
  const Pal = require('./palissade.cjs');
  const Buit = require('./buit.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const CEL = [1040, 800];
  const ANKER = [520, 400];
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  const zet = (m, gx, gy, richting = 'Z') => K.tekenModel(B, m, { richting, gx, gy });
  // de grond eerst: het paadje van de poort naar het vuur, modder en stro
  zet(paadje(5.4 * TEGEL), 2.7, 2.7, 'ZW');
  zet(modderplas(), 2.2, 3.8);
  zet(modderplas(16, 11), -3.2, 2.6, 'ZO');
  zet(stro(), -2.6, 0.9);
  zet(stro(), 0.9, -2.6);
  // de ring, het vuur, de tenten en de buit
  for (const m of Pal.ring({ poort: 45 })) zet(m, 0, 0, 'ZO');
  zet(Kamp.kampvuur({ stand: 'smeult' }), 0, 0);
  zet(Kamp.tent({ rover: true, zaad: 5 }), -4, 0, 'ZO');
  zet(Kamp.tent({ rover: true, zaad: 5 }), 0, -4, 'ZW');
  zet(Buit.buit('groot'), 2, -2);
  // 1. rond het vuur drie zitstammen (niet op het paadje), en het spit links voor het vuur
  zet(zitstam({ bijl: true }), -1.8, 0.6, 'ZW');
  zet(zitstam({ lang: 26 }), 0.6, -1.8, 'ZO');
  zet(zitstam({ lang: 22 }), -1.4, -1.4, 'Z');
  zet(spit(), -1.0, 2.7, 'ZO');
  // 2. bij de tenten
  zet(slaapvel(), -2.7, 0.2, 'ZO');
  zet(slaapvel(), 0.2, -2.7, 'ZW');
  zet(waslijn(), -2.7, -2.7, 'Z');
  // 3. wapens: het rek achter tegen de palissade, de schijf achter de buit
  zet(wapenrek(), 1.4, -5.9, 'ZW');
  zet(schietschijf(), 3.4, -4.8, 'ZW');
  // 4. hout, achter tegen de palissade
  zet(hakblok(), -4.0, -3.8);
  zet(brandhout(), -1.4, -5.9, 'ZW');
  // 5. drank, voor het vuur naast het paadje
  zet(bierbok(), 1.8, 3.0, 'ZW');
  // 6. jacht, links
  zet(droograam(), -5.8, -0.6, 'ZO');
  zet(konijnenpaal(), -4.7, -2.4, 'ZO');
  // 7. gestolen: de kar links voor
  zet(kar(), -4.2, 3.2, 'ZO');
  // 8. de fakkels, net binnen de poort
  zet(fakkel(), 4.9, 3.2);
  zet(fakkel(), 3.2, 4.9);
  zet(boer({ houding: 'staan', fase: 0 }), 6.4, 6.4);
  K.belicht(B);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  const k = kader(plaat);
  if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= plaat.b - 1 || k.y1 >= plaat.h - 1) console.log('LET OP: het hol raakt de rand van de cel');
  const R = 6;
  const snede = plaat.uitsnede(Math.max(0, k.x0 - R), Math.max(0, k.y0 - R), Math.min(plaat.b, k.x1 - k.x0 + 1 + 2 * R), Math.min(plaat.h, k.y1 - k.y0 + 1 + 2 * R));
  // daaronder het binnenste twee keer vergroot
  const midden = snede.uitsnede(Math.floor(snede.b * 0.18), Math.floor(snede.h * 0.12), Math.floor(snede.b * 0.64), Math.floor(snede.h * 0.66));
  const groot = new K.Plaat(midden.b * 2, midden.h * 2);
  for (let y = 0; y < midden.h; y++) {
    for (let x = 0; x < midden.b; x++) {
      const c = midden.lees(x, y);
      if (c) for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) groot.zet(x * 2 + i, y * 2 + j, c[0], c[1]);
    }
  }
  const samen = new K.Plaat(Math.max(groot.b, snede.b), snede.h + 10 + groot.h);
  samen.plak(snede, Math.floor((samen.b - snede.b) / 2), 0);
  samen.plak(groot, Math.floor((samen.b - groot.b) / 2), snede.h + 10);
  fs.writeFileSync(path.join(uit, 'aankleding-proef.png'), K.png(samen, 1, '#5e6a44'));
  console.log(`uit/aankleding-proef.png (${samen.b}×${samen.h})`);
}

if (require.main === module) proef();

module.exports = { zitstam, spit, slaapvel, waslijn, wapenrek, schietschijf, hakblok, brandhout, bierbok, droograam, konijnenpaal, kar, fakkel, modderplas, stro, paadje, omZ };
