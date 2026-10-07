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
  const per = {};
  for (const tg of tegels) per[tg.stijl.stijl] = (per[tg.stijl.stijl] || 0) + 1;
  // elk 12 hutten, 36 huizen, 36 stenen huizen en 24 boerderijen; oker en roze nemen de hutten van wit (vraag 114, 2b);
  // en elk 32 grote gebouwen: de kleine en de grote herberg, de kapel, de woontoren en het huis van de schout (stap 3)
  assert.deepEqual(per, { wit: 140, oker: 128, planken: 140, roze: 128 });
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
  assert.equal(T.stijlVan(S.dorp), T.stijlVoorLand(5));
  // (het huis van de schout houdt zijn eigen tekening tot stap 3, met de herberg en de kapel)
  const woningen = S.dorp.gebouwen.filter((g) => ['hut', 'huis', 'boerderij'].includes(g.soort) && g.tekening !== 'huizen/schoutshuis');
  assert.ok(woningen.length >= 8);
  for (const g of woningen) assert.ok(T.deurKantVan(g.tekening), `${g.soort} (${g.tekening}) is van de stijl`);
  // en hij blijft het na bewaren en laden
  const terug = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(terug.gelukt, terug.reden);
  assert.equal(terug.staat.dorp.wereld.stijl, T.stijlVoorLand(5));
});

test('elke stijl heeft zijn eigen huizen en boerderijen; oker en roze nemen de hutten van wit (vraag 114, 2b)', () => {
  assert.deepEqual(T.bouwstijlen(), ['oker', 'planken', 'roze', 'wit']);
  const vormen = (stijl, soort) => [...new Set(T.stijlTekeningen({ ...leeg(), wereld: { ...leeg().wereld, stijl } }, soort).map(T.vormVan))];
  for (const soort of ['huis', 'boerderij']) {
    const alle = ['oker', 'planken', 'roze', 'wit'].flatMap((s) => vormen(s, soort));
    assert.equal(new Set(alle).size, alle.length, `geen ${soort} in twee stijlen: ${alle.join(', ')}`);
  }
  const D = (stijl) => ({ ...leeg(), wereld: { ...leeg().wereld, stijl } });
  assert.deepEqual(T.stijlTekeningen(D('oker'), 'hut'), T.stijlTekeningen(D('wit'), 'hut'));
  assert.deepEqual(T.stijlTekeningen(D('roze'), 'hut'), T.stijlTekeningen(D('wit'), 'hut'));
  // de plankenstijl heeft eigen hutten, onder spanen, en zijn huizen in een gehucht ook
  assert.ok(T.stijlTekeningen(D('planken'), 'hut').every((n) => n.startsWith('huizen/planken-') && n.includes('-spanen-')));
  assert.ok(T.stijlTekeningen(D('planken'), 'huis').every((n) => n.includes('-spanen-')));
  // een stenen huis in de natuursteen van zijn stijl
  const steen = (stijl) => T.stijlTekeningen({ ...D(stijl), trede: 'dorp' }, 'stenenHuis');
  assert.ok(steen('oker').every((n) => n.startsWith('huizen/oker-steen')));
});

