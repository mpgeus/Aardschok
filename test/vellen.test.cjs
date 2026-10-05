// Laden wat er staat (werklijst vraag 114, stap 1 en 1b; Marcel, 4 okt: "A ja B ja C meteen erna"): de huizen en de
// gebouwen hebben elke tekening in een eigen bestand, en het spel laadt er een pas als hij op de kaart staat; een figuur
// pas als zijn wezen er staat (js/sprites.js). Hier zonder browser: een nagemaakt Image onthoudt wat er gevraagd wordt,
// en laadt pas als de toets het zegt.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const WORTEL = path.join(__dirname, '..');
const gevraagd = [];
const wacht = [];
globalThis.Image = class {
  set src(pad) {
    gevraagd.push(pad);
    this.naturalWidth = 1;
    this.naturalHeight = 1;
    wacht.push(() => (fs.existsSync(path.join(WORTEL, pad)) ? this.onload() : this.onerror()));
  }
};
// Laat alles laden wat gevraagd is, en dan wat dat weer vroeg.
const beurt = () => new Promise((klaar) => setImmediate(klaar));
async function laadAlles() {
  do {
    await beurt();
    while (wacht.length) wacht.shift()();
    await beurt();
  } while (wacht.length);
}

const T = require('./laad.cjs').spel();
T.ui = new Proxy({}, { get: () => () => {} });

function nieuwSpel(zaad) {
  const echt = console.warn;
  console.warn = () => {};
  const S = { kalender: T.nieuweKalender() };
  try {
    assert.ok(T.beginOpKaart(S, 'gehucht', zaad));
  } finally {
    console.warn = echt;
  }
  return S;
}
const perTekening = (pad) => /^tegels\/(huizen|gebouwen)\//.test(pad);
const figuur = (pad) => pad.startsWith('beelden/figuren/');
const tekeningenOp = (w) => new Set(w.voorwerpen
  .filter((v) => v.vel && T.TEGELS[v.vel].perTekening)
  .map((v) => T.TEGELS[v.vel].tiles[v.id].bestand));
// De vellen van de figuren van wie er staat (zoals T.sprites.houding ze kiest), en voor een boer die van zijn werk: de
// maaier, en de zaaier, de wieder en de sprokkelaar als die er zijn (js/veldwerk.js), voor een boerin die van een vrouw.
function figurenOp(S) {
  const namen = new Set();
  for (const e of S.wereld.wezens) {
    namen.add(T.sprites.houding(S, e).naam);
    if (e.werkAkkers && e.werkAkkers.length) for (const n of T.sprites.werkVellenVan(e)) if (T.sprites.figuurGegevens(n)) namen.add(n);
  }
  const vellen = new Set();
  for (const n of namen) for (const h of Object.values(T.sprites.figuurGegevens(n).houdingen)) vellen.add(`beelden/figuren/${h.bestand}`);
  return { namen, vellen };
}

test('bij het begin laadt geen enkel huis, gebouw of figuur; wel elk ander vel', async () => {
  const klaar = T.sprites.laad();
  await laadAlles();
  assert.equal(await klaar, true);
  assert.ok(T.sprites.aan && T.sprites.buitenAan);
  assert.deepEqual(gevraagd.filter(perTekening), []);
  assert.deepEqual(gevraagd.filter(figuur), []);
  for (const vel of ['grond', 'rand', 'bomen', 'begroeiing', 'erf', 'tuin']) assert.ok(gevraagd.includes(T.TEGELS[vel].bestand), vel);
  for (const vel of ['muren', 'vloeren', 'voorwerpen']) assert.ok(gevraagd.includes(`beelden/${T.BEELDEN[vel].bestand}`), vel);
});

test('een kaart laadt precies de huizen, gebouwen en figuren die erop staan, elk één keer', async () => {
  const S = nieuwSpel();
  const op = tekeningenOp(S.wereld);
  const { namen, vellen } = figurenOp(S);
  assert.ok(op.size >= 8, `${op.size} tekeningen op het ontworpen gehucht`);
  assert.ok(namen.has('maaier') && namen.has('boer') && !namen.has('kobold'), [...namen].join(' '));
  const voor = gevraagd.length;
  T.sprites.laadWatErStaat(S.wereld);
  T.sprites.laadWatErStaat(S.wereld); // wat al onderweg is, vraagt het niet nog eens
  const nu = gevraagd.slice(voor);
  assert.deepEqual(new Set(nu.filter(perTekening)), op);
  assert.deepEqual(new Set(nu.filter(figuur)), vellen);
  assert.equal(nu.length, op.size + vellen.size);
  assert.equal(T.sprites.bezig(), op.size + vellen.size);
  await laadAlles();
  assert.equal(T.sprites.bezig(), 0);
  const alleFiguren = Object.values(T.BEELDEN.figuren).reduce((n, f) => n + Object.keys(f.houdingen).length, 0);
  assert.ok(vellen.size < alleFiguren / 2, `${vellen.size} van de ${alleFiguren} figuurvellen`);
});

