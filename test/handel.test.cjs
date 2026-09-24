// Handel zonder scherm (js/handel.js): wanneer de marskramer komt en gaat, kopen en verkopen, zijn
// buidel en zijn dalende prijs, stil verkopen als heler, de smidse die zonder ijzer stilvalt, en het
// zout dat vis en vlees de winter door helpt. Zie ontwerp/spel.md, "Handel: de marskramer, ook
// heler" (Marcel, 24 sep 2026) en ontwerp/werklijst.md, punt 4.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/pad.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
require('../js/behoeften.js');
require('../js/handel.js');
const T = globalThis.Toren;

const IN = T.HANDEL_INSTELLINGEN;
// dag 280 valt in wintermaand (zie test/behoeften.test.cjs).
const WINTERDAG = 280;

function maakLegeWereld(b, h) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('vloer'));
  return { b, h, tegels, voorwerpen: [], wezens: [], deuren: [], overgangen: [] };
}

function maakS(bevolking) {
  return {
    wereld: maakLegeWereld(30, 30),
    voorraad: T.nieuweVoorraad(),
    gebouwen: [],
    bevolking: bevolking == null ? 20 : bevolking,
    woonruimte: 0,
    kalender: { dag: 0 },
  };
}

// Laat de marskramer komen: dagen tikken tot hij er is. Geeft de dag terug.
function laatKomen(S) {
  let dag = 0;
  while (!T.marskramerIsEr(S) && dag < 100) T.tikHandelDag(S, ++dag);
  S.kalender.dag = dag;
  assert.equal(T.marskramerIsEr(S), true, 'hij kwam niet');
  return dag;
}

// ── Komen en gaan ──

test('in een dorp zonder mensen komt geen marskramer (het oude spel)', () => {
  const S = maakS(0);
  for (let d = 1; d <= 60; d++) T.tikHandelDag(S, d);
  assert.equal(S.marskramer, undefined);
});

test('hij komt op zijn eerste bezoekdag, blijft een paar dagen, en trekt dan verder', () => {
  const S = maakS();
  const dag = laatKomen(S);
  assert.equal(dag, IN.eersteBezoek);
  assert.equal(S.marskramer.buidel, IN.buidel);
  assert.equal(S.marskramer.waren.ijzer, T.MARSKRAMER_WAREN.ijzer.stuks);
  for (let d = dag + 1; d < dag + IN.blijft; d++) T.tikHandelDag(S, d);
  assert.equal(T.marskramerIsEr(S), true);
  T.tikHandelDag(S, dag + IN.blijft);
  assert.equal(T.marskramerIsEr(S), false);
});

test('hij komt terug na de tussenpoos, plus of min de spreiding', () => {
  const S = maakS();
  const eerste = laatKomen(S);
  let dag = eerste;
  while (T.marskramerIsEr(S)) T.tikHandelDag(S, ++dag);
  const weg = dag;
  while (!T.marskramerIsEr(S) && dag < 200) T.tikHandelDag(S, ++dag);
  const tussen = dag - weg;
  assert.ok(tussen >= IN.tussenpoos - IN.spreiding && tussen <= IN.tussenpoos + IN.spreiding, `na ${tussen} dagen`);
});

test('in de winter komt hij niet, maar wel zodra het dooit', () => {
  const S = maakS();
  S.handel = T.nieuweHandel();
  S.handel.volgendBezoek = WINTERDAG;
  T.tikHandelDag(S, WINTERDAG);
  assert.equal(T.marskramerIsEr(S), false);
  let dag = WINTERDAG;
  while (!T.marskramerIsEr(S) && dag < 500) T.tikHandelDag(S, ++dag);
  assert.equal(T.datumVanDag(dag).seizoen === 'winter', false);
  assert.equal(T.datumVanDag(dag - 1).seizoen, 'winter', 'de eerste dag na de winter');
});

// ── Kopen ──

