// Micrometing: T.bosInVak(ookJong) en de diepte (BFS) voor de vakken van het wild, na een dag spelen.
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const { T, beginSpel, beeld, zetDag, nu } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const S = beginSpel({});
zetDag(S, 104, 20);
S.kalender.snelheid = 30;
const dt = 1 / 60, perDag = Math.round(T.DAG_LENGTE / 30 / dt);
for (let i = 0; i < perDag * 1.2; i++) beeld(S, dt);
const w = S.dorp.wereld;
const vakken = [...new Map(T.beestenOp(w).map(({ G }) => [JSON.stringify(G.bos.vak), G.bos.vak])).values()];
const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
const plekInVak = (vak, x, y) => (y - vak.y) * vak.b + (x - vak.x);
function diepVan(bos, vak) {
  const diep = new Int16Array(vak.b * vak.h).fill(-1);
  const rij = [];
  for (let i = 0; i < bos.length; i++) if (!bos[i]) { diep[i] = 0; rij.push(i); }
  for (let k = 0; k < rij.length; k++) {
    const i = rij[k]; const kol = i % vak.b; const x = vak.x + kol; const y = vak.y + (i - kol) / vak.b;
    for (const [dx, dy] of BUREN) {
      const nx = x + dx, ny = y + dy;
      if (!T.inVak(vak, nx, ny)) continue;
      const j = plekInVak(vak, nx, ny);
      if (diep[j] >= 0) continue;
      diep[j] = diep[i] + 1; rij.push(j);
    }
  }
  return diep;
}
for (let ronde = 0; ronde < 3; ronde++) {
  let tb = 0, td = 0, tv = 0;
  for (const vak of vakken) {
    let t0 = nu(); const bos = T.bosInVak(w, vak, true); tb += nu() - t0;
    t0 = nu(); diepVan(bos, vak); td += nu() - t0;
  }
  // voorwerpOp alleen, over dezelfde tegels met rand
  let t0 = nu(); let n = 0;
  for (const vak of vakken) for (let y = vak.y - 2; y < vak.y + vak.h + 2; y++) for (let x = vak.x - 2; x < vak.x + vak.b + 2; x++) if (T.voorwerpOp(w, x, y)) n++;
  tv = nu() - t0;
  console.log(`ronde ${ronde}: ${vakken.length} vakken, bosInVak ${tb.toFixed(2)} ms, diep ${td.toFixed(2)} ms, alleen voorwerpOp ${tv.toFixed(2)} ms (${n} met iets)`);
}
