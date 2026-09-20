'use strict';
// Schrijft de plekken van het dorp weg op ware grootte (1 pixel = 1 pixel), in uit/dorp:
//   plekken.png             één plek per cel, alle cellen even groot, hetzelfde anker
//   plekken-voorwerpen.png  de losse dingen van die plekken, één per cel
//   water.png               stukjes water van 2 × 2 tegels (beek, oever, vijver)
//   water-golven.png        acht beeldjes van hetzelfde stukje beek, met de fase opgeschoven
//   dorp-proef2.png         de proef bij de beek
// Maten en ankers gaan naar de console en naar plekken-export.json.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const { apng } = require('./apng.cjs');

const UIT = path.join(__dirname, 'uit', 'dorp');
fs.mkdirSync(UIT, { recursive: true });
const schrijf = (naam, p, groot = 0) => {
  fs.writeFileSync(path.join(UIT, naam), K.png(p, 1));
  if (groot) fs.writeFileSync(path.join(UIT, naam.replace('.png', `-x${groot}.png`)), K.png(p, groot, '#2a2236'));
};
const verslag = {};
const tijd = (naam, f) => {
  const t0 = Date.now();
  const r = f();
  verslag[naam + 'Ms'] = Date.now() - t0;
  console.log(naam.padEnd(18), Date.now() - t0, 'ms');
  return r;
};

// ---------------------------------------------------------------- de plekken

// Een plek los renderen: eigen schaduw, avondlicht, omlijning. Het anker is het midden van de
// eerste tegel (gx, gy) op de grond.
function plekLos(maak, b, h, anker) {
  const B = new K.Beeld(b, h, anker[0], anker[1]);
  const g = maak();
  D.zetGebouw(B, g);
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.verwarm(B, 1.6);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
function maten(maak) {
  const B = new K.Beeld(760, 760, 380, 500);
  D.zetGebouw(B, maak());
  let x0 = 1e9;
  let x1 = -1;
  let y0 = 1e9;
  let y1 = -1;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0) continue;
    const x = i % B.b;
    const y = (i / B.b) | 0;
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { links: 380 - x0 + 1, rechts: x1 - 380 + 1, boven: 500 - y0 + 1, onder: y1 - 500 + 1 };
}
const plekken = [
  ['kapel', () => P.kapel(0, 0), '5×10'],
  ['kerkhof', () => P.kerkhof(0, 0, { b: 6, d: 4, rijen: 4, kol: 3 }), '6×4'],
  ['watermolen', () => P.watermolen(0, 0, { radVlak: 'y', rook: false }), '6×8'],
  ['bakkerij', () => P.bakkerij(0, 0, { rook: false }), '8×6'],
  ['kruidenhut', () => P.kruidenhut(0, 0, { rook: false }), '6×5'],
  ['jagershut', () => P.jagershut(0, 0, { rook: false }), '7×6'],
  ['oudstehuis', () => P.oudstehuis(0, 0, { rook: false }), '7×5'],
  ['brug', () => P.brug(0.5, 1, { langs: 'y', lang: 2.5, breed: 0.85 }), '0,85×2,5'],
  ['schuur', () => P.schuur(0, 0), '6×9'],
];
const m = plekken.map(([, maak]) => maten(maak));
const rand = 6;
const acht = (n) => Math.ceil(n / 8) * 8;
const links = Math.max(...m.map((a) => a.links)) + rand;
const rechts = Math.max(...m.map((a) => a.rechts)) + rand;
const boven = Math.max(...m.map((a) => a.boven)) + rand;
const onder = Math.max(...m.map((a) => a.onder)) + rand;
const CB = acht(links + rechts);
const CH = acht(boven + onder);
const anker = [links + Math.floor((CB - links - rechts) / 2), boven + (CH - boven - onder)];
const vel = new K.Plaat(CB * plekken.length, CH);
tijd('plekken', () => plekken.forEach(([, maak], i) => vel.plak(plekLos(maak, CB, CH, anker), i * CB, 0)));
schrijf('plekken.png', vel, 2);
const meetGebouw = (maak) => {
  const g = maak();
  const v = g.voet || [0, 0, 0, 0];
  return { voet: [+((v[2] - v[0]) / K.TEGEL).toFixed(2), +((v[3] - v[1]) / K.TEGEL).toFixed(2)], hoog: Math.round(g.hoog || 0) };
};
verslag.plekken = {
  cel: [CB, CH],
  anker,
  uitleg: 'één plek per cel, van links naar rechts. anker = het midden van tegel (gx, gy) op de grond: de eerste tegel van de plattegrond. voet = de plattegrond in tegels (b langs x, d langs y), hoog = de hoogte in pixels boven de grond.',
  volgorde: plekken.map(([n, , v]) => `${n} (${v})`),
  cellen: plekken.map(([n, maak, v], i) => ({ naam: n, cel: i, plattegrond: v, ...meetGebouw(maak) })),
};

