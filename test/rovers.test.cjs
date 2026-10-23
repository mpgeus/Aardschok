// De rovers (js/rovers.js; werklijst vraag 55, Marcel, 29 sep: "A, Ja en ook 'wilde' rovers. B, ze roven de velden, graan
// etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen sterven"). Het gevecht met ze staat in test/gevecht.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { leegBegin, proefDorp } = require('./grond.cjs');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, pijl() {} };

// Het proefdorp (test/grond.cjs), stil, met een vast zaad. De opties zijn die van proefDorp: wie een wachthuis nodig heeft,
// vraagt het erbij (WACHTHUIS), en wie een weide nodig heeft, vraagt `weide`.
function gehucht(opties) {
  const { S } = proefDorp(T, opties);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() }, T.schermVelden());
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  return S;
}
const WACHTHUIS = { gebouwen: ['wachthuis'] };
// Het lege begin (test/grond.cjs): nog geen akker, en ook nog geen stapel.
function leeg() {
  const { S } = leegBegin(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() }, T.schermVelden());
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  return S;
}
// Een losse stapel met `ligt` op de eerste vrije tegel een paar tegels van de huifkar.
function losseStapel(S, ligt) {
  const kar = S.dorp.begin.kar;
  for (let r = 3; r < 10; r++) {
    for (let dy = -r; dy <= r; dy++) {
      const x = Math.round(kar.tx) + r;
      const y = Math.round(kar.ty) + dy;
      if (T.isBegaanbaar(S.wereld, x, y, { wezensBlokkeren: true })) return T.legLosseStapel(S.dorp, { x, y }, ligt);
    }
  }
  throw new Error('geen plek voor een stapel');
}
// De demo aan (js/einde.js), alleen zolang `doe` loopt.
function inDeDemo(doe) {
  const was = T.DEMO_INSTELLINGEN.aan;
  T.DEMO_INSTELLINGEN.aan = true;
  try {
    return doe();
  } finally {
    T.DEMO_INSTELLINGEN.aan = was;
  }
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
  S.dorp.rovers = S.dorp.rovers || T.nieuweRovers();
  S.dorp.rovers.aanval = { soort: 'wild', dag: Math.floor(S.kalender.dag), fase: 'wacht', aantal, meteen: true };
  T.werkRoversBij(S, S.dorp);
  return S.dorp.rovers.aanval;
}

// Twee soldaten van het wachthuis van het proefdorp (WACHTHUIS; js/soldaten.js, vraag 159): het staat er af, en twee die
// geen werk hebben, worden militie (een hooivork: daarvoor hoeft er niets in de opslag te liggen).
function metWachthuis(S) {
  const huis = S.dorp.gebouwen.find((g) => g.soort === 'wachthuis');
  assert.ok(huis && huis.klaar, 'het wachthuis staat er');
  T.zetSoldaten(S.dorp, huis, 'militie', 2);
  const mannen = T.soldatenVan(S.dorp, huis);
  assert.equal(mannen.length, 2, 'het wachthuis heeft twee soldaten');
  return mannen.map((p) => p.wezen);
}

