// De taal van het spel (vraag 147, js/taal.js): T.t met zijn woorden, meervoud en keuzes; dat elke zin uit de code te
// lezen is (gereedschap/teksten.cjs), en taal/bron.js daarom bij is; dat elke taal in taal/ past op de bron, en het
// Nederlands heel is; dat de bladzijden de taal laden vóór de regels; en dat er in een omgezet bestand geen tekst meer
// buiten T.t staat.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const laad = require('./laad.cjs');
const T = laad.spel();
const teksten = require('../gereedschap/teksten.cjs');
const WORTEL = path.join(__dirname, '..');

// De bestanden waarin alle tekst al door T.t gaat. Stap 2 van vraag 147 zet ze er één voor één bij, tot het heel js/ is.
const OMGEZET = ['js/menu.js'];

const leesBestand = (f) => fs.readFileSync(path.join(WORTEL, f), 'utf8').split('\r\n').join('\n');

test('een zin: de woorden, het meervoud en een keuze', () => {
  const v = (zin, woorden, locale = 'en-GB') => T.vulTekst(zin, woorden, locale);
  assert.equal(v('Slot {plek}', { plek: 2 }), 'Slot 2');
  assert.equal(v('{wie} says hello', {}), '{wie} says hello', 'wat er niet in de woorden staat, blijft staan (een gesprek vult het later)');
  assert.equal(v('{n|# man|# men}', { n: 1 }), '1 man');
  assert.equal(v('{n|# man|# men}', { n: 0 }), '0 men');
  assert.equal(v('{n|# mens|# mensen}', { n: 7 }, 'nl-NL'), '7 mensen');
  assert.equal(v('{n|# owca|# owce|# owiec|# owcy}', { n: 3 }, 'pl'), '3 owce', 'het Pools heeft vier vormen');
  assert.equal(v('{g|man:he|vrouw:she|*:they}', { g: 'vrouw' }), 'she');
  assert.equal(v('{g|man:he|vrouw:she|*:they}', { g: 'kind' }), 'they');
  assert.equal(v('{n|{wie} comes|{wie} and # others come}', { n: 3, wie: 'Aaltje' }), 'Aaltje and 3 others come');
  assert.deepEqual(T.meervoudsVormen('en'), ['one', 'other']);
});

test('de toetsen spelen in het Nederlands, en een zin zonder vertaling is Engels', () => {
  assert.equal(T.taalNu(), 'nl');
  assert.equal(T.t('Continue'), 'Verder');
  assert.equal(T.t('Saved to slot {plek}.', { plek: 3 }), 'Opgeslagen op plek 3.');
  assert.equal(T.t('A sentence that nobody translated, with {x}.', { x: 1 }), 'A sentence that nobody translated, with 1.');
});

test('wat er mis is aan een vertaling', () => {
  assert.deepEqual(T.keurVertaling('Overwrite {plek}?', '{plek} overschrijven?', 'nl-NL'), []);
  assert.match(T.keurVertaling('Overwrite {plek}?', 'Overschrijven?', 'nl-NL').join(), /missing \{plek\}/);
  assert.match(T.keurVertaling('Overwrite?', '{plek} overschrijven?', 'nl-NL').join(), /unknown \{plek\}/);
  assert.match(T.keurVertaling('<b>Gold</b>', 'Goud', 'nl-NL').join(), /html/);
  assert.match(T.keurVertaling('{n|# man|# men}', '{n|# mens}', 'nl-NL').join(), /has 1 forms; this language has 2/);
  assert.deepEqual(T.keurVertaling('{g|man:he|vrouw:she}', '{g|man:hij|vrouw:zij}', 'nl-NL'), [], 'een keuze is geen meervoud');
});

test('een taalbestand is gegevens: schrijven en weer lezen geeft hetzelfde', () => {
  const def = { code: 'de', naam: 'Deutsch', locale: 'de-DE', zinnen: { Continue: 'Weiter', 'Slot {plek}': 'Platz {plek}' } };
  assert.deepEqual(T.leesTaalBestand(T.schrijfTaalBestand(def)), def);
  assert.throws(() => T.leesTaalBestand('Spel.taal({"code": "de", "zinnen": {"a": 1}});'), /not text/);
  assert.throws(() => T.leesTaalBestand('alert(1)'));
});

