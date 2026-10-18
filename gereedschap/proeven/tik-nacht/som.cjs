// Tel profielen op: inclusieve tijd per functie (zonder dubbel tellen in recursie), alleen js/.
const fs = require('fs');
const bestanden = process.argv.slice(2);
const incl = new Map(), eigen = new Map(); let totaal = 0;
const naam = n => `${n.callFrame.functionName || '(anoniem)'} ${n.callFrame.url.replace(/.*\/(js|test|gereedschap)\//, '$1/')}:${n.callFrame.lineNumber + 1}`;
for (const b of bestanden) {
  const p = JSON.parse(fs.readFileSync(b, 'utf8'));
  const per = new Map(p.nodes.map(n => [n.id, n])); const ouder = new Map();
  for (const n of p.nodes) for (const c of n.children || []) ouder.set(c, n.id);
  for (let i = 0; i < p.samples.length; i++) {
    const d = p.timeDeltas[i + 1] || 0; totaal += d;
    let id = p.samples[i]; const gezien = new Set();
    eigen.set(naam(per.get(id)), (eigen.get(naam(per.get(id))) || 0) + d);
    while (id != null) { const k = naam(per.get(id)); if (!gezien.has(k)) { gezien.add(k); incl.set(k, (incl.get(k) || 0) + d); } id = ouder.get(id); }
  }
}
const toon = (m, n) => [...m].filter(([k]) => / js\//.test(k)).sort((a, b) => b[1] - a[1]).slice(0, n).forEach(([k, t]) => console.log(`${(t / 1000).toFixed(1).padStart(7)} ms ${(100 * t / totaal).toFixed(0).padStart(3)}%  ${k}`));
console.log(`totaal ${(totaal / 1000).toFixed(1)} ms over ${bestanden.length} profielen\n-- inclusief`); toon(incl, +process.env.N || 25);
console.log('-- eigen'); toon(eigen, 10);
