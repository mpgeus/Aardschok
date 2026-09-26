// De dag (js/dag.js, sinds 26 sep): de zon per seizoen, de dagindeling, het licht, het ritme van
// de boeren, het maaien in de werkuren, slapen tot de ochtend, en bezoekers die overdag komen. Zie
// ontwerp/spel.md, "Een dorp dat leeft en groeit", en de werklijst, punt 3b.
const test = require('node:test');
const assert = require('node:assert/strict');

for (const f of [
  'js/tijd.js', 'js/dag.js', 'js/voorraad.js', 'js/wereld.js', 'beelden/beschrijving.js', 'tegels/tegels.js',
  'kaarten/kaarten.js', 'js/mensen.js', 'js/vee.js', 'js/gebouwen.js', 'js/behoeften.js', 'js/handel.js',
  'js/heer.js', 'js/inner.js', 'js/verstoppen.js', 'js/kaart.js', 'js/gebied.js', 'js/pad.js', 'js/akkers.js',
  'js/boeren.js', 'js/anim.js', 'js/verkennen.js',
]) require('../' + f);
const T = globalThis.Spel;
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
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', effecten: [], wachters: [], bezocht: new Set(), inventaris: new Set() });
  S.kalender = { dag, snelheid: snelheid || 1 };
  return S;
}
function stap(S, dt) {
  S.tijd += dt;
  const dtW = dt * T.wereldFactor(S);
  S.wereldTijd += dtW;
  T.tikKalender(S, dt);
  T.werkDagBij(S);
  T.werkAnimatiesBij(S, dt, dtW);
  T.werkOogstBij(S, dtW);
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
  loopTot(S, bijUur(GROEI, 23.5));
  for (const e of boeren(S)) {
    assert.ok(e.binnen, `${e.wie} is binnen`);
    assert.deepEqual([e.tx, e.ty], [e.thuis.x, e.thuis.y], `${e.wie} ging bij zijn eigen deur naar binnen`);
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
  const echtPad = T.zoekPad;
  T.zoekPad = (van, doel) => (van.x === doel.x && van.y === doel.y ? [] : [{ x: doel.x, y: doel.y }]);
  try {
    const dt = 0.1;
    while (S.kalender.dag < HOOI + dagen) {
      const dtW = dt * T.wereldFactor(S);
      S.wereldTijd += dtW;
      T.tikKalender(S, dt);
      T.werkOogstBij(S, dtW);
      if (boer.pad.length) {
        boer.tx = boer.x = boer.pad[0].x;
        boer.ty = boer.y = boer.pad[0].y;
        boer.pad = [];
      }
    }
  } finally {
    T.zoekPad = echtPad;
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
  T.werkOogstBij(S, 0.1);
  assert.ok(boer.maait, 'midden op de dag maait hij');
  const duur = boer.maait.tot - boer.maait.sinds;
  S.wereldTijd = duur / 3; // een derde gedaan
  S.kalender.dag = bijUur(HOOI, 23); // en dan is het nacht
  T.werkOogstBij(S, 0.1);
  assert.equal(boer.maait, null, 'hij stopt');
  assert.ok(Math.abs(akker.half.get('0,0') - duur / 3) < 1e-9, 'een derde van de tegel blijft liggen');
  assert.equal(akker.geoogst.size, 0);
  S.kalender.dag = bijUur(HOOI + 1, 9); // de volgende ochtend, aan het werk
  T.werkOogstBij(S, 0.1);
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

test('de inner komt overdag: valt zijn dag \'s nachts in, dan loopt hij pas om negen uur de kaart op, en gaat de tijd naar 1×', () => {
  const S = gehucht(bijUur(dagVan('oogstmaand', 15), 0.5), 10);
  S.schout = S.schout || null;
  berichten.length = 0;
  T.innerKomt(S, Math.floor(S.kalender.dag), false);
  T.werkInnerBij(S);
  assert.ok(S.inner.bezoek, 'hij is op komst');
  assert.equal(S.inner.bezoek.wezen, null, 'maar niet midden in de nacht');
  assert.ok(!berichten.some((b) => /komt tellen/.test(b)), 'en het bericht wacht ook');
  assert.equal(S.kalender.snelheid, 10);
  S.kalender.dag = bijUur(S.kalender.dag, IN.bezoekUur + 0.25);
  T.werkInnerBij(S);
  assert.ok(S.inner.bezoek.wezen, 'om negen uur is hij er');
  assert.ok(berichten.some((b) => /komt tellen/.test(b)));
  assert.equal(S.kalender.snelheid, 1, 'wie op 10× speelde, ziet hem op 1× komen');
});
