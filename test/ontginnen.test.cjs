// Ontginnen (js/ontginnen.js; werklijst vraag 107; Marcel, 5 okt: "107 a b c d e ja", en voor het bos "A a2, B ok, C ja, D
// ok, E ok, F Ja, G ok, H goed idee"): komt het dorp graan tekort, dan vraagt een boer of zijn zoon je om dertig tegels te
// ontginnen, heide of bos. De heide kost het vertrouwen van het dorp, want de meent is van iedereen; een maand plaggen
// steken. Het bos is van de heer: meld je het, dan kost het zijn gunst en telt de inner het; doe je het stiekem, dan ben
// je betrapt als de inner of zijn soldaten het vinden. Een winter bomen hakken, en het hout is voor het dorp. In lentemaand
// is het een akker. De toetsen van de heide (stap 1) spelen met de spelregel "Alleen de heide", zoals het begon.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });

// Het ontworpen gehucht, met een vast zaad, op `dag` (40: 11 grasmaand, zeven uur 's ochtends).
function gehucht(dag = 40 + 7 / 24) {
  // Deze toetsen gaan niet over het weer: er wordt gezaaid op 1 lentemaand, ook als het die dag regent (vraag 144, 1).
  T.VELDEN_INSTELLINGEN.nietInDeRegen = false;
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
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  T.S = S;
  return S;
}
const lopend = (D) => D.voorvallen && D.voorvallen.lopend;
// De antwoorden die je nu ziet (de vlaggen van het voorval, js/gesprek.js), en het antwoord dat zo begint.
const zichtbaar = (S) => T.zichtbareKeuzes(S, S.dorp, 'ontginverzoek', T.GESPREKKEN.ontginverzoek.knopen.begin.keuzes);
function antwoord(S, begin) {
  const k = zichtbaar(S).find((x) => x.zeg.startsWith(begin));
  assert.ok(k, `het antwoord "${begin}" staat er: ${zichtbaar(S).map((x) => x.zeg).join(' | ')}`);
  return k;
}
function zeg(S, begin) {
  const k = antwoord(S, begin);
  const L = lopend(S.dorp);
  T.doeGevolg(S, S.dorp, k.doe || {});
  T.voorvalBeantwoord(S.dorp, L.id);
}
// Wat iemand zegt als hij het vraagt.
const vraagt = (S) => T.vulWoordenIn(S.dorp, T.eersteDiePast(S, S.dorp, 'ontginverzoek', T.GESPREKKEN.ontginverzoek.knopen.begin.tekst).zeg);
// Een toets van de heide: met de spelregel "Alleen de heide" (met het bos erbij vraagt soms een andere boer het, wie een
// stuk bos dichterbij heeft; dat toetsen de toetsen van het bos).
function heide(naam, fn) {
  test(naam, () => {
    T.zetOptie('ontginnen', 'heide');
    try {
      fn();
    } finally {
      T.optiesTerug();
    }
  });
}
// Een verzoek om te ontginnen, nu: het dorp heeft geen graan meer boven wat de groei vraagt.
function verzoek(S) {
  const D = S.dorp;
  D.voorraad.graan = 0;
  assert.ok(T.graanTekort(D), 'het dorp komt graan tekort');
  assert.ok(T.beginOntginverzoek(D, Math.floor(S.kalender.dag)), 'er komt iemand vragen');
  return lopend(D);
}
const plekVan = (L) => L.ontgin.heide;
const opVeld = (v, x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;

heide('komt het dorp graan tekort, dan vraagt een boer of zijn zoon om het stuk heide het dichtst bij zijn akker, dertig tegels', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  D.voorraad.graan = 500;
  assert.ok(!T.graanTekort(D));
  assert.equal(T.beginOntginverzoek(D, 40), false, 'zonder tekort vraagt niemand het');
  const L = verzoek(S);
  assert.equal(L.id, 'ontginverzoek');
  assert.equal(L.ontgin.bos, null, 'alleen de heide');
  const o = { ...plekVan(L), boer: L.ontgin.boer };
  assert.equal(o.b * o.h, 30);
  const meent = w.meenten.find((m) => m.meent && opVeld(m, o.x, o.y));
  assert.ok(meent, 'op de heide');
  for (let y = o.y; y < o.y + o.h; y++) {
    for (let x = o.x; x < o.x + o.b; x++) {
      assert.ok(opVeld(meent, x, y) && T.isBegaanbaar(w, x, y) && !T.veldOp(w, x, y), `${x},${y} is vrije heide`);
    }
  }
  // Naast zijn akker als het kan, en anders zo dichtbij als het kan (vraag 107, d): op het ontworpen gehucht ligt de
  // heide tien tegels van de dichtste akker (die van boer5), en het stuk komt in de hoek die daar het dichtst bij ligt.
  const boer = o.boer;
  const afstand = (a, v) => Math.max(0, v.x - (a.x + a.b - 1), a.x - (v.x + v.b - 1), v.y - (a.y + a.h - 1), a.y - (v.y + v.h - 1));
  const naarDeHeide = (e) => Math.min(...e.werkAkkers.map((v) => afstand(meent, v)));
  const boeren = w.wezens.filter((e) => e.werkAkkers && e.werkAkkers.length);
  assert.equal(naarDeHeide(boer), Math.min(...boeren.map(naarDeHeide)), 'de boer met een akker het dichtst bij de heide');
  assert.equal(Math.min(...boer.werkAkkers.map((v) => afstand(o, v))), naarDeHeide(boer), 'zo dicht bij zijn akker als de heide komt');
  const p = T.bewonerVan(D, boer);
  assert.ok(L.wie === p || (L.wie.huis === p.huis && L.wie.band === 'zoon'), 'de boer, of zijn zoon');
  const tekst = vraagt(S);
  assert.match(tekst, /heide/);
  assert.match(tekst, /30 tegels/);
  assert.deepEqual(zichtbaar(S).map((k) => k.zeg), ['Ja, ontgin het maar.', 'Nee, de heide is van iedereen.']);
});

