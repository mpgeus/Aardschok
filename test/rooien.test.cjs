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
// Net zo voor een werkplaats: de plek die het dichtst bij het plein ligt en na het rooien past, met zoveel bomen op zijn
// stuk (de voet met het looppad, T.kavelVan) als `wil` vraagt.
function werkplaatsPlek(S, soort, wil) {
  const D = S.dorp;
  const plein = T.pleinVan(S.wereld);
  const voet = T.gebouwVoet(soort, T.volgendeTekening(D, soort));
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x - plein.x, y - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  for (const p of plekken) {
    const kavel = T.kavelVan(D, p.x, p.y, voet);
    if (wil(T.watTeRooien(D, kavel).bomen) && !T.waaromPastHetNiet(D, soort, p.x, p.y, null, kavel)) return { x: p.x, y: p.y, rooien: kavel };
  }
  return null;
}
// Net zo, maar naar wat het gezin er rooit: het erf met het looppad om de hut (T.kavelVanErf), voldoet aan `f(lijst)` met
// de tegels waar iets te rooien staat.
function erfPlekWaarHetRooit(S, f) {
  const plein = T.pleinVan(S.wereld);
  const plekken = [];
  for (let y = 0; y < S.wereld.tegels.length; y++) {
    for (let x = 0; x < S.wereld.tegels[0].length; x++) plekken.push({ x, y, d: Math.hypot(x + 5 - plein.x, y + 5 - plein.y) });
  }
  plekken.sort((a, b) => a.d - b.d);
  const maat = T.erfMaat();
  return plekken.find((p) => !T.waaromPastErfNiet(S.dorp, p.x, p.y) && f(T.teRooienOp(S.dorp, T.kavelVanErf(S.dorp, { x: p.x, y: p.y, b: maat.b, h: maat.h })))) || null;
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
    assert.ok(T.watTeRooien(S.dorp, r).bomen > 0 && T.watTeRooien(S.dorp, r).bomen < BOS());
    assert.equal(T.inHetBosVanDeHeer(S.dorp, r), false);
    // De muis telt wat het gezin rooit: het erf, en het looppad om de hut, ook buiten het erf.
    const kavel = T.kavelVanErf(S.dorp, r);
    assert.ok(kavel.x <= r.x && kavel.y <= r.y && kavel.x + kavel.b >= r.x + r.b && kavel.y + kavel.h >= r.y + r.h, 'het erf ligt erin');
    const wat = T.watTeRooien(S.dorp, kavel);
    assert.match(T.rooiTekst(S.dorp, r), new RegExp(`rooit eerst .*\\(\\+${wat.bomen * T.BOS_INSTELLINGEN.houtPerBoom} hout\\)`));
    assert.doesNotMatch(T.rooiTekst(S.dorp, r), /bos van de heer/);
    // Water houdt een erf nog altijd tegen.
    const water = [];
    for (let y = 0; y < w.tegels.length; y++) for (let x = 0; x < w.tegels[0].length; x++) if (w.grond[y][x] && w.grond[y][x].naam === 'water') water.push({ x, y });
    assert.ok(water.length, 'het gehucht heeft water');
    assert.ok(water.every((t) => T.waaromPastErfNiet(S.dorp, t.x - 4, t.y - 4)), 'geen erf over het water');
    // Een erf waar niets te rooien is, ook niet om de hut: de muis zegt niets.
    const vrij = erfPlekWaarHetRooit(S, (lijst) => lijst.length === 0);
    assert.ok(vrij, 'er is een plek waar niets te rooien is');
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
    assert.equal(hut.rooienTot, Math.floor(S.kalender.dag) + T.BOS_INSTELLINGEN.rooiDagen);
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
    T.tikRooienDag(D);
    assert.equal(hut.wachtOpRooien, true);
    // Het gezin rooit alles (zoals js/veldwerk.js het doet): het erf, en het looppad om de hut. Elke boom geeft hout.
    assert.deepEqual(hut.kavel, T.kavelVanErf(D, erf));
    const bomen = T.watTeRooien(D, hut.kavel).bomen;
    for (const t of T.teRooienOp(D, hut.kavel)) {
      if (T.ontginWerkOp(S.wereld, t.x, t.y) === 'hakken') assert.ok(T.hakBoom(D, t.x, t.y));
      assert.ok(T.rooi(D, t.x, t.y));
    }
    assert.equal(D.voorraad.hout, hout + bomen * T.BOS_INSTELLINGEN.houtPerBoom);
    // De volgende dag ligt de bouwplaats er, en begint hij met het hout.
    S.kalender.dag = 1;
    T.tikRooienDag(D);
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, false);
    assert.ok(hut.voorwerp, 'de bouwplaats ligt op de kaart');
    assert.equal(hut.wachtOpHout, false);
    assert.equal(hut.klaarOp, 1 + T.GEBOUWEN.hut.bouwtijd);
    assert.equal(D.voorraad.hout, hout + bomen * T.BOS_INSTELLINGEN.houtPerBoom - T.GEBOUWEN.hut.kosten.hout);
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
    const bomen = T.watTeRooien(D, hut.kavel).bomen;
    const hout = D.voorraad.hout;
    S.kalender.dag = hut.rooienTot - 1;
    T.tikRooienDag(D);
    assert.equal(hut.wachtOpRooien, true, 'de dag ervoor nog niet');
    S.kalender.dag = hut.rooienTot;
    T.tikRooienDag(D);
    T.tikErvenDag(D);
    assert.equal(hut.wachtOpRooien, false);
    assert.equal(T.teRooienOp(D, hut.kavel).length, 0, 'het erf en het looppad om de hut zijn leeg');
    assert.ok(hut.voorwerp);
    assert.equal(D.voorraad.hout, hout + bomen * T.BOS_INSTELLINGEN.houtPerBoom - T.GEBOUWEN.hut.kosten.hout);
  });
});

