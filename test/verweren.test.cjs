// De ronde van alle tekeningen (vraag 144; ontwerp/beeld.md, "De ronde van alle tekeningen"; Marcel, 10 okt: "pak het de
// huizen op, alle knoppen staan nog uit die het uiterlijk veranderen", en op het plan: meteen jong en oud, en alles in één
// ronde): elk huis jong en oud (js/gebouwen.js, T.maakOud), de sneeuw op de daken (T.dakSneeuwLaag, tegels/daksneeuw.js)
// en de fasen van het afbranden (T.brandfaseVan, tegels/brandfasen.js).
const test = require('node:test');
const assert = require('node:assert/strict');

const HZ = require('../gereedschap/pixelart/huizen.cjs');
const RU = require('../gereedschap/pixelart/ruines.cjs');
const T = require('./laad.cjs').spel();
const { proefDorp, bouwAf, dagen } = require('./grond.cjs');
T.ui = new Proxy({}, { get: () => () => undefined });

const tegels = () => T.TEGELS.huizen.tiles;
const naamVan = (v) => tegels()[v.id].naam;
const delen = (s) => (s.delen ? s.delen.map((d) => d.spec) : [s]);
const zonderLeeftijd = ({ knoppen, stijl, jong, fasen, ...rest }) => rest;

// Het proefdorp (test/grond.cjs) op de dag die de toets kiest.
function gehucht(dag) {
  const { S } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  S.kalender.dag = dag;
  return S;
}

test('elke tekening van de huizenbouwer heeft een oude naast zich: dezelfde opgave, alleen meer verweerd', () => {
  for (const [naam, o] of Object.entries(HZ.HUIZEN)) {
    if (o.jong) continue;
    const oud = HZ.HUIZEN[naam + HZ.OUD];
    assert.ok(oud, `${naam}: geen oude`);
    assert.equal(oud.jong, naam);
    assert.equal(oud.fasen, false, `${naam}: een oude heeft geen bouwfasen`);
    assert.equal(oud.stijl, undefined, `${naam}: de stijl hoort bij de jonge`);
    delen(o).forEach((d, i) => {
      const od = delen(oud)[i];
      assert.deepEqual(zonderLeeftijd(od), zonderLeeftijd(d), `${naam}: de oude is een ander huis`);
      if (d.knoppen) assert.ok(od.knoppen.verweer > d.knoppen.verweer, `${naam}: de oude is niet meer verweerd`);
    });
  }
});

test('de knoppen naar het dak: ruig riet in het gehucht, ronde pannen met marktrecht, en de vorm op de huizen', () => {
  const kn = (n) => HZ.HUIZEN[n].knoppen;
  assert.equal(kn('wit-huis1-riet-z').ruig, true);
  assert.equal(kn('wit-huis1-leien-z').ruig, false);
  assert.ok(kn('wit-huis1-riet-z').verweer > kn('wit-huis1-leien-z').verweer, 'het gehucht is ouder dan een dorp');
  assert.ok(kn('wit-huis1-leien-z').verweer > kn('wit-huis1-pannen-z').verweer, 'marktrecht is het netst');
  assert.equal(HZ.HUIZEN['wit-huis1-riet-z'].uit.afdak, true);
  assert.ok(!HZ.HUIZEN['wit-hut1-riet-z'].uit.afdak && !HZ.HUIZEN['wit-hut1-riet-z'].helling, 'een hut blijft laag, zonder afdak');
  assert.equal(HZ.HUIZEN['wit-steen1-leien-z'].boogdeur, true);
  assert.equal(HZ.HUIZEN['wit-steen1-leien-z'].uit.klimop, true);
});

test('op het vel staan jong en oud met dezelfde voet en deur', () => {
  const opNaam = new Map(tegels().filter((t) => t && t.naam).map((t) => [t.naam, t]));
  for (const t of opNaam.values()) {
    if (t.naam.endsWith(HZ.OUD)) continue;
    const o = opNaam.get(t.naam + HZ.OUD);
    assert.ok(o, `${t.naam}: geen oude op het vel (npm run tiled huizen)`);
    assert.deepEqual(o.beslaat, t.beslaat, t.naam);
    assert.deepEqual(o.deur, t.deur, t.naam);
    assert.equal(o.stijl, undefined, `${t.naam}: de oude telt niet mee als vorm van een stijl`);
  }
});

