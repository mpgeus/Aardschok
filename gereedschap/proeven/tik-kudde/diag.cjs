// Waarom loopt een volger vast? Bij elke omweg van een volger: wie staat er in de weg, loopt de leider, waar wil hij heen.
const R = (process.env.WT || '/home/user/Aardschok/.claude/worktrees/agent-aba97b6a5c9834ff5') + '/gereedschap/grootte/';
const { T, beginSpel, beeld, zetDag } = require(R + 'harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = Number(process.argv[2] || 30);
let huidig = null;
const ontwijk = T.ontwijk;
const tel = new Map();
const plus = (k, n = 1) => tel.set(k, (tel.get(k) || 0) + n);
const perDier = new Map();
let inOmweg = false;
T.ontwijk = function (S_, w, e, v, dt) { huidig = e; try { return ontwijk.apply(this, arguments); } finally { huidig = null; inOmweg = false; } };
const zoek = T.zoekPad;
T.zoekPad = function (van, doel) {
  const r = zoek.apply(this, arguments);
  if (huidig && huidig.beest && huidig.groep && !huidig.leider && !inOmweg) {
    inOmweg = true;
    const e = huidig, w = S.wereld, G = e.groep;
    const n = e.pad[0];
    const ander = T.wezenOp(w, n.x, n.y, e);
    const leider = w.wezens.find((x) => x.groep === G && x.leider);
    plus('omwegen ' + e.beest);
    if (e.beest !== 'hert') return r;
    plus('leider loopt: ' + !!(leider && leider.pad.length));
    plus('ander: ' + (!ander ? 'niemand' : ander.groep === G ? (ander.leider ? 'eigen leider' : 'eigen volger') : ander.beest ? 'ander wild' : 'mens/ander'));
    if (ander) plus('ander loopt: ' + !!(ander.onderweg || ander.pad.length));
    plus('padDoel tot ' + (e.padDoel && e.padDoel.tot));
    plus('pad lengte ' + Math.min(e.pad.length, 6));
    plus('gelukt: ' + !!(r && r.length));
    plus('G.doel ' + G.doel + (G.weg > S.kalender.dag ? ' (vlucht)' : ''));
    const eind = e.pad[e.pad.length - 1];
    const opEind = T.wezenOp(w, eind.x, eind.y, e);
    plus('op zijn eindtegel: ' + (!opEind ? 'niemand' : opEind.groep === G ? 'eigen' : 'ander'));
    let vrij = 0, open = 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      if (T.isBegaanbaar(w, e.tx + dx, e.ty + dy, {})) open++;
      if (T.isBegaanbaar(w, e.tx + dx, e.ty + dy, { wezensBlokkeren: true, wie: e })) vrij++;
    }
    plus('open buren ' + open);
    plus('vrije buren ' + vrij);
    const p = perDier.get(e) || { n: 0 }; p.n++; perDier.set(e, p);
  }
  return r;
};
const dagen = 3, dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / S.kalender.snelheid / dt);
for (let i = 0; i < dagen * perDag; i++) beeld(S, dt);
for (const [k, v] of [...tel].sort()) console.log(k.padEnd(34), v);
const n = [...perDier.values()].map((p) => p.n).sort((a, b) => b - a);
console.log('dieren met omwegen', n.length, 'meeste', n.slice(0, 12).join(' '));
const herten = S.wereld.wezens.filter((e) => e.beest === 'hert');
console.log('herten', herten.length, 'groepen', new Set(herten.map((e) => e.groep)).size);
