// De boer en de boerin aan het werk op hun veld (werklijst vraag 111, b; Marcel 3 okt: "ja die zijn goed", 5 okt: de
// figuren nu, en "a ja b ja c nu"): werkfiguren uit code, op dezelfde manier gemaakt als de maaier (maaier.cjs). Het is
// de gewone boer met strohoed en kiel uit dorpelingen.cjs, of de gewone boerin met haar witte hoofddoek, terracotta jurk
// en blauwe schort uit dorpelingen2.cjs, met eigen gereedschap en een eigen houding voor het werk. Het spel laat een boer
// zo'n vel lenen zolang hij dat werk doet, ook als hij naar de volgende tegel loopt of even rust (js/sprites.js,
// figuurNu, zoals bij de maaier). Daarom heeft elk ook staan en lopen, en is het overal dezelfde man of vrouw. Een
// boerin heeft haar eigen vel, met dezelfde houdingen, beelden en fps als dat van de man, zodat het spel alleen de naam
// hoeft te wisselen (b: tot 5 okt droeg een boerin het vel van een man).
//
//   zaaier       zaaien: breedwerpig, de rechtervuist uit de zak in een wijde boog naar rechts voor hem uit, waar de
//   zaaister     vingers opengaan en een waaiertje zaad even het licht vangt; de voeten blijven staan. staan: de vuist
//                in de zak. lopen: de zak op de heup, de rechterarm zwaait gewoon mee.
//   wieder       wieden: voorover gebukt, de schoffel (een plat, breed blad aan een zwanenhals) hakt voor zijn voeten in
//   wiedster     de grond en trekt naar hem toe (het spel gebruikt het ook voor spitten en mest uitspreiden, dus het
//                leest als de grond omwerken). staan: leunend op de schoffel, zijn rustpoos tussen twee tegels. lopen:
//                de schoffel over de schouder.
//   sprokkelaar  een takkenbos met een touw erom op zijn rug, aan twee banden zoals het rek van de marskramer
//   sprok-       (dorpelingen3.cjs). staan, lopen (de bundel deint mee), en rapen: door de knieën tot hij hurkt, een
//   kelaarster   tak oprapen, en hem over de schouder in de bundel steken, waar hij blijft.
//   maaister     maaien, met de zeis en de slag van de maaier (maaier.cjs, die zelf blijft zoals hij is).
//   hakker       de bijl (vraag 107, f): een steel van essenhout van een kleine meter met een ijzeren kop, een wig met de
//   hakster      snede naar voren, een korte nek en een licht randje aan de snede. hakken: met twee handen over de
//                rechterschouder omhoog, en van rechtsboven schuin naar beneden en naar voren tot de snede op
//                kniehoogte in de stam slaat, een tegel voor hem; even stil, losgewrikt, en langs zijn rechterzij terug
//                omhoog. Het lijf draait mee en gaat bij de inslag door de knieën. Dezelfde slag hakt de wortels van een
//                stronk los, en straks hakt de houthakker er zo mee (vraag 115). staan: de bijl met de kop op de grond
//                naast zijn rechtervoet, zijn hand op de knop. lopen: de bijl over de rechterschouder.
//
// Dit bestand verandert niets aan dorpelingen.cjs, dorpelingen2.cjs, maaier.cjs of karakters.cjs: het gebruikt alleen
// wat die exporteren. Het lijf van de boer (werkBoer) is dat van boer() en maaier(): dezelfde benen met knieën, kiel en
// halsdoek, hetzelfde hoofd met strootje en strohoed. Dat van de boerin (werkBoerin) is dat van boerin() zonder mandje:
// haar rok zwaait mee zoals in haar loopcyclus (rokZwaai), het schort ligt op de rok, en als ze door de knieën gaat,
// zakt de rok mee en bolt hij over haar knieën. Staan en lopen zijn de houdingen van de boer of de boerin zelf
// (houdingDorpeling, met hun eigen snelheid en fps, dus dezelfde pas en dezelfde `stap`). Het werk heeft een eigen
// houding in dezelfde vorm (zak, zij, voor, romp, nek, voet), zoals houdingMaaier, uit sleutelbeelden (langsSleutels).
// Een arm die iets vasthoudt, krijgt zijn elleboog met dezelfde IK als de maaier (HH.elleboog); een hand die opengaat,
// krijgt vingers (hand). Hun armen zijn kort: een hand ligt nooit verder van de schouder dan de arm lang is, anders rekt
// de onderarm uit. De sleutels zijn voor de boer gemaakt; de boerin heeft lagere schouders, een hogere heup en kortere
// armen, en haar handen volgen dezelfde weg vanuit haar eigen schouders (naarLijf).
// Lokale assen zoals overal: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// Wegschrijven: node gereedschap/pixelart/werkfiguren-anim.cjs [zaaier wieder sprokkelaar hakker zaaister wiedster
// sprokkelaarster maaister hakster].
'use strict';
const { sdf, bouwSdf, klem, mix, rnd } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus } = require('./figuren.cjs');
const { ring } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const KAR = require('./karakters.cjs');
const UI = require('./uiterlijk.cjs'); // het uiterlijk van wie het werk doet (vraag 145)
const {
  profiel, schedel, romp, schil, glimlach, bottenDorpeling, beenPunten, voetBot, knieTussen, houdingDorpeling,
  rustDorpeling, BOER_SNELHEID, BOER_FPS,
  hoofdVanDeBoer,
  overDeKiel,
} = require('./dorpelingen.cjs');
const { arm: mouwArm, blosjes, hoofddoek, haarKap, middelband, hoofdVanDeBoerin, mand: rietMand, rietPatroon, BOERIN_SNELHEID, BOERIN_FPS } = require('./dorpelingen2.cjs');
const { zeisDelen, zeisInDeHanden, houdingMaaier, MAAIER_BEELDEN, MAAIER_FPS } = require('./maaier.cjs');

// hetzelfde oogmateriaal als dorpelingen.cjs en maaier.cjs (daar niet geëxporteerd, dus hier één regel gelijk)
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };

// ---------------------------------------------------------------- de lijven

// De punten van het lijf van boer() (dorpelingen.cjs).
const H = [0, 4, 68.5]; // het midden van het hoofd
const HEUP = [0, 0.3, 30];
const NEK = [0, 0, 59];
const SCHOUDERS = [[-10, 0.3, 56], [10, 0.3, 56]];
// De hangende arm van boer() ('hangt'): schouder, elleboog, hand, links en rechts. Een arm die ergens anders heen moet,
// haalt hier zijn botlengtes en de kant waar zijn elleboog uitsteekt (zie arm hieronder).
const HANGT = [
  [[-10, 0.3, 56], [-12.7, -0.2, 45.3], [-11.9, 2, 36.3]],
  [[10, 0.3, 56], [12.3, 0.4, 45.5], [11.4, 2.6, 36.2]],
];
// Per lijf: zijn punten, zijn hangende armen, zijn vuist, en de pas van zijn staan en lopen. De boerin zoals boerin()
// (dorpelingen2.cjs) haar bouwt, zonder mandje: de armen 'hangt'. Haar benen tekent niemand (de rok dekt ze), maar ze
// heeft ze wel: waar haar knieën zitten als ze hurkt, zegt BENEN.
const BOER = { naam: 'boer', H, HEUP, NEK, SCHOUDERS, HANGT, vuist: [2.6, 2.8, 3.1], handMaat: 1, snelheid: BOER_SNELHEID, fps: BOER_FPS, beenLengte: 24 };
const BOERIN = {
  naam: 'boerin',
  H: [0, 3.4, 66.5],
  HEUP: [0, 0.6, 36],
  NEK: [0, 0, 56.6],
  SCHOUDERS: [[-10.6, 0.4, 53.6], [10.6, 0.4, 53.6]],
  HANGT: [
    [[-10.6, 0.4, 53.6], [-12.9, 1.1, 44.2], [-12.4, 2.9, 35.5]],
    [[10.6, 0.4, 53.6], [12.7, 1.6, 44.3], [12.2, 3.4, 35.7]],
  ],
  BENEN: { heup: 4.6, heupZ: 36, enkel: [4.4, 1.4, 6] },
  vuist: [2.5, 2.7, 2.9],
  handMaat: 0.94,
  snelheid: BOERIN_SNELHEID,
  fps: BOERIN_FPS,
  beenLengte: 27,
};
const LIJVEN = { boer: BOER, boerin: BOERIN };
const armLengte = (L, i) => HH.lengte(HH.af(L.HANGT[i][1], L.HANGT[i][0])) + HH.lengte(HH.af(L.HANGT[i][2], L.HANGT[i][1]));
const botten = (L, hg) => bottenDorpeling(hg, { heup: L.HEUP, nek: L.NEK, schouders: L.SCHOUDERS });
// Een plek die voor de hand van de boer gemaakt is, voor de hand van lijf L: even ver vanuit zijn schouder, naar de
// lengte van zijn arm. Sb en Sl zijn de schouders van de boer en van L (standaard in rust); voor de boer zelf verandert
// er niets.
function naarLijf(L, i, p, Sb = SCHOUDERS[i], Sl = L.SCHOUDERS[i]) {
  if (L === BOER) return p;
  return HH.plus(Sl, HH.keer(HH.af(p, Sb), armLengte(L, i) / armLengte(BOER, i)));
}

// Staan en lopen gaan zoals bij de boer of de boerin zelf: dezelfde snelheid en fps, dus dezelfde pas (dorpelingen-anim.cjs
// rekent er `stap` mee uit, en werkfiguren-anim.cjs net zo).
const SNELHEID = BOER_SNELHEID;
const LOOP_FPS = BOER_FPS;
const gewoon = (stand, L = BOER) => houdingDorpeling(stand, { snelheid: L.snelheid, fps: L.fps, beenLengte: L.beenLengte });

// Per figuur zijn houdingen, allemaal een lus: hoeveel beelden en hoe snel. Staan en lopen zoals in
// dorpelingen-anim.cjs (vier beelden op 4, acht op 10); het werk zoals de maaier (twaalf op 8), en het rapen zestien,
// want bukken, rapen en de tak wegsteken is een langere beweging. Een vrouw heeft precies wat haar man heeft.
const HOUDINGEN = {
  zaaier: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, zaaien: { beelden: 12, fps: 8 } },
  wieder: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, wieden: { beelden: 12, fps: 8 } },
  sprokkelaar: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, rapen: { beelden: 16, fps: 8 } },
  hakker: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, hakken: { beelden: 12, fps: 8 } },
};
HOUDINGEN.plukker = { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, plukken: { beelden: 12, fps: 8 } };
HOUDINGEN.binder = { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, binden: { beelden: 12, fps: 8 } };
HOUDINGEN.drager = { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS } };
HOUDINGEN.dorser = { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, dorsen: { beelden: 12, fps: 10 } };
HOUDINGEN.plukster = HOUDINGEN.plukker;
HOUDINGEN.binster = HOUDINGEN.binder;
HOUDINGEN.draagster = HOUDINGEN.drager;
HOUDINGEN.dorster = HOUDINGEN.dorser;
HOUDINGEN.zaaister = HOUDINGEN.zaaier;
HOUDINGEN.wiedster = HOUDINGEN.wieder;
HOUDINGEN.sprokkelaarster = HOUDINGEN.sprokkelaar;
HOUDINGEN.maaister = { maaien: { beelden: MAAIER_BEELDEN, fps: MAAIER_FPS } };
HOUDINGEN.hakster = HOUDINGEN.hakker;
// welk lijf elke figuur heeft, en dus hoe snel hij loopt
const LIJF_VAN = {
  zaaier: 'boer', wieder: 'boer', sprokkelaar: 'boer', hakker: 'boer',
  zaaister: 'boerin', wiedster: 'boerin', sprokkelaarster: 'boerin', maaister: 'boerin', hakster: 'boerin',
  plukker: 'boer', binder: 'boer', drager: 'boer', dorser: 'boer',
  plukster: 'boerin', binster: 'boerin', draagster: 'boerin', dorster: 'boerin',
};
const snelheidVan = (naam) => LIJVEN[LIJF_VAN[naam]].snelheid;

// ---------------------------------------------------------------- hulpjes

// Een waarde op fase t langs sleutels [[fase, waarde], ...] die rond lopen (na de laatste komt de eerste weer, een
// fase verder), vloeiend door elk punt: Hermite met de helling uit de twee buren, zoals Catmull-Rom. Een waarde is
// een getal of een punt [x, y, z]. Zo gaat een hand in een boog door de punten die je opgeeft, zonder hoeken.
function langsSleutels(sleutels, t) {
  const n = sleutels.length;
  t -= Math.floor(t);
  let i = -1;
  for (let k = 0; k < n; k++) if (sleutels[k][0] <= t) i = k;
  const tijd = (k) => sleutels[((k % n) + n) % n][0] + Math.floor(k / n);
  const waarde = (k) => sleutels[((k % n) + n) % n][1];
  const [t0, t1, t2, t3] = [tijd(i - 1), tijd(i), tijd(i + 1), tijd(i + 2)];
  const [p0, p1, p2, p3] = [waarde(i - 1), waarde(i), waarde(i + 1), waarde(i + 2)];
  const h = t2 - t1;
  const s = (t - t1) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  const a = 2 * s3 - 3 * s2 + 1;
  const b = s3 - 2 * s2 + s;
  const c = -2 * s3 + 3 * s2;
  const d = s3 - s2;
  const een = (q0, q1, q2, q3) => a * q1 + b * ((q2 - q0) / (t2 - t0)) * h + c * q2 + d * ((q3 - q1) / (t3 - t1)) * h;
  return Array.isArray(p1) ? p1.map((_, j) => een(p0[j], p1[j], p2[j], p3[j])) : een(p0, p1, p2, p3);
}
// Hetzelfde, maar zacht van sleutel naar sleutel (zonder doorschieten): voor wat tussen twee grenzen moet blijven,
// zoals hoe ver een hand open is.
function stapsgewijs(sleutels, t) {
  const n = sleutels.length;
  t -= Math.floor(t);
  let i = -1;
  for (let k = 0; k < n; k++) if (sleutels[k][0] <= t) i = k;
  const van = sleutels[(i + n) % n];
  const naar = sleutels[(i + 1) % n];
  const t1 = i < 0 ? van[0] - 1 : van[0];
  const t2 = i + 1 >= n ? naar[0] + 1 : naar[0];
  return van[1] + (naar[1] - van[1]) * HH.soepel((t - t1) / (t2 - t1));
}

// Een ellipsoïde met eigen assen u, v, w (eenheidsvectoren, loodrecht op elkaar) en halve maten s langs die assen.
function ellipsLangs(c, [u, v, w], s, m, deel, k) {
  return {
    f: (x, y, z) => {
      const p = [x - c[0], y - c[1], z - c[2]];
      return sdf.ellipsoide(HH.inwendig(p, u), HH.inwendig(p, v), HH.inwendig(p, w), s[0], s[1], s[2]);
    },
    g: [c[0], c[1], c[2], Math.max(...s) + 0.5],
    m,
    deel,
    k,
  };
}
// Een trapezium van plaat met eigen assen, zoals het blad van de schoffel: de onderrand heeft zijn midden op s, de plaat
// gaat langs q omhoog (hoog), is langs e onderaan `onder` en bovenaan `boven` breed (de helft) en langs n `dik` (de helft).
// Ronde hoeken r.
function trapezium(s, [e, q, n], { onder, boven, hoog, dik }, r, m, deel) {
  const helling = (onder - boven) / hoog;
  const schaal = 1 / Math.hypot(1, helling); // de schuine zijden: afstand loodrecht erop
  return {
    f: (x, y, z) => {
      const p = [x - s[0], y - s[1], z - s[2]];
      const a = Math.abs(HH.inwendig(p, e));
      const b = HH.inwendig(p, q);
      const c = Math.abs(HH.inwendig(p, n));
      const breed = onder - helling * klem(b, 0, hoog);
      const qx = (a - breed) * (a > breed ? schaal : 1) + r;
      const qy = Math.abs(b - hoog / 2) - hoog / 2 + r;
      const qz = c - dik + Math.min(r, dik * 0.9);
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
    },
    g: [...HH.plus(s, HH.keer(q, hoog / 2)), Math.hypot(onder, hoog / 2) + 1],
    m,
    deel,
  };
}
// Twee assen loodrecht op u: de eerste waterpas (dwars), de tweede erbij.
function dwarsOp(u) {
  const v0 = HH.kruis(u, [0, 0, 1]);
  const v = HH.lengte(v0) < 1e-3 ? [1, 0, 0] : HH.eenheid(v0);
  return [v, HH.kruis(v, u)];
}
// Het hout en het ijzer van het gereedschap, voor beide lijven gelijk.
const HOUT = { ramp: 'hout', lo: 1.6, hi: 6, patroon: (x, y, z) => (Math.sin(z * 1.3 + x * 0.7) > 0.86 ? -0.6 : 0) };
const IJZER = { ramp: 'ijzer', lo: 1.8, hi: 6.2, glans: 1.2, detail: true };

