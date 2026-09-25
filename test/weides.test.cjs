// De weides, stap 2 (ontwerp/spel.md, "Marcel koos voor stap 2", 25 sep 2026): velden naast elkaar
// die allebei weide zijn, zijn samen één weide met één kudde (T.weideGroepen, js/vee.js), en de
// schapen grazen op de meent, de heide, en slapen in de schaapskooi. Stap 1 (één veld, één kudde)
// toetst test/vee.test.cjs; het dwalen daar test/velden.test.cjs.
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

// Een wereld zonder kaart, met deze velden ({ x, y, b, h, bestemming }), een vast lot, en zo nodig een
// meent. Groot genoeg om over te lopen: een raster van 40 bij 40 open land.
function wereldMet(velden, meent) {
  const akkers = velden.map((v, i) => ({ naam: `veld${i}`, huis: null, plan: v.bestemming, vruchtbaarheid: 1, ...v }));
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, tijd: 0,
    kalender: { dag: 0, snelheid: 1 }, lot: { zaad: 42 },
    wereld: {
      b: 40, h: 40, wezens: [], akkers, meenten: meent ? [{ naam: 'heide', meent: true, ...meent }] : [],
      tegels: Array.from({ length: 40 }, () => Array(40).fill('gras')),
      voorwerpen: [], deuren: new Map(), buiten: true,
    },
  };
  return { S, velden: akkers, meent: S.wereld.meenten[0] || null };
}

// Zet n dieren van één soort op een veld (of de meent), in de hoek.
function zet(S, veld, soort, n) {
  const dieren = [];
  for (let i = 0; i < n; i++) {
    const e = T.zetOpWeide(T.maakDier(soort, veld.x + (i % veld.b), veld.y + Math.floor(i / veld.b), 100 + S.wereld.wezens.length), veld);
    S.wereld.wezens.push(e);
    dieren.push(e);
  }
  return dieren;
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

const sleutels = (set) => [...set].sort();

test('T.weideGroepen: velden die elkaar raken, of met één tegel ertussen, zijn samen één weide', () => {
  // a en b raken elkaar; c ligt één tegel onder b; d ligt twee tegels naast c; e raakt a alleen schuin.
  const { S, velden: [a, b, c, d, e] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 4, bestemming: 'weide' },
    { x: 2, y: 0, b: 3, h: 4, bestemming: 'weide' },
    { x: 2, y: 5, b: 3, h: 2, bestemming: 'weide' },
    { x: 7, y: 5, b: 2, h: 2, bestemming: 'weide' },
    { x: 10, y: 10, b: 1, h: 1, bestemming: 'weide' },
  ]);
  const groepen = T.weideGroepen(S.wereld);
  assert.equal(groepen.length, 3);
  const [abc, dd, ee] = groepen;
  assert.deepEqual(abc.velden, [a, b, c], 'in de volgorde van w.akkers');
  assert.deepEqual(sleutels(abc.tussen), ['2,4', '3,4', '4,4'], 'de strook tussen b en c hoort erbij');
  assert.equal(abc.tegels, 8 + 12 + 6, 'het gras: de strook telt niet mee');
  assert.deepEqual(dd.velden, [d]);
  assert.deepEqual(ee.velden, [e]);
  assert.deepEqual(T.weideVan(S.wereld, c).velden, abc.velden, 'elke keer opnieuw uitgerekend, dus dezelfde velden');
  assert.deepEqual(T.weideVan(S.wereld, d).velden, [d]);
});

test('schuin tegen elkaar, of twee tegels uit elkaar, is niet naast elkaar; en met weideTussen 0 alleen wat elkaar raakt', () => {
  const { S } = wereldMet([
    { x: 0, y: 0, b: 2, h: 2, bestemming: 'weide' },
    { x: 2, y: 2, b: 2, h: 2, bestemming: 'weide' }, // raakt de eerste alleen met een hoek
    { x: 6, y: 2, b: 2, h: 2, bestemming: 'weide' }, // twee tegels naast de tweede
  ]);
  assert.equal(T.weideGroepen(S.wereld).length, 3);
  const { S: S2 } = wereldMet([
    { x: 0, y: 0, b: 2, h: 2, bestemming: 'weide' },
    { x: 3, y: 0, b: 2, h: 2, bestemming: 'weide' }, // één tegel ertussen
  ]);
  assert.equal(T.weideGroepen(S2.wereld).length, 1);
  metInstelling(IN, { weideTussen: 0 }, () => assert.equal(T.weideGroepen(S2.wereld).length, 2));
});

