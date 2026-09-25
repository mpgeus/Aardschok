// Het gesprekssysteem zonder scherm (js/gesprek.js): welke regel wint, welke keuzes zichtbaar
// zijn, en dat een vlag blijft staan. (Tot 25 sep ook dat "ouderGewordenSinds" pas afging als de
// held echt ouder was geworden; de leeftijd ging eruit met het oude spel.)
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/gesprek.js');
require('../js/gesprekken.js');
const T = globalThis.Toren;

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

test('zolang de meester leeft, stuurt Wim je naar buiten, naar zijn bonen', () => {
  const S = nieuweS();
  const knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('bij zijn bonen'));
  assert.deepEqual(knoop.keuzes.map((k) => k.naar || 'sluit'), ['voorraad', 'sluit']);
});

test('Wims begroeting volgt de sleutel: nog niet gevonden, op zak, of al gebruikt', () => {
  const S = nieuweS();
  T.zetVlag(S, 'meesterDood'); // na de tutorial: nu ben jij de meester
  T.zetVlag(S, 'beursVanDeMeester'); // de beurs is al geweest; die vraag heeft zijn eigen toets

  let knoop = T.gesprekKnoop(S, 'wim', 'welkom');
  assert.ok(knoop.tekst.includes('Zo moet ik u nu noemen'));
  assert.equal(knoop.keuzes.length, 5);

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

// De beurs van de meester is je eerste goud, en expres te weinig voor de marskramer
// (ontwerp/toren.md). Je mag er altijd naar vragen tot je hem hebt gehad; weigeren zet geen vlag,
// dus dan staat het aanbod er morgen nog, precies zoals Wim zegt.
test('Wim biedt de beurs van de meester aan, en daarna niet meer', () => {
  const S = nieuweS();
  T.zetVlag(S, 'meesterDood');
  const keuzes = () => T.zichtbareKeuzes(S, 'wim', T.GESPREKKEN.wim.knopen.welkom.keuzes);
  const gevraagd = () => keuzes().some((k) => k.naar === 'beurs');

  assert.equal(gevraagd(), true);
  S.inventaris.add('sleutel'); // ook met de sleutel op zak mag je er nog naar vragen
  assert.equal(gevraagd(), true);

  T.zetVlag(S, 'beursVanDeMeester');
  assert.equal(gevraagd(), false);
});

test('vanuit de begroeting kun je via "aardschok" bij "monsters" komen en weer terug naar "meer"', () => {
  const S = nieuweS();
  T.zetVlag(S, 'meesterDood');
  const begroeting = T.gesprekKnoop(S, 'wim', 'welkom');
  const naarAardschok = begroeting.keuzes.find((k) => k.zeg === 'Wat is er vannacht gebeurd?');
  assert.equal(naarAardschok.naar, 'aardschok');

  const aardschok = T.gesprekKnoop(S, 'wim', 'aardschok');
  const naarMonsters = aardschok.keuzes.find((k) => k.zeg === 'Wat kwam er de trap af?');
  assert.equal(naarMonsters.naar, 'monsters');

  const monsters = T.gesprekKnoop(S, 'wim', 'monsters');
  assert.equal(monsters.keuzes[0].naar, 'meer');
  assert.ok(T.gesprekKnoop(S, 'wim', 'meer').tekst.includes('Wat wilt u nog weten'));
});
