'use strict';
// Schrijft de vaklieden en de menigte weg zoals dorpelingen-export.cjs dat voor de eerste vier
// dorpelingen doet: op ware grootte, met een doorzichtige achtergrond.
//   uit/dorpelingen/<naam>-richtingen.png   acht cellen van 112×124, anker (56, 110), in de
//                                           volgorde Z ZW W NW N NO O ZO (K.KANTEN)
//   uit/dorpelingen/<naam>-portret.png      64×64, hoofd en schouders, naar ZO gedraaid
//   uit/dorpelingen/menigte.png             24 gewone dorpelingen (zaad 1 t/m 24), richting ZO,
//                                           twaalf per rij
//   uit/dorpelingen/menigte-richtingen.png  drie van hen in acht richtingen, onder elkaar
// Daarnaast twee proefbeelden om te beoordelen, in uit/dorpelingen/proef3/.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const { DORPELINGEN } = require('./dorpelingen.cjs');
const { BEROEPEN, dorpeling } = require('./dorpelingen3.cjs');
const { portret } = require('./portret.cjs');

const UIT = path.join(__dirname, 'uit', 'dorpelingen');
fs.mkdirSync(path.join(UIT, 'proef3'), { recursive: true });
const schrijf = (naam, p, schaal = 1, achtergrond = null) => fs.writeFileSync(path.join(UIT, naam), K.png(p, schaal, achtergrond));

const CEL = 112;
const HOOG = 124;
const ANKER = [CEL / 2, HOOG - 14];
const MENIGTE = 24; // de zaden 1 t/m 24
const STROKEN = [3, 13, 21]; // van deze drie ook acht richtingen
const cel = (model, kant) => K.losRenderen(model, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
function strook(cellen) {
  const vel = new K.Plaat(CEL * cellen.length, HOOG);
  cellen.forEach((p, i) => vel.plak(p, i * CEL, 0));
  return vel;
}
// hoogte en breedte van wat er in een cel staat, in pixels
function maat(p) {
  let x0 = Infinity;
  let x1 = -1;
  let y0 = Infinity;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { b: x1 - x0 + 1, h: y1 - y0 + 1, x0, x1, y0 };
}

const t0 = Date.now();
const stroken = [];
const portretten = [];
for (const d of BEROEPEN) {
  const m = d.maak();
  const cellen = K.KANTEN.map((k) => cel(m, k));
  const vel = strook(cellen);
  schrijf(`${d.naam}-richtingen.png`, vel);
  const p = portret(m, d.hoofd, d.portret);
  schrijf(`${d.naam}-portret.png`, p);
  stroken.push(vel);
  portretten.push(p);
  const maten = cellen.map(maat);
  const hoogtes = maten.map((c) => c.h);
  const krap = maten.some((c) => c.x0 < 2 || c.x1 > CEL - 3 || c.y0 < 2);
  console.log(`${d.naam.padEnd(14)} ${Math.min(...hoogtes)}–${Math.max(...hoogtes)} px hoog${krap ? '  LET OP: raakt de rand van de cel' : ''}`);
}

// de menigte: 24 gewone dorpelingen naar het zuidoosten, twaalf per rij
const perRij = 12;
const menigte = new K.Plaat(CEL * perRij, HOOG * Math.ceil(MENIGTE / perRij));
const cellenZO = [];
for (let z = 1; z <= MENIGTE; z++) {
  const p = cel(dorpeling(z), 'ZO');
  cellenZO.push(p);
  menigte.plak(p, ((z - 1) % perRij) * CEL, Math.floor((z - 1) / perRij) * HOOG);
}
schrijf('menigte.png', menigte);
const drie = new K.Plaat(CEL * 8, HOOG * STROKEN.length);
STROKEN.forEach((z, i) => drie.plak(strook(K.KANTEN.map((k) => cel(dorpeling(z), k))), 0, i * HOOG));
schrijf('menigte-richtingen.png', drie);

// --- proefbeelden: de vaklieden naast Wim en de smid, en de menigte vergroot
const RIJ = 100; // de bovenste pixels van een cel zijn leeg; rijen mogen elkaar raken
const extra = [F.wim(), DORPELINGEN[0].maak(), F.tovenaar(84)];
const alle = [...stroken, ...extra.map((m) => strook(K.KANTEN.map((k) => cel(m, k))))];
const overzicht = new K.Plaat(CEL * 8, RIJ * (alle.length - 1) + HOOG + 76);
alle.forEach((s, i) => overzicht.plak(s, 0, i * RIJ - 14));
const pY = RIJ * (alle.length - 1) + HOOG - 6;
portretten.forEach((p, i) => overzicht.plak(p, 8 + i * 70, pY));
overzicht.plak(portret(F.wim(), [0, 3.4, 65], { midden: 0.5, kant: 'ZO' }), 8 + portretten.length * 70, pY);
fs.writeFileSync(path.join(UIT, 'proef3', 'overzicht.png'), K.png(overzicht, 2, '#2a2236'));
const groot = new K.Plaat(84 * perRij, 112 * Math.ceil(MENIGTE / perRij));
cellenZO.forEach((p, i) => groot.plak(p.uitsnede(14, 10, 84, 112), (i % perRij) * 84, Math.floor(i / perRij) * 112));
fs.writeFileSync(path.join(UIT, 'proef3', 'menigte-groot.png'), K.png(groot, 2, '#2a2236'));

for (const f of fs.readdirSync(UIT).filter((f) => f.endsWith('.png'))) {
  const b = fs.readFileSync(path.join(UIT, f));
  console.log(f.padEnd(32), (b.readUInt32BE(16) + '×' + b.readUInt32BE(20)).padEnd(10), b.length, 'bytes');
}
console.log(`${((Date.now() - t0) / 1000).toFixed(1)} s`);
