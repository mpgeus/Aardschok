// De dorpelingen van Aardschok: de smid, de herbergierster, de boer en de dorpsoudste. Mensen uit
// het dorp aan de voet van de toren, die de tovenaar een opdracht kunnen geven. Zelfde bouwstenen,
// maten en materialen als Wim (figuren2.cjs), zodat ze naast hem in hetzelfde spel staan.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// Wegschrijven: dorpelingen-export.cjs (stroken van acht richtingen en portretten).
'use strict';
const { sdf, bouwSdf, klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus, naarRamp } = require('./figuren.cjs');
const { ring, eenheid, langs } = require('./figuren2.cjs');

// ---------------------------------------------------------------- hulpjes

const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Een vloeiend verloop door steunpunten [[z, waarde], ...] (Catmull-Rom): de maat van een romp
// of rok die per hoogte anders is.
function profiel(punten) {
  const n = punten.length;
  return (z) => {
    if (z <= punten[0][0]) return punten[0][1];
    if (z >= punten[n - 1][0]) return punten[n - 1][1];
    let i = 0;
    while (z > punten[i + 1][0]) i++;
    const p0 = punten[Math.max(0, i - 1)][1];
    const p1 = punten[i][1];
    const p2 = punten[i + 1][1];
    const p3 = punten[Math.min(n - 1, i + 2)][1];
    const t = (z - punten[i][0]) / (punten[i + 1][0] - punten[i][0]);
    const t2 = t * t;
    return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t2 * t);
  };
}
// Een grensbol om een vorm met doorsnede rx(z), ry(z) rond cy(z), plus een rand er omheen: het
// verste punt van de ellips op elke hoogte telt, zodat bouwSdf er nooit een stuk van overslaat.
function grensbol({ rx, ry, cy }, z0, z1, rand = 0) {
  const zm = (z0 + z1) / 2;
  let r = 0;
  for (let z = z0; z <= z1 + 0.5; z += 0.5) {
    const zz = Math.min(z, z1);
    const a = rx(zz) + rand;
    const b = ry(zz) + rand;
    const c = cy(zz) - 1;
    r = Math.max(r, Math.hypot(a, Math.abs(c) + b, zz - zm));
  }
  return [0, 1, zm, r + 1];
}

// Een romp met een elliptische doorsnede die per hoogte verloopt: halve breedte rx(z), halve
// diepte ry(z) en het midden cy(z) (een buik schuift naar voren).
function romp(vorm, z0, z1, m, deel, k) {
  const { rx, ry, cy } = vorm;
  return {
    f: (x, y, z) => {
      const zz = klem(z, z0, z1);
      const a = rx(zz);
      const b = ry(zz);
      return Math.max((Math.hypot(x / a, (y - cy(zz)) / b) - 1) * Math.min(a, b) * 0.85, z0 - z, z - z1);
    },
    g: grensbol(vorm, z0, z1),
    m,
    deel,
    k,
  };
}

// Een laag die om een romp ligt, als een schil (een schort, een sjaal): los = afstand tot het lijf,
// d = halve dikte, breed(z) = halve breedte naar links en rechts (alleen de voorkant), van z0 tot
// z1. Onder zHang hangt de laag recht naar beneden, zoals een schort voor een buik.
function schil(vorm, o, m, deel) {
  const { rx, ry, cy } = vorm;
  const { los = 0.3, d = 0.7, breed, z0, z1, zHang = -1e9, voor = true, rand = 0 } = o;
  return {
    f: (x, y, z) => {
      const zz = Math.max(klem(z, z0, z1), zHang);
      const a = rx(zz) + los + d;
      const b = ry(zz) + los + d;
      const c = cy(zz);
      const e = (Math.hypot(x / a, (y - c) / b) - 1) * Math.min(a, b);
      let t = Math.max(Math.abs(e) - d, z0 - z, z - z1);
      if (breed) t = Math.max(t, Math.abs(x) - breed(z));
      if (voor) t = Math.max(t, c + rand - y);
      return t * 0.8;
    },
    g: grensbol({ rx: (z) => rx(Math.max(z, zHang)), ry: (z) => ry(Math.max(z, zHang)), cy: (z) => cy(Math.max(z, zHang)) }, z0, z1, los + 2 * d),
    m,
    deel,
  };
}

// Een klokrok van de grond tot zTop, met plooien. rx en ry: [onder, boven]; cy(t) schuift het
// midden, t = 0 onder, 1 boven.
function klokrok(zTop, rx, ry, cy, m, deel, plooi = 1) {
  return {
    f: (x, y, z) => {
      const t = klem(z / zTop, 0, 1);
      const a = mix(rx[0], rx[1], Math.pow(t, 0.8));
      const b = mix(ry[0], ry[1], Math.pow(t, 0.9));
      const ex = x / a;
      const ey = (y - cy(t)) / b;
      const th = Math.atan2(ey, ex);
      const p = plooi * (0.055 * Math.sin(th * 9 + 1.3) + 0.03 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.85);
      return Math.max((Math.hypot(ex, ey) - 1 - p) * Math.min(a, b) * 0.86, -z, z - zTop);
    },
    g: [0, 1, zTop / 2, Math.hypot(zTop / 2, Math.max(...rx), Math.max(...ry)) + 2],
    m,
    deel,
  };
}

