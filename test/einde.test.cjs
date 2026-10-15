// Het eind van het spel, en het jaar in het kort (js/einde.js; werklijst vraag 101, Marcel, 3 okt: "101 ja"): verliezen
// als er minder dan 10 mensen over zijn, en op 1 lentemaand het jaarverslag. Het winnen (een jaar lang iedereen super
// gelukkig) is op 11 okt weggehaald (snoeironde, vraag 153); het nieuwe doel van de demo komt er nog.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
const getoond = [];
T.ui = new Proxy({}, {
  get: (_, naam) => {
    if (naam === 'bericht') return (t) => berichten.push(t);
    if (['toonEinde', 'toonBrief'].includes(naam)) return (D, soort) => getoond.push(soort ? `${naam}:${soort}` : naam);
    return () => {};
  },
});

function dagVan(maand, d, jaar = 0) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag + jaar * 360;
}

// Het proefdorp (test/grond.cjs): zeventien mensen op dag 2, stil.
function gehucht() {
  const S = proefDorp(T).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  T.S = S;
  return S;
}

test('minder dan tien mensen over, en het spel is uit; een ander dorp verliest nog niet', () => {
  const S = gehucht();
  const D = S.dorp;
  getoond.length = 0;
  D.bevolking = T.EINDE_INSTELLINGEN.minstensOver;
  T.tikEindeDag(D, 40);
  assert.ok(!D.einde, 'met tien gaat het nog');
  D.bevolking = T.EINDE_INSTELLINGEN.minstensOver - 1;
  T.tikEindeDag(D, 41);
  assert.deepEqual(D.einde, { reden: 'leeg', dag: 41 });
  assert.ok(getoond.includes('toonEinde'));
  assert.ok(S.kalender.stil.includes('einde'), 'de tijd staat stil');

  const ander = gehucht().dorp;
  ander.ander = true;
  ander.bevolking = 3;
  T.tikEindeDag(ander, 41);
  assert.ok(!ander.einde);
});

test('het jaarboek telt het jaar, en op 1 lentemaand komt het jaarverslag', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetDorpsnaam(D, 'Kleiwerd');
  const begin = Math.floor(S.kalender.dag);
  getoond.length = 0;
  const nacht = (dag, regels, gemist = []) => {
    D.dagboek = { regels };
    D.behoeften.gemist = gemist;
    T.tikEindeDag(D, dag);
  };
  nacht(begin + 1, [{ soort: 'mensen', verschil: 4, reden: 'groei' }, { soort: 'huis' }], [{ id: 'bier' }, { id: 'put' }]);
  nacht(begin + 2, [{ soort: 'mensen', verschil: -1, reden: 'vertrek' }, { soort: 'mensen', verschil: -2, reden: 'winter' }], [{ id: 'bier' }]);
  nacht(begin + 3, [{ soort: 'mensen', verschil: -1, reden: 'gesneuveld' }]);
  assert.deepEqual(
    { kwamen: D.jaarboek.kwamen, stierven: D.jaarboek.stierven, weg: D.jaarboek.weg, doorgegroeid: D.jaarboek.doorgegroeid, gemist: D.jaarboek.gemist },
    { kwamen: 4, stierven: 3, weg: 1, doorgegroeid: 1, gemist: { bier: 2, put: 1 } },
  );
  T.telOogstInJaarboek(D, 300.2); // de boeren maaien tegel voor tegel (js/akkers.js)
  T.telOogstInJaarboek(D, 100.1);
  const begonMet = D.jaarboek.mensen; // de mensen van het proefdorp, aan het begin van het jaar
  D.bevolking = 30;

  const lente = dagVan('lentemaand', 1, 1);
  assert.equal(T.datumVanDag(lente).tekst, '1 March 1324');
  nacht(lente - 1, []);
  assert.deepEqual(getoond, [], 'de dag ervoor nog niet');
  nacht(lente, []);
  assert.deepEqual(getoond, ['toonBrief:jaarverslag']);
  const regels = D.jaarverslag.regels;
  assert.equal(D.jaarverslag.dag, lente);
  assert.equal(regels[0], `In the year 1323 Kleiwerd grew from ${begonMet} to 30 people.`);
  assert.equal(begonMet, S.dorp.bewoners.mensen.length, 'het jaarboek begon met wie er woont');
  assert.ok(regels.includes('4 people joined, 3 died and 1 left.'), regels.join(' | '));
  assert.ok(regels.includes('The harvest brought 400 grain.'));
  assert.ok(regels.includes('One house grew larger.'));
  assert.ok(regels.some((r) => /^The most missed was ale, for 2 days\.$/.test(r)), regels.join(' | '));
  assert.ok(!regels.some((r) => /iedereen alles/.test(r)), 'het winnen is weg: ook de regel over de dagen waarop iedereen alles had');
  assert.equal(D.jaarboek.begin, lente, 'en het nieuwe jaar begint een nieuw jaarboek');
  assert.equal(D.jaarboek.kwamen, 0);
});

test('het jaarboek wordt bewaard en geladen', () => {
  const S = gehucht();
  const D = S.dorp;
  T.tikEindeDag(D, 5);
  T.tikEindeDag(D, 6);
  const terug = T.leesSpel(T.bewaarSpel(S));
  assert.ok(terug.gelukt);
  assert.deepEqual(terug.staat.dorp.jaarboek, D.jaarboek);
  assert.equal(terug.staat.dorp.eind, undefined, 'de teller van het winnen bestaat niet meer');
});

test('een bewaard spel met de oude velden van het winnen geeft geen fout', () => {
  const S = gehucht();
  const D = S.dorp;
  // Zoals een spel van vóór 11 okt: de teller van het winnen, en een jaarboek met de dagen dat iedereen alles had.
  D.eind = { dagen: 40, beste: 40, gewonnen: null, mis: 2 };
  D.jaarboek = { begin: 0, mensen: 26, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, gelukkig: 12, geoogst: 0, gemist: {} };
  const terug = T.leesSpel(T.bewaarSpel(S));
  assert.ok(terug.gelukt);
  const lente = dagVan('lentemaand', 1, 1);
  const D2 = terug.staat.dorp;
  D2.bevolking = 30;
  assert.doesNotThrow(() => {
    T.tikEindeDag(D2, lente - 1);
    T.tikEindeDag(D2, lente);
  });
  assert.ok(D2.jaarverslag.regels.length > 0);
  assert.ok(!D2.jaarverslag.regels.some((r) => /iedereen alles/.test(r)));
  // En een bewaarde spelregel "eind" bestaat niet meer: stil negeren (js/opties.js).
  assert.doesNotThrow(() => T.pasOptiesToe({ keuzes: { eind: 'jaar' }, getallen: { 'EINDE_INSTELLINGEN.magMissen': 0 } }));
  assert.equal(T.OPTIES.find((o) => o.id === 'eind'), undefined);
  assert.deepEqual(T.OPTIES_NU.keuzes, {});
  assert.deepEqual(T.OPTIES_NU.getallen, {});
  T.optiesTerug();
});
