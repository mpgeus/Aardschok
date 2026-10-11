'use strict';
// De stijlproef (11 okt 2026; ontwerp/beeld.md, "Open"; Marcel: "Ja laat maar een proef zien"): hetzelfde stukje dorp
// twee keer, uit dezelfde modellen en in hetzelfde licht. Links zoals het spel het nu krijgt, pixel art (vaste kleuren,
// harde randen, een omlijning), twee keer vergroot zoals op 1080p. Rechts voorgerenderd, zoals Knights and Merchants en
// Anno 1602 hun beelden maakten: vier keer zo fijn gerekend en dan verkleind tot dezelfde maat, de kleuren zonder trappen
// en zonder omlijning. Vier keer zo fijn is zestien keer het gewone beeld, elk een fractie van een pixel verschoven, in
// elkaar gevlochten; zo blijft de renderer wat hij is. Alleen de grond is rechts anders gemaakt: die van het spel is
// getekend op het rooster van de pixels, dus rechts gras en aarde uit de wereld zelf, en geen graspollen.
//   node gereedschap/pixelart/stijlproef.cjs           beide, in uit/stijlproef/ (zo'n tien minuten op vier kernen)
//   node gereedschap/pixelart/stijlproef.cjs pixel     alleen de pixel art
//   node gereedschap/pixelart/stijlproef.cjs voor 2    alleen voorgerenderd, twee keer zo fijn (sneller, harde randen)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const K = require('./kern.cjs');
const D = require('./dorp.cjs');
const T = require('./toren.cjs');
const HS = require('./huis-sdf.cjs');
const X = require('./huis-sdf-export.cjs');
const BO = require('./bomen.cjs');
const { boer } = require('./dorpelingen.cjs');
const { boerin } = require('./dorpelingen2.cjs');
const { UITERLIJKEN } = require('./uiterlijk.cjs');

const UIT = path.join(__dirname, 'uit', 'stijlproef');
const ACHTERGROND = '#0e0a14';
const UITVOER = 2; // de maat van de plaat: twee keer, zoals het spel op 1080p
// de eik rechts van de gevel, in tegels; de mensen in tegels vanaf de voordeur: langs de gevel en ervan af
const BOOM = { zaad: 3, tegel: [8, -4] };
const MENSEN = [
  { model: () => boer({ houding: 'staan', fase: 0 }, UITERLIJKEN.boer[3]), plek: [0.9, 2.5], richting: 'ZW' },
  { model: () => boerin({ houding: 'staan', fase: 0 }, UITERLIJKEN.boerin[2]), plek: [-0.4, 2.9], richting: 'Z' },
];

// ---------------------------------------------------------------- de scène

// Het voorbeeldhuis van stap F (huis-sdf-export.cjs voorbeeld) met zijn stukje grond, en de plek van een punt in tegels.
function opzet() {
  const [, knoppen, vorm] = X.VOORBEELD_STAPPEN.find(([n]) => n.startsWith('F'));
  const spec = { ...X.VOORBEELD, ...vorm, knoppen };
  const delen = X.stukjeGrond(spec);
  const H = HS.maten(spec.zaad, spec);
  const deur = HS.voorDeDeur(H, 0);
  const af = HS.voorDeDeur(H, 1);
  const N = [af[0] - deur[0], af[1] - deur[1]];
  const langs = [-N[1], N[0]];
  const op = ([a, n]) => [deur[0] + langs[0] * a + N[0] * n, deur[1] + langs[1] * a + N[1] * n];
  return { delen, op };
}

// Het paneel op ware grootte: het huis met de boom en de mensen erin, en ruimte eromheen.
function maat() {
  const { delen, op } = opzet();
  const kd = HS.kaderSamen(X.samenVan(delen));
  const punten = [[kd.x0, kd.y0], [kd.x1, kd.y1]];
  const [bx, by] = BOOM.tegel;
  const sx = (bx - by) * 32;
  const sy = (bx + by) * 16;
  punten.push([sx - 110, sy - 230], [sx + 110, sy + 20]);
  for (const m of MENSEN) {
    const [gx, gy] = op(m.plek);
    punten.push([(gx - gy) * 32, (gx + gy) * 16 + 10]);
  }
  const x0 = Math.min(...punten.map((p) => p[0])) - 40;
  const x1 = Math.max(...punten.map((p) => p[0])) + 40;
  const y0 = Math.min(...punten.map((p) => p[1])) - 30;
  const y1 = Math.max(...punten.map((p) => p[1])) + 50;
  return { b: Math.ceil(x1 - x0), h: Math.ceil(y1 - y0), OX: Math.round(-x0), OY: Math.round(-y0) };
}

