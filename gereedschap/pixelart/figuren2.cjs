// Wim, het skelet en de slijmkruiper, met dezelfde bouwstenen als de tovenaar.
'use strict';
const { sdf, klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, plus, naarRamp } = require('./figuren.cjs');
const HH = require('./houding.cjs');

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

// Loopsnelheid in tegels per seconde. Wim heeft korte benen: bij tien beelden per seconde zouden
// zijn passen veel te lang worden, dus loopt zijn cyclus op twaalf.
const WIM_SNELHEID = 2.0;
const WIM_FPS = 12;

const rustWim = () => ({
  zak: 0,
  zij: 0,
  voor: 0,
  romp: { buig: 0, hel: 0, draai: 0, omhoog: 0 },
  nek: { knik: 0, hel: 0, draai: 0 },
  bezem: { omZ: 43, kantel: 0, hel: 0, dp: [0, 0, 0] }, // omZ: waar hij om draait, op de steel
  handR: { bezem: 0 }, // de rechterhand houdt de steel vast
  handL: null, // null: de linkerarm hangt; [dx, dy, dz] verzet; { bezem: dz } pakt de steel
  voet: [{ y: 0, z: 0, hoek: 0 }, { y: 0, z: 0, hoek: 0 }],
});

// De houdingen van Wim: staan, lopen, vegen (zijn handtekening: veertig jaar de trap) en praten.
function houdingWim(stand) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const h = rustWim();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    case 'staan': {
      const adem = rij([0, 1, 1, 0, 0]);
      h.romp.omhoog = 1.1547 * adem;
      h.nek.knik = -1.2 * adem;
      h.bezem.kantel = -0.8 * rij([0, 0, 1, 1, 0]);
      h.handL = [0, 0.6 * adem, -0.5 * adem];
      break;
    }
    case 'lopen': {
      const v = WIM_SNELHEID * HH.PER_TEGEL;
      const T = 8 / WIM_FPS;
      const steun = 0.55;
      const R = HH.loopVoet(fase, { v, T, steun, til: 4, hiel: 14, hak: 20 });
      const L = HH.loopVoet(fase, { v, T, steun, til: 4, hiel: 14, hak: 20, verzet: 0.5 });
      h.voet = [
        { y: L.y - 1, z: L.z, hoek: L.hoek },
        { y: R.y - 1, z: R.z, hoek: R.hoek },
      ];
      h.zak = 1.2 + (2 * (1 + HH.cosinus(2 * fase))) / 2; // knieën gebogen, en wiegen per stap
      h.zij = 1.3 * HH.sinus(fase);
      h.romp.buig = 5 + 1.4 * HH.cosinus(2 * fase);
      h.romp.draai = 4 * HH.sinus(fase);
      h.nek.knik = -3 - 1.2 * HH.cosinus(2 * fase);
      // de bezem gaat mee omhoog en zwaait met de rechterarm mee
      h.bezem.dp = [0, -5 * HH.cosinus(fase), 7];
      h.bezem.kantel = 6 - 3 * HH.cosinus(fase);
      h.handL = [0, 7 * HH.cosinus(fase), 1.5 * HH.sinus(fase)];
      break;
    }
    // Vegen: een haal van rechtsvoor naar linksvoor met de bezem plat op de vloer, dan optillen
    // en terug. Acht beelden, vijf voor de haal en drie voor de terugzwaai.
    case 'vegen': {
      const haal = rij([0, 0.28, 0.6, 0.85, 1, 0.72, 0.36, 0.1, 0]);
      const op = rij([0, 0, 0, 0, 0, 1, 1.2, 0.6, 0]);
      h.bezem.omZ = 46;
      h.bezem.hel = -10 + 34 * haal;
      h.bezem.kantel = 16 + 6 * haal;
      h.bezem.dp = [0, 7 + 3 * haal, 2 * op];
      h.handL = { bezem: 14 }; // de tweede hand gaat aan de steel
      h.handR = { bezem: -2 + 2 * haal };
      h.romp.buig = 14 + 3 * haal;
      h.romp.draai = -8 + 18 * haal;
      h.romp.hel = 3 - 5 * haal;
      h.zak = 2 + 1.2 * haal;
      h.nek.knik = 8 + 2 * haal;
      h.voet = [{ y: 0, z: 0, hoek: 0 }, { y: -1.5, z: 0, hoek: 0 }];
      break;
    }
    // Praten: de vrije hand onderstreept wat hij zegt, het hoofd knikt mee.
    case 'praten': {
      const g = rij([0, 0.5, 1, 0.8, 0.3, 0.05, 0]);
      h.handL = [-1 - 3 * g, 5 + 9 * g, 6 + 12 * g];
      h.romp.draai = -2 - 3 * g;
      h.romp.omhoog = 0.6 * HH.sinus(fase * 2);
      h.nek.knik = 2 + 3 * HH.sinus(fase * 2 + 0.2);
      h.nek.draai = -1.5 - 2 * g;
      break;
    }
    default:
      throw new Error(`Wim kent de houding "${naam}" niet.`);
  }
  return h;
}

