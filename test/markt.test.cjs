// De markt op het plein (js/markt.js; werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"): vier kramen aan
// de rand van het plein, waar je tussendoor loopt, en het midden vrij voor het feest en de heer. Zo komt er een markt
// zonder eigen grond, want die was in de speeltest van vier jaar op.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => {} });

// Een nieuw spel, stil en met een vast toeval: het ontworpen gehucht (zonder zaad), of een land van de maker.
function nieuwSpel(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}
function rijk(D) {
  T.wijzigVoorraad(D, 'hout', 100);
  T.wijzigVoorraad(D, 'goud', 100);
}

// Welke tegels je vanaf `van` bereikt, stap voor stap recht (niet schuin: dat is strenger dan het lopen, js/pad.js).
function bereik(w, van) {
  const gezien = new Set([`${van.x},${van.y}`]);
  const rij = [van];
  while (rij.length) {
    const t = rij.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = t.x + dx;
      const y = t.y + dy;
      const k = `${x},${y}`;
      if (gezien.has(k) || !T.isBegaanbaar(w, x, y)) continue;
      gezien.add(k);
      rij.push({ x, y });
    }
  }
  return gezien;
}
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

test('de standaard: de markt komt op het plein, voor 8 hout en 6 goud; als eigen gebouw weer 16 en 14', () => {
  assert.equal(T.MARKT_INSTELLINGEN.opHetPlein, true);
  assert.deepEqual(T.GEBOUWEN.markt.kosten, { hout: 8, goud: 6 });
  T.zetOptie('markt', 'gebouw');
  try {
    assert.equal(T.MARKT_INSTELLINGEN.opHetPlein, false);
    assert.deepEqual(T.GEBOUWEN.markt.kosten, { hout: 16, goud: 14 });
  } finally {
    T.zetOptie('markt', 'plein');
  }
  assert.deepEqual(T.GEBOUWEN.markt.kosten, { hout: 8, goud: 6 });
});

for (const zaad of [undefined, 62707, 73425, 72022]) {
  const naam = zaad ? `het land ${zaad}` : 'het ontworpen gehucht';

  test(`${naam}: vier kramen aan de rand, die niemand tegenhouden, en het feest en de heer houden hun plek`, () => {
    const S = nieuwSpel(zaad);
    const D = S.dorp;
    const w = D.wereld;
    rijk(D);
    const heer = w.heer || w.marskramer;
    const feest = T.feestMidden(w);
    const paal = T.plekVoorDeSchandpaal(D);
    const midden = T.marktMidden(w);
    const voor = bereik(w, midden);

    // De plek die een verzoek kiest: het midden van het plein, met de kramen.
    const plek = T.plekVoor(D, 'markt', T.deurVan(w, D.gebouwen.find((g) => g.huis === 'schout')));
    assert.deepEqual({ x: plek.x, y: plek.y }, midden);
    assert.equal(plek.kramen.length, 4);
    assert.ok(T.gebouwPast(D, 'markt', plek.x, plek.y));

    const hout = D.voorraad.hout;
    const goud = D.voorraad.goud;
    const u = T.plaatsGebouw(D, 'markt', plek.x, plek.y);
    assert.ok(u.gelukt, u.reden);
    assert.deepEqual([hout - D.voorraad.hout, goud - D.voorraad.goud], [8, 6]);
    const kramen = w.voorwerpen.filter((v) => v.soort === 'kraam');
    assert.equal(kramen.length, 4);
    assert.deepEqual(kramen.map((k) => k.richting).sort(), ['NO', 'NW', 'ZO', 'ZW'], 'van vier kanten, elk naar het midden');
    for (const k of kramen) {
      assert.ok(T.opHetPlein(w, k.x, k.y), 'op het plein');
      assert.ok(!T.isBegaanbaar(w, k.x, k.y), 'een kraam staat er echt');
      assert.ok(cheb(k, feest) > T.FEESTEN_INSTELLINGEN.kring, 'buiten de kring van het feest');
      assert.ok(cheb(k, heer) > T.MARKT_INSTELLINGEN.vanDeHeer, 'weg van de heer');
    }
    for (const a of kramen) for (const b of kramen) if (a !== b) assert.ok(cheb(a, b) >= T.MARKT_INSTELLINGEN.vanElkaar);

    // Niemand tegen: wat je vanaf het midden bereikte, bereik je nog, op de kramen na.
    const na = bereik(w, midden);
    const kraamTegels = new Set(kramen.map((k) => `${k.x},${k.y}`));
    for (const t of voor) if (!kraamTegels.has(t)) assert.ok(na.has(t), `${t} is niet meer te bereiken`);
    for (const g of D.gebouwen) if (!g.opHetPlein) assert.ok(na.has(`${T.deurVan(w, g).x},${T.deurVan(w, g).y}`) || !voor.has(`${T.deurVan(w, g).x},${T.deurVan(w, g).y}`), 'elke deur blijft te bereiken');

    // Het feest, de heer en zijn schandpaal houden hun plek.
    assert.deepEqual(T.feestMidden(w), feest);
    assert.ok(T.isBegaanbaar(w, heer.x, heer.y) && !T.voorwerpOp(w, heer.x, heer.y));
    assert.deepEqual(T.plekVoorDeSchandpaal(D), paal);

    // De markt staat als gebouw in de lijst, zonder voet: in aanbouw, dan klaar, en dan heeft het dorp een markt.
    const markt = D.gebouwen.find((g) => g.soort === 'markt');
    assert.ok(markt.opHetPlein && !markt.voorwerp && !markt.klaar);
    assert.ok(T.isBegaanbaar(w, markt.x, markt.y), 'het midden van het plein blijft open');
    assert.ok(kramen.every((k) => k.inAanbouw));
    assert.equal(T.plekkenVan(D, 'markt').length, 0);
    S.kalender.dag = markt.klaarOp + 0.3;
    T.tikGebouwenDag(D, markt.klaarOp);
    assert.ok(markt.klaar && kramen.every((k) => !k.inAanbouw));
    assert.equal(T.plekkenVan(D, 'markt').length, 1);

    // Er komt er geen tweede.
    assert.equal(T.waaromGeenMarktOpHetPlein(D), 'Op het plein staat al een markt.');
    assert.equal(T.plekVoor(D, 'markt', midden), null);
  });
}

