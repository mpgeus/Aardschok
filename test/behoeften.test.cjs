// De behoeften van het dorp zonder scherm (js/behoeften.js): eten, brandhout en een kerk, de
// tevredenheid die daaruit volgt (T.berekenTevredenheid, puur), en wat T.tikBehoeftenDag daarmee
// doet — stoken, de winter zijn tol laten eisen, een gezin laten vertrekken, een huis laten
// doorgroeien. Zie ontwerp/werklijst.md, punt 3 en ontwerp/spel.md, "Het dorp in leven houden".
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Dezelfde lege wereld als test/gebouwen.test.cjs (alleen wat T.isVast/T.voorwerpOp nodig hebben).
function maakLegeWereld(b, h) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('vloer'));
  return { b, h, tegels, voorwerpen: [] };
}

function maakS(b, h) {
  return {
    wereld: maakLegeWereld(b || 20, h || 20),
    voorraad: T.nieuweVoorraad(),
    gebouwen: [],
    bevolking: 0,
    woonruimte: 0,
    kalender: { dag: 0 },
    behoeften: T.nieuweBehoeften(),
  };
}

// dag 280 valt in wintermaand (T.MAANDEN, seizoen "winter"), en is een veelvoud van
// T.GEBOUWEN_INSTELLINGEN.gezinDagen (20) — handig voor de groei/vertrek-toetsen hieronder.
// dag 30 (grasmaand) is een gewone lentedag, ver van de winter.
const WINTERDAG = 280;
const ZOMERDAG = 30;

// Zoals vóór 30 sep, met de spelregel "Het seizoen" op jij: niemand sprokkelt (werklijst vraag 74, stap 2). Voor de
// toetsen die het stoken of de houthakker precies nameten; wat het sprokkelen doet, toetsen de toetsen erover.
function alsJijHetSeizoenDoet(fn) {
  T.zetOptie('seizoen', 'jij');
  try {
    return fn();
  } finally {
    T.optiesTerug();
  }
}

test('dag 280 is winter en dag 30 niet (aanname achter de toetsen hieronder)', () => {
  assert.equal(T.datumVanDag(WINTERDAG).seizoen, 'winter');
  assert.notEqual(T.datumVanDag(ZOMERDAG).seizoen, 'winter');
});

// ── T.GEBOUWEN: de nieuwe velden ──

test('hut groeit door tot huis, huis tot stenen huis, en beide doelen bestaan', () => {
  assert.equal(T.GEBOUWEN.hut.wordt, 'huis');
  assert.equal(T.GEBOUWEN.huis.wordt, 'stenenHuis');
  assert.ok(T.GEBOUWEN[T.GEBOUWEN.hut.wordt]);
  assert.ok(T.GEBOUWEN[T.GEBOUWEN.huis.wordt]);
});

test('de kapel telt als kerk', () => {
  assert.equal(T.GEBOUWEN.kapel.kerk, true);
});

// ── T.heeftKerk ──

test('T.heeftKerk: nee zonder klare kapel, ja met', () => {
  const S = maakS();
  assert.equal(T.heeftKerk(S), false);
  S.gebouwen.push({ soort: 'kapel', x: 0, y: 0, klaar: false, klaarOp: 5, handen: 0 });
  assert.equal(T.heeftKerk(S), false, 'nog in aanbouw telt niet mee');
  S.gebouwen[0].klaar = true;
  assert.equal(T.heeftKerk(S), true);
});

// ── T.berekenTevredenheid (puur) ──

test('T.berekenTevredenheid: zonder mensen is er geen eten- of brandhouttekort', () => {
  const S = maakS();
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(b.voedselDekking, 1);
  assert.equal(b.brandhoutDekking, 1);
});

test('T.berekenTevredenheid: te weinig graan geeft een voedseltekort en staat in "mist"', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 0);
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(b.voedselDekking, 0);
  assert.ok(b.mist.includes('eten'));
});

test('T.berekenTevredenheid: genoeg graan zonder extra soorten geeft de halve voedselfactor', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 1000);
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(b.voedselDekking, 1);
  assert.equal(b.extraSoorten.length, 0);
  assert.equal(b.voedselFactor, 0.5);
});

test('T.berekenTevredenheid: groente, vis en vlees op voorraad geven de volle voedselfactor', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 1000);
  T.zetVoorraad(S, 'groente', 5);
  T.zetVoorraad(S, 'vis', 5);
  T.zetVoorraad(S, 'vlees', 5);
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(b.extraSoorten.length, 3);
  assert.equal(b.voedselFactor, 1);
});

test('T.berekenTevredenheid: geen brandhoutstraf buiten de winter, ook zonder hout of turf', () => {
  const S = maakS();
  S.bevolking = 20;
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(b.brandhoutFactor, 1);
  // Het gemis staat wel in "mist" -- dat is juist het plannen vóór de winter.
  assert.ok(b.mist.includes('brandhout voor de winter'));
});

test('T.berekenTevredenheid: in de winter zakt de brandhoutfactor mee met de dekking', () => {
  const S = maakS();
  S.bevolking = 20; // 5 huishoudens
  const zonder = T.berekenTevredenheid(S, WINTERDAG);
  assert.equal(zonder.brandhoutFactor, 0);
  T.zetVoorraad(S, 'hout', zonder.brandhoutBenodigd); // precies genoeg
  const met = T.berekenTevredenheid(S, WINTERDAG);
  assert.equal(met.brandhoutFactor, 1);
});

test('T.berekenTevredenheid: zonder kerk telt de kerkfactor als kerkBasis, met kerk als 1', () => {
  const S = maakS();
  const zonder = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(zonder.kerkFactor, T.BEHOEFTEN_INSTELLINGEN.kerkBasis);
  assert.ok(zonder.mist.includes('een kerk'));
  S.gebouwen.push({ soort: 'kapel', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  const met = T.berekenTevredenheid(S, ZOMERDAG);
  assert.equal(met.kerkFactor, 1);
  assert.ok(!met.mist.includes('een kerk'));
});

test('T.berekenTevredenheid: de drie gewichten opgeteld geven de tevredenheid', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 1000);
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  const b = T.berekenTevredenheid(S, ZOMERDAG);
  const verwacht = IN.gewichtEten * b.voedselFactor + IN.gewichtBrandhout * b.brandhoutFactor + IN.gewichtKerk * b.kerkFactor;
  assert.ok(Math.abs(b.tevredenheid - verwacht) < 1e-9);
});

