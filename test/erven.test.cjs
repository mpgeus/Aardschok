// De erven (js/erven.js; werklijst vraag 52, Marcel, 28 sep: "A ja B ja C ja D ja"): bouwgrond die je
// aanwijst, een gezin dat er zelf zijn hut op zet met hout uit de voorraad, en een hut die doorgroeit
// tot een huis dat in het erf past.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Deze toetsen gaan over het spel waarin jij bouwt (de spelregel "Wie bouwt" op "Jij bouwt"; werklijst vraag 103):
// het bouwmenu zoals jij bouwt. Hoe het gaat als de mensen het vragen, staat in test/verzoeken.test.cjs.
T.zetOptie('wieBouwt', 'jij');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function vangBerichten() {
  const lijst = [];
  T.ui.bericht = (t) => lijst.push(t);
  return lijst;
}

// Een lege wereld, zoals in test/behoeften.test.cjs: een los object dat als dorp (D) dient.
function leeg(b = 40, h = 40) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('vloer'));
  return {
    wereld: { b, h, tegels, voorwerpen: [] },
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, kalender: { dag: 0 }, behoeften: T.nieuweBehoeften(),
  };
}

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

// Het dorp vol: in elk huis zoveel mensen als er plaats is.
function vol(S) {
  T.wijzigBevolking(S.dorp, S.dorp.woonruimte - S.dorp.bevolking, 'groei');
  assert.equal(S.dorp.bevolking, S.dorp.woonruimte);
}

// De plek voor een erf die het dichtst bij het plein ligt; de toets zoekt hem zelf, zodat hij met de
// kaart meegaat.
function erfPlek(S) {
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  return plekken.find((p) => !T.waaromPastErfNiet(S.dorp, p.x, p.y)) || null;
}

// Een tegel met een zandpad die geen veld, plein of iets vasts is.
function padTegel(w) {
  for (let y = 0; y < w.tegels.length; y++) {
    for (let x = 0; x < w.tegels[0].length; x++) {
      if (T.opPad(w, x, y) && !T.veldOp(w, x, y) && !T.opHetPlein(w, x, y) && !T.isVast(w, x, y)) return { x, y };
    }
  }
  return null;
}

// Liggen de voet van deze tekening en de tegel voor zijn deur, met de hoek van het gebouw, binnen het erf?
function binnenErf(g, soort, tekening) {
  const erf = g.erf;
  const voet = T.gebouwVoet(soort, tekening);
  const opz = T.opzoekTegelNaam(tekening);
  const deur = opz && opz.eig && opz.eig.deur ? opz.eig.deur : [Math.floor(voet.b / 2), voet.h];
  const binnen = (x, y) => x >= erf.x && y >= erf.y && x < erf.x + erf.b && y < erf.y + erf.h;
  assert.ok(binnen(g.x, g.y) && binnen(g.x + voet.b - 1, g.y + voet.h - 1), `${tekening} past niet in het erf`);
  assert.ok(binnen(g.x + deur[0], g.y + deur[1]), `de deur van ${tekening} ligt buiten het erf`);
}

test('een erf ligt op vrije grond: niet op het plein, een veld, een pad of een ander erf', () => {
  const S = gehucht();
  const w = S.wereld;
  const plein = T.pleinVan(w);
  assert.equal(T.waaromPastErfNiet(S.dorp, plein.x - 2, plein.y - 2), 'Op het plein wordt niet gebouwd.');
  const a = w.akkers[0];
  assert.equal(T.waaromNietOpDezeGrond(S.dorp, a.x + 1, a.y + 1), 'Daar ligt een veld.');
  const pad = padTegel(w);
  assert.ok(pad, 'het gehucht heeft een zandpad');
  assert.equal(T.waaromNietOpDezeGrond(S.dorp, pad.x, pad.y), 'Daar loopt een pad.');

  const plek = erfPlek(S);
  assert.ok(plek, 'er is plaats voor een erf');
  const r = T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  assert.equal(r.gelukt, true);
  assert.equal(S.dorp.erven.length, 1);
  assert.equal(T.erfOp(S.dorp, plek.x + 9, plek.y + 9), S.dorp.erven[0]);
  assert.equal(T.waaromPastErfNiet(S.dorp, plek.x, plek.y), 'Daar ligt een erf.');
  assert.equal(T.waaromNietOpDezeGrond(S.dorp, plek.x + 3, plek.y + 3), 'Daar ligt een erf.');
});

