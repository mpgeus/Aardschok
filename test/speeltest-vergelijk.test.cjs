// Twee speeltests naast elkaar (gereedschap/speeltest/vergelijk.cjs, werklijst vraag 142, stap 3): een speeltest met een
// naam bewaart alle waarden van de bladzijde met getallen, en de vergelijking zegt welke er anders waren en wat er per spel
// anders afliep. Zonder browser: de uitslagen hier zijn met de hand gemaakt, in de vorm die speler.js teruggeeft.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const V = require('../gereedschap/speeltest/vergelijk.cjs');
const I = require('../gereedschap/instellingen/bron.js');

const bronnen = V.leesBronnen();
const waarden = V.waardenVan(bronnen);

test('een speeltest onthoudt elke waarde van de bladzijde, een spelregel naar zijn id', () => {
  const m = I.model(bronnen);
  const telBladen = m.onderwerpen.reduce((n, o) => n + o.bladen.length, 0) + m.gebouwen.reduce((n, g) => n + g.bladen.length, 0);
  assert.equal(Object.keys(waarden).length, telBladen + m.spelregels.length);
  for (const r of m.spelregels) assert.equal(waarden[`OPTIES:${r.id}`].waarde, r.standaard, r.id);
  const w = waarden['SCHOVEN_INSTELLINGEN.droogDagen'];
  assert.ok(w, 'het drogen van de schoven staat erin');
  assert.equal(w.soort, 'getal');
  assert.match(w.naam, /droogDagen/);
});

test('verander één getal, en precies dat getal is anders', () => {
  const bestand = Object.keys(bronnen).find((b) => I.blokkenIn(bronnen[b]).includes('SCHOVEN_INSTELLINGEN'));
  const was = waarden['SCHOVEN_INSTELLINGEN.droogDagen'].waarde;
  const anders = { ...bronnen, [bestand]: I.zet(bronnen[bestand], 'SCHOVEN_INSTELLINGEN', ['droogDagen'], was + 5) };
  const verschil = V.andereWaarden(waarden, V.waardenVan(anders));
  assert.equal(verschil.length, 1);
  assert.deepEqual([verschil[0].sleutel, verschil[0].voor, verschil[0].na], ['SCHOVEN_INSTELLINGEN.droogDagen', was, was + 5]);
  assert.deepEqual([verschil[0].blok, verschil[0].pad], ['SCHOVEN_INSTELLINGEN', ['droogDagen']]);
  assert.deepEqual(V.andereWaarden(waarden, V.waardenVan(bronnen)), []);
});

test('een naam van een speeltest is een map in uit/, niets daarbuiten', () => {
  for (const goed of ['voor', 'na', '2026-10-10-1432', 'proef_2']) assert.ok(V.GOEDE_NAAM.test(goed), goed);
  for (const fout of ['', '.', '..', '../x', 'a/b', 'a\\b', '-x', 'met spatie']) assert.ok(!V.GOEDE_NAAM.test(fout), fout);
  assert.equal(V.leesSpeeltest('../x'), null);
});

// Een uitslag zoals speler.js hem teruggeeft, met alleen wat de vergelijking leest.
const uitslag = (speler, zaad, mensen, gewonnen = null) => ({
  speler, zaad, fouten: [],
  eind: { tekst: 'het jaar uit, tot 1 grasmaand', bevolking: mensen, tevredenheid: 0.714, graan: 120, goud: 33, hout: 40, argwaan: 0.25,
    bazen: { gunst: 61, vertrouwen: 72 }, eind: { beste: 40, gewonnen } },
  dorp: { datum: '3 hooimaand' }, marktrecht: null,
  geluk: [{ allemaal: 10, honger: 2 }, { allemaal: 25, honger: 0 }],
  winter: { doden: 1, weg: 2 },
});

function legSpeeltest(uit, naam, waardenNu, uitslagen, wanneer) {
  fs.mkdirSync(path.join(uit, naam), { recursive: true });
  const set = { naam, wanneer, stand: 'het spel van abc1234', klaar: true, opdracht: { spelers: ['bouwer'], zaden: [1, 2], jaren: 2, land: 'eiland', regels: {}, getallen: {} } };
  fs.writeFileSync(path.join(uit, naam, 'set.json'), JSON.stringify(set));
  fs.writeFileSync(path.join(uit, naam, 'waarden.json'), JSON.stringify(waardenNu));
  for (const u of uitslagen) fs.writeFileSync(path.join(uit, naam, `${u.speler}-${u.zaad}-eiland.json`), JSON.stringify(u));
}

