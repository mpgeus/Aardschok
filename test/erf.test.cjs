// Het erf: de kaart die erf-kaart.cjs uit erf-scene.cjs maakt, het sorteren van hoge dingen op hun
// voettegel, en de overgang van binnen naar buiten en terug. Alles zonder scherm.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/iso.js');
require('../js/sprites.js');
require('../js/spreuken.js');
require('../js/anim.js');
require('../js/verkennen.js');
require('../js/gevecht.js');
require('../js/tekenen.js');
const T = globalThis.Toren;

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

const erf = () => T.laadKaart(T.KAARTEN.erf);
const voorwerp = (w, soort) => w.voorwerpen.find((v) => v.soort === soort);

test('het erf is een wereld waar je in kunt lopen, met de toren erop', () => {
  const w = erf();
  assert.equal(w.buiten, true);
  assert.ok(w.b >= 30 && w.h >= 24, `het erf is ${w.b}×${w.h}; dat is te krap om prettig rond te lopen`);
  const toren = voorwerp(w, 'toren');
  assert.ok(toren, 'de toren staat op het erf');
  // De hele voet van de toren is vast, en er net buiten niet.
  const [tb, td] = toren.beslaat;
  for (let y = 0; y < td; y++) {
    for (let x = 0; x < tb; x++) assert.equal(T.isVast(w, toren.x + x, toren.y + y), true, `de voet van de toren op (${toren.x + x}, ${toren.y + y})`);
  }
  assert.equal(T.isVast(w, toren.x + tb, toren.y), false);
});

test('de maat van de toren komt uit het tegelvel, niet uit een getal hier', () => {
  // De toren wordt dikker gemaakt (hij moet om zijn eigen hal passen); dan hoort zijn voet mee te
  // groeien zonder dat er ergens een 3 of een 12 staat.
  const vel = T.TEGELS.toren;
  assert.ok(vel, 'tegels/toren.tsx bestaat (npm run tiled)');
  const tegel = vel.tiles[0];
  assert.ok(Array.isArray(tegel.beslaat) && tegel.beslaat[0] >= 1, 'de toren draagt zijn eigen beslaat');
  assert.match(tegel.staat, /^-?\d+,-?\d+$/, 'de toren draagt de tegel waarop hij staat');
  const w = erf();
  assert.deepEqual(voorwerp(w, 'toren').beslaat, tegel.beslaat);
});

test('het schuurtje, de moestuin, de waslijn en de houtstapel staan er, en de waslijn staat niet in de weg', () => {
  const w = erf();
  for (const soort of ['schuurtje', 'moestuin', 'waslijn', 'houtstapel', 'put']) {
    assert.ok(voorwerp(w, soort), `${soort} hoort op het erf te staan`);
  }
  const was = voorwerp(w, 'waslijn');
  assert.equal(T.isVast(w, was.x, was.y), false, 'onder de waslijn door lopen moet kunnen');
  const tuin = voorwerp(w, 'moestuin');
  assert.equal(T.isVast(w, tuin.x, tuin.y), true, 'door de moestuin heen lopen niet');
});

test('elke tegel is óf begaanbaar óf bezet: op gras waar je loopt staat niets', () => {
  // De regel van Marcel: wat er staat, staat in de weg. Een varen waar je dwars doorheen loopt,
  // maakt het erf vol zonder dat het iets betekent.
  const w = erf();
  const los = w.voorwerpen.filter((v) => !T.isVast(w, v.x, v.y) && v.soort !== 'waslijn' && v.soort !== 'lantaarn');
  assert.deepEqual(los.map((v) => `${v.soort}@${v.x},${v.y}`), [], 'niets losstaands op een begaanbare tegel');
});

test('de grond ligt per tegel klaar om te tekenen, uit de stempel van vier bij vier', () => {
  const w = erf();
  const o = w.overgangen[0];
  const g = w.grond[o.y][o.x];
  assert.ok(g && g.vel === 'grond', 'elke tegel weet welk grondplaatje eronder ligt');
  assert.ok(Number.isInteger(g.id));
  // Twee tegels vier uit elkaar pakken hetzelfde vakje van de stempel, twee ernaast niet.
  assert.equal(w.grond[o.y][o.x].id % 4, w.grond[o.y][o.x - 4] ? (o.x - 4 >= 0 ? w.grond[o.y][o.x - 4].id % 4 : 0) : 0);
});

