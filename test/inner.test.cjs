// De inner zonder scherm (js/inner.js): wanneer hij komt, wat hij ziet (zo ver, en niet door een
// muur), zijn rapport, wat de heer ervan vraagt (js/heer.js), de argwaan en wat die doet, en zijn
// poppetje, dat zijn eigen ronde loopt of met de schout meeloopt. Zie ontwerp/spel.md, "Rijk worden
// en arm lijken: de inner" (Marcel koos het op 24 sep 2026) en ontwerp/werklijst.md, punt 6.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/tijd.js');
require('../js/wereld.js');
require('../js/pad.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../js/akkers.js');
require('../js/gesprek.js');
require('../js/gesprekken.js');
require('../js/handel.js');
require('../js/heer.js');
require('../js/inner.js');
const T = globalThis.Toren;
const IN = T.INNER_INSTELLINGEN;
const HEER = T.HEER_INSTELLINGEN;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const KOMT = dagVan(IN.komt.maand, IN.komt.dag);
const SINT_MAARTEN = dagVan('slachtmaand', 11);

// Een gehucht van 30 bij 20 tegels gras. De brink (de plek van de marskramer) op (5, 10), de weg de
// kaart op links daarvan. Een muur van (2, 13) tot (8, 13): daarachter ziet hij niet. Drie huizen
// van 2 bij 2: vlak bij de brink, achter de muur, en ver weg. Eén akker van 2 bij 2 bij de brink.
function maakS() {
  const b = 30;
  const h = 20;
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('gras'));
  for (let x = 2; x <= 8; x++) tegels[13][x] = 'muur';
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 13, woonruimte: 15,
    kalender: { dag: KOMT, snelheid: 1 }, inventaris: new Set(), modus: 'verkennen',
    wereld: {
      b, h, tegels, voorwerpen: [], wezens: [], deuren: [],
      marskramer: { x: 5, y: 10 }, overgangen: [],
      akkers: [{ x: 2, y: 8, b: 2, h: 2 }],
    },
  };
  const huis = (x, y) => ({ soort: 'huis', x, y, voet: { b: 2, h: 2 }, klaar: true });
  S.bijDeBrink = huis(8, 9);
  S.achterDeMuur = huis(4, 15);
  S.verWeg = huis(24, 9);
  S.gebouwen.push(S.bijDeBrink, S.achterDeMuur, S.verWeg);
  return S;
}

// Wat de spelregels zeggen, even anders, en daarna weer terug.
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

// Wat er gemeld wordt, om naar te kijken.
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

// Een bezoek waarin hij van de brink rondkeek en daarna vertrok: zijn rapport.
function bezoekVanafDeBrink(S) {
  T.innerKomt(S, KOMT, false);
  T.innerKijkt(S, { x: 5, y: 10 });
  return T.innerVertrekt(S);
}

// Loop zijn poppetje af: elke ronde een beeld (T.werkInnerBij) en één tegel van zijn pad, tot hij
// weg is, of tot `tot` zegt dat het genoeg is.
function laatLopen(S, rondes, tot) {
  for (let i = 0; i < rondes && S.inner.bezoek; i++) {
    T.werkInnerBij(S);
    const e = S.inner.bezoek && S.inner.bezoek.wezen;
    if (e && e.pad.length) {
      const p = e.pad.shift();
      e.tx = e.x = p.x;
      e.ty = e.y = p.y;
    }
    if (tot && tot()) return;
  }
}

// ---------------------------------------------------------------------------------------------
// Wanneer hij komt
// ---------------------------------------------------------------------------------------------

test('hij wordt aangekondigd, komt in oogstmaand tellen, en zolang hij er is staat de tijd stil', () => {
  const S = maakS();
  const berichten = metBerichten(() => {
    T.tikInnerDag(S, KOMT - IN.aankondiging);
    assert.equal(S.inner.bezoek, null);
    T.tikInnerDag(S, KOMT);
  });
  assert.match(berichten[0], /Over 10 dagen komt de inner/);
  assert.ok(S.inner.bezoek);
  assert.equal(S.inner.bezoek.geduld, IN.geduld);
  assert.ok(T.heeftVlag(S, 'innerOpBezoek'));
  assert.equal(S.kalender.snelheid, 0, 'een scène: de tijd staat stil');
  T.innerVertrekt(S);
  assert.equal(S.kalender.snelheid, 1, 'en loopt weer zoals ervoor');
  assert.ok(!T.heeftVlag(S, 'innerOpBezoek'), 'zonder poppetje is hij meteen weg');
});

