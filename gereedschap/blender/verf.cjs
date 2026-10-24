// De referentie als verf op het model (vraag 190; ontwerp/beeld.md, "Projecteren"). Marcel, 24 okt: "en hoe krijgen we dit
// dichter op de referentie? uv wrapping?", en "projecteer vel 01 (staan Z) op het model, met het beeld eerst naar onze render
// gebogen". Hier het buigen: staan naar Z van vel 01 vervormd tot het op de HD-render van speerman_hd.py valt, met vaste
// punten in beide beelden (een thin-plate spline), naar uit/blender/render/verf-Z.png. Daarna legt speerman_hd.py het als
// textuur op het model, vanuit dezelfde camera (`-- <map> verf`).
//
//   node gereedschap/blender/verf.cjs          per richting het gebogen beeld (render/verf-<richting>.png), en
//                                              uit/blender/verf-buigen-<richting>.png om het te beoordelen
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('../pixelart/kern.cjs');
const G = require('../pixelart/generator.cjs');

const RENDER = path.join(__dirname, '..', 'pixelart', 'uit', 'blender', 'render');
const VEL01 = path.join(__dirname, '..', 'pixelart', 'uit', 'generator', 'bron', 'speerman-01.png');

// Vaste punten: [in de HD-render, in vel 01 (pixels van het vel)], afgelezen op een raster (24 okt).
const PUNTEN_Z = [
  ['punt van de helm', [600, 382], [161, 187]],
  ['helmrand links', [400, 565], [105, 244]],
  ['helmrand rechts', [800, 565], [216, 244]],
  ['oog links', [555, 630], [144, 271]],
  ['oog rechts', [645, 630], [175, 271]],
  ['neus', [600, 680], [159, 280]],
  ['kin', [600, 740], [161, 310]],
  ['kraag midden onder', [600, 925], [165, 327]],
  ['kraag links', [375, 780], [105, 305]],
  ['kraag rechts', [815, 780], [225, 307]],
  ['schouder links', [345, 760], [82, 310]],
  ['schouder rechts', [860, 780], [250, 325]],
  ['vuist rechts (de speer)', [350, 1050], [60, 355]],
  ['elleboog links', [930, 1080], [262, 395]],
  ['handschoen links', [900, 1430], [240, 455]],
  ['gesp', [600, 1160], [155, 416]],
  ['riem links', [345, 1140], [100, 412]],
  ['riem rechts', [845, 1140], [220, 410]],
  ['zoom links', [345, 1490], [95, 505]],
  ['zoom midden', [585, 1515], [150, 510]],
  ['zoom rechts', [880, 1490], [232, 505]],
  ['laars links, neus', [410, 1880], [107, 590]],
  ['laars rechts, neus', [810, 1880], [222, 597]],
  ['zool links', [420, 1915], [117, 600]],
  ['speer, punt', [317, 227], [57, 90]],
  ['speer, voet', [320, 1905], [64, 588]],
];
// ZW en W (Marcel: "eerst met Z, ZW en W (en gespiegeld voor de andere kant)"), op dezelfde manier afgelezen, op de renders
// van het model uit die richting (speerman_hd.py -- <map> kijk)
const PUNTEN_ZW = [
  ['punt van de helm', [580, 385], [431, 189]],
  ['helmrand links', [380, 560], [380, 240]],
  ['helmrand rechts', [775, 565], [497, 247]],
  ['neus', [460, 665], [402, 284]],
  ['kin', [505, 740], [410, 312]],
  ['kraag voor onder', [520, 920], [430, 330]],
  ['kraag links', [380, 850], [387, 300]],
  ['kraag rechts', [820, 780], [497, 310]],
  ['vuist rechts (de speer)', [200, 970], [342, 350]],
  ['mouw links, buiten', [875, 1000], [530, 360]],
  ['handschoen links', [765, 1460], [502, 465]],
  ['gesp', [420, 1145], [412, 412]],
  ['riem links', [350, 1100], [380, 405]],
  ['riem rechts', [730, 1140], [485, 412]],
  ['zoom links', [305, 1430], [380, 490]],
  ['zoom voor', [400, 1490], [397, 505]],
  ['zoom rechts', [700, 1510], [512, 505]],
  ['laars voor, neus', [265, 1800], [375, 575]],
  ['laars achter, neus', [550, 1890], [450, 605]],
  ['laars rechts, achterkant', [800, 1820], [510, 595]],
  ['laars rechts, omslag buiten', [790, 1620], [500, 535]],
  ['laars rechts, omslag binnen', [620, 1610], [460, 530]],
  ['laars links, omslag', [550, 1550], [430, 520]],
  ['laars links, hak', [530, 1810], [425, 585]],
  ['speer, punt', [200, 155], [340, 90]],
  ['speer, voet', [200, 1840], [347, 580]],
];
const PUNTEN_W = [
  ['punt van de helm', [570, 385], [686, 192]],
  ['helmrand voor', [375, 555], [625, 242]],
  ['helmrand achter', [765, 555], [740, 247]],
  ['neus', [415, 635], [644, 272]],
  ['kin', [455, 710], [652, 297]],
  ['kraag voor onder', [390, 865], [645, 320]],
  ['kraag achter', [790, 800], [745, 320]],
  ['vuist rechts (de speer)', [290, 880], [617, 350]],
  ['mouw links', [590, 940], [705, 350]],
  ['handschoen links', [560, 1480], [702, 445]],
  ['gesp', [355, 1070], [640, 407]],
  ['riem achter', [800, 1100], [735, 420]],
  ['zoom voor', [335, 1460], [635, 500]],
  ['zoom achter', [800, 1460], [755, 492]],
  ['laars hoog, neus', [330, 1740], [632, 575]],
  ['laars laag, neus', [340, 1850], [667, 600]],
  ['speer, punt', [300, 81], [618, 90]],
  ['speer, voet', [305, 1765], [627, 580]],
];
// per richting: de vaste punten, waar die figuur op vel 01 staat (x van tot), en de render van het model uit die richting
const RICHTINGEN = {
  Z: { punten: PUNTEN_Z, x0: 0, x1: 285, render: 'kijk-Z.png' },
  ZW: { punten: PUNTEN_ZW, x0: 272, x1: 560, render: 'kijk-ZW.png' },
  W: { punten: PUNTEN_W, x0: 545, x1: 830, render: 'kijk-W.png' },
};
// en gespiegeld voor de andere kant (de man is bijna symmetrisch; de camera draait om de oorsprong, die midden in beeld staat)
const GESPIEGELD = { ZO: 'ZW', O: 'W' };

