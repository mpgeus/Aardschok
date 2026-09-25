// De dorpelingen van Aardschok: de smid, de herbergierster, de boer en de dorpsoudste. Mensen uit
// het dorp aan de voet van de toren, die de tovenaar een opdracht kunnen geven. Zelfde bouwstenen,
// maten en materialen als Wim (figuren2.cjs), zodat ze naast hem in hetzelfde spel staan.
// Lokale assen: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// Wegschrijven: dorpelingen-export.cjs (stroken van acht richtingen en portretten).
'use strict';
const { sdf, bouwSdf, klem, mix, ruis3 } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus, naarRamp } = require('./figuren.cjs');
const { ring, eenheid, langs } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const KAR = require('./karakters.cjs'); // wat een karakter op het lijf van de boer draagt

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

// ---------------------------------------------------------------- lopen en staan (fase A, 22 sep 2026; knie: fase B1, 22 sep 2026)
//
// Eén manier waarop een dorpeling kan lopen, licht genoeg om straks op alle negentien en op
// dorpeling(zaad) (dorpelingen3.cjs) toe te passen (ontwerp/werklijst.md, punt 2). Een dorpeling
// heeft nu, net als Wim en de oude meester (figuren2.cjs, meester.cjs), een echte knie: een been
// is dij (heup–knie) en scheen (knie–enkel), twee losse stukken in plaats van één stijve kegel van
// heup tot schoen. Een arm blijft wel één stuk — er komt in deze stap geen elleboog bij, alleen
// een knie (ontwerp/wereld.md, "Ze lopen met knieën, zoals Wim").
//
//   - Been: HH.loopVoet (houding.cjs) geeft het doel voor de enkel (de voorwaartse schuif die een
//     glijdende voet voorkomt, plus nu ook `til`: een beetje optillen in de zwaaifase, want de
//     oude truc "de boog van de heuprotatie tilt de voet vanzelf op" bestaat niet meer zonder die
//     rotatie). `beenPunten` hieronder schuift de heup mee met de romp (zij/voor/zak) en legt de
//     enkel op dat doel; de knie komt erbij via HH.elleboog — dezelfde IK als bij Wim en de
//     meester (zie hun been()/wim()-code). De lengtes dij en scheen uit de ruststand blijven
//     vast, alleen de hoek verandert: de knie buigt vanzelf het meest in de zwaaifase (de enkel
//     komt dan dicht bij de heup) en een beetje in de steunfase, via `zak` (de romp zakt per stap
//     iets in, ook al bestaand sinds fase A). Zonder stand (hg null) geeft `beenPunten` gewoon de
//     ruststandpunten terug: het oude ene stijve stuk, geen pixel anders. Ook in rust staat de
//     knie niet kaarsrecht — `knieTussen` legt hem een stukje vóór de rechte lijn heup–enkel,
//     zoals de ruststand van Wim dat zelf ook al doet; net als bij Wim verandert die rust-buiging
//     verder niet tijdens het ademhalen (`staan` hieronder raakt de knie niet aan).
//   - Voet: de schoen blijft op zijn ruststandcoördinaten getekend; `voetBot` schuift en kantelt
//     hem naar het echte doel (dezelfde Bvoet-truc als Wim en de meester), zodat hiel en bal nooit
//     los van de scheen komen te staan.
//   - Arm: geen aparte berekening; hij zwaait tegengesteld aan het been aan dezelfde kant
//     (zodat de linkerarm meezwaait met het rechterbeen, zoals bij lopen hoort), met dezelfde hoek
//     die de oude, beenloze versie ook al gebruikte (beenLengte zet het loopVoet-doel om in een
//     hoek, alleen nog voor de arm).
//   - Romp en nek: een klein beetje wiegen, zakken en tegendraaien, zoals bij Wim en de meester.
//   - Rok: bij een rok (klokrok, dorpelingen3.cjs) blijft het been zelf onzichtbaar (het
//     "verdwijnt onder de rok", zie dorpeling()), maar de voet beweegt nu gewoon mee. Onder een
//     rok zie je de pas dus vooral aan de schoen die bij de zoom vandaan komt en aan hoe de rok
//     zelf meezwaait (`rokZwaai`, al sinds fase A). Vroeger stond het been van een rok-drager
//     helemaal stil, want het hele stijve been zwaaide in één grote boog om de heup en kwam zo
//     een eind buiten de zoom; met een knie blijft de dij — het stuk vlak bij de rok — grotendeels
//     overeind, dus dat probleem is er niet meer.
//
// Een bouwfunctie roept `houdingDorpeling(stand, o)` aan voor de generieke getallen en
// `bottenDorpeling(hg, o)` om romp, nek, arm en rok, met de eigen heup-, nek- en schouderpunten
// van die figuur, om te zetten in HH-bewegingen; die past hij toe met dezelfde bot()/
// HH.beweegDeel-truc als wim() en meester() (zie smid() hieronder voor het voorbeeld). Voor het
// been zelf roept hij `beenPunten` (heup/knie/enkel) en `voetBot` (het voetbot) rechtstreeks aan
// met de eigen ruststandpunten van die figuur; `knieTussen` helpt aan een redelijke ruststand-
// knie tussen twee eigen punten. Zonder stand (hg is dan null) komt overal `null` of de
// ruststandpunten terug en blijft bot() een no-op: het model blijft precies gelijk, dus
// dorpelingen-export.cjs en dorpelingen3-export.cjs (die nog geen stand meegeven) blijven hun
// oude stilstaande vellen leveren, geen pixel anders.

