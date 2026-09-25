// De weides, stap 2: de winter (ontwerp/spel.md, "Het hooi beslist hoeveel land een koe kost" en
// "Marcel koos voor stap 2", 25 sep 2026). In hooimaand maaien de boeren eerst het hooi van hun
// weide en dan hun graan (js/akkers.js, T.werkOogstBij); wat blijft staan, halen ze op 1 oogstmaand
// in één keer binnen. Van slachtmaand tot en met lentemaand eet het vee dat hooi (js/vee.js,
// T.voerHooi): het oudste eerst, en wie tekortkomt, sterft na een tijd van honger.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/wereld.js');
require('../js/mensen.js');
require('../js/vee.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/akkers.js');
require('../js/boeren.js');
require('../js/spreuken.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
const T = globalThis.Toren;

const IN = T.VEE_INSTELLINGEN;
const bijna = (a, b) => Math.abs(a - b) < 1e-9;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}

// Wat de spelregels zeggen, even anders, en daarna weer terug.
function metInstelling(blok, waarden, fn) {
  const oud = JSON.parse(JSON.stringify(blok));
  Object.assign(blok, waarden);
  try {
    return fn();
  } finally {
    Object.assign(blok, oud);
  }
}

// Een wereld van 30 bij 30 open land, met deze velden, en een boer die ze allemaal bewerkt.
function boerMet(velden, opties) {
  const akkers = velden.map((v, i) => ({ naam: `veld${i}`, huis: 'boer1', plan: v.bestemming, vruchtbaarheid: 1, geoogst: new Set(), gehooid: new Set(), ...v }));
  const boer = { naam: 'Klaas', tx: 12, ty: 12, x: 12, y: 12, dood: false, pad: [], werkAkkers: akkers.slice(), huis: 'boer1' };
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, tijd: 0,
    kalender: { dag: (opties && opties.dag) || dagVan('hooimaand', 1) }, lot: { zaad: 42 },
    wereld: {
      b: 30, h: 30, wezens: [boer], akkers, meenten: [],
      tegels: Array.from({ length: 30 }, () => Array(30).fill('gras')),
      voorwerpen: [], deuren: new Map(), buiten: true,
    },
  };
  return { S, boer, velden: akkers };
}

// Laat de boer maaien tot `klaar()`: hij komt meteen aan waar hij heen loopt, en elke slag is meteen
// af (zoals test/akkers.test.cjs, maar met het echte T.zoekPad).
function maaiTot(S, boer, klaar, max = 400) {
  const volgorde = [];
  for (let i = 0; i < max && !klaar(); i++) {
    T.werkOogstBij(S, 0.1);
    if (boer.pad.length) {
      const eind = boer.pad[boer.pad.length - 1];
      boer.x = boer.tx = eind.x;
      boer.y = boer.ty = eind.y;
      boer.pad = [];
    } else if (boer.maait) {
      volgorde.push(boer.maait.hooi ? 'hooi' : 'graan');
      S.tijd = boer.maait.tot;
    }
  }
  return volgorde;
}

// Zet n dieren van één soort op een veld (of de meent), in de hoek; `geboren` maakt er jongen van.
function zet(S, veld, soort, n, geboren) {
  const dieren = [];
  for (let i = 0; i < n; i++) {
    const e = T.zetOpWeide(T.maakDier(soort, veld.x + (i % veld.b), veld.y + Math.floor(i / veld.b), 100 + S.wereld.wezens.length), veld);
    if (geboren != null) e.geboren = geboren;
    S.wereld.wezens.push(e);
    dieren.push(e);
  }
  return dieren;
}

test('in hooimaand maait de boer eerst het hooi van zijn weide, en dan pas zijn graan', () => {
  const { S, boer, velden: [akker, weide] } = boerMet([
    { x: 2, y: 2, b: 2, h: 2, bestemming: 'akker' },
    { x: 8, y: 2, b: 2, h: 3, bestemming: 'weide' },
  ]);
  const volgorde = maaiTot(S, boer, () => akker.geoogst.size === 4);
  assert.deepEqual(volgorde, ['hooi', 'hooi', 'hooi', 'hooi', 'hooi', 'hooi', 'graan', 'graan', 'graan', 'graan']);
  assert.equal(weide.gehooid.size, 6);
  assert.ok(bijna(S.voorraad.hooi, 6 * IN.hooiPerTegel));
  assert.ok(bijna(S.voorraad.graan, 4 * T.GRAAN_PER_TEGEL));
  assert.equal(weide.geoogst.size, 0, 'een weide geeft geen graan');
});

