// Het eind van het spel, en het jaar in het kort (js/einde.js; werklijst vraag 101, Marcel, 3 okt: "101 ja"): winnen
// is een jaar lang iedereen super gelukkig, vanaf 100 mensen, en dan viert het dorp het grote feest; verliezen ook
// als er minder dan 10 mensen over zijn; en op 1 lentemaand het jaarverslag.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
const getoond = [];
T.ui = new Proxy({}, {
  get: (_, naam) => {
    if (naam === 'bericht') return (t) => berichten.push(t);
    if (['toonEinde', 'toonGewonnen', 'toonBrief'].includes(naam)) return (D, soort) => getoond.push(soort ? `${naam}:${soort}` : naam);
    return () => {};
  },
});

function dagVan(maand, d, jaar = 0) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag + jaar * 360;
}

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/feesten.test.cjs).
function gehucht() {
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
  return S;
}

// Elk huis met mensen in de hoogste stand (of een boerderij ernaast) met alles, en zoveel mensen: zoals de regels het na
// een nacht op de huizen zetten (g.wensen, js/wensen.js). Een toets van het eind, niet van de wensen.
function allesGelukkig(D, mensen = 120) {
  D.bevolking = mensen;
  for (const g of D.gebouwen) {
    const stand = T.standVan(g);
    if (!stand) continue;
    g.wensen = { stand: T.STANDEN[stand].los ? stand : 'ambachtslieden', mensen: 4, alles: true };
  }
}
const woningen = (D) => D.gebouwen.filter((g) => g.wensen && g.wensen.mensen > 0);

test('iedereen is super gelukkig: genoeg mensen, en elk huis heeft alles in de hoogste stand of ernaast', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.equal(T.iedereenGelukkig(D), false, 'het gehucht van het begin is het niet');
  allesGelukkig(D);
  assert.equal(T.iedereenGelukkig(D), true);
  assert.ok(woningen(D).some((g) => g.wensen.stand === 'boeren'), 'de boerderijen staan ernaast, en tellen mee');

  const huis = woningen(D).find((g) => g.wensen.stand === 'ambachtslieden');
  huis.wensen.alles = false;
  assert.equal(T.iedereenGelukkig(D), false, 'één huis dat iets mist, en het is niet iedereen');
  huis.wensen.alles = true;
  huis.wensen.stand = 'dorpelingen';
  assert.equal(T.iedereenGelukkig(D), false, 'een huis van dorpelingen met alles is nog niet de hoogste stand');
  huis.wensen.stand = 'ambachtslieden';

  D.bevolking = T.EINDE_INSTELLINGEN.minstensMensen - 1;
  assert.equal(T.iedereenGelukkig(D), false, 'onder de honderd mensen telt het niet: geen winst met één stenen huis');
});

test('een week mag: een slechte reeks van hooguit zeven dagen zet de teller stil, een dag meer zet hem op nul', () => {
  const S = gehucht();
  const D = S.dorp;
  allesGelukkig(D);
  const begin = dagVan('zomermaand', 1);
  const mag = T.EINDE_INSTELLINGEN.magMissen;
  assert.equal(mag, 7, 'de standaard: een week');
  let dag = begin;
  for (let i = 0; i < 10; i++) T.tikEindeDag(D, dag++);
  woningen(D)[0].wensen.alles = false;
  for (let i = 0; i < mag; i++) T.tikEindeDag(D, dag++);
  assert.equal(D.eind.dagen, 10, 'een week lang mist een huis iets: de teller staat stil');
  woningen(D)[0].wensen.alles = true;
  T.tikEindeDag(D, dag++);
  assert.equal(D.eind.dagen, 11, 'weer goed: hij telt verder');
  woningen(D)[0].wensen.alles = false;
  for (let i = 0; i < mag + 1; i++) T.tikEindeDag(D, dag++);
  assert.equal(D.eind.dagen, 0, 'een dag meer dan een week: opnieuw');
  assert.equal(D.eind.beste, 11, 'de langste reeks blijft bewaard');
});

