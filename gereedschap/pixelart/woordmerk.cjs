// Het woordmerk TITHEBREAKER (werklijst vraag 172, 7; Marcel, 16 okt: "Pixel art uit code", en voor de richting
// "Gebroken goud"): eigen kapitalen van pixels, geen letter van de computer. Zo'n 20 pixels hoog, op het scherm op 2× of
// 3× (stijl.css). Het goud van de heer: oker, met licht van linksboven en een donkere rand, zoals alles uit de renderer
// (ontwerp/beeld.md, "Palet"). De haak: het woord is zelf gebroken. Tussen TITHE en BREAKER zit een kier; BREAKER zakt een
// pixel en kantelt iets (elke letter verder een fractie lager), en in de kier hangen twee splinters goud.
//
// Elke letter is opgebouwd uit balken en schuine streken (LETTERS), op een raster van HOOG pixels, zodat ze even dik en
// even hoog zijn; dan komt het licht erop (kleur), de rand eromheen, en een schaduw eronder.
//
//   node gereedschap/pixelart/woordmerk.cjs            uit/woordmerk.png (1×) en uit/woordmerk-groot.png (3×)
//   node gereedschap/pixelart/woordmerk.cjs --spel     ook beelden/woordmerk.png, voor het titelscherm (js/menu.js)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');

const HOOG = 16; // de hoogte van een kapitaal, zonder rand
const STAM = 3; // de dikte van een staande streek
const TUSSEN = 2; // tussen twee letters
// De breuk: E en B raken elkaar, en een gekartelde barst loopt erdoor (BARST: per rij hoe ver links of rechts). Wat
// rechts ervan ligt, schuift een pixel op en zakt: B, R en E twee pixels, A, K, E en R drie (het kantelen, per letter,
// zodat geen letter zelf breekt).
const BARST = [0, 0, 1, 1, 0, 0, -1, -1, 0, 1, 1, 0, 0, -1, 0, 1, 1, 0, 0];
const ZAKT = [2, 2, 2, 3, 3, 3, 3];

// ── De letters ──
// Elke letter is { b, delen }: zijn breedte, en balken ['r', x0, y0, x1, y1] (x0 tot x1, y0 tot y1) en schuine streken
// ['s', xa, ya, xb, yb, dik] (het midden van de streek loopt van (xa, ya) naar (xb, yb)). ['weg', x, y] haalt een pixel
// weg (een ronde hoek, een schilfer).
const schreef = (x) => [['r', x - 1, 0, x + STAM + 1, 2], ['r', x - 1, HOOG - 2, x + STAM + 1, HOOG]];
const LETTERS = {
  T: { b: 13, delen: [['r', 0, 0, 13, 3], ['r', 0, 0, 2, 5], ['r', 11, 0, 13, 5], ['r', 5, 0, 8, HOOG], ['r', 3, HOOG - 2, 10, HOOG]] },
  I: { b: 7, delen: [['r', 2, 0, 5, HOOG], ['r', 0, 0, 7, 2], ['r', 0, HOOG - 2, 7, HOOG]] },
  H: {
    b: 14,
    delen: [['r', 1, 0, 4, HOOG], ['r', 10, 0, 13, HOOG], ...schreef(1), ...schreef(10), ['r', 4, 7, 10, 10]],
  },
  E: {
    b: 12,
    delen: [
      ['r', 1, 0, 4, HOOG], ['r', 0, 0, 4, 2], ['r', 0, HOOG - 2, 4, HOOG],
      ['r', 1, 0, 12, 3], ['r', 10, 0, 12, 5], ['r', 4, 7, 10, 10], ['r', 1, HOOG - 3, 12, HOOG], ['r', 10, HOOG - 5, 12, HOOG],
    ],
  },
  B: {
    b: 13,
    delen: [
      ['r', 1, 0, 4, HOOG], ['r', 0, 0, 4, 2], ['r', 0, HOOG - 2, 4, HOOG],
      ['r', 1, 0, 10, 3], ['r', 9, 1, 12, 7], ['weg', 11, 1], ['weg', 11, 6],
      ['r', 4, 7, 11, 9], ['r', 10, 8, 13, 15], ['weg', 12, 8], ['weg', 12, 14], ['r', 1, HOOG - 3, 11, HOOG],
    ],
  },
  R: {
    b: 14,
    delen: [
      ['r', 1, 0, 4, HOOG], ['r', 0, 0, 4, 2], ['r', 0, HOOG - 2, 5, HOOG],
      ['r', 1, 0, 10, 3], ['r', 9, 1, 12, 8], ['weg', 11, 1], ['weg', 11, 7], ['r', 4, 7, 10, 10],
      ['s', 8, 9, 12, HOOG, 3], ['r', 10, HOOG - 2, 14, HOOG],
    ],
  },
  A: {
    b: 15,
    delen: [
      ['s', 6.5, 0, 2.5, HOOG, 3], ['s', 8.5, 0, 12.5, HOOG, 3], ['r', 5, 0, 10, 2], ['r', 4, 9, 11, 11],
      ['r', 0, HOOG - 2, 5, HOOG], ['r', 10, HOOG - 2, 15, HOOG],
    ],
  },
  K: {
    b: 14,
    delen: [
      ['r', 1, 0, 4, HOOG], ...schreef(1), ['s', 4.5, 9, 11.5, 0, 3], ['r', 9, 0, 14, 2],
      ['s', 6, 7, 12, HOOG, 3], ['r', 10, HOOG - 2, 14, HOOG],
    ],
  },
};

