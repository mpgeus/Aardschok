// De verstopplekken (js/verstoppen.js; ontwerp/spel.md, "Marcel koos voor stap 2", 25 sep 2026):
// de kelders en de kapel, wat erin past, wat het karakter van wie er woont doet, de tiende van de
// kapelaan, en wat de soldaten vinden. En de twee dingen eromheen: de inner telt de kist (js/inner.js,
// js/heer.js), en de marskramer vertelt hem wat hij je betaalde (js/handel.js): het spoor van goud.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/wereld.js');
require('../js/pad.js');
require('../js/voorraad.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../js/akkers.js');
require('../js/handel.js');
require('../js/heer.js');
require('../js/inner.js');
require('../js/verstoppen.js');
require('../js/kaart.js');
require('../js/gebied.js');
const T = globalThis.Toren;
const V = T.VERSTOP_INSTELLINGEN;
const IN = T.INNER_INSTELLINGEN;
const HEER = T.HEER_INSTELLINGEN;

function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const KOMT = dagVan(IN.komt.maand, IN.komt.dag);
const SINT_MAARTEN = dagVan('slachtmaand', 11);

// Het echte gehucht (kaarten/gehucht.tmj): vijf boerderijen, elk met zijn boer, en het huis van de
// schout. Zonder js/boeren.js heeft elke boer zijn vaste karakter uit js/mensen.js.
function gehucht() {
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0,
    kalender: { dag: 10, snelheid: 1 }, inventaris: new Set(), modus: 'verkennen',
  };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  return S;
}
const kelderVan = (S, huis) => S.gebouwen.find((g) => g.huis === huis);
const boer = (S, id) => S.wereld.wezens.find((e) => e.wie === id);

// Een kleine wereld voor de inner, zoals in test/inner.test.cjs: gras, de brink op (5, 10), een akker
// van 2 bij 2 ernaast, en een huis vlak bij de brink (met een kelder, zonder bewoner met een naam).
function maakS() {
  const b = 30;
  const h = 20;
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('gras'));
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 13, woonruimte: 15,
    kalender: { dag: KOMT, snelheid: 1 }, inventaris: new Set(), modus: 'verkennen',
    wereld: {
      b, h, tegels, voorwerpen: [], wezens: [], deuren: [],
      marskramer: { x: 5, y: 10 }, overgangen: [],
      akkers: [{ x: 2, y: 8, b: 2, h: 2 }],
    },
  };
  S.bijDeBrink = { soort: 'huis', x: 8, y: 9, voet: { b: 2, h: 2 }, klaar: true };
  S.gebouwen.push(S.bijDeBrink);
  return S;
}

function bezoekVanafDeBrink(S) {
  T.innerKomt(S, KOMT, false);
  T.innerKijkt(S, { x: 5, y: 10 });
  return T.innerVertrekt(S);
}

function metInstelling(blok, waarden, fn) {
  const oud = {};
  for (const k in waarden) oud[k] = blok[k];
  Object.assign(blok, waarden);
  try {
    return fn();
  } finally {
    Object.assign(blok, oud);
  }
}

function metBerichten(fn) {
  const oud = T.ui;
  const berichten = [];
  T.ui = { bericht: (tekst) => berichten.push(tekst) };
  try {
    fn(berichten);
  } finally {
    T.ui = oud;
  }
  return berichten;
}

// ---------------------------------------------------------------------------------------------
// De plekken
// ---------------------------------------------------------------------------------------------

test('de plekken in het gehucht: vijf kelders van boeren en die van de schout', () => {
  const S = gehucht();
  const plekken = T.verstopPlekken(S);
  assert.equal(plekken.length, 6);
  const schout = plekken.find((p) => p.vanSchout);
  assert.equal(schout.naam, 'je eigen kelder');
  assert.equal(schout.vinden, V.vindenBijSchout, 'bij de schout kijken ze eerst');
  const boeren = plekken.filter((p) => p.bewoner);
  assert.deepEqual(boeren.map((p) => p.bewoner.wie).sort(), ['boer1', 'boer2', 'boer3', 'boer4', 'boer5']);
  for (const p of boeren) {
    assert.equal(p.naam, `de kelder van ${p.bewoner.naam}`);
    assert.equal(p.plaats, V.plekken.boerderij.plaats);
  }
});

