// De bouwers als poppetjes (js/bouwen.js, T.werkBouwersBij) mét het pad (js/pad.js): ze komen van
// huis naar de bouwplaats lopen, en gaan weer naar huis als het werk af is. Een eigen bestand, want
// test/bouwen.test.cjs laadt js/pad.js bewust niet (daar staan ze meteen op de bouwplaats).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/pad.js');
require('../js/gebouwen.js');
require('../js/bouwen.js');
const T = globalThis.Toren;

function maakS() {
  const tegels = [];
  for (let y = 0; y < 30; y++) tegels.push(new Array(30).fill('vloer'));
  return {
    wereld: { b: 30, h: 30, tegels, voorwerpen: [], wezens: [], deuren: [] },
    voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 4, woonruimte: 0, kalender: { dag: 0 }, tijd: 0,
  };
}

// Laat iedereen die een pad heeft er in één keer het einde van bereiken (js/anim.js doet dat stap
// voor stap; dat hoort niet bij deze toets).
function laatAankomen(S) {
  for (const e of S.wereld.wezens) {
    if (!e.pad.length) continue;
    const eind = e.pad[e.pad.length - 1];
    e.x = e.tx = eind.x;
    e.y = e.ty = eind.y;
    e.pad = [];
  }
}

test('bouwers komen uit de richting van het dichtstbijzijnde huis aanlopen, en gaan weer die kant op', () => {
  const S = maakS();
  S.gebouwen.push({ soort: 'huis', x: 2, y: 2, klaar: true, voortgang: 1, handen: 0 }); // daar wonen ze
  T.zetVoorraad(S, 'hout', 99);
  const b = T.plaatsGebouw(S, 'hut', 18, 18).instantie;
  T.tikBouwDag(S, 1, S.bevolking);
  T.werkBouwersBij(S);
  const bouwers = S.wereld.wezens.filter((e) => e.soort === 'bouwer');
  assert.equal(bouwers.length, T.ploegVan('hut'));
  // Hij loopt het laatste stuk van zijn weg (T.BOUWEN_INSTELLINGEN.aanloop tegels), uit de richting
  // van het huis: de hele weg zou in echte seconden langer duren dan de bouw zelf.
  const naarHuis = (p) => Math.abs(p.x - 4) + Math.abs(p.y - 4);
  for (const e of bouwers) {
    assert.ok(e.pad.length > 0 && e.pad.length <= T.BOUWEN_INSTELLINGEN.aanloop, `pad van ${e.pad.length}`);
    const doel = e.pad[e.pad.length - 1];
    assert.ok(naarHuis({ x: e.tx, y: e.ty }) < naarHuis(doel), 'hij komt uit de richting van het huis');
  }
  laatAankomen(S);
  T.werkBouwersBij(S);
  for (const e of bouwers) assert.ok(T.naarBouwplaats(e), 'aangekomen staat hij naast de muur');

  // Het werk is af: ze lopen naar huis, en zijn weg zodra ze er zijn.
  let dag = 1;
  while (!b.klaar && dag < 50) T.tikBouwDag(S, ++dag, S.bevolking);
  T.werkBouwersBij(S);
  for (const e of bouwers) {
    assert.ok(e.pad.length > 0, 'hij loopt naar huis');
    assert.equal(e.bouwVoet, null, 'en timmert niet meer');
  }
  assert.equal(S.wereld.wezens.length, bouwers.length, 'onderweg zijn ze er nog');
  laatAankomen(S);
  T.werkBouwersBij(S);
  assert.equal(S.wereld.wezens.length, 0);
});

test('zonder huis in de buurt staan de bouwers meteen op de bouwplaats', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 99);
  T.plaatsGebouw(S, 'hut', 18, 18);
  T.tikBouwDag(S, 1, S.bevolking);
  T.werkBouwersBij(S);
  for (const e of S.wereld.wezens) {
    assert.equal(e.pad.length, 0);
    assert.ok(T.naarBouwplaats(e));
  }
});
