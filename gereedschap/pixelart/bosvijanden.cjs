// De vijanden in het bos naast het dorp: de wolf, de reuzenspin en de kobold. Met dezelfde
// bouwstenen als de tovenaar en het skelet (figuren.cjs, figuren2.cjs). Lokale assen als bij de
// figuren: x naar rechts, y naar voren (ook bij de viervoeters), z omhoog, de voeten op z = 0.
'use strict';
const { sdf, klem, mix, ruis3, rnd } = require('./kern.cjs');
const { model, kegel, bol, ellips, plus, naarRamp } = require('./figuren.cjs');

// ---------------------------------------------------------------- bouwstenen

// Een kegel langs een kwadratische bezier met een eigen dikteverloop r(t): voor een pluimstaart,
// een spinnenpoot of een oor dat in het midden het breedst is. Met van en tot alleen dat stuk
// van de bocht (r krijgt dan nog steeds de t van de hele bocht), bijvoorbeeld voor een band.
function bochtProfiel(p0, p1, p2, r, n, m, deel, k = 1, van = 0, tot = 1) {
  const punt = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  const delen = [];
  for (let i = 0; i < n; i++) {
    const t0 = mix(van, tot, i / n);
    const t1 = mix(van, tot, (i + 1) / n);
    delen.push(kegel(punt(t0), punt(t1), r(t0), r(t1), m, deel, i === 0 && van === 0 ? undefined : k));
  }
  return delen;
}

// Een platgedrukte kegel (een oor): in de richting van n is hij maar een fractie plat zo dik.
function platteKegel(a, b, r1, r2, n, plat, m, deel, k) {
  const l = Math.hypot(...n);
  const [nx, ny, nz] = n.map((v) => v / l);
  const c = 1 / plat - 1;
  return {
    f: (x, y, z) => {
      // de afstand langs n rekt uit rond a; daarna een gewone ronde kegel
      const h = (x - a[0]) * nx + (y - a[1]) * ny + (z - a[2]) * nz;
      return sdf.rondeKegel(x + nx * h * c, y + ny * h * c, z + nz * h * c, a[0], a[1], a[2], b[0], b[1], b[2], r1, r2) * plat;
    },
    g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + Math.max(r1, r2) + 0.5],
    m,
    deel,
    k,
  };
}

// Een spits blad als plaatje: de doorsnede van twee cirkels (een vesica), met een dikte. c is
// het midden, t de richting van de breedte, d de richting van de steel naar de punt.
function blad(c, t, d, lengte, breedte, dikte, m, deel, k) {
  const T = eenheid(t);
  const dt = d[0] * T[0] + d[1] * T[1] + d[2] * T[2];
  const L = eenheid([d[0] - T[0] * dt, d[1] - T[1] * dt, d[2] - T[2] * dt]);
  const N = [T[1] * L[2] - T[2] * L[1], T[2] * L[0] - T[0] * L[2], T[0] * L[1] - T[1] * L[0]];
  const b = lengte / 2;
  const h = breedte / 2;
  // twee cirkels met straal r op (±e, 0): r - e = h (halve breedte), r² - e² = b² (de punten)
  const r = ((b * b) / h + h) / 2;
  const e = r - h;
  return {
    f: (x, y, z) => {
      const px = x - c[0];
      const py = y - c[1];
      const pz = z - c[2];
      const u = Math.abs(px * T[0] + py * T[1] + pz * T[2]);
      const v = Math.abs(px * L[0] + py * L[1] + pz * L[2]);
      const w = Math.abs(px * N[0] + py * N[1] + pz * N[2]);
      const d2 = (v - b) * e > u * b ? Math.hypot(u, v - b) : Math.hypot(u + e, v) - r;
      const dw = w - dikte;
      return Math.min(Math.max(d2, dw), 0) + Math.hypot(Math.max(d2, 0), Math.max(dw, 0));
    },
    g: [c[0], c[1], c[2], b + dikte + 0.5],
    m,
    deel,
    k,
  };
}
const eenheid = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};

// Vacht in plukken: waarde-ruis die in de groeirichting uitgerekt is (schaal klein langs de
// groei, groot dwars erop). Waar de ruis hoog is een lichte pluk, waar hij laag is een donkere
// spleet ertussen, verder niets: hele klonten, geen los gespikkel.
function plukken(x, y, z, schaal, zaad, sterk = 0.8, hoog = 0.63, laag = 0.33) {
  const n = ruis3(x * schaal[0], y * schaal[1], z * schaal[2], zaad);
  return n > hoog ? sterk : n < laag ? -sterk * 0.9 : 0;
}

// Stekelige plukken op het silhouet (nekhaar, kraag, staart): hoeveel het oppervlak naar buiten
// mag, 0 tot ongeveer 1.
function plukRand(x, y, z, schaal, zaad) {
  const n = ruis3(x * schaal[0], y * schaal[1], z * schaal[2], zaad);
  return Math.max(0, n - 0.35) * 1.55;
}

// Een deel ruig maken: het silhouet krijgt plukken van hoogstens amp eenheden. De afstand wordt
// maar een beetje geschaald; sterker schalen maakt de omgevingsschaduw daar te donker.
function ruig(deel, schaal, zaad, amp = 1, veilig = 0.85) {
  const f0 = deel.f;
  return { ...deel, f: (x, y, z) => (f0(x, y, z) - plukRand(x, y, z, schaal, zaad) * amp) * veilig, g: [deel.g[0], deel.g[1], deel.g[2], deel.g[3] + amp] };
}

// ---------------------------------------------------------------- houdingen

// Elke vijand kan in een houding gebouwd worden: { houding, fase } met fase van 0 tot 1. Zonder
// houding is het de staande pose van de stroken, precies zoals die was: alle verplaatsingen
// hieronder zijn dan null en laten de delen onaangeroerd.
const HOUDINGEN = {
  staan: { beelden: 4, fps: 4, herhaal: true },
  lopen: { beelden: 8, fps: 10, herhaal: true },
  aanval: { beelden: 6, fps: 12, herhaal: false },
  geraakt: { beelden: 3, fps: 12, herhaal: false },
  sterven: { beelden: 8, fps: 10, herhaal: false },
};
// fase van beeld i: een lus eindigt vlak voor het begin, een eenmalige houding op het eind
const faseVan = (houding, i) => {
  const h = HOUDINGEN[houding];
  return h.herhaal ? i / h.beelden : i / (h.beelden - 1);
};
// loopsnelheid in tegels per seconde; een tegel is 45,25 eenheden
const SNELHEID = { wolf: 3.5, reuzenspin: 2, kobold: 2.4 };
const TEGEL = 64 / Math.SQRT2;

const verschil = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const inw = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const mulMV = (R, v) => [R[0] * v[0] + R[1] * v[1] + R[2] * v[2], R[3] * v[0] + R[4] * v[1] + R[5] * v[2], R[6] * v[0] + R[7] * v[1] + R[8] * v[2]];
function mulMM(A, B) {
  const r = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]);
  return r;
}
const transp = (R) => [R[0], R[3], R[6], R[1], R[4], R[7], R[2], R[5], R[8]];
const EEN = [1, 0, 0, 0, 1, 0, 0, 0, 1];
// draaimatrix om een as, in graden (rechterhand: positief om +x brengt +y naar +z)
function draaiMatrix(as, graden) {
  const [x, y, z] = eenheid(as);
  const h = (graden * Math.PI) / 180;
  const c = Math.cos(h);
  const s = Math.sin(h);
  const C = 1 - c;
  return [x * x * C + c, x * y * C - z * s, x * z * C + y * s, y * x * C + z * s, y * y * C + c, y * z * C - x * s, z * x * C - y * s, z * y * C + x * s, z * z * C + c];
}

// Een starre verplaatsing { R, t }: p → R·p + t. null betekent: niets doen.
const tfPunt = (T, p) => (T ? plus(mulMV(T.R, p), T.t) : p);
const tfRicht = (T, v) => (T ? mulMV(T.R, v) : v);
// eerst b, dan a
const tfNa = (a, b) => (!a ? b : !b ? a : { R: mulMM(a.R, b.R), t: plus(mulMV(a.R, b.t), a.t) });
const tfKet = (...T) => T.reduceRight((acc, t) => tfNa(t, acc), null);
const tfDraai = (as, graden, spil = [0, 0, 0]) => {
  if (!graden) return null;
  const R = draaiMatrix(as, graden);
  return { R, t: verschil(spil, mulMV(R, spil)) };
};
const tfSchuif = (t) => (t && (t[0] || t[1] || t[2]) ? { R: EEN, t: t.slice() } : null);
const tfInv = (T) => {
  const Ri = transp(T.R);
  return { R: Ri, t: maal(mulMV(Ri, T.t), -1) };
};

// Een deel star verplaatsen: de afstand wordt uitgerekend op de rustplek van het deel, dus de
// vorm (ook een schuine ellipsoïde of een ruige rand) gaat ongeschonden mee.
function vast(deel, T) {
  if (!T) return deel;
  const Ti = tfInv(T);
  const [a, b, c, d, e, f, g, h, i] = Ti.R;
  const [tx, ty, tz] = Ti.t;
  const f0 = deel.f;
  const nieuw = { ...deel, f: (x, y, z) => f0(a * x + b * y + c * z + tx, d * x + e * y + f * z + ty, g * x + h * y + i * z + tz) };
  if (deel.g) {
    const m = tfPunt(T, deel.g);
    nieuw.g = [m[0], m[1], m[2], deel.g[3]];
  }
  return nieuw;
}

// Een materiaal waarvan het patroon op de rustplek gerekend wordt: vlekken, buik en rugstreep
// bewegen mee met het lijf in plaats van eroverheen te glijden. Ook de normaal gaat terug.
function inRust(mat, T) {
  if (!T || !mat.patroon) return mat;
  const Ti = tfInv(T);
  const p0 = mat.patroon;
  return {
    ...mat,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const p = tfPunt(Ti, [x, y, z]);
      const n = mulMV(Ti.R, [nx, ny, nz]);
      return p0(p[0], p[1], p[2], n[0], n[1], n[2], stap);
    },
  };
}

// De starre verplaatsing die een lid van zijn rustligging (a0 → b0) naar zijn nieuwe ligging
// (a1 → b1) brengt. De pool is een richting dwars op het lid (de as waarom het scharniert); die
// blijft dezelfde kant op wijzen, zodat het lid niet om zijn eigen lengteas draait.
function tfLid(a0, b0, pool0, a1, b1, pool1) {
  const assen = (a, b, pool) => {
    const u = eenheid(verschil(b, a));
    const w = eenheid(verschil(pool, maal(u, inw(pool, u))));
    return [u, w, kruis(u, w)];
  };
  const [u0, w0, n0] = assen(a0, b0, pool0);
  const [u1, w1, n1] = assen(a1, b1, pool1);
  const R = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R.push(u1[i] * u0[j] + w1[i] * w0[j] + n1[i] * n0[j]);
  return { R, t: verschil(a1, mulMV(R, a0)) };
}

