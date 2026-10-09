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
