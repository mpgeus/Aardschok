// De herberg (js/herberg.js, sinds 27 sep): wie er 's avonds heen gaat, het bier, en wat het doet. Zie
// ontwerp/spel.md, "Zaken waar de mensen zelf heen gaan", en de werklijst, punt 2 (vraag 35 tot en met 37).
const test = require('node:test');
const assert = require('node:assert/strict');

for (const f of [
  'js/tijd.js', 'js/dag.js', 'js/voorraad.js', 'js/wereld.js', 'beelden/beschrijving.js', 'tegels/tegels.js',
  'kaarten/kaarten.js', 'js/mensen.js', 'js/vee.js', 'js/gebouwen.js', 'js/behoeften.js', 'js/handel.js',
  'js/heer.js', 'js/inner.js', 'js/verstoppen.js', 'js/kaart.js', 'js/gebied.js', 'js/pad.js', 'js/akkers.js',
  'js/boeren.js', 'js/bewoners.js', 'js/herberg.js', 'js/anim.js', 'js/verkennen.js', 'js/gesprekken.js', 'js/gesprek.js',
]) require('../' + f);
const T = globalThis.Spel;
const IN = T.HERBERG_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
// Buiten de oogst en buiten de winter, en midden in de winter.
const HERFST = dagVan('wijnmaand', 10);
const WINTER = dagVan('louwmaand', 5);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht. Er wordt niet geloot: elke boer heeft het karakter zoals het in T.MENSEN staat, of
// zoals het hier gezet wordt (`karakters`: { boer4: 'drinker' }). Het zaad van het spel ligt vast
// (`zaad`), want daaruit komen de gezinnen, en dus wie er 's avonds gaat. Er ligt bier genoeg.
function gehucht(opties = {}) {
  const echt = console.warn;
  const loten = T.BOEREN_INSTELLINGEN.loten;
  const echtLot = T.lootBoeren;
  const was = {};
  console.warn = () => {};
  T.BOEREN_INSTELLINGEN.loten = false;
  T.lootBoeren = (S2) => echtLot(S2, opties.zaad != null ? opties.zaad : 1234);
  for (const id in opties.karakters || {}) {
    was[id] = T.MENSEN[id].karakter;
    T.MENSEN[id].karakter = opties.karakters[id];
  }
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    T.BOEREN_INSTELLINGEN.loten = loten;
    T.lootBoeren = echtLot;
    for (const id in was) T.MENSEN[id].karakter = was[id];
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  S.kalender = { dag: opties.dag != null ? opties.dag : bijUur(HERFST, 7), snelheid: opties.snelheid || 1 };
  T.zetVoorraad(S, 'bier', opties.bier != null ? opties.bier : 100);
  return S;
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  T.werkBewonersBij(S);
  T.werkAnimatiesBij(S, dt, dtW);
  T.werkOogstBij(S, dtW);
  T.laatDwalen(S, dtW);
}
function loopTot(S, dag) {
  for (let i = 0; S.kalender.dag < dag && i < 200000; i++) stap(S, 0.05);
}
const mensen = (S) => S.bewoners.mensen;
const bewoner = (S, wie) => mensen(S).find((p) => p.wie === wie);
const deurVan = (S, g) => T.deurVan(S.wereld, g);
const zelfde = (a, b) => a.x === b.x && a.y === b.y;
// Hoe lang iemand onderweg is naar de herberg, in uren.
const heenVan = (S, p) => {
  const d = deurVan(S, T.herbergVan(S));
  return T.looptijdVan(S.wereld, p, deurVan(S, p.huis), { x: d.x, y: d.y, straal: 0 }, 'herberg');
};

// ---------------------------------------------------------------------------------------------
// De herberg en de herbergierster
// ---------------------------------------------------------------------------------------------

