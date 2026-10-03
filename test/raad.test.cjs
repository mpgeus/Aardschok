// De raad onder het doel (js/raad.js; werklijst vraag 58, B, Marcel, 29 sep: "B onder het doel"): één regel die
// zegt wat nu tussen jou en een dorp staat, met de toets erbij, uit wat het spel zelf zegt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Deze toetsen gaan over het spel waarin jij bouwt (de spelregel "Wie bouwt" op "Jij bouwt"; werklijst vraag 103):
// de raad zoals jij bouwt. Hoe het gaat als de mensen het vragen, staat in test/verzoeken.test.cjs.
T.zetOptie('wieBouwt', 'jij');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/erven.test.cjs), op de eerste dag.
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

const raad = (S) => T.raadNu(S.dorp);
const id = (S) => (raad(S) || {}).id || null;

// Met een raadsman: zonder zegt de raad de eerste dagen dat een raadsman je een rapport brengt (js/ochtendrapport.js),
// en dat gaat voor de groei (zie de toets daarvan hieronder).
function metRaadsman(S) {
  assert.ok(T.kiesRaadsman(S.dorp, S.dorp.bewoners.mensen.find((p) => T.isBoer(p.wezen))).kan);
  return S;
}

// Met de spelregel "Wensen" op "Het dorp als geheel" (js/opties.js): dan zegt de raad niets over wat de huizen missen
// (vraag 87), en blijft over wat een toets van vóór de wensen wil zien.
function zonderWensen(fn) {
  T.zetOptie('wensen', 'dorp');
  try {
    return fn();
  } finally {
    T.optiesTerug();
    T.zetOptie('wieBouwt', 'jij');
  }
}

// Een plek voor een erf, zo dicht mogelijk bij het plein (zoals in test/erven.test.cjs).
function erfPlek(S) {
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  return plekken.find((p) => !T.waaromPastErfNiet(S.dorp, p.x, p.y));
}

test('de eerste dag: hoe de tijd sneller gaat en hoe je slaapt, tot je de tijd zelf sneller zet', () => {
  const S = gehucht();
  assert.equal(id(S), 'tijd');
  assert.match(raad(S).tekst, /\[\+\] zet de tijd sneller, en \[Z\] is slapen/);
  S.kalender.snelheid = 3;
  assert.equal(id(S), 'gezin');
});

test('niets houdt de groei tegen: wanneer het volgende gezin komt, zoals de groei het telt', () => zonderWensen(() => {
  const S = metRaadsman(opDag(gehucht(), 0.5));
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(raad(S).tekst, `Het volgende gezin komt over ${n} dagen.`);
  opDag(S, n - 0.5);
  assert.equal(raad(S).tekst, 'Het volgende gezin komt morgen.');
  // Met Vreemden welkom vaker: de raad telt met de groei mee (T.volgendeGezinDag).
  opDag(S, 1.5);
  T.zetWet(S.dorp, 'vreemden', 'aangenomen');
  assert.equal(raad(S).tekst, `Het volgende gezin komt over ${T.gezinDagen(S.dorp) - 1} dagen.`);
}));

test('geen gezin: het dorp is vol, niet tevreden genoeg, of er ligt te weinig graan; vol weegt het zwaarst', () => {
  const S = metRaadsman(opDag(gehucht(), 3.5));
  T.wijzigBevolking(S.dorp, S.dorp.woonruimte - S.dorp.bevolking, 'groei');
  assert.equal(id(S), 'plaats');
  assert.equal(raad(S).tekst, 'Er komt geen gezin: het dorp is vol. Wijs een erf aan: [B], dan Erf.');
  // Met een vrij erf is er plaats.
  const plek = erfPlek(S);
  T.plaatsGebouw(S.dorp, 'erf', plek.x, plek.y);
  assert.equal(id(S), 'gezin');
  // Niet tevreden genoeg, en te weinig graan: dan eerst de tevredenheid, want daar is iets aan te doen.
  S.dorp.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.4 });
  T.zetVoorraad(S.dorp, 'graan', 5);
  assert.equal(raad(S).tekst, `Er komt geen gezin: het dorp is 40% tevreden, en een gezin wil ${Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100)}%.`);
  S.dorp.behoeften.tevredenheid = 0.8;
  assert.equal(raad(S).tekst, `Er komt geen gezin: er ligt minder dan ${T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei} graan.`);
});