test('een koe gaat niet opzij voor een zeis: de boer maait eerst de tegels waar niemand staat', () => {
  const { S, boer, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 2, h: 1, bestemming: 'weide' }]);
  const [koe] = zet(S, weide, 'koe', 1); // op 2,2
  maaiTot(S, boer, () => weide.gehooid.size === 1);
  assert.deepEqual([...weide.gehooid], ['3,2'], 'de tegel van de koe blijft staan');
  // Loopt ze weg, dan komt die tegel ook aan de beurt.
  koe.x = koe.tx = 20;
  maaiTot(S, boer, () => weide.gehooid.size === 2);
  assert.equal(weide.gehooid.size, 2);
});

test('buiten hooimaand maait niemand hooi; op 1 oogstmaand komt de rest in één keer binnen, maar niet zonder boer', () => {
  const { S, boer, velden: [weide, zonder] } = boerMet([
    { x: 2, y: 2, b: 2, h: 2, bestemming: 'weide' },
    { x: 8, y: 8, b: 1, h: 2, bestemming: 'weide', huis: 'niemand' },
  ]);
  boer.werkAkkers = [weide];
  S.kalender.dag = dagVan('oogstmaand', 5);
  maaiTot(S, boer, () => false, 20);
  assert.equal(weide.gehooid.size, 0, 'in oogstmaand is het graan aan de beurt');
  assert.equal(S.voorraad.hooi || 0, 0);
  // Het vangnet valt op de eerste dag na hooimaand.
  T.tikAkkersDag(S, dagVan('hooimaand', 30));
  assert.equal(S.voorraad.hooi || 0, 0);
  T.tikAkkersDag(S, dagVan('oogstmaand', 1));
  assert.ok(bijna(S.voorraad.hooi, 4 * IN.hooiPerTegel));
  assert.equal(zonder.gehooid.size, 0, 'een weide zonder boer maait niemand');
  assert.equal(T.haalHooiBinnen(S), 0, 'nog een keer levert niets meer op');
});

test('een nieuw jaar veegt het hooi van vorig jaar weg: in hooimaand staat de weide er weer', () => {
  const { S, boer, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 2, h: 2, bestemming: 'weide' }]);
  weide.gehooid = new Set(['2,2', '3,2', '2,3', '3,3']);
  assert.equal(T.weideHooiTegels(weide).length, 0);
  S.kalender.dag = dagVan('lentemaand', 1, 1);
  T.werkOogstBij(S, 0.1);
  assert.equal(weide.gehooid.size, 0);
  assert.equal(T.weideHooiTegels(weide).length, 4);
  void boer;
});

test('T.verwachtHooi: wat de weides met een boer nog geven', () => {
  const { S, velden: [weide] } = boerMet([
    { x: 2, y: 2, b: 3, h: 2, bestemming: 'weide' },
    { x: 8, y: 2, b: 2, h: 2, bestemming: 'akker' },
  ]);
  assert.ok(bijna(T.verwachtHooi(S), 6 * IN.hooiPerTegel));
  weide.gehooid = new Set(['2,2', '3,2']);
  assert.ok(bijna(T.verwachtHooi(S), 4 * IN.hooiPerTegel));
});

test('de winter duurt van slachtmaand tot en met lentemaand: 150 dagen', () => {
  assert.equal(T.winterDagen(dagVan('slachtmaand', 1)), 150);
  assert.equal(T.winterDagen(dagVan('lentemaand', 15)), 16);
  assert.equal(T.winterDagen(dagVan('bloeimaand', 1)), 150, 'buiten de winter: de hele volgende');
  assert.equal(T.isVeeWinter(dagVan('lentemaand', 30)), true);
  assert.equal(T.isVeeWinter(dagVan('grasmaand', 1)), false);
  assert.equal(T.isVeeWinter(dagVan('wijnmaand', 30)), false);
  // Een koe voor een hele winter: het hooi van 12 tegels, de vuistregel uit spel.md.
  assert.ok(bijna(150 * IN.hooiPerDag.koe / IN.hooiPerTegel, 12));
});

