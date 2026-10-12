// De raadsman (js/raadsman.js; werklijst vraag 66, Marcel, 30 sep: "A Ja, b Nee, c Nee, wordt automatisch als de schout
// er niet is. D prima"): een van de boeren, met twee gelote vaardigheden; is de schout er niet als iemand hem met een
// voorval zoekt, dan beslist hij, met één weging (T.RAADSMAN_INSTELLINGEN.kiest) en naar wat hij kan. Hij maait trager.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het proefdorp (test/grond.cjs) met drie boerderijen, dus drie boeren om uit te kiezen, en een vast zaad voor hun vaardigheden
// (zoals in test/voorvallen.test.cjs).
function dorp(zaad = 7) {
  const S = proefDorp(T, { boerderijen: 3 }).S;
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  return S;
}

const boeren = (S) => S.dorp.bewoners.mensen.filter((p) => T.isBoer(S.dorp, p));

// Een voorval dat nu loopt, over mensen die erbij passen, op dag `dag`, en zonder dat er vandaag een ander komt.
function metVoorval(S, id, dag = 10, niet = []) {
  S.kalender.dag = dag;
  const v = T.VOORVALLEN[id];
  const oud = { vervolg: v.vervolg, als: v.als };
  Object.assign(v, { vervolg: false, als: undefined });
  let mensen = null;
  for (let d = dag; d < dag + 40 && !mensen; d++) {
    const m = T.voorvalKan(S.dorp, id, d);
    if (m && !niet.includes(m.wie) && !niet.includes(m.ander)) mensen = m;
  }
  Object.assign(v, oud);
  assert.ok(mensen, `er is iemand voor "${id}"`);
  S.dorp.voorvallen.volgende = 1e9;
  return T.beginVoorval(S.dorp, id, mensen.wie, mensen.ander, dag);
}

// Een raadsman die niet zelf in het voorval zit.
function raadsman(S, niet = []) {
  const p = boeren(S).find((b) => !niet.includes(b));
  assert.ok(p, 'een boer die er niet zelf in zit');
  assert.ok(T.kiesRaadsman(S.dorp, p).kan);
  return p;
}

// Met dit stuk van zijn weging (T.RAADSMAN_INSTELLINGEN.kiest), voor één toets.
function metWeging(weging, fn) {
  const kiest = T.RAADSMAN_INSTELLINGEN.kiest;
  const oud = { ...kiest };
  Object.assign(kiest, weging);
  try {
    return fn();
  } finally {
    Object.assign(kiest, oud);
  }
}

// De schout is weg (een ander gebied), zolang fn loopt: dan beslist de raadsman (werklijst vraag 68, B). Hij gaat van
// de kaart van het dorp af en naar een andere, zoals T.gaNaarGebied hem verzet (js/gebied.js): T.schoutIsWeg kijkt
// naar de kaart van het dorp, niet naar waar hij nu is.
function weg(S, fn) {
  const hier = S.wereld;
  const kaart = S.dorp.wereld;
  const plek = kaart.wezens.indexOf(S.schout);
  assert.ok(plek >= 0, 'de schout staat op de kaart van zijn dorp');
  kaart.wezens.splice(plek, 1);
  S.wereld = { wezens: [S.schout], naam: 'elders' };
  try {
    return fn();
  } finally {
    S.wereld = hier;
    kaart.wezens.splice(plek, 0, S.schout);
  }
}

// Met deze vaardigheden, voor één toets.
function metKunde(kunde, fn) {
  const echt = T.vaardighedenVan;
  T.vaardighedenVan = () => kunde;
  try {
    return fn();
  } finally {
    T.vaardighedenVan = echt;
  }
}

