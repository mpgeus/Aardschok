// De heer rijdt weg, of zijn leger komt (werklijst E, stap 4: C2; ontwerp/beeld.md, "De heer rijdt weg, of zijn leger
// komt"): de tekeningen voor de twee korte cinematics aan het eind van de demo. Eerst één proefplaat; de animaties en de
// vellen voor het spel komen als Marcel hem goedkeurt.
//
//  - de heer te paard: een nieuw dier, een appelgrijze schimmel, hoog en slank, op de maat van de os (vee.cjs), met een
//    gebogen hals, manen en een lange staart die met de wind meegaat, onder een kleed tot op de knieën in rood en geel,
//    in vlakken, met franje. De heer (heer.cjs, met `zit`) zit er rond en klein op; zijn beentjes steken opzij en halen
//    de stijgbeugels niet.
//  - de wagen van de heer: de ossenkar (ossenkar.cjs) met `bak: 'heer'` en de lading 'buit'.
//  - het leger, 's nachts: de soldaten van de heer zoals ze zijn, een met het vaandel (heer.cjs, `vaandel`), en een paar
//    met een fakkel in de andere hand (hier: fakkel()), met het licht van de nacht en van de fakkels erover, zoals de
//    proefplaat van de lantaarn (lantaarn.cjs).
//
// Het paard is gebouwd zoals het hert (wild.cjs), op het tuig van het vee: een romp, een hals, een kop, vier poten van drie
// starre stukken en een staart, en per beeld een houding. Lokale assen als bij alle figuren: x naar rechts, y naar voren,
// z omhoog, de hoeven op z = 0; het midden van de tegel onder het midden van de romp.
//
//   node gereedschap/pixelart/heerstoet.cjs        de proefplaat: uit/heerstoet-proef.png (twee keer vergroot)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { sdf, klem, mix, ruis3, TEGEL } = K;
const { model, kegel, capsule, bol, ellips, plus, naarRamp } = require('./figuren.cjs');
const { ring, eenheid } = require('./figuren2.cjs');
const BV = require('./bosvijanden.cjs');
const V = require('./vee.cjs');
const O = require('./ossenkar.cjs');
const { heer, soldaat, SOLDAAT_SNELHEID } = require('./heer.cjs');

const { bochtProfiel, platteKegel } = BV;
const { pas, omhul, tfPunt } = BV.beweging;
const poot = BV.rig.wolfPoot;
const { beweeg, basis } = V.bouw;
const { standen } = V.rig;

// ---------------------------------------------------------------- de wind

// De ene wind (beeld.md, "Eén wind door alles heen") waait op de plaat naar rechts over het scherm. Dit is die richting
// in de maten van een figuur dat naar `kant` kijkt (kern.cjs, tekenModel): zo hangt een vaandel altijd plat naar de
// kijker toe.
function windVoor(kant) {
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  const [X, Y] = [K.EX[0], K.EX[1]];
  return [-X * Math.sin(a) + Y * Math.cos(a), X * Math.cos(a) + Y * Math.sin(a)];
}

// Van een plek in de maten van een figuur (dat op `plek` staat, in tegels, en naar `kant` kijkt) naar de wereld, in
// tegels, zoals tekenModel rekent.
function naarWereld([lx, ly], kant, plek = [0, 0]) {
  const a = (K.RICHTING[kant] * Math.PI) / 180;
  return [plek[0] + (-lx * Math.sin(a) + ly * Math.cos(a)) / TEGEL, plek[1] + (lx * Math.cos(a) + ly * Math.sin(a)) / TEGEL];
}

// Het midden van de delen met dit nummer (een hand), zoals lantaarn.cjs het vindt.
function middenVan(m, deel) {
  const d = m.delen.filter((x) => x.deel === deel);
  const s = d.reduce((a, x) => [a[0] + x.g[0], a[1] + x.g[1], a[2] + x.g[2]], [0, 0, 0]);
  return s.map((v) => v / d.length);
}
// de linkerhand, in heer.cjs: D.handL van de heer en van de soldaat
const HAND_L = 8;

// ---------------------------------------------------------------- het paard: maten

// Een paard van 1,40 meter in de schoft (67 eenheden; de os staat op 56, een boer met hoed is 82): te groot voor de heer.
// De kop hangt 55 graden onder de horizontaal: een gebogen hals, trots. `kopPunt(d, h, x)` is een plek in de maten van
// de kop: d langs de kop naar de neus, h loodrecht erop omhoog, x opzij.
const KOP_HOEK = (55 * Math.PI) / 180;
const AS = [0, Math.cos(KOP_HOEK), -Math.sin(KOP_HOEK)];
const OP = [0, Math.sin(KOP_HOEK), Math.cos(KOP_HOEK)];
const POLL = [0, 41, 88];
const kopPunt = (d, h, x = 0) => [x, POLL[1] + AS[1] * d + OP[1] * h, POLL[2] + AS[2] * d + OP[2] * h];

