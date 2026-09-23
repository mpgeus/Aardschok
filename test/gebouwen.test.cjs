// De gebouwen zonder scherm (js/gebouwen.js): T.GEBOUWEN als gegevens, neerzetten (T.plaatsGebouw),
// en wat er elke dag gebeurt (T.tikGebouwenDag): klaarkomen, woonruimte, eten, groei, handen en
// productie. Zie ontwerp/spel.md, "Gebouwen" en ontwerp/werklijst.md, punt 2.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gebouwen.js');
const T = globalThis.Toren;

// Een kleine, lege wereld om gebouwen op neer te zetten: net als T.maakWereld() maar zonder de
// hele toren erbij — alleen wat T.isVast/T.voorwerpOp nodig hebben (js/wereld.js).
function maakLegeWereld(b, h) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(new Array(b).fill('vloer'));
  return { b, h, tegels, voorwerpen: [] };
}

function maakS(b, h) {
  return { wereld: maakLegeWereld(b || 20, h || 20), voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, kalender: { dag: 0 } };
}

test('elke soort in T.GEBOUWEN heeft naam, trede, kosten en bouwtijd', () => {
  for (const [id, g] of Object.entries(T.GEBOUWEN)) {
    assert.ok(g.naam, `${id} mist een naam`);
    assert.ok(T.GEBOUW_TREDEN.includes(g.trede), `${id} heeft een onbekende trede "${g.trede}"`);
    assert.ok(g.kosten && typeof g.kosten === 'object', `${id} mist kosten`);
    assert.ok(Number.isFinite(g.bouwtijd) && g.bouwtijd >= 0, `${id} heeft geen geldige bouwtijd`);
  }
});

test('alle soorten uit spel.md staan erin', () => {
  for (const id of [
    'hut', 'huis', 'boerderij', 'akker', 'houthakker', 'schaapskooi', 'kippenhok', 'moestuin', 'put', 'verstopplek',
    'smidse', 'timmerman', 'molen', 'bakkerij', 'brouwerij', 'herberg', 'kapel', 'tiendschuur',
    'markt', 'weverij', 'pakhuis', 'kuiper', 'slager', 'leerlooier', 'steenbakkerij', 'badhuis', 'gasthuis',
    'stenenHuis', 'raadhuis', 'stadsmuur',
    'wapenmaker', 'schuttershof', 'palissade',
  ]) {
    assert.ok(T.GEBOUWEN[id], `"${id}" ontbreekt in T.GEBOUWEN`);
  }
});

test('T.gebouwVoet geeft de geschatte voet als er geen tekening is opgezocht', () => {
  // Zonder T.opzoekTegelNaam (kaart.js is hier niet geladen) valt hij terug op g.voet.
  assert.deepEqual(T.gebouwVoet('put'), { b: 1, h: 1 });
});

test('T.gebouwPast: ja op lege grond, nee waar al iets vast staat', () => {
  const S = maakS();
  assert.equal(T.gebouwPast(S, 'put', 5, 5), true);
  S.wereld.tegels[5][5] = 'muur';
  assert.equal(T.gebouwPast(S, 'put', 5, 5), false);
});

test('T.gebouwPast: de hele voet moet vrij zijn, niet alleen de linkerbovenhoek', () => {
  const S = maakS();
  S.wereld.tegels[3][4] = 'muur'; // ergens binnen de voet van "huis" (6x6) vanaf (2, 2)
  assert.equal(T.gebouwPast(S, 'huis', 2, 2), false);
});

test('T.plaatsGebouw: betaalt de kosten en zet hem in aanbouw neer', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 6);
  T.zetVoorraad(S, 'goud', 2);
  const r = T.plaatsGebouw(S, 'put', 2, 2);
  assert.equal(r.gelukt, true);
  assert.equal(S.voorraad.hout, 0);
  assert.equal(S.voorraad.goud, 0);
  assert.equal(S.gebouwen.length, 1);
  assert.equal(S.gebouwen[0].klaar, false);
  assert.equal(S.gebouwen[0].klaarOp, T.GEBOUWEN.put.bouwtijd);
  // Zijn voet is al vast, ook al staat hij nog in aanbouw — anders zet je er zo een tweede op.
  assert.equal(T.isVast(S.wereld, 2, 2), true);
});

test('T.plaatsGebouw: mislukt zonder genoeg voorraad, en er verandert dan niets', () => {
  const S = maakS();
  const r = T.plaatsGebouw(S, 'put', 2, 2);
  assert.equal(r.gelukt, false);
  assert.ok(r.reden);
  assert.equal(S.gebouwen.length, 0);
  assert.equal(T.isVast(S.wereld, 2, 2), false);
});

