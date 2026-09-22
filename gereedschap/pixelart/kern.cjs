// De kern van de HD-pixel art van Aardschok: het palet, de isometrische camera, en een renderer
// die dozen (muren, vloeren) en 3D-modellen (figuren, voorwerpen) per pixel tekent en daarna
// terugbrengt tot pixel art: vaste kleurrampen, harde randen, omlijning, weinig dithering.
//
// Tegels zijn 64×32 zoals in het spel. De wereld is in eenheden waarin één eenheid dwars op de
// kijkrichting precies één pixel is; een tegel is dan 64/√2 ≈ 45,25 eenheden breed, en een
// eenheid hoogte is cos 30° ≈ 0,866 pixel. De camera kijkt 30° naar beneden: dat geeft de 2:1.
'use strict';
const zlib = require('zlib');

// ---------------------------------------------------------------- kleur (OKLab)

const hexNaarRgb = (h) => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbNaarHex = (r, g, b) =>
  '#' + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('');
const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const srgb = (c) => {
  c = Math.max(0, Math.min(1, c));
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
};
function naarLab(hex) {
  const [r, g, b] = hexNaarRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function vanLab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return rgbNaarHex(
    srgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    srgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    srgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  );
}
// Een ramp opnieuw bemonsteren tot n stappen, langs de lijn door OKLab: de uiteinden blijven,
// ertussen komen tussentinten. Zo houden de HD-rampen de kleuren van de eerste pixel art.
function herbemonster(hexen, n) {
  if (n === hexen.length) return hexen.slice();
  const lab = hexen.map(naarLab);
  const uit = [];
  for (let i = 0; i < n; i++) {
    const t = (i * (lab.length - 1)) / (n - 1);
    const k = Math.min(lab.length - 2, Math.floor(t));
    const f = t - k;
    uit.push(vanLab(lab[k].map((v, j) => v + (lab[k + 1][j] - v) * f)));
  }
  return uit;
}

// ---------------------------------------------------------------- palet

// De rampen van de eerste pixel art, met meer stappen, en een paar nieuwe voor HD.
const BASIS = {
  inkt: [['#0a0710', '#0e0a14', '#1c1626', '#2a2236'], 4],
  steen: [['#1f1a2a', '#352c40', '#4f4458', '#6d6072', '#8f8290', '#b3a8b0', '#d6cdd0'], 9],
  zand: [['#2a1c1a', '#4a3024', '#6e4a32', '#8e6644', '#ae8458', '#cca470', '#e8c890', '#fae6b4'], 9],
  hout: [['#1e1216', '#3a2020', '#5a3424', '#7c4c2c', '#a06a3a', '#c28c4c', '#dcae68'], 8],
  ijzer: [['#14141c', '#262834', '#3e4252', '#5c6276', '#868ca0', '#b6bccc', '#e4e8f0'], 8],
  goud: [['#3a1e0e', '#4a2a10', '#7a4a14', '#b07818', '#e0a828', '#f8d85c', '#fff4b0'], 8],
  gewaad: [['#0c0c2a', '#12143a', '#1c2462', '#283a90', '#3a58c0', '#5c82e0', '#8cb0f4', '#c4dcff'], 9],
  baard: [['#3e3a4c', '#5a5468', '#8c8894', '#b8b6bc', '#dedcdc', '#f6f4ee', '#ffffff'], 8],
  huid: [['#3a1a20', '#4a2426', '#7a4032', '#b0664a', '#d89068', '#f0b88a', '#fcdcb4'], 8],
  jas: [['#221418', '#3c2420', '#5a3a2a', '#7c5438', '#9e744c', '#c09a6a', '#dcc090'], 8],
  pet: [['#0e1018', '#141622', '#20283a', '#303c54', '#465672', '#627494', '#8898b4'], 8],
  water: [['#0e1a3a', '#16305e', '#1e4e8a', '#2e76b6', '#56a4dc', '#9cd4f4', '#e0f6ff'], 8],
  vuur: [['#5a1008', '#9a2410', '#d44a14', '#f47c1c', '#fcb030', '#fee070', '#fffce0'], 8],
  slijm: [['#0a1e16', '#0e2a1c', '#164a26', '#1e6e30', '#34963a', '#62bc48', '#a4e070', '#e0fcb0'], 9],
  bot: [['#2c2420', '#4e443a', '#7a6e5a', '#a89c80', '#d0c6a8', '#f0ead4'], 8],
  rood: [['#1c0810', '#2a0c14', '#4e141c', '#7a2022', '#a8342a', '#d0543a', '#ec8058', '#f8b088'], 9],
  magie: [['#1e0e36', '#3a1a5e', '#5e2c8e', '#8c48c0', '#bc78e4', '#e4b4f8'], 7],
  leer: [['#140a0c', '#2a1614', '#44241c', '#623626', '#824c32', '#a26842', '#c08a5c'], 7],
  mos: [['#141c10', '#1e2c16', '#2c401c', '#3e5624', '#56702e', '#74903c'], 6],
  perkament: [['#3a2c22', '#6a543c', '#9a8260', '#c4ae84', '#e4d4a8', '#f8eed0', '#fffaec'], 7],
  stro: [['#2e1c0c', '#523414', '#7c5418', '#a47a26', '#c89c3a', '#e4c05c', '#f8e090'], 7],
  // buiten: blad, naalden, herfst, gras, schors, berkenbast, dakpannen, riet, pleister, vacht, aarde
  blad: [['#0f1a10', '#1a2e16', '#27461c', '#355f22', '#4a7a2a', '#669a34', '#8cba48', '#b8d870'], 8],
  den: [['#0a1414', '#10201e', '#183028', '#224234', '#2e5640', '#3e6c4c', '#588a5e'], 7],
  herfst: [['#2a0e0a', '#4a1a10', '#7a2e14', '#a84818', '#d06a1c', '#ec9030', '#f8c060'], 7],
  gras: [['#14200e', '#1e3212', '#2c4818', '#3c5e1e', '#507826', '#6a9430', '#8cb040', '#b4cc62'], 8],
  schors: [['#161210', '#28201a', '#3c3024', '#524232', '#6a5642', '#847058', '#a08c72'], 7],
  berk: [['#3a3638', '#6a6466', '#9a9494', '#c4c0bc', '#e2dfda', '#f6f4f0'], 6],
  dak: [['#1e0c0c', '#3a1614', '#5a221a', '#7c3222', '#9e4a2e', '#bc6a40', '#d68c58'], 7],
  riet: [['#241a10', '#3e2e1a', '#5a4626', '#786034', '#967c46', '#b09a5e', '#cab87c'], 7],
  pleister: [['#4a4038', '#6e6256', '#948878', '#b8ae9c', '#d6cebc', '#ece6d6', '#faf6ec'], 7],
  vacht: [['#161416', '#28242a', '#3e383e', '#564e52', '#72686a', '#908484', '#b0a4a0'], 7],
  aarde: [['#1e140e', '#34241a', '#4c3626', '#664a34', '#806044', '#9a7856', '#b4926c'], 7],
  // olijfgroen voor de huid van de kobold: groen, maar warmer dan gras, zodat hij niet wegvalt
  olijf: [['#1b1a0e', '#2e2b14', '#45401c', '#5e5624', '#7a6e2e', '#96883c', '#b2a24e'], 7],
};