// Twee botten van a naar doel met lengtes l1 en l2; het middengewricht buigt naar de kant van
// pool. Geeft [midden, eind]: eind is het doel, of het dichtstbijzijnde punt als dat te ver ligt.
function buig2(a, doel, l1, l2, pool) {
  const d = verschil(doel, a);
  const L0 = Math.hypot(d[0], d[1], d[2]);
  const L = klem(L0, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const u = maal(d, 1 / L0);
  const x = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const w = eenheid(verschil(pool, maal(u, inw(pool, u))));
  return [plus(plus(a, maal(u, x)), maal(w, h)), plus(a, maal(u, L))];
}
const afstand = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Houdingen mengen: getallen en lijsten lineair, al het andere van de dichtstbijzijnde kant.
function menge(a, b, t) {
  if (typeof a === 'number') return a + (b - a) * t;
  if (Array.isArray(a)) return a.map((v, i) => menge(v, b[i], t));
  if (a && typeof a === 'object') {
    const r = {};
    for (const k of Object.keys(a)) r[k] = k in b ? menge(a[k], b[k], t) : a[k];
    return r;
  }
  return t < 0.5 ? a : b;
}
// een sleutelbeeld over een basishouding heen leggen (diep)
function over(basis, sleutel) {
  if (!sleutel || typeof sleutel !== 'object' || Array.isArray(sleutel)) return sleutel === undefined ? basis : sleutel;
  const r = Array.isArray(basis) ? basis.slice() : { ...basis };
  for (const k of Object.keys(sleutel)) r[k] = basis && typeof basis[k] === 'object' && !Array.isArray(basis[k]) ? over(basis[k], sleutel[k]) : sleutel[k];
  return r;
}
// Een eenmalige houding uit één sleutelbeeld per beeld; tussen de beelden wordt gemengd.
function uitSleutels(basis, sleutels, fase) {
  const f = klem(fase, 0, 1) * (sleutels.length - 1);
  const i = Math.min(sleutels.length - 2, Math.floor(f + 1e-9));
  const t = f - i < 1e-9 ? 0 : f - i;
  return menge(over(basis(), sleutels[i]), over(basis(), sleutels[i + 1]), t);
}

// Een pas: waar een voet is op fase psi (0..1) van zijn eigen ritme. Eerst staat hij (een deel
// duur van de pas) en schuift hij met precies de loopsnelheid naar achteren, daarna zwaait hij
// in een boog naar voren. Geeft [dy, dz, zwaai 0..1 of -1 als hij staat].
function pas(psi, duur, zwaai, hoogte) {
  psi -= Math.floor(psi);
  if (psi < duur) return [zwaai / 2 - (psi / duur) * zwaai, 0, -1];
  const s = (psi - duur) / (1 - duur);
  return [-zwaai / 2 + zwaai * s * s * (3 - 2 * s), hoogte * Math.sin(Math.PI * s), s];
}

// De kleinste bol om alle grensbollen, voor een model in houding (dat kan verder reiken dan in rust).
function omhul(delen, marge = 1) {
  let lo = [1e9, 1e9, 1e9];
  let hi = [-1e9, -1e9, -1e9];
  for (const d of delen) {
    if (!d.g || d.uit) continue;
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], d.g[i] - d.g[3]);
      hi[i] = Math.max(hi[i], d.g[i] + d.g[3]);
    }
  }
  const midden = maal(plus(lo, hi), 0.5);
  let straal = 0;
  for (const d of delen) if (d.g && !d.uit) straal = Math.max(straal, afstand(midden, d.g) + d.g[3]);
  return { midden, straal: straal + marge };
}

// ---------------------------------------------------------------- wolf

// Een schrale grijze wolf, laag op de poten, de kop omlaag en naar voren: klaar om te springen.
// Een donkere streep over de rug, licht onder (keel, borst, buik, binnenkant van de dijen), gele
// ogen, en een bek die net genoeg open staat om de hoektanden te laten zien. Hij kijkt langs +y.
function wolf(o = {}) {
  const P = o.houding ? wolfHouding(o.houding, o.fase ?? 0) : null;
  const M = { vacht: 0, poot: 1, staart: 2, kop: 3, neus: 4, oog: 5, bek: 6, tand: 7, oor: 8 };
  const D = { lijf: 1, kop: 2, voorL: 3, voorR: 4, achterL: 5, achterR: 6, staart: 7, bek: 8, oorL: 9, oorR: 10 };
  // de kop is iets groter dan echt, anders is hij op vijftig pixels niet te lezen
  const H = WOLF_KOP; // midden van de schedel: lager dan de schoft, de kop vooruit
  const KS = WOLF_KS;
  const k = (dx, dy, dz) => [H[0] + dx * KS, H[1] + dy * KS, H[2] + dz * KS];
  const licht = (stap, van) => naarRamp('pleister', stap, van, [0.4, 5.2]);
  const mat = [];
  // romp: plukken die naar achteren groeien, een donkere streep over de ruggengraat, lichte
  // keel en buik
  mat[M.vacht] = {
    ramp: 'vacht',
    lo: 0.5,
    hi: 6.7,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const p = plukken(x, y, z, [0.5, 0.16, 0.5], 7);
      const bef = ny > 0.25 && y > 13 && z < 33.5;
      if (nz < -0.35 || z < 23.5 || bef) return licht(stap + p * 0.7, [0.5, 6.7]);
      const rug = Math.abs(x) < 2.6 && nz > 0.6 && y > -21 && y < 15 ? -0.7 : 0;
      return p + rug;
    },
  };
  // poten: plukken die naar beneden groeien, iets lichter naar de voeten, de binnenkant van de
  // dijen licht
  mat[M.poot] = {
    ramp: 'vacht',
    lo: 0.7,
    hi: 6.2,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const p = plukken(x, y, z, [0.5, 0.5, 0.16], 17, 0.5);
      if (z > 17 && (x * nx < -0.3 || nz < -0.3)) return licht(stap + p, [0.7, 6.2]);
      return p + (z < 9 ? 0.5 : 0);
    },
  };
  // pluimstaart met een zwarte punt
  mat[M.staart] = {
    ramp: 'vacht',
    lo: 0.6,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (y < -40) return -2.6;
      const p = plukken(x, y, z, [0.45, 0.22, 0.32], 27, 0.7);
      return nz < -0.4 ? licht(stap + p, [0.6, 6.4]) : p;
    },
  };
  // kop: donker voorhoofd en neusrug, lichte wangen en lippen, boze wenkbrauwen
  mat[M.kop] = {
    ramp: 'vacht',
    lo: 0.9,
    hi: 6.2,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const dx = (x - H[0]) / KS;
      const dy = (y - H[1]) / KS;
      const dz = (z - H[2]) / KS;
      const wang = Math.abs(dx) > 3.2 && dz < 0.4 && dy > -3.5;
      const lip = dy > 3 && dz < -2.9 - (dy - 4) * 0.12;
      if (wang || lip) return licht(stap, [0.9, 6.2]);
      const bx = Math.abs(dx) - 2.6;
      const bz = dz - 2.9 + bx * 0.5;
      if (ny > 0.15 && Math.abs(bx) < 1.7 && Math.abs(bz) < 0.65) return -2;
      return nz > 0.4 ? -0.5 : 0;
    },
  };
  mat[M.neus] = { ramp: 'inkt', lo: 0.3, hi: 2.4, glans: 1.4, rand: 0.4 };
  mat[M.oog] = { ramp: 'goud', gloei: (x, y, z, kijk) => 5 + 1.6 * kijk, detail: true };
  mat[M.bek] = { ramp: 'rood', lo: 0.2, hi: 1.4, rand: 0, schaduw: false };
  mat[M.tand] = { ramp: 'bot', lo: 4.6, hi: 7.2, detail: true, rand: 0.5 };
  mat[M.oor] = {
    ramp: 'vacht',
    lo: 0.8,
    hi: 5.6,
    patroon: (x, y, z, nx, ny, nz) => (ny > 0.4 ? -1.5 : 0),
  };

  // standen van lijf, kop, kaak, oren en staart; in rust allemaal null
  const T = P ? wolfStanden(P) : {};
  if (P) {
    mat[M.vacht] = inRust(mat[M.vacht], T.lijf);
    mat[M.poot] = inRust(mat[M.poot], T.lijf);
    mat[M.staart] = inRust(mat[M.staart], T.staart);
    mat[M.kop] = inRust(mat[M.kop], T.kop);
    mat[M.oor] = inRust(mat[M.oor], T.kop);
    // dicht: een donker spleetje waar het gele oog was
    if (P.ogen < 0.5) mat[M.oog] = { ramp: 'vacht', lo: 0.2, hi: 1.2, rand: 0, detail: true };
  }
  const L = (d) => vast(d, T.lijf);
  const Kp = (d) => vast(d, T.kop);

  const delen = [];
  // --- romp: diepe borst, ingetrokken buik, heupen iets lager dan de schoft
  delen.push(L(ellips([0, 9, 29], [8.8, 10.5, 10], M.vacht, D.lijf)));
  delen.push(L(ellips([0, 7.5, 35.8], [7.8, 8.5, 4.6], M.vacht, D.lijf, 4)));
  delen.push(L(ellips([0, -5.5, 31], [6.3, 10.5, 6.4], M.vacht, D.lijf, 5)));
  delen.push(L(ellips([0, -16, 31.4], [7.2, 8, 6.8], M.vacht, D.lijf, 4)));
  // nek (beweegt met de kop mee), en een kraag met opgezette nekharen
  delen.push(Kp(kegel([0, 13, 33], [0, 23.5, 35.5], 6.6, 5.2, M.vacht, D.lijf, 4)));
  delen.push(L(ruig(ellips([0, 15.5, 33.5], [9.2, 7, 8.2], M.vacht, D.lijf, 3), [0.5, 0.3, 0.42], 5, 1.3)));

  // --- kop
  delen.push(Kp(ellips(H, [5.8 * KS, 6.2 * KS, 5.2 * KS], M.kop, D.kop, 3)));
  for (const s of [-1, 1]) delen.push(Kp(ruig(ellips(k(s * 4, -1, -2), [3.4 * KS, 4.2 * KS, 4 * KS], M.kop, D.kop, 2), [0.6, 0.6, 0.6], 9, 0.7)));
  // snuit en onderkaak, net open; de onderkaak scharniert, het donker van de bek gaat half mee
  delen.push(Kp(kegel(k(0, 3.5, -1.7), k(0, 13, -3.3), 3.3 * KS, 2.1 * KS, M.kop, D.kop, 1.8)));
  delen.push(Kp(bol(k(0, 13.4, -2.7), 1.5 * KS, M.neus, D.kop, 0.6)));
  delen.push(vast(kegel(k(0, 3.5, -4.9), k(0, 11.2, -6.9), 2.6 * KS, 1.4 * KS, M.kop, D.bek, 1), T.kaak));
  delen.push(vast(ellips(k(0, 8, -4.9), [1.8 * KS, 3.8 * KS, 1.4 * KS], M.bek, D.bek), T.bek));
  for (const s of [-1, 1]) {
    delen.push(Kp(kegel(k(s * 1.5, 11.2, -4.3), k(s * 1.5, 11.7, -6.9), 0.95, 0.25, M.tand, D.bek)));
    delen.push(vast(kegel(k(s * 1.2, 10, -6.8), k(s * 1.2, 10.4, -4.8), 0.75, 0.2, M.tand, D.bek), T.kaak));
    delen.push(Kp(bol(k(s * 2.7, 4.5, 1.6), 1.2, M.oog, D.kop)));
    // oren: rechtop en iets naar voren, plat van voren naar achteren
    const oor = platteKegel(k(s * 3.3, -1.2, 3.7), k(s * 4.7, 0.4, 12.4), 3 * KS, 0.4, [0, 1, 0], 0.55, M.oor, s < 0 ? D.oorL : D.oorR, 1);
    delen.push(vast(oor, s < 0 ? T.oorL : T.oorR));
  }

  // --- poten: voor recht onder de borst, achter met de knik van de hak. Elk lid is een star
  // stuk; in een houding brengt buig2 de gewrichten naar de voet toe en gaat elk stuk mee.
  for (const s of [-1, 1]) {
    const v = s < 0 ? D.voorL : D.voorR;
    const a = s < 0 ? D.achterL : D.achterR;
    const vy = s < 0 ? 2.5 : -0.5; // de linker voorpoot staat een stap verder
    const S = [s * 5.8, 13, 29];
    const E = [s * 5.6, 10.5 + vy, 18.5];
    const W = [s * 5.3, 12.8 + vy, 5.2];
    const Vc = [s * 5.3, 15.2 + vy, 1.5];
    const voor = [
      [kegel(S, E, 4.4, 2.9, M.poot, v, 2)],
      [kegel(E, W, 2.7, 2, M.poot, v, 1)],
      [kegel(W, [s * 5.3, 14.2 + vy, 1.8], 2, 1.8, M.poot, v, 0.8), ellips(Vc, [2.3, 3.1, 1.5], M.poot, v, 1)],
    ];
    // dij met een broek van vacht
    const Hp = [s * 6, -15, 30];
    const Kn = [s * 6.2, -9, 18.5];
    const Hk = [s * 5.6, -18, 9];
    const Ac = [s * 5.4, -15.4, 1.5];
    const achter = [
      [ruig(kegel(Hp, Kn, 5.6, 3.2, M.poot, a, 2.5), [0.5, 0.5, 0.3], 19, 0.8)],
      [kegel(Kn, Hk, 2.9, 1.7, M.poot, a, 1)],
      [kegel(Hk, [s * 5.4, -16.5, 1.8], 1.7, 1.6, M.poot, a, 0.8), ellips(Ac, [2.1, 3, 1.5], M.poot, a, 1)],
    ];
    if (!P) {
      for (const stuk of [...voor, ...achter]) delen.push(...stuk);
      continue;
    }
    const tv = wolfPoot(T, P, s < 0 ? 0 : 1, [S, E, W, Vc], true);
    const ta = wolfPoot(T, P, s < 0 ? 2 : 3, [Hp, Kn, Hk, Ac], false);
    voor.forEach((stuk, j) => delen.push(...stuk.map((d) => vast(d, tv[j]))));
    achter.forEach((stuk, j) => delen.push(...stuk.map((d) => vast(d, ta[j]))));
  }

  // --- pluimstaart, stijf naar achteren en iets opzij, zodat hij ook van achteren te zien is
  const dik = (t) => 2.2 + 2 * Math.sin(Math.PI * Math.min(1, t * 1.1)) - 0.8 * t;
  for (const p of bochtProfiel([0, -22, 32.5], [0.8, -33, 32.5], [3, -43, 26], dik, 7, M.staart, D.staart, 1.4)) {
    delen.push(vast(ruig(p, [0.5, 0.5, 0.5], 13, 0.9), T.staart));
  }

  if (!P) return model(delen, mat, { midden: [0, 0, 25], straal: 48 });
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- wolf in beweging

