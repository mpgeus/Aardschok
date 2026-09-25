// Toetst gereedschap/keuring.js: de keuring die gereedschap/wereld.html in beeld zet. Twee
// vragen, en ze wijzen tegengesteld — staat er iets op de kaart dat het spel niet kan gebruiken
// (T.keurKaart), en vraagt het spel iets dat nergens staat (T.keurDekking).
//
// De kaarten die er nu zijn, horen schoon te zijn; wat er mis kan gaan, toetsen we op een kaart
// die hier in de toets zelf gemaakt wordt, zodat kaarten/*.tmj niet vol hoeft te staan met
// expres kapotte dingen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
require('../js/quests.js');
require('../js/quest.js');
require('../js/verkennen.js');
require('../gereedschap/keuring.js');
const T = globalThis.Toren;

// Een kaartje van 6×4 gras met één object erop, om een enkele fout te kunnen laten zien. De
// vorm is die van een .tmj zoals Tiled hem opslaat; grond.tsx begint bij gid 1.
function kaartje(objecten, extraLagen) {
  const grondVel = T.TEGELS.grond;
  const gras = grondVel.tiles.findIndex((t) => t && t.naam === 'gras') + 1;
  const b = 6;
  const h = 4;
  return {
    width: b, height: h, tilewidth: 64, tileheight: 32, orientation: 'isometric',
    tilesets: [{ firstgid: 1, source: '../tegels/grond.tsx' }],
    layers: [
      { type: 'tilelayer', name: 'grond', width: b, height: h, data: new Array(b * h).fill(gras) },
      ...(extraLagen || []),
      {
        type: 'objectgroup', name: 'objecten',
        objects: objecten.map((o, i) => ({
          id: i + 1, name: o.naam || '', gid: o.gid || 0, x: o.x * 32, y: o.y * 32,
          properties: Object.entries(o.eig || {}).map(([name, value]) => ({ name, value })),
        })),
      },
    ],
  };
}

// Sinds 22 sep staat de betekenis in een eigen bestand en tekent Tiled alleen nog de grond
// (ontwerp/kaarten.md). Dus gaan de dingen die iets betekenen hier als `dingen` mee, en wat er
// nog wel in Tiled staat, is een eigen toets.
// Een uitgang zit er standaard bij, want een kaart zonder uitgang is op zichzelf al een fout;
// die toetsen we apart.
const UITGANG = { x: 0, y: 0, overgang: 'proefbos', komt: '1,0' };
const keur = (dingen, objecten, extraLagen) =>
  T.keurKaart('proefje', kaartje(objecten || [], extraLagen), { betekenis: { dingen } }).klachten;
const teksten = (klachten) => klachten.map((k) => k.tekst).join(' | ');

test('de kaarten die er nu zijn, hebben geen enkele fout', () => {
  for (const naam of Object.keys(T.KAARTEN)) {
    const klachten = T.keurKaart(naam, T.KAARTEN[naam]).klachten;
    const fouten = klachten.filter((k) => k.soort === 'fout');
    assert.deepEqual(fouten, [], `${naam}: ${teksten(fouten)}`);
  }
});

test('wat er op het gehucht nog "let op" is, staat hier zwart op wit', () => {
  // Niet elke opmerking is een defect. De weg de wereld in leidt sinds 25 sep nergens heen (het
  // gehucht is daarom nog een proefkaart), en achter de bomen liggen plukjes gras waar je niet bij
  // kunt. Dat mag, maar het hoort hier te staan, zodat het opvalt als er iets bijkomt — dan is er
  // waarschijnlijk een pad dichtgegroeid. (Tot 25 sep keek deze toets naar kaarten/wereld.tmj.)
  const klachten = T.keurKaart('gehucht', T.KAARTEN.gehucht).klachten;
  assert.deepEqual(klachten.map((k) => k.soort), ['let op', 'let op', 'let op']);
  const tekst = teksten(klachten);
  assert.match(tekst, /overgang naar "wereld": die kaart is er \(nog\) niet/);
  assert.match(tekst, /de overgang naar "wereld" heeft geen "komt"/);
  assert.match(tekst, /tegel\(s\) zijn begaanbaar maar vanaf geen enkele uitgang te bereiken/);
});

test('een kaart zonder uitgang is een val', () => {
  const klachten = keur([]);
  assert.equal(klachten.length, 1);
  assert.match(klachten[0].tekst, /geen enkele overgang/);
  assert.equal(klachten[0].soort, 'fout');
});

