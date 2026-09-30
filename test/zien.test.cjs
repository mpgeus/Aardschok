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
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    T.lootBoeren = echtLot;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  Object.assign(S.kalender, { dag, snelheid: 1 });
  T.zetVoorraad(S.dorp, 'graan', 100);
  return S;
}
// Zet een wezen op een tegel, buiten.
const zet = (e, x, y) => Object.assign(e, { x, y, tx: x, ty: y, pad: [], binnen: false });
const mensen = (S) => S.dorp.bewoners.mensen;
// Een volwassene die niet in het huis van de schout woont, en een die er wel woont.
const vreemde = (S) => mensen(S).find((p) => p.leeftijd === 'volwassen' && !p.schout && p.huis !== huisVanSchout(S));
const huisgenoot = (S) => mensen(S).find((p) => !p.schout && p.huis === huisVanSchout(S));
const huisVanSchout = (S) => S.dorp.gebouwen.find((g) => g.huis === 'schout');
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
  assert.equal(T.zichtOp(S.dorp, plek), IN.dag);
  S.kalender.dag = bijUur(HERFST + 1, 2);
  assert.equal(T.zichtOp(S.dorp, plek), IN.nacht);
  const zon = T.zonVan(HERFST);
  S.kalender.dag = bijUur(HERFST, zon.onder + T.DAG_INSTELLINGEN.schemerUren / 2);
  const schemer = T.zichtOp(S.dorp, plek);
  assert.ok(schemer > IN.nacht && schemer < IN.dag, `in de schemering ertussen (${schemer})`);
});

test('\'s avonds branden de lantaarns; overdag en na bedtijd niet', () => {
  const S = gehucht(bijUur(WINTER, 19));
  assert.equal(T.dagdeelVan(S.kalender.dag), 'avond');
  const lantaarns = S.wereld.voorwerpen.filter((v) => v.soort === 'lantaarn');
  assert.ok(lantaarns.length >= 2, 'een op het plein, bij de put, en die van de herberg');
  const bronnen = T.lichtBronnen(S.dorp);
  for (const v of lantaarns) {
    const hier = bronnen.filter((b) => T.afstand(b, v) <= 1);
    assert.equal(hier.length, 1, `de lantaarn op ${v.x},${v.y} brandt, en één keer (die van de herberg is het licht van de herberg)`);
  }
  S.kalender.dag = bijUur(WINTER, 12);
  assert.equal(T.lichtBronnen(S.dorp).length, 0, 'overdag brandt er niets');
  S.kalender.dag = bijUur(WINTER + 1, 2);
  assert.ok(T.lichtBronnen(S.dorp).every((b) => b.ramenVan), 'na bedtijd alleen nog de herberg, als er iemand binnen zit');
});

test('in het licht van een lantaarn zie je iemand ook in het donker van verder', () => {
  const S = gehucht(bijUur(WINTER, 19));
  assert.equal(T.lichtVan(S.kalender.dag).nacht, 1, 'het is donker');
  assert.equal(T.zichtOp(S.dorp, { x: 36, y: RIJ }), IN.nacht, 'ver van elke lantaarn: twee tegels');
  assert.equal(T.zichtOp(S.dorp, { x: 35, y: 34 }), IN.bijLicht, 'naast de lantaarn bij de put: zes');
  // Zo ziet iemand vijf tegels verderop je bij de lantaarn wel, en in het donker niet.
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 35, 34);
  zet(p.wezen, 35, 39);
  assert.ok(T.getuigenVan(S.dorp, null).includes(p.wezen), 'bij de lantaarn gezien');
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 41, RIJ);
  assert.ok(!T.getuigenVan(S.dorp, null).includes(p.wezen), 'in het donker niet');
});

