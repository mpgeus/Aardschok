// Schrijft de toren van buiten weg als PNG op ware grootte, in uit/toren: de drie staten los
// (doorzichtige achtergrond, met een stukje grond) en naast elkaar in vaste cellen van
// BREED × HOOG. Het anker (het midden van de voet van de toren, op de grond) ligt in elke cel op
// dezelfde plek: ANKER.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const T = require('./toren.cjs');

const UIT = path.join(__dirname, 'uit', 'toren');
fs.mkdirSync(UIT, { recursive: true });

const staten = [
  ['krakkemikkig', 'toren-krakkemikkig.png'],
  ['half', 'toren-half.png'],
  ['hersteld', 'toren-hersteld.png'],
];
const platen = [];
for (const [staat, naam] of staten) {
  const t0 = Date.now();
  const p = T.toren(staat);
  console.log(`${naam.padEnd(24)} ${T.BREED}×${T.HOOG}  anker ${T.ANKER.join(',')}  ${Date.now() - t0} ms`);
  fs.writeFileSync(path.join(UIT, naam), K.png(p, 1));
  platen.push(p);
}
const vel = new K.Plaat(T.BREED * platen.length, T.HOOG);
platen.forEach((p, i) => vel.plak(p, i * T.BREED, 0));
fs.writeFileSync(path.join(UIT, 'toren-staten.png'), K.png(vel, 1));
console.log(`toren-staten.png         ${vel.b}×${vel.h}  cellen van ${T.BREED}×${T.HOOG}`);
// een vergroting op een donkere achtergrond, om te beoordelen (niet voor het spel)
if (process.argv.includes('--groot')) fs.writeFileSync(path.join(UIT, 'proef', 'staten-x2.png'), K.png(vel, 2, '#2a2236'));
if (process.argv.includes('--donker')) fs.writeFileSync(path.join(UIT, 'proef', 'staten.png'), K.png(vel, 1, '#2a2236'));