// Wim, de vroegere leerling: nu zelf grijs, met een schort, een pet, een brilletje en de bezem
// waarmee hij veertig jaar lang elke dag de trap veegde.
// stand: { houding, fase } laat hem bewegen; zonder stand staat hij stil.
function wim(stand = null) {
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
  // botten: groepen delen die samen bewegen; zonder houding blijft alles staan
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const draaiM = (buig, hel, om) => HH.maalM(HH.draaiing([0, 0, 1], om), HH.maalM(HH.draaiing([0, 1, 0], hel), HH.draaiing([1, 0, 0], -buig)));
  const hg = houdingWim(stand);
  // bezem: steel rechts voor hem, de borstel op de vloer
  const steelOnder = [11.2, 9.2, 9];
  const steelBoven = [12.6, 7.2, 71];
  const steelAs = (z) => {
    const t = (z - steelOnder[2]) / (steelBoven[2] - steelOnder[2]);
    return [mix(steelOnder[0], steelBoven[0], t), mix(steelOnder[1], steelBoven[1], t), z];
  };
  const heup = [0, 0.6, 31];
  const nek = [0, 2, 57];
  const Blijf = hg ? HH.beweging({ dp: [hg.zij, hg.voor, -hg.zak] }) : null;
  const Bromp = hg ? HH.naElkaar(Blijf, HH.beweging({ M: draaiM(hg.romp.buig, hg.romp.hel, hg.romp.draai), om: heup, dp: [0, 0, hg.romp.omhoog] })) : null;
  const Bhoofd = hg ? HH.naElkaar(Bromp, HH.beweging({ M: draaiM(hg.nek.knik, hg.nek.hel, hg.nek.draai), om: nek })) : null;
  const Bbezem = hg ? HH.beweging({ M: draaiM(hg.bezem.kantel, hg.bezem.hel, 0), om: steelAs(hg.bezem.omZ), dp: hg.bezem.dp }) : null;
  const Bvoet = [0, 1].map((i) =>
    hg ? HH.beweging({ as: [1, 0, 0], graden: hg.voet[i].hoek, om: [(i ? 1 : -1) * 3.9, 2.2, 0], dp: [0, hg.voet[i].y, hg.voet[i].z] }) : null,
  );
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
  bot(Bbezem);

  // benen en laarzen; met een houding buigt de knie, dus valt de broekspijp in twee stukken
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 3.9, 0, 30];
      const enkelR = [s * 3.8, 0.8, 6];
      const knieR = [s * 3.85, 1.9, 18];
      const heupN = [s * 3.9 + hg.zij, hg.voor, 30 - hg.zak];
      const enkelN = [s * 3.8, 0.8 + hg.voet[i].y, 6 + hg.voet[i].z];
      const knieN = HH.elleboog(heupR, knieR, enkelR, heupN, enkelN);
      delen.push(kegel(heupN, knieN, 3.8, 3.4, M.broek, D.benen, 1));
      delen.push(kegel(knieN, enkelN, 3.4, 3, M.broek, D.benen, 1));
      bot(null);
    } else {
      delen.push(kegel([s * 3.9, 0, 30], [s * 3.8, 0.8, 6], 3.8, 3, M.broek, D.benen, 1));
    }
    delen.push(ellips([s * 3.9, 2.2, 2.6], [3.1, 5.2, 2.9], M.laars, D.benen, 1.2));
    delen.push(kegel([s * 3.8, 0.6, 3], [s * 3.8, 0.6, 9], 3.4, 3.2, M.laars, D.benen, 1));
    bot(Bvoet[i]);
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
  bot(Bromp);

  // armen: rechts houdt de bezem vast, links hangt
  const Rh = [12, 8, 43];
  const Rs = [10.4, 0.6, 55];
  const Re = [13, 2.4, 45];
  const Ls = [-10.4, 0.6, 55];
  const Le = [-12.6, 0.8, 43];
  const Lh = [-12, 2.6, 33];
  // de hand aan de steel gaat met de bezem mee, de vrije hand met het lijf
  const aanSteel = (dz, zij) => HH.opPunt(Bbezem, [Rh[0] + zij[0], Rh[1] + zij[1], Rh[2] + dz]);
  const handPlek = (h2, rust, zij) =>
    h2 && h2.bezem !== undefined ? aanSteel(h2.bezem, zij) : HH.opPunt(Blijf, plus(rust, h2 || [0, 0, 0]));
  const Rhn = hg ? handPlek(hg.handR, Rh, [0, 0, 0]) : Rh;
  const Lhn = hg ? handPlek(hg.handL, Lh, [-2.6, 0.6, 0]) : Lh;
  const Rsn = hg ? HH.opPunt(Bromp, Rs) : Rs;
  const Lsn = hg ? HH.opPunt(Bromp, Ls) : Ls;
  const Ren = hg ? HH.elleboog(Rs, Re, Rh, Rsn, Rhn) : Re;
  const Len = hg ? HH.elleboog(Ls, Le, Lh, Lsn, Lhn) : Le;
  const BarmR1 = hg ? HH.lidBeweging(Rs, Re, Rsn, Ren) : null;
  const BarmR2 = hg ? HH.lidBeweging(Re, Rh, Ren, Rhn) : null;
  const BarmL1 = hg ? HH.lidBeweging(Ls, Le, Lsn, Len) : null;
  const BarmL2 = hg ? HH.lidBeweging(Le, Lh, Len, Lhn) : null;
  delen.push(kegel(Rs, Re, 4, 3.6, M.jas, D.armR, 1.2));
  bot(BarmR1);
  delen.push(kegel(Re, langs(Re, Rh, 0.7), 3.6, 3.4, M.jas, D.armR, 1));
  delen.push(ellips(Rh, [2.8, 3, 3.4], M.huid, D.handR, 0.6));
  bot(BarmR2);
  delen.push(kegel(Ls, Le, 4, 3.6, M.jas, D.armL, 1.2));
  bot(BarmL1);
  delen.push(kegel(Le, langs(Le, Lh, 0.72), 3.6, 3.4, M.jas, D.armL, 1));
  delen.push(ellips(Lh, [2.8, 2.9, 3.4], M.huid, D.handL, 0.6));
  bot(BarmL2);

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
  bot(Bhoofd);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 3, 40], straal: 46 });
}

