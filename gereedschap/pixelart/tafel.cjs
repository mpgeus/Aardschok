// De tafel van de schout (ontwerp/werklijst.md, vraag 146, c; Marcel, 9 okt: "Ja dit ziet er goed uit voor nu!", op de
// plaat "De schrijftafel van de schout"): het hout van de tafel onderin, en de dingen erop, die elk een venster openen.
// Pixel art uit code, op ware pixels: een pixel van de kunst is een pixel van het scherm op 1080 (js/tafel.js zet hem op
// 4K op twee). Elke tekening is op twee keer de maat van zijn schets getekend (S), met licht van linksboven, een lichte
// rand boven, een donkere rand onder, korrel, en een omlijning in een donkere tint van wat ernaast ligt, zoals de kunst
// van het spel. De schetsen zijn die van de plaat (TEKENING daar), in eenheden van een halve pixel.
//
//   beelden/tafel/hout.png       2048×150, eiken planken, links en rechts naadloos (de tafel herhaalt hem)
//   beelden/tafel/<ding>.png     elk ding: bouwen, velden, wetten, raadsman, brief, rapport, zaak, bode, zandloper,
//                                gunst, vertrouwen, en lantaarn-aan/-uit en kaars-aan/-uit
//
//   node gereedschap/pixelart/tafel.cjs                          (de proefplaat: uit/tafel-proef.png)
//   node gereedschap/pixelart/naar-spel.cjs --alleen tafel       (naar beelden/tafel/)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');

const S = 2; // twee keer het detail van de schets

// '#rrggbb' of 'rgba(r,g,b,a)' als [r, g, b, a], a van 0 tot 1.
function kleur(k) {
  if (k[0] === '#') return [parseInt(k.slice(1, 3), 16), parseInt(k.slice(3, 5), 16), parseInt(k.slice(5, 7), 16), 1];
  const [r, g, b, a] = k.replace(/rgba?\(|\)/g, '').split(',').map(Number);
  return [r, g, b, a === undefined ? 1 : a];
}

// Een beeld van b×h pixels, rij na rij RGBA (0 tot 255), en een pixel erover leggen zoals een doek dat doet (source-over).
function nieuwBeeld(b, h) {
  return { b, h, rgba: new Uint8ClampedArray(b * h * 4) };
}
function leg(B, x, y, [r, g, bl, a]) {
  if (x < 0 || y < 0 || x >= B.b || y >= B.h || a <= 0) return;
  const i = (y * B.b + x) * 4;
  const d = B.rgba;
  const da = d[i + 3] / 255;
  const ua = a + da * (1 - a);
  d[i] = (r * a + d[i] * da * (1 - a)) / ua;
  d[i + 1] = (g * a + d[i + 1] * da * (1 - a)) / ua;
  d[i + 2] = (bl * a + d[i + 2] * da * (1 - a)) / ua;
  d[i + 3] = ua * 255;
}

// ---------------------------------------------------------------- een ding

