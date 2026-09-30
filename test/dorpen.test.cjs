// Twee dorpen naast elkaar (js/dorp.js; werklijst, vraag 71). Alles van een dorp staat bij elkaar, zodat er twee
// kunnen zijn: jouw gehucht en een buurdorp op een gehucht van de maker (js/maker.js). Ze delen de kalender, en verder
// niets: wat in het ene gebeurt, raakt het andere niet, en een ander dorp dan het jouwe spreekt niet tegen jou.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Wat er tegen het scherm gezegd wordt: een bericht, een brief, een venster.
const gezegd = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : undefined) });

// Het spel op het ontworpen gehucht, met een vast zaad, en een buurdorp op een gehucht van de maker.
function tweeDorpen(zaad = 3) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender(), tijd: 0, wereldTijd: 0, modus: 'verkennen', inventaris: new Set() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
    const w = T.laadGemaaktGehucht(zaad);
    w.gebied = 'buurdorp';
    const schout = w.wezens.find((e) => e.soort === 'schout');
    S.dorpen.push(T.nieuwDorp(S, w, schout, { zaad, ander: true }));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  return { S, jij: S.dorp, buur: S.dorpen[1] };
}

// Het dorp letter voor letter, zoals het opslaan het schrijft (js/opslaan.js), zonder de kalender die ze delen.
const foto = (D) => T.bewaarSpel({ kalender: { dag: 0 }, dorp: { ...D, kalender: null } }, { nu: 0 });

// Een dag voor een dorp, zoals het spel hem tikt (js/gebouwen.js).
function dagen(S, dorpen, van, tot) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    for (const D of dorpen) T.tikGebouwenDag(D, dag);
  }
}

test('twee dorpen: elk zijn eigen kaart, voorraad, mensen en schout, en dezelfde kalender', () => {
  const { S, jij, buur } = tweeDorpen();
  assert.equal(S.dorpen.length, 2);
  assert.notEqual(jij.wereld, buur.wereld);
  assert.notEqual(jij.voorraad, buur.voorraad);
  assert.notEqual(jij.bewoners, buur.bewoners);
  assert.notEqual(jij.schout, buur.schout);
  assert.equal(jij.kalender, S.kalender);
  assert.equal(buur.kalender, S.kalender, 'de kalender is voor alle dorpen dezelfde');
  assert.ok(!jij.ander, 'jouw dorp spreekt tegen jou');
  assert.equal(buur.ander, true, 'het buurdorp is een ander dorp');
  assert.ok(buur.bevolking > 20 && buur.bewoners.mensen.length === buur.bevolking, 'het buurdorp heeft zijn eigen mensen');
  assert.equal(T.dorpHier(S), jij, 'je bent in je eigen dorp');
});

test('een jaar van het buurdorp raakt jouw dorp niet, en zegt jou niets', () => {
  const { S, jij, buur } = tweeDorpen();
  const voor = foto(jij);
  gezegd.length = 0;
  dagen(S, [buur], 1, 360);
  assert.equal(foto(jij), voor, 'jouw dorp is letter voor letter hetzelfde');
  assert.deepEqual(gezegd, [], 'wat het buurdorp zegt, komt niet bij jou');
  assert.ok(buur.gezegd && buur.gezegd.length > 0, 'het buurdorp bewaart wat het zei');
  assert.ok(buur.bevolking > 0, 'en het leeft: er wonen mensen');
});

test('en andersom: een jaar van jouw dorp raakt het buurdorp niet', () => {
  const { S, jij, buur } = tweeDorpen();
  const voor = foto(buur);
  dagen(S, [jij], 1, 360);
  assert.equal(foto(buur), voor);
});

test('samen een jaar: elk dorp groeit en eet op zijn eigen voorraad', () => {
  const { S, jij, buur } = tweeDorpen();
  dagen(S, [jij, buur], 1, 360);
  for (const D of [jij, buur]) {
    assert.ok(D.bevolking > 0);
    assert.equal(D.bewoners.mensen.length, D.bevolking, 'één bewoner per mond');
    for (const p of D.bewoners.mensen) if (p.wezen) assert.ok(D.wereld.wezens.includes(p.wezen), 'wie er woont, loopt op de kaart van zijn eigen dorp');
  }
});

test('een dorp waar je niet bent, leeft met poppetjes: ze lopen, alleen niet getekend (vraag 71, A)', () => {
  const { S, jij, buur } = tweeDorpen();
  // Overdag, op 30×: jij staat in je eigen dorp (S.wereld), het buurdorp ligt buiten beeld.
  S.kalender.dag = 40 + 9 / 24;
  S.kalender.snelheid = 30;
  assert.equal(S.wereld, jij.wereld);
  const waar = new Map(buur.wereld.wezens.map((e) => [e, `${e.x},${e.y}`]));
  for (let i = 0; i < 600; i++) {
    S.tijd += 1 / 60;
    S.wereldTijd += 30 / 60;
    for (const D of S.dorpen) T.werkDorpBij(S, D, 1 / 60, 30 / 60);
  }
  const verplaatst = buur.wereld.wezens.filter((e) => waar.get(e) !== `${e.x},${e.y}`);
  assert.ok(verplaatst.length >= 5, `in het buurdorp lopen mensen rond (${verplaatst.length} verplaatst)`);
  for (const e of verplaatst) assert.ok(T.isBegaanbaar(buur.wereld, Math.round(e.tx), Math.round(e.ty)) || e === buur.schout, 'op zijn eigen kaart');
});

test('een regel over een dorp zegt het met T.zeg, nooit rechtstreeks tegen het scherm', () => {
  // Rechtstreeks tegen het scherm spreken alleen het scherm zelf en de regels van het spel: jij (slapen, een gesprek,
  // een quest), het land, een gevecht, en T.zeg zelf. Een nieuw bestand met regels over een dorp staat hier niet
  // tussen, en spreekt dus met T.zeg: dan komt een ander dorp niet bij jou (vraag 71, C).
  const SPEL = ['dorp.js', 'ui.js', 'hud.js', 'brieven.js', 'wettenmenu.js', 'raadsmanvenster.js', 'landkaart.js', 'menu.js',
    'main.js', 'dialoog.js', 'gesprek.js', 'quest.js', 'verkennen.js', 'gevecht.js', 'gebied.js', 'land.js', 'dag.js', 'tijd.js',
    'opslaan.js', 'opties.js', 'tekenen.js'];
  const fs = require('node:fs');
  const path = require('node:path');
  const map = path.join(__dirname, '..', 'js');
  const fout = [];
  for (const f of fs.readdirSync(map).filter((f) => f.endsWith('.js') && !SPEL.includes(f))) {
    fs.readFileSync(path.join(map, f), 'utf8').split('\n').forEach((regel, i) => {
      if (!/^\s*\/\//.test(regel) && /T\.ui\.bericht\(/.test(regel)) fout.push(`js/${f}:${i + 1}`);
    });
  }
  assert.deepEqual(fout, [], `Een dorp spreekt met T.zeg(D, tekst, soort) (js/dorp.js): ${fout.join(', ')}`);
});
