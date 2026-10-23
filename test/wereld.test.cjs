// De wereld zonder scherm, op het proefdorp: de grond per tegel, hoe een hoog ding op zijn voet sorteert, wat er op een
// tegel staat, het plein en de eilanden. Tot 25 sep ging dit bestand over het erf en de toren van het oude spel, en tot
// 23 okt (ronde 4 van het snoeien) ook over de overgang tussen de twee proefkaarten uit Tiled; die gingen weg.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
const { proefDorp } = require('./grond.cjs');

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

test('de grond ligt per tegel klaar om te tekenen, uit de terreinsets van rand.tsx', () => {
  const { w } = proefDorp(T);
  const o = w.overgangen[0];
  const g = T.grondOp(w, o.x, o.y);
  assert.ok(g && g.vel === 'rand', 'elke tegel weet welk grondplaatje eronder ligt, uit tegels/rand.tsx');
  assert.ok(Number.isInteger(g.id));
  assert.ok(g.naam, 'en hoe die grond heet');
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
  // Een gebouw van 13×13 op een bekende plek: x 5..17, y 5..17.
  const gebouw = { x: 5, y: 5, beslaat: [13, 13] };
  // Ten zuiden en ten oosten staat een wezen ervóór, ook vlak langs de rand of in de hoek.
  assert.equal(T.staatVoorGebouw(11, 18, gebouw), true, 'ten zuiden van het gebouw');
  assert.equal(T.staatVoorGebouw(18, 11, gebouw), true, 'ten oosten van het gebouw');
  assert.equal(T.staatVoorGebouw(5, 18, gebouw), true, 'zuidrand, uiterst westen van de voet');
  assert.equal(T.staatVoorGebouw(18, 5, gebouw), true, 'oostrand, uiterst noorden van de voet');
  assert.equal(T.staatVoorGebouw(18, 18, gebouw), true, 'zuidoosthoek, voorbij allebei');
  // Ten noorden en ten westen staat hij erachter.
  assert.equal(T.staatVoorGebouw(11, 4, gebouw), false, 'ten noorden van het gebouw');
  assert.equal(T.staatVoorGebouw(4, 11, gebouw), false, 'ten westen van het gebouw');
  assert.equal(T.staatVoorGebouw(4, 4, gebouw), false, 'noordwesthoek');
  // Marcels geval: recht ten zuiden staat een wezen ervóór, terwijl zijn eigen som (11 + 18 = 29)
  // onder de vóórste hoek van diepteVan blijft (34) — precies de tegenstrijdigheid die de fout
  // was: de tekenvolgorde zei "erachter" (lagere som) en de doorkijk zei "ervóór". Vandaar dat de
  // tekenvolgorde nu ook staatVoorGebouw vraagt (T.tekenVolgorde in js/tekenen.js), niet meer de
  // som van diepteVan tegen een los wezen.
  assert.ok(11 + 18 < T.diepteVan(gebouw), 'de som van het wezen ligt onder diepteVan(gebouw)');
});

test('T.tekenVolgorde: wie achter een huis loopt, komt ervóór; wie ervoor loopt, erna; ook in een drukke straat', () => {
  // Twee huizen zoals in het gehucht tot 26 sep (toen het een plein kreeg): dat van de aanvoerder (x 21..26,
  // y 21..28) en daarachter, aan de overkant van een steegje van één tegel, een boerderij (x 20..25,
  // y 30..37). Een krappe plek, en daarom een goede proef voor de volgorde.
  const aanvoerder = { x: 21, y: 21, beslaat: [6, 8] };
  const boerderij = { x: 20, y: 30, beslaat: [6, 8] };
  const item = (v) => ({ d: T.diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: v, naam: 'huis' + v.x });
  const los = (x, y, l, naam) => ({ d: x + y, l, punt: { x, y }, naam });
  // Veel dingen door elkaar: tot 26 sep zette een vergelijking per paar hier iemand op het dak. Niets
  // staat in een huis: daar kan in het spel ook niets staan.
  const binnen = (x, y) => [aanvoerder, boerderij].some((v) => x >= v.x && x < v.x + v.beslaat[0] && y >= v.y && y < v.y + v.beslaat[1]);
  const lijst = [item(boerderij), item(aanvoerder)];
  for (let x = 14; x <= 34; x++) for (const y of [18, 29, 38]) lijst.push(los(x, y, 2, `wezen ${x},${y}`));
  for (let i = 0; i < 60; i++) {
    const x = 10 + (i * 7) % 30;
    const y = 12 + (i * 11) % 30;
    if (!binnen(x, y)) lijst.push(los(x, y, 1, `boom ${i}`));
  }
  const volgorde = T.tekenVolgorde(lijst.slice().reverse());
  const plek = (naam) => volgorde.findIndex((it) => it.naam === naam);
  // Wat op dezelfde schuine rijen staat als het huis, en het dus op het scherm kan overlappen.
  const rij = (it, v) => it.punt.x - it.punt.y >= v.x - (v.y + v.beslaat[1] - 1) && it.punt.x - it.punt.y <= v.x + v.beslaat[0] - 1 - v.y;
  for (const v of [aanvoerder, boerderij]) {
    for (const it of volgorde) {
      if (it.gebouw || !rij(it, v)) continue;
      const voor = T.staatVoorGebouw(it.punt.x, it.punt.y, v);
      assert.equal(plek(it.naam) > plek('huis' + v.x), voor, `${it.naam} ${voor ? 'na' : 'vóór'} het huis op ${v.x},${v.y}`);
    }
  }
  assert.ok(plek('huis21') < plek('huis20'), 'het raadhuis ligt achter de boerderij');
  assert.ok(plek('wezen 24,29') < plek('huis20'), 'wie in het steegje staat, verdwijnt achter de boerderij');
  assert.ok(plek('wezen 24,29') > plek('huis21'), 'en staat vóór het raadhuis');
});

