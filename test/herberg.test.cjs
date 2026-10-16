// De herberg (js/herberg.js, sinds 27 sep): wie er 's avonds heen gaat, het bier, en wat het doet. Zie
// ontwerp/spel.md, "Zaken waar de mensen zelf heen gaan", en de werklijst, punt 2 (vraag 35 tot en met 37). Sinds 12 okt
// (snoeien, ronde 2, stap 3) op het proefdorp (test/grond.cjs): de herberg is een gebouw dat de mensen zelf bouwen, en er
// woont geen herbergierster in.
const test = require('node:test');
const assert = require('node:assert/strict');

const { proefDorp } = require('./grond.cjs');

const T = require('./laad.cjs').spel();
const IN = T.HERBERG_INSTELLINGEN;

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {} };

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

// Het proefdorp (test/grond.cjs) met een herberg, op een herfstochtend. Het zaad van het dorp ligt vast (het is bewaard
// met het proefdorp), want daaruit komen wie er 's avonds gaat. Er ligt bier genoeg.
// En het toeval ligt vast (het dwalen, de praatjes, de tekening van een huis): anders speelt elke keer een ander avondje,
// en zat een gast heel soms een half uur voor bedtijd nog niet binnen (6 okt, één keer in drie keer de hele npm test).
let toeval = 11;
Math.random = () => (toeval = (toeval * 16807) % 2147483647) / 2147483647;

function proef(opties = {}) {
  toeval = 11;
  const { dag, snelheid, bier, ...dorp } = opties;
  const { S } = proefDorp(T, { gebouwen: ['herberg'], ...dorp });
  Object.assign(S, { bezocht: new Set() });
  Object.assign(S.kalender, { dag: dag != null ? dag : bijUur(HERFST, 7), snelheid: snelheid || 1 });
  T.zetVoorraad(S.dorp, 'bier', bier != null ? bier : 100);
  return S;
}
// Wie er vanavond gaat, is een kans (HERBERG_INSTELLINGEN.kansPerAvond, kansWinter): een toets die zeker wil dat er iemand
// gaat, zet de kans op 1 zolang hij loopt, en zet hem daarna terug. (Dan gaat iedereen die erheen kan: wie te ver woont
// om er nog te kunnen zitten, niet.)
function metKans(kans, doe) {
  const was = { kansPerAvond: IN.kansPerAvond, kansWinter: IN.kansWinter };
  Object.assign(IN, { kansPerAvond: kans, kansWinter: kans });
  try {
    return doe();
  } finally {
    Object.assign(IN, was);
  }
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkBewonersBij(S.dorp);
  T.beweegWezens(S, S.wereld, dt, dtW);
  T.werkOogstBij(S, S.dorp, dtW);
  T.laatDwalen(S, dtW);
}
function loopTot(S, dag) {
  for (let i = 0; S.kalender.dag < dag && i < 200000; i++) stap(S, 0.05);
}
const mensen = (S) => S.dorp.bewoners.mensen;
const deurVan = (S, g) => T.deurVan(S.wereld, g);
const zelfde = (a, b) => a.x === b.x && a.y === b.y;
// Hoe lang iemand onderweg is naar de herberg, in uren.
const heenVan = (S, p) => {
  const d = deurVan(S, T.herbergVan(S.dorp));
  return T.looptijdVan(S.wereld, p, deurVan(S, p.huis), { x: d.x, y: d.y, straal: 0 }, 'herberg');
};

// ---------------------------------------------------------------------------------------------
// De herberg en wie er tapt
// ---------------------------------------------------------------------------------------------

