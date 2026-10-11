// CLAUDE.md leest elke sessie en elke agent, dus hij blijft klein (Marcel, 11 okt, vraag 153: in drie weken groeide hij
// tot 153 KB, zo'n 40.000 tokens voor er iets gebeurde). Wat een bestand doet, staat in ontwerp/code.md, het gereedschap
// in ontwerp/gereedschap.md. Wordt deze toets rood, haal dan iets naar een van die twee, in plaats van de grens op te
// rekken. En de kaart blijft heel: elk bestand in js/ staat in de inhoudsopgave van CLAUDE.md en heeft zijn stuk in
// ontwerp/code.md.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const lees = (f) => fs.readFileSync(path.join(WORTEL, f), 'utf8');
const GRENS = 20 * 1024;

test('CLAUDE.md blijft onder de 20 KB', () => {
  const grootte = Buffer.byteLength(lees('CLAUDE.md'));
  assert.ok(grootte < GRENS,
    `CLAUDE.md is ${(grootte / 1024).toFixed(1)} KB; zet wat een bestand doet in ontwerp/code.md en het gereedschap in ontwerp/gereedschap.md`);
});

test('elk bestand in js/ staat in de inhoudsopgave van CLAUDE.md en in ontwerp/code.md', () => {
  const claude = lees('CLAUDE.md');
  const code = lees('ontwerp/code.md');
  const bestanden = fs.readdirSync(path.join(WORTEL, 'js')).filter((f) => f.endsWith('.js'));
  const nietInClaude = bestanden.filter((f) => !claude.includes('`' + f.replace(/\.js$/, '') + '`'));
  const nietInCode = bestanden.filter((f) => !code.includes('js/' + f));
  assert.deepEqual(nietInClaude, [], `noem ze in de inhoudsopgave onder "Opbouw" in CLAUDE.md: ${nietInClaude.join(', ')}`);
  assert.deepEqual(nietInCode, [], `beschrijf ze in ontwerp/code.md: ${nietInCode.join(', ')}`);
});
