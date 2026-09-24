// Meer volk voor het grote dorp aan de voet van de toren: zeven vaklieden (de bakker, de molenaar,
// de kruidenvrouw, de jager, de marskramer, de koster en de wachter) en een generator die gewone
// dorpelingen maakt, man of vrouw, zodat het dorp vol kan lopen: dorpeling(zaad, opties).
// Zelfde bouwstenen, maten en materialen als dorpelingen.cjs, zodat ze naast Wim en de smid staan.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// Wegschrijven: dorpelingen3-export.cjs. Beoordelen: dorpelingen3-proef.cjs. Veel zaden in één keer
// nakijken (past alles in de cel, zijn de ogen te zien): dorpelingen3-controle.cjs.
'use strict';
const { sdf, bouwSdf, klem, mix, rnd, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus, naarRamp } = require('./figuren.cjs');
const { ring, schijf, eenheid, langs } = require('./figuren2.cjs');
const { profiel, grensbol, romp, schil, klokrok, blokGedraaid, schedel, glimlach, houdingDorpeling, bottenDorpeling, knieTussen, beenPunten, voetBot } = require('./dorpelingen.cjs');
const HH = require('./houding.cjs');

// Loopsnelheid van een gewone dorpeling: dezelfde 1,2 tegels/s als maakDorpeling in js/kaart.js
// hem in het spel geeft (anders lijkt hij te glijden — zie de uitleg in dorpelingen.cjs).
const DORPELING_SNELHEID = 1.2;

// ---------------------------------------------------------------- hulpjes

const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const punt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };
const mondVan = (lo) => ({ ramp: 'huid', lo: Math.max(0.6, lo - 0.3), hi: lo + 0.8, detail: true, rand: 0, schaduw: false });
// Kleine vlekjes (meel, stof): alleen waar fijne ruis boven de drempel komt, zodat het spikkels
// blijven en geen camouflagevlekken.
const spikkel = (x, y, z, zaad, drempel = 0.8, fijn = 0.6) => ruis3(x * fijn, y * fijn, z * fijn, zaad) > drempel;

// Een assenstelsel [u, v, w] met u langs de gegeven richting en w zo veel mogelijk omhoog.
function assen(richting, omhoog = [0, 0, 1]) {
  const u = eenheid(richting);
  let v = kruis(omhoog, u);
  if (Math.hypot(...v) < 1e-4) v = kruis([0, 1, 0], u);
  v = eenheid(v);
  return [u, v, kruis(u, v)];
}
// lokale maten ten opzichte van een midden en assen
const lokaal = (p, c, [u, v, w]) => {
  const d = min(p, c);
  return [punt(d, u), punt(d, v), punt(d, w)];
};

// Een ellipsoïde met eigen assen [u, v, w] en halve maten s: een brood, een zak, een rol.
function ellipsGedraaid(c, as, s, m, deel, k) {
  const [u, v, w] = as;
  return {
    f: (x, y, z) => {
      const d = [x - c[0], y - c[1], z - c[2]];
      return sdf.ellipsoide(punt(d, u), punt(d, v), punt(d, w), s[0], s[1], s[2]);
    },
    g: [c[0], c[1], c[2], Math.max(...s) + 0.5],
    m,
    deel,
    k,
  };
}

// Een band om een romp (een riem, een draagband over de borst): de schil op afstand los met halve
// dikte d, binnen een plak van halve breedte b rond het vlak door c met normaal n. Zo ligt een
// schuine band netjes op een bolle buik.
function band(vorm, c, n, b, o, m, deel) {
  const { rx, ry, cy } = vorm;
  const { los = 0.3, d = 0.6, z0, z1 } = o;
  const nn = eenheid(n);
  return {
    f: (x, y, z) => {
      const zz = klem(z, z0, z1);
      const a = rx(zz) + los + d;
      const bb = ry(zz) + los + d;
      const e = (Math.hypot(x / a, (y - cy(zz)) / bb) - 1) * Math.min(a, bb);
      const h = (x - c[0]) * nn[0] + (y - c[1]) * nn[1] + (z - c[2]) * nn[2];
      return Math.max(Math.abs(e) - d, Math.abs(h) - b) * 0.8;
    },
    g: grensbol(vorm, z0, z1, los + 2 * d),
    m,
    deel,
  };
}

// Een arm van de schouder S via de elleboog E naar de hand Hd. r = [schouder, elleboog, pols].
// mouw: hoe ver de mouw loopt: 2 = tot de pols, 1 = tot de elleboog, ertussen opgestroopt (met
// een rol), onder 1 een korte mouw. pof: een pofmouw op de schouder.
function arm(delen, S, E, Hd, o) {
  const { r = [4, 3.5, 2.6], mouw = 2, stof, huid, dArm, dHand, hand = [2.7, 2.9, 3.1], rol = true, pof = 0, manchet } = o;
  const pols = plus(Hd, maal(eenheid(min(E, Hd)), o.polsAf ?? 2.8));
  if (pof) delen.push(bol(plus(S, [0, 0, -0.5]), pof, stof, dArm, 1.5));
  if (mouw >= 1) delen.push(kegel(S, E, r[0], r[1], stof, dArm, 1.5));
  else {
    const m = langs(S, E, mouw);
    const rm = mix(r[0], r[1], mouw);
    delen.push(kegel(S, m, r[0], rm, stof, dArm, 1.5));
    delen.push(kegel(m, E, rm * 0.86, r[1] * 0.86, huid, dArm, 1));
    if (rol) delen.push(ring(m, eenheid(min(E, S)), rm * 0.96, 1.05, stof, dArm));
  }
  if (mouw >= 2) {
    delen.push(kegel(E, pols, r[1], r[2], stof, dArm, 1));
    if (manchet) delen.push(ring(pols, eenheid(min(pols, E)), r[2] * 0.95, 0.9, manchet, dArm));
  } else if (mouw > 1) {
    const m = langs(E, pols, mouw - 1);
    const rm = mix(r[1], r[2], mouw - 1);
    delen.push(kegel(E, m, r[1], rm, stof, dArm, 1));
    delen.push(kegel(m, pols, rm * 0.88, r[2] * 0.9, huid, dArm, 1));
    if (rol) delen.push(ring(m, eenheid(min(pols, E)), rm * 0.98, 1.05, stof, dArm));
  } else {
    delen.push(kegel(E, pols, r[1] * 0.86, r[2] * 0.9, huid, dArm, 1));
  }
  delen.push(ellips(Hd, hand, huid, dHand, 0.6));
  return pols;
}

// Een been van de heup naar de enkel, met een schoen (en desgewenst een laarsschacht tot laars).
// o: geometrie zoals voorheen (x, heup, r, broek, schoen, dBenen, laars, voet, voor), plus optioneel
// hg (de houding uit houdingDorpeling), i (0 = links, 1 = rechts) en bot (de bot()-afsluiter van de
// aanroeper) om het been een knie te geven, met beenPunten/voetBot uit dorpelingen.cjs — zie de
// uitleg bovenaan dat bestand. Zonder hg (bakker(), molenaar(), jager() en marskramer() geven nog
// geen stand door) tekent been() precies het oude ene stijve stuk, geen pixel anders.
function been(delen, s, o) {
  const { x = 4.4, heup = 30, r = [4, 3.3], broek, schoen, dBenen, laars = 0, voet = [3.3, 5.6, 2.9], voor = 0.8, hg = null, i = 0, bot = null } = o;
  if (hg) {
    const heupR = [s * x, 0, heup];
    const enkelR = [s * (x - 0.1), voor, 7];
    const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
    const rM = (r[0] + r[1]) / 2;
    delen.push(kegel(P.heup, P.knie, r[0], rM, broek, dBenen, 1));
    delen.push(kegel(P.knie, P.enkel, rM, r[1], broek, dBenen, 1));
  } else {
    delen.push(kegel([s * x, 0, heup], [s * (x - 0.1), voor, 7], r[0], r[1], broek, dBenen, 1));
  }
  if (bot) bot(null);
  delen.push(ellips([s * x, 2.4, voet[2] - 0.2], voet, schoen, dBenen, 1.2));
  if (laars) delen.push(kegel([s * x, 0.6, 3], [s * x, 0.6, laars], r[1] + 0.5, r[1] + 0.7, schoen, dBenen, 1));
  if (bot) bot(voetBot(hg, i, [s * x, 2.2, 0]));
}

// De plek op het gezicht (dx, dz ten opzichte van het midden van het hoofd): de voorkant van de
// ellipsoïde met stralen maat.
const gezichtY = ([rx, ry, rz], dx, dz) => ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2 - (dz / rz) ** 2));

// Wenkbrauwen net boven de ogen; hoek > 0 laat ze naar buiten zakken (moe, bezorgd).
function wenkbrauwen(delen, H, maat, oog, m, deel, o = {}) {
  const { dik = 1, hoek = 0, z = 2, breed = 2 } = o;
  for (const s of [-1, 1]) {
    const dz = oog[1] + z;
    const y = gezichtY(maat, s * oog[0], dz) - 0.4;
    delen.push(ellips(plus(H, [s * oog[0], y, dz]), [breed, 0.9 * dik, 0.75 * dik], m, deel, 0.4));
    if (hoek) delen.push(ellips(plus(H, [s * (oog[0] + breed * 0.7), gezichtY(maat, s * (oog[0] + breed * 0.7), dz - hoek) - 0.5, dz - hoek]), [1.1, 0.8 * dik, 0.7 * dik], m, deel, 0.5));
  }
}

// Haar als een kap om de schedel: iets groter dan het hoofd, met een haargrens voorop (voor: hoe
// ver naar voren op het voorhoofd, helling: hoe schuin de grens langs de slapen loopt). nek: waar
// het haar achter ophoudt (onder het midden van het hoofd).
function haarKap(H, maat, m, deel, o = {}) {
  const [rx, ry, rz] = maat;
  const { dik = 0.45, voor = 4.8, helling = 1.2, nek = 99, op = 0.5, k = 0.8 } = o;
  return {
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.5, dz - op, rx + dik, ry + dik, rz + dik);
      const lijn = (dy - voor - helling * (dz - 5)) / Math.hypot(1, helling);
      return Math.max(e, lijn, -nek - dz);
    },
    g: [H[0], H[1] - 0.5, H[2] + op, Math.max(rx, ry, rz) + dik + 1.5],
    m,
    deel,
    k,
  };
}

// Een romp met plooien die naar onderen toe dieper worden: een lange jas, een wijde kiel. Als romp
// in dorpelingen.cjs, maar de doorsnede golft met de hoek rond het lijf.
function plooiRomp(vorm, z0, z1, m, deel, o = {}) {
  const { rx, ry, cy } = vorm;
  const { plooi = 1, zPlooi = z1, k } = o;
  return {
    f: (x, y, z) => {
      const zz = klem(z, z0, z1);
      const a = rx(zz);
      const b = ry(zz);
      const ex = x / a;
      const ey = (y - cy(zz)) / b;
      const th = Math.atan2(ey, ex);
      const diep = klem((zPlooi - z) / (zPlooi - z0), 0, 1);
      const p = plooi * (0.05 * Math.sin(th * 9 + 1.3) + 0.03 * Math.sin(th * 5 - 0.4)) * diep;
      return Math.max((Math.hypot(ex, ey) - 1 - p) * Math.min(a, b) * 0.85, z0 - z, z - z1);
    },
    g: grensbol(vorm, z0, z1, 1),
    m,
    deel,
    k,
  };
}

// Een mand van riet: ovaal en open, de wand iets uitlopend, een dikke rand en een hengsel dat in
// het vlak x-z over de mand boogt. c = het midden van de bodem, maat = [rx, ry, hoogte].
// Geeft de delen en de hoogte van de rand; de inhoud doet wie de mand vult.
function mand(c, [rx, ry, h], m, deel, o = {}) {
  const { hengsel = true, mRand = m } = o;
  const top = c[2] + h;
  const ovaal = (x, y, z) => {
    const t = klem((z - c[2]) / h, 0, 1);
    const a = rx * (0.84 + 0.16 * t);
    const b = ry * (0.84 + 0.16 * t);
    return (Math.hypot((x - c[0]) / a, (y - c[1]) / b) - 1) * Math.min(a, b);
  };
  const delen = [
    { f: (x, y, z) => Math.max(Math.abs(ovaal(x, y, z)) - 0.65, c[2] - z, z - top) * 0.9, g: [c[0], c[1], c[2] + h / 2, Math.hypot(rx, ry, h / 2) + 1.5], m, deel },
    { f: (x, y, z) => Math.max(ovaal(x, y, z), c[2] - z, z - c[2] - 1.2) * 0.9, g: [c[0], c[1], c[2] + 0.6, Math.max(rx, ry) + 1.5], m, deel },
    { f: (x, y, z) => Math.max(Math.abs(ovaal(x, y, top)) - 0.95, Math.abs(z - top) - 0.85) * 0.9, g: [c[0], c[1], top, Math.max(rx, ry) + 2], m: mRand, deel },
  ];
  if (hengsel) {
    const hc = [c[0], c[1], top];
    const hengselR = rx * 0.94;
    delen.push({ f: (x, y, z) => Math.max(sdf.torus(x - hc[0], z - hc[2], y - hc[1], hengselR, 0.75), top - z), g: [hc[0], hc[1], top + hengselR / 2, hengselR + 1.5], m: mRand, deel });
  }
  return { delen, top };
}
// het vlechtwerk van een mand: om en om licht en donker, schuin over de wand
const vlecht = (c) => (x, y, z) => (Math.sin(Math.atan2(y - c[1], x - c[0]) * 15 + z * 0.9) * Math.sin(z * 2.4) > 0.15 ? 0.6 : -0.5);

// ---------------------------------------------------------------- de bakker

