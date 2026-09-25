// Het questsysteem zonder scherm (js/quest.js): in welke fase een quest staat, dat een beloning
// maar één keer wordt uitgekeerd, dat een weg vanzelf opengaat als zijn voorwaarde klopt, wat een
// gesprek ermee kan, en de toets van drie antwoorden — de regel uit ontwerp/toren.md die hier
// door npm test wordt nagekeken in plaats van door het oog.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
require('../js/quests.js');
require('../js/quest.js');
const T = globalThis.Toren;

const gemeld = [];
T.ui = { bericht: (tekst) => gemeld.push(tekst), toonGoud: () => {} };

function nieuweS() {
  gemeld.length = 0;
  return {
    held: { tx: 5, ty: 5 },
    inventaris: new Set(), vlaggen: new Set(),
    goud: 0, quests: {}, questWeg: {}, questBeloond: new Set(),
  };
}

// De quest waarmee hier gewerkt wordt, in de vorm van De koude oven: vier wegen die verschillend
// kosten, en een afgeefstap die geen keuze is.
function metQuest() {
  T.QUESTS.proef = {
    naam: 'De koude oven', gever: 'bakker', begin: 'zoeken',
    fasen: {
      zoeken: {
        doel: 'Zoek leem voor de scheur.',
        wegen: {
          kuil: { kost: 'risico', naar: 'terug', klaarAls: { heeft: 'leem' } },
          kramer: { kost: 'goud', naar: 'terug', doe: { goud: -15, geef: 'vuurklei' } },
          gunst: { kost: 'gunst', naar: 'terug' },
          oven: { kost: 'jaren', naar: 'klaar', klaarAls: { vlag: 'ovenGebakken' } },
        },
      },
      terug: {
        doel: 'Breng het naar de bakker.',
        wegen: { afgeven: { kost: 'niets', naar: 'klaar', doe: { neem: ['leem', 'vuurklei'] } } },
      },
      klaar: { eind: true, melding: 'Het dorp ruikt weer naar brood.', beloning: { goud: 20, vlag: 'ovenWarm' } },
    },
  };
  return T.QUESTS.proef;
}
test.afterEach(() => { delete T.QUESTS.proef; });

// ── De stand ──

test('een quest die niet loopt heeft geen fase; zetQuest begint hem', () => {
  metQuest();
  const S = nieuweS();
  assert.equal(T.questFase(S, 'proef'), null);
  assert.equal(T.questLoopt(S, 'proef'), false);
  T.zetQuest(S, 'proef', 'zoeken');
  assert.equal(T.questFase(S, 'proef'), 'zoeken');
  assert.equal(T.questAf(S, 'proef'), false);
});

test('een beloning komt één keer, ook als je nog eens in die fase komt', () => {
  metQuest();
  const S = nieuweS();
  T.zetQuest(S, 'proef', 'klaar');
  assert.equal(S.goud, 20);
  assert.equal(T.heeftVlag(S, 'ovenWarm'), true);
  assert.equal(T.questAf(S, 'proef'), true);
  assert.deepEqual(gemeld, ['Het dorp ruikt weer naar brood.']);

  T.zetQuest(S, 'proef', 'zoeken');
  T.zetQuest(S, 'proef', 'klaar');
  assert.equal(S.goud, 20, 'de beloning wordt niet nog eens uitgekeerd');
});

test('dezelfde fase nog eens zetten doet niets, en een onbekende fase verandert de stand niet', () => {
  metQuest();
  const S = nieuweS();
  T.zetQuest(S, 'proef', 'klaar');
  gemeld.length = 0;
  T.zetQuest(S, 'proef', 'klaar');
  assert.deepEqual(gemeld, [], 'geen tweede melding');
  T.zetQuest(S, 'proef', 'bestaatniet');
  assert.equal(T.questFase(S, 'proef'), 'klaar');
});

test('een weg betaalt eerst en zet dan pas de nieuwe fase, en onthoudt welke weg je nam', () => {
  metQuest();
  const S = nieuweS();
  S.goud = 20;
  T.zetQuest(S, 'proef', 'zoeken');
  assert.equal(T.neemWeg(S, 'proef', 'kramer'), true);
  assert.equal(S.goud, 5, 'de vijftien is eraf');
  assert.equal(S.inventaris.has('vuurklei'), true);
  assert.equal(T.questFase(S, 'proef'), 'terug');
  assert.equal(T.questWegVan(S, 'proef'), 'kramer');
});