// De grond voor het voorgerenderde beeld: dezelfde kaart (gras, pad), maar uit de wereld in plaats van uit het rooster
// van de pixels. Grote vlekken lichter en donkerder, droge plekken, en sprieten van een halve pixel breed.
const { RAMP, VLAG, UIT: TEX, TEGEL, ruis2, hash, klem } = K;
function grondVoor(kaart) {
  const gewoon = D.grondTex(kaart, { dor: true });
  const SQ = Math.SQRT1_2 * UITVOER;
  return (vlak, Xw, Yw, Zw, px, py, d) => {
    gewoon(vlak, Xw, Yw, Zw, px, py, d);
    if (vlak !== 'z' || (TEX.ramp !== RAMP.mos && TEX.ramp !== RAMP.riet && TEX.ramp !== RAMP.aarde)) return;
    const gx = Xw / TEGEL;
    const gy = Yw / TEGEL;
    const droog = ruis2(gx * 0.85 + 11, gy * 0.85, 58) * 0.7 + ruis2(gx * 2.6, gy * 2.6, 59) * 0.3;
    const vlek = ruis2(gx * 0.3 + 31, gy * 0.3, 61);
    const klont = ruis2(gx * 3.1, gy * 3.1, 62);
    // een spriet: een kolom van een halve pixel, drie hoog, verspringend per kolom
    const kol = Math.floor((Xw - Yw) * SQ);
    const rij = Math.floor(((Xw + Yw) * 0.5 * SQ + (hash(kol, 0, 63) % 3)) / 3);
    const spriet = ((hash(kol, rij, 64) % 1000) / 1000 - 0.5) * 1.4;
    const korrel = ((hash(Math.floor(Xw * 3), Math.floor(Yw * 3), 65) % 1000) / 1000 - 0.5) * 1.0;
    let s = 2.6 + (vlek - 0.5) * 2.4 + (klont - 0.5) * 1.2 + spriet;
    if (droog > 0.82) TEX.ramp = RAMP.riet;
    else if (droog < 0.16) TEX.ramp = RAMP.aarde;
    else TEX.ramp = RAMP.mos;
    if (TEX.ramp === RAMP.aarde) s = 3 + (klont - 0.5) * 1.6 + korrel;
    // tekenDozen rondt af: met de korrel erbij wordt dat ruis die het verkleinen weer glad maakt
    TEX.stap = klem(s + korrel * 0.6, 0, 6.4);
  };
}

function scene(B, voor) {
  const { delen, op } = opzet();
  const W = X.samenVan(delen);
  let kaart;
  if (voor) {
    kaart = D.grondKaart({ zaad: 5 });
    K.tekenDozen(B, [K.doos(-40, -40, 44, 44, -16, 0, grondVoor(kaart))]);
  } else kaart = X.grond(B);
  const R = T.tekenWereld(B, W);
  B.lichten.push(...W.lichten);
  D.zetModel(B, BO.eik(BOOM.zaad), ...BOOM.tegel, 'Z');
  for (const m of MENSEN) {
    const [gx, gy] = op(m.plek);
    D.zetModel(B, m.model(), gx, gy, m.richting);
  }
  if (!voor) D.grasPollen(B, kaart, { dicht: 0.8 });
  X.grondZon(B, R, { kracht: 2.6 });
  K.belicht(B, { omgeving: () => 0.2 });
  D.avondlicht(B, { warm: X.WARM });
  K.verwarm(B, 1.8);
}

// ---------------------------------------------------------------- van stap naar kleur

const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const srgb = (c) => Math.round(255 * klem(c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055, 0, 1));
const RAMP_LIN = Object.keys(K.RAMPEN).map((n) => K.RAMPEN[n].map((h) => [1, 3, 5].map((i) => lin(parseInt(h.slice(i, i + 2), 16)))));

