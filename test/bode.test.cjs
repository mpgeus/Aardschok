// De bode naar de marskramer (js/bode.js; werklijst vraag 143; Marcel, 9 okt: "soort van brief sturen met een bode", en
// "1. Alleen bij een status 2. Ja vind ik goed idee. 3. Ja, je vraagt om goederen, enkele keer heeft hij iets niet. 4. Ja
// voor nu maar mee beginnen; in de winterperiode of in het donker misschien ook bescherming mee?").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });
const B = T.BODE_INSTELLINGEN;

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

// Het ontworpen gehucht, met de kalender op `dag`, stil.
function gehucht(dag) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  S.kalender.dag = dag;
  T.zetVoorraad(S.dorp, 'goud', 50);
  return S;
}

test('zonder moeilijke tijd stuur je geen bode; met honger wel', () => {
  const S = gehucht(dagVan('zomermaand', 5));
  const D = S.dorp;
  const zonder = T.kanBodeSturen(D);
  assert.equal(zonder.kan, false);
  assert.equal(zonder.zichtbaar, false, 'de knop staat er niet');
  T.zetWet(D, 'rantsoen', 'krap'); // honger
  const met = T.kanBodeSturen(D);
  assert.ok(met.kan, met.reden);
  assert.equal(met.status.id, 'honger');
  assert.equal(met.dagen, B.dagen.gewoon);
});

test('de bode brengt de brief, en de marskramer komt met wat je vroeg, duurder dan anders', () => {
  const nietBijZich = B.nietBijZich;
  const halfBijZich = B.halfBijZich;
  B.nietBijZich = 0;
  B.halfBijZich = 0;
  try {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    assert.equal(T.stuurBode(D, {}).kan, false, 'een lege brief stuur je niet');
    const goud = D.voorraad.goud;
    const r = T.stuurBode(D, { graan: 3, zout: 0 });
    assert.ok(r.kan, r.reden);
    assert.ok(Math.abs(D.voorraad.goud - (goud - B.loon)) < 1e-9, 'de bode krijgt zijn loon uit de kas');
    assert.equal(r.bode.weg.waarom, 'bode', 'hij is de weg op');
    assert.equal(T.kanBodeSturen(D).kan, false, 'één bode tegelijk');
    T.tikBodeDag(D, dag + 1);
    assert.ok(!D.marskramer, 'nog onderweg');
    T.tikBodeDag(D, r.komt);
    const m = D.marskramer;
    assert.ok(m && m.bestelling, 'de marskramer is er, op bestelling');
    assert.deepEqual(T.verkooptNu(D), ['graan']);
    assert.equal(m.heeft.graan, 3);
    assert.equal(m.bestelling.graan.prijs, Math.ceil(B.waren.graan.prijs * B.prijsMaal.gewoon));
    assert.equal(r.bode.weg, undefined, 'de bode is terug');
    const graan = D.voorraad.graan;
    const k = T.koop(D, 'graan', 2);
    assert.ok(k.kan, k.reden);
    assert.equal(D.voorraad.graan, graan + 2 * B.waren.graan.per);
    assert.equal(T.prijsVanHetJaar(D, 'graan', 'verkoopt'), 'duur');
  } finally {
    B.nietBijZich = nietBijZich;
    B.halfBijZich = halfBijZich;
  }
});

test('soms heeft hij iets niet, of maar de helft', () => {
  const nietBijZich = B.nietBijZich;
  B.nietBijZich = 1;
  try {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const r = T.stuurBode(D, { graan: 2, ijzer: 4 });
    T.tikBodeDag(D, r.komt);
    assert.deepEqual(T.verkooptNu(D), [], 'hij had niets van wat je vroeg');
  } finally {
    B.nietBijZich = nietBijZich;
  }
});

test('in de winter duurt het langer en kost het meer; zonder begeleider haalt de bode het soms niet', () => {
  const kwijt = B.winterKwijt;
  B.winterKwijt = 1;
  try {
    const dag = dagVan('louwmaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.zetWet(D, 'rantsoen', 'krap');
    const k = T.kanBodeSturen(D);
    assert.ok(k.winter);
    assert.equal(k.dagen, B.dagen.winter);
    const r = T.stuurBode(D, { graan: 2 });
    assert.ok(r.kan, r.reden);
    assert.equal(r.begeleider, null);
    T.tikBodeDag(D, r.komt);
    assert.ok(!D.marskramer, 'zonder marskramer terug');
    assert.equal(D.bode, null);
    assert.equal(r.bode.weg, undefined, 'de bode is wel terug');
    // Met een begeleider komt hij er wel, en die is ook weg zolang.
    const r2 = T.stuurBode(D, { graan: 2 }, true);
    assert.ok(r2.kan, r2.reden);
    assert.ok(r2.begeleider && r2.begeleider.weg, 'een weerbare man gaat mee');
    T.tikBodeDag(D, r2.komt);
    assert.ok(D.marskramer && D.marskramer.bestelling);
    assert.equal(D.marskramer.bestelling.graan.prijs, Math.ceil(B.waren.graan.prijs * B.prijsMaal.winter));
  } finally {
    B.winterKwijt = kwijt;
  }
});

test('met de spelregel "De bode" op Nee kan het niet', () => {
  T.zetOptie('bode', 'uit');
  try {
    const S = gehucht(dagVan('zomermaand', 5));
    T.zetWet(S.dorp, 'rantsoen', 'krap');
    assert.equal(T.kanBodeSturen(S.dorp).kan, false);
  } finally {
    T.optiesTerug();
    T.zetOptie('wieBouwt', 'jij');
  }
});

test('valt de vaste ronde op een dag dat hij op bestelling er nog is, dan komt die ronde na hem (Marcel: "optie 1")', () => {
  const nietBijZich = B.nietBijZich;
  B.nietBijZich = 0;
  try {
    const begin = dagVan('hooimaand', 3);
    const S = gehucht(begin);
    const D = S.dorp;
    T.marskramerOpBestelling(D, { graan: 2 }, begin, false);
    assert.ok(D.marskramer.bestelling);
    let dag = begin + 1;
    for (; D.marskramer && D.marskramer.bestelling; dag++) T.tikHandelDag(D, dag);
    const m = D.marskramer;
    assert.ok(m && !m.bestelling, 'zijn vaste ronde is er, op de dag dat de bestelde ging');
    assert.equal(m.bezoek, 1, 'de ronde van de zomer');
    assert.ok(dag - 1 > dagVan('hooimaand', 5), 'later dan anders');
    assert.equal(D.marskramerDaarna, undefined);
  } finally {
    B.nietBijZich = nietBijZich;
  }
});
