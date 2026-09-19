// De voorwerpen in de kamers, als 3D-modellen: dan krijgen ze hetzelfde licht en dezelfde
// omlijning als de figuren. Lokale assen als bij de figuren; y is "naar voren", bij een wandrek
// of wandlamp is dat de kamer in.
'use strict';
const { sdf, klem, mix, rnd, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, blok, plus, naarRamp } = require('./figuren.cjs');

const hout = (lo = 1, hi = 5.8, nerf = 1) => ({
  ramp: 'hout',
  lo,
  hi,
  dither: false,
  patroon: (x, y, z) => (Math.sin((x + y) * 0.35 + ruis3(x * 0.2, y * 0.2, z * 0.6, 5) * 5) > 0.82 ? -0.8 * nerf : 0),
});
const steen = (lo = 1.4, hi = 6.6) => ({
  ramp: 'steen',
  lo,
  hi,
  patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 9) > 0.74 ? -0.7 : 0),
});

// een doos gedraaid om de z-as (graden)
function draaiBlok(c, h, hoek, r, m, deel) {
  const a = (hoek * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return {
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      return sdf.doos(dx * ca + dy * sa, -dx * sa + dy * ca, z - c[2], h[0], h[1], h[2], r);
    },
    g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5],
    m,
    deel,
  };
}

// ---------------------------------------------------------------- tafel met open boek en kaars

function tafel() {
  const M = { hout: 0, blad: 1, kaft: 2, kaars: 3, vlam: 4, houder: 5, inkt: 6 };
  const mat = [];
  mat[M.hout] = hout(1, 5.6);
  mat[M.blad] = {
    ramp: 'perkament',
    lo: 2,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz < 0.7) return -1;
      const regel = (y + 20) / 1.5;
      const f = regel - Math.floor(regel);
      const kolom = Math.abs(x) > 1.4 && Math.abs(x) < 8.2 && Math.abs(y) < 5;
      return kolom && f < 0.34 && rnd(Math.floor(x * 0.9), Math.floor(regel), 3) > 0.2 ? -1.8 : 0;
    },
  };
  mat[M.kaft] = { ramp: 'rood', lo: 1, hi: 5 };
  mat[M.kaars] = { ramp: 'perkament', lo: 2.4, hi: 6.6 };
  mat[M.vlam] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(4 + 3 * kijk + (z > 49 ? -1 : 0), 3, 7) };
  mat[M.houder] = { ramp: 'goud', lo: 1.4, hi: 6.4, glans: 1.2 };
  mat[M.inkt] = { ramp: 'inkt', lo: 1, hi: 3 };
  const d = [];
  d.push(blok([0, 0, 33.6], [17, 11, 1.5], 0.6, M.hout, 1));
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) d.push(blok([sx * 14, sy * 7.8, 16.5], [1.5, 1.5, 16.5], 0.4, M.hout, 2));
  d.push(blok([0, 7.8, 9], [13, 0.9, 1], 0.3, M.hout, 2));
  // boek: kaft, twee bladzijden die naar de rug toe zakken
  d.push(blok([0, -1, 35.6], [10.4, 7.2, 0.6], 0.3, M.kaft, 3));
  for (const s of [-1, 1]) {
    d.push({
      f: (x, y, z) => {
        const dx = x - s * 5;
        const dz = z - 37 - 0.14 * s * dx;
        return sdf.doos(dx, y + 1, dz, 4.9, 6.6, 0.9, 0.4) * 0.95;
      },
      g: [s * 5, -1, 37, 9],
      m: M.blad,
      deel: 3,
    });
  }
  // kaars in een koperen houder, met vlam
  d.push(kegel([11.5, 4.5, 35.2], [11.5, 4.5, 36.4], 3.4, 3, M.houder, 4));
  d.push(kegel([11.5, 4.5, 36], [11.5, 4.5, 45], 1.5, 1.4, M.kaars, 4));
  d.push({
    f: (x, y, z) => sdf.ellipsoide(x - 11.5, y - 4.5, z - 47.6 + 0.4 * Math.max(0, z - 47.6) * 0, 1.3, 1.3, 2.6),
    g: [11.5, 4.5, 47.6, 3.5],
    m: M.vlam,
    deel: 5,
  });
  // inktpot met veer
  d.push(kegel([-12, 5, 35.2], [-12, 5, 38.4], 2, 1.6, M.inkt, 6));
  d.push(kegel([-12, 5, 38], [-15.5, 3, 48], 0.5, 0.9, M.kaars, 6));
  return model(d, mat, { midden: [0, 0, 24], straal: 32, lichten: [{ pos: [11.5, 4.5, 48], r: 95, sterk: 2.4, warm: 1, val: 1.4 }] });
}