test('een hut heeft geen kelder, en een kapel is pas een plek als hij af is', () => {
  const S = gehucht();
  assert.equal(T.verstopPlekVan(S, { soort: 'hut', x: 0, y: 0, klaar: true }), null);
  const kapel = { soort: 'kapel', x: 1, y: 1, voet: { b: 5, h: 5 }, klaar: false };
  assert.equal(T.verstopPlekVan(S, kapel), null);
  kapel.klaar = true;
  const p = T.verstopPlekVan(S, kapel);
  assert.equal(p.naam, 'de kapel');
  assert.equal(p.plaats, V.plekken.kapel.plaats);
  assert.equal(p.vinden, V.plekken.kapel.vinden);
  assert.equal(p.houdt, V.plekken.kapel.houdt);
  assert.equal(p.wieHoudt, 'de kapelaan');
});

// ---------------------------------------------------------------------------------------------
// Wegzetten en terughalen
// ---------------------------------------------------------------------------------------------

test('wegzetten: uit de schuur de kelder in, tot hij vol is; goud past altijd', () => {
  const S = gehucht();
  const g = kelderVan(S, 'boer1'); // Klaas, de zanger: een gewone kelder
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', 50);
  assert.equal(T.hoeveelVerstoppen(S, g, 'graan'), V.plekken.boerderij.plaats);
  assert.ok(T.verstop(S, g, 'graan', 30).kan);
  assert.equal(S.voorraad.graan, 70);
  assert.equal(g.verstopt.graan, 30);
  const vol = T.kanVerstoppen(S, g, 'graan', 20);
  assert.equal(vol.kan, false);
  assert.match(vol.reden, /nog maar 10/);
  assert.equal(T.hoeveelVerstoppen(S, g, 'graan'), 10);
  assert.ok(T.verstop(S, g, 'goud', 50).kan, 'goud past altijd: een pot onder de vloer');
  assert.equal(S.voorraad.goud, 0);
  assert.match(T.kanVerstoppen(S, g, 'goud', 1).reden, /geen goud/);
  assert.equal(T.kanVerstoppen(S, g, 'hooi', 1).kan, false, 'alleen graan en goud');
  // Terughalen: weer in de schuur, en niet meer dan er ligt.
  assert.match(T.kanTerughalen(S, g, 'graan', 31).reden, /Zoveel ligt hier niet/);
  assert.ok(T.haalTerug(S, g, 'graan', 30).kan);
  assert.equal(S.voorraad.graan, 100);
  assert.equal(g.verstopt.graan, 0);
  assert.deepEqual(T.verstoptTotaal(S), { graan: 0, goud: 50, plekken: 1 });
});

test('de kapelaan houdt een tiende van wat je in de kapel zet', () => {
  const S = gehucht();
  const kapel = { soort: 'kapel', x: 1, y: 1, voet: { b: 5, h: 5 }, klaar: true };
  S.gebouwen.push(kapel);
  T.zetVoorraad(S, 'graan', 200);
  T.verstop(S, kapel, 'graan', 100);
  assert.equal(S.voorraad.graan, 100);
  assert.ok(Math.abs(kapel.verstopt.graan - 100 * (1 - V.plekken.kapel.houdt)) < 1e-9);
  // Vullen rekent de tiende mee: er past nog 30, dus je zet er 33 weg.
  const max = T.hoeveelVerstoppen(S, kapel, 'graan');
  assert.equal(max, Math.floor((V.plekken.kapel.plaats - 90) / (1 - V.plekken.kapel.houdt)));
  assert.ok(T.verstop(S, kapel, 'graan', max).kan);
  assert.ok(kapel.verstopt.graan <= V.plekken.kapel.plaats + 1e-9);
  assert.equal(T.kanVerstoppen(S, kapel, 'graan', 2).kan, false);
});

