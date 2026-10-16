// De raad onder het doel (js/raad.js; werklijst vraag 58, B, Marcel, 29 sep: "B onder het doel"): één regel die
// zegt wat nu tussen jou en een dorp staat, met de toets erbij, uit wat het spel zelf zegt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {} };

// Het proefdorp (test/grond.cjs), op dag 2: wat de speler speelt, met het lege begin, zijn schout en twee boerderijen.
function dorp(opties = {}) {
  const S = proefDorp(T, opties).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
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

test('de eerste dag: hoe de tijd sneller gaat en hoe je slaapt, tot je de tijd zelf sneller zet', () => {
  const S = dorp();
  S.kalender.dag = 0.3; // het proefdorp begint op dag 2: terug naar de eerste dag
  assert.equal(id(S), 'tijd');
  assert.match(raad(S).tekst, /\[\+\] speeds up time, and \[Z\] sleeps until morning/);
  S.kalender.snelheid = 3;
  assert.equal(id(S), 'gezin');
});

test('niets houdt de groei tegen: wanneer het volgende gezin komt, zoals de groei het telt', () => () => {
  const S = opDag(dorp(), 0.5);
  const n = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(raad(S).tekst, `The next family arrives in ${n} days.`);
  opDag(S, n - 0.5);
  assert.equal(raad(S).tekst, 'The next family arrives tomorrow.');
});

test('geen gezin: het dorp is vol, niet tevreden genoeg, of er ligt te weinig graan; vol weegt het zwaarst', () => {
  const S = opDag(dorp(), 3.5);
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
  const S = opDag(dorp(), 3.5);
  assert.equal(id(S), 'gezin');
  // Een huis met zoveel bewoners als het doel nog dorpelingen vraagt (js/treden.js), zonder te bouwen.
  const huis = { soort: 'huis', x: 0, y: 0, klaar: true, handen: 0 };
  S.dorp.gebouwen.push(huis);
  for (let i = T.tredeMensenNodig(S.dorp); i > 0; i--) S.dorp.bewoners.mensen.push({ naam: `dorpeling ${i}`, huis });
  assert.equal(T.tredeMensenNodig(S.dorp), 0);
  assert.equal(raad(S), null);
});

test('het hout: vanaf drie maanden voor de winter, als het hem niet haalt, en dat gaat voor de groei', () => {
  const S = dorp();
  T.zetVoorraad(S.dorp, 'hout', 0);
  opDag(S, 10.5); // lentemaand: nog vroeg
  assert.notEqual(id(S), 'hout');
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'hout');
  const v = T.houtVoorDeWinter(S.dorp, S.kalender.dag);
  // Zolang komt er geen gezin (js/gebouwen.js, gezinWachtOpDeWinter; werklijst vraag 59, B), en dat zegt hij erbij.
  assert.equal(raad(S).tekst, `The logs last ${v.dagen} of the ${v.winter} days of winter: build a woodcutter [B]. Until there is enough, no family will come.`);
  // Met de spelregel Groei op Altijd komt het gezin toch, en zegt hij dat niet.
  T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = false;
  try {
    assert.equal(raad(S).tekst, `The logs last ${v.dagen} of the ${v.winter} days of winter: build a woodcutter [B].`);
  } finally {
    T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter = true;
  }
  // Met genoeg hout zegt hij het niet.
  T.zetVoorraad(S.dorp, 'hout', 5000);
  assert.notEqual(id(S), 'hout');
});

test('het eten: vanaf drie maanden voor de winter, als het hem niet haalt: wat er helpt (vraag 132, b)', () => {
  const S = dorp();
  T.zetVoorraad(S.dorp, 'hout', 5000);
  T.zetVoorraad(S.dorp, 'graan', 0);
  opDag(S, dagVan('herfstmaand', 1) + 0.5);
  assert.equal(id(S), 'eten');
  const v = T.etenVoorDeWinter(S.dorp, S.kalender.dag);
  const hulp = T.watHelptAanEten(S.dorp).slice(0, 2);
  assert.ok(hulp.length, 'er is iets wat helpt');
  assert.equal(raad(S).tekst, `The food lasts ${v.dagen} of the ${v.winter} days of winter. What helps: ${T.opsomming(hulp.map((h) => h.zin))}. Until there is enough, no family will come.`);
  // Wat er kan: in het proefdorp (zonder beesten) een jager.
  const ids = T.watHelptAanEten(S.dorp).map((h) => h.id);
  assert.ok(ids.includes('jager'), ids.join(', '));
  T.zetVoorraad(S.dorp, 'graan', 5000);
  assert.notEqual(id(S), 'eten');
});

