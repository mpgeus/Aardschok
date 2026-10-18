// Hoe vaak verandert de kaart per dag (T.kaartVeranderd), en wat werd er gezet en weggehaald.
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const { T, beginSpel, beeld, zetDag } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const S = beginSpel({});
zetDag(S, +(process.env.DAG || 104), 20);
S.kalender.snelheid = 30;
const dt = 1 / 60;
let n = 0, zonder = 0; const soorten = {};
const f = T.kaartVeranderd;
T.kaartVeranderd = function (w, plek) { n++; if (!plek) zonder++; return f.apply(this, arguments); };
const zv = T.zetVoorwerp, hv = T.haalVoorwerpWeg;
T.zetVoorwerp = (w, v) => { soorten['+' + v.soort] = (soorten['+' + v.soort] || 0) + 1; return zv(w, v); };
T.haalVoorwerpWeg = (w, v) => { soorten['-' + v.soort] = (soorten['-' + v.soort] || 0) + 1; return hv(w, v); };
for (let d = 0; d < +(process.argv[3] || 6); d++) {
  n = 0; zonder = 0; for (const k in soorten) delete soorten[k];
  const dag = Math.floor(S.kalender.dag);
  while (Math.floor(S.kalender.dag) === dag) beeld(S, dt);
  console.log('dag', dag, 'kaartVeranderd', n, 'zonder plek', zonder, 'open', S.dorp.wereld.open.size, JSON.stringify(soorten));
}
