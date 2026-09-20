// Schrijft de animaties van de bosvijanden weg: per vijand per houding één vel (rijen zijn de
// acht richtingen Z ZW W NW N NO O ZO, kolommen de beelden), een JSON met de maten en de
// loopsnelheid, en bewegende PNG's om te bekijken. Alles op ware grootte; alleen de APNG's zijn
// vergroot. Meldt het als een beeld tegen de rand van zijn cel komt.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { apng } = require('./apng.cjs');
const V = require('./bosvijanden.cjs');

const UIT = path.join(__dirname, 'uit', 'vijanden', 'animaties');
fs.mkdirSync(UIT, { recursive: true });

const VIJANDEN = [
  { naam: 'wolf', cel: 'wolf', maak: (o) => V.wolf(o), snelheid: V.SNELHEID.wolf },
  { naam: 'reuzenspin', cel: 'reuzenspin', maak: (o) => V.reuzenspin(o), snelheid: V.SNELHEID.reuzenspin },
  { naam: 'kobold', cel: 'kobold', maak: (o) => V.kobold('speer', o), snelheid: V.SNELHEID.kobold },
  { naam: 'kobold-knots', cel: 'kobold', maak: (o) => V.kobold('knots', o), snelheid: V.SNELHEID.kobold },
];

const kader = (p) => {
  let x0 = p.b;
  let x1 = -1;
  let y0 = p.h;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.b; x++) {
      if (!p.lees(x, y)) continue;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
  }
  return { x0, x1, y0, y1 };
};

let klem = false;
for (const vijand of VIJANDEN) {
  const houdingen = {};
  for (const [houding, H] of Object.entries(V.HOUDINGEN)) {
    const [b, h, ax, ay] = V.celVan(vijand.cel, houding);
    const vel = new K.Plaat(b * H.beelden, h * 8);
    const zo = [];
    const richtingVel = [];
    for (let i = 0; i < H.beelden; i++) {
      const m = vijand.maak({ houding, fase: V.faseVan(houding, i) });
      const rij = new K.Plaat(b * 8, h);
      K.KANTEN.forEach((kant, r) => {
        const p = K.losRenderen(m, { b, h, anker: [ax, ay], richting: kant });
        vel.plak(p, i * b, r * h);
        rij.plak(p, r * b, 0);
        if (kant === 'ZO') zo.push(p);
        const k = kader(p);
        if (k.x1 >= 0 && (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= b - 1 || k.y1 >= h - 1)) {
          console.log(`  RAND ${vijand.naam} ${houding} beeld ${i} ${kant}: ${k.x0}..${k.x1}, ${k.y0}..${k.y1} in ${b}×${h}`);
          klem = true;
        }
      });
      richtingVel.push(rij);
    }
    const bestand = `${vijand.naam}-${houding}.png`;
    fs.writeFileSync(path.join(UIT, bestand), K.png(vel, 1));
    // bewegende PNG van één richting, drie keer zo groot; een eenmalige houding blijft even hangen
    const duur = zo.map((_, i) => (!H.herhaal && i === zo.length - 1 ? 0.8 : 1 / H.fps));
    fs.writeFileSync(path.join(UIT, `${vijand.naam}-${houding}-ZO.png`), apng(zo, { duur, schaal: 3, achtergrond: '#2a2236' }));
    if (houding === 'lopen') {
      fs.writeFileSync(path.join(UIT, `${vijand.naam}-lopen-richtingen.png`), apng(richtingVel, { fps: H.fps, schaal: 2, achtergrond: '#2a2236' }));
    }
    houdingen[houding] = { beelden: H.beelden, fps: H.fps, herhaal: H.herhaal, bestand };
    const standaard = V.celVan(vijand.cel, 'staan');
    if (b !== standaard[0] || h !== standaard[1]) {
      houdingen[houding].cel = [b, h];
      houdingen[houding].anker = [ax, ay];
    }
  }
  const [b, h, ax, ay] = V.celVan(vijand.cel, 'staan');
  const beschrijving = {
    naam: vijand.naam,
    cel: [b, h],
    anker: [ax, ay],
    snelheid: vijand.snelheid,
    snelheidEenheid: 'tegels per seconde',
    richtingen: K.KANTEN,
    houdingen,
  };
  fs.writeFileSync(path.join(UIT, `${vijand.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${vijand.naam}: ${Object.keys(houdingen).length} houdingen, ${vijand.snelheid} tegels/s`);
}

for (const f of fs.readdirSync(UIT).sort()) {
  const b = fs.readFileSync(path.join(UIT, f));
  if (f.endsWith('.png')) console.log(f.padEnd(34), b.readUInt32BE(16) + '×' + b.readUInt32BE(20), (b.length / 1024).toFixed(1) + ' kB');
  else console.log(f.padEnd(34), (b.length / 1024).toFixed(1) + ' kB');
}
if (klem) process.exitCode = 1;
