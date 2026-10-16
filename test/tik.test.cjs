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

// ── De opdrachten van de spelers ──

// Een plek voor een hut, zoals de kolonist hem zoekt (T.plekVoor, js/bouwen.js).
const plekVoorHut = (D) => T.plekVoor(D, 'hut', D.aanvoerder ? { x: D.aanvoerder.tx, y: D.aanvoerder.ty } : { x: 0, y: 0 });

test('een opdracht gaat in bij de volgende tik, en zegt wat er gebeurde', () => {
  const { S, D } = proefDorp(T);
  const plek = plekVoorHut(D);
  assert.ok(plek, 'er is plek voor een hut');
  const voor = D.gebouwen.length;
  const o = T.geefOpdracht(S, { soort: 'bouw', gebouw: 'hut', x: plek.x, y: plek.y });
  assert.equal(o.dorp, S.dorpen.indexOf(D), 'zonder dorp: je eigen dorp');
  assert.equal(D.gebouwen.length, voor, 'nog niets: de opdracht wacht op de tik');
  const gezegd = [];
  const was = T.ui;
  T.ui = { bericht: (t, soort) => gezegd.push({ t, soort }) };
  try {
    T.wereldTik(S);
  } finally {
    T.ui = was;
  }
  assert.equal(D.gebouwen.length, voor + 1, 'de hut staat er na de tik');
  assert.equal(S.opdrachten.length, 0);
  assert.equal(gezegd.length, 1);
  assert.equal(gezegd[0].soort, 'goed', gezegd[0].t);
  // Dezelfde opdracht nog eens: de plek is bezet, en de regel zegt waarom niet.
  T.geefOpdracht(S, { soort: 'bouw', gebouw: 'hut', x: plek.x, y: plek.y });
  T.ui = { bericht: (t, soort) => gezegd.push({ t, soort }) };
  try {
    T.wereldTik(S);
  } finally {
    T.ui = was;
  }
  assert.equal(D.gebouwen.length, voor + 1);
  assert.equal(gezegd[1].soort, 'gevaar');
  assert.throws(() => T.geefOpdracht(S, { soort: 'toveren' }), /bestaat/);
});

test('dezelfde opdrachten bij dezelfde tikken geven dezelfde wereld, hoe de beelden ook vallen', () => {
  // Een hut, een weg ernaast, en de hut weer afbreken: ingaand bij tik 30, 200 en 400, tussen beelden die anders vallen.
  const EIND = 900;
  function speelMet(beelden) {
    const { S, D } = proefDorp(T);
    S.kalender.snelheid = 30;
    const plek = plekVoorHut(D);
    const plan = new Map([
      [30, { soort: 'bouw', gebouw: 'hut', x: plek.x, y: plek.y }],
      [200, { soort: 'weg', van: { x: plek.x, y: plek.y + 3 }, tot: { x: plek.x + 6, y: plek.y + 3 } }],
      [400, { soort: 'afbreken', x: plek.x, y: plek.y }],
    ]);
    const tik = () => S.tik || 0;
    const klok = { rest: 0 };
    for (let i = 0; tik() < EIND; i++) {
      // Wie klikt, klikt tussen twee beelden: de opdracht gaat in bij de tik erna.
      if (plan.has(tik() + 1)) {
        T.geefOpdracht(S, plan.get(tik() + 1));
        plan.delete(tik() + 1);
      }
      // Ligt de volgende klik (of het eind) binnen dit beeld, dan één tik tegelijk; anders tikken zoals de beelden vallen.
      const volgende = Math.min(EIND, ...plan.keys());
      if (volgende - tik() <= T.TIK_INSTELLINGEN.meestPerBeeld + 1) T.wereldTik(S);
      else T.tikBij(S, klok, beelden[i % beelden.length]);
    }
    return S;
  }
  const a = speelMet([1 / 60]);
  const b = speelMet([1 / 30, 1 / 144, 0.05]);
  assert.equal(a.tik, EIND);
  assert.equal(b.tik, EIND);
  assert.ok(staat(a) === staat(b), 'met andere beelden liep de wereld met dezelfde opdrachten anders');
});

test('het scherm roept de regels van een opdracht niet zelf aan: het geeft een opdracht (T.geefOpdracht)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { ALLEEN_SCHERM } = require('./laad.cjs');
  // Wat de tik voor een opdracht doet (T.OPDRACHTEN, js/tik.js), en wat een handeling van afbreken doet.
  const REGELS = /T\.(plaatsGebouw|legWeg|legVeld|zetSoldaten|breekAf|haalWegWeg|stopWegwerk)\(/;
  const fout = [];
  for (const f of ALLEEN_SCHERM.filter((f) => f.startsWith('js/'))) {
    let tekst = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    // Spel.debug (js/main.js) is gereedschap voor wie test, geen klik van een speler.
    if (f === 'js/main.js') tekst = tekst.slice(0, tekst.indexOf('T.debug = {'));
    tekst.split('\n').forEach((regel, i) => {
      if (REGELS.test(regel.replace(/\/\/.*$/, ''))) fout.push(`${f}:${i + 1}: ${regel.trim()}`);
    });
  }
  assert.deepEqual(fout, [], 'geef een opdracht (T.geefOpdracht, js/tik.js), zodat hij in lockstep bij elke computer in dezelfde tik ingaat');
});