test('alleen weides doen mee: een akker ertussen of ernaast is geen weide, en de strook ligt niet op een veld', () => {
  const { S, velden: [a, akker, b] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 3, bestemming: 'weide' },
    { x: 2, y: 0, b: 1, h: 3, bestemming: 'akker' },
    { x: 3, y: 0, b: 2, h: 3, bestemming: 'weide' },
  ]);
  // a en b liggen één tegel uit elkaar, maar die tegel is de akker: ze zijn samen één weide, en
  // de akker zelf hoort er niet bij om over te lopen.
  const [groep] = T.weideGroepen(S.wereld);
  assert.deepEqual(groep.velden, [a, b]);
  assert.equal(groep.tussen.size, 0, 'over een akker loopt het vee niet');
  assert.equal(T.weideVan(S.wereld, akker), null);
  // Met een plan: wordt de akker volgend jaar weide, dan zijn het er drie in één groep.
  const [volgend] = T.weideGroepen(S.wereld, (v) => (v === akker ? 'weide' : v.bestemming) === 'weide');
  assert.deepEqual(volgend.velden, [a, akker, b]);
});

test('in het gehucht: de blokken van Klaas en Gerrit onder de es worden samen één weide, met de strook ertussen', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const veld = (naam) => S.wereld.akkers.find((a) => a.naam === naam);
  const klaas = veld('akker6');
  const gerrit = veld('akker7');
  assert.equal(T.weideGroepen(S.wereld).length, 1);
  gerrit.bestemming = gerrit.plan = 'weide';
  const [groep] = T.weideGroepen(S.wereld);
  assert.deepEqual(groep.velden, [klaas, gerrit]);
  assert.equal(groep.tegels, 30 + 25);
  // De strook op x = 41, zo lang als de blokken naast elkaar liggen (Gerrits blok is één rij korter).
  assert.deepEqual(sleutels(groep.tussen), ['41,37', '41,38', '41,39', '41,40', '41,41']);
  // Een strook van de es erboven, akker1, ligt ook één tegel van het blok van Klaas: weide maken
  // voegt hem erbij.
  const es = veld('akker1');
  es.bestemming = es.plan = 'weide';
  const [groter] = T.weideGroepen(S.wereld);
  assert.deepEqual(groter.velden, [es, klaas, gerrit]);
  assert.ok(groter.tussen.has('36,36') && groter.tussen.has('37,36'));
});

test('één weide, één kudde: de stand en het vee gaan over de hele groep, van welk veld je ook vraagt', () => {
  const { S, velden: [a, b] } = wereldMet([
    { x: 0, y: 0, b: 3, h: 4, bestemming: 'weide' }, // 12 tegels
    { x: 4, y: 0, b: 2, h: 4, bestemming: 'weide' }, //  8 tegels
  ]);
  zet(S, a, 'koe', 3);
  zet(S, b, 'koe', 1);
  for (const v of [a, b]) {
    assert.deepEqual(T.weideStand(S, v), { tegels: 20, nodig: 16, vrij: 4, vol: 1, koeien: 4, schapen: 0 });
    assert.equal(T.dierenOp(S, v).length, 4);
  }
  // Zet er nog twee koeien bij: dan is de hele weide te vol, ook het veld waar ze niet staan.
  zet(S, a, 'koe', 2);
  assert.equal(T.weideStand(S, b).vol, 20 / 24);
  // De melk van een koe op b hangt dus ook af van wat er op a staat.
  const dag = dagVan('bloeimaand', 1);
  const perKoe = IN.melkVoorMensen * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
  assert.ok(Math.abs(T.melkVanDag(S, dag) - 6 * perKoe * (20 / 24)) < 1e-9);
});