test('is het doel voor de mensen gehaald, dan zegt de raad niets meer over de groei', () => {
  const S = metRaadsman(opDag(gehucht(), 3.5));
  assert.equal(id(S), 'gezin');
  // Een huis met zoveel bewoners als het doel nog dorpelingen vraagt (js/treden.js), zonder te bouwen.
  const huis = { soort: 'huis', x: 0, y: 0, klaar: true, handen: 0 };
  S.dorp.gebouwen.push(huis);
  for (let i = T.tredeMensenNodig(S.dorp); i > 0; i--) S.dorp.bewoners.mensen.push({ naam: `dorpeling ${i}`, huis });
  assert.equal(T.tredeMensenNodig(S.dorp), 0);
  assert.equal(raad(S), null);
});

test('het hout: vanaf drie maanden voor de winter, als het hem niet haalt, en dat gaat voor de groei', () => {
  const S = gehucht();
  T.zetVoorraad(S.dorp, 'hout', 0);
  opDag(S, 10.5); // lentemaand: nog vroeg
  assert.notEqual(id(S), 'hout');
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'hout');
  const v = T.houtVoorDeWinter(S.dorp, S.kalender.dag);
  // Zolang komt er geen gezin (js/gebouwen.js, gezinWachtOpDeWinter; werklijst vraag 59, B), en dat zegt hij erbij.
  assert.equal(raad(S).tekst, `Het hout haalt ${v.dagen} van de ${v.winter} dagen van de winter: bouw een houthakker [B]. Tot het genoeg is, komt er geen gezin.`);
  // Met de spelregel Groei op Altijd komt het gezin toch, en zegt hij dat niet.
  T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = false;
  try {
    assert.equal(raad(S).tekst, `Het hout haalt ${v.dagen} van de ${v.winter} dagen van de winter: bouw een houthakker [B].`);
  } finally {
    T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = true;
  }
  // Met genoeg hout zegt hij het niet.
  T.zetVoorraad(S.dorp, 'hout', 5000);
  assert.notEqual(id(S), 'hout');
});

test('het eten: vanaf drie maanden voor de winter, als het hem niet haalt: een jager', () => {
  const S = gehucht();
  T.zetVoorraad(S.dorp, 'hout', 5000);
  T.zetVoorraad(S.dorp, 'graan', 0);
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'eten');
  const v = T.etenVoorDeWinter(S.dorp, S.kalender.dag);
  assert.equal(raad(S).tekst, `Het eten haalt ${v.dagen} van de ${v.winter} dagen van de winter: een jager [B] schiet ${T.GEBOUWEN.jager.maakt.uit.vlees} vlees per dag. Tot het genoeg is, komt er geen gezin.`);
  T.zetVoorraad(S.dorp, 'graan', 5000);
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
  const boerderij = S.dorp.gebouwen.find((g) => g.soort === 'boerderij');
  boerderij.verstopt = { graan: 30, goud: 0 };
  T.zetVoorraad(S.dorp, 'hout', 5000); // anders gaan het hout en het eten voor de winter voor
  T.zetVoorraad(S.dorp, 'graan', 5000);
  opDag(S, dagVan('wijnmaand', 10) + 0.5);
  assert.notEqual(id(S), 'kelders');
  opDag(S, dagVan('slachtmaand', 20) + 0.5);
  assert.equal(raad(S).tekst, 'In de kelders ligt nog 30 graan. Dat eet niemand en zaait niemand.');
  // Zolang de heer er is (zijn soldaten zoeken), niet.
  S.dorp.heer = Object.assign(T.nieuweHeer(), { bezoek: {} });
  assert.notEqual(id(S), 'kelders');
});