// ---------------------------------------------------------------- fontein

function fontein() {
  const M = { steen: 0, water: 1, straal: 2 };
  const mat = [];
  mat[M.steen] = steen(1.4, 6.6);
  mat[M.water] = {
    ramp: 'water',
    lo: 1.6,
    hi: 5.6,
    glans: 2.6,
    glansMacht: 12,
    patroon: (x, y, z) => {
      const r = Math.hypot(x, y);
      const golf = Math.sin(r * 1.3 - 1) * 0.5 + Math.sin(x * 0.7 + y * 0.9) * 0.3;
      return golf > 0.45 ? 1.2 : golf < -0.5 ? -0.6 : 0;
    },
  };
  mat[M.straal] = { ramp: 'water', lo: 3.5, hi: 6.8, glans: 1 };
  const d = [];
  // bassin: rand met afgeronde kraag, van binnen uitgehold
  d.push({
    f: (x, y, z) => sdf.cilinder(x, y, z, 21, 0, 9.5),
    g: [0, 0, 5, 24],
    m: M.steen,
    deel: 1,
  });
  d.push({ f: (x, y, z) => sdf.torus(x, y, z - 9.5, 19.3, 2.2), g: [0, 0, 9.5, 22], m: M.steen, deel: 1, k: 1 });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 17, 3.5, 20), g: [0, 0, 11, 20], m: M.water, deel: 1, uit: true });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 17.2, 0, 7.4), g: [0, 0, 4, 19], m: M.water, deel: 2 });
  // zuil met schaal bovenop
  d.push(kegel([0, 0, 6], [0, 0, 25], 3.8, 2.8, M.steen, 3));
  d.push(bol([0, 0, 14], 4.4, M.steen, 3, 1));
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 7.2, 24.5, 28), g: [0, 0, 26, 9], m: M.steen, deel: 3, k: 1.2 });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 5.8, 26.4, 32), g: [0, 0, 28, 8], m: M.water, deel: 3, uit: true });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 5.9, 24, 27.3), g: [0, 0, 26, 7], m: M.water, deel: 4 });
  // vier boogjes water van de schaal naar het bassin
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const p0 = [ux * 7, uy * 7, 27.6];
    const p1 = [ux * 11, uy * 11, 25.5];
    const p2 = [ux * 13.5, uy * 13.5, 8];
    for (let k = 0; k < 4; k++) {
      const t0 = k / 4;
      const t1 = (k + 1) / 4;
      const q = (t) => [0, 1, 2].map((j) => (1 - t) * (1 - t) * p0[j] + 2 * (1 - t) * t * p1[j] + t * t * p2[j]);
      d.push(capsule(q(t0), q(t1), 0.75, M.straal, 5));
    }
  }
  return model(d, mat, { midden: [0, 0, 14], straal: 26, lichten: [{ pos: [0, 0, 20], r: 60, sterk: 0.9, warm: 0 }] });
}

// ---------------------------------------------------------------- kist, ton, zak