const RAMPEN = {};
for (const [naam, [hexen, n]] of Object.entries(BASIS)) RAMPEN[naam] = herbemonster(hexen, n);
const RAMP_NAMEN = Object.keys(RAMPEN);
const RAMP = {};
RAMP_NAMEN.forEach((n, i) => (RAMP[n] = i));
const RAMP_RGB = RAMP_NAMEN.map((n) => RAMPEN[n].map(hexNaarRgb));
const RAMP_LEN = RAMP_NAMEN.map((n) => RAMPEN[n].length);

// ---------------------------------------------------------------- hulpjes

const hash = (a, b = 0, c = 0) => {
  let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
};
const rnd = (a, b = 0, c = 0) => hash(a, b, c) / 4294967296;
const klem = (n, a, b) => (n < a ? a : n > b ? b : n);
const mix = (a, b, t) => a + (b - a) * t;
const glad = (a, b, x) => {
  const t = klem((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
// waarde-ruis in 2D en 3D, glad tussen roosterpunten
function ruis2(x, y, zaad = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = rnd(xi, yi, zaad);
  const b = rnd(xi + 1, yi, zaad);
  const c = rnd(xi, yi + 1, zaad);
  const d = rnd(xi + 1, yi + 1, zaad);
  return mix(mix(a, b, u), mix(c, d, u), v);
}
function ruis3(x, y, z, zaad = 0) {
  const zi = Math.floor(z);
  const f = z - zi;
  const w = f * f * (3 - 2 * f);
  return mix(ruis2(x, y, zaad + zi * 131), ruis2(x, y, zaad + (zi + 1) * 131), w);
}

// ---------------------------------------------------------------- camera

const TEGEL = 64 / Math.SQRT2; // eenheden per tegel
const PXH = Math.cos(Math.PI / 6); // pixels per eenheid hoogte
const V = [-Math.SQRT1_2 * PXH, -Math.SQRT1_2 * PXH, -0.5]; // kijkrichting, de scène in
const EX = [Math.SQRT1_2, -Math.SQRT1_2, 0]; // één pixel naar rechts
const EY = [0.5 * Math.SQRT1_2, 0.5 * Math.SQRT1_2, -PXH]; // één pixel naar beneden
const norm3 = (x, y, z) => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};
// Hoofdlicht van linksvoor en hoog: bovenvlakken het lichtst, de linkerwand (+y) licht, de
// rechterwand (+x) donker. Randlicht van rechtsachter, voor een lichte rand aan de schaduwkant.
const LICHT = norm3(-0.3, 0.6, 0.74);
const RANDLICHT = norm3(0.15, -0.85, 0.5);

// Kijkrichting van een figuur, als hoek in de wereld. ZO is +x (rechtsonder op het scherm).
const RICHTING = { ZO: 0, Z: 45, ZW: 90, W: 135, NW: 180, N: 225, NO: 270, O: 315 };
const KANTEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'];

const naarScherm = (B, X, Y, Z) => [
  B.OX + X * EX[0] + Y * EX[1] + Z * EX[2],
  B.OY + X * EY[0] + Y * EY[1] + Z * EY[2],
];
const tegelNaarScherm = (B, gx, gy, hpx = 0) => [B.OX + (gx - gy) * 32, B.OY + (gx + gy) * 16 - hpx];

// ---------------------------------------------------------------- het beeld

const VLAG = { GLOEI: 1, OMLIJN: 2, GLAD: 4, VAST: 8, VLOER: 16 };

class Beeld {
  constructor(b, h, OX = 0, OY = 0) {
    this.b = b;
    this.h = h;
    this.OX = OX;
    this.OY = OY;
    const n = b * h;
    this.ramp = new Int16Array(n).fill(-1);
    this.stap = new Float32Array(n);
    this.diep = new Float32Array(n).fill(-1e9);
    this.obj = new Int16Array(n).fill(-1);
    this.deel = new Int16Array(n).fill(-1);
    this.pos = new Float32Array(n * 3);
    this.nrm = new Float32Array(n * 3);
    this.vlag = new Uint8Array(n);
    this.warm = new Float32Array(n);
    this.lichten = [];
    this.volgendObj = 1;
  }
  zet(i, ramp, stap, vlag = 0) {
    this.ramp[i] = typeof ramp === 'string' ? RAMP[ramp] : ramp;
    this.stap[i] = stap;
    this.vlag[i] = vlag;
  }
  // een platte pixel bovenop alles (voor effecten en tekens op de vloer)
  verf(x, y, ramp, stap, vlag = VLAG.VAST | VLAG.GLAD) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return;
    const i = y * this.b + x;
    this.ramp[i] = typeof ramp === 'string' ? RAMP[ramp] : ramp;
    this.stap[i] = stap;
    this.vlag[i] = vlag;
  }
  lees(x, y) {
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return -1;
    return this.ramp[y * this.b + x];
  }
}

// ---------------------------------------------------------------- dozen

// Een doos in de wereld, in tegels en pixels hoogte. tex(vlak, X, Y, Z, px, py) kiest per pixel
// ramp en stap via het gedeelde object UIT; vlak is 'x' (rechterwand), 'y' (linkerwand) of 'z'.
const UIT = { ramp: 0, stap: 0, vlag: 0, weg: false };
function doos(gx0, gy0, gx1, gy1, h0, h1, tex, extra = {}) {
  return {
    x0: gx0 * TEGEL,
    y0: gy0 * TEGEL,
    x1: gx1 * TEGEL,
    y1: gy1 * TEGEL,
    z0: h0 / PXH,
    z1: h1 / PXH,
    tex,
    ...extra,
  };
}

function tekenDozen(B, dozen, obj = 0) {
  const n = dozen.length;
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const ax = px + 0.5 - B.OX;
      const ay = py + 0.5 - B.OY;
      const X = ax * EX[0] + ay * EY[0];
      const Y = ax * EX[1] + ay * EY[1];
      const Z = ax * EX[2] + ay * EY[2];
      let beste = Infinity;
      let doosI = -1;
      let vlakI = -1;
      for (let k = 0; k < n; k++) {
        const d = dozen[k];
        // intreden via de hoge kant (de straal loopt naar -x, -y, -z)
        const tx0 = (d.x1 - X) / V[0];
        const tx1 = (d.x0 - X) / V[0];
        const ty0 = (d.y1 - Y) / V[1];
        const ty1 = (d.y0 - Y) / V[1];
        const tz0 = (d.z1 - Z) / V[2];
        const tz1 = (d.z0 - Z) / V[2];
        let tin = tx0;
        let vl = 0;
        if (ty0 > tin) {
          tin = ty0;
          vl = 1;
        }
        if (tz0 > tin) {
          tin = tz0;
          vl = 2;
        }
        const tuit = Math.min(tx1, ty1, tz1);
        if (tin <= tuit && tin < beste) {
          beste = tin;
          doosI = k;
          vlakI = vl;
        }
      }
      if (doosI < 0) continue;
      const i = py * B.b + px;
      const diepte = -beste;
      if (diepte <= B.diep[i]) continue;
      const HX = X + V[0] * beste;
      const HY = Y + V[1] * beste;
      const HZ = Z + V[2] * beste;
      const d = dozen[doosI];
      UIT.weg = false;
      UIT.vlag = 0;
      d.tex(vlakI === 0 ? 'x' : vlakI === 1 ? 'y' : 'z', HX, HY, HZ, px, py, d);
      if (UIT.weg) continue;
      B.ramp[i] = UIT.ramp;
      B.stap[i] = UIT.vlag & VLAG.GLOEI ? UIT.stap : Math.round(UIT.stap);
      B.vlag[i] = UIT.vlag | (vlakI === 2 && HZ < 0.5 ? VLAG.VLOER : 0);
      B.diep[i] = diepte;
      B.obj[i] = d.obj ?? obj;
      B.deel[i] = -1;
      B.pos[i * 3] = HX;
      B.pos[i * 3 + 1] = HY;
      B.pos[i * 3 + 2] = HZ;
      B.nrm[i * 3] = vlakI === 0 ? 1 : 0;
      B.nrm[i * 3 + 1] = vlakI === 1 ? 1 : 0;
      B.nrm[i * 3 + 2] = vlakI === 2 ? 1 : 0;
    }
  }
}