const lees = (p) => K.leesPng(fs.readFileSync(p));

// thin-plate spline van de punten in de render naar de punten in het vel: f(x, y) = a0 + a1 x + a2 y + som w_i U(r_i)
function tps(van, naar) {
  const n = van.length;
  const U = (r2) => (r2 > 0 ? r2 * Math.log(r2) * 0.5 : 0); // r^2 log r
  const M = Array.from({ length: n + 3 }, () => new Float64Array(n + 3));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const dx = van[i][0] - van[j][0], dy = van[i][1] - van[j][1];
      M[i][j] = U(dx * dx + dy * dy) + (i === j ? 1e-3 : 0);
    }
    M[i][n] = 1; M[i][n + 1] = van[i][0]; M[i][n + 2] = van[i][1];
    M[n][i] = 1; M[n + 1][i] = van[i][0]; M[n + 2][i] = van[i][1];
  }
  const los = (b) => { // Gauss met spil
    const A = M.map((r, i) => [...r, b[i]]);
    const N = n + 3;
    for (let c = 0; c < N; c++) {
      let p = c;
      for (let r = c + 1; r < N; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
      [A[c], A[p]] = [A[p], A[c]];
      for (let r = 0; r < N; r++) {
        if (r === c) continue;
        const f = A[r][c] / A[c][c];
        for (let k = c; k <= N; k++) A[r][k] -= f * A[c][k];
      }
    }
    return A.map((r, i) => r[N] / r[i]);
  };
  const wx = los([...naar.map((q) => q[0]), 0, 0, 0]);
  const wy = los([...naar.map((q) => q[1]), 0, 0, 0]);
  return (x, y) => {
    let fx = wx[n] + wx[n + 1] * x + wx[n + 2] * y, fy = wy[n] + wy[n + 1] * x + wy[n + 2] * y;
    for (let i = 0; i < n; i++) {
      const dx = x - van[i][0], dy = y - van[i][1], u = U(dx * dx + dy * dy);
      fx += wx[i] * u; fy += wy[i] * u;
    }
    return [fx, fy];
  };
}

