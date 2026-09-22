// Meer dorpelingen voor een groot dorp: drie kinderen (jongen, meisje, kleuter) en vijf
// volwassenen die bij elkaar horen (smidsvrouw, boerin, bruidegom en bruid, en de oude man van de
// dorpsoudste). Dezelfde bouwstenen, maten en materialen als dorpelingen.cjs; de hulpjes komen
// daarvandaan, en dat bestand blijft zoals het is.
// Nieuwe hulpjes staan hier: arm, rokVan, hoofddoek, mand, vlecht, draaiDelen, blosjes,
// vrouwenlijf, middelband en haarKap.
// Kinderen: het hoofd is ongeveer een kwart van de lengte, armen en benen zijn kort, het gezicht
// is rond, met iets grotere ogen die lager in het gezicht staan dan bij een volwassene.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// ALLE_DORPELINGEN zet de twaalf op een rij: de vier uit dorpelingen.cjs krijgen hier hun
// ZO-portret (PORTRET_ZO), zoals Wim en de tovenaar dat hebben.
// Wegschrijven: dorpelingen-export.cjs.
'use strict';
const { sdf, bouwSdf, klem, mix } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus, naarRamp } = require('./figuren.cjs');
const { ring, schijf, eenheid, langs } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const {
  DORPELINGEN, profiel, romp, schil, klokrok, schedel, glimlach,
  houdingDorpeling, bottenDorpeling, knieTussen, beenPunten, voetBot,
} = require('./dorpelingen.cjs');

// ---------------------------------------------------------------- hulpjes

const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };
const MOND = { ramp: 'huid', lo: 1.6, hi: 2.6, detail: true, rand: 0, schaduw: false };
// blosjes op de wangen: een patroon voor de huid, rond (x = ±bx, z = bz) voor het gezicht (y > vy)
const blosjes = (bx, bz, vy, lo, hi, groot = 1.1) => (x, y, z, nx, ny, nz, stap) => {
  if (y < vy) return 0;
  for (const s of [-1, 1]) {
    const dx = x - s * bx;
    const dz = z - bz;
    if (dx * dx + dz * dz * 2.4 < groot) return naarRamp('rood', stap, [lo, hi], [6.4, 8.4]);
  }
  return 0;
};

// Een arm: de bovenarm van schouder S naar elleboog E, de onderarm naar de pols, en een hand op H.
// De mouw loopt tot 'tot' (0 = schouder, 1 = elleboog, 2 = pols), met een omgeslagen rand van
// dikte 'rol'. r = stralen bij schouder, elleboog en pols. Geeft de pols terug.
function arm(delen, S, E, H, o) {
  const { mouw, huid, dArm, dHand, r = [3.4, 3, 2.3], tot = 2, rol = 0, hand = [2.4, 2.6, 2.8] } = o;
  const pols = plus(H, maal(eenheid(min(E, H)), hand[2] * 0.85));
  const langsLijn = (a, b, t0) => (x, y, z) => {
    const ab = min(b, a);
    const t = ((x - a[0]) * ab[0] + (y - a[1]) * ab[1] + (z - a[2]) * ab[2]) / (ab[0] ** 2 + ab[1] ** 2 + ab[2] ** 2);
    return t0 + klem(t, 0, 1) < tot ? mouw : huid;
  };
  delen.push(kegel(S, E, r[0], r[1], langsLijn(S, E, 0), dArm, 1.2));
  delen.push(kegel(E, pols, r[1] * 0.95, r[2], langsLijn(E, pols, 1), dArm, 1));
  if (rol && tot < 2) {
    const [a, b, t] = tot <= 1 ? [S, E, tot] : [E, pols, tot - 1];
    const rr = tot <= 1 ? mix(r[0], r[1], t) : mix(r[1] * 0.95, r[2], t);
    delen.push(ring(langs(a, b, t), eenheid(min(b, a)), rr + 0.15, rol, mouw, dArm));
  }
  delen.push(ellips(H, hand, huid, dHand, 0.6));
  return pols;
}

// Een rok die niet op de grond begint (een kinderjurk, een kiel): klokrok van z0 tot z1.
function rokVan(z0, z1, rx, ry, cy, m, deel, plooi = 1) {
  const p = klokrok(z1 - z0, rx, ry, cy, m, deel, plooi);
  return { ...p, f: (x, y, z) => p.f(x, y, z - z0), g: [p.g[0], p.g[1], p.g[2] + z0, p.g[3]] };
}

// Een hoofddoek als schil om het hoofd (midden H, stralen maat). soort 'kin': om het hele hoofd en
// onder de kin door, het gezicht vrij in een ovaal. soort 'nek': over kruin en achterhoofd, het
// voorhoofd, het gezicht en de oren vrij; de knoop zit dan in de nek (die maakt de figuur zelf).
function hoofddoek(H, [rx, ry, rz], soort, m, deel, o = {}) {
  const { los = 1.1, dikte = 0.75, voorhoofd = 4 } = o;
  const a = rx + los;
  const b = ry + los;
  const c = rz + los;
  return {
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const doek = Math.abs(sdf.ellipsoide(dx, dy, dz, a, b, c)) - dikte;
      if (soort === 'kin') {
        const ovaal = Math.max(Math.hypot(dx / (rx * 0.74), (dz + 0.3) / (rz * 0.8)) - 1, 1 - dy);
        return Math.max(doek, -ovaal * 2.5);
      }
      const zOnder = voorhoofd - (ry - dy) * 0.62;
      return Math.max(doek, zOnder - dz);
    },
    g: [H[0], H[1], H[2], Math.max(a, b, c) + dikte + 1],
    m,
    deel,
  };
}

// Een mand van riet: open van boven, met een rand en een hengsel over de lengte. c = midden van de
// bodem, r = [rx, ry] bovenaan, h = hoogte, draai = hoek om de z-as (graden).
function mand(delen, c, [rx, ry], h, mRiet, deel, draai = 0) {
  const a = (draai * Math.PI) / 180;
  const co = Math.cos(a);
  const si = Math.sin(a);
  const lokaal = (x, y) => [(x - c[0]) * co + (y - c[1]) * si, -(x - c[0]) * si + (y - c[1]) * co];
  const straal = (z) => {
    const t = klem((z - c[2]) / h, 0, 1);
    return [mix(rx * 0.8, rx, t), mix(ry * 0.8, ry, t)];
  };
  const ellipsAfstand = (u, v, ea, eb) => (Math.hypot(u / ea, v / eb) - 1) * Math.min(ea, eb);
  delen.push({
    f: (x, y, z) => {
      const [u, v] = lokaal(x, y);
      const [ea, eb] = straal(z);
      const buiten = Math.max(ellipsAfstand(u, v, ea, eb), c[2] - z, z - c[2] - h);
      const binnen = Math.max(ellipsAfstand(u, v, ea - 0.8, eb - 0.8), c[2] + 0.8 - z);
      return Math.max(buiten, -binnen) * 0.9;
    },
    g: [c[0], c[1], c[2] + h / 2, Math.hypot(rx, ry, h / 2) + 1],
    m: mRiet,
    deel,
  });
  // rand
  delen.push({
    f: (x, y, z) => {
      const [u, v] = lokaal(x, y);
      return Math.max(Math.abs(ellipsAfstand(u, v, rx - 0.3, ry - 0.3)) - 0.75, Math.abs(z - c[2] - h) - 0.7);
    },
    g: [c[0], c[1], c[2] + h, Math.max(rx, ry) + 1.5],
    m: mRiet,
    deel,
  });
  // hengsel: een halve ring over de lengte van de mand
  const as = [-si, co, 0];
  const hengsel = ring([c[0], c[1], c[2] + h], as, rx - 0.6, 0.65, mRiet, deel);
  delen.push({ ...hengsel, f: (x, y, z) => Math.max(hengsel.f(x, y, z), c[2] + h - z) });
  return [c[0], c[1], c[2] + h];
}
// het vlechtwerk van riet: om en om licht en donker, als een dambord van banden
const rietPatroon = (c, draai = 0) => (x, y, z) => {
  const a = Math.atan2(y - c[1], x - c[0]) - (draai * Math.PI) / 180;
  const s = Math.sin(a * 9) * Math.sin((z - c[2]) * 1.5);
  return s > 0.25 ? 0.6 : s < -0.25 ? -0.6 : 0;
};

// Een vlecht: kralen die om en om iets opzij liggen, langs een boog van p0 via p1 naar p2, en
// dunner naar het eind. zij = de richting waarin de kralen uitwijken. Geeft het eindpunt terug.
function vlecht(delen, p0, p1, p2, r0, r1, n, m, deel, zij = [0, 0, 1]) {
  const punt = (t) => [0, 1, 2].map((i) => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const r = mix(r0, r1, t);
    delen.push(bol(plus(punt(t), maal(zij, (i % 2 ? 1 : -1) * r * 0.3)), r, m, deel, 0.4));
  }
  return punt(1);
}

// Een groep delen draaien om een as door punt c, over 'graden' (rechtsom gezien langs de as).
// Afstandsfuncties en materiaalfuncties krijgen de teruggedraaide plek, zodat patronen meedraaien.
function draaiDelen(delen, as, graden, c) {
  const [ux, uy, uz] = eenheid(as);
  const draai = (x, y, z, hoek) => {
    const co = Math.cos(hoek);
    const si = Math.sin(hoek);
    const d = ux * x + uy * y + uz * z;
    return [
      x * co + (uy * z - uz * y) * si + ux * d * (1 - co),
      y * co + (uz * x - ux * z) * si + uy * d * (1 - co),
      z * co + (ux * y - uy * x) * si + uz * d * (1 - co),
    ];
  };
  const a = (graden * Math.PI) / 180;
  const terug = (x, y, z) => plus(draai(x - c[0], y - c[1], z - c[2], -a), c);
  const heen = (p) => plus(draai(p[0] - c[0], p[1] - c[1], p[2] - c[2], a), c);
  return delen.map((p) => ({
    ...p,
    f: (x, y, z) => p.f(...terug(x, y, z)),
    g: p.g ? [...heen(p.g), p.g[3]] : undefined,
    m: typeof p.m === 'function' ? (x, y, z) => p.m(...terug(x, y, z)) : p.m,
  }));
}

const JONGEN_SNELHEID = 1.3;
// fps blijft 10, ook al is hij een kind: zie DORPSOUDSTE_FPS (dorpelingen.cjs) voor waarom.
const JONGEN_FPS = 10;