test('een erf is land: de grond blijft begaanbaar, en er komt geen gebouw op', () => {
  const D = leeg();
  assert.equal(T.legErfAan(D, 5, 5).gelukt, true);
  assert.equal(T.isVast(D.wereld, 7, 7), false);
  assert.equal(D.wereld.voorwerpen.length, 0);
  assert.equal(D.gebouwen.length, 0);
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  const r = T.plaatsGebouw(D, 'houthakker', 8, 8);
  assert.equal(r.gelukt, false);
  assert.equal(r.reden, 'Daar ligt een erf.');
});

test('een gebouw komt niet meer op een akker of een pad', () => {
  const S = gehucht();
  const a = S.wereld.akkers[0];
  assert.equal(T.waaromPastHetNiet(S.dorp, 'put', a.x + 1, a.y + 1), 'Daar ligt een veld.');
  const pad = padTegel(S.wereld);
  const reden = T.waaromPastHetNiet(S.dorp, 'put', pad.x, pad.y);
  assert.ok(reden === 'Daar loopt een pad.' || reden === 'Daar past het niet.', reden);
});

test('het bouwmenu: het erf als het dorp zelf bouwt, anders de hut en het huis', () => {
  const S = { trede: 'gehucht' };
  const was = T.ERVEN_INSTELLINGEN.dorpBouwtZelf;
  try {
    T.ERVEN_INSTELLINGEN.dorpBouwtZelf = true;
    assert.equal(T.inBouwmenu(S, 'erf'), true);
    assert.equal(T.inBouwmenu(S, 'hut'), false);
    assert.equal(T.inBouwmenu(S, 'huis'), false);
    assert.equal(T.inBouwmenu(S, 'houthakker'), true);
    assert.equal(T.inBouwmenu(S, 'akker'), false, 'een akker heeft een eigen manier van neerzetten');
    T.ERVEN_INSTELLINGEN.dorpBouwtZelf = false;
    assert.equal(T.inBouwmenu(S, 'erf'), false);
    assert.equal(T.inBouwmenu(S, 'hut'), true);
    assert.equal(T.inBouwmenu(S, 'huis'), true);
  } finally {
    T.ERVEN_INSTELLINGEN.dorpBouwtZelf = was;
  }
  // De spelregel "Huizen" zet het, en het dorp bouwt standaard zelf (Marcel, 28 sep).
  const o = T.OPTIES.find((x) => x.id === 'huizen');
  assert.equal(o.standaard, 'dorpBouwtZelf');
  assert.deepEqual(o.keuzes.map((k) => k.zet['ERVEN_INSTELLINGEN.dorpBouwtZelf']), [true, false]);
});

