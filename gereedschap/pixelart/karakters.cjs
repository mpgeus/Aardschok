// Een gezicht per karakter (ontwerp/beeld.md, "Een gezicht per karakter", Marcel 25 sep 2026).
// Elk spel loot iedere boer een karakter (js/boeren.js); hier staat wat je daarvan ziet, op het lijf
// van de boer (boer(), dorpelingen.cjs) en van de boerin (boerin(), dorpelingen2.cjs). Die krijgen
// een tweede parameter met opties: kleuren, een hoofddeksel, wat ze dragen en vasthouden, en hoe ze
// hun armen houden. Zonder opties komt er precies de gewone boer of boerin uit, geen pixel anders.
//
// KARAKTERS zegt per karakter en per lijf welke opties. De hulpjes eronder bouwen de delen; elk zet
// zijn eigen materialen en deelnummers erbij (materiaal, deel), achter die van het lijf, zodat de
// gewone figuur er niets van merkt. Wat aan de romp vastzit (luit, riem, bont) beweegt met de romp
// mee, wat in een hand zit (de tas) met die arm; dat regelt de bouwfunctie met zijn bot()-aanroep.
//
// Ronde 1 (25 sep): de vijf van de vaste verdeling, acht vellen: boer-zanger, boerin-zanger,
// boer-woekeraar, boerin-woekeraar, boer-heethoofd, boerin-heethoofd, boerin-weduwe en
// boerin-vroedvrouw (de weduwe en de vroedvrouw zijn altijd vrouw). Van ver moet je ze kennen, dus
// telt het silhouet en de kleur meer dan een klein ding: een muts met een punt en een luithals
// boven de schouder, een bruine jas met een lichte bontkraag, handen in de zij, een zwarte kap,
// een wit schort. En niets is waterpas: een muts valt naar één kant, een buidel hangt scheef, de
// ene mouw is hoger opgestroopt dan de andere.
//
// Wegschrijven: node gereedschap/pixelart/dorpelingen-anim.cjs boer-zanger boerin-zanger ...,
// daarna node gereedschap/pixelart/naar-spel.cjs --alleen boer-zanger,boerin-zanger,...
// Dit bestand leunt alleen op de bouwstenen (kern, figuren, figuren2): dorpelingen.cjs laadt het,
// en een lus terug naar de dorpelingen zou een half geladen module geven.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
'use strict';
const { sdf, klem, mix, ruis3 } = require('./kern.cjs');
const { kegel, capsule, bol, ellips, plus, naarRamp } = require('./figuren.cjs');
const { ring, eenheid, langs } = require('./figuren2.cjs');

// ---------------------------------------------------------------- welk karakter wat draagt

// Per karakter de opties voor het lijf van de boer en van de boerin; wie een lijf niet heeft (de
// weduwe is altijd een vrouw), staat er niet bij. De opties zelf staan bij boer() en boerin().
const KARAKTERS = {
  // bonte muts met een veer, een luit op de rug. De handen zijn vrij: geen hooivork, geen mand.
  zanger: {
    boer: { hoed: 'muts', luit: true, links: 'hangt', strootje: false },
    boerin: { hoofd: 'muts', luit: true, mand: false, links: 'hangt', rechts: 'hangt' },
  },
  // zwart, met een kap over de witte doek. Het mandje eieren houdt ze.
  weduwe: {
    boerin: {
      hoofd: 'kap',
      jurk: { ramp: 'vacht', lo: 0.3, hi: 2.7 },
      schort: { ramp: 'vacht', lo: 0.9, hi: 3.6, patroon: (x) => (Math.sin(x * 1.1 + 0.6) > 0.8 ? -0.5 : 0) },
    },
  },
  // een nette bruine jas met bont, een buidel aan de riem, en een hand erop. Een donkere vilten hoed
  // in plaats van stro, en schoenen van leer: hij werkt niet op het land, hij leent uit.
  woekeraar: {
    boer: {
      hoed: 'vilt',
      kiel: { ramp: 'jas', lo: 1, hi: 4.8, patroon: (x, y, z) => (Math.sin(x * 1.3 + 0.4) > 0.86 && z < 50 ? -0.6 : 0) },
      klomp: { ramp: 'leer', lo: 0.5, hi: 3.4, glans: 1.2 },
      kraag: 'bont',
      riem: true,
      buidel: true,
      links: 'buidel',
      strootje: false,
    },
    boerin: {
      jurk: { ramp: 'jas', lo: 1, hi: 4.8 },
      schort: false,
      bont: true,
      riem: true,
      buidel: true,
      mand: false,
      links: 'buidel',
      rechts: 'hangt',
    },
  },
  // een wit schort met een borststuk, een hoofddoek in de nek geknoopt, een tas in de hand
  vroedvrouw: {
    boerin: {
      hoofd: 'nekdoek',
      jurk: { ramp: 'pet', lo: 1, hi: 5.2 },
      schort: { ramp: 'pleister', lo: 2.8, hi: 6.7, patroon: (x, y, z) => (Math.sin(x * 1.3 - z * 0.3) > 0.86 ? -0.6 : 0) },
      bef: true,
      mand: false,
      links: 'hangt',
      rechts: 'tas',
    },
  },
  // de mouwen hoog opgestroopt, een rood gezicht, de vuisten in de zij, en het haar recht overeind
  heethoofd: {
    boer: { hoed: 'geen', kraag: 'geen', mouw: 'op', rood: true, boos: true, links: 'zij', rechts: 'zij', strootje: false },
    boerin: { mouw: 'op', rood: true, boos: true, mand: false, links: 'zij', rechts: 'zij' },
  },
};

