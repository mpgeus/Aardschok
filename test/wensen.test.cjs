// De wensen van de mensen, per stand (js/wensen.js; werklijst vraag 80 en 85, Marcel, 1 okt): elk huis met mensen heeft
// een stand, en elke stand wil iets: goederen uit de voorraad (de hoogste stand neemt eerst) en plekken in een kring om
// het huis. Elk huis heeft zijn eigen tevredenheid, en het dorp is het gemiddelde, naar mensen.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

const bijna = (a, b) => Math.abs(a - b) < 1e-9;
const ZOMERDAG = 30;
const WINTERDAG = 280;

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/treden.test.cjs).
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  return S;
}

// Een kaal dorp met alleen wat T.berekenWensen leest: huizen, wie erin woont, de voorraad en wat er op de kaart staat.
function kaalDorp() {
  return { gebouwen: [], bewoners: { mensen: [] }, voorraad: T.nieuweVoorraad(), wereld: { voorwerpen: [] } };
}
function zetHuis(D, soort, x, y, mensen, velden = {}) {
  const g = Object.assign({ soort, x, y, voet: { b: 4, h: 4 }, klaar: true }, velden);
  D.gebouwen.push(g);
  for (let i = 0; i < mensen; i++) D.bewoners.mensen.push({ huis: g });
  return g;
}
const alles = { eten: 1, brandhout: 1, erbij: 0 };
const huisVan = (w, g) => w.huizen.find((h) => h.g === g);

test('een stand wil wat de stand eronder wil, en meer; de boeren staan ernaast', () => {
  assert.deepEqual(T.wensenVanStand('keuters'), ['eten', 'brandhout', 'put']);
  assert.deepEqual(T.wensenVanStand('dorpelingen'), ['eten', 'brandhout', 'put', 'bier', 'vleesOfVis', 'kapel', 'herberg']);
  assert.deepEqual(T.wensenVanStand('ambachtslieden'), ['eten', 'brandhout', 'put', 'bier', 'vleesOfVis', 'kapel', 'herberg', 'brood', 'laken', 'markt']);
  assert.deepEqual(T.wensenVanStand('boeren'), ['eten', 'brandhout', 'kapel'], 'de herberg niet, voor nu (vraag 85, b)');
  for (const s of Object.keys(T.STANDEN)) {
    for (const w of T.wensenVanStand(s)) assert.ok(T.WENSEN[w], `${s} wil ${w}, en dat bestaat`);
    assert.ok(T.GEBOUWEN[T.STANDEN[s].huis], `het huis van de ${s} bestaat`);
  }
});

test('in het gehucht: de boerderijen zijn van boeren, het huis van dorpelingen, de hutten van keuters; de schout en de herberg hebben geen wensen', () => {
  const S = gehucht();
  const D = S.dorp;
  for (const g of D.gebouwen) {
    const verwacht = g.huis === 'schout' ? null : { boerderij: 'boeren', huis: 'dorpelingen', hut: 'keuters' }[g.soort] || null;
    assert.equal(T.standVan(g), verwacht, `${g.soort} op ${g.x},${g.y}`);
  }
  const w = T.berekenTevredenheid(D, ZOMERDAG).wensen;
  const mensen = w.huizen.reduce((n, h) => n + h.mensen, 0);
  const schout = D.bewoners.mensen.filter((p) => p.huis.huis === 'schout' || p.huis.soort === 'herberg').length;
  assert.equal(mensen + schout, D.bevolking, 'wie niet bij de schout of in de herberg woont, telt mee');
});

test('een plek telt in de kring om het huis, van midden tot midden; een put op de kaart telt ook', () => {
  const D = kaalDorp();
  const dichtbij = zetHuis(D, 'hut', 10, 10, 3);
  const ver = zetHuis(D, 'hut', 40, 10, 3);
  D.wereld.voorwerpen.push({ soort: 'put', x: 20, y: 11, beslaat: [2, 2] }); // midden 21,12; de hut 12,12: 9 tegels
  const w = T.berekenWensen(D, ZOMERDAG, alles);
  assert.equal(huisVan(w, dichtbij).heeft.put, 1);
  assert.equal(huisVan(w, ver).heeft.put, 0, '30 tegels is buiten de kring van een put (12)');
  assert.equal(huisVan(w, dichtbij).tevredenheid, 1);
  assert.ok(huisVan(w, dichtbij).alles);
  assert.ok(bijna(huisVan(w, ver).tevredenheid, 0.8), 'zonder put mist het de rest (0,2)');
  assert.deepEqual(w.gemist.map((m) => [m.naam, m.huizen, m.mensen]), [['een put', 1, 3]]);
});

