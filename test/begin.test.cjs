// Het lege begin (js/begin.js; werklijst vraag 152, stap 1b; Marcel, 11 okt: "We moeten ook zelf alles vanaf de start gaan
// bouwen"): de maker legt op het eiland geen gehucht, maar alleen het land met een open plek (sinds ronde 2 van het snoeien
// het enige begin, en geen spelregel meer); een kar rijdt het land in, met de aanvoerder, zijn gezin en vier gezinnen, en op het
// plein zetten ze hun kamp op.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil en met een vaste reeks toeval (test/grond.cjs; standaard
// zaad 2: daar is open grond voor vier hutten binnen het bouwbereik).
const grond = require('./grond.cjs');
const leegBegin = (zaad) => grond.leegBegin(T, zaad);

// Wat er tegen het scherm gezegd wordt: een bericht, en welke brieven er kwamen.
const gezegd = [];
const brieven = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : naam === 'toonBrief' ? brieven.push(args[1]) : undefined) });

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
  assert.ok(D.plek.marskramer, 'de marskramer heeft zijn plek');
  assert.ok(T.wegInEnUit(D), 'de weg komt het land in');
  assert.ok(T.pleinTegels(D).length > 100, 'er is een plein');
  assert.ok(D.plek.kamp && D.plek.kamp.plekken.length >= 1 + T.BEGIN_INSTELLINGEN.gezinnen, 'de maker koos een plek voor het kamp');
});

test('het kamp: een tent per gezin, die van de aanvoerder is zijn huis, en er is geen plaats voor een nieuw gezin', () => {
  const { D } = leegBegin();
  const tenten = D.gebouwen.filter((g) => g.soort === 'tent');
  assert.equal(tenten.length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(tenten.filter((g) => g.huis === 'aanvoerder').length, 1);
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

test('de voorraad is wat de kar meebrengt, als hij er is (werklijst C, stap 1)', () => {
  const { D } = leegBegin();
  const K = T.BEGIN_INSTELLINGEN.kar;
  assert.equal(D.voorraad.hout, 0, 'onderweg telt de lading nog niet');
  T.zetKampOp(D);
  assert.equal(D.voorraad.hout, K.hout);
  assert.equal(D.voorraad.graan, K.graan + K.zaaigraan);
  assert.equal(D.voorraad.goud, K.goud);
  assert.equal(D.voorraad.gereedschap, K.gereedschap);
});

test('de aankomst: de kar begint aan de rand op de weg, met de aanvoerder ernaast, en de gezinnen komen erachter', () => {
  const { D, w } = leegBegin();
  const B = D.begin;
  assert.equal(B.kamp, 'onderweg');
  assert.ok(w.wezens.includes(B.kar) && B.kar.kar, 'de kar is een wezen op de kaart');
  assert.deepEqual([B.kar.tx, B.kar.ty], [B.van.x, B.van.y], 'hij begint waar de weg het land in komt');
  assert.ok(B.kar.pad.length > 0, 'en hij heeft een weg naar het plein');
  assert.ok(T.afstand({ x: D.aanvoerder.tx, y: D.aanvoerder.ty }, B.van) <= 2, 'de aanvoerder staat bij de kar');
  assert.ok(D.bewoners.mensen.filter((p) => !p.aanvoerder).every((p) => p.komt && !p.wezen), 'de gezinnen komen nog');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 0, 'de tenten staan nog niet');
});

test('staat het kamp er in de nacht nog niet (geen beelden, of de kar zat vast), dan staat het daarna', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  assert.equal(D.begin.kamp, 'op');
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 1 + T.BEGIN_INSTELLINGEN.gezinnen);
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'kampvuur').length, 1);
  assert.deepEqual([D.begin.kar.tx, D.begin.kar.ty], [D.plek.kamp.kar.x, D.plek.kamp.kar.y], 'de kar staat op zijn plek');
  for (const g of D.gebouwen) assert.ok(g.voorwerp && w.voorwerpen.includes(g.voorwerp), 'elke tent staat op de kaart');
  assert.ok(!T.magOpzij(S, D.begin.kar), 'wie de kar op zijn weg vindt, laat hem niet opzij gaan');
  assert.ok(D.bewoners.komen.length || D.bewoners.mensen.every((p) => p.aanvoerder || p.wezen), 'de gezinnen zijn onderweg');
});