// ---------------------------------------------------------------- het lijf van de boer

// Het uiterlijk van wie het werk doet (vraag 145; uiterlijk.cjs): de opties van boer() of boerin() voor zijn kleren, zijn
// haar, zijn hoofd en wat hij bij zich heeft, zodat wie aan het werk gaat, dezelfde man of vrouw blijft. Het geldt zolang
// metUiterlijk(o, maak) loopt (het renderen is één doorgaande stap): zo hoeft niet elke werkfiguur het door te geven.
let UITERLIJK = {};
function metUiterlijk(o, maak) {
  const oud = UITERLIJK;
  UITERLIJK = o || {};
  try {
    return maak();
  } finally {
    UITERLIJK = oud;
  }
}

// De gewone boer, zoals boer() en maaier() hem bouwen: benen met knieën en klompen, de kiel met de rode halsdoek, en
// het hoofd met strootje en strohoed, in de houding hg (de vorm van houdingDorpeling). bouw(ctx) zet ertussen wat
// deze figuur anders heeft: wat hij op zijn romp draagt, zijn armen en zijn gereedschap. Het zet elk stuk zelf op zijn
// bot (ctx.bot), net als boer() dat doet: Bn.Bromp gaat met de romp mee, Bn.Barm[i] zwaait met een hangende arm, en
// null laat staan wat al in de wereld getekend is (een schoffel op de grond).
function werkBoer(hg, bouw) {
  const M = { huid: 0, kiel: 1, broek: 2, klomp: 3, haar: 4, oog: 5, stro: 6, lint: 7, doek: 8, hout: 9, ijzer: 10, strootje: 11 };
  const D = { benen: 1, kiel: 2, armL: 3, armR: 4, handL: 5, handR: 6, hoofd: 7, hoed: 8, doek: 9 };
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.9, hi: 6.4, schaduwKracht: 0.85 };
  const o = UITERLIJK;
  mat[M.kiel] = o.kiel || { ramp: 'pet', lo: 1.4, hi: 6.2, patroon: (x, y, z) => (Math.sin(x * 1.3 + 0.4) > 0.82 && z < 50 ? -0.7 : 0) };
  mat[M.broek] = o.broek || { ramp: 'aarde', lo: 0.8, hi: 4.6 };
  mat[M.klomp] = o.klomp || { ramp: 'zand', lo: 3, hi: 7.4 };
  mat[M.haar] = o.haar || { ramp: 'schors', lo: 0.8, hi: 4.4 };
  if (o.baard === 'stoppels') mat[M.huid].patroon = UI.stoppels(H, [6.7, 6.7, 7.8]);
  mat[M.oog] = OOG;
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.2,
    patroon: (x, y, z) => {
      const r = Math.hypot(x - H[0], y - H[1]);
      const s = z > H[2] + 7.2 ? Math.sin(z * 2.4) : Math.sin(r * 2.2);
      return s > 0.55 ? 0.6 : s < -0.7 ? -0.6 : 0;
    },
  };
  mat[M.lint] = { ramp: 'schors', lo: 0.6, hi: 3 };
  mat[M.doek] = o.halsdoek || { ramp: 'rood', lo: 2, hi: 6.4 };
  mat[M.hout] = HOUT;
  mat[M.ijzer] = IJZER;
  mat[M.strootje] = { ramp: 'stro', lo: 4.2, hi: 6.6 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const Bn = botten(BOER, hg);
  const ctx = { M, D, mat, delen, hg, Bn, bot, knie: [], lijf: BOER };

  // --- benen en klompen: zelfde punten als boer() en maaier(). Wie hurkt, zet zijn knieën wat uit elkaar (hg.knieUit,
  // alleen in het werk); ctx.knie onthoudt waar ze zijn, voor een hand die erop steunt.
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const heupR = [s * 4.4, 0, 30];
    const enkelR = [s * 4.3, 0.8, 7];
    const knieR = HH.plus(knieTussen(heupR, enkelR), [s * (hg.knieUit || 0), 0, 0]);
    const P = beenPunten(hg, i, { heup: heupR, knie: knieR, enkel: enkelR });
    ctx.knie[i] = P.knie;
    delen.push(kegel(P.heup, P.knie, 3.9, 3.65, M.broek, D.benen, 1));
    delen.push(kegel(P.knie, P.enkel, 3.65, 3.4, M.broek, D.benen, 1));
    bot(null);
    delen.push(ellips([s * 4.4, 2.6, 3], [3.5, 6.6, 3.2], M.klomp, D.benen, 1));
    delen.push(bol([s * 4.4, 8.4, 3.9], 1.7, M.klomp, D.benen, 1.8));
    bot(voetBot(hg, i, [s * 4.4, 2.2, 0]));
  }

  // --- kiel: los en wijd, tot halverwege de dij; schouders erop; de rode halsdoek met zijn knoop
  const kiel = {
    rx: profiel([[24, 11], [30, 10.2], [38, 9.4], [46, 9.8], [52, 10.4], [58, 10]]),
    ry: profiel([[24, 8.4], [30, 7.6], [38, 6.8], [46, 7], [52, 7.2], [58, 6.4]]),
    cy: profiel([[24, 0.8], [40, 0.8], [58, 0.5]]),
  };
  delen.push(romp(kiel, 24, 58, M.kiel, D.kiel, 2));
  delen.push(ellips([0, 0.4, 57], [10.4, 6.8, 4.4], M.kiel, D.kiel, 2.5));
  if ((o.kraag || 'doek') === 'doek') {
    delen.push({
      f: (x, y, z) => Math.max(Math.abs(sdf.ellipsoide(x, y - 1.4, z - 60.4, 5.8, 5.4, 3)) - 0.9, Math.abs(z - 60.4) - 1.8),
      g: [0, 1.4, 60.4, 8],
      m: M.doek,
      deel: D.doek,
    });
    delen.push(bol([0.6, 7, 59.4], 1.6, M.doek, D.doek, 0.6));
    delen.push(kegel([0.6, 7.2, 58.8], [1.4, 8.4, 54.6], 1.8, 0.7, M.doek, D.doek));
  }
  overDeKiel(delen, ctx, kiel, o); // een vest, een riem met buidel en mes, een tas (vraag 145)
  bot(Bn.Bromp);

  bouw(ctx);
  bot(null);

  // --- hoofd: lang gezicht, strootje, strohoed, of het hoofd van zijn uiterlijk (hoofdVanDeBoer in dorpelingen.cjs)
  hoofdVanDeBoer(delen, ctx, H, o);
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

// ---------------------------------------------------------------- het lijf van de boerin

// Het lijf van de boerin, zoals boerin() het bouwt (dorpelingen2.cjs, vrouwenlijf), met het bovenlijf een eind dieper in
// de rok: als ze voorover buigt, draait het om haar heup, en dan zou er anders achter tussen lijf en rok een kier komen.
// Zolang ze rechtop staat, zit dat stuk in de rok en zie je het niet.
const LIJF_BOERIN = {
  rx: profiel([[30, 10.2], [35, 10.2], [41, 10.8], [47, 11.2], [52, 11], [56, 9.6]]),
  ry: profiel([[30, 8], [35, 8], [41, 8.2], [47, 8], [52, 7.2], [56, 6]]),
  cy: profiel([[30, 1.2], [35, 1.2], [42, 1.6], [56, 0.6]]),
};
// De rok van de boerin in houding hg: de klokrok van boerin(), van de grond tot haar middel. Gaat ze door de knieën
// (hg.hurkt, bij het rapen), dan zakt haar middel mee en wat naar achteren, spreidt de zoom zich over de grond, en bolt de
// voorkant op waar haar knieën onder de rok zitten. Rechtop is het precies de rok van boerin(). Geeft het profiel per
// hoogte: als functies van t (0 de zoom, 1 het middel) voor de rok, en van z (vorm) voor het schort, zoals schil() het
// vraagt.
const HURK = 20; // zo diep (zak) zit de rok het laagst en het wijdst
function rokProfiel(hg) {
  const zak = hg.hurkt ? Math.max(0, hg.zak) : 0;
  const voor = hg.hurkt ? hg.voor : 0;
  const s = klem(zak / HURK, 0, 1);
  const top = 37 - zak;
  const knie = (t) => 3 * s * Math.pow(Math.sin(Math.PI * klem(t, 0, 1)), 1.3);
  const rx = (t) => mix(15.6 + 3.4 * s, 10.6 + 1.6 * s, Math.pow(t, 0.8));
  const ry = (t) => mix(13.4 + 3 * s, 8.8 + 1 * s, Math.pow(t, 0.9)) + knie(t);
  const cy = (t) => mix(0.8 + 1.4 * s, 0.8 + voor, t) + knie(t);
  const opZ = (f) => (z) => f(klem(z / top, 0, 1));
  return { top, rx, ry, cy, vorm: { rx: opZ(rx), ry: opZ(ry), cy: opZ(cy) } };
}
// de rok zelf: klokrok() uit dorpelingen.cjs, met een profiel dat per houding anders kan zijn
function rokDeel({ top, rx, ry, cy }, m, deel, plooi = 1) {
  return {
    f: (x, y, z) => {
      const t = klem(z / top, 0, 1);
      const a = rx(t);
      const b = ry(t);
      const ex = x / a;
      const ey = (y - cy(t)) / b;
      const th = Math.atan2(ey, ex);
      const p = plooi * (0.055 * Math.sin(th * 9 + 1.3) + 0.03 * Math.sin(th * 5 - 0.4)) * (1 - t * 0.85);
      return Math.max((Math.hypot(ex, ey) - 1 - p) * Math.min(a, b) * 0.86, -z, z - top);
    },
    g: [0, 1, top / 2, Math.hypot(top / 2, rx(0), ry(0.5) + Math.abs(cy(0.5)) + 1) + 3],
    m,
    deel,
  };
}
// De gewone boerin aan het werk: de rok met het schort erop (die zwaaien samen mee als ze loopt, Brok zonder het naar
// voren gaan, dat zit in het profiel), het bovenlijf met de schortband (met de romp mee), en het hoofd met de witte doek,
// onder de kin geknoopt. bouw(ctx) zet ertussen wat deze figuur draagt en doet, zoals bij werkBoer. ctx.knie zijn haar
// knieën onder de rok, voor een hand die erop steunt.
function werkBoerin(hg, bouw) {
  const L = BOERIN;
  const HB = L.H;
  const maat = [7, 6.8, 7.3];
  const M = { huid: 0, jurk: 1, schort: 2, doek: 3, haar: 4, oog: 5, mond: 6, hout: 7, ijzer: 8 };
  const D = { rok: 1, lijf: 2, schort: 3, armL: 4, armR: 5, handL: 6, handR: 7, hoofd: 8, doek: 9 };
  const mat = [];
  mat[M.huid] = { ramp: 'huid', lo: 1.8, hi: 6.6, schaduwKracht: 0.7, patroon: blosjes(3.7, HB[2] - 2.6, HB[1] + 3, 1.8, 6.6, 1.1) };
  const o = UITERLIJK;
  mat[M.jurk] = o.jurk || { ramp: 'dak', lo: 1, hi: 5.6 };
  mat[M.schort] = o.schort || { ramp: 'pet', lo: 1.2, hi: 5.4, patroon: (x) => (Math.sin(x * 1.1 + 0.6) > 0.8 ? -0.6 : 0) };
  mat[M.doek] = o.doek || { ramp: 'pleister', lo: 2.2, hi: 6.4, patroon: (x, y, z) => (Math.sin(x * 1.2 - z * 0.8) > 0.8 ? -0.6 : 0) };
  mat[M.haar] = o.haar || { ramp: 'aarde', lo: 1, hi: 4.6 };
  mat[M.oog] = OOG;
  mat[M.mond] = KAR.MOND;
  mat[M.hout] = HOUT;
  mat[M.ijzer] = IJZER;

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const Bn = botten(L, hg);
  const ctx = { M, D, mat, delen, hg, Bn, bot, knie: [], lijf: L };

  // --- haar knieën (niet getekend): het been van heup tot enkel, met de knie zoals bij de boer
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1;
    const heupR = [s * L.BENEN.heup, L.HEUP[1], L.BENEN.heupZ];
    const enkelR = [s * L.BENEN.enkel[0], L.BENEN.enkel[1], L.BENEN.enkel[2]];
    const knieR = HH.plus(knieTussen(heupR, enkelR), [s * (hg.knieUit || 0), 0, 0]);
    ctx.knie[i] = beenPunten(hg, i, { heup: heupR, knie: knieR, enkel: enkelR }).knie;
  }

  // --- de rok en het schort erop
  const rok = rokProfiel(hg);
  delen.push(rokDeel(rok, M.jurk, D.rok));
  if (o.schort !== false) delen.push(schil(rok.vorm, { los: 1.2, d: 0.6, breed: (z) => mix(9.4, 7.4, z / rok.top), z0: (5 * rok.top) / 37, z1: rok.top - 0.5 }, M.schort, D.schort));
  bot(HH.beweging({ dp: [hg.rokZwaai, 0, 0] }));
  // --- het bovenlijf, de boezem en de schouders (in een rijglijf als haar uiterlijk er een heeft), en de schortband
  const mLijf = o.lijfje ? KAR.materiaal(ctx, 'lijfje', UI.rijglijf(o.lijfje, UI.STOF.linnen)) : M.jurk;
  const bovenlijf = [romp(LIJF_BOERIN, 30, 56, mLijf, D.lijf, 2), ellips([0, 4, 48.5], [9, 5.6, 4.4], mLijf, D.lijf, 2.5), ellips([0, 0.4, 55], [10.8, 7, 4.2], mLijf, D.lijf, 2.5)];
  delen.push(...bovenlijf);
  if (o.schort !== false) middelband(delen, LIJF_BOERIN, 36.4, M.schort, D.schort);
  // wat ze erover draagt (vraag 145): een omslagdoek, een riem met een buidel en een mes, zoals boerin()
  if (o.omslagdoek) KAR.omslagdoek(delen, ctx, bouwSdf(bovenlijf), { zNek: 59.6, zZij: 48.5, zPunt: 39.5, knoop: [0.8, 11.4, 47.6], stof: o.omslagdoek });
  const band = o.riem ? KAR.riem(delen, ctx, LIJF_BOERIN, 37.6) : null;
  if (band && o.buidel) KAR.buidel(delen, ctx, band, o.buidelX ?? -5.8);
  if (band && o.mes) UI.mes(delen, band, o.mes, KAR.materiaal(ctx, 'schede', UI.SCHOEN.leer), KAR.materiaal(ctx, 'heft', { ramp: 'hout', lo: 1.6, hi: 5 }), D.lijf);
  bot(Bn.Bromp);

  bouw(ctx);
  bot(null);

  // --- hoofd: rond gezicht in een witte doek, of het hoofd van haar uiterlijk (hoofdVanDeBoerin in dorpelingen2.cjs)
  hoofdVanDeBoerin(delen, ctx, HB, maat, o);
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

// ---------------------------------------------------------------- armen en handen