test('het looppad om de hut mag buiten het erf in het bos liggen: het gezin rooit het mee', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const w = S.wereld;
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    const maat = T.erfMaat();
    // Een plek die pas past sinds het looppad om de hut buiten het erf gerooid mag worden (tot de speeltest van 6 okt
    // telde een boom daar als in de weg).
    let erf = null;
    let huis = null;
    for (let y = 0; y < w.tegels.length && !erf; y++) {
      for (let x = 0; x < w.tegels[0].length && !erf; x++) {
        if (T.waaromPastErfNiet(D, x, y)) continue;
        const r = { x, y, b: maat.b, h: maat.h };
        const k = T.kavelVanErf(D, r);
        const buiten = T.teRooienOp(D, k).filter((t) => t.x < x || t.y < y || t.x >= x + maat.b || t.y >= y + maat.h);
        if (!buiten.length) continue;
        const u = T.legErfAan(D, x, y);
        assert.ok(u.gelukt, u.reden);
        const p = u.erf.plan;
        const h = { x: x + p.dx, y: y + p.dy, b: p.b, h: p.h };
        if (T.looppadOm(D, h, n, u.erf)) {
          T.haalErfWeg(D, u.erf); // dit erf paste ook al zonder buiten het erf te rooien
          continue;
        }
        erf = u.erf;
        huis = h;
      }
    }
    assert.ok(erf, 'er is zo een plek');
    vol(S);
    const berichten = [];
    const ui = T.ui;
    T.ui = new Proxy({}, { get: (_, k) => (k === 'bericht' ? (t) => berichten.push(t) : () => undefined) });
    let hut;
    try {
      hut = T.gezinZoektEenErf(D);
    } finally {
      T.ui = ui;
    }
    assert.equal(hut && hut.erf, erf);
    assert.equal(hut.wachtOpRooien, true);
    // Het bericht telt ook wat er in het looppad buiten het erf staat (tot 6 okt: "rooit eerst zijn erf: .").
    const wat = T.watTeRooien(D, hut.kavel);
    const opHetErf = T.watTeRooien(D, erf);
    assert.ok(wat.bomen + wat.struiken > opHetErf.bomen + opHetErf.struiken, 'buiten het erf staat meer');
    assert.ok(berichten.includes(`Het gezin van ${D.bewoners.mensen.find((p) => p.huis === hut).naam} rooit eerst zijn erf: ${T.rooiWoorden(wat)}.`), berichten.join(' | '));
    assert.ok(hut.kavel.x < erf.x || hut.kavel.y < erf.y || hut.kavel.x + hut.kavel.b > erf.x + erf.b || hut.kavel.y + hut.kavel.h > erf.y + erf.h, 'het stuk is groter dan het erf');
    for (const t of T.teRooienOp(D, hut.kavel)) {
      if (T.ontginWerkOp(w, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y);
      T.rooi(D, t.x, t.y);
    }
    assert.ok(T.looppadOm(D, huis, n), 'het looppad om de hut is vrij');
    S.kalender.dag = Math.floor(S.kalender.dag) + 1;
    T.tikRooienDag(D);
    assert.equal(hut.wachtOpRooien, false);
    assert.ok(hut.voorwerp, 'de bouwplaats ligt er');
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
        if (T.waaromPastErfNiet(D, x, y) || T.teRooienOp(D, { x, y, b: maat.b, h: maat.h }).length) continue;
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
    const plek = erfPlekWaarHetRooit(S, (lijst) => lijst.length >= 1 && lijst.length <= 3 && lijst.some((t) => T.ontginWerkOp(S.wereld, t.x, t.y) === 'hakken'));
    assert.ok(plek, 'een erf met een boom en weinig meer te rooien');
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
    assert.equal(T.teRooienOp(D, erf).length, 0);
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
    assert.equal(erf.hut.rooienTot, D.erven[0].hut.rooienTot);
    assert.ok(D2.gebouwen.includes(erf.hut));
    assert.equal(erf.hut.voorwerp, null);
  });
});

