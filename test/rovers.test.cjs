// De rovers en de militie (js/rovers.js, en het gevecht voor een groep in js/gevecht.js; werklijst vraag 55, Marcel,
// 29 sep: "A, Ja en ook 'wilde' rovers. B, ze roven de velden, graan etc ook maken ze soms velden kapot. C, Ja. D,
// mensen kunnen sterven").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het echte gehucht, zoals een nieuw spel begint, stil (zoals in test/treden.test.cjs), met een vast zaad.
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, trede: 'gehucht' };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  S.lot = Object.assign(S.lot || {}, { zaad: 7 });
  return S;
}

function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
  e.pad = [];
  e.onderweg = false;
}
const opUur = (S, dag, uur) => {
  S.kalender.dag = dag + uur / 24;
};

// Een aanval die meteen begint (zoals Spel.debug.rovers), met zoveel wilde rovers.
function aanval(S, aantal) {
  S.rovers = S.rovers || T.nieuweRovers();
  S.rovers.aanval = { soort: 'wild', dag: Math.floor(S.kalender.dag), fase: 'wacht', aantal, meteen: true };
  T.werkRoversBij(S);
  return S.rovers.aanval;
}

// Een wachthuis met zijn twee mannen (T.verdeelHanden en T.wijsWerkToe, js/gebouwen.js en js/bewoners.js).
function metWachthuis(S) {
  S.voorraad.hout = 100;
  S.voorraad.goud = 100;
  const r = T.plaatsGebouw(S, 'wachthuis', 49, 51);
  assert.equal(r.gelukt, true, r.reden);
  r.instantie.klaar = true;
  T.verdeelHanden(S);
  const mannen = S.bewoners.mensen.filter((p) => p.werk === r.instantie);
  assert.equal(mannen.length, 2, 'het wachthuis heeft twee handen');
  return mannen.map((p) => p.wezen);
}

