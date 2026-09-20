// De toren van de oude meester, van buiten, in drie staten: krakkemikkig (zoals de tovenaar hem
// erft), half hersteld (steigers, nieuwe stenen, een nieuwe deur) en hersteld (recht, een schoon
// dak met een gouden bol, vaandels en licht achter de ramen).
//
// De toren is te hoog en te smal voor tekenModel, die met één grensbol rekent, en hij heeft een
// zon nodig die over alles heen schaduw werpt: het dak op de muur, de steiger op de stenen. Daarom
// staat hier een eigen tekenaar voor afstandsvelden in wereldcoördinaten. Delen zitten in groepen
// met een staande cilinder als grens, de zon werpt schaduw over de hele toren, en een patroon weet
// hoe groot een pixel op het oppervlak is. Zo worden voegen precies één pixel breed, ook op een
// ronde muur. De regels voor licht en kleur zijn die van tekenModel, zodat de toren naast de
// figuren past.
//
// Assen als in kern.cjs: +x rechtsonder in beeld, +y linksonder, z omhoog. Het midden van de voet
// van de toren is de oorsprong. Hoeken rond de toren (phi) in graden: 45 kijkt recht naar de
// camera, 135 is de linkerrand in beeld, -45 de rechterrand. Hoogtes in pixels heten H.
'use strict';
const K = require('./kern.cjs');
const { TEGEL, PXH, RAMP, VLAG, UIT, EX, EY, LICHT, hash, rnd, ruis2, ruis3, klem, mix, glad, sdf } = K;

const [V0, V1, V2] = K.V;
const [L0, L1, L2] = LICHT;
const norm3 = (x, y, z) => {
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
};
const RANDLICHT = norm3(0.15, -0.85, 0.5);
const GRAAD = Math.PI / 180;
const E = (h) => h / PXH; // pixels hoogte naar eenheden
const hoekVerschil = (a, b) => {
  let d = a - b;
  if (d > Math.PI) d -= 2 * Math.PI;
  else if (d < -Math.PI) d += 2 * Math.PI;
  return d;
};
const kans = (a, b, c) => hash(a, b, c) / 4294967296;

// ---------------------------------------------------------------- assenstelsels

// Een draaiing die de z-as `graden` laat hellen naar richting `naar` (graden in het grondvlak).
function helMatrix(graden, naar) {
  const a = graden * GRAAD;
  const l = naar * GRAAD;
  const k0 = -Math.sin(l);
  const k1 = Math.cos(l);
  const c = Math.cos(a);
  const s = Math.sin(a);
  const t = 1 - c;
  return [
    [c + t * k0 * k0, t * k0 * k1, s * k1],
    [t * k0 * k1, c + t * k1 * k1, -s * k0],
    [-s * k1, s * k0, c],
  ];
}
const EENHEID = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];
function maalM(A, B) {
  return A.map((rij) => [0, 1, 2].map((j) => rij[0] * B[0][j] + rij[1] * B[1][j] + rij[2] * B[2][j]));
}

// Een assenstelsel met oorsprong b en draaiing R (lokaal naar wereld).
function stelsel(b, R = EENHEID) {
  const [bx, by, bz] = b;
  const [[r00, r01, r02], [r10, r11, r12], [r20, r21, r22]] = R;
  return {
    b,
    R,
    lok: (x, y, z) => {
      const dx = x - bx;
      const dy = y - by;
      const dz = z - bz;
      return [r00 * dx + r10 * dy + r20 * dz, r01 * dx + r11 * dy + r21 * dz, r02 * dx + r12 * dy + r22 * dz];
    },
    wereld: (x, y, z) => [bx + r00 * x + r01 * y + r02 * z, by + r10 * x + r11 * y + r12 * z, bz + r20 * x + r21 * y + r22 * z],
    // een afstandsveld in lokale maten als veld in de wereld
    veld: (fl) => (x, y, z) => {
      const dx = x - bx;
      const dy = y - by;
      const dz = z - bz;
      return fl(r00 * dx + r10 * dy + r20 * dz, r01 * dx + r11 * dy + r21 * dz, r02 * dx + r12 * dy + r22 * dz);
    },
    kind(o, R2 = EENHEID) {
      return stelsel(this.wereld(...o), maalM(R, R2));
    },
  };
}

// ---------------------------------------------------------------- de wereld als afstandsveld

// Een deel: { f(x, y, z) in wereldmaten, g: [x, y, z, r] (grensbol) of grens: [x, y, r, z0, z1]
// (staande cilinder), m: materiaalnaam of functie(x, y, z) → naam, deel: nummer, k: zachte naad }.
class Wereld {
  constructor() {
    this.groepen = [];
    this.mat = {};
    this.lichten = [];
  }
  groep(naam) {
    const g = { naam, delen: [] };
    this.groepen.push(g);
    return g;
  }
}
function voeg(groep, deel) {
  deel.groep = groep;
  groep.delen.push(deel);
  return deel;
}

function sluitGroep(g) {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  let z0 = Infinity;
  let z1 = -Infinity;
  let k = 0;
  const cil = [];
  for (const p of g.delen) {
    let cx;
    let cy;
    let r;
    let za;
    let zb;
    if (p.g) {
      [cx, cy] = p.g;
      r = p.g[3];
      za = p.g[2] - r;
      zb = p.g[2] + r;
    } else if (p.grens) [cx, cy, r, za, zb] = p.grens;
    else throw new Error(`deel zonder grens in ${g.naam}`);
    cil.push([cx, cy, r]);
    x0 = Math.min(x0, cx - r);
    x1 = Math.max(x1, cx + r);
    y0 = Math.min(y0, cy - r);
    y1 = Math.max(y1, cy + r);
    z0 = Math.min(z0, za);
    z1 = Math.max(z1, zb);
    k = Math.max(k, p.k || 0);
  }
  g.cx = (x0 + x1) / 2;
  g.cy = (y0 + y1) / 2;
  g.cr = Math.max(...cil.map(([x, y, r]) => Math.hypot(x - g.cx, y - g.cy) + r)) + 0.5;
  g.z0 = z0 - 0.5;
  g.z1 = z1 + 0.5;
  g.kmax = k;
}

// Het veld van een lijst groepen; WIN is daarna het deel dat het dichtst bij ligt.
let WIN = null;
function veld(lijst, n, x, y, z) {
  let d = 1e9;
  let w = null;
  for (let gi = 0; gi < n; gi++) {
    const g = lijst[gi];
    const dx = x - g.cx;
    const dy = y - g.cy;
    const dr = Math.sqrt(dx * dx + dy * dy) - g.cr;
    const dz = Math.max(g.z0 - z, z - g.z1);
    const gd = dr > 0 ? (dz > 0 ? Math.hypot(dr, dz) : dr) : dz > 0 ? dz : Math.max(dr, dz);
    if (gd > d + g.kmax) continue;
    const delen = g.delen;
    for (let i = 0; i < delen.length; i++) {
      const p = delen[i];
      if (p.g) {
        const ex = x - p.g[0];
        const ey = y - p.g[1];
        const ez = z - p.g[2];
        if (Math.sqrt(ex * ex + ey * ey + ez * ez) - p.g[3] > d + (p.k || 0)) continue;
      }
      const t = p.f(x, y, z);
      if (p.k) {
        const h = Math.max(p.k - Math.abs(d - t), 0) / p.k;
        if (t < d) w = p;
        d = Math.min(d, t) - h * h * p.k * 0.25;
      } else if (t < d) {
        d = t;
        w = p;
      }
    }
  }
  WIN = w;
  return d;
}

// [tin, tuit] van de straal o + v·t door de grenscilinder van groep g, of null.
function doorGroep(g, ox, oy, oz, vx, vy, vz) {
  const px = ox - g.cx;
  const py = oy - g.cy;
  const a = vx * vx + vy * vy;
  let t0 = -Infinity;
  let t1 = Infinity;
  if (a > 1e-9) {
    const b = px * vx + py * vy;
    const c = px * px + py * py - g.cr * g.cr;
    const disc = b * b - a * c;
    if (disc < 0) return null;
    const s = Math.sqrt(disc);
    t0 = (-b - s) / a;
    t1 = (-b + s) / a;
  } else if (px * px + py * py > g.cr * g.cr) return null;
  if (Math.abs(vz) > 1e-9) {
    let za = (g.z0 - oz) / vz;
    let zb = (g.z1 - oz) / vz;
    if (za > zb) [za, zb] = [zb, za];
    t0 = Math.max(t0, za);
    t1 = Math.min(t1, zb);
  } else if (oz < g.z0 || oz > g.z1) return null;
  return t0 <= t1 ? [t0, t1] : null;
}

// ---------------------------------------------------------------- de tekenaar

// Tekent de wereld W in beeld B. Per pixel één straal, en negen waar de buren verschillen (randen
// en naden), zoals tekenModel. Licht: de zon (LICHT) met schaduw van alles in W, omgevingsschaduw
// en randlicht, met dezelfde formule als tekenModel. Een patroon krijgt een object C met de plek
// (x, y, z), de normaal, het licht, de stap, de pixel (px, py) en dxv/dyv: hoe ver het oppervlak
// opschuift bij één pixel naar rechts of omlaag. o.plek = [X, Y] (eenheden) zet de wereld op een
// andere plek in het beeld. Geeft het veld en de schaduwvragen terug, in beeldcoördinaten.
function tekenWereld(B, W, o = {}) {
  const [TX, TY] = o.plek || [0, 0];
  const alle = W.groepen.filter((g) => g.delen.length);
  for (const g of alle) {
    sluitGroep(g);
    g.obj = B.volgendObj++;
  }
  const NG = alle.length;
  const f = (x, y, z) => veld(alle, NG, x, y, z);
  if (!B.zon) B.zon = new Float32Array(B.b * B.h);
  const matNr = new Map(Object.keys(W.mat).map((n, i) => [n, i]));

  // het schermkader van alle grenscilinders
  let sx0 = Infinity;
  let sx1 = -Infinity;
  let sy0 = Infinity;
  let sy1 = -Infinity;
  for (const g of alle) {
    for (const [dx, dy] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) {
      for (const z of [g.z0, g.z1]) {
        const [sx, sy] = K.naarScherm(B, g.cx + dx * g.cr + TX, g.cy + dy * g.cr + TY, z);
        sx0 = Math.min(sx0, sx);
        sx1 = Math.max(sx1, sx);
        sy0 = Math.min(sy0, sy);
        sy1 = Math.max(sy1, sy);
      }
    }
  }
  const X0 = Math.max(0, Math.floor(sx0) - 2);
  const X1 = Math.min(B.b - 1, Math.ceil(sx1) + 2);
  const Y0 = Math.max(0, Math.floor(sy0) - 2);
  const Y1 = Math.min(B.h - 1, Math.ceil(sy1) + 2);
  if (X1 < X0 || Y1 < Y0) return null;

  // Een grof rooster over het scherm: welke groepen kunnen een pixel in dit vak nog raken? In een
  // grote scène (een erf met tientallen groepen) scheelt dat veel: een straal vraagt alleen de
  // groepen van zijn eigen vak.
  const VAK = 48;
  const kx = Math.ceil((X1 - X0 + 1) / VAK);
  const ky = Math.ceil((Y1 - Y0 + 1) / VAK);
  const vakken = Array.from({ length: kx * ky }, () => []);
  for (const g of alle) {
    let a0 = Infinity;
    let a1 = -Infinity;
    let b0 = Infinity;
    let b1 = -Infinity;
    for (const [dx, dy] of [[-1, -1], [1, 1], [-1, 1], [1, -1]]) {
      for (const z of [g.z0, g.z1]) {
        const [sx, sy] = K.naarScherm(B, g.cx + dx * g.cr + TX, g.cy + dy * g.cr + TY, z);
        a0 = Math.min(a0, sx);
        a1 = Math.max(a1, sx);
        b0 = Math.min(b0, sy);
        b1 = Math.max(b1, sy);
      }
    }
    const i0 = Math.max(0, Math.floor((a0 - 1 - X0) / VAK));
    const i1 = Math.min(kx - 1, Math.floor((a1 + 1 - X0) / VAK));
    const j0 = Math.max(0, Math.floor((b0 - 1 - Y0) / VAK));
    const j1 = Math.min(ky - 1, Math.floor((b1 + 1 - Y0) / VAK));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) vakken[j * kx + i].push(g);
  }

  const lijst = new Array(NG);
  function straal(sx, sy) {
    const ax = sx - B.OX;
    const ay = sy - B.OY;
    const ox = ax * EX[0] + ay * EY[0] - TX;
    const oy = ax * EX[1] + ay * EY[1] - TY;
    const oz = ay * EY[2];
    const vak = vakken[klem(Math.floor((sy - Y0) / VAK), 0, ky - 1) * kx + klem(Math.floor((sx - X0) / VAK), 0, kx - 1)];
    let n = 0;
    let t0 = Infinity;
    let t1 = -Infinity;
    for (let gi = 0; gi < vak.length; gi++) {
      const r = doorGroep(vak[gi], ox, oy, oz, V0, V1, V2);
      if (!r) continue;
      lijst[n++] = vak[gi];
      if (r[0] < t0) t0 = r[0];
      if (r[1] > t1) t1 = r[1];
    }
    if (!n) return null;
    let t = t0 - 0.5;
    for (let i = 0; i < 1200 && t < t1 + 0.5; i++) {
      const x = ox + V0 * t;
      const y = oy + V1 * t;
      const z = oz + V2 * t;
      const d = veld(lijst, n, x, y, z);
      if (d < 0.02) {
        const p = WIN;
        return [t, x, y, z, p, typeof p.m === 'function' ? p.m(x, y, z) : p.m];
      }
      t += Math.max(d * 0.75, 0.02);
    }
    return null;
  }

  const zonLijst = new Array(NG);
  function lijstNaarZon(x, y, z) {
    let n = 0;
    let t1 = 0;
    for (let gi = 0; gi < NG; gi++) {
      const r = doorGroep(alle[gi], x, y, z, L0, L1, L2);
      if (!r || r[1] < 0) continue;
      zonLijst[n++] = alle[gi];
      if (r[1] > t1) t1 = r[1];
    }
    return [n, t1];
  }
  // harde schaduw: ligt er iets tussen dit punt en de zon?
  function inSchaduw(x, y, z) {
    const [n, t1] = lijstNaarZon(x, y, z);
    let t = 0.6;
    for (let i = 0; i < 400 && t < t1; i++) {
      const d = veld(zonLijst, n, x + L0 * t, y + L1 * t, z + L2 * t);
      if (d < 0.05) return true;
      t += Math.max(d * 0.8, 0.2);
    }
    return false;
  }
  // zachte schaduw (voor de grond): 1 is volle zon, 0 volle schaduw
  function zacht(x, y, z, k = 9) {
    const [n, t1] = lijstNaarZon(x, y, z);
    let res = 1;
    let t = 1;
    for (let i = 0; i < 300 && t < t1; i++) {
      const d = veld(zonLijst, n, x + L0 * t, y + L1 * t, z + L2 * t);
      if (d < 0.02) return 0;
      res = Math.min(res, (k * d) / t);
      t += klem(d * 0.8, 0.3, 40);
    }
    return klem(res, 0, 1);
  }

  // eerste ronde
  const Wd = X1 - X0 + 1;
  const Hd = Y1 - Y0 + 1;
  const eerste = new Array(Wd * Hd);
  for (let j = 0; j < Hd; j++) for (let i = 0; i < Wd; i++) eerste[j * Wd + i] = straal(X0 + i + 0.5, Y0 + j + 0.5);
  const sleutel = (s) => (s ? s[4].groep.obj * 100000 + (s[4].deel ?? 0) * 100 + matNr.get(s[5]) : -1);
  const SUB = [-1 / 3, 0, 1 / 3];
  const C = { dxv: [0, 0, 0], dyv: [0, 0, 0] };

  for (let j = 0; j < Hd; j++) {
    for (let i = 0; i < Wd; i++) {
      const midden = eerste[j * Wd + i];
      const k0 = sleutel(midden);
      let rand = false;
      for (let dj = -1; dj <= 1 && !rand; dj++) {
        for (let di = -1; di <= 1; di++) {
          const ii = i + di;
          const jj = j + dj;
          if (ii < 0 || jj < 0 || ii >= Wd || jj >= Hd) continue;
          if (sleutel(eerste[jj * Wd + ii]) !== k0) {
            rand = true;
            break;
          }
        }
      }
      let gekozen;
      if (rand) {
        const raak = [];
        for (const sj of SUB) {
          for (const si of SUB) {
            const s = si === 0 && sj === 0 ? midden : straal(X0 + i + 0.5 + si, Y0 + j + 0.5 + sj);
            if (s) raak.push(s);
          }
        }
        if (raak.length < 5) continue;
        const stemmen = new Map();
        for (const s of raak) {
          const sk = sleutel(s);
          stemmen.set(sk, (stemmen.get(sk) || 0) + (W.mat[s[5]].detail ? 2.6 : 1));
        }
        let win = -1;
        let max = -1;
        for (const [m, n] of stemmen) {
          if (n > max) {
            max = n;
            win = m;
          }
        }
        gekozen = raak.filter((s) => sleutel(s) === win);
      } else {
        if (!midden) continue;
        gekozen = [midden];
      }
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
      const p = gekozen[0][4];
      const matNaam = gekozen[0][5];
      const mat = W.mat[matNaam];
      if (!mat) throw new Error(`geen materiaal ${matNaam}`);
      const px = X0 + i;
      const py = Y0 + j;
      const idx = py * B.b + px;
      if (-t <= B.diep[idx]) continue;

      const e = 0.3;
      let nx = f(x + e, y, z) - f(x - e, y, z);
      let ny = f(x, y + e, z) - f(x, y - e, z);
      let nz = f(x, y, z + e) - f(x, y, z - e);
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;
      const kijk = -(nx * V0 + ny * V1 + nz * V2);
      const kk = Math.max(kijk, 0.15);
      const nEX = nx * EX[0] + ny * EX[1];
      const nEY = nx * EY[0] + ny * EY[1] + nz * EY[2];
      C.dxv[0] = EX[0] + (V0 * nEX) / kk;
      C.dxv[1] = EX[1] + (V1 * nEX) / kk;
      C.dxv[2] = (V2 * nEX) / kk;
      C.dyv[0] = EY[0] + (V0 * nEY) / kk;
      C.dyv[1] = EY[1] + (V1 * nEY) / kk;
      C.dyv[2] = EY[2] + (V2 * nEY) / kk;
      C.x = x;
      C.y = y;
      C.z = z;
      C.nx = nx;
      C.ny = ny;
      C.nz = nz;
      C.kijk = kijk;
      C.px = px;
      C.py = py;
      C.deel = p;

      let stap;
      let ramp = RAMP[mat.ramp];
      let vlag = mat.omlijn === false ? 0 : VLAG.OMLIJN;
      let licht = 0;
      let zon = 0;
      let ao = 1;
      if (mat.gloei) {
        stap = mat.gloei(C);
        vlag |= VLAG.GLOEI | VLAG.GLAD;
      } else {
        const nL = nx * L0 + ny * L1 + nz * L2;
        licht = Math.max(0, mat.omslag ? (nL + mat.omslag) / (1 + mat.omslag) : nL);
        zon = licht;
        if (licht > 0 && mat.schaduw !== false && inSchaduw(x + nx * 0.6, y + ny * 0.6, z + nz * 0.6)) {
          licht *= mat.schaduwKracht ?? 0.35;
          zon = 0;
        }
        let a = 0;
        for (let s = 1; s <= 4; s++) {
          const h = s * 1.6;
          a += (h - f(x + nx * h, y + ny * h, z + nz * h)) / (1 << s);
        }
        ao = klem(1 - a * 0.5, 0.35, 1);
        const rim = Math.pow(1 - Math.max(0, kijk), 2.5) * Math.max(0, nx * RANDLICHT[0] + ny * RANDLICHT[1] + nz * RANDLICHT[2]);
        const b = (0.24 + 0.76 * licht) * (0.45 + 0.55 * ao);
        stap = mat.lo + (mat.hi - mat.lo) * b + rim * (mat.rand ?? 1.4);
        if (mat.glans) {
          const hx = L0 - V0;
          const hy = L1 - V1;
          const hz = L2 - V2;
          const hl = Math.hypot(hx, hy, hz);
          stap += Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), mat.glansMacht || 24) * mat.glans * (zon > 0 ? 1 : 0.3);
        }
      }
      C.stap = stap;
      C.licht = licht;
      C.zon = zon;
      C.ao = ao;
      if (mat.patroon) {
        const r = mat.patroon(C);
        if (typeof r === 'number') stap += r;
        else if (r) {
          if (r.ramp !== undefined) ramp = RAMP[r.ramp];
          if (r.stap !== undefined) stap = r.stap;
          if (r.plus !== undefined) stap += r.plus;
          if (r.gloei) vlag |= VLAG.GLOEI | VLAG.GLAD;
          if (r.vast) vlag |= VLAG.VAST;
        }
      }
      if (mat.dither !== true) vlag |= VLAG.GLAD;
      B.ramp[idx] = ramp;
      B.stap[idx] = stap;
      B.diep[idx] = -t;
      B.obj[idx] = p.groep.obj;
      B.deel[idx] = p.deel ?? 0;
      B.vlag[idx] = vlag;
      B.pos[idx * 3] = x + TX;
      B.pos[idx * 3 + 1] = y + TY;
      B.pos[idx * 3 + 2] = z;
      B.nrm[idx * 3] = nx;
      B.nrm[idx * 3 + 1] = ny;
      B.nrm[idx * 3 + 2] = nz;
      B.zon[idx] = zon;
    }
  }
  return {
    f: (x, y, z) => f(x - TX, y - TY, z),
    inSchaduw: (x, y, z) => inSchaduw(x - TX, y - TY, z),
    zacht: (x, y, z, k) => zacht(x - TX, y - TY, z, k),
    groepen: alle,
    plek: [TX, TY],
  };
}