test('een hoog ding plant zich in op zijn vóórste voettegel, zodat je erachter verdwijnt en ervoor weer opduikt', () => {
  const huis = { x: 4, y: 3, beslaat: [7, 5] };
  // vóórste hoek: (4+6, 3+4) = (10, 7) → 17
  assert.equal(T.diepteVan(huis), 17);
  // een boom staat op één tegel
  assert.equal(T.diepteVan({ x: 4, y: 3 }), 7);
  // wie ervóór loopt (x + y groter) wordt ná het huis getekend, wie erachter loopt ervóór
  assert.ok(T.diepteVan({ x: 10, y: 8 }) > T.diepteVan(huis));
  assert.ok(T.diepteVan({ x: 4, y: 2 }) < T.diepteVan(huis));
});

// ---------------------------------------------------------------- de overgang

function nieuwSpel() {
  const S = { tijd: 0, effecten: [], wachters: [], lichten: [], bezocht: new Set(), gebieden: {} };
  S.wereld = T.gebied(S, 'toren');
  S.held = S.wereld.wezens.find((e) => e.soort === 'held');
  S.modus = 'verkennen';
  return S;
}

test('de deur van het erf ligt naast de voet van de toren, niet eronder', () => {
  // De toren wordt dikker; dan schuift de tegel waar je voor de deur staat mee naar buiten. Ligt
  // hij binnen de voet, dan is hij vast en kom je de toren nooit meer in.
  const w = erf();
  const o = w.overgangen.find((x) => x.naar === 'toren');
  assert.ok(o, 'er is een weg terug de toren in');
  assert.equal(T.isBegaanbaar(w, o.x, o.y), true, 'je kunt op de tegel voor de deur staan');
  assert.equal(T.isBegaanbaar(w, o.komt.x, o.komt.y), true, 'en op de tegel waar je landt');
  const toren = voorwerp(w, 'toren');
  const inVoet = (p) => p.x >= toren.x && p.x < toren.x + toren.beslaat[0] && p.y >= toren.y && p.y < toren.y + toren.beslaat[1];
  assert.equal(inVoet(o), false);
});

test('de toren heeft een buitendeur, en die brengt je naar het erf', () => {
  const S = nieuwSpel();
  const o = S.wereld.overgangen[0];
  assert.equal(o.naar, 'erf');
  assert.equal(T.tegel(S.wereld, o.x, o.y), 'deur');
  // erop stappen zet de overgang klaar; de spellus voert hem uit (js/main.js)
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'erf');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'erf');
  assert.equal(S.wereld.buiten, true);
  // hij staat náást de deur, niet erin, en kan daar staan
  const terug = S.wereld.overgangen.find((x) => x.naar === 'toren');
  assert.notDeepEqual([S.held.tx, S.held.ty], [terug.x, terug.y]);
  assert.equal(T.afstand({ x: S.held.tx, y: S.held.ty }, terug), 1);
  assert.equal(T.isBegaanbaar(S.wereld, S.held.tx, S.held.ty), true);
  assert.ok(S.wereld.wezens.includes(S.held), 'de held hoort nu bij het erf');
});

test('en weer terug: dezelfde deur, de andere kant op, met dezelfde held', () => {
  const S = nieuwSpel();
  S.held.leeftijd += 7; // zeven maanden ouder onderweg
  S.held.meesterschap.vuurschicht = 4;
  T.gaNaarGebied(S, 'erf');
  const leeftijd = S.held.leeftijd;
  const o = S.wereld.overgangen.find((x) => x.naar === 'toren');
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'toren');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'toren');
  assert.equal(S.held.leeftijd, leeftijd, 'een overgang kost geen tijd van je leven');
  assert.equal(S.held.meesterschap.vuurschicht, 4, 'wat je kunt, neem je mee');
  const deur = S.wereld.overgangen[0];
  assert.equal(T.afstand({ x: S.held.tx, y: S.held.ty }, deur), 1);
  assert.equal(T.kamerVan(S.wereld, S.held.tx, S.held.ty).id, 'hal');
});