// Stap 2: een werkplaats waar geen open grond meer is (js/verzoeken.js, js/bos.js).

test('een plek om te rooien voor een werkplaats: met zo weinig mogelijk bomen, en hij past pas na het rooien', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const bij = erfPlek(S, (n) => n >= BOS());
    const plek = T.plekOmTeRooien(D, 'weverij', { x: bij.x + 5, y: bij.y + 5 });
    assert.ok(plek, 'er is een plek om te rooien');
    assert.ok(plek.rooien, 'met het stuk dat eerst vrij moet');
    assert.ok(T.teRooienOp(D, plek.rooien).length > 0, 'daar staat iets te rooien');
    assert.ok(T.waaromPastHetNiet(D, 'weverij', plek.x, plek.y), 'zonder rooien past hij niet');
    assert.equal(T.waaromPastHetNiet(D, 'weverij', plek.x, plek.y, null, plek.rooien), null, 'na het rooien wel');
    // Het stuk is de voet met het looppad eromheen.
    const voet = T.gebouwVoet('weverij', T.volgendeTekening(D, 'weverij'));
    const n = T.GEBOUWEN_INSTELLINGEN.looppad;
    assert.deepEqual(plek.rooien, T.kavelVan(D, plek.x, plek.y, voet));
    assert.ok(plek.rooien.b <= voet.b + 2 * n && plek.rooien.h <= voet.h + 2 * n);
  });
});

test('een put op een plek om te rooien bereikt een huis dat er nog geen heeft, hoe ver wie hem vraagt ook woont; mist niemand er een, dan geen plek', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const voet = T.gebouwVoet('put', T.volgendeTekening(D, 'put'));
    const kring = T.kringTeller(D, 'put');
    // In de speeltest van 6 okt koos hij de plek met de minste bomen bij het hart van het dorp, en kwam er elke maand een
    // put die niemand bereikte.
    for (const bij of [{ x: 0, y: 0 }, { x: S.wereld.b - 1, y: S.wereld.h - 1 }]) {
      const plek = T.plekOmTeRooien(D, 'put', bij);
      assert.ok(plek, 'er is een plek om te rooien');
      assert.ok(kring({ x: plek.x, y: plek.y, b: voet.b, h: voet.h }).zonder > 0, `${plek.x},${plek.y} bereikt een huis zonder put`);
    }
    // Bereikt de put die er staat iedereen, dan is er geen plek: niemand mist er een.
    const oud = T.WENSEN_INSTELLINGEN.kring.put;
    T.WENSEN_INSTELLINGEN.kring.put = 200;
    try {
      assert.equal(T.plekOmTeRooien(D, 'put', { x: 0, y: 0 }), null);
    } finally {
      T.WENSEN_INSTELLINGEN.kring.put = oud;
    }
  });
});

