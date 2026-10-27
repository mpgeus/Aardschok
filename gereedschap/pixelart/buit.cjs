// De buit van een roverskamp (werklijst K, 2c; ontwerp/beeld.md, "Het rovershol"; Marcel, 27 okt: "ik wil een grotere
// buit zien", en "b"): een hoop naast het vuur, in drie maten, naar hoeveel er ligt.
//   klein:  een kist en twee zakken;
//   middel: de kist open, met zilver en goud erin, een paar tonnen en zakken;
//   groot:  een hoop van zo'n twee bij twee tegels, met tonnen, zakken graan, een rol rood laken (de rode van de tent,
//           kamp.cjs), een koperen ketel, een kandelaar en een wiel van een gestolen kar.
// Eén tekening per maat, van één kant: de hoop ligt los op de grond, dus hij draait niet mee.
//
//   node gereedschap/pixelart/buit.cjs      (de proefplaat: uit/buit-proef.png, de drie maten met een boer ernaast)
//   node gereedschap/pixelart/naar-spel.cjs --alleen buit   (naar het spel: beelden/buit.png, een cel per maat)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, ruis3, rnd } = K;
const { model, kegel, capsule, blok, ellips, naarRamp } = require('./figuren.cjs');
const Bm = require('./bomen.cjs');

// ---------------------------------------------------------------- materialen

const M = { kist: 0, ijzer: 1, jute: 2, goud: 3, zilver: 4, laken: 5, koper: 6, touw: 7, duig: 8, kaars: 9 };

function materialen() {
  const mat = [];
  // De kist: eiken planken, met de naden ertussen.
  mat[M.kist] = { ramp: 'hout', lo: 0.8, hi: 4.4, patroon: (x, y, z) => (Math.abs(((z + 40) % 7.3) - 3.6) < 0.5 ? -1.1 : (ruis3(x * 0.3, y * 0.3, z * 0.1, 71) - 0.5) * 0.6) };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.8, hi: 4.0, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, 72) > 0.72 ? -0.8 : 0) };
  // Jute: het weefsel, en hier en daar een vlek.
  mat[M.jute] = { ramp: 'zand', lo: 1.6, hi: 5.4, patroon: (x, y, z) => (Math.sin(x * 2.1) * Math.sin(z * 2.1) > 0.55 ? -0.4 : 0) - (ruis3(x * 0.12, y * 0.12, z * 0.12, 73) > 0.7 ? 0.7 : 0) };
  // Goud en zilver: munten, met glimlichten.
  mat[M.goud] = { ramp: 'goud', lo: 2.2, hi: 6.6, patroon: (x, y, z) => (ruis3(x * 0.9, y * 0.9, z * 0.9, 74) > 0.6 ? 0.9 : ruis3(x * 0.9, y * 0.9, z * 0.9, 75) > 0.7 ? -0.8 : 0) };
  mat[M.zilver] = { ramp: 'ijzer', lo: 3.0, hi: 7.0, patroon: (x, y, z) => (ruis3(x * 0.9, y * 0.9, z * 0.9, 76) > 0.6 ? 0.9 : ruis3(x * 0.9, y * 0.9, z * 0.9, 79) > 0.7 ? -0.9 : 0) };
  // Het rode laken, opgerold: op de kopse kanten de windingen (ringen om de as van de rol, ROL), langs de rol een plooi.
  mat[M.laken] = {
    ramp: 'rood', lo: 1.6, hi: 5.2,
    patroon: (x, y, z) => {
      const { a, b, r } = ROL;
      const lx = b[0] - a[0];
      const ly = b[1] - a[1];
      const L = Math.hypot(lx, ly);
      const t = ((x - a[0]) * lx + (y - a[1]) * ly) / L;
      const d = Math.hypot(x - a[0] - (lx * t) / L, y - a[1] - (ly * t) / L, z - r);
      if (t < 0.6 || t > L - 0.6) return Math.sin(d * 2.4) > 0.3 ? -1.0 : 0.2;
      return Math.sin(t * 0.5 + z * 0.3) > 0.9 ? -0.6 : 0;
    },
  };
  mat[M.koper] = { ramp: 'herfst', lo: 0.8, hi: 4.4, patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 77) > 0.74 ? -1.2 : 0) };
  mat[M.touw] = { ramp: 'stro', lo: 1.2, hi: 4.2 };
  // De duigen van een ton: donker hout in banen (naar de hoek om zijn as, gezet bij het maken van de ton).
  mat[M.duig] = { ramp: 'hout', lo: 0.6, hi: 3.8, patroon: (x, y, z) => (ruis3(x * 0.25, y * 0.25, z * 0.25, 78) - 0.5) * 0.7 };
  mat[M.kaars] = { ramp: 'pleister', lo: 3.0, hi: 6.0 };
  return mat;
}

