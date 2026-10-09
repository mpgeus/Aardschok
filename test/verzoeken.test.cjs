// De verzoeken (js/verzoeken.js; werklijst vraag 103, Marcel, 3 okt: "De inwoners bouwen zelf een weverij etc. Ze vragen
// alleen toestemming om te bouwen", en "103 a b c ja d ook verzoek e ja"): met de spelregel "Wie bouwt" op "De mensen"
// bouw jij niets meer behalve erven; wat het dorp mist, komt een inwoner je vragen, met de plek die hij koos en wat het
// kost. Ja, en het komt er; nee, en het dorp onthoudt het; ben je weg, dan beslist je raadsman.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

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

// Een nacht, zoals het spel hem tikt (js/gebouwen.js).
function nacht(S, dag) {
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
// Een houthakker die er al staat: anders vraagt iemand die eerst (T.watTeBouwen, js/raad.js).
function metHouthakker(S) {
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.huis === 'schout');
  const plek = T.plekVoor(D, 'houthakker', T.deurVan(D.wereld, huis));
  assert.ok(T.plaatsGebouw(D, 'houthakker', plek.x, plek.y).gelukt);
  return S;
}
const lopend = (D) => D.voorvallen && D.voorvallen.lopend;
const tekstVan = (D) => T.vulWoordenIn(D, T.GESPREKKEN.bouwverzoek.knopen.begin.tekst[0].zeg);
const antwoord = (n) => T.GESPREKKEN.bouwverzoek.knopen.begin.keuzes[n];
function zeg(S, n) {
  const L = lopend(S.dorp);
  T.doeGevolg(S, S.dorp, antwoord(n).doe);
  T.voorvalBeantwoord(S.dorp, L.id);
}

test('de standaard: de mensen vragen het, en in het bouwmenu staat alleen het erf; met "Jij bouwt" alles weer', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.equal(T.VERZOEKEN_INSTELLINGEN.mensen, true);
  assert.deepEqual(Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu(D, id)), ['erf']);
  assert.ok(T.magGebouwd(D, 'kapel') && T.magGebouwd(D, 'houthakker') && T.magGebouwd(D, 'put'), 'wat mag, kan iemand vragen');
  assert.ok(!T.magGebouwd(D, 'weverij'), 'een weverij pas in een dorp');
  T.zetOptie('wieBouwt', 'jij');
  try {
    assert.ok(T.inBouwmenu(D, 'kapel') && T.inBouwmenu(D, 'houthakker'));
    nacht(S, 1);
    assert.ok(!lopend(D) || lopend(D).id !== 'bouwverzoek', 'wie zelf bouwt, krijgt geen verzoeken');
  } finally {
    T.optiesTerug();
  }
});

test('na de eerste nacht vraagt iemand namens de buurt om een kapel, met de plek, waarom en wat het kost', () => {
  const S = metHouthakker(gehucht());
  const D = S.dorp;
  assert.deepEqual(T.watTeBouwen(D), [], 'vóór de eerste nacht weet het dorp nog niet wat het mist');
  nacht(S, 1);
  assert.equal(T.watTeBouwen(D)[0].soort, 'kapel');
  const L = lopend(D);
  assert.ok(L && L.id === 'bouwverzoek', 'er loopt een bouwverzoek');
  assert.equal(L.bouw.soort, 'kapel');
  assert.ok(T.gebouwPast(D, 'kapel', L.bouw.x, L.bouw.y), 'op een plek waar hij past');
  const voet = T.voetVanGebouw(L.wie.huis);
  assert.ok(T.inDeKring(voet, { x: L.bouw.x, y: L.bouw.y, b: T.GEBOUWEN.kapel.voet.b, h: T.GEBOUWEN.kapel.voet.h }, T.WENSEN_INSTELLINGEN.kring.kapel), 'wie het vraagt, woont in de buurt');
  assert.match(tekstVan(D), /^Schout, de buurt wil een kapel bouwen, (bij|naast) [^.]+\. Vijf boerderijen en een huis willen een kapel binnen 40 tegels\. Het dorp betaalt 10 hout en 8 goud\.$/);
  assert.equal(T.vulWoordenIn(D, T.VOORVALLEN.bouwverzoek.roep), `${T.naamVanBewoner(L.wie)} wil een kapel bouwen, en zoekt je.`);
  assert.deepEqual(T.prijsVanKeuze(D, antwoord(0).doe), { tekst: '−10 hout, −8 goud, tevredenheid +3%', kan: true, waarom: '' });
  assert.equal(T.prijsVanKeuze(D, antwoord(1).doe).tekst, 'tevredenheid −2%');
  T.zetVoorraad(D, 'goud', 3);
  assert.deepEqual(T.prijsVanKeuze(D, antwoord(0).doe), { tekst: '−10 hout, −8 goud, tevredenheid +3%', kan: false, waarom: 'je hebt 3 goud' });
});