// ---------------------------------------------------------------- vormen

// Afstand (in pixels) tot de vorm van een opening in een muur: recht van H0 tot Hm, daarboven een
// ronde boog, of een spitsboog als spits gegeven is (de straal van de bogen in halve breedtes).
// a loopt langs de muur (eenheden, op de voorkant gelijk aan pixels), h is de hoogte in pixels.
function boogVorm(a, h, hw, H0, Hm, spits) {
  const aa = Math.abs(a);
  const rx = aa - hw;
  const ry = Math.max(H0 - h, h - Hm);
  const d = rx > 0 || ry > 0 ? Math.hypot(Math.max(rx, 0), Math.max(ry, 0)) : Math.max(rx, ry);
  let db;
  if (spits) {
    const rho = hw * spits;
    db = Math.hypot(aa + (rho - hw), h - Hm) - rho;
  } else db = Math.hypot(aa, h - Hm) - hw;
  return Math.min(d, Math.max(db, Hm - h));
}
// de top van zo'n boog
const boogTop = (hw, Hm, spits) => (spits ? Hm + Math.sqrt(2 * spits * hw * hw - hw * hw) : Hm + hw);

// een rechthoek in 2D, gedraaid (graden), met halve maten hx, hy
function draaiRechthoek(a, h, ca, ch, hoek, hx, hy) {
  const c = Math.cos(hoek * GRAAD);
  const s = Math.sin(hoek * GRAAD);
  const da = a - ca;
  const dh = h - ch;
  const u = Math.abs(da * c + dh * s) - hx;
  const v = Math.abs(-da * s + dh * c) - hy;
  return u > 0 || v > 0 ? Math.hypot(Math.max(u, 0), Math.max(v, 0)) : Math.max(u, v);
}

// afgeknotte kegel van z0 (straal r0) tot z1 (straal r1), naar Inigo Quilez
function kegelStomp(x, y, z, z0, z1, r0, r1) {
  const h = (z1 - z0) / 2;
  const qx = Math.hypot(x, y);
  const qy = z - (z0 + z1) / 2;
  const k2x = r1 - r0;
  const k2y = 2 * h;
  const cax = qx - Math.min(qx, qy < 0 ? r0 : r1);
  const cay = Math.abs(qy) - h;
  const t = klem(((r1 - qx) * k2x + (h - qy) * k2y) / (k2x * k2x + k2y * k2y), 0, 1);
  const cbx = qx - r1 + k2x * t;
  const cby = qy - h + k2y * t;
  const s = cbx < 0 && cay < 0 ? -1 : 1;
  return s * Math.sqrt(Math.min(cax * cax + cay * cay, cbx * cbx + cby * cby));
}

// een balk tussen twee punten met een rechthoekige doorsnede (breedte b, dikte d); `op` wijst
// ongeveer de kant van de dikte uit
function balk(a, b, hb, hd, op = [0, 0, 1], r = 0.3) {
  const ux = b[0] - a[0];
  const uy = b[1] - a[1];
  const uz = b[2] - a[2];
  const L = Math.hypot(ux, uy, uz);
  const u = [ux / L, uy / L, uz / L];
  // d: loodrecht op u, zo dicht mogelijk bij `op`
  let d = [op[0] - u[0] * (op[0] * u[0] + op[1] * u[1] + op[2] * u[2]), op[1] - u[1] * (op[0] * u[0] + op[1] * u[1] + op[2] * u[2]), op[2] - u[2] * (op[0] * u[0] + op[1] * u[1] + op[2] * u[2])];
  d = norm3(...d);
  const w = [u[1] * d[2] - u[2] * d[1], u[2] * d[0] - u[0] * d[2], u[0] * d[1] - u[1] * d[0]];
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  return {
    f: (x, y, z) => {
      const px = x - m[0];
      const py = y - m[1];
      const pz = z - m[2];
      return sdf.doos(px * u[0] + py * u[1] + pz * u[2], px * w[0] + py * w[1] + pz * w[2], px * d[0] + py * d[1] + pz * d[2], L / 2, hb, hd, r);
    },
    g: [m[0], m[1], m[2], Math.hypot(L / 2, hb, hd) + 0.5],
    // lokale maten voor een patroon: langs, breed, dik
    lok: (x, y, z) => {
      const px = x - m[0];
      const py = y - m[1];
      const pz = z - m[2];
      return [px * u[0] + py * u[1] + pz * u[2], px * w[0] + py * w[1] + pz * w[2], px * d[0] + py * d[1] + pz * d[2]];
    },
    L,
  };
}
// een ronde paal of stok tussen twee punten
function stok(a, b, r) {
  return {
    f: (x, y, z) => sdf.capsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], r),
    g: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + r + 0.5],
  };
}

// ---------------------------------------------------------------- stenen

const voegCache = new Map();
// de voegen in een rij stenen: posities langs de muur, lengtes lang..lang+spreiding
function voegenRij(zaad, rij, lang = 19, spreiding = 12) {
  const sleutel = `${zaad},${rij},${lang},${spreiding}`;
  let v = voegCache.get(sleutel);
  if (!v) {
    v = [];
    let u = -440 - (hash(zaad, rij + 5000, 1) % 26);
    while (u < 440) {
      v.push(u);
      u += lang + (hash(zaad, rij + 5000, u + 777) % spreiding);
    }
    voegCache.set(sleutel, v);
  }
  return v;
}

// Welke steen ligt er op plek (U, H) van een muur? U neemt naar links in beeld toe. mU en mH:
// hoeveel U en H er per schermpixel bij komen. Geeft de afstanden in pixels tot de vier randen
// van de steen: pl (links), pr (rechts), pb (onder), pt (boven).
function steenOp(U, H, mU, mH, zaad, hoog = 12, lang, spreiding) {
  const rij = Math.floor(H / hoog);
  const dH = H - rij * hoog;
  const v = voegenRij(zaad, rij, lang, spreiding);
  let lo = 0;
  let hi = v.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (v[m] <= U) lo = m;
    else hi = m;
  }
  const u0 = v[lo];
  const u1 = v[lo + 1];
  return {
    rij,
    u0,
    u1,
    pl: (u1 - U) / mU,
    pr: (U - u0) / mU,
    pb: dH / mH,
    pt: (hoog - dH) / mH,
    id: hash(zaad * 7 + rij, u0 & 0xffff, 13),
  };
}

// De stap van een steen, zoals steenPixel in kamers.cjs maar in schermpixels gemeten: een voeg
// van één pixel onder en rechts, een lichte bovenrand en linkerkant, een donkere rechterkant,
// afgebrokkelde hoekjes en putjes.
function steenStap(st, basis, px, py, o = {}) {
  if (st.pb < 1 || st.pr < 1) return basis - (o.voeg ?? 2.4);
  const h = st.id;
  let s = basis + (h % 100 < 15 ? -0.9 : h % 100 < 21 ? 0.8 : 0) + (h % 100 < 3 ? -1 : 0);
  if (o.vlak) s = basis + (h % 100 < 20 ? -0.5 : h % 100 < 30 ? 0.5 : 0);
  if (st.pt <= 1) s += 1;
  else if (st.pb < 2) s -= 0.8;
  if (st.pl <= 1) s += 0.6;
  if (st.pr < 2) s -= 0.8;
  if (!o.vlak && st.pt < 3 && st.pl < 3 && (h >> 9) % 4 === 0) return basis - 2;
  const p = hash(px * 3 + (o.zaad || 0), py * 5, 77);
  if (p % 23 === 0) s -= o.vlak ? 0.5 : 1;
  else if (p % 41 === 3) s += 0.8;
  return s;
}


// ---------------------------------------------------------------- de toren: maten

const R0 = 60; // straal van de romp aan de voet
const R1 = 55; // en boven
const H_TOP = 360; // bovenkant van de muur (px)
const Z_TOP = E(H_TOP);
const R_SOK = 66; // plint
const H_SOK = 20;
const H_SOK2 = 27;
const H_KRAAG = 324; // onderkant van de kraagstenen
const H_LIJST = 338; // kroonlijst van H_LIJST tot H_TOP
const BANDEN = [140, 250];
const H_DAK = 352; // de dakrand
const RU = 60; // U = hoek × RU: stenen even lang als binnen
const rompStraal = (z) => R0 + ((R1 - R0) * z) / Z_TOP;
const U_VAN = (graden) => graden * GRAAD * RU;

// De openingen: phi (graden), H0 onderkant, Hm begin van de boog, hw halve breedte, spits.
function openingen(S) {
  return [
    { naam: 'deur', phi: 58, H0: H_SOK2, Hm: 104, hw: 16, spits: 0, diep: 12, soort: 'deur' },
    { naam: 'spleet', phi: 27, H0: 60, Hm: 98, hw: 5, spits: 1.7, diep: 9, soort: S.ramen[0] },
    { naam: 'raamL', phi: 104, H0: 168, Hm: 210, hw: 9, spits: 1.6, diep: 9, soort: S.ramen[1] },
    { naam: 'raamR', phi: 14, H0: 176, Hm: 218, hw: 9, spits: 1.6, diep: 9, soort: S.ramen[2] },
    { naam: 'raamB', phi: 66, H0: 266, Hm: 300, hw: 11, spits: 1.6, diep: 9, soort: S.ramen[3] },
  ].map((o) => ({
    ...o,
    cos: Math.cos(o.phi * GRAAD),
    sin: Math.sin(o.phi * GRAAD),
    U: U_VAN(o.phi),
    top: boogTop(o.hw, o.Hm, o.spits),
    Rw: rompStraal(E((o.H0 + o.Hm) / 2)),
  }));
}
// een punt (lokaal in de toren) in de maten van een opening: a langs de muur (naar links in
// beeld), c de afstand tot de as in de richting van de opening, h de hoogte in pixels
function inOpening(o, qx, qy, qz) {
  return [-qx * o.sin + qy * o.cos, qx * o.cos + qy * o.sin, qz * PXH];
}

// ---------------------------------------------------------------- de staten

// Klimop: stengels in muurmaten. U = hoek × RU (135°, de linkerrand in beeld, is U = 141).
const KLIMOP = [
  { U: 96, A: 6, f: 0.045, ph: 0.4, drift: 0.03, top: 196, breed: 22 },
  { U: 121, A: 8, f: 0.038, ph: 2.1, drift: -0.02, top: 292, breed: 27 },
  { U: 142, A: 6, f: 0.05, ph: 1.2, drift: 0, top: 322, breed: 22 },
];
// in de halve staat is de klimop weggehaald waar de steiger staat; alleen achter de rand groeit
// hij nog, en op de muur blijven kale, dode stengels achter
const KLIMOP_REST = [{ U: 150, A: 5, f: 0.05, ph: 1.2, drift: 0, top: 240, breed: 16 }];

