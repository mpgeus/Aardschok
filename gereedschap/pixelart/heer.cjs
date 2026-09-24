// Het huis van de heer: de heer, zijn soldaten en de inner (ontwerp/beeld.md, "Het huis van de
// heer draagt rood en geel", Marcel 24 sep 2026). Tot nu toe liepen ze in andermans kleren (de
// mantel van de meester, de smid, de bruidegom); dit zijn hun eigen vellen.
//
//  - de heer: klein en dik, met een veel te grote hoed. Een rond mannetje op korte beentjes, in
//    een rode mantel met bont en een gouden zoom, gouden kettingen over zijn buik, en een rode
//    hoed met gele veren waarvan de rand veel breder is dan zijn schouders. IJdel en een beetje
//    belachelijk: zwarte satire, hij is lachwekkend (zijn straffen niet).
//  - de soldaat: geen grap. Groot en zwaar, een gevierendeelde wapenrok in rood en geel over een
//    gewatteerd wambuis, een ijzeren hoed, en een hellebaard die boven hem uitsteekt.
//  - de inner: de man die komt tellen. Mager en sober, in donkere kleren, met een rekenboek onder
//    de arm en een pen achter zijn oor. Alleen zijn hozen dragen de livrei: het ene been rood, het
//    andere geel.
//
// Dezelfde bouwstenen, maten en manier van lopen als de dorpelingen (dorpelingen.cjs, "lopen en
// staan"): houdingDorpeling en bottenDorpeling voor romp, nek en armen, beenPunten en voetBot
// voor een been met een knie. "Niets is waterpas" geldt ook hier: een hoed staat scheef, een zoom
// golft, de ene schouder hangt lager, maar een beetje.
//
// De snelheden moeten gelijk zijn aan T.MENSEN in js/mensen.js, anders glijden de voeten.
// Wegschrijven: dorpelingen-anim.cjs (node gereedschap/pixelart/dorpelingen-anim.cjs heer soldaat inner).
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
'use strict';
const { sdf, klem, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, plus, naarRamp } = require('./figuren.cjs');
const { ring, schijf, eenheid, langs } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const { profiel, romp, schil, blokGedraaid, schedel, glimlach, houdingDorpeling, bottenDorpeling, knieTussen, beenPunten, voetBot } = require('./dorpelingen.cjs');
const { arm, band, wenkbrauwen, plooiRomp, assen, ellipsGedraaid } = require('./dorpelingen3.cjs');

// ---------------------------------------------------------------- hulpjes

const min = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const maal = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };
const mondVan = (lo) => ({ ramp: 'huid', lo: Math.max(0.6, lo - 0.3), hi: lo + 0.8, detail: true, rand: 0, schaduw: false });

// de naam van de houding in een stand ({ houding, fase } of alleen de naam), of null
const houdingVan = (stand) => (stand && typeof stand === 'object' ? stand.houding : stand) || null;

