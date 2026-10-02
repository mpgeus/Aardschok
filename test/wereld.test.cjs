// De wereld zonder scherm: dat elke kaart vanzelf een gebied is, hoe een hoog ding op zijn voet
// sorteert, en de overgang van de ene kaart naar de andere en terug. De overgangen lopen over de
// twee proefkaarten (proef en proefbos), die voor de toetsen aan elkaar vastzitten. Tot 25 sep ging
// dit bestand over het erf en de toren van het oude spel, op kaarten/wereld.tmj; die kaart ging weg,
// de machinerie bleef.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();

// Zonder scherm doet elke aanroep naar T.ui niets.
T.ui = new Proxy({}, { get: () => () => {} });

test('de grond ligt per tegel klaar om te tekenen, uit de terreinsets van rand.tsx', () => {
  const w = T.laadKaart(T.KAARTEN.gehucht, T.BETEKENIS.gehucht);
  const o = w.overgangen[0];
  const g = w.grond[o.y][o.x];
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
  // Twee huizen zoals in het gehucht tot 26 sep (toen het een plein kreeg): dat van de schout (x 21..26,
  // y 21..28) en daarachter, aan de overkant van een steegje van één tegel, een boerderij (x 20..25,
  // y 30..37). Een krappe plek, en daarom een goede proef voor de volgorde.
  const schout = { x: 21, y: 21, beslaat: [6, 8] };
  const boerderij = { x: 20, y: 30, beslaat: [6, 8] };
  const item = (v) => ({ d: T.diepteVan(v), l: 1, punt: { x: v.x, y: v.y }, gebouw: v, naam: 'huis' + v.x });
  const los = (x, y, l, naam) => ({ d: x + y, l, punt: { x, y }, naam });
  // Veel dingen door elkaar: tot 26 sep zette een vergelijking per paar hier iemand op het dak. Niets
  // staat in een huis: daar kan in het spel ook niets staan.
  const binnen = (x, y) => [schout, boerderij].some((v) => x >= v.x && x < v.x + v.beslaat[0] && y >= v.y && y < v.y + v.beslaat[1]);
  const lijst = [item(boerderij), item(schout)];
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
  for (const v of [schout, boerderij]) {
    for (const it of volgorde) {
      if (it.gebouw || !rij(it, v)) continue;
      const voor = T.staatVoorGebouw(it.punt.x, it.punt.y, v);
      assert.equal(plek(it.naam) > plek('huis' + v.x), voor, `${it.naam} ${voor ? 'na' : 'vóór'} het huis op ${v.x},${v.y}`);
    }
  }
  assert.ok(plek('huis21') < plek('huis20'), 'het huis van de schout ligt achter de boerderij');
  assert.ok(plek('wezen 24,29') < plek('huis20'), 'wie in het steegje staat, verdwijnt achter de boerderij');
  assert.ok(plek('wezen 24,29') > plek('huis21'), 'en staat vóór het huis van de schout');
});

// ---------------------------------------------------------------- de overgang

// Een spel op de proefkaart, met de schout naast de uitgang naar het proefbos.
function nieuwSpel() {
  const S = { tijd: 0, effecten: [], wachters: [], inventaris: new Set(), bezocht: new Set(), gebieden: {} };
  S.wereld = T.gebied(S, 'proef');
  const o = S.wereld.overgangen[0];
  S.schout = T.maakWezen('schout', o.komt.x, o.komt.y);
  S.wereld.wezens.push(S.schout);
  S.modus = 'verkennen';
  return S;
}

test('een overgang brengt je naar de andere kaart, naast de uitgang daar', () => {
  const S = nieuwSpel();
  const o = S.wereld.overgangen[0];
  assert.equal(o.naar, 'proefbos');
  // erop stappen zet de overgang klaar; de spellus voert hem uit (js/main.js)
  T.bijAankomst(S, S.schout, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'proefbos');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'proefbos');
  // hij staat náást de uitgang, niet erop, en kan daar staan
  const terug = S.wereld.overgangen.find((x) => x.naar === 'proef');
  assert.notDeepEqual([S.schout.tx, S.schout.ty], [terug.x, terug.y]);
  assert.equal(T.afstand({ x: S.schout.tx, y: S.schout.ty }, terug), 1);
  assert.equal(T.isBegaanbaar(S.wereld, S.schout.tx, S.schout.ty), true);
  assert.ok(S.wereld.wezens.includes(S.schout), 'de schout hoort nu bij het proefbos');
  assert.ok(!T.gebied(S, 'proef').wezens.includes(S.schout), 'en niet meer bij de proefkaart');
});

