// Hoe groot kan een dorp worden (werklijst, vraag 74; Marcel, 30 sep: "ik wil wel onderzoeken hoe groot een dorp / stad
// kan worden?", en op 1 okt: "scripts bewaren"). Bouwt het gehucht uit tot een dorp van N bewoners, met erven en
// werkplekken zoals het spel ze bouwt (bouw.cjs), en meet wat het kost: de wereld per beeld op 30×, de dagtik, en het
// opslaan (meet.cjs, elke N in een eigen Node, zodat de ene meting de andere niet raakt). Zo zie je na een verbetering
// precies wat die deed.
//
//   npm run grootte                       N = 26, 50, 100, 200 en 400 (zo'n tien minuten)
//   npm run grootte -- 26 800             andere N
//   npm run grootte -- --snelheid 1       op gewone snelheid in plaats van 30× (een dag is dan 18.000 beelden)
//   npm run grootte -- --prof             met een CPU-profiel per N (uit/prof-<N>.cpuprofile; lees het met
//                                         `node gereedschap/grootte/profiel.cjs <bestand>`)
//   npm run grootte -- --astar            ook wat één zoektocht naar een pad kost (astar.cjs)
//   npm run grootte -- --browser          ook wat het tekenen kost, in een onzichtbare Chromium (browser.cjs)
//   npm run grootte -- --maker 5          op het land van de maker met nummer 5 (100 bij 100, vraag 112), in plaats
//                                         van het ontworpen gehucht; de uitslag krijgt -maker5 achter zijn naam
//
// De uitslag komt in gereedschap/grootte/uit/ (niet in git): <N>.json per meting, en een tabel in samenvatting.md.
// Meet op een stille machine: een speeltest of een tweede meting ernaast maakt de getallen te hoog. De uitslag van 30
// sep staat in de werklijst, bij vraag 74.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const UIT = path.join(__dirname, 'uit');
const args = process.argv.slice(2);
const getallen = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--snelheid' && args[i - 1] !== '--maker').map(Number);
const makerIdx = args.indexOf('--maker');
const maker = makerIdx >= 0 ? Number(args[makerIdx + 1]) : null;
const N_LIJST = getallen.length ? getallen : [26, 50, 100, 200, 400];
const snelheidIdx = args.indexOf('--snelheid');
const snelheid = snelheidIdx >= 0 ? Number(args[snelheidIdx + 1]) : 30;
const metProfiel = args.includes('--prof');

fs.mkdirSync(UIT, { recursive: true });
const node = (script, extra) => execFileSync(process.execPath, ['--expose-gc', path.join(__dirname, script), ...extra], { stdio: 'inherit' });

// De wereld, per N. Een kleine N speelt drie dagen, een grote één: het gaat om het beeld, niet om het jaar.
const uitslagen = [];
for (const N of N_LIJST) {
  const bestand = path.join(UIT, `${N}${snelheid === 30 ? '' : `-${snelheid}x`}${maker != null ? `-maker${maker}` : ''}.json`);
  const dagen = N <= 100 ? 3 : N <= 200 ? 2 : 1;
  const extra = [String(N), '--werk', '--dagen', String(snelheid === 30 ? dagen : 1), '--start', '20', '--snelheid', String(snelheid), '--uit', bestand];
  if (metProfiel) extra.push('--prof', path.join(UIT, `prof-${N}.cpuprofile`));
  if (maker != null) extra.push('--maker', String(maker));
  console.log(`\nEen dorp van ${N} op ${snelheid}×:`);
  node('meet.cjs', N === 26 ? extra.filter((a) => a !== '--werk') : extra);
  if (fs.existsSync(bestand)) uitslagen.push(JSON.parse(fs.readFileSync(bestand, 'utf8')));
}

if (args.includes('--astar')) {
  console.log('\nWat één zoektocht naar een pad kost:');
  node('astar.cjs', [path.join(UIT, 'astar.json')]);
}
if (args.includes('--browser')) {
  console.log('\nWat het tekenen kost, in een onzichtbare Chromium:');
  node('browser.cjs', [...N_LIJST.map(String), '--uit', path.join(UIT, 'tekenen.json')]);
}

// De tabel, zoals in de werklijst (vraag 74).
const ms = (x) => (x == null ? '' : x >= 100 ? `${Math.round(x)} ms` : `${x.toFixed(x >= 10 ? 0 : x >= 1 ? 1 : 2).replace('.', ',')} ms`);
const regels = [
  `# Hoe groot kan een dorp worden (${new Date().toISOString().slice(0, 10)}, op ${snelheid}×)`,
  '',
  '| mensen | kaart | gebouwen | wereld per beeld (gemiddeld) | traagste 5% | traagste beeld | een dag | bewaard | zoeken van paden |',
  '|---|---|---|---|---|---|---|---|---|',
  ...uitslagen.map((u) => `| ${u.N} | ${u.L}² | ${u.gebouwen} | ${ms(u.beeld.gem)} | ${ms(u.beeld.gemSlechtste5)} | ${ms(u.beeld.max)} | ` +
    `${ms(u.dagtikBank.gem)} | ${Math.round(u.opslag.kB)} kB (${ms(u.opslag.ms)}) | ${Math.round(u.pad.aandeel * 100)}% |`),
  '',
  'Een beeld heeft 16,7 ms bij 60 beelden per seconde, en het tekenen wil daar ook een deel van. "Bewaard": hoe groot een',
  'opgeslagen spel is, en hoe lang het opslaan duurt; de opslag van de browser houdt zo\'n 5 MB.',
];
fs.writeFileSync(path.join(UIT, 'samenvatting.md'), regels.join('\n') + '\n');
console.log('\n' + regels.join('\n'));