test('een jaar vanaf een lege plek, zonder iets te doen: geen fout, en de heer komt het eerste jaar al innen', () => {
  const { S, D } = leegBegin();
  const begin = D.bevolking;
  gezegd.length = 0;
  brieven.length = 0;
  dagen(S, 1, T.DAGEN_PER_JAAR - 1);
  // Sinds 18 okt (Marcel, D2: de demo eindigt op het eerste Sint-Maarten) spaart hij het eerste jaar niet meer.
  assert.ok(brieven.includes('schatting'), `zijn brief komt in het eerste jaar: ${brieven.join(', ')}`);
  // Zijn lopen naar het plein doet de tik van de beelden (T.werkHeerBij), die hier niet draait: hij is op weg.
  assert.ok(D.heer.bezoek && T.datumVanDag(D.heer.bezoek.komtOp).sintMaarten, 'op Sint-Maarten komt hij');
  // zonder te bouwen haalt het dorp de winter niet
  assert.ok(D.bevolking < begin);
  assert.ok(!gezegd.some((t) => /no room/.test(t)), 'zolang er een gezin in het kamp woont, wil er geen nieuw gezin komen');
});

// Zet `n` hutten neer zo dicht mogelijk bij het kampvuur (niet op het plein), zoals de speler ze met het bouwmenu neerzet,
// op open grond (met `rooien` ook in het bos). Met een vaste reeks toeval, want welke tekening een hut krijgt (en dus hoe
// groot hij is), kiest T.volgendeTekening.
function zetHutten(D, n, soort = 'hut', rooien = false) {
  const v = D.plek.kamp.vuur;
  const hutten = [];
  const toeval = Math.random;
  let z = 7;
  Math.random = () => (z = (z * 16807) % 2147483647) / 2147483647;
  try {
    for (let r = 1; r < 30 && hutten.length < n; r++) {
      for (let dy = -r; dy <= r && hutten.length < n; dy++) {
        for (let dx = -r; dx <= r && hutten.length < n; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          const kavel = T.bouwKavel(D, soort, v.x + dx, v.y + dy);
          if (!rooien && kavel && T.teRooienOp(D, kavel).length) continue;
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
// Dagen vanaf `van` tot deze gebouwen af zijn (de mensen bouwen ze zelf, js/bouwen.js); geeft de dag waarop ze af waren.
function totAf(S, gebouwen, van = 2, hooguit = 60) {
  for (let dag = van; dag < van + hooguit; dag++) {
    dagen(S, dag, dag);
    if (gebouwen.every((g) => g.klaar)) return dag;
  }
  return assert.fail('de gebouwen komen niet af');
}

test('het lege begin: de hut en het huis staan in het bouwmenu', () => {
  const { D } = leegBegin();
  assert.ok(T.inBouwmenu(D, 'hut') && T.inBouwmenu(D, 'huis') && T.inBouwmenu(D, 'houthakker'));
});

test('verhuizen: is een hut af, dan trekt er een gezin uit het kamp in, en gaat zijn tent weg; die van de aanvoerder blijft', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const begin = D.bevolking;
  const tenten = T.kampTenten(D).length;
  const hutten = zetHutten(D, tenten);
  assert.ok(T.waaromGeenGezin(D).includes('kamp'), 'zolang er een gezin in het kamp woont, komt er geen nieuw gezin');
  gezegd.length = 0;
  totAf(S, hutten);
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
  assert.equal(w.voorwerpen.filter((v) => v.soort === 'tent').length, 1, 'alleen die van de aanvoerder staat er nog');
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
    totAf(S, [hut]);
    assert.equal(wonenIn(D, hut).length, 3, 'het hele gezin');
    assert.equal(T.kampTenten(D).length, T.BEGIN_INSTELLINGEN.gezinnen - 1, 'een gezin minder in het kamp');
    assert.ok(gezegd.some((t) => /krap|cramped/.test(t)), 'en het dorp zegt dat het krap is');
  } finally {
    T.GEBOUWEN.hut.woonruimte = ruimte;
  }
});

test('het eerste jaar vraagt hij al; met heerVrij spaart hij je zoveel jaar', () => {
  assert.ok(!T.heerLaatMetRust(leegBegin().D, 0), 'sinds 18 okt (D2) komt hij het eerste jaar');
  const oud = T.BEGIN_INSTELLINGEN.heerVrij;
  T.BEGIN_INSTELLINGEN.heerVrij = 1;
  try {
    const { D } = leegBegin();
    assert.ok(T.heerLaatMetRust(D, 0));
    assert.ok(!T.heerLaatMetRust(D, T.DAGEN_PER_JAAR));
  } finally {
    T.BEGIN_INSTELLINGEN.heerVrij = oud;
  }
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

// ── 1d: jij bouwt alles, binnen bereik (vraag 152; Marcel, 11 okt: "a1, b ja, c ja, d ja, e ja") ──

test('het bouwbereik: je bouwt binnen bouwBereik tegels van het plein, en verder niet; lopen kan overal', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const R = T.BEGIN_INSTELLINGEN.bouwBereik;
  const plein = T.pleinTegels(D);
  const verst = (t) => Math.min(...plein.map((p) => Math.hypot(p.x - t.x, p.y - t.y)));
  for (const p of plein) assert.ok(T.inBouwBereik(D, p.x, p.y), 'het plein ligt erin');
  const B = T.bouwBereikVan(D);
  const K = T.kaartVak(w);
  assert.ok(B.b * B.h < (K.b * K.h) / 2, 'alleen een vak om het plein, niet de hele kaart (de wereld is het hele eiland)');
  // een tegel op de rand, en een net erbuiten, recht naar rechts van de rechterrand van het plein
  const rechts = plein.reduce((a, p) => (p.x > a.x ? p : a));
  assert.ok(T.inBouwBereik(D, rechts.x + R, rechts.y));
  assert.ok(!T.inBouwBereik(D, rechts.x + R + 1, rechts.y) || verst({ x: rechts.x + R + 1, y: rechts.y }) <= R);
  // ver weg zegt de regel waarom, ook als het daar verder zou passen
  const ver = { x: rechts.x + R + 5, y: rechts.y };
  const reden = T.waaromPastHetNiet(D, 'hut', ver.x, ver.y);
  assert.match(reden, /Too far away/);
  assert.equal(T.plaatsGebouw(D, 'hut', ver.x, ver.y).gelukt, false);
  // dichtbij lukt het wel (zaad 2 heeft open grond bij het plein)
  const [hut] = zetHutten(D, 1);
  const voet = T.voetVanGebouw(hut);
  for (let y = voet.y; y < voet.y + voet.h; y++) for (let x = voet.x; x < voet.x + voet.b; x++) assert.ok(T.inBouwBereik(D, x, y));
  assert.ok(T.isBegaanbaar(w, ver.x, ver.y) || T.isVast(w, ver.x, ver.y), 'buiten het bereik is gewoon land');
});

test('het raadhuis: één keer in het bouwmenu; is het af, dan verhuist hij, is het de opslag, en gaat de huifkar erin op', () => {
  huisVanDeAanvoerder();
});
function huisVanDeAanvoerder() {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  assert.ok(T.inBouwmenu(D, 'raadhuis'), 'het staat in het bouwmenu');
  const aanvoerderTent = D.gebouwen.find((g) => g.soort === 'tent' && g.huis === 'aanvoerder');
  const gezin = wonenIn(D, aanvoerderTent);
  const kampGezinnen = T.kampTenten(D).length;
  const kar = D.begin.kar;
  const karPlek = { ...D.plek.kamp.kar };
  const [huis] = zetHutten(D, 1, 'raadhuis');
  assert.ok(!T.inBouwmenu(D, 'raadhuis'), 'staat het er (ook in aanbouw), dan niet meer');
  assert.equal(T.plaatsGebouw(D, 'raadhuis', huis.x + 20, huis.y).gelukt, false, 'en een tweede kan niet');
  assert.equal(D.gebouwen.find((g) => g.huis === 'aanvoerder'), aanvoerderTent, 'tot het af is, woont hij in zijn tent');
  gezegd.length = 0;
  let inDeKar = null;
  for (let dag = 2; dag < 62 && !huis.klaar; dag++) {
    inDeKar = { ...D.voorraad }; // wat er de avond ervoor in de huifkar lag
    dagen(S, dag, dag);
  }
  assert.ok(huis.klaar);
  assert.equal(D.gebouwen.find((g) => g.huis === 'aanvoerder'), huis, 'nu is het zijn huis');
  assert.deepEqual(wonenIn(D, huis), gezin, 'met zijn hele gezin, en verder niemand');
  assert.ok(!D.gebouwen.includes(aanvoerderTent) && !w.voorwerpen.includes(aanvoerderTent.voorwerp), 'zijn tent is weg');
  assert.equal(T.kampTenten(D).length, kampGezinnen, 'de gezinnen wonen nog in het kamp');
  const deur = T.deurVan(w, huis);
  assert.deepEqual([D.aanvoerder.thuis.x, D.aanvoerder.thuis.y], [deur.x, deur.y], 'zijn thuis is de deur van zijn huis');
  // de huifkar gaat op in het raadhuis (Marcel, 23 okt), en wat erin zat, ligt waar hij stond, tot de dragers het halen
  assert.equal(D.begin.kar, null, 'de huifkar is weg');
  assert.ok(!w.wezens.includes(kar));
  assert.deepEqual(T.deVoorraad(D), { ...deur, naast: true }, 'de voorraad ligt voortaan bij het raadhuis');
  assert.ok(gezegd.some((t) => /covered wagon goes into it/.test(t)), 'en het dorp zegt het');
  const stapel = D.gebouwen.find((g) => g.soort === 'stapel' && g.x === karPlek.x && g.y === karPlek.y);
  assert.ok(stapel, 'een losse stapel waar de kar stond');
  assert.ok(stapel.stapel.graan > 0 && stapel.stapel.hout > 0, `met wat erin zat: ${JSON.stringify(stapel.stapel)}`);
  assert.ok(!(D.voorraad.graan > 0), 'het graan telt pas als het binnen is');
  assert.ok(D.voorraad.goud >= inDeKar.goud - 1e-9 - T.GEBOUWEN.raadhuis.kosten.goud, 'het goud draagt de aanvoerder zelf: dat blijft');
  // het is de eerste opslag: rond het huis bouw je ook, waar het plein te ver is
  const R = T.BEGIN_INSTELLINGEN.bouwBereik;
  const plein = T.pleinTegels(D);
  const vanPlein = (x, y) => Math.min(...plein.map((p) => Math.hypot(p.x - x, p.y - y)));
  const voet = T.voetVanGebouw(huis);
  const rond = [];
  for (let y = voet.y - R; y < voet.y + voet.h + R; y++) for (let x = voet.x - R; x < voet.x + voet.b + R; x++) {
    if (T.inVak(T.kaartVak(w), x, y) && vanPlein(x, y) > R + 0.5 && T.inBouwBereik(D, x, y)) rond.push({ x, y });
  }
  assert.ok(rond.length > 0, 'het huis geeft bereik waar het plein niet komt');
  // bewaren en laden
  Object.assign(S, { vlaggen: new Set() }, T.schermVelden());
  const tekst = T.bewaarSpel(S, { nu: 0 });
  const S2 = { kalender: T.nieuweKalender() };
  T.zetSpel(S2, T.leesSpel(tekst));
  assert.equal(S2.dorp.begin.kar, null);
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), tekst);
  // de dragers halen de stapel binnen
  const nu = Math.floor(S.kalender.dag);
  for (let dag = nu + 1; dag <= nu + 10 && D.gebouwen.includes(stapel); dag++) dagen(S, dag, dag);
  assert.ok(!D.gebouwen.includes(stapel), 'de stapel is binnen');
  assert.ok(D.voorraad.graan > 0, 'en het graan telt weer');
}

test('meebouwen en dragen: wie geen werk heeft, bouwt of draagt, en een bouwplaats krijgt zoveel bouwers als er werk is (vraag 184)', () => {
  const { S, D } = leegBegin();
  // Met vijf soorten eten werkt een bouwer een hele dag (de afwisseling, vraag 154; de toets hieronder).
  T.zetVoorraad(D, 'groente', 50);
  T.zetVoorraad(D, 'eieren', 50);
  dagen(S, 1, 1);
  const I = T.BOUWEN_INSTELLINGEN;
  const [a, b, c] = zetHutten(D, 3);
  for (const g of [a, b, c]) {
    assert.ok(!g.klaar && g.klaarOp == null, 'een bouwplaats wacht op werk, niet op een dag');
    assert.equal(g.bouw.werk, T.GEBOUWEN.hut.bouwtijd * I.werkPerBouwdag);
  }
  const bouwers = (g) => D.bewoners.mensen.filter((p) => p.bouwt === g);
  const vrij = D.bewoners.mensen.filter((p) => T.kanWerken(p) && !p.werk && (p.leeftijd === 'volwassen' || p.leeftijd === 'jong'));
  // Op de plaatsen ligt nog geen hout: er is niets te bouwen, en wie vrij is, draagt.
  for (const g of [a, b, c]) assert.equal(bouwers(g).length, 0, 'zonder hout op de plaats bouwt er niemand');
  assert.deepEqual(T.dragersVan(D), vrij, 'wie vrij is, draagt');
  assert.ok(!T.dragersVan(D).some((p) => p.aanvoerder || p.werk || p.leeftijd === 'kind'), 'de aanvoerder, wie werk heeft en een kind dragen niet');
  // Ligt het hout er, dan krijgt een plaats 's ochtends zoveel bouwers als het werk geeft: een hut van vier werkdagen vier,
  // met de helft van het hout de helft.
  T.brengMeteen(D, a);
  b.bouw.er = { hout: b.bouw.nodig.hout / 2 };
  T.wijzigVoorraad(D, 'hout', -b.bouw.nodig.hout / 2);
  T.kiesBouwers(D);
  assert.equal(bouwers(a).length, I.perPlaats);
  assert.equal(bouwers(b).length, Math.ceil(b.bouw.werk / 2 / T.werkVanAfwisseling(D) - 1e-9));
  assert.equal(bouwers(c).length, 0);
  assert.equal(T.dragersVan(D).length, vrij.length - bouwers(a).length - bouwers(b).length, 'de rest draagt');
  assert.ok(D.bewoners.mensen.every((p) => !p.bouwt || p.leeftijd === 'volwassen' || p.leeftijd === 'jong'), 'een kind bouwt niet');
  assert.ok(!D.bewoners.mensen.some((p) => p.aanvoerder && p.bouwt), 'de aanvoerder bouwt niet mee');
  assert.ok(!D.bewoners.mensen.some((p) => p.werk && p.bouwt), 'wie werk heeft, bouwt niet');
  dagen(S, 2, 2);
  assert.ok(a.klaar, 'vier bouwers zetten een hut in één dag');
  assert.ok(b.bouw.gedaan >= b.bouw.werk / 2 - 1e-9, 'het hout dat er lag, is verbouwd');
  assert.ok(c.bouw.er.hout > 0, 'de dragers brachten de derde hout');
  assert.ok(c.bouw.gedaan > 0, 'en wie het bracht, bleef er bouwen (T.blijftBouwen)');
});

test('meebouwen: wie hout brengt waar niemand bouwt, blijft er bouwen, zonder het werk van de ochtend in één klap', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const [a] = zetHutten(D, 1);
  const d = T.dagindeling(S.kalender.dag);
  const t = 1 + (d.werkBegin + d.werkEind) / 2 / 24;
  const p = T.dragersVan(D)[0];
  a.bouw.er = { hout: a.bouw.nodig.hout };
  T.wijzigVoorraad(D, 'hout', -a.bouw.nodig.hout);
  T.blijftBouwen(D, p, a, t);
  assert.equal(p.bouwt, a, 'er is werk en niemand bouwt: hij blijft');
  assert.ok(!T.dragersVan(D).includes(p), 'en draagt niet meer');
  assert.equal(a.bouw.gedaan, 0, 'hij begint nu');
  dagen(S, 2, 2);
  const w = T.werkVanAfwisseling(D);
  assert.ok(Math.abs(a.bouw.gedaan - w / 2) < 0.15 * w, `${a.bouw.gedaan} werkdagen, verwacht de helft van ${w}`);
});

test('meebouwen: wie eentonig eet, bouwt trager (vraag 154, B1)', () => {
  const { S, D } = leegBegin();
  const I = T.BOUWEN_INSTELLINGEN;
  // Alleen het graan uit de kar: één soort.
  dagen(S, 1, 1);
  T.zetVoorraad(D, 'kaas', 0);
  T.zetVoorraad(D, 'vlees', 0);
  dagen(S, 2, 2);
  assert.deepEqual(D.behoeften.afwisseling, ['graan']);
  const [a] = zetHutten(D, 1);
  T.brengMeteen(D, a); // het hout ligt er: dan bouwen er vier
  T.kiesBouwers(D);
  const bouwers = D.bewoners.mensen.filter((p) => p.bouwt === a).length;
  assert.equal(bouwers, I.perPlaats);
  dagen(S, 3, 3);
  assert.ok(!a.klaar, 'vier bouwers zetten een hut niet meer in één dag');
  assert.ok(Math.abs(a.bouw.gedaan - bouwers * T.BEHOEFTEN_INSTELLINGEN.werkBijEenSoort) < 1e-9, `${a.bouw.gedaan}`);
});

test('meebouwen: zonder bouwers staat de bouwplaats stil, en het briefje zegt het', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const perPlaats = T.BOUWEN_INSTELLINGEN.perPlaats;
  let hut;
  try {
    T.BOUWEN_INSTELLINGEN.perPlaats = 0;
    [hut] = zetHutten(D, 1);
    dagen(S, 2, 4);
    assert.equal(hut.bouw.gedaan, 0);
    assert.ok(!hut.klaar);
    assert.match(T.gebouwToestand(D, hut), /nobody is building/);
  } finally {
    T.BOUWEN_INSTELLINGEN.perPlaats = perPlaats;
  }
  dagen(S, 5, 5);
  assert.match(T.gebouwToestand(D, hut), /4 builders/);
});

