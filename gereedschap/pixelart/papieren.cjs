// Papier, een spijker en de tekens bij de deur (ontwerp/werklijst.md, vraag 98 en 100; Marcel, 3 okt: "98 C", de
// schrijftafel, en "100 ja"): wat je weet, komt op papier. Het papier en de spijker zijn die van de schetsen "De ui als
// papieren"; de tekens hangen aan de deur van een huis dat iets mist (js/tekenen.js), en staan op het briefje dat de muis
// op een huis laat zien (js/huisbriefje.js).
//
// Drie vellen, uit de kleurrampen van het spel (kern.cjs), zonder 3D-model: ze zijn plat.
//   beelden/papier.png    48×48, oud perkament met gerafelde randen: negen stukken van 8 voor border-image (stijl.css)
//   beelden/spijker.png   8×8, een spijkerkop
//   beelden/tekens.png    een rij cellen van 20×20: een papiertje aan een spijker met wat het huis mist erop
//
//   node gereedschap/pixelart/papieren.cjs    (de proefplaat: uit/papieren-proef.png)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { ruis3 } = K;

const r = (x, y, z, s) => ruis3(x, y, z, s);

// Elk gevuld punt dat aan een leeg punt grenst, wordt de omlijning.
function omlijn(p, ramp, stap) {
  const rand = [];
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      if (!p.lees(x - 1, y) || !p.lees(x + 1, y) || !p.lees(x, y - 1) || !p.lees(x, y + 1)) rand.push([x, y]);
    }
  }
  for (const [x, y] of rand) p.zet(x, y, ramp, stap);
}

// ---------------------------------------------------------------- het papier

// Oud perkament: gerafelde randen die naar de rand toe vergelen, en een paar vezels. 48×48; de negen stukken van 8 zijn
// de hoeken, de randen en het midden voor border-image.
function papier(b = 48, h = 48, zaad = 3) {
  const p = new K.Plaat(b, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const d = Math.min(x, y, b - 1 - x, h - 1 - y);
      if (d === 0 && r(x * 0.9, y * 0.9, zaad, 7) > 0.45) continue;
      if (d === 1 && r(x * 0.7, y * 0.7, zaad, 9) > 0.78) continue;
      let s = 4.7 + (r(x * 0.2, y * 0.2, zaad, 4) - 0.5) * 0.5;
      if (r(x * 0.1, y * 1.6, zaad, 11) > 0.86) s -= 0.4;
      if (d < 4) s -= (4 - d) * 0.45;
      p.zet(x, y, 'perkament', s);
    }
  }
  omlijn(p, 'perkament', 1);
  return p;
}

// ---------------------------------------------------------------- de spijker

function spijker() {
  const p = new K.Plaat(8, 8);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (Math.hypot(x - 3.5, y - 3.5) > 3.4) continue;
      p.zet(x, y, 'ijzer', 5.5 - (x + y) * 0.35);
    }
  }
  omlijn(p, 'ijzer', 0);
  return p;
}

// ---------------------------------------------------------------- de tekens

// Elk teken is een rooster van 12 bij 12 met een letter per pixel: '.' is papier, de rest een kleur uit een ramp.
const KLEUR = {
  k: ['inkt', 1], // inkt
  w: ['perkament', 6], // wit
  y: ['goud', 5], // geel
  o: ['goud', 3], // donkergeel
  b: ['hout', 4], // hout
  d: ['hout', 2], // donker hout
  r: ['rood', 5], // rood
  g: ['blad', 5], // groen
  u: ['water', 4], // blauw
  s: ['steen', 4], // steen
  t: ['steen', 2], // donkere steen
};