test('wie wegtrekt, gaat het bos in: de jongeren en volwassenen worden rover, met hun naam', () => {
  const S = gehucht();
  opUur(S, 30, 10);
  const voor = S.bewoners.mensen.slice();
  T.wijzigBevolking(S, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  const weg = voor.filter((p) => !S.bewoners.mensen.includes(p));
  const groot = weg.filter((p) => p.leeftijd === 'jong' || p.leeftijd === 'volwassen');
  assert.ok(groot.length > 0, 'er trekt iemand weg die rover kan worden');
  assert.deepEqual(S.rovers.bende.map((l) => l.naam), groot.map((p) => p.naam));
  assert.equal(S.rovers.bendeOp, 30 + T.ROVERS_INSTELLINGEN.terugNaDagen);
});

test('de bende komt terug op de dag die het zegt, tegen de avond, van de rand van de kaart, en het dorp ziet ze', () => {
  const S = gehucht();
  opUur(S, 30, 10);
  T.wijzigBevolking(S, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  const bende = S.rovers.bende.map((l) => l.naam);
  T.tikRoversDag(S, 39);
  assert.equal(S.rovers.aanval, null, 'nog niet');
  T.tikRoversDag(S, 40);
  assert.equal(S.rovers.aanval.soort, 'bende');
  opUur(S, 40, 16);
  T.werkRoversBij(S);
  assert.equal(S.rovers.aanval.fase, 'wacht', 'niet voor het uur');
  opUur(S, 40, 17.5);
  berichten.length = 0;
  T.werkRoversBij(S);
  const A = S.rovers.aanval;
  const w = S.wereld;
  assert.equal(A.fase, 'komen');
  assert.equal(A.rovers.length, bende.length);
  for (const e of A.rovers) {
    assert.ok(w.wezens.includes(e));
    assert.equal(e.kant, 'monster');
    assert.equal(e.rover, true);
  }
  assert.ok(A.ingang.x === 0 || A.ingang.y === 0 || A.ingang.x === w.b - 1 || A.ingang.y === w.h - 1, 'aan de rand');
  assert.equal(T.bestemmingVan(w.akkers[A.veld]), 'akker', 'ze gaan naar een akker, niet naar een weide');
  assert.ok(berichten.some((t) => /^Rovers!/.test(t) && t.includes(bende[0])), berichten.join(' | '));
  assert.equal(S.kalender.snelheid, 1, 'de tijd gaat naar 1×');
  // Een rover die valt, is uit de bende.
  T.raak(S, A.rovers[0], 100);
  assert.equal(S.rovers.bende.length, bende.length - 1);
});

test('wilde rovers komen op een dag die vastligt per spel, niet in de eerste zestig dagen, met twee tot vier man', () => {
  const S = gehucht();
  T.tikRoversDag(S, 1);
  const op = S.rovers.wildeOp;
  assert.ok(op >= 1 + T.ROVERS_INSTELLINGEN.eersteWildeNa, `dag ${op}`);
  const S2 = gehucht();
  T.tikRoversDag(S2, 1);
  assert.equal(S2.rovers.wildeOp, op, 'hetzelfde zaad, dezelfde dag');
  for (let d = 2; d < op; d++) T.tikRoversDag(S, d);
  assert.equal(S.rovers.aanval, null);
  T.tikRoversDag(S, op);
  const A = S.rovers.aanval;
  assert.equal(A.soort, 'wild');
  assert.ok(A.aantal >= 2 && A.aantal <= 4, `${A.aantal} man`);
  assert.ok(S.rovers.wildeOp > op, 'en daarna komen ze weer');
});

test('rovers die de akker halen, roven er graan en gaan weer weg', () => {
  const S = gehucht();
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  assert.equal(A.fase, 'komen');
  const veld = S.wereld.akkers[A.veld];
  zet(A.rovers[0], veld.x, veld.y);
  T.werkRoversBij(S);
  assert.equal(A.fase, 'roven');
  const graan = S.voorraad.graan;
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.roofUren + 0.1);
  berichten.length = 0;
  T.werkRoversBij(S);
  assert.equal(A.fase, 'weg');
  assert.equal(graan - S.voorraad.graan, Math.min(graan, 2 * T.ROVERS_INSTELLINGEN.graanPerRover));
  assert.ok(berichten.some((t) => /gaan ervandoor met \d+ graan/.test(t)), berichten.join(' | '));
  for (const e of A.rovers) zet(e, A.ingang.x, A.ingang.y);
  T.werkRoversBij(S);
  assert.equal(S.rovers.aanval, null, 'ze zijn de kaart af');
  assert.ok(!S.wereld.wezens.some((e) => e.rover));
});

test('halen ze hun akker niet, dan geven ze het op en gaan ze met lege handen', () => {
  const S = gehucht();
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  const graan = S.voorraad.graan;
  for (const e of A.rovers) e.snelheid = 0; // ze komen niet vooruit
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.opUren + 0.1);
  T.werkRoversBij(S);
  assert.equal(A.fase, 'weg');
  opUur(S, 5, 17 + 2 * T.ROVERS_INSTELLINGEN.opUren + 0.2);
  T.werkRoversBij(S);
  assert.equal(S.rovers.aanval, null, 'ook de weg terug heeft een grens');
  assert.equal(S.voorraad.graan, graan, 'ze namen niets mee');
});

test('een vertrapte akker: wat erop stond, groeit dit jaar niet meer', () => {
  const S = gehucht();
  const veld = S.wereld.akkers.find((a) => T.bestemmingVan(a) === 'akker');
  const open = T.akkerOnbeslistTegels(veld).length;
  assert.ok(open > 0, 'er staat iets op');
  assert.equal(T.vertrapAkker(veld), open);
  assert.equal(T.akkerOnbeslistTegels(veld).length, 0, 'er valt niets meer te maaien');
  assert.equal(T.vertrapAkker(veld), 0, 'wat al weg is, kan niet nog eens weg');
  const weide = S.wereld.akkers.find((a) => T.bestemmingVan(a) === 'weide');
  assert.equal(T.vertrapAkker(weide), 0, 'op een weide staat geen graan');
});

