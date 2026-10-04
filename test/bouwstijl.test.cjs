// De bouwstijl van een land (js/bouwstijl.js; werklijst vraag 114, stap 2a; Marcel, 4 okt: "A ja B ja C ik wil overal
// bouwfase voor ... D ja"): elk land van de maker bouwt in één stijl, elke vorm in vier standen, onder het dak van de
// trede waarin het gebouwd wordt of doorgroeit, en een stenen huis in baksteen pas met een steenbakkerij. De deur kijkt
// naar de weg. Het ontworpen gehucht heeft geen stijl, en speelt zoals altijd.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const HZ = require('../gereedschap/pixelart/huizen.cjs');
// Deze toetsen gaan ook over wat jij zelf bouwt (de spelregel "Wie bouwt" op "Jij bouwt"), zoals test/erven.test.cjs.
T.zetOptie('wieBouwt', 'jij');

T.ui = new Proxy({}, { get: () => () => {} });

const kantVan = ([b, d], [dx, dy]) => (dy === d ? 'z' : dx === b ? 'o' : dy === -1 ? 'n' : dx === -1 ? 'w' : '?');
const dakVan = (tekening) => tekening.split('/').pop().split('-')[2];

// Een nieuw spel, stil en zonder venster (zoals test/maker.test.cjs): met `zaad` op het land van de maker uit dat zaad,
// zonder op het ontworpen gehucht.
function nieuwSpel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

// Een lege wereld in de stijl wit, zoals in test/erven.test.cjs, met een weg (zandpad) langs de rij `wegY` of de kolom
// `wegX`.
function leeg({ b = 50, h = 50, wegY = null, wegX = null } = {}) {
  const tegels = [];
  const grond = [];
  for (let y = 0; y < h; y++) {
    tegels.push(new Array(b).fill('vloer'));
    grond.push(Array.from({ length: b }, (_, x) => ({ naam: y === wegY || x === wegX ? 'zandpad' : 'gras' })));
  }
  return {
    wereld: { b, h, tegels, grond, voorwerpen: [], wezens: [], stijl: 'wit' },
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, kalender: { dag: 0 }, behoeften: T.nieuweBehoeften(),
  };
}

test('elke tekening van een stijl staat op het vel, met de naam van zijn stijl, vorm, dak en stand, en zijn deur aan die kant', () => {
  const tegels = T.TEGELS.huizen.tiles.filter((t) => t && t.stijl);
  const opgaven = Object.values(HZ.HUIZEN).filter((o) => o.stijl);
  assert.equal(tegels.length, opgaven.length);
  assert.equal(tegels.length, 108, 'de stijl wit: 12 hutten, 36 huizen, 36 stenen huizen en 24 boerderijen');
  for (const t of tegels) {
    const s = t.stijl;
    assert.equal(t.naam, HZ.stijlNaam(s.stijl, s.vorm, s.steen === 'baksteen' ? 'baksteen' : s.dak, s.stand));
    assert.equal(kantVan(t.beslaat, t.deur), s.stand, `${t.naam}: de deur zit aan de kant van zijn stand`);
  }
  assert.deepEqual(T.bouwstijlen(), Object.keys(HZ.STIJLEN).sort());
});

test('het ontworpen gehucht heeft geen stijl, en bouwt met de tekeningen van T.GEBOUWEN', () => {
  const S = nieuwSpel();
  assert.equal(T.stijlVan(S.dorp), null);
  assert.ok(T.GEBOUWEN.huis.tekeningen.includes(T.volgendeTekening(S.dorp, 'huis')));
  assert.ok(T.GEBOUWEN.boerderij.tekeningen.includes(T.volgendeTekening(S.dorp, 'boerderij')));
});

test('een land van de maker bouwt in zijn stijl: de hutten, het huis en de boerderijen van het begin ook', () => {
  const S = nieuwSpel(5);
  assert.equal(S.wereld.stijl, T.stijlVoorLand(5));
  assert.equal(T.stijlVan(S.dorp), 'wit');
  // (het huis van de schout houdt zijn eigen tekening tot stap 3, met de herberg en de kapel)
  const woningen = S.dorp.gebouwen.filter((g) => ['hut', 'huis', 'boerderij'].includes(g.soort) && g.tekening !== 'huizen/schoutshuis');
  assert.ok(woningen.length >= 8);
  for (const g of woningen) assert.ok(T.deurKantVan(g.tekening), `${g.soort} (${g.tekening}) is van de stijl`);
  // en hij blijft het na bewaren en laden
  const terug = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(terug.gelukt, terug.reden);
  assert.equal(terug.staat.dorp.wereld.stijl, 'wit');
});

test('de maker zet een huis ook vóór het plein, met zijn deur ernaartoe (vraag 114, D)', () => {
  // Over een rij landen staan de huizen en hutten van het begin niet allemaal met hun deur naar zuid of oost: met vier
  // standen kan een huis ook vóór het plein staan, met zijn deur van je af.
  const standen = new Set();
  for (const zaad of [1, 2, 3, 4, 5, 6]) {
    for (const h of T.maakGehucht(zaad).huizen) if (['huis', 'hut', 'boerderij'].includes(h.rol)) standen.add(T.deurKantVan(`huizen/${h.tekening}`));
  }
  assert.ok(standen.has('n') || standen.has('w'), `standen: ${[...standen].join(', ')}`);
});

