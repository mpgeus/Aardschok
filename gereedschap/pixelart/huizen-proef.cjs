'use strict';
// huizen-proef.cjs : vier gebouwen naast elkaar op ware grootte, om te zien dat ze niet op
// elkaar lijken: twee dorpshuizen uit verschillende zaden, het vakwerkhuisje en de schuur.
// Schrijft uit/dorp/huizen-proef.png (1:1) en werk/huizen-proef-x2.png om te bekijken.
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const F = require('./figuren.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');

const UIT = path.join(__dirname, 'uit', 'dorp');
fs.mkdirSync(path.join(UIT, 'werk'), { recursive: true });

const B = new K.Beeld(2700, 840, 330, 540);
const kaart = D.grondKaart({
  zaad: 5,
  paden: [{ punten: [[-8, 8], [42, -42]], breed: 1.6 }],
  akkers: [{ x0: 6, y0: 2, x1: 10, y1: 5, langs: 'x', stadium: 'jong' }],
});
console.time('huizen-proef');
K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, D.grondTex(kaart, { dor: true }))]);
const gs = [];
const zet = (g) => {
  gs.push(g);
  D.zetGebouw(B, g);
  return g;
};
// de vier gebouwen op één lijn over het scherm: gx omhoog, gy even ver omlaag
zet(D.dorpshuis(0, 0, 3, { maat: [6, 8] }));
zet(D.vakwerkhuis(11, -11, {
  dakkapellen: [{ t: 0.42, b: 42, hoog: 40, raamB: 22 }],
  erkers: [{ vlak: 'x', u: 58, b: 36, h: 52, hoog: 42, diep: 15 }],
}));
zet(D.dorpshuis(22, -22, 1, { maat: [7, 5] }));
zet(P.schuur(33, -33));
// wat er op het erf staat
D.zetModel(B, D.houtstapel(1), 8.5, -5.5, 'ZO');
D.zetModel(B, D.zaagbok(1), 10, -4, 'ZW');
D.zetModel(B, D.kippenren(1), 19, -16, 'ZO');
D.zetModel(B, D.mesthoop(1), 31, -27, 'ZO');
D.zetModel(B, D.kar(), 28, -26, 'ZW');
D.zetModel(B, F.tovenaar(84), 7, -3, 'ZO'); // voor de maat, tussen twee huizen

D.grasPollen(B, kaart, { dicht: 0.8 });
const vormen = gs.flatMap((g) => g.vormen);
D.zonSchaduw(B, vormen, { zon: D.AVONDZON, kracht: 2.6 });
D.voetSchaduw(B, gs);
K.belicht(B, { omgeving: () => 0.2 });
D.avondlicht(B);
K.verwarm(B, 1.8);
K.omlijn(B);
const p = K.Plaat.van(K.kwantiseer(B));
console.timeEnd('huizen-proef');
fs.writeFileSync(path.join(UIT, 'huizen-proef.png'), K.png(p, 1));
fs.writeFileSync(path.join(UIT, 'werk', 'huizen-proef-x2.png'), K.png(p, 2, '#0e0a14'));
console.log(`huizen-proef.png  ${p.b}×${p.h}`);