test('de raad zegt wat zou helpen, zonder [B], en wie je erom vraagt', () => {
  const S = metHouthakker(gehucht());
  const D = S.dorp;
  nacht(S, 1);
  const x = T.watDeHuizenMissen(D).find((w) => w.id === 'kapel');
  assert.equal(x.tekst, 'Vijf boerderijen en een huis willen een kapel binnen 40 tegels.');
  assert.equal(x.zin, 'Vijf boerderijen en een huis willen een kapel binnen 40 tegels.');
  const wens = T.RADEN.find((r) => r.id === 'wens');
  assert.equal(wens.tekst(D), `Vijf boerderijen en een huis willen een kapel binnen 40 tegels. ${T.naamVanBewoner(lopend(D).wie)} vraagt je erom.`);
  zeg(S, 1);
  assert.equal(wens.tekst(D), 'Vijf boerderijen en een huis willen een kapel binnen 40 tegels. Je zei er nee tegen.');
});

test('ja: de kapel komt er, het dorp betaalt, en wie het vroeg is er de meester', () => {
  const S = metHouthakker(gehucht());
  const D = S.dorp;
  nacht(S, 1);
  const L = lopend(D);
  const { x, y } = L.bouw;
  const wie = L.wie;
  const hout = D.voorraad.hout;
  const goud = D.voorraad.goud;
  berichten.length = 0;
  zeg(S, 0);
  const kapel = D.gebouwen.find((g) => g.soort === 'kapel');
  assert.ok(kapel, 'de kapel staat er');
  assert.deepEqual([kapel.x, kapel.y, kapel.klaar], [x, y, false], 'op zijn plek, in aanbouw');
  assert.equal(kapel.meester, wie);
  assert.equal(D.voorraad.hout, hout - 10);
  assert.equal(D.voorraad.goud, goud - 8);
  assert.equal(D.verzoeken.ja, 1);
  assert.ok(berichten.includes(`${T.naamVanBewoner(wie)} begint aan de kapel.`), berichten.join(' | '));
  assert.ok(!lopend(D), 'het verzoek is af');
  assert.ok(!T.watTeBouwen(D).some((w) => w.soort === 'kapel'), 'wat er gebouwd wordt, vraagt niemand nog eens');
});

test('nee: niemand vraagt de kapel weer, tot naNee dagen later', () => {
  const S = metHouthakker(gehucht());
  const D = S.dorp;
  nacht(S, 1);
  zeg(S, 1);
  assert.deepEqual(D.verzoeken.nee, { kapel: 1 });
  assert.equal(D.verzoeken.geweigerd, 1);
  const N = T.VERZOEKEN_INSTELLINGEN.naNee;
  for (let dag = 2; dag <= N; dag++) {
    D.verzoeken.volgende = 0;
    if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
    T.beginBouwverzoek(D, dag);
    assert.ok(!lopend(D) || lopend(D).bouw.soort !== 'kapel', `op dag ${dag} vraagt niemand de kapel`);
  }
  if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
  D.verzoeken.volgende = 0;
  assert.ok(T.beginBouwverzoek(D, N + 1));
  assert.equal(lopend(D).bouw.soort, 'kapel', 'daarna wel weer');
});

test('een verzoek komt alleen als het dorp het kan betalen, en niet vaker dan om de paar dagen', () => {
  const S = gehucht();
  const D = S.dorp;
  nacht(S, 1);
  T.voorvalBeantwoord(D, lopend(D).id);
  // Niet vaker dan om de paar dagen, en geen vast getal: tussen de helft en anderhalf keer `elke` (Marcel, 8 okt).
  const elke = T.VERZOEKEN_INSTELLINGEN.elke;
  const s = T.VOORVALLEN_INSTELLINGEN.spreiding;
  const tussen = D.verzoeken.volgende - 1;
  assert.ok(tussen >= Math.max(1, Math.round(elke * (1 - s))) && tussen <= Math.round(elke * (1 + s)), `${tussen} dagen`);
  assert.equal(T.beginBouwverzoek(D, 2), false, 'niet de dag erna');
  D.verzoeken.volgende = 0;
  T.zetVoorraad(D, 'goud', 0);
  T.zetVoorraad(D, 'hout', 0);
  assert.equal(T.beginBouwverzoek(D, 2), false, 'zonder hout en goud vraagt niemand iets');
});

