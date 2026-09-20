// Bomen en begroeiing voor buiten: het dorp en het bos ernaast, op dezelfde manier gemaakt als de
// figuren. Loof bestaat uit klompen: een vorm met bulten van bollen op een rooster. Zo krijgt elke
// klomp vanzelf een geschulpte rand en donkere naden. Daarbovenop komt de vorm van de klomp en de
// kroon in het licht (anders is elke bult even licht en wordt de kroon broccoli), en blaadjes die
// als toetsen op het pixelraster staan, zoals een tekenaar ze zet.
//
// Verder: struiken, varens, gras, bloemen, paddenstoelen, een stronk en stenen; een grasvloer voor
// dozen (zoals zandVloer in kamers.cjs); slagschaduw die tot een hoge kroon reikt; en ontspikkel,
// dat losse pixels in loof weghaalt. Alles staat met de voet op het midden van de tegel en is
// gemaakt voor richting 'Z': het licht op de vorm en de blaadjes rekenen met die kant.
'use strict';
const K = require('./kern.cjs');
const { sdf, klem, mix, hash, rnd, ruis2, ruis3, RAMP, UIT, VLAG, TEGEL, PXH } = K;
const { model } = require('./figuren.cjs');

// ---------------------------------------------------------------- hulpjes

const zachtMin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const zachtMax = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
};
const langs = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

// n+1 punten langs een kwadratische bezier
function bocht(p0, p1, p2, n) {
  const uit = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    uit.push([0, 1, 2].map((j) => (1 - t) * (1 - t) * p0[j] + 2 * (1 - t) * t * p1[j] + t * t * p2[j]));
  }
  return uit;
}

// De grensbol van een heel model, uit de grensbollen van de delen.
function omhul(delen, extra = 2) {
  const bollen = delen.filter((d) => d.g && !d.uit).map((d) => d.g);
  const lo = [1e9, 1e9, 1e9];
  const hi = [-1e9, -1e9, -1e9];
  for (const g of bollen) {
    for (let j = 0; j < 3; j++) {
      lo[j] = Math.min(lo[j], g[j] - g[3]);
      hi[j] = Math.max(hi[j], g[j] + g[3]);
    }
  }
  const midden = [0, 1, 2].map((j) => (lo[j] + hi[j]) / 2);
  let straal = 0;
  for (const g of bollen) straal = Math.max(straal, Math.hypot(g[0] - midden[0], g[1] - midden[1], g[2] - midden[2]) + g[3]);
  return { midden, straal: straal + extra };
}

// alles onder de grond weg (wortels, de onderkant van een stam)
const onderGrond = { f: (x, y, z) => z, uit: true };

// De schermassen (één pixel naar rechts, één naar beneden) en het licht, in de assen van een
// model dat in richting r staat.
function assenVoor(richting = 'Z') {
  const graden = typeof richting === 'number' ? richting : K.RICHTING[richting];
  const a = (graden * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = Math.sin(a);
  const naarLokaal = ([X, Y, Z]) => [-X * fy + Y * fx, X * fx + Y * fy, Z];
  return { ex: naarLokaal(K.EX), ey: naarLokaal(K.EY), licht: naarLokaal(K.LICHT) };
}

// ---------------------------------------------------------------- takken

// Een bundel lijnen als één deel: ronde kegels langs de punten van elke lijn, met de stralen, zacht
// aan elkaar. Eén grensbol voor het geheel scheelt rekenwerk bij bomen met veel takken, en een pol
// gras krijgt zo één omlijning om alle sprieten samen. lijnen = [[punten, stralen], …].
function bundel(lijnen, m, deel, k = 1) {
  const seg = [];
  for (const [punten, stralen] of lijnen) {
    for (let i = 0; i + 1 < punten.length; i++) {
      const a = punten[i];
      const b = punten[i + 1];
      const r = Math.max(stralen[i], stralen[i + 1]);
      seg.push({ a, b, r1: stralen[i], r2: stralen[i + 1], g: [...langs(a, b, 0.5), Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) / 2 + r + k] });
    }
  }
  const { midden, straal } = omhul(seg.map((s) => ({ g: s.g })), 0.5);
  return {
    f: (x, y, z) => {
      let d = 1e9;
      for (const s of seg) {
        const gd = Math.hypot(x - s.g[0], y - s.g[1], z - s.g[2]) - s.g[3];
        if (gd > d) continue;
        const t = sdf.rondeKegel(x, y, z, s.a[0], s.a[1], s.a[2], s.b[0], s.b[1], s.b[2], s.r1, s.r2);
        d = k && d < 1e8 ? zachtMin(d, t, k) : Math.min(d, t);
      }
      return d;
    },
    g: [...midden, straal],
    m,
    deel,
  };
}
const tak = (punten, stralen, m, deel, k = 1) => bundel([[punten, stralen]], m, deel, k);

// ---------------------------------------------------------------- vormen met bulten

// Bollen op de hoeken van een rooster met cellen van 1, elk met een toevallige straal tot 0,5
// (naar Inigo Quilez). Een bol uit een verdere cel ligt minstens 0,5 weg, dus min(…, 0,5) is
// een afstand die nooit te groot is: de renderer schiet er niet doorheen.
function roosterBollen(x, y, z, zaad, rMin) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fx = x - xi;
  const fy = y - yi;
  const fz = z - zi;
  let d = 0.5;
  for (let k = 0; k < 8; k++) {
    const cx = k & 1;
    const cy = (k >> 1) & 1;
    const cz = k >> 2;
    const r = 0.5 * (rMin + (1 - rMin) * rnd(xi + cx, yi + cy, (zi + cz) * 977 + zaad));
    const dx = fx - cx;
    const dy = fy - cy;
    const dz = fz - cz;
    const t = Math.sqrt(dx * dx + dy * dy + dz * dz) - r;
    if (t < d) d = t;
  }
  return d;
}

// Een vorm met bulten: basisvorm f0 (met grensbol g) waarop bollen van een rooster met maat L
// liggen. De kern zakt in en de bollen steken erbuiten: geschulpte randen en donkere naden.
// o.plat drukt de bulten in de hoogte plat, tot richels als dakpannen van blad: een lichte
// bovenkant en schaduw eronder, in plaats van knikkers.
function bultig(f0, g, L, m, deel, zaad, o = {}) {
  const hoek = rnd(zaad, 4) * Math.PI * 2;
  const ca = Math.cos(hoek);
  const sa = Math.sin(hoek);
  const plat = o.plat ?? 1.2;
  const buiten = (o.buiten ?? 0.25) * L;
  const binnen = (o.binnen ?? 0.35) * L;
  const k = (o.zacht ?? 0.3) * L;
  const rMin = o.rMin ?? 0.55;
  const inv = 1 / L;
  const schaal = L / plat;
  const ox = rnd(zaad, 5) * 50;
  const oy = rnd(zaad, 6) * 50;
  const oz = rnd(zaad, 7) * 50;
  const [gx, gy, gz] = g;
  const marge = buiten + k * 0.25 + 0.5;
  return {
    f: (x, y, z) => {
      const e = f0(x, y, z);
      if (e > L) return e - marge;
      const px = x - gx;
      const py = y - gy;
      const qx = (ca * px + sa * py) * inv + ox;
      const qy = (-sa * px + ca * py) * inv + oy;
      const qz = (z - gz) * plat * inv + oz;
      const bl = schaal * roosterBollen(qx, qy, qz, zaad, rMin);
      const bult = zachtMax(bl, e - buiten, k);
      return zachtMin(e + binnen, bult, k);
    },
    g: [gx, gy, gz, g[3] + marge + 1],
    m,
    deel,
  };
}

// Een klomp loof: een ellips met bulten.
function klomp(c, s, L, m, deel, zaad, o = {}) {
  const [cx, cy, cz] = c;
  const [a, b, h] = s;
  return bultig((x, y, z) => sdf.ellipsoide(x - cx, y - cy, z - cz, a, b, h), [cx, cy, cz, Math.max(a, b, h)], L, m, deel, zaad, o);
}

// ---------------------------------------------------------------- loof

// Hoe een punt op een ellips (middelpunt c, halve assen s) naar het licht staat: -1 tot 1.
function vormLicht(x, y, z, c, s, L) {
  const gx = (x - c[0]) / (s[0] * s[0]);
  const gy = (y - c[1]) / (s[1] * s[1]);
  const gz = (z - c[2]) / (s[2] * s[2]);
  const l = Math.hypot(gx, gy, gz) || 1;
  return (gx * L[0] + gy * L[1] + gz * L[2]) / l;
}

