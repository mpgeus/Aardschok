'use strict';
// Schrijft de vellen van de ossenkar weg (ossenkar.cjs; ontwerp/beeld.md, "De ossenkar en het kamp"), op dezelfde manier
// als wild-anim.cjs: per vel per houding één vel (rijen zijn de acht richtingen Z ZW W NW N NO O ZO, kolommen de
// beelden), en een JSON met de maten en de snelheid. Meldt het als een beeld tegen de rand van zijn cel komt.
//   uit/ossenkar/animaties/<naam>.json           { naam, lading, cel, anker, snelheid, richtingen, houdingen }
//   uit/ossenkar/animaties/<naam>-<houding>.png  de vellen die naar-spel.cjs kopieert
//
// Lopen heeft in de JSON zijn `snelheid` (tegels per seconde) en zijn `stap` (tegels per pas, een half rondje): het spel
// leidt de fase van de cyclus af uit de afgelegde afstand, zodat de os niet glijdt en de wielen over de grond rollen.
//
//   node gereedschap/pixelart/ossenkar-anim.cjs            (alle vellen, zo'n drie minuten per vel)
//   node gereedschap/pixelart/ossenkar-anim.cjs huifkar    (alleen dit vel; een vel per proces gaat sneller)
//
// Daarna: node gereedschap/pixelart/naar-spel.cjs --alleen huifkar,ossenkar-leeg,ossenkar-hout
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const O = require('./ossenkar.cjs');

const UIT_ANIM = path.join(__dirname, 'uit', 'ossenkar', 'animaties');

const GEVRAAGD = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const onbekend = GEVRAAGD.filter((n) => !O.VELLEN.some((v) => v.naam === n));
if (onbekend.length) {
  console.error(`Onbekend vel: ${onbekend.join(', ')}. Kies uit: ${O.VELLEN.map((v) => v.naam).join(', ')}.`);
  process.exit(1);
}
const TE_RENDEREN = GEVRAAGD.length ? O.VELLEN.filter((v) => GEVRAAGD.includes(v.naam)) : O.VELLEN;

let klem = false;
fs.mkdirSync(UIT_ANIM, { recursive: true });
for (const vel of TE_RENDEREN) {
  const [b, h] = O.CEL;
  const houdingen = {};
  for (const [houding, H] of Object.entries(O.HOUDINGEN)) {
    const plaat = new K.Plaat(b * H.beelden, h * K.KANTEN.length);
    for (let i = 0; i < H.beelden; i++) {
      K.KANTEN.forEach((kant, r) => {
        const p = O.beeld({ lading: vel.lading, houding, fase: i / H.beelden }, kant);
        plaat.plak(p, i * b, r * h);
        const k = O.kader(p);
        if (k.x1 >= 0 && (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= b - 1 || k.y1 >= h - 1)) {
          console.log(`  RAND ${vel.naam} ${houding} beeld ${i} ${kant}: ${k.x0}..${k.x1}, ${k.y0}..${k.y1} in ${b}×${h}`);
          klem = true;
        }
      });
    }
    const bestand = `${vel.naam}-${houding}.png`;
    fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(plaat, 1));
    const regel = { bestand, beelden: H.beelden, fps: H.fps, herhaal: H.herhaal };
    if (houding === 'lopen') {
      // één rondje is één pas van elke poot van de os, en een kwartslag van het wiel; het spel rekent in passen van een
      // half rondje (js/sprites.js: cyclus = 2 × stap), net als bij het vee
      regel.snelheid = O.SNELHEID;
      regel.stap = +((O.SNELHEID * (H.beelden / H.fps)) / 2).toFixed(3);
    }
    houdingen[houding] = regel;
  }
  const beschrijving = {
    naam: vel.naam,
    lading: vel.lading,
    cel: O.CEL,
    anker: O.ANKER,
    snelheid: O.SNELHEID,
    snelheidEenheid: 'tegels per seconde',
    richtingen: K.KANTEN,
    houdingen,
  };
  fs.writeFileSync(path.join(UIT_ANIM, `${vel.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${vel.naam}: ${Object.keys(houdingen).length} houdingen, cel ${b}×${h}, ${O.SNELHEID} tegels/s`);
}
if (klem) process.exitCode = 1;
