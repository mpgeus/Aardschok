// De grond onder de toetsen (snoeien, ronde 2, stap 3; Marcel, 12 okt: "B: lege begin met een proefdorp"). Tot 12 okt
// speelden de meeste toetsen op het ontworpen gehucht (kaarten/gehucht.tmj, met zijn vijf boeren); dat begin is weg,
// dus spelen ze nu wat de speler speelt: het lege begin op het eiland, en een dorp dat met de regels van het spel
// gebouwd is (T.plaatsGebouw, T.legVeld), meteen af.
//
//   const { leegBegin, proefDorp, dagen } = require('./grond.cjs');
//   const { S, D, w } = leegBegin(T);       // de kar, het kamp en vier gezinnen, op dag 1
//   const { S, D, w, ... } = proefDorp(T);  // en het dorp erop, op dag 2, iedereen thuis
//   proefDorp(T, { gebouwen: ['herberg'], weide: true, boerderijen: 3 })   // met meer erbij (zie bouwProefDorp)
// proefDorp geeft ook: schout (zijn huis), boerderijen, hutten, akkers, weide, gebouw(soort) en boer(boerderij).
//
// Met een vaste reeks toeval, zodat elke toets hetzelfde dorp krijgt. `npm test` draait ook dit bestand (het staat in
// test/): dan toetst het onderaan wat het proefdorp is.
const assert = require('node:assert/strict');

// Doe `doe` met een vaste reeks toeval (Math.random), en zet daarna het echte terug.
function metVastToeval(begin, doe) {
  const toeval = Math.random;
  let n = begin;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  try {
    return doe();
  } finally {
    Math.random = toeval;
  }
}

// Een nieuw spel op het eiland van `zaad`, met het lege begin, stil (zoals js/main.js het begint, zonder scherm). Zaad 2
// heeft open grond bij het plein.
function leegBegin(T, zaad = 2) {
  const echt = console.warn;
  const maker = { ...T.MAKER_INSTELLINGEN };
  console.warn = () => {};
  T.MAKER_INSTELLINGEN.opEiland = true;
  const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
  try {
    metVastToeval(11, () => assert.ok(T.beginOpKaart(S, 'gehucht', zaad)));
  } finally {
    console.warn = echt;
    Object.assign(T.MAKER_INSTELLINGEN, maker);
  }
  return { S, D: S.dorp, w: S.dorp.wereld };
}

// Dagen zoals het spel ze tikt (js/gebouwen.js), van `van` tot en met `tot`.
function dagen(T, S, van, tot = van) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    T.tikGebouwenDag(S.dorp, dag);
  }
}

// Een bouwplaats meteen af: de kavel gerooid en al het werk gedaan; vannacht komt hij klaar (T.tikGebouwenDag).
function bouwAf(T, D, g, dag) {
  if (g.wachtOpRooien) {
    for (const t of T.teRooienOp(D, g.kavel)) T.rooiTegel(D, t);
    g.wachtOpRooien = false;
    if (!T.isVeldSoort(g.soort)) T.zetOpDeKaart(D, g);
  }
  g.bouw.gedaan = g.bouw.werk;
  if (g.voorwerp) g.voorwerp.voortgang = 1;
  g.klaarOp = dag;
}

// Zet `soort` neer zo dicht mogelijk bij het kampvuur, zoals de speler het met het bouwmenu doet; in het bos ook (de
// kavel rooit bouwAf). Geeft het gebouw.
function zetBijHetVuur(T, D, soort) {
  const v = D.wereld.kamp.vuur;
  for (let r = 1; r < 40; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const uit = T.plaatsGebouw(D, soort, v.x + dx, v.y + dy);
        if (uit.gelukt) return uit.instantie;
      }
    }
  }
  return assert.fail(`er is geen plaats voor ${soort}`);
}

// Een veld van b bij h bij boerderij g, de dichtste plek waar het past.
function legVeldBij(T, D, soort, g, b = 6, h = 5) {
  const r = T.voetVanGebouw(g);
  const midden = (q) => ({ x: q.x + q.b / 2, y: q.y + q.h / 2 });
  let beste = null;
  for (let y = r.y - 10; y <= r.y + r.h + 10; y++) {
    for (let x = r.x - 10; x <= r.x + r.b + 10; x++) {
      const q = { x, y, b, h };
      if (T.waaromPastVeldNiet(D, soort, q)) continue;
      const d = T.afstand(midden(q), midden(r));
      if (!beste || d < beste.d) beste = { q, d };
    }
  }
  assert.ok(beste, `er is plaats voor een ${soort} bij de boerderij`);
  const uit = T.legVeld(D, soort, beste.q);
  assert.ok(uit.gelukt, uit.reden);
  return uit.instantie;
}