test('uit drie boeren, vast per spel, elk met twee vaardigheden, goed of slecht', () => {
  const S = dorp();
  const k = T.raadsmanKandidaten(S.dorp);
  assert.equal(k.length, T.RAADSMAN_INSTELLINGEN.kandidaten);
  assert.ok(k.every((p) => T.isBoer(S.dorp, p)), 'het zijn boeren');
  assert.equal(new Set(k).size, k.length, 'drie verschillende');
  assert.deepEqual(T.raadsmanKandidaten(dorp().dorp).map((p) => p.id), k.map((p) => p.id), 'hetzelfde zaad, dezelfde kandidaten');
  for (const p of k) {
    const kan = T.vaardighedenVan(S.dorp, p);
    assert.equal(Object.keys(kan).length, 2);
    for (const [soort, niveau] of Object.entries(kan)) {
      assert.ok(T.VAARDIGHEDEN[soort], soort);
      assert.ok(['goed', 'slecht'].includes(niveau));
    }
    assert.deepEqual(T.vaardighedenVan(S.dorp, p), kan, 'vast');
  }
  assert.match(T.overRaadsmanTekst(S.dorp, k[0]), new RegExp(`^${T.naamVanBewoner(k[0])} · `));
  // Een ander zaad geeft andere vaardigheden.
  const ander = dorp(8);
  assert.ok(boeren(S).some((p, i) => JSON.stringify(T.vaardighedenVan(S.dorp, p)) !== JSON.stringify(T.vaardighedenVan(ander.dorp, boeren(ander)[i]))), 'geloot per spel');
});

test('een boer wordt raadsman, de vorige niet meer, en wie het is, maait trager', () => {
  const S = dorp();
  const [a, b] = boeren(S);
  assert.equal(T.raadsmanMaait(a.wezen), 1, 'een boer maait zoals hij maait');
  assert.equal(T.raadsmanVan(S.dorp), null, 'zonder keuze is er geen');
  assert.ok(T.kiesRaadsman(S.dorp, a).kan);
  assert.equal(T.raadsmanVan(S.dorp), a);
  assert.ok(Math.abs(T.raadsmanMaait(a.wezen) - T.RAADSMAN_INSTELLINGEN.maaien) < 1e-9, 'hij maait trager');
  assert.ok(T.RAADSMAN_INSTELLINGEN.maaien > 1);
  assert.match(T.overRaadsmanTekst(S.dorp, a), new RegExp(`^${T.naamVanBewoner(a)} · `), 'in het venster staat wie hij is en wat hij kan');
  T.kiesRaadsman(S.dorp, b);
  assert.equal(T.raadsmanVan(S.dorp), b);
  assert.ok(!a.wezen.raadsman, 'de vorige is het niet meer');
  assert.equal(T.raadsmanMaait(a.wezen), 1);
  const knecht = S.dorp.bewoners.mensen.find((p) => !T.isBoer(S.dorp, p) && !p.schout);
  assert.equal(T.kiesRaadsman(S.dorp, knecht).kan, false, 'alleen een boer');
});

test('ben je weg als zijn tijd om is, dan beslist de raadsman, naar zijn weging', () => {
  // Zijn weging (T.RAADSMAN_INSTELLINGEN.kiest) heeft sinds het snoeien (stap 4, 12 okt) geen karakters meer; wat de dief
  // krijgt, hangt af van wat verbannen hem waard is: plus is streng, min is mild.
  const uitkomst = (verban) => metWeging({ verban }, () => {
    const S = dorp();
    const L = metVoorval(S, 'diefstal');
    const p = raadsman(S, [L.wie, L.ander]);
    const dief = L.ander;
    berichten.length = 0;
    weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
    assert.equal(S.dorp.voorvallen.lopend, null, 'het voorval is af');
    assert.equal(S.dorp.voorvallen.doorRaadsman, 1);
    assert.ok(berichten.some((t) => t.startsWith(`${T.naamVanBewoner(p)}, your advisor, decided on the theft: "`)), berichten.join(' / '));
    assert.ok(!berichten.some((t) => /did not get to speak to you/.test(t)), 'het gaat niet voorbij');
    assert.ok(!T.voorvalStemming(S.dorp, L.tot).last.includes('a reeve who was not there'));
    return { verbannen: !S.dorp.bewoners.mensen.includes(dief), goud: S.dorp.voorraad.goud, S, p };
  });
  const streng = uitkomst(5);
  assert.ok(streng.verbannen, 'wie verbannen veel waard vindt, verbant de dief');
  const mild = uitkomst(-5);
  assert.ok(!mild.verbannen, 'wie het niet waard vindt, verbant niet');
  assert.ok(mild.goud > 0, 'hij legt een boete op, voor de kist');
  // In de balk heet het naar hem.
  const s = T.voorvalStemming(mild.S.dorp, dagNu(mild.S));
  assert.ok(s.blij.includes(`what ${T.naamVanBewoner(mild.p)} decided about the theft`), JSON.stringify(s));
});