test('wie de schout ziet: dichtbij genoeg, buiten, en niets ertussen', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 36 + IN.dag, RIJ);
  assert.ok(T.getuigenVan(S.dorp, null).includes(p.wezen), 'op acht tegels, overdag');
  zet(p.wezen, 36 + IN.dag + 1, RIJ);
  assert.ok(!T.getuigenVan(S.dorp, null).includes(p.wezen), 'op negen niet');
  // Hemelsbreed: schuin op zes bij zes is verder dan acht.
  zet(p.wezen, 42, RIJ - 6);
  assert.ok(!T.getuigenVan(S.dorp, null).includes(p.wezen), 'een cirkel, geen vierkant');
  zet(p.wezen, 40, RIJ);
  p.wezen.binnen = true;
  assert.ok(!T.getuigenVan(S.dorp, null).includes(p.wezen), 'wie binnen is, ziet niets');
  // Een huis houdt de blik tegen: de schout voor zijn deur, de ander achter zijn huis.
  const huis = huisVanSchout(S);
  const deur = T.deurVan(S.wereld, huis);
  zet(S.schout, deur.x, deur.y);
  zet(p.wezen, huis.x + Math.floor(huis.voet.b / 2), huis.y - 1);
  assert.ok(Math.hypot(S.schout.tx - p.wezen.tx, S.schout.ty - p.wezen.ty) <= IN.dag, 'dichtbij genoeg');
  assert.ok(!T.getuigenVan(S.dorp, null).includes(p.wezen), 'maar het huis staat ertussen');
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
  const wie = T.getuigenVan(S.dorp, huis);
  assert.ok(!wie.includes(eigen.wezen), 'de huisgenoot niet');
  assert.ok(wie.includes(ander.wezen), 'de vreemde wel');
  assert.ok(T.getuigenVan(S.dorp, null).includes(eigen.wezen), 'zonder plek ziet de huisgenoot je gewoon');
});

test('zet je iets weg terwijl iemand kijkt, dan is hij getuige: de plek onthoudt het, hij krijgt het oogje, en het bericht zegt wie', () => {
  const S = gehucht(bijUur(HERFST, 12));
  const huis = huisVanSchout(S);
  const p = vreemde(S);
  alleen(S, p.wezen);
  zet(S.schout, 36, RIJ);
  zet(p.wezen, 39, RIJ);
  assert.equal(T.kijkersTekst(S.dorp, huis), `${T.hoofdletter(T.naamVanBewoner(p))} ziet je.`);
  assert.ok(T.verstop(S.dorp, huis, 'graan', 10).kan);
  const z = T.werdGezien(S, S.dorp, huis, 'weg', 'graan', 10);
  assert.deepEqual(z.getuigen, [p.wezen]);
  assert.equal(z.bericht, `${T.hoofdletter(T.naamVanBewoner(p))} zag je 10 graan in je eigen kelder zetten.`);
  assert.equal(huis.getuigen.length, 1);
  assert.deepEqual({ ...huis.getuigen[0], bewoner: undefined }, { dag: Math.floor(S.kalender.dag), tijd: S.kalender.dag, naam: T.naamVanBewoner(p), bewoner: undefined, handeling: 'weg', wat: 'graan', n: 10 });
  assert.equal(huis.getuigen[0].bewoner, p, 'wie het was, voor stuk 2');
  assert.ok(p.wezen.oogje > S.tijd, 'het oogje staat boven zijn hoofd');
  // Terughalen telt ook, en twee getuigen staan samen in het bericht.
  const q = mensen(S).find((x) => x !== p && x.leeftijd === 'volwassen' && !x.schout && x.huis !== huis);
  q.wezen.binnen = false;
  zet(q.wezen, 33, RIJ);
  assert.ok(T.haalTerug(S.dorp, huis, 'graan', 5).kan);
  const z2 = T.werdGezien(S, S.dorp, huis, 'terug', 'graan', 5);
  assert.equal(z2.getuigen.length, 2);
  assert.match(z2.bericht, / en .* zagen je 5 graan uit je eigen kelder halen\.$/);
  assert.equal(huis.getuigen.length, 3);
});

