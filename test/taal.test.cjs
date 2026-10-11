// De taal van het spel (vraag 147, js/taal.js): T.t met zijn woorden, meervoud en keuzes; dat elke zin uit de code te
// lezen is (gereedschap/teksten.cjs), en taal/bron.js daarom bij is; dat elke taal in taal/ past op de bron; dat de
// bladzijden de taal laden vóór de regels; en dat er in een omgezet bestand geen tekst meer
// buiten T.t staat.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const laad = require('./laad.cjs');
const T = laad.spel();
const teksten = require('../gereedschap/teksten.cjs');
const WORTEL = path.join(__dirname, '..');

// Elk bestand in js/: alle tekst die de speler ziet, gaat door T.t (vraag 147, stap 2, af op 11 okt). Tot dan stond hier een
// lijst die per deel groeide; nu kijkt de toets elk bestand na, ook een nieuw.
const OMGEZET = fs.readdirSync(path.join(WORTEL, 'js')).filter((f) => f.endsWith('.js')).map((f) => `js/${f}`);

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
  assert.equal(v('{n|{wie} comes|{wie} and # others come}', { n: 3, wie: 'Alice' }), 'Alice and 3 others come');
  assert.deepEqual(T.meervoudsVormen('en'), ['one', 'other']);
});

test('de toetsen spelen in het Engels, de brontaal; een taal uit de community gaat over de zin heen', () => {
  assert.equal(T.taalNu(), 'en');
  assert.equal(T.t('Continue'), 'Continue');
  assert.equal(T.t('Saved to slot {plek}.', { plek: 3 }), 'Saved to slot 3.');
  assert.ok(!T.TALEN.nl, 'het Nederlands is uit het spel (Marcel, 11 okt: "Nederlands mag je mee stoppen")');
  assert.equal(T.eenNaam('inn'), 'an inn');
  assert.equal(T.eenNaam('hut'), 'a hut');
});

test('wat er mis is aan een vertaling', () => {
  assert.deepEqual(T.keurVertaling('Overwrite {plek}?', '{plek} overschrijven?', 'nl-NL'), []);
  assert.match(T.keurVertaling('Overwrite {plek}?', 'Overschrijven?', 'nl-NL').join(), /Put \{plek\} back in/);
  assert.match(T.keurVertaling('Overwrite?', '{plek} overschrijven?', 'nl-NL').join(), /\{plek\} is not in the English sentence/);
  assert.match(T.keurVertaling('<b>Gold</b>', 'Goud', 'nl-NL').join(), /markup/);
  assert.match(T.keurVertaling('{n|# man|# men}', '{n|# mens}', 'nl-NL').join(), /has 1 form, but this language needs 2: one, other/);
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

test('een zin uit de gegevens (een gesprek): npm run teksten leest hem, en het gesprek toont hem in de taal van nu', () => {
  const zin = T.GESPREKKEN.marskramer.knopen.welkom.keuzes[0].zeg;
  const { zinnen } = teksten.zoekTeksten();
  const bron = zinnen.find((z) => z.t === zin);
  assert.ok(bron && bron.waar.includes('js/gesprekken.js'), 'de zin staat in taal/bron.js, uit js/gesprekken.js');
  assert.ok(zinnen.some((z) => z.t === T.GESPREKKEN.marskramer.naam), 'ook de naam boven het gesprek');
  assert.ok(!zinnen.some((z) => z.t === T.GESPREKKEN.marskramer.situaties[0].naam), 'een situatie is voor de schrijver');
  // Een vertaling van die zin (zoals taal/<code>.js er een zou geven) komt in het gesprek.
  T.BRONTAAL.zinnen[zin] = 'Zeig mal, was du hast.';
  try {
    assert.equal(T.vulWoordenIn({ vlaggen: new Set() }, zin), 'Zeig mal, was du hast.');
  } finally {
    delete T.BRONTAAL.zinnen[zin];
  }
  assert.equal(T.tGegevens(zin), zin, 'zonder vertaling het Engels');
  assert.equal(T.tGegevens(undefined), '');
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

test('in geen bestand in js/ staat tekst voor de speler buiten T.t', () => {
  const los = OMGEZET.flatMap((f) => teksten.losseTeksten(f));
  assert.deepEqual(
    los.map((l) => `${l.bestand}:${l.regel} ${l.tekst}`),
    [],
    "zet de tekst in T.t('Engelse zin'), met het Nederlands in taal/nl.js; is het geen tekst, zet dan // geen tekst op de regel",
  );
});
