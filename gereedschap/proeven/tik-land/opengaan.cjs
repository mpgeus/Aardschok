// Een stuk dat opengaat terwijl je speelt (het land is al vooruit gemaakt): wat kost die tik, en wat daarvan is het wild?
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const tel = { wild: 0, land: 0 };
const oudW = T.zetWildBij;
T.zetWildBij = function (...a) { const t0 = nu(); const r = oudW.apply(this, a); tel.wild += nu() - t0; return r; };
const oudL = T.landStuk;
T.landStuk = function (...a) { const t0 = nu(); const r = oudL.apply(this, a); tel.land += nu() - t0; return r; };
T.eilandVan(5);
const S = beginSpel({});
zetDag(S, 104, 20);
const w = S.dorp.wereld;
for (let i = 0; i < 600; i++) beeld(S, 1 / 60); // de eerste tik, het wild en het vooruit maken
// de stukken naast wat open is, die vooruit al gemaakt zijn
const open = [...w.open];
const buren = new Set();
for (const n of open) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const m = n + dx + dy * 64; if (!w.open.has(m)) buren.add(m); }
const uit = [];
for (const n of [...buren].slice(0, 6)) {
  w.open.add(n);
  tel.wild = 0; tel.land = 0;
  const delen = {};
  const t0 = nu(); beeld(S, 1 / 60, delen); const ms = nu() - t0;
  uit.push(`${ms.toFixed(0)} ms (wild ${tel.wild.toFixed(0)}, land ${tel.land.toFixed(0)}, dorpen ${(delen.dorpen || 0).toFixed(0)})`);
  for (let i = 0; i < 30; i++) beeld(S, 1 / 60);
}
console.log('een stuk gaat open:', uit.join('; '));