test('en weer terug: dezelfde weg, de andere kant op, met dezelfde schout', () => {
  const S = nieuwSpel();
  S.schout.leven -= 7; // een klap onderweg
  S.inventaris.add('sleutel');
  T.gaNaarGebied(S, 'proefbos');
  const leven = S.schout.leven;
  const o = S.wereld.overgangen.find((x) => x.naar === 'proef');
  T.bijAankomst(S, S.schout, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'proef');
  T.gaNaarGebied(S, S.naarGebied);
  assert.equal(S.wereld.gebied, 'proef');
  assert.equal(S.schout.leven, leven, 'een overgang kost geen leven, en geeft het ook niet terug');
  assert.ok(S.inventaris.has('sleutel'), 'wat je bij je hebt, neem je mee');
  const uitgang = S.wereld.overgangen[0];
  assert.equal(T.afstand({ x: S.schout.tx, y: S.schout.ty }, uitgang), 1);
});

test('heen en terug kaatst niet: je landt nooit op een overgangstegel', () => {
  // Ging eerder mis: landen op de tegel die de overgang afvuurt, en dan sta je om beurten hier en
  // daar. Twee sloten: je landt er niet op (T.landingIn), en een overgang gaat pas weer af als je
  // er een keer af bent geweest (S.netGeland).
  const S = nieuwSpel();
  for (let ronde = 0; ronde < 3; ronde++) {
    for (const naar of ['proefbos', 'proef']) {
      T.gaNaarGebied(S, naar);
      const w = S.wereld;
      assert.equal(w.gebied, naar);
      assert.equal(T.overgangOp(w, S.schout.tx, S.schout.ty), null, `je landt in ${naar} niet op een overgangstegel`);
      assert.equal(T.isBegaanbaar(w, S.schout.tx, S.schout.ty, { deurenOpenen: true }), true);
      assert.equal(S.naarGebied, null, 'er staat geen tweede overgang klaar');
      // en de spellus laten draaien verandert daar niets aan
      T.bijAankomst(S, S.schout, { x: S.schout.tx, y: S.schout.ty });
      assert.equal(S.naarGebied, null, 'stilstaan op de landingstegel vuurt niets af');
    }
  }
});

test('een overgang gaat pas af als je er je pas beëindigt, niet als je erlangs loopt', () => {
  // Een overgang kan midden op een pad liggen; wie verderop wil zijn, wil niet halverwege weg zijn.
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'proefbos');
  const o = S.wereld.overgangen.find((x) => x.naar === 'proef');
  S.netGeland = null;
  // er doorheen lopen: er staat nog een stap in het pad
  S.schout.pad = [{ x: o.x - 1, y: o.y }];
  T.bijAankomst(S, S.schout, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, null, 'erlangs lopen brengt je niet weg');
  // er je pas beëindigen: dan wel
  S.schout.pad = [];
  T.bijAankomst(S, S.schout, { x: o.x, y: o.y });
  assert.equal(S.naarGebied, 'proef');
});

test('elk gebied heeft een weg terug', () => {
  const S = nieuwSpel();
  for (const naam of Object.keys(T.GEBIEDEN)) {
    const w = T.gebied(S, naam);
    assert.ok(w.overgangen && w.overgangen.length, `gebied "${naam}" heeft geen enkele overgang`);
    for (const o of w.overgangen) {
      if (!T.GEBIEDEN[o.naar]) {
        // Een weg die nog nergens heen leidt, mag alleen op een proefkaart: de weg de wereld in
        // van het gehucht, waar alleen de marskramer, de heer en de inner overheen komen.
        assert.ok(w.proef, `${naam}: de overgang wijst naar een gebied dat niet bestaat: ${o.naar}`);
        continue;
      }
      const plek = T.landingIn(T.gebied(S, o.naar), naam);
      assert.equal(T.overgangOp(T.gebied(S, o.naar), plek.x, plek.y), null);
    }
  }
});

