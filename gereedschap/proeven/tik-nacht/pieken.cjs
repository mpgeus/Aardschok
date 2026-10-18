// De traagste tikken over een stuk van het jaar (niet alleen middernacht): uur, ms en delen (T.wereldTik meet).
// DAG=<begindag> node pieken.cjs <wortel> <dagen>
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const DAGEN = +(process.argv[3] || 6);
const { T, beginSpel, beeld, zetDag, nu } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const S = beginSpel({});
zetDag(S, +(process.env.DAG || 104), 20);
S.kalender.snelheid = 30;
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / 30 / dt);
const lijst = [];
for (let i = 0; i < DAGEN * perDag; i++) {
  const voor = S.kalender.dag;
  const delen = {};
  const t0 = nu(); beeld(S, dt, delen); const ms = nu() - t0;
  lijst.push({ ms, dag: T.datumVanDag(Math.floor(S.kalender.dag)).tekst, uur: +((voor % 1) * 24).toFixed(2), delen: Object.fromEntries(Object.entries(delen).filter(([, v]) => v > 0.3).map(([k, v]) => [k, +v.toFixed(1)])) });
}
const per = (f) => { const m = {}; for (const l of lijst) { const k = f(l); m[k] = Math.max(m[k] || 0, l.ms); } return m; };
lijst.sort((a, b) => b.ms - a.ms);
for (const l of lijst.slice(0, +(process.env.N || 12))) console.log(l.ms.toFixed(1).padStart(6), 'ms', l.dag.padEnd(18), 'uur', String(l.uur).padEnd(6), JSON.stringify(l.delen));