test('de militie: wie in het wachthuis werkt, loopt bij een aanval met de schout mee, en vecht naast hem', () => {
  const S = gehucht();
  const [een, twee] = metWachthuis(S);
  opUur(S, 5, 17);
  const A = aanval(S, 3);
  for (const e of [een, twee]) {
    assert.equal(e.opgeroepen, true);
    assert.equal(e.kant, 'speler');
    assert.equal(e.leven, T.WEZENS.wachter.leven);
    assert.equal(T.dagAnker(S, e), null, 'zijn gewone dag telt even niet');
  }
  // De eerste staat bij de schout, de tweede nog ver weg: alleen wie dichtbij is, vecht mee.
  const h = S.schout;
  zet(een, h.tx + 1, h.ty);
  zet(twee, h.tx + 30, h.ty);
  assert.deepEqual(T.militieInGevecht(S), [een]);
  // Het gevecht: de schout, dan de wachter, dan de hele bende.
  S.overgang = { aanleiding: A.rovers[0] };
  T.beginGevecht(S);
  assert.equal(S.modus, 'gevecht');
  assert.deepEqual(S.gevecht.volgorde.slice(0, 2), [h, een]);
  assert.equal(S.gevecht.monsters.length, 3, 'de hele bende doet mee');
  assert.equal(T.aanDeBeurt(S), h);
  T.eindeBeurt(S);
  assert.equal(T.aanDeBeurt(S), een, 'na de schout is de wachter aan de beurt');
  assert.equal(T.spelerAanDeBeurt(S), true, 'en die bestuur jij');
  const hdl = T.handelingGevecht(S, { x: een.tx, y: een.ty + 1 });
  assert.equal(hdl.tekst, 'Lopen');
  assert.equal(hdl.pad[0].x, een.tx);
});

test('een rover zoekt de man van jouw kant die het dichtst bij staat', () => {
  const w = T.maakProefkamers();
  const schout = w.wezens.find((e) => e.soort === 'schout');
  const wachter = T.maakWezen('wachter', 0, 0);
  const rover = T.maakWezen('rover', 0, 0);
  w.wezens.push(wachter, rover);
  zet(schout, 1, 7);
  zet(wachter, 6, 3);
  zet(rover, 8, 3);
  const plan = T.planMonsterBeurt(w, rover, [schout, wachter]);
  assert.equal(plan.doel, wachter);
  assert.equal(plan.aanvallen, 1, 'zes punten: één stap, en dan past er één klap van drie');
});

test('wie valt, is dood: een wachter is een mond minder, en ligt er tot de volgende dag', () => {
  const S = gehucht();
  const [een] = metWachthuis(S);
  opUur(S, 5, 17);
  aanval(S, 2);
  const p = een.bewoner;
  const voor = S.bevolking;
  berichten.length = 0;
  T.raak(S, een, 100);
  assert.equal(een.dood, true);
  assert.equal(S.bevolking, voor - 1);
  assert.ok(!S.bewoners.mensen.includes(p), 'hij woont er niet meer');
  assert.ok(S.wereld.wezens.includes(een), 'hij ligt er nog');
  assert.ok(berichten.some((t) => t.includes(p.naam) && /gestorven/.test(t)), berichten.join(' | '));
  S.rovers.aanval = null;
  T.tikRoversDag(S, 6);
  assert.ok(!S.wereld.wezens.includes(een), 'de volgende dag is hij begraven');
});

test('na een nacht heeft wie het overleefde weer al zijn leven', () => {
  const S = gehucht();
  S.schout.leven = 5;
  T.tikRoversDag(S, 3);
  assert.equal(S.schout.leven, S.schout.maxLeven);
});

test('zijn alle rovers verslagen, dan is de aanval voorbij en gaat de militie naar huis', () => {
  const S = gehucht();
  const mannen = metWachthuis(S);
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  for (const e of A.rovers) T.raak(S, e, 100);
  berichten.length = 0;
  T.eindeGevecht(S, 'gewonnen');
  assert.equal(S.rovers.aanval, null);
  assert.ok(berichten.includes('De rovers zijn verslagen.'), berichten.join(' | '));
  for (const e of mannen) {
    assert.equal(e.opgeroepen, false);
    assert.equal(e.kant, 'neutraal');
  }
});

test('de bende en een aanval gaan mee in een bewaard spel', () => {
  const S = gehucht();
  opUur(S, 30, 10);
  T.wijzigBevolking(S, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  opUur(S, 31, 17);
  const A = aanval(S, 2);
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.deepEqual(S2.rovers.bende.map((l) => l.naam), S.rovers.bende.map((l) => l.naam));
  assert.equal(S2.rovers.aanval.fase, A.fase);
  for (const e of S2.rovers.aanval.rovers) assert.ok(S2.wereld.wezens.includes(e), 'een rover in de aanval is dezelfde als op de kaart');
});
