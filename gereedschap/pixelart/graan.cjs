// Het korenveld: de akker in vijf stadia, en het graan zelf. Werklijst punt 1a (ontwerp/spel.md,
// "Het eerste proefje"): eerst als plaat beoordelen via graan-proef.cjs — nog niet in het spel,
// nog niet in beelden/.
//
// De bodem (ploegvoren, kiemende scheuten) hergebruikt akkerPixel gewoon, via de grondKaart en
// grondTex die dorp.cjs al exporteert: geploegd = geen stadium, kiemend = stadium 'jong'. Groen,
// rijp en gemaaid kent akkerPixel niet; die begroeiing komt bovenop de bodem als platte halmen,
// met dezelfde truc als de graspollen in dorp.cjs: rechtstreeks met Beeld.verf neergezet, na de
// vloer (en straks na de figuur) en dus zonder de belichting opnieuw te doen (VLAG.VAST slaat dat
// over) en zonder omlijning (VLAG.OMLIJN staat niet aan) — vlak geschaduwd, zoals gras en bloemen
// dat ook al zijn. Dat is expres: duizenden losse halmen als SDF-model (zoals grasPol in
// bomen.cjs) zijn traag om te renderen, een paar duizend losse pixels niet (zie de opdracht). Zo
// blijft alleen de schoof (een paar per tegel, geen duizenden) een echt model, met dezelfde
// bouwstenen als voorwerpen.cjs, en krijgt dus wél het gewone licht en de gewone omlijning.
'use strict';
const K = require('./kern.cjs');
const { klem, rnd, sdf, TEGEL } = K;
const { model, kegel } = require('./figuren.cjs');
const D = require('./dorp.cjs'); // grondKaart + grondTex: dezelfde ploegvoren als het dorp

// Hoogste punt van de begroeiing per stadium, in pixels boven de grond (bepaalt hoeveel lucht een
// plaat nodig heeft). geploegd en kiemend blijven vlak: dat doet akkerPixel al.
const MAX_HOOG = { geploegd: 2, kiemend: 4, groen: 24, rijp: 45, gemaaid: 40 };
// Het stadium dat akkerPixel (via dorp.cjs) al kent, als bodem onder de eigen begroeiing hieronder.
const BODEM_STADIUM = { geploegd: undefined, kiemend: 'jong', groen: undefined, rijp: 'rijp', gemaaid: undefined };

// ---------------------------------------------------------------- de schoof

// Een korenschoof: gebonden halmen die vanaf de voet iets uitwaaieren, met een band eromheen op
// zo'n 70% van de hoogte — dezelfde vorm als het uithangbord van de herberg tekent (dorp.cjs,
// teken === 'schoof', rond regel 2572), maar nu als eigen model met licht en omlijning, in plaats
// van een plat teken op een bord.
function schoof(zaad = 1) {
  const M = { stro: 0, band: 1 };
  const mat = [];
  mat[M.stro] = {
    ramp: 'stro',
    lo: 1.6,
    hi: 6.4,
    patroon: (x, y, z) => {
      const a = Math.atan2(y, x);
      const f = (a / (Math.PI * 2)) * 16 + z * 0.1;
      return f - Math.floor(f) < 0.1 ? -1.1 : 0;
    },
  };
  mat[M.band] = { ramp: 'schors', lo: 1, hi: 4.4 };
  const hoog = 34 + rnd(zaad, 1) * 10;
  const rOnder = 8 + rnd(zaad, 2) * 1.6;
  const rBoven = 2.2;
  const d = [kegel([0, 0, 0], [0, 0, hoog], rOnder, rBoven, M.stro, 1)];
  const bz = hoog * 0.7;
  const br = rOnder + (rBoven - rOnder) * 0.7 + 0.8;
  d.push({ f: (x, y, z) => sdf.torus(x, y, z - bz, br, 1.1), g: [0, 0, bz, br + 1.6], m: M.band, deel: 2 });
  return model(d, mat, { midden: [0, 0, hoog * 0.42], straal: hoog * 0.62 });
}

// ---------------------------------------------------------------- de bodem

