// De inner zonder scherm (js/inner.js): wanneer hij komt, wat hij ziet (zo ver, en niet door een
// muur), zijn rapport, wat de heer ervan vraagt (js/heer.js), de argwaan en wat die doet, en zijn
// poppetje, dat zijn eigen ronde loopt of met de schout meeloopt. Zie ontwerp/spel.md, "Rijk worden
// en arm lijken: de inner" (Marcel koos het op 24 sep 2026) en ontwerp/werklijst.md, punt 6.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.INNER_INSTELLINGEN;
const HEER = T.HEER_INSTELLINGEN;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const KOMT = dagVan(IN.komt.maand, IN.komt.dag);
const SINT_MAARTEN = dagVan('slachtmaand', 11);

// Een gehucht van 30 bij 20 tegels gras. Het plein (de plek van de marskramer) op (5, 10), de weg de
// kaart op links daarvan. Een muur van (2, 13) tot (8, 13): daarachter ziet hij niet. Drie huizen
// van 2 bij 2: vlak bij het plein, achter de muur, en ver weg. Eén akker van 2 bij 2 bij het plein.
function maakS() {
  const b = 30;
  const h = 20;
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('gras'));
  for (let x = 2; x <= 8; x++) tegels[13][x] = 'muur';
  const S = {
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 13, woonruimte: 15,
    // Om tien uur 's ochtends: een bezoeker komt overdag (js/dag.js, T.bezoekerKomtAan).
    kalender: { dag: KOMT + 10 / 24, snelheid: 1 }, inventaris: new Set(), modus: 'verkennen',
    wereld: {
      b, h, tegels, voorwerpen: [], wezens: [], deuren: [],
      marskramer: { x: 5, y: 10 }, overgangen: [],
      akkers: [{ x: 2, y: 8, b: 2, h: 2 }],
    },
  };
  const huis = (x, y) => ({ soort: 'huis', x, y, voet: { b: 2, h: 2 }, klaar: true });
  S.bijHetPlein = huis(8, 9);
  S.achterDeMuur = huis(4, 15);
  S.verWeg = huis(24, 9);
  S.gebouwen.push(S.bijHetPlein, S.achterDeMuur, S.verWeg);
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

// Een bezoek waarin hij van het plein rondkeek en daarna vertrok: zijn rapport.
function bezoekVanafHetPlein(S) {
  T.innerKomt(S, KOMT, false);
  T.innerKijkt(S, { x: 5, y: 10 });
  return T.innerVertrekt(S);
}

