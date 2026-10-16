// Meer dorpen op één kaart (werklijst vraag 170, stap 6a; Marcel, 15 okt: "elk een eigen dorp op hetzelfde eiland", en
// 16 okt: "A1 b1 c2 d1"): een tweede dorp op de dichtste andere dorpsplek van het eiland (T.dorpErbij, js/gebied.js),
// met zijn eigen plek, zijn eigen mensen en zijn eigen mist. Wat het ene dorp doet, raakt het andere niet: het eerste
// speelt letter voor letter hetzelfde, met of zonder het tweede op de kaart.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

// Wat er tegen het scherm gezegd wordt: [tekst, soort, plek, het dorp dat het zegt].
const gezegd = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (...a) => gezegd.push(a) : () => {}) });

// Het proefdorp (test/grond.cjs), met of zonder een tweede dorp op de kaart. `opties` gaan naar het proefdorp.
function spel(metTweede, opties = {}) {
  const { S } = proefDorp(T, opties);
  S.bezocht = S.bezocht || new Set();
  if (metTweede) T.dorpErbij(S);
  return S;
}

// Zet een wezen op tegel t, stil en buiten.
function zet(e, t) {
  Object.assign(e, { x: t.x, y: t.y, tx: t.x, ty: t.y, pad: [], onderweg: false, binnen: false });
}
// Een vrije tegel naast (x, y) die je van daar ziet, `d` tegels verder.
function naast(w, van, d) {
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
    const t = { x: van.x + dx * d, y: van.y + dy * d };
    if (T.isBegaanbaar(w, t.x, t.y, { wezensBlokkeren: true }) && T.zichtTussen(w, van, t)) return t;
  }
  throw new Error(`geen vrije tegel op ${d} van ${van.x},${van.y}`);
}
// Tik de wereld `seconden` lang bij, op 1×.
function tik(S, seconden) {
  for (let i = 0; i < Math.round(seconden / T.TIK); i++) T.wereldTik(S);
}

// Een dorp in getallen, zonder de kaart die ze delen: zijn voorraad, zijn gebouwen, waar zijn mensen staan, wat het kent,
// en hoe ver zijn dobbelsteen rolde (elke worp te veel of te weinig is een verschil).
function foto(D) {
  const w = D.wereld;
  return JSON.stringify({
    voorraad: D.voorraad,
    bevolking: D.bevolking,
    gebouwen: D.gebouwen.map((g) => [g.soort, g.x, g.y, !!g.klaar]),
    wezens: w.wezens.filter((e) => e.dorp === D).map((e) => [e.soort, e.naam, e.tx, e.ty, !!e.binnen, !!e.dood]),
    gekend: [...D.gekend.keys()].sort((a, b) => a - b),
    lot: D.lot.stand,
  });
}

test('een tweede dorp: op een andere dorpsplek van hetzelfde eiland, ver genoeg weg, met zijn eigen plek', () => {
  const S = spel(true);
  const [D1, D2] = S.dorpen;
  assert.ok(D2.wereld === D1.wereld, 'op dezelfde kaart');
  assert.notEqual(D2.plek.naam, D1.plek.naam, 'op een andere dorpsplek');
  const m = (D) => ({ x: D.plek.vak.x + D.plek.vak.b / 2, y: D.plek.vak.y + D.plek.vak.h / 2 });
  assert.ok(T.afstand(m(D1), m(D2)) >= T.MAKER_INSTELLINGEN.anderDorp, 'ver genoeg weg');
  assert.deepEqual(D1.wereld.pleinen, [D1.plek.plein, D2.plek.plein], 'de kaart heeft hun twee pleinen');
  assert.ok(D2.aanvoerder && D2.aanvoerder.dorp === D2 && D1.aanvoerder.dorp === D1, 'elk zijn eigen aanvoerder');
  assert.ok(D2.begin && D2.gebouwen.some((g) => g.soort === 'tent'), 'het lege begin: zijn kamp');
  assert.ok(D2.plek.markt && D2.plek.markt.rijen.length === 2, 'en zijn marktplek');
  const v = T.kaartVak(D1.wereld);
  for (const D of S.dorpen) assert.ok(T.inVak(v, D.plek.vak.x, D.plek.vak.y) && T.inVak(v, D.plek.vak.x + D.plek.vak.b - 1, D.plek.vak.y + D.plek.vak.h - 1), 'het vak van de kaart omvat hun land');
  const midden = m(D2);
  assert.ok(T.kentTegel(D2, Math.round(midden.x), Math.round(midden.y)) && !T.kentTegel(D1, Math.round(midden.x), Math.round(midden.y)), 'elk zijn eigen mist');
});

test('het eerste dorp speelt letter voor letter hetzelfde, met of zonder een tweede dorp op de kaart', () => {
  const alleen = spel(false);
  const samen = spel(true);
  for (const S of [alleen, samen]) T.zetSnelheid(S, 30);
  const tikken = Math.round((T.DAG_LENGTE / 30 / T.TIK) * 20); // twintig dagen
  for (let i = 0; i < tikken; i++) {
    T.wereldTik(alleen);
    T.wereldTik(samen);
    if (i % 600 === 0) assert.equal(foto(samen.dorpen[0]), foto(alleen.dorpen[0]), `na ${i} tikken`);
  }
  assert.equal(foto(samen.dorpen[0]), foto(alleen.dorpen[0]), 'na twintig dagen');
  const D2 = samen.dorpen[1];
  assert.ok(D2.begin.kamp !== 'onderweg', 'en het tweede leefde ook: zijn kamp staat');
});

