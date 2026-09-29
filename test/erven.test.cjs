// De erven (js/erven.js; werklijst vraag 52, Marcel, 28 sep: "A ja B ja C ja D ja"): bouwgrond die je
// aanwijst, een gezin dat er zelf zijn hut op zet met hout uit de voorraad, en een hut die doorgroeit
// tot een huis dat in het erf past.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function vangBerichten() {
  const lijst = [];
  T.ui.bericht = (t) => lijst.push(t);
  return lijst;
}

// Een lege wereld, zoals in test/behoeften.test.cjs.
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
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  return S;
}

// Het dorp vol: in elk huis zoveel mensen als er plaats is.
function vol(S) {
  T.wijzigBevolking(S, S.woonruimte - S.bevolking, 'groei');
  assert.equal(S.bevolking, S.woonruimte);
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
  return plekken.find((p) => !T.waaromPastErfNiet(S, p.x, p.y)) || null;
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
  assert.equal(T.waaromPastErfNiet(S, plein.x - 2, plein.y - 2), 'Op het plein wordt niet gebouwd.');
  const a = w.akkers[0];
  assert.equal(T.waaromNietOpDezeGrond(S, a.x + 1, a.y + 1), 'Daar ligt een veld.');
  const pad = padTegel(w);
  assert.ok(pad, 'het gehucht heeft een zandpad');
  assert.equal(T.waaromNietOpDezeGrond(S, pad.x, pad.y), 'Daar loopt een pad.');

  const plek = erfPlek(S);
  assert.ok(plek, 'er is plaats voor een erf');
  const r = T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  assert.equal(r.gelukt, true);
  assert.equal(S.erven.length, 1);
  assert.equal(T.erfOp(S, plek.x + 9, plek.y + 9), S.erven[0]);
  assert.equal(T.waaromPastErfNiet(S, plek.x, plek.y), 'Daar ligt een erf.');
  assert.equal(T.waaromNietOpDezeGrond(S, plek.x + 3, plek.y + 3), 'Daar ligt een erf.');
});

test('een erf is land: de grond blijft begaanbaar, en er komt geen gebouw op', () => {
  const S = leeg();
  assert.equal(T.legErfAan(S, 5, 5).gelukt, true);
  assert.equal(T.isVast(S.wereld, 7, 7), false);
  assert.equal(S.wereld.voorwerpen.length, 0);
  assert.equal(S.gebouwen.length, 0);
  T.zetVoorraad(S, 'hout', 100);
  T.zetVoorraad(S, 'goud', 100);
  const r = T.plaatsGebouw(S, 'houthakker', 8, 8);
  assert.equal(r.gelukt, false);
  assert.equal(r.reden, 'Daar ligt een erf.');
});

test('een gebouw komt niet meer op een akker of een pad', () => {
  const S = gehucht();
  const a = S.wereld.akkers[0];
  assert.equal(T.waaromPastHetNiet(S, 'put', a.x + 1, a.y + 1), 'Daar ligt een veld.');
  const pad = padTegel(S.wereld);
  const reden = T.waaromPastHetNiet(S, 'put', pad.x, pad.y);
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
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  const hout = S.voorraad.hout;
  const voor = S.bevolking;
  const hut = T.gezinZoektEenErf(S);
  assert.ok(hut, 'er komt een hut');
  assert.equal(hut.soort, 'hut');
  assert.equal(hut.erf, S.erven[0]);
  assert.equal(S.erven[0].hut, hut);
  assert.ok(S.gebouwen.includes(hut));
  assert.equal(S.voorraad.hout, hout - T.GEBOUWEN.hut.kosten.hout);
  assert.equal(hut.wachtOpHout, false);
  assert.equal(hut.klaarOp, Math.floor(S.kalender.dag) + T.GEBOUWEN.hut.bouwtijd);
  assert.equal(hut.klaar, false);
  // Het gezin woont al in de hut die nog oprijst, en zijn plaats telt.
  const gezin = S.bewoners.mensen.filter((p) => p.huis === hut);
  assert.equal(gezin.length, T.GEBOUWEN.hut.woonruimte);
  assert.equal(S.bevolking, voor + gezin.length);
  assert.equal(S.woonruimte, T.telWoonruimte(S));
  assert.ok(S.bevolking <= S.woonruimte);
  assert.match(S.bewoners.komen[S.bewoners.komen.length - 1].aankomst.tekst, /Ze zetten een hut op hun erf/);
  // De hut en het huis waar hij in doorgroeit, passen allebei in het erf, met hun deur.
  binnenErf(hut, 'hut', hut.tekening);
  binnenErf(hut, 'huis', hut.wordtTekening);
});

