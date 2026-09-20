// Het startdorp van Aardschok in HD-pixel art: gras, zandpaden en kasseien, huizen van vakwerk en
// veldsteen onder riet en rode pannen, en wat er op het plein staat.
//
// Muren en daken zijn convexe vormen: doorsneden van halve ruimten, per pixel doorgerekend zoals de
// dozen in kern.cjs, maar dan ook met schuine vlakken. Zo krijgen een dakschild, een gevel en een
// schoorsteen dezelfde scherpe randen als een muur. De dakhelling is atan(√1,5) ≈ 50,8°: dan lopen
// de pannenrijen op het scherm 2:1 en de kolommen 1:2, en trapt elke lijn schoon.
//
// Alle patronen rekenen in schermpixels die aan de wereld vastzitten (sx, sy hieronder), op het
// midden van de pixel. Randen van patronen en randen van vormen vallen daardoor op dezelfde trap.
'use strict';
const K = require('./kern.cjs');
const { TEGEL, PXH, RAMP, UIT, VLAG, hash, rnd, ruis2, ruis3, klem, mix, sdf } = K;
const F = require('./figuren.cjs');
const VW = require('./voorwerpen.cjs');

const SQ = Math.SQRT1_2;
const [VX, VY, VZ] = K.V;
const [LX, LY, LZ] = K.LICHT;
const HELLING = Math.sqrt(1.5); // tan van de dakhelling

// schermplek van een wereldpunt, los van de oorsprong van het beeld
const schermX = (X, Y) => (X - Y) * SQ;
const schermY = (X, Y, Z) => (X + Y) * 0.5 * SQ - Z * PXH;

// ---------------------------------------------------------------- convexe vormen

// Een vorm is de doorsnede van halve ruimten n·p <= d, in wereldeenheden. Elk vlak heeft een naam
// die de textuur krijgt ('x', 'y', 'z' voor de zichtbare kanten van een blok, 'dak', 'rand', ...).
// o.doos = [x0, y0, z0, x1, y1, z1] omsluit de vorm; daarmee wordt het rekenwerk begrensd.
function vorm(vlakken, tex, o = {}) {
  const vl = vlakken.map((v) => {
    const l = Math.hypot(v.n[0], v.n[1], v.n[2]);
    return { ...v, n: [v.n[0] / l, v.n[1] / l, v.n[2] / l], d: v.d / l };
  });
  return { vlakken: vl, tex, ...o };
}

// Een blok in tegels en pixels hoogte, zoals K.doos, maar als vorm.
function blok(gx0, gy0, gx1, gy1, h0, h1, tex, o = {}) {
  const x0 = gx0 * TEGEL;
  const x1 = gx1 * TEGEL;
  const y0 = gy0 * TEGEL;
  const y1 = gy1 * TEGEL;
  const z0 = h0 / PXH;
  const z1 = h1 / PXH;
  return vorm(
    [
      { n: [1, 0, 0], d: x1, naam: 'x' },
      { n: [0, 1, 0], d: y1, naam: 'y' },
      { n: [0, 0, 1], d: z1, naam: 'z' },
      { n: [-1, 0, 0], d: -x0, naam: '-x' },
      { n: [0, -1, 0], d: -y0, naam: '-y' },
      { n: [0, 0, -1], d: -z0, naam: '-z' },
    ],
    tex,
    { doos: [x0, y0, z0, x1, y1, z1], ...o },
  );
}

// De hoeken van de omsluitende doos naar het scherm: welk stuk van het beeld de vorm kan raken.
function schermKader(B, doos) {
  const [x0, y0, z0, x1, y1, z1] = doos;
  let a = Infinity;
  let b = -Infinity;
  let c = Infinity;
  let d = -Infinity;
  for (const X of [x0, x1]) {
    for (const Y of [y0, y1]) {
      for (const Z of [z0, z1]) {
        const [sx, sy] = K.naarScherm(B, X, Y, Z);
        a = Math.min(a, sx);
        b = Math.max(b, sx);
        c = Math.min(c, sy);
        d = Math.max(d, sy);
      }
    }
  }
  return [Math.max(0, Math.floor(a) - 1), Math.min(B.b - 1, Math.ceil(b) + 1), Math.max(0, Math.floor(c) - 1), Math.min(B.h - 1, Math.ceil(d) + 1)];
}

// Vormen tekenen: per pixel de straal door de vorm, het vlak waar hij binnenkomt, en de textuur
// van dat vlak. Diepte, plek en normaal gaan het beeld in zoals bij tekenDozen, zodat belichten,
// schaduw en omlijnen er gewoon mee werken. o.omlijn zet de omlijning aan (voor gebouwen).
function tekenVormen(B, vormen, o = {}) {
  for (const v of vormen) {
    const [px0, px1, py0, py1] = schermKader(B, v.doos);
    const vl = v.vlakken;
    const n = vl.length;
    const nv = vl.map((p) => p.n[0] * VX + p.n[1] * VY + p.n[2] * VZ);
    const obj = v.obj ?? 0;
    const vlagExtra = v.omlijn ?? o.omlijn ? VLAG.OMLIJN : 0;
    for (let py = py0; py <= py1; py++) {
      for (let px = px0; px <= px1; px++) {
        const ax = px + 0.5 - B.OX;
        const ay = py + 0.5 - B.OY;
        const X = ax * K.EX[0] + ay * K.EY[0];
        const Y = ax * K.EX[1] + ay * K.EY[1];
        const Z = ax * K.EX[2] + ay * K.EY[2];
        let tin = -Infinity;
        let tuit = Infinity;
        let k = -1;
        for (let j = 0; j < n; j++) {
          const p = vl[j];
          const np = p.n[0] * X + p.n[1] * Y + p.n[2] * Z;
          if (Math.abs(nv[j]) < 1e-12) {
            if (np > p.d) {
              tin = Infinity;
              break;
            }
            continue;
          }
          const t = (p.d - np) / nv[j];
          if (nv[j] < 0) {
            if (t > tin) {
              tin = t;
              k = j;
            }
          } else if (t < tuit) tuit = t;
        }
        if (k < 0 || tin > tuit) continue;
        const i = py * B.b + px;
        const diepte = -tin;
        if (diepte <= B.diep[i]) continue;
        const HX = X + VX * tin;
        const HY = Y + VY * tin;
        const HZ = Z + VZ * tin;
        const p = vl[k];
        UIT.weg = false;
        UIT.vlag = 0;
        v.tex(p.naam, HX, HY, HZ, px, py, v, p);
        if (UIT.weg) continue;
        B.ramp[i] = UIT.ramp;
        B.stap[i] = UIT.stap;
        B.vlag[i] = UIT.vlag | vlagExtra | (p.naam === 'z' && HZ < 0.5 && !v.geenVloer ? VLAG.VLOER : 0);
        B.diep[i] = diepte;
        B.obj[i] = obj;
        B.deel[i] = v.deel ?? -1;
        B.pos[i * 3] = HX;
        B.pos[i * 3 + 1] = HY;
        B.pos[i * 3 + 2] = HZ;
        B.nrm[i * 3] = p.n[0];
        B.nrm[i * 3 + 1] = p.n[1];
        B.nrm[i * 3 + 2] = p.n[2];
      }
    }
  }
}

// Treft een straal vanaf P in richting R de vorm? (voor schaduw)
function straalRaakt(v, P, R, max = Infinity) {
  const [x0, y0, z0, x1, y1, z1] = v.doos;
  // eerst de omsluitende doos
  let s0 = 0;
  let s1 = max;
  for (let a = 0; a < 3; a++) {
    const lo = a === 0 ? x0 : a === 1 ? y0 : z0;
    const hi = a === 0 ? x1 : a === 1 ? y1 : z1;
    if (Math.abs(R[a]) < 1e-12) {
      if (P[a] < lo || P[a] > hi) return false;
      continue;
    }
    let ta = (lo - P[a]) / R[a];
    let tb = (hi - P[a]) / R[a];
    if (ta > tb) [ta, tb] = [tb, ta];
    if (ta > s0) s0 = ta;
    if (tb < s1) s1 = tb;
    if (s0 > s1) return false;
  }
  s0 = 0;
  s1 = max;
  for (const p of v.vlakken) {
    const nr = p.n[0] * R[0] + p.n[1] * R[1] + p.n[2] * R[2];
    const np = p.n[0] * P[0] + p.n[1] * P[1] + p.n[2] * P[2];
    if (Math.abs(nr) < 1e-12) {
      if (np > p.d) return false;
      continue;
    }
    const t = (p.d - np) / nr;
    if (nr < 0) {
      if (t > s0) s0 = t;
    } else if (t < s1) s1 = t;
    if (s0 > s1) return false;
  }
  return true;
}

// Hoeveel direct licht een vlak met normaal n krijgt (0..1)
const lichtOp = (n) => Math.max(0, n[0] * LX + n[1] * LY + n[2] * LZ);