// Het tekenbord van de plaat: een schets van b×h halve pixels, getekend met vlakken (r), ovalen (e), veelhoeken (v) en
// lijnen (l), en dan belicht en omlijnd.
function bord(b, h, teken, zaad = 7) {
  const W = b * S;
  const H = h * S;
  const B = nieuwBeeld(W, H);
  const P = {
    r(x, y, w, hh, k) {
      const c = kleur(k);
      const x0 = Math.round(x * S);
      const y0 = Math.round(y * S);
      const x1 = x0 + Math.round(w * S);
      const y1 = y0 + Math.round(hh * S);
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) leg(B, xx, yy, c);
    },
    e(cx, cy, rx, ry, k) {
      const c = kleur(k);
      cx *= S; cy *= S; rx *= S; ry *= S;
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) {
        for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
          const dx = (x + 0.5 - cx) / rx;
          const dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) leg(B, x, y, c);
        }
      }
    },
    v(pts, k) {
      const c = kleur(k);
      pts = pts.map(([x, y]) => [x * S, y * S]);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) {
        for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) {
          const px = x + 0.5;
          const py = y + 0.5;
          let binnen = false;
          for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            const [xi, yi] = pts[i];
            const [xj, yj] = pts[j];
            if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) binnen = !binnen;
          }
          if (binnen) leg(B, x, y, c);
        }
      }
    },
    l(x0, y0, x1, y1, k) {
      const c = kleur(k);
      x0 = Math.round(x0 * S); y0 = Math.round(y0 * S); x1 = Math.round(x1 * S); y1 = Math.round(y1 * S);
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let f = dx + dy;
      for (;;) {
        leg(B, x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const f2 = 2 * f;
        if (f2 >= dy) { f += dy; x0 += sx; }
        if (f2 <= dx) { f += dx; y0 += sy; }
      }
    },
  };
  teken(P);
  const d = B.rgba;
  const bron = new Uint8ClampedArray(d);
  const a = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : bron[(y * W + x) * 4 + 3]);
  let z = zaad * 7919 + 13;
  const lot = () => (z = (z * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  // licht en korrel, in stapjes, zodat het pixel art blijft
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!a(x, y)) continue;
      let f = 1 + 0.16 * (0.5 - (x / W) * 0.55 - (y / H) * 0.45);
      if (!a(x - 1, y) || !a(x, y - 1)) f += 0.13;
      if (!a(x + 1, y) || !a(x, y + 1)) f -= 0.18;
      else if (!a(x + 2, y) || !a(x, y + 2)) f -= 0.07;
      f += (lot() - 0.5) * 0.07;
      f = Math.round(f / 0.035) * 0.035;
      const i = (y * W + x) * 4;
      d[i] = bron[i] * f;
      d[i + 1] = bron[i + 1] * f;
      d[i + 2] = bron[i + 2] * f;
    }
  }
  // omlijning buitenom, in een donkere tint van wat ernaast ligt
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (a(x, y)) continue;
      let r = 0;
      let gr = 0;
      let bl = 0;
      let n = 0;
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        if (!a(x + dx, y + dy)) continue;
        const j = ((y + dy) * W + x + dx) * 4;
        r += bron[j]; gr += bron[j + 1]; bl += bron[j + 2]; n++;
      }
      if (!n) continue;
      const i = (y * W + x) * 4;
      d[i] = (r / n) * 0.32 + 10;
      d[i + 1] = (gr / n) * 0.3 + 6;
      d[i + 2] = (bl / n) * 0.28 + 3;
      d[i + 3] = 255;
    }
  }
  return B;
}

// De kleuren van de dingen.
const KL = {
  perk: '#e8d6a8', perkL: '#f4e6c0', perkS: '#cdb47e', perkD: '#a88a58',
  inkt: '#4a2e1a', inktF: '#8a6a48',
  hout: '#7a4c28', houtL: '#9a6636', houtD: '#4e2e16',
  leer: '#7a2a20', leerD: '#561a14', leerL: '#94382a',
  goud: '#e2b64a', goudD: '#a87a26', goudL: '#f6dc8a',
  mes: '#c99a3a', mesD: '#8e6a22', mesL: '#ecc868',
  ijzer: '#4a4440', ijzerD: '#2e2a28', ijzerL: '#6e6660',
  was: '#a3302a', wasD: '#6e1c18', wasL: '#c8503e',
  groen: '#6e8a38', groenD: '#4e6a2a', geel: '#cfa848', bruin: '#8a6038',
  kaars: '#efe2c0', kaarsS: '#cbb88e', vlam: '#ffcf5a', vlamI: '#fff4c0',
  glas: 'rgba(196,214,220,.55)', zand: '#d8b46a', zandD: '#b08a46',
  hoed: '#5a6a30', hoedD: '#3a4a1c', hoedL: '#7a8c44',
};