test('een vol dorp met een vrij erf: een gezin zet er zijn hut op, woont erin, en het hout gaat eraf', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  const hout = S.dorp.voorraad.hout;
  const voor = S.dorp.bevolking;
  const hut = T.gezinZoektEenErf(S.dorp);
  assert.ok(hut, 'er komt een hut');
  assert.equal(hut.soort, 'hut');
  assert.equal(hut.erf, S.dorp.erven[0]);
  assert.equal(S.dorp.erven[0].hut, hut);
  assert.ok(S.dorp.gebouwen.includes(hut));
  assert.equal(S.dorp.voorraad.hout, hout - T.GEBOUWEN.hut.kosten.hout);
  assert.equal(hut.wachtOpHout, false);
  assert.equal(hut.klaarOp, Math.floor(S.kalender.dag) + T.GEBOUWEN.hut.bouwtijd);
  assert.equal(hut.klaar, false);
  // Het gezin woont al in de hut die nog oprijst, en zijn plaats telt.
  const gezin = S.dorp.bewoners.mensen.filter((p) => p.huis === hut);
  assert.equal(gezin.length, T.GEBOUWEN.hut.woonruimte);
  assert.equal(S.dorp.bevolking, voor + gezin.length);
  assert.equal(S.dorp.woonruimte, T.telWoonruimte(S.dorp));
  assert.ok(S.dorp.bevolking <= S.dorp.woonruimte);
  assert.match(S.dorp.bewoners.komen[S.dorp.bewoners.komen.length - 1].aankomst.tekst, /Ze zetten een hut op hun erf/);
  // De hut en het huis waar hij in doorgroeit, passen allebei in het erf, met hun deur.
  binnenErf(hut, 'hut', hut.tekening);
  binnenErf(hut, 'huis', hut.wordtTekening);
});

test('zonder vrij erf zegt een vol dorp dat er geen plaats is', () => {
  const S = gehucht();
  vol(S);
  const berichten = vangBerichten();
  assert.equal(T.gezinZoektEenErf(S.dorp), null);
  assert.ok(berichten.some((t) => /geen plaats\. Wijs een erf aan/.test(t)), berichten.join(' | '));
  assert.equal(S.dorp.bevolking, S.dorp.woonruimte);
});

test('op een groeidag neemt een gezin een vrij erf als het dorp vol is', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  const drempel = T.BEHOEFTEN_INSTELLINGEN.groeiDrempel;
  T.BEHOEFTEN_INSTELLINGEN.groeiDrempel = 0; // hoe tevreden het gehucht op dag 20 is, doet hier niet ter zake
  try {
    T.tikGebouwenDag(S.dorp, T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  } finally {
    T.BEHOEFTEN_INSTELLINGEN.groeiDrempel = drempel;
  }
  assert.ok(S.dorp.erven[0].hut, 'het erf is genomen');
  assert.equal(S.dorp.bewoners.mensen.filter((p) => p.huis === S.dorp.erven[0].hut).length, T.GEBOUWEN.hut.woonruimte);
});

test('waarom er geen gezin komt: geen plaats, te weinig graan, of niet tevreden genoeg', () => {
  const S = gehucht();
  S.dorp.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.7 });
  assert.deepEqual(T.waaromGeenGezin(S.dorp), [], 'in het begin is er plaats, graan en tevredenheid');
  vol(S);
  assert.deepEqual(T.waaromGeenGezin(S.dorp), ['plaats']);
  // Een vrij erf is plaats: daar zet een gezin zijn hut op.
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  assert.deepEqual(T.waaromGeenGezin(S.dorp), []);
  // Wat de groei verder vraagt: een buffer graan, en een dorp dat tevreden genoeg is.
  T.zetVoorraad(S.dorp, 'graan', T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei - 1);
  S.dorp.behoeften.tevredenheid = T.BEHOEFTEN_INSTELLINGEN.groeiDrempel - 0.01;
  assert.deepEqual(T.waaromGeenGezin(S.dorp), ['graan', 'tevreden']);
  // En zo doet de groei het ook: op een groeidag komt er dan niemand, en het erf blijft vrij.
  const voor = S.dorp.bevolking;
  T.tikGebouwenDag(S.dorp, T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  assert.equal(S.dorp.bevolking, voor);
  assert.equal(S.dorp.erven[0].hut, null);
});

// De dag (vanaf 1 lentemaand, dag 0) van een datum in het eerste jaar, zoals in test/raad.test.cjs.
function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(`geen ${dagVanMaand} ${maand}`);
}