// Een eigen ramp voor veldsteen. 'steen' trekt naar paars en 'pet' naar blauw; een muur hoort
// grijs te zijn met hooguit een koele zweem. We schrijven hem hier bij in de tabellen van
// kern.cjs, zodat dat bestand van iedereen blijft.
if (K.RAMP.veldsteen === undefined) {
  const hexen = ['#1e1f22', '#2e3035', '#414349', '#55585e', '#6b6e74', '#83868c', '#9da0a5', '#b9bbbf', '#d4d6d8'];
  const rgb = hexen.map((h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  K.RAMPEN.veldsteen = hexen;
  K.RAMP.veldsteen = K.RAMP_NAMEN.length;
  K.RAMP_NAMEN.push('veldsteen');
  K.RAMP_RGB.push(rgb);
  K.RAMP_LEN.push(hexen.length);
}

// ---------------------------------------------------------------- de grondkaart

// Waar ligt gras, waar een zandpad, waar kasseien? Paden zijn lijnen door tegelpunten met een
// breedte, pleinen afgeronde rechthoeken. De randen zijn met ruis verstoord, zodat een pad niet
// langs een liniaal loopt. soort(gx, gy) geeft één gedeeld object terug:
//   s     GRAS, PAD, KASSEI, AKKER (een moestuin in ruggen) of WATER (een beek of een vijver)
//   d     afstand tot de rand in tegels (negatief: erbinnen)
//   dwars plek dwars over het pad of de beek, -1..1 (voor de karrensporen en de stroom)
//   rand  afstand van het gras tot het dichtstbijzijnde pad, plein of water
//   langs plek langs de beek in tegels (voor de rimpels), diep: hoe diep het water ligt (pixels)
// Let op: soort() geeft steeds hetzelfde object terug. Wie er twee achter elkaar aanroept (het
// water kijkt naar de overkant) moet de waarden eerst overschrijven in eigen variabelen.
const GRAS = 0;
const PAD = 1;
const KASSEI = 2;
const AKKER = 3;
const WATER = 4;
const AKKER_RIJ = 0.24; // tegels tussen twee ruggen
const AKKER_PLANT = 0.3; // tegels tussen twee planten op een rug

function totLijnstuk(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = klem(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
  const qx = ax + dx * t;
  const qy = ay + dy * t;
  const kant = dx * (py - ay) - dy * (px - ax) < 0 ? -1 : 1;
  return [Math.hypot(px - qx, py - qy), kant];
}

function grondKaart(o = {}) {
  const paden = (o.paden || []).map((p) => ({ breed: 1, soort: PAD, ruw: 1, ...p }));
  const pleinen = (o.pleinen || []).map((p) => ({ r: 0.4, ruw: 1, ...p }));
  const akkers = o.akkers || [];
  const beken = (o.beken || []).map((b) => ({ breed: 1.3, diep: 7, ruw: 0.5, ...b }));
  const vijvers = (o.vijvers || []).map((v) => ({ diep: 9, ruw: 0.8, ...v }));
  const zaad = o.zaad || 1;
  const U = { s: GRAS, d: 9, dwars: 0, rand: 9, randS: GRAS, langs: 0, diep: 0, vijver: null, akker: null };
  function soort(gx, gy) {
    if (o.vast !== undefined) {
      U.s = o.vast;
      U.d = -9;
      U.dwars = 0;
      U.rand = 0;
      return U;
    }
    const ruw = (ruis2(gx * 2.3, gy * 2.3, zaad) - 0.5) * 0.22 + (ruis2(gx * 7.1, gy * 7.1, zaad + 7) - 0.5) * 0.1;
    let rand = 9;
    let randS = GRAS;
    const dichterbij = (d, soort) => {
      if (d < rand) {
        rand = d;
        randS = soort;
      }
    };
    // water snijdt door alles heen: eerst de vijvers, dan de beken
    for (const v of vijvers) {
      const nx = (gx - v.x) / v.rx;
      const ny = (gy - v.y) / v.ry;
      const n = Math.hypot(nx, ny);
      const d = (n - 1) * Math.min(v.rx, v.ry) + ruw * v.ruw;
      if (d < 0) {
        U.s = WATER;
        U.d = d;
        U.dwars = n;
        U.langs = (gx + gy) * 0.5;
        U.diep = v.diep;
        U.vijver = v;
        U.rand = 0;
        return U;
      }
      dichterbij(d, WATER);
    }
    for (const b of beken) {
      let min = Infinity;
      let kant = 1;
      let langs = 0;
      let af = 0;
      const pt = b.punten;
      for (let i = 0; i + 1 < pt.length; i++) {
        const dx = pt[i + 1][0] - pt[i][0];
        const dy = pt[i + 1][1] - pt[i][1];
        const l = Math.hypot(dx, dy);
        const t = klem(((gx - pt[i][0]) * dx + (gy - pt[i][1]) * dy) / (l * l), 0, 1);
        const a = Math.hypot(gx - (pt[i][0] + dx * t), gy - (pt[i][1] + dy * t));
        if (a < min) {
          min = a;
          kant = dx * (gy - pt[i][1]) - dy * (gx - pt[i][0]) < 0 ? -1 : 1;
          langs = af + t * l;
        }
        af += l;
      }
      // de beek is in het midden dieper dan aan de kant
      const halve = b.breed / 2;
      const d = min - halve + ruw * b.ruw;
      if (d < 0) {
        U.s = WATER;
        U.d = d;
        U.dwars = (kant * min) / halve;
        U.langs = langs;
        U.diep = b.diep;
        U.vijver = null;
        U.rand = 0;
        return U;
      }
      dichterbij(d, WATER);
    }
    // moestuinen: rechthoeken met een ietwat rafelige rand, ruggen langs a.langs ('x' of 'y')
    for (const a of akkers) {
      const d = Math.max(a.x0 - gx, gx - a.x1, a.y0 - gy, gy - a.y1) + ruw * 0.3;
      if (d < 0) {
        const dwars = a.langs === 'y' ? gx - a.x0 : gy - a.y0;
        U.s = AKKER;
        U.d = d;
        U.dwars = dwars / AKKER_RIJ;
        U.rand = 0;
        U.akker = a;
        return U;
      }
      dichterbij(d, WATER);
    }
    for (const p of pleinen) {
      const cx = (p.x0 + p.x1) / 2;
      const cy = (p.y0 + p.y1) / 2;
      const qx = Math.abs(gx - cx) - ((p.x1 - p.x0) / 2 - p.r);
      const qy = Math.abs(gy - cy) - ((p.y1 - p.y0) / 2 - p.r);
      const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - p.r + ruw * p.ruw;
      if (d < 0) {
        U.s = KASSEI;
        U.d = d;
        U.dwars = 0;
        U.rand = 0;
        return U;
      }
      dichterbij(d, KASSEI);
    }
    let beste = null;
    let besteD = Infinity;
    let besteDwars = 0;
    for (const p of paden) {
      let min = Infinity;
      let kant = 1;
      const pt = p.punten;
      for (let i = 0; i + 1 < pt.length; i++) {
        const [a, k] = totLijnstuk(gx, gy, pt[i][0], pt[i][1], pt[i + 1][0], pt[i + 1][1]);
        if (a < min) {
          min = a;
          kant = k;
        }
      }
      const d = min - p.breed / 2 + ruw * p.ruw;
      if (d < besteD) {
        besteD = d;
        beste = p;
        besteDwars = (kant * min) / (p.breed / 2);
      }
    }
    if (beste && besteD < 0) {
      U.s = beste.soort;
      U.d = besteD;
      U.dwars = besteDwars;
      U.rand = 0;
      return U;
    }
    if (beste && besteD < rand) {
      rand = besteD;
      randS = beste.soort;
    }
    U.s = GRAS;
    U.d = rand;
    U.rand = rand;
    U.randS = randS;
    U.dwars = 0;
    return U;
  }
  return { soort, paden, pleinen, akkers, beken, vijvers };
}

// ---------------------------------------------------------------- grond: gras, zand, kasseien

// Het rooster van schermpixels op de grond (z = 0), vast aan de wereld.
const roosterX = (X, Y) => Math.floor((X - Y) * SQ);
const roosterY = (X, Y) => Math.floor((X + Y) * 0.5 * SQ);
// en terug: het wereldpunt onder het midden van roosterpixel (qx, qy)
const vanRooster = (qx, qy) => {
  const a = qx + 0.5;
  const b = qy + 0.5;
  return [(a + 2 * b) * SQ, (2 * b - a) * SQ];
};

// Gras: vlakken in twee tinten, en daarop een dicht patroon van kleine plukjes (een v of een w
// van twee pixels hoog), elk met een lichte punt en een donkere voet. Plukjes staan op een
// verspringend rooster van 5 bij 3 schermpixels. De grote pollen komen er later bij
// (grasPollen), want die steken over paden en muurvoeten heen.
const PLUK = [
  // [dx, dy, toon]: dy omhoog negatief; toon 1 = licht, -1 = donker
  [[0, 0, -1], [-1, -1, 1], [1, -1, 1]],
  [[0, 0, -1], [0, -1, 0], [-1, -2, 1], [1, -2, 1]],
  [[-1, 0, -1], [1, 0, -1], [-2, -1, 1], [0, -1, 1], [2, -1, 1]],
  [[0, 0, -1], [0, -1, 1]],
  [[0, 0, -1], [1, -1, 0], [1, -2, 1]],
  [[0, 0, -1], [-1, -1, 0], [-1, -2, 1]],
];
function grasToon(gx, gy) {
  const v = ruis2(gx * 1.05 + 3, gy * 1.05, 21) * 0.65 + ruis2(gx * 3.1, gy * 3.1, 22) * 0.35;
  return v < 0.4 ? 3 : v > 0.72 ? 5 : 4;
}
function plukOp(qx, qy) {
  const rj = Math.floor(qy / 3);
  for (let j = rj; j <= rj + 1; j++) {
    const verspring = (j & 1) * 2;
    const ri = Math.floor((qx - verspring) / 5);
    for (let i = ri - 1; i <= ri + 1; i++) {
      const h = hash(i, j, 33);
      if (h % 7 < 2) continue; // hier en daar geen plukje: dan blijft het rustig
      const ax = i * 5 + verspring + ((h >>> 4) % 3);
      const ay = j * 3 + ((h >>> 7) % 2);
      const vorm = PLUK[(h >>> 9) % PLUK.length];
      for (const [dx, dy, toon] of vorm) if (ax + dx === qx && ay + dy === qy) return toon === 0 ? 2 : toon;
    }
  }
  return 0;
}
function grasPixel(gx, gy, qx, qy, rand, dor) {
  UIT.ramp = RAMP.gras;
  const toon = grasToon(gx, gy);
  let s = toon === 5 ? 4 : toon;
  const p = plukOp(qx, qy);
  if (p === 1) s = toon === 3 ? 4 : 5;
  else if (p === 2) s = toon === 3 ? 3 : 4 + (toon === 5 ? 1 : 0);
  else if (p === -1) s = toon === 5 ? 4 : toon - 1;
  // Rond het dorp ligt het land er droog en vertrapt bij: mos in plaats van het felle gras,
  // met dorre plekken stro en kale aarde ertussen. De plukjes blijven, alleen doffer.
  if (dor) {
    const droog = ruis2(gx * 0.85 + 11, gy * 0.85, 58) * 0.7 + ruis2(gx * 2.6, gy * 2.6, 59) * 0.3;
    // grote vlekken: waar de zon valt staat het gras lichter, in de laagtes dieper groen
    const vlek = ruis2(gx * 0.3 + 31, gy * 0.3, 61);
    s += vlek > 0.8 ? 1 : vlek < 0.34 ? -1 : 0;
    if (droog > 0.84 || (droog > 0.8 && hash(qx, qy, 57) % 3 === 0)) {
      UIT.ramp = RAMP.riet;
      UIT.stap = klem(s - 1 + (p === 1 ? 1 : 0), 1, 6);
      return;
    }
    if ((droog < 0.18 || rand < 0.12) && hash(qx, qy, 60) % 5 === 0) {
      UIT.ramp = RAMP.aarde;
      UIT.stap = 3 + (p === 1 ? 1 : 0) - (p === -1 ? 1 : 0);
      return;
    }
    UIT.ramp = RAMP.mos;
    UIT.stap = klem(s - (droog > 0.52 ? 1 : 2), 0, 5);
    return;
  }
  // vertrapt gras langs de paden: kale plekjes aarde
  if (rand < 0.1 && p === 0 && hash(qx, qy, 36) % 3 === 0) {
    UIT.ramp = RAMP.aarde;
    s = 4;
  }
  UIT.stap = s;
}

// Een zandpad: vochtige en droge plekken, twee karrensporen, kiezels en korrels. Waar het gras
// tussen de zon en het pad staat, valt een pixel schaduw op het pad: het pad ligt lager.
function padPixel(gx, gy, qx, qy, k, kaart, dor) {
  UIT.ramp = RAMP.aarde;
  const n = ruis2(gx * 1.6, gy * 1.6, 41) * 0.7 + ruis2(gx * 5, gy * 5, 42) * 0.3;
  let s = n < 0.34 ? 3 : n > 0.7 ? 5 : 4;
  // karrensporen: een donkere geul op een derde en twee derde van de breedte, met een lichtere
  // rug aan weerszijden
  const a = Math.abs(k.dwars);
  if (a > 0.36 && a < 0.6) s = 3;
  else if ((a > 0.6 && a < 0.68) || (a > 0.3 && a <= 0.36)) s = Math.max(s, 4);
  // modder: diepere karrensporen, natte plekken en plassen in de geulen
  if (dor) {
    const nat = ruis2(gx * 2.1 + 5, gy * 2.1, 63) * 0.65 + ruis2(gx * 5.5, gy * 5.5, 64) * 0.35;
    const geul = a > 0.3 && a < 0.7;
    if (geul) s -= 1;
    const poel = ruis2(gx * 3.4 + 19, gy * 3.4, 65);
    if (geul && nat > 0.6 && poel > 0.54) {
      // een plas: bruin water dat de lucht maar flauw weerkaatst
      const diep = Math.min((nat - 0.6) * 4, (poel - 0.54) * 5, 1);
      UIT.ramp = RAMP.pet;
      UIT.stap = diep < 0.25 ? 2 : (qx + qy * 2) % 9 === 0 ? 5 : diep > 0.6 ? 3 : 4;
      UIT.vlag = VLAG.GLAD;
      return;
    }
    if (nat > 0.6) s -= 1;
  }
  // korrels en kiezels
  const h = hash(qx, qy, 43) % 71;
  if (h === 0) s -= 1;
  else if (h === 1) s += 1;
  const kiezel = kiezelOp(qx, qy);
  if (kiezel) {
    UIT.ramp = kiezel[0];
    s = kiezel[1];
  }
  // schaduwrand van het gras
  if (kaart && k.d > -0.12) {
    const buur = kaart.soort(gx + 0.05 * LX / 0.67, gy + 0.05 * LY / 0.67);
    if (buur.s === GRAS) {
      UIT.ramp = RAMP.aarde;
      s = Math.min(s, 3) - (buur.d < -0.02 ? 1 : 0);
    }
  }
  UIT.stap = s;
}

// Een moestuin: ruggen van losse aarde met voren ertussen. De kant van de rug naar de zon is
// lichter, de voor donker en vochtig, en hier en daar een kluitje.
function akkerPixel(qx, qy, k) {
  UIT.ramp = RAMP.aarde;
  const f = k.dwars - Math.floor(k.dwars);
  let s;
  // ruggen langs x vangen de zon aan hun +y-kant, ruggen langs y aan hun -x-kant
  const zonLaag = k.akker && k.akker.langs === 'y';
  if (f < 0.18 || f > 0.86) s = 2; // de voor
  else if (f < 0.34) s = zonLaag ? 5 : 3;
  else if (f < 0.7) s = 4; // de rug
  else s = zonLaag ? 3 : 5;
  const h = hash(qx, qy, 181) % 29;
  if (h === 0) s += 1;
  else if (h === 1) s -= 1;
  // het gewas: kaal geploegd, jonge scheuten op de ruggen, of rijp graan
  const stadium = k.akker && k.akker.stadium;
  if (stadium === 'jong' && f > 0.28 && f < 0.74 && hash(qx, qy, 183) % 4 === 0) {
    UIT.ramp = RAMP.mos;
    UIT.stap = 3 + (hash(qx, qy, 184) % 3 === 0 ? 1 : 0);
    return;
  }
  if (stadium === 'rijp' && f > 0.2 && f < 0.82) {
    UIT.ramp = RAMP.stro;
    const halm = ((qx * 2 + qy) % 5 === 0 ? 1 : 0) - (hash(qx, qy, 185) % 6 === 0 ? 1 : 0);
    UIT.stap = klem(3 + halm + (f > 0.5 ? 1 : 0), 1, 6);
    return;
  }
  UIT.stap = s;
}

// Kiezels van twee of drie pixels, met een slagschaduw eronder.
function kiezelOp(qx, qy) {
  for (let dy = 0; dy <= 1; dy++) {
    for (let dx = 0; dx <= 2; dx++) {
      const h = hash(qx - dx, qy - dy, 47);
      if (h % 173 !== 0) continue;
      const groot = (h >>> 8) % 3 === 0;
      const warm = (h >>> 12) % 3 === 0;
      const r = warm ? RAMP.zand : RAMP.steen;
      if (dy === 0 && dx === 0) return [r, warm ? 5 : 6];
      if (dy === 0 && dx === 1) return [r, warm ? 4 : 5];
      if (dy === 0 && dx === 2 && groot) return [r, warm ? 3 : 4];
      if (dy === 1 && dx === 1) return [RAMP.aarde, 2];
      if (dy === 1 && dx === 2 && groot) return [RAMP.aarde, 2];
      if (dy === 1 && dx === 0 && groot) return [r, warm ? 3 : 4];
    }
  }
  return null;
}

// Kasseien ('kinderkopjes'): ronde keien op een verspringend rooster met wat speling, als
// Voronoi-cellen. De voeg is overal ongeveer anderhalve pixel breed op het scherm. Elke kei is
// bol: linksboven een lichte rand, rechtsonder een donkere. Een kei ligt alleen op het plein als
// zijn midden erop ligt, dus de rand van het plein volgt de keien.
const KAS = 8.4; // afstand tussen keien in eenheden
function kasseiCel(X, Y) {
  const j0 = Math.floor(Y / (KAS * 0.87));
  let d1 = Infinity;
  let d2 = Infinity;
  let c1 = null;
  let c2 = null;
  for (let j = j0 - 1; j <= j0 + 1; j++) {
    const off = (j & 1) * 0.5;
    const i0 = Math.floor(X / KAS - off);
    for (let i = i0 - 1; i <= i0 + 1; i++) {
      const h = hash(i, j, 81);
      const cx = (i + off + 0.5 + ((h & 255) / 255 - 0.5) * 0.5) * KAS;
      const cy = (j + 0.5 + (((h >>> 8) & 255) / 255 - 0.5) * 0.45) * KAS * 0.87;
      const d = (X - cx) ** 2 + (Y - cy) ** 2;
      if (d < d1) {
        d2 = d1;
        c2 = c1;
        d1 = d;
        c1 = [cx, cy, h];
      } else if (d < d2) {
        d2 = d;
        c2 = [cx, cy, h];
      }
    }
  }
  // afstand tot de grens tussen de twee dichtste middens, en die afstand in schermpixels
  const ex = c2[0] - c1[0];
  const ey = c2[1] - c1[1];
  const el = Math.hypot(ex, ey);
  const grens = (d2 - d1) / (2 * el);
  const nx = ex / el;
  const ny = ey / el;
  const opScherm = Math.hypot((nx - ny) * SQ, (nx + ny) * 0.5 * SQ);
  return { cx: c1[0], cy: c1[1], h: c1[2], voegPx: grens * opScherm };
}

function kasseiPixel(X, Y, kaart, qx, qy, alleenSteen) {
  const c = kasseiCel(X, Y);
  const km = kaart.soort(c.cx / TEGEL, c.cy / TEGEL);
  const rand = km.s === KASSEI ? -km.d : -1;
  if (rand < 0 || (rand < 0.16 && c.h % 3 === 0)) return false;
  if (c.voegPx < 0.75) {
    if (alleenSteen) return false;
    const mos = ruis2(X * 0.045, Y * 0.045, 57) > 0.64;
    UIT.ramp = mos ? RAMP.mos : RAMP.aarde;
    UIT.stap = mos ? 2 : 1;
    return true;
  }
  const warm = (c.h >>> 16) % 5 === 0;
  UIT.ramp = warm ? RAMP.bot : RAMP.steen;
  let s = warm ? 4 : 5;
  const var_ = (c.h >>> 20) % 9;
  if (var_ === 0) s -= 1;
  else if (var_ === 1 && !warm) s += 1;
  // bol: de plek op het scherm ten opzichte van het midden van de kei. Een lichte rand
  // linksboven, een donkere rechtsonder, allebei langs de voeg.
  const dsx = (X - c.cx - (Y - c.cy)) * SQ;
  const dsy = (X - c.cx + (Y - c.cy)) * 0.5 * SQ;
  const r = KAS * 0.5;
  const hoog = (-dsx * 0.5 - dsy * 1.5) / r;
  if (hoog > 0.3 && c.voegPx < 2.2) s += 1;
  else if (hoog < -0.2 && c.voegPx < 1.8) s -= 1;
  if (hash(qx, qy, 59) % 41 === 0) s -= 1;
  UIT.stap = s;
  return true;
}

// ---------------------------------------------------------------- water

// Het water ligt lager dan het maaiveld. De grond is één vlak blok; waar water staat, zakt de
// kijkstraal vanaf het maaiveld door tot het wateroppervlak. Omdat de straal daarbij naar achteren
// schuift, komt hij bij de overkant tegen de oeverwand aan: precies wat je in het echt ziet, een
// strook aarde onder de graskant aan de overzijde en nergens een wand aan de kant van de kijker.
// fase (0..1) schuift de rimpels op: daarmee zijn later beeldjes van stromend water te maken.
const ZAK = VX / VZ; // eenheden die de straal opzij schuift per eenheid diepte (1,2247)

// Waar raakt de kijkstraal het water (of de oeverwand)? Geeft het trefpunt terug. Let op: bij
// water is t.k het gedeelde object uit soort(); gebruik dat meteen.
const TREF = { X: 0, Y: 0, Z: 0, water: true, boven: 0, diep: 0, vijver: null, k: null };
function waterTreffer(X, Y, k, kaart) {
  const diep = k.diep;
  const vijver = k.vijver;
  const dz = diep / PXH; // diepte in eenheden
  const ver = ZAK * dz; // zoveel schuift de straal naar achteren
  TREF.diep = diep;
  TREF.Z = -dz;
  // ligt het oppervlak recht onder deze pixel nog in het water?
  const kw = kaart.soort((X - ver) / TEGEL, (Y - ver) / TEGEL);
  if (kw.s === WATER) {
    TREF.X = X - ver;
    TREF.Y = Y - ver;
    TREF.water = true;
    TREF.vijver = kw.vijver;
    TREF.k = kw;
    return TREF;
  }
  // nee: de straal raakt de oeverwand. Zoek met halveren waar hij het water verlaat.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 9; i++) {
    const m = (lo + hi) / 2;
    const kk = kaart.soort((X - ver * m) / TEGEL, (Y - ver * m) / TEGEL);
    if (kk.s === WATER) lo = m;
    else hi = m;
  }
  TREF.X = X - ver * lo;
  TREF.Y = Y - ver * lo;
  TREF.Z = -dz * lo;
  TREF.water = false;
  TREF.boven = diep * (1 - lo);
  TREF.vijver = vijver;
  TREF.k = null;
  return TREF;
}

function waterGrond(X, Y, k, kaart, fase, schuim) {
  const t = waterTreffer(X, Y, k, kaart);
  if (t.water) waterPixel(t.X, t.Y, t.k, fase, schuim);
  else oeverPixel(t.X, t.Y, t.boven, t.diep, t.vijver);
}

// Het water ligt lager dan het maaiveld, maar de grond is één blok: zonder deze stap zou de
// diepte van het maaiveld gelden en zou het water alles verbergen wat eronder steekt (de boog van
// een brug, het rad van de molen). Deze stap zet plek en diepte van elke waterpixel op het echte
// trefpunt. Meteen na het tekenen van de grond aanroepen, vóór de gebouwen.
function waterDiepte(B, kaart, o = {}) {
  const grond = o.obj ?? 0;
  for (let i = 0; i < B.b * B.h; i++) {
    if (!(B.vlag[i] & VLAG.VLOER) || B.obj[i] !== grond) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    if (B.pos[i * 3 + 2] < -0.5) continue;
    const k = kaart.soort(X / TEGEL, Y / TEGEL);
    if (k.s !== WATER) continue;
    const t = waterTreffer(X, Y, k, kaart);
    B.pos[i * 3] = t.X;
    B.pos[i * 3 + 1] = t.Y;
    B.pos[i * 3 + 2] = t.Z;
    B.diep[i] = diepteVan(t.X, t.Y, t.Z);
    if (!t.water) {
      // de oeverwand kijkt naar de kijker toe
      B.nrm[i * 3] = SQ;
      B.nrm[i * 3 + 1] = SQ;
      B.nrm[i * 3 + 2] = 0;
    }
  }
}

// De oeverwand: onder de graszode een strook aarde met steentjes en wortels, onderaan nat en
// donker, met een lichte lijn op de waterlijn.
function oeverPixel(X, Y, boven, diep, vijver) {
  const qx = roosterX(X, Y);
  const qy = roosterY(X, Y);
  const b = Math.floor(boven + 1e-3); // pixels boven de waterlijn
  UIT.ramp = RAMP.aarde;
  let s = 3;
  if (b >= diep - 2) {
    UIT.ramp = RAMP.gras;
    s = b >= diep - 1 ? 3 : 2;
  } else if (b <= 1) s = 1;
  else if (b <= 3) s = 2;
  const h = hash(qx, qy, 191) % 23;
  if (h === 0) s -= 1;
  else if (h === 1) s += 1;
  else if (h === 2 && b > 2 && b < diep - 2) {
    UIT.ramp = RAMP.steen;
    s = 4;
  }
  if (!vijver && b === 2) s += 1; // de waterlijn licht op
  UIT.stap = s;
}

// Het wateroppervlak: donker in het diepe, lichter bij de kant waar de bodem doorschemert, met
// rimpels die met de stroom mee lopen, een enkele glinstering, waterlelies in de vijver en
// stenen met schuim in de beek.
function waterPixel(X, Y, k, fase, schuim) {
  const gx = X / TEGEL;
  const gy = Y / TEGEL;
  const qx = roosterX(X, Y);
  const qy = roosterY(X, Y);
  const diepte = -k.d; // hoe ver van de kant, in tegels
  UIT.ramp = RAMP.water;
  let s = diepte < 0.07 ? 5 : diepte < 0.16 ? 4 : diepte < 0.32 ? 3 : 2;
  // in het ondiepe schemert de bodem door
  if (diepte < 0.05 && hash(qx, qy, 209) % 3 === 0) {
    UIT.ramp = RAMP.aarde;
    UIT.stap = 4;
    return;
  }
  // schuim waar het rad het water slaat
  if (schuim) {
    for (const sm of schuim) {
      const a = Math.hypot(X - sm.x * TEGEL, Y - sm.y * TEGEL) / sm.r;
      if (a < 1) {
        const b = ruis2(gx * 9, gy * 9, 219) + (1 - a) * 0.7 + Math.sin((k.langs * 4 - fase * 3) * 6.28) * 0.15;
        if (b > 0.95) {
          UIT.ramp = RAMP.water;
          UIT.stap = 7;
          return;
        }
        if (b > 0.78) s += 2;
        else if (b > 0.66) s += 1;
      }
    }
  }
  // steen in de beek, met schuim eromheen
  if (!k.vijver) {
    const st = beekSteen(X, Y, diepte);
    if (st) {
      UIT.ramp = RAMP[st[0]];
      UIT.stap = st[1];
      return;
    }
  }
  // rimpels: langs de stroom (beek) of met de wind mee (vijver)
  const langs = k.vijver ? (gx + gy) * 1.5 : k.langs * 3.1 + k.dwars * 0.35;
  const golf = Math.sin((langs + fase) * 2 * Math.PI + ruis2(gx * 2.2, gy * 2.2, 193) * 4.2 + ruis2(gx * 6, gy * 6, 217) * 1.6);
  const golf2 = Math.sin((langs * 1.7 - fase * 1.3) * 2 * Math.PI + ruis2(gx * 5, gy * 5, 195) * 3);
  // de rimpels breken in streepjes, anders worden het vlaggen
  const streep = hash(qx >> 1, qy, 211) % 4 !== 0;
  if (golf > 0.88 && streep) s += 1;
  if (golf2 > 0.93 && hash(qx, qy >> 1, 213) % 3 !== 0) s += 1;
  if (golf < -0.9 && streep) s -= 1;
  // een enkele vonk in de golfkop, warm van de avondzon
  if (golf > 0.95 && golf2 > 0.5 && hash(qx, qy, 197) % 4 === 0) {
    UIT.ramp = hash(qx, qy, 199) % 3 === 0 ? RAMP.goud : RAMP.water;
    UIT.stap = UIT.ramp === RAMP.goud ? 6 : 7;
    UIT.vlag = VLAG.GLAD;
    return;
  }
  if (k.vijver) {
    const l = lelie(X, Y, diepte);
    if (l) {
      UIT.ramp = RAMP[l[0]];
      UIT.stap = l[1];
      return;
    }
  }
  UIT.stap = klem(s, 0, 7);
}

// Een steen in de beek: een platte ovaal met een lichte bovenrand en schuim aan de bovenstroomse
// kant.
function beekSteen(X, Y, diepte) {
  const cel = 26;
  const i0 = Math.floor(X / cel);
  const j0 = Math.floor(Y / cel);
  for (let j = j0 - 1; j <= j0 + 1; j++) {
    for (let i = i0 - 1; i <= i0 + 1; i++) {
      const h = hash(i, j, 201);
      if (h % 7 !== 0) continue;
      const cx = (i + 0.25 + ((h >>> 8) & 255) / 512) * cel;
      const cy = (j + 0.25 + ((h >>> 16) & 255) / 512) * cel;
      const r = 4 + (h >>> 4) % 4;
      const dx = X - cx;
      const dy = Y - cy;
      const e = Math.hypot(dx / r, dy / r);
      if (e > 1.8 || diepte < 0.14) continue;
      if (e < 1) {
        const dsy = (dx + dy) * 0.5 * SQ;
        return ['steen', dsy < -r * 0.25 ? 7 : dsy > r * 0.3 ? 4 : 6];
      }
      // schuim aan de bovenstroomse kant en in het kielzog
      if (e < 1.35 && hash(roosterX(X, Y), roosterY(X, Y), 203) % 3 !== 0) return ['water', 7];
      return null;
    }
  }
  return null;
}

// Een waterlelie: een rond blad met een inkeping, hier en daar met een bloem.
function lelie(X, Y, diepte) {
  const cel = 30;
  const i0 = Math.floor(X / cel);
  const j0 = Math.floor(Y / cel);
  for (let j = j0 - 1; j <= j0 + 1; j++) {
    for (let i = i0 - 1; i <= i0 + 1; i++) {
      const h = hash(i, j, 205);
      if (h % 3 !== 0) continue;
      const cx = (i + 0.2 + ((h >>> 8) & 255) / 400) * cel;
      const cy = (j + 0.2 + ((h >>> 16) & 255) / 400) * cel;
      if (diepte < 0.2) continue;
      const dx = X - cx;
      const dy = Y - cy;
      const r = 5.5 + (h >>> 4) % 3;
      const e = Math.hypot(dx, dy) / r;
      if (e > 1) continue;
      // de inkeping wijst naar de kijker toe
      const hoek = Math.atan2(dy + dx, dy - dx);
      if (e > 0.3 && Math.abs(hoek - 2.3) < 0.34) return null;
      const dsy = (dx + dy) * 0.5 * SQ;
      if ((h >>> 20) % 5 === 0 && e < 0.42) {
        // een bloem in het midden
        return e < 0.2 ? ['goud', 6] : ['pleister', e < 0.32 ? 6 : 5];
      }
      return ['blad', e > 0.82 ? 2 : dsy < -r * 0.2 ? 5 : dsy > r * 0.25 ? 3 : 4];
    }
  }
  return null;
}

// Een glinstering in het water (of waar ook): een sterretje van licht, na kwantiseren.
function glinstering(p, x, y, ramp = 'goud') {
  p.zet(x, y, ramp, 7);
  for (const [dx, dy, s] of [[-1, 0, 6], [1, 0, 6], [0, -1, 6], [0, 1, 6], [-2, 0, 5], [2, 0, 5], [0, -2, 5], [0, 2, 5], [-1, -1, 5], [1, 1, 5]]) p.zet(x + dx, y + dy, ramp, s);
}

// Textuur voor een stuk grond (een blok met de bovenkant op z = 0). De zijkanten tonen de
// doorsnede: een zode of een pad bovenaan, dan aarde met stenen en wortels.
// o.fase (0..1) schuift de rimpels in het water op.
function grondTex(kaart, o = {}) {
  const fase = o.fase || 0;
  // o.dor: de doffe, droge kleuren van het werkdorp (olijf gras, modderwegen)
  const dor = o.dor || false;
  return (vlak, X, Y, Z) => {
    if (vlak !== 'z') {
      grondZijkant(vlak, X, Y, Z, kaart);
      return;
    }
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const qx = roosterX(X, Y);
    const qy = roosterY(X, Y);
    const k = kaart.soort(gx, gy);
    if (k.s === WATER) {
      waterGrond(X, Y, k, kaart, fase, o.schuim);
      return;
    }
    if (k.s === KASSEI || (k.d > -0.02 && k.d < 0.25 && kaart.pleinen.length)) {
      const s = k.s;
      const d = k.d;
      const rand = k.rand;
      const dwars = k.dwars;
      if (kasseiPixel(X, Y, kaart, qx, qy, s !== KASSEI)) return;
      // geen steen: dan de ondergrond, aarde tussen de stenen of het gras
      if (s === KASSEI) {
        UIT.ramp = RAMP.aarde;
        UIT.stap = 3 + (hash(qx, qy, 61) % 4 === 0 ? -1 : 0);
        return;
      }
      if (s === PAD) padPixel(gx, gy, qx, qy, { dwars, d }, kaart, dor);
      else grasPixel(gx, gy, qx, qy, rand, dor);
      return;
    }
    if (k.s === AKKER) akkerPixel(qx, qy, k);
    else if (k.s === PAD) padPixel(gx, gy, qx, qy, k, kaart, dor);
    else grasPixel(gx, gy, qx, qy, k.rand, dor);
  };
}

// ---------------------------------------------------------------- pollen en bloemen

// Grote graspollen en bloemen, na alle vormen en modellen getekend: een pol wortelt op een
// zichtbare grondpixel en groeit omhoog over alles wat erachter ligt, dus ook over de rand van
// een pad, tussen kasseien en tegen de voet van een muur. De sprieten krijgen de plek en de
// normaal van hun wortel, zodat licht en schaduw ze als grond behandelen.
// o.dicht: hoe vaak een pol (1 = gewoon), o.bloemen: hoe vaak een bloem.
// Een kool, in pixels rond de wortel: [dx, dy, stap in 'blad'].
const KOOL = [
  [-2, 0, 2], [-1, 0, 2], [0, 0, 2], [1, 0, 2], [2, 0, 2],
  [-3, -1, 3], [-2, -1, 4], [-1, -1, 4], [0, -1, 3], [1, -1, 4], [2, -1, 3], [3, -1, 2],
  [-3, -2, 4], [-2, -2, 5], [-1, -2, 6], [0, -2, 5], [1, -2, 4], [2, -2, 4], [3, -2, 3],
  [-2, -3, 5], [-1, -3, 6], [0, -3, 6], [1, -3, 5], [2, -3, 4],
  [-1, -4, 5], [0, -4, 5], [1, -4, 4],
];
const BLOEMKLEUR = [
  ['pleister', 6, 4],
  ['goud', 6, 4],
  ['rood', 6, 4],
  ['magie', 5, 3],
  ['goud', 5, 3],
];
function grasPollen(B, kaart, o = {}) {
  const dicht = o.dicht ?? 1;
  const bloemen = o.bloemen ?? 1;
  const grond = o.obj ?? 0;
  const wortels = [];
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      if (!(B.vlag[i] & VLAG.VLOER) || B.obj[i] !== grond || B.pos[i * 3 + 2] < -0.5) continue;
      const X = B.pos[i * 3];
      const Y = B.pos[i * 3 + 1];
      const qx = roosterX(X, Y);
      const qy = roosterY(X, Y);
      const h = hash(qx, qy, 91);
      const gx = X / TEGEL;
      const gy = Y / TEGEL;
      const k = kaart.soort(gx, gy);
      const klont = ruis2(gx * 2.2, gy * 2.2, 93);
      let kans;
      if (k.s === AKKER) {
        // een plant midden op de rug, om de zoveel tegel
        const a = k.akker;
        const rij = Math.floor(k.dwars);
        const langs = a.langs === 'y' ? gy - a.y0 : gx - a.x0;
        const p = Math.floor(langs / AKKER_PLANT);
        const c1 = (a.langs === 'y' ? a.y0 : a.x0) + (p + 0.5) * AKKER_PLANT;
        const c2 = (a.langs === 'y' ? a.x0 : a.y0) + (rij + 0.52) * AKKER_RIJ;
        const [cx, cy] = a.langs === 'y' ? [c2, c1] : [c1, c2];
        if (qx === roosterX(cx * TEGEL, cy * TEGEL) && qy === roosterY(cx * TEGEL, cy * TEGEL) && k.d < -0.08) {
          wortels.push([px, py, i, h, a.soort === 'bloemen' ? 5 : 2 + (rij % 2), k.s]);
        }
        continue;
      }
      if (k.s === WATER) {
        // riet in het ondiepe water langs de kant
        const plek = ruis2(gx * 1.6, gy * 1.6, 215);
        if (-k.d < 0.13 && plek > 0.6 && (h % 100000) / 100000 < 1 / 7) wortels.push([px, py, i, h, 4, k.s]);
        continue;
      }
      if (k.s === GRAS && k.randS === WATER && k.rand < 0.3) {
        // riet en lisdodden op de oever
        const plek = ruis2(gx * 1.6, gy * 1.6, 215);
        const r = (h % 100000) / 100000;
        if (plek > 0.5 && r < (k.rand < 0.14 ? 1 / 5 : 1 / 16) * dicht) wortels.push([px, py, i, h, 4, k.s]);
        else if (r < 1 / 12) wortels.push([px, py, i, h, 0, k.s]); // gewoon gras aan de kant
        continue;
      }
      if (k.s === GRAS) kans = (k.rand < 0.1 ? 1 / 9 : klont > 0.62 ? 1 / 24 : 1 / 70) * dicht;
      else if (k.s === PAD) kans = (Math.abs(k.dwars) < 0.22 ? 1 / 55 : k.d > -0.06 ? 1 / 14 : 1 / 900) * dicht;
      else kans = (k.d > -0.12 ? 1 / 16 : k.d > -0.4 ? 1 / 150 : 0) * dicht;
      const bloemKans = k.s === GRAS && k.rand > 0.15 ? (ruis2(gx * 1.3, gy * 1.3, 95) > 0.66 ? 1 / 60 : 1 / 3000) * bloemen : 0;
      const r = (h % 100000) / 100000;
      if (r < kans) wortels.push([px, py, i, h, 0, k.s]);
      else if (r < kans + bloemKans) wortels.push([px, py, i, h, 1, k.s]);
    }
  }
  const zet = (x, y, wortel, ramp, stap) => {
    if (x < 0 || y < 0 || x >= B.b || y >= B.h) return;
    const j = y * B.b + x;
    if (j !== wortel && B.diep[j] > B.diep[wortel] + 0.01) return;
    if (B.vlag[j] & VLAG.GLOEI) return;
    B.ramp[j] = RAMP[ramp];
    B.stap[j] = stap;
    B.vlag[j] = VLAG.VLOER | VLAG.GLAD;
    B.obj[j] = grond;
    B.deel[j] = -1;
    B.diep[j] = B.diep[wortel];
    for (let a = 0; a < 3; a++) {
      B.pos[j * 3 + a] = B.pos[wortel * 3 + a];
      B.nrm[j * 3 + a] = B.nrm[wortel * 3 + a];
    }
  };
  for (const [px, py, i, h, soortW, ondergrond] of wortels) {
    if (soortW === 2) {
      // een kool: een ronde krop van blad, licht bovenop, met een donkere onderkant
      for (const [dx, dy, s] of KOOL) zet(px + dx, py + dy, i, 'blad', s + ((h >>> 3) % 3 === 0 ? -1 : 0));
      continue;
    }
    if (soortW === 5) {
      // een bloeiende plant in een bloembed: een bosje blad met drie of vier bloemen erboven
      const [kl, licht, donker] = BLOEMKLEUR[(h >>> 7) % BLOEMKLEUR.length];
      for (const [dx, dy] of [[-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [-1, -1], [0, -1], [1, -1]]) zet(px + dx, py + dy, i, 'blad', dy === 0 ? 3 : 4);
      for (let t = 0; t < 3 + ((h >>> 11) % 2); t++) {
        const hs = hash(h, t, 221);
        const dx = (hs % 5) - 2;
        const dy = -2 - ((hs >>> 3) % 3);
        zet(px + dx, py + dy, i, kl, licht);
        if ((hs >>> 6) % 2 === 0) zet(px + dx + 1, py + dy, i, kl, donker);
      }
      continue;
    }
    if (soortW === 4) {
      // riet: drie tot vijf rechte stengels met een lichte punt, en soms een bruine lisdodde
      const n = 2 + ((h >>> 5) % 3);
      for (let t = 0; t < n; t++) {
        const hs = hash(h, t, 207);
        const dx = (t - Math.floor(n / 2)) + (hs % 2);
        const hoog = 7 + (hs >>> 3) % 7;
        const neig = hs % 3 === 0 ? 1 : 0;
        const droog = hs % 5 === 0;
        for (let j = 0; j <= hoog; j++) {
          const x = px + dx + (j > hoog * 0.6 ? neig : 0);
          const top = j >= hoog - 1;
          zet(x, py - j, i, droog ? 'riet' : 'gras', droog ? (top ? 5 : 3) : top ? 6 : 4);
        }
        if ((hs >>> 6) % 7 === 0) {
          // de bruine kolf
          const x = px + dx + neig;
          for (let j = hoog - 4; j <= hoog; j++) zet(x, py - j, i, 'hout', j === hoog ? 4 : 3);
        }
      }
      continue;
    }
    if (soortW === 3) {
      // prei: drie rechte stengels, wit onderaan, groen met een lichte punt
      for (const dx of [-1, 1, 3]) {
        const hoog = 5 + ((h >>> (dx + 4)) % 3);
        for (let t = 0; t <= hoog; t++) {
          const top = t >= hoog - 1;
          if (t < 2) zet(px + dx, py - t, i, 'perkament', 4);
          else zet(px + dx + (t > hoog - 2 && dx > 0 ? 1 : 0), py - t, i, 'blad', top ? 6 : 4);
        }
      }
      continue;
    }
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const toon = grasToon(X / TEGEL, Y / TEGEL);
    const basis = ondergrond === GRAS ? (toon === 3 ? 3 : 4) : 4;
    if (soortW === 1) {
      // een bloem: steeltje van een of twee pixels, een bloempje, soms een tweede ernaast
      const [kl, licht, donker] = BLOEMKLEUR[(h >>> 5) % BLOEMKLEUR.length];
      const hoog = 1 + ((h >>> 9) % 2);
      zet(px, py, i, 'gras', basis - 1);
      for (let s = 1; s <= hoog; s++) zet(px, py - s, i, 'gras', basis);
      zet(px, py - hoog - 1, i, kl, licht);
      if ((h >>> 11) % 3 === 0) {
        zet(px + 1, py - hoog - 1, i, kl, donker);
        zet(px, py - hoog - 2, i, kl, licht);
      }
      if ((h >>> 13) % 2 === 0) {
        zet(px + 2, py - 1, i, 'gras', basis);
        zet(px + 2, py - 2, i, kl, licht);
      }
      continue;
    }
    // een pol: twee tot vier sprieten die uit één voet waaieren
    const n = 2 + ((h >>> 5) % 3);
    zet(px, py, i, 'gras', basis - 1);
    zet(px + 1, py, i, 'gras', basis - 1);
    for (let s = 0; s < n; s++) {
      const hs = hash(h, s, 97);
      const dx = s - Math.floor(n / 2) + (n % 2 ? 0 : (hs % 2));
      const hoog = 2 + (hs >>> 3) % 3 + (ondergrond === GRAS && (h >>> 12) % 5 === 0 ? 1 : 0);
      const neig = dx < 0 ? -1 : dx > 0 ? 1 : 0;
      for (let t = 1; t <= hoog; t++) {
        const x = px + dx + (t > hoog / 2 ? neig : 0);
        const top = t === hoog;
        zet(x, py - t, i, 'gras', top ? basis + 2 : t === 1 ? basis : basis + 1);
      }
    }
  }
}

function grondZijkant(vlak, X, Y, Z, kaart) {
  const u = vlak === 'y' ? X * SQ : vlak === 'x' ? -Y * SQ : 0;
  const diep = -Z * PXH; // pixels onder het maaiveld
  const ui = Math.floor(u + 1e-3);
  const di = Math.floor(diep + 1e-3);
  const k = kaart.soort(X / TEGEL, Y / TEGEL);
  const basis = vlak === 'y' ? 0 : -1;
  UIT.ramp = RAMP.aarde;
  // bovenlaag
  const zode = 3 + (hash(ui, 5, 71) % 3 === 0 ? 1 : 0);
  if (di < zode) {
    if (k.s === GRAS) {
      UIT.ramp = RAMP.gras;
      UIT.stap = (di === 0 ? 4 : di === 1 ? 3 : 2) + basis;
    } else if (k.s === KASSEI) {
      UIT.ramp = RAMP.steen;
      UIT.stap = (di === 0 ? 6 : 4) + basis - (Math.floor(u / 7) % 2 && di > 1 ? 1 : 0);
    } else {
      UIT.stap = (di === 0 ? 5 : 4) + basis;
    }
    return;
  }
  // wortels onder de zode
  if (k.s === GRAS && di < zode + 4 && hash(ui, di, 73) % 5 === 0) {
    UIT.ramp = RAMP.gras;
    UIT.stap = 1 + basis;
    return;
  }
  let s = (di < 12 ? 3 : di < 22 ? 2.5 : 2) + basis;
  // lagen: een lichtere zandlaag
  const laag = di - 14 - Math.round(Math.sin(u * 0.09) * 1.5);
  if (laag >= 0 && laag < 3) s += 1;
  // stenen in de aarde
  const cel = Math.floor(u / 9);
  const hc = hash(cel, Math.floor(di / 7), 75);
  if (hc % 3 === 0) {
    const cu = cel * 9 + 2 + (hc >>> 4) % 5;
    const cd = Math.floor(di / 7) * 7 + 2 + (hc >>> 8) % 3;
    const ru = 2 + (hc >>> 12) % 2;
    const e = ((u - cu) / ru) ** 2 + ((diep - cd) / 1.6) ** 2;
    if (e < 1) {
      UIT.ramp = RAMP.steen;
      UIT.stap = (diep - cd < -0.4 ? 5 : 3) + basis;
      return;
    }
  }
  if (hash(ui, di, 77) % 17 === 0) s -= 1;
  UIT.stap = s;
}

// ---------------------------------------------------------------- muren: vakwerk en veldsteen

// Diepte van een wereldpunt zoals het beeld die bijhoudt (groter = dichter bij de camera)
const diepteVan = (X, Y, Z) => -(X * VX + Y * VY + Z * VZ);

// Balken van een vakwerkwand, in wandpixels (u van links naar rechts, h omhoog). Stijlen op de
// hoeken en naast elke opening, regels onder en boven de ramen, een borstwering waar geen raam
// zit, en schoren in de lege vakken. In de gevel een makelaar, een hanenbalk en twee schoren.
function vakwerkBalken(W, H, sokkel, elementen, gevel) {
  const rechthoeken = [];
  const schuin = [];
  const B = 5;
  const rh = (u0, u1, h0, h1) => rechthoeken.push([u0, u1, h0, h1]);
  // Een gebogen schoor, zoals een timmerman hem uit een kromme tak zaagde: het midden wijkt
  // loodrecht uit. Vier rechte stukjes zijn genoeg; inBalk() toetst toch per stukje.
  const kromme = (a, b, k) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const cx = (a[0] + b[0]) / 2 - (dy / l) * k;
    const cy = (a[1] + b[1]) / 2 + (dx / l) * k;
    const punt = (t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * cx + t * t * b[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1]];
    let vorig = a;
    for (let i = 1; i <= 4; i++) {
      const q = punt(i / 4);
      schuin.push([vorig, q]);
      vorig = q;
    }
  };
  rh(0, W, sokkel, sokkel + B); // onderdorpel
  rh(0, W, H - B, H); // bovenregel
  // stijlen: de hoeken en de kanten van elke opening
  let stijlen = [[0, B], [W - B, W]];
  for (const el of elementen) {
    if (el.soort !== 'deur' && el.soort !== 'raam' && el.soort !== 'open') continue;
    stijlen.push([el.u - B + 1, el.u]);
    stijlen.push([el.u + el.b, el.u + el.b + B - 1]);
  }
  stijlen.sort((a, b) => a[0] - b[0]);
  // samenvoegen wat bijna raakt
  const samen = [];
  for (const s of stijlen) {
    const l = samen[samen.length - 1];
    if (l && s[0] <= l[1] + 3) l[1] = Math.max(l[1], s[1]);
    else samen.push([...s]);
  }
  // tussenstijlen in te brede vakken
  const alle = [];
  for (let i = 0; i < samen.length; i++) {
    alle.push(samen[i]);
    const volgende = samen[i + 1];
    if (!volgende) continue;
    const vak = volgende[0] - samen[i][1];
    if (vak > 30) {
      const n = Math.round(vak / 22);
      for (let k = 1; k < n; k++) {
        const m = Math.round(samen[i][1] + (vak * k) / n - B / 2);
        alle.push([m, m + B - 1]);
      }
    }
  }
  for (const [a, b] of alle) rh(a, b, sokkel + B, H - B);
  // vakken tussen de stijlen: regels bij ramen, borstwering en schoren elders
  const borst = Math.round(sokkel + (H - sokkel) * 0.42);
  for (let i = 0; i + 1 < alle.length; i++) {
    const v0 = alle[i][1];
    const v1 = alle[i + 1][0];
    if (v1 - v0 < 3) continue;
    const el = elementen.find((e) => (e.soort === 'raam' || e.soort === 'deur' || e.soort === 'open') && e.u >= v0 - 1 && e.u + e.b <= v1 + 1);
    if (el && el.soort === 'raam') {
      rh(v0, v1, el.h - B + 1, el.h);
      rh(v0, v1, el.h + el.hoog, el.h + el.hoog + B - 1);
      continue;
    }
    if (el) {
      rh(v0, v1, el.h + el.hoog, el.h + el.hoog + B - 1); // latei boven de deur
      continue;
    }
    rh(v0, v1, borst, borst + B - 1);
    // een schoor in het vak onder de borstwering en een erboven, om en om
    const links = i % 2 === 0;
    if (v1 - v0 >= 10) {
      const k = (v1 - v0) * 0.3;
      if (links) {
        kromme([v0, sokkel + B], [v1, borst], k);
        kromme([v0, borst + B - 1], [v1, H - B], k);
      } else {
        kromme([v1, sokkel + B], [v0, borst], k);
        kromme([v1, borst + B - 1], [v0, H - B], k);
      }
    }
  }
  if (gevel) {
    // de driehoek boven de bovenregel: makelaar in het midden, hanenbalk, twee schoren
    const m = W / 2;
    const top = gevel.top;
    rh(Math.round(m - B / 2), Math.round(m + B / 2), H, top);
    const hb = Math.round(H + (top - H) * 0.42);
    rh(0, W, hb, hb + B - 1);
    const kg = W * 0.09;
    kromme([m - B / 2, H], [m - (W / 2) * 0.55, hb], -kg);
    kromme([m + B / 2, H], [m + (W / 2) * 0.55, hb], kg);
    kromme([m - B / 2, hb + B - 1], [m - (W / 2) * 0.3, hb + (top - hb) * 0.55], -kg * 0.6);
    kromme([m + B / 2, hb + B - 1], [m + (W / 2) * 0.3, hb + (top - hb) * 0.55], kg * 0.6);
  }
  return { rechthoeken, schuin, B };
}