// ── Vanzelf verder ──

test('werkQuestsBij neemt de weg waarvan de voorwaarde klopt, en hoogstens één stap per beeld', () => {
  metQuest();
  const S = nieuweS();
  T.zetQuest(S, 'proef', 'zoeken');
  T.werkQuestsBij(S);
  assert.equal(T.questFase(S, 'proef'), 'zoeken', 'zonder leem gebeurt er niets');

  S.inventaris.add('leem');
  T.werkQuestsBij(S);
  assert.equal(T.questFase(S, 'proef'), 'terug');
  assert.equal(T.questWegVan(S, 'proef'), 'kuil');
  // "afgeven" heeft geen klaarAls, dus die stap wacht op het gesprek met de bakker.
  T.werkQuestsBij(S);
  assert.equal(T.questFase(S, 'proef'), 'terug');
});

test('een weg met klaarAls gaat vanzelf: een vlag zetten brengt de quest op klaar', () => {
  metQuest();
  const S = nieuweS();
  T.zetQuest(S, 'proef', 'zoeken');
  T.zetVlag(S, 'ovenGebakken');
  T.werkQuestsBij(S);
  assert.equal(T.questFase(S, 'proef'), 'klaar');
  assert.equal(T.questWegVan(S, 'proef'), 'oven');
  assert.equal(S.goud, 20);
});

test('wat er linksboven staat, is de fase van de quest die je het eerst aannam', () => {
  metQuest();
  const S = nieuweS();
  assert.equal(T.questDoel(S), null);
  T.zetQuest(S, 'proef', 'zoeken');
  assert.deepEqual(T.questDoel(S), { kop: 'De koude oven', tekst: 'Zoek leem voor de scheur.' });
  T.zetQuest(S, 'proef', 'klaar');
  assert.equal(T.questDoel(S), null, 'een fase zonder doel vraagt niets meer');
});

// ── Wat een gesprek ermee kan ──

test('een gesprek kan op de stand van een quest letten, en op de weg die je nam', () => {
  metQuest();
  const S = nieuweS();
  const geldt = (als) => T.voorwaardeGeldt(S, 'bakker', als);
  assert.equal(geldt({ nietQuest: 'proef' }), true);
  assert.equal(geldt({ quest: 'proef' }), false);

  T.zetQuest(S, 'proef', 'zoeken');
  assert.equal(geldt({ nietQuest: 'proef' }), false);
  assert.equal(geldt({ quest: 'proef' }), true);
  assert.equal(geldt({ quest: 'proef', fase: 'zoeken' }), true);
  assert.equal(geldt({ quest: 'proef', fase: 'terug' }), false);
  assert.equal(geldt({ quest: 'proef', fase: ['zoeken', 'terug'] }), true);
  assert.equal(geldt({ questAf: 'proef' }), false);

  T.zetQuest(S, 'proef', 'terug', 'kramer');
  assert.equal(geldt({ quest: 'proef', weg: 'kramer' }), true);
  assert.equal(geldt({ quest: 'proef', weg: 'kuil' }), false);
  T.zetQuest(S, 'proef', 'klaar');
  assert.equal(geldt({ questAf: 'proef' }), true);
});

test('een antwoord kan goud en voorwerpen geven en nemen, en een quest verder zetten', () => {
  metQuest();
  const S = nieuweS();
  T.doeGevolg(S, { quest: 'proef' }); // zonder fase: begin hem
  assert.equal(T.questFase(S, 'proef'), 'zoeken');

  T.doeGevolg(S, { goud: 30, geef: 'leem' });
  assert.equal(S.goud, 30);
  assert.equal(S.inventaris.has('leem'), true);

  T.doeGevolg(S, { quest: 'proef', weg: 'kramer' });
  assert.equal(T.questFase(S, 'proef'), 'terug');
  assert.equal(S.goud, 15);

  T.doeGevolg(S, { neem: ['leem', 'vuurklei'] });
  assert.equal(S.inventaris.has('leem'), false);
  assert.equal(S.inventaris.has('vuurklei'), false);
});

test('goud is een voorwaarde, komt nooit onder nul, en het vakje blijft in beeld als je ooit goud had', () => {
  const S = nieuweS();
  assert.equal(T.voorwaardeGeldt(S, 'kramer', { goud: 10 }), false);
  T.geefGoud(S, 10);
  assert.equal(T.voorwaardeGeldt(S, 'kramer', { goud: 10 }), true, 'tien is minstens tien');
  assert.equal(S.goudGehad, true);
  T.geefGoud(S, -50);
  assert.equal(S.goud, 0);
  assert.equal(S.goudGehad, true);
});

