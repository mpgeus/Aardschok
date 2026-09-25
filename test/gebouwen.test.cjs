// De gebouwen zonder scherm (js/gebouwen.js): T.GEBOUWEN als gegevens, neerzetten (T.plaatsGebouw),
// en wat er elke dag gebeurt (T.tikGebouwenDag): klaarkomen, woonruimte, eten, groei, handen en
// productie. Zie ontwerp/spel.md, "Gebouwen" en ontwerp/werklijst.md, punt 2.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/tijd.js');
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
    // grondstoffen halen, en orde en leger (Marcel, 23 sep)
    'steengroeve', 'kleiput', 'rietsnijder', 'jager', 'visser', 'turfsteker', 'ertsgraver', 'kalkbrander',
    'wachthuis', 'gevang', 'tuighuis', 'kazerne',
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

// T.bouwFaseIndex: welke van de vijf bouwfases (tegels/bouwfasen.json, js/tekenen.js) een gebouw
// in aanbouw op een gegeven dag toont — de bouwtijd in vijf gelijke stukken. Puur, dus zonder
// S of een echt gebouw te toetsen (ontwerp/werklijst.md, punt 2b).
test('T.bouwFaseIndex: verdeelt de bouwtijd in vijf gelijke stukken, oplopend', () => {
  // bouwtijd 10 dagen, klaar op dag 10 (begonnen op dag 0): om de twee dagen een stuk verder, dus
  // ruim in het midden van elk stuk getoetst (niet precies op een grens: 2/10, 4/10, ... vallen
  // door afrondingen in drijvendekommagetallen niet altijd aan de kant die de wiskunde zegt).
  assert.equal(T.bouwFaseIndex(0, 10, 10), 0);
  assert.equal(T.bouwFaseIndex(1, 10, 10), 0);
  assert.equal(T.bouwFaseIndex(3, 10, 10), 1);
  assert.equal(T.bouwFaseIndex(5, 10, 10), 2);
  assert.equal(T.bouwFaseIndex(7, 10, 10), 3);
  assert.equal(T.bouwFaseIndex(9, 10, 10), 4); // nog niet klaar (dag < klaarOp): laatste fase, niet de afgewerkte tekening
});

test('T.bouwFaseIndex: begint bij fase 0, ook bij een korte bouwtijd', () => {
  assert.equal(T.bouwFaseIndex(0, 2, 2), 0);
  assert.equal(T.bouwFaseIndex(1, 2, 2), 2); // 1 dag van de 2 om: 3/5 → fase 2
});

test('T.bouwFaseIndex: bouwtijd 0 geeft meteen de laatste fase, nooit een crash door delen door nul', () => {
  assert.equal(T.bouwFaseIndex(0, 0, 0), 4);
});

test('T.bouwFaseIndex: klemt buiten bereik (voor het begin, of voorbij klaarOp) tussen 0 en 4', () => {
  assert.equal(T.bouwFaseIndex(-5, 10, 10), 0);
  assert.equal(T.bouwFaseIndex(50, 10, 10), 4);
});

test('T.plaatsGebouw: zet tekeningNaam, klaarOp en bouwtijd op het voorwerp, voor de bouwfase', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 8);
  const r = T.plaatsGebouw(S, 'hut', 2, 2);
  assert.equal(r.gelukt, true);
  const v = r.instantie.voorwerp;
  // T.GEBOUWEN.hut.tekening is 'gebouwen/dorpKlein2' — hier hoort alleen het laatste deel te
  // staan, dezelfde sleutel als tegels/bouwfasen.json.
  assert.equal(v.tekeningNaam, 'dorpKlein2');
  assert.equal(v.klaarOp, T.GEBOUWEN.hut.bouwtijd);
  assert.equal(v.bouwtijd, T.GEBOUWEN.hut.bouwtijd);
});

test('T.plaatsGebouw: tekeningNaam blijft leeg voor een soort zonder tekening', () => {
  const S = maakS();
  T.zetVoorraad(S, 'hout', 6);
  // De verstopplek heeft bewust geen tekening (een tekening zou 'm juist verraden) — precies het
  // geval waarvoor tekenVoorwerp (js/tekenen.js) terugvalt op gewoon bleker tot hij klaar is. Sinds
  // 25 sep staat hij niet meer in het bouwmenu (Marcel wil geen kuil; js/verstoppen.js), dus hier
  // een proefsoort zoals hij was.
  assert.equal(T.GEBOUWEN.verstopplek.tekening, null);
  assert.equal(T.plaatsGebouw(S, 'verstopplek', 2, 2).gelukt, false, 'niet meer via het bouwmenu');
  T.GEBOUWEN.proefZonderTekening = { ...T.GEBOUWEN.verstopplek, menu: true };
  try {
    const r = T.plaatsGebouw(S, 'proefZonderTekening', 2, 2);
    assert.equal(r.gelukt, true);
    assert.equal(r.instantie.voorwerp.tekeningNaam, null);
  } finally {
    delete T.GEBOUWEN.proefZonderTekening;
  }
});