// Wat een huis mist, in dezelfde namen als T.WENSEN (js/wensen.js), en 'bouwstof' als het op hout of steen wacht.
const TEKENS = {
  eten: [
    '..w..w..w...',
    '...w..w..w..',
    '..w..w..w...',
    '............',
    'kkkkkkkkkkk.',
    'kyyyyyyyyyk.',
    'kbbbbbbbbbk.',
    '.kbbbbbbbk..',
    '..kbbbbbk...',
    '...kkkkk....',
    '............',
    '............',
  ],
  brandhout: [
    '............',
    '............',
    '..kkk..kkk..',
    '.kbobkkbobk.',
    '.kobokkobok.',
    '.kbobkkbobk.',
    '..kkkkkkkk..',
    '.kbobkkbobk.',
    '.kobokkobok.',
    '.kbobkkbobk.',
    '..kkk..kkk..',
    '............',
  ],
  put: [
    '..dddddddd..',
    '.d.k....k.d.',
    '...k....k...',
    '...k.kk.k...',
    '...k..k.k...',
    '.kkkkkkkkkk.',
    '.kssttssttk.',
    '.kttssttssk.',
    '.kssttssttk.',
    '.kttssttssk.',
    '.kkkkkkkkkk.',
    '............',
  ],
  bier: [
    '............',
    '..wwwwww....',
    '.wwwwwwww...',
    '.kyyyyyyk...',
    '.kyoyyoykkk.',
    '.kyoyyoyk.k.',
    '.kyoyyoyk.k.',
    '.kyoyyoykkk.',
    '.kyyyyyyk...',
    '.kkkkkkkk...',
    '............',
    '............',
  ],
  vleesOfVis: [
    '............',
    '............',
    '..........k.',
    '...kkkkk.kk.',
    '..kuuuuukuk.',
    '.kuwkuuuuuk.',
    '.kuuuuuuuuk.',
    '..kuuuuukuk.',
    '...kkkkk.kk.',
    '..........k.',
    '............',
    '............',
  ],
  kapel: [
    '.....k......',
    '....kkk.....',
    '.....k......',
    '....kkk.....',
    '...krrrk....',
    '..krrrrrk...',
    '.krrrrrrrk..',
    '.kwwwwwwwk..',
    '.kwwkkwwwk..',
    '.kwwkkwwwk..',
    '.kkkkkkkkk..',
    '............',
  ],
  herberg: [
    '.kkkkkkkk...',
    '.k......k...',
    '.k......k...',
    'kkkkkkkkkk..',
    'kbbbbbbbbk..',
    'kbwwwwbbbk..',
    'kbyyyykbbk..',
    'kbyoyokbbk..',
    'kbyyyykbbk..',
    'kbbbbbbbbk..',
    'kkkkkkkkkk..',
    '............',
  ],
  brood: [
    '............',
    '............',
    '............',
    '...kkkkkk...',
    '..kooooook..',
    '.koyoyoyook.',
    '.kyyyyyyyyk.',
    '.koooooooook',
    '..kkkkkkkkk.',
    '............',
    '............',
    '............',
  ],
  laken: [
    '............',
    '............',
    '.kkkkkkkkkk.',
    '.kuuwuuwuuk.',
    '.kuuwuuwuuk.',
    '.kkkkkkkkkk.',
    '.krrwrrwrrk.',
    '.krrwrrwrrk.',
    '.kkkkkkkkkk.',
    '............',
    '............',
    '............',
  ],
  markt: [
    '............',
    'kkkkkkkkkkkk',
    'krwrwrwrwrwk',
    'krwrwrwrwrwk',
    'kkkkkkkkkkkk',
    '.k........k.',
    '.k.yy.gg..k.',
    '.kkkkkkkkkk.',
    '.kbbbbbbbbk.',
    '.k........k.',
    '.k........k.',
    '............',
  ],
  bouwstof: [
    '............',
    '..kkkkkk....',
    '.ksssssskk..',
    '.ksssssssk..',
    '..kkkkdkk...',
    '.....kdk....',
    '.....kdk....',
    '.....kdk....',
    '.....kdk....',
    '.....kdk....',
    '......k.....',
    '............',
  ],
};
const NAMEN = Object.keys(TEKENS);
const CEL = [20, 20];
const ANKER = [10, 19];

// Eén teken: een papiertje van 16 bij 16 aan een spijker, met het rooster erop.
function teken(naam) {
  const p = new K.Plaat(CEL[0], CEL[1]);
  const x0 = 2;
  const y0 = 3;
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const d = Math.min(x, y, 15 - x, 15 - y);
      p.zet(x0 + x, y0 + y, 'perkament', 5.2 - (d < 2 ? (2 - d) * 0.6 : 0) + (r(x * 0.4, y * 0.4, 5, 3) - 0.5) * 0.4);
    }
  }
  omlijn(p, 'perkament', 1);
  const rooster = TEKENS[naam];
  rooster.forEach((rij, j) => [...rij].forEach((c, i) => {
    if (c === '.') return;
    const [ramp, stap] = KLEUR[c];
    p.zet(x0 + 2 + i, y0 + 2 + j, ramp, stap);
  }));
  // de spijker bovenaan
  for (const [dx, dy, s] of [[0, 0, 5], [1, 0, 3.5], [0, 1, 3.5], [1, 1, 2]]) p.zet(9 + dx, 1 + dy, 'ijzer', s);
  return p;
}

function tekensVel() {
  const vel = new K.Plaat(CEL[0] * NAMEN.length, CEL[1]);
  NAMEN.forEach((naam, i) => vel.plak(teken(naam), i * CEL[0], 0));
  return vel;
}

// Wat in beelden/beschrijving.json komt (naar-spel.cjs).
function beschrijving() {
  return { bestand: 'tekens.png', cel: CEL, anker: ANKER, namen: NAMEN };
}

// ---------------------------------------------------------------- de proefplaat

function vergroot(p, n) {
  const uit = new K.Plaat(p.b * n, p.h * n);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      const k = p.lees(x, y);
      if (!k) continue;
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) uit.zet(x * n + i, y * n + j, k[0], k[1]);
    }
  }
  return uit;
}

function proef() {
  const tekens = vergroot(tekensVel(), 4);
  const pap = vergroot(papier(), 3);
  const plaat = new K.Plaat(Math.max(tekens.b, pap.b + 60) + 24, tekens.h + pap.h + 36);
  plaat.plak(tekens, 12, 12);
  plaat.plak(pap, 12, tekens.h + 24);
  plaat.plak(vergroot(spijker(), 4), pap.b + 30, tekens.h + 24);
  const uit = path.join(__dirname, 'uit');
  fs.mkdirSync(uit, { recursive: true });
  fs.writeFileSync(path.join(uit, 'papieren-proef.png'), K.png(plaat, 1, '#5e6a44'));
  console.log(`uit/papieren-proef.png (${plaat.b}×${plaat.h}); tekens: ${NAMEN.join(', ')}`);
}

module.exports = { papier, spijker, tekensVel, beschrijving, proef, NAMEN, CEL, ANKER };

if (require.main === module) proef();