// ---------------------------------------------------------------- draaien

// Een deel gedraaid om as `as` door punt c, over `graden` (zoals gekanteld in figuren.cjs, maar voor één deel).
function gedraaid(d, as, graden, c) {
  const l = Math.hypot(as[0], as[1], as[2]);
  const [ux, uy, uz] = as.map((v) => v / l);
  const draai = (hoek) => {
    const co = Math.cos(hoek);
    const si = Math.sin(hoek);
    return (x, y, z) => {
      const p = ux * x + uy * y + uz * z;
      return [
        x * co + (uy * z - uz * y) * si + ux * p * (1 - co),
        y * co + (uz * x - ux * z) * si + uy * p * (1 - co),
        z * co + (ux * y - uy * x) * si + uz * p * (1 - co),
      ];
    };
  };
  const terug = draai((-graden * Math.PI) / 180);
  const heen = draai((graden * Math.PI) / 180);
  const g = d.g && heen(d.g[0] - c[0], d.g[1] - c[1], d.g[2] - c[2]);
  return {
    ...d,
    f: (x, y, z) => {
      const [px, py, pz] = terug(x - c[0], y - c[1], z - c[2]);
      return d.f(px + c[0], py + c[1], pz + c[2]);
    },
    g: d.g && [g[0] + c[0], g[1] + c[1], g[2] + c[2], d.g[3]],
  };
}
// Een lijst delen om de z-as door (x, y), over `graden`.
const omZ = (delen, x, y, graden) => (graden ? delen.map((d) => gedraaid(d, [0, 0, 1], graden, [x, y, 0])) : delen);

// ---------------------------------------------------------------- de dingen

// Een kist op (x, y), langs x, met ijzeren banden en een slot; `open`: het deksel achterover, met goud en zilver erin.
function kist(x, y, o = {}) {
  const d = [];
  const B = 21;
  const D = 12.5;
  const H = 21;
  d.push(blok([x, y, H / 2], [B, D, H / 2], 1.2, M.kist, 1));
  for (const s of [-1, 1]) d.push(blok([x + s * (B - 5), y, H / 2], [1.6, D + 0.6, H / 2 + 0.6], 0.4, M.ijzer, 2));
  d.push(blok([x, y + D + 0.4, H - 5], [3.2, 0.8, 3.6], 0.3, M.ijzer, 2));
  // het deksel: een halve ton langs x, dicht op de kist of achterover om de scharnier
  const deksel = {
    f: (px, py, pz) => Math.max(Math.hypot(py - y, pz - H) - D, -(pz - H), Math.abs(px - x) - B),
    g: [x, y, H + D / 2, B + D],
    m: M.kist,
    deel: 3,
  };
  const band = (s) => ({
    f: (px, py, pz) => Math.max(Math.abs(Math.hypot(py - y, pz - H) - D) - 0.9, -(pz - H), Math.abs(px - (x + s * (B - 5))) - 1.6),
    g: [x + s * (B - 5), y, H + D / 2, D + 2],
    m: M.ijzer,
    deel: 2,
  });
  const dek = [deksel, band(-1), band(1)];
  if (!o.open) d.push(...dek);
  else {
    d.push(...dek.map((p) => gedraaid(p, [1, 0, 0], 108, [x, y - D, H])));
    // het goud en het zilver, tot over de rand, en wat munten ernaast
    d.push(ellips([x - 4, y, H + 1], [B - 3, D - 2.5, 6], M.goud, 4));
    d.push(ellips([x + 9, y + 2, H + 3], [8, 6, 4.5], M.zilver, 4));
    for (let i = 0; i < 7; i++) {
      const mx = x - 18 + rnd(i, 81) * 40;
      const my = y + D + 3 + rnd(i, 82) * 9;
      d.push({ f: (px, py, pz) => sdf.cilinder(px - mx, py - my, pz, 1.9, 0, 0.9), g: [mx, my, 0.5, 2.5], m: i % 3 ? M.goud : M.zilver, deel: 4 });
    }
  }
  return omZ(d, x, y, o.draai || 0);
}

