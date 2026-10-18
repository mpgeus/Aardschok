// Wie roept een functie aan: telt de eigen tijd van `doel` per keten van aanroepers (bottom-up).
const fs = require('fs');
const [,, bestand, doel, diepte = '4'] = process.argv;
const p = JSON.parse(fs.readFileSync(bestand, 'utf8'));
const per = new Map(p.nodes.map(n => [n.id, n]));
const ouder = new Map();
for (const n of p.nodes) for (const c of n.children || []) ouder.set(c, n.id);
const dt = new Map();
for (let i = 0; i < p.samples.length; i++) dt.set(p.samples[i], (dt.get(p.samples[i]) || 0) + (p.timeDeltas[i] || 0));
const naam = n => `${n.callFrame.functionName || '(anoniem)'} ${n.callFrame.url.replace(/.*Aardschok\//, '')}:${n.callFrame.lineNumber + 1}`;
const ketens = new Map();
let tot = 0;
for (const n of p.nodes) {
  if (!naam(n).startsWith(doel)) continue;
  // inclusief: tel de tijd van n en alle kinderen
  let t = 0; const stapel = [n.id];
  while (stapel.length) { const id = stapel.pop(); t += dt.get(id) || 0; stapel.push(...(per.get(id).children || [])); }
  const k = []; let o = ouder.get(n.id);
  while (o != null && k.length < +diepte) { const on = per.get(o); if (!naam(on).startsWith(doel)) k.push(naam(on)); o = ouder.get(o); }
  const s = k.join(' <- ');
  ketens.set(s, (ketens.get(s) || 0) + t); tot += t;
}
console.log(`${doel}: ${(tot/1000).toFixed(0)} ms inclusief`);
for (const [k, t] of [...ketens].sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`${(t/1000).toFixed(0).padStart(6)} ms  ${k}`);