// Draaipunten en poten in rust, zoals bij het hert: [schouder, elleboog, knie, hoef] en [heup, knie, hak, hoef].
const PAARD = {
  rolAs: [0, -2, 50],
  nekVoet: [0, 20, 58],
  poll: POLL,
  kaakAs: kopPunt(6, -4),
  oor: (s) => kopPunt(-0.8, 3.2, s * 2.6),
  staartWortel: [0, -35, 61],
  staartMidden: [0, -41, 50],
  voor: (s) => [[s * 7.4, 25, 48], [s * 7.2, 19.5, 37.5], [s * 6.6, 22.5, 19.5], [s * 6.4, 23.5, 2]],
  achter: (s) => [[s * 7.6, -27, 51], [s * 8.4, -17, 37.5], [s * 6.8, -33, 23], [s * 6.4, -29, 2]],
  // zo staat het stil: een voorbeen een tikje vooruit, en rechtsachter rust het op de punt van de hoef
  stand: [[-6.4, 24.6, 2], [6.4, 22.4, 2], [-6.4, -29.6, 2], [6.4, -28.4, 2]],
  gang: { y: [23.5, 23.5, -29, -29], til: [9, 7], duur: 0.62, schouder: [0.45, 7] },
};
// Het loopt in de pas van een man (de soldaat, 1,5 tegel per seconde); zeven beelden per seconde is een pas van 1,6 meter.
const PAARD_SNELHEID = SOLDAAT_SNELHEID;
const PAARD_HOUDINGEN = { staan: { beelden: 8, fps: 5 }, lopen: { beelden: 8, fps: 7 } };

// Het kleed: een rechthoek met ronde hoeken om de romp (y0 het midden, l en b de halve lengte en breedte), die onderaan
// wat wijder valt, tot de zoom op kniehoogte, met daaronder franje. De bovenkant volgt de rug: de schoft, het zadel, het
// kruis.
const KLEED = { y0: -3, l: 35.5, b: 12.6, zoom: 26, franje: 3.2 };
const rug = (y) => 64.6 + 2.2 * Math.exp(-(((y - 15) / 8) ** 2)) + 1.6 * Math.exp(-(((y + 24) / 9) ** 2));
const kleedTop = (x, y) => rug(y) + 1 - 0.04 * x * x;
// een zachte max: de rand tussen de bovenkant en de zijkant van het kleed wordt rond
const zachtMax = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
};
// Het zadel, op het kleed: waar de heer zit (het midden van zijn zitvlak).
const ZADEL = { y: 0, z: rug(0) + 2.6 };
// de stijgbeugels: zo hoog hangen ze, ver onder de schoenen van de heer
const BEUGEL = { x: 15, y: -1.5, z: 38 };

// ---------------------------------------------------------------- het paard: houdingen

const piek = (f, c, w) => {
  let d = f - c;
  d -= Math.round(d);
  return Math.abs(d) >= w ? 0 : 0.5 + 0.5 * Math.cos((Math.PI * d) / w);
};

function paardHouding(houding, fase) {
  const M = PAARD;
  const B = basis(M);
  const a = 2 * Math.PI * fase;
  if (houding === 'staan') {
    // ademen, de kop een beetje heen en weer, een oor dat draait, de staart die zwiept; rechtsachter rust
    B.lijf.schuif = [0, 0, 0.3 * Math.sin(a)];
    B.nek.kantel = 1.5 * Math.sin(a + 0.6);
    B.nek.draai = 5 * Math.sin(a - 0.3);
    B.kop.kantel = 2 * Math.sin(a + 1.2);
    B.oren = [-8 + 18 * piek(fase, 0.3, 0.12), -8 + 18 * piek(fase, 0.7, 0.12)];
    B.staart.zwaai = 9 * Math.sin(a);
    B.staart.knik = 7 * Math.sin(a - 1);
    B.staart.til = 2;
    B.voeten[3] = { p: plus(M.stand[3], [0, 3.2, 1.6]), buig: -24 };
    return B;
  }
  if (houding === 'lopen') {
    // Stapvoets, zoals het hert: achter links, voor links, achter rechts, voor rechts; een staande hoef schuift precies
    // in het tempo van het spel naar achteren. De hals knikt mee als een voorbeen neerkomt.
    const G = M.gang;
    const v = PAARD_SNELHEID * TEGEL;
    const rondje = PAARD_HOUDINGEN.lopen.beelden / PAARD_HOUDINGEN.lopen.fps;
    const zwaai = v * G.duur * rondje;
    const land = [0.25, 0.75, 0, 0.5];
    for (let i = 0; i < 4; i++) {
      const [dy, dz, s] = pas(fase - land[i], G.duur, zwaai, i < 2 ? G.til[0] : G.til[1]);
      B.voeten[i] = { p: [M.stand[i][0], G.y[i] + dy, M.stand[i][2] + dz], buig: s < 0 ? 0 : (i < 2 ? -75 : -45) * Math.sin(Math.PI * s) };
      if (i < 2) B.schouder[i] = klem(dy * G.schouder[0], -G.schouder[1], G.schouder[1]);
    }
    B.lijf.schuif = [0, 0, -0.6 + 0.6 * Math.cos(4 * Math.PI * (fase - 0.1))];
    B.lijf.rol = 1.2 * Math.sin(a);
    B.nek.kantel = -2.4 * Math.cos(4 * Math.PI * (fase - 0.25));
    B.nek.draai = 2 * Math.sin(a + 0.5);
    B.kop.kantel = 1.5 * Math.cos(4 * Math.PI * (fase - 0.25));
    B.oren = [-6, -6];
    B.staart.zwaai = 6 * Math.sin(a + 1.4);
    B.staart.knik = 5 * Math.sin(a + 0.4);
    B.staart.til = 3;
    return B;
  }
  throw new Error('onbekende houding: ' + houding);
}