// De lantaarn en de kaars, aan of uit.
function lantaarn(aan) {
  return bord(26, 38, (P) => {
    P.r(11, 1, 4, 1, KL.ijzer); P.r(10, 2, 1, 2, KL.ijzer); P.r(15, 2, 1, 2, KL.ijzer);
    P.v([[5, 9], [21, 9], [16, 4], [10, 4]], KL.ijzer); P.r(10, 4, 6, 1, KL.ijzerL);
    P.r(5, 9, 16, 21, KL.ijzerD);
    P.r(7, 11, 12, 17, aan ? '#ffd36a' : '#5a5650');
    if (aan) { P.r(8, 12, 10, 15, '#ffe08e'); P.e(13, 20, 2.2, 3.6, KL.vlam); P.e(13, 21, 1.1, 2, KL.vlamI); }
    P.r(12, 11, 2, 17, KL.ijzerD);
    P.r(4, 29, 18, 3, KL.ijzer); P.r(6, 32, 14, 2, KL.ijzerD); P.r(4, 29, 18, 1, KL.ijzerL);
  });
}
function kaars(aan) {
  return bord(20, 36, (P) => {
    P.e(10, 31.5, 8.5, 2.6, KL.mesD); P.e(10, 30.5, 8, 2.2, KL.mes); P.r(4, 30, 4, 1, KL.mesL);
    P.r(7, 11, 7, 19, KL.kaars); P.r(12, 11, 2, 19, KL.kaarsS); P.r(7, 13, 1, 5, '#fff6dc');
    P.r(7, 11, 7, 1, '#fff6dc');
    P.r(10, 8, 1, 3, '#2a1a10');
    if (aan) { P.e(10.5, 5, 2.2, 3.8, KL.vlam); P.e(10.5, 6, 1.1, 2, KL.vlamI); }
  });
}

