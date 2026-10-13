// Eén weg naar de tegels (B2a, vraag 117, stap 3; ontwerp/kaarten.md, "Het hele eiland"). Wat een tegel is, welke grond
// eronder ligt en wat de kaart beslaat, vraagt het spel alleen aan js/wereld.js (T.tegel, T.zetTegel, T.grondOp,
// T.opKaart, T.kaartVak, T.burenKamersOp). Zo wordt de kaart in B2b op één plek stukken van het eiland: wie w.tegels,
// w.grond, w.b of w.h zelf leest, rekent op een rechthoek die er dan niet meer is.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const JS = path.join(__dirname, '..', 'js');
// js/wereld.js geeft de tegels, en js/kaart.js maakt de kaart uit Tiled.
const EIGENAARS = ['wereld.js', 'kaart.js'];
// Een kaart heet in het spel w, wereld of kaart; plan.grond (de maker) en hg.b (de hoogte) zijn iets anders.
const VERBODEN = [
  /\b(?:w|wereld|kaart)\.(?:b|h|tegels|grond|burenKamers)\b/,
  /\.tegels\s*\[/,
  /\.tegels\.length/,
  /\.burenKamers\b/,
];

test('niets buiten js/wereld.js leest de rechthoek van de kaart zelf', () => {
  const fout = [];
  for (const naam of fs.readdirSync(JS).filter((n) => n.endsWith('.js') && !EIGENAARS.includes(n))) {
    const regels = fs.readFileSync(path.join(JS, naam), 'utf8').split('\n');
    regels.forEach((regel, i) => {
      const code = regel.replace(/\/\/.*$/, '');
      if (VERBODEN.some((re) => re.test(code))) fout.push(`js/${naam}:${i + 1}: ${regel.trim()}`);
    });
  }
  assert.deepEqual(fout, [], 'gebruik T.tegel, T.zetTegel, T.grondOp, T.opKaart, T.kaartVak of T.burenKamersOp (js/wereld.js)');
});