test('in het gehucht staat een herberg aan het plein, groter dan een boerderij, en de herbergierster woont er alleen en tapt er', () => {
  const S = gehucht();
  const g = T.herbergVan(S);
  assert.ok(g, 'er is een herberg');
  assert.equal(g.tekening, 'huizen/herberg1', 'vakwerk onder riet, van de huizenbouwer');
  for (let y = g.y; y < g.y + g.voet.h; y++) for (let x = g.x; x < g.x + g.voet.b; x++) assert.ok(!T.opHetPlein(S.wereld, x, y), 'niet op het plein');
  const deur = deurVan(S, g);
  assert.ok(T.isBegaanbaar(S.wereld, deur.x, deur.y), 'voor de deur kun je staan');
  // Aan het plein: binnen een paar tegels van de deur begint het plein (vraag 39: de westkant).
  let bijPlein = false;
  for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (T.opHetPlein(S.wereld, deur.x + dx, deur.y + dy)) bijPlein = true;
  assert.ok(bijPlein, 'zijn deur ligt aan het plein');
  const oppervlak = (x) => x.voet.b * x.voet.h;
  for (const b of S.gebouwen.filter((x) => x.soort === 'boerderij')) assert.ok(oppervlak(g) > oppervlak(b), `groter dan de boerderij ${b.huis}`);
  const zij = bewoner(S, 'herbergierster');
  assert.ok(zij, 'de herbergierster is een bewoner');
  assert.equal(zij.huis, g);
  assert.equal(zij.werk, g, 'zij tapt en brouwt');
  assert.equal(zij.geslacht, 'vrouw');
  assert.deepEqual(mensen(S).filter((p) => p.huis === g), [zij], 'ze woont alleen');
  assert.ok(zelfde(zij.wezen.thuis, deurVan(S, g)), 'haar thuis is de deur van de herberg');
});

// ---------------------------------------------------------------------------------------------
// Wie er 's avonds gaat
// ---------------------------------------------------------------------------------------------

test('wie er vanavond gaat: de drinker elke avond, de vrome nooit, en niet meer dan er bier is', () => {
  // Trijn (boer4) woont vlak bij de herberg, Gerrit (boer3) wat verder.
  const S = gehucht({ karakters: { boer4: 'drinker', boer3: 'vrome' } });
  const trijn = bewoner(S, 'boer4');
  const gerrit = bewoner(S, 'boer3');
  for (let d = HERFST; d < HERFST + 20; d++) {
    const gasten = T.herbergGasten(S, d);
    assert.ok(gasten.includes(trijn), `de drinker gaat elke avond (dag ${d})`);
    assert.ok(!gasten.includes(gerrit), `de vrome nooit (dag ${d})`);
    assert.ok(gasten.every((p) => p.leeftijd === 'volwassen' && !p.schout), 'alleen volwassenen, en de schout loop jij');
    assert.ok(!gasten.includes(bewoner(S, 'herbergierster')), 'wie er woont, is er al');
  }
  // Met bier voor twee gaan er twee: wie het dichtst bij woont.
  T.zetVoorraad(S, 'bier', 2 * IN.bierPerBezoek);
  let vol = 0;
  for (let d = HERFST; d < HERFST + 20; d++) {
    const gasten = T.herbergGasten(S, d);
    assert.ok(gasten.length <= 2);
    if (gasten.length === 2) {
      vol++;
      assert.ok(heenVan(S, gasten[0]) <= heenVan(S, gasten[1]), 'wie het dichtst bij woont eerst');
    }
  }
  assert.ok(vol > 0, 'soms zijn beide kannen op');
  T.zetVoorraad(S, 'bier', 0);
  assert.deepEqual(T.herbergGasten(S, HERFST), [], 'een droge herberg, en niemand gaat');
});

test('het lot ligt vast: dezelfde avond geeft dezelfde gasten, ook als niets bewaard was', () => {
  const S = gehucht();
  for (let d = HERFST; d < HERFST + 10; d++) {
    const eerst = T.herbergGasten(S, d).map((p) => p.id);
    delete S.herberg.gasten;
    for (const p of mensen(S)) delete p.wegen;
    assert.deepEqual(T.herbergGasten(S, d).map((p) => p.id), eerst, `dag ${d}`);
  }
});

test('wie ver woont, gaat minder vaak, en in de winter gaan ze vaker', () => {
  const S = gehucht();
  const wie = mensen(S).filter((p) => p.leeftijd === 'volwassen' && !p.schout && p.huis !== T.herbergVan(S));
  const tel = (van, dagen) => {
    const n = new Map(wie.map((p) => [p, 0]));
    for (let d = van; d < van + dagen; d++) for (const p of T.herbergGasten(S, d)) n.set(p, n.get(p) + 1);
    return n;
  };
  const herfst = tel(HERFST, 60);
  // Het derde dat het dichtst bij woont tegen het derde dat het verst weg woont, zonder wie om zijn
  // karakter altijd of nooit gaat: dat hangt niet af van waar de herberg precies staat (vraag 39 zette
  // hem aan de andere kant van het plein).
  const vast = (p) => IN.karakters[(p.wezen && p.wezen.karakter) || (T.MENSEN[p.wie] && T.MENSEN[p.wie].karakter)] != null;
  const opAfstand = wie.filter((p) => !vast(p)).sort((a, b) => heenVan(S, a) - heenVan(S, b));
  const derde = Math.floor(opAfstand.length / 3);
  const dichtbij = opAfstand.slice(0, derde);
  const ver = opAfstand.slice(-derde);
  assert.ok(derde >= 2, `te weinig mensen om te vergelijken (${opAfstand.length})`);
  assert.ok(heenVan(S, ver[0]) - heenVan(S, dichtbij[derde - 1]) > 0.3, 'tussen dichtbij en ver zit afstand');
  const gemiddeld = (lijst, n) => lijst.reduce((s, p) => s + n.get(p), 0) / lijst.length;
  assert.ok(gemiddeld(dichtbij, herfst) > gemiddeld(ver, herfst), `dichtbij ${gemiddeld(dichtbij, herfst)}, ver ${gemiddeld(ver, herfst)}`);
  const winter = tel(WINTER, 60);
  const totaal = (n) => [...n.values()].reduce((a, b) => a + b, 0);
  assert.ok(totaal(winter) > totaal(herfst), `winter ${totaal(winter)}, herfst ${totaal(herfst)}`);
});

