// De spiraaltrap van Aardschok, als 3D-model, in drie staten: ingestort, provisorisch en
// hersteld (ontwerp/toren.md, "De trap is het slot, maar geen muur"). Twee stukken:
//
//  - `trapOmhoog(staat)`: de spiraal om een spil die door een gat in het plafond verdwijnt.
//    Anderhalve slag, en dan is hij weg.
//  - `trapGat(staat)`: het gat in de vloer waar de trap van beneden aankomt, met de bovenste
//    treden er nog net uit.
//
// Maten. Een tegel is 80 cm (ontwerp/wereld.md) en 45,25 eenheden breed, dus één eenheid is
// 1,77 cm. Een spiraal waar een man doorheen past is minstens twee meter breed; dat is 2,5
// tegels, en een trap kan dus niet op één tegel staan. Hij beslaat er drie bij drie: de cirkel
// met een doorsnede van 2,33 m past daar precies in en raakt in het trappenhuis de twee muren
// van de zuidoosthoek. De spil is 40 cm dik, een trede loopt 90 cm van de spil naar buiten, en
// een opstap is 17 cm. Tien treden per slag, en een muur is 128 pixels (2,6 m) hoog: dat komt
// uit op vijftien treden tot het plafond, oftewel anderhalve slag.
'use strict';
const K = require('./kern.cjs');
const { sdf, rnd, ruis3, PXH } = K;
const { model, capsule } = require('./figuren.cjs');
const { draaiBlok } = require('./voorwerpen.cjs');

const R_SPIL = 11.5; // 0,40 m doorsnede
const R_BUITEN = 66; // 2,33 m doorsnede
const PER_SLAG = 10;
const OPSTAP = 9.85; // 17 cm
const DIK = 4.6; // dikte van een stenen trede
const PLAFOND = 128 / PXH; // 147,8 eenheden: de hoogte van een muur
const TREDEN = 16; // tot net door het gat heen
// Met `richting: 'Z'` geldt: schermX = -x, schermY = y / 2 - z * 0,866. Hoek 90° (de + y-as)
// wijst dus naar de speler toe. Daar begint de onderste trede, want daar staat hij.
const A0 = (72 * Math.PI) / 180;
const DA = (Math.PI * 2) / PER_SLAG;

// De tegelmaat waarop het spel de trap zet: drie bij drie, met de voorste hoek op de tegel
// waar het voorwerp staat. Zo klopt de sortering (x + y) zonder dat de trap door een muur steekt.
const TEGELS = 3;

// Het rendervenster. Het anker is het midden van de tegel waar het voorwerp op staat; het hart
// van de spiraal ligt een tegel naar achteren, dus op (-1, -1).
const CEL = [190, 250];
const ANKER = [95, 232];
const HART = [-1, -1];

// ---------------------------------------------------------------- materialen

const steen = (lo, hi, zaad = 1) => ({
  ramp: 'steen',
  lo,
  hi,
  patroon: (x, y, z) => (ruis3(x * 0.32, y * 0.32, z * 0.32, zaad) > 0.72 ? -0.7 : 0),
});
const hout = (lo = 1.2, hi = 5.8) => ({
  ramp: 'hout',
  lo,
  hi,
  dither: false,
  patroon: (x, y, z) => (Math.sin((x + y) * 0.4 + ruis3(x * 0.2, y * 0.2, z * 0.5, 4) * 5) > 0.8 ? -0.8 : 0),
});
const MAT = () => {
  const m = [];
  // Treden: het loopvlak licht, de stootborden en het schroefgewelf eronder donker. Zo blijft
  // elke trede te onderscheiden, ook als de spiraal een paar tegels verderop staat.
  m[0] = {
    ramp: 'steen',
    lo: 1.6,
    hi: 6.8,
    patroon: (x, y, z, nx, ny, nz) =>
      (nz < -0.3 ? -2.2 : nz < 0.4 ? -1 : 0) + (ruis3(x * 0.32, y * 0.32, z * 0.32, 1) > 0.72 ? -0.7 : 0),
  };
  m[1] = steen(1.2, 6.0, 5); // spil
  m[2] = steen(0.8, 4.4, 7); // de rand van het gat en de schacht: verder weg, dus donkerder
  m[3] = { ramp: 'ijzer', lo: 1, hi: 5.8, glans: 1.2 }; // leuning
  m[4] = hout(); // ladder en steigerhout
  m[5] = { ramp: 'stro', lo: 1.6, hi: 5.4 }; // touw
  m[6] = steen(1, 5.6, 11); // puin en afgebroken treden
  m[7] = { ramp: 'inkt', lo: 0, hi: 1.2 }; // het donker onderin
  return m;
};
const M = { trede: 0, spil: 1, rand: 2, ijzer: 3, hout: 4, touw: 5, puin: 6, donker: 7 };

