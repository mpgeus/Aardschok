// De spreuken zonder scherm: de treden van meesterschap, wat elke trede verandert, waar een
// windstoot wezens heen duwt, wat een dwaallicht lokt, en of een spreuk alleen telt als hij
// werkelijk iets doet. De kosten lopen, net als elke maand in dit spel, via T.verouder.
const test = require('node:test');
const assert = require('node:assert/strict');

require('../js/leeftijd.js');
require('../js/wereld.js');
require('../js/pad.js');
require('../js/spreuken.js');
require('../js/anim.js');
require('../js/verkennen.js');
require('../js/gevecht.js');
require('../js/toveren.js');
const T = globalThis.Toren;

// Zonder scherm doet elke aanroep naar T.ui niets; alleen de berichten bewaren we, want daar
// staat in wat er gebeurde.
const berichten = [];
T.ui = new Proxy({}, { get: (_, naam) => (naam === 'bericht' ? (tekst) => berichten.push(tekst) : () => {}) });

const wezen = (w, soort) => w.wezens.find((e) => e.soort === soort);
function zet(e, x, y) {
  e.x = e.tx = x;
  e.y = e.ty = y;
  e.pad = [];
  e.onderweg = false;
}
const heldMet = (opties) => Object.assign({ leeftijd: T.STARTLEEFTIJD, kring: 1, meesterschap: {} }, opties);
const metGebruik = (id, aantal) => heldMet({ meesterschap: { [id]: aantal } });

// Een spelstaat zoals main.js hem maakt, maar zonder canvas en camera.
function maakSpel() {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  berichten.length = 0;
  return {
    tijd: 0, wereld: w, held, modus: 'verkennen', gevecht: null, overgang: null, bezig: false,
    spreuk: null, spreukBereik: null, lichten: [], inventaris: new Set(), sleutelGebruikt: false,
    fonteinLeeg: false, sluipen: false, bezocht: new Set(['hal']), effecten: [], wachters: [],
    rasterTegels: [], rasterAlpha: 0, rasterStart: 0, rasterVan: null, bereik: null,
    hover: null, handeling: null, naLopen: null,
  };
}

// De spellus van main.js, maar zo snel als Node hem kan draaien: na elk beeld krijgen de
// beloftes (schicht, duw, wacht) de kans om door te gaan.
async function stap(S, seconden) {
  for (let i = 0; i < Math.round(seconden * 60); i++) {
    S.tijd += 1 / 60;
    T.werkAnimatiesBij(S, 1 / 60);
    T.werkLichtenBij(S, 1 / 60);
    if (S.modus === 'overgang' && S.wereld.wezens.every((e) => !e.pad.length)) T.beginGevecht(S);
    for (let k = 0; k < 8; k++) await null;
  }
}

async function startGevecht(S, monster) {
  T.startGevecht(S, monster, true);
  await stap(S, 0.4);
}

// Een spreuk kiezen, erop richten en klikken: precies wat het scherm doet. Eerst neerleggen,
// want dezelfde spreuk nog eens kiezen legt hem juist weg.
function richt(S, id, doel) {
  T.kiesSpreuk(S, null);
  T.kiesSpreuk(S, id);
  return S.modus === 'gevecht' ? T.handelingGevecht(S, doel) : T.handelingVerkennen(S, doel);
}
async function tover(S, id, doel, seconden) {
  const h = richt(S, id, doel);
  assert.notEqual(h, null);
  assert.notEqual(h.kan, false);
  h.doe();
  await stap(S, seconden || 2.5);
  return h;
}

// Wat T.verouder aan maanden te verwerken kreeg, zonder de echte af te schaffen.
async function metVerouderSpion(werk) {
  const echt = T.verouder;
  const maanden = [];
  T.verouder = (S, n, uitKlap) => {
    maanden.push(n);
    return echt(S, n, uitKlap);
  };
  try {
    await werk(maanden);
  } finally {
    T.verouder = echt;
  }
}

// ── Treden van meesterschap ──