test('een figuur die er nog niet was: eerst niets, en hij laadt; wie hem draagt, wacht zolang', async () => {
  const S = nieuwSpel();
  assert.ok(!gevraagd.some((p) => p.startsWith('beelden/figuren/wolf')), 'de wolf staat niet op het gehucht');
  assert.equal(T.sprites.figuur('wolf', 'staan', 'Z', 0), null);
  assert.ok(gevraagd.some((p) => p.startsWith('beelden/figuren/wolf')), 'de vraag zette het laden in gang');
  const wolf = T.maakWezen('wolf', S.schout.x + 2, S.schout.y);
  assert.equal(T.sprites.laadtWezen(wolf), true);
  await laadAlles();
  assert.equal(T.sprites.laadtWezen(wolf), false);
  assert.ok(T.sprites.wezen(S, wolf), 'nu staat hij er');
  assert.equal(T.sprites.laadtWezen(S.schout), false, 'de schout stond er al');
});

test('een tekening die nog niet geladen is: eerst niets, en hij laadt; daarna het plaatje', async () => {
  const id = T.TEGELS.huizen.tiles.findIndex((t) => t.naam === 'huis6');
  const bestand = T.TEGELS.huizen.tiles[id].bestand;
  assert.ok(!gevraagd.includes(bestand), 'huis6 staat niet op het ontworpen gehucht');
  assert.equal(T.sprites.wachtOp('huizen', id), true);
  assert.equal(T.sprites.buiten('huizen', id), null);
  assert.ok(gevraagd.includes(bestand), 'de vraag zette het laden in gang');
  assert.equal(T.sprites.wachtOp('huizen', id), true);
  await laadAlles();
  assert.equal(T.sprites.wachtOp('huizen', id), false);
  const stuk = T.sprites.buiten('huizen', id);
  assert.ok(stuk, 'nu is hij er');
  assert.deepEqual([stuk.sx, stuk.sy, stuk.b, stuk.h], T.TEGELS.huizen.tiles[id].cel);
  // Een gewoon vel (een boom) wacht nergens op.
  assert.equal(T.sprites.wachtOp('bomen', 0), false);
});

test('een bestand dat ontbreekt, wacht niet eeuwig: dan tekent het spel een vlak', async () => {
  const id = T.TEGELS.gebouwen.tiles.findIndex((t) => t.naam === 'kapel');
  const echt = T.TEGELS.gebouwen.tiles[id].bestand;
  T.TEGELS.gebouwen.tiles[id].bestand = 'tegels/gebouwen/bestaat-niet.png';
  try {
    assert.equal(T.sprites.buiten('gebouwen', id), null);
    await laadAlles();
    assert.equal(T.sprites.wachtOp('gebouwen', id), false);
    assert.equal(T.sprites.buiten('gebouwen', id), null);
  } finally {
    T.TEGELS.gebouwen.tiles[id].bestand = echt;
  }
});

test('Spel.debug.vellen telt wat er geladen is: wat er niet staat, kost niets', () => {
  const geladen = T.sprites.geladen();
  const huizen = geladen.filter((v) => v.pad.startsWith('tegels/huizen/'));
  const alleHuizen = T.TEGELS.huizen.tiles.filter((t) => t.bestand).length;
  assert.ok(huizen.length > 0 && huizen.length < alleHuizen, `${huizen.length} van de ${alleHuizen} huizen geladen`);
  assert.ok(geladen.every((v) => v.mb === (v.b * v.h * 4) / 1e6));
});

test('wie op zijn land werkt, draagt het vel van zijn werk; een boerin dat van een vrouw, als het er is (vraag 111)', () => {
  const S = nieuwSpel();
  const boeren = S.wereld.wezens.filter((e) => e.werkAkkers && e.werkAkkers.length);
  const boer = boeren.find((e) => e.vel === 'boer');
  const boerin = boeren.find((e) => e.vel === 'boerin');
  assert.ok(boer && boerin, 'het ontworpen gehucht heeft boeren en boerinnen');
  for (const e of [boer, boerin]) e.werkt = { soort: 'zaaien', x: e.tx, y: e.ty, tot: 1, rust: false };
  const { naam, houding } = T.sprites.houding(S, boer);
  assert.deepEqual([naam, houding], ['zaaier', 'zaaien']);
  const zaaister = T.BEELDEN.figuren.zaaister;
  try {
    delete T.BEELDEN.figuren.zaaister;
    assert.equal(T.sprites.houding(S, boerin).naam, 'zaaier', 'zolang er geen zaaister is, het vel van de man');
    T.BEELDEN.figuren.zaaister = T.BEELDEN.figuren.zaaier;
    assert.equal(T.sprites.houding(S, boerin).naam, 'zaaister');
    assert.equal(T.sprites.houding(S, boer).naam, 'zaaier', 'een boer blijft een man');
    assert.ok(T.sprites.werkVellenVan(boerin).includes('zaaister') && !T.sprites.werkVellenVan(boer).includes('zaaister'));
  } finally {
    if (zaaister) T.BEELDEN.figuren.zaaister = zaaister;
    else delete T.BEELDEN.figuren.zaaister;
  }
  // Rust hij even, dan staat hij; met een bundel hout loopt hij als sprokkelaar naar huis.
  boer.werkt.rust = true;
  assert.equal(T.sprites.houding(S, boer).houding, 'staan');
  boer.werkt = null;
  boer.draagt = 'bundel';
  assert.equal(T.sprites.houding(S, boer).naam, 'sprokkelaar');
});