// De bakker: rond als een krentenbol, een wit schort vol meel, een slappe bakkersmuts, rode
// wangen en een krulsnor. Onder zijn linkerarm een vers brood, de rechterhand op zijn buik.
function bakker() {
  const M = { huid: 0, hemd: 1, schort: 2, broek: 3, schoen: 4, haar: 5, oog: 6, muts: 7, brood: 8, snor: 9, band: 10, mond: 11 };
  const D = { benen: 1, romp: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, muts: 9, brood: 10, snor: 11 };
  const H = [0, 3.8, 64];
  const kop = [7.3, 7, 7.3];
  const oog = [2.7, 0.7];
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.9,
    hi: 6.6,
    schaduwKracht: 0.7,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // meel op de onderarmen
      if (z < 47 && spikkel(x, y, z, 61, 0.74)) return { ramp: 'pleister', stap: klem(stap + 0.5, 3, 6) };
      // rode wangen
      for (const s of [-1, 1]) {
        const dx = x - s * 4.2;
        const dz = z - (H[2] - 2.2);
        if (y > H[1] + 3 && dx * dx + dz * dz * 2.2 < 2) return naarRamp('rood', stap, [1.9, 6.6], [6.2, 8.4]);
      }
      return 0;
    },
  };
  mat[M.hemd] = { ramp: 'zand', lo: 2.4, hi: 6.8, patroon: (x, y, z) => (Math.sin(x * 1.3 + z * 0.25) > 0.87 ? -0.7 : 0) };
  mat[M.schort] = {
    ramp: 'pleister',
    lo: 2.9,
    hi: 6.8,
    patroon: (x, y, z) => (Math.sin(x * 0.9 + 0.3) > 0.9 && z < 30 ? -0.7 : 0),
  };
  mat[M.broek] = {
    ramp: 'vacht',
    lo: 0.8,
    hi: 4,
    patroon: (x, y, z, nx, ny, nz, stap) => (spikkel(x, y, z, 71, 0.76) ? { ramp: 'pleister', stap: klem(stap - 0.2, 1, 4) } : 0),
  };
  mat[M.schoen] = { ramp: 'leer', lo: 0.6, hi: 4.4 };
  mat[M.haar] = { ramp: 'hout', lo: 0.6, hi: 3.8, patroon: (x, y, z) => (Math.sin(z * 2.2 + x) > 0.6 ? 0.6 : 0) };
  mat[M.oog] = OOG;
  mat[M.muts] = { ramp: 'pleister', lo: 3.2, hi: 7, patroon: (x, y, z) => (Math.sin(Math.atan2(y - H[1], x - H[0]) * 7 + z * 0.3) > 0.7 ? -0.7 : 0) };
  mat[M.band] = { ramp: 'pleister', lo: 2.4, hi: 6 };
  mat[M.snor] = { ramp: 'hout', lo: 0.5, hi: 3.6, patroon: (x, y, z) => (Math.sin(x * 2.6 + z) > 0.6 ? 0.6 : 0) };
  mat[M.mond] = mondVan(1.9);

  const delen = [];
  // --- benen en schoenen
  for (const s of [-1, 1]) been(delen, s, { x: 5.6, heup: 24, r: [4.8, 3.8], broek: M.broek, schoen: M.schoen, dBenen: D.benen, voet: [3.7, 6, 3] });

  // --- romp: een grote ronde buik, de schouders er smal bovenop: een ei op twee korte benen
  const vorm = {
    rx: profiel([[19, 12], [25, 14.8], [32, 16.2], [39, 15.8], [45, 14.2], [50, 12.6], [56, 10.8]]),
    ry: profiel([[19, 9.6], [25, 12.4], [32, 13.8], [39, 13], [45, 10.4], [50, 8.4], [56, 6.8]]),
    cy: profiel([[19, 1], [25, 3], [32, 4.4], [39, 4], [45, 2.6], [56, 0.8]]),
  };
  delen.push(romp(vorm, 19, 56, M.hemd, D.romp, 2));
  delen.push(ellips([0, 0.8, 53.6], [12.8, 7.6, 4.8], M.hemd, D.romp, 3));

  // --- schort: van de borst tot op de knieën, over de buik heen; eronder hangt het recht omlaag
  const breed = profiel([[16, 12.4], [28, 14.4], [40, 13.4], [44, 7.6], [51, 6.6]]);
  delen.push(schil(vorm, { los: 0.3, d: 0.7, breed, z0: 16, z1: 51.5, zHang: 27 }, M.schort, D.schort));
  // schortband om het middel, strik achter, bandjes om de nek
  delen.push(band(vorm, [0, 0, 44.5], [0, 0, 1], 1, { los: 0.4, d: 0.6, z0: 42, z1: 47 }, M.band, D.schort));
  const strik = [0, vorm.cy(44.5) - vorm.ry(44.5) - 1.2, 44.8];
  delen.push(bol(strik, 1.4, M.band, D.schort));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(strik, [s * 2.3, -0.2, 0.5]), [2, 0.9, 1.3], M.band, D.schort, 0.5));
    delen.push(kegel(plus(strik, [s * 0.6, -0.2, -1]), plus(strik, [s * 1.9, -0.7, -7]), 0.8, 0.7, M.band, D.schort));
  }
  for (const s of [-1, 1]) {
    const hoek = [s * 6, vorm.cy(51) + gezichtY([vorm.rx(51), vorm.ry(51), 99], 6, 0) + 1, 51];
    delen.push(capsule(hoek, [s * 5, -1, 58], 0.8, M.band, D.schort));
  }

  // --- het brood: een lang brood met sneden, onder de linkerarm geklemd, de hand eronder
  const bc = [-16.6, 3, 46.4];
  const bAs = assen([0.06, 1, -0.2]);
  mat[M.brood] = {
    ramp: 'hout',
    lo: 2.4,
    hi: 6.9,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const [u, v, w] = lokaal([x, y, z], bc, bAs);
      const f = (u + 0.6 * v) / 4.2 - Math.floor((u + 0.6 * v) / 4.2);
      if (w > 1.6 && Math.abs(u) < 9 && f < 0.22) return { ramp: 'zand', stap: 7 };
      return w < -1.5 ? -0.8 : 0;
    },
  };
  delen.push(ellipsGedraaid(bc, bAs, [12.5, 3.6, 3.4], M.brood, D.brood));
  arm(delen, [-12.6, 0.8, 53], [-19, -1.4, 43], [-17.2, 10.6, 41.2], { r: [4.6, 4, 3], mouw: 0.62, stof: M.hemd, huid: M.huid, dArm: D.armL, dHand: D.handL, hand: [2.9, 3.1, 3.2] });
  // --- rechts: de hand tevreden op de buik
  arm(delen, [12.6, 0.8, 53], [19.2, 6.4, 44.6], [13.2, 15.6, 37.6], { r: [4.6, 4, 3], mouw: 0.62, stof: M.hemd, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.9, 3.1, 3.2] });

  // --- hoofd: rond, een onderkin, een knopneus met meel, een krulsnor
  schedel(delen, H, M, D, { maat: kop, oog });
  delen.push(ellips(plus(H, [0, 3.2, -6.2]), [5.6, 4.6, 2.8], M.huid, D.hoofd, 1.5));
  delen.push(bol(plus(H, [0, 7.4, -1.7]), 2, M.huid, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.snor, D.hoofd, { z: 2.1 });
  for (const s of [-1, 1]) {
    delen.push(...bochtKegel(plus(H, [s * 0.5, 7.6, -3.6]), plus(H, [s * 4.2, 7.4, -5.2]), plus(H, [s * 5.9, 5.2, -2.6]), 1.6, 0.75, 4, M.snor, D.snor, 0.6));
  }
  delen.push(ellips(plus(H, [0, -2.2, -1]), [7.6, 6.3, 5.8], M.haar, D.hoofd, 1));
  // --- bakkersmuts: een band om het hoofd, daarop een bolle slappe bol die naar rechtsachter zakt
  delen.push({
    f: (x, y, z) => sdf.cilinder(x - H[0], y - H[1] + 0.3, z - H[2], 6.9, 4.1, 7) - 0.5,
    g: [H[0], H[1] - 0.3, H[2] + 5.5, 10],
    m: M.band,
    deel: D.muts,
  });
  delen.push(ellips(plus(H, [1.8, -1.6, 9.8]), [8.4, 8.1, 3.6], M.muts, D.muts, 1.6));

  return model(delen, mat, { midden: [-1, 2, 42], straal: 50 });
}

// ---------------------------------------------------------------- de molenaar

// De molenaar: lang en sterk, alles aan hem wit van het meel, zelfs zijn wenkbrauwen. Een volle zak
// meel op zijn rechterschouder, met het merk van de molen erop; het hoofd opzij van de zak.
function molenaar() {
  const M = { huid: 0, hemd: 1, vest: 2, broek: 3, laars: 4, haar: 5, oog: 6, muts: 7, zak: 8, touw: 9, mond: 10, brauw: 11 };
  const D = { benen: 1, romp: 2, vest: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, muts: 9, zak: 10 };
  const H = [-1.6, 4.4, 70];
  const kop = [6.8, 6.8, 7.8];
  const oog = [2.6, 0.8];
  const mat = [];
  // meel: fijne spikkels overal, en wat meer op alles wat naar boven kijkt (schouders, knieën)
  const meel = (x, y, z, nz, zaad, drempel) => spikkel(x, y, z, zaad, drempel - (nz > 0.45 ? 0.16 : 0));
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.8,
    hi: 6.5,
    schaduwKracht: 0.75,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // een witte veeg op de linkerwang
      const dx = x - (H[0] - 4.2);
      const dz = z - (H[2] - 1.6);
      return y > H[1] + 2.5 && dx * dx + dz * dz * 2.4 < 0.9 ? { ramp: 'pleister', stap: klem(stap, 3.5, 6) } : 0;
    },
  };
  mat[M.hemd] = { ramp: 'pleister', lo: 2.2, hi: 6.4, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.3) > 0.88 ? -0.7 : 0) };
  mat[M.vest] = { ramp: 'berk', lo: 0.9, hi: 3.9, patroon: (x, y, z, nx, ny, nz) => (meel(x, y, z, nz, 87, 0.74) ? 0.9 : 0) };
  mat[M.broek] = { ramp: 'vacht', lo: 1.8, hi: 5.6, patroon: (x, y, z, nx, ny, nz) => (meel(x, y, z, nz, 89, 0.72) ? 1 : 0) };
  mat[M.laars] = { ramp: 'leer', lo: 0.6, hi: 4.2, patroon: (x, y, z, nx, ny, nz) => (meel(x, y, z, nz, 91, 0.74) ? 1.2 : 0) };
  // donkerbruin haar onder de witte muts; de wenkbrauwen zijn helemaal wit van het meel
  mat[M.haar] = { ramp: 'schors', lo: 1, hi: 4.4, patroon: (x, y, z, nx, ny, nz) => (meel(x, y, z, nz, 95, 0.76) ? 1.2 : 0) };
  mat[M.brauw] = { ramp: 'pleister', lo: 3.4, hi: 6.6 };
  mat[M.oog] = OOG;
  mat[M.muts] = { ramp: 'pleister', lo: 2.2, hi: 6.4, patroon: (x, y, z) => (Math.sin(z * 2.4) > 0.75 ? -0.7 : 0) };
  // de zak: jute, een weefsel van kleine ruitjes; achterop het merk van de molen, een wiekenkruis
  // in een kring
  const merk = [10.6, 54];
  mat[M.zak] = {
    ramp: 'jas',
    lo: 1.8,
    hi: 6.6,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (y < -13) {
        const v = x - merk[0];
        const w = z - merk[1];
        const r = Math.hypot(v, w);
        const kruisje = Math.min(Math.abs(v - w), Math.abs(v + w)) / Math.SQRT2;
        if (Math.abs(r - 3.4) < 0.55 || (kruisje < 0.55 && r < 3.4)) return { ramp: 'hout', stap: 1 };
      }
      return ((Math.floor(x * 1.1) + Math.floor(z * 1.1)) % 2 === 0 ? 0.25 : -0.25) + (meel(x, y, z, nz, 93, 0.8) ? 1 : 0);
    },
  };
  mat[M.touw] = { ramp: 'leer', lo: 1, hi: 5 };
  mat[M.mond] = mondVan(1.8);

  const delen = [];
  // --- benen, laarzen tot de kuit
  for (const s of [-1, 1]) been(delen, s, { x: 4.6, heup: 31, r: [4.2, 3.4], broek: M.broek, schoen: M.laars, dBenen: D.benen, laars: 13, voet: [3.4, 5.8, 3] });

  // --- romp: breed in de schouders, smal in het middel; hemd met een vest erover
  const vorm = {
    rx: profiel([[29, 10], [36, 9.6], [44, 10.4], [52, 12], [58, 12.4], [61, 11]]),
    ry: profiel([[29, 7.4], [36, 6.9], [44, 7.2], [52, 7.6], [58, 7], [61, 6]]),
    cy: profiel([[29, 0.6], [44, 1], [52, 1.4], [61, 0.8]]),
  };
  const vestMat = (x, y, z) => (y > vorm.cy(z) + 2 && Math.abs(x) < 1.5 + (z - 44) * 0.22 && z > 48 ? M.hemd : M.vest);
  delen.push(romp(vorm, 29, 61, vestMat, D.romp, 2));
  delen.push(ellips([0, 0.8, 59], [12.6, 7.4, 4.6], M.hemd, D.romp, 3));
  // de broek tot aan het middel, een touw als riem
  delen.push(romp({ rx: () => 10.4, ry: () => 7.6, cy: () => 0.6 }, 27, 34, M.broek, D.benen, 1.5));
  delen.push(band(vorm, [0, 0, 34.5], [0, 0, 1], 0.9, { los: 0.6, d: 0.7, z0: 32, z1: 37 }, M.touw, D.vest));

  // --- de zak: over de rechterschouder gegooid, de bult achter; voorop de dichtgebonden punt
  const z0 = [11.2, 9, 50];
  const z1 = [12.2, -2.8, 66.6];
  const z2 = [10.2, -11.5, 56];
  delen.push(...bochtKegel(z0, z1, z2, 5.2, 7, 5, M.zak, D.zak, 2.4));
  delen.push(ellips([10.4, -10.8, 52.5], [7, 6.4, 7.6], M.zak, D.zak, 2));
  // de punt voorop, dichtgebonden
  delen.push(ring(plus(z0, [0, 0.8, -1]), eenheid([0.05, 0.4, -1]), 3.2, 0.9, M.touw, D.zak));
  delen.push(kegel(plus(z0, [0, 1, -2]), plus(z0, [-0.4, 2.4, -6.5]), 2.8, 1.6, M.zak, D.zak, 1));
  // --- armen: de rechter houdt de punt van de zak vast, de linker hangt ontspannen
  arm(delen, [11.4, 0.8, 58], [16.2, 4.8, 48.2], plus(z0, [-0.6, 2.6, -2.2]), { r: [4.3, 3.8, 2.9], mouw: 1.55, stof: M.hemd, huid: M.huid, dArm: D.armR, dHand: D.handR });
  arm(delen, [-11.4, 0.8, 58], [-13.4, 0.4, 46.6], [-12.4, 2.8, 36.4], { r: [4.3, 3.8, 2.9], mouw: 1.55, stof: M.hemd, huid: M.huid, dArm: D.armL, dHand: D.handL });

  // --- hoofd: lang gezicht, lange neus, witte wenkbrauwen, een brede grijns
  schedel(delen, H, M, D, { maat: kop, oog });
  delen.push(ellips(plus(H, [0, 6.9, -1.2]), [1.7, 2.4, 2.7], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.2, -2.7]), 1.7, M.huid, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.brauw, D.hoofd, { dik: 1.3, z: 2.1, breed: 2.2 });
  glimlach(delen, H, kop, M.mond, D.hoofd, 1.9, -4.6);
  delen.push(ellips(plus(H, [0, -2, -0.6]), [7.2, 6.2, 6.6], M.haar, D.hoofd, 1));
  // --- een slappe muts, de punt zakt naar achteren
  delen.push(ellips(plus(H, [0, -0.3, 5.4]), [7.6, 7.6, 3.8], M.muts, D.muts, 1));
  delen.push(...bochtKegel(plus(H, [0, -0.6, 7]), plus(H, [-0.8, -3, 11]), plus(H, [-2, -8.6, 8.2]), 6, 2.4, 4, M.muts, D.muts, 1.5));

  return model(delen, mat, { midden: [0, 0, 42], straal: 52 });
}

