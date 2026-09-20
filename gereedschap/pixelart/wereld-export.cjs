'use strict';
// Schrijft het wereldbeeld weg: uit/wereld/wereld.png op ware grootte (1920 × 1080, doorzichtige
// achtergrond), en op verzoek een uitsnede om te beoordelen.
//   node wereld-export.cjs                 het hele beeld
//   node wereld-export.cjs --snel          zonder bomen en zonder toren (om de plattegrond te zien)
//   node wereld-export.cjs --uitsnede x y b h [schaal]   een stuk vergroot in uit/wereld/werk
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const W = require('./wereld.cjs');

const UIT = path.join(__dirname, 'uit', 'wereld');
fs.mkdirSync(path.join(UIT, 'werk'), { recursive: true });

const snel = process.argv.includes('--snel');
const i = process.argv.indexOf('--uitsnede');
const kader = i > 0 ? process.argv.slice(i + 1, i + 6).map(Number) : null;

// --knip x y b h [schaal]: een stuk uit het beeld dat er al staat, zonder opnieuw te renderen.
// Het leest de PNG terug die wij zelf schreven (filter 0 per regel) en schrijft de uitsnede
// vergroot weg in uit/wereld/werk/knip.png.
const j = process.argv.indexOf('--knip');
if (j > 0) {
  const zlib = require('zlib');
  const [x, y, b, h, schaal = 2] = process.argv.slice(j + 1, j + 6).map(Number);
  const rauw = fs.readFileSync(path.join(UIT, 'wereld.png'));
  const breed = rauw.readUInt32BE(16);
  const hoog = rauw.readUInt32BE(20);
  let o = 8;
  const idat = [];
  while (o < rauw.length) {
    const len = rauw.readUInt32BE(o);
    if (rauw.toString('ascii', o + 4, o + 8) === 'IDAT') idat.push(rauw.subarray(o + 8, o + 8 + len));
    o += 12 + len;
  }
  const px = zlib.inflateSync(Buffer.concat(idat));
  const uit = Buffer.alloc(b * schaal * h * schaal * 4);
  for (let ry = 0; ry < h * schaal; ry++) {
    for (let rx = 0; rx < b * schaal; rx++) {
      const sx = x + Math.floor(rx / schaal);
      const sy = y + Math.floor(ry / schaal);
      const s = sy * (breed * 4 + 1) + 1 + sx * 4;
      const d = (ry * b * schaal + rx) * 4;
      if (sx < 0 || sy < 0 || sx >= breed || sy >= hoog || px[s + 3] === 0) {
        uit[d] = 14;
        uit[d + 1] = 10;
        uit[d + 2] = 20;
        uit[d + 3] = 255;
        continue;
      }
      uit[d] = px[s];
      uit[d + 1] = px[s + 1];
      uit[d + 2] = px[s + 2];
      uit[d + 3] = 255;
    }
  }
  fs.writeFileSync(path.join(UIT, 'werk', 'knip.png'), K.png({ b: b * schaal, h: h * schaal, rgba: () => uit }, 1));
  console.log(`werk/knip.png  ${b}×${h} op ${schaal}×`);
  process.exit(0);
}

const t0 = Date.now();
const plaat = W.wereld({ log: console.log, bomen: !snel, toren: !snel });
const duur = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`totaal         ${duur} s`);

const naam = snel ? 'werk/wereld-snel.png' : 'wereld.png';
fs.writeFileSync(path.join(UIT, naam), K.png(plaat, 1));
console.log(`${naam}  ${plaat.b}×${plaat.h}`);
// een donkere versie om naar te kijken (het spel gebruikt de doorzichtige)
fs.writeFileSync(path.join(UIT, 'werk', snel ? 'wereld-snel-donker.png' : 'wereld-donker.png'), K.png(plaat, 1, '#0e0a14'));
if (kader) {
  const [x, y, b, h, schaal = 2] = kader;
  fs.writeFileSync(path.join(UIT, 'werk', 'uitsnede.png'), K.png(plaat.uitsnede(x, y, b, h), schaal, '#0e0a14'));
  console.log(`uitsnede.png   ${b}×${h} op ${schaal}×`);
}