heide('ja: het wordt een veld van zijn boerderij dat nog ontgonnen wordt, de schapen grazen er niet meer, en het vertrouwen zakt', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const L = verzoek(S);
  const o = { ...plekVan(L), boer: L.ontgin.boer };
  const meent = w.meenten.find((m) => m.meent && opVeld(m, o.x, o.y));
  const meentVoor = T.weideStand(D, meent).tegels;
  const vertrouwen = T.bazenNu(D).vertrouwen;
  zeg(S, 'Ja');
  const veld = w.akkers.find((v) => v.ontginning);
  assert.ok(veld, 'een veld in ontginning');
  assert.deepEqual([veld.x, veld.y, veld.b, veld.h], [o.x, o.y, o.b, o.h]);
  assert.ok(o.boer.werkAkkers.includes(veld), 'van zijn boerderij');
  assert.equal(T.boerVanVeld(D, veld), o.boer);
  assert.equal(T.bestemmingVan(veld), 'braak', 'het rust tot het klaar is');
  assert.equal(T.planVan(veld), 'akker', 'en wordt in lentemaand een akker');
  assert.equal(veld.ontginning.tot, 40 + T.ONTGINNEN_INSTELLINGEN.heideDagen, 'een maand');
  assert.equal(T.bazenNu(D).vertrouwen, vertrouwen - 5, 'de meent is van iedereen');
  assert.equal(T.weideStand(D, meent).tegels, meentVoor - 30, 'de meent is dertig tegels kleiner');
  const schaap = T.veeVan(D).find((e) => e.weide === meent);
  if (schaap) assert.ok(!T.graaslandVan(w, schaap).op(o.x, o.y), 'een schaap graast er niet meer');
  const net = T.aangelegdNet(D);
  for (const t of T.akkerTegels(veld)) assert.notEqual(net[t.x + t.y * w.tegels[0].length], 2, `geen paadje over ${t.x},${t.y}`);
  assert.equal(T.akkerTegelStadium(veld, o.x, o.y, 'groen'), 'heide', 'wat hij nog niet stak, is heide');
  T.steekPlag(veld, o.x, o.y);
  assert.equal(T.akkerTegelStadium(veld, o.x, o.y, 'groen'), 'geploegd', 'wat hij stak, is kale grond');
  assert.equal(T.beginOntginverzoek(D, 41), false, 'zolang er een stuk ontgonnen wordt, vraagt niemand een tweede');
});

heide('nee, of je sprak hem niet: pas na dertig dagen vraagt er weer iemand; met de spelregel uit vraagt niemand het', () => {
  const S = gehucht();
  const D = S.dorp;
  verzoek(S);
  zeg(S, 'Nee');
  assert.ok(!S.wereld.akkers.some((v) => v.ontginning), 'geen veld');
  assert.equal(T.beginOntginverzoek(D, 41), false);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw - 1), false);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw), true, 'na dertig dagen weer');
  // Wie je niet sprak, gaat voorbij (js/voorvallen.js), en komt ook pas na dertig dagen terug, niet morgen.
  T.voorvalBeantwoord(D, lopend(D).id);
  assert.equal(T.beginOntginverzoek(D, 40 + T.ONTGINNEN_INSTELLINGEN.opnieuw + 1), false, 'niet de dag erna');
  T.zetOptie('ontginnen', 'uit');
  D.ontginnen = { gevraagd: null, klaar: null };
  assert.equal(T.beginOntginverzoek(D, 100), false);
});

