// De figuren van Aardschok als kleine 3D-modellen. De renderer in kern.cjs fotografeert ze uit
// acht richtingen en maakt er pixel art van. Maten in eenheden: één eenheid breed is één pixel,
// één eenheid hoog is 0,866 pixel. De voeten staan op z = 0, het midden van de tegel.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog.
'use strict';
const { sdf, bouwSdf, klem, mix, ruis2, ruis3, hash, rnd } = require('./kern.cjs');
const HH = require('./houding.cjs');

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

// De grensbol om een rok die door de benen is uitgerekt of is uitgezakt.
function rokGrens(benen, rokTop, wijd) {
  let voor = 14.6 + wijd;
  let achter = -13.4 - wijd;
  for (const b of benen || []) {
    voor = Math.max(voor, b.knie[1] + 6.5);
    achter = Math.min(achter, b.knie[1] - 6.5);
  }
  const r = Math.max(16.8 + wijd, (voor - achter) / 2);
  return [0, (voor + achter) / 2, rokTop / 2, Math.hypot(r, rokTop / 2) + 3];
}

// ---------------------------------------------------------------- de houdingen van de tovenaar

// Loopsnelheid in tegels per seconde (Marcel, 20 sep 2026): kwiek op zijn 84e, schuifelend op
// zijn 99e. De loopcyclus is op deze getallen gerekend, zodat een voet op de grond precies met
// het spel mee naar achteren schuift en dus niet glijdt.
const TOVENAAR_SNELHEID = [[84, 2.5], [92, 2.1], [99, 1.8]];
function loopSnelheid(leeftijd) {
  const r = TOVENAAR_SNELHEID;
  if (leeftijd <= r[0][0]) return r[0][1];
  for (let i = 1; i < r.length; i++) {
    if (leeftijd <= r[i][0]) return mix(r[i - 1][1], r[i][1], (leeftijd - r[i - 1][0]) / (r[i][0] - r[i - 1][0]));
  }
  return r[r.length - 1][1];
}

// Alles op nul is de stilstaande figuur. Hoeken in graden: buig = voorover, hel = opzij naar
// rechts, draai = om de lengteas, knik = kin omlaag, kantel = de top van de staf naar voren.
const rustTovenaar = () => ({
  zak: 0,
  zij: 0,
  voor: 0,
  romp: { buig: 0, hel: 0, draai: 0, omhoog: 0 },
  nek: { knik: 0, hel: 0, draai: 0 },
  baard: { zwaai: 0, hel: 0 },
  hoed: { kantel: 0, hel: 0, dp: [0, 0, 0], punt: [0, 0, 0] },
  staf: { omZ: 0, kantel: 0, hel: 0, dp: [0, 0, 0], greep: 0, los: false },
  handL: null, // null: de linkerhand houdt de staf vast
  handR: null, // [dx, dy, dz] vanaf de ruststand, of { staf: dz } om ook de staf te pakken
  voet: [{ y: 0, z: 0, hoek: 0 }, { y: 0, z: 0, hoek: 0 }], // links, rechts
  rok: { hoog: 0, wijd: 0, zoom: 0 },
  bol: { gloed: 0, straal: 0, licht: 1 },
  val: null, // omvallen: { graden (naar rechts), om }
  knielt: false,
});

