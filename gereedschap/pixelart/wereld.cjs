// Eén beeld van de hele wereld van Aardschok: het dorp linksonder, de beek met de brug en de
// watermolen, de kapel met het kerkhof, de bosrand met een wolf ertussen, en rechtsboven, apart,
// de krakkemikkige toren van de oude meester. Alles in hetzelfde late licht als het dorp: warme
// zon op de daken, diepe schaduw ernaast, en naar achteren toe nevel, zodat de rand van de grond
// wegvalt en het oog bij de toren uitkomt.
//
// De plaatsing gaat in schermtegels: u telt naar rechts (32 pixels per stap), d naar beneden de
// diepte in (16 pixels per stap). tg(u, d) rekent dat om naar de tegels van de wereld. Zo is de
// compositie te lezen als een tekening: alles met een kleine d staat achteraan.
'use strict';
const K = require('./kern.cjs');
const { TEGEL, PXH, klem } = K;
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const Bm = require('./bomen.cjs');
const Tn = require('./toren.cjs');
const V1 = require('./dorpelingen.cjs');
const V2 = require('./dorpelingen2.cjs');
const V3 = require('./dorpelingen3.cjs');
const Vij = require('./bosvijanden.cjs');

const BREED = 3200;
const HOOG = 1800;
const OX = 1700;
const OY = 560;

// de grondplaat in tegels: [gx0, gy0, gx1, gy1]. De twee achterranden (gx0 en gy0) lopen in het
// donker weg, de twee voorranden houden hun aardwal.
const GROND = [-44, -48, 68, 66];

// schermtegels naar wereldtegels en terug
const tg = (u, d) => [(d + u) / 2, (d - u) / 2];
const ud = (gx, gy) => [gx - gy, gx + gy];
// het anker van een gebouw van b × d tegels waarvan het midden op (u, d) moet komen
const anker = (u, d, b, h) => {
  const [gx, gy] = tg(u, d);
  return [gx - (b - 1) / 2, gy - (h - 1) / 2];
};

// ---------------------------------------------------------------- de plattegrond

// Alles staat hier in schermtegels (u, d), zodat de compositie te lezen is.
const PLEK = {
  toren: [30, 15],
  molen: [-36, 26],
  brug: [-2, 31],
  kapel: [-40, 6],
  kerkhof: [-46, 16],
  herberg: [-20, 44],
  huisA: [-36, 40],
  huisB: [-8, 40],
  huisC: [-30, 58],
  huisD: [-12, 58],
  huisE: [4, 50],
  smidse: [-2, 62],
  bakkerij: [-44, 48],
  oudstehuis: [-26, 70],
  kruidenhut: [12, 4],
  jagershut: [39, 40],
  plein: [-22, 54],
};

