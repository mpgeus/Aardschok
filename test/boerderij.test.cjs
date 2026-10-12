// Boeren uit het niets (js/boerderij.js; werklijst vraag 152, 1e; Marcel, 11 okt: "A2", "Inderdaad met b2", "Ja dat is
// goed. De bouwers pakken het op", "De karakters zetten we even opzij"): in het lege begin wordt boer wie er op een
// boerderij woont, en de velden leg jij bij een boerderij; het eerste veld bepaalt of het een akkerbouwer of een wijnboer is.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const gezegd = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : undefined) });

// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil en met een vaste reeks toeval (zoals in
// test/begin.test.cjs). Zaad 2 heeft open grond bij het plein.
function leegBegin(zaad = 2) {
  const echt = console.warn;
  const toeval = Math.random;
  const maker = { ...T.MAKER_INSTELLINGEN };
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.MAKER_INSTELLINGEN.opEiland = true;
  const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
  return { S, D: S.dorp, w: S.dorp.wereld };
}

function dagen(S, van, tot) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    T.tikGebouwenDag(S.dorp, dag);
  }
}
// Tot alles af is; geeft de dag waarop.
function totAf(S, gebouwen, van, hooguit = 60) {
  for (let dag = van; dag < van + hooguit; dag++) {
    dagen(S, dag, dag);
    if (gebouwen.every((g) => g.klaar)) return dag;
  }
  return assert.fail('het komt niet af');
}
const wonenIn = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

// `n` gebouwen van deze soort, zo dicht mogelijk bij het kampvuur, met een vaste reeks toeval (de tekening).
function zetGebouwen(D, n, soort) {
  const v = D.wereld.kamp.vuur;
  const uit = [];
  const toeval = Math.random;
  let z = 7;
  Math.random = () => (z = (z * 16807) % 2147483647) / 2147483647;
  try {
    for (let r = 1; r < 30 && uit.length < n; r++) {
      for (let dy = -r; dy <= r && uit.length < n; dy++) {
        for (let dx = -r; dx <= r && uit.length < n; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const kavel = T.bouwKavel(D, soort, v.x + dx, v.y + dy);
          if (soort !== 'boerderij' && kavel && T.teRooienOp(D, kavel).length) continue;
          const r2 = T.plaatsGebouw(D, soort, v.x + dx, v.y + dy);
          if (r2.gelukt) uit.push(r2.instantie);
        }
      }
    }
  } finally {
    Math.random = toeval;
  }
  assert.equal(uit.length, n, `er is plaats voor ${n} keer ${soort}`);
  return uit;
}

// Een rechthoek van b bij h bij boerderij g waar een veld van deze soort past, de dichtste eerst.
function veldPlek(D, soort, g, b = 6, h = 5) {
  const r = T.voetVanGebouw(g);
  const plekken = [];
  for (let y = r.y - 10; y <= r.y + r.h + 10; y++) {
    for (let x = r.x - 10; x <= r.x + r.b + 10; x++) {
      const q = { x, y, b, h };
      if (!T.waaromPastVeldNiet(D, soort, q)) plekken.push(q);
    }
  }
  assert.ok(plekken.length, `er is plaats voor een ${soort} bij de boerderij`);
  const midden = (q) => ({ x: q.x + q.b / 2, y: q.y + q.h / 2 });
  return plekken.sort((a, c) => T.afstand(midden(a), midden(r)) - T.afstand(midden(c), midden(r)))[0];
}

test('een boerderij is een thuis: een gezin uit het kamp trekt erin, de man is de boer, en zonder akker wil ze geen handen', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const [g] = zetGebouwen(D, 1, 'boerderij');
  gezegd.length = 0;
  const dag = totAf(S, [g], 2);
  const gezin = wonenIn(D, g);
  assert.equal(gezin.length, 3, 'een gezin uit het kamp');
  const boer = T.boerVan(D, g);
  assert.ok(boer && !boer.hoofd && gezin.includes(boer), 'het hoofd van het gezin is de boer');
  assert.equal(boer.karakter, undefined, 'zonder karakter (Marcel: "De karakters zetten we even opzij")');
  assert.ok(gezegd.some((t) => /farmer|boer/.test(t)), 'het dorp zegt wie er boer wordt');
  assert.equal(T.veldVan(g), null, 'nog geen veld: nog geen akkerbouwer of wijnboer');
  dagen(S, dag + 1, dag + 1);
  assert.equal(g.handen, 0, 'zonder akker werkt de boer elders, of bouwt hij mee');
  // Er trekt geen tweede gezin bij.
  totAf(S, zetGebouwen(D, 1, 'hut'), dag + 2);
  assert.equal(wonenIn(D, g).length, 3);
});

