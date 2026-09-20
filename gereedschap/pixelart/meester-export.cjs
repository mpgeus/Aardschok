// Schrijft de oude meester weg om te beoordelen: acht richtingen, een vergrote versie, één los
// beeld per houding (nog geen animatie — dat is aan animaties-export.cjs, waar een andere agent
// aan werkt), en een vergelijking naast de tovenaar van 84 om te zien of ze uit elkaar te houden
// zijn, ook van opzij en van achteren.
//
//   node gereedschap/pixelart/meester-export.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { tovenaar } = require('./figuren.cjs');
const { meester } = require('./meester.cjs');

const UIT = path.join(__dirname, 'uit');
fs.mkdirSync(UIT, { recursive: true });
const schrijf = (naam, p) => fs.writeFileSync(path.join(UIT, naam), K.png(p, 1));

// Cellen van 112×124, net als bij de tovenaar (export.cjs); de voeten staan op (56, 110).
const CEL = 112;
const HOOG = 124;
const figuurCel = (m, kant) => K.losRenderen(m, { b: CEL, h: HOOG, anker: [CEL / 2, HOOG - 14], richting: kant });
function strook(cellen) {
  const vel = new K.Plaat(CEL * cellen.length, HOOG);
  cellen.forEach((p, i) => vel.plak(p, i * CEL, 0));
  return vel;
}

const stil = meester();

// ---------------------------------------------------------------- acht richtingen

schrijf('hd-meester-richtingen.png', strook(K.KANTEN.map((k) => figuurCel(stil, k))));

// ---------------------------------------------------------------- grote versie om te beoordelen

function bekijkVel(m, kanten, schaal) {
  const vel = new K.Plaat(CEL * kanten.length, HOOG);
  kanten.forEach((k, i) => vel.plak(figuurCel(m, k), i * CEL, 0));
  return K.png(vel, schaal, '#2a2236');
}
fs.writeFileSync(path.join(UIT, 'bekijk-meester.png'), bekijkVel(stil, ['Z', 'ZW', 'W', 'NW', 'N', 'ZO'], 4));

// ---------------------------------------------------------------- één beeld per houding

// Alleen de controle dat de bouwfunctie elke houding aankan: één representatief beeld (fase 0,5),
// richting ZO. Geen animatievellen — dat komt later, via animaties-export.cjs.
const HOUDINGEN = ['staan', 'lopen', 'spreuk', 'slaan', 'geraakt', 'sterven'];
const houdingCellen = HOUDINGEN.map((houding) => figuurCel(meester({ houding, fase: 0.5 }), 'ZO'));
fs.writeFileSync(path.join(UIT, 'bekijk-meester-houdingen.png'), K.png(strook(houdingCellen), 3, '#2a2236'));

// ---------------------------------------------------------------- naast de tovenaar van 84

// Om te beoordelen of ze uit elkaar te houden zijn (zie CLAUDE.md, "Beoordelen"): dezelfde
// richtingen, tovenaar boven, meester eronder — voor, opzij en van achteren.
const VERGELIJK = ['ZO', 'Z', 'W', 'N', 'NW'];
const rijen = [tovenaar(84), stil];
const vergelijkVel = new K.Plaat(CEL * VERGELIJK.length, HOOG * rijen.length);
rijen.forEach((m, r) => VERGELIJK.forEach((k, i) => vergelijkVel.plak(figuurCel(m, k), i * CEL, r * HOOG)));
fs.writeFileSync(path.join(UIT, 'bekijk-meester-naast-tovenaar.png'), K.png(vergelijkVel, 3, '#2a2236'));

for (const f of ['hd-meester-richtingen.png', 'bekijk-meester.png', 'bekijk-meester-houdingen.png', 'bekijk-meester-naast-tovenaar.png']) {
  const b = fs.readFileSync(path.join(UIT, f));
  console.log(f.padEnd(34), `${b.readUInt32BE(16)}×${b.readUInt32BE(20)}`);
}