test('een gezin wacht op de winter: haalt het hout of het eten hem niet, dan komt er niemand (vraag 59, B)', () => {
  const herfst = dagVan('herfstmaand', 1);
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  const groeidag = Math.ceil(herfst / n) * n; // de eerste groeidag vanaf 1 herfstmaand
  // Een gehucht met eten genoeg en zoveel hout; geeft hoeveel mensen er op de groeidag bij kwamen.
  function groei(hout) {
    const S = gehucht();
    S.dorp.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.7 });
    T.zetVoorraad(S.dorp, 'graan', 5000);
    T.zetVoorraad(S.dorp, 'hout', hout);
    S.kalender.dag = groeidag;
    const voor = S.dorp.bevolking;
    T.tikGebouwenDag(S.dorp, groeidag);
    return S.dorp.bevolking - voor;
  }
  // In de lente is de winter nog ver, en de dag vóór 1 herfstmaand ook: dan telt het niet.
  const S = gehucht();
  T.zetVoorraad(S.dorp, 'graan', 5000);
  T.zetVoorraad(S.dorp, 'hout', 0);
  assert.deepEqual(T.watDeWinterNietHaalt(S.dorp, 10), []);
  assert.deepEqual(T.watDeWinterNietHaalt(S.dorp, herfst - 1), []);
  // Vanaf 1 herfstmaand wel: zonder hout haalt het de winter niet, en dat zegt de groei.
  assert.deepEqual(T.watDeWinterNietHaalt(S.dorp, herfst), ['hout']);
  assert.ok(T.waaromGeenGezin(S.dorp, herfst).includes('winter'));
  T.zetVoorraad(S.dorp, 'graan', 0);
  assert.deepEqual(T.watDeWinterNietHaalt(S.dorp, herfst), ['hout', 'eten']);
  // Op de groeidag: met hout genoeg komt er een gezin, zonder hout niet.
  assert.equal(groei(5000), T.GEBOUWEN_INSTELLINGEN.gezinGrootte, 'met hout genoeg komt het gezin');
  assert.equal(groei(0), 0, 'zonder hout wacht het');
  // Met de spelregel Groei op Altijd komt het toch, zoals vóór 1 okt.
  T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = false;
  try {
    assert.ok(!T.waaromGeenGezin(S.dorp, herfst).includes('winter'));
    assert.equal(groei(0), T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
  } finally {
    T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = true;
  }
});

test('het volgende gezin: op de eerstvolgende groeidag na vandaag, met Vreemden welkom vaker', () => {
  const S = gehucht();
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  S.kalender.dag = 0;
  assert.equal(T.volgendeGezinDag(S.dorp), n);
  S.kalender.dag = n + 0.5; // die dag is al geteld
  assert.equal(T.volgendeGezinDag(S.dorp), 2 * n);
  T.zetWet(S.dorp, 'vreemden', 'aangenomen');
  assert.equal(T.volgendeGezinDag(S.dorp), n + T.gezinDagen(S.dorp));
  assert.ok(T.gezinDagen(S.dorp) < n);
});

test('zonder hout wacht de bouwplaats, en hij begint zodra het hout er is', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  T.zetVoorraad(S.dorp, 'hout', 3);
  const berichten = vangBerichten();
  const hut = T.gezinZoektEenErf(S.dorp);
  assert.equal(hut.wachtOpHout, true);
  assert.equal(hut.klaarOp, null);
  assert.equal(S.dorp.voorraad.hout, 3);
  assert.ok(berichten.some((t) => /wacht op hout voor zijn hut/.test(t)), berichten.join(' | '));
  // Een bouwplaats die niet begon, staat in zijn eerste fase, en komt niet klaar.
  assert.equal(T.bouwFaseIndex(5, hut.voorwerp.klaarOp, T.GEBOUWEN.hut.bouwtijd), 0);
  T.tikErvenDag(S.dorp);
  assert.equal(hut.wachtOpHout, true);

  T.zetVoorraad(S.dorp, 'hout', 20);
  S.kalender.dag = 10;
  T.tikErvenDag(S.dorp);
  assert.equal(hut.wachtOpHout, false);
  assert.equal(hut.klaarOp, 10 + T.GEBOUWEN.hut.bouwtijd);
  assert.equal(hut.voorwerp.klaarOp, hut.klaarOp);
  assert.equal(S.dorp.voorraad.hout, 20 - T.GEBOUWEN.hut.kosten.hout);
});

