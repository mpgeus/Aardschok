// De wereld (kaarten/wereld.tmj, gemaakt door gereedschap/tiled/maak-wereld.cjs): het erf met de
// toren erop, het sorteren van hoge dingen op hun voettegel, en de overgang van binnen naar buiten
// en terug. Alles zonder scherm.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

require('../js/wereld.js');
require('../tegels/tegels.js');
require('../kaarten/kaarten.js');
require('../js/mensen.js');
require('../js/kaart.js');
require('../js/gebied.js');
require('../js/pad.js');
require('../js/iso.js');
require('../js/sprites.js');
require('../js/anim.js');
require('../js/verkennen.js');
require('../js/gevecht.js');
require('../js/tekenen.js');
const T = globalThis.Toren;

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

const laadWereld = () => T.laadKaart(T.KAARTEN.wereld, T.BETEKENIS.wereld);
const voorwerp = (w, soort) => w.voorwerpen.find((v) => v.soort === soort);
// Waar het erf en het dorp binnen wereld.tmj precies liggen (zie gereedschap/tiled/maak-wereld.cjs).
const { EOX, DOX, DOY, DORP_B, DORP_H } = require('../gereedschap/tiled/maak-wereld.cjs');

test('de wereld is begaanbaar, met de toren op het erf', () => {
  const w = laadWereld();
  assert.equal(w.buiten, true);
  // erf + kloof + dorp op één doek (ontwerp/werklijst.md "Eén doorlopende wereld"): een stuk ruimer
  // dan het erf alleen ooit was.
  assert.ok(w.b >= 150 && w.h >= 70, `de wereld is ${w.b}×${w.h}; dat is te krap voor erf, kloof en dorp samen`);
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
  const w = laadWereld();
  assert.deepEqual(voorwerp(w, 'toren').beslaat, tegel.beslaat);
});

test('het schuurtje, de moestuin, de waslijn en de houtstapel staan er, en de waslijn staat niet in de weg', () => {
  const w = laadWereld();
  for (const soort of ['schuurtje', 'moestuin', 'waslijn', 'houtstapel', 'put']) {
    assert.ok(voorwerp(w, soort), `${soort} hoort op het erf te staan`);
  }
  const was = voorwerp(w, 'waslijn');
  assert.equal(T.isVast(w, was.x, was.y), false, 'onder de waslijn door lopen moet kunnen');
  const tuin = voorwerp(w, 'moestuin');
  assert.equal(T.isVast(w, tuin.x, tuin.y), true, 'door de moestuin heen lopen niet');
});

test('de oude meester staat op het erf, vlak bij zijn moestuin, en scharrelt er met een kleine straal rond', () => {
  const w = laadWereld();
  const meester = w.wezens.find((e) => e.soort === 'meester');
  assert.ok(meester, 'de oude meester hoort op het erf te staan');
  assert.equal(meester.kant, 'neutraal');
  assert.equal(meester.dwaalt, true);
  assert.ok(meester.straal > 0 && meester.straal <= 3, `een kleine straal om zijn tuin, niet ${meester.straal}`);
  assert.equal(T.isBegaanbaar(w, meester.tx, meester.ty), true);
  // "vlak bij": de dichtstbijzijnde tuintegel ligt één stap van hem vandaan, niet erop (dat kan
  // niet, de tuin is vast) en niet ergens ver op het erf.
  const tuin = voorwerp(w, 'moestuin');
  let dichtstbij = Infinity;
  for (let dy = 0; dy < tuin.beslaat[1]; dy++) {
    for (let dx = 0; dx < tuin.beslaat[0]; dx++) {
      dichtstbij = Math.min(dichtstbij, T.afstand({ x: meester.tx, y: meester.ty }, { x: tuin.x + dx, y: tuin.y + dy }));
    }
  }
  assert.equal(dichtstbij, 1, 'hij staat vlak naast de tuin');
});

test('elke tegel is óf begaanbaar óf bezet: op gras waar je loopt staat niets', () => {
  // De regel van Marcel voor het (automatisch gegenereerde) erf: wat er staat, staat in de weg. Een
  // varen waar je dwars doorheen loopt, maakt het erf vol zonder dat het iets betekent. Het dorp is
  // Marcels eigen, met de hand getekende kaart — daar geldt deze regel niet vanzelf ook voor (een
  // los grasplukje in de berm mag daar best), dus de toets kijkt alleen naar het erfdeel (x >= EOX).
  const w = laadWereld();
  const los = w.voorwerpen.filter((v) => v.x >= EOX && !T.isVast(w, v.x, v.y) && v.soort !== 'waslijn' && v.soort !== 'lantaarn');
  assert.deepEqual(los.map((v) => `${v.soort}@${v.x},${v.y}`), [], 'niets losstaands op een begaanbare tegel van het erf');
});

