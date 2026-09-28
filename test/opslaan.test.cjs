// Opslaan en laden (js/opslaan.js; werklijst punt 3, vraag 48; Marcel, 28 sep: "Auto opslaan, maar ook zelf
// kunnen kiezen"). Het spel bewaart heel Spel.S behalve het scherm, en een geladen spel moet precies het spel
// zijn dat bewaard werd: met zijn verzamelingen, en met alles wat elkaar aanwijst nog aan elkaar vast.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

T.ui = { bericht() {}, plek() {}, toonKalender() {}, toonVoorraad() {}, toonBevolking() {}, toonInventaris() {}, toonArgwaan() {} };

// Het echte gehucht, zoals een nieuw spel begint, stil en zonder venster.
function gehucht() {
  const echt = console.warn;
  console.warn = () => {};
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0 };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender = T.nieuweKalender();
  return S;
}

// Een opslag zoals die van de browser, maar in het geheugen. `vol`: er past niets meer bij.
function nepOpslag({ vol = false } = {}) {
  const m = new Map();
  return {
    m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => {
      if (vol) throw new Error('QuotaExceededError');
      m.set(k, String(v));
    },
    removeItem: (k) => m.delete(k),
  };
}

const NU = 1790000000000; // een vaste echte tijd, zodat twee keer bewaren dezelfde tekst geeft

test('bewaren, herstellen en weer bewaren geeft precies dezelfde tekst', () => {
  const S = gehucht();
  const bewoner = S.bewoners.mensen.find((p) => p.wezen && p.huis);
  T.zetVlag(S, 'marskramerOpBezoek');
  const overgeslagen = [];
  const tekst = T.bewaarSpel(S, { nu: NU, overgeslagen });
  assert.deepEqual(overgeslagen, [], 'een gehucht zonder scherm heeft niets wat niet te bewaren is');

  const S2 = gehucht();
  const r = T.herstelSpel(S2, tekst);
  assert.equal(r.gelukt, true, r.reden);
  assert.equal(T.bewaarSpel(S2, { nu: NU }), tekst);
  assert.ok(bewoner, 'er is een bewoner met een poppetje en een huis');
});

// Loopt twee spellen naast elkaar door, en kijkt of wat in het ene één en hetzelfde ding is, dat in het andere
// ook is, en andersom. Geeft het eerste pad waar het niet klopt, of null. (Met een tekst, niet met
// assert.equal op twee spellen: bij een verschil tussen twee zulke grote dingen blijft node hangen.)
function andereVorm(a, b) {
  const heen = new Map();
  const terug = new Map();
  const stapel = [[a, b, 'S']];
  while (stapel.length) {
    const [x, y, pad] = stapel.pop();
    if (!x || typeof x !== 'object') {
      if (!(x === y || (Number.isNaN(x) && Number.isNaN(y)))) return `${pad}: ${String(x)} tegen ${String(y)}`;
      continue;
    }
    if (!y || typeof y !== 'object') return `${pad}: geen object meer`;
    if (heen.has(x) || terug.has(y)) {
      if (heen.get(x) !== y || terug.get(y) !== x) return `${pad}: wijst naar een ander ding`;
      continue;
    }
    heen.set(x, y);
    terug.set(y, x);
    if (Object.getPrototypeOf(x) !== Object.getPrototypeOf(y)) return `${pad}: een andere soort`;
    if (x instanceof Set || x instanceof Map) {
      const xs = [...x];
      const ys = [...y];
      if (xs.length !== ys.length) return `${pad}: ${xs.length} tegen ${ys.length}`;
      xs.forEach((v, i) => stapel.push([v, ys[i], `${pad}{${i}}`]));
      continue;
    }
    const kx = Object.keys(x);
    const ky = Object.keys(y);
    if (kx.join() !== ky.join()) return `${pad}: andere sleutels`;
    for (const k of kx) stapel.push([x[k], y[k], `${pad}.${k}`]);
  }
  return null;
}
const zonderScherm = (S) => {
  const scherm = Object.keys(T.schermVelden());
  return Object.fromEntries(Object.keys(S).filter((k) => !scherm.includes(k)).map((k) => [k, S[k]]));
};

