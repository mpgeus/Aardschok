// De dag (js/dag.js, sinds 26 sep): de zon per seizoen, de dagindeling, het licht, het ritme van
// de boeren, het maaien in de werkuren, slapen tot de ochtend, en bezoekers die overdag komen. Zie
// ontwerp/spel.md, "Een dorp dat leeft en groeit", en de werklijst, punt 3b.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const IN = T.DAG_INSTELLINGEN;

const berichten = [];
T.ui = { bericht: (t) => berichten.push(t), plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

function dagVan(maand, d) {
  const m = T.MAANDEN.findIndex((x) => x.naam === maand);
  let dag = 0;
  while (T.datumVanDag(dag).maand !== m || T.datumVanDag(dag).dagVanMaand !== d) dag++;
  return dag;
}
const ZOMER = dagVan('zomermaand', 21);
const WINTER = dagVan('wintermaand', 21);
const GROEI = dagVan('bloeimaand', 10); // het graan staat groen: de boeren staan overdag op hun akker
const HOOI = dagVan('hooimaand', 5);
const bijUur = (dag, uur) => Math.floor(dag) + uur / 24;

// Het echte gehucht, met alles wat het dagritme nodig heeft, en één beeld van de spellus zoals
// js/main.js het doet (alleen wat hier telt).
function gehucht(dag, snelheid) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  Object.assign(S.kalender, { dag, snelheid: snelheid || 1 });
  return S;
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  T.werkAnimatiesBij(S, dt, dtW);
  T.werkOogstBij(S, S.dorp, dtW);
  T.laatDwalen(S, dtW);
}
function loopTot(S, dag) {
  for (let i = 0; S.kalender.dag < dag && i < 200000; i++) stap(S, 0.05);
}
const boeren = (S) => S.wereld.wezens.filter((e) => e.werkAkkers && e.werkAkkers.length);

// ---------------------------------------------------------------------------------------------
// De zon en de dagindeling
// ---------------------------------------------------------------------------------------------

test('de zon: zestien uur licht rond 21 zomermaand, acht rond de kortste dag, twaalf in de lente', () => {
  assert.ok(Math.abs(T.zonVan(ZOMER).licht - 16.4) < 0.1, `zomer ${T.zonVan(ZOMER).licht}`);
  assert.ok(Math.abs(T.zonVan(WINTER).licht - 7.6) < 0.2, `winter ${T.zonVan(WINTER).licht}`);
  const lente = T.zonVan(dagVan('lentemaand', 21));
  assert.ok(Math.abs(lente.licht - 12) < 0.8, `lente ${lente.licht}`);
  assert.ok(Math.abs((lente.op + lente.onder) / 2 - 12) < 1e-9, 'de zon staat om twaalf uur het hoogst');
});

test('de dagindeling: in de zomer om vijf uur op en om tien uur naar bed, in de winter om half acht en half negen', () => {
  const z = T.dagindeling(ZOMER);
  assert.equal(z.opstaan, IN.opstaanVroegst, 'de zon komt vóór vijven op, maar niemand staat eerder op');
  assert.equal(z.werkBegin, z.opstaan + IN.ochtendUren);
  assert.equal(z.werkEind, IN.werkTotLaatst, 'buiten de oogst om zeven uur klaar');
  assert.ok(z.werkEindOogst > 20, 'in de oogst tot het donker');
  assert.equal(z.slapen, IN.slapenLaatst);
  const w = T.dagindeling(WINTER);
  assert.equal(w.opstaan, IN.opstaanLaatst, 'in de winter op in het donker');
  assert.ok(w.werkEind < 16.5, 'en klaar als het donker wordt');
  assert.equal(w.slapen, IN.slapenVroegst);
});