const STATEN = {
  krakkemikkig: {
    naam: 'krakkemikkig',
    helling: 3.2,
    dakHelling: 2.5,
    buig: [16, -36],
    zak: 7,
    ramen: ['dicht', 'gat', 'dicht', 'gat'],
    deur: 'scheef',
    schade: 1,
    bakstenen: true,
    scheuren: true,
    vlekken: 1,
    nieuw: 0,
    klimop: KLIMOP,
    dak: { oud: 1, mos: 1, los: 0.03, gaten: [[104, 92, 34, 44], [58, 30, 24, 22], [20, 150, 16, 30]], nieuw: null },
    puin: true,
    schuur: 'krak',
    top: 'krom',
    kraaien: true,
  },
  half: {
    naam: 'half',
    helling: 1.6,
    dakHelling: 1,
    buig: [0, 0],
    zak: 2,
    ramen: ['glas', 'dicht', 'glas', 'glas'],
    deur: 'nieuw',
    schade: 0.3,
    bakstenen: false,
    scheuren: false,
    vlekken: 0.55,
    nieuw: 1,
    klimop: KLIMOP_REST,
    kaleStengels: true,
    dak: { oud: 1, mos: 0.9, los: 0, gaten: [[106, 104, 26, 36]], nieuw: [58, 200] },
    puin: false,
    schuur: 'heel',
    top: 'tak',
    steiger: true,
    voorraad: true,
  },
  hersteld: {
    naam: 'hersteld',
    helling: 0,
    dakHelling: 0,
    buig: [0, 0],
    zak: 0,
    ramen: ['licht', 'licht', 'licht', 'licht'],
    deur: 'mooi',
    schade: 0,
    bakstenen: false,
    scheuren: false,
    vlekken: 0,
    nieuw: 0,
    klimop: null,
    dak: { oud: 0, mos: 0, los: 0, gaten: [], nieuw: 'alles' },
    puin: false,
    schuur: 'mooi',
    top: 'goud',
    vaandels: true,
    lantaarn: true,
    pad: true,
  },
};

// ---------------------------------------------------------------- de toren bouwen

function bouwToren(S) {
  const W = new Wereld();
  const T = stelsel([0, 0, 0], helMatrix(S.helling, 135));
  const OPN = openingen(S);
  S.T = T;
  S.OPN = OPN;

  // --- romp: een staande, iets tapse cilinder met de openingen eruit gesneden
  const romp = W.groep('romp');
  voeg(romp, {
    f: T.veld((x, y, z) => {
      const r = Math.hypot(x, y);
      let d = Math.max((r - rompStraal(z)) * 0.99, -z - 12, z - Z_TOP);
      if (d > 30) return d;
      for (const o of OPN) {
        const c = x * o.cos + y * o.sin;
        if (c < 20) continue;
        const a = -x * o.sin + y * o.cos;
        const dv = Math.max(boogVorm(a, z * PXH, o.hw, o.H0, o.Hm, o.spits) * PXH, o.Rw - o.diep - c);
        if (-dv > d) d = -dv;
      }
      return d;
    }),
    grens: [0, 0, R0 + 30, -14, Z_TOP + 30],
    m: 'romp',
    deel: 1,
  });
  // plint met een schuine bovenkant
  voeg(romp, {
    f: T.veld((x, y, z) => Math.min(sdf.cilinder(x, y, z, R_SOK, -12, E(H_SOK)), kegelStomp(x, y, z, E(H_SOK) - 0.01, E(H_SOK2), R_SOK, rompStraal(E(H_SOK2)) - 0.4))),
    grens: [0, 0, R_SOK + 30, -14, E(H_SOK2) + 30],
    m: 'plint',
    deel: 2,
  });
  // lijsten tussen de verdiepingen; bij de krakkemikkige toren is er een stuk uit
  for (const H of BANDEN) {
    voeg(romp, {
      f: T.veld((x, y, z) => {
        let d = sdf.cilinder(x, y, z, rompStraal(E(H)) + 2.6, E(H), E(H + 7));
        if (S.schade > 0.5 && H === 250) {
          const hoek = Math.atan2(y, x) / GRAAD;
          const uit = Math.abs(hoek - 86) - 5.5 + ((Math.abs(hoek * 7) % 3) - 1.5) * 0.4;
          d = Math.max(d, -Math.max(uit, rompStraal(E(H)) + 0.3 - Math.hypot(x, y)));
        }
        return d;
      }),
      grens: [0, 0, R0 + 30, E(H) - 20, E(H + 7) + 20],
      m: 'lijst',
      deel: 3,
    });
  }
  // kraagstenen en kroonlijst
  const NKRAAG = 20;
  voeg(romp, {
    f: T.veld((x, y, z) => {
      const phi = Math.atan2(y, x);
      const k = Math.round(phi / ((2 * Math.PI) / NKRAAG));
      const pk = (k * 2 * Math.PI) / NKRAAG;
      const a = -x * Math.sin(pk) + y * Math.cos(pk);
      const c = x * Math.cos(pk) + y * Math.sin(pk);
      const zm = E(H_KRAAG + (H_LIJST - H_KRAAG) / 2);
      const hh = E(H_LIJST - H_KRAAG) / 2;
      const Rk = rompStraal(zm);
      // de onderkant loopt schuin terug naar de muur
      const schuin = (c - Rk) * 0.9 - (z - (zm - hh)) * 0.8;
      let d = Math.max(sdf.doos(a, c - Rk, z - zm, 4.2, 5.5, hh, 0.4), schuin);
      // bij de krakkemikkige toren is er één weggevallen
      if (S.schade > 0.5 && (k + NKRAAG) % NKRAAG === 5) d = Math.max(d, zm + hh * 0.2 - z);
      return d;
    }),
    grens: [0, 0, R0 + 30, E(H_KRAAG) - 20, E(H_LIJST) + 20],
    m: 'kraag',
    deel: 4,
  });
  voeg(romp, {
    f: T.veld((x, y, z) => sdf.cilinder(x, y, z, rompStraal(Z_TOP) + 6.5, E(H_LIJST), Z_TOP + 2)),
    grens: [0, 0, R0 + 30, E(H_LIJST) - 20, Z_TOP + 22],
    m: 'lijst',
    deel: 5,
  });
  // treden voor de deur, van losse blokken
  const deur = OPN[0];
  for (let i = 0; i < 3; i++) {
    const uit = R_SOK + 8 + (2 - i) * 7;
    const breed = deur.hw + 7 - i * 1.5;
    voeg(romp, {
      f: T.veld((x, y, z) => {
        const a = -x * deur.sin + y * deur.cos;
        const c = x * deur.cos + y * deur.sin;
        // de onderste trede is bij de krakkemikkige toren verzakt: hij helt naar voren
        const zz = S.schade > 0.5 && i === 0 ? z + (c - 60) * 0.06 : z;
        return sdf.doos(a, c - (uit + 40) / 2, zz - E(i * 9 + 4.5) + 3, breed, (uit - 40) / 2, E(9) / 2 + 3, 0.6);
      }),
      g: [...T.wereld(deur.cos * 70, deur.sin * 70, E(14)), 38],
      m: 'trede',
      deel: 6,
      trede: i,
    });
  }

  bouwDak(W, S);
  bouwOpeningen(W, S, T, OPN);
  bouwTop(W, S);
  if (S.kraaien) bouwKraaien(W, S);
  if (S.puin) bouwPuin(W, S);
  if (S.schuur) bouwSchuur(W, S);
  if (S.steiger) bouwSteiger(W, S);
  if (S.voorraad) bouwVoorraad(W, S);
  if (S.vaandels) bouwVaandels(W, S);
  if (S.lantaarn) bouwLantaarn(W, S);

  // --- materialen
  const oud = S.schade > 0.5;
  W.mat.romp = { ramp: 'steen', lo: 1.2, hi: 8.3, rand: 0.7, patroon: (C) => rompTex(C, S) };
  W.mat.plint = { ramp: 'steen', lo: 1, hi: 8, rand: 0.7, patroon: (C) => plintTex(C, S) };
  W.mat.lijst = { ramp: 'steen', lo: 1.5, hi: 8.4, rand: 0.7, patroon: (C) => lijstTex(C, S) };
  W.mat.kraag = { ramp: 'steen', lo: 1.2, hi: 8.2, rand: 0.7, patroon: (C) => (hash(C.px, C.py, 3) % 19 === 0 ? -0.8 : 0) };
  W.mat.trede = { ramp: 'steen', lo: oud ? 1.1 : 1.5, hi: oud ? 6.8 : 7.4, rand: 0.6, patroon: (C) => tredeTex(C, S) };
  return W;
}

// ---------------------------------------------------------------- het dak

// Een kegel met een iets uitlopende rand, op de kroonlijst. Hij kan scheef staan, de punt kan
// afzakken (buig: verschuiving van de as, kwadratisch met de hoogte) en de rand kan doorzakken.
const DAK_R = 80;
const DAK_H = E(232);
const DAK_P = 1.18;
const dakStraal = (z) => DAK_R * Math.pow(Math.max(0, 1 - z / DAK_H), DAK_P);
const DAK_S = (() => {
  // schuine lengte langs het dak, als tabel
  const n = 600;
  const s = new Float64Array(n + 1);
  for (let i = 1; i <= n; i++) {
    const za = (DAK_H * (i - 1)) / n;
    const zb = (DAK_H * i) / n;
    s[i] = s[i - 1] + Math.hypot(zb - za, dakStraal(zb) - dakStraal(za));
  }
  return (z) => {
    const t = klem(z / DAK_H, 0, 1) * n;
    const i = Math.min(n - 1, Math.floor(t));
    return mix(s[i], s[i + 1], t - i);
  };
})();
const dakHelling = (z) => {
  const dz = 0.5;
  const dr = dakStraal(z + dz) - dakStraal(z);
  return dz / Math.hypot(dz, dr);
};
// waar de rand doorzakt: vooral links van het midden
const ZAK_PSI = 76 * GRAAD;
const zakking = (S, psi, z) => S.zak * Math.pow(Math.max(0, Math.cos(psi - ZAK_PSI)), 4) * Math.max(0, 1 - z / 70);

function bouwDak(W, S) {
  const D = S.T.kind([0, 0, E(H_DAK)], helMatrix(S.dakHelling, 135));
  S.D = D;
  const [bx, by] = S.buig;
  const dak = W.groep('dak');
  voeg(dak, {
    f: D.veld((x, y, z) => {
      const t = klem(z / DAK_H, 0, 1);
      const ax = x - bx * t * t;
      const ay = y - by * t * t;
      const psi = Math.atan2(ay, ax);
      const ze = z + zakking(S, psi, z);
      // een deuk in het krakkemikkige dak
      let rp = dakStraal(ze);
      if (S.zak > 3) rp -= 4 * Math.exp(-(((psi - 95 * GRAAD) / 0.4) ** 2) - ((ze - 95) / 38) ** 2);
      const d = (Math.hypot(ax, ay) - rp) * dakHelling(Math.max(0, ze)) * 0.9;
      return Math.max(d, -ze - 4.5, z - DAK_H);
    }),
    grens: [...D.wereld(0, 0, 0).slice(0, 2), DAK_R + 50, E(H_DAK) - 20, E(H_DAK) + DAK_H + 20],
    m: 'dak',
    deel: 10,
  });
  const d = S.dak;
  W.mat.dak = { ramp: 'dak', lo: d.oud ? 0.5 : 1.1, hi: d.oud ? 5.5 : 6.6, rand: 0.8, patroon: (C) => dakTex(C, S) };
}

// De coördinaten op het dak: psi (hoek), s (schuine lengte vanaf de rand) en de hoogte.
function dakCoord(S, x, y, z) {
  const [lx, ly, lz] = S.D.lok(x, y, z);
  const t = klem(lz / DAK_H, 0, 1);
  const [bx, by] = S.buig;
  const psi = Math.atan2(ly - by * t * t, lx - bx * t * t);
  const ze = lz + zakking(S, psi, lz);
  return [psi, DAK_S(ze), ze];
}

const RIJ_S = 10; // een rij pannen, schuin gemeten
const PAN_B = 11; // breedte van een pan
function pannenInRij(rij) {
  // straal halverwege de rij: zoek de hoogte bij deze schuine lengte (de tabel is monotoon)
  const s = (rij + 0.5) * RIJ_S;
  let lo = 0;
  let hi = DAK_H;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (DAK_S(m) < s) lo = m;
    else hi = m;
  }
  return Math.max(6, Math.round((2 * Math.PI * dakStraal(lo)) / PAN_B));
}
const panCache = new Map();
const pannen = (rij) => {
  let n = panCache.get(rij);
  if (n === undefined) panCache.set(rij, (n = pannenInRij(rij)));
  return n;
};
const panPlek = (psi, rij) => {
  const n = pannen(rij);
  const uv = (((psi / (2 * Math.PI) + 0.5) * n + (rij % 2) * 0.5) % n + n) % n;
  const j = Math.floor(uv);
  return [n, j, uv - j];
};
const panOnder = (u) => 0.42 * (1 - Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)));
// het midden van een pan, in graden en schuine lengte
const panMidden = (rij, j) => [((j + 0.5 - (rij % 2) * 0.5) / pannen(rij) - 0.5) * 360, (rij + 0.5) * RIJ_S];

// Leisteen-achtige schubben in rijen, elke rij een halve pan verschoven. Per pixel: welke schub
// ligt bovenop, hoe ver is het (in pixels) tot zijn onderrand en tot de rand van de schub erboven.
function schub(psi, s, mPsi, mS, weg) {
  const sv = s / RIJ_S;
  let rij = Math.floor(sv);
  let v = sv - rij;
  let [n, j, u] = panPlek(psi, rij);
  let bu = panOnder(u);
  let boven;
  if (v < bu && rij > 0) {
    boven = ((bu - v) * RIJ_S) / mS;
    rij -= 1;
    v += 1;
    [n, j, u] = panPlek(psi, rij);
    bu = panOnder(u);
  } else {
    const [, j2, u2] = panPlek(psi, rij + 1);
    // ligt de pan erboven er niet, dan werpt hij ook geen schaduw
    boven = weg && weg(rij + 1, j2) ? 99 : ((1 + panOnder(u2) - v) * RIJ_S) / mS;
  }
  const eigen = ((v - bu) * RIJ_S) / mS;
  const zij = (Math.min(u, 1 - u) * 2 * Math.PI) / n / mPsi;
  return { rij, j, u, v, n, boven, eigen, zij, id: hash(rij + 100, j, 41) };
}

// kans dat een pan weg is: gaten als vlekken, plus hier en daar een losse
function panWeg(S, rij, j) {
  const d = S.dak;
  if (!d.gaten.length && !d.los) return false;
  const [pc, sc] = panMidden(rij, j);
  let p = d.los;
  for (const [gp, gs, wp, ws] of d.gaten) {
    const dp = hoekVerschil(pc * GRAAD, gp * GRAAD) / GRAAD / wp;
    const ds = (sc - gs) / ws;
    // een grillige rand: de vlek is niet rond
    const rafel = (ruis2(pc * 0.08 + gp, sc * 0.05, 17) - 0.5) * 0.9;
    p = Math.max(p, 1.3 - (dp * dp + ds * ds) * 1.6 + rafel);
  }
  return kans(rij + 7, j, 99) < p;
}
function panNieuw(S, rij, j) {
  const n = S.dak.nieuw;
  if (!n) return false;
  if (n === 'alles') return true;
  const [pc, sc] = panMidden(rij, j);
  // een baan nieuwe pannen aan de kant van de steiger, met een rafelige rand
  const rafel = (kans(rij, j, 5) - 0.5) * 16;
  return pc + rafel > n[0] && pc + rafel < n[1] && sc < 185 + rafel;
}