// ---------------------------------------------------------------- hulpjes

const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const punt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const kruis = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// zachte vereniging van twee afstanden (zoals de naad k in bouwSdf)
const zacht = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

// Een materiaal erbij, achter die van het lijf (ctx = { M, D, mat } van de bouwfunctie): geeft zijn
// nummer. Hetzelfde materiaal twee keer vragen geeft hetzelfde nummer.
function materiaal(ctx, naam, m) {
  const { M, mat } = ctx;
  if (M[naam] == null) M[naam] = Math.max(...Object.values(M)) + 1;
  mat[M[naam]] = m;
  return M[naam];
}
// Een deelnummer erbij (voor de binnenlijnen tussen delen), achter die van het lijf.
function deel(ctx, naam) {
  const { D } = ctx;
  if (D[naam] == null) D[naam] = Math.max(...Object.values(D)) + 1;
  return D[naam];
}

// Een doos met eigen assen [u, v, w] (eenheidsvectoren), halve maten h en ronde hoeken r.
function doos(c, [u, v, w], h, r, m, d) {
  return {
    f: (x, y, z) => {
      const p = [x - c[0], y - c[1], z - c[2]];
      return sdf.doos(punt(p, u), punt(p, v), punt(p, w), h[0], h[1], h[2], r);
    },
    g: [c[0], c[1], c[2], Math.hypot(...h) + 0.5],
    m,
    deel: d,
  };
}

// De grensbol om een romp met doorsnede rx(z), ry(z) rond cy(z), plus een rand (zoals grensbol in
// dorpelingen.cjs, dat dit bestand niet kan laden).
function rompGrens({ rx, ry, cy }, z0, z1, rand) {
  const zm = (z0 + z1) / 2;
  let r = 0;
  for (let z = z0; z <= z1 + 0.5; z += 0.5) {
    const zz = Math.min(z, z1);
    r = Math.max(r, Math.hypot(rx(zz) + rand, Math.abs(cy(zz) - 1) + ry(zz) + rand, zz - zm));
  }
  return [0, 1, zm, r + 1];
}

// Een band op een romp (een draagband, een baan bont): de schil op afstand los met halve dikte d,
// binnen een plak van halve breedte b rond het vlak door c met normaal n. voor: alleen de voorkant.
// Boven z1 loopt de schil recht omhoog door; een schuine band houdt daar vanzelf op, een steile
// (de banen bont) moet een eind hebben: tot.
function bandOpRomp(vorm, c, n, b, o, m, d) {
  const { rx, ry, cy } = vorm;
  const { los = 0.3, dik = 0.6, z0, z1, voor = false, tot = Infinity } = o;
  const nn = eenheid(n);
  return {
    f: (x, y, z) => {
      const zz = klem(z, z0, z1);
      const a = rx(zz) + los + dik;
      const bb = ry(zz) + los + dik;
      const e = (Math.hypot(x / a, (y - cy(zz)) / bb) - 1) * Math.min(a, bb);
      const h = (x - c[0]) * nn[0] + (y - c[1]) * nn[1] + (z - c[2]) * nn[2];
      let t = Math.max(Math.abs(e) - dik, Math.abs(h) - b, z - tot);
      if (voor) t = Math.max(t, cy(zz) - y);
      return t * 0.8;
    },
    g: rompGrens(vorm, z0, z1, los + 2 * dik),
    m,
    deel: d,
  };
}