// Elk ding, naar de plaat. De naam is die van het bestand, en die van het ding in js/tafel.js.
const DINGEN = {
  // het bouwplan: een rol met een huisje erop en een passer
  bouwen: () => bord(50, 34, (P) => {
    P.r(11, 6, 34, 23, KL.perk); P.r(11, 28, 34, 1, KL.perkD); P.r(44, 6, 1, 23, KL.perkS);
    P.r(4, 4, 9, 26, KL.perk); P.r(4, 4, 2, 26, KL.perkS); P.r(11, 4, 2, 26, KL.perkS); P.r(7, 4, 1, 26, KL.perkL);
    P.e(8.5, 4.5, 4.5, 1.6, KL.perkD);
    P.r(19, 24, 15, 1, KL.inkt); P.r(19, 16, 1, 9, KL.inkt); P.r(33, 16, 1, 9, KL.inkt);
    P.l(18, 16, 26, 10, KL.inkt); P.l(26, 10, 34, 16, KL.inkt);
    P.r(25, 19, 3, 5, KL.inktF); P.r(21, 18, 2, 2, KL.inktF); P.r(30, 18, 2, 2, KL.inktF);
    P.r(17, 26, 18, 1, KL.inktF); P.r(17, 25, 1, 3, KL.inktF); P.r(34, 25, 1, 3, KL.inktF);
    P.l(41, 3, 35, 30, KL.ijzerL); P.l(42, 3, 47, 30, KL.ijzerL); P.l(41, 4, 36, 30, KL.ijzer); P.l(42, 4, 46, 30, KL.ijzer);
    P.e(41.5, 3.5, 2, 2, KL.mes);
  }),
  // de velden: een gevouwen kaart met akkers, weide en braak
  velden: () => bord(46, 34, (P) => {
    P.r(3, 4, 40, 26, KL.perk); P.r(16, 4, 13, 26, KL.perkS);
    P.r(3, 29, 40, 1, KL.perkD); P.r(15, 4, 1, 26, KL.perkD); P.r(29, 4, 1, 26, KL.perkD);
    P.r(6, 8, 7, 6, KL.groen); P.r(6, 16, 7, 9, KL.geel); P.r(18, 7, 9, 7, KL.geel);
    P.r(18, 17, 9, 8, KL.groenD); P.r(32, 8, 8, 8, KL.groen); P.r(32, 19, 8, 7, KL.bruin);
    for (let x = 33; x < 40; x += 2) P.r(x, 19, 1, 7, '#6e4a28');
    for (let y = 17; y < 25; y += 2) P.r(7, y, 5, 1, '#b8923a');
    P.l(4, 15, 14, 15, KL.inktF); P.l(16, 15, 28, 16, KL.inktF); P.l(30, 17, 42, 17, KL.inktF);
  }),
  // het wetboek: in leer, met een gouden slot
  wetten: () => bord(42, 34, (P) => {
    P.r(4, 26, 32, 4, KL.perkL); P.r(4, 27, 32, 1, KL.perkS); P.r(4, 29, 32, 1, KL.perkS);
    P.r(35, 6, 4, 23, KL.perkL); P.r(36, 6, 1, 23, KL.perkS); P.r(38, 6, 1, 23, KL.perkS);
    P.r(3, 3, 33, 24, KL.leer); P.r(3, 3, 3, 24, KL.leerD);
    P.r(8, 6, 25, 18, KL.leerD); P.r(9, 7, 23, 16, KL.leer);
    P.r(9, 7, 23, 1, KL.leerL);
    P.e(20.5, 15, 4, 4, KL.goud); P.e(20.5, 15, 2.6, 2.6, KL.leer); P.r(20, 11, 1, 8, KL.goudD);
    P.r(34, 12, 6, 6, KL.goudD); P.r(35, 13, 4, 4, KL.goud); P.r(36, 14, 2, 2, KL.goudD);
  }),
  // de bel van de raadsman
  raadsman: () => bord(28, 34, (P) => {
    P.r(12, 1, 4, 10, KL.hout); P.r(13, 1, 1, 10, KL.houtL); P.e(14, 2.5, 3, 2.2, KL.hout); P.r(13, 1, 1, 2, KL.houtL);
    P.r(10, 11, 8, 2, KL.mesD);
    P.v([[9, 13], [19, 13], [23, 27], [5, 27]], KL.mes);
    P.v([[15, 13], [19, 13], [23, 27], [17, 27]], KL.mesD);
    P.r(10, 15, 2, 11, KL.mesL);
    P.r(4, 27, 20, 2, KL.mesD); P.r(5, 27, 6, 1, KL.mesL);
    P.e(14, 30.5, 1.8, 1.8, KL.ijzer);
  }),
  // een brief van de heer, met zijn zegel
  brief: () => bord(42, 30, (P) => {
    P.r(3, 4, 36, 22, KL.perk); P.r(3, 25, 36, 1, KL.perkD); P.r(38, 4, 1, 22, KL.perkS);
    P.l(3, 4, 21, 16, KL.perkS); P.l(38, 4, 21, 16, KL.perkS); P.l(3, 25, 16, 15, KL.perkS); P.l(38, 25, 26, 15, KL.perkS);
    P.r(19, 19, 2, 7, KL.was); P.r(23, 19, 2, 6, KL.was);
    P.e(21.5, 15.5, 5, 5, KL.wasD); P.e(21.5, 15, 4.5, 4.4, KL.was); P.e(20, 13.5, 1.6, 1.2, KL.wasL);
    P.v([[18, 17], [25, 17], [25.5, 12.5], [23.5, 14.5], [21.5, 11.5], [19.5, 14.5], [17.5, 12.5]], KL.wasD);
  }),
  // het rapport van de raadsman: een rol met een lint
  rapport: () => bord(46, 22, (P) => {
    P.r(6, 5, 34, 12, KL.perk); P.r(6, 5, 34, 1, KL.perkL); P.r(6, 15, 34, 2, KL.perkS);
    P.e(6, 11, 3.5, 6, KL.perkS); P.e(6, 11, 2, 4, KL.perkD);
    P.e(40, 11, 3.5, 6, KL.perk); P.e(40, 11, 2, 4, KL.perkS); P.e(40.5, 11, 1, 2.4, KL.perkD);
    P.r(21, 4, 5, 14, KL.was); P.r(21, 4, 1, 14, KL.wasL); P.r(25, 4, 1, 14, KL.wasD);
    P.r(19, 17, 3, 4, KL.was); P.r(25, 17, 3, 3, KL.wasD);
  }),
  // de zaak: een stapel papieren met een touw erom
  zaak: () => bord(42, 34, (P) => {
    P.r(9, 3, 29, 23, KL.perkD); P.r(6, 5, 29, 23, KL.perkS); P.r(3, 7, 29, 24, KL.perk);
    P.r(3, 30, 29, 1, KL.perkD);
    for (let y = 11; y < 29; y += 3) P.r(6, y, y % 2 ? 19 : 23, 1, KL.inktF);
    P.r(17, 3, 1, 28, '#8a6a3a'); P.r(3, 18, 32, 1, '#8a6a3a');
    P.e(17.5, 18.5, 2.2, 2.2, '#6e4e26'); P.l(17, 18, 13, 23, '#8a6a3a'); P.l(18, 18, 22, 24, '#8a6a3a');
  }),
  // de bode: een inktpot met een veer
  bode: () => bord(28, 38, (P) => {
    P.r(5, 24, 14, 11, KL.ijzerD); P.r(5, 34, 14, 1, '#1a1614'); P.r(7, 25, 1, 8, KL.ijzerL);
    P.r(8, 20, 8, 4, KL.ijzerD); P.r(7, 20, 10, 1, KL.ijzerL);
    for (let i = 0; i <= 18; i++) {
      const x = 12 + Math.round(i * 0.6);
      const y = 21 - i;
      const bw = i < 4 ? 0 : Math.min(3, Math.round((i - 3) / 3));
      P.r(x - bw, y, bw, 1, '#e9e2d2'); P.r(x + 1, y, bw + (i > 8 ? 1 : 0), 1, '#cfc6b2');
      P.r(x, y, 1, 1, '#bdb29a');
    }
    P.r(12, 21, 1, 3, '#2a2420');
  }),
  'lantaarn-aan': () => lantaarn(true),
  'lantaarn-uit': () => lantaarn(false),
  'kaars-aan': () => kaars(true),
  'kaars-uit': () => kaars(false),
  // de zandloper, in een houten raam
  zandloper: () => bord(28, 40, (P) => {
    P.r(2, 1, 24, 4, KL.hout); P.r(2, 1, 24, 1, KL.houtL); P.r(2, 35, 24, 4, KL.hout); P.r(2, 35, 24, 1, KL.houtL);
    P.v([[6, 5], [22, 5], [15, 19], [13, 19]], KL.glas);
    P.v([[13, 21], [15, 21], [22, 35], [6, 35]], KL.glas);
    P.v([[9, 10], [19, 10], [14.6, 18], [13.4, 18]], KL.zand);
    P.v([[7, 35], [21, 35], [14, 28]], KL.zand); P.v([[11, 35], [21, 35], [16, 31]], KL.zandD);
    P.r(14, 18, 1, 12, KL.zand);
    P.r(8, 6, 1, 3, 'rgba(255,255,255,.6)'); P.r(8, 31, 1, 3, 'rgba(255,255,255,.5)');
    P.r(3, 5, 2, 30, KL.houtD); P.r(23, 5, 2, 30, KL.houtD); P.r(3, 5, 1, 30, KL.hout);
  }),
  // de gunst van de heer: zijn zegel in rode was, met een kroon
  gunst: () => bord(32, 32, (P) => {
    P.e(16, 16.5, 13.5, 13, KL.wasD); P.e(16, 16, 13, 12.5, KL.was);
    P.e(5, 23, 3, 3, KL.was); P.e(27, 9, 2.5, 2.5, KL.was); P.e(24, 26, 3, 2.5, KL.was);
    P.e(15.5, 16, 9.5, 9.5, KL.wasD); P.e(15.5, 15.5, 8.6, 8.6, KL.was);
    P.v([[9, 20], [22, 20], [23, 11], [19, 15], [15.5, 9], [12, 15], [8, 11]], KL.wasD);
    P.r(9, 20, 13, 2, KL.wasD);
    P.e(10, 8, 3, 1.5, KL.wasL);
  }),
  // het vertrouwen van het dorp: een zegel in groene was, met een hoed
  vertrouwen: () => bord(32, 32, (P) => {
    P.e(16, 16.5, 13.5, 13, KL.hoedD); P.e(16, 16, 13, 12.5, KL.hoed);
    P.e(4.5, 12, 3, 3, KL.hoed); P.e(26, 24, 3, 3, KL.hoed);
    P.e(15.5, 16, 9.5, 9.5, KL.hoedD); P.e(15.5, 15.5, 8.6, 8.6, KL.hoed);
    P.v([[11, 18], [20, 18], [19, 11], [12, 11]], KL.hoedD); P.r(7, 18, 17, 3, KL.hoedD);
    P.e(10, 8, 3, 1.5, KL.hoedL);
  }),
};