// ── T.tikBehoeftenDag: bijwerkingen ──

test('T.tikBehoeftenDag: eet de extra soorten ook echt op, naar rato van de bevolking', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'groente', 5);
  T.tikBehoeftenDag(S, ZOMERDAG);
  const verwacht = 5 - 10 * T.BEHOEFTEN_INSTELLINGEN.extraVoedselPerMensPerDag;
  assert.ok(Math.abs(S.voorraad.groente - verwacht) < 1e-9);
});

test('T.tikBehoeftenDag: stookt in de winter turf vóór hout', () => alsJijHetSeizoenDoet(() => {
  const S = maakS();
  S.bevolking = 4; // 1 huishouden
  T.zetVoorraad(S, 'turf', 10);
  T.zetVoorraad(S, 'hout', 10);
  T.tikBehoeftenDag(S, WINTERDAG);
  const benodigd = 1 * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag;
  assert.ok(Math.abs(S.voorraad.turf - (10 - benodigd)) < 1e-9);
  assert.equal(S.voorraad.hout, 10, 'hout blijft onaangeroerd zolang de turf het dekt');
}));

test('T.tikBehoeftenDag: buiten de winter wordt er geen brandhout gestookt', () => alsJijHetSeizoenDoet(() => {
  const S = maakS();
  S.bevolking = 4;
  T.zetVoorraad(S, 'hout', 10);
  T.tikBehoeftenDag(S, ZOMERDAG);
  assert.equal(S.voorraad.hout, 10);
}));

test('de mensen sprokkelen elke dag hout, het hele jaar: een huishouden zoveel per dag (vraag 74, stap 2)', () => {
  const bijna = (a, b) => Math.abs(a - b) < 1e-9;
  const S = maakS();
  S.bevolking = 8; // 2 huishoudens
  T.zetVoorraad(S, 'hout', 10);
  const per = 2 * T.BEHOEFTEN_INSTELLINGEN.sprokkelPerHuishoudenPerDag;
  assert.ok(bijna(T.sprokkelHout(S), per));
  T.tikBehoeftenDag(S, ZOMERDAG);
  assert.ok(bijna(S.voorraad.hout, 10 + per), 'in de zomer komt het erbij');
  T.tikBehoeftenDag(S, WINTERDAG);
  assert.ok(bijna(S.voorraad.hout, 10 + 2 * per - 2 * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag), 'in de winter ook, en er wordt gestookt');
  alsJijHetSeizoenDoet(() => assert.equal(T.sprokkelHout(S), 0, 'met de spelregel op jij sprokkelt niemand'));
});

test('T.tikBehoeftenDag: genoeg eten en brandhout voorkomt winterverlies, negentig dagen lang', () => {
  const S = maakS();
  S.bevolking = 20;
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'hout', 100000);
  for (let dag = 270; dag < 360; dag++) T.tikGebouwenDag(S, dag);
  assert.equal(S.bevolking, 20);
});

test('T.tikBehoeftenDag: een aanhoudend tekort in de winter kost mensen, en dat is deterministisch', () => {
  function proef() {
    const S = maakS();
    S.bevolking = 20;
    // Geen graan, geen hout of turf: een volledig tekort, de hele winter door.
    for (let dag = 270; dag < 360; dag++) T.tikGebouwenDag(S, dag);
    return S.bevolking;
  }
  const a = proef();
  const b = proef();
  assert.ok(a < 20, `verwachtte verlies door de winter, de bevolking bleef ${a}`);
  assert.equal(a, b, 'dezelfde voorraad hoort tot hetzelfde verlies te leiden, niet tot een dobbelsteen');
});

