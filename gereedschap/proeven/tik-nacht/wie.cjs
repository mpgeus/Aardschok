// Wie roept functie F (deel van de naam) aan, met hoeveel inclusieve tijd: node wie.cjs F profiel...
const fs = require('fs');
const [F, ...bestanden] = process.argv.slice(2);
const per = new Map();
const naam = n => `${n.callFrame.functionName || '(anoniem)'} ${n.callFrame.url.replace(/.*\/(js|test|gereedschap)\//, '$1/')}:${n.callFrame.lineNumber + 1}`;
for (const b of bestanden) {
  const p = JSON.parse(fs.readFileSync(b, 'utf8'));
  const knoop = new Map(p.nodes.map(n => [n.id, n])); const ouder = new Map();
  for (const n of p.nodes) for (const c of n.children || []) ouder.set(c, n.id);
  for (let i = 0; i < p.samples.length; i++) {
    const d = p.timeDeltas[i + 1] || 0;
    let id = p.samples[i];
    // de bovenste F in de stapel, en wie hem aanroept
    let gevonden = null;
    while (id != null) { const k = naam(knoop.get(id)); if (k.includes(F)) gevonden = id; id = ouder.get(id); }
    if (gevonden == null) continue;
    const o = ouder.get(gevonden);
    const k = o != null ? naam(knoop.get(o)) : '(wortel)';
    per.set(k, (per.get(k) || 0) + d);
  }
}
[...per].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([k, t]) => console.log(`${(t / 1000).toFixed(2).padStart(7)} ms  ${k}`));
