// De figuren van Aardschok als kleine 3D-modellen. De renderer in kern.cjs fotografeert ze uit
// acht richtingen en maakt er pixel art van. Maten in eenheden: één eenheid breed is één pixel,
// één eenheid hoog is 0,866 pixel. De voeten staan op z = 0, het midden van de tegel.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog.
'use strict';
const { sdf, bouwSdf, klem, mix, ruis2, ruis3, hash, rnd } = require('./kern.cjs');

// ---------------------------------------------------------------- bouwstenen

const grens = (a, b, r) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + r + 0.5];
const plus = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

const kegel = (a, b, r1, r2, m, deel, k) => ({
  f: (x, y, z) => sdf.rondeKegel(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], r1, r2),
  g: grens(a, b, Math.max(r1, r2)),
  m,
  deel,
  k,
});
const capsule = (a, b, r, m, deel, k) => ({
  f: (x, y, z) => sdf.capsule(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], r),
  g: grens(a, b, r),
  m,
  deel,
  k,
});
const bol = (c, r, m, deel, k) => ({ f: (x, y, z) => sdf.bol(x - c[0], y - c[1], z - c[2], r), g: [c[0], c[1], c[2], r + 0.5], m, deel, k });
const ellips = (c, s, m, deel, k) => ({
  f: (x, y, z) => sdf.ellipsoide(x - c[0], y - c[1], z - c[2], s[0], s[1], s[2]),
  g: [c[0], c[1], c[2], Math.max(...s) + 0.5],
  m,
  deel,
  k,
});
const blok = (c, h, r, m, deel, k) => ({
  f: (x, y, z) => sdf.doos(x - c[0], y - c[1], z - c[2], h[0], h[1], h[2], r),
  g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5],
  m,
  deel,
  k,
});
// een gebogen kegel langs een kwadratische bezier, in n stukjes
function bochtKegel(p0, p1, p2, r0, r1, n, m, deel, k = 1) {
  const punt = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  const delen = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    delen.push(kegel(punt(t0), punt(t1), mix(r0, r1, t0), mix(r0, r1, t1), m, deel, i === 0 ? undefined : k));
  }
  return delen;
}

function model(delen, mat, extra) {
  const m = { delen, mat, ...extra };
  m.sdf = bouwSdf(delen);
  return m;
}

// ---------------------------------------------------------------- materialen

// Materiaalfuncties krijgen (x, y, z, nx, ny, nz, stap) en geven een plus of een nieuwe ramp.
const naarRamp = (ramp, stap, van, naar) => ({ ramp, stap: naar[0] + ((stap - van[0]) / (van[1] - van[0])) * (naar[1] - naar[0]) });

// ---------------------------------------------------------------- de tovenaar