// ---------------------------------------------------------------- de kruidenvrouw

// De kruidenvrouw: slank, lang zwart haar met één witte lok, een groene omslagdoek met franje en een
// takje in het haar. Een mand vol kruiden aan haar linkerarm; in haar rechterhand een bosje dat ze
// je al voorhoudt. Ze woont aan de rand van het bos en weet meer dan ze zegt.
function kruidenvrouw() {
  const M = { huid: 0, rok: 1, lijfje: 2, bloes: 3, doek: 4, haar: 5, oog: 6, mond: 7, mand: 8, blad: 9, lavendel: 10, bloem: 11, steel: 12, speld: 13, brauw: 14, blad2: 15 };
  const D = { rok: 1, lijf: 2, doek: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, mand: 10, kruid: 11, takje: 12 };
  const H = [0, 4.2, 66.5];
  const kop = [6.6, 6.5, 7.3];
  const oog = [2.6, 0.8];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 2, hi: 6.5, schaduwKracht: 0.7 };
  mat[M.rok] = { ramp: 'schors', lo: 0.8, hi: 4.4, patroon: (x, y, z) => (z < 3.4 ? -0.8 : 0) };
  mat[M.lijfje] = { ramp: 'aarde', lo: 0.8, hi: 4.2 };
  mat[M.bloes] = { ramp: 'perkament', lo: 1.8, hi: 5.6 };
  const onderrand = (x, y) => {
    const achter = klem((2 - y) / 8, 0, 1);
    return mix(44.5, 41, achter) - achter * 7.5 * Math.max(0, 1 - Math.abs(x) / 7.5);
  };
  mat[M.doek] = {
    ramp: 'blad',
    lo: 1.1,
    hi: 5.2,
    patroon: (x, y, z) => {
      // franje langs de onderrand, en een donkere zoom erboven
      const r = z - onderrand(x, y);
      if (r < 1.6) return Math.sin(Math.atan2(y - 1, x) * 30) > 0 ? -0.5 : 0.5;
      if (r < 2.5) return -1;
      return Math.sin(x * 1.5 + z * 0.4) > 0.82 ? -0.6 : 0;
    },
  };
  // zwart haar met één witte lok aan de linkerslaap
  mat[M.haar] = {
    ramp: 'vacht',
    lo: 0.3,
    hi: 3,
    patroon: (x, y, z) => {
      const dx = x - H[0];
      if (dx < -3 && dx > -5 && y > H[1] - 1.5 && z > H[2] - 9) return { ramp: 'baard', stap: 4.5 };
      return Math.sin(x * 2.2 + z * 0.5) > 0.6 ? 0.6 : 0;
    },
  };
  mat[M.brauw] = { ramp: 'vacht', lo: 0.3, hi: 1.8 };
  mat[M.oog] = OOG;
  mat[M.mond] = mondVan(2);
  mat[M.mand] = { ramp: 'riet', lo: 1.4, hi: 5.8 };
  mat[M.blad] = { ramp: 'blad', lo: 2.2, hi: 6.6 };
  mat[M.blad2] = { ramp: 'gras', lo: 1.6, hi: 5.6 };
  mat[M.lavendel] = { ramp: 'magie', lo: 2.4, hi: 5.8, detail: true };
  mat[M.bloem] = { ramp: 'goud', lo: 3.4, hi: 6.8, detail: true };
  mat[M.steel] = { ramp: 'gras', lo: 1.8, hi: 4.6 };
  mat[M.speld] = { ramp: 'ijzer', lo: 2.6, hi: 6.6, glans: 1.2, detail: true };

  const delen = [];
  // --- rok tot op de grond, lijfje, bloes aan de hals
  delen.push(klokrok(36.5, [13.4, 9.2], [11.8, 7.5], () => 0.8, M.rok, D.rok, 1));
  const lijf = {
    rx: profiel([[33, 9.1], [40, 8.6], [46, 9.5], [51, 9.9], [56, 8.7]]),
    ry: profiel([[33, 7.4], [40, 6.6], [46, 7.1], [51, 6.8], [56, 5.8]]),
    cy: profiel([[33, 0.8], [46, 1.2], [56, 0.8]]),
  };
  const lijfMat = (x, y, z) => (y > 2.5 && Math.abs(x) < 5.6 && z > 50.5 + 0.12 * x * x ? M.bloes : M.lijfje);
  const bovenlijf = [romp(lijf, 33, 56, lijfMat, D.lijf, 2), ellips([0, 0.5, 54.4], [10.2, 6.6, 4], lijfMat, D.lijf, 2.5)];
  delen.push(...bovenlijf);
  delen.push(kegel([0, 1, 55], plus(H, [0, -1.2, -5.5]), 3, 2.7, M.huid, D.lijf, 1));

  // --- de omslagdoek: een schil om schouders en rug, achter een punt tot op de heupen, voorop een
  // zilveren speld; de onderrand gekarteld als franje
  const lijfAfstand = bouwSdf([...bovenlijf, bol([-10, 0.6, 52.5], 4.2, 0, 0), bol([10, 0.6, 52.5], 4.2, 0, 0)]);
  delen.push({
    f: (x, y, z) => {
      const rand = onderrand(x, y) - 1.3 * Math.max(0, Math.sin(Math.atan2(y - 1, x) * 30));
      return Math.max(Math.abs(lijfAfstand(x, y, z) - 1.3) - 0.8, rand - z, z - (57.6 - 0.36 * y)) * 0.85;
    },
    g: [0, 1, 48, 22],
    m: M.doek,
    deel: D.doek,
  });
  const speld = [0.4, lijf.cy(49) + lijf.ry(49) + 2.6, 49.5];
  delen.push(bol(speld, 1.2, M.speld, D.doek));

  // --- links de mand aan de onderarm; rechts een bosje kruiden, voorgehouden
  const mandC = [-13.4, 4.8, 31.8];
  mat[M.mand].patroon = vlecht(mandC);
  const { delen: mandDelen, top: mandTop } = mand(mandC, [6.2, 4.8, 8], M.mand, D.mand);
  delen.push(...mandDelen);
  // de inhoud: bosjes blad, lavendel, een paar gele bloemen
  delen.push(ellips([-16, 4.4, mandTop + 1], [3, 3, 2.8], M.blad, D.kruid, 1.2));
  delen.push(ellips([-11.4, 5.6, mandTop + 0.8], [3.2, 2.8, 2.6], M.blad2, D.kruid, 1.2));
  delen.push(ellips([-13.2, 3.4, mandTop + 1.6], [2.4, 2.2, 3], M.blad, D.kruid, 1.2));
  for (const [dx, dy, h] of [[-1.4, 1.6, 7.4], [0.2, 2.4, 6.2], [1.6, 1.2, 7]]) {
    const voet = plus(mandC, [dx, dy, 7]);
    const kop2 = plus(voet, [dx * 0.3, 0.6, h]);
    delen.push(capsule(voet, kop2, 0.45, M.steel, D.kruid));
    delen.push(ellips(plus(kop2, [0, 0, 0.6]), [0.9, 0.9, 1.9], M.lavendel, D.kruid, 0.4));
  }
  for (const p of [[-17.4, 6.8, mandTop + 2.4], [-9.8, 3.6, mandTop + 2.2]]) delen.push(bol(p, 1.15, M.bloem, D.kruid));
  arm(delen, [-9.6, 0.6, 53], [-13.6, -0.8, 43.6], [-12, 10.4, 43.4], { r: [3.8, 3.3, 2.5], mouw: 2, stof: M.bloes, huid: M.huid, dArm: D.armL, dHand: D.handL, hand: [2.5, 2.7, 2.9] });
  const rh = [7.4, 12.2, 45.4];
  arm(delen, [9.6, 0.6, 53], [12.8, 3.6, 44], rh, { r: [3.8, 3.3, 2.5], mouw: 2, stof: M.bloes, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.5, 2.7, 2.9] });
  for (const [dx, dy, h] of [[-0.8, 0.4, 6.4], [0.6, 0.2, 7.2], [0.2, 1, 5.6]]) {
    const top = plus(rh, [dx, dy, h]);
    delen.push(capsule(plus(rh, [0, 0, 1]), top, 0.45, M.steel, D.takje));
    delen.push(ellipsGedraaid(plus(top, [dx * 0.6, 0.3, -0.6]), assen([dx, 0.3, 1]), [1.8, 1, 0.55], M.blad, D.takje, 0.4));
  }

  // --- hoofd: een smal gezicht, een wetende glimlach; lang zwart haar met de witte lok
  schedel(delen, H, M, D, { maat: kop, oog, oor: 0.85 });
  delen.push(bol(plus(H, [0, 6.7, -1.4]), 1.4, M.huid, D.hoofd, 1));
  glimlach(delen, H, kop, M.mond, D.hoofd, 1.2, -4);
  wenkbrauwen(delen, H, kop, oog, M.brauw, D.hoofd, { z: 1.9, breed: 1.9, dik: 0.9 });
  delen.push(haarKap(H, kop, M.haar, D.haar, { voor: 4.6, helling: 1.1, dik: 0.55 }));
  // het haar valt los over de rug, over de doek heen
  delen.push(ellips(plus(H, [0, -4.4, -4]), [6.6, 3.8, 6], M.haar, D.haar, 2));
  delen.push(ellips([0, -7.8, 52], [6.4, 2.8, 6], M.haar, D.haar, 2.5));
  delen.push(ellips([0, -9.5, 45], [5.6, 2.2, 5], M.haar, D.haar, 2.5));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 5.8, -1.6, -5.4]), [1.8, 2.6, 4.6], M.haar, D.haar, 1.2));
  // een takje boven het rechteroor: drie blaadjes en twee bloemetjes
  const tak = plus(H, [5.6, 0.6, 4.4]);
  delen.push(capsule(plus(tak, [-1.6, -1.6, -1.2]), plus(tak, [1.2, 1.4, 1.8]), 0.45, M.steel, D.takje));
  for (const v of [[1, 0.2, 0.6], [0.4, -1, 0.8], [0.6, 0.9, 1]]) delen.push(ellipsGedraaid(plus(tak, maal(v, 1.6)), assen(v), [1.7, 0.95, 0.5], M.blad, D.takje, 0.3));
  delen.push(bol(plus(tak, [1.4, 1.8, 2.2]), 1.05, M.lavendel, D.takje));
  delen.push(bol(plus(tak, [0.2, -0.6, 2.4]), 1.05, M.bloem, D.takje));

  return model(delen, mat, { midden: [-2, 2, 40], straal: 48 });
}

// ---------------------------------------------------------------- de jager