test('het deel van de dag, en in de oogst loopt het werk door tot het donker', () => {
  const deel = (uur, oogst) => T.dagdeelVan(bijUur(ZOMER, uur), oogst);
  assert.equal(deel(3), 'nacht');
  assert.equal(deel(5.5), 'ochtend');
  assert.equal(deel(9), 'werk');
  assert.equal(deel(12.5), 'schaft');
  assert.equal(deel(19.5), 'avond');
  assert.equal(deel(19.5, true), 'werk', 'in de oogst');
  assert.equal(deel(23), 'nacht');
  assert.equal(T.dagdeelVan(bijUur(WINTER, 7), false), 'nacht', 'in de winter slaapt men tot half acht');
  assert.equal(T.dagdeelVan(bijUur(WINTER, 17), false), 'avond', 'en is het om vijf uur al avond');
  assert.ok(T.isWerktijd(bijUur(ZOMER, 9)));
  assert.ok(!T.isWerktijd(bijUur(ZOMER, 12.5)), 'de schaft is geen werktijd');
});

test('het uur zoals je het zegt', () => {
  assert.equal(T.uurTekst(bijUur(0, 7)), 'zeven uur');
  assert.equal(T.uurTekst(bijUur(0, 7.5)), 'half acht');
  assert.equal(T.uurTekst(bijUur(0, 12)), 'twaalf uur');
  assert.equal(T.uurTekst(bijUur(0, 23.6)), 'half twaalf');
  assert.equal(T.uurTekst(bijUur(0, 0)), 'twaalf uur');
});

test('het licht: helder als de zon op is, donker in de nacht, en daartussen de schemering met een gloed', () => {
  const zon = T.zonVan(ZOMER);
  assert.equal(T.lichtVan(bijUur(ZOMER, 12)).donker, 0);
  assert.ok(Math.abs(T.lichtVan(bijUur(ZOMER, 0)).donker - IN.nachtDonker) < 1e-9);
  const schemer = T.lichtVan(bijUur(ZOMER, zon.onder + IN.schemerUren / 2));
  assert.ok(schemer.donker > 0 && schemer.donker < IN.nachtDonker, 'half donker in de schemering');
  assert.ok(Math.abs(T.lichtVan(bijUur(ZOMER, zon.op)).gloed - 1) < 1e-9, 'de gloed bij zonsopgang');
  assert.equal(T.lichtVan(bijUur(ZOMER, 12)).gloed, 0);
});

test('de zon voor de schaduwen: op de middag kort naar rechtsonder, \'s ochtends en \'s avonds lang naar opzij, \'s nachts geen', () => {
  const zon = T.zonVan(ZOMER);
  const z = (uur) => T.zonStand(bijUur(ZOMER, uur));
  const midden = z((zon.op + zon.onder) / 2);
  assert.ok(Math.abs(midden.x - 1) < 1e-9 && Math.abs(midden.y) < 1e-9, 'op de middag naar x+, zoals het licht van linksboven');
  assert.ok(midden.lengte < 1 && midden.sterkte === 1);
  const ochtend = z(zon.op + 1);
  const avond = z(zon.onder - 1);
  assert.ok(ochtend.y < -0.5 && avond.y > 0.5, "'s ochtends naar y-, 's avonds naar y+");
  assert.ok(ochtend.lengte > midden.lengte && ochtend.lengte <= IN.schaduwLangst, 'lager is langer, tot het langst');
  assert.equal(z(0).sterkte, 0, "'s nachts geen");
});