// Een arm van schouder Sn naar een hand op Hn, met de elleboog uit dezelfde IK als de maaier (HH.elleboog): de
// botlengtes en de kant waar de elleboog uitsteekt komen uit de hangende arm van het lijf (HANGT[i]). In de rust (Sn en
// Hn die van HANGT) is het precies de hangende arm van boer() of boerin(). Bij de boer dragen de mouw en zijn zoom hun
// rusthouding mee (`terug`), zodat de strepen van de kiel met de arm meegaan in plaats van erdoorheen; de boerin heeft
// haar lange mouw met de omgeslagen rand bij de pols (de arm van dorpelingen2.cjs). open: hoe ver de hand open is, van 0
// (de vuist) tot 1 (de vingers gestrekt en gespreid: de worp van de zaaier), zie hand hieronder.
const MOUW_BOERIN = { r: [3.8, 3.3, 2.6], tot: 1.92, rol: 0.8, hand: BOERIN.vuist }; // zoals in boerin()
function arm(ctx, i, Sn, Hn, open = 0) {
  const { M, D, delen, lijf: L } = ctx;
  const [Sr, Er, Hr] = L.HANGT[i];
  const El = HH.elleboog(Sr, Er, Hr, Sn, Hn);
  const dArm = i ? D.armR : D.armL;
  const u = HH.eenheid(HH.af(Hn, El));
  if (L === BOERIN) {
    mouwArm(delen, Sn, El, Hn, { ...MOUW_BOERIN, mouw: M.jurk, huid: M.huid, dArm, dHand: i ? D.handR : D.handL });
    delen.pop(); // haar vuist: die tekent hand() hieronder, net als bij de boer
  } else {
    const terug = HH.terugVan(HH.lidBeweging(Sr, Er, Sn, El));
    const mouw = kegel(Sn, El, 3.9, 3.4, M.kiel, dArm, 1.5);
    const zoom = ring(HH.tussen(Sn, El, 0.96), HH.eenheid(HH.af(El, Sn)), 3.4, 1, M.kiel, dArm);
    mouw.terug = terug;
    zoom.terug = terug;
    delen.push(mouw, zoom);
    delen.push(kegel(El, HH.plus(Hn, HH.keer(u, -2.8)), 3.1, 2.4, M.huid, dArm, 1));
  }
  hand(ctx, i, Hn, u, open);
}
// Een hand op Hn, de onderarm langs u. Dicht (open 0) is het de vuist van het lijf, een eivorm. Gaat hij open, dan
// wordt het een handpalm met vier vingers en een duim: de vingers komen uit de vuist omhoog (gekromd naar de palm toe)
// en strekken en spreiden zich tot een waaier als hij helemaal open is. De hand staat met zijn rug naar voren en
// omhoog, naar wie kijkt, zodat je de waaier van de vingers ziet en niet de dunne kant van een plank (Marcel, 5 okt:
// "een platte peddel zonder vingers"). De hand van de boerin is wat kleiner (handMaat).
const HAND = { palm: [1.9, 2.2, 1.15], vinger: [2.9, 3.4, 3.3, 2.6], tussen: 1.05, dik: 0.56, spreid: 19, krom: 95, duim: 2.4 };
function hand(ctx, i, Hn, u, open = 0) {
  const { M, D, delen, lijf: L } = ctx;
  const dHand = i ? D.handR : D.handL;
  if (open <= 0.2) {
    delen.push(ellips(Hn, L.vuist, M.huid, dHand, 0.6));
    return;
  }
  const k = L.handMaat;
  const o = klem((open - 0.2) / 0.8, 0, 1);
  // de rug van de hand naar voren en omhoog (w), de vingers naast elkaar langs v
  const naar = [0, 0.55, 0.85];
  const w = HH.eenheid(HH.af(naar, HH.keer(u, HH.inwendig(naar, u))));
  const v = HH.kruis(w, u);
  const zij = i ? 1 : -1; // de duim aan de kant van het lijf
  delen.push(ellipsLangs(HH.plus(Hn, HH.keer(u, 0.4 * k)), [u, v, w], HAND.palm.map((m) => m * k), M.huid, dHand, 0.6));
  const krom = (HAND.krom * (1 - o) * Math.PI) / 180;
  HAND.vinger.forEach((lang, j) => {
    const s = ((j - 1.5) * HAND.spreid * o * zij * Math.PI) / 180;
    const d0 = HH.plus(HH.keer(u, Math.cos(s)), HH.keer(v, Math.sin(s)));
    const d = HH.plus(HH.keer(d0, Math.cos(krom)), HH.keer(w, -Math.sin(krom))); // gekromd naar de palm
    const voet = HH.plus(HH.plus(Hn, HH.keer(u, 1.7 * k)), HH.keer(v, (j - 1.5) * HAND.tussen * k * zij));
    delen.push(capsule(voet, HH.plus(voet, HH.keer(d, lang * k * (0.75 + 0.25 * o))), HAND.dik, M.huid, dHand));
  });
  // de duim: uit de muis van de hand, schuin opzij
  const voet = HH.plus(HH.plus(Hn, HH.keer(u, -0.2 * k)), HH.keer(v, -1.7 * k * zij));
  const dd = HH.eenheid(HH.plus(HH.plus(HH.keer(u, 0.7), HH.keer(v, -0.75 * zij * (0.4 + 0.6 * o))), HH.keer(w, -0.35 * (1 - o))));
  delen.push(capsule(voet, HH.plus(voet, HH.keer(dd, HAND.duim * k)), HAND.dik + 0.08, M.huid, dHand));
}
// De hangende arm van de boer of de boerin, die zwaait als hij loopt (Bn.Barm[i]), precies zoals in boer() en boerin().
function hangendeArm(ctx, i) {
  arm(ctx, i, ctx.lijf.HANGT[i][0], ctx.lijf.HANGT[i][2]);
  ctx.bot(ctx.Bn.Barm[i]);
}

// ---------------------------------------------------------------- de zaaier en de zaaister

// De zaaidoek: een lap linnen over de linkerschouder, van achteren over de schouder naar voren, waar de onderkant een
// bolle zak vormt, vóór de linkerheup, met bovenin een mond vol zaad. De linkerhand houdt de rand vast. Alles gaat met
// de romp mee (in de rusthouding van de romp, zoals de zeis van de maaier). Per lijf: de band (twee bochten: punten en
// dikte), de zak (midden en maat), waar de rechtervuist in de zak gaat (in: in de rechterkant van de mond, want verder
// reikt de rechterarm niet over het lijf) en waar de linkerhand de rand houdt (rand). Bij de boerin hangt de zak vóór
// haar schort, de band over haar lagere schouder.
const ZAAIDOEK = {
  boer: {
    band: [[[-6.4, -6.2, 40], [-7.6, -6.6, 57], [-7.6, 0.2, 61.9], 1.9, 1.8], [[-7.6, 0.2, 61.9], [-8, 9.2, 59.5], [-6.4, 10.4, 44.6], 1.8, 2.3]],
    zak: { midden: [-5, 11, 38.4], maat: [5.4, 4.6, 6.2] },
    in: [-2.4, 11.4, 42.8],
    rand: [-8.2, 14.2, 43.4],
  },
  boerin: {
    band: [[[-6.8, -7, 42], [-7.8, -7.2, 55], [-7.8, 0.2, 59.6], 1.9, 1.8], [[-7.8, 0.2, 59.6], [-8.4, 9.6, 57.6], [-7, 12, 45.2], 1.8, 2.3]],
    zak: { midden: [-5.8, 12.6, 39.2], maat: [5.4, 4.6, 6.2] },
    in: [-2.2, 12, 43.6],
    rand: [-9, 15.4, 44.4],
  },
};
function zaaidoek(ctx) {
  const { delen } = ctx;
  const Z = ZAAIDOEK[ctx.lijf.naam];
  const mDoek = KAR.materiaal(ctx, 'zaaidoek', { ramp: 'perkament', lo: 1.5, hi: 5.2, patroon: (x, y, z) => (Math.sin(x * 0.8 + z * 0.45) > 0.8 ? -0.8 : 0) });
  const mZaad = KAR.materiaal(ctx, 'zaad', { ramp: 'stro', lo: 3.6, hi: 6.6, patroon: (x, y, z) => (Math.sin(x * 3.1) * Math.sin(y * 2.9) > 0.45 ? -1 : 0) });
  const dDoek = KAR.deel(ctx, 'zaaidoek');
  const dZaad = KAR.deel(ctx, 'zaad');
  // de band: van halverwege de rug omhoog over de linkerschouder, en voorop omlaag naar de zak
  for (const [p0, p1, p2, r0, r1] of Z.band) delen.push(...bochtKegel(p0, p1, p2, r0, r1, 5, mDoek, dDoek, 0.6));
  // de zak: bol en zwaar onderaan, de bovenkant open, met het zaad erin
  const [cx, cy, cz] = Z.zak.midden;
  const [a, b, c] = Z.zak.maat;
  const top = cz + c - 1.4;
  delen.push({
    f: (x, y, z) => {
      const buiten = sdf.ellipsoide(x - cx, y - cy, (z - cz) * (z < cz ? 1.08 : 1), a, b, c);
      const binnen = sdf.ellipsoide(x - cx, y - cy, z - cz - 1.6, a - 1.3, b - 1.3, c - 1.2);
      return Math.max(buiten, -binnen, z - top) * 0.9;
    },
    g: [cx, cy, cz, Math.max(a, b, c) + 1],
    m: mDoek,
    deel: dDoek,
  });
  delen.push(ellips([cx, cy, top - 1.3], [a - 1.5, b - 1.5, 1.3], mZaad, dZaad));
}

// De worp, fase 0..1, een lus: de vuist neemt zaad uit de zak (0), komt eruit en gaat voor hem langs omhoog, zwaait in
// een wijde boog naar rechts (en gaat daar open, de vingers spreiden en het zaad vliegt eruit), en komt laag terug naar
// de zak. Het lijf draait mee: naar links als de hand in de zak is, naar rechts aan het eind van de worp, met het
// gewicht erbij; de voeten blijven staan. De hand staat in de rusthouding van de romp (zoals de zeis van de maaier): de
// romp draait er nog overheen. De weg van de hand is die van de boer; de zaaister zaait vanuit haar eigen schouder
// (naarLijf), en begint en eindigt in haar eigen zak.
const ZAAIEN = {
  hand: [
    [0, 'in'], // de vuist in de zak (ZAAIDOEK)
    [0.1, [-1, 15.6, 45.6]],
    [0.22, [5.6, 18.2, 46.4]],
    [0.34, [13.6, 17.6, 47]],
    [0.44, [20.6, 13.4, 46.6]],
    [0.52, [24.4, 7, 45.6]],
    [0.62, [24, 3, 43]],
    [0.75, [15, 7, 39.6]],
    [0.88, [4, 11.4, 41.2]],
  ],
  open: [[0, 0], [0.32, 0], [0.42, 0.55], [0.5, 1], [0.62, 1], [0.74, 0.15], [0.84, 0]],
  draai: [[0, 12], [0.1, 8], [0.22, 1], [0.34, -9], [0.44, -16], [0.52, -20], [0.62, -16], [0.75, -5], [0.88, 7]],
  buig: [[0, 7], [0.22, 4], [0.52, 2.5], [0.75, 4], [0.88, 6]],
  zij: [[0, -0.7], [0.3, 0], [0.52, 0.8], [0.75, 0.3]],
  knik: [[0, 3], [0.22, -1], [0.52, -2], [0.75, 0], [0.88, 2]],
  // hoe ver de rechterschouder naar de zak toe komt (naar voren, naar binnen en wat omlaag; ZAK_REIK maal dit getal)
  reik: [[0, 1], [0.12, 0.5], [0.22, 0], [0.8, 0], [0.92, 0.6]],
};
const ZAK_REIK = [-0.8, 1.6, -0.4];
// de rechterschouder bij het zaaien (en staand, met de vuist in de zak), in de rusthouding van de romp
const zaaiSchouder = (L, reik) => HH.plus(L.SCHOUDERS[1], HH.keer(ZAK_REIK, reik));
// de sleutels van de hand per lijf
const ZAAIEN_HAND = Object.fromEntries(
  Object.values(LIJVEN).map((L) => [L.naam, ZAAIEN.hand.map(([f, p]) => [f, p === 'in' ? ZAAIDOEK[L.naam].in : naarLijf(L, 1, p)])]),
);
function houdingZaaien(fase) {
  const h = rustDorpeling();
  h.romp.draai = langsSleutels(ZAAIEN.draai, fase);
  h.romp.buig = langsSleutels(ZAAIEN.buig, fase);
  h.zij = langsSleutels(ZAAIEN.zij, fase);
  h.zak = 0.3 + 0.3 * HH.cosinus(fase);
  h.nek.knik = langsSleutels(ZAAIEN.knik, fase);
  h.nek.draai = -0.55 * h.romp.draai;
  return h;
}

// Het zaad dat uit de hand vliegt: een waaiertje korrels dat loslaat terwijl de vingers opengaan, met de vaart van de
// hand mee, dwars daarop uit elkaar (van de ene kant van de waaier naar de andere, met een beetje toeval), en valt. Vlak
// na het loslaten vangen ze even het licht (lichter, als kaf in de zon), daarna zijn ze strokleurig. Elk heeft een vast
// zaad, dus de lus is elke keer dezelfde. In de wereld gerekend (de hand op het moment van loslaten, door de romp van
// dat moment), want wat los is, draait niet meer met het lijf mee.
const KORRELS = 14;
const LICHT_TOT = 0.07; // zo lang na het loslaten vangt een korrel het licht (in fase)
function handInWereld(L, t) {
  return HH.opPunt(botten(L, houdingZaaien(t)).Bromp, langsSleutels(ZAAIEN_HAND[L.naam], t));
}
function zaad(ctx, fase) {
  const L = ctx.lijf;
  const mKorrel = KAR.materiaal(ctx, 'korrel', { ramp: 'stro', lo: 4.4, hi: 6.8, detail: true, schaduw: false });
  const mLicht = KAR.materiaal(ctx, 'korrel in het licht', { ramp: 'perkament', lo: 4.8, hi: 6.9, detail: true, schaduw: false });
  const dKorrel = KAR.deel(ctx, 'korrel');
  for (let k = 0; k < KORRELS; k++) {
    const plek = k / (KORRELS - 1); // waar in de waaier
    const los = 0.42 + 0.14 * plek + 0.02 * (rnd(71, k, 1) - 0.5);
    const dt = fase - los;
    if (dt <= 0) continue;
    const p0 = handInWereld(L, los);
    const e = 0.01;
    const v = HH.keer(HH.af(handInWereld(L, los + e), handInWereld(L, los - e)), 1 / (2 * e));
    const vaart = 0.8 + 0.3 * rnd(71, k, 2);
    const [dw] = dwarsOp(HH.eenheid(v));
    const opzij = 44 * (plek - 0.5) + 10 * (rnd(71, k, 3) - 0.5);
    const op = 22 + 22 * rnd(71, k, 4);
    const p = [
      p0[0] + (v[0] * vaart + dw[0] * opzij) * dt,
      p0[1] + (v[1] * vaart + dw[1] * opzij) * dt,
      p0[2] + (v[2] * vaart + op) * dt - 0.5 * 900 * dt * dt,
    ];
    if (p[2] < 1) continue;
    ctx.delen.push(bol(p, 1.05, dt < LICHT_TOT ? mLicht : mKorrel, dKorrel));
  }
}

// De zaaier (lijf 'boer') of de zaaister ('boerin'). stand: { houding: 'staan' | 'lopen' | 'zaaien', fase }.
function zaaier(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'zaaien' ? houdingZaaien(fase) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    const Z = ZAAIDOEK[lijf];
    zaaidoek(ctx);
    bot(Bn.Bromp);
    arm(ctx, 0, L.SCHOUDERS[0], Z.rand);
    bot(Bn.Bromp);
    if (naam === 'lopen') hangendeArm(ctx, 1);
    else {
      const hand = naam === 'zaaien' ? langsSleutels(ZAAIEN_HAND[lijf], fase) : Z.in;
      const open = naam === 'zaaien' ? klem(stapsgewijs(ZAAIEN.open, fase), 0, 1) : 0;
      arm(ctx, 1, zaaiSchouder(L, naam === 'zaaien' ? stapsgewijs(ZAAIEN.reik, fase) : 1), hand, open);
      bot(Bn.Bromp);
    }
    if (naam === 'zaaien') {
      zaad(ctx, fase);
      bot(null);
    }
  });
}

// ---------------------------------------------------------------- de wieder en de wiedster

