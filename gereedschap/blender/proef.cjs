// De proefplaat van vraag 190 (ontwerp/beeld.md, "Blender als basis?"): de speerman uit Blender (speerman.py) op
// spelmaat, naast de speerman van de generator en de soldaat uit onze eigen renderer zoals ze nu in het spel staan.
// Het verkleinen is dat van de generator (generator.cjs, `verkleind`: gemiddeld per blok, dan scherp), op dezelfde maat:
// van de top van de helm tot de zolen even hoog als de speerman van de generator. Daarna een donkere rand om het
// silhouet. Eerst de renders maken:
//   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --factory-startup -P gereedschap/blender/speerman.py
//   node gereedschap/blender/proef.cjs        naar gereedschap/pixelart/uit/blender/ (proef.png en het lopen bewegend)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const G = require('../pixelart/generator.cjs');
const E = require('../ai/etiket.cjs');
const { apng } = require('../pixelart/apng.cjs');

const UIT = path.join(__dirname, '..', 'pixelart', 'uit', 'blender');
const RENDER = path.join(UIT, 'render');
const FIGUREN = path.join(__dirname, '..', '..', 'beelden', 'figuren');
const BESCHRIJVING = require('../../beelden/beschrijving.json').figuren;
const KANTEN = K.KANTEN;
const GROND = [79, 104, 52]; // ongeveer het gras van het spel, om op te beoordelen
const VAK = { b: 76, h: 112, ax: 38, ay: 100 }; // een vakje op spelmaat, met het anker
const SCHAAL = 3;

const lees = (p) => K.leesPng(fs.readFileSync(p));

// Een cel uit een vel van het spel (rij per richting, kolom per beeld), met zijn anker.
function uitVel(naam, houding, kant, beeld = 0) {
  const h = BESCHRIJVING[naam].houdingen[houding];
  const vel = lees(path.join(FIGUREN, h.bestand));
  const [cb, ch] = h.cel;
  const r = BESCHRIJVING[naam].richtingen.indexOf(kant);
  const uit = { b: cb, h: ch, rgba: Buffer.alloc(cb * ch * 4), anker: h.anker };
  for (let y = 0; y < ch; y++) vel.rgba.copy(uit.rgba, y * cb * 4, ((r * ch + y) * vel.b + beeld * cb) * 4, ((r * ch + y) * vel.b + (beeld + 1) * cb) * 4);
  return uit;
}

// Van de zolen tot de top van de helm: de onderste dekkende rij, en de bovenste rij die breder is dan de speer.
function hoogte(beeld, breder) {
  let top = -1, onder = -1;
  for (let y = 0; y < beeld.h; y++) {
    let n = 0;
    for (let x = 0; x < beeld.b; x++) if (beeld.rgba[(y * beeld.b + x) * 4 + 3] >= 128) n++;
    if (n > breder && top < 0) top = y;
    if (n) onder = y;
  }
  return onder - top + 1;
}

// Bij een render weten we waar de top van de helm valt (maat.json); het speerblad is daar breder dan de helm smal is.
function hoogteRender(beeld, maat) {
  let onder = -1;
  for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) if (beeld.rgba[(y * beeld.b + x) * 4 + 3] >= 128) onder = y;
  return onder - Math.round(maat.helm[1]) + 1;
}

// Een donkere rand om het silhouet: elke dekkende pixel naast een doorzichtige wordt donkerder, aan de schaduwkant meer.
function omlijn(beeld) {
  const { b, h, rgba } = beeld;
  const dekt = (x, y) => x >= 0 && y >= 0 && x < b && y < h && rgba[(y * b + x) * 4 + 3] >= 128;
  const uit = Buffer.from(rgba);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    if (!dekt(x, y)) continue;
    const licht = !dekt(x - 1, y) || !dekt(x, y - 1);
    const schaduw = !dekt(x + 1, y) || !dekt(x, y + 1);
    if (!licht && !schaduw) continue;
    const f = schaduw ? 0.38 : 0.55;
    const o = (y * b + x) * 4;
    uit[o] = Math.round(rgba[o] * f + 22 * (1 - f));
    uit[o + 1] = Math.round(rgba[o + 1] * f + 14 * (1 - f));
    uit[o + 2] = Math.round(rgba[o + 2] * f + 10 * (1 - f));
  }
  return { ...beeld, rgba: uit };
}