test('ja kost de gunst die de prijs noemde: een plek die bij de vraag niet in het bos van de heer lag, kost niets', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    T.zetVoorraad(D, 'hout', 100);
    T.zetVoorraad(D, 'goud', 100);
    // Een plek in het bos, maar bij de vraag (zeg: voordat een boompje een boom werd) gold hij als wei.
    const plek = werkplaatsPlek(S, 'weverij', (n) => n >= BOS());
    const wie = D.bewoners.mensen.find((p) => p.leeftijd === 'volwassen' && !T.isBoer(p.wezen) && !p.schout);
    const L = { wie, bouw: { soort: 'weverij', x: plek.x, y: plek.y, waarom: 'Het dorp wil laken.', rooien: plek.rooien, bos: false } };
    D.voorvallen = D.voorvallen || T.nieuweVoorvallen();
    D.voorvallen.lopend = L;
    assert.doesNotMatch(T.prijsVanKeuze(D, { bouw: true }).tekst, /gunst/, 'de prijs noemt geen gunst');
    const gunst = T.bazenNu(D).gunst;
    T.verzoekToegestaan(D, L);
    assert.ok(D.gebouwen.some((g) => g.soort === 'weverij' && g.wachtOpRooien), 'de werkplaats wacht op het rooien');
    assert.equal(T.bazenNu(D).gunst, gunst, 'en het kostte geen gunst');
  });
});

test('ja op een werkplaats in het bos: hij wacht, nog niet op de kaart; wie hem vroeg, rooit en werkt nergens; dan de bouw', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    T.zetVoorraad(D, 'hout', 100);
    T.zetVoorraad(D, 'goud', 100);
    const plek = werkplaatsPlek(S, 'weverij', (n) => n >= BOS());
    assert.ok(plek, 'er is een plek in het bos');
    assert.ok(T.inHetBosVanDeHeer(D, plek.rooien));
    const wie = D.bewoners.mensen.find((p) => p.leeftijd === 'volwassen' && !T.isBoer(p.wezen) && !p.schout);
    assert.ok(wie, 'er is iemand die het vraagt');
    const L = { wie, bouw: { soort: 'weverij', x: plek.x, y: plek.y, waarom: 'Het dorp wil laken.', rooien: plek.rooien, bos: true } };
    D.voorvallen = D.voorvallen || T.nieuweVoorvallen();
    D.voorvallen.lopend = L;
    // Hij zegt waar, en wat hij er eerst rooit, in het bos van de heer; en de prijs noemt zijn gunst.
    assert.match(T.GESPREK_WOORDEN.plek(D), /waar ik eerst .* rooi, in het bos van de heer/);
    assert.match(T.prijsVanKeuze(D, { bouw: true }).tekst, new RegExp(`gunst van de heer −${T.ONTGINNEN_INSTELLINGEN.gunst}`));
    const gunst = T.bazenNu(D).gunst;
    const hout = D.voorraad.hout;
    T.verzoekToegestaan(D, L);
    const g = D.gebouwen.find((x) => x.soort === 'weverij');
    assert.ok(g, 'de weverij is er');
    assert.equal(g.wachtOpRooien, true);
    assert.equal(g.voorwerp, null, 'nog niet op de kaart');
    assert.equal(g.klaarOp, null);
    assert.match(T.gebouwToestand(D, g), /eerst wordt de plek gerooid/);
    assert.equal(g.meester, wie);
    assert.equal(wie.rooit, g);
    assert.equal(D.voorraad.hout, hout - T.GEBOUWEN.weverij.kosten.hout, 'de kosten gaan er meteen af, zoals bij elk verzoek');
    assert.equal(T.bazenNu(D).gunst, gunst - T.ONTGINNEN_INSTELLINGEN.gunst);
    T.wijsWerkToe(D);
    assert.equal(wie.werk, null, 'wie rooit, werkt nergens');
    assert.equal(T.rooitHij(wie), g);
    // Hij rooit alles; de volgende dag begint de bouw.
    for (const t of T.teRooienOp(D, g.kavel)) {
      if (T.ontginWerkOp(S.wereld, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y);
      T.rooi(D, t.x, t.y);
    }
    S.kalender.dag = 1;
    T.tikRooienDag(D);
    assert.equal(g.wachtOpRooien, false);
    assert.ok(g.voorwerp, 'de bouwplaats ligt er');
    assert.equal(g.klaarOp, 1 + T.GEBOUWEN.weverij.bouwtijd);
    assert.equal(wie.rooit, undefined);
    assert.equal(T.rooitHij(wie), null);
  });
});