test('na een aanval van de rovers: wat een wachthuis doet, als er geen is', () => {
  const S = opDag(gehucht(), 40.5);
  S.dorp.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: 38 });
  assert.equal(raad(S).tekst, 'De rovers komen terug. Een wachthuis [B] geeft je twee man die meevechten.');
  opDag(S, 38 + T.RAAD_INSTELLINGEN.roversNa + 0.5);
  assert.notEqual(id(S), 'rovers');
  opDag(S, 40.5);
  S.dorp.gebouwen.push({ soort: 'wachthuis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  assert.notEqual(id(S), 'rovers');
});

test('ging er een voorval voorbij terwijl je weg was: kies een raadsman, tot je er een hebt', () => {
  const S = opDag(gehucht(), 40.5);
  S.dorp.voorvallen = Object.assign(T.nieuweVoorvallen(), { laatstVoorbij: 39 });
  assert.equal(raad(S).tekst, 'Wat je mist als je weg bent, gaat voorbij: kies een raadsman [R].');
  opDag(S, 39 + T.RAAD_INSTELLINGEN.raadsmanNa + 0.5);
  assert.notEqual(id(S), 'raadsman', 'een tijd, en dan zegt de raad weer wat anders');
  opDag(S, 40.5);
  const boer = S.dorp.bewoners.mensen.find((p) => T.isBoer(p.wezen));
  T.kiesRaadsman(S.dorp, boer);
  assert.notEqual(id(S), 'raadsman', 'met een raadsman niet meer');
});

test('de eerste dagen zonder raadsman: een raadsman brengt je elke ochtend een rapport, en dat gaat voor de groei', () => {
  const S = opDag(gehucht(), 1.5);
  assert.equal(raad(S).tekst, 'Een raadsman brengt je elke ochtend een rapport: kies er een [R].');
  // De eerste dag gaat de tijd voor, en na de eerste dagen zegt de raad het niet meer.
  opDag(S, 0.5);
  S.kalender.snelheid = 1;
  assert.equal(id(S), 'tijd');
  opDag(S, T.OCHTENDRAPPORT_INSTELLINGEN.raadTot + 0.5);
  assert.notEqual(id(S), 'rapport');
  // Met de spelregel "Het rapport" of "Raadsman" uit niet, en met een raadsman niet meer.
  opDag(S, 2.5);
  for (const blok of ['OCHTENDRAPPORT_INSTELLINGEN', 'RAADSMAN_INSTELLINGEN']) {
    T[blok].aan = false;
    try {
      assert.notEqual(id(S), 'rapport', blok);
    } finally {
      T[blok].aan = true;
    }
  }
  metRaadsman(S);
  assert.notEqual(id(S), 'rapport');
});

test('de marskramer in de herfst, en te weinig goud voor de heer: verkoop hem graan', () => {
  const S = opDag(gehucht(), dagVan('wijnmaand', 6) + 0.5);
  T.zetVoorraad(S.dorp, 'goud', 3);
  const herfst = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'herfst');
  S.dorp.marskramer = { staat: true, weg: false, bezoek: herfst };
  const eis = Math.ceil(T.eisVanDeHeer(S.dorp).per.goud);
  assert.ok(eis > 3, `de heer vraagt ${eis} goud`);
  assert.equal(raad(S).tekst, `De heer wil ${eis} goud, en je hebt er 3. De marskramer koopt graan, zolang hij er is.`);
  // In de lente, of met genoeg goud, niet. (Wie meer goud heeft, moet ook meer geven: de heer vraagt een deel
  // van de kist.)
  T.zetVoorraad(S.dorp, 'goud', 500);
  assert.notEqual(id(S), 'heerGoud');
  T.zetVoorraad(S.dorp, 'goud', 3);
  S.dorp.marskramer.bezoek = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'lente');
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
  S.dorp.wereld = Object.assign({}, S.dorp.wereld, { plein: null }); // het dorp heeft zijn eigen kaart (D.wereld)
  assert.equal(raad(S), null);
});