// De jager: pezig en verweerd, een grijze kap met een geschulpt schoudermanteltje, een leren
// wambuis, de boog in zijn linkerhand en de pijlkoker op zijn rug. Een korte baard en een litteken
// over de wang: hij kent het bos beter dan de mensen.
function jager() {
  const M = { huid: 0, wambuis: 1, hemd: 2, broek: 3, laars: 4, kap: 5, oog: 6, baard: 7, hout: 8, pees: 9, koker: 10, veer: 11, riem: 12, gesp: 13, mond: 14, veer2: 15, kapBinnen: 16 };
  const D = { benen: 1, romp: 2, kap: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, baard: 9, boog: 10, koker: 11, riem: 12 };
  const H = [0, 4.4, 68.5];
  const kop = [6.8, 6.8, 7.6];
  const oog = [2.6, 0.8];
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 1.4,
    hi: 5.9,
    schaduwKracht: 0.75,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // een litteken schuin over de linkerwang
      const dx = x - H[0] + 3.6;
      const dz = z - H[2] + 1.2 + 0.7 * dx;
      return y > H[1] + 3.2 && Math.abs(dx) < 1.7 && Math.abs(dz) < 0.42 ? { ramp: 'huid', stap: stap + 1.3 } : 0;
    },
  };
  mat[M.wambuis] = {
    ramp: 'leer',
    lo: 1.2,
    hi: 5.6,
    patroon: (x, y, z) => {
      // veters voorop en stiksels rondom
      if (y > 3 && Math.abs(x) < 1.8 && z > 40 && z < 55) {
        const f = (z - 40) / 2.6 - Math.floor((z - 40) / 2.6);
        return Math.abs(Math.abs(x) - f * 1.8) < 0.5 ? { ramp: 'perkament', stap: 3 } : -0.8;
      }
      return Math.sin(z * 1.9) > 0.9 ? -0.5 : 0;
    },
  };
  mat[M.hemd] = { ramp: 'perkament', lo: 1, hi: 4.6, patroon: (x, y, z) => (Math.sin(z * 1.4 + x) > 0.85 ? -0.6 : 0) };
  mat[M.broek] = { ramp: 'mos', lo: 0.5, hi: 3.8 };
  mat[M.laars] = { ramp: 'schors', lo: 0.6, hi: 4.2 };
  mat[M.kap] = { ramp: 'vacht', lo: 0.7, hi: 5,  patroon: (x, y, z) => (Math.sin(Math.atan2(y, x) * 11 + z * 0.3) > 0.85 ? -0.6 : 0) };
  mat[M.kapBinnen] = { ramp: 'vacht', lo: 0.1, hi: 1.4 };
  mat[M.oog] = OOG;
  mat[M.baard] = { ramp: 'schors', lo: 0.6, hi: 3.4, patroon: (x, y, z) => (Math.sin(x * 2.4 + z * 1.1) > 0.5 ? 0.6 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 1.4, hi: 5.8, patroon: (x, y, z) => (Math.sin(z * 1.3) > 0.9 ? -0.6 : 0) };
  mat[M.pees] = { ramp: 'perkament', lo: 2.4, hi: 4.6, detail: true, rand: 0 };
  mat[M.koker] = { ramp: 'leer', lo: 0.5, hi: 3.6 };
  mat[M.veer] = { ramp: 'baard', lo: 2.4, hi: 6.4, detail: true };
  mat[M.veer2] = { ramp: 'rood', lo: 2.4, hi: 6.2, detail: true };
  mat[M.riem] = { ramp: 'schors', lo: 0.4, hi: 3 };
  mat[M.gesp] = { ramp: 'ijzer', lo: 2, hi: 6, glans: 1.2, detail: true };
  mat[M.mond] = mondVan(1.4);

  const delen = [];
  // --- benen, laarzen tot onder de knie met een omgeslagen rand
  for (const s of [-1, 1]) {
    been(delen, s, { x: 4.3, heup: 30.5, r: [3.9, 3.2], broek: M.broek, schoen: M.laars, dBenen: D.benen, laars: 15.5, voet: [3.3, 5.9, 3] });
    delen.push(ring([s * 4.3, 0.6, 15.6], [0, 0, 1], 4.1, 1.2, M.laars, D.benen));
  }
  // --- wambuis: tot op de dij uitlopend; riem met gesp en een mes op de rechterheup
  const vorm = {
    rx: profiel([[25, 10.6], [31, 9.8], [37, 9.3], [44, 9.7], [51, 10.5], [56, 10.3], [58.5, 9]]),
    ry: profiel([[25, 8.4], [31, 7.4], [37, 6.8], [44, 7], [51, 7.3], [58.5, 6]]),
    cy: profiel([[25, 0.6], [44, 0.8], [58.5, 0.6]]),
  };
  const bovenlijf = [romp(vorm, 25, 58.5, M.wambuis, D.romp, 2), ellips([0, 0.6, 56.4], [11.2, 7, 4.4], M.wambuis, D.romp, 3)];
  delen.push(...bovenlijf);
  delen.push(band(vorm, [0, 0, 36.6], [0, 0, 1], 1.1, { los: 0.4, d: 0.6, z0: 34, z1: 39 }, M.riem, D.riem));
  delen.push(blokGedraaid([0, vorm.cy(36.6) + vorm.ry(36.6) + 1.2, 36.6], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.7, 0.5, 1.5], 0.3, M.gesp, D.riem));
  delen.push(blokGedraaid([9.6, 3.6, 31.5], assen([0.1, 0.15, -1]), [3.6, 1.4, 0.8], 0.5, M.koker, D.riem));
  delen.push(kegel([9.7, 3.8, 35.2], [9.8, 4, 38.6], 0.8, 0.9, M.hout, D.riem));
  // de draagband van de koker, schuin over de borst van de rechterschouder naar de linkerheup
  delen.push(band(vorm, [0, 0, 47.5], [0.785, 0, -0.62], 1.2, { los: 0.4, d: 0.55, z0: 34, z1: 60 }, M.riem, D.riem));

  // --- pijlkoker op de rug, de pijlen steken boven de rechterschouder uit
  const kA = [-3.6, -8.4, 37];
  const kB = [5.2, -9.4, 62.5];
  delen.push(kegel(kA, kB, 2.8, 3.3, M.koker, D.koker));
  delen.push(ring(kB, eenheid(min(kB, kA)), 3.1, 0.7, M.riem, D.koker));
  const kU = eenheid(min(kB, kA));
  [[-1.2, 0.6, 7.6, M.veer], [0.9, -0.5, 9, M.veer2], [0.2, 1.1, 6.4, M.veer], [1.3, 0.8, 8.2, M.veer]].forEach(([dx, dy, l, mv]) => {
    const voet = plus(kB, [dx, dy, -2]);
    const top = plus(voet, maal(kU, l + 2));
    delen.push(capsule(voet, top, 0.42, M.hout, D.koker));
    delen.push(ellipsGedraaid(plus(top, maal(kU, -1.6)), assen(kU), [2.1, 0.45, 1.1], mv, D.koker, 0.3));
  });

  // --- schoudermanteltje met een geschulpte rand, en de kap
  const lijfAfstand = bouwSdf([...bovenlijf, bol([-10.2, 0.6, 54.6], 4.2, 0, 0), bol([10.2, 0.6, 54.6], 4.2, 0, 0)]);
  delen.push({
    f: (x, y, z) => {
      const zoom = 47 + 1.5 * Math.sin(Math.atan2(y - 0.6, x) * 9);
      return Math.max(Math.abs(lijfAfstand(x, y, z) - 1.4) - 0.85, zoom - z, z - 61) * 0.85;
    },
    g: [0, 0.6, 53, 19],
    m: M.kap,
    deel: D.kap,
  });
  // de kap: een dikke bol om het hoofd met een gat voor het gezicht, een kraag om de hals en een
  // punt die achter afhangt
  const gat = (x, y, z) => {
    const dx = x - H[0];
    const dy = y - H[1];
    const dz = z - H[2];
    return Math.max((Math.hypot(dx / 5.3, (dz + 0.9) / 6.8) - 1) * 5.3, 1.4 - dy);
  };
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const bolKap = sdf.ellipsoide(dx, dy + 0.8, dz - 0.6, kop[0] + 1.1, kop[1] + 1.1, kop[2] + 1.2);
      const kraag = sdf.rondeKegel(x, y, z, H[0], H[1] - 1.8, H[2] - 5.5, 0, 0.6, 59.5, 5.4, 7.6);
      return Math.max(Math.min(bolKap, kraag), -gat(x, y, z));
    },
    g: [H[0], H[1] - 1, H[2] - 3, 16],
    m: (x, y, z) => (gat(x, y, z) < 0.9 && y > H[1] + 1 ? M.kapBinnen : M.kap),
    deel: D.kap,
  });
  delen.push(kegel(plus(H, [0, -6.6, 3.4]), plus(H, [0.4, -11.4, -5]), 3.2, 1, M.kap, D.kap, 1.2));

  // --- boog: links naast hem, de rug naar voren, de pees naar hem toe
  const bOnder = [-13.4, 6.6, 8.5];
  const greep = [-13.2, 11.2, 44];
  const bBoven = [-13, 6.6, 80.5];
  delen.push(...bochtKegel(bOnder, [-13.3, 11.4, 25], greep, 0.7, 1.35, 5, M.hout, D.boog, 0.3));
  delen.push(...bochtKegel(greep, [-13.1, 11.4, 63], bBoven, 1.35, 0.7, 5, M.hout, D.boog, 0.3));
  delen.push(capsule(bOnder, bBoven, 0.42, M.pees, D.boog));
  arm(delen, [-10.2, 0.6, 55.8], [-14, -0.6, 47.2], plus(greep, [0, -0.6, 0]), { r: [3.9, 3.4, 2.6], mouw: 2, stof: M.hemd, huid: M.huid, dArm: D.armL, dHand: D.handL });
  // rechts: de duim achter de riem
  arm(delen, [10.2, 0.6, 55.8], [12.6, -1.4, 45.4], [10.8, 2.6, 37.4], { r: [3.9, 3.4, 2.6], mouw: 2, stof: M.hemd, huid: M.huid, dArm: D.armR, dHand: D.handR });

  // --- hoofd: verweerd, de ogen wat toegeknepen, een korte baard langs de kaak
  const oy = schedel(delen, H, M, D, { maat: kop, oog });
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * oog[0], oy + 0.3, oog[1] + 0.75]), [1.4, 0.8, 0.55], M.huid, D.hoofd));
  delen.push(ellips(plus(H, [0, 6.9, -1.2]), [1.6, 2.3, 2.6], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8, -2.6]), 1.6, M.huid, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.baard, D.hoofd, { z: 1.8, dik: 1.15, breed: 2.1 });
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy - 0.6, dz + 0.9, kop[0] + 0.6, kop[1] + 0.6, kop[2] + 0.3);
      return Math.max(e, dz + 2.6 - 0.15 * Math.abs(dx), -dy - 1);
    },
    g: [H[0], H[1] + 1, H[2] - 4, 10],
    m: M.baard,
    deel: D.baard,
    k: 0.6,
  });
  for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 0.7, 7.3, -3.3]), plus(H, [s * 3.6, 6.2, -4.6]), 1.3, 0.9, M.baard, D.baard, 0.6));
  delen.push(capsule(plus(H, [-1.1, 6.9, -5]), plus(H, [1.1, 6.9, -5]), 0.45, M.mond, D.hoofd));

  return model(delen, mat, { midden: [-2, 1, 44], straal: 50 });
}

// ---------------------------------------------------------------- de marskramer

const MARSKRAMER_SNELHEID = 1.4;
const MARSKRAMER_FPS = 10;

