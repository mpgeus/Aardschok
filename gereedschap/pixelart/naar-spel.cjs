// Zet de HD-pixel art klaar voor het spel: alleen wat het spel echt tekent, in `beelden/`.
// De rest van uit/ (overzichtsplaten, portretten, proefjes) blijft buiten git.
//
//   node gereedschap/pixelart/naar-spel.cjs      (of: npm run pixelart:spel)
//
// Twee soorten werk:
//  - kopiëren: de animatievellen van de figuren en hun JSON, de vloeren en de voorwerpen.
//    Die komen uit `npm run pixelart` en `npm run pixelart:animaties`.
//  - renderen: de muurstukken. Die van hd-muren.png hebben een strook zandvloer voor zich,
//    en dat zou over de vloer van het spel heen liggen. Hier komen ze zonder vloer, in beide
//    richtingen (noord- en westmuur), met een deur open, dicht en op slot, en met een laag
//    muurtje voor de weggesneden voorrand.
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const Kamers = require('./kamers.cjs');

const UIT = path.join(__dirname, 'uit');
const BEELDEN = path.join(__dirname, '..', '..', 'beelden');
const FIGUREN = path.join(BEELDEN, 'figuren');

// ---------------------------------------------------------------- muurstukken

// Eén cel past om beide richtingen heen: een noordmuur steekt naar rechts uit het anker, een
// westmuur naar links, en beide 128 pixels omhoog. Het anker is het midden van de tegel die
// vóór de muur ligt, op vloerhoogte — precies wat T.naarScherm in het spel teruggeeft.
const CEL = [100, 160];
const ANKER = [50, 156];

const DECOS = {
  muur: () => null,
  deur: () => Kamers.deurDeco(false),
  slot: () => Kamers.deurDeco(true),
  doorgang: (west) => Kamers.doorgangDeco(west),
  raam: () => Kamers.raamDeco(),
  wandkleed: () => Kamers.wandkleedDeco(),
  scheur: () => Kamers.scheurDeco([[9, 127], [11, 116], [8, 106], [12, 96], [9, 86], [13, 76]], 2),
  lamp: () => null,
  rek: () => null,
};
const KOLOMMEN = Object.keys(DECOS);
const RIJEN = ['noord', 'west'];