test('ben je weg, dan beslist je raadsman: wat het helpt tegen wat het kost, naar zijn karakter', () => {
  const S = metHouthakker(gehucht());
  const D = S.dorp;
  nacht(S, 1);
  const boer = D.bewoners.mensen.find((p) => T.isBoer(p.wezen) && p !== lopend(D).wie);
  boer.wezen.karakter = 'zanger';
  assert.equal(T.raadsmanKeuze(D, boer, 'bouwverzoek').zeg, 'Ja, bouw maar.', 'een zanger ziet het dorp graag blij');
  boer.wezen.karakter = 'woekeraar';
  assert.equal(T.raadsmanKeuze(D, boer, 'bouwverzoek').zeg, 'Nee, nu niet.', 'een woekeraar telt het goud');
});

test('een verzoek en wat het dorp weigerde, worden bewaard en geladen', () => {
  const S = gehucht();
  const D = S.dorp;
  nacht(S, 1);
  D.verzoeken.nee.put = 1;
  const terug = T.leesSpel(T.bewaarSpel(S));
  assert.ok(terug.gelukt);
  assert.deepEqual(terug.staat.dorp.verzoeken, D.verzoeken);
  assert.deepEqual(terug.staat.dorp.voorvallen.lopend.bouw, D.voorvallen.lopend.bouw);
  assert.equal(terug.staat.dorp.voorvallen.lopend.wie.naam, D.voorvallen.lopend.wie.naam);
});

test('zonder houthakker vraagt iemand die eerst, bij zijn eigen huis: elke hut en elk gebouw kost hout', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.ok(!D.gebouwen.some((g) => g.soort === 'houthakker'), 'het gehucht begint zonder houthakker');
  nacht(S, 1);
  const x = T.watTeBouwen(D)[0];
  assert.deepEqual([x.soort, x.voor], ['houthakker', 'hout']);
  const L = lopend(D);
  assert.equal(L.bouw.soort, 'houthakker');
  assert.ok(!T.isBoer(L.wie.wezen), 'een werkplaats vraagt iemand die geen boer is');
  assert.match(tekstVan(D), /^Schout, ik wil een houthakker bouwen, [^.]+\. Er hakt niemand hout, en elke hut en elk gebouw kost hout\. Het dorp betaalt 10 hout en 4 goud\.$/);
  zeg(S, 0);
  assert.ok(!T.watTeBouwen(D).some((w) => w.soort === 'houthakker'), 'staat hij er, dan vraagt niemand er nog een');
});

test('een oproep (stap 2): wat erop staat, vraagt iemand als eerste, ook wat niemand mist, en de premie gaat erbij', () => {
  const S = gehucht();
  const D = S.dorp;
  nacht(S, 1);
  T.voorvalBeantwoord(D, lopend(D).id); // het verzoek van de eerste nacht (de houthakker)
  assert.equal(T.doeOproep(D, 'steengroeve'), 'Op het plein hangt je oproep: het dorp zoekt een steengroeve, met een premie van 5 goud.');
  assert.ok(T.oproepVoor(D, 'steengroeve'));
  assert.ok(!T.watTeBouwen(D).some((x) => x.soort === 'steengroeve'), 'niemand mist een steengroeve');
  D.verzoeken.volgende = 0;
  assert.ok(T.beginBouwverzoek(D, 2));
  const L = lopend(D);
  assert.deepEqual([L.bouw.soort, L.bouw.premie, L.bouw.nut], ['steengroeve', 5, T.VERZOEKEN_INSTELLINGEN.nutTot], 'de oproep gaat voor de rest');
  assert.match(tekstVan(D), /Op het plein hangt je oproep, met een premie van 5 goud\. Het dorp betaalt 12 hout en 9 goud, met de premie\.$/);
  assert.equal(T.prijsVanKeuze(D, antwoord(0).doe).tekst, '−12 hout, −9 goud, tevredenheid +3%');
  const goud = D.voorraad.goud;
  zeg(S, 0);
  assert.ok(D.gebouwen.some((g) => g.soort === 'steengroeve' && g.meester === L.wie));
  assert.equal(D.voorraad.goud, goud - 4 - 5, 'wat de steengroeve kost, en de premie');
  assert.equal(T.oproepVoor(D, 'steengroeve'), null, 'de oproep hangt er niet meer');
});

