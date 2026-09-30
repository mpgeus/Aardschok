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
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, trede: 'gehucht' };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  S.lot = Object.assign(S.lot || {}, { zaad });
  S.voorvallen = T.nieuweVoorvallen();
  return S;
}

const boeren = (S) => S.bewoners.mensen.filter((p) => T.isBoer(p.wezen));

// Een voorval dat nu loopt, over mensen die erbij passen, op dag `dag`, en zonder dat er vandaag een ander komt.
function metVoorval(S, id, dag = 10, niet = []) {
  S.kalender.dag = dag;
  const v = T.VOORVALLEN[id];
  const oud = { vervolg: v.vervolg, als: v.als };
  Object.assign(v, { vervolg: false, als: undefined });
  let mensen = null;
  for (let d = dag; d < dag + 40 && !mensen; d++) {
    const m = T.voorvalKan(S, id, d);
    if (m && !niet.includes(m.wie) && !niet.includes(m.ander)) mensen = m;
  }
  Object.assign(v, oud);
  assert.ok(mensen, `er is iemand voor "${id}"`);
  S.voorvallen.volgende = 1e9;
  return T.beginVoorval(S, id, mensen.wie, mensen.ander, dag);
}

// Een raadsman met dit karakter, die niet zelf in het voorval zit.
function raadsman(S, karakter, niet = []) {
  const p = boeren(S).find((b) => !niet.includes(b));
  p.wezen.karakter = karakter;
  assert.ok(T.kiesRaadsman(S, p).kan);
  return p;
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
  const k = T.raadsmanKandidaten(S);
  assert.equal(k.length, T.RAADSMAN_INSTELLINGEN.kandidaten);
  assert.ok(k.every((p) => T.isBoer(p.wezen)), 'het zijn boeren');
  assert.equal(new Set(k).size, k.length, 'drie verschillende');
  assert.deepEqual(T.raadsmanKandidaten(gehucht()).map((p) => p.wie), k.map((p) => p.wie), 'hetzelfde zaad, dezelfde kandidaten');
  for (const p of k) {
    const kan = T.vaardighedenVan(S, p);
    assert.equal(Object.keys(kan).length, 2);
    for (const [soort, niveau] of Object.entries(kan)) {
      assert.ok(T.VAARDIGHEDEN[soort], soort);
      assert.ok(['goed', 'slecht'].includes(niveau));
    }
    assert.deepEqual(T.vaardighedenVan(S, p), kan, 'vast');
  }
  assert.match(T.overRaadsmanTekst(S, k[0]), new RegExp(`^${T.naamVanBewoner(k[0])} · `));
  // Een ander zaad geeft andere vaardigheden, en het lot van de boeren (hun karakter, js/boeren.js) blijft wat het was.
  const ander = gehucht(8);
  assert.ok(boeren(S).some((p, i) => JSON.stringify(T.vaardighedenVan(S, p)) !== JSON.stringify(T.vaardighedenVan(ander, boeren(ander)[i]))), 'geloot per spel');
  assert.deepEqual(boeren(ander).map((p) => p.wezen.karakter), boeren(S).map((p) => p.wezen.karakter), 'het karakter komt uit het lot, niet uit dit zaad');
});

test('een boer wordt raadsman, de vorige niet meer, en wie het is, maait trager', () => {
  const S = gehucht();
  const [a, b] = boeren(S);
  const voor = T.boerFactor(a.wezen, 'maaien');
  assert.equal(T.raadsmanVan(S), null, 'zonder keuze is er geen');
  assert.ok(T.kiesRaadsman(S, a).kan);
  assert.equal(T.raadsmanVan(S), a);
  assert.ok(Math.abs(T.boerFactor(a.wezen, 'maaien') - voor * T.RAADSMAN_INSTELLINGEN.maaien) < 1e-9, 'hij maait trager');
  assert.ok(T.overBoer(a.wezen).eigenschappen.includes('je raadsman'), 'bij de muis staat het');
  T.kiesRaadsman(S, b);
  assert.equal(T.raadsmanVan(S), b);
  assert.ok(!a.wezen.raadsman, 'de vorige is het niet meer');
  assert.ok(Math.abs(T.boerFactor(a.wezen, 'maaien') - voor) < 1e-9);
  const knecht = S.bewoners.mensen.find((p) => !T.isBoer(p.wezen) && !p.schout);
  assert.equal(T.kiesRaadsman(S, knecht).kan, false, 'alleen een boer');
});

test('wie je niet sprak, beslist de raadsman, naar zijn karakter', () => {
  const uitkomst = (karakter) => {
    const S = gehucht();
    const L = metVoorval(S, 'diefstal');
    const p = raadsman(S, karakter, [L.wie, L.ander]);
    const dief = L.ander;
    berichten.length = 0;
    T.tikVoorvallenDag(S, L.tot);
    assert.equal(S.voorvallen.lopend, null, 'het voorval is af');
    assert.equal(S.voorvallen.doorRaadsman, 1);
    assert.ok(berichten.some((t) => t.startsWith(`${T.naamVanBewoner(p)}, je raadsman, besliste over de diefstal: "`)), berichten.join(' / '));
    assert.ok(!berichten.some((t) => /niet gesproken/.test(t)), 'het gaat niet voorbij');
    assert.ok(!T.voorvalStemming(S, L.tot).last.includes('een schout die er niet was'));
    return { verbannen: !S.bewoners.mensen.includes(dief), goud: S.voorraad.goud, S, p };
  };
  const streng = uitkomst('heethoofd');
  assert.ok(streng.verbannen, 'de heethoofd verbant de dief');
  const zuinig = uitkomst('woekeraar');
  assert.ok(!zuinig.verbannen, 'de woekeraar verbant niet');
  assert.ok(zuinig.goud > 0, 'hij legt een boete op, voor de kist');
  // In de balk heet het naar hem.
  const s = T.voorvalStemming(zuinig.S, dagNu(zuinig.S));
  assert.ok(s.blij.includes(`wat ${T.naamVanBewoner(zuinig.p)} besliste over de diefstal`), JSON.stringify(s));
});

