// De weides in beeld (ontwerp/spel.md, "Weides met koeien en schapen", stap 1; 25 sep 2026): wat de
// muis op een veld zegt (T.veldTekst, js/verkennen.js; het veldenvenster in js/hud.js leest dezelfde
// stukjes), en vee dat binnen zijn weide blijft (T.dwaalTegelsOpWeide, T.wegNaarWeide en
// T.laatDwalen). De regels zelf (bestemming, plan, vruchtbaarheid, melk) toetsen test/akkers.test.cjs
// en test/vee.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, legVeldBij, bouwAf, dagen } = require('./grond.cjs');

// Het proefdorp zoals het begint, met de beginkudde op de weide van de eerste boerderij en de schapen op de heide. Het
// lege begin heeft geen meent (de kaart van het ontworpen gehucht had er een): hier komt er een op open grond bij de
// weide, en de beginkudde wordt opnieuw gezet, zodat de schapen erop grazen. `veld(i)` is de i-de akker van de boerderijen.
function dorp() {
  const r = proefDorp(T, { weide: true, gebouwen: ['schaapskooi'] });
  const { D, w, weide } = r;
  T.werkDeBoerenBij(D); // het proefdorp zet de poppetjes pas na de laatste nacht neer: de boeren krijgen hun akkers nu
  const bezet = (x, y) => !T.isBegaanbaar(w, x, y)
    || D.gebouwen.some((g) => { const v = T.voetVanGebouw(g); return x >= v.x - 1 && x < v.x + v.b + 1 && y >= v.y - 1 && y < v.y + v.h + 1; })
    || w.akkers.some((a) => x >= a.x - 1 && x < a.x + a.b + 1 && y >= a.y - 1 && y < a.y + a.h + 1);
  const b = 8;
  const h = 6;
  let beste = null;
  for (let y = weide.y - 25; y < weide.y + 25; y++) {
    for (let x = weide.x - 25; x < weide.x + 25; x++) {
      let vrij = true;
      for (let j = 0; j < h && vrij; j++) for (let i = 0; i < b && vrij; i++) if (bezet(x + i, y + j)) vrij = false;
      const d = vrij && T.afstand({ x: x + b / 2, y: y + h / 2 }, { x: weide.x + weide.b / 2, y: weide.y + weide.h / 2 });
      if (vrij && (!beste || d < beste.d)) beste = { x, y, d };
    }
  }
  assert.ok(beste, 'open grond voor een heide');
  (w.meenten || (w.meenten = [])).push({ naam: 'heide', x: beste.x, y: beste.y, b, h, meent: true });
  w.wezens = w.wezens.filter((e) => !e.dier);
  T.zetBeginKudde(D);
  return r;
}

