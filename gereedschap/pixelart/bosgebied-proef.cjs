'use strict';
// bosgebied-proef.cjs naam[:zaad[:richting]],… schaal : losse onderdelen van het bos bekijken
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Bg = require('./bosgebied.cjs');
const Bm = require('./bomen.cjs');
const alles = { ...Bm, ...Bg };
const [lijst = 'omgevallenStam:1', schaal = '3'] = process.argv.slice(2);
const cellen = lijst.split(',').map((s) => {
  const [naam, zaad = '1', richting = 'Z'] = s.split(':');
  const m = alles[naam](+zaad);
  const b = Math.ceil(m.straal * 2 + 30);
  const h = Math.ceil(m.straal * 1.7 + 40);
  const t0 = Date.now();
  const p = K.losRenderen(m, { b, h, anker: [Math.round(b / 2), h - 26], richting });
  Bm.ontspikkel(p);
  console.log(`${naam}:${zaad} ${b}×${h} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return p;
});
const W = cellen.reduce((a, p) => a + p.b, 0);
const H = Math.max(...cellen.map((p) => p.h));
const vel = new K.Plaat(W, H);
let x = 0;
for (const p of cellen) {
  vel.plak(p, x, H - p.h);
  x += p.b;
}
fs.writeFileSync(path.join(__dirname, 'uit', 'buiten', 'werk', 'onderdelen.png'), K.png(vel, +schaal, '#2a2236'));
