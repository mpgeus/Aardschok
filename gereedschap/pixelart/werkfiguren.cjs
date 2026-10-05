// De boer aan het werk op zijn veld (werklijst vraag 111, b; Marcel 3 okt: "ja die zijn goed", 5 okt: de figuren nu):
// drie werkfiguren uit code, op dezelfde manier gemaakt als de maaier (maaier.cjs). Het is de gewone boer met strohoed
// en kiel uit dorpelingen.cjs, met eigen gereedschap en een eigen houding voor het werk. Het spel laat een boer of
// boerin zo'n vel lenen zolang hij dat werk doet, ook als hij naar de volgende tegel loopt of even rust (js/sprites.js,
// figuurNu, zoals bij de maaier). Daarom heeft elk ook staan en lopen, en is het overal dezelfde soort man.
//
//   zaaier       zaaien: breedwerpig, de rechtervuist uit de zak in een wijde boog naar rechts voor hem uit, waar de
//                vingers opengaan en een waaiertje zaad even het licht vangt; de voeten blijven staan. staan: de vuist
//                in de zak. lopen: de zak op de heup, de rechterarm zwaait gewoon mee.
//   wieder       wieden: voorover gebukt, de schoffel (een plat, breed blad aan een zwanenhals) hakt voor zijn voeten in
//                de grond en trekt naar hem toe (het spel gebruikt het ook voor spitten en mest uitspreiden, dus het
//                leest als de grond omwerken). staan: leunend op de schoffel, zijn rustpoos tussen twee tegels. lopen:
//                de schoffel over de schouder.
//   sprokkelaar  een takkenbos met een touw erom op zijn rug, aan twee banden zoals het rek van de marskramer
//                (dorpelingen3.cjs). staan, lopen (de bundel deint mee), en rapen: door de knieën tot hij hurkt, een
//                tak oprapen, en hem over de schouder in de bundel steken, waar hij blijft.
//
// Dit bestand verandert niets aan dorpelingen.cjs, maaier.cjs of karakters.cjs: het gebruikt alleen wat die
// exporteren. Het lijf (werkBoer) is dat van boer() en maaier(): dezelfde benen met knieën, kiel en halsdoek, hetzelfde
// hoofd met strootje en strohoed. Staan en lopen zijn de houdingen van de boer zelf (houdingDorpeling, met zijn
// snelheid en fps, dus dezelfde pas en dezelfde `stap`). Het werk heeft een eigen houding in dezelfde vorm (zak, zij,
// voor, romp, nek, voet), zoals houdingMaaier, uit sleutelbeelden (langsSleutels). Een arm die iets vasthoudt, krijgt
// zijn elleboog met dezelfde IK als de maaier (HH.elleboog); een hand die opengaat, krijgt vingers (hand). Zijn armen
// zijn kort: een hand ligt nooit verder van de schouder dan de arm lang is, anders rekt de onderarm uit.
// Lokale assen zoals overal: x naar rechts van de figuur, y naar voren, z omhoog; de voeten op z = 0.
// Wegschrijven: node gereedschap/pixelart/werkfiguren-anim.cjs [zaaier wieder sprokkelaar].
'use strict';
const { sdf, klem, rnd } = require('./kern.cjs');
const { model, kegel, capsule, bol, ellips, bochtKegel, plus } = require('./figuren.cjs');
const { ring } = require('./figuren2.cjs');
const HH = require('./houding.cjs');
const KAR = require('./karakters.cjs');
const { profiel, schedel, romp, bottenDorpeling, beenPunten, voetBot, knieTussen, houdingDorpeling, rustDorpeling, BOER_SNELHEID, BOER_FPS } = require('./dorpelingen.cjs');

// hetzelfde oogmateriaal als dorpelingen.cjs en maaier.cjs (daar niet geëxporteerd, dus hier één regel gelijk)
const OOG = { ramp: 'inkt', lo: 0.6, hi: 1.4, detail: true, rand: 0, schaduw: false };

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

