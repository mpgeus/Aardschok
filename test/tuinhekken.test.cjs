// Toetst het tuin-vel (gereedschap/pixelart/tuin-sdf.cjs -> tegels/tuin.tsx, huizenbouwer ronde
// 4a): dat elk tuinstuk een gevulde cel heeft, dat het anker op het midden van de tegel staat (een
// hek is geen boom en geen gebouw: het heeft geen voetpunt en geen achterste voethoek, zie de
// toelichting bij "tuin" in naar-tiled.cjs), dat "vast" overeenkomt met het besluit in
// ontwerp/beeld.md ("Wat vast is", 22 sep 2026: het hek, de bank en de regenton houden je tegen;
// het hekje en de bedden niet), dat een hek laag genoeg blijft (geen palissade meer, zie
// ontwerp/werklijst.md ronde 4a en ontwerp/beeld.md "Hekjes van wilgentenen en van latten"), en dat
// een geplaatst tuinstuk in het spel ook echt tegenhoudt of juist niet. Dat laatste op het proefdorp
// (test/grond.cjs); tot 23 okt op een kleine kaart uit T.laadKaart, die wegging met Tiled.
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

test('het anker staat op het midden van de tegel: een recht stuk hek reikt links en rechts even ver', () => {
  // Anders dan een boom (voetpunt) of een gebouw (achterste voethoek) is een tuinstuk symmetrisch
  // rond het midden van zijn tegel: een recht stuk hek staat voor de helft op de ene buurtegel.
  // Sinds het vel ingepakt is (vraag 114, 2a), heeft elke tegel zijn eigen anker; dit kijkt het na
  // aan wat er getekend staat (`doos`: links, boven, rechts, onder vanaf het anker).
  const recht = VEL.tiles.filter((t) => t.naam && /^hek(je)?-(tenen|lat)-[xy]$/.test(t.naam));
  assert.ok(recht.length >= 4, 'de rechte stukken hek staan op het vel');
  for (const t of recht) assert.ok(Math.abs(t.doos[0] - t.doos[2]) <= 1, `${t.naam}: reikt ${t.doos[0]} naar links en ${t.doos[2]} naar rechts`);
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

const T = require('./laad.cjs').spel();

const { proefDorp } = require('./grond.cjs');

// Twee tuinstukken naast elkaar op het proefdorp, op de eerste twee vrije tegels, zoals de maker ze legt (T.maakVoorwerp
// uit het vel, js/kaart.js): of ze tegenhouden, zegt "vast" in het vel. Geeft de kaart en de tegel van het eerste.
function tweeTuinstukken(naam1, naam2) {
  const { w, D } = proefDorp(T);
  const vrij = (x, y) => T.isBegaanbaar(w, x, y) && !T.voorwerpOp(w, x, y);
  const v = D.plek.vak;
  for (let y = v.y + 2; y < v.y + v.h - 2; y++) {
    for (let x = v.x + 2; x < v.x + v.b - 3; x++) {
      if (!vrij(x, y) || !vrij(x + 1, y)) continue;
      T.zetVoorwerp(w, T.maakVoorwerp(T.opzoekTegelNaam('tuin/' + naam1), x, y));
      T.zetVoorwerp(w, T.maakVoorwerp(T.opzoekTegelNaam('tuin/' + naam2), x + 1, y));
      return { w, x, y };
    }
  }
  throw new Error('geen twee vrije tegels naast elkaar op het proefdorp');
}

test('een vast tuinstuk (het hek) houdt de aanvoerder tegen', () => {
  const { w, x, y } = tweeTuinstukken('hek-lat-x', 'kool');
  assert.equal(T.isVast(w, x, y), true);
  assert.equal(T.isBegaanbaar(w, x, y), false);
  const v = T.voorwerpOp(w, x, y);
  assert.equal(v && v.soort, 'hek-lat-x');
});

test('een los tuinstuk (het hekje, of een bed) houdt de aanvoerder niet tegen', () => {
  const { w, x, y } = tweeTuinstukken('hekje-tenen-x', 'kruidenbed');
  assert.equal(T.isVast(w, x, y), false);
  assert.equal(T.isBegaanbaar(w, x, y), true);
  assert.equal(T.isVast(w, x + 1, y), false);
  assert.equal(T.isBegaanbaar(w, x + 1, y), true);
  // het staat er wel, alleen blokkeert het niet
  const v = T.voorwerpOp(w, x, y);
  assert.equal(v && v.soort, 'hekje-tenen-x');
});