test('T.voerHooi: een koe eet één hooi per winterdag, een kalf de helft, een schaap op de heide niets', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 5, h: 5, bestemming: 'weide' }]);
  const dag = dagVan('slachtmaand', 1);
  zet(S, weide, 'koe', 2);
  zet(S, weide, 'koe', 1, dag - 200); // een kalf van dit jaar
  zet(S, weide, 'schaap', 3);
  assert.equal(T.hooiPerWinterdag(S, dag), 2.5);
  T.zetVoorraad(S, 'hooi', 10);
  const r = T.voerHooi(S, dag);
  assert.equal(r.nodig, 2.5);
  assert.equal(r.gegeten, 2.5);
  assert.equal(S.voorraad.hooi, 7.5);
  assert.ok(T.veeVan(S).every((e) => !e.honger));
  // Met de optie eten de schapen ook hooi.
  metInstelling(IN, { hooiPerDag: { koe: 1, schaap: 0.2 } }, () => assert.ok(bijna(T.hooiPerWinterdag(S, dag), 3.1)));
});

test('te weinig hooi: het jongste krijgt honger, en na tien dagen sterft het; wie weer eet, knapt op', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 5, h: 5, bestemming: 'weide' }]);
  const dag = dagVan('slachtmaand', 1);
  const [oud, jong] = [zet(S, weide, 'koe', 1)[0], zet(S, weide, 'koe', 1, dag - 200)[0]];
  // Elke dag net genoeg voor de oude koe: het kalf krijgt niets.
  for (let i = 0; i < IN.hongerDagen - 1; i++) {
    T.zetVoorraad(S, 'hooi', 1);
    T.voerHooi(S, dag + i);
  }
  assert.equal(oud.honger, 0);
  assert.equal(jong.honger, IN.hongerDagen - 1);
  assert.equal(T.veeVan(S).length, 2, 'nog even volhouden');
  // Eén dag genoeg voor allebei: het kalf knapt een dag op.
  T.zetVoorraad(S, 'hooi', 1.5);
  T.voerHooi(S, dag + 20);
  assert.equal(jong.honger, IN.hongerDagen - 2);
  // En dan weer niets: nog twee dagen, en het sterft.
  for (let i = 0; i < 2; i++) {
    T.zetVoorraad(S, 'hooi', 1);
    T.voerHooi(S, dag + 21 + i);
  }
  assert.deepEqual(T.veeVan(S), [oud], 'het kalf is gestorven, de koe niet');
  assert.ok(jong.dood);
  assert.ok(!S.wereld.wezens.includes(jong), 'weg uit de wereld');
});

test('een winterdag in het spel: het vee eet hooi, en in de zomer niet', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 5, h: 5, bestemming: 'weide' }]);
  zet(S, weide, 'koe', 3);
  T.zetVoorraad(S, 'hooi', 100);
  T.tikVeeDag(S, dagVan('bloeimaand', 1));
  assert.equal(S.voorraad.hooi, 100);
  T.tikVeeDag(S, dagVan('wintermaand', 1));
  assert.equal(S.voorraad.hooi, 97);
  // Zonder winterzorg eet niemand hooi, en maait niemand het.
  metInstelling(IN, { winterzorg: false }, () => {
    T.tikVeeDag(S, dagVan('wintermaand', 2));
    assert.equal(S.voorraad.hooi, 97);
    assert.equal(T.isHooitijd(T.datumVanDag(dagVan('hooimaand', 1))), false);
    assert.equal(T.verwachtHooi(S), 0);
  });
});

test('het gehucht begint met hooi voor de rest van de winter: drie koeien, dertig dagen lentemaand', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const koeien = () => T.veeVan(S).filter((e) => e.dier === 'koe').length;
  assert.equal(koeien(), IN.beginKudde.koe);
  const begin = S.voorraad.hooi;
  assert.ok(begin >= koeien() * 30, `${begin} hooi voor ${koeien()} koeien`);
  for (let dag = 0; dag < 30; dag++) T.tikVeeDag(S, dag);
  assert.equal(koeien(), IN.beginKudde.koe, 'niemand verhongerd');
  assert.ok(bijna(S.voorraad.hooi, begin - 30 * koeien()));
  assert.equal(T.isVeeWinter(30), false, 'op 1 grasmaand graast het weer');
});

// ---------------------------------------------------------------- slachten