// Iedereen thuis: wie nog over de weg komt, is er (T.werkBewonersBij maakt zijn poppetje bij de weg), en elk poppetje
// staat bij zijn eigen deur, op een vrije tegel, zoals het spel een nieuw gezin bij zijn deur zet.
function iedereenThuis(T, D) {
  T.werkBewonersBij(D);
  const w = D.wereld;
  for (const p of D.bewoners.mensen) {
    const e = p.wezen;
    if (!e || p.schout) continue;
    delete p.komt;
    const deur = T.deurVan(w, p.huis);
    let plek = null;
    for (let r = 0; r <= 4 && !plek; r++) {
      for (let y = deur.y - r; y <= deur.y + r && !plek; y++) {
        for (let x = deur.x - r; x <= deur.x + r && !plek; x++) {
          if (Math.max(Math.abs(x - deur.x), Math.abs(y - deur.y)) === r && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) plek = { x, y };
        }
      }
    }
    if (!plek) continue;
    Object.assign(e, { x: plek.x, y: plek.y, tx: plek.x, ty: plek.y, pad: [], onderweg: false });
    e.thuis = { x: deur.x, y: deur.y };
  }
}

// Het proefdorp bouwen: het lege begin, en op dag 1 neergezet en meteen af het huis van de schout, twee boerderijen met
// elk een akker, en hutten voor wie er dan nog in het kamp woont. Op dag 2 trekken de gezinnen erin, wordt de man op een
// boerderij boer, en worden de akkers land; het kamp is dan leeg, en iedereen staat thuis. Rond het vuur is het krap, dus
// bouwt het met een ruimer bereik (`bereik` tegels; in het spel 16, T.BEGIN_INSTELLINGEN.bouwBereik), alleen zolang het
// neerzet. Geeft S, met S.kalender op dag 2.
//   zaad         het eiland (2)
//   boerderijen  hoeveel boerderijen, elk met een akker (2)
//   hutten       hoeveel hutten; standaard zoveel als er dan nog gezinnen in het kamp wonen
//   gebouwen     wat er verder staat, af, zoals ['herberg', 'schaapskooi'] (een gebouw met handen krijgt ze op dag 2)
//   weide        de eerste boerderij krijgt er een veld bij dat weide is, met de beginkudde erop (T.zetBeginKudde)
function bouwProefDorp(T, { zaad = 2, boerderijen = 2, hutten = null, gebouwen = [], weide = false, bereik = 40 } = {}) {
  const { S, D, w } = leegBegin(T, zaad);
  // Alles op een vaste reeks toeval, ook de dagen erna: anders kreeg elk proces (elk toetsbestand) een iets ander dorp.
  return metVastToeval(7, () => {
    dagen(T, S, 1);
    const echt = T.BEGIN_INSTELLINGEN.bouwBereik;
    T.BEGIN_INSTELLINGEN.bouwBereik = bereik;
    let weiveld = null;
    try {
      // Wat het kost, komt eerst in de voorraad, zodat die daarna is wat de kar bracht.
      const n = hutten != null ? hutten : Math.max(0, T.kampTenten(D).length - boerderijen);
      const soorten = ['schout', ...Array(boerderijen).fill('boerderij'), ...Array(n).fill('hut'), ...gebouwen];
      for (const soort of soorten) for (const [wat, k] of Object.entries(T.GEBOUWEN[soort].kosten || {})) T.wijzigVoorraad(D, wat, k);
      const schout = zetBijHetVuur(T, D, 'schout');
      const hoeven = [];
      for (let i = 0; i < boerderijen; i++) hoeven.push(zetBijHetVuur(T, D, 'boerderij'));
      const velden = hoeven.map((g) => legVeldBij(T, D, 'akker', g));
      if (weide) velden.push((weiveld = legVeldBij(T, D, 'akker', hoeven[0])));
      const rest = [];
      for (let i = 0; i < n; i++) rest.push(zetBijHetVuur(T, D, 'hut'));
      for (const soort of gebouwen) rest.push(zetBijHetVuur(T, D, soort));
      for (const g of [schout, ...hoeven, ...velden, ...rest]) bouwAf(T, D, g, 1);
    } finally {
      T.BEGIN_INSTELLINGEN.bouwBereik = echt;
    }
    dagen(T, S, 2);
    if (weiveld) {
      const a = w.akkers.find((x) => x.x === weiveld.x && x.y === weiveld.y);
      a.bestemming = a.plan = 'weide';
      a.ongezaaid.clear();
      T.zetBeginKudde(D);
    }
    iedereenThuis(T, D);
    T.verdeelHanden(D);
    // De boeren krijgen hun akkers op hun poppetje, zoals elke nacht (js/boerderij.js): die poppetjes kwamen pas na de nacht.
    T.werkDeBoerenBij(D);
    // Welke tekening het volgende gebouw van elke soort krijgt (T.volgendeTekening), en dus hoe groot zijn voet is: hier
    // al gekozen, zodat een toets die iets neerzet, elke keer dezelfde plek vindt.
    for (const soort of Object.keys(T.GEBOUWEN)) T.volgendeTekening(D, soort);
    return S;
  });
}