// Loop zijn poppetje af: elke ronde een beeld (T.werkInnerBij) en één tegel van zijn pad, tot hij
// weg is, of tot `tot` zegt dat het genoeg is.
function laatLopen(S, rondes, tot) {
  for (let i = 0; i < rondes && S.inner.bezoek; i++) {
    T.werkInnerBij(S, S);
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

test('hij wordt aangekondigd, komt in oogstmaand tellen, en de tijd loopt door op 1× (sinds de dag, 26 sep)', () => {
  const S = maakS();
  S.kalender.snelheid = 10;
  // Je eigen dorp, en je bent er (js/dorp.js): dan zie je hem op 1× komen.
  S.speler = true;
  S.schout = T.maakWezen('schout', 29, 19);
  S.wereld.wezens.push(S.schout);
  const berichten = metBerichten(() => {
    T.tikInnerDag(S, KOMT - IN.aankondiging);
    assert.equal(S.inner.bezoek, null);
    T.tikInnerDag(S, KOMT);
  });
  assert.match(berichten[0], /Over 10 dagen komt de inner/);
  assert.ok(S.inner.bezoek);
  assert.equal(S.inner.bezoek.tot, null, 'tot hoe laat hij blijft, weet hij pas als hij er is');
  assert.ok(T.heeftVlag(S, 'innerOpBezoek'));
  assert.equal(S.kalender.snelheid, 1, 'wie op 10× speelde, ziet hem op 1× komen; de tijd staat niet stil');
  T.innerVertrekt(S);
  assert.equal(S.kalender.snelheid, 1, 'en zo blijft hij; sneller zet je zelf');
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
  assert.ok(b.gebouwen.has(S.bijHetPlein));
  assert.ok(!b.gebouwen.has(S.achterDeMuur), 'achter de muur');
  assert.ok(!b.gebouwen.has(S.verWeg), 'te ver');
  assert.ok(!b.gebouwen.has(kelder), 'een verstopplek ziet hij niet');
  assert.equal(b.tegels.size, 4, 'de hele akker bij het plein');
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
  const r = bezoekVanafHetPlein(S);
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
  let r = bezoekVanafHetPlein(S);
  assert.equal(r.tegels, 4);
  assert.equal(r.graanVerwacht, 4 * T.GRAAN_PER_TEGEL * 0.5);
  assert.equal(r.graanGezien, 4 * T.GRAAN_PER_TEGEL * 0.5 + 100);
  assert.equal(S.inner.argwaan, 0, 'wat er staat, is wat zo’n akker belooft');
  // Hetzelfde veld als weide: gezien land (de pacht per akkertegel telt het mee), maar er staat geen graan.
  const S2 = maakS();
  T.zetVoorraad(S2, 'graan', 100);
  S2.wereld.akkers[0].bestemming = 'weide';
  r = bezoekVanafHetPlein(S2);
  assert.equal(r.tegels, 4);
  assert.equal(r.graanVerwacht, 0);
  assert.equal(r.graanGezien, 100);
});

test('de heer rekent met het rapport: wat de inner niet zag, betaal je dat jaar niet', () => {
  const S = maakS();
  T.zetVoorraad(S, 'graan', 100);
  const alles = T.eisVanDeHeer(S);
  assert.ok(!alles.rapport);
  const r = bezoekVanafHetPlein(S);
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
  bezoekVanafHetPlein(S);
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
  bezoekVanafHetPlein(S2);
  assert.equal(S2.inner.argwaan, 0);
  assert.ok(!T.eisVanDeHeer(S2).regels.some((x) => /toeslag/.test(x.waarom)));
});

test('bij genoeg argwaan komt hij onverwacht terug, één keer, ruim vóór Sint-Maarten', () => {
  const S = maakS();
  S.wereld.akkers[0].geoogst = new Set(['2,8', '3,8', '2,9', '3,9']);
  bezoekVanafHetPlein(S);
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
  bezoekVanafHetPlein(S);
  assert.ok(T.eisVanDeHeer(S).rapport);
  const huizen = (eis) => eis.regels.find((x) => x.waarom.endsWith(T.GEBOUWEN.huis.naam));
  assert.equal(huizen(T.eisVanDeHeer(S)).waarom, `een ${T.GEBOUWEN.huis.naam}`);
  S.inner.argwaan = IN.rapportTeltNietVanaf;
  const eis = T.eisVanDeHeer(S);
  assert.ok(!eis.rapport);
  assert.equal(huizen(eis).waarom, `3 × ${T.GEBOUWEN.huis.naam}`);
  assert.equal(huizen(eis).aantal, 3 * T.GEBOUWEN.huis.heer.goud);
});

test('op Sint-Maarten kijkt de heer rond: wat hij van het plein ziet en niet in het rapport staat, komt erbij', () => {
  const S = maakS();
  // De inner zag alleen het huis achter de muur; dat bij het plein kwam er later bij.
  T.innerKomt(S, KOMT, false);
  T.innerKijkt(S, { x: 5, y: 17 });
  assert.ok(!S.inner.bezoek.gebouwen.has(S.bijHetPlein));
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
    bezoekVanafHetPlein(S);
    S.inner.argwaan = argwaan;
    S.kalender.dag = SINT_MAARTEN;
    const berichten = metBerichten(() => T.heerKomt(S, SINT_MAARTEN));
    assert.equal(berichten.some((t) => /doorzoeken het dorp/.test(t)), zoeken, `argwaan ${argwaan}`);
  }
});

test('na Sint-Maarten is zijn rapport betaald, en zakt zijn argwaan', () => {
  const S = maakS();
  bezoekVanafHetPlein(S);
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
  T.werkInnerBij(S, S);
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
  const schout = T.maakMens('boer1', 1, 11);
  S.schout = schout;
  S.wereld.wezens.push(schout);
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S, S);
  T.werkInnerBij(S, S);
  const b = S.inner.bezoek;
  assert.ok(b.volgt, 'de schout staat naast hem');
  // De schout loopt naar boven, weg van alles; hij loopt mee en blijft naast hem.
  for (const y of [9, 7, 5, 3, 1]) {
    schout.tx = schout.x = 1;
    schout.ty = schout.y = y;
    laatLopen(S, 6);
    assert.ok(b.volgt);
    assert.ok(T.afstand({ x: b.wezen.tx, y: b.wezen.ty }, { x: schout.tx, y: schout.ty }) <= 1, `naast de schout bij y=${y}`);
  }
  // De schout loopt ver weg: dan loopt hij zijn eigen ronde.
  schout.tx = schout.x = 28;
  schout.ty = schout.y = 1;
  laatLopen(S, 2);
  assert.ok(!b.volgt);
});

