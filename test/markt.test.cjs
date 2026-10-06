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

// De tegels die de markt dichtzet: zijn kramen en de manden ernaast.
const dichtVan = (markt) => new Set([...markt.kramen, ...markt.manden].map((v) => `${v.x},${v.y}`));
// Houdt de markt niemand tegen? Wat je eerst vanaf het midden bereikte, bereik je nog, op wat hij dichtzette na.
function niemandTegen(w, midden, voor, markt) {
  const na = bereik(w, midden);
  const dicht = dichtVan(markt);
  for (const t of voor) if (!dicht.has(t)) assert.ok(na.has(t), `${t} is niet meer te bereiken`);
}
const richting = { ZO: [1, 0], ZW: [0, 1], NW: [-1, 0], NO: [0, -1] };

for (const zaad of [undefined, 62707, 73425, 72022]) {
  const naam = zaad ? `het land ${zaad}` : 'het ontworpen gehucht';

  test(`${naam}: een marktblok van twee rijen tegenover elkaar, dat niemand tegenhoudt, en het feest en de heer houden hun plek`, () => {
    const S = nieuwSpel(zaad);
    const D = S.dorp;
    const w = D.wereld;
    rijk(D);
    const heer = w.heer || w.marskramer;
    const feest = T.feestMidden(w);
    const paal = T.plekVoorDeSchandpaal(D);
    const midden = T.marktMidden(w);
    const voor = bereik(w, midden);

    // De plek die een verzoek kiest: het midden van het plein, met de eerste kramen.
    const plek = T.plekVoor(D, 'markt', T.deurVan(w, D.gebouwen.find((g) => g.huis === 'schout')));
    assert.deepEqual({ x: plek.x, y: plek.y }, midden);
    assert.equal(plek.kramen.length, T.MARKT_INSTELLINGEN.begin);
    assert.ok(T.gebouwPast(D, 'markt', plek.x, plek.y));

    const hout = D.voorraad.hout;
    const goud = D.voorraad.goud;
    const u = T.plaatsGebouw(D, 'markt', plek.x, plek.y);
    assert.ok(u.gelukt, u.reden);
    assert.deepEqual([hout - D.voorraad.hout, goud - D.voorraad.goud], [8, 6]);
    const markt = D.gebouwen.find((g) => g.soort === 'markt');
    const kramen = w.voorwerpen.filter((v) => v.soort === 'kraam');
    assert.equal(kramen.length, T.MARKT_INSTELLINGEN.begin);
    assert.deepEqual(kramen, markt.kramen);
    assert.ok(markt.blok.length >= 4, `een blok van ${markt.blok.length}`);
    assert.deepEqual(kramen.map((k) => k.waar), ['groente', 'brood', 'vis', 'laken'], 'een kraam per waar');
    for (const k of kramen) {
      assert.ok(T.opHetPlein(w, k.x, k.y), 'het blok ligt op het plein');
      assert.ok(!T.isBegaanbaar(w, k.x, k.y), 'een kraam staat er echt');
      assert.ok(cheb(k, feest) > T.FEESTEN_INSTELLINGEN.kring, 'buiten de kring van het feest');
      assert.ok(cheb(k, heer) > T.MARKT_INSTELLINGEN.vanDeHeer, 'weg van de heer');
      // de klant staat ervoor, op het looppad
      const [dx, dy] = richting[k.richting];
      assert.ok(T.isBegaanbaar(w, k.x + dx, k.y + dy), 'voor de toonbank is plaats voor de klant');
    }
    // twee aan twee tegenover elkaar, over het looppad heen
    for (let i = 0; i < kramen.length; i += 2) {
      const [a, b] = [kramen[i], kramen[i + 1]];
      const [dx, dy] = richting[a.richting];
      const n = T.MARKT_INSTELLINGEN.tussenRijen;
      assert.deepEqual([b.x, b.y], [a.x + dx * n, a.y + dy * n], 'de rij ertegenover');
      assert.deepEqual(richting[b.richting], [0 - dx || 0, 0 - dy || 0], 'ze kijken elkaar aan');
    }
    assert.ok(markt.manden.length > 0, 'manden en kisten erbij');

    niemandTegen(w, midden, voor, markt);
    for (const g of D.gebouwen) {
      if (g.opHetPlein) continue;
      const d = T.deurVan(w, g);
      assert.ok(bereik(w, midden).has(`${d.x},${d.y}`) || !voor.has(`${d.x},${d.y}`), 'elke deur blijft te bereiken');
    }

    // Het feest, de heer en zijn schandpaal houden hun plek.
    assert.deepEqual(T.feestMidden(w), feest);
    assert.ok(T.isBegaanbaar(w, heer.x, heer.y) && !T.voorwerpOp(w, heer.x, heer.y));
    assert.deepEqual(T.plekVoorDeSchandpaal(D), paal);

    // De markt staat als gebouw in de lijst, zonder voet: in aanbouw, dan klaar, en dan heeft het dorp een markt.
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

// Een markt die klaar is, in het ontworpen gehucht.
function metMarkt() {
  const S = nieuwSpel();
  const D = S.dorp;
  rijk(D);
  assert.ok(T.plaatsGebouw(D, 'markt', 0, 0).gelukt);
  const markt = D.gebouwen.find((g) => g.soort === 'markt');
  markt.klaar = true;
  for (const k of markt.kramen) k.inAanbouw = false;
  return { S, D, w: D.wereld, markt };
}

test('de markt groeit mee: een kraam per 15 mensen, één per nacht, eerst in het blok en dan langs de weg', () => {
  const { D, w, markt } = metMarkt();
  const midden = T.marktMidden(w);
  const voor = bereik(w, midden);
  T.tikMarktDag(D);
  assert.equal(markt.kramen.length, 4, 'bij 26 mensen blijft het bij vier');
  D.bevolking = 150;
  assert.equal(T.kramenNodig(D), 10);
  T.tikMarktDag(D);
  assert.equal(markt.kramen.length, 5, 'één per nacht');
  for (let i = 0; i < 10; i++) T.tikMarktDag(D);
  assert.equal(markt.kramen.length, 10);
  const opHetPlein = markt.kramen.filter((k) => T.opHetPlein(w, k.x, k.y));
  assert.equal(opHetPlein.length, markt.blok.length, 'het blok is vol');
  const straat = markt.kramen.filter((k) => !T.opHetPlein(w, k.x, k.y));
  assert.ok(straat.length > 0, 'de rest staat langs de weg');
  for (const k of straat) {
    const [dx, dy] = richting[k.richting];
    assert.ok(T.opPad(w, k.x + dx, k.y + dy), 'met de toonbank naar de weg');
    assert.ok(!T.opPad(w, k.x, k.y), 'niet op de weg zelf');
  }
  assert.deepEqual(markt.kramen.slice(4, 6).map((k) => k.waar), ['potten', 'groente'], 'de waar gaat rond');
  niemandTegen(w, midden, voor, markt);
});

test('een kraam ligt vol als het dorp zijn waar heeft, en anders staat hij leeg, met een lege mand', () => {
  const { D, markt } = metMarkt();
  const brood = markt.kramen.find((k) => k.waar === 'brood');
  T.wijzigVoorraad(D, 'brood', 5);
  T.tikMarktDag(D);
  assert.equal(brood.leeg, false);
  T.wijzigVoorraad(D, 'brood', -D.voorraad.brood);
  T.tikMarktDag(D);
  assert.equal(brood.leeg, true);
  const mand = markt.manden.find((m) => markt.kramen[m.nr] === brood);
  if (mand) assert.equal(mand.wat, 'mand leeg');
  T.wijzigVoorraad(D, 'vis', 0);
  T.wijzigVoorraad(D, 'vlees', 3);
  T.tikMarktDag(D);
  assert.equal(markt.kramen.find((k) => k.waar === 'vis').leeg, false, 'vlees ligt ook op de viskraam');
});

test('wie op de plek van een kraam staat, stapt opzij; en een bewaarde markt houdt zijn kramen en manden', () => {
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
  for (const kraam of [...markt.kramen, ...markt.manden]) assert.ok(S2.dorp.wereld.voorwerpen.includes(kraam), 'dezelfde als op de kaart');
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