test('in het proefdorp staat een herberg, groter dan een boerderij, en wie er werkt, tapt en brouwt; er woont niemand', () => {
  const S = proef();
  const g = T.herbergVan(S.dorp);
  assert.ok(g, 'er is een herberg');
  assert.ok(g.tekening.startsWith('huizen/'), 'een tekening van de huizenbouwer');
  const deur = deurVan(S, g);
  assert.ok(T.isBegaanbaar(S.wereld, deur.x, deur.y), 'voor de deur kun je staan');
  const oppervlak = (x) => x.voet.b * x.voet.h;
  for (const b of S.dorp.gebouwen.filter((x) => x.soort === 'boerderij')) assert.ok(oppervlak(g) > oppervlak(b), `groter dan de boerderij (${oppervlak(g)} tegen ${oppervlak(b)})`);
  const werkers = mensen(S).filter((p) => p.werk === g);
  assert.ok(g.handen > 0 && werkers.length === g.handen, 'wie er werkt, tapt en brouwt');
  assert.deepEqual(mensen(S).filter((p) => p.huis === g), [], 'er woont niemand: een herbergierster is er niet meer');
});

// ---------------------------------------------------------------------------------------------
// Wie er 's avonds gaat
// ---------------------------------------------------------------------------------------------

test('wie er vanavond gaat: volwassenen, niet de aanvoerder, en niet meer dan er bier is', () => {
  const S = proef();
  metKans(1, () => {
    for (let d = HERFST; d < HERFST + 20; d++) {
      const gasten = T.herbergGasten(S.dorp, d);
      assert.ok(gasten.length > 0, `bij kans 1 gaat er iemand (dag ${d})`);
      assert.ok(gasten.every((p) => p.leeftijd === 'volwassen' && !p.aanvoerder), 'alleen volwassenen, en de aanvoerder loop jij');
      assert.ok(gasten.every((p) => p.huis !== T.herbergVan(S.dorp)), 'wie er woont, is er al');
    }
    // Met bier voor twee gaan er twee: wie het dichtst bij woont.
    T.zetVoorraad(S.dorp, 'bier', 2 * IN.bierPerBezoek);
    let vol = 0;
    for (let d = HERFST; d < HERFST + 20; d++) {
      const gasten = T.herbergGasten(S.dorp, d);
      assert.ok(gasten.length <= 2);
      if (gasten.length === 2) {
        vol++;
        assert.ok(heenVan(S, gasten[0]) <= heenVan(S, gasten[1]), 'wie het dichtst bij woont eerst');
      }
    }
    assert.ok(vol > 0, 'soms zijn beide kannen op');
    T.zetVoorraad(S.dorp, 'bier', 0);
    assert.deepEqual(T.herbergGasten(S.dorp, HERFST), [], 'een droge herberg, en niemand gaat');
  });
});

test('het lot ligt vast: dezelfde avond geeft dezelfde gasten, ook als niets bewaard was', () => {
  const S = proef();
  for (let d = HERFST; d < HERFST + 10; d++) {
    const eerst = T.herbergGasten(S.dorp, d).map((p) => p.id);
    delete S.dorp.herberg.gasten;
    for (const p of mensen(S)) delete p.wegen;
    assert.deepEqual(T.herbergGasten(S.dorp, d).map((p) => p.id), eerst, `dag ${d}`);
  }
});

