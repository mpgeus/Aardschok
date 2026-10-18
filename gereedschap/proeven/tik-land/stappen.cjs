// Elke stap van het vooruit maken los (T.werkStukkenBij met dt 0 doet er precies één): wat kost een stap, per soort.
// KOUD=1: de blokken leeg na de eerste tik, zoals een stuk ver van wat er al was.
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
let soort = null;
const oudL = T.landStuk;
T.landStuk = function (...a) { soort = soort || 'deel'; return oudL.apply(this, a); };
const oudE = T.eilandStuk;
T.eilandStuk = function (...a) { soort = soort || 'blok'; return oudE.apply(this, a); };
T.eilandVan(5);
const S = beginSpel({});
zetDag(S, 104, 20);
beeld(S, 1 / 60); // de eerste tik: de open stukken
const E = T.eilandVan(S.dorp.wereld.eiland.zaad);
if (process.env.KOUD && T.eilandRasterLeeg) T.eilandRasterLeeg(E);
const per = {};
let n = 0;
for (let i = 0; i < 4000; i++) {
  soort = null;
  const t0 = nu(); T.werkStukkenBij(S, S.dorp, 0); const ms = nu() - t0;
  const k = soort || 'rest';
  (per[k] = per[k] || []).push(ms);
  n++;
  if (k === 'rest' && ms < 0.2) break; // niets meer te doen
}
for (const [k, a] of Object.entries(per)) {
  a.sort((p, q) => p - q);
  const som = a.reduce((p, q) => p + q, 0);
  console.log(`${k.padEnd(5)} ${String(a.length).padStart(4)} stappen, samen ${som.toFixed(0)} ms, mediaan ${a[a.length >> 1].toFixed(2)}, max ${a[a.length - 1].toFixed(1)} ms` + (k === 'rest' ? ' (' + a.filter((m) => m > 1).map((m) => m.toFixed(1)).join(' ') + ')' : ''));
}