// Een blok met eigen assen (u, v, w, eenheidsvectoren), halve maten h en ronde hoeken r.
function blokGedraaid(c, [u, v, w], h, r, m, deel) {
  return {
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2];
      return sdf.doos(dx * u[0] + dy * u[1] + dz * u[2], dx * v[0] + dy * v[1] + dz * v[2], dx * w[0] + dy * w[1] + dz * w[2], h[0], h[1], h[2], r);
    },
    g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5],
    m,
    deel,
  };
}

// Een hoofd zoals bij Wim: schedel, oren en ogen van (bijna) één eenheid, die net uit het gezicht
// steken, zodat ze in het spel twee pixels groot blijven. Neus, haar en wenkbrauwen doet elke
// figuur zelf. Geeft de diepte van de ogen terug (oy), om wenkbrauwen op te leggen.
function schedel(delen, H, M, D, o = {}) {
  const [rx, ry, rz] = o.maat || [7, 6.9, 7.6];
  const [ox, oz] = o.oog || [2.7, 0.9];
  const oy = ry * Math.sqrt(Math.max(0, 1 - (ox / rx) ** 2 - (oz / rz) ** 2)) - 0.5;
  delen.push(ellips(H, [rx, ry, rz], M.huid, D.hoofd));
  const oor = o.oor || 1;
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(H, [s * (rx - 0.1), 0.4, -0.4]), [1.4 * oor, 2.1 * oor, 2.8 * oor], M.huid, D.hoofd, 0.6));
    delen.push(bol(plus(H, [s * ox, oy, oz]), o.oogR || 0.9, M.oog, D.hoofd));
  }
  return oy;
}

const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };

// Een kleine glimlach: twee korte streepjes die in het midden iets zakken, half in het gezicht,
// zodat ze op het portret net te zien zijn. maat = de stralen van het hoofd, z = hoogte onder H.
function glimlach(delen, H, [rx, ry, rz], m, deel, breed = 1.3, z = -4) {
  const opp = (dx, dz) => ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2 - (dz / rz) ** 2));
  const mid = plus(H, [0, opp(0, z) - 0.1, z]);
  for (const s of [-1, 1]) delen.push(capsule(plus(H, [s * breed, opp(s * breed, z + 0.45) - 0.1, z + 0.45]), mid, 0.5, m, deel));
}

// ---------------------------------------------------------------- de smid