const WOLF_KOP = [0, 26, 36.5];
const WOLF_KS = 1.13;
const wolfK = (dx, dy, dz) => [WOLF_KOP[0] + dx * WOLF_KS, WOLF_KOP[1] + dy * WOLF_KS, WOLF_KOP[2] + dz * WOLF_KS];
// middens van de vier poten in rust: voor links, voor rechts, achter links, achter rechts
const WOLF_VOET = [
  [-5.3, 17.7, 1.5],
  [5.3, 14.7, 1.5],
  [-5.4, -15.4, 1.5],
  [5.4, -15.4, 1.5],
];

// De houding van de wolf als getallen. lijf: schuif (eenheden), kantel (neus omhoog, graden), rol
// (op de rechterzij, graden). nek: kantel en draai. kaak: open (graden). oren: plat naar achteren.
// staart: draai (opzij) en kantel (omhoog). voeten: waar het midden van elke voet is, en hoe
// ver de voet omkrult. schouder: hoe ver het schouderblad de voorpoot naar voren brengt.
// voetLijf: 0 = voeten blijven plat op de grond, 1 = ze draaien met het lijf mee (dood).
function wolfBasis() {
  return {
    lijf: { schuif: [0, 0, 0], kantel: 0, rol: 0 },
    nek: { kantel: 0, draai: 0 },
    kaak: 0,
    oren: [0, 0],
    staart: { draai: 0, kantel: 0 },
    voeten: WOLF_VOET.map((p) => ({ p: p.slice(), buig: 0 })),
    schouder: [0, 0],
    voetLijf: 0,
    ogen: 1,
  };
}

function wolfStanden(P) {
  const lijf = tfKet(tfSchuif(P.lijf.schuif), tfDraai([0, 1, 0], P.lijf.rol, [0, 0, 30]), tfDraai([1, 0, 0], P.lijf.kantel, [0, 0, 28]));
  const nek = [0, 13, 33];
  const kop = tfKet(lijf, tfDraai([0, 0, 1], P.nek.draai, nek), tfDraai([1, 0, 0], P.nek.kantel, nek));
  const scharnier = wolfK(0, 2.5, -4.2);
  const oor = (s, a) => tfNa(kop, tfDraai([1, 0, 0], a, wolfK(s * 3.3, -1.2, 3.7)));
  const voet = [0, -22, 32.5];
  return {
    lijf,
    kop,
    kaak: tfNa(kop, tfDraai([1, 0, 0], -P.kaak, scharnier)),
    bek: tfNa(kop, tfDraai([1, 0, 0], -P.kaak / 2, scharnier)),
    oorL: oor(-1, P.oren[0]),
    oorR: oor(1, P.oren[1]),
    staart: tfKet(lijf, tfDraai([0, 0, 1], P.staart.draai, voet), tfDraai([1, 0, 0], -P.staart.kantel, voet)),
  };
}

// De drie stukken van een poot ([schouder, elleboog, pols, voet] of [heup, knie, hak, voet] in
// rust) naar hun plek in houding P. Het laatste stuk (middenvoet met de voet) ligt zo dat de voet
// op zijn doel staat; de andere twee volgen met buig2. Geeft drie verplaatsingen.
function wolfPoot(T, P, i, [A0, B0, C0, V0], voor) {
  const voet = P.voeten[i];
  const lat = tfRicht(T.lijf, [1, 0, 0]);
  const A1 = tfPunt(T.lijf, voor ? plus(A0, [0, P.schouder[i], 0]) : A0);
  const vl = P.voetLijf;
  const Rbasis = mulMM(draaiMatrix([0, 1, 0], P.lijf.rol * vl), draaiMatrix([1, 0, 0], P.lijf.kantel * vl));
  const R3 = mulMM(draaiMatrix(lat, voet.buig), Rbasis);
  const doel = plus(voet.p, mulMV(R3, verschil(C0, V0)));
  const [B1, C1] = buig2(A1, doel, afstand(A0, B0), afstand(B0, C0), tfRicht(T.lijf, voor ? [0, -1, 0] : [0, 1, 0]));
  return [tfLid(A0, B0, [1, 0, 0], A1, B1, lat), tfLid(B0, C0, [1, 0, 0], B1, C1, lat), { R: R3, t: verschil(C1, mulMV(R3, C0)) }];
}

function wolfHouding(houding, fase) {
  const B = wolfBasis();
  if (houding === 'staan') {
    // ademen: de borst gaat op en neer, de staart zwaait, een oor draait even weg, een voorpoot
    // verzet zich
    const a = 2 * Math.PI * fase;
    B.lijf.schuif = [0, 0, 0.45 * (Math.sin(a) - 1) * 0.5];
    B.lijf.kantel = 0.5 * Math.sin(a);
    B.nek.kantel = -2 * Math.sin(a + 0.8);
    B.kaak = 2 + 3 * Math.sin(a + 1.2);
    B.staart.draai = 8 * Math.sin(a);
    B.staart.kantel = 2 * Math.cos(a);
    if (fase >= 0.45 && fase < 0.7) B.oren = [0, 25];
    if (fase >= 0.7) B.voeten[0] = { p: plus(WOLF_VOET[0], [0, 0.6, 1.4]), buig: -18 };
    return B;
  }
  if (houding === 'lopen') {
    // draf: twee passen per rondje van acht beelden. Diagonale paren (voor links met achter
    // rechts) staan samen. Een staande voet schuift per beeld precies 3,5 tegels / 10 naar achteren.
    const v = SNELHEID.wolf * TEGEL; // eenheden per seconde
    const duur = 0.35;
    const zwaai = v * duur * 0.4; // een pas duurt vier beelden: 0,4 s
    const phi = fase * 2;
    const y0 = [14.5, 14.5, -15.4, -15.4];
    const paar = [0, 0.5, 0.5, 0];
    for (let i = 0; i < 4; i++) {
      const [dy, dz, s] = pas(phi + paar[i], duur, zwaai, i < 2 ? 7 : 5.5);
      B.voeten[i] = { p: [WOLF_VOET[i][0], y0[i] + dy, 1.5 + dz], buig: s < 0 ? 0 : (i < 2 ? -70 : -35) * Math.sin(Math.PI * s) };
      if (i < 2) B.schouder[i] = klem(dy * 0.4, -4.5, 4.5);
    }
    const g = Math.cos(4 * Math.PI * phi);
    B.lijf.schuif = [0, 0, -1.6 + 0.6 * g];
    B.nek.kantel = -3 + 1.5 * g;
    B.kaak = 12;
    B.oren = [14, 14];
    B.staart.draai = 9 * Math.sin(2 * Math.PI * fase);
    B.staart.kantel = 4;
    return B;
  }
  if (houding === 'aanval') return uitSleutels(wolfBasis, WOLF_AANVAL, fase);
  if (houding === 'geraakt') return uitSleutels(wolfBasis, WOLF_GERAAKT, fase);
  if (houding === 'sterven') return uitSleutels(wolfBasis, WOLF_STERVEN, fase);
  throw new Error('onbekende houding: ' + houding);
}

const wv = (i, d, buig = 0) => ({ p: plus(WOLF_VOET[i], d), buig });
// uithalen en bijten: door de achterpoten zakken, naar voren springen, de bek wijd open, dicht,
// een ruk met de kop, en terug
const WOLF_AANVAL = [
  { lijf: { schuif: [0, -2.5, -2], kantel: -2 }, nek: { kantel: -7 }, kaak: 6, oren: [12, 12], staart: { kantel: 8 } },
  { lijf: { schuif: [0, -5, -4], kantel: -3 }, nek: { kantel: -9 }, kaak: 4, oren: [22, 22], staart: { kantel: 12 } },
  {
    lijf: { schuif: [0, 5, 0.5], kantel: 7 },
    nek: { kantel: 7 },
    kaak: 26,
    oren: [28, 28],
    staart: { kantel: 10 },
    voeten: [wv(0, [0, 9, 6], -45), wv(1, [0, 11, 7], -50), wv(2, [0, 0, 0]), wv(3, [0, 0, 0])],
    schouder: [4, 4],
  },
  {
    lijf: { schuif: [0, 11, -1.5], kantel: -2 },
    nek: { kantel: 3 },
    kaak: 38,
    oren: [28, 28],
    staart: { kantel: 8 },
    voeten: [wv(0, [0, 13, 0]), wv(1, [0, 15, 0]), wv(2, [0, 0, 0]), wv(3, [0, 0, 0])],
    schouder: [3, 3],
  },
  {
    lijf: { schuif: [0, 9, -2], kantel: -3 },
    nek: { kantel: -5, draai: 12 },
    kaak: 3,
    oren: [20, 20],
    staart: { kantel: 6 },
    voeten: [wv(0, [0, 13, 0]), wv(1, [0, 15, 0]), wv(2, [0, 0, 0]), wv(3, [0, 0, 0])],
    schouder: [2, 2],
  },
  {
    lijf: { schuif: [0, 3, -0.5], kantel: 0 },
    nek: { kantel: -1, draai: -5 },
    kaak: 6,
    oren: [6, 6],
    staart: { kantel: 3 },
    voeten: [wv(0, [0, 5, 3], -25), wv(1, [0, 4, 0]), wv(2, [0, 0, 0]), wv(3, [0, 0, 0])],
  },
];
// geraakt: een ruk naar achteren, de kop omhoog met een jank, oren plat, staart tussen de benen
const WOLF_GERAAKT = [
  {
    lijf: { schuif: [0, -4, 1], kantel: 6, rol: -5 },
    nek: { kantel: 14, draai: -8 },
    kaak: 24,
    oren: [38, 38],
    staart: { kantel: -22, draai: -6 },
    voeten: [wv(0, [0, -3, 3], -25), wv(1, [0, -3.5, 2.5], -25), wv(2, [0, -1, 0]), wv(3, [0, -1, 0])],
  },
  {
    lijf: { schuif: [0, -5, -1.5], kantel: -3, rol: 4 },
    nek: { kantel: -6, draai: 6 },
    kaak: 10,
    oren: [32, 32],
    staart: { kantel: -26, draai: 4 },
    voeten: [wv(0, [0, -4, 0]), wv(1, [0, -5, 3.5], -25), wv(2, [0, -1.5, 0]), wv(3, [0, -1.5, 0])],
  },
  { lijf: { schuif: [0, -1.5, -0.5] }, voeten: [wv(0, [0, -2, 0]), wv(1, [0, -2, 0]), wv(2, [0, -0.5, 0]), wv(3, [0, -0.5, 0])], nek: { kantel: 0 }, kaak: 6, oren: [12, 12], staart: { kantel: -8 } },
];
// sterven: een laatste ruk, de poten begeven het, hij valt op zijn rechterzij, veert na, en ligt
// stil met de ogen dicht. De poten liggen dan naar links over de grond.
const lig = (rol, z, x = 0) => ({ schuif: [x, 0, z], kantel: 0, rol });
const WOLF_STERVEN = [
  {
    lijf: { schuif: [0, -3, 1], kantel: 8, rol: 0 },
    nek: { kantel: 16 },
    kaak: 28,
    oren: [40, 40],
    staart: { kantel: -24 },
    voeten: [wv(0, [0, -2.5, 2.5], -20), wv(1, [0, -3, 2], -20), wv(2, [0, -1, 0]), wv(3, [0, -1, 0])],
  },
  {
    lijf: { schuif: [0, -2, -7], kantel: -7, rol: 5 },
    nek: { kantel: -10 },
    kaak: 20,
    oren: [40, 40],
    staart: { kantel: -20 },
    voeten: [wv(0, [-1, 3, 0], -15), wv(1, [-1, 4, 0], -15), wv(2, [0, -1, 0]), wv(3, [0, -1, 0])],
  },
  {
    lijf: lig(24, -12, 3),
    nek: { kantel: -12, draai: 6 },
    kaak: 16,
    oren: [36, 36],
    staart: { kantel: -14 },
    voetLijf: 0.3,
    voeten: [wv(0, [-3, 2, 0]), wv(1, [2, 0, 0]), wv(2, [-3, 1, 0]), wv(3, [2, 0, 0])],
  },
  {
    lijf: lig(55, -16, 4),
    nek: { kantel: -8, draai: 10 },
    kaak: 14,
    oren: [30, 30],
    staart: { kantel: -8 },
    voetLijf: 0.6,
    voeten: [wv(0, [-12, 3, 4], -20), wv(1, [-4, 1, 0], -10), wv(2, [-10, 2, 4], -10), wv(3, [-4, 1, 0])],
  },
  {
    lijf: lig(86, -20.5, 2),
    nek: { kantel: -4, draai: 16 },
    kaak: 18,
    oren: [20, 20],
    staart: { kantel: 0, draai: 6 },
    voetLijf: 1,
    ogen: 1,
    voeten: [wv(0, [-18, 4, 5], -30), wv(1, [-26, 2, 0], -20), wv(2, [-17, 4, 4], -20), wv(3, [-24, 2, 0], -10)],
  },
  {
    lijf: lig(94, -19.5, 2),
    nek: { kantel: -2, draai: 20 },
    kaak: 22,
    oren: [20, 20],
    staart: { kantel: 2, draai: 10 },
    voetLijf: 1,
    ogen: 0,
    voeten: [wv(0, [-20, 5, 6], -10), wv(1, [-28, 3, 0], -5), wv(2, [-19, 5, 5], -5), wv(3, [-26, 3, 0])],
  },
  {
    lijf: lig(90, -21, 2),
    nek: { kantel: -3, draai: 22 },
    kaak: 14,
    oren: [18, 18],
    staart: { kantel: -2, draai: 12 },
    voetLijf: 1,
    ogen: 0,
    voeten: [wv(0, [-18, 4, 2.5], -35), wv(1, [-26, 2, 0], -25), wv(2, [-17, 3, 2], -30), wv(3, [-24, 1, 0], -20)],
  },
  {
    lijf: lig(90, -21, 2),
    nek: { kantel: -3, draai: 22 },
    kaak: 12,
    oren: [18, 18],
    staart: { kantel: -2, draai: 14 },
    voetLijf: 1,
    ogen: 0,
    voeten: [wv(0, [-18, 4, 2], -38), wv(1, [-26, 2, 0], -28), wv(2, [-17, 3, 1.5], -32), wv(3, [-24, 1, 0], -22)],
  },
];

