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

// ---------------------------------------------------------------------------------------------
// Doorgroeien en achteruitgaan, per huis (2b; werklijst vraag 80, C, en 85, c)
// ---------------------------------------------------------------------------------------------

// Zoals vóór 30 sep, met de spelregel "Het seizoen" op jij: niemand sprokkelt, zodat het hout precies na te rekenen is.
function metRegels(regels, fn) {
  for (const [id, keus] of Object.entries(regels)) T.zetOptie(id, keus);
  try {
    return fn();
  } finally {
    T.optiesTerug();
  }
}
// De berichten die het dorp zegt, zolang fn loopt.
function berichten(fn) {
  const gezegd = [];
  const oud = T.ui.bericht;
  T.ui.bericht = (tekst) => gezegd.push(tekst);
  try {
    fn();
  } finally {
    T.ui.bericht = oud;
  }
  return gezegd;
}
const hutVanHetOudeStel = (D) => D.gebouwen.find((g) => g.bewoners === 'oudStel');
const huisVanHetJongeGezin = (D) => D.gebouwen.find((g) => g.bewoners === 'jongGezin');
const mensenIn = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

test('de woningen van het begin hebben hun tekening als voorwerp, zodat ze kunnen doorgroeien', () => {
  const D = gehucht().dorp;
  for (const g of D.gebouwen) {
    if (!g.tekening) continue;
    assert.ok(g.voorwerp, `${g.soort} op ${g.x},${g.y}`);
    assert.equal(g.voorwerp.soort, g.tekening.split('/').pop());
    assert.ok(D.wereld.voorwerpen.includes(g.voorwerp), 'het voorwerp dat er al lag, geen tweede');
  }
});

test('een hut die een maand alles heeft, groeit door tot een huis, voor 8 hout, en wie erin woont, is dan dorpeling', () => metRegels({ seizoen: 'jij' }, () => {
  const D = gehucht().dorp;
  const hut = hutVanHetOudeStel(D);
  assert.equal(T.berekenTevredenheid(D, ZOMERDAG).wensen.huizen.find((h) => h.g === hut).alles, true, 'de hut bij de put heeft alles');
  const hout = D.voorraad.hout;
  let dag = ZOMERDAG;
  const gezegd = berichten(() => {
    for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikBehoeftenDag(D, ++dag);
  });
  assert.equal(hut.soort, 'huis');
  assert.equal(T.standVan(hut), 'dorpelingen');
  assert.equal(D.voorraad.hout, hout - 8);
  assert.ok(gezegd.includes('Een hut is gegroeid tot een huis, voor 8 hout: wie erin woont, hoort nu bij de dorpelingen.'), gezegd.join(' | '));
  assert.ok(hut.voorwerp.vel != null, 'met de tekening van een huis');
  assert.ok(T.GEBOUWEN.huis.tekeningen.includes(hut.tekening));
  // Nu wil het meer, en heeft het dat niet: het groeit niet verder.
  for (let i = 0; i < 40; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(hut.soort, 'huis');
  assert.equal(hut.groeiDagen, 0);
}));

test('zonder hout wacht de hut, en zegt het dorp het één keer; met hout groeit hij de volgende dag', () => metRegels({ seizoen: 'jij' }, () => {
  const D = gehucht().dorp;
  const hut = hutVanHetOudeStel(D);
  T.zetVoorraad(D, 'hout', 0);
  let dag = ZOMERDAG;
  const gezegd = berichten(() => {
    for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5; i++) T.tikBehoeftenDag(D, ++dag);
  });
  assert.equal(hut.soort, 'hut');
  assert.deepEqual(gezegd.filter((t) => t.includes('kan een huis worden')), ['Een hut kan een huis worden, maar daar is 8 hout voor nodig.']);
  T.zetVoorraad(D, 'hout', 10);
  T.tikBehoeftenDag(D, ++dag);
  assert.equal(hut.soort, 'huis');
  assert.equal(D.voorraad.hout, 2);
}));