test('een kapel telt pas als hij klaar is, en de boeren willen hem binnen 30 tegels', () => {
  const D = kaalDorp();
  const boer = zetHuis(D, 'boerderij', 0, 0, 4, { huis: 'boer1' });
  const kapel = { soort: 'kapel', x: 20, y: 20, voet: { b: 4, h: 4 }, klaar: false };
  D.gebouwen.push(kapel); // midden 22,22; de boerderij 2,2: 28 tegels
  assert.equal(huisVan(T.berekenWensen(D, ZOMERDAG, alles), boer).heeft.kapel, 0, 'in aanbouw telt niet');
  kapel.klaar = true;
  assert.equal(huisVan(T.berekenWensen(D, ZOMERDAG, alles), boer).heeft.kapel, 1);
  kapel.x = 25; // midden 27,27: 35 tegels
  assert.equal(huisVan(T.berekenWensen(D, ZOMERDAG, alles), boer).heeft.kapel, 0);
});

test('de hoogste stand neemt eerst: is er te weinig bier, dan krijgen de dorpelingen wat de ambachtslieden overlaten', () => {
  const D = kaalDorp();
  const ambacht = zetHuis(D, 'stenenHuis', 0, 0, 8);
  const dorp = zetHuis(D, 'huis', 10, 0, 5);
  const perMens = T.WENSEN_INSTELLINGEN.perMens.bier;
  D.voorraad.bier = 10 * perMens; // de ambachtslieden willen 8 × perMens, de dorpelingen 5 × perMens
  const w = T.berekenWensen(D, ZOMERDAG, alles);
  assert.equal(huisVan(w, ambacht).heeft.bier, 1, 'de ambachtslieden hebben genoeg');
  assert.ok(bijna(huisVan(w, dorp).heeft.bier, 2 / 5), 'de dorpelingen krijgen de rest: 2 van de 5');
  assert.ok(!huisVan(w, dorp).alles);
  T.gebruikGoederen(D, w);
  assert.ok(bijna(D.voorraad.bier, 0), 'het bier is op');
  // Met genoeg bier hebben ze het allebei, en gaat er af wat ze vragen.
  D.voorraad.bier = 100;
  const genoeg = T.berekenWensen(D, ZOMERDAG, alles);
  assert.equal(huisVan(genoeg, dorp).heeft.bier, 1);
  T.gebruikGoederen(D, genoeg);
  assert.ok(bijna(D.voorraad.bier, 100 - 13 * perMens));
});

test('vlees of vis: de vis gaat eerst op, want vlees vult ook een maag', () => {
  const D = kaalDorp();
  zetHuis(D, 'huis', 0, 0, 5);
  const nodig = 5 * T.WENSEN_INSTELLINGEN.perMens.vleesOfVis;
  D.voorraad.vis = nodig / 2;
  D.voorraad.vlees = 10;
  const w = T.berekenWensen(D, ZOMERDAG, alles);
  assert.equal(w.huizen[0].heeft.vleesOfVis, 1);
  const bederfelijk = T.gebruikGoederen(D, w);
  assert.ok(bijna(D.voorraad.vis, 0));
  assert.ok(bijna(D.voorraad.vlees, 10 - nodig / 2));
  assert.ok(bijna(bederfelijk, nodig), 'wat er van vis en vlees opging, neemt zijn zout mee');
});

test('het dorp is het gemiddelde van zijn huizen, naar mensen; wat de wetten erbij doen, gaat per huis tot 100%', () => {
  const D = kaalDorp();
  zetHuis(D, 'hut', 0, 0, 3); // zonder put: 80%
  const metPut = zetHuis(D, 'hut', 30, 30, 1);
  D.wereld.voorwerpen.push({ soort: 'put', x: 30, y: 30, beslaat: [1, 1] });
  const w = T.berekenWensen(D, ZOMERDAG, alles);
  assert.ok(bijna(w.tevredenheid, (3 * 0.8 + 1 * 1) / 4));
  assert.deepEqual(w.standen.keuters, { mensen: 4, huizen: 2, alles: 1, tevredenheid: w.tevredenheid });
  const erbij = T.berekenWensen(D, ZOMERDAG, { eten: 1, brandhout: 1, erbij: 0.1 });
  assert.equal(huisVan(erbij, metPut).tevredenheid, 1, 'niet boven 100%');
  assert.ok(bijna(erbij.tevredenheid, (3 * 0.9 + 1) / 4));
});

