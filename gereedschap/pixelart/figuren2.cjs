// Wim, het skelet en de slijmkruiper, met dezelfde bouwstenen als de tovenaar.
'use strict';
const { sdf, klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, plus, naarRamp } = require('./figuren.cjs');

// ---------------------------------------------------------------- vrije oriëntatie

// Een platte schijf (schild) met middelpunt c en normaal n.
function schijf(c, n, r, dikte, m, deel) {
  const [nx, ny, nz] = n;
  return {
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2];
      const h = dx * nx + dy * ny + dz * nz;
      const rr = Math.hypot(dx - h * nx, dy - h * ny, dz - h * nz) - r;
      const hh = Math.abs(h) - dikte;
      return Math.min(Math.max(rr, hh), 0) + Math.hypot(Math.max(rr, 0), Math.max(hh, 0));
    },
    g: [c[0], c[1], c[2], r + dikte + 0.5],
    m,
    deel,
  };
}
// een ring (torus) rond as n
function ring(c, n, R, r, m, deel) {
  const [nx, ny, nz] = n;
  return {
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2];
      const h = dx * nx + dy * ny + dz * nz;
      const q = Math.hypot(dx - h * nx, dy - h * ny, dz - h * nz) - R;
      return Math.hypot(q, h) - r;
    },
    g: [c[0], c[1], c[2], R + r + 0.5],
    m,
    deel,
  };
}
const eenheid = (v) => {
  const l = Math.hypot(...v);
  return v.map((a) => a / l);
};
const langs = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

// ---------------------------------------------------------------- Wim