// De smid: breed en sterk, kaal met een zwarte baard, een leren schort vol roet, de mouwen
// opgestroopt. De voorhamer rust op zijn schouder, de andere vuist in zijn zij.
function smid() {
  const M = { huid: 0, hemd: 1, schort: 2, broek: 3, laars: 4, baard: 5, oog: 6, ijzer: 7, hout: 8, riem: 9, krans: 10 };
  const D = { benen: 1, romp: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, baard: 9, hamer: 10 };
  const H = [0, 3.4, 74.5];
  const roet = (x, y, z, zaad) => ruis3(x * 0.24, y * 0.24, z * 0.24, zaad);
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.5,
    hi: 6.4,
    schaduwKracht: 0.7,
    glans: 0.6,
    glansMacht: 16,
    patroon: (x, y, z) => {
      // roet op de onderarmen, en één veeg op de wang
      if (z < H[2] - 10) return roet(x, y, z, 41) > 0.66 ? -1.1 : 0;
      const dx = x + 3.4;
      const dz = z - (H[2] - 2.2);
      return y > H[1] + 3 && dx * dx + dz * dz * 3 < 3.2 ? -1 : 0;
    },
  };
  mat[M.hemd] = { ramp: 'pleister', lo: 0.5, hi: 5, patroon: (x, y, z) => (roet(x, y, z, 43) > 0.68 ? -0.9 : 0) };
  mat[M.schort] = {
    ramp: 'leer',
    lo: 1,
    hi: 5.6,
    patroon: (x, y, z) => (roet(x, y, z, 47) > 0.7 ? -1.2 : roet(x, y, z, 53) > 0.74 ? 0.8 : 0),
  };
  mat[M.broek] = { ramp: 'ijzer', lo: 0.6, hi: 3.6 };
  mat[M.laars] = { ramp: 'schors', lo: 0.4, hi: 4.4 };
  mat[M.baard] = {
    ramp: 'vacht',
    lo: 0.2,
    hi: 3.6,
    patroon: (x, y, z) => {
      const streng = Math.sin(x * 1.5 + Math.sin(z * 0.4) * 1.2 + y * 0.3);
      return streng > 0.6 ? 0.7 : streng < -0.8 ? -0.7 : 0;
    },
  };
  mat[M.oog] = OOG;
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.9, hi: 5.4, glans: 1.6 };
  mat[M.hout] = { ramp: 'hout', lo: 1.4, hi: 5.8, patroon: (x, y, z) => (Math.sin(z * 1.3 + x) > 0.8 ? -0.6 : 0) };
  mat[M.riem] = { ramp: 'leer', lo: 0.4, hi: 3.2 };
  // de krans haar rond het kale hoofd is al grijs, de baard nog zwart: peper en zout
  mat[M.krans] = { ramp: 'vacht', lo: 1.4, hi: 5.2, patroon: (x, y, z) => (Math.sin(z * 2.1 + x * 0.8) > 0.5 ? 0.6 : 0) };

  const delen = [];
  // --- benen, heupen en laarzen
  delen.push(ellips([0, 0.4, 31], [10.6, 7, 5], M.broek, D.benen, 2));
  for (const s of [-1, 1]) {
    delen.push(kegel([s * 5.2, 0.2, 31], [s * 5.3, 0.8, 9], 5, 4.2, M.broek, D.benen, 1));
    delen.push(ellips([s * 5.3, 2.6, 2.9], [3.8, 6.2, 3.2], M.laars, D.benen, 1.2));
    delen.push(kegel([s * 5.3, 0.6, 3], [s * 5.3, 0.6, 12.5], 4.4, 4.2, M.laars, D.benen, 1));
  }

  // --- romp: een brede borst en een buikje, de schouders er als een juk op
  const vorm = {
    rx: profiel([[30, 10.4], [38, 11.2], [46, 12.2], [54, 13.6], [60, 14], [65, 12.5]]),
    ry: profiel([[30, 7], [38, 8.2], [44, 8.8], [50, 8.2], [56, 8.4], [62, 7.6], [65, 6.5]]),
    cy: profiel([[30, 0.4], [40, 1.6], [50, 1.4], [56, 1.6], [65, 0.6]]),
  };
  delen.push(romp(vorm, 30, 65, M.hemd, D.romp, 2));
  delen.push(ellips([0, 0.4, 61], [14.6, 7.8, 6.2], M.hemd, D.romp, 3));

  // --- leren schort met een borststuk; bandjes om de nek en om het middel, een strik achter
  const breed = (z) => (z < 44 ? 10.6 : z > 50 ? 6.2 : mix(10.6, 6.2, (z - 44) / 6));
  delen.push(schil(vorm, { los: 0.4, d: 0.75, breed, z0: 18, z1: 63.5, zHang: 42 }, M.schort, D.schort));
  delen.push({
    f: (x, y, z) => {
      const a = vorm.rx(44) + 0.9;
      const b = vorm.ry(44) + 0.9;
      const e = (Math.hypot(x / a, (y - vorm.cy(44)) / b) - 1) * Math.min(a, b);
      return Math.max(Math.abs(e) - 0.6, Math.abs(z - 44) - 0.9);
    },
    g: [0, 1, 44, 15],
    m: M.riem,
    deel: D.schort,
  });
  const strik = [0, vorm.cy(44) - vorm.ry(44) - 1.2, 44];
  delen.push(bol(strik, 1.4, M.riem, D.schort));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(strik, [s * 2.3, -0.2, 0.5]), [2, 0.9, 1.3], M.riem, D.schort, 0.5));
    delen.push(kegel(plus(strik, [s * 0.6, -0.2, -1]), plus(strik, [s * 1.8, -0.6, -6.5]), 0.8, 0.7, M.riem, D.schort));
  }
  for (const s of [-1, 1]) {
    const hoek = [s * 5.6, vorm.cy(63) + vorm.ry(63) * Math.sqrt(1 - (5.6 / vorm.rx(63)) ** 2) + 1, 63];
    delen.push(capsule(hoek, [s * 5, -1.5, 69], 0.8, M.riem, D.schort));
  }

  // --- armen: de rechter houdt de hamer op de schouder, de linker vuist staat in de zij
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const rol = langs(Sch, El, 0.7);
    const u = eenheid(min(El, Sch));
    delen.push(kegel(Sch, rol, 5.4, 5, M.hemd, dArm, 1.5));
    delen.push(ring(rol, u, 4.9, 1.3, M.hemd, dArm));
    delen.push(kegel(rol, El, 4.8, 4.6, M.huid, dArm, 1));
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 3.2));
    delen.push(kegel(El, langs(El, pols, 0.35), 4.6, 4.9, M.huid, dArm, 1));
    delen.push(kegel(langs(El, pols, 0.35), pols, 4.9, 3.5, M.huid, dArm, 1));
    delen.push(ellips(Hand, [3.3, 3.5, 3.6], M.huid, dHand, 0.6));
  };
  // hamer: de steel door de rechtervuist, over de schouder; de kop erachter
  const A = [9.6, 13.4, 46.5];
  const B = [18.5, -6, 72.5];
  const u = eenheid(min(B, A));
  const w = eenheid(kruis(u, [1, 0, 0]));
  const v = kruis(w, u);
  delen.push(kegel(A, B, 1.4, 1.5, M.hout, D.hamer));
  delen.push(blokGedraaid(plus(B, maal(u, 1.2)), [v, w, u], [2.9, 6.4, 3], 0.9, M.ijzer, D.hamer));
  arm([14.2, 0.4, 60], [18.2, 4, 49], langs(A, B, 0.2), D.armR, D.handR);
  arm([-14.2, 0.4, 60], [-21, -2.2, 50], [-13.4, 1.8, 41.5], D.armL, D.handL);

  // --- hoofd: kaal en glimmend, een krans haar achter, borstelige wenkbrauwen, volle baard
  const oy = schedel(delen, H, M, D, { maat: [7.2, 7, 7.8], oog: [2.8, 0.8] });
  delen.push(ellips(plus(H, [0, 7.1, -1.3]), [2.1, 2, 2.3], M.huid, D.hoofd, 1.2));
  delen.push(bol(plus(H, [0, 8.3, -2.5]), 1.6, M.huid, D.hoofd, 1));
  delen.push(ellips(plus(H, [0, -2.2, -1.8]), [7.5, 6.3, 5.2], M.krans, D.hoofd, 1));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(H, [s * 2.9, oy + 0.1, 3.3]), [2.5, 1.2, 1], M.baard, D.hoofd, 0.5));
    delen.push(kegel(plus(H, [s * 6.5, 1, -0.6]), plus(H, [s * 5.4, 3.4, -6]), 1.4, 2.4, M.baard, D.baard, 1.2));
    delen.push(kegel(plus(H, [s * 0.7, 7.7, -3.4]), plus(H, [s * 5, 5.8, -5.4]), 2, 1.4, M.baard, D.baard, 0.8));
  }
  delen.push(ellips(plus(H, [0, 3.2, -7.4]), [6.8, 6.2, 6.2], M.baard, D.baard, 1.5));
  delen.push(kegel(plus(H, [0, 4.2, -9]), plus(H, [0, 6.6, -15.5]), 6.2, 3.8, M.baard, D.baard, 2));

  return model(delen, mat, { midden: [0, 2, 42], straal: 50 });
}