// Een ring om een romp op hoogte z (een riem, een zoom van bont): een buis met straal r langs de
// doorsnede van de romp daar, op afstand los. plat < 1 maakt hem in de hoogte smaller.
function ringOmRomp(vorm, z, r, los, m, d, plat = 1) {
  const a = vorm.rx(z) + los;
  const b = vorm.ry(z) + los;
  const c = vorm.cy(z);
  return {
    f: (x, y, zz) => {
      const q = (Math.hypot(x / a, (y - c) / b) - 1) * Math.min(a, b);
      return Math.hypot(q, (zz - z) / plat) - r;
    },
    g: [0, c, z, Math.max(a, b) + r + 1],
    m,
    deel: d,
  };
}

// Een buis langs een kwadratische bezier, in n stukjes; r(t) en m(i) geven straal en materiaal per
// stuk (zo krijgt een muts banen in verschillende kleuren).
function buis(p0, p1, p2, r, n, m, d, k = 1) {
  const pt = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  const uit = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    uit.push(kegel(pt(t0), pt(t1), r(t0), r(t1), typeof m === 'function' ? m(i) : m, d, i === 0 ? undefined : k));
  }
  return uit;
}

// ---------------------------------------------------------------- materialen

const RIEM = { ramp: 'leer', lo: 0.6, hi: 3.4 };
const GESP = { ramp: 'goud', lo: 2.4, hi: 6.4, glans: 1.2, detail: true };
// grauwerk: grijs eekhoornbont, het bont van wie geld heeft. Licht genoeg om van ver op een bruine
// jas op te vallen, en toch anders dan de witte doek van de boerin erboven.
const BONT = {
  ramp: 'vacht',
  lo: 2.6,
  hi: 6.4,
  rand: 0.8,
  patroon: (x, y, z) => {
    const r = ruis3(x * 0.95, y * 0.95, z * 0.95, 23);
    return r > 0.55 ? 0.8 : r < -0.5 ? -0.9 : 0;
  },
};
// een witte veer: een donkerder schacht in het midden, de vlag licht
const VEER = { ramp: 'baard', lo: 3.4, hi: 6.9, rand: 0.6 };

// Een rood gezicht: waar de huid van het hoofd is, neemt rood het over, met hetzelfde licht en
// dezelfde schaduw (zoals de wangen van de heer, heer.cjs). H is het midden van het hoofd, [lo, hi]
// de maat van de huid; de handen en armen blijven gewoon huid.
function roodGezicht(H, [lo, hi], vorig = null) {
  return (x, y, z, nx, ny, nz, stap) => {
    const dx = x - H[0];
    const dy = y - H[1];
    const dz = z - H[2];
    if (dx * dx + dy * dy + dz * dz * 0.8 > 110) return vorig ? vorig(x, y, z, nx, ny, nz, stap) : 0;
    return naarRamp('rood', stap, [lo, hi], [3.5, 7.4]);
  };
}

// ---------------------------------------------------------------- op het hoofd