// ---------------------------------------------------------------- vormen

// Een taartpunt tussen twee hoeken: een ring, afgesneden door twee halve vlakken door de as.
// Alleen geldig voor een punt van minder dan 180°, en dat is een trede altijd.
function sectorF(a0, a1, r0, r1, z0, z1) {
  const n0x = -Math.sin(a0);
  const n0y = Math.cos(a0);
  const n1x = Math.sin(a1);
  const n1y = -Math.cos(a1);
  const zm = (z0 + z1) / 2;
  const zh = (z1 - z0) / 2;
  return (x, y, z) => {
    const r = Math.hypot(x, y);
    return Math.max(r - r1, r0 - r, Math.abs(z - zm) - zh, -(x * n0x + y * n0y), -(x * n1x + y * n1y));
  };
}

// De grensbol om zo'n taartpunt: de verste hoek vanaf zijn eigen midden.
function grensSector(a0, a1, r0, r1, z0, z1) {
  const am = (a0 + a1) / 2;
  const rm = (r0 + r1) / 2;
  const cx = Math.cos(am) * rm;
  const cy = Math.sin(am) * rm;
  let ver = 0;
  for (const a of [a0, a1, am]) {
    for (const r of [r0, r1]) ver = Math.max(ver, Math.hypot(Math.cos(a) * r - cx, Math.sin(a) * r - cy));
  }
  return [cx, cy, (z0 + z1) / 2, Math.hypot(ver, (z1 - z0) / 2) + 1];
}

const sector = (a0, a1, r0, r1, z0, z1, m, deel) => ({
  f: sectorF(a0, a1, r0, r1, z0, z1),
  g: grensSector(a0, a1, r0, r1, z0, z1),
  m,
  deel,
});

// Een ring om de as: van r0 tot r1, van z0 tot z1. `rafel` maakt de binnenrand grillig, voor
// een gat waar de rand uit gebroken is.
function ring(r0, r1, z0, z1, m, deel, rafel = 0, zaad = 1) {
  const zm = (z0 + z1) / 2;
  const zh = (z1 - z0) / 2;
  return {
    f: (x, y, z) => {
      const r = Math.hypot(x, y);
      const bij = rafel ? rafel * (ruis3(x * 0.09, y * 0.09, 0, zaad) * 2 - 1) : 0;
      return Math.max(r - r1, r0 + bij - r, Math.abs(z - zm) - zh);
    },
    g: [0, 0, zm, Math.hypot(r1, zh) + rafel + 1],
    m,
    deel,
  };
}

const schijf = (r, z0, z1, m, deel) => ({
  f: (x, y, z) => sdf.cilinder(x, y, z, r, z0, z1),
  g: [0, 0, (z0 + z1) / 2, Math.hypot(r, (z1 - z0) / 2) + 1],
  m,
  deel,
});

// Waar ligt de neus van trede k, en op welke hoogte?
const hoekVan = (k) => A0 + k * DA;
const hoogteVan = (k) => (k + 1) * OPSTAP;

// Een hele stenen trede: een massieve taartpunt van de ene opstap tot de volgende, zoals een
// spiltrap in steen echt gemetseld is. Zo sluit trede op trede aan en zie je van onderaf het
// schroefgewelf, in plaats van losse plakken die in de lucht hangen.
// Trede om trede een ander deelnummer, want K.omlijn zet alleen een binnenlijn tussen twee
// verschillende delen. Zonder dat verandert de spiraal in een glad stenen vat.
const trede = (k, r0 = R_SPIL - 1, r1 = R_BUITEN) =>
  sector(hoekVan(k), hoekVan(k) + DA, r0, r1, hoogteVan(k) - OPSTAP, hoogteVan(k), M.trede, 20 + (k % 2));

// Een afgebroken trede: alleen het stuk dat nog aan de spil vastzit, met een grillige breuk.
function stomp(k, zaad) {
  const r1 = R_SPIL + 4 + rnd(zaad, k) * 16;
  const a0 = hoekVan(k) + DA * 0.08 * rnd(zaad, k + 30);
  const a1 = hoekVan(k) + DA * (1 - 0.14 * rnd(zaad, k + 60));
  return sector(a0, a1, R_SPIL - 1, r1, hoogteVan(k) - DIK, hoogteVan(k) - rnd(zaad, k + 90) * 1.4, M.puin, 3);
}