function rustDorpeling() {
  return {
    zak: 0, zij: 0, voor: 0,
    romp: { buig: 0, draai: 0, omhoog: 0 },
    nek: { knik: 0, draai: 0 },
    voet: [{ y: 0, z: 0, hoek: 0 }, { y: 0, z: 0, hoek: 0 }], // 0 = links, 1 = rechts; het enkeldoel
    arm: [{ hoek: 0 }, { hoek: 0 }],
    rokZwaai: 0,
  };
}

// stand: { houding, fase } — 'staan' (ademen) en 'lopen' (acht beelden, zie hierboven).
// o: { snelheid (tegels per seconde — dezelfde als waarmee de figuur ook echt rondloopt, anders
// lijkt hij toch te glijden), fps, beenLengte (heup tot voet, voor naarHoek hierboven) }.
function houdingDorpeling(stand, o = {}) {
  const naam = typeof stand === 'string' ? stand : stand && stand.houding;
  if (!naam) return null;
  const fase = (typeof stand === 'object' && stand.fase) || 0;
  const { snelheid = 1.3, fps = 10, beenLengte = 27 } = o;
  const h = rustDorpeling();
  const rij = (r) => HH.langsRij(r, fase);
  switch (naam) {
    case 'staan': {
      const adem = rij([0, 1, 1, 0, 0]);
      h.romp.omhoog = 0.55 * adem;
      h.nek.knik = -0.9 * adem;
      break;
    }
    case 'lopen': {
      const v = snelheid * HH.PER_TEGEL;
      const T = 8 / fps; // acht beelden per cyclus
      const steun = 0.55;
      const til = 2.6;
      const L = HH.loopVoet(fase, { v, T, steun, til, hiel: 9, hak: 12 });
      const R = HH.loopVoet(fase, { v, T, steun, til, hiel: 9, hak: 12, verzet: 0.5 });
      h.voet = [{ y: L.y, z: L.z, hoek: L.hoek }, { y: R.y, z: R.z, hoek: R.hoek }];
      // de arm heeft geen elleboog en zwaait dus nog star om de schouder, tegengesteld aan het
      // been aan dezelfde kant; beenLengte zet het loopVoet-doel om in diezelfde hoek (net als
      // vóór de knie, alleen niet meer voor het been zelf gebruikt)
      const naarHoek = (voet) => (Math.asin(klem(voet.y / beenLengte, -1, 1)) * 180) / Math.PI;
      h.arm = [{ hoek: -0.6 * naarHoek(L) }, { hoek: -0.6 * naarHoek(R) }];
      h.zak = 0.4 + 0.4 * HH.cosinus(2 * fase);
      h.zij = 0.5 * HH.sinus(fase);
      h.romp.buig = 1.5 + 0.8 * HH.cosinus(2 * fase);
      h.romp.draai = 3 * HH.sinus(fase);
      h.nek.knik = -1.3 - h.romp.buig * 0.3;
      h.nek.draai = -0.5 * h.romp.draai;
      h.rokZwaai = 4.5 * HH.sinus(fase);
      break;
    }
    default:
      throw new Error(`Een dorpeling kent de houding "${naam}" niet.`);
  }
  return h;
}

// Zet de generieke houding hierboven om in HH-bewegingen, met de eigen gewrichtspunten van een
// figuur: o = { heup, nek, schouders: [links, rechts] }. Het been zelf staat hier niet bij — dat
// gaat via beenPunten/voetBot hieronder, want die hebben de ruststandpunten (heup/knie/enkel) van
// de eigen figuur nodig, niet alleen een scharnierpunt. Zonder houding (hg null, dus geen stand
// meegegeven aan de bouwfunctie) komt overal `null` uit, en blijft bot() overal een no-op.
//
// Krom (de oudste, karakters.cjs): o.krom is hoeveel graden het bovenlijf om de heup naar voren
// hangt, en o.nekKrom hoeveel het hoofd daarna weer omhoog kijkt. De armen hangen dan mee met het
// lijf (eerst hun eigen zwaai, dan het lijf voorover); de rok niet. Zonder krom blijft alles precies
// zoals het was.
function bottenDorpeling(hg, o) {
  const Bkrom = o.krom ? HH.beweging({ M: HH.draaiing([1, 0, 0], -o.krom), om: o.heup }) : null;
  if (!hg) {
    if (!Bkrom) return { Barm: [null, null] };
    const BnekKrom = HH.naElkaar(Bkrom, HH.beweging({ M: HH.draaiing([1, 0, 0], o.nekKrom || 0), om: o.nek }));
    return { Bromp: Bkrom, Bnek: BnekKrom, Barm: [Bkrom, Bkrom] };
  }
  const draaiM = (buig, om) => HH.maalM(HH.draaiing([0, 0, 1], om), HH.draaiing([1, 0, 0], -buig));
  const Blijf = HH.beweging({ dp: [hg.zij, hg.voor, -hg.zak] });
  const buig = Bkrom ? hg.romp.buig + o.krom : hg.romp.buig;
  const knik = Bkrom ? hg.nek.knik - (o.nekKrom || 0) : hg.nek.knik;
  const Bromp = HH.naElkaar(Blijf, HH.beweging({ M: draaiM(buig, hg.romp.draai), om: o.heup, dp: [0, 0, hg.romp.omhoog] }));
  const Bnek = HH.naElkaar(Bromp, HH.beweging({ M: draaiM(knik, hg.nek.draai), om: o.nek }));
  const Barm = [0, 1].map((i) => HH.naElkaar(Bkrom, HH.beweging({ as: [1, 0, 0], graden: hg.arm[i].hoek, om: o.schouders[i] })));
  // de rok zelf: rokZwaai (van houdingDorpeling) is een ruimere zwaai dan de romp, want stof
  // zwiert verder uit dan het lijf zelf beweegt (alleen van belang voor een figuur met een rok,
  // zie dorpelingen3.cjs — "een rok zwaait mee in plaats van benen te tonen")
  const Brok = HH.beweging({ dp: [hg.rokZwaai, hg.voor * 0.5, 0] });
  return { Blijf, Bromp, Bnek, Barm, Brok };
}