// De klok zoveel uur vooruit, in stapjes, met elk stapje een beeld en een tegel van zijn pad.
function wacht(S, uren, stapjes = 10) {
  for (let i = 0; i < stapjes; i++) {
    S.kalender.dag += uren / stapjes / 24;
    laatLopen(S, 1);
  }
}

test('naast een schout die niet verder loopt, wacht hij een half uur; dan telt hij zelf verder, en volgt hij een uur niemand', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  const schout = T.maakMens('boer1', 1, 10);
  S.schout = schout;
  S.wereld.wezens.push(schout);
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S, S);
  T.werkInnerBij(S, S);
  const b = S.inner.bezoek;
  const e = b.wezen;
  assert.ok(b.volgt);
  const berichten = metBerichten(() => {
    wacht(S, IN.wachtUren * 0.8);
    assert.ok(b.volgt, 'zo lang wacht hij nog');
    assert.deepEqual([e.tx, e.ty], [0, 10], 'naast de schout, die stilstaat');
    wacht(S, IN.wachtUren * 0.4);
  });
  assert.ok(!b.volgt, 'daarna niet meer');
  assert.match(berichten.join(' '), /wacht niet langer/);
  // Hij loopt zijn eigen ronde, en ook al gaat de schout weer naast hem staan, hij volgt hem niet.
  laatLopen(S, 3);
  assert.notDeepEqual([e.tx, e.ty], [0, 10], 'hij telt zelf verder');
  schout.tx = schout.x = e.tx;
  schout.ty = schout.y = e.ty + 1;
  wacht(S, IN.eigenGang * 0.5, 2);
  assert.ok(!b.volgt, 'een tijd volgt hij niemand');
  S.kalender.dag += IN.eigenGang / 24;
  schout.tx = schout.x = e.tx;
  schout.ty = schout.y = e.ty + 1;
  T.werkInnerBij(S, S);
  assert.ok(b.volgt, 'daarna weer wel');
});

test('gaat de zon onder, dan moet hij voor donker terug zijn, en gaat hij met wat hij tot dan toe zag', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S, S);
  const b = S.inner.bezoek;
  assert.ok(Math.abs(T.uurVanDag(b.tot) - T.zonVan(KOMT).onder) < 1e-9, 'hij blijft tot zonsondergang');
  assert.equal(Math.floor(b.tot), KOMT, 'van deze dag');
  laatLopen(S, 3);
  S.kalender.dag = b.tot - 0.01 / 24;
  laatLopen(S, 1);
  assert.ok(!b.weg, 'net voor zonsondergang telt hij nog');
  S.kalender.dag = b.tot;
  const berichten = metBerichten(() => laatLopen(S, 1));
  assert.ok(b.weg);
  assert.ok(S.inner.rapport);
  assert.ok(!S.inner.rapport.gezien.has(S.verWeg), 'zo ver kwam hij niet');
  assert.match(berichten.join(' '), /voor donker terug/);
  // Met wegVoorDonker gaat hij eerder; roep je hem na zonsondergang, dan blijft hij tot die van morgen.
  metInstelling(IN, { wegVoorDonker: 2 }, () => {
    const S2 = maakS();
    S2.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
    T.innerKomt(S2, KOMT, false);
    T.werkInnerBij(S2, S2);
    assert.ok(Math.abs(T.uurVanDag(S2.inner.bezoek.tot) - (T.zonVan(KOMT).onder - 2)) < 1e-9);
  });
  const S3 = maakS();
  S3.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  S3.kalender.dag = KOMT + 22 / 24;
  T.innerKomt(S3, KOMT, false);
  S3.inner.bezoek.meteen = true;
  T.werkInnerBij(S3, S3);
  assert.equal(Math.floor(S3.inner.bezoek.tot), KOMT + 1);
});

