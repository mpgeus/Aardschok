// Lockstep met veranderingen: elke dag haalt het (vast lot) bomen, stronken en struiken weg en plant boompjes in en om
// de vakken van het wild, op een paar momenten van de dag (ook vlak na middernacht en meer dan 64 in één dag), en op dag 4
// gaat er een stuk land open. Elke nacht: T.bosInVak(ookJong) tegen T.isBos per tegel (de definitie), voor elk vak van
// het wild; en een afdruk van S (T.bewaarSpel). node proef.cjs <wortel> [dagen]
const crypto = require('crypto');
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const DAGEN = +(process.argv[3] || 12);
const { T, beginSpel, beeld, zetDag } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const S = beginSpel({});
zetDag(S, +(process.env.DAG || 104), 20);
S.kalender.snelheid = 30;
const D = S.dorp, w = D.wereld;
const tijden = [];
{ const f = T.tikBeestenDag; T.tikBeestenDag = function (...a) { const t0 = process.hrtime.bigint(); try { return f.apply(this, a); } finally { tijden.push(Number(process.hrtime.bigint() - t0) / 1e6); } }; }
const dt = 1 / 60;
const perDag = Math.round(T.DAG_LENGTE / 30 / dt);
let lcg = 12345;
const r = () => (lcg = (lcg * 16807) % 2147483647) / 2147483647;
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const vakken = () => [...new Map(T.beestenOp(w).map(({ G }) => [JSON.stringify(G.bos.vak), G.bos.vak])).values()];
function verander(n) {
  const vs = vakken();
  let gedaan = 0;
  for (let k = 0; k < n * 20 && gedaan < n; k++) {
    const vak = process.env.WEINIG ? vs[0] : vs[Math.floor(r() * vs.length)];
    // ook net buiten het vak: de rand van twee tegels telt mee
    const x = vak.x - 3 + Math.floor(r() * (vak.b + 6));
    const y = vak.y - 3 + Math.floor(r() * (vak.h + 6));
    const v = T.voorwerpOp(w, x, y);
    if (v && v.soort !== 'hol' && !T.isBouwwerk?.(v)) {
      if (r() < 0.5 && T.velBoom(D, x, y)) { gedaan++; continue; } // boom om: een stronk (blijft jong bos)
      if (!v.groep) { T.haalVoorwerpWeg(w, v); gedaan++; continue; } // weg: daar kan het bos minder worden
    } else if (!v && r() < 0.3) {
      const t = { x, y };
      if (T.plantNaast(D, t, 'eik')) gedaan++;
    }
  }
  return gedaan;
}
const fout = [];
const vorige = new Map(); let nieuw = 0, zelfde = 0, bosAnders = 0;
function controleer(dag) {
  for (const vak of vakken()) {
    const a = T.bosInVak(w, vak, true);
    const k = JSON.stringify(vak); const was = vorige.get(k);
    if (was === a) zelfde++; else { nieuw++; if (was) for (let i = 0; i < a.length; i++) if (a[i] !== was[i]) bosAnders++; }
    vorige.set(k, a.slice ? a : a);
    let mis = 0;
    for (let y = vak.y; y < vak.y + vak.h; y++) for (let x = vak.x; x < vak.x + vak.b; x++) if (a[(y - vak.y) * vak.b + (x - vak.x)] !== (T.isBos(w, x, y, true) ? 1 : 0)) mis++;
    if (mis) fout.push(`dag ${dag} vak ${vak.x},${vak.y}: ${mis} tegels anders`);
  }
}
const afdrukken = [];
let veranderd = 0;
for (let d = 0; d < DAGEN; d++) {
  const dag = Math.floor(S.kalender.dag);
  let tik = 0;
  while (Math.floor(S.kalender.dag) === dag) {
    beeld(S, dt);
    tik++;
    if (tik === 3) veranderd += verander(d % 3 === 2 ? 80 : 4); // vlak na middernacht; om de drie dagen meer dan 64
    if (tik === Math.floor(perDag / 2)) veranderd += verander(6);
    if (tik === Math.floor(perDag * 0.8)) veranderd += verander(3);
    if (d === 4 && tik === Math.floor(perDag * 0.6)) { // een stuk land erbij, naast de vakken
      const n = [...w.open].map((m) => m + 1).find((m) => !w.open.has(m));
      w.open.add(n);
    }
  }
  controleer(Math.floor(S.kalender.dag));
  afdrukken.push(hash(T.bewaarSpel(S, { nu: 0 })));
}
console.log('veranderingen', veranderd, '| open', w.open.size, '| vakken', vakken().length, '| groepen', T.beestenOp(w).length);
console.log('per tik', perDag, '| vak opnieuw', nieuw, 'onthouden', zelfde, '| bostegels anders dan de nacht ervoor', bosAnders);
console.log('bosInVak tegen T.isBos:', fout.length ? fout.join('; ') : 'overal gelijk');
{ const t = tijden.slice(1).sort((a, b) => a - b); console.log('tikBeestenDag mediaan', t[Math.floor(t.length / 2)].toFixed(2), 'ms, max', t[t.length - 1].toFixed(2)); }
console.log('afdruk', afdrukken.join(' '));