function wereld(o = {}) {
  const log = o.log || (() => {});
  const klok = (naam, f) => {
    const t0 = Date.now();
    const r = f();
    log(`${naam.padEnd(14)} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    return r;
  };
  const B = new K.Beeld(BREED, HOOG, OX, OY);

  // --- de grond: gras met het plein, de wegen, de akkers en de beek
  const [pgx, pgy] = tg(...PLEK.plein);
  const plein = { x0: pgx - 4, y0: pgy - 4, x1: pgx + 4, y1: pgy + 4, r: 1.4 };
  const [mgx] = tg(...PLEK.molen); // de beek loopt langs het rad van de molen
  const beek = [
    tg(-60, 2),
    tg(-50, 8),
    tg(-43, 14),
    [mgx + 3.3, tg(-43, 14)[1]], // een recht stuk langs y, met het rad van de molen erin
    [mgx + 3.3, tg(-30, 24)[1]],
    tg(-22, 27),
    tg(-12, 30),
    [tg(-12, 30)[0] + 9, tg(-12, 30)[1]], // een recht stuk langs x, waar de brug overheen gaat
    tg(22, 40),
    tg(40, 46),
    tg(60, 54),
  ];
  const wegen = [
    // van het plein naar de brug en verder omhoog naar de toren
    { punten: [tg(-24, 62), tg(-18, 54), tg(-9, 44), tg(-3.5, 34), tg(6, 27), tg(18, 21), tg(28, 17)], breed: 1.7 },
    // de laan door het dorp, langs de huizen naar de kapel en de molen
    { punten: [tg(-14, 58), tg(-26, 52), tg(-34, 45), tg(-38, 34), tg(-40, 22), tg(-41, 12)], breed: 1.4 },
    // een zijlaan die bij de smidse uitkomt
    { punten: [tg(-22, 56), tg(-12, 62), tg(-4, 64)], breed: 1.1 },
    // van de kapel naar het kerkhof
    { punten: [tg(-41, 10), tg(-45, 13), tg(-47, 17)], breed: 0.8, ruw: 0.6 },
    // het paadje naar de kruidenhut aan de bosrand
    { punten: [tg(-2, 30), tg(4, 18), tg(10, 8)], breed: 0.7, ruw: 0.6 },
    // een karrenspoor naar de akkers in het oosten
    { punten: [tg(-4, 66), tg(10, 62), tg(24, 58)], breed: 1 },
  ];
  const kaart = D.grondKaart({
    zaad: 9,
    pleinen: [plein],
    paden: wegen,
    beken: [{ punten: beek, breed: 1.7, diep: 7 }],
    akkers: [
      { ...akkerVak(14, 62, 6, 3.5), langs: 'x', stadium: 'rijp' },
      { ...akkerVak(26, 54, 5, 3), langs: 'y', stadium: 'jong' },
      { ...akkerVak(-44, 60, 5, 3), langs: 'x' },
      { ...akkerVak(-30, 18, 4, 2.5), langs: 'y', soort: 'bloemen' },
      { ...akkerVak(0, 56, 4, 2.5), langs: 'x', stadium: 'jong' },
    ],
  });
  const radPlek = [mgx + 3.3, tg(...PLEK.molen)[1] + 1.1];
  const grond = D.grondTex(kaart, { dor: true, schuim: [{ x: radPlek[0], y: radPlek[1], r: 34 }] });
  klok('grond', () => {
    K.tekenDozen(B, [K.doos(...GROND.slice(0, 2), ...GROND.slice(2), -18, 0, grond)]);
    D.waterDiepte(B, kaart);
  });

  // --- de gebouwen
  const gebouwen = [];
  const zet = (g) => {
    gebouwen.push(g);
    D.zetGebouw(B, g);
    return g;
  };
  const zetH = (u, d, zaad, maat, extra) => zet(D.dorpshuis(...anker(u, d, maat[0], maat[1]), zaad, { maat, ...extra }));
  klok('gebouwen', () => {
    zet(P.kerkhof(...anker(...PLEK.kerkhof, 6, 4), { b: 6, d: 4, poort: 0.6, rijen: 4, kol: 3, zaad: 17 }));
    zet(P.kapel(...anker(...PLEK.kapel, 5, 10)));
    zet(P.watermolen(...anker(...PLEK.molen, 6, 8), { radVlak: 'x', rook: true }));
    zet(P.brug(...tg(...PLEK.brug), { langs: 'y', lang: 2.5, breed: 0.9, waterH: 7 }));
    zet(D.herberg(...anker(...PLEK.herberg, 9, 7)));
    zetH(...PLEK.huisA, 4, [6, 8], { dak: 'pannen', muur: 'veldsteen' });
    zetH(...PLEK.huisB, 1, [5, 7]);
    zetH(...PLEK.huisC, 2, [6, 5], { dak: 'riet' });
    zetH(...PLEK.huisD, 5, [6, 9], { muur: 'blokhut' });
    zetH(...PLEK.huisE, 3, [5, 8]);
    zet(P.bakkerij(...anker(...PLEK.bakkerij, 8, 6)));
    zet(D.smidse(...anker(...PLEK.smidse, 7, 5)));
    zet(P.oudstehuis(...anker(...PLEK.oudstehuis, 7, 5)));
    zet(P.kruidenhut(...anker(...PLEK.kruidenhut, 6, 5)));
    zet(P.jagershut(...anker(...PLEK.jagershut, 7, 6)));
  });

  // --- de toren van de oude meester, aan het eind van de weg
  let torenR = null;
  if (o.toren !== false) klok('toren', () => {
    // De toren tekent zelf een schaduw op de grond; die slaan we over, want torenSchaduw()
    // hieronder doet hetzelfde en markeert de pixels ook als avondschaduw, zodat het gras
    // eronder koel wordt zoals bij de huizen.
    const [tgx, tgy] = tg(...PLEK.toren);
    torenR = Tn.tekenToren(B, o.staat || 'krakkemikkig', { gx: tgx, gy: tgy, schaduw: false }).R;
  });

  // --- het bos: langs de twee achterranden, met struiken en varens ervoor
  const bomen = [];
  const zetBoom = (naam, zaad, u, d, voet = 18, sterkte = 1.5) => {
    const [gx, gy] = tg(u, d);
    bomen.push({ ...Bm.zetBuiten(B, Bm[naam](zaad), gx, gy), voet, sterkte });
  };
  // Een boom op de rand van de grondplaat zelf, in tegels. Die rij maakt van de rechte rand van
  // het eiland een bosrand. Ze krijgen geen slagschaduw: daar is het toch al donker.
  const zetRandBoom = (naam, zaad, gx, gy) => Bm.zetBuiten(B, Bm[naam](zaad), gx, gy);
  if (o.bomen !== false) {
    klok('bomen', () => {
      // de bosrand die het dorp omsluit, van linksonder naar rechtsboven
      zetBoom('den', 1, -46, -2);
      zetBoom('eik', 1, -36, -8, 22);
      zetBoom('den', 2, -26, -12);
      zetBoom('berk', 2, -16, -8, 12);
      zetBoom('den', 3, -6, -14);
      zetBoom('eik', 2, 4, -10, 22);
      zetBoom('den', 4, 14, -16);
      zetBoom('berk', 1, 22, -10, 12);
      zetBoom('den', 5, 42, -6);
      zetBoom('eik', 3, 50, 2, 22);
      zetBoom('den', 6, 56, 12);
      zetBoom('dodeBoom', 1, -44, 20, 18);
      // een tweede rij dieper het bos in
      zetBoom('den', 7, -30, -26);
      zetBoom('eik', 4, -14, -28, 22);
      zetBoom('den', 8, 2, -26);
      zetBoom('den', 9, 20, -28);
      zetBoom('eik', 5, 36, -20, 22);
      zetBoom('den', 10, 50, -12);
      zetBoom('berk', 3, 60, 0, 12);
      zetBoom('den', 11, 64, 14);
      // nog een rij dieper, zodat de achtergrond bos is en geen weiland
      zetBoom('den', 12, -40, -20);
      zetBoom('den', 13, -22, -22);
      zetBoom('eik', 6, -4, -22, 22);
      zetBoom('den', 14, 12, -24);
      zetBoom('berk', 4, 28, -18, 12);
      zetBoom('den', 15, 44, -16);
      zetBoom('eik', 7, 58, -8, 22);
      zetBoom('den', 16, 66, 4);
    });
    klok('struiken', () => {
      const klein = [
        ['struik', 1, -40, 2], ['struik', 2, -22, -4], ['bessenStruik', 1, -2, -4],
        ['struik', 3, 16, -6], ['struik', 4, 34, 2], ['bessenStruik', 2, 48, 10],
        ['varen', 1, -32, -2], ['varen', 2, -10, -6], ['varen', 3, 26, -2],
        ['paddenstoelen', 1, -36, 4], ['paddenstoelen', 2, 8, -2],
        ['grasPol', 1, -18, 4], ['grasPol', 2, 40, 12], ['hoogGras', 1, 0, 6],
        ['rots', 1, 22, 12, 22], ['kleineRots', 2, 16, 14, 10], ['kleineRots', 3, 28, 8, 10],
        ['bloemen', 1, -30, 34], ['bloemen', 2, 8, 44], ['bloemen', 3, 36, 26],
        ['struik', 5, -44, 12], ['struik', 6, -20, -14], ['bessenStruik', 3, 30, -12],
        ['kleineRots', 4, 44, 20, 10], ['grasPol', 3, 52, 22], ['varen', 4, -28, 8],
        ['paddenstoelen', 3, -8, 8], ['hoogGras', 2, 44, 6], ['grasPol', 4, 12, 16],
        ['struik', 7, 20, 26], ['struik', 8, -12, 20], ['bessenStruik', 4, 34, 16],
        ['grasPol', 5, 4, 34], ['hoogGras', 3, -6, 22], ['bloemen', 4, 24, 34],
      ];
      for (const [naam, zaad, u, d, voet] of klein) zetBoom(naam, zaad, u, d, voet ?? 0, 1.1);
    });
  }

  // --- losse dingen in het dorp en op de erven
  klok('spullen', () => {
    const zetM = (model, u, d, richting = 'ZO', opt) => D.zetModel(B, model, ...tg(u, d), richting, opt);
    zetM(D.waterput(), -23, 53, 'ZO');
    zetM(D.marktkraam(), -28, 51, 'ZW');
    zetM(D.bankje(), -19, 56, 'ZO');
    zetM(D.lantaarnpaal(), -16, 52, 'Z');
    zetM(P.prikbord(5), -26, 57, 'ZW');
    zetM(D.wegwijzer({ pijlen: [-16, 90, 198] }), -6, 44, 'ZO');
    zetM(D.kar(), 6, 58, 'ZW');
    zetM(D.hooibaal(), 10, 56, 'ZO');
    zetM(D.hooibaal(), 12, 58, 'ZW');
    zetM(D.zakken(1), -40, 52, 'ZO');
    zetM(D.kolenhoop(1), -4, 66, 'ZO');
    zetM(D.zaagbok(1), -32, 46, 'ZW');
    zetM(D.houtstapel(1), -30, 44, 'ZO');
    zetM(D.houtstapel(4), -10, 64, 'ZO');
    zetM(D.mesthoop(1), -44, 40, 'ZO');
    zetM(D.mesthoop(3), 8, 48, 'ZO');
    zetM(D.afdak(2), -6, 36, 'ZO');
    zetM(D.kippenren(1), -16, 64, 'ZO');
    zetM(D.bijenkorf(1), 14, 8, 'ZO');
    zetM(D.bijenkorf(2), 16, 10, 'ZO');
    zetM(D.brandplek(1), -34, 64, 'ZO');
    // hekken en heggen langs de akkers en de lanen
    for (let i = 0; i < 6; i++) D.zetModel(B, D.heg(i + 1), ...tg(-34 + i, 50 + i), 'ZO');
    for (let i = 0; i < 5; i++) D.zetModel(B, D.hek('balken'), ...tg(6 + i * 2, 66 + i * 0.1), 'NO');
    for (let i = 0; i < 4; i++) D.zetModel(B, D.hek('latten'), ...tg(-48 + i * 2, 56 + i * 0.1), 'NO');
    for (let i = 0; i < 4; i++) D.zetModel(B, D.hek('balken'), ...tg(20 + i * 2, 54 + i * 0.1), 'NO');
  });

  // --- de mensen: elk op de plek waar hij hoort
  const mensen = [];
  if (o.mensen !== false) {
    klok('mensen', () => {
      const zetP = (model, u, d, richting = 'ZO') => {
        mensen.push(D.zetModel(B, model, ...tg(u, d), richting));
      };
      zetP(V1.smid(), -1, 66, 'ZW'); // bij de smidse
      zetP(V2.smidsvrouw(), 2, 64, 'Z');
      zetP(V3.bakker(), -40, 50, 'ZO'); // voor de bakkerij
      zetP(V1.herbergierster(), -18, 49, 'ZO'); // in de deur van de herberg
      zetP(V1.dorpsoudste(), -24, 73, 'ZO'); // bij haar huis
      zetP(V2.oudeMan(), -21, 74, 'ZW');
      zetP(V3.molenaar(), -33, 31, 'ZO'); // bij de molen
      zetP(V3.kruidenvrouw(), 13, 8, 'ZO'); // bij de kruidenhut
      zetP(V3.jager(), 37, 44, 'ZW'); // bij de jagershut
      zetP(V3.koster(), -38, 11, 'ZO'); // voor de deur van de kapel
      zetP(V1.boer(), 16, 64, 'ZW'); // op de akker
      zetP(V2.boerin(), 18, 62, 'Z');
      zetP(V2.jongen(), -19, 59, 'ZO'); // de kinderen op het plein
      zetP(V2.meisje(), -17, 57, 'ZW');
      zetP(V2.kleuter(), -21, 58, 'Z');
      zetP(V3.marskramer(), -26, 54, 'ZO');
      zetP(V3.wachter(), 0, 32, 'ZO'); // op de weg naar de brug
      // een paar gegenereerde dorpelingen onderweg
      zetP(V3.dorpeling(4), -30, 48, 'ZO');
      zetP(V3.dorpeling(11), -12, 50, 'ZW');
      zetP(V3.dorpeling(19), -36, 36, 'Z');
      // de wolf, half tussen de bomen
      zetP(Vij.wolf({}), -21, -6, 'ZO');
      // de tovenaar op de weg tussen het dorp en de toren
      zetP(F.tovenaar(o.leeftijd ?? 84, { houding: 'lopen', fase: 0.2 }), 10, 25, 'ZO');
    });
  }

  // --- begroeiing als lijst langs de randen van het beeld, zoals in het dorp
  klok('lijst', () => {
    const lijst = [
      ['struik', 11, -44, 74], ['varen', 11, -34, 78], ['struik', 12, -22, 80], ['hoogGras', 11, -10, 81],
      ['bessenStruik', 11, 2, 80], ['struik', 13, 14, 78], ['varen', 12, 26, 76], ['struik', 14, 38, 72],
      ['grasPol', 11, -47, 62], ['struik', 15, -48, 48], ['varen', 13, -47, 34],
      ['struik', 16, 50, 60], ['grasPol', 12, 52, 46], ['bessenStruik', 12, 49, 68],
      ['varen', 14, 46, 30], ['struik', 17, -46, 22],
    ];
    for (const [naam, zaad, u, d] of lijst) {
      if (!Bm[naam]) continue;
      const [gx, gy] = tg(u, d);
      K.tekenModel(B, Bm[naam](zaad), { gx, gy, richting: 'Z', z: 0 });
    }
  });

  // --- gras, schaduw en licht
  klok('gras', () => D.grasPollen(B, kaart, { dicht: 0.85 }));
  const vormen = gebouwen.flatMap((g) => g.vormen);
  klok('zonschaduw', () => {
    D.zonSchaduw(B, vormen, { zon: D.AVONDZON, kracht: 2.6 });
    D.voetSchaduw(B, gebouwen.filter((g) => g.hoog > 40));
    if (torenR) torenSchaduw(B, torenR, ...tg(...PLEK.toren));
  });
  if (bomen.length) klok('boomschaduw', () => {
    for (const b of bomen) Bm.slagschaduw(B, b.model, { gx: b.gx, gy: b.gy, obj: b.obj, voet: b.voet, sterkte: b.sterkte });
  });
  klok('licht', () => {
    // De avond komt uit het bos: hoe verder naar achteren, hoe minder licht er nog op de grond
    // valt, terwijl wat hoog staat (de toren, de kruinen) de laatste zon nog vangt. De laatste
    // tegels voor de rand van de grond lopen helemaal in het donker weg.
    K.belicht(B, {
      omgeving: (X, Y, Z) => {
        const gx = X / TEGEL;
        const gy = Y / TEGEL;
        const hoog = klem((Z * PXH - 30) / 220, 0, 1);
        const diep = klem((18 - (gx + gy)) / 44, 0, 1);
        const rand = 1 - Math.min(klem((gx - GROND[0]) / 8, 0, 1), klem((gy - GROND[1]) / 8, 0, 1));
        return 0.2 - diep * 1.1 * (1 - hoog * 0.55) - rand * rand * 2.8;
      },
    });
    D.avondlicht(B);
    K.verwarm(B, 1.8);
    // de verte wordt waziger: minder verschil tussen licht en donker, naar een middentoon toe
    D.nevel(B, { van: 30, tot: -34, mid: 3.3, sterkte: 0.55 });
    K.omlijn(B);
  });
  const plaat = K.Plaat.van(K.kwantiseer(B));
  // losse pixels uit het loof halen, maar de bewuste stipjes in het gras laten staan
  const masker = new Uint8Array(B.b * B.h);
  for (let i = 0; i < masker.length; i++) masker[i] = B.obj[i] > 0 ? 1 : 0;
  klok('ontspikkel', () => Bm.ontspikkel(plaat, undefined, masker));
  return plaat;
}

// De slagschaduw van de toren over het gras. De toren kan die zelf tekenen, maar dan blijft het
// gras eronder gewoon groen; hier zetten we er ook de vlag voor de avondschaduw bij, zodat
// avondlicht() het koel maakt zoals bij de huizen. Alleen de baan waar de schaduw kan vallen
// wordt afgelopen: de zon staat in (-0,3 0,6 0,74), dus de schaduw loopt per eenheid hoogte
// (+0,405 -0,811) de grond over.
function torenSchaduw(B, R, tgx, tgy) {
  const Tx = tgx * TEGEL;
  const Ty = tgy * TEGEL;
  const hx = 0.447;
  const hy = -0.895;
  for (let i = 0; i < B.b * B.h; i++) {
    if (!(B.vlag[i] & K.VLAG.VLOER) || B.obj[i] !== 0 || B.ramp[i] < 0) continue;
    const X = B.pos[i * 3];
    const Y = B.pos[i * 3 + 1];
    const dx = X - Tx;
    const dy = Y - Ty;
    const langs = dx * hx + dy * hy;
    const dwars = dx * hy - dy * hx;
    if (langs < -90 || langs > 1100 || Math.abs(dwars) > 140) continue;
    const zacht = R.zacht(X, Y, 0.3, 7);
    let donker = (1 - zacht) * 2;
    const d = R.f(X, Y, 3);
    if (d < 12) donker = Math.max(donker, (1 - d / 12) * 1.3);
    if (donker <= 0.02) continue;
    B.stap[i] -= donker;
    if (zacht < 0.5) {
      if (B.schaduw) B.schaduw[i] = 1;
      if (B.zon) B.zon[i] = 0;
    }
  }
}

// een akker van b × h tegels met het midden op schermtegel (u, d)
function akkerVak(u, d, b, h) {
  const [gx, gy] = tg(u, d);
  return { x0: gx - b / 2, y0: gy - h / 2, x1: gx + b / 2, y1: gy + h / 2 };
}

module.exports = { wereld, tg, ud, PLEK, BREED, HOOG, OX, OY };
