'use strict';
// De ogen van de wolf, voor de nacht (werklijst vraag 116, stap 1; Marcel, 4 okt: "Rode ogen uit het duister"): waar in
// elk beeld van zijn vellen de gele pixels van zijn ogen zitten, tegen het anker van dat beeld. js/tekenen.js tekent er
// 's nachts rode puntjes op, ná de nacht, zodat ze oplichten waar de wolf zelf zwart is (tekenOgen). Het spel mag zelf
// geen pixels lezen (getImageData werkt niet vanaf file://), daarom staat het hier, en komt het als gegevens in
// beelden/ogen.js: per figuur, per houding, per richting (Z ZW W NW N NO O ZO), per beeld een lijst [dx, dy], een per
// oog dat je ziet (twee van voren, een van opzij, geen van achteren).
//
//   node gereedschap/pixelart/ogen.cjs
//
// Opnieuw draaien als de vellen van de wolf veranderen (na naar-spel.cjs).
const fs = require('fs');
const path = require('path');
const { leesPng } = require('./kern.cjs');

const BEELDEN = path.join(__dirname, '..', '..', 'beelden');
const FIGUREN = ['wolf'];

// Geel, zoals de ogen in bosvijanden.cjs: veel rood en groen, weinig blauw.
const isOog = (r, g, b, a) => a > 128 && r > 170 && g > 120 && b < 110 && r - b > 90;

// De gele pixels van één beeld, in groepjes die elkaar raken (een oog), elk als het midden tegen het anker.
function ogenIn(png, x0, y0, b, h, anker) {
  const geel = new Set();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const i = ((y0 + y) * png.b + (x0 + x)) * 4;
      if (isOog(png.rgba[i], png.rgba[i + 1], png.rgba[i + 2], png.rgba[i + 3])) geel.add(y * b + x);
    }
  }
  const uit = [];
  const gezien = new Set();
  for (const start of geel) {
    if (gezien.has(start)) continue;
    const rij = [start];
    gezien.add(start);
    let sx = 0;
    let sy = 0;
    for (let k = 0; k < rij.length; k++) {
      const p = rij[k];
      const x = p % b;
      const y = (p - x) / b;
      sx += x;
      sy += y;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const q = (y + dy) * b + (x + dx);
          if (x + dx < 0 || x + dx >= b || y + dy < 0 || y + dy >= h || !geel.has(q) || gezien.has(q)) continue;
          gezien.add(q);
          rij.push(q);
        }
      }
    }
    const half = (v) => Math.round(v * 2) / 2;
    uit.push([half(sx / rij.length + 0.5 - anker[0]), half(sy / rij.length + 0.5 - anker[1])]);
  }
  return uit.sort((a, c) => a[0] - c[0]);
}

const beschrijving = JSON.parse(fs.readFileSync(path.join(BEELDEN, 'beschrijving.json'), 'utf8'));
const OGEN = {};
for (const naam of FIGUREN) {
  const f = beschrijving.figuren[naam];
  if (!f) throw new Error(`geen figuur "${naam}" in beelden/beschrijving.json`);
  OGEN[naam] = {};
  for (const [houding, h] of Object.entries(f.houdingen)) {
    const png = leesPng(fs.readFileSync(path.join(BEELDEN, 'figuren', h.bestand)));
    const [b, hg] = h.cel;
    OGEN[naam][houding] = f.richtingen.map((_, r) => Array.from({ length: h.beelden }, (__, k) => ogenIn(png, k * b, r * hg, b, hg, h.anker)));
    const per = OGEN[naam][houding].map((rij) => Math.max(...rij.map((o) => o.length)));
    console.log(`${naam} ${houding}: ogen per richting ${f.richtingen.map((ri, i) => `${ri} ${per[i]}`).join(', ')}`);
  }
}

const tekst = `// Gemaakt door gereedschap/pixelart/ogen.cjs — niet met de hand bijwerken.
// Waar de ogen van een figuur zitten, per houding, richting en beeld, tegen het anker: js/tekenen.js laat ze 's nachts
// oplichten (werklijst vraag 116).
(function (T) {
  T.OGEN = ${JSON.stringify(OGEN)};
})(globalThis.Spel = globalThis.Spel || {});
`;
fs.writeFileSync(path.join(BEELDEN, 'ogen.js'), tekst);
console.log('beelden/ogen.js');
