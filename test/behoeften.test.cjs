// De behoeften van het dorp zonder scherm (js/behoeften.js): eten, brandhout en een kerk, de
// tevredenheid die daaruit volgt (T.berekenTevredenheid, puur), en wat T.tikBehoeftenDag daarmee
// doet — stoken, de winter zijn tol laten eisen, een gezin laten vertrekken, een huis laten
// doorgroeien. Zie ontwerp/werklijst.md, punt 3 en ontwerp/spel.md, "Het dorp in leven houden".
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
const T = globalThis.Toren;

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

test('T.tikBehoeftenDag: stookt in de winter turf vóór hout', () => {
  const S = maakS();
  S.bevolking = 4; // 1 huishouden
  T.zetVoorraad(S, 'turf', 10);
  T.zetVoorraad(S, 'hout', 10);
  T.tikBehoeftenDag(S, WINTERDAG);
  const benodigd = 1 * T.BEHOEFTEN_INSTELLINGEN.brandhoutPerHuishoudenPerDag;
  assert.ok(Math.abs(S.voorraad.turf - (10 - benodigd)) < 1e-9);
  assert.equal(S.voorraad.hout, 10, 'hout blijft onaangeroerd zolang de turf het dekt');
});

test('T.tikBehoeftenDag: buiten de winter wordt er geen brandhout gestookt', () => {
  const S = maakS();
  S.bevolking = 4;
  T.zetVoorraad(S, 'hout', 10);
  T.tikBehoeftenDag(S, ZOMERDAG);
  assert.equal(S.voorraad.hout, 10);
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

test('T.tikGebouwenDag: productie schaalt mee met de tevredenheid (T.BEHOEFTEN_INSTELLINGEN.werkBasis)', () => {
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
});

// ── Een huis dat doorgroeit ──

test('T.tikBehoeftenDag: een huis groeit door (T.GEBOUWEN[x].wordt) als het lang genoeg tevreden genoeg is en er ruimte is', () => {
  const S = maakS(40, 40);
  T.zetVoorraad(S, 'hout', 8);
  const r = T.plaatsGebouw(S, 'hut', 10, 10); // voet 3x3; "huis" is 6x6 en past ruim in de lege wereld
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
  assert.deepEqual(S.gebouwen[0].voorwerp.beslaat, [T.GEBOUWEN.huis.voet.b, T.GEBOUWEN.huis.voet.h]);
  // De uitbreiding is ook echt vast gemaakt, anders kan er straks iets overlappend bij staan.
  assert.equal(T.isVast(S.wereld, 14, 14), true);
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
  // gewone groei in twee richtingen, maar een andere vorm. Dat hier nabootsen (in plaats van
  // T.GEBOUWEN.hut/huis zelf te gebruiken) omdat T.gebouwVoet zonder js/kaart.js altijd op de
  // geschatte, allebei-vierkante voet terugvalt, en dan test dit geval zichzelf niet.
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

test('T.tikBehoeftenDag: een gebouw zonder eigen voorwerp (al op de kaart, T.zetBestaandeGebouwen) groeit niet mee', () => {
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