test('bouwen: wat je mist voor wat het doel vraagt, en waar het vandaan komt (vraag 59, C)', () => zonderWensen(() => {
  // Gebouwen vraagt het doel alleen met de spelregel "Treden" op de proef van 28 sep (js/treden.js; vraag 90, A).
  assert.deepEqual(T.doelGebouwen(gehucht().dorp), [], 'uit de standen vraagt het doel geen gebouwen');
  T.zetOptie('treden', 'proef');
  const S = opDag(gehucht(), 40.5); // na de eerste dagen, en ver van de winter
  const kosten = (wat, soorten) => soorten.reduce((som, s) => som + (T.GEBOUWEN[s].kosten[wat] || 0), 0);
  // In het begin kun je de kapel en de smidse allebei betalen: dan zegt hij niets.
  assert.deepEqual(T.doelGebouwen(S.dorp), ['kapel', 'smidse']);
  assert.notEqual(id(S), 'bouwen');
  // Met te weinig goud zegt hij hoeveel je mist voor allebei samen, en waar goud vandaan komt.
  const goud = kosten('goud', ['kapel', 'smidse']) - 6;
  T.zetVoorraad(S.dorp, 'goud', goud);
  const maand = T.volgendeMarskramer(S.kalender.dag);
  assert.equal(raad(S).tekst, `Voor de kapel en de smidse mis je 6 goud: de marskramer koopt graan in ${maand} en belasting [W] brengt elke maand goud.`);
  // Is de belasting al aangenomen, en staat de marskramer op het plein, dan zegt hij dat.
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  S.dorp.marskramer = { staat: true, weg: false, bezoek: 0 };
  assert.equal(raad(S).tekst, 'Voor de kapel en de smidse mis je 6 goud: de marskramer koopt graan, zolang hij er is en de belasting brengt elke maand goud.');
  S.dorp.marskramer = null;
  // Ook te weinig hout: dan ook een houthakker.
  T.zetVoorraad(S.dorp, 'hout', 5);
  assert.match(raad(S).tekst, new RegExp(`^Voor de kapel en de smidse mis je 6 goud en ${kosten('hout', ['kapel', 'smidse']) - 5} hout: .* en een houthakker \\[B\\] hakt hout\\.$`));
  // Staat de kapel er (of wordt hij gebouwd), dan telt alleen de smidse nog.
  T.zetVoorraad(S.dorp, 'hout', 500);
  S.dorp.gebouwen.push({ soort: 'kapel', x: 0, y: 0, klaar: false, handen: 0 });
  assert.deepEqual(T.doelGebouwen(S.dorp), ['smidse']);
  T.zetVoorraad(S.dorp, 'goud', T.GEBOUWEN.smidse.kosten.goud - 2);
  assert.match(raad(S).tekst, /^Voor de smidse mis je 2 goud: /);
  // Is het een dorp, dan vraagt het doel niets meer.
  S.dorp.trede = 'dorp';
  assert.deepEqual(T.doelGebouwen(S.dorp), []);
  assert.notEqual(id(S), 'bouwen');
}));

// ---------------------------------------------------------------------------------------------
// De wensen (werklijst vraag 86, a, en 87): wat de huizen missen en wat helpt, vóór wat het doel vraagt
// ---------------------------------------------------------------------------------------------

// Een nacht in het gehucht: dan weten de huizen wat ze willen en hebben (T.tikBehoeftenDag, js/behoeften.js).
function naEenNacht(S, dag) {
  opDag(S, dag);
  T.tikBehoeftenDag(S.dorp, Math.floor(dag));
  return S;
}

