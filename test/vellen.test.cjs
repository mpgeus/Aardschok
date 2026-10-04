// Laden wat er staat (werklijst vraag 114, stap 1; Marcel, 4 okt: "A ja B ja"): de huizen en de gebouwen hebben elke
// tekening in een eigen bestand, en het spel laadt er een pas als hij op de kaart staat (js/sprites.js). Hier zonder
// browser: een nagemaakt Image onthoudt wat er gevraagd wordt, en laadt pas als de toets het zegt.
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
const tekeningenOp = (w) => new Set(w.voorwerpen
  .filter((v) => v.vel && T.TEGELS[v.vel].perTekening)
  .map((v) => T.TEGELS[v.vel].tiles[v.id].bestand));

test('bij het begin laadt geen enkel huis of gebouw; wel elk ander vel', async () => {
  const klaar = T.sprites.laad();
  await laadAlles();
  assert.equal(await klaar, true);
  assert.ok(T.sprites.aan && T.sprites.buitenAan);
  assert.deepEqual(gevraagd.filter(perTekening), []);
  for (const vel of ['grond', 'rand', 'bomen', 'begroeiing', 'erf', 'tuin']) assert.ok(gevraagd.includes(T.TEGELS[vel].bestand), vel);
});

test('een kaart laadt precies de huizen en gebouwen die erop staan, elk één keer', async () => {
  const S = nieuwSpel();
  const op = tekeningenOp(S.wereld);
  assert.ok(op.size >= 8, `${op.size} tekeningen op het ontworpen gehucht`);
  const voor = gevraagd.length;
  T.sprites.laadWatErStaat(S.wereld);
  T.sprites.laadWatErStaat(S.wereld); // wat al onderweg is, vraagt het niet nog eens
  assert.deepEqual(new Set(gevraagd.slice(voor)), op);
  assert.equal(gevraagd.length - voor, op.size);
  assert.equal(T.sprites.bezig(), op.size);
  await laadAlles();
  assert.equal(T.sprites.bezig(), 0);
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