test('T.tekenVolgorde: twee gebouwen gaan op hun hele voet, ook een lang gebouw met een grotere som', () => {
  const item = (v, naam) => ({ d: T.diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: v, naam });
  const namen = (lijst) => T.tekenVolgorde(lijst).map((it) => it.naam);
  // De kapel van een nieuw spel (5 bij 10) en de hut ten zuiden ervan: de hut staat ervóór. Tot 3 okt telde van de kapel
  // alleen zijn achterste hoek, die buiten de schuine rijen van de hut lag, en kwam de kapel over de hut heen (Marcel:
  // "komen op een laag vóór de rest te staan").
  const kapel = { x: 20, y: 24, beslaat: [5, 10] };
  const hut = { x: 21, y: 36, beslaat: [5, 4] };
  assert.deepEqual(namen([item(hut, 'hut'), item(kapel, 'kapel')]), ['kapel', 'hut']);
  assert.deepEqual(namen([item(kapel, 'kapel'), item(hut, 'hut')]), ['kapel', 'hut']);
  // Een lange rij (30 breed) en een klein huis ten zuiden ervan: het huis staat ervóór, al is zijn som kleiner.
  const rij = { x: 0, y: 0, beslaat: [30, 2] };
  const klein = { x: 10, y: 5, beslaat: [2, 2] };
  assert.ok(T.diepteVan(klein) < T.diepteVan(rij));
  assert.deepEqual(namen([item(klein, 'klein'), item(rij, 'rij')]), ['rij', 'klein']);
  assert.equal(T.gebouwVoorGebouw(klein, rij), true);
  assert.equal(T.gebouwVoorGebouw(rij, klein), false);
});

// ---------------------------------------------------------------- de overgang

test('de weg het dorp uit leidt bewust nergens heen: alleen mist, en geen fout in de console', () => {
  // Achter de weg is nog niets; de speeltest telde die fout als zijn aanvoerder de weg af liep (3 okt).
  const { S } = proefDorp(T);
  const uit = S.wereld.overgangen[0];
  assert.ok(S.wereld.proef && uit && !T.GEBIEDEN[uit.naar], 'het dorp is een proefkaart met een weg naar nergens');
  const fouten = [];
  const berichten = [];
  const oud = console.error;
  const oudUi = T.ui;
  console.error = (m) => fouten.push(m);
  T.ui = { bericht: (t) => berichten.push(t) };
  try {
    T.gaNaarGebied(S, uit.naar);
  } finally {
    console.error = oud;
    T.ui = oudUi;
  }
  assert.deepEqual(fouten, []);
  assert.deepEqual(berichten, ['There is nothing that way yet, only mist.']);
});

// ------------------------------------------------- wat er op een tegel staat (js/wereld.js, werklijst vraag 71)

// Zoals T.voorwerpOp het tot 30 sep deed: alle voorwerpen aflopen. De lijst per tegel moet precies dit geven. (Op het
// eiland ook wat er groeit, uit zijn stuk: T.voorwerpenIn.)
const langsAlle = (w, x, y) => [...w.voorwerpen, ...(Number.isInteger(x) && Number.isInteger(y) ? T.voorwerpenIn(w, { x, y, b: 1, h: 1 }).filter((v) => v.natuur) : [])].find((v) => {
  const f = T.voetVan(v);
  return x >= f.x1 && x <= f.x2 && y >= f.y1 && y <= f.y2;
}) || null;