// ---------------------------------------------------------------- de jongen

// De jongen: een pet van zijn vader die hem veel te groot is en scheef zakt, een groen hemd met
// bretels, een korte broek met blote knieën, en een houten zwaard dat hij heldhaftig omhoog steekt.
// De andere vuist in de zij, net als de grote mensen.
// stand: zie smid() (dorpelingen.cjs). Kinderen lopen in een vlugger maatje dan volwassenen.
function jongen(stand = null) {
  const M = { huid: 0, hemd: 1, broek: 2, sok: 3, laars: 4, haar: 5, oog: 6, pet: 7, hout: 8, touw: 9, mond: 10, bretel: 11 };
  const D = { benen: 1, lijf: 2, bretels: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, pet: 9, zwaard: 10 };
  const H = [0, 2.4, 51];
  const maat = [6.9, 6.6, 7.1];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.8, hi: 6.6, schaduwKracht: 0.7, patroon: blosjes(3.7, H[2] - 2.6, H[1] + 3, 1.8, 6.6) };
  mat[M.hemd] = { ramp: 'blad', lo: 1.4, hi: 6.2 };
  mat[M.broek] = { ramp: 'aarde', lo: 0.8, hi: 4.8 };
  mat[M.sok] = { ramp: 'pleister', lo: 1.4, hi: 5, patroon: (x, y, z) => (Math.sin(z * 3.2) > 0.6 ? -0.6 : 0) };
  mat[M.laars] = { ramp: 'leer', lo: 0.6, hi: 4.8 };
  mat[M.haar] = { ramp: 'hout', lo: 0.8, hi: 4.8, patroon: (x, y, z) => (Math.sin(x * 2.4 + z * 1.1) > 0.55 ? 0.7 : 0) };
  mat[M.oog] = OOG;
  mat[M.pet] = { ramp: 'vacht', lo: 1.3, hi: 5.2, patroon: (x, y, z) => (Math.sin((x + y) * 0.9) > 0.75 ? -0.5 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 2.4, hi: 6.6 };
  mat[M.touw] = { ramp: 'leer', lo: 1, hi: 4 };
  mat[M.mond] = MOND;
  mat[M.bretel] = { ramp: 'leer', lo: 0.8, hi: 4 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: JONGEN_SNELHEID, fps: JONGEN_FPS, beenLengte: 17 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.3, 23.5],
    nek: [0, 0, 39.5],
    schouders: [[-7.8, 0.3, 36.5], [7.8, 0.3, 36.5]],
  });

  // --- laarsjes, sokken tot onder de knie, blote knieën, korte broek. Het been (sok/knie/broek in
  // één kegel, per z-hoogte gekleurd) buigt bij de knie; de laars is dan het voetstuk (voetBot).
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const beenMat = (x, y, z) => (z < 11 ? M.sok : z < 14.5 ? M.huid : M.broek);
    if (hg) {
      const heupR = [s * 3.4, 0, 24];
      const enkelR = [s * 3.3, 0.3, 5];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 3, 2.7, beenMat, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 2.7, 2.4, beenMat, D.benen, 1));
    } else {
      delen.push(kegel([s * 3.4, 0, 24], [s * 3.3, 0.3, 5], 3, 2.4, beenMat, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 3.3, 1.6, 2.1], [2.6, 4.2, 2.3], M.laars, D.benen, 1));
    delen.push(kegel([s * 3.3, 0.3, 2.4], [s * 3.3, 0.3, 6.6], 2.7, 2.6, M.laars, D.benen, 1));
    bot(voetBot(hg, i, [s * 3.3, 1.6, 0]));
  }
  delen.push(ellips([0, 0.3, 23.5], [7.6, 5.4, 4.6], M.broek, D.benen, 1.5));
  // --- hemd, schouders, bretels die het lijf volgen
  const lijf = {
    rx: profiel([[21, 7.2], [27, 7.4], [33, 7.8], [38, 7.2]]),
    ry: profiel([[21, 5.4], [27, 5.8], [33, 5.4], [38, 4.6]]),
    cy: profiel([[21, 0.3], [27, 0.8], [38, 0.3]]),
  };
  const bovenlijf = [romp(lijf, 21, 38, M.hemd, D.lijf, 2), ellips([0, 0.3, 37], [8, 4.8, 3.4], M.hemd, D.lijf, 2.5)];
  delen.push(...bovenlijf);
  const lijfAfstand = bouwSdf(bovenlijf);
  delen.push({
    f: (x, y, z) => Math.max(Math.abs(lijfAfstand(x, y, z) - 0.4) - 0.4, Math.abs(Math.abs(x) - 3.3) - 0.75, 26.5 - z, z - 41),
    g: [0, 0.5, 33.5, 13],
    m: M.bretel,
    deel: D.bretels,
  });
  bot(Bn.Bromp);

  // --- armen: korte mouwen. Rechts steekt hij het zwaard omhoog, links de vuist in de zij. Het
  // zwaard houdt hij vast (niet op de grond, net als de hamer van de smid), dus het zwaait mee
  // met de rechterarm.
  const kind = { mouw: M.hemd, huid: M.huid, r: [2.5, 2.1, 1.7], tot: 0.55, hand: [1.9, 2, 2.2] };
  const hand = [9.6, 2.8, 43.6];
  const richting = eenheid([0.16, 0.1, 1]);
  const kruisHout = plus(hand, maal(richting, 2.8));
  delen.push(capsule(plus(hand, maal(richting, -2.6)), kruisHout, 0.85, M.hout, D.zwaard));
  delen.push(capsule(plus(kruisHout, [-2.4, 2.2, 1]), plus(kruisHout, [2.4, -2.2, -1]), 0.75, M.hout, D.zwaard));
  delen.push(kegel(kruisHout, plus(kruisHout, maal(richting, 13)), 1.1, 0.85, M.hout, D.zwaard));
  delen.push(ring(kruisHout, richting, 1.2, 0.5, M.touw, D.zwaard));
  arm(delen, [7.8, 0.3, 36.5], [12, 1, 38.6], hand, { ...kind, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-7.8, 0.3, 36.5], [-11.4, -1.4, 31], [-8.4, 1.4, 27.4], { ...kind, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: rond, grote lage ogen, een brede grijns; bruin haar onder de pet uit
  const oy = schedel(delen, H, M, D, { maat, oog: [2.5, -0.3], oogR: 1, oor: 0.95 });
  delen.push(bol(plus(H, [0, 6.7, -2.2]), 1.2, M.huid, D.hoofd, 0.8));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.7, -4.2);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.6, oy + 0.1, 2.2]), [1.6, 0.7, 0.6], M.haar, D.hoofd, 0.4));
  delen.push(ellips(plus(H, [0, -1.8, 0.8]), [7.2, 6.3, 6.8], M.haar, D.hoofd, 1));
  for (const x of [-3.6, -1.4, 1.2, 3.4]) delen.push(bol(plus(H, [x, 5.4, 4.6 - Math.abs(x) * 0.2]), 1.5, M.haar, D.hoofd, 0.6));
  // de pet: te groot, zakt scheef naar links over het oor
  const pet = [
    ellips(plus(H, [0, -0.4, 5.2]), [8.8, 9.2, 3.1], M.pet, D.pet, 1),
    bol(plus(H, [0, -0.4, 8.2]), 0.9, M.pet, D.pet, 0.4),
    {
      f: (x, y, z) => {
        const dx = x - H[0];
        const dy = y - (H[1] + 7.6);
        const dz = z - (H[2] + 4.9) - 0.12 * dy;
        return sdf.ellipsoide(dx, dy, dz, 5.8, 3.8, 0.75) * 0.85;
      },
      g: [H[0], H[1] + 7.6, H[2] + 4.9, 7],
      m: M.pet,
      deel: D.pet,
    },
  ];
  delen.push(...draaiDelen(pet, [0, 1, 0], -13, plus(H, [0, 0, 1])));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 32], straal: 40 });
}

const MEISJE_SNELHEID = 1.25;
// fps blijft 10: zie DORPSOUDSTE_FPS (dorpelingen.cjs) voor waarom.
const MEISJE_FPS = 10;

// ---------------------------------------------------------------- het meisje