// Een bonte muts: een opgerolde gele rand om het hoofd, een bol van banen om en om rood en groen,
// en een zak die over de kruin naar één kant (zij) omvalt, met een kwastje aan de punt. In de rand
// aan de andere kant steekt een lange witte veer, schuin naar achteren. Van ver: een scheve punt en
// een witte streep boven het hoofd, en kleur waar de boer stro heeft.
function bonteMuts(delen, ctx, H, [rx, ry], o = {}) {
  const zij = o.zij ?? 1;
  const mRood = materiaal(ctx, 'mutsRood', { ramp: 'rood', lo: 2.4, hi: 6.9 });
  const mGroen = materiaal(ctx, 'mutsGroen', { ramp: 'blad', lo: 2.2, hi: 7 });
  const mGeel = materiaal(ctx, 'mutsGeel', { ramp: 'goud', lo: 2.4, hi: 6.2 });
  const mVeer = materiaal(ctx, 'veer', VEER);
  const dMuts = deel(ctx, 'muts');
  const dVeer = deel(ctx, 'veer');
  // de rand: voor boven de wenkbrauwen, achter lager, en een fractie scheef
  const c = plus(H, [0, -0.6, 3.2]);
  const a = rx + 0.95;
  const b = ry + 0.95;
  delen.push({
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      const dz = z - c[2] - 0.2 * dy - 0.07 * zij * dx;
      const q = (Math.hypot(dx / a, dy / b) - 1) * Math.min(a, b);
      return Math.hypot(q, dz / 1.15) - 1.35;
    },
    g: [c[0], c[1], c[2], Math.max(a, b) + 4],
    m: mGeel,
    deel: dMuts,
  });
  // de bol: zes banen, om en om rood en groen
  const kruin = plus(H, [0.7 * zij, -1.3, 6.4]);
  const baan = (x, y) => (Math.floor(((Math.atan2(y - kruin[1], x - kruin[0]) + Math.PI) / Math.PI) * 3) % 2 ? mRood : mGroen);
  delen.push(ellips(kruin, [rx + 1.5, ry + 1.3, 5.4], baan, dMuts, 1.2));
  // de zak: omhoog, dan over naar opzij en achter weer omlaag; banen om en om
  const p0 = plus(H, [1.4 * zij, -1.8, 9.8]);
  const p1 = plus(H, [6.4 * zij, -4.8, 15.4]);
  const p2 = plus(H, [10.6 * zij, -6.2, 7.2]);
  delen.push(...buis(p0, p1, p2, (t) => mix(4.6, 1.5, t), 5, (i) => (i % 2 ? mGroen : mRood), dMuts, 1.2));
  delen.push(bol(plus(p2, [0.4 * zij, -0.2, -1.2]), 1.8, mGeel, dMuts, 0.6));
  // de veer: uit de rand aan de andere kant, eerst omhoog, dan naar achteren weg
  const v0 = plus(H, [-6.9 * zij, -1.8, 4.4]);
  const v1 = plus(H, [-9.4 * zij, -4.6, 14.2]);
  const v2 = plus(H, [-7.2 * zij, -12.6, 19.2]);
  delen.push(...buis(v0, v1, v2, (t) => 0.5 + 1.25 * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.92)) ** 0.8, 6, mVeer, dVeer, 0.8));
}

// Een vilten hoed, donker en net: een bol die iets smaller wordt naar boven, met een deukje, een
// smalle rand die voor en achter iets afhangt, en een band. Hij staat een fractie scheef.
function vilthoed(delen, ctx, H) {
  const mVilt = materiaal(ctx, 'vilt', { ramp: 'vacht', lo: 0.4, hi: 3.2, glans: 0.3 });
  const mBand = materiaal(ctx, 'hoedband', { ramp: 'leer', lo: 0.3, hi: 2.2 });
  const dHoed = deel(ctx, 'vilthoed');
  const rand = plus(H, [0.3, -0.8, 6.3]);
  const kant = 0.06; // de hoed helt een fractie naar rechts
  delen.push({
    f: (x, y, z) => {
      const dx = x - rand[0];
      const dy = y - rand[1];
      const dz = z - rand[2] + 0.018 * dy * dy - kant * dx;
      return sdf.ellipsoide(dx, dy, dz, 11, 10.6, 0.85) * 0.75;
    },
    g: [rand[0], rand[1], rand[2], 12.5],
    m: mVilt,
    deel: dHoed,
  });
  delen.push({
    f: (x, y, z) => {
      const dx = x - rand[0] - 0.1 * (z - rand[2]);
      const dy = y - rand[1];
      const dz = z - rand[2] - kant * dx;
      const r = 6.6 - 0.17 * Math.max(0, dz);
      // de bol: een ronde kegel die naar boven smaller wordt, 8,4 hoog, met een deukje in de kruin
      const deuk = 0.9 * Math.max(0, 1 - Math.abs(dx) / 2.2) * Math.max(0, 1 - (dy * dy) / 30);
      return sdf.cilinder(dx, dy, dz, r - 1.4, 0, 8.4 - deuk - 1.4) - 1.4;
    },
    g: [rand[0], rand[1], rand[2] + 5, 9.5],
    m: (x, y, z) => (z < rand[2] + 2.2 + kant * (x - rand[0]) ? mBand : mVilt),
    deel: dHoed,
    k: 1,
  });
}

