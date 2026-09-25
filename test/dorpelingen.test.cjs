// Dorpelingen die rondlopen (ontwerp/wereld.md, "Dorpelingen lopen rond"): ze gebruiken hetzelfde
// dwalen als een monster (T.laatDwalen, js/verkennen.js). Deze toetsen gaan over wat een
// dorpeling juist anders maakt: hij ontdekt de held nooit en telt nooit mee als deelnemer, hij
// blijft niet op een tegel naast een deur staan, hij houdt zich aan zijn straal, en een gesprek
// onderbreekt het dwalen. Een losse dorpeling in de vorm die js/kaart.js voor een "zaad" op de
// kaart maakt, en elke mens uit T.MENSEN, laten zien dat dat de gewone regel is voor elk neutraal
// wezen. (Tot 25 sep deden Wim en de oude meester van het oude spel hier ook mee.)
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/wereld.js');
require('../js/mensen.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/gevecht.js');
require('../js/verkennen.js');
require('../js/sprites.js');
require('../beelden/beschrijving.js'); // T.BEELDEN, voor "heeft een vel" hieronder
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
  const w = T.maakProefkamers();
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

// De mensen van het dorp staan sinds 22 sep in js/mensen.js en niet meer als eigen ingang in
// T.WEZENS (ontwerp/wereld.md, "Wie is wie, als het er honderd worden"). De regel eromheen is
// niet veranderd en wordt hier over de hele lijst getoetst in plaats van per persoon: dwalen en
// nooit ontdekt worden is de gewone regel voor elk neutraal wezen. Dat deze toets over T.MENSEN heen loopt en niet over een lijst hier, is het punt:
// wie er morgen bij komt, wordt vanzelf meegetoetst.
test('elke mens is neutraal, wordt nooit ontdekt en telt nooit mee als deelnemer', () => {
  for (const id of Object.keys(T.MENSEN)) {
    const w = T.maakProefkamers();
    const held = wezen(w, 'held');
    const e = T.maakMens(id, 6, 3);
    w.wezens.push(e);
    zet(held, 5, 3); // vlak naast hem
    const S = { wereld: w, held, sluipen: false };

    assert.equal(e.kant, 'neutraal', `${id} is neutraal`);
    assert.notEqual(e.kant, 'monster'); // alleen 'monster' laat T.startGevecht/de klik aanvallen
    assert.equal(T.zoekOntdekking(S), null, `${id} wordt niet ontdekt`);
    assert.deepEqual(T.deelnemers(w, held, e), [], `${id} telt niet mee als deelnemer`);
    assert.equal(e.naam, T.naamVanMens(id), `${id} draagt zijn eigen naam`);
    assert.equal(e.wie, id);
  }
});

// Elke mens komt in beeld: met zijn eigen vel, met een geleend vel, of als gewone dorpeling.
// "heeft een vel": beelden/beschrijving.js kent die naam met een "staan"- en een "lopen"-houding
// (npm run pixelart:spel zet dat daar neer).
test('elke mens heeft een vel om mee getekend te worden', () => {
  for (const id of Object.keys(T.MENSEN)) {
    const m = T.MENSEN[id];
    const e = T.maakMens(id, 6, 3);
    // Een gewone dorpeling wordt uit zijn zaad getekend (dorpeling0, dorpeling1, …); die vellen
    // toetst de rij hieronder al.
    if (e.soort === 'dorpeling') {
      assert.ok(Number.isFinite(e.zaad), `${id} heeft een zaad om een vel mee te kiezen`);
      continue;
    }
    const vel = T.BEELDEN.figuren[e.soort] ? e.soort : e.vel;
    assert.ok(vel, `"${id}" heeft geen vel en leent er ook geen (zie js/mensen.js)`);
    assert.ok(T.BEELDEN.figuren[vel], `"${vel}" staat niet in beelden/ (of draai npm run pixelart:spel)`);
    assert.ok(T.BEELDEN.figuren[vel].houdingen.staan, `${id} kan staan`);
    assert.ok(T.BEELDEN.figuren[vel].houdingen.lopen, `${id} kan lopen`);
    if (m.snelheid) assert.equal(e.snelheid, m.snelheid, `${id} loopt op zijn eigen maat`);
  }
});

test('de smid dwaalt bij de smidse, maar blijft binnen zijn straal van thuis', () => {
  const w = T.maakProefkamers();
  const S = { wereld: w, spreektMet: null };
  const smid = T.maakMens('smid', 4, 3);
  w.wezens.push(smid);
  assert.equal(smid.dwaalt, true);
  assert.ok(smid.straal > 0);
  for (let i = 0; i < 200; i++) {
    smid.pad = [];
    T.laatDwalen(S, 100); // dwingt meteen een besluit
    if (!smid.pad.length) continue;
    const doel = smid.pad[0];
    assert.ok(
      T.afstand(smid.thuis, doel) <= smid.straal,
      `(${doel.x},${doel.y}) buiten straal ${smid.straal} van thuis (${smid.thuis.x},${smid.thuis.y})`,
    );
    smid.tx = doel.x;
    smid.ty = doel.y;
  }
});

test('een dorpeling die toevallig naast een deur staat, wacht zijn pauze niet uit', () => {
  const w = T.maakProefkamers();
  const dorpeling = maakDorpeling(6, 3, 3);
  w.wezens.push(dorpeling);
  zet(dorpeling, 8, 4); // pal naast de deur op (9, 4)
  dorpeling.dwaalTijd = 10; // zijn pauze is nog lang niet om
  const S = { wereld: w, spreektMet: null };
  T.laatDwalen(S, 0.01);
  // (8,3) en (8,5) liggen ook naast die deur; (7,4) is de enige stap die dat niet doet.
  assert.deepEqual(dorpeling.pad, [{ x: 7, y: 4 }]);
});

test('een dwalende dorpeling blijft binnen zijn straal van thuis', () => {
  const w = T.maakProefkamers();
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
  const w = T.maakProefkamers();
  const dorpeling = maakDorpeling(4, 3, 2);
  w.wezens.push(dorpeling);
  dorpeling.dwaalTijd = -1; // allang tijd voor een stap
  const S = { wereld: w, spreektMet: dorpeling };
  T.laatDwalen(S, 0.1);
  assert.deepEqual(dorpeling.pad, []);
});

// Fase A: een gewone dorpeling (maakDorpeling hierboven, soort "dorpeling") kiest zijn vel uit
// zijn zaad, modulo het aantal gerenderde varianten (js/sprites.js, T.sprites.dorpelingVariant) —
// zodat hetzelfde zaad altijd hetzelfde uiterlijk geeft, en elk zaad een geldige variant oplevert,
// ook een negatief zaad of nul varianten (nog niets gerenderd; dan blijft het vlakken, zie
// dorpelingVel in js/sprites.js).
test('het zaad van een dorpeling kiest zijn vel via een modulo die altijd binnen het aantal varianten blijft', () => {
  assert.equal(T.sprites.dorpelingVariant(0, 2), 0);
  assert.equal(T.sprites.dorpelingVariant(1, 2), 1);
  assert.equal(T.sprites.dorpelingVariant(2, 2), 0); // loopt rond: hetzelfde als zaad 0
  assert.equal(T.sprites.dorpelingVariant(3, 2), 1);
  assert.equal(T.sprites.dorpelingVariant(-1, 2), 1); // een negatief zaad blijft geldig
  assert.equal(T.sprites.dorpelingVariant(5, 3), 2);
  assert.equal(T.sprites.dorpelingVariant(7, 0), 0); // nog geen varianten: geen crash
});