test('een gebied blijft staan zoals je het achterliet', () => {
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'proefbos');
  const spin = S.wereld.wezens.find((e) => e.soort === 'reuzenspin');
  assert.ok(spin, 'er loopt een reuzenspin in het proefbos');
  spin.dood = true;
  T.gaNaarGebied(S, 'proef');
  T.gaNaarGebied(S, 'proefbos');
  assert.equal(S.wereld.wezens.find((e) => e.soort === 'reuzenspin').dood, true, 'een gedode spin blijft dood');
});

test('buiten bakent de kamer het slagveld niet af: alleen wie de schout echt ziet, doet mee', () => {
  const S = nieuwSpel();
  T.gaNaarGebied(S, 'proefbos');
  const w = S.wereld;
  assert.equal(w.buiten, true);
  const spin = w.wezens.find((e) => e.soort === 'reuzenspin');
  // de spin ver weg zetten: hij staat in dezelfde (enige) kamer, maar hoort niet mee te doen
  spin.x = spin.tx = 1;
  spin.y = spin.ty = w.h - 2;
  const mee = T.deelnemers(w, S.schout, null);
  assert.equal(mee.includes(spin), false, 'een spin aan de andere kant van het bos doet niet mee');
});

// ------------------------------------------------- elke kaart is vanzelf een gebied (js/gebied.js)

test('elke kaart uit T.KAARTEN is vanzelf een gebied, zonder dat er iets geregistreerd is', () => {
  // Dit is de hele bedoeling van de editor: Marcel tekent kaarten/<naam>.tmj, draait npm run
  // kaarten, en `overgang: "<naam>"` werkt. Staat er ergens weer een lijstje met de hand, dan
  // valt een nieuwe kaart daar stilletjes buiten.
  for (const naam of Object.keys(T.KAARTEN)) {
    assert.ok(T.GEBIEDEN[naam], `kaart "${naam}" hoort een gebied te zijn`);
  }
  assert.deepEqual(Object.keys(T.GEBIEDEN).sort(), Object.keys(T.KAARTEN).sort(), 'en er staat niets in code');
  // en de naam die de speler ziet komt uit de kaart zelf (de eigenschap "naam" van de map)
  assert.equal(T.GEBIEDEN.gehucht.naam, 'Het gehucht');
  assert.equal(T.GEBIEDEN.proefbos.naam, 'Het proefbos');
});

test('een overgang naar een kaart die niet bestaat, laat de speler niet vastlopen', () => {
  // Marcel typt "dorp" in Tiled en tekent kaarten/dorp.tmj pas morgen. Dan hoort het spel te
  // klagen op de console, maar gewoon door te spelen: je blijft staan waar je staat.
  const S = nieuwSpel();
  const waar = { x: S.schout.tx, y: S.schout.ty };
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
  assert.deepEqual({ x: S.schout.tx, y: S.schout.ty }, waar, 'en op dezelfde tegel');
  assert.equal(S.naarGebied, null, 'de overgang wordt niet elke tel opnieuw geprobeerd');
  assert.equal(S.wereld.wezens.includes(S.schout), true, 'de schout staat nog in zijn eigen wereld');
  assert.ok(fouten.some((m) => String(m).includes('ditbestaatniet')), 'en het klaagt hoorbaar');
});

// ------------------------------------------------- wat er op een tegel staat (js/wereld.js, werklijst vraag 71)

// Zoals T.voorwerpOp het tot 30 sep deed: alle voorwerpen aflopen. De lijst per tegel moet precies dit geven.
const langsAlle = (w, x, y) => w.voorwerpen.find((v) => {
  const f = T.voetVan(v);
  return x >= f.x1 && x <= f.x2 && y >= f.y1 && y <= f.y2;
}) || null;

function vergelijkElkeTegel(w, waar) {
  for (let y = -2; y < w.h + 2; y++) {
    for (let x = -2; x < w.b + 2; x++) {
      if (T.voorwerpOp(w, x, y) !== langsAlle(w, x, y)) assert.fail(`${waar}: op ${x},${y} geeft de lijst per tegel iets anders dan alle voorwerpen aflopen`);
    }
  }
}