test('zonder weg de kaart op kijkt hij vanaf het plein en gaat hij meteen', () => {
  const S = maakS();
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S, S);
  assert.equal(S.inner.bezoek, null);
  assert.deepEqual(S.inner.rapport.gebouwen, { huis: 1 }, 'wat hij vanaf het plein zag');
  assert.equal(S.kalender.snelheid, 1, 'de tijd liep gewoon door');
});

test('de toeslag gaat over wat hij dit jaar vraagt, niet over de oude schuld', () => {
  const S = maakS();
  bezoekVanafHetPlein(S);
  S.inner.argwaan = 0.5;
  const toeslag = (eis) => (eis.regels.find((x) => /toeslag/.test(x.waarom)) || {}).aantal;
  const zonder = toeslag(T.eisVanDeHeer(S));
  S.heer = T.nieuweHeer();
  S.heer.schuld = 40;
  assert.equal(toeslag(T.eisVanDeHeer(S)), zonder);
});

test('wie met hem praat, houdt hem op: hij kijkt niet en de dag loopt door, tot hij genoeg gepraat heeft', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  T.werkInnerBij(S, S);
  const b = S.inner.bezoek;
  const e = b.wezen;
  S.modus = 'dialoog';
  S.spreektMet = e;
  // Het eerste beeld begint het praten; daarna telt elk uur.
  laatLopen(S, 1);
  const gezien = b.gebouwen.size;
  wacht(S, IN.praatUren - 0.5);
  assert.deepEqual([e.tx, e.ty], [0, 10], 'hij staat stil');
  assert.ok(Math.abs(b.gepraat - (IN.praatUren - 0.5)) < 1e-9, `zoveel uur gepraat (${b.gepraat})`);
  assert.equal(b.gebouwen.size, gezien, 'en hij zag niets erbij');
  assert.equal(b.uitgepraat, false);
  const berichten = metBerichten(() => wacht(S, 1));
  assert.ok(b.uitgepraat, 'genoeg gepraat');
  assert.ok(T.heeftVlag(S, 'innerUitgepraat'));
  assert.match(berichten.join(' '), /Genoeg gepraat/);
  assert.notDeepEqual([e.tx, e.ty], [0, 10], 'hij telt door, ook al praat je nog');
  // Zijn gesprek weet het: geen praatjes meer.
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /Geen praatjes meer/);
  laatLopen(S, 400);
  assert.ok(!T.heeftVlag(S, 'innerUitgepraat'), 'weg is weg: een volgend bezoek praat hij weer');
});

test('zijn gesprek: wie hij is, en wat hij telt', () => {
  const S = maakS();
  T.innerKomt(S, KOMT, false);
  const knoop = T.gesprekKnoop(S, S, 'inner', 'welkom');
  assert.match(knoop.tekst, /inner van Zijne Genade/);
  T.zetVlag(S, 'innerOnverwacht');
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /twee keer/);
});

// ---------------------------------------------------------------------------------------------
// Omkopen (werklijst punt 4, stuk 2; vraag 42, Marcel, 27 sep)
// ---------------------------------------------------------------------------------------------

const O = IN.omkopen;

