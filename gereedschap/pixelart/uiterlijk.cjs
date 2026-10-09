// Elk mens ziet er anders uit (werklijst vraag 145, 1; Marcel, 9 okt: "het voelt gewoon wat 'saai' in het dorp", en
// "Kleren, haar, niet iedereen heeft een hoofddeksel. Ook verschillende gezichten, baard etc. Lang haar, kort haar
// mannen en vrouwen. Schoenen eventueel"). Tot nu toe had elke leeftijd één poppetje per geslacht: twintig mensen
// voelden als vier. Hier staan de uiterlijken: per lijf 24, elk een andere kleur kleren (een verf die er toen was:
// ongeverfd linnen, blauw van wede, rood van meekrap, geel en oker van wouw, groen, bruin, grijs), ander haar (blond,
// bruin, kastanje, zwart, rood), een kapsel (kort, lang, krullen, een staart, kaal; bij een vrouw een knot, een vlecht,
// twee vlechten, los of kort), een baard of niet, een hoofddeksel of niet, en een ander gezicht (neus, wenkbrauwen).
// Ze zijn met de hand samengesteld, niet geloot: zo is elk een mens, en geen toevalstreffer.
//
// UITERLIJKEN.<lijf> is een lijst opties voor de bouwfunctie van dat lijf (boer() in dorpelingen.cjs, boerin() in
// dorpelingen2.cjs; de opties staan daar beschreven). Het haar staat erbij als `kleur` (HAAR), zodat een kind het haar
// van een ouder kan krijgen (js/bewoners.js). De hulpjes hieronder bouwen wat er nieuw is aan een hoofd; ze leunen
// alleen op de bouwstenen (kern, figuren, figuren2), zoals karakters.cjs.
//
//   node gereedschap/pixelart/uiterlijk.cjs proef [hd]   de proefplaat: alle uiterlijken staand in ZO, in
//                                                       gereedschap/pixelart/uit/uiterlijk/ (hd: op dubbele resolutie)
// Lokale assen zoals overal: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
'use strict';
const { sdf } = require('./kern.cjs');
const { kegel, bol, ellips, capsule, plus, naarRamp } = require('./figuren.cjs');

// ---------------------------------------------------------------- de kleuren

// Haar, als materiaal, met lokken erin (een lichtere streep, schuin over het hoofd) en een scheiding bovenop (bij een volwassene).
// Peper en zout is grijzend; grijs is voor de ouden.
const lokken = (x, y, z) => (Math.abs(x) < 0.45 && z > 71 && y > -2 ? -1.2 : Math.sin(x * 2.1 + z * 0.7 + y * 0.4) > 0.62 ? 0.7 : 0);
const HAAR_KLEUR = {
  blond: { ramp: 'stro', lo: 2, hi: 6 },
  bruin: { ramp: 'aarde', lo: 1, hi: 4.6 },
  donker: { ramp: 'schors', lo: 0.8, hi: 4.2 },
  kastanje: { ramp: 'hout', lo: 1, hi: 4.4 },
  zwart: { ramp: 'vacht', lo: 0.3, hi: 2.6 },
  rood: { ramp: 'herfst', lo: 1.2, hi: 5 },
  lichtblond: { ramp: 'perkament', lo: 2.4, hi: 5.4 },
  donkerblond: { ramp: 'zand', lo: 2.6, hi: 6 },
  peper: { ramp: 'vacht', lo: 2.2, hi: 6.4 },
  grijs: { ramp: 'baard', lo: 1.6, hi: 5.6 },
};
const HAAR = Object.fromEntries(Object.entries(HAAR_KLEUR).map(([k, v]) => [k, { ...v, patroon: lokken }]));

// Kleren: de verf van toen, gedempt (lo en hi binnen de ramp, zodat niets fel wordt).
const STOF = {
  linnen: { ramp: 'perkament', lo: 1.4, hi: 4.8 },
  wit: { ramp: 'pleister', lo: 2.2, hi: 6.2 },
  blauw: { ramp: 'pet', lo: 1.4, hi: 6 },
  lichtblauw: { ramp: 'gewaad', lo: 1.6, hi: 4.4 },
  rood: { ramp: 'rood', lo: 1.6, hi: 5.2 },
  terracotta: { ramp: 'dak', lo: 1, hi: 5.6 },
  oker: { ramp: 'stro', lo: 1.2, hi: 4.6 },
  groen: { ramp: 'mos', lo: 0.8, hi: 5 },
  bruin: { ramp: 'jas', lo: 1, hi: 4.8 },
  grijs: { ramp: 'vacht', lo: 1.2, hi: 5 },
  donker: { ramp: 'schors', lo: 0.6, hi: 3.6 },
};
// Een stof met een paar plooien erin, zoals de kiel van de boer.
const geplooid = (stof, f = 1.3) => versleten(stof, { plooi: f });

