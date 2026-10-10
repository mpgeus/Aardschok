// De brand en de koorts als status (js/brand.js, js/koorts.js; werklijst vraag 144, 3; Marcel, 9 okt: "Ziekte en brand als
// status is ook goed. We hebben dan nog wel vuur nodig en huizen die 'afgefikt' zijn als art. Dan kunnen ze weer worden
// opgebouwd").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

function gehucht(dag) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 7;
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
  T.S = S;
  S.kalender.dag = dag;
  return S;
}

// Een voorval met wie het zegt en over wie het gaat: twee volwassenen uit verschillende huizen met een stand.
function voorval(D, id, dag) {
  const mensen = D.bewoners.mensen.filter((p) => p.leeftijd === 'volwassen' && p.huis && T.standVan(p.huis) && !p.wie);
  const ander = mensen[0];
  const wie = mensen.find((p) => p.huis !== ander.huis);
  return T.beginVoorval(D, id, wie, ander, dag);
}

test('brandgevaar in de droogte, groot in een ernstige droogte; niet in de winter', () => {
  const dag = dagVan('zomermaand', 5);
  const S = gehucht(dag);
  const D = S.dorp;
  assert.equal(T.brandgevaarNiveau(D, dag), 0);
  D.weer = { vandaag: 'zon', droog: 20, tekort: T.WEER_INSTELLINGEN.droogteVanaf, verlies: 0 };
  assert.equal(T.brandgevaarNiveau(D, dag), 1);
  assert.ok(T.statussenVan(D, dag).some((s) => s.id === 'brandgevaar' && s.niveau === 1));
  D.weer.tekort = T.WEER_INSTELLINGEN.ernstigVanaf;
  assert.equal(T.brandgevaarNiveau(D, dag), 2);
  assert.equal(T.statussenVan(D, dag).find((s) => s.id === 'brandgevaar').naam, 'Groot brandgevaar');
  assert.equal(T.brandgevaarNiveau(D, dagVan('louwmaand', 5)), 0);
});

test('laat je het branden, dan is het een uur na je antwoord afgebrand', () => {
  const dag = dagVan('zomermaand', 5);
  const S = gehucht(dag);
  const D = S.dorp;
  const L = voorval(D, 'brand', dag);
  S.kalender.dag = L.vanaf;
  T.werkBrandBij(S, D);
  const g = L.brandHuis;
  S.kalender.dag += 2 / 24;
  T.werkBrandBij(S, D);
  assert.equal(g.brand.fase, 'brandt', 'het brandt nog: niemand deed iets');
  T.voorvalGevolg(D, { brand: 'laat', tevreden: -5 });
  S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren + 0.05) / 24;
  T.werkBrandBij(S, D);
  assert.equal(g.brand.fase, 'puin');
});

test('het huis brandt als het voorval begint; zonder emmers brandt het af, en het gezin bouwt het weer op', () => {
  const dag = dagVan('zomermaand', 5);
  const S = gehucht(dag);
  const D = S.dorp;
  const L = voorval(D, 'brand', dag);
  T.werkBrandBij(S, D);
  assert.ok(!L.brandHuis, 'nog niet: wie het zegt, komt pas om', L.vanaf);
  S.kalender.dag = L.vanaf;
  T.werkBrandBij(S, D);
  const g = L.brandHuis;
  assert.equal(g, L.ander.huis, 'het huis van wie het betreft');
  assert.equal(g.brand.fase, 'brandt');
  assert.equal(g.voorwerp.brand, 'brandt');
  assert.ok(T.lichtBronnen(D).some((b) => b.soort === 'brand'), 'het geeft licht');
  S.kalender.dag += (T.BRAND_INSTELLINGEN.brandUren + 0.1) / 24;
  T.werkBrandBij(S, D);
  assert.equal(g.brand.fase, 'puin');
  assert.equal(g.voorwerp.brand, 'puin');
  assert.ok(D.bewoners.mensen.includes(L.ander), 'het gezin woont nog in het dorp');
  // Na de dagen puin: met hout weer op, in de bouwfasen.
  const hout = T.herbouwHout(g);
  T.zetVoorraad(D, 'hout', hout - 1);
  const terug = Math.floor(S.kalender.dag) + T.BRAND_INSTELLINGEN.puinDagen + 1;
  T.tikBrandDag(D, terug);
  assert.ok(g.brand && g.brand.wacht, 'zonder hout wacht het');
  T.zetVoorraad(D, 'hout', hout + 3);
  T.tikBrandDag(D, terug + 1);
  assert.ok(!g.brand && !g.voorwerp.brand);
  assert.equal(D.voorraad.hout, 3);
  assert.ok(g.voorwerp.inAanbouw, 'het rijst weer op');
  assert.equal(g.voorwerp.vanFase, T.BRAND_INSTELLINGEN.herbouwVanFase);
  T.tikGebouwenDag(D, g.voorwerp.klaarOp);
  assert.ok(!g.voorwerp.inAanbouw, 'en staat weer');
});