// De marskramer: klein en krom onder een draagrek vol potten, pannen, een opgerolde deken en linten.
// Een lappenjas in alle kleuren, gestreepte kousen, een rode hoed met een gele veer, een wandelstok.
// Hij heeft alles bij zich wat een dorp niet zelf maakt, en voor jou maakt hij een prijsje.
// stand: { houding, fase } laat hem lopen of ademen (zie houdingDorpeling in dorpelingen.cjs, en
// boer() daar voor dezelfde soort figuur met gereedschap in de hand). Zonder stand (hg null) staat
// hij zoals voorheen: het been krijgt nu wel één gedeeld kniepunt in plaats van de twee net iets
// verschillende punten van vroeger (zie beenPunten hieronder), maar dat is geen zichtbaar verschil.
function marskramer(stand = null) {
  const M = { huid: 0, jas: 1, broek: 2, kous: 3, schoen: 4, hoed: 5, veer: 6, oog: 7, baard: 8, sjaal: 9, hout: 10, doek: 11, touw: 12, deken: 13, pot: 14, koper: 15, mond: 16, oorbel: 17, lint1: 18, lint2: 19 };
  const D = { benen: 1, romp: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, hoed: 8, rek: 9, stok: 10, sjaal: 11, pot: 12, pan: 13, deken: 14, baard: 15 };
  const H = [0, 9.8, 60.5];
  const kop = [6.9, 6.8, 7.2];
  const oog = [2.7, 0.8];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.6, hi: 6.2, schaduwKracht: 0.75 };
  // de jas: groen, met lappen in alle kleuren erop genaaid, elk met een donkere steek eromheen
  const lappen = [
    [[-7, 7.5, 36], 4.4, 'rood'],
    [[8, 5, 44], 3.8, 'zand'],
    [[-10.5, -1, 45], 3.6, 'magie'],
    [[5.5, -4, 30], 4, 'herfst'],
  ];
  mat[M.jas] = {
    ramp: 'mos',
    lo: 0.9,
    hi: 4.8,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      for (const [c, r, ramp] of lappen) {
        const d = Math.hypot(x - c[0], y - c[1], z - c[2]);
        if (d < r) return d > r - 0.7 ? -1.3 : naarRamp(ramp, stap, [0.9, 4.8], [1.4, 5.4]);
      }
      return Math.sin(z * 1.5 + x * 0.8) > 0.9 ? -0.6 : 0;
    },
  };
  mat[M.broek] = { ramp: 'pet', lo: 1, hi: 4.6 };
  mat[M.kous] = {
    ramp: 'rood',
    lo: 2,
    hi: 6,
    patroon: (x, y, z, nx, ny, nz, stap) => (Math.floor(z / 2.2) % 2 === 0 ? { ramp: 'pleister', stap: klem(stap + 0.4, 2, 6) } : 0),
  };
  mat[M.schoen] = { ramp: 'leer', lo: 0.6, hi: 4 };
  mat[M.hoed] = { ramp: 'rood', lo: 1.2, hi: 5.4, patroon: (x, y, z) => (Math.sin(Math.atan2(y - H[1], x - H[0]) * 8) > 0.85 ? -0.6 : 0) };
  mat[M.veer] = { ramp: 'goud', lo: 2.6, hi: 6.8, detail: true };
  mat[M.oog] = OOG;
  mat[M.baard] = { ramp: 'vacht', lo: 0.3, hi: 2.6 };
  mat[M.sjaal] = { ramp: 'stro', lo: 2, hi: 6.2 };
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 5.6, patroon: (x, y, z) => (Math.sin(z * 1.1 + x) > 0.88 ? -0.6 : 0) };
  mat[M.doek] = { ramp: 'perkament', lo: 1.4, hi: 5.4, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.5) > 0.85 ? -0.7 : 0) };
  mat[M.touw] = { ramp: 'leer', lo: 0.8, hi: 4.4 };
  mat[M.deken] = {
    ramp: 'rood',
    lo: 1.6,
    hi: 5.6,
    patroon: (x, y, z, nx, ny, nz, stap) => (Math.sin(x * 1.15) > 0.35 ? { ramp: 'goud', stap: klem(stap + 0.4, 1.5, 6.4) } : 0),
  };
  mat[M.pot] = { ramp: 'ijzer', lo: 0.8, hi: 4.8, glans: 1.4 };
  mat[M.koper] = { ramp: 'herfst', lo: 1.6, hi: 6.4, glans: 1.8, glansMacht: 14 };
  mat[M.mond] = mondVan(1.6);
  mat[M.oorbel] = { ramp: 'goud', lo: 2.6, hi: 6.6, glans: 1.2, detail: true };
  mat[M.lint1] = { ramp: 'magie', lo: 2.4, hi: 5.6 };
  mat[M.lint2] = { ramp: 'blad', lo: 2.4, hi: 6 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: MARSKRAMER_SNELHEID, fps: MARSKRAMER_FPS, beenLengte: 22 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 27.5],
    nek: [0, 4, 55],
    schouders: [[-10.2, 5.4, 50.5], [10.2, 5.4, 50.5]],
  });

  // --- benen: korte broek tot de knie, daaronder gestreepte kousen en schoenen met een krul; de
  // knie (beenPunten, dorpelingen.cjs) buigt tussen heup en enkel, net als bij boer()
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const heupR = [s * 4.5, 0, 27.5];
    const enkelR = [s * 4.6, 0.8, 5];
    const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
    delen.push(kegel(P.heup, P.knie, 4.4, 3.5, M.broek, D.benen, 1));
    delen.push(kegel(P.knie, P.enkel, 3.1, 2.7, M.kous, D.benen, 1));
    bot(null);
    delen.push(ellips([s * 4.6, 2.8, 2.6], [3.2, 5.8, 2.7], M.schoen, D.benen, 1.2));
    delen.push(bol([s * 4.6, 8, 4], 1.3, M.schoen, D.benen, 1.2));
    bot(voetBot(hg, i, [s * 4.6, 2.2, 0]));
  }
  // --- romp: voorovergebogen onder het gewicht van het rek
  const vorm = {
    rx: profiel([[20, 11.2], [26, 10.4], [34, 9.8], [42, 10.2], [48, 10.6], [53, 9.4]]),
    ry: profiel([[20, 8.6], [26, 7.8], [34, 7], [42, 7.2], [48, 7.2], [53, 6.2]]),
    cy: profiel([[20, 0.4], [30, 1.4], [40, 3], [48, 4.8], [53, 5.8]]),
  };
  delen.push(plooiRomp(vorm, 20, 53, M.jas, D.romp, { plooi: 0.8, zPlooi: 30, k: 2 }));
  delen.push(ellips([0, 5.2, 51], [11.2, 6.8, 4.4], M.jas, D.romp, 3));
  delen.push(kegel([0, 6, 52], plus(H, [0, -1.6, -5]), 3.2, 2.9, M.huid, D.romp, 1));
  // gele sjaal om de hals, de einden voorop
  delen.push({
    f: (x, y, z) => sdf.torus(x, (y - 7.4) * 1.1, z - 53.6, 5, 1.9) * 0.9,
    g: [0, 7.4, 53.6, 8],
    m: M.sjaal,
    deel: D.sjaal,
  });
  delen.push(kegel([2.2, 11.6, 52.6], [3.6, 13.4, 44.5], 1.6, 1, M.sjaal, D.sjaal, 0.8));

  // --- het draagrek: twee stokken met dwarslatten, en daarop de hele handel
  for (const s of [-1, 1]) {
    delen.push(kegel([s * 7.6, -6.2, 18], [s * 7.6, -8.4, 84], 1.2, 1.1, M.hout, D.rek));
    delen.push(bol([s * 7.6, -8.5, 85.2], 1.7, M.hout, D.rek, 0.8));
  }
  for (const zz of [24, 58, 80]) delen.push(capsule([-7.6, -6.4 - (zz - 18) * 0.032, zz], [7.6, -6.4 - (zz - 18) * 0.032, zz], 0.95, M.hout, D.rek));
  // de grote baal: een pak in zeildoek, met touwen eromheen
  const baalC = [0, -13.4, 48];
  const baalH = [9.4, 6.3, 17.5];
  const baal = (x, y, z) => sdf.doos(x - baalC[0], y - baalC[1], z - baalC[2], baalH[0], baalH[1], baalH[2], 4.2);
  delen.push({ f: baal, g: [baalC[0], baalC[1], baalC[2], Math.hypot(...baalH) + 1], m: M.doek, deel: D.rek });
  for (const zz of [38, 57]) delen.push({ f: (x, y, z) => Math.max(Math.abs(baal(x, y, z) + 0.2) - 0.55, Math.abs(z - zz) - 1), g: [baalC[0], baalC[1], zz, 14], m: M.touw, deel: D.rek });
  // opgerolde deken bovenop, met strepen
  delen.push(capsule([-10.2, -12.5, 69.5], [10.2, -12.5, 69.5], 4.7, M.deken, D.deken));
  // een omgekeerde pot bovenop de rol
  delen.push(kegel([0, -12.5, 73.4], [0, -12.5, 79.6], 5.1, 4.2, M.pot, D.pot));
  delen.push(ring([0, -12.5, 73.8], [0, 0, 1], 5, 0.7, M.pot, D.pot));
  delen.push(bol([0, -12.5, 80.6], 1.4, M.pot, D.pot, 0.8));
  // koperen ketel links, koekenpan rechts, twee pollepels tussen het touw
  const ketel = [-12.6, -10.6, 51];
  delen.push(ellips(ketel, [3.9, 3.9, 3.4], M.koper, D.pot, 1));
  delen.push(kegel(plus(ketel, [0.4, 3.4, 0.4]), plus(ketel, [1, 6, 3.4]), 1.2, 0.7, M.koper, D.pot, 0.8));
  delen.push(ellips(plus(ketel, [0, 0, 3.4]), [2.6, 2.6, 1.2], M.koper, D.pot, 0.6));
  delen.push({ f: (x, y, z) => Math.max(sdf.torus(x - ketel[0], z - ketel[2] - 1, y - ketel[1], 4.2, 0.55), ketel[2] + 1 - z), g: [ketel[0], ketel[1], ketel[2] + 3, 6], m: M.pot, deel: D.pot });
  delen.push(capsule([-8.2, -8.4, 60], [-12.6, -10.6, 56.4], 0.5, M.touw, D.pot));
  const pan = [12.4, -12.4, 58];
  delen.push(schijf(pan, [1, 0, 0], 5, 0.85, M.pot, D.pan));
  delen.push(ring(pan, [1, 0, 0], 4.8, 0.7, M.pot, D.pan));
  delen.push(capsule(plus(pan, [0, 0, 4.6]), plus(pan, [0, -0.4, 13]), 0.8, M.pot, D.pan));
  for (const [dx, dy] of [[4.6, -9.6], [6.2, -10.8]]) {
    delen.push(capsule([dx, dy, 72], [dx + 1.4, dy - 0.6, 85], 0.55, M.hout, D.rek));
    delen.push(ellips([dx + 1.5, dy - 0.7, 86], [1.3, 0.6, 1.9], M.hout, D.rek, 0.4));
  }
  // linten aan de knoppen, voor de kinderen
  delen.push(kegel([-7.6, -8.6, 84.2], [-9.4, -9.8, 76], 0.9, 0.6, M.lint1, D.rek));
  delen.push(kegel([7.6, -8.6, 84.2], [9.2, -10.2, 77], 0.9, 0.6, M.lint2, D.rek));
  // draagbanden over de schouders
  for (const s of [-1, 1]) delen.push(...bochtKegel([s * 6.4, -6.6, 58], [s * 6.6, 1.6, 56.5], [s * 6.2, 9.2, 44], 1.1, 1, 4, M.touw, D.romp, 0.6));
  bot(Bn.Bromp);

  // --- armen: rechts de wandelstok, links een duim achter de draagband. De stok staat vast op de
  // grond (net als de hooivork van boer() in dorpelingen.cjs) en zwaait dus niet mee met de arm.
  const stokOnder = [15.6, 16.4, 0.5];
  const stokBoven = [13.8, 12.6, 71];
  delen.push(kegel(stokOnder, stokBoven, 1.1, 1.2, M.hout, D.stok));
  delen.push(bol(plus(stokBoven, [0, -0.2, 0.6]), 1.9, M.hout, D.stok, 1));
  bot(null);
  arm(delen, [10.2, 5.4, 50.5], [15.2, 7, 41.6], [14.4, 14.2, 47], { r: [4, 3.5, 2.7], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-10.2, 5.4, 50.5], [-13.8, 6.4, 41.4], [-6.6, 12.6, 45.4], { r: [4, 3.5, 2.7], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: een knolneus, een sik, een gouden ring in het oor en een grijns
  schedel(delen, H, M, D, { maat: kop, oog });
  delen.push(bol(plus(H, [0, 7.4, -1.6]), 2.4, M.huid, D.hoofd, 1.2));
  wenkbrauwen(delen, H, kop, oog, M.baard, D.hoofd, { z: 2, dik: 1.2, breed: 2.1 });
  glimlach(delen, H, kop, M.mond, D.hoofd, 2.1, -4.6);
  for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 0.7, 7.2, -3.4]), plus(H, [s * 4.4, 5.8, -3.2]), 1.3, 0.7, M.baard, D.baard, 0.6));
  delen.push(kegel(plus(H, [0, 5.8, -6]), plus(H, [0, 7.8, -10.6]), 1.8, 0.6, M.baard, D.baard, 0.8));
  delen.push(bol(plus(H, [6.8, 0.6, -3.4]), 0.85, M.oorbel, D.hoofd));
  delen.push(ellips(plus(H, [0, -2.2, -1]), [7.2, 6.2, 5.8], M.baard, D.hoofd, 1));
  // --- hoed: een slappe rode hoed met een brede rand en een gele veer
  const hoed = plus(H, [0, -2.4, 6.4]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - hoed[0];
      const dy = y - hoed[1];
      const dz = z - hoed[2] + 0.022 * (dx * dx + dy * dy) - 0.24 * dy;
      return sdf.ellipsoide(dx, dy, dz, 11.4, 11, 1) * 0.72;
    },
    g: [hoed[0], hoed[1], hoed[2], 13],
    m: M.hoed,
    deel: D.hoed,
  });
  delen.push(ellips(plus(hoed, [0.4, -1, 3.2]), [6.3, 6.1, 4], M.hoed, D.hoed, 1.2));
  delen.push(...bochtKegel(plus(hoed, [4.4, -3.2, 3.2]), plus(hoed, [7.6, -8, 8.4]), plus(hoed, [6.4, -14.2, 11]), 1.3, 0.35, 5, M.veer, D.hoed, 0.5));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, -2, 46], straal: 54 });
}

// ---------------------------------------------------------------- de koster

// De koster: lang, mager en een beetje krom, een zwarte jas tot op de enkels met een witte bef. In
// zijn linkerhand de sleutelbos van de kerk, in zijn rechter een lantaarn die al brandt. Hij sluit
// elke avond alles af, en telt onderweg de graven.
function koster() {
  const M = { huid: 0, jas: 1, bef: 2, haar: 3, oog: 4, schoen: 5, knoop: 6, ijzer: 7, sleutel: 8, glas: 9, mond: 10, broek: 11, brauw: 12 };
  const D = { jas: 1, benen: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, haar: 8, bef: 9, lantaarn: 10, sleutels: 11 };
  const H = [0, 5.4, 73];
  const kop = [6.3, 6.6, 7.9];
  const oog = [2.5, 0.9];
  const L = [11.4, 9.4, 29.6]; // het midden van de lantaarn
  const mat = [];
  mat[M.huid] = {
    ramp: 'huid',
    lo: 2.2,
    hi: 6.6,
    schaduwKracht: 0.7,
    patroon: (x, y, z) => {
      const dx = x - H[0];
      const dz = z - H[2];
      if (y < H[1] + 2.5) return 0;
      // holle wangen en diepe oogkassen
      if (Math.abs(Math.abs(dx) - 3.8) < 1.4 && dz < -1.4 && dz > -4.6) return -0.9;
      if (Math.abs(Math.abs(dx) - 2.5) < 1.8 && dz > 0.6 && dz < 2.4) return -0.7;
      return 0;
    },
  };
  mat[M.jas] = { ramp: 'vacht', lo: 0.25, hi: 2.9, patroon: (x, y, z) => (Math.sin(x * 1.1 + z * 0.2) > 0.88 ? -0.5 : 0) };
  mat[M.bef] = { ramp: 'pleister', lo: 3.2, hi: 6.6, detail: true };
  mat[M.haar] = { ramp: 'baard', lo: 1.4, hi: 4.8, patroon: (x, y, z) => (Math.sin(z * 1.9 + x * 1.1) > 0.5 ? 0.6 : 0) };
  mat[M.brauw] = { ramp: 'baard', lo: 1.6, hi: 4.4 };
  mat[M.oog] = OOG;
  mat[M.schoen] = { ramp: 'leer', lo: 0.3, hi: 2.8 };
  mat[M.knoop] = { ramp: 'ijzer', lo: 1.4, hi: 4.6, detail: true, glans: 1 };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 0.9, hi: 5, glans: 1.4 };
  mat[M.sleutel] = { ramp: 'goud', lo: 1.4, hi: 5.6, glans: 1.6, detail: true };
  mat[M.glas] = { ramp: 'vuur', gloei: (x, y, z, kijk) => klem(3.4 + 2.8 * kijk, 3, 6.6) };
  mat[M.mond] = mondVan(2.2);
  mat[M.broek] = { ramp: 'vacht', lo: 0.3, hi: 2.4 };

  const delen = [];
  // --- schoenen en een glimp van de broek onder de jas
  for (const s of [-1, 1]) {
    delen.push(kegel([s * 4, 0, 22], [s * 3.9, 0.6, 5], 3.4, 2.9, M.broek, D.benen, 1));
    delen.push(ellips([s * 4, 2.6, 2.4], [3.1, 6, 2.6], M.schoen, D.benen, 1.2));
  }
  // --- de lange jas: smal in het middel, met plooien tot op de enkels; een rij doffe knopen
  const vorm = {
    rx: profiel([[4, 11.8], [14, 10.8], [26, 9.8], [36, 8.8], [44, 9], [52, 9.8], [58, 10.2], [62, 9]]),
    ry: profiel([[4, 10.4], [14, 9.4], [26, 8.2], [36, 6.8], [44, 6.8], [52, 7], [58, 6.6], [62, 5.6]]),
    cy: profiel([[4, 0.4], [30, 0.8], [50, 1.6], [62, 1.8]]),
  };
  delen.push(plooiRomp(vorm, 4, 62, M.jas, D.jas, { plooi: 1.1, zPlooi: 42 }));
  delen.push(ellips([0, 1, 60.4], [10.6, 6.8, 4.2], M.jas, D.jas, 3));
  for (let z = 33; z < 58; z += 4.4) delen.push(bol([0, vorm.cy(z) + vorm.ry(z) + 0.2, z], 0.8, M.knoop, D.jas));
  // hals, staande kraag en de witte bef
  delen.push(kegel([0, 1.8, 60], plus(H, [0, -1.6, -5.5]), 2.9, 2.6, M.huid, D.jas, 1));
  delen.push(kegel([0, 1.6, 59.5], [0, 2.2, 64.8], 5.2, 4.3, M.jas, D.jas, 1));
  for (const s of [-1, 1]) delen.push(ellips([s * 1.2, vorm.cy(58.5) + vorm.ry(58.5) + 0.6, 58.6], [1.1, 0.55, 2.7], M.bef, D.bef, 0.3));

  // --- rechts de lantaarn: een ijzeren huisje met glas dat licht geeft
  delen.push(kegel(plus(L, [0, 0, 4.2]), plus(L, [0, 0, 6.6]), 3.9, 1.1, M.ijzer, D.lantaarn));
  delen.push({ f: (x, y, z) => sdf.doos(x - L[0], y - L[1], z - L[2], 2.75, 2.75, 3.9, 0.4), g: [L[0], L[1], L[2], 6], m: M.glas, deel: D.lantaarn });
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) delen.push(capsule(plus(L, [sx * 2.8, sy * 2.8, -4.2]), plus(L, [sx * 2.8, sy * 2.8, 4.2]), 0.55, M.ijzer, D.lantaarn));
  delen.push({ f: (x, y, z) => sdf.doos(x - L[0], y - L[1], z - L[2] + 4.7, 3.4, 3.4, 0.7, 0.3), g: [L[0], L[1], L[2] - 4.7, 5], m: M.ijzer, deel: D.lantaarn });
  delen.push(capsule(plus(L, [0, 0, 6.4]), plus(L, [0, 0, 8.2]), 0.5, M.ijzer, D.lantaarn));
  delen.push(ring(plus(L, [0, 0, 9]), [0, 1, 0], 1.5, 0.45, M.ijzer, D.lantaarn));
  arm(delen, [9.8, 1.2, 59.5], [12.4, 1.8, 47.5], plus(L, [0, -0.2, 9.4]), { r: [3.8, 3.4, 2.6], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.5, 2.7, 3] });

  // --- links de sleutelbos: een grote ring met zware sleutels, opgehouden alsof hij ze telt
  const handL = [-8.8, 12, 48.4];
  const ringC = [-8.8, 12.4, 44.2];
  const ringN = eenheid([0.35, 1, 0]);
  delen.push(ring(ringC, ringN, 3.5, 0.6, M.ijzer, D.sleutels));
  [-52, -26, 0, 26, 52].forEach((graden, i) => {
    const a = (graden * Math.PI) / 180;
    const p = [ringC[0] + Math.sin(a) * 3.5, ringC[1] + 0.4, ringC[2] - Math.cos(a) * 3.5];
    const l = 5.6 + (i % 2) * 1.6;
    delen.push(ring(plus(p, [0, 0, -0.8]), ringN, 1.05, 0.42, M.sleutel, D.sleutels));
    delen.push(capsule(plus(p, [0, 0, -1.6]), plus(p, [Math.sin(a) * 1.2, 0, -1.6 - l]), 0.5, M.sleutel, D.sleutels));
    const b = plus(p, [Math.sin(a) * 1.2, 0, -1.6 - l]);
    delen.push(blokGedraaid(plus(b, [0.9, 0, 0.5]), [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [0.9, 0.35, 0.5], 0.15, M.sleutel, D.sleutels));
  });
  arm(delen, [-9.8, 1.2, 59.5], [-13, 3.4, 48.4], handL, { r: [3.8, 3.4, 2.6], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armL, dHand: D.handL, hand: [2.5, 2.7, 3] });

  // --- hoofd: lang en ingevallen, een haakneus, dun grijs haar om een kale kruin
  schedel(delen, H, M, D, { maat: kop, oog, oor: 0.95 });
  delen.push(kegel(plus(H, [0, 5.8, 1.4]), plus(H, [0, 8.4, -3]), 1.2, 1.5, M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.2, -3.4]), 1.3, M.huid, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.brauw, D.hoofd, { z: 2, dik: 0.9, breed: 1.9 });
  delen.push(capsule(plus(H, [-1.5, gezichtY(kop, 1.5, -4.6) - 0.2, -4.6]), plus(H, [1.5, gezichtY(kop, 1.5, -4.6) - 0.2, -4.6]), 0.45, M.mond, D.hoofd));
  delen.push(ellips(plus(H, [0, -2.6, -2.6]), [7, 6.2, 5.4], M.haar, D.haar, 1));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 6, -1.8, -5.2]), [1.8, 3, 4.6], M.haar, D.haar, 1.2));

  return model(delen, mat, { midden: [0, 3, 42], straal: 52, lichten: [{ pos: L, r: 38, sterk: 1.5, warm: 1, eigen: true, val: 1.4 }] });
}

