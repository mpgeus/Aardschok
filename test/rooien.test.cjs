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
    const hut = T.gezinZoektEenErf(D);
    assert.equal(hut && hut.erf, erf);
    assert.equal(hut.wachtOpRooien, true);
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
