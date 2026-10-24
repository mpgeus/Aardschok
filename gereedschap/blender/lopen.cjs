// Lopen per richting, zonder mengen (vraag 190; ontwerp/beeld.md, "Per richting projecteren"), naast het lopen van de
// generator dat nu in het spel staat. De beelden komen van bakken.py (`-- <map> richting ZW`); hier op spelmaat gebracht:
// alle beelden met dezelfde maat en hetzelfde anker (de oorsprong van het model, onder het midden van de camera), van de
// zolen tot de helm even hoog als de speerman in het spel, met een donkere rand.
//
//   node gereedschap/blender/lopen.cjs [ZW]   naar uit/blender/lopen-<richting>.png (de plaat) en -bewegend.png
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const G = require('../pixelart/generator.cjs');
const E = require('../ai/etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const RENDER = path.join(__dirname, '..', 'pixelart', 'uit', 'blender', 'render');
const UIT = path.join(__dirname, '..', 'pixelart', 'uit', 'blender');
const ANKER = [600, 1860]; // de oorsprong in de HD-render (speerman_hd.py: res en anker_y)
const GRAS = [79, 104, 52];
const BESCHRIJVING = require('../../beelden/beschrijving.json').figuren.speerman;
const lees = (p) => K.leesPng(fs.readFileSync(p));

function hoogte(beeld) {
  let t = -1, o = -1;
  for (let y = 0; y < beeld.h; y++) {
    let n = 0;
    for (let x = 0; x < beeld.b; x++) if (beeld.rgba[(y * beeld.b + x) * 4 + 3] >= 128) n++;
    if (n > beeld.b * 0.1 && t < 0) t = y;
    if (n) o = y;
  }
  return o - t + 1;
}

function omlijn(b) {
  const om = Buffer.from(b.rgba);
  const dekt = (x, y) => x >= 0 && y >= 0 && x < b.b && y < b.h && b.rgba[(y * b.b + x) * 4 + 3] >= 128;
  for (let y = 0; y < b.h; y++) for (let x = 0; x < b.b; x++) {
    if (!dekt(x, y)) continue;
    const sch = !dekt(x + 1, y) || !dekt(x, y + 1), li = !dekt(x - 1, y) || !dekt(x, y - 1);
    if (!sch && !li) continue;
    const f = sch ? 0.38 : 0.55, d = (y * b.b + x) * 4;
    for (let c = 0; c < 3; c++) om[d + c] = Math.round(b.rgba[d + c] * f + [22, 14, 10][c] * (1 - f));
  }
  return { ...b, rgba: om };
}

function klein(beeld, k) {
  const pix = [];
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) pix.push(p);
  return omlijn(G.verkleind(beeld, pix, ANKER, k));
}

// een cel uit een vel van het spel
function uitVel(houding, kant, beeld) {
  const h = BESCHRIJVING.houdingen[houding];
  const vel = lees(path.join(__dirname, '..', '..', 'beelden', 'figuren', h.bestand));
  const [cb, ch] = h.cel;
  const r = BESCHRIJVING.richtingen.indexOf(kant);
  const uit = { b: cb, h: ch, rgba: Buffer.alloc(cb * ch * 4), anker: h.anker };
  for (let y = 0; y < ch; y++) vel.rgba.copy(uit.rgba, y * cb * 4, ((r * ch + y) * vel.b + beeld * cb) * 4, ((r * ch + y) * vel.b + (beeld + 1) * cb) * 4);
  return uit;
}

function vak(beeld, n = 3) {
  const V = 84, H = 108, ax = 42, ay = 100;
  const v = { b: V, h: H, rgba: Buffer.alloc(V * H * 4) };
  for (let i = 0; i < V * H; i++) v.rgba.set([...GRAS, 255], i * 4);
  for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) {
    const s = (y * beeld.b + x) * 4, dx = ax - beeld.anker[0] + x, dy = ay - beeld.anker[1] + y;
    if (beeld.rgba[s + 3] >= 128 && dx >= 0 && dy >= 0 && dx < V && dy < H) beeld.rgba.copy(v.rgba, (dy * V + dx) * 4, s, s + 4);
  }
  if (n === 1) return v;
  const g = { b: V * n, h: H * n, rgba: Buffer.alloc(V * n * H * n * 4) };
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.b; x++) v.rgba.copy(g.rgba, (y * g.b + x) * 4, (((y / n) | 0) * V + ((x / n) | 0)) * 4, (((y / n) | 0) * V + ((x / n) | 0)) * 4 + 4);
  return g;
}

function main(r = 'ZW') {
  const staan = lees(path.join(RENDER, `richting-${r}-staan.png`));
  const k = hoogte(uitVel('staan', r, 0)) / hoogte(staan);
  const n = BESCHRIJVING.houdingen.lopen.beelden;
  const ons = [...Array(8).keys()].map((i) => klein(lees(path.join(RENDER, `richting-${r}-lopen-${i}.png`)), k));
  const gen = [...Array(n).keys()].map((i) => uitVel('lopen', r, i));
  const rijen = [
    [E.met(vak(uitVel('staan', r, 0)), `generator · staan ${r}`), ...gen.map((b, i) => E.met(vak(b), `lopen ${i}`))],
    [E.met(vak(klein(staan, k)), `Blender + verf ${r} · staan`), ...ons.map((b, i) => E.met(vak(b), `lopen ${i}`))],
  ];
  E.bewaar(path.join(UIT, `lopen-${r}.png`), rijen, `Vraag 190: lopen ${r}, per richting geprojecteerd (zonder mengen)`,
    `Boven de generator zoals in het spel, onder het Blender-model met alleen de verf van vel 01 ${r}; op spelmaat maal 3.`);
  const plaat = (b) => { const v = vak(b, 1); return { b: v.b, h: v.h, rgba: () => v.rgba }; };
  fs.writeFileSync(path.join(UIT, `lopen-${r}-bewegend.png`), apng(ons.map(plaat), { schaal: 4, fps: 10 }));
  fs.writeFileSync(path.join(UIT, `lopen-${r}-generator-bewegend.png`), apng(gen.map(plaat), { schaal: 4, fps: 10 }));
  console.log(`uit/blender/lopen-${r}.png en -bewegend.png`);
}

if (require.main === module) main(process.argv[2]);