test('zag niemand het, dan zegt het bericht dat, en onthoudt de plek niets', () => {
  const S = gehucht(bijUur(HERFST + 1, 2));
  const huis = huisVanSchout(S);
  alleen(S);
  zet(S.schout, 36, RIJ);
  assert.equal(T.kijkersTekst(S.dorp, huis), 'Niemand ziet je.');
  const z = T.werdGezien(S, S.dorp, huis, 'weg', 'graan', 10);
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
  const wie = T.getuigenVan(S.dorp, null);
  assert.ok(!wie.includes(koe), 'de koe niet');
  assert.ok(!wie.includes(wolf), 'de wolf niet (die ziet je op zijn eigen manier, T.zoekOntdekking)');
});

// ---------------------------------------------------------------------------------------------
// Stuk 2: wat een getuige doet, naar zijn karakter
// ---------------------------------------------------------------------------------------------

const V = T.VERSTOP_INSTELLINGEN;
const boer = (S, id) => mensen(S).find((p) => p.wie === id);
const kelderVan = (S, id) => S.dorp.gebouwen.find((g) => g.huis === id);
const zegt = (S) => T.gesprekKnoop(S, S.dorp, 'herbergierster', 'welkom').tekst;
// De eerste avond vanaf `van` dat p in de herberg zit.
function avondInDeHerberg(S, p, van) {
  let d = van;
  while (!T.herbergGasten(S.dorp, d).includes(p) && d < van + 90) d++;
  assert.ok(d < van + 90, `${T.naamVanBewoner(p)} gaat wel eens naar de herberg`);
  return d;
}
// Trijn (boer4) is de roddelaar, en ziet de schout 10 graan in de kelder van Klaas (boer1, de zanger)
// zetten, om twaalf uur 's middags op dag `dag`.
function trijnZietHet(dag) {
  const S = gehucht(bijUur(dag, 12));
  T.zetVoorraad(S.dorp, 'bier', 100);
  const trijn = boer(S, 'boer4');
  trijn.wezen.karakter = 'roddelaar';
  const kelder = kelderVan(S, 'boer1');
  alleen(S, trijn.wezen);
  zet(S.schout, 36, RIJ);
  zet(trijn.wezen, 39, RIJ);
  assert.ok(T.verstop(S.dorp, kelder, 'graan', 10).kan);
  const z = T.werdGezien(S, S.dorp, kelder, 'weg', 'graan', 10);
  assert.deepEqual(z.getuigen, [trijn.wezen]);
  return { S, trijn, kelder, z };
}

test('het bericht zegt het als je getuige het rondvertelt', () => {
  const { z } = trijnZietHet(HERFST);
  assert.match(z.bericht, /^Trijn zag je 10 graan in de kelder van .* zetten\. Trijn weet alles van iedereen, en vertelt het ook\.$/);
});

test('de roddelaar die je zag, vertelt het de eerstvolgende avond in de herberg: dan vinden de soldaten het er makkelijker, en de herbergierster vertelt het je', () => {
  const { S, trijn, kelder } = trijnZietHet(HERFST);
  const basis = V.plekken.boerderij.vinden;
  assert.equal(T.verstopPlekVan(S.dorp, kelder).vinden, basis, 'zolang ze het niet vertelde, is het een kelder als alle andere');
  const d = avondInDeHerberg(S, trijn, HERFST);
  T.tikHerbergDag(S.dorp, d + 1);
  assert.equal(kelder.verteld, d);
  assert.equal(kelder.verteldDoor, 'Trijn');
  const p = T.verstopPlekVan(S.dorp, kelder);
  assert.equal(p.vinden, basis * V.bewoners.roddelaar.vinden, 'nu weet het hele dorp het');
  assert.equal(p.verteldDoor, 'Trijn');
  assert.ok(T.heeftVlag(S.dorp, 'herbergGetuige'));
  assert.equal(zegt(S), `Aan de tap gisteravond: ${T.GESPREK_WOORDEN.gisteravond(S.dorp)}. En Trijn wist te vertellen dat de schout 10 graan in ${p.naam} zette. Ik zeg niet dat het waar is, schout. Ik zeg dat iedereen het nu weet.`);
  // Wat ze vertelde, vertelt ze niet nog eens.
  const e = avondInDeHerberg(S, trijn, d + 1);
  T.tikHerbergDag(S.dorp, e + 1);
  assert.ok(!T.heeftVlag(S.dorp, 'herbergGetuige'), 'niets nieuws te vertellen');
  // Haal je alles terug, dan is wat ze vertelde niet meer waar.
  T.haalTerug(S.dorp, kelder, 'graan', kelder.verstopt.graan);
  assert.equal(kelder.verteld, undefined);
  assert.equal(kelder.verteldDoor, undefined);
  assert.equal(T.verstopPlekVan(S.dorp, kelder).vinden, basis);
});