// Het meisje: blonde vlechten die opzij uitsteken, met rode strikjes, een oranje jurk met een wit
// kraagje en pofmouwtjes, en in haar armen een zwarte kat met gele ogen.
// stand: zie smid() (dorpelingen.cjs).
function meisje(stand = null) {
  const M = { huid: 0, jurk: 1, bloes: 2, kous: 3, schoen: 4, haar: 5, oog: 6, strik: 7, kat: 8, katoog: 9, mond: 10 };
  const D = { benen: 1, rok: 2, lijf: 3, kraag: 4, armL: 5, armR: 6, handL: 7, handR: 8, hoofd: 9, haar: 10, kat: 11 };
  const H = [0, 2.6, 49];
  const maat = [6.7, 6.5, 6.9];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.9, hi: 6.7, schaduwKracht: 0.7, patroon: blosjes(3.6, H[2] - 2.6, H[1] + 3, 1.9, 6.7) };
  mat[M.jurk] = { ramp: 'herfst', lo: 1.2, hi: 5.8 };
  mat[M.bloes] = { ramp: 'pleister', lo: 2.4, hi: 6.4 };
  mat[M.kous] = { ramp: 'pleister', lo: 2, hi: 6 };
  mat[M.schoen] = { ramp: 'vacht', lo: 0.2, hi: 2.6, glans: 1.2 };
  mat[M.haar] = {
    ramp: 'stro',
    lo: 2,
    hi: 6.2,
    patroon: (x, y, z) => {
      // een scheiding in het midden, en lokken
      if (Math.abs(x) < 0.4 && z > H[2] + 3.5 && y < H[1] + 6) return -1.4;
      return Math.sin(x * 2.2 + z * 0.6) > 0.6 ? 0.6 : 0;
    },
  };
  mat[M.oog] = OOG;
  mat[M.strik] = { ramp: 'rood', lo: 3, hi: 7 };
  mat[M.kat] = { ramp: 'vacht', lo: 0.2, hi: 2.5, glans: 0.9, glansMacht: 14 };
  mat[M.katoog] = { ramp: 'goud', lo: 4, hi: 6.4, detail: true, schaduw: false, rand: 0 };
  mat[M.mond] = MOND;

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: MEISJE_SNELHEID, fps: MEISJE_FPS, beenLengte: 15 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.3, 20],
    nek: [0, 0, 40.2],
    schouders: [[-7.4, 0.3, 37.2], [7.4, 0.3, 37.2]],
  });

  // --- schoentjes, witte kousen, blote knieën: het rokje is kort, dus de benen blijven zichtbaar
  // en buigen bij de knie.
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const beenMat = (x, y, z) => (z < 12.5 ? M.kous : M.huid);
    if (hg) {
      const heupR = [s * 3.1, 0, 20];
      const enkelR = [s * 3, 0.3, 3];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 2.7, 2.45, beenMat, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 2.45, 2.2, beenMat, D.benen, 1));
    } else {
      delen.push(kegel([s * 3.1, 0, 20], [s * 3, 0.3, 3], 2.7, 2.2, beenMat, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 3, 1.5, 1.7], [2.3, 3.8, 1.9], M.schoen, D.benen, 1));
    bot(voetBot(hg, i, [s * 3, 1.5, 0]));
  }
  // --- jurk: een klokrokje tot net boven de knie, een lijfje, een wit kraagje. De rok zwaait
  // zelf mee (Bn.Brok), ook al is hij kort — een rok wiebelt altijd wat breder dan het lijf.
  delen.push(rokVan(14, 29, [9.4, 7], [8, 5.6], () => 0.5, M.jurk, D.rok, 1.2));
  bot(Bn.Brok);
  const lijf = {
    rx: profiel([[27, 6.8], [33, 7.1], [39.5, 7.2]]),
    ry: profiel([[27, 5.2], [33, 5.4], [39.5, 4.6]]),
    cy: profiel([[27, 0.4], [39.5, 0.4]]),
  };
  delen.push(romp(lijf, 27, 39.5, M.jurk, D.lijf, 2));
  delen.push(ellips([0, 0.3, 38.8], [7.6, 4.6, 3.2], M.jurk, D.lijf, 2.5));
  delen.push({
    f: (x, y, z) => {
      const zz = z - 41.2 + 0.1 * (y - 0.6);
      const buiten = Math.hypot(x / 6.8, (y - 0.6) / 5.4) - 1;
      const binnen = 1 - Math.hypot(x / 3.4, (y - 0.9) / 3);
      return Math.max(buiten * 4.5, binnen * 2.6, Math.abs(zz) - 0.55);
    },
    g: [0, 0.6, 41.2, 8],
    m: M.bloes,
    deel: D.kraag,
  });

  // --- de kat, dwars voor haar borst, de kop rechts (van haar uit), de staart hangt links
  const kop = [4.6, 10.4, 35.6];
  delen.push(ellips([0.2, 8.8, 32.6], [5, 3, 3.1], M.kat, D.kat, 0));
  delen.push(bol(kop, 2.6, M.kat, D.kat, 1));
  for (const s of [-1, 1]) {
    delen.push(kegel(plus(kop, [s * 1.3, -0.3, 1.6]), plus(kop, [s * 1.8, -0.5, 3.9]), 0.95, 0.2, M.kat, D.kat, 0.5));
    delen.push(bol(plus(kop, [s * 1, 2.2, 0.3]), 0.55, M.katoog, D.kat));
  }
  delen.push(bol(plus(kop, [0, 2.3, -0.9]), 1.2, M.kat, D.kat, 0.8));
  for (const x of [2, 3.6]) delen.push(bol([x, 10.8, 30.2], 1, M.kat, D.kat, 0.6));
  delen.push(...bochtKegel([-4.4, 8.2, 31.8], [-7.4, 9.4, 29.2], [-6.8, 11.4, 25.4], 1, 0.6, 4, M.kat, D.kat, 0.4));
  // ze draagt de kat met twee handen tegen zich aan: hij beweegt dus mee met de romp (Bn.Bromp),
  // niet met één arm apart.
  bot(Bn.Bromp);

  // --- armen: pofmouwtjes; ze houdt de kat met twee handen vast
  const kind = { mouw: M.bloes, huid: M.huid, r: [2.4, 2, 1.6], tot: 0.45, hand: [1.8, 1.9, 2.1] };
  delen.push(bol([7.4, 0.3, 37.4], 2.9, M.bloes, D.armR, 1));
  arm(delen, [7.4, 0.3, 37.2], [9, 3.4, 31.2], [4, 8.8, 29.8], { ...kind, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  delen.push(bol([-7.4, 0.3, 37.4], 2.9, M.bloes, D.armL, 1));
  arm(delen, [-7.4, 0.3, 37.2], [-8.8, 3, 31.4], [-4.6, 9.4, 32.4], { ...kind, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: pony, een scheiding, en twee vlechten die opzij uitsteken
  const oy = schedel(delen, H, M, D, { maat, oog: [2.4, -0.3], oogR: 1, oor: 0.8 });
  delen.push(bol(plus(H, [0, 6.5, -2.1]), 1.1, M.huid, D.hoofd, 0.8));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.2, -4.1);
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.4, dz - 0.4, 7.05, 6.85, 7.35);
      const lijn = (dy - 6.6 - 1.2 * (dz - 2.1)) / 1.56;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.4, 9],
    m: M.haar,
    deel: D.haar,
    k: 0.6,
  });
  for (const s of [-1, 1]) {
    const eind = vlecht(delen, plus(H, [s * 5.8, -1.4, -1.6]), plus(H, [s * 10.8, -1, -2.6]), plus(H, [s * 10.6, 0.2, -9.6]), 1.6, 1.15, 9, M.haar, D.haar);
    delen.push(bol(eind, 0.9, M.strik, D.haar));
    delen.push(ellips(plus(eind, [s * 1.4, 0.4, 0.5]), [1.4, 1.1, 0.9], M.strik, D.haar, 0.3));
    delen.push(ellips(plus(eind, [-s * 1.4, 0.4, 0.5]), [1.4, 1.1, 0.9], M.strik, D.haar, 0.3));
    delen.push(bol(plus(eind, [s * 0.9, 0.2, -1.6]), 0.9, M.haar, D.haar, 0.3));
  }
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 30], straal: 38 });
}

const KLEUTER_SNELHEID = 0.85;
// fps blijft 10, ook al is hij traag: zie DORPSOUDSTE_FPS (dorpelingen.cjs) voor waarom — trager
// lopen komt alleen van de lagere snelheid hierboven.
const KLEUTER_FPS = 10;

// ---------------------------------------------------------------- de kleuter