test('na een aanval van de rovers: wat een wachthuis doet, als er geen is', () => {
  const S = opDag(dorp(), 40.5);
  S.dorp.rovers = Object.assign(T.nieuweRovers(), { laatsteAanval: 38 });
  assert.equal(raad(S).tekst, 'The robbers are coming back. In a watch house [B], up to six who have no work become soldiers, to fight at your side.');
  opDag(S, 38 + T.RAAD_INSTELLINGEN.roversNa + 0.5);
  assert.notEqual(id(S), 'rovers');
  opDag(S, 40.5);
  S.dorp.gebouwen.push({ soort: 'wachthuis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  assert.notEqual(id(S), 'rovers');
});

test('de marskramer in de herfst, en te weinig goud voor de heer: verkoop hem graan', () => {
  const S = opDag(dorp(), dagVan('wijnmaand', 6) + 0.5);
  T.zetVoorraad(S.dorp, 'goud', 3);
  const herfst = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'herfst');
  S.dorp.marskramer = { staat: true, weg: false, bezoek: herfst };
  const eis = Math.ceil(T.eisVanDeHeer(S.dorp).per.goud);
  assert.ok(eis > 3, `de heer vraagt ${eis} goud`);
  assert.equal(raad(S).tekst, `The lord wants ${eis} gold, and you have 3. The merchant buys grain, as long as he is here.`);
  // In de lente, of met genoeg goud, niet. (Wie meer goud heeft, moet ook meer geven: de heer vraagt een deel
  // van de kist.)
  T.zetVoorraad(S.dorp, 'goud', 500);
  assert.notEqual(id(S), 'heerGoud');
  T.zetVoorraad(S.dorp, 'goud', 3);
  S.dorp.marskramer.bezoek = T.HANDEL_INSTELLINGEN.bezoeken.findIndex((b) => b.naam === 'lente');
  assert.notEqual(id(S), 'heerGoud');
});

test('de spelregel zet hem uit, en op een kaart zonder plein is er geen', () => {
  const S = dorp();
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

test('bouwen: wat je mist voor wat het doel vraagt, en waar het vandaan komt (vraag 59, C)', () => () => {
  // Gebouwen vraagt het doel alleen met de eis van de proef van 28 sep (js/treden.js; vraag 90, A; sinds 11 okt geen
  // spelregel meer, dus hier gezet in de getallen).
  assert.deepEqual(T.doelGebouwen(dorp().dorp), [], 'uit de standen vraagt het doel geen gebouwen');
  T.TREDEN_INSTELLINGEN.dorp = { mensen: 50, gebouwen: ['kapel', 'smidse'] };
  const S = opDag(dorp(), 40.5); // na de eerste dagen, en ver van de winter
  const kosten = (wat, soorten) => soorten.reduce((som, s) => som + (T.GEBOUWEN[s].kosten[wat] || 0), 0);
  // In het begin kun je de kapel en de smidse allebei betalen: dan zegt hij niets.
  assert.deepEqual(T.doelGebouwen(S.dorp), ['kapel', 'smidse']);
  assert.notEqual(id(S), 'bouwen');
  // Met te weinig goud zegt hij hoeveel je mist voor allebei samen, en waar goud vandaan komt.
  const goud = kosten('goud', ['kapel', 'smidse']) - 6;
  T.zetVoorraad(S.dorp, 'goud', goud);
  const maand = T.MAANDEN.find((m) => m.naam === T.volgendeMarskramer(S.kalender.dag)).toon;
  assert.equal(raad(S).tekst, `For the chapel and the smithy you are short of 6 gold: the merchant buys grain in ${maand} and tax [W] brings in gold every month.`);
  // Is de belasting al aangenomen, en staat de marskramer op het plein, dan zegt hij dat.
  T.zetWet(S.dorp, 'belasting', 'aangenomen');
  S.dorp.marskramer = { staat: true, weg: false, bezoek: 0 };
  assert.equal(raad(S).tekst, 'For the chapel and the smithy you are short of 6 gold: the merchant buys grain while he is here and the tax brings in gold every month.');
  S.dorp.marskramer = null;
  // Ook te weinig hout: dan ook een houthakker.
  T.zetVoorraad(S.dorp, 'hout', 5);
  assert.match(raad(S).tekst, new RegExp(`^For the chapel and the smithy you are short of 6 gold and ${kosten('hout', ['kapel', 'smidse']) - 5} logs: .* and a woodcutter \\[B\\] cuts logs\\.$`));
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
});

// ---------------------------------------------------------------------------------------------
// De huizen die op bouwstof wachten, vóór wat het doel vraagt
// ---------------------------------------------------------------------------------------------

// Een nacht in het dorp (T.tikBehoeftenDag, js/behoeften.js).
function naEenNacht(S, dag) {
  opDag(S, dag);
  T.tikBehoeftenDag(S.dorp, Math.floor(dag));
  return S;
}

// De wijn (js/wijngaard.js, T.wijnNaDePluk; werklijst vraag 155; Marcel, 10 okt: "Laten we vooruitkijken doen"): is er een
// wijnboerderij en haalt de wijn het jaar niet, dan zegt de raad dat er een wijngaard bij moet.
test('de afwisseling: eet het dorp twee soorten of minder, dan zegt de raad wat een soort erbij brengt (vraag 154)', () => {
  const S = dorp();
  const D = S.dorp;
  opDag(S, 20.5);
  // Het proefdorp eet graan, kaas en vlees uit de kar: dat staat in de balk, maar de raad zegt het nog niet.
  assert.deepEqual(D.behoeften.afwisseling, ['graan', 'vlees', 'kaas']);
  assert.notEqual(id(S), 'afwisseling');
  D.behoeften.afwisseling = ['graan'];
  assert.equal(id(S), 'afwisseling');
  assert.equal(raad(S).tekst, 'The village eats only grain, and works at 60%. Another kind of food helps: a hunter [B] (meat) and a vegetable garden [B] (vegetables).');
  // Staat er een jager, en is zijn vlees nog geen tiende van de maaltijd, dan nog een.
  D.gebouwen.push({ soort: 'jager', x: 0, y: 0, klaar: true });
  assert.match(raad(S).tekst, /another hunter \[B\] \(meat\)/);
  // Is er niets meer dat nu mag, dan zegt hij niets.
  const mag = T.magGebouwd;
  T.magGebouwd = () => false;
  try {
    assert.notEqual(id(S), 'afwisseling');
  } finally {
    T.magGebouwd = mag;
  }
});

test('de wijn: is er een wijnboerderij en haalt de wijn het jaar niet, dan moet er een wijngaard bij', () => () => {
  const S = opDag(dorp({ gebouwen: ['huis', 'wijnboerderij'] }), 40.5);
  const D = S.dorp;
  const wijnboerderij = D.gebouwen.find((g) => g.soort === 'wijnboerderij');
  assert.ok(wijnboerderij && wijnboerderij.klaar, 'de wijnboerderij staat');
  // Het huis is een stenen huis met alle mensen erin: zij willen wijn.
  const huis = D.gebouwen.find((g) => g.soort === 'huis');
  huis.soort = 'stenenHuis';
  for (const p of D.bewoners.mensen) p.huis = huis;
  assert.ok(T.wijnNaDePluk(D, S.kalender.dag).drinken > 0);
  assert.equal(id(S), 'wijn', 'zonder wijngaard haalt de wijn het jaar niet');
  assert.equal(raad(S).tekst, "The wine from the harvest lasts 0 of the year's 360 days: lay a vineyard [B] by the vineyard farm.");
  // Plant de bouwers een wijngaard, die genoeg ranken geeft, dan zegt hij niets meer. Het dorp eet de wijn ook (zijn deel
  // van de maaltijd, vraag 154), dus het moet een grote zijn.
  const aanleg = { soort: 'wijngaard', x: 0, y: 0, voet: { b: 16, h: 9 }, klaar: false, boerderij: wijnboerderij };
  D.gebouwen.push(aanleg);
  assert.notEqual(id(S), 'wijn', 'de wijngaard in aanleg telt mee');
  // Een kleine wijngaard haalt het jaar voor zoveel mensen niet: nog een.
  aanleg.voet = { b: 2, h: 6 };
  const v = T.wijnNaDePluk(D, S.kalender.dag);
  assert.ok(!v.haalt && v.dagen > 0, `${v.dagen} van de ${v.winter} dagen`);
  assert.equal(id(S), 'wijn');
  assert.equal(raad(S).tekst, `The wine from the harvest lasts ${v.dagen} of the year's ${v.winter} days: lay another vineyard [B] by the vineyard farm.`);
  // Een wijnboerderij die er niet is, kan geen wijngaard krijgen: dan zegt de afwisseling dat er een bij kan.
  D.gebouwen.splice(D.gebouwen.indexOf(wijnboerderij), 1);
  assert.notEqual(id(S), 'wijn');
});

test('doorgroeien: een huis dat op bouwstof wacht, gaat voor; is wat helpt zelf te duur, dan zegt hij wat je mist', () => {
  const S = naEenNacht(dorp(), 40.5);
  const hut = S.dorp.gebouwen.find((g) => g.soort === 'hut');
  hut.wachtOpBouwstof = true;
  T.zetVoorraad(S.dorp, 'hout', 3);
  assert.equal(id(S), 'doorgroeien');
  // Een houthakker kost zelf hout, en die hakt hij nog niet: dan zegt hij niet dat een houthakker hout hakt.
  assert.equal(raad(S).tekst, `A hut can become a house, but the stores do not hold 8 logs: build a woodcutter [B]. For that you are short of ${T.GEBOUWEN.houthakker.kosten.hout - 3} logs.`);
});

test('na de laatste trede is er geen doel meer, dus telt de raad geen mensen meer, en over een vrij erf zegt hij niets', () => {
  const S = opDag(dorp(), 3.5);
  const D = S.dorp;
  const raadVan = (id) => T.RADEN.find((r) => r.id === id);
  assert.ok(T.volgendeTrede(D), 'in het proefdorp is er een trede te halen');
  assert.ok(raadVan('gezin').als(D), 'dan zegt de raad wanneer het volgende gezin komt');
  while (T.volgendeTrede(D)) D.trede = T.volgendeTrede(D);
  // Het winnen is op 11 okt weggehaald (js/einde.js): na de laatste trede vraagt niets meer om mensen.
  assert.equal(T.tredeDoel(D), null);
  assert.ok(!raadVan('gezin').als(D), 'er is geen doel meer: over de groei zegt hij niets');
});
