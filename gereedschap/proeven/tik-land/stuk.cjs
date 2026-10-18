// landStuk: een deel van 16 en een stuk van 64, op steeds ander land (geen voorraad die van een vorige meting komt).
const { T, nu } = require(process.env.SPEL_WORTEL + '/gereedschap/grootte/harnas.cjs');
const E = T.eilandVan(5);
const meet = (x, y, d) => { const t0 = nu(); T.landStuk(E, x, y, d, d); return nu() - t0; };
for (let i = 0; i < 3; i++) meet(300 + i * 64, 300, 16); // opwarmen
const gem = a => a.reduce((p, q) => p + q, 0) / a.length;
const uit = { d16: [], d16max: [], s64: [], s64max: [] };
for (let ronde = 0; ronde < 4; ronde++) {
  const r16 = [], r64 = [];
  const ox = 640 + ronde * 256;
  // een heel stuk van 64 in 16 delen, zoals maakVooruit
  for (let i = 0; i < 16; i++) r16.push(meet(ox + (i % 4) * 16, 900 + Math.floor(i / 4) * 16, 16));
  for (let i = 0; i < 3; i++) r64.push(meet(ox + 64 + i * 64, 1300, 64));
  uit.d16.push(gem(r16)); uit.d16max.push(Math.max(...r16)); uit.s64.push(gem(r64)); uit.s64max.push(Math.max(...r64));
}
const med = a => a.slice().sort((p, q) => p - q)[Math.floor(a.length / 2)];
console.log(`deel 16x16: gem ${med(uit.d16).toFixed(1)} ms (max ${med(uit.d16max).toFixed(1)}), dus een stuk in delen ${(16 * med(uit.d16)).toFixed(0)} ms; stuk 64x64 in een keer: ${med(uit.s64).toFixed(1)} ms (max ${med(uit.s64max).toFixed(1)})`);