// De kleuter: een peertje op mollige beentjes, een geel kieltje met een kanten zoom en een wit
// kraagje, rode schoentjes, één krulletje. Aan een touwtje trekt hij een houten paardje op
// rode wieltjes; met de andere hand houdt hij verlegen zijn kieltje vast.
// stand: zie smid() (dorpelingen.cjs). Hij is klein en loopt trager dan de andere kinderen.
function kleuter(stand = null) {
  const M = { huid: 0, kiel: 1, kraag: 2, schoen: 3, haar: 4, oog: 5, paard: 6, manen: 7, rood: 8, mond: 9, plank: 10, touw: 11 };
  const D = { benen: 1, lijf: 2, kraag: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, paard: 10, wiel: 11, touw: 12 };
  const H = [0, 2.2, 45];
  const maat = [6.5, 6.3, 6.6];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 2, hi: 6.8, schaduwKracht: 0.7, patroon: blosjes(3.6, H[2] - 3.2, H[1] + 3, 2, 6.8, 1.2) };
  mat[M.kiel] = {
    ramp: 'stro',
    lo: 2.2,
    hi: 6.4,
    patroon: (x, y, z) => (z < 12.8 ? { ramp: 'pleister', stap: Math.sin(Math.atan2(y, x) * 14) > 0 ? 5 : 4 } : 0),
  };
  mat[M.kraag] = { ramp: 'pleister', lo: 2.6, hi: 6.4 };
  mat[M.schoen] = { ramp: 'rood', lo: 1.6, hi: 5.8, glans: 1 };
  mat[M.haar] = { ramp: 'stro', lo: 3, hi: 6.6 };
  mat[M.oog] = OOG;
  mat[M.paard] = { ramp: 'hout', lo: 2.2, hi: 6.4 };
  mat[M.manen] = { ramp: 'schors', lo: 0.6, hi: 3.4 };
  mat[M.rood] = { ramp: 'rood', lo: 2, hi: 6.2 };
  mat[M.mond] = MOND;
  mat[M.plank] = { ramp: 'hout', lo: 1, hi: 4.4 };
  mat[M.touw] = { ramp: 'pleister', lo: 3, hi: 6, detail: true };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: KLEUTER_SNELHEID, fps: KLEUTER_FPS, beenLengte: 9 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 13.5],
    nek: [0, 0, 34.6],
    schouders: [[-6.6, 0.5, 31.6], [6.6, 0.5, 31.6]],
  });

  // --- mollige beentjes, rode schoentjes
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 2.9, 0.4, 13.5];
      const enkelR = [s * 2.7, 0.6, 2.8];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 2.9, 2.6, M.huid, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 2.6, 2.3, M.huid, D.benen, 1));
    } else {
      delen.push(kegel([s * 2.9, 0.4, 13.5], [s * 2.7, 0.6, 2.8], 2.9, 2.3, M.huid, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 2.8, 1.6, 1.6], [2.1, 3.3, 1.7], M.schoen, D.benen, 1));
    bot(voetBot(hg, i, [s * 2.8, 1.6, 0]));
  }
  // --- een peervormig kieltje, onderaan een kanten zoom, bovenaan een wit kraagje
  const lijf = {
    rx: profiel([[11.5, 8.6], [16, 8.4], [22, 7.8], [28, 7], [33, 6]]),
    ry: profiel([[11.5, 7.2], [16, 7.3], [22, 6.8], [28, 5.6], [33, 4.4]]),
    cy: profiel([[11.5, 1.2], [18, 1.4], [33, 0.4]]),
  };
  delen.push(romp(lijf, 11.5, 33, M.kiel, D.lijf, 2));
  delen.push(ellips([0, 0.3, 32.6], [6.9, 4.6, 3], M.kiel, D.lijf, 2.5));
  delen.push(kegel([0, 0.8, 33], [0, 1.4, 39.5], 3.3, 3.1, M.huid, D.lijf, 1));
  delen.push({
    f: (x, y, z) => {
      const zz = z - 35.9 + 0.12 * (y - 0.6);
      const buiten = Math.hypot(x / 6, (y - 0.8) / 5) - 1;
      const binnen = 1 - Math.hypot(x / 3.3, (y - 1) / 3.1);
      return Math.max(buiten * 4.5, binnen * 2.6, Math.abs(zz) - 0.55);
    },
    g: [0, 0.8, 35.9, 8],
    m: M.kraag,
    deel: D.kraag,
  });
  bot(Bn.Bromp);

  // --- het trekpaardje: op een plankje met rode wieltjes, rechts voor hem, met de flank naar
  // voren, zodat je het van de meeste kanten als paardje ziet. Het staat vast op de grond (net
  // als de hooivork van de boer en de wandelstok van de dorpsoudste), dus het paardje en het
  // touwtje zwaaien niet mee met zijn lijf of arm — anders zou het over de grond gaan zweven.
  const P = [14.6, 9.4, 0];
  const u = eenheid([1, 0.35, 0]); // de richting van de kop
  const b = [-u[1], u[0], 0]; // naar links van het paardje
  const op = (a, bb, z) => [P[0] + u[0] * a + b[0] * bb, P[1] + u[1] * a + b[1] * bb, z];
  delen.push({
    f: (x, y, z) => {
      const dx = x - P[0];
      const dy = y - P[1];
      return sdf.doos(dx * u[0] + dy * u[1], dx * b[0] + dy * b[1], z - 2.7, 5.4, 1.9, 0.55, 0.4);
    },
    g: [P[0], P[1], 2.7, 6.5],
    m: M.plank,
    deel: D.paard,
  });
  for (const sa of [-1, 1]) {
    for (const sb of [-1, 1]) {
      delen.push(schijf(op(sa * 3.7, sb * 2.3, 1.8), b, 1.7, 0.45, M.rood, D.wiel));
      delen.push(kegel(op(sa * 3.2, sb * 1.1, 3.1), op(sa * 3.3, sb * 1.1, 8.2), 0.85, 0.8, M.paard, D.paard, 0.6));
    }
  }
  delen.push({
    f: (x, y, z) => {
      const dx = x - P[0];
      const dy = y - P[1];
      return sdf.ellipsoide(dx * u[0] + dy * u[1], dx * b[0] + dy * b[1], z - 9.6, 4.8, 2.2, 2.6);
    },
    g: [P[0], P[1], 9.6, 5.5],
    m: M.paard,
    deel: D.paard,
    k: 0.8,
  });
  delen.push(kegel(op(3.4, 0, 10.6), op(5, 0, 14.4), 1.7, 1.35, M.paard, D.paard, 1));
  const kop = op(6.3, 0, 15);
  delen.push({
    f: (x, y, z) => {
      const dx = x - kop[0];
      const dy = y - kop[1];
      const a = dx * u[0] + dy * u[1];
      return sdf.ellipsoide(a, dx * b[0] + dy * b[1], z - kop[2] + 0.35 * a, 2.7, 1.35, 1.45);
    },
    g: [kop[0], kop[1], kop[2], 3.2],
    m: M.paard,
    deel: D.paard,
    k: 0.8,
  });
  for (const sb of [-1, 1]) {
    delen.push(kegel(op(5.2, sb * 0.6, 16), op(5, sb * 0.7, 17.9), 0.55, 0.2, M.paard, D.paard, 0.3));
    delen.push(bol(op(6.6, sb * 1.25, 15.4), 0.4, M.manen, D.paard));
  }
  delen.push(capsule(op(3.1, 0, 12.2), op(4.7, 0, 16.2), 0.8, M.manen, D.paard));
  delen.push(kegel(op(-4.5, 0, 10.4), op(-6, 0, 6.8), 0.9, 0.5, M.manen, D.paard, 0.4));
  delen.push(ellips(op(-0.2, 0, 11.8), [2.1, 2.1, 0.7], M.rood, D.paard, 0.4));
  // het touwtje, van zijn hand naar de hals van het paardje
  const hand = [10.4, 6.8, 21.4];
  delen.push(capsule(hand, op(5.4, 0, 13.2), 0.32, M.touw, D.touw));
  bot(null);

  // --- armpjes: pofmouwtjes. Rechts het touwtje, links verlegen aan het kieltje.
  const kind = { mouw: M.kiel, huid: M.huid, r: [2.6, 2.3, 1.9], tot: 0.6, hand: [1.9, 2, 2.1] };
  arm(delen, [6.6, 0.5, 31.6], [9.6, 2.6, 26], hand, { ...kind, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-6.6, 0.5, 31.6], [-8.8, 2.2, 25], [-7.4, 5.4, 19.8], { ...kind, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: groot en rond, bolle wangen, dun blond haar met één krul op het voorhoofd
  const oy = schedel(delen, H, M, D, { maat, oog: [2.7, -0.2], oogR: 1.05, oor: 0.85 });
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 3.6, 3.8, -3.6]), [2.2, 1.8, 1.9], M.huid, D.hoofd, 1.2));
  delen.push(bol(plus(H, [0, 6.1, -2.9]), 0.9, M.huid, D.hoofd, 0.8));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1, -4.4);
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.3, dz - 0.3, 6.75, 6.55, 6.85);
      const lijn = (dy - 3.8 - 1.2 * (dz - 5)) / 1.56;
      return Math.max(e, lijn);
    },
    g: [H[0], H[1], H[2] + 0.3, 8.5],
    m: M.haar,
    deel: D.haar,
    k: 0.5,
  });
  delen.push(...bochtKegel(plus(H, [0.3, 5, 4.6]), plus(H, [1.1, 6.6, 5.4]), plus(H, [0.1, 7, 4]), 0.9, 0.5, 3, M.haar, D.haar, 0.5));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [4, 3, 24], straal: 36 });
}

// ---------------------------------------------------------------- volwassenen: gedeelde delen

// Een vrouwenfiguur tot aan de hals: een lange klokrok, een lijfje met boezem en schouders. Geeft
// het lijfprofiel terug (voor een schort of een sjerp). o.rok = [rx, ry] onder/boven, o.lijf =
// profielen, o.mat = materiaal (getal of functie), o.deel. o.botRok: als de aanroeper loopt (stand),
// een callback die de rok net gezet meteen zijn eigen zwaai geeft (Bn.Brok) vóórdat het lijf erna
// wordt gebouwd — anders zitten rok en lijf in dezelfde bot()-groep en zwaait de rok niet breder
// mee dan de romp (zie de uitleg bovenaan dorpelingen.cjs, "Rok").
function vrouwenlijf(delen, o) {
  const { rokTop = 38, rokRx = [15, 10.2], rokRy = [13, 8.2], lijf, boezem, schouders, mRok, mLijf, dRok, dLijf, plooi = 1, botRok = null } = o;
  delen.push(klokrok(rokTop, rokRx, rokRy, () => 0.8, mRok, dRok, plooi));
  if (botRok) botRok();
  delen.push(romp(lijf, lijf.z0, lijf.z1, mLijf, dLijf, 2));
  if (boezem) delen.push(ellips(boezem[0], boezem[1], mLijf, dLijf, 2.5));
  delen.push(ellips(schouders[0], schouders[1], mLijf, dLijf, 2.5));
  return {
    rx: (z) => mix(rokRx[0], rokRx[1], Math.pow(klem(z / rokTop, 0, 1), 0.8)),
    ry: (z) => mix(rokRy[0], rokRy[1], Math.pow(klem(z / rokTop, 0, 1), 0.9)),
    cy: () => 0.8,
  };
}
// een band om het middel (schortband, sjerp) op het lijfprofiel, op hoogte z, met een strik achter
function middelband(delen, lijf, z, m, deel, breed = 1.3, strik = true) {
  const a = lijf.rx(z) + 0.7;
  const b = lijf.ry(z) + 0.7;
  const c = lijf.cy(z);
  delen.push({
    f: (x, y, zz) => Math.max(Math.abs((Math.hypot(x / a, (y - c) / b) - 1) * Math.min(a, b)) - 0.6, Math.abs(zz - z) - breed),
    g: [0, c, z, Math.max(a, b) + 2],
    m,
    deel,
  });
  if (!strik) return;
  const k = [0, c - b - 0.4, z + 0.3];
  delen.push(bol(k, 1.3, m, deel));
  for (const s of [-1, 1]) {
    delen.push(ellips(plus(k, [s * 2.2, -0.2, 0.5]), [2, 0.9, 1.4], m, deel, 0.5));
    delen.push(kegel(plus(k, [s * 0.5, -0.2, -1]), plus(k, [s * 1.6, -0.8, -8]), 0.9, 0.8, m, deel));
  }
}
// haar strak naar achteren, met de haargrens hoog op het voorhoofd (zoals bij de herbergierster)
function haarKap(H, [rx, ry, rz], m, deel, grens = [4.8, 5]) {
  return {
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.5, dz - 0.5, rx + 0.35, ry + 0.35, rz + 0.25);
      return Math.max(e, (dy - grens[0] - 1.2 * (dz - grens[1])) / 1.56);
    },
    g: [H[0], H[1], H[2] + 0.5, Math.max(rx, ry, rz) + 1.8],
    m,
    deel,
    k: 0.8,
  };
}

const SMIDSVROUW_SNELHEID = 1.45;
const SMIDSVROUW_FPS = 10;

// ---------------------------------------------------------------- de smidsvrouw

