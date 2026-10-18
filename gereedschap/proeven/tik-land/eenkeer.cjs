// Een stuk dat meteen nodig is (openStuk: T.landStuk op 64 in één keer), koud (niets ernaast gerekend) en naast een
// stuk dat al gemaakt is; en de hoogte van een stuk (de hoekpunten, js/hoogte.js) na het land.
const { T, nu } = require(process.env.SPEL_WORTEL + '/gereedschap/grootte/harnas.cjs');
const E = T.eilandVan(5);
const leeg = () => T.eilandRasterLeeg && T.eilandRasterLeeg(E);
const tijd = (f) => { const t0 = nu(); f(); return nu() - t0; };
T.landStuk(E, 320, 320, 64, 64); // opwarmen
const koud = [], naast = [], hoogte = [];
for (let r = 0; r < 8; r++) {
  const x = 640 + (r % 4) * 192, y = 768 + Math.floor(r / 4) * 192;
  leeg();
  koud.push(tijd(() => T.landStuk(E, x, y, 64, 64)));
  naast.push(tijd(() => T.landStuk(E, x + 64, y, 64, 64)));
  // de hoogte van dat stuk zoals js/hoogte.js hem vraagt
  hoogte.push(tijd(() => (T.eilandRaster ? T.eilandRaster(E, x + 64, y, 65, 65, true) : T.eilandStuk(E, x + 64 - 0.5, y - 0.5, 65, 65))));
}
const med = (a) => a.slice().sort((p, q) => p - q)[a.length >> 1].toFixed(1);
console.log(`stuk in een keer: koud ${med(koud)} ms, naast een gemaakt stuk ${med(naast)} ms; de hoogte erna ${med(hoogte)} ms`);
