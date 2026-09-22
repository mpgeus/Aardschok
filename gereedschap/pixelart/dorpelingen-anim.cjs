'use strict';
// Schrijft de loop- en staan-animaties van de dorpelingen weg, op dezelfde manier als
// bosvijanden-anim.cjs: per figuur per houding één vel (rijen zijn de acht richtingen
// Z ZW W NW N NO O ZO, kolommen de beelden) en een JSON met de maten en de loopsnelheid.
// Fase A (ontwerp/werklijst.md, punt 2): alleen de smid en twee gewone dorpelingen (dorpeling0 =
// man, dorpeling1 = vrouw); de rest van de negentien volgt in fase B met dezelfde manier (zie
// dorpelingen.cjs, "lopen en staan").
//   uit/dorpelingen/animaties/<naam>.json          { naam, cel, anker, snelheid, richtingen, houdingen }
//   uit/dorpelingen/animaties/<naam>-<houding>.png de vellen die naar-spel.cjs kopieert
//   uit/dorpelingen/lopen-proef.png                 de proefplaat om te beoordelen: de drie naast
//                                                    Wim, in Z en ZO, een paar loopbeelden op een rij
//
//   node gereedschap/pixelart/dorpelingen-anim.cjs
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const { smid, SMID_SNELHEID, SMID_FPS } = require('./dorpelingen.cjs');
const { dorpeling, DORPELING_SNELHEID } = require('./dorpelingen3.cjs');
const F = require('./figuren2.cjs'); // Wim, alleen voor de proefplaat hieronder

const UIT = path.join(__dirname, 'uit', 'dorpelingen');
const UIT_ANIM = path.join(UIT, 'animaties');
fs.mkdirSync(UIT_ANIM, { recursive: true });

const CEL = 112;
const HOOG = 124;
const ANKER = [56, 110];

// Fase A: drie figuren, telkens dezelfde manier (dorpelingen.cjs). dorpeling0/1 zijn de eerste
// twee van de "aantal gerenderde varianten" waar js/sprites.js straks zaad % aantal op doet.
const FIGUREN = [
  { naam: 'smid', snelheid: SMID_SNELHEID, fps: SMID_FPS, maak: (stand) => smid(stand) },
  { naam: 'dorpeling0', snelheid: DORPELING_SNELHEID, maak: (stand) => dorpeling(0, { geslacht: 'man' }, stand) },
  { naam: 'dorpeling1', snelheid: DORPELING_SNELHEID, maak: (stand) => dorpeling(1, { geslacht: 'vrouw' }, stand) },
];
const HOUDINGEN = [
  { naam: 'staan', beelden: 4, fps: 4, herhaal: true },
  { naam: 'lopen', beelden: 8, fps: 10, herhaal: true },
];

// de rand van wat er in een cel staat, om te zien of een beeld tegen de cel aan komt
function kader(p) {
  let x0 = p.b, x1 = -1, y0 = p.h, y1 = -1;
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
}

let klem = false;
const gerendered = {}; // naam -> { staan: Plaat[8*4-per-kant...], lopen: {...} } — voor de proefplaat
for (const fig of FIGUREN) {
  const houdingen = {};
  gerendered[fig.naam] = {};
  for (const H of HOUDINGEN) {
    const vel = new K.Plaat(CEL * H.beelden, HOOG * K.KANTEN.length);
    const perKant = {}; // richting -> Plaat[beelden], voor de proefplaat (alleen Z/ZO gebruikt)
    for (let i = 0; i < H.beelden; i++) {
      const fase = i / H.beelden;
      const m = fig.maak({ houding: H.naam, fase });
      K.KANTEN.forEach((kant, r) => {
        const p = K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant });
        vel.plak(p, i * CEL, r * HOOG);
        (perKant[kant] || (perKant[kant] = [])).push(p);
        const k = kader(p);
        if (k.x1 >= 0 && (k.x0 <= 0 || k.y0 <= 0 || k.x1 >= CEL - 1 || k.y1 >= HOOG - 1)) {
          console.log(`  RAND ${fig.naam} ${H.naam} beeld ${i} ${kant}: ${k.x0}..${k.x1}, ${k.y0}..${k.y1} in ${CEL}×${HOOG}`);
          klem = true;
        }
      });
    }
    gerendered[fig.naam][H.naam] = perKant;
    const bestand = `${fig.naam}-${H.naam}.png`;
    fs.writeFileSync(path.join(UIT_ANIM, bestand), K.png(vel, 1));
    const regel = { bestand, beelden: H.beelden, fps: H.fps, herhaal: H.herhaal };
    if (H.naam === 'lopen') {
      regel.snelheid = fig.snelheid;
      regel.stap = +((fig.snelheid * (H.beelden / H.fps)) / 2).toFixed(3); // tegels per pas
    }
    houdingen[H.naam] = regel;
  }
  const beschrijving = { naam: fig.naam, cel: [CEL, HOOG], anker: ANKER, snelheid: fig.snelheid, richtingen: K.KANTEN, houdingen };
  fs.writeFileSync(path.join(UIT_ANIM, `${fig.naam}.json`), JSON.stringify(beschrijving, null, 2) + '\n');
  console.log(`${fig.naam}: ${Object.keys(houdingen).length} houdingen, ${fig.snelheid} tegels/s`);
}
if (klem) process.exitCode = 1;

