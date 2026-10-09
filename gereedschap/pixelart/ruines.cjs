// De ruïnes van afgebrande huizen (js/brand.js; werklijst vraag 144, 3; Marcel, 9 okt: "Huis moet afgebrokkeld zijn.
// Echt kapot. Structureel ingestort etc"). Elk huis van de huizenbouwer (huizen.cjs, HUIZEN) krijgt zijn eigen ruïne,
// uit het huis zelf gesneden (renderHuisRuine in huizen.cjs): de muren gebroken, het dak weg op een paar spanten na,
// gevallen balken, as en puin, alles verkoold.
//
//   node gereedschap/pixelart/ruines.cjs proef [tekening ...]   een proefplaat: het huis en zijn ruïne naast elkaar, in
//                                                                gereedschap/pixelart/uit/ruines/proef.png (niet in git)
//
// (Alle tekeningen voor het spel komen er pas na de proefplaat, als Marcel hem goed vindt.)
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const HZ = require('./huizen.cjs');

const UIT = path.join(__dirname, 'uit', 'ruines');
const PROEF = ['wit-hut1-riet-z', 'wit-huis1-riet-z', 'wit-steen1-leien-z', 'boerderij1'];

function proef(namen) {
  fs.mkdirSync(UIT, { recursive: true });
  const rijen = [];
  for (const naam of namen) {
    const t0 = Date.now();
    const heel = HZ.renderHuis(HZ.HUIZEN[naam]);
    const ruine = HZ.renderHuisRuine(naam);
    console.log(`  ${naam.padEnd(22)} ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    rijen.push({ naam, heel, ruine });
  }
  // Naast elkaar, met de ankers op één lijn: links het huis, rechts zijn ruïne.
  const RAND = 16;
  const breed = Math.max(...rijen.map((r) => r.heel.plaat.b + r.ruine.cb)) + RAND * 3;
  const hoog = rijen.reduce((n, r) => n + Math.max(r.heel.plaat.h, r.ruine.ch) + RAND, RAND);
  const vel = new K.Plaat(breed, hoog);
  let y = RAND;
  for (const r of rijen) {
    const boven = Math.max(r.heel.anker[1], r.ruine.ankerY);
    vel.plak(r.heel.plaat, RAND, y + boven - r.heel.anker[1]);
    vel.plak(r.ruine.plaat, RAND * 2 + r.heel.plaat.b, y + boven - r.ruine.ankerY);
    y += Math.max(r.heel.plaat.h, r.ruine.ch) + RAND;
  }
  const bestand = path.join(UIT, 'proef.png');
  fs.writeFileSync(bestand, K.png(vel, 1, '#4a5a3a'));
  console.log(`  ${bestand}`);
}

const args = process.argv.slice(2);
if (args[0] === 'proef') proef(args.length > 1 ? args.slice(1) : PROEF);
else console.log('Gebruik: node gereedschap/pixelart/ruines.cjs proef [tekening ...]');