// ---------------------------------------------------------------- modellen (SDF)

// Een model is een lijst delen; elk deel heeft een afstandsfunctie f(x, y, z), een materiaal m
// (getal of functie van de plek), een deelnummer voor de binnenlijnen, en optioneel een
// grensbol g = [x, y, z, r] om het rekenen over te slaan, een zachte naad k, of uit: true om
// iets weg te snijden. Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog.
let LAATSTE = -1;
function bouwSdf(delen) {
  const n = delen.length;
  return (x, y, z) => {
    let d = 1e9;
    let w = -1;
    for (let i = 0; i < n; i++) {
      const p = delen[i];
      if (p.g) {
        const gx = x - p.g[0];
        const gy = y - p.g[1];
        const gz = z - p.g[2];
        const gd = Math.sqrt(gx * gx + gy * gy + gz * gz) - p.g[3];
        if (p.uit ? gd >= -d : gd > d + (p.k || 0)) continue;
      }
      const t = p.f(x, y, z);
      if (p.uit) {
        if (-t > d) {
          d = -t;
          if (p.m !== undefined) w = i;
        }
      } else if (p.k) {
        const h = Math.max(p.k - Math.abs(d - t), 0) / p.k;
        if (t < d) w = i;
        d = Math.min(d, t) - h * h * p.k * 0.25;
      } else if (t < d) {
        d = t;
        w = i;
      }
    }
    LAATSTE = w;
    return d;
  };
}