// ---------------------------------------------------------------- skelet

const SKELET_SNELHEID = 2.2;

const rustSkelet = () => ({
  zak: 0,
  zij: 0,
  voor: 0,
  heup: { buig: 0, hel: 0, draai: 0 },
  romp: { buig: 0, hel: 0, draai: 0 },
  nek: { knik: 0, hel: 0, draai: 0 },
  zwaard: { kantel: 0, hel: 0, dp: [0, 0, 0] },
  schild: { kantel: 0, hel: 0, dp: [0, 0, 0] },
  handR: [0, 0, 0],
  handL: [0, 0, 0],
  voet: [{ y: 0, z: 0, hoek: 0 }, { y: 0, z: 0, hoek: 0 }],
  gloed: 0,
  uiteen: null, // bij sterven: per bot een eigen val
});

// De houdingen van het skelet: stram, want het hangt aan droge pezen.
function houdingSkelet(stand) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const h = rustSkelet();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    // Wiegen op de plaats; de kooltjes in de oogkassen halen adem.
    case 'staan': {
      const w = HH.sinus(fase);
      h.romp.hel = 1.8 * w;
      h.romp.draai = -1.4 * w;
      h.nek.knik = 1.2 * HH.cosinus(fase);
      h.handR = [0, 0.8 * w, 0.6 * w];
      h.handL = [0, -0.6 * w, 0.5 * w];
      h.gloed = 0.8 * rij([0, 1, 0.3, 0.7, 0]);
      break;
    }
    // Stram lopen: de knieën blijven bijna recht, dus wiegt het hele geraamte op en neer.
    case 'lopen': {
      const v = SKELET_SNELHEID * HH.PER_TEGEL;
      const T = 0.8;
      const steun = 0.54;
      const R = HH.loopVoet(fase, { v, T, steun, til: 4.5, hiel: 8, hak: 10 });
      const L = HH.loopVoet(fase, { v, T, steun, til: 4.5, hiel: 8, hak: 10, verzet: 0.5 });
      h.voet = [
        { y: L.y, z: L.z, hoek: L.hoek },
        { y: R.y, z: R.z, hoek: R.hoek },
      ];
      const reik = Math.max(Math.abs(L.y), Math.abs(R.y));
      h.zak = 0.75 * (38.4 - Math.sqrt(Math.max(0, 38.4 * 38.4 - reik * reik)));
      h.zij = 1.4 * HH.sinus(fase);
      h.heup.draai = -4 * HH.sinus(fase);
      h.romp.draai = 5 * HH.sinus(fase);
      h.romp.buig = 3 + 1.2 * HH.cosinus(2 * fase);
      h.romp.hel = -1.2 * HH.sinus(fase);
      h.nek.knik = -2 - HH.cosinus(2 * fase);
      h.handR = [0, -5 * HH.cosinus(fase), 1.5 * HH.sinus(fase)];
      h.handL = [0, 4 * HH.cosinus(fase), 1.2 * HH.sinus(fase)];
      h.zwaard.kantel = -8 + 5 * HH.cosinus(fase);
      break;
    }
    // Een houw met het zwaard: uithalen over de schouder, dan naar voren neer.
    case 'aanval': {
      h.romp.draai = rij([-6, -22, -14, 16, 12, 2]);
      h.romp.buig = rij([0, -5, -2, 12, 8, 1]);
      h.heup.draai = rij([-2, -8, -5, 6, 4, 1]);
      h.nek.knik = rij([0, -3, -1, 7, 5, 1]);
      h.zak = rij([0, 0.5, 0, 2, 1.2, 0.2]);
      h.voor = rij([0, -1.5, -0.5, 3.5, 2.5, 0.5]);
      h.handR = [rij([0, 3, 5, 2, 1, 0]), rij([0, -7, -4, 11, 8, 1]), rij([0, 9, 13, -2, -1, 0])];
      h.handL = [rij([0, -2, -3, -4, -3, -1]), rij([0, -2, -1, 3, 2, 0]), rij([0, 1, 2, -1, -1, 0])];
      h.zwaard.kantel = rij([0, -60, -38, 62, 50, 6]);
      h.schild.kantel = rij([0, -6, -4, 8, 5, 1]);
      h.voet = [{ y: rij([0, -2, -1, 1, 0.5, 0]), z: 0, hoek: 0 }, { y: rij([0, -1, 0, 3, 2, 0.4]), z: 0, hoek: 0 }];
      h.gloed = rij([0.5, 1.2, 1.6, 2, 1, 0.2]);
      break;
    }
    // Geraakt: de botten rammelen; het geraamte klapt achterover en komt half terug.
    case 'geraakt': {
      h.romp.buig = rij([-13, -9, -3]);
      h.romp.hel = rij([5, 3, 1]);
      h.nek.knik = rij([-11, -7, -2]);
      h.heup.buig = rij([-4, -3, -1]);
      h.voor = rij([-3, -2, -0.5]);
      h.zak = rij([1.2, 0.8, 0.2]);
      h.handR = [rij([3, 2, 0.5]), rij([-6, -4, -1]), rij([4, 3, 1])];
      h.handL = [rij([-3, -2, -0.5]), rij([-5, -3, -1]), rij([3, 2, 0.5])];
      h.zwaard.kantel = rij([-16, -11, -3]);
      h.schild.kantel = rij([10, 7, 2]);
      h.gloed = rij([1.6, 0.9, 0.3]);
      break;
    }
    // Sterven: de pezen laten los en het geraamte zakt in elkaar tot een hoop botten.
    case 'sterven': {
      const val = (t0, o) => {
        const t = HH.soepel((fase - t0) / (1 - t0));
        const e = t * t; // vallen gaat met versnelling
        return HH.beweging({ as: o.as || [1, 0, 0], graden: (o.graden || 0) * e, om: o.om, dp: (o.dp || [0, 0, 0]).map((w) => w * e) });
      };
      h.zak = rij([0, 1, 4, 10, 18, 26, 32, 34]);
      h.romp.buig = rij([-6, -2, 6, 16, 26, 34, 40, 42]);
      h.romp.hel = rij([0, 2, 6, 14, 22, 28, 32, 33]);
      h.nek.knik = rij([-4, 0, 6, 14, 20, 24, 26, 26]);
      h.voet = [{ y: -4, z: 0, hoek: -12 }, { y: 5, z: 0, hoek: 10 }];
      h.gloed = rij([2.2, 1.4, 0.6, -0.6, -1.8, -2.8, -3.6, -4]);
      h.uiteen = {
        schedel: val(0.28, { as: [0.2, 1, 0.1], graden: 96, om: [0, 1.6, 82], dp: [4, 6, -68] }),
        romp: val(0.42, { as: [1, 0.2, 0], graden: 62, om: [0, 0, 46], dp: [4, -2, -14] }),
        bekken: val(0.5, { as: [1, 0, 0], graden: 24, om: [0, 0, 44.5], dp: [1, -1, -34] }),
        armR: val(0.34, { as: [1, 0, 0.3], graden: 72, om: [10.6, 0.6, 70.5], dp: [1, 3, -50] }),
        armL: val(0.34, { as: [1, 0, -0.3], graden: -70, om: [-10.6, 0.6, 70.5], dp: [-2, 2, -48] }),
        beenL: val(0.44, { as: [1, 0, 0], graden: 78, om: [-4.2, 0, 43], dp: [-3, -2, -30] }),
        beenR: val(0.44, { as: [1, 0, 0], graden: 84, om: [4.2, 0, 43], dp: [3, -3, -32] }),
        zwaard: val(0.2, { as: [0.3, 1, 0], graden: 88, om: [11.2, 9.4, 50], dp: [3, 5, -46] }),
        schild: val(0.24, { as: [1, 0.3, 0], graden: 82, om: [-10.6, 8.4, 53], dp: [-4, 2, -47] }),
      };
      break;
    }
    default:
      throw new Error(`Het skelet kent de houding "${naam}" niet.`);
  }
  return h;
}