// De smidsvrouw: stevig als haar man, de mouwen opgestroopt, een rode doek met witte stippen om
// het haar, bovenop geknoopt, en een olijfgroene jurk met een lichte schort. Aan haar arm hangt
// een mand vers brood.
// stand: zie smid() (dorpelingen.cjs). Geen been getekend (de rok dekt haar helemaal), dus de rok
// zwaait zelf mee (Bn.Brok).
function smidsvrouw(stand = null) {
  const M = { huid: 0, jurk: 1, bloes: 2, schort: 3, doek: 4, haar: 5, oog: 6, riet: 7, brood: 8, mond: 9 };
  const D = { rok: 1, lijf: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, doek: 10, mand: 11, brood: 12 };
  const H = [0, 3.4, 68];
  const maat = [7, 6.8, 7.4];
  const mandC = [-15.8, 3.2, 31.6];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.7, hi: 6.5, schaduwKracht: 0.7, patroon: blosjes(3.8, H[2] - 2.6, H[1] + 3, 1.7, 6.5, 0.9) };
  mat[M.jurk] = { ramp: 'mos', lo: 0.9, hi: 5.2 };
  mat[M.bloes] = { ramp: 'pleister', lo: 2, hi: 6.2 };
  mat[M.schort] = { ramp: 'perkament', lo: 2.2, hi: 5.8, patroon: (x) => (Math.sin(x * 1.1 + 0.4) > 0.8 ? -0.6 : 0) };
  // rood met witte stippen, zodat het een doek is en geen rood haar
  mat[M.doek] = { ramp: 'rood', lo: 2, hi: 5.8, patroon: (x, y, z) => (Math.sin(x * 2.3 + y * 0.8) * Math.sin(z * 2.3 + y * 0.6) > 0.72 ? { ramp: 'pleister', stap: 5 } : 0) };
  mat[M.haar] = { ramp: 'schors', lo: 0.8, hi: 4.4 };
  mat[M.oog] = OOG;
  mat[M.riet] = { ramp: 'riet', lo: 0.8, hi: 4.6, patroon: rietPatroon(mandC) };
  // een goudbruine korst met lichte sneden, zodat het brood niet in het riet verdwijnt
  mat[M.brood] = {
    ramp: 'hout',
    lo: 3.4,
    hi: 7.4,
    glans: 0.6,
    patroon: (x, y, z) => (Math.sin((x - y) * 1.6) > 0.8 && z > mandC[2] + 6.8 ? { ramp: 'zand', stap: 8 } : 0),
  };
  mat[M.mond] = MOND;

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: SMIDSVROUW_SNELHEID, fps: SMIDSVROUW_FPS, beenLengte: 27 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.6, 36],
    nek: [0, 0, 58],
    schouders: [[-11.2, 0.4, 55], [11.2, 0.4, 55]],
  });

  const lijf = {
    z0: 35,
    z1: 57.5,
    rx: profiel([[35, 10.4], [41, 10.8], [47, 11.6], [52, 12], [57.5, 10.8]]),
    ry: profiel([[35, 7.6], [41, 7.4], [47, 7.8], [52, 7.4], [57.5, 6.2]]),
    cy: profiel([[35, 0.8], [46, 1.2], [57.5, 0.6]]),
  };
  const halsV = (x, y, z) => (y > 2 && z > 52 + Math.abs(x) * 1.1 ? M.bloes : M.jurk);
  const rok = vrouwenlijf(delen, {
    rokTop: 38,
    rokRx: [15.4, 10.6],
    rokRy: [13.2, 8.4],
    lijf,
    boezem: [[0, 4, 49.5], [9, 5.8, 4.6]],
    schouders: [[0, 0.4, 56.5], [11.8, 7, 4.4]],
    mRok: M.jurk,
    mLijf: halsV,
    dRok: D.rok,
    dLijf: D.lijf,
    botRok: () => bot(Bn.Brok),
  });
  delen.push(schil(rok, { los: 1.2, d: 0.6, breed: (z) => mix(8.6, 6.8, z / 38), z0: 6, z1: 37.5 }, M.schort, D.schort));
  middelband(delen, lijf, 37.4, M.schort, D.schort);
  bot(Bn.Bromp);

  // --- sterke armen, mouwen opgestroopt tot boven de elleboog; links de broodmand aan de arm —
  // die zwaait dus mee met die arm (Bn.Barm[0]).
  const sterk = { mouw: M.bloes, huid: M.huid, r: [4.2, 3.7, 2.8], tot: 0.8, rol: 1.1, hand: [2.9, 3.1, 3.2] };
  const top = mand(delen, mandC, [7, 5], 6.6, M.riet, D.mand, 12);
  delen.push(ellips(plus(top, [-2.8, -0.8, 1.3]), [2.8, 2.4, 2.2], M.brood, D.brood, 0.5));
  delen.push(ellips(plus(top, [1.8, 1, 1.1]), [2.6, 2.3, 2], M.brood, D.brood, 0.5));
  delen.push(capsule(plus(top, [1.8, -0.6, 0.4]), plus(top, [-5.8, 2.4, 9.6]), 1.5, M.brood, D.brood));
  arm(delen, [-11.2, 0.4, 55], [-16.8, -1.2, 45.8], [-13.6, 7.4, 44.8], { ...sterk, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);
  arm(delen, [11.2, 0.4, 55], [13.6, 1.2, 45], [12.6, 3.4, 35.6], { ...sterk, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);

  // --- hoofd: een doek in de nek geknoopt, donker haar aan de slapen, een brede lach
  const oy = schedel(delen, H, M, D, { maat, oog: [2.7, 0.7], oor: 0.9 });
  delen.push(bol(plus(H, [0, 6.9, -1.4]), 1.7, M.huid, D.hoofd, 1));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.5, -4);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.8, oy + 0.1, 2.9]), [2.1, 0.9, 0.8], M.haar, D.hoofd, 0.4));
  delen.push(haarKap(H, maat, M.haar, D.haar, [4.6, 4.2]));
  for (const x of [-3.2, -1.1, 1.1, 3.2]) delen.push(bol(plus(H, [x, 5.5, 4.8 - Math.abs(x) * 0.25]), 1.4, M.haar, D.haar, 0.5));
  delen.push(hoofddoek(H, maat, 'nek', M.doek, D.doek, { los: 1.5, voorhoofd: 5.6 }));
  // de knoop bovenop, met twee puntjes die rechtop staan
  const knoop = plus(H, [0, 2.6, 8.4]);
  delen.push(bol(knoop, 1.7, M.doek, D.doek, 0.6));
  for (const s of [-1, 1]) delen.push(kegel(plus(knoop, [s * 0.8, 0.2, 0.4]), plus(knoop, [s * 2.6, 0.6, 3]), 1.2, 0.55, M.doek, D.doek, 0.4));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [-2, 2, 40], straal: 48 });
}

const BOERIN_SNELHEID = 1.4;
const BOERIN_FPS = 10;

// ---------------------------------------------------------------- de boerin

// De boerin: rond en bedrijvig, een witte hoofddoek onder de kin geknoopt, een terracotta jurk met
// lange mouwen en een donkerblauw schort (net als de kiel van haar man). Voor zich uit draagt ze
// een mandje eieren.
// stand: zie smid() (dorpelingen.cjs). Geen been getekend, dus de rok zwaait zelf mee (Bn.Brok).
function boerin(stand = null) {
  const M = { huid: 0, jurk: 1, schort: 2, doek: 3, haar: 4, oog: 5, riet: 6, ei: 7, mond: 8, bruinEi: 9 };
  const D = { rok: 1, lijf: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, doek: 9, mand: 10, ei: 11 };
  const H = [0, 3.4, 66.5];
  const maat = [7, 6.8, 7.3];
  const mandC = [0, 13.4, 33.8];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.8, hi: 6.6, schaduwKracht: 0.7, patroon: blosjes(3.7, H[2] - 2.6, H[1] + 3, 1.8, 6.6, 1.1) };
  mat[M.jurk] = { ramp: 'dak', lo: 1, hi: 5.6 };
  mat[M.schort] = { ramp: 'pet', lo: 1.2, hi: 5.4, patroon: (x) => (Math.sin(x * 1.1 + 0.6) > 0.8 ? -0.6 : 0) };
  mat[M.doek] = { ramp: 'pleister', lo: 2.2, hi: 6.4, patroon: (x, y, z) => (Math.sin(x * 1.2 - z * 0.8) > 0.8 ? -0.6 : 0) };
  mat[M.haar] = { ramp: 'aarde', lo: 1, hi: 4.6 };
  mat[M.oog] = OOG;
  mat[M.riet] = { ramp: 'riet', lo: 1.4, hi: 6, patroon: rietPatroon(mandC) };
  mat[M.ei] = { ramp: 'berk', lo: 2.4, hi: 5.6, glans: 0.6, detail: true };
  mat[M.bruinEi] = { ramp: 'zand', lo: 3.4, hi: 7.4, glans: 0.6, detail: true };
  mat[M.mond] = MOND;

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: BOERIN_SNELHEID, fps: BOERIN_FPS, beenLengte: 27 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.6, 36],
    nek: [0, 0, 56.6],
    schouders: [[-10.6, 0.4, 53.6], [10.6, 0.4, 53.6]],
  });

  const lijf = {
    z0: 35,
    z1: 56,
    rx: profiel([[35, 10.2], [41, 10.8], [47, 11.2], [52, 11], [56, 9.6]]),
    ry: profiel([[35, 8], [41, 8.2], [47, 8], [52, 7.2], [56, 6]]),
    cy: profiel([[35, 1.2], [42, 1.6], [56, 0.6]]),
  };
  const rok = vrouwenlijf(delen, {
    rokTop: 37,
    rokRx: [15.6, 10.6],
    rokRy: [13.4, 8.8],
    lijf,
    boezem: [[0, 4, 48.5], [9, 5.6, 4.4]],
    schouders: [[0, 0.4, 55], [10.8, 7, 4.2]],
    mRok: M.jurk,
    mLijf: M.jurk,
    dRok: D.rok,
    dLijf: D.lijf,
    botRok: () => bot(Bn.Brok),
  });
  delen.push(schil(rok, { los: 1.2, d: 0.6, breed: (z) => mix(9.4, 7.4, z / 37), z0: 5, z1: 36.5 }, M.schort, D.schort));
  middelband(delen, lijf, 36.4, M.schort, D.schort);

  // --- het mandje eieren voor haar buik, twee handen aan de rand; lange mouwen. Ze draagt het met
  // twee handen tegen zich aan, dus het beweegt mee met de romp (Bn.Bromp), niet met één arm.
  const top = mand(delen, mandC, [6, 4.4], 5, M.riet, D.mand, 0);
  const eieren = [[-3, -0.8], [-1, 0.9], [1.2, -0.9], [3.1, 0.7], [0.1, -0.1], [-2.3, 1.3], [2.3, -1.6]];
  eieren.forEach(([x, y], i) => {
    const c = plus(top, [x, y, 0.4 + (i % 3) * 0.3]);
    delen.push({ ...ellips(c, [1.15, 1.15, 1.45], i % 3 === 1 ? M.bruinEi : M.ei, D.ei, 0), k: undefined });
  });
  bot(Bn.Bromp);
  const mouw = { mouw: M.jurk, huid: M.huid, r: [3.8, 3.3, 2.6], tot: 1.92, rol: 0.8, hand: [2.5, 2.7, 2.9] };
  arm(delen, [10.6, 0.4, 53.6], [13.2, 3.6, 44.6], plus(top, [6.6, -0.4, 0.6]), { ...mouw, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-10.6, 0.4, 53.6], [-13.2, 3.6, 44.6], plus(top, [-6.6, -0.4, 0.6]), { ...mouw, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: rond gezicht in een witte doek, een pluk haar voorop, de knoop onder de kin
  const oy = schedel(delen, H, M, D, { maat, oog: [2.6, 0.6], oor: 0.8 });
  delen.push(bol(plus(H, [0, 6.9, -1.4]), 1.6, M.huid, D.hoofd, 1));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.3, -4);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.8]), [2, 0.8, 0.7], M.haar, D.hoofd, 0.4));
  delen.push(haarKap(H, maat, M.haar, D.hoofd, [4.6, 4.2]));
  delen.push(hoofddoek(H, maat, 'kin', M.doek, D.doek, { los: 1.3 }));
  const knoop = plus(H, [0, 5.2, -8.2]);
  delen.push(bol(knoop, 1.5, M.doek, D.doek, 0.6));
  // de punt van de doek hangt achter in de nek
  delen.push(kegel(plus(H, [0, -7.2, -3.6]), plus(H, [0, -8.4, -10.6]), 3.4, 0.6, M.doek, D.doek, 1));
  for (const s of [-1, 1]) delen.push(kegel(plus(knoop, [s * 0.5, 0.3, -0.6]), plus(knoop, [s * 1.8, 1.4, -4.6]), 1.1, 0.5, M.doek, D.doek, 0.4));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 3, 38], straal: 46 });
}