test('de treden liggen op 3, 8, 15 en 25 keer raak', () => {
  assert.deepEqual(T.TREDEN.map((t) => t.vanaf), [0, 3, 8, 15, 25]);
  assert.equal(T.tredeVoor(0), 0);
  assert.equal(T.tredeVoor(2), 0);
  assert.equal(T.tredeVoor(3), 1);
  assert.equal(T.tredeVoor(7), 1);
  assert.equal(T.tredeVoor(8), 2);
  assert.equal(T.tredeVoor(14), 2);
  assert.equal(T.tredeVoor(15), 3);
  assert.equal(T.tredeVoor(24), 3);
  assert.equal(T.tredeVoor(25), 4);
  assert.equal(T.tredeVoor(99), 4);
  assert.equal(T.TREDEN[T.trede(metGebruik('vuurschicht', 9), 'vuurschicht')].naam, 'Geoefend');
});

test('een trede erbij meldt zich één keer, precies op de drempel', () => {
  const held = heldMet();
  const gemeld = [];
  for (let i = 0; i < 26; i++) {
    const hoger = T.telGebruik(held, 'windstoot');
    if (hoger) gemeld.push([i + 1, hoger.naam]);
  }
  assert.deepEqual(gemeld, [[3, 'Vertrouwd'], [8, 'Geoefend'], [15, 'Meesterlijk'], [25, 'Legendarisch']]);
  assert.equal(T.gebruik(held, 'windstoot'), 26);
  assert.equal(T.gebruik(held, 'vuurschicht'), 0); // elke spreuk telt voor zichzelf
});

test('de voortgang wijst naar de volgende trede, en Legendarisch is het einde', () => {
  const v = T.voortgang(metGebruik('dwaallicht', 5), 'dwaallicht');
  assert.equal(v.naam, 'Vertrouwd');
  assert.equal(v.binnen, 2); // 5 van de 3 tot 8
  assert.equal(v.nodig, 5);
  assert.equal(v.volgende.naam, 'Geoefend');
  assert.equal(v.volgende.nog, 3);
  assert.equal(T.voortgang(metGebruik('dwaallicht', 30), 'dwaallicht').volgende, null);
});

test('elke trede van de vuurschicht geeft wat de tabel belooft, en ze stapelen', () => {
  const eig = (n) => T.spreuk(metGebruik('vuurschicht', n), 'vuurschicht');
  assert.deepEqual(
    [eig(0).ap, eig(0).bereik, eig(0).schade, eig(0).brandt, eig(0).doorboort],
    [5, 6, [5, 8], 0, false],
  );
  assert.equal(eig(3).bereik, 7); // Vertrouwd
  assert.equal(eig(8).brandt, 1); // Geoefend
  assert.equal(eig(8).bereik, 7); // en wat Vertrouwd gaf, blijft
  assert.equal(eig(15).ap, 4); // Meesterlijk
  assert.equal(eig(25).doorboort, true); // Legendarisch
  assert.deepEqual([eig(25).ap, eig(25).bereik, eig(25).brandt], [4, 7, 1]);
  assert.equal(eig(0).gevecht, true);
  assert.equal(eig(25).buiten, false); // een vuurschicht blijft iets voor een gevecht
});

test('elke trede van het dwaallicht en de windstoot geeft wat de tabel belooft', () => {
  const licht = (n) => T.spreuk(metGebruik('dwaallicht', n), 'dwaallicht');
  assert.deepEqual([licht(0).ap, licht(0).bereik, licht(0).duur, licht(0).nablijven, licht(0).gevecht], [2, 6, 8, 0, false]);
  assert.equal(licht(3).bereik, 9);
  assert.equal(licht(8).duur, 16);
  assert.equal(licht(15).nablijven, 4);
  assert.deepEqual([licht(25).gevecht, licht(25).ap], [true, 1]);

  const wind = (n) => T.spreuk(metGebruik('windstoot', n), 'windstoot');
  assert.deepEqual([wind(0).ap, wind(0).duwt, wind(0).apVerlies, wind(0).breed, wind(0).deurBereik], [3, 2, 0, false, 4]);
  assert.equal(wind(3).duwt, 3);
  assert.equal(wind(8).apVerlies, 2);
  assert.equal(wind(15).breed, true);
  assert.equal(wind(25).ap, 2);
  assert.equal(wind(25).duwt, 3);
});

