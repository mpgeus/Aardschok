// De raad onder het doel (js/raad.js; werklijst vraag 58, B, Marcel, 29 sep: "B onder het doel"): één regel die
// zegt wat nu tussen jou en een dorp staat, met de toets erbij, uit wat het spel zelf zegt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

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
  }
}

test('de eerste dag: hoe de tijd sneller gaat en hoe je slaapt, tot je de tijd zelf sneller zet', () => {
  const S = gehucht();
  assert.equal(id(S), 'tijd');
  assert.match(raad(S).tekst, /\[\+\] speeds up time, and \[Z\] sleeps until morning/);
  S.kalender.snelheid = 3;
  assert.equal(id(S), 'gezin');
});

test('niets houdt de groei tegen: wanneer het volgende gezin komt, zoals de groei het telt', () => zonderWensen(() => {
  const S = metRaadsman(opDag(gehucht(), 0.5));
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(raad(S).tekst, `The next family arrives in ${n} days.`);
  opDag(S, n - 0.5);
  assert.equal(raad(S).tekst, 'The next family arrives tomorrow.');
  // Met Vreemden welkom vaker: de raad telt met de groei mee (T.volgendeGezinDag).
  opDag(S, 1.5);
  T.zetWet(S.dorp, 'vreemden', 'aangenomen');
  assert.equal(raad(S).tekst, `The next family arrives in ${T.gezinDagen(S.dorp) - 1} days.`);
}));

test('geen gezin: het dorp is vol, niet tevreden genoeg, of er ligt te weinig graan; vol weegt het zwaarst', () => {
  const S = metRaadsman(opDag(gehucht(), 3.5));
  T.wijzigBevolking(S.dorp, S.dorp.woonruimte - S.dorp.bevolking, 'groei');
  assert.equal(id(S), 'plaats');
  assert.equal(raad(S).tekst, 'No family is coming: the village is full. Build a hut or a house: [B].');
  // Met een hut die af is, is er plaats (tot ronde 2 van het snoeien: een vrij erf).
  T.zetVoorraad(S.dorp, 'hout', 100);
  const plek = T.plekVoor(S.dorp, 'hut', T.pleinVan(S.wereld));
  const u = T.plaatsGebouw(S.dorp, 'hut', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  u.instantie.klaar = true;
  assert.equal(id(S), 'gezin');
  // Niet tevreden genoeg, en te weinig graan: dan eerst de tevredenheid, want daar is iets aan te doen.
  S.dorp.behoeften = Object.assign(T.nieuweBehoeften(), { tevredenheid: 0.4 });
  T.zetVoorraad(S.dorp, 'graan', 5);
  assert.equal(raad(S).tekst, `No family is coming: the village is 40% content, and a family wants ${Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100)}%.`);
  S.dorp.behoeften.tevredenheid = 0.8;
  assert.equal(raad(S).tekst, `No family is coming: there is less than ${T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei} grain in store.`);
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
  assert.equal(raad(S).tekst, `The wood lasts ${v.dagen} of the ${v.winter} days of winter: build a woodcutter [B]. Until there is enough, no family will come.`);
  // Met de spelregel Groei op Altijd komt het gezin toch, en zegt hij dat niet.
  T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = false;
  try {
    assert.equal(raad(S).tekst, `The wood lasts ${v.dagen} of the ${v.winter} days of winter: build a woodcutter [B].`);
  } finally {
    T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = true;
  }
  // Met genoeg hout zegt hij het niet.
  T.zetVoorraad(S.dorp, 'hout', 5000);
  assert.notEqual(id(S), 'hout');
});

test('het eten: vanaf drie maanden voor de winter, als het hem niet haalt: wat er helpt (vraag 132, b)', () => {
  const S = gehucht();
  T.zetVoorraad(S.dorp, 'hout', 5000);
  T.zetVoorraad(S.dorp, 'graan', 0);
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'eten');
  const v = T.etenVoorDeWinter(S.dorp, S.kalender.dag);
  const hulp = T.watHelptAanEten(S.dorp).slice(0, 2);
  assert.ok(hulp.length, 'er is iets wat helpt');
  assert.equal(raad(S).tekst, `The food lasts ${v.dagen} of the ${v.winter} days of winter. What helps: ${T.opsomming(hulp.map((h) => h.zin))}. Until there is enough, no family will come.`);
  // Wat er kan: op het ontworpen gehucht (zonder beesten) een jager.
  const ids = T.watHelptAanEten(S.dorp).map((h) => h.id);
  assert.ok(ids.includes('jager'), ids.join(', '));
  T.zetVoorraad(S.dorp, 'graan', 5000);
  assert.notEqual(id(S), 'eten');
});