// ---------------------------------------------------------------- de bruidegom

const BRUIDEGOM_SNELHEID = 1.5;
const BRUIDEGOM_FPS = 10;

// De bruidegom: jong en lang, op zijn zondags: een zwart vest met koperen knoopjes over een wit
// hemd, een zwarte broek, gepoetste schoenen, een bloem op zijn borst. Zijn pet houdt hij
// zenuwachtig met twee handen voor zich; de bruiloft ging niet door, de aarde schudde.
// stand: zie smid() (dorpelingen.cjs).
function bruidegom(stand = null) {
  const M = { huid: 0, hemd: 1, vest: 2, broek: 3, schoen: 4, haar: 5, oog: 6, knoop: 7, pet: 8, bloem: 9, blad: 10, mond: 11, das: 12 };
  const D = { benen: 1, lijf: 2, vest: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, pet: 10, bloem: 11 };
  const H = [0, 3.2, 73];
  const maat = [6.9, 6.8, 7.6];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.8, hi: 6.6, schaduwKracht: 0.7 };
  mat[M.hemd] = { ramp: 'pleister', lo: 2.2, hi: 6.4 };
  mat[M.vest] = { ramp: 'vacht', lo: 0.3, hi: 3.2, glans: 0.5 };
  mat[M.broek] = { ramp: 'vacht', lo: 0.4, hi: 3 };
  mat[M.schoen] = { ramp: 'leer', lo: 0.4, hi: 3.6, glans: 2 };
  mat[M.haar] = {
    ramp: 'hout',
    lo: 0.8,
    hi: 4.8,
    glans: 0.8,
    patroon: (x, y, z) => {
      // netjes gekamd, met een scheiding links
      if (Math.abs(x + 2.4) < 0.4 && z > H[2] + 4 && y > H[1] - 2) return -1.4;
      return Math.sin(x * 1.4 + y * 0.4) > 0.7 ? 0.6 : 0;
    },
  };
  mat[M.oog] = OOG;
  mat[M.knoop] = { ramp: 'goud', lo: 2.4, hi: 6.4, glans: 1.2, detail: true };
  mat[M.pet] = { ramp: 'pet', lo: 1, hi: 5 };
  mat[M.bloem] = { ramp: 'rood', lo: 3, hi: 6.8, detail: true };
  mat[M.blad] = { ramp: 'blad', lo: 2, hi: 6, detail: true };
  mat[M.mond] = MOND;
  mat[M.das] = { ramp: 'rood', lo: 1, hi: 4 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: BRUIDEGOM_SNELHEID, fps: BRUIDEGOM_FPS, beenLengte: 27 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 35.5],
    nek: [0, 0, 60],
    schouders: [[-10.8, 0.3, 57], [10.8, 0.3, 57]],
  });

  // --- lange benen, gepoetste schoenen; elk been buigt bij de knie
  delen.push(ellips([0, 0.4, 35.5], [9.6, 6.4, 5], M.broek, D.benen, 2));
  bot(Bn.Bromp);
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 4.6, 0.2, 35.5];
      const enkelR = [s * 4.4, 0.6, 5];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 4.4, 3.9, M.broek, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 3.9, 3.4, M.broek, D.benen, 1));
    } else {
      delen.push(kegel([s * 4.6, 0.2, 35.5], [s * 4.4, 0.6, 5], 4.4, 3.4, M.broek, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 4.4, 2.4, 2.4], [3.2, 5.8, 2.6], M.schoen, D.benen, 1));
    bot(voetBot(hg, i, [s * 4.4, 2.4, 0]));
  }
  // --- hemd, met het vest eroverheen: een schil op het lijf, voorop open in een V
  const lijf = {
    rx: profiel([[34, 9.6], [40, 9.8], [47, 10.4], [53, 11.2], [59, 10.4]]),
    ry: profiel([[34, 6.6], [40, 6.6], [47, 6.9], [53, 6.8], [59, 5.8]]),
    cy: profiel([[34, 0.4], [59, 0.4]]),
  };
  delen.push(romp(lijf, 34, 59, M.hemd, D.lijf, 2));
  delen.push(ellips([0, 0.3, 58.4], [11.2, 6.4, 4], M.hemd, D.lijf, 2.5));
  // het vest: een schil om het lijf, voorop open in een V die naar boven wijder wordt
  const vest = schil(lijf, { los: 0.25, d: 0.6, z0: 33.2, z1: 58.6, voor: false }, M.vest, D.vest);
  const vOpen = (x, y, z) => Math.min(y - 2, 0.3 + Math.max(0, z - 45.5) * 0.25 - Math.abs(x));
  delen.push({ ...vest, f: (x, y, z) => Math.max(vest.f(x, y, z), vOpen(x, y, z)) });
  for (const [z, s] of [[39.5, 1], [42.5, 1], [45.5, 1]]) delen.push(bol([s * 0.9, lijf.cy(z) + lijf.ry(z) + 1.3, z], 0.7, M.knoop, D.vest));
  // een rood strikje aan de boord, en een bloem op de borst
  delen.push(ellips([0, 6.4, 60.4], [1.9, 1, 1.1], M.das, D.lijf, 0.4));
  delen.push(bol([0, 6.9, 60.4], 0.8, M.das, D.lijf));
  const bloem = [-5.2, lijf.cy(53) + lijf.ry(53) * Math.sqrt(1 - (5.2 / lijf.rx(53)) ** 2) + 1.1, 53];
  delen.push(bol(bloem, 1.3, M.bloem, D.bloem));
  delen.push(ellips(plus(bloem, [0.9, 0.2, -1.4]), [1, 0.5, 0.7], M.blad, D.bloem, 0.3));

  // --- armen in witte mouwen; de pet in twee handen voor zijn buik. Hij houdt hem met twee
  // handen vast, dus de pet beweegt mee met de romp (Bn.Bromp), niet met één arm apart.
  const pet = [0, 10.2, 42.6];
  delen.push({
    f: (x, y, z) => sdf.ellipsoide(x - pet[0], y - pet[1], z - pet[2], 4.8, 1.5, 4.3) * 0.9,
    g: [pet[0], pet[1], pet[2], 5.5],
    m: M.pet,
    deel: D.pet,
  });
  delen.push({
    f: (x, y, z) => sdf.ellipsoide(x - pet[0], y - pet[1] - 0.8, z - pet[2] + 4.2, 3.6, 1.2, 1.6) * 0.9,
    g: [pet[0], pet[1] + 0.8, pet[2] - 4.2, 4.5],
    m: M.pet,
    deel: D.pet,
  });
  bot(Bn.Bromp);
  const mouw = { mouw: M.hemd, huid: M.huid, r: [3.8, 3.3, 2.6], tot: 1.9, rol: 0.6, hand: [2.5, 2.6, 2.9] };
  arm(delen, [10.8, 0.3, 57], [12.6, 3.4, 47.4], plus(pet, [4.4, 1.2, 1.2]), { ...mouw, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-10.8, 0.3, 57], [-12.6, 3.4, 47.4], plus(pet, [-4.4, 1.2, 1.2]), { ...mouw, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: jong, gladgeschoren, het haar netjes met een scheiding, een verlegen lach
  const oy = schedel(delen, H, M, D, { maat, oog: [2.7, 0.8] });
  delen.push(ellips(plus(H, [0, 6.9, -1.4]), [1.5, 2, 2.2], M.huid, D.hoofd, 1));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.5, -4.3);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.8, oy + 0.1, 2.9]), [2, 0.9, 0.8], M.haar, D.hoofd, 0.4));
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0];
      const dy = y - H[1];
      const dz = z - H[2];
      const e = sdf.ellipsoide(dx, dy + 0.6, dz - 0.9, 7.35, 7.2, 7.9);
      return Math.max(e, (dy - 4.9 - 1.2 * (dz - 5.1)) / 1.56);
    },
    g: [H[0], H[1], H[2] + 0.9, 9.5],
    m: M.haar,
    deel: D.haar,
    k: 0.8,
  });
  // een gekamde golf voorop, naar rechts gestreken
  delen.push(ellips(plus(H, [1.4, 3.8, 6.6]), [4.2, 2.8, 1.9], M.haar, D.haar, 1.2));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 42], straal: 48 });
}

// ---------------------------------------------------------------- de bruid

const BRUID_SNELHEID = 1.3;
const BRUID_FPS = 10;