// De schoffel: een trekschoffel aan een lange steel. Het blad is een platte, brede plaat ijzer, breder aan de snede dan
// bovenaan (een trapezium), en zit met een zwanenhals een eind onder het eind van de steel: de hals loopt eerst in het
// verlengde van de steel door en buigt dan naar de bovenrand van het blad. Het blad staat schuin terug naar de steel,
// zodat het bij het trekken de grond naar de wieder toe haalt. Zo leest hij van elke kant als schoffel: van voren en
// van achteren het brede blad, van opzij de hoek tussen blad en steel, en schuin een platte strook aan een gebogen hals,
// geen blokje aan het eind van een stok (dat was een hamer; Marcel, 5 okt).
// Gebouwd vanuit de hals N (waar de steel ophoudt), de richting van de steel naar boven (uh, eenheid) en de breedte
// van het blad (e, dwars op uh): het blad staat BLAD_HOEK graden van de steel af, om e gedraaid. Geeft de punten terug
// waar de handen hem vasthouden (bij, in eenheden vanaf het boveneind) en de snede onderaan het blad.
const STEEL = 45;
const BLAD_HOEK = 66;
// het blad: halve breedte aan de snede en bovenaan, hoogte (van de snede tot de bovenrand) en halve dikte; de hals: hoe
// ver de bovenrand van het blad onder het eind van de steel zit, langs de steel en langs het blad
const BLAD = { onder: 7.6, boven: 4.8, hoog: 6.4, dik: 0.45 };
const HALS = { langs: 3.6, uit: 3.4 };
function schoffel(ctx, N, uh, e) {
  const { M, delen } = ctx;
  const dSteel = KAR.deel(ctx, 'steel');
  const dBlad = KAR.deel(ctx, 'blad');
  const q = HH.maalV(HH.draaiing(e, -BLAD_HOEK), uh); // van de snede naar de hals
  const T = HH.plus(N, HH.keer(uh, STEEL));
  const boven = HH.plus(HH.plus(N, HH.keer(uh, -HALS.langs)), HH.keer(q, -HALS.uit)); // het midden van de bovenrand
  const snede = HH.plus(boven, HH.keer(q, -BLAD.hoog));
  delen.push(kegel(N, T, 1.15, 1.25, M.hout, dSteel));
  delen.push(bol(T, 1.45, M.hout, dSteel, 0.6));
  delen.push(ring(HH.plus(N, HH.keer(uh, 1.4)), uh, 1.35, 0.6, M.ijzer, dBlad));
  // de hals: van het eind van de steel eerst in zijn verlengde, dan gebogen naar de bovenrand, waar hij in het blad
  // overgaat (een dikkere voet op de plaat)
  const knik = HH.plus(N, HH.keer(uh, -HALS.langs * 0.9));
  delen.push(...bochtKegel(N, knik, HH.plus(boven, HH.keer(q, 0.6)), 1.05, 0.8, 4, M.ijzer, dBlad, 0.5));
  delen.push(ellipsLangs(HH.plus(boven, HH.keer(q, -0.3)), [e, q, HH.kruis(e, q)], [1.9, 1.1, 0.75], M.ijzer, dBlad, 0.6));
  delen.push(trapezium(snede, [e, q, HH.kruis(e, q)], BLAD, 0.7, M.ijzer, dBlad));
  return { snede, bij: (s) => HH.plus(T, HH.keer(uh, -s)) };
}
// Waar de handen de steel vasthouden, in eenheden vanaf het boveneind: de linker bovenaan, de rechter een eind lager
// (wie rechts is, trekt met de onderste hand).
const GREEP_BOVEN = 3.5;
const GREEP_ONDER = 9.5;
// De schoffel tussen de bovenste hand en de snede: de hand staat waterpas op `hand` ([x, y]), de snede precies op
// `snede`. De steel is zo lang als hij is, dus de hoogte van de hand volgt eruit, en de richting van de steel ook.
function schoffelTussen(ctx, hand, snede) {
  const L = STEEL - GREEP_BOVEN + HALS.langs; // van de bovenste hand langs de steel tot waar de hals het blad raakt
  let d = HH.eenheid(HH.af(snede, [hand[0], hand[1], snede[2] + 35]));
  let B = null;
  for (let k = 0; k < 8; k++) {
    const uh = HH.keer(d, -1);
    const q = HH.maalV(HH.draaiing(HH.eenheid(HH.kruis([0, 0, 1], uh)), -BLAD_HOEK), uh);
    const W = HH.plus(snede, HH.keer(q, BLAD.hoog + HALS.uit));
    const h = Math.hypot(W[0] - hand[0], W[1] - hand[1]);
    B = [hand[0], hand[1], W[2] + Math.sqrt(Math.max(0, L * L - h * h))];
    d = HH.eenheid(HH.af(W, B));
  }
  const uh = HH.keer(d, -1);
  return schoffel(ctx, HH.plus(B, HH.keer(d, STEEL - GREEP_BOVEN)), uh, HH.eenheid(HH.kruis([0, 0, 1], uh)));
}

// Het wieden, fase 0..1, een lus: hakken en trekken. De schoffel hangt geheven voor hem (0), hakt rechts voor hem in de
// grond, zo ver als zijn armen reiken (0,2), en hij trekt hem door de grond naar zich toe tot vlak voor zijn voeten
// (0,58), heft hem en zet hem weer ver voor zich (0,85). Hij staat voorover gebukt, de knieën wat door, met de
// rechterschouder naar voren (de onderste hand), en buigt dieper bij de klap; bij het trekken komt hij een fractie
// terug. De schoffel staat in de wereld (de snede op de grond), de armen reiken er met de IK heen.
const WIEDEN = {
  hand: [
    [0, [-2.4, 17.2]],
    [0.12, [-2, 18.4]],
    [0.2, [-1.6, 19]],
    [0.3, [-1.6, 18.6]],
    [0.45, [-1.9, 17.8]],
    [0.58, [-2.2, 17]],
    [0.7, [-2.5, 16.4]],
    [0.85, [-2.6, 16.6]],
  ],
  snede: [
    [0, [8.6, 36, 13]],
    [0.12, [10, 40.5, 6]],
    [0.2, [10.4, 42, -0.6]],
    [0.3, [9.8, 39, -0.5]],
    [0.45, [8.6, 34.4, -0.4]],
    [0.58, [7.4, 30, 0]],
    [0.7, [7.2, 30.5, 8]],
    [0.85, [8, 33.5, 13]],
  ],
  buig: [[0, 28], [0.12, 31], [0.2, 33], [0.3, 33], [0.45, 32], [0.58, 29], [0.7, 27], [0.85, 27]],
  zak: [[0, 2.6], [0.2, 3.6], [0.45, 3.2], [0.7, 2.6]],
  draai: [[0, 10], [0.2, 12], [0.58, 9], [0.85, 9]],
};
// Wat de wiedster anders doet dan de wieder: haar schouders zitten lager en verder naar achteren, en haar armen zijn
// korter, dus ze buigt wat dieper, houdt de schoffel wat dichter bij zich en hakt wat minder ver. Staand leunt ze op een
// schoffel die wat schuiner staat (haar handen komen anders hoger dan haar borst), en lopend rust de steel op haar
// lagere schouder.
const WIEDEN_LIJF = {
  boer: { buig: 0, hand: [0, 0], snede: [0, 0, 0], staan: { hand: [0.8, 11.4], snede: [3.6, 17.4, 0] }, schouder: [9.85, 12, 60.4] },
  boerin: { buig: 6, hand: [0, -1.6], snede: [0, -2.4, 0], staan: { hand: [0.8, 11.6], snede: [3.6, 20.4, 0] }, schouder: [10.3, 12, 58.6] },
};
function houdingWieden(fase, lijf = 'boer') {
  const h = rustDorpeling();
  h.romp.buig = langsSleutels(WIEDEN.buig, fase) + WIEDEN_LIJF[lijf].buig;
  h.romp.draai = langsSleutels(WIEDEN.draai, fase);
  h.zak = langsSleutels(WIEDEN.zak, fase);
  h.voor = -1.5;
  h.nek.knik = -0.3 * h.romp.buig;
  h.nek.draai = -0.6 * h.romp.draai;
  return h;
}

// Wat er bij het hakken en trekken van de grond loskomt: een paar kluiten die bij de klap opspringen, en een hoopje losse
// aarde dat voor het blad uit naar hem toe schuift en blijft liggen waar het trekken ophoudt (tot de volgende klap).
// In de wereld.
const EIND_VAN_DE_HAAL = [6.6, 27.6, 0];
function losseGrond(ctx, fase, snede, eind = EIND_VAN_DE_HAAL) {
  const mAarde = KAR.materiaal(ctx, 'aarde', { ramp: 'aarde', lo: 1.2, hi: 4.8, patroon: (x, y, z) => (Math.sin(x * 2.3 + y * 1.7) > 0.6 ? -0.8 : 0) });
  const dAarde = KAR.deel(ctx, 'aarde');
  const { delen } = ctx;
  if (fase > 0.22) {
    const groei = klem((fase - 0.22) / 0.14, 0, 1);
    const naarHem = HH.eenheid(HH.af(eind, snede));
    const plek = fase < 0.58 ? HH.plus(snede, HH.keer(naarHem, 2.8)) : eind;
    delen.push(ellips(HH.plus(plek, [0, 0, 0.4]), [3.8 * groei + 0.6, 2.2, 1.6 * groei + 0.4], mAarde, dAarde, 0.6));
  }
  for (let k = 0; k < 4; k++) {
    const dt = fase - 0.2;
    if (dt <= 0 || dt > 0.22) continue;
    const v = [(k - 1.5) * 34, -30 - 25 * rnd(83, k, 1), 100 + 40 * rnd(83, k, 2)];
    const p = [snede[0] + v[0] * dt, snede[1] - 1 + v[1] * dt, 1 + v[2] * dt - 0.5 * 1800 * dt * dt];
    if (p[2] > 0.8) delen.push(bol(p, 1.3, mAarde, dAarde));
  }
}

// De wieder (lijf 'boer') of de wiedster ('boerin'). stand: { houding: 'staan' | 'lopen' | 'wieden', fase }.
//   staan: hij leunt op zijn schoffel, die rechtop voor hem staat met het blad op de grond, de handen op elkaar op het
//          boveneind; hij ademt, de schoffel staat stil.
//   lopen: de schoffel over de rechterschouder, het blad achter hem; de rechterhand houdt de steel vóór de schouder,
//          de linkerarm zwaait mee. De schoffel gaat met de romp mee.
function wieder(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const W = WIEDEN_LIJF[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  let hg;
  if (naam === 'wieden') hg = houdingWieden(fase, lijf);
  else {
    hg = gewoon(stand, L);
    if (naam === 'staan') hg.romp.buig += 5; // hij hangt een beetje op de steel
  }
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    const schouder = (i) => HH.opPunt(Bn.Bromp, L.SCHOUDERS[i]);
    if (naam === 'lopen') {
      // in de rusthouding van de romp: de steel rust op de rechterschouder, het boveneind voor hem, het blad achter
      const uh = HH.eenheid([0.03, 1, 0.03]);
      const s = schoffel(ctx, HH.plus(W.schouder, HH.keer(uh, -STEEL)), uh, [-1, 0, 0]);
      bot(Bn.Bromp);
      arm(ctx, 1, schouder(1), HH.opPunt(Bn.Bromp, HH.plus(s.bij(4.6), [0, 0, -1])));
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    const s =
      naam === 'staan'
        ? schoffelTussen(ctx, W.staan.hand, W.staan.snede)
        : schoffelTussen(ctx, HH.plus([...langsSleutels(WIEDEN.hand, fase), 0], [...W.hand, 0]).slice(0, 2), HH.plus(langsSleutels(WIEDEN.snede, fase), W.snede));
    bot(null);
    if (naam === 'staan') {
      arm(ctx, 0, schouder(0), s.bij(GREEP_BOVEN));
      bot(null);
      arm(ctx, 1, schouder(1), HH.plus(s.bij(0.6), [0.6, -0.4, 1.6]));
      bot(null);
      return;
    }
    arm(ctx, 0, schouder(0), s.bij(GREEP_BOVEN));
    bot(null);
    arm(ctx, 1, schouder(1), s.bij(GREEP_ONDER));
    bot(null);
    losseGrond(ctx, fase, s.snede, HH.plus(EIND_VAN_DE_HAAL, W.snede));
    bot(null);
  });
}

// ---------------------------------------------------------------- de sprokkelaar en de sprokkelaarster

// Het takkenbos: een bundel takken op de rug, van de heupen tot boven de schouders, scheef (onderaan naar links,
// bovenaan naar rechts, waar de rechterhand er een tak bij steekt), met twee touwen erom en twee banden over de
// schouders naar voren, zoals het rek van de marskramer. De takken zijn dun en niet even lang, en waaieren naar de
// einden uit (de touwen knijpen de bundel in het midden samen); een paar hebben een zijtak, en bovenaan steken
// twijgen uit, achter en naast de rand van de hoed. In de rusthouding van de romp. Per lijf: de bundel (onder, boven,
// dik), de banden (van de bundel over de schouder, en voorop omlaag; s is links -1 of rechts 1), waar de linkerhand de
// band vasthoudt (greep), om welk punt de bundel deint als hij loopt (deint), en waar de laatste tak in de bundel zit
// (laatste: t langs de as, hoek en afstand, zie bundelPunt; zakken: zo ver laat de hand hem erin zakken). De boerin
// draagt hem wat hoger op haar rug, boven de rok, en steekt de tak er wat lager in, want haar armen zijn korter.
const TAKKENBOS = {
  boer: {
    bundel: { onder: [-6, -11.4, 29], boven: [6.4, -14.2, 67], dik: 4.8 },
    banden: (s) => [[[s * 5.6, -8.2, 55 + 2 * s], [s * 7.6, -5.4, 62.6], [s * 7.6, 1.4, 61.2]], [[s * 7.6, 1.4, 61.2], [s * 7.8, 8.8, 58.6], [s * 7.2, 9, 44.5]]],
    greep: [-6.4, 10.6, 50.6],
    deint: [0, -8, 58],
    laatste: { t: 1.06, hoek: 3.75, r: 4, zakken: 3.5 },
  },
  boerin: {
    bundel: { onder: [-6, -12.8, 32], boven: [6.2, -14.6, 66], dik: 4.8 },
    banden: (s) => [[[s * 5.6, -8.8, 52 + 2 * s], [s * 7.6, -5.8, 59.6], [s * 7.6, 1.2, 58.8]], [[s * 7.6, 1.2, 58.8], [s * 7.8, 9.4, 56.2], [s * 7.2, 10, 42.5]]],
    greep: [-6.8, 10.6, 47.6],
    deint: [0, -8, 56],
    laatste: { t: 0.96, hoek: 3.75, r: 4.4, zakken: 3 },
  },
};
const TAKKEN = 18;
// De as van een bundel en de twee richtingen dwars erop, en een punt erin: t langs de as (0 onder, 1 boven), op hoek a
// en afstand r van de as. In de rusthouding van de romp.
function bundelAs(B) {
  const as = HH.af(B.boven, B.onder);
  const lang = HH.lengte(as);
  const u = HH.eenheid(as);
  const [v, w] = dwarsOp(u);
  const punt = (t, a, r) => HH.plus(HH.plus(B.onder, HH.keer(u, t * lang)), HH.plus(HH.keer(v, r * Math.cos(a)), HH.keer(w, r * Math.sin(a))));
  return { lang, u, v, w, punt };
}
function takkenbos(ctx) {
  const { delen } = ctx;
  const T = TAKKENBOS[ctx.lijf.naam];
  const BUNDEL = T.bundel;
  const mTak = [
    KAR.materiaal(ctx, 'tak', { ramp: 'schors', lo: 1.2, hi: 5.2 }),
    KAR.materiaal(ctx, 'tak2', { ramp: 'hout', lo: 1.2, hi: 5 }),
    KAR.materiaal(ctx, 'tak3', { ramp: 'schors', lo: 2, hi: 6.2 }),
  ];
  const mTouw = KAR.materiaal(ctx, 'touw', { ramp: 'riet', lo: 1.6, hi: 5.2, patroon: (x, y, z) => (Math.sin((x + y + z) * 2.2) > 0.5 ? -0.8 : 0) });
  const dBos = KAR.deel(ctx, 'takkenbos');
  const dTouw = KAR.deel(ctx, 'touw');
  const { u, v, w, punt: op } = bundelAs(BUNDEL);
  const stukken = [];
  for (let i = 0; i < TAKKEN; i++) {
    const a = (i / TAKKEN) * 2 * Math.PI * 2.618 + rnd(91, i, 1);
    const r = (BUNDEL.dik - 1) * Math.sqrt(0.1 + 0.9 * rnd(91, i, 2));
    const t0 = -0.1 + 0.18 * rnd(91, i, 3);
    const t1 = 0.86 + 0.32 * rnd(91, i, 4);
    const dik = 0.75 + 0.4 * rnd(91, i, 5);
    const p0 = op(t0, a, r + 1);
    const p1 = op(t1, a + 0.4 * (rnd(91, i, 6) - 0.5), r + 2.4);
    const m = mTak[i % 3];
    stukken.push(kegel(p0, p1, dik, dik * 0.7, m));
    if (rnd(91, i, 7) < 0.4) {
      const van = HH.tussen(p0, p1, 0.55 + 0.3 * rnd(91, i, 8));
      stukken.push(capsule(van, op(Math.min(1.2, t1 + 0.06), a + 0.8, r + 5), 0.5, m));
    }
  }
  // de twijgen bovenaan: dun, ze waaieren uit naar boven en opzij, voorbij de rand van de hoed
  for (let k = 0; k < 7; k++) {
    const a = 0.4 + k * 0.75;
    const van = op(0.9, a, 2.6);
    const naar = HH.plus(op(1.28 + 0.14 * rnd(92, k, 1), a + 0.5 * (rnd(92, k, 2) - 0.5), 5 + 3 * rnd(92, k, 3)), [1.5, -1.5, 0]);
    stukken.push(...bochtKegel(van, HH.plus(HH.tussen(van, naar, 0.5), [0, 0, 1]), naar, 0.65, 0.35, 3, mTak[k % 3]));
  }
  // Alle takken samen als één deel. Buiten een koker om de bundel is de afstand tot die koker genoeg (de takken zitten
  // erin), en pas binnen de koker telt elke tak: anders vraagt de renderer bij elk punt van de rug alle takken na, want
  // de grensbol van een lange dunne tak is groot. Het materiaal is dat van de dichtste tak.
  const koker = [op(-0.16, 0, 0), op(1.45, 0, 0), BUNDEL.dik + 7.5];
  const dichtste = (x, y, z) => {
    let d = 1e9;
    let w = 0;
    for (let i = 0; i < stukken.length; i++) {
      const t = stukken[i].f(x, y, z);
      if (t < d) {
        d = t;
        w = i;
      }
    }
    return [d, w];
  };
  delen.push({
    f: (x, y, z) => {
      const h = sdf.capsule(x, y, z, ...koker[0], ...koker[1], koker[2]);
      return h > 0.5 ? h : dichtste(x, y, z)[0];
    },
    g: [...HH.tussen(koker[0], koker[1], 0.5), HH.lengte(HH.af(koker[1], koker[0])) / 2 + koker[2] + 0.5],
    m: (x, y, z) => stukken[dichtste(x, y, z)[1]].m,
    deel: dBos,
  });
  // twee touwen om de bundel
  for (const t of [0.3, 0.72]) {
    const c = op(t, 0, 0);
    delen.push({
      f: (x, y, z) => {
        const p = [x - c[0], y - c[1], z - c[2]];
        const langs = HH.inwendig(p, u);
        const dwars = Math.hypot(HH.inwendig(p, v), HH.inwendig(p, w));
        return Math.hypot(dwars - (BUNDEL.dik + 0.3), langs) - 0.75;
      },
      g: [c[0], c[1], c[2], BUNDEL.dik + 2],
      m: mTouw,
      deel: dTouw,
    });
  }
  // de banden: van de bundel over elke schouder naar voren, tot onder de borst (onder de armen terug zie je niet)
  for (const s of [-1, 1]) for (const [p0, p1, p2] of T.banden(s)) delen.push(...bochtKegel(p0, p1, p2, 0.85, 0.85, 4, mTouw, dTouw, 0.5));
}