test('zolang de inner of de heer in het dorp is, sjouw je niets', () => {
  const S = gehucht();
  const g = kelderVan(S, 'schout');
  T.zetVoorraad(S, 'graan', 50);
  S.inner = T.nieuweInner();
  S.inner.bezoek = { weg: false };
  assert.match(T.kanVerstoppen(S, g, 'graan', 10).reden, /inner/);
  assert.match(T.kanTerughalen(S, g, 'graan', 10).reden, /inner/);
  assert.equal(T.verstopHandeling(S, T.verstopPlekVan(S, g)).kan, false);
  S.inner.bezoek.weg = true;
  assert.ok(T.kanVerstoppen(S, g, 'graan', 10).kan);
  S.heer = { bezoek: { weg: false } };
  assert.match(T.kanVerstoppen(S, g, 'graan', 10).reden, /heer/);
});

// ---------------------------------------------------------------------------------------------
// Wie er woont
// ---------------------------------------------------------------------------------------------

test('het karakter telt: de roddelaar, de vrome, de woekeraar en de oudste', () => {
  const S = gehucht();
  const g = kelderVan(S, 'boer1');
  const zet = (k) => {
    boer(S, 'boer1').karakter = k;
    return T.verstopPlekVan(S, g);
  };
  const basis = V.plekken.boerderij.vinden;
  assert.equal(zet('zanger').vinden, basis);
  assert.equal(zet('roddelaar').vinden, basis * V.bewoners.roddelaar.vinden, 'zij vertelt het rond');
  assert.equal(zet('grijsaard').vinden, basis * V.bewoners.grijsaard.vinden, 'de oudste kent een oude plek');
  // De vrome weigert.
  const vroom = zet('vrome');
  assert.equal(vroom.weigert, true);
  T.zetVoorraad(S, 'graan', 50);
  const nee = T.kanVerstoppen(S, g, 'graan', 10);
  assert.equal(nee.kan, false);
  assert.match(nee.reden, /bidt/);
  assert.equal(T.hoeveelVerstoppen(S, g, 'graan'), 0);
  // De woekeraar: een goede kelder, maar hij houdt zijn deel.
  const woeker = zet('woekeraar');
  assert.equal(woeker.houdt, V.bewoners.woekeraar.houdt);
  assert.equal(woeker.wieHoudt, boer(S, 'boer1').naam);
  assert.equal(woeker.vinden, basis * V.bewoners.woekeraar.vinden);
  T.verstop(S, g, 'graan', 10);
  assert.ok(Math.abs(g.verstopt.graan - 10 * (1 - V.bewoners.woekeraar.houdt)) < 1e-9);
  // Telt het karakter niet (de optie in de spelregels), dan is elke kelder gelijk.
  metInstelling(V, { karakters: false }, () => {
    assert.equal(zet('roddelaar').vinden, basis);
    assert.equal(zet('vrome').weigert, false);
    assert.equal(zet('woekeraar').houdt, 0);
  });
});

test('een vrome boerin bidt ook: "haar kelder"', () => {
  const S = gehucht();
  boer(S, 'boer2').karakter = 'vrome'; // Aaltje
  const p = T.verstopPlekVan(S, kelderVan(S, 'boer2'));
  assert.match(T.overBewonerTekst(p), /^Aaltje bidt .* in haar kelder/);
});

// ---------------------------------------------------------------------------------------------
// De soldaten
// ---------------------------------------------------------------------------------------------

test('de soldaten zoeken plek voor plek: wat ze vinden is weg, en elke vondst maakt argwanend', () => {
  const S = gehucht();
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', 20);
  const schout = kelderVan(S, 'schout');
  const klaas = kelderVan(S, 'boer1');
  T.verstop(S, schout, 'graan', 30);
  T.verstop(S, klaas, 'graan', 20);
  T.verstop(S, klaas, 'goud', 5);
  S.inner = T.nieuweInner();
  // Een getal onder de kans bij de schout (0,6) maar boven die bij Klaas (0,3): alleen bij de schout.
  assert.deepEqual(T.zoekVerstopt(S, () => 0.45), ['30 graan in je eigen kelder']);
  assert.equal(schout.verstopt.graan, 0);
  assert.equal(klaas.verstopt.graan, 20);
  assert.ok(Math.abs(S.inner.argwaan - V.argwaanPerVondst) < 1e-9);
  assert.ok(S.inner.waarom.includes('de soldaten vonden wat je verstopte'));
  assert.deepEqual(T.zoekVerstopt(S, () => 0.99), []);
  assert.deepEqual(T.zoekVerstopt(S, () => 0), ['20 graan en 5 goud in de kelder van Klaas']);
  assert.deepEqual(T.verstoptTotaal(S), { graan: 0, goud: 0, plekken: 0 });
});

