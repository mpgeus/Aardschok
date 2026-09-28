// De naam van het spel staat op één plek, js/naam.js (Marcel, 28 sep: "De naam blijft aardschok voor nu. We
// maken later iets anders. Zorg dat we dat makkelijk door het hele spel kunnen aanpassen"; ontwerp/verpakken.md,
// "De naam"). Deze toets kijkt dat hij nergens anders staat: niet in de scripts van het spel, niet in de
// bladzijden, niet in de server. En dat elke bladzijde die hem invult, js/naam.js ook laadt.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const laad = require('./laad.cjs');
const T = laad.spel();
const WORTEL = path.join(__dirname, '..');

const inMap = (map, soort) =>
  fs.readdirSync(path.join(WORTEL, map)).filter((f) => soort.test(f)).map((f) => `${map}/${f}`);
const BLADZIJDEN = ['index.html', ...inMap('gereedschap', /\.html$/)];

test('de naam en de sleutel van de opslag staan in js/naam.js', () => {
  assert.equal(typeof T.NAAM, 'string');
  assert.ok(T.NAAM.trim(), 'T.NAAM is leeg');
  assert.equal(typeof T.OPSLAG_SLEUTEL, 'string');
  assert.ok(T.OPSLAG_SLEUTEL.trim(), 'T.OPSLAG_SLEUTEL is leeg');
  assert.ok(laad.scriptsVan('index.html').includes('js/naam.js'), 'index.html laadt js/naam.js niet');
});

test('de naam staat nergens anders in het spel', () => {
  const bestanden = [...BLADZIJDEN, 'server.cjs', ...inMap('js', /\.js$/), ...inMap('gereedschap', /\.js$/)]
    .filter((f) => f !== 'js/naam.js');
  const naam = T.NAAM.toLowerCase();
  const nog = bestanden.filter((f) => fs.readFileSync(path.join(WORTEL, f), 'utf8').toLowerCase().includes(naam));
  assert.deepEqual(nog, [], `De naam staat alleen in js/naam.js (T.NAAM, of {naam} in een titel); hij staat nog in: ${nog.join(', ')}`);
});

test('een bladzijde die de naam invult, laadt js/naam.js', () => {
  for (const pagina of BLADZIJDEN) {
    const html = fs.readFileSync(path.join(WORTEL, pagina), 'utf8');
    if (!html.includes('{naam}') && !html.includes('data-spelnaam')) continue;
    assert.ok(laad.scriptsVan(pagina).includes('js/naam.js'), `${pagina} noemt {naam} of data-spelnaam, maar laadt js/naam.js niet`);
  }
});
