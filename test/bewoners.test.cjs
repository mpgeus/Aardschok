// De bewoners (js/bewoners.js, sinds 26 sep): wie er in het gehucht woont, met wie en in welk huis,
// wie waar werkt, en het ritme van de dag voor iedereen (T.dagAnker in js/dag.js). Zie
// ontwerp/spel.md, "Mensen worden poppetjes", en de werklijst, punt 3b, stap 2.
const test = require('node:test');
const assert = require('node:assert/strict');

for (const f of [
  'js/tijd.js', 'js/dag.js', 'js/voorraad.js', 'js/wereld.js', 'beelden/beschrijving.js', 'tegels/tegels.js',
  'kaarten/kaarten.js', 'js/mensen.js', 'js/vee.js', 'js/gebouwen.js', 'js/behoeften.js', 'js/handel.js',
  'js/heer.js', 'js/inner.js', 'js/verstoppen.js', 'js/kaart.js', 'js/gebied.js', 'js/pad.js', 'js/akkers.js',
  'js/boeren.js', 'js/bewoners.js', 'js/anim.js', 'js/verkennen.js',
]) require('../' + f);
const T = globalThis.Spel;
const IN = T.BEWONERS_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const GROEI = dagVan('bloeimaand', 10);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht. Met `karakters` ({ boer2: 'grijsaard' }) wordt er niet geloot, en heeft elke
// boer het karakter zoals het in T.MENSEN staat, of zoals het hier gezet wordt.
function gehucht(opties = {}) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  const was = {};
  console.warn = () => {};
  if (opties.karakters) {
    T.BOEREN_INSTELLINGEN.loten = false;
    for (const id in opties.karakters) {
      was[id] = T.MENSEN[id].karakter;
      T.MENSEN[id].karakter = opties.karakters[id];
    }
  }
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    for (const id in was) T.MENSEN[id].karakter = was[id];
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  S.kalender = { dag: opties.dag != null ? opties.dag : bijUur(GROEI, 7), snelheid: opties.snelheid || 1 };
  return S;
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  T.werkBewonersBij(S);
  T.werkAnimatiesBij(S, dt, dtW);
  T.werkOogstBij(S, dtW);
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
const mensen = (S) => S.bewoners.mensen;
const nieuwe = (S) => mensen(S).filter((p) => !p.schout && !p.wie); // wie hier een poppetje kreeg
const vanSchout = (p) => !!(p.schout || (p.hoofd && p.hoofd.schout));
const inHuis = (S, g) => mensen(S).filter((p) => p.huis === g);
const opTegel = (e) => ({ x: e.tx, y: e.ty });
// Een vrije plek op de kaart voor een voet, met een rand eromheen, zo dicht mogelijk bij `bij`: zo
// breekt een nieuwe indeling van het gehucht de toetsen niet (26 sep: een plein, meer ruimte).
function vrijePlek(S, voet, bij) {
  const w = S.wereld;
  let beste = null;
  let afstand = Infinity;
  for (let y = 1; y + voet.h < w.h; y++) {
    for (let x = 1; x + voet.b < w.b; x++) {
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
// Een huis erbij, op een vrije plek bij de brink, klaar om in te wonen.
function bouwHuis(S) {
  const voet = T.gebouwVoet('huis');
  const plek = vrijePlek(S, voet, T.brinkVan(S.wereld));
  const huis = { soort: 'huis', x: plek.x, y: plek.y, voet, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
  S.gebouwen.push(huis);
  return huis;
}

// ---------------------------------------------------------------------------------------------
// Wie er woont
// ---------------------------------------------------------------------------------------------

test('bij een nieuw spel is er één bewoner per mond, elk met een huis en een poppetje', () => {
  const S = gehucht();
  assert.equal(S.bevolking, 25);
  assert.equal(mensen(S).length, S.bevolking, 'het getal in de balk blijft de waarheid');
  for (const g of S.gebouwen) {
    const ruimte = T.GEBOUWEN[g.soort].woonruimte || 0;
    if (ruimte) assert.equal(inHuis(S, g).length, ruimte, `${g.soort} ${g.huis} staat vol`);
  }
  for (const p of mensen(S)) {
    assert.ok(p.wezen, `${p.id} heeft een poppetje`);
    assert.ok(S.wereld.wezens.includes(p.wezen), `${p.id} staat in de wereld`);
  }
  assert.equal(nieuwe(S).length, 19, 'de schout en de vijf boeren stonden er al; de rest is nieuw');
  const namen = nieuwe(S).map((p) => p.naam);
  assert.equal(new Set(namen).size, namen.length, 'geen twee dezelfde namen');
  for (const p of nieuwe(S)) {
    assert.ok(p.hoofd && p.band, `${p.naam} hoort bij een gezin`);
    assert.equal(p.huis, p.hoofd.huis, `${p.naam} woont bij zijn gezin`);
    assert.equal(p.wezen.bewoner, p);
    assert.equal(p.wezen.vel, T.LEEFTIJDEN[p.leeftijd][p.geslacht], `${p.naam} draagt het vel van zijn leeftijd`);
  }
});

test('de schout woont met zijn vrouw en drie kinderen (Marcel, vraag 27)', () => {
  const S = gehucht();
  const huis = S.gebouwen.find((g) => g.huis === 'schout');
  const gezin = inHuis(S, huis);
  assert.equal(gezin.length, 5);
  assert.ok(gezin.find((p) => p.schout && p.wezen === S.schout), 'de schout zelf, met zijn eigen wezen');
  assert.equal(gezin.filter((p) => p.band === 'vrouw' && p.leeftijd === 'volwassen').length, 1);
  assert.equal(gezin.filter((p) => p.band === 'zoon' || p.band === 'dochter').length, 3);
  assert.ok(!S.schout.bewoner, 'de schout loopt waar de speler wil, niet op het ritme van de dag');
});

test('het gezin past bij het karakter: de weduwe heeft drie kleine kinderen, de oudste woont bij zijn zoon', () => {
  const S = gehucht({ karakters: { boer2: 'weduwe', boer3: 'grijsaard' } });
  const huisVan = (id) => S.gebouwen.find((g) => g.huis === id);
  const weduwe = inHuis(S, huisVan('boer2'));
  assert.equal(weduwe.length, 4);
  assert.ok(!weduwe.some((p) => p.band === 'man'), 'geen man');
  assert.equal(weduwe.filter((p) => p.leeftijd === 'kind' || p.leeftijd === 'kleuter').length, 3, 'drie kleine kinderen');
  const oudste = inHuis(S, huisVan('boer3'));
  assert.equal(oudste.find((p) => p.wie).leeftijd, 'oud');
  assert.ok(oudste.some((p) => p.band === 'zoon' && p.leeftijd === 'volwassen'));
  assert.ok(oudste.some((p) => p.band === 'schoondochter'));
});

// ---------------------------------------------------------------------------------------------
// Wie werkt
// ---------------------------------------------------------------------------------------------

test('wie werkt: elke hand is een mens, de boer op zijn eigen land, en de herder is een boerenzoon', () => {
  for (let ronde = 0; ronde < 8; ronde++) {
    const S = gehucht();
    const handen = S.gebouwen.reduce((n, g) => n + (g.handen || 0), 0);
    assert.equal(handen, 11, 'twee per boerderij en een herder');
    const werkers = mensen(S).filter((p) => p.werk);
    assert.equal(werkers.length, handen, 'elke hand is iemand');
    for (const g of S.gebouwen) assert.equal(werkers.filter((p) => p.werk === g).length, g.handen || 0, `${g.soort} ${g.huis}`);
    for (const p of mensen(S).filter((x) => x.wie)) assert.equal(p.werk, p.huis, `${p.wie} werkt op zijn eigen boerderij`);
    const herder = werkers.find((p) => p.werk.soort === 'schaapskooi');
    assert.ok(herder.leeftijd === 'jong' && herder.band === 'zoon' && herder.hoofd.wie, `de herder is een boerenzoon (${herder.naam})`);
    assert.ok(!werkers.some((p) => p.leeftijd === 'kleuter'), 'geen kleuter');
    assert.ok(!werkers.some(vanSchout), 'het gezin van de schout werkt niet voor het dorp zolang er anderen zijn');
  }
});

test('T.werkendeHanden: wie kan werken, en zonder bewoners het hele getal', () => {
  assert.equal(T.werkendeHanden({ bevolking: 7 }), 7, 'zonder bewoners, zoals vóór de poppetjes');
  const S = gehucht();
  const kleuters = mensen(S).filter((p) => p.leeftijd === 'kleuter').length;
  assert.equal(T.werkendeHanden(S), 25 - 1 - kleuters, 'iedereen behalve de schout en de kleuters');
});

test('wie werk heeft, houdt het, en een nieuwe werkplaats krijgt de vrije hand die het best past', () => {
  const S = gehucht();
  const voor = new Map(mensen(S).map((p) => [p, p.werk]));
  T.verdeelHanden(S);
  T.verdeelHanden(S);
  for (const p of mensen(S)) assert.equal(p.werk, voor.get(p), `${p.naam || p.wie} houdt zijn werk`);
  // Een houthakker bij de boerderij van boer 1.
  const plek = vrijePlek(S, { b: 1, h: 1 }, T.deurVan(S.wereld, S.gebouwen.find((x) => x.huis === 'boer1')));
  const g = { soort: 'houthakker', x: plek.x, y: plek.y, voet: { b: 1, h: 1 }, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
  S.gebouwen.push(g);
  const vrij = mensen(S).filter((p) => !p.werk && p.leeftijd !== 'kleuter' && !vanSchout(p));
  T.verdeelHanden(S);
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
  const S = gehucht();
  const huis = bouwHuis(S);
  assert.equal(T.wijzigBevolking(S, 4, 'groei'), 4);
  assert.equal(mensen(S).length, S.bevolking);
  const gezin = inHuis(S, huis);
  assert.equal(gezin.length, 4, 'het nieuwe gezin woont samen in het nieuwe huis');
  // Het komt overdag over de weg binnen (hieronder, "Komen en gaan"); tot dan is het onderweg.
  assert.ok(gezin.every((p) => p.komt && !p.wezen), 'nog onderweg hierheen');
  const hoofd = gezin.find((p) => !p.hoofd);
  assert.ok(hoofd && gezin.some((p) => p.band === 'vrouw'), 'een man en zijn vrouw, met kinderen');

  const ouden = mensen(S).filter((p) => p.leeftijd === 'oud' && !p.wie).length;
  const weg = nieuwe(S).filter((p) => p.leeftijd === 'oud');
  T.wijzigBevolking(S, -1, 'winter');
  assert.equal(mensen(S).filter((p) => p.leeftijd === 'oud' && !p.wie).length, Math.max(0, ouden - 1), 'de winter neemt eerst een oude');
  assert.equal(mensen(S).length, S.bevolking);
  for (const p of weg) if (!mensen(S).includes(p)) assert.ok(!S.wereld.wezens.includes(p.wezen), 'zijn poppetje is weg');

  T.wijzigBevolking(S, -4, 'vertrek');
  assert.equal(inHuis(S, huis).length, 0, 'het gezin dat het laatst kwam, trekt weer weg');
  assert.equal(mensen(S).length, S.bevolking);
  assert.ok(mensen(S).find((p) => p.schout), 'de schout blijft');
  assert.equal(mensen(S).filter((p) => p.wie).length, 5, 'de boeren blijven');
});

// ---------------------------------------------------------------------------------------------
// Komen en gaan (stuk 2): je ziet het, en het bericht zegt wie het zijn
// ---------------------------------------------------------------------------------------------

test('komen: een nieuw gezin komt overdag over de weg binnen, met een bericht op naam, en loopt naar zijn huis', () => {
  const S = gehucht(); // om zeven uur
  const berichten = vangBerichten();
  const huis = bouwHuis(S);
  T.wijzigBevolking(S, 4, 'groei');
  const gezin = inHuis(S, huis);
  T.werkBewonersBij(S);
  assert.ok(gezin.every((p) => !p.wezen), 'vóór het bezoekuur is er nog niemand');
  assert.equal(berichten.length, 0);
  S.kalender.dag = bijUur(GROEI, T.DAG_INSTELLINGEN.bezoekUur + 0.1);
  T.werkBewonersBij(S);
  const weg = T.wegInEnUit(S.wereld);
  for (const p of gezin) {
    assert.ok(p.wezen && S.wereld.wezens.includes(p.wezen), 'nu met een poppetje');
    assert.ok(T.afstand(weg, opTegel(p.wezen)) <= 3, 'op de weg, aan de rand van de kaart');
    const erf = { x: p.wezen.thuis.x, y: p.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal };
    assert.deepEqual(T.dagAnker(S, p.wezen), erf, 'eerst naar zijn huis, ook met werk');
  }
  assert.equal(berichten.length, 1);
  assert.match(berichten[0], /nieuw gezin over de weg/);
  assert.ok(berichten[0].includes(gezin.find((p) => !p.hoofd).naam), 'het bericht zegt wie het zijn');
  assert.match(T.overBewonerTekst(S, gezin[0].wezen), /nieuw in het gehucht/);
  T.werkBewonersBij(S);
  assert.equal(berichten.length, 1, 'het bericht komt één keer');
  loopTotDat(S, () => gezin.every((p) => !p.komt), 5);
  assert.ok(gezin.every((p) => !p.komt), 'binnen vijf uur zijn ze allemaal thuis');
  // Daarna volgen ze de dag, zoals iedereen: wie het eerst thuis was, is al naar zijn plek voor overdag.
  for (const p of gezin) assert.equal(T.dagAnker(S, p.wezen), p.plek.werk || p.plek.vrij);
});

test('gaan: wie wegtrekt, telt meteen niet meer mee, gaat bij het licht, loopt de weg af en verlaat de kaart', () => {
  const S = gehucht();
  const huis = bouwHuis(S);
  T.wijzigBevolking(S, 4, 'groei');
  const gezin = inHuis(S, huis);
  S.kalender.dag = bijUur(GROEI, 10);
  loopTotDat(S, () => gezin.every((p) => !p.komt), 5);
  // 's Nachts besloten: ze gaan pas als het licht is.
  S.kalender.dag = bijUur(GROEI + 1, 23);
  const berichten = vangBerichten();
  T.wijzigBevolking(S, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  assert.equal(inHuis(S, huis).length, 0, 'ze wonen er niet meer');
  assert.equal(mensen(S).length, S.bevolking);
  assert.equal(berichten.length, 1);
  assert.match(berichten[0], /, trekken weg: het dorp is niet tevreden genoeg\. \(-4\)$/);
  assert.ok(berichten[0].startsWith(`${gezin.find((p) => !p.hoofd).naam} en `), 'het gezin bij naam');
  for (const p of gezin) {
    assert.ok(S.wereld.wezens.includes(p.wezen), 'zijn poppetje is er nog');
    assert.equal(p.werk, null, 'hij werkt nergens meer');
    assert.ok(T.dagAnker(S, p.wezen).binnen, "'s nachts nog binnen");
  }
  S.kalender.dag = bijUur(GROEI + 2, 10);
  const uitgang = T.wegInEnUit(S.wereld);
  for (const p of gezin) assert.deepEqual(T.dagAnker(S, p.wezen), { x: uitgang.x, y: uitgang.y, straal: 1 }, 'overdag naar de uitgang');
  assert.match(T.overBewonerTekst(S, gezin[0].wezen), /trekt weg$/);
  loopTotDat(S, () => !S.bewoners.vertrekken.length, 5);
  assert.ok(gezin.every((p) => !S.wereld.wezens.includes(p.wezen)), 'bij de uitgang gaan ze van de kaart');
});

test('sterven: het bericht zegt wie het is, en wie hij voor iemand was', () => {
  const S = gehucht();
  const berichten = vangBerichten();
  const voor = mensen(S).slice();
  T.wijzigBevolking(S, -1, 'winter', 'De winter is hard');
  const dood = voor.find((p) => !mensen(S).includes(p));
  assert.equal(berichten.length, 1);
  assert.ok(berichten[0].startsWith('De winter is hard: '), berichten[0]);
  assert.ok(berichten[0].includes(dood.naam) && berichten[0].endsWith(' is gestorven.'), berichten[0]);
  if (dood.hoofd) assert.ok(berichten[0].includes(`${dood.band} van `), 'met wie hij voor iemand was');
  if (dood.leeftijd === 'oud') assert.ok(berichten[0].includes(`de oude ${dood.naam}`));
  T.wijzigBevolking(S, -2, 'winter', 'De honger is hard');
  assert.ok(berichten[1].startsWith('De honger is hard: ') && berichten[1].endsWith(' zijn gestorven.'), berichten[1]);
  // "de oude Geesje, moeder van Wouter, en de oude Swaantje, ...": een bijstelling sluit met een komma.
  const [eerste] = berichten[1].slice('De honger is hard: '.length).split(' en ');
  if (eerste.includes(',')) assert.ok(eerste.endsWith(','), berichten[1]);
  // Zonder `waarom` (het begin, een toets) geen bericht.
  T.wijzigBevolking(S, -1, 'winter');
  assert.equal(berichten.length, 2);
});

// ---------------------------------------------------------------------------------------------
// Het ritme van de dag
// ---------------------------------------------------------------------------------------------

test('T.dagAnker voor een bewoner: \'s nachts binnen, \'s ochtends de put of het erf, overdag werk of vrij', () => {
  const S = gehucht();
  const waterhaler = nieuwe(S).find((p) => p.haaltWater);
  const e = waterhaler.wezen;
  const zet = (uur) => { S.kalender.dag = bijUur(GROEI, uur); };
  zet(23);
  assert.deepEqual(T.dagAnker(S, e), { x: e.thuis.x, y: e.thuis.y, straal: 0, binnen: true });
  zet(T.dagindeling(S.kalender.dag).opstaan + 0.5);
  assert.equal(T.dagAnker(S, e), waterhaler.plek.put, 'wie water haalt, gaat \'s ochtends naar de put');
  const ander = nieuwe(S).find((p) => !p.haaltWater && p.huis === waterhaler.huis);
  assert.deepEqual(T.dagAnker(S, ander.wezen), { x: ander.wezen.thuis.x, y: ander.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal });
  zet(10);
  const herder = nieuwe(S).find((p) => p.werk && p.werk.soort === 'schaapskooi');
  assert.equal(T.dagAnker(S, herder.wezen), herder.plek.werk);
  const meent = T.meentVan(S.wereld);
  const a = herder.plek.werk;
  assert.ok(a.x >= meent.x && a.x < meent.x + meent.b && a.y >= meent.y && a.y < meent.y + meent.h, 'de herder is overdag op de heide');
  const kind = nieuwe(S).find((p) => (p.leeftijd === 'kind' || p.leeftijd === 'jong') && !p.werk);
  assert.ok(T.afstand(T.dagAnker(S, kind.wezen), T.brinkVan(S.wereld)) <= 1, 'een kind speelt op de brink');
  const oud = nieuwe(S).find((p) => p.leeftijd === 'oud' || p.leeftijd === 'kleuter');
  assert.equal(T.dagAnker(S, oud.wezen).straal, IN.straalBijHuis, 'een oude of een kleuter blijft bij huis');
  zet(20.5);
  assert.deepEqual(T.dagAnker(S, herder.wezen), { x: herder.wezen.thuis.x, y: herder.wezen.thuis.y, straal: T.DAG_INSTELLINGEN.erfStraal });
});

test('in het gehucht is iedereen \'s nachts binnen, overdag waar hij hoort, en \'s avonds thuis', () => {
  const S = gehucht({ dag: bijUur(GROEI, 4), snelheid: 10 });
  const binnen = (p) => p.wezen.binnen;
  const binnenStraal = (p) => {
    const a = T.dagAnker(S, p.wezen);
    return a && T.afstand(a, opTegel(p.wezen)) <= a.straal;
  };
  loopTot(S, bijUur(GROEI, 11));
  const verkeerd = nieuwe(S).filter((p) => !binnenStraal(p));
  assert.ok(verkeerd.length <= 1, `om elf uur is (bijna) iedereen waar hij hoort; niet: ${verkeerd.map((p) => p.naam).join(', ')}`);
  loopTot(S, bijUur(GROEI, 21.5));
  assert.ok(nieuwe(S).filter((p) => !binnenStraal(p)).length <= 1, '\'s avonds is (bijna) iedereen op zijn erf');
  loopTot(S, bijUur(GROEI, 23.5));
  const buiten = nieuwe(S).filter((p) => !binnen(p));
  assert.equal(buiten.length, 0, `'s nachts is iedereen binnen; niet: ${buiten.map((p) => p.naam).join(', ')}`);
});

test('staat de schout in zijn deur, dan gaat zijn gezin vanaf de tegel ernaast naar binnen', () => {
  const S = gehucht({ dag: bijUur(GROEI, 20), snelheid: 10 });
  const huis = S.gebouwen.find((g) => g.huis === 'schout');
  const deur = T.deurVan(S.wereld, huis);
  assert.deepEqual(opTegel(S.schout), deur, 'de schout begint voor zijn eigen deur');
  loopTot(S, bijUur(GROEI, 23.5));
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

test('bij de muis staat wie het is', () => {
  const S = gehucht();
  const herder = nieuwe(S).find((p) => p.werk && p.werk.soort === 'schaapskooi');
  const tekst = T.overBewonerTekst(S, herder.wezen);
  assert.match(tekst, new RegExp(`^${herder.naam}, zoon van ${T.naamVanMens(herder.hoofd.wie)} · herder$`));
  const vrouw = nieuwe(S).find((p) => p.hoofd.schout && p.band === 'vrouw');
  assert.equal(T.overBewonerTekst(S, vrouw.wezen), `${vrouw.naam}, vrouw van de schout`);
  const h = T.handelingVerkennen(S, { wezen: herder.wezen });
  assert.equal(h.tekst, tekst);
  assert.equal(T.overBewonerTekst(S, S.schout), '', 'de schout zelf niet');
});