// Brokstukken op de vloer, rond de voet van de spil.
function brokken(delen, zaad, n, binnen, buiten, z = 0) {
  for (let i = 0; i < n; i++) {
    const a = rnd(zaad, i) * Math.PI * 2;
    const r = binnen + rnd(zaad, i + 20) * (buiten - binnen);
    const s = 2.6 + rnd(zaad, i + 40) * 4.4;
    delen.push(draaiBlok([Math.cos(a) * r, Math.sin(a) * r, z + s * 0.5], [s, s * 0.8, s * 0.55], rnd(zaad, i + 60) * 90, s * 0.3, M.puin, 3));
  }
}

// Een ladder van twee bomen en sporten, van voet naar top, op hoek `a` om de as.
function ladder(delen, a, rVoet, rTop, zTop, halfBreed = 13) {
  const ux = Math.cos(a);
  const uy = Math.sin(a);
  const sx = -Math.sin(a) * halfBreed;
  const sy = Math.cos(a) * halfBreed;
  const voet = [ux * rVoet, uy * rVoet, -1];
  const top = [ux * rTop, uy * rTop, zTop];
  for (const s of [-1, 1]) {
    delen.push(capsule([voet[0] + s * sx, voet[1] + s * sy, voet[2]], [top[0] + s * sx, top[1] + s * sy, top[2]], 2.2, M.hout, 4));
  }
  const n = Math.max(2, Math.round((zTop + 1) / 13));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const cx = voet[0] + (top[0] - voet[0]) * t;
    const cy = voet[1] + (top[1] - voet[1]) * t;
    const cz = voet[2] + (top[2] - voet[2]) * t;
    delen.push(capsule([cx - sx, cy - sy, cz], [cx + sx, cy + sy, cz], 1.5, M.hout, 4));
  }
  return { voet, top, sx, sy };
}

// Een touw dat in een slappe boog tussen twee punten hangt.
function touw(delen, p0, p1, zak, r = 1.1, stukken = 5) {
  for (let i = 0; i < stukken; i++) {
    const q = (t) => [
      p0[0] + (p1[0] - p0[0]) * t,
      p0[1] + (p1[1] - p0[1]) * t,
      p0[2] + (p1[2] - p0[2]) * t - Math.sin(Math.PI * t) * zak,
    ];
    delen.push(capsule(q(i / stukken), q((i + 1) / stukken), r, M.touw, 5));
  }
}

// ---------------------------------------------------------------- de trap omhoog

// De spil: een stenen kolom van de vloer tot door het gat, met een voetstuk.
function spil(delen, tot) {
  delen.push(schijf(R_SPIL, 0, tot, M.spil, 1));
  delen.push({ f: (x, y, z) => sdf.cilinder(x, y, z, R_SPIL + 3.4, 0, 5), g: [0, 0, 2.5, R_SPIL + 6], m: M.spil, deel: 1 });
}

// De rand van het gat in het plafond: de doorsnede van de vloer erboven, een dikke stenen kraag.
function plafondgat(delen, rafel = 0, zaad = 3) {
  delen.push(ring(R_BUITEN + 2, R_BUITEN + 16, PLAFOND, PLAFOND + 11, M.rand, 6, rafel, zaad));
}

// De leuning: een ijzeren handroede die de spiraal volgt, op spijlen.
function leuning(delen, vanaf, tot) {
  const rL = R_BUITEN - 5;
  const punt = (k) => {
    const a = hoekVan(k) + DA * 0.5;
    return [Math.cos(a) * rL, Math.sin(a) * rL, hoogteVan(k) + 46];
  };
  for (let k = vanaf; k < tot; k++) {
    // twee stukjes per trede, zodat de roede vloeiend meedraait
    for (const f of [0, 0.5]) {
      const p = (t) => {
        const a = hoekVan(k) + DA * (0.5 + t);
        return [Math.cos(a) * rL, Math.sin(a) * rL, hoogteVan(k) + t * OPSTAP + 46];
      };
      delen.push(capsule(p(f), p(f + 0.5), 1.6, M.ijzer, 7));
    }
    const b = punt(k);
    delen.push(capsule([b[0], b[1], hoogteVan(k) - DIK], b, 1.2, M.ijzer, 7));
  }
}

