// Toetst de situaties in js/gesprekken.js: klinkt elke zin ergens?
//
// Waarom dit bestaat: sinds 22 sep kijk je in de gespreksschrijver door één situatie tegelijk
// (gereedschap/gesprekken-tool.js). Een zin met een voorwaarde waar geen enkele situatie bij
// past, zie je daar dus nooit — en dat is bijna altijd een vergeten situatie, niet een zin die
// weg kan. De schrijver zegt het zelf al ("in geen enkele situatie"), maar dat helpt alleen als
// je die persoon toevallig openslaat. Hier valt het op zodra er iets bijkomt.
//
// Dit toetst nadrukkelijk niet of een voorwaarde klópt, maar of hij wint: een zin die door een
// regel erboven wordt weggenomen, hoort de speler net zo min.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
require('../js/quests.js');
require('../js/quest.js');
require('../gereedschap/gesprekken-tool.js');
const T = globalThis.Toren;
const { situatiesVan, staatVanSituatie } = T.gesprekkenTool;

// Alle toestanden waarin we deze persoon bekijken: wat hij zelf aan situaties heeft, plus de
// fasen van de quest die hij geeft (die staan er vanzelf bij).
const staten = (id) => situatiesVan(id).map((s) => ({ naam: s.naam, S: staatVanSituatie(s.als, id) }));

test('elke zin die iemand zegt, klinkt in minstens één situatie', () => {
  const nergens = [];
  for (const [id, persoon] of Object.entries(T.GESPREKKEN)) {
    const lijst = staten(id);
    for (const [knoopId, knoop] of Object.entries(persoon.knopen)) {
      for (const regel of knoop.tekst || []) {
        if (!regel.als) continue; // een vangnet wint altijd ergens
        const wint = lijst.some(({ S }) => T.eersteDiePast(S, id, knoop.tekst) === regel);
        if (!wint) nergens.push(`${persoon.naam} · ${knoopId} · "${(regel.zeg || '').slice(0, 50)}"`);
      }
    }
  }
  assert.deepEqual(nergens, [], 'deze zinnen hoort de speler in geen enkele situatie:\n' + nergens.join('\n'));
});

test('elk antwoord dat je kunt geven, staat er in minstens één situatie', () => {
  const nergens = [];
  for (const [id, persoon] of Object.entries(T.GESPREKKEN)) {
    const lijst = staten(id);
    for (const [knoopId, knoop] of Object.entries(persoon.knopen)) {
      for (const keuze of knoop.keuzes || []) {
        if (!keuze.als) continue;
        const zichtbaar = lijst.some(({ S }) => T.voorwaardeGeldt(S, id, keuze.als));
        if (!zichtbaar) nergens.push(`${persoon.naam} · ${knoopId} · "${(keuze.zeg || '').slice(0, 50)}"`);
      }
    }
  }
  assert.deepEqual(nergens, [], 'deze antwoorden zie je in geen enkele situatie:\n' + nergens.join('\n'));
});

test('een situatie is een toestand, en levert dus een spelstaat op die het spel begrijpt', () => {
  const S = staatVanSituatie({ vlag: ['meesterDood', 'sleutelGebruikt'], heeft: 'sleutel' }, 'wim');
  assert.ok(T.heeftVlag(S, 'meesterDood'));
  assert.ok(T.heeftVlag(S, 'sleutelGebruikt'), 'een toestand mag twee vlaggen hebben');
  assert.ok(S.inventaris.has('sleutel'));
  assert.equal(T.heeftVlag(S, 'fonteinLeeg'), false, 'wat niet genoemd is, staat niet aan');
});

test('een questfase in een situatie zet de quest echt in die fase', () => {
  const S = staatVanSituatie({ quest: 'bakker', fase: 'terug' }, 'bakker');
  assert.equal(T.questFase(S, 'bakker'), 'terug');
  const af = staatVanSituatie({ questAf: 'bakker' }, 'bakker');
  assert.ok(T.questAf(af, 'bakker'), 'questAf zet hem in een fase waarop de quest af is');
});

test('wie een quest geeft, krijgt zijn fasen als situatie zonder ze te verzinnen', () => {
  const namen = situatiesVan('bakker').map((s) => s.naam);
  for (const fase of Object.keys(T.QUESTS.bakker.fasen)) {
    assert.ok(namen.includes(fase), `fase "${fase}" hoort in de situatiebalk van de bakker te staan`);
  }
});

test('een voorwaarde mag een lijstje vlaggen zijn, net als een gevolg', () => {
  const S = staatVanSituatie({ vlag: ['meesterDood', 'sleutelGebruikt'] }, 'wim');
  assert.ok(T.voorwaardeGeldt(S, 'wim', { vlag: ['meesterDood', 'sleutelGebruikt'] }), 'allebei gezet');
  assert.equal(T.voorwaardeGeldt(S, 'wim', { vlag: ['meesterDood', 'fonteinLeeg'] }), false, 'één ervan mist');
  assert.equal(T.voorwaardeGeldt(S, 'wim', { nietVlag: ['fonteinLeeg', 'meesterDood'] }), false, 'één ervan staat wél');
  assert.ok(T.voorwaardeGeldt(S, 'wim', { nietVlag: ['fonteinLeeg', 'ovenWarm'] }), 'geen van beide');
  // Zo kun je in een situatie met twee vlaggen een antwoord toevoegen dat er ook echt staat:
  // de schrijver zet de voorwaarde van de situatie op wat je erbij maakt.
  assert.ok(T.voorwaardeGeldt(S, 'wim', { heeft: [] }), 'een leeg lijstje houdt niets tegen');
});