// Wie wegtrekt, gaat naar het roverskamp dat het dichtst bij het plein van zijn dorp ligt (werklijst vraag 170, stap 6a2,
// c2; Marcel, 17 okt: H2, ook als het vol is); de bende van het dorp (D.rovers.bende) is weg (D1).
test('wie wegtrekt, gaat naar het dichtste roverskamp: de jongeren en volwassenen, met hun naam (c2)', () => {
  const S = gehucht();
  opUur(S, 30, 10);
  const voor = S.dorp.bewoners.mensen.slice();
  T.wijzigBevolking(S.dorp, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  const weg = voor.filter((p) => !S.dorp.bewoners.mensen.includes(p));
  const groot = weg.filter((p) => p.leeftijd === 'jong' || p.leeftijd === 'volwassen');
  assert.ok(groot.length > 0, 'er trekt iemand weg die rover kan worden');
  const plein = T.pleinVan(S.dorp);
  const kampen = S.wereld.kampen.slice().sort((a, b) => T.afstand(a, plein) - T.afstand(b, plein));
  const uitDorp = (K) => K.bende.filter((l) => l.uit);
  assert.deepEqual(uitDorp(kampen[0]).map((l) => l.naam).sort(), groot.map((p) => p.naam).sort(), 'ze zijn in het dichtste kamp');
  assert.ok(uitDorp(kampen[0]).every((l) => l.uit === S.dorp.plek.naam), 'met het dorp waar ze vandaan komen');
  assert.equal(kampen[0].bende.length, T.ROVERS_INSTELLINGEN.kampBende + groot.length, 'bij de twee van het begin');
  for (const K of kampen.slice(1)) assert.equal(uitDorp(K).length, 0, `in kamp ${K.nr} kwam niemand`);
  assert.equal(S.dorp.rovers && S.dorp.rovers.bende, undefined, 'het dorp heeft geen bende meer');
});

// Een overval komt tot c3 van wilde rovers van de rand (D1): op de dag die het zaad zegt, op het uur van het zaad.
test('wilde rovers komen op het uur van het zaad, van de rand van de kaart, naar een akker, en het dorp ziet ze', () => {
  const S = gehucht();
  S.dorp.rovers = T.nieuweRovers();
  S.dorp.rovers.wildeOp = 40;
  T.tikRoversDag(S.dorp, 39);
  assert.equal(S.dorp.rovers.aanval, null, 'nog niet');
  T.tikRoversDag(S.dorp, 40);
  assert.equal(S.dorp.rovers.aanval.soort, 'wild');
  const uur = S.dorp.rovers.aanval.uur;
  assert.ok(uur >= 0 && uur < 24, `het uur: ${uur}`);
  opUur(S, 40, Math.max(0, uur - 0.5));
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval.fase, 'wacht', 'niet voor het uur');
  opUur(S, 40, Math.min(23.99, uur + 0.5));
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  const A = S.dorp.rovers.aanval;
  const w = S.wereld;
  assert.equal(A.fase, 'komen');
  assert.equal(A.rovers.length, A.aantal);
  for (const e of A.rovers) {
    assert.ok(w.wezens.includes(e));
    assert.equal(e.kant, 'monster');
    assert.equal(e.rover, true);
    assert.equal(e.dorp, S.dorp, 'een rover van een overval hoort bij het dorp dat hij overvalt');
  }
  const K = T.kaartVak(w);
  assert.ok(A.ingang.x === K.x || A.ingang.y === K.y || A.ingang.x === K.x + K.b - 1 || A.ingang.y === K.y + K.h - 1, 'aan de rand');
  assert.equal(T.bestemmingVan(w.akkers[A.veld]), 'akker', 'ze gaan naar een akker, niet naar een weide');
  assert.ok(berichten.some((t) => /^Robbers are coming\. Two wild robbers turn up/.test(t)), berichten.join(' | '));
  assert.equal(S.kalender.snelheid, 1, 'de tijd gaat naar 1×');
});

test('wilde rovers komen op een dag die vastligt per spel, niet in de eerste zestig dagen, het eerste jaar met twee man', () => {
  const S = gehucht();
  T.tikRoversDag(S.dorp, 1);
  const op = S.dorp.rovers.wildeOp;
  assert.ok(op >= 1 + T.ROVERS_INSTELLINGEN.eersteWildeNa, `dag ${op}`);
  const S2 = gehucht();
  T.tikRoversDag(S2.dorp, 1);
  assert.equal(S2.dorp.rovers.wildeOp, op, 'hetzelfde zaad, dezelfde dag');
  for (let d = 2; d < op; d++) T.tikRoversDag(S.dorp, d);
  assert.equal(S.dorp.rovers.aanval, null);
  T.tikRoversDag(S.dorp, op);
  const A = S.dorp.rovers.aanval;
  assert.equal(A.soort, 'wild');
  assert.ok(op < T.DAGEN_PER_JAAR, `dag ${op} ligt in het eerste jaar`);
  assert.equal(A.aantal, 2, 'het eerste jaar met twee man');
  assert.ok(S.dorp.rovers.wildeOp > op, 'en daarna komen ze weer');
});

test('ze komen op elk uur, vaker in het donker: de helft van de overvallen valt in de nacht, het uur uit het zaad (vraag 170, stap 4, D2)', () => {
  const urenVan = () => {
    const S = gehucht();
    const uit = [];
    for (let dag = 100; dag < 400; dag++) {
      S.dorp.rovers = T.nieuweRovers();
      S.dorp.rovers.wildeOp = dag;
      T.tikRoversDag(S.dorp, dag);
      uit.push([dag, S.dorp.rovers.aanval.uur]);
    }
    return uit;
  };
  const uren = urenVan();
  assert.deepEqual(urenVan(), uren, 'hetzelfde zaad, dezelfde uren');
  assert.ok(uren.every(([, u]) => u >= 0 && u < 24));
  const nacht = uren.filter(([dag, u]) => T.dagdeelVan(dag + u / 24) === 'nacht').length / uren.length;
  assert.ok(nacht > 0.4 && nacht < 0.6, `zoveel in de nacht: ${nacht}`);
  const vroeg = uren.filter(([, u]) => u < 5).length;
  const avond = uren.filter(([, u]) => u >= 12 && u < 20).length;
  assert.ok(vroeg > 0 && avond > 0, `ook na middernacht (${vroeg}) en overdag (${avond})`);
});

