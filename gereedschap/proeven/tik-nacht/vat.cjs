// Vat de om-en-om-metingen samen: mediaan per regel over de nachten (zonder de eerste), en of de afdrukken gelijk zijn.
const fs = require('fs');
const H = __dirname;
const rondes = +process.argv[2];
const med = (l) => { const s = l.slice().sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const afdruk = {};
for (const naam of ['oud', 'nieuw']) {
  const per = {}; const eerste = []; const gewoon = [];
  for (let r = 1; r <= rondes; r++) {
    const regels = fs.readFileSync(`${H}/uit-${naam}-${r}.txt`, 'utf8').trim().split('\n');
    const nachten = regels.filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
    eerste.push(nachten[0].ms);
    for (const n of nachten.slice(1)) for (const [k, v] of Object.entries(n)) if (k !== 'dag') (per[k] = per[k] || []).push(v);
    gewoon.push(+regels.find((l) => l.startsWith('gewone')).split(' ')[3]);
    const a = regels.find((l) => l.startsWith('afdruk'));
    (afdruk[naam] = afdruk[naam] || new Set()).add(a);
  }
  console.log(naam.padEnd(6), 'eerste nacht', eerste.join('/'), 'ms; daarna mediaan:', Object.entries(per).filter(([k]) => ['ms', 'Beesten', 'bosInVak', 'Gebouwen', 'wijsWerkToe', 'Paden'].includes(k)).map(([k, l]) => `${k} ${med(l).toFixed(1)}`).join(', '), '| max ms', Math.max(...per.ms).toFixed(1), '| gewone tik', med(gewoon).toFixed(2));
}
const o = [...afdruk.oud], n = [...afdruk.nieuw];
console.log('afdrukken oud gelijk onderling:', o.length === 1, '| nieuw gelijk aan oud:', o.length === 1 && n.length === 1 && o[0] === n[0]);