// ---------------------------------------------------------------- het paard: materialen

const M = {
  vacht: 0, poot: 1, manen: 2, muil: 3, oog: 4, neusgat: 5, hoef: 6, kleedR: 7, kleedG: 8, franje: 9, zadel: 10,
  tuig: 11, ijzer: 12, goud: 13,
};

function paardMaterialen() {
  const mat = [];
  // Appelgrijs: licht grijs, met donkere kringen om lichte appels; de benen naar onderen donker, zoals bij een schimmel.
  const appels = (x, y, z) => {
    const r = ruis3(x * 0.3, y * 0.3, z * 0.3, 41);
    return r > 0.16 && r < 0.34 ? -1.1 : r > 0.55 ? 0.4 : 0;
  };
  mat[M.vacht] = { ramp: 'baard', lo: 1.6, hi: 5.6, patroon: appels };
  mat[M.poot] = {
    ramp: 'baard',
    lo: 1.4,
    hi: 5.4,
    patroon: (x, y, z, nx, ny, nz, stap) => (z < 14 + 3 * ruis3(x * 0.3, y * 0.3, 1, 43) ? naarRamp('vacht', stap, [1.4, 5.4], [1.6, 6.2]) : appels(x, y, z)),
  };
  // de manen en de staart: donkerder grijs, met zilveren strengen
  mat[M.manen] = { ramp: 'baard', lo: 0.5, hi: 3.8, rand: 0.6, patroon: (x, y, z) => (Math.sin(x * 2.1 + y * 0.9 + z * 0.6) > 0.45 ? 1 : 0) };
  // een schimmel heeft een donkere huid om de neus
  mat[M.muil] = { ramp: 'vacht', lo: 0.9, hi: 4.6, glans: 0.8 };
  mat[M.oog] = { ramp: 'inkt', lo: 0.2, hi: 2.2, glans: 2.2, detail: true, rand: 0 };
  mat[M.neusgat] = { ramp: 'inkt', lo: 0, hi: 1.2, detail: true, rand: 0, schaduw: false };
  mat[M.hoef] = { ramp: 'vacht', lo: 0.3, hi: 2.6, rand: 0.4 };
  // het kleed: gevierendeeld, zoals de wapenrok van zijn soldaten (links voor rood, rechts voor geel, achter andersom),
  // met plooien die naar de zoom dieper worden (in de vorm, kleed()); boven de zoom een gouden bies
  mat[M.kleedR] = { ramp: 'rood', lo: 1.4, hi: 5.6 };
  mat[M.kleedG] = { ramp: 'goud', lo: 1.8, hi: 5.4 };
  mat[M.franje] = { ramp: 'goud', lo: 2.2, hi: 6, patroon: (x, y) => (Math.sin(Math.atan2(y - KLEED.y0, x) * 70) > 0.3 ? -1.2 : 0) };
  mat[M.zadel] = { ramp: 'leer', lo: 0.8, hi: 4.4, glans: 0.6 };
  mat[M.tuig] = { ramp: 'rood', lo: 0.8, hi: 3.8 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.2, hi: 5.6, glans: 1.6 };
  mat[M.goud] = { ramp: 'goud', lo: 2.6, hi: 6.6, glans: 1.6 };
  return mat;
}

// ---------------------------------------------------------------- het paard: bouwen

const D = { lijf: 1, kop: 2, voorL: 3, voorR: 4, achterL: 5, achterR: 6, staart: 7, oorL: 8, oorR: 9, kleed: 10, franje: 11, zadel: 12, tuig: 13, manen: 14, beugel: 15 };

// Het kleed, in de maten van het lijf: een dichte vorm om de romp (de romp zelf zie je er niet van), tot de zoom, en de
// franje eronder met een rafelige onderkant.
function kleed() {
  const { y0, l, b, zoom, franje } = KLEED;
  const zijkant = (x, y, z) => {
    const wijd = Math.max(0, 50 - z);
    const bx = b + 0.07 * wijd;
    const ly = l + 0.05 * wijd;
    const ex = Math.abs(x) / bx;
    const ey = Math.abs(y - y0) / ly;
    const plooi = 0.3 * Math.sin(Math.atan2(y - y0, x) * 16) * klem((48 - z) / 20, 0, 1);
    return (Math.pow(ex ** 5 + ey ** 5, 0.2) - 1) * bx + plooi;
  };
  const delen = [];
  delen.push({
    f: (x, y, z) => Math.max(zachtMax(zijkant(x, y, z), (z - kleedTop(x, y)) * 0.8, 8), zoom - z) * 0.85,
    g: [0, y0, 46, 44],
    m: (x, y, z) => (z < zoom + 1.3 ? M.franje : (x < 0) === (y > y0) ? M.kleedR : M.kleedG),
    deel: D.kleed,
  });
  delen.push({
    f: (x, y, z) => {
      const p = Math.atan2(y - y0, x) * 24;
      const rafel = Math.sin(p * 2.6) > 0 ? 1.1 : 0;
      return Math.max(zijkant(x, y, z) + 0.15, z - zoom - 0.3, zoom - franje - rafel - z) * 0.85;
    },
    g: [0, y0, zoom - 2, 42],
    m: M.franje,
    deel: D.franje,
  });
  return delen;
}