// ---------------------------------------------------------------- de losse dingen

const VB = 152;
const VH = 172;
const vAnker = [VB / 2, VH - 34];
const dingen = [
  ['prikbord', P.prikbord(), 'ZW'],
  ['tombe', P.tombe(9), 'ZO'],
  ['grafsteen rond', P.grafsteen(1, { soort: 'rond' }), 'ZO'],
  ['grafsteen punt', P.grafsteen(8, { soort: 'punt', scheef: 11 }), 'ZO'],
  ['grafsteen ster', P.grafsteen(15, { soort: 'ster' }), 'ZO'],
  ['grafsteen zuil', P.grafsteen(22, { soort: 'zuil' }), 'ZO'],
  ['grafsteen plat', P.grafsteen(29, { soort: 'plat' }), 'ZO'],
  ['kerkhofhek', P.kerkhofhek({}), 'ZW'],
  ['molenrad', P.molenrad({ R: 30, breed: 15 }), 'ZO'],
  ['molensteen', P.molensteen(3), 'ZO'],
  ['ketel', P.ketel(1), 'ZO'],
  ['kruidenrek', P.kruidenrek(2), 'ZW'],
  ['gewei', P.gewei(1), 'ZW', 30],
  ['huidenrek', P.huidenrek(1), 'ZW'],
  ['broodplank', P.broodplank(), 'ZW', 20],
];
function dingLos(model, richting, z = 0) {
  const B = new K.Beeld(VB, VH, vAnker[0], vAnker[1]);
  D.zetModel(B, model, 0, 0, richting, { z: z / K.PXH });
  D.zonSchaduw(B, [], { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.verwarm(B, 1.6);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
const dingVel = new K.Plaat(VB * dingen.length, VH);
tijd('voorwerpen', () => dingen.forEach(([, model, r, z], i) => dingVel.plak(dingLos(model, r, z), i * VB, 0)));
schrijf('plekken-voorwerpen.png', dingVel, 2);
verslag.voorwerpen = {
  cel: [VB, VH],
  anker: vAnker,
  uitleg: 'één voorwerp per cel, van links naar rechts. anker = het midden van de tegel waarop het voorwerp staat. richting = de kant waarheen het kijkt.',
  volgorde: dingen.map(([n, , r]) => `${n} (${r})`),
  cellen: dingen.map(([n, , r], i) => ({ naam: n, cel: i, richting: r })),
};

// ---------------------------------------------------------------- water

const GB = 144;
const GH = 96;
function waterStuk(kaart, fase = 0) {
  const B = new K.Beeld(GB, GH, 72, 26);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 1.5, 1.5, -14, 0, D.grondTex(kaart, { fase }))]);
  D.waterDiepte(B, kaart);
  D.grasPollen(B, kaart);
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  return K.Plaat.van(K.kwantiseer(B));
}
const beekKaart = D.grondKaart({ beken: [{ punten: [[-3, 0.2], [4, 0.8]], breed: 1.5, diep: 7 }] });
const wateren = [
  ['beek', beekKaart],
  ['beek met oever', D.grondKaart({ beken: [{ punten: [[-3, -0.6], [4, 1.6]], breed: 1.1, diep: 7 }] })],
  ['vijver met lelies', D.grondKaart({ vijvers: [{ x: 0.5, y: 0.5, rx: 1.5, ry: 1.1, diep: 9 }] })],
];
const wVel = new K.Plaat(GB * wateren.length, GH);
tijd('water', () => wateren.forEach(([, kaart], i) => wVel.plak(waterStuk(kaart), i * GB, 0)));
schrijf('water.png', wVel, 3);
verslag.water = { cel: [GB, GH], anker: [72, 26], volgorde: wateren.map(([n]) => n), uitleg: 'tegels (0..1, 0..1), water ligt 7 (beek) of 9 (vijver) pixels onder het maaiveld' };

// acht beeldjes van dezelfde beek, met de fase opgeschoven: zo ziet stromend water eruit
tijd('golven', () => {
  const beeldjes = [];
  for (let i = 0; i < 8; i++) beeldjes.push(waterStuk(beekKaart, i / 8));
  fs.writeFileSync(path.join(UIT, 'water-golven.png'), apng(beeldjes, { fps: 8, schaal: 3, achtergrond: '#2a2236' }));
});

// ---------------------------------------------------------------- de proef bij de beek

const proef = tijd('beekProef', () => P.beekProef());
schrijf('dorp-proef2.png', proef, 2);

fs.writeFileSync(path.join(UIT, 'plekken-export.json'), JSON.stringify(verslag, null, 2) + '\n');
console.log(JSON.stringify(verslag, null, 2));