test('eten en brandhout gelden voor het hele dorp: zonder eten zakt elk huis tot onder de groeidrempel', () => {
  const D = kaalDorp();
  const hut = zetHuis(D, 'hut', 0, 0, 3);
  D.wereld.voorwerpen.push({ soort: 'put', x: 1, y: 1, beslaat: [1, 1] });
  const honger = T.berekenWensen(D, ZOMERDAG, { eten: 0, brandhout: 1, erbij: 0 });
  assert.equal(huisVan(honger, hut).heeft.eten, 0);
  assert.ok(huisVan(honger, hut).tevredenheid < T.BEHOEFTEN_INSTELLINGEN.groeiDrempel);
  const kou = T.berekenWensen(D, WINTERDAG, { eten: 1, brandhout: 0.5, erbij: 0 });
  assert.equal(huisVan(kou, hut).heeft.brandhout, 0.5);
  assert.ok(!huisVan(kou, hut).alles);
});

test('het gehucht begint op zo\'n 83%; met de spelregel "Wensen" op het dorp als geheel op 67%, zoals vóór 1 okt', () => {
  const S = gehucht();
  const b = T.berekenTevredenheid(S.dorp, 0);
  assert.ok(b.wensen, 'per huis is de standaard');
  assert.ok(Math.abs(b.tevredenheid - 0.83) < 0.03, `${b.tevredenheid}`);
  assert.ok(b.mist.includes('een kapel'), 'de boeren en de dorpelingen missen een kapel');
  assert.ok(!b.mist.includes('een kerk'));
  T.zetOptie('wensen', 'dorp');
  try {
    const oud = T.berekenTevredenheid(S.dorp, 0);
    assert.equal(oud.wensen, null);
    assert.ok(bijna(oud.tevredenheid, 0.5 * 0.5 + 0.3 + 0.2 * T.BEHOEFTEN_INSTELLINGEN.kerkBasis), `${oud.tevredenheid}`);
    assert.ok(oud.mist.includes('een kerk'));
  } finally {
    T.optiesTerug();
  }
});

test('een dorp zonder bewoners rekent als geheel, zoals vóór 1 okt', () => {
  const D = { gebouwen: [], voorraad: T.nieuweVoorraad(), bevolking: 10, wereld: { voorwerpen: [], tegels: [] }, kalender: { dag: 0 }, behoeften: T.nieuweBehoeften() };
  D.voorraad.graan = 100;
  const b = T.berekenTevredenheid(D, ZOMERDAG);
  assert.equal(b.wensen, null);
  assert.equal(b.voedselFactor, 0.5, 'de afwisseling telt dan nog');
});

test('na een dag staat op elk huis wat het wil en heeft, en de huizen namen hun goederen', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'bier', 50);
  T.zetVoorraad(D, 'vis', 5);
  T.tikBehoeftenDag(D, ZOMERDAG);
  const huis = D.gebouwen.find((g) => g.soort === 'huis' && g.huis !== 'schout');
  const mensen = D.bewoners.mensen.filter((p) => p.huis === huis).length;
  assert.ok(mensen > 0);
  assert.equal(huis.wensen.stand, 'dorpelingen');
  assert.equal(huis.wensen.heeft.bier, 1);
  assert.equal(huis.wensen.heeft.vleesOfVis, 1);
  assert.ok(bijna(D.voorraad.bier, 50 - mensen * T.WENSEN_INSTELLINGEN.perMens.bier));
  assert.equal(D.gebouwen.find((g) => g.huis === 'schout').wensen, undefined, 'het huis van de schout heeft geen wensen');
  assert.ok(D.behoeften.standen.boeren && D.behoeften.standen.dorpelingen);
  assert.equal(D.behoeften.gemist[0].naam, 'een kapel', 'een kapel wordt het meest gemist');
});

test('de getallen van de wensen staan in de werkbank, en de spelregel "Wensen" in de spelregels', () => {
  assert.ok(T.WERKBANK.some((d) => d.blok === 'WENSEN_INSTELLINGEN'));
  const o = T.OPTIES.find((x) => x.id === 'wensen');
  assert.equal(o.standaard, 'huis');
  assert.deepEqual(o.keuzes.map((k) => k.id), ['huis', 'dorp']);
});
