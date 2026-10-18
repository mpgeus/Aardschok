// Een druk dorp, goedkoop: het proefdorp met N mensen erbij (T.wijzigBevolking, zonder huizen), drie dagen op 30x.
// Telt de tik, het zoeken (T.zoekPad: gewoon en als omweg, per soort) en hoe vaak T.ontwijk loopt.
const R = (process.env.WT || '/home/user/Aardschok/.claude/worktrees/agent-aba97b6a5c9834ff5') + '/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag, nu } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = Number(process.argv[3] || 30);
const N = Number(process.argv[2] || 100);
const D = S.dorp;
const voor = D.bewoners.mensen.length;
D.woonruimte = (D.woonruimte || 0) + N;
T.wijzigBevolking(D, N, 'groei');
let huidig = null;
const ontwijk = T.ontwijk;
let ontwijkN = 0;
T.ontwijk = function (S_, w, e) { huidig = e; ontwijkN++; try { return ontwijk.apply(this, arguments); } finally { huidig = null; } };
const zoek = T.zoekPad;
const per = new Map();
T.zoekPad = function () {
  const t0 = nu(); const r = zoek.apply(this, arguments); const ms = nu() - t0;
  const k = huidig ? (huidig.beest ? 'omweg beest' : 'omweg mens/ander') : 'ander zoeken';
  const s = per.get(k) || { n: 0, mis: 0, ms: 0 };
  s.n++; s.ms += ms; if (!r || !r.length) s.mis++;
  per.set(k, s);
  return r;
};
const dagen = Number(process.argv[4] || 3), dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
const tijden = [];
for (let i = 0; i < dagen * perDag; i++) { const t0 = nu(); beeld(S, dt); tijden.push(nu() - t0); }
const tot = tijden.reduce((a, b) => a + b, 0);
const s = [...tijden].sort((a, b) => a - b);
const mensen = S.wereld.wezens.filter((e) => !e.beest && !e.dier && !e.kar && !e.dood);
console.log(`bewoners ${voor} -> ${D.bewoners.mensen.length}, mensen op de kaart ${mensen.length}; gem tik ${(tot / tijden.length).toFixed(2)} ms, p95 ${s[Math.floor(s.length * 0.95)].toFixed(1)}, p99 ${s[Math.floor(s.length * 0.99)].toFixed(1)}, max ${s[s.length - 1].toFixed(0)} ms; ontwijk ${ontwijkN}x`);
for (const [k, v] of per) console.log(`${k.padEnd(18)} ${v.n} keer, ${v.mis} mislukt, ${v.ms.toFixed(0)} ms (${(100 * v.ms / tot).toFixed(0)}%)`);