// De bruid: een lange witte jurk met een groene sjerp, een krans van veldbloemen die na de
// aardschok een beetje scheef zit, een lange koperrode vlecht op haar rug, en een boeketje.
// stand: zie smid() (dorpelingen.cjs). Geen been getekend, dus de rok zwaait zelf mee (Bn.Brok);
// de lange jurk maakt haar pas ook wat voorzichtiger (BRUID_SNELHEID).
function bruid(stand = null) {
  const M = { huid: 0, jurk: 1, sjerp: 2, haar: 3, oog: 4, blad: 5, rood: 6, geel: 7, wit: 8, paars: 9, mond: 10, steel: 11 };
  const D = { rok: 1, lijf: 2, sjerp: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, krans: 10, boeket: 11, vlecht: 12 };
  const H = [0, 3.2, 67.5];
  const maat = [6.7, 6.5, 7.3];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 2, hi: 6.8, schaduwKracht: 0.7, patroon: blosjes(3.6, H[2] - 2.5, H[1] + 3, 2, 6.8, 1) };
  mat[M.jurk] = {
    ramp: 'pleister',
    lo: 2.4,
    hi: 6.6,
    patroon: (x, y, z) => {
      // een geborduurde zoom: een rij bloemetjes net boven de grond
      if (z < 4.4 && z > 2.4) return { ramp: 'blad', stap: 4 };
      return Math.sin(Math.atan2(y, x) * 9 + z * 0.08) > 0.85 && z < 36 ? -0.5 : 0;
    },
  };
  mat[M.sjerp] = { ramp: 'blad', lo: 2.4, hi: 6.6 };
  mat[M.haar] = { ramp: 'herfst', lo: 0.8, hi: 5, patroon: (x, y, z) => (Math.sin(x * 2 + z * 0.8 + y) > 0.6 ? 0.6 : 0) };
  mat[M.oog] = OOG;
  mat[M.blad] = { ramp: 'blad', lo: 1.6, hi: 5.4 };
  mat[M.rood] = { ramp: 'rood', lo: 3.2, hi: 7, detail: true };
  mat[M.geel] = { ramp: 'goud', lo: 3.4, hi: 6.6, detail: true };
  mat[M.wit] = { ramp: 'pleister', lo: 3.6, hi: 6.8, detail: true };
  mat[M.paars] = { ramp: 'magie', lo: 3, hi: 6.4, detail: true };
  mat[M.mond] = MOND;
  mat[M.steel] = { ramp: 'blad', lo: 1.2, hi: 4 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: BRUID_SNELHEID, fps: BRUID_FPS, beenLengte: 26 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.5, 36],
    nek: [0, 0, 56.8],
    schouders: [[-9.8, 0.3, 53.8], [9.8, 0.3, 53.8]],
  });

  const lijf = {
    z0: 35,
    z1: 56,
    rx: profiel([[35, 8.8], [40, 8.6], [46, 9.6], [51, 10.2], [56, 9.4]]),
    ry: profiel([[35, 6.6], [40, 6.2], [46, 6.8], [51, 6.6], [56, 5.8]]),
    cy: profiel([[35, 0.6], [46, 0.9], [56, 0.5]]),
  };
  vrouwenlijf(delen, {
    rokTop: 37,
    rokRx: [15.4, 9.2],
    rokRy: [13.4, 7.2],
    lijf,
    boezem: [[0, 3, 48], [7.6, 5, 4]],
    schouders: [[0, 0.3, 55], [10.2, 6.4, 4]],
    mRok: M.jurk,
    mLijf: M.jurk,
    dRok: D.rok,
    dLijf: D.lijf,
    plooi: 1.3,
    botRok: () => bot(Bn.Brok),
  });
  middelband(delen, lijf, 38, M.sjerp, D.sjerp, 1.6);

  // --- het boeketje, met twee handen voor zich; lange witte mouwen. Ze houdt het met twee handen
  // vast, dus het beweegt mee met de romp (Bn.Bromp), niet met één arm apart.
  const boeket = [0, 10.6, 41.4];
  delen.push(kegel(plus(boeket, [0, -0.6, -1]), plus(boeket, [0, -1.4, -7]), 1.1, 0.8, M.steel, D.boeket));
  delen.push(ellips(boeket, [3, 2.6, 2], M.blad, D.boeket, 0.6));
  const kleuren = [M.rood, M.geel, M.wit, M.paars, M.rood, M.wit, M.geel];
  kleuren.forEach((m, i) => {
    const a = (i / kleuren.length) * Math.PI * 2;
    delen.push(bol(plus(boeket, i === 0 ? [0, 0.6, 1.6] : [Math.cos(a) * 2.2, Math.sin(a) * 1.6 + 0.4, 1 + Math.sin(a * 2) * 0.3]), 1.05, m, D.boeket));
  });
  bot(Bn.Bromp);
  const mouw = { mouw: M.jurk, huid: M.huid, r: [3.4, 3, 2.3], tot: 1.9, hand: [2.3, 2.5, 2.7] };
  arm(delen, [9.8, 0.3, 53.8], [11.6, 4.4, 45.4], plus(boeket, [3.2, -0.8, -2.2]), { ...mouw, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-9.8, 0.3, 53.8], [-11.6, 4.4, 45.4], plus(boeket, [-3.2, -0.8, -2.2]), { ...mouw, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: koperrood haar met een scheiding, een lange vlecht op de rug, en de krans
  const oy = schedel(delen, H, M, D, { maat, oog: [2.6, 0.6], oor: 0.8 });
  delen.push(bol(plus(H, [0, 6.6, -1.4]), 1.4, M.huid, D.hoofd, 1));
  glimlach(delen, H, maat, M.mond, D.hoofd, 1.3, -4.1);
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.8]), [1.9, 0.7, 0.6], M.haar, D.hoofd, 0.4));
  delen.push(haarKap(H, maat, M.haar, D.haar, [4.8, 4.6]));
  const eind = vlecht(delen, plus(H, [0, -6.4, -2.6]), plus(H, [0, -8.6, -12]), [0, -8.2, 38], 2, 1.3, 13, M.haar, D.vlecht, [1, 0, 0]);
  delen.push(ellips(plus(eind, [0, -0.3, -0.6]), [1.8, 0.9, 1.2], M.sjerp, D.vlecht, 0.3));
  delen.push(kegel(plus(eind, [0, 0, -1]), plus(eind, [0, 0.4, -3.6]), 1.1, 0.5, M.haar, D.vlecht, 0.3));
  // de krans: groen loof met bloemen rondom, een tikje scheef
  const krans = [];
  const kc = plus(H, [0, -0.6, 4.6]);
  krans.push({
    f: (x, y, z) => sdf.torus(x - kc[0], (y - kc[1]) * 1.02, z - kc[2], 6.9, 1),
    g: [kc[0], kc[1], kc[2], 8.5],
    m: M.blad,
    deel: D.krans,
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.2;
    krans.push(bol(plus(kc, [Math.cos(a) * 6.9, Math.sin(a) * 6.9, 0.9]), 1.2, [M.rood, M.geel, M.wit, M.paars][i % 4], D.krans));
  }
  delen.push(...draaiDelen(krans, [0, 1, 0.3], 9, kc));
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 1, 38], straal: 46 });
}

// ---------------------------------------------------------------- de oude man

const OUDEMAN_SNELHEID = 1;
// fps blijft 10: zie DORPSOUDSTE_FPS (dorpelingen.cjs) voor waarom.
const OUDEMAN_FPS = 10;