// Een bezoek waarin hij alle drie de huizen zag, het huis ver weg als laatste, en de akker bij het
// plein; `geschenk` goud geef je hem voor hij gaat.
function bezoekMetGeschenk(geschenk, goud = 60) {
  const S = maakS();
  S.lot = { zaad: 3 };
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', goud);
  T.innerKomt(S, KOMT, false);
  for (const plek of [{ x: 5, y: 10 }, { x: 4, y: 18 }, { x: 22, y: 9 }]) T.innerKijkt(S, plek);
  if (geschenk) metBerichten(() => T.koopInnerOm(S, geschenk));
  metBerichten(() => T.innerVertrekt(S));
  return S;
}

test('omkopen: per vijf goud schrijft hij een tiende minder op, tot de helft', () => {
  const S = maakS();
  T.zetVoorraad(S, 'goud', 100);
  T.innerKomt(S, KOMT, false);
  assert.equal(T.innerKorting(S), 0);
  metBerichten(() => {
    assert.ok(T.koopInnerOm(S, 5).kan);
    assert.ok(Math.abs(T.innerKorting(S) - 0.1) < 1e-9);
    T.koopInnerOm(S, 10);
    assert.ok(Math.abs(T.innerKorting(S) - 0.3) < 1e-9);
    assert.ok(!T.heeftVlag(S, 'innerOmgekochtVol'));
    T.koopInnerOm(S, 20);
  });
  assert.equal(T.innerKorting(S), O.tot, 'tot de helft, niet verder');
  assert.ok(T.heeftVlag(S, 'innerOmgekochtVol'));
  assert.equal(S.voorraad.goud, 65, 'het goud is weg');
  assert.equal(S.inner.geschenken, 35);
  assert.equal(T.koopInnerOm(S, 1000).kan, false, 'wat je niet hebt, geef je niet');
  metBerichten(() => T.innerVertrekt(S));
  assert.equal(T.koopInnerOm(S, 5).kan, false, 'is zijn rapport af, dan helpt een geschenk niet meer');
  assert.equal(S.voorraad.goud, 65);
  // Na Sint-Maarten begint het opnieuw.
  T.innerNaSintMaarten(S);
  assert.equal(T.innerKorting(S), 0);
  assert.ok(!T.heeftVlag(S, 'innerOmgekochtVol'));
});

test('omgekocht schrijft hij minder op: gebouwen, akkertegels, graan en kist; wat hij zag, onthoudt hij', () => {
  const eerlijk = bezoekMetGeschenk(0, 40).inner.rapport;
  const S = bezoekMetGeschenk(20); // van 60 goud gaat er 20 naar hem: er blijft 40 in de kist, net als hierboven
  const r = S.inner.rapport;
  assert.equal(r.korting, 0.4);
  assert.deepEqual(eerlijk.gebouwen, { huis: 3 });
  assert.deepEqual(r.gebouwen, { huis: 2 }, 'drie keer 0,6 is bijna twee');
  assert.equal(r.woonruimte, 2 * T.GEBOUWEN.huis.woonruimte);
  assert.equal(r.gezien.size, 3, 'gezien heeft hij ze wel');
  assert.equal(r.tegels, Math.round(eerlijk.tegels * 0.6));
  assert.ok(Math.abs(r.graanGezien - eerlijk.graanGezien * 0.6) < 1e-9);
  assert.ok(Math.abs(r.goudGezien - 40 * 0.6) < 1e-9);
  assert.equal(r.goudNu, 60, 'voor zijn argwaan telt wat hij kreeg mee: dat is niet weg, dat zit in zijn zak');
  // Wat hij wegliet, ziet de heer op Sint-Maarten niet als nieuw: dat staat in wat de inner zag.
  S.wereld.marskramer = { x: 22, y: 9 };
  S.inner.argwaan = 1;
  metBerichten(() => assert.deepEqual(T.heerKijktRond(S), []));
  S.inner.argwaan = 0;
  // En de heer vraagt dus minder.
  const heer = (x) => T.eisVanDeHeer(x).per;
  const minder = heer(S);
  const meer = heer(bezoekMetGeschenk(0, 40));
  assert.ok(minder.goud < meer.goud, `minder goud (${minder.goud} tegen ${meer.goud})`);
  assert.ok(minder.graan < meer.graan, `minder graan (${minder.graan} tegen ${meer.graan})`);
  // Het bericht bij zijn vertrek zegt het.
  const S2 = maakS();
  T.zetVoorraad(S2, 'goud', 10);
  T.innerKomt(S2, KOMT, false);
  metBerichten(() => T.koopInnerOm(S2, 10));
  const berichten = metBerichten(() => T.innerVertrekt(S2));
  assert.match(berichten.join(' '), /20% minder op/);
});

