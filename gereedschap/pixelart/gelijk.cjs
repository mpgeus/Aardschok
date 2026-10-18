// Blijft de renderer gelijk? (werklijst vraag 180; Marcel, 18 okt: "Zorg dat de oude renderer pixel voor pixel identieke
// resultaten blijft geven wanneer AI-texturen uitgeschakeld zijn.") Rendert een vaste reeks bestaande dingen (de
// ossenkar uit acht richtingen, stilstaand en lopend, met hout en met de buit van de heer; de heer en zijn soldaat; de os en
// de koe; het paard met de heer erop) door kern.cjs, met licht, omlijning en de vaste kleuren, en bewaart van elk beeld
// een hash. Vóór een wijziging aan kern.cjs `bewaar`, erna `vergelijk`: elk verschil wordt genoemd.
//
//   node gereedschap/pixelart/gelijk.cjs bewaar      de nulmeting naar uit/gelijk.json
//   node gereedschap/pixelart/gelijk.cjs vergelijk   opnieuw renderen en vergelijken
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const K = require('./kern.cjs');
const O = require('./ossenkar.cjs');
const V = require('./vee.cjs');
const { heer, soldaat } = require('./heer.cjs');
const { tekenTePaard } = require('./heerstoet.cjs');

const BESTAND = path.join(__dirname, 'uit', 'gelijk.json');

function hash(plaat) {
  return crypto.createHash('sha1').update(plaat.rgba(null)).digest('hex');
}
function los(teken, b = 220, h = 200, ox = 110, oy = 160) {
  const B = new K.Beeld(b, h, ox, oy);
  teken(B);
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function reeks() {
  const uit = {};
  for (const kant of K.KANTEN) {
    uit[`ossenkar-hout-${kant}`] = hash(O.beeld({ lading: 'hout' }, kant));
    uit[`ossenkar-buit-${kant}`] = hash(O.beeld({ lading: 'buit', bak: 'heer', wind: [1, 0], blink: 0 }, kant));
    uit[`heer-${kant}`] = hash(los((B) => K.tekenModel(B, heer({ houding: 'staan', fase: 0 }), { richting: kant }), 100, 110, 50, 95));
    uit[`soldaat-${kant}`] = hash(los((B) => K.tekenModel(B, soldaat({ houding: 'lopen', fase: 0.25 }), { richting: kant }), 100, 130, 50, 115));
    uit[`paard-${kant}`] = hash(los((B) => tekenTePaard(B, { houding: 'lopen', fase: 0.3 }, kant)));
  }
  for (let f = 0; f < 8; f++) {
    uit[`ossenkar-lopen-ZW-${f}`] = hash(O.beeld({ lading: 'hout', houding: 'lopen', fase: f / 8 }, 'ZW'));
    uit[`ossenkar-lopen-NO-${f}`] = hash(O.beeld({ lading: 'buit', bak: 'heer', houding: 'lopen', fase: f / 8, wind: [1, 0], blink: f % 2 }, 'NO'));
  }
  for (const [naam, o] of [['koe', {}], ['os', { os: true, juk: true }], ['koe-lopen', { houding: 'lopen', fase: 0.4 }]]) {
    for (const kant of ['ZW', 'NO', 'O']) uit[`${naam}-${kant}`] = hash(los((B) => K.tekenModel(B, V.koe(o), { richting: kant }), 160, 130, 80, 105));
  }
  return uit;
}

function main() {
  const wat = process.argv[2];
  const t0 = Date.now();
  const nu = reeks();
  const n = Object.keys(nu).length;
  if (wat === 'bewaar') {
    fs.mkdirSync(path.dirname(BESTAND), { recursive: true });
    fs.writeFileSync(BESTAND, JSON.stringify(nu, null, 1));
    console.log(`Nulmeting: ${n} beelden in ${((Date.now() - t0) / 1000).toFixed(0)} s, naar ${path.relative(process.cwd(), BESTAND)}`);
    return;
  }
  if (wat === 'vergelijk') {
    const toen = JSON.parse(fs.readFileSync(BESTAND, 'utf8'));
    const anders = Object.keys(toen).filter((k) => toen[k] !== nu[k]);
    const nieuw = Object.keys(nu).filter((k) => !(k in toen));
    console.log(anders.length ? `ANDERS (${anders.length} van ${n}): ${anders.join(', ')}` : `Gelijk: alle ${n} beelden pixel voor pixel hetzelfde als de nulmeting.`);
    if (nieuw.length) console.log(`Nieuw (niet in de nulmeting): ${nieuw.join(', ')}`);
    process.exitCode = anders.length ? 1 : 0;
    return;
  }
  console.log('node gereedschap/pixelart/gelijk.cjs bewaar | vergelijk');
}

main();
