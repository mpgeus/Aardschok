// Schrijft de bosvijanden weg als stroken van acht richtingen, op ware grootte (1 pixel = 1
// pixel), met dezelfde cellen als de figuren in export.cjs: 112×124, anker (56, 110), volgorde
// Z ZW W NW N NO O ZO. Daarnaast een overzicht op dubbele grootte om te beoordelen. Meldt per
// strook hoe groot de figuur is en of hij ergens de rand van de cel raakt.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };
const V = require('./bosvijanden.cjs');

const UIT = path.join(__dirname, 'uit', 'vijanden');
fs.mkdirSync(UIT, { recursive: true });

const CEL = 112;
const HOOG = 124;
const ANKER = [56, 110];
const cel = (model, kant) => K.losRenderen(model, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
function strook(cellen) {
  const vel = new K.Plaat(CEL * cellen.length, HOOG);
  cellen.forEach((p, i) => vel.plak(p, i * CEL, 0));
  return vel;
}
// kleinste rechthoek om de gekleurde pixels van een cel
function kader(p) {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
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
  return { x0, x1, y0, y1 };
}

const vijanden = {
  wolf: V.wolf(),
  reuzenspin: V.reuzenspin(),
  kobold: V.kobold('speer'),
  'kobold-knots': V.kobold('knots'),
};
const stroken = {};
let fout = false;
for (const [naam, m] of Object.entries(vijanden)) {
  const cellen = K.KANTEN.map((k) => cel(m, k));
  stroken[naam] = cellen;
  fs.writeFileSync(path.join(UIT, `${naam}-richtingen.png`), K.png(strook(cellen), 1));
  const maten = cellen.map(kader);
  const rand = maten.some((k) => k.x0 <= 0 || k.y0 <= 0 || k.x1 >= CEL - 1 || k.y1 >= HOOG - 1);
  if (rand) fout = true;
  const hoog = maten.map((k) => k.y1 - k.y0 + 1);
  const breed = maten.map((k) => k.x1 - k.x0 + 1);
  console.log(
    `${naam.padEnd(13)} hoog ${Math.min(...hoog)}–${Math.max(...hoog)} px, breed ${Math.min(...breed)}–${Math.max(...breed)} px, ` +
      `laagste pixel ${Math.max(...maten.map((k) => k.y1))}${rand ? '  RAAKT DE RAND' : ''}`,
  );
}

// overzicht: elke vijand in acht richtingen, en ernaast de tovenaar en het skelet op dezelfde
// schaal, op de achtergrond van het canvas, twee keer zo groot
const naast = [F.tovenaar(84), F.skelet()];
const rijen = Object.keys(stroken);
const vel = new K.Plaat(CEL * 10, HOOG * rijen.length);
rijen.forEach((naam, j) => {
  stroken[naam].forEach((p, i) => vel.plak(p, i * CEL, j * HOOG));
  naast.forEach((m, i) => vel.plak(cel(m, K.KANTEN[(j * 3 + 1) % 8]), (8 + i) * CEL, j * HOOG));
});
fs.writeFileSync(path.join(UIT, 'vijanden-overzicht.png'), K.png(vel, 2, '#2a2236'));

for (const f of fs.readdirSync(UIT).filter((f) => f.endsWith('.png'))) {
  const b = fs.readFileSync(path.join(UIT, f));
  console.log(f.padEnd(32), b.readUInt32BE(16) + '×' + b.readUInt32BE(20), b.length, 'bytes');
}
if (fout) process.exitCode = 1;
