// Na het laden (proefdorp, dag 104, 30x): de eerste tik, en de tikken erna (tot TIKKEN), met wat het land kost.
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const tel = { land: 0, landMs: 0, ruw: 0, ruwMs: 0 };
const oudL = T.landStuk;
const maten = {};
T.landStuk = function (...a) { maten[a[3]] = (maten[a[3]] || 0) + 1; const t0 = nu(); const r = oudL.apply(this, a); tel.land++; tel.landMs += nu() - t0; return r; };
const oudE = T.eilandStuk;
T.eilandStuk = function (...a) { const t0 = nu(); const r = oudE.apply(this, a); tel.ruw++; tel.ruwMs += nu() - t0; return r; };
T.eilandVan(5);
const S = beginSpel({});
if (T.eilandRasterLeeg) T.eilandRasterLeeg(T.eilandVan(S.dorp.wereld.eiland.zaad)); // wat het proefdorp maken al rekende, telt niet
zetDag(S, 104, 20);
S.kalender.snelheid = 30;
for (const k in tel) tel[k] = 0;
for (const k in maten) delete maten[k];
const dt = 1 / 60;
const tikken = [];
const N = +(process.env.TIKKEN || 900);
let landTot = 0, ruwTot = 0;
for (let i = 0; i < N; i++) {
  const t1 = nu(); beeld(S, dt); const ms = nu() - t1;
  tikken.push({ i, ms, land: tel.landMs, ruw: tel.ruwMs });
  if (i > 0) { landTot += tel.landMs; ruwTot += tel.ruwMs; }
  for (const k in tel) tel[k] = 0;
}
const rest = tikken.slice(1).map((t) => t.ms).sort((a, b) => a - b);
const p = (q) => rest[Math.min(rest.length - 1, Math.floor(q * rest.length))].toFixed(1);
console.log(`eerste tik ${tikken[0].ms.toFixed(0)} ms (land ${tikken[0].land.toFixed(0)}); daarna ${N - 1} tikken: mediaan ${p(0.5)}, p90 ${p(0.9)}, p99 ${p(0.99)}, max ${rest[rest.length - 1].toFixed(1)} ms; boven 12 ms: ${rest.filter((m) => m > 12).length}; land samen ${landTot.toFixed(0)} ms (eilandStuk ${ruwTot.toFixed(0)}); stukken gemaakt ${T.openGrootte(S.dorp.wereld)} open`);
console.log('landStuk per maat', JSON.stringify(maten));
if (process.env.LIJST) console.log(tikken.slice(1, 80).map((t) => t.ms.toFixed(0)).join(' '));