// Een zak graan op (x, y), `h` hoog, dichtgebonden, iets scheef naar `kant` ([dx, dy] bovenaan), op de grond of `op`
// eenheden hoger (op een kist of een ton).
function zak(x, y, h = 26, kant = [0, 0], op = 0) {
  const t = [x + kant[0], y + kant[1], h];
  const romp = h - 5;
  const delen = [
    {
      f: (px, py, pz) => {
        const s = pz / romp;
        const bx = px - x - kant[0] * s * 0.6;
        const by = py - y - kant[1] * s * 0.6;
        // breed en vol onderaan, naar boven wat smaller, tot de hals
        const w = 1 - (0.28 * Math.max(0, Math.min(1, s) - 0.55)) / 0.45;
        return Math.max(sdf.doos(bx / w, by / w, pz - romp / 2, 11.5, 9.5, romp / 2, 6.5) * w, -pz);
      },
      g: [x, y, romp / 2, Math.hypot(12, 10, romp / 2) + 4],
      m: M.jute,
      deel: 5,
    },
    kegel([x + kant[0] * 0.6, y + kant[1] * 0.6, romp - 2], [t[0], t[1], h - 1], 6, 2.6, M.jute, 5, 1.5),
    capsule([t[0], t[1], h - 2], [t[0], t[1], h - 0.5], 2.9, M.touw, 6),
    kegel([t[0], t[1], h - 0.5], [t[0], t[1], h + 3], 2.2, 3.6, M.jute, 5, 1),
  ];
  return op ? delen.map((d) => ({ ...d, f: (px, py, pz) => d.f(px, py, pz - op), g: [d.g[0], d.g[1], d.g[2] + op, d.g[3]] })) : delen;
}

// Een ton op (x, y), staand, of liggend langs `liggend` graden om z.
function ton(x, y, o = {}) {
  const H = 34;
  const R = 13.5;
  const d = [
    { f: (px, py, pz) => Math.max(sdf.ellipsoide(px - x, py - y, pz - H / 2, R, R, H * 0.72), Math.abs(pz - H / 2) - H / 2), g: [x, y, H / 2, Math.hypot(R, H / 2) + 1], m: M.duig, deel: 7 },
  ];
  for (const [z, r] of [[3, 12.3], [10.5, 13.3], [23.5, 13.3], [31, 12.3]]) {
    d.push({ f: (px, py, pz) => sdf.torus(px - x, py - y, pz - z, r, 1.1), g: [x, y, z, r + 1.5], m: M.ijzer, deel: 8 });
  }
  if (o.liggend == null) return d;
  // liggend: om de y-as een kwartslag, dan om z naar zijn richting, en op de grond
  const plat = d.map((p) => gedraaid(p, [0, 1, 0], 90, [x, y, R]));
  const omlaag = plat.map((p) => ({ ...p, f: (px, py, pz) => p.f(px + (H / 2 - R) * 0, py, pz + H / 2 - R), g: p.g && [p.g[0], p.g[1], p.g[2] - (H / 2 - R), p.g[3]] }));
  return omZ(omlaag, x, y, o.liggend);
}

// Een rol rood laken van a naar b (op de grond), met platte kopse kanten (de windingen: het patroon, M.laken).
const ROL = { a: [-26, 48], b: [8, 54], r: 6.5 };
function rol(a = ROL.a, b = ROL.b) {
  const r = ROL.r;
  const lx = b[0] - a[0];
  const ly = b[1] - a[1];
  const L = Math.hypot(lx, ly);
  return [{
    f: (x, y, z) => {
      const t = ((x - a[0]) * lx + (y - a[1]) * ly) / L;
      const d = Math.hypot(x - a[0] - (lx * t) / L, y - a[1] - (ly * t) / L, z - r);
      return Math.max(d - r, -t, t - L);
    },
    g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, r, L / 2 + r + 1],
    m: M.laken,
    deel: 9,
  }];
}

