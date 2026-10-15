// De zager aan het werk (js/veldwerk.js; werklijst vraag 168; Marcel, 14 okt: "Ik wil wel dat je iemand ziet werken"):
// de eerste hand van een zagerij die zaagt, staat op de tegel voor haar deur en zaagt aan de zaagbok, die daar binnen
// ligt (gereedschap/pixelart/huizen.cjs); zaagt de zagerij niet, dan staat hij er ook niet.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, bouwAf, dagen } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

function dorp() {
  const { S } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = S;
  return S;
}

function zo(f) {
  const toeval = Math.random;
  let n = 7;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  T.zetOptie('voorvallen', 'uit');
  try {
    return f();
  } finally {
    T.optiesTerug();
    Math.random = toeval;
  }
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag`; `elk` kijkt elk beeld mee.
function totUur(S, dag, tot, elk) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    T.wereldTik(S); // een tik van de wereld, zoals het spel (js/tik.js)
    if (elk) elk();
  }
}

function metZagerij(S) {
  const D = S.dorp;
  T.zetVoorraad(D, 'graan', 500);
  T.zetVoorraad(D, 'hout', 100);
  T.zetVoorraad(D, 'goud', 50);
  const g = T.proefdorp.zetBijHetVuur(D, 'zagerij');
  const dag = Math.floor(S.kalender.dag);
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  assert.ok(g.klaar, 'de zagerij staat');
  const werken = D.bewoners.mensen.filter((p) => p.werk === g);
  assert.ok(werken.length && werken[0].wezen, 'er werkt iemand');
  return { D, g, zager: werken[0].wezen, ander: werken[1] && werken[1].wezen };
}

test('de zager staat op de tegel voor de deur, kijkt naar de zaagbok binnen, en zaagt', () => zo(() => {
  const S = dorp();
  const { D, g, zager, ander } = metZagerij(S);
  const deur = T.deurVan(D.wereld, g);
  const r = T.voetVanGebouw(g);
  const dag = Math.floor(S.kalender.dag) + 1;
  S.kalender.dag = dag + 6 / 24;
  let zaagde = false;
  totUur(S, dag, 16, () => {
    g.werkte = 1; // hij zaagt vandaag (de regel zet het 's nachts, js/gebouwen.js)
    const wt = zager.werkt;
    if (wt && wt.soort === 'zagen' && wt.tot != null && !wt.rust && !zager.pad.length) {
      assert.deepEqual({ x: zager.tx, y: zager.ty }, { x: deur.x, y: deur.y }, 'op de tegel voor de deur');
      const binnen = wt.op.x >= r.x && wt.op.x < r.x + r.b && wt.op.y >= r.y && wt.op.y < r.y + r.h;
      assert.ok(binnen, 'hij kijkt naar binnen');
      assert.equal(Math.abs(wt.op.x - deur.x) + Math.abs(wt.op.y - deur.y), 1, 'naar de tegel naast de deur');
      zaagde = true;
    }
    if (ander) assert.ok(!ander.werkt || ander.werkt.soort !== 'zagen', 'er zaagt er maar één');
  });
  assert.ok(zaagde, 'hij zaagde');
}));

test('zaagt de zagerij niet (geen stammen, de stapel vol), dan zaagt niemand', () => zo(() => {
  const S = dorp();
  const { g, zager } = metZagerij(S);
  const dag = Math.floor(S.kalender.dag) + 1;
  S.kalender.dag = dag + 6 / 24;
  totUur(S, dag, 12, () => {
    g.werkte = 0;
    assert.ok(!zager.werkt || zager.werkt.soort !== 'zagen', 'niemand aan de zaagbok');
  });
}));