// Het zadel op het kleed: een zitting, voorop een knop en achter een hoge boom; aan elke kant een riem met een
// stijgbeugel.
function zadel() {
  const z0 = rug(ZADEL.y) + 1;
  const d = [];
  d.push(ellips([0, ZADEL.y, z0 + 0.6], [9.4, 11.5, 2.2], M.zadel, D.zadel, 1));
  d.push(ellips([0, 10.5, z0 + 3], [4.6, 2.4, 3.6], M.zadel, D.zadel, 1));
  d.push(bol([0, 11.4, z0 + 5.8], 1.2, M.goud, D.zadel));
  d.push(ellips([0, -12.6, z0 + 4.6], [7.6, 1.9, 4.6], M.zadel, D.zadel, 1.2));
  for (const s of [-1, 1]) {
    const boven = [s * 13.2, BEUGEL.y, z0 - 6];
    const onder = [s * BEUGEL.x, BEUGEL.y, BEUGEL.z + 2.6];
    d.push(capsule(boven, onder, 0.5, M.zadel, D.beugel));
    d.push(ring([s * BEUGEL.x, BEUGEL.y, BEUGEL.z], [0, 1, 0], 2.9, 0.65, M.ijzer, D.beugel));
    d.push(capsule([s * BEUGEL.x, BEUGEL.y - 2.2, BEUGEL.z - 2.8], [s * BEUGEL.x, BEUGEL.y + 2.2, BEUGEL.z - 2.8], 0.75, M.ijzer, D.beugel));
  }
  return d;
}

// Een punt op een kwadratische bezier.
const bezier = (p0, p1, p2, t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);