test('T.plaatsGebouw: mislukt als de voet niet past', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 100);
  T.zetVoorraad(S, 'goud', 100);
  S.wereld.tegels[2][2] = 'muur';
  const r = T.plaatsGebouw(S, 'put', 2, 2);
  assert.equal(r.gelukt, false);
  assert.equal(S.gebouwen.length, 0);
});

test('T.plaatsGebouw: soorten met menu: false (akker, stadsmuur, palissade) kunnen niet via het bouwmenu', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 999);
  T.zetVoorraad(S, 'goud', 999);
  assert.equal(T.plaatsGebouw(S, 'akker', 2, 2).gelukt, false);
  assert.equal(T.plaatsGebouw(S, 'stadsmuur', 2, 2).gelukt, false);
});

test('T.tikGebouwenDag: een gebouw komt klaar op zijn klaarOp, niet ervoor', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 16);
  T.zetVoorraad(S, 'goud', 4);
  T.plaatsGebouw(S, 'huis', 2, 2); // bouwtijd 4
  for (let d = 1; d < T.GEBOUWEN.huis.bouwtijd; d++) {
    T.tikGebouwenDag(S, d);
    assert.equal(S.gebouwen[0].klaar, false, `dag ${d}: hoort nog niet klaar te zijn`);
  }
  T.tikGebouwenDag(S, T.GEBOUWEN.huis.bouwtijd);
  assert.equal(S.gebouwen[0].klaar, true);
  assert.equal(S.gebouwen[0].voorwerp.inAanbouw, false);
});

test('T.tikGebouwenDag: woonruimte is de som van de klare huizen, niet van wat nog in aanbouw is', () => {
  const S = maakS();
  S.gebouwen.push({ soort: 'huis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  S.gebouwen.push({ soort: 'hut', x: 10, y: 10, klaar: false, klaarOp: 5, handen: 0 });
  T.tikGebouwenDag(S, 1);
  assert.equal(S.woonruimte, T.GEBOUWEN.huis.woonruimte);
});

test('T.tikGebouwenDag: de bevolking eet graan uit S.voorraad', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 100);
  T.tikGebouwenDag(S, 1);
  const verwacht = 100 - 10 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
  assert.ok(Math.abs(S.voorraad.graan - verwacht) < 1e-9);
});

