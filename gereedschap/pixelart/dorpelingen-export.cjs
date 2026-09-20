'use strict';
// Schrijft alle twaalf dorpelingen weg (dorpelingen.cjs en dorpelingen2.cjs), zoals export.cjs dat
// voor Wim en de tovenaar doet: op ware grootte, met een doorzichtige achtergrond.
//   uit/dorpelingen/<naam>-richtingen.png  acht cellen van 112×124, anker (56, 110), in de volgorde
//                                          Z ZW W NW N NO O ZO (K.KANTEN)
//   uit/dorpelingen/<naam>-portret.png     64×64, hoofd en schouders, naar ZO zoals Wim en de
//                                          tovenaar (voor de smid met de gloed van de smidse)
// En een overzicht om te beoordelen: uit/dorpelingen/dorpelingen-overzicht.png, alle twaalf naast
// Wim in Z en ZO, met de portretten eronder, twee keer vergroot.
//   node dorpelingen-export.cjs            alles
//   node dorpelingen-export.cjs jongen     alleen deze (namen met komma's)
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const { ALLE_DORPELINGEN } = require('./dorpelingen2.cjs');
const { portret } = require('./portret.cjs');

const UIT = path.join(__dirname, 'uit', 'dorpelingen');
fs.mkdirSync(UIT, { recursive: true });
const schrijf = (naam, p, schaal = 1, achtergrond = null) => fs.writeFileSync(path.join(UIT, naam), K.png(p, schaal, achtergrond));

const CEL = 112;
const HOOG = 124;
const ANKER = [CEL / 2, HOOG - 14];
const figuurCel = (model, kant) => K.losRenderen(model, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
function strook(cellen) {
  const vel = new K.Plaat(CEL * cellen.length, HOOG);
  cellen.forEach((p, i) => vel.plak(p, i * CEL, 0));
  return vel;
}
// hoogte van wat er in een cel staat, in pixels
function hoogte(p) {
  let y0 = Infinity;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return y1 - y0 + 1;
}
const portretVan = (d, m) => portret(d.voorPortret ? d.voorPortret(m) : m, d.hoofd, d.portret);

const alleen = process.argv[2] ? process.argv[2].split(',') : null;
const lijst = alleen ? ALLE_DORPELINGEN.filter((d) => alleen.includes(d.naam)) : ALLE_DORPELINGEN;
const rij = [];
for (const d of lijst) {
  const m = d.maak();
  const cellen = K.KANTEN.map((k) => figuurCel(m, k));
  schrijf(`${d.naam}-richtingen.png`, strook(cellen));
  const p = portretVan(d, m);
  schrijf(`${d.naam}-portret.png`, p);
  rij.push({ z: cellen[0], zo: cellen[7], p });
  const h = cellen.map(hoogte);
  console.log(`${d.naam.padEnd(15)} ${Math.min(...h)}–${Math.max(...h)} px hoog  (${K.KANTEN.map((k, i) => `${k} ${h[i]}`).join(', ')})`);
}

if (!alleen) {
  // overzicht: iedereen naast Wim, in Z en in ZO, de portretten eronder
  const wim = F.wim();
  rij.push({ z: figuurCel(wim, 'Z'), zo: figuurCel(wim, 'ZO'), p: portret(wim, [0, 3.4, 65], { midden: 0.5 }) });
  const B = 76; // de figuren staan dicht op elkaar: een cel is 112 breed, een figuur hooguit 50
  const RIJ = 100;
  const vel = new K.Plaat(B * rij.length + 36, RIJ * 2 + 30 + 72);
  rij.forEach((r, i) => {
    vel.plak(r.z.uitsnede(18, 10, B, 114), i * B, 0);
    vel.plak(r.zo.uitsnede(18, 10, B, 114), i * B, RIJ);
    vel.plak(r.p, i * B + 6, RIJ * 2 + 34);
  });
  fs.writeFileSync(path.join(UIT, 'dorpelingen-overzicht.png'), K.png(vel, 2, '#2a2236'));
}

for (const f of fs.readdirSync(UIT).filter((f) => f.endsWith('.png'))) {
  const b = fs.readFileSync(path.join(UIT, f));
  console.log(f.padEnd(34), b.readUInt32BE(16) + '×' + b.readUInt32BE(20), b.length, 'bytes');
}