test('geen enkele trede maakt een spreuk goedkoper in jaren', () => {
  for (const id of T.SPREUK_VOLGORDE) {
    const basis = T.SPREUKEN[id].basis.maanden;
    for (const drempel of T.TREDEN.map((t) => t.vanaf)) {
      assert.equal(T.spreuk(metGebruik(id, drempel), id).maanden, basis);
    }
  }
  assert.deepEqual(T.SPREUK_VOLGORDE.map((id) => T.SPREUKEN[id].basis.maanden), [12, 1, 3]);
});

// ── Leeftijd opent de kringen ──

test('een kring gaat open met de jaren en blijft open als de fontein je jonger maakt', () => {
  assert.equal(T.kringVoorLeeftijd(84 * 12), 1);
  assert.equal(T.kringVoorLeeftijd(87 * 12 + 11), 1);
  assert.equal(T.kringVoorLeeftijd(88 * 12), 2);
  assert.equal(T.kringVoorLeeftijd(92 * 12), 3);
  assert.equal(T.kringVoorLeeftijd(96 * 12), 4);

  const S = maakSpel();
  S.held.leeftijd = 87 * 12 + 11;
  T.verouder(S, 1, false);
  assert.equal(S.held.kring, 2);
  T.verouder(S, -24, false); // de laatste slok uit de fontein
  assert.equal(T.jaren(S.held.leeftijd), 86);
  assert.equal(T.kringVan(S.held), 2); // wat open ging, vergeet je niet
  assert.equal(T.kentSpreuk(S.held, 'vuurschicht'), true);
});

// ── Windstoot: waar de wind je heen blaast ──

test('de wind duwt recht van de held af, op de dichtstbijzijnde van acht richtingen', () => {
  assert.deepEqual(T.richtingVan({ x: 0, y: 0 }, { x: 3, y: 1 }), { x: 1, y: 0 });
  assert.deepEqual(T.richtingVan({ x: 0, y: 0 }, { x: 2, y: 1 }), { x: 1, y: 1 });
  assert.deepEqual(T.richtingVan({ x: 0, y: 0 }, { x: -1, y: -2 }), { x: -1, y: -1 });
  assert.deepEqual(T.richtingVan({ x: 5, y: 5 }, { x: 5, y: 2 }), { x: 0, y: -1 });
  assert.deepEqual(T.richtingVan({ x: 5, y: 5 }, { x: 5, y: 5 }), { x: 0, y: 0 });
});

test('een duw stopt bij een muur, een dichte deur, een ander wezen en de rand van de wereld', () => {
  const w = T.maakWereld();
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  const oost = { x: 1, y: 0 };

  zet(slijm, 4, 4);
  assert.deepEqual(T.duwPad(w, slijm, oost, 2), [{ x: 5, y: 4 }, { x: 6, y: 4 }]);

  zet(slijm, 7, 4); // (9,4) is de dichte deur
  assert.deepEqual(T.duwPad(w, slijm, oost, 3), [{ x: 8, y: 4 }]);
  T.deurOp(w, 9, 4).staat = 'open';
  assert.deepEqual(T.duwPad(w, slijm, oost, 3), [{ x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }]);

  zet(slijm, 4, 4); // een ander wezen houdt hem tegen
  zet(skelet, 6, 4);
  assert.deepEqual(T.duwPad(w, slijm, oost, 3), [{ x: 5, y: 4 }]);

  zet(slijm, 12, 5); // een kist staat in de weg
  assert.deepEqual(T.duwPad(w, slijm, oost, 2), []);

  zet(slijm, 18, 4); // de rand: de muur van de toren, en daarachter niets
  assert.deepEqual(T.duwPad(w, slijm, oost, 2), []);
  assert.equal(T.isBegaanbaar(w, 20, 4), false);
});

test('een schuine duw gaat niet om een muurhoek heen, net als lopen', () => {
  const w = T.maakWereld();
  const slijm = wezen(w, 'slijm');
  T.deurOp(w, 9, 4).staat = 'open';
  zet(slijm, 8, 5);
  assert.deepEqual(T.duwPad(w, slijm, { x: 1, y: -1 }, 2), []); // (9,5) is muur: geen hoek afsnijden
  zet(slijm, 8, 4);
  assert.deepEqual(T.duwPad(w, slijm, { x: 1, y: 0 }, 1), [{ x: 9, y: 4 }]); // recht erdoor mag wel
});

