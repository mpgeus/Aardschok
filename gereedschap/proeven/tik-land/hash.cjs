// Een vingerafdruk van het land: T.eilandStuk en T.landStuk op een paar plekken, om oud en nieuw te vergelijken.
const { T } = require(process.env.SPEL_WORTEL + '/gereedschap/grootte/harnas.cjs');
const crypto = require('crypto');
const h = crypto.createHash('sha1');
for (const zaad of [5, 2]) {
  const E = T.eilandVan(zaad);
  for (const [x, y] of [[640, 900], [1200, 1300], [E.plekken[0].x | 0, E.plekken[0].y | 0], [5, 7]]) {
    const a = T.eilandStuk(E, x, y, 40, 40);
    const b = T.eilandStuk(E, x - 0.5, y - 0.5, 41, 41);
    for (const s of [a, b]) for (const k of ['hoogte', 'streek', 'weg', 'boom', 'kamp']) h.update(Buffer.from(s[k].buffer));
    const L = T.landStuk(E, x, y, 64, 64);
    h.update(JSON.stringify([L.hoek, [...L.grond], [...L.soort], L.dingen]));
    const d = T.landStuk(E, x + 16, y + 16, 16, 16);
    h.update(JSON.stringify([d.hoek, [...d.grond], [...d.soort], d.dingen]));
  }
}
console.log(h.digest('hex'));