// Een muurstuk van één tegel breed, zonder vloer eronder: het spel tekent de vloer zelf.
function muurstuk(soort, west, zaad) {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  const deco = DECOS[soort](west);
  const tex = Kamers.muurTex({ deco: deco ? (west ? { x: { 0: deco } } : { y: { 0: deco } }) : null, zaad });
  const doos = west
    ? K.doos(-1, -0.5, -0.5, 0.5, 0, Kamers.MUUR_H, tex)
    : K.doos(-0.5, -1, 0.5, -0.5, 0, Kamers.MUUR_H, tex);
  K.tekenDozen(B, [doos]);
  // De lamp en het rek hangen aan de muur: modellen, geen textuur.
  const V = require('./voorwerpen.cjs');
  // Een noordmuur kijkt naar het zuidwesten, een westmuur naar het zuidoosten: daar hangt
  // wat eraan hangt ook naar toe.
  const kant = west ? { gx: -0.5, gy: 0, richting: 'ZO' } : { gx: 0, gy: -0.5, richting: 'ZW' };
  if (soort === 'lamp') K.tekenModel(B, V.wandlamp(), kant);
  if (soort === 'rek') K.tekenModel(B, V.wandrek(1), kant);
  K.belicht(B, { omgeving: () => -0.4 });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

// Het lage muurtje van de weggesneden voorrand: een hele tegel breed, 22 pixels hoog.
function laagstuk() {
  const B = new K.Beeld(CEL[0], CEL[1], ANKER[0], ANKER[1]);
  K.tekenDozen(B, [K.doos(-0.5, -0.5, 0.5, 0.5, 0, Kamers.LAAG_H, Kamers.muurTex({ zaad: 8, buiten: true }))]);
  K.belicht(B, { omgeving: () => -0.4 });
  K.verwarm(B, 2);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

function muren() {
  const vel = new K.Plaat(CEL[0] * KOLOMMEN.length, CEL[1] * (RIJEN.length + 1));
  RIJEN.forEach((rij, r) => {
    KOLOMMEN.forEach((soort, k) => {
      vel.plak(muurstuk(soort, rij === 'west', 5 + k), k * CEL[0], r * CEL[1]);
    });
  });
  vel.plak(laagstuk(), 0, RIJEN.length * CEL[1]);
  schrijf('muren.png', vel);
  return {
    bestand: 'muren.png',
    cel: CEL,
    anker: ANKER,
    kolommen: KOLOMMEN,
    rijen: [...RIJEN, 'laag'],
    laagHoogte: Kamers.LAAG_H,
    hoogte: Kamers.MUUR_H,
  };
}

// ---------------------------------------------------------------- kopiëren

function kopieer(vanaf, naar) {
  if (!fs.existsSync(vanaf)) {
    console.error(`ontbreekt: ${path.relative(process.cwd(), vanaf)} — draai eerst npm run pixelart(:animaties)`);
    process.exitCode = 1;
    return false;
  }
  fs.copyFileSync(vanaf, naar);
  return true;
}

function schrijf(naam, plaat) {
  fs.writeFileSync(path.join(BEELDEN, naam), K.png(plaat, 1));
}

// Van elke figuur alleen de houdingen die het spel gebruikt; de losse -zo-plaatjes en de
// overzichtsstroken blijven in uit/.
const FIGUURLIJST = {
  tovenaar: ['staan', 'lopen-84', 'lopen-92', 'lopen-99', 'slaan', 'spreuk', 'geraakt', 'sterven'],
  wim: ['staan', 'lopen', 'praten', 'vegen'],
  skelet: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'],
  slijm: ['staan', 'lopen', 'aanval', 'geraakt', 'sterven'],
};

function figuren() {
  const uit = {};
  for (const [naam, houdingen] of Object.entries(FIGUURLIJST)) {
    const bron = path.join(UIT, 'animaties', `${naam}.json`);
    if (!fs.existsSync(bron)) {
      console.error(`ontbreekt: ${naam}.json — draai eerst npm run pixelart:animaties`);
      process.exitCode = 1;
      continue;
    }
    const beschrijving = JSON.parse(fs.readFileSync(bron, 'utf8'));
    const gekozen = {};
    for (const h of houdingen) {
      const o = beschrijving.houdingen[h];
      if (!o) continue;
      if (!kopieer(path.join(UIT, 'animaties', o.bestand), path.join(FIGUREN, o.bestand))) continue;
      gekozen[h] = o;
    }
    beschrijving.houdingen = gekozen;
    uit[naam] = beschrijving;
  }
  return uit;
}

// ---------------------------------------------------------------- opbouwen

fs.mkdirSync(FIGUREN, { recursive: true });

const beschrijving = {
  // Alles is gerenderd in dezelfde projectie als het spel: een tegel is 64×32 en het anker
  // van een cel is het midden van zijn tegel, op vloerhoogte.
  tegel: [64, 32],
  figuren: figuren(),
  muren: muren(),
  vloeren: {
    bestand: 'vloeren.png',
    // Elke cel is een lap van twee bij twee tegels; het anker is het midden van tegel (0, 0).
    cel: [144, 88],
    anker: [72, 22],
    soorten: { zand: 0, hout: 1 },
  },
  voorwerpen: {
    bestand: 'voorwerpen.png',
    cel: [88, 112],
    anker: [44, 90],
    namen: ['tafel', 'fontein', 'kist', 'ton', 'zak', 'puin', 'sleutel', 'vuurschicht'],
  },
};
kopieer(path.join(UIT, 'hd-vloeren.png'), path.join(BEELDEN, 'vloeren.png'));
kopieer(path.join(UIT, 'hd-voorwerpen.png'), path.join(BEELDEN, 'voorwerpen.png'));

const json = JSON.stringify(beschrijving, null, 1);
fs.writeFileSync(path.join(BEELDEN, 'beschrijving.json'), json + '\n');
// Dezelfde gegevens als gewoon script, want fetch mag niet vanaf file://. Zo werkt
// index.html los openen ook met sprites erin.
fs.writeFileSync(
  path.join(BEELDEN, 'beschrijving.js'),
  '// Gemaakt door gereedschap/pixelart/naar-spel.cjs — niet met de hand bijwerken.\n' +
    '// Dezelfde inhoud als beschrijving.json, als script, zodat file:// het ook kan lezen.\n' +
    '(function (T) {\n  T.BEELDEN = ' +
    json.replace(/\n/g, '\n  ') +
    ';\n})(globalThis.Toren = globalThis.Toren || {});\n',
);

let totaal = 0;
for (const map of [BEELDEN, FIGUREN]) {
  for (const f of fs.readdirSync(map)) {
    const p = path.join(map, f);
    if (fs.statSync(p).isDirectory()) continue;
    totaal += fs.statSync(p).size;
  }
}
console.log(`beelden/ klaar: ${Math.round(totaal / 1024)} kB`);
