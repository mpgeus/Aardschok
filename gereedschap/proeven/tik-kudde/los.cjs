// Ziet de kudde er nog goed uit? Elke halve seconde (echt) per groep: hoe ver staan de volgers van de leider, als hij
// staat en als hij loopt; hoe lang staat een volger ver weg stil; en vluchten ze nog (afstand tot de leider aan het eind).
// Plus de tik zonder meetlat. node kudde.cjs [snelheid] [dagen]
const R = (process.env.WT || '/home/user/Aardschok/.claude/worktrees/agent-aba97b6a5c9834ff5') + '/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag, nu } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = Number(process.argv[2] || 30);
const dagen = Number(process.argv[3] || 3);
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
const hist = { staat: new Map(), loopt: new Map(), vlucht: new Map() };
const plus = (m, k) => m.set(k, (m.get(k) || 0) + 1);
const stil = new Map(); // volger -> sinds wanneer (wereldtijd) staat hij ver (>3) van een stilstaande leider
let langst = 0, verStil = 0, monsters = 0;
let tik = 0;
const tijden = [];
let vluchten = 0;
const wasWeg = new Map();
for (let i = 0; i < dagen * perDag; i++) {
  const t0 = nu(); beeld(S, dt); tijden.push(nu() - t0);
  if (i % 30) continue;
  const w = S.wereld;
  const groepen = new Map();
  for (const e of w.wezens) if (e.beest && e.groep && !e.dood) (groepen.get(e.groep) || groepen.set(e.groep, []).get(e.groep)).push(e);
  for (const [G, leden] of groepen) {
    if (G.ver) continue; // rust: niemand dichtbij, geen weg
    const leider = leden.find((e) => e.leider);
    if (!leider) continue;
    const weg = G.weg > S.kalender.dag;
    if (weg && !wasWeg.get(G)) vluchten++;
    wasWeg.set(G, weg);
    const soort = weg ? 'vlucht' : leider.pad.length ? 'loopt' : 'staat';
    for (const e of leden) {
      if (e === leider) continue;
      const d = T.afstand(T.tegelVan(e), T.tegelVan(leider));
      plus(hist[soort], Math.min(d, 9));
      const buur = leden.some((b) => b !== e && T.afstand(T.tegelVan(b), T.tegelVan(e)) <= 1);
      if (soort === 'staat' && d > 3 && !buur) {
        if (!stil.has(e)) stil.set(e, S.wereldTijd);
        if (S.wereldTijd - stil.get(e) > langst) { langst = S.wereldTijd - stil.get(e); globalThis.wie = { soort: e.beest, d, pad: e.pad.length, zoektWeg: e.zoektWeg != null ? (e.zoektWeg - S.wereldTijd).toFixed(1) : null, weg: !!T.zoekRoute(S.wereld, T.tegelVan(e), T.tegelVan(leider), { tot: 2 }), bijKring: leden.length, G: G.doel }; }
        verStil++;
      } else stil.delete(e);
    }
  }
}
const tot = tijden.reduce((a, b) => a + b, 0);
const s = [...tijden].sort((a, b) => a - b);
console.log(`snelheid ${S.kalender.snelheid}x, ${dagen} dagen, gem tik ${(tot / tijden.length).toFixed(3)} ms, p99 ${s[Math.floor(s.length * 0.99)].toFixed(2)} ms, max ${s[s.length - 1].toFixed(1)} ms`);
for (const k of ['staat', 'loopt', 'vlucht']) {
  const m = hist[k]; const n = [...m.values()].reduce((a, b) => a + b, 0) || 1;
  const rij = []; for (let d = 0; d <= 9; d++) rij.push(`${d}${d === 9 ? '+' : ''}:${(100 * (m.get(d) || 0) / n).toFixed(0)}%`);
  console.log(`leider ${k.padEnd(6)} (${n} metingen) afstand volger-leider ${rij.join(' ')}`);
}
console.log(`vluchten begonnen ${vluchten}; volger los (>3 van een stilstaande leider, geen dier van zijn groep naast hem): ${verStil} metingen, langst ${langst.toFixed(0)} s wereld`);
console.log('langst los:', JSON.stringify(globalThis.wie));
