// De platte tekeningen van de huizen (werklijst vraag 176, stap 4a; ontwerp/beeld.md, "Zicht in een dicht dorp"): elk
// huis op het vel heeft er een (tegels/plat/, uit gereedschap/pixelart/plat.cjs), een oude deelt die van zijn jonge, en
// de platte past op zijn anker binnen de tekening van het huis, zodat er niets verspringt als je plat kijkt. In het spel
// (stap 4b): F zet de gebouwen plat (js/main.js, js/tekenen.js), en dat is alleen beeld.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const T = require('./laad.cjs').spel();
const WORTEL = path.join(__dirname, '..');
const json = JSON.parse(fs.readFileSync(path.join(WORTEL, 'tegels', 'plat.json'), 'utf8'));

// De maat van een PNG uit zijn kop, zonder hem uit te pakken.
function maatVan(pad) {
  const buf = fs.readFileSync(pad);
  return { b: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
const jongVan = (naam) => naam.replace(/-oud$/, '');

test('plat.js is plat.json, als script, en het spel laadt hem (index.html)', () => {
  assert.deepEqual(T.PLAT, json);
});

test('elk huis op het vel heeft een platte tekening, op zijn anker binnen de tekening van het huis', () => {
  const huizen = T.TEGELS.huizen.tiles.filter((t) => t && t.naam);
  assert.ok(huizen.length > 1000);
  for (const t of huizen) {
    const p = json.platten[jongVan(t.naam)];
    assert.ok(p, `${t.naam}: geen platte tekening`);
    assert.deepEqual(maatVan(path.join(WORTEL, 'tegels', p.bestand)), { b: p.b, h: p.h }, `${t.naam}: de maat in plat.json`);
    // waar de platte ligt in de tekening van het huis, als hun ankers op elkaar liggen
    const [x, y] = [t.anker[0] - p.anker[0], t.anker[1] - p.anker[1]];
    const [, , cb, ch] = t.cel;
    assert.ok(x >= 0 && y >= 0 && x + p.b <= cb && y + p.h <= ch, `${t.naam}: de platte steekt buiten het huis (${x}, ${y}, ${p.b}×${p.h} in ${cb}×${ch})`);
  }
});

test('alleen jonge tekeningen in plat.json, en niets anders in de map', () => {
  const namen = new Set(T.TEGELS.huizen.tiles.filter((t) => t && t.naam).map((t) => t.naam));
  for (const naam of Object.keys(json.platten)) {
    assert.ok(namen.has(naam), `${naam}: staat niet op het vel`);
    assert.ok(!naam.endsWith('-oud'), `${naam}: een oude deelt de platte van zijn jonge`);
  }
  const bestanden = fs.readdirSync(path.join(WORTEL, 'tegels', 'plat')).map((f) => `plat/${f}`).sort();
  assert.deepEqual(bestanden, Object.values(json.platten).map((p) => p.bestand).sort());
});

test('in het spel vindt elk huis zijn platte tekening, ook een oud huis (T.jongeTekeningVan, T.sprites.platVan)', () => {
  T.TEGELS.huizen.tiles.forEach((t, id) => {
    if (!t || !t.naam) return;
    const v = { vel: 'huizen', id, x: 0, y: 0 };
    assert.ok(T.PLAT.platten[T.jongeTekeningVan(v)], `${t.naam}: geen platte tekening in het spel`);
  });
  // Zonder beelden (Node) laadt er niets: dan het gewone huis, en niets onthouden.
  const v = { vel: 'huizen', id: T.TEGELS.huizen.tiles.findIndex((t) => t && t.naam), x: 0, y: 0 };
  assert.equal(T.sprites.platVan(v), null);
  assert.equal(v.getekend.platHuis, null);
});

test('plat is alleen beeld: een veld van het scherm, en een bewaard spel is met en zonder gelijk', () => {
  const { proefDorp } = require('./grond.cjs');
  const { S } = proefDorp(T);
  assert.equal(T.schermVelden().gebouwenPlat, false);
  const zonder = T.bewaarSpel(S, { nu: 0 });
  S.gebouwenPlat = true;
  assert.equal(T.bewaarSpel(S, { nu: 0 }), zonder);
});
