'use strict';
// De bosrand: een lap gras met een zandpad dat het bos in loopt, bomen links en achter, struiken,
// varens, paddenstoelen en een stronk onder de bomen, stenen en bloemen in de wei. Licht van een
// late middag: helder in de wei, schemerig onder de bomen, de kruinen weer in de zon.
// bosRand() geeft de plaat; los gedraaid schrijft dit script een proef in uit/bomen-proef.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Bm = require('./bomen.cjs');
const { klem, TEGEL, PXH } = K;

// afstand (in tegels) van (x, y) tot een gebroken lijn
function totLijn(punten) {
  return (x, y) => {
    let d = 1e9;
    for (let i = 0; i + 1 < punten.length; i++) {
      const [ax, ay] = punten[i];
      const [bx, by] = punten[i + 1];
      const vx = bx - ax;
      const vy = by - ay;
      const t = klem(((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy), 0, 1);
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
}

// [naam, zaad, gx, gy, voet (donkere plek om de voet, in eenheden), schaduwsterkte]
const BOMEN = [
  ['den', 1, 0.8, 3.0, 16, 1.6],
  ['eik', 1, 2.4, 0.8, 22, 1.6],
  ['den', 2, 1.0, 5.8, 16, 1.6],
  ['berk', 2, 2.5, 5.0, 12, 1.6],
  ['dodeBoom', 1, 5.7, 5.9, 18, 1.6],
  ['herfstEik', 2, 5.4, 0.6, 22, 1.6],
  ['berk', 3, 8.0, 0.7, 12, 1.6],
  ['den', 3, 10.6, 0.5, 16, 1.6],
];
const KLEIN = [
  ['struik', 1, 3.7, 1.9, 20, 1.2],
  ['bessenStruik', 2, 2.2, 2.3, 18, 1.2],
  ['varen', 1, 3.9, 5.3, 0],
  ['varen', 2, 4.1, 3.1, 0],
  ['varen', 3, 1.9, 6.2, 0],
  ['paddenstoelen', 1, 1.9, 4.6, 0],
  ['paddenstoelen', 2, 3.3, 2.9, 0],
  ['boomstronk', 1, 6.8, 1.9, 16, 1.2],
  ['rots', 1, 9.0, 4.8, 22, 1.2],
  ['kleineRots', 2, 9.9, 5.5, 10, 1.2],
  ['kleineRots', 3, 6.9, 6.1, 10, 1.2],
  ['grasPol', 1, 7.3, 4.9, 0],
  ['grasPol', 2, 10.9, 2.3, 0],
  ['grasPol', 3, 5.0, 2.7, 0],
  ['grasPol', 4, 8.3, 2.1, 0],
  ['hoogGras', 1, 9.5, 1.8, 0],
  ['hoogGras', 2, 11.0, 5.9, 0],
  ['bloemen', 1, 7.9, 5.7, 0],
  ['bloemen', 2, 10.3, 4.1, 0],
  ['bloemen', 3, 6.2, 4.9, 0],
];

function bosRand(o = {}) {
  const log = o.log || (() => {});
  const B = new K.Beeld(960, 540, 400, 232);
  const pad = totLijn([[12, 3.4], [9.6, 3.0], [7.4, 3.5], [5.6, 4.2], [4.0, 4.3], [2.6, 3.7], [1.2, 3.9], [-1, 3.4]]);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 11.5, 6.5, -14, 0, Bm.grasVloer({ pad }))]);
  const gezet = [];
  for (const [naam, zaad, gx, gy, voet, sterkte] of [...BOMEN, ...KLEIN]) {
    const t0 = Date.now();
    gezet.push({ ...Bm.zetBuiten(B, Bm[naam](zaad), gx, gy), voet, sterkte });
    log(`${naam}:${zaad} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  // eerst alles, dan de schaduwen: zo valt de schaduw van een boom ook op de struik eronder
  const t0 = Date.now();
  for (const g of gezet) Bm.slagschaduw(B, g.model, { gx: g.gx, gy: g.gy, obj: g.obj, voet: g.voet, sterkte: g.sterkte ?? 1 });
  log(`schaduwen ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  // onder de bomen is het schemerig, de kruinen vangen de late zon
  const bos = (gx, gy) => Math.max(klem((4.4 - gx) / 2.4, 0, 1), klem((1.8 - gy) / 1.6, 0, 1) * 0.8);
  K.belicht(B, {
    omgeving: (X, Y, Z) => {
      const hoog = klem((Z * PXH - 30) / 170, 0, 1);
      return 0.22 - 0.8 * bos(X / TEGEL, Y / TEGEL) * (1 - hoog) + hoog * 0.15;
    },
  });
  K.omlijn(B);
  const p = K.Plaat.van(K.kwantiseer(B));
  // alleen losse pixels in de modellen weghalen; de grasvloer heeft bewuste puntjes
  const masker = new Uint8Array(B.b * B.h);
  for (let i = 0; i < masker.length; i++) masker[i] = B.obj[i] > 0 ? 1 : 0;
  Bm.ontspikkel(p, undefined, masker);
  return p;
}

module.exports = { bosRand, totLijn };

if (require.main === module) {
  const t0 = Date.now();
  const p = bosRand({ log: console.log });
  console.log(`totaal ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  const map = path.join(__dirname, 'uit', 'bomen-proef');
  fs.mkdirSync(map, { recursive: true });
  fs.writeFileSync(path.join(map, 'bos.png'), K.png(p, 1, '#2a2236'));
  fs.writeFileSync(path.join(map, 'bos-x2.png'), K.png(p, 2, '#2a2236'));
}