function dakTex(C, S) {
  const [psi, s, lz] = dakCoord(S, C.x, C.y, C.z);
  const [psiA, sA] = dakCoord(S, C.x + C.dxv[0], C.y + C.dxv[1], C.z + C.dxv[2]);
  const [psiB, sB] = dakCoord(S, C.x + C.dyv[0], C.y + C.dyv[1], C.z + C.dyv[2]);
  const mPsi = Math.max(Math.abs(hoekVerschil(psiA, psi)), Math.abs(hoekVerschil(psiB, psi)), 1e-5);
  const mS = Math.max(Math.abs(sA - s), Math.abs(sB - s), 1e-4);
  const basis = C.stap;
  const D = S.dak;
  const weg = (r, j) => panWeg(S, r, j);
  // de rand onderaan: de kopse kant van de onderste pannen
  if (lz < 0.2) {
    const k = schub(psi, 0.01, mPsi, mS);
    if (weg(0, k.j)) return { ramp: 'schors', stap: basis - 0.6 };
    return { stap: basis - 0.7 + (k.zij < 0.5 ? -1.4 : 0) + (lz < -3.2 ? -0.8 : 0) + (panNieuw(S, 0, k.j) ? 0.5 : 0) };
  }
  let k = schub(psi, s, mPsi, mS, weg);
  if (weg(k.rij, k.j)) {
    // de pan is weg: eronder de pan van de rij lager (het bovenste stuk), of de latten en de
    // sporen, of het donker van de zolder
    const [, j2] = panPlek(psi, k.rij - 1);
    if (k.v < 0.62 && k.rij > 0 && !weg(k.rij - 1, j2)) return { stap: basis - 1.4 + (k.v > 0.55 ? -1 : 0) };
    // latten: een strook van drie pixels bovenin elke rij, met een lichte bovenkant; sporen: om
    // de 30 graden een balk van de rand naar de punt, onder de latten
    const sv = s / RIJ_S;
    const f = sv - Math.floor(sv);
    const pixRij = RIJ_S / mS;
    const inLat = (f * pixRij) - (pixRij - 4.5);
    const r = dakStraal(Math.max(0, lz));
    const ns = 12;
    const spoor = Math.round((psi / (2 * Math.PI)) * ns + 0.3);
    const dSpoor = hoekVerschil(psi, ((spoor - 0.3) / ns) * 2 * Math.PI) * r;
    const hout = D.nieuw ? 'hout' : 'schors';
    const gebroken = !D.nieuw && hash(Math.floor(sv), spoor, 3) % 5 === 0;
    if (inLat >= 0 && inLat < 3 && !gebroken) return { ramp: hout, stap: basis * 0.7 + 0.9 + (inLat >= 2 ? 1 : inLat < 1 ? -0.8 : 0) };
    if (Math.abs(dSpoor) < 2.2) return { ramp: hout, stap: basis * 0.55 + 0.2 + (dSpoor > 1.2 ? 0.8 : dSpoor < -1.2 ? -0.6 : 0) };
    return { ramp: 'inkt', stap: inLat >= -1.5 && inLat < 0 ? 0.3 : 1.1, vast: true };
  }
  const nieuw = panNieuw(S, k.rij, k.j);
  let st = basis + ((k.id % 7) - 3) * (nieuw ? 0.08 : 0.2);
  if (!nieuw && D.oud) {
    // oude pannen: hier en daar een donkere of een vervangen lichtere
    const h = k.id % 29;
    if (h === 0 || h === 7) st -= 1.1;
    else if (h === 3) st += 0.9;
  }
  // naast nieuwe pannen zien de oude er nog valer uit
  if (D.oud && D.nieuw) st += nieuw ? 1.3 : -0.9;
  // in de hersteld staat om de zes rijen een rij donkere pannen: een sierband
  const sier = D.nieuw === 'alles' && k.rij % 6 === 4;
  if (sier) st -= 1.4;
  if (k.boven < 1) return { stap: basis - 2.4 };
  if (k.boven < 2.2) st -= 0.9;
  if (k.eigen < 1) st += 0.9;
  else if (k.zij < 0.5 && k.v > 0.5) st -= 1.5;
  // mos op de oude pannen, vooral aan de schaduwkant en onderaan
  if (D.mos && !nieuw) {
    const m = ruis2(psi * 2.6 + 3, s * 0.07, 8) * 0.6 + ruis2(psi * 7, s * 0.2, 9) * 0.4;
    const drempel = 0.8 - D.mos * (0.04 + 0.1 * Math.max(0, -Math.sin(psi - 0.4)) + 0.08 * Math.max(0, 1 - s / 50));
    if (m > drempel && k.eigen >= 1) {
      const rand = m < drempel + 0.025;
      return { ramp: 'mos', stap: klem(0.3 + (basis - 0.5) * 0.7 + (rand ? -0.6 : 0) + (hash(C.px, C.py, 8) % 5 === 0 ? 0.7 : 0), 0, 5) };
    }
  }
  return { stap: st };
}

// ---------------------------------------------------------------- de top: windvaan, tak of gouden bol

function bouwTop(W, S) {
  const [bx, by] = S.buig;
  const D = S.D;
  // de punt en de richting van de as daar
  const tip = D.wereld(bx, by, DAK_H - 3);
  const as = norm3(...D.wereld((2 * bx) / DAK_H, (2 * by) / DAK_H, 1).map((v, i) => v - D.b[i]));
  const langs = (p, d, t) => [p[0] + d[0] * t, p[1] + d[1] * t, p[2] + d[2] * t];
  const g = W.groep('top');
  if (S.top === 'krom') {
    // een verroeste windvaan die scheef is gezakt
    voeg(g, { ...stok(tip, langs(tip, as, 18), 1.4), m: 'roest', deel: 40 });
    const knik = langs(tip, as, 18);
    const as2 = norm3(as[0] + 0.6, as[1] - 0.25, as[2]);
    const eind = langs(knik, as2, 15);
    voeg(g, { ...stok(knik, eind, 1.2), m: 'roest', deel: 40 });
    voeg(g, { ...bol(langs(tip, as, 3), 3.8), m: 'roest', deel: 40 });
    // de pijl hangt schuin naar rechts beneden, met de vlakke kant naar ons toe
    const pd = norm3(0.6, -0.6, -0.5);
    const pijlA = langs(eind, pd, 15);
    const pijlB = langs(eind, pd, -13);
    voeg(g, { ...balk(pijlB, pijlA, 0.55, 1.1, [0, 0, 1], 0.2), m: 'roest', deel: 41 });
    // staartvin en punt: platte plaatjes
    voeg(g, { ...balk(pijlB, langs(pijlB, pd, 6), 0.45, 4.2, [0, 0, 1], 0.2), m: 'roest', deel: 41 });
    voeg(g, { ...balk(langs(pijlA, pd, -4), pijlA, 0.45, 2.8, [0, 0, 1], 0.2), m: 'roest', deel: 41 });
    W.mat.roest = { ramp: 'herfst', lo: 0.4, hi: 2.9, rand: 1, patroon: (C) => (hash(C.px, C.py, 4) % 3 === 0 ? { ramp: 'ijzer', stap: C.stap * 0.7 } : 0) };
  } else if (S.top === 'tak') {
    // het hoogste punt is bereikt: een nieuwe dakpunt met een groene tak eraan, zoals het hoort
    voeg(g, { ...stok(langs(tip, as, -6), langs(tip, as, 34), 1.4), m: 'nieuwHout', deel: 40 });
    const c = langs(tip, as, 30);
    for (const [dx, dy, dz, r] of [[0, 0, 0, 6], [3, -2, -6, 5], [-3, 2, -7, 5], [1, 1, 6, 4]]) voeg(g, { ...bol([c[0] + dx, c[1] + dy, c[2] + dz], r), m: 'tak', deel: 42, k: 2 });
    voeg(g, { ...balk(langs(c, [0, 0, 1], -12), langs(c, [0.5, -0.5, -0.4], -1), 0.4, 1.6, [0.7, 0.7, 0], 0.2), m: 'lint', deel: 43 });
    W.mat.tak = { ramp: 'den', lo: 1, hi: 6, patroon: (C) => (hash(C.px, C.py, 7) % 3 === 0 ? -1 : hash(C.px, C.py, 8) % 4 === 0 ? 0.8 : 0) };
    W.mat.lint = { ramp: 'rood', lo: 2, hi: 7 };
  } else if (S.top === 'goud') {
    // een gouden bol op een spits, met een windvaan erboven
    voeg(g, { ...stok(langs(tip, as, -4), langs(tip, as, 44), 1.2), m: 'smeed', deel: 40 });
    voeg(g, { ...bol(langs(tip, as, 1.5), 3.4), m: 'goud', deel: 41 });
    voeg(g, { ...bol(langs(tip, as, 14), 7.2), m: 'goud', deel: 41 });
    const v = langs(tip, as, 32);
    voeg(g, { ...balk(langs(v, [0.62, -0.62, 0], -13), langs(v, [0.62, -0.62, 0], 13), 0.45, 1, [0, 0, 1], 0.2), m: 'goud', deel: 42 });
    voeg(g, { ...balk(langs(v, [0.62, -0.62, 0], 8), langs(v, [0.62, -0.62, 0], 14), 0.45, 4.2, [0, 0, 1], 0.2), m: 'goud', deel: 42 });
    voeg(g, { ...balk(langs(v, [0.62, -0.62, 0], -15), langs(v, [0.62, -0.62, 0], -10), 0.45, 2.8, [0, 0, 1], 0.2), m: 'goud', deel: 42 });
    voeg(g, { ...bol(langs(tip, as, 45), 2.2), m: 'goud', deel: 41 });
    W.mat.goud = { ramp: 'goud', lo: 1.4, hi: 6.8, glans: 2, glansMacht: 12, rand: 1.2 };
    W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
  }
}
const bol = (c, r) => ({ f: (x, y, z) => sdf.bol(x - c[0], y - c[1], z - c[2], r), g: [c[0], c[1], c[2], r + 0.5] });

// ---------------------------------------------------------------- deur en ramen

function bouwOpeningen(W, S, T, OPN) {
  const g = W.groep('openingen');
  for (const o of OPN) {
    // vensterbank
    if (o.soort !== 'deur') {
      voeg(g, {
        f: T.veld((x, y, z) => {
          const [a, c, h] = inOpening(o, x, y, z);
          return sdf.doos(a, c - o.Rw - 0.5, (h - (o.H0 - 3)) / PXH, o.hw + 4, 3.8, E(3), 0.5);
        }),
        g: [...T.wereld(o.cos * o.Rw, o.sin * o.Rw, E(o.H0)), 20],
        m: 'lijst',
        deel: 20,
      });
    }
    const glasVlak = (x, y, z) => {
      const [a, c, h] = inOpening(o, x, y, z);
      return Math.max(boogVorm(a, h, o.hw + 1, o.H0 - 1, o.Hm, o.spits) * PXH, Math.abs(c - (o.Rw - o.diep + 3)) - 0.6);
    };
    const glasGrens = [...T.wereld(o.cos * o.Rw, o.sin * o.Rw, E((o.H0 + o.top) / 2)), E(o.top - o.H0) / 2 + o.hw + 4];
    if (o.soort === 'glas' || o.soort === 'licht') {
      voeg(g, { f: T.veld(glasVlak), g: glasGrens, m: o.soort === 'licht' ? 'glasLicht' : 'glas', deel: 21 });
      if (o.soort === 'licht') {
        // het licht valt naar buiten, op de vensterbank en de muur eromheen
        const p = T.wereld(o.cos * (o.Rw + 8), o.sin * (o.Rw + 8), E((o.H0 + o.Hm) / 2));
        W.lichten.push({ pos: p, r: 70, sterk: 2, warm: 1.2, val: 1.4, zacht: 0.5 });
      }
    }
    if (o.soort === 'gat') {
      // kapot glas: alleen langs de rand zitten nog scherven, in een grillige rand
      voeg(g, {
        f: T.veld((x, y, z) => {
          const [a, , h] = inOpening(o, x, y, z);
          const hoek = Math.atan2(h - (o.H0 + o.Hm) / 2, a);
          const n = Math.abs(Math.sin(hoek * 5 + o.phi) * 2.6 + Math.sin(hoek * 11 + 1.3) * 1.6);
          const gat = boogVorm(a, h, o.hw + 1, o.H0 - 1, o.Hm, o.spits) + 2 + n;
          return Math.max(glasVlak(x, y, z), -gat * PXH);
        }),
        g: glasGrens,
        m: 'scherf',
        deel: 21,
      });
    }
    if (o.soort === 'dicht') {
      // planken over het gat gespijkerd, een beetje scheef
      const n = o.top - o.H0 > 50 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const hc = o.H0 + ((i + 0.55) / n) * (o.top - o.H0) * 0.92;
        const hoek = (hash(i, o.phi, 3) % 34) - 17;
        const hx = o.hw + 5 + (i % 2);
        voeg(g, {
          f: T.veld((x, y, z) => {
            const [a, c, h] = inOpening(o, x, y, z);
            return Math.max(draaiRechthoek(a, h, (i % 2) * 1.5 - 0.7, hc, hoek, hx, 3.6) * PXH, Math.abs(c - (o.Rw + 1.6)) - 1.1);
          }),
          g: [...T.wereld(o.cos * o.Rw, o.sin * o.Rw, E(hc)), hx + 3],
          m: 'plank',
          deel: 22 + i,
          plank: { o, hc, hoek, hx },
        });
      }
    }
  }
  // de deur: een blad van planken; bij de krakkemikkige toren hangt het scheef in één hengsel
  const o = OPN[0];
  const scheef = S.deur === 'scheef';
  const beta = scheef ? 5 * GRAAD : 0; // staat een kier open, naar binnen
  const gamma = scheef ? 7.5 * GRAAD : 0; // en zakt aan de losse kant
  const ah = o.hw - 1; // het hengsel, links in beeld
  const cl = o.Rw - o.diep + 2;
  const blad = (x, y, z) => {
    const [a, c, h] = inOpening(o, x, y, z);
    const da = a - ah;
    const dc = c - cl;
    const la = -da * Math.cos(beta) - dc * Math.sin(beta);
    const lc = -da * Math.sin(beta) + dc * Math.cos(beta);
    const la0 = la * Math.cos(gamma) - (h - o.Hm) * Math.sin(gamma);
    const h0 = o.Hm + la * Math.sin(gamma) + (h - o.Hm) * Math.cos(gamma);
    return [ah - la0, h0, lc];
  };
  S.deurBlad = blad;
  voeg(g, {
    f: T.veld((x, y, z) => {
      const [as, hs, lc] = blad(x, y, z);
      let d = Math.max(boogVorm(as, hs, o.hw - 0.5, o.H0 - 6, o.Hm, 0) * PXH, Math.abs(lc) - 1.6);
      if (scheef) {
        // een plank is onderaan afgebroken
        const gat = Math.max(Math.abs(as + 3.5) - 3.1, hs - (o.H0 + 30 + Math.abs(((as * 7) % 5) - 2.5) * 2));
        d = Math.max(d, -gat * PXH);
      }
      return d;
    }),
    g: [...T.wereld(o.cos * o.Rw, o.sin * o.Rw, E((o.H0 + o.top) / 2)), E(o.top - o.H0) / 2 + 20],
    m: scheef ? 'oudeDeur' : 'deur',
    deel: 30,
  });

  W.mat.plank = { ramp: 'schors', lo: 1.4, hi: 6.4, patroon: (C) => bordTex(C, S) };
  W.mat.glas = { ramp: 'ijzer', lo: 0.8, hi: 3.4, patroon: (C) => glasTex(C, S, false) };
  W.mat.glasLicht = { ramp: 'vuur', gloei: (C) => glasTex(C, S, true) };
  W.mat.scherf = { ramp: 'ijzer', lo: 1.2, hi: 4.6, patroon: (C) => (hash(C.px, C.py, 2) % 5 === 0 ? 1.8 : 0) };
  W.mat.oudeDeur = { ramp: 'schors', lo: 1, hi: 6.4, patroon: (C) => deurTex(C, S, true) };
  W.mat.deur = { ramp: 'hout', lo: 1.2, hi: 6.6, patroon: (C) => deurTex(C, S, false) };
}

// welke opening is het dichtst bij een punt (voor de patronen van glas en planken)
function naasteOpening(S, x, y, z) {
  const [qx, qy] = S.T.lok(x, y, z);
  const phi = Math.atan2(qy, qx);
  let beste = null;
  let min = Infinity;
  for (const o of S.OPN) {
    const d = Math.abs(hoekVerschil(phi, o.phi * GRAAD));
    if (d < min) {
      min = d;
      beste = o;
    }
  }
  return beste;
}

function glasTex(C, S, licht) {
  const o = naasteOpening(S, C.x, C.y, C.z);
  const [qx, qy, qz] = S.T.lok(C.x, C.y, C.z);
  const [a, , h] = inOpening(o, qx, qy, qz);
  const u = Math.round(a + 20);
  const H = Math.round(h);
  // lood: een middenstijl, een dwarsroede en ruitjes
  const lood = Math.abs(a) < 0.8 || Math.abs(h - (o.H0 + o.Hm) / 2) < 0.8 || (u + H) % 6 === 0 || (((u - H) % 6) + 6) % 6 === 0;
  const t = (h - o.H0) / (o.top - o.H0);
  const ruit = hash(Math.floor((u + H) / 6), Math.floor((u - H + 60) / 6), 4) % 3;
  if (licht) {
    if (lood) return 1.4;
    return klem((t > 0.7 ? 6.3 : t > 0.35 ? 5.5 : 4.7) + (ruit === 0 ? -0.6 : ruit === 1 ? 0.4 : 0), 1, 7);
  }
  if (lood) return { ramp: 'inkt', stap: 1 };
  // de lucht spiegelt: boven lichter, linksboven een glinstering
  return { stap: 1.2 + t * 1.8 + (ruit === 1 ? 0.6 : 0) + (a > o.hw * 0.25 && t > 0.55 ? 1.4 : 0) };
}

// planken voor een raam: nerf langs de plank, spijkers aan de uiteinden
function bordTex(C, S) {
  const pl = C.deel.plank;
  const [qx, qy, qz] = S.T.lok(C.x, C.y, C.z);
  const [a, , h] = inOpening(pl.o, qx, qy, qz);
  const c = Math.cos(pl.hoek * GRAAD);
  const s = Math.sin(pl.hoek * GRAAD);
  const da = a - ((C.deel.deel - 22) % 2) * 1.5 + 0.7;
  const dh = h - pl.hc;
  const u = da * c + dh * s; // langs de plank
  const v = -da * s + dh * c; // dwars
  if (Math.abs(Math.abs(u) - (pl.hx - 2.2)) < 0.8 && Math.abs(v) < 0.8) return { ramp: 'ijzer', stap: 1.6 };
  const nerf = Math.sin(v * 2.1 + Math.sin(u * 0.2 + pl.hc) * 1.6);
  let st = nerf > 0.8 ? -0.9 : nerf < -0.88 ? 0.6 : 0;
  if (v > 2.6) st += 0.8;
  if (Math.abs(u) > pl.hx - 1) st -= 0.7;
  return st + (hash(C.deel.deel, 3, 1) % 3) * 0.3 - 0.3;
}