test('T.tikGebouwenDag: er komt een gezin bij op een groeidag, als er ruimte en genoeg graan is', () => {
  const S = maakS();
  const IN = T.GEBOUWEN_INSTELLINGEN;
  S.gebouwen.push({ soort: 'huis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 }); // woonruimte 5
  S.bevolking = 0;
  T.zetVoorraad(S, 'graan', 1000);
  T.tikGebouwenDag(S, IN.gezinDagen);
  assert.equal(S.bevolking, IN.gezinGrootte);
});

test('T.tikGebouwenDag: geen nieuw gezin zonder woonruimte, ook niet op een groeidag', () => {
  const S = maakS();
  const IN = T.GEBOUWEN_INSTELLINGEN;
  T.zetVoorraad(S, 'graan', 1000);
  T.tikGebouwenDag(S, IN.gezinDagen);
  assert.equal(S.bevolking, 0);
});

test('T.tikGebouwenDag: geen nieuw gezin zonder genoeg graan in de buffer', () => {
  const S = maakS();
  const IN = T.GEBOUWEN_INSTELLINGEN;
  S.gebouwen.push({ soort: 'huis', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  T.zetVoorraad(S, 'graan', IN.graanBufferVoorGroei - 1);
  T.tikGebouwenDag(S, IN.gezinDagen);
  assert.equal(S.bevolking, 0);
});

test('T.tikGebouwenDag: de bevolking groeit nooit voorbij de woonruimte', () => {
  const S = maakS();
  const IN = T.GEBOUWEN_INSTELLINGEN;
  S.gebouwen.push({ soort: 'hut', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 }); // woonruimte 3
  S.bevolking = 2;
  T.zetVoorraad(S, 'graan', 1000);
  T.tikGebouwenDag(S, IN.gezinDagen);
  assert.equal(S.bevolking, 3); // niet 2 + gezinGrootte (4), want dat zou boven de 3 komen
});

test('T.tikGebouwenDag: handen gaan op volgorde van S.gebouwen naar de werkplaatsen', () => {
  const S = maakS();
  S.bevolking = 1; // net genoeg voor één van de twee houthakkers (elk vraagt er T.GEBOUWEN.houthakker.handen)
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  S.gebouwen.push({ soort: 'houthakker', x: 10, y: 10, klaar: true, klaarOp: 0, handen: 0 });
  T.tikGebouwenDag(S, 1);
  assert.equal(S.gebouwen[0].handen, 1);
  assert.equal(S.gebouwen[1].handen, 0);
});

test('T.tikGebouwenDag: een werkplaats zonder genoeg handen maakt naar rato minder', () => {
  const S = maakS();
  const houthakker = T.GEBOUWEN.houthakker; // handen: 1, maakt: { uit: { hout: 2 } }
  assert.equal(houthakker.handen, 1); // deze toets gaat uit van precies 1 hand
  S.bevolking = 0; // geen handen beschikbaar
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  T.zetVoorraad(S, 'hout', 0);
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.hout, 0); // geen bezetting, dus geen productie
});

test('T.tikGebouwenDag: volle bezetting geeft de volle opbrengst, in de voorraad', () => {
  const S = maakS();
  S.bevolking = T.GEBOUWEN.houthakker.handen;
  S.gebouwen.push({ soort: 'houthakker', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  T.zetVoorraad(S, 'hout', 0);
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.hout, T.GEBOUWEN.houthakker.maakt.uit.hout);
});

test('T.tikGebouwenDag: een gebouw met een "in" trekt dat er ook af', () => {
  const S = maakS();
  S.bevolking = T.GEBOUWEN.bakkerij.handen;
  S.gebouwen.push({ soort: 'bakkerij', x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0 });
  T.zetVoorraad(S, 'meel', 10);
  T.zetVoorraad(S, 'brood', 0);
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.meel, 10 - T.GEBOUWEN.bakkerij.maakt.in.meel);
  assert.equal(S.voorraad.brood, T.GEBOUWEN.bakkerij.maakt.uit.brood);
});

test('T.werkGebouwenBij: de eerste aanroep onthoudt alleen de dag, en verandert nog niets', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 100);
  T.werkGebouwenBij(S);
  assert.equal(S.voorraad.graan, 100);
  assert.equal(S.gebouwenDag, 0);
});

test('T.werkGebouwenBij: verwerkt elke verstreken dag apart, ook als de kalender in één keer ver springt', () => {
  const S = maakS();
  S.bevolking = 10;
  T.zetVoorraad(S, 'graan', 1000);
  T.werkGebouwenBij(S); // start op dag 0
  S.kalender.dag = 3.4; // een grote stap in één beeld (bijvoorbeeld na Toren.debug.kalender)
  T.werkGebouwenBij(S);
  assert.equal(S.gebouwenDag, 3);
  const verwacht = 1000 - 3 * 10 * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
  assert.ok(Math.abs(S.voorraad.graan - verwacht) < 1e-9, `verwachtte ${verwacht}, kreeg ${S.voorraad.graan}`);
});

// ── T.zetBestaandeGebouwen (het gehucht dat niet leeg begint) — hier met een handgemaakte
// w.gebouwenOpKaart; hoe die daar vanuit een betekenisbestand komt, staat in
// test/gebouwen-kaart.test.cjs, samen met de rest van T.laadKaart. ──
test('T.zetBestaandeGebouwen: zet elk gebouw op de kaart klaar neer, en de bevolking begint op hun woonruimte', () => {
  const S = maakS();
  S.wereld.gebouwenOpKaart = [
    { soort: 'boerderij', x: 2, y: 2, b: 7, h: 8 },
    { soort: 'huis', x: 20, y: 20, b: 6, h: 8 },
  ];
  T.zetBestaandeGebouwen(S);
  assert.equal(S.gebouwen.length, 2);
  assert.ok(S.gebouwen.every((g) => g.klaar === true));
  const verwacht = T.GEBOUWEN.boerderij.woonruimte + T.GEBOUWEN.huis.woonruimte;
  assert.equal(S.woonruimte, verwacht);
  assert.equal(S.bevolking, verwacht);
});

test('T.zetBestaandeGebouwen: een onbekende soort wordt overgeslagen, niet een toets die crasht', () => {
  const S = maakS();
  S.wereld.gebouwenOpKaart = [{ soort: 'iets-dat-niet-bestaat', x: 0, y: 0, b: 1, h: 1 }];
  assert.doesNotThrow(() => T.zetBestaandeGebouwen(S));
  assert.equal(S.gebouwen.length, 0);
});