test('de wilde rovers bouwen langzaam op: elk jaar van je ambt een man meer, tot vier (vraag 57)', () => {
  const aantalOp = (dag) => {
    const S = gehucht();
    S.dorp.rovers = T.nieuweRovers();
    S.dorp.rovers.wildeOp = dag;
    T.tikRoversDag(S.dorp, dag);
    return S.dorp.rovers.aanval.aantal;
  };
  const J = T.DAGEN_PER_JAAR;
  assert.deepEqual([100, J - 1, J, 2 * J - 1, 2 * J, 5 * J].map(aantalOp), [2, 2, 3, 3, 4, 4]);
});

test('rovers die de akker halen, roven er graan en gaan weer weg', () => {
  const S = gehucht();
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  assert.equal(A.fase, 'komen');
  const veld = S.wereld.akkers[A.veld];
  zet(A.rovers[0], veld.x, veld.y);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'roven');
  const graan = S.dorp.voorraad.graan;
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.roofUren + 0.1);
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'weg');
  assert.equal(graan - S.dorp.voorraad.graan, Math.min(graan, 2 * T.ROVERS_INSTELLINGEN.graanPerRover));
  assert.ok(berichten.some((t) => /make off with \d+ grain/.test(t)), berichten.join(' | '));
  for (const e of A.rovers) zet(e, A.ingang.x, A.ingang.y);
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval, null, 'ze zijn de kaart af');
  assert.ok(!S.wereld.wezens.some((e) => e.rover));
});

test('halen ze hun akker niet, dan geven ze het op en gaan ze met lege handen', () => {
  const S = gehucht();
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  const graan = S.dorp.voorraad.graan;
  for (const e of A.rovers) e.snelheid = 0; // ze komen niet vooruit
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.opUren + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'weg');
  opUur(S, 5, 17 + 2 * T.ROVERS_INSTELLINGEN.opUren + 0.2);
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval, null, 'ook de weg terug heeft een grens');
  assert.equal(S.dorp.voorraad.graan, graan, 'ze namen niets mee');
});

test('een vertrapte akker: wat erop stond, groeit dit jaar niet meer', () => {
  const S = gehucht({ weide: true });
  // Het proefdorp is op 2 lentemaand van het eerste jaar: de akkers zijn nog niet gezaaid. Op 1 lentemaand van het tweede
  // jaar zaaien de boeren (T.tikAkkersDag), en dan staat er iets op.
  T.zetVoorraad(S.dorp, 'graan', 400);
  T.tikAkkersDag(S.dorp, T.DAGEN_PER_JAAR);
  const veld = S.wereld.akkers.find((a) => T.bestemmingVan(a) === 'akker');
  const open = T.akkerOnbeslistTegels(veld).length;
  assert.ok(open > 0, 'er staat iets op');
  assert.equal(T.vertrapAkker(veld), open);
  assert.equal(T.akkerOnbeslistTegels(veld).length, 0, 'er valt niets meer te maaien');
  assert.equal(T.vertrapAkker(veld), 0, 'wat al weg is, kan niet nog eens weg');
  const weide = S.wereld.akkers.find((a) => T.bestemmingVan(a) === 'weide');
  assert.equal(T.vertrapAkker(weide), 0, 'op een weide staat geen graan');
});

test('wie valt, is dood: een soldaat is een mond minder, en ligt er tot de volgende dag', () => {
  const S = gehucht(WACHTHUIS);
  const [een] = metWachthuis(S);
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  const p = een.bewoner;
  const voor = S.dorp.bevolking;
  berichten.length = 0;
  T.raak(S, S.dorp, een, 100, A.rovers[0]);
  assert.equal(een.dood, true);
  assert.equal(S.dorp.bevolking, voor - 1);
  assert.ok(!S.dorp.bewoners.mensen.includes(p), 'hij woont er niet meer');
  assert.ok(S.wereld.wezens.includes(een), 'hij ligt er nog');
  assert.ok(berichten.some((t) => t.includes(p.naam) && /died/.test(t)), berichten.join(' | '));
  S.dorp.rovers.aanval = null;
  T.tikRoversDag(S.dorp, 6);
  assert.ok(!S.wereld.wezens.includes(een), 'de volgende dag is hij begraven');
});

