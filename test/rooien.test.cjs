// Grond uit het bos (werklijst vraag 110, e, met 115; Marcel, 6 okt: "A ja B ja C ja D zo"): een erf mag op struiken en
// bomen, het gezin dat het neemt rooit het zelf (de man met de bijl, zijn gezin helpt), en zolang wacht de hut, nog niet
// op de kaart. Na een maand rooien de buren de rest. Een erf in het bos van de heer kost zijn gunst; de wei niets. Een
// boom geeft 10 hout, wie hem ook omhakt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = new Proxy({}, { get: () => () => undefined });

// Het ontworpen gehucht, zoals een nieuw spel begint, stil en met een vaste worp, in het spel waarin jij erven aanwijst.
function gehucht(dag = 0) {
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

// Met de spelregels zoals de toetsen van de erven (jij wijst erven aan, de mensen vragen niets), zonder voorvallen, met
// een vaste worp, en na afloop alles terug.
function zo(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('wieBouwt', 'jij');
  T.zetOptie('voorvallen', 'uit');
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Het dorp vol: in elk huis zoveel mensen als er plaats is.
function vol(S) {
  T.wijzigBevolking(S.dorp, S.dorp.woonruimte - S.dorp.bevolking, 'groei');
}

// De plek voor een erf die het dichtst bij het plein ligt, met zoveel bomen als `wil` vraagt (een functie van het aantal
// bomen): de toets zoekt hem zelf, zodat hij met de kaart meegaat.
function erfPlek(S, wil) {
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  const maat = T.erfMaat();
  return plekken.find((p) => !T.waaromPastErfNiet(S.dorp, p.x, p.y) && wil(T.watTeRooien(S.dorp, { x: p.x, y: p.y, b: maat.b, h: maat.h }).bomen)) || null;
}
const BOS = () => T.ONTGINNEN_INSTELLINGEN.bosBomen;
const inDeWei = (n) => n > 0 && n < BOS();
const leeg = (n) => n === 0;

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`.
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

test('een erf mag op bomen en struiken, niet op water; het bouwmenu zegt wat er eerst weg moet', () => {
  zo(() => {
    const S = gehucht();
    const w = S.wereld;
    const wei = erfPlek(S, inDeWei);
    assert.ok(wei, 'er is een plek met een paar bomen in de wei');
    const r = { x: wei.x, y: wei.y, b: 10, h: 10 };
    const wat = T.watTeRooien(S.dorp, r);
    assert.ok(wat.bomen > 0 && wat.bomen < BOS());
    assert.equal(T.inHetBosVanDeHeer(S.dorp, r), false);
    assert.match(T.rooiTekst(S.dorp, r), new RegExp(`rooit eerst .*\\(\\+${wat.bomen * T.ONTGINNEN_INSTELLINGEN.houtPerBoom} hout\\)`));
    assert.doesNotMatch(T.rooiTekst(S.dorp, r), /bos van de heer/);
    // Water houdt een erf nog altijd tegen.
    const water = [];
    for (let y = 0; y < w.tegels.length; y++) for (let x = 0; x < w.tegels[0].length; x++) if (w.grond[y][x] && w.grond[y][x].naam === 'water') water.push({ x, y });
    assert.ok(water.length, 'het gehucht heeft water');
    assert.ok(water.every((t) => T.waaromPastErfNiet(S.dorp, t.x - 4, t.y - 4)), 'geen erf over het water');
    // Een erf op een lege plek: niets te rooien.
    const vrij = erfPlek(S, leeg);
    assert.equal(T.rooiTekst(S.dorp, { x: vrij.x, y: vrij.y, b: 10, h: 10 }), null);
  });
});

test('een erf in het bos van de heer kost zijn gunst, een erf in de wei niets', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const bos = erfPlek(S, (n) => n >= BOS());
    assert.ok(bos, 'er is een plek in het bos');
    const r = { x: bos.x, y: bos.y, b: 10, h: 10 };
    assert.equal(T.inHetBosVanDeHeer(D, r), true);
    assert.match(T.rooiTekst(D, r), new RegExp(`bos van de heer.*gunst −${T.ONTGINNEN_INSTELLINGEN.gunst}`));
    const gunst = T.bazenNu(D).gunst;
    const u = T.plaatsGebouw(D, 'erf', bos.x, bos.y);
    assert.equal(u.gelukt, true, u.reden);
    assert.match(u.bericht, /bos van de heer/);
    assert.equal(T.bazenNu(D).gunst, gunst - T.ONTGINNEN_INSTELLINGEN.gunst);
    const wei = erfPlek(S, inDeWei);
    assert.equal(T.plaatsGebouw(D, 'erf', wei.x, wei.y).gelukt, true);
    assert.equal(T.bazenNu(D).gunst, gunst - T.ONTGINNEN_INSTELLINGEN.gunst, 'de wei kost niets');
  });
});

test('een gezin rooit zijn erf eerst: de hut wacht, nog niet op de kaart, en het gezin woont er al en werkt nergens', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    vol(S);
    const plek = erfPlek(S, inDeWei);
    T.plaatsGebouw(D, 'erf', plek.x, plek.y);
    const erf = D.erven[0];
    const hout = D.voorraad.hout;
    const voor = D.bevolking;
    const hut = T.gezinZoektEenErf(D);
    assert.ok(hut, 'er komt een hut');
    assert.equal(hut.wachtOpRooien, true);
    assert.equal(hut.wachtOpHout, false);
    assert.equal(hut.voorwerp, null, 'nog niet op de kaart');
    assert.equal(erf.rooienTot, Math.floor(S.kalender.dag) + T.ERVEN_INSTELLINGEN.rooiDagen);
    assert.equal(D.voorraad.hout, hout, 'het hout voor de hut gaat er pas af als hij begint');
    assert.equal(T.paaltjesVan(erf).length, 4, 'de paaltjes staan er nog');
    // Het gezin woont er al, en werkt nergens zolang het rooit.
    const gezin = D.bewoners.mensen.filter((p) => p.huis === hut);
    assert.ok(gezin.length > 0);
    assert.equal(D.bevolking, voor + gezin.length);
    assert.equal(D.woonruimte, T.telWoonruimte(D));
    T.wijsWerkToe(D);
    assert.ok(gezin.every((p) => !p.werk), 'wie rooit, werkt nergens');
    assert.match(D.bewoners.komen[D.bewoners.komen.length - 1].aankomst.tekst, /Ze rooien hun erf/);
    // Zolang er iets staat, blijft de hut wachten.
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, true);
    // Het gezin rooit alles (zoals js/veldwerk.js het doet): elke boom geeft hout.
    const bomen = T.watTeRooien(D, erf).bomen;
    for (const t of T.teRooienOpErf(D, erf)) {
      if (T.ontginWerkOp(S.wereld, t.x, t.y) === 'hakken') assert.ok(T.hakBoom(D, t.x, t.y));
      assert.ok(T.rooi(D, t.x, t.y));
    }
    assert.equal(D.voorraad.hout, hout + bomen * T.ONTGINNEN_INSTELLINGEN.houtPerBoom);
    // De volgende dag ligt de bouwplaats er, en begint hij met het hout.
    S.kalender.dag = 1;
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, false);
    assert.ok(hut.voorwerp, 'de bouwplaats ligt op de kaart');
    assert.equal(hut.wachtOpHout, false);
    assert.equal(hut.klaarOp, 1 + T.GEBOUWEN.hut.bouwtijd);
    assert.equal(D.voorraad.hout, hout + bomen * T.ONTGINNEN_INSTELLINGEN.houtPerBoom - T.GEBOUWEN.hut.kosten.hout);
    assert.equal(T.paaltjesVan(erf).length, 0);
    T.wijsWerkToe(D);
    assert.ok(!hut.wachtOpRooien && gezin.every((p) => !p.huis.wachtOpRooien));
  });
});

test('is de maand om, dan rooien de buren de rest in één keer, en het hout gaat naar de schuur', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    vol(S);
    const plek = erfPlek(S, (n) => n >= BOS());
    T.plaatsGebouw(D, 'erf', plek.x, plek.y);
    const erf = D.erven[0];
    const hut = T.gezinZoektEenErf(D);
    assert.equal(hut.wachtOpRooien, true);
    const bomen = T.watTeRooien(D, erf).bomen;
    const hout = D.voorraad.hout;
    S.kalender.dag = erf.rooienTot - 1;
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, true, 'de dag ervoor nog niet');
    S.kalender.dag = erf.rooienTot;
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, false);
    assert.equal(T.teRooienOpErf(D, erf).length, 0, 'het erf is leeg');
    assert.ok(hut.voorwerp);
    assert.equal(D.voorraad.hout, hout + bomen * T.ONTGINNEN_INSTELLINGEN.houtPerBoom - T.GEBOUWEN.hut.kosten.hout);
  });
});

test('een gezin neemt eerst een erf waar niets te rooien staat', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const wei = erfPlek(S, inDeWei);
    T.plaatsGebouw(D, 'erf', wei.x, wei.y);
    // Het lege erf zo ver mogelijk weg: het gaat toch voor.
    const maat = T.erfMaat();
    let ver = null;
    for (let y = 0; y < S.wereld.tegels.length; y++) {
      for (let x = 0; x < S.wereld.tegels[0].length; x++) {
        if (T.waaromPastErfNiet(D, x, y) || T.teRooienOpErf(D, { x, y, b: maat.b, h: maat.h }).length) continue;
        const d = Math.hypot(x - wei.x, y - wei.y);
        if (!ver || d > ver.d) ver = { x, y, d };
      }
    }
    T.plaatsGebouw(D, 'erf', ver.x, ver.y);
    const lege = D.erven[1];
    assert.equal(T.kiesErf(D), lege);
  });
});

test('het hoofd van het gezin rooit zijn erf met de bijl, zijn gezin helpt, en daarna komt de hut', () => {
  zo(() => {
    const S = gehucht(1 + 7 / 24);
    const D = S.dorp;
    vol(S);
    const plek = erfPlek(S, inDeWei);
    T.plaatsGebouw(D, 'erf', plek.x, plek.y);
    const erf = D.erven[0];
    const hut = T.gezinZoektEenErf(D);
    const hoofd = D.bewoners.mensen.find((p) => p.huis === hut && !p.hoofd);
    let gehakt = false;
    let geholpen = false;
    for (let dag = 1; dag <= 6 && hut.wachtOpRooien; dag++) {
      for (let uur = 8; uur <= 17; uur += 0.5) {
        totUur(S, dag, uur);
        const e = hoofd.wezen;
        if (e && e.werkt && (e.werkt.soort === 'hakken' || e.werkt.soort === 'rooien')) gehakt = true;
        const helpers = D.bewoners.mensen.filter((p) => p.huis === hut && p !== hoofd && p.wezen);
        if (helpers.some((p) => T.helpAnker(D, p.wezen))) geholpen = true;
      }
      totUur(S, dag + 1, 7);
    }
    assert.ok(gehakt, 'hij hakte of rooide');
    assert.ok(geholpen, 'zijn gezin hielp');
    assert.equal(hut.wachtOpRooien, false, 'het erf is gerooid');
    assert.ok(hut.voorwerp, 'en de bouwplaats van zijn hut ligt er');
    assert.equal(T.teRooienOpErf(D, erf).length, 0);
  });
});

test('bewaren en laden houdt een erf dat gerooid wordt, en de hut die erop wacht', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    vol(S);
    const plek = erfPlek(S, inDeWei);
    T.plaatsGebouw(D, 'erf', plek.x, plek.y);
    T.gezinZoektEenErf(D);
    const tekst = T.bewaarSpel(S, { nu: 1790000000000 });
    const S2 = gehucht();
    assert.equal(T.herstelSpel(S2, tekst).gelukt, true);
    const D2 = S2.dorp;
    const erf = D2.erven[0];
    assert.equal(erf.hut.wachtOpRooien, true);
    assert.equal(erf.hut.erf, erf);
    assert.equal(erf.rooienTot, D.erven[0].rooienTot);
    assert.ok(D2.gebouwen.includes(erf.hut));
    assert.equal(erf.hut.voorwerp, null);
  });
});