// afstandsfuncties
const sdf = {
  bol: (x, y, z, r) => Math.sqrt(x * x + y * y + z * z) - r,
  ellipsoide(x, y, z, a, b, c) {
    const k0 = Math.sqrt((x / a) ** 2 + (y / b) ** 2 + (z / c) ** 2);
    const k1 = Math.sqrt((x / (a * a)) ** 2 + (y / (b * b)) ** 2 + (z / (c * c)) ** 2);
    return k1 === 0 ? -Math.min(a, b, c) : (k0 * (k0 - 1)) / k1;
  },
  capsule(px, py, pz, ax, ay, az, bx, by, bz, r) {
    const pax = px - ax;
    const pay = py - ay;
    const paz = pz - az;
    const bax = bx - ax;
    const bay = by - ay;
    const baz = bz - az;
    const h = klem((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
    return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
  },
  // kegel met ronde uiteinden tussen a (straal r1) en b (straal r2), naar Inigo Quilez
  rondeKegel(px, py, pz, ax, ay, az, bx, by, bz, r1, r2) {
    const bax = bx - ax;
    const bay = by - ay;
    const baz = bz - az;
    const l2 = bax * bax + bay * bay + baz * baz;
    const rr = r1 - r2;
    const a2 = l2 - rr * rr;
    const il2 = 1 / l2;
    const pax = px - ax;
    const pay = py - ay;
    const paz = pz - az;
    const y = pax * bax + pay * bay + paz * baz;
    const z = y - l2;
    const qx = pax * l2 - bax * y;
    const qy = pay * l2 - bay * y;
    const qz = paz * l2 - baz * y;
    const x2 = qx * qx + qy * qy + qz * qz;
    const y2 = y * y * l2;
    const z2 = z * z * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
  },
  doos(x, y, z, hx, hy, hz, r = 0) {
    const qx = Math.abs(x) - hx + r;
    const qy = Math.abs(y) - hy + r;
    const qz = Math.abs(z) - hz + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
  },
  // staande cilinder van z0 tot z1
  cilinder(x, y, z, r, z0, z1) {
    const dr = Math.hypot(x, y) - r;
    const dz = Math.max(z0 - z, z - z1);
    return Math.min(Math.max(dr, dz), 0) + Math.hypot(Math.max(dr, 0), Math.max(dz, 0));
  },
  torus(x, y, z, R, r) {
    const q = Math.hypot(x, y) - R;
    return Math.hypot(q, z) - r;
  },
};

// Een model tekenen in het beeld. o: { gx, gy (tegels), z (eenheden), richting (naam of graden),
// schaal, omlijn, gloed (extra lichten meenemen) }. Geeft de lichten van het model terug in
// wereldcoördinaten.
function tekenModel(B, model, o = {}) {
  const obj = B.volgendObj++;
  const Ox = (o.gx || 0) * TEGEL;
  const Oy = (o.gy || 0) * TEGEL;
  const Oz = o.z || 0;
  const graden = typeof o.richting === 'number' ? o.richting : RICHTING[o.richting || 'Z'];
  const hoek = (graden * Math.PI) / 180;
  const fx = Math.cos(hoek);
  const fy = Math.sin(hoek);
  const rx = -fy;
  const ry = fx;
  const naarLokaal = (X, Y) => {
    const dx = X - Ox;
    const dy = Y - Oy;
    return [dx * rx + dy * ry, dx * fx + dy * fy];
  };
  const [vx, vy] = [V[0] * rx + V[1] * ry, V[0] * fx + V[1] * fy];
  const vz = V[2];
  const lL = [LICHT[0] * rx + LICHT[1] * ry, LICHT[0] * fx + LICHT[1] * fy, LICHT[2]];
  const lR = [RANDLICHT[0] * rx + RANDLICHT[1] * ry, RANDLICHT[0] * fx + RANDLICHT[1] * fy, RANDLICHT[2]];
  const f = model.sdf;
  const [mx, my, mz] = model.midden;
  const R = model.straal;
  const Cx = Ox + mx * rx + my * fx;
  const Cy = Oy + mx * ry + my * fy;
  const Cz = Oz + mz;
  const [csx, csy] = naarScherm(B, Cx, Cy, Cz);
  const x0 = Math.max(0, Math.floor(csx - R - 1));
  const x1 = Math.min(B.b - 1, Math.ceil(csx + R + 1));
  const y0 = Math.max(0, Math.floor(csy - R - 1));
  const y1 = Math.min(B.h - 1, Math.ceil(csy + R + 1));
  if (x1 < x0 || y1 < y0) return [];
  const W = x1 - x0 + 1;
  const H = y1 - y0 + 1;

  // één straal door (sx, sy); geeft null of [t, x, y, z, deel]
  function straal(sx, sy) {
    const ax = sx - B.OX;
    const ay = sy - B.OY;
    const PX = ax * EX[0] + ay * EY[0];
    const PY = ax * EX[1] + ay * EY[1];
    const PZ = ax * EX[2] + ay * EY[2];
    const [lx, ly] = naarLokaal(PX, PY);
    const lz = PZ - Oz;
    const ocx = lx - mx;
    const ocy = ly - my;
    const ocz = lz - mz;
    const b = ocx * vx + ocy * vy + ocz * vz;
    const c = ocx * ocx + ocy * ocy + ocz * ocz - R * R;
    const disc = b * b - c;
    if (disc < 0) return null;
    const s = Math.sqrt(disc);
    let t = -b - s;
    const eind = -b + s;
    for (let i = 0; i < 300 && t < eind; i++) {
      const x = lx + vx * t;
      const y = ly + vy * t;
      const z = lz + vz * t;
      const d = f(x, y, z);
      if (d < 0.03) return [t, x, y, z, LAATSTE];
      t += Math.max(d * 0.7, 0.03);
    }
    return null;
  }

  // materialen en patronen rekenen in de maten van het oorspronkelijke model. Een deel dat een
  // houding heeft verplaatst (zie houding.cjs) draagt `terug`, de weg naar zijn rusthouding: dan
  // beweegt het patroon met het deel mee in plaats van dat het deel erdoorheen schuift.
  const naarModel = model.naarModel || ((x, y, z) => [x, y, z]);
  const naarDeel = (deel, x, y, z) => {
    const p = naarModel(x, y, z);
    const terug = model.delen[deel].terug;
    return terug ? terug(p[0], p[1], p[2]) : p;
  };
  const materiaalVan = (deel, x, y, z) => {
    const p = model.delen[deel];
    return typeof p.m === 'function' ? p.m(...naarDeel(deel, x, y, z)) : p.m;
  };

  // eerste ronde: één straal per pixelmidden
  const eerste = new Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const s = straal(x0 + i + 0.5, y0 + j + 0.5);
      if (s) s.push(materiaalVan(s[4], s[1], s[2], s[3]));
      eerste[j * W + i] = s;
    }
  }
  const sleutel = (s) => (s ? s[5] * 1000 + model.delen[s[4]].deel : -1);
  const SUB = [-1 / 3, 0, 1 / 3];

  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const midden = eerste[j * W + i];
      // alleen waar de buren verschillen, negen stralen: randen en naden worden zo schoon
      let rand = false;
      const k0 = sleutel(midden);
      for (let dj = -1; dj <= 1 && !rand; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= W || jj >= H) continue;
          if (sleutel(eerste[jj * W + ii]) !== k0) {
            rand = true;
            break;
          }
        }
      }
      let monsters;
      if (rand) {
        monsters = [];
        for (const sj of SUB) {
          for (const si of SUB) {
            if (si === 0 && sj === 0) {
              monsters.push(midden);
              continue;
            }
            const s = straal(x0 + i + 0.5 + si, y0 + j + 0.5 + sj);
            if (s) s.push(materiaalVan(s[4], s[1], s[2], s[3]));
            monsters.push(s);
          }
        }
      } else {
        if (!midden) continue;
        monsters = null;
      }
      let gekozen;
      if (monsters) {
        const raak = monsters.filter(Boolean);
        if (raak.length < 5) continue;
        // materiaal met de meeste stemmen; details (ogen, sterren) tellen zwaarder
        const stemmen = new Map();
        for (const s of raak) {
          const mat = model.mat[s[5]];
          stemmen.set(s[5], (stemmen.get(s[5]) || 0) + (mat.detail ? 2.6 : 1));
        }
        let win = -1;
        let max = -1;
        for (const [m, n] of stemmen) {
          if (n > max) {
            max = n;
            win = m;
          }
        }
        gekozen = raak.filter((s) => s[5] === win);
      } else {
        gekozen = [midden];
      }
      // gemiddelde plek van het gekozen materiaal; dichtstbijzijnde diepte
      let t = Infinity;
      let x = 0;
      let y = 0;
      let z = 0;
      for (const s of gekozen) {
        t = Math.min(t, s[0]);
        x += s[1];
        y += s[2];
        z += s[3];
      }
      x /= gekozen.length;
      y /= gekozen.length;
      z /= gekozen.length;
      const deelI = gekozen[0][4];
      const matI = gekozen[0][5];
      const mat = model.mat[matI];
      const px = x0 + i;
      const py = y0 + j;
      const idx = py * B.b + px;
      const diepte = -(t) - 0; // t is gemeten vanaf het vlak door de oorsprong
      if (diepte <= B.diep[idx]) continue;

      // normaal
      const e = 0.3;
      let nx = f(x + e, y, z) - f(x - e, y, z);
      let ny = f(x, y + e, z) - f(x, y - e, z);
      let nz = f(x, y, z + e) - f(x, y, z - e);
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;

      let stap;
      let ramp = RAMP[mat.ramp];
      let vlag = o.omlijn === false ? 0 : VLAG.OMLIJN;
      const kijk = -(nx * vx + ny * vy + nz * vz); // 1 = recht naar de camera
      if (mat.gloei) {
        stap = mat.gloei(...naarDeel(deelI, x, y, z), kijk);
        vlag |= VLAG.GLOEI | VLAG.GLAD;
      } else {
        const nL = nx * lL[0] + ny * lL[1] + nz * lL[2];
        let licht = Math.max(0, mat.omslag ? (nL + mat.omslag) / (1 + mat.omslag) : nL);
        // schaduw van het model op zichzelf (de rand van de hoed over het gezicht)
        if (licht > 0 && mat.schaduw !== false) {
          let ts = 0.9;
          for (let s = 0; s < 60 && ts < 70; s++) {
            const d = f(x + nx * 0.6 + lL[0] * ts, y + ny * 0.6 + lL[1] * ts, z + nz * 0.6 + lL[2] * ts);
            if (d < 0.05) {
              licht *= mat.schaduwKracht ?? 0.35;
              break;
            }
            ts += Math.max(d * 0.8, 0.25);
          }
        }
        // omgevingsschaduw
        let ao = 0;
        for (let s = 1; s <= 4; s++) {
          const h = s * 1.6;
          ao += (h - f(x + nx * h, y + ny * h, z + nz * h)) / (1 << s);
        }
        ao = klem(1 - ao * 0.5, 0.35, 1);
        const rand2 = Math.pow(1 - Math.max(0, kijk), 2.5) * Math.max(0, nx * lR[0] + ny * lR[1] + nz * lR[2]);
        const b = (0.24 + 0.76 * licht) * (0.45 + 0.55 * ao);
        stap = mat.lo + (mat.hi - mat.lo) * b + rand2 * (mat.rand ?? 1.4);
        if (mat.glans) {
          const hx = lL[0] - vx;
          const hy = lL[1] - vy;
          const hz = lL[2] - vz;
          const hl = Math.hypot(hx, hy, hz);
          const sp = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), mat.glansMacht || 24);
          stap += sp * mat.glans;
        }
      }
      if (mat.patroon) {
        const [mx0, my0, mz0] = naarDeel(deelI, x, y, z);
        const p = mat.patroon(mx0, my0, mz0, nx, ny, nz, stap);
        if (typeof p === 'number') stap += p;
        else if (p) {
          if (p.ramp !== undefined) ramp = RAMP[p.ramp];
          if (p.stap !== undefined) stap = p.stap;
          if (p.plus !== undefined) stap += p.plus;
        }
      }
      if (mat.glad || (o.dither !== true && mat.dither !== true)) vlag |= VLAG.GLAD;
      B.ramp[idx] = ramp;
      B.stap[idx] = stap;
      B.diep[idx] = diepte;
      B.obj[idx] = obj;
      B.deel[idx] = model.delen[deelI].deel ?? deelI;
      B.vlag[idx] = vlag;
      const WX = Ox + x * rx + y * fx;
      const WY = Oy + x * ry + y * fy;
      B.pos[idx * 3] = WX;
      B.pos[idx * 3 + 1] = WY;
      B.pos[idx * 3 + 2] = Oz + z;
      B.nrm[idx * 3] = nx * rx + ny * fx;
      B.nrm[idx * 3 + 1] = nx * ry + ny * fy;
      B.nrm[idx * 3 + 2] = nz;
    }
  }
  // lichten van het model (de bol op de staf, een kaarsvlam) naar de wereld
  const uit = [];
  for (const l of model.lichten || []) {
    const [lx, ly, lz] = l.pos;
    uit.push({ ...l, pos: [Ox + lx * rx + ly * fx, Oy + lx * ry + ly * fy, Oz + lz], obj });
  }
  B.lichten.push(...uit);
  return uit;
}