test('de ronde naar buiten en terug kaatst niet: je landt nooit op een overgangstegel', () => {
  // Ging eerder mis: landen op de tegel die de overgang afvuurt, en dan sta je om beurten binnen
  // en buiten. Twee sloten: je landt er niet op (T.landingIn), en een overgang gaat pas weer af
  // als je er een keer af bent geweest (S.netGeland).
  const S = nieuwSpel();
  for (let ronde = 0; ronde < 3; ronde++) {
    for (const naar of ['erf', 'toren']) {
      T.gaNaarGebied(S, naar);
      const w = S.wereld;
      assert.equal(w.gebied, naar);
      assert.equal(T.overgangOp(w, S.held.tx, S.held.ty), null, `je landt in ${naar} niet op een overgangstegel`);
      assert.equal(T.isBegaanbaar(w, S.held.tx, S.held.ty, { deurenOpenen: true }), true);
      assert.equal(S.naarGebied, null, 'er staat geen tweede overgang klaar');
      // en de spellus laten draaien verandert daar niets aan
      T.bijAankomst(S, S.held, { x: S.held.tx, y: S.held.ty });
      assert.equal(S.naarGebied, null, 'stilstaan op de landingstegel vuurt niets af');
    }
  }
});

test('een overgang gaat pas af als je er je pas beëindigt, niet als je erlangs loopt', () => {
  // De deur van de toren ligt buiten midden op het gras; wie naar de moestuin loopt, wil niet
  // halverwege binnen staan.
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'erf');
  const o = S.wereld.overgangen.find((x) => x.naar === 'toren');
  S.netGeland = null;
  // er doorheen lopen: er staat nog een stap in het pad
  S.held.pad = [{ x: o.x + 1, y: o.y }];
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, null, 'erlangs lopen brengt je niet naar binnen');
  // er je pas beëindigen: dan wel
  S.held.pad = [];
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'toren');
});

test('elk gebied heeft een weg terug', () => {
  const S = nieuwSpel();
  for (const naam of Object.keys(T.GEBIEDEN)) {
    const w = T.gebied(S, naam);
    assert.ok(w.overgangen && w.overgangen.length, `gebied "${naam}" heeft geen enkele overgang`);
    for (const o of w.overgangen) {
      assert.ok(T.GEBIEDEN[o.naar], `de overgang wijst naar een gebied dat bestaat: ${o.naar}`);
      const plek = T.landingIn(T.gebied(S, o.naar), naam);
      assert.equal(T.overgangOp(T.gebied(S, o.naar), plek.x, plek.y), null);
    }
  }
});

test('een gebied blijft staan zoals je het achterliet', () => {
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'erf');
  const wolf = S.wereld.wezens.find((e) => e.soort === 'wolf');
  assert.ok(wolf, 'er loopt een wolf buiten');
  wolf.dood = true;
  T.gaNaarGebied(S, 'toren');
  T.gaNaarGebied(S, 'erf');
  assert.equal(S.wereld.wezens.find((e) => e.soort === 'wolf').dood, true, 'een gedode wolf blijft dood');
});

test('buiten bakent de kamer het slagveld niet af: alleen wie de held echt ziet, doet mee', () => {
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'erf');
  const w = S.wereld;
  const wolf = w.wezens.find((e) => e.soort === 'wolf');
  // de wolf ver weg zetten: hij staat in dezelfde (enige) kamer, maar hoort niet mee te doen
  wolf.x = wolf.tx = 1;
  wolf.y = wolf.ty = w.h - 2;
  const mee = T.deelnemers(w, S.held, null);
  assert.equal(mee.includes(wolf), false, 'een wolf aan de andere kant van het erf doet niet mee');
});