test('ziet de heer alles zelf (de optie in de spelregels), dan komt er geen inner', () => {
  const S = maakS();
  metInstelling(HEER, { rekening: 'alles' }, () => T.tikInnerDag(S, KOMT));
  assert.equal(S.inner, undefined);
});

// ---------------------------------------------------------------------------------------------
// Wat hij ziet, en zijn rapport
// ---------------------------------------------------------------------------------------------

test('hij ziet wat binnen zijn zicht ligt, niet door een muur, en geen verstopplek', () => {
  const S = maakS();
  const kelder = { soort: 'verstopplek', x: 6, y: 8, voet: { b: 2, h: 2 }, klaar: true };
  S.gebouwen.push(kelder);
  T.innerKomt(S, KOMT, false);
  const nieuw = T.innerKijkt(S, { x: 5, y: 10 });
  const b = S.inner.bezoek;
  assert.deepEqual(nieuw, [T.GEBOUWEN.huis.naam]);
  assert.ok(b.gebouwen.has(S.bijDeBrink));
  assert.ok(!b.gebouwen.has(S.achterDeMuur), 'achter de muur');
  assert.ok(!b.gebouwen.has(S.verWeg), 'te ver');
  assert.ok(!b.gebouwen.has(kelder), 'een verstopplek ziet hij niet');
  assert.equal(b.tegels.size, 4, 'de hele akker bij de brink');
  // Van de andere kant van de muur ziet hij het huis daar wel.
  T.innerKijkt(S, { x: 5, y: 16 });
  assert.ok(b.gebouwen.has(S.achterDeMuur));
  // Nog te zien: alleen het huis ver weg.
  assert.deepEqual(T.innerNogTeZien(S).map((d) => d.gebouw), [S.verWeg]);
});

test('zijn rapport: de gebouwen die hij zag, hun woonruimte, en het graan in de schuren en op de velden', () => {
  const S = maakS();
  S.kalender.dag = KOMT;
  T.zetVoorraad(S, 'graan', 100);
  // Eén tegel van de akker is al gemaaid (dat graan ligt in de schuur), drie staan nog.
  S.wereld.akkers[0].geoogst = new Set(['2,8']);
  const r = bezoekVanafDeBrink(S);
  assert.deepEqual(r.gebouwen, { huis: 1 });
  assert.equal(r.woonruimte, T.GEBOUWEN.huis.woonruimte);
  assert.equal(r.tegels, 4);
  assert.equal(r.graanGezien, 3 * T.GRAAN_PER_TEGEL + 100);
  assert.equal(r.graanVerwacht, 4 * T.GRAAN_PER_TEGEL);
  assert.equal(S.inner.rapport, r);
});

test('een weide telt hij als land maar niet als graan, en van een uitgeputte akker verwacht hij minder', () => {
  // Een akker die half zo vruchtbaar is (js/akkers.js, T.oogstPerTegel): dunner graan, dat ziet hij.
  const S = maakS();
  T.zetVoorraad(S, 'graan', 100);
  S.wereld.akkers[0].vruchtbaarheid = 0.5;
  let r = bezoekVanafDeBrink(S);
  assert.equal(r.tegels, 4);
  assert.equal(r.graanVerwacht, 4 * T.GRAAN_PER_TEGEL * 0.5);
  assert.equal(r.graanGezien, 4 * T.GRAAN_PER_TEGEL * 0.5 + 100);
  assert.equal(S.inner.argwaan, 0, 'wat er staat, is wat zo’n akker belooft');
  // Hetzelfde veld als weide: gezien land (de pacht per akkertegel telt het mee), maar er staat geen graan.
  const S2 = maakS();
  T.zetVoorraad(S2, 'graan', 100);
  S2.wereld.akkers[0].bestemming = 'weide';
  r = bezoekVanafDeBrink(S2);
  assert.equal(r.tegels, 4);
  assert.equal(r.graanVerwacht, 0);
  assert.equal(r.graanGezien, 100);
});