// Staan en lopen gaan zoals bij de boer zelf: dezelfde snelheid en fps, dus dezelfde pas (dorpelingen-anim.cjs rekent
// er `stap` mee uit, en werkfiguren-anim.cjs net zo).
const SNELHEID = BOER_SNELHEID;
const LOOP_FPS = BOER_FPS;
const gewoon = (stand) => houdingDorpeling(stand, { snelheid: SNELHEID, fps: LOOP_FPS, beenLengte: 24 });

// Per figuur zijn houdingen, allemaal een lus: hoeveel beelden en hoe snel. Staan en lopen zoals in
// dorpelingen-anim.cjs (vier beelden op 4, acht op 10); het werk zoals de maaier (twaalf op 8), en het rapen zestien,
// want bukken, rapen en de tak wegsteken is een langere beweging.
const HOUDINGEN = {
  zaaier: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, zaaien: { beelden: 12, fps: 8 } },
  wieder: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, wieden: { beelden: 12, fps: 8 } },
  sprokkelaar: { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: LOOP_FPS }, rapen: { beelden: 16, fps: 8 } },
};

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

// ---------------------------------------------------------------- het lijf

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
      const r = Math.hypot(x - H[0], y - H[1]);
      const s = z > H[2] + 7.2 ? Math.sin(z * 2.4) : Math.sin(r * 2.2);
      return s > 0.55 ? 0.6 : s < -0.7 ? -0.6 : 0;
    },
  };
  mat[M.lint] = { ramp: 'schors', lo: 0.6, hi: 3 };
  mat[M.doek] = { ramp: 'rood', lo: 2, hi: 6.4 };
  mat[M.hout] = { ramp: 'hout', lo: 1.6, hi: 6, patroon: (x, y, z) => (Math.sin(z * 1.3 + x * 0.7) > 0.86 ? -0.6 : 0) };
  mat[M.ijzer] = { ramp: 'ijzer', lo: 1.8, hi: 6.2, glans: 1.2, detail: true };
  mat[M.strootje] = { ramp: 'stro', lo: 4.2, hi: 6.6 };

  const delen = [];
  let vanaf = 0;
  const bot = (B) => {
    if (B) for (let i = vanaf; i < delen.length; i++) delen[i] = HH.beweegDeel(delen[i], B);
    vanaf = delen.length;
  };
  const Bn = bottenDorpeling(hg, { heup: HEUP, nek: NEK, schouders: SCHOUDERS });
  const ctx = { M, D, mat, delen, hg, Bn, bot, knie: [] };

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
  delen.push({
    f: (x, y, z) => Math.max(Math.abs(sdf.ellipsoide(x, y - 1.4, z - 60.4, 5.8, 5.4, 3)) - 0.9, Math.abs(z - 60.4) - 1.8),
    g: [0, 1.4, 60.4, 8],
    m: M.doek,
    deel: D.doek,
  });
  delen.push(bol([0.6, 7, 59.4], 1.6, M.doek, D.doek, 0.6));
  delen.push(kegel([0.6, 7.2, 58.8], [1.4, 8.4, 54.6], 1.8, 0.7, M.doek, D.doek));
  bot(Bn.Bromp);

  bouw(ctx);
  bot(null);

  // --- hoofd: lang gezicht, strootje, strohoed (zelfde als boer() en maaier())
  const oy = schedel(delen, H, M, D, { maat: [6.7, 6.7, 7.8], oog: [2.6, 0.8], oor: 1 });
  delen.push(ellips(plus(H, [0, 6.9, -1.4]), [1.7, 2.4, 2.6], M.huid, D.hoofd, 1));
  delen.push(bol(plus(H, [0, 8.2, -2.8]), 1.7, M.huid, D.hoofd, 1));
  for (const s of [-1, 1]) delen.push(ellips(plus(H, [s * 2.7, oy + 0.1, 2.6]), [2.1, 1, 0.9], M.haar, D.hoofd, 0.4));
  delen.push(ellips(plus(H, [0, -2, 0.4]), [7.1, 6.1, 6.8], M.haar, D.hoofd, 1));
  delen.push(capsule(plus(H, [1.4, 5.8, -4.3]), plus(H, [8.6, 8.4, -0.8]), 0.5, M.strootje, D.hoofd));
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
  bot(Bn.Bnek);

  return model(delen, mat, HH.omvat(delen, 2));
}