// Elke pixel zijn kleur zonder trappen: tussen twee tinten van zijn ramp in, naar de stap die het licht gaf. Geeft het
// licht als getallen (lineair, met dekking), om goed te kunnen verkleinen.
function kleurenVoor(B) {
  const uit = new Float32Array(B.b * B.h * 4);
  for (let i = 0; i < B.b * B.h; i++) {
    const r = B.ramp[i];
    if (r < 0) continue;
    const rij = RAMP_LIN[r];
    const s = klem(B.stap[i], 0, rij.length - 1);
    const a = Math.floor(s);
    const t = s - a;
    const c0 = rij[a];
    const c1 = rij[Math.min(a + 1, rij.length - 1)];
    for (let k = 0; k < 3; k++) uit[i * 4 + k] = c0[k] + (c1[k] - c0[k]) * t;
    uit[i * 4 + 3] = 1;
  }
  return uit;
}

// k bij k pixels samen tot één, en terug naar sRGB.
function verklein(licht, b, h, k) {
  const nb = Math.floor(b / k);
  const nh = Math.floor(h / k);
  const rgba = Buffer.alloc(nb * nh * 4);
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nb; x++) {
      let r = 0;
      let g = 0;
      let bl = 0;
      let a = 0;
      for (let j = 0; j < k; j++) {
        for (let i = 0; i < k; i++) {
          const q = ((y * k + j) * b + x * k + i) * 4;
          r += licht[q];
          g += licht[q + 1];
          bl += licht[q + 2];
          a += licht[q + 3];
        }
      }
      const o = (y * nb + x) * 4;
      if (a > 0) {
        rgba[o] = srgb(r / a);
        rgba[o + 1] = srgb(g / a);
        rgba[o + 2] = srgb(bl / a);
      }
      rgba[o + 3] = Math.round((255 * a) / (k * k));
    }
  }
  return { b: nb, h: nh, rgba };
}

// ---------------------------------------------------------------- de werkers

if (!isMainThread) {
  const t0 = Date.now();
  const L = workerData.maat;
  let uit;
  if (workerData.taak === 'pixel') {
    const B = new K.Beeld(L.b, L.h, L.OX, L.OY);
    scene(B, false);
    K.omlijn(B);
    const p = K.Plaat.van(K.kwantiseer(B));
    uit = { b: p.b, h: p.h, rgba: p.rgba(ACHTERGROND) };
  } else {
    // het gewone beeld, (i + ½) / S en (j + ½) / S van een pixel verschoven: elke pixel kijkt naar dat punt erin
    const { S, i, j } = workerData;
    const B = new K.Beeld(L.b, L.h, L.OX + 0.5 - (i + 0.5) / S, L.OY + 0.5 - (j + 0.5) / S);
    scene(B, true);
    uit = { b: B.b, h: B.h, licht: kleurenVoor(B) };
  }
  parentPort.postMessage({ ...uit, ms: Date.now() - t0 });
}

function rekenAlles(taken, draden) {
  return new Promise((klaar, fout) => {
    const uit = new Array(taken.length);
    let volgende = 0;
    let gedaan = 0;
    const start = (n) => {
      if (n >= taken.length) return;
      const w = new Worker(__filename, { workerData: taken[n] });
      w.on('error', fout);
      w.on('message', (m) => {
        // wat een werker stuurt, komt aan als Uint8Array; png wil een Buffer
        uit[n] = m.rgba ? { ...m, rgba: Buffer.from(m.rgba.buffer, m.rgba.byteOffset, m.rgba.byteLength) } : m;
        console.log(`${taken[n].naam}`.padEnd(28), `${(m.ms / 1000).toFixed(1)} s`);
        w.terminate();
        if (++gedaan === taken.length) klaar(uit);
        else start(volgende++);
      });
    };
    for (let n = 0; n < Math.min(draden, taken.length); n++) start(volgende++);
  });
}

// ---------------------------------------------------------------- de plaat