test('de hut groeit door tot het huis dat bij het erf gekozen is, binnen het erf', () => {
  const D = leeg();
  T.legErfAan(D, 10, 10);
  T.zetVoorraad(D, 'hout', T.GEBOUWEN.hut.kosten.hout);
  const hut = T.gezinZoektEenErf(D);
  const gekozen = hut.wordtTekening;
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) T.tikGebouwenDag(D, d);
  assert.equal(hut.klaar, true);

  // Tevreden genoeg om door te groeien: eten genoeg en een kapel (zoals test/behoeften.test.cjs).
  T.zetVoorraad(D, 'graan', 100000);
  T.zetVoorraad(D, 'groente', 1000);
  T.zetVoorraad(D, 'vis', 1000);
  T.zetVoorraad(D, 'vlees', 1000);
  D.gebouwen.push({ soort: 'kapel', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  let dag = T.GEBOUWEN.hut.bouwtijd;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikGebouwenDag(D, ++dag);
  assert.equal(hut.soort, 'huis');
  assert.equal(hut.tekening, gekozen);
  assert.equal(hut.wordtTekening, undefined);
  binnenErf(hut, 'huis', hut.tekening);
});

test('wie zijn hut bouwt, is er overdag, en na het doorgroeien gaat hij naar de nieuwe deur', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  const hut = T.gezinZoektEenErf(S.dorp);
  const p = S.dorp.bewoners.mensen.find((m) => m.huis === hut && m.leeftijd === 'volwassen');
  delete p.komt;
  const e = { bewoner: p, thuis: T.deurVan(S.wereld, hut) };
  p.wezen = e;
  S.kalender.dag = Math.floor(S.kalender.dag) + 12 / 24; // midden op de dag
  const a = T.dagAnker(S.dorp, e);
  assert.deepEqual({ x: a.x, y: a.y }, e.thuis, 'overdag bij zijn bouwplaats');

  // De hut wordt het gekozen huis, en de deur verhuist mee (T.huisVeranderd, js/bewoners.js).
  hut.tekening = hut.wordtTekening;
  hut.voet = T.gebouwVoet('huis', hut.tekening);
  hut.soort = 'huis';
  T.huisVeranderd(S.dorp, hut);
  assert.deepEqual(e.thuis, T.deurVan(S.wereld, hut));
});

test('een vrij erf heeft vier paaltjes en kan weer weg; een bewoond erf niet', () => {
  const D = leeg();
  const { erf } = T.legErfAan(D, 5, 5);
  assert.deepEqual(T.paaltjesVan(erf), [{ x: 5, y: 5 }, { x: 14, y: 5 }, { x: 5, y: 14 }, { x: 14, y: 14 }]);
  assert.equal(T.haalErfWeg(D, erf).gelukt, true);
  assert.equal(D.erven.length, 0);

  const { erf: bewoond } = T.legErfAan(D, 5, 5);
  T.zetVoorraad(D, 'hout', T.GEBOUWEN.hut.kosten.hout);
  T.gezinZoektEenErf(D);
  assert.deepEqual(T.paaltjesVan(bewoond), []);
  assert.equal(T.haalErfWeg(D, bewoond).gelukt, false);
  assert.equal(D.erven.length, 1);
});

