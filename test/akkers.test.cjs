// De akkers zonder scherm (js/akkers.js): welk stadium bij welke dag hoort, het windbeeld per
// tegel, de vaste variant per tegel, waar een boer in het seizoen dwaalt, en de oogst zelf (welke
// tegel al gemaaid is, en de gang van T.werkOogstBij van dwalen naar maaien naar klaar).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/akkers.js');
require('../js/voorraad.js');
const T = globalThis.Spel;

function stadiumOp(naam, dag) {
  const maand = T.MAANDEN.findIndex((m) => m.naam === naam);
  return T.akkerStadium(maand, dag);
}

test('geploegd in de vroege lente, dan kiemend', () => {
  assert.equal(stadiumOp('lentemaand', 1), 'geploegd');
  assert.equal(stadiumOp('lentemaand', 10), 'geploegd');
  assert.equal(stadiumOp('lentemaand', 11), 'kiemend');
  assert.equal(stadiumOp('grasmaand', 15), 'kiemend');
});

test('groen vanaf bloeimaand, rijp precies in hooi- en oogstmaand', () => {
  assert.equal(stadiumOp('bloeimaand', 1), 'groen');
  assert.equal(stadiumOp('zomermaand', 30), 'groen');
  assert.equal(stadiumOp('hooimaand', 1), 'rijp');
  assert.equal(stadiumOp('oogstmaand', 30), 'rijp');
});

test('gemaaid na de oogst, tot en met de winter, dan weer geploegd', () => {
  assert.equal(stadiumOp('herfstmaand', 1), 'gemaaid');
  assert.equal(stadiumOp('wintermaand', 30), 'gemaaid');
  // rondom de jaargrens: louwmaand/sprokkelmaand horen nog bij de oogst van vorig jaar
  assert.equal(stadiumOp('louwmaand', 1), 'gemaaid');
  assert.equal(stadiumOp('sprokkelmaand', 28), 'gemaaid');
  assert.equal(stadiumOp('lentemaand', 1), 'geploegd');
});

test('T.akkerStadium werkt ook met een dagteller via T.datumVanDag (dezelfde vorm)', () => {
  const d = T.datumVanDag(0); // 1 lentemaand, dag 0 van het spel
  assert.equal(T.akkerStadium(d.maand, d.dagVanMaand), 'geploegd');
});

test('T.akkerVariant is vast per tegel en blijft binnen het aantal', () => {
  assert.equal(T.akkerVariant(5, 5, 3), T.akkerVariant(5, 5, 3));
  for (let x = 0; x < 20; x++) {
    for (let y = 0; y < 20; y++) {
      const v = T.akkerVariant(x, y, 3);
      assert.ok(v >= 0 && v < 3, `variant ${v} buiten bereik op (${x},${y})`);
    }
  }
  assert.equal(T.akkerVariant(1, 1, 0), 0); // zonder varianten geen deling door nul
});

test('T.akkerVariant gebruikt alle varianten, niet steeds dezelfde (geen behang)', () => {
  const gezien = new Set();
  for (let x = 0; x < 30; x++) for (let y = 0; y < 30; y++) gezien.add(T.akkerVariant(x, y, 3));
  assert.deepEqual([...gezien].sort(), [0, 1, 2]);
});

test('T.windBeeld geeft een beeld 0..7, en verandert met de tijd en de tegel', () => {
  for (let f = 0; f < 40; f++) {
    const b = T.windBeeld(f * 0.3, 3, 4);
    assert.ok(Number.isInteger(b) && b >= 0 && b < 8);
  }
  // dezelfde tijd en tegel geeft altijd hetzelfde beeld (geen geflikker)
  assert.equal(T.windBeeld(12.34, 3, 4), T.windBeeld(12.34, 3, 4));
  // de tijd laat het beeld lopen
  const reeks = new Set();
  for (let t = 0; t < 10; t += 0.5) reeks.add(T.windBeeld(t, 0, 0));
  assert.ok(reeks.size > 1, 'het windbeeld staat de hele tijd stil');
  // twee tegels naast elkaar lopen (op zijn minst soms) uit de pas: dat is de golf
  let verschil = false;
  for (let t = 0; t < 8; t += 0.25) if (T.windBeeld(t, 0, 0) !== T.windBeeld(t, 0, 4)) verschil = true;
  assert.ok(verschil, 'geen golf: alle tegels wuiven precies gelijk');
});