// Een koperen ketel op (x, y), met een hengsel.
function ketel(x, y) {
  return [
    { f: (px, py, pz) => Math.max(sdf.ellipsoide(px - x, py - y, pz - 9, 11, 11, 10), pz - 15, -pz), g: [x, y, 8, 13], m: M.koper, deel: 10 },
    { f: (px, py, pz) => sdf.torus(px - x, py - y, pz - 15, 9.6, 1.2), g: [x, y, 15, 11], m: M.koper, deel: 10 },
    gedraaid({ f: (px, py, pz) => sdf.torus(px - x, py - y, pz - 15, 9.6, 0.8), g: [x, y, 15, 11], m: M.ijzer, deel: 11 }, [1, 0, 0], 90, [x, y, 15]),
  ];
}

// Een koperen kandelaar met een kaars, op (x, y), wat scheef weggezet.
function kandelaar(x, y) {
  const d = [
    { f: (px, py, pz) => sdf.cilinder(px - x, py - y, pz, 5, 0, 1.6), g: [x, y, 1, 6], m: M.goud, deel: 12 },
    kegel([x, y, 1.6], [x, y, 6], 3.4, 1.4, M.goud, 12),
    capsule([x, y, 6], [x, y, 24], 1.2, M.goud, 12),
    kegel([x, y, 23], [x, y, 27], 1.4, 3.6, M.goud, 12),
    capsule([x, y, 27], [x, y, 36], 1.6, M.kaars, 13),
  ];
  return d.map((p) => gedraaid(p, [1, 1, 0], 8, [x, y, 0]));
}