// ---------------------------------------------------------------- de herbergierster

// De herbergierster: rond en hartelijk, een rode jurk met een wit schort, het haar in een knot.
// De vuist in de zij, en in de andere hand een kroes bier die ze je al voorhoudt.
function herbergierster() {
  const M = { huid: 0, jurk: 1, lijfje: 2, bloes: 3, schort: 4, haar: 5, oog: 6, kroes: 7, band: 8, schuim: 9, mond: 10, oorbel: 11 };
  const D = { rok: 1, lijf: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, kroes: 10 };
  const H = [0, 3.2, 65];
  const K = [-7.2, 11.6, 46]; // midden van de kroes
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.7,
    hi: 6.6,
    schaduwKracht: 0.7,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // blosjes op de wangen
      for (const s of [-1, 1]) {
        const dx = x - s * 3.8;
        const dz = z - (H[2] - 2.4);
        if (y > H[1] + 3 && dx * dx + dz * dz * 2.4 < 1.1) return naarRamp('rood', stap, [1.7, 6.6], [6.4, 8.4]);
      }
      return 0;
    },
  };
  mat[M.jurk] = { ramp: 'rood', lo: 1.4, hi: 6.2 };
  mat[M.lijfje] = {
    ramp: 'rood',
    lo: 0.9,
    hi: 4.8,
    patroon: (x, y, z) => {
      // veters voorop: een zigzag van lichte streepjes
      if (y < 4 || Math.abs(x) > 2) return 0;
      const zz = (z - 37) / 2.4;
      const f = zz - Math.floor(zz);
      return Math.abs(Math.abs(x) - f * 2) < 0.55 ? { ramp: 'pleister', stap: 4 } : 0;
    },
  };
  mat[M.bloes] = { ramp: 'pleister', lo: 2, hi: 6.2 };
  mat[M.schort] = { ramp: 'pleister', lo: 2.4, hi: 6.4, patroon: (x, y, z) => (Math.sin(x * 1.1 + 0.7) > 0.8 ? -0.6 : 0) };
  mat[M.haar] = {
    ramp: 'hout',
    lo: 0.6,
    hi: 4.4,
    patroon: (x, y, z) => (Math.sin(x * 2.1 + z * 0.7 + y * 0.9) > 0.6 ? 0.7 : 0),
  };
  mat[M.oog] = OOG;
  mat[M.kroes] = { ramp: 'hout', lo: 1.6, hi: 6, patroon: (x, y) => (Math.sin(Math.atan2(y - K[1], x - K[0]) * 7) > 0.75 ? -0.7 : 0) };
  mat[M.band] = { ramp: 'ijzer', lo: 1.4, hi: 5.6, glans: 1.2 };
  mat[M.schuim] = { ramp: 'baard', lo: 3.4, hi: 7 };
  mat[M.mond] = { ramp: 'huid', lo: 1.6, hi: 2.6, detail: true, rand: 0, schaduw: false };
  mat[M.oorbel] = { ramp: 'goud', lo: 2.6, hi: 6.6, glans: 1.2, detail: true };

  const delen = [];
  // --- rok en schort
  const rokTop = 38;
  const rok = {
    rx: (z) => mix(15.5, 10, Math.pow(klem(z / rokTop, 0, 1), 0.8)),
    ry: (z) => mix(13.5, 8, Math.pow(klem(z / rokTop, 0, 1), 0.9)),
    cy: () => 0.8,
  };
  delen.push(klokrok(rokTop, [15.5, 10], [13.5, 8], () => 0.8, M.jurk, D.rok, 1));
  delen.push(schil(rok, { los: 1.2, d: 0.6, breed: (z) => mix(8.8, 6.9, z / rokTop), z0: 5, z1: rokTop - 0.5 }, M.schort, D.schort));

  // --- lijfje met veters tot de schouders, voorop een witte halslijn; pofmouwen
  const lijf = {
    rx: profiel([[35, 9.6], [41, 9.8], [47, 10.6], [52, 10.8], [56, 9.4]]),
    ry: profiel([[35, 7.6], [41, 7.2], [47, 7.6], [52, 7.2], [56, 6]]),
    cy: profiel([[35, 0.8], [45, 1.1], [56, 0.6]]),
  };
  const lijfMat = (x, y, z) => (y > 2.5 && Math.abs(x) < 6.2 && z > 49.6 + 0.1 * x * x ? M.bloes : M.lijfje);
  delen.push(romp(lijf, 34, 56, lijfMat, D.lijf, 2));
  delen.push(ellips([0, 3.6, 47.5], [8.4, 5.6, 4.4], lijfMat, D.lijf, 2.5));
  delen.push(ellips([0, 0.4, 54.5], [10.6, 6.8, 4.2], lijfMat, D.lijf, 2.5));
  // schortband om het middel met een strik achter
  delen.push({
    f: (x, y, z) => {
      const a = lijf.rx(37.5) + 0.7;
      const b = lijf.ry(37.5) + 0.7;
      const e = (Math.hypot(x / a, (y - lijf.cy(37.5)) / b) - 1) * Math.min(a, b);
      return Math.max(Math.abs(e) - 0.6, Math.abs(z - 37.5) - 1.3);
    },
    g: [0, 1, 37.5, 13],
    m: M.schort,
    deel: D.schort,
  });
  const strik = [0, lijf.cy(37.5) - lijf.ry(37.5) - 1.1, 37.8];
  delen.push(bol(strik, 1.3, M.schort, D.schort));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(strik, [s * 2.2, -0.2, 0.5]), [2, 0.9, 1.4], M.schort, D.schort, 0.5));
    delen.push(kegel(plus(strik, [s * 0.5, -0.2, -1]), plus(strik, [s * 1.6, -0.8, -8]), 0.9, 0.8, M.schort, D.schort));
  }

  // --- armen: witte pofmouwen, blote onderarmen. Rechts de vuist in de zij, links de kroes.
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const u = eenheid(min(El, Sch));
    delen.push(bol(plus(Sch, [0, 0, -0.5]), 4.4, M.bloes, dArm, 1.5));
    delen.push(kegel(Sch, langs(Sch, El, 0.55), 4, 3.4, M.bloes, dArm, 1));
    delen.push(ring(langs(Sch, El, 0.55), u, 3.3, 0.9, M.bloes, dArm));
    delen.push(kegel(langs(Sch, El, 0.55), El, 3.2, 3, M.huid, dArm, 1));
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 2.8));
    delen.push(kegel(El, pols, 3.1, 2.5, M.huid, dArm, 1));
    delen.push(ellips(Hand, [2.7, 2.9, 3.1], M.huid, dHand, 0.6));
  };
  arm([10.4, 0.4, 52.5], [16, -1.8, 44.5], [11.6, 1.8, 39], D.armR, D.handR);
  // de kroes: houten duigen, twee ijzeren banden, een oor aan de kant van de hand, schuim erop
  const kroes = (x, y, z) => (Math.abs(z - K[2] + 2.2) < 0.7 || Math.abs(z - K[2] - 2) < 0.7 ? M.band : M.kroes);
  delen.push(kegel(plus(K, [0, 0, -3.4]), plus(K, [0, 0, 2.8]), 2.9, 2.7, kroes, D.kroes));
  delen.push(ring(plus(K, [-3.1, 0, 0]), [0, 1, 0], 1.8, 0.65, M.band, D.kroes));
  delen.push(ellips(plus(K, [0, 0, 3.6]), [2.9, 2.9, 1.5], M.schuim, D.kroes, 0.8));
  delen.push(bol(plus(K, [1.4, 2.1, 3]), 1.1, M.schuim, D.kroes, 0.8));
  arm([-10.4, 0.4, 52.5], [-13.8, 3, 43], plus(K, [-4.6, -0.3, 0.2]), D.armL, D.handL);

  // --- hoofd: blosjes, een glimlach, het haar strak naar achteren in een knot
  const oy = schedel(delen, H, M, D, { maat: [6.8, 6.6, 7.3], oog: [2.6, 0.8], oor: 0.8 });
  delen.push(bol(plus(H, [0, 6.8, -1.3]), 1.5, M.huid, D.hoofd, 1));
  glimlach(delen, H, [6.8, 6.6, 7.3], M.mond, D.hoofd);
  for (const s of [-1, 1]) delen.push(bol(plus(H, [s * 6.75, 0.5, -3.3]), 0.7, M.oorbel, D.hoofd));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 3]), [2, 0.8, 0.7], M.haar, D.hoofd, 0.4));
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.5, dz - 0.5, 7.15, 6.95, 7.55);
      // de haargrens: voorop hoog op het voorhoofd, opzij achter de slapen langs
      const lijn = (dy - 4.8 - 1.2 * (dz - 5)) / 1.56;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.8, 9],
    m: M.haar,
    deel: D.haar,
    k: 0.8,
  });
  delen.push(ellips(plus(H, [0, -3.8, 6.3]), [3.8, 3.6, 3.6], M.haar, D.haar));

  return model(delen, mat, { midden: [0, 2, 38], straal: 46 });
}