// ── Voorwerpen die aan een quest hangen ──

test('quest="bakker:zoeken" wordt een grendel, ook met meer fasen', () => {
  assert.deepEqual(T.questGrendel('proef:zoeken'), { quest: 'proef', fase: ['zoeken'] });
  assert.deepEqual(T.questGrendel('proef:zoeken,terug'), { quest: 'proef', fase: ['zoeken', 'terug'] });
  assert.deepEqual(T.questGrendel('proef'), { quest: 'proef', fase: null });
  assert.equal(T.questGrendel(''), null);
  assert.equal(T.questGrendel(7), null);
});

test('een voorwerp aan een quest ligt er alleen in die fase, en verdwijnt weer', () => {
  metQuest();
  const S = nieuweS();
  const leem = { soort: 'leem', x: 3, y: 4, grendel: { quest: 'proef', fase: ['zoeken'] } };
  S.wereld = { voorwerpen: [], questVoorwerpen: [leem] };

  T.werkQuestVoorwerpen(S);
  assert.equal(T.voorwerpOp(S.wereld, 3, 4), null, 'vóór de quest ligt er niets');

  T.zetQuest(S, 'proef', 'zoeken');
  assert.equal(T.voorwerpOp(S.wereld, 3, 4), leem, 'de bakker vroeg erom, dus nu ligt het er');

  T.zetQuest(S, 'proef', 'klaar');
  assert.equal(T.voorwerpOp(S.wereld, 3, 4), null, 'daarna ligt het er weer niet');
  assert.equal(S.wereld.voorwerpen.length, 0, 'en het blijft niet als gat achter');
});

// ── De toets van drie antwoorden ──

test('een quest met vier wegen die verschillend kosten, is goed', () => {
  assert.deepEqual(T.keurQuests({ proef: metQuest() }), []);
});

test('de quests in het spel halen de toets van drie antwoorden', () => {
  assert.deepEqual(T.keurQuests(T.QUESTS), []);
});

test('één weg is geen keuze, en drie keer hetzelfde betalen ook niet', () => {
  const eenWeg = {
    p: { naam: 'Eén weg', begin: 'a', fasen: { a: { wegen: { x: { kost: 'goud', naar: 'b' } } }, b: { eind: true } } },
  };
  assert.match(T.keurQuests(eenWeg).join('\n'), /1 echte weg/);

  const drieKeerGoud = {
    p: {
      naam: 'Alles met goud', begin: 'a',
      fasen: {
        a: { wegen: { x: { kost: 'goud', naar: 'b' }, y: { kost: 'goud', naar: 'b' }, z: { kost: 'goud', naar: 'b' } } },
        b: { eind: true },
      },
    },
  };
  assert.match(T.keurQuests(drieKeerGoud).join('\n'), /elke weg kost "goud"/);
});

test('de controle vindt ook de gewone fouten in gegevens', () => {
  const stuk = {
    p: {
      begin: 'weg',
      fasen: {
        a: { wegen: { x: { kost: 'brood', naar: 'nergens' }, y: { kost: 'goud', naar: 'b' }, z: { kost: 'jaren', naar: 'b' } } },
        b: {},
        los: { wegen: { q: { kost: 'gunst', naar: 'b' } } },
      },
    },
  };
  const klachten = T.keurQuests(stuk).join('\n');
  assert.match(klachten, /geen naam/);
  assert.match(klachten, /begin "weg" is geen fase/);
  assert.match(klachten, /geen enkele fase heeft eind/);
  assert.match(klachten, /gaat naar "nergens"/);
  assert.match(klachten, /kost "brood"/);
  assert.match(klachten, /uit fase "b" komt geen weg/);
  assert.match(klachten, /fase "a" is nergens vandaan te bereiken/);
});

test('een einde dat je niet kunt bereiken, is geen einde', () => {
  const onbereikbaar = {
    p: {
      naam: 'Doodlopend', begin: 'a',
      fasen: {
        a: { wegen: { x: { kost: 'goud', naar: 'a' }, y: { kost: 'jaren', naar: 'a' }, z: { kost: 'gunst', naar: 'a' } } },
        eind: { eind: true },
      },
    },
  };
  const klachten = T.keurQuests(onbereikbaar).join('\n');
  assert.match(klachten, /het einde is vanaf "a" niet te bereiken/);
});