test('een op de vijf keer hoort de heer het: dan telt het geschenk als goud in je kist, en groeit de argwaan', () => {
  let keer = 0;
  let voorbeeld = null;
  for (let zaad = 1; zaad <= 400; zaad++) {
    const S = maakS();
    S.lot = { zaad };
    T.zetVoorraad(S, 'goud', 10);
    T.innerKomt(S, KOMT, false);
    const berichten = metBerichten(() => {
      if (T.koopInnerOm(S, 10).gehoord) keer++;
    });
    if (S.inner.gehoord && !voorbeeld) voorbeeld = { S, berichten };
  }
  assert.ok(keer > 50 && keer < 110, `ongeveer een op de vijf (${keer} van 400)`);
  const { S, berichten } = voorbeeld;
  assert.equal(S.inner.gehoord, 10);
  assert.ok(Math.abs(S.inner.argwaan - 10 * O.argwaan) < 1e-9);
  assert.ok(S.inner.waarom.some((w) => /omkocht/.test(w)));
  assert.match(berichten.join(' '), /Dit hoort de heer/);
  assert.ok(T.innerKorting(S) > 0, 'minder opschrijven doet hij toch');
  const regel = T.eisVanDeHeer(S).regels.find((x) => /toestopte/.test(x.waarom));
  assert.ok(regel, 'het staat op de rekening');
  assert.equal(regel.aantal, Math.ceil(10 * HEER.deelVanGoud - 1e-9));
  // Wie het niet hoorde: geen regel.
  const stil = maakS();
  T.zetVoorraad(stil, 'goud', 10);
  T.innerKomt(stil, KOMT, false);
  stil.inner.gehoord = 0;
  assert.ok(!T.eisVanDeHeer(stil).regels.some((x) => /toestopte/.test(x.waarom)));
});

test('zijn gesprek: een geschenk kan zolang hij telt en je het goud hebt, via T.doeGevolg', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT, false);
  metBerichten(() => T.werkInnerBij(S, S)); // zijn poppetje: na zijn rapport loopt hij nog naar de weg
  const keuzes = () => T.gesprekKnoop(S, S, 'inner', 'welkom').keuzes.map((k) => k.zeg);
  assert.ok(!keuzes().some((k) => /iets voor u/.test(k)), 'zonder goud geen geschenk');
  T.zetVoorraad(S, 'goud', 12);
  assert.ok(keuzes().some((k) => /iets voor u/.test(k)));
  const bedragen = T.gesprekKnoop(S, S, 'inner', 'geschenk').keuzes.filter((k) => k.doe && k.doe.omkopen).map((k) => k.doe.omkopen);
  assert.deepEqual(bedragen, [5, 10], 'twintig heb je niet');
  metBerichten(() => T.doeGevolg(S, S, { omkopen: 10 }));
  assert.equal(S.voorraad.goud, 2);
  assert.ok(Math.abs(T.innerKorting(S) - 0.2) < 1e-9);
  assert.match(T.gesprekKnoop(S, S, 'inner', 'bedankt').tekst, /zie ineens een stuk minder/);
  metBerichten(() => T.innerVertrekt(S));
  T.zetVoorraad(S, 'goud', 50);
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /rapport is af/);
  assert.deepEqual(keuzes(), ['Goede reis.'], 'is zijn rapport af, dan valt er niets meer te regelen');
});
