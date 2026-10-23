// Eén laadlijst voor de toetsen (werklijst, vraag 25 E, 27 sep). Een toets laadt het spel zoals het
// draait: de scripts uit index.html, in die volgorde. Een toets van het gereedschap laadt wat zijn
// bladzijde laadt. Zo kan een toets geen bestand meer vergeten. Dat ging mis: op 27 sep telde het
// karakter van wie er woont in het spel niet bij de kelders, terwijl de toetsen groen waren. Twee
// bestanden hadden een naam gemeen, het laatste won, en de toetsen laadden dat laatste niet. En vijf
// toetsen draaiden zonder js/dag.js, dus zonder werkuren: daar maaiden de boeren ook 's nachts.
//
//   const T = require('./laad.cjs').spel();
//   const T = require('./laad.cjs').pagina('gereedschap/gesprekken.html');
//
// `npm test` (node --test) draait ook dit bestand zelf, want het neemt alles in test/. Dan toetst het
// de laadlijst: het spel laadt zonder scherm (onderaan).
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');

// Wat het scherm opbouwt. Deze bestanden raken `document` aan zodra ze laden, of zetten een echte
// T.ui neer, terwijl een toets zijn eigen stille T.ui wil (de berichten naar niemand).
const ALLEEN_SCHERM = ['js/ui.js', 'js/hud.js', 'js/balk.js', 'js/huisbriefje.js', 'js/brieven.js', 'js/wettenmenu.js', 'js/debugvenster.js', 'js/instellingen.js', 'js/dialoog.js', 'js/menu.js', 'js/main.js'];

// De scripts van een bladzijde, in volgorde, als pad vanaf de wortel. Commentaar telt niet mee.
function scriptsVan(pagina) {
  const html = fs.readFileSync(path.join(WORTEL, pagina), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const map = path.dirname(pagina);
  return [...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g)].map((m) => path.join(map, m[1]).split(path.sep).join('/'));
}

// Laadt de bladzijde zonder wat alleen scherm is, en geeft de naamruimte terug. De toetsen spelen in het Engels, de
// brontaal (vraag 147, js/taal.js): het Nederlands is op 11 okt uit het spel gegaan (Marcel: "Nederlands mag je mee
// stoppen"), dus een toets verwacht de Engelse zin; wat nog niet om is, staat nog in het Nederlands in de code.
// `bijElk(s)` hoort vóór elk script welk het is (test/namen.test.cjs: wie zet welke naam).
function pagina(naam, bijElk) {
  globalThis.Spel = globalThis.Spel || {};
  if (!globalThis.Spel.TAAL_GEZET) globalThis.Spel.TAAL_GEZET = 'en';
  for (const s of scriptsVan(naam)) {
    if (ALLEEN_SCHERM.includes(s)) continue;
    if (bijElk) bijElk(s);
    require(path.join(WORTEL, s));
  }
  return globalThis.Spel;
}

module.exports = { spel: () => pagina('index.html'), pagina, scriptsVan, ALLEEN_SCHERM };

if (require.main === module) {
  const test = require('node:test');
  const assert = require('node:assert/strict');
  test('de laadlijst: het spel laadt zonder scherm, in de volgorde van index.html', () => {
    const scripts = scriptsVan('index.html');
    for (const s of ALLEEN_SCHERM.filter((s) => s.startsWith('js/'))) {
      assert.ok(scripts.includes(s), `${s} staat niet meer in index.html: haal het hier weg`);
    }
    const T = pagina('index.html');
    for (const s of scripts.filter((s) => s.startsWith('js/') && !ALLEEN_SCHERM.includes(s))) {
      assert.ok(require.cache[path.join(WORTEL, s)], `${s} is niet geladen`);
    }
    assert.equal(typeof T.beginOpEiland, 'function');
  });
}