test('vis en vlees voor de winter: zout bij de marskramer, en een voorraad voordat de beek dichtligt (vraag 132, B)', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'hout', 5000);
  T.zetVoorraad(D, 'graan', 5000);
  D.gebouwen = D.gebouwen.filter((g) => g.soort !== 'visser' && g.soort !== 'jager');
  D.gebouwen.push({ soort: 'visser', x: 0, y: 0, klaar: true });
  const vleesOfVis = T.WENSEN_INSTELLINGEN.perMens.vleesOfVis;
  D.behoeften.standen = { dorpelingen: { mensen: 50, huizen: 10, alles: 0, tevredenheid: 1 } };
  const raadVis = () => T.RADEN.find((r) => r.id === 'visEnVlees');
  // In de zomer is de winter nog niet in zicht.
  opDag(S, dagVan('hooimaand', 1) + 0.5);
  assert.equal(T.visEnVleesVoorDeWinter(D, S.kalender.dag), null);
  // Op 1 wijnmaand: genoeg vis, maar geen zout.
  opDag(S, dagVan('wijnmaand', 1) + 0.5);
  T.zetVoorraad(D, 'vis', 200);
  T.zetVoorraad(D, 'zout', 0);
  const v = T.visEnVleesVoorDeWinter(D, S.kalender.dag);
  assert.ok(Math.abs(v.nodig - 50 * vleesOfVis * v.winter) < 1e-9, 'wat vijftig dorpelingen in de winter willen');
  assert.ok(Math.abs(v.dan - (200 + (T.GEBOUWEN.visser.maakt.uit.vis - 50 * vleesOfVis) * v.tot)) < 1e-9, 'wat er dan ligt');
  assert.equal(v.zout, Math.ceil(v.nodig / T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed));
  assert.ok(raadVis().als(D));
  const tekst = raadVis().tekst(D);
  assert.match(tekst, new RegExp(`buy ${v.zout} salt from the peddler in October`), tekst);
  assert.doesNotMatch(tekst, /there will then be about/, 'er is genoeg');
  // Met genoeg zout zegt hij niets.
  T.zetVoorraad(D, 'zout', v.zout);
  assert.ok(!raadVis().als(D));
  // Zonder vis en zonder visser: er mist, en het dorp vraagt een visser.
  T.zetVoorraad(D, 'vis', 0);
  D.gebouwen = D.gebouwen.filter((g) => g.soort !== 'visser');
  const r = T.visEnVleesRaad(D);
  assert.ok(r && r.mist, 'er mist vis of vlees');
  assert.match(raadVis().tekst(D), /there will then be about 0/);
  // Na het laatste bezoek van de marskramer vóór de winter zegt hij niets meer over zout.
  T.zetVoorraad(D, 'zout', 0);
  T.zetVoorraad(D, 'vis', 1000);
  opDag(S, dagVan('slachtmaand', 1) + 0.5);
  assert.ok(!T.visEnVleesRaad(D), 'de marskramer komt pas in de lente weer');
  // In de winter zelf niet: dan is het te laat.
  T.zetVoorraad(D, 'vis', 0);
  opDag(S, dagVan('wintermaand', 1) + 0.5);
  assert.equal(T.visEnVleesVoorDeWinter(D, S.kalender.dag), null);
});