const dagNu = (S) => Math.floor(S.kalender.dag);

test('de gunst van de heer weegt mee: wie haar veel waard vindt, bouwt het standbeeld, wie niet, zet een vogelverschrikker', () => {
  // Een standbeeld: hout -20, tevreden -2, gunst +6. Een vogelverschrikker: hout -3, tevreden +3, gunst -3. Het hout telt
  // per tien, dus (met tevreden en waren op 1): het standbeeld -2 - 2 + 6g, de vogelverschrikker -0,3 + 3 - 3g.
  const kies = (gunst) => metWeging({ gunst }, () => {
    const S = dorp();
    const L = metVoorval(S, 'standbeeld');
    T.zetVoorraad(S.dorp, 'hout', 100);
    const p = raadsman(S, [L.wie]);
    return metKunde({}, () => T.raadsmanKeuze(S.dorp, p, 'standbeeld').zeg);
  });
  assert.match(kies(T.RAADSMAN_INSTELLINGEN.kiest.gunst), /statue/, 'de standaard: 2 tegen -0,3');
  assert.match(kies(0), /scarecrow/, 'zonder gunst: -4 tegen 2,7');
});

test('hij weegt een dode zwaarder of lichter: de put laten schoonmaken, of bidden', () => {
  // De ziekte: de put schoonmaken (goud -2, koorts 40), bier (bier -15, koorts 70) of bidden (koorts 100). Een dode weegt
  // per tien procent kans; de koorts telt voor een vijfde van een sterfkans.
  const kies = (dood) => metWeging({ dood }, () => {
    const S = dorp();
    const L = metVoorval(S, 'ziekte');
    T.zetVoorraad(S.dorp, 'goud', 20);
    T.zetVoorraad(S.dorp, 'bier', 30);
    const p = raadsman(S, [L.wie]);
    return metKunde({}, () => T.raadsmanKeuze(S.dorp, p, 'ziekte').zeg);
  });
  assert.match(kies(T.RAADSMAN_INSTELLINGEN.kiest.dood), /Pray/, 'de standaard: -2 tegen -2,8 en -2,9');
  assert.match(kies(5), /well/, 'wie een dode zwaar weegt, laat de put schoonmaken');
});

test('hij kiest wat er te betalen valt', () => {
  const S = dorp();
  const L = metVoorval(S, 'ziekte');
  T.zetVoorraad(S.dorp, 'goud', 0);
  T.zetVoorraad(S.dorp, 'bier', 0);
  const p = raadsman(S, [L.wie]);
  // Weegt hij een dode zwaar, dan laat hij liever de put schoonmaken; maar dat kost goud, dus zonder goud en bier...
  metWeging({ dood: 5 }, () => assert.match(metKunde({}, () => T.raadsmanKeuze(S.dorp, p, 'ziekte').zeg), /Pray/, 'zonder goud en bier blijft alleen bidden over'));
});

test('wat hij kan, telt mee: goed maakt wat slecht uitvalt minder erg, slecht maakt het erger', () => {
  const S = dorp();
  const p = boeren(S)[0];
  const doe = { tevreden: 4, gunst: -4, goud: -4, hout: -10, sterfkans: 20 };
  const goed = metKunde({ rechtspreken: 'goed', zwijgen: 'goed', rekenen: 'goed', bouwen: 'goed', vechten: 'goed' }, () => T.metVaardigheden(S.dorp, p, doe));
  assert.deepEqual(goed, { tevreden: 6, gunst: -2, goud: -3, hout: -5, sterfkans: 10 });
  const slecht = metKunde({ rechtspreken: 'slecht', zwijgen: 'slecht', rekenen: 'slecht', bouwen: 'slecht', vechten: 'slecht' }, () => T.metVaardigheden(S.dorp, p, doe));
  assert.deepEqual(slecht, { tevreden: 2, gunst: -6, goud: -5, hout: -15, sterfkans: 30 });
  assert.deepEqual(metKunde({ zwijgen: 'slecht' }, () => T.metVaardigheden(S.dorp, p, { gunst: 4 })), { gunst: 2 }, 'wie niet kan zwijgen, stelt de heer ook minder gerust');
  assert.deepEqual(metKunde({}, () => T.metVaardigheden(S.dorp, p, doe)), doe, 'wie niets bijzonders kan, doet het zoals het staat');
});