test('b2: is het kamp al leeg, dan verhuist een gezin uit een hut naar een lege boerderij', () => {
  // Twee gezinnen in de kar: binnen het bereik van het plein passen naast een boerderij twee hutten.
  const gezinnen = T.BEGIN_INSTELLINGEN.gezinnen;
  T.BEGIN_INSTELLINGEN.gezinnen = 2;
  let S, D;
  try {
    ({ S, D } = leegBegin());
  } finally {
    T.BEGIN_INSTELLINGEN.gezinnen = gezinnen;
  }
  dagen(S, 1, 1);
  // De bouwers werken in de volgorde waarin je neerzette: de boerderij achter de hutten, dus zijn de gezinnen het kamp al
  // uit als ze af is. (Eerst de boerderij gezocht, want binnen het bereik is er na vier hutten geen plaats meer voor.)
  const [g] = zetGebouwen(D, 1, 'boerderij');
  const hutten = zetGebouwen(D, T.kampTenten(D).length, 'hut');
  D.gebouwen.push(D.gebouwen.splice(D.gebouwen.indexOf(g), 1)[0]);
  gezegd.length = 0;
  totAf(S, hutten, 2);
  assert.equal(T.kampTenten(D).length, 0, 'het kamp is leeg');
  assert.ok(!g.klaar, 'en de boerderij is nog niet af');
  totAf(S, [g], 2);
  assert.equal(wonenIn(D, g).length, 3, 'een gezin trok erin');
  assert.equal(hutten.filter((h) => !wonenIn(D, h).length).length, 1, 'en zijn hut is vrij');
  assert.ok(gezegd.some((t) => /move from their|verhuizen van/.test(t)));
});

test('velden: pas met een boerderij; groot genoeg, niet te groot, dichtbij; de wijnboerderij niet in het lege begin', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  assert.ok(!T.magGebouwd(D, 'akker') && !T.magGebouwd(D, 'wijngaard'), 'zonder boerderij geen veld');
  assert.ok(!T.magGebouwd({ trede: 'dorp', begin: {}, gebouwen: [] }, 'wijnboerderij'), 'in het lege begin is de wijngaard een veld');
  assert.ok(T.magGebouwd({ trede: 'dorp', gebouwen: [] }, 'wijnboerderij'), 'in het gehucht dat er al was, blijft ze');
  const [g] = zetGebouwen(D, 1, 'boerderij');
  assert.ok(T.magGebouwd(D, 'akker') && T.magGebouwd(D, 'wijngaard'), 'met een boerderij, ook in aanbouw');
  const I = T.BOERDERIJ_INSTELLINGEN;
  const r = veldPlek(D, 'akker', g);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { ...r, b: 2, h: 2 }), /at least|minstens/);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { ...r, b: 9, h: 5 }) || '', /at most|hooguit|fit|past|free|vrij|square|plein|far|ver|field|veld/);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { x: r.x, y: r.y, b: I.veldMax, h: 1 }), /wide|breed/);
  const ver = { x: g.x + 60, y: g.y, b: 6, h: 5 };
  assert.ok(T.waaromPastVeldNiet(D, 'akker', ver), 'ver weg niet');
  const plein = T.pleinTegels(D.wereld)[0];
  assert.ok(T.waaromPastVeldNiet(D, 'akker', { x: plein.x, y: plein.y, b: 4, h: 4 }), 'niet op het plein');
  // Het eerste veld bepaalt wat de boerderij is.
  const uit = T.legVeld(D, 'akker', r);
  assert.ok(uit.gelukt, uit.reden);
  assert.equal(T.veldVan(g), 'akker');
  assert.equal(uit.instantie.bouw.werk, T.bouwWerkVan('akker', { b: r.b, h: r.h }));
  assert.ok(!T.magGebouwd(D, 'wijngaard'), 'een akkerbouwer krijgt geen wijngaard');
  assert.match(T.boerderijVoorVeld(D, 'wijngaard', r).reden, /fields of grain|akkers/);
  assert.ok(T.waaromPastVeldNiet(D, 'akker', r), 'op een veld in aanleg komt geen tweede');
});