// Doorgroeien (werklijst vraag 130; Marcel, 6 okt: "Ok"): op land 62707 van de maker staat de hut van een oud stel waar
// het kleinste huis dat hij kan worden, één struik in de weg heeft. In de speeltest van vier jaar had die hut 1349 dagen
// alles en groeide hij nooit, en won daarom geen dorp. Nu rooit het gezin wat in de weg staat, en dan groeit hij.
function landVanDeMaker(zaad) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  T.S = S;
  return S;
}
// Een nacht, met genoeg graan en hout: zo heeft wie er woont te eten en te stoken.
function nachtMetGenoeg(S, dag) {
  T.zetVoorraad(S.dorp, 'graan', 2000);
  if (S.dorp.voorraad.hout < 300) T.zetVoorraad(S.dorp, 'hout', 300);
  S.kalender.dag = dag + 0.3;
  S.kalender.stil = [];
  T.tikGebouwenDag(S.dorp, dag);
}
// De hut van het oude stel, met een put erbij: dan heeft hij alles.
function hutMetAlles(S) {
  const D = S.dorp;
  const hut = D.gebouwen.find((g) => g.soort === 'hut' && D.bewoners.mensen.some((p) => p.huis === g) && T.groeiRooiPlan(D, g));
  assert.ok(hut, 'een bewoonde hut die eerst moet rooien');
  const plek = T.plekVoor(D, 'put', T.deurVan(D.wereld, hut));
  assert.ok(plek, 'er is een plek voor een put');
  const u = T.plaatsGebouw(D, 'put', plek.x, plek.y);
  assert.ok(u.gelukt, u.reden);
  return hut;
}