test('na een aanval van de rovers: wat een wachthuis doet, als er geen is', () => {
  const S = opDag(gehucht(), 40.5);
  S.dorp.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: 38 });
  assert.equal(raad(S).tekst, 'The robbers are coming back. A watch house [B] gives you two men to fight at your side.');
  opDag(S, 38 + T.RAAD_INSTELLINGEN.roversNa + 0.5);
  assert.notEqual(id(S), 'rovers');
  opDag(S, 40.5);
  S.dorp.gebouwen.push({ soort: 'wachthuis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  assert.notEqual(id(S), 'rovers');
});

test('ging er een voorval voorbij terwijl je weg was: kies een raadsman, tot je er een hebt', () => {
  const S = opDag(gehucht(), 40.5);
  S.dorp.voorvallen = Object.assign(T.nieuweVoorvallen(), { laatstVoorbij: 39 });
  assert.equal(raad(S).tekst, 'What you miss while you are away passes by: choose an advisor [R].');
  opDag(S, 39 + T.RAAD_INSTELLINGEN.raadsmanNa + 0.5);
  assert.notEqual(id(S), 'raadsman', 'een tijd, en dan zegt de raad weer wat anders');
  opDag(S, 40.5);
  const boer = S.dorp.bewoners.mensen.find((p) => T.isBoer(p.wezen));
  T.kiesRaadsman(S.dorp, boer);
  assert.notEqual(id(S), 'raadsman', 'met een raadsman niet meer');
});

test('de eerste dagen zonder raadsman: een raadsman brengt je elke ochtend een rapport, en dat gaat voor de groei', () => {
  const S = opDag(gehucht(), 1.5);
  assert.equal(raad(S).tekst, 'An advisor brings you a report every morning: choose one [R].');
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
  assert.equal(raad(S).tekst, `The lord wants ${eis} gold, and you have 3. The peddler buys grain, as long as he is here.`);
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
  // Gebouwen vraagt het doel alleen met de eis van de proef van 28 sep (js/treden.js; vraag 90, A; sinds 11 okt geen
  // spelregel meer, dus hier gezet in de getallen).
  assert.deepEqual(T.doelGebouwen(gehucht().dorp), [], 'uit de standen vraagt het doel geen gebouwen');
  T.TREDEN_INSTELLINGEN.dorp = { mensen: 50, gebouwen: ['kapel', 'smidse'] };
  const S = opDag(gehucht(), 40.5); // na de eerste dagen, en ver van de winter
  const kosten = (wat, soorten) => soorten.reduce((som, s) => som + (T.GEBOUWEN[s].kosten[wat] || 0), 0);
  // In het begin kun je de kapel en de smidse allebei betalen: dan zegt hij niets.
  assert.deepEqual(T.doelGebouwen(S.dorp), ['kapel', 'smidse']);
  assert.notEqual(id(S), 'bouwen');
  // Met te weinig goud zegt hij hoeveel je mist voor allebei samen, en waar goud vandaan komt.
  const goud = kosten('goud', ['kapel', 'smidse']) - 6;
  T.zetVoorraad(S.dorp, 'goud', goud);
  const maand = T.MAANDEN.find((m) => m.naam === T.volgendeMarskramer(S.kalender.dag)).toon;
  assert.equal(raad(S).tekst, `For the chapel and the smithy you are short of 6 gold: the peddler buys grain in ${maand} and tax [W] brings in gold every month.`);
  // Is de belasting al aangenomen, en staat de marskramer op het plein, dan zegt hij dat.
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  S.dorp.marskramer = { staat: true, weg: false, bezoek: 0 };
  assert.equal(raad(S).tekst, 'For the chapel and the smithy you are short of 6 gold: the peddler buys grain while he is here and the tax brings in gold every month.');
  S.dorp.marskramer = null;
  // Ook te weinig hout: dan ook een houthakker.
  T.zetVoorraad(S.dorp, 'hout', 5);
  assert.match(raad(S).tekst, new RegExp(`^For the chapel and the smithy you are short of 6 gold and ${kosten('hout', ['kapel', 'smidse']) - 5} wood: .* and a woodcutter \\[B\\] cuts wood\\.$`));
  // Staat de kapel er (of wordt hij gebouwd), dan telt alleen de smidse nog.
  T.zetVoorraad(S.dorp, 'hout', 500);
  S.dorp.gebouwen.push({ soort: 'kapel', x: 0, y: 0, klaar: false, handen: 0 });
  assert.deepEqual(T.doelGebouwen(S.dorp), ['smidse']);
  T.zetVoorraad(S.dorp, 'goud', T.GEBOUWEN.smidse.kosten.goud - 2);
  assert.match(raad(S).tekst, /^For the smithy you are short of 2 gold: /);
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
  assert.equal(raad(S).tekst, 'Five farms and a house want a chapel within 40 tiles [B].');
  // Kun je de kapel niet betalen, dan zegt hij erbij wat je mist en waar het vandaan komt: dat zei eerst het doel.
  T.zetVoorraad(S.dorp, 'goud', T.GEBOUWEN.kapel.kosten.goud - 6);
  const maand = T.MAANDEN.find((m) => m.naam === T.volgendeMarskramer(S.kalender.dag)).toon;
  assert.equal(raad(S).tekst, `Five farms and a house want a chapel within 40 tiles [B]. For that you are short of 6 gold: the peddler buys grain in ${maand} and tax [W] brings in gold every month.`);
  // Wordt er een kapel gebouwd die ze allemaal bereikt, dan het volgende: de put van het huis.
  T.zetVoorraad(S.dorp, 'goud', 50);
  const huis = S.dorp.gebouwen.find((g) => g.bewoners === 'jongGezin');
  const r = T.voetVanGebouw(huis);
  S.dorp.gebouwen.push({ soort: 'kapel', x: r.x, y: r.y, voet: { b: 1, h: 1 }, klaar: false });
  assert.equal(raad(S).tekst, 'A house wants a well within 12 tiles [B].');
});

