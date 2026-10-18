// Opslaan en laden midden in het spel (met de veranderingen van proef.cjs): het geladen spel moet nacht voor nacht
// hetzelfde aflopen als het spel dat doorspeelde, ook al begint het zonder wat de kaart onthield (de bosKaart per vak).
// node laad.cjs <wortel>
const crypto = require('crypto');
const WORTEL = process.argv[2];
process.env.SPEL_WORTEL = WORTEL;
const { T, beginSpel, beeld, zetDag } = require(WORTEL + '/gereedschap/grootte/harnas.cjs');
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);
const dt = 1 / 60;
const VOOR = 5, NA = 6;

function speel(S, dagen, lcg0, metAfdruk) {
  const D = S.dorp, w = D.wereld;
  let lcg = lcg0;
  const r = () => (lcg = (lcg * 16807) % 2147483647) / 2147483647;
  const vakken = () => [...new Map(T.beestenOp(w).map(({ G }) => [JSON.stringify(G.bos.vak), G.bos.vak])).values()];
  const verander = (n) => {
    const vs = vakken();
    let gedaan = 0;
    for (let k = 0; k < n * 20 && gedaan < n; k++) {
      const vak = vs[Math.floor(r() * vs.length)];
      const x = vak.x - 3 + Math.floor(r() * (vak.b + 6));
      const y = vak.y - 3 + Math.floor(r() * (vak.h + 6));
      const v = T.voorwerpOp(w, x, y);
      if (v && v.soort !== 'hol') {
        if (r() < 0.5 && T.velBoom(D, x, y)) { gedaan++; continue; }
        if (!v.groep) { T.haalVoorwerpWeg(w, v); gedaan++; continue; }
      } else if (!v && r() < 0.3 && T.plantNaast(D, { x, y }, 'eik')) gedaan++;
    }
  };
  const uit = [];
  for (let d = 0; d < dagen; d++) {
    const dag = Math.floor(S.kalender.dag);
    let tik = 0;
    while (Math.floor(S.kalender.dag) === dag) {
      beeld(S, dt);
      tik++;
      if (tik === 3) verander(4);
      if (tik === 300) verander(6);
    }
    if (metAfdruk) uit.push(hash(T.bewaarSpel(S, { nu: 0 })));
  }
  return { uit, lcg };
}

const A = beginSpel({});
zetDag(A, 104, 20);
A.kalender.snelheid = 30;
const { lcg } = speel(A, VOOR, 777, false);
// een paar tikken na middernacht opslaan, zoals het spel elke ochtend vanzelf doet
const tekst = T.bewaarSpel(A, { nu: 0 });
const randomNu = Math.random; // het lot van het harnas loopt door; het geladen spel krijgt hetzelfde
const doorA = speel(A, NA, lcg, true);
// het geladen spel: een vers S zoals beginSpel het maakt, en dan het bewaarde spel erin
const B = Object.assign({
  tijd: 0, gebieden: {}, modus: 'verkennen', gevecht: null, overgang: null, bezig: false, inventaris: new Set(),
  kalender: T.nieuweKalender(), quests: {}, questWeg: {}, questBeloond: new Set(),
  bezocht: new Set(['hal']), naarGebied: null, netGeland: null, zoom: 1,
}, T.schermVelden());
const h = T.herstelSpel(B, tekst);
if (!h.gelukt) throw new Error(h.reden);
const doorB = speel(B, NA, lcg, true);
console.log('doorgespeeld', doorA.uit.join(' '));
console.log('geladen     ', doorB.uit.join(' '));
console.log('gelijk:', doorA.uit.join() === doorB.uit.join(), '| andere kaart na laden:', A.dorp.wereld !== B.dorp.wereld);