// leeftijd in jaren (84..100). Met de jaren: de rug krommer, de baard langer, de punt van de
// hoed zakt om, en de bol op de staf gloeit harder (+1 schade per vijf jaar boven de 80).
function tovenaar(leeftijd = 84, houding = 'staan') {
  const o = klem((leeftijd - 84) / 16, 0, 1);
  const bonus = Math.max(0, Math.floor((leeftijd - 80) / 5));
  const krom = 0.25 + 0.75 * o;
  const S = [0, 2.5 + 4 * krom, 61 - 3.5 * krom]; // midden tussen de schouders
  const H = [0, 5 + 7.5 * krom, 71.5 - 5.5 * krom]; // midden van het hoofd
  const staf = [-17, S[1] + 8]; // de staf staat links voor hem
  const greep = 47 - 2 * krom;
  const bolZ = 95 - 2 * krom;
  const bolR = 4.2 + 0.55 * bonus;
  const L = 19 + 17 * o; // baardlengte
  const mantelOnder = S[2] - 10.5;
  const mantelTop = S[2] + 6;

  const M = {
    gewaad: 0,
    rand: 1,
    huid: 2,
    baard: 3,
    oog: 4,
    hout: 5,
    bol: 6,
    sjerp: 7,
    leer: 8,
    hoed: 9,
    ster: 10,
    mantel: 11,
  };
  const mat = [];
  mat[M.gewaad] = {
    ramp: 'gewaad',
    lo: 0.6,
    hi: 6.2,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // goudrand aan de zoom en de mouwen
      if (z < 3.6) return naarRamp('goud', stap, [0.6, 6.2], [1.2, 6.4]);
      // plooien iets dieper
      return 0;
    },
  };
  mat[M.rand] = { ramp: 'goud', lo: 1.2, hi: 6.4, glans: 1.2 };
  // de huid wordt met de jaren bleker; onder de ogen komen wallen
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.6 + o * 0.6,
    hi: 6.6 + o * 0.3,
    schaduwKracht: 0.7,
    patroon: (x, y, z) => {
      if (o < 0.3) return 0;
      for (const s of [-1, 1]) {
        const dx = x - s * 3;
        const dz = z - (H[2] - 0.9);
        if (y > H[1] + 4.5 && Math.abs(dx) < 1.9 && Math.abs(dz) < 0.55 + o * 0.4) return -1.2;
      }
      return 0;
    },
  };
  mat[M.baard] = {
    ramp: 'baard',
    lo: 1.2,
    hi: 6.8,
    patroon: (x, y, z) => {
      const streng = Math.sin(x * 1.7 + Math.sin(z * 0.35) * 1.2 + y * 0.4);
      return streng > 0.55 ? 0.7 : streng < -0.75 ? -0.8 : 0;
    },
  };
  mat[M.oog] = { ramp: 'inkt', lo: 0.6, hi: 1.6, detail: true, rand: 0, schaduw: false };
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1,
    hi: 6,
    patroon: (x, y, z) => (Math.sin(z * 0.9 + Math.sin(x * 3) * 2) > 0.7 ? -0.7 : 0),
  };
  mat[M.bol] = {
    ramp: 'vuur',
    gloei: (x, y, z, kijk) => {
      const h = z - bolZ;
      return klem(2.6 + 4.4 * kijk * kijk + (h > bolR * 0.35 ? 0.6 : 0), 2, 7);
    },
  };
  mat[M.sjerp] = { ramp: 'rood', lo: 1.2, hi: 6.4 };
  mat[M.leer] = { ramp: 'leer', lo: 0.8, hi: 5.4 };
  mat[M.hoed] = {
    ramp: 'gewaad',
    lo: 0.4,
    hi: 5.8,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // hoedband
      if (z < H[2] + 9.6 && z > H[2] + 6.4 && Math.hypot(x, y - H[1]) < 10.5) return naarRamp('goud', stap, [0.4, 5.8], [1.4, 6.4]);
      // ster voorop
      const sx = x;
      const sz = z - (H[2] + 16 - 2 * o);
      if (y > H[1] && Math.abs(sx) < 4 && Math.abs(sz) < 4) {
        const a = Math.atan2(sz, sx) + Math.PI / 2;
        const r = Math.hypot(sx, sz);
        const punt = 1.3 + 1.9 * Math.pow(Math.abs(Math.cos((a * 5) / 2)), 3);
        if (r < punt) return naarRamp('goud', stap, [0.4, 5.8], [3.2, 6.8]);
      }
      return 0;
    },
  };
  mat[M.ster] = { ramp: 'goud', lo: 2, hi: 6.6 };
  mat[M.mantel] = {
    ramp: 'gewaad',
    lo: 0.3,
    hi: 5.3,
    patroon: (x, y, z, nx, ny, nz, stap) => (z < mantelOnder + 1.7 ? naarRamp('goud', stap, [0.3, 5.3], [1.4, 6.4]) : 0),
  };

  // de wijde mouw krijgt een gouden rand
  const manchet = (a, b) => (x, y, z) => {
    const t = ((x - a[0]) * (b[0] - a[0]) + (y - a[1]) * (b[1] - a[1]) + (z - a[2]) * (b[2] - a[2])) / ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 + (b[2] - a[2]) ** 2);
    return t > 0.9 ? M.rand : M.gewaad;
  };
  const delen = [];
  const D = { rok: 1, lijf: 2, armL: 3, armR: 4, hoofd: 5, baard: 6, hoed: 7, staf: 8, bol: 9, schoen: 10, sjerp: 11, mantel: 12, handL: 13, handR: 14 };

  // --- staf (eerst, dan liggen de handen erover)
  const stafOnder = [staf[0] - 0.4, staf[1] - 0.6, 0];
  const stafBoven = [staf[0] + 0.7, staf[1] + 0.4, bolZ - bolR - 1.5];
  delen.push(kegel(stafOnder, stafBoven, 1.35, 1.75, M.hout, D.staf));
  for (const kz of [22, 58, 80]) {
    const t = kz / stafBoven[2];
    delen.push(bol([mix(stafOnder[0], stafBoven[0], t) + 0.4, mix(stafOnder[1], stafBoven[1], t), kz], 2.15, M.hout, D.staf, 1.2));
  }
  // klauw om de bol
  const bc = [stafBoven[0], stafBoven[1], bolZ];
  for (const [ax, ay] of [[-1, 0.2], [0.8, 0.7], [0.3, -1]]) {
    const n = Math.hypot(ax, ay);
    const ux = ax / n;
    const uy = ay / n;
    delen.push(
      ...bochtKegel(
        [stafBoven[0], stafBoven[1], stafBoven[2] - 1],
        [bc[0] + ux * (bolR + 2.6), bc[1] + uy * (bolR + 2.6), bolZ - bolR * 0.6],
        [bc[0] + ux * (bolR * 0.55), bc[1] + uy * (bolR * 0.55), bolZ + bolR * 0.85],
        1.25,
        0.6,
        3,
        M.hout,
        D.staf,
        0.8,
      ),
    );
  }
  delen.push(bol(bc, bolR, M.bol, D.bol));

  // --- rok van het gewaad: een klokvormige kegel met plooien
  const rokTop = 44;
  delen.push({
    f: (x, y, z) => {
      const t = klem(z / rokTop, 0, 1);
      const rx = mix(16.8, 10.2, Math.pow(t, 0.8));
      const ry = mix(14, 8.2, Math.pow(t, 0.9));
      const cy = mix(0.6, 1.5 * krom, t);
      const ex = x / rx;
      const ey = (y - cy) / ry;
      const th = Math.atan2(ey, ex);
      const plooi = (0.06 * Math.sin(th * 9 + 1.3) + 0.035 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.8);
      const zij = (Math.hypot(ex, ey) - 1 - plooi) * Math.min(rx, ry) * 0.88;
      return Math.max(zij, -z, z - rokTop);
    },
    g: [0, 1, rokTop / 2, 30],
    m: M.gewaad,
    deel: D.rok,
  });
  // lijf en schouders, met een schoudermantel eroverheen
  delen.push(kegel([0, 0.8, 40], [0, S[1] * 0.75, S[2] - 6], 9.8, 10.6, M.gewaad, D.rok, 4));
  delen.push(ellips([0, S[1], S[2] - 1], [12.2, 8, 6], M.gewaad, D.lijf, 4));
  delen.push({
    f: (x, y, z) => {
      const t = klem((mantelTop - z) / (mantelTop - mantelOnder), 0, 1);
      const r = mix(6.6, 15.2, Math.sqrt(t));
      const cy = S[1] - 0.4 + t * 0.6;
      const zij = (Math.hypot(x, (y - cy) / 0.74) - r) * 0.7;
      return Math.max(zij, mantelOnder - z, z - mantelTop);
    },
    g: [0, S[1], (mantelOnder + mantelTop) / 2, 18],
    m: M.mantel,
    deel: D.mantel,
  });
  // sjerp met knoop en afhangende punten met kwastjes
  delen.push({
    f: (x, y, z) => sdf.torus(x, (y - 0.9) * 1.2, z - 42.5, 11, 2) * 0.85,
    g: [0, 0.9, 42.5, 14],
    m: M.sjerp,
    deel: D.sjerp,
  });
  delen.push(bol([2.2, 10.4, 42.4], 2.4, M.sjerp, D.sjerp, 0.8));
  delen.push(kegel([2.6, 10.9, 41], [4.4, 12.2, 31], 1.1, 1.4, M.sjerp, D.sjerp));
  delen.push(kegel([1.4, 11.1, 41], [1.8, 12.4, 33], 1.0, 1.3, M.sjerp, D.sjerp));
  delen.push(bol([4.5, 12.3, 29.6], 1.5, M.rand, D.sjerp, 0.5));
  delen.push(bol([1.9, 12.5, 31.7], 1.4, M.rand, D.sjerp, 0.5));
  // buidel aan de riem
  delen.push(blok([10.8, 3.2, 38.2], [2, 2.6, 3.2], 1.2, M.leer, D.sjerp));
  // schoenen met krullende punt
  for (const s of [-1, 1]) {
    delen.push(ellips([s * 4.8, 6.5, 2.2], [3.4, 5.6, 2.6], M.leer, D.schoen));
    delen.push(bol([s * 5, 12, 3.4], 1.3, M.leer, D.schoen, 1.2));
  }

  // --- armen: wijde mouwen met een gouden rand, handen die eruit steken
  const richting = (a, b) => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l, (b[2] - a[2]) / l];
  };
  const Ls = plus(S, [-10.5, 0, -1.5]);
  const Lh = [staf[0] + 0.25, staf[1] - 0.2, greep];
  const Le = [mix(Ls[0], Lh[0], 0.45) - 2.4, mix(Ls[1], Lh[1], 0.3), mix(Ls[2], Lh[2], 0.5) - 3.5];
  const uL = richting(Lh, Le);
  const Lw = plus(Lh, [uL[0] * 4.6, uL[1] * 4.6, uL[2] * 4.6]);
  delen.push(kegel(Ls, Le, 4.6, 4.2, M.gewaad, D.armL, 1.5));
  delen.push(kegel(Le, Lw, 4.3, 5.4, manchet(Le, Lw), D.armL, 1));
  const Rs = plus(S, [10.5, 0, -1.5]);
  const Re = plus(Rs, [3.2, 0.5, -12]);
  const Rw = plus(Re, [-0.8, 4.4, -6.2]);
  const uR = richting(Re, Rw);
  const Rh = plus(Rw, [uR[0] * 3.9, uR[1] * 3.9, uR[2] * 3.9]);
  delen.push(kegel(Rs, Re, 4.6, 4.2, M.gewaad, D.armR, 1.5));
  delen.push(kegel(Re, Rw, 4.3, 5.4, manchet(Re, Rw), D.armR, 1));
  delen.push(ellips(Lh, [3.3, 3.4, 3.9], M.huid, D.handL, 0.6));
  delen.push(bol(plus(Lh, [1.4, 2.4, 1.8]), 1.5, M.huid, D.handL, 0.6));
  delen.push(ellips(Rh, [3, 3.1, 3.9], M.huid, D.handR, 0.6));
  delen.push(bol(plus(Rh, [-1.6, 1.2, 0.8]), 1.3, M.huid, D.handR, 0.6));

  // --- hoofd: groot genoeg voor een gezicht met neus, ogen en borstelige wenkbrauwen
  delen.push(ellips(H, [7.5, 7.3, 8.2], M.huid, D.hoofd));
  delen.push(ellips(plus(H, [0, 7, -1]), [1.8, 2.6, 2.9], M.huid, D.hoofd, 1.2));
  delen.push(bol(plus(H, [0, 8.6, -2.4]), 1.7, M.huid, D.hoofd, 1));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(H, [s * 7.3, 0.4, 0]), [1.4, 2.2, 3], M.huid, D.hoofd, 0.6));
    delen.push(bol(plus(H, [s * 3.0, 6.3, 0.9]), 0.95, M.oog, D.hoofd));
    delen.push(ellips(plus(H, [s * 3.1, 6.35, 2.9 - o * 0.8]), [2.6 + o * 0.5, 1.4, 1.2 + o * 0.2], M.baard, D.hoofd, 0.5));
  }
  // haar opzij en achter
  delen.push(ellips(plus(H, [0, -1.8, -1.2]), [8.3, 7.6, 7.6], M.baard, D.hoofd, 1));
  // baard, snor en bakkebaarden
  const kin = plus(H, [0, 4.2, -6.4]);
  const punt = plus(H, [0, 6 + 2.5 * krom, -6.4 - L]);
  delen.push(kegel(kin, punt, 5.4, 1, M.baard, D.baard, 1.5));
  delen.push(kegel(plus(H, [0, 3.2, -8]), plus(punt, [0, -1, 9]), 5, 2.4, M.baard, D.baard, 2));
  for (const s of [-1, 1]) {
    delen.push(kegel(plus(H, [s * 1, 7.6, -3.6]), plus(H, [s * 5.4, 6, -6.4]), 1.9, 1.1, M.baard, D.baard, 1));
    delen.push(kegel(plus(H, [s * 6.4, 1.2, -1.5]), plus(H, [s * 4.8, 3.6, -7]), 2.2, 3, M.baard, D.baard, 1.5));
  }

  // --- hoed: brede rand, iets opgewipt aan de voorkant zodat de ogen eronder zichtbaar
  // blijven, en een kegel waarvan de punt met de jaren omzakt
  const rand = plus(H, [0, -0.8, 7]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - rand[0];
      const dy = y - rand[1];
      const dz = z - rand[2] + 0.008 * (dx * dx + dy * dy) - 0.05 * dy;
      return sdf.ellipsoide(dx, dy, dz, 13.6, 13.1, 1.3) * 0.8;
    },
    g: [rand[0], rand[1], rand[2], 15],
    m: M.hoed,
    deel: D.hoed,
  });
  const tip = plus(rand, [0, -(3 + 16 * o), 27 - 15 * o]);
  delen.push(...bochtKegel(plus(rand, [0, 0, 0.4]), plus(rand, [0, 0.8, 17 + 2 * o]), tip, 8.4, 0.8, 7, M.hoed, D.hoed, 1));

  const m = model(delen, mat, {
    midden: [-2, 3, 50],
    straal: 58,
    lichten: [{ pos: bc, r: 44 + 9 * bonus, sterk: 1.7 + 0.35 * bonus, warm: 1, eigen: true }],
    bolPlek: bc,
    bolR,
  });
  return m;
}