test('kopen kost goud, zoveel als hij heeft en jij kunt betalen, en zijn buidel groeit', () => {
  const S = maakS();
  laatKomen(S);
  T.zetVoorraad(S, 'goud', 10);
  const r = T.koopVanMarskramer(S, 'ijzer', 5); // 4 goud per stuk: je kunt er maar twee betalen
  assert.equal(r.gelukt, true);
  assert.equal(r.aantal, 2);
  assert.equal(S.voorraad.ijzer, 2);
  assert.equal(S.voorraad.goud, 2);
  assert.equal(S.marskramer.waren.ijzer, T.MARSKRAMER_WAREN.ijzer.stuks - 2);
  assert.equal(S.marskramer.buidel, IN.buidel + 8);
});

test('kopen lukt niet zonder goud, als zijn voorraad op is, of als hij er niet is', () => {
  const S = maakS();
  assert.equal(T.koopVanMarskramer(S, 'zout', 1).gelukt, false, 'hij is er nog niet');
  laatKomen(S);
  assert.equal(T.koopVanMarskramer(S, 'zout', 1).gelukt, false, 'geen goud');
  T.zetVoorraad(S, 'goud', 1000);
  T.koopVanMarskramer(S, 'zout', 999);
  const r = T.koopVanMarskramer(S, 'zout', 1);
  assert.equal(r.gelukt, false);
  assert.match(r.reden, /op/);
});

// ── Verkopen ──

test('verkopen geeft goud, en hoe meer van hetzelfde, hoe minder hij ervoor geeft', () => {
  const S = maakS();
  laatKomen(S);
  T.zetVoorraad(S, 'graan', 200);
  const eerste = T.marskramerBod(S, 'graan', 10, false);
  assert.ok(Math.abs(eerste - T.MARSKRAMER_KOOPT.graan.prijs * 10 * (1 - (IN.daling * 4.5) / 10)) < 1e-9);
  const r = T.verkoopAanMarskramer(S, 'graan', 10, false);
  assert.equal(r.gelukt, true);
  assert.ok(Math.abs(S.voorraad.goud - eerste) < 1e-9);
  const tweede = T.marskramerBod(S, 'graan', 10, false);
  assert.ok(tweede < eerste, 'de tweede zak brengt minder op');
});

test('zijn prijs zakt niet onder de bodem', () => {
  const S = maakS();
  laatKomen(S);
  S.marskramer.gekocht.graan = 10000;
  assert.ok(Math.abs(T.marskramerBod(S, 'graan', 1, false) - T.MARSKRAMER_KOOPT.graan.prijs * IN.bodem) < 1e-9);
});

test('zijn buidel is niet bodemloos: hij koopt niet meer dan hij kan betalen', () => {
  const S = maakS();
  laatKomen(S);
  T.zetVoorraad(S, 'wol', 1000);
  const r = T.verkoopAanMarskramer(S, 'wol', 1000, false);
  assert.equal(r.gelukt, true);
  assert.ok(r.aantal < 1000);
  assert.ok(S.marskramer.buidel >= 0);
  assert.ok(S.voorraad.goud <= IN.buidel + 1e-9);
  assert.equal(T.verkoopAanMarskramer(S, 'wol', 50, false).gelukt, false, 'zijn buidel is nu leeg');
});

test('wat hij niet koopt of wat je niet hebt, kun je niet verkopen', () => {
  const S = maakS();
  laatKomen(S);
  T.zetVoorraad(S, 'goud', 50);
  assert.equal(T.verkoopAanMarskramer(S, 'goud', 5, false).gelukt, false);
  assert.equal(T.verkoopAanMarskramer(S, 'wol', 5, false).gelukt, false);
});

// ── Heler ──

test('stil verkopen: voor minder, en het staat apart in het boek', () => {
  const S = maakS();
  laatKomen(S);
  T.zetVoorraad(S, 'wol', 4);
  const open = T.marskramerBod(S, 'wol', 2, false);
  const stil = T.marskramerBod(S, 'wol', 2, true);
  assert.ok(Math.abs(stil - open * IN.stilFactor) < 1e-9);
  T.verkoopAanMarskramer(S, 'wol', 2, true);
  const regel = S.handel.boek[S.handel.boek.length - 1];
  assert.equal(regel.stil, true);
  assert.equal(regel.aantal, -2);
  const totaal = T.handelTotaal(S);
  assert.ok(Math.abs(totaal.stil - stil) < 1e-9);
  assert.equal(totaal.open, 0);
});

// ── IJzer en de smidse ──