// ---------------------------------------------------------------- de boer

// De boer: lang en mager, een strohoed achter op het hoofd, een donkerblauwe boerenkiel met een rode
// halsdoek, klompen, een strootje in de mondhoek. De hooivork staat naast hem.
function boer() {
  const M = { huid: 0, kiel: 1, broek: 2, klomp: 3, haar: 4, oog: 5, stro: 6, lint: 7, doek: 8, hout: 9, ijzer: 10, strootje: 11 };
  const D = { benen: 1, kiel: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, hoed: 8, doek: 9, vork: 10 };
  const H = [0, 4, 68.5];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.9, hi: 6.4, schaduwKracht: 0.85 };
  mat[M.kiel] = { ramp: 'pet', lo: 1.4, hi: 6.2, patroon: (x, y, z) => (Math.sin(x * 1.3 + 0.4) > 0.82 && z < 50 ? -0.7 : 0) };
  mat[M.broek] = { ramp: 'aarde', lo: 0.8, hi: 4.6 };
  mat[M.klomp] = { ramp: 'zand', lo: 3, hi: 7.4 };
  mat[M.haar] = { ramp: 'schors', lo: 0.8, hi: 4.4 };
  mat[M.oog] = OOG;
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.2,
    patroon: (x, y, z) => {
      // gevlochten stro: ringen op de rand, banden om de bol
      const r = Math.hypot(x - H[0], y - H[1]);
      const s = z > H[2] + 7.2 ? Math.sin(z * 2.4) : Math.sin(r * 2.2);
      return s > 0.55 ? 0.6 : s < -0.7 ? -0.6 : 0;
    },
  };
  mat[M.lint] = { ramp: 'schors', lo: 0.6, hi: 3 };
  mat[M.doek] = { ramp: 'rood', lo: 2, hi: 6.4 };
  mat[M.hout] = { ramp: 'hout', lo: 1.6, hi: 6 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.8, hi: 6.2, glans: 1.2, detail: true };
  mat[M.strootje] = { ramp: 'stro', lo: 4.2, hi: 6.6 };

  const delen = [];
  // --- benen en klompen
  for (const s of [-1, 1]) {
    delen.push(kegel([s * 4.4, 0, 30], [s * 4.3, 0.8, 7], 3.9, 3.4, M.broek, D.benen, 1));
    delen.push(ellips([s * 4.4, 2.6, 3], [3.5, 6.6, 3.2], M.klomp, D.benen, 1));
    delen.push(bol([s * 4.4, 8.4, 3.9], 1.7, M.klomp, D.benen, 1.8));
  }
  // --- kiel: los en wijd, tot halverwege de dij; schouders erop
  const kiel = {
    rx: profiel([[24, 11], [30, 10.2], [38, 9.4], [46, 9.8], [52, 10.4], [58, 10]]),
    ry: profiel([[24, 8.4], [30, 7.6], [38, 6.8], [46, 7], [52, 7.2], [58, 6.4]]),
    cy: profiel([[24, 0.8], [40, 0.8], [58, 0.5]]),
  };
  delen.push(romp(kiel, 24, 58, M.kiel, D.kiel, 2));
  delen.push(ellips([0, 0.4, 57], [10.4, 6.8, 4.4], M.kiel, D.kiel, 2.5));
  // rode halsdoek met een knoop en een puntje voorop
  delen.push({
    f: (x, y, z) => Math.max(Math.abs(sdf.ellipsoide(x, y - 1.4, z - 60.4, 5.8, 5.4, 3)) - 0.9, Math.abs(z - 60.4) - 1.8),
    g: [0, 1.4, 60.4, 8],
    m: M.doek,
    deel: D.doek,
  });
  delen.push(bol([0.6, 7, 59.4], 1.6, M.doek, D.doek, 0.6));
  delen.push(kegel([0.6, 7.2, 58.8], [1.4, 8.4, 54.6], 1.8, 0.7, M.doek, D.doek));

  // --- armen: mouwen opgestroopt. Links de hooivork, rechts hangt de arm langs het lijf.
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const u = eenheid(min(El, Sch));
    delen.push(kegel(Sch, El, 3.9, 3.4, M.kiel, dArm, 1.5));
    delen.push(ring(langs(Sch, El, 0.96), u, 3.4, 1, M.kiel, dArm));
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 2.8));
    delen.push(kegel(El, pols, 3.1, 2.4, M.huid, dArm, 1));
    delen.push(ellips(Hand, [2.6, 2.8, 3.1], M.huid, dHand, 0.6));
  };
  // hooivork: de steel op de grond links voor hem, drie tanden in een vlak dat schuin staat
  const voet = [-12.4, 8.4, 0.5];
  const top = [-13.9, 6.7, 69.5];
  delen.push(kegel(voet, top, 1.1, 1.15, M.hout, D.vork));
  const dwars = eenheid([0.94, -0.34, 0]);
  delen.push(capsule(plus(top, maal(dwars, -2.9)), plus(top, maal(dwars, 2.9)), 0.95, M.ijzer, D.vork));
  delen.push(kegel(plus(top, [0, 0, -2.5]), plus(top, [0, 0, 0.6]), 1.5, 1.1, M.ijzer, D.vork));
  for (const t of [-2.7, 0, 2.7]) {
    const b = plus(top, maal(dwars, t));
    delen.push(...bochtKegel(b, plus(b, [0, 0.3, 5.4]), plus(b, [0, 1.7, 10.6]), 0.8, 0.55, 3, M.ijzer, D.vork, 0.4));
  }
  arm([-10, 0.3, 56], [-13.6, -0.6, 45.4], langs(voet, top, 0.69), D.armL, D.handL);
  arm([10, 0.3, 56], [12.3, 0.4, 45.5], [11.4, 2.6, 36.2], D.armR, D.handR);

  // --- hoofd: lang gezicht, grote neus, flaporen; bruin haar onder de hoed uit
  const oy = schedel(delen, H, M, D, { maat: [6.7, 6.7, 7.8], oog: [2.6, 0.8], oor: 1 });
  delen.push(ellips(plus(H, [0, 6.9, -1.4]), [1.7, 2.4, 2.6], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.2, -2.8]), 1.7, M.huid, D.hoofd, 1));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.6]), [2.1, 1, 0.9], M.haar, D.hoofd, 0.4));
  delen.push(ellips(plus(H, [0, -2, 0.4]), [7.1, 6.1, 6.8], M.haar, D.hoofd, 1));
  // strootje in de rechtermondhoek
  delen.push(capsule(plus(H, [1.4, 5.8, -4.3]), plus(H, [8.6, 8.4, -0.8]), 0.5, M.strootje, D.hoofd));
  // strohoed: brede rand, voorop opgewipt zodat de ogen vrij blijven; een bol met een lint
  const rand = plus(H, [0, -1.2, 6.6]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - rand[0];
      const dy = y - rand[1];
      const dz = z - rand[2] + 0.01 * (dx * dx + dy * dy) - 0.17 * dy;
      return sdf.ellipsoide(dx, dy, dz, 13.4, 12.8, 1) * 0.75;
    },
    g: [rand[0], rand[1], rand[2], 15],
    m: M.stro,
    deel: D.hoed,
  });
  delen.push({
    f: (x, y, z) => sdf.cilinder(x - rand[0], y - rand[1] - 0.4, z - rand[2], 6.3, 0, 6.2) - 0.6,
    g: [rand[0], rand[1], rand[2] + 3.5, 9],
    m: (x, y, z) => (z < rand[2] + 2.4 ? M.lint : M.stro),
    deel: D.hoed,
    k: 1,
  });

  return model(delen, mat, { midden: [0, 2, 43], straal: 50 });
}

