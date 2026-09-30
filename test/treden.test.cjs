// De eerste trede (js/treden.js; werklijst vraag 51 en 53, Marcel, 28 en 29 sep): het gehucht wordt een dorp bij
// genoeg mensen, met een kapel en een smidse die klaar zijn. Het doel staat linksboven, en daarna blijft het een
// dorp, met het bouwmenu van het dorp erbij.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/opslaan.test.cjs).
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

// Een gebouw erbij, klaar of in aanbouw, zonder te bouwen (de toets gaat over de trede, niet over bouwen).
const zet = (S, soort, klaar = true) => S.dorp.gebouwen.push({ soort, x: 0, y: 0, klaar, klaarOp: klaar ? 0 : 99, handen: 0, voorwerp: null });

test('het doel bij het begin: nog te weinig mensen, geen kapel en geen smidse', () => {
  const S = gehucht();
  const doel = T.tredeDoel(S.dorp);
  assert.equal(doel.kop, 'Naar een dorp');
  assert.equal(doel.klaar, false);
  assert.equal(doel.tekst, `${S.dorp.bevolking} van 50 mensen · nog geen kapel · nog geen smidse`);
});

test('het doel zegt wat klaar is en wat nog in aanbouw', () => {
  const S = gehucht();
  zet(S, 'kapel');
  zet(S, 'smidse', false);
  assert.equal(T.tredeDoel(S.dorp).tekst, `${S.dorp.bevolking} van 50 mensen · een kapel ✓ · de smidse in aanbouw`);
});

test('met genoeg mensen en een kapel en een smidse klaar wordt het een dorp, en dat blijft het', () => {
  const S = gehucht();
  const berichten = [];
  const echt = T.ui.bericht;
  T.ui.bericht = (t) => berichten.push(t);
  try {
    zet(S, 'kapel');
    S.dorp.bevolking = 50;
    T.tikTredeDag(S.dorp);
    assert.equal(S.dorp.trede, 'gehucht', 'zonder smidse nog niet');
    zet(S, 'smidse');
    T.tikTredeDag(S.dorp);
    assert.equal(S.dorp.trede, 'dorp');
    assert.ok(berichten.some((t) => /een dorp geworden/.test(t)), berichten.join(' | '));
    assert.equal(T.tredeDoel(S.dorp), null, 'daarna is er (voorlopig) geen trede meer te halen');
    // Wie wegtrekt, maakt het geen gehucht meer.
    S.dorp.bevolking = 30;
    T.tikTredeDag(S.dorp);
    assert.equal(S.dorp.trede, 'dorp');
  } finally {
    T.ui.bericht = echt;
  }
});

test('in een dorp staan de gebouwen van het gehucht nog in het bouwmenu, met die van het dorp erbij', () => {
  const gehuchtMenu = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu({ trede: 'gehucht' }, id));
  const dorpMenu = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu({ trede: 'dorp' }, id));
  assert.ok(gehuchtMenu.includes('kapel') && gehuchtMenu.includes('put') && gehuchtMenu.includes('erf'));
  assert.ok(!gehuchtMenu.includes('molen'), 'de molen hoort bij het dorp');
  for (const id of gehuchtMenu) assert.ok(dorpMenu.includes(id), `${id} staat in het dorp niet meer in het menu`);
  for (const id of ['timmerman', 'molen', 'bakkerij', 'wapenmaker', 'schuttershof']) assert.ok(dorpMenu.includes(id), id);
  assert.ok(!dorpMenu.includes('markt'), 'de markt hoort bij marktrecht');
});

