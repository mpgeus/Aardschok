// Het lege begin (js/begin.js; werklijst vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan
// bouwen"): met de spelregel "Het begin" op "Leeg" legt de maker op het eiland geen gehucht, maar alleen het land met een
// open plek; een kar rijdt het land in, met de schout, zijn gezin en vier gezinnen, en op het plein zetten ze hun kamp op.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Wat er tegen het scherm gezegd wordt: een bericht, en welke brieven er kwamen.
const gezegd = [];
const brieven = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : naam === 'toonBrief' ? brieven.push(args[1]) : undefined) });

// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil en met een vaste reeks toeval (zoals js/main.js het
// begint, zonder scherm). Standaard zaad 2: daar is open grond voor vier hutten binnen het bouwbereik.
function leegBegin(zaad = 2) {
  const echt = console.warn;
  const toeval = Math.random;
  const maker = { ...T.MAKER_INSTELLINGEN };
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  Object.assign(T.MAKER_INSTELLINGEN, { eigenGehucht: true, opEiland: true, leeg: true });
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

// Dagen zoals het spel ze tikt (js/gebouwen.js).
function dagen(S, van, tot, elkeDag) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    T.tikGebouwenDag(S.dorp, dag);
    if (elkeDag) elkeDag(dag);
  }
}

test('het lege land: geen huizen, geen boeren, geen akkers; wel het plein, de plek van de marskramer en de uitgang', () => {
  const { D, w } = leegBegin();
  assert.deepEqual([...new Set(D.gebouwen.map((g) => g.soort))], ['tent'], 'er staan alleen de tenten van het kamp');
  assert.equal(w.akkers ? w.akkers.length : 0, 0);
  assert.ok(!w.wezens.some((e) => e.wie), 'er is nog geen boer of herbergierster');
  assert.ok(w.marskramer, 'de marskramer heeft zijn plek');
  assert.ok(T.wegInEnUit(w), 'de weg komt het land in');
  assert.ok(T.pleinTegels(w).length > 100, 'er is een plein');
  assert.ok(w.kamp && w.kamp.plekken.length >= 1 + T.BEGIN_INSTELLINGEN.gezinnen, 'de maker koos een plek voor het kamp');
});

test('het kamp: een tent per gezin, die van de schout is zijn huis, en er is geen plaats voor een nieuw gezin', () => {
  const { D } = leegBegin();
  const tenten = D.gebouwen.filter((g) => g.soort === 'tent');
  assert.equal(tenten.length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(tenten.filter((g) => g.huis === 'schout').length, 1);
  for (const g of tenten) assert.ok(D.bewoners.mensen.some((p) => p.huis === g), 'in elke tent woont een gezin');
  const gezinnen = new Set(D.bewoners.mensen.map((p) => p.gezin));
  assert.equal(gezinnen.size, tenten.length, 'een gezin per tent');
  assert.equal(D.bevolking, D.bewoners.mensen.length, 'het getal is wie er is');
  for (const g of T.kampTenten(D)) {
    assert.equal(D.bewoners.mensen.filter((p) => p.huis === g).length, 3, 'een man, een vrouw en een kind: dat past in een hut');
  }
  assert.ok(T.GEBOUWEN.hut.woonruimte >= 3);
  assert.equal(T.telWoonruimte(D), D.bevolking, 'een tent is zo groot als zijn gezin');
  assert.ok(!T.plaatsVoorEenGezin(D), 'een nieuw gezin vindt er geen plaats');
});

test('de voorraad is wat de kar meebrengt', () => {
  const { D } = leegBegin();
  const K = T.BEGIN_INSTELLINGEN.kar;
  assert.equal(D.voorraad.hout, K.hout);
  assert.equal(D.voorraad.graan, K.graan + K.zaaigraan);
  assert.equal(D.voorraad.goud, K.goud);
  assert.equal(D.voorraad.gereedschap, K.gereedschap);
});

test('de aankomst: de kar begint aan de rand op de weg, met de schout ernaast, en de gezinnen komen erachter', () => {
  const { D, w } = leegBegin();
  const B = D.begin;
  assert.equal(B.kamp, 'onderweg');
  assert.ok(w.wezens.includes(B.kar) && B.kar.kar, 'de kar is een wezen op de kaart');
  assert.deepEqual([B.kar.tx, B.kar.ty], [B.van.x, B.van.y], 'hij begint waar de weg het land in komt');
  assert.ok(B.kar.pad.length > 0, 'en hij heeft een weg naar het plein');
  assert.ok(T.afstand({ x: D.schout.tx, y: D.schout.ty }, B.van) <= 2, 'de schout staat bij de kar');
  assert.ok(D.bewoners.mensen.filter((p) => !p.schout).every((p) => p.komt && !p.wezen), 'de gezinnen komen nog');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 0, 'de tenten staan nog niet');
});