// ---------------------------------------------------------------- de wachter

// De wachter: oud en slaperig, een buik onder zijn wapenrok, een ijzeren pothelm die scheef over
// zijn ogen zakt en een hangsnor. Hij leunt op zijn speer. Er komt hier nooit iemand langs, en als
// er iemand komt, is hij de laatste die het merkt.
function wachter() {
  const M = { huid: 0, wambuis: 1, rok: 2, broek: 3, laars: 4, helm: 5, oog: 6, snor: 7, hout: 8, punt: 9, kwast: 10, riem: 11, gesp: 12, neus: 13, mond: 14, haar: 15 };
  const D = { benen: 1, romp: 2, rok: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, helm: 9, speer: 10, snor: 11, riem: 12 };
  const H = [0, 4.8, 66.5];
  const kop = [7.1, 7, 7.5];
  const oog = [2.7, 0.2];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.8, hi: 6.4, schaduwKracht: 0.88 };
  mat[M.neus] = { ramp: 'rood', lo: 4.4, hi: 8.2 };
  // gewatteerd wambuis: horizontale stiksels
  mat[M.wambuis] = { ramp: 'perkament', lo: 1.2, hi: 5.2, patroon: (x, y, z) => (Math.sin(z * 2.1) > 0.82 ? -0.9 : 0) };
  // de wapenrok van het dorp: baksteenrood met een gele toren
  mat[M.rok] = {
    ramp: 'dak',
    lo: 1.2,
    hi: 5.2,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (y > 6) {
        const dz = z - 41;
        const toren = Math.abs(x) < 3.1 && dz > -6 && dz < 4;
        const kantelen = Math.abs(x) < 4.4 && dz >= 4 && dz < 6 && Math.abs(Math.abs(x) - 2.2) > 0.75;
        if (toren || kantelen) return naarRamp('goud', stap, [1.2, 5.2], [2.6, 6.6]);
      }
      return Math.sin(x * 1.3 + z * 0.3) > 0.88 ? -0.6 : 0;
    },
  };
  mat[M.broek] = { ramp: 'schors', lo: 0.6, hi: 3.8 };
  mat[M.laars] = { ramp: 'leer', lo: 0.5, hi: 4 };
  mat[M.helm] = {
    ramp: 'ijzer',
    lo: 1.2,
    hi: 5.8,
    glans: 1.4,
    patroon: (x, y, z, nx, ny, nz, stap) => (spikkel(x, y, z, 131, 0.87, 0.34) ? naarRamp('herfst', stap, [1.2, 5.8], [0.4, 2.6]) : 0),
  };
  mat[M.oog] = OOG;
  mat[M.snor] = { ramp: 'baard', lo: 1.6, hi: 5.6, patroon: (x, y, z) => (Math.sin(x * 2.2 + z * 0.6) > 0.55 ? 0.6 : 0) };
  mat[M.haar] = { ramp: 'baard', lo: 1.2, hi: 4.6 };
  mat[M.hout] = { ramp: 'hout', lo: 1.2, hi: 5.4, patroon: (x, y, z) => (Math.sin(z * 0.9) > 0.9 ? -0.6 : 0) };
  mat[M.punt] = { ramp: 'ijzer', lo: 1.8, hi: 6.6, glans: 2 };
  mat[M.kwast] = { ramp: 'rood', lo: 1.6, hi: 5.8 };
  mat[M.riem] = { ramp: 'leer', lo: 0.4, hi: 3 };
  mat[M.gesp] = { ramp: 'goud', lo: 2, hi: 6, glans: 1.2, detail: true };
  mat[M.mond] = mondVan(1.8);

  const delen = [];
  // --- benen wat uit elkaar, laarzen tot de kuit
  for (const s of [-1, 1]) been(delen, s, { x: 5.2, heup: 26, r: [4.5, 3.6], broek: M.broek, schoen: M.laars, dBenen: D.benen, laars: 12, voet: [3.5, 6, 3] });

  // --- gewatteerd wambuis met een buik, daaroverheen de wapenrok voor en achter
  const vorm = {
    rx: profiel([[17, 11.4], [24, 12.8], [32, 13.8], [39, 13.4], [46, 12.2], [52, 11.8], [57, 10.4]]),
    ry: profiel([[17, 8.6], [24, 10.6], [32, 11.8], [39, 11], [46, 8.8], [52, 7.6], [57, 6.4]]),
    cy: profiel([[17, 0.8], [24, 2.2], [32, 3.4], [39, 3], [46, 1.8], [57, 0.6]]),
  };
  delen.push(romp(vorm, 17, 57, M.wambuis, D.romp, 2));
  delen.push(ellips([0, 0.6, 54.6], [12.6, 7.4, 4.6], M.wambuis, D.romp, 3));
  delen.push(schil(vorm, { los: 0.5, d: 0.7, breed: () => 7.8, z0: 18, z1: 55, zHang: 30, voor: false }, M.rok, D.rok));
  delen.push(band(vorm, [0, 0, 29.5], [0, 0, 1], 1.3, { los: 1.9, d: 0.7, z0: 27, z1: 33 }, M.riem, D.riem));
  delen.push(blokGedraaid([0, vorm.cy(29.5) + vorm.ry(29.5) + 3.4, 29.5], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [2, 0.5, 1.7], 0.3, M.gesp, D.riem));

  // --- de speer, waar hij op leunt; een rode kwast onder de punt
  const sOnder = [13.8, 9.6, 0.5];
  const sBoven = [12.2, 5.2, 90];
  const sU = eenheid(min(sBoven, sOnder));
  delen.push(kegel(sOnder, sBoven, 1.05, 1.1, M.hout, D.speer));
  delen.push(kegel(plus(sBoven, maal(sU, -1)), plus(sBoven, maal(sU, 2.6)), 1.35, 1.1, M.punt, D.speer));
  delen.push(ellipsGedraaid(plus(sBoven, maal(sU, 7.5)), assen(sU), [6, 1.9, 0.55], M.punt, D.speer, 0.6));
  delen.push(ellips(plus(sBoven, maal(sU, -2.4)), [1.7, 1.7, 2.2], M.kwast, D.speer, 0.6));
  for (const [dx, dy] of [[-1, 0.4], [1, -0.3], [0.2, 1]]) delen.push(kegel(plus(sBoven, maal(sU, -3)), plus(sBoven, [dx * 1.8, dy * 1.8, -8.4]), 0.8, 0.5, M.kwast, D.speer));
  arm(delen, [12.2, 0.8, 53.8], [16.8, 3.6, 44.2], [12.95, 7.3, 51.5], { r: [4.4, 3.8, 2.9], mouw: 2, stof: M.wambuis, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.8, 3, 3.2] });
  // --- de linkerhand rust op de buik
  arm(delen, [-12.2, 0.8, 53.8], [-16.4, 7.4, 44.8], [-8.4, 15.4, 38.4], { r: [4.4, 3.8, 2.9], mouw: 2, stof: M.wambuis, huid: M.huid, dArm: D.armL, dHand: D.handL, hand: [2.8, 3, 3.2] });

  // --- hoofd: zware oogleden, een rode knolneus, een grijze hangsnor
  const oy = schedel(delen, H, M, D, { maat: kop, oog });
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * oog[0], oy + 0.3, oog[1] + 0.95]), [1.45, 0.8, 0.6], M.huid, D.hoofd));
  delen.push(bol(plus(H, [0, 7.4, -1.4]), 2.2, M.neus, D.hoofd, 1));
  wenkbrauwen(delen, H, kop, oog, M.snor, D.hoofd, { z: 2.2, dik: 1.3, breed: 2, hoek: 1.2 });
  delen.push(ellips(plus(H, [0, 6.6, -4.2]), [4, 2, 1.6], M.snor, D.snor, 0.8));
  for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 2.4, 6.4, -4.2]), plus(H, [s * 4.6, 5, -8.8]), 1.8, 1.1, M.snor, D.snor, 0.8));
  delen.push(ellips(plus(H, [0, 3, -6.4]), [5, 4.2, 2.6], M.huid, D.hoofd, 1.5));
  delen.push(ellips(plus(H, [0, -2.4, -2.2]), [7.4, 6.2, 5.2], M.haar, D.hoofd, 1));
  // --- pothelm: een koepel met een brede rand die naar voren afloopt, een tikje scheef
  const helmC = plus(H, [-0.5, -0.9, 5.4]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - helmC[0];
      const dy = y - helmC[1];
      const dz = z - helmC[2] + 0.1 * dx - 0.04 * dy;
      return Math.max(sdf.ellipsoide(dx, dy, dz, 7.9, 7.8, 6.2), -dz - 1.2);
    },
    g: [helmC[0], helmC[1], helmC[2] + 2, 10.5],
    m: M.helm,
    deel: D.helm,
  });
  delen.push({
    f: (x, y, z) => {
      const dx = x - helmC[0];
      const dy = y - helmC[1];
      const dz = z - helmC[2] + 0.1 * dx - 0.05 * dy + 0.012 * (dx * dx + dy * dy) + 1;
      return sdf.ellipsoide(dx, dy, dz, 10.9, 10.6, 0.95) * 0.72;
    },
    g: [helmC[0], helmC[1], helmC[2] - 2.6, 13],
    m: M.helm,
    deel: D.helm,
  });

  return model(delen, mat, { midden: [2, 2, 46], straal: 54 });
}

// ---------------------------------------------------------------- gewone dorpelingen

// Vijf huidtinten, als bereik in de huid-ramp: van licht tot donker.
const HUID = [[2.3, 6.9], [2, 6.6], [1.7, 6.2], [1.3, 5.6], [0.9, 4.9]];
// Haarkleuren: bruin, donkerbruin, zwart, blond, grijs, wit, en twee soorten rood.
const HAAR = {
  bruin: { ramp: 'hout', lo: 0.7, hi: 3.9 },
  donker: { ramp: 'schors', lo: 0.7, hi: 3.6 },
  zwart: { ramp: 'vacht', lo: 0.3, hi: 2.5 },
  blond: { ramp: 'stro', lo: 2, hi: 6 },
  grijs: { ramp: 'baard', lo: 1.4, hi: 5 },
  wit: { ramp: 'baard', lo: 3.2, hi: 6.8 },
  rood: { ramp: 'herfst', lo: 1.2, hi: 4.6 },
  ros: { ramp: 'rood', lo: 2.4, hi: 6 },
};
// Gedempte kleuren voor kleren, met per ramp het bereik dat niet gaat schreeuwen. Van gewaad komt
// alleen het donkere begin in aanmerking: de tovenaar blijft de enige echt blauwe figuur.
const STOF = {
  jas: [0.9, 5.4],
  pet: [0.9, 4.8],
  mos: [0.6, 4.4],
  leer: [0.9, 4.8],
  perkament: [1.4, 5.4],
  rood: [1, 4.4],
  zand: [1.6, 6],
  aarde: [1, 4.8],
  schors: [0.7, 4],
  vacht: [0.9, 4.4],
  riet: [1.2, 5],
  dak: [1, 4.4],
  stro: [1.6, 5.6],
  gewaad: [0.3, 2.2],
};
const STOF_NAMEN = Object.keys(STOF);
const LICHTE_STOF = ['pleister', 'perkament', 'berk'];
const SCHORT_STOF = ['pleister', 'perkament', 'berk', 'zand'];
const stofMat = (naam, extra) => ({ ramp: naam, lo: STOF[naam] ? STOF[naam][0] : 1.6, hi: STOF[naam] ? STOF[naam][1] : 6, rand: naam === 'gewaad' ? 0.5 : 1.4, ...extra });

