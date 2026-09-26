// Toetst het tuin-vel (gereedschap/pixelart/tuin-sdf.cjs -> tegels/tuin.tsx, huizenbouwer ronde
// 4a): dat elk tuinstuk een gevulde cel heeft, dat het anker op het midden van de tegel staat (een
// hek is geen boom en geen gebouw: het heeft geen voetpunt en geen achterste voethoek, zie de
// toelichting bij "tuin" in naar-tiled.cjs), dat "vast" overeenkomt met het besluit in
// ontwerp/beeld.md ("Wat vast is", 22 sep 2026: het hek, de bank en de regenton houden je tegen;
// het hekje en de bedden niet), dat een hek laag genoeg blijft (geen palissade meer, zie
// ontwerp/werklijst.md ronde 4a en ontwerp/beeld.md "Hekjes van wilgentenen en van latten"), en dat
// een geplaatst tuinstuk in het spel ook echt tegenhoudt of juist niet. Dat laatste op een kleine
// kaart in het geheugen, niet op kaarten/proef.tmj — die blijft van test/kaart.test.cjs.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { STUKKEN } = require('../gereedschap/pixelart/tuin-sdf.cjs');

const TEGELS = path.join(__dirname, '..', 'tegels');
const TEGELS_JSON = JSON.parse(fs.readFileSync(path.join(TEGELS, 'tegels.json'), 'utf8'));
const VEL = TEGELS_JSON.tuin;

test('tegels/tuin.tsx bestaat en kent elk tuinstuk uit tuin-sdf.cjs', () => {
  assert.ok(VEL, 'tegels/tegels.json mist het vel "tuin" — draai npm run tiled tuin (of npm run tiled)');
  const namen = new Set(VEL.tiles.map((t) => t.naam).filter(Boolean));
  for (const naam of STUKKEN) assert.ok(namen.has(naam), `"${naam}" (uit tuin-sdf.cjs se STUKKEN) staat niet in tuin.tsx`);
});

test('elk tuinstuk heeft een gevulde cel (geen stille misser van veilig() in naar-tiled.cjs)', () => {
  for (const t of VEL.tiles) {
    if (!t.naam) continue;
    assert.ok(t.doos, `${t.naam}: geen doos (dus krapDoos vond geen enkele pixel — de cel is leeg)`);
  }
});

test('het anker staat op het midden van de tegel: horizontaal precies het midden van de cel', () => {
  // Anders dan een boom (voetpunt) of een gebouw (achterste voethoek) is een tuinstuk symmetrisch
  // rond het midden van zijn tegel: een recht stuk hek staat voor de helft op de ene buurtegel.
  assert.equal(VEL.anker[0], Math.round(VEL.tegelB / 2));
});

test('wat vast is, komt overeen met ontwerp/beeld.md ("Wat vast is", 22 sep 2026)', () => {
  const VAST = new Set();
  const LOS = new Set();
  for (const t of VEL.tiles) {
    if (!t.naam) continue;
    (t.vast ? VAST : LOS).add(t.naam);
  }
  for (const naam of STUKKEN) {
    const hoortVast = naam.startsWith('hek-') || naam.startsWith('bankje-') || naam === 'regenton';
    if (hoortVast) assert.ok(VAST.has(naam), `${naam} hoort vast te zijn (het hek, de bank, de regenton houden je tegen)`);
    else assert.ok(LOS.has(naam), `${naam} hoort NIET vast te zijn (het hekje en de bedden houden je niet tegen)`);
  }
});