// paard({ houding, fase, wind, teugel }): `wind` de richting waarin de staart waait (in de maten van het paard),
// `teugel` waar de hand is die de teugels houdt (in de maten van het paard), of niets.
function paard(o = {}) {
  const P = paardHouding(o.houding || 'staan', o.fase || 0);
  const T = standen(P, PAARD);
  const mat = paardMaterialen();
  const L = (d) => beweeg(d, T.lijf);
  const N = (d) => beweeg(d, T.nek);
  const Kp = (d) => beweeg(d, T.kop);
  const wind = o.wind || [0, 0];
  const delen = [];

  // --- de romp (onder het kleed), het kleed en het zadel
  delen.push(L(ellips([0, -3, 50], [11, 30, 13], M.vacht, D.lijf)));
  delen.push(...kleed().map(L));
  delen.push(...zadel().map(L));

  // --- de hals: een gebogen kam van de schoft tot achter de oren, en eronder de keel; breed aan de voet
  const kam = [[0, 12, 63], [0, 26, 86], [0, 39.5, 89.5]];
  const nekDelen = [];
  nekDelen.push(...bochtProfiel(...kam, (t) => mix(6.8, 4.4, t), 6, M.vacht, D.lijf, 3));
  nekDelen.push(...bochtProfiel([0, 18, 55], [0, 30, 76], [0, 41, 84], (t) => mix(8.4, 4.8, t), 6, M.vacht, D.lijf, 3));
  nekDelen.push(...bochtProfiel([0, 27, 46], [0, 36, 63], [0, 42.5, 77.5], (t) => mix(7.6, 4.2, t), 6, M.vacht, D.lijf, 3));
  // de manen: een rand op de kam, en strengen die naar rechts over de hals vallen
  nekDelen.push(...bochtProfiel(plus(kam[0], [0, -1, 6]), plus(kam[1], [0, -1, 5.2]), plus(kam[2], [0, -1.4, 4.2]), () => 1.5, 6, M.manen, D.manen, 0.8));
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.105;
    const c = bezier(...kam, t);
    const r = mix(6.8, 4.4, t);
    const top = plus(c, [0.6, -0.8, r - 0.2]);
    const punt = plus(c, [r + 1.2, -2.2, -3.2 - 1.6 * Math.sin(i * 2.3)]);
    nekDelen.push(platteKegel(top, punt, 1.9, 0.9, [1, 0, 0.3], 0.45, M.manen, D.manen, 0.8));
  }
  delen.push(...nekDelen.map(N));

  // --- de kop: lang en smal, een breed voorhoofd, ronde kaken, een donkere neus; oren rechtop en een plukje haar ertussen
  const kop = [];
  kop.push(kegel(kopPunt(0.5, 0.3), kopPunt(11, -0.4), 4.9, 4.2, M.vacht, D.kop, 2));
  kop.push(kegel(kopPunt(10, -0.5), kopPunt(22, -1), 4.1, 3.1, M.vacht, D.kop, 2));
  kop.push(ellips(kopPunt(24.2, -1.5), [3.2, 3.4, 3.2], M.muil, D.kop, 1.2));
  kop.push(kegel(kopPunt(6.5, -5), kopPunt(21, -3.6), 2.8, 2, M.vacht, D.kop, 2));
  for (const s of [-1, 1]) {
    kop.push(ellips(kopPunt(6.2, -3.6, s * 2.4), [2.6, 3.6, 3.6], M.vacht, D.kop, 2));
    kop.push(bol(kopPunt(7.4, 1.4, s * 4.3), 1.15, M.oog, D.kop));
    kop.push(bol(kopPunt(25.6, 0.2, s * 1.9), 0.75, M.neusgat, D.kop));
  }
  kop.push(kegel(kopPunt(-0.6, 3.6), kopPunt(4.6, 4), 1.9, 0.8, M.manen, D.manen, 0.6));
  // het hoofdstel: rood leer met een gouden knop op elke kruising, en een bit met ringen
  kop.push(ring(kopPunt(1.6, 0.2), AS, 5.1, 0.55, M.tuig, D.tuig));
  kop.push(ring(kopPunt(17.5, -1.1), AS, 4, 0.55, M.tuig, D.tuig));
  for (const s of [-1, 1]) {
    kop.push(capsule(kopPunt(1.8, 0, s * 4.9), kopPunt(17.5, -1.4, s * 3.9), 0.5, M.tuig, D.tuig));
    kop.push(bol(kopPunt(17.5, -0.8, s * 4), 0.8, M.goud, D.tuig));
    kop.push(ring(kopPunt(21.5, -2.6, s * 3.3), [1, 0, 0], 1.1, 0.4, M.ijzer, D.tuig));
  }
  delen.push(...kop.map(Kp));
  for (const s of [-1, 1]) {
    const wortel = PAARD.oor(s);
    const tip = plus(wortel, [s * 1.3, 1.8, 6.6]);
    const bron = s < 0 ? T.oorL : T.oorR;
    delen.push(beweeg(platteKegel(wortel, tip, 1.9, 0.35, [s * 0.5, 0.85, 0], 0.5, M.vacht, s < 0 ? D.oorL : D.oorR, 0.6), bron));
  }

  // --- de teugels: van de ringen van het bit naar de hand van de heer, een beetje doorhangend
  if (o.teugel) {
    for (const s of [-1, 1]) {
      const bit = tfPunt(T.kop, kopPunt(21.5, -2.6, s * 3.3));
      const hand = plus(o.teugel, [s * 1.2, 0, 0]);
      const mid = plus(plus(bit, hand).map((v) => v / 2), [0, 0, -4]);
      delen.push(...bochtProfiel(bit, mid, hand, () => 0.45, 6, M.tuig, D.tuig, 0.3));
    }
  }

  // --- de benen: lang en slank; boven onder het kleed, onder de knie donker, met een kogel en een grote hoef
  for (const s of [-1, 1]) {
    const dv = s < 0 ? D.voorL : D.voorR;
    const da = s < 0 ? D.achterL : D.achterR;
    const [S, E, W, Vc] = PAARD.voor(s);
    const [Hp, Kn, Hk, Ac] = PAARD.achter(s);
    const onderbeen = (knie, hoef, dl) => {
      const kogel = plus(hoef, [0, -1.4, 6.4]);
      return [
        kegel(knie, kogel, 2.2, 1.9, M.poot, dl, 0.8),
        bol(kogel, 2.4, M.poot, dl, 1),
        kegel(kogel, plus(hoef, [0, 0.8, 2.2]), 2, 1.8, M.poot, dl, 0.8),
        kegel(plus(hoef, [0, 0.6, 1.6]), plus(hoef, [0, 0.9, -1.7]), 2.1, 2.8, M.hoef, dl, 0.6),
      ];
    };
    const voor = [
      [kegel(S, E, 4, 3.6, M.vacht, dv, 2.5)],
      [kegel(E, W, 3.4, 2.6, M.poot, dv, 1.2), bol(W, 2.9, M.poot, dv, 1)],
      onderbeen(W, Vc, dv),
    ];
    const achter = [
      [kegel(Hp, Kn, 4.4, 4, M.vacht, da, 2.5)],
      [kegel(Kn, Hk, 4, 2.6, M.poot, da, 1.2), bol(plus(Hk, [0, -0.9, 0.4]), 3, M.poot, da, 1)],
      onderbeen(Hk, Ac, da),
    ];
    const tv = poot(T, P, s < 0 ? 0 : 1, [S, E, W, Vc], true);
    const ta = poot(T, P, s < 0 ? 2 : 3, [Hp, Kn, Hk, Ac], false);
    voor.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, tv[j]))));
    achter.forEach((stuk, j) => delen.push(...stuk.map((d) => beweeg(d, ta[j]))));
  }

  // --- de staart: hoog aangezet, een korte stomp en dan lang haar tot op de hak, dat met de wind meegaat
  const stomp = bochtProfiel(PAARD.staartWortel, [0, -39.5, 60.5], [0, -41, 54], (t) => mix(3, 2.4, t), 3, M.manen, D.staart, 1);
  delen.push(...stomp.map((d) => beweeg(d, T.staart1)));
  const haar = [];
  for (const [dx, eind, dik] of [[0, 15, 3.4], [1.3, 19, 2.6], [-1.2, 18, 2.6]]) {
    const voet = [dx * 0.5, -41, 55];
    const bocht = [dx, -45.5, 38];
    const punt = [dx + wind[0] * 4, -43 + wind[1] * 4, eind];
    haar.push(...bochtProfiel(voet, bocht, punt, (t) => 1.6 + dik * Math.sin(Math.PI * (0.15 + 0.6 * t)), 6, M.manen, D.staart, 1.2));
  }
  delen.push(...haar.map((d) => beweeg(d, T.staart2)));

  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- de heer te paard