function deurTex(C, S, oud) {
  const [qx, qy, qz] = S.T.lok(C.x, C.y, C.z);
  const [as, hs] = S.deurBlad(qx, qy, qz);
  const o = S.OPN[0];
  // planken van ruim 6 breed, met een donkere naad
  const pb = (2 * o.hw - 1) / 5;
  const lu = as + o.hw - 0.5;
  const plank = Math.floor(lu / pb);
  const inPlank = lu - plank * pb;
  let s = (plank % 2 ? -0.35 : 0.2) + (hash(plank, 3, 5) % 3) * 0.2 - 0.2;
  if (inPlank < 1) s = -2.2;
  else if (inPlank < 2) s += 0.7;
  const nerf = Math.sin(hs * 0.6 + plank * 2.1 + Math.sin(hs * 0.13 + plank) * 2);
  if (nerf > 0.85) s -= 0.7;
  if (oud && ruis2(lu * 0.4, hs * 0.12, 4) > 0.72) s -= 0.9;
  // ijzeren banden met klinknagels
  for (const b of [o.H0 + 16, o.H0 + 60]) {
    if (hs >= b && hs < b + 4) {
      let st = hs < b + 1 ? 1.6 : hs >= b + 3 ? 4.4 : 3.1;
      if (Math.round(lu) % 6 === 3 && hs >= b + 1 && hs < b + 3) st = 5.4;
      if (oud) return { ramp: hash(C.px, C.py, 3) % 3 ? 'herfst' : 'ijzer', stap: st * 0.4 + 0.3 };
      return { ramp: 'ijzer', stap: st };
    }
  }
  // ringklink
  const rh = Math.hypot(as + o.hw - 6, hs - (o.H0 + 44));
  if (rh > 2.1 && rh < 3.4) return { ramp: oud ? 'herfst' : S.deur === 'mooi' ? 'goud' : 'ijzer', stap: oud ? 1.4 : 4 };
  return s;
}

// ---------------------------------------------------------------- de muur

// lokale torenmaten op drie plekken: het pixel, een pixel rechts, een pixel lager
function rompMaten(C, S) {
  const [qx, qy, qz] = S.T.lok(C.x, C.y, C.z);
  const [ax, ay, az] = S.T.lok(C.x + C.dxv[0], C.y + C.dxv[1], C.z + C.dxv[2]);
  const [bx, by, bz] = S.T.lok(C.x + C.dyv[0], C.y + C.dyv[1], C.z + C.dyv[2]);
  const th = Math.atan2(qy, qx);
  const U = th * RU;
  const H = qz * PXH;
  const mU = Math.max(Math.abs(hoekVerschil(Math.atan2(ay, ax), th)), Math.abs(hoekVerschil(Math.atan2(by, bx), th)), 1e-5) * RU;
  const mH = Math.max(Math.abs(az - qz), Math.abs(bz - qz), 1e-5) * PXH;
  return { qx, qy, qz, th, U, H, mU, mH, r: Math.hypot(qx, qy) };
}

// De bakstenen lap van de oude meester, de scheuren, en de verzakte plekken.
const BAKSTEEN = [
  { U: 36, H: 152, wU: 22, wH: 25 },
  { U: 100, H: 300, wU: 20, wH: 24 },
];
const SCHEUREN = [
  [[58, 121], [61, 131], [57, 142], [62, 155], [59, 166], [64, 178], [62, 190]],
  [[-8, 27], [-5, 39], [-10, 51], [-6, 62], [-11, 76], [-8, 88]],
  [[84, 330], [80, 318], [83, 307], [78, 296], [81, 284], [77, 272], [79, 262]],
  [[15, 250], [12, 240], [16, 229]],
];
// pixelafstand tot een gebroken lijn in muurmaten; teken > 0 als het punt rechts in beeld ligt
function lijnAfstand(pnt, U, H, mU, mH) {
  let best = Infinity;
  let rechts = false;
  for (let i = 0; i + 1 < pnt.length; i++) {
    const ax = pnt[i][0] / mU;
    const ay = pnt[i][1] / mH;
    const bx = pnt[i + 1][0] / mU;
    const by = pnt[i + 1][1] / mH;
    const px = U / mU;
    const py = H / mH;
    const dx = bx - ax;
    const dy = by - ay;
    const t = klem(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
    const qx = ax + dx * t;
    const qy = ay + dy * t;
    const d = Math.max(Math.abs(px - qx), Math.abs(py - qy));
    if (d < best) {
      best = d;
      rechts = px < qx; // U neemt naar links toe
    }
  }
  return [best, rechts];
}

// hoeveel verval er op een plek is: meer boven, rond het bovenste raam, en waar de toren heen helt
function verval(U, H) {
  let v = ruis2(U * 0.05 + 3, H * 0.035, 12) * 0.5;
  v += glad(240, 330, H) * 0.45;
  v += Math.max(0, 1 - Math.hypot((U - 70) / 36, (H - 296) / 40)) * 0.6;
  v += Math.max(0, 1 - Math.hypot((U - 118) / 30, (H - 150) / 60)) * 0.4;
  return v;
}

// het midden van een steen in muurmaten
const steenMidden = (st, hoog = 12) => [(st.u0 + st.u1) / 2, (st.rij + 0.5) * hoog];

function klimopDicht(stengels, U, H) {
  let dicht = 0;
  for (const k of stengels) {
    if (H > k.top + 24) continue;
    const Uk = k.U + k.A * Math.sin(H * k.f + k.ph) + k.drift * H;
    const breed = k.breed * Math.sqrt(Math.max(0, 1 - H / (k.top + 24))) + 4;
    dicht = Math.max(dicht, 1 - Math.abs(U - Uk) / breed);
  }
  return dicht;
}
// Klimop: blaadjes als kleine ruitjes (vijf pixels breed, vier hoog), licht aan de linkerbovenkant,
// in een rooster met wat speling, dichter bij de stengels. Geeft null of { ramp, stap }.
function klimop(S, U, H, mU, mH, licht) {
  const stengels = S.klimop;
  if (!stengels) return null;
  if (klimopDicht(stengels, U, H) <= -0.3) return null;
  const CU = 4.2;
  const CH = 3.6;
  const ci = Math.floor(U / CU);
  const cj = Math.floor(H / CH);
  let beste = null;
  let besteZ = -1;
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      const i = ci + di;
      const j = cj + dj;
      const h = hash(i + 900, j + 900, 71);
      const cu = (i + 0.2 + (h % 60) / 100) * CU;
      const ch = (j + 0.2 + ((h >> 8) % 60) / 100) * CH;
      const dicht = klimopDicht(stengels, cu, ch);
      if ((h >> 16) % 1000 >= dicht * 1300) continue;
      const du = (U - cu) / mU;
      const dh = (H - ch) / mH;
      // U neemt naar links toe: du > 0 is links van het midden
      const vorm = Math.abs(du) / 2.7 + Math.abs(dh) / 2.1;
      if (vorm > 1) continue;
      const z = (h >> 4) % 997;
      if (z > besteZ) {
        besteZ = z;
        beste = { du, dh, vorm, h };
      }
    }
  }
  const basis = 1.8 + licht * 5.2;
  if (beste) {
    let s = basis + ((beste.h >> 20) % 3) * 0.4 - 0.4;
    if (beste.dh > 0.4 && beste.du > -0.5) s += 0.9;
    if (beste.dh < -0.4 && beste.du < 0.5) s -= 0.8;
    if (beste.vorm > 0.72 && beste.du < 0 && beste.dh < 0.5) s -= 0.8;
    return { ramp: 'blad', stap: klem(s, 0.6, 7) };
  }
  // stengels tussen de blaadjes
  for (const k of stengels) {
    if (H > k.top) continue;
    const Uk = k.U + k.A * Math.sin(H * k.f + k.ph) + k.drift * H;
    if (Math.abs(U - Uk) / mU < 0.8) return { ramp: 'schors', stap: 1.6 + licht * 2 };
  }
  return null;
}
// dode stengels op de plek waar klimop is weggetrokken
function kaleStengel(U, H, mU) {
  for (const k of KLIMOP) {
    if (H > k.top) continue;
    const Uk = k.U + k.A * Math.sin(H * k.f + k.ph) + k.drift * H;
    if (Math.abs(U - Uk) / mU < 0.8) return true;
    // zijtakjes
    const tak = Math.floor(H / 23);
    const h0 = tak * 23 + 4;
    const dir = tak % 2 ? 1 : -1;
    const lang = 5 + (hash(tak, k.U, 3) % 8);
    const t = (H - h0) / 1.2;
    if (t >= 0 && t < lang && Math.abs(U - (Uk + dir * t * 0.9)) / mU < 0.7) return true;
  }
  return false;
}

function rompTex(C, S) {
  const M = rompMaten(C, S);
  const basis = C.stap;
  // de openingen: dagkanten, de achterkant, en de boogstenen eromheen
  for (const o of S.OPN) {
    const [a, c, h] = inOpening(o, M.qx, M.qy, M.qz);
    if (c < 20) continue;
    const d2 = boogVorm(a, h, o.hw, o.H0, o.Hm, o.spits);
    if (d2 < 0.8 && c < o.Rw - 0.6) {
      if (c < o.Rw - o.diep + 0.8) return { ramp: 'inkt', stap: o.soort === 'deur' ? 0.4 : 1, vast: true };
      // dagkant: gladde steen, voegen om de 13 pixels
      return { stap: basis - 0.4 + (Math.floor(h + 1) % 13 === 0 ? -1.4 : 0) };
    }
    if (d2 >= -0.5 && d2 < 4.2) {
      // boogstenen en neuten
      let s = basis + 1;
      const hm = h - o.Hm;
      if (hm > 0) {
        const rr = Math.hypot(a, hm);
        const hoek = Math.atan2(hm, a);
        const n = o.soort === 'deur' ? 9 : 5;
        const sector = (hoek / Math.PI) * n;
        const dSector = Math.abs(sector - Math.round(sector)) * (Math.PI / n) * rr;
        if (dSector < 0.6 && Math.round(sector) > 0 && Math.round(sector) < n) s = basis - 1.2;
      } else if (Math.floor(h + 1) % 13 === 0) s = basis - 1.2;
      if (d2 > 3.2) s = basis - 1.4;
      if (S.vlekken && hash(C.px, C.py, 9) % 7 === 0) s -= 0.6;
      return { stap: s };
    }
  }
  // klimop ligt over alles heen
  const blad = klimop(S, M.U, M.H, M.mU, M.mH, C.licht);
  if (blad) return blad;
  if (S.kaleStengels && kaleStengel(M.U, M.H, M.mU)) return { ramp: 'schors', stap: 2.2 + C.licht * 2 };

  const st = steenOp(M.U, M.H, M.mU, M.mH, 17);
  const [mu, mh] = steenMidden(st);
  const kv = kans(st.id, 3, 7);
  const vv = verval(mu, mh);
  let s;
  // de bakstenen lap
  const lap = S.bakstenen && BAKSTEEN.some((b) => Math.hypot((mu - b.U) / b.wU, (mh - b.H) / b.wH) < 1 + (kv - 0.5) * 0.5);
  const gat = S.schade > 0.5 && kv < 0.018 + 0.2 * vv * vv;
  // nieuwe stenen: waar ze in de krakkemikkige toren ontbraken, waar de bakstenen lap zat, en in
  // lappen waar de metselaars al bezig zijn (meer naar boven, waar de steiger staat)
  const nieuw =
    S.nieuw &&
    (kv < 0.018 + 0.2 * vv * vv ||
      BAKSTEEN.some((b) => Math.hypot((mu - b.U) / b.wU, (mh - b.H) / b.wH) < 1 + (kv - 0.5) * 0.5) ||
      ruis2(mu * 0.032 + 7, mh * 0.028, 19) + glad(150, 320, mh) * 0.22 + (kv - 0.5) * 0.12 > 0.66);
  if (lap && !gat) {
    const bs = steenOp(M.U + 3, M.H, M.mU, M.mH, 51, 6, 11, 5);
    if (bs.pb < 1 || bs.pr < 1) return { ramp: 'pleister', stap: klem(basis * 0.45 - 0.2, 0, 3) };
    let b = 1.3 + (basis - 2.9) * 0.62 + (bs.id % 5 === 0 ? -0.6 : bs.id % 5 === 1 ? 0.5 : 0);
    if (bs.pt <= 1) b += 0.6;
    return { ramp: 'dak', stap: b };
  }
  if (gat) {
    // de steen is weg: een donker gat, met een lichte richel onderin (de bovenkant van de steen
    // eronder), de rechter binnenkant in het licht en schaduw bovenin
    if (st.pb < 2.2) return { stap: basis - 0.8 };
    if (st.pr < 1.6) return { stap: basis - 2 };
    return { ramp: 'inkt', stap: st.pt < 2.5 ? 0.4 : 1.6, vast: true };
  }
  if (nieuw) {
    // een nieuwe steen: lichter, scherp gehouwen, met verse lichte voeg
    if (st.pb < 1 || st.pr < 1) return { ramp: 'pleister', stap: klem(basis * 0.55 + 0.6, 0, 5) };
    s = steenStap(st, basis + 1.4, C.px, C.py, { zaad: 17, vlak: true });
  } else s = steenStap(st, basis, C.px, C.py, { zaad: 17 });

  const voeg = st.pb < 1 || st.pr < 1;
  // scheuren
  if (S.scheuren) {
    for (const lijn of SCHEUREN) {
      const [d, rechts] = lijnAfstand(lijn, M.U, M.H, M.mU, M.mH);
      if (d < 0.5) return { stap: Math.max(basis - 3.4, 0.2) };
      if (d < 1.5 && rechts) s = basis + 1.4;
    }
  }
  // regenstrepen onder de vensterbanken en de kroonlijst
  if (S.vlekken && !nieuw) {
    let v = 0;
    for (const o of S.OPN) {
      if (o.soort === 'deur') continue;
      const du = M.U - o.U;
      const dh = o.H0 - 5 - M.H;
      if (Math.abs(du) < o.hw + 4 && dh > 0) {
        const kol = Math.floor(du / Math.max(M.mU, 0.6));
        const lang = 16 + (hash(kol + 50, o.phi, 3) % 46);
        if (dh < lang && hash(kol + 50, o.phi, 4) % 3 !== 0) v = Math.max(v, 1 - dh / lang);
      }
    }
    const dh = H_KRAAG - 1 - M.H;
    if (dh > 0 && dh < 80) {
      const kol = Math.floor(M.U / Math.max(M.mU, 0.6));
      const lang = 8 + (hash(kol, 7, 3) % 70);
      if (dh < lang && hash(kol, 7, 4) % 10 < 3) v = Math.max(v, (1 - dh / lang) * 0.8);
    }
    if (v > 0.12 && !voeg) s -= S.vlekken * (0.4 + v * 0.8);
  }
  // korstmos op de stenen aan de schaduwkant, mos in de onderste rij
  if (S.vlekken && !voeg && !nieuw) {
    // korstmos alleen aan de schaduwkant, in kleine plukjes
    const km = ruis2(M.U * 0.16 + 40, M.H * 0.16, 21);
    const schaduwKant = Math.max(0, -Math.sin(M.th - 0.5));
    if (schaduwKant > 0.2 && km > 0.9 - 0.12 * schaduwKant && hash(C.px, C.py, 5) % 3 !== 0) return { ramp: 'mos', stap: klem(1.6 + basis * 0.4, 0, 5) };
    if (M.H < H_SOK2 + 12 && ruis2(M.U * 0.2, M.H * 0.3, 22) > 0.66) return { ramp: 'mos', stap: klem(0.8 + basis * 0.4, 0, 5) };
  }
  return { stap: s };
}

function plintTex(C, S) {
  const M = rompMaten(C, S);
  const basis = C.stap;
  const blad = klimop(S, M.U, M.H, M.mU, M.mH, C.licht);
  if (blad) return blad;
  if (M.H > H_SOK - 0.5) {
    // de schuine rand: lange gladde stenen
    const st = steenOp(M.U, M.H - H_SOK, M.mU, M.mH, 29, 7, 34, 14);
    if (S.vlekken && ruis2(M.U * 0.15, 3, 23) > 0.6 && hash(C.px, C.py, 3) % 4 !== 0) return { ramp: 'mos', stap: klem(1.5 + basis * 0.45, 0, 5) };
    return { stap: st.pr < 1 ? basis - 1.8 : basis + 0.4 };
  }
  const st = steenOp(M.U, M.H + 6, M.mU, M.mH, 23, 13, 30, 16);
  let s = steenStap(st, basis, C.px, C.py, { zaad: 23 }) - (M.H < 6 ? 0.5 : 0);
  if (S.vlekken && st.pb >= 1 && st.pr >= 1 && ruis2(M.U * 0.18, M.H * 0.25, 24) > 0.64) return { ramp: 'mos', stap: klem(1 + basis * 0.4, 0, 5) };
  if (S.scheuren) {
    const [d, rechts] = lijnAfstand([[-22, 0], [-19, 9], [-23, 15], [-20, 22]], M.U, M.H, M.mU, M.mH);
    if (d < 0.5) return { stap: basis - 3.2 };
    if (d < 1.5 && rechts) s = basis + 1.2;
  }
  return { stap: s };
}