test('de grond ligt per tegel klaar om te tekenen, uit de terreinsets van rand.tsx', () => {
  // Sinds "Eén doorlopende wereld" komt de grond van het erf niet meer uit de vierkante stempels
  // van grond.tsx, maar uit de terreinsets van rand.tsx (net als het dorp), zodat het pad nette
  // randen en karrensporen heeft. Zie gereedschap/tiled/maak-wereld.cjs.
  const w = laadWereld();
  const o = w.overgangen[0];
  const g = w.grond[o.y][o.x];
  assert.ok(g && g.vel === 'rand', 'elke tegel weet welk grondplaatje eronder ligt, uit tegels/rand.tsx');
  assert.ok(Number.isInteger(g.id));
  assert.ok(['gras', 'zandpad'].includes(g.naam), `bij de deur van de toren hoort gras of een zandpad, niet "${g.naam}"`);
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

test('staatVoorGebouw beslist per tegel welke ervóór liggen en welke erachter, ook bij een brede voet', () => {
  // Een gebouw van 13×13 op een bekende plek (net zo breed als de toren): x 5..17, y 5..17.
  const toren = { x: 5, y: 5, beslaat: [13, 13] };
  // Ten zuiden en ten oosten staat een wezen ervóór, ook vlak langs de rand of in de hoek.
  assert.equal(T.staatVoorGebouw(11, 18, toren), true, 'ten zuiden van de toren');
  assert.equal(T.staatVoorGebouw(18, 11, toren), true, 'ten oosten van de toren');
  assert.equal(T.staatVoorGebouw(5, 18, toren), true, 'zuidrand, uiterst westen van de voet');
  assert.equal(T.staatVoorGebouw(18, 5, toren), true, 'oostrand, uiterst noorden van de voet');
  assert.equal(T.staatVoorGebouw(18, 18, toren), true, 'zuidoosthoek, voorbij allebei');
  // Ten noorden en ten westen staat hij erachter.
  assert.equal(T.staatVoorGebouw(11, 4, toren), false, 'ten noorden van de toren');
  assert.equal(T.staatVoorGebouw(4, 11, toren), false, 'ten westen van de toren');
  assert.equal(T.staatVoorGebouw(4, 4, toren), false, 'noordwesthoek');
  // Marcels geval: recht ten zuiden staat een wezen ervóór, terwijl zijn eigen som (11 + 18 = 29)
  // onder de vóórste hoek van diepteVan blijft (34) — precies de tegenstrijdigheid die de fout
  // was: de tekenvolgorde zei "erachter" (lagere som) en de doorkijk zei "ervóór". Vandaar dat de
  // tekenvolgorde nu ook staatVoorGebouw vraagt (vergelijkDiepte in js/tekenen.js), niet meer de
  // som van diepteVan tegen een los wezen.
  assert.ok(11 + 18 < T.diepteVan(toren), 'de som van het wezen ligt onder diepteVan(toren)');
});

// ---------------------------------------------------------------- de overgang

function nieuwSpel() {
  const S = { tijd: 0, effecten: [], wachters: [], inventaris: new Set(), bezocht: new Set(), gebieden: {} };
  S.wereld = T.gebied(S, 'toren');
  S.held = S.wereld.wezens.find((e) => e.soort === 'held');
  S.modus = 'verkennen';
  return S;
}

test('de deur van het erf ligt naast de voet van de toren, niet eronder', () => {
  // De toren wordt dikker; dan schuift de tegel waar je voor de deur staat mee naar buiten. Ligt
  // hij binnen de voet, dan is hij vast en kom je de toren nooit meer in.
  const w = laadWereld();
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
  assert.equal(o.naar, 'wereld');
  assert.equal(T.tegel(S.wereld, o.x, o.y), 'deur');
  // erop stappen zet de overgang klaar; de spellus voert hem uit (js/main.js)
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'wereld');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'wereld');
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
  S.held.leven -= 7; // een klap onderweg
  S.inventaris.add('sleutel');
  T.gaNaarGebied(S, 'wereld');
  const leven = S.held.leven;
  const o = S.wereld.overgangen.find((x) => x.naar === 'toren');
  T.bijAankomst(S, S.held, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'toren');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'toren');
  assert.equal(S.held.leven, leven, 'een overgang kost geen leven, en geeft het ook niet terug');
  assert.ok(S.inventaris.has('sleutel'), 'wat je bij je hebt, neem je mee');
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
    for (const naar of ['wereld', 'toren']) {
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
  T.gaNaarGebied(S, 'wereld');
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
  T.gaNaarGebied(S, 'wereld');
  const wolf = S.wereld.wezens.find((e) => e.soort === 'wolf');
  assert.ok(wolf, 'er loopt een wolf buiten');
  wolf.dood = true;
  T.gaNaarGebied(S, 'toren');
  T.gaNaarGebied(S, 'wereld');
  assert.equal(S.wereld.wezens.find((e) => e.soort === 'wolf').dood, true, 'een gedode wolf blijft dood');
});