test('wie op de plek van een kraam staat, stapt opzij; en een bewaarde markt houdt zijn kramen', () => {
  const S = nieuwSpel();
  const D = S.dorp;
  const w = D.wereld;
  rijk(D);
  const k = T.kraamPlekken(D)[0];
  const e = w.wezens.find((x) => x.bewoner && !x.binnen);
  Object.assign(e, { x: k.x, y: k.y, tx: k.x, ty: k.y, pad: [] });
  assert.ok(T.plaatsGebouw(D, 'markt', 0, 0).gelukt, 'waar je ook wijst: de markt komt op het plein');
  assert.ok(e.tx !== k.x || e.ty !== k.y);

  const S2 = nieuwSpel();
  T.zetSpel(S2, T.leesSpel(T.bewaarSpel(S, { nu: 0 })));
  const markt = S2.dorp.gebouwen.find((g) => g.soort === 'markt');
  assert.equal(markt.kramen.length, 4);
  for (const kraam of markt.kramen) assert.ok(S2.dorp.wereld.voorwerpen.includes(kraam), 'dezelfde kraam als op de kaart');
});

test('met "Een eigen gebouw" is de markt weer een gebouw met een eigen voet, en op het plein mag hij niet', () => {
  T.zetOptie('markt', 'gebouw');
  try {
    const S = nieuwSpel();
    const D = S.dorp;
    rijk(D);
    const midden = T.marktMidden(D.wereld);
    assert.equal(T.waaromPastHetNiet(D, 'markt', midden.x, midden.y), 'Op het plein wordt niet gebouwd.');
    const plek = T.plekVoor(D, 'markt', midden);
    assert.ok(plek && !plek.kramen);
    assert.ok(T.plaatsGebouw(D, 'markt', plek.x, plek.y).gelukt);
    const markt = D.gebouwen.find((g) => g.soort === 'markt');
    assert.ok(markt.voorwerp && !markt.opHetPlein);
    assert.equal(D.wereld.voorwerpen.filter((v) => v.soort === 'kraam').length, 0);
  } finally {
    T.zetOptie('markt', 'plein');
  }
});