// Slagschaduw van een model op de vloer: vanaf elk vloerpixel in de buurt naar het hoofdlicht
// kijken of het model ertussen staat. Plus een zachte donkere vlek onder de voeten.
function schaduwOpVloer(B, model, o = {}) {
  const Ox = (o.gx || 0) * TEGEL;
  const Oy = (o.gy || 0) * TEGEL;
  const graden = typeof o.richting === 'number' ? o.richting : RICHTING[o.richting || 'Z'];
  const hoek = (graden * Math.PI) / 180;
  const fx = Math.cos(hoek);
  const fy = Math.sin(hoek);
  const rx = -fy;
  const ry = fx;
  const lL = [LICHT[0] * rx + LICHT[1] * ry, LICHT[0] * fx + LICHT[1] * fy, LICHT[2]];
  const [sx, sy] = naarScherm(B, Ox, Oy, 0);
  const R = model.straal * 1.4;
  const voet = o.voet || 14;
  for (let py = Math.floor(sy - R); py <= sy + R * 0.7; py++) {
    for (let px = Math.floor(sx - R * 1.6); px <= sx + R * 1.6; px++) {
      if (px < 0 || py < 0 || px >= B.b || py >= B.h) continue;
      const i = py * B.b + px;
      if (!(B.vlag[i] & VLAG.VLOER)) continue;
      const X = B.pos[i * 3];
      const Y = B.pos[i * 3 + 1];
      const dx = X - Ox;
      const dy = Y - Oy;
      let x = dx * rx + dy * ry;
      let y = dx * fx + dy * fy;
      let z = 0;
      // contactvlek
      const r2 = (x * x + y * y) / (voet * voet);
      let donker = r2 < 1 ? 1.2 * (1 - r2) : 0;
      // slagschaduw
      let t = 0.5;
      for (let s = 0; s < 80 && t < 160; s++) {
        const d = model.sdf(x + lL[0] * t, y + lL[1] * t, z + lL[2] * t);
        if (d < 0.1) {
          donker = Math.max(donker, o.sterkte || 1.1);
          break;
        }
        t += Math.max(d * 0.8, 0.3);
      }
      if (donker > 0) B.stap[i] -= donker;
    }
  }
}