// Eén akker van b × d tegels, met marge tegels gras eromheen (de rafelrand van grondKaart doet de
// rest). `stadium` is wat akkerPixel kent ('jong', 'rijp' of geen), als bodem onder de eigen
// begroeiing hieronder.
function bodemKaart(b, d, o = {}) {
  return D.grondKaart({
    zaad: o.zaad ?? 1,
    akkers: [{ x0: 0, y0: 0, x1: b, y1: d, langs: o.langs || 'x', stadium: o.stadium }],
  });
}

// Het schermgebied dat een veld van b × d tegels plus marge en de hoogste begroeiing nodig heeft,
// op dezelfde manier als schermKader (dorp.cjs) dat voor een 3D-vorm doet: de wereldhoeken naar
// het scherm, en dan de rand eromheen.
function veldAfmeting(b, d, marge, maxHoog, rand = 10) {
  const hoeken = [[-marge, -marge], [b + marge, -marge], [-marge, d + marge], [b + marge, d + marge]];
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [gx, gy] of hoeken) {
    const x = (gx - gy) * 32;
    const y = (gx + gy) * 16;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  minY -= maxHoog; // ruimte voor de hoogste halm, boven op de verste tegel
  const OX = Math.ceil(-minX + rand);
  const OY = Math.ceil(-minY + rand);
  const BREED = Math.ceil(maxX - minX + rand * 2);
  const HOOG = Math.ceil(maxY - minY + rand * 2);
  return { OX, OY, BREED, HOOG };
}

// ---------------------------------------------------------------- halmen

// Eén halm: van wortel (px, py, op het scherm) recht omhoog, met een kromming en een windzwaai
// die naar de top toe toenemen (de voet staat vast, net als bij een echte halm). `fase` is de
// stand in de zwaai-cyclus (elke volle 1.0 is één heen-en-weerzwaai). `toon` = [laag, hoog], de
// stap in de ramp van voet naar top.
function tekenHalm(B, px, py, o) {
  const stappen = Math.ceil(o.hoog);
  const wind = Math.sin(o.fase * Math.PI * 2) * o.zwaai;
  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen;
    const zij = (wind + o.kromming) * t * t;
    const x = Math.round(px + zij);
    const y = py - i;
    const breed = o.aar && t > 0.84 ? 2 : 1;
    const stap = klem(o.toon[0] + (o.toon[1] - o.toon[0]) * t + o.jitter, 0, 8);
    for (let w = 0; w < breed; w++) B.verf(x + w - (breed - 1) / 2, y, o.ramp, stap);
  }
}

// Een bloem tussen het graan: een groene steel en een gekleurd kopje (klaproos rood, korenbloem
// blauw via de ramp 'gewaad') — middeleeuws akkeronkruid, en het is meteen sfeer.
function tekenBloem(B, px, py, o) {
  const hoog = o.hoog * (0.55 + 0.2 * o.jitter);
  const stappen = Math.ceil(hoog);
  const wind = Math.sin(o.fase * Math.PI * 2) * o.zwaai * 0.7;
  let x = px;
  let y = py;
  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen;
    x = Math.round(px + wind * t * t);
    y = py - i;
    B.verf(x, y, 'gras', klem(1.5 + t, 0, 8));
  }
  const kop = [[0, 0], [1, 0], [-1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of kop) B.verf(x + dx, y - 1 + dy, o.kleur, dx === 0 && dy === 0 ? 2 : 4.5);
}