function kist(klein = false) {
  const h = klein ? [9, 9, 8] : [14.5, 14.5, 12.5];
  const M = { hout: 0, ijzer: 1 };
  const mat = [];
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1.2,
    hi: 6,
    patroon: (x, y, z, nx, ny, nz) => {
      const rand = h[0] - 2.6;
      if (nz > 0.7) {
        const f = (x + h[0]) / 5.8;
        return f - Math.floor(f) < 0.12 ? -1.6 : 0;
      }
      const zijU = Math.abs(nx) > Math.abs(ny) ? y : x;
      if (Math.abs(zijU) > rand) return 0.8;
      if (z > h[2] * 2 - 3 || z < 2.6) return 0.8;
      const f = z / 5;
      return f - Math.floor(f) < 0.16 ? -1.6 : Math.sin(zijU * 0.8 + z * 0.3) > 0.9 ? -0.6 : 0;
    },
  };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1, hi: 5.6, glans: 1 };
  const d = [blok([0, 0, h[2]], h, 0.8, M.hout, 1)];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const zz of [2.6, h[2] * 2 - 2.6]) d.push(blok([sx * (h[0] - 1.6), sy * (h[1] - 1.6), zz], [2, 2, 2], 0.4, M.ijzer, 1));
    }
  }
  return model(d, mat, { midden: [0, 0, h[2]], straal: Math.hypot(...h) + 2 });
}

function ton() {
  const M = { hout: 0, ijzer: 1 };
  const mat = [];
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1.2,
    hi: 6,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.7) {
        const f = (x + 20) / 4.5;
        return f - Math.floor(f) < 0.14 ? -1.4 : 0;
      }
      const a = Math.atan2(y, x);
      const f = (a / (Math.PI * 2)) * 18;
      return f - Math.floor(f) < 0.08 ? -1.4 : 0;
    },
  };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1, hi: 5.6, glans: 1.2 };
  const r = (z) => 10.6 + 1.8 * Math.sin((Math.PI * klem(z, 0, 32)) / 32);
  const d = [
    {
      f: (x, y, z) => Math.max((Math.hypot(x, y) - r(z)) * 0.9, -z, z - 32),
      g: [0, 0, 16, 20],
      m: M.hout,
      deel: 1,
    },
    { f: (x, y, z) => sdf.cilinder(x, y, z, 9.4, 31, 40), g: [0, 0, 34, 10], m: M.hout, deel: 1, uit: true },
  ];
  for (const zz of [3.5, 11, 21, 28.5]) {
    d.push({
      f: (x, y, z) => Math.max(Math.hypot(x, y) - r(zz) - 0.55, Math.abs(z - zz) - 1),
      g: [0, 0, zz, 14],
      m: M.ijzer,
      deel: 2,
    });
  }
  return model(d, mat, { midden: [0, 0, 16], straal: 22 });
}

function zak(zaad = 1) {
  const M = { jute: 0, touw: 1 };
  const mat = [];
  mat[M.jute] = {
    ramp: 'jas',
    lo: 1.8,
    hi: 6.6,
    patroon: (x, y, z) => ((Math.floor(x * 1.2) + Math.floor(z * 1.2)) % 2 === 0 ? 0.25 : -0.25) + (ruis3(x * 0.3, y * 0.3, z * 0.3, zaad) > 0.75 ? -0.8 : 0),
  };
  mat[M.touw] = { ramp: 'leer', lo: 1, hi: 5 };
  const s = 0.9 + rnd(zaad, 2) * 0.25;
  const d = [
    ellips([0, 0, 9 * s], [10.5 * s, 9 * s, 9.5 * s], M.jute, 1),
    ellips([0.5, 0.5, 17 * s], [6.5 * s, 6 * s, 5 * s], M.jute, 1, 3),
    kegel([0.6, 0.6, 20 * s], [1, 1, 25.5 * s], 2.6, 1.4, M.jute, 1, 1),
    { f: (x, y, z) => sdf.torus(x - 0.7, y - 0.7, z - 21.4 * s, 2.5, 0.8), g: [0.7, 0.7, 21.4 * s, 4], m: M.touw, deel: 2 },
    ellips([1.6, 1.6, 26.4 * s], [2.6, 2.2, 1.6], M.jute, 1, 1),
  ];
  return model(d, mat, { midden: [0, 0, 13], straal: 20 });
}

// ---------------------------------------------------------------- aan de muur

