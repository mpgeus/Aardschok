// Het toetsdecor voor binnen: drie kamers met deuren, meubels en twee monsters. Dit was tot 24 sep
// 2026 de toren van het oude spel (T.maakWereld in js/wereld.js). De toren ging eruit (werklijst
// punt 7, stap 6), maar de machinerie voor binnen bleef — kamers die je ontdekt, deuren, zicht per
// kamer, en een gevecht dat binnen begint (js/gevecht.js) — en die blijft getoetst op dezelfde
// plattegrond als altijd. Die plattegrond staat daarom nu hier, bij de toetsen, en niet meer in het
// spel.
//
// Dit bestand definieert alleen: node --test draait alles onder test/ als toets, en zo is dit er
// een zonder toetsen erin. Gebruik:
//
//   const { maakBinnen } = require('./decor/binnen.cjs');
//   const w = maakBinnen();
'use strict';
require('../../js/wereld.js');
const T = globalThis.Toren;

// Legenda: # muur, . vloer, D deur (dicht), L deur (op slot), spatie = buiten.
// De deur helemaal links in rij 5 was de buitendeur van de toren; in het decor leidt hij nergens
// heen (er zijn geen overgangen).
const PLATTEGROND = [
  '####################',
  '#........#.........#',
  '#........#.........#',
  '#........#.........#',
  '#........D.........#',
  'D........#.........#',
  '#........#.........#',
  '#........#.........#',
  '####L###############',
  '#........#          ',
  '#........#          ',
  '#........#          ',
  '#........#          ',
  '#........#          ',
  '#........#          ',
  '##########          ',
];

// Een kamer is een rechthoek vloer. De muren eromheen horen er niet bij: een muur scheidt twee
// kamers, en welke kant de voorkant is, hangt af van waar je staat.
const KAMERS = [
  { id: 'hal', naam: 'De hal', x1: 1, y1: 1, x2: 8, y2: 7, vloer: ['#6e5c48', '#675643'] },
  { id: 'opslag', naam: 'De voorraadkamer', x1: 10, y1: 1, x2: 18, y2: 7, vloer: ['#5f4b37', '#584532'] },
  { id: 'trap', naam: 'Het trappenhuis', x1: 1, y1: 9, x2: 8, y2: 14, vloer: ['#51555a', '#4b4f54'] },
];

// De meubels staan niet meer in T.VOORWERPEN van het spel, dus brengt het decor hun soort zelf
// mee — zoals js/kaart.js een soort van een kaart erbij zet. Een kist houdt het zicht tegen, een
// fontein niet, en de trap beslaat drie bij drie tegels (een spiraal waar een man door past is
// minstens twee meter breed), vanaf zijn voorste hoek naar achteren.
const MEUBELS = {
  fontein: { blokkeert: true, zichtDicht: false },
  kist: { blokkeert: true, zichtDicht: true },
  pilaar: { blokkeert: true, zichtDicht: true },
  trap: { blokkeert: true, zichtDicht: false, voet: { dx: -2, dy: -2, b: 3, h: 3 } },
};
for (const [soort, eig] of Object.entries(MEUBELS)) if (!T.VOORWERPEN[soort]) T.VOORWERPEN[soort] = eig;

// Een verse wereld, elke keer opnieuw: een toets mag er alles in verzetten.
function maakBinnen() {
  const h = PLATTEGROND.length;
  const b = PLATTEGROND[0].length;
  const tegels = [];
  const deuren = new Map();
  for (let y = 0; y < h; y++) {
    const rij = [];
    for (let x = 0; x < b; x++) {
      const t = PLATTEGROND[y][x];
      if (t === '#') rij.push('muur');
      else if (t === '.') rij.push('vloer');
      else if (t === 'D' || t === 'L') {
        rij.push('deur');
        deuren.set(x + ',' + y, { x, y, staat: t === 'L' ? 'opslot' : 'dicht', richting: 'ow' });
      } else rij.push('buiten');
    }
    tegels.push(rij);
  }
  const w = {
    b, h, tegels, deuren, kamers: KAMERS,
    voorwerpen: [], wezens: [],
    bekend: new Set(['hal']), huidigeKamer: 'hal',
    overgangen: [],
    buiten: false,
  };
  // Loopt de muur rond de deur van noord naar zuid, dan staat het deurpaneel dwars op x.
  for (const d of deuren.values()) if (T.tegel(w, d.x, d.y - 1) === 'muur') d.richting = 'ns';
  w.voorwerpen.push(
    { soort: 'fontein', x: 7, y: 6 },
    { soort: 'kist', x: 12, y: 2 },
    { soort: 'kist', x: 13, y: 5 },
    { soort: 'kist', x: 14, y: 5 },
    { soort: 'pilaar', x: 3, y: 11 },
    { soort: 'pilaar', x: 6, y: 11 },
    // De trap, met zijn voorste hoek op deze tegel: zo staat hij precies in de zuidoosthoek van
    // het trappenhuis.
    { soort: 'trap', x: 8, y: 14 },
  );
  w.wezens.push(
    T.maakWezen('held', 3, 5),
    T.maakWezen('slijm', 16, 4),
    T.maakWezen('skelet', 5, 13),
  );
  w.burenKamers = T.burenKamers(w);
  return w;
}

module.exports = { maakBinnen };