// ---------------------------------------------------------------- licht in de scène

// lichten: { pos: [X, Y, Z], r (eenheden), sterk (stappen), warm (0..1) }
function belicht(B, o = {}) {
  const omgeving = o.omgeving || (() => 0);
  const lichten = B.lichten;
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
      const X = B.pos[i * 3];
      const Y = B.pos[i * 3 + 1];
      const Z = B.pos[i * 3 + 2];
      const nx = B.nrm[i * 3];
      const ny = B.nrm[i * 3 + 1];
      const nz = B.nrm[i * 3 + 2];
      let plus = omgeving(X, Y, Z, px, py, i);
      let warm = 0;
      for (const l of lichten) {
        const dx = l.pos[0] - X;
        const dy = l.pos[1] - Y;
        const dz = l.pos[2] - Z;
        const a = Math.hypot(dx, dy, dz);
        if (a >= l.r) continue;
        if (l.obj && l.obj === B.obj[i] && l.eigen === false) continue;
        const val = (1 - a / l.r) ** (l.val ?? 1.6);
        const lam = a > 0.01 ? Math.max(0, (nx * dx + ny * dy + nz * dz) / a) : 1;
        const bijdrage = l.sterk * val * ((l.zacht ?? 0.35) + (1 - (l.zacht ?? 0.35)) * lam);
        plus += bijdrage;
        warm += bijdrage * (l.warm ?? 1);
      }
      B.stap[i] += plus;
      B.warm[i] = warm;
    }
  }
}

