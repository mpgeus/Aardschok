const { T, nu } = require('/home/user/Aardschok/gereedschap/grootte/harnas.cjs');
const E = T.eilandVan(5);
const meet = (x, y, d) => { const t0 = nu(); T.landStuk(E, x, y, d, d); return nu() - t0; };
for (let i = 0; i < 3; i++) meet(600 + i * 64, 600, 16); // opwarmen
const r16 = [], r64 = [];
for (let i = 0; i < 40; i++) r16.push(meet(800 + (i % 8) * 16, 900 + Math.floor(i / 8) * 16, 16));
for (let i = 0; i < 6; i++) r64.push(meet(1200 + i * 64, 1300, 64));
const s = a => `gem ${(a.reduce((p, q) => p + q, 0) / a.length).toFixed(1)} ms, max ${Math.max(...a).toFixed(1)} ms`;
console.log('deel 16x16:', s(r16)); console.log('stuk 64x64:', s(r64));