test('T.kanBestemming: past de kudde niet op één veld, dan wel op twee naast elkaar', () => {
  const { S, velden: [oud, a, b] } = wereldMet([
    { x: 0, y: 10, b: 4, h: 5, bestemming: 'weide' }, // 20 tegels, met de kudde erop
    { x: 0, y: 0, b: 3, h: 4, bestemming: 'akker' },  // 12 tegels
    { x: 4, y: 0, b: 3, h: 4, bestemming: 'akker' },  // 12 tegels, één tegel naast a
  ]);
  zet(S, oud, 'koe', 5); // 20 tegels nodig
  assert.equal(T.zetPlan(S, a, 'weide').kan, true);
  const alleenA = T.kanBestemming(S, oud, 'akker');
  assert.equal(alleenA.kan, false, 'op a alleen passen er maar drie');
  assert.match(alleenA.reden, /te weinig weide/);
  assert.equal(T.zetPlan(S, b, 'weide').kan, true);
  assert.equal(T.kanBestemming(S, oud, 'akker').kan, true, 'a en b samen hebben 24 tegels');
  // En op 1 lentemaand verhuist de kudde dan naar de nieuwe weide, elk dier naar het veld dat het
  // dichtst bij staat, maar samen één kudde.
  T.zetPlan(S, oud, 'akker');
  T.wisselVelden(S);
  const koeien = T.veeVan(S);
  assert.ok(koeien.every((e) => e.weide === a || e.weide === b));
  assert.deepEqual(T.weideStand(S, a), { tegels: 24, nodig: 20, vrij: 4, vol: 1, koeien: 5, schapen: 0 });
});

test('dwalen: een koe loopt over de strook naar het andere veld van haar weide, en nooit daarbuiten', () => {
  const { S, velden: [a, b] } = wereldMet([
    { x: 2, y: 2, b: 2, h: 3, bestemming: 'weide' },
    { x: 5, y: 2, b: 2, h: 3, bestemming: 'weide' }, // de strook op x = 4
  ]);
  const w = S.wereld;
  const [koe] = zet(S, a, 'koe', 1);
  koe.x = koe.tx = 3;
  koe.y = koe.ty = 3;
  const opties = () => T.dwaalTegelsOpWeide(w, koe).map((t) => `${t.x},${t.y}`).sort();
  assert.deepEqual(opties(), ['2,3', '3,2', '3,4', '4,3'].sort(), 'de strook op x = 4 mag');
  koe.x = koe.tx = 4;
  assert.deepEqual(opties(), ['3,3', '4,2', '4,4', '5,3'].sort(), 'vanaf de strook naar allebei de velden');
  assert.equal(T.wegNaarWeide(w, koe), null, 'op de strook staat het al op zijn weide');
  // Honderd stappen: het komt op allebei de velden, en nooit ergens anders.
  const land = T.graaslandVan(w, koe);
  const gezien = new Set();
  let zaad = 1;
  for (let i = 0; i < 400; i++) {
    const o = T.dwaalTegelsOpWeide(w, koe);
    if (!o.length) continue;
    zaad = (zaad * 16807) % 2147483647;
    const t = o[zaad % o.length];
    koe.x = koe.tx = t.x;
    koe.y = koe.ty = t.y;
    assert.ok(land.op(koe.tx, koe.ty), `buiten de weide op ${koe.tx},${koe.ty}`);
    gezien.add(T.veldOp(w, koe.tx, koe.ty));
  }
  assert.ok(gezien.has(a) && gezien.has(b), 'op allebei de velden geweest');
});

test('jongen: de plaats van de hele weide telt', () => {
  const { S, velden: [a, b] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 4, bestemming: 'weide' }, // 8 tegels: vol met twee koeien
    { x: 2, y: 0, b: 2, h: 4, bestemming: 'weide' }, // 8 tegels ernaast, leeg
  ]);
  zet(S, a, 'koe', 2);
  const nieuw = metInstelling(IN, { kansOpJong: { koe: 1, schaap: 1 } }, () => T.werpJongen(S, dagVan('grasmaand', 1)));
  assert.equal(nieuw.length, 2, 'op a alleen was er geen plaats geweest, samen met b wel');
  assert.ok(nieuw.every((e) => e.weide === a), 'een jong blijft bij het veld van zijn moeder');
  assert.equal(T.weideStand(S, b).vrij, 0);
});