// Plukken haar die rechtop staan (het heethoofd, zonder hoed): korte kegels uit de kruin, elk een
// andere kant op.
function piekhaar(delen, H, m, d) {
  const plukken = [
    [-3.4, 1.6, 6.2, -1.4, 0.8, 3.2],
    [-1.2, 3, 7, -0.3, 1.8, 3.4],
    [1.4, 2.2, 7, 0.9, 1.1, 3.6],
    [3.6, 0.6, 6, 1.8, 0.2, 2.8],
    [-2.2, -1.6, 6.8, -1, -1.2, 3.2],
    [0.8, -2.4, 6.9, 0.6, -1.6, 3.4],
    [3, -3.6, 5.6, 1.6, -1.8, 2.8],
  ];
  for (const [x, y, z, dx, dy, dz] of plukken) {
    const voet = plus(H, [x, y, z]);
    delen.push(kegel(voet, plus(voet, [dx, dy, dz]), 1.7, 0.45, m, d, 0.8));
  }
}

// Boze wenkbrauwen: dik, en naar binnen omlaag (het heethoofd). oog = [x, z] van de ogen, oy de
// diepte ervan (zoals schedel() die teruggeeft).
function bozeWenkbrauwen(delen, H, oog, oy, m, d) {
  for (const s of [-1, 1]) {
    const binnen = plus(H, [s * (oog[0] - 1.2), oy + 0.3, oog[1] + 1.5]);
    const buiten = plus(H, [s * (oog[0] + 1.3), oy - 0.5, oog[1] + 2.7]);
    delen.push(capsule(binnen, buiten, 0.75, m, d));
  }
}

// Een boze mond: het omgekeerde van glimlach() (dorpelingen.cjs), de hoeken omlaag.
function bozeMond(delen, H, [rx, ry, rz], m, d, breed = 1.3, z = -4) {
  const opp = (dx, dz) => ry * Math.sqrt(Math.max(0, 1 - (dx / rx) ** 2 - (dz / rz) ** 2));
  const mid = plus(H, [0, opp(0, z) - 0.1, z]);
  for (const s of [-1, 1]) delen.push(capsule(plus(H, [s * breed, opp(s * breed, z - 0.6) - 0.1, z - 0.6]), mid, 0.5, m, d));
}
const MOND = { ramp: 'huid', lo: 1.6, hi: 2.6, detail: true, rand: 0, schaduw: false };

// De kap van de weduwe: zwart over de witte doek, het gezicht vrij in een ovaal dat net ruimer is
// dan dat van de doek (zo blijft er een witte rand om het gezicht), en achter een sluier die tot
// tussen de schouderbladen valt en naar onderen wat wijder wordt. Voorop, boven het voorhoofd, een
// punt: de weduwenkap. Van ver: een zwart hoofd op een zwart lijf, met een licht gezicht erin.
function weduwenkap(delen, ctx, H, [rx, ry, rz], o = {}) {
  const mKap = materiaal(ctx, 'kap', { ramp: 'vacht', lo: 0.2, hi: 2.5, patroon: (x, y, z) => (Math.sin(x * 1.4 + z * 0.3) > 0.85 ? -0.5 : 0) });
  const dKap = deel(ctx, 'kap');
  const { los = 2.1, dikte = 0.8, sluier = 45 } = o;
  const C = plus(H, [0, -0.3, 0.7]);
  const a = rx + los;
  const b = ry + los;
  const c = rz + los;
  const kap = (x, y, z) => {
    const dx = x - C[0];
    const dy = y - C[1];
    const dz = z - C[2];
    const schil = Math.abs(sdf.ellipsoide(dx, dy, dz, a, b, c)) - dikte;
    // het ovaal voor het gezicht, met bovenaan de punt die naar het voorhoofd wijst
    const piek = 1.4 * Math.max(0, 1 - Math.abs(dx) / 2.2);
    const ovaal = Math.max(Math.hypot(dx / (rx * 0.96), (dz + 0.9 + piek * Math.max(0, dz) * 0.35) / (rz * 1.04)) - 1, 1.2 - dy);
    return Math.max(schil, -ovaal * 2.5);
  };
  // de sluier: een schil om een stuk kegel achter het hoofd, van het hoofd tot sluier (z)
  const z1 = H[2] - 1;
  const sluierF = (x, y, z) => {
    const t = klem((z1 - z) / (z1 - sluier), 0, 1);
    const sa = mix(rx + 2.2, rx + 4.8, t);
    const sb = mix(ry + 1.6, ry + 2.2, t);
    const sc = mix(H[1] - 1.6, -1.4, t);
    const e = (Math.hypot(x / sa, (y - sc) / sb) - 1) * Math.min(sa, sb);
    // de onderrand golft een beetje (de stof valt niet recht)
    const onder = sluier + 0.8 * Math.sin(x * 0.7 + 0.5);
    return Math.max(Math.abs(e) - dikte, onder - z, z - z1 - 2, y - (sc + 0.8));
  };
  delen.push({
    f: (x, y, z) => zacht(kap(x, y, z), sluierF(x, y, z), 1.6),
    g: [0, H[1] - 1.5, (H[2] + c + sluier) / 2, Math.hypot(rx + 6, (H[2] + c - sluier) / 2) + 2],
    m: mKap,
    deel: dKap,
  });
}