// Lopend deint de bundel mee: hij komt een fractie na het lijf omhoog en omlaag, en kantelt wat opzij, zoals het rek
// van de marskramer. Een beweging na de romp (Bn.Bromp), om de plek waar de banden over de schouders gaan.
function bundelDeint(Bn, stand, om) {
  if (stand.houding !== 'lopen') return Bn.Bromp;
  const f = stand.fase || 0;
  const deinen = HH.beweging({
    M: HH.maalM(HH.draaiing([0, 1, 0], -2.2 * HH.sinus(f - 0.2)), HH.draaiing([1, 0, 0], 1.2 * HH.sinus(2 * (f - 0.1)))),
    om,
    dp: [0, 0, -0.7 * HH.cosinus(2 * (f - 0.12))],
  });
  return HH.naElkaar(Bn.Bromp, deinen);
}

// Het rapen, fase 0..1, een lus (Marcel, 5 okt: hij bukte zo diep dat je van voren alleen zijn hoed en de bundel zag):
// hij staat (0) en kijkt naar een tak die rechts voor hem op de grond ligt, gaat door de knieën tot hij diep hurkt, de
// heupen naar achteren, de knieën uit elkaar en de rug zo recht als zijn korte armen toelaten, het hoofd omhoog naar de
// tak; zijn linkerhand steunt op zijn knie en zijn rechterhand reikt naar de tak (0,25). Hij pakt hem bij het eind dat
// het dichtst bij is (0,34) en komt overeind; de tak sleept eerst met zijn andere eind over de grond en hangt dan aan
// zijn hand (0,55). Hij brengt hem voor zich langs omhoog en over zijn rechterschouder (0,72), laat hem bovenin de
// bundel zakken (0,75 tot 0,84) en laat los: de tak zit in de bundel. Zijn arm komt weer naar beneden.
// De tak gaat zo van de grond naar de hand en naar de bundel. Waar hij in de bundel belandt (TAKKENBOS, laatste), zit
// altijd een tak (de vorige), zodat er aan het eind van de lus niets uit de bundel verdwijnt; alleen de nieuwe op de
// grond is er dan weer.
// De hand en de tak in de wereld, want de tak ligt op de grond. Van 0,72 tot 0,92 staat hij recht (de romp in rust),
// zodat de wereld en de rusthouding van de romp daar samenvallen en de tak precies in zijn plek in de bundel zakt.
// De sprokkelaarster doet hetzelfde in haar rok: ze moet dieper door de knieën en verder voorover om er met haar
// kortere armen bij te komen (RAPEN_BOERIN), en haar hand gaat dezelfde weg vanuit haar eigen schouder.
const TAK = { greep: [8.6, 14.8, 1.3], richting: HH.eenheid([0.5, 0.86, 0]), lang: 17 }; // greep: waar de boer hem pakt
// De sleutels staan op de beelden (zestien, k/16): onderweg naar beneden hangt de hand onder de schouder, want verder
// reiken zijn korte armen niet.
const RAPEN = {
  hand: [
    [0, HANGT[1][2]],
    [0.0625, [12, 6.4, 34.6]],
    [0.125, [11.2, 11.4, 25.6]],
    [0.1875, [10, 13.6, 16.4]],
    [0.25, [8.8, 14.6, 6.4]],
    [0.3125, [8.6, 14.8, 4.6]],
    [0.375, [8.6, 14.8, 4.8]],
    [0.4375, [9.4, 14, 10.4]],
    [0.5, [11.2, 12, 19.4]],
    [0.5625, [12.8, 9.2, 30.4]],
    [0.625, [13.8, 6, 42.4]],
    [0.6875, [13.4, 0.4, 56]],
    [0.75, 'boven'], // boven de plek in de bundel (TAKKENBOS, laatste, zo ver als hij hem laat zakken)
    [0.8125, 'in'], // de tak zit erin
    [0.875, 'in'],
    [0.9375, [12.6, 1.6, 47]],
  ],
  // de romp, zonder doorschieten (stapsgewijs): van 0,72 tot 0,92 precies in rust
  zak: [[0, 0], [0.0625, 2], [0.125, 8], [0.1875, 14], [0.25, 18.6], [0.375, 19], [0.4375, 16.5], [0.5, 11], [0.5625, 5], [0.625, 1.2], [0.7, 0], [0.92, 0]],
  voor: [[0, 0], [0.0625, -1.2], [0.125, -4], [0.1875, -6.8], [0.25, -8.5], [0.375, -8.5], [0.4375, -7], [0.5, -4.6], [0.5625, -2], [0.625, -0.4], [0.7, 0], [0.92, 0]],
  buig: [[0, 4], [0.0625, 10], [0.125, 22], [0.1875, 36], [0.25, 49], [0.375, 51], [0.4375, 45], [0.5, 34], [0.5625, 20], [0.625, 8], [0.7, 0], [0.92, 0]],
  draai: [[0, 3], [0.125, 6], [0.25, 7], [0.375, 7], [0.5, 4], [0.625, 1], [0.7, 0], [0.92, 0]],
  // het hoofd: omhoog tegen de buiging in, zodat hij naar de tak kijkt en je onder de rand van zijn hoed zijn gezicht ziet
  knik: [[0, 9], [0.0625, 4], [0.125, -10], [0.1875, -24], [0.25, -37], [0.375, -39], [0.4375, -33], [0.5, -22], [0.5625, -10], [0.625, -2], [0.7, -6], [0.8125, -4], [0.92, 2]],
  nekDraai: [[0, 8], [0.25, 6], [0.5, 2], [0.625, 0], [0.7, 12], [0.8125, 14], [0.92, 6]],
  knieUit: [[0, 0], [0.125, 1], [0.25, 2.6], [0.375, 2.6], [0.5, 1.2], [0.625, 0], [0.92, 0]],
  // hoe ver de rechterschouder naar de tak toe komt (naar voren en omlaag)
  reik: [[0, 0], [0.125, 0.8], [0.25, 2.6], [0.375, 2.6], [0.5, 0.8], [0.5625, 0], [0.92, 0]],
  // de linkerhand: van de band (0) naar de knie (1)
  steun: [[0, 0], [0.0625, 0], [0.1875, 1], [0.4375, 1], [0.5625, 0], [0.92, 0]],
  open: [[0, 0], [0.19, 0], [0.25, 0.85], [0.3125, 0.85], [0.36, 0], [0.84, 0], [0.875, 0.9], [0.93, 0.6], [0.98, 0]],
};
// De romp van de sprokkelaarster: haar heup zit hoger en haar armen zijn korter, dus ze zakt dieper en buigt verder.
const RAPEN_BOERIN = {
  ...RAPEN,
  zak: [[0, 0], [0.0625, 2], [0.125, 8.5], [0.1875, 15], [0.25, 19.6], [0.375, 20], [0.4375, 17.4], [0.5, 11.6], [0.5625, 5.2], [0.625, 1.2], [0.7, 0], [0.92, 0]],
  voor: [[0, 0], [0.0625, -1], [0.125, -3.4], [0.1875, -5.6], [0.25, -7], [0.375, -7], [0.4375, -5.8], [0.5, -3.8], [0.5625, -1.6], [0.625, -0.3], [0.7, 0], [0.92, 0]],
  buig: [[0, 4], [0.0625, 11], [0.125, 25], [0.1875, 41], [0.25, 56], [0.375, 58], [0.4375, 51], [0.5, 38], [0.5625, 22], [0.625, 8], [0.7, 0], [0.92, 0]],
  knik: [[0, 9], [0.0625, 4], [0.125, -12], [0.1875, -28], [0.25, -42], [0.375, -44], [0.4375, -38], [0.5, -25], [0.5625, -11], [0.625, -2], [0.7, -6], [0.8125, -4], [0.92, 2]],
};
const RAPEN_VAN = { boer: RAPEN, boerin: RAPEN_BOERIN };
const GRIJP = 0.34; // vanaf hier is de tak in zijn hand
const LOS = 0.86; // en vanaf hier in de bundel
const OPRICHTEN = [0.6, 0.73]; // van hangen naar de richting van de bundel
function houdingRapen(fase, lijf = 'boer') {
  const R = RAPEN_VAN[lijf];
  const h = rustDorpeling();
  const sp = (rij) => stapsgewijs(rij, fase);
  h.zak = sp(R.zak);
  h.voor = sp(R.voor);
  h.romp.buig = sp(R.buig);
  h.romp.draai = sp(R.draai);
  h.nek.knik = sp(R.knik);
  h.nek.draai = sp(R.nekDraai);
  h.knieUit = sp(R.knieUit);
  h.hurkt = true; // de rok van de boerin gaat mee (rokProfiel)
  return h;
}
// De rechterschouder bij het rapen, in de wereld (hij komt wat naar voren als hij reikt).
function rapenSchouder(L, fase) {
  const reik = stapsgewijs(RAPEN.reik, fase);
  return HH.opPunt(botten(L, houdingRapen(fase, L.naam)).Bromp, HH.plus(L.SCHOUDERS[1], [0, reik, -0.5 * reik]));
}
// Per lijf: waar de laatste tak in de bundel zit en welke kant hij op wijst (de bundel in, omlaag), de sleutels van de
// hand (die van de boer, vanuit de schouder van dat lijf op dat moment), en waar de tak op de grond ligt: bij de boer
// waar zijn sleutels de hand zetten (TAK), bij een ander lijf recht onder de hand op het moment dat die hem pakt.
const RAPEN_LIJF = Object.fromEntries(
  Object.values(LIJVEN).map((L) => {
    const T = TAKKENBOS[L.naam];
    const as = bundelAs(T.bundel);
    const inBundel = as.punt(T.laatste.t, T.laatste.hoek, T.laatste.r);
    const plek = { boven: HH.plus(inBundel, HH.keer(as.u, T.laatste.zakken)), in: inBundel };
    const hand = RAPEN.hand.map(([f, p]) => [f, plek[p] || naarLijf(L, 1, p, rapenSchouder(BOER, f), rapenSchouder(L, f))]);
    const grijp = langsSleutels(hand, GRIJP);
    return [L.naam, { inBundel, omlaag: HH.keer(as.u, -1), hand, greep: L === BOER ? TAK.greep : [grijp[0], grijp[1], TAK.greep[2]] }];
  }),
);
// de hand van het rapen op fase t (in de wereld)
const rapenHand = (t, lijf = 'boer') => langsSleutels(RAPEN_LIJF[lijf].hand, t);
// Waar de tak is op fase t: { van, r } (van het eind in de hand langs richting r), of null als hij in de bundel zit.
function takNu(t, hand, lijf = 'boer') {
  const R = RAPEN_LIJF[lijf];
  if (t < GRIJP) return { van: R.greep, r: TAK.richting };
  if (t >= LOS) return null;
  const L = TAK.lang;
  // het andere eind sleept over de grond, recht onder de hand weg, tot de tak aan de hand hangt
  const hoog = Math.max(0, hand[2] - 1);
  const over = Math.sqrt(Math.max(0, L * L - hoog * hoog));
  const ver = [hand[0] + TAK.richting[0] * over, hand[1] + TAK.richting[1] * over, 1];
  let r = HH.eenheid(HH.af(ver, hand));
  // en boven de schouder draait hij hem in de richting van de bundel
  const k = HH.soepel(klem((t - OPRICHTEN[0]) / (OPRICHTEN[1] - OPRICHTEN[0]), 0, 1));
  if (k > 0) r = HH.eenheid(HH.plus(HH.keer(r, 1 - k), HH.keer(R.omlaag, k)));
  return { van: hand, r };
}
// Een tak: een stok met één zijtak, van `van` (waar de hand hem heeft) langs richting r. Lichter en wat dikker dan de
// takken in de bundel: een droge tak, die je ook tegen de donkere kiel ziet.
function tak(ctx, van, r, lang) {
  const m = KAR.materiaal(ctx, 'losse tak', { ramp: 'hout', lo: 2.4, hi: 6.2 });
  const d = KAR.deel(ctx, 'losse tak');
  const naar = HH.plus(van, HH.keer(r, lang));
  ctx.delen.push(kegel(van, naar, 1.45, 0.95, m, d, 0.3));
  const [dw] = dwarsOp(r);
  const zij = HH.tussen(van, naar, 0.62);
  ctx.delen.push(capsule(zij, HH.plus(HH.plus(zij, HH.keer(r, 4.5)), HH.keer(dw, 3.2)), 0.7, m, d));
}