// Een model groter maken, voor een portret: dezelfde vormen en materialen, meer pixels.
function geschaald(m, s) {
  return {
    ...m,
    schaal: s,
    naarModel: (x, y, z) => (m.naarModel ? m.naarModel(x / s, y / s, z / s) : [x / s, y / s, z / s]),
    sdf: (x, y, z) => m.sdf(x / s, y / s, z / s) * s,
    midden: m.midden.map((v) => v * s),
    straal: m.straal * s,
    lichten: (m.lichten || []).map((l) => ({ ...l, pos: l.pos.map((v) => v * s), r: l.r * s })),
  };
}

// Een model kantelen om een liggende as door punt c (graden): voor een portret waarin het gezicht
// meer naar de camera kijkt dan in het spel.
function gekanteld(m, as, graden, c) {
  const l = Math.hypot(as[0], as[1], as[2]);
  const [ux, uy, uz] = as.map((v) => v / l);
  const a = (-graden * Math.PI) / 180;
  const co = Math.cos(a);
  const si = Math.sin(a);
  const draai = (x, y, z) => {
    const d = ux * x + uy * y + uz * z;
    return [
      x * co + (uy * z - uz * y) * si + ux * d * (1 - co),
      y * co + (uz * x - ux * z) * si + uy * d * (1 - co),
      z * co + (ux * y - uy * x) * si + uz * d * (1 - co),
    ];
  };
  const terug = (x, y, z) => {
    const [px, py, pz] = draai(x - c[0], y - c[1], z - c[2]);
    return [px + c[0], py + c[1], pz + c[2]];
  };
  return {
    ...m,
    naarModel: (x, y, z) => (m.naarModel ? m.naarModel(...terug(x, y, z)) : terug(x, y, z)),
    sdf: (x, y, z) => m.sdf(...terug(x, y, z)),
  };
}

module.exports = { gekanteld, geschaald, tovenaar, model, kegel, capsule, bol, ellips, blok, bochtKegel, plus, naarRamp };