test('de wensen: na een nacht zegt de raad wat de meeste mensen missen, met de toets, vóór het doel en de groei', () => {
  const S = metRaadsman(opDag(gehucht(), 40.5));
  assert.equal(id(S), 'gezin', 'vóór de eerste nacht weet het dorp het nog niet');
  naEenNacht(S, 40.5);
  assert.equal(id(S), 'wens');
  assert.equal(raad(S).tekst, 'Vijf boerderijen en een huis willen een kapel binnen 40 tegels [B].');
  // Kun je de kapel niet betalen, dan zegt hij erbij wat je mist en waar het vandaan komt: dat zei eerst het doel.
  T.zetVoorraad(S.dorp, 'goud', T.GEBOUWEN.kapel.kosten.goud - 6);
  const maand = T.volgendeMarskramer(S.kalender.dag);
  assert.equal(raad(S).tekst, `Vijf boerderijen en een huis willen een kapel binnen 40 tegels [B]. Daarvoor mis je 6 goud: de marskramer koopt graan in ${maand} en belasting [W] brengt elke maand goud.`);
  // Wordt er een kapel gebouwd die ze allemaal bereikt, dan het volgende: de put van het huis.
  T.zetVoorraad(S.dorp, 'goud', 50);
  const huis = S.dorp.gebouwen.find((g) => g.bewoners === 'jongGezin');
  const r = T.voetVanGebouw(huis);
  S.dorp.gebouwen.push({ soort: 'kapel', x: r.x, y: r.y, voet: { b: 1, h: 1 }, klaar: false });
  assert.equal(raad(S).tekst, 'Een huis wil een put binnen 12 tegels [B].');
});

test('de wensen: een huis dat op bouwstof wacht, gaat voor; is wat helpt zelf te duur, dan zegt hij wat je mist', () => {
  const S = metRaadsman(naEenNacht(gehucht(), 40.5));
  const hut = S.dorp.gebouwen.find((g) => g.bewoners === 'oudStel');
  hut.wachtOpBouwstof = true;
  T.zetVoorraad(S.dorp, 'hout', 3);
  assert.equal(id(S), 'doorgroeien');
  // Een houthakker kost zelf hout, en die hakt hij nog niet: dan zegt hij niet dat een houthakker hout hakt.
  assert.equal(raad(S).tekst, `Een hut kan een huis worden, maar er is geen 8 hout: bouw een houthakker [B]. Daarvoor mis je ${T.GEBOUWEN.houthakker.kosten.hout - 3} hout.`);
});

test('de wensen: wat je nu niet kunt doen, zegt de raad niet; de winter en de spelregel gaan voor', () => {
  const S = metRaadsman(naEenNacht(gehucht(), 40.5));
  // Een kapel in aanbouw die ze alle zes bereikt, een put bij het huis en vis: dan mist niemand meer iets wat je kunt bouwen.
  const huis = S.dorp.gebouwen.find((g) => g.bewoners === 'jongGezin');
  const r = T.voetVanGebouw(huis);
  S.dorp.gebouwen.push({ soort: 'kapel', x: r.x, y: r.y, voet: { b: 1, h: 1 }, klaar: false });
  S.dorp.gebouwen.push({ soort: 'put', x: r.x + 1, y: r.y, voet: { b: 1, h: 1 }, klaar: true });
  S.dorp.gebouwen.push({ soort: 'visser', x: 0, y: 0, voet: { b: 3, h: 3 }, klaar: false });
  assert.equal(id(S), 'gezin', 'alles wordt gebouwd: niets te doen');
  // De spelregel "Wensen" op het dorp als geheel: geen wensen per huis, dus ook geen raad erover.
  const S2 = metRaadsman(naEenNacht(gehucht(), 40.5));
  assert.equal(id(S2), 'wens');
  zonderWensen(() => {
    T.tikBehoeftenDag(S2.dorp, 41);
    assert.notEqual(id(S2), 'wens');
  });
});