test('op Sint-Maarten: het doorzoeken zegt wat ze vonden, en het lot is vast per spel en per dag', () => {
  const zoek = () => {
    const S = gehucht();
    S.kalender.dag = SINT_MAARTEN;
    T.zetVoorraad(S, 'graan', 200);
    for (const huis of ['schout', 'boer1', 'boer2', 'boer4', 'boer5']) T.verstop(S, kelderVan(S, huis), 'graan', 20);
    S.inner = T.nieuweInner();
    let gevonden;
    const berichten = metBerichten(() => {
      gevonden = T.doorzoekDorp(S);
    });
    return { gevonden, berichten };
  };
  const a = zoek();
  const b = zoek();
  assert.deepEqual(a.gevonden, b.gevonden, 'hetzelfde spel, dezelfde dag: hetzelfde lot');
  assert.equal(a.berichten.length, 1);
  if (a.gevonden.length) assert.match(a.berichten[0], /vinden .* Dat is weg\./);
  else assert.match(a.berichten[0], /Ze vinden niets/);
});

// ---------------------------------------------------------------------------------------------
// Erheen lopen, en wat de muis zegt
// ---------------------------------------------------------------------------------------------

test('de schout kan bij elke plek komen: een tegel aan de rand van de voet met een vrije buur', () => {
  const S = gehucht();
  for (const p of T.verstopPlekken(S)) {
    const g = p.gebouw;
    const r = T.randVanGebouw(S, g);
    assert.ok(r, p.naam);
    assert.ok(r.x >= g.x && r.x < g.x + g.voet.b && r.y >= g.y && r.y < g.y + g.voet.h, `${p.naam}: op de voet`);
    assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => T.isBegaanbaar(S.wereld, r.x + dx, r.y + dy)), `${p.naam}: met een vrije buur`);
  }
  const h = T.verstopHandeling(S, T.verstopPlekVan(S, kelderVan(S, 'schout')));
  assert.equal(h.kan, true);
  assert.match(h.tekst, /^Verstoppen in je eigen kelder/);
  // Een klik op zijn voet vindt het huis, ook al stond het al op de kaart (T.gebouwOp).
  const g = kelderVan(S, 'boer3');
  assert.equal(T.gebouwOp(S, g.x + 1, g.y + 1), g);
});

// ---------------------------------------------------------------------------------------------
// Wat de inner telt: niet wat verstopt ligt, wel de kist
// ---------------------------------------------------------------------------------------------

test('wat verstopt ligt, telt de inner niet', () => {
  const zonder = maakS();
  T.zetVoorraad(zonder, 'graan', 50);
  const met = maakS();
  T.zetVoorraad(met, 'graan', 50);
  assert.ok(T.verstop(met, met.bijDeBrink, 'graan', 20).kan);
  const a = bezoekVanafDeBrink(zonder);
  const b = bezoekVanafDeBrink(met);
  assert.equal(a.graanGezien - b.graanGezien, 20);
  assert.ok(T.eisVanDeHeer(met).per.graan < T.eisVanDeHeer(zonder).per.graan);
});

test('de inner telt de kist, en de heer vraagt er een deel van; wat verstopt ligt, telt niet', () => {
  const S = maakS();
  T.zetVoorraad(S, 'goud', 40);
  assert.equal(bezoekVanafDeBrink(S).goudGezien, 40);
  const regel = T.eisVanDeHeer(S).regels.find((x) => /in uw kist/.test(x.waarom));
  assert.ok(regel && regel.wat === 'goud');
  assert.equal(regel.aantal, Math.ceil(40 * HEER.deelVanGoud));
  // Met 30 goud in de kelder ziet hij er 10.
  const S2 = maakS();
  T.zetVoorraad(S2, 'goud', 40);
  T.verstop(S2, S2.bijDeBrink, 'goud', 30);
  assert.equal(bezoekVanafDeBrink(S2).goudGezien, 10);
  assert.equal(T.eisVanDeHeer(S2).regels.find((x) => /in uw kist/.test(x.waarom)).aantal, Math.ceil(10 * HEER.deelVanGoud));
  // De optie: de kist telt niet.
  metInstelling(HEER, { kist: false }, () => {
    assert.ok(!T.eisVanDeHeer(S).regels.some((x) => /kist/.test(x.waarom)));
  });
});

