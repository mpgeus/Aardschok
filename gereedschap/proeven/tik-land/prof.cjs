// Profiel van landStuk op delen van 16 (of D) in de worktree.
const W = process.env.SPEL_WORTEL;
const { T, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const inspector = require('inspector'); const fs = require('fs');
const E = T.eilandVan(5);
const D = +process.env.D || 16;
for (let i = 0; i < 3; i++) T.landStuk(E, 600 + i * 64, 600, D, D);
const ses = new inspector.Session(); ses.connect();
const post = (m, p) => new Promise((ok, nee) => ses.post(m, p || {}, (f, r) => (f ? nee(f) : ok(r))));
(async () => {
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 50 });
  await post('Profiler.start');
  const t0 = nu();
  const n = 64;
  for (let i = 0; i < n; i++) T.landStuk(E, 800 + (i % 8) * D, 900 + Math.floor(i / 8) * D, D, D);
  console.log('per deel', ((nu() - t0) / n).toFixed(2));
  const { profile } = await post('Profiler.stop');
  fs.writeFileSync(__dirname + '/prof.cpuprofile', JSON.stringify(profile));
})();
