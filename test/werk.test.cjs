// Het werk verdelen (js/werk.js; Marcel, 4 nov: "1. A 2. A 3. Prima, 1 houthakker is bijvoorbeeld max 2 man, en een 2e
// houthakkerij is +2 max"): jij kiest per soort werkplaats hoeveel er werken, tot het maximum van zijn gebouwen samen; een
// nieuw gebouw begint met 1 man, en wie niet werkt, draagt en bouwt mee.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, dagen, bouwAf } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

function dorp() {
  const r = proefDorp(T);
  Object.assign(r.S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  T.S = r.S;
  return { ...r, dag: Math.floor(r.S.kalender.dag) };
}

// Een houthakker bij het vuur, af, en een nacht verder (de nacht zet hem op klaar, T.komtKlaar).
function houthakker(S, D, dag) {
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  return g;
}

// Een opdracht zoals het paneel hem geeft, en een tik zodat hij ingaat.
function zet(S, D, gebouw, n) {
  T.geefOpdracht(S, { soort: 'inzet', dorp: S.dorpen.indexOf(D), gebouw, n });
  T.wereldTik(S);
}

test('een houthakker vraagt hooguit 2 man, en een tweede er 2 bij (Marcel, 4 nov: "3. Prima")', () => {
  assert.equal(T.GEBOUWEN.houthakker.handen, 2);
  assert.equal(T.GEBOUWEN.steengroeve.handen, 4);
  const { S, D, dag } = dorp();
  houthakker(S, D, dag);
  assert.equal(T.werkMax(D, 'houthakker'), 2);
  houthakker(S, D, dag + 1);
  assert.equal(T.werkMax(D, 'houthakker'), 4);
});

test('een nieuw gebouw begint met 1 man; meer kies jij (Marcel, 4 nov: "2. A")', () => {
  const { S, D, dag } = dorp();
  const g = houthakker(S, D, dag);
  assert.equal(T.werkInzet(D, 'houthakker'), 1);
  assert.equal(g.handen, 1);
  const h = houthakker(S, D, dag + 1);
  assert.equal(T.werkInzet(D, 'houthakker'), 2, 'de tweede brengt er 1 bij');
  assert.deepEqual([g.handen, h.handen], [1, 1]);
});

test('de opdracht inzet zet het aantal, tussen 0 en het maximum, en de handen gaan meteen', () => {
  const { S, D, dag } = dorp();
  const g = houthakker(S, D, dag);
  const voor = T.werkTelling(D);
  zet(S, D, 'houthakker', 9);
  assert.equal(T.werkInzet(D, 'houthakker'), 2, 'nooit meer dan het maximum');
  assert.equal(g.handen, 2);
  const na = T.werkTelling(D);
  assert.equal(na.werken, voor.werken + 1);
  assert.equal(na.vrij, voor.vrij - 1, 'wie erbij gaat werken, draagt en bouwt niet meer mee');
  zet(S, D, 'houthakker', -3);
  assert.equal(T.werkInzet(D, 'houthakker'), 0, 'geen ondergrens dan 0');
  assert.equal(g.handen, 0);
  assert.equal(T.werkTelling(D).vrij, voor.vrij + 1);
});

test('de handen gaan om de beurt naar de gebouwen van een soort, niet eerst de een vol', () => {
  const { S, D, dag } = dorp();
  const g = houthakker(S, D, dag);
  const h = houthakker(S, D, dag + 1);
  zet(S, D, 'houthakker', 3);
  assert.deepEqual([g.handen, h.handen], [2, 1], 'het eerst gebouwde eerst');
});

test('een spel van vóór 4 nov (een dorp zonder inzet) werkt vol, zoals het toen was', () => {
  const { S, D, dag } = dorp();
  const g = houthakker(S, D, dag);
  delete D.inzet;
  T.verdeelHanden(D);
  assert.equal(T.werkInzet(D, 'houthakker'), 2);
  assert.equal(g.handen, 2);
});

test('het werkpaneel: per soort wat er werkt, wat het per dag maakt, en wat het vol zou maken', () => {
  const { S, D, dag } = dorp();
  houthakker(S, D, dag);
  const rij = T.werkRijen(D).find((r) => r.soort === 'houthakker');
  assert.deepEqual([rij.n, rij.bezet, rij.max], [1, 1, 2]);
  assert.ok(rij.vol.hout > 0, 'vol maakt hij hout');
  assert.ok(Math.abs(rij.perDag.hout - rij.vol.hout / 2) < 1e-9, 'met de helft van de handen de helft');
  zet(S, D, 'houthakker', 0);
  const stil = T.werkRijen(D).find((r) => r.soort === 'houthakker');
  assert.equal(stil.perDag.hout, 0, 'zonder handen niets');
  assert.ok(stil.vol.hout > 0, 'vol zou hij nog steeds hout maken');
  assert.ok(!T.werkRijen(D).some((r) => r.soort === 'hut'), 'alleen wat handen vraagt');
});