// Versleten: een stof met plooien, lappen en vuil, zoals kleren die elke dag gedragen worden. o: plooi (hoe dicht de
// plooien, 0: geen), lappen (een lijst [x, z, kant, stof]: een lap van een andere stof, voorop (kant 1) of achter (-1),
// met de steken eromheen), vuil (tot deze hoogte is de zoom vuil, dichter naar onderen), knie (vuile knieën, voor een
// broek). Een lap ligt in de maten van het lijf in rust; hij beweegt met het deel mee.
function versleten(stof, o = {}) {
  const { plooi = 1.3, lappen = [], vuil = 0, knie = false } = o;
  const van = [stof.lo, stof.hi];
  return {
    ...stof,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      for (const [lx, lz, kant, naar] of lappen) {
        if (Math.sign(y) !== kant) continue;
        const dx = Math.abs(x - lx);
        const dz = Math.abs(z - lz);
        if (dx > 2.4 || dz > 2.9) continue;
        if (dx > 1.75 || dz > 2.25) return Math.sin(x * 4 + z * 4) > 0 ? -1.2 : -0.4; // de steken
        return naarRamp(STOF[naar].ramp, stap, van, [STOF[naar].lo, STOF[naar].hi]);
      }
      const ruis = Math.sin(x * 2.7 + z * 1.9) + Math.sin(y * 3.1 - z * 1.3) + Math.sin(x * 1.3 - y * 2.2);
      if (vuil && z < vuil && ruis > -1.6 + ((vuil - z) / vuil) * 3) return -1;
      if (knie && z > 13 && z < 19 && y > 1 && ruis > 0.2) return -0.8;
      return plooi && Math.sin(x * plooi + 0.4) > 0.84 ? -0.6 : 0;
    },
  };
}

// Schoenen: klompen van wilgenhout, of leer.
const SCHOEN = {
  klomp: { ramp: 'zand', lo: 3, hi: 7.4 },
  donkereKlomp: { ramp: 'hout', lo: 2, hi: 5.6 },
  leer: { ramp: 'leer', lo: 0.6, hi: 3.6, glans: 1 },
};
// Met modder eraan: de onderkant donker, in spatten.
const modderig = (schoen) => ({ ...schoen, patroon: (x, y, z) => (z < 3.2 && Math.sin(x * 3.3 + y * 2.1) + Math.sin(y * 2.9 - x * 1.7) > -0.4 ? -1.4 : 0) });

// ---------------------------------------------------------------- het hoofd

// Het haar van een man, bovenop de kap die boer() altijd legt (achter op het hoofd). soort: 'kort' (een korte pony),
// 'lang' (tot op de schouders), 'halflang' (tot de kaak), 'krul' (krullen over het hele hoofd), 'krulkort' (kleine
// krullen), 'staart' (lang, achter bijeengebonden), 'pony' (het kommetje: recht afgeknipt boven de wenkbrauwen en rondom),
// 'opzij' (met een scheiding opzij gekamd), 'kuif' (een pluk die voorop overeind staat). Onder een
// hoed blijft alleen zichtbaar wat eronder uitkomt. maat = de stralen van het hoofd.
function kapselMan(delen, H, [rx, ry, rz], m, d, soort) {
  if (soort === 'kort') delen.push(ellips(plus(H, [0.4, ry * 0.5, rz * 0.62]), [rx * 0.78, 2.6, 1.7], m, d, 0.8));
  if (soort === 'lang' || soort === 'staart') {
    // over de kruin naar achteren, en achter tot in de nek
    delen.push(ellips(plus(H, [0, -1.4, 1.6]), [rx + 0.5, ry - 0.4, rz - 0.6], m, d, 1));
    delen.push(ellips(plus(H, [0, -3.4, -3.6]), [rx + 0.3, 3.6, 6.4], m, d, 1.2));
  }
  if (soort === 'lang') {
    // opzij, achter de oren langs tot op de schouders; een fractie ongelijk
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.4), -1.6, -4.4 - (s > 0 ? 0.6 : 0)]), [1.9, 3.2, 6.6], m, d, 1));
    delen.push(ellips(plus(H, [0, -4, -9]), [rx - 1, 3, 3.4], m, d, 1));
  }
  if (soort === 'staart') {
    delen.push(kegel(plus(H, [0, -6.4, -2.2]), plus(H, [0.6, -8.6, -12.4]), 2.1, 1, m, d, 0.8));
  }
  if (soort === 'krul') krullen(delen, H, [rx, ry, rz], m, d, 26, 2.1, 0.25);
  if (soort === 'krulkort') krullen(delen, H, [rx, ry, rz], m, d, 34, 1.5, 0.35);
  if (soort === 'halflang') {
    delen.push(ellips(plus(H, [0, -1.4, 1.6]), [rx + 0.5, ry - 0.4, rz - 0.6], m, d, 1));
    delen.push(ellips(plus(H, [0, -3.4, -2.2]), [rx + 0.4, 3.6, 5.2], m, d, 1.2));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.2), -1, -2.8]), [1.9, 3.3, 4.4], m, d, 1));
  }
  if (soort === 'pony') {
    // een kom over het hoofd, recht afgeknipt: voorop boven de wenkbrauwen, achter in de nek
    delen.push({
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - H[1];
        const dz = z - H[2];
        const e = sdf.ellipsoide(dx, dy + 0.3, dz - 0.6, rx + 0.75, ry + 0.65, rz + 0.3);
        return Math.max(e, 0.3 + 0.47 * dy - dz);
      },
      g: [H[0], H[1], H[2] + 0.6, rx + 3],
      m,
      deel: d,
      k: 0.6,
    });
  }
  if (soort === 'opzij') {
    // de scheiding links, het haar in een golf naar rechts over het voorhoofd
    delen.push(ellips(plus(H, [1.6, ry * 0.42, rz * 0.66]), [4.4, 2.8, 1.9], m, d, 0.8));
    delen.push(ellips(plus(H, [-3.4, ry * 0.15, rz * 0.8]), [2.6, 3.2, 1.5], m, d, 0.8));
  }
  if (soort === 'kuif') {
    delen.push(ellips(plus(H, [0.4, ry * 0.5, rz * 0.62]), [rx * 0.7, 2.4, 1.6], m, d, 0.8));
    delen.push(kegel(plus(H, [0.2, ry * 0.5, rz * 0.7]), plus(H, [1.2, ry * 0.75, rz + 3.4]), 2.4, 0.8, m, d, 0.8));
  }
}

