// De treden (js/treden.js; werklijst vraag 51 en 53, Marcel, 28 en 29 sep; sinds 2 okt uit de standen, vraag 90): het
// gehucht wordt een dorp bij 20 dorpelingen, en het dorp krijgt marktrecht bij 20 ambachtslieden. De oude eis van de proef
// (50 mensen, met een kapel en een smidse die klaar zijn) was tot 11 okt een spelregel "Treden" (snoeironde, vraag 153); de
// toetsen zetten haar nog wel in de getallen, want het eisformaat kan het. Het doel staat linksboven, en daarna blijft
// het zo, met het bouwmenu van de trede erbij.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

// Het proefdorp (test/grond.cjs): het huis van de schout, twee boerderijen en hutten, zoals een nieuw spel na een dag
// bouwen is; het dorp heeft de trede "gehucht". Stil, en met de velden die een toets van S verwacht.
function gehucht() {
  const S = proefDorp(T).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  return S;
}

// Elke toets begint en eindigt op de standaard van de spelregels.
test.afterEach(() => {
  T.optiesTerug();
});

// Een gebouw erbij, klaar of in aanbouw, zonder te bouwen (de toets gaat over de trede, niet over bouwen).
const zet = (S, soort, klaar = true) => {
  const g = { soort, x: 0, y: 0, klaar, klaarOp: klaar ? 0 : 99, handen: 0, voorwerp: null };
  S.dorp.gebouwen.push(g);
  return g;
};

// Een huis van deze soort met zoveel bewoners erin, zonder te bouwen of een gezin te laten komen: wie er woont, telt
// voor de stand van het huis (T.mensenVanStand, js/treden.js).
function bewoond(S, soort, n) {
  const g = zet(S, soort);
  for (let i = 0; i < n; i++) S.dorp.bewoners.mensen.push({ naam: `${soort} ${i}`, huis: g });
  return g;
}

// De berichten die het dorp zegt terwijl `fn` loopt.
function berichtenVan(fn) {
  const berichten = [];
  const echt = T.ui.bericht;
  T.ui.bericht = (t) => berichten.push(t);
  try {
    fn();
  } finally {
    T.ui.bericht = echt;
  }
  return berichten;
}

test('het doel bij het begin: hoeveel dorpelingen er zijn, van de twintig', () => {
  const S = gehucht();
  const doel = T.tredeDoel(S.dorp);
  assert.equal(doel.kop, 'Towards a village');
  assert.equal(doel.klaar, false);
  const n = T.mensenVanStand(S.dorp, 'dorpelingen');
  // Het proefdorp heeft alleen hutten en boerderijen (en het huis van de schout): niemand woont in een huis, dus nog geen dorpeling.
  assert.equal(n, 0, 'het dorp begint met niemand in een huis');
  assert.equal(doel.tekst, `${n} of 20 villagers`);
  assert.equal(T.tredeMensenNodig(S.dorp), 20 - n);
});

test('wie telt als dorpeling: wie in een huis woont, of in een stenen huis; een hut, een boerderij en de schout niet', () => {
  const S = gehucht();
  const n = T.mensenVanStand(S.dorp, 'dorpelingen');
  const boeren = T.mensenVanStand(S.dorp, 'boeren'); // geloot per spel
  bewoond(S, 'hut', 3);
  bewoond(S, 'boerderij', 4);
  assert.equal(T.mensenVanStand(S.dorp, 'dorpelingen'), n, 'een hut en een boerderij tellen niet');
  bewoond(S, 'huis', 5);
  assert.equal(T.mensenVanStand(S.dorp, 'dorpelingen'), n + 5);
  // Een huis dat versteent, blijft meetellen: anders wordt een gehucht waar de huizen te vroeg versteenden, nooit een dorp.
  bewoond(S, 'stenenHuis', 8);
  assert.equal(T.mensenVanStand(S.dorp, 'dorpelingen'), n + 13);
  assert.equal(T.mensenVanStand(S.dorp, 'ambachtslieden'), 8);
  assert.equal(T.mensenVanStand(S.dorp, 'boeren'), boeren + 4, 'de boeren tellen voor zichzelf');
});