test('twee erven: het tweede gezin neemt het erf dat nog vrij is', () => {
  const D = leeg(60, 40);
  T.legErfAan(D, 2, 2);
  T.legErfAan(D, 30, 2);
  T.zetVoorraad(D, 'hout', 100);
  const eerste = T.gezinZoektEenErf(D);
  const tweede = T.gezinZoektEenErf(D);
  assert.ok(eerste && tweede);
  assert.notEqual(eerste.erf, tweede.erf);
  assert.equal(T.vrijeErven(D).length, 0);
  assert.equal(T.gezinZoektEenErf(D), null, 'daarna is er geen plaats meer');
});

test('bewaren en laden houdt de erven, en de hut die naar zijn erf wijst', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  const hut = T.gezinZoektEenErf(S.dorp);
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  assert.equal(S2.dorp.erven.length, 1);
  const hut2 = S2.dorp.erven[0].hut;
  assert.ok(hut2, 'de hut is er nog');
  assert.equal(hut2.erf, S2.dorp.erven[0]);
  assert.ok(S2.dorp.gebouwen.includes(hut2));
  assert.equal(hut2.wordtTekening, hut.wordtTekening);
  assert.ok(S2.dorp.bewoners.mensen.some((p) => p.huis === hut2), 'het gezin woont er nog');
});

// Een looppad om het huis op een erf, zoals om elk gebouw (js/gebouwen.js; Marcel, 3 okt: "Ja" op drie tegels ook hier).
test('het huis op een erf krijgt drie tegels looppad rondom, en wat later komt, blijft ervan weg', () => {
  const D = leeg();
  const n = T.GEBOUWEN_INSTELLINGEN.looppad;
  // Een hut die er al staat, met een erf er recht naast (ten oosten): het huis komt niet tegen de hut aan, maar drie
  // tegels ervan af, en niet meer in de noordwesthoek.
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 100);
  // Een hut met zijn deur aan de voorkant (huizen/hut1): de tekening wordt geloot (T.volgendeTekening), en hut2 heeft
  // zijn deur aan de oostkant, waar het erf hieronder komt. Dan zegt het erf terecht "Daar is een deur."
  D.volgendeTekening = { hut: 'huizen/hut1' };
  const hut = T.plaatsGebouw(D, 'hut', 5, 5);
  assert.equal(hut.gelukt, true, hut.reden);
  const v = T.voetVanGebouw(hut.instantie);
  const r = T.legErfAan(D, v.x + v.b, v.y);
  assert.equal(r.gelukt, true, r.reden);
  const p = r.erf.plan;
  assert.ok(p, 'het erf weet waar het huis komt');
  assert.ok(r.erf.x + p.dx - (v.x + v.b) >= n, 'drie tegels tussen de hut en het huis');
  // Een gebouw dat later komt, blijft drie tegels van de plek van het huis, ook al staat het huis er nog niet.
  const huis = { x: r.erf.x + p.dx, y: r.erf.y + p.dy, b: p.b, h: p.h };
  let teDicht = 0;
  for (let y = huis.y + huis.h; y < huis.y + huis.h + n + 4; y++) {
    if (T.gebouwPast(D, 'put', huis.x, y)) {
      assert.ok(y - (huis.y + huis.h) >= n, `een put op ${huis.x},${y} staat te dicht bij het huis`);
    } else teDicht++;
  }
  assert.ok(teDicht > 0, 'vlak voor het huis mag geen put');
  // Twee erven naast elkaar mogen: hun huizen houden vanzelf vier tegels tussen zich.
  const naast = T.legErfAan(D, r.erf.x + r.erf.b, r.erf.y);
  assert.equal(naast.gelukt, true, naast.reden);
  // En zet het gezin er zijn hut op, dan komt die op de plek uit het plan.
  const gezin = T.zetHutOpErf(D, naast.erf);
  assert.ok(gezin);
  assert.equal(gezin.x, naast.erf.x + naast.erf.plan.dx);
  assert.equal(gezin.y, naast.erf.y + naast.erf.plan.dy);
});

