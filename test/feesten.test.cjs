// De feesten (js/feesten.js; werklijst vraag 97, Marcel, 3 okt: het oogstfeest "Ja, een hele dag vrij", en "De
// meiboom"): zeg je ja op een feest, dan viert het hele dorp het op het plein, een hele dag (en niemand werkt) of een
// avond.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
// Deze toetsen gaan over het spel waarin jij bouwt (de spelregel "Wie bouwt" op "Jij bouwt"; werklijst vraag 103):
// een feest zonder bouwverzoeken ertussen. Hoe het gaat als de mensen het vragen, staat in test/verzoeken.test.cjs.
T.zetOptie('wieBouwt', 'jij');

const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (t) => berichten.push(t) : () => {}) });
T.anim = { tekst() {}, wacht: () => new Promise(() => {}), loop: () => new Promise(() => {}), uitval: () => new Promise(() => {}) };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const HERFST = dagVan('herfstmaand', 10);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht, zoals een nieuw spel begint, stil en met een vast zaad (zoals in test/voorvallen.test.cjs).
function gehucht() {
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
  S.dorp.lot = Object.assign(S.dorp.lot || {}, { zaad: 7 });
  S.dorp.voorvallen = T.nieuweVoorvallen();
  return S;
}

// Een voorval dat nu loopt, over mensen die erbij passen.
function metVoorval(S, id, nu) {
  S.kalender.dag = nu;
  const v = T.VOORVALLEN[id];
  const oud = { vervolg: v.vervolg, als: v.als, pauze: v.pauze };
  Object.assign(v, { vervolg: false, als: undefined, pauze: 0 });
  const mensen = T.voorvalKan(S.dorp, id, Math.floor(nu));
  Object.assign(v, oud);
  assert.ok(mensen, `er is iemand voor "${id}"`);
  return T.beginVoorval(S.dorp, id, mensen.wie, mensen.ander, Math.floor(nu));
}
const antwoord = (id, n) => T.GESPREKKEN[id].knopen[T.GESPREKKEN[id].start].keuzes[n];
const r = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

test('het oogstfeest en de meiboom zijn feesten, en hun antwoorden zeggen wat ze kosten', () => {
  for (const id of ['oogstfeest', 'meiboom']) {
    assert.ok(T.FEESTEN[id], `${id} is een feest`);
    assert.equal(T.VOORVALLEN[id].soort, 'feest');
    assert.equal(antwoord(id, 0).doe.feest, 'dag', `${id}: het eerste antwoord is een hele dag`);
    assert.equal(antwoord(id, 1).doe.feest, 'avond', `${id}: het tweede een avond`);
    assert.equal(antwoord(id, 2).doe.feest, undefined, `${id}: het derde is geen feest`);
  }
  const S = gehucht();
  T.zetVoorraad(S.dorp, 'graan', 100);
  T.zetVoorraad(S.dorp, 'bier', 30);
  assert.equal(T.prijsVanKeuze(S.dorp, antwoord('oogstfeest', 0).doe).tekst, '−40 graan, −15 bier, tevredenheid +8%, morgen werkt niemand');
  assert.equal(T.prijsVanKeuze(S.dorp, antwoord('oogstfeest', 1).doe).tekst, "−15 graan, tevredenheid +3%, 's avonds feest op het plein");
});

