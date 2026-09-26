// Het gesprekssysteem zonder scherm (js/gesprek.js): welke regel wint, welke keuzes zichtbaar
// zijn, en dat een vlag blijft staan. (Tot 25 sep ook dat "ouderGewordenSinds" pas afging als de
// held echt ouder was geworden; de leeftijd ging eruit met het oude spel.)
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/gesprek.js');
require('../js/gesprekken.js');
const T = globalThis.Spel;

function nieuweS() {
  return { held: {}, inventaris: new Set() };
}

test('de eerste passende regel wint; een regel zonder voorwaarde is het vangnet', () => {
  const S = nieuweS();
  const lijst = [
    { als: { heeft: 'kaart' }, zeg: 'met kaart' },
    { als: { vlag: 'iets' }, zeg: 'met vlag' },
    { zeg: 'zonder voorwaarde' },
  ];
  assert.equal(T.eersteDiePast(S, 'test', lijst).zeg, 'zonder voorwaarde');

  T.zetVlag(S, 'iets');
  assert.equal(T.eersteDiePast(S, 'test', lijst).zeg, 'met vlag');

  S.inventaris.add('kaart'); // staat bovenaan de lijst, en wint dus ook als de andere ook kloppen
  assert.equal(T.eersteDiePast(S, 'test', lijst).zeg, 'met kaart');
});

test('een keuze met een voorwaarde blijft verborgen tot die klopt', () => {
  const S = nieuweS();
  const keuzes = [
    { zeg: 'altijd' },
    { zeg: 'alleen met sleutel', als: { heeft: 'sleutel' } },
  ];
  assert.deepEqual(T.zichtbareKeuzes(S, 'test', keuzes).map((k) => k.zeg), ['altijd']);

  S.inventaris.add('sleutel');
  assert.deepEqual(T.zichtbareKeuzes(S, 'test', keuzes).map((k) => k.zeg), ['altijd', 'alleen met sleutel']);
});

test('een vlag blijft staan tot hij gewist wordt, en werkt ook via een bestaand veld op de spelstaat', () => {
  const S = nieuweS();
  assert.equal(T.heeftVlag(S, 'geholpen'), false);
  T.zetVlag(S, 'geholpen');
  assert.equal(T.heeftVlag(S, 'geholpen'), true);
  assert.equal(T.heeftVlag(S, 'geholpen'), true); // blijft staan, ook bij een tweede keer vragen
  T.wisVlag(S, 'geholpen');
  assert.equal(T.heeftVlag(S, 'geholpen'), false);

  // S.sleutelGebruikt bestaat al als los veld op de spelstaat (js/verkennen.js); een gesprek moet
  // daar ook naar kunnen vragen zonder dat het spel hetzelfde feit dubbel bijhoudt.
  S.sleutelGebruikt = true;
  assert.equal(T.heeftVlag(S, 'sleutelGebruikt'), true);
});

// Een gesprek in de vorm van js/gesprekken.js, alleen voor deze toets: een begroeting die op een
// vlag let, een antwoord met een gevolg, en een weg heen en terug. (Tot 25 sep toetste dit
// bestand dat op het gesprek van Wim, uit het oude spel.)
function metProefGesprek() {
  T.GESPREKKEN.proef = {
    naam: 'de proef',
    start: 'welkom',
    knopen: {
      welkom: {
        tekst: [
          { als: { vlag: 'geholpen' }, zeg: 'Dank je nog, schout.' },
          { zeg: 'Goedendag, schout.' },
        ],
        keuzes: [
          { zeg: 'Kan ik helpen?', naar: 'hulp', als: { nietVlag: 'geholpen' } },
          { zeg: 'Tot ziens.', sluit: true },
        ],
      },
      hulp: {
        tekst: [{ zeg: 'Graag. Wil je dit brengen?' }],
        keuzes: [{ zeg: 'Geef maar.', naar: 'welkom', doe: { zetVlag: 'geholpen', geef: 'pakje' } }],
      },
    },
  };
}

test('een gesprek loopt van knoop naar knoop, en een antwoord verandert wat er daarna gezegd wordt', () => {
  metProefGesprek();
  try {
    const S = nieuweS();
    let welkom = T.gesprekKnoop(S, 'proef', 'welkom');
    assert.equal(welkom.tekst, 'Goedendag, schout.');
    const helpen = welkom.keuzes.find((k) => k.naar === 'hulp');
    assert.ok(helpen, 'wie nog niet hielp, kan het aanbieden');
    const hulp = T.gesprekKnoop(S, 'proef', helpen.naar);
    const geven = hulp.keuzes[0];
    T.doeGevolg(S, geven.doe);
    assert.ok(T.heeftVlag(S, 'geholpen'));
    assert.ok(S.inventaris.has('pakje'));
    welkom = T.gesprekKnoop(S, 'proef', geven.naar);
    assert.equal(welkom.tekst, 'Dank je nog, schout.');
    assert.ok(!welkom.keuzes.some((k) => k.naar === 'hulp'), 'en daarna niet meer');
  } finally {
    delete T.GESPREKKEN.proef;
  }
});