function lijstTex(C, S) {
  const M = rompMaten(C, S);
  const basis = C.stap;
  if (C.nz > 0.7) {
    if (S.vlekken && ruis2(M.U * 0.2, M.H * 0.1, 25) > 0.62) return { ramp: 'mos', stap: klem(1.6 + basis * 0.45, 0, 5) };
    return { stap: basis + 0.3 + (hash(Math.floor(M.U / 3), 5, 5) % 9 === 0 ? -0.6 : 0) };
  }
  const st = steenOp(M.U, 0.5, M.mU, 1, 31, 40, 32, 16);
  return { stap: st.pr < 1 ? basis - 1.8 : basis + (st.pl <= 1 ? 0.5 : 0) + (hash(C.px, C.py, 3) % 23 === 0 ? -0.7 : 0) };
}

function tredeTex(C, S) {
  const p = C.deel;
  const o = S.OPN[0];
  const [qx, qy] = S.T.lok(C.x, C.y, C.z);
  const [a] = inOpening(o, qx, qy, 0);
  // voegen tussen de blokken van een trede
  const blok = Math.floor((a + 40 + p.trede * 7) / 15);
  const inBlok = a + 40 + p.trede * 7 - blok * 15;
  let s = (hash(blok, p.trede, 3) % 3) * 0.3 - 0.3;
  if (inBlok < 1) s = -1.8;
  if (C.nz > 0.7) s += 0.3;
  if (S.vlekken) {
    if (hash(C.px, C.py, 5) % 9 === 0) s -= 0.8;
    if (C.nz > 0.7 && ruis2(a * 0.2, p.trede * 3, 26) > 0.6 && hash(C.px, C.py, 6) % 3 !== 0) return { ramp: 'mos', stap: klem(1.6 + C.stap * 0.45, 0, 5) };
  }
  return s;
}

// ---------------------------------------------------------------- kraaien

// Een kraai: lijf, kop, snavel, staart en pootjes, glanzend zwart. p is de plek van de pootjes,
// richting de kijkrichting in graden (in het grondvlak).
function kraai(g, p, richting, deel) {
  const K2 = stelsel(p, draaiZ(richting - 90));
  const w = (x, y, z) => K2.wereld(x, y, z);
  const ellips = (c, r, rot = 0) => {
    const E2 = stelsel(w(...c), maalM(K2.R, helMatrix(rot, 90)));
    return { f: E2.veld((x, y, z) => sdf.ellipsoide(x, y, z, r[0], r[1], r[2])), g: [...w(...c), Math.max(...r) + 0.5] };
  };
  voeg(g, { ...ellips([0, 0, 4.4], [2.3, 4.4, 2.7], 18), m: 'kraai', deel });
  voeg(g, { ...bol(w(0, 3.8, 7.6), 2.1), m: 'kraai', deel, k: 1.2 });
  voeg(g, { ...stok(w(0, 5.6, 7.4), w(0, 8.2, 6.8), 0.55), m: 'snavel', deel });
  voeg(g, { ...ellips([0, -5.2, 3.6], [1.5, 3.2, 0.8], -24), m: 'kraai', deel, k: 1 });
  for (const s of [-1, 1]) voeg(g, { ...stok(w(s * 0.9, 0.4, 0), w(s * 0.9, 0.2, 2.4), 0.35), m: 'snavel', deel });
}
function bouwKraaien(W, S) {
  // één op de vensterbank van het kapotte bovenraam, één op het hakblok
  const o = S.OPN.find((x) => x.naam === 'raamB');
  const bank = S.T.wereld(Math.cos((o.phi - 4) * GRAAD) * (o.Rw + 2.2), Math.sin((o.phi - 4) * GRAAD) * (o.Rw + 2.2), E(o.H0));
  kraai(W.groep('kraai-raam'), bank, -45, 190);
  // de tweede zit op het hakblok bij het schuurtje; staat dat er niet, dan zit hij er ook niet
  if (S.schuur) kraai(W.groep('kraai-blok'), [44 + 30, -12 + 50, E(13.4)], 110, 191);
  W.mat.kraai = { ramp: 'pet', lo: 0.2, hi: 3.6, glans: 1.6, glansMacht: 10, rand: 1.6 };
  W.mat.snavel = { ramp: 'inkt', lo: 0.6, hi: 2.6 };
}

// ---------------------------------------------------------------- puin aan de voet

function draaiZ(graden) {
  const a = graden * GRAAD;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [
    [c, -s, 0],
    [s, c, 0],
    [0, 0, 1],
  ];
}
// een steenblok met halve maten h, gedraaid om z en een beetje gekanteld
function blokDeel(c, h, draai, kantel = 0, naar = 0, r = 1) {
  const B = stelsel(c, maalM(helMatrix(kantel, naar), draaiZ(draai)));
  return { f: B.veld((x, y, z) => sdf.doos(x, y, z, h[0], h[1], h[2], r)), g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5], lok: B.lok, maat: h };
}

function bouwPuin(W, S) {
  const g = W.groep('puin');
  // gevallen stenen: links onder de scheve kant en voor de toren, een paar voor de treden
  const plekken = [
    [102, 78], [110, 88], [118, 74], [128, 84], [96, 94], [140, 76], [124, 98],
    [16, 82], [4, 90], [24, 96], [-6, 80],
    [38, 104], [84, 108],
  ];
  plekken.forEach(([phi, r], i) => {
    const a = phi * GRAAD;
    const groot = 3.2 + kans(i, 1, 3) * 3.6;
    const h = [groot * (1.2 + kans(i, 2, 3) * 0.8), groot, groot * 0.75];
    const c = [Math.cos(a) * r, Math.sin(a) * r, h[2] * 0.8 - 1];
    const blok = blokDeel(c, h, kans(i, 4, 3) * 180, kans(i, 5, 3) * 22, kans(i, 6, 3) * 360, 1.4);
    // gebroken steen: een hobbelig oppervlak
    const f0 = blok.f;
    blok.f = (x, y, z) => (f0(x, y, z) + (ruis3(x * 0.45, y * 0.45, z * 0.45, 30 + i) - 0.5) * 2.2) * 0.7;
    voeg(g, { ...blok, m: 'puin', deel: 50 + i });
  });
  // scherven van dakpannen
  [[70, 92], [88, 100], [30, 112], [120, 104], [8, 104]].forEach(([phi, r], i) => {
    const a = phi * GRAAD;
    const c = [Math.cos(a) * r, Math.sin(a) * r, 1];
    voeg(g, { ...blokDeel(c, [4.4, 3, 0.9], kans(i, 7, 3) * 180, 8 + kans(i, 8, 3) * 20, kans(i, 9, 3) * 360, 0.4), m: 'scherfPan', deel: 70 + i });
  });
  W.mat.puin = {
    ramp: 'steen',
    lo: 1,
    hi: 6.9,
    rand: 0.6,
    patroon: (C) => {
      const [x, y, z] = C.deel.lok(C.x, C.y, C.z);
      let s = ruis3(x * 0.5, y * 0.5, z * 0.5, 9) > 0.7 ? -0.9 : 0;
      if (hash(C.px, C.py, 3) % 11 === 0) s -= 0.8;
      if (C.nz > 0.6 && ruis3(x * 0.3, y * 0.3, 1, 4) > 0.64) return { ramp: 'mos', stap: klem(1.5 + C.stap * 0.45, 0, 5) };
      return s;
    },
  };
  W.mat.scherfPan = { ramp: 'dak', lo: 0.8, hi: 5.6 };
}

// ---------------------------------------------------------------- de aanbouw

// Een houten schuurtje tegen de rechterkant van de toren: open aan de voorkant (+y, naar links in
// beeld), een lessenaarsdak dat tegen de toren leunt, en brandhout. In lokale maten: x naar
// buiten, y langs de muur. Krak: palen scheef, planken weg; heel: gerepareerd met nieuw hout;
// mooi: netjes, met een dak van pannen.
function bouwSchuur(W, S) {
  const g = W.groep('schuur');
  const O = [44, -12, 0];
  const Sc = stelsel(O);
  const krak = S.schuur === 'krak';
  const heel = S.schuur === 'heel';
  const mooi = S.schuur === 'mooi';
  const XB = 64; // buitenste palen
  const Y0 = -38;
  const Y1 = 26;
  const ZH = E(118);
  const ZL = E(76);
  const dakZ = (x) => ZH + ((ZL - ZH) * (x + 4)) / 78;
  const scheef = krak ? 7 : 0; // de buitenkant helt naar +y
  const zakt = krak ? 5 : 0;
  const W_ = (p) => Sc.wereld(...p);
  // wat buiten het schuurtje op het erf ligt, is een eigen groep (een eigen laag in het spel)
  const erf = W.groep('erf');
  let n = 0;
  const hout = (a, b, hb, hd, op, m, extra = {}, groep = g) => {
    const deel = balk(W_(a), W_(b), hb, hd, op, 0.35);
    voeg(groep, { ...deel, m, deel: 80 + (n++ % 40), toon: (kans(n, 5, 5) - 0.5) * 1.2, zaad: n, ...extra });
  };
  const oudOfNieuw = (i) => (krak ? 'oudHout' : heel && kans(i, 11, 3) < 0.5 ? 'oudHout' : 'nieuwHout');
  // palen
  for (const [x, y] of [[XB, Y0 + 2], [XB, Y1 - 2], [10, Y1 - 2]]) {
    const top = dakZ(x) - 2.5;
    const sx = x === XB ? scheef : 0;
    hout([x, y, -2], [x + (krak && y > 0 ? 2 : 0), y + sx, top - (x === XB ? zakt : 0)], 2.6, 2.6, [1, 0, 0], krak ? 'oudHout' : 'nieuwHout');
  }
  // ligger over de buitenste palen
  hout([XB, Y0 - 3, dakZ(XB) - 4.5 - zakt], [XB, Y1 + 3 + scheef, dakZ(XB) - 4.5 - zakt], 2.2, 2.4, [0, 0, 1], krak ? 'oudHout' : 'nieuwHout');
  // dakplanken, van de muur naar buiten
  if (mooi) {
    voeg(g, {
      f: Sc.veld((x, y, z) => {
        const t = (x + 4) / 78;
        const zr = ZH + (ZL - ZH) * t;
        const d = sdf.doos(x - 35, y - (Y0 + Y1) / 2, z - zr - 1.5, 39, (Y1 - Y0) / 2 + 5, 2.4, 0.4);
        return d * 0.95;
      }),
      g: [...W_([35, (Y0 + Y1) / 2, (ZH + ZL) / 2]), 60],
      m: 'schuurDak',
      deel: 79,
    });
  } else {
    const nPlank = 8;
    for (let i = 0; i < nPlank; i++) {
      if (krak && i === 4) continue;
      const y = Y0 - 3 + (i + 0.5) * ((Y1 - Y0 + 6) / nPlank);
      const glij = krak && i === 6 ? 7 : 0;
      const zij = krak ? scheef * 0.9 : 0;
      const dz = krak ? (kans(i, 3, 9) - 0.5) * 2.4 : 0;
      const hb = (Y1 - Y0 + 6) / nPlank / 2 - 0.2;
      const eind = 74 + glij - (krak ? kans(i, 4, 9) * 6 : 0);
      hout([-4, y, ZH + 1.4], [eind, y + zij + (krak && i === 6 ? 3 : 0), ZL - zakt + 1.4 + dz - glij * 0.5], hb, 0.9, [0.5, 0, 1], oudOfNieuw(i), { naad: hb });
    }
  }
  // de achterwand (rechts in beeld): staande planken
  const nWand = 8;
  for (let i = 0; i < nWand; i++) {
    if (krak && (i === 2 || i === 5)) continue;
    const y = Y0 + (i + 0.5) * ((Y1 - Y0) / nWand);
    const top = dakZ(XB + 1) - 3 - zakt * (y > 0 ? 1 : 0.5);
    const kort = krak && i === 4 ? top * 0.55 : top;
    const kantel = krak && i === 6 ? 3 : 0;
    const hb = (Y1 - Y0) / nWand / 2 - 0.15;
    hout([XB + 1.5, y + kantel, 0], [XB + 1.5, y, kort], hb, 0.8, [1, 0, 0], oudOfNieuw(i + 20), { naad: hb });
  }
  // brandhout, met de kopse kanten naar voren (+y)
  const blokken = [];
  const rijen = krak ? [6, 4, 2] : [6, 5, 4];
  rijen.forEach((aantal, laag) => {
    for (let i = 0; i < aantal; i++) {
      const x = 10 + laag * 3.6 + i * 7.3;
      const z = 3.6 + laag * 6.2;
      blokken.push([x, z, laag]);
    }
  });
  if (krak) {
    // een paar blokken zijn eruit gerold
    blokken.push([30, 3.4, -1], [50, 3.4, -2]);
  }
  blokken.forEach(([x, z, laag], i) => {
    const y0 = laag < 0 ? 34 + i * 2 : Y0 + 6;
    const y1 = laag < 0 ? y0 + 30 : Y1 - 8 + (kans(i, 1, 4) - 0.5) * 6;
    const r = 3.3 + kans(i, 2, 4) * 0.8;
    const hoek = laag < 0 ? (laag === -1 ? 20 : -35) : 0;
    const BB = stelsel(W_([x, (y0 + y1) / 2, z]), draaiZ(hoek));
    voeg(laag < 0 ? erf : g, {
      f: BB.veld((lx, ly, lz) => sdf.cilinder(lx, lz, ly, r, -(y1 - y0) / 2, (y1 - y0) / 2)),
      g: [...W_([x, (y0 + y1) / 2, z]), (y1 - y0) / 2 + r + 1],
      m: 'blok',
      deel: 90 + (i % 9),
      blok: { lok: BB.lok, r },
    });
  });
  // hakblok met een bijl, buiten voor de open kant
  const hb = W_([30, 50, 0]);
  voeg(erf, { f: (x, y, z) => sdf.cilinder(x - hb[0], y - hb[1], z, 9, -2, 12), g: [hb[0], hb[1], 6, 14], m: 'blokStam', deel: 99 });
  hout([26, 50, 12.5], [18, 55, 32], 1.1, 1.1, [0, 0, 1], krak ? 'oudHout' : 'nieuwHout', {}, erf);
  const bijl = W_([27.5, 49.5, 13]);
  voeg(erf, { ...blokDeel(bijl, [4, 0.9, 3.2], 30, 20, 200, 0.3), m: krak ? 'roest' : 'smeed', deel: 98 });

  W.mat.oudHout = { ramp: 'schors', lo: 1.2, hi: 6.4, rand: 0.8, patroon: (C) => houtTex(C, true) };
  W.mat.nieuwHout = { ramp: 'hout', lo: 1.4, hi: 6.8, rand: 0.8, patroon: (C) => houtTex(C, false) };
  W.mat.blok = { ramp: 'schors', lo: 1.4, hi: 6.2, patroon: (C) => blokTex(C) };
  W.mat.blokStam = { ramp: 'schors', lo: 1.4, hi: 6.2, patroon: (C) => (C.nz > 0.7 ? { ramp: 'hout', stap: C.stap - 0.4 + (Math.floor(Math.hypot(C.x - hb[0], C.y - hb[1]) / 2.2) % 2 ? -0.8 : 0) } : hash(C.px, C.py, 9) % 3 === 0 ? -0.9 : 0) };
  W.mat.schuurDak = { ramp: 'dak', lo: 1.2, hi: 6.6, patroon: (C) => schuurDakTex(C, Sc) };
  if (!W.mat.roest) W.mat.roest = { ramp: 'herfst', lo: 0.5, hi: 3.6, rand: 1 };
  if (!W.mat.smeed) W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
}