// Een skelet met een roestig zwaard en een rond schild. Gloeiende kooltjes in de oogkassen.
// stand: { houding, fase } laat het bewegen; zonder stand staat het stil.
function skelet(stand = null) {
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
  const hg = houdingSkelet(stand);
  mat[M.kas] = { ramp: 'inkt', lo: 0.5, hi: 1.8, rand: 0 };
  mat[M.oog] = { ramp: 'vuur', gloei: (x, y, z, kijk) => (hg ? klem(4 + 3 * kijk + hg.gloed, 0.5, 7) : 4 + 3 * kijk), detail: true };
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
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const draaiM = (buig, hel, om) => HH.maalM(HH.draaiing([0, 0, 1], om), HH.maalM(HH.draaiing([0, 1, 0], hel), HH.draaiing([1, 0, 0], -buig)));
  // bij sterven laat elk bot op zijn eigen moment los; de rest van het geraamte gaat door
  const uiteen = (naam) => (hg && hg.uiteen ? hg.uiteen[naam] : null);
  const Blijf = hg ? HH.beweging({ dp: [hg.zij, hg.voor, -hg.zak] }) : null;
  const Bbekken0 = hg ? HH.naElkaar(Blijf, HH.beweging({ M: draaiM(hg.heup.buig, hg.heup.hel, hg.heup.draai), om: [0, 0, 44.5] })) : null;
  const Bbekken = hg ? HH.naElkaar(uiteen('bekken'), Bbekken0) : null;
  const Bromp0 = hg ? HH.naElkaar(Bbekken0, HH.beweging({ M: draaiM(hg.romp.buig, hg.romp.hel, hg.romp.draai), om: [0, -1.6, 46] })) : null;
  const Bromp = hg ? HH.naElkaar(uiteen('romp'), Bromp0) : null;
  const Bschedel = hg ? HH.naElkaar(uiteen('schedel'), HH.naElkaar(Bromp0, HH.beweging({ M: draaiM(hg.nek.knik, hg.nek.hel, hg.nek.draai), om: [0, -1, 76] }))) : null;
  const Bvoet = [0, 1].map((i) =>
    hg
      ? HH.naElkaar(uiteen(i ? 'beenR' : 'beenL'), HH.beweging({ as: [1, 0, 0], graden: hg.voet[i].hoek, om: [(i ? 1 : -1) * 4.6, 2.6, 0], dp: [0, hg.voet[i].y, hg.voet[i].z] }))
      : null,
  );
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
  bot(Bbekken);
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
  bot(Bromp);
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
  bot(Bschedel);
  // nek
  delen.push(capsule([0, -1.2, 72], plus(H, [0, -1, -6]), 1.4, M.bot, D.ruggengraat));
  bot(Bromp);

  // armen: rechts het zwaard vooruit, links het schild
  const RS = [10.6, 0.6, 70.5];
  const RE = [12.6, 2.8, 57];
  const RH = [11.2, 9.4, 50];
  const LS = [-10.6, 0.6, 70.5];
  const LE = [-13, 3, 58];
  const LH = [-10.6, 8.4, 53];
  const RSn = hg ? HH.opPunt(Bromp0, RS) : RS;
  const LSn = hg ? HH.opPunt(Bromp0, LS) : LS;
  const RHn = hg ? HH.opPunt(Blijf, plus(RH, hg.handR)) : RH;
  const LHn = hg ? HH.opPunt(Blijf, plus(LH, hg.handL)) : LH;
  const REn = hg ? HH.elleboog(RS, RE, RH, RSn, RHn) : RE;
  const LEn = hg ? HH.elleboog(LS, LE, LH, LSn, LHn) : LE;
  const BarmR1 = hg ? HH.naElkaar(uiteen('armR'), HH.lidBeweging(RS, RE, RSn, REn)) : null;
  const BarmR2 = hg ? HH.naElkaar(uiteen('armR'), HH.lidBeweging(RE, RH, REn, RHn)) : null;
  const BarmL1 = hg ? HH.naElkaar(uiteen('armL'), HH.lidBeweging(LS, LE, LSn, LEn)) : null;
  const BarmL2 = hg ? HH.naElkaar(uiteen('armL'), HH.lidBeweging(LE, LH, LEn, LHn)) : null;
  // zwaard en schild hangen aan de onderarm, met hun eigen draai eromheen
  const Bzwaard = hg
    ? HH.naElkaar(uiteen('zwaard'), HH.naElkaar(HH.lidBeweging(RE, RH, REn, RHn), HH.beweging({ M: draaiM(hg.zwaard.kantel, hg.zwaard.hel, 0), om: RH, dp: hg.zwaard.dp })))
    : null;
  const Bschild = hg
    ? HH.naElkaar(uiteen('schild'), HH.naElkaar(HH.lidBeweging(LE, LH, LEn, LHn), HH.beweging({ M: draaiM(hg.schild.kantel, hg.schild.hel, 0), om: LH, dp: hg.schild.dp })))
    : null;
  // de volgorde van de delen blijft zoals hij was; elk deel krijgt zijn eigen bot mee
  const zet = (deel, B) => delen.push(B ? HH.beweegDeel(deel, B) : deel);
  zet(capsule(RS, RE, 1.4, M.bot, D.armR), BarmR1);
  zet(capsule(RE, RH, 1.2, M.bot, D.armR), BarmR2);
  zet(bol(RS, 2.2, M.bot, D.armR, 0.6), BarmR1);
  zet(bol(RE, 1.9, M.bot, D.armR, 0.6), BarmR1);
  zet(ellips(RH, [2, 2.4, 2.8], M.bot, D.armR, 0.6), BarmR2);
  bot(null);
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
  bot(Bzwaard);
  zet(capsule(LS, LE, 1.4, M.bot, D.armL), BarmL1);
  zet(capsule(LE, LH, 1.2, M.bot, D.armL), BarmL2);
  zet(bol(LS, 2.2, M.bot, D.armL, 0.6), BarmL1);
  zet(bol(LE, 1.9, M.bot, D.armL, 0.6), BarmL1);
  bot(null);
  const sn = eenheid([-0.55, 0.83, 0.08]);
  const sc = plus(langs(LE, LH, 0.55), [-2.2, 1.6, 0]);
  delen.push(schijf(sc, sn, 8.4, 0.8, M.hout, D.schild));
  delen.push(ring(sc, sn, 8.2, 0.9, M.ijzer, D.schild));
  delen.push(bol(plus(sc, sn.map((v) => v * 0.9)), 2.2, M.ijzer, D.schild));
  bot(Bschild);

  // benen: met een houding buigt de knie mee met de voet
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const heup = [s * 4.2, 0, 43];
    const knieR = [s * 4.8, 1.4, 24];
    const enkelR = [s * 4.6, 0.4, 4.6];
    const dl = s < 0 ? D.beenL : D.beenR;
    const heupN = hg ? HH.opPunt(Bbekken0, heup) : heup;
    const enkel = hg ? [s * 4.6, 0.4 + hg.voet[i].y, 4.6 + hg.voet[i].z] : enkelR;
    const knie = hg ? HH.elleboog(heup, knieR, enkelR, heupN, enkel) : knieR;
    const Bbeen = hg ? uiteen(i ? 'beenR' : 'beenL') : null;
    zet(capsule(heupN, knie, 1.65, M.bot, dl), Bbeen);
    zet(capsule(knie, enkel, 1.35, M.bot, dl), Bbeen);
    zet(bol(knie, 2.1, M.bot, dl, 0.6), Bbeen);
    bot(null);
    delen.push(ellips([s * 4.6, 2.6, 1.8], [2.1, 4.4, 1.6], M.bot, dl, 0.8));
    bot(Bvoet[i]);
  }
  const oogPlek = hg ? HH.opPunt(Bschedel, plus(H, [0, 6, -0.7])) : plus(H, [0, 6, -0.7]);
  const vuur = hg ? klem(1 + hg.gloed * 0.4, 0, 2.6) : 1;
  return model(delen, mat, {
    ...(hg ? HH.omvat(delen, 2) : { midden: [0, 3, 46], straal: 50 }),
    lichten: [{ pos: oogPlek, r: 16 * vuur, sterk: 1.2 * vuur, warm: 1 }],
  });
}