// Wim, de vroegere leerling: nu zelf grijs, met een schort, een pet, een brilletje en de bezem
// waarmee hij veertig jaar lang elke dag de trap veegde.
function wim() {
  const M = { jas: 0, schort: 1, broek: 2, laars: 3, huid: 4, haar: 5, oog: 6, bril: 7, hout: 8, stro: 9, knoop: 10, pet: 11, touw: 12 };
  const D = { benen: 1, jas: 2, schort: 3, armL: 4, armR: 5, hoofd: 6, pet: 7, bezem: 8, handL: 9, handR: 10 };
  const H = [0, 3.4, 65];
  const mat = [];
  mat[M.jas] = { ramp: 'jas', lo: 0.8, hi: 5.8, patroon: (x, y, z) => (Math.sin(x * 0.9 + z * 0.15) > 0.85 ? -0.6 : 0) };
  mat[M.schort] = { ramp: 'perkament', lo: 1.2, hi: 5.6 };
  mat[M.broek] = { ramp: 'pet', lo: 0.8, hi: 5.2 };
  mat[M.laars] = { ramp: 'leer', lo: 0.6, hi: 5 };
  mat[M.huid] = { ramp: 'huid', lo: 1.6, hi: 6.6, schaduwKracht: 0.7 };
  mat[M.haar] = { ramp: 'baard', lo: 0.6, hi: 5, patroon: (x, y, z) => (Math.sin(z * 2.2 + x) > 0.6 ? 0.6 : 0) };
  mat[M.oog] = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };
  mat[M.bril] = { ramp: 'ijzer', lo: 3, hi: 6.5, detail: true, glans: 1 };
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 5.8 };
  mat[M.stro] = {
    ramp: 'stro',
    lo: 0.8,
    hi: 6,
    patroon: (x, y, z) => {
      const s = Math.sin(Math.atan2(y - 9.2, x - 11.2) * 11 + z * 0.15);
      return s > 0.4 ? 0.8 : s < -0.6 ? -0.8 : 0;
    },
  };
  mat[M.knoop] = { ramp: 'goud', lo: 2, hi: 6.2, detail: true, glans: 1 };
  mat[M.pet] = { ramp: 'pet', lo: 0.8, hi: 5.4 };
  mat[M.touw] = { ramp: 'leer', lo: 1, hi: 5 };

  const delen = [];
  // bezem: steel rechts voor hem, de borstel op de vloer
  const steelOnder = [11.2, 9.2, 9];
  const steelBoven = [12.6, 7.2, 71];
  delen.push(kegel(steelOnder, steelBoven, 1.15, 1.2, M.hout, D.bezem));
  delen.push({
    f: (x, y, z) => {
      const dx = x - 11.2;
      const dy = (y - 9.2) / 0.62;
      const t = klem(z / 13, 0, 1);
      const r = mix(6.2, 2.4, t) + 0.35 * Math.sin(Math.atan2(dy, dx) * 13);
      return Math.max((Math.hypot(dx, dy) - r) * 0.6, -z, z - 13);
    },
    g: [11.2, 9.2, 6.5, 9],
    m: M.stro,
    deel: D.bezem,
  });
  delen.push({ f: (x, y, z) => sdf.cilinder(x - 11.2, (y - 9.2) / 0.8, z, 2.9, 10.2, 12.4), g: [11.2, 9.2, 11.3, 4], m: M.touw, deel: D.bezem });

  // benen en laarzen
  for (const s of [-1, 1]) {
    delen.push(kegel([s * 3.9, 0, 30], [s * 3.8, 0.8, 6], 3.8, 3, M.broek, D.benen, 1));
    delen.push(ellips([s * 3.9, 2.2, 2.6], [3.1, 5.2, 2.9], M.laars, D.benen, 1.2));
    delen.push(kegel([s * 3.8, 0.6, 3], [s * 3.8, 0.6, 9], 3.4, 3.2, M.laars, D.benen, 1));
  }
  // jas tot op de knie, met een buikje
  const buikVan = (z) => Math.exp(-(((z - 38) / 9) ** 2)) * 2.2;
  delen.push({
    f: (x, y, z) => {
      const t = klem((z - 20) / 36, 0, 1);
      const buik = buikVan(z);
      const rx = mix(11, 10.4, t) + buik * 0.3;
      const ry = mix(8.4, 7.2, t) + buik;
      const cy = 0.4 + buik * 0.55;
      return Math.max((Math.hypot(x / rx, (y - cy) / ry) - 1) * Math.min(rx, ry) * 0.85, 20 - z, z - 56);
    },
    g: [0, 1, 38, 22],
    m: M.jas,
    deel: D.jas,
  });
  delen.push(ellips([0, 0.4, 54], [11.4, 7.6, 6], M.jas, D.jas, 3));
  // schort: een laag voor de buik
  delen.push({
    f: (x, y, z) => {
      const buik = buikVan(z);
      const ry = mix(8.4, 7.2, klem((z - 20) / 36, 0, 1)) + buik;
      const voor = 0.4 + buik * 0.55 + ry * Math.sqrt(Math.max(0, 1 - (x / 11) ** 2));
      const d = Math.max(Math.abs(x) - 6.4, Math.abs(z - 36) - 13.5);
      return Math.max(d, Math.abs(y - voor - 0.3) - 0.9) * 0.9;
    },
    g: [0, 10, 36, 16],
    m: M.schort,
    deel: D.schort,
  });
  // knopen boven het schort
  for (const kz of [51.5, 47]) delen.push(bol([0, 7.4, kz], 0.9, M.knoop, D.jas));

  // armen: rechts houdt de bezem vast, links hangt
  const Rh = [12, 8, 43];
  const Rs = [10.4, 0.6, 55];
  const Re = [13, 2.4, 45];
  delen.push(kegel(Rs, Re, 4, 3.6, M.jas, D.armR, 1.2));
  delen.push(kegel(Re, langs(Re, Rh, 0.7), 3.6, 3.4, M.jas, D.armR, 1));
  delen.push(ellips(Rh, [2.8, 3, 3.4], M.huid, D.handR, 0.6));
  const Ls = [-10.4, 0.6, 55];
  const Le = [-12.6, 0.8, 43];
  const Lh = [-12, 2.6, 33];
  delen.push(kegel(Ls, Le, 4, 3.6, M.jas, D.armL, 1.2));
  delen.push(kegel(Le, langs(Le, Lh, 0.72), 3.6, 3.4, M.jas, D.armL, 1));
  delen.push(ellips(Lh, [2.8, 2.9, 3.4], M.huid, D.handL, 0.6));

  // hoofd: ronde neus, brilletje, grijze snor en haar opzij
  delen.push(ellips(H, [7, 6.9, 7.6], M.huid, D.hoofd));
  delen.push(bol(plus(H, [0, 7, -1.4]), 2, M.huid, D.hoofd, 1.2));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(H, [s * 6.9, 0.4, -0.4]), [1.4, 2.1, 2.8], M.huid, D.hoofd, 0.6));
    delen.push(bol(plus(H, [s * 2.7, 5.9, 0.9]), 0.9, M.oog, D.hoofd));
    delen.push(ring(plus(H, [s * 2.7, 6.9, 0.8]), [0, 1, 0], 1.9, 0.38, M.bril, D.hoofd));
    delen.push(ellips(plus(H, [s * 2.8, 6.2, 2.7]), [2.1, 1.1, 0.9], M.haar, D.hoofd, 0.4));
    delen.push(kegel(plus(H, [s * 0.8, 7.4, -3.2]), plus(H, [s * 4.6, 5.8, -4.8]), 1.8, 1.2, M.haar, D.hoofd, 0.8));
    delen.push(ellips(plus(H, [s * 6.2, -1.4, -1.2]), [2.2, 4.4, 3.6], M.haar, D.hoofd, 1.2));
  }
  delen.push(capsule(plus(H, [-0.9, 7.6, 1.1]), plus(H, [0.9, 7.6, 1.1]), 0.35, M.bril, D.hoofd));
  delen.push(ellips(plus(H, [0, -3.4, -1]), [6.4, 4, 5.4], M.haar, D.hoofd, 1.5));
  // pet met klep
  delen.push(ellips(plus(H, [0, 0.2, 6.6]), [7.6, 8, 3.1], M.pet, D.pet, 1));
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - (H[1] + 7.2);
      const dz = z - (H[2] + 5.6) - 0.1 * dy;
      return sdf.ellipsoide(dx, dy, dz, 5.4, 3.6, 0.8) * 0.85;
    },
    g: [H[0], H[1] + 7.2, H[2] + 5.6, 7],
    m: M.pet,
    deel: D.pet,
  });

  return model(delen, mat, { midden: [0, 3, 40], straal: 46 });
}