test('een wezen dat niet bestaat, wordt bij naam genoemd', () => {
  const klachten = keur([UITGANG, { x: 2, y: 2, wezen: 'bakkr' }]);
  assert.equal(klachten.length, 1);
  assert.match(klachten[0].tekst, /onbekend wezen "bakkr"/);
  assert.equal(klachten[0].x, 2);
  assert.equal(klachten[0].y, 2);
});

// Een quest alleen voor deze toetsen: er staat nog geen echte in js/quests.js (tot 25 sep was dat De
// koude oven, van de bakker). Hij vraagt om een sleutel, van de heer.
function metProefQuest(toets) {
  T.QUESTS.proef = {
    naam: 'De proef', gever: 'heer', begin: 'zoeken',
    fasen: {
      zoeken: { wegen: {
        vinden: { kost: 'risico', naar: 'klaar', klaarAls: { heeft: 'sleutel' } },
        kopen: { kost: 'goud', naar: 'klaar' },
        vragen: { kost: 'gunst', naar: 'klaar' },
      } },
      klaar: { eind: true },
    },
  };
  try {
    toets();
  } finally {
    delete T.QUESTS.proef;
  }
}

test('een quest die niet bestaat, en een fase die de quest niet heeft', () => metProefQuest(() => {
  const geenQuest = keur([UITGANG, { x: 2, y: 2, quest: 'slager:zoeken' }]);
  assert.match(teksten(geenQuest), /quest "slager", en die bestaat niet/);

  const geenFase = keur([UITGANG, { x: 2, y: 2, quest: 'proef:bakken' }]);
  assert.match(teksten(geenFase), /fase "bakken", en die heeft "proef" niet/);
}));

test('een overgang naar een gebied dat niet bestaat, en een komt die nergens op slaat', () => {
  const klachten = keur([{ x: 0, y: 0, overgang: 'moeras', komt: '9,9' }]);
  assert.match(teksten(klachten), /dat gebied bestaat niet/);
  assert.match(teksten(klachten), /"komt" van de overgang naar "moeras" wijst naar een tegel/);
});

test('een overgang zonder komt is geen fout maar wel iets om te weten', () => {
  const klachten = keur([{ x: 0, y: 0, overgang: 'proefbos' }]);
  assert.equal(klachten.length, 1);
  assert.equal(klachten[0].soort, 'let op');
  assert.match(klachten[0].tekst, /geen "komt"/);
});

test('een komt die naar de overgangstegel zelf wijst, kaatst je heen en weer', () => {
  const klachten = keur([{ x: 0, y: 0, overgang: 'proefbos', komt: '0,0' }]);
  assert.match(teksten(klachten), /kaats je heen en weer/);
});

test('twee mensen op dezelfde tegel, en een straal die geen getal is', () => {
  const klachten = keur([
    UITGANG,
    { x: 3, y: 2, wezen: 'wim' },
    { x: 3, y: 2, zaad: 7, straal: 'veel' },
  ]);
  assert.match(teksten(klachten), /staat op dezelfde tegel als/);
  assert.match(teksten(klachten), /dat is geen getal boven nul/);
});

test('twee keer de held: het spel weet dan niet waar je begint', () => {
  const klachten = keur([UITGANG, { x: 2, y: 1, wezen: 'held' }, { x: 3, y: 1, wezen: 'held' }]);
  assert.match(teksten(klachten), /2 objecten met wezen="held"/);
});

test('een dorpeling in een boom komt daar niet meer vandaan', () => {
  // De boom blijft in Tiled staan -- dat is tekenen -- en de dorpeling komt uit het
  // betekenisbestand, op dezelfde tegel.
  const grondAantal = T.TEGELS.grond.tiles.length;
  const eik = T.TEGELS.bomen.tiles.findIndex((t) => t && t.naam === 'eik');
  const kaart = kaartje([{ naam: 'eik', x: 3, y: 2, gid: 1 + grondAantal + eik }]);
  kaart.tilesets.push({ firstgid: 1 + grondAantal, source: '../tegels/bomen.tsx' });
  const klachten = T.keurKaart('proefje', kaart, { betekenis: { dingen: [UITGANG, { x: 3, y: 2, zaad: 3 }] } }).klachten;
  assert.match(teksten(klachten), /staat op een vaste tegel/);
});

test('een voorwerp uit het betekenisbestand staat er op naam, niet op nummer', () => {
  const kaart = kaartje([]);
  const uitslag = T.keurKaart('proefje', kaart, {
    betekenis: { dingen: [UITGANG, { x: 3, y: 2, tegel: 'bomen/eik' }] },
  });
  assert.deepEqual(uitslag.klachten, [], teksten(uitslag.klachten));
  const v = uitslag.wereld.voorwerpen.find((v) => v.x === 3 && v.y === 2);
  assert.equal(v.soort, 'eik');
  assert.equal(v.vel, 'bomen');
  assert.equal(T.isVast(uitslag.wereld, 3, 2), true);
});

