// De brand en de koorts als status (js/brand.js, js/koorts.js; werklijst vraag 144, 3; Marcel, 9 okt: "Ziekte en brand als
// status is ook goed. We hebben dan nog wel vuur nodig en huizen die 'afgefikt' zijn als art. Dan kunnen ze weer worden
// opgebouwd").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

function dagVan(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

// Het proefdorp (test/grond.cjs) op de dag die de toets kiest.
function gehucht(dag) {
  const { S } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() }, T.schermVelden());
  T.S = S;
  S.kalender.dag = dag;
  return S;
}

// Wat het spel zegt, met de plek waar een klik je heen brengt.
const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (tekst, soort, plek) => berichten.push({ tekst, soort, plek }) : () => undefined) });

// Met deze getallen in een blok, en daarna weer de oude.
function met(blok, getallen, doe) {
  const oud = JSON.parse(JSON.stringify(blok));
  Object.assign(blok, getallen);
  try {
    return doe();
  } finally {
    Object.assign(blok, oud);
  }
}

// Een brand, nu: het eerste huis dat vlam vat.
function brandNu(S, D) {
  D.brandKomt = S.kalender.dag;
  T.werkBrandBij(S, D);
  return T.brandendeHuizen(D)[0];
}
const droogte = (D, tekort) => (D.weer = { vandaag: 'zon', droog: 30, tekort, verlies: 0 });

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
  assert.equal(T.statussenVan(D, dag).find((s) => s.id === 'brandgevaar').naam, 'High fire risk');
  assert.equal(T.brandgevaarNiveau(D, dagVan('louwmaand', 5)), 0);
});

// Ronde 3 van het snoeien (15 okt; Marcel: "het dorp doet het zelf"): de brand is geen voorval meer, maar komt bij
// brandgevaar met een kleine kans per dag, en de buren blussen altijd.
test('bij brandgevaar komt er soms een brand, op een uur overdag, en het bericht brengt je erheen; zonder niet', () => {
  const dag = dagVan('zomermaand', 5);
  met(T.BRAND_INSTELLINGEN, { kans: 1 }, () => {
    const S = gehucht(dag);
    const D = S.dorp;
    T.tikBrandDag(D, dag);
    assert.equal(D.brandKomt, undefined, 'zonder droogte geen brand');
    droogte(D, T.WEER_INSTELLINGEN.droogteVanaf);
    T.tikBrandDag(D, dag);
    const [van, tot] = T.BRAND_INSTELLINGEN.uur;
    assert.ok(D.brandKomt >= dag + van / 24 && D.brandKomt <= dag + tot / 24, 'overdag');
    S.kalender.dag = D.brandKomt - 0.01;
    T.werkBrandBij(S, D);
    assert.equal(T.brandendeHuizen(D).length, 0, 'nog niet');
    berichten.length = 0;
    S.kalender.dag = D.brandKomt;
    T.werkBrandBij(S, D);
    const g = T.brandendeHuizen(D)[0];
    assert.ok(g && T.standVan(g), 'een woonhuis brandt');
    assert.equal(g.brand.fase, 'brandt');
    assert.equal(g.voorwerp.brand, 'brandt');
    assert.equal(D.brandKomt, null);
    assert.ok(T.lichtBronnen(D).some((b) => b.soort === 'brand'), 'het geeft licht');
    const b = berichten.find((x) => x.tekst.startsWith('Fire!'));
    assert.ok(b, 'het spel zegt het');
    assert.deepEqual(b.plek, T.deurVan(D.wereld, g), 'met de plek');
  });
});

test('de buren blussen: na een uur is het uit, of het huis brandt af en het gezin bouwt het weer op', () => {
  const dag = dagVan('zomermaand', 5);
  met(T.BRAND_INSTELLINGEN, { redKans: 1 }, () => {
    const S = gehucht(dag);
    const D = S.dorp;
    const g = brandNu(S, D);
    S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren - 0.1) / 24;
    T.werkBrandBij(S, D);
    assert.equal(g.brand.fase, 'brandt', 'ze zijn nog bezig');
    S.kalender.dag += 0.2 / 24;
    T.werkBrandBij(S, D);
    assert.ok(!g.brand && !g.voorwerp.brand, 'uit, en het huis staat');
  });
  met(T.BRAND_INSTELLINGEN, { redKans: 0 }, () => {
    const S = gehucht(dag);
    const D = S.dorp;
    const g = brandNu(S, D);
    const wie = D.bewoners.mensen.filter((p) => p.huis === g);
    S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren + 0.1) / 24;
    T.werkBrandBij(S, D);
    assert.equal(g.brand.fase, 'puin');
    assert.equal(g.voorwerp.brand, 'puin');
    assert.ok(wie.every((p) => D.bewoners.mensen.includes(p)), 'het gezin woont nog in het dorp');
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
});

