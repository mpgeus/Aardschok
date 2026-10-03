// Twee bazen (js/bazen.js; werklijst vraag 106, Marcel, 3 okt: "106 a b c d ja"): de heer en het dorp kunnen je allebei
// wegsturen. De gunst van de heer en het vertrouwen van het dorp, met een waarschuwing onder de grens, en op 0 ben je
// weg; altijd eerst de waarschuwing. Betrapt op verstoppen: de laatste waarschuwing, of meteen weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
const brieven = [];
const eindes = [];
T.ui = new Proxy({}, {
  get: (_, naam) => {
    if (naam === 'bericht') return (t) => berichten.push(t);
    if (naam === 'toonBrief') return (D, soort) => brieven.push(soort);
    if (naam === 'toonEinde') return (D) => eindes.push(D.einde.reden);
    return () => {};
  },
});

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/verzoeken.test.cjs).
function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  berichten.length = 0;
  brieven.length = 0;
  eindes.length = 0;
  return S;
}
function nacht(S, dag) {
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
const IN = () => T.BAZEN_INSTELLINGEN;

test('de standaard: twee meters, die van 50 beginnen; met de spelregel uit zijn ze er niet', () => {
  const S = gehucht();
  const D = S.dorp;
  assert.deepEqual(T.bazenNu(D), { gunst: 50, vertrouwen: 50 });
  assert.match(T.bazenTekst(D, 'gunst'), /^De gunst van de heer: 50 \(de heer is tevreden\)\..*op 0 ben je je ambt kwijt/);
  assert.match(T.bazenTekst(D, 'vertrouwen'), /^Het vertrouwen van het dorp: 50 .*op 0 jagen ze je weg/);
  T.zetOptie('tweeBazen', 'uit');
  try {
    assert.equal(T.bazenNu(D), null);
    T.wijzigGunst(D, -80, 'niets');
    assert.ok(!D.einde, 'zonder de spelregel stuurt niemand je weg');
  } finally {
    T.optiesTerug();
  }
});

test('de schatting: wat de heer krijgt, beweegt zijn gunst, en het venster zegt het vooraf', () => {
  const S = gehucht();
  const D = S.dorp;
  D.heer = T.nieuweHeer();
  D.heer.bezoek = { staat: true, weg: false, wezens: [], betaald: null };
  const eis = T.eisVanDeHeer(D);
  for (const wat of Object.keys(eis.per)) T.zetVoorraad(D, wat, Math.ceil(eis.per[wat]) + 10);
  const alles = T.gevolgVanBetaling(D, { ...eis.per }, eis);
  assert.equal(alles.gunst.erbij, IN().schatting.goed);
  assert.match(alles.tekst, /Zijn gunst: 50 → 65\./);
  const niets = T.gevolgVanBetaling(D, {}, eis);
  assert.equal(niets.straf, 'schandpaal');
  assert.match(niets.tekst, /Zijn gunst: 50 → 10\. Dan schrijft hij je een waarschuwing\./);
  assert.ok(!niets.ambtKwijt, 'de eerste keer niet: eerst een waarschuwing');
  T.betaalHeer(D, {});
  assert.equal(T.bazenNu(D).gunst, 10);
  assert.deepEqual(brieven, ['waarschuwing'], 'de heer schrijft een waarschuwing');
  assert.match(D.bazen.brief.waarom, /Je betaalde te weinig/);
  assert.ok(!D.einde);
});

test('altijd eerst een waarschuwing: wie er nog geen kreeg, komt niet onder de laatste; daarna wel weg', () => {
  const S = gehucht();
  const D = S.dorp;
  T.wijzigGunst(D, -70, 'een grote tegenvaller');
  assert.equal(T.bazenNu(D).gunst, IN().laatsteWaarschuwing, 'niet op 0: de laatste waarschuwing');
  assert.deepEqual(brieven, ['waarschuwing']);
  assert.ok(!D.einde);
  T.wijzigGunst(D, -10, 'nog een');
  assert.equal(D.einde && D.einde.reden, 'ambt');
  assert.match(D.einde.waarom, /Zijn gunst is op: nog een\./);
  assert.deepEqual(eindes, ['ambt']);
  // Is hij weg, dan verandert er niets meer.
  T.wijzigGunst(D, 50, 'te laat');
  assert.equal(T.bazenNu(D).gunst, 0);
});

test('weer boven de grens, dan kan er later een nieuwe waarschuwing komen', () => {
  const S = gehucht();
  const D = S.dorp;
  T.wijzigGunst(D, -35, 'eens');
  assert.equal(brieven.length, 1);
  T.wijzigGunst(D, -2, 'nog eens');
  assert.equal(brieven.length, 1, 'niet elke keer opnieuw');
  T.wijzigGunst(D, IN().opnieuwBoven + 10, 'het gaat beter');
  T.wijzigGunst(D, -IN().opnieuwBoven - 5, 'weer mis');
  assert.equal(brieven.length, 2);
});

test('betrapt op verstoppen: de laatste waarschuwing, en wie die al had, is weg', () => {
  const S = gehucht();
  const D = S.dorp;
  T.betrapt(D);
  assert.equal(T.bazenNu(D).gunst, IN().laatsteWaarschuwing);
  assert.deepEqual(brieven, ['waarschuwing']);
  assert.ok(!D.einde);
  T.betrapt(D);
  assert.ok(!D.einde, 'twee plekken op één dag is één keer betrapt');
  S.kalender.dag += 1;
  T.betrapt(D);
  assert.equal(D.einde && D.einde.reden, 'ambt');
});

test('betrapt met de spelregel "Meteen weg": meteen je ambt kwijt', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetOptie('betrapt', 'weg');
  try {
    T.betrapt(D);
    assert.equal(D.einde && D.einde.reden, 'ambt');
    assert.match(D.einde.waarom, /zijn soldaten vonden wat je verstopte/);
  } finally {
    T.optiesTerug();
  }
});