// Het paard en de heer in één beeld, het paard op `plek` (in tegels), naar `kant`. Hij zit in het zadel; het zadel gaat
// mee met de rug van het paard, en zijn linkerhand houdt de teugels.
function tekenTePaard(B, o, kant, plek = [0, 0]) {
  const P = paardHouding(o.houding || 'staan', o.fase || 0);
  const T = standen(P, PAARD);
  const zit = tfPunt(T.lijf, [0, ZADEL.y, ZADEL.z]);
  const heerM = heer(null, { zit: true });
  // de heer staat met zijn zitvlak (z = 13 in zijn maten, de onderkant van zijn buik) op het zadel
  const onder = [zit[0], zit[1], zit[2] - 13];
  const teugel = plus(middenVan(heerM, HAND_L), onder);
  const paardM = paard({ houding: o.houding, fase: o.fase, wind: windVoor(kant), teugel });
  K.tekenModel(B, paardM, { richting: kant, gx: plek[0], gy: plek[1] });
  const [gx, gy] = naarWereld([onder[0], onder[1]], kant, plek);
  K.tekenModel(B, heerM, { richting: kant, gx, gy, z: onder[2] });
}

// ---------------------------------------------------------------- de fakkel

// Een fakkel: een stok met een kop van pek in lappen en touw, en een vlam die flakkert (`vlam` 0, 1 of 2) en met de wind
// meegaat. In de maten van de soldaat, met de greep in zijn hand (`hand`); hij houdt hem schuin voor zich, van zich af.
function fakkel(hand, vlam = 0, wind = [0, 0]) {
  const F = { hout: 0, pek: 1, touw: 2, vuur: 3 };
  const mat = [];
  mat[F.hout] = { ramp: 'hout', lo: 1, hi: 4.6 };
  mat[F.pek] = { ramp: 'vacht', lo: 0.2, hi: 2.6, patroon: (x, y, z) => (ruis3(x * 0.8, y * 0.8, z * 0.8, 61) > 0.5 ? 0.8 : 0) };
  mat[F.touw] = { ramp: 'jas', lo: 1, hi: 3.6 };
  const r = eenheid([-0.22, 0.5, 0.84]);
  const op = (t) => plus(hand, r.map((v) => v * t));
  const delen = [];
  delen.push(kegel(op(-7), op(15), 0.8, 0.75, F.hout, 1));
  delen.push(kegel(op(13.5), op(20), 1.6, 2.1, F.pek, 2, 0.6));
  delen.push(ellips(op(20.2), [2.1, 2.1, 1.3], F.pek, 2, 0.6));
  for (const t of [14.6, 17.4]) delen.push(ring(op(t), r, 1.75, 0.42, F.touw, 2));
  // de vlam: een gloeiende kern op de kop, een tong omhoog die met de wind meebuigt, en twee kleinere ernaast
  const voet = plus(op(20.5), [0, 0, 0.6]);
  const flakker = [[0, 0, 0], [0.7, -0.4, 1.6], [-0.6, 0.5, -1.2]][vlam % 3];
  const tip = plus(voet, [wind[0] * 3.5 + flakker[0], wind[1] * 3.5 + flakker[1], 12.5 + flakker[2]]);
  mat[F.vuur] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(6.7 - ((z - voet[2]) / 13) * 3.8 + 0.5 * kijk, 2.2, 6.7) };
  delen.push(ellips(plus(voet, [0, 0, 2]), [2.7, 2.7, 3.2], F.vuur, 3));
  delen.push(kegel(plus(voet, [0, 0, 2.4]), tip, 2.5, 0.25, F.vuur, 3, 1.2));
  delen.push(kegel(plus(voet, [1.2, 0.3, 2]), plus(voet, [1.9 + wind[0] * 2.4 - flakker[0], 0.5 + wind[1] * 2.4, 8 - flakker[2] * 0.6]), 1.3, 0.15, F.vuur, 3, 0.8));
  delen.push(kegel(plus(voet, [-1.1, -0.3, 1.8]), plus(voet, [-1.7 + wind[0] * 2, -0.2 + wind[1] * 2, 6.6 + flakker[2] * 0.5]), 1.2, 0.15, F.vuur, 3, 0.8));
  const m = model(delen, mat, omhul(delen));
  m.vlam = plus(voet, [wind[0] * 1.5, wind[1] * 1.5, 5]); // het hart van het licht
  return m;
}