const dagNu = (S) => Math.floor(S.kalender.dag);

test('karakters kiezen verschillend: de vrome bidt, de vroedvrouw laat de put schoonmaken', () => {
  const kies = (karakter) => {
    const S = gehucht();
    const L = metVoorval(S, 'ziekte');
    T.zetVoorraad(S, 'goud', 20);
    T.zetVoorraad(S, 'bier', 30);
    const p = raadsman(S, karakter, [L.wie]);
    return metKunde({}, () => T.raadsmanKeuze(S, p, 'ziekte').zeg);
  };
  assert.match(kies('vrome'), /Bidden/);
  assert.match(kies('vroedvrouw'), /put/);
});

test('hij kiest wat er te betalen valt', () => {
  const S = gehucht();
  const L = metVoorval(S, 'ziekte');
  T.zetVoorraad(S, 'goud', 0);
  T.zetVoorraad(S, 'bier', 0);
  const p = raadsman(S, 'vroedvrouw', [L.wie]);
  assert.match(metKunde({}, () => T.raadsmanKeuze(S, p, 'ziekte').zeg), /Bidden/, 'zonder goud en bier blijft alleen bidden over');
});

test('wat hij kan, telt mee: goed maakt wat slecht uitvalt minder erg, slecht maakt het erger', () => {
  const S = gehucht();
  const p = boeren(S)[0];
  const doe = { tevreden: 4, argwaan: 4, goud: -4, hout: -10, sterfkans: 20 };
  const goed = metKunde({ rechtspreken: 'goed', zwijgen: 'goed', rekenen: 'goed', bouwen: 'goed', vechten: 'goed' }, () => T.metVaardigheden(S, p, doe));
  assert.deepEqual(goed, { tevreden: 6, argwaan: 2, goud: -3, hout: -5, sterfkans: 10 });
  const slecht = metKunde({ rechtspreken: 'slecht', zwijgen: 'slecht', rekenen: 'slecht', bouwen: 'slecht', vechten: 'slecht' }, () => T.metVaardigheden(S, p, doe));
  assert.deepEqual(slecht, { tevreden: 2, argwaan: 6, goud: -5, hout: -15, sterfkans: 30 });
  assert.deepEqual(metKunde({ zwijgen: 'slecht' }, () => T.metVaardigheden(S, p, { argwaan: -4 })), { argwaan: -2 }, 'wie niet kan zwijgen, stelt de inner ook minder gerust');
  assert.deepEqual(metKunde({}, () => T.metVaardigheden(S, p, doe)), doe, 'wie niets bijzonders kan, doet het zoals het staat');
});

test('is de schout niet in het dorp, dan beslist hij meteen, als wie het zegt gaat zoeken', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 20);
  raadsman(S, 'weduwe', [L.wie]);
  const dorp = S.wereld;
  S.wereld = { wezens: [], naam: 'elders' };
  S.kalender.dag = L.vanaf - 0.01;
  T.werkVoorvallenBij(S);
  assert.equal(S.voorvallen.lopend, L, 'vóór zijn uur nog niet');
  S.kalender.dag = L.vanaf + 0.01;
  T.werkVoorvallenBij(S);
  assert.equal(S.voorvallen.lopend, null, 'dan wel');
  assert.equal(S.voorvallen.doorRaadsman, 1);
  S.wereld = dorp;
});

test('zonder raadsman, of met de spelregel uit, gaat het voorbij zoals eerst', () => {
  const S = gehucht();
  const L = metVoorval(S, 'lening', 30);
  T.tikVoorvallenDag(S, L.tot);
  assert.ok(T.voorvalStemming(S, L.tot).last.includes('een schout die er niet was'));
  try {
    T.zetOptie('raadsman', 'uit');
    const S2 = gehucht();
    const L2 = metVoorval(S2, 'lening', 30);
    const p = raadsman(S2, 'weduwe', [L2.wie]);
    assert.equal(T.raadsmanVan(S2), null, 'uit is er geen raadsman');
    assert.ok(!T.overBoer(p.wezen).eigenschappen.includes('je raadsman'));
    T.tikVoorvallenDag(S2, L2.tot);
    assert.ok(T.voorvalStemming(S2, L2.tot).last.includes('een schout die er niet was'));
  } finally {
    T.optiesTerug();
  }
});

test('bewaren en laden: de raadsman blijft de raadsman, en wat hij besloot', () => {
  const S = gehucht();
  const L = metVoorval(S, 'diefstal');
  const p = raadsman(S, 'woekeraar', [L.wie, L.ander]);
  T.tikVoorvallenDag(S, L.tot);
  const S2 = gehucht();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 1790000000000 })));
  assert.equal(T.raadsmanVan(S2).wie, p.wie);
  assert.equal(S2.raadsman.besluiten.length, 1);
  assert.equal(S2.raadsman.besluiten[0].id, 'diefstal');
});
