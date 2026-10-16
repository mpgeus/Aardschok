// Afbreken (js/afbreken.js; werklijst C, stap 5, e; Marcel, 14 okt: "Wegen en gebouwen, nu", en "ze lopen los, met een
// melding dat er huizen nodig zijn"): er komt niets terug, wie erin woonde heeft geen huis, wie er werkte is vrij, wat erbij
// lag haalt de kar, en de velden van een boerderij gaan mee.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, dagen, bouwAf } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

function dorp(opties) {
  const r = proefDorp(T, opties);
  Object.assign(r.S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = r.S;
  return { ...r, dag: Math.floor(r.S.kalender.dag) };
}
const wonenIn = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g);

test('een hut afbreken: hij is weg, zijn grond is weer vrij, en het gezin heeft geen huis', () => {
  const { D, w, hutten } = dorp();
  const hut = hutten.find((g) => wonenIn(D, g).length);
  const gezin = wonenIn(D, hut);
  const v = hut.voorwerp;
  const r = T.voetVanGebouw(hut);
  const h = T.handelingAfbreken(D, r.x, r.y);
  assert.ok(h.kan, h.tekst);
  assert.match(h.tekst, /no home/, 'de muis zegt het vooraf');
  h.doe();
  assert.ok(!D.gebouwen.includes(hut), 'de hut is weg');
  assert.ok(!w.voorwerpen.includes(v), 'en van de kaart');
  assert.ok(T.isBegaanbaar(w, r.x + 1, r.y + 1), 'zijn grond is weer begaanbaar');
  assert.ok(gezin.every((p) => p.huis === null), 'het gezin heeft geen huis');
  const plein = T.dakloosPlek(D);
  assert.ok(gezin.every((p) => !p.wezen || (p.wezen.thuis.x === plein.x && p.wezen.thuis.y === plein.y)), 'het slaapt op het plein');
  assert.equal(T.daklozeGezinnen(D).length, 1);
  assert.ok(T.oorzakenNu(D, Math.floor(D.kalender.dag)).some((o) => o.id === 'dakloos'), 'dat is een status');
});

test('zonder huis slaapt het gezin buiten, en trekt het in de eerste woning met plaats', () => {
  const { S, D, hutten, dag } = dorp();
  const hut = hutten.find((g) => wonenIn(D, g).length);
  const gezin = wonenIn(D, hut);
  T.breekAf(D, hut);
  const e = gezin.find((p) => p.wezen).wezen;
  S.kalender.dag = dag + 0.05; // midden in de nacht
  const anker = T.dagAnker(D, e, false);
  assert.ok(anker && !anker.binnen, 'niet binnen: er is geen huis');
  dagen(T, S, dag + 1);
  assert.ok(gezin.every((p) => p.huis === null), 'nog geen woning');
  T.wijzigVoorraad(D, 'hout', 30);
  T.wijzigVoorraad(D, 'goud', 10);
  const nieuw = T.proefdorp.zetBijHetVuur(D, 'hut');
  bouwAf(T, D, nieuw, dag + 1);
  dagen(T, S, dag + 3);
  assert.ok(gezin.every((p) => p.huis === nieuw), 'het gezin woont in de nieuwe hut');
  assert.equal(T.daklozeGezinnen(D).length, 0);
});

test('een houthakker afbreken: zijn man is vrij, en zijn stapel blijft liggen tot de kar hem haalt', () => {
  const { S, D, dag } = dorp();
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  const man = D.bewoners.mensen.find((p) => p.werk === g);
  assert.ok(man, 'er werkt iemand');
  g.stapel = { hout: 6 };
  T.breekAf(D, g);
  assert.equal(man.werk, null, 'hij is vrij');
  const stapel = D.gebouwen.find((x) => x.soort === 'stapel');
  assert.ok(stapel && stapel.stapel.hout === 6, 'het hout ligt er nog');
  const hout = D.voorraad.hout;
  dagen(T, S, dag + 3);
  assert.ok(!D.gebouwen.includes(stapel), 'de kar haalde de stapel, en hij is weg');
  assert.ok(D.voorraad.hout >= hout + 5, `het hout is binnen: ${hout} → ${D.voorraad.hout}`);
});

test('een boerderij afbreken: haar akkers gaan mee', () => {
  const { D, w, boerderijen } = dorp();
  const g = boerderijen[0];
  const akkers = w.akkers.filter((a) => a.boerderij === g);
  assert.ok(akkers.length, 'ze heeft een akker');
  const r = T.voetVanGebouw(g);
  assert.match(T.handelingAfbreken(D, r.x, r.y).tekst, /fields go with it/);
  assert.equal(T.handelingAfbreken(D, akkers[0].x, akkers[0].y).kan, false, 'een akker breek je niet los af');
  T.breekAf(D, g);
  assert.ok(akkers.every((a) => !w.akkers.includes(a)), 'de akkers zijn weg');
  assert.equal(T.veldOp(w, akkers[0].x, akkers[0].y), null);
});

test('een bouwplaats afbreken: het hout dat de kar al bracht, ligt op een stapel', () => {
  const { D } = dorp();
  T.wijzigVoorraad(D, 'hout', 30);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'hut');
  g.bouw.er = { hout: 5 };
  T.breekAf(D, g);
  assert.ok(!D.gebouwen.includes(g));
  const stapel = D.gebouwen.find((x) => x.soort === 'stapel');
  assert.ok(stapel && Math.abs(stapel.stapel.hout - 5) < 1e-6, 'de vijf hout liggen er');
});

test('een schuur afbreken: zijn kar gaat mee', () => {
  const { S, D, w, dag } = dorp();
  T.wijzigVoorraad(D, 'hout', 30);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'schuur');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + 1);
  const kar = g.kar;
  assert.ok(kar && D.karren.includes(kar), 'de schuur heeft een kar');
  T.breekAf(D, g);
  assert.ok(!D.karren.includes(kar) && !w.wezens.includes(kar), 'de kar is weg');
});

test('niet af te breken: het raadhuis, en de weg van de kaart', () => {
  const { D, w, raadhuis } = dorp();
  const r = T.voetVanGebouw(raadhuis);
  const h = T.handelingAfbreken(D, r.x, r.y);
  assert.equal(h.kan, false, h.tekst);
  const vak = T.kaartVak(w);
  let weg = null;
  for (let y = vak.y; y < vak.y + vak.h && !weg; y++) {
    for (let x = vak.x; x < vak.x + vak.b && !weg; x++) if (T.opPad(w, x, y) && !T.opHetPlein(w, x, y) && !T.opGelegdeWeg(w, x, y)) weg = { x, y };
  }
  if (weg) assert.equal(T.handelingAfbreken(D, weg.x, weg.y).kan, false, 'de weg van de kaart blijft');
});
