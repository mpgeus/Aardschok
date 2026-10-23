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
  // Wat het dorp die dag miste (D.behoeften.mist, js/behoeften.js).
  const nacht = (dag, regels, mist = []) => {
    D.dagboek = { regels };
    D.behoeften.mist = mist;
    T.tikEindeDag(D, dag);
  };
  nacht(begin + 1, [{ soort: 'mensen', verschil: 4, reden: 'groei' }, { soort: 'huis' }], ['ale', 'a well']);
  nacht(begin + 2, [{ soort: 'mensen', verschil: -1, reden: 'vertrek' }, { soort: 'mensen', verschil: -2, reden: 'winter' }], ['ale']);
  nacht(begin + 3, [{ soort: 'mensen', verschil: -1, reden: 'gesneuveld' }], ['ale']);
  assert.deepEqual(
    { kwamen: D.jaarboek.kwamen, stierven: D.jaarboek.stierven, weg: D.jaarboek.weg, doorgegroeid: D.jaarboek.doorgegroeid },
    { kwamen: 4, stierven: 3, weg: 1, doorgegroeid: 1 },
  );
  // (Het proefdorp miste al een kerk op de dagen ervoor: die telt ook.)
  assert.deepEqual([D.jaarboek.gemist.ale, D.jaarboek.gemist['a well']], [3, 1]);
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
  assert.ok(regels.some((r) => /^The most missed was ale, for 3 days\.$/.test(r)), regels.join(' | '));
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

// De punten (werklijst R, vraag 186; Marcel, 20 okt: "hoe meer je hebt verzamelt en in je stores hebt, hoe hoger de
// punten", en zijn keuzes 5a3 en 5b1): wat het dorp dit jaar verzamelde, en wat er in de opslag ligt, in goud, geteld als
// de heer op Sint-Maarten komt.
test('een waar is waard wat de marskramer ervoor geeft, en anders wat in de werkbank staat', () => {
  assert.equal(T.waardeVan('goud'), 1);
  const k = T.HANDEL_INSTELLINGEN.koopt.graan;
  assert.equal(T.waardeVan('graan'), k.prijs.reduce((a, b) => a + b, 0) / k.prijs.length / k.per);
  assert.equal(T.waardeVan('planken'), T.EINDE_INSTELLINGEN.waarde.planken);
  assert.equal(T.waardeVan('mest'), 0, 'wat nergens staat, telt niet');
});

test('verzameld telt wat het dorp maakt, oogst en rooit, niet wat het koopt of krijgt', () => {
  const S = gehucht();
  const D = S.dorp;
  D.jaarboek = null;
  const zagerij = D.gebouwen.find((g) => g.klaar && g.soort !== 'stapel');
  T.opStapel(D, zagerij, 'planken', 4);
  T.opStapel(D, zagerij, 'hout', 3, { gerooid: true });
  T.wijzigVoorraad(D, 'ijzer', 5); // gekocht, of uit de huifkar
  assert.deepEqual(D.jaarboek.verzameld, { planken: 4, hout: 3 });
  T.slacht(D, [], 0);
  T.telVerzameld(D, 'wol', 0);
  assert.deepEqual(D.jaarboek.verzameld, { planken: 4, hout: 3 }, 'niets is niets');
});

test('de punten: wat verzameld werd en wat in de opslag ligt, in goud', () => {
  const S = gehucht();
  const D = S.dorp;
  D.jaarboek = { begin: 0, mensen: 17, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, geoogst: 0, gemist: {}, verzameld: { graan: 100, planken: 10 } };
  D.voorraad = { goud: 12, graan: 50, hout: 40, mest: 30 };
  const v = T.waardeVan;
  const verzameld = Math.round(100 * v('graan') + 10 * v('planken'));
  const ligt = Math.round(12 + 50 * v('graan') + 40 * v('hout'));
  assert.deepEqual(T.puntenVan(D), { verzameld, ligt, totaal: verzameld + ligt });
});

test('in de demo tellen de punten als de heer komt, vóór de tiende, en de beste blijft op deze computer', () => {
  const plek = new Map();
  T.gebruikOpslagPlek({ getItem: (k) => (plek.has(k) ? plek.get(k) : null), setItem: (k, w) => plek.set(k, String(w)) });
  const was = T.DEMO_INSTELLINGEN.aan;
  try {
    const S = gehucht();
    T.heerKomt(S.dorp, 250);
    assert.equal(S.dorp.punten, undefined, 'in het volle spel niet');
    T.DEMO_INSTELLINGEN.aan = true;
    const S1 = gehucht();
    S1.dorp.heer = null;
    T.heerKomt(S1.dorp, 250);
    const p1 = S1.dorp.punten;
    assert.ok(p1 && p1.totaal > 0, JSON.stringify(p1));
    assert.equal(p1.totaal, T.puntenVan(S1.dorp).totaal, 'geteld met wat er lag toen hij kwam');
    assert.equal(p1.beste, null, 'nog geen beste');
    assert.equal(T.bestePunten(), p1.totaal);
    // Een slechter jaar: de beste blijft.
    const S2 = gehucht();
    T.zetVoorraad(S2.dorp, 'goud', 0);
    T.telPunten(S2.dorp);
    assert.ok(S2.dorp.punten.totaal < p1.totaal);
    assert.equal(S2.dorp.punten.beste, p1.totaal);
    assert.equal(T.bestePunten(), p1.totaal);
    // Een beter jaar: dat is de nieuwe beste.
    const S3 = gehucht();
    T.wijzigVoorraad(S3.dorp, 'goud', 50);
    T.telPunten(S3.dorp);
    assert.equal(T.bestePunten(), S3.dorp.punten.totaal);
    assert.ok(S3.dorp.punten.totaal > S3.dorp.punten.beste);
  } finally {
    T.DEMO_INSTELLINGEN.aan = was;
    T.gebruikOpslagPlek(null);
  }
});