// Halmen (en hier en daar een bloem) over een akker van b × d tegels, van ver naar dichtbij
// getekend zodat ze elkaar natuurlijk overlappen (zoals rijen in een echt veld). Zonder `grens`
// komt alles in één laag; mét `grens` (de gx+gy van een figuur die erin staat) alleen de helft
// die verder weg ligt ('achter') of dichterbij ('voor'), zodat het spel later
// achterhelft → figuur → voorhelft kan tekenen. `golfA`/`golfB` schuiven de windfase op met de
// tegelplek (gx·golfA + gy·golfB): zo rolt de wind als een golf over een heel veld.
const HALM_STIJL = {
  groen: { ramp: 'gras', toon: [1.3, 4.6], aar: false, dicht: 7, kans: 0.85, bloemKans: 0, zwaai: 3 },
  rijp: { ramp: 'stro', toon: [1.6, 5.8], aar: true, dicht: 7, kans: 0.85, bloemKans: 1 / 55, zwaai: 5 },
};
function halmenOverAkker(B, b, d, stadium, o = {}) {
  const stijl = HALM_STIJL[stadium];
  if (!stijl) return;
  const hoog = MAX_HOOG[stadium];
  const dicht = stijl.dicht;
  const zaad = (o.zaad ?? 1) * 1000 + 1;
  const laag = o.laag ?? 'beide'; // 'achter', 'voor' of 'beide'
  const grens = o.grens;
  const golfA = o.golfA ?? 0;
  const golfB = o.golfB ?? 0;
  const punten = [];
  for (let iy = 0; iy < d * dicht; iy++) {
    for (let ix = 0; ix < b * dicht; ix++) {
      if (rnd(ix, iy, zaad) >= stijl.kans) continue;
      const gx = (ix + 0.5) / dicht + (rnd(ix, iy, zaad + 1) - 0.5) / dicht;
      const gy = (iy + 0.5) / dicht + (rnd(ix, iy, zaad + 2) - 0.5) / dicht;
      if (gx < 0 || gx > b || gy < 0 || gy > d) continue;
      const diepte = gx + gy;
      if (grens !== undefined) {
        if (laag === 'achter' && diepte > grens) continue;
        if (laag === 'voor' && diepte <= grens) continue;
      }
      punten.push([gx, gy, diepte, ix, iy]);
    }
  }
  punten.sort((p, q) => p[2] - q[2]); // ver naar dichtbij
  for (const [gx, gy, , ix, iy] of punten) {
    const [sx, sy] = K.naarScherm(B, gx * TEGEL, gy * TEGEL, 0);
    const jitter = rnd(ix, iy, zaad + 3) - 0.5;
    const fase = (o.fase ?? 0) + gx * golfA + gy * golfB + (rnd(ix, iy, zaad + 4) - 0.5) * 0.1;
    if (stijl.bloemKans && rnd(ix, iy, zaad + 5) < stijl.bloemKans) {
      tekenBloem(B, sx, sy, { hoog, jitter, fase, zwaai: stijl.zwaai, kleur: rnd(ix, iy, zaad + 6) < 0.5 ? 'rood' : 'gewaad' });
      continue;
    }
    tekenHalm(B, sx, sy, {
      hoog: hoog * (0.76 + 0.32 * rnd(ix, iy, zaad + 7)),
      ramp: stijl.ramp,
      toon: stijl.toon,
      aar: stijl.aar,
      jitter: jitter * 0.7,
      fase,
      zwaai: stijl.zwaai,
      kromming: jitter * 3,
    });
  }
}

// ---------------------------------------------------------------- gemaaid: stoppels en schoven

// Bleke, korte stoppels over de hele akker — wat er van de halm overblijft na het maaien.
function stoppelsOverAkker(B, b, d, o = {}) {
  const dicht = 9;
  const zaad = (o.zaad ?? 1) * 2000 + 3;
  for (let iy = 0; iy < d * dicht; iy++) {
    for (let ix = 0; ix < b * dicht; ix++) {
      if (rnd(ix, iy, zaad) >= 0.88) continue;
      const gx = (ix + 0.5) / dicht + (rnd(ix, iy, zaad + 1) - 0.5) / dicht;
      const gy = (iy + 0.5) / dicht + (rnd(ix, iy, zaad + 2) - 0.5) / dicht;
      if (gx < 0 || gx > b || gy < 0 || gy > d) continue;
      const [sx, sy] = K.naarScherm(B, gx * TEGEL, gy * TEGEL, 0);
      const hoog = 2 + Math.floor(rnd(ix, iy, zaad + 3) * 3);
      for (let i = 0; i < hoog; i++) B.verf(sx, sy - i, 'stro', klem(2 + i * 0.7, 0, 8));
    }
  }
}