// ---------------------------------------------------------------- reuzenspin

// Een punt op een ellipsoïde (middelpunt c, halve assen s) in de richting d vanuit het midden,
// een stukje naar buiten geschoven: om ogen precies op een bolle kop te zetten.
function opEllips(c, s, d, uit = 0) {
  const l = Math.hypot(d[0] / s[0], d[1] / s[1], d[2] / s[2]);
  const p = [c[0] + d[0] / l, c[1] + d[1] / l, c[2] + d[2] / l];
  const n = [(p[0] - c[0]) / (s[0] * s[0]), (p[1] - c[1]) / (s[1] * s[1]), (p[2] - c[2]) / (s[2] * s[2])];
  const nl = Math.hypot(...n);
  return [p[0] + (n[0] / nl) * uit, p[1] + (n[1] / nl) * uit, p[2] + (n[2] / nl) * uit];
}

// Een reuzenspin van ongeveer een tegel breed: donker en harig, met paarse banden om de knieën
// en een paarse zandloper op het achterlijf. Het voorste paar poten staat dreigend omhoog, zodat
// je ook van achteren ziet waar de kop zit; acht gloeiende oogjes en twee giftanden. Magie uit
// de toren heeft hem zo groot gemaakt.
function reuzenspin(o = {}) {
  const P = o.houding ? spinHouding(o.houding, o.fase ?? 0) : null;
  const M = { pantser: 0, haar: 1, poot: 2, band: 3, oog: 4, oogje: 5, kaak: 6, gif: 7 };
  const D = { borst: 1, lijf: 2, kaak: 3, ogen: 4 }; // poten: 10 + nummer
  const C = [0, 3, 11]; // midden van het kopborststuk
  const A = [0, -15, 13.5]; // midden van het achterlijf
  const AS = [10.2, 12.5, 9];
  const mat = [];
  // kopborststuk: glanzend pantser met een groef in het midden
  mat[M.pantser] = {
    ramp: 'vacht',
    lo: 0.4,
    hi: 4.8,
    glans: 1.6,
    glansMacht: 18,
    patroon: (x, y, z) => (Math.abs(x) < 0.7 && y < C[1] + 3 ? -0.8 : 0),
  };
  // achterlijf: harig, met over de rug een paarse zandloper
  mat[M.haar] = {
    ramp: 'vacht',
    lo: 0.4,
    hi: 4.6,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const u = Math.abs(x);
      const v = y - A[1] - 0.5;
      if (nz > 0.3 && Math.abs(v) < 7.5 && u < 1.1 + Math.abs(v) * 0.55) return naarRamp('magie', stap, [0.4, 4.6], [2.2, 5.8]);
      return plukken(x, y, z, [0.55, 0.3, 0.55], 31, 0.7);
    },
  };
  // poten: donker en harig; om elke knie een donkerpaarse band
  mat[M.poot] = { ramp: 'vacht', lo: 0.4, hi: 4.6, patroon: (x, y, z) => plukken(x, y, z, [0.7, 0.7, 0.7], 33, 0.5) };
  mat[M.band] = { ramp: 'magie', lo: 0.6, hi: 3.3 };
  // de ogen zijn het lichtste van de spin: bijna wit in het midden
  mat[M.oog] = { ramp: 'magie', gloei: (x, y, z, kijk) => 5.2 + 1.4 * kijk, detail: true };
  mat[M.oogje] = { ramp: 'magie', gloei: (x, y, z, kijk) => 4 + 1.4 * kijk, detail: true };
  mat[M.kaak] = { ramp: 'vacht', lo: 0.2, hi: 3.8, glans: 1.2 };
  mat[M.gif] = { ramp: 'bot', lo: 3.6, hi: 7, detail: true };

  // standen van lijf, achterlijf en kaken; in rust allemaal null
  const T = P ? spinStanden(P) : {};
  if (P) {
    mat[M.pantser] = inRust(mat[M.pantser], T.lijf);
    mat[M.haar] = inRust(mat[M.haar], T.achterlijf);
    if (P.ogen < 0.5) {
      mat[M.oog] = { ramp: 'magie', lo: 0.2, hi: 1.4, rand: 0, detail: true };
      mat[M.oogje] = mat[M.oog];
    }
  }
  const L = (d) => vast(d, T.lijf);
  const Ka = (d) => vast(d, T.kaak);

  const delen = [];
  // --- lijf
  delen.push(L(ellips(C, [6.6, 7.6, 4.6], M.pantser, D.borst)));
  const kop = [0, 7.8, 13.6];
  const kopS = [4.6, 3.9, 3.2];
  delen.push(L(ellips(kop, kopS, M.pantser, D.borst, 2)));
  delen.push(L(kegel([0, -2, 11.5], [0, -5, 12.4], 2.4, 2.8, M.pantser, D.lijf, 1)));
  delen.push(vast(ruig(ellips(A, AS, M.haar, D.lijf, 1.5), [0.6, 0.6, 0.6], 35, 0.6), T.achterlijf));
  delen.push(vast(bol([0, -27, 12.4], 1.8, M.haar, D.lijf, 1.2), T.achterlijf));

  // --- ogen: twee grote voorop, ver genoeg uit elkaar om twee ogen te blijven; zes kleine
  // hoger op de kop, waar je ze van boven ziet
  for (const s of [-1, 1]) {
    delen.push(L(bol(opEllips(kop, kopS, [s * 0.85, 1, 0.42], 0.45), 1.35, M.oog, D.ogen)));
    delen.push(L(bol(opEllips(kop, kopS, [s * 1.3, 0.45, 0.55], 0.2), 0.75, M.oogje, D.ogen)));
    delen.push(L(bol(opEllips(kop, kopS, [s * 0.55, -0.1, 1], 0.2), 0.75, M.oogje, D.ogen)));
    delen.push(L(bol(opEllips(kop, kopS, [s * 1.1, -0.7, 0.8], 0.2), 0.7, M.oogje, D.ogen)));
  }

  // --- kaken met giftanden, en de tasters
  for (const s of [-1, 1]) {
    delen.push(Ka(kegel([s * 2.3, 9.8, 10.6], [s * 2.1, 11.8, 6], 2.3, 1.5, M.kaak, D.kaak, 0.8)));
    delen.push(Ka(kegel([s * 2.1, 12.1, 5.8], [s * 1.2, 12.8, 2.8], 0.95, 0.25, M.gif, D.kaak)));
    delen.push(L(kegel([s * 3.6, 9.6, 10], [s * 5.4, 14, 11.5], 1.2, 1, M.poot, D.kaak, 0.6)));
    delen.push(L(kegel([s * 5.4, 14, 11.5], [s * 5, 16.4, 6.5], 1, 0.9, M.poot, D.kaak, 0.6)));
  }

  // --- poten: vier per kant, hoek vanaf voren. De dij gaat in een boog omhoog naar de knie, het
  // hoogste punt; de rest van de poot gaat eerst naar buiten en dan steil omlaag naar de voet.
  // Het voorste paar staat omhoog, dreigend, met de punten naar voren.
  const POTEN = SPIN_POTEN;
  POTEN.forEach(([hoek, heup, knie, voet, bocht], i) => {
    for (const s of [-1, 1]) {
      const a = (hoek * Math.PI) / 180;
      const d = [s * Math.sin(a), Math.cos(a)];
      const p = (afstand, z) => [C[0] + d[0] * afstand, C[1] + d[1] * afstand, z];
      const deel = 10 + i * 2 + (s > 0 ? 1 : 0);
      const P0 = p(heup, C[2] + 0.5);
      const P1 = p(knie[0], knie[1]);
      const Q0 = p(mix(heup, knie[0], 0.3), mix(C[2], knie[1], 0.75));
      const Q1 = p(bocht[0], bocht[1]);
      const P2 = p(voet[0], voet[1]);
      const dij = (t) => mix(2.5, 1.9, t);
      const scheen = (t) => mix(1.9, 0.45, Math.pow(t, 0.8));
      // dij, dan de band om de knie (eind van de dij, begin van de scheen), dan de scheen
      const boven = [...bochtProfiel(P0, Q0, P1, dij, 3, M.poot, deel, 1, 0, 0.88), ...bochtProfiel(P0, Q0, P1, dij, 1, M.band, deel, 0.4, 0.88, 1)];
      const onder = [...bochtProfiel(P1, Q1, P2, scheen, 1, M.band, deel, 0.4, 0, 0.09), ...bochtProfiel(P1, Q1, P2, scheen, 5, M.poot, deel, 0.4, 0.09, 1)];
      if (!P) {
        delen.push(...boven, ...onder);
        continue;
      }
      const [tb, to] = spinPoot(T, P, i * 2 + (s > 0 ? 1 : 0), [P0, P1, P2], [d[0], d[1], 0]);
      delen.push(...boven.map((p) => vast(p, tb)), ...onder.map((p) => vast(p, to)));
    }
  });

  // de ogen geven een zweem paars licht op de kop en de kaken
  const lamp = { pos: tfPunt(T.lijf, opEllips(kop, kopS, [0, 1, 0.3], 2.5)), r: 10, sterk: 0.9, warm: 0 };
  const lichten = !P || P.ogen >= 0.5 ? [lamp] : [];
  if (!P) return model(delen, mat, { midden: [0, -2, 14], straal: 42, lichten });
  return model(delen, mat, { ...omhul(delen), lichten });
}

// ---------------------------------------------------------------- de spin in beweging