// Krullen: n bolletjes van straal r over de kruin en achter, op een vast patroon (de gulden hoek, zodat ze gelijk
// verdeeld liggen); het gezicht blijft vrij. laag: hoe ver ze achter en opzij omlaag komen (0 tot 1).
function krullen(delen, H, [rx, ry, rz], m, d, n, r, laag) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996;
    const z = laag + (1 - (i + 0.5) / n) * (1 - laag);
    const ring = Math.sqrt(1 - z * z);
    const dx = Math.cos(a) * ring;
    const dy = Math.sin(a) * ring;
    if (dy > 0.55 && z < 0.75) continue;
    delen.push(bol(plus(H, [dx * (rx + 0.3), dy * (ry + 0.3) - 1, z * (rz + 0.2)]), r, m, d, 0.6));
  }
}

// Kaal, met een krans haar boven de oren die wat uitstaat (zoals de hoed 'bloot' van boer()).
function krans(delen, H, m, d) {
  delen.push(ellips(plus(H, [-6.4, -1.3, 1.8]), [1.9, 3.3, 2.7], m, d, 0.8));
  delen.push(ellips(plus(H, [6.3, -1.6, 1.5]), [1.8, 3.4, 2.5], m, d, 0.8));
  delen.push(ellips(plus(H, [0, -5.6, 0.2]), [5.2, 1.8, 2.8], m, d, 0.8));
}

// Een snor: van onder de neus naar de mondhoeken en dan omlaag, wat voller dan die in de volle baard (KAR.baard).
function snor(delen, H, [, ry], m, d, z = -3.7) {
  for (const s of [-1, 1]) delen.push(kegel(plus(H, [s * 0.6, ry + 0.7, z]), plus(H, [s * 4.2, ry - 0.6, z - 2.8]), 1.6, 0.9, m, d, 0.8));
}

// Een sik: een kort puntje aan de kin, met een snor.
function sik(delen, H, [rx, ry, rz], m, d) {
  snor(delen, H, [rx, ry, rz], m, d);
  delen.push(kegel(plus(H, [0, ry * 0.55, -rz * 0.8]), plus(H, [0.3, ry * 0.7, -rz - 4]), 2.2, 0.9, m, d, 1));
}

// Stoppels: het onderste deel van het gezicht een stap donkerder, in plukjes (een patroon op de huid).
function stoppels(H, [, ry, rz], vorig = null) {
  return (x, y, z, nx, ny, nz, stap) => {
    const dz = z - H[2];
    if (dz < -rz * 0.25 && y > H[1] + ry * 0.2 && Math.sin(x * 3.1 + z * 2.3) + Math.sin(z * 4.3 - x) > -0.2) return -1.1;
    return vorig ? vorig(x, y, z, nx, ny, nz, stap) : 0;
  };
}

// Een wollen muts zonder veer of kwast: een opgerolde rand en een bol die een fractie naar één kant zakt.
function wolmuts(delen, H, [rx, ry], m, d, zij = 1) {
  const c = plus(H, [0, -0.6, 3]);
  const a = rx + 0.9;
  const b = ry + 0.9;
  delen.push({
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2] - 0.18 * dy - 0.05 * zij * dx;
      const q = (Math.hypot(dx / a, dy / b) - 1) * Math.min(a, b);
      return Math.hypot(q, dz / 1.1) - 1.5;
    },
    g: [c[0], c[1], c[2], Math.max(a, b) + 4],
    m,
    deel: d,
  });
  delen.push(ellips(plus(H, [0.8 * zij, -1.4, 6.6]), [rx + 1.1, ry + 0.9, 5.6], m, d, 1.2));
  delen.push(ellips(plus(H, [2.6 * zij, -2.6, 10.2]), [3.2, 3, 2.6], m, d, 1.2));
}