test('de kleur van het uur: roze bij het opkomen, neutraal overdag, oranje bij het ondergaan, blauw in de nacht', () => {
  const zon = T.zonVan(ZOMER);
  const k = (uur) => T.lichtKleurVan(bijUur(ZOMER, uur));
  const K = IN.lichtKleuren;
  const is = (c, v) => c.every((x, n) => Math.abs(x - [v.r, v.g, v.b][n] / 255) < 1e-9);
  assert.ok(is(k(12), K.dag), 'op de middag de kunst zoals hij is');
  assert.ok(is(k(0), K.nacht), "'s nachts blauw");
  assert.ok(is(k(zon.op), K.dageraad), 'bij zonsopgang roze');
  assert.ok(is(k(zon.onder), K.avondrood), 'bij zonsondergang oranje');
  const [r, g, b] = k(zon.onder + IN.schemerUren / 2);
  assert.ok(b > K.avondrood.b / 255 && b < K.nacht.b / 255 && r < 1, `in de schemering ertussen (${r}, ${g}, ${b})`);
  // Vloeiend: geen sprong van meer dan een paar procent per kwartier.
  for (let u = 0; u < 24; u += 0.25) {
    const a = k(u);
    const c = k(u + 0.25);
    assert.ok(a.every((x, n) => Math.abs(x - c[n]) < 0.2), `geen sprong om ${u} uur`);
  }
});

// ---------------------------------------------------------------------------------------------
// Het ritme van de boeren
// ---------------------------------------------------------------------------------------------

test('T.dagAnker: een boer is \'s nachts binnen, \'s ochtends en \'s avonds op zijn erf, overdag waar zijn werk is', () => {
  const e = { thuis: { x: 4, y: 5 }, werkAkkers: [{}] };
  const S = { kalender: { dag: bijUur(ZOMER, 23) } };
  assert.deepEqual(T.dagAnker(S, e), { x: 4, y: 5, straal: 0, binnen: true });
  S.kalender.dag = bijUur(ZOMER, 20);
  assert.deepEqual(T.dagAnker(S, e), { x: 4, y: 5, straal: IN.erfStraal });
  assert.equal(T.dagAnker(S, e, true), null, 'in de oogst is het dan nog werktijd');
  S.kalender.dag = bijUur(ZOMER, 10);
  assert.equal(T.dagAnker(S, e), null, 'overdag het gewone anker (zijn akker)');
  assert.equal(T.dagAnker({ kalender: { dag: bijUur(ZOMER, 23) } }, { thuis: { x: 1, y: 1 } }), null, 'wie geen akker heeft, heeft (nog) geen ritme');
  assert.equal(T.dagAnker({ kalender: { dag: bijUur(ZOMER, 23) } }, { ...e, moetNaar: { x: 9, y: 9 } }), null, 'de schandpaal gaat voor');
});

test('in het gehucht gaan de vijf boeren \'s avonds naar huis en \'s nachts naar binnen, en komen ze \'s ochtends weer naar buiten', () => {
  const S = gehucht(bijUur(GROEI, 17), 10);
  // Om twee uur 's nachts: een boer die naar de herberg ging (js/herberg.js), liep bij bedtijd naar
  // huis, en de verste doet daar ruim twee uur over (tot 27 sep stond hier half twaalf).
  loopTot(S, bijUur(GROEI + 1, 2));
  // Met zijn gezin erbij (js/bewoners.js) staat er soms iemand in zijn deur, en dan gaat hij naar
  // binnen vanaf de tegel ernaast (T.laatDwalen, js/verkennen.js).
  for (const e of boeren(S)) {
    assert.ok(e.binnen, `${e.wie} is binnen`);
    assert.ok(T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= 1, `${e.wie} ging bij zijn eigen deur naar binnen`);
  }
  assert.equal(T.wezenOp(S.wereld, boeren(S)[0].thuis.x, boeren(S)[0].thuis.y), null, 'wie binnen is, staat niemand in de weg');
  loopTot(S, bijUur(GROEI + 1, 9));
  for (const e of boeren(S)) assert.ok(!e.binnen, `${e.wie} is weer buiten`);
});