// Een bot-afsluiter zoals in smid() en bruidegom(): alles wat sinds de vorige aanroep aan `delen`
// is toegevoegd, beweegt met B mee (of blijft staan bij null).
function botten(delen) {
  let vanaf = 0;
  return (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
}

// Een been met een knie, van heup tot enkel, in twee stukken (dij en scheen), zoals bij de boer.
// Geeft de punten terug, zodat een laars of een zoom erop kan aansluiten.
function knieBeen(delen, hg, i, heup, enkel, r, m, deel) {
  const P = beenPunten(hg, i, { heup, knie: knieTussen(heup, enkel), enkel });
  const rK = (r[0] + r[1]) / 2;
  delen.push(kegel(P.heup, P.knie, r[0], rK, m, deel, 1));
  delen.push(kegel(P.knie, P.enkel, rK, r[1], m, deel, 1));
  return P;
}

// Een gouden ketting over een buik: een boog van (±breed, zTop) naar het laagste punt (mid, laag),
// als een rij korte buisjes die op het oppervlak liggen (opBuik(x, z, los) geeft de plek).
function ketting(opBuik, laag, breed, mid, zTop, m, deel, n = 12) {
  const punten = [];
  for (let i = 0; i <= n; i++) {
    const x = -breed + (2 * breed * i) / n;
    const t = (x - mid) / (x < mid ? breed + mid : breed - mid);
    punten.push(opBuik(x, laag + (zTop - laag) * t * t, 0.7));
  }
  const uit = [];
  for (let i = 0; i < n; i++) uit.push(capsule(punten[i], punten[i + 1], 0.62, m, deel));
  return uit;
}

// Een struisveer: een gebogen kegel langs een kwadratische bezier (als bochtKegel), dun aan de
// voet, vol in het eerste stuk, en met een ronde pluizige punt (een spitse leest als een kroon).
function pluim(p0, p1, p2, dik, m, deel, n = 7) {
  const punt = (t) => [0, 1, 2].map((i) => (1 - t) * (1 - t) * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
  const r = (t) => 0.9 + dik * Math.sin(Math.PI * (0.1 + 0.75 * t));
  const uit = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = (i + 1) / n;
    uit.push(kegel(punt(t0), punt(t1), r(t0), r(t1), m, deel, i === 0 ? undefined : 1.2));
  }
  return uit;
}

// ---------------------------------------------------------------- de heer

const HEER_SNELHEID = 1.55;
// Korte beentjes: met de gewone maat (10 beelden per seconde, een cyclus van 0,8 s) zou elke pas
// 0,6 tegel zijn, langer dan zijn benen. Dus trippelt hij: dezelfde snelheid in kleinere, snellere
// passen. Deze fps gaat mee in het vel (dorpelingen-anim.cjs), zodat `stap` klopt en zijn voeten
// niet glijden.
const HEER_FPS = 20;

// De heer: klein en dik, met een veel te grote hoed. stand: zie smid() (dorpelingen.cjs).
function heer(stand = null) {
  const M = {
    huid: 0, neus: 1, oog: 2, mond: 3, snor: 4, haar: 5, wambuis: 6, mantel: 7, bont: 8, zoom: 9,
    ketting: 10, steen: 11, hoos: 12, schoen: 13, hoed: 14, veer: 15, band: 16,
  };
  const D = { benen: 1, wambuis: 2, mantel: 3, bont: 4, ketting: 5, armL: 6, armR: 7, handL: 8, handR: 9, hoofd: 10, snor: 11, hoed: 12, veer: 13, band: 14, schoen: 15, rand: 16 };
  const H = [0, 2.6, 46.8];
  const kop = [7.2, 6.9, 7.1];
  const oog = [2.6, 0.7];
  const mat = [];
  // een blozend gezicht: rode wangen, en een neus die ook al kleurt
  mat[M.huid] = {
    ramp: 'huid',
    lo: 2,
    hi: 6.6,
    schaduwKracht: 0.75,
    patroon: (x, y, z, nx, ny, nz, stap) => {
      if (y < H[1] + 3 || z < H[2] - 6) return 0;
      for (const s of [-1, 1]) {
        const dx = x - s * 4.5;
        const dz = z - (H[2] - 3.4);
        if (dx * dx * 1.2 + dz * dz * 1.6 < 5) return naarRamp('rood', stap, [2, 6.6], [4.8, 7.6]);
      }
      return 0;
    },
  };
  mat[M.neus] = { ramp: 'rood', lo: 4.4, hi: 7.8 };
  mat[M.oog] = OOG;
  mat[M.mond] = mondVan(1.8);
  mat[M.snor] = { ramp: 'hout', lo: 0.8, hi: 4, patroon: (x, y, z) => (Math.sin(x * 2.6 + z * 0.8) > 0.6 ? 0.6 : 0) };
  mat[M.haar] = { ramp: 'hout', lo: 0.6, hi: 3.6 };
  // het wambuis over de buik: diep rood, met een glans op de bolling
  mat[M.wambuis] = { ramp: 'rood', lo: 0.9, hi: 4.2, glans: 0.6, patroon: (x, y, z) => (Math.sin(x * 1.5 + 0.6) > 0.9 ? -0.5 : 0) };
  // de mantel: helder rood, met plooien die naar onderen dieper worden (zie de mantel hieronder)
  mat[M.mantel] = { ramp: 'rood', lo: 1.8, hi: 6.4 };
  // bont: warm bruin sabelbont, pluizig. (Hermelijn, room met zwarte staartjes, las onder zijn
  // ronde gezicht als een witte baard.)
  mat[M.bont] = {
    ramp: 'jas',
    lo: 1.6,
    hi: 6,
    rand: 0.8,
    patroon: (x, y, z) => {
      const r = ruis3(x * 0.9, y * 0.9, z * 0.9, 17);
      return r > 0.6 ? 0.8 : r < -0.55 ? -0.8 : 0;
    },
  };
  mat[M.zoom] = { ramp: 'goud', lo: 2.2, hi: 6.2, glans: 1, patroon: (x, y, z) => (Math.sin(z * 2.2 + x * 1.1) > 0.7 ? -0.9 : 0) };
  mat[M.ketting] = { ramp: 'goud', lo: 2.6, hi: 6.8, glans: 1.6, detail: true, rand: 0.6, patroon: (x, y, z) => (Math.sin(x * 2.1 + z * 0.7) > 0.3 ? 0.6 : -0.5) };
  mat[M.steen] = { ramp: 'rood', lo: 3.6, hi: 7.8, glans: 2, detail: true };
  mat[M.hoos] = { ramp: 'stro', lo: 2, hi: 6.2 };
  mat[M.schoen] = { ramp: 'leer', lo: 0.4, hi: 3.4, glans: 1.2 };
  mat[M.hoed] = { ramp: 'rood', lo: 1.6, hi: 6.2 };
  mat[M.veer] = {
    ramp: 'goud',
    lo: 3.2,
    hi: 6.9,
    rand: 0.8,
    patroon: (x, y, z) => {
      const s = Math.sin(x * 1.3 - y * 0.9 + z * 1.9);
      return s > 0.55 ? 0.7 : s < -0.75 ? -0.8 : 0;
    },
  };
  mat[M.band] = { ramp: 'goud', lo: 2.2, hi: 6.4, glans: 1.4, detail: true };

  const delen = [];
  const bot = botten(delen);
  const hg = houdingDorpeling(stand, { snelheid: HEER_SNELHEID, fps: HEER_FPS, beenLengte: 15 });
  // Hij waggelt: meer heen en weer dan een ander, en zijn hele lijf rolt mee op het been waar hij
  // op staat (om de heup, zodat de hoed het verst uitzwaait).
  let rol = null;
  if (hg && houdingVan(stand) === 'lopen') {
    hg.zij *= 2.2;
    rol = HH.beweging({ as: [0, 1, 0], graden: 3.2 * HH.sinus(stand.fase || 0), om: [0, 0.4, 18] });
  }
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 18],
    nek: [0, 1, 40],
    schouders: [[-11, 0.8, 36.2], [11, 0.8, 36.2]],
  });
  const Bromp = HH.naElkaar(Bn.Bromp, rol);
  const Bnek = HH.naElkaar(Bn.Bnek, rol);

  // --- korte beentjes in gele hozen, en spitse schoenen die te lang zijn voor zo'n klein man
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    knieBeen(delen, hg, i, [s * 4.6, 0.6, 18.5], [s * 4.4, 1, 4.6], [4.3, 3.1], M.hoos, D.benen);
    bot(null);
    delen.push(ellips([s * 4.4, 2.6, 2.3], [3, 5.4, 2.4], M.schoen, D.schoen, 1));
    // de punt krult een tikje op, en de linker iets verder dan de rechter
    delen.push(kegel([s * 4.4, 6.2, 1.9], [s * 4.6, 11.6 + (s < 0 ? 0.6 : 0), 3], 1.9, 0.45, M.schoen, D.schoen, 1.2));
    bot(voetBot(hg, i, [s * 4.4, 2.2, 0]));
  }

  // --- de buik: een wambuis dat rond staat van het eten
  const buik = {
    rx: profiel([[13, 10.8], [17, 12.8], [22, 14.3], [27, 14.5], [32, 13.2], [36, 11.4], [39, 10]]),
    ry: profiel([[13, 8.8], [17, 11], [22, 12.8], [27, 12.6], [32, 10.6], [36, 8.4], [39, 7.2]]),
    cy: profiel([[13, 1.2], [17, 2.8], [22, 4.2], [27, 4.4], [32, 3.2], [36, 1.6], [39, 0.8]]),
  };
  delen.push(romp(buik, 13, 39, M.wambuis, D.wambuis, 2));
  delen.push(ellips([0, 0.6, 37.6], [11, 7.6, 3.8], M.mantel, D.mantel, 2.5));
  // Drie gouden kettingen, de ene lager dan de andere, van onder de kraag in een boog over de
  // buik; de langste met een penning en een rode steen. Ze hangen niet recht: het laagste punt
  // ligt telkens een tikje naast het midden.
  const opBuik = (x, z, los) => [x, buik.cy(z) + buik.ry(z) * Math.sqrt(Math.max(0, 1 - (x / buik.rx(z)) ** 2)) + los, z];
  for (const [laag, breed, mid] of [[22.6, 8.8, 0.8], [28.2, 7.8, -0.6], [32.8, 6.6, 0.4]]) {
    delen.push(...ketting(opBuik, laag, breed, mid, 38.2, M.ketting, D.ketting));
  }
  const penning = opBuik(0.8, 21, 1.4);
  const nPenning = eenheid([0.04, 1, -0.3]);
  delen.push(schijf(penning, nPenning, 2.3, 0.45, M.ketting, D.ketting));
  delen.push(bol(plus(penning, maal(nPenning, 0.5)), 0.95, M.steen, D.ketting));

  // --- de mantel: rood, open over de buik, hangt als een klok recht omlaag van de dikste plek, met
  // een gouden zoom rondom en langs de voorkant. De zoom golft een beetje.
  const hang = 24;
  const open = profiel([[10, 10.6], [14, 10.8], [20, 11], [26, 9.8], [31, 7.2], [35, 4.4], [39, 2]]);
  const mantelMaat = (z) => {
    const zz = Math.max(z, hang);
    const uit = 1 + Math.max(0, hang - z) * 0.07;
    return [buik.rx(zz) + uit, buik.ry(zz) + uit, buik.cy(zz)];
  };
  const zoomZ = (x, y) => 10.2 + 0.55 * Math.sin(Math.atan2(y - 3, x) * 3 + 0.8);
  delen.push({
    f: (x, y, z) => {
      const zz = klem(z, 9.5, 39.2);
      const [a, b, c] = mantelMaat(zz);
      const ex = x / a;
      const ey = (y - c) / b;
      const th = Math.atan2(ey, ex);
      const p = 0.035 * Math.sin(th * 8 + 1.3) * klem((30 - z) / 16, 0, 1);
      const e = (Math.hypot(ex, ey) - 1 - p) * Math.min(a, b);
      let t = Math.max(Math.abs(e) - 0.85, zoomZ(x, y) - z, z - 39.2);
      t = Math.max(t, Math.min(y - c - 1, open(z) - Math.abs(x)));
      return t * 0.8;
    },
    g: [0, 3, 23.5, 22.5],
    m: (x, y, z) => (z < zoomZ(x, y) + 1.5 || (y > 2 && Math.abs(x) < open(z) + 1.6) ? M.zoom : M.mantel),
    deel: D.mantel,
  });
  // de kraag: een dikke rol bont over zijn schouders, voorop open, zodat zijn onderkin op het rood
  // rust en niet in het bont verdwijnt (anders leest het als een baard)
  delen.push({
    f: (x, y, z) => {
      const dz = z - 38.4 + 0.12 * Math.max(0, y) + 0.03 * x;
      const q = Math.hypot(x / 1.08, (y - 0.9) / 0.98) - 8.6;
      return Math.max((Math.hypot(q, dz / 0.8) - 3.2) * 0.8, Math.min(y - 2.5, 4.6 - Math.abs(x)));
    },
    g: [0, 0.9, 38.2, 13.5],
    m: M.bont,
    deel: D.bont,
  });
  bot(Bromp);

  // --- korte, dikke armen in rode mouwen met een bontje om de pols. Ze staan wat van zijn lijf af,
  // want de buik zit in de weg. De linker zwaait; de rechterhand rust tevreden op zijn buik.
  const mouw = { r: [4.2, 3.8, 3.2], mouw: 2, stof: M.mantel, huid: M.huid, hand: [2.7, 2.9, 3] };
  const polsL = arm(delen, [-11, 0.8, 36.2], [-16.4, 1.2, 28.8], [-17.6, 3.2, 21.6], { ...mouw, dArm: D.armL, dHand: D.handL });
  delen.push(ring(polsL, eenheid(min([-16.4, 1.2, 28.8], polsL)), 3.2, 1.35, M.bont, D.armL));
  bot(Bn.Barm[0]);
  const ER = [16.6, 3.4, 29.2];
  const HR = [14.2, 11.6, 24.8];
  const polsR = arm(delen, [11, 0.8, 36.2], ER, HR, { ...mouw, dArm: D.armR, dHand: D.handR });
  delen.push(ring(polsR, eenheid(min(ER, polsR)), 3.2, 1.35, M.bont, D.armR));
  bot(Bromp);

  // --- het hoofd: rond, blozend, een onderkin, een klein opgedraaid snorretje en een zelfvoldaan
  // lachje; de wenkbrauwen hoog, want alles verbaast hem een beetje
  const oy = schedel(delen, H, M, D, { maat: kop, oog, oogR: 0.85 });
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * oog[0], oy + 0.2, oog[1] + 0.95]), [1.4, 0.8, 0.55], M.huid, D.hoofd));
  delen.push(ellips(plus(H, [0, 3.4, -6.2]), [5.4, 4.6, 2.8], M.huid, D.hoofd, 1.6));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 4.1, 4.2, -3.3]), [2.6, 2.2, 2.2], M.huid, D.hoofd, 1.2));
  delen.push(bol(plus(H, [0, 7.3, -1.2]), 1.85, M.neus, D.hoofd, 0.8));
  glimlach(delen, H, kop, M.mond, D.hoofd, 1.3, -4.7);
  wenkbrauwen(delen, H, kop, oog, M.haar, D.hoofd, { z: 2.6, dik: 0.9, breed: 1.7 });
  for (const s of [-1, 1]) {
    const a = plus(H, [s * 0.7, 7.1, -3.2]);
    const b = plus(H, [s * 3.6, 6.6, -3.9]);
    const c = plus(H, [s * 5.1, 5.4, -1.4 + (s > 0 ? 0.5 : 0)]);
    delen.push(kegel(a, b, 1.05, 0.8, M.snor, D.snor, 0.4));
    delen.push(kegel(b, c, 0.8, 0.4, M.snor, D.snor, 0.4));
  }
  delen.push(ellips(plus(H, [0, -2.4, 0.2]), [7.5, 6.2, 6.4], M.haar, D.hoofd, 1));

  // --- de hoed: veel te groot. Een slappe rand die aan de zijkanten en achter doorhangt, voorop
  // een tikje opgewipt zodat je zijn gezicht nog ziet, en scheef: rechts lager dan links. Een
  // geplooide bol erop, een gouden band, en links een speld met drie gele struisveren.
  const C = plus(H, [0.4, -3.2, 6.6]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - C[0];
      const dy = y - C[1];
      const th = Math.atan2(dy, dx);
      const dz = z - C[2] + 0.0095 * (dx * dx + dy * dy) - 0.26 * Math.max(0, dy) + 0.045 * dx + 0.35 * Math.sin(th * 3 + 0.5);
      return sdf.ellipsoide(dx, dy, dz, 17.6, 15.2, 1.2) * 0.65;
    },
    g: [C[0], C[1], C[2] - 1, 19],
    m: M.hoed,
    deel: D.rand,
  });
  const K0 = plus(C, [0.2, 1.6, 4.4]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - K0[0];
      const dy = y - K0[1];
      const dz = z - K0[2] + 0.04 * dx;
      const plooi = 0.3 * Math.sin(Math.atan2(dy, dx) * 7);
      return Math.max(sdf.ellipsoide(dx, dy, dz, 10.2 + plooi, 9.8 + plooi, 8.2), -dz - 4.6) * 0.85;
    },
    g: [K0[0], K0[1], K0[2], 12],
    m: M.hoed,
    deel: D.hoed,
  });
  delen.push(ring(plus(K0, [0, 0, -3.3]), eenheid([0.04, 0, 1]), 8.9, 1.15, M.band, D.band));
  const speld = plus(K0, [-8.3, 2.4, -2.4]);
  delen.push(bol(speld, 1.7, M.band, D.band));
  delen.push(bol(plus(speld, [-0.5, 1.2, 0.2]), 0.85, M.steen, D.band));
  // de veren zwiepen opzij en naar achteren, en de onderste hangt over de rand
  delen.push(...pluim(plus(speld, [0.2, -0.4, 0.8]), plus(speld, [-3.6, -2.2, 13.4]), plus(speld, [-12, -9, 10.6]), 2.4, M.veer, D.veer));
  delen.push(...pluim(plus(speld, [0.6, -1, 0.8]), plus(speld, [1.4, -6.4, 8.6]), plus(speld, [6.4, -14, 4.4]), 2.2, M.veer, D.veer));
  delen.push(...pluim(plus(speld, [-0.4, 0, 0]), plus(speld, [-5.4, 1.2, 1.6]), plus(speld, [-9.8, -1.6, -5.4]), 1.9, M.veer, D.veer));
  bot(Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

// ---------------------------------------------------------------- de soldaat

const SOLDAAT_SNELHEID = 1.5;
const SOLDAAT_FPS = 10;

// De soldaat: geen grap. Groot en zwaar, breder en hoger dan de smid, in een gevierendeelde
// wapenrok van rood en geel over een donker gewatteerd wambuis, laarzen, leren handschoenen, een
// korte zwarte baard en een ijzeren hoed die zijn ogen in de schaduw zet. De hellebaard draagt hij
// rechtop in zijn rechterhand; lopend tilt hij hem een eind van de grond. stand: zie smid().
function soldaat(stand = null) {
  const M = {
    huid: 0, oog: 1, mond: 2, baard: 3, wambuis: 4, rood: 5, geel: 6, hoos: 7, laars: 8, riem: 9,
    gesp: 10, helm: 11, hout: 12, ijzer: 13, handschoen: 14, kwastR: 15, kwastG: 16,
  };
  const D = { benen: 1, laars: 2, wambuis: 3, rok: 4, riem: 5, armL: 6, armR: 7, handL: 8, handR: 9, hoofd: 10, baard: 11, helm: 12, rand: 13, schacht: 14, blad: 15, kwast: 16 };
  const H = [0, 3.6, 72.6];
  const kop = [7.4, 7.2, 7.8];
  const oog = [2.8, 0.5];
  const lopen = houdingVan(stand) === 'lopen';
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.6, hi: 6, schaduwKracht: 0.8 };
  mat[M.oog] = OOG;
  mat[M.mond] = mondVan(1.4);
  mat[M.baard] = { ramp: 'vacht', lo: 0.5, hi: 3, patroon: (x, y, z) => (Math.sin(x * 2.4 + z * 1.7) > 0.6 ? 0.6 : 0) };
  // gewatteerd: staande banen, met om de zoveel een stiksel dwars
  mat[M.wambuis] = {
    ramp: 'schors',
    lo: 0.9,
    hi: 4.6,
    patroon: (x, y, z) => {
      if (Math.sin(Math.atan2(y - 1, x) * 16) > 0.82) return -0.9;
      return Math.sin(z * 0.9) > 0.93 ? -0.7 : 0;
    },
  };
  mat[M.rood] = { ramp: 'rood', lo: 1.2, hi: 5.6, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.35) > 0.9 ? -0.6 : 0) };
  mat[M.geel] = { ramp: 'goud', lo: 2, hi: 5.8, patroon: (x, y, z) => (Math.sin(x * 1.2 + z * 0.35) > 0.9 ? -0.6 : 0) };
  mat[M.hoos] = { ramp: 'vacht', lo: 0.5, hi: 3.4 };
  mat[M.laars] = { ramp: 'leer', lo: 0.4, hi: 4, glans: 0.8 };
  mat[M.riem] = { ramp: 'leer', lo: 0.4, hi: 3 };
  mat[M.gesp] = { ramp: 'ijzer', lo: 2, hi: 6.4, glans: 1.4, detail: true };
  mat[M.helm] = { ramp: 'ijzer', lo: 1.2, hi: 6, glans: 1.6, patroon: (x, y, z) => (ruis3(x * 0.3, y * 0.3, z * 0.3, 77) > 0.82 ? -0.8 : 0) };
  mat[M.hout] = { ramp: 'hout', lo: 1, hi: 5, patroon: (x, y, z) => (Math.sin(z * 1.1 + x * 3) > 0.88 ? -0.6 : 0) };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.8, hi: 6.8, glans: 2 };
  mat[M.handschoen] = { ramp: 'leer', lo: 0.8, hi: 4.4 };
  mat[M.kwastR] = { ramp: 'rood', lo: 1.6, hi: 5.8 };
  mat[M.kwastG] = { ramp: 'goud', lo: 2.2, hi: 6 };

  const delen = [];
  const bot = botten(delen);
  const hg = houdingDorpeling(stand, { snelheid: SOLDAAT_SNELHEID, fps: SOLDAAT_FPS, beenLengte: 30 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 36],
    nek: [0, 1, 64],
    schouders: [[-13.4, 0.4, 60.6], [13.4, 0.4, 60.6]],
  });

  // --- zware benen in donkere hozen; laarzen tot halverwege de kuit, die met de scheen meegaan
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const P = knieBeen(delen, hg, i, [s * 5.4, 0.2, 36], [s * 5.2, 0.8, 6.2], [5.2, 4], M.hoos, D.benen);
    const omhoog = eenheid(min(P.knie, P.enkel));
    delen.push(kegel(plus(P.enkel, maal(omhoog, -1)), plus(P.enkel, maal(omhoog, 9.5 - s * 0.4)), 4.5, 4.8, M.laars, D.laars, 0.8));
    bot(null);
    delen.push(ellips([s * 5.2, 2.6, 2.6], [3.9, 6.8, 3], M.laars, D.laars, 1));
    bot(voetBot(hg, i, [s * 5.2, 2.4, 0]));
  }

  // --- het wambuis, met een korte gewatteerde rok over de dijen, en een staande kraag
  const lijf = {
    rx: profiel([[25, 12.8], [31, 12.6], [37, 12.6], [43, 13.2], [50, 14.2], [56, 14.4], [61, 12.8]]),
    ry: profiel([[25, 10.6], [31, 10], [37, 9.4], [43, 9.4], [50, 9.8], [56, 9.4], [61, 7.6]]),
    cy: profiel([[25, 0.6], [37, 1.1], [44, 1.4], [52, 1.3], [61, 0.7]]),
  };
  delen.push(plooiRomp(lijf, 25, 61, M.wambuis, D.wambuis, { plooi: 0.8, zPlooi: 36, k: 2 }));
  delen.push(ellips([0, 0.5, 60.4], [13.9, 8.8, 4.6], M.wambuis, D.wambuis, 3));
  delen.push(ring([0, 1.3, 62.8], eenheid([0, 0.12, 1]), 5.6, 1.9, M.wambuis, D.wambuis));
  // --- de wapenrok: voor en achter een baan, gevierendeeld rood en geel, open aan de zijkanten;
  // de naden lopen net niet recht, en de zoom hangt links een tikje lager
  const wapenrok = schil(lijf, { los: 0.6, d: 0.75, breed: (z) => 9.2 + Math.max(0, 44 - z) * 0.07, z0: 22.6, z1: 60.6, zHang: 34, voor: false }, 0, D.rok);
  delen.push({
    ...wapenrok,
    f: (x, y, z) => Math.max(wapenrok.f(x, y, z), 22.6 - 0.05 * x - z),
    m: (x, y, z) => ((x > 0.4 + 0.03 * (z - 40)) === (z > 41.6 + 0.05 * x) ? M.rood : M.geel),
  });
  delen.push(band(lijf, [0, 0, 41.4], [0.03, 0, 1], 1.25, { los: 1.6, d: 0.6, z0: 38, z1: 45 }, M.riem, D.riem));
  delen.push(blokGedraaid([0.6, lijf.cy(41.4) + lijf.ry(41.4) + 3.1, 41.4], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [1.9, 0.5, 1.6], 0.3, M.gesp, D.riem));
  bot(Bn.Bromp);

  // --- de linkerarm zwaait, in een dikke gewatteerde mouw, met een leren handschoen
  const mouw = { r: [5, 4.4, 3.4], mouw: 2, stof: M.wambuis, huid: M.handschoen, hand: [3, 3.2, 3.4] };
  arm(delen, [-13.4, 0.4, 60.6], [-16, 0.2, 48.4], [-15.6, 3, 37.4], { ...mouw, dArm: D.armL, dHand: D.handL });
  bot(Bn.Barm[0]);

  // --- de hellebaard, rechtop in de rechterhand. Staand rust hij op de grond; lopend draagt hij
  // hem, een eind erboven. Een steekpunt, een bijlblad naar voren, een haak naar achteren, en een
  // kwastje in rood en geel waar het ijzer begint.
  const til = lopen ? 4.2 : 0;
  const voet = [17.2, 6.8, 0.6 + til];
  const top = [16.6, 5.8, 99.6 + til];
  const u = eenheid(min(top, voet));
  const opSchacht = (t) => plus(voet, maal(u, t));
  const lengte = Math.hypot(...min(top, voet));
  delen.push(kegel(voet, top, 1.2, 1.1, M.hout, D.schacht));
  delen.push(kegel(opSchacht(lengte - 14), opSchacht(lengte + 1), 1.45, 1.35, M.ijzer, D.blad));
  delen.push(kegel(opSchacht(lengte), opSchacht(lengte + 10.5), 1.2, 0.15, M.ijzer, D.blad));
  const bladM = opSchacht(lengte - 4.4);
  // Het blad: een halve schijf met de snede naar buiten en een tikje naar voren (67,5° van recht
  // vooruit), zodat hij in geen van de acht richtingen precies op zijn kant staat en dus nergens
  // tot een streepje wordt. Onder de snede een baard; aan de andere kant van de schacht een haak.
  const hoek = (67.5 * Math.PI) / 180;
  const bu = [Math.sin(hoek), Math.cos(hoek), 0];
  const bn = [Math.cos(hoek), -Math.sin(hoek), 0];
  delen.push({
    f: (x, y, z) => {
      const dx = x - bladM[0];
      const dy = y - bladM[1];
      const dz = z - bladM[2];
      const du = dx * bu[0] + dy * bu[1];
      const dn = dx * bn[0] + dy * bn[1];
      const ovaal = sdf.ellipsoide(0, du - 1.2, dz + 0.12 * du, 1, 7.4, 6.2);
      const vlak = Math.max(ovaal, 0.8 - du, dz - 5.2 + 0.25 * du, -dz - 6.4 - 0.5 * du);
      return Math.max(vlak, Math.abs(dn) - 0.55 - Math.max(0, 3 - du) * 0.12) * 0.85;
    },
    g: [bladM[0] + bu[0] * 4, bladM[1] + bu[1] * 4, bladM[2], 9.5],
    m: M.ijzer,
    deel: D.blad,
  });
  const haak = opSchacht(lengte - 3.4);
  delen.push(kegel(plus(haak, maal(bu, -0.8)), plus(plus(haak, maal(bu, -6.6)), [0, 0, -2.2]), 1.25, 0.3, M.ijzer, D.blad));
  const kwast = opSchacht(lengte - 15.2);
  delen.push(bol(kwast, 1.5, M.kwastR, D.kwast));
  for (const [dx, dy, m] of [[-1.1, 0.8, M.kwastR], [1.2, 0.4, M.kwastG], [0.2, -1.2, M.kwastR], [-0.6, -0.4, M.kwastG], [0.9, 1.3, M.kwastG]]) {
    delen.push(kegel(plus(kwast, [dx * 0.6, dy * 0.6, -0.6]), plus(kwast, [dx * 1.6, dy * 1.6, -6.4]), 0.75, 0.55, m, D.kwast));
  }
  // de rechterhand om de schacht, de elleboog naar achteren
  const grijp = opSchacht(43.2 - voet[2]);
  arm(delen, [13.4, 0.4, 60.6], [18.4, -1.6, 50.6], plus(grijp, [-0.6, -0.4, 0]), { ...mouw, dArm: D.armR, dHand: D.handR });
  bot(Bn.Bromp);

  // --- het hoofd: een brede kop met een zware frons, een platte neus, een korte zwarte baard
  const oy = schedel(delen, H, M, D, { maat: kop, oog });
  for (const s of [-1, 1]) {
    // de frons: de wenkbrauwen lopen naar binnen omlaag
    delen.push(ellips(plus(H, [s * 3, oy + 0.2, oog[1] + 1.9]), [2, 0.95, 0.85], M.baard, D.hoofd, 0.4));
    delen.push(ellips(plus(H, [s * 1.3, oy + 0.4, oog[1] + 1.2]), [1.2, 0.95, 0.8], M.baard, D.hoofd, 0.4));
  }
  delen.push(ellips(plus(H, [0, 6.8, -1.6]), [2.1, 2.2, 2.6], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 7.6, -3]), 1.9, M.huid, D.hoofd, 1));
  delen.push(ellips(plus(H, [0, 2.6, -5.2]), [7.2, 5.8, 3.8], M.baard, D.baard, 1.2));
  delen.push(ellips(plus(H, [0, 6.2, -4.4]), [3.8, 1.8, 1.3], M.baard, D.baard, 0.6));
  delen.push(capsule(plus(H, [-1.6, 6.6, -5.9]), plus(H, [1.6, 6.5, -6]), 0.45, M.mond, D.baard));
  delen.push(ellips(plus(H, [0, -2.2, -0.8]), [7.5, 6.4, 6.4], M.baard, D.hoofd, 1));
  // de ijzeren hoed: een koepel met een kam, en een brede rand die schuin omlaag loopt; hij staat
  // een fractie scheef en heeft een deuk
  const HC = plus(H, [0.3, -1.2, 6.2]);
  delen.push({
    f: (x, y, z) => {
      const dx = x - HC[0];
      const dy = y - HC[1];
      const dz = z - HC[2] + 0.05 * dx;
      const deuk = 0.5 * Math.exp(-((dx + 4) ** 2 + (dy - 3) ** 2 + (dz - 3.5) ** 2) / 6);
      return Math.max(sdf.ellipsoide(dx, dy, dz, 8.3, 8.1, 7) + deuk, -dz - 0.6);
    },
    g: [HC[0], HC[1], HC[2] + 3, 10.5],
    m: M.helm,
    deel: D.helm,
  });
  delen.push({
    f: (x, y, z) => Math.max(sdf.ellipsoide(x - HC[0], y - HC[1] + 0.2, z - HC[2] - 1.2, 1, 7.6, 7.3), HC[2] + 2 - z),
    g: [HC[0], HC[1], HC[2] + 4, 9],
    m: M.helm,
    deel: D.helm,
  });
  delen.push({
    f: (x, y, z) => {
      const dx = x - HC[0];
      const dy = y - HC[1];
      const r = Math.hypot(dx, dy);
      const dz = z - HC[2] + 0.05 * dx + 0.45 * Math.max(0, r - 7.2);
      return sdf.ellipsoide(dx, dy, dz, 11.4, 11.1, 0.95) * 0.7;
    },
    g: [HC[0], HC[1], HC[2] - 1.5, 13],
    m: M.helm,
    deel: D.rand,
  });
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

