// De inner zonder scherm (js/inner.js): wanneer hij komt, wat hij ziet (zo ver, en niet door een muur), en zijn
// poppetje, dat zijn eigen ronde loopt of met de schout meeloopt. Sinds 11 okt (vraag 151, optie 1, deel B1) telt wat hij
// ziet niet meer: geen rapport, geen argwaan, geen omkopen, en de heer rekent op wat er is (test/heer.test.cjs). Zie
// ontwerp/spel.md, "Rijk worden en arm lijken: de inner" (Marcel koos het op 24 sep 2026 en schrapte het op 11 okt).
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.INNER_INSTELLINGEN;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum, in het eerste of een later jaar.
function dagVan(maand, dagVanMaand, jaar) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return (jaar || 0) * T.DAGEN_PER_JAAR + ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}
const KOMT = dagVan(IN.komt.maand, IN.komt.dag);

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

// Een bezoek waarin hij van het plein rondkeek en daarna vertrok.
function bezoekVanafHetPlein(S) {
  T.innerKomt(S, KOMT);
  T.innerKijkt(S, { x: 5, y: 10 });
  T.innerVertrekt(S);
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

test('hij wordt aangekondigd, komt in oogstmaand kijken, en de tijd loopt door op 1× (sinds de dag, 26 sep)', () => {
  const S = maakS();
  S.kalender.snelheid = 10;
  // Je eigen dorp, en je bent er (js/dorp.js): dan zie je hem op 1× komen.
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

// ---------------------------------------------------------------------------------------------
// Wat hij ziet
// ---------------------------------------------------------------------------------------------

test('hij ziet wat binnen zijn zicht ligt, niet door een muur, en geen gebouw zonder tekening', () => {
  const S = maakS();
  const kelder = { soort: 'palissade', x: 6, y: 8, voet: { b: 2, h: 2 }, klaar: true };
  S.gebouwen.push(kelder);
  T.innerKomt(S, KOMT);
  const nieuw = T.innerKijkt(S, { x: 5, y: 10 });
  const b = S.inner.bezoek;
  assert.deepEqual(nieuw, [T.GEBOUWEN.huis.naam]);
  assert.ok(b.gebouwen.has(S.bijHetPlein));
  assert.ok(!b.gebouwen.has(S.achterDeMuur), 'achter de muur');
  assert.ok(!b.gebouwen.has(S.verWeg), 'te ver');
  assert.ok(!b.gebouwen.has(kelder), 'een gebouw zonder tekening ziet hij niet');
  assert.equal(b.tegels.size, 4, 'de hele akker bij het plein');
  // Van de andere kant van de muur ziet hij het huis daar wel.
  T.innerKijkt(S, { x: 5, y: 16 });
  assert.ok(b.gebouwen.has(S.achterDeMuur));
  // Nog te zien: alleen het huis ver weg.
  assert.deepEqual(T.innerNogTeZien(S).map((d) => d.gebouw), [S.verWeg]);
});

test('wat hij ziet, verandert niets aan wat de heer vraagt: hij rekent op wat er is', () => {
  const S = maakS();
  T.zetVoorraad(S, 'graan', 100);
  T.zetVoorraad(S, 'goud', 40);
  const voor = T.eisVanDeHeer(S);
  // Alleen het huis bij het plein, de akker erbij: de heer vraagt toch naar alle drie de huizen.
  bezoekVanafHetPlein(S);
  const na = T.eisVanDeHeer(S);
  assert.deepEqual(na.per, voor.per);
  assert.deepEqual(na.regels, voor.regels);
  assert.equal(na.rapport, undefined, 'er is geen rapport meer');
  assert.ok(na.regels.some((x) => x.waarom === `3 × ${T.GEBOUWEN.huis.naam}`), 'alle drie de huizen staan erop');
  assert.ok(!na.regels.some((x) => /inner/.test(x.waarom)), 'en niets op zijn naam');
});

// ---------------------------------------------------------------------------------------------
// Zijn poppetje
// ---------------------------------------------------------------------------------------------

test('zijn poppetje komt over de weg, loopt zijn eigen ronde tot hij alles zag, en gaat weer', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT);
  T.werkInnerBij(S, S);
  const e = S.inner.bezoek.wezen;
  assert.equal(e.wie, 'inner');
  assert.deepEqual([e.tx, e.ty], [0, 10], 'hij komt binnen over de weg');
  assert.ok(S.wereld.wezens.includes(e));
  laatLopen(S, 400, () => S.inner.bezoek && S.inner.bezoek.weg);
  assert.ok(S.inner.bezoek.weg, 'hij is klaar met kijken');
  assert.equal(S.inner.bezoek.gebouwen.size, 3, 'alleen ziet hij alles, ook achter de muur en ver weg');
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
  T.innerKomt(S, KOMT);
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

test('naast een schout die niet verder loopt, wacht hij een half uur; dan kijkt hij zelf verder, en volgt hij een uur niemand', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  const schout = T.maakMens('boer1', 1, 10);
  S.schout = schout;
  S.wereld.wezens.push(schout);
  T.innerKomt(S, KOMT);
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
  assert.notDeepEqual([e.tx, e.ty], [0, 10], 'hij kijkt zelf verder');
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

test('gaat de zon onder, dan moet hij voor donker terug zijn, ook al zag hij nog niet alles', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT);
  T.werkInnerBij(S, S);
  const b = S.inner.bezoek;
  assert.ok(Math.abs(T.uurVanDag(b.tot) - T.zonVan(KOMT).onder) < 1e-9, 'hij blijft tot zonsondergang');
  assert.equal(Math.floor(b.tot), KOMT, 'van deze dag');
  laatLopen(S, 3);
  S.kalender.dag = b.tot - 0.01 / 24;
  laatLopen(S, 1);
  assert.ok(!b.weg, 'net voor zonsondergang kijkt hij nog');
  S.kalender.dag = b.tot;
  const berichten = metBerichten(() => laatLopen(S, 1));
  assert.ok(b.weg);
  assert.ok(!b.gebouwen.has(S.verWeg), 'zo ver kwam hij niet');
  assert.match(berichten.join(' '), /voor donker terug/);
  // Met wegVoorDonker gaat hij eerder; roep je hem na zonsondergang, dan blijft hij tot die van morgen.
  metInstelling(IN, { wegVoorDonker: 2 }, () => {
    const S2 = maakS();
    S2.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
    T.innerKomt(S2, KOMT);
    T.werkInnerBij(S2, S2);
    assert.ok(Math.abs(T.uurVanDag(S2.inner.bezoek.tot) - (T.zonVan(KOMT).onder - 2)) < 1e-9);
  });
  const S3 = maakS();
  S3.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  S3.kalender.dag = KOMT + 22 / 24;
  T.innerKomt(S3, KOMT);
  S3.inner.bezoek.meteen = true;
  T.werkInnerBij(S3, S3);
  assert.equal(Math.floor(S3.inner.bezoek.tot), KOMT + 1);
});

test('zonder weg de kaart op kijkt hij vanaf het plein en gaat hij meteen', () => {
  const S = maakS();
  T.innerKomt(S, KOMT);
  T.werkInnerBij(S, S);
  assert.equal(S.inner.bezoek, null);
  assert.equal(S.kalender.snelheid, 1, 'de tijd liep gewoon door');
});

test('wie met hem praat, houdt hem op: hij kijkt niet en de dag loopt door, tot hij genoeg gepraat heeft', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT);
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
  assert.notDeepEqual([e.tx, e.ty], [0, 10], 'hij kijkt door, ook al praat je nog');
  // Zijn gesprek weet het: geen praatjes meer.
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /Geen praatjes meer/);
  laatLopen(S, 400);
  assert.ok(!T.heeftVlag(S, 'innerUitgepraat'), 'weg is weg: een volgend bezoek praat hij weer');
});

test('zijn gesprek: wie hij is, en dat hij klaar is als hij gaat', () => {
  const S = maakS();
  S.wereld.overgangen = [{ x: 0, y: 10, naar: 'wereld' }];
  T.innerKomt(S, KOMT);
  metBerichten(() => T.werkInnerBij(S, S)); // zijn poppetje: na zijn bezoek loopt hij nog naar de weg
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /inner van Zijne Genade/);
  const keuzes = () => T.gesprekKnoop(S, S, 'inner', 'welkom').keuzes.map((k) => k.zeg);
  assert.ok(keuzes().length >= 3, 'hij praat over het kasteel, en wat hij bekijkt');
  assert.ok(!keuzes().some((k) => /iets voor u/.test(k)), 'een geschenk bestaat niet meer');
  metBerichten(() => T.innerVertrekt(S));
  assert.ok(T.heeftVlag(S, 'innerKlaar'));
  assert.match(T.gesprekKnoop(S, S, 'inner', 'welkom').tekst, /Ik ben klaar/);
  assert.deepEqual(keuzes(), ['Goede reis.'], 'is hij klaar, dan valt er niets meer te regelen');
});