// Een letter als masker: een lijst van rijen met 1 waar goud is.
function masker(letter) {
  const { b, delen } = LETTERS[letter];
  const m = Array.from({ length: HOOG }, () => new Uint8Array(b));
  const zet = (x, y, w) => {
    if (x >= 0 && x < b && y >= 0 && y < HOOG) m[y][x] = w;
  };
  for (const d of delen) {
    if (d[0] === 'r') for (let y = d[2]; y < d[4]; y++) for (let x = d[1]; x < d[3]; x++) zet(x, y, 1);
    if (d[0] === 's') {
      const [, xa, ya, xb, yb, dik] = d;
      for (let y = Math.min(ya, yb); y < Math.max(ya, yb); y++) {
        const t = (y + 0.5 - ya) / (yb - ya);
        const xm = xa + (xb - xa) * t;
        for (let x = Math.round(xm - dik / 2); x < Math.round(xm + dik / 2); x++) zet(x, y, 1);
      }
    }
    if (d[0] === 'weg') zet(d[1], d[2], 0);
  }
  return m;
}

// ── Het woord ──
// Eerst het hele woord recht, met E en B tegen elkaar; dan de breuk: links van de barst blijft alles staan, de barst zelf
// wordt een kier (de rand maakt er een donkere lijn van), en rechts ervan schuift elke letter twee pixels op en zakt (ZAKT). Twee
// splinters vallen onder de breuk weg. Een rand van een pixel en een schaduw eromheen, dus RAND ruimte.
const RAND = 2;
function legWoord() {
  const woord = 'TITHEBREAKER';
  const letters = [];
  let x = RAND;
  for (let i = 0; i < woord.length; i++) {
    if (i === 5) x -= TUSSEN; // E en B raken elkaar
    letters.push({ m: masker(woord[i]), x, zakt: i >= 5 ? ZAKT[i - 5] : 0 });
    x += LETTERS[woord[i]].b + TUSSEN;
  }
  const naad = letters[5].x; // de eerste kolom van de B
  const barst = (y) => naad + BARST[Math.max(0, Math.min(BARST.length - 1, y))];
  const b = x - TUSSEN + 2 + RAND;
  const h = RAND + HOOG + Math.max(...ZAKT) + 4 + RAND;
  const goud = Array.from({ length: h }, () => new Uint8Array(b));
  const boven = new Int16Array(b); // de bovenkant van de letter in elke kolom (voor het licht)
  for (const l of letters) {
    l.m.forEach((rij, y) => rij.forEach((v, dx) => {
      const ox = l.x + dx;
      if (!v || ox === barst(y)) return;
      const rechts = ox > barst(y);
      const nx = ox + (rechts ? 2 : 0);
      const ny = RAND + y + (rechts ? l.zakt : 0);
      goud[ny][nx] = 1;
      boven[nx] = RAND + (rechts ? l.zakt : 0);
    }));
  }
  // De splinters: een hoekje net onder de breuk, en een kruimel wat verder, alsof ze eruit vielen.
  const onder = RAND + HOOG + 1;
  for (const [sx, sy] of [[naad - 2, onder + 1], [naad - 1, onder + 1], [naad - 1, onder + 2], [naad + 2, onder + 3]]) {
    goud[sy][sx] = 1;
    boven[sx] = boven[sx] || RAND;
  }
  return { b, h, goud, boven };
}