test('bij 20 dorpelingen wordt het een dorp, en dat blijft het; dan is marktrecht het doel', () => {
  const S = gehucht();
  const n = T.mensenVanStand(S.dorp, 'dorpelingen');
  const berichten = berichtenVan(() => {
    bewoond(S, 'huis', 19 - n);
    T.tikTredeDag(S.dorp);
    assert.equal(S.dorp.trede, 'gehucht', 'bij 19 nog niet');
    assert.equal(T.tredeDoel(S.dorp).tekst, '19 of 20 villagers');
    bewoond(S, 'huis', 1);
    assert.equal(T.tredeDoel(S.dorp).tekst, '20 villagers ✓');
    T.tikTredeDag(S.dorp);
  });
  assert.equal(S.dorp.trede, 'dorp');
  assert.ok(berichten.some((t) => /has become a village/.test(t)), berichten.join(' | '));
  const doel = T.tredeDoel(S.dorp);
  assert.equal(doel.kop, 'Towards a market town');
  assert.equal(doel.trede, 'marktrecht');
  assert.equal(doel.tekst, '0 of 20 craftsmen');
  // Wie wegtrekt, maakt het geen gehucht meer.
  S.dorp.bewoners.mensen = S.dorp.bewoners.mensen.filter((p) => !p.huis || p.huis.soort !== 'huis');
  T.tikTredeDag(S.dorp);
  assert.equal(S.dorp.trede, 'dorp');
});

test('bij 20 ambachtslieden krijgt het dorp marktrecht; daarna is er (voorlopig) geen trede meer te halen', () => {
  const S = gehucht();
  S.dorp.trede = 'dorp';
  bewoond(S, 'stenenHuis', 8);
  bewoond(S, 'stenenHuis', 8);
  T.tikTredeDag(S.dorp);
  assert.equal(S.dorp.trede, 'dorp', 'bij 16 nog niet');
  assert.equal(T.tredeDoel(S.dorp).tekst, '16 of 20 craftsmen');
  const berichten = berichtenVan(() => {
    bewoond(S, 'stenenHuis', 4);
    T.tikTredeDag(S.dorp);
  });
  assert.equal(S.dorp.trede, 'marktrecht');
  assert.ok(berichten.some((t) => /has become a market town/.test(t)), berichten.join(' | '));
  assert.equal(T.tredeDoel(S.dorp), null);
  assert.equal(T.tredeMensenNodig(S.dorp), 0);
  assert.equal(T.volgendeTrede(S.dorp), null, 'de stad heeft nog geen eis');
});

test('een trede per dag, in volgorde: wie al genoeg ambachtslieden heeft, wordt eerst een dorp', () => {
  const S = gehucht();
  bewoond(S, 'stenenHuis', 8);
  bewoond(S, 'stenenHuis', 8);
  bewoond(S, 'stenenHuis', 8);
  T.tikTredeDag(S.dorp);
  assert.equal(S.dorp.trede, 'dorp', 'de ambachtslieden tellen ook als dorpelingen');
  T.tikTredeDag(S.dorp);
  assert.equal(S.dorp.trede, 'marktrecht');
});

test('de eis van de proef van 28 sep, in de getallen gezet: 50 mensen, met een kapel en een smidse klaar', () => {
  T.TREDEN_INSTELLINGEN.dorp = { mensen: 50, gebouwen: ['kapel', 'smidse'] };
  const S = gehucht();
  assert.equal(T.tredeDoel(S.dorp).tekst, `${S.dorp.bevolking} of 50 people · no chapel yet · no smithy yet`);
  zet(S, 'kapel');
  zet(S, 'smidse', false);
  assert.equal(T.tredeDoel(S.dorp).tekst, `${S.dorp.bevolking} of 50 people · a chapel ✓ · the smithy is being built`);
  S.dorp.gebouwen.pop();
  const berichten = berichtenVan(() => {
    S.dorp.bevolking = 50;
    T.tikTredeDag(S.dorp);
    assert.equal(S.dorp.trede, 'gehucht', 'zonder smidse nog niet');
    zet(S, 'smidse');
    T.tikTredeDag(S.dorp);
  });
  assert.equal(S.dorp.trede, 'dorp');
  assert.ok(berichten.some((t) => /has become a village/.test(t)), berichten.join(' | '));
  assert.equal(T.tredeDoel(S.dorp).kop, 'Towards a market town', 'marktrecht blijft bij de ambachtslieden');
  // Terug op de standaard telt het dorp weer zijn dorpelingen.
  T.optiesTerug();
  assert.deepEqual(T.TREDEN_INSTELLINGEN.dorp, { stand: 'dorpelingen', mensen: 20, gebouwen: [] });
});

