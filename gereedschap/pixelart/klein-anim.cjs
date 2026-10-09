'use strict';
// De vellen van het kleine leven (klein.cjs; vraag 145, 3): de kippen (kip0..kip3: staan, lopen, pikken) en de honden
// (hond0..hond2: staan, lopen, blaffen), zoals figuurvel.cjs ze schrijft.
//
//   node gereedschap/pixelart/klein-anim.cjs              alle
//   node gereedschap/pixelart/klein-anim.cjs kip0 hond1   alleen deze
//   -> uit/klein/animaties/<naam>-<houding>.png en <naam>.json
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen kip0,kip1,kip2,kip3,hond0,hond1,hond2
const path = require('path');
const K = require('./kern.cjs');
const KL = require('./klein.cjs');
const BV = require('./bosvijanden.cjs');
const { doosVan, figuurVel } = require('./figuurvel.cjs');

const UIT = path.join(__dirname, 'uit', 'klein', 'animaties');
const RUIM = { b: 160, h: 140, anker: [80, 110] };

// De loopsnelheid van de hond: die van de wolf, op zijn maat (een kleinere pas).
const HOND_SNELHEID = +(BV.SNELHEID.wolf * KL.HOND_SCHAAL).toFixed(3);
const FIGUREN = [
  ...KL.KIP_KLEUREN.map((k, i) => ({ naam: k.naam, houdingen: KL.KIP_HOUDINGEN, maak: (stand) => KL.kip(i, stand), snelheid: KL.KIP_SNELHEID })),
  ...KL.HOND_KLEUREN.map((k, i) => ({ naam: k.naam, houdingen: KL.HOND_HOUDINGEN, maak: (stand) => KL.hond(i, stand), snelheid: HOND_SNELHEID })),
];

function render(f) {
  const cache = new Map();
  const beeldVan = (houding, i, kant) => {
    const k = `${houding}|${i}|${kant}`;
    if (!cache.has(k)) {
      const h = f.houdingen[houding];
      const fase = h.herhaal === false ? (i + 1) / h.beelden : i / h.beelden;
      const p = K.losRenderen(f.maak({ houding, fase }), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: kant });
      cache.set(k, { plaat: p, doos: doosVan(p) });
    }
    return cache.get(k);
  };
  figuurVel(f.naam, f.houdingen, beeldVan, { uit: UIT, snelheid: f.snelheid, anker: RUIM.anker });
}

module.exports = { FIGUREN, UIT };

if (require.main === module) {
  const namen = process.argv.slice(2);
  for (const f of FIGUREN) if (!namen.length || namen.includes(f.naam)) render(f);
}