// Een erf dat vrij heet, maar waar geen hut meer op past (werklijst vraag 110, f): in de speeltest van vier jaar groeide op
// 62707 een buurhuis in het looppad om de plek van het huis, en kwam er twee en een half jaar geen gezin, want de groei en
// de raad zagen een vrij erf. Een muur vlak buiten het erf, rondom: het huis is groter dan het erf min zijn looppad, dus
// waar het ook komt, zijn looppad komt erbuiten, zoals bij dat buurhuis.
function zetMuurOm(w, erf) {
  for (let x = erf.x - 1; x <= erf.x + erf.b; x++) {
    w.tegels[erf.y - 1][x] = 'muur';
    w.tegels[erf.y + erf.h][x] = 'muur';
  }
  for (let y = erf.y - 1; y <= erf.y + erf.h; y++) {
    w.tegels[y][erf.x - 1] = 'muur';
    w.tegels[y][erf.x + erf.b] = 'muur';
  }
  T.kaartVeranderd(w); // zoals elke regel die een tegel verandert (js/wereld.js)
}

test('een vrij erf waar geen hut meer op past, is geen plaats: een gezin neemt een ander erf (vraag 110, f)', () => {
  const D = leeg(60, 40);
  const { erf } = T.legErfAan(D, 10, 10);
  T.zetVoorraad(D, 'hout', 100);
  assert.equal(T.hutPastOpErf(D, erf), true);
  zetMuurOm(D.wereld, erf);
  assert.equal(T.hutPastOpErf(D, erf), false);
  assert.deepEqual(T.vrijeErven(D), [erf], 'het heet nog vrij: er staat geen hut op');
  assert.deepEqual(T.bruikbareErven(D), []);
  assert.equal(T.kanEenErfNemen(D), false);
  const berichten = vangBerichten();
  assert.equal(T.gezinZoektEenErf(D), null);
  assert.ok(berichten.some((t) => /geen plaats\. Wijs een erf aan/.test(t)), berichten.join(' | '));
  // Wijs je een ander erf aan, dan neemt het gezin dat.
  const { erf: ander } = T.legErfAan(D, 35, 10);
  assert.equal(T.kanEenErfNemen(D), true);
  const hut = T.gezinZoektEenErf(D);
  assert.ok(hut, 'er komt een hut');
  assert.equal(hut.erf, ander);
  assert.equal(erf.hut, null);
});

test('een vol dorp met alleen een erf waar geen hut meer op past: de groei zegt dat er geen plaats is', () => {
  const S = gehucht();
  S.dorp.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.7 });
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  assert.deepEqual(T.waaromGeenGezin(S.dorp), []);
  zetMuurOm(S.dorp.wereld, S.dorp.erven[0]);
  assert.deepEqual(T.waaromGeenGezin(S.dorp), ['plaats']);
});

test('de grond van een erf: het erf zelf, en het looppad om de plek van zijn huis (vraag 110, f)', () => {
  const D = leeg(60, 40);
  const { erf } = T.legErfAan(D, 20, 10);
  const p = erf.plan;
  const n = T.GEBOUWEN_INSTELLINGEN.looppad;
  assert.equal(T.opDeGrondVanEenErf(D, erf.x + erf.b - 1, erf.y + erf.h - 1), true, 'op het erf');
  assert.equal(T.opDeGrondVanEenErf(D, erf.x + erf.b - 1, erf.y + erf.h - 1, erf), false, 'behalve dit erf');
  // Het looppad om het huis komt aan een kant buiten het erf: daar is het ook de grond van het erf.
  const west = erf.x + p.dx - n;
  const noord = erf.y + p.dy - n;
  if (west < erf.x) assert.equal(T.opDeGrondVanEenErf(D, west, erf.y + p.dy), true, 'in het looppad, ten westen');
  if (noord < erf.y) assert.equal(T.opDeGrondVanEenErf(D, erf.x + p.dx, noord), true, 'in het looppad, ten noorden');
  assert.ok(west < erf.x || noord < erf.y, 'het looppad komt ergens buiten het erf');
  // Een tegel verder is het gewone grond.
  assert.equal(T.opDeGrondVanEenErf(D, Math.min(west, erf.x) - 1, erf.y + p.dy), false);
});