test('T.akkerTegelStadium: gemaaid telt alleen mee zolang het basisstadium "rijp" is', () => {
  const akker = { x: 0, y: 0, b: 2, h: 2, geoogst: new Set(['0,0']) };
  assert.equal(T.akkerTegelStadium(akker, 0, 0, 'rijp'), 'gemaaid');
  assert.equal(T.akkerTegelStadium(akker, 1, 0, 'rijp'), 'rijp'); // nog niet gemaaid
  // ná het vangnet is toch alles gemaaid, ook een tegel die niet in `geoogst` stond
  assert.equal(T.akkerTegelStadium(akker, 1, 1, 'gemaaid'), 'gemaaid');
  // buiten het oogstseizoen doet `geoogst` er niet toe
  assert.equal(T.akkerTegelStadium(akker, 0, 0, 'groen'), 'groen');
});

test('T.akkerTegels somt precies b × h tegels op, vanaf (x, y)', () => {
  const tegels = T.akkerTegels({ x: 10, y: 20, b: 2, h: 3 });
  assert.equal(tegels.length, 6);
  assert.deepEqual(tegels[0], { x: 10, y: 20 });
  assert.deepEqual(tegels[tegels.length - 1], { x: 11, y: 22 });
});

test('T.wandelAnker: in het groeiseizoen rond de akker, anders (of zonder akker) gewoon thuis', () => {
  const akker = { x: 10, y: 10, b: 2, h: 4 };
  const boer = { werkAkkers: [akker], thuis: { x: 0, y: 0 }, straal: 3 };
  const opAkker = T.wandelAnker(boer, 'groen');
  assert.equal(opAkker.x, 10.5);
  assert.equal(opAkker.y, 11.5);
  assert.ok(opAkker.straal >= 2);
  assert.deepEqual(T.wandelAnker(boer, 'geploegd'), { x: 0, y: 0, straal: 3 });
  assert.deepEqual(T.wandelAnker(boer, 'gemaaid'), { x: 0, y: 0, straal: 3 });
  const zonderAkker = { thuis: { x: 5, y: 5 }, straal: 2 };
  assert.deepEqual(T.wandelAnker(zonderAkker, 'rijp'), { x: 5, y: 5, straal: 2 });
  assert.equal(T.wandelAnker({}, 'rijp'), null);
});

// ---------------------------------------------------------------- T.werkOogstBij
//
// T.zoekPad hoort bij js/pad.js (niet hier geladen — dat vraagt om een echt raster) en T.afstand
// bij js/wereld.js; voor deze toets is alleen de vorm van hun antwoord van belang, dus worden ze
// hier met een simpele, eigen versie ingevuld. Het "aankomen" zelf (e.pad leegmaken, e.tx/e.ty
// bijwerken) doet normaal js/anim.js tijdens het lopen; hier wordt dat met de hand nagedaan, één
// stap per keer, precies zoals de echte animator dat ook doet.
T.afstand = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
T.zoekPad = (van, doel) => [{ x: doel.x, y: doel.y }];
T.isBegaanbaar = () => true;
T.isVast = () => false;

function nieuweBoerWereld() {
  const akker = { x: 0, y: 0, b: 2, h: 2, huis: 'boer1', geoogst: new Set() };
  const boer = { tx: 5, ty: 5, x: 5, y: 5, dood: false, pad: [], werkAkkers: [akker] };
  return { w: { wezens: [boer], akkers: [akker] }, akker, boer };
}
// 1 hooimaand: ruim binnen het "rijp"-venster (hooi- en oogstmaand).
const RIJP_DAG = (() => {
  const maand = T.MAANDEN.findIndex((m) => m.naam === 'hooimaand');
  let dag = 0;
  while (T.datumVanDag(dag).maand !== maand || T.datumVanDag(dag).dagVanMaand !== 1) dag++;
  return dag;
})();

test('T.werkOogstBij: buiten het oogstseizoen gebeurt er niets', () => {
  const { w, boer } = nieuweBoerWereld();
  const S = { wereld: w, tijd: 0, kalender: { dag: 0 } }; // dag 0 = geploegd
  T.werkOogstBij(S, 0.1);
  assert.equal(boer.pad.length, 0);
  assert.equal(boer.maait, null);
});