test('nog een klik haalt een oproep weg; wat nog niet mag, kan niet; en wacht hij een week op goud, dan zegt de raad het', () => {
  const S = gehucht();
  const D = S.dorp;
  nacht(S, 1);
  assert.equal(T.doeOproep(D, 'weverij'), 'Een weverij mag hier nog niet.');
  T.doeOproep(D, 'wachthuis');
  assert.equal(T.doeOproep(D, 'wachthuis'), 'Je haalt je oproep weg: het dorp zoekt geen wachthuis meer.');
  assert.equal(T.oproepVoor(D, 'wachthuis'), null);
  T.doeOproep(D, 'steengroeve');
  T.zetVoorraad(D, 'goud', 2);
  const raad = T.RADEN.find((r) => r.id === 'oproep');
  assert.equal(raad.als(D), false, 'de eerste week niet');
  S.kalender.dag = 1 + T.RAAD_INSTELLINGEN.oproepNa + 0.5;
  assert.equal(raad.als(D), true);
  assert.match(raad.tekst(D), /^Je oproep voor een steengroeve hangt op het plein, maar het dorp mist 7 goud: /);
});

test('na een ja vraagt niemand hetzelfde de eerste naJa dagen weer: geen jager elke vier dagen', () => {
  const S = gehucht();
  const D = S.dorp;
  nacht(S, 1);
  assert.equal(lopend(D).bouw.soort, 'houthakker');
  zeg(S, 0);
  const houthakker = D.gebouwen.find((g) => g.soort === 'houthakker');
  houthakker.klaar = true;
  D.gebouwen.splice(D.gebouwen.indexOf(houthakker), 1); // hij brandt af: nu mist het dorp er weer een
  for (let dag = 2; dag < 1 + T.VERZOEKEN_INSTELLINGEN.naJa; dag++) {
    D.verzoeken.volgende = 0;
    if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
    T.beginBouwverzoek(D, dag);
    assert.ok(!lopend(D) || lopend(D).bouw.soort !== 'houthakker', `op dag ${dag} vraagt niemand weer een houthakker`);
  }
  if (lopend(D)) T.voorvalBeantwoord(D, lopend(D).id);
  D.verzoeken.volgende = 0;
  assert.ok(T.beginBouwverzoek(D, 1 + T.VERZOEKEN_INSTELLINGEN.naJa));
  assert.equal(lopend(D).bouw.soort, 'houthakker', 'daarna wel weer');
});

// Een looppad om elk nieuw gebouw (Marcel, 3 okt: "Er moet wel altijd een looppad zijn, het liefste van 3 tegels breed",
// met een kapel die klem stond tussen twee huizen, met struiken voor de deur; en: "Nee ik wil 3 tegels"; js/gebouwen.js).
test('een looppad: drie tegels vrij rondom elk nieuw gebouw, ook waar een inwoner de plek kiest', () => {
  const S = gehucht();
  const D = S.dorp;
  D.trede = 'dorp';
  const n = T.GEBOUWEN_INSTELLINGEN.looppad;
  assert.equal(n, 3);
  const voet = T.gebouwVoet('bakkerij', T.volgendeTekening(D, 'bakkerij'));
  const rect = (p) => ({ x: p.x, y: p.y, b: voet.b, h: voet.h });
  // Eén of twee tegels van een huis af mag niet: dan zegt het bouwen dat er een looppad omheen moet.
  const huis = D.gebouwen.find((g) => g.soort === 'hut');
  let teDicht = null;
  for (const g of D.gebouwen.filter((x) => x.soort === 'hut' || x.soort === 'boerderij')) {
    const v = T.voetVanGebouw(g);
    for (let y = v.y - voet.h - 2; y <= v.y + v.h + 2 && !teDicht; y++) {
      for (let x = v.x - voet.b - 2; x <= v.x + v.b + 2 && !teDicht; x++) {
        const tussen = Math.max(v.x - (x + voet.b), x - (v.x + v.b), v.y - (y + voet.h), y - (v.y + v.h));
        if (tussen >= 1 && tussen <= 2 && /looppad omheen: drie tegels vrij/.test(T.waaromPastHetNiet(D, 'bakkerij', x, y) || '')) teDicht = { x, y };
      }
    }
  }
  assert.ok(teDicht, 'een of twee tegels van een huis af: er moet een looppad omheen');
  // Wie de plek kiest voor een verzoek: altijd drie tegels rondom.
  for (const g of D.gebouwen.filter((x) => x.soort === 'hut').slice(0, 4)) {
    const deur = T.deurVan(D.wereld, g);
    const p = T.plekVoor(D, 'bakkerij', deur);
    assert.ok(p && T.looppadOm(D, rect(p), n), 'drie tegels rondom de bakkerij');
  }
  const kapel = T.plekVoor(D, 'kapel', T.deurVan(D.wereld, huis));
  const kv = T.gebouwVoet('kapel', T.volgendeTekening(D, 'kapel'));
  assert.ok(kapel && T.looppadOm(D, { x: kapel.x, y: kapel.y, b: kv.b, h: kv.h }, n), 'en rondom de kapel');
});