test('een akker: de bouwers maken hem, dan is hij van de boerderij, de boer werkt hem en zaait hem in de lente', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  T.werkBewonersBij(D); // de gezinnen van het kamp komen aan: ze krijgen een poppetje
  const [g] = zetGebouwen(D, 1, 'boerderij');
  const veld = T.legVeld(D, 'akker', veldPlek(D, 'akker', g)).instantie;
  const dag = totAf(S, [g, veld], 2);
  assert.ok(T.isNazaaitijd(dag), 'nog in de lente');
  assert.ok(!D.gebouwen.includes(veld), 'een veld dat af is, is geen bouwplaats meer');
  const akker = w.akkers.find((a) => a.boerderij === g);
  assert.ok(akker, 'het is een akker van de boerderij');
  assert.deepEqual([akker.x, akker.y, akker.b, akker.h], [veld.x, veld.y, veld.voet.b, veld.voet.h]);
  assert.equal(akker.ongezaaid.size, akker.b * akker.h, 'nog niet gezaaid');
  const boer = T.boerVan(D, g);
  assert.ok(boer.wezen && boer.wezen.werkAkkers.includes(akker), 'de boer werkt hem');
  assert.equal(T.boerVanVeld(D, akker), boer.wezen);
  assert.equal(T.boerderijZonderAkker(D, g), false);
  dagen(S, dag + 1, dag + 1);
  assert.equal(akker.ongezaaid.size, 0, 'de boeren zaaien hem na, van het graan uit de kar');
  assert.equal(g.handen, T.GEBOUWEN.boerderij.handen, 'met een akker wil de boerderij haar handen');
  // En in de herfst is de oogst binnen.
  dagen(S, dag + 2, 6 * T.DAGEN_PER_MAAND);
  assert.ok((D.jaarboek && D.jaarboek.geoogst) > 0, 'de oogst is binnen');
});

test('een wijngaard: de bouwers planten hem, de ranken staan in rijen, en in wijnmaand plukt het gezin', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const [g] = zetGebouwen(D, 1, 'boerderij');
  const r = veldPlek(D, 'wijngaard', g);
  const veld = T.legVeld(D, 'wijngaard', r).instantie;
  assert.equal(T.veldVan(g), 'wijngaard');
  assert.ok(!T.magGebouwd(D, 'akker'), 'een wijnboer krijgt geen akker');
  const dag = totAf(S, [g, veld], 2);
  assert.ok(T.heeftWijngaard(g));
  assert.equal(w.wijngaarden.length, 1);
  const ranken = T.rankenVan(D, g);
  assert.equal(ranken.length, Math.ceil(r.h / T.WIJNGAARD_INSTELLINGEN.rijOm) * r.b, 'een rij ranken om de rij');
  assert.equal(T.wijngaardOp(D, r.x, r.y), g, 'daar bouw je niet');
  assert.ok(T.waaromNietOpDezeGrond(D, r.x, r.y));
  assert.equal(T.boerderijZonderAkker(D, g), true, 'een wijnboer werkt buiten de pluk elders');
  const wijnmaand = T.MAANDEN.findIndex((m) => m.naam === 'wijnmaand') - T.TIJD_START_MAAND;
  const pluk = wijnmaand * T.DAGEN_PER_MAAND;
  dagen(S, dag + 1, pluk);
  assert.ok(g.plukt, 'in wijnmaand plukt het gezin');
  assert.ok(wonenIn(D, g).every((p) => !T.kanWerken(p)), 'en werkt het nergens anders');
  const voor = D.voorraad.wijn || 0;
  for (const v of ranken) T.plukRank(v, pluk);
  T.wijnBinnen(D, ranken.length);
  assert.ok((D.voorraad.wijn || 0) > voor, 'de wijn is binnen');
});

test('bewaren en laden: een veld in aanleg, een akker en een wijngaard blijven aan hun boerderij vast', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const [a, b] = zetGebouwen(D, 2, 'boerderij');
  const akker = T.legVeld(D, 'akker', veldPlek(D, 'akker', a)).instantie;
  const wijn = T.legVeld(D, 'wijngaard', veldPlek(D, 'wijngaard', b)).instantie;
  const dag = totAf(S, [a, akker], 2);
  dagen(S, dag + 1, dag + 1);
  assert.ok(D.gebouwen.includes(wijn) || D.wereld.wijngaarden, 'de wijngaard is er, af of in aanleg');
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
  const D2 = S2.dorp;
  const a2 = D2.gebouwen.find((g) => g.soort === 'boerderij' && g.veld === 'akker');
  assert.ok(D2.wereld.akkers.some((x) => x.boerderij === a2), 'de akker hoort nog bij zijn boerderij');
});