test('T.werkOogstBij: loopt naar een tegel, maait hem, en gaat door tot de hele akker klaar is', () => {
  const { w, akker, boer } = nieuweBoerWereld();
  const S = { wereld: w, tijd: 0, kalender: { dag: RIJP_DAG }, voorraad: { graan: 0 } };

  let veiligheid = 0;
  while (akker.geoogst.size < 4 && veiligheid++ < 200) {
    T.werkOogstBij(S, 0.1);
    if (boer.pad.length) {
      // doe alsof hij is aangekomen (dat doet anders js/anim.js)
      boer.tx = boer.pad[0].x;
      boer.ty = boer.pad[0].y;
      boer.pad = [];
    } else if (boer.maait) {
      S.wereldTijd = boer.maait.tot; // spring naar het eind van deze slag
    }
  }
  assert.equal(akker.geoogst.size, 4, 'niet alle vier de tegels van de akker zijn gemaaid geraakt');
  // elke gemaaide tegel brengt zijn graan binnen, en dat is de enige weg (geen boerderij-opbrengst)
  assert.equal(S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL);
  assert.equal(boer.maait, null);
  assert.equal(boer.oogstDoel, null);
});

test('T.werkOogstBij: een nieuw jaar (geploegd) veegt de oogst van vorig jaar weg', () => {
  const { w, akker, boer } = nieuweBoerWereld();
  akker.geoogst = new Set(['0,0', '1,0', '0,1', '1,1']);
  const S = { wereld: w, tijd: 0, kalender: { dag: 0 } }; // dag 0 = geploegd
  T.werkOogstBij(S, 0.1);
  assert.equal(akker.geoogst.size, 0);
});

// Een boer die met de hand maait tot er niets meer staat: loopt, maait, springt naar het eind van
// de slag (zoals hierboven), met een veiligheidsgrens.
function maaiTotKlaar(S, boer, klaar) {
  let veiligheid = 0;
  while (!klaar() && veiligheid++ < 500) {
    T.werkOogstBij(S, 0.1);
    if (boer.pad.length) {
      boer.tx = boer.pad[0].x;
      boer.ty = boer.pad[0].y;
      boer.pad = [];
    } else if (boer.maait) {
      S.wereldTijd = boer.maait.tot;
    }
  }
}

test('T.werkOogstBij: een boer met twee akkers maait ze allebei (tot 24 sep bleef de tweede staan)', () => {
  const eerste = { x: 0, y: 0, b: 2, h: 1, huis: 'boer1', geoogst: new Set() };
  const tweede = { x: 10, y: 10, b: 1, h: 2, huis: 'boer1', geoogst: new Set() };
  const boer = { tx: 5, ty: 5, x: 5, y: 5, dood: false, pad: [], werkAkkers: [eerste, tweede] };
  const S = { wereld: { wezens: [boer], akkers: [eerste, tweede] }, tijd: 0, kalender: { dag: RIJP_DAG }, voorraad: { graan: 0 } };
  maaiTotKlaar(S, boer, () => eerste.geoogst.size + tweede.geoogst.size === 4);
  assert.equal(eerste.geoogst.size, 2);
  assert.equal(tweede.geoogst.size, 2, 'de tweede akker is niet gemaaid');
  assert.equal(S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL);
});

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}

// Een wereld met twee akkers: één met een boer, één zonder.
function tweeAkkers() {
  const metBoer = { x: 0, y: 0, b: 2, h: 3, huis: 'boer1', geoogst: new Set() };
  const zonder = { x: 10, y: 0, b: 1, h: 4, huis: 'niemand', geoogst: new Set() };
  const boer = { tx: 5, ty: 5, dood: false, pad: [], werkAkkers: [metBoer] };
  const S = { wereld: { wezens: [boer], akkers: [metBoer, zonder] }, tijd: 0, kalender: { dag: 0 }, voorraad: T.nieuweVoorraad() };
  return { S, metBoer, zonder, boer };
}

test('T.haalOogstBinnen: wat na de oogsttijd nog staat, komt alsnog binnen, maar niet zonder boer', () => {
  const { S, metBoer, zonder } = tweeAkkers();
  metBoer.geoogst.add('0,0'); // die had hij al gemaaid (en dat graan is al binnen)
  const tegels = T.haalOogstBinnen(S);
  assert.equal(tegels, 5);
  assert.equal(S.voorraad.graan, 5 * T.GRAAN_PER_TEGEL);
  assert.equal(metBoer.geoogst.size, 6);
  assert.equal(zonder.geoogst.size, 0, 'een akker zonder boer rot nog wel: niemand haalt hem binnen');
  // Nog een keer levert niets meer op: het staat er niet meer.
  assert.equal(T.haalOogstBinnen(S), 0);
  assert.equal(S.voorraad.graan, 5 * T.GRAAN_PER_TEGEL);
});

