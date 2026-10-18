// De omweg naar het doel (met tot) van een hert dat volgt: is er bij het doel nog een vrije tegel, en hangt hij al aan
// zijn kudde (via staande dieren van zijn groep tot de leider)?
const R = (process.env.WT || '/home/user/Aardschok/.claude/worktrees/agent-aba97b6a5c9834ff5') + '/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = Number(process.argv[2] || 30);
let huidig = null;
const ontwijk = T.ontwijk;
const tel = new Map();
const plus = (k, n = 1) => tel.set(k, (tel.get(k) || 0) + n);
T.ontwijk = function (S_, w, e) { huidig = e; try { return ontwijk.apply(this, arguments); } finally { huidig = null; } };
const zoek = T.zoekPad;
const B8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function aanKudde(w, e) {
  const G = e.groep;
  const leden = w.wezens.filter((x) => x.groep === G && !x.dood);
  const leider = leden.find((x) => x.leider);
  const gezien = new Set([leider]);
  const rij = [leider];
  while (rij.length) {
    const a = rij.pop();
    for (const b of leden) {
      if (gezien.has(b) || b === e || b.pad.length || b.onderweg) continue;
      if (T.afstand(T.tegelVan(a), T.tegelVan(b)) <= 1) { gezien.add(b); rij.push(b); }
    }
  }
  return [...gezien].some((a) => T.afstand(T.tegelVan(a), { x: e.tx, y: e.ty }) <= 1);
}
T.zoekPad = function (van, doel, mag, vast, o) {
  const r = zoek.apply(this, arguments);
  const e = huidig;
  if (e && e.beest && e.groep && !e.leider) {
    const w = S.wereld;
    const soort = e.beest;
    const soortPoging = o && (o.tot || o.naast) ? 'doel' : 'padtegel';
    plus(`${soort} ${soortPoging} gelukt ${!!(r && r.length)}`);
    if (!(r && r.length)) {
      plus(`${soort} mislukt, hangt aan kudde: ${aanKudde(w, e)}`);
      const leider = w.wezens.find((x) => x.groep === e.groep && x.leider);
      plus(`${soort} mislukt, afstand tot leider ${T.afstand({ x: e.tx, y: e.ty }, T.tegelVan(leider))}`);
      if (soortPoging === 'doel') {
        let vrij = 0;
        for (let dy = -o.tot; dy <= o.tot; dy++) for (let dx = -o.tot; dx <= o.tot; dx++) if (T.isBegaanbaar(w, doel.x + dx, doel.y + dy, { wezensBlokkeren: true, wie: e })) vrij++;
        plus(`${soort} mislukt doel, vrije tegels bij doel ${vrij}`);
      }
    }
  }
  return r;
};
const dagen = 3, dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
for (let i = 0; i < dagen * perDag; i++) beeld(S, dt);
for (const [k, v] of [...tel].sort()) console.log(k.padEnd(50), v);