// Het lege begin heeft geen huizen die er al stonden (die waren oud, T.maakOud bij de gebouwen van een kaart; de toets dat
// het dorp bij het begin oud was, ging op 12 okt weg met het ontworpen gehucht): in het proefdorp is alles gebouwd, dus jong.
test('wat je bouwt, is jong en na twee jaar oud', () => {
  const dag = 40;
  const S = gehucht(dag);
  const D = S.dorp;
  const huizen = D.gebouwen.filter((g) => g.voorwerp && g.voorwerp.vel === 'huizen');
  assert.ok(huizen.length >= 3, 'het raadhuis, twee boerderijen en hutten');
  for (const g of huizen) assert.ok(!T.isOudHuis(g.voorwerp), `${g.tekening} is al oud`);
  // de tekening van het gebouw blijft de jonge: de stijl, de deur en het doorgroeien merken niets
  for (const g of huizen) assert.ok(!g.tekening.endsWith(HZ.OUD));

  T.zetVoorraad(D, 'hout', 200);
  // de eerste plek waar een hut past (een bouwplaats: de mensen bouwen zelf, dus hier maken we hem meteen af)
  let r = null;
  const w = D.wereld;
  const bereik = T.BEGIN_INSTELLINGEN.bouwBereik;
  T.BEGIN_INSTELLINGEN.bouwBereik = 40;
  try {
    const K = T.kaartVak(w);
    for (let y = K.y + 4; y < K.y + K.h - 4 && !(r && r.gelukt); y += 2) {
      for (let x = K.x + 4; x < K.x + K.b - 4 && !(r && r.gelukt); x += 2) r = T.plaatsGebouw(D, 'hut', x, y);
    }
  } finally {
    T.BEGIN_INSTELLINGEN.bouwBereik = bereik;
  }
  assert.ok(r.gelukt, r.reden);
  const hut = D.gebouwen[D.gebouwen.length - 1];
  const d = dag;
  bouwAf(T, D, hut, d);
  dagen(T, S, d);
  assert.ok(hut.klaar, 'vannacht komt hij klaar');
  const v = hut.voorwerp;
  assert.ok(!T.isOudHuis(v), 'een nieuwe hut is jong');
  assert.equal(v.gebouwdOp, d);
  T.tikGebouwenDag(D, d + T.GEBOUWEN_INSTELLINGEN.oudNaDagen - 1);
  assert.ok(!T.isOudHuis(v), 'nog geen twee jaar');
  T.tikGebouwenDag(D, d + T.GEBOUWEN_INSTELLINGEN.oudNaDagen);
  assert.ok(T.isOudHuis(v), 'na twee jaar oud');
  assert.equal(naamVan(v), `${T.jongeTekeningVan(v)}${HZ.OUD}`);
  // en wat opnieuw gebouwd wordt (doorgroeien, na een brand), is weer jong
  T.maakJong(v, d + 800);
  assert.ok(!T.isOudHuis(v));
});

test('de fasen van het afbranden: het huis, geschroeid, het dak valt; binnengestort, ingestort, opgeruimd', () => {
  const B = T.BRAND_INSTELLINGEN;
  const D = { kalender: { dag: 10 } };
  const g = { brand: { fase: 'brandt', sinds: 10 } };
  const op = (dag) => {
    D.kalender.dag = dag;
    return T.brandfaseVan(D, g);
  };
  const uur = 1 / 24;
  // zolang de buren blussen (blusUren), van het huis zelf tot het dak dat valt
  assert.equal(op(10), null, 'eerst brandt het huis zelf');
  assert.equal(op(10 + B.blusUren * 0.5 * uur), 'geschroeid');
  assert.equal(op(10 + B.blusUren * 0.8 * uur), 'dakvalt');
  g.brand = { fase: 'puin', sinds: 20 };
  assert.equal(op(20.5), 'binnengestort');
  assert.equal(op(21.5), 'ingestort');
  assert.equal(op(20 + B.puinDagen - 0.5), 'opgeruimd');
  g.brand.wacht = true;
  assert.equal(op(21.5), 'opgeruimd', 'wie op hout wacht, heeft opgeruimd');
});

test('de sneeuw op de daken: de laag naar de sneeuw op de grond, en elke jonge tekening heeft zijn lagen', () => {
  assert.equal(T.dakSneeuwLaag(0), -1);
  assert.equal(T.dakSneeuwLaag(0.2), 0);
  assert.equal(T.dakSneeuwLaag(0.5), 1);
  assert.equal(T.dakSneeuwLaag(1), 2);
  for (const t of tegels()) {
    if (!t || !t.naam || t.naam.endsWith(HZ.OUD)) continue;
    const lagen = T.DAKSNEEUW.lagen[t.naam];
    assert.ok(lagen, `${t.naam}: geen sneeuw op het dak (npm run tiled huizen)`);
    assert.equal(lagen.length, HZ.SNEEUW_LAGEN.length);
    assert.ok(lagen[lagen.length - 1], `${t.naam}: geen dikke sneeuw`);
  }
});

test('elk huis dat kan branden, heeft zijn fasen van het afbranden', () => {
  for (const naam of Object.keys(HZ.HUIZEN).filter(RU.brandbaar)) {
    const f = T.BRANDFASEN.fasen[naam];
    assert.ok(f, `${naam}: geen brandfasen (node gereedschap/pixelart/ruines.cjs spel)`);
    assert.deepEqual(f.fasen.map((x) => x && x.naam), RU.SPEL_FASEN.map(([n]) => n), naam);
  }
});