test('T.tikAkkersDag: het vangnet valt op 1 herfstmaand, de eerste dag na de oogsttijd', () => {
  const { S } = tweeAkkers();
  T.tikAkkersDag(S, dagVan('oogstmaand', 30));
  assert.equal(S.voorraad.graan, 0);
  T.tikAkkersDag(S, dagVan('herfstmaand', 1));
  assert.equal(S.voorraad.graan, 6 * T.GRAAN_PER_TEGEL);
});

test('T.zaaiAkkers: genoeg zaaigraan, dan gaat alles de grond in en blijft er niets ongezaaid', () => {
  const { S, metBoer, zonder } = tweeAkkers();
  T.zetVoorraad(S, 'graan', 50);
  const r = T.zaaiAkkers(S);
  assert.deepEqual(r, { tegels: 10, gezaaid: 10, ongezaaid: 0, graan: 10 * T.ZAAIGRAAN_PER_TEGEL });
  assert.equal(S.voorraad.graan, 50 - 10 * T.ZAAIGRAAN_PER_TEGEL);
  assert.equal(metBoer.ongezaaid.size + zonder.ongezaaid.size, 0);
});

test('T.zaaiAkkers: te weinig zaaigraan, dan blijft het verste stuk van elke akker ongezaaid', () => {
  const { S, metBoer, zonder } = tweeAkkers();
  T.zetVoorraad(S, 'graan', 5 * T.ZAAIGRAAN_PER_TEGEL); // voor de helft van de tien tegels
  const r = T.zaaiAkkers(S);
  assert.equal(r.gezaaid, 5);
  assert.equal(r.ongezaaid, 5);
  assert.equal(S.voorraad.graan, 0);
  // Naar rato: 6 en 4 tegels worden 3 en 2 gezaaid, elk gezin een deel.
  assert.equal(metBoer.ongezaaid.size, 3);
  assert.equal(zonder.ongezaaid.size, 2);
  // Het ongezaaide stuk ligt achteraan (T.akkerTegels telt vanaf de hoek), dus de hoek zelf is gezaaid.
  assert.ok(!metBoer.ongezaaid.has('0,0'));
  assert.ok(metBoer.ongezaaid.has('1,2'));
  // Een ongezaaide tegel groeit niet en valt niet te maaien.
  assert.equal(T.akkerTegelStadium(metBoer, 1, 2, 'rijp'), 'geploegd');
  assert.equal(T.akkerTegelStadium(metBoer, 0, 0, 'rijp'), 'rijp');
  assert.equal(T.akkerOnbeslistTegels(metBoer).length, 3);
  // En het vangnet haalt ook alleen binnen wat gezaaid was.
  assert.equal(T.haalOogstBinnen(S), 3);
});

test('T.zaaiAkkers: zonder graan blijft alles ongezaaid, en de oogst van vorig jaar is vergeten', () => {
  const { S, metBoer, zonder } = tweeAkkers();
  metBoer.geoogst.add('0,0');
  const r = T.zaaiAkkers(S);
  assert.equal(r.gezaaid, 0);
  assert.equal(metBoer.ongezaaid.size + zonder.ongezaaid.size, 10);
  assert.equal(metBoer.geoogst.size, 0);
});

test('T.tikAkkersDag: het eerste jaar is al gezaaid, vanaf het tweede kost zaaien graan', () => {
  const { S, metBoer } = tweeAkkers();
  T.zetVoorraad(S, 'graan', 100);
  T.tikAkkersDag(S, 0); // 1 lentemaand van het eerste jaar
  assert.equal(S.voorraad.graan, 100);
  assert.equal(metBoer.ongezaaid, undefined);
  T.tikAkkersDag(S, dagVan('lentemaand', 1, 1)); // een jaar later
  assert.equal(S.voorraad.graan, 100 - 10 * T.ZAAIGRAAN_PER_TEGEL);
  assert.equal(metBoer.ongezaaid.size, 0);
  T.tikAkkersDag(S, dagVan('lentemaand', 2, 1)); // de dag erna niet nog eens
  assert.equal(S.voorraad.graan, 100 - 10 * T.ZAAIGRAAN_PER_TEGEL);
});