// Een hut op de eerste plek in het bos binnen het bereik (minstens vijf bomen op de kavel): zijn bouwplaats.
function hutInHetBos(D) {
  const K = T.kaartVak(D.wereld);
  for (let y = K.y; y < K.y + K.h; y++) {
    for (let x = K.x; x < K.x + K.b; x++) {
      const kavel = T.bouwKavel(D, 'hut', x, y);
      if (!kavel || T.watTeRooien(D, kavel).bomen < 5 || T.waaromPastHetNiet(D, 'hut', x, y, null, kavel)) continue;
      const uit = T.plaatsGebouw(D, 'hut', x, y);
      assert.ok(uit.gelukt, uit.reden);
      assert.match(uit.bericht, /first clear/);
      return uit.instantie;
    }
  }
  return assert.fail('er is bos binnen het bereik');
}

// Wat de bouwers aan de kavel van g rooiden, in werkdagen: de tegels die weg zijn, en wat er al aan de volgende gedaan is.
function gerooid(D, g, voor) {
  const I = T.BOUWEN_INSTELLINGEN;
  const nog = new Set(T.teRooienOp(D, g.kavel).map((t) => t.x + ',' + t.y));
  return voor.filter((t) => !nog.has(t.x + ',' + t.y)).reduce((som, t) => som + (t.boom ? I.rooiBoom : I.rooiStruik), 0) + g.bouw.tegoed;
}
const teRooien = (D, g) => T.teRooienOp(D, g.kavel).map((t) => ({ ...t, boom: T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken' }));

test('rooien: in het bos rooien de bouwers eerst de plek, een boom geeft zijn hout, en dan rijst het op', () => {
  const { S, D, w } = leegBegin();
  dagen(S, 1, 1);
  const I = T.BOUWEN_INSTELLINGEN;
  const hut = hutInHetBos(D);
  assert.ok(hut.wachtOpRooien && !hut.voorwerp, 'tot de plek vrij is, staat de hut nog niet op de kaart');
  assert.match(T.plaatsGebouw(D, 'hut', hut.x, hut.y).reden || '', /A hut is already coming here/, 'maar er komt niets anders op zijn plek');
  const tegels = T.teRooienOp(D, hut.kavel);
  const bomen = tegels.filter((t) => T.ontginWerkOp(w, t.x, t.y) === 'hakken').length;
  const rooiWerk = bomen * I.rooiBoom + (tegels.length - bomen) * I.rooiStruik;
  const hout = D.voorraad.hout;
  const af = totAf(S, [hut]);
  assert.equal(hut.bouw.hout, bomen * T.BOS_INSTELLINGEN.rooiHout, 'een gerooide boom geeft rooiHout (Marcel, 12 okt: "c ja")');
  assert.ok(T.BOS_INSTELLINGEN.rooiHout < T.BOS_INSTELLINGEN.houtPerBoom, 'minder dan een boom van de houthakker');
  assert.ok(D.voorraad.hout > hout + hut.bouw.hout - 10, 'en dat ligt in de voorraad (min wat ze stookten)');
  assert.equal(T.teRooienOp(D, hut.kavel).length, 0, 'de kavel is vrij');
  assert.ok(hut.voorwerp && w.voorwerpen.includes(hut.voorwerp), 'en de hut staat op de kaart');
  // vier bouwers per dag: rooien en bouwen samen, vanaf de dag dat de hut er staat (dag 1; de nacht van dag 2 rekent hem)
  const dagenNodig = Math.ceil((rooiWerk + hut.bouw.werk) / I.perPlaats - 1e-9);
  assert.ok(af - 1 >= dagenNodig - 1 && af - 1 <= dagenNodig + 1, `${af - 1} dagen, verwacht zo'n ${dagenNodig}`);
  assert.ok(gezegd.some((t) => /gerooid|cleared/.test(t)), 'het dorp zegt dat de plek vrij is');
});

test('meebouwen: een nieuwe bouwplaats krijgt meteen bouwers, ook op de dag van aankomst (Marcel, 17 okt: "ze beginnen nu op dag 2")', () => {
  const { S, D } = leegBegin();
  const dag = Math.floor(S.kalender.dag); // de dag van aankomst, 's ochtends
  T.zetKampOp(D); // de kar is er (zonder beelden rijdt hij niet)
  const hut = hutInHetBos(D);
  assert.equal(D.bewoners.mensen.filter((p) => p.bouwt === hut).length, T.BOUWEN_INSTELLINGEN.perPlaats, 'wie vrij is, begint er meteen aan');
  const voor = teRooien(D, hut);
  for (let u = 7; u < 24; u += 0.5) {
    S.kalender.dag = dag + u / 24;
    T.werkBouwenBij(S, D);
  }
  assert.ok(T.teRooienOp(D, hut.kavel).length < voor.length, 'op de dag van aankomst vallen er al bomen');
});

test('meebouwen: wie midden op de dag een bouwplaats neerzet, krijgt niet in één klap het werk van de ochtend', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  const d = T.dagindeling(S.kalender.dag);
  const middag = (d.werkBegin + d.werkEind) / 2;
  S.kalender.dag = 1 + middag / 24;
  const hut = hutInHetBos(D);
  const voor = teRooien(D, hut);
  T.werkBouwenBij(S, D);
  assert.equal(gerooid(D, hut, voor), 0, 'het werk begint als hij er staat');
  const bouwers = D.bewoners.mensen.filter((p) => p.bouwt === hut).length;
  assert.equal(bouwers, T.BOUWEN_INSTELLINGEN.perPlaats);
  const perDag = bouwers * T.werkVanAfwisseling(D);
  dagen(S, 2, 2);
  assert.ok(Math.abs(gerooid(D, hut, voor) - perDag / 2) < 0.15, `${gerooid(D, hut, voor)} werkdagen gerooid, verwacht de helft van ${perDag}`);
});

test('meebouwen: met of zonder beelden komt er hetzelfde uit', (t) => {
  // Allebei met dezelfde reeks toeval (welke tekening de hut krijgt, wie er bouwt): sinds het bouwbereik 16 tegels is (12
  // okt), valt de eerste plek in het bos waar dat verschil maakt, en was deze toets zonder zaad de helft van de keren rood.
  const toeval = Math.random;
  t.after(() => {
    Math.random = toeval;
  });
  const spel = (beelden) => {
    let z = 5;
    Math.random = () => (z = (z * 16807) % 2147483647) / 2147483647;
    const { S, D } = leegBegin();
    dagen(S, 1, 1);
    const hut = hutInHetBos(D);
    for (let dag = 2; dag <= 4; dag++) {
      dagen(S, dag, dag);
      if (beelden) {
        for (let u = 0; u < 24; u += 0.5) {
          S.kalender.dag = dag + u / 24;
          T.werkKarBij(S, D);
          T.werkBouwenBij(S, D);
        }
      }
    }
    dagen(S, 5, 5);
    // Op een miljardste: met de afwisseling (vraag 154) is een dag werk geen heel getal meer, en de beelden tellen het in
    // stukjes op. Het hout telt met wat er op de stapels ligt en wat de dragers dragen (js/kar.js): met beelden valt een
    // boom overdag, en halen ze hem eerder.
    const afgerond = (k, v) => (typeof v === 'number' ? Math.round(v * 1e9) / 1e9 : v);
    const gedragen = D.bewoners.mensen.reduce((n, p) => n + ((p.vervoer && p.vervoer.lading.hout) || 0), 0);
    const hout = D.voorraad.hout + T.opDeStapels(D, 'hout') + gedragen;
    return JSON.stringify({ bouw: hut.bouw && { ...hut.bouw, vandaag: 0 }, klaar: hut.klaar, hout, over: T.teRooienOp(D, hut.kavel || hut).length }, afgerond);
  };
  assert.equal(spel(true), spel(false));
});

// Het egaliseren (vraag 182; Marcel, 20 okt: "1a3", "1b1"; 23 okt: "In een paar stappen"): op een land met heuvels maken
// de bouwers de grond vlak voor ze bouwen.
test('egaliseren: op een land met heuvels maken de bouwers eerst de grond vlak, in stappen, en dan komt het gebouw op de kaart', (t) => {
  T.zetOptie('hoogte', 'heuvels');
  t.after(() => T.optiesTerug());
  const { S, D, w } = leegBegin();
  assert.ok(w.hoogte, 'het land heeft heuvels');
  dagen(S, 1, 1);
  const I = T.BOUWEN_INSTELLINGEN;
  const [hut] = zetHutten(D, 1);
  assert.ok(hut.wachtOpRooien && !hut.voorwerp, 'tot de grond vlak is, staat de hut nog niet op de kaart');
  assert.match(T.gebouwToestand(D, hut), /level/);
  assert.equal(D.bewoners.mensen.filter((p) => p.bouwt === hut).length, I.perPlaats, 'en er beginnen meteen vier bouwers aan');
  // Overdag, elk beeld het werk tot nu: de grond zakt of rijst in stappen naar het vlak.
  const d = T.dagindeling(S.kalender.dag);
  const delen = [];
  for (let u = d.werkBegin; u < d.werkEind && !hut.voorwerp; u += 0.05) {
    S.kalender.dag = 1 + u / 24;
    T.werkKarBij(S, D);
    T.werkBouwenBij(S, D);
    const deel = hut.vlak ? (hut.vlak.deel == null ? 1 : hut.vlak.deel) : null;
    if (deel != null && deel !== delen[delen.length - 1]) delen.push(deel);
  }
  assert.ok(hut.voorwerp, 'nu staat hij op de kaart');
  assert.ok(!hut.wachtOpRooien && !hut.egaliseert);
  assert.equal(delen[delen.length - 1], 1, 'helemaal vlak');
  assert.ok(delen.length >= 3, `in stappen: ${delen.join(', ')}`);
  assert.ok(delen.every((x, i) => (i === 0 || x > delen[i - 1]) && Math.abs(x * I.egaliseerStappen - Math.round(x * I.egaliseerStappen)) < 1e-9), `steeds een stap verder: ${delen.join(', ')}`);
  assert.ok(hut.bouw.egaliseerWerk >= I.egaliseerVast, 'een klein vast deel, plus wat de helling vraagt');
  const r = T.voetVanGebouw(hut);
  const hoeken = new Set();
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.b; x++) for (const h of T.hoekHoogten(w, x, y)) hoeken.add(Math.round(h * 1e6));
  assert.equal(hoeken.size, 1, 'de voet ligt vlak');
  // en het bouwen gaat erna door, met wat de dragers brengen
  for (let dag = 2; dag < 12 && !hut.klaar; dag++) dagen(S, dag, dag);
  assert.ok(hut.klaar, 'de hut is af');
});

// De kolonist (werklijst B, 1f; Marcel, 12 okt: "a1, b1"): dezelfde speler in code als in de speeltest
// (gereedschap/speeltest/kolonist.js), hier per dag. Zonder beelden lopen de mensen niet: wie nog naar zijn huis onderweg
// is (p.komt), staat 's nachts thuis, zoals het kamp 's nachts staat als de kar vastzat; anders werkt hij nooit. Of iemand
// in het echte spel onderweg blijft hangen, meet de speeltest. "Zonder fouten" is dat niets vastloopt (b1): het eten en
// het hout meet de speeltest, deze toets niet.
require('../gereedschap/speeltest/kolonist.js');
function komAan(D) {
  T.werkBewonersBij(D);
  for (const p of D.bewoners.mensen) {
    if (p.komt && p.wezen && p.wezen.thuis) Object.assign(p.wezen, { tx: p.wezen.thuis.x, ty: p.wezen.thuis.y });
  }
  T.werkBewonersBij(D);
}

test('een jaar met de kolonist: alles wat hij neerzet, komt af, het kamp is leeg vóór de winter, en de akkers zijn geoogst', () => {
  const { S, D, w } = leegBegin();
  const gedaan = [];
  const graan = {};
  let gehakt = 0;
  dagen(S, 1, T.DAGEN_PER_JAAR - 1, (dag) => {
    komAan(D);
    gedaan.push(...T.kolonistDag(D, dag));
    graan[dag] = D.voorraad.graan;
    gehakt += D.gebouwen.filter((g) => g.soort === 'houthakker').reduce((n, g) => n + (g.werkte || 0), 0);
    if (dag !== 9 * T.DAGEN_PER_MAAND) return; // 1 wintermaand
    assert.deepEqual(D.gebouwen.filter((g) => g.bouw && !g.klaar).map((g) => g.soort), [], 'geen bouwplaats over');
    assert.equal(D.begin.kamp, 'weg', 'het kamp is leeg');
    assert.ok(D.bewoners.mensen.every((p) => p.huis && p.huis.soort !== 'tent'), 'iedereen woont in een huis');
    assert.ok(D.bewoners.mensen.find((p) => p.aanvoerder).huis.soort === 'raadhuis', 'de aanvoerder woont in zijn huis');
  });
  const mislukt = gedaan.filter((d) => !d.gelukt && !d.wacht);
  assert.deepEqual(mislukt.map((d) => d.tekst), [], 'wat hij kan betalen, lukt');
  for (const soort of ['raadhuis', 'boerderij', 'akker', 'houthakker', 'hut']) {
    assert.ok(gedaan.some((d) => d.soort === soort), `hij bouwt een ${soort}`);
  }
  // (werklijst C, stap 5, f: als er niets anders gebouwd wordt, een weg voor de ossenkar)
  assert.ok(gedaan.some((d) => d.soort === 'weg' && d.gelukt), 'hij legt een weg voor de ossenkar');
  assert.ok(w.wegen && w.wegen.size > 0, 'en de bouwers leggen hem');
  const akkers = w.akkers.filter((a) => a.boerderij);
  assert.equal(akkers.reduce((n, a) => n + a.b * a.h, 0), T.BEGIN_INSTELLINGEN.kar.zaaigraan, 'akkers voor al het zaaigraan uit de kar');
  // (de oogst ligt eerst bij de boerderij, en de ossenkar haalt hem in een week binnen: js/kar.js, werklijst C, stap 3)
  assert.ok(graan[6 * T.DAGEN_PER_MAAND + 10] > graan[5 * T.DAGEN_PER_MAAND] + 100, 'de oogst is binnen');
  assert.ok(gehakt > 0, 'de houthakker hakt');
});

// Haalt het eten de winter niet, dan zet de kolonist na de oogst een wijnboerderij neer, en legt hij er een wijngaard bij
// (vraag 155; Marcel, 12 okt: "ik wil tóch een apart wijnboerderij gebouw"): de wijngaard hoort bij een wijnboerderij, niet
// meer bij een boerderij zonder veld.
test('de kolonist: haalt het eten de winter niet, dan een wijnboerderij, en daarna een wijngaard erbij', () => {
  const { S, D } = leegBegin();
  dagen(S, 1, 1);
  T.zetVoorraad(D, 'hout', 500);
  T.zetVoorraad(D, 'goud', 100);
  T.zetVoorraad(D, 'graan', 0);
  const dag = 200; // na de oogst, vóór de pluk
  S.kalender.dag = dag + 0.3;
  const eerste = T.kolonistDag(D, dag);
  assert.ok(eerste.some((d) => d.soort === 'wijnboerderij' && d.gelukt), eerste.map((d) => d.tekst).join('; '));
  const wijn = D.gebouwen.find((g) => g.soort === 'wijnboerderij');
  assert.ok(wijn, 'de wijnboerderij staat (in aanbouw)');
  const tweede = T.kolonistDag(D, dag + 1);
  assert.ok(tweede.some((d) => d.soort === 'wijngaard' && d.gelukt), tweede.map((d) => d.tekst).join('; '));
  assert.equal(D.gebouwen.find((g) => g.soort === 'wijngaard').boerderij, wijn, 'de wijngaard hoort bij de wijnboerderij');
  const derde = T.kolonistDag(D, dag + 2);
  assert.ok(!derde.some((d) => d.soort === 'wijnboerderij' || d.soort === 'wijngaard'), 'en niet nog een');
});