function trapOmhoog(staat = 'hersteld') {
  const d = [];
  const mat = MAT();
  if (staat === 'hersteld') {
    spil(d, PLAFOND + 13);
    for (let k = 0; k < TREDEN; k++) d.push(trede(k));
    leuning(d, 0, TREDEN - 1);
    plafondgat(d);
  } else if (staat === 'provisorisch') {
    spil(d, PLAFOND + 13);
    // wat er van de treden over is, en één geredde trede halverwege
    for (let k = 0; k < TREDEN; k++) {
      if (k === 5) d.push(trede(k, R_SPIL - 1, R_BUITEN - 14));
      else if (k % 3 !== 1) d.push(stomp(k, 2));
    }
    // de ladder: van de vloer aan de linkerkant schuin omhoog het gat in
    const l = ladder(d, (40 * Math.PI) / 180, 52, 16, PLAFOND + 6);
    // een steigervloertje halverwege: twee planken van de spil naar buiten, met een schoor
    for (let i = 0; i < 2; i++) {
      const a = (132 + i * 30) * Math.PI / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      d.push({
        f: (x, y, z) => {
          const u = x * ux + y * uy;
          const v = -x * uy + y * ux;
          return sdf.doos(u - 36, v, z - 60, 26, 6.5, 1.8, 0.5);
        },
        g: [ux * 36, uy * 36, 60, 28],
        m: M.hout,
        deel: 4,
      });
    }
    const aS = (2.62); // 150°: de schoor onder de steiger
    d.push(capsule([Math.cos(aS) * 54, Math.sin(aS) * 54, 57], [Math.cos(aS) * 16, Math.sin(aS) * 16, 5], 2, M.hout, 4));
    // touw: van de steiger naar de ladder, en een lus die langs de spil naar beneden hangt
    touw(d, [Math.cos(2.3) * 58, Math.sin(2.3) * 58, 62], [l.top[0] - l.sx, l.top[1] - l.sy, PLAFOND - 26], 14);
    touw(d, [Math.cos(2.0) * 44, Math.sin(2.0) * 44, 63], [Math.cos(1.1) * 30, Math.sin(1.1) * 30, 22], 12);
    brokken(d, 7, 9, R_SPIL + 6, R_BUITEN - 6);
    plafondgat(d);
  } else {
    // ingestort: de spil staat er nog, de treden zijn eraf, het puin ligt eronder
    spil(d, PLAFOND + 13);
    for (let k = 0; k < TREDEN; k++) if (k % 4 !== 2) d.push(stomp(k, 5));
    brokken(d, 3, 16, R_SPIL + 4, R_BUITEN - 2);
    // twee hele treden die naar beneden zijn gekomen en scheef op het puin liggen
    d.push(draaiBlok([Math.cos(0.9) * 34, Math.sin(0.9) * 34, 5], [23, 8, 2.4], 34, 1, M.puin, 3));
    d.push(draaiBlok([Math.cos(-0.7) * 40, Math.sin(-0.7) * 40, 4], [18, 7, 2.2], -52, 1, M.puin, 3));
    plafondgat(d, 7, 9);
  }
  return model(d, mat, { midden: [0, 0, 80], straal: 132 });
}

// ---------------------------------------------------------------- het gat in de vloer

// Het spel tekent de vloer, en de sprite komt daar overheen: alles van het gat dat onder de
// vloer uitsteekt zou dus vóór die vloer komen te hangen in plaats van erin te verdwijnen.
// Daarom blijft alles binnen de schaduw van de rand. In dit aanzicht is schermY = y / 2 - z *
// 0,866, dus per eenheid dieper moet de straal met 1,73 krimpen om niet onder de rand vandaan
// te komen. Het donker in het gat is daarom een afgeknotte kegel met precies die helling, en
// wat dieper zit dan de kegelrand zie je niet meer — dat is het donker.
const R_GAT = R_BUITEN + 2;
const A0G = (72 * Math.PI) / 180; // de bovenste trede kijkt de kamer in
const TOP_GAT = 15; // de bovenste treden steken een opstap boven de vloer uit

// De rand van het gat (de doorsnede van de vloer) en het donker erin.
function gatrand(delen, rafel = 0, zaad = 2) {
  delen.push(ring(R_GAT, R_GAT + 20, -2, 5, M.rand, 6, rafel, zaad));
  delen.push({
    f: (x, y, z) => {
      const r = Math.hypot(x, y);
      return Math.max((r - R_GAT - 20 - 1.732 * z) / 2, r - R_GAT, -52 - z, z + 1);
    },
    g: [0, 0, -26, 80],
    m: M.donker,
    deel: 8,
  });
}