test('een jaar lang iedereen gelukkig, en het dorp viert het grote feest; met "Een jaar op rij" zet één dag de teller op nul', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetOptie('eind', 'jaar');
  try {
    allesGelukkig(D);
    const begin = dagVan('zomermaand', 1);
    for (let i = 0; i < 10; i++) T.tikEindeDag(D, begin + i);
    assert.equal(D.eind.dagen, 10);
    woningen(D)[0].wensen.alles = false;
    T.tikEindeDag(D, begin + 10);
    assert.equal(D.eind.dagen, 0, 'een dag waarop één huis iets mist, zet de teller op nul');
    assert.equal(D.eind.beste, 10, 'de langste reeks blijft bewaard');
  } finally {
    T.optiesTerug();
  }
  const begin = dagVan('zomermaand', 1);
  const N = T.EINDE_INSTELLINGEN.dagen;
  woningen(D)[0].wensen.alles = true;

  berichten.length = 0;
  getoond.length = 0;
  let dag = begin + 11;
  for (let i = 0; i < N - 1; i++) T.tikEindeDag(D, dag++);
  assert.equal(D.eind.gewonnen, null, `na ${N - 1} dagen is het nog niet gewonnen`);
  T.tikEindeDag(D, dag);
  assert.deepEqual(D.eind.gewonnen, { dag, getoond: false }, `na ${N} dagen wel`);
  assert.ok(!D.einde, 'wie wint, speelt verder: het spel is niet uit');
  const f = T.feestOp(D, dag + 11 / 24);
  assert.ok(f && f.id === 'stad' && f.heel, 'het dorp viert het grote feest, de hele dag');
  assert.ok(f.midden, 'op het plein');
  assert.ok(berichten.some((b) => /een jaar lang had iedereen alles/i.test(b)), 'en het zegt waarom');
  assert.ok(T.vrijeDag(D, dag + 11 / 24), 'er wordt niet gewerkt');

  // Daarna verandert er niets meer: gewonnen is gewonnen.
  woningen(D)[0].wensen.alles = false;
  T.tikEindeDag(D, dag + 1);
  assert.equal(D.eind.gewonnen.dag, dag);
});

test('het eindscherm komt over het feest: als de schout erbij staat, of die avond, één keer', () => {
  const S = gehucht();
  const D = S.dorp;
  allesGelukkig(D);
  const dag = dagVan('zomermaand', 1);
  D.eind = { dagen: T.EINDE_INSTELLINGEN.dagen - 1, beste: 0, gewonnen: null };
  T.tikEindeDag(D, dag);
  assert.ok(D.eind.gewonnen);
  const f = T.feestOp(D, dag + 0.5);

  getoond.length = 0;
  S.kalender.dag = dag + 10 / 24;
  S.schout.tx = f.midden.x + T.FEESTEN_INSTELLINGEN.kring + 6;
  S.schout.ty = f.midden.y;
  T.werkEindeBij(S);
  assert.deepEqual(getoond, [], 'om tien uur, ver van het plein: nog niet');
  S.schout.tx = f.midden.x + 1;
  T.werkEindeBij(S);
  assert.deepEqual(getoond, ['toonGewonnen'], 'bij het feest wel');
  T.werkEindeBij(S);
  assert.deepEqual(getoond, ['toonGewonnen'], 'één keer');

  D.eind.gewonnen.getoond = false;
  getoond.length = 0;
  S.schout.tx = f.midden.x + T.FEESTEN_INSTELLINGEN.kring + 6;
  S.kalender.dag = dag + 20.5 / 24;
  T.werkEindeBij(S);
  assert.deepEqual(getoond, ['toonGewonnen'], 'en anders die avond, als het licht brandt');
});

test('minder dan tien mensen over, en het spel is uit; een ander dorp verliest nog niet', () => {
  const S = gehucht();
  const D = S.dorp;
  getoond.length = 0;
  D.bevolking = T.EINDE_INSTELLINGEN.minstensOver;
  T.tikEindeDag(D, 40);
  assert.ok(!D.einde, 'met tien gaat het nog');
  D.bevolking = T.EINDE_INSTELLINGEN.minstensOver - 1;
  T.tikEindeDag(D, 41);
  assert.deepEqual(D.einde, { reden: 'leeg', dag: 41 });
  assert.ok(getoond.includes('toonEinde'));
  assert.ok(S.kalender.stil.includes('einde'), 'de tijd staat stil');

  const ander = gehucht().dorp;
  ander.ander = true;
  ander.bevolking = 3;
  T.tikEindeDag(ander, 41);
  assert.ok(!ander.einde);
});