// Een deel groter maken om een punt (om, in wereldmaten) met factor k: de vorm, de grensbol, en de weg terug voor het
// patroon, zodat een patroon niet mee uitrekt. Voor een groter hoofd en grotere handen (hoofdMaat, handMaat): op deze
// maat van pixels zie je een gezicht en een hand pas als ze wat groter zijn dan in het echt, zoals in een tekening.
function vergroot(deel, om, k) {
  const terug = (x, y, z) => [om[0] + (x - om[0]) / k, om[1] + (y - om[1]) / k, om[2] + (z - om[2]) / k];
  const f0 = deel.f;
  return {
    ...deel,
    f: (x, y, z) => f0(...terug(x, y, z)) * k,
    terug: deel.terug ? (x, y, z) => deel.terug(...terug(x, y, z)) : terug,
    ...(deel.g ? { g: [om[0] + (deel.g[0] - om[0]) * k, om[1] + (deel.g[1] - om[1]) * k, om[2] + (deel.g[2] - om[2]) * k, deel.g[3] * k] } : {}),
  };
}
// Alle delen vanaf i om om vergroten (het hoofd: alles wat na het lijf komt), en de handen om hun eigen midden.
function vergrootHoofd(delen, i, om, k) {
  if (k && k !== 1) for (let j = i; j < delen.length; j++) delen[j] = vergroot(delen[j], om, k);
}
function vergrootHanden(delen, handen, k) {
  if (!k || k === 1) return;
  for (let j = 0; j < delen.length; j++) if (handen.includes(delen[j].deel) && delen[j].g) delen[j] = vergroot(delen[j], delen[j].g.slice(0, 3), k);
}
const OOGWIT = { ramp: 'pleister', lo: 4.6, hi: 6.6, detail: true, rand: 0, schaduw: false };

// ---------------------------------------------------------------- wat ze aan en bij zich hebben

// Een vest over de kiel of het hemd: een schil om het lijf (lijf = de afstand tot het bovenlijf) van z0 tot z1, voorop
// open in een V die naar boven wijder wordt (open: hoe wijd bovenaan).
function vest(delen, lijf, z0, z1, m, d, open = 3.2) {
  delen.push({
    f: (x, y, z) => {
      const schil = Math.abs(lijf(x, y, z) - 0.9) - 0.6;
      const v = y > 1.5 ? 0.6 + open * Math.max(0, (z - z0) / (z1 - z0)) - Math.abs(x) : -9;
      return Math.max(schil, z0 - z, z - z1, v);
    },
    g: [0, 0, (z0 + z1) / 2, 18],
    m,
    deel: d,
  });
}

// Een tas over de schouder: een band schuin over de borst en de rug, van de linkerschouder naar de rechterheup, en de
// tas zelf op de heup, met een klep. lijf = de afstand tot het bovenlijf; schouder en heup: waar de band loopt.
function schoudertas(delen, lijf, schouder, heup, mBand, mTas, d) {
  const r = [heup[0] - schouder[0], 0, heup[2] - schouder[2]];
  const l = Math.hypot(r[0], r[2]);
  const n = [-r[2] / l, 0, r[0] / l];
  delen.push({
    f: (x, y, z) => {
      const vlak = Math.abs((x - schouder[0]) * n[0] + (z - schouder[2]) * n[2]) - 0.95;
      return Math.max(Math.abs(lijf(x, y, z) - 0.7) - 0.45, vlak, z - schouder[2] - 4, heup[2] - z - 2);
    },
    g: [(schouder[0] + heup[0]) / 2, 0, (schouder[2] + heup[2]) / 2, l / 2 + 14],
    m: mBand,
    deel: d,
  });
  const tas = plus(heup, [2.2, 0.6, -3.4]);
  delen.push(ellips(tas, [2.4, 4.4, 3.8], mTas, d, 1.2));
  delen.push(ellips(plus(tas, [0.9, 0, 1.6]), [1.9, 4.6, 2.4], mTas, d, 0.6)); // de klep
}

// Een mes in een schede aan de riem (band = wat KAR.riem teruggeeft), op x: een leren schede die schuin naar achteren
// hangt, en het heft erboven.
function mes(delen, band, x, mSchede, mHeft, d) {
  const { a, b, c, z } = band;
  const y = c + b * Math.sqrt(Math.max(0, 1 - (x / a) ** 2));
  const boven = [x + Math.sign(x) * 0.4, y + 0.6, z - 0.6];
  const punt = plus(boven, [Math.sign(x) * 0.6, -1.8, -7]);
  delen.push(kegel(boven, punt, 1.1, 0.5, mSchede, d, 0.4));
  delen.push(capsule(boven, plus(boven, [0, 0.5, 3]), 0.65, mHeft, d));
}

// Een rijglijf over de jurk: van de middel tot onder de boezem, met veters voorop (een patroon: kruisjes op het midden).
function rijglijf(stof, veter) {
  return {
    ...stof,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (y > 2 && Math.abs(x) < 1.6 && Math.abs(Math.abs(x) - 0.8 * Math.abs(Math.sin(z * 1.2))) < 0.45) return naarRamp(veter.ramp, stap, [stof.lo, stof.hi], [veter.lo + 1, veter.hi]);
      return 0;
    },
  };
}