// Een redelijke ruststand-knie tussen een heup- en een enkelpunt: in het midden, met een stukje
// voorwaartse buiging (bump) zodat de knie niet kaarsrecht staat — zoals de ruststand van Wim dat
// ook al doet (heup–knie–enkel in wim(), figuren2.cjs: de knie ligt zo'n anderhalve eenheid vóór
// het midden van de rechte lijn heup–enkel).
function knieTussen(heup, enkel, bump = 1.5) {
  return HH.plus(HH.tussen(heup, enkel, 0.5), [0, bump, 0]);
}

// De knie via dezelfde IK als bij Wim en de meester (HH.elleboog, figuren2.cjs/meester.cjs): de
// lengtes dij (heup–knie) en scheen (knie–enkel) uit de ruststand blijven vast, en de knie schuift
// mee zodat de enkel op zijn nieuwe doel (hg.voet[i], het loopVoet-doel) uitkomt. o = { heup, knie,
// enkel }: de drie ruststandpunten van de eigen figuur, met de zijkant (s) er al in verwerkt — zie
// been() in dorpelingen3.cjs en de benen van smid() hieronder. Zonder houding (hg null) komen de
// ruststandpunten ongewijzigd terug.
function beenPunten(hg, i, o) {
  if (!hg) return { heup: o.heup, knie: o.knie, enkel: o.enkel };
  const heup = HH.plus(o.heup, [hg.zij, hg.voor, -hg.zak]);
  const enkel = HH.plus(o.enkel, [0, hg.voet[i].y, hg.voet[i].z]);
  const knie = HH.elleboog(o.heup, o.knie, o.enkel, heup, enkel);
  return { heup, knie, enkel };
}

// Het voetbot: schuift en kantelt een deel dat nog op zijn ruststandcoördinaten staat (de schoen,
// zie been() hieronder) naar zijn echte plek, om een punt vlak bij de bal van de voet op de grond
// — dezelfde Bvoet-truc als Wim en de meester. Zonder houding (hg null) komt `null` terug (bot()
// doet er dan niets mee).
function voetBot(hg, i, om) {
  return hg ? HH.beweging({ as: [1, 0, 0], graden: hg.voet[i].hoek, om, dp: [0, hg.voet[i].y, hg.voet[i].z] }) : null;
}

const SMID_SNELHEID = 1.5;
const SMID_FPS = 10;

// ---------------------------------------------------------------- de smid

// De smid: breed en sterk, kaal met een zwarte baard, een leren schort vol roet, de mouwen
// opgestroopt. De voorhamer rust op zijn schouder, de andere vuist in zijn zij.
// stand: { houding, fase } laat hem lopen of ademen (zie houdingDorpeling hierboven); zonder
// stand staat hij stil — precies het oude, stilstaande model, geen pixel anders.
function smid(stand = null) {
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
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: SMID_SNELHEID, fps: SMID_FPS, beenLengte: 28 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.4, 31],
    nek: [0, 2, 65],
    schouders: [[-14.2, 0.4, 60], [14.2, 0.4, 60]],
  });

  // --- benen, heupen en laarzen; het bekken zelf blijft bij de romp (D.benen, zoals vóór deze
  // wijziging). Elk been buigt nu bij de knie (beenPunten hierboven, zie de uitleg bovenaan dit
  // bestand) in plaats van als één stijf bot om de heup te draaien: dij en scheen staan daarom al
  // op hun eindplek en hoeven geen bot() meer, alleen de laars schuift nog mee (voetBot). Zonder
  // stand (hg null) tekent dit precies het oude, stilstaande vel.
  delen.push(ellips([0, 0.4, 31], [10.6, 7, 5], M.broek, D.benen, 2));
  bot(Bn.Bromp);
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 5.2, 0.2, 31];
      const enkelR = [s * 5.3, 0.8, 9];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 5, 4.6, M.broek, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 4.6, 4.2, M.broek, D.benen, 1));
    } else {
      delen.push(kegel([s * 5.2, 0.2, 31], [s * 5.3, 0.8, 9], 5, 4.2, M.broek, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 5.3, 2.6, 2.9], [3.8, 6.2, 3.2], M.laars, D.benen, 1.2));
    delen.push(kegel([s * 5.3, 0.6, 3], [s * 5.3, 0.6, 12.5], 4.4, 4.2, M.laars, D.benen, 1));
    bot(voetBot(hg, i, [s * 5.3, 2.2, 0]));
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
  bot(Bn.Bromp);

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
  bot(Bn.Barm[1]);
  arm([-14.2, 0.4, 60], [-21, -2.2, 50], [-13.4, 1.8, 41.5], D.armL, D.handL);
  bot(Bn.Barm[0]);

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
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 42], straal: 50 });
}