// Een wandrek met potten, flessen en boeken. y = 0 is de muur, +y de kamer in.
function wandrek(zaad = 1) {
  const M = { hout: 0, blauw: 1, groen: 2, rood: 3, goud: 4, kurk: 5, boekRood: 6, boekBlauw: 7, boekGroen: 8, boekBruin: 9, bot: 10 };
  const mat = [];
  mat[M.hout] = hout(1, 5.4, 0.6);
  const glas = (ramp) => ({ ramp, lo: 1.5, hi: 6.2, glans: 2.6, glansMacht: 16, omslag: 0.5 });
  mat[M.blauw] = glas('water');
  mat[M.groen] = glas('slijm');
  mat[M.rood] = glas('rood');
  mat[M.goud] = { ramp: 'goud', lo: 1.4, hi: 6.2, glans: 1.2 };
  mat[M.kurk] = { ramp: 'hout', lo: 3, hi: 6.4 };
  const boek = (ramp) => ({ ramp, lo: 0.8, hi: 5, patroon: (x, y, z) => (Math.abs(z % 7) < 0.8 ? 1.4 : 0) });
  mat[M.boekRood] = boek('rood');
  mat[M.boekBlauw] = boek('gewaad');
  mat[M.boekGroen] = boek('mos');
  mat[M.boekBruin] = boek('leer');
  mat[M.bot] = { ramp: 'bot', lo: 1.4, hi: 6.6 };
  const d = [];
  const planken = [46, 76];
  for (const pz of planken) {
    d.push(blok([0, 5.6, pz], [21, 5.6, 1.1], 0.3, M.hout, 1));
    for (const sx of [-15, 15]) d.push(blok([sx, 3, pz - 4.2], [1, 3, 3.2], 0.3, M.hout, 1));
  }
  const R = (i) => rnd(zaad, i);
  // onderste plank: potten en flessen
  let x = -18;
  const potten = [M.blauw, M.groen, M.rood, M.goud, M.groen, M.blauw];
  for (let i = 0; x < 16 && i < 6; i++) {
    const r = 2.4 + R(i) * 1.4;
    const hh = 6 + R(i + 10) * 5;
    const m = potten[(i + zaad) % potten.length];
    const cx = x + r;
    const z0 = planken[0] + 1.1;
    if (R(i + 20) > 0.45) {
      d.push(kegel([cx, 5.4, z0], [cx, 5.4, z0 + hh], r, r * 0.92, m, 2));
      d.push(kegel([cx, 5.4, z0 + hh], [cx, 5.4, z0 + hh + 1.4], r * 0.8, r * 0.8, M.kurk, 2));
    } else {
      d.push(bol([cx, 5.4, z0 + r], r, m, 2));
      d.push(kegel([cx, 5.4, z0 + r * 1.6], [cx, 5.4, z0 + r * 2 + 4], 1, 0.8, m, 2, 0.6));
      d.push(bol([cx, 5.4, z0 + r * 2 + 4.3], 0.9, M.kurk, 2));
    }
    x = cx + r + 1.2 + R(i + 30) * 1.5;
  }
  // bovenste plank: boeken, een paar scheef, en een schedeltje
  x = -19;
  const boeken = [M.boekRood, M.boekBlauw, M.boekBruin, M.boekGroen, M.boekRood, M.boekBruin, M.boekBlauw];
  for (let i = 0; x < 8 && i < 7; i++) {
    const w = 1.4 + R(i + 40) * 1;
    const hh = 7 + R(i + 50) * 4;
    const z0 = planken[1] + 1.1;
    d.push(blok([x + w, 5, z0 + hh / 2 + 0.6], [w, 4.2, hh / 2 + 0.6], 0.2, boeken[(i + zaad) % boeken.length], 3));
    x += w * 2 + 0.25;
  }
  if (zaad % 2 === 1) {
    const sc = [13.5, 5.6, planken[1] + 5.4];
    d.push(ellips(sc, [3.8, 4.2, 3.9], M.bot, 4));
    d.push(ellips(plus(sc, [0, 1.8, -2.4]), [2.8, 3, 2.4], M.bot, 4, 1));
    for (const s of [-1, 1]) d.push({ ...bol(plus(sc, [s * 1.5, 3.9, -0.5]), 1.2, M.kurk, 4), uit: true });
  } else {
    d.push(kegel([13, 5.6, planken[1] + 1.1], [13, 5.6, planken[1] + 6], 3.4, 3.2, M.goud, 4));
  }
  return model(d, mat, { midden: [0, 5, 62], straal: 32 });
}

