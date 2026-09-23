// De akkers zonder scherm (js/akkers.js): welk stadium bij welke dag hoort, het windbeeld per
// tegel, de vaste variant per tegel, waar een boer in het seizoen dwaalt, en de oogst zelf (welke
// tegel al gemaaid is, en de gang van T.werkOogstBij van dwalen naar maaien naar klaar).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/akkers.js');
require('../js/voorraad.js');
const T = globalThis.Toren;

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
      S.tijd = boer.maait.tot; // spring naar het eind van deze slag
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