// Het gehucht zoals een nieuw spel begint, stil en zonder venster, met genoeg om te bouwen.
function gehuchtOm(makerZaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() }; // het spel; zijn dorp (S.dorp) komt met de kaart
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', makerZaad));
  } finally {
    console.warn = echt;
  }
  Object.assign(S, { tijd: 0, wereldTijd: 0, modus: 'verkennen', vlaggen: new Set(), inventaris: new Set() }, T.schermVelden());
  for (const wat of ['hout', 'goud', 'steen']) T.zetVoorraad(S.dorp, wat, 500);
  return S;
}

test('de lijst per tegel geeft hetzelfde voorwerp als alle voorwerpen aflopen, ook na bouwen en weghalen', () => {
  for (const zaad of [undefined, 1]) {
    const S = gehuchtOm(zaad);
    const w = S.wereld;
    const waar = zaad == null ? 'het ontworpen gehucht' : `het gehucht van zaad ${zaad}`;
    vergelijkElkeTegel(w, waar);
    // Een hut erbij, waar hij past: zijn voorwerp komt erbij (js/gebouwen.js).
    let gezet = null;
    for (let y = 0; y < w.h && !gezet; y++) {
      for (let x = 0; x < w.b && !gezet; x++) if (!T.waaromPastHetNiet(S.dorp, 'hut', x, y)) gezet = T.plaatsGebouw(S.dorp, 'hut', x, y);
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

test('de tegels van het plein komen één keer per kaart, en een plek op het plein is dezelfde als vroeger', () => {
  // Zoals T.plekOpHetPlein het tot 30 sep deed, voor elk kind elke dag opnieuw.
  const vroeger = (w, n) => {
    if (!w || !w.plein || w.plein.length < 3) return null;
    const xs = w.plein.map((p) => p[0]);
    const ys = w.plein.map((p) => p[1]);
    const tegels = [];
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
        if (T.opHetPlein(w, x, y) && T.isBegaanbaar(w, x, y)) tegels.push({ x, y });
      }
    }
    return tegels.length ? tegels[(Math.imul(n | 0, 2654435761) >>> 0) % tegels.length] : null;
  };
  for (const zaad of [undefined, 2]) {
    const w = gehuchtOm(zaad).wereld;
    assert.ok(T.pleinTegels(w).length > 50, 'het plein heeft tegels');
    assert.equal(T.pleinTegels(w), T.pleinTegels(w), 'één keer uitgerekend');
    for (let n = 0; n < 80; n++) assert.deepEqual(T.plekOpHetPlein(w, n), vroeger(w, n), `plek ${n}`);
    // Wie de plek krijgt, kan er niets aan veranderen voor een ander.
    const p = T.plekOpHetPlein(w, 3);
    p.x += 100;
    assert.deepEqual(T.plekOpHetPlein(w, 3), vroeger(w, 3));
  }
  assert.deepEqual(T.pleinTegels({ plein: null }), [], 'een kaart zonder plein heeft geen tegels op het plein');
  assert.equal(T.plekOpHetPlein(T.gebied({}, 'proef'), 1), null);
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
  w.tegels[3][4] = 'vloer';
  T.kaartVeranderd(w);
  assert.equal(T.eilandOp(w, 1, 1), T.eilandOp(w, 8, 1));
  assert.equal(T.kanErKomen(w, { x: 1, y: 1 }, { x: 8, y: 4 }), true);
});

test('eilanden: een voorwerp dat de doorgang sluit, en wie ingemetseld staat, of met tot en naast', () => {
  const w = kaartMetMuur(10, 6, 4);
  w.tegels[3][4] = 'vloer';
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
  for (let y = 1; y <= 3; y++) for (let x = 1; x <= 3; x++) dicht.tegels[y][x] = 'muur';
  T.kaartVeranderd(dicht);
  assert.equal(T.kanErKomen(dicht, { x: 2, y: 2 }, { x: 0, y: 0 }), false);
  assert.equal(T.kanErKomen(dicht, { x: 2, y: 2 }, { x: 2, y: 2 }), true, 'wie er al is, hoeft niet te zoeken');
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