// Een olielamp aan de muur, met een vlam die de muur warm kleurt.
function wandlamp() {
  const M = { ijzer: 0, messing: 1, vlam: 2 };
  const mat = [];
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1, hi: 5.4, glans: 1 };
  mat[M.messing] = { ramp: 'goud', lo: 1.2, hi: 6.4, glans: 1.6 };
  mat[M.vlam] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(4.2 + 2.8 * kijk + (z > 82 ? -1 : 0), 3, 7) };
  const d = [
    blok([0, 0.6, 78], [2.4, 0.6, 4.6], 0.3, M.ijzer, 1),
    capsule([0, 1, 76], [0, 6, 76], 0.8, M.ijzer, 1),
    capsule([0, 6, 76], [0, 7.4, 73.6], 0.8, M.ijzer, 1),
    ellips([0, 7.6, 72.6], [3.6, 3.6, 1.8], M.messing, 2),
    kegel([0, 9.6, 72.8], [0, 11.4, 73.6], 1, 0.7, M.messing, 2, 0.6),
    ellips([0, 7.6, 77.2], [1.5, 1.5, 3.2], M.vlam, 3),
  ];
  return model(d, mat, { midden: [0, 5, 76], straal: 10, lichten: [{ pos: [0, 8, 77], r: 200, sterk: 3.2, warm: 1, val: 1.3, zacht: 0.7 }] });
}

// ---------------------------------------------------------------- puin en sleutel

function puin(zaad = 1, n = 7) {
  const mat = [steen(1.2, 6.4)];
  const d = [];
  for (let i = 0; i < n; i++) {
    const a = rnd(zaad, i) * Math.PI * 2;
    const r = rnd(zaad, i + 20) * 18;
    const s = 2 + rnd(zaad, i + 40) * 3.6;
    d.push(draaiBlok([Math.cos(a) * r, Math.sin(a) * r, s * 0.55], [s, s * 0.8, s * 0.6], rnd(zaad, i + 60) * 90, s * 0.3, 0, 1));
  }
  return model(d, mat, { midden: [0, 0, 3], straal: 26 });
}

function sleutel() {
  const mat = [{ ramp: 'goud', lo: 2, hi: 6.8, glans: 2.4, glansMacht: 10 }];
  const d = [
    { f: (x, y, z) => sdf.torus(x + 5.6, y, z - 1, 3, 0.95), g: [-5.6, 0, 1, 4.5], m: 0, deel: 1 },
    capsule([-2.6, 0, 1], [7.4, 0, 1], 0.85, 0, 1),
    blok([6, 1.6, 1], [0.7, 1.2, 0.7], 0.2, 0, 1),
    blok([7.4, 1.4, 1], [0.6, 1, 0.7], 0.2, 0, 1),
  ];
  return model(d, mat, { midden: [0, 0, 1], straal: 11 });
}

// De vuurschicht onderweg: een kop van vuur met een staart die naar achteren uitdunt.
function vuurschicht() {
  const mat = [
    { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(5.2 + 1.8 * kijk + y * 0.12, 2, 7) },
    { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(3.4 + 2 * kijk + y * 0.1, 1, 6) },
  ];
  const d = [bol([0, 0, 0], 6.2, 0, 1)];
  d.push(kegel([0, -1, 0], [0, -27, 2], 5.8, 0.9, 1, 1, 2.4));
  for (const [x, y, z, r] of [[3.4, -11, 3, 2.1], [-3.2, -15, -1.8, 1.9], [1.6, -21, -3, 1.4], [-1.8, -8, 4.4, 2], [0.6, -30, 3.6, 1]]) d.push(bol([x, y, z], r, 1, 1, 2));
  return model(d, mat, { midden: [0, -11, 0], straal: 22, lichten: [{ pos: [0, 0, 0], r: 160, sterk: 5, warm: 1, val: 1.1, zacht: 0.8 }] });
}

module.exports = { vuurschicht, tafel, fontein, kist, ton, zak, wandrek, wandlamp, puin, sleutel, draaiBlok };