// Het proefdorp wordt één keer gebouwd (per keus van de opties) en bewaard zoals het spel opslaat (T.bewaarSpel,
// js/opslaan.js); elke toets krijgt een vers exemplaar (T.herstelSpel). Dat is sneller dan het elke keer bouwen, en zo
// toetst elke toets ook dat een bewaard spel speelt als het spel zelf. Een getal dat een toets vóór het proefdorp
// verandert, telt dus niet bij het bouwen: zet het erna.
const BEWAARD = new Map();
function proefDorp(T, opties = {}) {
  const sleutel = JSON.stringify(opties);
  if (!BEWAARD.has(sleutel)) BEWAARD.set(sleutel, T.bewaarSpel(bouwProefDorp(T, opties), { nu: 0 }));
  const S = {};
  const uit = T.herstelSpel(S, BEWAARD.get(sleutel));
  assert.ok(uit.gelukt, uit.reden);
  const D = S.dorp;
  const w = D.wereld;
  const boerderijen = D.gebouwen.filter((g) => g.soort === 'boerderij');
  const akkers = (w.akkers || []).filter((a) => boerderijen.includes(a.boerderij));
  return {
    S, D, w, boerderijen,
    schout: D.gebouwen.find((g) => g.soort === 'schout'),
    hutten: D.gebouwen.filter((g) => g.soort === 'hut'),
    // De akkers van de boerderijen (de weide niet), en de weide als die er is.
    akkers: akkers.filter((a) => T.bestemmingVan(a) !== 'weide'),
    weide: akkers.find((a) => T.bestemmingVan(a) === 'weide') || null,
    // Het eerste gebouw van deze soort (een van `gebouwen`), en de boer van een boerderij.
    gebouw: (soort) => D.gebouwen.find((g) => g.soort === soort) || null,
    boer: (g) => T.boerVan(D, g),
  };
}

module.exports = { leegBegin, proefDorp, dagen, bouwAf, zetBijHetVuur, legVeldBij, metVastToeval };

if (require.main === module) {
  const test = require('node:test');
  const T = require('./laad.cjs').spel();
  T.ui = new Proxy({}, { get: () => () => undefined });

  test('het proefdorp: het huis van de schout, twee boerderijen met hun boer en akker, en hutten; het kamp is leeg', () => {
    const { D, w, schout, boerderijen, akkers, hutten } = proefDorp(T);
    assert.ok(schout.klaar && schout.huis === 'schout', 'de schout woont in zijn huis');
    assert.equal(boerderijen.length, 2);
    for (const g of boerderijen) {
      assert.ok(g.klaar, 'de boerderij is af');
      assert.ok(T.boerVan(D, g), 'en heeft een boer');
    }
    assert.equal(akkers.length, 2, 'elke boerderij een akker');
    assert.ok(hutten.length && hutten.every((h) => h.klaar));
    assert.equal(T.kampTenten(D).length, 0, 'iedereen is het kamp uit');
    assert.ok(w.akkers.every((a) => a.boerderij), 'de akkers zijn land van hun boerderij');
  });

  test('elke toets krijgt een vers proefdorp: wat de een verandert, ziet de ander niet', () => {
    const een = proefDorp(T);
    een.D.gebouwen.pop();
    T.wijzigVoorraad(een.D, 'hout', 100);
    const twee = proefDorp(T);
    assert.notEqual(een.D, twee.D);
    assert.equal(twee.D.voorraad.hout, een.D.voorraad.hout - 100);
    assert.equal(twee.D.gebouwen.length, een.D.gebouwen.length + 1);
  });
}