test('een groot oogstfeest: morgen werkt niemand, iedereen staat op het plein, en de dag erna gaat het werk door', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'graan', 100);
  T.zetVoorraad(D, 'bier', 30);
  metVoorval(S, 'oogstfeest', bijUur(HERFST, 15));
  T.doeGevolg(S, D, antwoord('oogstfeest', 0).doe);
  assert.equal(D.voorraad.graan, 60);
  assert.equal(D.voorraad.bier, 15);
  const f = D.feesten.komt;
  assert.deepEqual({ id: f.id, dag: f.dag, heel: f.heel, begonnen: f.begonnen }, { id: 'oogstfeest', dag: HERFST + 1, heel: true, begonnen: false });
  assert.ok(!T.vrijeDag(D, HERFST), 'vandaag wordt nog gewerkt');

  // De feestdag: het dorp zegt het, en wie handen heeft, maakt niets.
  berichten.length = 0;
  T.tikGebouwenDag(D, HERFST + 1);
  assert.ok(T.vrijeDag(D, HERFST + 1));
  assert.ok(f.begonnen && f.midden, 'het feest begon, met een midden');
  assert.ok(T.opHetPlein(S.wereld, f.midden.x, f.midden.y), 'het midden ligt op het plein');
  assert.ok(berichten.some((b) => /Vandaag viert het dorp het oogstfeest op het plein\. Er wordt niet gewerkt\./.test(b)), berichten.join(' | '));
  const werkplaatsen = D.gebouwen.filter((g) => g.klaar && T.GEBOUWEN[g.soort].maakt && T.GEBOUWEN[g.soort].handen > 0);
  assert.ok(werkplaatsen.length > 0, 'er is een werkplaats om te toetsen');
  for (const g of werkplaatsen) {
    assert.equal(g.werkte, 0, `${g.soort} werkt niet`);
    assert.equal(g.stilWant, 'het dorp viert feest');
    assert.match(T.gebouwToestand(D, g), /staat stil, het dorp viert feest/);
  }

  // Overdag staat iedereen rond het midden: het hele dorp, ook de boeren; de herbergierster aan de tap.
  S.kalender.dag = bijUur(HERFST + 1, 11);
  assert.ok(T.feestOp(D, S.kalender.dag), 'om elf uur is het feest');
  let geteld = 0;
  for (const p of D.bewoners.mensen) {
    if (!p.wezen || p.komt || p.weg || p.schout) continue; // de schout loop jij
    const a = T.dagAnker(D, p.wezen);
    assert.ok(a, `${T.naamVanBewoner(p)} heeft een plek`);
    assert.ok(r(a, f.midden) <= T.FEESTEN_INSTELLINGEN.kring, `${T.naamVanBewoner(p)} staat bij het feest`);
    geteld++;
  }
  assert.ok(geteld >= 20, `het hele dorp (${geteld})`);
  const tapster = D.bewoners.mensen.find((p) => p.huis === T.herbergVan(D));
  assert.equal(r(T.dagAnker(D, tapster.wezen), f.midden), 1, 'de herbergierster tapt naast het midden');
  // 's Nachts slaapt iedereen weer thuis.
  S.kalender.dag = bijUur(HERFST + 1, 23.5);
  assert.ok(!T.feestOp(D, S.kalender.dag));
  assert.ok(T.dagAnker(D, tapster.wezen).binnen, 'na bedtijd naar binnen');

  // De dag erna: het feest is gevierd, en het werk gaat door.
  T.tikGebouwenDag(D, HERFST + 2);
  assert.equal(D.feesten.komt, null);
  assert.deepEqual(D.feesten.gevierd, [{ id: 'oogstfeest', dag: HERFST + 1, heel: true }]);
  for (const g of werkplaatsen) assert.notEqual(g.stilWant, 'het dorp viert feest', `${g.soort} werkt weer`);
});

test('een klein feest is vanavond, of morgenavond als de avond al om is; dan staat het dorp er alleen na het werk', () => {
  const S = gehucht();
  const D = S.dorp;
  const f = T.zetFeest(D, 'oogstfeest', 'avond', bijUur(HERFST, 14));
  assert.equal(f.dag, HERFST, 'vanavond');
  assert.ok(f.begonnen && f.midden, 'het begint meteen');
  assert.ok(!T.vrijeDag(D, HERFST), 'het is geen vrije dag');
  const p = D.bewoners.mensen.find((x) => x.wezen && x.werk && x.werk !== x.huis && !x.komt);
  S.kalender.dag = bijUur(HERFST, 14);
  assert.ok(!T.feestOp(D, S.kalender.dag), 'overdag nog geen feest');
  const overdag = T.dagAnker(D, p.wezen);
  assert.ok(!overdag || r(overdag, f.midden) > 1 || !T.opHetPlein(S.wereld, overdag.x, overdag.y), 'overdag aan het werk');
  S.kalender.dag = bijUur(HERFST, 20);
  assert.ok(T.feestOp(D, S.kalender.dag), 'om acht uur is het feest');
  assert.ok(r(T.dagAnker(D, p.wezen), f.midden) <= T.FEESTEN_INSTELLINGEN.kring, 'en dan staat hij erbij');
  // Niemand gaat naar de herberg, en het plein is verlicht.
  T.zetVoorraad(D, 'bier', 100);
  assert.deepEqual(T.herbergGasten(D, HERFST), [], 'niemand in de herberg');
  assert.ok(T.lichtBronnen(D).some((b) => b.x === f.midden.x && b.y === f.midden.y), 'licht op het plein');
  // Te laat op de avond: dan morgenavond.
  assert.equal(T.zetFeest(D, 'oogstfeest', 'avond', bijUur(HERFST, 23)).dag, HERFST + 1);
});

