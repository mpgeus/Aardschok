// Bomen en begroeiing voor buiten: het dorp en het bos ernaast, op dezelfde manier gemaakt als de
// figuren. Loof bestaat uit klompen: een vorm met bulten van bollen op een rooster. Zo krijgt elke
// klomp vanzelf een geschulpte rand en donkere naden. Daarbovenop komt de vorm van de klomp en de
// kroon in het licht (anders is elke bult even licht en wordt de kroon broccoli), en blaadjes die
// als toetsen op het pixelraster staan, zoals een tekenaar ze zet.
//
// Verder: een boompje en jonge bomen (JONG), struiken, varens, gras, bloemen, paddenstoelen, een
// stronk en stenen; een grasvloer voor dozen (zoals zandVloer in kamers.cjs); slagschaduw die tot
// een hoge kroon reikt; en ontspikkel, dat losse pixels in loof weghaalt. Alles staat met de voet op
// het midden van de tegel en is gemaakt voor richting 'Z': het licht op de vorm en de blaadjes
// rekenen met die kant.
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
// naalden van een spar: langere schuine streepjes, naar rechts omlaag (en gespiegeld naar links)
const STREEPJES_RECHTS = [
  [[0, 0], [1, 0], [2, 1], [3, 1], [4, 2]],
  [[0, 0], [1, 1], [2, 1], [3, 2]],
  [[0, 0], [1, 0], [2, 0], [3, 1], [4, 1], [5, 2]],
];
const STREEPJES_LINKS = STREEPJES_RECHTS.map((v) => v.map(([x, y]) => [5 - x, y]));
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
  // rampen verschillen in lengte en helderheid: zo vallen ze op dezelfde toon (de bloesem en het wit van de meidoorn
  // lichter, anders is het grijs)
  const rampPlus = { stro: -0.9, rood: 0.7, goud: -0.5, bloesem: 1, baard: 1.6 };
  for (let i = 0; i < n; i++) {
    const zz = mix(z0, z1, (i + 0.5) / n);
    const rr = Math.sqrt(Math.max(0, 1 - zz * zz));
    const phi = i * 2.39996 + R(i) * 0.6;
    const p = [C[0] + RK[0] * ver * rr * Math.cos(phi), C[1] + RK[1] * ver * rr * Math.sin(phi), C[2] + RK[2] * ver * zz];
    const r = mix(rMin, rMax, R(i + 50));
    const s = [r, r, r * (o.hoog ?? 0.86)];
    if (o.hang) s[2] *= 1 + o.hang * (1 - zz) * 0.5;
    // o.kaal (de winter): alleen waar de klompen zouden zitten, voor de takken; o.weg: deze klompen niet (een oude
    // boom met gaten in zijn kroon), maar zijn tak gaat er wel heen
    if (o.kaal || o.weg?.includes(i)) {
      klompen.push([p, r, zz]);
      continue;
    }
    const ramp = rampVan(i);
    const m = loof(mat, ramp, zaad * 100 + i, { klomp: [p, s], kroon: [C, RK], ...o.loof, plus: (R(70 + i) - 0.5) * 0.6 + (rampPlus[ramp] || 0) + (o.loof?.plus ?? 0) });
    delen.push(klomp(p, s, L, m, o.eenDeel ? deel : deel + i, zaad * 100 + i, o.vorm));
    klompen.push([p, r, zz]);
  }
  if (o.kern !== false && !o.kaal) {
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
function berkMat(zaad, hoog = 1) {
  return {
    ramp: 'berk',
    lo: 1.2,
    hi: 5.6,
    omslag: 0.25,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      // de voet reikt zo hoog als de boom groot is (hoog: zie JONG)
      const voet = ruis3(x * 0.25, y * 0.25, z * 0.12, zaad) - (z / hoog - 8) / 34;
      if (voet > 0.55) return { ramp: 'schors', stap: klem(stap - 3.2, 0.6, 2.4) };
      const streep = ruis3(x * 0.3, y * 0.3, z * 2, zaad + 1);
      if (streep > 0.76) return { ramp: 'schors', stap: klem(stap - 3.4, 0.8, 2) };
      const vlek = ruis3(x * 0.16, y * 0.16, z * 0.3, zaad + 2);
      if (vlek > 0.8) return -2;
      return 0;
    },
  };
}

// ---------------------------------------------------------------- jonge bomen

// De houthakker plant een boompje naast elke stronk, en dat groeit in een jaar of twee via een
// jonge boom tot een boom (vraag 115, f). Een jonge eik, den of berk (o.jong) is dezelfde boom uit
// hetzelfde zaad, maar zo'n drie vijfde zo hoog, smaller, met een dunnere stam en een kleinere,
// lichtere kroon van minder klompen. hoog, breed en dik (en twijg: de takjes van de berk) zijn
// factoren op de maten van de volwassen boom; vol rekent overal met 1, zodat een volwassen boom
// pixel voor pixel blijft wat hij was. Verder hoeveel wortels hij heeft, bij de eik de opties van
// zijn kroon en tot welke klompen zijn takken reiken (takTot), en bij de den en de berk de opties
// die ze al hadden.
const JONG = {
  vol: { hoog: 1, breed: 1, dik: 1, twijg: 1 },
  eik: { hoog: 0.6, breed: 0.5, dik: 0.5, wortels: 4, takTot: 0.6, kroon: { n: 7, straal: [16, 21], bult: 10, ver: 0.78, kern: false } },
  den: { hoog: 0.6, breed: 0.6, dik: 0.6, wortels: 4, opties: { kransen: 11, onder: 44, breed: 56, bult: 2.2 } },
  berk: { hoog: 0.6, breed: 0.6, dik: 0.55, twijg: 0.7, opties: { hoogte: 114, RK: [32, 31, 48], n: 10, straal: [9, 13], bult: 9 } },
};

