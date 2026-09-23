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
//
// Ronde 2 (23 sep): kiemend krijgt nu ook een eigen laag bovenop akkerPixel's bodem
// (kiemOverAkker) — akkerPixel's eigen stippels waren op gewone grootte niet van geploegd te
// onderscheiden. Groen is dichter en dikker, de schoof is een echte bundel geworden (geen gladde
// kegel meer), en halmenOverAkker/stoppelsOverAkker laten de akker rafelig in het gras uitlopen
// (randMarge) in plaats van in een strakke rechthoek.
'use strict';
const K = require('./kern.cjs');
const { klem, rnd, sdf, TEGEL, ruis2 } = K;
const { model, kegel, capsule, geschaald, gekanteld } = require('./figuren.cjs');
const D = require('./dorp.cjs'); // grondKaart + grondTex: dezelfde ploegvoren als het dorp

// Hoogste punt van de begroeiing per stadium, in pixels boven de grond (bepaalt hoeveel lucht een
// plaat nodig heeft). geploegd blijft vlak: dat doet akkerPixel al. kiemend en groen zijn in
// ronde 2 opgehoogd (zie kiemOverAkker en HALM_STIJL.groen), gemaaid vanwege de nieuwe schoof met
// zijn arenbossen die net iets boven de oude 40px uitkwamen.
const MAX_HOOG = { geploegd: 2, kiemend: 6, groen: 27, rijp: 45, gemaaid: 48 };
// Het stadium dat akkerPixel (via dorp.cjs) al kent, als bodem onder de eigen begroeiing hieronder.
const BODEM_STADIUM = { geploegd: undefined, kiemend: 'jong', groen: undefined, rijp: 'rijp', gemaaid: undefined };

// ---------------------------------------------------------------- de schoof