test('wie van een ander dorp is, is een vijand (C2): een soldaat valt zijn aanvoerder aan, en dat dorp vecht dan ook', () => {
  const S = spel(true, { gebouwen: ['wachthuis'] });
  const [A, B] = S.dorpen;
  S.kalender.dag = Math.floor(S.kalender.dag) + 10 / 24; // overdag
  const huis = A.gebouwen.find((g) => g.soort === 'wachthuis');
  T.zetSoldaten(A, huis, 'militie', 1);
  const man = T.soldatenVan(A, huis)[0].wezen;
  const dorpeling = A.bewoners.mensen.find((p) => p.wezen && !p.soldaat && !p.aanvoerder && p.wezen !== A.aanvoerder).wezen;
  assert.ok(T.isVijandVan(A, B.aanvoerder) && T.isVijandVan(B, man) && T.isVijandVan(B, dorpeling), 'de mensen van de ander, ook een dorpeling');
  assert.ok(!T.isVijandVan(A, dorpeling) && !T.isVijandVan(A, man), 'je eigen mensen niet');
  assert.ok(!T.isVijandVan(A, B.begin.kar), 'zijn ossenkar niet');
  assert.ok(!T.isMan(A, B.aanvoerder) && T.isMan(B, B.aanvoerder), 'de aanvoerder is van zijn eigen dorp');
  // de aanvoerder van het tweede dorp komt bij de soldaat van het eerste
  const w = S.wereld;
  zet(B.aanvoerder, naast(w, { x: man.tx, y: man.ty }, 3));
  delete B.begin.volgt; // hij loopt niet meer met zijn kar mee
  let valtAan = false;
  for (let i = 0; i < Math.round(6 / T.TIK); i++) {
    T.wereldTik(S);
    valtAan = valtAan || man.doelwit === B.aanvoerder; // (geen wezens in een assert: die trekken hun hele dorp mee)
  }
  assert.ok(valtAan, 'de soldaat valt hem aan');
  assert.ok(B.aanvoerder.leven < B.aanvoerder.maxLeven, 'en raakt hem');
  assert.ok(A.gevecht && B.gevecht, 'allebei de dorpen vechten');
});

test('een dorpeling vlucht voor de mannen van een ander dorp, naar zijn eigen town hall', () => {
  const S = spel(true);
  const [A, B] = S.dorpen;
  S.kalender.dag = Math.floor(S.kalender.dag) + 10 / 24;
  const p = A.bewoners.mensen.find((q) => q.wezen && !q.soldaat && !q.aanvoerder);
  const hal = A.gebouwen.find((g) => g.soort === 'raadhuis' && g.klaar);
  zet(B.aanvoerder, naast(S.wereld, { x: p.wezen.tx, y: p.wezen.ty }, 3));
  delete B.begin.volgt;
  tik(S, 0.5);
  const deur = T.deurVan(S.wereld, hal);
  assert.deepEqual(p.schuilt, { x: deur.x, y: deur.y }, 'naar het town hall van zijn eigen dorp');
});

test('je bouwt niet in het bereik van een ander dorp', () => {
  const S = spel(true);
  const [A, B] = S.dorpen;
  const I = T.BEGIN_INSTELLINGEN;
  const was = I.bouwBereik;
  try {
    I.bouwBereik = 1000; // zo reikt het eerste dorp tot het plein van het tweede
    const t = T.pleinTegels(B)[0];
    const r = { x: t.x + 6, y: t.y + 6, b: 1, h: 1 };
    assert.match(T.waaromBuitenBouwBereik(A, r) || '', /belongs to/);
  } finally {
    I.bouwBereik = was;
  }
  const t = T.pleinTegels(B)[0];
  assert.equal(T.waaromBuitenBouwBereik(B, { x: t.x + 6, y: t.y + 6, b: 1, h: 1 }), null, 'het tweede dorp zelf wel');
});

test('wat een dorp zegt, gaat met het dorp naar het scherm, dat alleen je eigen dorp laat zien', () => {
  const S = spel(true);
  const [, B] = S.dorpen;
  gezegd.length = 0;
  T.zeg(B, 'Iets in het tweede dorp.', 'rust');
  assert.equal(gezegd.length, 1);
  assert.ok(gezegd[0][3] === B, 'het scherm hoort van welk dorp (js/ui.js toont alleen S.dorp)');
});

test('bewaren en laden met twee dorpen op één kaart', () => {
  const S = spel(true);
  tik(S, 2);
  const S2 = {};
  assert.ok(T.herstelSpel(S2, T.bewaarSpel(S, { nu: 0 })).gelukt);
  const [A, B] = S2.dorpen;
  assert.ok(B.wereld === A.wereld, 'nog steeds één kaart');
  assert.equal(B.plek.naam, S.dorpen[1].plek.naam);
  assert.ok(B.aanvoerder.dorp === B && A.aanvoerder.dorp === A, 'elk wezen bij zijn dorp');
  assert.ok(A.wereld.wezens.every((e) => !e.dorp || S2.dorpen.includes(e.dorp)));
  assert.equal(T.bewaarSpel(S2, { nu: 0 }), T.bewaarSpel(S, { nu: 0 }), 'letter voor letter hetzelfde spel');
});
