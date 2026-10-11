// Het lege begin (js/begin.js; werklijst vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan
// bouwen"): met de spelregel "Het begin" op "Leeg" legt de maker op het eiland geen gehucht, maar alleen het land met een
// open plek; een kar rijdt het land in, met de schout, zijn gezin en vier gezinnen, en op het plein zetten ze hun kamp op.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Wat er tegen het scherm gezegd wordt: een bericht, en welke brieven er kwamen.
const gezegd = [];
const brieven = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : naam === 'toonBrief' ? brieven.push(args[1]) : undefined) });

// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil en met een vaste reeks toeval (zoals js/main.js het
// begint, zonder scherm).
function leegBegin(zaad = 3) {
  const echt = console.warn;
  const toeval = Math.random;
  const maker = { ...T.MAKER_INSTELLINGEN };
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  Object.assign(T.MAKER_INSTELLINGEN, { eigenGehucht: true, opEiland: true, leeg: true });
  const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
  return { S, D: S.dorp, w: S.dorp.wereld };
}

// Dagen zoals het spel ze tikt (js/gebouwen.js).
function dagen(S, van, tot, elkeDag) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    T.tikGebouwenDag(S.dorp, dag);
    if (elkeDag) elkeDag(dag);
  }
}

test('het lege land: geen huizen, geen boeren, geen akkers; wel het plein, de plek van de marskramer en de uitgang', () => {
  const { D, w } = leegBegin();
  assert.deepEqual([...new Set(D.gebouwen.map((g) => g.soort))], ['tent'], 'er staan alleen de tenten van het kamp');
  assert.equal(w.akkers ? w.akkers.length : 0, 0);
  assert.ok(!w.wezens.some((e) => e.wie), 'er is nog geen boer of herbergierster');
  assert.ok(w.marskramer, 'de marskramer heeft zijn plek');
  assert.ok(T.wegInEnUit(w), 'de weg komt het land in');
  assert.ok(T.pleinTegels(w).length > 100, 'er is een plein');
  assert.ok(w.kamp && w.kamp.plekken.length >= 1 + T.BEGIN_INSTELLINGEN.gezinnen, 'de maker koos een plek voor het kamp');
});

test('het kamp: een tent per gezin, die van de schout is zijn huis, en er is geen plaats voor een nieuw gezin', () => {
  const { D } = leegBegin();
  const tenten = D.gebouwen.filter((g) => g.soort === 'tent');
  assert.equal(tenten.length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(tenten.filter((g) => g.huis === 'schout').length, 1);
  for (const g of tenten) assert.ok(D.bewoners.mensen.some((p) => p.huis === g), 'in elke tent woont een gezin');
  const gezinnen = new Set(D.bewoners.mensen.map((p) => p.gezin));
  assert.equal(gezinnen.size, tenten.length, 'een gezin per tent');
  assert.equal(D.bevolking, D.bewoners.mensen.length, 'het getal is wie er is');
  assert.ok(D.bevolking >= 20 && D.bevolking <= 26, `de schout, zijn gezin en vier gezinnen: ${D.bevolking}`);
  assert.equal(T.telWoonruimte(D), D.bevolking, 'een tent is zo groot als zijn gezin');
  assert.ok(!T.plaatsVoorEenGezin(D), 'een nieuw gezin vindt er geen plaats');
});

test('de voorraad is wat de kar meebrengt', () => {
  const { D } = leegBegin();
  const K = T.BEGIN_INSTELLINGEN.kar;
  assert.equal(D.voorraad.hout, K.hout);
  assert.equal(D.voorraad.graan, K.graan + K.zaaigraan);
  assert.equal(D.voorraad.goud, K.goud);
  assert.equal(D.voorraad.gereedschap, K.gereedschap);
});

test('de aankomst: de kar begint aan de rand op de weg, met de schout ernaast, en de gezinnen komen erachter', () => {
  const { D, w } = leegBegin();
  const B = D.begin;
  assert.equal(B.kamp, 'onderweg');
  assert.ok(w.wezens.includes(B.kar) && B.kar.kar, 'de kar is een wezen op de kaart');
  assert.deepEqual([B.kar.tx, B.kar.ty], [B.van.x, B.van.y], 'hij begint waar de weg het land in komt');
  assert.ok(B.kar.pad.length > 0, 'en hij heeft een weg naar het plein');
  assert.ok(T.afstand({ x: D.schout.tx, y: D.schout.ty }, B.van) <= 2, 'de schout staat bij de kar');
  assert.ok(D.bewoners.mensen.filter((p) => !p.schout).every((p) => p.komt && !p.wezen), 'de gezinnen komen nog');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 0, 'de tenten staan nog niet');
});

test('staat het kamp er in de nacht nog niet (geen beelden, of de kar zat vast), dan staat het daarna', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  assert.equal(D.begin.kamp, 'op');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'kampvuur').length, 1);
  assert.deepEqual([D.begin.kar.tx, D.begin.kar.ty], [w.kamp.kar.x, w.kamp.kar.y], 'de kar staat op zijn plek');
  for (const g of D.gebouwen) assert.ok(g.voorwerp && w.voorwerpen.includes(g.voorwerp), 'elke tent staat op de kaart');
  assert.ok(!T.magOpzij(S, D.begin.kar), 'wie de kar op zijn weg vindt, laat hem niet opzij gaan');
  assert.ok(D.bewoners.komen.length || D.bewoners.mensen.every((p) => p.schout || p.wezen), 'de gezinnen zijn onderweg');
});

test('een jaar vanaf een lege plek, zonder iets te doen: geen fout, en de heer vraagt niets', () => {
  const { S, D } = leegBegin();
  let gril = false;
  brieven.length = 0;
  dagen(S, 1, T.DAGEN_PER_JAAR - 1, () => {
    if (D.grillen && D.grillen.vraag) gril = true;
    assert.ok(!(D.heer && (D.heer.brief || D.heer.bezoek)), 'geen schatting en geen bezoek op Sint-Maarten');
  });
  assert.ok(!gril, 'geen grillen het eerste jaar');
  assert.deepEqual(brieven, ['gespaard'], 'in wijnmaand schrijft hij alleen dat hij je spaart');
  // zonder te bouwen haalt het dorp de winter niet: dat is hoe het nu is (bouwen is stap 1d)
  assert.ok(D.bevolking < 24);
});

test('het tweede jaar vraagt hij wel', () => {
  const { S, D } = leegBegin();
  assert.ok(T.heerLaatMetRust(D, 0));
  assert.ok(!T.heerLaatMetRust(D, T.DAGEN_PER_JAAR));
});

test('bewaren en laden: het kamp en de kar blijven aan elkaar vast', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 2);
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  const D2 = S2.dorp;
  assert.ok(D2.wereld.wezens.includes(D2.begin.kar), 'de kar van het begin is de kar op de kaart');
  assert.ok(D2.gebouwen.every((g) => D2.wereld.voorwerpen.includes(g.voorwerp)), 'en elke tent zijn tekening');
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
});

test('alleen op het eiland: zonder eiland legt de maker het gehucht dat er al was', () => {
  const maker = { ...T.MAKER_INSTELLINGEN };
  Object.assign(T.MAKER_INSTELLINGEN, { opEiland: false, leeg: true });
  try {
    const w = T.laadGemaaktGehucht(3);
    assert.ok(!w.kamp);
    assert.ok(w.gebouwenOpKaart.length > 5);
  } finally {
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
});