test('met de emmers is het vuur na een uur uit, en blijft het huis meestal staan', () => {
  const red = T.BRAND_INSTELLINGEN.redKans;
  T.BRAND_INSTELLINGEN.redKans = 1;
  try {
    const dag = dagVan('zomermaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    const L = voorval(D, 'brand', dag);
    assert.match(T.prijsVanKeuze(D, { blus: true }).tekst, /100 van de 100 keer blijft het huis staan/);
    T.voorvalGevolg(D, { blus: true }); // je antwoordde al voor het begon: het geldt toch
    S.kalender.dag = L.vanaf;
    T.werkBrandBij(S, D);
    const g = L.brandHuis;
    assert.equal(g.brand.antwoord, 'blus');
    S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren + 0.05) / 24;
    T.werkBrandBij(S, D);
    assert.ok(!g.brand && !g.voorwerp.brand, 'uit, en het huis staat');
  } finally {
    T.BRAND_INSTELLINGEN.redKans = red;
  }
});

// Marcel, 10 okt: "Ja, zo": bij groot brandgevaar, als niemand blust, slaat het vuur soms over op één huis ernaast.
test('bij groot brandgevaar slaat het vuur over op het huis ernaast als niemand blust, en dat huis niet verder', () => {
  const O = { ...T.BRAND_INSTELLINGEN.overslaan };
  T.BRAND_INSTELLINGEN.overslaan.kans = 1;
  T.BRAND_INSTELLINGEN.overslaan.afstand = 60; // op het ontworpen gehucht: er is altijd een huis
  try {
    const dag = dagVan('zomermaand', 5);
    const brand = (droogte, antwoord) => {
      const S = gehucht(dag);
      const D = S.dorp;
      D.weer = { vandaag: 'zon', droog: 30, tekort: droogte, verlies: 0 };
      const L = voorval(D, 'brand', dag);
      S.kalender.dag = L.vanaf;
      T.werkBrandBij(S, D);
      if (antwoord) T.voorvalGevolg(D, antwoord);
      S.kalender.dag += (T.BRAND_INSTELLINGEN.brandUren + 0.1) / 24;
      T.werkBrandBij(S, D);
      return { S, D, g: L.brandHuis, branden: T.brandendeHuizen(D).filter((h) => h.brand.fase === 'brandt') };
    };
    const W = T.WEER_INSTELLINGEN;
    // Groot brandgevaar, en niemand deed iets: het dichtste huis vat vlam.
    const { S, D, g, branden } = brand(W.ernstigVanaf);
    assert.equal(T.brandgevaarNiveau(D), 2);
    assert.equal(g.brand.fase, 'puin');
    assert.equal(branden.length, 1, 'één buurhuis brandt');
    const buur = branden[0];
    assert.ok(buur.brand.overgeslagen);
    assert.ok(T.standVan(buur), 'een woonhuis');
    const afstand = (a, b) => Math.max(0, b.x - (a.x + a.b), a.x - (b.x + b.b), b.y - (a.y + a.h), a.y - (b.y + b.h));
    const voet = T.voetVanGebouw(g);
    for (const h of D.gebouwen) if (h !== g && h !== buur && T.standVan(h) && h.klaar) assert.ok(afstand(voet, T.voetVanGebouw(h)) >= afstand(voet, T.voetVanGebouw(buur)), 'het dichtste');
    // Het buurhuis brandt af en slaat niet verder over.
    S.kalender.dag += (T.BRAND_INSTELLINGEN.brandUren + 0.1) / 24;
    T.werkBrandBij(S, D);
    assert.equal(buur.brand.fase, 'puin');
    assert.equal(T.brandendeHuizen(D).filter((h) => h.brand.fase === 'brandt').length, 0, 'niet verder');

    // Gewoon brandgevaar: niet.
    assert.equal(brand(W.droogteVanaf).branden.length, 0, 'alleen bij groot brandgevaar');
    // Met de emmers, ook als ze het huis niet redden: niet.
    const red = T.BRAND_INSTELLINGEN.redKans;
    T.BRAND_INSTELLINGEN.redKans = 0;
    try {
      const b = brand(W.ernstigVanaf, { blus: true });
      assert.equal(b.g.brand.fase, 'puin');
      assert.equal(b.branden.length, 0, 'wie blust, houdt het vuur bij het huis');
    } finally {
      T.BRAND_INSTELLINGEN.redKans = red;
    }
  } finally {
    Object.assign(T.BRAND_INSTELLINGEN.overslaan, O);
  }
});