test('de wensen: een huis dat op bouwstof wacht, gaat voor; is wat helpt zelf te duur, dan zegt hij wat je mist', () => {
  const S = metRaadsman(naEenNacht(gehucht(), 40.5));
  const hut = S.dorp.gebouwen.find((g) => g.bewoners === 'oudStel');
  hut.wachtOpBouwstof = true;
  T.zetVoorraad(S.dorp, 'hout', 3);
  assert.equal(id(S), 'doorgroeien');
  // Een houthakker kost zelf hout, en die hakt hij nog niet: dan zegt hij niet dat een houthakker hout hakt.
  assert.equal(raad(S).tekst, `A hut can become a house, but the stores do not hold 8 wood: build a woodcutter [B]. For that you are short of ${T.GEBOUWEN.houthakker.kosten.hout - 3} wood.`);
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

test('na de laatste trede is er geen doel meer, dus telt de raad geen mensen meer, en over een vrij erf zegt hij niets', () => {
  const S = metRaadsman(opDag(gehucht(), 3.5));
  const D = S.dorp;
  const raadVan = (id) => T.RADEN.find((r) => r.id === id);
  assert.ok(T.volgendeTrede(D), 'in het gehucht is er een trede te halen');
  assert.ok(raadVan('gezin').als(D), 'dan zegt de raad wanneer het volgende gezin komt');
  while (T.volgendeTrede(D)) D.trede = T.volgendeTrede(D);
  // Het winnen is op 11 okt weggehaald (js/einde.js): na de laatste trede vraagt niets meer om mensen.
  assert.equal(T.tredeDoel(D), null);
  assert.ok(!raadVan('gezin').als(D), 'er is geen doel meer: over de groei zegt hij niets');
});