test('de meent: schapen gaan bij het begin naar de heide, koeien naar de weide', () => {
  const { S, velden: [weide], meent } = wereldMet([{ x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' }], { x: 10, y: 10, b: 8, h: 6 });
  assert.equal(T.meentVan(S.wereld), meent);
  assert.equal(T.graastOp(S.wereld, 'schaap'), 'meent');
  assert.equal(T.graastOp(S.wereld, 'koe'), 'weide');
  const dieren = T.zetBeginKudde(S);
  const koeien = dieren.filter((e) => e.dier === 'koe');
  const schapen = dieren.filter((e) => e.dier === 'schaap');
  assert.equal(koeien.length, IN.beginKudde.koe);
  assert.equal(schapen.length, IN.beginKudde.schaap);
  assert.ok(koeien.every((e) => e.weide === weide && T.graaslandVan(S.wereld, e).op(e.tx, e.ty)));
  assert.ok(schapen.every((e) => e.weide === meent && T.graaslandVan(S.wereld, e).op(e.tx, e.ty)));
  assert.deepEqual(T.weideStand(S, weide), { tegels: 30, nodig: 12, vrij: 18, vol: 1, koeien: 3, schapen: 0 });
  assert.equal(T.dierenOp(S, meent).length, IN.beginKudde.schaap);
  // Zonder meent grazen de schapen op de weide, zoals in stap 1.
  const kaal = wereldMet([{ x: 0, y: 0, b: 5, h: 6, bestemming: 'weide' }]);
  assert.equal(T.graastOp(kaal.S.wereld, 'schaap'), 'weide');
  assert.ok(T.zetBeginKudde(kaal.S).every((e) => e.weide === kaal.velden[0]));
});

test('de schapen op de meent tellen niet voor de weide: niet bij een plan, en niet bij de wissel', () => {
  const { S, velden: [weide], meent } = wereldMet(
    [{ x: 0, y: 0, b: 4, h: 3, bestemming: 'weide' }, { x: 0, y: 5, b: 4, h: 3, bestemming: 'akker' }],
    { x: 10, y: 10, b: 8, h: 6 },
  );
  zet(S, meent, 'schaap', 8);
  // Zonder koeien mag de weide gewoon akker worden: de schapen hebben hem niet nodig.
  assert.equal(T.kanBestemming(S, weide, 'akker').kan, true);
  T.zetPlan(S, weide, 'akker');
  T.wisselVelden(S);
  assert.equal(T.bestemmingVan(weide), 'akker', 'geen weide die blijft omdat er "vee" was');
  assert.ok(T.veeVan(S).every((e) => e.weide === meent), 'de schapen blijven op de meent');
});

test('lammeren op de meent: alleen zolang er plaats is in de schaapskooi', () => {
  const { S, meent } = wereldMet([], { x: 0, y: 0, b: 10, h: 10 });
  zet(S, meent, 'schaap', 6);
  const werp = () => metInstelling(IN, { kansOpJong: { koe: 1, schaap: 1 }, kooiPlaats: 8 }, () => T.werpJongen(S, dagVan('grasmaand', 1)));
  assert.deepEqual(werp(), [], 'zonder kooi geen lammeren');
  S.gebouwen.push({ soort: 'schaapskooi', klaar: true });
  const nieuw = werp();
  assert.equal(nieuw.length, 2, 'een kooi voor acht: plaats voor nog twee');
  assert.ok(nieuw.every((e) => e.weide === meent && e.dier === 'schaap'));
  assert.equal(metInstelling(IN, { kooiPlaats: 8 }, () => T.kooiPlaats(S)), 8);
  S.gebouwen.push({ soort: 'schaapskooi', klaar: false });
  assert.equal(metInstelling(IN, { kooiPlaats: 8 }, () => T.kooiPlaats(S)), 8, 'een kooi in aanbouw bergt nog niets');
});

test('de muis en het venster zeggen dat een weide samen met het veld ernaast één weide is', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const veld = (naam) => S.wereld.akkers.find((a) => a.naam === naam);
  const klaas = veld('akker6');
  const gerrit = veld('akker7');
  assert.equal(T.samenMetTekst(S, klaas), '');
  gerrit.bestemming = gerrit.plan = 'weide';
  const boerGerrit = T.boerVanVeld(S, gerrit);
  assert.equal(T.samenMetTekst(S, klaas), `samen één weide met het veld van ${boerGerrit.naam}`);
  assert.match(T.veldTekst(S, gerrit), new RegExp(`samen één weide met het veld van ${T.boerVanVeld(S, klaas).naam}`));
  assert.equal(T.opsomming(['Klaas', 'Jan', 'Gerrit']), 'Klaas, Jan en Gerrit');
});

// ---------------------------------------------------------------- de kooi: scheren en mest

test('scheren in zomermaand: elk volwassen schaap geeft wol, een lam nog niet', () => {
  const { S, meent } = wereldMet([], { x: 0, y: 0, b: 10, h: 10 });
  const dag = dagVan('zomermaand', 1);
  zet(S, meent, 'schaap', 5);
  const [lam] = zet(S, meent, 'schaap', 1);
  lam.geboren = dagVan('grasmaand', 1);
  T.tikVeeDag(S, dag - 1);
  assert.equal(S.voorraad.wol || 0, 0);
  T.tikVeeDag(S, dag);
  assert.equal(S.voorraad.wol, 5 * IN.wolPerSchaap);
  T.tikVeeDag(S, dag + 1);
  assert.equal(S.voorraad.wol, 5 * IN.wolPerSchaap, 'één keer per jaar');
});

test('mest uit de kooi: per schaap in de kooi, alleen met een herder, en niet meer dan de kooi bergt', () => {
  const { S, meent } = wereldMet([], { x: 0, y: 0, b: 10, h: 10 });
  const dag = dagVan('bloeimaand', 1);
  zet(S, meent, 'schaap', 8);
  assert.equal(T.mestVanDag(S), 0, 'zonder kooi geen mest');
  const kooi = { soort: 'schaapskooi', klaar: true, handen: 1 };
  S.gebouwen.push(kooi);
  assert.equal(T.schapenInKooi(S), 8);
  assert.ok(bijna(T.mestVanDag(S), (8 * IN.mestPerSchaap) / T.DAGEN_PER_JAAR));
  kooi.handen = 0;
  assert.equal(T.mestVanDag(S), 0, 'zonder herder blijft de mest liggen');
  kooi.handen = 1;
  metInstelling(IN, { kooiPlaats: 5 }, () => {
    assert.equal(T.schapenInKooi(S), 5, 'een volle kooi');
    assert.ok(bijna(T.mestVanDag(S), (5 * IN.mestPerSchaap) / T.DAGEN_PER_JAAR));
  });
  // Een jaar lang (zonder lammeren, die er in grasmaand bij zouden komen): zoveel karren per schaap.
  metInstelling(IN, { groeit: false }, () => {
    for (let i = 0; i < T.DAGEN_PER_JAAR; i++) T.tikVeeDag(S, dag + i);
  });
  assert.ok(Math.abs(S.voorraad.mest - 8 * IN.mestPerSchaap) < 1e-6, `${S.voorraad.mest} mest`);
});

test('de schaapskooi maakt zelf geen wol meer: die komt van de schapen', () => {
  assert.equal(T.GEBOUWEN.schaapskooi.maakt, null);
  assert.deepEqual(T.GEBOUWEN.schaapskooi.heer, { wol: 20 }, 'de heer vraagt er nog wel wol voor');
  // Acht schapen geven genoeg wol voor wat de heer voor één kooi vraagt.
  assert.ok(IN.beginKudde.schaap * IN.wolPerSchaap >= T.GEBOUWEN.schaapskooi.heer.wol);
});

test('de muis op de heide: wie er graast, en hoeveel de kooi bergt', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const meent = T.meentVan(S.wereld);
  assert.equal(T.meentOp(S.wereld, meent.x + 2, meent.y + 3), meent);
  assert.equal(T.meentOp(S.wereld, meent.x - 1, meent.y), null);
  assert.equal(T.meentTekst(S, meent), `De heide, de meent van het dorp · ${IN.beginKudde.schaap} schapen · de kooi bergt er ${IN.kooiPlaats}`);
  const h = T.handelingVerkennen(Object.assign(S, { spreuk: null, inventaris: new Set() }), { x: meent.x + 2, y: meent.y + 3 });
  assert.equal(h.tekst, T.meentTekst(S, meent));
});

// ---------------------------------------------------------------- mest per veld

const VI = T.VELDEN_INSTELLINGEN;

test('T.zetMest: alleen op wat volgend jaar akker is, en weer eraf als het iets anders wordt', () => {
  const { S, velden: [akker, weide] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 5, bestemming: 'akker' },
    { x: 5, y: 0, b: 2, h: 5, bestemming: 'weide' },
  ]);
  assert.equal(T.mestVoorVeld(akker), 10 * VI.mestPerTegel);
  assert.equal(T.zetMest(S, akker, true).kan, true);
  assert.equal(akker.mest, true);
  const r = T.zetMest(S, weide, true);
  assert.equal(r.kan, false);
  assert.match(r.reden, /een weide mest zichzelf/);
  // Wordt de akker volgend jaar braak, dan gaat de mest eraf.
  assert.equal(T.zetPlan(S, akker, 'braak').kan, true);
  assert.equal(akker.mest, false);
  // En met de optie "vanzelf" kies je niet per veld.
  T.zetPlan(S, akker, 'akker');
  metInstelling(VI, { mestVanzelf: true }, () => assert.match(T.kanMest(S, akker).reden, /vanzelf/));
});

