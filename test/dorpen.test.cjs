// Twee dorpen naast elkaar (js/dorp.js; werklijst, vraag 71). Alles van een dorp staat bij elkaar, zodat er twee
// kunnen zijn: jouw dorp en een buurdorp op een ander stuk van het eiland. Ze delen de kalender, en verder
// niets: wat in het ene gebeurt, raakt het andere niet, en een ander dorp dan het jouwe spreekt niet tegen jou.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

// Wat er tegen het scherm gezegd wordt: een bericht, een brief, een venster.
const gezegd = [];
T.ui = new Proxy({}, { get: (_, naam) => (...args) => (naam === 'bericht' ? gezegd.push(args[0]) : undefined) });

// Het spel op het proefdorp (test/grond.cjs), en een buurdorp op een ander eiland: ook een proefdorp, dat het spel meeneemt
// als een ander dorp (`ander`). Sinds ronde 2 van het snoeien (stap 6) legt de maker geen dorp meer dat er al was; wie
// een buurdorp wordt, bouwt zelf, en is dus zo groot als zijn bouwers het maakten.
function tweeDorpen(zaad = 3) {
  const { S } = proefDorp(T);
  const buur = proefDorp(T, { zaad }).D;
  buur.ander = true;
  buur.kalender = S.kalender;
  buur.wereld.gebied = 'buurdorp';
  S.dorpen.push(buur);
  return { S, jij: S.dorp, buur };
}

// Het dorp letter voor letter, zoals het opslaan het schrijft (js/opslaan.js), zonder de kalender die ze delen. Even op
// het dorp zelf, want zijn wezens wijzen het aan (e.dorp, js/wereld.js), dus een kopie zou het dorp toch meenemen.
const foto = (D) => {
  const k = D.kalender;
  D.kalender = null;
  try {
    return T.bewaarSpel({ kalender: { dag: 0 }, dorp: D }, { nu: 0 });
  } finally {
    D.kalender = k;
  }
};

// Een dag voor een dorp, zoals het spel hem tikt (js/gebouwen.js).
function dagen(S, dorpen, van, tot) {
  for (let dag = van; dag <= tot; dag++) {
    S.kalender.dag = dag + 0.3;
    S.kalender.stil = [];
    for (const D of dorpen) T.tikGebouwenDag(D, dag);
  }
}

test('twee dorpen: elk zijn eigen kaart, voorraad, mensen en aanvoerder, en dezelfde kalender', () => {
  const { S, jij, buur } = tweeDorpen();
  assert.equal(S.dorpen.length, 2);
  assert.notEqual(jij.wereld, buur.wereld);
  assert.notEqual(jij.voorraad, buur.voorraad);
  assert.notEqual(jij.bewoners, buur.bewoners);
  assert.notEqual(jij.aanvoerder, buur.aanvoerder);
  assert.equal(jij.kalender, S.kalender);
  assert.equal(buur.kalender, S.kalender, 'de kalender is voor alle dorpen dezelfde');
  assert.ok(!jij.ander, 'jouw dorp spreekt tegen jou');
  assert.equal(buur.ander, true, 'het buurdorp is een ander dorp');
  assert.ok(buur.bevolking > 10 && buur.bewoners.mensen.length === buur.bevolking, 'het buurdorp heeft zijn eigen mensen');
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
  // De tik van de wereld (js/tik.js): elk dorp, en het lopen op elke kaart. Wie onderweg ergens anders stond dan bij
  // het begin (na een dag staat een dorpeling weer op zijn werk); alleen de mensen van het dorp, want het wild is van de
  // wereld (vraag 170, stap 6a2). Tot 16 okt tikte deze toets alleen de dorpen, en telde hij de wolven en herten die het
  // dorp de eerste keer neerzette, als mensen die liepen.
  const waar = new Map(buur.wereld.wezens.map((e) => [e, `${e.x},${e.y}`]));
  const verplaatst = new Set();
  for (let i = 0; i < 600; i++) {
    T.wereldTik(S);
    for (const e of buur.wereld.wezens) if (T.hoortBij(buur, e) && waar.has(e) && waar.get(e) !== `${e.x},${e.y}`) verplaatst.add(e);
  }
  assert.ok(verplaatst.size >= 5, `in het buurdorp lopen mensen rond (${verplaatst.size} verplaatst)`);
  for (const e of verplaatst) assert.ok(T.isBegaanbaar(buur.wereld, Math.round(e.tx), Math.round(e.ty)) || e === buur.aanvoerder, 'op zijn eigen kaart');
});

test('een regel over een dorp zegt het met T.zeg, nooit rechtstreeks tegen het scherm', () => {
  // Rechtstreeks tegen het scherm spreken alleen het scherm zelf en de regels van het spel: jij (slapen, een gesprek,
  // een quest), een gevecht, en T.zeg zelf. Een nieuw bestand met regels over een dorp staat hier niet
  // tussen, en spreekt dus met T.zeg: dan komt een ander dorp niet bij jou (vraag 71, C).
  const SPEL = ['dorp.js', 'ui.js', 'hud.js', 'brieven.js', 'wettenmenu.js', 'menu.js',
    'main.js', 'dialoog.js', 'gesprek.js', 'quest.js', 'verkennen.js', 'gevecht.js', 'gebied.js', 'dag.js', 'tijd.js',
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
