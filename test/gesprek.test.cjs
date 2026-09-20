// Het gesprekssysteem zonder scherm (js/gesprek.js): welke regel wint, welke keuzes zichtbaar
// zijn, dat een vlag blijft staan, en dat "ouderGewordenSinds" pas afgaat als de held sinds het
// afscheid ook echt ouder is geworden. Zie ontwerp/spreuken.md, "Het dorp ziet je ouder worden".
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
const T = globalThis.Toren;

function nieuweS(leeftijd) {
  return {
    held: { leeftijd: leeftijd == null ? T.STARTLEEFTIJD : leeftijd },
    inventaris: new Set(),
  };
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

test('ouderGewordenSinds geldt pas als de held sinds het afscheid ook echt ouder is geworden', () => {
  const S = nieuweS(1000);
  // nog nooit gesproken: er is nog geen "vorige keer" om mee te vergelijken
  assert.equal(T.voorwaardeGeldt(S, 'wim', { ouderGewordenSinds: 12 }), false);

  T.onthoudAfscheid(S, 'wim');
  assert.equal(T.voorwaardeGeldt(S, 'wim', { ouderGewordenSinds: 12 }), false); // niets veranderd

  S.held.leeftijd += 6;
  assert.equal(T.voorwaardeGeldt(S, 'wim', { ouderGewordenSinds: 12 }), false); // nog geen jaar

  S.held.leeftijd += 6;
  assert.equal(T.voorwaardeGeldt(S, 'wim', { ouderGewordenSinds: 12 }), true); // nu wel

  T.onthoudAfscheid(S, 'wim'); // een nieuw afscheid, op de nieuwe leeftijd
  assert.equal(T.voorwaardeGeldt(S, 'wim', { ouderGewordenSinds: 12 }), false);
});

test('Wims begroeting volgt de sleutel: nog niet gevonden, op zak, of al gebruikt', () => {
  const S = nieuweS();

  let knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('Veertig jaar heb ik de trap geveegd'));
  assert.equal(knoop.keuzes.length, 4);

  S.inventaris.add('sleutel');
  knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('Wees voorzichtig daarboven'));
  assert.deepEqual(knoop.keuzes.map((k) => k.naar || 'sluit'), ['monsters', 'sluit']);

  S.inventaris.delete('sleutel');
  S.sleutelGebruikt = true;
  knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('Ik veeg de trap nog één keer'));
  assert.equal(knoop.keuzes.length, 1);
});

test('Wim merkt op dat je meer dan een jaar ouder bent geworden sinds jullie elkaar spraken', () => {
  const S = nieuweS();

  let knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(!knoop.tekst.includes('een jaar ouder'));

  T.onthoudAfscheid(S, 'wim'); // Wim en de held nemen afscheid
  S.held.leeftijd += 13; // en de held komt pas een jaar en een maand later terug
  knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('een jaar ouder'));
});

test('vanuit de begroeting kun je via "aardschok" bij "monsters" komen en weer terug naar "meer"', () => {
  const S = nieuweS();
  const begroeting = T.gesprekKnoop(S, 'wim', 'welkom');
  const naarAardschok = begroeting.keuzes.find((k) => k.zeg === 'Wat is er vannacht gebeurd?');
  assert.equal(naarAardschok.naar, 'aardschok');

  const aardschok = T.gesprekKnoop(S, 'wim', 'aardschok');
  const naarMonsters = aardschok.keuzes.find((k) => k.zeg === 'Wat voor gespuis?');
  assert.equal(naarMonsters.naar, 'monsters');

  const monsters = T.gesprekKnoop(S, 'wim', 'monsters');
  assert.equal(monsters.keuzes[0].naar, 'meer');
  assert.ok(T.gesprekKnoop(S, 'wim', 'meer').tekst.includes('Wat wilt u nog weten'));
});