// ---------------------------------------------------------------- op de romp

// Een luit op de rug: de bolle klankkast naar buiten, met ribben om en om licht en donker, de hals
// schuin omhoog langs het hoofd, en de kop met de stemsleutels naar achteren geknikt. voet = de
// onderkant van de kast, top = het eind van de hals, rug = de richting van de rug af. De draagband
// loopt schuin over de borst, van de andere schouder naar de heup onder de hals, zodat hij de hals
// op de rug kruist en niet bedekt (vorm = de romp, z0/z1 zijn onder- en bovenkant). Alles beweegt
// met de romp.
function luit(delen, ctx, o) {
  const { voet, top, vorm, z0, z1, rug = [0, -1, 0], schouder, heup } = o;
  const L = Math.hypot(...min(top, voet));
  const u = eenheid(min(top, voet));
  const b = eenheid(min(rug, maal(u, punt(rug, u))));
  const w = kruis(b, u);
  const lok = (x, y, z) => {
    const d = [x - voet[0], y - voet[1], z - voet[2]];
    return [punt(d, u), punt(d, w), punt(d, b)];
  };
  // de klankkast: een halve peer, de bolle kant van de rug af (h > 0), de ribben rond de lengteas
  const kast = 0.5 * L;
  const ribben = (x, y, z) => {
    const [, s, h] = lok(x, y, z);
    return Math.sin(Math.atan2(s, h) * 11) > 0.3 ? -1 : 0;
  };
  const mKast = materiaal(ctx, 'luit', { ramp: 'hout', lo: 2.2, hi: 6.6, glans: 0.8, patroon: ribben });
  const mHals = materiaal(ctx, 'luitHals', { ramp: 'hout', lo: 2, hi: 5.6 });
  const mSleutel = materiaal(ctx, 'stemsleutel', { ramp: 'leer', lo: 0.4, hi: 2.6, detail: true });
  const mBand = materiaal(ctx, 'draagband', RIEM);
  const dLuit = deel(ctx, 'luit');
  const dBand = deel(ctx, 'draagband');
  delen.push({
    f: (x, y, z) => {
      const [a, s, h] = lok(x, y, z);
      const e1 = sdf.ellipsoide(a - kast * 0.42, s, h, kast * 0.44, 6.6, 5.3);
      const e2 = sdf.ellipsoide(a - kast * 0.76, s, h, kast * 0.34, 3.2, 3.3);
      return Math.max(zacht(e1, e2, 2.6), -h);
    },
    g: [...langs(voet, top, (kast * 0.54) / L), Math.hypot(kast * 0.58, 6.8) + 1],
    m: mKast,
    deel: dLuit,
  });
  // de hals, plat, op de kast
  const h0 = kast - 0.6;
  const hm = (h0 + L) / 2;
  delen.push(doos(plus(voet, plus(maal(u, hm), maal(b, 0.6))), [u, w, b], [(L - h0) / 2, 1.4, 0.8], 0.35, mHals, dLuit));
  // de kop, naar achteren geknikt, met een paar stemsleutels opzij
  const knik = eenheid(plus(maal(u, 0.45), maal(b, 0.9)));
  const kn = kruis(knik, w);
  const kop = plus(top, plus(maal(knik, 2.6), maal(b, 0.4)));
  delen.push(doos(kop, [knik, w, kn], [3, 1.25, 0.7], 0.3, mHals, dLuit));
  for (const t of [-1.6, 0.2, 2]) {
    for (const s of [-1, 1]) delen.push(capsule(plus(kop, maal(knik, t)), plus(kop, plus(maal(knik, t + 0.3), maal(w, s * 2.1))), 0.42, mSleutel, dLuit));
  }
  // de draagband: het vlak door de schouder en de andere heup, loodrecht op de borst
  const r = min(heup, schouder);
  const n = eenheid(kruis(r, [0, 1, 0]));
  delen.push(bandOpRomp(vorm, schouder, n, 1.05, { los: 0.25, dik: 0.55, z0, z1, tot: schouder[2] + 1.6 }, mBand, dBand));
}