test('vanaf Meesterlijk raakt een windstoot een rij van drie', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  zet(held, 2, 4);
  zet(slijm, 4, 4);
  zet(skelet, 4, 5); // dwars op de duwrichting naast het doel
  const roestig = T.windstootDuwen(w, held, slijm, T.spreuk(metGebruik('windstoot', 0), 'windstoot'));
  assert.equal(roestig.length, 1);
  const meesterlijk = T.windstootDuwen(w, held, slijm, T.spreuk(metGebruik('windstoot', 15), 'windstoot'));
  assert.equal(meesterlijk.length, 2);
  assert.equal(meesterlijk[1].wezen, skelet);
  assert.deepEqual(meesterlijk[1].pad, [{ x: 5, y: 5 }, { x: 6, y: 5 }, { x: 7, y: 5 }]); // Vertrouwd zit erbij: 3 tegels
});

test('een windstoot vanaf Geoefend kost het monster punten in zijn volgende beurt', () => {
  const w = T.maakWereld();
  const held = wezen(w, 'held');
  const skelet = wezen(w, 'skelet');
  zet(held, 2, 12);
  assert.equal(T.monsterAp(skelet), 6);
  assert.equal(T.planMonsterBeurt(w, skelet, held).aanvallen, 1);
  skelet.apVerlies = 2;
  assert.equal(T.monsterAp(skelet), 4);
  const plan = T.planMonsterBeurt(w, skelet, held);
  assert.equal(plan.pad.length, 2); // nog wel erheen
  assert.equal(plan.aanvallen, 0); // maar geen klap meer
});

// ── Vuurschicht: door het doel heen ──

test('vanaf Legendarisch vliegt de schicht door naar het volgende monster op de lijn', () => {
  const w = T.maakWereld();
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  const van = { x: 2, y: 4 };
  zet(slijm, 4, 4);
  zet(skelet, 6, 4);
  const kandidaten = [slijm, skelet];
  assert.equal(T.volgendOpLijn(w, van, { x: 4, y: 4 }, 7, kandidaten), skelet);
  assert.equal(T.volgendOpLijn(w, van, { x: 4, y: 4 }, 3, kandidaten), null); // buiten bereik
  zet(skelet, 6, 5);
  assert.equal(T.volgendOpLijn(w, van, { x: 4, y: 4 }, 7, kandidaten), null); // niet op de lijn

  // Schuin telt net zo goed.
  zet(slijm, 4, 4);
  zet(skelet, 6, 6);
  assert.equal(T.volgendOpLijn(w, { x: 2, y: 2 }, { x: 4, y: 4 }, 7, kandidaten), skelet);

  // Een kist ertussen houdt de schicht tegen.
  zet(slijm, 12, 5);
  zet(skelet, 16, 5);
  assert.equal(T.volgendOpLijn(w, { x: 10, y: 5 }, { x: 12, y: 5 }, 7, kandidaten), null); // kisten op (13,5) en (14,5)
});

// ── Dwaallicht: wie erop afgaat ──

test('een dwalend monster gaat op het licht af, een wacht niet, en niet door een dichte deur', () => {
  const w = T.maakWereld();
  const slijm = wezen(w, 'slijm');
  const skelet = wezen(w, 'skelet');
  zet(slijm, 16, 4);
  assert.equal(T.lokt(w, slijm, { x: 14, y: 3 }), true);
  assert.equal(T.lokt(w, slijm, { x: 10, y: 4 }), false); // zes tegels: buiten zijn zicht
  zet(skelet, 5, 11);
  assert.equal(T.zietLicht(w, skelet, { x: 5, y: 13 }), true);
  assert.equal(T.lokt(w, skelet, { x: 5, y: 13 }), false); // de skeletwacht blijft staan

  zet(slijm, 10, 4);
  assert.equal(T.lokt(w, slijm, { x: 8, y: 4 }), false); // de deur op (9,4) is dicht
  T.deurOp(w, 9, 4).staat = 'open';
  assert.equal(T.lokt(w, slijm, { x: 8, y: 4 }), true);
});

