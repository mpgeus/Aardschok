// Profiel van het wild in de tikken waarin een stuk opengaat (het land van die stukken is er al).
const W = process.env.SPEL_WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(W + '/gereedschap/grootte/harnas.cjs');
const inspector = require('inspector'); const fs = require('fs');
T.eilandVan(5);
const S = beginSpel({});
zetDag(S, 104, 20);
const w = S.dorp.wereld;
for (let i = 0; i < 600; i++) beeld(S, 1 / 60);
const buren = new Set();
for (const n of [...w.open]) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const m = n + dx + dy * 64; if (!w.open.has(m)) buren.add(m); }
const ses = new inspector.Session(); ses.connect();
const post = (m, p) => new Promise((ok, nee) => ses.post(m, p || {}, (f, r) => (f ? nee(f) : ok(r))));
(async () => {
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 50 });
  let i = 0;
  const tijden = [];
  for (const n of [...buren].slice(0, 6)) {
    w.open.add(n);
    T.tegel(w, (n % 64) * 64, Math.floor(n / 64) * 64); // het land van het stuk, buiten het profiel
    T.isBegaanbaar(w, (n % 64) * 64, Math.floor(n / 64) * 64); // en het raster
    await post('Profiler.start');
    const t0 = nu(); beeld(S, 1 / 60); tijden.push((nu() - t0).toFixed(0));
    const { profile } = await post('Profiler.stop');
    fs.writeFileSync(`${__dirname}/open-${i++}.cpuprofile`, JSON.stringify(profile));
    for (let k = 0; k < 30; k++) beeld(S, 1 / 60);
  }
  console.log('tik waarin het opengaat (land en raster er al):', tijden.join(' '), 'ms');
})();