test('T.tikBehoeftenDag: een gezin trekt weg op een groeidag als de tevredenheid ver onder de vertrekdrempel blijft', () => {
  const S = maakS();
  S.bevolking = 20;
  T.zetVoorraad(S, 'graan', 0); // hongersnood, en het is winter: de tevredenheid raakt de bodem
  T.tikBehoeftenDag(S, WINTERDAG);
  assert.equal(S.bevolking, 20 - T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
});

test('T.tikBehoeftenDag: geen vertrek op een gewone dag, ook niet bij lage tevredenheid', () => {
  const S = maakS();
  S.bevolking = 20;
  T.zetVoorraad(S, 'graan', 0);
  T.tikBehoeftenDag(S, WINTERDAG + 1); // geen veelvoud van gezinDagen
  assert.equal(S.bevolking, 20, 'winterverlies mag er zijn, maar niet het hele gezin ineens');
});

// ── Groei via T.tikGebouwenDag (js/gebouwen.js): de nieuwe tevredenheidsgrens ──

test('T.tikGebouwenDag: geen nieuw gezin op een groeidag als de tevredenheid onder de groeidrempel is', () => {
  const S = maakS();
  S.gebouwen.push({ soort: 'huis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 }); // woonruimte 5
  S.bevolking = 1;
  T.zetVoorraad(S, 'graan', 1000); // geen honger, ruim boven de buffer
  // Geen hout of turf: in de winter (dag 280) zakt de tevredenheid onder de groeidrempel.
  T.tikGebouwenDag(S, WINTERDAG);
  assert.equal(S.bevolking, 1);
});

test('T.tikGebouwenDag: productie schaalt mee met de tevredenheid (T.BEHOEFTEN_INSTELLINGEN.werkBasis)', () => alsJijHetSeizoenDoet(() => {
  const S = maakS();
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  S.bevolking = T.GEBOUWEN.houthakker.handen;
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  T.zetVoorraad(S, 'hout', 0);
  const dag = 1;
  const verwachteTevredenheid = T.berekenTevredenheid(S, dag).tevredenheid;
  const werkFactor = IN.werkBasis + (1 - IN.werkBasis) * verwachteTevredenheid;
  T.tikGebouwenDag(S, dag);
  const verwacht = T.GEBOUWEN.houthakker.maakt.uit.hout * werkFactor;
  assert.ok(Math.abs(S.voorraad.hout - verwacht) < 1e-9, `verwachtte ${verwacht}, kreeg ${S.voorraad.hout}`);
}));

// ── Een huis dat doorgroeit ──

test('T.tikBehoeftenDag: een huis groeit door (T.GEBOUWEN[x].wordt) als het lang genoeg tevreden genoeg is en er ruimte is', () => {
  const S = maakS(40, 40);
  T.zetVoorraad(S, 'hout', 8);
  const r = T.plaatsGebouw(S, 'hut', 10, 10); // een huis past ruim in de lege wereld
  assert.equal(r.gelukt, true);
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) T.tikGebouwenDag(S, d);
  assert.equal(S.gebouwen[0].klaar, true);

  S.bevolking = 4;
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'groente', 1000);
  T.zetVoorraad(S, 'vis', 1000);
  T.zetVoorraad(S, 'vlees', 1000);
  S.gebouwen.push({ soort: 'kapel', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });

  let dag = T.GEBOUWEN.hut.bouwtijd;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) {
    dag++;
    T.tikGebouwenDag(S, dag);
  }
  assert.equal(S.gebouwen[0].soort, 'huis');
  // Het huis krijgt een tekening van zijn soort, en de voet van die tekening (T.gebouwVoet), niet de
  // geschatte voet uit T.GEBOUWEN.
  const voet = T.gebouwVoet('huis', S.gebouwen[0].tekening);
  assert.ok(S.gebouwen[0].tekening, 'het huis heeft een tekening');
  assert.deepEqual(S.gebouwen[0].voorwerp.beslaat, [voet.b, voet.h]);
  // De uitbreiding is ook echt vast gemaakt, anders kan er straks iets overlappend bij staan.
  assert.equal(T.isVast(S.wereld, 14, 14), true);
});

// G (werklijst vraag 114; Marcel, 4 okt: "G ja"): het nieuwe huis rijst op in de laatste bouwfasen van zijn nieuwe tekening,
// over de bouwtijd van zijn soort, en wie erin woont, blijft erin wonen. Alleen het beeld: het gebouw is meteen klaar.
function laatEenHutDoorgroeien(S) {
  let dag = 0;
  const tik = () => {
    dag++;
    S.kalender.dag = dag;
    T.tikGebouwenDag(S, dag);
  };
  T.zetVoorraad(S, 'hout', 8);
  T.plaatsGebouw(S, 'hut', 10, 10);
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) tik();
  S.bevolking = 4;
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'groente', 1000);
  T.zetVoorraad(S, 'vis', 1000);
  T.zetVoorraad(S, 'vlees', 1000);
  S.gebouwen.push({ soort: 'kapel', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; i++) tik();
  return tik;
}

test('G: een huis dat doorgroeit, rijst op in zijn laatste bouwfasen, en wie erin woont, blijft erin wonen', () => {
  const S = maakS(40, 40);
  const tik = laatEenHutDoorgroeien(S);
  const g = S.gebouwen[0];
  assert.equal(g.soort, 'huis');
  assert.equal(g.klaar, true, 'het gebouw is klaar: de regels zien het nieuwe huis meteen');
  const v = g.voorwerp;
  assert.ok(T.BOUWFASEN.fasen[v.tekeningNaam], `${v.tekeningNaam} heeft bouwfasen`);
  assert.equal(v.inAanbouw, true, 'het voorwerp rijst op');
  // van de muren met steigers tot half gedekt, over de bouwtijd van een huis
  const fasen = [];
  for (let d = 0; d < T.GEBOUWEN.huis.bouwtijd; d++) {
    fasen.push(T.bouwFaseIndex(S.kalender.dag, v.klaarOp, v.bouwtijd, v.vanFase));
    tik();
  }
  assert.deepEqual([...new Set(fasen)], [2, 3, 4]);
  assert.equal(v.inAanbouw, false, 'na de bouwtijd van een huis staat het er af');
});

test('G: een tekening zonder bouwfasen groeit in één nacht, zoals altijd', () => {
  const bewaard = T.BOUWFASEN;
  T.BOUWFASEN = { fasen: {} };
  try {
    const S = maakS(40, 40);
    laatEenHutDoorgroeien(S);
    assert.equal(S.gebouwen[0].soort, 'huis');
    assert.ok(!S.gebouwen[0].voorwerp.inAanbouw);
  } finally {
    T.BOUWFASEN = bewaard;
  }
});

test('T.bouwFaseIndex vanaf een fase: de bouwtijd in zoveel stukken als er fases over zijn', () => {
  // zonder vanaf zoals altijd: vijf stukken (midden in elk stuk gemeten)
  assert.deepEqual([0.5, 1.5, 2.5, 3.5, 4.5, 5].map((d) => T.bouwFaseIndex(d, 5, 5)), [0, 1, 2, 3, 4, 4]);
  // vanaf de muren met steigers (2): drie stukken
  assert.deepEqual([0, 1, 2, 3, 4].map((d) => T.bouwFaseIndex(d, 4, 4, 2)), [2, 2, 3, 4, 4]);
  assert.equal(T.bouwFaseIndex(0, null, 4, 2), 2, 'nog niet begonnen: de eerste fase');
});