test('een hut die alles heeft maar niet past, rooit eerst wat in de weg staat, en groeit dan (vraag 130)', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9; // geen nieuwe gezinnen: die lopen hier niet binnen
    try {
      const S = landVanDeMaker(62707);
      const D = S.dorp;
      const hut = hutMetAlles(S);
      const plan = T.groeiRooiPlan(D, hut);
      const struiken = T.teRooienOp(D, plan);
      assert.ok(struiken.length >= 1, 'er staat iets te rooien');
      const hoofd = D.bewoners.mensen.find((p) => p.huis === hut && !p.hoofd);
      let dag = 1;
      // Een maand alles: dan wil hij groeien, maar het past niet, en het gezin gaat rooien.
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      assert.ok(hut.groeitNaRooien, `het gezin rooit (dag ${dag})`);
      assert.equal(hut.soort, 'hut', 'nog een hut');
      assert.deepEqual(hut.kavel, plan, 'het stuk dat vrij moet: de nieuwe voet');
      assert.equal(T.rooitHij(hoofd), hut, 'het hoofd van het gezin rooit');
      assert.match(T.waaromGroeitHetNiet(D, hut), /het gezin rooit eerst/);
      assert.match(T.huisToestand(D, hut).groei.waarom, /rooit eerst/);
      // Wie er staat te rooien: zijn de struiken weg, dan de volgende nacht klaar, en daarna groeit hij.
      for (const t of struiken) {
        if (T.ontginWerkOp(D.wereld, t.x, t.y) === 'hakken') T.hakBoom(D, t.x, t.y);
        T.rooi(D, t.x, t.y);
      }
      nachtMetGenoeg(S, dag++);
      assert.equal(hut.groeitNaRooien, undefined, 'klaar met rooien');
      assert.equal(T.rooitHij(hoofd), null);
      nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', 'de hut is een huis geworden');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('rooit niemand het, dan doen de buren de rest na een maand; staat er iets wat niet te rooien is, dan zegt het briefje het', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      const S = landVanDeMaker(62707);
      const D = S.dorp;
      const hut = hutMetAlles(S);
      let dag = 1;
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      const tot = hut.rooienTot;
      assert.equal(tot, dag - 1 + T.BOS_INSTELLINGEN.rooiDagen);
      // Hier tikken alleen de nachten: niemand rooit, tot de maand om is.
      while (hut.soort === 'hut' && dag < tot + 5) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', `na een maand rooien de buren, en groeit hij (dag ${dag}, tot ${tot})`);

      // Een ander land, dezelfde hut, maar met een rots waar elke vorm van het huis komt: niets te rooien, dus geen plan,
      // en het briefje zegt waarom.
      const S2 = landVanDeMaker(62707);
      const D2 = S2.dorp;
      const hut2 = hutMetAlles(S2);
      const plan = T.groeiRooiPlan(D2, hut2);
      const oud = hut2.voet || T.gebouwVoet(hut2.soort, hut2.tekening);
      const x = hut2.x + 1;
      const y = hut2.y + oud.h; // net onder de hut, in elke grotere vorm
      assert.ok(y < plan.y + plan.h);
      const t = T.opzoekTegelNaam('rots');
      const rots = { soort: 'rots', x, y, vel: t.vel, id: t.id, beslaat: [1, 1] };
      T.kenSoortVan(rots);
      const daar = T.voorwerpOp(D2.wereld, x, y);
      if (daar) T.haalVoorwerpWeg(D2.wereld, daar);
      T.zetVoorwerp(D2.wereld, rots);
      D2.wereld.tegels[y][x] = 'muur';
      T.kaartVeranderd(D2.wereld);
      assert.equal(T.groeiRooiPlan(D2, hut2), null, 'een rots rooit niemand');
      let dag2 = 1;
      while (dag2 < 60) nachtMetGenoeg(S2, dag2++);
      assert.equal(hut2.soort, 'hut');
      assert.ok(!hut2.groeitNaRooien);
      assert.match(T.waaromGroeitHetNiet(D2, hut2), /er staat een rots waar het groter moet worden/);
      assert.match(T.huisToestand(D2, hut2).groei.waarom, /een rots/);
      // Is het hout een dag op, dan wacht hij nog steeds op plaats, niet op hout: in de speeltest van 6 okt bleef een hut
      // die door een erf niet kon groeien, zo drie jaar "wachten op 8 hout".
      T.zetVoorraad(D2, 'hout', 0);
      T.zetVoorraad(D2, 'graan', 2000);
      S2.kalender.dag = dag2 + 0.3;
      S2.kalender.stil = [];
      T.tikGebouwenDag(D2, dag2++);
      assert.ok(!hut2.wachtOpBouwstof, 'hij wacht niet op hout');
      assert.notEqual(T.huisToestand(D2, hut2).teken, 'bouwstof');
      assert.match(T.huisToestand(D2, hut2).groei.waarom, /een rots/);
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

// Vraag 130, wat Marcel er in de zevenendertigste sessie bij koos ("Eens alle 3"): a2, het gezin kapt ook zijn eigen
// appelboom; c2, de raad zegt het als een huis dat alles heeft, niet kan groeien; d, een erf komt niet waar het een huis
// elke vorm afneemt.

test('a2: een appelboom is van iemand, maar staat hij waar het huis groter wordt, dan kapt het gezin hem, voor 10 hout', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      // Op land 7777 staat een hut waar alleen een appelboom in de weg staat, bij elke vorm van het huis.
      const S = landVanDeMaker(7777);
      const D = S.dorp;
      vol(S);
      const hut = hutMetAlles(S);
      const plan = T.groeiRooiPlan(D, hut);
      const appels = [];
      for (let y = plan.y; y < plan.y + plan.h; y++) {
        for (let x = plan.x; x < plan.x + plan.b; x++) if (T.isEigenBoom(T.voorwerpOp(D.wereld, x, y))) appels.push({ x, y });
      }
      assert.ok(appels.length >= 1, 'een appelboom waar het huis groter wordt');
      const a = appels[0];
      const appel = T.voorwerpOp(D.wereld, a.x, a.y);
      assert.equal(T.ontginWerkOp(D.wereld, a.x, a.y), null, 'wie ontgint of een erf rooit, laat hem staan');
      assert.equal(T.hakBoom(D, a.x, a.y), false, 'en omhakken kan niet');
      let dag = 1;
      while (!hut.groeitNaRooien && dag < 80) nachtMetGenoeg(S, dag++);
      assert.ok(hut.groeitNaRooien, 'het gezin rooit');
      assert.equal(appel.teKappen, true);
      assert.equal(T.ontginWerkOp(D.wereld, a.x, a.y), 'hakken', 'nu is hij een boom als elke andere');
      assert.match(T.waaromGroeitHetNiet(D, hut), /één boom/);
      const hout = D.voorraad.hout;
      assert.equal(T.hakBoom(D, a.x, a.y), true);
      assert.equal(D.voorraad.hout - hout, T.BOS_INSTELLINGEN.houtPerBoom);
      T.rooi(D, a.x, a.y);
      while (hut.soort === 'hut' && dag < 80 + T.BOS_INSTELLINGEN.rooiDagen) nachtMetGenoeg(S, dag++);
      assert.equal(hut.soort, 'huis', 'en de hut groeit');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('a2: woont er niemand meer in het huis dat zou groeien, dan is de appelboom weer van iemand', () => {
  zo(() => {
    const S = landVanDeMaker(7777);
    const D = S.dorp;
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && T.groeiRooiPlan(D, g));
    const plan = T.groeiRooiPlan(D, hut);
    T.rooiOmTeGroeien(D, hut, plan);
    const appels = [];
    for (let y = plan.y; y < plan.y + plan.h; y++) {
      for (let x = plan.x; x < plan.x + plan.b; x++) {
        const v = T.voorwerpOp(D.wereld, x, y);
        if (T.isEigenBoom(v)) appels.push(v);
      }
    }
    assert.ok(appels.length && appels.every((v) => v.teKappen));
    S.kalender.dag = 1.3;
    T.tikRooienDag(D); // er woont niemand in deze hut
    assert.ok(!hut.groeitNaRooien);
    assert.ok(appels.every((v) => !v.teKappen && T.voorwerpOp(D.wereld, v.x, v.y) === v), 'hij staat er nog, en is weer van iemand');
  });
});

test('c2: heeft een huis alles maar kan het niet groeien, dan zegt de raad het, zodra het genoeg mensen is voor de winst', () => {
  zo(() => {
    const gezinDagen = T.GEBOUWEN_INSTELLINGEN.gezinDagen;
    T.GEBOUWEN_INSTELLINGEN.gezinDagen = 1e9;
    try {
      const S = landVanDeMaker(62707);
      const D = S.dorp;
      const raad = T.RADEN.find((r) => r.id === 'groeitNiet');
      const hut = hutMetAlles(S);
      // Een muur op alle grond waar de hut kan groeien: dan kan hij niet, ook niet na het rooien.
      for (const h of T.groeiGrond(D).filter((h) => h.g === hut)) {
        for (const v of h.vormen) for (const t of v) if (!T.voorwerpOp(D.wereld, t.x, t.y)) D.wereld.tegels[t.y][t.x] = 'muur';
      }
      T.kaartVeranderd(D.wereld);
      assert.equal(T.groeiRooiPlan(D, hut), null);
      let dag = 1;
      while (dag < 40) nachtMetGenoeg(S, dag++);
      assert.ok(hut.wensen.alles, 'hij heeft alles');
      assert.equal(hut.soort, 'hut');
      while (T.volgendeTrede(D)) D.trede = T.volgendeTrede(D);
      D.bevolking = T.EINDE_INSTELLINGEN.minstensMensen - 1;
      assert.ok(!raad.als(D), 'nog niet genoeg mensen: dan zegt de raad wat er nog komt');
      D.bevolking = T.EINDE_INSTELLINGEN.minstensMensen;
      assert.ok(raad.als(D));
      assert.match(raad.tekst(D), /^Genoeg mensen voor de winst, maar de hut van \S+ kan geen huis worden: er staat \S+ \S+ waar het groter moet worden\.$/);
      hut.wensen.alles = false;
      assert.ok(!raad.als(D), 'een huis dat iets mist, wacht daar eerst op');
    } finally {
      T.GEBOUWEN_INSTELLINGEN.gezinDagen = gezinDagen;
    }
  });
});

test('d: geen erf waar het een huis elke vorm afneemt; wel als het nog een andere vorm kan nemen', () => {
  zo(() => {
    const S = landVanDeMaker(62707);
    const D = S.dorp;
    let geweigerd = null;
    for (let y = 0; y < S.wereld.tegels.length && !geweigerd; y++) {
      for (let x = 0; x < S.wereld.tegels[0].length && !geweigerd; x++) {
        const reden = T.waaromPastErfNiet(D, x, y);
        if (reden && reden.startsWith('Hier groeit')) geweigerd = { x, y, reden };
      }
    }
    assert.ok(geweigerd, 'naast een hut die nog moet groeien, komt geen erf');
    assert.match(geweigerd.reden, /^Hier groeit (de hut van \S+|een hut) straks tot een huis\.$/);
    assert.equal(T.legErfAan(D, geweigerd.x, geweigerd.y).gelukt, false);
    // Het ontworpen gehucht: een erf op 48, 50 neemt de hut ernaast een paar vormen af, maar niet alle. Dat mag, en de hut
    // kan daarna nog groeien.
    const S2 = gehucht();
    const D2 = S2.dorp;
    const maat = T.erfMaat();
    const buur = T.groeiGrond(D2).find((h) => h.vormen.some((v) => v.some((t) => t.x >= 48 && t.x < 48 + maat.b && t.y >= 50 && t.y < 50 + maat.h)));
    assert.ok(buur, 'het erf raakt de grond van een hut');
    assert.equal(T.waaromPastErfNiet(D2, 48, 50), null);
    assert.ok(T.legErfAan(D2, 48, 50).gelukt);
    assert.ok(T.groeiGrond(D2).some((h) => h.g === buur.g), 'de hut kan nog groeien');
  });
});

test('a2: de eigen appelboom gaat alleen om als geen vorm zonder hem kan (Marcel: "A")', () => {
  zo(() => {
    const S = gehucht();
    const D = S.dorp;
    const w = S.wereld;
    // De hut op 44, 44 in het ontworpen gehucht groeit naar rechts (x 50) of naar onder (y 50), elk een eigen vorm.
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && g.x === 44 && g.y === 44);
    assert.ok(hut, 'de hut op 44, 44');
    const zet = (soort, x, y) => {
      const t = T.opzoekTegelNaam(soort);
      const v = { soort, x, y, vel: t.vel, id: t.id, beslaat: [1, 1] };
      T.kenSoortVan(v);
      const daar = T.voorwerpOp(w, x, y);
      if (daar) T.haalVoorwerpWeg(w, daar);
      T.zetVoorwerp(w, v);
      w.tegels[y][x] = 'muur';
      T.kaartVeranderd(w);
    };
    zet('appelboom', 50, 46); // rechts: één appelboom
    zet('struik', 45, 50); // onder: twee struiken
    zet('struik', 47, 50);
    const plan = T.groeiRooiPlan(D, hut);
    assert.ok(plan, 'het gezin kan rooien');
    const appelErin = plan.x <= 50 && 50 < plan.x + plan.b && plan.y <= 46 && 46 < plan.y + plan.h;
    assert.ok(!appelErin, 'twee struiken liever dan zijn appelboom');
    assert.deepEqual(T.teRooienOp(D, plan).map((t) => `${t.x},${t.y}`).sort(), ['45,50', '47,50']);
    // Ligt er onder een rots, dan kan het niet anders: dan gaat de appelboom om.
    zet('rots', 46, 50);
    const nu = T.groeiRooiPlan(D, hut);
    assert.ok(nu && nu.x <= 50 && 50 < nu.x + nu.b && nu.y <= 46 && 46 < nu.y + nu.h, 'nu de vorm met de appelboom');
  });
});

// (Een erf in de hand loot wel, maar dat deed het al: T.waaromPastErfNiet kiest de hut en het huis voor het erf;
// opmerkingen.md.)
test('wat het briefje, de raad en de grond om te groeien vragen, loot geen volgende tekening (het spel loopt niet anders naar de muis)', () => {
  zo(() => {
    const S = landVanDeMaker(62707);
    const D = S.dorp;
    const hut = D.gebouwen.find((g) => g.soort === 'hut' && T.groeiRooiPlan(D, g, false));
    hut.groeiDagen = T.BEHOEFTEN_INSTELLINGEN.huisGroeiDagen;
    if (D.volgendeTekening) delete D.volgendeTekening.huis;
    const toeval = Math.random;
    Math.random = () => {
      throw new Error('geloot');
    };
    try {
      T.waaromGroeitHetNiet(D, hut);
      T.groeiRooiPlan(D, hut, false);
      T.groeiGrond(D);
    } finally {
      Math.random = toeval;
    }
    assert.ok(!D.volgendeTekening || D.volgendeTekening.huis === undefined, 'er is geen huis geloot');
  });
});