test('staat het kamp er in de nacht nog niet (geen beelden, of de kar zat vast), dan staat het daarna', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  assert.equal(D.begin.kamp, 'op');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'kampvuur').length, 1);
  assert.deepEqual([D.begin.kar.tx, D.begin.kar.ty], [w.kamp.kar.x, w.kamp.kar.y], 'de kar staat op zijn plek');
  for (const g of D.gebouwen) assert.ok(g.voorwerp && w.voorwerpen.includes(g.voorwerp), 'elke tent staat op de kaart');
  assert.ok(!T.magOpzij(S, D.begin.kar), 'wie de kar op zijn weg vindt, laat hem niet opzij gaan');
  assert.ok(D.bewoners.komen.length || D.bewoners.mensen.every((p) => p.schout || p.wezen), 'de gezinnen zijn onderweg');
});

test('een jaar vanaf een lege plek, zonder iets te doen: geen fout, en de heer vraagt niets', () => {
  const { S, D } = leegBegin();
  const begin = D.bevolking;
  gezegd.length = 0;
  let gril = false;
  brieven.length = 0;
  dagen(S, 1, T.DAGEN_PER_JAAR - 1, () => {
    if (D.grillen && D.grillen.vraag) gril = true;
    assert.ok(!(D.heer && (D.heer.brief || D.heer.bezoek)), 'geen schatting en geen bezoek op Sint-Maarten');
  });
  assert.ok(!gril, 'geen grillen het eerste jaar');
  assert.deepEqual(brieven, ['gespaard'], 'in wijnmaand schrijft hij alleen dat hij je spaart');
  // zonder te bouwen haalt het dorp de winter niet
  assert.ok(D.bevolking < begin);
  assert.ok(!gezegd.some((t) => /geen plaats/.test(t)), 'zolang er een gezin in het kamp woont, wil er geen nieuw gezin komen');
});

// Zet `n` hutten neer zo dicht mogelijk bij het kampvuur (niet op het plein), zoals de speler ze met het bouwmenu neerzet.
// Met een vaste reeks toeval, want welke tekening een hut krijgt (en dus hoe groot hij is), kiest T.volgendeTekening.
function zetHutten(D, n, soort = 'hut') {
  const v = D.wereld.kamp.vuur;
  const hutten = [];
  const toeval = Math.random;
  let z = 7;
  Math.random = () => (z = (z * 16807) % 2147483647) / 2147483647;
  try {
    for (let r = 1; r < 30 && hutten.length < n; r++) {
      for (let dy = -r; dy <= r && hutten.length < n; dy++) {
        for (let dx = -r; dx <= r && hutten.length < n; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const uit = T.plaatsGebouw(D, soort, v.x + dx, v.y + dy);
          if (uit.gelukt) hutten.push(uit.instantie);
        }
      }
    }
  } finally {
    Math.random = toeval;
  }
  assert.equal(hutten.length, n, `er is plaats voor ${n} hutten`);
  return hutten;
}
const wonenIn = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

test('"Leeg" zet Huizen en Wie bouwt op Jij: de hut en het huis staan in het bouwmenu, en het erf niet', () => {
  try {
    T.pasOptiesToe({ keuzes: { begin: 'leeg', huizen: 'dorpBouwtZelf', wieBouwt: 'mensen' } });
    assert.equal(T.MAKER_INSTELLINGEN.leeg, true);
    assert.equal(T.ERVEN_INSTELLINGEN.dorpBouwtZelf, false);
    assert.equal(T.VERZOEKEN_INSTELLINGEN.mensen, false);
    const { D } = leegBegin();
    assert.ok(T.inBouwmenu(D, 'hut') && T.inBouwmenu(D, 'huis') && T.inBouwmenu(D, 'houthakker'));
    assert.ok(!T.inBouwmenu(D, 'erf'));
  } finally {
    T.pasOptiesToe({});
  }
});