// ---------------------------------------------------------------- slijmkruiper

const SLIJM_SNELHEID = 1.4;

// Slijm heeft geen botten maar vorm: hij rekt en plet (sz, sxy), hangt over (scheef) en
// verschuift als geheel (dp). De ogen zitten op steeltjes en zakken weg als hij smelt.
const rustSlijm = () => ({ sz: 1, sxy: 1, scheef: [0, 0], dp: [0, 0, 0], bek: 1, ogen: 0 });

function houdingSlijm(stand) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const h = rustSlijm();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    // Deinen: hij ademt niet, maar hij staat ook nooit helemaal stil.
    case 'staan': {
      const w = HH.sinus(fase);
      h.sz = 1 + 0.055 * w;
      h.sxy = 1 - 0.03 * w;
      h.scheef = [0.03 * HH.cosinus(fase), 0.02 * HH.sinus(fase + 0.2)];
      h.ogen = 0.9 * HH.sinus(fase + 0.12);
      break;
    }
    // Springen: drie beelden op de vloer (waar hij precies met het spel mee terugschuift, dus
    // niet glijdt), dan een boog vooruit. Platter bij de landing, langer bij de afzet.
    case 'lopen': {
      const v = SLIJM_SNELHEID * HH.PER_TEGEL;
      const T = 0.8;
      const grond = 0.375;
      const half = (v * T * grond) / 2;
      let y;
      let z;
      if (fase < grond) {
        y = half - v * T * fase;
        z = 0;
      } else {
        const s = (fase - grond) / (1 - grond);
        y = -half + 2 * half * HH.soepel(s);
        z = 13 * Math.sin(Math.PI * s);
      }
      h.dp = [0, y, z];
      h.sz = rij([0.84, 0.78, 1.14, 1.06, 0.98, 1.04, 1.1, 0.94, 0.84]);
      h.sxy = rij([1.1, 1.15, 0.93, 0.97, 1.01, 0.98, 0.95, 1.03, 1.1]);
      h.scheef = [0, rij([0.05, 0.01, -0.08, -0.05, 0, 0.04, 0.07, 0.06, 0.05])];
      break;
    }
    // Uitval: eerst inzakken, dan vooruit schieten met de bek open, en terug.
    case 'aanval': {
      h.sz = rij([1, 0.76, 1.2, 1.1, 0.9, 1]);
      h.sxy = rij([1, 1.16, 0.9, 0.95, 1.06, 1]);
      h.scheef = [0, rij([0, -0.12, 0.34, 0.5, 0.16, 0])];
      h.dp = [0, rij([0, -4, 10, 16, 5, 0]), rij([0, 0, 5, 3, 0, 0])];
      h.bek = rij([1, 0.8, 1.7, 2.1, 1.2, 1]);
      h.ogen = rij([0, -1.5, 1.5, 2, 0.5, 0]);
      break;
    }
    // Geraakt: hij wordt platgeslagen en klotst terug.
    case 'geraakt': {
      h.sz = rij([0.68, 0.86, 0.97]);
      h.sxy = rij([1.2, 1.08, 1.02]);
      h.scheef = [0, rij([-0.16, -0.06, -0.02])];
      h.dp = [0, rij([-5, -2.5, -0.5]), 0];
      h.bek = rij([1.5, 1.2, 1]);
      h.ogen = rij([-2.5, -1, 0]);
      break;
    }
    // Sterven: hij zakt door zijn eigen vorm heen en blijft als een plas liggen. De ogen zinken
    // in de massa weg, het laatste beeld is vlak.
    case 'sterven': {
      h.sz = rij([1.02, 0.92, 0.74, 0.58, 0.45, 0.34, 0.26, 0.22]);
      h.sxy = rij([1, 1.04, 1.12, 1.2, 1.3, 1.38, 1.45, 1.5]);
      h.scheef = [rij([0, 0.02, 0.05, 0.07, 0.06, 0.04, 0.02, 0]), rij([0, -0.03, -0.06, -0.05, -0.03, -0.01, 0, 0])];
      h.bek = rij([1.3, 1.5, 1.4, 1.2, 1, 0.8, 0.6, 0.5]);
      h.ogen = rij([1.5, 0.5, -2, -5, -8, -11, -14, -16]);
      break;
    }
    default:
      throw new Error(`De slijmkruiper kent de houding "${naam}" niet.`);
  }
  return h;
}