test('het hoofdgeld in een dorp: alleen woorden, tenzij de werkbank het hoger zet', () => {
  const S = gehucht();
  S.dorp.heer = T.nieuweHeer();
  const was = T.TREDEN_INSTELLINGEN.hoofdgeldInDorp;
  try {
    const gehuchtEis = T.eisVanDeHeer(S.dorp).per.goud;
    S.dorp.trede = 'dorp';
    assert.equal(T.eisVanDeHeer(S.dorp).per.goud, gehuchtEis, 'op 1 vraagt hij in een dorp hetzelfde');
    T.TREDEN_INSTELLINGEN.hoofdgeldInDorp = 3;
    assert.ok(T.eisVanDeHeer(S.dorp).per.goud > gehuchtEis, 'hoger gezet, vraagt hij meer');
  } finally {
    T.TREDEN_INSTELLINGEN.hoofdgeldInDorp = was;
  }
});

test('op een kaart zonder plein is er geen trede te halen', () => {
  const D = { trede: 'gehucht', wereld: { tegels: [['vloer']], voorwerpen: [] }, gebouwen: [], bevolking: 80 }; // een los dorp
  assert.equal(T.tredeDoel(D), null);
  T.tikTredeDag(D);
  assert.equal(D.trede, 'gehucht');
});

test('de heer noemt het doel in zijn benoemingsbrief, met de getallen uit de werkbank', () => {
  assert.equal(T.tredeEisTekst('dorp'), 'een kapel, een smidse en vijftig zielen');
  const was = T.TREDEN_INSTELLINGEN.dorp.mensen;
  try {
    T.TREDEN_INSTELLINGEN.dorp.mensen = 45;
    assert.equal(T.tredeEisTekst('dorp'), 'een kapel, een smidse en 45 zielen');
  } finally {
    T.TREDEN_INSTELLINGEN.dorp.mensen = was;
  }
});

test('de trede in de werkbank, en bewaard met het spel', () => {
  const deel = T.WERKBANK.find((d) => d.blok === 'TREDEN_INSTELLINGEN');
  assert.ok(deel, 'de treden staan in de werkbank');
  assert.deepEqual(T.werkbankGetallen(deel).map((g) => g.pad).sort(), ['TREDEN_INSTELLINGEN.dorp.mensen', 'TREDEN_INSTELLINGEN.hoofdgeldInDorp']);
  const S = gehucht();
  S.dorp.trede = 'dorp';
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.equal(S2.dorp.trede, 'dorp');
});

test('minstens een trede: het gehucht is geen dorp, een dorp is minstens een gehucht', () => {
  assert.equal(T.tredeMinstens({ trede: 'gehucht' }, 'dorp'), false);
  assert.equal(T.tredeMinstens({ trede: 'dorp' }, 'dorp'), true);
  assert.equal(T.tredeMinstens({ trede: 'dorp' }, 'gehucht'), true);
  assert.equal(T.tredeMinstens({}, 'dorp'), false, 'een proefkaart heeft geen trede');
});

test('de naam van je dorp (vraag 60): wat je typt, zonder spaties eromheen en niet te lang, in het doel en bewaard', () => {
  const S = gehucht();
  assert.equal(T.dorpsnaam(S.dorp), null, 'zonder naam');
  assert.ok(T.DORPSNAMEN.includes(T.voorgesteldeDorpsnaam(12345)));
  assert.equal(T.voorgesteldeDorpsnaam(3), T.voorgesteldeDorpsnaam(3), 'hetzelfde zaad, hetzelfde voorstel');
  assert.equal(T.zetDorpsnaam(S.dorp, '   Groot   Heikant  '), 'Groot Heikant');
  assert.equal(T.tredeDoel(S.dorp).kop, 'Groot Heikant · naar een dorp');
  assert.equal(T.zetDorpsnaam(S.dorp, 'x'.repeat(40)).length, 24);
  assert.equal(T.zetDorpsnaam(S.dorp, '   '), null, 'leeg is geen naam');
  assert.equal(T.tredeDoel(S.dorp).kop, 'Naar een dorp');
  T.zetDorpsnaam(S.dorp, 'Beekveld');
  const S2 = gehucht();
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  assert.equal(JSON.parse(tekst).kop.naam, 'Beekveld', 'de lijst in het menu ziet de naam zonder het spel te lezen');
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  assert.equal(T.dorpsnaam(S2.dorp), 'Beekveld');
});
