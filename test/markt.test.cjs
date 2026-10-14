// De markt op het plein (js/markt.js; werklijst vraag 110, d; Marcel, 5 okt: "Voor nu a1, b tot e ja"): kramen in twee
// rijen tegenover elkaar, waar je tussendoor loopt, en het midden vrij voor het feest en de heer. Sinds ronde 2 van het
// snoeien (stap 6; Marcel, 12 okt: "Plein krijgt plaatsen") heeft het plein een vaste marktplek, die de maker kiest als
// hij het land legt; een gebouw blijft ervan af, de schandpaal ook, en de spelregel "De markt" is weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => {} });
const { leegBegin, proefDorp } = require('./grond.cjs');

function rijk(D) {
  T.wijzigVoorraad(D, 'hout', 100);
  T.wijzigVoorraad(D, 'planken', 100); // de markt is van het dorp, en een dorp bouw je van planken (vraag 157)
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
const richting = { ZO: [1, 0], ZW: [0, 1], NW: [-1, 0], NO: [0, -1] };
// De tegels van een kraam (een lange beslaat er meer, langs zijn rij), en hoeveel tegels toonbank een lijst kramen is.
const tegelsVan = (k) => {
  const [b, h] = k.beslaat || [1, 1];
  return Array.from({ length: Math.max(b, h) }, (_, i) => ({ x: k.x + (b > 1 ? i : 0), y: k.y + (h > 1 ? i : 0) }));
};
const tegels = (kramen) => kramen.reduce((s, k) => s + (k.lengte || 1), 0);
// De tegels die de markt dichtzet: zijn kramen en de manden ernaast.
const dichtVan = (markt) => new Set([...markt.kramen.flatMap((k) => tegelsVan(k)), ...markt.manden].map((v) => `${v.x},${v.y}`));
// Houdt de markt niemand tegen? Wat je eerst vanaf het midden bereikte, bereik je nog, op wat hij dichtzette na.
function niemandTegen(w, midden, voor, markt) {
  const na = bereik(w, midden);
  const dicht = dichtVan(markt);
  for (const t of voor) if (!dicht.has(t)) assert.ok(na.has(t), `${t} is niet meer te bereiken`);
}

test('de markt kost 8 planken en 6 goud, en de spelregel "De markt" is weg', () => {
  assert.deepEqual(T.GEBOUWEN.markt.kosten, { planken: 8, goud: 6 });
  assert.ok(!T.OPTIES.some((o) => o.id === 'markt'));
  assert.equal(T.MARKT_INSTELLINGEN.opHetPlein, undefined);
});

test('op twintig eilanden heeft het plein een marktplek: twee rijen tegenover elkaar, buiten het feest, het kamp, de heer en de eiken', () => {
  const echt = console.warn;
  console.warn = () => {};
  try {
    for (let zaad = 1; zaad <= 20; zaad++) {
      const w = T.laadGemaaktGehucht(zaad);
      const [a, b] = w.markt.rijen;
      assert.ok(a && b, `eiland ${zaad}: een marktplek`);
      assert.ok(a.lengte >= 3 && b.lengte === a.lengte, `eiland ${zaad}: rijen van ${a.lengte}`);
      const [dx, dy] = richting[a.richting];
      const n = T.MARKT_INSTELLINGEN.tussenRijen;
      assert.deepEqual([b.x, b.y], [a.x + dx * n, a.y + dy * n], 'de rij ertegenover');
      assert.deepEqual(richting[b.richting], [0 - dx || 0, 0 - dy || 0], 'ze kijken elkaar aan');
      const plek = T.marktTegels(w);
      assert.equal(plek.length, a.lengte * (n + 1), 'de twee rijen en het looppad ertussen');
      const feest = T.feestMidden(w);
      const heer = w.heer || w.marskramer;
      const kamp = [w.kamp.vuur, w.kamp.kar, ...w.kamp.plekken];
      const eiken = w.voorwerpen.filter((v) => T.opHetPlein(w, v.x, v.y) && T.NATUUR.bos.telt(w, v.x, v.y, v));
      for (const r of [a, b]) {
        for (let k = 0; k < r.lengte; k++) {
          const t = { x: r.x + r.ax * k, y: r.y + r.ay * k };
          assert.ok(T.opHetPlein(w, t.x, t.y) && T.isBegaanbaar(w, t.x, t.y), `eiland ${zaad}: een kraam op het plein`);
          assert.ok(cheb(t, feest) > T.FEESTEN_INSTELLINGEN.kring, 'buiten de kring van het feest');
          assert.ok(cheb(t, heer) > T.MARKT_INSTELLINGEN.vanDeHeer, 'weg van de heer en de marskramer');
          assert.ok(kamp.every((p) => p.x !== t.x || p.y !== t.y), 'niet in het kamp');
          assert.ok(eiken.every((e) => cheb(e, t) > T.MARKT_INSTELLINGEN.vanBomen), 'weg van de eiken');
        }
      }
    }
  } finally {
    console.warn = echt;
  }
});

test('een gebouw blijft van de marktplek af (zijn deur zou erop uitkomen), en de schandpaal ook', () => {
  // (op een eiland waar de marktplek tegen de weg ligt, kan er toch al niets naast)
  let geweigerd = 0;
  for (const zaad of [2, 5]) {
    const { D, w } = leegBegin(T, zaad);
    const plek = T.marktTegels(w);
    const v = T.MARKT_INSTELLINGEN.vrij;
    // elke plek voor een hut waarvan de voet binnen `vrij` tegels van de marktplek ligt
    const voet = T.gebouwVoet('hut', T.volgendeTekening(D, 'hut'));
    for (let y = Math.min(...plek.map((t) => t.y)) - v - voet.h; y <= Math.max(...plek.map((t) => t.y)) + v; y++) {
      for (let x = Math.min(...plek.map((t) => t.x)) - v - voet.b; x <= Math.max(...plek.map((t) => t.x)) + v; x++) {
        const bij = plek.some((t) => t.x >= x - v && t.x < x + voet.b + v && t.y >= y - v && t.y < y + voet.h + v);
        const reden = T.waaromPastHetNiet(D, 'hut', x, y);
        if (bij) assert.ok(reden, `eiland ${zaad}: een hut op ${x},${y} vlak bij de marktplek`);
        if (reden === 'The market stalls go there.') {
          assert.ok(bij, 'alleen vlak bij de marktplek');
          geweigerd++;
        }
      }
    }
    const paal = T.plekVoorDeSchandpaal(D);
    assert.ok(!T.opDeMarktPlek(w, paal.x, paal.y) && !T.opDeMarktPlek(w, paal.x + 1, paal.y + 1), 'de schandpaal en wie eraan staat');
  }
  assert.ok(geweigerd > 0, 'de reden komt voor');
});

for (const zaad of [2, 11]) {
  // Op het proefdorp van deze eilanden paste de markt niet meer toen het spel de plek pas zocht als hij kwam: de deuren
  // langs het plein hadden hem genomen.
  test(`het proefdorp op eiland ${zaad}: de markt komt op zijn plek, houdt niemand tegen, en het feest en de heer houden de hunne`, () => {
    const { S, D, w } = proefDorp(T, { zaad });
    rijk(D);
    const heer = w.heer || w.marskramer;
    const feest = T.feestMidden(w);
    const paal = T.plekVoorDeSchandpaal(D);
    const midden = T.marktMidden(w);
    const voor = bereik(w, midden);

    // De plek die T.plekVoor kiest: het midden van het plein, met de eerste kramen.
    const plek = T.plekVoor(D, 'markt', midden);
    assert.deepEqual({ x: plek.x, y: plek.y }, midden);
    assert.ok(tegels(plek.kramen) >= T.MARKT_INSTELLINGEN.beginTegels, 'de eerste kramen: zoveel tegels toonbank');
    assert.ok(T.gebouwPast(D, 'markt', plek.x, plek.y));

    const planken = D.voorraad.planken;
    const goud = D.voorraad.goud;
    const u = T.plaatsGebouw(D, 'markt', plek.x, plek.y);
    assert.ok(u.gelukt, u.reden);
    assert.deepEqual([planken - D.voorraad.planken, goud - D.voorraad.goud], [8, 6]);
    const markt = D.gebouwen.find((g) => g.soort === 'markt');
    const kramen = w.voorwerpen.filter((v) => v.soort === 'kraam');
    assert.ok(tegels(kramen) >= T.MARKT_INSTELLINGEN.beginTegels);
    assert.deepEqual(kramen, markt.kramen);
    assert.deepEqual(kramen.map((k) => k.waar), T.MARKT_INSTELLINGEN.volgorde.slice(0, kramen.length), 'een kraam per waar');
    assert.deepEqual(markt.blok.rijen.map((r) => [r.x, r.y, r.lengte]), w.markt.rijen.map((r) => [r.x, r.y, r.lengte]), 'op de marktplek');
    for (const k of kramen) {
      const soort = T.MARKT_INSTELLINGEN.kramen[k.waar];
      assert.ok(soort.vormen.includes(k.vorm), `${k.waar} als ${k.vorm}`);
      assert.ok(k.lengte >= 1 && k.lengte <= soort.lengte[1], `${k.waar} van ${k.lengte} tegels`);
      for (const t of tegelsVan(k)) {
        // (wat niet op de marktplek past, komt langs de weg, de marktstraat)
        assert.ok(!T.opHetPlein(w, t.x, t.y) || T.opDeMarktPlek(w, t.x, t.y), 'op het plein staat een kraam op de marktplek');
        assert.ok(!T.isBegaanbaar(w, t.x, t.y), 'een kraam staat er echt, over zijn hele lengte');
        assert.ok(!T.opHetPlein(w, t.x, t.y) || cheb(t, feest) > T.FEESTEN_INSTELLINGEN.kring, 'buiten de kring van het feest');
        assert.ok(cheb(t, heer) > T.MARKT_INSTELLINGEN.vanDeHeer, 'weg van de heer');
        const [fx, fy] = richting[k.richting];
        assert.ok(T.isBegaanbaar(w, t.x + fx, t.y + fy), 'voor de toonbank is plaats voor de klant');
      }
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

    // Er komt er geen tweede, en de marktplek houdt geen gebouw meer tegen: de kramen staan er zelf.
    assert.equal(T.waaromGeenMarktOpHetPlein(D), 'There is already a market on the square.');
    assert.equal(T.plekVoor(D, 'markt', midden), null);
    assert.equal(T.waaromNietBijDeMarkt(D, { x: markt.blok.rijen[0].x, y: markt.blok.rijen[0].y, b: 1, h: 1 }), null);
  });
}

// Een markt die klaar is, op het proefdorp.
function metMarkt(zaad = 3) {
  const { S, D, w } = proefDorp(T, { zaad });
  rijk(D);
  assert.ok(T.plaatsGebouw(D, 'markt', 0, 0).gelukt);
  const markt = D.gebouwen.find((g) => g.soort === 'markt');
  markt.klaar = true;
  for (const k of markt.kramen) k.inAanbouw = false;
  return { S, D, w, markt };
}

// (het proefdorp heeft minder wegen dan een dorp van een paar jaar, dus groeit de markt hier tot 13 tegels)
test('de markt groeit mee: een tegel toonbank per 10 mensen, één kraam per nacht, eerst op zijn plek en dan langs de weg', () => {
  const { D, w, markt } = metMarkt();
  const midden = T.marktMidden(w);
  const voor = bereik(w, midden);
  const begin = markt.kramen.length;
  T.tikMarktDag(D);
  assert.equal(markt.kramen.length, begin, `bij ${D.bevolking} mensen blijft het bij de eerste`);
  D.bevolking = 130;
  assert.equal(T.tegelsNodig(D), 13);
  T.tikMarktDag(D);
  assert.equal(markt.kramen.length, begin + 1, 'één per nacht');
  for (let i = 0; i < 20; i++) T.tikMarktDag(D);
  assert.ok(tegels(markt.kramen) >= 13, `${tegels(markt.kramen)} tegels toonbank`);
  assert.ok(markt.blok.rijen.every((r) => r.vol >= r.lengte - 1), 'de marktplek is vol');
  const straat = markt.kramen.filter((k) => !T.opHetPlein(w, k.x, k.y));
  assert.ok(straat.length > 0, 'wat niet op de marktplek past, staat langs de weg');
  for (const k of straat) {
    const [dx, dy] = richting[k.richting];
    for (const t of tegelsVan(k)) {
      assert.ok(T.opPad(w, t.x + dx, t.y + dy), 'met de toonbank naar de weg');
      assert.ok(!T.opPad(w, t.x, t.y), 'niet op de weg zelf');
    }
  }
  assert.deepEqual(markt.kramen.slice(4, 6).map((k) => k.waar), ['potten', 'groente'], 'de waar gaat rond');
  niemandTegen(w, midden, voor, markt);
});

test('welke kraam het wordt, ligt vast in het zaad: de vorm uit die van zijn waar, de lengte binnen zijn maat', () => {
  const { D } = metMarkt();
  const lengtes = new Set();
  const vormen = new Set();
  for (let nr = 0; nr < 60; nr++) {
    const k = T.kraamVoor(D, nr);
    assert.deepEqual(T.kraamVoor(D, nr), k, 'hetzelfde nummer, dezelfde kraam');
    const soort = T.MARKT_INSTELLINGEN.kramen[k.waar];
    assert.ok(soort.vormen.includes(k.vorm));
    assert.ok(k.lengte >= soort.lengte[0] && k.lengte <= soort.lengte[1]);
    if (k.vorm === 'kar') assert.ok(k.lengte <= 2, 'een kar is hooguit twee tegels');
    lengtes.add(k.lengte);
    vormen.add(k.vorm);
  }
  assert.deepEqual([...lengtes].sort(), [1, 2, 3], 'één, twee en drie tegels');
  assert.deepEqual([...vormen].sort(), ['kar', 'luifel', 'puntdak', 'zeil'], 'alle vier de vormen');
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

test('wie op de plek van een kraam staat, stapt opzij; en een bewaarde markt houdt zijn kramen, manden en marktplek', () => {
  const { S, D, w } = proefDorp(T, { zaad: 3 });
  rijk(D);
  const k = T.kraamPlekken(D)[0];
  const e = w.wezens.find((x) => x.bewoner && !x.binnen);
  Object.assign(e, { x: k.x, y: k.y, tx: k.x, ty: k.y, pad: [] });
  assert.ok(T.plaatsGebouw(D, 'markt', 0, 0).gelukt, 'waar je ook wijst: de markt komt op het plein');
  assert.ok(e.tx !== k.x || e.ty !== k.y);

  const S2 = {};
  assert.ok(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 })).gelukt);
  const markt = S2.dorp.gebouwen.find((g) => g.soort === 'markt');
  assert.equal(markt.kramen.length, D.gebouwen.find((g) => g.soort === 'markt').kramen.length);
  for (const kraam of [...markt.kramen, ...markt.manden]) assert.ok(S2.dorp.wereld.voorwerpen.includes(kraam), 'dezelfde als op de kaart');
  assert.deepEqual(S2.dorp.wereld.markt, w.markt, 'de marktplek gaat mee');
});
