'use strict';
// De vellen van de uiterlijken (vraag 145, 1; uiterlijk.cjs): elk uiterlijk staand en lopend, en die van de mannen en
// de vrouwen ook in elk werk (de werkfiguren van werkfiguren.cjs, met het uiterlijk van metUiterlijk), zodat wie aan het
// werk gaat dezelfde blijft. Een figuur heet als zijn gewone vel met -u en het nummer van het uiterlijk erachter:
// boer-u7, zaaier-u7, boerin-u3, zaaister-u3, meisje-u5, oudeman-u2, oudevrouw-u9. Het spel kiest ze in js/sprites.js
// (T.sprites.figuurVanUiterlijk), het uiterlijk van een bewoner in js/bewoners.js (T.kiesUiterlijk). De ouden werken in
// het gewone werkvel. De man en de vrouw ook in de kleren van een andere stand (vraag 149; kleren() in uiterlijk.cjs),
// alleen staand en lopend, want aan het werk dragen ze hun gewone kleren: boer-u7-arm, boerin-u3-deftig.
//
//   node gereedschap/pixelart/uiterlijk-anim.cjs                 alles (honderden figuren; een taak op de achtergrond
//                                                                 stopt na twee uur, dus in delen, zie --deel)
//   node gereedschap/pixelart/uiterlijk-anim.cjs boer-u0 zaaier-u0   alleen deze
//   node gereedschap/pixelart/uiterlijk-anim.cjs --deel 2/4      elke vierde, vanaf de tweede (vier processen naast elkaar)
//   node gereedschap/pixelart/uiterlijk-anim.cjs --erbij         alleen wat er nog niet is
//   -> uit/uiterlijk/animaties/<naam>-<houding>.png en <naam>.json
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen uiterlijken,<namen> (of --uiterlijken: alle die er zijn).
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const UI = require('./uiterlijk.cjs');
const W = require('./werkfiguren.cjs');
const { boer, BOER_SNELHEID } = require('./dorpelingen.cjs');
const { boerin, jongen, meisje, kleuter, BOERIN_SNELHEID, JONGEN_SNELHEID, MEISJE_SNELHEID, KLEUTER_SNELHEID } = require('./dorpelingen2.cjs');
const { MAAIER_BEELDEN, MAAIER_FPS } = require('./maaier.cjs');
const { doosVan, figuurVel } = require('./figuurvel.cjs');

const UIT = path.join(__dirname, 'uit', 'uiterlijk', 'animaties');
const RUIM = { b: 260, h: 240, anker: [130, 180] }; // de ruime cel, zoals in werkfiguren-anim.cjs

// Per lijf: hoe het gebouwd wordt, hoe snel het loopt, en (bij de man en de vrouw) de werkfiguren met hun naam.
const LIJVEN = {
  boer: { bouw: boer, snelheid: BOER_SNELHEID, werk: ['maaier', 'zaaier', 'wieder', 'sprokkelaar', 'hakker', 'plukker', 'binder', 'drager', 'dorser'] },
  boerin: { bouw: boerin, snelheid: BOERIN_SNELHEID, werk: ['maaister', 'zaaister', 'wiedster', 'sprokkelaarster', 'hakster', 'plukster', 'binster', 'draagster', 'dorster'] },
  jongen: { bouw: jongen, snelheid: JONGEN_SNELHEID },
  meisje: { bouw: meisje, snelheid: MEISJE_SNELHEID },
  kleuter: { bouw: kleuter, snelheid: KLEUTER_SNELHEID },
  oudeman: { bouw: boer, snelheid: BOER_SNELHEID },
  oudevrouw: { bouw: boerin, snelheid: BOERIN_SNELHEID },
};
const GEWOON = { staan: { beelden: 4, fps: 4 }, lopen: { beelden: 8, fps: 10 } }; // zoals dorpelingen-anim.cjs
const TRAPPEN = ['arm', 'deftig']; // de kleren naar stand naast de gewone (vraag 149)

// Alle figuren: { naam, houdingen, maak(stand), snelheid }. Ook voor naar-spel.cjs.
function uiterlijkFiguren() {
  const lijst = [];
  for (const [lijf, L] of Object.entries(LIJVEN)) {
    UI.UITERLIJKEN[lijf].forEach((o, nr) => {
      lijst.push({ naam: `${lijf}-u${nr}`, houdingen: GEWOON, maak: (stand) => L.bouw(stand, o), snelheid: L.snelheid });
      for (const werk of L.werk || []) {
        const maaien = werk === 'maaier';
        lijst.push({
          naam: `${werk}-u${nr}`,
          houdingen: maaien ? { maaien: { beelden: MAAIER_BEELDEN, fps: MAAIER_FPS } } : W.HOUDINGEN[werk],
          maak: (stand) => W.metUiterlijk(o, () => (maaien ? W.maaierWerk(stand) : W[werk](stand))),
          snelheid: maaien || !W.HOUDINGEN[werk].lopen ? undefined : W.snelheidVan(werk),
        });
      }
    });
  }
  for (const lijf of ['boer', 'boerin']) {
    const L = LIJVEN[lijf];
    for (const trap of TRAPPEN) {
      UI.UITERLIJKEN[lijf].forEach((o, nr) => {
        lijst.push({ naam: `${lijf}-u${nr}-${trap}`, houdingen: GEWOON, maak: (stand) => L.bouw(stand, UI.uiterlijkIn(lijf, nr, trap)), snelheid: L.snelheid });
      });
    }
  }
  return lijst;
}

function render(f) {
  const cache = new Map();
  const beeldVan = (houding, i, kant) => {
    const k = `${houding}|${i}|${kant}`;
    if (!cache.has(k)) {
      const p = K.losRenderen(f.maak({ houding, fase: i / f.houdingen[houding].beelden }), { b: RUIM.b, h: RUIM.h, anker: RUIM.anker, richting: kant });
      const d = doosVan(p);
      if (d.x0 <= 0 || d.y0 <= 0 || d.x0 + d.b >= RUIM.b - 1 || d.y0 + d.h >= RUIM.h - 1) {
        console.error(`  RAND ${f.naam} ${houding} ${i} ${kant}`);
        process.exitCode = 1;
      }
      cache.set(k, { plaat: p, doos: d });
    }
    return cache.get(k);
  };
  figuurVel(f.naam, f.houdingen, beeldVan, { uit: UIT, snelheid: f.snelheid, anker: RUIM.anker, proef: false });
}

module.exports = { LIJVEN, uiterlijkFiguren, UIT };

if (require.main === module) {
  const args = process.argv.slice(2);
  const deel = args.includes('--deel') ? args[args.indexOf('--deel') + 1].split('/').map(Number) : null;
  const namen = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--deel');
  let lijst = uiterlijkFiguren();
  const onbekend = namen.filter((n) => !lijst.some((f) => f.naam === n));
  if (onbekend.length) {
    console.error(`Onbekend: ${onbekend.join(', ')}`);
    process.exit(1);
  }
  if (namen.length) lijst = lijst.filter((f) => namen.includes(f.naam));
  if (deel) lijst = lijst.filter((f, i) => i % deel[1] === deel[0] - 1);
  if (args.includes('--erbij')) lijst = lijst.filter((f) => !fs.existsSync(path.join(UIT, `${f.naam}.json`)));
  console.log(`${lijst.length} figuren`);
  for (const f of lijst) render(f);
}