// En T.voorwerpOpVak, het hele vak in één keer (voor de nacht van het wild, js/bos.js), geeft op elke tegel hetzelfde.
function vergelijkElkeTegel(w, waar) {
  const K = T.kaartVak(w);
  const vak = { x: K.x - 2, y: K.y - 2, b: K.b + 4, h: K.h + 4 };
  const inVak = T.voorwerpOpVak(w, vak);
  for (let y = vak.y; y < vak.y + vak.h; y++) {
    for (let x = vak.x; x < vak.x + vak.b; x++) {
      const v = T.voorwerpOp(w, x, y);
      if (v !== langsAlle(w, x, y)) assert.fail(`${waar}: op ${x},${y} geeft de lijst per tegel iets anders dan alle voorwerpen aflopen`);
      if (inVak[(y - vak.y) * vak.b + (x - vak.x)] !== v) assert.fail(`${waar}: op ${x},${y} geeft T.voorwerpOpVak iets anders dan T.voorwerpOp`);
    }
  }
}

// Het proefdorp (test/grond.cjs) van het eiland met dit zaad, met genoeg om te bouwen.
function gehuchtOm(zaad) {
  const { S } = proefDorp(T, { zaad });
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set() }, T.schermVelden());
  for (const wat of ['hout', 'goud', 'steen']) T.zetVoorraad(S.dorp, wat, 500);
  return S;
}

test('de lijst per tegel geeft hetzelfde voorwerp als alle voorwerpen aflopen, ook na bouwen en weghalen', () => {
  for (const zaad of [2, 3]) {
    const S = gehuchtOm(zaad);
    const w = S.wereld;
    const waar = `het proefdorp van zaad ${zaad}`;
    vergelijkElkeTegel(w, waar);
    // Een hut erbij, waar hij past: zijn voorwerp komt erbij (js/gebouwen.js).
    // (Met een ruimer bouwbereik dan de 16 tegels van het spel, zoals het proefdorp zelf bouwt: test/grond.cjs.)
    let gezet = null;
    const bereik = T.BEGIN_INSTELLINGEN.bouwBereik;
    T.BEGIN_INSTELLINGEN.bouwBereik = 40;
    try {
      const K = T.kaartVak(w);
      for (let y = K.y; y < K.y + K.h && !gezet; y++) {
        for (let x = K.x; x < K.x + K.b && !gezet; x++) if (!T.waaromPastHetNiet(S.dorp, 'hut', x, y)) gezet = T.plaatsGebouw(S.dorp, 'hut', x, y);
      }
    } finally {
      T.BEGIN_INSTELLINGEN.bouwBereik = bereik;
    }
    assert.ok(gezet && gezet.gelukt, `${waar}: ergens past een hut`);
    assert.equal(T.voorwerpOp(w, gezet.instantie.x, gezet.instantie.y), gezet.instantie.voorwerp, 'de nieuwe hut staat meteen in de lijst');
    vergelijkElkeTegel(w, `${waar}, met een hut erbij`);
    // De schandpaal van de heer (js/heer.js), en een boom die weggaat.
    T.zetSchandpaalNeer(S.dorp);
    vergelijkElkeTegel(w, `${waar}, met de schandpaal`);
    const boom = w.voorwerpen.find((v) => v !== gezet.instantie.voorwerp && v.soort !== 'schandpaal');
    T.haalVoorwerpWeg(w, boom);
    assert.equal(w.voorwerpen.includes(boom), false);
    vergelijkElkeTegel(w, `${waar}, zonder ${boom.soort}`);
  }
});

