// Geen naam in Spel twee keer gezet (opmerkingen.md, 13 okt; Marcel: "ja, bouw die toets"). T.nieuwLand bestond al in
// js/land.js, en een nieuwe met dezelfde naam in js/wereld.js werd stil overschreven: het laatste bestand wint, en de
// toetsen merkten het niet, de browser wel. Zo ging het op 27 sep ook met het karakter bij de kelders (test/laad.cjs).
//
// Het spel laadt hier zoals in de toetsen, maar Spel kijkt mee: zet een bestand een naam die een ander al zette, met
// iets anders, dan is dat fout. Wat een gedeelde lijst aanvult (`T.ui = T.ui || {}`) zet hetzelfde ding terug en telt
// niet. Eén bestand mag het wel: js/opties.js zet de blokken van de werkbank terug op de standaard (T.pasOptiesToe).
// De bestanden die alleen scherm zijn, laden hier niet (test/laad.cjs, ALLEEN_SCHERM); van die kijkt de toets wat ze
// bovenaan hun bestand zetten.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pagina, scriptsVan, ALLEEN_SCHERM } = require('./laad.cjs');

const WORTEL = path.join(__dirname, '..');

const wie = new Map();
const dubbel = [];
let nu = null;
globalThis.Spel = new Proxy({}, {
  set(doel, naam, waarde) {
    if (Object.prototype.hasOwnProperty.call(doel, naam) && doel[naam] !== waarde && wie.get(naam) !== nu) {
      dubbel.push({ naam: String(naam), eerst: wie.get(naam), daarna: nu });
    }
    if (!wie.has(naam)) wie.set(naam, nu);
    doel[naam] = waarde;
    return true;
  },
});
const T = pagina('index.html', (s) => { nu = s; });

test('geen bestand zet een naam in Spel die een ander al zette', () => {
  const werkbank = new Set(T.WERKBANK.flatMap((deel) => [deel.blok, ...Object.keys(deel.losse || {})]).filter(Boolean));
  const fout = dubbel.filter((d) => !(d.daarna === 'js/opties.js' && werkbank.has(d.naam)));
  assert.deepEqual(fout.map((d) => `T.${d.naam}: eerst ${d.eerst}, dan ${d.daarna}`), [],
    'kies een andere naam, of haal de oude weg');
});

test('ook een bestand dat alleen scherm is, zet geen naam die een ander al zette', () => {
  const fout = [];
  for (const s of scriptsVan('index.html').filter((s) => ALLEEN_SCHERM.includes(s))) {
    const bron = fs.readFileSync(path.join(WORTEL, s), 'utf8');
    for (const m of bron.matchAll(/^ {2}T\.([A-Za-z_$][\w$]*) = (?!T\.\1 \|\|)/gm)) {
      if (wie.has(m[1]) && wie.get(m[1]) !== s) fout.push(`T.${m[1]}: eerst ${wie.get(m[1])}, dan ${s}`);
      else wie.set(m[1], s);
    }
  }
  assert.deepEqual(fout, [], 'kies een andere naam, of haal de oude weg');
});