// ---------------------------------------------------------------- de proefplaat

// Wim erbij, met zijn eigen bouwfunctie: zo staat een bekende loop naast de nieuwe, om op te
// vergelijken. Vier van de acht beelden (om de andere), in Z en ZO.
const FASEN = [0, 2, 4, 6].map((i) => i / 8);
const wimPerKant = { Z: [], ZO: [] };
for (const fase of FASEN) {
  const m = F.wim({ houding: 'lopen', fase });
  for (const kant of ['Z', 'ZO']) wimPerKant[kant].push(K.losRenderen(m, { b: CEL, h: HOOG, anker: ANKER, richting: kant }));
}
const kiesFasen = (perKant) => ({
  Z: [0, 2, 4, 6].map((i) => perKant.Z[i]),
  ZO: [0, 2, 4, 6].map((i) => perKant.ZO[i]),
});
const REGELS = [
  { naam: 'wim', kant: wimPerKant },
  { naam: 'smid', kant: kiesFasen(gerendered.smid.lopen) },
  { naam: 'dorpeling0 (man)', kant: kiesFasen(gerendered.dorpeling0.lopen) },
  { naam: 'dorpeling1 (vrouw)', kant: kiesFasen(gerendered.dorpeling1.lopen) },
];

// Bijsnijden op wat er echt staat (zoals dorpelingen-export.cjs voor zijn overzicht doet): een
// cel is 112×124, een lopende figuur beslaat maar een deel daarvan. Eén gedeelde rand voor alle
// beelden, zodat de voeten overal op dezelfde hoogte blijven staan.
let x0 = CEL, x1 = -1, y0 = HOOG, y1 = -1;
for (const r of REGELS) {
  for (const kant of ['Z', 'ZO']) {
    for (const p of r.kant[kant]) {
      const k = kader(p);
      if (k.x1 < 0) continue;
      x0 = Math.min(x0, k.x0);
      x1 = Math.max(x1, k.x1);
      y0 = Math.min(y0, k.y0);
      y1 = Math.max(y1, k.y1);
    }
  }
}
const RAND = 2;
x0 = Math.max(0, x0 - RAND);
y0 = Math.max(0, y0 - RAND);
const BREED = Math.min(CEL, x1 + RAND - x0 + 1);
const HOOG_UIT = Math.min(HOOG, y1 + RAND - y0 + 1);
const GAT = 8; // tussen Z en ZO
const RIJGAT = 4;

// schaal: twee keer vergroot, tenzij dat de 1400×900 zou overschrijden (dan zo groot als past)
const breedtePlat = FASEN.length * BREED + GAT + FASEN.length * BREED;
const hoogtePlat = REGELS.length * HOOG_UIT + (REGELS.length - 1) * RIJGAT;
const SCHAAL = Math.min(2, Math.floor(Math.min(1400 / breedtePlat, 900 / hoogtePlat) * 100) / 100);

const vel = new K.Plaat(breedtePlat, hoogtePlat);
REGELS.forEach((r, rij) => {
  let x = 0;
  const y = rij * (HOOG_UIT + RIJGAT);
  for (const kant of ['Z', 'ZO']) {
    for (const p of r.kant[kant]) {
      vel.plak(p.uitsnede(x0, y0, BREED, HOOG_UIT), x, y);
      x += BREED;
    }
    x += GAT;
  }
});
const proef = K.png(vel, SCHAAL, '#2a2236');
fs.writeFileSync(path.join(UIT, 'lopen-proef.png'), proef);
console.log(`lopen-proef.png: ${vel.b * SCHAAL}×${vel.h * SCHAAL} (schaal ${SCHAAL})`);