// Een arm van schouder Sn naar een hand op Hn, met de elleboog uit dezelfde IK als de maaier (HH.elleboog): de
// botlengtes en de kant waar de elleboog uitsteekt komen uit de hangende arm (HANGT[i]). In de rust (Sn en Hn die van
// HANGT) is het precies de hangende arm van boer(). De mouw en zijn zoom dragen hun rusthouding mee (`terug`), zodat de
// strepen van de kiel met de arm meegaan in plaats van erdoorheen. open: hoe ver de hand open is, van 0 (de vuist van
// de boer) tot 1 (de vingers gestrekt en gespreid: de worp van de zaaier), zie hand hieronder.
function arm(ctx, i, Sn, Hn, open = 0) {
  const { M, D, delen } = ctx;
  const [Sr, Er, Hr] = HANGT[i];
  const El = HH.elleboog(Sr, Er, Hr, Sn, Hn);
  const dArm = i ? D.armR : D.armL;
  const terug = HH.terugVan(HH.lidBeweging(Sr, Er, Sn, El));
  const mouw = kegel(Sn, El, 3.9, 3.4, M.kiel, dArm, 1.5);
  const zoom = ring(HH.tussen(Sn, El, 0.96), HH.eenheid(HH.af(El, Sn)), 3.4, 1, M.kiel, dArm);
  mouw.terug = terug;
  zoom.terug = terug;
  delen.push(mouw, zoom);
  const u = HH.eenheid(HH.af(Hn, El));
  delen.push(kegel(El, HH.plus(Hn, HH.keer(u, -2.8)), 3.1, 2.4, M.huid, dArm, 1));
  hand(ctx, i, Hn, u, open);
}
// Een hand op Hn, de onderarm langs u. Dicht (open 0) is het de vuist van de boer, een eivorm. Gaat hij open, dan wordt
// het een handpalm met vier vingers en een duim: de vingers komen uit de vuist omhoog (gekromd naar de palm toe) en
// strekken en spreiden zich tot een waaier als hij helemaal open is. De hand staat met zijn rug naar voren en omhoog,
// naar wie kijkt, zodat je de waaier van de vingers ziet en niet de dunne kant van een plank (Marcel, 5 okt: "een platte
// peddel zonder vingers").
const HAND = { palm: [1.9, 2.2, 1.15], vinger: [2.9, 3.4, 3.3, 2.6], tussen: 1.05, dik: 0.56, spreid: 19, krom: 95, duim: 2.4 };
function hand(ctx, i, Hn, u, open = 0) {
  const { M, D, delen } = ctx;
  const dHand = i ? D.handR : D.handL;
  if (open <= 0.2) {
    delen.push(ellips(Hn, [2.6, 2.8, 3.1], M.huid, dHand, 0.6));
    return;
  }
  const o = klem((open - 0.2) / 0.8, 0, 1);
  // de rug van de hand naar voren en omhoog (w), de vingers naast elkaar langs v
  const naar = [0, 0.55, 0.85];
  const w = HH.eenheid(HH.af(naar, HH.keer(u, HH.inwendig(naar, u))));
  const v = HH.kruis(w, u);
  const zij = i ? 1 : -1; // de duim aan de kant van het lijf
  delen.push(ellipsLangs(HH.plus(Hn, HH.keer(u, 0.4)), [u, v, w], HAND.palm, M.huid, dHand, 0.6));
  const krom = (HAND.krom * (1 - o) * Math.PI) / 180;
  HAND.vinger.forEach((lang, k) => {
    const s = ((k - 1.5) * HAND.spreid * o * Math.PI) / 180;
    const d0 = HH.plus(HH.keer(u, Math.cos(s)), HH.keer(v, Math.sin(s)));
    const d = HH.plus(HH.keer(d0, Math.cos(krom)), HH.keer(w, -Math.sin(krom))); // gekromd naar de palm
    const voet = HH.plus(HH.plus(Hn, HH.keer(u, 1.7)), HH.keer(v, (k - 1.5) * HAND.tussen * zij));
    delen.push(capsule(voet, HH.plus(voet, HH.keer(d, lang * (0.75 + 0.25 * o))), HAND.dik, M.huid, dHand));
  });
  // de duim: uit de muis van de hand, schuin opzij
  const voet = HH.plus(HH.plus(Hn, HH.keer(u, -0.2)), HH.keer(v, -1.7 * zij));
  const dd = HH.eenheid(HH.plus(HH.plus(HH.keer(u, 0.7), HH.keer(v, -0.75 * zij * (0.4 + 0.6 * o))), HH.keer(w, -0.35 * (1 - o))));
  delen.push(capsule(voet, HH.plus(voet, HH.keer(dd, HAND.duim)), HAND.dik + 0.08, M.huid, dHand));
}
// De hangende arm van de boer, die zwaait als hij loopt (Bn.Barm[i]), precies zoals in boer().
function hangendeArm(ctx, i) {
  arm(ctx, i, HANGT[i][0], HANGT[i][2]);
  ctx.bot(ctx.Bn.Barm[i]);
}

