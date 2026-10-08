// Het veldwerk (js/veldwerk.js; werklijst vraag 111; Marcel, 3 okt: "Ook wil ik dat boeren op hun veld aan het werk
// zijn. Nu hebben ze wel velden, maar lopen ze gewoon random door het dorp. Ze moeten zaaien en op het veld bezig
// zijn."): overdag werkt een boer op zijn eigen land, naar het seizoen: zaaien, wieden, mest uitrijden, spitten,
// sprokkelen. Zijn boerin en grote kinderen helpen bij het zaaien. De regels van het spel veranderen er niet door.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, met een vast zaad, op `dag` (0 is 1 lentemaand, zeven uur 's ochtends is 7/24 erbij). Niemand
// komt de schout zoeken met een voorval: dat haalt een boer van zijn land, en dat hoort niet bij deze toetsen.
function gehucht(dag) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
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
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  return S;
}

// Zonder voorvallen, met een vaste worp, en na afloop alles terug.
function zonderVoorvallen(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (of `uren` lang).
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
  }
}

const boerenVan = (S) => S.wereld.wezens.filter((e) => !e.dood && e.werkAkkers && e.werkAkkers.length);
const opZijnLand = (S, e) => {
  const v = T.veldOp(S.wereld, e.tx, e.ty);
  return !!v && e.werkAkkers.includes(v);
};
const datumVan = (S) => T.datumVanDag(S.kalender.dag);

test('wat een boer vandaag doet: zaaien, wieden, maaien (dat is de oogst), mest, spitten en sprokkelen', () => {
  const S = gehucht(1 + 9 / 24); // 2 lentemaand
  const D = S.dorp;
  const e = boerenVan(S)[0];
  const op = (dag) => {
    S.kalender.dag = dag + 9 / 24;
    return T.veldwerkVandaag(D, e, datumVan(S));
  };
  assert.equal(op(1), 'zaaien', 'lentemaand, voor het graan kiemt');
  e.veldwerk = { soort: 'zaaien', i: 0, gedaan: 0, klaar: { zaaien: datumVan(S).jaar } };
  assert.equal(op(2), 'wieden', 'wie klaar is met zaaien, wiedt');
  assert.equal(op(45), 'wieden', 'grasmaand');
  assert.equal(op(95), 'wieden', 'zomermaand');
  assert.equal(op(125), null, 'hooimaand: de oogst, dan maait hij (T.werkOogstBij)');
  assert.equal(op(155), null, 'oogstmaand');
  assert.equal(op(185), 'spitten', 'herfstmaand: hij spit wat volgend jaar akker wordt');
  e.werkAkkers[0].mest = true;
  assert.equal(op(185), 'spitten', 'wat vandaag aan een veld verandert, doet hij morgen');
  assert.equal(op(186), 'mesten', 'krijgt een veld mest, dan rijdt hij die eerst uit');
  e.veldwerk.klaar.mesten = datumVan(S).jaar;
  assert.equal(op(186), 'spitten', 'en daarna spit hij');
  e.werkAkkers[0].mest = false;
  assert.ok(T.bosrandBij(S.dorp, e), 'er is bos bij zijn boerderij');
  assert.equal(op(275), 'sprokkelen', 'wintermaand');
  e.veldwerk.klaar.sprokkelen = 275;
  assert.equal(op(275), 'dorsen', 'een keer per dag; daarna dorst hij in de deur van zijn schuur (vraag 140)');
  T.VELDWERK_INSTELLINGEN.aan = false;
  try {
    assert.equal(op(45), null, 'uit: hij staat overdag bij zijn boerderij, zoals tot 5 okt');
  } finally {
    T.VELDWERK_INSTELLINGEN.aan = true;
  }
});

