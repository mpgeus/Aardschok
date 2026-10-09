'use strict';
// Waar de rook uit elk huis komt (vraag 145, 3; huizen.cjs, rookVan), in tegels/tegels.json en tegels.js, zonder de
// huizen opnieuw te renderen: de top van de schoorsteen, of bij een hut de nok. Een volgende render van de huizen
// (npm run tiled huizen) zet ze er zelf in; dit is voor de tekeningen die er al zijn.
//
//   node gereedschap/pixelart/rookpunten.cjs
const fs = require('fs');
const path = require('path');
const HZ = require('./huizen.cjs');

const TEGELS = path.join(__dirname, '..', '..', 'tegels');
const pad = path.join(TEGELS, 'tegels.json');
const TJ = JSON.parse(fs.readFileSync(pad, 'utf8'));
let n = 0;
for (const vel of ['huizen']) {
  TJ[vel].tiles = TJ[vel].tiles.map((t) => {
    const spec = t && HZ.HUIZEN[t.naam];
    if (!spec) return t;
    const draai = spec.draai || 0;
    const W = HZ.wereldVan(spec);
    const r = HZ.rookVan(W, draai, HZ.meetHuis(W, draai)) || {};
    // in de volgorde van naar-tiled.cjs (eigenschappen): na de stijl, vóór het bestand
    const uit = {};
    for (const [k, v] of Object.entries(t)) {
      if (k === 'schoorsteen' || k === 'nok') continue;
      if (k === 'bestand') Object.assign(uit, r);
      uit[k] = v;
    }
    if (!('bestand' in t)) Object.assign(uit, r);
    n++;
    return uit;
  });
}
const json = JSON.stringify(TJ, null, 1);
fs.writeFileSync(pad, json + '\n');
fs.writeFileSync(
  path.join(TEGELS, 'tegels.js'),
  '// Gemaakt door gereedschap/pixelart/naar-tiled.cjs — niet met de hand bijwerken.\n' +
    '// Dezelfde inhoud als tegels.json, als script, zodat file:// het ook kan lezen (zie js/kaart.js).\n' +
    '(function (T) {\n  T.TEGELS = ' +
    json.replace(/\n/g, '\n  ') +
    ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
);
console.log(`${n} huizen met hun rook`);