// De houdingen uit ontwerp/beeld.md. `fase` loopt van 0 tot 1 over de animatie; een rij met
// evenveel waarden als beelden zet elk beeld los neer.
function houdingTovenaar(stand, maat) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const { o, greep, leeftijd } = maat;
  const h = rustTovenaar();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    // Ademen: de borst komt precies één pixel omhoog, zodat de rand schoon blijft; de baard
    // deint erachteraan en de bol klopt zacht mee.
    case 'staan': {
      const adem = rij([0, 1, 1, 0, 0]);
      const na = rij([0, 0, 1, 1, 0]);
      h.romp.omhoog = 1.1547 * adem;
      h.nek.knik = -1.4 * adem;
      h.baard.zwaai = -2.4 * na;
      h.hoed.punt = [0, -1.2 * na, 0];
      h.handR = [0, -0.5 * na, 0.4 * adem];
      const klop = rij([0, 0.7, 1, 0.4, 0]);
      h.bol.gloed = 1.1 * klop;
      h.bol.straal = 0.35 * klop;
      h.bol.licht = 1 + 0.22 * klop;
      break;
    }
    // Een loopcyclus op de plaats. De zoom van de rok wordt door de benen meegetrokken, de staf
    // komt één keer per cyclus neer en de vrije arm zwaait tegen het rechterbeen in.
    case 'lopen': {
      const v = loopSnelheid(leeftijd) * HH.PER_TEGEL;
      const T = 0.8;
      const steun = mix(0.58, 0.68, o);
      const til = mix(5, 2.2, o);
      const hiel = mix(12, 4, o);
      const hak = mix(16, 6, o);
      const mid = -3.4; // in rust staan de voeten naar voren; de stap hoort onder de heupen
      const R = HH.loopVoet(fase, { v, T, steun, til, hiel, hak });
      const L = HH.loopVoet(fase, { v, T, steun, til, hiel, hak, verzet: 0.5 });
      h.voet = [
        { y: L.y + mid, z: L.z, hoek: L.hoek },
        { y: R.y + mid, z: R.z, hoek: R.hoek },
      ];
      h.rok.zoom = 1.6; // de zoom komt van de grond, anders veegt hij over zijn schoenen
      h.zak = (mix(1.7, 0.9, o) * (1 + HH.cosinus(2 * fase))) / 2;
      h.zij = mix(1.1, 0.7, o) * HH.sinus(fase);
      h.romp.buig = mix(3, 13, o) + 1.1 * HH.cosinus(2 * fase);
      h.romp.draai = 3.5 * HH.sinus(fase);
      h.romp.hel = -0.9 * HH.sinus(fase);
      h.nek.knik = -0.45 * h.romp.buig - 1.2 * HH.cosinus(2 * fase);
      h.baard.zwaai = 2.6 * HH.sinus(2 * fase - 0.18);
      h.hoed.punt = [0, -1.8 * HH.sinus(2 * fase - 0.22), 0];
      const st = HH.loopVoet(fase, { v, T, steun: mix(0.34, 0.46, o), til: 3.2 });
      const sy = st.y + mix(-1.5, -3, o);
      h.staf.dp = [0, sy, st.z];
      h.staf.kantel = -0.5 * sy;
      h.handR = [0, -mix(7, 3.5, o) * HH.cosinus(fase), mix(1.5, 0.6, o) * HH.sinus(fase)];
      break;
    }
    // Slaan met de staf: uithalen over de schouder en naar voren neer. Kost geen jaren, dus de
    // bol doet niets bijzonders.
    case 'slaan': {
      const schuif = rij([0, -4, -8, -12, -11, -5]); // hij pakt de staf lager beet om uit te halen
      h.staf.greep = schuif;
      h.staf.omZ = greep + schuif;
      h.staf.kantel = rij([-8, -38, -20, 88, 68, 10]);
      h.staf.dp = [0, rij([0, -3, 0, 6, 5, 1]), rij([0, 5, 8, 2, 1, 0])];
      h.romp.buig = rij([0, -7, -3, 13, 9, 1]);
      h.romp.draai = rij([0, -8, -4, 7, 5, 1]);
      h.zak = rij([0, 0.4, 0, 2.4, 1.6, 0.3]);
      h.voor = rij([0, -1, 0, 3, 2, 0.4]);
      h.nek.knik = rij([0, -5, -2, 9, 6, 1]);
      h.handR = [rij([0, 2, 4, 5, 4, 1]), rij([0, -3, -2, 4, 3, 1]), rij([0, 5, 8, 2, 1, 0])];
      h.baard.zwaai = rij([0, 5, 3, -7, -4, -1]);
      h.hoed.punt = [0, rij([0, 3, 2, -5, -3, 0]), 0];
      h.voet = [
        { y: rij([0, -1, 0, 2, 1.5, 0.3]), z: 0, hoek: 0 },
        { y: rij([0, -1.5, -1, 1, 0.5, 0]), z: 0, hoek: rij([0, -4, -2, 3, 2, 0]) },
      ];
      break;
    }
    // Een spreuk: de staf omhoog, de bol vlamt op en zet de tovenaar zelf in het licht.
    case 'spreuk': {
      const schuif = rij([0, 2, 5, 5, 3, 0]); // de hand glijdt omhoog, de staf gaat de lucht in
      h.staf.greep = schuif;
      h.staf.omZ = greep + schuif;
      h.staf.kantel = rij([0, -7, -13, -15, -9, -2]);
      h.staf.dp = [rij([0, 1, 2, 2, 1, 0]), rij([0, -2, -5, -4, -1, 0]), rij([0, 8, 17, 18, 9, 1])];
      h.romp.buig = rij([0, -4, -7, 8, 4, 0]);
      h.romp.draai = rij([0, 3, 6, -5, -3, 0]);
      h.zak = rij([0, -0.6, -1.2, 1.4, 0.6, 0]);
      h.nek.knik = rij([0, -5, -9, 3, 1, 0]);
      h.handR = [rij([0, 2, 5, 7, 5, 1]), rij([0, 3, 7, 15, 9, 1]), rij([0, 6, 12, 9, 4, 0])];
      h.baard.zwaai = rij([0, -3, -6, 4, 2, 0]);
      h.hoed.punt = [0, rij([0, 3, 5, -3, -1, 0]), 0];
      h.voet = [{ y: 0, z: 0, hoek: 0 }, { y: rij([0, 0, 0.5, 2, 1, 0]), z: 0, hoek: 0 }];
      h.bol.gloed = rij([0.2, 1.2, 2.8, 4.4, 2.2, 0.6]);
      h.bol.straal = rij([0.1, 0.7, 1.8, 3, 1.4, 0.3]);
      h.bol.licht = rij([1.05, 1.5, 2.4, 3.4, 2, 1.15]);
      break;
    }
    // Terugdeinzen: een klap kost maanden, dus hij krimpt ineen en komt half weer overeind.
    case 'geraakt': {
      h.romp.buig = rij([-11, -8, -3]);
      h.romp.draai = rij([-6, -4, -1]);
      h.romp.hel = rij([3, 2, 0.5]);
      h.zak = rij([1.8, 1.3, 0.4]);
      h.voor = rij([-2.6, -1.8, -0.5]);
      h.nek.knik = rij([-9, -6, -2]);
      h.baard.zwaai = rij([7, 5, 1.5]);
      h.hoed.punt = [0, rij([4.5, 3, 1]), 0];
      h.handR = [rij([2, 1.5, 0.5]), rij([-4, -3, -1]), rij([6, 4, 1])];
      h.staf.kantel = rij([-7, -5, -1]);
      h.voet = [{ y: -1.5, z: 0, hoek: 0 }, { y: rij([-2.5, -1.8, -0.5]), z: 0, hoek: 0 }];
      break;
    }
    // Sterven op zijn honderdste: de knieën begeven het, hij zakt door, de staf glijdt uit zijn
    // hand, en hij komt op zijn zij te liggen. Waardig, niet gewelddadig; de bol dooft.
    case 'sterven': {
      // Geen omvallen als één blok: het gewaad zakt in elkaar tot een hoop stof, en het lijf
      // kantelt daaroverheen op zijn zij. Zo blijft alles op de vloer en blijft de cel klein.
      h.knielt = true;
      const zak = rij([0, 1.5, 7, 15, 21, 25, 27.5, 28]);
      h.zak = zak;
      h.rok.hoog = zak * 1.02;
      h.rok.wijd = rij([0, 0.4, 2.4, 5, 7.5, 9, 10, 10.5]);
      h.romp.buig = rij([-7, -3, 6, 14, 18, 16, 12, 10]);
      h.romp.hel = rij([0, 1, 5, 18, 44, 70, 84, 88]);
      h.nek.knik = rij([-9, -7, 0, 6, 8, 7, 5, 4]);
      h.baard.zwaai = rij([-4, -3, 2, 5, 7, 8, 8, 7]);
      h.voet = [
        { y: -7, z: 0.5, hoek: -25 },
        { y: -7, z: 0.5, hoek: -25 },
      ];
      // De staf glijdt uit zijn hand en komt schuin voor hem op de vloer, de bol bij zijn hoofd.
      // Hij valt om zijn greep, zodat hij naast hem blijft en niet het halve beeld uit steekt.
      h.staf.los = true;
      h.staf.omZ = greep;
      h.staf.kantel = rij([0, 2, 5, 11, 17, 21, 22, 22]);
      h.staf.hel = rij([0, 3, 12, 34, 62, 82, 90, 90]);
      h.staf.dp = [0, rij([0, 0, 1, 2, 4, 6, 7, 7]), rij([0, -0.5, -2, -7, -18, -32, -41, -43])];
      h.handL = [rij([0, 1, 4, 9, 14, 18, 20, 21]), rij([0, 0, 1, 2, 3, 4, 4, 4]), rij([0, -1, -4, -9, -13, -15, -16, -16])];
      h.handR = [rij([0, 1, 2, 4, 6, 7, 7, 7]), rij([0, 1, 2, 3, 3, 3, 3, 3]), rij([0, 0, -1, -2, -3, -3, -3, -3])];
      h.hoed.kantel = rij([0, 0, 1, 3, 6, 10, 14, 16]);
      h.hoed.dp = [rij([0, 0, 0, -1, -2, -3.5, -5, -6]), 0, rij([0, 0, 0, -0.5, -1, -1.5, -2, -2.5])];
      const dof = rij([0, 0.1, 0.25, 0.45, 0.62, 0.78, 0.9, 1]);
      h.bol.gloed = -3.4 * dof;
      h.bol.licht = 1 - 0.85 * dof;
      break;
    }
    default:
      throw new Error(`De tovenaar kent de houding "${naam}" niet.`);
  }
  return h;
}