test('een gelokt monster loopt naar het licht en blijft er staan tot het uit is', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 10, 4);
  zet(slijm, 16, 4);
  S.wereld.bekend.add('opslag');

  const h = await tover(S, 'dwaallicht', { x: 15, y: 2 }, 0.6);
  assert.equal(h.tekst, 'Dwaallicht hierheen: lokt de slijmkruiper');
  assert.equal(S.lichten.length, 1);
  await stap(S, 4);
  assert.notEqual(slijm.gelokt, null);
  assert.equal(T.afstand(T.tegelVan(slijm), { x: 15, y: 2 }) <= 1, true);
  assert.equal(T.gebruik(S.held, 'dwaallicht'), 1); // het lokte: dat telt

  await stap(S, 6); // het licht gaat na acht seconden uit
  assert.equal(S.lichten.length, 0);
  assert.equal(slijm.gelokt, null);
});

test('vanaf Meesterlijk blijft een monster nog even kijken als het licht uit is', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  S.held.meesterschap.dwaallicht = 15; // Meesterlijk: langer licht en nog even nakijken
  zet(S.held, 10, 4);
  zet(slijm, 16, 4);
  S.wereld.bekend.add('opslag');
  await tover(S, 'dwaallicht', { x: 15, y: 2 }, 0.6);

  await stap(S, 16); // het licht duurt nu zestien seconden
  assert.notEqual(slijm.gelokt, null);
  await stap(S, 2);
  assert.notEqual(slijm.gelokt, null); // nablijven
  await stap(S, 3);
  assert.equal(slijm.gelokt, null);
});

test('in een gevecht kijkt een monster pas naar een dwaallicht als je het Legendarisch beheerst', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 12, 4);
  zet(slijm, 16, 4);
  await startGevecht(S, slijm);

  T.kiesSpreuk(S, 'dwaallicht');
  assert.equal(S.spreuk, null); // nog niet: hij zegt waarom
  assert.match(berichten[berichten.length - 1], /Legendarisch/);

  S.held.meesterschap.dwaallicht = 25;
  const h = richt(S, 'dwaallicht', { x: 15, y: 2 });
  assert.equal(S.spreuk, 'dwaallicht');
  assert.equal(h.kosten, 1); // Legendarisch: één actiepunt
  assert.equal(h.tekst, 'Dwaallicht hierheen: lokt de slijmkruiper');
  h.doe();
  await stap(S, 2);
  assert.deepEqual(slijm.afgeleid, { x: 15, y: 2 });

  const plan = T.planAfgeleid(S.wereld, slijm, slijm.afgeleid);
  assert.equal(plan.aanvallen, 0); // het loopt naar het licht in plaats van te slaan
  assert.equal(plan.pad.length > 0, true);
  assert.equal(T.gebruik(S.held, 'dwaallicht'), 26); // ook dit lokte: 25 plus deze
});

// ── Alleen raak gebruik telt ──

test('een spreuk die niets doet, telt niet en kan niet eens', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 17, 4);
  zet(slijm, 18, 4); // met zijn rug tegen de muur van de toren
  await startGevecht(S, slijm);

  const h = richt(S, 'windstoot', { wezen: slijm, x: 18, y: 4 });
  assert.equal(h.kan, false);
  assert.equal(h.tekst, 'Windstoot: slijmkruiper staat klem');
  assert.equal(h.doe, undefined);
  assert.equal(T.gebruik(S.held, 'windstoot'), 0);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD); // en het kostte hem niets
});

test('een dwaallicht dat niemand ziet, telt niet', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 3, 5);
  zet(slijm, 16, 4); // een andere kamer, achter een dichte deur
  await tover(S, 'dwaallicht', { x: 5, y: 5 }, 0.6);
  await stap(S, 10);
  assert.equal(T.gebruik(S.held, 'dwaallicht'), 0);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD + 1); // de maand ben je wel kwijt
});

// ── Uitspreken: het effect eerst, dan de tijd, dan het meesterschap ──

test('een vuurschicht raakt, kost daarna zijn jaar via T.verouder, en telt', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 12, 4);
  zet(slijm, 16, 4);
  await startGevecht(S, slijm);
  await metVerouderSpion(async (maanden) => {
    const h = await tover(S, 'vuurschicht', { wezen: slijm, x: 16, y: 4 });
    assert.equal(h.kosten, 5);
    assert.equal(h.maanden, 12);
    assert.deepEqual(maanden, [12]);
  });
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD + 12);
  assert.equal(slijm.leven < slijm.maxLeven, true);
  assert.equal(T.gebruik(S.held, 'vuurschicht'), 1);
  assert.equal(S.spreuk, null); // na het toveren heb je hem weer uit je hand gelegd
});