// Het stuk dat ontgonnen wordt, is klaar, en het dorp mag meteen weer vragen.
function allesKlaar(S) {
  for (const v of T.inOntginning(S.wereld)) delete v.ontginning;
  S.dorp.ontginnen = { gevraagd: null, klaar: null };
}

// Vraag 107, f3 (Marcel, 5 okt: "We gaan met jouw suggestie"): hoe kleiner de meent, hoe meer het dorp eraan hecht.
heide('elk volgend stuk kost meer vertrouwen, 5, 10, 15; het venster zegt het vooraf, en wie het vraagt ook', () => {
  const S = gehucht();
  const D = S.dorp;
  const zinnen = [/het is de meent, en het dorp zal er wat van vinden/, /er ging al een stuk van de meent af/, /er gingen al twee stukken van de meent af/];
  for (const [i, kost] of [5, 10, 15].entries()) {
    const L = verzoek(S);
    assert.equal(L.ontgin.vertrouwen, kost, `stuk ${i + 1}`);
    assert.match(T.prijsVanKeuze(D, antwoord(S, 'Ja').doe).tekst, new RegExp(`vertrouwen van het dorp −${kost}$`), 'het venster zegt wat ja kost');
    assert.equal(T.prijsVanKeuze(D, antwoord(S, 'Nee').doe).tekst, '', 'nee kost niets');
    assert.match(vraagt(S), zinnen[i]);
    const voor = T.bazenNu(D).vertrouwen;
    zeg(S, 'Ja');
    assert.equal(T.bazenNu(D).vertrouwen, voor - kost, `stuk ${i + 1} kost ${kost}`);
    allesKlaar(S);
  }
  assert.equal(T.ontgonnenStukken(S.wereld), 3);
  // Zonder de twee bazen (de spelregel) is er geen vertrouwen, en kost het niets.
  T.zetOptie('tweeBazen', 'uit');
  assert.equal(T.ontginVertrouwen(D), 0);
});

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`.
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
  }
}

heide('de boer steekt er plaggen, tegel voor tegel; na een maand is het ontgonnen, en in lentemaand een akker die gezaaid wordt', () => {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    const S = gehucht();
    const D = S.dorp;
    const L = verzoek(S);
    const boer = L.ontgin.boer;
    zeg(S, 'Ja');
    D.voorraad.graan = 600; // zodat het dorp niet hongert, en er zaaigraan is
    const veld = S.wereld.akkers.find((v) => v.ontginning);
    totUur(S, 40, 12);
    assert.equal(boer.werkt && boer.werkt.soort, 'ontginnen', 'hij werkt op de heide');
    assert.ok(T.veldOp(S.wereld, boer.tx, boer.ty) === veld, 'op zijn nieuwe veld');
    totUur(S, 43, 18);
    const gestoken = veld.ontginning.gestoken.size;
    assert.ok(gestoken >= 2 && gestoken < 30, `${gestoken} plaggen in drie dagen`);
    // De maand is om: wat hij niet stak, steken zijn mensen nog; het stuk rust tot lentemaand.
    D.gebouwenDag = veld.ontginning.tot - 1;
    S.kalender.dag = veld.ontginning.tot + 0.3;
    T.tikGebouwenDag(D, veld.ontginning.tot);
    assert.equal(veld.ontginning, undefined, 'ontgonnen');
    assert.ok(berichten.some((t) => /is ontgonnen/.test(t)), berichten.slice(-3).join(' | '));
    assert.equal(T.bestemmingVan(veld), 'braak');
    // 1 lentemaand van het jaar erna: het wordt een akker, en gezaaid.
    S.kalender.dag = 360 + 0.3;
    D.voorraad.graan = 600;
    T.tikGebouwenDag(D, 360);
    assert.equal(T.bestemmingVan(veld), 'akker', 'een akker');
    assert.equal(T.akkerTegelStadium(veld, veld.x, veld.y, 'groen'), 'groen', 'gezaaid');
  } finally {
    Math.random = toeval;
  }
});

// Wie in de winter ja zei, wacht geen jaar: zolang het stuk ontgonnen wordt, wisselt het niet op 1 lentemaand (dan zou
// er op de heide gezaaid worden), en is het klaar terwijl de boeren nazaaien, dan wordt het meteen een akker.
heide('ja in sprokkelmaand: op 1 lentemaand wisselt het nog niet, en is het in lentemaand klaar, dan zaaien de boeren het na', () => {
  const S = gehucht(345 + 7 / 24);
  const D = S.dorp;
  verzoek(S);
  zeg(S, 'Ja');
  const veld = S.wereld.akkers.find((v) => v.ontginning);
  assert.equal(veld.ontginning.tot, 375, '15 lentemaand');
  // 1 lentemaand van het jaar erna: de velden wisselen en de boeren zaaien, maar dit stuk wordt nog ontgonnen.
  D.voorraad.graan = 600;
  D.gebouwenDag = 359;
  S.kalender.dag = 360.3;
  T.tikGebouwenDag(D, 360);
  assert.ok(veld.ontginning, 'nog heide');
  assert.equal(T.bestemmingVan(veld), 'braak', 'het wisselt nog niet');
  // 15 lentemaand: ontgonnen, meteen een akker, en de boeren zaaien hem na.
  D.voorraad.graan = 600;
  D.gebouwenDag = 374;
  S.kalender.dag = 375.3;
  T.tikGebouwenDag(D, 375);
  assert.equal(veld.ontginning, undefined, 'ontgonnen');
  assert.equal(T.bestemmingVan(veld), 'akker', 'een akker');
  assert.equal(veld.ongezaaid.size, 0, 'nagezaaid');
  assert.ok(berichten.some((t) => /zaaien hem na/.test(t)), berichten.slice(-3).join(' | '));
});

heide('ben je weg, dan zegt je raadsman ja op het eerste stuk, en op een volgend nee; en het stuk gaat mee in een bewaard spel', () => {
  const S = gehucht();
  const D = S.dorp;
  const L = verzoek(S);
  const raadsman = D.bewoners.mensen.find((p) => p.wezen && T.isBoer(p.wezen) && p.wezen !== L.ontgin.boer);
  const keus = T.raadsmanKeuze(D, raadsman, 'ontginverzoek');
  assert.ok(keus && keus.doe.ontgin, `${raadsman.wezen.karakter} zegt: ${keus && keus.zeg}`);
  zeg(S, 'Ja');
  const veld = S.wereld.akkers.find((v) => v.ontginning);
  // Een tweede stuk kost 10 vertrouwen, meer dan het hem waard is: dat laat hij aan jou.
  const ontginning = veld.ontginning;
  allesKlaar(S);
  verzoek(S);
  const tweede = T.raadsmanKeuze(D, raadsman, 'ontginverzoek');
  assert.ok(tweede && !tweede.doe.ontgin, `een tweede stuk: ${raadsman.wezen.karakter} zegt: ${tweede && tweede.zeg}`);
  T.voorvalBeantwoord(D, lopend(D).id);
  veld.ontginning = ontginning;
  T.steekPlag(veld, veld.x, veld.y);
  const gelezen = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(gelezen.gelukt, gelezen.reden);
  const terug = gelezen.staat.wereld.akkers.find((v) => v.naam === veld.naam);
  assert.equal(terug.ontginning.tot, veld.ontginning.tot);
  assert.ok(terug.ontginning.gestoken.has(`${veld.x},${veld.y}`));
  const boerTerug = gelezen.staat.wereld.wezens.find((e) => e.wie === L.ontgin.boer.wie);
  assert.ok(boerTerug.werkAkkers.includes(terug), 'en het blijft van zijn boerderij');
});

// ---------------------------------------------------------------------------------------------
// Het bos (vraag 107, stap 2)
// ---------------------------------------------------------------------------------------------

const bomenOp = (w, s) => T.akkerTegels(s).filter((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken').length;

test('a2: wie vraagt, wijst een stuk heide en een stuk bos aan, allebei in goud, en jij kiest; het bos ligt waar de inner het van zijn ronde niet ziet', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const L = verzoek(S);
  const { heide: h, bos: b, boer } = L.ontgin;
  assert.ok(h && b, 'allebei');
  assert.equal(b.b * b.h, 30);
  assert.ok(b.bomen >= T.ONTGINNEN_INSTELLINGEN.bosBomen && bomenOp(w, b) === b.bomen, `${b.bomen} bomen`);
  for (const t of T.akkerTegels(b)) {
    assert.ok(!T.veldOp(w, t.x, t.y) && !T.opPad(w, t.x, t.y) && !w.meenten.some((m) => opVeld(m, t.x, t.y)), `${t.x},${t.y}: geen veld, weg of meent`);
    assert.ok(T.isBegaanbaar(w, t.x, t.y) || T.ontginWerkOp(w, t.x, t.y), `${t.x},${t.y}: vrij, of iets wat hij opruimt`);
  }
  assert.equal(b.verborgen, true, 'op het ontworpen gehucht is er een stuk dat de inner niet ziet');
  assert.equal(T.innerZietStuk(D, b), false);
  // Wie vraagt, heeft van alle boeren een stuk het dichtst bij.
  const afstand = (a, v) => Math.max(0, v.x - (a.x + a.b - 1), a.x - (v.x + v.b - 1), v.y - (a.y + a.h - 1), a.y - (v.y + v.h - 1));
  const dichtst = (e) => Math.min(...[T.ontginPlekVoor(D, e), T.bosPlekVoor(D, e)].filter(Boolean).flatMap((s) => e.werkAkkers.map((v) => afstand(s, v))));
  const boeren = w.wezens.filter((e) => e.werkAkkers && e.werkAkkers.length);
  assert.equal(dichtst(boer), Math.min(...boeren.map(dichtst)));
  // Het gesprek: beide plekken, en vier antwoorden.
  assert.ok(T.heeftVlag(D, 'ontginHeide') && T.heeftVlag(D, 'ontginBos'), 'de vlaggen van het voorval');
  assert.match(vraagt(S), /heide.*Of het stuk bos achter .* Maar het bos is van de heer\. Van de weg en de akkers ziet niemand het/);
  assert.deepEqual(zichtbaar(S).map((k) => k.zeg), ['De heide.', 'Het bos. Ik meld het de heer.', 'Het bos. De heer hoeft het niet te weten.', 'Nee, nu niet.']);
  assert.match(T.prijsVanKeuze(D, antwoord(S, 'De heide').doe).tekst, /vertrouwen van het dorp −5/);
  assert.match(T.prijsVanKeuze(D, antwoord(S, 'Het bos. Ik meld').doe).tekst, new RegExp(`\\+${b.bomen * T.BOS_INSTELLINGEN.houtPerBoom} hout.*gunst van de heer −5.*de inner telt het`));
  assert.match(T.prijsVanKeuze(D, antwoord(S, 'Het bos. De heer hoeft').doe).tekst, /de inner ziet het daar niet.*betrapt/);
  zeg(S, 'Nee');
  assert.ok(!T.heeftVlag(D, 'ontginHeide') && !T.heeftVlag(D, 'ontginBos'), 'om: de vlaggen zijn weg');
});

test('is de heide op, dan vraagt hij alleen het bos; met de spelregel "Alleen de heide" alleen de heide', () => {
  const S = gehucht();
  const D = S.dorp;
  for (const m of S.wereld.meenten) m.meent = null; // geen heide meer
  const L = verzoek(S);
  assert.equal(L.ontgin.heide, null);
  assert.ok(L.ontgin.bos);
  assert.match(vraagt(S), /de heide is op/);
  assert.deepEqual(zichtbaar(S).map((k) => k.zeg), ['Het bos. Ik meld het de heer.', 'Het bos. De heer hoeft het niet te weten.', 'Nee, nu niet.']);
  // De raadsman kiest nooit iets wat er niet staat (de heide), ook al staat het in het gesprek.
  const raadsman = D.bewoners.mensen.find((p) => p.wezen && T.isBoer(p.wezen));
  const keus = T.raadsmanKeuze(D, raadsman, 'ontginverzoek');
  assert.ok(!keus || keus.doe.ontgin !== 'heide', keus && keus.zeg);
  T.voorvalBeantwoord(D, L.id);
  T.zetOptie('ontginnen', 'heide');
  try {
    D.ontginnen = { gevraagd: null, klaar: null };
    assert.equal(T.beginOntginverzoek(D, 40), false, 'zonder heide en zonder bos vraagt niemand het');
    assert.equal(D.ontginnen.gezocht, 40, 'en het dorp kijkt pas over dertig dagen weer');
  } finally {
    T.optiesTerug();
  }
});

test('het bos, gemeld: een veld in ontginning voor een winter, de gunst van de heer −5, en het staat in zijn boeken', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const L = verzoek(S);
  const b = { ...L.ontgin.bos };
  const gunst = T.bazenNu(D).gunst;
  const vertrouwen = T.bazenNu(D).vertrouwen;
  zeg(S, 'Het bos. Ik meld');
  const veld = w.akkers.find((v) => v.ontginning);
  assert.deepEqual([veld.x, veld.y, veld.b, veld.h], [b.x, b.y, b.b, b.h]);
  assert.equal(veld.ontginning.op, 'bos');
  assert.equal(veld.ontgonnen, 'bos');
  assert.equal(veld.ontginning.tot, 40 + T.ONTGINNEN_INSTELLINGEN.bosDagen, 'een winter');
  assert.equal(T.bazenNu(D).gunst, gunst - 5, 'de heer wil erom gevraagd worden');
  assert.equal(T.bazenNu(D).vertrouwen, vertrouwen, 'het dorp vindt er niets van');
  assert.ok(T.inDeBoeken(veld), 'in zijn boeken');
  assert.equal(T.ontgonnenStukken(w), 0, 'van de meent ging niets af');
  assert.ok(berichten.some((t) => /Ons bos\? Nu ja/.test(t)), berichten.slice(-2).join(' | '));
  // Wat hij nog niet ontgon, is bos: daar tekent het spel geen akker, maar wat er staat.
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'bos');
});

test('een boom omhakken geeft hout en laat een stronk, die hij rooit; na de winter doen zijn mensen de rest', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  verzoek(S);
  zeg(S, 'Het bos. Ik meld');
  const veld = w.akkers.find((v) => v.ontginning);
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  const hout = D.voorraad.hout;
  assert.ok(T.hakBoom(D, boom.x, boom.y));
  assert.equal(D.voorraad.hout, hout + T.BOS_INSTELLINGEN.houtPerBoom, 'het hout gaat naar de schuur');
  assert.equal(T.ontginWerkOp(w, boom.x, boom.y), 'rooien', 'een stronk');
  assert.ok(T.isBegaanbaar(w, boom.x, boom.y), 'tussen de stronken loop je door (js/wereld.js, boomstronk)');
  assert.ok(T.rooi(D, boom.x, boom.y));
  assert.equal(T.ontginWerkOp(w, boom.x, boom.y), null);
  assert.ok(T.isBegaanbaar(w, boom.x, boom.y));
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'bos', 'nog niet omgespit');
  T.steekPlag(veld, boom.x, boom.y, w);
  assert.equal(T.akkerTegelStadium(veld, boom.x, boom.y, 'groen'), 'geploegd', 'kale grond');
  // De winter is om: wat er nog staat, hakken en rooien zijn mensen, en het hout gaat ook naar de schuur.
  const rest = bomenOp(w, veld);
  const voor = D.voorraad.hout;
  D.gebouwenDag = veld.ontginning.tot - 1;
  S.kalender.dag = veld.ontginning.tot + 0.3;
  T.tikGebouwenDag(D, veld.ontginning.tot);
  assert.equal(veld.ontginning, undefined, 'ontgonnen');
  for (const t of T.akkerTegels(veld)) assert.equal(T.voorwerpOp(w, t.x, t.y), null, `${t.x},${t.y} is leeg`);
  assert.ok(D.voorraad.hout >= voor + rest * T.BOS_INSTELLINGEN.houtPerBoom - 1e-9, `${rest} bomen: ${D.voorraad.hout - voor} hout`);
  assert.ok(berichten.some((t) => /Het bos van .* is ontgonnen/.test(t)), berichten.slice(-2).join(' | '));
});

test('de boer hakt naast de boom, met zijn gezicht ernaar; zijn boerin helpt; en het hout komt binnen', () => {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    const S = gehucht();
    const D = S.dorp;
    const w = S.wereld;
    const L = verzoek(S);
    const boer = L.ontgin.boer;
    zeg(S, 'Het bos. Ik meld');
    D.voorraad.graan = 600;
    const veld = w.akkers.find((v) => v.ontginning);
    const bomen = bomenOp(w, veld);
    const hout = D.voorraad.hout;
    let gezien = null;
    let hielp = false;
    for (let uur = 9; uur <= 17 && !gezien; uur++) {
      totUur(S, 40, uur);
      const wt = boer.werkt;
      if (wt && wt.soort === 'hakken' && wt.tot != null && !wt.rust && boer.tx === wt.x && boer.ty === wt.y) gezien = { ...wt, op: { ...wt.op } };
    }
    assert.ok(gezien, `hij hakt: ${JSON.stringify(boer.werkt)}`);
    assert.equal(Math.abs(gezien.op.x - gezien.x) + Math.abs(gezien.op.y - gezien.y), 1, 'hij staat recht naast de boom');
    assert.equal(T.veldOp(w, gezien.op.x, gezien.op.y), veld, 'de boom staat op zijn nieuwe veld');
    const helpers = D.bewoners.mensen.filter((p) => p.wezen && p.wezen !== boer && T.helpAnker(D, p.wezen));
    hielp = helpers.length > 0;
    assert.ok(hielp, 'zijn boerin of een groot kind helpt');
    totUur(S, 42, 18);
    const nu = bomenOp(w, veld);
    assert.ok(nu < bomen, `${bomen - nu} bomen om in drie dagen`);
    assert.ok(D.voorraad.hout > hout, 'het hout komt binnen');
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
});

test('stiekem: geen gunst, de inner zoekt het niet en de heer telt het niet; ziet de inner het toch, dan ben je op Sint-Maarten betrapt', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  const L = verzoek(S);
  const b = { ...L.ontgin.bos };
  const gunst = T.bazenNu(D).gunst;
  zeg(S, 'Het bos. De heer hoeft');
  const veld = w.akkers.find((v) => v.ontginning);
  assert.ok(veld.stiekem, 'stiekem');
  assert.equal(T.bazenNu(D).gunst, gunst, 'het kost geen gunst');
  assert.ok(!T.inDeBoeken(veld));
  assert.ok(berichten.some((t) => /de heer weet van niets\. Van de weg en de akkers ziet niemand het/.test(t)), berichten.slice(-2).join(' | '));
  // De heer telt hem niet, ook als hij alles zelf telt (geen rapport); en de inner gaat er niet heen.
  const tegels = (eis) => eis.regels.filter((r) => /akkertegels/.test(r.waarom)).map((r) => r.waarom).join();
  T.zetOptie('graanVoorDeHeer', 'pacht');
  try {
    const voor = w.akkers.filter((v) => v !== veld).reduce((n2, v) => n2 + v.b * v.h, 0);
    assert.match(tegels(T.eisVanDeHeer(D)), new RegExp(`pacht voor ${voor} akkertegels`));
  } finally {
    T.optiesTerug();
  }
  T.innerKomt(D, 40, false);
  assert.ok(!T.innerNogTeZien(D).some((d) => d.akker === veld), 'de inner zoekt hem niet');
  // Van zijn ronde ziet hij hem niet: van alle tegels van de ronde gekeken, zag hij geen tegel van deze akker.
  T.innerKijkt(D, { x: w.akkers[0].x, y: w.akkers[0].y });
  assert.equal(veld.stiekem.gezien, null);
  // Maar loopt hij er met de schout heen, dan ziet hij hem wel: hij schrijft, en zijn argwaan stijgt.
  const argwaan = D.inner.argwaan || 0;
  T.innerKijkt(D, { x: b.x + 2, y: b.y + b.h });
  assert.equal(veld.stiekem.gezien, 40, 'gezien');
  assert.ok(D.inner.argwaan > argwaan, 'argwanend');
  assert.ok(berichten.some((t) => /De inner blijft staan bij het bos/.test(t)));
  // Sint-Maarten: de heer weet het uit het rapport. Betrapt, en vanaf nu in de boeken.
  assert.deepEqual(T.heerVindtBosAkkers(D).length, 1);
  assert.equal(T.bazenNu(D).gunst, T.BAZEN_INSTELLINGEN.laatsteWaarschuwing, 'betrapt: de laatste waarschuwing');
  assert.ok(T.inDeBoeken(veld));
  assert.ok(berichten.some((t) => /Een akker in Ons bos, schout\?/.test(t)));
});

test('doorzoeken de soldaten het hele dorp, dan vinden ze een akker in het bos soms, en vaak als er een spoor heen loopt', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  verzoek(S);
  zeg(S, 'Het bos. De heer hoeft');
  const veld = w.akkers.find((v) => v.ontginning);
  assert.equal(T.vindKansVanBosAkker(D, veld, true), T.ONTGINNEN_INSTELLINGEN.vindenHeelDorp, 'soms');
  assert.deepEqual(T.zoekVerstopt(D, () => 0.5), [], 'onder de kans: niets');
  // Een spoor erheen (js/paden.js): wie er elke dag heen loopt, slijt het gras, ook voor het een paadje is dat je ziet.
  const breed = w.tegels[0].length;
  T.nieuwePaden(w);
  for (let k = 0; k < 2; k++) w.paden.slijt[veld.x + k + (veld.y + veld.h) * breed] = T.PADEN_INSTELLINGEN.blijftPad;
  assert.ok(!T.spoorNaar(D, veld), 'twee tegels is nog geen spoor');
  w.paden.gesleten.add(veld.x + 2 + (veld.y + veld.h) * breed); // en een paadje telt ook
  assert.ok(T.spoorNaar(D, veld));
  assert.equal(T.vindKansVanBosAkker(D, veld, true), T.ONTGINNEN_INSTELLINGEN.vindenMetSpoor, 'vaak');
  const gunst = T.bazenNu(D).gunst;
  const gevonden = T.zoekVerstopt(D, () => 0.5);
  assert.deepEqual(gevonden.length, 1);
  assert.match(gevonden[0], /^langs het spoor de akker in het bos van /);
  assert.ok(T.inDeBoeken(veld), 'gevonden: in de boeken');
  assert.ok(T.bazenNu(D).gunst < gunst, 'betrapt');
});

test('ben je weg, dan meldt een raadsman die de heer vreest het bos, en doet een heethoofd het stiekem', () => {
  const S = gehucht();
  const D = S.dorp;
  for (const m of S.wereld.meenten) m.meent = null; // alleen het bos
  const L = verzoek(S);
  const raadsman = D.bewoners.mensen.find((p) => p.wezen && T.isBoer(p.wezen) && p.wezen !== L.ontgin.boer);
  raadsman.wezen.karakter = 'grijsaard';
  assert.equal(T.raadsmanKeuze(D, raadsman, 'ontginverzoek').doe.ontgin, 'bos', 'de grijsaard meldt het');
  raadsman.wezen.karakter = 'heethoofd';
  assert.equal(T.raadsmanKeuze(D, raadsman, 'ontginverzoek').doe.ontgin, 'stiekem', 'het heethoofd doet het stiekem');
});

test('een akker in het bos, stiekem en half gehakt, gaat mee in een bewaard spel', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  verzoek(S);
  zeg(S, 'Het bos. De heer hoeft');
  const veld = w.akkers.find((v) => v.ontginning);
  const boom = T.akkerTegels(veld).find((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken');
  T.hakBoom(D, boom.x, boom.y);
  const gelezen = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
  assert.ok(gelezen.gelukt, gelezen.reden);
  const w2 = gelezen.staat.wereld;
  const terug = w2.akkers.find((v) => v.naam === veld.naam);
  assert.equal(terug.ontginning.op, 'bos');
  assert.deepEqual(terug.stiekem, veld.stiekem);
  const stronk = w2.voorwerpen.find((v) => v.x === boom.x && v.y === boom.y);
  assert.equal(stronk && stronk.soort, 'boomstronk', 'de stronk staat er nog');
});

test('is het eerder af dan de maand of de winter, dan is het eerder ontgonnen', () => {
  const S = gehucht();
  const D = S.dorp;
  verzoek(S);
  zeg(S, 'Het bos. Ik meld');
  const veld = S.wereld.akkers.find((v) => v.ontginning);
  for (const t of T.akkerTegels(veld)) {
    T.hakBoom(D, t.x, t.y);
    T.rooi(D, t.x, t.y);
  }
  D.gebouwenDag = 40;
  T.tikGebouwenDag(D, 41);
  assert.ok(veld.ontginning, 'nog niet omgespit: nog niet af');
  for (const t of T.akkerTegels(veld)) T.steekPlag(veld, t.x, t.y, S.wereld);
  D.gebouwenDag = 41;
  T.tikGebouwenDag(D, 42);
  assert.equal(veld.ontginning, undefined, 'af, op dag 42 in plaats van 130');
  assert.equal(D.ontginnen.klaar, 42);
});

// Vraag 107, g1 (Marcel, 5 okt: "1 en 3 later inderdaad"): ook als de argwaan laag is, lopen er op Sint-Maarten een paar
// soldaten door het bos. Zelden vinden ze een akker die niet in de boeken staat, maar elk stuk is een eigen kans.
test('elk jaar op Sint-Maarten lopen er soldaten door het bos: zelden vinden ze een stiekeme akker, en vaak langs een spoor', () => {
  const S = gehucht();
  const D = S.dorp;
  const w = S.wereld;
  assert.deepEqual(T.doorzoekHetBos(D, () => 0), [], 'zonder stiekeme akker zoeken ze niets, en zeggen ze niets');
  const voor = berichten.length;
  verzoek(S);
  zeg(S, 'Het bos. De heer hoeft');
  const veld = w.akkers.find((v) => v.stiekem);
  assert.equal(T.vindKansVanBosAkker(D, veld, false), T.ONTGINNEN_INSTELLINGEN.vindenInHetBos, 'zelden');
  assert.deepEqual(T.doorzoekHetBos(D, () => 0.2), [], 'boven de kans: niets');
  assert.ok(berichten.slice(voor).some((t) => /niets dan dennennaalden/.test(t)));
  assert.ok(veld.stiekem, 'nog niet in de boeken');
  const gunst = T.bazenNu(D).gunst;
  const gevonden = T.doorzoekHetBos(D, () => 0.05);
  assert.equal(gevonden.length, 1);
  assert.ok(berichten.some((t) => /Een paar soldaten lopen door het bos, en vinden de akker in het bos van /.test(t)));
  assert.ok(T.inDeBoeken(veld), 'gevonden: in de boeken');
  assert.ok(T.bazenNu(D).gunst < gunst, 'betrapt');
  // Op Sint-Maarten, bij lage argwaan: de heer op het plein, zijn soldaten zoeken met de schout, en een paar in het bos.
  const echt = T.doorzoekHetBos;
  let gezocht = 0;
  T.doorzoekHetBos = () => (gezocht++, []);
  try {
    D.inner = D.inner || T.nieuweInner();
    D.inner.argwaan = 0;
    D.heer = D.heer || {};
    D.heer.bezoek = { staat: false };
    T.heerStaatErOp(D);
    assert.equal(gezocht, 1, 'het bos wordt doorzocht');
  } finally {
    T.doorzoekHetBos = echt;
  }
});