test('de heer rekent met het rapport: wat de inner niet zag, betaal je dat jaar niet', () => {
  const S = maakS();
  T.zetVoorraad(S, 'graan', 100);
  const alles = T.eisVanDeHeer(S);
  assert.ok(!alles.rapport);
  const r = bezoekVanafDeBrink(S);
  const eis = T.eisVanDeHeer(S);
  assert.ok(eis.rapport);
  assert.equal(eis.per.graan, Math.ceil(r.graanGezien * HEER.deelVanGraan - 1e-9));
  // Eén huis in plaats van drie: twee goud (T.GEBOUWEN.huis.heer), en hoofdgeld voor wie erin past.
  const huisGoud = T.GEBOUWEN.huis.heer.goud;
  assert.equal(eis.per.goud, Math.ceil(r.woonruimte * HEER.hoofdgeldPerMens - 1e-9) + huisGoud);
  assert.equal(alles.per.goud, Math.ceil(S.bevolking * HEER.hoofdgeldPerMens - 1e-9) + 3 * huisGoud);
  assert.ok(eis.regels.some((x) => /Onze inner telde/.test(x.waarom)));
  // Met de pacht: per akkertegel die hij zag.
  metInstelling(HEER, { graan: 'pacht' }, () => {
    assert.equal(T.eisVanDeHeer(S).per.graan, Math.ceil(4 * HEER.pachtPerAkkertegel - 1e-9));
  });
  // Ziet de heer alles zelf, dan telt het rapport niet.
  metInstelling(HEER, { rekening: 'alles' }, () => assert.ok(!T.eisVanDeHeer(S).rapport));
});

// ---------------------------------------------------------------------------------------------
// Argwaan
// ---------------------------------------------------------------------------------------------

test('minder graan dan zijn velden beloven: zijn argwaan groeit, en de heer vraagt een toeslag', () => {
  const S = maakS();
  // Alles gemaaid, en er ligt niets in de schuur: hij verwachtte 14.
  S.wereld.akkers[0].geoogst = new Set(['2,8', '3,8', '2,9', '3,9']);
  const zonder = T.eisVanDeHeer(S);
  bezoekVanafDeBrink(S);
  assert.ok(Math.abs(S.inner.argwaan - IN.graanVerwacht * IN.graanArgwaan) < 1e-9);
  assert.deepEqual(S.inner.waarom, ['hij zag minder graan dan zijn velden beloven']);
  const eis = T.eisVanDeHeer(S);
  const toeslag = eis.regels.find((x) => /toeslag/.test(x.waarom));
  assert.ok(toeslag && toeslag.wat === 'goud');
  assert.ok(eis.per.goud > zonder.per.goud - 3 * T.GEBOUWEN.huis.heer.goud, 'de toeslag komt bovenop wat hij zag');
  // Genoeg graan: geen argwaan.
  const S2 = maakS();
  T.zetVoorraad(S2, 'graan', 14);
  S2.wereld.akkers[0].geoogst = new Set(['2,8', '3,8', '2,9', '3,9']);
  bezoekVanafDeBrink(S2);
  assert.equal(S2.inner.argwaan, 0);
  assert.ok(!T.eisVanDeHeer(S2).regels.some((x) => /toeslag/.test(x.waarom)));
});

test('bij genoeg argwaan komt hij onverwacht terug, één keer, ruim vóór Sint-Maarten', () => {
  const S = maakS();
  S.wereld.akkers[0].geoogst = new Set(['2,8', '3,8', '2,9', '3,9']);
  bezoekVanafDeBrink(S);
  assert.ok(S.inner.argwaan >= IN.terugkomenVanaf);
  const op = S.inner.terugOp;
  assert.ok(op >= KOMT + IN.terugNaDagen.van && op <= KOMT + IN.terugNaDagen.tot, `terug op dag ${op}`);
  assert.ok(op <= SINT_MAARTEN - 5);
  T.tikInnerDag(S, op - 1);
  assert.equal(S.inner.bezoek, null);
  S.kalender.dag = op;
  T.tikInnerDag(S, op);
  assert.ok(S.inner.bezoek && S.inner.bezoek.onverwacht);
  assert.ok(T.heeftVlag(S, 'innerOnverwacht'));
  // Ineens veel meer graan dan de eerste keer: dan weet hij genoeg.
  T.zetVoorraad(S, 'graan', 100);
  T.innerKijkt(S, { x: 5, y: 10 });
  T.innerVertrekt(S);
  assert.equal(S.inner.argwaan, 1);
  assert.ok(S.inner.waarom.includes('er lag ineens meer graan dan de eerste keer'));
  assert.equal(S.inner.terugOp, null, 'een derde keer komt hij niet');
  assert.ok(!T.heeftVlag(S, 'innerOnverwacht'));
});