// Is (u, h) hout? Geeft 0 (nee), 1 (rechte balk) of 2 (schoor).
function inBalk(balken, u, h) {
  for (const [u0, u1, h0, h1] of balken.rechthoeken) if (u >= u0 && u < u1 && h >= h0 && h < h1) return 1;
  for (const [a, b] of balken.schuin) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy);
    const t = ((u - a[0]) * dx + (h - a[1]) * dy) / (l * l);
    if (t < 0 || t > 1) continue;
    const afst = Math.abs((u - a[0]) * dy - (h - a[1]) * dx) / l;
    if (afst < 2.2) return 2;
  }
  return 0;
}

// Ruwe planken: staande delen van wisselende breedte met een kier ertussen, kwasten, spijkers
// op de regels en groene aanslag onderaan. o.hout: 'schors' voor verweerd grijs, 'hout' voor
// warmer bruin. Zo ziet een schuurwand eruit, en de helft van de huizen in een werkdorp.
function plankPixel(u, h, W, basis, zaad, o = {}) {
  const ramp = RAMP[o.hout || 'hout'];
  UIT.ramp = ramp;
  // elke plank 7 tot 11 pixels breed, met een verspringende naad
  const kol = Math.floor(u / 9);
  const jit = ((hash(kol, 3, zaad) % 5) - 2) * 0.5;
  const rand = u - (kol * 9 + jit);
  const n = hash(kol, 7, zaad + 5);
  let s = basis - 0.6 + (n % 3 === 0 ? 0.7 : n % 3 === 1 ? -0.5 : 0);
  if (rand < 1) s -= 2.4; // de kier
  else if (rand < 2) s += 0.5; // de belichte kant van de volgende plank
  // nerf over de hele plank, en af en toe een kwast
  if (hash(kol, Math.floor(h / 5), zaad + 9) % 4 === 0) s -= 0.4;
  const kwast = hash(kol, Math.floor(h / 13), zaad + 11);
  if (kwast % 9 === 0 && Math.abs(rand - 4.5) < 1.4 && Math.floor(h) % 13 < 2) s -= 1.6;
  // spijkers op de regels
  if ((Math.abs(h - 10) < 0.6 || Math.abs(h - 62) < 0.6) && Math.abs(rand - 4.5) < 0.6) {
    UIT.ramp = RAMP.ijzer;
    UIT.stap = 3;
    return;
  }
  // aanslag onderaan en een enkele scheve plank die licht doorlaat
  if (h < 16 && hash(Math.floor(u), Math.floor(h), zaad + 13) % 6 === 0) {
    UIT.ramp = RAMP.mos;
    UIT.stap = 2;
    return;
  }
  UIT.stap = Math.round(s);
}

// Pleister met vakwerk. Het hout steekt een pixel uit: een lichte rand linksboven, en op het
// pleister rechtsonder van elke balk een pixel schaduw.
function vakwerkPixel(u, h, balken, basis, zaad, o = {}) {
  const b = inBalk(balken, u, h);
  if (b) {
    UIT.ramp = RAMP.hout;
    let s = basis - 2.6;
    if (!inBalk(balken, u - 1, h) || !inBalk(balken, u, h + 1)) s += 1;
    else if (!inBalk(balken, u + 1, h) || !inBalk(balken, u, h - 1)) s -= 0.6;
    // nerf en kwasten
    const n = hash(Math.floor(u / 3), Math.floor(h / 9), zaad + 5);
    if (b === 1 && n % 5 === 0 && (Math.floor(u) + Math.floor(h)) % 3 === 0) s -= 0.6;
    UIT.stap = Math.round(s);
    return;
  }
  // Het vak tussen de balken: vlechtwerk (o.vlecht) of pleister. Vuil pleister (o.pleister)
  // staat op een doffere ramp, zoals een huis dat al twintig jaar niet gewit is.
  if (o.vlecht) {
    vlechtPixel(u, h, basis, zaad, o.hout);
    return;
  }
  UIT.ramp = o.pleister ?? RAMP.pleister;
  let s = basis + (o.pleister ? 1 : 0);
  if (inBalk(balken, u - 1, h + 1) || inBalk(balken, u, h + 1)) s -= 1; // schaduw van de balk
  // vlekken, spatwerk onderaan, een enkel scheurtje
  const vlek = ruis2(u * 0.09, h * 0.09, zaad);
  if (vlek > 0.8) s -= 1;
  if (o.pleister) {
    // grauw uitgeslagen: grotere vlekken en een groene aanslag onderaan
    if (vlek > 0.66) s -= 1;
    if (ruis2(u * 0.22, h * 0.22, zaad + 3) > 0.74) s -= 1;
    if (h < 22 && hash(Math.floor(u), Math.floor(h), zaad + 13) % 7 === 0) {
      UIT.ramp = RAMP.mos;
      UIT.stap = 2;
      return;
    }
  }
  if (h < 26 && hash(Math.floor(u), Math.floor(h), zaad + 9) % 5 === 0) s -= 1;
  else if (hash(Math.floor(u), Math.floor(h), zaad + 11) % 97 === 0) s -= 1;
  UIT.stap = s;
}

// Vlechtwerk: gevlochten twijgen tussen de staanders. Liggende tenen van drie pixels hoog die om
// de andere rij voor of achter een staander langs lopen, met leem in de kieren.
function vlechtPixel(u, h, basis, zaad, hout) {
  const rij = Math.floor(h / 3);
  const kol = Math.floor((u + (rij % 2) * 2.5) / 5);
  const fh = h - rij * 3;
  const fu = ((u + (rij % 2) * 2.5) % 5 + 5) % 5;
  const voor = (kol + rij) % 2 === 0;
  UIT.ramp = RAMP[hout || 'schors'];
  let s = basis - 0.8 + (voor ? 1 : -0.6);
  if (fh < 0.7) s -= 1.4; // de kier tussen twee tenen
  if (fu < 0.8 && !voor) s -= 0.8;
  const n = hash(kol, rij, zaad + 17);
  if (n % 5 === 0) s -= 0.5;
  if (n % 7 === 0) {
    // leem dat uit de vlecht is gevallen
    UIT.ramp = RAMP.zand;
    s = basis - 0.5 + (fh < 1 ? -1 : 0);
  }
  UIT.stap = Math.round(s);
}

// Veldsteen: rijen van wisselende hoogte, stenen van wisselende lengte, diepe donkere voegen,
// afgebrokkelde hoeken. Een op de vijf stenen is warmer van kleur. Op de hoeken van het huis
// grote hoekstenen, om en om lang en kort.
const rijCache = new Map();
function steenRijen(zaad) {
  let r = rijCache.get(zaad);
  if (!r) {
    r = [0];
    let h = 0;
    for (let i = 0; h < 600; i++) {
      h += 8 + (hash(i, zaad, 101) % 4);
      r.push(h);
    }
    rijCache.set(zaad, r);
  }
  return r;
}
function veldsteenPixel(u, h, W, basis, zaad, hoeken = true) {
  const rijen = steenRijen(zaad);
  let rij = 0;
  while (rijen[rij + 1] <= h) rij++;
  const h0 = rijen[rij];
  const rh = rijen[rij + 1] - h0;
  const dh = Math.floor(h - h0);
  const ui = Math.floor(u);
  // hoekstenen: om en om lang en kort, aan beide kanten van de wand
  const lang = rij % 2 === 0;
  const hoekB = lang ? 15 : 9;
  const inHoek = hoeken && (ui < hoekB || ui >= W - (lang ? 9 : 15));
  let s0;
  let s1;
  let hs;
  if (inHoek) {
    s0 = ui < hoekB ? 0 : W - (lang ? 9 : 15);
    s1 = ui < hoekB ? hoekB : W;
    hs = hash(rij, s0 > 0 ? 1 : 0, zaad + 3);
  } else {
    // stenen in deze rij: lengtes van 9 tot 20
    let a = -((hash(rij, zaad, 103) % 13) + 2);
    let k = 0;
    while (true) {
      const l = 9 + (hash(rij, k, zaad + 105) % 12);
      if (a + l > ui) break;
      a += l;
      k++;
    }
    s0 = a;
    s1 = a + 9 + (hash(rij, k, zaad + 105) % 12);
    if (hoeken) {
      s0 = Math.max(s0, lang ? 15 : 9);
      s1 = Math.min(s1, W - (lang ? 9 : 15));
    }
    hs = hash(rij, k, zaad + 107);
  }
  const du = ui - s0;
  const lenS = s1 - s0;
  // Grijs met een koele zweem; de warme en de donkerblauwe stenen zijn de uitzondering.
  const off = 0;
  UIT.ramp = RAMP.veldsteen;
  // voegen
  if (dh === rh - 1 || du === lenS - 1) {
    UIT.stap = basis - 3 + off;
    return;
  }
  // afgebrokkelde hoeken
  const hoekje = (du === 0 || du === lenS - 2) && (dh === 0 || dh === rh - 2);
  if (hoekje && hs % 3 !== 0) {
    UIT.stap = basis - 3 + off;
    return;
  }
  const warm = !inHoek && hs % 7 === 0;
  const koel = !warm && hs % 11 === 0; // een enkele steen trekt naar blauw
  if (warm) UIT.ramp = RAMP.bot;
  else if (koel) UIT.ramp = RAMP.pet;
  let s = basis + (koel ? 1.2 : 0) + (inHoek ? 0.6 : 0) + (hs % 7 === 0 ? -1 : hs % 7 === 1 ? 0.6 : 0) - (warm ? 1 : 0);
  if (dh === rh - 2) s += 1; // bovenrand in het licht
  else if (dh === 0) s -= 1; // onderrand
  if (du === 0) s += 0.5;
  else if (du === lenS - 2) s -= 0.5;
  const p = hash(ui, Math.floor(h), zaad + 109);
  if (p % 29 === 0) s -= 1;
  UIT.stap = Math.round(s);
}

// Een blokhut: liggende stammen van zes pixels hoog, rond van boven en donker in de naad, met
// op de hoeken de kopse einden die uitsteken.
function blokhutPixel(u, h, W, basis, zaad, o = {}) {
  const rij = Math.floor(h / 6);
  const f = h - rij * 6;
  const kop = u < 7 || u > W - 8; // de uitstekende kopse einden
  UIT.ramp = RAMP[o.hout || 'hout'];
  let s = basis - 1;
  if (f < 0.9) s = basis - 3.4; // de naad tussen twee stammen
  else if (f < 2) s = basis - 0.4;
  else if (f < 4) s = basis + 0.6;
  else s = basis - 1.4;
  const hs = hash(rij, Math.floor(u / 9), zaad);
  s += (hs % 5 === 0 ? -0.6 : hs % 7 === 0 ? 0.5 : 0);
  if (kop) {
    // het kopse hout: jaarringen om het hart
    const cu = u < 7 ? 3.5 : W - 4.5;
    const r = Math.hypot((u - cu) * 0.9, f - 3);
    s = basis + (Math.sin(r * 2.2) > 0.3 ? -0.8 : 0.4);
    if (r > 3.2) s = basis - 3.4;
    UIT.stap = Math.round(s);
    return;
  }
  // mos in de naden aan de schaduwkant, en wat nerf
  if (f < 1.4 && ruis2(u * 0.09, rij * 0.7, zaad + 3) > 0.66) {
    UIT.ramp = RAMP.mos;
    UIT.stap = 2;
    return;
  }
  if (hash(Math.floor(u), rij, zaad + 5) % 17 === 0) s -= 0.6;
  UIT.stap = Math.round(s);
}

// ---------------------------------------------------------------- deuren en ramen

// Een deur van verticale planken met twee hengsels en een klink, in een donkere dagkant. o.ramp
// verft de deur (anders naturel hout), o.half zet de bovendeur open: dan zie je binnen het
// warme licht. o.raampje: een ruitje in de deur.
function deurElement(o) {
  const el = { soort: 'deur', u: o.u, b: o.b ?? 20, h: o.h ?? 0, hoog: o.hoog ?? 60, ...o };
  el.teken = (u, h, basis) => {
    const du = u - el.u;
    const dh = h - el.h;
    if (du < 0 || du >= el.b || dh < 0 || dh >= el.hoog) return false;
    const dui = Math.floor(du);
    const dhi = Math.floor(dh);
    // dagkant: links en boven in de schaduw van de muur
    if (dui < 2 || dhi >= el.hoog - 2) {
      UIT.ramp = el.dagRamp ?? RAMP.steen;
      UIT.stap = (el.dagStap ?? basis - 2.5) + (dui === 0 || dhi === el.hoog - 1 ? -1 : 0);
      UIT.stap = Math.round(UIT.stap);
      return true;
    }
    // open bovendeur: binnen brandt het haardvuur. De bovendeur staat naar binnen open (een
    // donkere strook rechts), bovenin een balk, en onderin de rugleuning van een stoel.
    if (el.half && dh > el.hoog * 0.52) {
      const onder = Math.floor(el.hoog * 0.52) + 1;
      const y = dhi - onder; // 0 onderaan de opening
      const hoogte = el.hoog - 2 - onder;
      UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
      if (dui >= el.b - 4) {
        UIT.ramp = RAMP.hout;
        UIT.stap = dui === el.b - 4 ? 2 : 1;
        UIT.vlag = VLAG.VAST;
        return true;
      }
      if (y >= hoogte - 3) {
        UIT.ramp = RAMP.hout;
        UIT.stap = y === hoogte - 3 ? 2 : 1;
        UIT.vlag = VLAG.VAST;
        return true;
      }
      // stoel: een rugleuning met twee spijlen
      const su = dui - 5;
      if (y < 7 && su >= 0 && su < 6 && (su === 0 || su === 5 || y === 6 || (y === 3 && su > 0))) {
        UIT.ramp = RAMP.hout;
        UIT.stap = 1;
        UIT.vlag = VLAG.VAST;
        return true;
      }
      // het licht: naar het midden en naar onder toe feller
      const cu = (dui - (el.b - 4) / 2) / (el.b / 2);
      const cy = y / hoogte;
      const gloed = 1 - Math.hypot(cu * 0.9, (cy - 0.25) * 1.3);
      UIT.ramp = RAMP.goud;
      UIT.stap = gloed > 0.62 ? 6 : gloed > 0.35 ? 5 : gloed > 0.1 ? 4 : 3;
      return true;
    }
    const lu = dui - 2;
    const plank = Math.floor(lu / 4);
    const inPlank = lu - plank * 4;
    const ramp = el.ramp ? RAMP[el.ramp] : RAMP.hout;
    UIT.ramp = ramp;
    let s = (el.ramp ? basis - 0.5 : basis - 1.2) + (plank % 2 ? -0.4 : 0.2);
    if (inPlank === 0) s = (el.ramp ? basis - 2.5 : basis - 3);
    else if (inPlank === 1) s += 0.8;
    if (hash(dui, Math.floor(dh / 5), 121) % 7 === 0) s -= 0.7;
    // de onderkant van de bovendeur (een staldeur)
    if (el.half !== undefined && Math.abs(dh - el.hoog * 0.52) < 1) s = basis - 3;
    // hengsels
    for (const hb of [9, el.hoog - 14]) {
      if (dhi >= hb && dhi < hb + 2 && dui < el.b - 5) {
        UIT.ramp = RAMP.ijzer;
        s = dhi === hb + 1 ? 2 : 3.4;
        if (dui % 5 === 3) s = 5;
      }
    }
    // klink
    if (dui >= el.b - 5 && dui < el.b - 3 && dhi >= Math.round(el.hoog * 0.45) && dhi < Math.round(el.hoog * 0.45) + 3) {
      UIT.ramp = RAMP.ijzer;
      s = dhi === Math.round(el.hoog * 0.45) + 2 ? 5.5 : 3.5;
    }
    // ruitje
    if (el.raampje && dui >= 6 && dui < el.b - 4 && dhi >= el.hoog - 18 && dhi < el.hoog - 8) {
      const rand = dui === 6 || dui === el.b - 5 || dhi === el.hoog - 18 || dhi === el.hoog - 9 || dui === Math.floor((el.b + 2) / 2);
      if (!rand) {
        UIT.ramp = RAMP.goud;
        UIT.stap = dhi > el.hoog - 13 ? 5 : 4;
        UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
        return true;
      }
      UIT.ramp = ramp;
      s = basis - 2.4;
    }
    UIT.stap = Math.round(s);
    return true;
  };
  return el;
}

// Een raam met ruitjes waarachter warm licht brandt, een lijst, een dorpel, en naar keuze
// luiken ernaast (o.luiken = de ramp waarin ze geverfd zijn). o.lijst: de ramp van de lijst
// (wit geschilderd: 'pleister'). o.donker: geen licht binnen, dan weerspiegelt het glas de lucht.
function raamElement(o) {
  // Een raam zonder glas (o.leeg) heeft geen roeden: glas was duur, de meeste huizen hadden
  // alleen een opening met een luik. Je kijkt er het donker van de kamer in.
  const el = { soort: 'raam', u: o.u, b: o.b ?? 16, h: o.h ?? 40, hoog: o.hoog ?? 20, kol: o.kol ?? (o.leeg ? 1 : 2), rijen: o.rijen ?? (o.leeg ? 1 : 2), ...o };
  if (el.leeg) {
    el.kol = o.kol ?? 1;
    el.rijen = o.rijen ?? 1;
  }
  const lijst = RAMP[el.lijst ?? 'hout'];
  const lijstStap = el.lijst === 'pleister' ? 5 : 2;
  el.teken = (u, h, basis) => {
    const du = u - el.u;
    const dh = h - el.h;
    const dui = Math.floor(du);
    const dhi = Math.floor(dh);
    // dorpel
    if (dhi >= -2 && dhi < 0 && dui >= -1 && dui <= el.b) {
      UIT.ramp = el.dorpel ? RAMP[el.dorpel] : lijst;
      UIT.stap = dhi === -1 ? (el.dorpel ? 7 : lijstStap + 2) : el.dorpel ? 4 : lijstStap;
      return true;
    }
    // luiken
    if (el.luiken && dhi >= 0 && dhi < el.hoog) {
      const lb = Math.ceil(el.b / 2);
      const links = dui >= -lb - 1 && dui < -1;
      const rechts = dui > el.b && dui <= el.b + lb;
      if (links || rechts) {
        const lu = links ? dui + lb + 1 : dui - el.b - 1;
        UIT.ramp = RAMP[el.luiken];
        let s = basis - 1;
        if (lu % 3 === 0) s -= 1; // planken
        if (lu === 0 || lu === lb - 1 || dhi === 0 || dhi === el.hoog - 1) s = basis - 2;
        if (dhi === el.hoog - 2 && lu > 0 && lu < lb - 1) s = basis;
        // een uitgezaagd hartje
        const hu = lu - Math.floor(lb / 2);
        const hh = dhi - Math.floor(el.hoog * 0.62);
        if ((hh === 0 && (hu === -1 || hu === 0)) || (hh === -1 && hu === -1 + (hh + 1)) || (hh === 1 && (hu === -1 || hu === 0))) {
          if (hh !== 1 || true) {
            UIT.ramp = RAMP.inkt;
            s = 1;
          }
        }
        // hengsels
        if ((dhi === 3 || dhi === el.hoog - 5) && (links ? lu === lb - 2 : lu === 1)) {
          UIT.ramp = RAMP.ijzer;
          s = 4;
        }
        UIT.stap = Math.round(s);
        return true;
      }
    }
    if (du < 0 || du >= el.b || dh < 0 || dh >= el.hoog) return false;
    // lijst
    const rand = dui === 0 || dui === el.b - 1 || dhi === 0 || dhi === el.hoog - 1;
    const kw = (el.b - 2) / el.kol;
    const rw = (el.hoog - 2) / el.rijen;
    const roedeU = (dui - 1) % kw >= kw - 1 && dui < el.b - 2;
    const roedeH = (dhi - 1) % rw >= rw - 1 && dhi < el.hoog - 2;
    if (rand || roedeU || roedeH) {
      UIT.ramp = lijst;
      UIT.stap = lijstStap + (dhi === el.hoog - 1 || dui === 0 ? -1 : 0) + (dhi === 0 ? 1 : 0);
      return true;
    }
    // glas
    const ruit = Math.floor((dui - 1) / kw) + Math.floor((dhi - 1) / rw) * 7;
    if (el.leeg) {
      // geen glas: het donker van de kamer, met onderin een streepje licht van de haard
      UIT.ramp = RAMP.inkt;
      UIT.stap = dhi < 2 ? 2 : 1;
      if (dui === 1 || dhi === el.hoog - 2) UIT.stap = 0;
      UIT.vlag = VLAG.VAST;
      return true;
    }
    if (el.donker) {
      UIT.ramp = RAMP.water;
      const lucht = (dui + (el.hoog - dhi)) % 9 < 2;
      UIT.stap = dhi > el.hoog * 0.6 ? 3 : 2;
      if (lucht) UIT.stap += 2;
      if (dui === 1 || dhi === el.hoog - 2) UIT.stap = 1; // schaduw van de dagkant
      UIT.vlag = VLAG.VAST;
      return true;
    }
    UIT.ramp = RAMP.goud;
    let s = dhi > el.hoog * 0.55 ? 5 : 4;
    if (hash(ruit, el.u, 123) % 4 === 0) s += 1;
    if (dui === 1 || dhi === el.hoog - 2) s = 3; // de bovenkant en linkerkant van het kozijn werpen schaduw
    // een gordijn opzij
    if (el.gordijn && (dui <= 3 || dui >= el.b - 4) && dhi > 1) {
      UIT.ramp = RAMP.rood;
      s = dui <= 3 ? 4 : 3;
    }
    UIT.stap = s;
    UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
    return true;
  };
  return el;
}

// ---------------------------------------------------------------- daken: riet en pannen