test('zonder vrij erf zegt een vol dorp dat er geen plaats is', () => {
  const S = gehucht();
  vol(S);
  const berichten = vangBerichten();
  assert.equal(T.gezinZoektEenErf(S), null);
  assert.ok(berichten.some((t) => /geen plaats\. Wijs een erf aan/.test(t)), berichten.join(' | '));
  assert.equal(S.bevolking, S.woonruimte);
});

test('op een groeidag neemt een gezin een vrij erf als het dorp vol is', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  const drempel = T.BEHOEFTEN_INSTELLINGEN.groeiDrempel;
  T.BEHOEFTEN_INSTELLINGEN.groeiDrempel = 0; // hoe tevreden het gehucht op dag 20 is, doet hier niet ter zake
  try {
    T.tikGebouwenDag(S, T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  } finally {
    T.BEHOEFTEN_INSTELLINGEN.groeiDrempel = drempel;
  }
  assert.ok(S.erven[0].hut, 'het erf is genomen');
  assert.equal(S.bewoners.mensen.filter((p) => p.huis === S.erven[0].hut).length, T.GEBOUWEN.hut.woonruimte);
});

test('waarom er geen gezin komt: geen plaats, te weinig graan, of niet tevreden genoeg', () => {
  const S = gehucht();
  S.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.7 });
  assert.deepEqual(T.waaromGeenGezin(S), [], 'in het begin is er plaats, graan en tevredenheid');
  vol(S);
  assert.deepEqual(T.waaromGeenGezin(S), ['plaats']);
  // Een vrij erf is plaats: daar zet een gezin zijn hut op.
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  assert.deepEqual(T.waaromGeenGezin(S), []);
  // Wat de groei verder vraagt: een buffer graan, en een dorp dat tevreden genoeg is.
  T.zetVoorraad(S, 'graan', T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei - 1);
  S.behoeften.tevredenheid = T.BEHOEFTEN_INSTELLINGEN.groeiDrempel - 0.01;
  assert.deepEqual(T.waaromGeenGezin(S), ['graan', 'tevreden']);
  // En zo doet de groei het ook: op een groeidag komt er dan niemand, en het erf blijft vrij.
  const voor = S.bevolking;
  T.tikGebouwenDag(S, T.GEBOUWEN_INSTELLINGEN.gezinDagen);
  assert.equal(S.bevolking, voor);
  assert.equal(S.erven[0].hut, null);
});

test('het volgende gezin: op de eerstvolgende groeidag na vandaag, met Vreemden welkom vaker', () => {
  const S = gehucht();
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  S.kalender.dag = 0;
  assert.equal(T.volgendeGezinDag(S), n);
  S.kalender.dag = n + 0.5; // die dag is al geteld
  assert.equal(T.volgendeGezinDag(S), 2 * n);
  T.zetWet(S, 'vreemden', 'aangenomen');
  assert.equal(T.volgendeGezinDag(S), n + T.gezinDagen(S));
  assert.ok(T.gezinDagen(S) < n);
});

test('zonder hout wacht de bouwplaats, en hij begint zodra het hout er is', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  T.zetVoorraad(S, 'hout', 3);
  const berichten = vangBerichten();
  const hut = T.gezinZoektEenErf(S);
  assert.equal(hut.wachtOpHout, true);
  assert.equal(hut.klaarOp, null);
  assert.equal(S.voorraad.hout, 3);
  assert.ok(berichten.some((t) => /wacht op hout voor zijn hut/.test(t)), berichten.join(' | '));
  // Een bouwplaats die niet begon, staat in zijn eerste fase, en komt niet klaar.
  assert.equal(T.bouwFaseIndex(5, hut.voorwerp.klaarOp, T.GEBOUWEN.hut.bouwtijd), 0);
  T.tikErvenDag(S);
  assert.equal(hut.wachtOpHout, true);

  T.zetVoorraad(S, 'hout', 20);
  S.kalender.dag = 10;
  T.tikErvenDag(S);
  assert.equal(hut.wachtOpHout, false);
  assert.equal(hut.klaarOp, 10 + T.GEBOUWEN.hut.bouwtijd);
  assert.equal(hut.voorwerp.klaarOp, hut.klaarOp);
  assert.equal(S.voorraad.hout, 20 - T.GEBOUWEN.hut.kosten.hout);
});

