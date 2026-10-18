// De traagste tikken: per deel (T.wereldTik meet) en een fijn profiel van alleen die tikken. Zes dagen op 30x.
const inspector = require('inspector');
const fs = require('fs');
const R = '/home/user/Aardschok/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag, nu } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = 30;
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / 30 / dt);
const ses = new inspector.Session(); ses.connect();
const post = (m, p) => new Promise((ok, nee) => ses.post(m, p || {}, (f, r) => (f ? nee(f) : ok(r))));
(async () => {
  await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 25 });
  const lijst = [];
  const dag = () => Math.floor(S.kalender.dag);
  for (let i = 0; i < 6 * perDag; i++) {
    const voor = S.kalender.dag;
    const nacht = (Math.floor(voor + 1 / 24 / 60 * 0.5 * 1.01) !== Math.floor(voor)); // deze tik gaat over middernacht
    const delen = {};
    if (nacht) await post('Profiler.start');
    const t0 = nu(); beeld(S, dt, delen); const ms = nu() - t0;
    if (nacht) { const { profile } = await post('Profiler.stop'); fs.writeFileSync(`${__dirname}/nacht-${lijst.filter(l => l.nacht).length}.cpuprofile`, JSON.stringify(profile)); }
    lijst.push({ i, ms, nacht, uur: +((voor % 1) * 24).toFixed(2), delen: Object.fromEntries(Object.entries(delen).map(([k, v]) => [k, +v.toFixed(1)])) });
  }
  lijst.sort((a, b) => b.ms - a.ms);
  for (const l of lijst.slice(0, 12)) console.log(l.ms.toFixed(1).padStart(6), 'ms', l.nacht ? 'NACHT' : '     ', 'uur', l.uur, JSON.stringify(l.delen));
})();