test('de tegels van zijn werk: zijn akkers rij voor rij, heen en terug, elke tegel één keer', () => {
  const S = gehucht(1 + 9 / 24);
  for (const e of boerenVan(S)) {
    const lijst = T.veldwerkTegels(S.wereld, e, 'zaaien');
    const akkers = e.werkAkkers.filter((v) => T.bestemmingVan(v) === 'akker');
    const tegels = akkers.reduce((n, v) => n + v.b * v.h, 0);
    assert.equal(lijst.length, tegels, `${e.wie}: al zijn akkertegels`);
    assert.equal(new Set(lijst.map((t) => t.x + ',' + t.y)).size, lijst.length, `${e.wie}: elke tegel één keer`);
    for (let i = 1; i < lijst.length; i++) {
      const zelfdeVeld = T.veldOp(S.wereld, lijst[i].x, lijst[i].y) === T.veldOp(S.wereld, lijst[i - 1].x, lijst[i - 1].y);
      if (zelfdeVeld) assert.equal(T.afstand(lijst[i], lijst[i - 1]), 1, `${e.wie}: op een veld steeds de tegel ernaast`);
    }
  }
});

test('een dag zaaien: hij loopt naar zijn akker, zaait tegel voor tegel, schaft op de akker, en slaapt thuis', () => {
  zonderVoorvallen(() => {
    const S = gehucht(1 + 7 / 24);
    const boeren = boerenVan(S);
    totUur(S, 1, 10);
    for (const e of boeren) {
      assert.ok(opZijnLand(S, e), `${e.wie} staat om tien uur op zijn land (${e.tx},${e.ty})`);
      assert.equal(e.werkt && e.werkt.soort, 'zaaien', `${e.wie} zaait`);
      assert.ok(!T.kanPraten(S, S.dorp, e, 'werk'), `${e.wie} maakt geen praatje onder het werk`);
      assert.ok(!T.magOpzij(S, e), `${e.wie} gaat niet opzij`);
    }
    const voor = boeren.map((e) => e.veldwerk.gedaan);
    totUur(S, 1, 12.5);
    for (const e of boeren) {
      assert.ok(opZijnLand(S, e), `${e.wie} schaft op zijn akker`);
      assert.ok(e.werkt && e.werkt.rust, `${e.wie} staat even`);
    }
    totUur(S, 1, 16);
    boeren.forEach((e, i) => assert.ok(e.veldwerk.gedaan > voor[i] + 5, `${e.wie} zaaide door na de schaft (${e.veldwerk.gedaan})`));
    totUur(S, 1, 19);
    for (const e of boeren) assert.equal(e.werkt, null, `${e.wie} werkt 's avonds niet`);
    totUur(S, 1, 24); // wie 's avonds naar de herberg ging (js/herberg.js), is dan ook thuis
    for (const e of boeren) assert.ok(e.binnen, `${e.wie} slaapt thuis (${e.tx},${e.ty})`);
  });
});

test('zaaien doet hij één keer over al zijn akkers, en dan wiedt hij; de boerin en de grote kinderen helpen alleen bij het zaaien', () => {
  zonderVoorvallen(() => {
    const S = gehucht(1 + 7 / 24);
    const D = S.dorp;
    const boeren = boerenVan(S);
    totUur(S, 1, 10);
    const helpers = S.wereld.wezens.filter((h) => T.helpAnker(D, h));
    assert.ok(helpers.length >= 3, `${helpers.length} helpen bij het zaaien`);
    for (const h of helpers) {
      const p = T.bewonerVan(D, h);
      assert.equal(p.huis.soort, 'boerderij', 'van een boerderij');
      assert.ok(p.leeftijd === 'volwassen' || p.leeftijd === 'jong', 'volwassen of groot');
      const a = T.helpAnker(D, h);
      const boer = boeren.find((b) => b.tx === a.x && b.ty === a.y);
      assert.ok(boer && T.bewonerVan(D, boer).huis === p.huis, 'bij hun eigen boer');
      assert.ok(!T.kanPraten(S, D, h, 'werk'), 'wie helpt, maakt geen praatje');
    }
    totUur(S, 9, 10);
    const jaar = datumVan(S).jaar;
    for (const e of boeren) {
      assert.equal(e.veldwerk.klaar.zaaien, jaar, `${e.wie} is klaar met zaaien`);
      assert.equal(e.werkt && e.werkt.soort, 'wieden', `${e.wie} wiedt nu`);
    }
    assert.equal(S.wereld.wezens.filter((h) => T.helpAnker(D, h)).length, 0, 'bij het wieden helpt niemand');
  });
});