const leeg = (b, h, kleur = ACHTERGROND) => {
  const rgba = Buffer.alloc(b * h * 4);
  const c = [1, 3, 5].map((i) => parseInt(kleur.slice(i, i + 2), 16));
  for (let i = 0; i < b * h; i++) rgba.set([...c, 255], i * 4);
  return { b, h, rgba };
};
function plak(doel, bron, x, y, s = 1) {
  for (let j = 0; j < bron.h * s; j++) {
    for (let i = 0; i < bron.b * s; i++) {
      const q = (Math.floor(j / s) * bron.b + Math.floor(i / s)) * 4;
      const a = bron.rgba[q + 3] / 255;
      if (a === 0) continue;
      const tx = x + i;
      const ty = y + j;
      if (tx < 0 || ty < 0 || tx >= doel.b || ty >= doel.h) continue;
      const o = (ty * doel.b + tx) * 4;
      for (let k = 0; k < 3; k++) doel.rgba[o + k] = Math.round(bron.rgba[q + k] * a + doel.rgba[o + k] * (1 - a));
    }
  }
}
function snede(bron, x, y, b, h) {
  const uit = leeg(b, h);
  plak(uit, bron, -x, -y);
  return uit;
}
function opschrift(tekst, b) {
  const p = new K.Plaat(b, 30);
  X.schrijf(p, tekst, 8, 8, 2);
  return { b, h: 30, rgba: p.rgba(ACHTERGROND) };
}
// twee beelden naast elkaar, elk met een opschrift erboven
function naast(links, rechts, tl, tr) {
  const b = links.b + rechts.b + 12;
  const h = Math.max(links.h, rechts.h) + 30;
  const plaat = leeg(b, h);
  plak(plaat, opschrift(tl, links.b), 0, 0);
  plak(plaat, opschrift(tr, rechts.b), links.b + 12, 0);
  plak(plaat, links, 0, 30);
  plak(plaat, rechts, links.b + 12, 30);
  return plaat;
}

async function main() {
  const t0 = Date.now();
  const wat = process.argv[2] || 'beide';
  const S = Number(process.argv[3]) || 4;
  fs.mkdirSync(UIT, { recursive: true });
  const L = maat();
  console.log(`paneel ${L.b}×${L.h}, voorgerenderd ${S} keer zo fijn`);
  const taken = [];
  if (wat !== 'voor') taken.push({ taak: 'pixel', naam: 'pixel art', maat: L });
  if (wat !== 'pixel') {
    for (let j = 0; j < S; j++) {
      for (let i = 0; i < S; i++) taken.push({ taak: 'voor', naam: `voorgerenderd ${j * S + i + 1}/${S * S}`, maat: L, S, i, j });
    }
  }
  const uit = await rekenAlles(taken, os.cpus().length);
  let pixel = null;
  let voor = null;
  if (wat !== 'voor') {
    pixel = uit.shift();
    fs.writeFileSync(path.join(UIT, 'pixel-1x.png'), K.pngVanBeeld(pixel));
    const groot = leeg(pixel.b * UITVOER, pixel.h * UITVOER);
    plak(groot, pixel, 0, 0, UITVOER);
    pixel = groot;
    fs.writeFileSync(path.join(UIT, 'pixel.png'), K.pngVanBeeld(pixel));
  }
  if (wat !== 'pixel') {
    // de S × S beelden in elkaar gevlochten tot één S keer zo fijn, en dat verkleind tot de maat van de plaat
    const fb = L.b * S;
    const fijn = new Float32Array(fb * L.h * S * 4);
    for (const { i, j } of taken.filter((t) => t.taak === 'voor')) {
      const { licht } = uit.shift();
      for (let y = 0; y < L.h; y++) {
        for (let x = 0; x < L.b; x++) {
          const q = (y * L.b + x) * 4;
          fijn.set(licht.subarray(q, q + 4), ((y * S + j) * fb + x * S + i) * 4);
        }
      }
    }
    const v = verklein(fijn, fb, L.h * S, S / UITVOER);
    voor = leeg(v.b, v.h);
    plak(voor, v, 0, 0);
    fs.writeFileSync(path.join(UIT, 'voorgerenderd.png'), K.pngVanBeeld(voor));
  }
  if (pixel && voor) {
    fs.writeFileSync(path.join(UIT, 'naast.png'), K.pngVanBeeld(naast(pixel, voor, 'pixel art, zoals nu', 'voorgerenderd')));
    // de deur met de mensen, nog twee keer vergroot
    const { op } = opzet();
    const [gx, gy] = op([0.2, 1.6]);
    const cx = (L.OX + (gx - gy) * 32) * UITVOER;
    const cy = (L.OY + (gx + gy) * 16) * UITVOER;
    const [b, h] = [440, 360];
    const vak = (bron) => {
      const s = snede(bron, Math.round(cx - b / 2), Math.round(cy - h * 0.62), b, h);
      const g = leeg(b * 2, h * 2);
      plak(g, s, 0, 0, 2);
      return g;
    };
    fs.writeFileSync(path.join(UIT, 'deur.png'), K.pngVanBeeld(naast(vak(pixel), vak(voor), 'pixel art, zoals nu', 'voorgerenderd')));
  }
  console.log(`klaar in ${((Date.now() - t0) / 1000).toFixed(0)} s: ${UIT}`);
}

if (isMainThread && require.main === module) main();
