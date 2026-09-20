// Houdingen: het gereedschap waarmee de figuren van Aardschok bewegen.
//
// Een figuur is opgebouwd uit botten: groepen delen die samen star bewegen. Een houding zet per
// beeld de botten neer, de delen zelf houden de vorm uit hun rusthouding. Draaien en verschuiven
// veranderen geen afstanden, dus de afstandsfuncties blijven kloppen. Elk verplaatst deel krijgt
// `terug`, de weg naar zijn eigen rusthouding; kern.cjs rekent materiaal en patroon daarmee, zodat
// de nerf van de staf en de strengen van de baard met het deel meebewegen in plaats van erdoorheen.
//
// Zonder houding roept een bouwfunctie hier niets van aan: het model blijft dan precies gelijk,
// en de stilstaande vellen in uit/ veranderen geen pixel.
'use strict';
const { klem, TEGEL } = require('./kern.cjs');

// ---------------------------------------------------------------- punten en matrices

const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const af = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const keer = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const lengte = (a) => Math.hypot(a[0], a[1], a[2]);
const eenheid = (a) => {
  const l = lengte(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const inwendig = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const tussen = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const EEN = [1, 0, 0, 0, 1, 0, 0, 0, 1]; // matrices per rij

// draaiing om een as (eenheidsvector) over een hoek in graden, rechtsom om de as gezien
function draaiing(as, graden) {
  const [ux, uy, uz] = eenheid(as);
  const a = (graden * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const k = 1 - c;
  return [
    c + ux * ux * k, ux * uy * k - uz * s, ux * uz * k + uy * s,
    uy * ux * k + uz * s, c + uy * uy * k, uy * uz * k - ux * s,
    uz * ux * k - uy * s, uz * uy * k + ux * s, c + uz * uz * k,
  ];
}
const maalM = (A, B) => {
  const uit = new Array(9);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) uit[r * 3 + k] = A[r * 3] * B[k] + A[r * 3 + 1] * B[3 + k] + A[r * 3 + 2] * B[6 + k];
  return uit;
};
const maalV = (M, v) => [
  M[0] * v[0] + M[1] * v[1] + M[2] * v[2],
  M[3] * v[0] + M[4] * v[1] + M[5] * v[2],
  M[6] * v[0] + M[7] * v[1] + M[8] * v[2],
];
// de kortste draaiing die richting a op richting b legt
function draaiTussen(a, b) {
  const u = eenheid(a);
  const w = eenheid(b);
  const c = klem(inwendig(u, w), -1, 1);
  if (c > 0.999999) return EEN.slice();
  const as = c < -0.999999 ? eenheid(Math.abs(u[2]) < 0.9 ? kruis(u, [0, 0, 1]) : kruis(u, [1, 0, 0])) : kruis(u, w);
  return draaiing(as, (Math.acos(c) * 180) / Math.PI);
}

// ---------------------------------------------------------------- bewegingen

// Een starre beweging: eerst draaien om het punt `om`, dan verschuiven met `dp`.
// Een punt p uit de rusthouding komt op om + M·(p − om) + dp.
function beweging(o = {}) {
  const M = o.M || (o.graden ? draaiing(o.as || [1, 0, 0], o.graden) : EEN.slice());
  return { M, om: o.om || [0, 0, 0], dp: o.dp || [0, 0, 0] };
}
const opPunt = (B, p) => (B ? plus(plus(B.om, maalV(B.M, af(p, B.om))), B.dp) : p);
// A na B: eerst B, dan A
function naElkaar(A, B) {
  if (!A) return B;
  if (!B) return A;
  const M = maalM(A.M, B.M);
  const q = opPunt(A, plus(B.om, B.dp));
  return { M, om: B.om, dp: af(q, B.om) };
}
// de weg terug naar de rusthouding
function terugVan(B) {
  const [a, b, c, d, e, f, g, h, i] = B.M;
  const [ox, oy, oz] = B.om;
  const px = B.om[0] + B.dp[0];
  const py = B.om[1] + B.dp[1];
  const pz = B.om[2] + B.dp[2];
  return (x, y, z) => {
    const dx = x - px;
    const dy = y - py;
    const dz = z - pz;
    return [a * dx + d * dy + g * dz + ox, b * dx + e * dy + h * dz + oy, c * dx + f * dy + i * dz + oz];
  };
}

// Eén deel meeneemen in een beweging: de afstandsfunctie kijkt terug naar de rusthouding, de
// grensbol schuift mee, en `terug` laat kern.cjs het materiaal in de rusthouding rekenen.
function beweegDeel(deel, B) {
  if (!B) return deel;
  const [a, b, c, d, e, f, g, h, i] = B.M;
  const [ox, oy, oz] = B.om;
  const px = B.om[0] + B.dp[0];
  const py = B.om[1] + B.dp[1];
  const pz = B.om[2] + B.dp[2];
  const f0 = deel.f;
  const heen = terugVan(B);
  const nieuw = {
    ...deel,
    f: (x, y, z) => {
      const dx = x - px;
      const dy = y - py;
      const dz = z - pz;
      return f0(a * dx + d * dy + g * dz + ox, b * dx + e * dy + h * dz + oy, c * dx + f * dy + i * dz + oz);
    },
    terug: deel.terug ? (x, y, z) => deel.terug(...heen(x, y, z)) : heen,
  };
  if (deel.g) {
    const [gx, gy, gz] = opPunt(B, deel.g);
    nieuw.g = [gx, gy, gz, deel.g[3]];
  }
  return nieuw;
}
const beweegDelen = (delen, B) => (B ? delen.map((d) => beweegDeel(d, B)) : delen);

// De grensbol om alle delen heen: nodig zodra een houding de figuur uitrekt of neerlegt.
function omvat(delen, ruim = 1) {
  let x0 = Infinity;
  let y0 = Infinity;
  let z0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  let z1 = -Infinity;
  for (const d of delen) {
    if (!d.g || d.uit) continue;
    const [x, y, z, r] = d.g;
    x0 = Math.min(x0, x - r); x1 = Math.max(x1, x + r);
    y0 = Math.min(y0, y - r); y1 = Math.max(y1, y + r);
    z0 = Math.min(z0, z - r); z1 = Math.max(z1, z + r);
  }
  const midden = [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2];
  let straal = 0;
  for (const d of delen) {
    if (!d.g || d.uit) continue;
    straal = Math.max(straal, Math.hypot(d.g[0] - midden[0], d.g[1] - midden[1], d.g[2] - midden[2]) + d.g[3]);
  }
  return { midden, straal: straal + ruim };
}

// ---------------------------------------------------------------- krommen

const soepel = (t) => {
  const x = klem(t, 0, 1);
  return x * x * (3 - 2 * x);
};
// van 0 naar 1 en terug, zacht aan beide kanten (voor een uithaal die terugkomt)
const heenWeer = (t) => Math.sin(Math.PI * klem(t, 0, 1));
const sinus = (t) => Math.sin(2 * Math.PI * t);
const cosinus = (t) => Math.cos(2 * Math.PI * t);
// stuksgewijs door een rij waarden, zacht ertussen
function langsRij(rij, t) {
  const n = rij.length - 1;
  const x = klem(t, 0, 1) * n;
  const i = Math.min(n - 1, Math.floor(x));
  return rij[i] + (rij[i + 1] - rij[i]) * soepel(x - i);
}

// ---------------------------------------------------------------- lopen

const PER_TEGEL = TEGEL; // eenheden in één tegel: de loopsnelheid rekent hierin

// Eén voet in een loopcyclus, op de plaats gerekend: het spel schuift de figuur vooruit, dus een
// voet op de grond schuift hier met precies de loopsnelheid naar achteren. Zo glijdt hij niet.
//   o: { v (eenheden per seconde), T (cyclus in seconden), steun (deel van de cyclus op de
//   grond), til (hoogte van de zwaai), verzet (faseverschil), hiel/hak (graden) }
function loopVoet(fase, o) {
  const T = o.T;
  const v = o.v;
  const b = o.steun;
  let f = (fase + (o.verzet || 0)) % 1;
  if (f < 0) f += 1;
  const half = (v * T * b) / 2;
  if (f < b) {
    // op de grond: precies met de snelheid van het spel mee naar achteren
    const s = f / b;
    const hiel = o.hiel ?? 0;
    const hak = o.hak ?? 0;
    const hoek = hiel * Math.max(0, 1 - s * 5) - hak * Math.max(0, (s - 0.75) * 4);
    return { y: half - v * T * f, z: 0, hoek, steun: true };
  }
  const s = (f - b) / (1 - b);
  return {
    y: -half + 2 * half * soepel(s),
    z: (o.til || 0) * Math.sin(Math.PI * s),
    hoek: (o.hiel ?? 0) * soepel(s) * 0.6,
    steun: false,
  };
}

// De elleboog bij een hand die ergens anders is komen te liggen: de botlengtes uit de
// rusthouding blijven, en de kant waar de elleboog uitsteekt draait mee met de arm. In de
// ruststand komt er precies de oude elleboog uit.
function elleboog(Sr, Er, Hr, Sn, Hn) {
  const a = lengte(af(Er, Sr));
  const b = lengte(af(Hr, Er));
  const v = af(Hn, Sn);
  const d = klem(lengte(v), Math.abs(a - b) + 0.01, a + b - 0.01);
  const u = eenheid(v);
  const gedraaid = maalV(draaiTussen(af(Hr, Sr), v), af(Er, Sr));
  let w = af(gedraaid, keer(u, inwendig(gedraaid, u)));
  w = lengte(w) < 1e-6 ? [0, 0, 1] : eenheid(w);
  const langs = (d * d + a * a - b * b) / (2 * d);
  const hoog = Math.sqrt(Math.max(0, a * a - langs * langs));
  return plus(Sn, plus(keer(u, langs), keer(w, hoog)));
}
// De beweging van een lid: de rusthouding a→b komt op na→nb te liggen.
function lidBeweging(a, b, na, nb) {
  return beweging({ M: draaiTussen(af(b, a), af(nb, na)), om: a, dp: af(na, a) });
}

module.exports = {
  plus, af, keer, lengte, eenheid, kruis, inwendig, tussen,
  EEN, draaiing, maalM, maalV, draaiTussen,
  beweging, opPunt, naElkaar, terugVan, beweegDeel, beweegDelen, omvat,
  soepel, heenWeer, sinus, cosinus, langsRij,
  PER_TEGEL, loopVoet, elleboog, lidBeweging,
};