test('op 1 lentemaand: mest maakt een akker vruchtbaarder, zodat elk jaar akker niet uitput', () => {
  const { S, velden: [a, b, c] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 5, bestemming: 'akker' },  // 10 tegels, met mest
    { x: 5, y: 0, b: 2, h: 5, bestemming: 'akker' },  // 10 tegels, zonder
    { x: 10, y: 0, b: 2, h: 5, bestemming: 'akker' }, // 10 tegels, met mest, maar die is op
  ]);
  for (const v of [a, b, c]) v.vruchtbaarheid = 0.8;
  T.zetMest(S, a, true);
  T.zetMest(S, c, true);
  const kost = T.mestVoorVeld(a);
  T.zetVoorraad(S, 'mest', kost * 1.5); // genoeg voor a, en de helft voor c
  assert.deepEqual(T.mestPlan(S), { velden: [a, c], nodig: 2 * kost });
  T.wisselVelden(S);
  const rond = (x) => Math.round(x * 1e6) / 1e6;
  assert.equal(rond(a.vruchtbaarheid), rond(0.8 - VI.akkerPutUit + VI.mestErbij), 'met mest put hij niet uit');
  assert.equal(rond(b.vruchtbaarheid), rond(0.8 - VI.akkerPutUit));
  assert.equal(rond(c.vruchtbaarheid), rond(0.8 - VI.akkerPutUit + VI.mestErbij / 2), 'de rest van de mest');
  assert.ok(S.voorraad.mest < 1e-9, 'de mest is op');
  assert.equal(a.mest, true, 'de mest blijft erop staan, voor volgend jaar');
});

