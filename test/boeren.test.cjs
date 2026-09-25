// De boeren zonder scherm (js/boeren.js): het loten van karakter en eigenschappen, en wat die doen
// bij het maaien, de opbrengst, het zaaien en de schandpaal. Zie ontwerp/spel.md, "De boeren
// krijgen willekeurige eigenschappen" (Marcel, 24 sep 2026).
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/tijd.js');
require('../js/wereld.js');
require('../js/voorraad.js');
require('../js/mensen.js');
require('../js/gesprekken.js');
require('../js/gesprek.js');
require('../js/akkers.js');
require('../js/boeren.js');
require('../js/heer.js');
const T = globalThis.Toren;
const BOEREN = ['boer1', 'boer2', 'boer3', 'boer4', 'boer5'];

// Een gehucht met de vijf boeren, elk met een akker van 2×2.
function gehucht() {
  const akkers = [];
  const wezens = BOEREN.map((id, i) => {
    const e = T.maakMens(id, 20 + i, 20);
    const a = { x: i * 3, y: 0, b: 2, h: 2, huis: id, geoogst: new Set() };
    akkers.push(a);
    e.werkAkkers = [a];
    return e;
  });
  return { wereld: { wezens, akkers }, voorraad: T.nieuweVoorraad(), kalender: { dag: 0 }, tijd: 0 };
}
const boer = (S, id) => S.wereld.wezens.find((e) => e.wie === id);

// Zet de instellingen van de boeren zolang de toets loopt, en daarna weer terug.
function met(zet, fn) {
  const was = JSON.parse(JSON.stringify(T.BOEREN_INSTELLINGEN));
  Object.assign(T.BOEREN_INSTELLINGEN, zet);
  try {
    fn();
  } finally {
    T.BOEREN_INSTELLINGEN = was;
  }
}

test('elk karakter heeft een korte en een lange naam en een eigen gesprek, en het kan uitkomen', () => {
  for (const [id, k] of Object.entries(T.KARAKTERS)) {
    assert.ok(k.kort && k.lang, `${id} heeft een korte en een lange naam`);
    assert.ok(T.GESPREKKEN[id], `${id} heeft geen gesprek`);
    assert.ok(!k.geslacht || k.geslacht === 'man' || k.geslacht === 'vrouw', `${id}: geslacht ${k.geslacht}`);
    if (k.aanzien) assert.ok(T.BOEREN_INSTELLINGEN.aanzien.some((t) => t.id === k.aanzien), `${id}: aanzien ${k.aanzien}`);
    // Het gesprek onthoudt de schandpaal onder de vlag die js/heer.js zet.
    const vlaggen = JSON.stringify(T.GESPREKKEN[id].knopen);
    assert.ok(vlaggen.includes(T.schandpaalVlag(id)), `${id}: het gesprek kent ${T.schandpaalVlag(id)} niet`);
  }
  // Genoeg karakters voor iedereen: de mannen kunnen alleen uit wat beide kan.
  const mannen = BOEREN.filter((id) => T.MENSEN[id].geslacht !== 'vrouw').length;
  assert.ok(Object.values(T.KARAKTERS).filter((k) => !k.geslacht).length >= mannen);
  assert.ok(Object.keys(T.KARAKTERS).length >= BOEREN.length);
});

test('elke boer heeft een vast karakter en een geslacht, en zijn vaste gesprek is dat van zijn karakter', () => {
  for (const id of BOEREN) {
    const m = T.MENSEN[id];
    assert.ok(T.KARAKTERS[m.karakter], `${id}: ${m.karakter}`);
    assert.ok(m.geslacht === 'man' || m.geslacht === 'vrouw');
    assert.equal(T.gesprekVanMens(id), m.karakter);
  }
});

test('hetzelfde zaad geeft hetzelfde lot, en een ander zaad (bijna altijd) een ander', () => {
  const a = T.lootBoeren(gehucht(), 42);
  const b = T.lootBoeren(gehucht(), 42);
  assert.deepEqual(a.boeren, b.boeren);
  const anders = [1, 2, 3, 4, 5, 6, 7, 8].some((z) => JSON.stringify(T.lootBoeren(gehucht(), z).boeren) !== JSON.stringify(a.boeren));
  assert.ok(anders);
});

