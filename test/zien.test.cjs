// Het zichtveld en de getuigen, stuk 1 (js/zien.js, sinds 27 sep; werklijst punt 3, vraag 40): wie
// buiten is, ziet de schout als het licht het toelaat, en wie hem iets ziet wegzetten of terughalen, is
// getuige. Zie ontwerp/spel.md, "Een zichtveld voor iedereen".
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.ZIEN_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const HERFST = dagVan('wijnmaand', 10);
const WINTER = dagVan('louwmaand', 5);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht, met een vast zaad (zoals test/herberg.test.cjs), op een uur dat de toets kiest.
function gehucht(dag) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  const echtLot = T.lootBoeren;
  console.warn = () => {};
  T.BOEREN_INSTELLINGEN.loten = false;
  T.lootBoeren = (S2) => echtLot(S2, 1234);
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    T.lootBoeren = echtLot;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  S.kalender = { dag, snelheid: 1 };
  T.zetVoorraad(S, 'graan', 100);
  return S;
}
// Zet een wezen op een tegel, buiten.
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });
const mensen = (S) => S.bewoners.mensen;
// Een volwassene die niet in het huis van de schout woont, en een die er wel woont.
const vreemde = (S) => mensen(S).find((p) => p.leeftijd === 'volwassen' && !p.schout && p.huis !== huisVanSchout(S));
const huisgenoot = (S) => mensen(S).find((p) => !p.schout && p.huis === huisVanSchout(S));
const huisVanSchout = (S) => S.gebouwen.find((g) => g.huis === 'schout');
// Haal iedereen behalve `wie` naar binnen, zodat alleen hij kan kijken.
function alleen(S, ...wie) {
  for (const e of S.wereld.wezens) if (e !== S.schout && !wie.includes(e)) e.binnen = true;
}

// Op het plein, in de rij y = 38, staat niets tussen x = 32 en 45: geen boom, geen put.
const RIJ = 38;

test('hoe donker het is, van 0 tot 1: T.lichtVan(dag).nacht', () => {
  assert.equal(T.lichtVan(bijUur(HERFST, 12)).nacht, 0);
  assert.equal(T.lichtVan(bijUur(HERFST, 0)).nacht, 1);
  const zon = T.zonVan(HERFST);
  const schemer = T.lichtVan(bijUur(HERFST, zon.onder + T.DAG_INSTELLINGEN.schemerUren / 2)).nacht;
  assert.ok(schemer > 0.3 && schemer < 0.7, `in de schemering half (${schemer})`);
});

test('overdag zie je iemand op acht tegels, \'s nachts op twee, en in de schemering ertussen', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const plek = { x: 36, y: RIJ };
  assert.equal(T.zichtOp(S, plek), IN.dag);
  S.kalender.dag = bijUur(HERFST + 1, 2);
  assert.equal(T.zichtOp(S, plek), IN.nacht);
  const zon = T.zonVan(HERFST);
  S.kalender.dag = bijUur(HERFST, zon.onder + T.DAG_INSTELLINGEN.schemerUren / 2);
  const schemer = T.zichtOp(S, plek);
  assert.ok(schemer > IN.nacht && schemer < IN.dag, `in de schemering ertussen (${schemer})`);
});

test('\'s avonds branden de lantaarns; overdag en na bedtijd niet', () => {
  const S = gehucht(bijUur(WINTER, 19));
  assert.equal(T.dagdeelVan(S.kalender.dag), 'avond');
  const lantaarns = S.wereld.voorwerpen.filter((v) => v.soort === 'lantaarn');
  assert.ok(lantaarns.length >= 2, 'een op het plein, bij de put, en die van de herberg');
  const bronnen = T.lichtBronnen(S);
  for (const v of lantaarns) {
    const hier = bronnen.filter((b) => T.afstand(b, v) <= 1);
    assert.equal(hier.length, 1, `de lantaarn op ${v.x},${v.y} brandt, en één keer (die van de herberg is het licht van de herberg)`);
  }
  S.kalender.dag = bijUur(WINTER, 12);
  assert.equal(T.lichtBronnen(S).length, 0, 'overdag brandt er niets');
  S.kalender.dag = bijUur(WINTER + 1, 2);
  assert.ok(T.lichtBronnen(S).every((b) => b.ramenVan), 'na bedtijd alleen nog de herberg, als er iemand binnen zit');
});

test('in het licht van een lantaarn zie je iemand ook in het donker van verder', () => {
  const S = gehucht(bijUur(WINTER, 19));
  assert.equal(T.lichtVan(S.kalender.dag).nacht, 1, 'het is donker');
  assert.equal(T.zichtOp(S, { x: 36, y: RIJ }), IN.nacht, 'ver van elke lantaarn: twee tegels');
  assert.equal(T.zichtOp(S, { x: 35, y: 34 }), IN.bijLicht, 'naast de lantaarn bij de put: zes');
  // Zo ziet iemand vijf tegels verderop je bij de lantaarn wel, en in het donker niet.
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 35, 34);
  zet(p.wezen, 35, 39);
  assert.ok(T.getuigenVan(S, null).includes(p.wezen), 'bij de lantaarn gezien');
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 41, RIJ);
  assert.ok(!T.getuigenVan(S, null).includes(p.wezen), 'in het donker niet');
});