// ---------------------------------------------------------------- skelet

// Een skelet met een roestig zwaard en een rond schild. Gloeiende kooltjes in de oogkassen.
function skelet() {
  const M = { bot: 0, kas: 1, oog: 2, zwaard: 3, gevest: 4, hout: 5, ijzer: 6, doek: 7, tand: 8 };
  const D = { bekken: 1, ribben: 2, ruggengraat: 3, schedel: 4, armL: 5, armR: 6, beenL: 7, beenR: 8, zwaard: 9, schild: 10, doek: 11 };
  const H = [0, 1.6, 82];
  const mat = [];
  mat[M.bot] = {
    ramp: 'bot',
    lo: 1.2,
    hi: 6.8,
    patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, 3) > 0.78 ? -0.8 : 0),
  };
  mat[M.kas] = { ramp: 'inkt', lo: 0.5, hi: 1.8, rand: 0 };
  mat[M.oog] = { ramp: 'vuur', gloei: (x, y, z, kijk) => 4 + 3 * kijk, detail: true };
  mat[M.zwaard] = {
    ramp: 'ijzer',
    lo: 1.5,
    hi: 6.4,
    glans: 1.6,
    patroon: (x, y, z, nx, ny, nz, stap) => (ruis3(x * 0.8, y * 0.8, z * 0.8, 11) > 0.66 ? naarRamp('hout', stap, [1.5, 6.4], [1.5, 5]) : 0),
  };
  mat[M.gevest] = { ramp: 'leer', lo: 0.8, hi: 5 };
  mat[M.hout] = {
    ramp: 'hout',
    lo: 1,
    hi: 5.6,
    patroon: (x, y, z) => (Math.sin(z * 1.4 + x * 0.3) > 0.75 ? -0.8 : 0),
  };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.2, hi: 6, glans: 1.2 };
  mat[M.doek] = { ramp: 'rood', lo: 0.4, hi: 3.8, patroon: (x, y, z) => (Math.sin(x * 2.1 + z * 0.3) > 0.7 ? -0.7 : 0) };
  mat[M.tand] = { ramp: 'bot', lo: 2, hi: 7, patroon: (x) => (Math.abs(Math.sin(x * 2.2)) < 0.25 ? -2.5 : 0) };

  const delen = [];
  // bekken en lendendoek
  delen.push(ellips([0, 0, 44.5], [7.6, 4.4, 3.6], M.bot, D.bekken));
  delen.push({
    f: (x, y, z) => {
      const onder = 33 + 2.2 * Math.sin(x * 1.3 + y * 0.4) + 1.4 * Math.sin(x * 3.1 + 1);
      const t = klem((45 - z) / 12, 0, 1);
      const e = Math.hypot(x / mix(8.3, 9, t), y / mix(5.1, 5.8, t)) - 1;
      return Math.max(Math.abs(e * 5.2) - 0.55, onder - z, z - 45.5) * 0.85;
    },
    g: [0, 0, 39, 12],
    m: M.doek,
    deel: D.doek,
  });
  // ruggengraat
  delen.push(capsule([0, -1.6, 46], [0, -2.6, 58], 1.5, M.bot, D.ruggengraat));
  delen.push(capsule([0, -2.6, 58], [0, -1.8, 72], 1.5, M.bot, D.ruggengraat));
  for (let z = 47; z < 72; z += 3.1) delen.push(bol([0, -2.8 + Math.abs(z - 60) * 0.06, z], 1.9, M.bot, D.ruggengraat, 0.6));
  // ribbenkast: een holle schaal, in banden gesneden die naar voren toe zakken
  delen.push({
    f: (x, y, z) => {
      const e = sdf.ellipsoide(x, y - 0.8, z - 63, 8.8, 6.6, 9.2);
      const schaal = Math.abs(e) - 0.8;
      const zz = z + 0.32 * (y + 2);
      const f = zz / 3.5 - Math.floor(zz / 3.5);
      const band = (Math.abs(f - 0.5) - 0.24) * 3.5;
      const midden = y > 3 ? 1.9 - Math.abs(x) : -9;
      return Math.max(schaal, band, midden, 55.5 - z, z - 71);
    },
    g: [0, 0.8, 63, 11],
    m: M.bot,
    deel: D.ribben,
  });
  delen.push(capsule([0, 6.8, 69], [0, 7.2, 58.5], 1.1, M.bot, D.ribben));
  // sleutelbeenderen
  for (const s of [-1, 1]) delen.push(capsule([s * 1.6, 4.4, 71.5], [s * 10.2, 0.8, 71], 1.2, M.bot, D.ribben));
  // schedel: hersenpan, gezicht, kaak; oogkassen uitgesneden, kooltjes erin
  delen.push(ellips(H, [6.4, 7.2, 7.2], M.bot, D.schedel));
  delen.push(ellips(plus(H, [0, 2.8, -3.6]), [5.2, 5, 5.2], M.bot, D.schedel, 1.5));
  delen.push({
    f: (x, y, z) => sdf.doos(x - H[0], y - (H[1] + 3.4), z - (H[2] - 8.6) - 0.2 * (y - H[1] - 3.4), 3.9, 3.2, 1.5, 1),
    g: [H[0], H[1] + 3.4, H[2] - 8.6, 6],
    m: M.tand,
    deel: D.schedel,
    k: 0.6,
  });
  for (const s of [-1, 1]) delen.push({ ...bol(plus(H, [s * 2.6, 6.7, -0.6]), 2.35, M.kas, D.schedel), uit: true });
  delen.push({ ...bol(plus(H, [0, 7.6, -3.6]), 1.2, M.kas, D.schedel), uit: true });
  for (const s of [-1, 1]) delen.push(bol(plus(H, [s * 2.6, 5.8, -0.7]), 1, M.oog, D.schedel));
  // nek
  delen.push(capsule([0, -1.2, 72], plus(H, [0, -1, -6]), 1.4, M.bot, D.ruggengraat));

  // armen: rechts het zwaard vooruit, links het schild
  const RS = [10.6, 0.6, 70.5];
  const RE = [12.6, 2.8, 57];
  const RH = [11.2, 9.4, 50];
  delen.push(capsule(RS, RE, 1.4, M.bot, D.armR));
  delen.push(capsule(RE, RH, 1.2, M.bot, D.armR));
  delen.push(bol(RS, 2.2, M.bot, D.armR, 0.6));
  delen.push(bol(RE, 1.9, M.bot, D.armR, 0.6));
  delen.push(ellips(RH, [2, 2.4, 2.8], M.bot, D.armR, 0.6));
  // zwaard: gevest in de hand, kling schuin omhoog naar voren
  const kRicht = eenheid([0.12, 0.45, 1]);
  const gp = plus(RH, [0, 0, 3.4]);
  delen.push(kegel(plus(RH, [0, 0, -3.2]), gp, 0.9, 0.9, M.gevest, D.zwaard));
  delen.push(bol(plus(RH, [0, 0, -3.8]), 1.2, M.ijzer, D.zwaard));
  delen.push(capsule(plus(gp, [-4, 0.4, 0]), plus(gp, [4, -0.4, 0]), 0.85, M.ijzer, D.zwaard));
  const kPunt = plus(gp, kRicht.map((v) => v * 27));
  delen.push({
    f: (x, y, z) => {
      // platte kling: afstand tot het lijnstuk, met een ellips als doorsnede
      const ax = x - gp[0];
      const ay = y - gp[1];
      const az = z - gp[2];
      const t = klem(ax * kRicht[0] + ay * kRicht[1] + az * kRicht[2], 0, 27);
      const qx = ax - kRicht[0] * t;
      const qy = ay - kRicht[1] * t;
      const qz = az - kRicht[2] * t;
      const w = mix(1.7, 0.35, (t / 27) ** 1.5);
      return (Math.hypot(qx / w, qy / 0.45, qz / w) - 1) * 0.42;
    },
    g: [(gp[0] + kPunt[0]) / 2, (gp[1] + kPunt[1]) / 2, (gp[2] + kPunt[2]) / 2, 15],
    m: M.zwaard,
    deel: D.zwaard,
  });
  const LS = [-10.6, 0.6, 70.5];
  const LE = [-13, 3, 58];
  const LH = [-10.6, 8.4, 53];
  delen.push(capsule(LS, LE, 1.4, M.bot, D.armL));
  delen.push(capsule(LE, LH, 1.2, M.bot, D.armL));
  delen.push(bol(LS, 2.2, M.bot, D.armL, 0.6));
  delen.push(bol(LE, 1.9, M.bot, D.armL, 0.6));
  const sn = eenheid([-0.55, 0.83, 0.08]);
  const sc = plus(langs(LE, LH, 0.55), [-2.2, 1.6, 0]);
  delen.push(schijf(sc, sn, 8.4, 0.8, M.hout, D.schild));
  delen.push(ring(sc, sn, 8.2, 0.9, M.ijzer, D.schild));
  delen.push(bol(plus(sc, sn.map((v) => v * 0.9)), 2.2, M.ijzer, D.schild));

  // benen
  for (const s of [-1, 1]) {
    const heup = [s * 4.2, 0, 43];
    const knie = [s * 4.8, 1.4, 24];
    const enkel = [s * 4.6, 0.4, 4.6];
    const dl = s < 0 ? D.beenL : D.beenR;
    delen.push(capsule(heup, knie, 1.65, M.bot, dl));
    delen.push(capsule(knie, enkel, 1.35, M.bot, dl));
    delen.push(bol(knie, 2.1, M.bot, dl, 0.6));
    delen.push(ellips([s * 4.6, 2.6, 1.8], [2.1, 4.4, 1.6], M.bot, dl, 0.8));
  }
  return model(delen, mat, { midden: [0, 3, 46], straal: 50, lichten: [{ pos: plus(H, [0, 6, -0.7]), r: 16, sterk: 1.2, warm: 1 }] });
}

