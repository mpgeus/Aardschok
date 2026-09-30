// De raadsman (js/raadsman.js; werklijst vraag 66, Marcel, 30 sep: "A Ja, b Nee, c Nee, wordt automatisch als de schout
// er niet is. D prima"): een van de boeren, met twee gelote vaardigheden; is de schout er niet als iemand hem met een
// voorval zoekt, dan beslist hij, naar zijn karakter en wat hij kan. Hij maait trager.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/voorvallen.test.cjs).
function gehucht(zaad = 7) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  return S;
}

const boeren = (S) => S.dorp.bewoners.mensen.filter((p) => T.isBoer(p.wezen));

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

// Een raadsman met dit karakter, die niet zelf in het voorval zit.
function raadsman(S, karakter, niet = []) {
  const p = boeren(S).find((b) => !niet.includes(b));
  p.wezen.karakter = karakter;
  assert.ok(T.kiesRaadsman(S.dorp, p).kan);
  return p;
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
  const S = gehucht();
  const k = T.raadsmanKandidaten(S.dorp);
  assert.equal(k.length, T.RAADSMAN_INSTELLINGEN.kandidaten);
  assert.ok(k.every((p) => T.isBoer(p.wezen)), 'het zijn boeren');
  assert.equal(new Set(k).size, k.length, 'drie verschillende');
  assert.deepEqual(T.raadsmanKandidaten(gehucht().dorp).map((p) => p.wie), k.map((p) => p.wie), 'hetzelfde zaad, dezelfde kandidaten');
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
  // Een ander zaad geeft andere vaardigheden, en het lot van de boeren (hun karakter, js/boeren.js) blijft wat het was.
  const ander = gehucht(8);
  assert.ok(boeren(S).some((p, i) => JSON.stringify(T.vaardighedenVan(S.dorp, p)) !== JSON.stringify(T.vaardighedenVan(ander.dorp, boeren(ander)[i]))), 'geloot per spel');
  assert.deepEqual(boeren(ander).map((p) => p.wezen.karakter), boeren(S).map((p) => p.wezen.karakter), 'het karakter komt uit het lot, niet uit dit zaad');
});

test('een boer wordt raadsman, de vorige niet meer, en wie het is, maait trager', () => {
  const S = gehucht();
  const [a, b] = boeren(S);
  const voor = T.boerFactor(a.wezen, 'maaien');
  assert.equal(T.raadsmanVan(S.dorp), null, 'zonder keuze is er geen');
  assert.ok(T.kiesRaadsman(S.dorp, a).kan);
  assert.equal(T.raadsmanVan(S.dorp), a);
  assert.ok(Math.abs(T.boerFactor(a.wezen, 'maaien') - voor * T.RAADSMAN_INSTELLINGEN.maaien) < 1e-9, 'hij maait trager');
  assert.ok(T.overBoer(a.wezen).eigenschappen.includes('je raadsman'), 'bij de muis staat het');
  T.kiesRaadsman(S.dorp, b);
  assert.equal(T.raadsmanVan(S.dorp), b);
  assert.ok(!a.wezen.raadsman, 'de vorige is het niet meer');
  assert.ok(Math.abs(T.boerFactor(a.wezen, 'maaien') - voor) < 1e-9);
  const knecht = S.dorp.bewoners.mensen.find((p) => !T.isBoer(p.wezen) && !p.schout);
  assert.equal(T.kiesRaadsman(S.dorp, knecht).kan, false, 'alleen een boer');
});

test('ben je weg als zijn tijd om is, dan beslist de raadsman, naar zijn karakter', () => {
  const uitkomst = (karakter) => {
    const S = gehucht();
    const L = metVoorval(S, 'diefstal');
    const p = raadsman(S, karakter, [L.wie, L.ander]);
    const dief = L.ander;
    berichten.length = 0;
    weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
    assert.equal(S.dorp.voorvallen.lopend, null, 'het voorval is af');
    assert.equal(S.dorp.voorvallen.doorRaadsman, 1);
    assert.ok(berichten.some((t) => t.startsWith(`${T.naamVanBewoner(p)}, je raadsman, besliste over de diefstal: "`)), berichten.join(' / '));
    assert.ok(!berichten.some((t) => /niet gesproken/.test(t)), 'het gaat niet voorbij');
    assert.ok(!T.voorvalStemming(S.dorp, L.tot).last.includes('een schout die er niet was'));
    return { verbannen: !S.dorp.bewoners.mensen.includes(dief), goud: S.dorp.voorraad.goud, S, p };
  };
  const streng = uitkomst('heethoofd');
  assert.ok(streng.verbannen, 'de heethoofd verbant de dief');
  const zuinig = uitkomst('woekeraar');
  assert.ok(!zuinig.verbannen, 'de woekeraar verbant niet');
  assert.ok(zuinig.goud > 0, 'hij legt een boete op, voor de kist');
  // In de balk heet het naar hem.
  const s = T.voorvalStemming(zuinig.S.dorp, dagNu(zuinig.S));
  assert.ok(s.blij.includes(`wat ${T.naamVanBewoner(zuinig.p)} besliste over de diefstal`), JSON.stringify(s));
});

const dagNu = (S) => Math.floor(S.kalender.dag);

