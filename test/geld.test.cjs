// Het geld (werklijst vraag 141, stap 1; js/geld.js): de munten, de kas van het dorp, de beurs van de schout met zijn
// loon, en omkopen uit eigen zak.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => undefined });
const IN = T.GELD_INSTELLINGEN;

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

function dorp() {
  return { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 10, kalender: { dag: 0, snelheid: 1 }, wereld: { wezens: [], voorwerpen: [] } };
}

test('een bedrag in goud staat als goud, zilver en koper: 1 goud is 10 zilver is 100 koper', () => {
  assert.deepEqual(T.muntenVan(2.35), { goud: 2, zilver: 3, koper: 5 });
  assert.equal(T.muntTekst(2.35), '2 goud, 3 zilver en 5 koper');
  assert.equal(T.muntTekst(2.35, true), '2g 3z 5k');
  assert.equal(T.muntTekst(0.07), '7 koper');
  assert.equal(T.muntTekst(4), '4 goud');
  assert.equal(T.muntTekst(0, true), '0');
  assert.equal(T.muntTekst(0.999), '9 zilver en 9 koper', 'naar beneden, op een koper');
});

test('de schout krijgt zijn loon uit de kas op de eerste van de maand, één keer, en zoveel als erin zit', () => {
  const D = dorp();
  T.zetVoorraad(D, 'goud', 10);
  assert.equal(T.beursVan(D), IN.beginBeurs);
  const eerste = dagVan('grasmaand', 1);
  T.tikGeldDag(D, eerste);
  assert.equal(T.kasVan(D), 10 - IN.loon);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon);
  T.tikGeldDag(D, eerste);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon, 'één keer per maand');
  T.tikGeldDag(D, eerste + 5);
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon, 'alleen op de eerste');
  assert.ok(D.dagboek.regels.some((r) => r.soort === 'geld' && /loon/.test(r.tekst)), 'het rapport zegt het');
  // Een lege kas betaalt niets.
  T.zetVoorraad(D, 'goud', 0);
  T.tikGeldDag(D, dagVan('bloeimaand', 1));
  assert.equal(T.beursVan(D), IN.beginBeurs + IN.loon);
});

test('de inner omkopen gaat uit eigen zak: de kas blijft, en wat niet in je beurs zit, geef je niet', () => {
  const D = dorp();
  T.zetVoorraad(D, 'goud', 50);
  D.geld = { beurs: 12, loonGehad: null };
  D.inner = { bezoek: { tot: 1e9 }, geschenken: 0 };
  D.lot = { zaad: 2 };
  assert.ok(T.koopInnerOm(D, 10).kan);
  assert.equal(T.beursVan(D), 2);
  assert.equal(T.kasVan(D), 50, 'de kas van het dorp blijft');
  assert.equal(T.koopInnerOm(D, 5).kan, false, 'vijf zit er niet meer in');
  // In zijn gesprek staat het geschenk pas als je het in je beurs hebt.
  assert.equal(T.questVoorwaarde(D, D, { beurs: 5 }), false);
  D.geld.beurs = 5;
  assert.equal(T.questVoorwaarde(D, D, { beurs: 5 }), true);
});

test('met de spelregel "Geld" op "Alles uit de kas" is er geen beurs en geen loon, en gaat het omkopen uit de kas', () => {
  T.zetOptie('geld', 'dorp');
  try {
    const D = dorp();
    T.zetVoorraad(D, 'goud', 20);
    assert.equal(T.beursVan(D), 20, 'de beurs is de kas');
    T.tikGeldDag(D, dagVan('grasmaand', 1));
    assert.equal(T.kasVan(D), 20, 'geen loon');
    D.inner = { bezoek: { tot: 1e9 }, geschenken: 0 };
    D.lot = { zaad: 2 };
    assert.ok(T.koopInnerOm(D, 5).kan);
    assert.equal(T.kasVan(D), 15);
  } finally {
    T.optiesTerug();
  }
});