// Riet: lagen van negen pixels met een golvende onderrand, en daarin halmen langs de helling:
// streepjes van één pixel breed en vier tot negen lang, die niet met de lagen meelopen.
// e: pixels boven de dakvoet, kol: plek langs de nok (in eenheden), basis: hoe licht het schild.
function rietPixel(e, kol, basis, zaad, mosExtra = 0) {
  // Riet in de zon is warm goudstro (de stro-ramp), niet het doffe groenbruin van 'riet'. Mos
  // komt er alleen bij als het dak oud is, en dan in plekken.
  UIT.ramp = RAMP.stro;
  const laagH = 12; // dikkere lagen: op deze schaal zie je ze dan echt liggen
  const u = kol * SQ;
  const k = Math.floor(kol / 1.42); // een halm
  const golf = Math.sin(u * 0.19 + Math.floor(e / laagH) * 2.3) * 1.2 + ((hash(Math.floor(u / 3), Math.floor(e / laagH), zaad) % 3) - 1) * 0.6;
  const ev = e + golf;
  const laag = Math.floor(ev / laagH);
  const f = ev - laag * laagH;
  let s = basis;
  const spring = hash(k, 0, zaad + 2) % 11;
  const stuk = Math.floor((e + spring) / (4 + (hash(k, 1, zaad) % 6)));
  const halm = hash(k, stuk, zaad + 1) % 12;
  if (halm < 3) s -= 1;
  else if (halm > 9) s += 1;
  if (f < 2) s = basis - 2; // de schaduw onder de laag erboven: een hele stap donkerder
  else if (f < 3.2) s = Math.min(s, basis - 1);
  else if (f > laagH - 2 && halm > 4) s = basis + 1; // de lichte neus van een laag
  // Mos in plekken in plaats van spikkels: grote vlekken laag op het dak, waar het vocht blijft
  // staan, en alleen op daken die oud genoeg zijn (dakMos).
  if (mosExtra > 0.05) {
    // kleine plekken met een rafelige rand, laag op het dak waar het vocht blijft staan, en in
    // het donkere grijsgroen van oud mos ('den'), niet in het frisse groen van 'mos'
    const vlek = ruis2(u * 0.05, e * 0.065, zaad + 3) * 0.6 + ruis2(u * 0.15, e * 0.19, zaad + 5) * 0.4;
    const laag = klem((34 - e) / 22, 0, 1);
    if (laag > 0 && vlek + laag * 0.16 + mosExtra * 0.26 > 0.93) {
      UIT.ramp = RAMP.den;
      UIT.stap = klem(Math.round(2 + (f < 2.5 ? -1 : 0) + (halm > 8 ? 1 : 0)), 1, 4);
      return;
    }
  }
  UIT.stap = s;
}

// Pannen (holle pannen): rijen van zeven pixels, elke pan een rol en een trog. De rol vangt licht
// aan de kant van de zon, de trog is donker, en onder de voet van elke rij een donkere lijn die
// onder de rol een pixel lager ligt: de ronde neus van de pan.
function pannenPixel(e, kol, basis, zaad) {
  UIT.ramp = RAMP.dak;
  const rijH = 7;
  const panB = 11.3; // eenheden langs de nok
  const rij = Math.floor(e / rijH);
  const f = e - rij * rijH;
  const k = Math.floor(kol / panB);
  const pu = (kol - k * panB) / panB; // 0..1 over de pan
  const h = hash(rij, k, zaad);
  let s = basis;
  if (h % 11 === 0) s -= 1;
  else if (h % 13 === 1) s += 1;
  // profiel: rol op 0..0.45, trog op 0.55..1
  const rol = pu < 0.45;
  if (pu < 0.18) s += 1;
  else if (pu >= 0.45 && pu < 0.58) s -= 1;
  else if (pu >= 0.86) s -= 1;
  // neus en overlap
  const neus = rol ? 1.6 : 0.8;
  if (f < neus) s = basis - 3;
  else if (f < neus + 1) s = rol ? basis + 1 : basis;
  // mos op een enkele oude pan, onderaan in de trog
  if (h % 37 === 5 && !rol && f >= neus + 1 && f < neus + 4) {
    UIT.ramp = RAMP.mos;
    s = s - basis + 3;
  }
  UIT.stap = s;
}

// Leien: rijen van vijf pixels, platen van negen pixels breed in halfsteens verband, blauwgrijs.
// Onder elke rij een donkere schaduwlijn en daarboven de lichte rand van de lei, links van elke
// lei een voeg, en per lei een eigen tint.
function leienPixel(e, kol, basis, zaad, ramp = RAMP.pet) {
  UIT.ramp = ramp;
  const rijH = 5;
  const rij = Math.floor(e / rijH);
  const f = e - rij * rijH;
  const B = 12.7;
  const kv = kol + (rij % 2) * B * 0.5 + (hash(rij, 1, zaad) % 3) * 1.4;
  const k = Math.floor(kv / B);
  const fu = (kv - k * B) / B;
  const h = hash(rij, k, zaad + 3);
  let s = basis + (h % 5 === 0 ? -1 : h % 7 === 1 ? 1 : 0);
  if (f < 1) s = basis - 2;
  else if (f < 2) s = Math.max(s, basis) + (h % 3 === 0 ? 1 : 0);
  if (fu < 0.09) s = basis - 2;
  if (h % 53 === 3 && f >= 2) {
    UIT.ramp = RAMP.mos;
    s = 2;
  }
  UIT.stap = s;
}

// Een open gevel: hier tekent de muur niets, zodat je de vormen erachter ziet (de smidse). Erboven
// een eiken latei.
function openElement(o) {
  const el = { soort: 'open', u: o.u, b: o.b, h: o.h ?? 0, hoog: o.hoog, ...o };
  el.teken = (u, h, basis) => {
    const du = u - el.u;
    const dh = h - el.h;
    if (du >= -4 && du < el.b + 4 && dh >= el.hoog && dh < el.hoog + 7) {
      UIT.ramp = RAMP.hout;
      const dhi = Math.floor(dh - el.hoog);
      UIT.stap = dhi === 6 ? basis - 2 : dhi === 0 ? basis - 4 : basis - 3 + (hash(Math.floor(du / 6), 2, 161) % 3 === 0 ? -1 : 0);
      if (Math.floor(du) === -4 || Math.floor(du) === el.b + 3) UIT.stap = basis - 4;
      return true;
    }
    if (du < 0 || du >= el.b || dh < 0 || dh >= el.hoog) return false;
    UIT.weg = true;
    return true;
  };
  return el;
}

// Bakstenen: rijen van drie pixels, stenen van zes, halfsteens verband, lichte voeg.
function baksteenPixel(u, h, basis, ramp = 'rood') {
  const rij = Math.floor(h / 3);
  const f = h - rij * 3;
  const uu = u + (rij % 2) * 3;
  const k = Math.floor(uu / 6);
  const fu = uu - k * 6;
  if (f < 1 || fu < 1) {
    UIT.ramp = RAMP.pleister;
    UIT.stap = basis - 2;
    return;
  }
  UIT.ramp = RAMP[ramp];
  const hs = hash(rij, k, 131);
  UIT.stap = Math.round(basis + (hs % 5 === 0 ? -1 : hs % 7 === 0 ? 1 : 0) + (f >= 2 && fu < 2 ? 0.6 : 0));
}

// ---------------------------------------------------------------- het huis

// Een huis als convexe vormen. o:
//   gx, gy       de eerste tegel (achterste hoek); het huis beslaat b × d tegels
//   nok          'x' of 'y': de richting van de nok
//   dak          'riet' of 'pannen'; overstek en gevelOverstek (eenheden)
//   verdiepingen [{ muur, hoog, gevel, uitkraging }], van onder naar boven. muur is 'vakwerk'
//                of 'veldsteen', hoog in pixels. uitkraging (eenheden) laat een verdieping aan de
//                zichtbare kanten over de vorige heen steken, met balkkoppen eronder.
//                Zonder verdiepingen: één laag uit o.muur, o.muurH en o.gevel.
//   gevel        { y: [...], x: [...] }: deuren en ramen op de zichtbare wanden. De wand 'y' is
//                linksvoor (in de zon), 'x' rechtsvoor. u loopt op het scherm van links naar
//                rechts, h omhoog vanaf de grond, allebei in pixels.
//   sokkelH      hoogte van de plint (pixels)
//   schoorsteen  { t: plek langs de nok (0..1), c: afstand dwars op de nok (eenheden), hoog }
//   bord         { vlak: 'x' | 'y', u, h, verdieping }: een uithangbord aan een ijzeren arm
//   dakkapellen  [{ t, b, hoog, raam }]: dakkapellen op het voorste dakschild
//   hBasis       alles zoveel pixels hoger (zo staat een dakkapel op het dak)
//   rook         false: geen rook uit de schoorsteen (voor losse sprites)
// Geeft { vormen, lichten, bloembakken, modellen, voet } terug; zetGebouw zet het in een beeld.
function huis(o) {
  const T = TEGEL;
  const x0 = (o.gx - 0.5) * T;
  const y0 = (o.gy - 0.5) * T;
  const nokX = (o.nok ?? 'x') === 'x';
  const t = HELLING;
  const riet = o.dak === 'riet';
  const spaan = o.dak === 'spanen';
  const lei = o.dak === 'leien' || spaan;
  const dakRamp = spaan ? RAMP.hout : lei ? RAMP.veldsteen : RAMP.dak;
  const zaad = o.zaad ?? 1;
  const sokkelH = o.sokkelH ?? 10;
  const vormen = [];
  const D = { muur: 1, dak: 2, kap: 3, schoorsteen: 4, sokkel: 5, stoep: 6, bak: 7, bord: 9 };
  const hB = o.hBasis ?? 0; // alles zoveel pixels hoger (een dakkapel staat op het dak)
  const zB = hB / PXH;

  // --- de verdiepingen: elk een blok met zijn eigen wanden
  const lagenIn = o.verdiepingen || [{ muur: o.muur, hoog: o.muurH, gevel: o.gevel, pleister: o.pleister, hout: o.hout }];
  const lagen = [];
  let hOnder = 0;
  let uk = 0;
  for (let i = 0; i < lagenIn.length; i++) {
    const L = lagenIn[i];
    uk += L.uitkraging || 0;
    lagen.push({ ...L, h0: hOnder, h1: hOnder + L.hoog, x1: (o.gx + o.b - 0.5) * T + uk, y1: (o.gy + o.d - 0.5) * T + uk, top: i === lagenIn.length - 1, uk: L.uitkraging || 0 });
    hOnder += L.hoog;
  }
  const bovenste = lagen[lagen.length - 1];
  const x1 = bovenste.x1;
  const y1 = bovenste.y1;
  const muurH = bovenste.h1;
  const zM = (muurH + hB) / PXH;
  const [a0, a1, c0, c1] = nokX ? [x0, x1, y0, y1] : [y0, y1, x0, x1];
  const mid = (c0 + c1) / 2;
  const half = (c1 - c0) / 2;
  const zN = zM + half * t; // de nok van de gevel: de onderkant van het dak
  // Het dak is de grootste massa van het huis (zie de boerderij-referentie): het riet is dik,
  // steekt een halve tegel over de muur uit en zakt daarmee laag over de gevel heen.
  const dikte = o.dikte ?? (riet ? 24 : 6);
  const ov = o.overstek ?? (riet ? 22 : 8);
  const ovg = o.gevelOverstek ?? (riet ? 9 : 5);
  // een vector in (langs de nok, dwars, omhoog) naar wereld (x, y, z)
  const w = (na, nc, nz) => (nokX ? [na, nc, nz] : [nc, na, nz]);
  const doosW = (a0_, a1_, c0_, c1_, z0, z1) => (nokX ? [a0_, c0_, z0, a1_, c1_, z1] : [c0_, a0_, z0, c1_, a1_, z1]);

  for (const laag of lagen) {
    const steen = laag.muur === 'veldsteen';
    const balk = laag.muur === 'blokhut';
    const plank = laag.muur === 'planken';
    const gevel = laag.gevel || {};
    const lx1 = laag.x1;
    const ly1 = laag.y1;
    laag.wanden = {
      y: { W: (lx1 - x0) * SQ, u: (X) => (X - x0) * SQ, el: gevel.y || [], topGevel: laag.top && !nokX },
      x: { W: (ly1 - y0) * SQ, u: (X, Y) => (ly1 - Y) * SQ, el: gevel.x || [], topGevel: laag.top && nokX },
    };
    for (const [naam, wd] of Object.entries(laag.wanden)) {
      const licht = naam === 'y' ? 1 : 0;
      wd.basis = steen ? (licht ? 6 : 4) : balk ? (licht ? 5 : 3.4) : licht ? 5 : 4;
      const top = laag.h1 + wd.W * 0.75;
      const sill = laag.h0 === 0 ? sokkelH : laag.h0;
      wd.balken = steen || balk || plank ? null : vakwerkBalken(wd.W, laag.h1, sill, wd.el, wd.topGevel ? { top } : null);
      for (const el of wd.el) {
        if (el.dagRamp === undefined) el.dagRamp = steen ? RAMP.steen : RAMP.pleister;
        if (el.dagStap === undefined) el.dagStap = steen ? wd.basis - 3 : wd.basis - 2;
      }
    }
    laag.tex = (vlak, X, Y, Z) => {
      const wd = laag.wanden[vlak];
      if (!wd) {
        UIT.ramp = RAMP.steen;
        UIT.stap = 2;
        return;
      }
      const u = wd.u(X, Y);
      const h = Z * PXH - hB;
      for (const el of wd.el) if (el.teken(u, h, wd.basis)) return;
      // Onder de overstek is het het donkerst: dat contrast geeft de plaat zijn diepte. Alleen
      // op de bovenste laag, en alleen waar geen gevel boven de wand staat.
      const donker = laag.top && !wd.topGevel && h > laag.h1 - 20 ? (h > laag.h1 - 13 ? 3 : 1.5) : 0;
      if (steen) veldsteenPixel(u, h, wd.W, wd.basis, zaad);
      else if (h < sokkelH && hB === 0) veldsteenPixel(u, h + 3, wd.W, wd.basis + (vlak === 'y' ? -1 : 0), zaad + 20, false);
      else if (balk) blokhutPixel(u, h, wd.W, wd.basis, zaad, { hout: laag.hout });
      else if (plank) plankPixel(u, h, wd.W, wd.basis, zaad, { hout: laag.hout });
      else if (laag.uk && h < laag.h0 + 5) {
        // balkkoppen onder de overstekende verdieping
        const kop = ((Math.floor(u) % 9) + 9) % 9 < 4;
        UIT.ramp = RAMP.hout;
        UIT.stap = kop ? (h < laag.h0 + 1 ? 1 : wd.basis - 2) : wd.basis - 4;
      } else vakwerkPixel(u, h, wd.balken, wd.basis, zaad, { vlecht: laag.muur === 'vlecht', hout: laag.hout, pleister: laag.pleister ? RAMP[laag.pleister] : null });
      if (donker) UIT.stap -= donker;
    };
    vormen.push(blok(x0 / T, y0 / T, lx1 / T, ly1 / T, laag.h0 + hB, laag.h1 + hB, laag.tex, { deel: D.muur }));
  }
  // de gevel: een driehoek boven de bovenste muur, onder het dak
  vormen.push(
    vorm(
      [
        { n: w(1, 0, 0), d: a1, naam: nokX ? 'x' : 'y' },
        { n: w(-1, 0, 0), d: -a0, naam: '-' },
        { n: [0, 0, -1], d: -zM + 0.01, naam: '-' },
        { n: w(0, t, 1), d: zN + t * mid, naam: '-' },
        { n: w(0, -t, 1), d: zN - t * mid, naam: '-' },
      ],
      bovenste.tex,
      { deel: D.muur, doos: doosW(a0, a1, c0, c1, zM, zN) },
    ),
  );

  // --- plint langs de zichtbare wanden van de onderste laag, met gaten voor de deuren, en
  // stoepjes voor de deuren
  const onderste = lagen[0];
  const bx1 = onderste.x1;
  const by1 = onderste.y1;
  const plintTex = (vlak, X, Y, Z) => {
    const u = vlak === 'y' ? X * SQ : -Y * SQ;
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 6;
      return;
    }
    veldsteenPixel(u + 400, h + 2, 9999, vlak === 'y' ? 5 : 3, zaad + 30, false);
  };
  const uit = 2; // hoe ver de plint uitsteekt
  const plintLangs = (naam) => {
    const wd = onderste.wanden[naam];
    const deuren = wd.el.filter((e) => e.soort === 'deur' || e.soort === 'open').map((e) => [e.u, e.u + e.b]).sort((p, q) => p[0] - q[0]);
    let van = -uit * SQ;
    const stukken = [];
    for (const [d0, d1] of deuren) {
      stukken.push([van, d0]);
      van = d1;
    }
    stukken.push([van, wd.W + uit * SQ]);
    for (const [u0, u1] of stukken) {
      if (u1 - u0 < 1) continue;
      if (naam === 'y') vormen.push(blok((x0 + u0 / SQ) / T, (by1 - 3) / T, (x0 + u1 / SQ) / T, (by1 + uit) / T, 0, sokkelH, plintTex, { deel: D.sokkel }));
      else vormen.push(blok((bx1 - 3) / T, (by1 - u1 / SQ) / T, (bx1 + uit) / T, (by1 - u0 / SQ) / T, 0, sokkelH, plintTex, { deel: D.sokkel }));
    }
    for (const el of wd.el) {
      if (el.soort !== 'deur' || el.stoep === false) continue;
      const u0 = el.u - 3;
      const u1 = el.u + el.b + 3;
      const stoepTex = (vlak, X, Y, Z) => {
        UIT.ramp = RAMP.steen;
        const u = vlak === 'y' ? X * SQ : -Y * SQ;
        UIT.stap = vlak === 'z' ? 6 + (hash(Math.floor(u / 7), 1, 141) % 3 === 0 ? -1 : 0) : vlak === 'y' ? 4 : 3;
        if (vlak !== 'z' && Z * PXH > 3) UIT.stap += 1;
      };
      if (naam === 'y') vormen.push(blok((x0 + u0 / SQ) / T, (by1 - 2) / T, (x0 + u1 / SQ) / T, (by1 + 9) / T, 0, 4, stoepTex, { deel: D.stoep }));
      else vormen.push(blok((bx1 - 2) / T, (by1 - u1 / SQ) / T, (bx1 + 9) / T, (by1 - u0 / SQ) / T, 0, 4, stoepTex, { deel: D.stoep }));
    }
  };
  if (hB === 0) {
    plintLangs('y');
    plintLangs('x');
  }

  // --- bloembakken onder ramen
  const bloembakken = [];
  for (const laag of lagen) {
    for (const naam of ['y', 'x']) {
      for (const el of laag.wanden[naam].el) {
        if (!el.bloembak) continue;
        const u0 = el.u - 2;
        const u1 = el.u + el.b + 2;
        const hb = el.h - 3 + hB;
        const bakTex = (vlak, X, Y, Z) => {
          const u = vlak === 'y' ? X * SQ : -Y * SQ;
          const h = Z * PXH;
          if (vlak === 'z') {
            UIT.ramp = RAMP.aarde;
            UIT.stap = 2;
            return;
          }
          UIT.ramp = RAMP.hout;
          const lokaal = h - (hb - 6);
          UIT.stap = (vlak === 'y' ? 4 : 3) + (lokaal < 1 ? -2 : lokaal > 5 ? 1 : 0) + (Math.floor(u) % 7 === 0 ? -1 : 0);
        };
        const diep = 7;
        const lx1 = laag.x1;
        const ly1 = laag.y1;
        if (naam === 'y') {
          vormen.push(blok((x0 + u0 / SQ) / T, (ly1 - 1) / T, (x0 + u1 / SQ) / T, (ly1 + diep) / T, hb - 6, hb, bakTex, { deel: D.bak }));
          bloembakken.push({ a: [x0 + u0 / SQ, ly1 + diep / 2, hb / PXH], b: [x0 + u1 / SQ, ly1 + diep / 2, hb / PXH], zaad: el.u + zaad });
        } else {
          vormen.push(blok((lx1 - 1) / T, (ly1 - u1 / SQ) / T, (lx1 + diep) / T, (ly1 - u0 / SQ) / T, hb - 6, hb, bakTex, { deel: D.bak }));
          bloembakken.push({ a: [lx1 + diep / 2, ly1 - u0 / SQ, hb / PXH], b: [lx1 + diep / 2, ly1 - u1 / SQ, hb / PXH], zaad: el.u + zaad + 50 });
        }
      }
    }
  }

  // --- het dak: twee schilden, een nokkap
  const ze = zM - t * ov; // onderkant dak bij de dakvoet
  const eaveKr = (c1 + ov) * SQ - (ze + dikte) * PXH; // de dakvoet op het scherm (voor de rijen)
  const lichtVoor = lichtOp(norm(w(0, t, 1)));
  const basisDak = spaan ? (lichtVoor > 0.6 ? 4.5 : 3) : riet || lei ? (lichtVoor > 0.6 ? 4 : 3) : lichtVoor > 0.6 ? 5 : 4;
  const basisDakVlak = spaan ? 4.5 : lei ? 3.5 : 5;
  const kapH = riet ? 13 : 3.5; // de nokrol van riet is een dikke worst over de hele lengte
  const kapW = riet ? 22 : 6;
  const dakTex = (vlak, X, Y, Z) => {
    const a = nokX ? X : Y;
    const c = nokX ? Y : X;
    const kol = nokX ? X : -Y; // langs de nok, oplopend naar rechts op het scherm
    const kr = c * SQ - Z * PXH;
    const e = eaveKr - kr;
    const u = kol * SQ;
    if (vlak === 'dak') {
      if (riet) rietPixel(e, kol, basisDak - (o.dakOud ? 1 : 0), zaad, o.dakMos || 0);
      else if (lei) leienPixel(e, kol, basisDak, zaad, dakRamp);
      else pannenPixel(e, kol, basisDak, zaad);
      UIT.stap = Math.round(UIT.stap);
      return;
    }
    if (vlak === 'goot') {
      const hh = (Z - (ze - t * 0)) * PXH; // 0..dikte·PXH
      const hi = Math.floor(hh);
      if (riet) {
        UIT.ramp = RAMP.stro;
        const k = Math.floor(kol / 1.42);
        const halm = hash(k, 7, zaad + 2) % 6;
        // de onderrand is rond afgesneden en golft: geen mes, maar een dikke rol stro
        const bult = Math.abs((((u % 9) + 9) % 9) - 4.5) * 0.55 + (hash(k, 9, zaad + 4) % 3) * 0.4;
        if (hh < bult) {
          UIT.weg = true;
          return;
        }
        const top = dikte * PXH;
        let s = basisDak - 1 + (halm === 0 ? -1 : halm === 1 ? 1 : 0);
        if (hh < bult + 2.2) s = basisDak - 3 - (halm % 2); // de schaduw in de ronding
        else if (hh < bult + 5) s = basisDak - 2;
        if (hh > top - 3) s = basisDak + (halm > 3 ? 1 : 0); // de lichte bovenrand
        UIT.stap = Math.round(s);
      } else if (lei) {
        UIT.ramp = dakRamp;
        UIT.stap = hi === 0 ? (spaan ? 1 : 1) : basisDak - 1;
      } else {
        UIT.ramp = RAMP.dak;
        const panB = 11.3;
        const pu = (kol - Math.floor(kol / panB) * panB) / panB;
        const rolGat = pu < 0.45 && hi < 3 && Math.hypot((pu - 0.22) * 9, hi + 0.5) < 2.6;
        UIT.stap = rolGat ? 0 : basisDak - 1 - (hi === 0 ? 1 : 0);
      }
      return;
    }
    if (vlak === 'kant') {
      // de zijkant van het schild boven de gevel: riet in lagen, of een windveer van hout
      const onder = (zN + dikte - t * Math.abs(c - mid) - Z) * PXH; // pixels onder de bovenrand
      if (riet) {
        // de afgesneden halmen aan de zijkant: strepen langs de helling, de buitenrand licht
        rietPixel(e, onder * 1.42, basisDak - 1, zaad + 7);
        if (onder < 1.5) UIT.stap = basisDak;
        else if (onder > dikte * PXH - 2) UIT.stap = basisDak - 3;
        UIT.stap = Math.round(UIT.stap);
      } else {
        UIT.ramp = RAMP.hout;
        UIT.stap = (nokX ? 2 : 3) + (onder < 1 ? 1 : 0);
      }
      return;
    }
    if (vlak === 'kap') {
      // de nokkap: bij riet een dikke rol met twee liggers en kruisende spijlen, bij pannen
      // ronde nokvorsten
      if (riet) {
        // een gerolde worst stro over de nok: rond van boven, donker aan de onderkant, met om
        // de zoveel pixels een wilgen band eromheen
        UIT.ramp = RAMP.stro;
        const kapVoet = (mid + kapW) * SQ - (zN + dikte + kapH - t * kapW) * PXH; // lijn onderaan de kap
        const f = kapVoet - kr; // pixels boven de voet van de kap
        const hoogte = (kapH + kapW * t) * PXH;
        const rond = klem(f / Math.max(hoogte, 1), 0, 1);
        let s = basisDak - 2 + rond * 3;
        const k = Math.floor(kol / 1.42);
        if (hash(k, 9, zaad) % 4 === 0) s -= 0.6; // losse halmen
        const band = ((u % 23) + 23) % 23;
        if (band < 2.2 && f > 2) s = basisDak - 2.6; // de wilgen band
        else if (band < 3.4 && f > 2) s = basisDak + 1;
        if (f < 2.5) s = basisDak - 3; // de schaduw onder de rol
        UIT.stap = Math.round(s);
      } else if (spaan) {
        // een nok van twee planken over elkaar
        UIT.ramp = RAMP.hout;
        const seg = ((u % 14) + 14) % 14;
        UIT.stap = basisDak - 1 + (seg < 1 ? -1 : 0);
      } else if (lei) {
        // een nok van lood: glad, met een lichte streep en om de zoveel een naad
        UIT.ramp = RAMP.ijzer;
        const seg = ((u % 16) + 16) % 16;
        UIT.stap = 4 + (seg < 1 ? -1 : 0);
      } else {
        UIT.ramp = RAMP.dak;
        const seg = ((u % 12) + 12) % 12;
        UIT.stap = basisDak + (seg < 1 ? -2 : seg < 2 ? 1 : 0);
      }
      return;
    }
    if (vlak === 'kapRand') {
      const hh = (Z - (zN + dikte - t * kapW)) * PXH;
      if (riet) {
        // een gekartelde onderrand: punten die over het riet hangen
        const p = ((u % 8) + 8) % 8;
        const punt = Math.abs(p - 4) * 0.9;
        if (hh < punt) {
          UIT.weg = true;
          return;
        }
        UIT.ramp = RAMP.riet;
        UIT.stap = basisDak - 2 + (hh > punt + 2 ? 1 : 0);
      } else if (lei) {
        UIT.ramp = spaan ? RAMP.hout : RAMP.ijzer;
        UIT.stap = 2;
      } else {
        UIT.ramp = RAMP.pleister;
        UIT.stap = hh < 1.5 ? 3 : 2;
        if (hh >= 1.5) {
          UIT.ramp = RAMP.dak;
          UIT.stap = basisDak - 1;
        }
      }
      return;
    }
    if (vlak === 'kant' && o.windveer) {
      // een gesneden windveer langs de gevelrand: een plank met een geschulpte onderkant
      const hh = (Z - ze) * PXH;
      const top = dikte * PXH;
      const schulp = Math.abs((((a * SQ % 7) + 7) % 7) - 3.5) * 0.7;
      if (hh < schulp * 0.8) {
        UIT.weg = true;
        return;
      }
      UIT.ramp = RAMP.hout;
      let s = 3.4;
      if (hh > top - 2) s = 4.6;
      else if (hh < schulp * 0.8 + 2) s = 1.8;
      if (((a * SQ) % 11 + 11) % 11 < 1) s -= 1; // de naad tussen twee planken
      UIT.stap = Math.round(s);
      return;
    }
    if (vlak === 'kapKant') {
      UIT.ramp = riet ? RAMP.riet : lei ? (spaan ? RAMP.hout : RAMP.ijzer) : RAMP.dak;
      UIT.stap = riet ? basisDak - 2 : lei ? 2 : 1;
      return;
    }
    UIT.ramp = riet ? RAMP.riet : dakRamp;
    UIT.stap = 1;
  };
  const dakVoor = vorm(
    [
      { n: w(0, t, 1), d: zN + dikte + t * mid, naam: 'dak' },
      { n: w(0, -t, -1), d: -(zN + t * mid), naam: 'onder' },
      { n: w(0, -1, 0), d: -mid, naam: 'nok' },
      { n: w(0, 1, 0), d: c1 + ov, naam: 'goot' },
      { n: w(1, 0, 0), d: a1 + ovg, naam: 'kant' },
      { n: w(-1, 0, 0), d: -(a0 - ovg), naam: '-' },
    ],
    dakTex,
    { deel: D.dak, doos: doosW(a0 - ovg, a1 + ovg, mid, c1 + ov, ze, zN + dikte) },
  );
  const dakAchter = vorm(
    [
      { n: w(0, -t, 1), d: zN + dikte - t * mid, naam: 'dakAchter' },
      { n: w(0, t, -1), d: -(zN - t * mid), naam: 'onder' },
      { n: w(0, 1, 0), d: mid, naam: 'nok' },
      { n: w(0, -1, 0), d: -(c0 - ov), naam: '-' },
      { n: w(1, 0, 0), d: a1 + ovg, naam: 'kant' },
      { n: w(-1, 0, 0), d: -(a0 - ovg), naam: '-' },
    ],
    dakTex,
    { deel: D.dak, doos: doosW(a0 - ovg, a1 + ovg, c0 - ov, mid, ze, zN + dikte) },
  );
  const zk = zN + dikte;
  const nokKap = vorm(
    [
      { n: w(0, t, 1), d: zk + kapH + t * mid, naam: 'kap' },
      { n: w(0, -t, 1), d: zk + kapH - t * mid, naam: 'kapAchter' },
      { n: w(0, 1, 0), d: mid + kapW, naam: 'kapRand' },
      { n: w(0, -1, 0), d: -(mid - kapW), naam: '-' },
      { n: [0, 0, -1], d: -(zk - t * kapW - 3), naam: '-' },
      { n: w(1, 0, 0), d: a1 + ovg + 1, naam: 'kapKant' },
      { n: w(-1, 0, 0), d: -(a0 - ovg - 1), naam: '-' },
    ],
    dakTex,
    { deel: D.kap, doos: doosW(a0 - ovg - 1, a1 + ovg + 1, mid - kapW, mid + kapW, zk - t * kapW - 3, zk + kapH) },
  );
  vormen.push(dakVoor, dakAchter, nokKap);

  // --- erkers: een uitbouw die op twee houten klossen uit de wand steekt, met een eigen schuin
  // kapje erop. o.erkers: [{ vlak: 'y' of 'x', u (px langs de wand), b (px breed), h (px boven
  // de grond), hoog (px), diep (eenheden uit de wand) }]
  for (const e of o.erkers || []) {
    const vlakY = (e.vlak ?? 'y') === 'y';
    const laag = lagen.find((L) => e.h >= L.h0 && e.h < L.h1) || lagen[0];
    const diep = e.diep ?? 15;
    const b0 = e.u / SQ;
    const b1 = (e.u + e.b) / SQ;
    const ex0 = vlakY ? x0 + b0 : laag.x1 - 1;
    const ex1 = vlakY ? x0 + b1 : laag.x1 + diep;
    const ey0 = vlakY ? laag.y1 - 1 : laag.y1 - b1;
    const ey1 = vlakY ? laag.y1 + diep : laag.y1 - b0;
    const h0 = e.h + hB;
    const h1 = e.h + e.hoog + hB;
    vormen.push(blok(ex0 / T, ey0 / T, ex1 / T, ey1 / T, h0, h1, laag.tex, { deel: D.muur }));
    // de klossen eronder, en een plank als vloertje
    const klosTex = (vlak, X, Y, Z) => {
      UIT.ramp = RAMP.schors;
      const hh = (Z * PXH - (h0 - 12)) % 4;
      UIT.stap = vlak === 'z' ? 4 : vlak === 'y' ? 3.4 - (hh < 1 ? 1 : 0) : 2.2 - (hh < 1 ? 0.8 : 0);
      UIT.stap = Math.round(UIT.stap);
    };
    for (const f of [0.1, 0.72]) {
      const k0 = vlakY ? x0 + b0 + (b1 - b0) * f : ey0 + (ey1 - ey0) * f;
      const k1 = k0 + (b1 - b0) * 0.18;
      if (vlakY) vormen.push(blok(k0 / T, (laag.y1 - 1) / T, k1 / T, (laag.y1 + diep * 0.75) / T, h0 - 12, h0, klosTex, { deel: D.muur }));
      else vormen.push(blok((laag.x1 - 1) / T, k0 / T, (laag.x1 + diep * 0.75) / T, k1 / T, h0 - 12, h0, klosTex, { deel: D.muur }));
    }
    // het kapje: een plat dakje dat een pixel of vier uitsteekt
    const kapTex = (vlak, X, Y, Z) => {
      if (riet) {
        UIT.ramp = RAMP.stro;
        UIT.stap = vlak === 'z' ? 4 : 2;
      } else {
        UIT.ramp = dakRamp;
        UIT.stap = vlak === 'z' ? basisDakVlak : 2;
      }
    };
    vormen.push(blok((ex0 - 3) / T, (ey0 - 3) / T, (ex1 + 3) / T, (ey1 + 3) / T, h1, h1 + (riet ? 9 : 6), kapTex, { deel: D.dak }));
  }

  // --- dakkapellen op het voorste dakschild: elk een klein huisje met de nok haaks op de grote
  // nok, dat op het dak staat en achterin in het dak verdwijnt. o.dakkapellen: [{ t: plek langs
  // de nok (0..1), b: breedte (px), hoog: muurhoogte (px), raam: opties voor het raam }]
  const kapelLichten = [];
  const kapelBakken = [];
  for (const k of o.dakkapellen || []) {
    const ac = a0 + (a1 - a0) * (k.t ?? 0.5);
    const hw = k.b / SQ / 2;
    const cf = c1 - (k.terug ?? 8);
    const zr = zN + dikte - t * (cf - mid); // het dakvlak waar de voorkant van de kapel staat
    const diep = cf - mid - 3;
    const raam = k.element || raamElement({ u: (k.b - (k.raamB ?? 14)) / 2, b: k.raamB ?? 14, h: 7, hoog: k.hoog - 12, kol: 2, rijen: 2, ...(k.raam || {}) });
    const kapel = huis({
      gx: nokX ? (ac - hw) / T + 0.5 : (cf - diep) / T + 0.5,
      gy: nokX ? (cf - diep) / T + 0.5 : (ac - hw) / T + 0.5,
      b: nokX ? (2 * hw) / T : diep / T,
      d: nokX ? diep / T : (2 * hw) / T,
      nok: nokX ? 'y' : 'x',
      dak: o.dak,
      muur: k.muur ?? bovenste.muur,
      muurH: k.hoog,
      sokkelH: 0,
      hBasis: (zr - 3) * PXH,
      dikte: k.dikte ?? (riet ? 9 : undefined),
      overstek: k.overstek ?? (riet ? 6 : 3),
      gevelOverstek: 3,
      zaad: zaad + 90,
      gevel: nokX ? { y: [raam] } : { x: [raam] },
    });
    vormen.push(...kapel.vormen);
    kapelLichten.push(...kapel.lichten);
    kapelBakken.push(...kapel.bloembakken);
  }

  // --- schoorsteen
  const lichten = [];
  let rookPluim = null;
  if (o.schoorsteen) {
    const s = o.schoorsteen;
    const ca = a0 + (a1 - a0) * (s.t ?? 0.75);
    const cc = mid + (s.c ?? 0);
    const r = s.r ?? 7;
    const top = zk + (s.hoog ?? 26);
    const schTex = (vlak, X, Y, Z) => {
      const h = Z * PXH;
      if (vlak === 'z') {
        // zwart van het roet
        UIT.ramp = RAMP.steen;
        UIT.stap = 1;
        return;
      }
      const u = vlak === 'y' ? X * SQ : -Y * SQ;
      if (s.steen ?? bovenste.muur === 'veldsteen') veldsteenPixel(u + 300, h, 9999, vlak === 'y' ? 6 : 4, zaad + 40, false);
      else baksteenPixel(u, h, vlak === 'y' ? 5 : 3);
    };
    const [sx, sy] = nokX ? [ca, cc] : [cc, ca];
    vormen.push(blok((sx - r) / T, (sy - r) / T, (sx + r) / T, (sy + r) / T, zM * PXH, top * PXH, schTex, { deel: D.schoorsteen }));
    // de kap van de schoorsteen
    const kapTex = (vlak, X, Y, Z) => {
      UIT.ramp = RAMP.steen;
      if (vlak === 'z') {
        const binnen = Math.abs(X - sx) < r - 2.5 && Math.abs(Y - sy) < r - 2.5;
        UIT.stap = binnen ? 0 : 7;
        return;
      }
      UIT.stap = vlak === 'y' ? 6 : 4;
      if (Z * PXH < top * PXH + 1) UIT.stap -= 1;
    };
    vormen.push(blok((sx - r - 1.5) / T, (sy - r - 1.5) / T, (sx + r + 1.5) / T, (sy + r + 1.5) / T, top * PXH, top * PXH + 3, kapTex, { deel: D.schoorsteen }));
    if (s.rook && o.rook !== false) rookPluim = { model: rook(zaad), gx: sx / T, gy: sy / T, richting: 'N', z: top + 4 / PXH, omlijn: false, schaduw: false };
  }
  // een open deur werpt een warme vlek op de stoep en de grond ervoor. Ramen niet: bij daglicht
  // zou hun gloed de zonnige muur alleen maar vlekkerig maken. o.raamlicht zet ze toch aan (voor
  // de avond).
  for (const laag of lagen) {
    for (const naam of ['y', 'x']) {
      for (const el of laag.wanden[naam].el) {
        const deur = el.soort === 'deur' && el.half;
        if (deur || (o.raamlicht && el.soort === 'raam' && !el.donker)) {
          const um = (el.u + el.b / 2) / SQ;
          const hm = (deur ? 6 : (el.h + el.hoog * 0.5) / PXH) + zB;
          const pos = naam === 'y' ? [x0 + um, laag.y1 + 14, hm] : [laag.x1 + 14, laag.y1 - um, hm];
          lichten.push({ pos, r: deur ? 34 : 50, sterk: deur ? 1.4 : 1, warm: 1, val: 1.3, zacht: 0.6 });
        }
      }
    }
  }
  // het uithangbord hangt aan een arm die haaks uit de muur steekt
  const modellen = [];
  if (o.bord) {
    const b = o.bord;
    const laag = lagen[b.verdieping ?? 0];
    const X = b.vlak === 'y' ? x0 + b.u / SQ : laag.x1;
    const Y = b.vlak === 'y' ? laag.y1 : laag.y1 - b.u / SQ;
    modellen.push({ model: uithangbord(b), gx: X / T, gy: Y / T, richting: b.vlak === 'y' ? 'ZW' : 'ZO', z: (b.h + hB) / PXH });
  }
  if (rookPluim) modellen.push(rookPluim);
  const voet = [x0, y0, bx1, by1];
  lichten.push(...kapelLichten);
  bloembakken.push(...kapelBakken);
  return { vormen, lichten, bloembakken, modellen, voet, hoog: (zk + kapH) * PXH, lagen };
}