test('de meiboom komt op 30 grasmaand, niet geloot; zeg je ja, dan staat hij op 1 bloeimaand op het plein, een maand lang', () => {
  const S = gehucht();
  const D = S.dorp;
  const dag = dagVan('grasmaand', 30);
  assert.equal(T.gewichtVanVoorval(D, 'meiboom', dag), 0, 'hij wordt niet geloot');
  D.voorvallen.volgende = dag + 100; // geen geloot voorval in de weg
  T.tikVoorvallenDag(D, dag - 1);
  assert.equal(D.voorvallen.lopend, null, 'op 29 grasmaand nog niet');
  T.tikVoorvallenDag(D, dag);
  assert.equal(D.voorvallen.lopend && D.voorvallen.lopend.id, 'meiboom', 'op 30 grasmaand wel');
  T.zetVoorraad(D, 'hout', 20);
  T.zetVoorraad(D, 'bier', 20);
  S.kalender.dag = bijUur(dag, 11);
  T.doeGevolg(S, D, antwoord('meiboom', 0).doe);
  T.voorvalBeantwoord(D, 'meiboom');
  const f = D.feesten.komt;
  assert.equal(T.datumVanDag(f.dag).tekst.split(' ').slice(0, 2).join(' '), '1 bloeimaand');
  assert.equal(D.voorraad.hout, 18);
  // De dag erna komt hij niet nog eens.
  T.tikVoorvallenDag(D, dag + 1);
  assert.equal(D.voorvallen.lopend, null);

  T.tikFeestenDag(D, f.dag);
  const boom = S.wereld.voorwerpen.find((v) => v.soort === 'meiboom');
  assert.ok(boom, 'de meiboom staat er');
  assert.deepEqual({ x: boom.x, y: boom.y }, f.midden, 'in het midden van het feest');
  assert.ok(T.opHetPlein(S.wereld, boom.x, boom.y), 'op het plein');
  assert.ok(!T.isBegaanbaar(S.wereld, boom.x, boom.y), 'je loopt er niet doorheen');
  T.tikFeestenDag(D, f.dag + T.FEESTEN_INSTELLINGEN.meiboomDagen - 1);
  assert.ok(S.wereld.voorwerpen.includes(boom), 'een maand lang');
  T.tikFeestenDag(D, f.dag + T.FEESTEN_INSTELLINGEN.meiboomDagen);
  assert.ok(!S.wereld.voorwerpen.some((v) => v.soort === 'meiboom'), 'en dan gaat hij weg');
  assert.equal(D.feesten.boom, null);
  assert.ok(T.isBegaanbaar(S.wereld, boom.x, boom.y));
});

// Marcel, 10 okt: "we hebben ook een kerstboom nodig :)", en voor het feest "Feestavond" (werklijst vraag 148).
test('de kerstboom komt op 20 wintermaand; met ja staat hij meteen, tot en met 6 louwmaand, en op kerstavond viert het dorp', () => {
  const S = gehucht();
  const D = S.dorp;
  const dag = dagVan('wintermaand', 20);
  assert.equal(T.gewichtVanVoorval(D, 'kerstboom', dag), 0, 'hij wordt niet geloot');
  D.voorvallen.volgende = dag + 100; // geen geloot voorval in de weg
  T.tikVoorvallenDag(D, dag - 1);
  assert.equal(D.voorvallen.lopend, null, 'op 19 wintermaand nog niet');
  T.tikVoorvallenDag(D, dag);
  assert.equal(D.voorvallen.lopend && D.voorvallen.lopend.id, 'kerstboom', 'op 20 wintermaand wel');
  T.zetVoorraad(D, 'hout', 20);
  assert.equal(T.prijsVanKeuze(D, antwoord('kerstboom', 0).doe).tekst, '−2 hout, tevredenheid +4%, feest op kerstavond');
  S.kalender.dag = bijUur(dag, 11);
  T.doeGevolg(S, D, antwoord('kerstboom', 0).doe);
  T.voorvalBeantwoord(D, 'kerstboom');
  assert.equal(D.voorraad.hout, 18);
  const boom = S.wereld.voorwerpen.find((v) => v.soort === 'kerstboom');
  assert.ok(boom, 'hij staat er meteen');
  assert.ok(T.opHetPlein(S.wereld, boom.x, boom.y), 'op het plein');
  assert.ok(!T.isBegaanbaar(S.wereld, boom.x, boom.y), 'je loopt er niet doorheen');
  const f = D.feesten.komt;
  assert.equal(f.dag, dagVan('wintermaand', 24), 'het feest is op kerstavond');
  assert.equal(f.heel, false, 'een avond: overdag wordt er gewerkt');

  // 's Avonds branden de kaarsjes, al voor kerstavond.
  S.kalender.dag = bijUur(dag, 19);
  const kaarsjes = (l) => l.soort === 'feest' && l.x === boom.x && l.y === boom.y;
  assert.ok(T.lichtBronnen(D).some(kaarsjes), 'de kaarsjes branden');
  S.kalender.dag = bijUur(dag + 1, 11);
  assert.ok(!T.lichtBronnen(D).some(kaarsjes), 'overdag niet');

  // Op kerstavond staat het dorp om de boom, en gaat niemand naar de herberg.
  T.tikFeestenDag(D, f.dag);
  assert.deepEqual(f.midden, { x: boom.x, y: boom.y }, 'de boom is het midden van het feest');
  assert.ok(T.feestAvond(D, f.dag));
  assert.equal(S.wereld.voorwerpen.filter((v) => v.soort === 'kerstboom').length, 1, 'er komt geen tweede boom');

  // Tot en met 6 louwmaand.
  const laatste = dagVan('louwmaand', 6);
  assert.ok(laatste > f.dag);
  T.tikFeestenDag(D, laatste);
  assert.ok(S.wereld.voorwerpen.includes(boom), 'op 6 louwmaand staat hij er nog');
  T.tikFeestenDag(D, laatste + 1);
  assert.ok(!S.wereld.voorwerpen.some((v) => v.soort === 'kerstboom'), 'en dan gaat hij weg');
  assert.equal(D.feesten.boom, null);
  assert.equal(D.feesten.gevierd.at(-1).id, 'kerstboom');
});