// Een boompje dat net geplant is: een dun stammetje met een paar takjes en een handvol blad, zo'n
// halve mens hoog. Er is nog geen soort aan te zien.
function boompje(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 97);
  const mat = [schorsMat({ zaad, lo: 1.2, hi: 5 })];
  const delen = [];
  const top = [R(1) * 3 - 1.5, R(2) * 3 - 1.5, 35];
  const stam = bocht([0, 0, -2], [R(3) * 2 - 1, R(4) * 2 - 1, 16], top, 4);
  delen.push(tak(stam, [1.4, 1.2, 1, 0.85, 0.7], 0, 1, 0.4));
  // takjes: om en om schuin omhoog uit de bovenste helft, elk met een plukje blad aan het eind
  const plukjes = [[top, 3.6]];
  const n = 5;
  for (let i = 0; i < n; i++) {
    const a = i * 2.4 + R(10 + i) * 0.8;
    const van = langs(stam[1], top, 0.2 + (i / n) * 0.7);
    const l = 7 + R(20 + i) * 2 - i * 0.6;
    const eind = [van[0] + Math.cos(a) * l, van[1] + Math.sin(a) * l, van[2] + 6 + R(30 + i) * 3];
    delen.push(tak([van, eind], [0.6, 0.45], 0, 2, 0.3));
    plukjes.push([eind, 2.8 + R(40 + i) * 1]);
  }
  const C = [top[0], top[1], 26];
  const RK = [12, 12, 12];
  plukjes.forEach(([p, r], i) => {
    const s = [r * 1.15, r * 1.15, r * 0.86];
    const m = loof(mat, 'blad', zaad * 10 + i, { klomp: [p, s], kroon: [C, RK], lo: 2.4, hi: 4.2, plus: 0.3, toetsen: { raster: 5, kans: 0.6 } });
    delen.push(klomp(p, s, 3.5, m, 10 + i, zaad * 10 + i, { rMin: 0.5 }));
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- het jaar

// Een boom in zijn seizoen (werklijst vraag 148, b; Marcel, 9 okt: "vegetatie en bomen met seizoenen mee. Ook vruchten
// etc."): in de lente jong blad of bloesem, in de zomer vol, in de herfst geel, oranje en rood, en in de winter kaal.
// o.seizoen is een van SEIZOENEN; zonder seizoen is een boom wat hij altijd was (de zomer, of bij de herfsteik de
// herfst), pixel voor pixel. De kale kroon heeft zijn takken naar dezelfde klompen als de zomer, dus het blijft dezelfde
// boom, en hetzelfde zaad geeft in elk seizoen hetzelfde silhouet.
const SEIZOENEN = ['lente', 'zomer', 'herfst', 'winter'];

// De ramp van klomp i uit een lijst, met vaste tussenpozen, verschoven per zaad (zoals de herfsteik): een lijst als
// ['herfst', 'goud'] geeft een kroon die vooral uit de eerste bestaat. Een enkele naam is die naam.
function bladRamp(rampen, zaad) {
  if (typeof rampen === 'string') return rampen;
  if (rampen.length === 1) return rampen[0];
  return (i) => rampen[(i * 7 + zaad * 3) % rampen.length];
}

// Een kale kroon: van waar de tak begint (o.van, standaard de vork) een tak naar elke klomp die de zomer heeft, en daar
// takjes naar buiten tot net over de rand van de klomp, elk met twijgjes, en twijgjes daaraan: zo wordt de rand van de
// kroon een waas van fijne takjes, met het silhouet van de zomer. Per klomp één deel (een bundel), zodat honderd takjes
// niet honderd grensbollen kosten. o.dik: factor op de stralen; o.tak: false voor wie zijn takken al heeft (de berk);
// o.takjes: hoeveel takjes per klomp.
function kaleKroon(delen, m, vork, klompen, C, zaad, o = {}) {
  const dik = o.dik ?? 1;
  const R = (() => {
    let i = 0;
    return () => rnd(zaad, i++, 83);
  })();
  const eenheid = (v) => {
    const l = Math.hypot(...v) || 1;
    return v.map((x) => x / l);
  };
  const plus = (a, r, l) => [a[0] + r[0] * l, a[1] + r[1] * l, a[2] + r[2] * l];
  const draai = (r, w) => eenheid([r[0] + (R() - 0.5) * w, r[1] + (R() - 0.5) * w, r[2] + (R() - 0.3) * w]);
  klompen.forEach(([p, r]) => {
    const van = o.van ? o.van(p) : vork;
    const lijnen = [];
    const arm = bocht(van, [mix(van[0], p[0], 0.5) + (R() - 0.5) * r * 0.4, mix(van[1], p[1], 0.5) + (R() - 0.5) * r * 0.4, mix(van[2], p[2], 0.35)], p, 4);
    if (o.tak !== false) lijnen.push([arm, [5.2, 4.2, 3.3, 2.6, 2].map((s) => s * dik)]);
    const n = (o.takjes ?? 5) + (R() > 0.5 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const begin = k < 2 ? p : arm[2 + (k % 2)];
      // weg van het midden van de kroon, en omhoog
      const uit = eenheid([p[0] - C[0] + (R() - 0.5) * r * 2, p[1] - C[1] + (R() - 0.5) * r * 2, p[2] - C[2] + r * (0.4 + R() * 0.8)]);
      const l = r * (0.9 + R() * 0.45);
      const eind = plus(begin, uit, l);
      const takje = bocht(begin, [mix(begin[0], eind[0], 0.5) + (R() - 0.5) * 5, mix(begin[1], eind[1], 0.5) + (R() - 0.5) * 5, mix(begin[2], eind[2], 0.5) - 2], eind, 3);
      lijnen.push([takje, [2, 1.5, 1.1, 0.8].map((s) => Math.max(0.7, s * dik))]);
      // twijgjes van het takje, en aan elk twijgje nog twee kleine
      for (let j = 1; j <= 3; j++) {
        const a = takje[j];
        const tr = draai(uit, 1.4);
        const lt = l * (0.38 + R() * 0.22);
        const b = plus(a, tr, lt);
        lijnen.push([[a, b], [0.95, 0.75]]);
        for (let q = 0; q < 2; q++) lijnen.push([[b, plus(b, draai(tr, 1.2), lt * (0.45 + R() * 0.25))], [0.75, 0.7]]);
      }
    }
    delen.push(bundel(lijnen, m, 2, 0.6));
  });
}

// Sneeuw (vraag 144, 4b; Marcel, 9 okt: "Sneeuw moet ook nog op bomen, huizen etc."): wat naar boven kijkt, is wit, met
// een rafelige grens uit ruis. Om de materialen van een heel model heen, zodat elk deel sneeuw draagt waar het boven ligt:
// de takken, de lagen van een den, de knot van een knotwilg, de bulten van een struik. o.dikte: hoe ver de sneeuw van
// boven naar de zijkant reikt (0 tot 1); zonder: die van het model (mdl.sneeuwDikte), of 0,45. Geeft het model terug.
function sneeuw(mdl, o = {}) {
  const grens = 1 - (o.dikte ?? mdl.sneeuwDikte ?? 0.45);
  const zaad = o.zaad ?? 5;
  for (const m of mdl.mat) {
    if (!m || m.gloei) continue;
    const eerder = m.patroon;
    const lo = m.lo ?? 0;
    const hi = m.hi ?? 6;
    m.patroon = (x, y, z, nx, ny, nz, stap) => {
      const ruw = ruis3(x * 0.3, y * 0.3, z * 0.3, zaad) - 0.5;
      if (nz > grens + ruw * 0.4) return { ramp: 'baard', stap: 2.4 + klem((stap - lo) / (hi - lo || 1), 0, 1) * 4.4 };
      return eerder ? eerder(x, y, z, nx, ny, nz, stap) : 0;
    };
  }
  return mdl;
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

// De vormen van een eik (vraag 148, a: "elke boom anders"): o.vorm. Zonder vorm is hij wat hij was. Een vorm zet factoren
// op zijn maten en doet er een paar dingen bij: breed en hoog op de kroon, dik op de stam, vork op de hoogte van de vork,
// scheef: hoe ver de vork uit het midden staat (in plaats van het lot), klompen: zoveel meer of minder, takTot: tot welke
// klompen je de takken ziet, tweede: een tweede stam, weg: zoveel gaten in de kroon, stomp: een afgebroken dode tak,
// hol: een holte in de stam.
const EIK_VORMEN = {
  breed: { breed: 1.22, hoog: 0.84, dik: 1.18, vork: 0.82, klompen: 3, takTot: 0.35 },
  hoog: { breed: 0.8, hoog: 1.16, dik: 0.9, vork: 1.3, klompen: -1 },
  scheef: { scheef: 30, takTot: 0.3 },
  tweestam: { tweede: true, breed: 1.12, takTot: 0.3 },
  oud: { dik: 1.4, breed: 1.06, hoog: 0.94, weg: 4, stomp: true, hol: true, takTot: 0.45 },
};

// Een eik: dikke stam met uitwaaierende wortels, een brede kroon van klompen, en takken die je
// tussen de klompen door ziet. o.herfst (of o.seizoen 'herfst'): bruin, oranje en rood blad, en blad
// op de grond; o.seizoen 'lente': jong blad, 'winter': kaal. o.vorm: zie EIK_VORMEN. o.jong: een jonge eik uit hetzelfde zaad
// (jongeEik), zie JONG.
function eik(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 17);
  const seizoen = o.seizoen || (o.herfst ? 'herfst' : 'zomer');
  const herfst = seizoen === 'herfst';
  const kaal = seizoen === 'winter';
  const J = o.jong ? JONG.eik : JONG.vol;
  const V = EIK_VORMEN[o.vorm] || {};
  const dik = J.dik * (V.dik ?? 1);
  const mat = [schorsMat({ zaad })];
  const delen = [];
  let scheef = [(R(1) * 16 - 8) * J.breed, (R(2) * 16 - 8) * J.breed];
  if (V.scheef) {
    const a = Math.atan2(scheef[1], scheef[0]);
    scheef = [Math.cos(a) * V.scheef, Math.sin(a) * V.scheef];
  }
  // het zaad bepaalt ook de maat: een lage brede eik of een hogere smallere
  const breed = (0.9 + R(5) * 0.2) * J.breed * (V.breed ?? 1);
  const hoog = (0.92 + R(6) * 0.16) * J.hoog * (V.hoog ?? 1);
  const vork = [scheef[0], scheef[1], (66 + R(3) * 14) * hoog * (V.vork ?? 1)];
  delen.push(tak(bocht([0, 0, -3], [scheef[0] * 0.1 + R(4) * 6 * J.breed - 3 * J.breed, scheef[1] * 0.1, 34 * J.hoog], vork, 5), [14, 11, 9.8, 9.2, 8.8, 8.4].map((r) => r * dik), 0, 1, 3 * dik));
  wortels(delen, J.wortels ?? 6, zaad, { lengte: [22 * J.breed, 32 * J.breed], straal: 7.5 * dik, hoogte: 22 * J.hoog });
  const C = [scheef[0], scheef[1], 152 * hoog];
  // een tweede stam, dunner, van naast de voet schuin naar buiten; de kroon schuift ertussen
  let vork2 = null;
  if (V.tweede) {
    // opzij en iets naar de kijker toe (+y), anders staat hij achter de eerste
    const a = (R(8) > 0.5 ? 0 : Math.PI) + (R(9) - 0.5) * 0.6 + (R(8) > 0.5 ? 0.35 : -0.35);
    vork2 = [vork[0] + Math.cos(a) * 54, vork[1] + Math.sin(a) * 54, vork[2] * 0.8];
    delen.push(tak(bocht([Math.cos(a) * 6, Math.sin(a) * 6, -3], [Math.cos(a) * 12, Math.sin(a) * 12, 30], vork2, 5), [10, 8, 7, 6.6, 6.2, 6].map((r) => r * dik), 0, 1, 2.5 * dik));
    C[0] = (vork[0] + vork2[0]) / 2;
    C[1] = (vork[1] + vork2[1]) / 2;
  }
  const RK = [84 * breed, 80 * breed, (54 + R(7) * 8) * hoog];
  // herfst: vooral oranje, met vaste tussenpozen een gele en een rode klomp, verschoven per zaad; lente: jong blad, met
  // hier en daar een klomp die al donkerder is
  const ramp = herfst ? (i) => ((i + zaad) % 6 === 2 ? 'goud' : (i + 2 * zaad) % 9 === 4 ? 'rood' : 'herfst') : seizoen === 'lente' ? (i) => ((i + zaad) % 5 === 1 ? 'blad' : 'lente') : 'blad';
  const n = 11 + (zaad % 3) + (V.klompen ?? 0);
  const weg = V.weg ? Array.from({ length: V.weg }, (_, k) => Math.floor(R(60 + k) * n)) : undefined;
  const klompen = kroon(delen, mat, { C, RK, n, zaad, ramp, loof: o.loof, ...J.kroon, kaal, weg });
  const vorkVoor = (p) => (vork2 && Math.hypot(p[0] - vork2[0], p[1] - vork2[1]) < Math.hypot(p[0] - vork[0], p[1] - vork[1]) ? vork2 : vork);
  if (kaal) {
    kaleKroon(delen, 0, vork, klompen, C, zaad, { dik: dik * 1.1, van: vorkVoor });
  } else {
    // takken van de vork naar de onderste klompen (bij een jonge eik naar meer: zijn kroon is open)
    for (const [p, , zz] of klompen) {
      if (zz > (V.takTot ?? J.takTot ?? 0.15)) continue;
      const v = vorkVoor(p);
      const eind = langs(v, p, 0.72);
      const mid = [mix(v[0], p[0], 0.45), mix(v[1], p[1], 0.45), mix(v[2], p[2], 0.2)];
      delen.push(tak(bocht(v, mid, eind, 3), [7, 5.2, 3.8, 2.8].map((r) => r * dik), 0, 2, 2 * dik));
    }
  }
  // een afgebroken dode tak: grijs, opzij uit de stam, met een rafelig eind
  if (V.stomp) {
    // opzij (langs x), onder de kroon, zodat je hem ziet
    const a = (R(90) > 0.5 ? 0 : Math.PI) + (R(91) - 0.5) * 0.5 + 0.25;
    const van = [vork[0] * 0.6, vork[1] * 0.6, vork[2] * 0.62];
    const eind = [van[0] + Math.cos(a) * 52, van[1] + Math.sin(a) * 52, van[2] + 20];
    const md = mat.push(schorsMat({ zaad: zaad + 1, ramp: 'bot', lo: 0.8, hi: 4.6, rek: 0.1 })) - 1;
    const dood = bocht(van, [mix(van[0], eind[0], 0.5), mix(van[1], eind[1], 0.5), van[2] + 12], eind, 3);
    const zij = [dood[2][0] + Math.cos(a + 1.2) * 14, dood[2][1] + Math.sin(a + 1.2) * 14, dood[2][2] + 12];
    delen.push(bundel([[dood, [6.5, 5.4, 4.6, 4.2]], [[dood[2], zij], [2.6, 1.8]], [[eind, [eind[0] + Math.cos(a) * 5, eind[1] + Math.sin(a) * 5, eind[2] + 4]], [2.8, 1]]], md, 4, 1));
  }
  // een holte in de stam, aan de kant van de kijker
  if (V.hol) {
    const mh = mat.push({ ramp: 'inkt', lo: 0, hi: 1.4, rand: 0 }) - 1;
    const hz = 34;
    delen.push({ f: (x, y, z) => sdf.ellipsoide(x - scheef[0] * 0.05, y - 11 * dik, z - hz, 3.6, 4.5, 7), g: [scheef[0] * 0.05, 11 * dik, hz, 9], m: mh, deel: 5, uit: true });
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

// Een tak van een spar met zijn naalden: van de stam (op hoogte z0, in richting a) naar buiten, eerst afhangend en aan
// het eind iets omhoog, met een platte massa naalden die in het midden het breedst is en naar de punt spits toeloopt,
// en waarvan de zijtwijgen aan de flanken doorhangen. Langs de tak (u), dwars (v) en de hoogte; de afstand is de
// ellips in (v, z) maal zijn kleinste as, en buiten het eind de afstand tot het eind. Met bulten erop: pluimen naalden.
function sparTak(z0, a, L, W, m, deel, zaad, o = {}) {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const val = o.val ?? 0.2;
  const zak = o.zak ?? 0.0025;
  const op = o.op ?? 0.7;
  const H0 = Math.max(2.2, W * (o.dik ?? 0.26));
  // de hartlijn van de tak, en hoe breed en dik de naalden op elke plek
  const hart = (u) => z0 - val * u - zak * u * u + (op * Math.max(0, u - 0.62 * L) ** 2) / L;
  const f0 = (x, y, z) => {
    const u = x * ca + y * sa;
    const v = -x * sa + y * ca;
    const uc = klem(u, 0, L);
    const s = uc / L;
    const w = Math.max(0.6, W * (0.25 + 1.1 * s) * Math.sqrt(Math.max(0, 1 - s ** 3)));
    const h = H0 * (0.55 + 0.45 * (1 - s));
    // de flanken hangen door
    const zc = hart(uc) - (0.9 * v * v) / Math.max(W, 1);
    const e = Math.hypot(v / w, (z - zc) / h) - 1;
    const binnen = e * Math.min(w, h);
    const buiten = Math.abs(u - uc);
    return (buiten > 0 ? Math.hypot(Math.max(binnen, 0), buiten) : binnen) * 0.62;
  };
  const mid = L * 0.55;
  const g = [ca * mid, sa * mid, hart(mid), L * 0.55 + W + 6];
  return bultig(f0, g, o.bult ?? 4.5, m, deel, zaad, { plat: 1.3, buiten: 0.3, binnen: 0.14, zacht: 0.25, rMin: 0.3 });
}

// Een spar (de den van het bos): een rechte stam met dichte kransen van bijna vlakke takken die naar boven korter worden,
// een volle kegel met de punten van de takken als stekels in zijn rand, en de stam eronder. Elke tak heeft een lichte
// bovenkant en een donkere onderkant, en zijn punt is lichter (het jonge groen); geen krans is rond: de takken verschillen
// in lengte en staan niet op gelijke afstand. Elke spar heeft een eigen groen (SPAR_KLEUREN). Zo sinds 10 okt (Marcel:
// "kunnen we de dennenboom beter maken?", met voorbeelden: "dit is een spar"); daarvoor waren de kransen gladde rokken.
// o.jong: een jonge den uit hetzelfde zaad (jongeDen), zie JONG; o.ramp: een vast groen.
const SPAR_KLEUREN = ['spar', 'spar', 'spar', 'gras', 'mos'];
function den(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 23);
  const J = o.jong ? JONG.den : JONG.vol;
  o = { ...J.opties, ...o };
  const H = (286 + R(1) * 22) * J.hoog;
  const mat = [schorsMat({ zaad, ramp: 'hout', lo: 0.8, hi: 4.6, rek: 0.12 })];
  const delen = [];
  const helling = [(R(2) - 0.5) * 6 * J.breed, (R(3) - 0.5) * 6 * J.breed];
  const stamOp = (z) => [helling[0] * (z / H) ** 2, helling[1] * (z / H) ** 2, z];
  delen.push(tak([stamOp(-3), stamOp(H * 0.35), stamOp(H * 0.7), stamOp(H - 8 * J.hoog)], [7.5, 5.6, 3.4, 1.2].map((r) => r * J.dik), 0, 1, 0));
  wortels(delen, J.wortels ?? 5, zaad, { lengte: [13 * J.breed, 18 * J.breed], straal: 4.2 * J.dik, hoogte: 11 * J.hoog });
  const kroonC = [0, 0, H * 0.55];
  const kroonS = [64 * J.breed, 64 * J.breed, H * 0.5];
  const naald = { vormen: NAALDEN, raster: 4, kans: 0.85, drempel: 3.4 };
  const { ex } = assenVoor('Z');
  const groen = o.ramp || SPAR_KLEUREN[Math.floor(R(7) * SPAR_KLEUREN.length)];
  const n = o.kransen ?? 14;
  const onder = (o.onder ?? 64) * J.hoog;
  let deel = 10;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const z0 = mix(onder, H - 26 * J.hoog, t ** 0.92) + (R(10 + i) - 0.5) * 6 * J.hoog;
    const lang = mix(o.breed ?? 64, 9, t) * J.breed;
    const takken = t > 0.8 ? 5 : t > 0.5 ? 7 : 8 + (R(20 + i) > 0.5 ? 1 : 0);
    const fase = R(30 + i) * Math.PI * 2;
    const [sx, sy] = stamOp(z0);
    for (let k = 0; k < takken; k++) {
      // hier en daar ontbreekt een tak, niet aan de top
      if (t < 0.75 && R(200 + i * 10 + k) < 0.06) continue;
      const a = fase + ((k + (R(300 + i * 10 + k) - 0.5) * 0.5) / takken) * Math.PI * 2;
      const L = lang * (0.75 + R(400 + i * 10 + k) * 0.45);
      const W = 2.5 + L * 0.17;
      const m = loof(mat, groen, zaad * 1000 + i * 10 + k, {
        klomp: [[sx + Math.cos(a) * L * 0.55, sy + Math.sin(a) * L * 0.55, z0 - L * 0.25], [L * 0.6, L * 0.6, W * 0.5]],
        kroon: [kroonC, kroonS],
        klompDeel: 0.45,
        lo: 0.5,
        hi: 5.4,
        vorm: 2.2,
        diep: 0,
        schaduwKracht: 0.2,
        toetsen: { vormen: ex[0] * Math.cos(a) + ex[1] * Math.sin(a) >= 0 ? STREEPJES_RECHTS : STREEPJES_LINKS, raster: 5, kans: 0.95, drempel: 2.8 },
        plus: (R(500 + i * 10 + k) - 0.5) * 0.5 + (o.plus ?? 0),
        // het jonge groen aan de punt, en de binnenkant van een tak in de schaduw
        extra: (x, y) => {
          const s = Math.hypot(x - sx, y - sy) / L;
          return s > 0.7 ? 1 : s < 0.35 ? -1 : 0;
        },
      });
      const tk = sparTak(z0, a, L, W, m, deel++, zaad * 1000 + i * 10 + k, { bult: o.bult ?? 2.6 });
      // de tak zit aan de stam waar hij staat (de stam helt iets)
      const f = tk.f;
      tk.f = (x, y, z) => f(x - sx, y - sy, z);
      tk.g = [tk.g[0] + sx, tk.g[1] + sy, tk.g[2], tk.g[3]];
      delen.push(tk);
    }
  }
  // de spits
  const top = stamOp(H);
  const mt = loof(mat, groen, zaad * 100 + 50, { klomp: [[top[0], top[1], H - 14 * J.hoog], [8 * J.breed, 8 * J.breed, 16 * J.hoog]], kroon: [kroonC, kroonS], lo: 2, hi: 4.2, vorm: 2, diep: 0, toetsen: naald, plus: 0.4 });
  delen.push(bultig((x, y, z) => sdf.rondeKegel(x, y, z, top[0], top[1], H - 34 * J.hoog, top[0], top[1], H + 6 * J.hoog, 7 * J.breed, 1.2), [top[0], top[1], H - 14 * J.hoog, 22 * J.hoog], 4, mt, deel, zaad * 100 + 50, { plat: 1.3 }));
  delen.push(onderGrond);
  // de takken van een spar liggen bijna vlak, dus bij 0,45 werd hij helemaal wit (10 okt): sneeuw alleen bovenop
  return Object.assign(model(delen, mat, omhul(delen)), { sneeuwDikte: 0.25 });
}

// De grove den, de den van de heide en het zand: een hoge, iets kromme stam, onderaan grijsbruin en naar boven oranje,
// kaal tot hoog op, met een paar dode stompjes, en bovenin een platte, onregelmatige kroon van wolken naalden op kromme
// takken, grijzer groen dan een spar.
function groveDen(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 71);
  const H = 236 + R(1) * 40;
  const mat = [
    schorsMat({ zaad, ramp: 'schors', lo: 0.8, hi: 5, rek: 0.1 }),
    {
      ramp: 'hout',
      lo: 2.4,
      hi: 6.4,
      omslag: 0.3,
      // naar boven oranje en glad, onderaan de grove grijsbruine schors
      patroon: (x, y, z, nx, ny, nz, stap) => {
        const n = ruis3(x * 0.3, y * 0.3, z * 0.08, zaad);
        if (z < H * 0.42 + n * 30) return { ramp: 'schors', stap: klem(stap - 1 + (Math.abs(n - 0.5) < 0.05 ? -1.4 : 0), 0.6, 5.4) };
        return n > 0.7 ? -0.6 : 0;
      },
    },
  ];
  const delen = [];
  // de stam: een lange bocht, met een knik
  const k1 = [(R(2) - 0.5) * 30, (R(3) - 0.5) * 20, H * 0.45];
  const k2 = [k1[0] + (R(4) - 0.5) * 34, k1[1] + (R(5) - 0.5) * 20, H * 0.8];
  const stam = [...bocht([0, 0, -3], [k1[0] * 0.3, k1[1] * 0.3, H * 0.25], k1, 4), ...bocht(k1, [mix(k1[0], k2[0], 0.5) + 4, mix(k1[1], k2[1], 0.5), H * 0.62], k2, 4).slice(1)];
  delen.push(tak(stam, [9.5, 8, 7.2, 6.6, 6, 5.4, 4.8, 4.2, 3.6].map((r) => r * (o.dik ?? 1)), 1, 1, 2));
  wortels(delen, 5, zaad, { lengte: [16, 24], straal: 5.6, hoogte: 14 });
  // dode stompjes onderaan
  for (let k = 0; k < 3; k++) {
    const p = stam[2 + k];
    const a = R(10 + k) * Math.PI * 2;
    delen.push(tak([p, [p[0] + Math.cos(a) * 10, p[1] + Math.sin(a) * 10, p[2] + 3]], [2.2, 1.2], 0, 2, 0.6));
  }
  // de kroon: wolken naalden op kromme takken, de bovenste in het midden, de lagere verder naar buiten
  const kroonC = [k2[0], k2[1], H * 0.86];
  const kroonS = [70, 66, 46];
  const n = 6 + Math.floor(R(6) * 3);
  const wolken = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const a = R(20 + i) * Math.PI * 2;
    const ver = mix(48, 8, t) * (0.7 + R(30 + i) * 0.5);
    const z = mix(H * 0.68, H * 0.98, t) + (R(40 + i) - 0.5) * 10;
    const van = stam[Math.min(stam.length - 1, Math.round(mix(5, stam.length - 1, t)))];
    const p = [van[0] + Math.cos(a) * ver, van[1] + Math.sin(a) * ver, z];
    const r = mix(30, 20, t) * (0.8 + R(50 + i) * 0.4);
    wolken.push([p, r]);
    delen.push(tak(bocht(van, [mix(van[0], p[0], 0.5), mix(van[1], p[1], 0.5), van[2] + (z - van[2]) * 0.2 + 6], p, 3), [3.6, 2.8, 2.2, 1.6], 1, 2, 1.2));
  }
  let deel = 10;
  wolken.forEach(([p, r], i) => {
    // een wolk is een paar plukken naalden naast elkaar, niet één schijf
    const plukken = 3 + (R(60 + i) > 0.5 ? 1 : 0);
    for (let k = 0; k < plukken; k++) {
      const a = R(70 + i * 5 + k) * Math.PI * 2;
      const q = k === 0 ? p : [p[0] + Math.cos(a) * r * 0.6, p[1] + Math.sin(a) * r * 0.6, p[2] + (R(80 + i * 5 + k) - 0.6) * r * 0.4];
      const rr = r * (k === 0 ? 0.75 : 0.5 + R(90 + i * 5 + k) * 0.2);
      const s = [rr * 1.1, rr, rr * 0.6];
      const m = loof(mat, 'den', zaad * 100 + i * 5 + k, { klomp: [q, s], kroon: [kroonC, kroonS], lo: 2.2, hi: 4.4, vorm: 2.6, diep: 0.4, plus: 0.45, toetsen: { vormen: NAALDEN, raster: 4, kans: 0.85, drempel: 3.2 } });
      delen.push(klomp(q, s, 4.5, m, deel++, zaad * 100 + i * 5 + k, { rMin: 0.25, binnen: 0.5, buiten: 0.45, plat: 1.1 }));
    }
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- berk

// Een berk: een slanke witte stam met zwarte vlekken, dunne takken omhoog en een luchtige kroon
// van kleine klompen, met gaten waardoor je de takken ziet. o.jong: een jonge berk uit hetzelfde
// zaad (jongeBerk), zie JONG. o.seizoen: in de lente jong blad, in de herfst goudgeel, in de winter
// kaal, met fijne donkere twijgen.
const BERK_BLAD = { lente: 'lente', zomer: 'gras', herfst: ['goud', 'goud', 'stro'] };
function berk(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 31);
  const seizoen = o.seizoen || 'zomer';
  const kaal = seizoen === 'winter';
  const J = o.jong ? JONG.berk : JONG.vol;
  o = { ...J.opties, ...o };
  const mat = [berkMat(zaad, J.hoog), schorsMat({ zaad, ramp: 'vacht', lo: 1, hi: 4.4 })];
  const delen = [];
  const top = [(R(1) * 18 - 9) * J.breed, (R(2) * 18 - 9) * J.breed, 218 * J.hoog];
  const stam = bocht([0, 0, -3], [(R(3) * 16 - 8) * J.breed, (R(4) * 16 - 8) * J.breed, 110 * J.hoog], top, 7);
  delen.push(tak(stam, [7, 6.2, 5.6, 5, 4.4, 3.8, 3.1, 2.4].map((r) => r * J.dik), 0, 1, 1.5 * J.dik));
  wortels(delen, 4, zaad, { lengte: [11 * J.breed, 15 * J.breed], straal: 5 * J.dik, hoogte: 9 * J.hoog });
  // een tweede, dunnere stam bij de helft van de bomen
  if (R(5) > 0.5) {
    const a = R(6) * Math.PI * 2;
    const top2 = [Math.cos(a) * 34 * J.breed, Math.sin(a) * 34 * J.breed, 170 * J.hoog];
    delen.push(tak(bocht([Math.cos(a) * 2, Math.sin(a) * 2, 4], [Math.cos(a) * 12 * J.breed, Math.sin(a) * 12 * J.breed, 80 * J.hoog], top2, 5), [4.6, 4, 3.4, 2.8, 2.2, 1.8].map((r) => r * J.dik), 0, 2, 1.5 * J.dik));
  }
  const C = [top[0] * 0.7, top[1] * 0.7, o.hoogte ?? 190];
  const RK = o.RK ?? [54, 52, 80];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: o.n ?? 18,
    zaad,
    ramp: bladRamp(BERK_BLAD[seizoen] || 'gras', zaad),
    kaal,
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
    const t = klem((p[2] - 90 * J.hoog) / (140 * J.hoog), 0.15, 0.85);
    const van = stam[Math.round(t * (stam.length - 1))];
    const mid = [mix(van[0], p[0], 0.5), mix(van[1], p[1], 0.5), mix(van[2], p[2], 0.7)];
    delen.push(tak(bocht(van, mid, langs(van, p, 0.85), 3), [2.6, 2, 1.5, 1.1].map((r) => r * J.twijg), i % 2 ? 0 : 1, 2, 1));
  });
  // in de winter de twijgen erbij, donker, aan de takken die er al zijn
  if (kaal) kaleKroon(delen, 1, top, klompen, C, zaad, { tak: false, dik: 0.6 * J.twijg, takjes: 2 });
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
// bijna op de grond vallen, met spleten waardoor je de stam ziet. o.seizoen: in de lente jong
// geelgroen, in de herfst geel, in de winter kale twijgen, geelbruin, die nog net zo hangen.
const WILG_BLAD = { lente: 'lente', zomer: 'gras', herfst: 'goud', winter: 'stro' };
function wilg(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 37);
  const blad = WILG_BLAD[o.seizoen] || 'gras';
  const winter = o.seizoen === 'winter';
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
  kroon(delen, mat, { C, RK, n: winter ? 9 : 12, zaad, ramp: blad, straal: winter ? [17, 23] : [24, 32], bult: 14, hoogte: [1, -0.4], hang: o.hang ?? 0.6, loof: { lo: 2.4, hi: 4.2, ...(winter ? { plus: -0.6, toetsen: { vormen: TWIJGEN, raster: 4, kans: 0.9, drempel: 3 } } : {}) } });
  // gordijnen: losse strengen twijgen die over de rand van de koepel hangen en naar onderen iets
  // naar binnen vallen, elk met een eigen lengte en een punt; de binnenste laag in de schaduw
  const buik = C[2] - 10;
  const twijg = { vormen: TWIJGEN, raster: 5, kans: 0.9, drempel: 3.4 };
  const inval = o.inval ?? 0.0008;
  const lagen = o.lagen ?? [
    { r: 76, n: 38, breed: 0.26, onder: [14, 100], dik: 5, top: C[2] + (o.top ?? 22) },
    { r: 56, n: 26, breed: 0.32, onder: [28, 100], dik: 6, top: C[2] - 6 },
  ];
  lagen.forEach((l0, j) => {
    // in de winter zijn de strengen kale twijgen: smaller, met meer lucht ertussen
    const l = winter ? { ...l0, breed: l0.breed * 0.45, dik: l0.dik * 0.6 } : l0;
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
    const m = loof(mat, blad, zaad * 100 + 60 + j, {
      klomp: [[C[0], C[1], (top + 40) / 2], [l.r + 6, l.r + 6, (top - 40) / 2 + 20]],
      kroon: [[C[0], C[1], 100], [90, 90, 90]],
      lo: 2.4,
      hi: 3.8,
      vorm: 2.2,
      diep: 0,
      plus: (j ? -0.8 : 0) + (winter ? -0.6 : 0),
      toetsen: twijg,
    });
    delen.push(bultig(f0, [C[0], C[1], (top + 20) / 2, l.r + 70], 6, m, 40 + j, zaad * 100 + 60 + j, { plat: 0.5, buiten: 0.22, binnen: 0.15 }));
  });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- appelboom

// Een appelboom voor in het dorp: een korte stam, uitgespreide takken, een ronde kroon en rode
// appels op de buitenkant, een paar in het gras. o.seizoen (vraag 148, b): in de lente bloesem, in de
// zomer kleine groene appels, in de herfst rijpe appels in een kroon die geel wordt en meer in het
// gras, in de winter kaal; zonder seizoen de rode appels in het groen, zoals altijd.
function appelboom(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 47);
  const seizoen = o.seizoen;
  const kaal = seizoen === 'winter';
  const M = { schors: 0, appel: 1 };
  const mat = [];
  mat[M.schors] = schorsMat({ zaad, lo: 1, hi: 5.6 });
  mat[M.appel] = seizoen === 'zomer' ? { ramp: 'lente', lo: 3.6, hi: 7.4, glans: 1.2, glansMacht: 14, detail: true, omslag: 0.3 } : { ramp: 'rood', lo: 2.6, hi: 7.4, glans: 1.6, glansMacht: 14, detail: true, omslag: 0.3 };
  const delen = [];
  const vork = [R(1) * 10 - 5, R(2) * 10 - 5, 52];
  delen.push(tak(bocht([0, 0, -3], [R(3) * 8 - 4, 0, 26], vork, 4), [10, 8, 7.2, 6.8, 6.4], M.schors, 1, 2.5));
  wortels(delen, 5, zaad, { lengte: [15, 20], straal: 5.5, hoogte: 14 });
  const C = [vork[0], vork[1], 124];
  const RK = [72, 68, 46];
  const ramp = seizoen === 'lente' ? (i, r) => (i >= 10 ? 'lente' : 'bloesem') : seizoen === 'herfst' ? (i) => ((i + zaad) % 4 === 1 ? 'goud' : 'blad') : undefined;
  const klompen = kroon(delen, mat, { C, RK, n: 10, zaad, straal: [24, 31], bult: 14, loof: { lo: 2, hi: 3.7 }, ramp, kaal });
  if (kaal) kaleKroon(delen, M.schors, vork, klompen, C, zaad, { dik: 0.85 });
  for (const [p, , zz] of kaal ? [] : klompen) {
    if (zz > 0.2) continue;
    delen.push(tak(bocht(vork, [mix(vork[0], p[0], 0.5), mix(vork[1], p[1], 0.5), vork[2] + 8], langs(vork, p, 0.75), 3), [5.5, 4.2, 3.2, 2.4], M.schors, 2, 1.5));
  }
  if (kaal || seizoen === 'lente') {
    delen.push(onderGrond);
    return model(delen, mat, omhul(delen));
  }
  // appels: op de buitenkant van de klompen, aan de kant van de kijker en de zijkanten
  // (in de zomer minder en kleiner, en nog geen in het gras; in de herfst meer in het gras)
  const opBoom = seizoen === 'zomer' ? 16 : 24;
  const inGras = seizoen === 'zomer' ? 0 : seizoen === 'herfst' ? 8 : 3;
  const maat = seizoen === 'zomer' ? 2.6 : 3.5;
  const appels = [];
  for (let i = 0; appels.length < opBoom && i < 300; i++) {
    const [p, r] = klompen[Math.floor(R(100 + i) * klompen.length)];
    const a = R(300 + i) * Math.PI * 2;
    const h = R(500 + i) * 1.3 - 0.55;
    const d = [Math.cos(a) * Math.sqrt(1 - h * h), Math.sin(a) * Math.sqrt(1 - h * h), h];
    const q = [p[0] + d[0] * r * 0.98, p[1] + d[1] * r * 0.98, p[2] + d[2] * r * 0.86 * 0.98];
    if (Math.hypot((q[0] - C[0]) / RK[0], (q[1] - C[1]) / RK[1], (q[2] - C[2]) / RK[2]) < 0.78) continue;
    appels.push(q);
  }
  const aanBoom = appels.length;
  for (let i = 0; i < inGras; i++) {
    const a = R(700 + i) * Math.PI * 2;
    const r = 26 + R(710 + i) * 30;
    appels.push([Math.cos(a) * r, Math.sin(a) * r, 2.4]);
  }
  // de appels aan de boom en die in het gras apart: elk groepje een eigen, krappe grensbol
  delen.push(bollen(appels.slice(0, aanBoom), maat, M.appel, 5, [1, 1, 0.93]));
  if (inGras) delen.push(bollen(appels.slice(aanBoom), maat, M.appel, 5, [1, 1, 0.93]));
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- de nieuwe soorten (vraag 148, a)

// Soorten die bij het land passen (Marcel, 9 okt: "Ja goed idee"): de beuk en de linde, de els aan het water, de
// populier langs de weg, de knotwilg aan de beek, en de meidoorn en de hazelaar als struik. Elk kent o.seizoen.

// Een loofboom uit een beschrijving S (de beuk, de linde, de els): een stam tot de vork, een kroon van klompen, takken
// naar de onderste klompen, en zijn blad per seizoen. S.vork: de hoogte van de vork; S.stam: de stralen van de stam;
// S.schors(zaad): zijn materiaal; S.kroon: de opties van kroon() met C als hoogte; S.blad: per seizoen een ramp of een
// lijst (bladRamp); S.plus: per seizoen iets lichter of donkerder; S.takTot; S.extra: wat er nog bij komt (katjes).
function loofboom(zaad, o, S) {
  const R = (i) => rnd(zaad, i, S.lot);
  const seizoen = o.seizoen || 'zomer';
  const kaal = seizoen === 'winter';
  const mat = [S.schors(zaad)];
  const delen = [];
  const sch = S.scheef ?? 8;
  const scheef = [R(1) * sch * 2 - sch, R(2) * sch * 2 - sch];
  const breed = 0.9 + R(5) * 0.2;
  const hoog = 0.92 + R(6) * 0.16;
  const vork = [scheef[0], scheef[1], S.vork * hoog];
  delen.push(tak(bocht([0, 0, -3], [scheef[0] * 0.15 + R(4) * 6 - 3, scheef[1] * 0.15, S.vork * 0.5], vork, 5), S.stam, 0, 1, 3));
  wortels(delen, S.wortels ?? 5, zaad, { lengte: S.wortelLengte ?? [18, 28], straal: S.stam[0] * 0.55, hoogte: S.stam[0] * 1.6 });
  const C = [scheef[0], scheef[1], S.kroon.C * hoog];
  const RK = [S.kroon.RK[0] * breed, S.kroon.RK[1] * breed, S.kroon.RK[2] * hoog];
  const loofO = { ...S.kroon.loof, plus: (S.kroon.loof?.plus ?? 0) + (S.plus?.[seizoen] ?? 0) };
  const klompen = kroon(delen, mat, { ...S.kroon, C, RK, zaad, kaal, ramp: bladRamp(S.blad[seizoen] || 'blad', zaad), loof: loofO });
  if (kaal) kaleKroon(delen, 0, vork, klompen, C, zaad, { dik: S.takDik ?? 1, takjes: S.takjes });
  else {
    for (const [p, , zz] of klompen) {
      if (zz > (S.takTot ?? 0.15)) continue;
      const eind = langs(vork, p, 0.72);
      const mid = [mix(vork[0], p[0], 0.45), mix(vork[1], p[1], 0.45), mix(vork[2], p[2], 0.2)];
      delen.push(tak(bocht(vork, mid, eind, 3), [6, 4.6, 3.4, 2.5].map((r) => r * (S.takDik ?? 1)), 0, 2, 2));
    }
  }
  if (seizoen === 'herfst' && S.valt !== false) gevallenBlad(delen, mat, zaad, { n: 22, straal: RK[0] * 0.42 });
  if (S.extra) S.extra({ delen, mat, klompen, seizoen, zaad, C, RK });
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// De beuk: een gladde grijze stam, hoog tot de vork, en een brede, dichte kroon van donker, glanzend blad; in de lente fel
// lichtgroen, in de herfst koperbruin.
const beukSchors = (zaad) => ({
  ramp: 'vacht',
  lo: 2.4,
  hi: 6.2,
  omslag: 0.25,
  // glad, met vage dwarse ringen en vlekken
  patroon: (x, y, z) => {
    const n = ruis3(x * 0.18, y * 0.18, z * 0.7, zaad);
    return n > 0.72 ? -0.7 : n < 0.24 ? 0.4 : 0;
  },
});
const beuk = (zaad = 1, o = {}) =>
  loofboom(zaad, o, {
    lot: 59,
    schors: beukSchors,
    vork: 94,
    stam: [13, 10.5, 9.4, 8.8, 8.4, 8],
    kroon: { C: 178, RK: [90, 86, 64], n: 14, straal: [27, 35], bult: 15 },
    blad: { lente: 'lente', zomer: 'blad', herfst: ['herfst', 'herfst', 'goud', 'stro'] },
    plus: { lente: 0.3, zomer: -0.45, herfst: -0.5 },
  });

// De linde: een hoge, eivormige kroon, hoger dan breed, op een stam met lange groeven; in de herfst geel.
const linde = (zaad = 1, o = {}) =>
  loofboom(zaad, o, {
    lot: 61,
    schors: (z) => schorsMat({ zaad: z, rek: 0.04 }),
    vork: 76,
    stam: [13, 10.5, 9.4, 8.8, 8.2, 7.6],
    kroon: { C: 190, RK: [66, 62, 98], n: 17, straal: [21, 28], bult: 13, hoogte: [1, -0.85] },
    blad: { lente: 'lente', zomer: 'blad', herfst: ['goud', 'goud', 'stro'] },
    plus: { zomer: 0.15 },
    takTot: 0.05,
  });

// De els, aan het water: middelgroot, met een spitse kroon van donker blad, dat in de herfst bruingroen afvalt; in de
// winter kaal, met de zwarte proppen van vorig jaar en de katjes van het nieuwe.
const els = (zaad = 1, o = {}) =>
  loofboom(zaad, o, {
    lot: 63,
    schors: (z) => schorsMat({ zaad: z, ramp: 'vacht', lo: 0.8, hi: 4.6 }),
    vork: 58,
    stam: [9, 7.5, 6.6, 6, 5.6, 5.2],
    kroon: { C: 152, RK: [54, 50, 84], n: 15, straal: [17, 23], bult: 11, hoogte: [1, -0.9], ver: 0.72 },
    blad: { lente: ['lente', 'blad'], zomer: 'blad', herfst: ['blad', 'olijf', 'herfst'] },
    plus: { zomer: -0.75, herfst: -0.6 },
    takDik: 0.75,
    takjes: 3,
    extra: ({ delen, mat, klompen, seizoen, zaad }) => {
      if (seizoen !== 'winter' && seizoen !== 'lente') return;
      const mp = mat.push({ ramp: 'inkt', lo: 0.6, hi: 3.4, omslag: 0.3 }) - 1;
      const mk = mat.push({ ramp: 'rood', lo: 1.6, hi: 4.4, omslag: 0.3 }) - 1;
      const proppen = [];
      const katjes = [];
      for (let i = 0; i < 26; i++) {
        const q = opKlomp(klompen, i, zaad, 0.6);
        (i % 3 ? proppen : katjes).push(q);
      }
      delen.push(bollen(proppen, 1.6, mp, 6));
      delen.push(bollen(katjes.map((q) => [q[0], q[1], q[2] - 3]), 1.3, mk, 6, [1, 1, 3]));
    },
  });

// De populier langs de weg: een rechte stam en een smalle zuil van kleine klompen, met steile takken; in de herfst geel,
// in de winter een bezem van kale takken die allemaal omhoog wijzen.
function populier(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 65);
  const seizoen = o.seizoen || 'zomer';
  const kaal = seizoen === 'winter';
  const mat = [schorsMat({ zaad, ramp: 'vacht', lo: 1, hi: 5, rek: 0.05 })];
  const delen = [];
  const H = 262 + R(1) * 26;
  const stam = bocht([0, 0, -3], [R(2) * 6 - 3, R(3) * 6 - 3, H * 0.5], [R(4) * 8 - 4, R(5) * 8 - 4, H], 7);
  delen.push(tak(stam, [10, 8.4, 7, 5.6, 4.4, 3.2, 2.2, 1.4], 0, 1, 2));
  wortels(delen, 5, zaad, { lengte: [15, 22], straal: 6, hoogte: 15 });
  const C = [stam[4][0], stam[4][1], H * 0.62];
  const RK = [30, 28, H * 0.42];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: 22,
    zaad,
    kaal,
    ramp: bladRamp({ lente: 'lente', zomer: 'blad', herfst: ['goud', 'goud', 'stro'] }[seizoen] || 'blad', zaad),
    straal: [12, 16],
    bult: 9,
    ver: 0.66,
    hoogte: [1, -1],
    hoog: 1.15,
    loof: { lo: 2.3, hi: 4, plus: seizoen === 'zomer' ? -0.2 : 0 },
  });
  // de takken: van de stam, een eind onder de klomp, steil omhoog naar de klomp
  const opStam = (p) => stam[Math.round(klem((p[2] - 40) / H, 0.1, 0.9) * (stam.length - 1))];
  if (kaal) kaleKroon(delen, 0, null, klompen, C, zaad, { van: opStam, dik: 0.45 });
  else for (const [p] of klompen) delen.push(tak(bocht(opStam(p), langs(opStam(p), p, 0.5), langs(opStam(p), p, 0.85), 3), [2.6, 2, 1.5, 1.1], 0, 2, 1));
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// De knotwilg aan de beek: een korte dikke stam met een knot, waaruit de roeden recht omhoog en naar buiten staan. In de
// zomer een bol grijsgroen blad op de knot, in de lente katjes en het eerste blad, in de herfst geel, en in de winter
// alleen de roeden, geeloranje.
function knotwilg(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 67);
  const seizoen = o.seizoen || 'zomer';
  const mat = [schorsMat({ zaad, lo: 0.8, hi: 5, rek: 0.1 }), { ramp: seizoen === 'winter' ? 'stro' : 'olijf', lo: 1.8, hi: 5.4, omslag: 0.3 }];
  const delen = [];
  const H = 62 + R(1) * 14;
  const kop = [R(2) * 8 - 4, R(3) * 8 - 4, H];
  // de stam, kort en iets scheef, naar boven dikker (de knot), met een bultige kop van schors
  delen.push(tak(bocht([0, 0, -3], [kop[0] * 0.3, kop[1] * 0.3, H * 0.5], kop, 4), [13, 11.5, 11, 12, 14], 0, 1, 3));
  wortels(delen, 5, zaad, { lengte: [16, 22], straal: 7, hoogte: 16 });
  delen.push(klomp(kop, [17, 16, 9], 7, 0, 2, zaad * 10 + 1, { rMin: 0.3, binnen: 0.4, buiten: 0.4, plat: 1 }));
  // de roeden: een waaier, recht omhoog en schuin naar buiten
  const n = 22 + Math.floor(R(4) * 8);
  const roeden = [];
  const toppen = [];
  for (let i = 0; i < n; i++) {
    const a = R(10 + i) * Math.PI * 2;
    const r0 = 5 + R(40 + i) * 9;
    const van = [kop[0] + Math.cos(a) * r0, kop[1] + Math.sin(a) * r0, H + 3 + R(70 + i) * 4];
    const uit = 0.22 + R(100 + i) * 0.42;
    const l = (55 + R(130 + i) * 45) * (seizoen === 'winter' ? 1 : 0.82);
    const eind = [van[0] + Math.cos(a) * l * uit, van[1] + Math.sin(a) * l * uit, van[2] + l];
    const mid = [mix(van[0], eind[0], 0.4), mix(van[1], eind[1], 0.4), mix(van[2], eind[2], 0.55)];
    roeden.push([bocht(van, mid, eind, 3), [2.2, 1.7, 1.2, 0.8]]);
    toppen.push(eind);
  }
  delen.push(bundel(roeden, 1, 3, 0.6));
  if (seizoen !== 'winter') {
    // het blad: een bol op de knot, in de lente kleiner en open
    const lente = seizoen === 'lente';
    const C = [kop[0], kop[1], H + (lente ? 40 : 46)];
    const RK = lente ? [34, 32, 30] : [46, 44, 40];
    const ramp = { lente: 'lente', zomer: 'gras', herfst: ['goud', 'stro'] }[seizoen];
    kroon(delen, mat, {
      C,
      RK,
      n: lente ? 6 : 12,
      zaad,
      ramp: bladRamp(ramp, zaad),
      straal: lente ? [9, 13] : [14, 19],
      bult: 9,
      ver: 0.7,
      hoogte: [1, -0.5],
      kern: !lente,
      loof: { lo: 2.4, hi: 3.9, plus: seizoen === 'zomer' ? -0.35 : 0, toetsen: { vormen: TWIJGEN, raster: 5, kans: 0.8, drempel: 3.4 } },
    });
    if (lente) {
      // katjes: zilvergele bolletjes langs de roeden
      const mk = mat.push({ ramp: 'goud', lo: 4, hi: 6.6, omslag: 0.3 }) - 1;
      const katjes = [];
      roeden.forEach(([punten], i) => {
        if (i % 2) return;
        katjes.push(langs(punten[1], punten[3], 0.3 + R(160 + i) * 0.6));
      });
      delen.push(bollen(katjes, 1.6, mk, 6, [1, 1, 1.4]));
    }
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// De meidoorn: een kleine boom van twee of drie kromme stammetjes met een dichte, lage kroon; in de lente wit van de
// bloesem, in de herfst vol rode besjes, waarvan er in de winter nog een paar aan de kale takken hangen.
function meidoorn(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 73);
  const seizoen = o.seizoen || 'zomer';
  const kaal = seizoen === 'winter';
  const mat = [schorsMat({ zaad, lo: 0.9, hi: 5 })];
  const delen = [];
  const toppen = [];
  const stammen = 2 + (R(1) > 0.5 ? 1 : 0);
  for (let k = 0; k < stammen; k++) {
    const a = R(2 + k) * Math.PI * 2;
    const top = [Math.cos(a) * 14, Math.sin(a) * 14, 46 + R(6 + k) * 10];
    delen.push(tak(bocht([Math.cos(a) * 3, Math.sin(a) * 3, -3], [Math.cos(a) * 2 + R(9 + k) * 8 - 4, Math.sin(a) * 2, 24], top, 4), [5.5, 4.6, 4, 3.4, 3], 0, 1, 1.5));
    toppen.push(top);
  }
  const C = [0, 0, 72];
  const RK = [56, 52, 40];
  const ramp = { lente: 'lente', zomer: 'blad', herfst: ['blad', 'olijf', 'herfst'] }[seizoen];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: 10,
    zaad,
    kaal,
    ramp: bladRamp(ramp || 'blad', zaad),
    straal: [14, 18],
    bult: 8,
    ver: 0.62,
    hoogte: [1, -0.6],
    loof: { lo: 2.2, hi: 3.9, plus: seizoen === 'zomer' || seizoen === 'herfst' ? -0.5 : 0, toetsen: { raster: 5, kans: 0.7 } },
    vorm: { rMin: 0.5, binnen: 0.35, buiten: 0.25, plat: 1.15 },
  });
  const dichtste = (p) => toppen.reduce((b, t) => (Math.hypot(t[0] - p[0], t[1] - p[1]) < Math.hypot(b[0] - p[0], b[1] - p[1]) ? t : b));
  if (kaal) kaleKroon(delen, 0, null, klompen, C, zaad, { van: dichtste, dik: 0.55 });
  // de bloesem: witte bloemetjes, dicht over de buitenkant van het blad
  if (seizoen === 'lente') {
    const mb = mat.push({ ramp: 'baard', lo: 4.2, hi: 7, omslag: 0.4, detail: true }) - 1;
    const bloemetjes = [];
    for (let i = 0; i < 320; i++) bloemetjes.push(opKlomp(klompen, 200 + i, zaad));
    delen.push(bollen(bloemetjes, 1.8, mb, 5));
  }
  // besjes: in de herfst veel, in trosjes, in de winter een paar
  const besjes = seizoen === 'herfst' ? 56 : kaal ? 12 : 0;
  if (besjes) {
    const m = mat.push({ ramp: 'rood', lo: 3.2, hi: 7.4, glans: 1.2, glansMacht: 12, detail: true, omslag: 0.3 }) - 1;
    const punten = [];
    for (let i = 0; punten.length < besjes; i++) {
      const q = opKlomp(klompen, i, zaad);
      punten.push(q);
      if (i % 2 === 0) punten.push([q[0] + 2, q[1] + 1, q[2] - 1.6]);
    }
    delen.push(bollen(punten, 1.9, m, 5));
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// De hazelaar: een struik van rechte stammetjes uit één voet, met groot, licht blad. Vroeg in het jaar hangen de gele
// katjes aan de kale takken (de lente), in de herfst is hij geel en zitten er nootjes aan, in de winter is hij kaal.
function hazelaar(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 79);
  const seizoen = o.seizoen || 'zomer';
  const kaal = seizoen === 'winter' || seizoen === 'lente';
  const mat = [schorsMat({ zaad, ramp: 'hout', lo: 1, hi: 4.8, rek: 0.15 })];
  const delen = [];
  const stammen = [];
  const n = 6 + Math.floor(R(1) * 3);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + R(2 + k) * 0.7;
    const uit = 0.25 + R(20 + k) * 0.3;
    const l = 88 + R(30 + k) * 28;
    const top = [Math.cos(a) * l * uit, Math.sin(a) * l * uit, l];
    stammen.push([bocht([Math.cos(a) * 2, Math.sin(a) * 2, -2], [Math.cos(a) * l * uit * 0.3, Math.sin(a) * l * uit * 0.3, l * 0.5], top, 4), [3.2, 2.8, 2.3, 1.8, 1.3]]);
  }
  delen.push(bundel(stammen, 0, 1, 1));
  const C = [0, 0, 70];
  const RK = [54, 50, 52];
  const klompen = kroon(delen, mat, {
    C,
    RK,
    n: 13,
    zaad,
    kaal,
    ramp: seizoen === 'herfst' ? bladRamp(['goud', 'goud', 'stro', 'lente'], zaad) : 'blad',
    straal: [14, 19],
    bult: 11,
    ver: 0.75,
    hoogte: [1, -0.85],
    kern: false,
    loof: { lo: 2.3, hi: 4, plus: 0.25, toetsen: { raster: 7, kans: 0.75 } },
    vorm: { rMin: 0.35, binnen: 0.45, buiten: 0.3, plat: 1.1 },
  });
  const opStam = (p) => {
    let beste = stammen[0][0];
    for (const [punten] of stammen) if (Math.hypot(punten[4][0] - p[0], punten[4][1] - p[1]) < Math.hypot(beste[4][0] - p[0], beste[4][1] - p[1])) beste = punten;
    return beste[3];
  };
  if (kaal) kaleKroon(delen, 0, null, klompen, C, zaad, { van: opStam, dik: 0.45 });
  if (seizoen === 'lente') {
    // katjes: geel, lang en hangend
    const mk = mat.push({ ramp: 'goud', lo: 3.4, hi: 6.4, omslag: 0.3 }) - 1;
    const katjes = [];
    for (let i = 0; i < 36; i++) {
      const q = opKlomp(klompen, i, zaad, 0.7);
      katjes.push([q[0], q[1], q[2] - 4]);
    }
    delen.push(bollen(katjes, 1.2, mk, 6, [1, 1, 3.4]));
  }
  if (seizoen === 'herfst') {
    // nootjes in hun groene kraag, twee of drie bij elkaar
    const mn = mat.push({ ramp: 'hout', lo: 3, hi: 6.2, glans: 0.8, detail: true, omslag: 0.3 }) - 1;
    const noten = [];
    for (let i = 0; noten.length < 20; i++) {
      const q = opKlomp(klompen, i, zaad);
      noten.push(q, [q[0] + 2.4, q[1] + 0.6, q[2] - 0.4]);
    }
    delen.push(bollen(noten, 1.7, mn, 5, [1, 1, 1.15]));
  }
  delen.push(onderGrond);
  return model(delen, mat, omhul(delen));
}