// Een riem om de romp op hoogte z, met een koperen gesp voorop. Geeft de ring terug (a, b, c, z),
// zodat er een buidel aan kan.
function riem(delen, ctx, vorm, z, o = {}) {
  const { breed = 1.15, gesp = 0.4 } = o;
  const mRiem = materiaal(ctx, 'riem', RIEM);
  const mGesp = materiaal(ctx, 'gesp', GESP);
  const dRiem = deel(ctx, 'riem');
  const a = vorm.rx(z) + 0.45;
  const b = vorm.ry(z) + 0.45;
  const c = vorm.cy(z);
  delen.push({
    f: (x, y, zz) => Math.max(Math.abs((Math.hypot(x / a, (y - c) / b) - 1) * Math.min(a, b)) - 0.55, Math.abs(zz - z) - breed),
    g: [0, c, z, Math.max(a, b) + 2],
    m: mRiem,
    deel: dRiem,
  });
  const voor = [gesp, c + b * Math.sqrt(Math.max(0, 1 - (gesp / a) ** 2)) + 0.35, z];
  delen.push(doos(voor, [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.45, 0.45, 1.35], 0.3, mGesp, dRiem));
  return { a, b, c, z };
}

// Een leren buidel aan de riem (band = wat riem() teruggeeft), op x: een bolle zak die een fractie
// scheef hangt, dichtgeknoopt met een koord, en een lus om de riem. Geeft de bovenkant terug, waar
// een hand op kan rusten.
function buidel(delen, ctx, band, x) {
  const { a, b, c, z } = band;
  // donkerrood leer met een geel koord: op een bruine jas moet hij opvallen
  const mBuidel = materiaal(ctx, 'buidel', { ramp: 'rood', lo: 1.2, hi: 4.6, glans: 0.6 });
  const mKoord = materiaal(ctx, 'koord', { ramp: 'goud', lo: 2.2, hi: 5.6, detail: true });
  const dBuidel = deel(ctx, 'buidel');
  const y = c + b * Math.sqrt(Math.max(0, 1 - (x / a) ** 2));
  const lus = [x, y + 0.5, z];
  const hals = [x + 0.3, y + 1.7, z - 2.6];
  const lijf = [x + 0.8, y + 2.6, z - 6.6];
  delen.push(ellips(lijf, [3.4, 2.8, 3.7], mBuidel, dBuidel, 1.2));
  delen.push(kegel(hals, plus(lijf, [0, 0, 1.8]), 1.1, 2.4, mBuidel, dBuidel, 1));
  delen.push(ellips(plus(hals, [0, 0, 0.9]), [1.6, 1.3, 0.8], mBuidel, dBuidel, 0.4));
  delen.push(ring(hals, [0.1, 0.25, 1], 1.2, 0.42, mKoord, dBuidel));
  delen.push(capsule(lus, hals, 0.5, mBuidel, dBuidel));
  return plus(hals, [0, 0.4, 1]);
}