// Zonder dwalen en zonder lopen (hij staat op zijn akker, en een pad is meteen gelopen), zodat alleen
// de klok telt. Tot 26 sep stond hier het hele gehucht, en dan scheelde het soms meer dan drie
// tegels, omdat de boeren willekeurig dwalen: één keer op zo'n 35 rondes faalde de toets.
function maaiDagen(snelheid, dagen) {
  const akker = { x: 0, y: 0, b: 3, h: 3, huis: 'boer1', geoogst: new Set() };
  const boer = { tx: 0, ty: 0, x: 0, y: 0, dood: false, pad: [], werkAkkers: [akker] };
  const S = { wereld: { wezens: [boer], akkers: [akker] }, wereldTijd: 0, kalender: { dag: bijUur(HOOI, 0), snelheid }, voorraad: { graan: 0 } };
  const echtPad = T.zoekRoute;
  T.zoekRoute = (w, van, doel) => (van.x === doel.x && van.y === doel.y ? [] : [{ x: doel.x, y: doel.y }]);
  try {
    const dt = 0.1;
    while (S.kalender.dag < HOOI + dagen) {
      const dtW = dt * T.wereldFactor(S);
      S.wereldTijd += dtW;
      T.tikKalender(S, dt);
      T.werkOogstBij(S, S, dtW);
      if (boer.pad.length) {
        boer.tx = boer.x = boer.pad[0].x;
        boer.ty = boer.y = boer.pad[0].y;
        boer.pad = [];
      }
    }
  } finally {
    T.zoekRoute = echtPad;
  }
  return akker.geoogst.size;
}

test('maaien gaat op de tijd van de wereld: op 1× en op 10× precies even veel tegels', () => {
  const traag = maaiDagen(1, 3);
  assert.ok(traag >= 2, `in drie dagen maait hij een paar tegels (${traag})`);
  assert.ok(traag <= 4, `maar niet veel meer dan één per werkdag (${traag})`);
  assert.equal(maaiDagen(10, 3), traag, 'op 10× precies even veel');
});

test('\'s avonds stopt het maaien, en wat hij van een tegel al deed, blijft liggen tot de ochtend', () => {
  const akker = { x: 0, y: 0, b: 2, h: 2, huis: 'boer1', geoogst: new Set() };
  const boer = { tx: 0, ty: 0, x: 0, y: 0, dood: false, pad: [], werkAkkers: [akker] };
  const S = { wereld: { wezens: [boer], akkers: [akker] }, wereldTijd: 0, kalender: { dag: bijUur(HOOI, 15) }, voorraad: { graan: 0 } };
  T.werkOogstBij(S, S, 0.1);
  assert.ok(boer.maait, 'midden op de dag maait hij');
  const duur = boer.maait.tot - boer.maait.sinds;
  S.wereldTijd = duur / 3; // een derde gedaan
  S.kalender.dag = bijUur(HOOI, 23); // en dan is het nacht
  T.werkOogstBij(S, S, 0.1);
  assert.equal(boer.maait, null, 'hij stopt');
  assert.ok(Math.abs(akker.half.get('0,0') - duur / 3) < 1e-9, 'een derde van de tegel blijft liggen');
  assert.equal(akker.geoogst.size, 0);
  S.kalender.dag = bijUur(HOOI + 1, 9); // de volgende ochtend, aan het werk
  T.werkOogstBij(S, S, 0.1);
  assert.ok(boer.maait);
  assert.ok(Math.abs(boer.maait.tot - boer.maait.sinds - (duur * 2) / 3) < 1e-9, 'hij doet nog twee derde');
});

// ---------------------------------------------------------------------------------------------
// Slapen, en bezoekers overdag
// ---------------------------------------------------------------------------------------------

