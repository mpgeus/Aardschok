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

require('../js/gesprekken.js');
require('../js/gesprek.js');
require('../js/quests.js');
require('../js/quest.js');
require('../gereedschap/gesprekken-tool.js');
const T = globalThis.Spel;
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
  const S = staatVanSituatie({ vlag: ['briefVanDeHeer', 'heerBetaald'], heeft: 'sleutel' }, 'heer');
  assert.ok(T.heeftVlag(S, 'briefVanDeHeer'));
  assert.ok(T.heeftVlag(S, 'heerBetaald'), 'een toestand mag twee vlaggen hebben');
  assert.ok(S.inventaris.has('sleutel'));
  assert.equal(T.heeftVlag(S, 'soldatenInHuis'), false, 'wat niet genoemd is, staat niet aan');
});

// Een quest alleen voor deze toetsen, met de heer als gever (er staat nog geen echte quest in
// js/quests.js; tot 25 sep was dit De koude oven, van de bakker).
function metProefQuest(toets) {
  T.QUESTS.proef = {
    naam: 'De proef', gever: 'heer', begin: 'zoeken',
    fasen: {
      zoeken: { doel: 'Zoek iets.', wegen: { vinden: { kost: 'risico', naar: 'terug' } } },
      terug: { doel: 'Breng het terug.', wegen: { afgeven: { kost: 'niets', naar: 'klaar' } } },
      klaar: { eind: true },
    },
  };
  try {
    toets();
  } finally {
    delete T.QUESTS.proef;
  }
}

test('een questfase in een situatie zet de quest echt in die fase', () => metProefQuest(() => {
  const S = staatVanSituatie({ quest: 'proef', fase: 'terug' }, 'heer');
  assert.equal(T.questFase(S, 'proef'), 'terug');
  const af = staatVanSituatie({ questAf: 'proef' }, 'heer');
  assert.ok(T.questAf(af, 'proef'), 'questAf zet hem in een fase waarop de quest af is');
}));

test('wie een quest geeft, krijgt zijn fasen als situatie zonder ze te verzinnen', () => metProefQuest(() => {
  const namen = situatiesVan('heer').map((s) => s.naam);
  for (const fase of Object.keys(T.QUESTS.proef.fasen)) {
    assert.ok(namen.includes(fase), `fase "${fase}" hoort in de situatiebalk van de heer te staan`);
  }
}));

test('een voorwaarde mag een lijstje vlaggen zijn, net als een gevolg', () => {
  const S = staatVanSituatie({ vlag: ['briefVanDeHeer', 'heerBetaald'] }, 'heer');
  assert.ok(T.voorwaardeGeldt(S, 'heer', { vlag: ['briefVanDeHeer', 'heerBetaald'] }), 'allebei gezet');
  assert.equal(T.voorwaardeGeldt(S, 'heer', { vlag: ['briefVanDeHeer', 'soldatenInHuis'] }), false, 'één ervan mist');
  assert.equal(T.voorwaardeGeldt(S, 'heer', { nietVlag: ['soldatenInHuis', 'briefVanDeHeer'] }), false, 'één ervan staat wél');
  assert.ok(T.voorwaardeGeldt(S, 'heer', { nietVlag: ['soldatenInHuis', 'innerOpBezoek'] }), 'geen van beide');
  // Zo kun je in een situatie met twee vlaggen een antwoord toevoegen dat er ook echt staat:
  // de schrijver zet de voorwaarde van de situatie op wat je erbij maakt.
  assert.ok(T.voorwaardeGeldt(S, 'heer', { heeft: [] }), 'een leeg lijstje houdt niets tegen');
});
