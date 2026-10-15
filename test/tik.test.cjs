// De tik van de wereld (js/tik.js; werklijst vraag 170, stap 0; Marcel, 15 okt: live samen spelen al in de demo, in
// lockstep). In lockstep rekent elke computer de hele wereld zelf; dat gaat alleen goed als de wereld op elke computer
// letter voor letter gelijk loopt. Dit toetst de twee dingen die per computer verschillen: het toeval van de browser
// (Math.random, alleen voor het scherm) en hoeveel beelden hij tekent. Twee werelden uit hetzelfde begin, met dezelfde
// tikken, moeten dan precies gelijk zijn.
const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

// Wat er bewaard wordt (js/opslaan.js): alles van de wereld, zonder wat alleen scherm is.
const staat = (S) => JSON.stringify(T.bewaarSpel(S, { nu: 0 }));

// Een Math.random met een eigen zaad: zo heeft elke "computer" een ander toeval van de browser.
function metBrowserToeval(zaad, doe) {
  const was = Math.random;
  let n = zaad;
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  try {
    return doe();
  } finally {
    Math.random = was;
  }
}

// Het proefdorp op 30×, `tikken` tikken lang. `beelden`: de duur van de beelden van deze computer, steeds om de beurt
// (T.tikBij, zoals js/main.js); zonder: elke tik los (T.wereldTik, zoals Spel.debug.stap).
function speel(tikken, beelden) {
  const { S } = proefDorp(T);
  S.kalender.snelheid = 30;
  const klok = { rest: 0 };
  const tik = () => S.tik || 0; // een nieuw spel heeft nog niet getikt
  for (let i = 0; tik() < tikken; i++) {
    if (!beelden || tik() + T.TIK_INSTELLINGEN.meestPerBeeld > tikken) T.wereldTik(S);
    else T.tikBij(S, klok, beelden[i % beelden.length]);
  }
  return S;
}

// Twee dagen: lopen, dwalen, praatjes, de kar, de bouwers, en een ochtend met zijn dagregels.
const TIKKEN = 2 * Math.ceil(T.DAG_LENGTE / (30 * T.TIK));

test('dezelfde tikken geven dezelfde wereld, ook met een ander toeval van de browser', () => {
  const dag = proefDorp(T).S.kalender.dag;
  const A = metBrowserToeval(7, () => speel(TIKKEN));
  const b = metBrowserToeval(424242, () => staat(speel(TIKKEN)));
  assert.ok(A.kalender.dag - dag > 1.9, `de wereld liep geen twee dagen: ${A.kalender.dag - dag}`);
  assert.ok(staat(A) === b, 'de wereld hangt van Math.random af: zoek wie het gebruikt, en neem T.toeval of T.vastLot (js/dorp.js)');
});

test('hoeveel beelden een computer tekent, verandert de wereld niet: alleen de tikken tellen', () => {
  const gewoon = staat(speel(TIKKEN));
  // Een trage computer (30 beelden per seconde), een snelle (144), en een die hapert.
  for (const beelden of [[1 / 30], [1 / 144], [1 / 60, 0.05, 1 / 75, 1 / 200, 0.03]]) {
    const S = speel(TIKKEN, beelden);
    assert.equal(S.tik, TIKKEN);
    assert.ok(staat(S) === gewoon, `met beelden van ${beelden.map((b) => Math.round(b * 1000)).join(', ')} ms liep de wereld anders`);
  }
});

test('een tik gaat al als er een halve klaarligt, en hooguit drie per beeld', () => {
  const { S } = proefDorp(T);
  const klok = { rest: 0 };
  assert.equal(T.tikBij(S, klok, T.TIK * 0.4), 0, 'minder dan een halve tik: nog niets');
  assert.equal(T.tikBij(S, klok, T.TIK * 0.2), 1, 'nu ligt er meer dan een halve');
  assert.equal(T.tikBij(S, klok, 1), T.TIK_INSTELLINGEN.meestPerBeeld, 'een seconde in één beeld: hooguit drie');
  assert.equal(klok.rest, 0, 'wat de computer niet bijhield, is vergeten: de wereld loopt dan langzamer');
});