const HERBERGIERSTER_SNELHEID = 1.4;
const HERBERGIERSTER_FPS = 10;

// ---------------------------------------------------------------- de herbergierster

// De herbergierster: rond en hartelijk, een rode jurk met een wit schort, het haar in een knot.
// De vuist in de zij, en in de andere hand een kroes bier die ze je al voorhoudt.
// stand: zie smid() hierboven. Ze heeft geen zichtbaar been (de rok dekt haar helemaal, net als
// dorpsoudste hieronder) — de rok zwaait daarom zelf mee (Bn.Brok), zoals bij een rok-drager in
// dorpeling() (dorpelingen3.cjs).
function herbergierster(stand = null) {
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
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: HERBERGIERSTER_SNELHEID, fps: HERBERGIERSTER_FPS, beenLengte: 27 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.6, 37],
    nek: [0, 0, 55.5],
    schouders: [[-10.4, 0.4, 52.5], [10.4, 0.4, 52.5]],
  });

  // --- rok en schort
  const rokTop = 38;
  const rok = {
    rx: (z) => mix(15.5, 10, Math.pow(klem(z / rokTop, 0, 1), 0.8)),
    ry: (z) => mix(13.5, 8, Math.pow(klem(z / rokTop, 0, 1), 0.9)),
    cy: () => 0.8,
  };
  delen.push(klokrok(rokTop, [15.5, 10], [13.5, 8], () => 0.8, M.jurk, D.rok, 1));
  bot(Bn.Brok);
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
  bot(Bn.Bromp);

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
  bot(Bn.Barm[1]);
  // de kroes: houten duigen, twee ijzeren banden, een oor aan de kant van de hand, schuim erop —
  // ze houdt hem in haar linkerhand, dus hij zwaait mee met die arm (Wat iemand vasthoudt beweegt
  // mee met de hand).
  const kroes = (x, y, z) => (Math.abs(z - K[2] + 2.2) < 0.7 || Math.abs(z - K[2] - 2) < 0.7 ? M.band : M.kroes);
  delen.push(kegel(plus(K, [0, 0, -3.4]), plus(K, [0, 0, 2.8]), 2.9, 2.7, kroes, D.kroes));
  delen.push(ring(plus(K, [-3.1, 0, 0]), [0, 1, 0], 1.8, 0.65, M.band, D.kroes));
  delen.push(ellips(plus(K, [0, 0, 3.6]), [2.9, 2.9, 1.5], M.schuim, D.kroes, 0.8));
  delen.push(bol(plus(K, [1.4, 2.1, 3]), 1.1, M.schuim, D.kroes, 0.8));
  arm([-10.4, 0.4, 52.5], [-13.8, 3, 43], plus(K, [-4.6, -0.3, 0.2]), D.armL, D.handL);
  bot(Bn.Barm[0]);

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
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 38], straal: 46 });
}

const BOER_SNELHEID = 1.5;
const BOER_FPS = 10;

// ---------------------------------------------------------------- de boer