// ---------------------------------------------------------------------------------------------
// Erheen, en weer naar huis
// ---------------------------------------------------------------------------------------------

test('\'s avonds lopen de gasten de herberg in, en bij bedtijd in het donker naar hun eigen deur', () => {
  const S = gehucht({ karakters: { boer4: 'drinker' }, dag: bijUur(HERFST, 15), snelheid: 10 });
  const trijn = bewoner(S, 'boer4');
  const zij = bewoner(S, 'herbergierster');
  const deur = deurVan(S, T.herbergVan(S));
  const d = T.dagindeling(HERFST);
  // Een half uur voor bedtijd: de drinker zit binnen, en de herbergierster staat achter de tap.
  loopTot(S, bijUur(HERFST, d.slapen - 0.5));
  assert.equal(T.dagdeelVan(S.kalender.dag), 'avond');
  assert.ok(trijn.wezen.binnen && zelfde(trijn.wezen.deur, deur), 'de drinker is de herberg in');
  assert.ok(zij.wezen.binnen && zelfde(zij.wezen.deur, deur), 'de herbergierster is binnen');
  assert.ok(T.gebouwToestand(S, T.herbergVan(S)).includes('binnen'), T.gebouwToestand(S, T.herbergVan(S)));
  // 's Nachts is iedereen thuis, ook wie in de herberg zat; de herbergierster woont er.
  loopTot(S, bijUur(HERFST + 1, 3));
  assert.equal(T.dagdeelVan(S.kalender.dag), 'nacht');
  assert.ok(trijn.wezen.binnen && zelfde(trijn.wezen.deur, trijn.wezen.thuis), 'de drinker is thuis naar binnen');
  assert.ok(zij.wezen.binnen && zelfde(zij.wezen.deur, deur), 'de herbergierster blijft in haar herberg');
  for (const p of T.herbergGasten(S, HERFST)) {
    assert.ok(p.wezen.binnen && T.afstand(p.wezen.thuis, { x: p.wezen.tx, y: p.wezen.ty }) <= 1, `${p.naam || p.wie} is thuis`);
  }
});

// ---------------------------------------------------------------------------------------------
// Het bier, en wat het doet
// ---------------------------------------------------------------------------------------------

test('de avond wordt verrekend: het bier gaat op, en wie er was, maakt het dorp tevredener', () => {
  const S = gehucht();
  const gasten = T.herbergGasten(S, HERFST);
  assert.ok(gasten.length > 0);
  T.tikHerbergDag(S, HERFST + 1);
  assert.equal(S.voorraad.bier, 100 - gasten.length * IN.bierPerBezoek);
  for (const p of gasten) assert.equal(p.herbergDag, HERFST);
  const g = T.herbergGezelligheid(S, HERFST + 1);
  assert.ok(g > 0 && g <= IN.gezelligheid, `gezelligheid ${g}`);
  const b = T.berekenTevredenheid(S, HERFST + 1);
  assert.equal(b.gezelligheid, g);
  for (const p of gasten) delete p.herbergDag;
  const zonder = T.berekenTevredenheid(S, HERFST + 1);
  assert.equal(zonder.gezelligheid, 0);
  assert.ok(Math.abs(b.tevredenheid - zonder.tevredenheid - g) < 1e-9 || b.tevredenheid === 1, 'het komt erbij');
  assert.ok(T.herbergGezelligheid(S, HERFST + 1 + IN.gezelligheidDagen + 1) === 0, 'een week later is het voorbij');
  assert.ok(!zonder.mist.includes('bier'));
  T.zetVoorraad(S, 'bier', 0);
  assert.ok(T.berekenTevredenheid(S, HERFST + 1).mist.includes('bier'), 'een droge herberg mist het dorp');
});