test('wat elkaar aanwijst, wijst na het laden nog steeds naar hetzelfde', () => {
  const S = gehucht();
  const S2 = gehucht();
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: NU })).gelukt, true);
  assert.equal(andereVorm(zonderScherm(S), zonderScherm(S2)), null);
  // Een paar die ertoe doen, met naam: ze gelden vóór het bewaren, en daarna nog.
  for (const [wie, s] of [['vóór', S], ['na', S2]]) {
    assert.ok(s.gebieden[s.wereld.gebied] === s.wereld, `${wie}: S.wereld is het gebied in S.gebieden, geen kopie`);
    assert.ok(s.wereld.wezens.includes(s.schout), `${wie}: de schout is een wezen in de wereld, geen kopie`);
    assert.ok(s.bewoners.mensen.every((p) => !p.wezen || s.wereld.wezens.includes(p.wezen)), `${wie}: elk poppetje staat in de wereld`);
  }
  // En wat nu verandert, verandert overal: één ding, geen twee.
  S2.schout.tx = -99;
  assert.equal(S2.gebieden[S2.wereld.gebied].wezens.find((e) => e === S2.schout).tx, -99);
});

test('verzamelingen blijven verzamelingen, en het scherm begint opnieuw', () => {
  const S = gehucht();
  T.zetVlag(S, 'heerBetaald');
  S.effecten.push({ soort: 'flits' });
  S.hover = { x: 3, y: 4 };
  const S2 = gehucht();
  T.herstelSpel(S2, T.bewaarSpel(S, { nu: NU }));
  assert.ok(S2.vlaggen instanceof Set && S2.vlaggen.has('heerBetaald'));
  assert.ok(S2.wereld.deuren instanceof Map);
  assert.equal(S2.wereld.deuren.size, S.wereld.deuren.size);
  assert.deepEqual(S2.effecten, [], 'wat op het scherm bewoog, beweegt niet meer');
  assert.equal(S2.hover, null);
  assert.equal(S2.grond, null);
});

test('ook wat JSON zelf niet kent, komt terug', () => {
  const lus = { naam: 'lus' };
  lus.zelf = lus;
  const gedeeld = new Set(['a', 'b']);
  const sleutel = { id: 7 };
  const S = {
    kalender: { dag: 40.5 },
    bevolking: 3,
    wereld: {},
    getallen: [Infinity, -Infinity, NaN, 1.5],
    gaten: [1, undefined, 3],
    dollar: { $r: 'geen verwijzing', $id: 'ook niet' },
    lus,
    eens: gedeeld,
    nogEens: gedeeld,
    kaart: new Map([[sleutel, 'waarde'], ['tekst', sleutel]]),
    functie: () => 1,
  };
  const S2 = {};
  assert.equal(T.herstelSpel(S2, T.bewaarSpel(S, { nu: NU })).gelukt, true);
  assert.deepEqual(S2.getallen.slice(0, 2), [Infinity, -Infinity]);
  assert.ok(Number.isNaN(S2.getallen[2]));
  assert.equal(S2.gaten.length, 3);
  assert.equal(S2.gaten[1], undefined);
  assert.deepEqual(S2.dollar, { $r: 'geen verwijzing', $id: 'ook niet' });
  assert.equal(S2.lus.zelf, S2.lus);
  assert.equal(S2.eens, S2.nogEens);
  assert.ok(S2.eens instanceof Set && S2.eens.has('b'));
  const [[k, v], [, terug]] = [...S2.kaart];
  assert.deepEqual(k, { id: 7 });
  assert.equal(v, 'waarde');
  assert.equal(terug, k, 'dezelfde sleutel, ook als waarde');
  assert.equal('functie' in S2, false, 'een functie gaat niet mee');
});

