// De raad onder het doel (js/raad.js; werklijst vraag 58, B, Marcel, 29 sep: "B onder het doel"): één regel die
// zegt wat nu tussen jou en een dorp staat, met de toets erbij, uit wat het spel zelf zegt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/erven.test.cjs), op de eerste dag.
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, trede: 'gehucht' };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  return S;
}

// Een dag verder, zonder dat er iets gebeurt: de raad kijkt alleen naar de kalender, de snelheid en de spelstaat.
function opDag(S, dag) {
  S.kalender.dag = dag;
  S.kalender.snelheid = 3;
  return S;
}

// De dag (vanaf 1 lentemaand, dag 0) van een datum in het eerste jaar.
function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(`geen ${dagVanMaand} ${maand}`);
}

const raad = (S) => T.raadNu(S);
const id = (S) => (raad(S) || {}).id || null;

// Een plek voor een erf, zo dicht mogelijk bij het plein (zoals in test/erven.test.cjs).
function erfPlek(S) {
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  return plekken.find((p) => !T.waaromPastErfNiet(S, p.x, p.y));
}

test('de eerste dag: hoe de tijd sneller gaat en hoe je slaapt, tot je de tijd zelf sneller zet', () => {
  const S = gehucht();
  assert.equal(id(S), 'tijd');
  assert.match(raad(S).tekst, /\[\+\] zet de tijd sneller, en \[Z\] is slapen/);
  S.kalender.snelheid = 3;
  assert.equal(id(S), 'gezin');
});

test('niets houdt de groei tegen: wanneer het volgende gezin komt, zoals de groei het telt', () => {
  const S = opDag(gehucht(), 0.5);
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(raad(S).tekst, `Het volgende gezin komt over ${n} dagen.`);
  opDag(S, n - 0.5);
  assert.equal(raad(S).tekst, 'Het volgende gezin komt morgen.');
  // Met Vreemden welkom vaker: de raad telt met de groei mee (T.volgendeGezinDag).
  opDag(S, 1.5);
  T.zetWet(S, 'vreemden', 'aangenomen');
  assert.equal(raad(S).tekst, `Het volgende gezin komt over ${T.gezinDagen(S) - 1} dagen.`);
});

test('geen gezin: het dorp is vol, niet tevreden genoeg, of er ligt te weinig graan; vol weegt het zwaarst', () => {
  const S = opDag(gehucht(), 3.5);
  T.wijzigBevolking(S, S.woonruimte - S.bevolking, 'groei');
  assert.equal(id(S), 'plaats');
  assert.equal(raad(S).tekst, 'Er komt geen gezin: het dorp is vol. Wijs een erf aan: [B], dan Erf.');
  // Met een vrij erf is er plaats.
  const plek = erfPlek(S);
  T.plaatsGebouw(S, 'erf', plek.x, plek.y);
  assert.equal(id(S), 'gezin');
  // Niet tevreden genoeg, en te weinig graan: dan eerst de tevredenheid, want daar is iets aan te doen.
  S.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.4 });
  T.zetVoorraad(S, 'graan', 5);
  assert.equal(raad(S).tekst, `Er komt geen gezin: het dorp is 40% tevreden, en een gezin wil ${Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100)}%.`);
  S.behoeften.tevredenheid = 0.8;
  assert.equal(raad(S).tekst, `Er komt geen gezin: er ligt minder dan ${T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei} graan.`);
});

test('is het doel voor de mensen gehaald, dan zegt de raad niets meer over de groei', () => {
  const S = opDag(gehucht(), 3.5);
  S.bevolking = T.TREDEN_INSTELLINGEN.dorp.mensen;
  assert.equal(raad(S), null);
});

test('het hout: vanaf drie maanden voor de winter, als het hem niet haalt, en dat gaat voor de groei', () => {
  const S = gehucht();
  T.zetVoorraad(S, 'hout', 0);
  opDag(S, 10.5); // lentemaand: nog vroeg
  assert.notEqual(id(S), 'hout');
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'hout');
  const v = T.houtVoorDeWinter(S, S.kalender.dag);
  assert.equal(raad(S).tekst, `Het hout haalt ${v.dagen} van de ${v.winter} dagen van de winter: bouw een houthakker [B].`);
  // Met genoeg hout zegt hij het niet.
  T.zetVoorraad(S, 'hout', 5000);
  assert.notEqual(id(S), 'hout');
});