test('de herbergierster brouwt van graan, tot er genoeg bier ligt', () => {
  const S = gehucht({ bier: 0 });
  T.zetVoorraad(S, 'graan', 100);
  const g = T.herbergVan(S);
  const soort = T.GEBOUWEN.herberg;
  T.tikGebouwenDag(S, HERFST + 1);
  assert.ok(g.werkte > 0, T.gebouwToestand(S, g));
  assert.ok(Math.abs(S.voorraad.bier - soort.maakt.uit.bier * g.werkte) < 1e-9, 'bier naar het werk van vandaag');
  // Ligt er bijna genoeg, dan brouwt ze niet meer dan er nog bij kan. Gisteravond ging er niemand
  // (anders dronken ze eerst: met vijf gasten brouwt ze op één dag niet alles terug).
  const was = { ...IN };
  Object.assign(IN, { kansPerAvond: 0, kansWinter: 0, karakters: {} });
  try {
    T.zetVoorraad(S, 'bier', soort.maakt.tot.bier - 1);
    T.tikGebouwenDag(S, HERFST + 2);
  } finally {
    Object.assign(IN, was);
  }
  assert.ok(Math.abs(S.voorraad.bier - soort.maakt.tot.bier) < 1e-9, `${S.voorraad.bier}`);
  assert.equal(g.vol, 'bier');
  g.werkte = 0;
  assert.match(T.gebouwToestand(S, g), /^Herberg: er ligt genoeg bier\./);
});

test('bij de muis op de herberg: hoeveel gasten er vanavond komen, en hoeveel bier er ligt', () => {
  const S = gehucht({ dag: bijUur(HERFST, 10) });
  const tekst = T.gebouwToestand(S, T.herbergVan(S));
  assert.match(tekst, /^Herberg: /);
  assert.match(tekst, /Vanavond (\d+ gast(en)?|geen gasten); 100 bier\.$/);
  T.zetVoorraad(S, 'bier', 0);
  assert.match(T.gebouwToestand(S, T.herbergVan(S)), /geen gasten; geen bier meer\.$/);
});

test('\'s avonds brandt de lantaarn van de herberg, en met meer gasten binnen is het licht warmer', () => {
  const S = gehucht({ dag: bijUur(HERFST, 12) });
  assert.deepEqual(T.herbergLicht(S), [], 'overdag niet');
  const d = T.dagindeling(HERFST);
  S.kalender.dag = bijUur(HERFST, (d.werkEind + d.slapen) / 2);
  const leeg = T.herbergLicht(S);
  assert.equal(leeg.length, 1);
  assert.ok(zelfde(leeg[0], deurVan(S, T.herbergVan(S))), 'bij de deur');
  const deur = deurVan(S, T.herbergVan(S));
  for (const p of T.herbergGasten(S, HERFST)) Object.assign(p.wezen, { binnen: true, deur: { x: deur.x, y: deur.y } });
  const vol = T.herbergLicht(S);
  assert.ok(vol[0].sterkte > leeg[0].sterkte && vol[0].straal > leeg[0].straal, 'warmer en verder');
  // De ramen branden, met evenveel schimmen als er gasten binnen zitten (vraag 39: "Ja idd").
  assert.equal(leeg[0].ramenVan, T.herbergVan(S));
  assert.equal(leeg[0].schimmen, 0);
  assert.equal(vol[0].schimmen, T.herbergGasten(S, HERFST).length);
  // Na bedtijd brandt hij nog zolang er iemand binnen zit.
  S.kalender.dag = bijUur(HERFST, d.slapen + 0.2);
  assert.equal(T.herbergLicht(S).length, 1);
});

// ---------------------------------------------------------------------------------------------
// Stuk 2: in de herberg wordt gepraat (Marcel koos B, 27 sep, vraag 38)
// ---------------------------------------------------------------------------------------------

const zegt = (S) => T.gesprekKnoop(S, 'herbergierster', 'welkom').tekst;

test('de herbergierster vertelt wie er gisteravond aan de tap zat, en of het droog was', () => {
  const S = gehucht();
  assert.match(zegt(S), /^Stil gisteravond/);
  const gasten = T.herbergGasten(S, HERFST);
  assert.ok(gasten.length > 0);
  T.tikHerbergDag(S, HERFST + 1);
  assert.ok(T.heeftVlag(S, 'herbergGasten'));
  const zin = zegt(S);
  for (const p of gasten) assert.ok(zin.includes(p.wie ? T.naamVanMens(p.wie) : p.naam), zin);
  assert.ok(!zin.includes('{'), `alles is ingevuld: ${zin}`);
  T.zetVoorraad(S, 'bier', 0);
  T.tikHerbergDag(S, HERFST + 2);
  assert.ok(T.heeftVlag(S, 'herbergDroog') && !T.heeftVlag(S, 'herbergGasten'), 'droog, en er kwam niemand');
  assert.match(zegt(S), /^Geen druppel/);
});

