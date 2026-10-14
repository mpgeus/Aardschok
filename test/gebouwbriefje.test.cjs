// Het briefje van een gebouw (js/gebouwbriefje.js; werklijst vraag 156, Marcel, 14 okt: "1a1, 1b ja"): een klik op een
// gebouw kiest het, en het briefje zegt wat het doet, wie er werkt, wat het maakt op vol, vandaag, de laatste zeven dagen
// en dit jaar, wat het tegenhoudt, en wat erbij ligt.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp, dagen, bouwAf } = require('./grond.cjs');

T.ui = new Proxy({}, { get: () => () => undefined });

function dorp() {
  const r = proefDorp(T);
  Object.assign(r.S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() });
  T.S = r.S;
  return { ...r, dag: Math.floor(r.S.kalender.dag) };
}

// Een houthakker bij het vuur, meteen af, en een paar nachten verder.
function metHouthakker(S, D, dag, nachten = 3) {
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const g = T.proefdorp.zetBijHetVuur(D, 'houthakker');
  bouwAf(T, D, g, dag);
  dagen(T, S, dag + nachten);
  return g;
}

const deel = (b, titel) => b.delen.find((d) => d.titel === titel);
const regels = (b, titel) => (deel(b, titel) || { regels: [] }).regels.join(' | ');

test('de houthakker: wat hij doet, wie er werkt, wat hij maakt op vol, vandaag en de laatste dagen', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag);
  const b = T.gebouwBriefje(D, g);
  assert.equal(b.kop, 'Woodcutter');
  assert.match(b.doet, /^Wood from the lord's forest\.$/);
  assert.match(regels(b, 'At work'), /^1 of 1 hands: \w+/, 'wie er werkt, bij naam');
  const maakt = regels(b, 'Makes');
  assert.match(maakt, /At full strength: 2 wood a day\./);
  assert.match(maakt, /Today: [\d.]+ wood \(\d+% of full strength\)/);
  assert.match(maakt, /Last 7 days: [\d.]+ wood\./);
  assert.match(maakt, /This year: [\d.]+ wood\./);
  assert.ok(deel(b, 'Held back by'), 'en wat hem tegenhoudt (of niets)');
  // Wat hij maakte, ligt bij zijn deur tot de kar het haalt (js/kar.js).
  if (T.stapelVan(g) >= 0.05) assert.match(regels(b, 'Here'), /At the door, for the ox cart: [\d.]+ wood \([\d.]+ of 16\)/);
});

test('wat hij maakte, telt per dag: zeven dagen terug, en het jaar samen', () => {
  const { D } = dorp();
  const g = { soort: 'houthakker' };
  const dag = Math.floor(D.kalender.dag);
  for (let d = 0; d < 10; d++) {
    D.kalender.dag = dag + d;
    T.telGemaakt(D, g, 'hout', 2);
  }
  assert.equal(g.gemaakt.dagen.length, 7, 'alleen de laatste zeven dagen blijven');
  assert.equal(T.gemaaktDoor(D, g).hout, 14);
  const jaar = T.gemaaktDoor(D, g, true).hout;
  assert.ok(jaar >= 14 && jaar <= 20, `dit jaar: ${jaar}`);
  // Een week niets: dan zijn de laatste dagen leeg.
  D.kalender.dag = dag + 20;
  assert.deepEqual(T.gemaaktDoor(D, g), {});
});

test('wat er gerooid wordt, is niet gemaakt: alleen wat een gebouw maakt, telt in zijn briefje', () => {
  const { D, schout } = dorp();
  T.opStapel(D, schout, 'hout', 2, { gerooid: true });
  assert.equal(schout.gemaakt, undefined);
  T.opStapel(D, schout, 'hout', 2);
  assert.equal(T.gemaaktDoor(D, schout).hout, 2);
});

test('wat hem tegenhoudt: geen handen, te weinig om te bewerken, weinig afwisseling', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag, 1);
  Object.assign(g, { stilWant: null, handen: 0, werkte: 0, tekort: null, vol: null, uren: null });
  assert.match(regels(T.gebouwBriefje(D, g), 'Held back by'), /No hands: nobody is free to work here\./);
  Object.assign(g, { handen: 1, werkte: 0.5, tekort: 'ijzer' });
  assert.match(regels(T.gebouwBriefje(D, g), 'Held back by'), /Too little iron to work with: it works part of the day\./);
  Object.assign(g, { tekort: null, werkte: 1 });
  D.behoeften.afwisseling = ['graan'];
  assert.match(regels(T.gebouwBriefje(D, g), 'Held back by'), /Little variety at table \(1 kind of food\): the village works at \d+%\./);
  g.stilWant = T.t('its stack is full, waiting for the ox cart');
  assert.equal(regels(T.gebouwBriefje(D, g), 'Held back by'), 'Its stack is full, waiting for the ox cart.', 'stil zegt waarom, en verder niets');
});

test('de boerderij: haar velden, en de oogst in het jaar', () => {
  const { D, boerderijen } = dorp();
  const g = boerderijen[0];
  T.haalSchovenBinnen(D, 12, g);
  const maakt = regels(T.gebouwBriefje(D, g), 'Makes');
  assert.match(maakt, /\d+ fields?, \d+ tiles\./);
  assert.match(maakt, /This year: 12 grain\./);
});

test('in aanbouw zegt het briefje hoe ver het is; een opslag zegt wat zijn kar doet', () => {
  const { D, schout } = dorp();
  T.wijzigVoorraad(D, 'hout', 20);
  T.wijzigVoorraad(D, 'goud', 10);
  const hut = T.proefdorp.zetBijHetVuur(D, 'hut');
  const b = T.gebouwBriefje(D, hut);
  assert.ok(deel(b, 'Under construction'), JSON.stringify(b));
  assert.equal(b.delen.length, 1);
  const s = T.gebouwBriefje(D, schout);
  assert.equal(s.kop, 'Your house');
  assert.match(regels(s, 'Its ox cart'), /ox cart/i);
  assert.ok(deel(s, 'Lives here'), 'de schout woont er');
});

test('een klik op een gebouw kiest het; de muis zegt hoe het ermee staat', () => {
  const { S, D, dag } = dorp();
  const g = metHouthakker(S, D, dag, 1);
  const r = T.voetVanGebouw(g);
  const h = T.handelingVerkennen(S, { x: r.x + 1, y: r.y + 1 });
  assert.match(h.tekst, /^Woodcutter/);
  h.doe();
  assert.equal(S.gekozen, g);
  assert.ok('gekozen' in T.schermVelden(), 'alleen scherm: het gaat niet mee in het opslaan');
});