// ---------------------------------------------------------------- de inner

const INNER_SNELHEID = 1.5;
const INNER_FPS = 10;

// De inner: de man die komt tellen. Lang, mager en wat krom, in een donkere jas tot halverwege de
// dij met een wit boordje, een zwart kalotje, een lange spitse neus en één opgetrokken wenkbrauw.
// Het rekenboek klemt hij onder zijn linkerarm (die zwaait dus niet), en achter zijn rechteroor
// steekt een ganzenveer. Alleen zijn hozen zijn van de heer: links rood, rechts geel.
// stand: zie smid().
function inner(stand = null) {
  const M = {
    huid: 0, oog: 1, mond: 2, haar: 3, kap: 4, jas: 5, kraag: 6, hoosL: 7, hoosR: 8, schoen: 9,
    riem: 10, boek: 11, blad: 12, veer: 13, schacht: 14, buidel: 15,
  };
  const D = { benen: 1, jas: 2, kraag: 3, riem: 4, armL: 5, armR: 6, handL: 7, handR: 8, hoofd: 9, haar: 10, kap: 11, boek: 12, blad: 13, pen: 14, buidel: 15, schoen: 16 };
  const H = [0, 5.2, 70.4];
  const kop = [6.1, 6.5, 8];
  const oog = [2.4, 0.9];
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 2.2, hi: 6.4, schaduwKracht: 0.8 };
  mat[M.oog] = OOG;
  mat[M.mond] = mondVan(1.6);
  mat[M.haar] = { ramp: 'vacht', lo: 0.4, hi: 2.8, patroon: (x, y, z) => (Math.sin(x * 2.2 + y * 0.5) > 0.7 ? 0.5 : 0) };
  mat[M.kap] = { ramp: 'inkt', lo: 0.6, hi: 3.4, glans: 0.6 };
  mat[M.jas] = { ramp: 'vacht', lo: 0.6, hi: 3.8 };
  mat[M.kraag] = { ramp: 'pleister', lo: 2.8, hi: 6.6 };
  mat[M.hoosL] = { ramp: 'rood', lo: 1.4, hi: 5.6 };
  mat[M.hoosR] = { ramp: 'goud', lo: 2, hi: 5.9 };
  mat[M.schoen] = { ramp: 'vacht', lo: 0.3, hi: 2.4, glans: 1 };
  mat[M.riem] = { ramp: 'leer', lo: 0.4, hi: 3 };
  mat[M.boek] = { ramp: 'dak', lo: 0.8, hi: 4.6, patroon: (x, y, z) => (Math.abs(Math.sin(z * 0.55)) > 0.97 ? -0.8 : 0) };
  mat[M.blad] = { ramp: 'perkament', lo: 1.6, hi: 4.8, patroon: (x, y, z) => (Math.sin(x * 5.5) > 0.6 ? -0.7 : 0) };
  mat[M.veer] = { ramp: 'baard', lo: 3.4, hi: 6.8, rand: 0.6, detail: true };
  mat[M.schacht] = { ramp: 'bot', lo: 2.6, hi: 6, detail: true };
  mat[M.buidel] = { ramp: 'leer', lo: 0.8, hi: 4.4 };

  const delen = [];
  const bot = botten(delen);
  const hg = houdingDorpeling(stand, { snelheid: INNER_SNELHEID, fps: INNER_FPS, beenLengte: 30 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.3, 37],
    nek: [0, 1.6, 61.4],
    schouders: [[-9.6, 0.4, 59.2], [9.6, 0.8, 58.2]],
  });

  // --- lange dunne benen: de linker rood, de rechter geel, en zwarte schoenen met een puntje
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    knieBeen(delen, hg, i, [s * 4, 0.1, 37], [s * 3.9, 0.6, 5.4], [3.7, 2.8], s < 0 ? M.hoosL : M.hoosR, D.benen);
    bot(null);
    delen.push(ellips([s * 3.9, 2.9, 2.3], [2.8, 6.4, 2.4], M.schoen, D.schoen, 1));
    bot(voetBot(hg, i, [s * 3.9, 2.4, 0]));
  }

  // --- de jas: smal, tot halverwege de dij, met plooien in de rok; een wit boordje, een dunne riem
  // met een leren buidel eraan
  const jas = {
    rx: profiel([[28, 10.8], [33, 10], [38, 9.2], [43, 8.6], [49, 9], [55, 9.6], [59.6, 8.8]]),
    ry: profiel([[28, 9.2], [33, 8.4], [38, 7.2], [43, 6.4], [49, 6.4], [55, 6.4], [59.6, 5.6]]),
    cy: profiel([[28, 0.2], [38, 0.4], [45, 0.7], [55, 1.3], [59.6, 1.5]]),
  };
  // de zoom hangt niet recht: links een fractie lager
  const jasRomp = plooiRomp(jas, 26, 59.6, M.jas, D.jas, { plooi: 1.3, zPlooi: 42, k: 2 });
  delen.push({ ...jasRomp, f: (x, y, z) => Math.max(jasRomp.f(x, y, z), 28 + 0.06 * x - z) });
  delen.push(ellips([0, 0.9, 59.2], [9.8, 6.2, 3.2], M.jas, D.jas, 2.5));
  delen.push(ring([0, 1.9, 60.4], eenheid([0, 0.32, 1]), 4, 1.15, M.kraag, D.kraag));
  delen.push(band(jas, [0, 0, 43.2], [0, 0, 1], 0.8, { los: 0.4, d: 0.5, z0: 40, z1: 46 }, M.riem, D.riem));
  const buidel = [9.3, 3.4, 38.6];
  delen.push(ellips(buidel, [2.3, 1.9, 3], M.buidel, D.buidel, 0.8));
  delen.push(kegel(plus(buidel, [0, 0, 2.2]), plus(buidel, [-0.2, -0.3, 4.6]), 1.1, 0.7, M.buidel, D.buidel, 0.6));

  // --- het rekenboek, rechtop tegen zijn linkerzij geklemd, de voorkant een tikje omlaag en naar
  // buiten gedraaid (zo zie je van voren ook de band): een leren band om vergeelde bladen, de rug
  // naar achteren
  const Bc = [-11.3, 3, 46.4];
  const as = assen([-0.34 * Math.cos(0.2), 0.94 * Math.cos(0.2), -Math.sin(0.2)], [0, 0, 1]);
  // as[0] = langs het boek (naar voren), as[1] = dwars (opzij), as[2] = de hoogte
  const [ua, va, wa] = as;
  const boekAs = [va, ua, wa]; // eigen assen in de volgorde dikte, lengte, hoogte
  delen.push(blokGedraaid(Bc, boekAs, [1.5, 6.6, 6.6], 0.3, M.blad, D.blad));
  for (const s of [-1, 1]) delen.push(blokGedraaid(plus(Bc, maal(va, s * 1.75)), boekAs, [0.38, 7, 7], 0.3, M.boek, D.boek));
  delen.push({
    f: (x, y, z) => {
      const d = min([x, y, z], plus(Bc, maal(ua, -7)));
      const l = d[0] * wa[0] + d[1] * wa[1] + d[2] * wa[2];
      const q = [d[0] - wa[0] * l, d[1] - wa[1] * l, d[2] - wa[2] * l];
      return Math.max(Math.hypot(...q) - 2, Math.abs(l) - 7);
    },
    g: [...plus(Bc, maal(ua, -7)), 7.6],
    m: M.boek,
    deel: D.boek,
  });
  // de linkerarm klemt het boek: de bovenarm erlangs, de hand onder de voorkant
  arm(delen, [-9.6, 0.4, 59.2], [-14.6, -0.4, 47.6], [-12.4, 8.8, 41.2], { r: [3.3, 2.9, 2.3], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armL, dHand: D.handL, hand: [2.1, 2.4, 2.8] });
  bot(Bn.Bromp);

  // --- de rechterarm zwaait, lang en dun
  arm(delen, [9.6, 0.8, 58.2], [11.2, 0.4, 46.4], [10.8, 2.6, 35.6], { r: [3.3, 2.9, 2.3], mouw: 2, stof: M.jas, huid: M.huid, dArm: D.armR, dHand: D.handR, hand: [2.1, 2.4, 2.8] });
  bot(Bn.Barm[1]);

  // --- nek en hoofd: een dunne nek die naar voren steekt, een lang smal gezicht met een spitse
  // neus, samengeknepen ogen, dunne lippen, en de linkerwenkbrauw hoger dan de rechter
  delen.push(kegel([0, 1.2, 58.6], plus(H, [0, -1.4, -5.6]), 2.9, 2.6, M.huid, D.hoofd));
  const oy = schedel(delen, H, M, D, { maat: kop, oog, oogR: 0.8 });
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * oog[0], oy + 0.25, oog[1] + 0.85]), [1.35, 0.8, 0.6], M.huid, D.hoofd));
  delen.push(kegel(plus(H, [0, 5.6, 0.6]), plus(H, [0.3, 9.4, -2.8]), 1.5, 0.6, M.huid, D.hoofd, 0.6));
  delen.push(ellips(plus(H, [0, 3.6, -6.6]), [3.2, 3.2, 2.6], M.huid, D.hoofd, 1.4));
  delen.push(capsule(plus(H, [-1.5, 5.4, -4.9]), plus(H, [1.5, 5.3, -5.1]), 0.42, M.mond, D.hoofd));
  for (const s of [-1, 1]) {
    const dz = oog[1] + (s < 0 ? 2.9 : 1.9);
    delen.push(ellips(plus(H, [s * 2.5, oy - 0.1, dz]), [1.9, 0.7, 0.55], M.haar, D.hoofd, 0.4));
  }
  // steil zwart haar tot over de oren, en een kalotje erop
  delen.push(ellips(plus(H, [0, -1.6, 0.4]), [6.6, 6.2, 7.6], M.haar, D.haar, 1));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 5.2, 1.2, -1.6]), [1.6, 3, 4.2], M.haar, D.haar, 1));
  delen.push({
    f: (x, y, z) => {
      const dx = x - H[0] + 0.3;
      const dy = y - H[1] + 0.6;
      const dz = z - H[2] - 0.6 - 0.06 * dx;
      return Math.max(sdf.ellipsoide(dx, dy, dz, 6.7, 7, 8.2), 4.4 - dz + 0.12 * dy);
    },
    g: [H[0], H[1], H[2] + 5, 8],
    m: M.kap,
    deel: D.kap,
  });
  // de ganzenveer achter het rechteroor: de schacht naar beneden, de vaan schuin omhoog naar achteren
  const penOnder = plus(H, [5.6, 1.4, -3.4]);
  const penBoven = plus(H, [7.6, -7.4, 9.2]);
  const penU = eenheid(min(penBoven, penOnder));
  delen.push(capsule(penOnder, penBoven, 0.45, M.schacht, D.pen));
  delen.push(ellipsGedraaid(langs(penOnder, penBoven, 0.68), assen(penU, [1, 0, 0]), [5.4, 1.5, 0.45], M.veer, D.pen, 0.3));
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

module.exports = {
  heer,
  soldaat,
  inner,
  HEER_SNELHEID,
  HEER_FPS,
  SOLDAAT_SNELHEID,
  SOLDAAT_FPS,
  INNER_SNELHEID,
  INNER_FPS,
};