// De sprokkelaar (lijf 'boer') of de sprokkelaarster ('boerin'). stand: { houding: 'staan' | 'lopen' | 'rapen', fase }.
// In alle drie het takkenbos op de rug, met de tak die er het laatst in ging, en de linkerhand aan de band (bij het
// rapen steunt die er even mee op de knie); staand en lopend hangt de rechterarm zoals bij de boer of de boerin (en
// zwaait hij mee).
function sprokkelaar(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const T = TAKKENBOS[lijf];
  const R = RAPEN_LIJF[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'rapen' ? houdingRapen(fase, lijf) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    takkenbos(ctx);
    tak(ctx, R.inBundel, R.omlaag, TAK.lang);
    bot(bundelDeint(Bn, stand, T.deint));
    if (naam !== 'rapen') {
      arm(ctx, 0, L.SCHOUDERS[0], T.greep);
      bot(Bn.Bromp);
      hangendeArm(ctx, 1);
      return;
    }
    // de linkerhand: van de band naar de knie, en terug
    const steun = stapsgewijs(RAPEN.steun, fase);
    const opKnie = HH.plus(ctx.knie[0], L === BOER ? [0.6, 1.8, 3.4] : [0.4, 2.4, 5.2]);
    const links = HH.tussen(HH.opPunt(Bn.Bromp, T.greep), opKnie, steun);
    arm(ctx, 0, HH.opPunt(Bn.Bromp, L.SCHOUDERS[0]), links);
    bot(null);
    // de rechterhand, met de schouder wat naar voren als hij reikt
    const hand = rapenHand(fase, lijf);
    arm(ctx, 1, rapenSchouder(L, fase), hand, klem(stapsgewijs(RAPEN.open, fase), 0, 1));
    bot(null);
    const t = takNu(fase, hand, lijf);
    if (t) tak(ctx, t.van, t.r, TAK.lang);
    bot(null);
  });
}

// ---------------------------------------------------------------- de hakker en de hakster

// De bijl (vraag 107, f; Marcel, 5 okt): een steel van essenhout van een kleine meter, iets korter dan die van de
// schoffel, met een knop aan het eind, en bovenaan de kop: een ijzeren wig met de snede naar voren en een korte nek achter
// de steel. Van het oog naar de snede wordt de kop dunner en hoger, zodat de snede langer is dan het oog: van opzij een
// wig, van boven een smal blad. Donker ijzer, met een lichter randje aan de snede dat in het licht even blinkt (zoals het
// blad van de schoffel en de zeis). Gebouwd vanuit het eind van de steel K, de richting van de steel naar de kop (uh,
// eenheid) en die waar de snede heen wijst (e, dwars op uh). Geeft de punten terug waar de handen hem vasthouden (bij, in
// eenheden vanaf het eind), het midden van de kop en de snede.
const BIJL = {
  steel: 36, // van het eind tot het boveneind, dat net boven de kop uitsteekt
  oog: 33, // waar het midden van de kop op de steel zit
  r: [1.2, 0.95], // de steel: bij het eind, bij de kop
  knop: 1.55,
  // de kop, vanuit het oog: tot de snede en tot de nek; half zo hoog (bij het oog en aan de snede); half zo dik (bij het
  // oog en aan de snede); hoeveel de punten van de snede terugwijken (een bolle snede); en hoe breed het lichte randje is
  kop: { snede: 7.6, nek: 2.6, hoog: [2.3, 4], dik: [1.8, 0.45], bol: 1, rand: 1.6 },
};
const GREEP_LINKS = 2.6; // de linkerhand, vlak boven de knop
function bijl(ctx, K, uh, e) {
  const { M, delen } = ctx;
  const dSteel = KAR.deel(ctx, 'steel');
  const dKop = KAR.deel(ctx, 'kop');
  const mKop = KAR.materiaal(ctx, 'bijlkop', { ramp: 'ijzer', lo: 1.2, hi: 5.4, glans: 1.2, detail: true });
  const mSnede = KAR.materiaal(ctx, 'snede', { ramp: 'ijzer', lo: 4, hi: 7, glans: 2.2, detail: true });
  const n = HH.kruis(uh, e);
  const T = HH.plus(K, HH.keer(uh, BIJL.steel));
  const O = HH.plus(K, HH.keer(uh, BIJL.oog));
  delen.push(kegel(K, T, BIJL.r[0], BIJL.r[1], M.hout, dSteel));
  delen.push(bol(HH.plus(K, HH.keer(uh, 0.7)), BIJL.knop, M.hout, dSteel, 0.6));
  const { snede, nek, hoog, dik, bol: bolheid, rand } = BIJL.kop;
  const lokaal = (x, y, z) => {
    const p = [x - O[0], y - O[1], z - O[2]];
    return [HH.inwendig(p, uh), HH.inwendig(p, e), HH.inwendig(p, n)];
  };
  const tot = (a) => snede - bolheid * (a / hoog[1]) ** 2; // hoe ver de snede reikt op hoogte a
  const helling = Math.max(((hoog[1] - hoog[0]) * 1.5) / snede, (dik[0] - dik[1]) / snede, (2 * bolheid) / hoog[1]);
  const schaal = 0.9 / Math.hypot(1, helling);
  delen.push({
    f: (x, y, z) => {
      const [a, b, c] = lokaal(x, y, z);
      const t = klem(b / snede, 0, 1);
      const h = hoog[0] + (hoog[1] - hoog[0]) * t ** 1.5;
      const d = dik[0] + (dik[1] - dik[0]) * t;
      return Math.max(Math.abs(a) - h, b - tot(a), -nek - b, Math.abs(c) - d) * schaal;
    },
    g: [...HH.plus(O, HH.keer(e, (snede - nek) / 2)), Math.hypot((snede + nek) / 2, hoog[1]) + 1],
    m: (x, y, z) => {
      const [a, b] = lokaal(x, y, z);
      return b > tot(a) - rand ? mSnede : mKop;
    },
    deel: dKop,
  });
  return { kop: O, snede: HH.plus(O, HH.keer(e, snede)), bij: (s) => HH.plus(K, HH.keer(uh, s)) };
}

// Het hakken, fase 0..1, een lus van twaalf beelden. Hij staat op de tegel naast de boom en kijkt ernaar: de stam staat
// een tegel voor hem. De bijl staat over zijn rechterschouder omhoog en naar achter, met de rechterhand tot halverwege de
// steel opgeschoven (0, 1), komt over zijn schouder (2), en slaat van rechtsboven schuin naar beneden en naar voren
// terwijl de rechterhand naar de linker glijdt (3), tot de snede op kniehoogte voor hem in de stam slaat (4). Daar staat
// hij even stil (5), hij wrikt de bijl los (6), trekt hem langs zijn rechterzij terug (7) en heft hem weer over zijn
// schouder (8 tot 11). Het lijf draait mee: bij het ophalen de rechterschouder naar achter, bij de klap naar voren, en
// bij de inslag buigt hij en gaat hij door de knieën; de voeten blijven staan. Zo leest het ook als de wortels van een
// stronk loshakken: dezelfde slag. Per beeld: het lijf (buig, draai, zak, voor), en de bijl in de wereld: de linkerhand
// op de knop (links), waar de steel heen wijst (steel, naar de kop) en de snede (snede), en hoe ver de rechterhand van
// het eind zit (rechts). De armen reiken er met de IK heen.
const HAKKEN = [
  { buig: 3, draai: -16, zak: 0.6, voor: -0.6, links: [5.5, 9, 57.5], steel: [0.32, -0.58, 0.75], snede: [0, 0.75, 0.66], rechts: 15 },
  { buig: 2, draai: -18, zak: 0.5, voor: -0.8, links: [6, 8, 58.5], steel: [0.36, -0.68, 0.64], snede: [0, 0.65, 0.76], rechts: 16 },
  { buig: 6, draai: -8, zak: 1.2, voor: -0.3, links: [6, 11, 60], steel: [0.34, -0.07, 0.94], snede: [0, 1, 0.1], rechts: 13 },
  { buig: 15, draai: 4, zak: 2.8, voor: 0.2, links: [3, 16, 50], steel: [0.5, 0.6, 0.62], snede: [-0.4, 0.4, -0.8], rechts: 9 },
  { buig: 22, draai: 12, zak: 4.2, voor: 0.6, links: [-4, 14, 35], steel: [0.435, 0.814, -0.389], snede: [-0.6, 0.15, -0.78], rechts: 6 },
  { buig: 23, draai: 12.5, zak: 4.6, voor: 0.6, links: [-4, 14, 34.6], steel: [0.435, 0.814, -0.4], snede: [-0.6, 0.15, -0.78], rechts: 6 },
  { buig: 20, draai: 10, zak: 3.8, voor: 0.4, links: [-3, 12, 38], steel: [0.4, 0.8, -0.43], snede: [-0.6, 0.15, -0.78], rechts: 6.5 },
  { buig: 15, draai: 0, zak: 2.6, voor: 0.1, links: [4.5, 11, 44], steel: [0.45, 0.55, -0.55], snede: [-0.5, 0.3, -0.8], rechts: 9 },
  { buig: 9, draai: -6, zak: 1.6, voor: -0.2, links: [6, 10, 51], steel: [0.6, 0.35, 0.72], snede: [-0.1, 1, 0], rechts: 12 },
  { buig: 5, draai: -12, zak: 1, voor: -0.4, links: [5.5, 9.5, 56], steel: [0.42, -0.2, 0.88], snede: [0, 0.9, 0.4], rechts: 14 },
  { buig: 4, draai: -15, zak: 0.7, voor: -0.5, links: [5.4, 9, 57.2], steel: [0.35, -0.48, 0.8], snede: [0, 0.8, 0.6], rechts: 15 },
  { buig: 3, draai: -16, zak: 0.6, voor: -0.6, links: [5.5, 9, 57.5], steel: [0.33, -0.56, 0.76], snede: [0, 0.76, 0.65], rechts: 15 },
];
const HAK_SLEUTELS = Object.fromEntries(Object.keys(HAKKEN[0]).map((k) => [k, HAKKEN.map((b, i) => [i / HAKKEN.length, b[k]])]));
const hakSleutel = (k, fase) => langsSleutels(HAK_SLEUTELS[k], fase);
// Wat de hakster anders doet dan de hakker: haar schouders zitten lager en haar armen zijn korter, dus ze buigt wat
// dieper en draait haar rechterschouder wat verder mee naar voren; haar handen gaan samen dezelfde weg vanuit het midden
// tussen haar eigen schouders (naarLijf, zie bijlInDeHanden), en de bijl wijst dezelfde kant op. Staan: de bijl met de
// kop op de grond naast de rechtervoet, een eind opzij, zodat hij ook van achteren te zien is (voet: waar het boveneind
// de grond raakt), de steel schuin omhoog naar de rechterhand, die op de knop rust (naar: waar de steel heen wijst).
// Lopen: de steel op de rechterschouder (schouder, in de rusthouding van de romp), de knop een eind voor hem (voor), de
// kop achter hem met de snede omhoog en naar buiten, zodat hij ook van voren boven de hoed uitkomt.
const HAKKEN_LIJF = {
  boer: {
    buig: 0,
    draai: 0,
    staan: { voet: [17, 6, 0.3], naar: [12.6, 2.8, 36], snede: [0.25, 1, 0] },
    lopen: { schouder: [9.9, 0.5, 60.6], naar: [0.12, -1, 0.42], voor: 11, snede: [0.8, 0, 0.6] },
  },
  boerin: {
    buig: 5,
    draai: 4,
    staan: { voet: [17.2, 6.4, 0.3], naar: [12.9, 3.2, 35.2], snede: [0.25, 1, 0] },
    lopen: { schouder: [10.5, 0.6, 58.2], naar: [0.12, -1, 0.42], voor: 11, snede: [0.8, 0, 0.6] },
  },
};
const dwarsOpSteel = (v, uh) => HH.eenheid(HH.af(v, HH.keer(uh, HH.inwendig(v, uh))));
function houdingHakken(fase, lijf = 'boer') {
  const h = rustDorpeling();
  h.romp.buig = hakSleutel('buig', fase) + HAKKEN_LIJF[lijf].buig;
  h.romp.draai = hakSleutel('draai', fase) + HAKKEN_LIJF[lijf].draai;
  h.zak = hakSleutel('zak', fase);
  h.voor = hakSleutel('voor', fase);
  h.nek.knik = -0.3 * h.romp.buig;
  h.nek.draai = -0.7 * h.romp.draai;
  return h;
}
// De bijl in de handen bij het hakken, op fase t, voor lijf L: het eind van de steel (K), de richtingen van de steel (uh)
// en de snede (e), de linker- en de rechterhand, en de schouders (in de wereld).
function bijlInDeHanden(fase, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const uh = HH.eenheid(hakSleutel('steel', fase));
  const e = dwarsOpSteel(hakSleutel('snede', fase), uh);
  const schoudersVan = (wie) => [0, 1].map((i) => HH.opPunt(botten(LIJVEN[wie], houdingHakken(fase, wie)).Bromp, LIJVEN[wie].SCHOUDERS[i]));
  const schouders = schoudersVan(lijf);
  const tussen = HH.keer(uh, hakSleutel('rechts', fase) - GREEP_LINKS); // van de linkerhand naar de rechter
  let links = hakSleutel('links', fase);
  if (L !== BOER) {
    // de twee handen samen vanuit het midden tussen haar schouders, naar de lengte van haar arm
    const midden = (S) => HH.tussen(S[0], S[1], 0.5);
    const m = naarLijf(L, 0, HH.plus(links, HH.keer(tussen, 0.5)), midden(schoudersVan('boer')), midden(schouders));
    links = HH.af(m, HH.keer(tussen, 0.5));
  }
  const K = HH.af(links, HH.keer(uh, GREEP_LINKS));
  return { K, uh, e, links, rechts: HH.plus(links, tussen), schouders };
}