// ---------------------------------------------------------------------------------------------
// Een gebouw maakt alleen wat zijn grondstof toelaat, en gereedschap (spel.md, "Handel", 24 sep
// 2026). Tot die dag maakte een smidse zonder ijzer toch gereedschap, en maalde een molen zonder
// graan toch meel.
// ---------------------------------------------------------------------------------------------

// Een dorp met één klaar gebouw van deze soort, en precies genoeg mensen voor zijn handen.
function metGebouw(soort) {
  const S = maakS();
  S.gebouwen.push({ soort, x: 0, y: 0, klaar: true, klaarOp: 0, handen: 0, voorwerp: null });
  S.bevolking = T.GEBOUWEN[soort].handen;
  S.voorraad.graan = 1000; // genoeg eten: het eten gaat hier niet over
  return S;
}

test('de smidse kan al in het gehucht', () => {
  assert.equal(T.GEBOUWEN.smidse.trede, 'gehucht');
});

test('een smidse zonder ijzer staat stil, en zegt dat', () => {
  const S = metGebouw('smidse');
  for (let dag = 1; dag <= 10; dag++) T.tikGebouwenDag(S, dag);
  assert.equal(S.voorraad.gereedschap || 0, 0, 'uit niets komt geen gereedschap');
  assert.equal(S.gebouwen[0].tekort, 'ijzer');
  assert.match(T.gebouwToestand(S, S.gebouwen[0]), /staat stil, er is geen ijzer/);
});

test('met ijzer voor anderhalve dag werkt de smidse anderhalve dag', () => {
  const S = metGebouw('smidse');
  S.voorraad.ijzer = 1.5;
  for (let dag = 1; dag <= 5; dag++) T.tikGebouwenDag(S, dag);
  assert.equal(S.voorraad.ijzer, 0);
  // Anderhalf stuk gemaakt, min wat er al van sleet.
  assert.ok(S.voorraad.gereedschap > 1.45 && S.voorraad.gereedschap <= 1.5, `gereedschap ${S.voorraad.gereedschap}`);
});

test('een molen zonder graan maalt niets', () => {
  const S = metGebouw('molen');
  S.voorraad.graan = 0;
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.meel || 0, 0);
});

test('gereedschap laat harder werken, en wat in gebruik is, slijt', () => {
  const zonder = metGebouw('houthakker');
  const met = metGebouw('houthakker');
  met.voorraad.gereedschap = 1;
  T.tikGebouwenDag(zonder, 1);
  T.tikGebouwenDag(met, 1);
  const IN = T.GEBOUWEN_INSTELLINGEN;
  assert.ok(Math.abs(met.voorraad.hout - zonder.voorraad.hout * (1 + IN.gereedschapBonus)) < 1e-9);
  assert.ok(Math.abs(met.voorraad.gereedschap - (1 - 1 / IN.gereedschapSlijtDagen)) < 1e-9);
});

test('gereedschap bij wie stilstaat, slijt niet en telt niet mee', () => {
  const S = metGebouw('smidse'); // zonder ijzer: de smid heeft niets te smeden
  S.voorraad.gereedschap = 3;
  T.tikGebouwenDag(S, 1);
  assert.equal(S.voorraad.gereedschap, 3);
  assert.equal(T.gereedschapDekking(S).handen, 0);
});

test('de muis op de voet van een neergezet gebouw vindt dat gebouw (T.gebouwOp)', () => {
  const S = maakS();
  S.voorraad.hout = 100;
  S.voorraad.goud = 100;
  const r = T.plaatsGebouw(S, 'smidse', 3, 4);
  assert.equal(r.gelukt, true);
  const [b, h] = r.instantie.voorwerp.beslaat;
  assert.equal(T.gebouwOp(S, 3, 4), r.instantie);
  assert.equal(T.gebouwOp(S, 3 + b - 1, 4 + h - 1), r.instantie);
  assert.equal(T.gebouwOp(S, 3 + b, 4), null);
  assert.match(T.gebouwToestand(S, r.instantie), /in aanbouw/);
});

test('de visser vangt niets als de beek dichtligt, en zegt dat', () => {
  const S = metGebouw('visser');
  const winterdag = 280; // wintermaand
  assert.equal(T.datumVanDag(winterdag).seizoen, 'winter');
  T.tikGebouwenDag(S, winterdag);
  assert.equal(S.voorraad.vis || 0, 0);
  assert.match(T.gebouwToestand(S, S.gebouwen[0]), /staat stil, de beek ligt dicht/);
  assert.equal(T.gereedschapDekking(S, 'winter').handen, 0, 'wie stilligt, gebruikt geen gereedschap');
  T.tikGebouwenDag(S, 30); // grasmaand: de beek is weer open
  assert.ok(S.voorraad.vis > 0);
  assert.doesNotMatch(T.gebouwToestand(S, S.gebouwen[0]), /beek/);
});