const SPIN_C = [0, 3, 11];
// hoek vanaf voren, heup, knie [afstand, hoogte], voet [afstand, hoogte], bocht [afstand, hoogte]
const SPIN_POTEN = [
  [24, 4.8, [11.5, 29], [28, 22], [22.5, 35]],
  [57, 5.6, [14, 27.5], [23.6, 0.5], [21.8, 24]],
  [99, 5.8, [14, 26.5], [25.2, 0.5], [23, 24]],
  [137, 5.2, [15, 27.5], [26.8, 0.5], [24.6, 25]],
];
// de gewrichten van poot i aan kant s in rust, en de richting waarin de poot van het lijf wegwijst
function spinPootRust(i, s) {
  const [hoek, heup, knie, voet, bocht] = SPIN_POTEN[i];
  const a = (hoek * Math.PI) / 180;
  const d = [s * Math.sin(a), Math.cos(a), 0];
  const p = (r, z) => [SPIN_C[0] + d[0] * r, SPIN_C[1] + d[1] * r, z];
  return { P0: p(heup, SPIN_C[2] + 0.5), P1: p(knie[0], knie[1]), P2: p(voet[0], voet[1]), d, bocht: p(bocht[0], bocht[1]) };
}
const SPIN_VOET = [];
for (let i = 0; i < 4; i++) for (const s of [-1, 1]) SPIN_VOET[i * 2 + (s > 0 ? 1 : 0)] = spinPootRust(i, s).P2;
// waar een poot in de looppas neerkomt: wat dichter bij het lijf dan in de dreighouding, anders
// steken de voorpoten in de schuine aanzichten buiten de cel
const SPIN_LOOP = [20, 21, 22, 23.5];
const spinLoopVoet = (i, s) => {
  const { d } = spinPootRust(i, s);
  return [SPIN_C[0] + d[0] * SPIN_LOOP[i], SPIN_C[1] + d[1] * SPIN_LOOP[i], 0.5];
};

// lijf: schuif, kantel (voorkant omhoog) en rol (op de rug). achterlijf: knik in de steel.
// kaken: hoe ver de giftanden naar voren slaan. voeten: waar elke voetpunt is, of de knie omhoog
// (1) of naar de buik toe (-1) buigt, en of het doel in het lijf meedraait (dood).
function spinBasis() {
  return {
    lijf: { schuif: [0, 0, 0], kantel: 0, rol: 0 },
    achterlijf: 0,
    kaken: 0,
    voeten: SPIN_VOET.map((p) => ({ p: p.slice(), knie: 1 })),
    lijfVast: 0,
    ogen: 1,
  };
}

function spinStanden(P) {
  const lijf = tfKet(tfSchuif(P.lijf.schuif), tfDraai([0, 1, 0], P.lijf.rol, [0, -2, 12]), tfDraai([1, 0, 0], P.lijf.kantel, SPIN_C));
  return {
    lijf,
    achterlijf: tfNa(lijf, tfDraai([1, 0, 0], P.achterlijf, [0, -3, 12])),
    kaak: tfNa(lijf, tfDraai([1, 0, 0], P.kaken, [0, 9.8, 11])),
  };
}

// De twee stukken van een spinnenpoot: de dij van de heup naar de knie, de scheen van de knie
// naar de punt. De knie blijft het hoogste punt; buig2 zoekt hem in het vlak door heup, voet en
// de 'boven' van het lijf, zodat de poot als geheel meedraait als de spin kantelt of omslaat.
function spinPoot(T, P, i, [P0, P1, P2], d0) {
  const voet = P.voeten[i];
  const heup = tfPunt(T.lijf, P0);
  const op = tfRicht(T.lijf, [0, 0, 1]);
  const doel = P.lijfVast >= 0.5 ? tfPunt(T.lijf, voet.p) : voet.p;
  const n0 = eenheid([d0[1], -d0[0], 0]);
  const heen = verschil(doel, heup);
  let n1 = kruis(heen, op);
  n1 = Math.hypot(n1[0], n1[1], n1[2]) < 1e-6 ? tfRicht(T.lijf, n0) : eenheid(n1);
  const vlak = eenheid([heen[0], heen[1], heen[2]]);
  const pool = plus(maal(op, voet.knie), maal(verschil(vlak, maal(op, inw(vlak, op))), 0.25));
  const [K, eind] = buig2(heup, doel, afstand(P0, P1), afstand(P1, P2), pool);
  return [tfLid(P0, P1, n0, heup, K, n1), tfLid(P1, P2, n0, K, eind, n1)];
}

function spinHouding(houding, fase) {
  const B = spinBasis();
  if (houding === 'staan') {
    // ademen: het achterlijf deint, en de geheven voorpoten tasten langzaam op en neer
    const a = 2 * Math.PI * fase;
    B.lijf.schuif = [0, 0, -0.45 + 0.45 * Math.sin(a)];
    B.achterlijf = 2.5 * Math.sin(a + 0.7);
    B.kaken = 3 + 3 * Math.sin(a + 2);
    for (const j of [0, 1]) {
      const w = Math.sin(a + (j ? 0 : Math.PI));
      B.voeten[j] = { p: plus(SPIN_VOET[j], [w * 0.8, w * 1.6, 2.4 * w]), knie: 1 };
    }
    return B;
  }
  if (houding === 'lopen') {
    // afwisselende viervoetgang: poot 1 en 3 links met 2 en 4 rechts, dan wisselen. Twee passen
    // per rondje van acht beelden; een staande voet schuift per beeld 2 tegels / 10 naar achteren.
    const v = SNELHEID.reuzenspin * TEGEL;
    const duur = 0.5;
    const zwaai = v * duur * 0.4;
    const phi = fase * 2;
    for (let i = 0; i < 4; i++) {
      for (const s of [-1, 1]) {
        const j = i * 2 + (s > 0 ? 1 : 0);
        const thuis = spinLoopVoet(i, s);
        const groep = (i % 2 === 0) === (s < 0) ? 0 : 0.5;
        const [dy, dz] = pas(phi + groep, duur, zwaai, 6);
        B.voeten[j] = { p: [thuis[0], thuis[1] + dy, thuis[2] + dz], knie: 1 };
      }
    }
    B.lijf.schuif = [0, 0, -0.3 + 0.7 * Math.cos(4 * Math.PI * phi)];
    B.achterlijf = -2 + 1.5 * Math.cos(4 * Math.PI * phi);
    B.kaken = 6;
    return B;
  }
  if (houding === 'aanval') return uitSleutels(spinBasis, SPIN_AANVAL, fase);
  if (houding === 'geraakt') return uitSleutels(spinBasis, SPIN_GERAAKT, fase);
  if (houding === 'sterven') return uitSleutels(spinBasis, SPIN_STERVEN, fase);
  throw new Error('onbekende houding: ' + houding);
}

// voeten voor een sleutelbeeld: alleen de poten die van hun rustplek af moeten
const sv = (lijst) => SPIN_VOET.map((p, j) => ({ p: lijst[j] ? plus(p, lijst[j]) : p.slice(), knie: 1 }));
// naar de buik toe krullen: elke voet op een afstand van het midden van het lijf, in het lijf zelf
const skrul = (r, z, knie) =>
  SPIN_VOET.map((p, j) => {
    const { d } = spinPootRust(j >> 1, j & 1 ? 1 : -1);
    return { p: [SPIN_C[0] + d[0] * r, SPIN_C[1] + d[1] * r, z], knie };
  });

// steigeren en toeslaan: eerst hoog op de achterpoten met de tanden wijd, dan naar voren en omlaag
const SPIN_AANVAL = [
  { lijf: { kantel: 8, schuif: [0, -1, 1] }, kaken: 12, voeten: sv([[0, 0, 4], [0, 0, 4]]) },
  { lijf: { kantel: 22, schuif: [0, -2, 3] }, kaken: 28, voeten: sv([[0, 2, 11], [0, 2, 11]]), achterlijf: -6 },
  { lijf: { kantel: 4, schuif: [0, 4, 1.5] }, kaken: 38, voeten: sv([[0, 7, 7], [0, 7, 7]]), achterlijf: -2 },
  { lijf: { kantel: -14, schuif: [0, 8, -2] }, kaken: 6, voeten: sv([[0, 9, 0], [0, 9, 0]]), achterlijf: 3 },
  { lijf: { kantel: -5, schuif: [0, 5, -1] }, kaken: 16, voeten: sv([[0, 7, 2.5], [0, 7, 2.5]]), achterlijf: 1 },
  { lijf: { kantel: 2, schuif: [0, 1, 0.5] }, kaken: 8, voeten: sv([[0, 2, 5], [0, 2, 5]]) },
];
// geraakt: het lijf schiet omhoog en naar achteren, de poten trekken samen
const SPIN_GERAAKT = [
  { lijf: { kantel: -8, schuif: [0, -4, 2.5] }, kaken: 22, achterlijf: 5, voeten: sv([[0, -2, 3], [0, -2, 3], [0, -1, 1], [0, -1, 1], [0, 1, 1], [0, 1, 1], [0, 2, 0.5], [0, 2, 0.5]]) },
  { lijf: { kantel: 5, schuif: [0, -3, -1.5] }, kaken: 10, achterlijf: -4, voeten: sv([[0, -3, 1], [0, -3, 1], [0, -2, 0], [0, -2, 0], [0, 2, 0], [0, 2, 0], [0, 3, 0], [0, 3, 0]]) },
  { lijf: { kantel: 0, schuif: [0, -1, -0.5] }, kaken: 5, achterlijf: 0, voeten: sv([[0, -1, 1.5], [0, -1, 1.5]]) },
];
// sterven: doorzakken, op de rug rollen en de poten naar de buik krullen; de ogen doven
const SPIN_STERVEN = [
  { lijf: { kantel: 6, schuif: [0, -2, 1] }, kaken: 24, achterlijf: 4, voeten: sv([[0, -1, 3], [0, -1, 3]]) },
  { lijf: { kantel: -3, schuif: [0, -1, -3] }, kaken: 14, achterlijf: -3, voeten: sv([[0, -3, 1], [0, -3, 1], [0, -2, 0], [0, -2, 0], [0, 1, 0], [0, 1, 0], [0, 2, 0], [0, 2, 0]]) },
  { lijf: { kantel: 0, rol: 22, schuif: [1.5, 0, -5] }, kaken: 10, voeten: sv([[0, -5, 2], [0, -5, 2], [-2, -3, 1], [2, -3, 1], [-2, 2, 1], [2, 2, 1], [-2, 4, 1], [2, 4, 1]]) },
  { lijf: { kantel: 0, rol: 78, schuif: [2, 0, -4] }, kaken: 6, lijfVast: 1, voeten: skrul(17, 4.5, 0.5) },
  { lijf: { kantel: 0, rol: 134, schuif: [1, 0, -3] }, kaken: 4, lijfVast: 1, voeten: skrul(12, 2, -0.2), ogen: 1 },
  { lijf: { kantel: 0, rol: 176, schuif: [0, 0, -1.5] }, kaken: 3, lijfVast: 1, voeten: skrul(4.2, 0.3, -1), ogen: 0 },
  { lijf: { kantel: 0, rol: 182, schuif: [0, 0, -1] }, kaken: 2, lijfVast: 1, voeten: skrul(6.5, 1.2, -1), ogen: 0 },
  { lijf: { kantel: 0, rol: 180, schuif: [0, 0, -1] }, kaken: 2, lijfVast: 1, voeten: skrul(4, 0.2, -1), ogen: 0 },
];

// ---------------------------------------------------------------- kobold