test('T.tikBehoeftenDag: een huis groeit niet door als er geen ruimte voor de uitbreiding is', () => {
  const S = maakS(40, 40);
  T.zetVoorraad(S, 'hout', 8);
  T.plaatsGebouw(S, 'hut', 10, 10); // voet 3x3: (10..12, 10..12)
  for (let d = 1; d <= T.GEBOUWEN.hut.bouwtijd; d++) T.tikGebouwenDag(S, d);

  // De hele wereld op muur, op de hut zelf na: "huis" (6x6) past dan nergens.
  for (let y = 0; y < 40; y++) {
    for (let x = 0; x < 40; x++) {
      if (x >= 10 && x < 13 && y >= 10 && y < 13) continue;
      S.wereld.tegels[y][x] = 'muur';
    }
  }
  T.kaartVeranderd(S.wereld); // zoals elke regel die een tegel verandert (js/wereld.js)
  S.bevolking = 4;
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'groente', 1000);
  T.zetVoorraad(S, 'vis', 1000);
  T.zetVoorraad(S, 'vlees', 1000);
  S.gebouwen.push({ soort: 'kapel', x: 10, y: 10, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });

  let dag = T.GEBOUWEN.hut.bouwtijd;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5; i++) {
    dag++;
    T.tikGebouwenDag(S, dag);
  }
  assert.equal(S.gebouwen[0].soort, 'hut');
});