test('wat betekenis heeft en nog in Tiled staat, hoort in het betekenisbestand', () => {
  const klachten = keur([UITGANG], [{ naam: 'de slijmkruiper', x: 3, y: 2, eig: { wezen: 'slijm' } }]);
  assert.equal(klachten.length, 1);
  assert.equal(klachten[0].soort, 'let op');
  assert.match(klachten[0].tekst, /staat nog in Tiled; het hoort in proefje\.betekenis\.json/);
});

test('een geheime doorgang is er pas als zijn vlag staat', () => {
  const uitslag = T.keurKaart('proefje', kaartje([]), {
    betekenis: { dingen: [UITGANG, { x: 3, y: 2, staat: 'geheim', als: { vlag: 'bakkerVertelde' } }] },
  });
  assert.deepEqual(uitslag.klachten, [], teksten(uitslag.klachten));
  const w = uitslag.wereld;
  assert.equal(w.geheimen.length, 1);
  assert.equal(T.deurOp(w, 3, 2), null, 'zonder de vlag staat er geen deur');

  const S = { wereld: w, vlaggen: new Set(), inventaris: new Set(), quests: {} };
  T.werkGeheimenBij(S);
  assert.equal(T.deurOp(w, 3, 2), null, 'nog steeds niet, de vlag staat niet');
  S.vlaggen.add('bakkerVertelde');
  T.werkGeheimenBij(S);
  const d = T.deurOp(w, 3, 2);
  assert.ok(d, 'met de vlag is het een gewone dichte deur');
  assert.equal(d.staat, 'dicht');
  assert.equal(T.tegel(w, 3, 2), 'deur');
  // En weer weg als de vlag weggaat: dan staat de tegel er weer zoals hij was.
  S.vlaggen.delete('bakkerVertelde');
  T.werkGeheimenBij(S);
  assert.equal(T.deurOp(w, 3, 2), null);
});

test('een geheime doorgang zonder voorwaarde is niet geheim, en een onbekende quest is fout', () => {
  assert.match(teksten(keur([UITGANG, { x: 3, y: 2, staat: 'geheim' }])), /zonder "als" is er meteen/);
  assert.match(
    teksten(keur([UITGANG, { x: 3, y: 2, staat: 'geheim', als: { quest: 'slager' } }])),
    /wacht op quest "slager", en die bestaat niet/,
  );
});

test('een aansluiting die maar een kant heeft', () => {
  const heen = { overgangen: [{ x: 1, y: 1, naar: 'bos' }], wezens: [], voorwerpen: [] };
  const terug = { overgangen: [], wezens: [], voorwerpen: [] };
  const tekst = teksten(T.keurDekking({ werelden: { dorp: heen, bos: terug } }));
  assert.match(tekst, /van "dorp" \(1, 1\) naar "bos" heeft maar een kant|heeft maar één kant/);

  terug.overgangen.push({ x: 9, y: 9, naar: 'dorp' });
  assert.doesNotMatch(teksten(T.keurDekking({ werelden: { dorp: heen, bos: terug } })), /maar één kant/);
});

test('een eilandje achter de bomen valt op', () => {
  // Een dorpeling op een tegel waar je vanaf de uitgang niet kunt komen: hij staat er wel, maar
  // je spreekt hem nooit. Vier bomen eromheen is genoeg om hem op te sluiten.
  const grondAantal = T.TEGELS.grond.tiles.length;
  const eik = T.TEGELS.bomen.tiles.findIndex((t) => t && t.naam === 'eik');
  const boom = (x, y) => ({ naam: 'eik', x, y, gid: 1 + grondAantal + eik });
  const kaart = kaartje([boom(2, 1), boom(3, 1), boom(4, 1), boom(2, 2), boom(4, 2), boom(2, 3), boom(3, 3), boom(4, 3)]);
  kaart.tilesets.push({ firstgid: 1 + grondAantal, source: '../tegels/bomen.tsx' });
  const klachten = T.keurKaart('proefje', kaart, {
    betekenis: { dingen: [UITGANG, { x: 3, y: 2, zaad: 1 }] },
  }).klachten;
  assert.match(teksten(klachten), /staat op een tegel waar je vanaf geen enkele uitgang kunt komen/);

  // En zonder die bomen staat hij gewoon bereikbaar.
  const open = T.keurKaart('proefje', kaartje([]), {
    betekenis: { dingen: [UITGANG, { x: 3, y: 2, zaad: 1 }] },
  }).klachten;
  assert.doesNotMatch(teksten(open), /geen enkele uitgang kunt komen/);
});

