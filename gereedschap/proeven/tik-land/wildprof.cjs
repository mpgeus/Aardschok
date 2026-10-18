// Profiel van de eerste tik van een nieuw spel (het wild), of met LADEN=1 van een geladen proefdorp.
const W = process.env.SPEL_WORTEL;
const H = require(W + '/gereedschap/grootte/harnas.cjs');
const { T, beeld, nu } = H;
const inspector = require('inspector'); const fs = require('fs');
const zaad = +(process.env.ZAAD || 5);
T.eilandVan(zaad);
let S;
if (process.env.LADEN) { S = H.beginSpel({}); H.zetDag(S, 104, 20); }
else {
  S = T.proefdorp.begin(zaad);
  Object.assign(S, { gebieden: {}, quests: {}, questWeg: {}, questBeloond: new Set(), bezocht: new Set(['hal']), naarGebied: null, netGeland: null, zoom: 1 }, T.schermVelden());
}
const ses = new inspector.Session(); ses.connect();
const post = (m, p) => new Promise((ok, nee) => ses.post(m, p || {}, (f, r) => (f ? nee(f) : ok(r))));
(async () => {
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 50 });
  await post('Profiler.start');
  const t0 = nu(); beeld(S, 1 / 60, {}); console.log('tik 0', (nu() - t0).toFixed(1));
  const { profile } = await post('Profiler.stop');
  fs.writeFileSync(__dirname + '/tik0.cpuprofile', JSON.stringify(profile));
})();