test('een huis met alles groeit door tot een stenen huis, voor 12 steen; wie iets mist, groeit niet', () => metRegels({ seizoen: 'jij' }, () => {
  const D = gehucht().dorp;
  const huis = huisVanHetJongeGezin(D);
  let dag = ZOMERDAG;
  for (let i = 0; i < 40; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(huis.soort, 'huis', 'zonder kapel, put en vlees of vis groeit het niet');
  // Een put en een kapel vlak bij het huis (alleen de boekhouding: ze staan niet getekend), vis, en steen.
  const midden = { x: huis.x + 3, y: huis.y + 8 };
  D.gebouwen.push({ soort: 'put', x: midden.x, y: midden.y, voet: { b: 1, h: 1 }, klaar: true });
  D.gebouwen.push({ soort: 'kapel', x: midden.x + 2, y: midden.y, voet: { b: 4, h: 4 }, klaar: true });
  T.zetVoorraad(D, 'vis', 100);
  T.zetVoorraad(D, 'bier', 100);
  T.zetVoorraad(D, 'steen', 15);
  const h = () => T.berekenTevredenheid(D, dag).wensen.huizen.find((x) => x.g === huis);
  assert.ok(h().alles, JSON.stringify(h().heeft));
  const voet = { ...huis.voet };
  const tekening = huis.tekening;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(huis.soort, 'stenenHuis');
  assert.equal(T.standVan(huis), 'ambachtslieden');
  assert.equal(D.voorraad.steen, 3);
  // Het versteent tot zijn eigen broertje, op zijn eigen grond (vraag 85, d).
  assert.equal(huis.tekening, T.GEBOUWEN.stenenHuis.broertjes[tekening]);
  assert.deepEqual(huis.voet, voet);
}));

test('zacht: er trekt pas een gezin weg uit huizen onder de vertrekdrempel, als het eten en het brandhout in de winter missen', () => {
  const D = gehucht().dorp;
  T.zetVoorraad(D, 'graan', 0);
  T.zetVoorraad(D, 'hout', 0);
  T.zetVoorraad(D, 'kaas', 0);
  const groeidag = Math.ceil(WINTERDAG / T.GEBOUWEN_INSTELLINGEN.gezinDagen) * T.GEBOUWEN_INSTELLINGEN.gezinDagen;
  assert.equal(T.datumVanDag(groeidag).seizoen, 'winter');
  const b = T.berekenTevredenheid(D, groeidag);
  assert.ok(b.wensen.huizen.every((h) => h.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel));
  const voor = D.bevolking;
  const metStand = new Set(b.wensen.huizen.map((h) => h.g));
  const wie = T.wieGaatEerst(D, 'vertrek').filter((p) => metStand.has(p.huis)).slice(0, T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
  const gezegd = berichten(() => T.tikBehoeftenDag(D, groeidag));
  assert.ok(D.bevolking < voor);
  assert.ok(wie.every((p) => !D.bewoners.mensen.includes(p)), 'het nieuwste gezin uit een huis onder de drempel');
  assert.ok(gezegd.some((t) => t.includes('trekken weg: ze hebben geen eten en geen brandhout.')), gezegd.join(' | '));
});

test('zacht: wie alleen een kapel mist, trekt niet weg', () => {
  const D = gehucht().dorp;
  const voor = D.bevolking;
  let dag = 0;
  for (let i = 0; i < 2 * T.GEBOUWEN_INSTELLINGEN.gezinDagen; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(D.bevolking, voor);
});

test('streng: mist een huis een maand iets, dan trekt zijn gezin weg, hooguit één huis per dag', () => metRegels({ achteruit: 'streng' }, () => {
  const D = gehucht().dorp;
  const missen = T.berekenTevredenheid(D, 1).wensen.huizen.filter((h) => !h.alles).map((h) => h.g);
  assert.ok(missen.length >= 2);
  const voor = D.bevolking;
  let dag = 0;
  for (let i = 0; i < T.WENSEN_INSTELLINGEN.missenDagen - 1; i++) T.tikBehoeftenDag(D, ++dag);
  assert.equal(D.bevolking, voor, 'nog geen maand');
  const eerste = berichten(() => T.tikBehoeftenDag(D, ++dag));
  const na1 = D.bevolking;
  assert.ok(na1 < voor);
  assert.ok(eerste.some((t) => t.includes('hun huis mist al een maand')), eerste.join(' | '));
  T.tikBehoeftenDag(D, ++dag);
  assert.ok(D.bevolking < na1, 'de volgende dag het volgende huis');
  // Een boer trekt niet weg: hij blijft op zijn boerderij.
  for (const g of missen) if (g.soort === 'boerderij') assert.ok(mensenIn(D, g).some((p) => p.wie));
}));

test('een hogere stand betaalt meer belasting', () => {
  const D = { bevolking: 20, behoeften: { standen: { keuters: { mensen: 3 }, dorpelingen: { mensen: 5 }, ambachtslieden: { mensen: 8 } } } };
  const B = T.WENSEN_INSTELLINGEN.belasting;
  assert.equal(T.belastbaar(D), 20 + 3 * (B.keuters - 1) + 5 * (B.dorpelingen - 1) + 8 * (B.ambachtslieden - 1));
  assert.equal(T.belastbaar({ bevolking: 20, behoeften: { standen: null } }), 20, 'zonder standen iedereen als één');
});

test('elk huis heeft een stenen broertje dat op zijn eigen grond past', () => {
  const steen = T.GEBOUWEN.stenenHuis;
  for (const t of T.GEBOUWEN.huis.tekeningen) {
    const broertje = steen.broertjes[t];
    assert.ok(broertje && steen.tekeningen.includes(broertje), `${t} heeft een broertje`);
    const a = T.gebouwVoet('huis', t);
    const b = T.gebouwVoet('stenenHuis', broertje);
    assert.ok(b.b <= a.b && b.h <= a.h, `${broertje} (${b.b}×${b.h}) past op ${t} (${a.b}×${a.h})`);
  }
});