// Marcel, 10 okt: "Ja, zo": bij groot brandgevaar slaat het vuur soms over op één huis ernaast; sinds 15 okt als de
// emmers het huis niet redden.
test('bij groot brandgevaar slaat het vuur over op het huis ernaast als het afbrandt, en dat huis niet verder', () => {
  const O = { ...T.BRAND_INSTELLINGEN.overslaan };
  T.BRAND_INSTELLINGEN.overslaan.kans = 1;
  T.BRAND_INSTELLINGEN.overslaan.afstand = 60; // in het proefdorp: er is altijd een huis
  try {
    met(T.BRAND_INSTELLINGEN, { redKans: 0 }, () => {
      const dag = dagVan('zomermaand', 5);
      const brand = (tekort) => {
        const S = gehucht(dag);
        const D = S.dorp;
        droogte(D, tekort);
        const g = brandNu(S, D);
        S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren + 0.1) / 24;
        T.werkBrandBij(S, D);
        return { S, D, g, branden: T.brandendeHuizen(D).filter((h) => h.brand.fase === 'brandt') };
      };
      const W = T.WEER_INSTELLINGEN;
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
      S.kalender.dag += (T.BRAND_INSTELLINGEN.blusUren + 0.1) / 24;
      T.werkBrandBij(S, D);
      assert.equal(buur.brand.fase, 'puin');
      assert.equal(T.brandendeHuizen(D).filter((h) => h.brand.fase === 'brandt').length, 0, 'niet verder');
      // Gewoon brandgevaar: niet.
      assert.equal(brand(W.droogteVanaf).branden.length, 0, 'alleen bij groot brandgevaar');
    });
  } finally {
    Object.assign(T.BRAND_INSTELLINGEN.overslaan, O);
  }
});

// Ronde 3 van het snoeien (15 okt): de koorts is geen voorval meer, maar begint zelf in de kou of in een vol dorp.
test('de koorts begint alleen in de kou of in een vol dorp, met een bericht met een plek', () => {
  const dag = dagVan('louwmaand', 5);
  met(T.KOORTS_INSTELLINGEN, { kans: 1 }, () => {
    const S = gehucht(dag);
    const D = S.dorp;
    D.bevolking = T.telWoonruimte(D) - 4;
    T.tikKoortsDag(D, dag);
    assert.equal(D.koorts, undefined, 'zonder kou of een vol dorp niet');
    D.bevolking = T.telWoonruimte(D);
    berichten.length = 0;
    T.tikKoortsDag(D, dag);
    assert.ok(D.koorts, 'in een vol dorp wel');
    const zieken = T.zieken(D);
    assert.ok(zieken.length >= 1 && zieken.length <= T.KOORTS_INSTELLINGEN.begin);
    assert.ok(zieken.every((p) => p.gezin === zieken[0].gezin), 'iemand en zijn gezin');
    const b = berichten.find((x) => x.tekst.startsWith('Fever!'));
    assert.ok(b && b.plek, 'het spel zegt het, met de plek');
  });
});

test('de koorts steekt aan, en is na een tijd voorbij', () => {
  const K = T.KOORTS_INSTELLINGEN;
  const besmet = K.besmet;
  K.besmet = 1;
  try {
    const dag = dagVan('louwmaand', 5);
    const S = gehucht(dag);
    const D = S.dorp;
    T.beginKoorts(D, dag);
    const eerst = T.zieken(D).length;
    assert.ok(eerst >= 1 && eerst <= K.begin, `${eerst} ziek`);
    const p = T.zieken(D)[0];
    assert.ok(T.blijftThuis(p, dag + 1), 'in bed');
    assert.equal(T.statussenVan(D, dag).find((s) => s.id === 'koorts').naam, 'Fever');
    let meest = eerst;
    let d = dag + 1;
    for (; D.koorts && d < dag + 120; d++) {
      T.tikKoortsDag(D, d);
      meest = Math.max(meest, T.zieken(D).length);
      if (T.koortsNiveau(D) === 2) assert.equal(T.statussenVan(D, d).find((s) => s.id === 'koorts').naam, 'Epidemic');
    }
    assert.ok(meest > eerst, 'ze stak anderen aan');
    assert.equal(D.koorts, null, 'en is voorbij');
    assert.ok(!D.bewoners.mensen.some((m) => m.ziek));
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
  T.beginKoorts(D, dag);
  const bossen = T.pestbossen(D, S.wereld);
  const huizen = new Set(T.zieken(D).map((p) => p.huis));
  assert.equal(bossen.length, huizen.size, 'één per huis met een zieke');
  for (const b of bossen) {
    const deur = T.deurVan(S.wereld, b.g);
    assert.ok(Math.abs(b.x - deur.x) + Math.abs(b.y - deur.y) <= 1, 'naast de deur');
    const v = T.voetVanGebouw(b.g);
    assert.ok(!(b.x >= v.x && b.x < v.x + v.b && b.y >= v.y && b.y < v.y + v.h), 'niet in het huis');
  }
  for (const p of D.bewoners.mensen) delete p.ziek;
  assert.deepEqual(T.pestbossen(D, S.wereld), [], 'beter: weg');
});