// ---------------------------------------------------------------- het hout

// Eiken planken, vijf rijen van 30, met nerf, noesten, naden en spijkers. De rijen lopen rond: wat rechts uit het beeld
// gaat, komt links terug, zodat de tafel de plaat naast zichzelf kan leggen zonder naad.
function hout(b = 2048, h = 150, zaad = 1797) {
  let z = zaad;
  const lot = () => (z = (z * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const B = nieuwBeeld(b, h);
  const vlak = (x, y, w, hh, k) => {
    const c = kleur(k);
    for (let yy = Math.max(0, y); yy < Math.min(h, y + hh); yy++) {
      for (let xx = x; xx < x + w; xx++) leg(B, ((xx % b) + b) % b, yy, c);
    }
  };
  const tinten = ['#6a3f20', '#714424', '#65391c', '#6e4222', '#683d1e'];
  const plank = 30;
  for (let p = 0; p * plank < h; p++) {
    const y0 = p * plank;
    const begin = Math.floor(lot() * b);
    let x = begin;
    while (x < begin + b) {
      const lengte = Math.min(520 + Math.floor(lot() * 600), begin + b - x);
      vlak(x, y0, lengte, plank, tinten[Math.floor(lot() * tinten.length)]);
      for (let n = 0; n < 16; n++) {
        let yy = y0 + 2 + Math.floor(lot() * (plank - 4));
        const r = lot();
        const k = r < 0.45 ? 'rgba(40,20,8,.26)' : r < 0.8 ? 'rgba(150,100,60,.14)' : 'rgba(30,14,4,.4)';
        for (let xx = x; xx < x + lengte; xx += 6 + Math.floor(lot() * 18)) {
          const stuk = Math.min(10 + Math.floor(lot() * 40), x + lengte - xx);
          vlak(xx, yy, stuk, 1, k);
          if (lot() < 0.3) yy = Math.max(y0 + 1, Math.min(y0 + plank - 3, yy + (lot() < 0.5 ? -1 : 1)));
        }
      }
      if (lengte > 120 && lot() < 0.4) {
        const kx = x + 40 + Math.floor(lot() * (lengte - 80));
        const ky = y0 + 8 + Math.floor(lot() * 12);
        vlak(kx - 7, ky - 1, 15, 5, 'rgba(40,18,6,.35)'); vlak(kx - 5, ky - 3, 11, 9, 'rgba(40,18,6,.35)');
        vlak(kx - 4, ky, 9, 3, 'rgba(40,18,6,.55)'); vlak(kx - 2, ky - 1, 5, 5, 'rgba(40,18,6,.55)');
        vlak(kx - 1, ky + 1, 3, 1, 'rgba(25,10,3,.75)');
      }
      vlak(x + lengte - 2, y0, 2, plank, '#2e170a');
      vlak(x + lengte, y0, 1, plank, 'rgba(160,110,64,.25)');
      vlak(x + lengte - 10, y0 + plank / 2 - 1, 3, 3, '#4a2a14');
      x += lengte;
    }
    vlak(0, y0 + plank - 2, b, 2, '#241106');
    vlak(0, y0, b, 1, 'rgba(160,110,64,.22)');
  }
  vlak(0, 0, b, 1, '#b07a46');
  vlak(0, 1, b, 2, '#94603a');
  vlak(0, 3, b, 1, '#7a4a28');
  // naar onderen wat donkerder
  for (let y = 2; y < h; y++) vlak(0, y, b, 1, `rgba(10,4,0,${(0.35 * y) / h})`);
  return B;
}

// ---------------------------------------------------------------- wegschrijven

function png(B) {
  return K.pngVanBeeld({ b: B.b, h: B.h, rgba: Buffer.from(B.rgba.buffer) });
}

// Alles naar een map (beelden/tafel/, vanuit naar-spel.cjs); geeft wat er staat, voor beelden/beschrijving.json.
function schrijfNaar(map) {
  fs.mkdirSync(map, { recursive: true });
  const maten = {};
  for (const [naam, maak] of Object.entries(DINGEN)) {
    const B = maak();
    fs.writeFileSync(path.join(map, `${naam}.png`), png(B));
    maten[naam] = [B.b, B.h];
  }
  const H = hout();
  fs.writeFileSync(path.join(map, 'hout.png'), png(H));
  return { map: 'tafel/', hout: [H.b, H.h], dingen: maten };
}

// De proefplaat: een stuk tafel met alle dingen erop, op ware maat, en eronder twee keer zo groot.
function proef() {
  const H = hout();
  const plaat = nieuwBeeld(1400, 150 * 3 + 20);
  const plak = (bron, x0, y0, n = 1) => {
    for (let y = 0; y < bron.h * n; y++) {
      for (let x = 0; x < bron.b * n; x++) {
        const i = (Math.floor(y / n) * bron.b + Math.floor(x / n)) * 4;
        const k = bron.rgba;
        leg(plaat, x0 + x, y0 + y, [k[i], k[i + 1], k[i + 2], k[i + 3] / 255]);
      }
    }
  };
  // de naad: het eind van het hout naast zijn begin
  plak({ b: 700, h: 150, rgba: kolommen(H, H.b - 700, 700) }, 0, 0);
  plak({ b: 700, h: 150, rgba: kolommen(H, 0, 700) }, 700, 0);
  let x = 20;
  for (const naam of Object.keys(DINGEN)) {
    const B = DINGEN[naam]();
    plak(B, x, 75 - B.h / 2);
    x += B.b + 16;
  }
  plak({ b: 700, h: 150, rgba: kolommen(H, 300, 700) }, 0, 170, 2);
  x = 20;
  for (const naam of ['bouwen', 'wetten', 'brief', 'lantaarn-aan', 'zandloper', 'gunst', 'vertrouwen']) {
    const B = DINGEN[naam]();
    plak(B, x, 170 + 150 - B.h, 2);
    x += B.b * 2 + 20;
  }
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'tafel-proef.png'), png(plaat));
  console.log(`uit/tafel-proef.png (${plaat.b}×${plaat.h}); dingen: ${Object.keys(DINGEN).join(', ')}`);
}

// Een strook kolommen uit een beeld.
function kolommen(B, x0, b) {
  const uit = new Uint8ClampedArray(b * B.h * 4);
  for (let y = 0; y < B.h; y++) uit.set(B.rgba.subarray((y * B.b + x0) * 4, (y * B.b + x0 + b) * 4), y * b * 4);
  return uit;
}

module.exports = { DINGEN, hout, schrijfNaar, proef };

if (require.main === module) proef();