test('de dekking zegt wat het spel vraagt en nergens staat', () => {
  const klachten = T.keurDekking();
  const tekst = teksten(klachten);
  // De koude oven is geschreven maar nog niet in Tiled neergezet (22 sep 2026). Zodra dat wel zo
  // is, horen deze regels vanzelf te verdwijnen — en dan zegt deze toets dat ze er niet meer zijn.
  for (const wie of Object.keys(T.GESPREKKEN)) {
    // Wie over de weg komt (de heer en zijn soldaten), hoeft nergens te staan, en het gesprek van een
    // karakter (de zanger, de weduwe, …) voert een boer die het trekt (js/boeren.js).
    const staat = (T.MENSEN[wie] && T.MENSEN[wie].bezoeker) || (T.KARAKTERS && T.KARAKTERS[wie]) || Object.values(T.GEBIEDEN).some((g) => g.maak().wezens.some((e) => e.soort === wie));
    assert.equal(!tekst.includes(`"${wie}" heeft een gesprek`), !!staat, `${wie}: de dekking en de wereld zijn het oneens`);
  }
});

test('de dekking merkt op dat een quest een voorwerp vraagt dat nergens vandaan komt', () => metProefQuest(() => {
  // De proefquest gaat vanzelf verder zodra je een sleutel hebt, en er ligt er op geen enkele kaart
  // een; dat hoort de dekking te zeggen.
  assert.match(teksten(T.keurDekking()), /zodra je "sleutel" hebt, maar dat is nergens te krijgen/);
}));

test('een wereld met de sleutel erin haalt die klacht weg', () => metProefQuest(() => {
  const sleutel = { soort: 'sleutel', x: 2, y: 2, grendel: { quest: 'proef', fase: ['zoeken'] } };
  const werelden = { proefje: { wezens: [{ soort: 'heer' }], voorwerpen: [], questVoorwerpen: [sleutel] } };
  assert.doesNotMatch(teksten(T.keurDekking({ werelden })), /nergens te krijgen/);
}));

test('een questvoorwerp dat niet op te rapen is, loopt dood', () => {
  const werelden = {
    proefje: {
      wezens: [{ soort: 'bakker' }],
      voorwerpen: [],
      questVoorwerpen: [{ soort: 'steenhoop', x: 2, y: 2, grendel: { quest: 'bakker', fase: ['zoeken'] } }],
    },
  };
  assert.match(teksten(T.keurDekking({ werelden })), /staat niet in T.OPRAPEN/);
});

test('één mens kan niet op twee plekken staan', () => {
  const klachten = keur([UITGANG, { x: 2, y: 2, wie: 'smid' }, { x: 4, y: 2, wie: 'smid' }]);
  assert.match(teksten(klachten), /"de smid" staat ook al op \(2, 2\)/);
});

test('een mens die niet in de lijst staat, wordt bij naam genoemd', () => {
  assert.match(teksten(keur([UITGANG, { x: 2, y: 2, wie: 'slager' }])), /onbekende mens "slager"/);
});

test('twee monden voor één tekst valt op', () => {
  // Een boer en een dorpeling die zijn gesprek leent: ze zeggen dan woord voor woord hetzelfde.
  const klachten = keur([UITGANG, { x: 2, y: 2, wie: 'boer1' }, { x: 4, y: 2, zaad: 3, gesprek: 'zanger' }]);
  assert.match(teksten(klachten), /voert hetzelfde gesprek "zanger"/);
});

test('een mens komt met zijn eigen naam en zijn eigen gesprek uit de kaart', () => {
  const uitslag = T.keurKaart('proefje', kaartje([]), {
    betekenis: { dingen: [UITGANG, { x: 3, y: 2, wie: 'koster' }] },
  });
  const e = uitslag.wereld.wezens.find((e) => e.wie === 'koster');
  assert.equal(e.naam, 'de koster');
  assert.equal(T.gesprekIdVan(e), 'koster');
  assert.equal(e.soort, 'dorpeling', 'de koster is nog niet getekend en leent een dorpelingvel');
  assert.equal(e.dwaalt, true);
});

test('de dekking telt in één regel op wie er nog nergens staat', () => {
  const werelden = { proefje: { wezens: [{ soort: 'bakker', wie: 'bakker' }], voorwerpen: [], overgangen: [] } };
  const tekst = teksten(T.keurDekking({ werelden }));
  assert.match(tekst, /van de \d+ mensen staan nog nergens/);
  assert.doesNotMatch(tekst, /nergens: .*\bbakker\b/);
});