// Een render van Blender op spelmaat.
function verklein(bestand, anker, k) {
  const beeld = lees(path.join(RENDER, bestand));
  const pixels = [];
  for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) pixels.push(p);
  return omlijn(G.verkleind(beeld, pixels, anker, k));
}

// Een vakje: de grond, en het beeld met zijn anker op het anker van het vakje; dan vergroot.
function vakje(beeld) {
  const v = { b: VAK.b, h: VAK.h, rgba: Buffer.alloc(VAK.b * VAK.h * 4) };
  for (let i = 0; i < VAK.b * VAK.h; i++) v.rgba.set([...GROND, 255], i * 4);
  const ox = VAK.ax - beeld.anker[0], oy = VAK.ay - beeld.anker[1];
  for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) {
    const s = (y * beeld.b + x) * 4;
    const dx = ox + x, dy = oy + y;
    if (beeld.rgba[s + 3] < 128 || dx < 0 || dy < 0 || dx >= VAK.b || dy >= VAK.h) continue;
    beeld.rgba.copy(v.rgba, (dy * VAK.b + dx) * 4, s, s + 4);
  }
  return v;
}

function groot(v, n = SCHAAL) {
  const uit = { b: v.b * n, h: v.h * n, rgba: Buffer.alloc(v.b * n * v.h * n * 4) };
  for (let y = 0; y < uit.h; y++) for (let x = 0; x < uit.b; x++) v.rgba.copy(uit.rgba, (y * uit.b + x) * 4, (((y / n) | 0) * v.b + ((x / n) | 0)) * 4, (((y / n) | 0) * v.b + ((x / n) | 0)) * 4 + 4);
  return uit;
}

// Alleen staan naar Z, naast de bron (Marcel, 24 okt: "laten we de focus houden op het basisbeeld, waarin hij staat Z.
// kijken of we die gelijk kunnen krijgen aan de referentie"): boven groot (de bron verkleind tot de maat van de render),
// onder op spelmaat maal vier. Naar uit/blender/z.png.
function zuid() {
  const maat = JSON.parse(fs.readFileSync(path.join(RENDER, 'maat.json'), 'utf8'));
  // de renders: geschilderd (EEVEE, het licht in banden) en, als hij er is, Cycles
  const renders = [['Blender, geschilderd', 'staan-Z.png'], ['Blender, Cycles', 'staan-Z-echt.png']]
    .filter(([, f]) => fs.existsSync(path.join(RENDER, f))).map(([naam, f]) => ({ naam, beeld: lees(path.join(RENDER, f)) }));
  const hRender = hoogteRender(renders[0].beeld, maat);
  // de bron: het eerste poppetje van het vel van de generator (staan, acht richtingen), het magenta eruit
  const vel = lees(path.join(__dirname, '..', 'pixelart', 'uit', 'generator', 'bron', 'speerman-staan.png'));
  const fg = G.voorgrond(vel);
  const b8 = Math.floor(vel.b / 8);
  const bron = { b: b8, h: vel.h, rgba: Buffer.alloc(b8 * vel.h * 4) };
  for (let y = 0; y < vel.h; y++) for (let x = 0; x < b8; x++) {
    if (!fg[y * vel.b + x]) continue;
    vel.rgba.copy(bron.rgba, (y * b8 + x) * 4, (y * vel.b + x) * 4, (y * vel.b + x) * 4 + 3);
    bron.rgba[(y * b8 + x) * 4 + 3] = 255;
  }
  const hBron = hoogte(bron, 60);
  let onder = 0, links = 1e9, rechts = 0;
  for (let p = 0; p < b8 * vel.h; p++) if (bron.rgba[p * 4 + 3]) { onder = Math.max(onder, (p / b8) | 0); links = Math.min(links, p % b8); rechts = Math.max(rechts, p % b8); }
  const dekkend = (beeld) => { const l = []; for (let p = 0; p < beeld.b * beeld.h; p++) if (beeld.rgba[p * 4 + 3] >= 128) l.push(p); return l; };
  // groot: allebei naar de kleinste van de twee hoogtes (verkleind kan alleen kleiner), de voeten op dezelfde lijn
  const H = Math.min(hRender, hBron);
  const k = H / hBron;
  const groteBron = G.verkleind(bron, dekkend(bron), [(links + rechts) / 2, onder], k);
  const kSpel = hoogte(uitVel('speerman', 'staan', 'Z'), 5) / hRender;
  const zet = (beeld, b, h, ax, ay, grond) => {
    const v = { b, h, rgba: Buffer.alloc(b * h * 4) };
    for (let i = 0; i < b * h; i++) v.rgba.set([...grond, 255], i * 4);
    for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) {
      const s = (y * beeld.b + x) * 4, dx = ax - beeld.anker[0] + x, dy = ay - beeld.anker[1] + y;
      if (beeld.rgba[s + 3] >= 128 && dx >= 0 && dy >= 0 && dx < b && dy < h) beeld.rgba.copy(v.rgba, (dy * b + dx) * 4, s, s + 4);
    }
    return v;
  };
  const GB = 300, GH = 520, grijs = [92, 96, 90];
  const groot1 = (beeld, naam) => E.met(zet(beeld, GB, GH, GB / 2, GH - 20, grijs), naam);
  const spel = (beeld, naam) => E.met(groot(zet(beeld, 75, 130, 37, 120, GROND), 4), naam);
  const rijen = [
    [groot1(groteBron, 'Generator (bron)'), ...renders.map((r) => groot1(G.verkleind(r.beeld, dekkend(r.beeld), maat.anker, H / hRender), r.naam))],
    [spel(uitVel('speerman', 'staan', 'Z'), 'Generator, in het spel'), ...renders.map((r) => spel(omlijn(G.verkleind(r.beeld, dekkend(r.beeld), maat.anker, kSpel)), r.naam.replace('Blender, ', 'op spelmaat, ')))],
  ];
  E.bewaar(path.join(UIT, 'z.png'), rijen, 'Vraag 190: staan naar Z, Blender naast de generator', `Boven even hoog (de bron maal ${k.toFixed(3)}), onder op spelmaat maal 4.`);
  console.log('uit/blender/z.png');
}