test('is de schout niet in het dorp, dan beslist hij meteen, als wie het zegt gaat zoeken', () => {
  const S = dorp();
  const L = metVoorval(S, 'lening', 20);
  raadsman(S, [L.wie]);
  weg(S, () => {
    S.kalender.dag = L.vanaf - 0.01;
    T.werkVoorvallenBij(S, S.dorp);
    assert.equal(S.dorp.voorvallen.lopend, L, 'vóór zijn uur nog niet');
    S.kalender.dag = L.vanaf + 0.01;
    T.werkVoorvallenBij(S, S.dorp);
    assert.equal(S.dorp.voorvallen.lopend, null, 'dan wel');
    assert.equal(S.dorp.voorvallen.doorRaadsman, 1);
  });
});

test('ben je in het dorp en spreek je hem niet op tijd, dan gaat het voorbij, ook met een raadsman (vraag 68, B)', () => {
  const S = dorp();
  const L = metVoorval(S, 'diefstal');
  raadsman(S, [L.wie, L.ander]);
  berichten.length = 0;
  T.tikVoorvallenDag(S.dorp, L.tot);
  assert.equal(S.dorp.voorvallen.lopend, null);
  assert.equal(S.dorp.voorvallen.doorRaadsman, 0, 'hij beslist niet');
  assert.ok(berichten.some((t) => /did not get to speak to you/.test(t)), berichten.join(' / '));
  assert.ok(T.voorvalStemming(S.dorp, L.tot).last.includes('a reeve who had no time'));
  // Met de spelregel "Ook als je niet spreekt" wel: wie je wegstuurt, laat je aan hem over.
  try {
    T.zetOptie('raadsman', 'ook');
    const S2 = dorp();
    const L2 = metVoorval(S2, 'diefstal');
    raadsman(S2, [L2.wie, L2.ander]);
    T.tikVoorvallenDag(S2.dorp, L2.tot);
    assert.equal(S2.dorp.voorvallen.lopend, null);
    assert.equal(S2.dorp.voorvallen.doorRaadsman, 1);
  } finally {
    T.optiesTerug();
  }
});

test('zonder raadsman, of met de spelregel uit, gaat het voorbij, ook als je weg bent', () => {
  const S = dorp();
  const L = metVoorval(S, 'lening', 30);
  weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
  assert.ok(T.voorvalStemming(S.dorp, L.tot).last.includes('a reeve who was not there'));
  try {
    T.zetOptie('raadsman', 'uit');
    const S2 = dorp();
    const L2 = metVoorval(S2, 'lening', 30);
    const p = raadsman(S2, [L2.wie]);
    assert.equal(T.raadsmanVan(S2.dorp), null, 'uit is er geen raadsman');
    assert.equal(T.raadsmanMaait(p.wezen), 1, 'en hij maait niet trager');
    weg(S2, () => T.tikVoorvallenDag(S2.dorp, L2.tot));
    assert.ok(T.voorvalStemming(S2.dorp, L2.tot).last.includes('a reeve who was not there'));
  } finally {
    T.optiesTerug();
  }
});

test('bewaren en laden: de raadsman blijft de raadsman, en wat hij besloot', () => {
  const S = dorp();
  const L = metVoorval(S, 'diefstal');
  const p = raadsman(S, [L.wie, L.ander]);
  weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
  const S2 = dorp();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
  assert.equal(T.raadsmanVan(S2.dorp).id, p.id);
  assert.equal(S2.dorp.raadsman.besluiten.length, 1);
  assert.equal(S2.dorp.raadsman.besluiten[0].id, 'diefstal');
});