test('geen karakter twee keer, en een weduwe of vroedvrouw is altijd een boerin', () => {
  for (let zaad = 0; zaad < 300; zaad++) {
    const lot = T.lootBoeren(gehucht(), zaad).boeren;
    const karakters = BOEREN.map((id) => lot[id].karakter);
    assert.equal(new Set(karakters).size, BOEREN.length, `zaad ${zaad}: ${karakters}`);
    for (const id of BOEREN) {
      const k = T.KARAKTERS[lot[id].karakter];
      if (k.geslacht) assert.equal(k.geslacht, T.MENSEN[id].geslacht, `zaad ${zaad}: ${id} is ${lot[id].karakter}`);
    }
  }
});

test('de eigenschappen komen ongeveer zo vaak voor als hun kans', () => {
  const tel = {};
  const n = 600;
  for (let zaad = 0; zaad < n; zaad++) {
    const lot = T.lootBoeren(gehucht(), zaad).boeren;
    for (const id of BOEREN) tel[lot[id].eigenschappen.maaien] = (tel[lot[id].eigenschappen.maaien] || 0) + 1;
  }
  for (const t of T.BOEREN_INSTELLINGEN.maaien) {
    const deel = tel[t.id] / (n * BOEREN.length);
    assert.ok(Math.abs(deel - t.kans) < 0.05, `${t.id}: ${deel} tegen ${t.kans}`);
  }
});

test('een karakter dat zijn aanzien vastlegt, houdt dat: de woekeraar is altijd gehaat', () => {
  for (let zaad = 0; zaad < 300; zaad++) {
    const lot = T.lootBoeren(gehucht(), zaad).boeren;
    for (const id of BOEREN) {
      const vast = T.KARAKTERS[lot[id].karakter].aanzien;
      if (vast) assert.equal(lot[id].eigenschappen.aanzien, vast);
    }
  }
});

test('het lot staat op de poppetjes: karakter, eigenschappen en het gesprek van het karakter', () => {
  const S = gehucht();
  const lot = T.lootBoeren(S, 7).boeren;
  for (const id of BOEREN) {
    const e = boer(S, id);
    assert.equal(e.karakter, lot[id].karakter);
    assert.deepEqual(e.eigenschappen, lot[id].eigenschappen);
    assert.equal(T.gesprekIdVan(e), lot[id].karakter);
  }
});

test('vast (de optie in de spelregels): zoals ze geschreven waren, en allemaal gewoon', () => {
  met({ loten: false }, () => {
    const S = gehucht();
    T.lootBoeren(S, 7);
    for (const id of BOEREN) {
      const e = boer(S, id);
      assert.equal(e.karakter, T.MENSEN[id].karakter);
      for (const soort of ['maaien', 'opbrengst', 'zaaien']) assert.equal(T.boerFactor(e, soort), 1);
    }
    assert.equal(boer(S, 'boer2').eigenschappen.aanzien, 'geliefd', 'de weduwe');
    assert.equal(boer(S, 'boer3').eigenschappen.aanzien, 'gehaat', 'de woekeraar');
  });
});

test('wat je ziet: het karakter en wat hij kan, en wat gewoon is, staat er niet bij', () => {
  const S = gehucht();
  T.lootBoeren(S, 1);
  const e = boer(S, 'boer1');
  e.karakter = 'zanger';
  e.eigenschappen = { maaien: 'snel', opbrengst: 'gewoon', zaaien: 'kwistig', aanzien: 'gewoon' };
  assert.deepEqual(T.overBoer(e), { kort: 'zanger', lang: T.KARAKTERS.zanger.lang, eigenschappen: ['snelle maaier', 'kwistig'] });
  assert.equal(T.overBoerTekst(e, true), 'zanger · snelle maaier · kwistig');
  assert.equal(T.overBoer(T.maakMens('marskramer', 1, 1)), null);
  assert.equal(T.overBoerTekst(T.maakMens('marskramer', 1, 1)), '');
});