// Toetsen: blaadjes van drie tot vijf pixels, precies op het pixelraster van het scherm, verspreid
// over een raster van G pixels. Een boom staat stil, dus een patroon in schermruimte mag.
const BLAADJES = [
  [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],
  [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
];
// hangende naalden: schuine streepjes naar beneden
const NAALDEN = [
  [[0, 0], [0, 1], [1, 2]],
  [[1, 0], [1, 1], [0, 2]],
  [[0, 0], [1, 1], [1, 2]],
  [[0, 0], [0, 1], [0, 2], [1, 3]],
];
// hangende twijgen van een wilg: lange rechte streepjes
const TWIJGEN = [
  [[0, 0], [0, 1], [0, 2], [0, 3]],
  [[0, 0], [0, 1], [0, 2], [1, 3], [1, 4]],
  [[1, 0], [1, 1], [0, 2], [0, 3]],
];
function toetsPatroon(zaad, richting, o = {}) {
  const { ex, ey } = assenVoor(richting);
  const G = o.raster ?? 6;
  const kans = o.kans ?? 0.8;
  const vormen = o.vormen || BLAADJES;
  return (x, y, z) => {
    const ix = Math.floor(x * ex[0] + y * ex[1] + z * ex[2]);
    const iy = Math.floor(x * ey[0] + y * ey[1] + z * ey[2]);
    const cx = Math.floor(ix / G);
    const cy = Math.floor(iy / G);
    for (let j = -1; j <= 0; j++) {
      for (let i = -1; i <= 0; i++) {
        const h = hash(cx + i, cy + j, zaad);
        if ((h & 1023) / 1024 > kans) continue;
        const mx = (cx + i) * G + ((h >>> 10) % (G - 1));
        const my = (cy + j) * G + ((h >>> 14) % (G - 1));
        const vorm = vormen[(h >>> 20) % vormen.length];
        for (const [dx, dy] of vorm) if (mx + dx === ix && my + dy === iy) return 1;
      }
    }
    return 0;
  };
}

// Loof voor één klomp. De renderer belicht de bulten (lo..hi, een smalle band); de vorm van de
// klomp en van de kroon geeft de grote lijn: licht linksboven, donker rechtsonder en onderin.
// Diep in de kroon, in de naden tussen klompen, komt weinig licht. o.klomp en o.kroon = [c, s].
function loofMat(ramp, zaad, o = {}) {
  const { licht } = assenVoor(o.richting);
  const vorm = o.vorm ?? 2.6;
  const [kc, ks] = o.klomp;
  const [cc, cs] = o.kroon || o.klomp;
  const wk = o.klompDeel ?? 0.7;
  const diep = o.diep ?? 1.6;
  const plus0 = o.plus ?? 0;
  const toets = o.toetsen === false ? null : toetsPatroon(zaad, o.richting, o.toetsen);
  const drempel = o.toetsen?.drempel ?? 3.6;
  return {
    ramp,
    lo: o.lo ?? 2.2,
    hi: o.hi ?? 3.8,
    omslag: o.omslag ?? 0.35,
    schaduwKracht: o.schaduwKracht ?? 0.45,
    rand: o.rand ?? 0.8,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const v = wk * vormLicht(x, y, z, kc, ks, licht) + (1 - wk) * vormLicht(x, y, z, cc, cs, licht);
      const rho = Math.hypot((x - cc[0]) / cs[0], (y - cc[1]) / cs[1], (z - cc[2]) / cs[2]);
      let plus = vorm * v - diep * (1 - klem((rho - 0.62) / 0.3, 0, 1)) + plus0;
      // een blaadje: op de lichte kant een tint lichter, in de schaduw een tint donkerder
      if (toets && toets(x, y, z)) plus += stap + plus >= drempel ? 1 : -1;
      if (o.extra) plus += o.extra(x, y, z, stap + plus);
      return plus;
    },
  };
}
const loof = (mat, ramp, zaad, o) => mat.push(loofMat(ramp, zaad, o)) - 1;

// Een kroon van klompen over een koepel (middelpunt C, halve assen RK), van boven naar beneden
// verdeeld als de pitten van een zonnebloem. Elke klomp krijgt een eigen materiaal dat zijn vorm
// en die van de kroon kent. Geeft [middelpunt, straal, hoogte] per klomp terug, voor de takken.
function kroon(delen, mat, o) {
  const { C, RK, n, zaad } = o;
  const R = (i) => rnd(zaad, i, 29);
  const L = o.bult ?? 16;
  const [rMin, rMax] = o.straal ?? [28, 38];
  const ver = o.ver ?? 0.68;
  const [z0, z1] = o.hoogte ?? [1, -0.75];
  const deel = o.deel ?? 10;
  const klompen = [];
  const rampVan = (i) => (typeof o.ramp === 'function' ? o.ramp(i, R(i + 90)) : o.ramp || 'blad');
  // rampen verschillen in lengte en helderheid: zo vallen ze op dezelfde toon
  const rampPlus = { stro: -0.9, rood: 0.7, goud: -0.5 };
  for (let i = 0; i < n; i++) {
    const zz = mix(z0, z1, (i + 0.5) / n);
    const rr = Math.sqrt(Math.max(0, 1 - zz * zz));
    const phi = i * 2.39996 + R(i) * 0.6;
    const p = [C[0] + RK[0] * ver * rr * Math.cos(phi), C[1] + RK[1] * ver * rr * Math.sin(phi), C[2] + RK[2] * ver * zz];
    const r = mix(rMin, rMax, R(i + 50));
    const s = [r, r, r * (o.hoog ?? 0.86)];
    if (o.hang) s[2] *= 1 + o.hang * (1 - zz) * 0.5;
    const ramp = rampVan(i);
    const m = loof(mat, ramp, zaad * 100 + i, { klomp: [p, s], kroon: [C, RK], ...o.loof, plus: (R(70 + i) - 0.5) * 0.6 + (rampPlus[ramp] || 0) + (o.loof?.plus ?? 0) });
    delen.push(klomp(p, s, L, m, o.eenDeel ? deel : deel + i, zaad * 100 + i, o.vorm));
    klompen.push([p, r, zz]);
  }
  if (o.kern !== false) {
    const s0 = [RK[0] * 0.55, RK[1] * 0.55, RK[2] * 0.62];
    const ramp = typeof o.ramp === 'function' ? o.ramp(n, 0) : o.ramp || 'blad';
    const m = loof(mat, ramp, zaad * 100 + 99, { klomp: [C, s0], kroon: [C, RK], ...o.loof, plus: (rampPlus[ramp] || 0) + (o.loof?.plus ?? 0) });
    delen.push(klomp(C, s0, L, m, deel + n, zaad * 100 + 99, o.vorm));
  }
  return klompen;
}

// ---------------------------------------------------------------- schors

// Schors van een eik of een dode boom: de hoogtelijnen van uitgerekte ruis zijn de groeven, een
// netwerk van lange donkere lijnen met lichte ribbels ertussen.
function schorsMat(o = {}) {
  const zaad = o.zaad ?? 3;
  const rek = o.rek ?? 0.07;
  return {
    ramp: o.ramp || 'schors',
    lo: o.lo ?? 0.9,
    hi: o.hi ?? 5.4,
    omslag: 0.15,
    patroon: (x, y, z) => {
      const n = ruis3(x * 0.32, y * 0.32, z * rek, zaad);
      if (Math.abs(n - 0.5) < 0.045) return -1.4;
      return n > 0.66 ? 0.6 : 0;
    },
  };
}

// Berkenbast: wit, met korte donkere streepjes dwars (lenticellen), donkere vlekken, en een
// ruwe zwarte voet.
function berkMat(zaad) {
  return {
    ramp: 'berk',
    lo: 1.2,
    hi: 5.6,
    omslag: 0.25,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      const voet = ruis3(x * 0.25, y * 0.25, z * 0.12, zaad) - (z - 8) / 34;
      if (voet > 0.55) return { ramp: 'schors', stap: klem(stap - 3.2, 0.6, 2.4) };
      const streep = ruis3(x * 0.3, y * 0.3, z * 2, zaad + 1);
      if (streep > 0.76) return { ramp: 'schors', stap: klem(stap - 3.4, 0.8, 2) };
      const vlek = ruis3(x * 0.16, y * 0.16, z * 0.3, zaad + 2);
      if (vlek > 0.8) return -2;
      return 0;
    },
  };
}

// ---------------------------------------------------------------- eik

// Wortels die van de stam uitwaaieren en in de grond verdwijnen.
function wortels(delen, n, zaad, o = {}) {
  const [l0, l1] = o.lengte ?? [22, 32];
  const r0 = o.straal ?? 7.5;
  for (let i = 0; i < n; i++) {
    const a = ((i + rnd(zaad, i, 41) * 0.6) / n) * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    const l = mix(l0, l1, rnd(zaad, i, 43));
    const h = o.hoogte ?? 22;
    delen.push(tak(bocht([ux * 4, uy * 4, h], [ux * l * 0.45, uy * l * 0.45, h * 0.3], [ux * l, uy * l, -1], 4), [r0, r0 * 0.7, r0 * 0.45, r0 * 0.25, r0 * 0.15], o.m ?? 0, o.deel ?? 1, 2.5));
  }
}