// De treden die van beneden komen: alleen de bovenste twee steken nog boven het donker uit.
const gatTrede = (k, r1 = R_BUITEN) =>
  sector(A0G - k * DA, A0G - k * DA + DA, R_SPIL - 1, r1, TOP_GAT - (k + 1) * OPSTAP, TOP_GAT - k * OPSTAP, M.trede, 20 + (k % 2));

// De spil komt als een paal uit het gat omhoog, met een kraag erop.
function spilKop(delen, tot) {
  delen.push(schijf(R_SPIL, -50, tot, M.spil, 1));
  if (tot > 4) delen.push(schijf(R_SPIL + 3.4, tot - 4, tot, M.spil, 1));
}

function trapGat(staat = 'hersteld') {
  const d = [];
  const mat = MAT();
  if (staat === 'hersteld') {
    gatrand(d);
    spilKop(d, TOP_GAT + 12);
    d.push(gatTrede(0));
    d.push(gatTrede(1));
    // het laatste stuk leuning krult mee het gat uit
    for (let k = 0; k < 2; k++) {
      const p = (t) => {
        const a = A0G - k * DA + DA * (0.5 - t);
        return [Math.cos(a) * (R_BUITEN - 5), Math.sin(a) * (R_BUITEN - 5), TOP_GAT - (k + t) * OPSTAP + 44];
      };
      for (const f of [0, 0.5]) d.push(capsule(p(f), p(f + 0.5), 1.6, M.ijzer, 7));
      const b = p(0);
      d.push(capsule([b[0], b[1], b[2] - 44], b, 1.2, M.ijzer, 7));
    }
  } else if (staat === 'provisorisch') {
    gatrand(d, 3, 6);
    spilKop(d, 3);
    d.push(gatTrede(0, R_BUITEN - 14)); // één geredde trede
    // planken over een kwart van het gat, waar je overheen kunt
    for (let i = 0; i < 3; i++) {
      const a = ((108 + i * 17) * Math.PI) / 180;
      const ux = Math.cos(a);
      const uy = Math.sin(a);
      d.push({
        f: (x, y, z) => {
          const u = x * ux + y * uy;
          const v = -x * uy + y * ux;
          return sdf.doos(u, v, z - 2.6, R_GAT + 14, 7, 2.4, 0.5);
        },
        g: [0, 0, 2.6, R_GAT + 18],
        m: M.hout,
        deel: 4,
      });
    }
    // de kop van een ladder steekt achter uit het gat, met een touw naar de planken
    const l = ladder(d, (206 * Math.PI) / 180, 20, 46, 16, 10);
    touw(d, [l.top[0], l.top[1], 14], [Math.cos(2.1) * (R_GAT + 10), Math.sin(2.1) * (R_GAT + 10), 5], 5, 1.1, 4);
    brokken(d, 4, 6, R_GAT + 4, R_GAT + 18, 4);
  } else {
    // ingestort: een gapend gat met een gebroken rand, de spil afgeknapt, puin eromheen
    gatrand(d, 9, 4);
    spilKop(d, 2);
    d.push(draaiBlok([Math.cos(3.5) * 22, Math.sin(3.5) * 22, -2], [11, 8, 5], 24, 2, M.puin, 3));
    brokken(d, 6, 13, R_GAT + 3, R_GAT + 20, 4);
  }
  return model(d, mat, { midden: [0, 0, -12], straal: 100 });
}

// ---------------------------------------------------------------- cellen voor het vel

const STATEN = ['ingestort', 'provisorisch', 'hersteld'];
const SOORTEN = { trap: trapOmhoog, trapgat: trapGat };

// Eén cel: het model staat met zijn hart een tegel schuin naar achteren, zodat de voorste hoek
// van zijn drie bij drie tegels op het anker valt.
function cel(soort, staat) {
  return K.losRenderen(SOORTEN[soort](staat), {
    b: CEL[0],
    h: CEL[1],
    anker: ANKER,
    richting: 'Z',
    model: { gx: HART[0], gy: HART[1] },
  });
}

// Het hele vel: een rij per soort, een kolom per staat.
function vel() {
  const namen = Object.keys(SOORTEN);
  const p = new K.Plaat(CEL[0] * STATEN.length, CEL[1] * namen.length);
  namen.forEach((soort, r) => STATEN.forEach((staat, k) => p.plak(cel(soort, staat), k * CEL[0], r * CEL[1])));
  return p;
}

module.exports = { trapOmhoog, trapGat, cel, vel, CEL, ANKER, HART, STATEN, SOORTEN, TEGELS, R_BUITEN, PLAFOND };