test('wat na bedtijd gebeurde, vertelt ze die avond nog niet, maar de volgende keer wel', () => {
  const S = gehucht(bijUur(HERFST, 12));
  T.zetVoorraad(S.dorp, 'bier', 100);
  const trijn = boer(S, 'boer4');
  trijn.wezen.karakter = 'roddelaar';
  const kelder = kelderVan(S, 'boer1');
  const d = avondInDeHerberg(S, trijn, HERFST);
  // Om twee uur 's nachts na die avond (dag d + 1): ze ziet het pas als ze al thuis zou moeten zijn.
  S.kalender.dag = bijUur(d + 1, 2);
  alleen(S, trijn.wezen);
  zet(S.schout, 36, RIJ);
  zet(trijn.wezen, 37, RIJ);
  assert.ok(T.verstop(S.dorp, kelder, 'graan', 10).kan);
  assert.equal(T.werdGezien(S, S.dorp, kelder, 'weg', 'graan', 10).getuigen.length, 1, 'van dichtbij ziet ze het wel');
  T.tikHerbergDag(S.dorp, d + 1);
  assert.equal(kelder.verteld, undefined, 'op de avond ervoor kon ze het nog niet vertellen');
  const e = avondInDeHerberg(S, trijn, d + 1);
  T.tikHerbergDag(S.dorp, e + 1);
  assert.equal(kelder.verteld, e);
});

test('wie het niet rondvertelt, zwijgt; en telt het karakter niet (de spelregels), dan zwijgt iedereen', () => {
  const { S, trijn, kelder } = trijnZietHet(HERFST);
  trijn.wezen.karakter = 'zanger';
  const d = avondInDeHerberg(S, trijn, HERFST);
  T.tikHerbergDag(S.dorp, d + 1);
  assert.equal(kelder.verteld, undefined, 'de zanger zingt, maar vertelt niets');
  assert.ok(!T.heeftVlag(S.dorp, 'herbergGetuige'));
  // De roddelaar, maar het karakter telt niet.
  const b = trijnZietHet(HERFST);
  const was = V.karakters;
  V.karakters = false;
  try {
    const e = avondInDeHerberg(b.S, b.trijn, HERFST);
    T.tikHerbergDag(b.S.dorp, e + 1);
    assert.equal(b.kelder.verteld, undefined);
    assert.ok(!T.heeftVlag(b.S.dorp, 'herbergGetuige'));
  } finally {
    V.karakters = was;
  }
});

test('met "pas later" in de spelregels krijgt een getuige geen oogje, maar de plek onthoudt het wel', () => {
  const was = IN.meteen;
  IN.meteen = false;
  try {
    const { S, trijn, kelder } = trijnZietHet(HERFST);
    assert.ok(!(trijn.wezen.oogje > S.tijd), 'geen oogje');
    assert.equal(kelder.getuigen.length, 1, 'maar ze zag het wel');
  } finally {
    IN.meteen = was;
  }
});