// De hakker (lijf 'boer') of de hakster ('boerin'), met de bijl: een boom omhakken, en de wortels van de stobbe loshakken.
// Straks ook de houthakker die hakt en plant (vraag 115). stand: { houding: 'staan' | 'lopen' | 'hakken', fase }.
//   staan: de bijl staat met de kop op de grond naast zijn rechtervoet, zijn rechterhand rust op de knop, de linkerarm
//          hangt; hij ademt, de bijl staat stil.
//   lopen: de bijl over de rechterschouder, de kop achter hem; de rechterhand houdt de steel voor de schouder, de
//          linkerarm zwaait mee. De bijl gaat met de romp mee.
function hakker(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const B = HAKKEN_LIJF[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'hakken' ? houdingHakken(fase, lijf) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    const schouder = (i) => HH.opPunt(Bn.Bromp, L.SCHOUDERS[i]);
    if (naam === 'lopen') {
      // in de rusthouding van de romp: de steel rust op de rechterschouder, de knop voor hem, de kop achter hem
      const uh = HH.eenheid(B.lopen.naar);
      const K = HH.af(B.lopen.schouder, HH.keer(uh, B.lopen.voor));
      const s = bijl(ctx, K, uh, dwarsOpSteel(B.lopen.snede, uh));
      bot(Bn.Bromp);
      arm(ctx, 1, schouder(1), HH.opPunt(Bn.Bromp, HH.plus(s.bij(GREEP_LINKS + 0.6), [0, 0, -0.8])));
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    if (naam === 'staan') {
      const uh = HH.eenheid(HH.af(B.staan.voet, B.staan.naar)); // van de knop naar de kop, omlaag
      const K = HH.af(B.staan.voet, HH.keer(uh, BIJL.steel));
      const s = bijl(ctx, K, uh, dwarsOpSteel(B.staan.snede, uh));
      bot(null);
      arm(ctx, 1, schouder(1), HH.plus(s.bij(-1.4), [0, 0, 0.6])); // de vuist op de knop
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    const H = bijlInDeHanden(fase, lijf);
    bijl(ctx, H.K, H.uh, H.e);
    bot(null);
    arm(ctx, 0, schouder(0), H.links);
    bot(null);
    arm(ctx, 1, schouder(1), H.rechts);
    bot(null);
  });
}

// ---------------------------------------------------------------- de maaister

// De maaister: de boerin met de zeis van de maaier en zijn maaislag (maaier.cjs: zeisInDeHanden, houdingMaaier), zodat
// het spel bij een boerin die maait alleen de naam wisselt. Haar schouders zitten lager, dus de zeis gaat een stuk mee
// omlaag (ZEIS_LAGER, niet helemaal: anders komt het blad in de grond); de armen reiken er met haar eigen IK heen, en
// gaan met de romp mee, zoals bij de maaier. Het hout van de zeis is dat van de maaier, zonder nerf.
const ZEIS_LAGER = [0.6, 0.1, -1.2];
function maaister(stand) {
  const fase = (stand && stand.fase) || 0;
  return werkBoerin(houdingMaaier(fase), (ctx) => {
    const { Bn, bot, M } = ctx;
    const { P, zijAs } = zeisInDeHanden(fase, ZEIS_LAGER);
    const zeisHout = KAR.materiaal(ctx, 'zeishout', { ramp: 'hout', lo: 1.6, hi: 6 });
    const steel = KAR.deel(ctx, 'steel');
    ctx.delen.push(...zeisDelen(P, zijAs, { hout: zeisHout, ijzer: M.ijzer }, { steel, handvat: steel, blad: KAR.deel(ctx, 'blad') }));
    arm(ctx, 1, BOERIN.SCHOUDERS[1], P.greepBoven);
    arm(ctx, 0, BOERIN.SCHOUDERS[0], P.greepOnder);
    bot(Bn.Bromp);
  });
}

// De maaier met een uiterlijk (vraag 145): de maaier zelf staat in maaier.cjs, met zijn eigen lijf; met een uiterlijk
// maait hij hier, op het lijf van werkBoer (dat van boer() en maaier()), met dezelfde zeis en slag als de maaister.
function maaierWerk(stand) {
  const fase = (stand && stand.fase) || 0;
  return werkBoer(houdingMaaier(fase), (ctx) => {
    const { Bn, bot, M } = ctx;
    const { P, zijAs } = zeisInDeHanden(fase);
    const zeisHout = KAR.materiaal(ctx, 'zeishout', { ramp: 'hout', lo: 1.6, hi: 6 });
    const steel = KAR.deel(ctx, 'steel');
    ctx.delen.push(...zeisDelen(P, zijAs, { hout: zeisHout, ijzer: M.ijzer }, { steel, handvat: steel, blad: KAR.deel(ctx, 'blad') }));
    arm(ctx, 1, BOER.SCHOUDERS[1], P.greepBoven);
    arm(ctx, 0, BOER.SCHOUDERS[0], P.greepOnder);
    bot(Bn.Bromp);
  });
}

// ---------------------------------------------------------------- de oogst: plukken, binden, dragen en dorsen

// Vier werkfiguren erbij, voor de wijnoogst en de graanoogst (werklijst vraag 136 en 140; Marcel, 8 okt: "Dat je de boeren
// ziet plukken"): dezelfde boer en boerin als hierboven, met hun gereedschap en een eigen houding voor het werk.
//
//   plukker      een tenen mand aan de linkerhand, voor zijn heup, met druiven erin. staan, lopen (de mand draagt hij mee),
//   plukster     en plukken: voorover naar de rank, de rechterhand naar een tros, de tros eraf, en in de mand.
//   binder       banden van stro aan zijn riem. staan: hij draait een band tussen zijn handen. lopen: de banden aan zijn
//   binster      riem. binden: diep gebukt bij een bos halmen die rechtop staat, de band erom, strak, en een knoop.
//   drager       een schoof op de rechterschouder, de rechterhand aan de band, de aren naar voren. staan en lopen.
//   draagster
//   dorser       de dorsvlegel: een lange steel met een zwengel eraan, aan een leren lus. staan: de steel rechtop naast
//   dorster      hem, de zwengel hangt langs de steel. lopen: de vlegel op de schouder, de zwengel hangt achter zijn rug.
//                dorsen: de vlegel gaat achter zijn schouder omhoog, zwaait voor hem langs, en de zwengel slaat neer.

// Een materiaal en een deel erbij, voor een voorwerp (de nummers van het lijf blijven zoals ze zijn).
const matVan = (ctx, naam, m) => KAR.materiaal(ctx, naam, m);
const reikVan = (L) => armLengte(L, 1) / armLengte(BOER, 1); // hoe ver een arm reikt, ten opzichte van de boer
const perBeeld = (rij) => rij.map((w, i) => [i / rij.length, w]);
const schouderLijn = (L, Bn) => [0, 1].map((i) => HH.opPunt(Bn.Bromp, L.SCHOUDERS[i]));

// Een tros druiven die van `top` omlaag hangt: rijen bollen, steeds minder, en een steeltje.
function tros(ctx, top, schaal = 1) {
  const m = matVan(ctx, 'druif', { ramp: 'magie', lo: 1.4, hi: 5.6, glans: 0.6 });
  const mSteel = matVan(ctx, 'steeltje', { ramp: 'schors', lo: 2, hi: 5 });
  const d = KAR.deel(ctx, 'druif');
  const s = schaal;
  ctx.delen.push(capsule(HH.plus(top, [0, 0, 0.6 * s]), HH.plus(top, [0, 0, -1.4 * s]), 0.5 * s, mSteel, d));
  const rijen = [[3, 1.5, -2.2, 1.35], [3, 1.45, -4.2, 1.15], [2, 1.35, -6.2, 0.8], [1, 1.2, -8, 0]];
  rijen.forEach(([n, r, dz, kring], i) => {
    for (let j = 0; j < n; j++) {
      const a = (j / n) * 2 * Math.PI + i * 1.1;
      ctx.delen.push(bol(HH.plus(top, [Math.cos(a) * kring * s, Math.sin(a) * kring * s, dz * s]), r * s, m, d, 0.6));
    }
  });
}

// ---------------------------------------------------------------- de plukker en de plukster

// De mand: van riet, met een hengsel dat hij met de linkerhand pakt. De mand hangt recht onder de hand, wat het lijf ook
// doet (hij hangt eraan), met druiven erin en een tros die over de rand hangt.
const PLUKMAND = { rx: 5.6, ry: 5, h: 6.6, draai: 25 };
function pluktMand(ctx, hand) {
  const { rx, ry, h, draai } = PLUKMAND;
  const c = HH.af(hand, [0, 0, h + rx - 0.6 + 0.4]);
  const mRiet = matVan(ctx, 'rietmand', { ramp: 'riet', lo: 1.4, hi: 6, patroon: rietPatroon(c, draai) });
  const dMand = KAR.deel(ctx, 'mand');
  rietMand(ctx.delen, c, [rx, ry], h, mRiet, dMand, draai);
  const m = matVan(ctx, 'druif', { ramp: 'magie', lo: 1.4, hi: 5.6, glans: 0.6 });
  const dD = KAR.deel(ctx, 'druif');
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4;
    const r = 3.5 * Math.sqrt((k + 0.5) / 9);
    ctx.delen.push(bol([c[0] + Math.cos(a) * r * 1.05, c[1] + Math.sin(a) * r, c[2] + h - 0.1 + 1.2 * (1 - r / 4)], 1.75, m, dD, 0.7));
  }
  tros(ctx, [c[0] + rx - 0.6, c[1] + 1, c[2] + h + 0.4], 0.9);
}

// De linkerhand aan het hengsel, in de rusthouding van de romp (voor de boer; een boerin met haar eigen armlengte).
const PLUK_MAND_HAND = [-6, 13.5, 41.5];

// Het plukken, een lus van twaalf beelden: de rechterhand komt boven de mand vandaan (0), gaat omhoog en naar rechts (1, 2)
// naar de rank (3), sluit zich om een tros (4), snijdt hem af (5), brengt hem omlaag (6 tot 8) boven de mand (9), laat hem
// los (10) en hij valt erin (11). Het lijf draait mee: naar rechts naar de rank, naar links naar de mand, en hij buigt wat
// voorover; de voeten blijven staan. De hand staat in de rusthouding van de romp (zoals bij de zaaier), met de romp mee.
const PLUKKEN = {
  hand: perBeeld([
    [-0.5, 11, 43], [3.5, 12.5, 47.5], [9.5, 15, 53], [14, 16, 58], [16, 17.5, 60], [15.5, 17, 59],
    [14, 15, 55], [10.5, 13.5, 49], [5, 12, 45], [0, 11, 43.5], [-0.5, 11, 43], [-0.5, 11, 43.5],
  ]),
  open: perBeeld([0.7, 0.1, 0, 0.5, 0.2, 0, 0, 0, 0, 0, 0.8, 0.8]),
  buig: perBeeld([16, 14, 14, 18, 20, 20, 18, 16, 17, 17, 17, 16]),
  draai: perBeeld([10, 4, -4, -12, -15, -14, -9, 0, 7, 10, 10, 10]),
  knik: perBeeld([-6, -3, 0, 4, 6, 6, 3, -2, -6, -8, -8, -7]),
  zak: perBeeld([1.5, 1, 0.5, 0.2, 0.2, 0.4, 0.8, 1.2, 1.6, 1.8, 1.8, 1.6]),
  // waar de tros is: 0 niet, 1 in de hand, 2 onderweg omlaag in de mand
  tros: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2],
};
function houdingPlukken(fase, lijf = 'boer') {
  const h = rustDorpeling();
  const s = (k) => langsSleutels(PLUKKEN[k], fase);
  h.romp.buig = s('buig') + (lijf === 'boerin' ? 3 : 0);
  h.romp.draai = s('draai');
  h.zak = s('zak');
  h.voor = 0;
  h.nek.knik = -s('knik') - 0.3 * h.romp.buig;
  h.nek.draai = -0.5 * h.romp.draai;
  return h;
}

// De plukker (lijf 'boer') of de plukster ('boerin'). stand: { houding: 'staan' | 'lopen' | 'plukken', fase }.
function plukker(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'plukken' ? houdingPlukken(fase, lijf) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    const links = naarLijf(L, 0, PLUK_MAND_HAND);
    arm(ctx, 0, L.SCHOUDERS[0], links);
    bot(Bn.Bromp);
    pluktMand(ctx, HH.opPunt(Bn.Bromp, links));
    bot(null);
    if (naam !== 'plukken') {
      hangendeArm(ctx, 1);
      return;
    }
    const hand = naarLijf(L, 1, langsSleutels(PLUKKEN.hand, fase));
    const open = klem(stapsgewijs(PLUKKEN.open, fase), 0, 1);
    arm(ctx, 1, L.SCHOUDERS[1], hand, open);
    bot(Bn.Bromp);
    const k = Math.round(fase * 12) % 12;
    const welke = PLUKKEN.tros[k];
    if (welke) {
      const w = HH.opPunt(Bn.Bromp, hand);
      tros(ctx, welke === 1 ? HH.plus(w, [0, 0, -0.6]) : HH.plus(w, [0.5, 0, -6.5]), welke === 1 ? 1 : 0.9);
    }
    bot(null);
  });
}

// ---------------------------------------------------------------- de schoof

// Een schoof: halmen die in het midden met een band zijn samengebonden, onderaan afgesneden en bovenaan uitwaaierend met de
// aren. band: waar de band zit, as: de richting van de voet naar de aren. Gemaakt uit een romp (met halmen in het stro
// geschilderd) en bovenaan losse halmen met een aar, zodat de silhouet bovenaan uitwaaiert. De band is een aparte ring.
const SCHOOF = { lang: 44, bandT: 0.42, rBand: 3.3, rVoet: 4.4, rKop: 5.2, losseHalmen: 14 };
function schoof(ctx, { band, as, lang = SCHOOF.lang, bandT = SCHOOF.bandT, rBand = SCHOOF.rBand, rVoet = SCHOOF.rVoet, rKop = SCHOOF.rKop, metBand = true }) {
  const { delen } = ctx;
  const u = HH.eenheid(as);
  const [v, w] = dwarsOp(u);
  const voet = HH.af(band, HH.keer(u, bandT * lang));
  const tLathe = 0.7;
  const mHalm = matVan(ctx, 'halm', {
    ramp: 'stro',
    lo: 2.4,
    hi: 6.2,
    patroon: (x, y, z) => {
      const p = [x - voet[0], y - voet[1], z - voet[2]];
      const s = Math.sin(Math.atan2(HH.inwendig(p, w), HH.inwendig(p, v)) * 9 + HH.inwendig(p, u) * 0.12);
      return s > 0.5 ? 0.8 : s < -0.55 ? -0.7 : 0;
    },
  });
  const mAar = matVan(ctx, 'aar', { ramp: 'stro', lo: 3.8, hi: 7 });
  const d = KAR.deel(ctx, 'schoof');
  const R = (t) => (t < bandT ? mix(rVoet, rBand, Math.pow(t / bandT, 0.8)) : mix(rBand, rKop, Math.pow(Math.min(1, (t - bandT) / (tLathe - bandT)), 0.8)));
  delen.push({
    f: (x, y, z) => {
      const p = [x - voet[0], y - voet[1], z - voet[2]];
      const a = HH.inwendig(p, u);
      const r = Math.hypot(HH.inwendig(p, v), HH.inwendig(p, w));
      return Math.max((r - R(klem(a / lang, 0, tLathe))) * 0.85, -a, a - tLathe * lang);
    },
    g: [...HH.plus(voet, HH.keer(u, lang * 0.36)), lang * 0.4 + rKop + 1],
    m: mHalm,
    deel: d,
    k: 0.6,
  });
  // de losse halmen bovenaan, die uitwaaieren, elk met een aar
  const n = SCHOOF.losseHalmen;
  const punt = (t, a, rho) => {
    const straal = t <= tLathe ? R(t) : mix(rKop, rKop + 3.2, Math.pow((t - tLathe) / (1 - tLathe), 0.9));
    return HH.plus(HH.plus(voet, HH.keer(u, t * lang)), HH.plus(HH.keer(v, Math.cos(a) * rho * straal), HH.keer(w, Math.sin(a) * rho * straal)));
  };
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + 0.3;
    const rho = Math.sqrt((i + 0.5) / n) * 0.95;
    const t1 = 0.99 + 0.06 * rnd(95, i, 1);
    const van = punt(0.6, a, rho);
    const naar = punt(t1, a, rho);
    delen.push(capsule(van, naar, 0.62, mHalm, d));
    const r = HH.eenheid(HH.af(naar, punt(t1 - 0.12, a, rho)));
    delen.push(capsule(naar, HH.plus(naar, HH.keer(r, 4.4)), 0.95, mAar, d, 0.3));
  }
  if (metBand) bindband(ctx, HH.plus(voet, HH.keer(u, bandT * lang)), u, rBand + 0.35, HH.keer(w, -1));
  return { voet, u, punt };
}
// Een band van gedraaid stro om iets, met een knoop en twee losse einden aan de kant `voor`.
function bindband(ctx, c, u, R, voor) {
  const mTouw = matVan(ctx, 'strotouw', { ramp: 'riet', lo: 1.8, hi: 5.6, patroon: (x, y, z) => (Math.sin((x + y + z) * 2.2) > 0.4 ? -0.8 : 0) });
  const d = KAR.deel(ctx, 'strotouw');
  ctx.delen.push(ring(c, u, R, 0.85, mTouw, d));
  const v = HH.eenheid(HH.af(voor, HH.keer(u, HH.inwendig(voor, u))));
  const knoop = HH.plus(c, HH.keer(v, R + 0.2));
  ctx.delen.push(bol(knoop, 1.35, mTouw, d, 0.5));
  const dw = HH.kruis(u, v);
  ctx.delen.push(capsule(knoop, HH.plus(HH.plus(knoop, HH.keer(v, 1.6)), HH.plus(HH.keer(u, 2.6), HH.keer(dw, 1.4))), 0.5, mTouw, d));
  ctx.delen.push(capsule(knoop, HH.plus(HH.plus(knoop, HH.keer(v, 1.2)), HH.plus(HH.keer(u, -3), HH.keer(dw, -1.2))), 0.5, mTouw, d));
}

// ---------------------------------------------------------------- de drager en de draagster

// De schoof ligt op de rechterschouder: de aren voor hem, een eindje naar rechts, de voet achter zijn rug; de band ligt op
// de schouder. De rechterhand pakt de schoof een eind voor de schouder, onderlangs. Alles in de rusthouding van de romp.
const DRAGEN = {
  boer: { band: [11, 2, 64], as: [0.2, 1, 0.1], hand: [13, 13.5, 58.6] },
  boerin: { band: [11.2, 2, 61.6], as: [0.2, 1, 0.1], hand: [12.6, 12.4, 56.4] },
};
function drager(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const D = DRAGEN[lijf];
  const hg = gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    schoof(ctx, { band: D.band, as: D.as });
    arm(ctx, 1, L.SCHOUDERS[1], D.hand);
    bot(Bn.Bromp);
    hangendeArm(ctx, 0);
  });
}

// ---------------------------------------------------------------- de binder en de binster

