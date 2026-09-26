// De weides in beeld (ontwerp/spel.md, "Weides met koeien en schapen", stap 1; 25 sep 2026): wat de
// muis op een veld zegt (T.veldTekst, js/verkennen.js; het veldenvenster in js/hud.js leest dezelfde
// stukjes), en vee dat binnen zijn weide blijft (T.dwaalTegelsOpWeide, T.wegNaarWeide en
// T.laatDwalen). De regels zelf (bestemming, plan, vruchtbaarheid, melk) toetsen test/akkers.test.cjs
// en test/vee.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/tijd.js');
require('../js/voorraad.js');
require('../js/wereld.js');
require('../js/mensen.js');
require('../js/vee.js');
require('../js/gebouwen.js');
require('../js/behoeften.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/akkers.js');
require('../js/boeren.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
const T = globalThis.Spel;

// Het gehucht zoals het begint: de beginkudde op het blok van Klaas (akker6).
function gehucht() {
  const S = { voorraad: T.nieuweVoorraad(), gebouwen: [], bevolking: 0, woonruimte: 0, tijd: 0, spreuk: null, inventaris: new Set() };
  assert.ok(T.beginOpKaart(S, 'gehucht'));
  const veld = (naam) => S.wereld.akkers.find((a) => a.naam === naam);
  return { S, veld };
}

const binnen = (e, v) => e.tx >= v.x && e.tx < v.x + v.b && e.ty >= v.y && e.ty < v.y + v.h;

// Eén stap van iedereen die een pad heeft, zoals js/anim.js het doet maar in één keer: een tegel
// waar intussen iemand staat, laat het pad vallen (T.magStappen).
function stap(S) {
  const w = S.wereld;
  for (const e of w.wezens) {
    if (e.dood || !e.pad || !e.pad.length) continue;
    const t = e.pad[0];
    if (!T.isBegaanbaar(w, t.x, t.y, { wezensBlokkeren: true, wie: e })) {
      e.pad = [];
      continue;
    }
    e.x = e.tx = t.x;
    e.y = e.ty = t.y;
    e.pad.shift();
  }
}

// Laat het vee `n` keer dwalen, zonder te wachten op zijn pauze. Alleen het vee en de schout: de
// boeren gaan hier opzij (dood, dus nergens meer in de weg), anders toetst dit hun dwalen mee.
function dwaal(S, n, bijElkeStap) {
  for (const e of S.wereld.wezens) if (!e.dier && e !== S.schout) e.dood = true;
  for (let i = 0; i < n; i++) {
    S.tijd += 7.3; // telkens een ander moment, zodat een dier niet de hele toets blijft liggen
    for (const e of T.veeVan(S)) e.dwaalTijd = 0;
    T.laatDwalen(S, 0.1);
    stap(S);
    if (bijElkeStap) bijElkeStap(i);
  }
}

test('T.kuddeTekst: per soort geteld, in de volgorde van T.VEE', () => {
  const koe = T.maakDier('koe', 0, 0, 1);
  const schaap = T.maakDier('schaap', 0, 0, 2);
  assert.equal(T.kuddeTekst([]), '');
  assert.equal(T.kuddeTekst([koe]), '1 koe');
  assert.equal(T.kuddeTekst([schaap, koe, schaap]), '1 koe, 2 schapen');
});

test('de muis op een veld: van wie, het vee, en hoe vruchtbaar', () => {
  const { S, veld } = gehucht();
  const weide = veld('akker6');
  const akker = veld('akker2');
  const klaas = T.boerVanVeld(S, weide).naam;
  // De schapen staan op de heide (de meent), niet op de weide.
  assert.equal(T.veldTekst(S, weide), `Weide van ${klaas} · 3 koeien · vruchtbaar 100%`);
  assert.equal(T.veldTekst(S, akker), `Akker van ${T.boerVanVeld(S, akker).naam} · vruchtbaar 100%`);

  // Wat het volgend jaar wordt, en wanneer.
  akker.vruchtbaarheid = 0.9;
  assert.equal(T.zetPlan(S, akker, 'braak').kan, true);
  assert.match(T.veldTekst(S, akker), /^Akker van .* · vruchtbaar 90% · wordt braak op 1 lentemaand$/);

  // Te veel vee op te weinig weide, en een weide zonder vee of zonder boer.
  for (let i = 0; i < 5; i++) S.wereld.wezens.push(T.zetOpWeide(T.maakDier('koe', weide.x, weide.y, 50 + i), weide));
  assert.equal(T.veldTekst(S, weide), `Weide van ${klaas} · 8 koeien (te vol) · vruchtbaar 100%`);
  const leeg = { naam: 'proef', x: 0, y: 0, b: 2, h: 2, huis: null, bestemming: 'weide', plan: 'weide', vruchtbaarheid: 1 };
  assert.equal(T.veldTekst(S, leeg), 'Weide · nog geen vee · vruchtbaar 100%');
});

test('de muis op een veldtegel: die tekst, en een klik is gewoon erheen lopen', () => {
  const { S, veld } = gehucht();
  const akker = veld('akker3');
  const h = T.handelingVerkennen(S, { x: akker.x + 1, y: akker.y + 2 });
  assert.equal(h.tekst, T.veldTekst(S, akker));
  assert.equal(typeof h.doe, 'function', 'erheen lopen');
  // en naast de velden verandert er niets
  const buiten = T.handelingVerkennen(S, { x: S.schout.tx + 1, y: S.schout.ty });
  assert.equal(buiten.tekst, null);
});

test('een dier op een weide stapt alleen binnen de rechthoek, niet op een ander dier en niet waar een ander heen loopt', () => {
  const { S, veld } = gehucht();
  const w = S.wereld;
  for (const e of T.veeVan(S)) e.dood = true; // een lege weide om in te proeven
  // Een smalle strook, twee bij veertien: met de oude straal rond het midden kon een dier maar vier
  // tegels op; nu de hele strook.
  const strook = veld('akker1');
  strook.bestemming = strook.plan = 'weide';
  const koe = T.zetOpWeide(T.maakDier('koe', strook.x, strook.y + 9, 3), strook);
  w.wezens.push(koe);
  const opties = (e) => T.dwaalTegelsOpWeide(w, e).map((t) => `${t.x},${t.y}`).sort();
  assert.deepEqual(opties(koe), [`${strook.x + 1},${strook.y + 9}`, `${strook.x},${strook.y + 10}`, `${strook.x},${strook.y + 8}`].sort());
  // In de hoek: niets buiten de weide.
  koe.x = koe.tx = strook.x;
  koe.y = koe.ty = strook.y;
  assert.deepEqual(opties(koe), [`${strook.x + 1},${strook.y}`, `${strook.x},${strook.y + 1}`].sort());
  // Een schaap ernaast: daar niet heen.
  const schaap = T.zetOpWeide(T.maakDier('schaap', strook.x + 1, strook.y, 4), strook);
  w.wezens.push(schaap);
  assert.deepEqual(opties(koe), [`${strook.x},${strook.y + 1}`]);
  // Loopt het schaap net naar de andere buurtegel, dan daar ook niet.
  schaap.pad = [{ x: strook.x + 1, y: strook.y + 1 }, { x: strook.x, y: strook.y + 1 }];
  assert.deepEqual(opties(koe), []);
});

test('de beginkudde blijft binnen de weide en de schapen op de heide, en nooit twee dieren op één tegel', () => {
  const { S, veld } = gehucht();
  const weide = veld('akker6');
  const meent = T.meentVan(S.wereld);
  const vee = T.veeVan(S);
  const plekken = new Set();
  dwaal(S, 400, () => {
    for (const e of vee) {
      assert.ok(binnen(e, e.dier === 'koe' ? weide : meent), `${e.soort} op ${e.tx},${e.ty}`);
      if (e.dier === 'koe') plekken.add(e.tx + ',' + e.ty);
    }
    assert.equal(new Set(vee.map((e) => e.tx + ',' + e.ty)).size, vee.length, 'niet twee op één tegel');
  });
  // en ze staan niet stil: drie koeien komen op meer dan de helft van de weide
  assert.ok(plekken.size > (weide.b * weide.h) / 2, `${plekken.size} tegels`);
});

test('na een wissel loopt het vee vanzelf naar zijn nieuwe weide, en blijft daar', () => {
  const { S, veld } = gehucht();
  const oud = veld('akker6');
  const strook = veld('akker1');
  const blok = veld('akker7');
  assert.equal(T.zetPlan(S, strook, 'weide').kan, true);
  assert.equal(T.zetPlan(S, blok, 'weide').kan, true);
  assert.equal(T.zetPlan(S, oud, 'akker').kan, true, 'er is elders plaats genoeg');
  T.wisselVelden(S);
  const vee = T.veeVan(S).filter((e) => e.dier === 'koe'); // de schapen staan op de heide
  assert.ok(vee.every((e) => e.weide === strook || e.weide === blok), 'iedereen heeft een nieuwe weide');
  assert.ok(vee.every((e) => binnen(e, oud)), 'maar staat nog op de oude');
  // Onderweg lopen ze over de akkers; eenmaal aangekomen blijven ze binnen hun nieuwe weide.
  dwaal(S, 150);
  for (const e of vee) assert.ok(binnen(e, e.weide), `${e.soort} op ${e.tx},${e.ty}, weide ${e.weide.naam}`);
  dwaal(S, 150, () => {
    for (const e of vee) assert.ok(binnen(e, e.weide), `${e.soort} liep weg naar ${e.tx},${e.ty}`);
  });
});

test('T.wegNaarWeide: de weg naar de dichtstbijzijnde vrije tegel, of null als het er al staat', () => {
  const { S, veld } = gehucht();
  const w = S.wereld;
  const koe = T.veeVan(S).find((e) => e.dier === 'koe');
  assert.equal(T.wegNaarWeide(w, koe), null, 'het staat al op zijn weide');
  const blok = veld('akker7');
  T.zetOpWeide(koe, blok);
  const weg = T.wegNaarWeide(w, koe);
  assert.ok(weg && weg.length, 'een weg erheen');
  const eind = weg[weg.length - 1];
  assert.ok(binnen({ tx: eind.x, ty: eind.y }, blok), `eindigt op ${eind.x},${eind.y}`);
  // de dichtstbijzijnde: zo ver als de kortste afstand tot het blok
  const afstanden = T.akkerTegels(blok).map((t) => T.afstand({ x: koe.tx, y: koe.ty }, t));
  assert.equal(weg.length, Math.min(...afstanden));
});
