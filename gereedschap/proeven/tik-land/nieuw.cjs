// Een nieuw spel (T.proefdorp.begin, zoals js/main.js): wat kost het begin, en de eerste tikken erna.
const W = process.env.SPEL_WORTEL;
const { T, beeld, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const tel = { landStuk: 0, landMs: 0, wild: 0, wildMs: 0 };
const oud = T.landStuk;
T.landStuk = function (...a) { const t0 = nu(); const r = oud.apply(this, a); tel.landStuk++; tel.landMs += nu() - t0; return r; };
const oudWild = T.zetWildBij;
T.zetWildBij = function (...a) { const t0 = nu(); const r = oudWild.apply(this, a); tel.wild++; tel.wildMs += nu() - t0; return r; };
const zaad = +(process.env.ZAAD || 5);
let t0 = nu(); T.eilandVan(zaad); console.log('eiland', (nu() - t0).toFixed(0), 'ms');
t0 = nu();
const S = T.proefdorp.begin(zaad);
console.log('begin', (nu() - t0).toFixed(0), 'ms', JSON.stringify(tel), 'open', S.wereld.open.size);
for (const k in tel) tel[k] = 0;
Object.assign(S, { gebieden: {}, quests: {}, questWeg: {}, questBeloond: new Set(), bezocht: new Set(['hal']), naarGebied: null, netGeland: null, zoom: 1 }, T.schermVelden());
S.kalender.snelheid = 1;
for (let i = 0; i < +(process.env.TIKKEN || 4); i++) {
  const delen = {};
  const t1 = nu(); beeld(S, 1 / 60, delen); const ms = nu() - t1;
  console.log(`tik ${i}: ${ms.toFixed(1)} ms`, JSON.stringify(Object.fromEntries(Object.entries(delen).filter(([, v]) => v > 1).map(([k, v]) => [k, +v.toFixed(1)]))), JSON.stringify(Object.fromEntries(Object.entries(tel).map(([k, v]) => [k, +v.toFixed(1)]))), 'open', S.wereld.open.size);
  for (const k in tel) tel[k] = 0;
}