const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};

// Een gebouw in het beeld zetten: alle vormen krijgen hetzelfde obj-nummer, het krijgt een
// omlijning, de lichten gaan erbij, en de bloemen in de bakken worden getekend.
function zetGebouw(B, g, o = {}) {
  const obj = B.volgendObj++;
  for (const v of g.vormen) v.obj = obj;
  tekenVormen(B, g.vormen, { omlijn: o.omlijn ?? true });
  B.lichten.push(...g.lichten.map((l) => ({ ...l, obj })));
  for (const bak of g.bloembakken) bloemen(B, bak, obj);
  for (const m of g.modellen || []) zetModel(B, m.model, m.gx, m.gy, m.richting, { z: m.z, omlijn: m.omlijn, schaduw: m.schaduw });
  g.obj = obj;
  return obj;
}

// Bloemen in een bak: blad en bloempjes als losse pixels boven de bak, met de diepte van de bak
// zodat ze voor de muur staan. Rood, met hier en daar wit of geel.
function bloemen(B, bak, obj) {
  const [ax, ay, az] = bak.a;
  const [bx, by, bz] = bak.b;
  const [sa, ta] = K.naarScherm(B, ax, ay, az);
  const [sb, tb] = K.naarScherm(B, bx, by, bz);
  const n = Math.round(Math.abs(sb - sa));
  const diep = diepteVan((ax + bx) / 2, (ay + by) / 2, az) + 4;
  const zet = (x, y, ramp, stap) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= B.b || y >= B.h) return;
    const i = y * B.b + x;
    if (B.diep[i] > diep + 2) return;
    B.ramp[i] = RAMP[ramp];
    B.stap[i] = stap;
    B.vlag[i] = VLAG.GLAD | VLAG.OMLIJN;
    B.diep[i] = diep;
    B.obj[i] = obj;
    B.deel[i] = 8;
    const t = n ? (x - sa) / (sb - sa) : 0;
    B.pos[i * 3] = mix(ax, bx, klem(t, 0, 1));
    B.pos[i * 3 + 1] = mix(ay, by, klem(t, 0, 1));
    B.pos[i * 3 + 2] = az + 4;
    B.nrm[i * 3] = 0;
    B.nrm[i * 3 + 1] = 0.5;
    B.nrm[i * 3 + 2] = 0.86;
  };
  for (let k = 0; k <= n; k++) {
    const x = sa + (sb - sa) * (k / Math.max(1, n));
    const y = ta + (tb - ta) * (k / Math.max(1, n));
    const h = hash(k, bak.zaad, 151);
    // blad: twee of drie pixels hoog
    const hoog = 2 + (h % 3);
    for (let j = 1; j <= hoog; j++) zet(x, y - j, 'blad', j === hoog ? 5 : 3 + (h >> 3) % 2);
    // bloemen: een toefje van drie pixels om de paar pixels
    if (k % 3 === 1) {
      const soort = (h >>> 5) % 7;
      const [kl, l, d] = soort === 0 ? ['pleister', 6, 4] : soort === 1 ? ['goud', 6, 4] : ['rood', 6, 4];
      zet(x, y - hoog - 1, kl, l);
      zet(x - 1, y - hoog, kl, d);
      zet(x + 1, y - hoog, kl, l - 1);
    }
  }
}

// ---------------------------------------------------------------- voorwerpen in het dorp

// Materialen, in de trant van voorwerpen.cjs
const houtM = (lo = 1, hi = 5.8, nerf = 1) => ({
  ramp: 'hout',
  lo,
  hi,
  dither: false,
  patroon: (x, y, z) => (Math.sin((x + y) * 0.35 + ruis3(x * 0.2, y * 0.2, z * 0.6, 5) * 5) > 0.82 ? -0.8 * nerf : 0),
});
const ijzerM = (glans = 1) => ({ ramp: 'ijzer', lo: 0.8, hi: 5.2, glans });
const steenM = (lo = 1.4, hi = 6.6) => ({ ramp: 'steen', lo, hi, patroon: (x, y, z) => (ruis3(x * 0.4, y * 0.4, z * 0.4, 9) > 0.74 ? -0.7 : 0) });

// een doos gedraaid om de x-as (graden): voor dakjes, luifels en schuine planken
function kantelBlok(c, h, hoek, r, m, deel) {
  const a = (hoek * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return {
    f: (x, y, z) => {
      const dy = y - c[1];
      const dz = z - c[2];
      return sdf.doos(x - c[0], dy * ca + dz * sa, -dy * sa + dz * ca, h[0], h[1], h[2], r);
    },
    g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5],
    m,
    deel,
  };
}
// een liggende cilinder langs de x-as (as, wiel, rol)
function xCilinder(c, r, half, m, deel) {
  return {
    f: (x, y, z) => {
      const dr = Math.hypot(y - c[1], z - c[2]) - r;
      const dx = Math.abs(x - c[0]) - half;
      return Math.min(Math.max(dr, dx), 0) + Math.hypot(Math.max(dr, 0), Math.max(dx, 0));
    },
    g: [c[0], c[1], c[2], Math.hypot(r, half) + 0.5],
    m,
    deel,
  };
}

// Het uithangbord van de herberg: een smeedijzeren arm met een krul, en een bord aan twee
// haakjes. Op het bord, aan beide kanten: een scheve toren met een rood dak in een gouden
// lijst, op nachtblauw. De herberg heet De Scheve Toren. Lokaal: x langs de muur, y de straat
// op, z omhoog; de oorsprong ligt op de muur, op de hoogte van de arm.
function uithangbord(o = {}) {
  const M = { ijzer: 0, bord: 1, rand: 2 };
  const bordRamp = o.bordRamp || 'gewaad';
  const lang = 30;
  const bc = [0, 17, -13]; // midden van het bord
  const [hb, hh] = [11.5, 9.5]; // halve breedte (langs y) en hoogte
  const mat = [];
  mat[M.ijzer] = ijzerM(1);
  mat[M.bord] = {
    ramp: bordRamp,
    lo: 1,
    hi: 4.4,
    patroon: (x, y, z, nx) => {
      if (Math.abs(nx) < 0.6) return { ramp: 'hout', stap: 2 };
      const v = y - bc[1];
      const w = z - bc[2];
      if (Math.abs(v) > hb - 1.6 || Math.abs(w) > hh - 1.6) return { ramp: 'goud', stap: 4.5 };
      const teken = o.teken || 'toren';
      if (teken === 'toren') {
        // de toren helt over
        const vt = v + (w + 6) * 0.22;
        if (w > -7 && w < 2.6 && Math.abs(vt) < 2.3) {
          if (Math.abs(vt) < 0.8 && w > -1.5 && w < 0.8) return { ramp: 'inkt', stap: 1 };
          if (w < -5.5) return { ramp: 'perkament', stap: 3 };
          return { ramp: 'perkament', stap: vt < 0 ? 5 : 4 };
        }
        if (w >= 2.6 && w < 6.4 && Math.abs(vt) < 2.9 - (w - 2.6) * 0.75) return { ramp: 'rood', stap: 5 };
      } else if (teken === 'krakeling') {
        // twee lussen en een knoop: een krakeling
        const r = Math.hypot(Math.abs(v) - 3.4, w + 1.2);
        const lus = Math.abs(r - 3.1) < 1.15;
        const arm = Math.abs(w - 3.2 - Math.abs(v) * 0.5) < 1.2 && Math.abs(v) < 4.4;
        const knoop = Math.hypot(v, w + 4.4) < 1.9;
        if (lus || arm || knoop) return { ramp: 'goud', stap: w > 0 ? 6 : 5 };
      } else if (teken === 'schoof') {
        // een korenschoof met een band eromheen
        const halm = Math.abs(v) < 3.6 - Math.abs(w) * 0.12 && Math.abs(w) < 6.4;
        if (halm) {
          if (Math.abs(w + 1) < 1.4) return { ramp: 'hout', stap: 3 };
          const streep = ((v * 1.6 + w * 0.2) % 2 + 2) % 2 < 1;
          return { ramp: 'goud', stap: streep ? 6 : 4.5 };
        }
        if (Math.abs(w) < 6.6 && Math.abs(v) < 5 && Math.abs(Math.abs(v) - 4) < 1 && w > 2) return { ramp: 'goud', stap: 5 };
      } else if (teken === 'hoefijzer') {
        const r = Math.hypot(v, w - 1.5);
        if (Math.abs(r - 4.4) < 1.4 && (w < 1.5 ? Math.abs(v) > 3 : true)) return { ramp: 'ijzer', stap: 5 };
      }
      // twee sterretjes
      if ((Math.abs(v - 5.5) < 0.8 && Math.abs(w - 4) < 0.8) || (Math.abs(v + 6) < 0.7 && Math.abs(w - 5.5) < 0.7)) return { ramp: 'goud', stap: 6 };
      return 0;
    },
  };
  mat[M.rand] = { ramp: 'goud', lo: 1.5, hi: 6, glans: 1 };
  const d = [];
  d.push(F.blok([0, 0.6, -3], [2.6, 0.6, 6], 0.3, M.ijzer, 1));
  d.push(F.capsule([0, 0, 0], [0, lang, 0], 0.9, M.ijzer, 1));
  d.push(F.bol([0, lang + 0.8, 0], 1.6, M.ijzer, 1));
  // schoor met een krul
  d.push(F.capsule([0, 0.5, -9], [0, 14, -0.8], 0.75, M.ijzer, 1));
  d.push({ f: (x, y, z) => sdf.torus(y - 17.5, z + 3.2, x, 2.6, 0.6), g: [0, 17.5, -3.2, 3.6], m: M.ijzer, deel: 1 });
  // haakjes
  for (const hy of [bc[1] - hb + 2.5, bc[1] + hb - 2.5]) d.push(F.capsule([0, hy, 0], [0, hy, bc[2] + hh - 0.5], 0.5, M.ijzer, 1));
  d.push(F.blok(bc, [1, hb, hh], 0.5, M.bord, 2));
  return F.model(d, mat, { midden: [0, 15, -6], straal: 24 });
}

// De waterput: een ronde muur van gemetselde blokken met een rand van dekstenen, twee palen met
// een dakje van houten spanen, een haspel met touw en een slinger, en een emmer aan het touw.
// Diep beneden glimt het water.
function waterput(schaal = 1.6) {
  const M = { steen: 0, rand: 1, water: 2, hout: 3, spaan: 4, touw: 5, ijzer: 6, emmer: 7 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.4,
    hi: 6.4,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.7) return 0;
      const rij = Math.floor(z / 4.4);
      const a = (Math.atan2(y, x) / (Math.PI * 2)) * 16 + (rij % 2) * 0.5;
      const f = a - Math.floor(a);
      const fz = z / 4.4 - rij;
      if (fz > 0.8 || f < 0.09) return -2.2;
      return hash(Math.floor(a) + 40, rij, 7) % 4 === 0 ? -0.9 : fz > 0.62 ? 0.6 : 0;
    },
  };
  mat[M.rand] = {
    ramp: 'steen',
    lo: 2.2,
    hi: 7.2,
    patroon: (x, y) => {
      const a = (Math.atan2(y, x) / (Math.PI * 2)) * 11;
      return a - Math.floor(a) < 0.07 ? -2 : 0;
    },
  };
  mat[M.water] = { ramp: 'water', lo: 0.4, hi: 2.6, glans: 2, glansMacht: 8 };
  mat[M.hout] = houtM(1, 5.4);
  mat[M.spaan] = {
    ramp: 'hout',
    lo: 1.4,
    hi: 5.4,
    patroon: (x, y, z) => {
      const rij = Math.floor(z / 2.4);
      const k = Math.floor((x + (rij % 2) * 2.5) / 5);
      const fz = z / 2.4 - rij;
      if (fz < 0.3) return -1.6;
      return hash(k, rij, 11) % 5 === 0 ? -0.8 : hash(k, rij, 12) % 7 === 0 ? 0.7 : 0;
    },
  };
  mat[M.touw] = { ramp: 'stro', lo: 1.6, hi: 5.2, patroon: (x, y, z) => (Math.sin((x + z) * 2.2) > 0.4 ? -0.7 : 0) };
  mat[M.ijzer] = ijzerM(1);
  mat[M.emmer] = {
    ramp: 'hout',
    lo: 1.4,
    hi: 5.8,
    patroon: (x, y, z) => {
      if (Math.abs(z - 16.6) < 0.5 || Math.abs(z - 20.6) < 0.5) return { ramp: 'ijzer', stap: 3.5 };
      const a = (Math.atan2(y - 5, x) / (Math.PI * 2)) * 10;
      return a - Math.floor(a) < 0.12 ? -1.2 : 0;
    },
  };
  const d = [];
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 15.5, 0, 13.5), g: [0, 0, 7, 21], m: M.steen, deel: 1 });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 10.6, 5, 40), g: [0, 0, 15, 26], m: M.water, deel: 1, uit: true });
  d.push({ f: (x, y, z) => sdf.torus(x, y, z - 13.6, 13, 2.8), g: [0, 0, 13.6, 16.5], m: M.rand, deel: 2, k: 1 });
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 10.8, 0, 5.5), g: [0, 0, 3, 12], m: M.water, deel: 3 });
  for (const s of [-1, 1]) d.push(F.blok([s * 13.4, 0, 29], [1.7, 1.9, 16], 0.4, M.hout, 4));
  d.push(xCilinder([0, 0, 38], 1.1, 15.4, M.hout, 5));
  d.push(xCilinder([0, 0, 38], 3.1, 7, M.hout, 5));
  d.push(xCilinder([0, 0, 38], 3.6, 4.4, M.touw, 5));
  // slinger
  d.push(F.capsule([15, 0, 38], [17.8, 0, 38], 0.8, M.ijzer, 6));
  d.push(F.capsule([17.8, 0, 38], [17.8, 2.4, 32.5], 0.7, M.ijzer, 6));
  d.push(F.capsule([17.8, 2.4, 32.5], [20.6, 2.4, 32.5], 0.9, M.hout, 6));
  // touw en emmer
  d.push(F.capsule([0, 3.6, 37.5], [0, 5, 23], 0.55, M.touw, 7));
  d.push(F.kegel([0, 5, 15.8], [0, 5, 21.2], 3.3, 4.1, M.emmer, 7));
  d.push({ f: (x, y, z) => sdf.torus(x, z - 21.5, y - 5, 3.9, 0.35), g: [0, 5, 22, 5], m: M.ijzer, deel: 7 });
  // dakje
  d.push(kantelBlok([0, -6.4, 50.4], [19.5, 8.8, 1.1], 40, 0.4, M.spaan, 8));
  d.push(kantelBlok([0, 6.4, 50.4], [19.5, 8.8, 1.1], -40, 0.4, M.spaan, 8));
  d.push(xCilinder([0, 0, 56.4], 1.3, 20, M.hout, 8));
  return F.geschaald(F.model(d, mat, { midden: [0, 0, 28], straal: 36 }), schaal);
}

// Een stuk hek van een tegel lang langs de lokale x-as. soort 'latten': een staketsel van
// puntige latten op twee regels; 'balken': twee ruwe liggers tussen dikke palen.
// Draai 'NO' voor een hek langs de wereld-x, 'ZO' langs y.
function hek(soort = 'latten', o = {}) {
  const lang = (o.lang ?? 1) * TEGEL;
  const M = { paal: 0, lat: 1 };
  const mat = [houtM(1, 5.2, 0.7), { ...houtM(1.6, 6, 0.5), patroon: (x, y, z) => (hash(Math.floor(x / 4.6), 3, 17) % 4 === 0 ? -0.6 : 0) }];
  const d = [];
  const L = lang / 2;
  if (soort === 'balken') {
    for (const px of [-L + 1.5, L - 1.5]) d.push(F.blok([px, 0, 15], [2.1, 2.1, 15], 0.7, M.paal, 1));
    for (const [z, zaad] of [[10, 1], [22, 2]]) {
      const dz = (rnd(zaad, 5) - 0.5) * 2;
      d.push(F.capsule([-L + 1, 0.4, z + dz], [L - 1, 0.4, z - dz], 1.35, M.lat, 2));
    }
    return F.model(d, mat, { midden: [0, 0, 15], straal: L + 8 });
  }
  for (const px of [-L + 1.2, L - 1.2]) {
    d.push(F.blok([px, -1.4, 14], [1.6, 1.6, 14], 0.5, M.paal, 1));
    d.push(F.kegel([px, -1.4, 28], [px, -1.4, 31], 1.7, 0.4, M.paal, 1));
  }
  for (const z of [9, 21]) d.push(F.blok([0, -2.4, z], [L - 1, 0.7, 1.1], 0.3, M.paal, 2));
  const n = Math.round(lang / 5.2);
  for (let i = 0; i < n; i++) {
    const px = -L + 3.6 + (i * (lang - 7.2)) / (n - 1);
    const top = 24.5 + (hash(i, 9, 19) % 3) * 0.7;
    d.push(F.blok([px, 0, top / 2 + 1], [1.15, 0.5, top / 2 - 0.6], 0.25, M.lat, 3));
    d.push(F.kegel([px, 0, top], [px, 0, top + 2.6], 1.15, 0.25, M.lat, 3));
  }
  return F.model(d, mat, { midden: [0, 0, 15], straal: L + 8 });
}