// ── Het licht ──
// Het goud van de heer, van donker naar licht (schaduwen naar bruinrood, licht naar geel), en de rand in het donkerste.
const KLEUR = {
  rand: '#24120a',
  diep: '#6e3a16',
  laag: '#a5641d',
  midden: '#c98d2c',
  hoog: '#e5b94c',
  glans: '#fbe8a3',
};

function kleur({ b, h, goud, boven }) {
  const rgba = Buffer.alloc(b * h * 4);
  const is = (x, y) => x >= 0 && y >= 0 && x < b && y < h && goud[y][x] === 1;
  const zet = (x, y, hex, a = 255) => {
    const [r, g, bl] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const i = (y * b + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = bl;
    rgba[i + 3] = a;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      if (is(x, y)) {
        const hoogte = y - boven[x]; // 0 bovenaan de letter
        // Licht van linksboven: de bovenste en linkse rand glanst, de onderste en rechtse ligt in de schaduw.
        let k = hoogte < 5 ? 'hoog' : hoogte < 11 ? 'midden' : 'laag';
        if (!is(x + 1, y) || !is(x, y + 1)) k = 'diep';
        else if (!is(x - 1, y) || !is(x, y - 1)) k = 'glans';
        // Gegoten, en wat gesleten: hier en daar een putje.
        else if (K.rnd(x, y, 172) < 0.05) k = 'laag';
        zet(x, y, KLEUR[k]);
        continue;
      }
      // De rand: elk pixel naast het goud (ook schuin).
      let naast = false;
      for (let dy = -1; dy <= 1 && !naast; dy++) for (let dx = -1; dx <= 1; dx++) if (is(x + dx, y + dy)) naast = true;
      if (naast) zet(x, y, KLEUR.rand);
    }
  }
  // Een schaduw onder de rand, een pixel naar rechtsonder, half doorzichtig.
  const kopie = Buffer.from(rgba);
  for (let y = 1; y < h; y++) {
    for (let x = 1; x < b; x++) {
      const i = (y * b + x) * 4;
      const j = ((y - 1) * b + (x - 1)) * 4;
      if (kopie[i + 3] === 0 && kopie[j + 3] === 255) zet(x, y, '#000000', 110);
    }
  }
  return { b, h, rgba };
}

function main() {
  const beeld = kleur(legWoord());
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'woordmerk.png'), K.pngVanBeeld(beeld));
  // Op 3×, om het van dichtbij te zien.
  const S = 3;
  const groot = { b: beeld.b * S, h: beeld.h * S, rgba: Buffer.alloc(beeld.b * S * beeld.h * S * 4) };
  for (let y = 0; y < groot.h; y++) {
    for (let x = 0; x < groot.b; x++) beeld.rgba.copy(groot.rgba, (y * groot.b + x) * 4, (Math.floor(y / S) * beeld.b + Math.floor(x / S)) * 4, (Math.floor(y / S) * beeld.b + Math.floor(x / S)) * 4 + 4);
  }
  fs.writeFileSync(path.join(uit, 'woordmerk-groot.png'), K.pngVanBeeld(groot));
  if (process.argv.includes('--spel')) fs.writeFileSync(path.join(__dirname, '..', '..', 'beelden', 'woordmerk.png'), K.pngVanBeeld(beeld));
  console.log(`woordmerk: ${beeld.b} bij ${beeld.h} pixels`);
}

main();