test('hoe dicht de erven ook liggen, elk huis houdt een plek voor een put (werklijst vraag 117, 2d)', () => {
  // Zoals de bouwer van de speeltest: steeds het eerste erf dat mag, zo dicht mogelijk op elkaar. Zonder deze regel bleven
  // er op het ontworpen gehucht drie hutten zonder plek voor een put over; op het eiland van 73425 bleef zo een huis twee
  // jaar zonder put, en won het dorp nooit (Marcel, 8 okt: "A ja").
  const S = gehucht();
  const D = S.dorp;
  const w = D.wereld;
  const redenen = [];
  for (let ronde = 0; ronde < 40; ronde++) {
    let gelegd = false;
    for (let y = 0; y < w.h && !gelegd; y += 2) {
      for (let x = 0; x < w.b && !gelegd; x += 2) {
        const r = T.waaromPastErfNiet(D, x, y);
        if (r && /put/.test(r)) redenen.push(r);
        if (!r) gelegd = T.plaatsGebouw(D, 'erf', x, y).gelukt;
      }
    }
    if (!gelegd) break;
    for (const h of T.kringGrond(D, 'put').zonder) assert.ok(h.plekken.length > 0, `${h.wie} heeft geen plek meer voor een put`);
  }
  assert.ok(D.erven.length >= 10, `zoveel erven: ${D.erven.length}`);
  assert.ok(redenen.some((r) => r.startsWith('Dan kan de hut op een ander erf straks geen put meer krijgen')), 'een erf dat de laatste plek nam, mocht niet');
});

test('het huis van, de hut van: het lidwoord bij wie er woont (T.huisVan)', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.match(T.huisVan(D, D.gebouwen.find((g) => g.soort === 'huis')), /^het huis van /);
  assert.match(T.huisVan(D, D.gebouwen.find((g) => g.soort === 'hut')), /^de hut van /);
  assert.match(T.huisVan(D, D.gebouwen.find((g) => g.soort === 'boerderij')), /^de boerderij van /);
});

test('een hut op een erf telt bij de put met het huis dat hij wordt (werklijst vraag 117, 2d)', () => {
  // Op het eiland van 73425 groeide een hut met een put binnen zijn kring tot een huis waarvan het midden net buiten de
  // kring viel; toen lagen er al erven om hem heen, en was er geen plek meer voor een put.
  const S = gehucht();
  vol(S);
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y += 2) {
    for (let x = 0; x < S.wereld.tegels[0].length; x += 2) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => b.d - a.d); // het verst van het plein, en van de put daar
  const plek = plekken.find((p) => !T.waaromPastErfNiet(S.dorp, p.x, p.y));
  assert.ok(T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y).gelukt);
  const hut = T.gezinZoektEenErf(S.dorp);
  const huis = T.huisPlekVan(hut.erf);
  const voet = T.voetVanGebouw(hut);
  assert.ok(huis.b * huis.h > voet.b * voet.h, 'het huis is groter dan de hut');
  const k = T.kringGrond(S.dorp, 'put');
  assert.ok(!k.er.some((p) => T.inDeKring(huis, p, k.straal)), 'geen put binnen de kring van het huis dat hij wordt');
  const zelf = k.zonder.find((h) => h.wie === T.huisVan(S.dorp, hut));
  assert.ok(zelf, 'de hut mist een put');
  assert.deepEqual(zelf.r, huis);
  assert.ok(zelf.plekken.length > 0, 'en er is een plek voor een');
});