test('karakters kiezen verschillend: de vrome bidt, de vroedvrouw laat de put schoonmaken', () => {
  const kies = (karakter) => {
    const S = gehucht();
    const L = metVoorval(S, 'ziekte');
    T.zetVoorraad(S.dorp, 'goud', 20);
    T.zetVoorraad(S.dorp, 'bier', 30);
    const p = raadsman(S, karakter, [L.wie]);
    return metKunde({}, () => T.raadsmanKeuze(S.dorp, p, 'ziekte').zeg);
  };
  assert.match(kies('vrome'), /Bidden/);
  assert.match(kies('vroedvrouw'), /put/);
});

test('hij kiest wat er te betalen valt', () => {
  const S = gehucht();
  const L = metVoorval(S, 'ziekte');
  T.zetVoorraad(S.dorp, 'goud', 0);
  T.zetVoorraad(S.dorp, 'bier', 0);
  const p = raadsman(S, 'vroedvrouw', [L.wie]);
  assert.match(metKunde({}, () => T.raadsmanKeuze(S.dorp, p, 'ziekte').zeg), /Bidden/, 'zonder goud en bier blijft alleen bidden over');
});

test('wat hij kan, telt mee: goed maakt wat slecht uitvalt minder erg, slecht maakt het erger', () => {
  const S = gehucht();
  const p = boeren(S)[0];
  const doe = { tevreden: 4, argwaan: 4, goud: -4, hout: -10, sterfkans: 20 };
  const goed = metKunde({ rechtspreken: 'goed', zwijgen: 'goed', rekenen: 'goed', bouwen: 'goed', vechten: 'goed' }, () => T.metVaardigheden(S.dorp, p, doe));
  assert.deepEqual(goed, { tevreden: 6, argwaan: 2, goud: -3, hout: -5, sterfkans: 10 });
  const slecht = metKunde({ rechtspreken: 'slecht', zwijgen: 'slecht', rekenen: 'slecht', bouwen: 'slecht', vechten: 'slecht' }, () => T.metVaardigheden(S.dorp, p, doe));
  assert.deepEqual(slecht, { tevreden: 2, argwaan: 6, goud: -5, hout: -15, sterfkans: 30 });
  assert.deepEqual(metKunde({ zwijgen: 'slecht' }, () => T.metVaardigheden(S.dorp, p, { argwaan: -4 })), { argwaan: -2 }, 'wie niet kan zwijgen, stelt de inner ook minder gerust');
  assert.deepEqual(metKunde({}, () => T.metVaardigheden(S.dorp, p, doe)), doe, 'wie niets bijzonders kan, doet het zoals het staat');
});

test('is de schout niet in het dorp, dan beslist hij meteen, als wie het zegt gaat zoeken', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 20);
  raadsman(S, 'weduwe', [L.wie]);
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
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  raadsman(S, 'woekeraar', [L.wie, L.ander]);
  berichten.length = 0;
  T.tikVoorvallenDag(S.dorp, L.tot);
  assert.equal(S.dorp.voorvallen.lopend, null);
  assert.equal(S.dorp.voorvallen.doorRaadsman, 0, 'hij beslist niet');
  assert.ok(berichten.some((t) => /niet gesproken/.test(t)), berichten.join(' / '));
  assert.ok(T.voorvalStemming(S.dorp, L.tot).last.includes('een schout die geen tijd had'));
  // Met de spelregel "Ook als je niet spreekt" wel: wie je wegstuurt, laat je aan hem over.
  try {
    T.zetOptie('raadsman', 'ook');
    const S2 = gehucht();
    const L2 = metVoorval(S2, 'diefstal');
    raadsman(S2, 'woekeraar', [L2.wie, L2.ander]);
    T.tikVoorvallenDag(S2.dorp, L2.tot);
    assert.equal(S2.dorp.voorvallen.lopend, null);
    assert.equal(S2.dorp.voorvallen.doorRaadsman, 1);
  } finally {
    T.optiesTerug();
  }
});

test('zonder raadsman, of met de spelregel uit, gaat het voorbij, ook als je weg bent', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 30);
  weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
  assert.ok(T.voorvalStemming(S.dorp, L.tot).last.includes('een schout die er niet was'));
  try {
    T.zetOptie('raadsman', 'uit');
    const S2 = gehucht();
    const L2 = metVoorval(S2, 'lening', 30);
    const p = raadsman(S2, 'weduwe', [L2.wie]);
    assert.equal(T.raadsmanVan(S2.dorp), null, 'uit is er geen raadsman');
    assert.ok(!T.overBoer(p.wezen).eigenschappen.includes('je raadsman'));
    weg(S2, () => T.tikVoorvallenDag(S2.dorp, L2.tot));
    assert.ok(T.voorvalStemming(S2.dorp, L2.tot).last.includes('een schout die er niet was'));
  } finally {
    T.optiesTerug();
  }
});

test('bewaren en laden: de raadsman blijft de raadsman, en wat hij besloot', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const p = raadsman(S, 'woekeraar', [L.wie, L.ander]);
  weg(S, () => T.tikVoorvallenDag(S.dorp, L.tot));
  const S2 = gehucht();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
  assert.equal(T.raadsmanVan(S2.dorp).wie, p.wie);
  assert.equal(S2.dorp.raadsman.besluiten.length, 1);
  assert.equal(S2.dorp.raadsman.besluiten[0].id, 'diefstal');
});