// planken: nerf in de lengte, kopse kanten donker, per plank een eigen toon, spijkers
function houtTex(C, oud) {
  const p = C.deel;
  if (!p.lok) return 0;
  const [u, w] = p.lok(C.x, C.y, C.z);
  // naad langs de zijkant van een plank, zodat planken naast elkaar los blijven
  if (p.naad && p.naad - Math.abs(w) < 0.9) return w > 0 ? -1.8 : 0.5;
  let s = p.toon ?? 0;
  const nerf = Math.sin(w * 1.8 + Math.sin(u * 0.09 + p.zaad) * 2.4 + p.zaad);
  if (nerf > 0.8) s -= 0.8;
  else if (nerf < -0.9) s += 0.5;
  if (Math.abs(u) > p.L / 2 - 1.2) s -= 0.7;
  if (oud && ruis2(u * 0.08 + p.zaad, w * 0.4, 13) > 0.7) s -= 0.8;
  if (Math.abs(Math.abs(u) - (p.L / 2 - 3.2)) < 0.8 && Math.abs(w) < 0.8) return { ramp: 'ijzer', stap: oud ? 1.4 : 2.6 };
  return s;
}
// brandhout: kopse kant met jaarringen, zijkant met schors
function blokTex(C) {
  const b = C.deel.blok;
  const [x, y, z] = b.lok(C.x, C.y, C.z);
  if (Math.abs(C.ny) > 0.6 || Math.abs(C.nx) > 0.6) {
    const rr = Math.hypot(x, z);
    if (rr > b.r - 0.9) return { ramp: 'schors', stap: C.stap - 1 };
    const ring = Math.floor(rr / 1.1) % 2;
    return { ramp: 'hout', stap: C.stap + 0.6 + (ring ? -0.7 : 0) + (rr < 0.8 ? -1 : 0) };
  }
  return hash(C.px, C.py, 4) % 3 === 0 ? -0.9 : 0;
}
function schuurDakTex(C, Sc) {
  const [x, y] = Sc.lok(C.x, C.y, C.z);
  if (C.nz < 0.5) return -0.6;
  const rij = Math.floor((x + 4) / 7);
  const f = (x + 4) / 7 - rij;
  const j = Math.floor((y + (rij % 2) * 4.5) / 9);
  const u = (y + (rij % 2) * 4.5) / 9 - j;
  if (f < 0.14) return -2;
  if (u < 0.08) return -1.4;
  return f > 0.8 ? 0.7 : (hash(rij, j, 3) % 3) * 0.3 - 0.3;
}

// ---------------------------------------------------------------- de steiger

// Een middeleeuwse steiger rond de voorkant, over de deur heen: staande palen, liggers aan de
// buitenkant, korte kortelingen die in de muur steken (de gaten ervoor zitten in elke toren),
// twee planken per vak, leuningen, schoren, touw om de knopen, een ladder, en een takel met een
// emmer. De eerste laag ligt boven de deurboog, zodat je er onderdoor naar binnen kunt.
const STEIGER_PHI = [16, 38, 78, 102, 126];
const STEIGER_R = 84;
const LAGEN = [152, 254, 352];
function bouwSteiger(W, S) {
  const top = E(404);
  const plek = (phi, r, z) => [Math.cos(phi * GRAAD) * r, Math.sin(phi * GRAAD) * r, z];
  let n = 0;
  // elke paal en elk vak een eigen groep: dan hoeft een schaduwstraal alleen de delen in de
  // buurt te vragen
  let g = null;
  const paal = (a, b, r, m = 'paal') => voeg(g, { ...stok(a, b, r), m, deel: 100 + (n++ % 30) });
  const plank = (a, b, hb, hd, op, m = 'nieuwHout', extra = {}) =>
    voeg(g, { ...balk(a, b, hb, hd, op, 0.3), m, deel: 100 + (n++ % 30), toon: (kans(n, 5, 6) - 0.5) * 1, zaad: n + 40, ...extra });
  const touw = (c) => voeg(g, { f: (x, y, z) => sdf.torus(x - c[0], y - c[1], (z - c[2]) * 0.8, 2.8, 0.95), g: [c[0], c[1], c[2], 4.5], m: 'touw', deel: 131 });
  // palen met hun kortelingen en touw
  STEIGER_PHI.forEach((phi, i) => {
    g = W.groep(`steiger-paal-${i}`);
    paal(plek(phi, STEIGER_R, -3), plek(phi + 0.4 * (i - 2), STEIGER_R, top - (i % 2) * 7), 2.4);
    for (const H of LAGEN) {
      const z = E(H);
      plank(plek(phi, STEIGER_R + 4, z), plek(phi, rompStraal(z) - 3, z), 1.5, 1.5, [0, 0, 1]);
      touw(plek(phi, STEIGER_R, z + 1.6));
    }
  });
  // de vakken: liggers, planken, leuningen
  for (let i = 0; i + 1 < STEIGER_PHI.length; i++) {
    g = W.groep(`steiger-vak-${i}`);
    const a = STEIGER_PHI[i];
    const b = STEIGER_PHI[i + 1];
    // een breed vak krijgt een korteling in het midden
    const stukken = b - a > 30 ? [[a, (a + b) / 2], [(a + b) / 2, b]] : [[a, b]];
    for (const H of LAGEN) {
      const z = E(H);
      paal(plek(a, STEIGER_R, z + 1), plek(b, STEIGER_R, z + 1), 1.5);
      if (stukken.length > 1) plank(plek((a + b) / 2, STEIGER_R + 1, z), plek((a + b) / 2, rompStraal(z) - 3, z), 1.5, 1.5, [0, 0, 1]);
      for (const [p, q] of stukken) {
        for (const r of [68, 76]) plank(plek(p - 1.5, r, z + 2.6), plek(q + 1.5, r, z + 2.6), 3.7, 0.9, [0, 0, 1], 'nieuwHout', { naad: 3.7 });
      }
      if (H > LAGEN[0]) paal(plek(a, STEIGER_R, z + E(27)), plek(b, STEIGER_R, z + E(27)), 1.1);
    }
    // schoren: een diagonaal per vak, om en om
    const [za, zb] = i % 2 ? [E(LAGEN[0] + 4), E(LAGEN[2] - 4)] : [E(LAGEN[1] + 4), E(LAGEN[0] + 4)];
    if (i > 0) paal(plek(a, STEIGER_R + 2, za), plek(b, STEIGER_R + 2, zb), 1.2);
    else paal(plek(a, STEIGER_R + 2, E(10)), plek(b, STEIGER_R + 2, E(LAGEN[0] - 4)), 1.2);
  }
  // ladder naar de eerste laag, links van de deur
  g = W.groep('steiger-ladder');
  const lphi = 112;
  const la = plek(lphi, 112, 0);
  const lb = plek(lphi - 1, STEIGER_R + 3, E(LAGEN[0] + 22));
  const zij = [Math.cos((lphi + 90) * GRAAD) * 5.5, Math.sin((lphi + 90) * GRAAD) * 5.5, 0];
  for (const s of [-1, 1]) paal([la[0] + zij[0] * s, la[1] + zij[1] * s, la[2]], [lb[0] + zij[0] * s, lb[1] + zij[1] * s, lb[2]], 1.1, 'nieuwHout');
  for (let t = 0.07; t < 0.98; t += 0.075) {
    const p = [mix(la[0], lb[0], t), mix(la[1], lb[1], t), mix(la[2], lb[2], t)];
    paal([p[0] - zij[0], p[1] - zij[1], p[2]], [p[0] + zij[0], p[1] + zij[1], p[2]], 0.8, 'nieuwHout');
  }
  // takel: een arm bovenaan een paal, een touw naar beneden met een emmer
  g = W.groep('steiger-takel');
  const arm0 = plek(STEIGER_PHI[3], STEIGER_R, top - 5);
  const arm1 = plek(STEIGER_PHI[3] + 4, STEIGER_R + 24, top - 5);
  plank(arm0, arm1, 1.4, 1.4, [0, 0, 1]);
  voeg(g, { f: (x, y, z) => sdf.torus(x - arm1[0], z - arm1[2], y - arm1[1], 2.6, 0.9), g: [arm1[0], arm1[1], arm1[2], 4], m: 'smeed', deel: 132 });
  const emmer = [arm1[0], arm1[1], E(214)];
  paal([arm1[0], arm1[1], arm1[2] - 2], [emmer[0], emmer[1], emmer[2] + 9], 0.5, 'touw');
  voeg(g, { f: (x, y, z) => Math.max(kegelStomp(x - emmer[0], y - emmer[1], z, emmer[2], emmer[2] + 9, 4, 5), -kegelStomp(x - emmer[0], y - emmer[1], z, emmer[2] + 1.5, emmer[2] + 12, 3, 4)), g: [emmer[0], emmer[1], emmer[2] + 5, 8], m: 'emmer', deel: 133 });
  // een stapel nieuwe pannen op de bovenste laag
  const ps = plek(90, 72, E(LAGEN[2]) + 7);
  voeg(g, { ...blokDeel(ps, [7, 4.5, 3.2], 90, 0, 0, 0.6), m: 'pannenStapel', deel: 134 });

  W.mat.paal = { ramp: 'hout', lo: 1.6, hi: 6.8, rand: 1, patroon: (C) => (hash(C.px, 3, 3) % 4 === 0 ? -0.6 : 0) };
  W.mat.touw = { ramp: 'stro', lo: 1.4, hi: 6, patroon: (C) => ((C.px + C.py) % 3 === 0 ? -0.9 : 0) };
  W.mat.emmer = { ramp: 'hout', lo: 1, hi: 5.6, patroon: (C) => (Math.floor(C.z * PXH) % 5 === 0 ? { ramp: 'ijzer', stap: 3 } : 0) };
  W.mat.pannenStapel = { ramp: 'dak', lo: 1.4, hi: 6.6, patroon: (C) => (C.nz < 0.6 && Math.floor(C.z * PXH) % 2 === 0 ? -1.2 : 0) };
  if (!W.mat.nieuwHout) W.mat.nieuwHout = { ramp: 'hout', lo: 1.4, hi: 6.8, rand: 0.8, patroon: (C) => houtTex(C, false) };
  if (!W.mat.smeed) W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
}

// Bouwmateriaal aan de voet: gehouwen stenen, pannen en een kuip met specie.
function bouwVoorraad(W, S) {
  const g = W.groep('voorraad');
  const plek = (phi, r, z) => [Math.cos(phi * GRAAD) * r, Math.sin(phi * GRAAD) * r, z];
  // een stapel stenen: twee lagen van drie, één bovenop
  const basis = plek(122, 104, 0);
  let n = 0;
  for (const [dx, dy, dz] of [[-7, -6, 0], [7, -6, 0], [-7, 6, 0], [7, 6, 0], [0, 0, 1], [-3, 0, 2]]) {
    const c = [basis[0] + dx * 0.7 - dy * 0.7, basis[1] + dx * 0.7 + dy * 0.7, 4.2 + dz * 8.4];
    voeg(g, { ...blokDeel(c, [6.6, 5.6, 4.1], 45 + (kans(n, 1, 8) - 0.5) * 8, 0, 0, 0.7), m: 'nieuweSteen', deel: 140 + n++ });
  }
  // een kuip specie met een troffel
  const kuip = plek(76, 102, 0);
  voeg(g, { f: (x, y, z) => Math.max(sdf.doos(x - kuip[0], y - kuip[1], z - 4, 9, 7, 4, 0.8), -sdf.doos(x - kuip[0], y - kuip[1], z - 8, 7.6, 5.6, 3, 0.5)), g: [kuip[0], kuip[1], 4, 13], m: 'nieuwHout', deel: 150, toon: 0, zaad: 3 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - kuip[0], y - kuip[1], z - 5.4, 7.8, 5.8, 0.6, 0.3), g: [kuip[0], kuip[1], 5.4, 10], m: 'specie', deel: 151 });
  voeg(g, { ...blokDeel([kuip[0] + 2, kuip[1] - 1, 7.2], [3.6, 1.6, 0.35], 30, 12, 0, 0.2), m: 'smeed', deel: 152 });
  // pannen, op hun kant tegen elkaar
  const pan = plek(18, 104, 0);
  voeg(g, { ...blokDeel([pan[0], pan[1], 5], [8, 5, 5], 20, 0, 0, 0.6), m: 'pannenStapel', deel: 153 });
  W.mat.nieuweSteen = {
    ramp: 'steen',
    lo: 1.8,
    hi: 7.6,
    rand: 0.6,
    patroon: (C) => (hash(C.px, C.py, 3) % 13 === 0 ? -0.7 : 0),
  };
  W.mat.specie = { ramp: 'pleister', lo: 1.4, hi: 5.6, patroon: (C) => (hash(C.px, C.py, 5) % 5 === 0 ? -0.8 : 0) };
  if (!W.mat.pannenStapel) W.mat.pannenStapel = { ramp: 'dak', lo: 1.4, hi: 6.6, patroon: (C) => (C.nz < 0.6 && Math.floor(C.z * PXH) % 2 === 0 ? -1.2 : 0) };
  if (!W.mat.smeed) W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
  if (!W.mat.nieuwHout) W.mat.nieuwHout = { ramp: 'hout', lo: 1.4, hi: 6.8, rand: 0.8, patroon: (C) => houtTex(C, false) };
}

// ---------------------------------------------------------------- vaandels en lantaarn

// Twee lange vaandels aan ijzeren stangen onder de kroonlijst: rood met een gouden rand, een
// zwaluwstaart onderaan, en de ster van de tovenaar.
const VAANDELS = [
  { phi: 92, H1: 318, H0: 226, hw: 9 },
  { phi: 36, H1: 318, H0: 232, hw: 9 },
];
function bouwVaandels(W, S) {
  const g = W.groep('vaandels');
  const T = S.T;
  VAANDELS.forEach((v, i) => {
    const c = Math.cos(v.phi * GRAAD);
    const s = Math.sin(v.phi * GRAAD);
    const uit = rompStraal(E(v.H1)) + 6;
    const lok = (x, y, z) => [-x * s + y * c, x * c + y * s - uit, z * PXH];
    // de golf in het doek
    const golf = (a, h) => 0.9 * Math.sin((v.H1 - h) * 0.11 + a * 0.28 + i);
    voeg(g, {
      f: T.veld((x, y, z) => {
        const [a, cc, h] = lok(x, y, z);
        const onder = v.H0 + 11 * (1 - Math.abs(a) / v.hw);
        const d2 = Math.max(Math.abs(a) - v.hw, h - v.H1, onder - h);
        return Math.max(d2 * PXH, Math.abs(cc - golf(a, h)) - 0.7) * 0.9;
      }),
      g: [...T.wereld(c * uit, s * uit, E((v.H0 + v.H1) / 2)), E(v.H1 - v.H0) / 2 + v.hw + 4],
      m: 'vaandel',
      deel: 160 + i,
      vaandel: { lok, v },
    });
    // stang met knoppen, en twee armpjes naar de muur
    const p = (a, cc, h) => T.wereld(c * (uit + cc) - s * a, s * (uit + cc) + c * a, E(h));
    voeg(g, { ...stok(p(-v.hw - 3, 0, v.H1 + 2), p(v.hw + 3, 0, v.H1 + 2), 0.9), m: 'smeed', deel: 170 });
    for (const a of [-v.hw - 3.5, v.hw + 3.5]) voeg(g, { ...bol(p(a, 0, v.H1 + 2), 1.8), m: 'goud', deel: 171 });
    for (const a of [-v.hw + 1, v.hw - 1]) voeg(g, { ...stok(p(a, -7, v.H1 + 2), p(a, 0, v.H1 + 2), 0.7), m: 'smeed', deel: 170 });
  });
  W.mat.vaandel = { ramp: 'rood', lo: 1.6, hi: 7, rand: 0.6, patroon: (C) => vaandelTex(C, S) };
  if (!W.mat.goud) W.mat.goud = { ramp: 'goud', lo: 1.4, hi: 6.8, glans: 2, glansMacht: 12, rand: 1.2 };
  if (!W.mat.smeed) W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
}
function vaandelTex(C, S) {
  const { lok, v } = C.deel.vaandel;
  const [qx, qy, qz] = S.T.lok(C.x, C.y, C.z);
  const [a, , h] = lok(qx, qy, qz);
  const onder = v.H0 + 11 * (1 - Math.abs(a) / v.hw);
  const rand = Math.min(v.hw - Math.abs(a), v.H1 - h, h - onder);
  const goud = (plus) => ({ ramp: 'goud', stap: klem(C.stap * 0.8 + plus, 1, 7) });
  if (rand < 1.6) return goud(0.4);
  if (rand < 2.6) return -1.2;
  // de ster, en een gouden baan eronder
  const sh = v.H1 - 26;
  const sx = a;
  const sy = h - sh;
  const r = Math.hypot(sx, sy);
  const hoek = Math.atan2(sy, sx) - Math.PI / 2;
  const punt = 2.4 + 3.6 * Math.pow(Math.abs(Math.cos((hoek * 5) / 2)), 4);
  if (r < punt) return goud(1);
  if (Math.abs(h - (v.H1 - 46)) < 1.2 && Math.abs(a) < v.hw - 3) return goud(0);
  return 0;
}

