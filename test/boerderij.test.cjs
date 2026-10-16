// Boeren uit het niets (js/boerderij.js; werklijst vraag 152, 1e; Marcel, 11 okt: "A2", "Inderdaad met b2", "Ja dat is
// goed. De bouwers pakken het op", "De karakters zetten we even opzij"): in het lege begin wordt boer wie er op een
// boerderij woont, en de velden leg jij bij een boerderij: een akker bij een boerderij, een wijngaard bij een wijnboerderij
// (vraag 155; Marcel, 12 okt: "ik wil tóch een apart wijnboerderij gebouw", en "A gehucht, b ja, c ja").
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

const gezegd = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : undefined) });

// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil en met een vaste reeks toeval (zoals in
// test/begin.test.cjs), op het eiland van het proefdorp (T.proefdorp.zaad).
function leegBegin(zaad = T.proefdorp.zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
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
  const v = D.plek.kamp.vuur;
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

test('velden: pas met een boerderij; groot genoeg, niet te groot, dichtbij', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  assert.ok(!T.magGebouwd(D, 'akker') && !T.magGebouwd(D, 'wijngaard'), 'zonder boerderij geen veld');
  const [g] = zetGebouwen(D, 1, 'boerderij');
  assert.ok(T.magGebouwd(D, 'akker'), 'met een boerderij, ook in aanbouw');
  const I = T.BOERDERIJ_INSTELLINGEN;
  const r = veldPlek(D, 'akker', g);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { ...r, b: 2, h: 2 }), /at least|minstens/);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { ...r, b: 9, h: 5 }) || '', /at most|hooguit|fit|past|free|vrij|square|plein|far|ver|field|veld/);
  assert.match(T.waaromPastVeldNiet(D, 'akker', { x: r.x, y: r.y, b: I.veldMax, h: 1 }), /wide|breed/);
  const ver = { x: g.x + 60, y: g.y, b: 6, h: 5 };
  assert.ok(T.waaromPastVeldNiet(D, 'akker', ver), 'ver weg niet');
  const plein = T.pleinTegels(D)[0];
  assert.ok(T.waaromPastVeldNiet(D, 'akker', { x: plein.x, y: plein.y, b: 4, h: 4 }), 'niet op het plein');
  const uit = T.legVeld(D, 'akker', r);
  assert.ok(uit.gelukt, uit.reden);
  assert.equal(uit.instantie.boerderij, g, 'hij hoort bij zijn boerderij');
  assert.equal(uit.instantie.bouw.werk, T.bouwWerkVan('akker', { b: r.b, h: r.h }));
  assert.ok(T.waaromPastVeldNiet(D, 'akker', r), 'op een veld in aanleg komt geen tweede');
  const tweede = veldPlek(D, 'akker', g);
  assert.ok(T.legVeld(D, 'akker', tweede).gelukt, 'een boerderij neemt meer dan één akker');
});

// Marcel, 12 okt (vraag 155): "A gehucht, b ja, c ja": de wijngaard alleen bij een wijnboerderij, de akker alleen bij een boerderij.
test('de wijngaard alleen bij een wijnboerderij, de akker alleen bij een boerderij', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  assert.ok(T.magGebouwd(D, 'wijnboerderij'), 'de wijnboerderij staat in het bouwmenu van het lege begin, vanaf het gehucht');
  assert.equal(T.GEBOUWEN.akker.veld, 'boerderij');
  assert.equal(T.GEBOUWEN.wijngaard.veld, 'wijnboerderij');
  const [g] = zetGebouwen(D, 1, 'boerderij');
  assert.ok(T.magGebouwd(D, 'akker') && !T.magGebouwd(D, 'wijngaard'), 'een boerderij kan een akker nemen, geen wijngaard');
  const r = veldPlek(D, 'akker', g);
  assert.match(T.boerderijVoorVeld(D, 'wijngaard', r).reden, /A vineyard lies next to a vineyard farm/);
  assert.match(T.waaromPastVeldNiet(D, 'wijngaard', r), /vineyard farm/, 'de muis zegt het ook');
  assert.equal(T.legVeld(D, 'wijngaard', r).gelukt, false, 'en de klik legt hem niet');
  assert.equal(T.boerderijVoorVeld(D, 'akker', r).boerderij, g);

  const [w] = zetGebouwen(D, 1, 'wijnboerderij');
  assert.ok(T.magGebouwd(D, 'wijngaard') && T.magGebouwd(D, 'akker'), 'nu is er voor allebei een boerderij');
  const q = veldPlek(D, 'wijngaard', w);
  assert.equal(T.boerderijVoorVeld(D, 'wijngaard', q).boerderij, w, 'de wijngaard hoort bij de wijnboerderij');
  assert.equal(T.waaromPastVeldNiet(D, 'wijngaard', q), null);
  const uit = T.legVeld(D, 'wijngaard', q);
  assert.ok(uit.gelukt, uit.reden);
  assert.equal(uit.instantie.boerderij, w);
  assert.ok(!('veld' in w) && !('veld' in g), 'het eerste veld bepaalt niets meer: de soort zegt het');
});

