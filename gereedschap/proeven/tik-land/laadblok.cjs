// Het laden met de blokken: eerst alle blokken onder de open stukken (zoals een laadscherm het zou doen), dan de eerste
// tik; tegen de eerste tik zonder dat (die maakt elk stuk in één keer).
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
T.eilandVan(5);
const S = beginSpel({});
const w = S.dorp.wereld;
const E = T.eilandVan(w.eiland.zaad);
T.eilandRasterLeeg(E);
zetDag(S, 104, 20);
let warm = 0;
if (process.env.WARM) {
  const t0 = nu();
  const M = T.STUK_MARGE;
  for (const n of w.open) {
    const x = (n % 64) * T.STUK, y = Math.floor(n / 64) * T.STUK;
    while (T.eilandRasterVooruit(E, x - M, y - M, T.STUK + 2 * M, T.STUK + 2 * M));
    while (T.eilandRasterVooruit(E, x - M, y - M, T.STUK + 2 * M + 1, T.STUK + 2 * M + 1, true));
  }
  warm = nu() - t0;
}
let land = 0;
const oudL = T.landStuk;
T.landStuk = function (...a) { const t0 = nu(); const r = oudL.apply(this, a); land += nu() - t0; return r; };
const t1 = nu(); beeld(S, 1 / 60); const tik = nu() - t1;
console.log(`${process.env.WARM ? 'blokken vooraf' : 'zonder'}: blokken ${warm.toFixed(0)} ms, eerste tik ${tik.toFixed(0)} ms (land ${land.toFixed(0)}), samen ${(warm + tik).toFixed(0)} ms, ${w.open.size} stukken`);
