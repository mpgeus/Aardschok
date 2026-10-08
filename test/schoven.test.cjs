// De oogst binnenhalen (werklijst vraag 140; Marcel, 8 okt: "Alles telt pas als het binnen is"): de boer maait, het zwad
// blijft liggen, de boerin en de kinderen binden het tot hokken, die drogen, en dan dragen ze de schoven naar de schuur.
// Pas dan is het graan in de voorraad.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => undefined });

function gehucht(dag) {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 11;
  console.warn = () => {};
  Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht'));
  } finally {
    console.warn = echt;
    Math.random = toeval;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  S.kalender.dag = dag;
  S.dorp.gebouwenDag = Math.floor(dag);
  return S;
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (zoals test/veldwerk.test.cjs).
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    const dt = 1 / 60;
    S.tijd += dt;
    const dtW = dt * T.wereldFactor(S);
    S.wereldTijd += dtW;
    T.tikKalender(S, dt);
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    for (const D of S.dorpen) T.werkDorpBij(S, D, dt, dtW);
    T.werkAnimatiesBij(S, dt, dtW);
    T.werkOogstBij(S, S.dorp, dtW);
    T.werkVeldwerkBij(S, S.dorp);
    T.laatDwalen(S, dtW);
  }
}

function dagIn(maand, dagVanMaand) {
  for (let d = 0; d < T.DAGEN_PER_JAAR; d++) {
    const x = T.datumVanDag(d);
    if (T.MAANDEN[x.maand].naam === maand && x.dagVanMaand === dagVanMaand) return d;
  }
  throw new Error(maand);
}

test('het graan blijft als zwad liggen, wordt gebonden, droogt in hokken, en komt pas binnen in de schuur', () => {
  const dag = dagIn('hooimaand', 15);
  const S = gehucht(dag + 6 / 24);
  const D = S.dorp;
  T.zetOptie('voorvallen', 'uit');
  try {
    const akkers = D.wereld.akkers;
    const standen = () => {
      const tel = {};
      for (const a of akkers) for (const t of T.akkerTegels(a)) {
        const st = T.akkerTegelStadium(a, t.x, t.y, T.akkerStadium(T.datumVanDag(S.kalender.dag).maand, T.datumVanDag(S.kalender.dag).dagVanMaand));
        tel[st] = (tel[st] || 0) + 1;
      }
      return tel;
    };
    let gezienHokken = false;
    let binnenGekomen = false;
    let graan = D.voorraad.graan;
    for (let d = 0; d < 8; d++) {
      totUur(S, dag + d, 18);
      const st = standen();
      if (st.hokken) gezienHokken = true;
      // Komt er graan bij, dan is het binnen (het dorp eet ook, dus het moet meer zijn dan een kruimel).
      if (D.voorraad.graan > graan + 1) binnenGekomen = true;
      graan = D.voorraad.graan;
      totUur(S, dag + d + 1, 6);
    }
    const st = standen();
    assert.ok(gezienHokken, `hokken op het veld: ${JSON.stringify(st)}`);
    assert.ok(st.stoppels > 0, `stoppels waar het binnen is: ${JSON.stringify(st)}`);
    assert.ok(binnenGekomen, 'het graan kwam binnen in de schuur');
  } finally {
    T.optiesTerug();
  }
});

test('wat nog op het veld staat als de oogsttijd om is, halen ze in één keer binnen', () => {
  const S = gehucht(dagIn('oogstmaand', 20) + 0.5);
  const D = S.dorp;
  const a = D.wereld.akkers.find((v) => T.planVan(v) === 'akker');
  a.geoogst = new Set(['x']);
  a.schoven = new Map([[`${a.x},${a.y}`, { graan: 4, gebonden: null }], [`${a.x + 1},${a.y}`, { graan: 4, gebonden: 3 }]]);
  T.zetVoorraad(D, 'graan', 0);
  T.haalOogstBinnen(D);
  assert.equal(a.schoven.size, 0);
  assert.ok(D.voorraad.graan >= 8, `${D.voorraad.graan}`);
});
