// Het laden: hoeveel kost T.herstelSpel (beginSpel), en de eerste tikken erna; telt T.landStuk en T.eilandStuk.
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const tel = { landStuk: 0, landMs: 0, eilandStuk: 0, eilandMs: 0, wild: 0, wildMs: 0 };
for (const [k, naam] of [['landStuk', 'land'], ['eilandStuk', 'eiland']]) {
  const oud = T[k];
  T[k] = function (...a) { const t0 = nu(); const r = oud.apply(this, a); tel[k]++; tel[naam + 'Ms'] += nu() - t0; return r; };
}
const oudWild = T.zetWildBij;
if (oudWild) T.zetWildBij = function (...a) { const t0 = nu(); const r = oudWild.apply(this, a); tel.wild++; tel.wildMs += nu() - t0; return r; };
T.eilandVan(5); // het eiland zelf apart (dat doet het laadscherm ook)
const t0 = nu();
const S = beginSpel({});
const tLaad = nu() - t0;
const vooraf = { ...tel };
console.log('laden (proefdorp + herstel)', tLaad.toFixed(0), 'ms', JSON.stringify(vooraf));
for (const k in tel) tel[k] = 0;
console.log('open stukken', S.dorp.wereld.open.size);
zetDag(S, 104, 20);
S.kalender.snelheid = 30;
const dt = 1 / 60;
for (let i = 0; i < +(process.env.TIKKEN || 5); i++) {
  const delen = {};
  const t1 = nu(); beeld(S, dt, delen); const ms = nu() - t1;
  console.log(`tik ${i}: ${ms.toFixed(1)} ms`, JSON.stringify(Object.fromEntries(Object.entries(delen).filter(([, v]) => v > 1).map(([k, v]) => [k, +v.toFixed(1)]))), JSON.stringify(Object.fromEntries(Object.entries(tel).map(([k, v]) => [k, +v.toFixed(1)]))));
  for (const k in tel) tel[k] = 0;
}