test('in de winter sprokkelt hij aan de bosrand, en brengt hij een bundel hout naar huis', () => {
  zonderVoorvallen(() => {
    const S = gehucht(275 + 7 / 24); // 6 wintermaand
    const w = S.wereld;
    const D = S.dorp;
    const alle = boerenVan(S);
    // Een bosrand is de rand van een echt stuk bos, met de bomen achter hem; wie er geen in de buurt heeft, blijft bij
    // zijn boerderij.
    const boeren = alle.filter((e) => T.bosrandBij(D, e));
    assert.ok(boeren.length >= 3, `${boeren.length} boeren hebben bos in de buurt`);
    for (const e of alle) if (!boeren.includes(e)) assert.equal(T.veldwerkVandaag(D, e, datumVan(S)), 'dorsen', `${e.wie} dorst bij zijn boerderij`);
    const boom = (x, y) => T.NATUUR.bos.telt(w, x, y, T.voorwerpOp(w, x, y));
    const aanDeBosrand = (e) => boom(e.tx - 1, e.ty) || boom(e.tx, e.ty - 1) || boom(e.tx - 1, e.ty - 1);
    const gezien = new Map(boeren.map((e) => [e, { rapen: false, bundel: false }]));
    for (let u = 8; u <= 19; u += 0.25) {
      totUur(S, 275, u);
      for (const e of boeren) {
        const g = gezien.get(e);
        if (e.werkt && e.werkt.soort === 'sprokkelen' && e.werkt.tot != null) {
          g.rapen = true;
          assert.ok(aanDeBosrand(e), `${e.wie} raapt hout met een boom achter zich (${e.tx},${e.ty})`);
          assert.equal(e.draagt, 'bundel');
        }
        if (e.draagt === 'bundel' && !e.werkt) g.bundel = true;
      }
    }
    for (const e of boeren) {
      const g = gezien.get(e);
      assert.ok(g.rapen && g.bundel, `${e.wie} raapte hout en bracht het naar huis`);
      assert.equal(e.draagt, null, `${e.wie} legde de bundel thuis neer`);
      assert.equal(e.veldwerk.klaar.sprokkelen, 275, `${e.wie} sprokkelde vandaag`);
    }
  });
});

test('wie werkt, dwaalt niet weg; wie met de schout praat of een voorval brengt, houdt op', () => {
  zonderVoorvallen(() => {
    const S = gehucht(45 + 7 / 24); // 16 grasmaand: wieden
    const D = S.dorp;
    totUur(S, 45, 10);
    const [a, b] = boerenVan(S);
    assert.ok(a.werkt && b.werkt, 'ze wieden');
    S.spreektMet = a;
    b.zoektSchout = true;
    T.werkVeldwerkBij(S, D);
    assert.equal(a.werkt, null, 'wie met de schout praat, werkt niet');
    assert.equal(b.werkt, null, 'wie de schout zoekt, ook niet');
    S.spreektMet = null;
    delete b.zoektSchout;
    totUur(S, 45, 11);
    assert.ok(a.werkt && b.werkt, 'daarna gaan ze weer aan het werk');
  });
});

test('wat hij doet, staat op zijn poppetje, en blijft na bewaren en laden hetzelfde', () => {
  zonderVoorvallen(() => {
    const S = gehucht(45 + 7 / 24);
    totUur(S, 45, 10);
    const e = boerenVan(S)[0];
    assert.ok(e.werkt && e.veldwerk);
    const L = T.leesSpel(T.bewaarSpel(S, { nu: 0 }));
    assert.ok(L.gelukt, L.reden);
    const f = L.staat.wereld.wezens.find((x) => x.wie === e.wie);
    assert.deepEqual(f.werkt, e.werkt);
    assert.deepEqual(f.veldwerk, e.veldwerk);
  });
});