// Het haar van een vrouw zonder doek, bovenop de haarkap die boerin() altijd legt. soort: 'knot' (achter op het hoofd),
// 'vlecht' (één, over de rug), 'vlechten' (twee, over de schouders naar voren), 'los' (lang, over de rug en de schouders),
// 'kort' (tot de kaak), 'kroon' (een vlecht om het hoofd), 'staart', 'krul' (krullen tot op de schouders), 'hogeknot'
// (bovenop), 'band' (los, met een haarband in de kleur van band).
function kapselVrouw(delen, H, [rx, ry, rz], m, d, soort, band = m) {
  // de kruin: het haar over het hoofd, met de haargrens hoog op het voorhoofd en achter de slapen langs
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.6, dz - 0.6, rx + 0.45, ry + 0.2, rz + 0.25);
      const lijn = (dy - 3.4 - 1.25 * (dz - 4.6)) / 1.6;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.6, rx + 3],
    m,
    deel: d,
    k: 0.8,
  });
  if (soort === 'knot') delen.push(bol(plus(H, [0, -7.4, 1.4]), 3.4, m, d, 1));
  if (soort === 'vlecht') vlechtje(delen, plus(H, [0, -6.6, -2]), plus(H, [0, -9.6, -10]), plus(H, [0.6, -9.4, -21]), m, d);
  if (soort === 'vlechten') {
    for (const s of [-1, 1]) vlechtje(delen, plus(H, [s * 5, -2.6, -3]), plus(H, [s * 8.6, 0.4, -9.6]), plus(H, [s * 7.4, 4.4, -18.4]), m, d);
  }
  if (soort === 'los') {
    delen.push(ellips(plus(H, [0, -4, -6]), [rx + 0.6, 4, 10.4], m, d, 1.2));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.2), -0.6, -5.4]), [2.1, 3.4, 7.6], m, d, 1));
  }
  if (soort === 'hogeknot') delen.push(ellips(plus(H, [0, -5, 5.6]), [3.4, 3, 2.6], m, d, 1));
  if (soort === 'staart') {
    delen.push(bol(plus(H, [0, -6.8, 2.6]), 2.2, m, d, 0.8));
    delen.push(kegel(plus(H, [0, -8, 2]), plus(H, [0.8, -10.6, -9.6]), 2.4, 1.1, m, d, 0.8));
  }
  if (soort === 'kroon') {
    // een vlecht om het hoofd, net boven de oren, in schakels die om en om op en neer liggen
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      delen.push(bol(plus(H, [Math.cos(a) * (rx + 0.3), Math.sin(a) * (ry + 0.3) - 0.8, 2.4 + (i % 2 ? 0.5 : -0.3) - 1.6 * Math.max(0, Math.sin(a))]), 1.7, m, d, 0.5));
    }
  }
  if (soort === 'krul') {
    krullen(delen, H, [rx, ry, rz], m, d, 30, 2, 0.1);
    for (const [x, y, z] of [[-5.6, -3, -6], [5.4, -3.4, -6.4], [-3, -5.4, -8], [2.6, -5.8, -8.6], [0, -5.4, -4.6], [-6.4, -0.6, -3.4], [6.2, -1, -3.8]]) delen.push(bol(plus(H, [x, y, z]), 2.2, m, d, 0.6));
  }
  if (soort === 'band') {
    delen.push(ellips(plus(H, [0, -4, -6]), [rx + 0.6, 4, 10.4], m, d, 1.2));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.2), -0.6, -5.4]), [2.1, 3.4, 7.6], m, d, 1));
    // de band: van het voorhoofd schuin naar achter over het haar
    const c = plus(H, [0, -0.6, 2.4]);
    const a = rx + 1;
    const b = ry + 0.9;
    delen.push({
      f: (x, y, z) => {
        const dx = x - c[0];
        const dy = y - c[1];
        const dz = z - c[2] - 0.32 * dy;
        const q = (Math.hypot(dx / a, dy / b) - 1) * Math.min(a, b);
        return Math.hypot(q, dz / 1.4) - 0.75;
      },
      g: [c[0], c[1], c[2], Math.max(a, b) + 3],
      m: band,
      deel: d,
    });
  }
  if (soort === 'kort') {
    delen.push(ellips(plus(H, [0, -2.4, -1.2]), [rx + 0.9, ry - 1, rz - 0.6], m, d, 1));
    for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * (rx - 0.1), -0.8, -2.6]), [1.8, 3, 4.4], m, d, 0.8));
  }
}

// Een vlecht langs drie punten: schakels die om en om een fractie opzij liggen, en dunner worden, met een strikje.
function vlechtje(delen, p0, p1, p2, m, d, r0 = 2, r1 = 1.1, n = 8) {
  const bez = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const p = bez(t);
    const r = r0 + (r1 - r0) * t;
    delen.push(ellips(plus(p, [(i % 2 ? 0.5 : -0.5) * r, 0, 0]), [r * 1.05, r, r * 1.25], m, d, 0.6));
  }
  delen.push(bol(plus(p2, [0, 0, -1.2]), r1 * 0.9, m, d, 0.5));
}

// ---------------------------------------------------------------- de uiterlijken