test('wie een voorwerp op de kaart zet of weghaalt, doet dat met T.zetVoorwerp en T.haalVoorwerpWeg', () => {
  // Anders weet de lijst per tegel het niet, en staat er voor T.isBegaanbaar een boom waar er geen meer is.
  const fs = require('node:fs');
  const path = require('node:path');
  const map = path.join(__dirname, '..', 'js');
  const fout = [];
  for (const f of fs.readdirSync(map).filter((f) => f.endsWith('.js') && f !== 'wereld.js')) {
    fs.readFileSync(path.join(map, f), 'utf8').split('\n').forEach((regel, i) => {
      if (/^\s*\/\//.test(regel)) return;
      if (/\.voorwerpen\.(push|splice|unshift|shift|pop|sort|reverse|fill)\(/.test(regel)) fout.push(`js/${f}:${i + 1}`);
    });
  }
  assert.deepEqual(fout, [], `Zet en haal voorwerpen met T.zetVoorwerp en T.haalVoorwerpWeg (js/wereld.js): ${fout.join(', ')}`);
});

test('de tegels van het plein komen één keer per plein, en een plek op het plein is dezelfde als vroeger', () => {
  // Zoals T.plekOpHetPlein het tot 30 sep deed, voor elk kind elke dag opnieuw (het plein van het dorp, D.plek).
  const vroeger = (D, n) => {
    const w = D.wereld;
    const rand = D.plek.plein;
    if (!rand || rand.length < 3) return null;
    const xs = rand.map((p) => p[0]);
    const ys = rand.map((p) => p[1]);
    const tegels = [];
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (T.opHetPlein(w, x, y) && T.isBegaanbaar(w, x, y)) tegels.push({ x, y });
      }
    }
    return tegels.length ? tegels[(Math.imul(n | 0, 2654435761) >>> 0) % tegels.length] : null;
  };
  for (const zaad of [2, 3]) {
    const D = gehuchtOm(zaad).dorp;
    assert.ok(T.pleinTegels(D).length > 50, 'het plein heeft tegels');
    assert.equal(T.pleinTegels(D), T.pleinTegels(D), 'één keer uitgerekend');
    for (let n = 0; n < 80; n++) assert.deepEqual(T.plekOpHetPlein(D, n), vroeger(D, n), `plek ${n}`);
    // Wie de plek krijgt, kan er niets aan veranderen voor een ander.
    const p = T.plekOpHetPlein(D, 3);
    p.x += 100;
    assert.deepEqual(T.plekOpHetPlein(D, 3), vroeger(D, 3));
  }
  assert.deepEqual(T.pleinTegels({ plek: { plein: null } }), [], 'een plek zonder plein heeft geen tegels op het plein');
});

// ---------------------------------------------------------------------------------------------
// Eilanden (werklijst vraag 88; Marcel, 2 okt: "Zoizo bezette tegels zijn uit te sluiten toch?")
// ---------------------------------------------------------------------------------------------

// Een lege kaart van b bij h tegels, met een muur over de hele hoogte op kolom `muurX`.
function kaartMetMuur(b, h, muurX) {
  const tegels = [];
  for (let y = 0; y < h; y++) tegels.push(Array.from({ length: b }, (_, x) => (x === muurX ? 'muur' : 'vloer')));
  return { b, h, tegels, voorwerpen: [], wezens: [] };
}

test('eilanden: twee kanten van een muur zijn twee eilanden, en een gat erin maakt er weer één', () => {
  const w = kaartMetMuur(10, 6, 4);
  assert.notEqual(T.eilandOp(w, 1, 1), T.eilandOp(w, 8, 1));
  assert.equal(T.eilandOp(w, 4, 2), -1, 'een muur ligt op geen eiland');
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 8, y: 4 }), false);
  assert.equal(T.zoekPad({ x: 1, y: 1 }, { x: 8, y: 4 }, (x, y) => T.isBegaanbaar(w, x, y), (x, y) => T.isVast(w, x, y)), null);
  T.zetTegel(w, 4, 3, 'vloer');
  T.kaartVeranderd(w);
  assert.equal(T.eilandOp(w, 1, 1), T.eilandOp(w, 8, 1));
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 8, y: 4 }), true);
});

test('eilanden: een voorwerp dat de doorgang sluit, en wie ingemetseld staat, of met tot en naast', () => {
  const w = kaartMetMuur(10, 6, 4);
  T.zetTegel(w, 4, 3, 'vloer');
  T.kaartVeranderd(w);
  const blok = T.zetVoorwerp(w, { soort: 'blokkade', x: 4, y: 3 });
  T.VOORWERPEN.blokkade = T.VOORWERPEN.blokkade || { blokkeert: true };
  T.kaartVeranderd(w);
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 8, y: 4 }), false, 'het voorwerp sluit het gat');
  T.haalVoorwerpWeg(w, blok);
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 8, y: 4 }), true, 'weggehaald, en het weet het meteen');
  // Een doel in de muur zelf, met tot: de tegels eromheen tellen.
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 4, y: 0 }, { tot: 1 }), true);
  // Ingemetseld: op een muur, en alles eromheen muur.
  const dicht = kaartMetMuur(5, 5, 99);
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) T.zetTegel(dicht, x, y, 'muur');
  T.kaartVeranderd(dicht);
  assert.equal(T.kanErKomen(dicht, { x: 2, y: 2 }, { x: 0, y: 0 }), false);
  assert.equal(T.kanErKomen(dicht, { x: 2, y: 2 }, { x: 2, y: 2 }), true, 'wie er al is, hoeft niet te zoeken');
});