test('wat de tijd stilzet, gaat niet mee, en blijft in het spel zelf staan', () => {
  const S = gehucht();
  T.houdTijdStil(S, 'menu');
  const S2 = gehucht();
  T.herstelSpel(S2, T.bewaarSpel(S, { nu: NU }));
  assert.deepEqual(S2.kalender.stil, [], 'een geladen spel staat niet stil');
  assert.deepEqual(S.kalender.stil, ['menu'], 'het spel waaruit je opsloeg, staat nog stil zolang het menu open is');
  const S3 = gehucht();
  T.bewaarSpel(S3, { nu: NU });
  assert.equal('stil' in S3.kalender, false, 'bewaren laat geen leeg veld achter');
});

test('een spel uit een andere versie, of een kapot spel, wordt niet geladen, en S blijft zoals het was', () => {
  const S = gehucht();
  const tekst = T.bewaarSpel(S, { nu: NU });
  const ander = JSON.stringify({ ...JSON.parse(tekst), versie: T.OPSLAAN_INSTELLINGEN.versie + 1 });
  const S2 = gehucht();
  const voor = T.bewaarSpel(S2, { nu: NU });
  const r = T.herstelSpel(S2, ander);
  assert.equal(r.gelukt, false);
  assert.match(r.reden, /andere versie/);
  assert.equal(T.herstelSpel(S2, '{kapot').gelukt, false);
  assert.equal(T.herstelSpel(S2, JSON.stringify({ versie: T.OPSLAAN_INSTELLINGEN.versie, staat: { a: { $r: 9 } } })).gelukt, false);
  assert.equal(T.bewaarSpel(S2, { nu: NU }), voor);
});

test('wanneer er opgeslagen mag worden: alleen als er niets openstaat of halverwege is', () => {
  const S = gehucht();
  assert.equal(T.waaromNietOpslaan(S), null);
  T.houdTijdStil(S, 'menu');
  assert.equal(T.waaromNietOpslaan(S), null, 'uit het menu mag het');
  T.laatTijdGaan(S, 'menu');
  T.houdTijdStil(S, 'titel');
  assert.match(T.waaromNietOpslaan(S), /venster/, 'achter het titelscherm wacht een spel dat nog niet begon');
  T.laatTijdGaan(S, 'titel');
  T.houdTijdStil(S, 'brief');
  assert.match(T.waaromNietOpslaan(S), /venster/);
  T.laatTijdGaan(S, 'brief');
  S.modus = 'handel';
  assert.match(T.waaromNietOpslaan(S), /venster/);
  S.modus = 'gevecht';
  assert.match(T.waaromNietOpslaan(S), /gevecht/);
  S.modus = 'einde';
  assert.match(T.waaromNietOpslaan(S), /uit/);
  S.modus = 'verkennen';
  S.wachters.push({});
  assert.match(T.waaromNietOpslaan(S), /beweegt/);
  S.wachters.length = 0;
  S.proefje = true;
  assert.match(T.waaromNietOpslaan(S), /proefje/, 'een proefje (?kaart=) overschrijft het spel van de speler niet');
});