// Een gewone dorpeling, man of vrouw: bouw, huidskleur, haar, kleren, hoofddeksel en soms iets in
// de hand. Hetzelfde zaad geeft altijd dezelfde dorpeling, zodat het dorp bij elk spel hetzelfde
// volk heeft. Met opties dwing je een keuze af: dorpeling(3, { geslacht: 'vrouw', draagt: 'emmer' }).
// Het model krijgt hoofd, portret en kenmerken mee, net als de vaklieden in BEROEPEN.
// stand: { houding, fase } laat hem lopen of ademen (zie houdingDorpeling in dorpelingen.cjs);
// zonder stand staat hij stil — precies het oude, stilstaande model, geen pixel anders.
function dorpeling(zaad = 1, opties = {}, stand = null) {
  const r = (k) => rnd(zaad * 7919 + 13, k * 131 + 7);
  const uit = (k, lijst) => lijst[Math.min(lijst.length - 1, Math.floor(r(k) * lijst.length))];
  const K = {
    geslacht: r(1) < 0.5 ? 'man' : 'vrouw',
    bouw: uit(2, ['gewoon', 'gewoon', 'gewoon', 'dun', 'rond', 'lang', 'kort']),
    huid: Math.min(HUID.length - 1, Math.floor(r(3) * HUID.length)),
    oud: r(4) < 0.22,
    draagt: uit(9, ['niets', 'niets', 'mand', 'emmer', 'takkenbos', 'zak']),
  };
  K.haar = K.oud ? (r(5) < 0.65 ? 'grijs' : 'wit') : uit(5, ['bruin', 'bruin', 'donker', 'donker', 'zwart', 'blond', 'rood', 'ros', 'grijs']);
  K.kapsel = K.geslacht === 'man' ? uit(6, ['kort', 'kort', 'kuif', 'lang', 'kaal']) : uit(6, ['knot', 'knot', 'vlecht', 'staart', 'los']);
  K.baard = K.geslacht === 'man' ? uit(7, ['geen', 'geen', 'snor', 'baard', 'stoppels']) : 'geen';
  K.hoofddeksel = K.geslacht === 'man' ? uit(8, ['geen', 'geen', 'pet', 'pet', 'strohoed', 'kap']) : uit(8, ['geen', 'hoofddoek', 'hoofddoek', 'strohoed', 'kap']);
  K.boven = uit(10, [...STOF_NAMEN, 'rood', 'mos', 'dak', 'zand', 'pet', 'riet']);
  K.onder = uit(11, ['aarde', 'schors', 'vacht', 'jas', 'pet', 'mos', 'leer']);
  K.hemd = uit(12, LICHTE_STOF);
  K.schort = r(13) < (K.geslacht === 'vrouw' ? 0.55 : 0.25) ? uit(14, SCHORT_STOF) : null;
  K.hoedKleur = uit(15, ['pet', 'jas', 'mos', 'rood', 'leer', 'vacht', 'schors', 'perkament']);
  K.dracht = K.geslacht === 'man' ? uit(16, ['hemd', 'vest', 'vest', 'kiel']) : 'jurk';
  Object.assign(K, opties);
  if (K.kapsel === 'kaal' && K.haar === 'blond') K.haar = 'grijs';

  // --- maten: lengte, breedte en buik volgen de bouw
  const lang = { gewoon: 1, dun: 1.01, rond: 0.98, lang: 1.07, kort: 0.9 }[K.bouw] * (K.geslacht === 'vrouw' ? 0.955 : 1) * (0.985 + 0.03 * r(20));
  const breed = { gewoon: 1, dun: 0.87, rond: 1.17, lang: 0.93, kort: 1.05 }[K.bouw] * (K.geslacht === 'vrouw' ? 0.95 : 1);
  const buik = (K.bouw === 'rond' ? 3.4 : K.bouw === 'dun' ? 0 : 1.2 * r(21)) * (K.geslacht === 'vrouw' ? 0.7 : 1);
  const zHeup = 30 * lang;
  const zSch = 55.5 * lang;
  const zT1 = zSch + 3.4;
  const zT0 = K.geslacht === 'vrouw' ? 33 * lang : zHeup - 6.5;
  const kopR = 6.85 * (0.97 + 0.06 * r(22));
  const kop = [kopR, kopR - 0.05, kopR + 0.75];
  const H = [0, 3.6 + (K.oud ? 1.6 : 0), zSch + 9.6 + kopR * 0.06];
  const schX = 10.3 * breed;
  const oog = [kopR * 0.385, 0.8];

  const M = { huid: 0, boven: 1, onder: 2, hemd: 3, schoen: 4, haar: 5, oog: 6, hoed: 7, schort: 8, riem: 9, mond: 10, ding1: 11, ding2: 12, ding3: 13, band: 14 };
  const D = { benen: 1, romp: 3, rok: 4, schort: 5, armL: 6, armR: 7, handL: 8, handR: 9, hoofd: 10, haar: 11, hoed: 12, ding: 13, riem: 14 };
  const mat = [];
  const huid = HUID[K.huid];
  mat[M.huid] = {
    ramp: 'huid',
    lo: huid[0],
    hi: huid[1],
    schaduwKracht: 0.75,
    patroon:
      K.baard === 'stoppels'
        ? (x, y, z) => {
            const dz = z - H[2];
            return y > H[1] + 1 && dz < -2.2 && dz > -7.5 ? -0.9 : 0;
          }
        : undefined,
  };
  mat[M.boven] = stofMat(K.boven, { patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.3) > 0.88 ? -0.6 : 0) });
  mat[M.onder] = stofMat(K.onder);
  mat[M.hemd] = stofMat(K.hemd);
  mat[M.schoen] = stofMat(uit(17, ['leer', 'schors', 'aarde']), { lo: 0.5, hi: 3.8 });
  mat[M.haar] = { ...HAAR[K.haar], patroon: (x, y, z) => (Math.sin(x * 2.1 + z * 0.8 + y * 0.6) > 0.6 ? 0.6 : 0) };
  mat[M.oog] = OOG;
  mat[M.hoed] = stofMat(K.hoofddeksel === 'strohoed' ? 'stro' : K.hoedKleur);
  if (K.hoofddeksel === 'strohoed') {
    mat[M.hoed].patroon = (x, y, z) => {
      const rr = Math.hypot(x - H[0], y - H[1]);
      const sv = z > H[2] + 6 ? Math.sin(z * 2.4) : Math.sin(rr * 2.2);
      return sv > 0.55 ? 0.6 : sv < -0.7 ? -0.6 : 0;
    };
  }
  mat[M.schort] = stofMat(K.schort || 'pleister', { patroon: (x, y, z) => (Math.sin(x * 1.1 + 0.4) > 0.86 ? -0.6 : 0) });
  mat[M.riem] = { ramp: 'leer', lo: 0.4, hi: 3 };
  mat[M.mond] = mondVan(huid[0]);
  mat[M.band] = { ramp: 'ijzer', lo: 1, hi: 4.6, glans: 1 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const beenX = 4.4 * breed;
  const hg = houdingDorpeling(stand, { snelheid: DORPELING_SNELHEID, fps: 10, beenLengte: zHeup - 3 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.6, zHeup],
    nek: [0, 0, zSch + 3],
    schouders: [[-schX, 0.6, zSch], [schX, 0.6, zSch]],
  });

  // --- benen en schoenen; bij een vrouw verdwijnt het been zelf onder de rok (zie hieronder), maar
  // de voet beweegt gewoon mee. Vroeger stond het been van een rok-drager helemaal stil (het hele
  // stijve been zwaaide anders in één grote boog om de heup en kwam zo een eind buiten de zoom);
  // met een knie blijft de dij, het stuk vlak bij de rok, grotendeels overeind, dus dat is nu geen
  // punt meer — onder een rok zie je de pas dan ook vooral aan de schoen bij de zoom en aan hoe de
  // rok zelf meezwaait (zie de uitleg bovenaan dorpelingen.cjs).
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    been(delen, s, {
      x: beenX,
      heup: zHeup,
      r: [4 * breed, 3.3 * breed],
      broek: M.onder,
      schoen: M.schoen,
      dBenen: D.benen,
      voet: [3.3 * breed, 5.7, 2.9],
      hg, i, bot,
    });
  }

  // --- romp
  const t = (f) => mix(zT0, zT1, f);
  const vorm = {
    rx: profiel([[zT0, 10.2 * breed + buik * 0.5], [t(0.3), 9.9 * breed + buik], [t(0.55), 10 * breed + buik * 0.75], [t(0.8), 10.7 * breed], [zT1, 9.5 * breed]]),
    ry: profiel([[zT0, 7.9 * breed + buik * 0.45], [t(0.3), 7.3 * breed + buik], [t(0.55), 7.1 * breed + buik * 0.7], [t(0.8), 7.3 * breed], [zT1, 6.1 * breed]]),
    cy: profiel([[zT0, 0.6], [t(0.35), 0.8 + buik * 0.5], [zT1, 0.5]]),
  };
  const vrouwVorm = {
    rx: profiel([[zT0, 9.4 * breed], [t(0.35), 8.8 * breed + buik * 0.7], [t(0.7), 9.8 * breed], [zT1, 8.9 * breed]]),
    ry: profiel([[zT0, 7.4 * breed], [t(0.35), 6.7 * breed + buik * 0.8], [t(0.7), 7.2 * breed], [zT1, 5.9 * breed]]),
    cy: profiel([[zT0, 0.8], [t(0.5), 1.1], [zT1, 0.6]]),
  };
  const lijf = K.geslacht === 'vrouw' ? vrouwVorm : vorm;
  let rompMat = M.boven;
  if (K.dracht === 'vest') {
    rompMat = (x, y, z) => (y > lijf.cy(z) + 1 && Math.abs(x) < 2 + Math.max(0, (z - (zSch - 6)) * 0.36) && z > zSch - 6 ? M.hemd : M.boven);
  } else if (K.geslacht === 'vrouw') {
    rompMat = (x, y, z) => (y > 2 && Math.abs(x) < 5.4 && z > zSch - 5.5 + 0.12 * x * x ? M.hemd : M.boven);
  }
  const rokTop = zT0 + 2.5;
  const rokVorm = {
    rx: (z) => mix(13.2 * breed, 9.4 * breed, Math.pow(klem(z / rokTop, 0, 1), 0.8)),
    ry: (z) => mix(11.6 * breed, 7.4 * breed, Math.pow(klem(z / rokTop, 0, 1), 0.9)),
    cy: () => 0.8,
  };
  if (K.geslacht === 'vrouw') {
    // rok tot op de grond, lijfje erboven
    delen.push(klokrok(rokTop, [13.2 * breed, 9.4 * breed], [11.6 * breed, 7.4 * breed], () => 0.8, M.onder, D.rok, 1));
    bot(Bn.Brok);
    delen.push(romp(lijf, zT0, zT1, rompMat, D.romp, 2));
  } else {
    delen.push(romp(lijf, K.dracht === 'kiel' ? zT0 - 3.5 : zT0, zT1, rompMat, D.romp, 2));
    if (K.dracht !== 'kiel') delen.push(band(lijf, [0, 0, zT0 + 5.5], [0, 0, 1], 1, { los: 0.3, d: 0.6, z0: zT0 + 3, z1: zT0 + 8 }, M.riem, D.riem));
  }
  delen.push(ellips([0, 0.6, zT1 - 2.4], [11 * breed, 6.9 * breed, 4.3], rompMat, D.romp, 3));
  delen.push(kegel([0, 0.9, zT1 - 2], plus(H, [0, -1.4, -5.4]), 3.1 * breed, 2.8 * breed, M.huid, D.romp, 1));
  // schort
  if (K.schort) {
    if (K.geslacht === 'vrouw') {
      delen.push(schil(rokVorm, { los: 1.1, d: 0.55, breed: (z) => mix(8.6, 6.8, klem(z / rokTop, 0, 1)) * breed, z0: 5, z1: rokTop - 0.6 }, M.schort, D.schort));
      delen.push(band(lijf, [0, 0, rokTop + 0.6], [0, 0, 1], 1, { los: 0.4, d: 0.6, z0: rokTop - 1, z1: rokTop + 3 }, M.schort, D.schort));
    } else {
      const z1s = zT0 + 7;
      delen.push(schil(lijf, { los: 0.4, d: 0.6, breed: () => 7.2 * breed, z0: 15, z1: z1s, zHang: zT0 + 1 }, M.schort, D.schort));
      delen.push(band(lijf, [0, 0, z1s], [0, 0, 1], 0.9, { los: 0.4, d: 0.6, z0: z1s - 2, z1: z1s + 2 }, M.schort, D.schort));
    }
  }
  bot(Bn.Bromp);

  // --- wat hij of zij draagt bepaalt de armen
  const mouw = K.dracht === 'vest' ? M.hemd : K.geslacht === 'vrouw' ? M.hemd : M.boven;
  const armR = { r: [3.9 * breed, 3.4 * breed, 2.6], mouw: r(23) < 0.35 ? 1.5 : 2, stof: mouw, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.6 * breed, 2.8, 3] };
  const armL = { ...armR, dArm: D.armL, dHand: D.handL };
  const hangend = (s) => [[s * (schX + 1.4), 0.4, zSch - 11], [s * (schX + 0.4), 2.6, zSch - 20.5]];
  const draagX = K.geslacht === 'vrouw' ? Math.max(schX + 0.4, 12.4 * breed) : schX + 0.4;
  const draagArm = () => [[draagX + 1.4, 0.4, zSch - 11], [draagX, 2.6, zSch - 19]];
  const inZij = (s) => [[s * (schX + 4.2), 0.6, zSch - 10.5], [s * (schX - 2.2), 1.8, zSch - 16.5]];
  const houding = r(24) < 0.3 ? inZij : hangend;

  if (K.draagt === 'mand' || K.draagt === 'emmer') {
    const [E, Hd] = draagArm();
    const c = [Hd[0] + 0.6, Hd[1] + 1.4, Hd[2]];
    if (K.draagt === 'mand') {
      mat[M.ding1] = { ramp: 'riet', lo: 1.4, hi: 5.8, patroon: vlecht([c[0], c[1], 0]) };
      mat[M.ding2] = stofMat(uit(25, SCHORT_STOF));
      mat[M.ding3] = { ramp: uit(26, ['rood', 'blad', 'zand']), lo: 2, hi: 6 };
      const bodem = c[2] - 13.4;
      const { delen: md, top } = mand([c[0], c[1], bodem], [5.6, 4.3, 7.2], M.ding1, D.ding);
      delen.push(...md);
      delen.push(ellips([c[0] - 1.6, c[1], top - 0.6], [3, 2.6, 1.8], M.ding2, D.ding, 0.8));
      delen.push(bol([c[0] + 2.2, c[1] + 0.6, top + 0.2], 1.9, M.ding3, D.ding, 0.6));
      delen.push(bol([c[0] + 1.4, c[1] - 1.8, top - 0.4], 1.7, M.ding3, D.ding, 0.6));
    } else {
      mat[M.ding1] = { ramp: 'hout', lo: 1.2, hi: 5.4, patroon: (x, y, z) => (Math.sin(Math.atan2(y - c[1], x - c[0]) * 13) > 0.7 ? -0.7 : 0) };
      mat[M.ding2] = { ramp: 'pleister', lo: 3, hi: 6.6 };
      const onder = c[2] - 15;
      const boven = onder + 9.6;
      delen.push(kegel([c[0], c[1], onder], [c[0], c[1], boven], 3.9, 4.6, M.ding1, D.ding));
      for (const zz of [onder + 1.4, boven - 1.2]) delen.push(ring([c[0], c[1], zz], [0, 0, 1], 4.2, 0.55, M.band, D.ding));
      delen.push(ellips([c[0], c[1], boven - 0.5], [4.2, 4.2, 0.8], M.ding2, D.ding, 0.4));
      delen.push({
        f: (x, y, z) => Math.max(sdf.torus(x - c[0], z - boven, y - c[1], 4.6, 0.5), boven - z),
        g: [c[0], c[1], boven + 2.4, 6],
        m: M.band,
        deel: D.ding,
      });
    }
    arm(delen, [schX, 0.6, zSch], E, Hd, armR);
    bot(Bn.Barm[1]);
    const [EL, HL] = houding(-1);
    arm(delen, [-schX, 0.6, zSch], EL, HL, armL);
    bot(Bn.Barm[0]);
  } else if (K.draagt === 'takkenbos' || K.draagt === 'zak') {
    const Hd = K.draagt === 'zak' ? [schX + 0.3, 8, zSch - 2.4] : [schX + 0.6, 10.2, zSch - 7.5];
    if (K.draagt === 'takkenbos') {
      mat[M.ding1] = { ramp: 'schors', lo: 0.9, hi: 4.8 };
      mat[M.ding2] = { ramp: 'hout', lo: 1, hi: 4.6 };
      const a = [schX + 1, 11.6, zSch - 5.5];
      const b = [schX - 1.8, -13, zSch + 5.5];
      const u = eenheid(min(b, a));
      const [, v, w] = assen(u);
      for (let i = 0; i < 9; i++) {
        const hoek = (i / 9) * Math.PI * 2 + 0.4;
        const rr = i % 3 === 0 ? 1.1 : 2.3;
        const dx = maal(v, Math.cos(hoek) * rr);
        const dy = maal(w, Math.sin(hoek) * rr);
        const sA = plus(plus(a, dx), maal(dy, 1));
        const sB = plus(plus(b, dx), maal(dy, 1));
        delen.push(kegel(plus(sA, maal(u, -0.6 - 1.4 * r(30 + i))), plus(sB, maal(u, 1.6 * r(40 + i))), 1.05, 0.85, i % 2 ? M.ding1 : M.ding2, D.ding));
      }
      for (const f of [0.22, 0.62]) {
        const c = langs(a, b, f);
        delen.push(ring(c, u, 2.8, 0.5, M.riem, D.ding));
      }
    } else {
      mat[M.ding1] = { ramp: 'jas', lo: 1.8, hi: 6.4, patroon: (x, y, z) => ((Math.floor(x * 1.1) + Math.floor(z * 1.1)) % 2 === 0 ? 0.25 : -0.25) };
      const z0 = [schX + 0.6, 7.4, zSch + 0.5];
      const z1 = [schX + 1.2, -1.5, zSch + 5];
      const z2 = [schX - 0.8, -8.5, zSch - 5];
      delen.push(...bochtKegel(z0, z1, z2, 2.6, 4.6, 5, M.ding1, D.ding, 2));
      delen.push(ellips([schX - 0.8, -8.6, zSch - 9.5], [4.8, 4.4, 5.4], M.ding1, D.ding, 2));
      delen.push(ring(plus(z0, [0, 0.3, -0.6]), eenheid([0.05, 0.4, -1]), 1.9, 0.6, M.riem, D.ding));
    }
    arm(delen, [schX, 0.6, zSch], [schX + 4.8, 3.4, zSch - 11], Hd, armR);
    bot(Bn.Barm[1]);
    const [EL, HL] = houding(-1);
    arm(delen, [-schX, 0.6, zSch], EL, HL, armL);
    bot(Bn.Barm[0]);
  } else {
    const [ER, HR] = (r(24) < 0.3 ? inZij : hangend)(1);
    const [EL, HL] = (r(27) < 0.3 ? inZij : hangend)(-1);
    arm(delen, [schX, 0.6, zSch], ER, HR, armR);
    bot(Bn.Barm[1]);
    arm(delen, [-schX, 0.6, zSch], EL, HL, armL);
    bot(Bn.Barm[0]);
  }

  // --- hoofd
  const oy = schedel(delen, H, M, D, { maat: kop, oog, oor: K.geslacht === 'vrouw' ? 0.85 : 1 });
  const neus = uit(28, ['knop', 'lang', 'klein']);
  if (neus === 'lang') {
    delen.push(ellips(plus(H, [0, kop[1] - 0.1, -1.2]), [1.6, 2.3, 2.6], M.huid, D.hoofd, 1));
    delen.push(bol(plus(H, [0, kop[1] + 1.2, -2.6]), 1.6, M.huid, D.hoofd, 1));
  } else if (neus === 'knop') {
    delen.push(bol(plus(H, [0, kop[1] + 0.4, -1.5]), 1.85, M.huid, D.hoofd, 1));
  } else {
    delen.push(bol(plus(H, [0, kop[1] - 0.1, -1.4]), 1.35, M.huid, D.hoofd, 1));
  }
  wenkbrauwen(delen, H, kop, oog, M.haar, D.hoofd, { z: 2, dik: K.geslacht === 'man' ? 1.1 : 0.85, breed: 1.95, hoek: K.oud ? 0.9 : 0 });
  if (r(29) < 0.6) glimlach(delen, H, kop, M.mond, D.hoofd, 1.3, -4.2);
  if (K.oud) {
    mat[M.huid].patroon = (x, y, z) => {
      const dz = z - H[2];
      return y > H[1] + 4 && Math.abs(x) < 3.4 && dz > 3.2 && dz < 5.4 && Math.sin(dz * 3.4 + 0.6) > 0.7 ? -0.9 : 0;
    };
  }
  // baard en snor
  if (K.baard === 'snor' || K.baard === 'baard') {
    for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 0.7, kop[1] + 0.6, -3.4]), plus(H, [s * 3.8, kop[1] - 0.8, -4.2]), 1.3, 0.85, M.haar, D.hoofd, 0.6));
  }
  if (K.baard === 'baard') {
    delen.push({
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - H[1];
        const dz = z - H[2];
        return Math.max(sdf.ellipsoide(dx, dy - 0.6, dz + 1, kop[0] + 0.7, kop[1] + 0.7, kop[2] + 0.4), dz + 2.4 - 0.15 * Math.abs(dx), -dy - 1);
      },
      g: [H[0], H[1] + 1, H[2] - 4, kopR + 4],
      m: M.haar,
      deel: D.haar,
      k: 0.6,
    });
  }
  // haar, met de knot lager als er een hoed op gaat
  const petOp = K.hoofddeksel === 'pet' || K.hoofddeksel === 'strohoed';
  const bedekt = K.hoofddeksel === 'kap' || K.hoofddeksel === 'hoofddoek';
  if (!bedekt) {
    if (K.kapsel === 'kaal') {
      delen.push(ellips(plus(H, [0, -2.2, -1.8]), [kop[0] + 0.3, kop[1] - 0.5, kop[2] * 0.68], M.haar, D.haar, 1));
    } else {
      delen.push(haarKap(H, kop, M.haar, D.haar, { voor: K.kapsel === 'kuif' ? 5.4 : 4.5, helling: 1.15, dik: 0.5 }));
      if (K.kapsel === 'kuif') delen.push(ellips(plus(H, [0, 3.4, kop[2] - 0.6]), [3, 2.6, 2.2], M.haar, D.haar, 1.2));
      if (K.kapsel === 'lang') delen.push(ellips(plus(H, [0, -3.4, -4.6]), [kop[0] + 0.5, 4.4, 4.6], M.haar, D.haar, 1.6));
    }
  } else if (K.kapsel !== 'kaal') {
    // onder een doek of kap blijft een pony zichtbaar
    delen.push(ellips(plus(H, [0, gezichtY(kop, 0, 4.4) - 1.1, 4.4]), [3.8, 1.5, 1.1], M.haar, D.haar, 0.6));
  }
  if (K.kapsel === 'knot' && !bedekt) delen.push(ellips(plus(H, [0, -4, petOp ? -2.6 : 5.4]), [3.5, 3.3, 3.4], M.haar, D.haar));
  if (K.kapsel === 'staart') delen.push(kegel(plus(H, [0, -5.4, petOp ? -1.5 : 0.5]), plus(H, [0, -8.4, -15]), 2.7, 1.3, M.haar, D.haar, 1.2));
  if (K.kapsel === 'vlecht') {
    delen.push(...bochtKegel(plus(H, [4.6, -2.4, -1.5]), plus(H, [6.8, 2.6, -8.5]), [6.4, 6.6, zSch - 10], 2.1, 1.3, 4, M.haar, D.haar, 0.8));
    delen.push(ring([6.4, 6.6, zSch - 10.6], eenheid([0.3, 0.6, 1]), 1.2, 0.5, M.riem, D.haar));
  }
  if (K.kapsel === 'los' && !bedekt) {
    delen.push(ellips(plus(H, [0, -4.2, -4]), [kop[0] * 0.98, 3.6, 5.8], M.haar, D.haar, 2));
    delen.push(ellips([0, -7.2, zSch - 4], [kop[0] * 0.92, 2.8, 5.6], M.haar, D.haar, 2.5));
  }

  // --- hoofddeksel
  if (K.hoofddeksel === 'pet') {
    delen.push(ellips(plus(H, [0, 0.2, kop[2] - 1]), [kop[0] + 0.7, kop[1] + 1.1, 3.1], M.hoed, D.hoed, 1));
    delen.push({
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - (H[1] + kop[1] + 0.4);
        const dz = z - (H[2] + kop[2] - 2) - 0.1 * dy;
        return sdf.ellipsoide(dx, dy, dz, 5.4, 3.6, 0.8) * 0.85;
      },
      g: [H[0], H[1] + kop[1] + 0.4, H[2] + kop[2] - 2, 7],
      m: M.hoed,
      deel: D.hoed,
    });
  } else if (K.hoofddeksel === 'strohoed') {
    const rand = plus(H, [0, -0.8, kop[2] - 1.2]);
    delen.push({
      f: (x, y, z) => {
        const dx = x - rand[0];
        const dy = y - rand[1];
        const dz = z - rand[2] + 0.014 * (dx * dx + dy * dy) - 0.16 * dy;
        return sdf.ellipsoide(dx, dy, dz, 11.6, 11.2, 1) * 0.75;
      },
      g: [rand[0], rand[1], rand[2], 13],
      m: M.hoed,
      deel: D.hoed,
    });
    delen.push({
      f: (x, y, z) => sdf.cilinder(x - rand[0], y - rand[1] - 0.4, z - rand[2], kop[0] - 0.6, 0, 5.4) - 0.6,
      g: [rand[0], rand[1], rand[2] + 3, kop[0] + 3],
      m: M.hoed,
      deel: D.hoed,
      k: 1,
    });
  } else if (K.hoofddeksel === 'hoofddoek') {
    delen.push({
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - H[1];
        const dz = z - H[2];
        const e = sdf.ellipsoide(dx, dy + 0.4, dz - 0.7, kop[0] + 1.1, kop[1] + 1, kop[2] + 1.1);
        return Math.max(e, dy - (4.2 + 0.9 * (dz - 4)), -dz - 5.6) * 0.9;
      },
      g: [H[0], H[1], H[2], kopR + 3],
      m: M.hoed,
      deel: D.hoed,
      k: 0.6,
    });
    const knoop = plus(H, [0, -kop[1] - 1.4, -4.4]);
    delen.push(bol(knoop, 1.7, M.hoed, D.hoed, 0.8));
    delen.push(kegel(plus(knoop, [0.6, 0.2, -0.8]), plus(knoop, [2, -0.6, -6.4]), 1.5, 0.7, M.hoed, D.hoed, 0.6));
  } else if (K.hoofddeksel === 'kap') {
    const gat = (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      return Math.max((Math.hypot(dx / 5.2, (dz + 0.9) / 6.6) - 1) * 5.2, 1.4 - dy);
    };
    delen.push({
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - H[1];
        const dz = z - H[2];
        const bolKap = sdf.ellipsoide(dx, dy + 0.8, dz - 0.6, kop[0] + 1.2, kop[1] + 1.1, kop[2] + 1.2);
        const kraag = sdf.rondeKegel(x, y, z, H[0], H[1] - 1.6, H[2] - 5.4, 0, 0.6, zT1 - 1.5, 5.4, 7.8);
        return Math.max(Math.min(bolKap, kraag), -gat(x, y, z));
      },
      g: [H[0], H[1] - 1, H[2] - 3, kopR + 9],
      m: M.hoed,
      deel: D.hoed,
    });
    delen.push(kegel(plus(H, [0, -6.2, 3.2]), plus(H, [0.4, -10.6, -4.6]), 3, 1, M.hoed, D.hoed, 1.2));
  }

  bot(Bn.Bnek);

  const m = model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 0, 42 * lang], straal: 52 });
  m.hoofd = H;
  m.portret = { kant: 'ZO', midden: 0.5 };
  m.kenmerken = K;
  return m;
}