test('wie ver woont, gaat minder vaak, en in de winter gaan ze vaker', () => {
  const S = proef();
  const wie = mensen(S).filter((p) => p.leeftijd === 'volwassen' && !p.aanvoerder && p.huis !== T.herbergVan(S.dorp));
  const tel = (van, dagen) => {
    const n = new Map(wie.map((p) => [p, 0]));
    for (let d = van; d < van + dagen; d++) for (const p of T.herbergGasten(S.dorp, d)) n.set(p, n.get(p) + 1);
    return n;
  };
  const herfst = tel(HERFST, 60);
  // Het derde dat het dichtst bij woont tegen het derde dat het verst weg woont: dat hangt niet af van waar de herberg
  // precies staat.
  const opAfstand = wie.slice().sort((a, b) => heenVan(S, a) - heenVan(S, b));
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

test('de grote herberg, van twee lagen, trekt meer gasten dan de kleine (vraag 133)', () => {
  assert.ok(T.isDorpsVorm('huizen/wit-herberg2-leien-z'), 'de grote komt pas in een dorp');
  assert.ok(!T.isDorpsVorm('huizen/wit-herberg1-riet-z'), 'de kleine is van het gehucht');
  assert.ok(!T.isDorpsVorm('huizen/herberg1'), 'een tekening zonder stijl is geen grote');
  const tel = () => {
    const S = proef();
    let n = 0;
    for (let d = HERFST; d < HERFST + 60; d++) n += T.herbergGasten(S.dorp, d).length;
    return n;
  };
  const klein = tel();
  const echt = T.isDorpsVorm;
  T.isDorpsVorm = () => true; // de herberg van het proefdorp, alsof hij de grote is
  try {
    const groot = tel();
    assert.ok(groot > klein * 1.2, `groot ${groot}, klein ${klein}`);
  } finally {
    T.isDorpsVorm = echt;
  }
});

// ---------------------------------------------------------------------------------------------
// Erheen, en weer naar huis
// ---------------------------------------------------------------------------------------------

test('\'s avonds lopen de gasten de herberg in, en bij bedtijd in het donker naar hun eigen deur', () => {
  metKans(1, () => {
    const S = proef({ dag: bijUur(HERFST, 15), snelheid: 10 });
    const gast = T.herbergGasten(S.dorp, HERFST)[0];
    assert.ok(gast, 'er gaat iemand');
    const deur = deurVan(S, T.herbergVan(S.dorp));
    const d = T.dagindeling(HERFST);
    // Een half uur voor bedtijd: de gast zit binnen.
    loopTot(S, bijUur(HERFST, d.slapen - 0.5));
    assert.equal(T.dagdeelVan(S.kalender.dag), 'avond');
    assert.ok(gast.wezen.binnen && zelfde(gast.wezen.deur, deur), 'de gast is de herberg in');
    assert.ok(T.gebouwToestand(S.dorp, T.herbergVan(S.dorp)).includes('inside'), T.gebouwToestand(S.dorp, T.herbergVan(S.dorp)));
    // 's Nachts is iedereen thuis, ook wie in de herberg zat.
    loopTot(S, bijUur(HERFST + 1, 3));
    assert.equal(T.dagdeelVan(S.kalender.dag), 'nacht');
    assert.ok(gast.wezen.binnen && zelfde(gast.wezen.deur, gast.wezen.thuis), 'de gast is thuis naar binnen');
    for (const p of T.herbergGasten(S.dorp, HERFST)) {
      assert.ok(p.wezen.binnen && T.afstand(p.wezen.thuis, { x: p.wezen.tx, y: p.wezen.ty }) <= 1, `${p.naam} is thuis`);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Het bier, en wat het doet
// ---------------------------------------------------------------------------------------------

test('de avond wordt verrekend: het bier gaat op, en wie er was, maakt het dorp tevredener', () => {
  const S = proef({ gebouwen: ['herberg', 'huis'], hutten: 1 });
  const gasten = metKans(1, () => T.herbergGasten(S.dorp, HERFST));
  assert.ok(gasten.length > 0);
  T.tikHerbergDag(S.dorp, HERFST + 1);
  assert.equal(S.dorp.voorraad.bier, 100 - gasten.length * IN.bierPerBezoek);
  for (const p of gasten) assert.equal(p.herbergDag, HERFST);
  const g = T.herbergGezelligheid(S.dorp, HERFST + 1);
  assert.ok(g > 0 && g <= IN.gezelligheid + 1e-9, `gezelligheid ${g}`); // bij kans 1 gaan ze (bijna) allemaal: precies het maximum
  const b = T.berekenTevredenheid(S.dorp, HERFST + 1);
  assert.equal(b.gezelligheid, g);
  for (const p of gasten) delete p.herbergDag;
  const zonder = T.berekenTevredenheid(S.dorp, HERFST + 1);
  assert.equal(zonder.gezelligheid, 0);
  // Het komt bij het dorp erbij, tot 100%.
  assert.ok(Math.abs(b.tevredenheid - Math.min(1, zonder.tevredenheid + g)) < 1e-9, 'het komt erbij');
  assert.ok(T.herbergGezelligheid(S.dorp, HERFST + 1 + IN.gezelligheidDagen + 1) === 0, 'een week later is het voorbij');
  assert.ok(!zonder.mist.includes('ale'));
  T.zetVoorraad(S.dorp, 'bier', 0);
  assert.ok(T.berekenTevredenheid(S.dorp, HERFST + 1).mist.includes('ale'), 'een droge herberg mist het dorp');
});

test('de herberg brouwt van graan, tot er genoeg bier ligt', () => {
  const S = proef({ bier: 0 });
  // Na de oogst houden de boeren het zaaigraan achter, en dat brouwt hij niet (js/gebouwen.js): 100 graan erboven.
  T.zetVoorraad(S.dorp, 'graan', T.zaaigraanApart(S.dorp, HERFST + 1) + 100);
  const g = T.herbergVan(S.dorp);
  const soort = T.GEBOUWEN.herberg;
  T.tikGebouwenDag(S.dorp, HERFST + 1);
  assert.ok(g.werkte > 0, T.gebouwToestand(S.dorp, g));
  // (het bier ligt bij de herberg tot de ossenkar het haalt: js/kar.js, werklijst C, stap 3)
  const bier = () => S.dorp.voorraad.bier + T.opDeStapels(S.dorp, 'bier');
  assert.ok(Math.abs(bier() - soort.maakt.uit.bier * g.werkte) < 1e-9, 'bier naar het werk van vandaag');
  // Ligt er bijna genoeg, dan brouwt hij niet meer dan er nog bij kan. Gisteravond ging er niemand
  // (anders dronken ze eerst: met vijf gasten brouwt hij op één dag niet alles terug).
  metKans(0, () => {
    g.stapel = {}; // het bier van gisteren ligt nu in de opslag
    T.zetVoorraad(S.dorp, 'bier', T.maaktTot(soort, S.dorp).bier - 1);
    T.tikGebouwenDag(S.dorp, HERFST + 2);
  });
  assert.ok(Math.abs(bier() - T.maaktTot(soort, S.dorp).bier) < 1e-9, `${bier()}`);
  assert.equal(T.maaktTot(soort).bier, 60, 'sinds 8 okt (was 30): tot er 60 bier is');
  assert.equal(g.vol, 'bier');
  g.werkte = 0;
  assert.match(T.gebouwToestand(S.dorp, g), /^Inn: there is enough ale in store\./);
});

test('bij de muis op de herberg: hoeveel gasten er vanavond komen, en hoeveel bier er ligt', () => {
  const S = proef({ dag: bijUur(HERFST, 10) });
  const tekst = T.gebouwToestand(S.dorp, T.herbergVan(S.dorp));
  assert.match(tekst, /^Inn: /);
  assert.match(tekst, /(\d+ guests? tonight|No guests tonight); 100 ale\.$/);
  T.zetVoorraad(S.dorp, 'bier', 0);
  assert.match(T.gebouwToestand(S.dorp, T.herbergVan(S.dorp)), /No guests tonight; no ale left\.$/);
});

test('\'s avonds brandt de lantaarn van de herberg, en met meer gasten binnen is het licht warmer', () => {
  const S = proef({ dag: bijUur(HERFST, 12) });
  assert.deepEqual(T.herbergLicht(S.dorp), [], 'overdag niet');
  const d = T.dagindeling(HERFST);
  S.kalender.dag = bijUur(HERFST, (d.werkEind + d.slapen) / 2);
  const leeg = T.herbergLicht(S.dorp);
  assert.equal(leeg.length, 1);
  assert.ok(zelfde(leeg[0], deurVan(S, T.herbergVan(S.dorp))), 'bij de deur');
  const deur = deurVan(S, T.herbergVan(S.dorp));
  const gasten = metKans(1, () => T.herbergGasten(S.dorp, HERFST));
  assert.ok(gasten.length > 0, 'er gaat iemand');
  for (const p of gasten) Object.assign(p.wezen, { binnen: true, deur: { x: deur.x, y: deur.y } });
  const vol = T.herbergLicht(S.dorp);
  assert.ok(vol[0].sterkte > leeg[0].sterkte && vol[0].straal > leeg[0].straal, 'warmer en verder');
  // De ramen branden, met evenveel schimmen als er gasten binnen zitten (vraag 39: "Ja idd").
  assert.equal(leeg[0].ramenVan, T.herbergVan(S.dorp));
  assert.equal(leeg[0].schimmen, 0);
  assert.equal(vol[0].schimmen, gasten.length);
  // Na bedtijd brandt hij nog zolang er iemand binnen zit.
  S.kalender.dag = bijUur(HERFST, d.slapen + 0.2);
  assert.equal(T.herbergLicht(S.dorp).length, 1);
});

// ---------------------------------------------------------------------------------------------
// Stuk 2: in de herberg wordt gepraat (Marcel koos B, 27 sep, vraag 38)
// ---------------------------------------------------------------------------------------------

// Het gesprek van de waard: wie in de herberg werkt (Marcel, 12 okt: "Naar de waard"; tot dan de herbergierster, die in
// het gehucht dat er al was in de herberg woonde). De herberg onthoudt wie er zat (T.tikHerbergDag), en dat leest het
// gesprek.
const zegt = (S) => T.gesprekKnoop(S, S.dorp, 'waard', 'welkom').tekst;

test('wie in de herberg werkt, is de waard: een klik kiest hem', () => {
  const S = proef();
  const g = T.herbergVan(S.dorp);
  const waard = mensen(S).find((p) => p.werk === g);
  assert.ok(waard && waard.wezen, 'er werkt iemand');
  // Een klik kiest hem (js/kiezen.js; vraag 170, stap 1); praten is geparkeerd (stap 5).
  const h = T.handelingVerkennen(S, { wezen: waard.wezen, x: waard.wezen.x, y: waard.wezen.y });
  assert.equal(h.tekst, `${T.naamVanBewoner(waard)}, the innkeeper`);
  assert.equal(h.kies, waard.wezen);
  assert.equal(T.GESPREKKEN.herbergierster, undefined);
});

test('de herberg onthoudt wie er gisteravond zat, en of het droog was (wat het gesprek van de waard vertelt)', () => {
  const S = proef();
  assert.match(zegt(S), /^Quiet last night/);
  const gasten = metKans(1, () => T.herbergGasten(S.dorp, HERFST));
  assert.ok(gasten.length > 0);
  T.tikHerbergDag(S.dorp, HERFST + 1);
  assert.ok(T.heeftVlag(S.dorp, 'herbergGasten'));
  const zin = zegt(S);
  for (const p of gasten) assert.ok(zin.includes(T.naamVanBewoner(p)), zin);
  assert.ok(!zin.includes('{'), `alles is ingevuld: ${zin}`);
  T.zetVoorraad(S.dorp, 'bier', 0);
  T.tikHerbergDag(S.dorp, HERFST + 2);
  assert.ok(T.heeftVlag(S.dorp, 'herbergDroog') && !T.heeftVlag(S.dorp, 'herbergGasten'), 'droog, en er kwam niemand');
  assert.match(zegt(S), /^Not a drop/);
});

test('de marskramer zit \'s avonds in de herberg en slaapt er, en staat overdag weer bij zijn waar', () => {
  const S = proef({ dag: bijUur(HERFST, 9.5), snelheid: 10 });
  T.marskramerKomt(S.dorp, 2, HERFST);
  S.dorp.marskramer.meteen = true;
  const d = T.dagindeling(HERFST);
  const deur = deurVan(S, T.herbergVan(S.dorp));
  const tot = (dag) => {
    for (let i = 0; S.kalender.dag < dag && i < 200000; i++) {
      stap(S, 0.05);
      T.werkMarskramerBij(S.dorp);
    }
  };
  tot(bijUur(HERFST, d.werkEind - 0.5));
  const m = S.dorp.marskramer;
  const e = m.wezen;
  assert.ok(m.staat && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1, 'overdag staat hij bij zijn waar op het plein');
  tot(bijUur(HERFST, d.slapen + 1));
  assert.ok(e.binnen && zelfde(e.deur, deur), 'hij slaapt in de herberg');
  assert.match(T.gebouwToestand(S.dorp, T.herbergVan(S.dorp)), /the merchant is lodging here\.$/);
  tot(bijUur(HERFST + 1, 12));
  assert.ok(!e.binnen && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1, 'de volgende ochtend staat hij er weer');
});
