// De lantaarn in de hand van een groepsleider en de aanvoerder (werklijst vraag 171, D2; Marcel, 16 okt: "M2, E1" en "A1,
// B1"; gereedschap/pixelart/lantaarn.cjs): js/tekenen.js legt hem op de hand uit beelden/handen.js, en een vel zonder
// handen krijgt geen lantaarntje. Deze toetsen houden dat er geen drager is zonder.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => {} });

// Elk vel dat een drager kan hebben: een soldaat in zijn uiterlijk, in de kleren van zijn stand, jong of oud geworden, en
// de eerste aanvoerder in de oude vellen.
const DRAGER = /^((boer|boerin|jongen|meisje|oudeman|oudevrouw)-u\d+(-arm|-deftig)?|dorpeling[01])$/;

test('elk vel dat een groepsleider of de aanvoerder kan dragen, heeft een hand in elk beeld van staan en lopen', () => {
  const H = T.HANDEN;
  const figuren = T.BEELDEN.figuren;
  const vellen = Object.keys(figuren).filter((n) => DRAGER.test(n));
  assert.ok(vellen.length > 150, `de uiterlijken staan in beelden/ (${vellen.length})`);
  for (const naam of vellen) {
    const set = H.sets[H.vellen[naam]];
    assert.ok(set, `${naam} heeft handen (node gereedschap/pixelart/lantaarn.cjs --handen)`);
    const f = figuren[naam];
    assert.deepEqual(f.richtingen, H.richtingen, `${naam}: de richtingen in dezelfde volgorde`);
    for (const houding of ['staan', 'lopen']) {
      for (const beelden of set[houding]) {
        assert.equal(beelden.length, f.houdingen[houding].beelden, `${naam} ${houding}: een hand per beeld`);
        for (const [dx, dy, scheef] of beelden) {
          assert.ok(Math.abs(dx) < f.houdingen[houding].cel[0] && dy < 0 && dy > -f.houdingen[houding].cel[1], `${naam}: de hand ligt in het figuur`);
          assert.ok([-1, 0, 1].includes(scheef));
        }
      }
    }
  }
});

test('de hand van het beeld dat een wezen het laatst kreeg; staand hangt de lantaarn recht, lopend van opzij schommelt hij (B1)', () => {
  const H = T.HANDEN;
  const set = H.sets[H.vellen['boer-u0']];
  const wezen = (houding, richting, beeld) => ({ beeldStand: { laatste: { naam: 'boer-u0', houding, richting, beeld } } });
  assert.deepEqual(T.sprites.handVan(wezen('lopen', 'ZW', 2)), set.lopen[H.richtingen.indexOf('ZW')][2]);
  for (const r of H.richtingen) assert.ok(set.staan[H.richtingen.indexOf(r)].every((h) => h[2] === 0), `staand naar ${r} recht`);
  const opzij = set.lopen[H.richtingen.indexOf('W')].map((h) => h[2]);
  assert.ok(opzij.includes(-1) && opzij.includes(1), `naar het westen zwaait hij heen en weer (${opzij})`);
  assert.equal(T.sprites.handVan({ beeldStand: { laatste: { naam: 'wolf', houding: 'staan', richting: 'Z', beeld: 0 } } }), null, 'een wolf draagt niets');
  assert.equal(T.sprites.handVan({}), null, 'nog niet getekend');
});

test('het vel van de lantaarn: twee lagen (heel, en wat gloeit), drie standen en twee beelden van de vlam', () => {
  const t = T.BEELDEN.lantaarn;
  assert.deepEqual(t.lagen, ['heel', 'gloed']);
  assert.deepEqual(t.standen, [-1, 0, 1]);
  const png = fs.readFileSync(path.join(__dirname, '..', 'beelden', t.bestand));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [t.cel[0] * t.vlammen, t.cel[1] * t.standen.length * t.lagen.length]);
});

test('T.lichtDragers: wie er nu een brandende lantaarn draagt, buiten in het donker', () => {
  const { S } = proefDorp(T, { gebouwen: ['wachthuis'] });
  const D = S.dorp;
  const huis = D.gebouwen.find((g) => g.soort === 'wachthuis');
  T.zetSoldaten(D, huis, 'militie', 2);
  T.soldatenVan(D, huis)[0].soldaat.dienst = 'nacht';
  const opUur = (u) => (S.kalender.dag = Math.floor(S.kalender.dag) + u / 24);
  opUur(12);
  assert.deepEqual(T.lichtDragers(D), [], 'overdag brandt er geen');
  opUur(23);
  const leider = T.groepsleiderVan(D, huis).wezen;
  for (const e of [D.aanvoerder, leider]) e.binnen = false;
  assert.deepEqual(T.lichtDragers(D), [D.aanvoerder, leider]);
  leider.binnen = true;
  assert.deepEqual(T.lichtDragers(D), [D.aanvoerder], 'binnen niet');
});