// naam, bouwer, het midden van het hoofd (voor het portret) en een regel over wie het is, in
// dezelfde vorm als DORPELINGEN in dorpelingen.cjs.
const BEROEPEN = [
  {
    naam: 'bakker',
    maak: bakker,
    hoofd: [0, 3.8, 64],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De bakker: rond, een wit schort vol meel, een slappe muts, een krulsnor, een vers brood onder zijn arm.',
  },
  {
    naam: 'molenaar',
    maak: molenaar,
    hoofd: [-1.6, 4.4, 70],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De molenaar: lang en wit van het meel, een volle zak met het wiekenmerk op zijn schouder.',
  },
  {
    naam: 'kruidenvrouw',
    maak: kruidenvrouw,
    hoofd: [0, 4.2, 66.5],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De kruidenvrouw: groene omslagdoek, zwart haar met een witte lok, een takje in het haar, een mand vol kruiden.',
  },
  {
    naam: 'jager',
    maak: jager,
    hoofd: [0, 4.4, 68.5],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De jager: grijze kap met manteltje, leren wambuis, de boog in de hand, de koker op de rug, een litteken over de wang.',
  },
  {
    naam: 'marskramer',
    maak: marskramer,
    hoofd: [0, 9.8, 60.5],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De marskramer: een draagrek vol potten en pannen, een lappenjas, gestreepte kousen, een rode hoed met een gele veer.',
  },
  {
    naam: 'koster',
    maak: koster,
    hoofd: [0, 5.4, 73],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De koster: een zwarte jas tot op de enkels met een witte bef, de sleutelbos in de ene hand, een brandende lantaarn in de andere.',
  },
  {
    naam: 'wachter',
    maak: wachter,
    hoofd: [0, 4.8, 66.5],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De wachter: oud en slaperig, een pothelm scheef over zijn ogen, een hangsnor, een buik onder de wapenrok, leunend op zijn speer.',
  },
];

module.exports = {
  BEROEPEN,
  dorpeling,
  DORPELING_SNELHEID,
  bakker,
  molenaar,
  kruidenvrouw,
  jager,
  marskramer,
  MARSKRAMER_SNELHEID,
  MARSKRAMER_FPS,
  koster,
  wachter,
  HUID,
  HAAR,
  STOF,
  arm,
  been,
  band,
  mand,
  plooiRomp,
  assen,
  lokaal,
  ellipsGedraaid,
  wenkbrauwen,
  haarKap,
  gezichtY,
};
