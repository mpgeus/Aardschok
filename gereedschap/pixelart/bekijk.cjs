// Werkblad: een figuur uit een paar kanten, sterk vergroot, om details te beoordelen.
//
//   node gereedschap/pixelart/bekijk.cjs tovenaar 92 Z,ZO,N 4
//   → uit/bekijk-tovenaar.png
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = { ...require('./figuren.cjs'), ...require('./figuren2.cjs') };

const [naam = 'tovenaar', jaar = '84', kanten = K.KANTEN.join(','), schaal = '4'] = process.argv.slice(2);
const maak = { tovenaar: () => F.tovenaar(+jaar), wim: F.wim, skelet: F.skelet, slijm: F.slijm }[naam];
if (!maak) {
  console.error(`Onbekende figuur "${naam}". Kies uit: tovenaar, wim, skelet, slijm.`);
  process.exit(1);
}
const model = maak();
const CEL = 112;
const HOOG = 124;
const lijst = kanten.split(',');
const vel = new K.Plaat(CEL * lijst.length, HOOG);
lijst.forEach((kant, i) => vel.plak(K.losRenderen(model, { b: CEL, h: HOOG, anker: [CEL / 2, HOOG - 14], richting: kant }), i * CEL, 0));
const uit = path.join(__dirname, 'uit');
fs.mkdirSync(uit, { recursive: true });
fs.writeFileSync(path.join(uit, `bekijk-${naam}.png`), K.png(vel, +schaal, '#2a2236'));
console.log(`uit/bekijk-${naam}.png`);
