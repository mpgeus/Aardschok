// De minikaart (js/minikaart.js; werklijst vraag 165, Marcel, 14 okt: "Onder in de ui zoals bij age of Empires", "Het
// hele eiland"): het beeld van het eiland in stukjes is hetzelfde als in één keer, wat je kent klopt per vak met de mist,
// en een punt op de ruit is weer dezelfde tegel.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { leegBegin } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

test('het beeld van het eiland in stukjes is hetzelfde als in één keer', () => {
  const { w } = leegBegin(T);
  const E = T.eilandVan(w.eiland.zaad);
  T.maakMinikaart(E);
  const heel = T.minikaartBeeld(E);
  assert.equal(heel.klaar, heel.n);
  assert.equal(heel.n, Math.ceil(T.EILAND_INSTELLINGEN.maat / T.MINIKAART_INSTELLINGEN.stap));
  // Een tweede beeld van hetzelfde eiland, in stukjes van zeven rijen (een ander eiland-object met hetzelfde nummer).
  const E2 = T.maakEiland(w.eiland.zaad);
  let keer = 0;
  while (!T.maakMinikaart(E2, 7)) keer++;
  assert.ok(keer > 10, 'in stukjes');
  const stukjes = T.minikaartBeeld(E2);
  assert.deepEqual(stukjes.rgba, heel.rgba);
  // Geen ruit (Marcel: "dat je geen ruit meer overhoud"): de zee ver van de kust is doorzichtig, het land heel.
  const alfa = (i) => heel.rgba[i * 4 + 3];
  assert.equal(heel.zee[0], 1, 'de hoek is zee');
  assert.equal(alfa(0), 0, 'en doorzichtig');
  const land = heel.zee.findIndex((z) => z === 0);
  assert.equal(alfa(land), 255, 'het land is heel');
  assert.ok(heel.zee.some((z, i) => z && alfa(i) > 0 && alfa(i) < 255), 'aan de kust vervaagt de zee');
  // De lijn om het eiland (Marcel: "een 1px outline"): binnen ligt het land en de zee dicht bij de kust, de hoek niet.
  assert.equal(heel.binnen[land], 1);
  assert.equal(heel.binnen[0], 0);
  assert.ok(heel.binnen.some((b, i) => b && heel.zee[i]), 'en een strook zee');
});

test('wat je kent, per vak: elk vak met een tegel die je kent, en geen ander', () => {
  const { w, S, D } = leegBegin(T);
  const gekend = T.minikaartGekend(D);
  const stap = T.MINIKAART_INSTELLINGEN.stap;
  const n = Math.ceil(T.EILAND_INSTELLINGEN.maat / stap);
  assert.ok(gekend.reduce((a, b) => a + b, 0) > 50, 'de kring van het begin');
  // Rond de aanvoerder: elk vak dat de minikaart kent, heeft een tegel die je kent, en andersom.
  const sx = Math.floor(S.dorp.aanvoerder.x / stap);
  const sy = Math.floor(S.dorp.aanvoerder.y / stap);
  for (let vy = sy - 12; vy <= sy + 12; vy++) {
    for (let vx = sx - 12; vx <= sx + 12; vx++) {
      let echt = false;
      for (let y = vy * stap; y < (vy + 1) * stap && !echt; y++) for (let x = vx * stap; x < (vx + 1) * stap && !echt; x++) echt = T.kentTegel(D, x, y);
      assert.equal(gekend[vy * n + vx] === 1, echt, `vak ${vx},${vy}`);
    }
  }
  // Een heel stuk dat je kent (true), telt helemaal mee.
  D.gekend.set(T.stukNummer(1, 1), true);
  const meer = T.minikaartGekend(D);
  const per = 64 / stap;
  for (let i = 0; i < per; i++) assert.equal(meer[(per + i) * n + per + i], 1);
});

test('een punt op de ruit is weer dezelfde tegel', () => {
  for (const [x, y] of [[0, 0], [2499, 0], [1250, 1250], [300, 2100]]) {
    const p = T.minikaartPunt(x, y, 328);
    const t = T.minikaartTegel(p.x, p.y, 328);
    assert.ok(Math.abs(t.x - x) < 1e-6 && Math.abs(t.y - y) < 1e-6, `${x},${y}`);
    assert.ok(p.x >= 0 && p.x <= 328 && p.y >= 0 && p.y <= 164, 'op de ruit');
  }
  // Tegel (0, 0) bovenaan in het midden, zoals in het beeld (T.naarScherm).
  assert.deepEqual(T.minikaartPunt(0, 0, 328), { x: 164, y: 0 });
});