test('vanaf Geoefend brandt het doel na: één schade aan het begin van zijn beurt', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  S.held.meesterschap.vuurschicht = 8;
  zet(S.held, 12, 4);
  zet(slijm, 16, 4);
  await startGevecht(S, slijm);
  await tover(S, 'vuurschicht', { wezen: slijm, x: 16, y: 4 });
  assert.equal(slijm.brandt, 1);
  const na = slijm.leven;

  T.eindeBeurt(S);
  await stap(S, 3);
  assert.equal(slijm.leven, na - 1);
  assert.equal(slijm.brandt, 0); // het brandt één beurt na
});

test('een windstoot duwt het monster echt weg; de tegels kloppen met waar het staat', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  zet(S.held, 12, 4);
  zet(slijm, 14, 4);
  await startGevecht(S, slijm);
  await metVerouderSpion(async (maanden) => {
    const h = await tover(S, 'windstoot', { wezen: slijm, x: 14, y: 4 });
    assert.equal(h.tekst, 'Windstoot: slijmkruiper 2 tegels terug');
    assert.deepEqual(maanden, [3]);
  });
  assert.deepEqual(T.tegelVan(slijm), { x: 16, y: 4 });
  assert.deepEqual([slijm.x, slijm.y], [16, 4]); // aangekomen, niet halverwege blijven hangen
  assert.equal(T.wezenOp(S.wereld, 14, 4), null);
  assert.equal(T.wezenOp(S.wereld, 16, 4), slijm);
  assert.equal(slijm.geduwd, false);
  assert.equal(T.gebruik(S.held, 'windstoot'), 1);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD + 3);
});

test('buiten een gevecht gooit een windstoot alleen een deur dicht, en dat telt', async () => {
  const S = maakSpel();
  const slijm = wezen(S.wereld, 'slijm');
  const deur = T.deurOp(S.wereld, 9, 4);
  deur.staat = 'open';
  T.ontdekBijDeur(S.wereld, deur);
  zet(S.held, 6, 4);
  zet(slijm, 16, 4);

  // Op een wezen doet hij het hier niet.
  assert.equal(richt(S, 'windstoot', { wezen: slijm, x: 16, y: 4 }).kan, false);
  await metVerouderSpion(async (maanden) => {
    const h = await tover(S, 'windstoot', { x: 9, y: 4 }, 1);
    assert.equal(h.tekst, 'Windstoot: de deur dichtgooien');
    assert.equal(h.kosten, 0); // buiten een gevecht zijn er geen actiepunten
    assert.deepEqual(maanden, [3]);
  });
  assert.equal(deur.staat, 'dicht');
  assert.equal(T.gebruik(S.held, 'windstoot'), 1);
  assert.equal(S.held.leeftijd, T.STARTLEEFTIJD + 3);
});

test('te ver, iemand in de deur of een muur: het scherm zegt het, de klik doet niets', () => {
  const S = maakSpel();
  const deur = T.deurOp(S.wereld, 9, 4);
  deur.staat = 'open';
  T.ontdekBijDeur(S.wereld, deur);
  zet(S.held, 3, 4);
  assert.equal(richt(S, 'windstoot', { x: 9, y: 4 }).tekst, 'Windstoot: te ver weg');

  zet(S.held, 6, 4);
  zet(wezen(S.wereld, 'wim'), 9, 4); // Wim staat in de opening
  assert.equal(richt(S, 'windstoot', { x: 9, y: 4 }).tekst, 'Windstoot: er staat iemand in de deur');

  assert.equal(richt(S, 'dwaallicht', { x: 18, y: 7 }).tekst, 'Dwaallicht: te ver weg'); // twaalf tegels
  assert.equal(richt(S, 'dwaallicht', { x: 0, y: 0 }), null); // een muur is geen plek voor een licht

  T.kiesSpreuk(S, 'vuurschicht'); // die bewaar je voor een gevecht
  assert.equal(S.spreuk, 'dwaallicht'); // dus houdt hij het dwaallicht gewoon vast
  assert.match(berichten[berichten.length - 1], /gevecht/);
  T.kiesSpreuk(S, null); // Escape of rechtsklik
  assert.equal(S.spreuk, null);
});
