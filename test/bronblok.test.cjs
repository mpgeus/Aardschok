// Toetst gereedschap/bronblok.js: één blok uit een spelbestand halen zonder de rest aan te raken.
//
// Waarom dit bestaat: de gespreksbewerker schreef js/gesprekken.js helemaal opnieuw en kende
// T.TUTORIAL_TEKST niet, dus wiste één keer opslaan het hele draaiboek van de tutorial. De regel
// is nu: kop + blok + staart is weer precies het bestand, en de bewerker raakt alleen het blok
// aan. Deze toets bewaakt dat op de echte bestanden, zodat het opnieuw opvalt zodra er iets
// bijkomt wat een bewerker niet kent.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('../gereedschap/bronblok.js');
const T = globalThis.Toren;

const lees = (p) => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

test('kop + blok + staart is weer precies het bestand', () => {
  for (const [bestand, naam] of [
    ['js/gesprekken.js', 'T.GESPREKKEN'],
    ['js/quests.js', 'T.QUESTS'],
    ['js/quests.js', 'T.RAAKPUNTEN'],
  ]) {
    const bron = lees(bestand);
    const b = T.bronBlok(bron, naam);
    assert.ok(b, `${naam} niet gevonden in ${bestand}`);
    assert.equal(b.kop + b.blok + b.staart, bron, `${bestand} · ${naam}`);
  }
});

test('het blok begint en eindigt waar het hoort', () => {
  const b = T.bronBlok(lees('js/gesprekken.js'), 'T.GESPREKKEN');
  assert.match(b.blok.split('\n')[0], /^\s*T\.GESPREKKEN = \{$/);
  assert.match(b.blok.split('\n').at(-1), /^\s*\};$/);
});

test('wat de gespreksbewerker niet kent, zit in de staart', () => {
  // Dit is de kern: T.TUTORIAL_TEKST staat ná T.GESPREKKEN en hoort dus volledig in de staart.
  const b = T.bronBlok(lees('js/gesprekken.js'), 'T.GESPREKKEN');
  // Op de definitie letten en niet op de naam: binnen het blok staat een opmerking die naar
  // T.TUTORIAL_TEKST verwijst, en die mag er gewoon zijn.
  assert.ok(b.staart.includes('T.TUTORIAL_TEKST = {'), 'het draaiboek van de tutorial hoort in de staart');
  assert.ok(!b.blok.includes('T.TUTORIAL_TEKST = {'), 'en niet in het blok dat opnieuw geschreven wordt');
  assert.ok(b.kop.includes("'use strict'"), 'de kop houdt het begin van het bestand vast');
});

test('een accolade in een zin telt niet mee voor de diepte', () => {
  const bron = [
    'voor',
    '  T.DING = {',
    "    a: { zeg: 'Wat een { rare } dag' },",
    "    b: { zeg: \"en dit } ook\" }, // met een } in het commentaar",
    '  };',
    'na',
    '',
  ].join('\n');
  const b = T.bronBlok(bron, 'T.DING');
  assert.ok(b);
  assert.equal(b.kop, 'voor\n');
  assert.equal(b.staart, '\nna\n');
  assert.equal(b.kop + b.blok + b.staart, bron);
});

test('een blok dat er niet is, of niet afgesloten wordt, geeft null', () => {
  assert.equal(T.bronBlok('niets bijzonders\n', 'T.DING'), null);
  assert.equal(T.bronBlok('T.DING = {\n  a: 1,\n', 'T.DING'), null);
});

test('een blok met een array eromheen loopt door tot het einde', () => {
  const bron = 'T.LIJST = {\n  a: [\n    { x: 1 },\n  ],\n};\nrest\n';
  const b = T.bronBlok(bron, 'T.LIJST');
  assert.ok(b);
  assert.equal(b.staart, '\nrest\n');
  assert.equal(b.kop + b.blok + b.staart, bron);
});