test('zonder ijzer valt de smidse stil; met ijzer maakt hij gereedschap', () => {
  const S = maakS(4);
  S.gebouwen.push({ soort: 'smidse', x: 0, y: 0, klaar: true, voortgang: 1, handen: 0 });
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.gereedschap || 0, 0);
  assert.equal(S.gebouwen[0].gebrek, 'ijzer');
  T.zetVoorraad(S, 'ijzer', 5);
  T.tikGebouwenDag(S, 2);
  assert.ok(S.voorraad.gereedschap > 0);
  assert.ok(S.voorraad.ijzer < 5);
  assert.equal(S.gebouwen[0].gebrek, null);
});

test('met te weinig ijzer werkt de smidse naar rato van wat er is', () => {
  const S = maakS(4);
  S.gebouwen.push({ soort: 'smidse', x: 0, y: 0, klaar: true, voortgang: 1, handen: 0 });
  T.zetVoorraad(S, 'ijzer', 0.5);
  T.tikGebouwenDag(S, 1);
  assert.ok(S.voorraad.gereedschap > 0 && S.voorraad.gereedschap < T.GEBOUWEN.smidse.maakt.uit.gereedschap);
  assert.ok(S.voorraad.ijzer < 1e-9, 'al het ijzer is op');
});

// ── Zout ──

test('in de winter tellen vis en vlees alleen mee met zout, en gaat er zout op', () => {
  const S = maakS(20);
  T.zetVoorraad(S, 'graan', 1000);
  T.zetVoorraad(S, 'vis', 50);
  const zonder = T.berekenTevredenheid(S, WINTERDAG);
  assert.equal(zonder.extraSoorten.includes('vis'), false);
  assert.ok(zonder.mist.includes('zout voor vis en vlees'));
  T.zetVoorraad(S, 'zout', 10);
  const met = T.berekenTevredenheid(S, WINTERDAG);
  assert.equal(met.extraSoorten.includes('vis'), true);
  assert.ok(met.tevredenheid > zonder.tevredenheid);
  S.behoeften = T.nieuweBehoeften();
  T.tikBehoeftenDag(S, WINTERDAG);
  assert.ok(S.voorraad.zout < 10);
});

test('buiten de winter blijven vis en vlees ook zonder zout goed', () => {
  const S = maakS(20);
  T.zetVoorraad(S, 'graan', 1000);
  T.zetVoorraad(S, 'vis', 50);
  assert.equal(T.berekenTevredenheid(S, 30).extraSoorten.includes('vis'), true);
});

// ── Het poppetje ──

test('T.werkMarskramerBij: hij komt de weg op, loopt naar de brink, en verdwijnt weer als hij gaat', () => {
  const S = maakS();
  const w = S.wereld;
  w.overgangen.push({ x: 29, y: 10, naar: 'wereld' });
  T.VOORWERPEN = T.VOORWERPEN || {};
  if (!T.VOORWERPEN.put) T.VOORWERPEN.put = { blokkeert: true };
  w.voorwerpen.push({ soort: 'put', x: 10, y: 10 });
  laatKomen(S);
  T.werkMarskramerBij(S);
  const e = S.marskramer.pop;
  assert.ok(e, 'hij staat in de wereld');
  assert.equal(w.wezens.includes(e), true);
  assert.equal(e.handelaar, true);
  assert.ok(T.afstand({ x: e.tx, y: e.ty }, { x: 29, y: 10 }) <= 1, 'hij begint bij de weg');
  T.werkMarskramerBij(S);
  assert.ok(e.pad.length > 0, 'hij loopt naar de brink');
  // Aangekomen: dan scharrelt hij daar wat rond.
  e.tx = e.x = e.doel.x;
  e.ty = e.y = e.doel.y;
  e.pad = [];
  T.werkMarskramerBij(S);
  assert.equal(e.dwaalt, true);
  // Hij gaat: terug naar de weg, en daar verdwijnt hij.
  S.marskramer.aanwezig = false;
  T.werkMarskramerBij(S);
  assert.ok(e.pad.length > 0, 'hij loopt terug');
  e.tx = e.x = 29;
  e.ty = e.y = 10;
  e.pad = [];
  T.werkMarskramerBij(S);
  assert.equal(w.wezens.includes(e), false);
  assert.equal(S.marskramer, null);
});