test('het eten: vanaf drie maanden voor de winter, als het hem niet haalt: een jager', () => {
  const S = gehucht();
  T.zetVoorraad(S, 'hout', 5000);
  T.zetVoorraad(S, 'graan', 0);
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'eten');
  const v = T.etenVoorDeWinter(S, S.kalender.dag);
  assert.equal(raad(S).tekst, `Het eten haalt ${v.dagen} van de ${v.winter} dagen van de winter: een jager [B] schiet ${T.GEBOUWEN.jager.maakt.uit.vlees} vlees per dag.`);
  T.zetVoorraad(S, 'graan', 5000);
  assert.notEqual(id(S), 'eten');
});

test('de inner: een paar dagen vooraf, en op zijn dag zelf niet meer', () => {
  const S = gehucht();
  const komt = dagVan(T.INNER_INSTELLINGEN.komt.maand, T.INNER_INSTELLINGEN.komt.dag);
  opDag(S, komt - 2 + 0.5);
  assert.equal(raad(S).tekst, 'De inner komt over 2 dagen. Wat hij niet ziet, telt de heer niet.');
  opDag(S, komt - 1 + 0.5);
  assert.match(raad(S).tekst, /^De inner komt morgen\./);
  opDag(S, komt + 0.5);
  assert.notEqual(id(S), 'inner');
  opDag(S, komt - T.RAAD_INSTELLINGEN.innerVooraf - 1 + 0.5);
  assert.notEqual(id(S), 'inner');
});

test('na Sint-Maarten: wat nog in een kelder ligt, eet niemand; ervoor zegt de raad het niet', () => {
  const S = gehucht();
  const boerderij = S.gebouwen.find((g) => g.soort === 'boerderij');
  boerderij.verstopt = { graan: 30, goud: 0 };
  T.zetVoorraad(S, 'hout', 5000); // anders gaan het hout en het eten voor de winter voor
  T.zetVoorraad(S, 'graan', 5000);
  opDag(S, dagVan('wijnmaand', 10) + 0.5);
  assert.notEqual(id(S), 'kelders');
  opDag(S, dagVan('slachtmaand', 20) + 0.5);
  assert.equal(raad(S).tekst, 'In de kelders ligt nog 30 graan. Dat eet niemand en zaait niemand.');
  // Zolang de heer er is (zijn soldaten zoeken), niet.
  S.heer = Object.assign(T.nieuweHeer(), { bezoek: {} });
  assert.notEqual(id(S), 'kelders');
});

test('na een aanval van de rovers: wat een wachthuis doet, als er geen is', () => {
  const S = opDag(gehucht(), 40.5);
  S.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: 38 });
  assert.equal(raad(S).tekst, 'De rovers komen terug. Een wachthuis [B] geeft je twee man die meevechten.');
  opDag(S, 38 + T.RAAD_INSTELLINGEN.roversNa + 0.5);
  assert.notEqual(id(S), 'rovers');
  opDag(S, 40.5);
  S.gebouwen.push({ soort: 'wachthuis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  assert.notEqual(id(S), 'rovers');
});

test('de marskramer in de herfst, en te weinig goud voor de heer: verkoop hem graan', () => {
  const S = opDag(gehucht(), dagVan('wijnmaand', 6) + 0.5);
  T.zetVoorraad(S, 'goud', 3);
  const herfst = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'herfst');
  S.marskramer = { staat: true, weg: false, bezoek: herfst };
  const eis = Math.ceil(T.eisVanDeHeer(S).per.goud);
  assert.ok(eis > 3, `de heer vraagt ${eis} goud`);
  assert.equal(raad(S).tekst, `De heer wil ${eis} goud, en je hebt er 3. De marskramer koopt graan, zolang hij er is.`);
  // In de lente, of met genoeg goud, niet. (Wie meer goud heeft, moet ook meer geven: de heer vraagt een deel
  // van de kist.)
  T.zetVoorraad(S, 'goud', 500);
  assert.notEqual(id(S), 'heerGoud');
  T.zetVoorraad(S, 'goud', 3);
  S.marskramer.bezoek = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'lente');
  assert.notEqual(id(S), 'heerGoud');
});

test('de spelregel zet hem uit, en op een kaart zonder plein is er geen', () => {
  const S = gehucht();
  const aan = T.RAAD_INSTELLINGEN.aan;
  T.RAAD_INSTELLINGEN.aan = false;
  try {
    assert.equal(raad(S), null);
  } finally {
    T.RAAD_INSTELLINGEN.aan = aan;
  }
  assert.ok(T.OPTIES.find((o) => o.id === 'raad'), 'de spelregel "Raad" bestaat');
  S.wereld = Object.assign({}, S.wereld, { plein: null });
  assert.equal(raad(S), null);
});