test('bij heel hoge argwaan telt het rapport niet meer: dan vraagt de heer naar alles', () => {
  const S = maakS();
  bezoekVanafDeBrink(S);
  assert.ok(T.eisVanDeHeer(S).rapport);
  const huizen = (eis) => eis.regels.find((x) => x.waarom.endsWith(T.GEBOUWEN.huis.naam));
  assert.equal(huizen(T.eisVanDeHeer(S)).waarom, `een ${T.GEBOUWEN.huis.naam}`);
  S.inner.argwaan = IN.rapportTeltNietVanaf;
  const eis = T.eisVanDeHeer(S);
  assert.ok(!eis.rapport);
  assert.equal(huizen(eis).waarom, `3 × ${T.GEBOUWEN.huis.naam}`);
  assert.equal(huizen(eis).aantal, 3 * T.GEBOUWEN.huis.heer.goud);
});

test('op Sint-Maarten kijkt de heer rond: wat hij van de brink ziet en niet in het rapport staat, komt erbij', () => {
  const S = maakS();
  // De inner zag alleen het huis achter de muur; dat bij de brink kwam er later bij.
  T.innerKomt(S, KOMT, false);
  T.innerKijkt(S, { x: 5, y: 17 });
  assert.ok(!S.inner.bezoek.gebouwen.has(S.bijDeBrink));
  T.innerVertrekt(S);
  // Hoe ver hij kijkt, hangt af van zijn argwaan (25 sep): zonder argwaan kijkt hij niet rond.
  S.inner.argwaan = 0;
  assert.equal(T.heerZichtNu(S), 0);
  assert.deepEqual(T.heerKijktRond(S), []);
  S.inner.argwaan = IN.heerZichtVol / 2;
  assert.equal(T.heerZichtNu(S), IN.heerZicht / 2, 'bij de helft van de argwaan kijkt hij half zo ver');
  S.inner.argwaan = IN.heerZichtVol;
  assert.equal(T.heerZichtNu(S), IN.heerZicht);
  const voor = S.inner.argwaan;
  let gezien;
  const berichten = metBerichten(() => {
    gezien = T.heerKijktRond(S);
  });
  assert.deepEqual(gezien, [T.GEBOUWEN.huis.naam]);
  assert.match(berichten[0], /Wat is DÁT, schout\?/);
  assert.equal(S.inner.rapport.gebouwen.huis, 2);
  assert.ok(Math.abs(S.inner.argwaan - voor - IN.betrapt) < 1e-9);
  assert.ok(!S.inner.rapport.gezien.has(S.verWeg), 'wat ver weg staat, ziet hij niet');
  // Een tweede keer kijken vindt niets nieuws.
  assert.deepEqual(T.heerKijktRond(S), []);
});

test('is de argwaan hoog genoeg, dan doorzoeken zijn soldaten op Sint-Maarten het dorp', () => {
  for (const [argwaan, zoeken] of [[IN.doorzoekenVanaf - 0.01, false], [IN.doorzoekenVanaf, true]]) {
    const S = maakS();
    bezoekVanafDeBrink(S);
    S.inner.argwaan = argwaan;
    S.kalender.dag = SINT_MAARTEN;
    const berichten = metBerichten(() => T.heerKomt(S, SINT_MAARTEN));
    assert.equal(berichten.some((t) => /doorzoeken het dorp/.test(t)), zoeken, `argwaan ${argwaan}`);
  }
});

test('na Sint-Maarten is zijn rapport betaald, en zakt zijn argwaan', () => {
  const S = maakS();
  bezoekVanafDeBrink(S);
  S.inner.argwaan = 0.6;
  S.kalender.dag = SINT_MAARTEN;
  T.heerKomt(S, SINT_MAARTEN);
  const eis = T.eisVanDeHeer(S);
  for (const wat in eis.per) T.zetVoorraad(S, wat, eis.per[wat] + 10);
  T.betaalHeer(S, eis.per);
  assert.equal(S.inner.rapport, null);
  assert.ok(Math.abs(S.inner.argwaan - 0.6 * IN.naSintMaarten) < 1e-9);
  // Volgend jaar komt hij weer.
  const volgend = dagVan(IN.komt.maand, IN.komt.dag, 1);
  S.kalender.dag = volgend;
  T.tikInnerDag(S, volgend);
  assert.ok(S.inner.bezoek);
});

// ---------------------------------------------------------------------------------------------
// Zijn poppetje
// ---------------------------------------------------------------------------------------------

test('zijn poppetje komt over de weg, loopt zijn eigen ronde tot hij alles zag, en gaat weer', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S);
  const e = S.inner.bezoek.wezen;
  assert.equal(e.wie, 'inner');
  assert.deepEqual([e.tx, e.ty], [0, 10], 'hij komt binnen over de weg');
  assert.ok(S.wereld.wezens.includes(e));
  laatLopen(S, 400, () => S.inner.bezoek && S.inner.bezoek.weg);
  const r = S.inner.rapport;
  assert.ok(r, 'hij is klaar met tellen');
  assert.deepEqual(r.gebouwen, { huis: 3 }, 'alleen ziet hij alles, ook achter de muur en ver weg');
  laatLopen(S, 400);
  assert.equal(S.inner.bezoek, null, 'en hij is de weg weer op');
  assert.equal(S.wereld.wezens.indexOf(e), -1);
});