// De boer, voor alle mannen van het dorp (T.LEEFTIJDEN in js/bewoners.js). Geen hooivork: die is van de boer zelf.
// hoed: 'stro', 'vilt', 'wol' (met muts: de kleur), 'kap' (de kaproen) of 'geen'; kapsel: zie kapselMan, of 'kaal';
// baard: 'vol', 'kort', 'snor', 'sik', 'stoppels' of niets; kraag: 'geen' of de halsdoek (halsdoek: de kleur); neusMaat: een maat (1 is die van de boer); wenkbrauw: een maat.
const man = (o) => ({ links: 'hangt', strootje: false, ...o, haar: HAAR[o.kleur], kiel: geplooid(STOF[o.kiel]), broek: STOF[o.broek], klomp: SCHOEN[o.schoen] });
const UITERLIJKEN = {
  boer: [
    man({ kleur: 'donker', hoed: 'stro', kapsel: 'kort', baard: 'snor', kiel: 'blauw', broek: 'bruin', schoen: 'klomp' }),
    man({ kleur: 'blond', hoed: 'geen', kapsel: 'lang', baard: 'kort', kraag: 'geen', kiel: 'linnen', broek: 'donker', schoen: 'leer', neusMaat: 0.85 }),
    man({ kleur: 'zwart', hoed: 'wol', muts: STOF.rood, halsdoek: STOF.linnen, kapsel: 'kort', baard: 'stoppels', kiel: 'bruin', broek: 'grijs', schoen: 'klomp', wenkbrauw: 1.4 }),
    man({ kleur: 'rood', hoed: 'geen', kapsel: 'krul', baard: 'vol', kraag: 'geen', kiel: 'groen', broek: 'bruin', schoen: 'donkereKlomp', neusMaat: 1.15 }),
    man({ kleur: 'bruin', hoed: 'vilt', halsdoek: STOF.donker, kapsel: 'staart', baard: 'sik', kiel: 'grijs', broek: 'bruin', schoen: 'leer', neusMaat: 1.3 }),
    man({ kleur: 'kastanje', hoed: 'geen', kapsel: 'kaal', baard: 'vol', kraag: 'geen', kiel: 'oker', broek: 'donker', schoen: 'klomp', neusMaat: 1.35, wenkbrauw: 1.5, links: 'zij' }),
    man({ kleur: 'blond', hoed: 'wol', muts: STOF.groen, halsdoek: STOF.oker, kapsel: 'lang', kiel: 'rood', broek: 'bruin', schoen: 'klomp', neusMaat: 0.9 }),
    man({ kleur: 'donker', hoed: 'stro', kapsel: 'lang', baard: 'kort', halsdoek: STOF.wit, kiel: 'lichtblauw', broek: 'grijs', schoen: 'donkereKlomp', neusMaat: 1.1 }),
    man({ kleur: 'lichtblond', hoed: 'geen', kapsel: 'pony', kraag: 'geen', kiel: 'bruin', broek: 'donker', schoen: 'klomp', neusMaat: 0.9 }),
    man({ kleur: 'donkerblond', hoed: 'geen', kapsel: 'opzij', baard: 'snor', kiel: 'blauw', broek: 'grijs', schoen: 'leer' }),
    man({ kleur: 'zwart', hoed: 'geen', kapsel: 'halflang', baard: 'vol', kraag: 'geen', kiel: 'linnen', broek: 'bruin', schoen: 'klomp', wenkbrauw: 1.3 }),
    man({ kleur: 'peper', hoed: 'geen', kapsel: 'kaal', baard: 'snor', halsdoek: STOF.blauw, kiel: 'grijs', broek: 'donker', schoen: 'klomp', neusMaat: 1.2 }),
    man({ kleur: 'rood', hoed: 'stro', kapsel: 'kort', baard: 'stoppels', halsdoek: STOF.groen, kiel: 'oker', broek: 'bruin', schoen: 'klomp' }),
    man({ kleur: 'bruin', hoed: 'geen', kapsel: 'krulkort', kraag: 'geen', kiel: 'rood', broek: 'grijs', schoen: 'donkereKlomp', neusMaat: 1.05 }),
    man({ kleur: 'kastanje', hoed: 'wol', muts: STOF.blauw, kapsel: 'halflang', baard: 'sik', halsdoek: STOF.linnen, kiel: 'groen', broek: 'donker', schoen: 'leer' }),
    man({ kleur: 'donkerblond', hoed: 'geen', kapsel: 'kuif', halsdoek: STOF.linnen, kiel: 'terracotta', broek: 'bruin', schoen: 'klomp', neusMaat: 0.95 }),
    man({ kleur: 'donker', hoed: 'vilt', kapsel: 'kort', baard: 'vol', kraag: 'geen', kiel: 'blauw', broek: 'bruin', schoen: 'leer' }),
    man({ kleur: 'lichtblond', hoed: 'stro', kapsel: 'pony', baard: 'snor', kiel: 'grijs', broek: 'bruin', schoen: 'klomp', neusMaat: 1.1 }),
    man({ kleur: 'zwart', hoed: 'geen', kapsel: 'krul', baard: 'kort', kiel: 'oker', broek: 'grijs', schoen: 'klomp' }),
    man({ kleur: 'peper', hoed: 'wol', muts: STOF.grijs, kapsel: 'kort', baard: 'vol', halsdoek: STOF.rood, kiel: 'bruin', broek: 'donker', schoen: 'klomp', wenkbrauw: 1.4 }),
    man({ kleur: 'bruin', hoed: 'geen', kapsel: 'staart', baard: 'stoppels', kraag: 'geen', kiel: 'lichtblauw', broek: 'bruin', schoen: 'klomp', neusMaat: 1.25 }),
    man({ kleur: 'rood', hoed: 'vilt', kapsel: 'halflang', halsdoek: STOF.donker, kiel: 'linnen', broek: 'grijs', schoen: 'leer' }),
    man({ kleur: 'blond', hoed: 'geen', kapsel: 'opzij', baard: 'sik', halsdoek: STOF.oker, kiel: 'groen', broek: 'bruin', schoen: 'klomp', wenkbrauw: 1.3 }),
    man({ kleur: 'kastanje', hoed: 'stro', kapsel: 'lang', baard: 'vol', kraag: 'geen', kiel: 'rood', broek: 'donker', schoen: 'donkereKlomp', links: 'zij' }),
  ],
};
// De boerin, voor alle vrouwen. hoofd: 'doek' (onder de kin geknoopt; met doek: de kleur), 'nekdoek' (in de nek) of
// 'geen'; kapsel: zie kapselVrouw.
const vrouw = (o) => ({ mand: false, links: 'hangt', rechts: 'hangt', ...o, haar: HAAR[o.kleur], jurk: STOF[o.jurk], schort: o.schort ? geplooid(STOF[o.schort], 1.1) : false, doek: o.doek && STOF[o.doek] });
UITERLIJKEN.boerin = [
  vrouw({ kleur: 'bruin', hoofd: 'doek', doek: 'wit', jurk: 'terracotta', schort: 'blauw', mand: true, links: undefined, rechts: undefined }),
  vrouw({ kleur: 'blond', hoofd: 'geen', kapsel: 'vlecht', jurk: 'blauw', schort: 'wit', neusMaat: 0.9 }),
  vrouw({ kleur: 'donker', hoofd: 'nekdoek', doek: 'rood', jurk: 'groen', schort: 'linnen' }),
  vrouw({ kleur: 'zwart', hoofd: 'geen', kapsel: 'knot', jurk: 'bruin', neusMaat: 1.15, rechts: 'zij' }),
  vrouw({ kleur: 'kastanje', hoofd: 'doek', doek: 'oker', jurk: 'grijs', schort: 'wit' }),
  vrouw({ kleur: 'rood', hoofd: 'geen', kapsel: 'los', jurk: 'linnen', schort: 'groen', neusMaat: 0.85 }),
  vrouw({ kleur: 'bruin', hoofd: 'geen', kapsel: 'kort', jurk: 'rood', schort: 'grijs', neusMaat: 1.2 }),
  vrouw({ kleur: 'blond', hoofd: 'geen', kapsel: 'vlechten', jurk: 'lichtblauw', schort: 'linnen' }),
  vrouw({ kleur: 'lichtblond', hoofd: 'geen', kapsel: 'kroon', jurk: 'groen', schort: 'wit' }),
  vrouw({ kleur: 'donkerblond', hoofd: 'nekdoek', doek: 'blauw', jurk: 'terracotta', schort: 'linnen' }),
  vrouw({ kleur: 'zwart', hoofd: 'geen', kapsel: 'staart', jurk: 'oker', schort: 'donker' }),
  vrouw({ kleur: 'kastanje', hoofd: 'geen', kapsel: 'krul', jurk: 'blauw', schort: 'linnen', neusMaat: 1.1 }),
  vrouw({ kleur: 'peper', hoofd: 'doek', doek: 'wit', jurk: 'donker', schort: 'grijs', neusMaat: 1.15 }),
  vrouw({ kleur: 'rood', hoofd: 'geen', kapsel: 'hogeknot', jurk: 'grijs', schort: 'wit' }),
  vrouw({ kleur: 'donker', hoofd: 'geen', kapsel: 'band', doek: 'groen', jurk: 'linnen' }),
  vrouw({ kleur: 'bruin', hoofd: 'doek', doek: 'lichtblauw', jurk: 'bruin', schort: 'wit' }),
  vrouw({ kleur: 'blond', hoofd: 'nekdoek', doek: 'groen', jurk: 'rood', schort: 'linnen' }),
  vrouw({ kleur: 'donkerblond', hoofd: 'geen', kapsel: 'vlecht', jurk: 'grijs', schort: 'blauw' }),
  vrouw({ kleur: 'lichtblond', hoofd: 'geen', kapsel: 'band', doek: 'rood', jurk: 'blauw', neusMaat: 0.9 }),
  vrouw({ kleur: 'zwart', hoofd: 'doek', doek: 'linnen', jurk: 'groen', schort: 'donker' }),
  vrouw({ kleur: 'kastanje', hoofd: 'geen', kapsel: 'kroon', jurk: 'terracotta', schort: 'linnen' }),
  vrouw({ kleur: 'donker', hoofd: 'geen', kapsel: 'knot', jurk: 'lichtblauw', schort: 'wit', mand: true, links: undefined, rechts: undefined }),
  vrouw({ kleur: 'peper', hoofd: 'nekdoek', doek: 'donker', jurk: 'oker', schort: 'grijs', neusMaat: 1.2 }),
  vrouw({ kleur: 'bruin', hoofd: 'geen', kapsel: 'vlechten', jurk: 'groen', schort: 'wit' }),
];