function main() {
  if (process.argv[2] === 'z') return zuid();
  const maat = JSON.parse(fs.readFileSync(path.join(RENDER, 'maat.json'), 'utf8'));
  const doel = hoogte(uitVel('speerman', 'staan', 'Z'), 5);
  const bron = hoogteRender(lees(path.join(RENDER, 'staan-Z.png')), maat);
  const k = doel / bron;
  console.log(`speerman van de generator: ${doel} pixels van de zolen tot de helm; Blender ${bron} in de render, dus maal ${k.toFixed(4)}`);

  const blender = KANTEN.map((kant) => verklein(`staan-${kant}.png`, maat.anker, k));
  const lopen = [...Array(8).keys()].filter((i) => fs.existsSync(path.join(RENDER, `lopen-ZW-${i}.png`)))
    .map((i) => verklein(`lopen-ZW-${i}.png`, maat.anker, k));
  const gen = KANTEN.map((kant) => uitVel('speerman', 'staan', kant));
  const genLopen = [...Array(8).keys()].map((i) => uitVel('speerman', 'lopen', 'ZW', i));
  const eigen = KANTEN.map((kant) => uitVel('soldaat', 'staan', kant));

  const rij = (beelden, wat) => beelden.map((b, i) => E.met(groot(vakje(b)), i ? KANTEN[i] : `${wat} · ${KANTEN[i]}`));
  const loopRij = (beelden, wat) => beelden.map((b, i) => E.met(groot(vakje(b)), i ? `${i}` : `${wat} · lopen ZW · 0`));
  const rijen = [rij(blender, 'Blender'), rij(gen, 'Generator'), rij(eigen, 'Eigen renderer (soldaat)')];
  if (lopen.length) rijen.push(loopRij(lopen, 'Blender'));
  rijen.push(loopRij(genLopen, 'Generator'));
  fs.mkdirSync(UIT, { recursive: true });
  E.bewaar(path.join(UIT, 'proef.png'), rijen, 'Vraag 190: de speerman uit Blender, op spelmaat (maal 3)',
    `Blender: model en skelet door Claude, Cycles, verkleind zoals de generator (maal ${k.toFixed(3)}) met een donkere rand. Generator en soldaat: zoals nu in het spel.`);
  if (lopen.length) {
    const plaat = (b) => { const v = vakje(b); return { b: v.b, h: v.h, rgba: () => v.rgba }; };
    fs.writeFileSync(path.join(UIT, 'lopen-blender.png'), apng(lopen.map(plaat), { schaal: SCHAAL, fps: 10 }));
    fs.writeFileSync(path.join(UIT, 'lopen-generator.png'), apng(genLopen.map(plaat), { schaal: SCHAAL, fps: 10 }));
  }
  console.log('uit/blender/proef.png');
}

main();