// Een paar hokken (schoven tegen elkaar, zoals dat op het land staat) op vaste plekken in de akker.
function schovenOverAkker(B, b, d, o = {}) {
  const zaad = o.zaad ?? 1;
  const hokken = o.hokken || [[b * 0.3, d * 0.38], [b * 0.68, d * 0.64]];
  let n = 0;
  for (const [hx, hy] of hokken) {
    for (const [dx, dy, richting] of [[-2.4, 0, 25], [2.2, 0.6, 145], [0.1, 2.6, 265]]) {
      n += 1;
      K.tekenModel(B, schoof(zaad * 10 + n), { gx: hx + dx * 0.3, gy: hy + dy * 0.3, richting });
    }
  }
}

// ---------------------------------------------------------------- een heel veld

// Rendert één akker van b × d tegels op een grasrand: de bodem (ploegvoren via akkerPixel) en
// erop de eigen begroeiing van dit stadium. o.figuur = { model, gx, gy, richting } zet een
// 3D-model (bijv. de boer) er middenin, met de halmen om hem heen verdeeld over achter en voor.
function renderVeld(b, d, stadium, o = {}) {
  const marge = o.marge ?? 0.75;
  const figHoog = o.figuur ? 90 : 0;
  const maxHoog = Math.max(MAX_HOOG[stadium], figHoog);
  const { OX, OY, BREED, HOOG } = veldAfmeting(b, d, marge, maxHoog);
  const B = new K.Beeld(BREED, HOOG, OX, OY);
  const kaart = bodemKaart(b, d, { zaad: o.zaad, langs: o.langs, stadium: BODEM_STADIUM[stadium] });
  const grond = D.grondTex(kaart, {});
  K.tekenDozen(B, [K.doos(-marge, -marge, b + marge, d + marge, -4, 0, grond)]);

  const grens = o.figuur ? o.figuur.gx + o.figuur.gy : undefined;
  if (stadium === 'gemaaid') {
    stoppelsOverAkker(B, b, d, { zaad: o.zaad });
    schovenOverAkker(B, b, d, { zaad: o.zaad, hokken: o.hokken });
  } else {
    halmenOverAkker(B, b, d, stadium, {
      zaad: o.zaad,
      fase: o.fase,
      golfA: o.golfA,
      golfB: o.golfB,
      laag: grens !== undefined ? 'achter' : 'beide',
      grens,
    });
  }
  if (o.figuur) {
    K.tekenModel(B, o.figuur.model, { gx: o.figuur.gx, gy: o.figuur.gy, richting: o.figuur.richting || 'Z', z: 0 });
    if (stadium !== 'gemaaid') {
      halmenOverAkker(B, b, d, stadium, { zaad: o.zaad, fase: o.fase, golfA: o.golfA, golfB: o.golfB, laag: 'voor', grens });
    }
  }
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Eén tegel als twee losse, doorzichtige lagen (achter/voor) — voor het spel om ooit
// achterhelft → figuur → voorhelft te tekenen. Alleen zinvol voor groen en rijp; de andere
// stadia hebben geen hoogte om te splitsen.
function tegelLagen(stadium, o = {}) {
  const maxHoog = MAX_HOOG[stadium];
  const { OX, OY, BREED, HOOG } = veldAfmeting(1, 1, 0, maxHoog);
  const maken = (laag) => {
    const B = new K.Beeld(BREED, HOOG, OX, OY);
    halmenOverAkker(B, 1, 1, stadium, { zaad: o.zaad, fase: o.fase, golfA: o.golfA, golfB: o.golfB, laag, grens: 1 });
    return K.Plaat.van(K.kwantiseer(B));
  };
  return { achter: maken('achter'), voor: maken('voor') };
}

module.exports = {
  MAX_HOOG,
  BODEM_STADIUM,
  HALM_STIJL,
  schoof,
  bodemKaart,
  veldAfmeting,
  tekenHalm,
  tekenBloem,
  halmenOverAkker,
  stoppelsOverAkker,
  schovenOverAkker,
  renderVeld,
  tegelLagen,
};