// De boer: lang en mager, een strohoed achter op het hoofd, een donkerblauwe boerenkiel met een rode
// halsdoek, klompen, een strootje in de mondhoek. De hooivork staat naast hem.
// stand: zie smid() hierboven.
// o: wie hij is (ontwerp/beeld.md, "Een gezicht per karakter"; KARAKTERS in karakters.cjs). Zonder
// opties is hij de gewone boer, geen pixel anders. Kleuren: kiel, klomp (materialen). Op het hoofd:
// hoed ('stro', 'muts', 'vilt' of 'geen'), strootje (false: weg), rood (een rood gezicht), boos
// (boze wenkbrauwen en mond). Op de romp: kraag ('doek', 'geen', of 'bont', dat ook de zoom en de
// polsen van de jas bont maakt), riem, buidel (aan de riem), luit (op de rug). De armen: links
// ('vork', 'hangt', 'zij' of 'buidel': de hand op de buidel) en rechts ('hangt' of 'zij'), en mouw
// ('op': hoog opgestroopt).
// Ronde 2: haar (materiaal), hoed ook 'kap' (met een schoudermanteltje), 'bloot' (grijs haar, geen
// hoed) of 'vreemd' (een baret), en hoedScheef (graden dat de strohoed opzij is gezakt); baard, neus
// ('rood', en groter), buik (een dikke buik onder de kiel), krom (graden: het bovenlijf hangt
// voorover), omslagdoek, bundel (op de rug), rozenkrans (uit de handen). En de armen, links of rechts: 'bidt' (de handen gevouwen voor de borst), 'mond' (een hand
// bij de mond), 'hengsel' (een mand aan de arm), 'kroes', 'buik' (de hand op de buik), 'knoop' (aan
// de knoop van de bundel) en 'stok'.
function boer(stand = null, o = {}) {
  const M = { huid: 0, kiel: 1, broek: 2, klomp: 3, haar: 4, oog: 5, stro: 6, lint: 7, doek: 8, hout: 9, ijzer: 10, strootje: 11 };
  const D = { benen: 1, kiel: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, hoed: 8, doek: 9, vork: 10 };
  const H = [0, 4, 68.5];
  const mat = [];
  const ctx = { M, D, mat }; // voor de hulpjes van de karakters
  mat[M.huid] = { ramp: 'huid', lo: 1.9, hi: 6.4, schaduwKracht: 0.85 };
  if (o.rood) mat[M.huid].patroon = KAR.roodGezicht(H, [1.9, 6.4]);
  if (o.neus === 'rood') mat[M.huid].patroon = KAR.rodeNeus(plus(H, [0, 8.4, -2.6]), 3.3, [1.9, 6.4], mat[M.huid].patroon);
  mat[M.kiel] = o.kiel || { ramp: 'pet', lo: 1.4, hi: 6.2, patroon: (x, y, z) => (Math.sin(x * 1.3 + 0.4) > 0.82 && z < 50 ? -0.7 : 0) };
  mat[M.broek] = { ramp: 'aarde', lo: 0.8, hi: 4.6 };
  mat[M.klomp] = o.klomp || { ramp: 'zand', lo: 3, hi: 7.4 };
  mat[M.haar] = o.haar || { ramp: 'schors', lo: 0.8, hi: 4.4 };
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
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: BOER_SNELHEID, fps: BOER_FPS, beenLengte: 24 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 0.3, 30],
    nek: [0, 0, 59],
    schouders: [[-10, 0.3, 56], [10, 0.3, 56]],
    krom: o.krom,
    nekKrom: o.krom ? o.krom * 0.75 : 0,
  });

  // --- benen en klompen: elk been buigt bij de knie (beenPunten, zie de uitleg bovenaan dit
  // bestand); zonder stand (hg null) tekent dit het oude, stilstaande been.
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    if (hg) {
      const heupR = [s * 4.4, 0, 30];
      const enkelR = [s * 4.3, 0.8, 7];
      const P = beenPunten(hg, i, { heup: heupR, knie: knieTussen(heupR, enkelR), enkel: enkelR });
      delen.push(kegel(P.heup, P.knie, 3.9, 3.65, M.broek, D.benen, 1));
      delen.push(kegel(P.knie, P.enkel, 3.65, 3.4, M.broek, D.benen, 1));
    } else {
      delen.push(kegel([s * 4.4, 0, 30], [s * 4.3, 0.8, 7], 3.9, 3.4, M.broek, D.benen, 1));
    }
    bot(null);
    delen.push(ellips([s * 4.4, 2.6, 3], [3.5, 6.6, 3.2], M.klomp, D.benen, 1));
    delen.push(bol([s * 4.4, 8.4, 3.9], 1.7, M.klomp, D.benen, 1.8));
    bot(voetBot(hg, i, [s * 4.4, 2.2, 0]));
  }
  // --- kiel: los en wijd, tot halverwege de dij; schouders erop. (De drinker, buik: de kiel spant
  // om een buik die ver naar voren en wat naar opzij komt.)
  const kiel = o.buik
    ? {
        rx: profiel([[24, 11.4], [30, 12], [36, 12.7], [42, 12.5], [48, 11.2], [53, 10.5], [58, 10]]),
        ry: profiel([[24, 8.8], [30, 9.8], [36, 10.8], [42, 10.6], [48, 8.6], [53, 7.3], [58, 6.4]]),
        cy: profiel([[24, 1.2], [30, 2.4], [37, 3.6], [44, 3.2], [50, 1.8], [58, 0.5]]),
      }
    : {
        rx: profiel([[24, 11], [30, 10.2], [38, 9.4], [46, 9.8], [52, 10.4], [58, 10]]),
        ry: profiel([[24, 8.4], [30, 7.6], [38, 6.8], [46, 7], [52, 7.2], [58, 6.4]]),
        cy: profiel([[24, 0.8], [40, 0.8], [58, 0.5]]),
      };
  delen.push(romp(kiel, 24, 58, M.kiel, D.kiel, 2));
  delen.push(ellips([0, 0.4, 57], [10.4, 6.8, 4.4], M.kiel, D.kiel, 2.5));
  // de afstand tot het bovenlijf, voor wat eromheen ligt (een omslagdoek, een manteltje)
  const bovenlijf = o.omslagdoek || o.hoed === 'kap' ? bouwSdf([romp(kiel, 24, 58, M.kiel, D.kiel, 2), ellips([0, 0.4, 57], [10.4, 6.8, 4.4], M.kiel, D.kiel, 2.5)]) : null;
  if ((o.kraag || 'doek') === 'doek') {
    // rode halsdoek met een knoop en een puntje voorop
    delen.push({
      f: (x, y, z) => Math.max(Math.abs(sdf.ellipsoide(x, y - 1.4, z - 60.4, 5.8, 5.4, 3)) - 0.9, Math.abs(z - 60.4) - 1.8),
      g: [0, 1.4, 60.4, 8],
      m: M.doek,
      deel: D.doek,
    });
    delen.push(bol([0.6, 7, 59.4], 1.6, M.doek, D.doek, 0.6));
    delen.push(kegel([0.6, 7.2, 58.8], [1.4, 8.4, 54.6], 1.8, 0.7, M.doek, D.doek));
  } else if (o.kraag === 'bont') {
    // een jas met bont: een rol om de hals, banen langs de sluiting en een zoom onderaan
    KAR.bontKraag(delen, ctx, [0, 0.2, 59.6], [8, 6.6], 2.6);
    KAR.bontBanen(delen, ctx, kiel, 37, 57, [1.4, 5]);
    KAR.bontZoom(delen, ctx, kiel, 24.6);
  }
  const band = o.riem ? KAR.riem(delen, ctx, kiel, 38) : null;
  const buidel = band && o.buidel ? KAR.buidel(delen, ctx, band, -5.6) : null;
  // de luit: de kast rechtsonder op de rug, de hals langs het linkeroor omhoog
  if (o.luit) KAR.luit(delen, ctx, { voet: [5.5, -6.4, 37.5], top: [-11, -9.8, 75], vorm: kiel, z0: 24, z1: 58, schouder: [7.4, 0, 58.6], heup: [-9.6, 0, 31] });
  // de roddelaar: een bonte omslagdoek, voorop net naast het midden geknoopt
  if (o.omslagdoek) KAR.omslagdoek(delen, ctx, bovenlijf, { zNek: 61.6, zZij: 50.5, zPunt: 40.5, knoop: [0.9, 9.6, 49.6] });
  // de nieuwkomer: de bundel op de rug, de banden over de schouders naar een knoop op de borst
  if (o.bundel) {
    KAR.bundel(delen, ctx, {
      rug: [2.4, -13, 54],
      maat: [11.2, 6.2, 9.6],
      schouders: [[-5.6, 0.2, 62.2], [5.4, 0.3, 62.3]],
      borst: [[-4.6, 7.7, 57.6], [4.4, 7.8, 57.2]],
      knoop: [0.8, 9.1, 51.4],
    });
  }
  bot(Bn.Bromp);

  // --- armen: mouwen opgestroopt. Links de hooivork, rechts hangt de arm langs het lijf.
  // (Het heethoofd, mouw 'op': tot hoog boven de elleboog, de linker nog wat hoger dan de rechter,
  // met stevige onderarmen en vuisten.)
  const op = o.mouw === 'op';
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const u = eenheid(min(El, Sch));
    if (op) {
      const rol = langs(Sch, El, dArm === D.armL ? 0.3 : 0.4);
      delen.push(kegel(Sch, rol, 3.9, 3.8, M.kiel, dArm, 1.5));
      delen.push(ring(rol, u, 3.75, 1.35, M.kiel, dArm));
      delen.push(kegel(rol, El, 3.6, 3.4, M.huid, dArm, 1));
    } else {
      delen.push(kegel(Sch, El, 3.9, 3.4, M.kiel, dArm, 1.5));
      delen.push(ring(langs(Sch, El, 0.96), u, 3.4, 1, M.kiel, dArm));
    }
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 2.8));
    delen.push(kegel(El, pols, op ? 3.5 : 3.1, op ? 2.7 : 2.4, M.huid, dArm, 1));
    delen.push(ellips(Hand, op ? [2.9, 3.1, 3.2] : [2.6, 2.8, 3.1], M.huid, dHand, 0.6));
    if (o.kraag === 'bont') KAR.bontManchet(delen, ctx, pols, eenheid(min(El, pols)), 2.9);
  };
  // Waar een arm heen gaat, en met welk bot hij beweegt: een hangende arm zwaait (Barm), een vuist
  // in de zij of een hand op de buidel blijft waar hij is en gaat met de romp mee (Bromp).
  // Ronde 2: van de nieuwe houdingen zwaaien alleen de arm met de mand en die met de stok; de rest
  // (gevouwen handen, een hand bij de mond, op de buik, aan de knoop, de kroes) gaat met de romp mee.
  // Ze staan hier voor de rechterarm, en de linker is zijn spiegelbeeld.
  const spiegel = (punten) => [punten.map(([x, y, z]) => [-x, y, z]), punten];
  const armen = {
    hangt: [[[-10, 0.3, 56], [-12.7, -0.2, 45.3], [-11.9, 2, 36.3]], [[10, 0.3, 56], [12.3, 0.4, 45.5], [11.4, 2.6, 36.2]]],
    zij: [[[-10, 0.3, 56], [-17.3, -0.8, 46.9], [-11.7, 1.2, 36.3]], [[10, 0.3, 56], [16.9, -0.4, 46.2], [11.5, 1.6, 35.8]]],
    bidt: [[[-10, 0.3, 56], [-11.2, 6.6, 46.2], [-1.4, 10.3, 47.4]], [[10, 0.3, 56], [11.5, 6.9, 45.8], [1.3, 10.4, 47.9]]],
    mond: spiegel([[10, 0.3, 56], [11.8, 8.4, 55.6], [5.4, 10.6, 63.4]]),
    hengsel: spiegel([[10, 0.3, 56], [14.3, -0.6, 45.8], [14.8, 8.6, 45.2]]),
    kroes: spiegel([[10, 0.3, 56], [15.2, 1.4, 46.4], [11.6, 10.4, 48.8]]),
    buik: spiegel([[10, 0.3, 56], [14.9, 4.6, 45.6], [8.8, 13.4, 40.6]]),
    knoop: spiegel([[10, 0.3, 56], [11.9, 6.5, 46.6], [2.6, 10.9, 50.2]]),
    stok: spiegel([[10, 0.3, 56], [13.2, 2.4, 45.6], [13.4, 9.6, 38.8]]),
  };
  const ZWAAIT = { hangt: true, hengsel: true, stok: true };
  const houd = (hoe, i) => {
    const s = i ? 1 : -1;
    const [Sch, El, Hand] = (armen[hoe] || armen.hangt)[i];
    arm(Sch, El, Hand, i ? D.armR : D.armL, i ? D.handR : D.handL);
    if (hoe === 'hengsel') KAR.hengselmand(delen, ctx, El, Hand, s);
    if (hoe === 'kroes') KAR.kroes(delen, ctx, Hand, -s);
    const B = ZWAAIT[hoe] || !armen[hoe] ? Bn.Barm[i] : Bn.Bromp;
    bot(B);
    if (hoe === 'stok') {
      // de punt als een derde voet, met de voet aan de andere kant mee (de rechtervoet heeft verzet 0,5)
      KAR.stok(delen, ctx, KAR.stokPunt([s * 14, 6.4, 0], stand, BOER_SNELHEID, BOER_FPS, i ? 0 : 0.5), HH.opPunt(B, Hand));
      bot(null);
    }
  };
  if ((o.links || 'vork') === 'vork') {
    // hooivork: de steel op de grond links voor hem, drie tanden in een vlak dat schuin staat. Hij
    // staat vast op de grond (net als het paardje van de kleuter), dus hij zwaait niet mee met de
    // arm — dat zou zijn punt los van de grond laten zwiepen; alleen de hand rust ertegen.
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
    bot(null);
    arm([-10, 0.3, 56], [-13.6, -0.6, 45.4], langs(voet, top, 0.69), D.armL, D.handL);
    bot(Bn.Barm[0]);
  } else if (o.links === 'buidel' && buidel) {
    arm([-10, 0.3, 56], [-12.6, 3.6, 45.6], plus(buidel, [-0.4, 0.6, 1.4]), D.armL, D.handL);
    bot(Bn.Bromp);
  } else houd(o.links, 0);
  houd(o.rechts || 'hangt', 1);
  // de rozenkrans hangt uit de gevouwen handen
  if (o.rozenkrans) {
    KAR.rozenkrans(delen, ctx, langs(armen.bidt[0][2], armen.bidt[1][2], 0.5));
    bot(Bn.Bromp);
  }

  // --- hoofd: lang gezicht, grote neus, flaporen; bruin haar onder de hoed uit
  const oy = schedel(delen, H, M, D, { maat: [6.7, 6.7, 7.8], oog: [2.6, 0.8], oor: 1 });
  delen.push(ellips(plus(H, [0, 6.9, -1.4]), [1.7, 2.4, 2.6], M.huid, D.hoofd, 1));
  // (de drinker: een dikke knol van een neus, en rood, zie rodeNeus hierboven)
  if (o.neus === 'rood') delen.push(bol(plus(H, [0, 8.5, -3]), 2.35, M.huid, D.hoofd, 1));
  else delen.push(bol(plus(H, [0, 8.2, -2.8]), 1.7, M.huid, D.hoofd, 1));
  if (o.boos) {
    KAR.bozeWenkbrauwen(delen, H, [2.6, 0.8], oy, M.haar, D.hoofd);
    KAR.bozeMond(delen, H, [6.7, 6.7, 7.8], KAR.materiaal(ctx, 'mond', KAR.MOND), D.hoofd, 1.6, -5.5);
  } else for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.6]), [2.1, 1, 0.9], M.haar, D.hoofd, 0.4));
  delen.push(ellips(plus(H, [0, -2, 0.4]), [7.1, 6.1, 6.8], M.haar, D.hoofd, 1));
  // strootje in de rechtermondhoek
  if (o.strootje !== false) delen.push(capsule(plus(H, [1.4, 5.8, -4.3]), plus(H, [8.6, 8.4, -0.8]), 0.5, M.strootje, D.hoofd));
  const hoed = o.hoed || 'stro';
  if (hoed === 'stro') {
    // strohoed: brede rand, voorop opgewipt zodat de ogen vrij blijven; een bol met een lint
    const eerst = delen.length;
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
    // (de drinker, hoedScheef: graden dat de hoed naar één kant is gezakt)
    if (o.hoedScheef) {
      const B = HH.beweging({ as: [0, 1, 0], graden: o.hoedScheef, om: plus(H, [0, -1, 5]) });
      for (let i = eerst; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    }
  } else if (hoed === 'muts') KAR.bonteMuts(delen, ctx, H, [6.7, 6.7], { zij: -1 });
  else if (hoed === 'vilt') KAR.vilthoed(delen, ctx, H);
  else if (hoed === 'geen') KAR.piekhaar(delen, H, M.haar, D.hoofd);
  else if (hoed === 'kap') KAR.kaproen(delen, ctx, H, [6.7, 6.7, 7.8], bovenlijf);
  else if (hoed === 'vreemd') KAR.baret(delen, ctx, H, [6.7, 6.7, 7.8]);
  else if (hoed === 'bloot') {
    // geen hoed: kaal op de kruin, en een krans haar die boven de oren wat uitstaat
    delen.push(ellips(plus(H, [-6.4, -1.3, 1.8]), [1.9, 3.3, 2.7], M.haar, D.hoofd, 0.8));
    delen.push(ellips(plus(H, [6.3, -1.6, 1.5]), [1.8, 3.4, 2.5], M.haar, D.hoofd, 0.8));
  }
  if (o.baard) KAR.baard(delen, H, [6.7, 6.7, 7.8], M.haar, D.hoofd, 12);
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 2, 43], straal: 50 });
}