test('de roddelaar vertelt in de herberg wat er in zijn kelder ligt, en pas dan vinden de soldaten het makkelijker', () => {
  // Trijn (boer4) woont vlak bij de herberg.
  const S = gehucht({ karakters: { boer4: 'roddelaar' } });
  const trijn = bewoner(S, 'boer4');
  const kelder = trijn.huis;
  const V = T.VERSTOP_INSTELLINGEN;
  const basis = V.plekken.boerderij.vinden;
  T.zetVoorraad(S, 'graan', 50);
  assert.ok(T.verstop(S, kelder, 'graan', 10).kan);
  let p = T.verstopPlekVan(S, kelder);
  assert.equal(p.vinden, basis, 'zolang ze het niet vertelde, is het een kelder als alle andere');
  assert.match(T.overKelderTekst(p), /vertelt het in de herberg/);
  // De eerste avond dat ze naar de herberg gaat.
  let d = HERFST;
  while (!T.herbergGasten(S, d).includes(trijn) && d < HERFST + 60) d++;
  assert.ok(d < HERFST + 60, 'ze gaat wel eens');
  T.tikHerbergDag(S, d + 1);
  assert.equal(kelder.verteld, d);
  p = T.verstopPlekVan(S, kelder);
  assert.equal(p.vinden, basis * V.bewoners.roddelaar.vinden, 'nu weet de halve herberg het');
  assert.match(T.overKelderTekst(p), /in de herberg al verteld/);
  assert.ok(T.heeftVlag(S, 'herbergRoddel'));
  const zin = zegt(S);
  assert.ok(zin.includes(`En ${T.naamVanMens('boer4')} had het weer over wat er in de kelder ligt`), zin);
  // Haal je alles terug, dan is wat ze vertelde niet meer waar.
  T.haalTerug(S, kelder, 'graan', kelder.verstopt.graan);
  assert.equal(kelder.verteld, undefined);
  assert.equal(T.verstopPlekVan(S, kelder).vinden, basis);
  // Met een lege kelder heeft ze niets te vertellen.
  let e = d + 1;
  while (!T.herbergGasten(S, e).includes(trijn) && e < d + 60) e++;
  T.tikHerbergDag(S, e + 1);
  assert.ok(!T.heeftVlag(S, 'herbergRoddel'), 'niets te vertellen');
});

test('een dorp zonder herberg hoort het van de roddelaar toch wel', () => {
  const S = gehucht({ karakters: { boer4: 'roddelaar' } });
  const kelder = bewoner(S, 'boer4').huis;
  T.herbergVan(S).klaar = false;
  const V = T.VERSTOP_INSTELLINGEN;
  assert.equal(T.verstopPlekVan(S, kelder).vinden, V.plekken.boerderij.vinden * V.bewoners.roddelaar.vinden);
  assert.match(T.overKelderTekst(T.verstopPlekVan(S, kelder)), /en vertelt het ook\.$/);
});

test('de marskramer zit \'s avonds in de herberg en slaapt er, en staat overdag weer bij zijn waar', () => {
  const S = gehucht({ dag: bijUur(HERFST, 9.5), snelheid: 10 });
  T.marskramerKomt(S, 2, HERFST);
  S.marskramer.meteen = true;
  const d = T.dagindeling(HERFST);
  const deur = deurVan(S, T.herbergVan(S));
  const tot = (dag) => {
    for (let i = 0; S.kalender.dag < dag && i < 200000; i++) {
      stap(S, 0.05);
      T.werkMarskramerBij(S);
    }
  };
  tot(bijUur(HERFST, d.werkEind - 0.5));
  const m = S.marskramer;
  const e = m.wezen;
  assert.ok(m.staat && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1, 'overdag staat hij bij zijn waar op het plein');
  tot(bijUur(HERFST, d.slapen + 1));
  assert.ok(e.binnen && zelfde(e.deur, deur), 'hij slaapt in de herberg');
  assert.match(T.gebouwToestand(S, T.herbergVan(S)), /de marskramer logeert hier\.$/);
  tot(bijUur(HERFST + 1, 12));
  assert.ok(!e.binnen && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1, 'de volgende ochtend staat hij er weer');
});
