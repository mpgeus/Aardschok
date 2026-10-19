// Het wapen van de heer: een gouden leeuw, klimmend, naar links (ontwerp/beeld.md, "Het huis van de heer draagt rood en
// geel", en "Onze eigen art, met onze eigen pijplijn": wat zeker moet kloppen, tekenen we zelf in code). Een dun onderdeel
// op een wand, met zijn eigen materiaal, zodat het een eigen gebied is voor SDXL (karhd.cjs meester) en een eigen kleur
// houdt. De vorm is een raster; de afstand tot de vorm wordt één keer uitgerekend (in hokjes), en het onderdeel is die
// afstand, dun gemaakt langs de normaal van de wand.
//
//   leeuw({ midden, normaal, boven, hoog, dikte, m, deel, naarLinks })   een onderdeel: de leeuw op een wand met die
//                                                                        normaal ([±1, 0, 0] of [0, ±1, 0]), `hoog`
//                                                                        eenheden hoog, de kop naar `naarLinks` (een
//                                                                        richting in de wand)
'use strict';

const LEEUW = [
  '....###...........',
  '...#####........#.',
  '..#######......#.#',
  '.########......#..',
  '##.######......#..',
  '#..#######....##..',
  '..#########..##...',
  '.##.#########.#...',
  '##...########.#...',
  '....##########....',
  '..###.#########...',
  '.##....########...',
  '##.....########...',
  '.......#########..',
  '........########..',
  '.......#########..',
  '......####...###..',
  '.....###......##..',
  '....###.......###.',
  '...###.......###..',
  '..####......####..',
  '.##.##.....##.##..',
];

// De afstand (in hokjes) van het midden van elk hokje tot de rand van de vorm: binnen negatief, buiten positief.
function afstanden(raster) {
  const h = raster.length;
  const b = raster[0].length;
  const vol = (x, y) => raster[y][x] === '#';
  const d = new Float32Array(b * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    let best = Infinity;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < b; xx++) {
      if (vol(xx, yy) === vol(x, y)) continue;
      best = Math.min(best, Math.hypot(xx - x, yy - y));
    }
    d[y * b + x] = vol(x, y) ? -(best - 0.5) : best - 0.5;
  }
  return { b, h, d };
}
const AF = afstanden(LEEUW);

// De afstand op een plek (u, v) in hokjes (0 tot b, 0 tot h vanaf linksboven), bilineair, en buiten het raster de afstand
// tot het raster erbij.
function afstandOp(u, v) {
  const { b, h, d } = AF;
  const x = Math.max(0, Math.min(b - 1, u - 0.5));
  const y = Math.max(0, Math.min(h - 1, v - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const x1 = Math.min(b - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0, fy = y - y0;
  const w = (xx, yy) => d[yy * b + xx];
  const binnen = w(x0, y0) * (1 - fx) * (1 - fy) + w(x1, y0) * fx * (1 - fy) + w(x0, y1) * (1 - fx) * fy + w(x1, y1) * fx * fy;
  const buiten = Math.hypot(Math.max(0, -u, u - b), Math.max(0, -v, v - h));
  return binnen + buiten;
}

function leeuw({ midden, normaal, boven = [0, 0, 1], hoog, dikte = 0.12, m, deel, naarLinks }) {
  const cel = hoog / AF.h;
  // de richtingen in de wand: rechts (in het raster) is weg van naarLinks
  const rechts = naarLinks.map((c) => -c);
  const f = (x, y, z) => {
    const p = [x - midden[0], y - midden[1], z - midden[2]];
    const u = (p[0] * rechts[0] + p[1] * rechts[1] + p[2] * rechts[2]) / cel + AF.b / 2;
    const v = -(p[0] * boven[0] + p[1] * boven[1] + p[2] * boven[2]) / cel + AF.h / 2;
    const n = p[0] * normaal[0] + p[1] * normaal[1] + p[2] * normaal[2];
    return Math.max(afstandOp(u, v) * cel, Math.abs(n - dikte / 2) - dikte / 2);
  };
  return { f, g: [midden[0], midden[1], midden[2], Math.hypot(AF.b, AF.h) * cel * 0.5 + 0.5], m, deel };
}

module.exports = { leeuw, LEEUW };