test('verhuizen: is een hut af, dan trekt er een gezin uit het kamp in, en gaat zijn tent weg; die van de schout blijft', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const begin = D.bevolking;
  const tenten = T.kampTenten(D).length;
  const hutten = zetHutten(D, tenten);
  assert.ok(T.waaromGeenGezin(D).includes('kamp'), 'zolang er een gezin in het kamp woont, komt er geen nieuw gezin');
  gezegd.length = 0;
  dagen(S, 2, 2 + T.GEBOUWEN.hut.bouwtijd);
  for (const g of hutten) {
    assert.ok(g.klaar);
    const gezin = wonenIn(D, g);
    assert.equal(gezin.length, 3, 'in elke hut een gezin uit het kamp');
    const deur = T.deurVan(w, g);
    for (const p of gezin) assert.ok(!p.wezen || (p.wezen.thuis.x === deur.x && p.wezen.thuis.y === deur.y), 'zijn thuis is de deur van de hut');
  }
  assert.equal(gezegd.filter((t) => /leave the camp|verlaten het kamp/.test(t)).length, tenten, 'het dorp zegt wie er verhuist');
  assert.equal(D.bevolking, begin, 'niemand erbij en niemand weg');
  assert.equal(T.kampTenten(D).length, 0, 'de tenten van de gezinnen zijn weg');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 1, 'alleen die van de schout staat er nog');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'kampvuur').length, 1, 'en het kampvuur brandt');
  assert.ok(w.wezens.includes(D.begin.kar), 'de kar blijft');
  assert.ok(!T.waaromGeenGezin(D).includes('kamp'), 'nu kan er weer een gezin komen');
  // en bewaren en laden gaat goed, zonder de tenten
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
});

test('verhuizen: past een gezin niet, dan gaat het heel naar een lege woning, ook als het krap is', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const ruimte = T.GEBOUWEN.hut.woonruimte;
  try {
    T.GEBOUWEN.hut.woonruimte = 2;
    const [hut] = zetHutten(D, 1);
    gezegd.length = 0;
    dagen(S, 2, 2 + T.GEBOUWEN.hut.bouwtijd);
    assert.equal(wonenIn(D, hut).length, 3, 'het hele gezin');
    assert.equal(T.kampTenten(D).length, T.BEGIN_INSTELLINGEN.gezinnen - 1, 'een gezin minder in het kamp');
    assert.ok(gezegd.some((t) => /krap|cramped/.test(t)), 'en het dorp zegt dat het krap is');
  } finally {
    T.GEBOUWEN.hut.woonruimte = ruimte;
  }
});

test('het tweede jaar vraagt hij wel', () => {
  const { S, D } = leegBegin();
  assert.ok(T.heerLaatMetRust(D, 0));
  assert.ok(!T.heerLaatMetRust(D, T.DAGEN_PER_JAAR));
});

test('bewaren en laden: het kamp en de kar blijven aan elkaar vast', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 2);
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  const D2 = S2.dorp;
  assert.ok(D2.wereld.wezens.includes(D2.begin.kar), 'de kar van het begin is de kar op de kaart');
  assert.ok(D2.gebouwen.every((g) => D2.wereld.voorwerpen.includes(g.voorwerp)), 'en elke tent zijn tekening');
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
});

test('alleen op het eiland: zonder eiland legt de maker het gehucht dat er al was', () => {
  const maker = { ...T.MAKER_INSTELLINGEN };
  Object.assign(T.MAKER_INSTELLINGEN, { opEiland: false, leeg: true });
  try {
    const w = T.laadGemaaktGehucht(3);
    assert.ok(!w.kamp);
    assert.ok(w.gebouwenOpKaart.length > 5);
  } finally {
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
});

// ── 1d: jij bouwt alles, binnen bereik (vraag 152; Marcel, 11 okt: "a1, b ja, c ja, d ja, e ja") ──

test('het bouwbereik: je bouwt binnen bouwBereik tegels van het plein, en verder niet; lopen kan overal', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const R = T.BEGIN_INSTELLINGEN.bouwBereik;
  const plein = T.pleinTegels(w);
  const verst = (t) => Math.min(...plein.map((p) => Math.hypot(p.x - t.x, p.y - t.y)));
  for (const p of plein) assert.ok(T.inBouwBereik(D, p.x, p.y), 'het plein ligt erin');
  // een tegel op de rand, en een net erbuiten, recht naar rechts van de rechterrand van het plein
  const rechts = plein.reduce((a, p) => (p.x > a.x ? p : a));
  assert.ok(T.inBouwBereik(D, rechts.x + R, rechts.y));
  assert.ok(!T.inBouwBereik(D, rechts.x + R + 1, rechts.y) || verst({ x: rechts.x + R + 1, y: rechts.y }) <= R);
  // ver weg zegt de regel waarom, ook als het daar verder zou passen
  const ver = { x: rechts.x + R + 5, y: rechts.y };
  const reden = T.waaromPastHetNiet(D, 'hut', ver.x, ver.y);
  assert.match(reden, /Te ver weg/);
  assert.equal(T.plaatsGebouw(D, 'hut', ver.x, ver.y).gelukt, false);
  // dichtbij lukt het wel (zaad 2 heeft open grond bij het plein)
  const [hut] = zetHutten(D, 1);
  const voet = T.voetVanGebouw(hut);
  for (let y = voet.y; y < voet.y + voet.h; y++) for (let x = voet.x; x < voet.x + voet.b; x++) assert.ok(T.inBouwBereik(D, x, y));
  assert.ok(T.isBegaanbaar(w, ver.x, ver.y) || T.isVast(w, ver.x, ver.y), 'buiten het bereik is gewoon land');
});