test('in een dorp staan de gebouwen van het gehucht nog in het bouwmenu, met die van het dorp erbij; marktrecht net zo', () => {
  const gehuchtMenu = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu({ trede: 'gehucht' }, id));
  const dorpMenu = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu({ trede: 'dorp' }, id));
  assert.ok(gehuchtMenu.includes('kapel') && gehuchtMenu.includes('put') && gehuchtMenu.includes('hut'));
  assert.ok(!gehuchtMenu.includes('molen'), 'de molen hoort bij het dorp');
  for (const id of gehuchtMenu) assert.ok(dorpMenu.includes(id), `${id} staat in het dorp niet meer in het menu`);
  for (const id of ['zagerij', 'molen', 'bakkerij', 'wapenmaker']) assert.ok(dorpMenu.includes(id), id);
  // De markt en de weverij komen al in een dorp (vraag 90, B): wat de ambachtslieden willen, een trede eerder.
  for (const id of ['markt', 'weverij']) assert.ok(dorpMenu.includes(id), id);
  const marktrechtMenu = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu({ trede: 'marktrecht' }, id));
  for (const id of dorpMenu) assert.ok(marktrechtMenu.includes(id), `${id} staat met marktrecht niet meer in het menu`);
  for (const id of ['badhuis', 'gasthuis', 'steenbakkerij', 'pakhuis']) {
    assert.ok(!dorpMenu.includes(id) && marktrechtMenu.includes(id), `${id} komt met marktrecht`);
  }
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
  assert.equal(T.tredeEisTekst('dorp'), 'twenty souls in houses, not in huts');
  T.zetGetal('TREDEN_INSTELLINGEN.dorp.mensen', 45);
  assert.equal(T.tredeEisTekst('dorp'), '45 souls in houses, not in huts');
  T.optiesTerug();
  T.TREDEN_INSTELLINGEN.dorp = { mensen: 50, gebouwen: ['kapel', 'smidse'] };
  assert.equal(T.tredeEisTekst('dorp'), 'a chapel, a smithy and fifty souls');
});

test('de treden in de werkbank, en bewaard met het spel', () => {
  const deel = T.WERKBANK.find((d) => d.blok === 'TREDEN_INSTELLINGEN');
  assert.ok(deel, 'de treden staan in de werkbank');
  assert.deepEqual(T.werkbankGetallen(deel).map((g) => g.pad).sort(), ['TREDEN_INSTELLINGEN.dorp.mensen', 'TREDEN_INSTELLINGEN.hoofdgeldInDorp', 'TREDEN_INSTELLINGEN.marktrecht.mensen']);
  const S = gehucht();
  S.dorp.trede = 'marktrecht';
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.equal(S2.dorp.trede, 'marktrecht');
});

test('minstens een trede: het gehucht is geen dorp, een dorp is minstens een gehucht, en marktrecht minstens een dorp', () => {
  assert.equal(T.tredeMinstens({ trede: 'gehucht' }, 'dorp'), false);
  assert.equal(T.tredeMinstens({ trede: 'dorp' }, 'dorp'), true);
  assert.equal(T.tredeMinstens({ trede: 'dorp' }, 'gehucht'), true);
  assert.equal(T.tredeMinstens({ trede: 'dorp' }, 'marktrecht'), false);
  assert.equal(T.tredeMinstens({ trede: 'marktrecht' }, 'dorp'), true);
  assert.equal(T.tredeMinstens({}, 'dorp'), false, 'een proefkaart heeft geen trede');
  assert.equal(T.tredeNaam({ trede: 'marktrecht' }), 'the market town', 'zo heet het bouwmenu');
  assert.equal(T.tredeNaam({}), 'the hamlet');
});

test('de naam van je dorp (vraag 60): wat je typt, zonder spaties eromheen en niet te lang, in het doel en bewaard', () => {
  const S = gehucht();
  assert.equal(T.dorpsnaam(S.dorp), null, 'zonder naam');
  assert.ok(T.DORPSNAMEN.includes(T.voorgesteldeDorpsnaam(12345)));
  assert.equal(T.voorgesteldeDorpsnaam(3), T.voorgesteldeDorpsnaam(3), 'hetzelfde zaad, hetzelfde voorstel');
  assert.equal(T.zetDorpsnaam(S.dorp, '   Groot   Heathside  '), 'Groot Heathside');
  assert.equal(T.tredeDoel(S.dorp).kop, 'Groot Heathside · towards a village');
  assert.equal(T.zetDorpsnaam(S.dorp, 'x'.repeat(40)).length, 24);
  assert.equal(T.zetDorpsnaam(S.dorp, '   '), null, 'leeg is geen naam');
  assert.equal(T.tredeDoel(S.dorp).kop, 'Towards a village');
  T.zetDorpsnaam(S.dorp, 'Beekveld');
  const S2 = gehucht();
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  assert.equal(JSON.parse(tekst).kop.naam, 'Beekveld', 'de lijst in het menu ziet de naam zonder het spel te lezen');
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  assert.equal(T.dorpsnaam(S2.dorp), 'Beekveld');
});