test('slapen kan \'s avonds bij je eigen huis, en bij het eerste licht word je wakker, op de snelheid van ervoor', () => {
  const S = gehucht(bijUur(GROEI, 12), 3);
  assert.ok(!T.magSlapen(S), 'niet midden op de dag');
  S.kalender.dag = bijUur(GROEI, 22);
  assert.ok(T.magSlapen(S), 'wel om tien uur, voor je deur (daar begint de schout)');
  const echt = { tx: S.schout.tx, ty: S.schout.ty };
  S.schout.tx = 2;
  S.schout.ty = 2;
  assert.ok(!T.magSlapen(S), 'niet ver van huis');
  S.schout.tx = echt.tx;
  S.schout.ty = echt.ty;
  assert.ok(T.gaSlapen(S));
  assert.equal(S.kalender.snelheid, T.SLAAP_SNELHEID);
  assert.ok(S.schout.binnen);
  loopTot(S, bijUur(GROEI + 1, 12));
  assert.equal(S.slaap, null, 'wakker');
  assert.ok(!S.schout.binnen);
  assert.equal(S.kalender.snelheid, 3, 'op de snelheid van vóór het slapen');
  assert.ok(berichten.includes('Het is ochtend.'));
});

test('een bezoeker komt op één manier: overdag, met zijn bericht één keer, en de heer en de inner zetten de tijd op 1×', () => {
  // Een los object dat als dorp dient: het is jouw dorp (geen ander dorp), en de schout staat op zijn kaart (T.naarGewoneSnelheid).
  const losDorp = (dag) => {
    const schout = {};
    return { schout, wereld: { wezens: [schout] }, kalender: { dag, snelheid: 10 } };
  };
  const D = losDorp(bijUur(GROEI, 3));
  berichten.length = 0;
  const bezoek = { aankomst: { tekst: 'Er komt iemand over de weg.', soort: 'gevaar', naarGewoon: true } };
  assert.equal(T.bezoekerKomtAan(D, bezoek), false, 'om drie uur \'s nachts nog niet');
  assert.deepEqual(berichten, []);
  D.kalender.dag = bijUur(GROEI, IN.bezoekUur + 0.25);
  assert.equal(T.bezoekerKomtAan(D, bezoek), true, 'vanaf het bezoekuur wel');
  assert.equal(T.bezoekerKomtAan(D, bezoek), true, 'en daarna blijft hij er');
  assert.deepEqual(berichten, ['Er komt iemand over de weg.'], 'het bericht één keer');
  assert.equal(D.kalender.snelheid, 1, 'van 10× naar 1×');
  // Wie meteen komt (Spel.debug, of er is geen weg de kaart op), wacht niet op de ochtend; en
  // zonder naarGewoon (de marskramer) blijft de snelheid zoals de speler hem zette.
  const nacht = losDorp(bijUur(GROEI, 3));
  assert.equal(T.bezoekerKomtAan(nacht, { meteen: true, aankomst: { tekst: 'De marskramer.', soort: 'goed' } }), true);
  assert.equal(nacht.kalender.snelheid, 10);
  assert.equal(T.bezoekerKomtAan(nacht, null), false, 'geen bezoek, niemand die komt');
});

test('de inner komt overdag: valt zijn dag \'s nachts in, dan loopt hij pas om negen uur de kaart op, en gaat de tijd naar 1×', () => {
  const S = gehucht(bijUur(dagVan('oogstmaand', 15), 0.5), 10);
  S.schout = S.schout || null;
  berichten.length = 0;
  T.innerKomt(S.dorp, Math.floor(S.kalender.dag), false);
  T.werkInnerBij(S, S.dorp);
  assert.ok(S.dorp.inner.bezoek, 'hij is op komst');
  assert.equal(S.dorp.inner.bezoek.wezen, null, 'maar niet midden in de nacht');
  assert.ok(!berichten.some((b) => /komt tellen/.test(b)), 'en het bericht wacht ook');
  assert.equal(S.kalender.snelheid, 10);
  S.kalender.dag = bijUur(S.kalender.dag, IN.bezoekUur + 0.25);
  T.werkInnerBij(S, S.dorp);
  assert.ok(S.dorp.inner.bezoek.wezen, 'om negen uur is hij er');
  assert.ok(berichten.some((b) => /komt tellen/.test(b)));
  assert.equal(S.kalender.snelheid, 1, 'wie op 10× speelde, ziet hem op 1× komen');
});