// Een soldaat van de heer, eventueel met het vaandel en een fakkel, in het beeld; geeft de plek van de vlam (in de wereld,
// in eenheden) als hij een fakkel draagt.
function tekenSoldaat(B, o, kant, plek) {
  const stand = { houding: o.houding || 'staan', fase: o.fase || 0 };
  const wind = windVoor(kant);
  const m = soldaat(stand, o.vaandel ? { vaandel: { wind, stand: o.stand || 0 } } : {});
  K.tekenModel(B, m, { richting: kant, gx: plek[0], gy: plek[1] });
  if (!o.fakkel) return null;
  const f = fakkel(middenVan(m, HAND_L), o.vlam || 0, wind);
  K.tekenModel(B, f, { richting: kant, gx: plek[0], gy: plek[1] });
  const [wx, wy] = naarWereld([f.vlam[0], f.vlam[1]], kant, plek);
  return [wx * TEGEL, wy * TEGEL, f.vlam[2]];
}

// ---------------------------------------------------------------- de proefplaat

function klaar(B) {
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Een rij beelden naast elkaar, elk tot wat erin staat, op één grondlijn (zoals de proefplaat van de ossenkar).
const RAND = 4;
const GAT = 8;
function zetRijen(rijen) {
  const maten = rijen.map((rij) => {
    let boven = 0;
    let onder = 0;
    const stukken = rij.map((s) => {
      const k = O.kader(s.p);
      if (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= s.p.b - 1 || k.y1 >= s.p.h - 1) console.log('LET OP: een beeld raakt de rand van zijn cel');
      boven = Math.max(boven, s.ay - k.y0);
      onder = Math.max(onder, k.y1 - s.ay);
      return { ...s, x0: k.x0 - RAND, b: k.x1 - k.x0 + 1 + 2 * RAND };
    });
    return { stukken, boven: boven + RAND, onder: onder + RAND };
  });
  const breed = Math.max(...maten.map((r) => r.stukken.reduce((som, s) => som + s.b + GAT, -GAT)));
  const hoog = maten.reduce((som, r) => som + r.boven + r.onder + 1, 0) + GAT * (maten.length - 1);
  const plaat = new K.Plaat(breed, hoog);
  let y = 0;
  for (const r of maten) {
    let x = 0;
    for (const s of r.stukken) {
      plaat.plak(s.p.uitsnede(s.x0, s.ay - r.boven, s.b, r.boven + r.onder + 1), x, y);
      x += s.b + GAT;
    }
    y += r.boven + r.onder + 1 + GAT;
  }
  return plaat;
}

// overdag: de heer te paard (staand van twee kanten en stappend), met de heer te voet ernaast om de maat te zien
function rijTePaard() {
  const cel = (o, kant) => {
    const B = new K.Beeld(220, 200, 110, 160);
    tekenTePaard(B, o, kant);
    return { p: klaar(B), ay: 160 };
  };
  const B = new K.Beeld(80, 100, 40, 88);
  K.tekenModel(B, heer({ houding: 'staan', fase: 0 }), { richting: 'ZW' });
  return [{ p: klaar(B), ay: 88 }, cel({ houding: 'staan', fase: 0.1 }, 'ZW'), cel({ houding: 'staan', fase: 0.1 }, 'NO'), cel({ houding: 'lopen', fase: 0.3 }, 'ZW')];
}

// overdag: de wagen van de heer van twee kanten; naar zuidwest loopt een soldaat naast de os
function rijWagens() {
  const cel = (kant, blink, metSoldaat) => {
    const B = new K.Beeld(280, 210, 140, 150);
    O.tekenOssenkar(B, { lading: 'buit', bak: 'heer', wind: windVoor(kant), blink }, kant);
    if (metSoldaat) tekenSoldaat(B, { houding: 'staan' }, kant, naarWereld([27, O.OS_Y - O.MIDDEN - 4], kant));
    return { p: klaar(B), ay: 150 };
  };
  return [cel('ZW', 0, true), cel('NO', 1, false)];
}

// 's nachts: een stuk van het leger, twee rijen van drie die naar zuidwest over de weg marcheren; voorop rechts het
// vaandel (zo waait het niet over de hellebaarden van de anderen), voorop links en achter in het midden een fakkel
const NACHT = [0.2, 0.24, 0.42]; // wat er van de kleur overblijft zonder licht (zoals lantaarn.cjs)
const WARM = [1.0, 0.7, 0.4]; // het licht van een fakkel: warmer dan de lantaarn
const FAKKEL_STRAAL = 50; // pixels; de lantaarn heeft 34
const POEL_STRAAL = 64; // de plas licht op de grond

function nachtLeger() {
  const kant = 'ZW';
  const B = new K.Beeld(330, 240, 150, 170);
  const leger = [
    { r: 1, k: -1, o: {} },
    { r: 1, k: 0, o: { fakkel: true, vlam: 1 } },
    { r: 1, k: 1, o: {} },
    { r: 0, k: -1, o: { fakkel: true, vlam: 0 } },
    { r: 0, k: 0, o: {} },
    { r: 0, k: 1, o: { vaandel: true, stand: 1 } },
  ];
  const vlammen = [];
  for (const s of leger) {
    // naar zuidwest is vooruit +y in de wereld, en opzij x
    const plek = [s.k * 0.82, -s.r * 1.15];
    const v = tekenSoldaat(B, { houding: 'lopen', fase: 0.25, ...s.o }, kant, plek);
    if (v) vlammen.push(v);
  }
  const p = klaar(B);
  // De nacht, zoals bij de lantaarn: elke pixel krijgt het licht van de nacht en van de fakkels die dichtbij zijn; de
  // vlammen zelf gloeien en blijven zo. De grond is een weg door het gras; een fakkel maakt er een plas licht op.
  const lichten = vlammen.map(([X, Y, Z]) => ({ vlam: K.naarScherm(B, X, Y, Z), grond: K.naarScherm(B, X, Y, 0) }));
  const rgba = Buffer.alloc(p.b * p.h * 4);
  const vuur = K.RAMP.vuur;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const i = y * p.b + x;
      const k = p.lees(x, y);
      let kleur;
      if (k) kleur = K.RAMP_RGB[k[0]][k[1]];
      else {
        // de grond onder deze pixel: van het scherm terug naar de wereld (z = 0)
        const sx = (x - B.OX) / K.EX[0];
        const sy = (y - B.OY) / K.EY[0];
        const X = (sx + sy) / 2;
        const Y = (sy - sx) / 2;
        const spoor = Math.abs(Math.abs(X / TEGEL) - 0.45) < 0.12 ? -10 : 0;
        const weg = Math.abs(X / TEGEL) < 1.45 + 0.08 * ruis3(Y * 0.05, 1, 2, 7);
        const ruis = 8 * ruis3(X * 0.15, Y * 0.15, 3, 9);
        kleur = weg ? [118 + ruis + spoor, 92 + ruis + spoor, 62 + ruis] : [66 + ruis, 92 + ruis, 40 + ruis];
      }
      if (k && k[0] === vuur) {
        rgba.set([...kleur, 255], i * 4);
        continue;
      }
      let donker = 1;
      for (const l of lichten) {
        const df = Math.hypot(x - l.vlam[0], (y - l.vlam[1]) * 1.15);
        const dg = Math.hypot(x - l.grond[0], (y - l.grond[1]) * 2);
        const wf = df < FAKKEL_STRAAL ? (1 - df / FAKKEL_STRAAL) ** 1.5 : 0;
        const wg = dg < POEL_STRAAL ? (1 - dg / POEL_STRAAL) ** 1.6 : 0;
        donker *= 1 - (k ? Math.max(wf, wg * 0.6) : Math.max(wg, wf * 0.5));
      }
      const w = 1 - donker;
      for (let c = 0; c < 3; c++) rgba[i * 4 + c] = klem(Math.round(kleur[c] * (NACHT[c] + (WARM[c] - NACHT[c]) * w * 0.92)), 0, 255);
      rgba[i * 4 + 3] = 255;
    }
  }
  return { b: p.b, h: p.h, rgba };
}