test('wie de schout ziet: dichtbij genoeg, buiten, en niets ertussen', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 36 + IN.dag, RIJ);
  assert.ok(T.getuigenVan(S, null).includes(p.wezen), 'op acht tegels, overdag');
  zet(p.wezen, 36 + IN.dag + 1, RIJ);
  assert.ok(!T.getuigenVan(S, null).includes(p.wezen), 'op negen niet');
  // Hemelsbreed: schuin op zes bij zes is verder dan acht.
  zet(p.wezen, 42, RIJ - 6);
  assert.ok(!T.getuigenVan(S, null).includes(p.wezen), 'een cirkel, geen vierkant');
  zet(p.wezen, 40, RIJ);
  p.wezen.binnen = true;
  assert.ok(!T.getuigenVan(S, null).includes(p.wezen), 'wie binnen is, ziet niets');
  // Een huis houdt de blik tegen: de schout voor zijn deur, de ander achter zijn huis.
  const huis = huisVanSchout(S);
  const deur = T.deurVan(S.wereld, huis);
  zet(S.schout, deur.x, deur.y);
  zet(p.wezen, huis.x + Math.floor(huis.voet.b / 2), huis.y - 1);
  assert.ok(Math.hypot(S.schout.tx - p.wezen.tx, S.schout.ty - p.wezen.ty) <= IN.dag, 'dichtbij genoeg');
  assert.ok(!T.getuigenVan(S, null).includes(p.wezen), 'maar het huis staat ertussen');
});

test('wie in het huis van de plek woont, is geen getuige: het is zijn kelder', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const huis = huisVanSchout(S);
  const eigen = huisgenoot(S);
  const ander = vreemde(S);
  assert.ok(eigen && ander, 'een huisgenoot en een vreemde');
  alleen(S, eigen.wezen, ander.wezen);
  zet(S.schout, 36, RIJ);
  zet(eigen.wezen, 38, RIJ);
  zet(ander.wezen, 40, RIJ);
  const wie = T.getuigenVan(S, huis);
  assert.ok(!wie.includes(eigen.wezen), 'de huisgenoot niet');
  assert.ok(wie.includes(ander.wezen), 'de vreemde wel');
  assert.ok(T.getuigenVan(S, null).includes(eigen.wezen), 'zonder plek ziet de huisgenoot je gewoon');
});

test('zet je iets weg terwijl iemand kijkt, dan is hij getuige: de plek onthoudt het, hij krijgt het oogje, en het bericht zegt wie', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const huis = huisVanSchout(S);
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 39, RIJ);
  assert.equal(T.kijkersTekst(S, huis), `${T.hoofdletter(T.naamVanBewoner(p))} ziet je.`);
  assert.ok(T.verstop(S, huis, 'graan', 10).kan);
  const z = T.werdGezien(S, huis, 'weg', 'graan', 10);
  assert.deepEqual(z.getuigen, [p.wezen]);
  assert.equal(z.bericht, `${T.hoofdletter(T.naamVanBewoner(p))} zag je 10 graan in je eigen kelder zetten.`);
  assert.equal(huis.getuigen.length, 1);
  assert.deepEqual({ ...huis.getuigen[0], bewoner: undefined }, { dag: Math.floor(S.kalender.dag), naam: T.naamVanBewoner(p), bewoner: undefined, handeling: 'weg', wat: 'graan', n: 10 });
  assert.equal(huis.getuigen[0].bewoner, p, 'wie het was, voor stuk 2');
  assert.ok(p.wezen.oogje > S.tijd, 'het oogje staat boven zijn hoofd');
  // Terughalen telt ook, en twee getuigen staan samen in het bericht.
  const q = mensen(S).find((x) => x !== p && x.leeftijd === 'volwassen' && !x.schout && x.huis !== huis);
  q.wezen.binnen = false;
  zet(q.wezen, 33, RIJ);
  assert.ok(T.haalTerug(S, huis, 'graan', 5).kan);
  const z2 = T.werdGezien(S, huis, 'terug', 'graan', 5);
  assert.equal(z2.getuigen.length, 2);
  assert.match(z2.bericht, / en .* zagen je 5 graan uit je eigen kelder halen\.$/);
  assert.equal(huis.getuigen.length, 3);
});

test('zag niemand het, dan zegt het bericht dat, en onthoudt de plek niets', () => {
  const S = gehucht(bijUur(HERFST + 1, 2));
  const huis = huisVanSchout(S);
  alleen(S);
  zet(S.schout, 36, RIJ);
  assert.equal(T.kijkersTekst(S, huis), 'Niemand ziet je.');
  const z = T.werdGezien(S, huis, 'weg', 'graan', 10);
  assert.deepEqual(z, { getuigen: [], bericht: 'Niemand zag het.' });
  assert.equal(huis.getuigen, undefined);
});

test('een dier of een monster is geen getuige', () => {
  const S = gehucht(bijUur(HERFST, 12));
  alleen(S);
  zet(S.schout, 36, RIJ);
  const koe = T.maakDier('koe', 38, RIJ, 1);
  S.wereld.wezens.push(koe);
  const wolf = T.maakWezen('wolf', 39, RIJ);
  S.wereld.wezens.push(wolf);
  const wie = T.getuigenVan(S, null);
  assert.ok(!wie.includes(koe), 'de koe niet');
  assert.ok(!wie.includes(wolf), 'de wolf niet (die ziet je op zijn eigen manier, T.zoekOntdekking)');
});