test('buiten bakent de kamer het slagveld niet af: alleen wie de held echt ziet, doet mee', () => {
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'wereld');
  const w = S.wereld;
  const wolf = w.wezens.find((e) => e.soort === 'wolf');
  // de wolf ver weg zetten: hij staat in dezelfde (enige) kamer, maar hoort niet mee te doen
  wolf.x = wolf.tx = 1;
  wolf.y = wolf.ty = w.h - 2;
  const mee = T.deelnemers(w, S.held, null);
  assert.equal(mee.includes(wolf), false, 'een wolf aan de andere kant van het erf doet niet mee');
});

// ------------------------------------------------- elke kaart is vanzelf een gebied (js/gebied.js)

test('elke kaart uit T.KAARTEN is vanzelf een gebied, zonder dat er iets geregistreerd is', () => {
  // Dit is de hele bedoeling van de editor: Marcel tekent kaarten/<naam>.tmj, draait npm run
  // kaarten, en `overgang: "<naam>"` werkt. Staat er ergens weer een lijstje met de hand, dan
  // valt een nieuwe kaart daar stilletjes buiten.
  for (const naam of Object.keys(T.KAARTEN)) {
    assert.ok(T.GEBIEDEN[naam], `kaart "${naam}" hoort een gebied te zijn`);
  }
  // en de naam die de speler ziet komt uit de kaart zelf (de eigenschap "naam" van de map)
  assert.equal(T.GEBIEDEN.wereld.naam, 'De wereld');
  assert.equal(T.GEBIEDEN.proefbos.naam, 'Het proefbos');
  assert.equal(T.GEBIEDEN.toren.naam, 'De toren'); // de toren blijft in code staan
});

// Vroeger liep hier een toets die van het erf naar de toetskaart "proefbos" liep en weer terug: dat
// was tegelijk het bewijs dat een kaart zonder eigen registratie vanzelf een gebied wordt. Sinds
// "Eén doorlopende wereld" heeft de wereld geen overgang meer naar het bos (dat bos komt er zelf
// straks als getekend gebied, niet als teleport naar een toetskaart) — de toren-overgang hierboven
// en "elk gebied heeft een weg terug" hieronder dekken diezelfde machinerie nog steeds.

test('een overgang naar een kaart die niet bestaat, laat de speler niet vastlopen', () => {
  // Marcel typt "dorp" in Tiled en tekent kaarten/dorp.tmj pas morgen. Dan hoort het spel te
  // klagen op de console, maar gewoon door te spelen: je blijft staan waar je staat.
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'wereld');
  const waar = { x: S.held.tx, y: S.held.ty };
  const wereld = S.wereld;
  const fouten = [];
  const oud = console.error;
  console.error = (m) => fouten.push(m);
  try {
    T.gaNaarGebied(S, 'ditbestaatniet');
  } finally {
    console.error = oud;
  }
  assert.equal(S.wereld, wereld, 'je blijft in hetzelfde gebied');
  assert.deepEqual({ x: S.held.tx, y: S.held.ty }, waar, 'en op dezelfde tegel');
  assert.equal(S.naarGebied, null, 'de overgang wordt niet elke tel opnieuw geprobeerd');
  assert.equal(S.wereld.wezens.includes(S.held), true, 'de held staat nog in zijn eigen wereld');
  assert.ok(fouten.some((m) => String(m).includes('ditbestaatniet')), 'en het klaagt hoorbaar');
});