// overdag, van dichtbij: de vaandeldrager van twee kanten, en een soldaat met een fakkel, staand en lopend (de fakkel is
// in zijn linkerhand: van zuidwest, west en noordwest zie je hem, van noordoost, oost en zuidoost staat hij erachter)
function rijVaandel() {
  const cel = (o, kant) => {
    const B = new K.Beeld(150, 170, 60, 150);
    tekenSoldaat(B, o, kant, [0, 0]);
    return { p: klaar(B), ay: 150 };
  };
  return [cel({ vaandel: true }, 'ZW'), cel({ vaandel: true, stand: 2 }, 'NO'), cel({ fakkel: true }, 'ZW'), cel({ fakkel: true, vlam: 2, houding: 'lopen', fase: 0.6 }, 'W')];
}

function proef() {
  const dag = zetRijen([rijTePaard(), rijWagens(), rijVaandel()]);
  const dagRgba = dag.rgba('#5e6a44');
  const nacht = nachtLeger();
  // onder elkaar, met een donkere rand, en dan twee keer vergroot
  const b = Math.max(dag.b, nacht.b) + 2 * GAT;
  const h = dag.h + nacht.h + 3 * GAT;
  const doek = Buffer.alloc(b * h * 4);
  for (let i = 0; i < b * h; i++) doek.set([24, 26, 30, 255], i * 4);
  const plak = (bron, bb, bh, ox, oy) => {
    for (let y = 0; y < bh; y++) for (let x = 0; x < bb; x++) doek.set(bron.subarray((y * bb + x) * 4, (y * bb + x) * 4 + 4), ((oy + y) * b + ox + x) * 4);
  };
  plak(dagRgba, dag.b, dag.h, GAT, GAT);
  plak(nacht.rgba, nacht.b, nacht.h, GAT, dag.h + 2 * GAT);
  const Z = 2;
  const groot = Buffer.alloc(b * Z * h * Z * 4);
  for (let y = 0; y < h * Z; y++) {
    for (let x = 0; x < b * Z; x++) {
      const s = (Math.floor(y / Z) * b + Math.floor(x / Z)) * 4;
      groot.set(doek.subarray(s, s + 4), (y * b * Z + x) * 4);
    }
  }
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'heerstoet-proef.png'), K.pngVanBeeld({ b: b * Z, h: h * Z, rgba: groot }));
  console.log(`uit/heerstoet-proef.png (${b * Z}×${h * Z}, twee keer vergroot)`);
}

module.exports = { paard, paardHouding, tekenTePaard, fakkel, tekenSoldaat, windVoor, PAARD, PAARD_HOUDINGEN, PAARD_SNELHEID, KLEED };

if (require.main === module) proef();