// ---------------------------------------------------------------- de dorpsoudste

// De dorpsoudste: een krom oud vrouwtje met wit haar in een knotje, een paarse omslagdoek met
// een gouden speld, en een wandelstok. De oudste van het dorp, en toch jonger dan de tovenaar.
function dorpsoudste() {
  const M = { huid: 0, jurk: 1, doek: 2, haar: 3, oog: 4, hout: 5, speld: 6, mond: 7, rok: 8, schort: 9 };
  const D = { rok: 1, lijf: 2, doek: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, stok: 10, schort: 11 };
  const H = [0, 9.2, 65.5];
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 2,
    hi: 6.8,
    schaduwKracht: 0.7,
    patroon: (x, y, z) => {
      // rimpels: twee lijnen over het voorhoofd
      const dz = z - H[2];
      return y > H[1] + 4 && Math.abs(x) < 3.4 && dz > 3.4 && dz < 5.6 && Math.sin(dz * 3.4 + 0.6) > 0.72 ? -0.9 : 0;
    },
  };
  mat[M.jurk] = { ramp: 'steen', lo: 0.8, hi: 4.2 };
  // de rok met een donkere zoom; daarover een zwart schort
  mat[M.rok] = { ramp: 'steen', lo: 0.9, hi: 4.6, patroon: (x, y, z) => (z < 4.2 ? -1.2 : 0) };
  mat[M.schort] = { ramp: 'vacht', lo: 0.4, hi: 2.8, patroon: (x, y, z) => (Math.sin(x * 1.2 + 0.5) > 0.8 ? -0.6 : 0) };
  mat[M.doek] = { ramp: 'magie', lo: 0.8, hi: 4.4, patroon: (x, y, z) => (Math.sin(x * 1.6 + z * 0.5) > 0.8 ? -0.6 : 0) };
  mat[M.haar] = { ramp: 'baard', lo: 2.2, hi: 6.4, patroon: (x, y, z) => (Math.sin(x * 2.3 + y * 0.8 + z * 0.4) > 0.55 ? 0.6 : 0) };
  mat[M.oog] = OOG;
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 5.4 };
  mat[M.speld] = { ramp: 'goud', lo: 2.4, hi: 6.4, glans: 1.2, detail: true };
  mat[M.mond] = { ramp: 'huid', lo: 1.6, hi: 2.6, detail: true, rand: 0, schaduw: false };

  const delen = [];
  // --- lange rok, een krom lijf: de rug rond, de schouders en het hoofd naar voren
  const rok = {
    rx: (z) => mix(13.6, 9.8, Math.pow(klem(z / 36.5, 0, 1), 0.8)),
    ry: (z) => mix(12.2, 7.9, Math.pow(klem(z / 36.5, 0, 1), 0.9)),
    cy: (z) => mix(1.2, 1.9, klem(z / 36.5, 0, 1)),
  };
  delen.push(klokrok(36.5, [13.6, 9.8], [12.2, 7.9], (t) => mix(1.2, 1.9, t), M.rok, D.rok, 0.8));
  delen.push(schil(rok, { los: 1, d: 0.55, breed: (z) => mix(7.6, 6.2, z / 36.5), z0: 6, z1: 36 }, M.schort, D.schort));
  const lijf = {
    rx: profiel([[34.5, 9.7], [42, 9.8], [49, 10], [56.5, 9.3]]),
    ry: profiel([[34.5, 7.9], [42, 7.1], [49, 7.2], [56.5, 6.3]]),
    cy: profiel([[34.5, 1.9], [42, 2.1], [49, 3.4], [56.5, 5.2]]),
  };
  const bovenlijf = [
    romp(lijf, 34.5, 56.5, M.jurk, D.lijf, 2),
    ellips([0, -0.4, 51.5], [9, 6, 6.2], M.jurk, D.lijf, 3),
    ellips([0, 4.5, 55], [9.8, 6.4, 4.2], M.jurk, D.lijf, 2.5),
  ];
  delen.push(...bovenlijf);
  delen.push(kegel([0, 5.8, 55.5], plus(H, [0, -1.4, -5]), 3.5, 3.2, M.huid, D.lijf, 1));

  // --- omslagdoek: een schil op vaste afstand van het lijf, over schouders en bochel. Achter
  // hangt een punt tot op de heupen, voorop komen de einden bij de speld samen. De bovenrand
  // loopt naar voren af, zodat de hals en de kin vrij blijven.
  const lijfAfstand = bouwSdf(bovenlijf);
  const onderrand = (x, y) => {
    const achter = klem((2 - y) / 8, 0, 1);
    return mix(48.5, 44, achter) - achter * 5.5 * Math.max(0, 1 - Math.abs(x) / 6.5);
  };
  delen.push({
    f: (x, y, z) => Math.max(Math.abs(lijfAfstand(x, y, z) - 1.5) - 0.95, onderrand(x, y) - z, z - (60.4 - 0.3 * y)) * 0.85,
    g: [0, 1.5, 49.5, 23],
    m: M.doek,
    deel: D.doek,
  });
  const speld = [-0.6, lijf.cy(51.5) + lijf.ry(51.5) + 2.6, 52];
  delen.push(bol(speld, 1.3, M.speld, D.doek));

  // --- armen in donkere mouwen: rechts op de stok, links houdt de doek bij de speld dicht
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 2.6));
    delen.push(kegel(Sch, El, 3.6, 3.2, M.jurk, dArm, 1.5));
    delen.push(kegel(El, pols, 3.2, 2.6, M.jurk, dArm, 1));
    delen.push(ellips(Hand, [2.5, 2.7, 2.9], M.huid, dHand, 0.6));
  };
  // wandelstok met een gebogen handvat
  const stokOnder = [10.4, 13.2, 0.5];
  const stokBoven = [9.8, 12.2, 42];
  delen.push(kegel(stokOnder, stokBoven, 1, 1.15, M.hout, D.stok));
  delen.push(...bochtKegel(stokBoven, plus(stokBoven, [0, 0.4, 3.6]), plus(stokBoven, [0, 3.8, 3]), 1.15, 1.05, 4, M.hout, D.stok, 0.5));
  delen.push(...bochtKegel(plus(stokBoven, [0, 3.8, 3]), plus(stokBoven, [0, 5.4, 2.4]), plus(stokBoven, [0, 5.2, 0.2]), 1.05, 0.95, 3, M.hout, D.stok, 0.5));
  arm([9.6, 3.8, 53.5], [12.6, 5.6, 46.5], plus(stokBoven, [0, 1.2, 3.4]), D.armR, D.handR);
  arm([-9.6, 3.8, 53.5], [-11.6, 6.8, 46], plus(speld, [-3.2, 0.6, -0.8]), D.armL, D.handL);

  // --- hoofd: iets voorover, rimpels, wit haar strak naar achteren in een knotje
  const oy = schedel(delen, H, M, D, { maat: [6.6, 6.5, 7.2], oog: [2.6, 0.9], oor: 0.85 });
  delen.push(bol(plus(H, [0, 6.8, -1.2]), 1.6, M.huid, D.hoofd, 1));
  glimlach(delen, H, [6.6, 6.5, 7.2], M.mond, D.hoofd, 1.2, -3.9);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.9]), [1.9, 0.8, 0.7], M.haar, D.hoofd, 0.4));
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.5, dz - 0.5, 6.95, 6.85, 7.45);
      const lijn = (dy - 4.8 - 1.2 * (dz - 5)) / 1.56;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.5, 9],
    m: M.haar,
    deel: D.haar,
    k: 0.8,
  });
  delen.push(ellips(plus(H, [0, -4.2, 5.4]), [3.5, 3.3, 3.4], M.haar, D.haar));

  return model(delen, mat, { midden: [0, 3, 38], straal: 46 });
}