// ---------------------------------------------------------------------------------------------
// Velden: akker, weide of braak (ontwerp/spel.md, "Weides met koeien en schapen", stap 1). Het vee
// zelf (js/vee.js) staat in test/vee.test.cjs; hier is het niet geladen, dus is er niets om op te
// letten als een weide iets anders wordt.
// ---------------------------------------------------------------------------------------------

const bijna = (a, b) => Math.abs(a - b) < 1e-9;

// Drie velden van 2×2 naast elkaar, van één boer: een akker, een weide en een braak.
function drieVelden() {
  const veld = (naam, x, bestemming) => ({
    naam, x, y: 0, b: 2, h: 2, huis: 'boer1', bestemming, plan: bestemming, vruchtbaarheid: 1, geoogst: new Set(),
  });
  const akker = veld('akker', 0, 'akker');
  const weide = veld('weide', 3, 'weide');
  const braak = veld('braak', 6, 'braak');
  const boer = { tx: 5, ty: 5, x: 5, y: 5, dood: false, pad: [], werkAkkers: [akker, weide, braak] };
  const S = { wereld: { wezens: [boer], akkers: [akker, weide, braak] }, tijd: 0, kalender: { dag: 0 }, voorraad: T.nieuweVoorraad() };
  return { S, akker, weide, braak, boer };
}

test('een veld zonder bestemming is een akker, en zonder plan blijft het wat het is', () => {
  assert.equal(T.bestemmingVan({}), 'akker');
  assert.equal(T.bestemmingVan({ bestemming: 'wei' }), 'akker', 'een verschrijving is geen nieuwe soort veld');
  assert.equal(T.planVan({ bestemming: 'weide' }), 'weide');
  assert.equal(T.planVan({ bestemming: 'weide', plan: 'braak' }), 'braak');
  assert.equal(T.vruchtbaarheidVan({}), T.VELDEN_INSTELLINGEN.beginVruchtbaarheid);
  const { S, akker, weide, boer } = drieVelden();
  assert.equal(T.veldOp(S.wereld, 4, 1), weide);
  assert.equal(T.veldOp(S.wereld, 2, 0), null, 'tussen twee velden');
  assert.equal(T.boerVanVeld(S, akker), boer);
});

test('alleen akkers worden gezaaid, en alleen akkers kosten zaaigraan', () => {
  const { S, akker, weide, braak } = drieVelden();
  T.zetVoorraad(S, 'graan', 100);
  const r = T.zaaiAkkers(S);
  assert.deepEqual(r, { tegels: 4, gezaaid: 4, ongezaaid: 0, graan: 4 * T.ZAAIGRAAN_PER_TEGEL });
  assert.equal(S.voorraad.graan, 100 - 4 * T.ZAAIGRAAN_PER_TEGEL);
  // Een weide of braak is niet "ongezaaid" (dat is een tekort aan zaaigraan): het is geen akker.
  assert.equal(weide.ongezaaid.size + braak.ongezaaid.size, 0);
  // Op een weide of braak valt niets te maaien.
  assert.equal(T.akkerOnbeslistTegels(akker).length, 4);
  assert.equal(T.akkerOnbeslistTegels(weide).length, 0);
  assert.equal(T.akkerOnbeslistTegels(braak).length, 0);
  // Wat de tekencode per tegel vraagt: graan op de akker, gras op de weide, kale grond op de braak.
  assert.equal(T.akkerTegelStadium(akker, 0, 0, 'groen'), 'groen');
  assert.equal(T.akkerTegelStadium(weide, 3, 0, 'groen'), 'weide');
  assert.equal(T.akkerTegelStadium(braak, 6, 0, 'rijp'), 'geploegd');
  // Is er nergens akker, dan kost zaaien niets.
  const geen = drieVelden();
  geen.akker.bestemming = 'braak';
  T.zetVoorraad(geen.S, 'graan', 100);
  assert.deepEqual(T.zaaiAkkers(geen.S), { tegels: 0, gezaaid: 0, ongezaaid: 0, graan: 0 });
  assert.equal(geen.S.voorraad.graan, 100);
});