// ---------------------------------------------------------------- het dorpsdeel, op naam vergeleken
//
// Marcels dorp moet in wereld.tmj precies overeind blijven: elke grondtegel en elk voorwerp, alleen
// verschoven. Dezelfde opzoeking als test/tegelvolgorde.test.cjs (op NAAM, niet op tegelnummer — die
// nummers verschillen tussen dorp.tmj op zichzelf en wereld.tmj, met zijn eigen tilesets-volgorde).
function velNaamVan(bron) {
  return String(bron || '').replace(/\\/g, '/').split('/').pop().replace(/\.tsx$/i, '');
}
function opzoekerVoor(kaart, tegelsJson) {
  const sets = (kaart.tilesets || []).map((t) => {
    const vel = tegelsJson[velNaamVan(t.source)];
    return { firstgid: t.firstgid || 1, aantal: vel ? vel.tiles.length : 0, vel };
  });
  return (gid) => {
    const g = gid & 0x1fffffff;
    if (!g) return null;
    for (const s of sets) {
      const lokaal = g - s.firstgid;
      if (s.vel && lokaal >= 0 && lokaal < s.aantal) {
        const eig = s.vel.tiles[lokaal];
        return eig ? eig.naam : null;
      }
    }
    return null;
  };
}

// Dit toetst het script dat de wereld bouwde, niet kaarten/wereld.tmj zelf: daar tekent Marcel in
// verder, en dan wijkt het dorpsdeel terecht af van zijn oude losse dorpskaart (op 22 sep 2026 lag er
// al water waar eerst gras lag, en faalde deze toets om de verkeerde reden).
test('het wereldscript neemt het dorp precies over uit kaarten/oud/dorp.tmj, op naam vergeleken', () => {
  const WORTEL = path.join(__dirname, '..');
  const dorpOud = JSON.parse(fs.readFileSync(path.join(WORTEL, 'kaarten', 'oud', 'dorp.tmj'), 'utf8'));
  const tegelsJson = JSON.parse(fs.readFileSync(path.join(WORTEL, 'tegels', 'tegels.json'), 'utf8'));
  const opzoekOud = opzoekerVoor(dorpOud, tegelsJson);
  const wereldKaart = require('../gereedschap/tiled/maak-wereld.cjs').kaart;
  const opzoekWereld = opzoekerVoor(wereldKaart, tegelsJson);

  const grondOud = dorpOud.layers.find((l) => l.type === 'tilelayer');
  const grondWereld = wereldKaart.layers.find((l) => l.type === 'tilelayer');
  assert.equal(DORP_B, dorpOud.width);
  assert.equal(DORP_H, dorpOud.height);
  for (let y = 0; y < DORP_H; y++) {
    for (let x = 0; x < DORP_B; x++) {
      const naamOud = opzoekOud(grondOud.data[y * grondOud.width + x]);
      const naamWereld = opzoekWereld(grondWereld.data[(DOY + y) * grondWereld.width + (DOX + x)]);
      assert.equal(naamWereld, naamOud, `grond (${x}, ${y}) van het dorp: "${naamOud}" verwacht, "${naamWereld}" gevonden`);
    }
  }

  // objecten: alleen de getekende dingen (met een gid) — de oude "pad terug naar het erf" was een
  // los punt zonder gid en hoort terecht niet meer mee: die overgang bestaat niet meer (sectie 2
  // hierboven, "De overgangen tussen erf en dorp verdwijnen"). Sleutel is de plek (dorp-lokaal) plus
  // de naam, niet het object-id: elk object krijgt in wereld.tmj een vers volgnummer (zie
  // "verschoven" in maak-wereld.cjs), dus het oude id zegt niets meer.
  const objOud = dorpOud.layers.find((l) => l.type === 'objectgroup').objects
    .filter((o) => o.gid)
    .map((o) => `${Math.round(o.x / 32)},${Math.round(o.y / 32)}:${opzoekOud(o.gid)}`).sort();
  const objWereld = wereldKaart.layers.find((l) => l.type === 'objectgroup').objects
    .filter((o) => o.gid)
    .map((o) => [Math.round(o.x / 32) - DOX, Math.round(o.y / 32) - DOY, opzoekWereld(o.gid)])
    .filter(([gx, gy]) => gx >= 0 && gx < DORP_B && gy >= 0 && gy < DORP_H)
    .map(([gx, gy, naam]) => `${gx},${gy}:${naam}`).sort();
  assert.deepEqual(objWereld, objOud, 'dezelfde voorwerpen, op dezelfde plek, dezelfde namen');
  assert.ok(objOud.length > 0, 'de toets moet wel iets te vergelijken hebben');
});