test('met de optie "vanzelf" gaat de mest naar verhouding over alle akkers van volgend jaar', () => {
  const { S, velden: [a, b, weide] } = wereldMet([
    { x: 0, y: 0, b: 2, h: 5, bestemming: 'akker' },
    { x: 5, y: 0, b: 2, h: 5, bestemming: 'akker' },
    { x: 10, y: 0, b: 2, h: 5, bestemming: 'weide' },
  ]);
  for (const v of [a, b, weide]) v.vruchtbaarheid = 0.8;
  metInstelling(VI, { mestVanzelf: true }, () => {
    T.zetVoorraad(S, 'mest', T.mestVoorVeld(a)); // genoeg voor de helft van de twee akkers
    assert.deepEqual(T.mestPlan(S).velden, [a, b]);
    T.wisselVelden(S);
  });
  const rond = (x) => Math.round(x * 1e6) / 1e6;
  for (const v of [a, b]) assert.equal(rond(v.vruchtbaarheid), rond(0.8 - VI.akkerPutUit + VI.mestErbij / 2));
  assert.equal(rond(weide.vruchtbaarheid), rond(0.8 + VI.weideMest), 'een weide krijgt geen mest');
});

test('de muis op een akker met mest zegt het', () => {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const akker = S.wereld.akkers.find((a) => a.naam === 'akker2');
  T.zetMest(S, akker, true);
  assert.match(T.veldTekst(S, akker), / · krijgt mest op 1 lentemaand$/);
});