// Een korenschoof: een bundel bijeengebonden halmen, geen gladde kegel maar een profiel dat eerst
// iets uitspreidt (de gesneden stoppels onderaan), dan insnoert bij de band, en daarboven wéér
// opent naar de uitgewaaierde aren — met een paar losse arenbossen die opzij uitsteken, zodat de
// top niet zo glad is als de rest (ronde 2: hiervoor was dit één rechte kegel die als een pyloon
// las). Dezelfde vorm als het uithangbord van de herberg tekent (dorp.cjs, teken === 'schoof',
// rond regel 2572), maar nu als eigen model met licht en omlijning, in plaats van een plat teken
// op een bord. Blijft zelf rechtop: schovenOverAkker zet 'm schuin via `gekanteld`/`geschaald`
// uit figuren.cjs, zodat deze functie op `zaad` blijft werken zoals ze al aangeroepen wordt.
function schoof(zaad = 1) {
  const M = { stro: 0, band: 1, aar: 2 };
  const mat = [];
  const gestreept = (x, y, z) => {
    const a = Math.atan2(y, x);
    const f = (a / (Math.PI * 2)) * 14 + z * 0.08;
    return f - Math.floor(f) < 0.12 ? -1.1 : 0;
  };
  mat[M.stro] = { ramp: 'stro', lo: 1.6, hi: 6.0, patroon: gestreept };
  mat[M.band] = { ramp: 'schors', lo: 1, hi: 4.4 };
  mat[M.aar] = { ramp: 'stro', lo: 3.2, hi: 7.2, patroon: gestreept }; // de aren: lichter, gouder

  const hoog = 34 + rnd(zaad, 1) * 12;
  const rFlare = 9.6 + rnd(zaad, 2) * 1.8; // de gesneden stoppels, iets uitgespreid
  const rOnder = rFlare - 1.2;
  const rWaist = 2.3 + rnd(zaad, 8) * 0.7; // de insnoering bij de band: nu een echte taille
  const rTop = 4.3 + rnd(zaad, 9) * 1.1; // de aren waaieren weer iets open boven de band
  const flareTop = hoog * 0.09;
  const bz = hoog * (0.67 + rnd(zaad, 10) * 0.07); // bandhoogte: hoog, zodat de waaier kort blijft
  const tipZ = hoog * 1.03;

  const d = [
    kegel([0, 0, 0], [0, 0, flareTop], rFlare, rOnder, M.stro, 1),
    kegel([0, 0, flareTop], [0, 0, bz], rOnder, rWaist, M.stro, 1),
    kegel([0, 0, bz], [0, 0, hoog], rWaist, rTop, M.stro, 1),
    kegel([0, 0, hoog], [0, 0, tipZ], rTop, 0.8, M.stro, 1),
  ];
  const br = rWaist + 1.1;
  d.push({ f: (x, y, z) => sdf.torus(x, y, z - bz, br, 1.15), g: [0, 0, bz, br + 1.6], m: M.band, deel: 2 });

  // veel dunne, korte arensprietjes vlak bij de top, als een borstelige rand in plaats van een
  // paar dikke hoorns (die eerste poging leek op geitenoren): kort, dun, en vooral omhoog met maar
  // een klein beetje naar buiten.
  const AREN = 10;
  for (let i = 0; i < AREN; i++) {
    const hoek = (i / AREN) * Math.PI * 2 + rnd(zaad, 20 + i) * 1.2;
    const z0 = hoog * (0.89 + rnd(zaad, 30 + i) * 0.08);
    const r0 = rTop * (0.45 + rnd(zaad, 40 + i) * 0.25);
    const lengte = hoog * (0.07 + rnd(zaad, 50 + i) * 0.06);
    const buiten = 0.3 + rnd(zaad, 60 + i) * 0.3;
    const a = [Math.cos(hoek) * r0, Math.sin(hoek) * r0, z0];
    const b = [Math.cos(hoek) * (r0 + lengte * buiten), Math.sin(hoek) * (r0 + lengte * buiten), z0 + lengte * (1 - buiten * 0.3)];
    d.push(capsule(a, b, 0.85, M.aar, 3 + i));
  }

  return model(d, mat, { midden: [0, 0, hoog * 0.42], straal: hoog * 0.8 });
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

// ---------------------------------------------------------------- rafelrand

// Hoeveel 'randsterkte' een punt op (gx, gy) heeft: 1 (of meer) = ruim binnen de akker
// (ongewijzigd), aflopend via 0 bij de rand tot -0.6 net erbuiten, met een trage ruis erin zodat
// de rand in plukken kartelt in plaats van gelijkmatig te vervagen; nog verder erbuiten (-1)
// betekent altijd overslaan. Bewust niet naar 0 geklemd: zo tellen de aanroepers (kans en hoogte
// zijn allebei lineair in randT) vanzelf af naar niets tegen de overslaggrens, in plaats van een
// even brede strook halmen vlak buiten de akker neer te zetten. Zonder marge (0, de oude situatie)
// blijft de rand strak — zo roept `tegelLagen` aan, want een losse tegel moet naadloos op zijn
// buren aansluiten.
function randSterkte(gx, gy, b, d, zaad, marge) {
  if (!marge) return 1;
  const afst = Math.min(gx, b - gx, gy, d - gy) + (ruis2(gx * 1.7 + 11, gy * 1.7, zaad) - 0.5) * marge * 1.5;
  if (afst < -marge * 0.6) return -1;
  return Math.min(afst / marge, 1); // wél een bovengrens: ruim binnen de akker blijft alles op volle sterkte
}

// ---------------------------------------------------------------- kiemend: scheuten in rijen

// AKKER_RIJ is dezelfde constante als in dorp.cjs (akkerPixel): de rijen scheuten vallen zo op de
// ruggen die de bodemtextuur daar al tekent, in plaats van er los overheen te liggen. Een eigen,
// dichtere laag bovenop akkerPixel's eigen (spaarzame) stippels — die alleen waren op gewone
// grootte niet van geploegd te onderscheiden.
const AKKER_RIJ = 0.24;
function kiemOverAkker(B, b, d, langs, o = {}) {
  const dicht = 11;
  const zaad = (o.zaad ?? 1) * 3000 + 5;
  const marge = o.randMarge ?? 0;
  for (let iy = 0; iy < d * dicht; iy++) {
    for (let ix = 0; ix < b * dicht; ix++) {
      const gx = (ix + 0.5) / dicht + (rnd(ix, iy, zaad) - 0.5) / dicht;
      const gy = (iy + 0.5) / dicht + (rnd(ix, iy, zaad + 1) - 0.5) / dicht;
      if (gx < 0 || gx > b || gy < 0 || gy > d) continue;
      const randT = randSterkte(gx, gy, b, d, zaad + 200, marge);
      if (randT < 0) continue;
      const dwars = (langs === 'y' ? gx : gy) / AKKER_RIJ;
      const fr = dwars - Math.floor(dwars);
      if (fr < 0.3 || fr > 0.72) continue; // in de voor: kaal
      if (rnd(ix, iy, zaad + 2) >= 0.62 * (0.3 + 0.7 * randT)) continue; // waas, geen tapijt
      const [sx, sy] = K.naarScherm(B, gx * TEGEL, gy * TEGEL, 0);
      const hoog = (1 + Math.floor(rnd(ix, iy, zaad + 3) * 3)) * (0.5 + 0.5 * randT);
      const stappen = Math.max(1, Math.round(hoog));
      const toon = 2.2 + rnd(ix, iy, zaad + 4) * 2;
      for (let i = 0; i < stappen; i++) B.verf(sx, sy - i, 'gras', klem(toon - i * 0.6, 0, 8));
    }
  }
}

// ---------------------------------------------------------------- halmen

// Eén halm: van wortel (px, py, op het scherm) recht omhoog, met een kromming en een windzwaai
// die naar de top toe toenemen (de voet staat vast, net als bij een echte halm). `fase` is de
// stand in de zwaai-cyclus (elke volle 1.0 is één heen-en-weerzwaai). `toon` = [laag, hoog], de
// stap in de ramp van voet naar top. `dikte` (ronde 2, standaard 1) is de breedte aan de voet in
// pixels; hij loopt af naar 1 pixel bij de top, voor een voller blad zonder duizend extra halmen.
function tekenHalm(B, px, py, o) {
  const stappen = Math.ceil(o.hoog);
  const wind = Math.sin(o.fase * Math.PI * 2) * o.zwaai;
  const dikte = o.dikte ?? 1;
  for (let i = 0; i <= stappen; i++) {
    const t = i / stappen;
    const zij = (wind + o.kromming) * t * t;
    const x = Math.round(px + zij);
    const y = py - i;
    const breed = o.aar && t > 0.84 ? 2 : Math.max(1, Math.round(dikte - (dikte - 1) * t));
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
// tegelplek (gx·golfA + gy·golfB): zo rolt de wind als een golf over een heel veld. `randMarge`
// (ronde 2, tegels) laat de akker rafelig in het gras uitlopen: lager, dunner en spaarzamer vlak
// bij de rand, af en toe een sprietje dat als gras leest en de akker in kruipt, en een enkele halm
// die net over de rand heen staat. Zonder marge (0, de oude situatie) blijft de rand strak —
// `tegelLagen` roept zo aan, voor een tegel die naadloos op zijn buren moet aansluiten.
const HALM_STIJL = {
  // dichter, frisser en iets dikkere halmen (ronde 2): te dun las als losse sprieten onkruid in
  // plaats van een kniehoog veld. Dezelfde wind (zwaai) als voorheen.
  groen: { ramp: 'gras', toon: [1.6, 5.4], aar: false, dicht: 10, kans: 0.92, dikte: 2, bloemKans: 0, zwaai: 3 },
  // het rijpe graan zelf ongemoeid; alleen iets vaker een bloem (ronde 2), zodat er op elke plaat
  // wel een klaproos of korenbloem staat zonder dat het een bloemenveld wordt.
  rijp: { ramp: 'stro', toon: [1.6, 5.8], aar: true, dicht: 7, kans: 0.85, bloemKans: 1 / 25, zwaai: 5 },
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
  const marge = o.randMarge ?? 0;
  // met een rafelrand steekt de bemonstering marge tegels buiten [0,b]×[0,d] uit, anders kan een
  // halm nooit over de oude, strakke rand heen staan — alleen dunner worden ernaartoe.
  const over = marge > 0 ? Math.ceil(marge * dicht) : 0;
  const punten = [];
  for (let iy = -over; iy < d * dicht + over; iy++) {
    for (let ix = -over; ix < b * dicht + over; ix++) {
      if (rnd(ix, iy, zaad) >= stijl.kans) continue;
      const gx = (ix + 0.5) / dicht + (rnd(ix, iy, zaad + 1) - 0.5) / dicht;
      const gy = (iy + 0.5) / dicht + (rnd(ix, iy, zaad + 2) - 0.5) / dicht;
      let randT = 1;
      if (marge > 0) {
        randT = randSterkte(gx, gy, b, d, zaad + 90, marge);
        if (randT < 0) continue;
        if (randT < 1 && rnd(ix, iy, zaad + 91) > 0.25 + 0.75 * randT) continue;
      } else if (gx < 0 || gx > b || gy < 0 || gy > d) continue;
      const diepte = gx + gy;
      if (grens !== undefined) {
        if (laag === 'achter' && diepte > grens) continue;
        if (laag === 'voor' && diepte <= grens) continue;
      }
      punten.push([gx, gy, diepte, ix, iy, randT]);
    }
  }
  punten.sort((p, q) => p[2] - q[2]); // ver naar dichtbij
  for (const [gx, gy, , ix, iy, randT] of punten) {
    const [sx, sy] = K.naarScherm(B, gx * TEGEL, gy * TEGEL, 0);
    const jitter = rnd(ix, iy, zaad + 3) - 0.5;
    const fase = (o.fase ?? 0) + gx * golfA + gy * golfB + (rnd(ix, iy, zaad + 4) - 0.5) * 0.1;
    // vlak bij de rand kruipt er soms een pluk gras de akker in, in plaats van het gewas zelf
    const grasKruip = randT < 1 && rnd(ix, iy, zaad + 92) < (1 - randT) * 0.55;
    if (!grasKruip && stijl.bloemKans && rnd(ix, iy, zaad + 5) < stijl.bloemKans) {
      tekenBloem(B, sx, sy, { hoog: hoog * (0.6 + 0.4 * randT), jitter, fase, zwaai: stijl.zwaai, kleur: rnd(ix, iy, zaad + 6) < 0.5 ? 'rood' : 'gewaad' });
      continue;
    }
    const schaal = Math.max(0.18, 0.4 + 0.6 * randT);
    tekenHalm(B, sx, sy, {
      hoog: hoog * schaal * (0.76 + 0.32 * rnd(ix, iy, zaad + 7)),
      ramp: grasKruip ? 'gras' : stijl.ramp,
      toon: grasKruip ? [1.2, 4.0] : stijl.toon,
      aar: grasKruip ? false : stijl.aar,
      dikte: grasKruip ? 1 : stijl.dikte,
      jitter: jitter * 0.7,
      fase,
      zwaai: grasKruip ? stijl.zwaai * 0.6 : stijl.zwaai,
      kromming: jitter * 3,
    });
  }
}

// ---------------------------------------------------------------- gemaaid: stoppels en schoven

// Bleke, korte stoppels over de hele akker — wat er van de halm overblijft na het maaien. Ook
// hier rafelt de rand mee (randMarge, ronde 2): korter en spaarzamer vlak bij het gras.
function stoppelsOverAkker(B, b, d, o = {}) {
  const dicht = 9;
  const zaad = (o.zaad ?? 1) * 2000 + 3;
  const marge = o.randMarge ?? 0;
  for (let iy = 0; iy < d * dicht; iy++) {
    for (let ix = 0; ix < b * dicht; ix++) {
      if (rnd(ix, iy, zaad) >= 0.88) continue;
      const gx = (ix + 0.5) / dicht + (rnd(ix, iy, zaad + 1) - 0.5) / dicht;
      const gy = (iy + 0.5) / dicht + (rnd(ix, iy, zaad + 2) - 0.5) / dicht;
      if (gx < 0 || gx > b || gy < 0 || gy > d) continue;
      const randT = marge > 0 ? randSterkte(gx, gy, b, d, zaad + 300, marge) : 1;
      if (randT < 0) continue;
      if (randT < 1 && rnd(ix, iy, zaad + 301) > 0.3 + 0.7 * randT) continue;
      const [sx, sy] = K.naarScherm(B, gx * TEGEL, gy * TEGEL, 0);
      const hoog = Math.max(1, Math.round((2 + Math.floor(rnd(ix, iy, zaad + 3) * 3)) * (0.5 + 0.5 * randT)));
      for (let i = 0; i < hoog; i++) B.verf(sx, sy - i, 'stro', klem(2 + i * 0.7, 0, 8));
    }
  }
}

// Een paar hokken op vaste plekken in de akker: per hok zes à acht schoven schuin tegen elkaar,
// als een tentje (ronde 2 — hiervoor stonden ze rechtop naast elkaar en leken op een rijtje
// pylonen). Elke schoof leunt naar het midden van zijn hok toe (`gekanteld` uit figuren.cjs, om
// een as dwars op de straal) en krijgt een eigen maat (`geschaald`) en een kleine eigen draai, voor
// wat verschil in stand en maat tussen de schoven.
function schovenOverAkker(B, b, d, o = {}) {
  const zaad = o.zaad ?? 1;
  const hokken = o.hokken || [[b * 0.3, d * 0.38], [b * 0.68, d * 0.64]];
  const AANTAL = 7;
  let n = 0;
  for (const [hx, hy] of hokken) {
    for (let i = 0; i < AANTAL; i++) {
      n += 1;
      const zi = zaad * 100 + n;
      const hoek = (i / AANTAL) * Math.PI * 2 + (rnd(zi, 1) - 0.5) * 0.7;
      const straalHok = 0.4 + rnd(zi, 2) * 0.24;
      const gx = hx + Math.cos(hoek) * straalHok;
      const gy = hy + Math.sin(hoek) * straalHok;
      const schaal = 0.8 + rnd(zi, 3) * 0.4;
      const leunGraden = 8 + rnd(zi, 4) * 10;
      const as = [Math.sin(hoek), -Math.cos(hoek), 0]; // dwars op de straal: leunt naar het midden
      let mdl = geschaald(schoof(zi), schaal);
      const pivotAfst = Math.hypot(...mdl.midden);
      mdl = gekanteld(mdl, as, leunGraden, [0, 0, 0]);
      mdl.straal += 2 * pivotAfst * Math.sin((leunGraden * Math.PI) / 360); // dekt de leun af, zie schoof()
      K.tekenModel(B, mdl, { gx, gy, richting: rnd(zi, 5) * 360 });
    }
  }
}

// ---------------------------------------------------------------- een heel veld

// Rendert één akker van b × d tegels op een grasrand: de bodem (ploegvoren via akkerPixel) en
// erop de eigen begroeiing van dit stadium. o.figuur = { model, gx, gy, richting } zet een
// 3D-model (bijv. de boer) er middenin, met de halmen om hem heen verdeeld over achter en voor.
function renderVeld(b, d, stadium, o = {}) {
  const marge = o.marge ?? 0.75;
  const langs = o.langs || 'x';
  const randMarge = o.randMarge ?? 0.6; // rafelrand (ronde 2); o.randMarge: 0 zet 'm weer strak
  const figHoog = o.figuur ? 90 : 0;
  const maxHoog = Math.max(MAX_HOOG[stadium], figHoog);
  const { OX, OY, BREED, HOOG } = veldAfmeting(b, d, marge, maxHoog);
  const B = new K.Beeld(BREED, HOOG, OX, OY);
  const kaart = bodemKaart(b, d, { zaad: o.zaad, langs, stadium: BODEM_STADIUM[stadium] });
  const grond = D.grondTex(kaart, {});
  K.tekenDozen(B, [K.doos(-marge, -marge, b + marge, d + marge, -4, 0, grond)]);

  const grens = o.figuur ? o.figuur.gx + o.figuur.gy : undefined;
  if (stadium === 'gemaaid') {
    stoppelsOverAkker(B, b, d, { zaad: o.zaad, randMarge });
    schovenOverAkker(B, b, d, { zaad: o.zaad, hokken: o.hokken });
  } else if (stadium === 'kiemend') {
    kiemOverAkker(B, b, d, langs, { zaad: o.zaad, randMarge });
  } else {
    halmenOverAkker(B, b, d, stadium, {
      zaad: o.zaad,
      fase: o.fase,
      golfA: o.golfA,
      golfB: o.golfB,
      laag: grens !== undefined ? 'achter' : 'beide',
      grens,
      randMarge,
    });
  }
  if (o.figuur) {
    K.tekenModel(B, o.figuur.model, { gx: o.figuur.gx, gy: o.figuur.gy, richting: o.figuur.richting || 'Z', z: 0 });
    if (stadium !== 'gemaaid' && stadium !== 'kiemend') {
      halmenOverAkker(B, b, d, stadium, { zaad: o.zaad, fase: o.fase, golfA: o.golfA, golfB: o.golfB, laag: 'voor', grens, randMarge });
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
  kiemOverAkker,
  halmenOverAkker,
  stoppelsOverAkker,
  schovenOverAkker,
  renderVeld,
  tegelLagen,
};
