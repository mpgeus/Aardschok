// Toetst gereedschap/keuring.js: de keuring die gereedschap/wereld.html in beeld zet. Twee
// vragen, en ze wijzen tegengesteld — staat er iets op de kaart dat het spel niet kan gebruiken
// (T.keurKaart), en vraagt het spel iets dat nergens staat (T.keurDekking).
//
// De kaarten die er nu zijn, horen schoon te zijn; wat er mis kan gaan, toetsen we op een kaart
// die hier in de toets zelf gemaakt wordt, zodat kaarten/*.tmj niet vol hoeft te staan met
// expres kapotte dingen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
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

// Een uitgang, want een kaart zonder uitgang is op zichzelf al een fout; die toetsen we apart.
const UITGANG = { x: 0, y: 0, eig: { overgang: 'toren', komt: '1,0' } };
const keur = (objecten, extra) => T.keurKaart('proefje', kaartje(objecten, extra)).klachten;
const teksten = (klachten) => klachten.map((k) => k.tekst).join(' | ');

test('de kaarten die er nu zijn, hebben geen enkele klacht', () => {
  for (const naam of Object.keys(T.KAARTEN)) {
    const klachten = T.keurKaart(naam, T.KAARTEN[naam]).klachten;
    assert.deepEqual(klachten, [], `${naam}: ${teksten(klachten)}`);
  }
});

test('een kaart zonder uitgang is een val', () => {
  const klachten = keur([]);
  assert.equal(klachten.length, 1);
  assert.match(klachten[0].tekst, /geen enkele overgang/);
  assert.equal(klachten[0].soort, 'fout');
});

test('een wezen dat niet bestaat, wordt bij naam genoemd', () => {
  const klachten = keur([UITGANG, { x: 2, y: 2, eig: { wezen: 'bakkr' } }]);
  assert.equal(klachten.length, 1);
  assert.match(klachten[0].tekst, /onbekend wezen "bakkr"/);
  assert.equal(klachten[0].x, 2);
  assert.equal(klachten[0].y, 2);
});

test('een quest die niet bestaat, en een fase die de quest niet heeft', () => {
  const geenQuest = keur([UITGANG, { naam: 'leem', x: 2, y: 2, eig: { quest: 'slager:zoeken' } }]);
  assert.match(teksten(geenQuest), /quest "slager", en die bestaat niet/);

  const geenFase = keur([UITGANG, { naam: 'leem', x: 2, y: 2, eig: { quest: 'bakker:bakken' } }]);
  assert.match(teksten(geenFase), /fase "bakken", en die heeft "bakker" niet/);
});

test('een raakpunt dat nergens op slaat, en een raakpunt zonder tegel', () => {
  const klachten = keur([UITGANG, { naam: 'oven', x: 2, y: 2, eig: { raak: 'molen' } }]);
  assert.match(teksten(klachten), /raak="molen" bestaat niet/);
  assert.match(teksten(klachten), /zonder tegel/);
});

test('een overgang naar een gebied dat niet bestaat, en een komt die nergens op slaat', () => {
  const klachten = keur([{ x: 0, y: 0, eig: { overgang: 'moeras', komt: '9,9' } }]);
  assert.match(teksten(klachten), /dat gebied bestaat niet/);
  assert.match(teksten(klachten), /"komt" van de overgang naar "moeras" wijst naar een tegel/);
});

test('een overgang zonder komt is geen fout maar wel iets om te weten', () => {
  const klachten = keur([{ x: 0, y: 0, eig: { overgang: 'toren' } }]);
  assert.equal(klachten.length, 1);
  assert.equal(klachten[0].soort, 'let op');
  assert.match(klachten[0].tekst, /geen "komt"/);
});

test('een komt die naar de overgangstegel zelf wijst, kaatst je heen en weer', () => {
  const klachten = keur([{ x: 0, y: 0, eig: { overgang: 'toren', komt: '0,0' } }]);
  assert.match(teksten(klachten), /kaats je heen en weer/);
});