module.exports = { HAAR, STOF, SCHOEN, UITERLIJKEN, vergroot, vergrootHoofd, vergrootHanden, OOGWIT, versleten, modderig, vest, schoudertas, mes, rijglijf, kapselMan, krullen, krans, snor, sik, stoppels, wolmuts, kapselVrouw, vlechtje };

// ---------------------------------------------------------------- de proefplaat

if (require.main === module && process.argv[2] === 'proef') {
  const fs = require('fs');
  const path = require('path');
  const K = require('./kern.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const { boerin } = require('./dorpelingen2.cjs');
  const UIT = path.join(__dirname, 'uit', 'uiterlijk');
  fs.mkdirSync(UIT, { recursive: true });
  const bouw = { boer, boerin };
  const { geschaald } = require('./figuren.cjs');
  // Elk lijf in twee rijen van twaalf, staand in ZO. Met `hd` erachter op dubbele resolutie (het model twee keer zo
  // groot, geschaald in figuren.cjs), om te zien wat dat oplevert.
  const S = process.argv[3] === 'hd' ? 2 : 1;
  const KOL = 56 * S;
  const BOVEN = 20 * S;
  const HOOG = 100 * S;
  const rijen = [];
  for (const lijf of ['boer', 'boerin']) {
    const platen = UITERLIJKEN[lijf].map((o) => {
      const m = bouw[lijf]({ houding: 'staan', fase: 0 }, o);
      return K.losRenderen(S > 1 ? geschaald(m, S) : m, { b: 112 * S, h: 124 * S, anker: [56 * S, 110 * S], richting: 'ZO' });
    });
    rijen.push(platen.slice(0, 12), platen.slice(12));
  }
  const vel = new K.Plaat(KOL * 12 + 8, HOOG * rijen.length);
  rijen.forEach((rij, r) => rij.forEach((p, i) => vel.plak(p.uitsnede(28 * S, BOVEN, KOL, HOOG), 4 + i * KOL, r * HOOG)));
  const naam = S > 1 ? 'proef-hd' : 'proef';
  fs.writeFileSync(path.join(UIT, `${naam}-1x.png`), K.png(vel, 1, '#5e6a44'));
  fs.writeFileSync(path.join(UIT, `${naam}-groot.png`), K.png(vel, 4 / S, '#5e6a44'));
  console.log(path.join(UIT, `${naam}-groot.png`));
}

// De proef met meer detail (node gereedschap/pixelart/uiterlijk.cjs detail): zes mannen en zes vrouwen in drie rijen.
// Boven zoals ze zijn, in het midden met wat ze aan en bij zich hebben (een vest, een riem met buidel en mes, een tas,
// lappen, vuil, modder, een rijglijf, een omslagdoek), onder daarbij een groter hoofd en grotere handen, oogwit en een
// mond.
if (require.main === module && process.argv[2] === 'detail') {
  const fs = require('fs');
  const path = require('path');
  const K = require('./kern.cjs');
  const { boer } = require('./dorpelingen.cjs');
  const { boerin } = require('./dorpelingen2.cjs');
  const UIT = path.join(__dirname, 'uit', 'uiterlijk');
  fs.mkdirSync(UIT, { recursive: true });
  const M = UITERLIJKEN.boer;
  const V = UITERLIJKEN.boerin;
  const mannen = [
    [M[0], { vest: STOF.bruin, riem: true, buidel: true, buidelX: -8.6, mes: 8, klomp: modderig(SCHOEN.klomp), broek: versleten(STOF.bruin, { plooi: 0, knie: true }) }],
    [M[1], { tas: STOF.bruin, kiel: versleten(STOF.linnen, { lappen: [[-3.5, 44, 1, 'bruin']], vuil: 30 }) }],
    [M[2], { riem: true, mes: -7.5, vest: STOF.donker }],
    [M[3], { kiel: versleten(STOF.groen, { lappen: [[4, 50, 1, 'bruin'], [-3, 36, 1, 'oker']], vuil: 32 }), klomp: modderig(SCHOEN.donkereKlomp), mouw: 'op' }],
    [M[5], { riem: true, buidel: true, buidelX: 8.6, tas: STOF.groen }],
    [M[9], { vest: STOF.rood, riem: true, mes: 8 }],
  ];
  const vrouwen = [
    [V[1], { lijfje: STOF.donker, riem: true, buidel: true, buidelX: -8.8 }],
    [V[2], { omslagdoek: STOF.grijs }],
    [V[3], { lijfje: STOF.rood, jurk: versleten(STOF.bruin, { plooi: 0, vuil: 8, lappen: [[3, 20, 1, 'grijs']] }) }],
    [V[5], { omslagdoek: STOF.bruin, riem: true, mes: 8 }],
    [V[8], { lijfje: STOF.bruin, mouw: 'op' }],
    [V[13], { riem: true, buidel: true, buidelX: 8.8, jurk: versleten(STOF.grijs, { plooi: 0, vuil: 9 }) }],
  ];
  const groot = { hoofdMaat: 1.15, handMaat: 1.4, oogWit: true, mond: true };
  const rijen = [];
  for (const [bouw, lijst] of [[boer, mannen], [boerin, vrouwen]]) {
    rijen.push(lijst.map(([o]) => bouw({ houding: 'staan', fase: 0 }, o)));
    rijen.push(lijst.map(([o, x]) => bouw({ houding: 'staan', fase: 0 }, { ...o, ...x })));
    rijen.push(lijst.map(([o, x]) => bouw({ houding: 'staan', fase: 0 }, { ...o, ...x, ...groot })));
  }
  const KOL = 56;
  const HOOG = 100;
  const vel = new K.Plaat(KOL * 6 + 8, HOOG * rijen.length);
  rijen.forEach((rij, r) => rij.forEach((m, i) => vel.plak(K.losRenderen(m, { b: 112, h: 124, anker: [56, 110], richting: 'ZO' }).uitsnede(28, 20, KOL, HOOG), 4 + i * KOL, r * HOOG)));
  fs.writeFileSync(path.join(UIT, 'detail-4x.png'), K.png(vel, 4, '#5e6a44'));
  console.log(path.join(UIT, 'detail-4x.png'));
}