test('de hut groeit door tot het huis dat bij het erf gekozen is, binnen het erf', () => {
  const S = leeg();
  T.legErfAan(S, 10, 10);
  T.zetVoorraad(S, 'hout', T.GEBOUWEN.hut.kosten.hout);
  const hut = T.gezinZoektEenErf(S);
  const gekozen = hut.wordtTekening;
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) T.tikGebouwenDag(S, d);
  assert.equal(hut.klaar, true);

  // Tevreden genoeg om door te groeien: eten genoeg en een kapel (zoals test/behoeften.test.cjs).
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'groente', 1000);
  T.zetVoorraad(S, 'vis', 1000);
  T.zetVoorraad(S, 'vlees', 1000);
  S.gebouwen.push({ soort: 'kapel', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  let dag = T.GEBOUWEN.hut.bouwtijd;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikGebouwenDag(S, ++dag);
  assert.equal(hut.soort, 'huis');
  assert.equal(hut.tekening, gekozen);
  assert.equal(hut.wordtTekening, undefined);
  binnenErf(hut, 'huis', hut.tekening);
});

test('wie zijn hut bouwt, is er overdag, en na het doorgroeien gaat hij naar de nieuwe deur', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  const hut = T.gezinZoektEenErf(S);
  const p = S.bewoners.mensen.find((m) => m.huis === hut && m.leeftijd === 'volwassen');
  delete p.komt;
  const e = { bewoner: p, thuis: T.deurVan(S.wereld, hut) };
  p.wezen = e;
  S.kalender.dag = Math.floor(S.kalender.dag) + 12 / 24; // midden op de dag
  const a = T.dagAnker(S, e);
  assert.deepEqual({ x: a.x, y: a.y }, e.thuis, 'overdag bij zijn bouwplaats');

  // De hut wordt het gekozen huis, en de deur verhuist mee (T.huisVeranderd, js/bewoners.js).
  hut.tekening = hut.wordtTekening;
  hut.voet = T.gebouwVoet('huis', hut.tekening);
  hut.soort = 'huis';
  T.huisVeranderd(S, hut);
  assert.deepEqual(e.thuis, T.deurVan(S.wereld, hut));
});

test('een vrij erf heeft vier paaltjes en kan weer weg; een bewoond erf niet', () => {
  const S = leeg();
  const { erf } = T.legErfAan(S, 5, 5);
  assert.deepEqual(T.paaltjesVan(erf), [{ x: 5, y: 5 }, { x: 14, y: 5 }, { x: 5, y: 14 }, { x: 14, y: 14 }]);
  assert.equal(T.haalErfWeg(S, erf).gelukt, true);
  assert.equal(S.erven.length, 0);

  const { erf: bewoond } = T.legErfAan(S, 5, 5);
  T.zetVoorraad(S, 'hout', T.GEBOUWEN.hut.kosten.hout);
  T.gezinZoektEenErf(S);
  assert.deepEqual(T.paaltjesVan(bewoond), []);
  assert.equal(T.haalErfWeg(S, bewoond).gelukt, false);
  assert.equal(S.erven.length, 1);
});

test('twee erven: het tweede gezin neemt het erf dat nog vrij is', () => {
  const S = leeg(60, 40);
  T.legErfAan(S, 2, 2);
  T.legErfAan(S, 30, 2);
  T.zetVoorraad(S, 'hout', 100);
  const eerste = T.gezinZoektEenErf(S);
  const tweede = T.gezinZoektEenErf(S);
  assert.ok(eerste && tweede);
  assert.notEqual(eerste.erf, tweede.erf);
  assert.equal(T.vrijeErven(S).length, 0);
  assert.equal(T.gezinZoektEenErf(S), null, 'daarna is er geen plaats meer');
});

test('bewaren en laden houdt de erven, en de hut die naar zijn erf wijst', () => {
  const S = gehucht();
  vol(S);
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  const hut = T.gezinZoektEenErf(S);
  const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
  assert.equal(S2.erven.length, 1);
  const hut2 = S2.erven[0].hut;
  assert.ok(hut2, 'de hut is er nog');
  assert.equal(hut2.erf, S2.erven[0]);
  assert.ok(S2.gebouwen.includes(hut2));
  assert.equal(hut2.wordtTekening, hut.wordtTekening);
  assert.ok(S2.bewoners.mensen.some((p) => p.huis === hut2), 'het gezin woont er nog');
});