test('de vergelijking zet per spel de twee naast elkaar, met wat er anders was erboven', () => {
  const uit = fs.mkdtempSync(path.join(os.tmpdir(), 'speeltest-'));
  try {
    const na = { ...waarden, 'SCHOVEN_INSTELLINGEN.droogDagen': { ...waarden['SCHOVEN_INSTELLINGEN.droogDagen'], waarde: 99 } };
    legSpeeltest(uit, 'voor', waarden, [uitslag('bouwer', 1, 80), uitslag('bouwer', 2, 90)], '2026-10-10T10:00:00.000Z');
    legSpeeltest(uit, 'na', na, [uitslag('bouwer', 2, 95, '5 oogstmaand'), uitslag('bouwer', 1, 80)], '2026-10-10T11:00:00.000Z');
    fs.writeFileSync(path.join(uit, 'na', 'half.json'), '{"speler": "bou'); // een spel dat gestopt werd
    fs.mkdirSync(path.join(uit, 'zonder-set'));

    assert.deepEqual(V.speeltestsIn(uit).map((s) => s.naam), ['na', 'voor'], 'de nieuwste eerst, en alleen met een set.json');

    const v = V.vergelijk(V.leesSpeeltest('voor', uit), V.leesSpeeltest('na', uit));
    assert.equal(v.zelfdeOpdracht, true);
    assert.deepEqual(v.waarden.map((w) => [w.sleutel, w.na]), [['SCHOVEN_INSTELLINGEN.droogDagen', 99]]);
    assert.deepEqual(v.spellen.map((s) => s.zaad), [1, 2], 'per zaad, in volgorde');
    const maat = (s, id) => s.maten.find((m) => m.id === id);
    assert.deepEqual([maat(v.spellen[1], 'mensen').voor, maat(v.spellen[1], 'mensen').na], [90, 95]);
    assert.deepEqual([maat(v.spellen[1], 'gewonnen').voor, maat(v.spellen[1], 'gewonnen').na], ['niet', '5 oogstmaand']);
    assert.equal(maat(v.spellen[0], 'allemaal').na, 35, 'de dagen van alle jaren samen');
    assert.equal(maat(v.spellen[0], 'tevreden').na, 71);
    assert.equal(maat(v.spellen[0], 'marktrecht').na, 'niet');

    const tekst = V.alsTekst(v);
    assert.match(tekst, /^# na naast voor/);
    assert.match(tekst, /\| .*droogDagen.* \| \d+ \| 99 \|/);
    assert.match(tekst, /\| Mensen aan het eind \| 90 \| 95 \| \+5 \|/);
    assert.match(tekst, /\| Gewonnen op \| niet \| 5 oogstmaand \| anders \|/);
    assert.match(tekst, /\| Mensen aan het eind \| 80 \| 80 \|  \|/);
  } finally {
    fs.rmSync(uit, { recursive: true, force: true });
  }
});

test('wat er gespeeld werd, zegt de vergelijking erbij als het niet hetzelfde was', () => {
  const a = { set: { naam: 'a', opdracht: { spelers: ['bouwer'], zaden: [1], jaren: 2, land: 'eiland' }, waarden: {} }, uitslagen: [] };
  const b = { set: { naam: 'b', opdracht: { spelers: ['bouwer'], zaden: [1], jaren: 2, land: 'maker' }, waarden: {} }, uitslagen: [uitslag('bouwer', 1, 70)] };
  const v = V.vergelijk(a, b);
  assert.equal(v.zelfdeOpdracht, false);
  assert.equal(v.spellen[0].gespeeldTegen, false);
  assert.match(V.alsTekst(v), /Let op:\*\* de twee speelden niet hetzelfde/);
  assert.match(V.alsTekst(v), /### bouwer, zaad 1\n\na speelde dit spel niet/);
  assert.equal(V.opdrachtTekst(a.set.opdracht), 'bouwer, zaad 1, 2 jaar, op het eiland');
  assert.equal(V.verschil(3, 3), '');
  assert.equal(V.verschil(3, 1), '-2');
});

test('een getal dat de standaard van een spelregel overschrijft, doet in het spel niets, en dat zegt de vergelijking', () => {
  // De spelregel "Treden" zet in zijn standaard heel TREDEN_INSTELLINGEN.dorp, dus ook dorp.mensen.
  const w = waarden['TREDEN_INSTELLINGEN.dorp.mensen'];
  assert.deepEqual(w.spelregel, { optie: 'Treden', waarde: w.waarde });
  const bestand = Object.keys(bronnen).find((b) => I.blokkenIn(bronnen[b]).includes('TREDEN_INSTELLINGEN'));
  const anders = { ...bronnen, [bestand]: I.zet(bronnen[bestand], 'TREDEN_INSTELLINGEN', ['dorp', 'mensen'], w.waarde - 8) };
  const [verschil] = V.andereWaarden(waarden, V.waardenVan(anders));
  assert.deepEqual(verschil.nietInHetSpel, { optie: 'Treden', waarde: w.waarde });
  assert.match(V.alsNiet(verschil), /doet in het spel niets: de standaard van de spelregel "Treden" zet het op \d+/);
  // Een getal dat geen spelregel zet, doet wel iets.
  const schoven = Object.keys(bronnen).find((b) => I.blokkenIn(bronnen[b]).includes('SCHOVEN_INSTELLINGEN'));
  const ander = { ...bronnen, [schoven]: I.zet(bronnen[schoven], 'SCHOVEN_INSTELLINGEN', ['droogDagen'], 99) };
  assert.equal(V.andereWaarden(waarden, V.waardenVan(ander))[0].nietInHetSpel, null);
});