test('de oogst gaat maal de vruchtbaarheid: bij het maaien, en bij het vangnet', () => {
  const { S, akker, boer } = drieVelden();
  akker.vruchtbaarheid = 0.6;
  S.kalender.dag = RIJP_DAG;
  maaiTotKlaar(S, boer, () => akker.geoogst.size === 4);
  assert.equal(akker.geoogst.size, 4);
  assert.ok(bijna(S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL * 0.6), `${S.voorraad.graan}`);
  const v = drieVelden();
  v.akker.vruchtbaarheid = 0.6;
  assert.equal(T.haalOogstBinnen(v.S), 4, 'alleen de akker: op de weide en de braak stond niets');
  assert.ok(bijna(v.S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL * 0.6), `${v.S.voorraad.graan}`);
  assert.ok(bijna(T.oogstPerTegel(v.akker), T.GRAAN_PER_TEGEL * 0.6));
});

test('op de jaarwissel verandert de vruchtbaarheid naar wat het veld was, en wordt het plan de bestemming', () => {
  const V = T.VELDEN_INSTELLINGEN;
  const { S, akker, weide, braak } = drieVelden();
  akker.vruchtbaarheid = 0.9;
  weide.vruchtbaarheid = 0.5;
  braak.vruchtbaarheid = 0.5;
  akker.plan = 'weide';
  weide.plan = 'akker';
  const verslag = T.wisselVelden(S);
  assert.ok(bijna(akker.vruchtbaarheid, 0.9 - V.akkerPutUit), `${akker.vruchtbaarheid}`);
  assert.ok(bijna(weide.vruchtbaarheid, 0.5 + V.weideMest), `${weide.vruchtbaarheid}`);
  assert.ok(bijna(braak.vruchtbaarheid, 0.5 + V.braakRust), `${braak.vruchtbaarheid}`);
  assert.deepEqual([akker.bestemming, weide.bestemming, braak.bestemming], ['weide', 'akker', 'braak']);
  assert.deepEqual([akker.plan, weide.plan, braak.plan], ['weide', 'akker', 'braak'], 'het volgende plan begint gelijk');
  assert.deepEqual(verslag.map((x) => `${x.was}→${x.wordt}`), ['akker→weide', 'weide→akker', 'braak→braak']);
  // Nooit boven 1, en nooit onder het laagste.
  const rand = drieVelden();
  rand.weide.vruchtbaarheid = 0.95;
  rand.akker.vruchtbaarheid = 0.05;
  T.wisselVelden(rand.S);
  assert.equal(rand.weide.vruchtbaarheid, 1);
  assert.equal(rand.akker.vruchtbaarheid, V.laagste);
});

test('akker, akker, weide houdt het land vruchtbaar; akker, akker, braak nét niet; altijd akker put uit', () => {
  // Een veld dat elk jaar het volgende uit de rij wordt, zoveel jaarwissels lang.
  const draai = (rij, wissels) => {
    const veld = { x: 0, y: 0, b: 1, h: 1, bestemming: rij[0], vruchtbaarheid: 1 };
    const S = { wereld: { wezens: [], akkers: [veld] } };
    for (let j = 1; j <= wissels; j++) {
      veld.plan = rij[j % rij.length];
      T.wisselVelden(S);
    }
    return veld.vruchtbaarheid;
  };
  assert.ok(bijna(draai(['akker', 'akker', 'weide'], 9), 1));
  const drieslag = draai(['akker', 'akker', 'braak'], 9);
  assert.ok(drieslag < 1 && drieslag > 0.8, `${drieslag}`);
  assert.ok(bijna(draai(['akker'], 3), 1 - 3 * T.VELDEN_INSTELLINGEN.akkerPutUit));
  // Tien jaar akker zakt tot het laagste en niet verder: vergeten is niet meteen honger.
  assert.ok(T.VELDEN_INSTELLINGEN.laagste > 0);
  assert.equal(draai(['akker'], 10), T.VELDEN_INSTELLINGEN.laagste);
});