test('na een nacht heeft wie het overleefde weer al zijn leven', () => {
  const S = gehucht();
  S.dorp.aanvoerder.leven = 5;
  T.tikRoversDag(S.dorp, 3);
  assert.equal(S.dorp.aanvoerder.leven, S.dorp.aanvoerder.maxLeven);
});

test('zijn alle rovers verslagen, dan is de aanval voorbij', () => {
  const S = gehucht(WACHTHUIS);
  const mannen = metWachthuis(S);
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  berichten.length = 0;
  T.raak(S, S.dorp, A.rovers[0], 100, mannen[0]);
  assert.ok(S.dorp.rovers.aanval, 'nog één rover');
  T.raak(S, S.dorp, A.rovers[1], 100, mannen[0]);
  assert.equal(S.dorp.rovers.aanval, null);
  assert.ok(berichten.includes('The robbers are defeated.'), berichten.join(' | '));
  for (const e of mannen) assert.notEqual(e.kant, 'speler');
});

test('de roverskampen en een aanval gaan mee in een bewaard spel', () => {
  const S = gehucht();
  opUur(S, 30, 10);
  T.wijzigBevolking(S.dorp, -4, 'vertrek', 'het dorp is niet tevreden genoeg');
  opUur(S, 31, 17);
  const A = aanval(S, 2);
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 1790000000000 })).gelukt, true);
  assert.deepEqual(S2.wereld.kampen, S.wereld.kampen, 'de kampen, met hun bende en hun dobbelsteen');
  assert.equal(S2.dorp.rovers.aanval.fase, A.fase);
  for (const e of S2.dorp.rovers.aanval.rovers) assert.ok(S2.wereld.wezens.includes(e), 'een rover in de aanval is dezelfde als op de kaart');
});

// Zonder akker komen ze voor de grootste stapel die nog buiten ligt (werklijst R, vraag 185; Marcel, 23 okt: "stapels
// ja"), en nemen ze ervan wat ze kunnen dragen.
test('zonder akker gaan rovers naar de grootste stapel, en nemen mee wat ze kunnen dragen (vraag 185)', () => {
  const S = leeg();
  assert.equal(T.veldenVan(S.dorp).length, 0, 'nog geen akker');
  losseStapel(S, { hout: 3 });
  const g = losseStapel(S, { hout: 10, steen: 4 });
  opUur(S, 5, 10);
  berichten.length = 0;
  const A = aanval(S, 3);
  assert.equal(A.fase, 'komen');
  assert.equal(A.stapel, g, 'de grootste stapel');
  assert.ok(berichten.some((t) => /^Robbers are coming\. Three wild robbers turn up, heading for the logs left outside\./.test(t)), berichten.join(' | '));
  zet(A.rovers[0], g.x + 1, g.y);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'roven', 'naast de stapel zijn ze er');
  opUur(S, 5, 10 + T.ROVERS_INSTELLINGEN.roofUren + 0.1);
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'weg');
  assert.deepEqual(A.buit, { hout: 10, steen: 2 }, 'drie man, elk vier stuks');
  assert.deepEqual(g.stapel, { steen: 2 }, 'de rest ligt er nog');
  assert.ok(berichten.some((t) => /make off with 10 logs and 2 stone/.test(t)), berichten.join(' | '));
});

test('is er geen akker en geen stapel, dan komen er geen rovers', () => {
  const S = leeg();
  opUur(S, 5, 10);
  aanval(S, 2);
  assert.equal(S.dorp.rovers.aanval, null);
  assert.ok(!S.wereld.wezens.some((e) => e.rover));
});