// ---------------------------------------------------------------- slijmkruiper

// Een klodder groen slijm met twee ogen op steeltjes en een scheve bek.
function slijm(ingedrukt = false) {
  const M = { slijm: 0, oogwit: 1, pupil: 2, bek: 3, tand: 4 };
  const D = { lijf: 1, ogen: 2, bek: 3 };
  const sz = (ingedrukt ? 0.78 : 1) * 1.22;
  const sxy = (ingedrukt ? 1.12 : 1) * 1.22;
  const mat = [];
  mat[M.slijm] = {
    ramp: 'slijm',
    lo: 1.2,
    hi: 6.8,
    omslag: 0.7,
    glans: 2.4,
    glansMacht: 30,
    rand: 1.8,
    patroon: (x, y, z) => {
      const b = ruis3(x * 0.16, y * 0.16, z * 0.16, 21);
      let p = b > 0.8 ? 0.9 : 0;
      if (z < 4) p -= 1;
      return p;
    },
  };
  mat[M.oogwit] = { ramp: 'baard', lo: 2.4, hi: 6.8, glans: 1 };
  mat[M.pupil] = { ramp: 'inkt', lo: 0.4, hi: 1.2, detail: true, rand: 0 };
  mat[M.bek] = { ramp: 'slijm', lo: 0, hi: 0.6, rand: 0 };
  mat[M.tand] = { ramp: 'bot', lo: 3, hi: 6.5, detail: true };
  const Z = (z) => z * sz;
  const XY = (v) => v * sxy;
  const delen = [];
  const wiebel = (x, y, z) => 0.25 * Math.sin(x * 0.3 + z * 0.4) * Math.sin(y * 0.35 + 1);
  delen.push({
    f: (x, y, z) => {
      const X = x / sxy;
      const Y = y / sxy;
      const Zz = z / sz;
      let d = sdf.ellipsoide(X, Y, Zz - 10, 17, 15, 11);
      const k = 6;
      const sm = (a, b) => {
        const h = Math.max(k - Math.abs(a - b), 0) / k;
        return Math.min(a, b) - h * h * k * 0.25;
      };
      d = sm(d, sdf.bol(X, Y - 7, Zz - 9, 9.5));
      d = sm(d, sdf.bol(X + 8.5, Y + 7, Zz - 8, 8));
      d = sm(d, sdf.bol(X - 9, Y + 6, Zz - 7, 7.5));
      d = sm(d, sdf.bol(X - 1, Y - 1, Zz - 17.5, 7.2));
      d = sm(d, sdf.bol(X + 14, Y - 3, Zz - 3, 4.2));
      d = sm(d, sdf.bol(X - 13, Y + 2, Zz - 2.6, 3.8));
      d += wiebel(X, Y, Zz);
      return Math.max(d * Math.min(sz, sxy) * 0.8, -z);
    },
    g: [0, 0, Z(11), 32],
    m: M.slijm,
    deel: D.lijf,
  });
  // bek: een scheve donkere spleet met twee tandjes
  delen.push({
    f: (x, y, z) => sdf.ellipsoide(x / sxy, y / sxy - 15.2, z / sz - 8 - 0.12 * (x / sxy), 7, 2.6, 1.8),
    g: [0, XY(15.2), Z(8), 10],
    m: M.bek,
    deel: D.bek,
    uit: true,
  });
  for (const s of [-1, 1]) delen.push(kegel([XY(s * 3.6), XY(15.6), Z(9.8)], [XY(s * 3.3), XY(16.2), Z(7.6)], 1.1, 0.35, M.tand, D.bek));
  // ogen op korte steeltjes
  for (const s of [-1, 1]) {
    const oog = [XY(s * 5.4), XY(8.4), Z(19.5 + (s > 0 ? 1.2 : 0))];
    delen.push(kegel([XY(s * 4.4), XY(6.4), Z(14)], oog, 2.6 * sxy, 2.2 * sxy, M.slijm, D.lijf, 1.6));
    delen.push(bol(oog, 3.3 * sxy, M.oogwit, D.ogen));
    delen.push(bol(plus(oog, [s * -0.3, 2.9 * sxy, 0.2]), 1.55 * sxy, M.pupil, D.ogen));
  }
  return model(delen, mat, { midden: [0, 2, Z(12)], straal: 34 });
}

module.exports = { wim, skelet, slijm, schijf, ring, eenheid, langs };