test('de kerstboom die laat komt: na kerstavond viert het dorp vanavond, en de boom blijft tot 6 louwmaand', () => {
  const S = gehucht();
  const D = S.dorp;
  const dag = dagVan('wintermaand', 25);
  S.kalender.dag = bijUur(dag, 11);
  const f = T.zetFeest(D, 'kerstboom', 'avond', S.kalender.dag);
  assert.equal(f.dag, dag, 'vanavond, niet volgend jaar');
  assert.equal(D.feesten.boom.tot, dagVan('louwmaand', 6) + 1);
});

test('op een hele feestdag maait niemand', () => {
  const S = gehucht();
  const D = S.dorp;
  let dag = dagVan('oogstmaand', 1);
  while (T.akkerStadium(T.datumVanDag(dag).maand, T.datumVanDag(dag).dagVanMaand) !== 'rijp') dag++;
  const boer = S.wereld.wezens.find((e) => e.werkAkkers && e.werkAkkers.length);
  const akker = boer.werkAkkers[0];
  const slag = () => ({ x: akker.x, y: akker.y, sinds: 0, tot: 1e9, akker, hooi: false });
  S.kalender.dag = bijUur(dag, 10);
  boer.binnen = false;
  boer.maait = slag();
  T.werkOogstBij(S, D, 0.1);
  assert.ok(boer.maait, 'op een gewone dag maait hij door');
  D.feesten = T.nieuweFeesten();
  D.feesten.komt = { id: 'oogstfeest', dag, heel: true, midden: null, begonnen: true };
  T.werkOogstBij(S, D, 0.1);
  assert.equal(boer.maait, null, 'op het feest stopt hij');
});

test('met de spelregel "Alleen de stemming" is een feest wat het was: een prijs en een stemming', () => {
  const S = gehucht();
  const D = S.dorp;
  T.zetVoorraad(D, 'graan', 100);
  T.zetVoorraad(D, 'bier', 30);
  T.FEESTEN_INSTELLINGEN.vieren = false;
  try {
    assert.equal(T.prijsVanKeuze(D, antwoord('oogstfeest', 0).doe).tekst, '−40 graan, −15 bier, tevredenheid +8%');
    metVoorval(S, 'oogstfeest', bijUur(HERFST, 15));
    T.doeGevolg(S, D, antwoord('oogstfeest', 0).doe);
    assert.ok(!D.feesten || !D.feesten.komt, 'geen feest');
    assert.equal(D.voorraad.graan, 60, 'wel de prijs');
  } finally {
    T.FEESTEN_INSTELLINGEN.vieren = true;
  }
});

test('ook op een gehucht van de maker staat het dorp op zijn plein, rond de meiboom', () => {
  for (const zaad of [1, 2, 3]) {
    const echt = console.warn;
    console.warn = () => {};
    const S = { kalender: T.nieuweKalender() };
    try {
      assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
    } finally {
      console.warn = echt;
    }
    Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
    const D = S.dorp;
    const f = T.zetFeest(D, 'meiboom', 'avond', bijUur(HERFST, 14));
    assert.ok(f.midden, `zaad ${zaad}: een midden`);
    assert.ok(T.opHetPlein(S.wereld, f.midden.x, f.midden.y), `zaad ${zaad}: op het plein`);
    assert.ok(S.wereld.voorwerpen.some((v) => v.soort === 'meiboom' && v.x === f.midden.x && v.y === f.midden.y), `zaad ${zaad}: de meiboom staat er`);
    S.kalender.dag = bijUur(HERFST, 20);
    const p = D.bewoners.mensen.find((x) => x.wezen && !x.komt && !x.schout);
    assert.ok(r(T.dagAnker(D, p.wezen), f.midden) <= T.FEESTEN_INSTELLINGEN.kring, `zaad ${zaad}: wie er woont, staat erbij`);
  }
});
