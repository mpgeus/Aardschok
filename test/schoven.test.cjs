// De oogst binnenhalen (werklijst vraag 140; Marcel, 8 okt: "Alles telt pas als het binnen is"): de boer maait, het zwad
// blijft liggen, de boerin en de kinderen binden het tot hokken, die drogen, en dan dragen ze de schoven naar de schuur.
// Pas dan is het graan in de voorraad.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');
T.ui = new Proxy({}, { get: () => () => undefined });

// Het proefdorp (test/grond.cjs) op `dag`, met vaste toeval: twee boerderijen met hun boer en akker, en hutten. De akkers
// zijn gezaaid zoals het voorjaar dat deed (het proefdorp is van dag 2; wat de boeren dan nog zaaien, staat in
// `ongezaaid`), en de boeren hebben hun akkers (T.werkDeBoerenBij, anders pas na de eerste nacht).
function dorpOp(dag) {
  const { S, D, akkers } = proefDorp(T);
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() });
  for (const a of akkers) a.ongezaaid.clear();
  T.werkDeBoerenBij(D);
  S.kalender.dag = dag;
  D.gebouwenDag = Math.floor(dag);
  // Geen overvallen: deze toetsen gaan over de oogst, en sinds het gevecht in real time (vraag 170, stap 2) vlucht wie
  // een rover ziet naar het town hall, en maait dan niet.
  D.rovers = D.rovers || T.nieuweRovers();
  D.rovers.overvalOp = Infinity;
  return S;
}

// Laat de wereld lopen zoals js/main.js, op 30×, tot het uur `tot` van dag `dag` (zoals test/veldwerk.test.cjs).
function totUur(S, dag, tot) {
  S.kalender.snelheid = 30;
  while (S.kalender.dag < dag + tot / 24) {
    if (S.kalender.stil && S.kalender.stil.length) S.kalender.stil = [];
    T.wereldTik(S); // een tik van de wereld, zoals het spel (js/tik.js)
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
  const S = dorpOp(dag + 6 / 24);
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
  const S = dorpOp(dagIn('oogstmaand', 20) + 0.5);
  const D = S.dorp;
  const a = D.wereld.akkers.find((v) => T.planVan(v) === 'akker');
  a.geoogst = new Set(['x']);
  a.schoven = new Map([[`${a.x},${a.y}`, { graan: 4, gebonden: null }], [`${a.x + 1},${a.y}`, { graan: 4, gebonden: 3 }]]);
  T.zetVoorraad(D, 'graan', 0);
  T.haalOogstBinnen(D);
  assert.equal(a.schoven.size, 0);
  // bij de boerderij, tot de ossenkar het haalt (js/kar.js; werklijst C, stap 3)
  const graan = D.voorraad.graan + T.opDeStapels(D, 'graan');
  assert.ok(graan >= 8, `${graan}`);
});

// De dagloners (vraag 140; Marcel, 8 okt: "Dagloners is een goed idee", en "mensen in het dorp").
test('in de oogst helpt wie in het dorp geen werk heeft de dichtste boerderij, tot drie per boerderij', () => {
  const dag = dagIn('hooimaand', 15);
  const S = dorpOp(dag + 6 / 24);
  const D = S.dorp;
  const vrij = D.bewoners.mensen.filter((p) => p.huis && p.huis.soort !== 'boerderij' && !p.werk && p.wezen && !p.komt
    && (p.leeftijd === 'volwassen' || p.leeftijd === 'jong') && T.kanWerken(p));
  assert.ok(vrij.length > 0, 'er is wie geen werk heeft');
  T.kiesDagloners(D, dag);
  const dagloners = D.bewoners.mensen.filter((p) => p.dagloner);
  assert.equal(dagloners.length, Math.min(vrij.length, 3 * D.gebouwen.filter((g) => g.soort === 'boerderij').length));
  for (const p of dagloners) {
    assert.equal(p.dagloner.soort, 'boerderij');
    assert.ok(vrij.includes(p), `${p.naam} heeft geen werk en woont niet op een boerderij`);
  }
  const perBoerderij = new Map();
  for (const p of dagloners) perBoerderij.set(p.dagloner, (perBoerderij.get(p.dagloner) || 0) + 1);
  for (const n of perBoerderij.values()) assert.ok(n <= T.SCHOVEN_INSTELLINGEN.daglonersPerBoerderij);
  // Buiten de oogst niemand, en met de spelregel uit ook niet.
  T.kiesDagloners(D, dagIn('louwmaand', 10));
  assert.equal(D.bewoners.mensen.filter((p) => p.dagloner).length, 0);
  T.zetOptie('dagloners', 'uit');
  try {
    T.kiesDagloners(D, dag);
    assert.equal(D.bewoners.mensen.filter((p) => p.dagloner).length, 0);
  } finally {
    T.optiesTerug();
  }
});

test('een dagloner bindt en draagt de schoven van zijn boerderij naar de schuur', () => {
  const dag = dagIn('hooimaand', 15);
  const S = dorpOp(dag + 6 / 24);
  const D = S.dorp;
  T.zetOptie('voorvallen', 'uit');
  try {
    T.kiesDagloners(D, dag);
    const p = D.bewoners.mensen.find((q) => q.dagloner);
    assert.ok(p, 'er is een dagloner');
    // Het gezin houdt het maaien makkelijk bij; leg er zwad bij, zoals na een paar dagen maaien op een groot land.
    const boer = D.bewoners.mensen.find((q) => q.huis === p.dagloner && q.wezen && q.wezen.werkAkkers && q.wezen.werkAkkers.length);
    const a = boer.wezen.werkAkkers.find((v) => T.planVan(v) === 'akker');
    a.schoven = new Map(T.akkerTegels(a).slice(0, 30).map((t) => [`${t.x},${t.y}`, { graan: 4, gebonden: null }]));
    a.geoogst = new Set(a.schoven.keys());
    const werk = new Set();
    for (let u = 7; u <= 17; u++) {
      totUur(S, dag, u);
      const wt = p.wezen.werkt;
      if (wt) werk.add(wt.soort);
      if (p.wezen.draagt === 'schoof') werk.add('schoof');
    }
    assert.ok(werk.has('binden'), `${p.naam} bond: ${[...werk]}`);
  } finally {
    T.optiesTerug();
  }
});

test('een dagloner maait het graan van zijn boerderij als er weinig zwad ligt, maar niet met de spelregel op binden', () => {
  const dag = dagIn('oogstmaand', 2);
  for (const keuze of ['maaien', 'binden']) {
    const S = dorpOp(dag + 6 / 24);
    const D = S.dorp;
    T.zetOptie('voorvallen', 'uit');
    T.zetOptie('dagloners', keuze);
    try {
      T.kiesDagloners(D, dag);
      const dagloners = D.bewoners.mensen.filter((q) => q.dagloner);
      // Met binden alleen neemt een boerderij pas dagloners als er schoven liggen.
      if (keuze === 'maaien') assert.ok(dagloners.length, 'er zijn dagloners');
      let maaide = false;
      for (let u = 7; u <= 17 && !maaide; u++) {
        totUur(S, dag, u);
        maaide = dagloners.some((q) => q.wezen.maait);
      }
      assert.equal(maaide, keuze === 'maaien', `${keuze}: maaide ${maaide}`);
      // Twee maaiers nemen nooit dezelfde tegel.
      const tegels = S.dorp.wereld.wezens.filter((e) => e.maait).map((e) => `${e.maait.x},${e.maait.y}`);
      assert.equal(new Set(tegels).size, tegels.length);
    } finally {
      T.optiesTerug();
    }
  }
});