// Een klodder groen slijm met twee ogen op steeltjes en een scheve bek.
// stand: { houding, fase } laat hem bewegen; zonder stand blijft hij zoals hij was.
function slijm(ingedrukt = false, stand = null) {
  const M = { slijm: 0, oogwit: 1, pupil: 2, bek: 3, tand: 4 };
  const D = { lijf: 1, ogen: 2, bek: 3 };
  const hg = houdingSlijm(stand);
  const sz = (ingedrukt ? 0.78 : 1) * 1.22 * (hg ? hg.sz : 1);
  const sxy = (ingedrukt ? 1.12 : 1) * 1.22 * (hg ? hg.sxy : 1);
  const kx = hg ? hg.scheef[0] : 0; // overhangen: hoe hoger, hoe verder opzij
  const ky = hg ? hg.scheef[1] : 0;
  const bekWijd = hg ? hg.bek : 1;
  const oogZak = hg ? hg.ogen : 0;
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
  // een punt schuift mee met het overhangen: hoe hoger, hoe verder opzij
  const scheef = (p) => (kx || ky ? [p[0] + kx * p[2], p[1] + ky * p[2], p[2]] : p);
  const zweeft = !!(hg && hg.dp[2] > 0.5);
  const delen = [];
  const wiebel = (x, y, z) => 0.25 * Math.sin(x * 0.3 + z * 0.4) * Math.sin(y * 0.35 + 1);
  delen.push({
    f: (x, y, z) => {
      const X = (kx ? x - kx * z : x) / sxy;
      const Y = (ky ? y - ky * z : y) / sxy;
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
      // in de lucht houdt hij geen vlakke onderkant
      return zweeft ? d * Math.min(sz, sxy) * 0.8 : Math.max(d * Math.min(sz, sxy) * 0.8, -z);
    },
    g: [XY(0), XY(0), Z(11), 32 + 16 * (Math.abs(kx) + Math.abs(ky))],
    m: M.slijm,
    deel: D.lijf,
  });
  // bek: een scheve donkere spleet met twee tandjes
  delen.push({
    f: (x, y, z) => {
      const X = (kx ? x - kx * z : x) / sxy;
      return sdf.ellipsoide(X, (ky ? y - ky * z : y) / sxy - 15.2, z / sz - 8 - 0.12 * X, 7, 2.6, 1.8 * bekWijd);
    },
    g: [scheef([0, XY(15.2), Z(8)])[0], scheef([0, XY(15.2), Z(8)])[1], Z(8), 10 + 3 * bekWijd],
    m: M.bek,
    deel: D.bek,
    uit: true,
  });
  for (const s of [-1, 1]) {
    delen.push(kegel(scheef([XY(s * 3.6), XY(15.6), Z(9.8 + oogZak * 0.5)]), scheef([XY(s * 3.3), XY(16.2), Z(7.6 + oogZak * 0.5)]), 1.1, 0.35, M.tand, D.bek));
  }
  // ogen op korte steeltjes; bij het smelten zakken ze in de massa weg
  for (const s of [-1, 1]) {
    const oog = scheef([XY(s * 5.4), XY(8.4), Z(19.5 + oogZak + (s > 0 ? 1.2 : 0))]);
    delen.push(kegel(scheef([XY(s * 4.4), XY(6.4), Z(14)]), oog, 2.6 * sxy, 2.2 * sxy, M.slijm, D.lijf, 1.6));
    delen.push(bol(oog, 3.3 * sxy, M.oogwit, D.ogen));
    delen.push(bol(plus(oog, [s * -0.3, 2.9 * sxy, 0.2]), 1.55 * sxy, M.pupil, D.ogen));
  }
  if (hg && (hg.dp[0] || hg.dp[1] || hg.dp[2])) {
    const B = HH.beweging({ dp: hg.dp });
    for (let i = 0; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
  }
  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, Z(12)], straal: 34 });
}

module.exports = { wim, skelet, slijm, houdingWim, houdingSkelet, houdingSlijm, schijf, ring, eenheid, langs, WIM_SNELHEID, WIM_FPS, SKELET_SNELHEID, SLIJM_SNELHEID };
