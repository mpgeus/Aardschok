// De rovers (js/rovers.js; werklijst vraag 55, Marcel, 29 sep: "A, Ja en ook 'wilde' rovers. B, ze roven de velden, graan
// etc ook maken ze soms velden kapot. C, Ja. D, mensen kunnen sterven"; sinds c3 van vraag 170, 27 okt: de overval komt
// uit een roverskamp). Het gevecht met ze staat in test/gevecht.test.cjs, de kampen zelf in test/kampen.test.cjs.
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

function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
  e.pad = [];
  e.onderweg = false;
}
const opUur = (S, dag, uur) => {
  S.kalender.dag = dag + uur / 24;
};

// Een aanval die meteen begint (zoals Spel.debug.rovers), met zoveel man van het dichtste kamp, zonder reis.
function aanval(S, aantal) {
  S.dorp.rovers = S.dorp.rovers || T.nieuweRovers();
  T.roversKomen(S.dorp, { aantal, meteen: true });
  T.werkRoversBij(S, S.dorp);
  return S.dorp.rovers.aanval;
}
// De kampen van de kaart (vanaf de eerste tik, js/rovers.js), van het dichtst bij het plein naar het verst.
function kampenBij(S) {
  T.zetRoverskampenBij(S, S.wereld);
  const plein = T.pleinVan(S.dorp);
  return S.wereld.kampen.slice().sort((a, b) => T.afstand(a, plein) - T.afstand(b, plein));
}
// Een tik van de kampen (T.werkKampenBij, zoals de wereld dat doet, js/tik.js).
const kampTik = (S) => T.werkKampenBij(S, S.wereld);

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

// Een overval komt uit het dichtste kamp met mannen thuis (c3; Marcel, 27 okt: "c3 A1 B1 C1"): een dag van tevoren staat
// hij vast, ze vertrekken zo dat ze op het uur van het zaad bij je zijn, reizen buiten beeld, en komen je land op langs
// hun weg, zodra ze `ingangAfstand` tegels van hun akker zijn (B1).
test('een overval komt uit het dichtste kamp: ze vertrekken op tijd, reizen buiten beeld, en komen langs hun weg je land op (c3)', () => {
  const S = gehucht();
  const [K] = kampenBij(S);
  S.dorp.rovers = T.nieuweRovers();
  S.dorp.rovers.overvalOp = 41;
  T.tikRoversDag(S.dorp, 39);
  assert.equal(S.dorp.rovers.aanval, null, 'nog niet');
  T.tikRoversDag(S.dorp, 40);
  const A = S.dorp.rovers.aanval;
  assert.equal(A.soort, 'overval');
  assert.equal(A.dag, 41, 'een dag van tevoren staat de dag van het zaad vast');
  assert.ok(A.uur >= 0 && A.uur < 24, `het uur: ${A.uur}`);
  opUur(S, 40, 1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.kamp, K.nr, 'uit het dichtste kamp');
  assert.ok(A.reis > 0, `de reis: ${A.reis} uur`);
  // Hun reis gaat zo dat ze op het uur van het zaad bij je zijn; eerder dan vandaag vertrekken kan niet.
  const vertrek = Math.max(1.5, 24 + A.uur - A.reis);
  opUur(S, 40, vertrek - 0.5);
  T.werkRoversBij(S, S.dorp);
  if (vertrek - 0.5 > 1) assert.equal(A.fase, 'wacht', 'ze zijn nog thuis');
  opUur(S, 40, vertrek + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'onderweg');
  assert.deepEqual(A.leden, K.bende.slice(0, 2).map((l) => l.id), 'zoveel als het rooster zegt (A1)');
  assert.ok(K.bende.every((l) => l.opPad), 'ze zijn op pad, niet in het kamp');
  assert.ok(!S.wereld.wezens.some((e) => e.rover), 'onderweg zie je ze niet');
  opUur(S, 41, A.uur - 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'onderweg', 'niet voor het uur');
  opUur(S, 41, A.uur + 0.1);
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  const w = S.wereld;
  assert.equal(A.fase, 'komen');
  assert.equal(A.rovers.length, 2);
  for (const e of A.rovers) {
    assert.ok(w.wezens.includes(e));
    assert.equal(e.kant, 'monster');
    assert.equal(e.rover, true);
    assert.equal(e.dorp, S.dorp, 'een rover van een overval hoort bij het dorp dat hij overvalt');
    assert.equal(T.kampVan(w, e), K, 'en is een man van zijn kamp, met zijn naam');
    assert.ok(T.lidVan(w, e).naam);
  }
  const akker = w.akkers[A.veld];
  assert.equal(T.bestemmingVan(akker), 'akker', 'ze gaan naar een akker, niet naar een weide');
  const midden = { x: akker.x + Math.floor(akker.b / 2), y: akker.y + Math.floor(akker.h / 2) };
  assert.ok(T.afstand(A.ingang, midden) <= T.ROVERS_INSTELLINGEN.ingangAfstand, `ze komen ${T.afstand(A.ingang, midden)} tegels van de akker je land op`);
  const weg = T.groveWeg(w, K, midden);
  assert.ok(weg.some((p) => T.afstand(p, A.ingang) <= 4), 'langs hun weg vanaf het kamp (B1)');
  assert.ok(berichten.some((t) => /^Robbers are coming\. Two robbers turn up/.test(t)), berichten.join(' | '));
  assert.equal(S.kalender.snelheid, 1, 'de tijd gaat naar 1×');
});

