'use strict';
// Schrijft de pixel art van het dorp weg op ware grootte (1 pixel = 1 pixel), in uit/dorp:
//   huizen.png           één gebouw per cel, alle cellen even groot, met hetzelfde anker
//   dorp-voorwerpen.png  de voorwerpen van het dorp, één per cel
//   grond.png            stukjes grond van 2 × 2 tegels
//   dorp-proef.png       het dorpsplein
// en daarnaast vergrote versies (…-x3.png) op een donkere achtergrond, om te bekijken.
// De maten en ankers gaan naar de console en naar dorp-export.json.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const VW = require('./voorwerpen.cjs');
const D = require('./dorp.cjs');

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
  console.log(naam.padEnd(16), Date.now() - t0, 'ms');
  return r;
};

// ---------------------------------------------------------------- huizen

// Een gebouw los renderen, zonder grond: met zijn eigen schaduw (de dakrand op de muur, de
// schoorsteen op het dak), het avondlicht en de omlijning. Het anker is het midden van de
// eerste tegel van het gebouw (gx, gy) op de grond.
function gebouwLos(maak, b, h, anker) {
  const B = new K.Beeld(b, h, anker[0], anker[1]);
  const g = maak();
  D.zetGebouw(B, g);
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
function maten(maak) {
  const B = new K.Beeld(700, 700, 350, 450);
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
  // één pixel extra rondom voor de omlijning
  return { links: 350 - x0 + 1, rechts: x1 - 350 + 1, boven: 450 - y0 + 1, onder: y1 - 450 + 1 };
}
const huizen = [
  ['vakwerkhuis', () => D.vakwerkhuis(0, 0), '7×5'],
  ['stenenHuis', () => D.stenenHuis(0, 0), '6×8'],
  ['herberg', () => D.herberg(0, 0, { rook: false }), '9×7'],
];
if (D.smidse) huizen.push(['smidse', () => D.smidse(0, 0), '7×5']);
// drie gewone dorpshuizen, elk uit een ander zaad: hout, riet en een andere plattegrond
if (D.dorpshuis) {
  huizen.push(['dorpshuis 1', () => D.dorpshuis(0, 0, 1, { maat: [7, 5], rook: false }), '7×5']);
  huizen.push(['dorpshuis 3', () => D.dorpshuis(0, 0, 3, { maat: [6, 8], rook: false }), '6×8']);
  huizen.push(['dorpshuis 5', () => D.dorpshuis(0, 0, 5, { maat: [5, 7], rook: false, muur: 'blokhut' }), '5×7']);
}
const m = huizen.map(([, maak]) => maten(maak));
const rand = 6;
const acht = (n) => Math.ceil(n / 8) * 8;
const links = Math.max(...m.map((a) => a.links)) + rand;
const rechts = Math.max(...m.map((a) => a.rechts)) + rand;
const boven = Math.max(...m.map((a) => a.boven)) + rand;
const onder = Math.max(...m.map((a) => a.onder)) + rand;
const CB = acht(links + rechts);
const CH = acht(boven + onder);
const anker = [links + Math.floor((CB - links - rechts) / 2), boven + (CH - boven - onder)];
const huisVel = new K.Plaat(CB * huizen.length, CH);
tijd('huizen', () => huizen.forEach(([, maak], i) => huisVel.plak(gebouwLos(maak, CB, CH, anker), i * CB, 0)));
schrijf('huizen.png', huisVel, 2);
// De maten die het spel gebruikt, gemeten aan het gebouw zelf en niet overgeschreven: voet is de
// plattegrond in tegels (b × d), hoog de hoogte in pixels boven de grond.
const meetGebouw = (maak) => {
  const g = maak();
  const v = g.voet || [0, 0, 0, 0];
  return { voet: [+((v[2] - v[0]) / K.TEGEL).toFixed(2), +((v[3] - v[1]) / K.TEGEL).toFixed(2)], hoog: Math.round(g.hoog || 0) };
};
verslag.huizen = {
  cel: [CB, CH],
  anker,
  uitleg: 'één gebouw per cel, van links naar rechts. anker = het midden van tegel (gx, gy) op de grond: de eerste tegel van de plattegrond, dus de achterste hoek. voet = de plattegrond in tegels (b langs x, d langs y), hoog = de hoogte in pixels boven de grond.',
  volgorde: huizen.map(([n, , v]) => `${n} (${v})`),
  cellen: huizen.map(([n, maak, v], i) => ({ naam: n, cel: i, plattegrond: v, ...meetGebouw(maak) })),
};

// ---------------------------------------------------------------- voorwerpen

const VB = 144;
const VH = 160;
const vAnker = [VB / 2, VH - 30];
const voorwerpen = [
  ['waterput', D.waterput(), 'ZO'],
  ['hek latten', D.hek('latten'), 'NO'],
  ['hek balken', D.hek('balken'), 'NO'],
  ['kar', D.kar(), 'ZW'],
  ['marktkraam', D.marktkraam(), 'ZW'],
  ['wegwijzer', D.wegwijzer(), 'ZO'],
  ['bankje', D.bankje(), 'ZW'],
  ['lantaarnpaal', D.lantaarnpaal(), 'Z'],
  ['hooibaal', D.hooibaal(), 'ZO'],
  ['uithangbord', D.uithangbord(), 'ZW', 60],
  ['aambeeld', D.aambeeld(), 'ZO'],
  ['ton', VW.ton(), 'ZO'],
  ['kist', VW.kist(), 'ZO'],
  ['houtstapel', D.houtstapel(1), 'ZO'],
  ['mesthoop', D.mesthoop(1), 'ZO'],
  ['afdak', D.afdak(1), 'ZO'],
  ['heg', D.heg(1), 'ZO'],
  ['zakken', D.zakken(1), 'ZO'],
  ['kolenhoop', D.kolenhoop(1), 'ZO'],
  ['zaagbok', D.zaagbok(1), 'ZO'],
  ['luifel', D.luifel(1), 'Z'],
  ['hijsbalk', D.hijsbalk(1), 'Z'],
  ['schoorpaal', D.schoorpaal(1), 'O'],
  ['bijenkorf', D.bijenkorf(1), 'ZO'],
  ['kippenren', D.kippenren(1), 'ZO'],
];
const vVel = new K.Plaat(VB * voorwerpen.length, VH);
function voorwerpLos(model, richting, z = 0) {
  const B = new K.Beeld(VB, VH, vAnker[0], vAnker[1]);
  D.zetModel(B, model, 0, 0, richting, { z });
  D.zonSchaduw(B, [], { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
tijd('voorwerpen', () => voorwerpen.forEach(([, model, r, z], i) => vVel.plak(voorwerpLos(model, r, z), i * VB, 0)));
schrijf('dorp-voorwerpen.png', vVel, 2);
verslag.voorwerpen = {
  cel: [VB, VH],
  anker: vAnker,
  uitleg: 'één voorwerp per cel, van links naar rechts. anker = het midden van de tegel waarop het voorwerp staat. richting = de kant waarheen het kijkt (Z = naar de kijker, ZO, ZW, NO, O).',
  volgorde: voorwerpen.map(([n, , r]) => `${n} (${r})`),
  cellen: voorwerpen.map(([n, , r], i) => ({ naam: n, cel: i, richting: r })),
};

// ---------------------------------------------------------------- grond

const GB = 144;
const GH = 88;
function grondStuk(kaart) {
  const B = new K.Beeld(GB, GH, 72, 22);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 1.5, 1.5, -12, 0, D.grondTex(kaart))]);
  D.grasPollen(B, kaart);
  K.belicht(B, { omgeving: () => 0.15 });
  return K.Plaat.van(K.kwantiseer(B));
}
const gronden = [
  ['gras', D.grondKaart({})],
  ['aardePad', D.grondKaart({ paden: [{ punten: [[-3, 0.5], [4, 0.5]], breed: 2.3, ruw: 0.3 }] })],
  ['kasseien', D.grondKaart({ pleinen: [{ x0: -3, y0: -3, x1: 4, y1: 4 }] })],
  ['pad op gras', D.grondKaart({ paden: [{ punten: [[-3, 0.45], [4, 0.55]], breed: 0.95 }] })],
  ['plein op gras', D.grondKaart({ pleinen: [{ x0: 0.35, y0: -3, x1: 4, y1: 4, r: 0.4 }], paden: [{ punten: [[0.4, 0.5], [-3, 0.5]], breed: 0.8 }] })],
  ['moestuin', D.grondKaart({ akkers: [{ x0: -0.3, y0: -0.3, x1: 1.3, y1: 1.3, langs: 'x' }] })],
];
const gVel = new K.Plaat(GB * gronden.length, GH);
tijd('grond', () => gronden.forEach(([, kaart], i) => gVel.plak(grondStuk(kaart), i * GB, 0)));
schrijf('grond.png', gVel, 3);
verslag.grond = { cel: [GB, GH], anker: [72, 22], volgorde: gronden.map(([n]) => n), uitleg: 'anker = midden van tegel (0,0); elk stuk is tegels (0..1, 0..1), 12 px dik' };

// ---------------------------------------------------------------- het plein

const P2 = require('./dorp2.cjs');
const plein = tijd('dorpsplein', () => D.dorpsplein({ prikbord: P2.prikbord(5) }));
schrijf('dorp-proef.png', plein, 2);

fs.writeFileSync(path.join(UIT, 'dorp-export.json'), JSON.stringify(verslag, null, 2) + '\n');
console.log(JSON.stringify(verslag, null, 2));