// Een wiel van een kar, op zijn kant tegen de hoop: het midden op (x, y), schuin achterover (graden), langs `draai` om z.
function wiel(x, y, schuin = 72, draai = 0) {
  const R = 25;
  const z = R * Math.sin((schuin * Math.PI) / 180) + 2;
  const d = [{ f: (px, py, pz) => sdf.torus(px - x, py - y, pz - z, R, 2.6), g: [x, y, z, R + 3], m: M.kist, deel: 14 }];
  d.push({ f: (px, py, pz) => sdf.cilinder(px - x, py - y, pz - z + 4, 5, 0, 8), g: [x, y, z, 7], m: M.kist, deel: 14 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    d.push(capsule([x + Math.cos(a) * 4, y + Math.sin(a) * 4, z], [x + Math.cos(a) * (R - 1), y + Math.sin(a) * (R - 1), z], 1.5, M.kist, 14));
  }
  d.push({ f: (px, py, pz) => sdf.torus(px - x, py - y, pz - z, R, 2.9) + 0.0, g: [x, y, z, R + 3], m: M.ijzer, deel: 15, k: 0.4 });
  return omZ(d.map((p) => gedraaid(p, [1, 0, 0], schuin, [x, y, z])), x, y, draai);
}

// ---------------------------------------------------------------- de drie maten

const MATEN = ['klein', 'middel', 'groot'];

function buit(maat) {
  const d = [];
  if (maat === 'klein') {
    d.push(...kist(0, 0, { draai: -12 }));
    d.push(...zak(-27, 12, 24, [2, -1]), ...zak(25, 15, 27, [-1, -2]));
  } else if (maat === 'middel') {
    d.push(...kist(0, -4, { open: true, draai: -8 }));
    d.push(...ton(-33, -16), ...ton(32, -20));
    d.push(...zak(-24, 22, 25, [2, -2]), ...zak(19, 25, 27), ...zak(42, 8, 23, [-3, 0]));
  } else {
    d.push(...wiel(-66, -22, 66, 58));
    d.push(...ton(-40, -34), ...ton(36, -38), ...ton(-14, -52), ...ton(44, 14, { liggend: 20 }));
    d.push(...kist(0, -10, { open: true, draai: -6 }));
    d.push(...kist(-42, 22, { draai: 34 }));
    d.push(...zak(-12, 32, 26, [2, -2]), ...zak(11, 37, 24), ...zak(-60, 4, 25, [3, 1]), ...zak(64, -12, 27, [-2, 1]), ...zak(18, -50, 26));
    // en wat erbovenop ligt: zakken op de dichte kist en op de ton, zodat de hoop hoog wordt
    d.push(...zak(-44, 20, 22, [1, 2], 21), ...zak(-38, -34, 21, [2, 1], 34), ...zak(36, -36, 22, [-2, 2], 34));
    d.push(...rol());
    d.push(...ketel(34, 40));
    d.push(...kandelaar(-22, -8));
  }
  d.push(Bm.onderGrond);
  return model(d, materialen(), Bm.omhul(d));
}

// ---------------------------------------------------------------- de proefplaat

const CEL = [260, 200];
const ANKER = [130, 150];

function teken(m, cel = CEL, anker = ANKER, kant = 'Z') {
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

// Het vel voor het spel (naar-spel.cjs --alleen buit): de drie maten naast elkaar, een cel per maat (MATEN), met het anker
// op de grond in het midden van de hoop; js/sprites.js zoekt hem op met S.buit(maat).
function vel() {
  const uit = new K.Plaat(CEL[0] * MATEN.length, CEL[1]);
  MATEN.forEach((m, i) => uit.plak(teken(buit(m)), i * CEL[0], 0));
  return uit;
}
// Wat in beelden/beschrijving.json komt: het bestand, de maat van een cel, het anker en de volgorde van de maten.
const beschrijving = (bestand) => ({ bestand, cel: CEL, anker: ANKER, maten: MATEN });

// De drie maten naast elkaar op ware grootte, met een boer ervoor voor de maat; daaronder twee keer vergroot.
function proef() {
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  const { boer } = require('./dorpelingen.cjs');
  const FIG = [112, 124];
  const FIG_ANKER = [56, 110];
  const man = K.losRenderen(boer({ houding: 'staan', fase: 0 }), { b: FIG[0], h: FIG[1], anker: FIG_ANKER, richting: 'Z' });
  const stukken = [{ p: man, ay: FIG_ANKER[1] }, ...MATEN.map((m) => ({ p: teken(buit(m)), ay: ANKER[1] }))];
  const R = 4;
  const GAT = 10;
  let boven = 0;
  let onder = 0;
  const maten = stukken.map((s) => {
    const k = kader(s.p);
    if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= s.p.b - 1 || k.y1 >= s.p.h - 1) console.log('LET OP: een beeld raakt de rand van zijn cel');
    boven = Math.max(boven, s.ay - k.y0);
    onder = Math.max(onder, k.y1 - s.ay);
    return { ...s, x0: k.x0 - R, b: k.x1 - k.x0 + 1 + 2 * R };
  });
  const rij = new K.Plaat(maten.reduce((n, s) => n + s.b + GAT, 0), boven + onder + 1 + 2 * R);
  let x = 0;
  for (const s of maten) {
    rij.plak(s.p.uitsnede(s.x0, s.ay - boven - R, s.b, boven + onder + 1 + 2 * R), x, 0);
    x += s.b + GAT;
  }
  const groot = new K.Plaat(rij.b * 2, rij.h * 2);
  for (let y = 0; y < rij.h; y++) {
    for (let i = 0; i < rij.b; i++) {
      const c = rij.lees(i, y);
      if (c) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) groot.zet(i * 2 + b, y * 2 + a, c[0], c[1]);
    }
  }
  const samen = new K.Plaat(groot.b, rij.h + 8 + groot.h);
  samen.plak(rij, 0, 0);
  samen.plak(groot, 0, rij.h + 8);
  fs.writeFileSync(path.join(uit, 'buit-proef.png'), K.png(samen, 1, '#5e6a44'));
  console.log(`uit/buit-proef.png (${samen.b}×${samen.h})`);
}

if (require.main === module) proef();

module.exports = { buit, vel, beschrijving, MATEN, CEL, ANKER, teken };