// Een lantaarn aan een arm naast de deur, met een warm licht.
function bouwLantaarn(W, S) {
  const g = W.groep('lantaarn');
  const T = S.T;
  const phi = 84;
  const H = 104;
  const c = Math.cos(phi * GRAAD);
  const s = Math.sin(phi * GRAAD);
  const rw = rompStraal(E(H));
  const p = (r, h, a = 0) => T.wereld(c * r - s * a, s * r + c * a, E(h));
  voeg(g, { ...stok(p(rw - 2, H + 14), p(rw + 13, H + 14), 1), m: 'smeed', deel: 180 });
  voeg(g, { ...stok(p(rw - 1, H + 3), p(rw + 9, H + 13), 0.8), m: 'smeed', deel: 180 });
  voeg(g, { ...stok(p(rw + 13, H + 14), p(rw + 13, H + 8), 0.6), m: 'smeed', deel: 180 });
  const m = p(rw + 13, H - 2);
  // kap, glas, bodem
  voeg(g, { f: (x, y, z) => kegelStomp(x - m[0], y - m[1], z, m[2] + E(6), m[2] + E(10), 5.2, 1), g: [m[0], m[1], m[2] + E(8), 7], m: 'smeed', deel: 181 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - m[0], y - m[1], z - m[2], 3.6, 3.6, E(6), 0.3), g: [m[0], m[1], m[2], 8], m: 'lamp', deel: 182 });
  voeg(g, { f: (x, y, z) => sdf.doos(x - m[0], y - m[1], z - m[2] + E(6.5), 4.4, 4.4, 0.8, 0.3), g: [m[0], m[1], m[2] - E(6.5), 7], m: 'smeed', deel: 181 });
  for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) voeg(g, { ...stok([m[0] + dx * 3.8, m[1] + dy * 3.8, m[2] - E(6)], [m[0] + dx * 3.8, m[1] + dy * 3.8, m[2] + E(6)], 0.6), m: 'smeed', deel: 181 });
  W.lichten.push({ pos: [m[0], m[1], m[2]], r: 80, sterk: 1.9, warm: 1, val: 1.3, zacht: 0.55 });
  W.mat.lamp = { ramp: 'vuur', gloei: (C) => klem(4.2 + C.kijk * 2.4 + (C.z > m[2] + 2 ? 0.6 : 0), 3, 7) };
  if (!W.mat.smeed) W.mat.smeed = { ramp: 'ijzer', lo: 1, hi: 5, rand: 1 };
}

// ---------------------------------------------------------------- de grond

// Voronoi-stenen voor het pad: het dichtstbijzijnde en het op één na dichtstbijzijnde punt.
function tegelsteen(X, Y, maat = 15) {
  const ci = Math.floor(X / maat);
  const cj = Math.floor(Y / maat);
  let d1 = Infinity;
  let d2 = Infinity;
  let id = 0;
  let mx = 0;
  let my = 0;
  for (let j = -1; j <= 1; j++) {
    for (let i = -1; i <= 1; i++) {
      const h = hash(ci + i + 500, cj + j + 500, 61);
      const x = (ci + i + 0.15 + ((h % 100) / 100) * 0.7) * maat;
      const y = (cj + j + 0.15 + (((h >> 8) % 100) / 100) * 0.7) * maat;
      const d = Math.hypot(X - x, Y - y);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = h;
        mx = x;
        my = y;
      } else if (d < d2) d2 = d;
    }
  }
  return { rand: (d2 - d1) / 2, id, mx, my };
}

// afstand tot de middellijn van het pad: een boog van voor de treden naar de voorste hoek
const PAD = (() => {
  const a = [Math.cos(58 * GRAAD) * 92, Math.sin(58 * GRAAD) * 92];
  const m = [Math.cos(52 * GRAAD) * 122, Math.sin(52 * GRAAD) * 122];
  const b = [118, 118];
  const punten = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    punten.push([0, 1].map((k) => (1 - t) * (1 - t) * a[k] + 2 * (1 - t) * t * m[k] + t * t * b[k]));
  }
  return punten;
})();
function padAfstand(X, Y) {
  let best = Infinity;
  for (let i = 0; i + 1 < PAD.length; i++) {
    const [ax, ay] = PAD[i];
    const [bx, by] = PAD[i + 1];
    const t = klem(((X - ax) * (bx - ax) + (Y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2), 0, 1);
    best = Math.min(best, Math.hypot(X - ax - (bx - ax) * t, Y - ay - (by - ay) * t));
  }
  return best;
}

function grondTex(S) {
  return (vlak, X, Y, Z, px, py) => {
    if (vlak !== 'z') {
      UIT.weg = true;
      return;
    }
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    const rand = Math.max(Math.abs(gx), Math.abs(gy));
    const rafel = 2.46 + (ruis2(gx * 2.3 + 7, gy * 2.3, 11) - 0.5) * 0.3 + (rnd(px, py, 5) - 0.5) * 0.05;
    if (rand > rafel) {
      UIT.weg = true;
      return;
    }
    UIT.vlag = 0;
    const r = Math.hypot(X, Y);
    const hoek = Math.atan2(Y, X);
    // een uitgesleten looppad naar de deur, aarde rond de voet, gras verder weg
    const deur = 58 * GRAAD;
    const dx = Math.cos(deur);
    const dy = Math.sin(deur);
    const langs = X * dx + Y * dy;
    const dwars = Math.abs(-X * dy + Y * dx);
    const pad = langs > 60 && dwars < 13 + (ruis2(langs * 0.05, 1, 9) - 0.5) * 10;
    // een pad van platte stenen van de treden naar de voorste hoek van het veldje (hersteld)
    if (S.pad && langs > 70 && padAfstand(X, Y) < 26) {
      const t = tegelsteen(X, Y);
      const ml = t.mx * dx + t.my * dy;
      if (ml > 80 && padAfstand(t.mx, t.my) < 14.5) {
        if (t.rand < 1.1) {
          UIT.ramp = RAMP.aarde;
          UIT.stap = 1.6;
          return;
        }
        const zon = ((X - t.mx) * L0 + (Y - t.my) * L1) / 0.67;
        let s = 4.6 + ((t.id % 5) - 2) * 0.3;
        if (t.rand < 2.2) s += zon > 1.5 ? 1 : zon < -1.5 ? -0.9 : 0;
        if (hash(px, py, 33) % 17 === 0) s -= 0.8;
        UIT.ramp = t.id % 3 === 0 ? RAMP.zand : RAMP.steen;
        UIT.stap = UIT.ramp === RAMP.zand ? s - 0.5 : s;
        return;
      }
    }
    // rond de voet: aarde (krakkemikkig), vertrapte grond met gruis (half), een bloembed (hersteld)
    const aarde = (S.pad ? 78 : S.steiger ? 96 : 84) + (ruis2(hoek * 2.5 + 5, 0.5, 3) - 0.5) * (S.pad ? 6 : 26) + (ruis2(gx * 6, gy * 6, 4) - 0.5) * (S.pad ? 2 : 10);
    if (S.pad && r < aarde && !(langs > 60 && dwars < 22)) {
      UIT.ramp = RAMP.aarde;
      UIT.stap = 2.6 + (ruis2(gx * 7, gy * 7, 6) - 0.5);
      // bloemen: een lichte kop met een donkere stip eronder
      const h = hash(px >> 1, py >> 1, 34);
      if (h % 5 === 0 && (px + py) % 2 === 0) {
        const soort = (h >> 8) % 4;
        UIT.ramp = soort === 0 ? RAMP.rood : soort === 1 ? RAMP.goud : soort === 2 ? RAMP.perkament : RAMP.magie;
        UIT.stap = soort === 0 ? 5.6 : soort === 1 ? 5.4 : soort === 2 ? 5.6 : 4.4;
      } else if (h % 5 === 1 || h % 5 === 2) {
        UIT.ramp = RAMP.blad;
        UIT.stap = 3 + (h % 3) * 0.6;
      }
      return;
    }
    if (r < aarde || (pad && !S.pad)) {
      UIT.ramp = RAMP.aarde;
      let s = 3.4 + (ruis2(gx * 5, gy * 5, 6) - 0.5) * 1.2;
      const p = hash(px, py, 31);
      if (p % 29 === 0) {
        UIT.ramp = RAMP.steen;
        s = 4.4;
      } else if (p % 29 === 1) s -= 1.2;
      else if (S.steiger && p % 29 < 5) {
        // gruis en zaagsel van het werk
        UIT.ramp = p % 2 ? RAMP.pleister : RAMP.hout;
        s = p % 2 ? 4 : 5;
      }
      UIT.stap = s;
      return;
    }
    UIT.ramp = RAMP.gras;
    let s = 3.6 + (ruis2(gx * 3, gy * 3, 2) - 0.5) * 1.6 + (ruis2(gx * 9, gy * 9, 3) - 0.5) * 0.7;
    // onkruid: hogere, donkere pollen bij de krakkemikkige toren
    if (S.schade > 0.5 && ruis2(gx * 4 + 3, gy * 4, 7) > 0.66) s -= 0.9;
    if (hash(px, py, 21) % 9 === 0) s -= 1;
    else if (hash(px, py + 1, 21) % 9 === 0 || (hash(px, py + 2, 21) % 9 === 0 && hash(px, py + 2, 22) % 2 === 0)) s += 1.1;
    UIT.stap = s;
  };
}

function grondSchaduw(B, R) {
  for (let i = 0; i < B.b * B.h; i++) {
    if (!(B.vlag[i] & VLAG.VLOER) || B.obj[i] !== 0 || B.ramp[i] < 0) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const s = R.zacht(X, Y, 0.3, 7);
    let donker = (1 - s) * 1.9;
    const d = R.f(X, Y, 3);
    if (d < 12) donker = Math.max(donker, (1 - d / 12) * 1.3);
    B.stap[i] -= donker;
  }
}

// ---------------------------------------------------------------- alles samen

const BREED = 384;
const HOOG = 768;
const ANKER = [192, 676];
// licht van de lucht: bovenvlakken iets lichter
const BUITEN = (B) => (X, Y, Z, px, py, i) => 0.05 + 0.25 * B.nrm[i * 3 + 2];

// De zon van de late middag: de hoogste lichten op beschenen steen worden warm (de lichte kant
// van de zandramp), de schaduw blijft koel paars. Zo krijgt de textuur warme glans in de zon in
// plaats van één baan andere steen. Alleen pixels die tekenWereld tekende hebben een B.zon.
function zonKleur(B, drempel = 6.2) {
  if (!B.zon) return;
  const steen = RAMP.steen;
  const zand = RAMP.zand;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] !== steen || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST)) continue;
    if (B.zon[i] > 0.25 && B.stap[i] >= drempel) {
      B.ramp[i] = zand;
      B.stap[i] -= 0.4;
    }
  }
}

// De toren in een bestaand beeld tekenen, met het midden van de voet op tegel (gx, gy): voor een
// grotere scène, zoals het dorp. De schaduw valt op de vloer van dat beeld (pixels met
// VLAG.VLOER die tekenDozen tekende), de lampen en ramen komen in B.lichten. Daarna gaat het
// beeld verder zoals altijd: belicht, zonKleur, verwarm, omlijn, kwantiseer.
function tekenToren(B, naam = 'krakkemikkig', o = {}) {
  const S = { ...STATEN[naam] };
  const W = bouwToren(S);
  const plek = [(o.gx || 0) * TEGEL, (o.gy || 0) * TEGEL];
  const R = tekenWereld(B, W, { plek });
  B.lichten.push(...W.lichten.map((l) => ({ ...l, pos: [l.pos[0] + plek[0], l.pos[1] + plek[1], l.pos[2]] })));
  if (o.schaduw !== false) grondSchaduw(B, R);
  return { S, W, R };
}

// Van welk voorwerp is elke pixel na het omlijnen? Een lijn om een voorwerp heen hoort bij dat
// voorwerp, niet bij wat erachter ligt. Dezelfde regel als K.omlijn; roep dit aan vóór omlijn.
function eigenaars(B) {
  const uit = new Int16Array(B.b * B.h).fill(-1);
  const buren = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let py = 0; py < B.h; py++) {
    for (let px = 0; px < B.b; px++) {
      const i = py * B.b + px;
      let beste = -1;
      let besteDiep = -1e9;
      for (const [dx, dy] of buren) {
        const x = px - dx;
        const y = py - dy;
        if (x < 0 || y < 0 || x >= B.b || y >= B.h) continue;
        const j = y * B.b + x;
        if (!(B.vlag[j] & VLAG.OMLIJN)) continue;
        const achter = B.ramp[i] < 0 || (B.obj[i] !== B.obj[j] && B.diep[i] < B.diep[j] - 0.5);
        if (achter && B.diep[j] > besteDiep) {
          beste = j;
          besteDiep = B.diep[j];
        }
      }
      uit[i] = beste >= 0 ? B.obj[beste] : B.ramp[i] >= 0 ? B.obj[i] : -1;
    }
  }
  return uit;
}

// Welke laag een groep in het spel wordt: de vloer (grond), de toren zelf, de aanbouw, de
// steiger, en losse dingen op de grond.
const LAAG_VAN = (naam) =>
  naam.startsWith('steiger') ? 'steiger' : naam === 'schuur' ? 'aanbouw' : ['puin', 'voorraad', 'erf', 'kraai-blok'].includes(naam) ? 'los' : 'toren';

// Eén staat tekenen, als los plaatje met een stukje grond. Met o.lagen ook in lagen gesplitst:
// { heel, lagen: { naam: Plaat }, voet: { naam: [gx0, gy0, gx1, gy1] } }, alle met hetzelfde
// anker. De voet is waar een laag de grond raakt, in tegels vanaf het midden van de toren.
function toren(naam = 'krakkemikkig', o = {}) {
  const S = { ...STATEN[naam] };
  const B = new K.Beeld(o.b || BREED, o.h || HOOG, ...(o.anker || ANKER));
  K.tekenDozen(B, [K.doos(-2.7, -2.7, 2.7, 2.7, -3, 0, grondTex(S))]);
  const tijd = Date.now();
  const { R } = tekenToren(B, naam, o);
  if (o.log) console.log(`  toren ${naam}: ${Date.now() - tijd} ms`);
  K.belicht(B, { omgeving: BUITEN(B) });
  if (o.warm !== false) zonKleur(B, o.warm || 6.2);
  K.verwarm(B, 1.6);
  const eigen = o.lagen ? eigenaars(B) : null;
  K.omlijn(B);
  const heel = K.Plaat.van(K.kwantiseer(B));
  if (!o.lagen) return heel;

  const laagVanObj = new Map([[0, 'grond']]);
  for (const g of R.groepen) laagVanObj.set(g.obj, LAAG_VAN(g.naam));
  const lagen = {};
  for (let i = 0; i < B.b * B.h; i++) {
    if (eigen[i] < 0 || heel.px[i * 2] < 0) continue;
    const laag = laagVanObj.get(eigen[i]) || 'toren';
    if (!lagen[laag]) lagen[laag] = new K.Plaat(B.b, B.h);
    lagen[laag].px[i * 2] = heel.px[i * 2];
    lagen[laag].px[i * 2 + 1] = heel.px[i * 2 + 1];
  }
  // De voet van elke laag: waar zijn vormen de grond raken, gemeten in het afstandsveld zelf
  // (ook de achterkant, die je niet ziet), als rechthoek in tegels.
  const voet = { grond: [-2.7, -2.7, 2.7, 2.7] };
  for (const laag of Object.keys(lagen)) {
    if (laag === 'grond') continue;
    const lijst = R.groepen.filter((g) => LAAG_VAN(g.naam) === laag);
    const v = [Infinity, Infinity, -Infinity, -Infinity];
    for (let Y = -140; Y <= 140; Y += 1.5) {
      for (let X = -140; X <= 140; X += 1.5) {
        if (veld(lijst, lijst.length, X, Y, 2) > 0) continue;
        v[0] = Math.min(v[0], X / TEGEL);
        v[1] = Math.min(v[1], Y / TEGEL);
        v[2] = Math.max(v[2], X / TEGEL);
        v[3] = Math.max(v[3], Y / TEGEL);
      }
    }
    voet[laag] = v.map((w) => (Number.isFinite(w) ? Math.round(w * 100) / 100 : null));
  }
  return { heel, lagen, voet };
}

module.exports = {
  toren,
  tekenToren,
  STATEN,
  BREED,
  HOOG,
  ANKER,
  // de tekenaar, bruikbaar voor andere grote dingen (huizen, bomen)
  tekenWereld,
  Wereld,
  voeg,
  stelsel,
  helMatrix,
  bouwToren,
  eigenaars,
  zonKleur,
  grondSchaduw,
  veld,
  // bouwstenen voor andere plekken die met deze tekenaar gemaakt worden (het erf)
  hulp: { E, GRAAD, balk, stok, bol, blokDeel, draaiZ, maalM, kegelStomp, boogVorm, draaiRechthoek, steenOp, steenStap, houtTex, voegenRij, kans },
};