// Waar de kaart veranderde (T.kaartPlekkenSinds): de grond in js/tekenen.js tekent alleen daar opnieuw (13 okt). Een
// verandering zonder plek, of een te oude versie, is onbekend: dan alles.
test('de kaart weet waar ze veranderde, tot een verandering zonder plek', () => {
  const w = kaartMetMuur(10, 6, 4);
  const begin = T.kaartVersie(w);
  assert.deepEqual(T.kaartPlekkenSinds(w, begin), [], 'niets veranderd');
  T.zetTegel(w, 4, 3, 'vloer');
  T.kaartVeranderd(w, { x1: 4, y1: 3, x2: 4, y2: 3 });
  T.kaartVeranderd(w, { x1: 1, y1: 1, x2: 2, y2: 2 });
  assert.deepEqual(T.kaartPlekkenSinds(w, begin), [{ x1: 4, y1: 3, x2: 4, y2: 3 }, { x1: 1, y1: 1, x2: 2, y2: 2 }]);
  assert.deepEqual(T.kaartPlekkenSinds(w, begin + 1), [{ x1: 1, y1: 1, x2: 2, y2: 2 }], 'alleen wat sindsdien veranderde');
  const voor = T.kaartVersie(w);
  T.kaartVeranderd(w);
  assert.equal(T.kaartPlekkenSinds(w, begin), null, 'een verandering zonder plek: niet bekend waar');
  T.kaartVeranderd(w, { x1: 5, y1: 5, x2: 5, y2: 5 });
  assert.deepEqual(T.kaartPlekkenSinds(w, voor + 1), [{ x1: 5, y1: 5, x2: 5, y2: 5 }], 'erna weer wel');
  for (let i = 0; i < 100; i++) T.kaartVeranderd(w, { x1: 0, y1: 0, x2: 0, y2: 0 });
  assert.equal(T.kaartPlekkenSinds(w, voor + 1), null, 'te lang geleden');
});

test('wie een tegel van de kaart verandert, zegt het met T.kaartVeranderd', () => {
  // Anders kennen de eilanden de muur niet, en zegt T.kanErKomen "geen weg" waar er wel een is, of andersom.
  const fs = require('node:fs');
  const path = require('node:path');
  const map = path.join(__dirname, '..', 'js');
  const fout = [];
  for (const f of fs.readdirSync(map).filter((f) => f.endsWith('.js') && !['kaart.js', 'maker.js'].includes(f))) {
    const tekst = fs.readFileSync(path.join(map, f), 'utf8');
    const schrijft = tekst.split('\n').some((r) => !/^\s*\/\//.test(r) && /\.tegels\[[^\]]+\]\[[^\]]+\]\s*=[^=]/.test(r));
    if (schrijft && !tekst.includes('T.kaartVeranderd(')) fout.push(`js/${f}`);
  }
  assert.deepEqual(fout, [], `Zeg na het veranderen van een tegel T.kaartVeranderd(w) (js/wereld.js): ${fout.join(', ')}`);
});

// ------------------------------------------------- het land na het laden (js/wereld.js; snelheid.md, F2)

test('na het laden maakt T.maakOpenStukken het land van alle open stukken, een paar per keer, zonder dat S verandert', () => {
  const { S, w } = proefDorp(T); // zoals een geladen spel: de stukken zelf worden niet bewaard
  const voor = T.bewaarSpel(S, { nu: 0 });
  const was = T.WERELD_INSTELLINGEN.ladenMsPerBeeld;
  T.WERELD_INSTELLINGEN.ladenMsPerBeeld = 0; // dan precies één stuk per keer
  let r;
  let keer = 0;
  try {
    do {
      r = T.maakOpenStukken(w);
      keer++;
      assert.equal(r.open, w.open.size);
      assert.ok(r.klaar >= keer || r.klaar === r.open, `na ${keer} keer ${r.klaar} van ${r.open}`);
    } while (r.klaar < r.open && keer < 100);
  } finally {
    T.WERELD_INSTELLINGEN.ladenMsPerBeeld = was;
  }
  assert.equal(r.klaar, r.open, 'alle open stukken zijn er');
  assert.ok(keer > 1, 'meer dan één keer, want één stuk per keer');
  assert.deepEqual(T.maakOpenStukken(w), { klaar: w.open.size, open: w.open.size }, 'daarna is er niets meer te maken');
  assert.equal(T.bewaarSpel(S, { nu: 0 }), voor, 'het land maken verandert niets aan wat bewaard wordt');
});