test('T.tikBehoeftenDag: een huis dat van vorm wisselt (smal en diep naar breed en ondiep) laat geen onzichtbare muur achter', () => {
  // In het echte tegelvel is "hut" smal en diep (5×7) en "huis" breed en ondiep (7×5) — geen
  // gewone groei in twee richtingen, maar een andere vorm. Dat hier nabootsen met twee eigen soorten
  // zonder tekening (dus met hun eigen voet), zodat de toets niet afhangt van welke tekeningen er op
  // het vel staan.
  T.GEBOUWEN._proefSmal = { naam: 'smal', trede: 'gehucht', voet: { b: 3, h: 7 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 1, wordt: '_proefBreed', maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  T.GEBOUWEN._proefBreed = { naam: 'breed', trede: 'gehucht', voet: { b: 7, h: 3 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 2, maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  try {
    const S = maakS(30, 30);
    const instantie = { soort: '_proefSmal', x: 5, y: 5, klaar: true, klaarOp: 0, handen: 0, voorwerp: { soort: 'gebouw:_proefSmal', vel: null, id: null, beslaat: [3, 7] } };
    S.gebouwen.push(instantie);
    for (let dy = 0; dy < 7; dy++) for (let dx = 0; dx < 3; dx++) S.wereld.tegels[5 + dy][5 + dx] = 'muur';

    S.bevolking = 4;
    T.zetVoorraad(S, 'graan', 100000);
    T.zetVoorraad(S, 'groente', 1000);
    T.zetVoorraad(S, 'vis', 1000);
    T.zetVoorraad(S, 'vlees', 1000);
    S.gebouwen.push({ soort: 'kapel', x: 20, y: 20, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });

    for (let dag = 1; dag <= T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen; dag++) T.tikGebouwenDag(S, dag);

    assert.equal(instantie.soort, '_proefBreed');
    // De twee rijen die "breed" (7×3) niet meer beslaat maar "smal" (3×7) wél deed, horen weer
    // los te zijn -- anders staat daar een muur zonder gebouw erop (T.isVast zonder tekening).
    assert.equal(T.isVast(S.wereld, 5, 8), false, 'rij 3 (dy=3) hoort weer vrij te zijn');
    assert.equal(T.isVast(S.wereld, 5, 11), false, 'rij 6 (dy=6) hoort weer vrij te zijn');
    // De volle nieuwe voet (7×3) staat wél nog vast.
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 7; dx++) assert.equal(T.isVast(S.wereld, 5 + dx, 5 + dy), true);
  } finally {
    delete T.GEBOUWEN._proefSmal;
    delete T.GEBOUWEN._proefBreed;
  }
});

// Een huis dat doorgroeit, blijft van een erf af, en drie tegels van de plek van het huis erop, zoals een nieuw gebouw
// (werklijst vraag 110, f: in de speeltest van vier jaar groeide op 62707 een huis van de maker door tot stenen huis, met
// 21 tegels op een vrij erf, en kwam er twee en een half jaar geen gezin).
test('T.tikBehoeftenDag: een huis groeit niet op een erf, en niet in het looppad om de plek van het huis erop', () => {
  T.GEBOUWEN._proefKlein = { naam: 'klein', trede: 'gehucht', voet: { b: 3, h: 3 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 1, wordt: '_proefGroot', maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  T.GEBOUWEN._proefGroot = { naam: 'groot', trede: 'gehucht', voet: { b: 6, h: 6 }, kosten: {}, bouwtijd: 0, handen: 0, woonruimte: 2, maakt: null, verdacht: false, menu: false, tekening: null, beschrijving: '', opmerking: 'alleen voor deze toets' };
  // Het dorp vol, maar zonder dat een gezin het erf neemt: dan blijft het vrij, en kan het straks weer weg.
  const zelf = T.ERVEN_INSTELLINGEN.dorpBouwtZelf;
  T.ERVEN_INSTELLINGEN.dorpBouwtZelf = false;
  try {
    const S = maakS(60, 40);
    const { erf } = T.legErfAan(S, 30, 10);
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const west = Math.min(erf.x, erf.x + erf.plan.dx - n); // de westrand van het erf en van het looppad om zijn huis
    // Een klein huis net ten westen daarvan, op de rij van het huis: groot (6 bij 6) zou er met zijn oostkant in komen.
    const x = west - 3;
    const y = erf.y + erf.plan.dy;
    const instantie = { soort: '_proefKlein', x, y, klaar: true, klaarOp: 0, handen: 0, voorwerp: { soort: 'gebouw:_proefKlein', vel: null, id: null, beslaat: [3, 3] } };
    S.gebouwen.push(instantie);
    for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) S.wereld.tegels[y + dy][x + dx] = 'muur';
    T.kaartVeranderd(S.wereld);

    S.bevolking = 4;
    T.zetVoorraad(S, 'graan', 100000);
    T.zetVoorraad(S, 'groente', 1000);
    T.zetVoorraad(S, 'vis', 1000);
    T.zetVoorraad(S, 'vlees', 1000);
    S.gebouwen.push({ soort: 'kapel', x: 5, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });

    let dag = 0;
    for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5; i++) T.tikGebouwenDag(S, ++dag);
    assert.equal(instantie.soort, '_proefKlein', 'het groeit niet in het looppad van het erf');
    assert.equal(T.hutPastOpErf(S, erf), true, 'en het erf neemt nog een hut');

    // Is het erf weg, dan groeit het wel: dan was het erf het enige wat in de weg stond.
    assert.equal(T.haalErfWeg(S, erf).gelukt, true);
    for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5; i++) T.tikGebouwenDag(S, ++dag);
    assert.equal(instantie.soort, '_proefGroot');
  } finally {
    T.ERVEN_INSTELLINGEN.dorpBouwtZelf = zelf;
    delete T.GEBOUWEN._proefKlein;
    delete T.GEBOUWEN._proefGroot;
  }
});

// Een gebouw op de kaart heeft sinds 1 okt wel zijn voorwerp (T.zetBestaandeGebouwen; test/wensen.test.cjs).
test('T.tikBehoeftenDag: een gebouw zonder voorwerp groeit niet mee', () => {
  const S = maakS(40, 40);
  S.gebouwen.push({ soort: 'hut', x: 10, y: 10, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  S.bevolking = 4;
  T.zetVoorraad(S, 'graan', 100000);
  T.zetVoorraad(S, 'groente', 1000);
  T.zetVoorraad(S, 'vis', 1000);
  T.zetVoorraad(S, 'vlees', 1000);
  S.gebouwen.push({ soort: 'kapel', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  let dag = 0;
  for (let i = 0; i < T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen + 5; i++) {
    dag++;
    T.tikGebouwenDag(S, dag);
  }
  assert.equal(S.gebouwen[0].soort, 'hut');
});

// ---------------------------------------------------------------------------------------------
// Zout houdt vis en vlees goed (spel.md, "Handel", 24 sep 2026)
// ---------------------------------------------------------------------------------------------

test('zonder zout bederft vis; met genoeg zout niet; met half genoeg de helft', () => {
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  const zonder = maakS();
  zonder.voorraad.vis = 100;
  T.tikBehoeftenDag(zonder, ZOMERDAG);
  assert.ok(Math.abs(zonder.voorraad.vis - 100 * (1 - IN.bederfPerDag)) < 1e-9);

  const met = maakS();
  met.voorraad.vis = 100;
  met.voorraad.zout = 100 / IN.zoutHoudtGoed;
  T.tikBehoeftenDag(met, ZOMERDAG);
  assert.equal(met.voorraad.vis, 100);

  const half = maakS();
  half.voorraad.vis = 100;
  half.voorraad.zout = 50 / IN.zoutHoudtGoed;
  T.tikBehoeftenDag(half, ZOMERDAG);
  assert.ok(Math.abs(half.voorraad.vis - (100 - 50 * IN.bederfPerDag)) < 1e-9);
});

test('wie gezouten vis eet, eet het zout mee op', () => {
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  const S = maakS();
  S.bevolking = 100;
  S.voorraad.graan = 1000;
  S.voorraad.vis = 50;
  S.voorraad.zout = 10;
  T.tikBehoeftenDag(S, ZOMERDAG);
  const gegeten = 100 * IN.extraVoedselPerMensPerDag;
  assert.ok(Math.abs(S.voorraad.vis - (50 - gegeten)) < 1e-9, 'de vis is gegeten, en er bedierf niets');
  assert.ok(Math.abs(S.voorraad.zout - (10 - gegeten / IN.zoutHoudtGoed)) < 1e-9);
});

test('de beek ligt \'s winters dicht: zonder zout is de vis dan op, met zout blijft hij', () => {
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  function winterMetVis(zout) {
    const S = maakS();
    S.gebouwen.push({ soort: 'visser', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
    S.bevolking = 1;
    S.voorraad.graan = 1000;
    S.voorraad.hout = 1000;
    S.voorraad.vis = 40;
    S.voorraad.zout = zout;
    for (let dag = WINTERDAG; dag < WINTERDAG + 45; dag++) T.tikGebouwenDag(S, dag);
    return S;
  }
  const zonder = winterMetVis(0);
  const met = winterMetVis(10);
  assert.ok(zonder.voorraad.vis < IN.extraVoedselDrempel, `zonder zout: ${zonder.voorraad.vis}`);
  assert.ok(met.voorraad.vis > 35, `met zout: ${met.voorraad.vis}`);
});

// ── Honger buiten de winter: een optie in de Spelregels (js/opties.js; Marcel, 24 sep) ──

// Zet de optie zolang de toets loopt, en daarna weer terug.
function metHonger(wijze, fn) {
  const was = T.BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter;
  T.BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter = wijze;
  try {
    fn();
  } finally {
    T.BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter = was;
  }
}

test('honger buiten de winter kost standaard alleen tevredenheid, geen mensen', () => {
  assert.equal(T.BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter, 'tevredenheid');
  const S = maakS();
  S.bevolking = 20;
  for (let dag = ZOMERDAG; dag < ZOMERDAG + 60; dag++) T.tikBehoeftenDag(S, dag);
  assert.equal(S.bevolking, 20);
});

test('honger buiten de winter, "sterven": een tekort aan eten kost het hele jaar mensen', () => {
  metHonger('sterven', () => {
    const S = maakS();
    S.bevolking = 20;
    for (let dag = ZOMERDAG; dag < ZOMERDAG + 60; dag++) T.tikBehoeftenDag(S, dag);
    assert.ok(S.bevolking < 20, `nog ${S.bevolking}`);
    // Met eten genoeg sterft er niemand.
    const vol = maakS();
    vol.bevolking = 20;
    T.zetVoorraad(vol, 'graan', 1000);
    for (let dag = ZOMERDAG; dag < ZOMERDAG + 60; dag++) T.tikBehoeftenDag(vol, dag);
    assert.equal(vol.bevolking, 20);
  });
});

test('honger buiten de winter, "wegtrekken": op een groeidag trekt een gezin weg zolang er geen eten is', () => {
  metHonger('wegtrekken', () => {
    const S = maakS();
    S.bevolking = 20;
    T.tikBehoeftenDag(S, 40); // een groeidag in de lente, zonder graan
    assert.equal(S.bevolking, 20 - T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
    T.tikBehoeftenDag(S, 41); // geen groeidag: niemand
    assert.equal(S.bevolking, 20 - T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
    // Met eten blijft iedereen.
    T.zetVoorraad(S, 'graan', 1000);
    T.tikBehoeftenDag(S, 60);
    assert.equal(S.bevolking, 20 - T.GEBOUWEN_INSTELLINGEN.gezinGrootte);
  });
});

// ---------------------------------------------------------------------------------------------
// De winter zien aankomen (werklijst, vraag 44; Marcel, 27 sep: "A ja B ja C ja")
// ---------------------------------------------------------------------------------------------

const bijna = (a, b) => Math.abs(a - b) < 1e-9;

// De dag (vanaf het begin van het spel, 1 lentemaand) van een datum in het eerste jaar.
function dagVan(maand, dagVanMaand) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  return ((m - T.TIJD_START_MAAND + 12) % 12) * T.DAGEN_PER_MAAND + dagVanMaand - 1;
}

// Wat het dorp zegt terwijl fn loopt: T.ui vangt de berichten, en daarna is T.ui weer zoals het was.
function berichtenVan(fn) {
  const oud = T.ui;
  const berichten = [];
  T.ui = { bericht: (tekst, soort) => berichten.push({ tekst, soort }) };
  try {
    fn();
  } finally {
    T.ui = oud;
  }
  return berichten;
}

// Zoals het gehucht begint: 26 mensen, dus 7 huishoudens, die samen 1,05 hout per winterdag stoken, en
// 40 hout. Graan genoeg, zodat het hier om het hout gaat.
function gehucht() {
  const S = maakS();
  S.bevolking = 26;
  T.zetVoorraad(S, 'hout', 40);
  T.zetVoorraad(S, 'graan', 1000);
  return S;
}

test('de winter van het dorp duurt negentig dagen, die van het vee honderdvijftig', () => {
  const winter = (d) => T.datumVanDag(d).seizoen === 'winter';
  assert.deepEqual(T.periodeVanaf(dagVan('herfstmaand', 1), winter), { tot: 90, duur: 90 });
  assert.deepEqual(T.periodeVanaf(WINTERDAG, winter), { tot: 0, duur: 80 }, '11 wintermaand: nog 80, met vandaag');
  assert.deepEqual(T.periodeVanaf(dagVan('sprokkelmaand', 30), winter), { tot: 0, duur: 1 });
  // Het vee eet hooi van slachtmaand tot en met lentemaand (js/vee.js).
  assert.equal(T.winterDagen(dagVan('herfstmaand', 1)), 150);
});

test('T.haaltDeWinter: wat er ligt, wat er tot de winter bij komt of af gaat, en wat een winterdag kost', () => {
  assert.deepEqual(T.haaltDeWinter({ voorraad: 40, perWinterdag: 1.05, winter: 90 }), { dagen: 38, winter: 90, haalt: false });
  assert.deepEqual(T.haaltDeWinter({ voorraad: 40, voorWinter: 60, perWinterdag: 1, winter: 90 }), { dagen: 90, winter: 90, haalt: true });
  // Het dorp eet ook vóór de winter: is het dan al op, dan haalt het geen dag.
  assert.equal(T.haaltDeWinter({ voorraad: 10, voorWinter: -30, perWinterdag: 1, winter: 90 }).dagen, 0);
  // Komt er in de winter meer bij dan er af gaat, dan haalt het de winter, ook zonder voorraad.
  assert.equal(T.haaltDeWinter({ voorraad: 0, perWinterdag: -1, winter: 90 }).haalt, true);
});

test('T.raaktOp: de zin, alleen als het de winter niet haalt en binnenkort op is', () => {
  const v = (dagen, winter) => ({ dagen, winter, haalt: dagen >= winter });
  assert.equal(T.raaktOp('het hout', v(12, 40), 15), 'Het hout is over 12 dagen op, en de winter duurt nog 40 dagen.');
  assert.equal(T.raaktOp('het eten', v(1, 40), 15), 'Het eten is over één dag op, en de winter duurt nog 40 dagen.');
  assert.equal(T.raaktOp('het hout', v(0, 1), 15), 'Het hout is op, en de winter duurt nog één dag.');
  assert.equal(T.raaktOp('het hout', v(20, 40), 15), null, 'nog niet binnenkort');
  assert.equal(T.raaktOp('het hout', v(40, 40), 15), null, 'het haalt de winter');
});

test('T.houtVoorDeWinter: het gehucht haalt met 40 hout en wat het sprokkelt 52 van de 90 dagen, met een houthakker de hele winter', () => {
  const S = gehucht();
  const dag = dagVan('herfstmaand', 1);
  const v = T.houtVoorDeWinter(S, dag);
  assert.ok(bijna(v.stook, 7 * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag));
  // Sprokkelen (vraag 74, stap 2; Marcel: "lost niet volledig op. Houthakker is nodig"): 7 huishoudens rapen 0,105
  // per dag, dus 9,45 tot de winter, en in de winter stoken ze 0,945 per dag meer dan ze rapen.
  assert.ok(bijna(v.erbij, 7 * T.BEHOEFTEN_INSTELLINGEN.sprokkelPerHuishoudenPerDag));
  assert.deepEqual([v.tot, v.dagen, v.winter, v.haalt], [90, 52, 90, false]);
  alsJijHetSeizoenDoet(() => assert.equal(T.houtVoorDeWinter(S, dag).dagen, 38, 'zonder sprokkelen 38'));
  // Een houthakker die de laatste dag op volle kracht hakte (g.werkte, js/gebouwen.js): 2 per dag.
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 1, werkte: 1 });
  const met = T.houtVoorDeWinter(S, dag);
  assert.ok(bijna(met.erbij, T.GEBOUWEN.houthakker.maakt.uit.hout + v.erbij));
  assert.equal(met.haalt, true);
});

test('zonder houthakker haalt een gehucht dat alleen sprokkelt de winter niet, ook als het er een jaar voor krijgt', () => {
  const S = gehucht();
  // Een heel jaar sprokkelen, vanaf 1 lentemaand zonder hout: dan de winter in.
  T.zetVoorraad(S, 'hout', 0);
  const v = T.houtVoorDeWinter(S, 0);
  assert.equal(v.haalt, false);
  assert.ok(v.dagen > 0 && v.dagen < v.winter / 2, `het haalt ${v.dagen} van de ${v.winter} dagen: minder dan de helft`);
});

test('T.etenVoorDeWinter: het dorp eet het hele jaar, en graan, kaas en vlees tellen alle drie', () => {
  const S = maakS();
  S.bevolking = 20; // samen één graan per dag
  T.zetVoorraad(S, 'graan', 100);
  const dag = dagVan('slachtmaand', 1);
  // Dertig dagen eten tot de winter, en dan nog 70 voor de 90 winterdagen.
  const v = T.etenVoorDeWinter(S, dag);
  assert.deepEqual([v.tot, v.dagen, v.winter, v.haalt], [30, 70, 90, false]);
  T.zetVoorraad(S, 'kaas', 10);
  T.zetVoorraad(S, 'vlees', 10);
  assert.equal(T.etenVoorDeWinter(S, dag).haalt, true);
});

test('T.etenVoorDeWinter: de soldaten van de heer eten mee zolang ze er zijn', () => {
  const S = maakS();
  S.bevolking = 20;
  T.zetVoorraad(S, 'graan', 100);
  const dag = dagVan('wintermaand', 1);
  const zonder = T.etenVoorDeWinter(S, dag);
  S.heer = T.nieuweHeer();
  S.heer.soldaten = { tot: dag + 90, wezens: [] };
  const met = T.etenVoorDeWinter(S, dag);
  const H = T.HEER_INSTELLINGEN;
  assert.ok(bijna(met.eet - zonder.eet, H.soldaten * H.soldaatEetAls * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag));
  assert.ok(zonder.haalt && !met.haalt, `zonder ${zonder.dagen}, met ${met.dagen}`);
});

test('op 1 herfstmaand en 1 slachtmaand zegt het dorp of het hout en het eten de winter halen, en wat helpt', () => {
  const S = gehucht();
  assert.deepEqual(berichtenVan(() => T.tikBehoeftenDag(S, dagVan('herfstmaand', 1))), [{
    tekst: 'Over drie maanden is het winter. Het hout haalt 52 van de 90 dagen, ook met wat de mensen sprokkelen: een houthakker hakt 2 hout per dag. Het eten haalt de winter. Tot het genoeg is, komt er geen nieuw gezin.',
    soort: 'gevaar',
  }]);
  assert.deepEqual(berichtenVan(() => T.tikBehoeftenDag(S, dagVan('herfstmaand', 2))), [], 'alleen op die dagen');
  // Staat er al een houthakker, dan helpt er nog een.
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  assert.match(berichtenVan(() => T.tikBehoeftenDag(S, dagVan('slachtmaand', 1)))[0].tekst, /Het hout haalt \d+ van de 90 dagen, ook met wat de mensen sprokkelen: nog een houthakker hakt er 2 per dag bij\./);
  T.zetVoorraad(S, 'hout', 200);
  assert.deepEqual(berichtenVan(() => T.tikBehoeftenDag(S, dagVan('slachtmaand', 1))), [
    { tekst: 'Over een maand is het winter. Het hout en het eten halen de winter.', soort: 'goed' },
  ]);
});

test('in de winter zegt het dorp één keer dat het hout op raakt, en de volgende winter weer', () => alsJijHetSeizoenDoet(() => {
  const S = maakS();
  S.bevolking = 20; // 5 huishoudens: 0,75 hout per dag
  T.zetVoorraad(S, 'graan', 1000);
  T.zetVoorraad(S, 'hout', 12); // zestien dagen
  const eerste = dagVan('wintermaand', 1);
  const gezegd = [];
  for (let dag = eerste; dag < eerste + 5; dag++) {
    for (const b of berichtenVan(() => T.tikBehoeftenDag(S, dag))) gezegd.push(`${dag - eerste + 1} wintermaand: ${b.tekst}`);
  }
  assert.deepEqual(gezegd, ['2 wintermaand: Het hout is over 15 dagen op, en de winter duurt nog 89 dagen.']);
  // Na de winter mag het weer.
  T.tikBehoeftenDag(S, T.DAGEN_PER_JAAR); // 1 lentemaand
  T.zetVoorraad(S, 'hout', 11.25);
  const weer = berichtenVan(() => T.tikBehoeftenDag(S, eerste + T.DAGEN_PER_JAAR));
  assert.deepEqual(weer.map((b) => b.tekst), ['Het hout is over 15 dagen op, en de winter duurt nog 90 dagen.']);
}));

test('wie in de winter sterft, sterft van de kou of de honger, en het bericht zegt waaraan', () => {
  function eersteDode(hout, graan) {
    const S = maakS();
    S.bevolking = 20;
    T.zetVoorraad(S, 'hout', hout);
    T.zetVoorraad(S, 'graan', graan);
    const berichten = berichtenVan(() => {
      for (let dag = WINTERDAG; dag < WINTERDAG + 20; dag++) T.tikBehoeftenDag(S, dag);
    });
    return berichten.map((b) => b.tekst).find((t) => t.includes('dorpeling'));
  }
  assert.equal(eersteDode(0, 1000), 'De kou is hard, want het hout is op: het dorp verliest een dorpeling.');
  assert.equal(eersteDode(1000, 0), 'De honger is hard, want het eten is op: het dorp verliest een dorpeling.');
  assert.equal(eersteDode(0, 0), 'De winter is hard, want het hout en het eten zijn op: het dorp verliest een dorpeling.');
});

test('het dorp mist brandhout voor de winter zodra het hout de winter niet haalt, niet pas als het op is', () => {
  const S = gehucht();
  const dag = dagVan('herfstmaand', 1);
  assert.ok(T.berekenTevredenheid(S, dag).mist.includes('brandhout voor de winter'));
  T.zetVoorraad(S, 'hout', 200);
  assert.ok(!T.berekenTevredenheid(S, dag).mist.includes('brandhout voor de winter'));
});

// ── Vlees vult een maag, ook als het dorp kijkt of er eten is (28 sep) ──

test('vlees vult een maag, ook in de winter: wie alleen vlees heeft, sterft niet van de honger', () => {
  // Tot 28 sep telde het vlees niet mee in wat er te eten was, terwijl het dorp het wel at.
  const S = maakS();
  S.bevolking = 20;
  T.zetVoorraad(S, 'hout', 1000);
  T.zetVoorraad(S, 'vlees', 200);
  T.zetVoorraad(S, 'zout', 20);
  assert.equal(T.berekenTevredenheid(S, WINTERDAG).voedselDekking, 1);
  for (let dag = WINTERDAG; dag < WINTERDAG + 20; dag++) T.tikGebouwenDag(S, dag);
  assert.equal(S.bevolking, 20);
  assert.ok(S.voorraad.vlees < 200, 'en het vlees is gegeten');
});

test('het zaaigraan is niet voor de molen: een werkplaats neemt alleen het graan dat de boeren niet achterhouden', () => {
  // In de speeltest van 2 okt (vraag 92) maalde de molen het zaaigraan op, en bleven de akkers in de lente ongezaaid.
  const S = maakS();
  S.wereld.akkers = [{ x: 0, y: 0, b: 5, h: 4 }];
  S.wereld.wezens = []; // met akkers komen er rovers kijken (js/rovers.js), en die zoeken de wezens van de kaart
  const zaai = 20 * T.ZAAIGRAAN_PER_TEGEL;
  S.gebouwen.push({ soort: 'molen', x: 30, y: 30, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  S.bevolking = T.GEBOUWEN.molen.handen; // de molenaar; hij eet het zaaigraan ook niet, want er is kaas
  T.zetVoorraad(S, 'kaas', 100);
  T.zetVoorraad(S, 'graan', zaai);
  T.tikGebouwenDag(S, WINTERDAG);
  assert.ok(bijna(S.voorraad.graan, zaai), `het zaaigraan blijft liggen: ${S.voorraad.graan}`);
  assert.equal(S.voorraad.meel || 0, 0);
  assert.equal(S.gebouwen[0].tekort, 'graan');
  // Wat er meer ligt, maalt hij wel.
  T.zetVoorraad(S, 'graan', zaai + 1);
  T.tikGebouwenDag(S, WINTERDAG + 1);
  assert.ok(S.voorraad.meel > 0, 'het graan boven het zaaigraan maalt hij');
  assert.ok(S.voorraad.graan >= zaai - 1e-9, `${S.voorraad.graan}`);
});

test('het zaaigraan: van de oogst tot het zaaien achtergehouden, en pas bij nood gegeten (vraag 81)', () => {
  const S = maakS();
  S.wereld.akkers = [{ x: 0, y: 0, b: 5, h: 4 }, { x: 10, y: 0, b: 2, h: 5, plan: 'weide' }];
  const zaai = 20 * T.ZAAIGRAAN_PER_TEGEL; // de akker van 20 tegels; het veld dat weide wordt, telt niet
  // Van het zaaien tot de oogst houden de boeren niets achter; van de oogst tot het zaaien zoveel als volgend jaar vraagt.
  assert.equal(T.zaaigraanApart(S, ZOMERDAG), 0);
  assert.equal(T.zaaigraanApart(S, dagVan('oogstmaand', 30)), 0);
  assert.equal(T.zaaigraanApart(S, dagVan('herfstmaand', 1)), zaai);
  assert.equal(T.zaaigraanApart(S, WINTERDAG), zaai);
  assert.equal(T.zaaigraanApart(S, T.DAGEN_PER_JAAR), 0, 'op 1 lentemaand gaat het de grond in');
  // Het dorp eet eerst het andere graan, dan de kaas, en pas dan het zaaigraan; en zegt dat één keer.
  S.bevolking = 20; // samen 1 graan per dag
  T.zetVoorraad(S, 'graan', zaai + 0.5);
  T.zetVoorraad(S, 'kaas', 0.3);
  const gezegd = berichtenVan(() => {
    const r = T.eetVandaag(S, WINTERDAG);
    assert.ok(bijna(r.zaaigraan, 0.2), `van het zaaigraan: ${r.zaaigraan}`);
    assert.ok(bijna(r.tekort, 0), 'niemand komt tekort');
    assert.ok(bijna(S.voorraad.kaas, 0), 'de kaas ging voor');
    T.eetVandaag(S, WINTERDAG + 1);
  });
  assert.deepEqual(gezegd.map((b) => b.soort), ['gevaar'], 'één keer');
  assert.match(gezegd[0].tekst, /eet van het zaaigraan/);
  // Na het zaaien mag het de volgende winter weer.
  T.eetVandaag(S, T.DAGEN_PER_JAAR);
  assert.equal(S.behoeften.zaaigraanGegeten, false);
  // De winter rekent het eten zonder het zaaigraan: wat net genoeg is met, is te weinig zonder.
  T.zetVoorraad(S, 'kaas', 0);
  T.zetVoorraad(S, 'graan', 190); // 1 per dag: 90 dagen tot de winter, en 100 voor de 90 winterdagen
  assert.equal(T.etenVoorDeWinter(S, dagVan('herfstmaand', 1)).haalt, false, 'zonder het zaaigraan haalt het de winter niet');
  // Met de spelregel Zaaigraan op Als ander graan is het zoals vóór 1 okt.
  T.VELDEN_INSTELLINGEN.zaaigraanApart = false;
  try {
    assert.equal(T.zaaigraanApart(S, WINTERDAG), 0);
    assert.equal(T.etenVoorDeWinter(S, dagVan('herfstmaand', 1)).haalt, true);
  } finally {
    T.VELDEN_INSTELLINGEN.zaaigraanApart = true;
  }
});