// Warm licht maakt steen tot zandsteen, zoals een lamp dat doet. Getrapt en aan de rand gedithered.
function verwarm(B, drempel = 1.2) {
  const steen = RAMP.steen;
  const zand = RAMP.zand;
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      if (B.ramp[i] !== steen) continue;
      const w = B.warm[i];
      if (w > drempel + 0.35 || (w > drempel - 0.15 && (px + py) % 2 === 0)) {
        B.ramp[i] = zand;
        B.stap[i] -= 0.6;
      }
    }
  }
}

// ---------------------------------------------------------------- omlijning

// Om figuren en voorwerpen een lijn van één pixel: in de donkerste tint van de kleur ernaast,
// aan de lichte kant (links en boven) een tint minder donker. Binnenin een donkere naad waar
// een deel duidelijk voor een ander deel staat (een arm voor het lijf).
function omlijn(B, o = {}) {
  const n = B.b * B.h;
  const ramp = Int16Array.from(B.ramp);
  const stap = Float32Array.from(B.stap);
  const vlag = Uint8Array.from(B.vlag);
  const diep = B.diep;
  const naad = o.naad ?? 5;
  const buren = [
    [-1, 0, 1],
    [1, 0, 0],
    [0, -1, 1],
    [0, 1, 0],
  ];
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      let beste = -1;
      let besteDiep = -1e9;
      let licht = 0;
      for (const [dx, dy, kant] of buren) {
        const x = px - dx;
        const y = py - dy;
        if (x < 0 || y < 0 || x >= B.b || y >= B.h) continue;
        const j = y * B.b + x;
        if (!(B.vlag[j] & VLAG.OMLIJN)) continue;
        const achter = B.ramp[i] < 0 || (B.obj[i] !== B.obj[j] && diep[i] < diep[j] - 0.5);
        if (achter && diep[j] > besteDiep) {
          beste = j;
          besteDiep = diep[j];
          licht = kant;
        }
      }
      if (beste >= 0) {
        ramp[i] = B.ramp[beste];
        stap[i] = licht && o.selout !== false ? 1 : 0;
        vlag[i] = VLAG.VAST | VLAG.GLAD | VLAG.OMLIJN;
        continue;
      }
      // binnenlijnen
      if (!(B.vlag[i] & VLAG.OMLIJN) || B.vlag[i] & VLAG.GLOEI) continue;
      for (const [dx, dy] of buren) {
        const x = px + dx;
        const y = py + dy;
        if (x < 0 || y < 0 || x >= B.b || y >= B.h) continue;
        const j = y * B.b + x;
        if (!(B.vlag[j] & VLAG.OMLIJN)) continue;
        if (B.deel[j] !== B.deel[i] && diep[j] > diep[i] + naad) {
          stap[i] = Math.min(stap[i], B.stap[i] - 1.6);
          break;
        }
      }
    }
  }
  B.ramp = ramp;
  B.stap = stap;
  B.vlag = vlag;
}

// ---------------------------------------------------------------- naar pixels

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
// Van zwevende stappen naar vaste kleuren. Alleen in een smalle strook rond de grens tussen
// twee stappen wordt gedithered (een dambord), zodat er schone vlakken blijven.
function kwantiseer(B, o = {}) {
  const smal = o.smal ?? 0.07;
  const uit = new Int16Array(B.b * B.h * 2).fill(-1);
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      const r = B.ramp[i];
      if (r < 0) continue;
      const s = B.stap[i];
      let q;
      if (B.vlag[i] & VLAG.GLAD) q = Math.round(s);
      else {
        const fl = Math.floor(s);
        const fr = s - fl;
        if (fr < 0.5 - smal) q = fl;
        else if (fr > 0.5 + smal) q = fl + 1;
        else q = fl + ((px + py) % 2 === 0 ? 1 : 0);
      }
      uit[i * 2] = r;
      uit[i * 2 + 1] = klem(q, 0, RAMP_LEN[r] - 1);
    }
  }
  return { b: B.b, h: B.h, px: uit };
}