// Een boerenkar op twee wielen met spaken, de disselbomen op de grond, en een lading hooi.
// Lokaal: y naar voren (de disselbomen), x dwars.
function kar(o = {}, schaal = 1.7) {
  const M = { hout: 0, wiel: 1, ijzer: 2, hooi: 3, zak: 4 };
  const mat = [];
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1.2,
    hi: 5.8,
    dither: false,
    patroon: (x, y, z, nx, ny, nz) => {
      if (Math.abs(nx) > 0.6) return (z - 12.5) % 3 < 0.5 ? -1.4 : 0; // planken van de zijkant
      if (nz > 0.6) return ((x + 20) % 4.2) < 0.6 ? -1.4 : 0;
      return 0;
    },
  };
  mat[M.wiel] = houtM(1, 5.4, 0.5);
  mat[M.ijzer] = ijzerM(1);
  mat[M.hooi] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.2,
    patroon: (x, y, z) => {
      const s = Math.sin(x * 1.7 + Math.sin(y * 0.8) * 2 + z * 0.4);
      return s > 0.7 ? 0.8 : s < -0.8 ? -1 : 0;
    },
  };
  mat[M.zak] = { ramp: 'jas', lo: 1.8, hi: 6.4, patroon: (x, y, z) => ((Math.floor(x * 1.2) + Math.floor(z * 1.2)) % 2 === 0 ? 0.25 : -0.25) };
  const d = [];
  const by = -3;
  d.push(F.blok([0, by, 15], [9.5, 15, 1.2], 0.3, M.hout, 1));
  for (const s of [-1, 1]) d.push(F.blok([s * 9.8, by, 19.5], [0.8, 15, 4.8], 0.3, M.hout, 1));
  d.push(F.blok([0, by + 14.6, 19.5], [9.4, 0.8, 4.8], 0.3, M.hout, 1));
  d.push(F.blok([0, by - 14.6, 18], [9.4, 0.8, 3.4], 0.3, M.hout, 1));
  // wielen
  for (const s of [-1, 1]) {
    const c = [s * 12.6, by, 11];
    d.push({
      f: (x, y, z) => {
        const q = Math.hypot(y - c[1], z - c[2]) - 10;
        return Math.max(Math.abs(q) - 1.3, Math.abs(x - c[0]) - 1);
      },
      g: [c[0], c[1], c[2], 12],
      m: M.wiel,
      deel: 2 + (s > 0 ? 1 : 0),
    });
    d.push(xCilinder(c, 2.4, 1.8, M.wiel, 2 + (s > 0 ? 1 : 0)));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2;
      d.push(F.capsule(c, [c[0], c[1] + Math.cos(a) * 9.2, c[2] + Math.sin(a) * 9.2], 0.65, M.wiel, 2 + (s > 0 ? 1 : 0)));
    }
    // ijzeren band om het wiel
    d.push({
      f: (x, y, z) => {
        const q = Math.hypot(y - c[1], z - c[2]) - 11.1;
        return Math.max(Math.abs(q) - 0.45, Math.abs(x - c[0]) - 1.1);
      },
      g: [c[0], c[1], c[2], 12.5],
      m: M.ijzer,
      deel: 2 + (s > 0 ? 1 : 0),
    });
  }
  d.push(xCilinder([0, by, 11], 1.1, 12, M.ijzer, 4));
  // disselbomen, met de punten op de grond
  for (const s of [-1, 1]) d.push(F.capsule([s * 6, by + 13, 14.5], [s * 5.2, by + 36, 1.6], 1.1, M.hout, 5));
  d.push(F.capsule([-5.3, by + 33, 3], [5.3, by + 33, 3], 0.8, M.hout, 5));
  // lading
  if (o.lading !== 'leeg') {
    d.push(F.ellips([0, by - 1, 22.5], [8.6, 13.5, 6.5], M.hooi, 6));
    d.push(F.ellips([2, by + 3, 26.5], [5.5, 7, 4], M.hooi, 6, 2));
    d.push(F.ellips([-4.5, by + 9, 25.5], [4.2, 3.6, 4.6], M.zak, 7));
  }
  return F.geschaald(F.model(d, mat, { midden: [0, 4, 16], straal: 38 }), schaal);
}

// Een marktkraam: een toonbank met planken, vier palen, een gestreepte luifel met een geschulpte
// rand, en waar: een kistje appels, kolen, broden en een kruik. Lokaal: y is de klantenkant.
function marktkraam(schaal = 1.5) {
  const M = { hout: 0, doek: 1, rand: 2, appel: 3, kool: 4, brood: 5, kruik: 6, kist: 7 };
  const mat = [];
  mat[M.hout] = {
    ...houtM(1.2, 5.8, 0.6),
    patroon: (x, y, z, nx, ny) => (Math.abs(ny) > 0.6 && ((x + 30) % 5.2) < 0.7 ? -1.4 : 0),
  };
  const streep = (x) => Math.floor((x + 30) / 5.4) % 2 === 0;
  mat[M.doek] = { ramp: 'rood', lo: 1.6, hi: 6.2, patroon: (x, y, z, nx, ny, nz, stap) => (streep(x) ? { ramp: 'perkament', stap: stap - 0.6 } : 0) };
  mat[M.rand] = { ramp: 'rood', lo: 1.4, hi: 5.6, patroon: (x, y, z, nx, ny, nz, stap) => (streep(x) ? { ramp: 'perkament', stap: stap - 0.6 } : 0) };
  mat[M.appel] = { ramp: 'rood', lo: 2.4, hi: 7, glans: 1.2 };
  mat[M.kool] = { ramp: 'blad', lo: 2, hi: 6.6, patroon: (x, y, z) => (Math.sin(Math.atan2(y, x) * 5 + z) > 0.6 ? -0.8 : 0) };
  mat[M.brood] = { ramp: 'zand', lo: 2, hi: 7, patroon: (x, y, z, nx, ny, nz) => (nz > 0.8 && Math.abs(Math.sin(x * 1.1)) < 0.25 ? -1.2 : 0) };
  mat[M.kruik] = { ramp: 'dak', lo: 1.4, hi: 6, glans: 0.8 };
  mat[M.kist] = houtM(1.4, 5.8, 0.6);
  const d = [];
  // toonbank
  d.push(F.blok([0, 3, 17.2], [20.5, 7.5, 1.1], 0.3, M.hout, 1));
  d.push(F.blok([0, 10, 8.5], [20, 0.8, 8.3], 0.3, M.hout, 1));
  for (const s of [-1, 1]) d.push(F.blok([s * 19.6, 3, 8.5], [0.8, 7, 8.3], 0.3, M.hout, 1));
  // palen
  for (const s of [-1, 1]) {
    d.push(F.blok([s * 20.2, 10.4, 22], [1.1, 1.1, 22], 0.3, M.hout, 2));
    d.push(F.blok([s * 20.2, -6, 26], [1.1, 1.1, 26], 0.3, M.hout, 2));
  }
  // luifel en de geschulpte rand
  d.push(kantelBlok([0, 2.6, 47.6], [23, 13.4, 0.6], -21.4, 0.3, M.doek, 3));
  const voorY = 2.6 + 13.4 * Math.cos((21.4 * Math.PI) / 180);
  const voorZ = 47.6 - 13.4 * Math.sin((21.4 * Math.PI) / 180);
  d.push(F.blok([0, voorY, voorZ - 2], [23, 0.45, 2.2], 0.2, M.rand, 3));
  for (let i = 0; i < 9; i++) d.push({ ...F.bol([-20.5 + i * 5.1, voorY, voorZ - 4.2], 2.3, M.rand, 3), f: (x, y, z) => Math.max(sdf.bol(x - (-20.5 + i * 5.1), (y - voorY) * 3, z - (voorZ - 4.2), 2.3) / 3, z - (voorZ - 4)) });
  // waar: een kistje appels
  d.push(F.blok([-12, 4, 20.6], [5.5, 4.5, 2.3], 0.4, M.kist, 4));
  for (let i = 0; i < 8; i++) d.push(F.bol([-15.5 + (i % 4) * 2.4, 2.4 + Math.floor(i / 4) * 3.2, 23.5 + (i % 2) * 0.4], 1.6, M.appel, 5));
  // kolen
  for (const [x, y] of [[-1, 4], [3.6, 6.2], [2.6, 1.6]]) d.push(F.bol([x, y, 21.2], 2.9, M.kool, 6));
  // broden
  for (const [x, y] of [[10.5, 5.8], [15, 4.2], [12.2, 1.4]]) d.push(F.ellips([x, y, 19.6], [2.9, 1.9, 1.5], M.brood, 7));
  // kruik
  d.push(F.kegel([17.6, 1, 18.3], [17.6, 1, 22.5], 2, 1.6, M.kruik, 8));
  d.push(F.kegel([17.6, 1, 22.5], [17.6, 1, 24.5], 1.1, 0.9, M.kruik, 8));
  return F.geschaald(F.model(d, mat, { midden: [0, 2, 26], straal: 36 }), schaal);
}

// Een wegwijzer: een paal met drie pijlen, elk met een regeltje gekrabbelde letters.
// o.pijlen: [graden, ...] (0 = lokaal +x); standaard drie kanten op.
function wegwijzer(o = {}, schaal = 1.3) {
  const M = { paal: 0, bord: 1 };
  const pijlen = o.pijlen || [20, 155, 260];
  const mat = [];
  mat[M.paal] = houtM(1, 5.2);
  mat[M.bord] = {
    ramp: 'perkament',
    lo: 1.4,
    hi: 5.6,
    patroon: (x, y, z, nx, ny, nz) => {
      if (Math.abs(nz) > 0.6) return { ramp: 'hout', stap: 3 };
      // letters: korte streepjes op twee regels
      const r = Math.hypot(x, y);
      const regel = Math.abs(((z % 6.5) + 6.5) % 6.5 - 3.3);
      if (r > 4 && r < 14.5 && regel < 0.6 && Math.sin(r * 2.3 + z) > -0.2) return -2.4;
      return 0;
    },
  };
  const d = [];
  d.push(F.blok([0, 0, 31], [1.5, 1.5, 31], 0.4, M.paal, 1));
  d.push(F.kegel([0, 0, 62], [0, 0, 65], 1.9, 0.3, M.paal, 1));
  pijlen.forEach((graden, i) => {
    const a = (graden * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const z = 55 - i * 6.5;
    d.push(VW.draaiBlok([ux * 8.5, uy * 8.5, z], [7.5, 0.55, 2.4], graden, 0.2, M.bord, 2 + i));
    d.push({
      f: (x, y, zz) => {
        // de punt: een driehoek in het vlak van het bord
        const lx = (x - ux * 16) * ux + (y - uy * 16) * uy;
        const ly = -(x - ux * 16) * uy + (y - uy * 16) * ux;
        const dz = Math.abs(zz - z);
        const drie = Math.max(lx - 3.2 + dz * 1.2, -lx);
        return Math.max(drie, Math.abs(ly) - 0.55, dz - 3.2);
      },
      g: [ux * 17.5, uy * 17.5, z, 5],
      m: M.bord,
      deel: 2 + i,
    });
  });
  return F.geschaald(F.model(d, mat, { midden: [0, 0, 36], straal: 34 }), schaal);
}

// Een bankje van planken met een rugleuning.
function bankje(schaal = 1.6) {
  const M = { hout: 0 };
  const mat = [{ ...houtM(1.2, 5.8, 0.6), patroon: (x, y, z, nx, ny, nz) => (nz > 0.7 && Math.abs(y) < 0.4 ? -1.6 : 0) }];
  const d = [];
  for (const y of [-1.9, 1.9]) d.push(F.blok([0, y, 12.2], [17, 1.7, 0.9], 0.3, M.hout, 1));
  for (const s of [-1, 1]) {
    d.push(F.blok([s * 13, 0.6, 6], [1.2, 3.6, 5.6], 0.3, M.hout, 2));
    d.push(F.blok([s * 13, -4.6, 16], [1.1, 0.8, 5.5], 0.3, M.hout, 2));
  }
  d.push(F.blok([0, -4.8, 20.2], [17.5, 0.8, 2.4], 0.3, M.hout, 3));
  return F.geschaald(F.model(d, mat, { midden: [0, 0, 11], straal: 22 }), schaal);
}

// Een lantaarnpaal: een stenen voet, een houten paal, en bovenop een lantaarn van smeedijzer met
// glas waarachter de vlam brandt. Hij geeft licht.
function lantaarnpaal(schaal = 1.4) {
  const M = { steen: 0, paal: 1, ijzer: 2, glas: 3 };
  const mat = [];
  mat[M.steen] = steenM(1.6, 6.4);
  mat[M.paal] = houtM(1, 5, 0.6);
  mat[M.ijzer] = ijzerM(1.2);
  mat[M.glas] = {
    ramp: 'vuur',
    gloei: (x, y, z, kijk) => klem(3.4 + 2.6 * kijk + (Math.abs(z - 69) < 1.5 ? 1 : 0), 3, 6.4),
  };
  const d = [];
  d.push(F.blok([0, 0, 3.2], [3.4, 3.4, 3.2], 0.8, M.steen, 1));
  d.push(F.blok([0, 0, 33], [1.5, 1.5, 28], 0.4, M.paal, 2));
  d.push(F.blok([0, 0, 62], [2.6, 2.6, 1], 0.3, M.ijzer, 3));
  d.push(F.blok([0, 0, 69], [2.9, 2.9, 5.6], 0.2, M.glas, 4));
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) d.push(F.capsule([sx * 3.1, sy * 3.1, 62.5], [sx * 3.1, sy * 3.1, 75.2], 0.55, M.ijzer, 3));
  d.push(F.kegel([0, 0, 75.4], [0, 0, 80.5], 4.6, 0.8, M.ijzer, 3));
  d.push({ f: (x, y, z) => sdf.torus(x, z - 82, y, 1.4, 0.4), g: [0, 0, 82, 2.5], m: M.ijzer, deel: 3 });
  return F.geschaald(F.model(d, mat, { midden: [0, 0, 42], straal: 44, lichten: [{ pos: [0, 0, 69], r: 95, sterk: 2.2, warm: 1, val: 1.5, zacht: 0.6, eigen: false }] }), schaal);
}

// Een hooibaal, rond, met een touw erom.
function hooibaal(schaal = 1.3) {
  const M = { stro: 0, touw: 1 };
  const mat = [];
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.2,
    patroon: (x, y, z, nx, ny, nz) => {
      if (Math.abs(nx) > 0.7) {
        const r = Math.hypot(y, z - 11);
        return Math.sin(r * 2.2) > 0.6 ? -1 : 0;
      }
      const s = Math.sin(x * 2.1 + Math.sin(z * 0.7) * 1.4);
      return s > 0.72 ? 0.8 : s < -0.8 ? -1 : 0;
    },
  };
  mat[M.touw] = { ramp: 'leer', lo: 1, hi: 4.6 };
  const d = [xCilinder([0, 0, 11], 11, 12, M.stro, 1)];
  d[0].f = ((f) => (x, y, z) => f(x, y, z) - 1.2)(xCilinder([0, 0, 11], 9.8, 10.8, M.stro, 1).f);
  for (const tx of [-5, 5]) {
    d.push({
      f: (x, y, z) => {
        const q = Math.hypot(y, z - 11) - 11.2;
        return Math.max(Math.abs(q) - 0.5, Math.abs(x - tx) - 0.6);
      },
      g: [tx, 0, 11, 12.5],
      m: M.touw,
      deel: 2,
    });
  }
  return F.geschaald(F.model(d, mat, { midden: [0, 0, 11], straal: 18 }), schaal);
}

// ---------------------------------------------------------------- modellen en schaduw

// Een model zetten zoals kamers.zet, maar de plaatsing onthouden: de zonschaduw heeft die nodig.
// Geeft het obj-nummer terug.
function zetModel(B, model, gx, gy, richting = 'Z', o = {}) {
  K.tekenModel(B, model, { gx, gy, richting, z: o.z || 0, omlijn: o.omlijn });
  const obj = B.volgendObj - 1;
  const graden = typeof richting === 'number' ? richting : K.RICHTING[richting];
  const hoek = (graden * Math.PI) / 180;
  const fx = Math.cos(hoek);
  const fy = Math.sin(hoek);
  if (!B.modellen) B.modellen = [];
  B.modellen.push({ model, obj, Ox: gx * TEGEL, Oy: gy * TEGEL, Oz: o.z || 0, fx, fy, rx: -fy, ry: fx, schaduw: o.schaduw !== false });
  return obj;
}

// Raakt een straal vanaf wereldpunt P in richting R een geplaatst model?
function modelRaakt(p, P, R) {
  const dx = P[0] - p.Ox;
  const dy = P[1] - p.Oy;
  const lx = dx * p.rx + dy * p.ry;
  const ly = dx * p.fx + dy * p.fy;
  const lz = P[2] - p.Oz;
  const rx = R[0] * p.rx + R[1] * p.ry;
  const ry = R[0] * p.fx + R[1] * p.fy;
  const rz = R[2];
  const m = p.model;
  const [mx, my, mz] = m.midden;
  const ox = lx - mx;
  const oy = ly - my;
  const oz = lz - mz;
  const b = ox * rx + oy * ry + oz * rz;
  const c = ox * ox + oy * oy + oz * oz - m.straal * m.straal;
  const disc = b * b - c;
  if (disc < 0) return false;
  const s = Math.sqrt(disc);
  let t = Math.max(0, -b - s);
  const eind = -b + s;
  if (eind < 0) return false;
  for (let i = 0; i < 90 && t < eind; i++) {
    const d = m.sdf(lx + rx * t, ly + ry * t, lz + rz * t);
    if (d < 0.12) return true;
    t += Math.max(d * 0.8, 0.35);
  }
  return false;
}

// De zon: elke pixel die naar het licht kijkt, stuurt een straal naar de zon. Raakt die een vorm
// of een ander model, dan ligt de pixel in de schaduw en zakt hij hele stappen (grond twee,
// muren één). Modellen schaduwen zichzelf al in tekenModel. o.zon: de richting naar de zon.
function zonSchaduw(B, vormen, o = {}) {
  const L = o.zon || K.LICHT;
  const kracht = o.kracht ?? 2;
  const modellen = (B.modellen || []).filter((m) => m.schaduw);
  const P = [0, 0, 0];
  const n = B.b * B.h;
  const schaduw = new Uint8Array(n);
  const zon = new Float32Array(n); // hoeveel zon een pixel krijgt, voor avondlicht()
  for (let i = 0; i < n; i++) {
    if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const nx = B.nrm[i * 3];
    const ny = B.nrm[i * 3 + 1];
    const nz = B.nrm[i * 3 + 2];
    const nL = nx * L[0] + ny * L[1] + nz * L[2];
    if (nL <= 0.05) continue;
    zon[i] = nL;
    P[0] = B.pos[i * 3] + nx * 0.8;
    P[1] = B.pos[i * 3 + 1] + ny * 0.8;
    P[2] = B.pos[i * 3 + 2] + nz * 0.8;
    const obj = B.obj[i];
    let raak = false;
    for (const v of vormen) {
      if (straalRaakt(v, P, L)) {
        raak = true;
        break;
      }
    }
    if (!raak) {
      for (const m of modellen) {
        if (m.obj === obj) continue;
        if (modelRaakt(m, P, L)) {
          raak = true;
          break;
        }
      }
    }
    if (!raak) continue;
    schaduw[i] = 1;
    zon[i] = 0;
    // een muur in de schaduw wordt zo donker als de muur die van de zon af staat: één stap;
    // de grond twee. Op een dak is dat te veel: daar wordt een slagschaduw een zwarte baan,
    // dus daar telt hij maar voor de helft.
    const vloer = (B.vlag[i] & VLAG.VLOER) !== 0;
    B.stap[i] -= Math.abs(nz) < 0.3 ? kracht / 2 : vloer ? kracht : kracht * 0.55;
    B.vlag[i] |= VLAG.GLAD;
  }
  B.schaduw = schaduw;
  B.zon = zon;
  return schaduw;
}

// Avondlicht: warm waar de zon valt, koel in de schaduw. Steen in de zon schuift naar de warme
// grijsbeige van 'bot', gras in de schaduw naar het blauwere groen van 'den'. Steeds naar de tint
// met dezelfde lichtheid, dus de vormen blijven gelijk. Na belicht(), voor omlijn().
const NAAR_WARM = {
  steen: ['bot', [0, 0, 1, 2, 3, 3, 4, 5, 6]],
  veldsteen: ['bot', [0, 0, 1, 2, 3, 4, 5, 6, 7]],
  mos: ['mos', [1, 2, 3, 4, 5, 5]], // in de zon een stap lichter, maar wel olijf
  riet: ['stro', [0, 1, 1, 2, 3, 4, 5]],
  aarde: ['zand', [0, 0, 1, 2, 3, 4, 5]],
};
const NAAR_KOEL = {
  gras: ['den', [1, 2, 3, 4, 5, 6, 6, 6]],
  mos: ['den', [1, 2, 3, 4, 5, 6]],
  riet: ['schors', [0, 1, 2, 3, 4, 5, 6]],
  aarde: ['schors', [0, 1, 2, 3, 4, 5, 6]],
};
function avondlicht(B, o = {}) {
  if (!B.zon) return;
  const warm = new Map(Object.entries(o.warm ?? NAAR_WARM).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const koel = new Map(Object.entries(o.koel ?? NAAR_KOEL).map(([van, [naar, tabel]]) => [RAMP[van], [RAMP[naar], tabel]]));
  const drempel = o.drempel ?? 0.3;
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (r < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    const zonnig = B.zon[i] > drempel;
    const kaart = zonnig ? warm.get(r) : B.schaduw && B.schaduw[i] ? koel.get(r) : null;
    if (!kaart) continue;
    const s = B.stap[i];
    const heel = klem(Math.round(s), 0, kaart[1].length - 1);
    B.ramp[i] = kaart[0];
    B.stap[i] = kaart[1][heel] + (s - Math.round(s));
  }
}

// Nevel over de diepte: hoe verder naar achteren, hoe minder verschil er nog tussen licht en
// donker zit. Dat geeft lagen (de voorgrond hard, de verte zacht) en laat meteen de rechte rand
// van het eiland wegvallen. van/tot in tegels diepte (gx + gy), mid = de tint waarnaar alles
// toe kruipt, sterkte = hoeveel er in de verte overblijft (1 = alles nevel).
function nevel(B, o = {}) {
  const van = o.van ?? 0;
  const tot = o.tot ?? -40;
  const mid = o.mid ?? 4;
  const sterkte = o.sterkte ?? 0.65;
  const hoogte = o.hoogte ?? 0;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0 || B.vlag[i] & VLAG.GLOEI) continue;
    const d = (B.pos[i * 3] + B.pos[i * 3 + 1]) / TEGEL;
    let t = klem((van - d) / (van - tot), 0, 1);
    if (hoogte) t *= 1 - klem((B.pos[i * 3 + 2] * PXH - hoogte) / 200, 0, 0.7);
    if (t <= 0) continue;
    const f = t * sterkte;
    B.stap[i] = B.stap[i] * (1 - f) + mid * f;
  }
}