test('twee mensen op dezelfde tegel, en een straal die geen getal is', () => {
  const klachten = keur([
    UITGANG,
    { x: 3, y: 2, eig: { wezen: 'boer' } },
    { x: 3, y: 2, eig: { zaad: 7, straal: 'veel' } },
  ]);
  assert.match(teksten(klachten), /staat op dezelfde tegel als/);
  assert.match(teksten(klachten), /dat is geen getal boven nul/);
});

test('twee keer de held: het spel weet dan niet waar je begint', () => {
  const klachten = keur([UITGANG, { x: 2, y: 1, eig: { wezen: 'held' } }, { x: 3, y: 1, eig: { wezen: 'held' } }]);
  assert.match(teksten(klachten), /2 objecten met wezen="held"/);
});

test('een dorpeling in een boom komt daar niet meer vandaan', () => {
  // Een boom uit bomen.tsx, als tweede vel achter grond.tsx, en een dorpeling op dezelfde tegel.
  const grondAantal = T.TEGELS.grond.tiles.length;
  const eik = T.TEGELS.bomen.tiles.findIndex((t) => t && t.naam === 'eik');
  const kaart = kaartje([UITGANG, { naam: 'eik', x: 3, y: 2, gid: 1 + grondAantal + eik }, { x: 3, y: 2, eig: { zaad: 3 } }]);
  kaart.tilesets.push({ firstgid: 1 + grondAantal, source: '../tegels/bomen.tsx' });
  const klachten = T.keurKaart('proefje', kaart).klachten;
  assert.match(teksten(klachten), /staat op een vaste tegel/);
});

test('de dekking zegt wat het spel vraagt en nergens staat', () => {
  const klachten = T.keurDekking();
  const tekst = teksten(klachten);
  // De koude oven is geschreven maar nog niet in Tiled neergezet (22 sep 2026). Zodra dat wel zo
  // is, horen deze regels vanzelf te verdwijnen — en dan zegt deze toets dat ze er niet meer zijn.
  for (const wie of Object.keys(T.GESPREKKEN)) {
    const staat = Object.values(T.GEBIEDEN).some((g) => g.maak().wezens.some((e) => e.soort === wie));
    assert.equal(!tekst.includes(`"${wie}" heeft een gesprek`), staat, `${wie}: de dekking en de wereld zijn het oneens`);
  }
});

test('de dekking merkt op dat een quest een voorwerp vraagt dat nergens vandaan komt', () => {
  const klachten = T.keurDekking();
  // "leem" komt uit de leemkuil, en die ligt nog nergens; de kuil hoort dus genoemd te worden.
  assert.match(teksten(klachten), /zodra je "leem" hebt, maar dat is nergens te krijgen/);
});

test('een wereld met de leem erin haalt die klacht weg', () => {
  const leem = { soort: 'leem', x: 2, y: 2, grendel: { quest: 'bakker', fase: ['zoeken'] } };
  const werelden = {
    proefje: {
      wezens: [{ soort: 'bakker' }, { soort: 'marskramer' }, { soort: 'smidsvrouw' }],
      voorwerpen: [{ soort: 'oven', x: 4, y: 2, raak: 'oven' }],
      questVoorwerpen: [leem],
    },
  };
  const tekst = teksten(T.keurDekking({ werelden }));
  assert.doesNotMatch(tekst, /nergens te krijgen/);
  assert.doesNotMatch(tekst, /raakpunt "oven"/);
  for (const wie of ['bakker', 'marskramer', 'smidsvrouw']) assert.doesNotMatch(tekst, new RegExp(`"${wie}" heeft een gesprek`));
  // wim en de meester staan in dit proefwereldje niet, en dat hoort de dekking dan ook te zeggen.
  assert.match(tekst, /"wim" heeft een gesprek/);
});

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