test('de plekken: vijf eigen en één die vanzelf gaat, het nieuwste bovenaan', (t) => {
  const opslag = nepOpslag();
  T.gebruikOpslagPlek(opslag);
  t.after(() => T.gebruikOpslagPlek(null));
  assert.deepEqual(T.opslagPlekken(), ['auto', '1', '2', '3', '4', '5']);
  assert.deepEqual(T.opgeslagenSpellen(), []);
  assert.equal(T.nieuwsteSpel(), null);

  const S = gehucht();
  assert.equal(T.slaOp(S, 'auto', NU).gelukt, true);
  S.kalender.dag = 12.3;
  const r = T.slaOp(S, '3', NU + 60000);
  assert.equal(r.gelukt, true);
  assert.equal(r.kop.datum, T.datumVanDag(12.3).tekst);
  assert.equal(T.slaOp(S, '6', NU).gelukt, false, 'er zijn vijf eigen plekken');
  assert.deepEqual(T.opgeslagenSpellen().map((s) => s.plek), ['3', 'auto']);
  assert.equal(T.nieuwsteSpel().plek, '3');
  assert.equal(T.nieuwsteSpel().kop.bevolking, S.bevolking);

  const S2 = gehucht();
  const gelezen = T.leesVanPlek('3');
  assert.equal(gelezen.gelukt, true);
  T.zetSpel(S2, gelezen);
  assert.equal(S2.kalender.dag, 12.3);
  assert.equal(T.leesVanPlek('2').reden, 'Op deze plek staat geen spel.');

  // Een spel uit een andere versie staat er nog, maar valt niet te laden, en telt niet als nieuwste.
  const kop = JSON.parse(opslag.getItem(`${T.OPSLAG_SLEUTEL}.spel.3.kop`));
  opslag.setItem(`${T.OPSLAG_SLEUTEL}.spel.3.kop`, JSON.stringify({ ...kop, versie: 0 }));
  assert.match(T.opgeslagenSpellen()[0].reden, /andere versie/);
  assert.equal(T.nieuwsteSpel().plek, 'auto');
});

test('is de opslag vol, of is er geen, dan zegt het dat', (t) => {
  t.after(() => T.gebruikOpslagPlek(null));
  const S = gehucht();
  T.gebruikOpslagPlek(nepOpslag({ vol: true }));
  assert.match(T.slaOp(S, '1', NU).reden, /vol/);
  T.gebruikOpslagPlek(null);
  assert.equal(T.opslagPlek(), null, 'een toets heeft geen browser');
  assert.match(T.slaOp(S, '1', NU).reden, /bewaart niets/);
});

test('vanzelf opslaan: elke ochtend één keer, als de mensen opstaan, en niet achter het titelscherm', (t) => {
  const opslag = nepOpslag();
  T.gebruikOpslagPlek(opslag);
  t.after(() => T.gebruikOpslagPlek(null));
  const S = gehucht();
  const opstaan = (dag) => Math.floor(dag) + T.dagindeling(Math.floor(dag)).opstaan / 24;
  S.kalender.dag = opstaan(3) - 0.01;
  assert.equal(T.werkOpslaanBij(S), null, 'nog voor het opstaan');
  S.kalender.dag = opstaan(3) + 0.001;
  T.houdTijdStil(S, 'titel');
  assert.equal(T.werkOpslaanBij(S), null, 'het spel achter het titelscherm overschrijft niets');
  T.laatTijdGaan(S, 'titel');
  S.modus = 'handel';
  assert.equal(T.werkOpslaanBij(S), null, 'een venster staat open');
  S.modus = 'verkennen';
  const r = T.werkOpslaanBij(S);
  assert.equal(r && r.gelukt, true, 'zodra het venster dicht is');
  assert.equal(T.werkOpslaanBij(S), null, 'die ochtend niet nog eens');
  assert.equal(JSON.parse(opslag.getItem(`${T.OPSLAG_SLEUTEL}.spel.auto.kop`)).kop.dag, S.kalender.dag);

  // Een geladen spel weet dat het die ochtend al bewaard is.
  const S2 = gehucht();
  T.zetSpel(S2, T.leesVanPlek('auto'));
  assert.equal(T.werkOpslaanBij(S2), null);

  S.kalender.dag = opstaan(4) + 0.001;
  S.slaap = { tot: opstaan(4) + 0.01 };
  assert.equal(T.werkOpslaanBij(S), null, 'wie slaapt, slaat pas op als hij wakker is');
  S.slaap = null;
  assert.equal(T.werkOpslaanBij(S).gelukt, true, 'de volgende ochtend weer');
});