// ---------------------------------------------------------------- de zaaier

// De zaaidoek: een lap linnen over zijn linkerschouder, van achteren over de schouder naar voren, waar de onderkant
// een bolle zak vormt, vóór zijn linkerheup, met bovenin een mond vol zaad. Zijn linkerhand houdt de rand vast. Alles
// gaat met de romp mee (in de rusthouding van de romp, zoals de zeis van de maaier).
const ZAK = { midden: [-5, 11, 38.4], maat: [5.4, 4.6, 6.2] };
const ZAK_IN = [-4.8, 11.2, 42.6]; // waar de rechterhand een greep zaad neemt: de vuist in de zak
const ZAK_RAND = [-8.2, 14.2, 43.4]; // waar de linkerhand de rand vasthoudt
function zaaidoek(ctx) {
  const { delen } = ctx;
  const mDoek = KAR.materiaal(ctx, 'zaaidoek', { ramp: 'perkament', lo: 1.5, hi: 5.2, patroon: (x, y, z) => (Math.sin(x * 0.8 + z * 0.45) > 0.8 ? -0.8 : 0) });
  const mZaad = KAR.materiaal(ctx, 'zaad', { ramp: 'stro', lo: 3.6, hi: 6.6, patroon: (x, y, z) => (Math.sin(x * 3.1) * Math.sin(y * 2.9) > 0.45 ? -1 : 0) });
  const dDoek = KAR.deel(ctx, 'zaaidoek');
  const dZaad = KAR.deel(ctx, 'zaad');
  // de band: van halverwege de rug omhoog over de linkerschouder, en voorop omlaag naar de zak
  delen.push(...bochtKegel([-6.4, -6.2, 40], [-7.6, -6.6, 57], [-7.6, 0.2, 61.9], 1.9, 1.8, 5, mDoek, dDoek, 0.6));
  delen.push(...bochtKegel([-7.6, 0.2, 61.9], [-8, 9.2, 59.5], [-6.4, 10.4, 44.6], 1.8, 2.3, 5, mDoek, dDoek, 0.6));
  // de zak: bol en zwaar onderaan, de bovenkant open, met het zaad erin
  const [cx, cy, cz] = ZAK.midden;
  const [a, b, c] = ZAK.maat;
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
// de zak. Het lijf draait
// mee: naar links als de hand in de zak is, naar rechts aan het eind van de worp, met het gewicht erbij; de voeten
// blijven staan. De hand staat in de rusthouding van de romp (zoals de zeis van de maaier): de romp draait er nog
// overheen.
const ZAAIEN = {
  hand: [
    [0, ZAK_IN],
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
};
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
function handInWereld(t) {
  const Bn = bottenDorpeling(houdingZaaien(t), { heup: HEUP, nek: NEK, schouders: SCHOUDERS });
  return HH.opPunt(Bn.Bromp, langsSleutels(ZAAIEN.hand, t));
}
function zaad(ctx, fase) {
  const mKorrel = KAR.materiaal(ctx, 'korrel', { ramp: 'stro', lo: 4.4, hi: 6.8, detail: true, schaduw: false });
  const mLicht = KAR.materiaal(ctx, 'korrel in het licht', { ramp: 'perkament', lo: 4.8, hi: 6.9, detail: true, schaduw: false });
  const dKorrel = KAR.deel(ctx, 'korrel');
  for (let k = 0; k < KORRELS; k++) {
    const plek = k / (KORRELS - 1); // waar in de waaier
    const los = 0.42 + 0.14 * plek + 0.02 * (rnd(71, k, 1) - 0.5);
    const dt = fase - los;
    if (dt <= 0) continue;
    const p0 = handInWereld(los);
    const e = 0.01;
    const v = HH.keer(HH.af(handInWereld(los + e), handInWereld(los - e)), 1 / (2 * e));
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

// De zaaier. stand: { houding: 'staan' | 'lopen' | 'zaaien', fase }.
function zaaier(stand) {
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'zaaien' ? houdingZaaien(fase) : gewoon(stand);
  return werkBoer(hg, (ctx) => {
    const { Bn, bot } = ctx;
    zaaidoek(ctx);
    bot(Bn.Bromp);
    arm(ctx, 0, SCHOUDERS[0], ZAK_RAND);
    bot(Bn.Bromp);
    if (naam === 'lopen') hangendeArm(ctx, 1);
    else {
      const hand = naam === 'zaaien' ? langsSleutels(ZAAIEN.hand, fase) : ZAK_IN;
      const open = naam === 'zaaien' ? klem(stapsgewijs(ZAAIEN.open, fase), 0, 1) : 0;
      arm(ctx, 1, SCHOUDERS[1], hand, open);
      bot(Bn.Bromp);
    }
    if (naam === 'zaaien') {
      zaad(ctx, fase);
      bot(null);
    }
  });
}

// ---------------------------------------------------------------- de wieder

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
function houdingWieden(fase) {
  const h = rustDorpeling();
  h.romp.buig = langsSleutels(WIEDEN.buig, fase);
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
function losseGrond(ctx, fase, snede) {
  const mAarde = KAR.materiaal(ctx, 'aarde', { ramp: 'aarde', lo: 1.2, hi: 4.8, patroon: (x, y, z) => (Math.sin(x * 2.3 + y * 1.7) > 0.6 ? -0.8 : 0) });
  const dAarde = KAR.deel(ctx, 'aarde');
  const { delen } = ctx;
  if (fase > 0.22) {
    const groei = klem((fase - 0.22) / 0.14, 0, 1);
    const naarHem = HH.eenheid(HH.af(EIND_VAN_DE_HAAL, snede));
    const plek = fase < 0.58 ? HH.plus(snede, HH.keer(naarHem, 2.8)) : EIND_VAN_DE_HAAL;
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

// De wieder. stand: { houding: 'staan' | 'lopen' | 'wieden', fase }.
//   staan: hij leunt op zijn schoffel, die rechtop voor hem staat met het blad op de grond, de handen op elkaar op het
//          boveneind; hij ademt, de schoffel staat stil.
//   lopen: de schoffel over de rechterschouder, het blad achter hem; de rechterhand houdt de steel vóór de schouder,
//          de linkerarm zwaait mee. De schoffel gaat met de romp mee.
function wieder(stand) {
  const naam = stand.houding;
  const fase = stand.fase || 0;
  let hg;
  if (naam === 'wieden') hg = houdingWieden(fase);
  else {
    hg = gewoon(stand);
    if (naam === 'staan') hg.romp.buig += 5; // hij hangt een beetje op de steel
  }
  return werkBoer(hg, (ctx) => {
    const { Bn, bot } = ctx;
    const schouder = (i) => HH.opPunt(Bn.Bromp, SCHOUDERS[i]);
    if (naam === 'lopen') {
      // in de rusthouding van de romp: de steel rust op de rechterschouder, het boveneind voor hem, het blad achter
      const uh = HH.eenheid([0.03, 1, 0.03]);
      const s = schoffel(ctx, HH.plus([9.85, 12, 60.4], HH.keer(uh, -STEEL)), uh, [-1, 0, 0]);
      bot(Bn.Bromp);
      arm(ctx, 1, schouder(1), HH.opPunt(Bn.Bromp, HH.plus(s.bij(4.6), [0, 0, -1])));
      bot(null);
      hangendeArm(ctx, 0);
      return;
    }
    const s = naam === 'staan' ? schoffelTussen(ctx, [0.8, 11.4], [3.6, 17.4, 0]) : schoffelTussen(ctx, langsSleutels(WIEDEN.hand, fase), langsSleutels(WIEDEN.snede, fase));
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
    losseGrond(ctx, fase, s.snede);
    bot(null);
  });
}

// ---------------------------------------------------------------- de sprokkelaar

// Het takkenbos: een bundel takken op zijn rug, van de heupen tot boven de schouders, scheef (onderaan naar links,
// bovenaan naar rechts, waar zijn rechterhand er een tak bij steekt), met twee touwen erom en twee banden over de
// schouders naar voren, zoals het rek van de marskramer. De takken zijn dun en niet even lang, en waaieren naar de
// einden uit (de touwen knijpen de bundel in het midden samen); een paar hebben een zijtak, en bovenaan steken
// twijgen uit, achter en naast de rand van de hoed. In de rusthouding van de romp.
const BUNDEL = { onder: [-6, -11.4, 29], boven: [6.4, -14.2, 67], dik: 4.8 };
const TAKKEN = 18;
function takkenbos(ctx) {
  const { delen } = ctx;
  const mTak = [
    KAR.materiaal(ctx, 'tak', { ramp: 'schors', lo: 1.2, hi: 5.2 }),
    KAR.materiaal(ctx, 'tak2', { ramp: 'hout', lo: 1.2, hi: 5 }),
    KAR.materiaal(ctx, 'tak3', { ramp: 'schors', lo: 2, hi: 6.2 }),
  ];
  const mTouw = KAR.materiaal(ctx, 'touw', { ramp: 'riet', lo: 1.6, hi: 5.2, patroon: (x, y, z) => (Math.sin((x + y + z) * 2.2) > 0.5 ? -0.8 : 0) });
  const dBos = KAR.deel(ctx, 'takkenbos');
  const dTouw = KAR.deel(ctx, 'touw');
  const as = HH.af(BUNDEL.boven, BUNDEL.onder);
  const lang = HH.lengte(as);
  const u = HH.eenheid(as);
  const [v, w] = dwarsOp(u);
  // een punt in de bundel: t langs de as (0 onder, 1 boven), op hoek a en afstand r van de as
  const op = (t, a, r) => HH.plus(HH.plus(BUNDEL.onder, HH.keer(u, t * lang)), HH.plus(HH.keer(v, r * Math.cos(a)), HH.keer(w, r * Math.sin(a))));
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
  for (const s of [-1, 1]) {
    const achter = [s * 5.6, -8.2, 55 + 2 * s];
    delen.push(...bochtKegel(achter, [s * 7.6, -5.4, 62.6], [s * 7.6, 1.4, 61.2], 0.85, 0.85, 4, mTouw, dTouw, 0.5));
    delen.push(...bochtKegel([s * 7.6, 1.4, 61.2], [s * 7.8, 8.8, 58.6], [s * 7.2, 9, 44.5], 0.85, 0.85, 4, mTouw, dTouw, 0.5));
  }
}
// Waar de linkerhand de linkerband vasthoudt, op de borst.
const BAND_GREEP = [-6.4, 10.6, 50.6];

// Lopend deint de bundel mee: hij komt een fractie na het lijf omhoog en omlaag, en kantelt wat opzij, zoals het rek
// van de marskramer. Een beweging na de romp (Bn.Bromp), om de plek waar de banden over de schouders gaan.
function bundelDeint(Bn, stand) {
  if (stand.houding !== 'lopen') return Bn.Bromp;
  const f = stand.fase || 0;
  const om = [0, -8, 58];
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
// De tak gaat zo van de grond naar de hand en naar de bundel. Waar hij in de bundel belandt (TAK_IN_BUNDEL), zit altijd
// een tak (de vorige), zodat er aan het eind van de lus niets uit de bundel verdwijnt; alleen de nieuwe op de grond is
// er dan weer.
// De hand en de tak in de wereld, want de tak ligt op de grond. Van 0,72 tot 0,92 staat hij recht (de romp in rust),
// zodat de wereld en de rusthouding van de romp daar samenvallen en de tak precies in zijn plek in de bundel zakt.
const TAK_OP_GROND = { greep: [8.6, 14.8, 1.3], richting: HH.eenheid([0.5, 0.86, 0]), lang: 17 };
const TAK_IN_BUNDEL = { t: 1.06, hoek: 3.75, r: 4 }; // waar in de bundel (zie bundelPunt): de hand houdt het bovenste eind
const ZAKKEN = 3.5; // zo ver laat hij de tak in de bundel zakken
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
    [0.75, 'boven'], // boven de plek in de bundel (TAK_IN_BUNDEL, ZAKKEN hoger)
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
const GRIJP = 0.34; // vanaf hier is de tak in zijn hand
const LOS = 0.86; // en vanaf hier in de bundel
const OPRICHTEN = [0.6, 0.73]; // van hangen naar de richting van de bundel
function houdingRapen(fase) {
  const h = rustDorpeling();
  const sp = (rij) => stapsgewijs(rij, fase);
  h.zak = sp(RAPEN.zak);
  h.voor = sp(RAPEN.voor);
  h.romp.buig = sp(RAPEN.buig);
  h.romp.draai = sp(RAPEN.draai);
  h.nek.knik = sp(RAPEN.knik);
  h.nek.draai = sp(RAPEN.nekDraai);
  h.knieUit = sp(RAPEN.knieUit);
  return h;
}
// Een punt in de bundel, in de rusthouding van de romp: t langs de as (0 onder, 1 boven), op hoek a en afstand r van de
// as. De as en de twee richtingen dwars erop staan hier één keer.
const BUNDEL_AS = (() => {
  const as = HH.af(BUNDEL.boven, BUNDEL.onder);
  const u = HH.eenheid(as);
  return { lang: HH.lengte(as), u, dwars: dwarsOp(u) };
})();
function bundelPunt(t, a, r) {
  const { lang, u, dwars: [v, w] } = BUNDEL_AS;
  return HH.plus(HH.plus(BUNDEL.onder, HH.keer(u, t * lang)), HH.plus(HH.keer(v, r * Math.cos(a)), HH.keer(w, r * Math.sin(a))));
}
const IN_BUNDEL = bundelPunt(TAK_IN_BUNDEL.t, TAK_IN_BUNDEL.hoek, TAK_IN_BUNDEL.r);
const OMLAAG_IN_BUNDEL = HH.keer(BUNDEL_AS.u, -1);
// de hand van het rapen op fase t (in de wereld)
function rapenHand(t) {
  const punt = (w) => (w === 'boven' ? HH.plus(IN_BUNDEL, HH.keer(BUNDEL_AS.u, ZAKKEN)) : w === 'in' ? IN_BUNDEL : w);
  return langsSleutels(RAPEN.hand.map(([f, w]) => [f, punt(w)]), t);
}
// Waar de tak is op fase t: { van, r } (van het eind in zijn hand langs richting r), of null als hij in de bundel zit.
function takNu(t, hand) {
  if (t < GRIJP) return { van: TAK_OP_GROND.greep, r: TAK_OP_GROND.richting };
  if (t >= LOS) return null;
  const L = TAK_OP_GROND.lang;
  // het andere eind sleept over de grond, recht onder de hand weg, tot de tak aan zijn hand hangt
  const hoog = Math.max(0, hand[2] - 1);
  const over = Math.sqrt(Math.max(0, L * L - hoog * hoog));
  const ver = [hand[0] + TAK_OP_GROND.richting[0] * over, hand[1] + TAK_OP_GROND.richting[1] * over, 1];
  let r = HH.eenheid(HH.af(ver, hand));
  // en boven de schouder draait hij hem in de richting van de bundel
  const k = HH.soepel(klem((t - OPRICHTEN[0]) / (OPRICHTEN[1] - OPRICHTEN[0]), 0, 1));
  if (k > 0) r = HH.eenheid(HH.plus(HH.keer(r, 1 - k), HH.keer(OMLAAG_IN_BUNDEL, k)));
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

// De sprokkelaar. stand: { houding: 'staan' | 'lopen' | 'rapen', fase }. In alle drie het takkenbos op zijn rug, met de
// tak die hij er het laatst in stak, en zijn linkerhand aan de band (bij het rapen steunt hij er even mee op zijn knie);
// staand en lopend hangt zijn rechterarm zoals bij de boer (en zwaait hij mee).
function sprokkelaar(stand) {
  const naam = stand.houding;
  const fase = stand.fase || 0;
  const hg = naam === 'rapen' ? houdingRapen(fase) : gewoon(stand);
  return werkBoer(hg, (ctx) => {
    const { Bn, bot } = ctx;
    takkenbos(ctx);
    tak(ctx, IN_BUNDEL, OMLAAG_IN_BUNDEL, TAK_OP_GROND.lang);
    bot(bundelDeint(Bn, stand));
    if (naam !== 'rapen') {
      arm(ctx, 0, SCHOUDERS[0], BAND_GREEP);
      bot(Bn.Bromp);
      hangendeArm(ctx, 1);
      return;
    }
    // de linkerhand: van de band naar de knie, en terug
    const steun = stapsgewijs(RAPEN.steun, fase);
    const opKnie = HH.plus(ctx.knie[0], [0.6, 1.8, 3.4]);
    const links = HH.tussen(HH.opPunt(Bn.Bromp, BAND_GREEP), opKnie, steun);
    arm(ctx, 0, HH.opPunt(Bn.Bromp, SCHOUDERS[0]), links);
    bot(null);
    // de rechterhand, met de schouder wat naar voren als hij reikt
    const reik = stapsgewijs(RAPEN.reik, fase);
    const schouder = HH.opPunt(Bn.Bromp, HH.plus(SCHOUDERS[1], [0, reik, -0.5 * reik]));
    const hand = rapenHand(fase);
    arm(ctx, 1, schouder, hand, klem(stapsgewijs(RAPEN.open, fase), 0, 1));
    bot(null);
    const t = takNu(fase, hand);
    if (t) tak(ctx, t.van, t.r, TAK_OP_GROND.lang);
    bot(null);
  });
}

module.exports = {
  HOUDINGEN, SNELHEID, LOOP_FPS,
  zaaier, wieder, sprokkelaar,
  werkBoer, arm, hangendeArm, langsSleutels, stapsgewijs, schoffel, schoffelTussen, takkenbos,
  houdingZaaien, houdingWieden, houdingRapen, rapenHand, ZAAIEN, WIEDEN, RAPEN, GREEP_BOVEN, GREEP_ONDER, SCHOUDERS, HANGT,
};
