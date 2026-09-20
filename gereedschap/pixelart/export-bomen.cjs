'use strict';
// Schrijft de bomen en de begroeiing weg als PNG op ware grootte (1 pixel = 1 pixel), op een
// doorzichtige achtergrond, in vaste cellen op één rij, plus de proefscène van de bosrand. Naast
// elke strook een klein JSON-bestand met de celmaat, het ankerpunt (het midden van de tegel, waar
// de voet staat) en de namen op volgorde, zodat het spel de cellen kan uitsnijden.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');
const { bosRand } = require('./proef-bos.cjs');

const UIT = path.join(__dirname, 'uit', 'buiten');
fs.mkdirSync(UIT, { recursive: true });

const STROKEN = {
  bomen: {
    cel: [224, 320],
    anker: [112, 292],
    lijst: [['eik', 1], ['eik', 2], ['herfstEik', 2], ['den', 1], ['den', 2], ['berk', 2], ['berk', 3], ['dodeBoom', 1], ['dodeBoom', 4], ['wilg', 1], ['appelboom', 1]],
  },
  begroeiing: {
    cel: [96, 96],
    anker: [48, 72],
    lijst: [
      ['struik', 1],
      ['struik', 2],
      ['bessenStruik', 2],
      ['varen', 1],
      ['varen', 2],
      ['grasPol', 1],
      ['grasPol', 2],
      ['hoogGras', 1],
      ['bloemen', 1],
      ['bloemen', 2],
      ['bloemen', 3],
      ['paddenstoelen', 1],
      ['paddenstoelen', 2],
      ['boomstronk', 1],
      ['rots', 1],
      ['rots', 2],
      ['kleineRots', 1],
      ['kleineRots', 2],
    ],
  },
};

for (const [naam, { cel, anker, lijst }] of Object.entries(STROKEN)) {
  const [b, h] = cel;
  const vel = new K.Plaat(b * lijst.length, h);
  lijst.forEach(([soort, zaad], i) => {
    const t0 = Date.now();
    const p = K.losRenderen(Bm[soort](zaad), { b, h, anker, richting: 'Z' });
    Bm.ontspikkel(p);
    vel.plak(p, i * b, 0);
    console.log(`${naam} ${i}: ${soort}(${zaad}) ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  });
  fs.writeFileSync(path.join(UIT, `${naam}.png`), K.png(vel, 1));
  const cellen = lijst.map(([soort, zaad], i) => ({ x: i * b, soort, zaad }));
  fs.writeFileSync(path.join(UIT, `${naam}.json`), JSON.stringify({ cel, anker, richting: 'Z', cellen }, null, 1) + '\n');
}

const t0 = Date.now();
fs.writeFileSync(path.join(UIT, 'bos-proef.png'), K.png(bosRand(), 1));
console.log(`bos-proef ${((Date.now() - t0) / 1000).toFixed(1)} s`);

for (const f of fs.readdirSync(UIT).filter((f) => f.endsWith('.png'))) {
  const buf = fs.readFileSync(path.join(UIT, f));
  console.log(f, buf.readUInt32BE(16) + '×' + buf.readUInt32BE(20), buf.length, 'bytes');
}