// Een strook van b bij h bij boerderij `g` (de dichtste plek waar hij past), meteen land: de bouwers zijn klaar en de
// nacht erop is het een akker. Twee bij veertien, zoals de smalle strook van het ontworpen gehucht.
function strookBij(r, g, b = 2, h = 14) {
  const { S, D } = r;
  const bouw = legVeldBij(T, D, 'akker', g, b, h);
  const dag = Math.floor(S.kalender.dag);
  bouwAf(T, D, bouw, dag);
  dagen(T, S, dag + 1);
  return r.w.akkers.find((a) => a.x === bouw.x && a.y === bouw.y);
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

// Laat het vee `n` keer dwalen, zonder te wachten op zijn pauze. Alleen het vee en de aanvoerder: de
// boeren gaan hier opzij (dood, dus nergens meer in de weg), anders toetst dit hun dwalen mee.
function dwaal(S, n, bijElkeStap) {
  for (const e of S.wereld.wezens) if (!e.dier && e !== S.dorp.aanvoerder) e.dood = true;
  for (let i = 0; i < n; i++) {
    S.tijd += 7.3; // telkens een ander moment, zodat een dier niet de hele toets blijft liggen
    for (const e of T.veeVan(S.dorp)) e.dwaalTijd = 0;
    T.laatDwalen(S, 0.1);
    stap(S);
    if (bijElkeStap) bijElkeStap(i);
  }
}

test('T.kuddeTekst: per soort geteld, in de volgorde van T.VEE', () => {
  const koe = T.maakDier('koe', 0, 0, 1);
  const schaap = T.maakDier('schaap', 0, 0, 2);
  assert.equal(T.kuddeTekst([]), '');
  assert.equal(T.kuddeTekst([koe]), '1 cow');
  assert.equal(T.kuddeTekst([schaap, koe, schaap]), '1 cow, 2 sheep');
});

test('de muis op een veld: van wie, het vee, en hoe vruchtbaar', () => {
  const { S, weide, akkers: [akker] } = dorp();
  const boer = T.boerVanVeld(S.dorp, weide).naam;
  // De schapen staan op de heide (de meent), niet op de weide.
  assert.equal(T.veldTekst(S.dorp, weide), `${boer}'s meadow · 3 cows · fertility 100%`);
  assert.equal(T.veldTekst(S.dorp, akker), `${T.boerVanVeld(S.dorp, akker).naam}'s field · fertility 100%`);

  // Wat het volgend jaar wordt, en wanneer.
  akker.vruchtbaarheid = 0.9;
  assert.equal(T.zetPlan(S.dorp, akker, 'braak').kan, true);
  assert.match(T.veldTekst(S.dorp, akker), /^.*'s field · fertility 90% · becomes fallow on 1 March$/);

  // Te veel vee op te weinig weide, en een weide zonder vee of zonder boer.
  for (let i = 0; i < 5; i++) S.wereld.wezens.push(T.zetOpWeide(Object.assign(T.maakDier('koe', weide.x, weide.y, 50 + i), { dorp: S.dorp }), weide)); // vee van het dorp (T.hoortBij)
  assert.equal(T.veldTekst(S.dorp, weide), `${boer}'s meadow · 8 cows (too full) · fertility 100%`);
  const leeg = { naam: 'proef', x: 0, y: 0, b: 2, h: 2, huis: null, bestemming: 'weide', plan: 'weide', vruchtbaarheid: 1 };
  assert.equal(T.veldTekst(S.dorp, leeg), 'Meadow · no livestock yet · fertility 100%');
});

test('de muis op een veldtegel: die tekst, en links valt er niets te kiezen', () => {
  const { S, akkers: [, akker] } = dorp();
  const h = T.handelingVerkennen(S, { x: akker.x + 1, y: akker.y + 2 });
  assert.equal(h.tekst, T.veldTekst(S.dorp, akker));
  assert.equal(h.doe, undefined);
  // en naast de velden is er niets
  assert.equal(T.handelingVerkennen(S, { x: S.dorp.aanvoerder.tx + 1, y: S.dorp.aanvoerder.ty }), null);
});

test('een dier op een weide stapt alleen binnen de rechthoek, niet op een ander dier en niet waar een ander heen loopt', () => {
  const r = dorp();
  const { S, w } = r;
  for (const e of T.veeVan(S.dorp)) e.dood = true; // een lege weide om in te proeven
  // Een smalle strook, twee bij veertien (zoals die van het ontworpen gehucht), bij de tweede boerderij, ver
  // van de weide van de eerste: met de oude straal rond het midden kon een dier maar vier tegels op; nu de hele strook.
  const strook = strookBij(r, r.boerderijen[1]);
  strook.bestemming = strook.plan = 'weide';
  assert.equal(T.weideGroepen(w).length, 2, 'de strook is een weide op zich');
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
  const { S, weide } = dorp();
  const meent = T.meentVan(S.wereld);
  const vee = T.veeVan(S.dorp);
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
  const { S, weide: oud, akkers: [strook, blok] } = dorp();
  assert.equal(T.zetPlan(S.dorp, strook, 'weide').kan, true);
  assert.equal(T.zetPlan(S.dorp, blok, 'weide').kan, true);
  assert.equal(T.zetPlan(S.dorp, oud, 'akker').kan, true, 'er is elders plaats genoeg');
  T.wisselVelden(S.dorp);
  const vee = T.veeVan(S.dorp).filter((e) => e.dier === 'koe'); // de schapen staan op de heide
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
  const r = dorp();
  const { S, w } = r;
  const koe = T.veeVan(S.dorp).find((e) => e.dier === 'koe');
  assert.equal(T.wegNaarWeide(w, koe), null, 'het staat al op zijn weide');
  // Een strook bij dezelfde boerderij.
  const strook = strookBij(r, r.boerderijen[0]);
  T.zetOpWeide(koe, strook);
  const weg = T.wegNaarWeide(w, koe);
  assert.ok(weg && weg.length, 'een weg erheen');
  const eind = weg[weg.length - 1];
  assert.ok(binnen({ tx: eind.x, ty: eind.y }, strook), `eindigt op ${eind.x},${eind.y}`);
  // de dichtstbijzijnde: zo ver als de kortste weg naar een tegel van de strook (tussen de koe en de strook kan de
  // boerderij staan; B2b: op het land van nu ligt de strook schuin achter de schuur)
  const wegen = T.akkerTegels(strook).map((t) => T.zoekRoute(w, { x: koe.tx, y: koe.ty }, t, {})).filter(Boolean);
  assert.equal(weg.length, Math.min(...wegen.map((p) => p.length)));
});
