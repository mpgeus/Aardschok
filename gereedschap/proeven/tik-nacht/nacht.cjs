// De tikken over middernacht: ms per nacht, per regel (beesten, gebouwen, paden), en een vingerafdruk van S per dag.
// node nacht.cjs <wortel> [dagen] [profiel-voorvoegsel]
const crypto = require('crypto');
const fs = require('fs');
const inspector = require('inspector');
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const DAGEN = +(process.argv[3] || 6);
const PROF = process.argv[4] || null;
const { T, beginSpel, beeld, zetDag, nu } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const S = beginSpel({});
zetDag(S, +(process.env.DAG || 104), 20);
S.kalender.snelheid = 30;
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / 30 / dt);
const regel = {};
for (const naam of ['tikBeestenDag', 'tikGebouwenDag', 'tikPadenDag', 'bosInVak', 'verdeelHanden', 'wijsWerkToe', 'plekOpHetPlein', 'looptijdVan', 'deurVanBewoner', 'tikBosDag', 'werkStukkenBij']) {
  const f = T[naam];
  T[naam] = function (...a) { const t0 = nu(); try { return f.apply(this, a); } finally { regel[naam] = (regel[naam] || 0) + nu() - t0; } };
}
const ses = new inspector.Session(); ses.connect();
const post = (m, p) => new Promise((ok, nee) => ses.post(m, p || {}, (f, r) => (f ? nee(f) : ok(r))));
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
(async () => {
  if (PROF) { await post('Profiler.enable'); await post('Profiler.setSamplingInterval', { interval: 25 }); }
  const nachten = [];
  const afdrukken = [];
  let gewoon = 0, nGewoon = 0, n = 0, stap = 0;
  for (let i = 0; i < DAGEN * perDag; i++) {
    const voor = Math.floor(S.kalender.dag);
    for (const k in regel) delete regel[k];
    const isNacht = Math.floor(S.kalender.dag + stap * 1.5) !== voor;
    if (PROF && isNacht) await post('Profiler.start');
    const dag0 = S.kalender.dag;
    const t0 = nu(); beeld(S, dt); const ms = nu() - t0;
    stap = S.kalender.dag - dag0;
    if (PROF && isNacht) { const { profile } = await post('Profiler.stop'); fs.writeFileSync(`${PROF}-${n++}.cpuprofile`, JSON.stringify(profile)); }
    if (Math.floor(S.kalender.dag) !== voor) {
      nachten.push({ dag: Math.floor(S.kalender.dag), ms: +ms.toFixed(1), ...Object.fromEntries(Object.entries(regel).map(([k, v]) => [k.replace(/^tik|Dag$/g, ''), +v.toFixed(1)])) });
      afdrukken.push(hash(T.bewaarSpel(S, { nu: 0 })));
    } else { gewoon += ms; nGewoon++; }
  }
  for (const r of nachten) console.log(JSON.stringify(r));
  console.log('gewone tik gem', (gewoon / nGewoon).toFixed(2), 'ms');
  console.log('afdruk', afdrukken.join(' '));
  const w = S.dorp.wereld;
  const groepen = T.beestenOp(w).map(({ G, leden }) => `${G.soort}@${G.thuis.x},${G.thuis.y}x${leden.length}`).join(' ');
  console.log('groepen', groepen);
})();