test('zonder rapport telt de heer de kist als hij komt, en betalen maakt zijn eis niet kleiner', () => {
  metInstelling(HEER, { rekening: 'alles' }, () => {
    const S = maakS();
    T.zetVoorraad(S, 'goud', 40);
    S.kalender.dag = SINT_MAARTEN;
    T.heerKomt(S, SINT_MAARTEN);
    const voor = T.eisVanDeHeer(S);
    assert.ok(voor.regels.some((x) => /een deel van de 40 goud in uw kist/.test(x.waarom)));
    T.zetVoorraad(S, 'goud', 5);
    assert.equal(T.eisVanDeHeer(S).per.goud, voor.per.goud);
  });
});

// ---------------------------------------------------------------------------------------------
// Het spoor van goud: wat de marskramer hem vertelt
// ---------------------------------------------------------------------------------------------

test('het boek van de marskramer: wat hij je betaalde en wat jij hem, tot Sint-Maarten', () => {
  const S = maakS();
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', 50);
  T.marskramerKomt(S, 0, S.kalender.dag);
  const v = T.verkoop(S, 'graan', 2);
  const k = T.koop(S, 'zout', 1);
  assert.ok(v.kan && k.kan);
  assert.equal(S.boekMarskramer.ontvangen, v.opbrengst);
  assert.equal(S.boekMarskramer.betaald, k.kosten);
  S.inner = T.nieuweInner();
  S.kalender.dag = SINT_MAARTEN;
  T.innerNaSintMaarten(S);
  assert.deepEqual(S.boekMarskramer, { sinds: SINT_MAARTEN, ontvangen: 0, betaald: 0 });
});

test('een lege kist na veel verkopen: zijn argwaan groeit', () => {
  const S = maakS();
  S.boekMarskramer = { sinds: 0, ontvangen: 50, betaald: 10 };
  T.zetVoorraad(S, 'goud', 40);
  T.verstop(S, S.bijDeBrink, 'goud', 36);
  const r = bezoekVanafDeBrink(S);
  assert.equal(r.goudVerwacht, 40);
  assert.ok(Math.abs(S.inner.argwaan - (IN.goudVerwacht - 4 / 40) * IN.goudArgwaan) < 1e-9);
  assert.ok(S.inner.waarom.some((w) => /marskramer/.test(w)));
});

test('geen argwaan om het goud: genoeg in de kist, alleen graansporen, of maar een paar munten', () => {
  const geval = (kist, ontvangen, sporen) => metInstelling(IN, { sporen }, () => {
    const S = maakS();
    S.boekMarskramer = { sinds: 0, ontvangen, betaald: 0 };
    T.zetVoorraad(S, 'goud', kist);
    bezoekVanafDeBrink(S);
    return S.inner.argwaan;
  });
  assert.equal(geval(24, 40, 'alles'), 0, 'zes tiende van wat hij verwacht is genoeg');
  assert.equal(geval(0, 40, 'graan'), 0, 'met alleen graansporen let hij niet op het goud');
  assert.equal(geval(0, IN.goudVanaf - 1, 'alles'), 0, 'om een paar munten maakt hij zich niet druk');
  assert.ok(geval(0, 40, 'alles') > 0);
});

test('wat je sindsdien bouwde en hij ziet staan, trekt hij van het verwachte goud af', () => {
  const S = maakS();
  S.boekMarskramer = { sinds: 0, ontvangen: 20, betaald: 0 };
  S.gebouwen.push({ soort: 'huis', x: 8, y: 6, voet: { b: 2, h: 2 }, klaar: true, klaarOp: KOMT - 5, voorwerp: { x: 8, y: 6, beslaat: [2, 2] } });
  assert.equal(bezoekVanafDeBrink(S).goudVerwacht, 20 - T.GEBOUWEN.huis.kosten.goud);
});