// ---------------------------------------------------------------- de kerstboom

// Een kerstboom op het plein (Marcel, 10 okt: "we hebben ook een kerstboom nodig :)"): een den, behangen zoals in een oud
// dorp, met rode appels, gouden strosterren en kaarsjes die branden, en een ster in de top. Wat erin hangt, zit op de
// buitenkant van de takken: van buiten naar de stam gezocht tot waar de den begint (met de afstand van het model zelf),
// aan de kant van de kijker en de zijkanten.
function kerstboom(zaad = 1, o = {}) {
  const R = (i) => rnd(zaad, i, 89);
  const d = den(zaad, o);
  const delen = d.delen.filter((p) => p !== onderGrond);
  const mat = d.mat;
  const M = {
    appel: mat.push({ ramp: 'rood', lo: 2.8, hi: 7.4, glans: 1.6, glansMacht: 14, detail: true, omslag: 0.3 }) - 1,
    ster: mat.push({ ramp: 'goud', lo: 3.4, hi: 7, glans: 1, detail: true, omslag: 0.4 }) - 1,
    kaars: mat.push({ ramp: 'perkament', lo: 3, hi: 6.6, detail: true, omslag: 0.4 }) - 1,
    vlam: mat.push({ ramp: 'vuur', gloei: (x, y, z, kijk) => 4.6 + kijk * 1.6 }) - 1,
  };
  // de top van de den, en de straal van zijn buitenkant op een hoogte en in een richting
  let top = 400;
  while (top > 0 && d.sdf(0, 0, top) > 0.5) top -= 1;
  const buiten = (z, a) => {
    let r = 100;
    for (let s = 0; s < 120 && r > 0; s++) {
      const afstand = d.sdf(Math.cos(a) * r, Math.sin(a) * r, z);
      if (afstand < 0.4) return r;
      r -= Math.max(afstand * 0.9, 0.4);
    }
    return 0;
  };
  const appels = [];
  const sterren = [];
  const kaarsen = [];
  const vlammen = [];
  for (let i = 0; i < 110; i++) {
    const z = mix(70, top - 34, R(i) ** 0.9);
    const a = -Math.PI * 0.15 + R(100 + i) * Math.PI * 1.3;
    const r = buiten(z, a);
    if (r < 6) continue;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const soort = i % 5;
    if (soort < 2) appels.push([ca * (r + 1), sa * (r + 1), z - 3.5]);
    else if (soort < 4) sterren.push([ca * (r + 0.5), sa * (r + 0.5), z - 2.5]);
    else {
      // een kaarsje staat op de tak, met de vlam erboven
      const k = [ca * (r - 2), sa * (r - 2), z + 1];
      kaarsen.push([[k, [k[0], k[1], k[2] + 5]], [1.3, 1.2]]);
      vlammen.push([k[0], k[1], k[2] + 7]);
    }
  }
  delen.push(bollen(appels, 3, M.appel, 6, [1, 1, 0.95]));
  delen.push(bollen(sterren, 2.2, M.ster, 7, [1, 1, 1.2]));
  delen.push(bundel(kaarsen, M.kaars, 8, 0));
  delen.push(bollen(vlammen, 1.4, M.vlam, 9, [1, 1, 1.8]));
  // de ster in de top: vijf punten om een kern, plat naar de kijker
  const S = [0, 0, top + 9];
  const punten = [];
  for (let k = 0; k < 5; k++) {
    const h = -Math.PI / 2 + (k / 5) * Math.PI * 2;
    punten.push([[S, [S[0] + Math.cos(h) * 9, S[1], S[2] - Math.sin(h) * 9]], [2.6, 0.6]]);
  }
  delen.push(bundel(punten, M.ster, 7, 1.5));
  delen.push(tak([[0, 0, top - 4], S], [1.4, 1.2], 0, 1, 0));
  delen.push(onderGrond);
  return Object.assign(model(delen, mat, omhul(delen)), { sneeuwDikte: d.sneeuwDikte });
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
const jongeEik = (zaad = 1, o = {}) => eik(zaad, { ...o, jong: true });
const jongeDen = (zaad = 1, o = {}) => den(zaad, { ...o, jong: true });
const jongeBerk = (zaad = 1, o = {}) => berk(zaad, { ...o, jong: true });

const BEGROEIING = ['struik', 'bessenStruik', 'varen', 'grasPol', 'hoogGras', 'bloemen', 'paddenstoelen', 'boomstronk', 'rots', 'kleineRots'];

module.exports = {
  eik,
  EIK_VORMEN,
  herfstEik,
  beuk,
  linde,
  els,
  populier,
  knotwilg,
  meidoorn,
  hazelaar,
  kerstboom,
  SEIZOENEN,
  sneeuw,
  den,
  groveDen,
  berk,
  dodeBoom,
  wilg,
  appelboom,
  boompje,
  jongeEik,
  jongeDen,
  jongeBerk,
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
  stempel,
  opStempel,
  PLUKJES,
  zijkant,
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
