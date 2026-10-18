// T.eilandStuk zelf: microseconden per punt (82 bij 82, zoals het rekenvak van een stuk), beste van een paar rondes.
const { T, nu } = require(process.env.SPEL_WORTEL + '/gereedschap/grootte/harnas.cjs');
const E = T.eilandVan(5);
const best = [];
for (let ronde = 0; ronde < 6; ronde++) {
  let ms = 0;
  for (let i = 0; i < 8; i++) { const t0 = nu(); T.eilandStuk(E, 600 + i * 96, 800 + ronde * 96, 82, 82); ms += nu() - t0; }
  best.push(ms / (8 * 84 * 84) * 1000);
}
best.sort((a, b) => a - b);
console.log(`eilandStuk: ${best[0].toFixed(2)} µs per punt (mediaan ${best[3].toFixed(2)})`);
