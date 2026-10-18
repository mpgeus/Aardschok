// Alleen de tik, zonder meetlat: node tik.cjs [extra mensen] [dagen] [snelheid]. Proefdorp, vanaf dag 104 20:00.
const R = (process.env.WT || '/home/user/Aardschok/.claude/worktrees/agent-aba97b6a5c9834ff5') + '/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag, nu } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
const N = Number(process.argv[2] || 0);
const dagen = Number(process.argv[3] || 3);
S.kalender.snelheid = Number(process.argv[4] || 30);
if (N) {
  S.dorp.woonruimte = (S.dorp.woonruimte || 0) + N;
  T.wijzigBevolking(S.dorp, N, 'groei');
}
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
const tijden = [];
for (let i = 0; i < dagen * perDag; i++) { const t0 = nu(); beeld(S, dt); tijden.push(nu() - t0); }
const tot = tijden.reduce((a, b) => a + b, 0);
const s = [...tijden].sort((a, b) => a - b);
console.log(`${(process.env.WT || 'worktree').split('/').pop().padEnd(12)} N+${N} ${S.kalender.snelheid}x ${dagen}d: gem ${(tot / tijden.length).toFixed(3)} ms, p95 ${s[Math.floor(s.length * 0.95)].toFixed(2)}, p99 ${s[Math.floor(s.length * 0.99)].toFixed(2)}`);
