// Het geld (werklijst vraag 141, stap 1; js/geld.js): de munten, de kas van het dorp, de beurs van de schout met zijn
// loon, en omkopen uit eigen zak.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => undefined });
const IN = T.GELD_INSTELLINGEN;

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

function dorp() {
  return { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 10, kalender: { dag: 0, snelheid: 1 }, wereld: { wezens: [], voorwerpen: [] } };
}

test('een bedrag in goud staat als goud, zilver en koper: 1 goud is 10 zilver is 100 koper', () => {
  assert.deepEqual(T.muntenVan(2.35), { goud: 2, zilver: 3, koper: 5 });
  assert.equal(T.muntTekst(2.35), '2 goud, 3 zilver en 5 koper');
  assert.equal(T.muntTekst(2.35, true), '2g 3z 5k');
  assert.equal(T.muntTekst(0.07), '7 koper');
  assert.equal(T.muntTekst(4), '4 goud');
  assert.equal(T.muntTekst(0, true), '0');
  assert.equal(T.muntTekst(0.999), '9 zilver en 9 koper', 'naar beneden, op een koper');
});

test('de schout krijgt zijn loon uit de kas op de eerste van de maand, één keer, en zoveel als erin zit', () => {
  const D = dorp();
  T.zetVoorraad(D, 'goud', 10);
  assert.equal(T.beursVan(D), IN.beginBeurs);
  const eerste = dagVan('grasmaand', 1);
  T.tikGeldDag(D, eerste);
  assert.equal(T.kasVan(D), 10 - IN.loon);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon);
  T.tikGeldDag(D, eerste);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon, 'één keer per maand');
  T.tikGeldDag(D, eerste + 5);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon, 'alleen op de eerste');
  assert.ok(D.dagboek.regels.some((r) => r.soort === 'geld' && /loon/.test(r.tekst)), 'het rapport zegt het');
  // Een lege kas betaalt niets.
  T.zetVoorraad(D, 'goud', 0);
  T.tikGeldDag(D, dagVan('bloeimaand', 1));
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon);
});

test('de inner omkopen gaat uit eigen zak: de kas blijft, en wat niet in je beurs zit, geef je niet', () => {
  const D = dorp();
  T.zetVoorraad(D, 'goud', 50);
  D.geld = { beurs: 12, loonGehad: null };
  D.inner = { bezoek: { tot: 1e9 }, geschenken: 0 };
  D.lot = { zaad: 2 };
  assert.ok(T.koopInnerOm(D, 10).kan);
  assert.equal(T.beursVan(D), 2);
  assert.equal(T.kasVan(D), 50, 'de kas van het dorp blijft');
  assert.equal(T.koopInnerOm(D, 5).kan, false, 'vijf zit er niet meer in');
  // In zijn gesprek staat het geschenk pas als je het in je beurs hebt.
  assert.equal(T.questVoorwaarde(D, D, { beurs: 5 }), false);
  D.geld.beurs = 5;
  assert.equal(T.questVoorwaarde(D, D, { beurs: 5 }), true);
});

test('met de spelregel "Geld" op "Alles uit de kas" is er geen beurs en geen loon, en gaat het omkopen uit de kas', () => {
  T.zetOptie('geld', 'dorp');
  try {
    const D = dorp();
    T.zetVoorraad(D, 'goud', 20);
    assert.equal(T.beursVan(D), 20, 'de beurs is de kas');
    T.tikGeldDag(D, dagVan('grasmaand', 1));
    assert.equal(T.kasVan(D), 20, 'geen loon');
    D.inner = { bezoek: { tot: 1e9 }, geschenken: 0 };
    D.lot = { zaad: 2 };
    assert.ok(T.koopInnerOm(D, 5).kan);
    assert.equal(T.kasVan(D), 15);
  } finally {
    T.optiesTerug();
  }
});

// ---------------------------------------------------------------------------------------------
// Stap 2: een beurs per huis (vraag 141; Marcel, 9 okt: "ja dat is akkoord")
// ---------------------------------------------------------------------------------------------

// Het ontworpen gehucht, zoals een nieuw spel begint, stil en met een vaste worp.
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