test('de soldaten vinden wat je verstopte: betrapt', () => {
  const S = gehucht();
  const D = S.dorp;
  const kelder = T.verstopPlekVan(D, D.gebouwen.find((g) => g.huis === 'schout'));
  T.zetVoorraad(D, 'graan', 200);
  T.verstop(D, kelder.gebouw, 'graan', 30);
  assert.ok(T.zoekOpPlek(D, kelder, 0));
  assert.equal(T.bazenNu(D).gunst, IN().laatsteWaarschuwing);
});

test('het dorp: antwoorden, de heervaart, de schandpaal, soldaten en wie sterft, bewegen het vertrouwen', () => {
  const S = gehucht();
  const D = S.dorp;
  const v = () => T.bazenNu(D).vertrouwen;
  T.vertrouwenNaVoorval(D, 4, 'het feest', false);
  assert.equal(v(), 54);
  T.vertrouwenNaVoorval(D, -4, 'de diefstal', true);
  assert.equal(v(), 52, 'besliste de raadsman, dan de helft');
  T.wijzigBevolking(D, -2, 'winter', 'De winter is hard');
  assert.equal(v(), 52 + 2 * IN().doodDoorWinter, 'wie verhongerde of bevroor');
  T.wijzigBevolking(D, -1, 'vertrek', 'het dorp is niet tevreden genoeg');
  assert.equal(v(), 52 + 2 * IN().doodDoorWinter, 'wie wegtrekt, niet');
  assert.match(T.bazenTekst(D, 'vertrouwen'), /-6 wie verhongerde of bevroor; -2 de diefstal; \+4 het feest/);
});

test('een antwoord op een voorval telt mee, ook als je raadsman het besliste', () => {
  const S = gehucht();
  const D = S.dorp;
  T.beginVoorval(D, 'klok', D.bewoners.mensen.find((p) => p.leeftijd === 'volwassen'), null, 1);
  T.voorvalGevolg(D, { tevreden: 4 });
  assert.equal(T.bazenNu(D).vertrouwen, 54);
});

test('het vertrouwen volgt langzaam hoe het gaat, en op 0 jaagt het dorp je weg, na een waarschuwing', () => {
  const S = gehucht();
  const D = S.dorp;
  D.behoeften = { tevredenheid: 1 };
  T.tikBazenDag(D);
  assert.ok(Math.abs(T.bazenNu(D).vertrouwen - (50 + (1 - IN().midden) * IN().perDag)) < 1e-9);
  T.wijzigVertrouwen(D, -60, 'een slechte maand');
  assert.equal(T.bazenNu(D).vertrouwen, IN().laatsteWaarschuwing, 'eerst de waarschuwing');
  assert.ok(berichten.some((t) => /Het dorp mort/.test(t)));
  assert.ok(T.RADEN.find((r) => r.id === 'dorpMort').als(D), 'de raad zegt het');
  T.wijzigVertrouwen(D, -10, 'nog een');
  assert.equal(D.einde && D.einde.reden, 'verjaagd');
  assert.deepEqual(eindes, ['verjaagd']);
});

test('de heervaart: de heer wil mannen, het dorp wil ze houden', () => {
  const S = gehucht();
  const D = S.dorp;
  D.trede = 'dorp';
  T.vraagHeervaart(D, 120);
  T.stuurHeervaart(D, 'gestuurd');
  assert.equal(T.bazenNu(D).gunst, 50 + IN().heervaart.gestuurd);
  assert.equal(T.bazenNu(D).vertrouwen, 50 + IN().heervaartWeg);
});

test('wat de bazen vinden, gaat mee in een opgeslagen spel', () => {
  const S = gehucht();
  const D = S.dorp;
  T.wijzigGunst(D, -35, 'eens');
  T.wijzigVertrouwen(D, 12, 'een feest');
  const terug = T.leesSpel(T.bewaarSpel(S)).staat.dorp;
  assert.deepEqual(terug.bazen, D.bazen);
});