// Een kraag van bont: een dikke rol om de hals, over de schouders, voorop open (zoals bij de heer,
// heer.cjs). c = het midden van de rol, [a, b] zijn stralen, r de dikte.
function bontKraag(delen, ctx, c, [a, b], r, o = {}) {
  const { open = 3.4, zak = 0.16 } = o;
  const mBont = materiaal(ctx, 'bont', BONT);
  const dBont = deel(ctx, 'bont');
  delen.push({
    f: (x, y, z) => {
      const dx = x - c[0];
      const dy = y - c[1];
      // voorop zakt hij iets af, naar de borst
      const dz = z - c[2] + zak * Math.max(0, dy);
      const q = (Math.hypot(dx / a, dy / b) - 1) * Math.min(a, b);
      return Math.max((Math.hypot(q, dz / 0.85) - r) * 0.8, Math.min(dy - b * 0.4, open - Math.abs(dx)));
    },
    g: [c[0], c[1], c[2], Math.max(a, b) + r + 2],
    m: mBont,
    deel: dBont,
  });
}

// Bont langs de voorkant van een jas: twee banen van de kraag naar de riem, in een V die naar boven
// wijder wordt (x = [onder, boven], naast de sluiting).
function bontBanen(delen, ctx, vorm, z0, z1, [x0, x1]) {
  const mBont = materiaal(ctx, 'bont', BONT);
  const dBont = deel(ctx, 'bont');
  for (const s of [-1, 1]) {
    const n = [z1 - z0, 0, -s * (x1 - x0)];
    delen.push(bandOpRomp(vorm, [s * x0, 0, z0], n, 1.5, { los: 0.1, dik: 0.75, z0, z1, voor: true, tot: z1 }, mBont, dBont));
  }
}

// Een zoom van bont onderaan een jas, of om een pols (as = de richting van de onderarm).
function bontZoom(delen, ctx, vorm, z, r = 1.3) {
  delen.push(ringOmRomp(vorm, z, r, 0.15, materiaal(ctx, 'bont', BONT), deel(ctx, 'bont'), 0.9));
}
function bontManchet(delen, ctx, pols, as, R) {
  delen.push(ring(pols, as, R, 1.3, materiaal(ctx, 'bont', BONT), deel(ctx, 'bont')));
}

// ---------------------------------------------------------------- in de hand

// De tas van de vroedvrouw: een leren tas met een klep en een koperen sluiting, aan een hengsel in
// de hand. Hij hangt onder de hand, lang in de looprichting, een fractie scheef, en zwaait met die
// arm mee. hand = het midden van de hand, zij = aan welke kant de arm zit (de sluiting naar buiten).
function tas(delen, ctx, hand, zij = 1) {
  const mTas = materiaal(ctx, 'tas', { ramp: 'leer', lo: 1.1, hi: 4.8, glans: 0.6 });
  const mKlep = materiaal(ctx, 'tasKlep', { ramp: 'leer', lo: 0.5, hi: 3.4, glans: 0.6 });
  const mGesp = materiaal(ctx, 'gesp', GESP);
  const dTas = deel(ctx, 'tas');
  // het hengsel: een boog door de vuist
  const h = plus(hand, [0.2 * zij, 0, -0.8]);
  const hengsel = ring(h, [1, 0, 0], 2.2, 0.5, mKlep, dTas);
  delen.push({ ...hengsel, f: (x, y, z) => Math.max(hengsel.f(x, y, z), h[2] - 1.6 - z) });
  // de tas: iets gekanteld (hij hangt niet recht), de klep over de bovenkant
  const hoek = (7 * Math.PI) / 180;
  const u = [Math.cos(hoek), 0, Math.sin(hoek) * zij];
  const v = [0, 1, 0];
  const w = kruis(u, v);
  const c = plus(hand, [0.5 * zij, 0.3, -6.6]);
  delen.push(doos(c, [u, v, w], [2.2, 4.4, 3.2], 1.5, mTas, dTas));
  delen.push(doos(plus(c, plus(maal(w, 2.2), maal(u, 0.25 * zij))), [u, v, w], [2.35, 4.5, 1.2], 0.8, mKlep, dTas));
  delen.push(bol(plus(c, plus(maal(u, 2.35 * zij), maal(w, 1))), 0.75, mGesp, dTas));
}

module.exports = {
  KARAKTERS,
  materiaal,
  deel,
  roodGezicht,
  bonteMuts,
  vilthoed,
  piekhaar,
  bozeWenkbrauwen,
  bozeMond,
  MOND,
  weduwenkap,
  luit,
  riem,
  buidel,
  bontKraag,
  bontBanen,
  bontZoom,
  bontManchet,
  tas,
};