test('een overval komt op een dag die vastligt per spel, niet in de eerste zestig dagen, het eerste jaar met twee man', () => {
  const S = gehucht();
  T.tikRoversDag(S.dorp, 1);
  const op = S.dorp.rovers.overvalOp;
  assert.ok(op >= 1 + T.ROVERS_INSTELLINGEN.eersteOvervalNa, `dag ${op}`);
  const S2 = gehucht();
  T.tikRoversDag(S2.dorp, 1);
  assert.equal(S2.dorp.rovers.overvalOp, op, 'hetzelfde zaad, dezelfde dag');
  for (let d = 2; d < op - 1; d++) T.tikRoversDag(S.dorp, d);
  assert.equal(S.dorp.rovers.aanval, null);
  T.tikRoversDag(S.dorp, op - 1);
  const A = S.dorp.rovers.aanval;
  assert.equal(A.soort, 'overval');
  assert.equal(A.dag, op);
  assert.ok(op < T.DAGEN_PER_JAAR, `dag ${op} ligt in het eerste jaar`);
  assert.equal(A.aantal, 2, 'het eerste jaar met twee man');
  assert.ok(S.dorp.rovers.overvalOp > op, 'en daarna komen ze weer');
});

test('ze komen op elk uur, vaker in het donker: de helft van de overvallen valt in de nacht, het uur uit het zaad (vraag 170, stap 4, D2)', () => {
  const urenVan = () => {
    const S = gehucht();
    const uit = [];
    for (let dag = 100; dag < 400; dag++) {
      S.dorp.rovers = T.nieuweRovers();
      S.dorp.rovers.overvalOp = dag;
      T.tikRoversDag(S.dorp, dag - 1);
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

test('ze bouwen langzaam op: elk jaar van je ambt een man meer, tot vier (vraag 57); heeft het kamp er minder, dan gaan die (A1)', () => {
  const aantalOp = (dag) => {
    const S = gehucht();
    S.dorp.rovers = T.nieuweRovers();
    S.dorp.rovers.overvalOp = dag;
    T.tikRoversDag(S.dorp, dag - 1);
    return S.dorp.rovers.aanval.aantal;
  };
  const J = T.DAGEN_PER_JAAR;
  assert.deepEqual([100, J - 1, J, 2 * J - 1, 2 * J, 5 * J].map(aantalOp), [2, 2, 3, 3, 4, 4]);
  // Vier op het rooster, maar het kamp heeft er twee: dan gaan die twee, en blijft er niemand thuis.
  const S = gehucht();
  const [K] = kampenBij(S);
  opUur(S, 5, 17);
  S.dorp.rovers = T.nieuweRovers();
  S.dorp.rovers.aanval = { soort: 'overval', dag: 5, uur: 17, fase: 'wacht', aantal: 4, meteen: true };
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval.rovers.length, 2);
  assert.equal(K.bende.length, 2, 'het rooster vult niet aan');
});

test('heeft geen kamp mannen thuis, dan komt er deze keer niemand, en loopt het rooster door', () => {
  const S = gehucht();
  for (const K of kampenBij(S)) for (const l of K.bende) l.opPad = { terug: null };
  S.dorp.rovers = T.nieuweRovers();
  S.dorp.rovers.overvalOp = 41;
  T.tikRoversDag(S.dorp, 40);
  const op = S.dorp.rovers.overvalOp;
  opUur(S, 40, 1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval, null);
  assert.ok(op > 41, 'de volgende staat al vast');
  assert.ok(!S.wereld.wezens.some((e) => e.rover));
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
  // Na de reis zijn ze thuis, en ligt de buit in hun kamp (c3, voor wie het in c4 opruimt).
  const K = S.wereld.kampen.find((k) => k.nr === A.kamp);
  kampTik(S);
  assert.ok(K.bende.every((l) => !l.opPad), 'zonder reis (meteen) zijn ze meteen terug');
  assert.equal(Math.round(K.buit.graan), Math.round(graan - S.dorp.voorraad.graan), 'de buit ligt in het kamp');
});

test('na een overval reizen ze terug, en zijn ze na hun reis thuis met de buit; onderweg is het kamp leeg (c3)', () => {
  const S = gehucht();
  const [K] = kampenBij(S);
  opUur(S, 5, 17);
  S.dorp.rovers = T.nieuweRovers();
  T.roversKomen(S.dorp, { aantal: 2, overUren: 0 });
  T.werkRoversBij(S, S.dorp);
  const A = S.dorp.rovers.aanval;
  assert.equal(A.fase, 'komen');
  assert.ok(A.reis > 0);
  const veld = S.wereld.akkers[A.veld];
  zet(A.rovers[0], veld.x, veld.y);
  T.werkRoversBij(S, S.dorp);
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.roofUren + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'weg');
  for (const e of A.rovers) zet(e, A.ingang.x, A.ingang.y);
  T.werkRoversBij(S, S.dorp);
  assert.equal(S.dorp.rovers.aanval, null);
  const terug = 5 + (17 + T.ROVERS_INSTELLINGEN.roofUren + 0.1 + A.reis) / 24;
  assert.ok(K.bende.every((l) => l.opPad && Math.abs(l.opPad.terug - terug) < 1e-6), 'ze zijn onderweg naar huis');
  S.kalender.dag = terug - 0.01;
  kampTik(S);
  assert.ok(K.bende.every((l) => l.opPad), 'nog niet thuis');
  assert.deepEqual(K.buit, {});
  S.kalender.dag = terug + 0.01;
  kampTik(S);
  assert.ok(K.bende.every((l) => !l.opPad), 'thuis');
  assert.ok(K.buit.graan > 0, 'met de buit');
});

// C1: wat een rover draagt, ligt er als hij valt, als een losse stapel; de dragers halen hem als hij in je bereik ligt.
test('valt een rover met buit, dan ligt zijn deel er als een losse stapel (C1)', () => {
  const S = gehucht(WACHTHUIS);
  const mannen = metWachthuis(S);
  opUur(S, 5, 17);
  const A = aanval(S, 2);
  const veld = S.wereld.akkers[A.veld];
  zet(A.rovers[0], veld.x, veld.y);
  T.werkRoversBij(S, S.dorp);
  opUur(S, 5, 17 + T.ROVERS_INSTELLINGEN.roofUren + 0.1);
  const graan = S.dorp.voorraad.graan;
  T.werkRoversBij(S, S.dorp);
  const buit = graan - S.dorp.voorraad.graan;
  assert.ok(buit > 0, 'ze namen graan mee');
  const [een] = A.rovers;
  const plek = T.tegelVan(een);
  const voor = S.dorp.gebouwen.length;
  T.raak(S, S.dorp, een, 100, mannen[0]);
  assert.equal(een.dood, true);
  const stapel = S.dorp.gebouwen[voor];
  assert.ok(stapel && stapel.soort === 'stapel' && stapel.x === plek.x && stapel.y === plek.y, 'een stapel waar hij viel');
  assert.ok(Math.abs(stapel.stapel.graan - buit / 2) < 1e-6, `zijn deel: ${stapel.stapel.graan} van ${buit}`);
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
  const K = S.wereld.kampen.find((k) => k.nr === A.kamp);
  assert.equal(K.bende.length, 0, 'wie valt, is uit zijn bende');
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
  assert.ok(berichten.some((t) => /^Robbers are coming\. Three robbers turn up, heading for the logs left outside\./.test(t)), berichten.join(' | '));
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

// De overval van de demo (vraag 185; Marcel, 20 okt: 4a3, 4b1 en 4c1, en 23 okt: overdag, met een aankondiging): het
// demojaar (levels/demojaar.js) zet het rooster uit, en zijn trigger begint de aangekondigde overval (T.roversKomen), uit
// het dichtste kamp, met de drie van het level (heeft het kamp er minder, dan komen er van buiten bij; "demo mee").
const V = () => T.ROVERS_INSTELLINGEN.aangekondigd;
const geenRooster = (S) => (S.dorp.rovers = { ...T.nieuweRovers(), overvallen: false });
// Een seconde van de wereld verder, en de triggers kijken (zoals de tik dat doet, js/tik.js).
function seconde(S) {
  S.wereldTijd += 1;
  T.werkScenarioBij(S);
}

test('in de demo geen rooster maar één overval van drie uit het dichtste kamp, overdag, op een dag uit het zaad, met een bericht vooraf', () => {
  const S = gehucht();
  const R = geenRooster(S);
  assert.deepEqual(T.startScenario(S, T.LEVELS.demojaar), []);
  for (let dag = 1; dag < 250; dag++) T.tikRoversDag(S.dorp, dag);
  assert.equal(R.aanval, null, 'geen overvallen op het rooster');
  assert.equal(R.overvalOp, null);
  // De dag van het bericht ligt vast in het zaad; de overval komt de dag erna.
  const L = S.scenario.lot.overval;
  assert.ok(L >= 59 && L <= 219, `dag ${L}`);
  const S2 = gehucht();
  T.startScenario(S2, T.LEVELS.demojaar);
  assert.equal(S2.scenario.lot.overval, L, 'hetzelfde zaad, dezelfde dag');
  opUur(S, L - 1, 12);
  seconde(S);
  assert.equal(R.aanval, null, 'de dag ervoor nog niet');
  opUur(S, L, 0.5);
  seconde(S);
  const A = R.aanval;
  assert.ok(A && A.aangekondigd && A.dag === L + 1 && A.aantal === 3, JSON.stringify(A));
  const zon = T.dagindeling(A.dag).zon;
  assert.ok(A.uur >= zon.op + 1 && A.uur <= zon.onder - V().voorDonker, `overdag: ${A.uur} (de zon van ${zon.op} tot ${zon.onder})`);
  // Het bericht, een dag van tevoren.
  berichten.length = 0;
  S.kalender.snelheid = 3;
  opUur(S, A.dag - 1, A.uur + 24 - V().vooraf - 0.2);
  T.werkRoversBij(S, S.dorp);
  assert.ok(!A.gemeld && !berichten.length, 'nog niet');
  opUur(S, A.dag - 1, A.uur + 24 - V().vooraf + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.ok(A.gemeld);
  assert.ok(berichten.some((t) => /^Robbers were seen in the woods near the village\. They will come soon\./.test(t)), berichten.join(' | '));
  assert.equal(S.kalender.snelheid, 1, 'de tijd gaat naar 1×');
  assert.ok(A.fase === 'wacht' || A.fase === 'onderweg', `ze zijn er nog niet: ${A.fase}`);
  assert.ok(!S.wereld.wezens.some((e) => e.rover));
  // Ze komen waar het bericht zei.
  const ingang = { ...A.ingang };
  opUur(S, A.dag, A.uur + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'komen');
  assert.equal(A.rovers.length, 3);
  assert.deepEqual(A.ingang, ingang);
  const K = S.wereld.kampen.find((k) => k.nr === A.kamp);
  assert.equal(K, kampenBij(S)[0], 'uit het dichtste kamp');
  assert.equal(K.bende.length, 3, 'twee van het kamp, en een die erbij kwam');
  // En daarna niet meer.
  R.aanval = null;
  for (let d = A.dag + 1; d < 2 * T.DAGEN_PER_JAAR; d += 10) {
    T.tikRoversDag(S.dorp, d);
    opUur(S, d, 12);
    seconde(S);
  }
  assert.equal(R.aanval, null, 'één keer');
});

test('valt er bij een aangekondigde overval niets te roven, dan komen ze een dag later', () => {
  const S = leeg();
  const R = geenRooster(S);
  opUur(S, 29, 3);
  assert.equal(T.roversKomen(S.dorp, { aantal: 3, aangekondigd: true }), true);
  const A = R.aanval;
  assert.equal(A.dag, 30);
  berichten.length = 0;
  opUur(S, 29, A.uur + 24 - V().vooraf + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(R.aanval, A, 'de overval blijft staan');
  assert.ok(!A.gemeld && A.dag === 31, 'geen akker en geen stapel: een dag later');
  assert.equal(berichten.length, 0);
  losseStapel(S, { hout: 6 });
  opUur(S, 30, A.uur + 24 - V().vooraf + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.ok(A.gemeld, 'nu wel');
});

// Het debugvenster (js/debugvenster.js, Danger): de overval van de demo morgen, ook in het volle spel, met het bericht vandaag.
test('een aangekondigde overval morgen (het debugvenster): het bericht vandaag, de rovers morgen, en niet twee tegelijk', () => {
  const S = gehucht();
  opUur(S, 40, 10);
  const R = (S.dorp.rovers = T.nieuweRovers());
  assert.equal(T.roversKomen(S.dorp, { aantal: 3, aangekondigd: true }), true);
  const A = R.aanval;
  assert.equal(A.dag, 41);
  opUur(S, 40, Math.max(10, A.uur + 24 - V().vooraf) + 0.1);
  berichten.length = 0;
  T.werkRoversBij(S, S.dorp);
  assert.ok(A.gemeld, 'het bericht');
  assert.ok(berichten.some((t) => /^Robbers were seen in the woods/.test(t)), berichten.join(' | '));
  opUur(S, 41, A.uur + 0.1);
  T.werkRoversBij(S, S.dorp);
  assert.equal(A.fase, 'komen');
  assert.equal(T.roversKomen(S.dorp, { aantal: 3, aangekondigd: true }), false, 'niet terwijl er rovers op de kaart zijn');
});

// Hoe de wapens slaan, staat sinds vraag 159 in test/soldaten.test.cjs.