test('het bouwbereik is er alleen in het lege begin', () => {
  const maker = { ...T.MAKER_INSTELLINGEN };
  Object.assign(T.MAKER_INSTELLINGEN, { opEiland: false, leeg: false });
  try {
    const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
    const echt = console.warn;
    console.warn = () => {};
    try {
      assert.ok(T.beginOpKaart(S, 'gehucht', 3));
    } finally {
      console.warn = echt;
    }
    assert.equal(T.bouwBereikVan(S.dorp), null);
    assert.ok(T.inBouwBereik(S.dorp, 0, 0));
  } finally {
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
});

test('het huis van de schout: één keer in het bouwmenu, alleen in het lege begin; is het af, dan verhuist hij en wordt de huifkar de ossenkar', () => {
  T.pasOptiesToe({ keuzes: { begin: 'leeg' } });
  try {
    huisVanDeSchout();
  } finally {
    T.pasOptiesToe({});
  }
});
function huisVanDeSchout() {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  assert.ok(T.inBouwmenu(D, 'schout'), 'het staat in het bouwmenu');
  const schoutTent = D.gebouwen.find((g) => g.soort === 'tent' && g.huis === 'schout');
  const gezin = wonenIn(D, schoutTent);
  const kampGezinnen = T.kampTenten(D).length;
  const [huis] = zetHutten(D, 1, 'schout');
  assert.ok(!T.inBouwmenu(D, 'schout'), 'staat het er (ook in aanbouw), dan niet meer');
  assert.equal(T.plaatsGebouw(D, 'schout', huis.x + 20, huis.y).gelukt, false, 'en een tweede kan niet');
  assert.equal(D.gebouwen.find((g) => g.huis === 'schout'), schoutTent, 'tot het af is, woont hij in zijn tent');
  gezegd.length = 0;
  dagen(S, 2, 2 + T.GEBOUWEN.schout.bouwtijd);
  assert.ok(huis.klaar);
  assert.equal(D.gebouwen.find((g) => g.huis === 'schout'), huis, 'nu is het zijn huis');
  assert.deepEqual(wonenIn(D, huis), gezin, 'met zijn hele gezin, en verder niemand');
  assert.ok(!D.gebouwen.includes(schoutTent) && !w.voorwerpen.includes(schoutTent.voorwerp), 'zijn tent is weg');
  assert.equal(T.kampTenten(D).length, kampGezinnen, 'de gezinnen wonen nog in het kamp');
  const deur = T.deurVan(w, huis);
  assert.deepEqual([D.schout.thuis.x, D.schout.thuis.y], [deur.x, deur.y], 'zijn thuis is de deur van zijn huis');
  assert.equal(D.begin.kar.vel, 'ossenkar-leeg', 'de huifkar is de ossenkar');
  assert.ok(gezegd.some((t) => /ossenkar|ox cart/.test(t)), 'en het dorp zegt het');
  // het is de eerste opslag: rond het huis bouw je ook, waar het plein te ver is
  const R = T.BEGIN_INSTELLINGEN.bouwBereik;
  const plein = T.pleinTegels(w);
  const vanPlein = (x, y) => Math.min(...plein.map((p) => Math.hypot(p.x - x, p.y - y)));
  const voet = T.voetVanGebouw(huis);
  const rond = [];
  for (let y = voet.y - R; y < voet.y + voet.h + R; y++) for (let x = voet.x - R; x < voet.x + voet.b + R; x++) {
    if (x >= 0 && y >= 0 && x < w.b && y < w.h && vanPlein(x, y) > R + 0.5 && T.inBouwBereik(D, x, y)) rond.push({ x, y });
  }
  assert.ok(rond.length > 0, 'het huis geeft bereik waar het plein niet komt');
  // bewaren en laden
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.equal(S2.dorp.begin.kar.vel, 'ossenkar-leeg');
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
}

test('het huis van de schout staat niet in het bouwmenu van het gehucht dat er al was', () => {
  const maker = { ...T.MAKER_INSTELLINGEN };
  Object.assign(T.MAKER_INSTELLINGEN, { opEiland: false, leeg: false });
  try {
    const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
    const echt = console.warn;
    console.warn = () => {};
    try {
      assert.ok(T.beginOpKaart(S, 'gehucht', 3));
    } finally {
      console.warn = echt;
    }
    assert.ok(!T.magGebouwd(S.dorp, 'schout') && !T.inBouwmenu(S.dorp, 'schout'));
  } finally {
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
});