const DORPSOUDSTE_SNELHEID = 1;
// fps blijft 10 (zie SMID_FPS): dat getal stuurt de aslengte van de pas in houdingDorpeling
// (T = 8/fps) en moet gelijk zijn aan de vaste 10 waarmee dorpelingen-anim.cjs "stap" (tegels per
// pas) uitrekent (HOUDINGEN, hieronder), anders passen loopbeeld en werkelijke afstand niet meer
// bij elkaar en gaat de voet toch een beetje glijden. Trager lopen komt alleen van een lagere
// snelheid, nooit van een andere fps hier.
const DORPSOUDSTE_FPS = 10;

// ---------------------------------------------------------------- de dorpsoudste

// De dorpsoudste: een krom oud vrouwtje met wit haar in een knotje, een paarse omslagdoek met
// een gouden speld, en een wandelstok. De oudste van het dorp, en toch jonger dan de tovenaar.
// stand: zie smid() hierboven. Ze is oud en loopt trager (DORPSOUDSTE_SNELHEID); geen been
// getekend, net als de herbergierster, dus de rok zwaait zelf mee (Bn.Brok).
function dorpsoudste(stand = null) {
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
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const hg = houdingDorpeling(stand, { snelheid: DORPSOUDSTE_SNELHEID, fps: DORPSOUDSTE_FPS, beenLengte: 24 });
  const Bn = bottenDorpeling(hg, {
    heup: [0, 1.5, 36.5],
    nek: [0, 3, 56.5],
    schouders: [[-9.6, 3.8, 53.5], [9.6, 3.8, 53.5]],
  });

  // --- lange rok, een krom lijf: de rug rond, de schouders en het hoofd naar voren
  const rok = {
    rx: (z) => mix(13.6, 9.8, Math.pow(klem(z / 36.5, 0, 1), 0.8)),
    ry: (z) => mix(12.2, 7.9, Math.pow(klem(z / 36.5, 0, 1), 0.9)),
    cy: (z) => mix(1.2, 1.9, klem(z / 36.5, 0, 1)),
  };
  delen.push(klokrok(36.5, [13.6, 9.8], [12.2, 7.9], (t) => mix(1.2, 1.9, t), M.rok, D.rok, 0.8));
  bot(Bn.Brok);
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
  bot(Bn.Bromp);

  // --- armen in donkere mouwen: rechts op de stok, links houdt de doek bij de speld dicht
  const arm = (Sch, El, Hand, dArm, dHand) => {
    const pols = plus(Hand, maal(eenheid(min(El, Hand)), 2.6));
    delen.push(kegel(Sch, El, 3.6, 3.2, M.jurk, dArm, 1.5));
    delen.push(kegel(El, pols, 3.2, 2.6, M.jurk, dArm, 1));
    delen.push(ellips(Hand, [2.5, 2.7, 2.9], M.huid, dHand, 0.6));
  };
  // wandelstok met een gebogen handvat: staat vast op de grond (net als de hooivork van de boer),
  // dus hij zwaait niet mee met de arm — alleen de hand rust op de kromming.
  const stokOnder = [10.4, 13.2, 0.5];
  const stokBoven = [9.8, 12.2, 42];
  delen.push(kegel(stokOnder, stokBoven, 1, 1.15, M.hout, D.stok));
  delen.push(...bochtKegel(stokBoven, plus(stokBoven, [0, 0.4, 3.6]), plus(stokBoven, [0, 3.8, 3]), 1.15, 1.05, 4, M.hout, D.stok, 0.5));
  delen.push(...bochtKegel(plus(stokBoven, [0, 3.8, 3]), plus(stokBoven, [0, 5.4, 2.4]), plus(stokBoven, [0, 5.2, 0.2]), 1.05, 0.95, 3, M.hout, D.stok, 0.5));
  bot(null);
  arm([9.6, 3.8, 53.5], [12.6, 5.6, 46.5], plus(stokBoven, [0, 1.2, 3.4]), D.armR, D.handR);
  bot(Bn.Barm[1]);
  arm([-9.6, 3.8, 53.5], [-11.6, 6.8, 46], plus(speld, [-3.2, 0.6, -0.8]), D.armL, D.handL);
  bot(Bn.Barm[0]);

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
  bot(Bn.Bnek);

  return model(delen, mat, hg ? HH.omvat(delen, 2) : { midden: [0, 3, 38], straal: 46 });
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

module.exports = {
  smid, herbergierster, boer, dorpsoudste, DORPELINGEN, profiel, grensbol, romp, schil, klokrok, blokGedraaid, schedel, glimlach,
  rustDorpeling, houdingDorpeling, bottenDorpeling, knieTussen, beenPunten, voetBot, SMID_SNELHEID, SMID_FPS,
  HERBERGIERSTER_SNELHEID, HERBERGIERSTER_FPS, BOER_SNELHEID, BOER_FPS, DORPSOUDSTE_SNELHEID, DORPSOUDSTE_FPS,
};