// Een kobold: een klein, gemeen bosmannetje, groen, met een lange puntneus, grote oren die door
// de kap steken, gloeiende ogen onder boze wenkbrauwen en een grijns vol tanden. Een versleten
// bruine puntkap, en over de schouders een manteltje van herfstbladeren met een rafelige zoom van
// bladpunten. Een beetje komisch, maar hij prikt.
// wapen: 'speer' (vuursteen aan een stok, laag als een piek) of 'knots' (een dijbeen, geheven).
function kobold(wapen = 'speer', o = {}) {
  const P = o.houding ? koboldHouding(o.houding, o.fase ?? 0, wapen) : null;
  const M = {
    huid: 0,
    oog: 1,
    mond: 2,
    tand: 3,
    kap: 4,
    doek: 5,
    hout: 6,
    steen: 7,
    touw: 8,
    klauw: 9,
    bot: 10,
    veer: 11,
    brauw: 12,
    herfst: 13,
    geel: 14,
    rood: 15,
    onder: 16,
    munt: 17,
  };
  const D = {
    voetL: 1,
    voetR: 2,
    beenL: 3,
    beenR: 4,
    lijf: 5,
    doek: 6,
    armL: 7,
    armR: 8,
    hoofd: 9,
    oorL: 10,
    oorR: 11,
    kap: 12,
    mantel: 13,
    wapen: 14,
    handL: 15,
    handR: 16,
    munt: 17,
  };
  const H = [0, 3.5, 44]; // midden van het hoofd, iets vooruit: hij loopt gebogen
  const mat = [];
  mat[M.huid] = { ramp: KOBOLD_HUID, lo: 1.2, hi: 6.6, schaduwKracht: 0.6 };
  mat[M.brauw] = { ramp: KOBOLD_HUID, lo: 0.4, hi: 3.4 };
  mat[M.oog] = { ramp: 'goud', gloei: (x, y, z, kijk) => 5.2 + 1.4 * kijk, detail: true };
  mat[M.mond] = { ramp: 'rood', lo: 0, hi: 1.2, rand: 0, schaduw: false };
  mat[M.tand] = { ramp: 'bot', lo: 4.5, hi: 7, detail: true };
  // de kap: versleten bruin laken met een lap op het achterhoofd (een vierkantje met steken)
  mat[M.kap] = {
    ramp: 'jas',
    lo: 0.5,
    hi: 4.6,
    patroon: (x, y, z) => {
      const lx = x + 1.5;
      const lz = z - (H[2] + 2.5);
      if (y < H[1] - 4 && Math.abs(lx) < 2.6 && Math.abs(lz) < 2.4) return Math.abs(lx) > 1.9 || Math.abs(lz) > 1.7 ? -0.9 : 0.7;
      return Math.sin(x * 1.1 + z * 0.5 + y * 0.3) > 0.82 ? -0.7 : 0;
    },
  };
  // de schoudermantel: losse bladeren in drie herfsttinten, met donker ertussen
  mat[M.herfst] = { ramp: 'herfst', lo: 1, hi: 5.6 };
  mat[M.geel] = { ramp: 'stro', lo: 0.9, hi: 5.4 };
  mat[M.rood] = { ramp: 'rood', lo: 1.6, hi: 6 };
  mat[M.onder] = { ramp: 'herfst', lo: 0, hi: 1.6 };
  mat[M.doek] = { ramp: 'leer', lo: 0.8, hi: 4.6, patroon: (x, y, z) => (Math.sin(x * 1.3 + z * 0.4) > 0.8 ? -0.7 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 5.6, patroon: (x, y, z) => (ruis3(x * 0.6, y * 0.25, z * 0.6, 43) > 0.7 ? -0.7 : 0) };
  mat[M.steen] = { ramp: 'steen', lo: 1.6, hi: 7.4, glans: 1.4, glansMacht: 12, patroon: (x, y, z) => (ruis3(x * 0.9, y * 0.9, z * 0.9, 47) > 0.6 ? -0.8 : 0) };
  mat[M.touw] = { ramp: 'leer', lo: 1.4, hi: 5, patroon: (x, y, z) => (Math.sin((x + y + z) * 2.4) > 0.3 ? -0.8 : 0) };
  mat[M.klauw] = { ramp: 'bot', lo: 2.4, hi: 6.4, detail: true };
  mat[M.bot] = { ramp: 'bot', lo: 1.6, hi: 7, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, 49) > 0.74 ? -0.8 : 0) };
  mat[M.veer] = { ramp: 'rood', lo: 1.6, hi: 6.6 };
  mat[M.munt] = { ramp: 'goud', lo: 2.5, hi: 7, glans: 1.8, glansMacht: 22, detail: true };

  // standen van lijf, hoofd, oren, kappunt en wapen; in rust allemaal null
  const T = P ? koboldStanden(P, wapen) : {};
  if (P) {
    mat[M.kap] = inRust(mat[M.kap], T.hoofd);
    mat[M.doek] = inRust(mat[M.doek], T.lijf);
    for (const i of [M.hout, M.steen, M.touw, M.bot]) mat[i] = inRust(mat[i], T.wapen);
    if (P.ogen < 0.5) mat[M.oog] = { ramp: 'goud', lo: 0.4, hi: 1.6, rand: 0, detail: true };
  }
  const L = (d) => vast(d, T.lijf);
  const Hd = (d) => vast(d, T.hoofd);
  const Wp = (d) => vast(d, T.wapen);

  const delen = [];
  // --- voeten: groot en plat, drie klauwtenen
  for (const s of [-1, 1]) {
    const dv = s < 0 ? D.voetL : D.voetR;
    const vy = s < 0 ? 2.2 : -0.6; // de linkervoet een stap vooruit
    const voetDelen = [ellips([s * 4.4, 1.6 + vy, 1.7], [2.9, 4.8, 1.8], M.huid, dv)];
    for (const t of [-1, 0, 1]) voetDelen.push(kegel([s * 4.4 + t * 1.6, 5.4 + vy, 1.2], [s * 4.4 + t * 2.2, 7.4 + vy, 0.5], 0.75, 0.3, M.klauw, dv));
    // benen: kort, de knieën gebogen en naar buiten
    const db = s < 0 ? D.beenL : D.beenR;
    const heup = [s * 3.6, -1, 19];
    const knie = [s * 5.6, 3.2 + vy * 0.5, 11];
    const enkel = [s * 4.4, 0.6 + vy, 3.2];
    const dij = kegel(heup, knie, 2.6, 2.1, M.huid, db, 1);
    const scheen = kegel(knie, enkel, 2, 1.6, M.huid, db, 1);
    if (!P) {
      delen.push(...voetDelen, dij, scheen);
      continue;
    }
    const [td, ts, tv] = koboldBeen(T, P, s < 0 ? 0 : 1, [heup, knie, enkel]);
    delen.push(...voetDelen.map((d) => vast(d, tv)), vast(dij, td), vast(scheen, ts));
  }
  // --- lijf: een smalle borst en een buikje, een lendendoek eronder
  delen.push(L(ellips([0, 1.2, 24.5], [6.2, 5.6, 7], M.huid, D.lijf)));
  delen.push(L(ellips([0, -0.2, 31], [6.8, 5, 5.2], M.huid, D.lijf, 3)));
  delen.push(L({
    f: (x, y, z) => {
      const onder = 14.5 + 1.6 * Math.sin(x * 1.4 + 0.7) + 1 * Math.sin(x * 3.3 + y);
      const e = Math.hypot(x / 6.9, (y - 0.8) / 6) - 1;
      return Math.max(Math.abs(e * 5.4) - 0.6, onder - z, z - 21.5) * 0.85;
    },
    g: [0, 0.8, 18, 10],
    m: M.doek,
    deel: D.doek,
  }));

  // --- hoofd: groot, met een lange puntneus die iets hangt, gloeiende ogen onder schuine
  // wenkbrauwen en een grijns vol tanden
  delen.push(Hd(ellips(H, [7.6, 7.2, 7], M.huid, D.hoofd)));
  delen.push(Hd(ellips(plus(H, [0, 2.6, -3.6]), [5.8, 5, 3.6], M.huid, D.hoofd, 2)));
  delen.push(Hd(kegel(plus(H, [0, 6.4, 0]), plus(H, [0, 13.6, -3.8]), 2.1, 0.55, M.huid, D.hoofd, 1.2)));
  for (const s of [-1, 1]) {
    delen.push(Hd(bol(plus(H, [s * 3, 6.3, 0.4]), 1.5, M.oog, D.hoofd)));
    delen.push(Hd(kegel(plus(H, [s * 1.2, 7.1, 1.5]), plus(H, [s * 5.3, 5.3, 3.4]), 1.25, 0.85, M.brauw, D.hoofd, 0.6)));
    // oren: lang, spits, opzij en iets omhoog, plat met de voorkant naar voren; ze wapperen
    const oorD = s < 0 ? D.oorL : D.oorR;
    const oor = platteKegel(plus(H, [s * 6.4, 0.2, 0.6]), plus(H, [s * 17.5, -2.6, 5.6]), 3.3, 0.35, [0, 0.9, 0.35], 0.42, M.huid, oorD, 1);
    delen.push(vast(oor, s < 0 ? T.oorL : T.oorR));
  }
  // grijns: een brede donkere spleet met omhooggetrokken hoeken en vier tanden
  delen.push(Hd({ ...ellips(plus(H, [0, 7.4, -4.6]), [4.6, 1.8, 1], M.mond, D.hoofd), uit: true }));
  for (const s of [-1, 1]) {
    delen.push(Hd({ ...bol(plus(H, [s * 4.1, 6.4, -3.7]), 1, M.mond, D.hoofd), uit: true }));
    delen.push(Hd(kegel(plus(H, [s * 1.6, 8.1, -3.8]), plus(H, [s * 1.6, 8.3, -5.4]), 0.75, 0.25, M.tand, D.hoofd)));
    delen.push(Hd(kegel(plus(H, [s * 3.3, 7.3, -3.6]), plus(H, [s * 3.4, 7.4, -4.8]), 0.6, 0.2, M.tand, D.hoofd)));
  }

  // --- kap: een schaal om het hoofd, van voren open, met een punt die omhoog staat en dan slap
  // opzij en naar achteren omvalt: zo steekt hij uit elke richting boven de kap uit. De oren
  // steken er aan de zijkant doorheen.
  const K0 = plus(H, [0, -1.2, 1.8]);
  delen.push(Hd({
    f: (x, y, z) => {
      const e = sdf.ellipsoide(x - K0[0], y - K0[1], z - K0[2], 8.7, 8.6, 8.6);
      const schaal = Math.abs(e) - 0.8;
      // de opening voor het gezicht: alles voor dit schuine vlak valt weg
      const open = y - (H[1] + 3.2) - (z - H[2]) * 0.35;
      // de onderrand gerafeld: een paar scheuren
      const hoek = Math.atan2(x - K0[0], y - K0[1]);
      const rafel = 1.3 * Math.max(0, Math.sin(hoek * 7 + 1.3)) + 0.6 * Math.sin(hoek * 13);
      return Math.max(schaal, open, H[2] - 6 + rafel - z);
    },
    g: [K0[0], K0[1], K0[2], 11],
    m: M.kap,
    deel: D.kap,
  }));
  const punt = (t) => mix(5.2, 0.7, Math.pow(t, 0.8));
  delen.push(...bochtProfiel(plus(K0, [0, -2.5, 5.5]), plus(K0, [0.5, -4.5, 16]), plus(K0, [7.5, -8, 13.5]), punt, 7, M.kap, D.kap, 1.4).map((d) => vast(d, T.kapPunt)));

  // --- schoudermantel: rijen losse bladeren over de schouders en de rug, tot het middel, voor
  // open. Elke rij hangt over de rij eronder, de punten steken iets uit. Eronder een donkere
  // voering, zodat er tussen de bladeren geen gaten vallen.
  const straal = (z) => mix(9, 7.3, Math.pow(klem((z - 22) / 16, 0, 1), 1.3));
  const midY = (z) => mix(-1.6, -0.6, klem((z - 22) / 16, 0, 1));
  delen.push(L({
    f: (x, y, z) => {
      const r = straal(z) - 0.5;
      const cy = midY(z);
      const schaal = Math.abs(Math.hypot(x, (y - cy) * 1.05) - r) - 0.8;
      const voor = y - cy - r * 0.5 - (z - 32) * 0.15;
      return Math.max(schaal, 25 - z, z - 38.5, voor);
    },
    g: [0, -1, 31.5, 12],
    m: M.onder,
    deel: D.mantel,
  }));
  delen.push(L(ellips([0, -0.8, 36.4], [9.2, 7.2, 3], M.onder, D.mantel, 2)));
  const tinten = [M.herfst, M.herfst, M.geel, M.herfst, M.rood, M.geel, M.herfst];
  [37.2, 33.4, 29.6, 25.8].forEach((rz, j) => {
    const n = j % 2 ? 6 : 7;
    for (let i = 0; i < n; i++) {
      const a = (((i - (n - 1) / 2) * 34) * Math.PI) / 180;
      const rad = [Math.sin(a), -Math.cos(a), 0];
      const r = straal(rz) + 0.6 + j * 0.15;
      const c = [rad[0] * r, midY(rz) + rad[1] * r, rz];
      const m = tinten[Math.floor(rnd(i, j, 53) * tinten.length)];
      delen.push(L(blad(c, [Math.cos(a), Math.sin(a), 0], [rad[0] * 0.45, rad[1] * 0.45, -1], 7.4, 5, 0.45, m, D.mantel)));
    }
  });

  // --- armen en handen, en het wapen. In een houding bepaalt het wapen waar de handen zijn
  // (behalve als de houding ze zelf zet, zoals bij het sterven), en buig2 zoekt de ellebogen.
  const Rs = [6.6, -0.6, 34.5];
  const Ls = [-6.6, -0.6, 34.5];
  let Rh;
  let Lh;
  let Re;
  let Le;
  const wapenDelen = [];
  const klauwDelen = [];
  if (wapen === 'knots') {
    // een dijbeen als knots, rechts boven de schouder naar achteren gezwaaid, klaar om te slaan
    // (voor het hoofd langs zou hij van rechts het gezicht bedekken); links een klauw vooruit
    Rh = [10.5, -2.5, 42];
    Lh = [-7.5, 10, 28];
    Re = [12.5, 1, 33];
    Le = [-9.5, 2.5, 28.5];
    for (const t of [-1, 0, 1]) klauwDelen.push(kegel(plus(Lh, [t * 1.3, 2, -0.5]), plus(Lh, [t * 1.8, 4.2, -1.6]), 0.7, 0.25, M.klauw, D.handL));
    const k0 = plus(Rh, [0, 1, -4.5]);
    const k1 = plus(Rh, [1, -5, 12]);
    wapenDelen.push(kegel(k0, k1, 1.5, 2, M.bot, D.wapen));
    for (const s of [-1, 1]) {
      wapenDelen.push(bol(plus(k1, [s * 1.9, 0.6, 1]), 2.7, M.bot, D.wapen, 1));
      wapenDelen.push(bol(plus(k0, [s * 1.3, -0.3, -0.6]), 1.9, M.bot, D.wapen, 0.8));
    }
  } else {
    // speer: laag als een piek, schuin voor het lijf langs, de voet achter rechts, de punt voor
    // links op borsthoogte, met twee handen vast. Zo is hij van elke kant een streep die het
    // gezicht vrijlaat; hoger gehouden kwam de punt in een van de schuine richtingen voor het
    // gezicht te staan.
    const B = [9, -9, 16];
    const Tp = [-2, 26, 34];
    const dir = [Tp[0] - B[0], Tp[1] - B[1], Tp[2] - B[2]];
    const len = Math.hypot(...dir);
    const u = dir.map((v) => v / len);
    const S = (t) => [B[0] + dir[0] * t, B[1] + dir[1] * t, B[2] + dir[2] * t];
    Rh = S(0.25);
    Lh = S(0.55);
    Re = [10.2, -2.5, 27];
    Le = [-7.2, 5.5, 27.5];
    wapenDelen.push(kegel(B, Tp, 0.95, 0.85, M.hout, D.wapen));
    // vuurstenen punt: een platte, spitse kling die plat naar boven ligt, met touw vastgebonden
    const Pt = plus(Tp, u.map((v) => v * 8));
    const plat = eenheid([-u[2] * u[0], -u[2] * u[1], 1 - u[2] * u[2]]);
    wapenDelen.push(platteKegel(plus(Tp, u.map((v) => v * -0.5)), Pt, 2.2, 0.2, plat, 0.4, M.steen, D.wapen));
    wapenDelen.push(kegel(plus(Tp, u.map((v) => v * -2.6)), plus(Tp, u.map((v) => v * 0.6)), 1.35, 1.35, M.touw, D.wapen));
    // een rode veer die aan het touw hangt
    wapenDelen.push(platteKegel(plus(Tp, [0, 0, -1.2]), plus(Tp, [1.2, -1.2, -7.5]), 1.1, 0.3, [0.7, 0.7, 0], 0.4, M.veer, D.wapen));
  }
  const armR1 = kegel(Rs, Re, 2.1, 1.8, M.huid, D.armR, 1);
  const armR2 = kegel(Re, Rh, 1.8, 1.6, M.huid, D.armR, 1);
  const armL1 = kegel(Ls, Le, 2.1, 1.8, M.huid, D.armL, 1);
  const armL2 = kegel(Le, Lh, 1.8, 1.6, M.huid, D.armL, 1);
  const handR = ellips(Rh, [2.4, 2.4, 2.6], M.huid, D.handR, 0.6);
  const handL = ellips(Lh, [2.4, 2.4, 2.6], M.huid, D.handL, 0.6);
  if (!P) {
    delen.push(armR1, armR2, armL1, armL2, ...klauwDelen, ...wapenDelen, handR, handL);
  } else {
    const dR = P.handR ? tfPunt(T.lijf, P.handR) : tfPunt(T.wapen, Rh);
    const dL = P.handL ? tfPunt(T.lijf, P.handL) : wapen === 'knots' ? tfPunt(T.lijf, Lh) : tfPunt(T.wapen, Lh);
    const [tr1, tr2] = koboldArm(T, [Rs, Re, Rh], dR, 1);
    const [tl1, tl2] = koboldArm(T, [Ls, Le, Lh], dL, -1);
    delen.push(vast(armR1, tr1), vast(armR2, tr2), vast(armL1, tl1), vast(armL2, tl2));
    delen.push(...klauwDelen.map((d) => vast(d, tl2)), ...wapenDelen.map(Wp));
    delen.push(vast(handR, tr2), vast(handL, tl2));
    // een muntje dat uit zijn hand wipt als hij valt
    if (P.munt) delen.push(vast(ellips([0, 0, 0], [2.1, 2.1, 0.5], M.munt, D.munt), tfKet(tfSchuif(P.munt.p), tfDraai([1, 0, 0], P.munt.draai))));
  }

  // de ogen geven een zweem geel licht op de neus en de wangen
  const lamp = { pos: tfPunt(T.hoofd, plus(H, [0, 9.5, 0])), r: 9, sterk: 0.8, warm: 0.5 };
  const lichten = !P || P.ogen >= 0.5 ? [lamp] : [];
  if (!P) return model(delen, mat, { midden: [0, 4, 30], straal: 40, lichten });
  return model(delen, mat, { ...omhul(delen), lichten });
}

