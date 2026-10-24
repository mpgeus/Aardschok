// De plaat van proef (a) van vraag 190 (ontwerp/beeld.md, "Proef (a)"): de speerman uit het 3D-model met zijn eigen
// kleuren (eigen.py), op spelmaat naast de speerman van de generator zoals die nu in het spel staat. Per richting een rij van
// de generator (staan en lopen 0, 2, 4, 6) en een van het model; bovenaan het model groot. Van de zolen tot de helm even hoog
// als de generator, met de donkere rand (lopen.cjs).
//
//   node gereedschap/blender/eigen.cjs [Z ZW]   naar uit/blender/eigen.png, en per richting eigen-<r>-bewegend.png
'use strict';
const fs = require('fs');
const path = require('path');
const E = require('../ai/etiket.cjs');
const G = require('../pixelart/generator.cjs');
const { apng } = require('../pixelart/apng.cjs');
const L = require('./lopen.cjs');

const RENDER = path.join(__dirname, '..', 'pixelart', 'uit', 'blender', 'render');
const UIT = path.join(__dirname, '..', 'pixelart', 'uit', 'blender');
const BEELDEN = [0, 2, 4, 6];

// een HD-render verkleind tot de hoogte h, op grijs
function groot(beeld, h) {
  const pix = [];
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) pix.push(p);
  const k = h / beeld.h;
  const r = G.verkleind(beeld, pix, [beeld.b / 2, beeld.h], k);
  const b = Math.round(beeld.b * k) + 2;
  const v = { b, h: h + 2, rgba: Buffer.alloc(b * (h + 2) * 4) };
  for (let i = 0; i < v.b * v.h; i++) v.rgba.set([92, 96, 90, 255], i * 4);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) {
    const s = (y * r.b + x) * 4, dx = Math.round(b / 2) - r.anker[0] + x, dy = h + 1 - r.anker[1] + y;
    if (r.rgba[s + 3] >= 128 && dx >= 0 && dy >= 0 && dx < v.b && dy < v.h) r.rgba.copy(v.rgba, (dy * v.b + dx) * 4, s, s + 4);
  }
  return v;
}

// De kleur dichter bij de generator (Marcel: "Dan moeten we de kleuren iets dichterbij brengen"): per stof (staal en maliën,
// het geel, het blauw, de rest) de kleur van het staande beeld van de generator in die richting, zoals generator.cjs zijn
// eigen vellen gelijktrekt (kleurGelijk). Die kent de achtergrond als magenta, dus het doorzichtige even magenta.
const STOFFEN = G.FIGUREN.speerman.stoffen;
function alsMagenta(beeld) {
  const b = { ...beeld, rgba: Buffer.from(beeld.rgba) };
  for (let i = 0; i < b.b * b.h; i++) if (b.rgba[i * 4 + 3] < 128) b.rgba.set([255, 0, 255, 255], i * 4);
  return b;
}
function opSpelmaat(beeld, k, voorbeeld) {
  const pix = [];
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) pix.push(p);
  const klein = G.verkleind(beeld, pix, [beeld.b / 2, 1860], k);
  if (voorbeeld) {
    const m = alsMagenta(klein);
    G.kleurGelijk(m, voorbeeld, STOFFEN);
    for (let i = 0; i < klein.b * klein.h; i++) if (klein.rgba[i * 4 + 3] >= 128) m.rgba.copy(klein.rgba, i * 4, i * 4, i * 4 + 3);
  }
  return L.omlijn(klein);
}

function main(richtingen = ['Z', 'ZW']) {
  const lees = (n) => L.lees(path.join(RENDER, n));
  const staanZ = lees('eigen-Z-staan.png');
  const k = L.hoogte(L.uitVel('staan', 'Z', 0)) / L.hoogte(staanZ);
  const voorbeeld = (r) => G.kleurMaat(alsMagenta(L.uitVel('staan', r, 0)), STOFFEN).maat;
  const rijen = [richtingen.flatMap((r) => [E.met(groot(lees(`eigen-${r}-staan.png`), 360), `model, staan ${r}`),
    E.met(groot(lees(`eigen-${r}-lopen-2.png`), 360), `lopen ${r}`)])];
  const plaat = (b) => { const v = L.vak(b, 1); return { b: v.b, h: v.h, rgba: () => v.rgba }; };
  for (const r of richtingen) {
    rijen.push([E.met(L.vak(L.uitVel('staan', r, 0)), `generator, staan ${r}`), ...BEELDEN.map((i) => E.met(L.vak(L.uitVel('lopen', r, i)), `lopen ${i}`))]);
    const v = voorbeeld(r);
    const ons = [...Array(8).keys()].map((i) => opSpelmaat(lees(`eigen-${r}-lopen-${i}.png`), k, v));
    rijen.push([E.met(L.vak(opSpelmaat(lees(`eigen-${r}-staan.png`), k, v)), `model, staan ${r}`), ...BEELDEN.map((i) => E.met(L.vak(ons[i]), `lopen ${i}`))]);
    fs.writeFileSync(path.join(UIT, `eigen-${r}-bewegend.png`), apng(ons.map(plaat), { schaal: 4, fps: 10 }));
  }
  E.bewaar(path.join(UIT, 'eigen.png'), rijen, 'Vraag 190, proef (a): de speerman uit het 3D-model met zijn eigen kleuren',
    'Boven het model groot; daaronder per richting de generator zoals in het spel en het model, op spelmaat maal 3.');
  console.log('uit/blender/eigen.png en eigen-<r>-bewegend.png');
}

if (require.main === module) main(process.argv.slice(2).length ? process.argv.slice(2) : undefined);