test('een hek is laag en open: geen terugval naar het dichte staketsel van ronde 3', () => {
  // ontwerp/beeld.md, "Hekjes van wilgentenen en van latten" (22 sep 2026): het eerste hek (ronde
  // 3) was een dicht staketsel van planken en las op ware grootte als een palissade om een fort.
  // Deze toets legt geen exacte hoogte vast (dat is Marcels oordeel op de plaat, zie
  // gereedschap/pixelart/proef-hekjes.cjs), maar vangt wel een grove terugval: de tovenaar
  // (F.tovenaar(84)) is ongeveer 88-90 px hoog, en zelfs zijn schouder zit dan nog ver onder 55 px.
  for (const t of VEL.tiles) {
    if (!t.naam || !(t.naam.startsWith('hek-') || t.naam.startsWith('hekje-'))) continue;
    const boven = t.doos[1]; // hoe ver het plaatje boven het anker reikt, in px
    assert.ok(boven > 8, `${t.naam}: reikt maar ${boven}px boven zijn anker — dat is nauwelijks nog zichtbaar`);
    assert.ok(boven < 55, `${t.naam}: reikt ${boven}px boven zijn anker — dat is weer schouderhoogte, geen laag hekje meer`);
  }
});

// ---------------------------------------------------------------- in het spel

require('../js/wereld.js');
require('../beelden/beschrijving.js');
require('../tegels/tegels.js');
require('../js/mensen.js');
require('../js/kaart.js');
const T = globalThis.Spel;

// Een kleine kaart in het geheugen: gras overal, en twee tuinstukken op de objectlaag, net zoals
// Marcel ze met "Tegel invoegen" in Tiled zou neerzetten. th=32 (tileheight), obj.x/y in die
// eenheid (zie js/kaart.js en naar-kaarten.cjs se eigen wachter).
function kleineKaart(naam1, naam2) {
  const grondId = T.TEGELS.grond.tiles.findIndex((t) => t.naam === 'gras');
  const tuinId1 = T.TEGELS.tuin.tiles.findIndex((t) => t.naam === naam1);
  const tuinId2 = T.TEGELS.tuin.tiles.findIndex((t) => t.naam === naam2);
  assert.ok(grondId >= 0 && tuinId1 >= 0 && tuinId2 >= 0, 'gras, ' + naam1 + ' of ' + naam2 + ' niet gevonden in tegels.json');
  const GROND_GID = 1;
  const TUIN_GID = GROND_GID + T.TEGELS.grond.tiles.length;
  const b = 6;
  const h = 6;
  return T.laadKaart({
    width: b, height: h, tileheight: 32,
    tilesets: [{ firstgid: GROND_GID, source: 'grond.tsx' }, { firstgid: TUIN_GID, source: 'tuin.tsx' }],
    layers: [
      { type: 'tilelayer', width: b, height: h, data: new Array(b * h).fill(GROND_GID + grondId) },
      { type: 'objectgroup', objects: [
        { id: 1, gid: TUIN_GID + tuinId1, x: 2 * 32, y: 2 * 32 },
        { id: 2, gid: TUIN_GID + tuinId2, x: 3 * 32, y: 2 * 32 },
      ] },
    ],
  });
}

test('een vast tuinstuk (het hek) houdt de held tegen', () => {
  const w = kleineKaart('hek-lat-x', 'kool');
  assert.equal(T.tegel(w, 2, 2), 'muur');
  assert.equal(T.isVast(w, 2, 2), true);
  assert.equal(T.isBegaanbaar(w, 2, 2), false);
  const v = T.voorwerpOp(w, 2, 2);
  assert.equal(v && v.soort, 'hek-lat-x');
});

test('een los tuinstuk (het hekje, of een bed) houdt de held niet tegen', () => {
  const w = kleineKaart('hekje-tenen-x', 'kruidenbed');
  assert.equal(T.isVast(w, 2, 2), false);
  assert.equal(T.isBegaanbaar(w, 2, 2), true);
  assert.equal(T.isVast(w, 3, 2), false);
  assert.equal(T.isBegaanbaar(w, 3, 2), true);
  // het staat er wel, alleen blokkeert het niet
  const v = T.voorwerpOp(w, 2, 2);
  assert.equal(v && v.soort, 'hekje-tenen-x');
});