test('elke T.t krijgt een gewone tekst mee, zodat de zin uit de code te lezen is', () => {
  const { fouten } = teksten.zoekTeksten();
  assert.deepEqual(
    fouten.map((f) => `${f.bestand}:${f.regel} ${f.tekst}`),
    [],
    "T.t('Engelse zin', { woorden }): een gewone tekst tussen aanhalingstekens, geen variabele, `sjabloon` of som",
  );
});

test('taal/bron.js is bij', () => {
  const { zinnen } = teksten.zoekTeksten();
  assert.ok(
    leesBestand('taal/bron.js') === teksten.bronBestand(zinnen),
    'taal/bron.js zegt iets anders dan de code: draai npm run teksten',
  );
});

test('elke taal in taal/ past op de bron: dezelfde {namen}, dezelfde html, het meervoud van de taal', () => {
  const { zinnen } = teksten.zoekTeksten();
  for (const taal of teksten.talenInMap()) {
    const { past } = teksten.verslagVan(taal, zinnen);
    assert.deepEqual(past.map((p) => `${taal.bestand}: ${p.t}: ${p.fout.join('; ')}`), []);
  }
});

test('het Nederlands is heel: elke zin vertaald, en niets over', () => {
  const { zinnen } = teksten.zoekTeksten();
  const nl = teksten.talenInMap().find((t) => t.code === 'nl');
  assert.ok(nl, 'taal/nl.js ontbreekt');
  const { ontbreekt, over } = teksten.verslagVan(nl, zinnen);
  assert.deepEqual(ontbreekt, [], 'deze zinnen staan nog niet in taal/nl.js');
  assert.deepEqual(over, [], 'deze zinnen staan niet meer in de code: haal ze uit taal/nl.js, of zet de nieuwe Engelse zin als sleutel');
});

test('index.html en de vertaaltool laden js/taal.js en elke taal in taal/, vóór de regels', () => {
  const talen = fs.readdirSync(path.join(WORTEL, 'taal')).filter((f) => f.endsWith('.js') && f !== 'bron.js').map((f) => `taal/${f}`);
  for (const pagina of ['index.html', 'gereedschap/vertalen.html']) {
    const scripts = laad.scriptsVan(pagina);
    const i = scripts.indexOf('js/taal.js');
    assert.ok(i >= 0, `${pagina} laadt js/taal.js niet`);
    for (const t of talen) {
      assert.ok(scripts.includes(t), `${pagina} laadt ${t} niet`);
      assert.ok(scripts.indexOf(t) > i, `${pagina} laadt ${t} vóór js/taal.js`);
    }
    const regels = scripts.filter((s) => s.startsWith('js/') && s !== 'js/naam.js' && s !== 'js/taal.js');
    if (regels.length) {
      const laatsteTaal = Math.max(...talen.map((t) => scripts.indexOf(t)));
      assert.ok(laatsteTaal < scripts.indexOf(regels[0]), `${pagina}: de talen laden pas na ${regels[0]}`);
    }
  }
});

test('een bladzijde die regels uit js/ laadt, laadt eerst js/taal.js', () => {
  const bladzijden = ['index.html', ...fs.readdirSync(path.join(WORTEL, 'gereedschap')).filter((f) => f.endsWith('.html')).map((f) => `gereedschap/${f}`)];
  for (const pagina of bladzijden) {
    const scripts = laad.scriptsVan(pagina);
    const eerste = scripts.find((s) => s.startsWith('js/') && s !== 'js/naam.js' && s !== 'js/taal.js');
    if (!eerste) continue;
    const i = scripts.indexOf('js/taal.js');
    assert.ok(i >= 0 && i < scripts.indexOf(eerste), `${pagina} laadt ${eerste}, maar js/taal.js niet ervoor`);
  }
});

test('in een omgezet bestand staat geen tekst meer buiten T.t', () => {
  const los = OMGEZET.flatMap((f) => teksten.losseTeksten(f));
  assert.deepEqual(
    los.map((l) => `${l.bestand}:${l.regel} ${l.tekst}`),
    [],
    "zet de tekst in T.t('Engelse zin'), met het Nederlands in taal/nl.js; is het geen tekst, zet dan // geen tekst op de regel",
  );
});
