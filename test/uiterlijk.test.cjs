// Het uiterlijk van een bewoner (js/bewoners.js, T.kiesUiterlijk; werklijst vraag 145, 1; Marcel, 9 okt: "Kunnen we
// iedereen uniek maken?"): het uiterlijk dat het minst voorkomt, niet dat van iemand uit zijn gezin, en een kind met het
// haar van een ouder. De uiterlijken komen uit de beelden (T.BEELDEN.uiterlijken, gereedschap/pixelart/naar-spel.cjs);
// hier een eigen lijst, zodat de toets niet op de kunst wacht.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
T.zetOptie('wieBouwt', 'jij');
T.ui = new Proxy({}, { get: () => () => undefined });

const HAREN = ['blond', 'bruin', 'zwart', 'rood', 'blond', 'bruin', 'zwart', 'rood'];
function metUiterlijken(doe) {
  const oud = T.BEELDEN;
  T.BEELDEN = { ...(oud || {}), uiterlijken: { boer: HAREN, boerin: HAREN, jongen: HAREN, meisje: HAREN, kleuter: HAREN, oudeman: HAREN, oudevrouw: HAREN } };
  try {
    return doe();
  } finally {
    T.BEELDEN = oud;
  }
}

function gehucht() {
  const echt = console.warn;
  const toeval = Math.random;
  let n = 7;
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
  T.S = S;
  return S;
}

test('zonder uiterlijken in de beelden heeft niemand er een', () => {
  const oud = T.BEELDEN;
  T.BEELDEN = { ...(oud || {}), uiterlijken: undefined };
  try {
    const D = gehucht().dorp;
    for (const p of D.bewoners.mensen) if (p.wezen && p.wezen.soort === 'bewoner') assert.equal(T.kiesUiterlijk(D, p), null);
  } finally {
    T.BEELDEN = oud;
  }
});

test('in een gezin draagt niemand hetzelfde uiterlijk, en de kinderen hebben het haar van een ouder', () => {
  metUiterlijken(() => {
    const D = gehucht().dorp;
    const mensen = D.bewoners.mensen.filter((p) => p.wezen && p.wezen.soort === 'bewoner');
    for (const p of mensen) {
      delete p.uiterlijk;
      delete p.haar;
    }
    // eerst de ouders, dan de kinderen, zoals een gezin binnenkomt
    const volgorde = ['volwassen', 'oud', 'jong', 'kind', 'kleuter'];
    mensen.sort((a, b) => volgorde.indexOf(a.leeftijd) - volgorde.indexOf(b.leeftijd));
    for (const p of mensen) p.uiterlijk = T.kiesUiterlijk(D, p);
    for (const p of mensen) {
      assert.ok(Number.isInteger(p.uiterlijk), `${p.naam} heeft een uiterlijk`);
      const lijf = T.UITERLIJK_LIJF[p.wezen.vel];
      const zelfde = mensen.filter((x) => x !== p && x.gezin === p.gezin && T.UITERLIJK_LIJF[x.wezen.vel] === lijf && x.uiterlijk === p.uiterlijk);
      assert.equal(zelfde.length, 0, `${p.naam} deelt zijn uiterlijk met zijn gezin`);
    }
    const kinderen = mensen.filter((p) => p.band === 'zoon' || p.band === 'dochter');
    assert.ok(kinderen.length, 'er zijn kinderen');
    for (const k of kinderen) {
      const ouders = D.bewoners.mensen.filter((x) => x.gezin === k.gezin && x.haar && (x === k.hoofd || x.hoofd === k.hoofd) && x.leeftijd !== 'kind' && x.leeftijd !== 'kleuter');
      if (ouders.length) assert.ok(ouders.some((o) => o.haar === k.haar), `${k.naam} heeft het haar van een ouder`);
      assert.equal(HAREN[k.uiterlijk], k.haar);
    }
    // man en vrouw kiezen hun haar elk zelf: in een dorp van deze maat zijn niet alle paren gelijk
    const paren = mensen.filter((p) => p.band === 'vrouw' && p.hoofd && p.hoofd.haar);
    assert.ok(paren.some((v) => v.haar !== v.hoofd.haar), 'niet elk paar heeft hetzelfde haar');
  });
});

test('wie een fase verder gaat, houdt zijn haar', () => {
  metUiterlijken(() => {
    const D = gehucht().dorp;
    T.tikLevenDag(D, 0);
    const p = D.bewoners.mensen.find((x) => x.leeftijd === 'kind' && T.wordtOuder(x) && x.wezen);
    assert.ok(p, 'er is een kind');
    p.uiterlijk = T.kiesUiterlijk(D, p);
    const haar = p.haar;
    p.geboren = -(T.LEVEN_INSTELLINGEN.fasen.kleuter + T.LEVEN_INSTELLINGEN.fasen.kind) * T.DAGEN_PER_JAAR;
    T.tikLevenDag(D, 0);
    assert.equal(p.leeftijd, 'jong');
    assert.equal(p.haar, haar);
    assert.equal(HAREN[p.uiterlijk], haar);
  });
});
