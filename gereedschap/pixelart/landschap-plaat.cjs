// De grote plaat van het landschap (werklijst vraag 121; Marcel, 7 okt: "ik zou een grote plaat willen zien", en eerder
// "Uiteindelijk wilde ik een map van 2500x2500"): de glooiing uit het nummer van het land (T.landschapOp, js/hoogte.js),
// van boven, een pixel per tegel, met het licht van de zon uit het westen zoals in het spel, en het stuk van 100 bij 100
// waar het dorp nu ligt in rood. Het water, de bossen en de dorpen komen er pas met de kaartenmaker (vraag 117).
//
//   node gereedschap/pixelart/landschap-plaat.cjs [nummer] [maat]   → gereedschap/pixelart/uit/landschap/
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const T = require('../../test/laad.cjs').spel();

const ZAAD = Number(process.argv[2] || 5);
const MAAT = Number(process.argv[3] || 2500);
const UIT = path.join(__dirname, 'uit', 'landschap');
fs.mkdirSync(UIT, { recursive: true });

// het stuk van nu (0..100) ligt in het midden
const van = Math.round(50 - MAAT / 2);
const h = new Float32Array((MAAT + 1) * (MAAT + 1));
let laag = Infinity;
let hoog = -Infinity;
for (let y = 0; y <= MAAT; y++) {
  for (let x = 0; x <= MAAT; x++) {
    const v = T.landschapOp(ZAAD, van + x, van + y);
    h[y * (MAAT + 1) + x] = v;
    if (v < laag) laag = v;
    if (v > hoog) hoog = v;
  }
}
// van laag naar hoog: dal, wei, heuvel, hoogte, rots
const STOPS = [[0, [52, 88, 44]], [0.35, [86, 128, 58]], [0.6, [118, 140, 66]], [0.8, [140, 126, 84]], [1, [170, 164, 152]]];
const kleurVan = (t) => {
  for (let i = 1; i < STOPS.length; i++) {
    if (t <= STOPS[i][0]) {
      const [a, ka] = STOPS[i - 1];
      const [b, kb] = STOPS[i];
      const f = (t - a) / (b - a);
      return ka.map((c, j) => c + (kb[j] - c) * f);
    }
  }
  return STOPS[STOPS.length - 1][1];
};
const rgba = Buffer.alloc(MAAT * MAAT * 4);
for (let y = 0; y < MAAT; y++) {
  for (let x = 0; x < MAAT; x++) {
    const i = y * (MAAT + 1) + x;
    const v = h[i];
    // het licht zoals in het spel: een helling per tegel (32 pixels hoogte is een tegel)
    const f = T.helderheidVanVlak([0, 0, 0], [1, 0, h[i + 1] - v], [0, 1, h[i + MAAT + 1] - v]);
    const k = kleurVan((v - laag) / (hoog - laag)).map((c) => Math.max(0, Math.min(255, c * f)));
    let [r, g, b] = k;
    // het stuk van nu, in rood omlijnd
    const sx = van + x;
    const sy = van + y;
    const rand = (sx === 0 || sx === 100) && sy >= 0 && sy <= 100 || (sy === 0 || sy === 100) && sx >= 0 && sx <= 100;
    if (rand) [r, g, b] = [220, 40, 40];
    const o = (y * MAAT + x) * 4;
    rgba[o] = r;
    rgba[o + 1] = g;
    rgba[o + 2] = b;
    rgba[o + 3] = 255;
  }
}
fs.writeFileSync(path.join(UIT, `land-${ZAAD}-${MAAT}.png`), K.pngVanBeeld({ b: MAAT, h: MAAT, rgba }));
// en een kleine om te bekijken (een vijfde)
const KL = Math.floor(MAAT / 5);
const klein = Buffer.alloc(KL * KL * 4);
for (let y = 0; y < KL; y++) for (let x = 0; x < KL; x++) rgba.copy(klein, (y * KL + x) * 4, ((y * 5 + 2) * MAAT + x * 5 + 2) * 4, ((y * 5 + 2) * MAAT + x * 5 + 2) * 4 + 4);
fs.writeFileSync(path.join(UIT, `land-${ZAAD}-${MAAT}-klein.png`), K.pngVanBeeld({ b: KL, h: KL, rgba: klein }));
console.log(`land ${ZAAD}, ${MAAT} bij ${MAAT} tegels: van ${Math.round(laag)} tot ${Math.round(hoog)} pixels (${Math.round((hoog - laag) / 32)} treden), in ${path.relative(path.join(__dirname, '..', '..'), UIT)}`);