test('wie doorgroeit, krijgt de stijl van zijn dorp, ook vanuit een gedeelde hut van wit', () => {
  const D = { ...leeg(), wereld: { ...leeg().wereld, stijl: 'oker' }, trede: 'dorp' };
  // een hut van wit in een dorp van oker wordt geen wit huis: de vorm zoekt het dorp in zijn eigen stijl
  assert.equal(T.zoalsNu(D, 'huizen/wit-hut1-riet-z', 'hut'), 'huizen/wit-hut1-riet-z');
  assert.ok(T.andereVormen(D, 'huizen/wit-hut1-riet-o', 'huis').every((n) => n.startsWith('huizen/oker-huis') && n.endsWith('-o')));
  assert.equal(T.zoalsNu(D, 'huizen/oker-huis2-riet-n', 'stenenHuis'), 'huizen/oker-steen2-leien-n');
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

// De grote gebouwen (werklijst vraag 114, stap 3; Marcel, 7 okt: "A; ja goed idee / B: Ja"): de kapel en de woontoren
// van steen, de herberg die meegroeit met het dorp, en het huis van de schout en de herberg van de maker in de stijl.
test('de kapel en de woontoren zijn van de steen van hun stijl, en van baksteen met een steenbakkerij', () => {
  const D = leeg();
  assert.deepEqual(T.stijlTekeningen(D, 'kapel'), ['huizen/wit-kapel-leien-z']);
  assert.deepEqual(T.stijlTekeningen(D, 'woontoren'), ['huizen/wit-woontoren-pannen-z']);
  assert.deepEqual(T.stijlTekeningen(D, 'herberg'), ['huizen/wit-herberg1-riet-z'], 'in het gehucht de kleine herberg');
  D.trede = 'dorp';
  assert.deepEqual(T.stijlTekeningen(D, 'herberg'), ['huizen/wit-herberg2-leien-z'], 'in een dorp de grote');
  D.gebouwen.push({ soort: 'steenbakkerij', x: 1, y: 1, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  assert.deepEqual(T.stijlTekeningen(D, 'kapel'), ['huizen/wit-kapel-baksteen-z']);
  assert.deepEqual(T.stijlTekeningen(D, 'woontoren'), ['huizen/wit-woontoren-baksteen-z']);
  // wie in een woontoren woont, is ambachtsman, zoals in een stenen huis
  assert.equal(T.standVan({ soort: 'woontoren' }), 'ambachtslieden');
});

test('de maker legt het huis van de schout en de herberg in de stijl van het land, met de deur naar het plein', () => {
  for (const zaad of [5, 62710]) {
    const S = nieuwSpel(zaad);
    const D = S.dorp;
    const schout = D.gebouwen.find((g) => g.huis === 'schout');
    const herberg = D.gebouwen.find((g) => g.soort === 'herberg');
    assert.equal(T.vormVan(schout.tekening), 'schoutshuis');
    assert.equal(T.vormVan(herberg.tekening), 'herberg1');
    assert.ok(T.deurKantVan(schout.tekening) && T.deurKantVan(herberg.tekening), 'allebei van de stijl');
    assert.equal(T.stijlVan(D), T.stijlVoorLand(zaad));
  }
});

test('in een dorp groeit de herberg door tot de grote, met zijn deur aan dezelfde kant, voor hout', () => {
  const S = nieuwSpel(5);
  const D = S.dorp;
  const g = D.gebouwen.find((x) => x.soort === 'herberg');
  const kant = T.deurKantVan(g.tekening);
  const voor = T.voetVanGebouw(g);
  T.zetVoorraad(D, 'graan', 2000);
  T.zetVoorraad(D, 'hout', 0);
  T.tikBehoeftenDag(D, 1);
  assert.equal(T.vormVan(g.tekening), 'herberg1', 'in het gehucht blijft hij klein');
  D.trede = 'dorp';
  T.tikBehoeftenDag(D, 2);
  assert.equal(T.vormVan(g.tekening), 'herberg1', 'zonder hout wacht hij');
  assert.ok(g.wachtOpBouwstof);
  T.zetVoorraad(D, 'hout', 100);
  T.tikBehoeftenDag(D, 3);
  assert.equal(T.vormVan(g.tekening), 'herberg2');
  assert.equal(T.deurKantVan(g.tekening), kant);
  // (de mensen sprokkelen die dag ook wat hout)
  assert.ok(Math.abs(D.voorraad.hout - (100 - T.WENSEN_INSTELLINGEN.bouwstof.herberg.hout)) < 1, `${D.voorraad.hout} hout over`);
  // de kant van de deur ligt waar hij lag
  const na = T.voetVanGebouw(g);
  const zijde = (r) => ({ z: r.y + r.h, o: r.x + r.b, n: r.y, w: r.x })[kant];
  assert.equal(zijde(na), zijde(voor));
  assert.equal(g.voorwerp.x, g.x);
  assert.equal(g.voorwerp.y, g.y);
  for (let y = na.y; y < na.y + na.h; y++) for (let x = na.x; x < na.x + na.b; x++) assert.equal(D.wereld.tegels[y][x], 'muur');
});

test('een stenen huis wordt pas met marktrecht een woontoren', () => {
  assert.equal(T.GEBOUWEN.stenenHuis.wordt, 'woontoren');
  assert.equal(T.GEBOUWEN.stenenHuis.wordtVanaf, 'marktrecht');
  assert.equal(T.GEBOUWEN.woontoren.woonruimte, 3 * T.GEBOUWEN_INSTELLINGEN.gezinGrootte, 'drie gezinnen');
  assert.ok(!T.inBouwmenu(leeg(), 'woontoren'), 'niemand bouwt hem: hij groeit');
});