test('loopt de schout naast hem, dan volgt hij de schout; loopt die ver weg, dan gaat hij zijn eigen gang', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  const held = T.maakMens('boer1', 1, 11);
  S.held = held;
  S.wereld.wezens.push(held);
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S);
  T.werkInnerBij(S);
  const b = S.inner.bezoek;
  assert.ok(b.volgt, 'de schout staat naast hem');
  // De schout loopt naar boven, weg van alles; hij loopt mee en blijft naast hem.
  for (const y of [9, 7, 5, 3, 1]) {
    held.tx = held.x = 1;
    held.ty = held.y = y;
    laatLopen(S, 6);
    assert.ok(b.volgt);
    assert.ok(T.afstand({ x: b.wezen.tx, y: b.wezen.ty }, { x: held.tx, y: held.ty }) <= 1, `naast de schout bij y=${y}`);
  }
  // Zijn geduld slinkt met elke stap.
  assert.ok(b.geduld < IN.geduld);
  // De schout loopt ver weg: dan loopt hij zijn eigen ronde.
  held.tx = held.x = 28;
  held.ty = held.y = 1;
  laatLopen(S, 2);
  assert.ok(!b.volgt);
});

test('stilstaan kost ook geduld: naast een schout die niet verder loopt, wacht hij niet eeuwig', () => {
  const S = maakS();
  S.tijd = 0;
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  const held = T.maakMens('boer1', 1, 10);
  S.held = held;
  S.wereld.wezens.push(held);
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S);
  T.werkInnerBij(S);
  const b = S.inner.bezoek;
  assert.ok(b.volgt);
  const voor = b.geduld;
  for (let i = 0; i < 8; i++) {
    S.tijd += IN.stilPerStap / 2;
    T.werkInnerBij(S);
  }
  assert.equal(b.geduld, voor - 3, 'twee seconden stilstaan: drie stappen (de eerste halve seconde begint het wachten)');
});

test('is zijn geduld op, dan gaat hij met wat hij tot dan toe zag', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  S.inner.bezoek.geduld = 3;
  laatLopen(S, 50, () => S.inner.bezoek && S.inner.bezoek.weg);
  assert.ok(S.inner.rapport);
  assert.ok(!S.inner.rapport.gezien.has(S.verWeg), 'zo ver kwam hij niet');
});

test('zonder weg de kaart op kijkt hij vanaf de brink en gaat hij meteen: de tijd blijft niet stilstaan', () => {
  const S = maakS();
  T.innerKomt(S, KOMT, false);
  assert.equal(S.kalender.snelheid, 0);
  T.werkInnerBij(S);
  assert.equal(S.inner.bezoek, null);
  assert.deepEqual(S.inner.rapport.gebouwen, { huis: 1 }, 'wat hij vanaf de brink zag');
  assert.equal(S.kalender.snelheid, 1);
});

test('de toeslag gaat over wat hij dit jaar vraagt, niet over de oude schuld', () => {
  const S = maakS();
  bezoekVanafDeBrink(S);
  S.inner.argwaan = 0.5;
  const toeslag = (eis) => (eis.regels.find((x) => /toeslag/.test(x.waarom)) || {}).aantal;
  const zonder = toeslag(T.eisVanDeHeer(S));
  S.heer = T.nieuweHeer();
  S.heer.schuld = 40;
  assert.equal(toeslag(T.eisVanDeHeer(S)), zonder);
});

test('wie met hem praat, houdt hem op', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S);
  const e = S.inner.bezoek.wezen;
  S.modus = 'dialoog';
  S.spreektMet = e;
  laatLopen(S, 5);
  assert.deepEqual([e.tx, e.ty], [0, 10]);
  assert.equal(S.inner.bezoek.geduld, IN.geduld);
});

test('zijn gesprek: wie hij is, en wat hij telt', () => {
  const S = maakS();
  T.innerKomt(S, KOMT, false);
  const knoop = T.gesprekKnoop(S, 'inner', 'welkom');
  assert.match(knoop.tekst, /inner van Zijne Genade/);
  T.zetVlag(S, 'innerOnverwacht');
  assert.match(T.gesprekKnoop(S, 'inner', 'welkom').tekst, /twee keer/);
});