// Marcel, 12 okt (vraag 155): de wijnboerderij is een gewoon huis met een gezin, zoals de boerderij.
test('een wijnboerderij is een huis van 5 bij 4 voor een gezin: het trekt erin uit het kamp, de man is de boer', () => {
  const G = T.GEBOUWEN.wijnboerderij;
  assert.deepEqual([G.trede, G.voet, G.kosten, G.heer], ['gehucht', { b: 5, h: 4 }, { hout: 18, goud: 8 }, { wijn: 10 }]);
  assert.deepEqual([G.oogst, G.alleenIn.maanden, G.tekening, G.tekeningen], ['wijn', ['wijnmaand'], 'gebouwen/wijnhuis', undefined]);
  assert.deepEqual(T.gebouwVoet('wijnboerderij'), { b: 5, h: 4 }, 'de tekening beslaat 5 bij 4');
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const [g] = zetGebouwen(D, 1, 'wijnboerderij');
  assert.deepEqual([T.voetVanGebouw(g).b, T.voetVanGebouw(g).h], [5, 4]);
  gezegd.length = 0;
  const kamp = T.kampTenten(D).length;
  const dag = totAf(S, [g], 2);
  const gezin = wonenIn(D, g);
  assert.equal(gezin.length, 3, 'een gezin uit het kamp');
  assert.equal(T.kampTenten(D).length, kamp - 1, 'en zijn tent gaat weg');
  const boer = T.boerVan(D, g);
  assert.ok(boer && !boer.hoofd && gezin.includes(boer), 'het hoofd van het gezin is de boer');
  assert.ok(T.isBoer(D, boer), 'een wijnboer is een boer');
  assert.equal(T.standVan(g), 'boeren');
  assert.ok(gezegd.some((t) => /vineyard farm: .* is the farmer now/.test(t)), 'het dorp zegt wie er boer wordt');
  dagen(S, dag + 1, dag + 1);
  assert.equal(g.handen, 0, 'ze vraagt geen handen: haar gezin werkt elders, bouwt mee, en plukt in wijnmaand');
  assert.equal(wonenIn(D, g).length, 3, 'er trekt geen tweede gezin bij');
});

test('b2: is het kamp al leeg, dan verhuist ook een gezin uit een hut naar een lege wijnboerderij', () => {
  const gezinnen = T.BEGIN_INSTELLINGEN.gezinnen;
  T.BEGIN_INSTELLINGEN.gezinnen = 2;
  let S, D;
  try {
    ({ S, D } = leegBegin());
  } finally {
    T.BEGIN_INSTELLINGEN.gezinnen = gezinnen;
  }
  dagen(S, 1, 1);
  const hutten = zetGebouwen(D, T.kampTenten(D).length, 'hut');
  const [g] = zetGebouwen(D, 1, 'wijnboerderij');
  gezegd.length = 0;
  totAf(S, hutten, 2);
  assert.equal(T.kampTenten(D).length, 0, 'het kamp is leeg');
  totAf(S, [g], 2);
  assert.equal(wonenIn(D, g).length, 3, 'een gezin trok erin');
  assert.ok(gezegd.some((t) => /vineyard farm/.test(t)));
});

test('een akker: de bouwers maken hem, dan is hij van de boerderij, de boer werkt hem en zaait hem in de lente', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  T.werkBewonersBij(D); // de gezinnen van het kamp komen aan: ze krijgen een poppetje
  const [g] = zetGebouwen(D, 1, 'boerderij');
  T.brengMeteen(D, g); // het hout is er al (js/kar.js), zodat de boerderij en de akker samen af zijn
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
  const [g] = zetGebouwen(D, 1, 'wijnboerderij');
  const r = veldPlek(D, 'wijngaard', g);
  const veld = T.legVeld(D, 'wijngaard', r).instantie;
  const dag = totAf(S, [g, veld], 2);
  assert.ok(T.isWijnboerderij(g));
  assert.equal(w.wijngaarden.length, 1);
  assert.equal(w.wijngaarden[0].boerderij, g, 'de wijngaard hoort bij zijn wijnboerderij');
  const ranken = T.rankenVan(D, g);
  assert.equal(ranken.length, Math.ceil(r.h / T.WIJNGAARD_INSTELLINGEN.rijOm) * r.b, 'een rij ranken om de rij');
  assert.equal(T.wijngaardOp(D, r.x, r.y), g, 'daar bouw je niet');
  assert.ok(T.waaromNietOpDezeGrond(D, r.x, r.y));
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
  const [a] = zetGebouwen(D, 1, 'boerderij');
  const [b] = zetGebouwen(D, 1, 'wijnboerderij');
  const akker = T.legVeld(D, 'akker', veldPlek(D, 'akker', a)).instantie;
  const wijn = T.legVeld(D, 'wijngaard', veldPlek(D, 'wijngaard', b)).instantie;
  const dag = totAf(S, [a, akker, b], 2);
  dagen(S, dag + 1, dag + 1);
  assert.ok(D.gebouwen.includes(wijn) || D.wereld.wijngaarden, 'de wijngaard is er, af of in aanleg');
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
  const D2 = S2.dorp;
  const a2 = D2.gebouwen.find((g) => g.soort === 'boerderij');
  assert.ok(D2.wereld.akkers.some((x) => x.boerderij === a2), 'de akker hoort nog bij zijn boerderij');
  const b2 = D2.gebouwen.find((g) => g.soort === 'wijnboerderij');
  assert.ok(D2.gebouwen.some((g) => g.soort === 'wijngaard' && g.boerderij === b2) || D2.wereld.wijngaarden.some((x) => x.boerderij === b2),
    'de wijngaard hoort nog bij zijn wijnboerderij');
});