test('het dak van de trede: riet in het gehucht, leien in een dorp, pannen met marktrecht; een hut houdt riet', () => {
  const D = leeg();
  const daken = (soort) => T.stijlTekeningen(D, soort).map(dakVan);
  assert.deepEqual([...new Set(daken('hut'))], ['riet']);
  assert.deepEqual([...new Set(daken('huis'))], ['riet']);
  assert.deepEqual([...new Set(daken('boerderij'))], ['riet']);
  assert.deepEqual([...new Set(daken('stenenHuis'))], ['leien'], 'een stenen huis ligt nooit onder riet');
  D.trede = 'dorp';
  assert.deepEqual([...new Set(daken('hut'))], ['riet']);
  assert.deepEqual([...new Set(daken('huis'))], ['leien']);
  assert.deepEqual([...new Set(daken('stenenHuis'))], ['leien']);
  assert.equal(dakVan(T.volgendeTekening(D, 'huis')), 'leien', 'de volgende tekening volgt de trede');
  D.trede = 'marktrecht';
  assert.deepEqual([...new Set(daken('huis'))], ['pannen']);
  assert.deepEqual([...new Set(daken('boerderij'))], ['pannen']);
  assert.deepEqual([...new Set(daken('stenenHuis'))], ['pannen']);
  // baksteen pas als er een steenbakkerij staat die klaar is (Marcel, 4 okt: "Ja, baksteen na de steenbakker")
  D.gebouwen.push({ soort: 'steenbakkerij', x: 1, y: 1, klaar: false, klaarOp: 5, handen: 0, voorwerp: null });
  assert.deepEqual([...new Set(daken('stenenHuis'))], ['pannen']);
  D.gebouwen[0].klaar = true;
  assert.deepEqual([...new Set(daken('stenenHuis'))], ['baksteen']);
});

test('wie doorgroeit, houdt zijn stand en krijgt het dak van nu: een huis wordt zijn stenen broertje', () => {
  const D = leeg();
  D.trede = 'dorp';
  assert.equal(T.zoalsNu(D, 'huizen/wit-huis1-riet-w', 'huis'), 'huizen/wit-huis1-leien-w');
  assert.equal(T.zoalsNu(D, 'huizen/wit-huis1-riet-w', 'stenenHuis'), 'huizen/wit-steen1-leien-w');
  D.trede = 'marktrecht';
  D.gebouwen.push({ soort: 'steenbakkerij', x: 1, y: 1, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  assert.equal(T.zoalsNu(D, 'huizen/wit-huis6-leien-n', 'stenenHuis'), 'huizen/wit-steen6-baksteen-n');
  assert.equal(T.metDeurNaar('huizen/wit-huis3-pannen-z', 'o'), 'huizen/wit-huis3-pannen-o');
  assert.equal(T.metDeurNaar('huizen/huis3', 'o'), 'huizen/huis3', 'een tekening zonder stijl blijft zichzelf');
});

test('op een erf staat het huis met zijn deur naar de weg, achteraan, en het groeit door met het dak van zijn trede', () => {
  for (const [weg, kant] of [[{ wegY: 46 }, 'z'], [{ wegX: 2 }, 'w'], [{ wegY: 3 }, 'n'], [{ wegX: 47 }, 'o']]) {
    const D = leeg(weg);
    const u = T.legErfAan(D, 20, 20);
    assert.ok(u.gelukt, u.reden);
    const erf = u.erf;
    assert.equal(T.deurKantVan(erf.plan.huis), kant, `de weg ligt aan de kant ${kant}`);
    assert.equal(T.deurKantVan(erf.plan.hut), kant, 'de hut staat zoals het huis');
    // het huis achteraan: bij een deur naar het zuiden zo ver mogelijk naar het noorden, enzovoort
    const voet = T.gebouwVoet('huis', erf.plan.huis);
    const achter = { z: erf.plan.dy, n: erf.h - erf.plan.dy - erf.plan.h, w: erf.b - erf.plan.dx - erf.plan.b, o: erf.plan.dx }[kant];
    assert.ok(achter <= 3, `het huis staat achteraan op zijn erf (${achter} tegels van de achterkant, voet ${voet.b}×${voet.h})`);

    T.zetVoorraad(D, 'hout', T.GEBOUWEN.hut.kosten.hout);
    const hut = T.gezinZoektEenErf(D);
    for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) T.tikGebouwenDag(D, d);
    assert.equal(hut.klaar, true);
    T.zetVoorraad(D, 'graan', 100000);
    T.zetVoorraad(D, 'groente', 1000);
    T.zetVoorraad(D, 'vis', 1000);
    T.zetVoorraad(D, 'vlees', 1000);
    D.gebouwen.push({ soort: 'kapel', x: 40, y: 40, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
    D.trede = 'dorp';
    let dag = T.GEBOUWEN.hut.bouwtijd;
    for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikGebouwenDag(D, ++dag);
    assert.equal(hut.soort, 'huis');
    assert.equal(hut.tekening, T.zoalsNu(D, erf.plan.huis, 'huis'), 'het huis van zijn erf, onder leien');
    assert.equal(dakVan(hut.tekening), 'leien');
    assert.equal(T.deurKantVan(hut.tekening), kant);
  }
});

test('een verzoek keert zijn deur naar de weg, en het goud op de grond en het gebouw hebben dezelfde voet', () => {
  for (const [weg, kant] of [[{ wegY: 46 }, 'z'], [{ wegX: 2 }, 'w']]) {
    const D = leeg(weg);
    T.zetVoorraad(D, 'hout', 1000);
    T.zetVoorraad(D, 'goud', 1000);
    const plek = T.plekVoor(D, 'boerderij', { x: 25, y: 25 });
    assert.ok(plek);
    const tekening = T.volgendeTekening(D, 'boerderij');
    assert.equal(T.deurKantVan(tekening), kant);
    const u = T.plaatsGebouw(D, 'boerderij', plek.x, plek.y);
    assert.ok(u.gelukt, u.reden);
    assert.equal(u.instantie.tekening, tekening);
  }
});