test('T.kuddeGroepen: koeien, kalveren, schapen en lammeren, elk het oudste eerst', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 6, h: 6, bestemming: 'weide' }]);
  const dag = dagVan('slachtmaand', 1);
  const oud = zet(S, weide, 'koe', 2);
  const kalf = zet(S, weide, 'koe', 1, dag - 200);
  const lam = zet(S, weide, 'schaap', 1, dag - 150);
  const groepen = T.kuddeGroepen(S, dag);
  assert.deepEqual(groepen.map((g) => [g.naam, g.meervoud, g.dieren.length]), [['koe', 'koeien', 2], ['kalf', 'kalveren', 1], ['lam', 'lammeren', 1]]);
  assert.deepEqual(groepen[0].dieren, oud);
  assert.deepEqual(groepen[1].dieren, kalf);
  assert.deepEqual(groepen[2].dieren, lam);
  // Het oudste eerst: wie eerder geboren is, staat vooraan.
  const nieuwer = zet(S, weide, 'koe', 1, dag - 100)[0];
  assert.deepEqual(T.kuddeGroepen(S, dag)[1].dieren, [...kalf, nieuwer]);
});

test('T.slachtVoorstel: zo weinig als kan, zodat het hooi de winter haalt; een kalf als dat volstaat', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 6, h: 6, bestemming: 'weide' }]);
  const dag = dagVan('slachtmaand', 1);
  zet(S, weide, 'koe', 3);
  const [kalf] = zet(S, weide, 'koe', 1, dag - 200);
  zet(S, weide, 'schaap', 4); // eten geen hooi, dus komen niet in het voorstel
  // 3,5 hooi per dag, 150 dagen: 525 nodig.
  T.zetVoorraad(S, 'hooi', 525);
  assert.deepEqual(T.slachtVoorstel(S, dag).dieren, [], 'genoeg hooi: niemand');
  // 460 hooi: 65 te weinig, dat is 0,43 per dag: het kalf (0,5) is genoeg.
  T.zetVoorraad(S, 'hooi', 460);
  assert.deepEqual(T.slachtVoorstel(S, dag).dieren, [kalf]);
  // 300 hooi: 2 per dag. Eerst de oudste koe (1), dan is er 0,5 tekort: het kalf.
  T.zetVoorraad(S, 'hooi', 300);
  const v = T.slachtVoorstel(S, dag);
  assert.equal(v.dieren.length, 2);
  assert.equal(v.dieren[1], kalf);
  assert.equal(v.dieren[0].geboren, undefined, 'eerst een koe van de beginkudde');
  assert.equal(v.perDag, 2);
  assert.equal(v.winter, 150);
});

test('T.slacht: weg uit de wereld, en vlees en huiden in de voorraad (een jong de helft van het vlees)', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 6, h: 6, bestemming: 'weide' }]);
  const dag = dagVan('slachtmaand', 1);
  const [koe] = zet(S, weide, 'koe', 1);
  const [kalf] = zet(S, weide, 'koe', 1, dag - 200);
  const [schaap] = zet(S, weide, 'schaap', 1);
  const o = T.slacht(S, [koe, kalf, schaap], dag);
  const s = IN.slacht;
  assert.deepEqual(o, { vlees: s.koe.vlees * 1.5 + s.schaap.vlees, huiden: 3 });
  assert.equal(S.voorraad.vlees, o.vlees);
  assert.equal(S.voorraad.huiden, 3);
  assert.equal(T.veeVan(S).length, 0);
  assert.ok(koe.dood && !S.wereld.wezens.includes(koe));
});

test('op 1 slachtmaand vraagt het dorp wie er naar de slager gaat; het venster opent als je rondloopt', () => {
  const { S, velden: [weide] } = boerMet([{ x: 2, y: 2, b: 6, h: 6, bestemming: 'weide' }]);
  zet(S, weide, 'koe', 2);
  T.zetVoorraad(S, 'hooi', 1000);
  T.tikVeeDag(S, dagVan('wijnmaand', 30));
  assert.ok(!S.vee.slachtVraag);
  const geopend = [];
  T.ui = { openSlachten: (s) => geopend.push(s.modus) };
  try {
    S.modus = 'dialoog';
    T.tikVeeDag(S, dagVan('slachtmaand', 1));
    assert.equal(S.vee.slachtVraag, true);
    assert.deepEqual(geopend, [], 'niet midden in een gesprek');
    S.modus = 'verkennen';
    T.tikVeeDag(S, dagVan('slachtmaand', 2));
    assert.deepEqual(geopend, ['verkennen'], 'daarna wel');
  } finally {
    delete T.ui;
  }
});