// Banden van gedraaid stro die hij aan zijn riem draagt: twee lussen die langs zijn linkerheup hangen. Met de romp mee.
function bandenAanDeRiem(ctx) {
  const x = ctx.lijf === BOERIN ? -13.4 : -12.6;
  const z = ctx.lijf === BOERIN ? 30 : 29.2;
  const m = matVan(ctx, 'strotouw', { ramp: 'riet', lo: 1.8, hi: 5.6, patroon: (px, py, pz) => (Math.sin((px + py + pz) * 2.2) > 0.4 ? -0.8 : 0) });
  const d = KAR.deel(ctx, 'strotouw');
  ctx.delen.push(ring([x, 2.4, z], HH.eenheid([1, 0.25, 0.1]), 4, 0.85, m, d));
  ctx.delen.push(ring([x - 0.4, 5.6, z - 0.8], HH.eenheid([0.25, 1, 0.1]), 3.6, 0.85, m, d));
  ctx.delen.push(capsule([x + 1.6, 3.2, z + 5], [x + 0.6, 3.6, z + 3.2], 0.6, m, d));
}
// Een band die tussen twee handen hangt: een gedraaid touw met een zakkende bocht.
function bandTussen(ctx, a, b, zak) {
  const m = matVan(ctx, 'strotouw', { ramp: 'riet', lo: 1.8, hi: 5.6 });
  const d = KAR.deel(ctx, 'strotouw');
  const midden = HH.plus(HH.tussen(a, b, 0.5), [0, 1.5, -zak]);
  ctx.delen.push(...bochtKegel(a, midden, b, 0.85, 0.85, 5, m, d, 0.5));
}

// De schoof waar hij mee bezig is: rechtop op de grond voor hem, een beetje naar hem toe geleund, met de band op een derde.
const BINDEN_SCHOOF = { band: [0, 21, 14], as: [0, -0.1, 1], lang: 30 };
// Het binden, een lus van twaalf beelden. Hij staat diep voorover gebukt, de knieën wat door, met de linkerhand om de
// halmen boven de band, en haalt met de rechter de band om de bos (2 tot 4), trekt hem aan (5 tot 7) en draait de knoop
// dicht (8 tot 10); dan laat hij los (11). De handen zijn plekken ten opzichte van het midden van de band.
const BINDEN = {
  links: perBeeld([[-4.5, -3.5, 9], [-4.6, -3.5, 9], [-4.6, -3.4, 8.8], [-4.6, -3.4, 8.6], [-4.6, -3.2, 8.4], [-4.5, -3.2, 8.2], [-4.5, -3.2, 8.2], [-4.5, -3.3, 8.4], [-4.5, -3.4, 8.8], [-4.5, -3.5, 9], [-4.5, -3.5, 9.2], [-4.5, -3.5, 9]]),
  rechts: perBeeld([[6.5, -4, 7], [4.5, -5.2, 2.5], [0.5, -6.2, 0.8], [-3.5, -5, 1.2], [-6, -3, 3], [-2, -4.8, 1.5], [3, -5.4, 1], [7, -4.6, 0.5], [3.5, -5.2, 1.4], [1.5, -5.4, 1.9], [3.5, -5.2, 1.4], [6.5, -4.5, 5]]),
  band: [0, 0, 9, 7.5, 6.2, 5, 4.2, 3.8, 3.8, 3.8, 3.8, 0], // de straal van de ring om de bos (0: nog geen band)
  buig: perBeeld([44, 45, 46, 47, 47, 46, 45, 45, 45, 45, 45, 44]),
  draai: perBeeld([0, -2, -4, -2, 0, 3, 5, 6, 3, 2, 1, 0]),
  zak: perBeeld([11, 11.5, 12, 12.5, 12.5, 12, 11.5, 11.5, 11.5, 11.5, 11.5, 11]),
};
function houdingBinden(fase, lijf = 'boer') {
  const h = rustDorpeling();
  const s = (k) => langsSleutels(BINDEN[k], fase);
  h.romp.buig = s('buig') + (lijf === 'boerin' ? 4 : 0);
  h.romp.draai = s('draai');
  h.zak = s('zak');
  h.voor = -3;
  h.knieUit = 2;
  h.hurkt = true; // de rok van de boerin gaat mee (rokProfiel)
  h.nek.knik = -22;
  h.nek.draai = -0.5 * h.romp.draai;
  return h;
}
function binder(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'binden' ? houdingBinden(fase, lijf) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    if (naam !== 'binden') {
      bandenAanDeRiem(ctx);
      bot(Bn.Bromp);
      if (naam === 'lopen') {
        hangendeArm(ctx, 0);
        hangendeArm(ctx, 1);
        return;
      }
      // staan: een band draaien tussen zijn handen
      const a = naarLijf(L, 0, [-2.5, 10, 42]);
      const b = naarLijf(L, 1, [3.2, 10.5, 42.5]);
      bandTussen(ctx, a, b, 5);
      arm(ctx, 0, L.SCHOUDERS[0], a);
      arm(ctx, 1, L.SCHOUDERS[1], b);
      bot(Bn.Bromp);
      return;
    }
    bandenAanDeRiem(ctx);
    bot(Bn.Bromp);
    const S = BINDEN_SCHOOF;
    const middenBand = S.band;
    schoof(ctx, { band: middenBand, as: S.as, lang: S.lang, metBand: false });
    const schouders = schouderLijn(L, Bn);
    const k = reikVan(L);
    const links = HH.plus(middenBand, HH.keer(langsSleutels(BINDEN.links, fase), 1));
    const rechts = HH.plus(middenBand, HH.keer(langsSleutels(BINDEN.rechts, fase), 1));
    const ringR = BINDEN.band[Math.round(fase * 12) % 12];
    if (ringR > 0) {
      const u = HH.eenheid(S.as);
      const c = HH.plus(middenBand, [0, 0, 0]);
      const d = KAR.deel(ctx, 'strotouw');
      const mTouw = matVan(ctx, 'strotouw', { ramp: 'riet', lo: 1.8, hi: 5.6 });
      if (ringR <= 4) bindband(ctx, c, u, ringR, [0, -1, 0]);
      else ctx.delen.push(ring(c, u, ringR, 0.85, mTouw, d));
    }
    bot(null);
    arm(ctx, 0, schouders[0], links, 0);
    bot(null);
    arm(ctx, 1, schouders[1], rechts, 0);
    bot(null);
    void k;
  });
}

// ---------------------------------------------------------------- de dorser en de dorster

// De dorsvlegel: een lange steel van essenhout, met aan het boveneind een leren lus waar de zwengel in hangt, een korte,
// dikke knuppel die los kan zwaaien. Gebouwd vanuit het eind van de steel K, de richting van de steel (uh) en die van de
// zwengel vanaf de lus (zw). Geeft de punten terug waar de handen hem vasthouden (bij, vanaf het eind van de steel).
const VLEGEL = { steel: 42, r: [1.1, 0.9], zwengel: 22, zr: 2.1, lus: 1.6 };
function vlegel(ctx, K, uh, zw) {
  const { M, delen } = ctx;
  const dSteel = KAR.deel(ctx, 'steel');
  const dZw = KAR.deel(ctx, 'zwengel');
  const mZw = matVan(ctx, 'zwengel', { ramp: 'hout', lo: 2.2, hi: 6.6, patroon: (x, y, z) => (Math.sin(z * 1.1 + x * 0.9) > 0.8 ? -0.6 : 0) });
  const mLeer = matVan(ctx, 'leer', { ramp: 'leer', lo: 1.4, hi: 6 });
  const T = HH.plus(K, HH.keer(uh, VLEGEL.steel));
  delen.push(kegel(K, T, VLEGEL.r[0], VLEGEL.r[1], M.hout, dSteel));
  delen.push(bol(HH.plus(K, HH.keer(uh, 0.7)), 1.5, M.hout, dSteel, 0.6));
  const eind = HH.plus(T, HH.keer(zw, VLEGEL.zwengel));
  delen.push(capsule(HH.plus(T, HH.keer(zw, 2.6)), eind, VLEGEL.zr, mZw, dZw, 0.4));
  delen.push(bol(T, VLEGEL.lus, mLeer, dSteel, 0.5));
  delen.push(bol(HH.plus(T, HH.keer(zw, 2.2)), VLEGEL.lus, mLeer, dZw, 0.5));
  return { T, eind, bij: (s) => HH.plus(K, HH.keer(uh, s)) };
}

// Het dorsen, een lus van twaalf beelden. Per beeld: het lijf (buig, draai, zak, voor), de linkerhand ten opzichte van het
// midden van zijn schouders (off, in de wereld, voor de boer), de richting van de steel (steel) en van de zwengel vanaf het
// boveneind (zw), en hoe ver de rechterhand van het eind zit (rechts). De vlegel staat achter zijn rechterschouder omhoog
// (0), gaat rechtop (1, 2), zwaait naar voren (3, 4), de zwengel slaat plat op de dorsvloer (5 tot 7), en hij trekt hem
// op (8 tot 11), waarna de zwengel achter hem hangt (11) en de lus weer begint.
const DORSEN = [
  { buig: 6, draai: -12, zak: 0.5, voor: -0.5, off: [4, 6, -6], steel: [0.15, -0.5, 0.85], zw: [0, -0.35, -0.94], rechts: 14 },
  { buig: 3, draai: -8, zak: 0.3, voor: -0.6, off: [4, 5, -2], steel: [0.1, -0.15, 0.98], zw: [0, -0.95, 0.2], rechts: 14 },
  { buig: 8, draai: 0, zak: 0.8, voor: -0.3, off: [4, 6, -3], steel: [0.08, 0.35, 0.93], zw: [0, -0.5, 0.85], rechts: 14 },
  { buig: 16, draai: 5, zak: 1.8, voor: 0, off: [4, 9, -6], steel: [0.08, 0.75, 0.66], zw: [0, 0.2, 0.98], rechts: 12 },
  { buig: 24, draai: 8, zak: 2.8, voor: 0.2, off: [3, 10, -9], steel: [0.08, 0.9, 0.3], zw: [0, 0.85, 0.5], rechts: 9 },
  { buig: 30, draai: 10, zak: 3.4, voor: 0.4, off: [3, 9, -10], steel: [0.08, 0.8, -0.2], zw: [0, 0.55, -0.83], rechts: 8 },
  { buig: 34, draai: 10, zak: 4, voor: 0.5, off: [3, 8, -10], steel: [0.08, 0.6, -0.8], zw: [0, 0.97, -0.25], rechts: 8 },
  { buig: 33, draai: 10, zak: 3.8, voor: 0.5, off: [3, 8, -10], steel: [0.08, 0.6, -0.8], zw: [0, 0.9, 0.3], rechts: 8 },
  { buig: 26, draai: 6, zak: 2.8, voor: 0.2, off: [3, 8, -9], steel: [0.08, 0.8, 0.1], zw: [0, 0.6, -0.7], rechts: 9 },
  { buig: 16, draai: 0, zak: 1.6, voor: 0, off: [4, 8, -6], steel: [0.08, 0.55, 0.7], zw: [0, 0.2, -0.95], rechts: 10 },
  { buig: 8, draai: -6, zak: 0.8, voor: -0.3, off: [4, 6, -5], steel: [0.1, 0.1, 0.98], zw: [0, -0.3, -0.95], rechts: 13 },
  { buig: 5, draai: -10, zak: 0.5, voor: -0.5, off: [4, 6, -6], steel: [0.12, -0.3, 0.93], zw: [0, -0.6, -0.8], rechts: 14 },
];
const DORS_SLEUTELS = Object.fromEntries(Object.keys(DORSEN[0]).map((k) => [k, perBeeld(DORSEN.map((b) => b[k]))]));
const dorsSleutel = (k, fase) => langsSleutels(DORS_SLEUTELS[k], fase);
function houdingDorsen(fase, lijf = 'boer') {
  const h = rustDorpeling();
  h.romp.buig = dorsSleutel('buig', fase) + (lijf === 'boerin' ? 3 : 0);
  h.romp.draai = dorsSleutel('draai', fase);
  h.zak = dorsSleutel('zak', fase);
  h.voor = dorsSleutel('voor', fase);
  h.nek.knik = -0.3 * h.romp.buig;
  h.nek.draai = -0.6 * h.romp.draai;
  return h;
}
// Waar de vlegel is bij het dorsen op fase t: het eind van de steel, de richtingen van steel en zwengel, en de handen.
function vlegelInDeHanden(fase, lijf, Bn) {
  const L = LIJVEN[lijf];
  const schouders = schouderLijn(L, Bn);
  const midden = HH.tussen(schouders[0], schouders[1], 0.5);
  const uh = HH.eenheid(dorsSleutel('steel', fase));
  const zw = HH.eenheid(dorsSleutel('zw', fase));
  const links = HH.plus(midden, HH.keer(dorsSleutel('off', fase), reikVan(L)));
  const K = HH.af(links, HH.keer(uh, GREEP_LINKS));
  const rechts = HH.plus(links, HH.keer(uh, dorsSleutel('rechts', fase) - GREEP_LINKS));
  return { K, uh, zw, links, rechts, schouders };
}
// Staan: de steel rechtop naast hem, het eind op de grond, de rechterhand eromheen; de zwengel hangt langs de steel.
// Lopen: de steel op de rechterschouder (zoals de bijl), het boveneind achter hem, de zwengel hangt achter zijn rug.
function dorser(stand, lijf = 'boer') {
  const L = LIJVEN[lijf];
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'dorsen' ? houdingDorsen(fase, lijf) : gewoon(stand, L);
  return L.bouw(hg, (ctx) => {
    const { Bn, bot } = ctx;
    if (naam === 'staan') {
      const hand = L.HANGT[1][2];
      const uh = HH.eenheid([0.02, 0.04, 1]);
      const K = HH.af(hand, HH.keer(uh, 35.6));
      K[2] = 0.3;
      vlegel(ctx, K, uh, HH.eenheid([0.5, 0.15, -0.85]));
      bot(null);
      arm(ctx, 1, HH.opPunt(Bn.Bromp, L.SCHOUDERS[1]), hand);
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    if (naam === 'lopen') {
      const B = HAKKEN_LIJF[lijf].lopen;
      const uh = HH.eenheid(B.naar);
      const K = HH.af(B.schouder, HH.keer(uh, B.voor));
      const sw = Math.sin(2 * Math.PI * fase);
      const zw = HH.eenheid([0.06 + 0.25 * sw, -0.15 + 0.15 * Math.cos(4 * Math.PI * fase), -1]);
      const v = vlegel(ctx, K, uh, zw);
      bot(Bn.Bromp);
      arm(ctx, 1, HH.opPunt(Bn.Bromp, L.SCHOUDERS[1]), HH.opPunt(Bn.Bromp, HH.plus(v.bij(GREEP_LINKS + 0.6), [0, 0, -0.8])));
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    const H = vlegelInDeHanden(fase, lijf, Bn);
    vlegel(ctx, H.K, H.uh, H.zw);
    bot(null);
    arm(ctx, 0, H.schouders[0], H.links);
    bot(null);
    arm(ctx, 1, H.schouders[1], H.rechts);
    bot(null);
  });
}

// de vrouwen
const plukster = (stand) => plukker(stand, 'boerin');
const binster = (stand) => binder(stand, 'boerin');
const draagster = (stand) => drager(stand, 'boerin');
const dorster = (stand) => dorser(stand, 'boerin');

// de vrouwen: hetzelfde werk op het lijf van de boerin
const zaaister = (stand) => zaaier(stand, 'boerin');
const wiedster = (stand) => wieder(stand, 'boerin');
const sprokkelaarster = (stand) => sprokkelaar(stand, 'boerin');
const hakster = (stand) => hakker(stand, 'boerin');

BOER.bouw = werkBoer;
BOERIN.bouw = werkBoerin;

module.exports = {
  HOUDINGEN, SNELHEID, LOOP_FPS, LIJVEN, LIJF_VAN, snelheidVan,
  zaaier, wieder, sprokkelaar, zaaister, wiedster, sprokkelaarster, maaister, hakker, hakster,
  plukker, binder, drager, dorser, plukster, binster, draagster, dorster,
  houdingPlukken, houdingBinden, houdingDorsen, vlegelInDeHanden, schoof, vlegel, PLUKKEN, BINDEN, DORSEN, VLEGEL, SCHOOF,
  werkBoer, werkBoerin, metUiterlijk, maaierWerk, arm, hand, hangendeArm, langsSleutels, stapsgewijs, schoffel, schoffelTussen, takkenbos, bijl,
  houdingZaaien, houdingWieden, houdingRapen, houdingHakken, bijlInDeHanden, rapenHand, rapenSchouder, naarLijf,
  ZAAIEN, WIEDEN, RAPEN, RAPEN_BOERIN, HAKKEN, BIJL, GREEP_BOVEN, GREEP_ONDER, GREEP_LINKS, SCHOUDERS, HANGT,
};