// Contactschaduw: de grond vlak langs de voet van een gebouw is een tint donkerder.
function voetSchaduw(B, gebouwen, o = {}) {
  const r = o.r ?? 8;
  for (let i = 0; i < B.b * B.h; i++) {
    if (!(B.vlag[i] & VLAG.VLOER) || B.pos[i * 3 + 2] > 1) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    for (const g of gebouwen) {
      const [x0, y0, x1, y1] = g.voet;
      const dx = Math.max(x0 - X, 0, X - x1);
      const dy = Math.max(y0 - Y, 0, Y - y1);
      const d = Math.hypot(dx, dy);
      if (d < r + 5 && d > 0) {
        // vlak langs de muur het donkerst, daarbuiten zachter: zo staat een huis op de grond
        B.stap[i] -= d < r * 0.45 ? 2 : d < r ? 1.4 : 0.7;
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- de drie huizen

// Het vakwerkhuisje: witte pleister tussen donkere balken, een dik rieten dak met een versierde
// nok, groene luiken, bloembakken, een bakstenen schoorsteen. 7 × 5 tegels (een tegel is ~80 cm,
// dus 5,6 bij 4 meter), nok langs x: de voordeur zit in de zonnige wand 'y'. De muur is 104
// pixels, de deur 96: de tovenaar (88) kan er net onderdoor.
function vakwerkhuis(gx, gy, o = {}) {
  return huis({
    gx, gy, b: 7, d: 5, nok: 'x', muurH: 126, sokkelH: 44, muur: 'vlecht', dak: 'riet', windveer: true, zaad: o.zaad ?? 3,
    gevel: {
      y: [
        raamElement({ u: 26, b: 26, h: 56, hoog: 30, luiken: 'den', bloembak: true }),
        deurElement({ u: 88, b: 48, hoog: 96 }),
        raamElement({ u: 172, b: 26, h: 56, hoog: 30, luiken: 'den', bloembak: true }),
      ],
      x: [
        raamElement({ u: 30, b: 22, h: 56, hoog: 28, luiken: 'den' }),
        raamElement({ u: 106, b: 22, h: 56, hoog: 28, luiken: 'den', leeg: true }),
        raamElement({ u: 70, b: 20, h: 128, hoog: 24, kol: 2, rijen: 1 }),
      ],
    },
    schoorsteen: { t: 0.8, c: -4, hoog: 30, r: 10, steen: true },
    ...o,
  });
}

// Het stenen huis: veldsteen met hoekstenen, rode holle pannen, wit geschilderde kozijnen, een
// groene deur met een ruitje, rode luiken, een stenen schoorsteen. 6 × 8 tegels, nok langs y:
// de gevel met de voordeur kijkt naar 'y', de lange wand naar 'x'. Anderhalve verdieping: een
// muur van 124 pixels met kleine ramen hoog erin, en de rest van de kamer zit in het dak.
function stenenHuis(gx, gy, o = {}) {
  return huis({
    gx, gy, b: 6, d: 8, nok: 'y', muurH: 124, sokkelH: 16, muur: 'veldsteen', dak: 'pannen', zaad: o.zaad ?? 7,
    gevel: {
      y: [
        raamElement({ u: 26, b: 24, h: 58, hoog: 30, lijst: 'pleister', luiken: 'rood', dorpel: 'steen' }),
        deurElement({ u: 72, b: 48, hoog: 96, ramp: 'den', raampje: true }),
        raamElement({ u: 142, b: 24, h: 58, hoog: 30, lijst: 'pleister', luiken: 'rood', dorpel: 'steen' }),
        raamElement({ u: 84, b: 22, h: 152, hoog: 26, lijst: 'pleister', kol: 2, rijen: 1 }),
      ],
      x: [
        raamElement({ u: 30, b: 24, h: 58, hoog: 30, lijst: 'pleister', dorpel: 'steen', bloembak: true }),
        raamElement({ u: 100, b: 24, h: 58, hoog: 30, lijst: 'pleister', dorpel: 'steen', luiken: 'rood' }),
        raamElement({ u: 170, b: 24, h: 58, hoog: 30, lijst: 'pleister', dorpel: 'steen', luiken: 'rood' }),
        raamElement({ u: 64, b: 18, h: 104, hoog: 18, lijst: 'pleister', kol: 2, rijen: 1, leeg: true }),
        raamElement({ u: 136, b: 18, h: 104, hoog: 18, lijst: 'pleister', kol: 2, rijen: 1 }),
      ],
    },
    schoorsteen: { t: 0.18, c: 0, hoog: 28, r: 11 },
    ...o,
  });
}

// De herberg De Scheve Toren: een stenen benedenverdieping met een staldeur waarvan de bovendeur
// openstaat (binnen brandt het haardvuur), een vakwerk bovenverdieping die over de straat steekt,
// pannen, en het uithangbord. 9 × 7 tegels, nok langs x: de deur zit in de zonnige wand 'y'.
// Twee verdiepingen, muur samen 216 pixels: samen met de kapel het enige trotse huis van het dorp.
function herberg(gx, gy, o = {}) {
  return huis({
    gx, gy, b: 9, d: 7, nok: 'x', dak: 'pannen', sokkelH: 16, zaad: o.zaad ?? 5,
    verdiepingen: [
      {
        muur: 'veldsteen', hoog: 112,
        gevel: {
          y: [
            raamElement({ u: 26, b: 30, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen', gordijn: true }),
            raamElement({ u: 74, b: 30, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen', gordijn: true }),
            deurElement({ u: 128, b: 52, hoog: 100, ramp: 'rood', half: true }),
            raamElement({ u: 202, b: 30, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen', gordijn: true }),
            raamElement({ u: 250, b: 30, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen' }),
          ],
          x: [
            raamElement({ u: 30, b: 28, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen' }),
            raamElement({ u: 98, b: 28, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen' }),
            raamElement({ u: 166, b: 28, h: 56, hoog: 34, kol: 3, lijst: 'pleister', dorpel: 'steen', luiken: 'den' }),
          ],
        },
      },
      {
        muur: 'vakwerk', pleister: 'bot', hoog: 104, uitkraging: 10,
        gevel: {
          y: [
            raamElement({ u: 30, b: 26, h: 146, hoog: 32, bloembak: true }),
            raamElement({ u: 88, b: 26, h: 146, hoog: 32 }),
            raamElement({ u: 146, b: 26, h: 146, hoog: 32, bloembak: true }),
            raamElement({ u: 204, b: 26, h: 146, hoog: 32 }),
            raamElement({ u: 262, b: 26, h: 146, hoog: 32, bloembak: true }),
          ],
          x: [
            raamElement({ u: 34, b: 26, h: 146, hoog: 32, luiken: 'den' }),
            raamElement({ u: 100, b: 26, h: 146, hoog: 32, leeg: true, luiken: 'den' }),
            raamElement({ u: 166, b: 26, h: 146, hoog: 32, luiken: 'den' }),
            raamElement({ u: 102, b: 22, h: 252, hoog: 26, kol: 2, rijen: 1 }),
          ],
        },
      },
    ],
    schoorsteen: { t: 0.18, c: -10, hoog: 34, r: 13, steen: true, rook: true },
    bord: { vlak: 'y', u: 284, h: 130, verdieping: 0 },
    dakkapellen: [{ t: 0.34, b: 44, hoog: 46, raam: { bloembak: false } }, { t: 0.66, b: 44, hoog: 46, raam: { bloembak: true } }],
    ...o,
  });
}

// Rook uit een schoorsteen: vijf plukjes die groter worden en met de wind naar lokaal +x
// afdrijven (zet hem met richting 'N', dan waait hij op het scherm naar rechts). Zonder omlijning.
function rook(zaad = 1) {
  const mat = [{ ramp: 'baard', lo: 2.2, hi: 5.9, schaduwKracht: 0.8, patroon: (x, y, z) => (ruis3(x * 0.3, y * 0.3, z * 0.3, zaad) > 0.68 ? -0.8 : 0) }];
  const d = [];
  const plukken = [[0, 0, 3.5, 3.2], [2, -0.5, 11, 4.2], [6.5, -1, 19, 5.2], [13, -1.5, 26, 5.6], [21, -2, 31.5, 5], [28.5, -2.4, 35.5, 3.8]];
  plukken.forEach(([x, y, z, r], i) => d.push(F.bol([x + (rnd(zaad, i) - 0.5) * 2, y, z], r, 0, 1, 1.6)));
  return F.model(d, mat, { midden: [13, -1, 19], straal: 32 });
}

// ------------------------------------------------- het werk op het erf

// Een stapel volle zakken, zoals die bij de bakker en de molen staan: grof linnen, dichtgebonden.
function zakken(zaad = 1) {
  const M = { linnen: 0, touw: 1 };
  const mat = [];
  mat[M.linnen] = {
    ramp: 'jas',
    lo: 1.8,
    hi: 6.2,
    patroon: (x, y, z) => {
      const n = ruis3(x * 0.55, y * 0.55, z * 0.55, zaad);
      return (n > 0.66 ? 0.6 : n < 0.36 ? -0.8 : 0) + (hash(Math.floor(x * 1.4), Math.floor(z * 1.4 + y), zaad + 3) % 13 === 0 ? -0.8 : 0);
    },
  };
  mat[M.touw] = { ramp: 'stro', lo: 1.6, hi: 4.6 };
  const d = [];
  const plek = [[-9, 2, 0, 1], [3, -2, 0, 2], [10, 4, 0, 3], [-2, 3, 13, 4]];
  for (const [x, y, z, k] of plek) {
    const r = 7 + (rnd(zaad, k) - 0.5) * 1.6;
    d.push(F.ellips([x, y, z + 7], [r, r * 0.8, 7.5], M.linnen, k, 2.5));
    d.push(F.kegel([x, y, z + 12], [x + (rnd(zaad, k + 9) - 0.5) * 3, y, z + 16], 2.6, 1.6, M.linnen, k));
    d.push(F.kegel([x, y, z + 14.4], [x, y, z + 15.4], 2.1, 2.1, M.touw, k));
  }
  return F.model(d, mat, { midden: [0, 1, 9], straal: 26 });
}

// Een hoop houtskool bij de smidse, met een schep erin.
function kolenhoop(zaad = 1) {
  const M = { kool: 0, steel: 1, ijzer: 2 };
  const mat = [];
  mat[M.kool] = {
    ramp: 'inkt',
    lo: 0.6,
    hi: 3.4,
    patroon: (x, y, z, nx, ny, nz) => {
      const h = hash(Math.floor(x * 1.6), Math.floor(y * 1.6 + z * 2), zaad + 5);
      if (h % 9 === 0) return { ramp: 'vuur', stap: 1 };
      return h % 3 === 0 ? 0.8 : ruis3(x * 0.8, y * 0.8, z * 0.8, zaad) > 0.6 ? -0.8 : 0;
    },
  };
  mat[M.steel] = { ramp: 'hout', lo: 2, hi: 5.4 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.6, hi: 5.4 };
  const d = [];
  d.push(F.ellips([0, 0, 1], [16, 13, 10], M.kool, 1));
  d.push(F.ellips([7, -4, 2], [8, 7, 6], M.kool, 1));
  d.push(F.capsule([-4, 2, 9], [-12, 7, 34], 1.1, M.steel, 2));
  d.push(F.blok([-3, 1.4, 7], [4, 3, 0.6], 0.4, M.ijzer, 3));
  return F.model(d, mat, { midden: [0, 0, 10], straal: 28 });
}

// Een zaagbok met een stam erop, en zaagsel eronder: het erf van wie hout klooft.
function zaagbok(zaad = 1) {
  const M = { hout: 0, stam: 1, zaag: 2 };
  const mat = [];
  mat[M.hout] = { ramp: 'hout', lo: 1.6, hi: 5.4, patroon: (x, y, z) => (((z * 0.8 + x) % 6) < 0.8 ? -0.8 : 0) };
  mat[M.stam] = { ramp: 'schors', lo: 1.2, hi: 5, patroon: (x, y, z, nx, ny, nz) => (Math.abs(ny) > 0.6 ? { ramp: 'zand', stap: 4.4 } : ruis2(x * 0.8, z * 0.8, zaad) > 0.6 ? -1 : 0) };
  mat[M.zaag] = { ramp: 'ijzer', lo: 2, hi: 5.6, glans: 1.2 };
  const d = [];
  for (const y of [-7, 7]) {
    d.push(F.kegel([-5, y - 3, 0], [3, y + 2, 18], 1.5, 1.3, M.hout, 1));
    d.push(F.kegel([5, y - 3, 0], [-3, y + 2, 18], 1.5, 1.3, M.hout, 1));
  }
  d.push(F.kegel([0, -13, 20], [0, 13, 20], 4.4, 4.4, M.stam, 2));
  d.push(F.blok([1, 0, 24], [0.3, 6, 2.2], 0.2, M.zaag, 3));
  return F.model(d, mat, { midden: [0, 0, 12], straal: 22 });
}

// ------------------------------------------------- de rommel tegen de muur

// Een stapel gekloofd haardhout: vier lagen ronde blokken met het kopse hout naar voren, en er
// een paar scheef bovenop. Bij elk huis met een haard hoort zo'n stapel tegen de muur.
function houtstapel(zaad = 1) {
  const M = { hout: 0 };
  const mat = [];
  mat[M.hout] = {
    ramp: 'schors',
    lo: 1.2,
    hi: 5.4,
    patroon: (x, y, z, nx, ny, nz) => {
      if (ny > 0.55) {
        // de kopse kant: licht spinthout met een scheur
        const c = hash(Math.round(x / 7), Math.round(z / 7), zaad + 3);
        const sp = ((Math.floor(x) + Math.floor(z) * (c % 3 === 0 ? 1 : -1)) % 7 + 7) % 7 < 1;
        return { ramp: 'zand', stap: sp ? 2.6 : 4.4 + (c % 4) * 0.3 };
      }
      return ruis2(x * 0.8, z * 0.8, zaad) > 0.58 ? -1 : 0;
    },
  };
  const d = [];
  const L = 17; // half zo lang als een blok
  let n = 0;
  for (let rij = 0; rij < 4; rij++) {
    const breed = 5 - (rij > 2 ? 1 : 0);
    for (let k = 0; k < breed; k++) {
      const r = 3.4 + (rnd(zaad, n) - 0.5) * 0.9;
      const x = -17 + k * 8.6 + (rij % 2) * 2.2 + (rnd(zaad, n + 40) - 0.5) * 1.4;
      const z = 3.6 + rij * 6.4;
      const y = (rnd(zaad, n + 80) - 0.5) * 3;
      d.push(F.kegel([x, y - L, z], [x, y + L, z], r, r, M.hout, 1));
      n++;
    }
  }
  // twee blokken schuin bovenop
  d.push(F.kegel([-9, -2, 30], [6, 3, 32], 3.4, 3.4, M.hout, 1));
  d.push(F.kegel([4, -6, 31], [16, 1, 28], 3.2, 3.2, M.hout, 1));
  return F.model(d, mat, { midden: [0, 0, 16], straal: 34 });
}

// Een mesthoop achter het huis: stro en mest, met een riek erin. Niet fraai, wel middeleeuws.
function mesthoop(zaad = 1) {
  const M = { mest: 0, steel: 1, ijzer: 2 };
  const mat = [];
  mat[M.mest] = {
    ramp: 'aarde',
    lo: 0.6,
    hi: 3.6,
    patroon: (x, y, z, nx, ny, nz) => {
      const h = hash(Math.floor(x * 1.3), Math.floor(y * 1.3 + z), zaad + 7);
      if (h % 7 === 0) return { ramp: 'stro', stap: 2 + (h % 3) };
      return ruis2(x * 0.5, y * 0.5, zaad) > 0.6 ? -0.8 : 0;
    },
  };
  mat[M.steel] = { ramp: 'hout', lo: 2, hi: 5.6 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.6, hi: 5 };
  const d = [];
  d.push(F.ellips([0, 0, 2], [21, 16, 11], M.mest, 1));
  d.push(F.ellips([9, -5, 3], [11, 9, 7], M.mest, 1));
  d.push(F.capsule([6, 4, 8], [15, 10, 40], 1.1, M.steel, 2));
  for (let k = -1; k <= 1; k++) d.push(F.capsule([6 + k * 2.4, 4 - k * 0.6, 8], [4 + k * 2.6, 3 - k * 0.7, 1], 0.7, M.ijzer, 3));
  return F.model(d, mat, { midden: [4, 0, 12], straal: 34 });
}

// Een afdakje tegen een muur: twee palen, een schuin dak van planken, en er brandhout onder.
// Zet hem met de open kant naar de kijker (richting 'ZO' of 'ZW').
function afdak(zaad = 1) {
  const M = { paal: 0, plank: 1, hout: 2 };
  const mat = [];
  mat[M.paal] = { ramp: 'schors', lo: 1.4, hi: 5, patroon: (x, y, z) => (((z * 0.9 + x) % 5) < 1 ? -0.8 : 0) };
  mat[M.plank] = { ramp: 'hout', lo: 1.6, hi: 5.8, patroon: (x, y, z) => ((((x + 60) % 7) < 0.7 ? -1.4 : 0) + (ruis2(x * 0.4, y * 0.4, zaad) > 0.7 ? -0.7 : 0)) };
  mat[M.hout] = { ramp: 'schors', lo: 1.2, hi: 5, patroon: (x, y, z, nx, ny, nz) => (ny > 0.55 ? { ramp: 'zand', stap: 4.2 } : 0) };
  const d = [];
  for (const x of [-24, 24]) d.push(F.kegel([x, 18, 0], [x, 18, 40], 2.6, 2.4, M.paal, 1));
  for (const x of [-24, 24]) d.push(F.kegel([x, -18, 0], [x, -18, 54], 2.6, 2.4, M.paal, 1));
  // het schuine dak: een plaat die naar voren afloopt
  d.push(F.gekanteld(F.blok([0, 0, 48], [28, 21, 1.8], 0.4, M.plank, 2), [1, 0, 0], -21, [0, 0, 48]));
  // wat hout eronder
  for (let k = 0; k < 4; k++) d.push(F.kegel([-18 + k * 9, -6 - (k % 2) * 3, 4], [-18 + k * 9, 12 - (k % 2) * 3, 4], 3.4, 3.4, M.hout, 3));
  for (let k = 0; k < 3; k++) d.push(F.kegel([-13 + k * 9, -4, 10.6], [-13 + k * 9, 12, 10.6], 3.2, 3.2, M.hout, 3));
  return F.model(d, mat, { midden: [0, 0, 26], straal: 44 });
}

// Het aambeeld op een eiken stronk, met een hamer erop.
function aambeeld() {
  const M = { ijzer: 0, stronk: 1, steel: 2 };
  const mat = [];
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.8, hi: 5.6, glans: 1.6, glansMacht: 14 };
  mat[M.stronk] = {
    ramp: 'schors',
    lo: 1,
    hi: 5.4,
    patroon: (x, y, z, nx, ny, nz) => {
      if (nz > 0.7) {
        const r = Math.hypot(x, y);
        return { ramp: 'hout', stap: 3.4 + (Math.sin(r * 1.6) > 0.5 ? -1 : 0) };
      }
      return Math.sin(Math.atan2(y, x) * 9) > 0.6 ? -1 : 0;
    },
  };
  mat[M.steel] = houtM(2, 6);
  const d = [];
  d.push({ f: (x, y, z) => sdf.cilinder(x, y, z, 8.5, 0, 16), g: [0, 0, 8, 12], m: M.stronk, deel: 1 });
  d.push(F.blok([0, 0, 18], [5.5, 3.8, 2], 0.5, M.ijzer, 2));
  d.push(F.blok([0, 0, 22], [3, 2.3, 2.6], 0.4, M.ijzer, 2));
  d.push(F.blok([0, 0, 26.6], [7.5, 3.5, 2.2], 0.5, M.ijzer, 2));
  d.push(F.kegel([-7.2, 0, 27.4], [-14.5, 0, 28.6], 2.5, 0.4, M.ijzer, 2));
  d.push(F.blok([8.4, 0, 27.3], [1.5, 2.7, 1.5], 0.4, M.ijzer, 2));
  // hamer
  d.push(F.capsule([1, 1.2, 29.6], [9.5, 5.6, 29.6], 0.65, M.steel, 3));
  d.push(F.blok([0.2, 0.8, 30], [1.8, 1.2, 1.2], 0.3, M.ijzer, 3));
  return F.model(d, mat, { midden: [-2, 0, 16], straal: 20 });
}

// De smidse: een stenen werkplaats onder leien, met een open voorkant. Binnen, in het donker
// onder het dak, gloeit de haard: rode kolen in een bakstenen haard met een kap en een
// schoorsteen door het dak. Het licht valt op het aambeeld, de achterwand met de tangen en
// hamers, en de aangestampte vloer. 3 × 2 tegels, nok langs x, open in de zonnige wand 'y'.
function smidse(gx, gy, o = {}) {
  const T = TEGEL;
  const H = 114;
  const open = { u: 30, b: 164, hoog: 96 };
  const g = huis({
    gx, gy, b: 7, d: 5, nok: 'x', dak: 'leien', sokkelH: 16, zaad: o.zaad ?? 11,
    verdiepingen: [
      {
        muur: 'veldsteen', hoog: H,
        gevel: {
          y: [openElement(open)],
          x: [raamElement({ u: 44, b: 22, h: 54, hoog: 26, lijst: 'hout', dorpel: 'steen', donker: true, luiken: 'hout' }), raamElement({ u: 112, b: 22, h: 54, hoog: 26, lijst: 'hout', dorpel: 'steen', donker: true, luiken: 'hout' })],
        },
      },
    ],
    ...o,
  });
  const x0 = (gx - 0.5) * T;
  const x1 = (gx + 6.5) * T;
  const y0 = (gy - 0.5) * T;
  const y1 = (gy + 4.5) * T;
  const xl = x0 + open.u / SQ;
  const xr = x0 + (open.u + open.b) / SQ;
  const yb = y1 - 76; // de binnenkant van de achterwand van de open travee
  const D = { vloer: 10, wand: 11, haard: 12, kap: 13 };
  // aangestampte vloer met roet en schilfers ijzer
  const vloerTex = (vlak, X, Y) => {
    const qx = roosterX(X, Y);
    const qy = roosterY(X, Y);
    UIT.ramp = RAMP.aarde;
    const n = ruis2(X * 0.06, Y * 0.06, 171);
    UIT.stap = n < 0.4 ? 1 : 2;
    const h = hash(qx, qy, 173) % 41;
    if (h === 0) {
      UIT.ramp = RAMP.ijzer;
      UIT.stap = 3;
    } else if (h < 3) UIT.stap = 3;
  };
  // de binnenmuren: veldsteen, bovenin zwart van het roet, en aan de zijwand (die je door de
  // opening ziet) een rek met tangen, een hamer en hoefijzers
  const gereedschap = (u, h) => {
    const ui = Math.floor(u);
    const hi = Math.floor(h);
    if (hi >= 60 && hi < 62 && ui >= 58 && ui < 96) return ['hout', hi === 61 ? 3 : 1];
    const haak = [62, 68, 75, 82, 89];
    for (let k = 0; k < haak.length; k++) {
      const hu = ui - haak[k];
      if (k % 2 === 0) {
        // een tang: twee benen die onderaan uit elkaar gaan
        const t = 60 - hi;
        if (t >= 0 && t < 20 && (hu === Math.floor(t / 9) * -1 || hu === 1 + Math.floor(t / 9))) return ['ijzer', 2 + (t < 3 ? 1 : 0)];
      } else if (k === 1) {
        // een hamer
        if (hu === 0 && hi < 60 && hi >= 47) return ['hout', 2];
        if (hu >= -2 && hu <= 2 && hi >= 44 && hi < 47) return ['ijzer', hi === 46 ? 4 : 2];
      } else {
        // twee hoefijzers boven elkaar
        for (const top of [56, 48]) {
          const dy = top - hi;
          if (dy >= 0 && dy < 5 && hu >= -2 && hu <= 2 && (Math.abs(hu) === 2 || dy === 4)) return ['ijzer', 3];
        }
      }
    }
    return null;
  };
  const binnenTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 1;
      return;
    }
    const u = vlak === 'y' ? (X - x0) * SQ : (y1 - Y) * SQ;
    if (vlak === 'x') {
      const gr = gereedschap(u + 52, h + 16);
      if (gr) {
        // donker tegen de verlichte muur: het licht van de haard telt hier niet mee
        UIT.ramp = RAMP[gr[0]];
        UIT.stap = gr[1] - 1;
        UIT.vlag = VLAG.VAST;
        return;
      }
    }
    veldsteenPixel(u + (vlak === 'y' ? 0 : 200), h, 9999, vlak === 'y' ? 4 : 3, (o.zaad ?? 11) + 60, false);
    if (h > 46) UIT.stap -= 1; // roet
    if (h > 62) UIT.stap -= 1;
  };
  g.vormen.push(blok(xl / T, yb / T, xr / T, (y1 - 1) / T, 0, 1, vloerTex, { deel: D.vloer }));
  g.vormen.push(blok(xl / T, (yb - 8) / T, xr / T, yb / T, 0, H, binnenTex, { deel: D.wand }));
  g.vormen.push(blok((xl - 8) / T, yb / T, xl / T, (y1 - 1) / T, 0, H, binnenTex, { deel: D.wand }));
  // de haard: baksteen, bovenop een bed van gloeiende kolen, onderin een donker aslok
  const fx0 = xl + 18;
  const fx1 = fx0 + 52;
  const fy1 = yb + 34;
  const haardTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      const rand = Math.min(X - fx0, fx1 - X, Y - yb, fy1 - Y);
      if (rand < 3.5) {
        UIT.ramp = RAMP.rood;
        UIT.stap = 3;
        return;
      }
      const qx = roosterX(X, Y);
      const qy = roosterY(X, Y + Z);
      const n = ruis2(X * 0.25, Y * 0.25, 175);
      const kool = hash(qx >> 1, qy, 177) % 5;
      UIT.ramp = RAMP.vuur;
      UIT.stap = klem(2 + n * 4 + (kool === 0 ? -2 : kool === 1 ? 1 : 0), 0, 7);
      if (kool === 0 && n < 0.5) {
        UIT.ramp = RAMP.inkt;
        UIT.stap = 2;
      }
      UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
      return;
    }
    const u = vlak === 'y' ? (X - fx0) * SQ : (fy1 - Y) * SQ;
    // het aslok onderin de voorkant
    if (vlak === 'y' && u > 8 && u < 18 && h < 10) {
      UIT.ramp = RAMP.vuur;
      UIT.stap = h < 3 ? 2 : 1;
      UIT.vlag = VLAG.GLOEI | VLAG.GLAD;
      if (h >= 8) {
        UIT.ramp = RAMP.inkt;
        UIT.stap = 1;
        UIT.vlag = 0;
      }
      return;
    }
    baksteenPixel(u, h, vlak === 'y' ? 4 : 3);
  };
  g.vormen.push(blok(fx0 / T, yb / T, fx1 / T, fy1 / T, 0, 20, haardTex, { deel: D.haard }));
  // de kap boven de haard, en de schoorsteen door het dak
  const kapTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    const u = vlak === 'y' ? X * SQ : -Y * SQ;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 1;
      return;
    }
    baksteenPixel(u, h, vlak === 'y' ? 3 : 2);
    if (h < 50) UIT.stap -= 1;
  };
  g.vormen.push(blok((fx0 - 4) / T, yb / T, (fx1 + 4) / T, (fy1 + 3) / T, 54, 68, kapTex, { deel: D.kap }));
  const schTex = (vlak, X, Y, Z) => {
    const h = Z * PXH;
    if (vlak === 'z') {
      UIT.ramp = RAMP.steen;
      UIT.stap = 0;
      return;
    }
    const u = vlak === 'y' ? X * SQ : -Y * SQ;
    baksteenPixel(u, h, vlak === 'y' ? 5 : 3);
  };
  const sx0 = fx0 + 9;
  const sx1 = fx1 - 9;
  g.vormen.push(blok(sx0 / T, (yb + 1) / T, sx1 / T, (yb + 19) / T, 68, 214, schTex, { deel: D.kap }));
  g.vormen.push(
    blok((sx0 - 1.5) / T, (yb - 0.5) / T, (sx1 + 1.5) / T, (yb + 20.5) / T, 214, 217, (vlak) => {
      UIT.ramp = RAMP.steen;
      UIT.stap = vlak === 'z' ? 7 : vlak === 'y' ? 6 : 4;
    }, { deel: D.kap }),
  );
  // het aambeeld en een ton water
  g.modellen.push({ model: aambeeld(), gx: (fx1 + 42) / T, gy: (yb + 52) / T, richting: 'ZO', z: 1 / PXH });
  g.modellen.push({ model: VW.ton(), gx: (xr - 26) / T, gy: (yb + 56) / T, richting: 'ZO', z: 0 });
  // het licht van de haard
  g.lichten.push({ pos: [(fx0 + fx1) / 2, (yb + fy1) / 2 + 4, 30 / PXH], r: 190, sterk: 4.4, warm: 1, val: 1.2, zacht: 0.4 });
  return g;
}

// De toren van de oude meester, klein en in lage contrasten aan de horizon: iets om naar te
// kijken. Het is niet de echte toren uit toren.cjs maar een silhouet, zodat hij ver weg lijkt.
function verreToren(zaad = 1) {
  const M = { steen: 0, dak: 1, hout: 2 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.8,
    hi: 4.6,
    patroon: (x, y, z) => {
      const rij = Math.floor(z / 7);
      const kol = Math.floor((Math.atan2(y, x) * 9 + rij * 0.5) * 1);
      return (z % 7 < 0.8 ? -1 : 0) + (hash(kol, rij, zaad) % 5 === 0 ? -0.6 : 0);
    },
  };
  mat[M.dak] = { ramp: 'dak', lo: 1.4, hi: 3.8, patroon: (x, y, z) => (z % 5 < 0.9 ? -0.8 : 0) };
  mat[M.hout] = { ramp: 'schors', lo: 1.4, hi: 4 };
  const d = [];
  d.push(F.kegel([0, 0, 0], [0, 0, 150], 26, 21, M.steen, 1));
  d.push(F.kegel([0, 0, 149], [0, 0, 206], 26, 0.6, M.dak, 2));
  d.push(F.blok([0, -21, 96], [5, 2, 7], 0.5, M.hout, 3));
  d.push(F.blok([21, 0, 118], [2, 5, 7], 0.5, M.hout, 3));
  return F.model(d, mat, { midden: [0, 0, 90], straal: 115 });
}

// ------------------------------------------------- aanbouw en erfgoed

// Een luifel boven de deur: twee palen en een schuin plankendak. Zet hem met de open kant naar
// de kijker, vlak voor de gevel.
function luifel(zaad = 1) {
  const M = { paal: 0, plank: 1 };
  const mat = [];
  mat[M.paal] = { ramp: 'schors', lo: 1.4, hi: 5, patroon: (x, y, z) => (((z * 0.9 + x) % 5) < 1 ? -0.8 : 0) };
  mat[M.plank] = { ramp: 'hout', lo: 1.6, hi: 5.6, patroon: (x, y, z) => ((((x + 60) % 6) < 0.7 ? -1.4 : 0) + (ruis2(x * 0.4, y * 0.4, zaad) > 0.72 ? -0.7 : 0)) };
  const d = [];
  for (const x of [-17, 17]) d.push(F.kegel([x, 15, 0], [x + 1, 15, 62], 2.4, 2.1, M.paal, 1));
  d.push(F.gekanteld(F.blok([0, 6, 70], [20, 15, 1.6], 0.4, M.plank, 2), [1, 0, 0], -26, [0, 0, 70]));
  d.push(F.kegel([-18, 15, 60], [18, 15, 60], 1.6, 1.6, M.paal, 1));
  return F.model(d, mat, { midden: [0, 8, 40], straal: 44 });
}

// Een hijsbalk onder de nok, met een katrol en een touw: bij een huis met een luik in de gevel.
function hijsbalk(zaad = 1) {
  const M = { hout: 0, touw: 1, ijzer: 2 };
  const mat = [];
  mat[M.hout] = { ramp: 'schors', lo: 1.6, hi: 5, patroon: (x, y, z) => (((x * 0.7 + z) % 5) < 0.8 ? -0.7 : 0) };
  mat[M.touw] = { ramp: 'stro', lo: 2, hi: 5 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 2, hi: 5.4 };
  const d = [];
  d.push(F.blok([0, -9, 0], [2.6, 13, 2.2], 0.4, M.hout, 1));
  d.push(F.kegel([0, -20, -1.6], [0, -20, -3.4], 2.6, 2.6, M.ijzer, 2));
  d.push(F.capsule([0, -20, -3.4], [0, -20, -26], 0.7, M.touw, 3));
  d.push(F.blok([0, -20, -28], [2.4, 1.4, 2.4], 0.4, M.hout, 3));
  return F.model(d, mat, { midden: [0, -12, -10], straal: 32 });
}

// Een schoor tegen een muur die begint te zakken: een scheve paal met een steen eronder.
function schoorpaal(zaad = 1) {
  const M = { paal: 0, steen: 1 };
  const mat = [];
  mat[M.paal] = { ramp: 'schors', lo: 1.4, hi: 5, patroon: (x, y, z) => (ruis2(x * 0.6, z * 0.6, zaad) > 0.6 ? -1 : 0) };
  mat[M.steen] = { ramp: 'steen', lo: 2, hi: 6 };
  const d = [];
  d.push(F.kegel([0, 0, 2], [-2, -17, 56], 2.8, 2.2, M.paal, 1));
  d.push(F.ellips([0, 1, 1], [5, 4.5, 2.6], M.steen, 2));
  return F.model(d, mat, { midden: [-1, -8, 28], straal: 34 });
}

// Een bijenkorf van gevlochten stro, op een plankje.
function bijenkorf(zaad = 1) {
  const M = { stro: 0, plank: 1 };
  const mat = [];
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.8,
    hi: 5.4,
    patroon: (x, y, z) => ((z % 4 < 0.9 ? -1.2 : 0) + (hash(Math.floor(x * 1.3), Math.floor(z * 1.3), zaad) % 7 === 0 ? -0.6 : 0)),
  };
  mat[M.plank] = { ramp: 'hout', lo: 1.4, hi: 4.6 };
  const d = [];
  d.push(F.blok([0, 0, 1], [9, 9, 1], 0.3, M.plank, 1));
  d.push({ f: (x, y, z) => Math.max(sdf.ellipsoide(x, y, z - 2, 8, 8, 15), 2 - z), g: [0, 0, 9, 17], m: M.stro, deel: 2 });
  return F.model(d, mat, { midden: [0, 0, 9], straal: 20 });
}

// Een kippenren: een lage omheining van stokken met een hokje in de hoek.
function kippenren(zaad = 1) {
  const M = { stok: 0, plank: 1, stro: 2 };
  const mat = [];
  mat[M.stok] = { ramp: 'schors', lo: 1.4, hi: 4.6 };
  mat[M.plank] = { ramp: 'hout', lo: 1.6, hi: 5.2, patroon: (x, y, z) => (((x + 40) % 5) < 0.7 ? -1.2 : 0) };
  mat[M.stro] = { ramp: 'riet', lo: 2, hi: 5.4, patroon: (x, y, z) => (hash(Math.floor(x), Math.floor(y + z), zaad) % 5 === 0 ? -1 : 0) };
  const d = [];
  const R = 26;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    if (x > 8 && y < -8) continue; // de opening naar het hok
    d.push(F.kegel([x, y, 0], [x + (rnd(zaad, i) - 0.5) * 2, y, 15 + rnd(zaad, i + 20) * 4], 1.1, 0.9, M.stok, 1));
  }
  for (const h of [6, 12]) d.push({ f: (x, y, z) => Math.max(Math.abs(Math.hypot(x, y) - R) - 0.7, Math.abs(z - h) - 0.7), g: [0, 0, h, R + 2], m: M.stok, deel: 1 });
  d.push(F.blok([15, -15, 9], [9, 8, 9], 0.6, M.plank, 2));
  d.push(F.gekanteld(F.blok([15, -15, 19], [10.5, 9.5, 1.4], 0.4, M.stro, 2), [1, 0, 0], -18, [15, -15, 19]));
  return F.model(d, mat, { midden: [0, 0, 10], straal: 34 });
}

// Waar een huis is afgebrand: de veldstenen voet staat er nog, met zwarte stompen van de
// stijlen, as, en een enkele verkoolde balk. Er groeit alweer onkruid tussen.
function brandplek(zaad = 1) {
  const M = { steen: 0, kool: 1, as: 2 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.6,
    hi: 5.6,
    patroon: (x, y, z) => (hash(Math.floor(x / 5), Math.floor(y / 5 + z), zaad) % 4 === 0 ? -1 : 0),
  };
  mat[M.kool] = {
    ramp: 'inkt',
    lo: 0.4,
    hi: 2.6,
    patroon: (x, y, z) => (hash(Math.floor(x * 1.5), Math.floor(z * 1.5), zaad + 3) % 5 === 0 ? 1 : 0),
  };
  mat[M.as] = { ramp: 'steen', lo: 0.8, hi: 3, patroon: (x, y, z) => (ruis2(x * 0.4, y * 0.4, zaad) > 0.6 ? -0.8 : 0) };
  const d = [];
  const B = 44;
  const D = 34;
  for (const [a, b, c, e] of [[-B, -D, B, -D + 7], [-B, D - 7, B, D], [-B, -D, -B + 7, D], [B - 7, -D, B, D]]) {
    d.push(F.blok([(a + c) / 2, (b + e) / 2, 3], [(c - a) / 2, (e - b) / 2, 4], 0.6, M.steen, 1));
  }
  d.push(F.ellips([0, 0, 0.5], [B - 9, D - 9, 2], M.as, 2));
  const stomp = [[-30, -22, 22], [26, -24, 14], [-28, 20, 17], [30, 18, 9], [4, -26, 11]];
  stomp.forEach(([x, y, h], i) => d.push(F.kegel([x, y, 1], [x + (rnd(zaad, i) - 0.5) * 5, y, h], 3, 2.2, M.kool, 3 + i)));
  d.push(F.kegel([-24, -6, 4], [18, 10, 3], 2.6, 2.2, M.kool, 9));
  return F.model(d, mat, { midden: [0, 0, 8], straal: 62 });
}

// ------------------------------------------------- een dorpshuis per zaad

// Een huis zoals er in een dorp een paar staan dat over een eeuw gegroeid is: het zaad kiest de
// plattegrond, de nok, de wand, het dak, de hoogte, de ramen en wat er tegenaan gebouwd is.
// Geeft één gebouw terug; een L-vorm zit als tweede vleugel in dezelfde vormen.
function dorpshuis(gx, gy, zaad = 1, o = {}) {
  const r = (k) => rnd(zaad, k);
  const kies = (k, lijst) => lijst[Math.min(Math.floor(r(k) * lijst.length), lijst.length - 1)];
  const maten = [[4, 6], [5, 7], [6, 8], [7, 5], [6, 9], [5, 6], [8, 6]];
  const [b, d] = o.maat || kies(1, maten);
  const nok = b >= d ? 'x' : 'y';
  const muur = o.muur || kies(2, ['vlecht', 'vlecht', 'planken', 'planken', 'blokhut', 'veldsteen']);
  const hout = o.hout || kies(3, ['schors', 'hout', 'schors']);
  const dak = o.dak || kies(4, ['riet', 'riet', 'riet', 'riet', 'riet', 'spanen', 'pannen']);
  const oud = r(5) > 0.55;
  const muurH = o.muurH || Math.round((dak === 'riet' ? 116 : 98) + r(6) * 26);
  const zaadH = zaad * 7 + 3;
  // de wanden in schermpixels: de gevel met de deur is 'y', de lange zijkant 'x'
  const Wy = b * 32;
  const Wx = d * 32;
  // --- de voorgevel: een deur en er ramen naast, soms een schuurdeur
  const schuur = r(7) > 0.78;
  const deurB = schuur ? 66 : 44 + Math.round(r(8) * 8);
  const deurU = Math.round(Wy * (0.3 + r(9) * 0.34));
  const gy_ = [];
  const ramenY = 1 + Math.floor(r(10) * 2.6);
  for (let i = 0; i < ramenY; i++) {
    const u = Math.round(12 + (i * (Wy - 40)) / Math.max(1, ramenY - 0.001));
    if (u + 26 > deurU - 6 && u < deurU + deurB + 6) continue;
    gy_.push(raamElement({ u, b: 22 + Math.round(r(11 + i) * 6), h: 50 + Math.round(r(20 + i) * 12), hoog: 24 + Math.round(r(30 + i) * 8), luiken: r(40 + i) > 0.45 ? (hout === 'schors' ? 'hout' : 'den') : null, leeg: r(50 + i) > 0.7, bloembak: r(60 + i) > 0.75 }));
  }
  gy_.push(deurElement({ u: deurU, b: deurB, hoog: schuur ? 108 : 92 + Math.round(r(12) * 8), ramp: hout === 'schors' ? 'schors' : 'hout' }));
  // --- de zijgevel: kleine ramen, en soms een luik met een hijsbalk in de top
  const gx_ = [];
  const ramenX = 1 + Math.floor(r(13) * 2.4);
  for (let i = 0; i < ramenX; i++) {
    const u = Math.round(20 + (i * (Wx - 50)) / Math.max(1, ramenX - 0.001));
    gx_.push(raamElement({ u, b: 20 + Math.round(r(70 + i) * 6), h: 50 + Math.round(r(80 + i) * 10), hoog: 22 + Math.round(r(90 + i) * 8), luiken: r(100 + i) > 0.5 ? 'hout' : null, leeg: r(110 + i) > 0.55 }));
  }
  const hijs = r(14) > 0.5;
  const topW = nok === 'x' ? Wx : Wy;
  const luikU = Math.round(topW / 2 - 17);
  const luikH = muurH + 22;
  if (hijs) (nok === 'x' ? gx_ : gy_).push(deurElement({ u: luikU, b: 34, hoog: 38, ramp: 'schors', stoep: false }));
  else (nok === 'x' ? gx_ : gy_).push(raamElement({ u: luikU + 6, b: 22, h: luikH, hoog: 24, kol: 2, rijen: 1, leeg: r(15) > 0.5 }));

  const g = huis({
    gx, gy, b, d, nok, muurH, sokkelH: Math.round(22 + r(16) * 32), // steen onder, hout boven
    muur, hout, dak,
    pleister: muur === 'vakwerk' ? 'bot' : undefined,
    zaad: zaadH,
    dakOud: oud,
    windveer: r(28) > 0.45,
    dakMos: dak === 'riet' ? (oud ? 0.5 + r(17) * 0.5 : r(17) * 0.25) : 0,
    gevel: { y: gy_, x: gx_ },
    erkers: r(33) > 0.55 ? [{ vlak: 'x', u: Math.round(Wx * 0.36), b: 34, h: Math.round(muurH * 0.42), hoog: 40, diep: 15 }] : [],
    schoorsteen: { t: 0.2 + r(18) * 0.6, c: -6 + r(19) * 12, hoog: 22 + Math.round(r(21) * 10), r: 9 + Math.round(r(22) * 4), steen: r(23) > 0.4, rook: o.rook !== false && r(24) > 0.35 },
    dakkapellen: r(29) > 0.35
      ? [{ t: 0.3 + r(30) * 0.12, b: 40, hoog: 40, raamB: 22, raam: { bloembak: r(31) > 0.6 } }].concat(
        r(32) > 0.6 ? [{ t: 0.66, b: 40, hoog: 40, raamB: 22 }] : [],
      )
      : [],
    ...o.huis,
  });

  // --- wat ertegenaan staat: een luifel boven de deur, een hijsbalk, een schoor, een afdak
  const T = TEGEL;
  const x0 = (gx - 0.5) * T;
  const y1 = (gy + d - 0.5) * T;
  const x1 = (gx + b - 0.5) * T;
  const deurX = x0 + (deurU + deurB / 2) / SQ;
  if (r(25) > 0.62) g.modellen.push({ model: luifel(zaad), gx: deurX / T, gy: y1 / T + 0.16, richting: 'Z', z: 0 });
  if (hijs) {
    const hb = nok === 'x'
      ? { gx: (x1 + 1) / T, gy: (y1 - (luikU + 17) / SQ) / T, richting: 'O' }
      : { gx: (x0 + (luikU + 17) / SQ) / T, gy: (y1 + 1) / T, richting: 'Z' };
    g.modellen.push({ model: hijsbalk(zaad), ...hb, z: (g.hoog - 16) / PXH });
  }
  if (oud && r(26) > 0.45) g.modellen.push({ model: schoorpaal(zaad), gx: (x1 + 3) / T, gy: (y1 - 30 / SQ) / T, richting: 'O', z: 0 });
  if (r(27) > 0.66) g.modellen.push({ model: afdak(zaad), gx: (x1 + 20) / T, gy: (y1 - 60 / SQ) / T, richting: 'O', z: 0 });
  return g;
}

// ---------------------------------------------------------------- het dorpsplein

// De zon aan het eind van de middag: dezelfde kant als het licht op de figuren, maar lager, zodat
// de schaduwen lang naar achteren vallen.
const AVONDZON = norm([-0.3, 0.6, 0.5]);


// Een lage heg van één tegel lang, langs de tuinen en de lanen.
function heg(zaad = 1) {
  const M = { blad: 0, tak: 1 };
  const mat = [];
  mat[M.blad] = {
    ramp: 'gras',
    lo: 1.6,
    hi: 6.4,
    patroon: (x, y, z) => {
      const n = ruis3(x * 0.42, y * 0.42, z * 0.42, zaad);
      const h = hash(Math.floor(x * 1.6), Math.floor(z * 1.6 + y), zaad + 5);
      return (n > 0.62 ? 1 : n < 0.36 ? -1.4 : 0) + (h % 11 === 0 ? -1 : 0);
    },
  };
  mat[M.tak] = { ramp: 'schors', lo: 1, hi: 4 };
  const d = [];
  d.push(F.ellips([0, 0, 11], [23, 8.5, 11.5], M.blad, 1, 2));
  d.push(F.ellips([-12, 1, 13], [10, 7.5, 9], M.blad, 1, 2));
  d.push(F.ellips([12, -1, 12], [10, 7.5, 8.5], M.blad, 1, 2));
  d.push(F.kegel([0, 0, 0], [0, 0, 8], 2.2, 1.6, M.tak, 2));
  return F.model(d, mat, { midden: [0, 0, 11], straal: 27 });
}

// Het dorp: twee lanen met huizen eromheen, een brink met de put en de kraam, moestuinen achter
// de huizen, en de kapel met het kerkhof een eindje apart. Alles op schermtegels (u, d): u telt
// naar rechts (32 pixels per stap), d naar beneden de diepte in (16 pixels per stap), zodat de
// plattegrond te lezen is als een tekening. tg() rekent dat om naar wereldtegels.
function dorpsplein(o = {}) {
  const P2 = o.plekken || require('./dorp2.cjs');
  const BREED = o.b ?? 2560;
  const HOOG = o.h ?? 1440;
  const OX = o.OX ?? 1264;
  const OY = o.OY ?? 560;
  const tg = (u, d) => [(d + u) / 2, (d - u) / 2];
  // het anker van een gebouw van b × dd tegels waarvan het midden op (u, d) valt
  const ank = (u, d, b, dd) => {
    const [gx, gy] = tg(u, d);
    return [gx - (b - 1) / 2, gy - (dd - 1) / 2];
  };
  const B = new K.Beeld(BREED, HOOG, OX, OY);
  const RICHEL = o.richel ?? 35; // waar de grond afbreekt, in tegels y
  const LAAG = o.laag ?? 54; // hoeveel de beemd lager ligt, in eenheden
  const zLaag = -LAAG / PXH; // dezelfde hoogte, maar in de maat van zetModel

  // --- de grond: gras, twee lanen, de brink van kasseien en de moestuinen
  // De lanen slingeren en wisselen van breedte: elk stuk is een eigen pad, zodat de ene kant
  // van het dorp een brede karweg heeft en de andere een smal steegje.
  const laan1 = [tg(-46, 1), tg(-31, 6), tg(-16, 2), tg(-2, 7), tg(12, 4)];
  const laan1b = [tg(12, 4), tg(26, 8), tg(38, 5), tg(48, 8)];
  const laan2 = [tg(-46, 33), tg(-30, 27), tg(-14, 32), tg(2, 28)];
  const laan2b = [tg(2, 28), tg(18, 32), tg(32, 27), tg(48, 31)];
  const dwars = [tg(11, 5), tg(17, 15), tg(12, 23), tg(16, 30), tg(13, 50)];
  const steeg = [tg(-20, 20), tg(-27, 23), tg(-30, 27)]; // doodlopend, op het erf van de bakker
  const naarKapel = [tg(-20, 6), tg(-25, 2), tg(-29, -2)];
  const [bgx, bgy] = tg(-16, 29);
  const kaart = grondKaart({
    zaad: 3,
    pleinen: [{ x0: bgx - 6, y0: bgy - 5.5, x1: bgx + 6, y1: bgy + 5.5, r: 1.6 }],
    paden: [
      { punten: laan1, breed: 1.9 },
      { punten: laan1b, breed: 1.3 },
      { punten: laan2, breed: 1.5 },
      { punten: laan2b, breed: 1.05 },
      { punten: dwars, breed: 1.15 },
      { punten: steeg, breed: 0.75, ruw: 0.5 },
      { punten: naarKapel, breed: 0.9, ruw: 0.5 },
      { punten: [tg(26, 17), tg(31, 22), tg(34, 28)], breed: 0.8, ruw: 0.6 },
    ],
    beken: [{ punten: [[-40, 41.5], [-14, 40.6], [10, 41.4], [40, 40.4]], breed: 1.6, diep: 7 }],
    akkers: [
      { ...akkerVak(tg, -24, -2, 5, 3), langs: 'x', stadium: 'jong' },
      { ...akkerVak(tg, -8, -18, 4, 3), langs: 'y', stadium: 'rijp' },
      { ...akkerVak(tg, 12, -15, 4.5, 2.5), langs: 'x', soort: 'bloemen' },
      { ...akkerVak(tg, 32, 9, 3.5, 3), langs: 'y', stadium: 'jong' },
      { ...akkerVak(tg, -33, 54, 5, 2.5), langs: 'x', stadium: 'rijp' },
      { ...akkerVak(tg, -12, 58, 4.5, 3), langs: 'x', soort: 'bloemen' },
      { ...akkerVak(tg, 10, 50, 5, 3), langs: 'x', stadium: 'jong' },
      { ...akkerVak(tg, 24, 48, 4, 2.5), langs: 'y' },
    ],
  });
  const grond = grondTex(kaart, { dor: true });
  // Het dorp ligt op een richel; voor de huizen valt de grond LAAG eenheden weg naar de beemd
  // met de beek. De zijkant van de bovenste doos is de wand van de richel.
  K.tekenDozen(B, [K.doos(-36, -36, 48, RICHEL, -18 - LAAG, 0, grond), K.doos(-36, RICHEL, 48, 48, -18 - LAAG, -LAAG, grond)]);

  // --- de huizen: drie rijen, om en om verspringend, en de kapel apart
  const gebouwen = [];
  const zet = (g) => {
    gebouwen.push(g);
    zetGebouw(B, g);
    return g;
  };
  // een gewoon dorpshuis: de plaats en de maat kiest de plattegrond, het zaad al het andere
  const zetH = (u, d, zaad, maat, extra) => zet(dorpshuis(...ank(u, d, maat[0], maat[1]), zaad, { maat, ...extra }));
  // achterste rij; de kapel staat een eindje apart, met het kerkhof ernaast
  zet(P2.kapel(...ank(-28, -7, 5, 10)));
  zet(P2.kerkhof(...ank(-33, 5, 6, 4), { b: 6, d: 4, poort: 0.6, rijen: 4, kol: 3, zaad: 17 }));
  zetH(-11, -12, 4, [6, 8], { dak: 'pannen', muur: 'veldsteen' }); // het betere huis, ver van de weg
  zetH(8, -3, 1, [5, 7]); // met de gevel naar de laan, vlak aan de kant
  zetH(25, -10, 2, [6, 5], { dak: 'riet' });
  // middelste rij, aan de eerste laan
  zet(P2.bakkerij(...ank(-24, 18, 8, 6)));
  zet(herberg(...ank(0, 15, 9, 7)));
  zetH(22, 20, 3, [5, 8]); // ook met de gevel naar de laan
  zet(smidse(...ank(34, 19, 7, 5)));
  // voorste rij, aan de tweede laan
  zet(P2.oudstehuis(...ank(-31, 34, 7, 5)));
  zetH(-9, 43, 5, [6, 9], { muur: 'blokhut' });
  zetH(15, 37, 6, [7, 5], { dak: 'riet' });
  zet(P2.kruidenhut(...ank(30, 39, 6, 5)));

  // --- de brink en wat er verder rondslingert
  const zetM = (model, u, d, richting = 'ZO', opt) => zetModel(B, model, ...tg(u, d), richting, opt);
  zetM(waterput(), -16, 28, 'ZO');
  zetM(marktkraam(), -22, 26.5, 'ZW');
  zetM(bankje(), -12, 31, 'ZO');
  zetM(lantaarnpaal(), -9.5, 27, 'Z');
  if (o.prikbord) zetM(o.prikbord, -20, 31.5, 'ZW');
  zetM(wegwijzer({ pijlen: [-14, 92, 196] }), 11.5, 26, 'ZO');
  zetM(kar(), 27, 25, 'ZW');
  zetM(hooibaal(), 30.5, 23.5, 'ZO');
  zetM(hooibaal(), 32.5, 25, 'ZW');
  zetM(VW.ton(), -4.5, 18.5, 'ZO');
  zetM(VW.ton(), -5.6, 17.4, 'ZO');
  zetM(VW.kist(), 9, 19, 'ZO');
  // rommel tegen de muren: hout, mest en een afdak
  // de erven, waar je het werk ziet
  zetM(zakken(1), -20.5, 21.5, 'ZO'); // meel bij de bakkerij
  zetM(zakken(2), -17.5, 19, 'ZW');
  zetM(kar(), -23.5, 22.5, 'ZO');
  zetM(kolenhoop(1), 30.5, 21, 'ZO'); // kolen bij de smidse
  zetM(VW.ton(), 33.5, 22.5, 'ZO');
  zetM(VW.ton(), 34.6, 23.6, 'ZO');
  zetM(zaagbok(1), 12.5, 20.5, 'ZW'); // hout kloven aan de laan
  zetM(houtstapel(9), 15, 19, 'ZO');
  zetM(zakken(3), 26, 43, 'ZO'); // bij de kruidenhut
  zetM(bijenkorf(1), 33.5, 44.5, 'ZO');
  zetM(bijenkorf(2), 35, 46, 'ZO');
  zetM(brandplek(1), -3, 35, 'ZO'); // het gat waar een huis is afgebrand
  zetM(mesthoop(9), 2, 39, 'ZO');
  zetM(kippenren(1), 6, 30, 'ZO'); // de kippen van het huis aan de laan
  zetM(kippenren(2), -13, -2, 'ZO');
  zetM(houtstapel(1), 4.5, 10, 'ZO');
  zetM(houtstapel(4), -23.5, 35, 'ZO');
  zetM(afdak(2), 18.5, 10, 'ZO');
  zetM(mesthoop(1), 34, 33, 'ZO');
  zetM(mesthoop(3), -4, -16, 'ZO');
  zetM(houtstapel(7), 22.5, 46, 'ZO');
  zetM(afdak(5), -17, 9, 'ZO');
  zetM(mesthoop(6), -33, 30, 'ZO');
  zetM(kar(), -6, 58, 'ZW', { z: zLaag });
  zetM(hooibaal(), -10, 59.5, 'ZO', { z: zLaag });
  // hekken en heggen langs de tuinen en de lanen
  for (let i = 0; i < 7; i++) zetModel(B, heg(i + 1), ...tg(-21 + i, 11 + i), 'ZO');
  for (let i = 0; i < 6; i++) zetModel(B, heg(i + 9), ...tg(9 + i, 33 + i), 'ZO');
  for (let i = 0; i < 6; i++) zetModel(B, heg(i + 16), ...tg(-15 + i, 45 + i), 'ZO');
  for (let i = 0; i < 5; i++) zetModel(B, hek('latten'), ...tg(-32 + i * 2, 11 + i * 0.1), 'NO');
  for (let i = 0; i < 6; i++) zetModel(B, hek('balken'), ...tg(20 - i * 2, 51 + i * 0.1), 'NO');
  for (let i = 0; i < 5; i++) zetModel(B, hek('latten'), ...tg(-33 + i * 2, 57 + i * 0.1), 'NO', { z: zLaag });
  // de leuning langs de richel, met lantaarns: het pad loopt langs de rand van de laagte
  for (let i = 0; i < 27; i++) zetModel(B, hek('balken'), -7 + i, RICHEL - 0.7, 'NO');
  for (const gx of [-2, 7, 16]) zetModel(B, lantaarnpaal(), gx, RICHEL - 1.1, 'Z');

  // --- de toren aan de horizon: klein en dof, iets om naar te kijken
  if (o.toren !== false) K.tekenModel(B, verreToren(1), { gx: tg(21, -23)[0], gy: tg(21, -23)[1], richting: 'Z', schaal: 0.46 });

  // --- begroeiing als lijst: struiken en varens langs de randen van het beeld, dichtbij groot
  // en scherp, achteraan klein. Zo krijgt het beeld lagen en valt de rand van de grond weg.
  const Bm = require('./bomen.cjs');
  const lijst = [
    ['struik', 1, -34, 50], ['varen', 1, -26, 54], ['struik', 2, -17, 57], ['hoogGras', 1, -8, 58],
    ['bessenStruik', 1, 2, 57], ['struik', 3, 12, 56], ['varen', 2, 22, 54], ['struik', 4, 31, 51],
    ['grasPol', 1, -38, 42], ['struik', 5, -39, 30], ['varen', 3, -38, 18],
    ['struik', 6, 39, 34], ['grasPol', 2, 40, 22], ['bessenStruik', 2, 38, 44],
    ['varen', 4, -30, -14], ['struik', 7, 30, -20], ['grasPol', 3, 8, -26],
  ];
  for (const [naam, zaad, u, d] of lijst) {
    if (!Bm[naam]) continue;
    const [gx, gy] = tg(u, d);
    K.tekenModel(B, Bm[naam](zaad), { gx, gy, richting: 'Z', z: gy > RICHEL ? zLaag : 0 });
  }

  // --- de tovenaar, voor de maat, en het licht van de avond
  if (o.tovenaar !== false) zetModel(B, F.tovenaar(o.leeftijd ?? 84), ...tg(-17, 31.5), 'ZO');
  grasPollen(B, kaart, { dicht: 0.32 });
  const vormen = gebouwen.flatMap((g) => g.vormen);
  zonSchaduw(B, vormen, { zon: AVONDZON, kracht: o.kracht ?? 2.6 });
  voetSchaduw(B, gebouwen);
  K.belicht(B, { omgeving: (X, Y, Z) => (o.omgeving ?? 0.2) - klem((6 - (X + Y) / TEGEL) / 40, 0, 1) * 1.05 * (1 - klem((Z * PXH - 40) / 220, 0, 0.6)) });
  if (o.avond !== false) avondlicht(B);
  K.verwarm(B, 1.8);
  // de verte wordt waziger: minder verschil tussen licht en donker, naar een middentoon toe
  nevel(B, { van: 12, tot: -34, mid: 3.3, sterkte: 0.5 });
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// een moestuin van b × h tegels met het midden op schermtegel (u, d)
function akkerVak(tg, u, d, b, h) {
  const [gx, gy] = tg(u, d);
  return { x0: gx - b / 2, y0: gy - h / 2, x1: gx + b / 2, y1: gy + h / 2 };
}

module.exports = {
  SQ,
  HELLING,
  schermX,
  schermY,
  vorm,
  blok,
  tekenVormen,
  straalRaakt,
  lichtOp,
  schermKader,
  GRAS,
  PAD,
  KASSEI,
  AKKER,
  WATER,
  grondKaart,
  grondTex,
  grasPollen,
  blokhutPixel,
  glinstering,
  waterPixel,
  waterDiepte,
  waterTreffer,
  diepteVan,
  vakwerkBalken,
  vakwerkPixel,
  veldsteenPixel,
  deurElement,
  raamElement,
  rietPixel,
  pannenPixel,
  baksteenPixel,
  huis,
  zetGebouw,
  vakwerkhuis,
  stenenHuis,
  herberg,
  smidse,
  aambeeld,
  rook,
  openElement,
  leienPixel,
  dorpsplein,
  AVONDZON,
  uithangbord,
  waterput,
  heg,
  luifel,
  hijsbalk,
  schoorpaal,
  bijenkorf,
  kippenren,
  dorpshuis,
  brandplek,
  verreToren,
  hek,
  houtstapel,
  zakken,
  kolenhoop,
  zaagbok,
  mesthoop,
  afdak,
  kar,
  marktkraam,
  wegwijzer,
  bankje,
  lantaarnpaal,
  hooibaal,
  kantelBlok,
  xCilinder,
  zetModel,
  modelRaakt,
  zonSchaduw,
  voetSchaduw,
  avondlicht,
  nevel,
  roosterX,
  roosterY,
  vanRooster,
};