// ---------------------------------------------------------------- de kobold in beweging

// de huid van de kobold: later een eigen olijfgroene ramp, nu die van het gras
const KOBOLD_HUID = 'olijf';
// enkels in rust: links staat een stap vooruit
const KOBOLD_ENKEL = [
  [-4.4, 2.8, 3.2],
  [4.4, 0, 3.2],
];
const KOBOLD_KOP = [0, 3.5, 44];

// lijf: schuif, kantel (positief is voorover), rol en draai. hoofd: knikken en draaien. oren:
// wapperen (positief is naar achteren). kapPunt: de slappe punt zwaait. wapen: waar de speer of
// knots staat (los = hij is uit de handen gevallen). handR/handL: waar een hand moet zijn als het
// wapen hem niet bepaalt. voeten: waar de enkels staan en hoe de voet kantelt. munt: het muntje.
function koboldBasis() {
  return {
    lijf: { schuif: [0, 0, 0], kantel: 0, rol: 0, draai: 0 },
    hoofd: { kantel: 0, draai: 0 },
    oren: [0, 0],
    kapPunt: 0,
    wapen: { schuif: [0, 0, 0], kantel: 0, draai: 0, rol: 0, los: 0, spil: [7, -1, 21] },
    handR: null,
    handL: null,
    voeten: KOBOLD_ENKEL.map((p) => ({ p: p.slice(), kantel: 0 })),
    munt: null,
    lijfVoet: 0,
    ogen: 1,
  };
}

function koboldStanden(P, wapen) {
  const H = KOBOLD_KOP;
  const lijf = tfKet(tfSchuif(P.lijf.schuif), tfDraai([0, 0, 1], P.lijf.draai, [0, 0, 18]), tfDraai([0, 1, 0], P.lijf.rol, [0, 0, 18]), tfDraai([1, 0, 0], -P.lijf.kantel, [0, -4, 6]));
  const nek = [0, 1, 37];
  const hoofd = tfKet(lijf, tfDraai([0, 0, 1], P.hoofd.draai, nek), tfDraai([1, 0, 0], P.hoofd.kantel, nek));
  const oor = (s, a) => tfNa(hoofd, tfDraai([0, 0, 1], -s * a, plus(H, [s * 6.4, 0.2, 0.6])));
  const w = P.wapen;
  const wapenSpil = wapen === 'knots' ? [10.5, -2.5, 42] : w.spil;
  const wapenDraai = tfKet(tfSchuif(w.schuif), tfDraai([1, 0, 0], w.kantel, wapenSpil), tfDraai([0, 0, 1], w.draai, wapenSpil), tfDraai([0, 1, 0], w.rol, wapenSpil));
  return {
    lijf,
    hoofd,
    oorL: oor(-1, P.oren[0]),
    oorR: oor(1, P.oren[1]),
    kapPunt: tfNa(hoofd, tfDraai([0, 1, 0], P.kapPunt, plus(H, [0, -3.7, 47 - 44]))),
    wapen: w.los >= 0.5 ? wapenDraai : tfNa(lijf, wapenDraai),
  };
}

// dij en scheen van een been, en de voet eronder; de knie buigt naar voren en naar buiten
function koboldBeen(T, P, i, [H0, K0, E0]) {
  const voet = P.voeten[i];
  const heup = tfPunt(T.lijf, H0);
  const lat = tfRicht(T.lijf, [1, 0, 0]);
  const pool = tfRicht(T.lijf, [i ? 0.5 : -0.5, 1, 0]);
  const doel = P.lijfVoet >= 0.5 ? tfPunt(T.lijf, voet.p) : voet.p;
  const [K1, E1] = buig2(heup, doel, afstand(H0, K0), afstand(K0, E0), pool);
  const Rv = mulMM(draaiMatrix(lat, voet.kantel), P.lijfVoet >= 0.5 ? T.lijf.R : EEN);
  return [tfLid(H0, K0, [1, 0, 0], heup, K1, lat), tfLid(K0, E0, [1, 0, 0], K1, E1, lat), { R: Rv, t: verschil(E1, mulMV(Rv, E0)) }];
}

// boven- en onderarm naar een hand toe; de elleboog wijst naar achteren en naar buiten
function koboldArm(T, [S0, E0, H0], hand, zij) {
  const S1 = tfPunt(T.lijf, S0);
  const lat = tfRicht(T.lijf, [1, 0, 0]);
  const pool = tfRicht(T.lijf, [zij * 0.7, -1, -0.35]);
  const [E1, H1] = buig2(S1, hand, afstand(S0, E0), afstand(E0, H0), pool);
  return [tfLid(S0, E0, [1, 0, 0], S1, E1, lat), tfLid(E0, H0, [1, 0, 0], E1, H1, lat)];
}

function koboldHouding(houding, fase, wapen) {
  const B = koboldBasis();
  if (houding === 'staan') {
    // ademen, een oor dat schudt, en de speerpunt die meedeint
    const a = 2 * Math.PI * fase;
    B.lijf.schuif = [0, 0, -0.35 + 0.35 * Math.sin(a)];
    B.lijf.kantel = 1.5 + Math.sin(a);
    B.hoofd.kantel = -1.5 * Math.sin(a + 0.7);
    B.oren = [4 * Math.sin(a), 4 * Math.sin(a + 1)];
    if (fase >= 0.5 && fase < 0.75) B.oren = [28, -6];
    B.kapPunt = 4 * Math.sin(a + 1.5);
    B.wapen.kantel = 1.6 * Math.sin(a + 0.5);
    return B;
  }
  if (houding === 'lopen') {
    // scharrelen: twee passen per rondje van acht beelden, gebogen door de knieën, met de oren
    // en de kappunt na-wapperend. Een staande voet schuift per beeld 2,4 tegels / 10 terug.
    const v = SNELHEID.kobold * TEGEL;
    const duur = 0.42;
    const zwaai = v * duur * 0.4;
    const phi = fase * 2;
    for (let i = 0; i < 2; i++) {
      const [dy, dz, s] = pas(phi + (i ? 0.5 : 0), duur, zwaai, 5);
      B.voeten[i] = { p: [KOBOLD_ENKEL[i][0], dy, 3.2 + dz], kantel: s < 0 ? 0 : -26 * Math.sin(Math.PI * s) };
    }
    const g = Math.cos(4 * Math.PI * phi);
    B.lijf.schuif = [0, 0, -3 + 0.7 * g];
    B.lijf.kantel = 11 + 2 * g;
    B.lijf.draai = 5 * Math.sin(2 * Math.PI * phi);
    B.hoofd.kantel = -6 - 2 * g;
    B.oren = [16 * Math.sin(2 * Math.PI * phi + 2.4) + 6, 16 * Math.sin(2 * Math.PI * phi + 2.4) + 6];
    B.kapPunt = 10 * Math.sin(2 * Math.PI * phi + 1.8);
    B.wapen.kantel = -4 + 3 * g;
    return B;
  }
  if (houding === 'aanval') return uitSleutels(koboldBasis, wapen === 'knots' ? KOBOLD_SLAG : KOBOLD_STEEK, fase);
  if (houding === 'geraakt') return uitSleutels(koboldBasis, KOBOLD_GERAAKT, fase);
  if (houding === 'sterven') {
    const dood = uitSleutels(koboldBasis, KOBOLD_STERVEN, fase);
    dood.wapen = uitSleutels(valBasis, wapen === 'knots' ? KNOTS_VAL : SPEER_VAL, fase);
    return dood;
  }
  throw new Error('onbekende houding: ' + houding);
}