// Een eik: dikke stam met uitwaaierende wortels, een brede kroon van klompen, en takken die je
// tussen de klompen door ziet. o.herfst: bruin, oranje en rood blad, en blad op de grond.
function eik(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 17);
  const herfst = !!o.herfst;
  const mat = [schorsMat({ zaad })];
  const delen = [];
  const scheef = [R(1) * 16 - 8, R(2) * 16 - 8];
  // het zaad bepaalt ook de maat: een lage brede eik of een hogere smallere
  const breed = 0.9 + R(5) * 0.2;
  const hoog = 0.92 + R(6) * 0.16;
  const vork = [scheef[0], scheef[1], (66 + R(3) * 14) * hoog];
  delen.push(tak(bocht([0, 0, -3], [scheef[0] * 0.1 + R(4) * 6 - 3, scheef[1] * 0.1, 34], vork, 5), [14, 11, 9.8, 9.2, 8.8, 8.4], 0, 1, 3));
  wortels(delen, 6, zaad, { lengte: [22, 32], straal: 7.5 });
  const C = [scheef[0], scheef[1], 152 * hoog];
  const RK = [84 * breed, 80 * breed, (54 + R(7) * 8) * hoog];
  // herfst: vooral oranje, met vaste tussenpozen een gele en een rode klomp, verschoven per zaad
  const ramp = herfst ? (i) => ((i + zaad) % 6 === 2 ? 'goud' : (i + 2 * zaad) % 9 === 4 ? 'rood' : 'herfst') : 'blad';
  const klompen = kroon(delen, mat, { C, RK, n: 11 + (zaad % 3), zaad, ramp, loof: o.loof });
  // takken van de vork naar de onderste klompen
  for (const [p, , zz] of klompen) {
    if (zz > 0.15) continue;
    const eind = langs(vork, p, 0.72);
    const mid = [mix(vork[0], p[0], 0.45), mix(vork[1], p[1], 0.45), mix(vork[2], p[2], 0.2)];
    delen.push(tak(bocht(vork, mid, eind, 3), [7, 5.2, 3.8, 2.8], 0, 2, 2));
  }
  if (herfst) gevallenBlad(delen, mat, zaad, { n: 26, straal: 37 });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

const herfstEik = (zaad = 1, o = {}) => eik(zaad, { ...o, herfst: true });

// Blad op de grond: platte blaadjes in herfstkleuren, dichter bij de stam, als één deel.
function gevallenBlad(delen, mat, zaad, o = {}) {
  // op de grond donkerder dan in de boom: ze liggen in de schaduw van de kroon
  const kleuren = [['herfst', 1.6, 4.6], ['herfst', 1.2, 4], ['stro', 1.4, 4.2], ['rood', 3, 5.6]].map(([ramp, lo, hi]) => mat.push({ ramp, lo, hi, omslag: 0.3, detail: true }) - 1);
  const blad = [];
  for (let i = 0; i < o.n; i++) {
    const a = rnd(zaad, i, 51) * Math.PI * 2;
    const r = 13 + rnd(zaad, i, 52) ** 1.6 * o.straal;
    const h = rnd(zaad, i, 53) * Math.PI;
    blad.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, ca: Math.cos(h), sa: Math.sin(h), m: kleuren[hash(zaad, i, 54) % kleuren.length] });
  }
  const dichtste = (x, y) => {
    let best = 1e9;
    let b = blad[0];
    for (const l of blad) {
      const d = (x - l.x) ** 2 + (y - l.y) ** 2;
      if (d < best) {
        best = d;
        b = l;
      }
    }
    return b;
  };
  delen.push({
    f: (x, y, z) => {
      let d = 1e9;
      for (const l of blad) {
        const dx = x - l.x;
        const dy = y - l.y;
        // een blaadje verder dan d plus zijn eigen lengte kan niet dichterbij liggen
        const grens = d + 4.5;
        if (dx * dx + dy * dy > grens * grens) continue;
        d = Math.min(d, sdf.ellipsoide(dx * l.ca + dy * l.sa, -dx * l.sa + dy * l.ca, z - 0.5, 4, 2.4, 0.8));
      }
      return d;
    },
    g: [0, 0, 0, o.straal + 20],
    m: (x, y) => dichtste(x, y).m,
    deel: 3,
  });
}

// ---------------------------------------------------------------- den

// Een laag takken van een spar: een hangende rok om de stam, die van de stam af schuin afloopt en
// aan de rand doorhangt. De takpunten steken verder uit en hangen dieper: een gekartelde zoom.
function sparLaag(z0, R, n, fase, L, m, deel, zaad, o = {}) {
  const s1 = o.helling ?? 0.42;
  const s2 = o.hang ?? 0.0035;
  const T = o.dik ?? 15;
  const lobA = o.lob ?? 0.3;
  const zak = o.zak ?? 14;
  const macht = o.macht ?? 4;
  const fase2 = fase * 1.7 + 1;
  const tussen = o.tussen ?? 0;
  const f0 = (x, y, z) => {
    const rho = Math.hypot(x, y);
    const th = Math.atan2(y, x);
    // hoofdtakken en eventueel kleinere punten ertussen
    const lob = Math.max(Math.abs(Math.cos(th * n * 0.5 + fase)) ** macht, tussen * Math.abs(Math.cos(th * n * 1.5 + fase2)) ** macht);
    const u = klem(rho / R, 0, 1);
    const Rt = R * (1 - lobA + lobA * lob);
    const boven = z0 - rho * s1 - rho * rho * s2 - lob * u * u * zak;
    const dik = T * (1 - 0.6 * u);
    const dz = Math.max(z - boven, boven - dik - z);
    return Math.max(dz * 0.72, (rho - Rt) * 0.55);
  };
  if (!L) return { f: f0, g: [0, 0, z0 - R * s1 * 0.6, R + 8], m, deel };
  return bultig(f0, [0, 0, z0 - R * s1 * 0.6, R + 6], L, m, deel, zaad, { plat: 1, buiten: 0.12, binnen: 0.12, ...o.bult });
}

// Een spar: een rechte dunne stam en lagen hangende takken die naar boven kleiner worden, met
// een spits erop.
function den(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 23);
  const H = 286 + R(1) * 22;
  const mat = [schorsMat({ zaad, ramp: 'hout', lo: 0.8, hi: 4.6, rek: 0.12 })];
  const delen = [];
  delen.push(tak([[0, 0, -3], [0, 0, H * 0.5], [0, 0, H - 12]], [7.5, 4.6, 1.4], 0, 1, 0));
  wortels(delen, 5, zaad, { lengte: [13, 18], straal: 4.2, hoogte: 11 });
  const n = o.lagen ?? 7;
  const kroonC = [0, 0, H * 0.55];
  const kroonS = [60, 60, H * 0.5];
  const naald = { vormen: NAALDEN, raster: 5, kans: 0.85, drempel: 3.2 };
  const laag = { helling: o.helling, hang: o.hang, dik: o.dik, lob: o.lob, zak: o.zak, macht: o.macht, bult: o.bultVorm, tussen: o.tussen };
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const z0 = mix(o.onder ?? 74, H - 30, t ** 0.92);
    const Rl = mix(o.breed ?? 62, 15, t) * (0.92 + R(10 + i) * 0.14);
    const fase = R(20 + i) * 6.28;
    const takken = o.takken ?? 7 + (i % 3);
    const m = loof(mat, 'den', zaad * 100 + i, {
      klomp: [[0, 0, z0 - Rl * 0.32], [Rl, Rl, Rl * 0.42]],
      kroon: [kroonC, kroonS],
      lo: o.lo ?? 2.2,
      hi: o.hi ?? 4,
      vorm: o.vorm ?? 2.6,
      diep: 0,
      toetsen: naald,
      plus: (R(30 + i) - 0.5) * 0.4 + (o.plus ?? 0),
      // strepen van de stam naar buiten: de afzonderlijke takken in een laag
      extra: o.strepen === false ? null : (x, y) => (Math.sin(Math.atan2(y, x) * takken * 3 + fase * 3) > 0.55 ? -0.45 : 0),
    });
    delen.push(sparLaag(z0, Rl, takken, fase, o.bult ?? 5, m, 10 + i, zaad * 100 + i, laag));
  }
  // de spits
  const mt = loof(mat, 'den', zaad * 100 + 50, { klomp: [[0, 0, H - 14], [8, 8, 16]], kroon: [kroonC, kroonS], lo: 1.8, hi: 3.6, vorm: 2, diep: 0, toetsen: naald });
  delen.push(bultig((x, y, z) => sdf.rondeKegel(x, y, z, 0, 0, H - 34, 0, 0, H + 6, 9, 1.2), [0, 0, H - 14, 22], 6, mt, 30, zaad * 100 + 50, { plat: 1.3 }));
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- berk