test('op 1 lentemaand eerst de wissel, dan het zaaien: wat akker wordt, wordt gezaaid', () => {
  const { S, akker, weide } = drieVelden();
  T.zetVoorraad(S, 'graan', 100);
  akker.plan = 'braak';
  weide.plan = 'akker';
  T.tikAkkersDag(S, dagVan('lentemaand', 1, 1));
  assert.equal(akker.bestemming, 'braak');
  assert.equal(weide.bestemming, 'akker');
  assert.equal(S.voorraad.graan, 100 - 4 * T.ZAAIGRAAN_PER_TEGEL, 'alleen de nieuwe akker kost zaaigraan');
  assert.equal(T.akkerOnbeslistTegels(weide).length, 4);
  assert.equal(T.akkerOnbeslistTegels(akker).length, 0);
  // Het eerste jaar wisselt er niets: dat is al gezaaid, en het plan is voor volgend jaar.
  const eerste = drieVelden();
  eerste.akker.plan = 'weide';
  T.tikAkkersDag(eerste.S, 0);
  assert.equal(eerste.akker.bestemming, 'akker');
  assert.equal(eerste.akker.vruchtbaarheid, 1);
});

test('met de optie "Het land blijft goed" geeft een akker altijd zijn volle graan, en verandert er niets', () => {
  const V = T.VELDEN_INSTELLINGEN;
  V.vruchtbaarheid = false;
  try {
    const { S, akker } = drieVelden();
    akker.vruchtbaarheid = 0.5;
    assert.equal(T.vruchtbaarheidVan(akker), 1);
    assert.equal(T.oogstPerTegel(akker), T.GRAAN_PER_TEGEL);
    assert.equal(T.haalOogstBinnen(S), 4);
    assert.equal(S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL);
    T.wisselVelden(S);
    assert.equal(akker.vruchtbaarheid, 0.5, 'hij blijft staan waar hij stond');
  } finally {
    V.vruchtbaarheid = true;
  }
});

test('T.kanBestemming: het plan mag het hele jaar veranderen, met een reden als het niet kan', () => {
  const { S, akker } = drieVelden();
  assert.deepEqual(T.kanBestemming(S, akker, 'weide'), { kan: true, reden: null });
  assert.deepEqual(T.kanBestemming(S, akker, 'akker'), { kan: false, reden: 'Het wordt volgend jaar al akker.' });
  assert.deepEqual(T.kanBestemming(S, akker, 'bos'), { kan: false, reden: 'Een veld is akker, weide of braak.' });
  assert.equal(T.kanBestemming(S, null, 'akker').kan, false);
  // Zetten gaat langs dezelfde vraag; wat het nu is, blijft het tot 1 lentemaand.
  assert.deepEqual(T.zetPlan(S, akker, 'braak'), { kan: true, reden: null });
  assert.equal(akker.plan, 'braak');
  assert.equal(akker.bestemming, 'akker');
  assert.equal(T.zetPlan(S, akker, 'bos').kan, false);
  assert.equal(akker.plan, 'braak');
});

test('T.wandelAnker: in het groeiseizoen staat een boer bij zijn eerste akker, niet bij zijn weide', () => {
  const { weide, akker, boer } = drieVelden();
  boer.werkAkkers = [weide, akker];
  boer.thuis = { x: 20, y: 20 };
  const anker = T.wandelAnker(boer, 'groen');
  assert.equal(anker.x, akker.x + 0.5);
  boer.werkAkkers = [weide];
  assert.deepEqual(T.wandelAnker(boer, 'groen'), { x: 20, y: 20, straal: 3 }, 'alleen een weide: dan thuis');
});

test('T.werkOogstBij: een boer die al op een ongemaaide tegel staat, begint daar (tot 25 sep bleef hij staan)', () => {
  const { w, akker, boer } = nieuweBoerWereld();
  boer.tx = boer.x = 1;
  boer.ty = boer.y = 1; // midden op zijn akker, zoals hij in het groeiseizoen dwaalt
  const echtPad = T.zoekPad;
  T.zoekPad = (van, doel) => (van.x === doel.x && van.y === doel.y ? [] : [{ x: doel.x, y: doel.y }]); // zoals js/pad.js
  try {
    const S = { wereld: w, tijd: 0, kalender: { dag: RIJP_DAG }, voorraad: { graan: 0 } };
    T.werkOogstBij(S, 0.1);
    assert.ok(boer.maait, 'hij maait meteen de tegel waar hij staat');
    assert.deepEqual([boer.maait.x, boer.maait.y], [1, 1]);
    maaiTotKlaar(S, boer, () => akker.geoogst.size === 4);
    assert.equal(akker.geoogst.size, 4);
  } finally {
    T.zoekPad = echtPad;
  }
});