const valBasis = () => ({ schuif: [0, 0, 0], kantel: 0, draai: 0, rol: 0, los: 0, spil: [7, -1, 21] });
// de speer glipt weg en komt plat naast hem te liggen
const SPEER_VAL = [
  { kantel: -8, schuif: [0, -1, 0] },
  { kantel: -14, schuif: [1, -3, -3], los: 1 },
  { kantel: -20, schuif: [2, -7, -9], los: 1 },
  { kantel: -24, schuif: [2.5, -11, -14], los: 1 },
  { kantel: -26, schuif: [2.5, -14, -18], los: 1 },
  { kantel: -26, schuif: [2.5, -15.3, -19.2], los: 1 },
  { kantel: -26, schuif: [2.5, -15.3, -19.2], los: 1 },
  { kantel: -26, schuif: [2.5, -15.3, -19.2], los: 1 },
];
// het dijbeen kukelt achterover en rolt weg
const KNOTS_VAL = [
  { kantel: 10, schuif: [0, -1, 0], spil: [10.5, -2.5, 42] },
  { kantel: 24, schuif: [-0.5, -2, -8], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 42, schuif: [-1, -2.5, -20], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 58, schuif: [-1, -2, -30], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 70, schuif: [-1, -1.6, -37], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 70, schuif: [-1, -1.3, -38.9], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 70, schuif: [-1, -1.3, -38.9], los: 1, spil: [10.5, -2.5, 42] },
  { kantel: 70, schuif: [-1, -1.3, -38.9], los: 1, spil: [10.5, -2.5, 42] },
];

const kv = (i, d, kantel = 0) => ({ p: plus(KOBOLD_ENKEL[i], d), kantel });
// steken: de speer naar achteren trekken, uitvallen met een stap, en terug
const KOBOLD_STEEK = [
  { lijf: { schuif: [0, -1.5, 0], kantel: -5 }, hoofd: { kantel: 3 }, oren: [-10, -10], wapen: { schuif: [0, -6, 0.5] } },
  { lijf: { schuif: [0, -3, -1], kantel: -9 }, hoofd: { kantel: 5 }, oren: [-16, -16], wapen: { schuif: [0, -9.5, 1] }, voeten: [kv(0, [0, -2, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 2.5, -0.5], kantel: 9 }, hoofd: { kantel: -4 }, oren: [14, 14], wapen: { schuif: [0, 9, -0.5] }, voeten: [kv(0, [0, 5, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 4.5, -1], kantel: 14 }, hoofd: { kantel: -7 }, oren: [20, 20], wapen: { schuif: [0, 16, -1] }, voeten: [kv(0, [0, 7, 0]), kv(1, [0, -1.5, 0])] },
  { lijf: { schuif: [0, 2, -0.5], kantel: 6 }, hoofd: { kantel: -2 }, oren: [10, 10], wapen: { schuif: [0, 6, -0.5] }, voeten: [kv(0, [0, 5, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 0.5, 0], kantel: 2 }, oren: [2, 2], wapen: { schuif: [0, 1, 0] }, voeten: [kv(0, [0, 2, 0]), kv(1, [0, 0, 0])] },
];
// slaan: de knots verder naar achteren, dan in een boog over de schouder naar voren omlaag
const KOBOLD_SLAG = [
  { lijf: { kantel: -5, draai: -8 }, hoofd: { draai: -6 }, oren: [-8, -8], wapen: { kantel: -22 } },
  { lijf: { kantel: -9, draai: -12 }, hoofd: { draai: -8 }, oren: [-14, -14], wapen: { kantel: -38 }, voeten: [kv(0, [0, -1, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 1, -0.5], kantel: 6, draai: 6 }, hoofd: { draai: 4 }, oren: [16, 16], wapen: { kantel: 40 }, voeten: [kv(0, [0, 3, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 2, -1.5], kantel: 14, draai: 10 }, hoofd: { kantel: -6, draai: 6 }, oren: [22, 22], wapen: { kantel: 86 }, voeten: [kv(0, [0, 4, 0]), kv(1, [0, -1.5, 0])] },
  { lijf: { schuif: [0, 1, -1], kantel: 10, draai: 6 }, hoofd: { kantel: -3 }, oren: [12, 12], wapen: { kantel: 72 }, voeten: [kv(0, [0, 3, 0]), kv(1, [0, -1, 0])] },
  { lijf: { schuif: [0, 0, 0], kantel: 2, draai: 0 }, oren: [3, 3], wapen: { kantel: 8 }, voeten: [kv(0, [0, 1, 0]), kv(1, [0, 0, 0])] },
];
// geraakt: achterover, kop omhoog, oren plat naar achteren
const KOBOLD_GERAAKT = [
  { lijf: { schuif: [0, -3, 1], kantel: -15 }, hoofd: { kantel: 14, draai: -6 }, oren: [-34, -34], kapPunt: -14, wapen: { kantel: -12, schuif: [0, -2, 1] }, voeten: [kv(0, [0, -3.5, 0]), kv(1, [0, -4, 0])] },
  { lijf: { schuif: [0, -4.5, -1], kantel: -9 }, hoofd: { kantel: 5, draai: 5 }, oren: [-24, -24], kapPunt: 10, wapen: { kantel: -6, schuif: [0, -3, 0] }, voeten: [kv(0, [0, -3.5, 0]), kv(1, [0, -4, 0])] },
  { lijf: { schuif: [0, -1.5, 0], kantel: 0 }, hoofd: { kantel: 0 }, oren: [-8, -8], kapPunt: 3, voeten: [kv(0, [0, -1.5, 0]), kv(1, [0, -1.5, 0])] },
];
// sterven: een tuimeling achterover, het wapen valt uit zijn handen en een muntje rolt eruit
const KOBOLD_STERVEN = [
  { lijf: { schuif: [0, -2, 1], kantel: -14 }, hoofd: { kantel: 15 }, oren: [-36, -36], kapPunt: -16, wapen: { kantel: -14 }, voeten: [kv(0, [0, -2, 0]), kv(1, [0, -2, 0])] },
  {
    lijf: { schuif: [0, -4, 0], kantel: -30 },
    hoofd: { kantel: 10 },
    oren: [-30, -30],
    kapPunt: -22,
    handR: [9, 4, 36],
    handL: [-9, 5, 35],
    voeten: [kv(0, [0, -4, 0]), kv(1, [0, -5, 0])],
  },
  {
    lijf: { schuif: [0, -5, -2], kantel: -52 },
    hoofd: { kantel: 6 },
    oren: [-20, -20],
    kapPunt: -26,
    handR: [10, 2, 33],
    handL: [-10, 3, 32],
    munt: { p: [7, 3, 30], draai: 40 },
    lijfVoet: 1,
    voeten: [{ p: [-4.4, 4, 4.5], kantel: 10 }, { p: [4.4, 3, 4], kantel: 10 }],
  },
  {
    lijf: { schuif: [0, -6, -5], kantel: -76 },
    hoofd: { kantel: 0 },
    oren: [-10, -10],
    kapPunt: -20,
    handR: [10, -2, 30],
    handL: [-10, -1, 29],
    munt: { p: [10, 7, 36], draai: 130 },
    lijfVoet: 1,
    voeten: [{ p: [-4.6, 6, 6.5], kantel: 22 }, { p: [4.6, 5, 6], kantel: 22 }],
  },
  {
    lijf: { schuif: [0, -7, -8], kantel: -96 },
    hoofd: { kantel: -6 },
    oren: [6, 6],
    kapPunt: -8,
    handR: [11, -6, 27],
    handL: [-11, -5, 26],
    munt: { p: [13, 10, 22], draai: 230 },
    lijfVoet: 1,
    voeten: [{ p: [-4.8, 8, 8], kantel: 34 }, { p: [4.8, 7, 7.5], kantel: 34 }],
  },
  {
    lijf: { schuif: [0, -7.5, -9], kantel: -88 },
    hoofd: { kantel: -10 },
    oren: [14, 14],
    kapPunt: 6,
    handR: [11, -8, 25],
    handL: [-11, -7, 24],
    munt: { p: [15, 12, 5], draai: 310 },
    lijfVoet: 1,
    voeten: [{ p: [-4.8, 9, 6.5], kantel: 30 }, { p: [4.8, 8, 6], kantel: 30 }],
  },
  {
    lijf: { schuif: [0, -8, -9.5], kantel: -93 },
    hoofd: { kantel: -12 },
    oren: [18, 18],
    kapPunt: 10,
    handR: [11, -9, 24],
    handL: [-11, -8, 23],
    munt: { p: [16, 13, 1.1], draai: 358 },
    lijfVoet: 1,
    voeten: [{ p: [-4.8, 8, 5.5], kantel: 26 }, { p: [4.8, 7.5, 5], kantel: 26 }],
    ogen: 0,
  },
  {
    lijf: { schuif: [0, -8, -9.5], kantel: -91 },
    hoofd: { kantel: -12 },
    oren: [17, 17],
    kapPunt: 9,
    handR: [11, -9, 24],
    handL: [-11, -8, 23],
    munt: { p: [16, 13, 1.1], draai: 360 },
    lijfVoet: 1,
    voeten: [{ p: [-4.8, 7.5, 5], kantel: 24 }, { p: [4.8, 7, 4.5], kantel: 24 }],
    ogen: 0,
  },
];

// ---------------------------------------------------------------- cellen

// Een cel is 112×124 met de voeten op (56, 110). Houdingen waarin een vijand languit gaat of ver
// uithaalt, krijgen een ruimere cel; het anker blijft het midden van de tegel.
const CELLEN = {
  wolf: { lopen: [112, 132, 56, 114], aanval: [144, 136, 72, 116], sterven: [160, 148, 80, 120] },
  reuzenspin: { lopen: [128, 132, 64, 114], aanval: [144, 132, 72, 114], sterven: [128, 132, 64, 114] },
  kobold: { aanval: [144, 132, 72, 114], sterven: [160, 168, 80, 126] },
};
const celVan = (naam, houding) => (CELLEN[naam] && CELLEN[naam][houding]) || [112, 124, 56, 110];

module.exports = {
  wolf,
  reuzenspin,
  kobold,
  bochtProfiel,
  platteKegel,
  blad,
  plukken,
  plukRand,
  ruig,
  opEllips,
  HOUDINGEN,
  SNELHEID,
  faseVan,
  celVan,
  CELLEN,
  // het binnenwerk van de houdingen, om na te rekenen dat voeten niet glijden en poten hun doel halen
  rig: {
    tfPunt,
    wolfHouding,
    wolfStanden,
    wolfPoot,
    WOLF_VOET,
    spinHouding,
    spinStanden,
    spinPoot,
    spinPootRust,
    SPIN_VOET,
    koboldHouding,
    koboldStanden,
    koboldBeen,
    KOBOLD_ENKEL,
  },
  // Het gereedschap van de houdingen zelf, voor andere viervoeters (vee.cjs: de koe en het schaap).
  // Alleen doorgegeven; de vijanden hierboven veranderen er niet door.
  beweging: {
    tfPunt,
    tfRicht,
    tfNa,
    tfKet,
    tfDraai,
    tfSchuif,
    tfInv,
    vast,
    tfLid,
    buig2,
    pas,
    omhul,
    menge,
    over,
    uitSleutels,
    draaiMatrix,
  },
};