// De oude man, de echtgenoot van de dorpsoudste: kaal met een krans wit haar en één pluk die
// overeind staat, een pijp, een wollen vest dat hij scheef heeft dichtgeknoopt, pantoffels. Hij
// krabt zich achter het oor en kijkt wat verloren: hij vergeet dingen.
// stand: zie smid() (dorpelingen.cjs). Hij is oud en loopt trager, net als zijn vrouw.
function oudeMan(stand = null) {
  const M = { huid: 0, vest: 1, hemd: 2, broek: 3, pantoffel: 4, haar: 5, oog: 6, pijp: 7, gloed: 8, knoop: 9, neus: 10 };
  const D = { benen: 1, lijf: 2, vest: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, haar: 9, pijp: 10 };
  const H = [0, 6.4, 68.5];
  const maat = [7.1, 6.9, 7.7];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 2, hi: 6.7, schaduwKracht: 0.7 };
  mat[M.neus] = { ramp: 'huid', lo: 2.4, hi: 6.8, patroon: (x, y, z, nx, ny, nz, stap) => naarRamp('rood', stap, [2.4, 6.8], [4.6, 8]) };
  mat[M.vest] = {
    ramp: 'zand',
    lo: 1.6,
    hi: 6,
    patroon: (x, y, z) => {
      // gebreid: fijne ribbels, en een boord onderaan
      const a = Math.atan2(y - 1, x);
      return Math.sin(a * 22) > 0.4 ? -0.5 : 0;
    },
  };
  mat[M.hemd] = { ramp: 'pleister', lo: 2.4, hi: 6.2 };
  mat[M.broek] = { ramp: 'steen', lo: 1, hi: 4.6 };
  mat[M.pantoffel] = { ramp: 'dak', lo: 1.2, hi: 5 };
  mat[M.haar] = { ramp: 'baard', lo: 2.4, hi: 6.6, patroon: (x, y, z) => (Math.sin(z * 2.4 + x) > 0.5 ? 0.6 : 0) };
  mat[M.oog] = OOG;
  mat[M.pijp] = { ramp: 'hout', lo: 0.8, hi: 4.2, glans: 0.8 };
  mat[M.gloed] = { ramp: 'vuur', gloei: (x, y, z, kijk) => 3.4 + 2.4 * kijk };
  mat[M.knoop] = { ramp: 'hout', lo: 0.6, hi: 3, detail: true };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: OUDEMAN_SNELHEID, fps: OUDEMAN_FPS, beenLengte: 24 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.6, 31],
    nek: [0, 0, 58],
    schouders: [[-10.6, 2.6, 55], [10.6, 2.6, 55]],
  });

  // --- benen in een grijze broek, pantoffels; elk been buigt bij de knie
  delen.push(ellips([0, 0.6, 31], [9.6, 6.6, 5], M.broek, D.benen, 2));
  bot(Bn.Bromp);
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 4.6, 0.4, 31];
      const enkelR = [s * 4.4, 0.8, 4];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 4.2, 3.8, M.broek, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 3.8, 3.4, M.broek, D.benen, 1));
    } else {
      delen.push(kegel([s * 4.6, 0.4, 31], [s * 4.4, 0.8, 4], 4.2, 3.4, M.broek, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 4.4, 2.4, 1.9], [3.3, 5.6, 2.1], M.pantoffel, D.benen, 1));
    bot(voetBot(hg, i, [s * 4.4, 2.4, 0]));
  }
  // --- een wit hemd, en het vest eroverheen, links een knoopsgat verkeerd: de linkerpand hangt
  // lager dan de rechter
  const lijf = {
    rx: profiel([[29, 10.4], [36, 10.6], [44, 11], [51, 11.2], [57, 10.2]]),
    ry: profiel([[29, 7.4], [36, 7.8], [44, 7.6], [51, 7.4], [57, 6.2]]),
    cy: profiel([[29, 1.2], [38, 1.8], [48, 2.6], [57, 3.2]]),
  };
  const zoom = (x, y) => 28.5 - (x > 0.5 && y > 0 ? 3.6 : 0);
  delen.push({
    f: (x, y, z) => {
      const zz = klem(z, 26, 57);
      const a = lijf.rx(zz);
      const b = lijf.ry(zz);
      return Math.max((Math.hypot(x / a, (y - lijf.cy(zz)) / b) - 1) * Math.min(a, b) * 0.85, zoom(x, y) - z, z - 57);
    },
    g: [0, 2, 42, 22],
    m: M.vest,
    deel: D.vest,
  });
  delen.push(ellips([0, 3, 56.4], [10.8, 6.6, 4.2], M.vest, D.vest, 2.5));
  // hemd in de hals en de knopen, een knoop te laag (hij sloeg er een over)
  delen.push(kegel([0, 4.2, 56], plus(H, [0, -1.6, -5.4]), 3.6, 3.3, M.huid, D.lijf, 1));
  delen.push(ellips([0, 5.2, 59.4], [4.4, 3, 1.6], M.hemd, D.lijf, 0.8));
  for (const [z, dx] of [[52, 0], [47, 0.3], [41.5, 0.6], [35.5, 0.9]]) {
    delen.push(bol([dx, lijf.cy(z) + lijf.ry(z) + 0.2, z], 0.8, M.knoop, D.vest));
  }
  bot(Bn.Bromp);

  // --- armen: de rechterhand krabt achter het oor, de linker hangt
  const mouw = { mouw: M.vest, huid: M.huid, r: [4, 3.5, 2.8], tot: 1.86, rol: 1, hand: [2.5, 2.7, 2.9] };
  arm(delen, [10.6, 2.6, 55], [15.2, 4, 62], plus(H, [7.6, -1.6, -0.6]), { ...mouw, dArm: D.armR, dHand: D.handR });
  bot(Bn.Barm[1]);
  arm(delen, [-10.6, 2.6, 55], [-12.6, 3.4, 45], [-11.8, 5, 36.4], { ...mouw, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- hoofd: een beetje scheef, verbaasde wenkbrauwen, een rode neus, de pijp in de mond
  const hoofd = [];
  const oy = schedel(hoofd, H, M, D, { maat, oog: [2.6, 0.5], oogR: 0.95 });
  hoofd.push(ellips(plus(H, [0, 7.2, -1.6]), [1.7, 1.9, 2.1], M.neus, D.hoofd, 1));
  hoofd.push(ellips(plus(H, [0, -2, -1.4]), [7.5, 6.3, 5.4], M.haar, D.hoofd, 1));
  for (const s of [-1, 1]) {
    // de binnenkant van de wenkbrauwen omhoog: verloren, een beetje bezorgd
    hoofd.push(kegel(plus(H, [s * 1.2, oy + 0.3, 3.4]), plus(H, [s * 4.4, oy - 0.6, 2.4]), 1, 0.8, M.haar, D.hoofd, 0.4));
    hoofd.push(kegel(plus(H, [s * 6.4, 1.6, -0.6]), plus(H, [s * 5.6, 3.6, -4.4]), 1.2, 1.4, M.haar, D.hoofd, 0.8));
  }
  hoofd.push(...bochtKegel(plus(H, [0.6, 0, 7.2]), plus(H, [1.6, 1.2, 10.4]), plus(H, [3.6, 2.8, 10.8]), 0.9, 0.35, 4, M.haar, D.haar, 0.4));
  // pijp: een steel uit de mondhoek, een kop met een gloeiend puntje
  const mondhoek = plus(H, [1.5, 6.3, -4.4]);
  const kop = plus(H, [3.2, 11.2, -5.6]);
  hoofd.push(capsule(mondhoek, plus(kop, [0, -0.6, -0.6]), 0.55, M.pijp, D.pijp));
  hoofd.push(kegel(plus(kop, [0, 0, -1.6]), plus(kop, [0, 0.2, 1.2]), 1.2, 1.35, M.pijp, D.pijp, 0.4));
  hoofd.push(bol(plus(kop, [0, 0.2, 1.3]), 0.85, M.gloed, D.pijp));
  delen.push(...draaiDelen(hoofd, [0.3, 1, 0], -9, plus(H, [0, -1, -6])));
  bot(Bn.Bnek);

  // De gloed van de pijp: alleen de vaste scheve stand (-9°) telt mee, niet het kleine ademen van
  // Bn.Bnek erna — dat verschil is op deze schaal niet te zien, en niet elke stand hoeft een
  // apart lichtpunt te berekenen.
  const gloed = draaiDelen([{ f: () => 0, g: [...plus(kop, [0, 0.2, 1.3]), 1] }], [0.3, 1, 0], -9, plus(H, [0, -1, -6]))[0].g;
  return model(delen, mat, hg
    ? { ...HH.omvat(delen, 2), lichten: [{ pos: gloed.slice(0, 3), r: 7, sterk: 0.8, warm: 1 }] }
    : { midden: [2, 3, 40], straal: 48, lichten: [{ pos: gloed.slice(0, 3), r: 7, sterk: 0.8, warm: 1 }] });
}

// ---------------------------------------------------------------- alle nieuwe dorpelingen

// Dezelfde vorm als DORPELINGEN: naam, bouwer, midden van het hoofd, portretopties, wie het is.
const DORPELINGEN2 = [
  {
    naam: 'jongen',
    maak: jongen,
    hoofd: [0, 2.4, 51],
    portret: { kant: 'ZO', schaal: 2.8, midden: 0.56 },
    wie: 'De jongen: een veel te grote pet, groen hemd met bretels, blote knieën, een houten zwaard omhoog.',
  },
  {
    naam: 'meisje',
    maak: meisje,
    hoofd: [0, 2.6, 49],
    portret: { kant: 'ZO', schaal: 2.8, midden: 0.53 },
    wie: 'Het meisje: blonde vlechten opzij met rode strikjes, oranje jurkje, een zwarte kat in haar armen.',
  },
  {
    naam: 'kleuter',
    maak: kleuter,
    hoofd: [0, 2.2, 45],
    portret: { kant: 'ZO', schaal: 2.9, midden: 0.52 },
    wie: 'De kleuter: een peertje in een geel kieltje, rode schoentjes, een krulletje, trekt een houten paardje.',
  },
  {
    naam: 'smidsvrouw',
    maak: smidsvrouw,
    hoofd: [0, 3.4, 68],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De smidsvrouw: stevig, opgestroopte mouwen, rode doek met witte stippen, olijfgroene jurk, een mand brood.',
  },
  {
    naam: 'boerin',
    maak: boerin,
    hoofd: [0, 3.4, 66.5],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De boerin: witte hoofddoek onder de kin, terracotta jurk, donkerblauw schort, een mandje eieren.',
  },
  {
    naam: 'bruidegom',
    maak: bruidegom,
    hoofd: [0, 3.2, 73],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De bruidegom: jong en lang, zwart vest met koperen knoopjes, wit hemd, bloem op de borst, pet in de hand.',
  },
  {
    naam: 'bruid',
    maak: bruid,
    hoofd: [0, 3.2, 67.5],
    portret: { kant: 'ZO', midden: 0.54 },
    wie: 'De bruid: witte jurk met groene sjerp, scheve krans van veldbloemen, lange koperrode vlecht, een boeketje.',
  },
  {
    naam: 'oudeMan',
    maak: oudeMan,
    // het hoofd staat scheef: dit is het midden ervan na het draaien
    hoofd: [-0.9, 6.7, 68.4],
    portret: { kant: 'ZO', midden: 0.5 },
    wie: 'De oude man: kaal met een witte krans en één pluk, pijp, scheef dichtgeknoopt wollen vest, pantoffels.',
  },
];

// De portretten van de eerste vier (dorpelingen.cjs) opnieuw, naar ZO zoals die van Wim en de
// tovenaar. Bij de smid valt het licht dan op zijn afgewende kant en wordt de baard één donkere
// vlek: voor zijn portret krijgt hij de gloed van de smidse op zijn gezicht, en een iets lichtere
// baard waarin de strengen te zien zijn. voorPortret(model) geeft het model voor het portret.
const PORTRET_ZO = {
  smid: {
    portret: { kant: 'ZO', midden: 0.42 },
    voorPortret: (m) => ({
      ...m,
      mat: m.mat.map((x) => (x && x.ramp === 'vacht' && x.lo === 0.2 ? { ...x, lo: 0.4, hi: 3.8 } : x)),
      lichten: [...(m.lichten || []), { pos: [10, 17, 70], r: 30, sterk: 1.8, warm: 1, zacht: 0.6 }],
    }),
  },
  herbergierster: { portret: { kant: 'ZO', midden: 0.52 } },
  boer: { portret: { kant: 'ZO', midden: 0.6 } },
  dorpsoudste: { portret: { kant: 'ZO', midden: 0.5 } },
};
// alle twaalf dorpelingen in één lijst, de eerste vier met hun ZO-portret
const ALLE_DORPELINGEN = [...DORPELINGEN.map((d) => ({ ...d, ...PORTRET_ZO[d.naam] })), ...DORPELINGEN2];

module.exports = {
  jongen,
  meisje,
  kleuter,
  smidsvrouw,
  boerin,
  bruidegom,
  bruid,
  oudeMan,
  DORPELINGEN2,
  PORTRET_ZO,
  ALLE_DORPELINGEN,
  arm,
  rokVan,
  hoofddoek,
  mand,
  rietPatroon,
  vlecht,
  draaiDelen,
  blosjes,
  vrouwenlijf,
  middelband,
  haarKap,
  JONGEN_SNELHEID, JONGEN_FPS, MEISJE_SNELHEID, MEISJE_FPS, KLEUTER_SNELHEID, KLEUTER_FPS,
  SMIDSVROUW_SNELHEID, SMIDSVROUW_FPS, BOERIN_SNELHEID, BOERIN_FPS,
  BRUIDEGOM_SNELHEID, BRUIDEGOM_FPS, BRUID_SNELHEID, BRUID_FPS, OUDEMAN_SNELHEID, OUDEMAN_FPS,
};
