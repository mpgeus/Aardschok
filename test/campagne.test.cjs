// De campagne (vraag 187, stap 2b; js/campagne.js, levels/campagne.js; ontwerp/scenario.md, 6): één land met hoofdstukken.
// Een hoofdstuk begint op het eiland van de campagne, op zijn plek, met zijn rand; het eerste is open, een volgend als het
// hoofdstuk ervoor af is, en af is wat gewonnen is (betaald op Sint-Maarten, of een scenario dat gewonnen eindigt). Wat af
// is, blijft op deze computer.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Een opslag zoals die van de browser, alleen voor zolang `doe` loopt (T.gebruikOpslagPlek, js/opslaan.js).
function metOpslag(doe) {
  const plek = new Map();
  T.gebruikOpslagPlek({ getItem: (k) => (plek.has(k) ? plek.get(k) : null), setItem: (k, w) => plek.set(k, String(w)) });
  try {
    return doe(plek);
  } finally {
    T.gebruikOpslagPlek(null);
  }
}
// Een campagne met een tweede hoofdstuk erbij, alleen zolang `doe` loopt.
function metTweeHoofdstukken(doe) {
  const lijst = T.CAMPAGNE.hoofdstukken;
  lijst.push({ id: 'proef', titel: 'A test', level: 'demojaar', plek: lijst[0].plek, rand: { b: 4, h: 4 } });
  try {
    return doe();
  } finally {
    lijst.pop();
  }
}

test('de campagne komt door de keuring, en elke fout heeft een zin', () => {
  assert.deepEqual(T.keurCampagne(), []);
  const heeft = (lijst, stuk) => assert.ok(lijst.some((z) => z.includes(stuk)), `${stuk} in ${JSON.stringify(lijst)}`);
  heeft(T.keurCampagne({ hoofdstukken: [] }), 'een eiland met een zaad');
  heeft(T.keurCampagne({ eiland: { zaad: 5 }, hoofdstukken: [] }), 'geen hoofdstukken');
  const een = { id: 'a', titel: 'A', level: 'demojaar', plek: 'Millcombe', rand: { b: 5, h: 5 } };
  heeft(T.keurCampagne({ eiland: { zaad: 5 }, hoofdstukken: [een, een] }), 'hoofdstuk a staat er twee keer');
  heeft(T.keurCampagne({ eiland: { zaad: 5 }, hoofdstukken: [{ ...een, level: 'nergens' }] }), 'het level nergens is er niet');
  heeft(T.keurCampagne({ eiland: { zaad: 5 }, hoofdstukken: [{ ...een, titel: '' }] }), 'heeft geen titel');
  heeft(T.keurCampagne({ eiland: { zaad: 5 }, hoofdstukken: [{ ...een, rand: { b: 3, h: 5 } }] }), 'hoofdstuk a: een rand is minstens');
});

test('elk hoofdstuk begint op het eiland van de campagne, op zijn plek, met zijn rand, als hoofdstuk en niet als demo', () => {
  for (const h of T.CAMPAGNE.hoofdstukken) {
    const S = T.proefdorp.begin(T.proefdorp.zaad, T.hoofdstukLevel(h.id));
    assert.equal(S.wereld.eiland.zaad, T.CAMPAGNE.eiland.zaad, h.id);
    assert.equal(S.dorp.plek.naam, h.plek, h.id);
    assert.deepEqual(S.wereld.rand, T.randOm(S.dorp.plek.vak, h.rand.b, h.rand.h), h.id);
    assert.equal(S.scenario.hoofdstuk, h.id);
    assert.equal(S.scenario.demo, false, 'als hoofdstuk zegt het eindscherm niet dat de demo eindigt');
    assert.deepEqual(S.scenario.triggers.map((t) => t.id), T.LEVELS[h.level].triggers.map((t) => t.id));
  }
  // Het level zelf blijft zoals het was: het hoofdstuk legt er alleen zijn eiland, plek en rand over.
  assert.equal(T.LEVELS.demojaar.eiland, undefined);
  assert.equal(T.LEVELS.demojaar.demo, undefined);
});

test('het eerste hoofdstuk is open, een volgend als het hoofdstuk ervoor af is; af is wat gewonnen is', () =>
  metOpslag(() =>
    metTweeHoofdstukken(() => {
      const [eerste, tweede] = T.CAMPAGNE.hoofdstukken;
      assert.deepEqual(T.campagneAf(), {});
      assert.equal(T.hoofdstukOpen(eerste.id), true);
      assert.equal(T.hoofdstukOpen(tweede.id), false);
      // Verloren (zijn leger): niets af.
      const S = { scenario: { hoofdstuk: eerste.id } };
      assert.deepEqual(T.eindVanHoofdstuk(S, { einde: { reden: 'leger' } }), { hoofdstuk: eerste, gewonnen: false, volgende: null });
      assert.equal(T.hoofdstukOpen(tweede.id), false);
      // Nog niet uit, of geen hoofdstuk: niets.
      assert.equal(T.eindVanHoofdstuk(S, { einde: null }), null);
      assert.equal(T.eindVanHoofdstuk({ scenario: { hoofdstuk: null } }, { einde: { reden: 'betaald' } }), null);
      // Gewonnen (betaald op Sint-Maarten): af, en het volgende gaat open.
      assert.deepEqual(T.eindVanHoofdstuk(S, { einde: { reden: 'betaald' } }), { hoofdstuk: eerste, gewonnen: true, volgende: tweede });
      assert.deepEqual(T.campagneAf(), { [eerste.id]: true });
      assert.equal(T.hoofdstukOpen(tweede.id), true);
      // Een scenario dat gewonnen eindigt, ook; het laatste heeft geen volgende.
      const r = T.eindVanHoofdstuk({ scenario: { hoofdstuk: tweede.id } }, { einde: { reden: 'scenario', gewonnen: true } });
      assert.equal(r.gewonnen, true);
      assert.equal(r.volgende, null);
      assert.deepEqual(T.campagneAf(), { [eerste.id]: true, [tweede.id]: true });
    })));

test('wat gewonnen is: betaald, of een scenario dat gewonnen eindigt; de rest is verloren', () => {
  assert.equal(T.spelGewonnen({ einde: { reden: 'betaald' } }), true);
  assert.equal(T.spelGewonnen({ einde: { reden: 'scenario', gewonnen: true } }), true);
  for (const reden of ['leger', 'leeg', 'verjaagd', 'ambt']) assert.equal(T.spelGewonnen({ einde: { reden } }), false, reden);
  assert.equal(T.spelGewonnen({ einde: { reden: 'scenario', gewonnen: false } }), false);
  assert.equal(T.spelGewonnen({ einde: null }), false);
});

test('een opslag die niets bewaart of iets anders bevat, geeft gewoon niets af', () => {
  T.gebruikOpslagPlek({ getItem: () => 'geen json', setItem: () => { throw new Error('vol'); } });
  try {
    assert.deepEqual(T.campagneAf(), {});
    const r = T.eindVanHoofdstuk({ scenario: { hoofdstuk: T.CAMPAGNE.hoofdstukken[0].id } }, { einde: { reden: 'betaald' } });
    assert.equal(r.gewonnen, true, 'het eindscherm zegt het nog steeds');
  } finally {
    T.gebruikOpslagPlek(null);
  }
});