// Een gezicht per karakter (ontwerp/beeld.md, Marcel 25 sep): wie een karakter heeft, draagt het vel
// van dat karakter op zijn lijf (boer-zanger, boerin-weduwe) als dat vel er is, en anders gewoon het
// vel van zijn lijf. js/sprites.js kiest het, in S.houding, met T.sprites.velMetKarakter.
test('een boer draagt het vel van zijn karakter als dat er is, en anders gewoon zijn lijf', () => {
  require('../js/sprites.js');
  const heeft = (naam) => naam === 'boer-zanger' || naam === 'boerin-weduwe';
  assert.equal(T.sprites.velMetKarakter('boer', 'zanger', heeft), 'boer-zanger');
  assert.equal(T.sprites.velMetKarakter('boerin', 'weduwe', heeft), 'boerin-weduwe');
  // nog geen eigen vel (de karakters van ronde 2), of geen karakter: het lijf
  assert.equal(T.sprites.velMetKarakter('boer', 'drinker', heeft), 'boer');
  assert.equal(T.sprites.velMetKarakter('boerin', 'zanger', heeft), 'boerin');
  assert.equal(T.sprites.velMetKarakter('boer', undefined, heeft), 'boer');
});

test('de vijf van de vaste verdeling hebben hun vel, en dat loopt zoals hun lijf', () => {
  require('../beelden/beschrijving.js');
  const F = T.BEELDEN.figuren;
  for (const id of BOEREN) {
    const m = T.MENSEN[id];
    const vel = `${m.vel}-${m.karakter}`;
    assert.ok(F[vel], `${id} (${m.karakter}) heeft geen vel ${vel}: dorpelingen-anim.cjs, dan naar-spel.cjs --alleen ${vel}`);
    // dezelfde snelheid en pas als het lijf, anders glijden de voeten
    assert.deepEqual(Object.keys(F[vel].houdingen), Object.keys(F[m.vel].houdingen));
    assert.equal(F[vel].snelheid, F[m.vel].snelheid);
    assert.equal(F[vel].houdingen.lopen.stap, F[m.vel].houdingen.lopen.stap);
  }
  // Elk vel van een karakter zit op een lijf dat bij dat karakter kan: een weduwe is een boerin.
  for (const naam of Object.keys(F)) {
    const [, lijf, karakter] = /^(boer|boerin)-(.+)$/.exec(naam) || [];
    if (!lijf) continue;
    assert.ok(T.KARAKTERS[karakter], `${naam}: er is geen karakter ${karakter}`);
    const g = T.KARAKTERS[karakter].geslacht;
    if (g) assert.equal(lijf, g === 'vrouw' ? 'boerin' : 'boer', naam);
  }
});

// ---------------------------------------------------------------------------------------------
// Wat de eigenschappen doen
// ---------------------------------------------------------------------------------------------

// Zoals in test/akkers.test.cjs: een pad is één stap, en aankomen doen we met de hand.
T.afstand = T.afstand || ((a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)));
const RIJP_DAG = (() => {
  const maand = T.MAANDEN.findIndex((m) => m.naam === 'hooimaand');
  let dag = 0;
  while (T.datumVanDag(dag).maand !== maand || T.datumVanDag(dag).dagVanMaand !== 1) dag++;
  return dag;
})();

function eenBoerOpZijnAkker(eigenschappen) {
  const akker = { x: 0, y: 0, b: 1, h: 1, huis: 'boer1', geoogst: new Set() };
  const e = T.maakMens('boer1', 0, 0);
  e.werkAkkers = [akker];
  e.eigenschappen = eigenschappen;
  const S = { wereld: { wezens: [e], akkers: [akker], tegels: [['vloer']] }, tijd: 0, kalender: { dag: RIJP_DAG }, voorraad: T.nieuweVoorraad() };
  const zoek = T.zoekPad;
  T.zoekPad = (van, doel) => [{ x: doel.x, y: doel.y }];
  return { S, e, akker, klaar: () => { T.zoekPad = zoek; } };
}