// vel 01 zonder het magenta, en de kleuren tot 30 pixels naar buiten doorgezet (zodat een punt net buiten zijn silhouet
// toch een kleur vindt)
function bron(x0 = 0, x1 = 300) {
  const vel = lees(VEL01);
  const fg = G.voorgrond(vel);
  const b = x1 - x0, h = vel.h;
  const kl = new Int16Array(b * h * 3).fill(-1);
  // strenger dan voorgrond(): een randpixel met een magenta zweem is ook achtergrond
  const zweem = (o) => Math.min(vel.rgba[o], vel.rgba[o + 2]) - vel.rgba[o + 1] > 20;
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const o = y * vel.b + x0 + x;
    if (fg[o] && !zweem(o * 4)) for (let c = 0; c < 3; c++) kl[(y * b + x) * 3 + c] = vel.rgba[o * 4 + c];
  }
  for (let ronde = 0; ronde < 30; ronde++) {
    const nieuw = kl.slice();
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < b - 1; x++) {
      const i = y * b + x;
      if (kl[i * 3] >= 0) continue;
      for (const j of [i - 1, i + 1, i - b, i + b]) if (kl[j * 3] >= 0) { for (let c = 0; c < 3; c++) nieuw[i * 3 + c] = kl[j * 3 + c]; break; }
    }
    kl.set(nieuw);
  }
  return { b, h, kl };
}

// Een richting buigen: van elke pixel van het model naar zijn plek op vel 01, en de kleur daar.
function buig(r) {
  const R = RICHTINGEN[r];
  const ren = lees(path.join(RENDER, R.render));
  const f = tps(R.punten.map((p) => p[1]), R.punten.map((p) => [p[2][0] - R.x0, p[2][1]]));
  const B = bron(R.x0, R.x1);
  const verf = { b: ren.b, h: ren.h, rgba: Buffer.alloc(ren.b * ren.h * 4) };
  for (let y = 0; y < ren.h; y++) for (let x = 0; x < ren.b; x++) {
    const o = (y * ren.b + x) * 4;
    if (ren.rgba[o + 3] < 8) continue;
    const [sx, sy] = f(x + 0.5, y + 0.5);
    const X = Math.round(sx - 0.5), Y = Math.round(sy - 0.5);
    if (X < 0 || Y < 0 || X >= B.b || Y >= B.h) continue;
    const i = (Y * B.b + X) * 3;
    if (B.kl[i] < 0) continue;
    verf.rgba.set([B.kl[i], B.kl[i + 1], B.kl[i + 2], 255], o);
  }
  return { ren, verf };
}

// gespiegeld om het midden van het beeld
function spiegel(beeld) {
  const uit = { b: beeld.b, h: beeld.h, rgba: Buffer.alloc(beeld.b * beeld.h * 4) };
  for (let y = 0; y < beeld.h; y++) for (let x = 0; x < beeld.b; x++) beeld.rgba.copy(uit.rgba, (y * beeld.b + (beeld.b - 1 - x)) * 4, (y * beeld.b + x) * 4, (y * beeld.b + x) * 4 + 4);
  return uit;
}

// om te beoordelen: de render, het gebogen vel, en die twee half over elkaar, een derde zo groot
function naast(ren, verf) {
  const n = 3, ob = Math.floor(ren.b / n), oh = Math.floor(ren.h / n);
  const doek = { b: ob * 3 + 20, h: oh, rgba: Buffer.alloc((ob * 3 + 20) * oh * 4) };
  for (let i = 0; i < doek.b * doek.h; i++) doek.rgba.set([92, 96, 90, 255], i * 4);
  for (let y = 0; y < oh; y++) for (let x = 0; x < ob; x++) {
    const s = ((y * n) * ren.b + x * n) * 4;
    const a = ren.rgba[s + 3] / 255, v = verf.rgba[s + 3] / 255;
    const r = [0, 1, 2].map((c) => ren.rgba[s + c] * a + [92, 96, 90][c] * (1 - a));
    const w = [0, 1, 2].map((c) => verf.rgba[s + c] * v + [92, 96, 90][c] * (1 - v));
    for (const [ox, kl] of [[0, r], [ob + 10, w], [2 * ob + 20, r.map((c, k) => c * 0.5 + w[k] * 0.5)]]) doek.rgba.set([...kl.map(Math.round), 255], (y * doek.b + ox + x) * 4);
  }
  return doek;
}

function main() {
  const uit = path.join(__dirname, '..', 'pixelart', 'uit', 'blender');
  const gebogen = {};
  for (const r of Object.keys(RICHTINGEN)) {
    const { ren, verf } = buig(r);
    gebogen[r] = verf;
    fs.writeFileSync(path.join(RENDER, `verf-${r}.png`), K.pngVanBeeld(verf));
    fs.writeFileSync(path.join(uit, `verf-buigen-${r}.png`), K.pngVanBeeld(naast(ren, verf)));
  }
  for (const [r, van] of Object.entries(GESPIEGELD)) fs.writeFileSync(path.join(RENDER, `verf-${r}.png`), K.pngVanBeeld(spiegel(gebogen[van])));
  console.log('uit/blender/render/verf-<richting>.png, uit/blender/verf-buigen-<richting>.png');
}

if (require.main === module) main();
module.exports = { RICHTINGEN, GESPIEGELD, tps };
