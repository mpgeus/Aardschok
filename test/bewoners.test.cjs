// De bewoners (js/bewoners.js, sinds 26 sep): wie er in het dorp woont, met wie en in welk huis,
// wie waar werkt, en het ritme van de dag voor iedereen (T.dagAnker in js/dag.js). Zie
// ontwerp/spel.md, "Mensen worden poppetjes", en de werklijst, punt 3b, stap 2. Sinds 12 okt (snoeien, ronde 2, stap 3)
// spelen de toetsen op het proefdorp (test/grond.cjs), niet meer op het ontworpen gehucht.
const test = require('node:test');
const assert = require('node:assert/strict');
const { proefDorp } = require('./grond.cjs');

const T = require('./laad.cjs').spel();
const IN = T.BEWONERS_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const GROEI = dagVan('bloeimaand', 10);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het proefdorp (test/grond.cjs): het huis van de schout, twee boerderijen met een akker, en hutten; iedereen woont en
// staat thuis. `dag` en `snelheid` zetten de kalender; de rest gaat naar proefDorp (zoals `gebouwen: ['schaapskooi']`).
function proef(opties = {}) {
  const { dag, snelheid, ...dorp } = opties;
  const { S } = proefDorp(T, dorp);
  Object.assign(S, { bezocht: new Set() });
  Object.assign(S.kalender, { dag: dag != null ? dag : bijUur(GROEI, 7), snelheid: snelheid || 1 });
  return S;
}
// Een meent (de heide) op open grond, zoals de kaart van het ontworpen gehucht er een had: het lege begin heeft er geen.
// Wie al werk heeft, krijgt zijn plek opnieuw (T.verdeelHanden).
function zetMeent(S) {
  const w = S.wereld;
  const plek = vrijePlek(S, { b: 5, h: 5 }, T.pleinVan(w));
  (w.meenten || (w.meenten = [])).push({ naam: 'heide', x: plek.x, y: plek.y, b: 5, h: 5, meent: true });
  T.verdeelHanden(S.dorp);
  return w.meenten[0];
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  T.werkBewonersBij(S.dorp);
  T.beweegWezens(S, S.wereld, dt, dtW);
  T.werkOogstBij(S, S.dorp, dtW);
  T.laatDwalen(S, dtW);
}
function loopTot(S, dag) {
  for (let i = 0; S.kalender.dag < dag && i < 200000; i++) stap(S, 0.05);
}
// Doorlopen tot `klaar()` waar is, of tot er `uren` voorbij zijn (een uur is 12,5 seconden bij 1×).
function loopTotDat(S, klaar, uren) {
  const tot = S.wereldTijd + (uren * T.DAG_LENGTE) / 24;
  while (!klaar() && S.wereldTijd < tot) stap(S, 0.05);
}
// Wat er in de berichten komt, vanaf nu.
function vangBerichten() {
  const lijst = [];
  T.ui.bericht = (t) => lijst.push(t);
  return lijst;
}
const mensen = (S) => S.dorp.bewoners.mensen;
const nieuwe = (S) => mensen(S).filter((p) => !p.schout); // wie hier een poppetje kreeg: iedereen behalve de schout
const vanSchout = (p) => !!(p.schout || (p.hoofd && p.hoofd.schout));
const inHuis = (S, g) => mensen(S).filter((p) => p.huis === g);
const opTegel = (e) => ({ x: e.tx, y: e.ty });
// Een vrije plek op de kaart voor een voet, met een rand eromheen, zo dicht mogelijk bij `bij`: zo
// breekt een nieuwe indeling van het dorp de toetsen niet (26 sep: een plein, meer ruimte).
function vrijePlek(S, voet, bij) {
  const w = S.wereld;
  let beste = null;
  let afstand = Infinity;
  const K = T.kaartVak(w);
  for (let y = K.y + 1; y + voet.h < K.y + K.h; y++) {
    for (let x = K.x + 1; x + voet.b < K.x + K.b; x++) {
      let vrij = true;
      for (let dy = -1; dy <= voet.h && vrij; dy++) for (let dx = -1; dx <= voet.b && vrij; dx++) if (T.isVast(w, x + dx, y + dy)) vrij = false;
      const a = Math.hypot(x - bij.x, y - bij.y);
      if (vrij && a < afstand) {
        afstand = a;
        beste = { x, y };
      }
    }
  }
  return beste;
}
// Een huis erbij, op een vrije plek bij het plein, klaar om in te wonen.
function bouwHuis(S) {
  const voet = T.gebouwVoet('huis');
  const plek = vrijePlek(S, voet, T.pleinVan(S.wereld));
  const huis = { soort: 'huis', x: plek.x, y: plek.y, voet, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
  S.dorp.gebouwen.push(huis);
  return huis;
}

// ---------------------------------------------------------------------------------------------
// Wie er woont
// ---------------------------------------------------------------------------------------------

test('in het proefdorp is er één bewoner per mond, elk met een huis en een poppetje', () => {
  const S = proef();
  assert.ok(S.dorp.woonruimte > S.dorp.bevolking, 'ook al is er plaats voor meer');
  assert.equal(mensen(S).length, S.dorp.bevolking, 'het getal in de balk blijft de waarheid');
  for (const g of S.dorp.gebouwen) {
    const ruimte = T.GEBOUWEN[g.soort].woonruimte || 0;
    assert.ok(inHuis(S, g).length <= ruimte, `${g.soort} ${g.huis}: niet meer dan er plaats is`);
  }
  for (const p of mensen(S)) {
    assert.ok(p.wezen, `${p.id} heeft een poppetje`);
    assert.ok(S.wereld.wezens.includes(p.wezen), `${p.id} staat in de wereld`);
  }
  assert.equal(nieuwe(S).length, S.dorp.bevolking - 1, 'de schout stond er al; de rest kreeg hier een poppetje');
  const namen = nieuwe(S).map((p) => p.naam);
  assert.equal(new Set(namen).size, namen.length, 'geen twee dezelfde namen');
  for (const p of nieuwe(S)) {
    // Wie het hoofd van zijn gezin is (de man van een gezin uit het kamp), heeft zelf geen hoofd; de rest hoort bij een
    // gezin en woont daar.
    const hoofd = p.hoofd || p;
    assert.ok(p.hoofd ? p.band : p.gezin != null, `${p.naam} hoort bij een gezin`);
    assert.equal(p.huis, hoofd.huis, `${p.naam} woont bij zijn gezin`);
    assert.equal(p.wezen.bewoner, p);
    assert.equal(p.wezen.vel, T.LEEFTIJDEN[p.leeftijd][p.geslacht], `${p.naam} draagt het vel van zijn leeftijd`);
  }
});

// Marcel koos het op 26 sep (vraag 31): niet allemaal op een boerderij. Sinds het lege begin (11 okt) woont elk gezin
// samen in één huis: de man op een boerderij is de boer, en de rest woont in hutten.
test('wie waar woont: elk gezin onder één dak, de boer met zijn vrouw op zijn boerderij, de anderen in hutten', () => {
  const S = proef();
  const D = S.dorp;
  const boerderijen = D.gebouwen.filter((x) => x.soort === 'boerderij');
  assert.equal(boerderijen.length, 2);
  for (const g of boerderijen) {
    const gezin = inHuis(S, g);
    assert.ok(gezin.length >= 3 && gezin.length <= 4, `boerderij: ${gezin.length}`);
    assert.ok(T.isBoer(D, T.boerVan(D, g)), 'er woont een boer');
    assert.ok(gezin.some((p) => p.band === 'vrouw' || p.band === 'man'), 'de boer en zijn vrouw of haar man');
  }
  for (const g of D.gebouwen.filter((x) => x.soort !== 'schout' && T.GEBOUWEN[x.soort].woonruimte > 0)) {
    const gezin = inHuis(S, g);
    assert.ok(gezin.length > 0 && new Set(gezin.map((p) => p.gezin)).size === 1, `${g.soort}: één gezin onder één dak`);
  }
  const hutten = D.gebouwen.filter((x) => x.soort === 'hut');
  assert.ok(hutten.length && hutten.every((h) => inHuis(S, h).length > 0), 'wie niet op een boerderij woont, woont in een hut');
});

test('de schout woont met zijn vrouw en drie kinderen (Marcel, vraag 27)', () => {
  const S = proef();
  const huis = S.dorp.gebouwen.find((g) => g.soort === 'schout');
  const gezin = inHuis(S, huis);
  assert.equal(gezin.length, 5);
  assert.ok(gezin.find((p) => p.schout && p.wezen === S.schout), 'de schout zelf, met zijn eigen wezen');
  assert.equal(gezin.filter((p) => p.band === 'vrouw' && p.leeftijd === 'volwassen').length, 1);
  assert.equal(gezin.filter((p) => p.band === 'zoon' || p.band === 'dochter').length, 3);
  assert.ok(!S.schout.bewoner, 'de schout loopt waar de speler wil, niet op het ritme van de dag');
});

// ---------------------------------------------------------------------------------------------
// Wie werkt
// ---------------------------------------------------------------------------------------------

// De herder is wie het best past, zoals bij elk werk (Marcel, 26 sep: hij hoeft geen boerenzoon te
// zijn): het liefst een knaap (`liefst` bij de schaapskooi), anders een volwassene zonder werk.
test('wie werkt: elke hand is een mens, de boer op zijn eigen land, en de herder is wie het best past', () => {
  const S = proef({ gebouwen: ['schaapskooi'] });
  const D = S.dorp;
  const handen = D.gebouwen.reduce((n, g) => n + (g.handen || 0), 0);
  assert.equal(handen, 5, 'twee per boerderij, en een herder');
  const werkers = mensen(S).filter((p) => p.werk);
  assert.equal(werkers.length, handen, 'elke hand is iemand');
  for (const g of D.gebouwen) assert.equal(werkers.filter((p) => p.werk === g).length, g.handen || 0, `${g.soort} ${g.huis}`);
  for (const p of mensen(S).filter((x) => T.isBoer(D, x))) assert.equal(p.werk, p.huis, `${p.naam} werkt op zijn eigen boerderij`);
  const herder = werkers.find((p) => p.werk.soort === 'schaapskooi');
  const knaap = mensen(S).some((p) => p.leeftijd === 'jong' && !vanSchout(p));
  if (knaap) assert.equal(herder.leeftijd, 'jong', `is er een knaap, dan hoedt een knaap (${herder.naam})`);
  else assert.equal(herder.leeftijd, 'volwassen', `anders een volwassene (${herder.naam})`);
  assert.ok(!werkers.some((p) => p.leeftijd === 'kleuter'), 'geen kleuter');
  assert.ok(!werkers.some(vanSchout), 'het gezin van de schout werkt niet voor het dorp zolang er anderen zijn');
});

test('T.werkendeHanden: wie kan werken, en zonder bewoners het hele getal', () => {
  assert.equal(T.werkendeHanden({ bevolking: 7 }), 7, 'zonder bewoners, zoals vóór de poppetjes');
  const S = proef();
  const kleuters = mensen(S).filter((p) => p.leeftijd === 'kleuter').length;
  assert.equal(T.werkendeHanden(S.dorp), S.dorp.bevolking - 1 - kleuters, 'iedereen behalve de schout en de kleuters');
});

test('wie werk heeft, houdt het, en een nieuwe werkplaats krijgt de vrije hand die het best past', () => {
  const S = proef();
  const voor = new Map(mensen(S).map((p) => [p, p.werk]));
  T.verdeelHanden(S.dorp);
  T.verdeelHanden(S.dorp);
  for (const p of mensen(S)) assert.equal(p.werk, voor.get(p), `${p.naam} houdt zijn werk`);
  // Een kleiput bij de eerste boerderij.
  const plek = vrijePlek(S, { b: 1, h: 1 }, T.deurVan(S.wereld, S.dorp.gebouwen.find((x) => x.soort === 'boerderij')));
  const g = { soort: 'kleiput', x: plek.x, y: plek.y, voet: { b: 1, h: 1 }, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
  S.dorp.gebouwen.push(g);
  const vrij = mensen(S).filter((p) => !p.werk && p.leeftijd !== 'kleuter' && !vanSchout(p));
  T.verdeelHanden(S.dorp);
  const houthakker = mensen(S).find((p) => p.werk === g);
  assert.ok(houthakker && vrij.includes(houthakker), 'iemand die nog geen werk had');
  const rang = (p) => T.LEEFTIJDEN[p.leeftijd].werkt;
  assert.equal(rang(houthakker), Math.min(...vrij.map(rang)), 'eerst wie het oudst is om te werken: een volwassene vóór een knaap');
  for (const p of mensen(S)) if (p !== houthakker) assert.equal(p.werk, voor.get(p), 'de rest houdt zijn werk');
});

// ---------------------------------------------------------------------------------------------
// Het getal verandert, en de bewoners gaan mee
// ---------------------------------------------------------------------------------------------

test('T.wijzigBevolking: een nieuw gezin in een huis met plaats; wie sterft is eerst oud; wie wegtrekt kwam het laatst', () => {
  const S = proef();
  const huis = bouwHuis(S);
  assert.equal(T.wijzigBevolking(S.dorp, 4, 'groei'), 4);
  assert.equal(mensen(S).length, S.dorp.bevolking);
  const gezin = inHuis(S, huis);
  assert.equal(gezin.length, 4, 'het nieuwe gezin woont samen in het nieuwe huis');
  // Het komt overdag over de weg binnen (hieronder, "Komen en gaan"); tot dan is het onderweg.
  assert.ok(gezin.every((p) => p.komt && !p.wezen), 'nog onderweg hierheen');
  const hoofd = gezin.find((p) => !p.hoofd);
  assert.ok(hoofd && gezin.some((p) => p.band === 'vrouw'), 'een man en zijn vrouw, met kinderen');

  // Het proefdorp heeft geen oude (de gezinnen uit het kamp zijn jong); maak er een van een vrouw uit een hut.
  const oma = nieuwe(S).find((p) => p.band === 'vrouw' && p.huis.soort === 'hut');
  oma.leeftijd = 'oud';
  T.poppetjeNaarLeeftijd(S.dorp, oma);
  T.wijzigBevolking(S.dorp, -1, 'winter');
  assert.ok(!mensen(S).includes(oma), 'de winter neemt eerst een oude');
  assert.equal(mensen(S).length, S.dorp.bevolking);
  assert.ok(!S.wereld.wezens.includes(oma.wezen), 'zijn poppetje is weg');

  T.wijzigBevolking(S.dorp, -4, 'vertrek');
  assert.equal(inHuis(S, huis).length, 0, 'het gezin dat het laatst kwam, trekt weer weg');
  assert.equal(mensen(S).length, S.dorp.bevolking);
  assert.ok(mensen(S).find((p) => p.schout), 'de schout blijft');
});

// ---------------------------------------------------------------------------------------------
// Komen en gaan (stuk 2): je ziet het, en het bericht zegt wie het zijn
// ---------------------------------------------------------------------------------------------

test('komen: een nieuw gezin komt overdag over de weg binnen, met een bericht op naam, en loopt naar zijn huis', () => {
  const S = proef(); // om zeven uur
  const berichten = vangBerichten();
  const huis = bouwHuis(S);
  T.wijzigBevolking(S.dorp, 4, 'groei');
  const gezin = inHuis(S, huis);
  T.werkBewonersBij(S.dorp);
  assert.ok(gezin.every((p) => !p.wezen), 'vóór het bezoekuur is er nog niemand');
  assert.equal(berichten.length, 0);
  S.kalender.dag = bijUur(GROEI, T.DAG_INSTELLINGEN.bezoekUur + 0.1);
  T.werkBewonersBij(S.dorp);
  const weg = T.wegInEnUit(S.wereld);
  for (const p of gezin) {
    assert.ok(p.wezen && S.wereld.wezens.includes(p.wezen), 'nu met een poppetje');
    assert.ok(T.afstand(weg, opTegel(p.wezen)) <= 3, 'op de weg, aan de rand van de kaart');
    const erf = { x: p.wezen.thuis.x, y: p.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal };
    assert.deepEqual(T.dagAnker(S.dorp, p.wezen), erf, 'eerst naar zijn huis, ook met werk');
  }
  assert.equal(berichten.length, 1);
  assert.match(berichten[0], /new family is coming along the road/);
  assert.ok(berichten[0].includes(gezin.find((p) => !p.hoofd).naam), 'het bericht zegt wie het zijn');
  assert.match(T.overBewonerTekst(S.dorp, gezin[0].wezen), /new in the hamlet/);
  T.werkBewonersBij(S.dorp);
  assert.equal(berichten.length, 1, 'het bericht komt één keer');
  loopTotDat(S, () => gezin.every((p) => !p.komt), 5);
  assert.ok(gezin.every((p) => !p.komt), 'binnen vijf uur zijn ze allemaal thuis');
  // Daarna volgen ze de dag, zoals iedereen: wie het eerst thuis was, is al naar zijn plek voor overdag.
  for (const p of gezin) assert.equal(T.dagAnker(S.dorp, p.wezen), p.plek.werk || p.plek.vrij);
});

test('gaan: wie wegtrekt, telt meteen niet meer mee, gaat bij het licht, loopt de weg af en verlaat de kaart', () => {
  const S = proef();
  const huis = bouwHuis(S);
  T.wijzigBevolking(S.dorp, 4, 'groei');
  const gezin = inHuis(S, huis);
  S.kalender.dag = bijUur(GROEI, 10);
  loopTotDat(S, () => gezin.every((p) => !p.komt), 5);
  // 's Nachts besloten: ze gaan pas als het licht is.
  S.kalender.dag = bijUur(GROEI + 1, 23);
  const berichten = vangBerichten();
  T.wijzigBevolking(S.dorp, -4, 'vertrek', 'the village is not content enough');
  assert.equal(inHuis(S, huis).length, 0, 'ze wonen er niet meer');
  assert.equal(mensen(S).length, S.dorp.bevolking);
  assert.equal(berichten.length, 1);
  assert.match(berichten[0], / leave: the village is not content enough\. \(-4\)$/);
  assert.ok(berichten[0].startsWith(`${gezin.find((p) => !p.hoofd).naam} and `), 'het gezin bij naam');
  for (const p of gezin) {
    assert.ok(S.wereld.wezens.includes(p.wezen), 'zijn poppetje is er nog');
    assert.equal(p.werk, null, 'hij werkt nergens meer');
    assert.ok(T.dagAnker(S.dorp, p.wezen).binnen, "'s nachts nog binnen");
  }
  S.kalender.dag = bijUur(GROEI + 2, 10);
  const uitgang = T.wegInEnUit(S.wereld);
  for (const p of gezin) assert.deepEqual(T.dagAnker(S.dorp, p.wezen), { x: uitgang.x, y: uitgang.y, straal: 1 }, 'overdag naar de uitgang');
  assert.match(T.overBewonerTekst(S.dorp, gezin[0].wezen), /leaving$/);
  loopTotDat(S, () => !S.dorp.bewoners.vertrekken.length, 5);
  assert.ok(gezin.every((p) => !S.wereld.wezens.includes(p.wezen)), 'bij de uitgang gaan ze van de kaart');
});

test('sterven: het bericht zegt wie het is, en wie hij voor iemand was', () => {
  const S = proef();
  const berichten = vangBerichten();
  const voor = mensen(S).slice();
  T.wijzigBevolking(S.dorp, -1, 'winter', 'The winter is harsh');
  const dood = voor.find((p) => !mensen(S).includes(p));
  assert.equal(berichten.length, 1);
  assert.ok(berichten[0].startsWith('The winter is harsh: '), berichten[0]);
  assert.ok(berichten[0].includes(dood.naam) && berichten[0].endsWith(' died.'), berichten[0]);
  if (dood.hoofd) assert.ok(berichten[0].includes(' of '), 'met wie hij voor iemand was');
  if (dood.leeftijd === 'oud') assert.ok(berichten[0].includes(`old ${dood.naam}`));
  T.wijzigBevolking(S.dorp, -2, 'winter', 'The hunger is harsh');
  assert.ok(berichten[1].startsWith('The hunger is harsh: ') && berichten[1].endsWith(' died.'), berichten[1]);
  // "old Agnes, mother of Walter, and old Maud, ...": een bijstelling sluit met een komma.
  const [eerste] = berichten[1].slice('The hunger is harsh: '.length).split(' and ');
  if (eerste.includes(',')) assert.ok(eerste.endsWith(','), berichten[1]);
  // Zonder `waarom` (het begin, een toets) geen bericht.
  T.wijzigBevolking(S.dorp, -1, 'winter');
  assert.equal(berichten.length, 2);
});

// ---------------------------------------------------------------------------------------------
// Het ritme van de dag
// ---------------------------------------------------------------------------------------------

test('T.dagAnker voor een bewoner: \'s nachts binnen, \'s ochtends de put of het erf, overdag werk of vrij', () => {
  // Met een put (wie water haalt), een herder en de heide (het lege begin heeft die niet: zie zetMeent).
  const S = proef({ gebouwen: ['put', 'schaapskooi'] });
  zetMeent(S);
  const waterhaler = nieuwe(S).find((p) => p.haaltWater);
  const e = waterhaler.wezen;
  const zet = (uur) => { S.kalender.dag = bijUur(GROEI, uur); };
  zet(23);
  assert.deepEqual(T.dagAnker(S.dorp, e), { x: e.thuis.x, y: e.thuis.y, straal: 0, binnen: true });
  zet(T.dagindeling(S.kalender.dag).opstaan + 0.5);
  assert.equal(T.dagAnker(S.dorp, e), waterhaler.plek.put, 'wie water haalt, gaat \'s ochtends naar de put');
  const ander = nieuwe(S).find((p) => !p.haaltWater && p.huis === waterhaler.huis);
  assert.deepEqual(T.dagAnker(S.dorp, ander.wezen), { x: ander.wezen.thuis.x, y: ander.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal });
  zet(10);
  const herder = nieuwe(S).find((p) => p.werk && p.werk.soort === 'schaapskooi');
  assert.equal(T.dagAnker(S.dorp, herder.wezen), herder.plek.werk);
  const meent = T.meentVan(S.wereld);
  const a = herder.plek.werk;
  assert.ok(a.x >= meent.x && a.x < meent.x + meent.b && a.y >= meent.y && a.y < meent.y + meent.h, 'de herder is overdag op de heide');
  // Elk kind speelt op een eigen plek, verspreid over het hele plein.
  const kinderen = nieuwe(S).filter((p) => (p.leeftijd === 'kind' || p.leeftijd === 'jong') && !p.werk);
  const plekken = kinderen.map((p) => T.dagAnker(S.dorp, p.wezen));
  for (const a of plekken) assert.ok(T.opHetPlein(S.wereld, a.x, a.y), `een kind speelt op het plein (${a.x},${a.y})`);
  assert.ok(new Set(plekken.map((a) => a.x + ',' + a.y)).size > 1, 'niet allemaal op dezelfde plek');
  const oud = nieuwe(S).find((p) => p.leeftijd === 'oud' || p.leeftijd === 'kleuter');
  assert.equal(T.dagAnker(S.dorp, oud.wezen).straal, IN.straalBijHuis, 'een oude of een kleuter blijft bij huis');
  // 's Avonds is hij op zijn erf, of in de herberg als hij daar vanavond heen gaat (js/herberg.js; er is hier geen herberg).
  zet(20.5);
  const avond = T.gaatNaarDeHerberg(S.dorp, herder)
    ? T.herbergAnker(S.dorp, herder.wezen)
    : { x: herder.wezen.thuis.x, y: herder.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal };
  assert.deepEqual(T.dagAnker(S.dorp, herder.wezen), avond);
});

test('in het proefdorp is iedereen \'s nachts binnen, overdag waar hij hoort, en \'s avonds thuis', () => {
  // Met een vast zaad, zodat de toets elke keer dezelfde dag speelt (Marcel, 4 okt, vraag 114, E: "zodat een push er
  // niet op stukloopt"). Ongezaaid faalde hij in 7 van de 200 dagen, en het was steeds een paar dat een praatje maakte
  // (js/praatje.js, vraag 120): wie vrij is, blijft onderweg staan voor een bekende, en loopt daarna terug.
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  try {
    const S = proef({ dag: bijUur(GROEI, 4), snelheid: 10 });
    const binnen = (p) => p.wezen.binnen;
    // Waar hij hoort: binnen de straal van zijn plek, of, als hij daar naar binnen hoort, binnen, of voor die deur. Of
    // hij praat, of praatte net en loopt terug (e.praatRust).
    const binnenStraal = (p) => {
      if (p.wezen.praatje || p.wezen.praatRust > S.kalender.dag) return true;
      const a = T.dagAnker(S.dorp, p.wezen);
      return !!a && (T.afstand(a, opTegel(p.wezen)) <= a.straal || (a.binnen && (p.wezen.binnen || T.afstand(a, opTegel(p.wezen)) <= 1)));
    };
    loopTot(S, bijUur(GROEI, 11));
    const verkeerd = nieuwe(S).filter((p) => !binnenStraal(p));
    assert.ok(verkeerd.length <= 1, `om elf uur is (bijna) iedereen waar hij hoort; niet: ${verkeerd.map((p) => p.naam).join(', ')}`);
    loopTot(S, bijUur(GROEI, 21.5));
    const nietThuis = nieuwe(S).filter((p) => !binnenStraal(p));
    assert.ok(nietThuis.length <= 1, `'s avonds is (bijna) iedereen op zijn erf; niet: ${nietThuis.map((p) => p.naam).join(', ')}`);
    loopTot(S, bijUur(GROEI + 1, 2));
    const buiten = nieuwe(S).filter((p) => !binnen(p));
    assert.equal(buiten.length, 0, `'s nachts is iedereen binnen; niet: ${buiten.map((p) => p.naam).join(', ')}`);
  } finally {
    Math.random = toeval;
  }
});

test('staat de schout in zijn deur, dan gaat zijn gezin vanaf de tegel ernaast naar binnen', () => {
  const S = proef({ dag: bijUur(GROEI, 20), snelheid: 10 });
  const huis = S.dorp.gebouwen.find((g) => g.soort === 'schout');
  const deur = T.deurVan(S.wereld, huis);
  // In het proefdorp staat de schout nog op de weg waar de kar hem bracht: zet hem voor zijn eigen deur.
  Object.assign(S.schout, { x: deur.x, y: deur.y, tx: deur.x, ty: deur.y, pad: [], onderweg: false });
  assert.deepEqual(opTegel(S.schout), deur, 'de schout staat voor zijn eigen deur');
  loopTot(S, bijUur(GROEI + 1, 2));
  for (const p of inHuis(S, huis)) if (!p.schout) assert.ok(p.wezen.binnen, `${p.naam} is binnen`);
});

// ---------------------------------------------------------------------------------------------
// Een pad naar een plek met een straal, en wie het is
// ---------------------------------------------------------------------------------------------

test('T.zoekPad met tot: het pad eindigt binnen de straal, ook als het doel zelf bezet is', () => {
  const bezet = (x, y) => x === 5 && y === 0;
  const mag = (x, y) => x >= 0 && x < 10 && y >= 0 && y < 10 && !bezet(x, y);
  const vast = () => false;
  assert.equal(T.zoekPad({ x: 0, y: 0 }, { x: 5, y: 0 }, mag, vast, {}), null, 'naar het bezette doel zelf is geen weg');
  const pad = T.zoekPad({ x: 0, y: 0 }, { x: 5, y: 0 }, mag, vast, { tot: 2 });
  const eind = pad[pad.length - 1];
  assert.ok(T.afstand(eind, { x: 5, y: 0 }) <= 2);
  assert.equal(pad.length, 3, 'en niet verder dan nodig');
});

// ---------------------------------------------------------------------------------------------
// Werk telt in uren (stuk 2; Marcel koos op 26 sep de looptijd)
// ---------------------------------------------------------------------------------------------

// Het proefdorp met een kleiput zo ver mogelijk van alle huizen (op een plek die je wel kunt
// bereiken), en wie er werkt. (Geen houthakker: die staat stil waar geen boom is, en het gaat hier om de uren.)
function kleiputVerWeg(opties) {
  const S = proef(opties);
  const w = S.wereld;
  const deuren = S.dorp.gebouwen.filter((g) => T.GEBOUWEN[g.soort].woonruimte > 0).map((g) => T.deurVan(w, g));
  let plek = null;
  let ver = -1;
  const K = T.kaartVak(w);
  for (let y = K.y + 1; y < K.y + K.h - 1; y++) {
    for (let x = K.x + 1; x < K.x + K.b - 1; x++) {
      let vrij = true;
      for (let dy = -1; dy <= 1 && vrij; dy++) for (let dx = -1; dx <= 1 && vrij; dx++) if (T.isVast(w, x + dx, y + dy)) vrij = false;
      const a = vrij ? Math.min(...deuren.map((d) => T.afstand(d, { x, y }))) : -1;
      if (a > ver && T.zoekPad(deuren[0], { x, y }, (px, py) => T.isBegaanbaar(w, px, py), (px, py) => T.isVast(w, px, py), {})) {
        ver = a;
        plek = { x, y };
      }
    }
  }
  const g = { soort: 'kleiput', x: plek.x, y: plek.y, voet: { b: 1, h: 1 }, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
  S.dorp.gebouwen.push(g);
  T.verdeelHanden(S.dorp);
  return { S, g, p: mensen(S).find((x) => x.werk === g) };
}

test('werk in uren: de weg heen is de weg die zijn poppetje loopt, met zijn eigen snelheid', () => {
  const { S, g, p } = kleiputVerWeg();
  assert.ok(p, 'de kleiput heeft een hand');
  const w = S.wereld;
  const deur = T.deurVan(w, p.huis);
  const doel = p.plek.werk;
  // de weg zoals het dwalen hem vraagt: naar een plek waar velen heen gaan, uit een veld (js/lopen.js)
  const pad = T.zoekRoute(w, deur, doel, { tot: doel.straal, veld: true });
  let lengte = 0;
  let vorig = deur;
  for (const t of pad) {
    lengte += Math.hypot(t.x - vorig.x, t.y - vorig.y);
    vorig = t;
  }
  const uur = T.DAG_LENGTE / 24;
  assert.ok(Math.abs(p.plek.heen - lengte / p.wezen.snelheid / uur) < 1e-9, `${p.plek.heen} uur onderweg`);
  assert.ok(p.plek.heen > 1, 'zo ver weg is hij meer dan een uur onderweg');
  // Wie op zijn eigen boerderij werkt, is niet onderweg.
  const thuis = mensen(S).find((x) => x.werk && x.werk === x.huis && x.plek);
  assert.ok(thuis && thuis.plek.heen < 0.2, 'op het eigen erf: nauwelijks onderweg');

  const dag = Math.floor(S.kalender.dag);
  const d = T.dagindeling(dag);
  const perHand = d.werkEind - d.werkBegin - (d.schaftEind - d.schaftBegin);
  const u = T.werkUrenVan(S.dorp, g, dag);
  assert.equal(u.nodig, perHand);
  assert.ok(Math.abs(u.onderweg - p.plek.heen) < 1e-9 && Math.abs(u.gewerkt - (perHand - p.plek.heen)) < 1e-9);
  // In de winter zijn de werkdagen korter, en telt dezelfde weg zwaarder.
  const winter = dagVan('louwmaand', 15);
  const uw = T.werkUrenVan(S.dorp, g, winter);
  assert.ok(uw.onderweg / uw.nodig > u.onderweg / u.nodig, 'in de winter weegt de weg zwaarder');
  // Wie vandaag pas komt, werkt nog niet.
  p.komt = true;
  assert.equal(T.werkUrenVan(S.dorp, g, dag).gewerkt, 0);
});

test('werk in uren: de werkplaats maakt naar de uren dat er gewerkt wordt, en zegt het bij de muis', () => {
  const ver = kleiputVerWeg();
  const D = ver.S.dorp;
  const dag = Math.floor(ver.S.kalender.dag) + 1;
  const IN = T.BEHOEFTEN_INSTELLINGEN;
  T.zetVoorraad(D, 'gereedschap', 0); // het proefdorp heeft gereedschap, en dat versnelt het werk: hier telt alleen de weg
  T.tikGebouwenDag(D, dag);
  // Hoe hard het dorp werkt, naar de afwisseling (js/behoeften.js): dat is wat een hele dag zou geven.
  const heleDag = T.werkVanAfwisseling(D);
  const u = ver.g.uren;
  assert.ok(u && u.onderweg > 0.5, 'zijn hand is een tijd onderweg');
  assert.ok(ver.g.werkte > 0 && ver.g.werkte < heleDag, 'en dus werkt het minder dan een hele dag');
  assert.ok(Math.abs(ver.g.werkte - heleDag * (u.gewerkt / u.nodig)) < 1e-9, 'naar de uren onderweg');
  assert.match(T.gebouwToestand(D, ver.g), /at work \(1 of 1 hands\), \d+ of \d+ hours worked; \d+ hours on the road\.$/);
});

test('bij de muis staat wie het is', () => {
  const S = proef({ gebouwen: ['schaapskooi'] });
  const herder = nieuwe(S).find((p) => p.werk && p.werk.soort === 'schaapskooi');
  const tekst = T.overBewonerTekst(S.dorp, herder.wezen);
  assert.match(tekst, new RegExp(`^${herder.naam}(, .+)? · shepherd$`), 'de naam, en wat hij of zij doet');
  // Wie bij een boer hoort, heet naar de boer: "Rose, daughter of Edmund".
  const bijBoer = nieuwe(S).find((p) => p.hoofd && T.isBoer(S.dorp, p.hoofd));
  assert.match(T.overBewonerTekst(S.dorp, bijBoer.wezen), new RegExp(`^${bijBoer.naam}, [a-z-]+ of ${T.naamVanBewoner(bijBoer.hoofd)}`));
  const vrouw = nieuwe(S).find((p) => p.hoofd && p.hoofd.schout && p.band === 'vrouw');
  assert.equal(T.overBewonerTekst(S.dorp, vrouw.wezen), `${vrouw.naam}, wife of the reeve`);
  const h = T.handelingVerkennen(S, { wezen: herder.wezen });
  assert.equal(h.tekst, tekst);
  assert.equal(T.overBewonerTekst(S.dorp, S.schout), '', 'de schout zelf niet');
});