test('een snelle maaier doet korter over een tegel, een trage langer', () => {
  for (const [id, verwacht] of [['snel', 0.7], ['gewoon', 1], ['traag', 1.3]]) {
    const { S, e, klaar } = eenBoerOpZijnAkker({ maaien: id });
    try {
      T.werkOogstBij(S, 0.1); // hij staat al op de tegel: meteen maaien
      if (e.pad.length) {
        e.pad = [];
        T.werkOogstBij(S, 0.1);
      }
      assert.ok(e.maait, `${id}: hij maait niet`);
      assert.ok(Math.abs(e.maait.tot - T.OOGST_TEGEL_DUUR * verwacht) < 1e-9, `${id}: ${e.maait.tot}`);
    } finally {
      klaar();
    }
  }
});

test('groene vingers geven meer graan per tegel, slordig minder, ook bij het vangnet', () => {
  for (const [id, verwacht] of [['groeneVingers', 1.15], ['slordig', 0.85]]) {
    const { S, e, klaar } = eenBoerOpZijnAkker({ opbrengst: id });
    try {
      T.werkOogstBij(S, 0.1);
      if (e.pad.length) {
        e.pad = [];
        T.werkOogstBij(S, 0.1);
      }
      S.tijd = e.maait.tot;
      T.werkOogstBij(S, 0.1);
      assert.ok(Math.abs(S.voorraad.graan - T.GRAAN_PER_TEGEL * verwacht) < 1e-9, `${id}: ${S.voorraad.graan}`);
    } finally {
      klaar();
    }
    // Het vangnet: wat nog staat, komt binnen naar de opbrengst van zijn boer.
    const v = eenBoerOpZijnAkker({ opbrengst: id });
    v.klaar();
    T.haalOogstBinnen(v.S);
    assert.ok(Math.abs(v.S.voorraad.graan - T.GRAAN_PER_TEGEL * verwacht) < 1e-9, `vangnet ${id}: ${v.S.voorraad.graan}`);
  }
});

test('een zuinige boer zaait met minder zaaigraan, een kwistige met meer', () => {
  const S = gehucht();
  T.lootBoeren(S, 3);
  for (const id of BOEREN) boer(S, id).eigenschappen.zaaien = 'gewoon';
  boer(S, 'boer1').eigenschappen.zaaien = 'zuinig';
  boer(S, 'boer2').eigenschappen.zaaien = 'kwistig';
  T.zetVoorraad(S, 'graan', 1000);
  const r = T.zaaiAkkers(S);
  const per = T.ZAAIGRAAN_PER_TEGEL * 4; // elke akker is 2×2
  assert.ok(Math.abs(r.graan - (per * 0.8 + per * 1.2 + 3 * per)) < 1e-9, `${r.graan}`);
  assert.equal(r.braak, 0);
});

test('bij te weinig zaaigraan betaalt ieder zijn eigen prijs, en ligt bij ieder een stuk braak', () => {
  const S = gehucht();
  T.lootBoeren(S, 3);
  for (const id of BOEREN) boer(S, id).eigenschappen.zaaien = 'gewoon';
  boer(S, 'boer2').eigenschappen.zaaien = 'kwistig';
  T.zetVoorraad(S, 'graan', 10);
  const r = T.zaaiAkkers(S);
  assert.ok(r.graan <= 10 + 1e-9, `${r.graan}`);
  assert.ok(r.gezaaid > 0 && r.braak > 0);
  for (const a of S.wereld.akkers) assert.ok(a.braak.size < 4, 'geen akker helemaal braak');
});

test('het aanzien bepaalt wat de schandpaal kost, en wie aan de paal kan', () => {
  const S = gehucht();
  T.lootBoeren(S, 5);
  const e = boer(S, 'boer4');
  for (const t of T.BOEREN_INSTELLINGEN.aanzien) {
    e.eigenschappen.aanzien = t.id;
    assert.equal(T.aanzienVan(e), t.schandpaal);
  }
  assert.equal(T.aanzienVan(T.maakMens('heer', 1, 1)), null);
  // De keuzes bij de schandpaal: de boeren met hun karakter en wat ze kunnen, en wat het kost.
  S.heer = T.nieuweHeer();
  const keuzes = T.schandpaalKeuzes(S);
  const vier = keuzes.find((k) => k.wie === 'boer4');
  assert.equal(vier.kost, T.aanzienVan(e));
  assert.equal(vier.eigenschap, T.overBoerTekst(e));
  assert.equal(vier.naam, e.naam);
});
