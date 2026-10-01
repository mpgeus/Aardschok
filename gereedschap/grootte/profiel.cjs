'use strict';
// node profiel.cjs bestand.cpuprofile [aantal]: de duurste functies (eigen tijd en inclusief) uit een CPU-profiel van
// meet.cjs --prof (npm run grootte -- --prof).
const fs = require('node:fs');
const prof = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const top = Number(process.argv[3] || 15);
const nodes = new Map();
for (const n of prof.nodes) nodes.set(n.id, n);
// tijd per sample
const eigen = new Map(); // node id -> µs
for (let i = 0; i < prof.samples.length; i++) {
  const id = prof.samples[i];
  const dt = prof.timeDeltas[i] || 0;
  eigen.set(id, (eigen.get(id) || 0) + dt);
}
const totaal = [...eigen.values()].reduce((a, b) => a + b, 0);
const naam = (n) => {
  const f = n.callFrame;
  const url = (f.url || '').replace(/^file:\/\//, '').replace('/home/user/Aardschok/', '');
  return `${f.functionName || '(anoniem)'} ${url}:${f.lineNumber + 1}`;
};
// Eigen tijd per functie
const perFunctie = new Map();
for (const [id, t] of eigen) {
  const n = nodes.get(id);
  const k = naam(n);
  perFunctie.set(k, (perFunctie.get(k) || 0) + t);
}
// Inclusief: bouw ouders, tel elke functie één keer per stapel
const ouder = new Map();
for (const n of prof.nodes) for (const c of n.children || []) ouder.set(c, n.id);
const incl = new Map();
for (const [id, t] of eigen) {
  const gezien = new Set();
  for (let x = id; x != null; x = ouder.get(x)) {
    const k = naam(nodes.get(x));
    if (gezien.has(k)) continue;
    gezien.add(k);
    incl.set(k, (incl.get(k) || 0) + t);
  }
}
const pr = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
const ms = (us) => (us / 1000).toFixed(0).padStart(9) + ' ms';
const pc = (us) => ((100 * us) / totaal).toFixed(1).padStart(5) + '%';
console.log(`Totaal ${(totaal / 1e6).toFixed(1)} s (samples ${prof.samples.length})`);
console.log('--- eigen tijd');
for (const [k, t] of pr(perFunctie, top)) console.log(ms(t), pc(t), k);
console.log('--- inclusief');
for (const [k, t] of pr(incl, top)) console.log(ms(t), pc(t), k);