test('het pakhuis onthoudt van wie wat is, en wie neemt, betaalt de eigenaars naar wat hij van elk nam', () => {
  const D = dorp();
  const a = { soort: 'huis' };
  const b = { soort: 'huis' };
  D.gebouwen.push(a, b);
  T.zetVoorraad(D, 'goud', 10);
  T.wijzigVoorraad(D, 'laken', 6, a);
  T.wijzigVoorraad(D, 'laken', 2, b);
  assert.equal(T.eigenaarsVan(D, 'laken').get(a), 6);
  assert.equal(T.eigenaarsVan(D, 'laken').get(b), 2);
  // De kas neemt 4 laken (voor de heer): driekwart van a, een kwart van b, tegen de prijs.
  T.neemEnBetaal(D, 'laken', 4, 'kas');
  const prijs = T.prijsVan('laken');
  assert.ok(Math.abs(T.huisBeurs(a) - (IN.beginHuisBeurs + 3 * prijs)) < 1e-9);
  assert.ok(Math.abs(T.huisBeurs(b) - (IN.beginHuisBeurs + 1 * prijs)) < 1e-9);
  assert.ok(Math.abs(T.kasVan(D) - (10 - 4 * prijs)) < 1e-9);
  assert.ok(Math.abs(a.verdiend - 3 * prijs) < 1e-9, 'wat het verdiende, telt voor de tiende');
  // Wat van hemzelf is, betaalt een huis niet.
  const voor = T.huisBeurs(a);
  T.neemEnBetaal(D, 'laken', 1, a);
  assert.equal(T.huisBeurs(a), voor);
  // Wat bederft of op een andere manier verdwijnt, betaalt niemand; een gebouw dat weg is, laat het aan de kas.
  D.gebouwen.splice(D.gebouwen.indexOf(b), 1);
  T.wijzigVoorraad(D, 'laken', 1);
  assert.equal(T.eigenaarsVan(D, 'laken').has(b), false);
});

test('een huis koopt zijn eten en zijn wensen uit zijn beurs; wie te arm is, mist het en lijdt honger in zijn huis', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'graan', 500);
  T.zetVoorraad(D, 'bier', 50);
  const dag = 40;
  const huizen = D.gebouwen.filter((g) => T.standVan(g) === 'dorpelingen' || T.standVan(g) === 'keuters');
  assert.ok(huizen.length >= 2);
  const [rijk, arm] = huizen;
  rijk.beurs = 5;
  arm.beurs = 0;
  const b = T.berekenTevredenheid(D, dag);
  const h = (g) => b.wensen.huizen.find((x) => x.g === g);
  assert.equal(h(rijk).etenDeel, 1);
  assert.equal(h(arm).etenDeel, 0, 'zonder geld geen eten');
  assert.ok(h(arm).teArm.includes('eten'));
  assert.ok(h(arm).tevredenheid < h(rijk).tevredenheid);
  assert.ok(b.etenDekking < b.voedselDekking, 'het dorp eet minder dan er is');
  assert.ok(b.arm.includes(arm));
  // Het dorp eet: het rijke huis betaalt de boeren voor zijn graan, het arme eet niet.
  T.onthoudWensen(D, b.wensen);
  const graan = D.voorraad.graan;
  const voor = T.huisBeurs(rijk);
  const boeren = D.gebouwen.filter((g) => g.soort === 'boerderij');
  for (const g of boeren) T.wijzigVoorraad(D, 'graan', 10, g);
  T.eetVandaag(D, dag);
  assert.ok(D.voorraad.graan < graan + 10 * boeren.length);
  assert.ok(T.huisBeurs(rijk) < voor, 'het rijke huis betaalde');
  assert.equal(T.huisBeurs(arm), 0);
});

test('de belasting is een tiende van wat de huizen die maand verdienden, en dan telt het opnieuw', () => {
  const S = gehucht();
  const D = S.dorp;
  const g = D.gebouwen.find((x) => x.soort === 'boerderij');
  g.beurs = 2;
  g.verdiend = 1.5;
  T.zetVoorraad(D, 'goud', 0);
  T.zetWet(D, 'belasting', 'aangenomen');
  const eerste = dagVan('grasmaand', 1);
  T.tikWettenDag(D, eerste);
  assert.ok(Math.abs(T.kasVan(D) - 0.15) < 1e-9, `${T.kasVan(D)}`);
  assert.ok(Math.abs(T.huisBeurs(g) - 1.85) < 1e-9);
  T.tikGeldDag(D, eerste);
  assert.equal(g.verdiend, 0, 'een nieuwe maand');
  assert.equal(g.verdiendVorige, 1.5, 'de vorige blijft staan voor het briefje');
});

test('wat een werkplaats maakt, is van de huizen van wie er werkt, en het graan in de schuur van de boerderij', () => {
  const S = gehucht();
  const D = S.dorp;
  const boer = D.gebouwen.find((x) => x.soort === 'boerderij');
  T.haalSchovenBinnen(D, 40, boer);
  assert.equal(T.eigenaarsVan(D, 'graan').get(boer), 40);
  // De herberg brouwt: het bier is van wie er werkt.
  const herberg = D.gebouwen.find((x) => x.soort === 'herberg');
  const makers = T.makersVan(D, herberg);
  assert.ok(makers.length, 'er werkt iemand in de herberg');
  T.zetVoorraad(D, 'graan', 200);
  T.zetVoorraad(D, 'bier', 0);
  T.tikGebouwenDag(D, 40);
  assert.ok((T.eigenaarsVan(D, 'bier').get(makers[0]) || 0) > 0, 'het bier is van de herberg');
});
