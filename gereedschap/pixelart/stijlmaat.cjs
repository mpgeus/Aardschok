// Stijlmaten: een paar getallen over een sprite, om hem naast een voorbeeld te leggen (de HD-proef, werklijst vraag 180;
// gereedschap/ai/hd-wielproef.md). Geen oordeel over mooi: wel of het licht warm is, de schaduw diep, het contrast groot,
// hoeveel kleuren er zijn, en hoe druk het beeld is. Een drukker beeld is niet beter (Marcel, 18 okt: "Beschouw meer
// hoogfrequente pixelverschillen niet automatisch als hogere artistieke kwaliteit"); het getal zegt alleen hoe druk.
//
// stijlmaat({ b, h, rgba }) → { kleuren, licht, schaduw, contrast, warmte, verzadiging, druk, lijn }
//   kleuren      verschillende kleuren in wat dekt
//   licht        de helderheid (0 tot 255) waar de lichtste 5% begint, schaduw waar de donkerste 5% ophoudt; contrast het verschil
//   warmte       rood min blauw in de lichtste 15% (warm licht is positief)
//   verzadiging  gemiddeld (max - min) / max van de kleur
//   druk         het deel van de pixels binnenin dat meer dan 24 in helderheid van een buur verschilt
//   lijn         het deel van de pixels dat donker (onder 40) is en aan de rand of een donkere naad ligt
'use strict';

const helder = (r, i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
const dekt = (r, i) => r.rgba[i * 4 + 3] >= 128;

function stijlmaat(r) {
  const L = [];
  const kleuren = new Set();
  let verz = 0;
  let druk = 0;
  let binnen = 0;
  let lijn = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.b; x++) {
    const i = y * r.b + x;
    if (!dekt(r, i)) continue;
    const k = [r.rgba[i * 4], r.rgba[i * 4 + 1], r.rgba[i * 4 + 2]];
    kleuren.add((k[0] << 16) | (k[1] << 8) | k[2]);
    const l = helder(r, i);
    L.push([l, k[0] - k[2]]);
    const mx = Math.max(...k);
    verz += mx ? (mx - Math.min(...k)) / mx : 0;
    const buren = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => (x + dx < 0 || y + dy < 0 || x + dx >= r.b || y + dy >= r.h ? -1 : (y + dy) * r.b + x + dx));
    const rand = buren.some((j) => j < 0 || !dekt(r, j));
    if (l < 40) lijn++;
    if (rand) continue;
    binnen++;
    if (buren.some((j) => Math.abs(helder(r, j) - l) > 24)) druk++;
  }
  const n = L.length || 1;
  const gesorteerd = L.map((a) => a[0]).sort((a, b) => a - b);
  const p = (q) => gesorteerd[Math.min(gesorteerd.length - 1, Math.floor(q * gesorteerd.length))] || 0;
  const drempel = p(0.85);
  const licht15 = L.filter((a) => a[0] >= drempel);
  return {
    kleuren: kleuren.size,
    licht: Math.round(p(0.95)),
    schaduw: Math.round(p(0.05)),
    contrast: Math.round(p(0.95) - p(0.05)),
    warmte: Math.round(licht15.reduce((s, a) => s + a[1], 0) / Math.max(1, licht15.length)),
    verzadiging: +(verz / n).toFixed(2),
    druk: +(druk / Math.max(1, binnen)).toFixed(2),
    lijn: +(lijn / n).toFixed(2),
  };
}

module.exports = { stijlmaat };