test('het jaarboek telt het jaar, en op 1 lentemaand komt het jaarverslag', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetDorpsnaam(D, 'Kleiwerd');
  const begin = Math.floor(S.kalender.dag);
  getoond.length = 0;
  const nacht = (dag, regels, gemist = []) => {
    D.dagboek = { regels };
    D.behoeften.gemist = gemist;
    T.tikEindeDag(D, dag);
  };
  nacht(begin + 1, [{ soort: 'mensen', verschil: 4, reden: 'groei' }, { soort: 'huis' }], [{ id: 'bier' }, { id: 'put' }]);
  nacht(begin + 2, [{ soort: 'mensen', verschil: -1, reden: 'vertrek' }, { soort: 'mensen', verschil: -2, reden: 'winter' }], [{ id: 'bier' }]);
  nacht(begin + 3, [{ soort: 'mensen', verschil: -1, reden: 'gesneuveld' }]);
  assert.deepEqual(
    { kwamen: D.jaarboek.kwamen, stierven: D.jaarboek.stierven, weg: D.jaarboek.weg, doorgegroeid: D.jaarboek.doorgegroeid, gemist: D.jaarboek.gemist },
    { kwamen: 4, stierven: 3, weg: 1, doorgegroeid: 1, gemist: { bier: 2, put: 1 } },
  );
  T.telOogstInJaarboek(D, 300.2); // de boeren maaien tegel voor tegel (js/akkers.js)
  T.telOogstInJaarboek(D, 100.1);
  D.feesten = { komt: null, boom: null, gevierd: [{ id: 'meiboom', dag: begin + 60, heel: true }] };
  D.bevolking = 30;

  const lente = dagVan('lentemaand', 1, 1);
  assert.equal(T.datumVanDag(lente).tekst, '1 lentemaand 1324');
  nacht(lente - 1, []);
  assert.deepEqual(getoond, [], 'de dag ervoor nog niet');
  nacht(lente, []);
  assert.deepEqual(getoond, ['toonBrief:jaarverslag']);
  const regels = D.jaarverslag.regels;
  assert.equal(D.jaarverslag.dag, lente);
  assert.equal(regels[0], 'In het jaar 1323 groeide Kleiwerd van 26 naar 30 mensen.');
  assert.ok(regels.includes('4 mensen kwamen erbij, 3 stierven en 1 trok weg.'), regels.join(' | '));
  assert.ok(regels.includes('De oogst bracht 400 graan.'));
  assert.ok(regels.includes('Eén huis groeide door.'));
  assert.ok(regels.includes('We vierden de meiboom.'));
  assert.ok(regels.some((r) => /^Het meest gemist werd drank, op 2 dagen\.$/.test(r)), regels.join(' | '));
  assert.equal(regels[regels.length - 1], 'Er was geen dag waarop iedereen alles had wat hij wilde.');
  assert.equal(D.jaarboek.begin, lente, 'en het nieuwe jaar begint een nieuw jaarboek');
  assert.equal(D.jaarboek.kwamen, 0);
});

test('het doel linksboven: pas na de laatste trede, en dan wat er nog tussen jou en de winst staat', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.equal(T.eindDoel(D), null, 'zolang er een trede te halen is, is dat het doel');
  while (T.volgendeTrede(D)) D.trede = T.volgendeTrede(D);
  T.zetDorpsnaam(D, 'Kleiwerd');
  assert.deepEqual(T.eindDoel(D), { kop: 'Kleiwerd · iedereen een jaar gelukkig', tekst: `${D.bevolking} van 100 mensen` });
  allesGelukkig(D);
  woningen(D)[0].wensen.alles = false;
  const n = woningen(D).length;
  assert.equal(T.eindDoel(D).tekst, `${n - 1} van ${n} huizen zijn super gelukkig`);
  D.eind = { dagen: 12, beste: 12, gewonnen: null };
  assert.equal(T.eindDoel(D).tekst, '12 van 360 dagen');
  D.eind.mis = 3;
  assert.equal(T.eindDoel(D).tekst, '12 van 360 dagen; de teller staat stil, nog 4 dagen om het goed te maken');
  D.eind.mis = 7;
  assert.equal(T.eindDoel(D).tekst, '12 van 360 dagen; de teller staat stil: maak het vandaag goed, of hij begint opnieuw');
  D.eind.gewonnen = { dag: 400, getoond: true };
  assert.equal(T.eindDoel(D).tekst, `gewonnen op ${T.datumVanDag(400).tekst}`);
});

test('het eind wordt bewaard en geladen', () => {
  const S = gehucht();
  const D = S.dorp;
  allesGelukkig(D);
  T.tikEindeDag(D, 5);
  T.tikEindeDag(D, 6);
  const terug = T.leesSpel(T.bewaarSpel(S));
  assert.ok(terug.gelukt);
  assert.deepEqual(terug.staat.dorp.eind, D.eind);
  assert.deepEqual(terug.staat.dorp.jaarboek, D.jaarboek);
});