// Een plaatje met vaste kleuren: ramp en stap per pixel (of -1).
class Plaat {
  constructor(b, h) {
    this.b = b;
    this.h = h;
    this.px = new Int16Array(b * h * 2).fill(-1);
  }
  static van(k) {
    const p = new Plaat(k.b, k.h);
    p.px = k.px;
    return p;
  }
  zet(x, y, ramp, stap) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return;
    const i = (y * this.b + x) * 2;
    this.px[i] = typeof ramp === 'string' ? RAMP[ramp] : ramp;
    this.px[i + 1] = klem(stap, 0, RAMP_LEN[this.px[i]] - 1);
  }
  lees(x, y) {
    if (x < 0 || y < 0 || x >= this.b || y >= this.h) return null;
    const i = (y * this.b + x) * 2;
    return this.px[i] < 0 ? null : [this.px[i], this.px[i + 1]];
  }
  plak(p, x, y) {
    for (let j = 0; j < p.h; j++) {
      for (let i = 0; i < p.b; i++) {
        const k = p.lees(i, j);
        if (k) this.zet(x + i, y + j, k[0], k[1]);
      }
    }
  }
  uitsnede(x, y, b, h) {
    const p = new Plaat(b, h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < b; i++) {
        const k = this.lees(x + i, y + j);
        if (k) p.zet(i, j, k[0], k[1]);
      }
    }
    return p;
  }
  rgba(achtergrond = null) {
    const buf = Buffer.alloc(this.b * this.h * 4);
    const bg = achtergrond ? hexNaarRgb(achtergrond) : null;
    for (let i = 0; i < this.b * this.h; i++) {
      const r = this.px[i * 2];
      if (r < 0) {
        if (bg) {
          buf[i * 4] = bg[0];
          buf[i * 4 + 1] = bg[1];
          buf[i * 4 + 2] = bg[2];
          buf[i * 4 + 3] = 255;
        }
        continue;
      }
      const c = RAMP_RGB[r][this.px[i * 2 + 1]];
      buf[i * 4] = c[0];
      buf[i * 4 + 1] = c[1];
      buf[i * 4 + 2] = c[2];
      buf[i * 4 + 3] = 255;
    }
    return buf;
  }
}

// ---------------------------------------------------------------- PNG

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(plaat, schaal = 1, achtergrond = null) {
  const src = plaat.rgba(achtergrond);
  // b/h moeten hele pixels zijn: bij een niet-heel getal (een schaal als 1.49, om net onder een
  // maximum te passen, zie dorpelingen-anim.cjs) is x*4+1 dat ook niet, en Buffer/TypedArray
  // negeren een schrijfactie op een niet-heel index stilletjes — dan komt er bijna niets in raw
  // terecht en is de plaat straks vrijwel leeg. Math.round ronden en de rij/kolom-opzoeking
  // klemmen voorkomt dat (bij naar boven afronden zou de laatste rij/kolom anders net over de
  // rand van plaat.b/plaat.h heen kunnen lezen).
  const b = Math.round(plaat.b * schaal);
  const h = Math.round(plaat.h * schaal);
  const raw = Buffer.alloc((b * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    const rij = y * (b * 4 + 1);
    const sy = Math.min(plaat.h - 1, Math.floor(y / schaal));
    for (let x = 0; x < b; x++) {
      const s = (sy * plaat.b + Math.min(plaat.b - 1, Math.floor(x / schaal))) * 4;
      const o = rij + 1 + x * 4;
      raw[o] = src[s];
      raw[o + 1] = src[s + 1];
      raw[o + 2] = src[s + 2];
      raw[o + 3] = src[s + 3];
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(b, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// Een figuur of voorwerp los renderen, op een doorzichtige achtergrond. anker = de pixel waar
// het midden van de tegel (de voeten) valt.
function losRenderen(model, o = {}) {
  const b = o.b || 96;
  const h = o.h || 112;
  const [ax, ay] = o.anker || [Math.floor(b / 2), h - 12];
  const B = new Beeld(b, h, ax, ay);
  tekenModel(B, model, { richting: o.richting || 'Z', ...o.model });
  belicht(B);
  omlijn(B);
  return Plaat.van(kwantiseer(B, o));
}

module.exports = {
  RAMPEN,
  RAMP,
  RAMP_NAMEN,
  RAMP_LEN,
  RAMP_RGB,
  hash,
  rnd,
  klem,
  mix,
  glad,
  ruis2,
  ruis3,
  TEGEL,
  PXH,
  V,
  EX,
  EY,
  LICHT,
  RICHTING,
  KANTEN,
  VLAG,
  UIT,
  Beeld,
  Plaat,
  doos,
  tekenDozen,
  bouwSdf,
  sdf,
  tekenModel,
  schaduwOpVloer,
  belicht,
  verwarm,
  omlijn,
  kwantiseer,
  naarScherm,
  tegelNaarScherm,
  png,
  losRenderen,
  BAYER4: BAYER,
};
