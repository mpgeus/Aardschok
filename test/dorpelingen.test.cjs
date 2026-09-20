// Dorpelingen die rondlopen (ontwerp/wereld.md, "Dorpelingen lopen rond"): ze gebruiken hetzelfde
// dwalen als een monster (T.laatDwalen, js/verkennen.js). Deze toetsen gaan over wat een
// dorpeling juist anders maakt: hij ontdekt de held nooit en telt nooit mee als deelnemer, hij
// blijft niet op een tegel naast een deur staan, hij houdt zich aan zijn straal, en een gesprek
// onderbreekt het dwalen. Wim (al neutraal, met dwaalt/straal in js/wereld.js) en een losse
// dorpeling in de vorm die js/kaart.js voor een "zaad" op de kaart maakt, laten zien dat dat geen
// Wim-specifieke uitzondering is maar de gewone regel voor elk neutraal wezen.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/spreuken.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
const T = globalThis.Toren;

const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
}

// Dezelfde vorm als maakDorpeling in js/kaart.js, maar zonder de kaart erbij te halen: alleen de
// velden waar T.laatDwalen, T.zoekOntdekking en T.deelnemers naar kijken.
function maakDorpeling(x, y, straal) {
  return {
    soort: 'dorpeling', naam: 'dorpeling', kant: 'neutraal',
    x, y, tx: x, ty: y, pad: [], dood: false,
    thuis: { x, y }, straal, dwaalt: straal > 0,
    dwaalTijd: 0, gelokt: null, zicht: 0,
  };
}

test('een dorpeling wordt nooit ontdekt en telt nooit mee als deelnemer, ook niet als aanleiding', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  wezen(w, 'slijm').dood = true;
  wezen(w, 'skelet').dood = true;
  const wim = wezen(w, 'wim');
  const dorpeling = maakDorpeling(6, 3, 3);
  w.wezens.push(dorpeling);
  zet(held, 5, 3); // vlak naast allebei
  const S = { wereld: w, held, sluipen: false };

  assert.equal(T.zoekOntdekking(S), null);
  assert.deepEqual(T.deelnemers(w, held, wim), []);
  assert.deepEqual(T.deelnemers(w, held, dorpeling), []);
});

test('een dorpeling die toevallig naast een deur staat, wacht zijn pauze niet uit', () => {
  const w = T.maakWereld();
  const wim = wezen(w, 'wim');
  zet(wim, 8, 4); // pal naast de deur op (9, 4)
  wim.pad = [];
  wim.dwaalTijd = 10; // zijn pauze is nog lang niet om
  const S = { wereld: w, spreektMet: null };
  T.laatDwalen(S, 0.01);
  // (8,3) en (8,5) liggen ook naast die deur; (7,4) is de enige stap die dat niet doet.
  assert.deepEqual(wim.pad, [{ x: 7, y: 4 }]);
});

test('een dwalende dorpeling blijft binnen zijn straal van thuis', () => {
  const w = T.maakWereld();
  const S = { wereld: w, spreektMet: null };
  const dorpeling = maakDorpeling(4, 3, 2);
  w.wezens.push(dorpeling);
  for (let i = 0; i < 200; i++) {
    dorpeling.pad = [];
    T.laatDwalen(S, 100); // dwingt meteen een besluit
    if (!dorpeling.pad.length) continue;
    const doel = dorpeling.pad[0];
    assert.ok(
      T.afstand(dorpeling.thuis, doel) <= dorpeling.straal,
      `(${doel.x},${doel.y}) buiten straal ${dorpeling.straal} van thuis (${dorpeling.thuis.x},${dorpeling.thuis.y})`,
    );
    dorpeling.tx = doel.x;
    dorpeling.ty = doel.y;
  }
});

test('wie in gesprek is, dwaalt niet mee, ook niet als zijn pauze om is', () => {
  const w = T.maakWereld();
  const wim = wezen(w, 'wim');
  wim.pad = [];
  wim.dwaalTijd = -1; // allang tijd voor een stap
  const S = { wereld: w, spreektMet: wim };
  T.laatDwalen(S, 0.1);
  assert.deepEqual(wim.pad, []);
});