test('de koorts: wie het zegt en zijn gezin zijn ziek, ze steekt aan, en is na een tijd voorbij', () => {
  const K = T.KOORTS_INSTELLINGEN;
  const besmet = K.besmet;
  K.besmet = 1;
  try {
    const dag = dagVan('louwmaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    const L = voorval(D, 'ziekte', dag);
    T.tikKoortsDag(D, dag);
    const eerst = T.zieken(D).length;
    assert.ok(eerst >= 1 && eerst <= K.begin, `${eerst} ziek`);
    assert.ok(L.ander.ziek, 'wie het betreft');
    assert.ok(T.blijftThuis(L.ander, dag + 1), 'in bed');
    assert.equal(T.statussenVan(D, dag).find((s) => s.id === 'koorts').naam, 'Koorts');
    let meest = eerst;
    let d = dag + 1;
    for (; D.koorts && d < dag + 120; d++) {
      T.tikKoortsDag(D, d);
      meest = Math.max(meest, T.zieken(D).length);
      if (T.koortsNiveau(D) === 2) assert.equal(T.statussenVan(D, d).find((s) => s.id === 'koorts').naam, 'Epidemie');
    }
    assert.ok(meest > eerst, 'ze stak anderen aan');
    assert.equal(D.koorts, null, 'en is voorbij');
    assert.ok(!D.bewoners.mensen.some((p) => p.ziek));
  } finally {
    K.besmet = besmet;
  }
});

// Marcel, 10 okt: "Ja, zo": een bos stro naast de deur van een huis met een zieke (alleen beeld).
test('de pestbos: naast de deur van elk huis met een zieke, tegen de muur, zolang er iemand ziek is', () => {
  const dag = dagVan('louwmaand', 5);
  const S = gehucht(dag);
  const D = S.dorp;
  assert.deepEqual(T.pestbossen(D, S.wereld), [], 'zonder koorts geen');
  const L = voorval(D, 'ziekte', dag);
  T.tikKoortsDag(D, dag);
  const bossen = T.pestbossen(D, S.wereld);
  const huizen = new Set(T.zieken(D).map((p) => p.huis));
  assert.equal(bossen.length, huizen.size, 'één per huis met een zieke');
  assert.ok(bossen.some((b) => b.g === L.ander.huis));
  for (const b of bossen) {
    const deur = T.deurVan(S.wereld, b.g);
    assert.ok(Math.abs(b.x - deur.x) + Math.abs(b.y - deur.y) <= 1, 'naast de deur');
    const v = T.voetVanGebouw(b.g);
    assert.ok(!(b.x >= v.x && b.x < v.x + v.b && b.y >= v.y && b.y < v.y + v.h), 'niet in het huis');
  }
  for (const p of D.bewoners.mensen) delete p.ziek;
  assert.deepEqual(T.pestbossen(D, S.wereld), [], 'beter: weg');
});

test('een schone put maakt dat de koorts minder overgaat, en het venster zegt het vooraf', () => {
  const dag = dagVan('louwmaand', 5);
  const S = gehucht(dag);
  const D = S.dorp;
  voorval(D, 'ziekte', dag);
  assert.match(T.prijsVanKeuze(D, { goud: -2, koorts: 40 }).tekst, /half zo vaak/);
  T.voorvalGevolg(D, { koorts: 40 }); // je antwoordde voor de nacht: het geldt als ze begint
  T.tikKoortsDag(D, dag);
  assert.equal(D.koorts.maat, 0.4);
});