// Een berk: een slanke witte stam met zwarte vlekken, dunne takken omhoog en een luchtige kroon
// van kleine klompen, met gaten waardoor je de takken ziet.
function berk(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 31);
  const mat = [berkMat(zaad), schorsMat({ zaad, ramp: 'vacht', lo: 1, hi: 4.4 })];
  const delen = [];
  const top = [R(1) * 18 - 9, R(2) * 18 - 9, 218];
  const stam = bocht([0, 0, -3], [R(3) * 16 - 8, R(4) * 16 - 8, 110], top, 7);
  delen.push(tak(stam, [7, 6.2, 5.6, 5, 4.4, 3.8, 3.1, 2.4], 0, 1, 1.5));
  wortels(delen, 4, zaad, { lengte: [11, 15], straal: 5, hoogte: 9 });
  // een tweede, dunnere stam bij de helft van de bomen
  if (R(5) > 0.5) {
    const a = R(6) * Math.PI * 2;
    const top2 = [Math.cos(a) * 34, Math.sin(a) * 34, 170];
    delen.push(tak(bocht([Math.cos(a) * 2, Math.sin(a) * 2, 4], [Math.cos(a) * 12, Math.sin(a) * 12, 80], top2, 5), [4.6, 4, 3.4, 2.8, 2.2, 1.8], 0, 2, 1.5));
  }
  const C = [top[0] * 0.7, top[1] * 0.7, o.hoogte ?? 190];
  const RK = o.RK ?? [54, 52, 80];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: o.n ?? 18,
    zaad,
    ramp: 'gras',
    straal: o.straal ?? [12, 18],
    bult: o.bult ?? 12,
    ver: o.ver ?? 0.85,
    hoogte: [0.95, -0.9],
    hoog: o.hoog ?? 0.86,
    hang: o.hang ?? 0.6,
    // grove, onregelmatige bulten: losse bosjes blad in plaats van bolletjes
    vorm: o.vorm ?? { rMin: 0.22, binnen: 0.5, buiten: 0.35, plat: 1.05 },
    kern: false,
    loof: { lo: 2.6, hi: 4.4, vorm: 2.3, diep: 1.2 },
  });
  // takken: van de stam omhoog en naar buiten, naar elke klomp
  klompen.forEach(([p], i) => {
    const t = klem((p[2] - 90) / 140, 0.15, 0.85);
    const van = stam[Math.round(t * (stam.length - 1))];
    const mid = [mix(van[0], p[0], 0.5), mix(van[1], p[1], 0.5), mix(van[2], p[2], 0.7)];
    delen.push(tak(bocht(van, mid, langs(van, p, 0.85), 3), [2.6, 2, 1.5, 1.1], i % 2 ? 0 : 1, 2, 1));
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- dode boom

// Een dode boom aan de bosrand: een grijze, gedraaide stam met een holte, en kale takken die zich
// splitsen en als klauwen naar buiten en omhoog grijpen.
function dodeBoom(zaad = 1, o = {}) {
  const R = (() => {
    let i = 0;
    return () => rnd(zaad, i++, 61);
  })();
  const M = { hout: 0, hol: 1 };
  const mat = [];
  mat[M.hout] = schorsMat({ zaad, ramp: 'vacht', lo: 0.7, hi: 5.6, rek: 0.1 });
  mat[M.hol] = { ramp: 'inkt', lo: 0, hi: 1.4, rand: 0 };
  const delen = [];
  const scheef = [R() * 20 - 10, R() * 20 - 10];
  const top = [scheef[0], scheef[1], 104];
  const stam = bocht([0, 0, -3], [-scheef[0] * 0.4 + R() * 8 - 4, -scheef[1] * 0.4, 50], top, 6);
  delen.push(tak(stam, [13, 10.5, 9, 8.2, 7.6, 7, 6.4], M.hout, 1, 3));
  wortels(delen, 5, zaad, { lengte: [22, 34], straal: 7, hoogte: 20, m: M.hout });
  // een holte in de stam, aan de kant van de kijker
  const hz = 44;
  const hp = langs(stam[2], stam[3], 0.5);
  delen.push({ f: (x, y, z) => sdf.ellipsoide(x - hp[0], y - hp[1] - 8.5, z - hz, 3.4, 4, 6.5), g: [hp[0], hp[1] + 8.5, hz, 8], m: M.hol, deel: 4, uit: true });
  // takken: splitsen tot drie keer, steeds dunner en kronkeliger
  const groei = (start, dir, lengte, straal, niveau) => {
    const opzij = [R() - 0.5, R() - 0.5, (R() - 0.5) * 0.5];
    const mid = [start[0] + dir[0] * lengte * 0.5 + opzij[0] * lengte * 0.45, start[1] + dir[1] * lengte * 0.5 + opzij[1] * lengte * 0.45, start[2] + dir[2] * lengte * 0.5 + opzij[2] * lengte * 0.3];
    const buig = [dir[0] + (R() - 0.5) * 0.6, dir[1] + (R() - 0.5) * 0.6, dir[2] + 0.15 + (R() - 0.5) * 0.4];
    const bl = Math.hypot(...buig);
    const eind = [start[0] + (buig[0] / bl) * lengte, start[1] + (buig[1] / bl) * lengte, start[2] + (buig[2] / bl) * lengte];
    const punten = bocht(start, mid, eind, 4);
    const eindStraal = niveau >= 3 ? 0.9 : straal * 0.62;
    delen.push(tak(punten, [0, 1, 2, 3, 4].map((i) => mix(straal, eindStraal, i / 4)), M.hout, 1, 1));
    if (niveau >= 3) return;
    const kinderen = 2 + (R() > (niveau === 2 ? 0.3 : 0.6) ? 1 : 0);
    for (let k = 0; k < kinderen; k++) {
      const van = punten[k === 0 ? 4 : 2 + (R() > 0.5 ? 1 : 0)];
      const a = (k / kinderen) * Math.PI * 2 + R() * 1.5;
      const nd = [buig[0] / bl + Math.cos(a) * 0.7, buig[1] / bl + Math.sin(a) * 0.7, buig[2] / bl + 0.25];
      const nl = Math.hypot(...nd);
      groei(van, nd.map((v) => v / nl), lengte * (0.62 + R() * 0.12), eindStraal * (k === 0 ? 1 : 0.8), niveau + 1);
    }
  };
  // drie hoofdtakken: één reikt ver opzij, als een arm
  const draai = R() * Math.PI * 2;
  for (let k = 0; k < 3; k++) {
    const a = draai + (k / 3) * Math.PI * 2 + R() * 0.8;
    const op = k === 0 ? 0.25 : 0.9;
    const d = [Math.cos(a), Math.sin(a), op];
    const l = Math.hypot(...d);
    groei(top, d.map((v) => v / l), k === 0 ? 62 : 48, 6.8, 1);
  }
  groei(top, [0.1, -0.1, 1], 40, 5.5, 1);
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- wilg

// Een treurwilg: een korte dikke stam, een lage koepel, en gordijnen van hangende twijgen die tot
// bijna op de grond vallen, met spleten waardoor je de stam ziet.
function wilg(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 37);
  const mat = [schorsMat({ zaad })];
  const delen = [];
  const vork = [R(1) * 8 - 4, R(2) * 8 - 4, 64];
  delen.push(tak(bocht([0, 0, -3], [0, 0, 30], vork, 4), [13, 10.5, 9.5, 9, 8.5], 0, 1, 3));
  wortels(delen, 5, zaad, { lengte: [18, 26], straal: 7 });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + R(3 + k);
    delen.push(tak(bocht(vork, [vork[0] + Math.cos(a) * 20, vork[1] + Math.sin(a) * 20, 92], [vork[0] + Math.cos(a) * 40, vork[1] + Math.sin(a) * 40, 128], 3), [7, 5.5, 4.2, 3.2], 0, 2, 2));
  }
  const C = [vork[0], vork[1], o.hoogte ?? 160];
  const RK = o.RK ?? [86, 82, 46];
  kroon(delen, mat, { C, RK, n: 12, zaad, ramp: 'gras', straal: [24, 32], bult: 14, hoogte: [1, -0.4], hang: o.hang ?? 0.6, loof: { lo: 2.4, hi: 4.2 } });
  // gordijnen: losse strengen twijgen die over de rand van de koepel hangen en naar onderen iets
  // naar binnen vallen, elk met een eigen lengte en een punt; de binnenste laag in de schaduw
  const buik = C[2] - 10;
  const twijg = { vormen: TWIJGEN, raster: 5, kans: 0.9, drempel: 3.4 };
  const inval = o.inval ?? 0.0008;
  const lagen = o.lagen ?? [
    { r: 76, n: 38, breed: 0.26, onder: [14, 100], dik: 5, top: C[2] + (o.top ?? 22) },
    { r: 56, n: 26, breed: 0.32, onder: [28, 100], dik: 6, top: C[2] - 6 },
  ];
  lagen.forEach((l, j) => {
    const fase = R(10 + j) * 6.28;
    const top = l.top;
    const lengte = [];
    for (let s = 0; s < l.n; s++) lengte.push(mix(l.onder[0], l.onder[1], rnd(zaad, s, 71 + j) ** 1.5));
    const f0 = (x, y, z) => {
      const dx = x - C[0];
      const dy = y - C[1];
      const rho = Math.hypot(dx, dy);
      const u = ((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * l.n + fase;
      const si = Math.floor(u + 0.5);
      const zoom = lengte[((si % l.n) + l.n) % l.n];
      // de streng loopt onderaan in een punt uit
      const punt = klem((z - zoom) / 34, 0, 1);
      const breed = l.breed * (0.35 + 0.65 * Math.sqrt(punt));
      const dwars = (Math.abs(u - si) - breed) * ((Math.PI * 2 * Math.max(rho, 20)) / l.n);
      // boven de buik over de koepel naar binnen, eronder hangend en iets naar binnen
      const Rz = (z > buik ? l.r - 0.014 * (z - buik) ** 2 : l.r - inval * (buik - z) ** 2) + Math.sin(si * 2.1 + z * 0.05) * 3;
      const schil = Math.abs(rho - Rz) - l.dik;
      return Math.max(schil * 0.8, dwars, zoom - z, z - top) * 0.8;
    };
    const m = loof(mat, 'gras', zaad * 100 + 60 + j, {
      klomp: [[C[0], C[1], (top + 40) / 2], [l.r + 6, l.r + 6, (top - 40) / 2 + 20]],
      kroon: [[C[0], C[1], 100], [90, 90, 90]],
      lo: 2.4,
      hi: 3.8,
      vorm: 2.2,
      diep: 0,
      plus: j ? -0.8 : 0,
      toetsen: twijg,
    });
    delen.push(bultig(f0, [C[0], C[1], (top + 20) / 2, l.r + 70], 6, m, 40 + j, zaad * 100 + 60 + j, { plat: 0.5, buiten: 0.22, binnen: 0.15 }));
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- appelboom

// Een appelboom voor in het dorp: een korte stam, uitgespreide takken, een ronde kroon en rode
// appels op de buitenkant, een paar in het gras.
function appelboom(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 47);
  const M = { schors: 0, appel: 1 };
  const mat = [];
  mat[M.schors] = schorsMat({ zaad, lo: 1, hi: 5.6 });
  mat[M.appel] = { ramp: 'rood', lo: 2.6, hi: 7.4, glans: 1.6, glansMacht: 14, detail: true, omslag: 0.3 };
  const delen = [];
  const vork = [R(1) * 10 - 5, R(2) * 10 - 5, 52];
  delen.push(tak(bocht([0, 0, -3], [R(3) * 8 - 4, 0, 26], vork, 4), [10, 8, 7.2, 6.8, 6.4], M.schors, 1, 2.5));
  wortels(delen, 5, zaad, { lengte: [15, 20], straal: 5.5, hoogte: 14 });
  const C = [vork[0], vork[1], 124];
  const RK = [72, 68, 46];
  const klompen = kroon(delen, mat, { C, RK, n: 10, zaad, straal: [24, 31], bult: 14, loof: { lo: 2, hi: 3.7 } });
  for (const [p, , zz] of klompen) {
    if (zz > 0.2) continue;
    delen.push(tak(bocht(vork, [mix(vork[0], p[0], 0.5), mix(vork[1], p[1], 0.5), vork[2] + 8], langs(vork, p, 0.75), 3), [5.5, 4.2, 3.2, 2.4], M.schors, 2, 1.5));
  }
  // appels: op de buitenkant van de klompen, aan de kant van de kijker en de zijkanten
  const appels = [];
  for (let i = 0; appels.length < 24 && i < 300; i++) {
    const [p, r] = klompen[Math.floor(R(100 + i) * klompen.length)];
    const a = R(300 + i) * Math.PI * 2;
    const h = R(500 + i) * 1.3 - 0.55;
    const d = [Math.cos(a) * Math.sqrt(1 - h * h), Math.sin(a) * Math.sqrt(1 - h * h), h];
    const q = [p[0] + d[0] * r * 0.98, p[1] + d[1] * r * 0.98, p[2] + d[2] * r * 0.86 * 0.98];
    if (Math.hypot((q[0] - C[0]) / RK[0], (q[1] - C[1]) / RK[1], (q[2] - C[2]) / RK[2]) < 0.78) continue;
    appels.push(q);
  }
  for (let i = 0; i < 3; i++) {
    const a = R(700 + i) * Math.PI * 2;
    const r = 26 + R(710 + i) * 30;
    appels.push([Math.cos(a) * r, Math.sin(a) * r, 2.4]);
  }
  // de appels aan de boom en die in het gras apart: elk groepje een eigen, krappe grensbol
  delen.push(bollen(appels.slice(0, -3), 3.5, M.appel, 5, [1, 1, 0.93]));
  delen.push(bollen(appels.slice(-3), 3.5, M.appel, 5, [1, 1, 0.93]));
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- begroeiing

// Bollen (appels, bessen, aren) als één deel: het minimum over de middelpunten.
function bollen(punten, r, m, deel, rek = [1, 1, 1]) {
  const { midden, straal } = omhul(punten.map((p) => ({ g: [...p, r * Math.max(...rek)] })), 1);
  return {
    f: (x, y, z) => {
      let d = 1e9;
      for (const p of punten) d = Math.min(d, sdf.ellipsoide(x - p[0], y - p[1], z - p[2], r * rek[0], r * rek[1], r * rek[2]));
      return d;
    },
    g: [...midden, straal],
    m,
    deel,
  };
}

// Een punt op de buitenkant van een klomp, aan de kant van de kijker of opzij (voor 'Z' is de
// kijker aan de +y-kant): voor appels en bessen die je ook echt ziet.
function opKlomp(klompen, i, zaad, hoog = 0.86) {
  const [p, r] = klompen[Math.floor(rnd(zaad, i, 91) * klompen.length)];
  const a = rnd(zaad, i, 92) * Math.PI * 1.3 - Math.PI * 0.15;
  const h = rnd(zaad, i, 93) * 1.2 - 0.45;
  const w = Math.sqrt(1 - h * h);
  return [p[0] + Math.cos(a) * w * r, p[1] + Math.sin(a) * w * r, p[2] + h * r * hoog];
}

// Een struik: een lage bult van klompen blad. o.bessen: een hogere, donkerdere struik met rode
// bessen op de buitenkant.
function struik(zaad = 1, o = {}) {
  const bessen = !!o.bessen;
  const mat = [];
  const delen = [];
  const C = [0, 0, bessen ? 16 : 11];
  const RK = bessen ? [24, 22, 19] : [30, 27, 14];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: bessen ? 7 : 6,
    zaad,
    straal: bessen ? [12, 15] : [13, 17],
    bult: 8,
    ver: 0.6,
    hoogte: [1, -0.5],
    loof: { lo: 2.2, hi: 3.9, plus: bessen ? -0.6 : 0, toetsen: { raster: 5, kans: 0.7 } },
    vorm: { rMin: 0.5, binnen: 0.35, buiten: 0.25, plat: 1.15 },
  });
  if (bessen) {
    const m = mat.push({ ramp: 'rood', lo: 3.4, hi: 7.6, glans: 1.4, glansMacht: 12, detail: true, omslag: 0.3 }) - 1;
    const punten = [];
    for (let i = 0; punten.length < 18; i++) {
      const q = opKlomp(klompen, i, zaad);
      punten.push(q);
      // bessen groeien in trosjes van twee of drie
      if (i % 2 === 0) punten.push([q[0] + 2.2, q[1] + 1, q[2] - 1.4]);
    }
    delen.push(bollen(punten, 1.7, m, 5));
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// Een varen: bladen die uit het hart opkomen, overhellen en met de punt naar de grond buigen, met
// veertjes aan weerszijden die naar de punt toe kleiner worden en naar voren wijzen.
function varen(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 83);
  const n = o.n ?? 9;
  const mat = [];
  const delen = [];
  const vorm = [[0, 0, 9], [30, 30, 12]];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + R(i) * 0.5;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const L = 24 + R(10 + i) * 9;
    const op = 10 + R(20 + i) * 6;
    const W = 4.4 + R(30 + i) * 1.2;
    const N = 8;
    // de nerf in het midden donker
    const m = loof(mat, 'blad', zaad * 10 + i, { klomp: vorm, lo: 2.6, hi: 4.4, vorm: 1.6, diep: 0, toetsen: false, extra: (x, y) => (Math.abs(-x * sa + y * ca) < 0.7 ? -1 : 0) });
    const f = (x, y, z) => {
      const u = x * ca + y * sa;
      const s = -x * sa + y * ca;
      const t = klem(u / L, 0, 1);
      const c = 1 + op * Math.sin(Math.PI * t * 0.85) - 4 * t * t;
      const veer = Math.abs(Math.cos((t * N - (Math.abs(s) / W) * 0.7) * Math.PI));
      const w = W * Math.sin(Math.PI * Math.min(1, t * 1.06 + 0.03)) ** 0.5 * (0.4 + 0.6 * veer);
      return Math.max((Math.abs(z - c) - 0.8) * 0.6, (Math.abs(s) - w) * 0.8, Math.max(-u, u - L));
    };
    delen.push({ f, g: [ca * L * 0.5, sa * L * 0.5, op * 0.6, L * 0.5 + W + 6], m, deel: 1 + i });
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// Een pol gras: sprieten die uit één plek waaieren en overbuigen, samen één vorm met één
// omlijning. o.hoog: hoger, droog gras met aren.
function grasPol(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 85);
  const hoog = !!o.hoog;
  const n = hoog ? 15 : 30;
  const lijnen = [];
  const toppen = [];
  for (let i = 0; i < n; i++) {
    const a = R(i) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // de meeste sprieten staan rechtop en buigen pas bovenin over
    const over = hoog ? 0.15 + R(10 + i) ** 1.3 * 0.5 : 0.12 + R(10 + i) ** 1.4 * 0.55;
    const lengte = hoog ? 28 + R(20 + i) * 18 : 15 + R(20 + i) * 11;
    const spreid = hoog ? 6 : 6;
    const voet = [ca * R(30 + i) * spreid, sa * R(30 + i) * spreid, -1];
    const top = [voet[0] + ca * lengte * 0.7 * over, voet[1] + sa * lengte * 0.7 * over, lengte * (1 - 0.35 * over)];
    const mid = [voet[0] + ca * lengte * 0.08 * over, voet[1] + sa * lengte * 0.08 * over, lengte * 0.6];
    lijnen.push([bocht(voet, mid, top, 3), hoog ? [1.1, 0.9, 0.65, 0.35] : [1.3, 1.05, 0.75, 0.4]]);
    if (hoog && i % 3 === 0) toppen.push(top);
  }
  const mat = [];
  const vorm = [[0, 0, hoog ? 14 : 7], [hoog ? 18 : 14, hoog ? 18 : 14, hoog ? 18 : 10]];
  const m = loof(mat, hoog ? 'riet' : 'gras', zaad, { klomp: vorm, lo: hoog ? 2.2 : 2.4, hi: hoog ? 4.6 : 4.4, vorm: 1.4, diep: 0, toetsen: false, extra: (x, y, z) => z * 0.05 });
  const delen = [bundel(lijnen, m, 1, 0.6)];
  if (hoog) {
    const aar = mat.push({ ramp: 'stro', lo: 2, hi: 5.4, detail: true }) - 1;
    delen.push(bollen(toppen.map((t) => [t[0], t[1], t[2] + 2.5]), 1.2, aar, 2, [1, 1, 3]));
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// Een plekje bloemen: lage bladrozetten, stengels, en bloemhoofdjes in twee of drie kleuren, elk
// met een hartje.
const BLOEMKLEUREN = [['rood', 'baard', 'goud'], ['goud', 'magie'], ['baard', 'gewaad', 'rood']];
const BLOEMTOON = { rood: [3.6, 7.6], baard: [3.4, 7], goud: [3, 6.8], magie: [2.6, 6], gewaad: [3.4, 7.6] };
function bloemen(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 87);
  const kleuren = o.kleuren || BLOEMKLEUREN[(zaad - 1) % BLOEMKLEUREN.length];
  const mat = [];
  const delen = [];
  const blad = loof(mat, 'blad', zaad, { klomp: [[0, 0, 2], [22, 22, 6]], lo: 2.4, hi: 4.2, vorm: 1.2, diep: 0, toetsen: { raster: 4, kans: 0.6 } });
  // lage bladrozetjes en daartussen een paar smalle bladeren die opzij buigen
  for (let i = 0; i < 4; i++) {
    const a = R(i) * Math.PI * 2;
    const r = 3 + R(10 + i) * 11;
    delen.push(klomp([Math.cos(a) * r, Math.sin(a) * r, 1.2], [5, 5, 2.8], 3.5, blad, 1, zaad * 10 + i, { rMin: 0.5, plat: 1.4 }));
  }
  const smal = [];
  for (let i = 0; i < 9; i++) {
    const a = R(60 + i) * Math.PI * 2;
    const r = R(70 + i) * 14;
    const v = [Math.cos(a) * r, Math.sin(a) * r, 0];
    const l = 7 + R(80 + i) * 5;
    smal.push([bocht(v, [v[0] + Math.cos(a) * l * 0.3, v[1] + Math.sin(a) * l * 0.3, l * 0.7], [v[0] + Math.cos(a) * l, v[1] + Math.sin(a) * l, l * 0.35], 3), [1.3, 1.1, 0.8, 0.4]]);
  }
  delen.push(bundel(smal, blad, 1, 0.5));
  const hoofdjes = [];
  const n = o.n ?? 10;
  for (let i = 0; i < n; i++) {
    const a = R(20 + i) * Math.PI * 2;
    const r = Math.sqrt(R(30 + i)) * 18;
    hoofdjes.push({ p: [Math.cos(a) * r, Math.sin(a) * r, 7 + R(40 + i) * 8], kleur: i % kleuren.length, r: 2.3 + R(50 + i) * 0.7 });
  }
  const stengel = mat.push({ ramp: 'gras', lo: 2, hi: 4.4, detail: true }) - 1;
  delen.push(bundel(hoofdjes.map((b) => [[[b.p[0] * 0.8, b.p[1] * 0.8, 0], [b.p[0], b.p[1], b.p[2] - 0.5]], [0.65, 0.6]]), stengel, 2, 0));
  kleuren.forEach((ramp, k) => {
    const eigen = hoofdjes.filter((b) => b.kleur === k);
    if (!eigen.length) return;
    const hart = ramp === 'goud' ? 'hout' : 'goud';
    const [lo, hi] = BLOEMTOON[ramp] || [3, 7];
    const dichtste = (x, y, z) => eigen.reduce((a, b) => ((x - b.p[0]) ** 2 + (y - b.p[1]) ** 2 + (z - b.p[2]) ** 2 < (x - a.p[0]) ** 2 + (y - a.p[1]) ** 2 + (z - a.p[2]) ** 2 ? b : a));
    const m =
      mat.push({
        ramp,
        lo,
        hi,
        detail: true,
        omslag: 0.4,
        patroon: (x, y, z) => {
          const b = dichtste(x, y, z);
          return Math.hypot(x - b.p[0], y - b.p[1]) < b.r * 0.4 && z > b.p[2] ? { ramp: hart, stap: 5 } : 0;
        },
      }) - 1;
    delen.push(bollen(eigen.map((b) => b.p), 2.6, m, 3 + k, [1, 1, 0.45]));
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// Een groepje paddenstoelen. o.soort 'vlieg': rode hoed met witte stippen; 'bruin': bruine hoed.
function paddenstoelen(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 89);
  const soort = o.soort || (zaad % 2 ? 'vlieg' : 'bruin');
  const M = { steel: 0, hoed: 1, plaat: 2 };
  const mat = [];
  mat[M.steel] = { ramp: 'perkament', lo: 2.2, hi: 6.4, omslag: 0.3 };
  mat[M.hoed] =
    soort === 'vlieg'
      ? {
          ramp: 'rood',
          lo: 2.6,
          hi: 6.8,
          glans: 1,
          glansMacht: 10,
          detail: true,
          // witte stippen: kleine cellen op de hoed
          patroon: (x, y, z, nx, ny, nz) => {
            const c = 2.2;
            const X = x / c;
            const Y = y / c;
            const Z = z / c;
            const h = hash(Math.round(X), Math.round(Y), Math.round(Z) + 7);
            const d = Math.hypot(X - Math.round(X), Y - Math.round(Y), Z - Math.round(Z));
            return nz > 0 && h % 2 === 0 && d < 0.42 ? { ramp: 'baard', stap: nz > 0.5 ? 7 : 5 } : 0;
          },
        }
      : { ramp: 'hout', lo: 1.8, hi: 6.6, glans: 0.6, detail: true };
  mat[M.plaat] = { ramp: soort === 'vlieg' ? 'perkament' : 'jas', lo: 0.8, hi: 3.4 };
  const delen = [];
  const n = 3 + (zaad % 3);
  for (let i = 0; i < n; i++) {
    const groot = i === 0 ? 1 : 0.45 + R(i) * 0.4;
    const a = R(10 + i) * Math.PI * 2;
    const r = i === 0 ? 0 : 7 + R(20 + i) * 8;
    const p = [Math.cos(a) * r, Math.sin(a) * r];
    const h = 12 * groot + 1;
    const rh = 7.5 * groot;
    const scheef = [(R(30 + i) - 0.5) * 3 * groot, (R(40 + i) - 0.5) * 3 * groot];
    const top = [p[0] + scheef[0], p[1] + scheef[1], h];
    delen.push(kegelDeel([p[0], p[1], -1], top, 2.4 * groot + 0.5, 1.7 * groot + 0.4, M.steel, 1 + i));
    // hoed: een koepel met een holle onderkant waarin de plaatjes zitten
    const hc = [top[0], top[1], h - rh * 0.1];
    delen.push({
      f: (x, y, z) => Math.max(sdf.ellipsoide(x - hc[0], y - hc[1], z - hc[2], rh, rh, rh * (soort === 'vlieg' ? 0.62 : 0.7)), hc[2] + rh * 0.08 - z),
      g: [...hc, rh + 1],
      m: (x, y, z) => (z < hc[2] + rh * 0.08 + 0.6 ? M.plaat : M.hoed),
      deel: 10 + i,
    });
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}
const kegelDeel = (a, b, r1, r2, m, deel) => tak([a, b], [r1, r2], m, deel, 0);

// Een boomstronk: afgezaagd, met jaarringen op de schuine snede, wortels, en mos op de schaduwkant.
function boomstronk(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 95);
  const M = { schors: 0, hout: 1, mos: 2 };
  const mat = [];
  const hoogte = 17 + R(1) * 6;
  const r = 13 + R(2) * 2;
  const helling = [0.1 + R(3) * 0.08, (R(4) - 0.5) * 0.12];
  const snede = (x, y) => hoogte + helling[0] * x + helling[1] * y;
  mat[M.schors] = schorsMat({ zaad, lo: 0.9, hi: 5.2 });
  mat[M.hout] = {
    ramp: 'hout',
    lo: 2.6,
    hi: 6.6,
    patroon: (x, y) => {
      const rr = Math.hypot(x, y) + ruis3(x * 0.2, y * 0.2, 3, zaad) * 2.5;
      if (rr > r - 2) return -2.6;
      if (Math.abs(x * 0.8 - y * 0.4) < 0.6 && rr < r * 0.6) return -2;
      const ring = rr / 2.3 - Math.floor(rr / 2.3);
      return ring < 0.28 ? -1 : rr < 2 ? 0.8 : 0;
    },
  };
  mat[M.mos] = { ramp: 'mos', lo: 1.6, hi: 5.4, omslag: 0.4, patroon: (x, y, z) => (ruis3(x * 0.5, y * 0.5, z * 0.5, zaad + 4) > 0.62 ? 0.8 : 0) };
  const delen = [];
  delen.push({
    f: (x, y, z) => {
      const zij = Math.hypot(x, y) - r - 0.6 * Math.sin(Math.atan2(y, x) * 9) + Math.max(0, 6 - z) * 0.35;
      return Math.max(zij * 0.8, (z - snede(x, y)) * 0.95);
    },
    g: [0, 0, hoogte / 2, r + hoogte / 2 + 4],
    // de snede is hout, de zijkant schors, en aan de schaduwkant onderaan mos
    m: (x, y, z) => {
      if (z > snede(x, y) - 0.7 && Math.hypot(x, y) < r - 0.3) return M.hout;
      if (x < -3 && z < hoogte * 0.7 && ruis3(x * 0.25, y * 0.25, z * 0.25, zaad + 9) > 0.45) return M.mos;
      return M.schors;
    },
    deel: 1,
  });
  wortels(delen, 5, zaad, { lengte: [20, 28], straal: 6.5, hoogte: 11 });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// Een rots met mos erop: een ellips met platte vlakken erafgeslepen, wat ruwheid, groeven, en mos
// waar het vlak naar boven kijkt. o.klein: een kleine steen.
function rots(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 97);
  const s = o.klein ? 0.48 : 1;
  const M = { steen: 0, mos: 1 };
  const mat = [];
  mat[M.steen] = {
    ramp: 'steen',
    lo: 1.4,
    hi: 6.4,
    omslag: 0.1,
    patroon: (x, y, z, nx, ny, nz) => {
      // mos als een kap op wat naar boven kijkt, met een rafelige rand
      const mos = nz + (ruis3((x * 0.22) / s, (y * 0.22) / s, (z * 0.22) / s, zaad + 3) - 0.5) * 0.45;
      if (mos > 0.62) return { ramp: 'mos', plus: -1.2 + (mos > 0.86 ? 0.5 : 0) };
      // een paar barsten: hoogtelijnen van ruis
      const n = ruis3((x * 0.2) / s, (y * 0.2) / s, (z * 0.2) / s, zaad);
      if (Math.abs(n - 0.5) < 0.022) return -1.6;
      return 0;
    },
  };
  const a = [26 * s, 21 * s, 17 * s];
  const c = [0, 0, 8 * s];
  const vlakken = [];
  for (let i = 0; i < 6; i++) {
    const t = R(i) * Math.PI * 2;
    const h = i === 0 ? 1 : R(10 + i) * 0.9 - 0.1;
    const w = Math.sqrt(1 - h * h);
    const nv = [Math.cos(t) * w, Math.sin(t) * w, h];
    vlakken.push([nv, (0.62 + R(20 + i) * 0.2) * Math.hypot(nv[0] * a[0], nv[1] * a[1], nv[2] * a[2])]);
  }
  // platte vlakken met een smalle afronding: zo krijgt de steen facetten die elk één tint dragen
  const f0 = (x, y, z) => {
    const px = x - c[0];
    const py = y - c[1];
    const pz = z - c[2];
    let d = sdf.ellipsoide(px, py, pz, a[0], a[1], a[2]);
    for (const [nv, off] of vlakken) d = zachtMax(d, px * nv[0] + py * nv[1] + pz * nv[2] - off, 1.6 * s);
    return d;
  };
  const delen = [{ f: f0, g: [...c, Math.max(...a) + 1], m: M.steen, deel: 1 }];
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- grasvloer

// Plukjes gras als stempels op het pixelraster: 'L' twee tinten lichter (de punten), 'l' één
// lichter, 'd' één donkerder (de schaduw eronder). De onderste regel ligt op het ankerpunt.
const stempel = (regels) => {
  const pix = [];
  const h = regels.length;
  regels.forEach((r, j) => [...r].forEach((c, i) => c !== '.' && pix.push([i, j - h + 1, c === 'L' ? 2 : c === 'l' ? 1 : -1])));
  return pix;
};
const PLUKJES = [
  ['L.L', 'lLl', 'ddd'],
  ['.L..', 'lLl.', 'llLl', '.ddd'],
  ['L..L', 'l.Ll', 'llll', 'dddd'],
  ['L.', 'lL', 'dd'],
  ['.L.L.', 'L.l.l', 'lllll', '.ddd.'],
  ['..L', 'L.l', 'lll', 'ddd'],
].map(stempel);
// bloemetjes: w = blad (wit of geel), c = hart, d = schaduw in het gras
const BLOEMPJES = [
  ['.w.', 'wcw', '.wd'],
  ['w.w', '.c.', 'w.w', '..d'],
].map((regels) => {
  const pix = [];
  const h = regels.length;
  regels.forEach((r, j) => [...r].forEach((c, i) => c !== '.' && pix.push([i, j - h + 1, c])));
  return pix;
});

// Zoekt op het raster (cellen cb × ch pixels, één kans per cel) of pixel (u, v) onder een stempel
// valt; stempels steken naar rechts en naar boven uit hun ankerpunt. Geeft het teken of null.
function opStempel(u, v, cb, ch, zaad, kans, stempels) {
  const cu = Math.floor(u / cb);
  const cv = Math.floor(v / ch);
  for (let j = 0; j <= 1; j++) {
    for (let i = -1; i <= 0; i++) {
      const h = hash(cu + i, cv + j, zaad);
      if ((h & 1023) / 1024 >= kans) continue;
      const st = stempels[(h >>> 10) % stempels.length];
      const au = (cu + i) * cb + ((h >>> 14) % cb);
      const av = (cv + j) * ch + ((h >>> 20) % ch);
      for (const [du, dv, t] of st) if (au + du === u && av + dv === v) return [t, h];
    }
  }
  return null;
}

// Gras als vloer voor dozen, zoals zandVloer in kamers.cjs: grasgroen in grote vlekken, plukjes
// sprieten als stempels, hier en daar een bloemetje. Alleen hele stappen: het licht doet de rest.
// De zijkanten zijn aarde met een overhangende graszoom, steentjes en worteltjes. o.pad(gx, gy)
// geeft de afstand tot het midden van een zandpad in tegels; o.padBreed is de halve breedte.
function grasVloer(o = {}) {
  const padBreed = o.padBreed ?? 0.32;
  return (vlak, X, Y, Z, px, py, doos) => {
    const gx = X / TEGEL;
    const gy = Y / TEGEL;
    UIT.vlag = 0;
    if (vlak !== 'z') {
      zijkant(vlak, X, Y, Z, doos);
      return;
    }
    // pixels in de wereld: zo ligt het patroon vast op de grond, ook als een tegel los wordt gemaakt
    const u = Math.floor((gx - gy) * 32 + 1e-3);
    const v = Math.floor((gx + gy) * 16 + 1e-3);
    // een zandpad, met een rafelige graskant
    if (o.pad) {
      const d = o.pad(gx, gy) + (ruis2(gx * 5, gy * 5, 29) - 0.5) * 0.14;
      if (d < padBreed) {
        UIT.ramp = RAMP.aarde;
        let s = 3.4 + (ruis2(gx * 3, gy * 3, 31) > 0.62 ? 0.6 : 0);
        if (d > padBreed - 0.05) s -= 0.8;
        const st = opStempel(u, v, 6, 5, 33, 0.22, [stempel(['l.', 'ld']), stempel(['ll', 'dd']), stempel(['.l', 'ld'])]);
        if (st) {
          UIT.ramp = RAMP.steen;
          s = st[0] === 1 ? 4.6 : 2.6;
        }
        UIT.stap = Math.round(s);
        return;
      }
      if (d < padBreed + 0.06 && (u + v) % 2 === 0) {
        UIT.ramp = RAMP.gras;
        UIT.stap = 3;
        return;
      }
    }
    // grote vlekken lichter en donkerder gras, met een smalle dambordrand zoals de kern die ook
    // tussen twee tinten zet
    let s = 4;
    const n = ruis2(gx * 1.4 + 7, gy * 1.4 + 3, 17);
    const dam = (u + v) % 2 === 0;
    if (n > 0.68 + (dam ? -0.012 : 0.012)) s = 5;
    else if (n < 0.3 + (dam ? 0.012 : -0.012)) s = 3;
    UIT.ramp = RAMP.gras;
    const pl = opStempel(u, v, 7, 5, 23, 0.56, PLUKJES);
    if (pl) s += pl[0];
    const bl = !pl && (o.bloemen ?? true) ? opStempel(u, v, 23, 13, 41, 0.3, BLOEMPJES) : null;
    if (bl) {
      const geel = bl[1] % 3 === 0;
      if (bl[0] === 'w') {
        UIT.ramp = geel ? RAMP.goud : RAMP.baard;
        s = geel ? 6 : 7;
      } else if (bl[0] === 'c') {
        UIT.ramp = geel ? RAMP.hout : RAMP.goud;
        s = geel ? 4 : 6;
      } else s -= 1;
    }
    UIT.stap = s;
    if (o.extra) o.extra(gx, gy, px, py, u, v);
  };
}

// De zijkant van een grasplaat: bovenaan een zoom gras die over de rand hangt, dan aarde met
// lagen, steentjes en worteltjes, naar onderen donkerder.
function zijkant(vlak, X, Y, Z, doos) {
  const U = vlak === 'y' ? X * Math.SQRT1_2 : -Y * Math.SQRT1_2;
  const ui = Math.floor(U + 1e-3);
  const diep = Math.floor((doos.z1 - Z) * PXH + 1e-3);
  const dikte = Math.round((doos.z1 - doos.z0) * PXH);
  const basis = vlak === 'y' ? 3 : 2;
  const zoom = 2 + (hash(ui, 5, 31) % 3 === 0 ? 1 : 0) + (hash(ui >> 1, 6, 31) % 7 === 0 ? 2 : 0);
  if (diep < zoom) {
    UIT.ramp = RAMP.gras;
    UIT.stap = diep === 0 ? basis + 2 : diep === zoom - 1 ? basis : basis + 1;
    return;
  }
  UIT.ramp = RAMP.aarde;
  let s = basis + (diep < zoom + 2 ? -1 : 0);
  const laag = Math.floor((diep + (hash(ui >> 3, 7, 31) % 3)) / 5);
  if (laag % 2 === 1) s += 0.4;
  const h = hash(ui >> 1, (diep + 1) >> 1, 37);
  if (h % 37 === 0 && diep > zoom + 1) {
    UIT.ramp = RAMP.steen;
    s = basis + ((diep + 1) % 2 ? 2 : 0.5);
  } else if (hash(ui, diep, 39) % 29 === 0) s -= 1;
  // een worteltje: een schuin lijntje donker
  const w = hash(Math.floor((ui + diep) / 9), 8, 41);
  if (w % 5 === 0 && (ui + diep) % 9 === w % 9 && diep > zoom && diep < zoom + 6) {
    UIT.ramp = RAMP.hout;
    s = 1.6;
  }
  if (diep >= dikte - 2) s -= 0.8;
  UIT.stap = Math.round(s);
}

// ---------------------------------------------------------------- schaduw buiten

// Slagschaduw van een model op wat eronder ligt (gras en andere modellen): vanaf elke pixel in de
// buurt naar het hoofdlicht kijken of het model ertussen staat. Anders dan schaduwOpVloer in de
// kern reikt dit tot de kroon: eerst de grensbol van het model, dan stappen door het model.
function slagschaduw(B, model, o = {}) {
  const Ox = (o.gx || 0) * TEGEL;
  const Oy = (o.gy || 0) * TEGEL;
  const graden = typeof o.richting === 'number' ? o.richting : K.RICHTING[o.richting || 'Z'];
  const hoek = (graden * Math.PI) / 180;
  const fx = Math.cos(hoek);
  const fy = Math.sin(hoek);
  const rx = -fy;
  const ry = fx;
  const L = [K.LICHT[0] * rx + K.LICHT[1] * ry, K.LICHT[0] * fx + K.LICHT[1] * fy, K.LICHT[2]];
  const [mx, my, mz] = model.midden;
  const R = model.straal;
  const sterk = o.sterkte ?? 1;
  const voet = o.voet ?? 0;
  // waar de schaduw van de grensbol valt op een vlak op hoogte zp, op het scherm; het vak moet
  // alles tussen de grond en de top van het model dekken
  const schaduwMidden = (zp) => {
    const t = (mz - zp) / L[2];
    const cxl = mx - L[0] * t;
    const cyl = my - L[1] * t;
    return K.naarScherm(B, Ox + cxl * rx + cyl * fx, Oy + cxl * ry + cyl * fy, zp);
  };
  const [ax, ay] = schaduwMidden(0);
  const [bx, by] = schaduwMidden(mz + R);
  const r = R / L[2] + 12;
  const eigen = o.obj;
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - r * 1.2));
  const x1 = Math.min(B.b - 1, Math.ceil(Math.max(ax, bx) + r * 1.2));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - r * 0.8));
  const y1 = Math.min(B.h - 1, Math.ceil(Math.max(ay, by) + r * 0.8));
  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      const i = py * B.b + px;
      if (B.ramp[i] < 0 || B.vlag[i] & (VLAG.GLOEI | VLAG.VAST) || (eigen && B.obj[i] === eigen)) continue;
      const dx = B.pos[i * 3] - Ox;
      const dy = B.pos[i * 3 + 1] - Oy;
      const x = dx * rx + dy * ry;
      const y = dx * fx + dy * fy;
      const z = B.pos[i * 3 + 2] + 0.4;
      // een donkere plek om de voet
      if (voet && B.vlag[i] & VLAG.VLOER) {
        const r2 = (x * x + y * y) / (voet * voet);
        if (r2 < 1) B.stap[i] -= r2 < 0.45 ? 1 : 0.6;
      }
      // straal naar het licht tegen de grensbol
      const ox = x - mx;
      const oy = y - my;
      const oz = z - mz;
      const b = ox * L[0] + oy * L[1] + oz * L[2];
      const c = ox * ox + oy * oy + oz * oz - R * R;
      const disc = b * b - c;
      if (disc < 0) continue;
      const w = Math.sqrt(disc);
      let s = Math.max(1, -b - w);
      const eind = -b + w;
      for (let k = 0; k < 120 && s < eind; k++) {
        const d = model.sdf(x + L[0] * s, y + L[1] * s, z + L[2] * s);
        if (d < 0.15) {
          B.stap[i] -= sterk;
          break;
        }
        s += Math.max(d * 0.85, 0.4);
      }
    }
  }
}

// Een model buiten neerzetten: tekenen, en onthouden wat slagschaduw straks nodig heeft. Eerst
// alles zetten en dan pas de schaduwen, dan valt de schaduw van een boom ook op de struik eronder.
function zetBuiten(B, model, gx, gy, o = {}) {
  const obj = B.volgendObj;
  K.tekenModel(B, model, { gx, gy, richting: o.richting || 'Z', z: o.z || 0 });
  return { model, gx, gy, obj, voet: o.voet, sterkte: o.sterkte };
}

// ---------------------------------------------------------------- nabewerking

// Losse pixels weghalen: een pixel zonder één buur (ook schuin) in dezelfde kleur krijgt de kleur
// die rondom het meest voorkomt. Alleen in de rampen van loof en gras, zodat bewuste stipjes
// (een appel, een bloem) blijven. masker (optioneel, per pixel): alleen waar het 1 is, zodat in
// een scène de gestempelde grasvloer met zijn puntjes blijft zoals hij is.
function ontspikkel(plaat, rampen = ['blad', 'den', 'herfst', 'gras', 'mos', 'goud', 'riet'], masker = null) {
  const doel = new Set(rampen.map((r) => K.RAMP[r]));
  const { b, h } = plaat;
  const bron = Int16Array.from(plaat.px);
  const kleur = (x, y) => (x < 0 || y < 0 || x >= b || y >= h || bron[(y * b + x) * 2] < 0 ? -1 : bron[(y * b + x) * 2] * 64 + bron[(y * b + x) * 2 + 1]);
  let n = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const i = (y * b + x) * 2;
      if (bron[i] < 0 || !doel.has(bron[i]) || (masker && !masker[y * b + x])) continue;
      const c = kleur(x, y);
      let zelfde = false;
      const tel = new Map();
      let vol = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue;
          const k = kleur(x + dx, y + dy);
          if (k === c) zelfde = true;
          if (k >= 0 && (dx === 0 || dy === 0)) {
            vol++;
            tel.set(k, (tel.get(k) || 0) + 1);
          }
        }
      }
      if (zelfde || vol < 3) continue;
      let beste = -1;
      let max = 0;
      for (const [k, v] of tel) {
        if (v > max || (v === max && Math.abs((k % 64) - (c % 64)) < Math.abs((beste % 64) - (c % 64)))) {
          max = v;
          beste = k;
        }
      }
      if (beste >= 0 && Math.floor(beste / 64) === bron[i]) {
        plaat.px[i + 1] = beste % 64;
        n++;
      }
    }
  }
  return n;
}

// de varianten onder een eigen naam, voor lijsten en scènes
const bessenStruik = (zaad = 1, o = {}) => struik(zaad, { ...o, bessen: true });
const hoogGras = (zaad = 1, o = {}) => grasPol(zaad, { ...o, hoog: true });
const kleineRots = (zaad = 1, o = {}) => rots(zaad, { ...o, klein: true });

const BEGROEIING = ['struik', 'bessenStruik', 'varen', 'grasPol', 'hoogGras', 'bloemen', 'paddenstoelen', 'boomstronk', 'rots', 'kleineRots'];

module.exports = {
  eik,
  herfstEik,
  den,
  berk,
  dodeBoom,
  wilg,
  appelboom,
  struik,
  bessenStruik,
  varen,
  grasPol,
  hoogGras,
  bloemen,
  paddenstoelen,
  boomstronk,
  rots,
  kleineRots,
  BEGROEIING,
  grasVloer,
  slagschaduw,
  zetBuiten,
  ontspikkel,
  bultig,
  klomp,
  kroon,
  tak,
  bocht,
  omhul,
  loofMat,
  schorsMat,
  roosterBollen,
  zachtMin,
  zachtMax,
  onderGrond,
  assenVoor,
};