// ---------------------------------------------------------------- de tovenaar

// leeftijd in jaren (84..100). Met de jaren: de rug krommer, de baard langer, de punt van de
// hoed zakt om, en de bol op de staf gloeit harder (+1 schade per vijf jaar boven de 80).
// stand: { houding, fase } laat hem bewegen (zie houdingTovenaar). Zonder stand staat hij stil,
// precies zoals op de vellen in uit/.
function tovenaar(leeftijd = 84, stand = null) {
  const o = klem((leeftijd - 84) / 16, 0, 1);
  const bonus = Math.max(0, Math.floor((leeftijd - 80) / 5));
  const krom = 0.25 + 0.75 * o;
  const S = [0, 2.5 + 4 * krom, 61 - 3.5 * krom]; // midden tussen de schouders
  const H = [0, 5 + 7.5 * krom, 71.5 - 5.5 * krom]; // midden van het hoofd
  const staf = [-17, S[1] + 8]; // de staf staat links voor hem
  const greep = 47 - 2 * krom;
  const bolZ = 95 - 2 * krom;
  const hg = houdingTovenaar(stand, { o, krom, S, H, staf, greep, bolZ, leeftijd });
  const bolR = 4.2 + 0.55 * bonus + (hg ? hg.bol.straal : 0);
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
      return klem(2.6 + 4.4 * kijk * kijk + (h > bolR * 0.35 ? 0.6 : 0) + (hg ? hg.bol.gloed : 0), 2, 7);
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
  // Botten: groepen delen die samen star bewegen. `bot(B)` neemt alles wat sinds de vorige
  // oproep is toegevoegd mee in beweging B; zonder houding is B nul en blijft alles staan.
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const draaiM = (buig, hel, om) => HH.maalM(HH.draaiing([0, 0, 1], om), HH.maalM(HH.draaiing([0, 1, 0], hel), HH.draaiing([1, 0, 0], -buig)));

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

  // --- de botten op hun plek zetten (alleen met een houding)
  const heup = [0, 1, 40];
  const nek = [0, S[1], S[2] + 2];
  const kinPunt = plus(H, [0, 4.2, -6.4]);
  const randPunt = plus(H, [0, -0.8, 7]);
  const stafAs = (z) => [mix(stafOnder[0], stafBoven[0], z / stafBoven[2]), mix(stafOnder[1], stafBoven[1], z / stafBoven[2]), z];
  const Bval = hg && hg.val ? HH.beweging({ as: [0, 1, 0], graden: hg.val.graden, om: hg.val.om }) : null;
  const Blijf = hg ? HH.naElkaar(Bval, HH.beweging({ dp: [hg.zij, hg.voor, -hg.zak] })) : null;
  const Brok = hg ? HH.naElkaar(Bval, HH.beweging({ dp: [hg.zij, hg.voor, 0] })) : null;
  const Bromp = hg ? HH.naElkaar(Blijf, HH.beweging({ M: draaiM(hg.romp.buig, hg.romp.hel, hg.romp.draai), om: heup, dp: [0, 0, hg.romp.omhoog] })) : null;
  const Bhoofd = hg ? HH.naElkaar(Bromp, HH.beweging({ M: draaiM(hg.nek.knik, hg.nek.hel, hg.nek.draai), om: nek })) : null;
  const Bbaard = hg ? HH.naElkaar(Bhoofd, HH.beweging({ M: draaiM(hg.baard.zwaai, hg.baard.hel, 0), om: kinPunt })) : null;
  const Bhoed = hg ? HH.naElkaar(Bhoofd, HH.beweging({ M: draaiM(hg.hoed.kantel, hg.hoed.hel, 0), om: randPunt, dp: hg.hoed.dp })) : null;
  const Bstaf = hg ? HH.naElkaar(hg.staf.los ? null : Bval, HH.beweging({ M: draaiM(hg.staf.kantel, hg.staf.hel, 0), om: stafAs(hg.staf.omZ), dp: hg.staf.dp })) : null;
  const BhandL = hg ? (hg.handL ? HH.naElkaar(Blijf, HH.beweging({ dp: hg.handL })) : HH.naElkaar(Bstaf, HH.beweging({ dp: [0, 0, hg.staf.greep] }))) : null;
  const Bvoet = [0, 1].map((i) =>
    hg ? HH.naElkaar(Bval, HH.beweging({ as: [1, 0, 0], graden: hg.voet[i].hoek, om: [(i ? 1 : -1) * 4.8, 5, 0], dp: [0, hg.voet[i].y, hg.voet[i].z] })) : null,
  );
  // De benen zelf zijn niet te zien, maar ze trekken de rok mee. De stof volgt het been tot de
  // knie en hangt daaronder recht naar beneden; daardoor komt de voet eronder vandaan.
  const benen =
    hg && !hg.knielt
      ? [0, 1].map((i) => {
          const heup = [(i ? 1 : -1) * 5, 0.5 + hg.voor, 40 - hg.zak * 0.8];
          const enkel = [(i ? 1 : -1) * 4.8, 4 + hg.voet[i].y, 3.4 + hg.voet[i].z];
          return { heup, enkel, knie: HH.tussen(heup, enkel, 0.52) };
        })
      : null;
  bot(Bstaf);

  // --- rok van het gewaad: een klokvormige kegel met plooien. Met een houding trekken de benen
  // de zoom mee naar voren en naar achteren, en komt de zoom daar omhoog, zoals stof over een knie.
  const rokTop = hg ? 44 - hg.rok.hoog : 44;
  const rokWijd = hg ? hg.rok.wijd : 0;
  const zoomVan = (y) => (hg ? hg.rok.zoom + 0.5 * Math.max(0, Math.abs(y - 0.6) - 13) : 0);
  delen.push({
    f: hg
      ? (x, y, z) => {
          const t = klem(z / rokTop, 0, 1);
          const rx = mix(16.8 + rokWijd, 10.2, Math.pow(t, 0.8));
          let ry = mix(14 + rokWijd, 8.2, Math.pow(t, 0.9));
          let cy = mix(0.6, 1.5 * krom, t);
          if (benen) {
            let voor = cy + ry;
            let achter = cy - ry;
            for (const b of benen) {
              const u = klem((b.heup[2] - z) / (b.heup[2] - b.knie[2]), 0, 1);
              const by = mix(b.heup[1], b.knie[1], u);
              const br = mix(7.5, 6, u);
              voor = Math.max(voor, by + br);
              achter = Math.min(achter, by - br);
            }
            cy = (voor + achter) / 2;
            ry = (voor - achter) / 2;
          }
          const ex = x / rx;
          const ey = (y - cy) / ry;
          const th = Math.atan2(ey, ex);
          const plooi = (0.06 * Math.sin(th * 9 + 1.3) + 0.035 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.8);
          const zij = (Math.hypot(ex, ey) - 1 - plooi) * Math.min(rx, ry) * 0.88;
          return Math.max(zij, zoomVan(y) - z, z - rokTop);
        }
      : (x, y, z) => {
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
    g: hg ? rokGrens(benen, rokTop, rokWijd) : [0, 1, rokTop / 2, 30],
    m: M.gewaad,
    // de gouden zoom hoort bij de onderrand, ook als die door een been omhoog komt
    ...(hg ? { terug: (x, y, z) => [x, y, z - zoomVan(y)] } : {}),
    deel: D.rok,
  });
  bot(Brok);
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
  bot(Bromp);
  // schoenen met krullende punt, elke voet op zijn eigen plek
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    delen.push(ellips([s * 4.8, 6.5, 2.2], [3.4, 5.6, 2.6], M.leer, D.schoen));
    delen.push(bol([s * 5, 12, 3.4], 1.3, M.leer, D.schoen, 1.2));
    bot(Bvoet[i]);
    // een stuk laars naar de knie toe, zodat een voet die onder de rok uit komt niet los hangt
    if (hg) {
      const enkel = benen ? benen[i].enkel : [s * 4.8, 4 + hg.voet[i].y, 3.4 + hg.voet[i].z];
      const naarBoven = HH.eenheid(HH.af(benen ? benen[i].heup : [s * 5, 0.5, 40], enkel));
      delen.push(kegel(enkel, HH.plus(enkel, HH.keer(naarBoven, 9)), 2.9, 2.5, M.leer, D.schoen, 1));
      bot(Bval);
    }
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
  const Rs = plus(S, [10.5, 0, -1.5]);
  const Re = plus(Rs, [3.2, 0.5, -12]);
  const Rw = plus(Re, [-0.8, 4.4, -6.2]);
  const uR = richting(Re, Rw);
  const Rh = plus(Rw, [uR[0] * 3.9, uR[1] * 3.9, uR[2] * 3.9]);
  // De armen volgen: de schouder hangt aan de romp, de linkerhand aan de staf, en de elleboog
  // houdt de botlengtes van de rusthouding aan.
  const Lhn = hg ? HH.opPunt(BhandL, Lh) : Lh;
  const Lsn = hg ? HH.opPunt(Bromp, Ls) : Ls;
  const Len = hg ? HH.elleboog(Ls, Le, Lh, Lsn, Lhn) : Le;
  const Rsn = hg ? HH.opPunt(Bromp, Rs) : Rs;
  const Rhn = hg
    ? hg.handR && hg.handR.staf !== undefined
      ? HH.opPunt(Bstaf, [staf[0] + 0.25, staf[1] - 0.2, greep + hg.handR.staf])
      : HH.opPunt(Blijf, plus(Rh, hg.handR || [0, 0, 0]))
    : Rh;
  const Ren = hg ? HH.elleboog(Rs, Re, Rh, Rsn, Rhn) : Re;
  const BarmL1 = hg ? HH.lidBeweging(Ls, Le, Lsn, Len) : null;
  const BarmL2 = hg ? HH.lidBeweging(Le, Lh, Len, Lhn) : null;
  const BarmR1 = hg ? HH.lidBeweging(Rs, Re, Rsn, Ren) : null;
  const BarmR2 = hg ? HH.lidBeweging(Re, Rh, Ren, Rhn) : null;
  delen.push(kegel(Ls, Le, 4.6, 4.2, M.gewaad, D.armL, 1.5));
  bot(BarmL1);
  delen.push(kegel(Le, Lw, 4.3, 5.4, manchet(Le, Lw), D.armL, 1));
  bot(BarmL2);
  delen.push(kegel(Rs, Re, 4.6, 4.2, M.gewaad, D.armR, 1.5));
  bot(BarmR1);
  delen.push(kegel(Re, Rw, 4.3, 5.4, manchet(Re, Rw), D.armR, 1));
  bot(BarmR2);
  delen.push(ellips(Lh, [3.3, 3.4, 3.9], M.huid, D.handL, 0.6));
  delen.push(bol(plus(Lh, [1.4, 2.4, 1.8]), 1.5, M.huid, D.handL, 0.6));
  bot(BhandL);
  delen.push(ellips(Rh, [3, 3.1, 3.9], M.huid, D.handR, 0.6));
  delen.push(bol(plus(Rh, [-1.6, 1.2, 0.8]), 1.3, M.huid, D.handR, 0.6));
  bot(BarmR2);

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
  bot(Bhoofd);
  // baard, snor en bakkebaarden
  const kin = plus(H, [0, 4.2, -6.4]);
  const punt = plus(H, [0, 6 + 2.5 * krom, -6.4 - L]);
  delen.push(kegel(kin, punt, 5.4, 1, M.baard, D.baard, 1.5));
  delen.push(kegel(plus(H, [0, 3.2, -8]), plus(punt, [0, -1, 9]), 5, 2.4, M.baard, D.baard, 2));
  for (const s of [-1, 1]) {
    delen.push(kegel(plus(H, [s * 1, 7.6, -3.6]), plus(H, [s * 5.4, 6, -6.4]), 1.9, 1.1, M.baard, D.baard, 1));
    delen.push(kegel(plus(H, [s * 6.4, 1.2, -1.5]), plus(H, [s * 4.8, 3.6, -7]), 2.2, 3, M.baard, D.baard, 1.5));
  }
  bot(Bbaard);

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
  // de punt zwiept na bij elke beweging; het midden van de bocht gaat een derde mee
  const tip = hg ? plus(plus(rand, [0, -(3 + 16 * o), 27 - 15 * o]), hg.hoed.punt) : plus(rand, [0, -(3 + 16 * o), 27 - 15 * o]);
  const bocht = hg ? plus(plus(rand, [0, 0.8, 17 + 2 * o]), HH.keer(hg.hoed.punt, 0.35)) : plus(rand, [0, 0.8, 17 + 2 * o]);
  delen.push(...bochtKegel(plus(rand, [0, 0, 0.4]), bocht, tip, 8.4, 0.8, 7, M.hoed, D.hoed, 1));
  bot(Bhoed);

  const bcN = hg ? HH.opPunt(Bstaf, bc) : bc;
  const licht = hg ? hg.bol.licht : 1;
  const m = model(delen, mat, {
    ...(hg ? HH.omvat(delen, 2) : { midden: [-2, 3, 50], straal: 58 }),
    lichten: [{ pos: bcN, r: (44 + 9 * bonus) * licht, sterk: (1.7 + 0.35 * bonus) * licht, warm: 1, eigen: true }],
    bolPlek: bcN,
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

module.exports = { gekanteld, geschaald, tovenaar, houdingTovenaar, loopSnelheid, model, kegel, capsule, bol, ellips, blok, bochtKegel, plus, naarRamp };
