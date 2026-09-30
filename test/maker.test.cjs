// De maker (gereedschap/maker/maker.js; werklijst vraag 69, C, Marcel, 30 sep: "De maker nu"): een gehucht dat elk
// spel anders ligt, uit dezelfde delen als het ontworpen gehucht. Hij staat nog niet in het spel; de schets
// (gereedschap/maker/schets.cjs) laadt hem zoals hier: het spel, en de maker erbij.
const test = require('node:test');
const assert = require('node:assert/strict');

const T = require('./laad.cjs').spel();
require('../gereedschap/maker/maker.js');

test('de maker: hetzelfde zaad geeft hetzelfde gehucht, en een ander zaad een ander', () => {
  const een = T.maakGehucht(1);
  assert.deepEqual(T.maakGehucht(1), een);
  const twee = T.maakGehucht(2);
  assert.notDeepEqual(twee.huizen, een.huizen);
});

test('de maker: elk gehucht deugt, met dezelfde delen als het ontworpen gehucht', () => {
  for (const zaad of [1, 2, 3, 4]) {
    const g = T.maakGehucht(zaad); // gooit een fout als geen enkele poging deugt
    assert.equal(T.keurGehucht(g), null, `zaad ${zaad}`);
    const rollen = g.huizen.map((h) => h.rol).sort();
    assert.deepEqual(rollen, ['boerderij', 'boerderij', 'boerderij', 'boerderij', 'boerderij', 'herberg', 'huis', 'hut', 'hut', 'kooi', 'schout']);
    // elke boerderij een andere tekening, en elke boer zijn akkers, samen zo groot als in het ontworpen gehucht
    assert.equal(new Set(g.huizen.filter((h) => h.rol === 'boerderij').map((h) => h.tekening)).size, 5);
    assert.equal(g.akkers.reduce((n, a) => n + a.b * a.h, 0), 209);
    assert.equal(g.akkers.filter((a) => a.bestemming === 'weide').reduce((n, a) => n + a.b * a.h, 0), 30);
    for (const h of g.huizen.filter((x) => x.rol === 'boerderij')) assert.ok(g.akkers.some((a) => a.huis === h.huis), `${h.huis} heeft geen akker`);
    // de marskramer staat op het zand, op het plein, en de uitgang ligt op de rand van de kaart
    assert.ok(T.binnenRand(g.plein, g.marskramer.x + 0.5, g.marskramer.y + 0.5));
    assert.ok([0, g.b - 1].includes(g.uitgang.x) || [0, g.h - 1].includes(g.uitgang.y));
  }
});

test('de maker keurt het ontworpen gehucht goed: zijn keuring is niet strenger dan wat Marcel goedkeurde', () => {
  const { ontworpen } = require('../gereedschap/maker/schets.cjs');
  const g = ontworpen();
  assert.equal(g.fout, undefined, g.fout);
  assert.equal(g.maat.pleinTegels, 214);
  assert.equal(g.maat.akkerTegels, 209);
});
