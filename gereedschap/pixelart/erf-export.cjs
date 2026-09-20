// Schrijft het erf van de toren weg als PNG op ware grootte, in uit/erf:
//   erf.png            de scène, 1920×1080, doorzichtige achtergrond
// en daarnaast, in uit/erf/proef, een versie op een donkere achtergrond en een paar uitsneden
// (deur, Wim, torentop, de randen) om het werk te beoordelen zonder opnieuw te hoeven renderen.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Erf = require('./erf-scene.cjs');

const UIT = path.join(__dirname, 'uit', 'erf');
const PROEF = path.join(UIT, 'proef');
fs.mkdirSync(PROEF, { recursive: true });

const t0 = Date.now();
const p = Erf.erf({ log: (s) => console.log(s) });
console.log(`erf.png  ${Erf.BREED}×${Erf.HOOG}  anker ${Erf.ANKER.join(',')}  ${Date.now() - t0} ms`);
fs.writeFileSync(path.join(UIT, 'erf.png'), K.png(p, 1));

if (process.argv.includes('--proef')) {
  fs.writeFileSync(path.join(PROEF, 'erf-donker.png'), K.png(p, 1, '#2a2236'));
  const sneden = {
    'deur.png': [620, 480, 480, 480], // de deur, de tovenaar, de put
    'wim.png': [420, 560, 480, 420], // Wim, het hek en het poortje
    'top.png': [640, 0, 640, 560], // de torenspits, of hij niet afsnijdt
    'links.png': [0, 150, 420, 780], // linkerrand: dicht bos, geen harde lijn
    'rechts.png': [1500, 150, 420, 780], // rechterrand
    'onder.png': [380, 820, 1160, 260], // ondergrens: schuurtje, houtstapel, hek
  };
  for (const [naam, [x, y, b, h]] of Object.entries(sneden)) {
    fs.writeFileSync(path.join(PROEF, naam), K.png(p.uitsnede(x, y, b, h), 2, '#2a2236'));
  }
  console.log('proefbeelden geschreven in', PROEF);
}