// ---------------------------------------------------------------- alle dorpelingen

// naam, bouwer, het midden van het hoofd (voor het portret) en een regel over wie het is.
const DORPELINGEN = [
  {
    naam: 'smid',
    maak: smid,
    hoofd: [0, 3.4, 74.5],
    portret: { kant: 'ZW', midden: 0.4 },
    wie: 'De smid: breed, kaal, zwarte baard, leren schort vol roet, de voorhamer op zijn schouder.',
  },
  {
    naam: 'herbergierster',
    maak: herbergierster,
    hoofd: [0, 3.2, 65],
    portret: { kant: 'ZW', midden: 0.52 },
    wie: 'De herbergierster: rode jurk, wit schort, haar in een knot, een kroes bier in de hand.',
  },
  {
    naam: 'boer',
    maak: boer,
    hoofd: [0, 4, 68.5],
    portret: { kant: 'ZW', midden: 0.6 },
    wie: 'De boer: strohoed, donkerblauwe kiel, rode halsdoek, klompen, hooivork, strootje in de mond.',
  },
  {
    naam: 'dorpsoudste',
    maak: dorpsoudste,
    hoofd: [0, 9.2, 65.5],
    portret: { kant: 'ZW', midden: 0.5 },
    wie: 'De dorpsoudste: krom vrouwtje, wit knotje, paarse omslagdoek met gouden speld, wandelstok.',
  },
];

module.exports = { smid, herbergierster, boer, dorpsoudste, DORPELINGEN, profiel, grensbol, romp, schil, klokrok, blokGedraaid, schedel, glimlach };