// De overval van de demo (vraag 185; Marcel, 20 okt: 4a3, 4b1 en 4c1, en 23 okt: overdag, met een aankondiging).
test('in de demo geen wilde rovers maar één overval van drie, overdag, op een dag uit het zaad, met een bericht vooraf', () =>
  inDeDemo(() => {
    const M = T.ROVERS_INSTELLINGEN.demo;
    const S = gehucht();
    const R = (S.dorp.rovers = T.nieuweRovers());
    let dag = 1;
    for (; dag < 250 && !R.aanval; dag++) T.tikRoversDag(S.dorp, dag);
    dag--;
    assert.equal(R.wildeOp, null, 'geen wilde rovers');
    assert.ok(R.demoOp >= M.van && R.demoOp <= M.tot, `dag ${R.demoOp}`);
    const A = R.aanval;
    assert.equal(dag, R.demoOp - 1, 'de nacht ervoor staat hij klaar');
    assert.equal(A.dag, R.demoOp);
    assert.equal(A.aantal, 3);
    const zon = T.dagindeling(A.dag).zon;
    assert.ok(A.uur >= zon.op + 1 && A.uur <= zon.onder - M.voorDonker, `overdag: ${A.uur} (de zon van ${zon.op} tot ${zon.onder})`);
    const S2 = gehucht();
    S2.dorp.rovers = T.nieuweRovers();
    T.tikRoversDag(S2.dorp, 1);
    assert.equal(S2.dorp.rovers.demoOp, R.demoOp, 'hetzelfde zaad, dezelfde dag');
    // Het bericht, een dag van tevoren.
    berichten.length = 0;
    S.kalender.snelheid = 3;
    opUur(S, A.dag - 1, A.uur + 24 - M.vooraf - 0.2);
    T.werkRoversBij(S, S.dorp);
    assert.ok(!A.gemeld && !berichten.length, 'nog niet');
    opUur(S, A.dag - 1, A.uur + 24 - M.vooraf + 0.1);
    T.werkRoversBij(S, S.dorp);
    assert.ok(A.gemeld);
    assert.ok(berichten.some((t) => /^Robbers were seen in the woods near the village\. They will come soon\./.test(t)), berichten.join(' | '));
    assert.equal(S.kalender.snelheid, 1, 'de tijd gaat naar 1×');
    assert.equal(A.fase, 'wacht', 'ze zijn er nog niet');
    assert.ok(!S.wereld.wezens.some((e) => e.rover));
    // Ze komen waar het bericht zei.
    const ingang = { ...A.ingang };
    opUur(S, A.dag, A.uur + 0.1);
    T.werkRoversBij(S, S.dorp);
    assert.equal(A.fase, 'komen');
    assert.equal(A.rovers.length, 3);
    assert.deepEqual(A.ingang, ingang);
    assert.equal(R.demoGeweest, true);
    // En daarna niet meer.
    R.aanval = null;
    for (let d = A.dag + 1; d < 2 * T.DAGEN_PER_JAAR; d++) T.tikRoversDag(S.dorp, d);
    assert.equal(R.aanval, null, 'één keer');
  }));

test('valt er in de demo niets te roven, dan komen ze een dag later', () =>
  inDeDemo(() => {
    const S = leeg();
    const R = (S.dorp.rovers = T.nieuweRovers());
    R.demoOp = 30;
    T.tikRoversDag(S.dorp, 29);
    const A = R.aanval;
    berichten.length = 0;
    opUur(S, 29, A.uur + 24 - T.ROVERS_INSTELLINGEN.demo.vooraf + 0.1);
    T.werkRoversBij(S, S.dorp);
    assert.equal(R.aanval, null, 'geen akker en geen stapel: nog niet');
    assert.equal(berichten.length, 0);
    losseStapel(S, { hout: 6 });
    T.tikRoversDag(S.dorp, 30);
    assert.equal(R.aanval.dag, 31, 'de dag erna');
    opUur(S, 30, R.aanval.uur + 24 - T.ROVERS_INSTELLINGEN.demo.vooraf + 0.1);
    T.werkRoversBij(S, S.dorp);
    assert.ok(R.aanval.gemeld, 'nu wel');
  }));

// Het debugvenster (js/debugvenster.js, Danger): de overval van de demo morgen, met het bericht meteen.
test('de overval van de demo morgen (het debugvenster): het bericht komt meteen, de rovers morgen', () =>
  inDeDemo(() => {
    const S = gehucht();
    opUur(S, 40, 10);
    const R = (S.dorp.rovers = T.nieuweRovers());
    R.demoGeweest = true; // hij was al geweest: het debugvenster laat hem toch nog eens komen
    assert.equal(T.demoOvervalMorgen(S.dorp), true);
    const A = R.aanval;
    assert.equal(A.dag, 41);
    assert.equal(A.demo, true);
    opUur(S, 40, Math.max(10, A.uur + 24 - T.ROVERS_INSTELLINGEN.demo.vooraf) + 0.1);
    berichten.length = 0;
    T.werkRoversBij(S, S.dorp);
    assert.ok(A.gemeld, 'het bericht');
    assert.ok(berichten.some((t) => /^Robbers were seen in the woods/.test(t)), berichten.join(' | '));
    opUur(S, 41, A.uur + 0.1);
    T.werkRoversBij(S, S.dorp);
    assert.equal(A.fase, 'komen');
    assert.equal(T.demoOvervalMorgen(S.dorp), false, 'niet terwijl er rovers op de kaart zijn');
  }));

// Hoe de wapens slaan, staat sinds vraag 159 in test/soldaten.test.cjs.
