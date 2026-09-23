// Het graan als spritesheet voor het spel: één plaat met alle vijf stadia (geploegd, kiemend,
// groen, rijp, gemaaid), elk in drie varianten, en voor groen/rijp de acht windbeelden als twee
// lagen (achter/voor de figuur) erbij. Bouwsteen voor werklijst punt 1b ("het graan in het
// spel"): gebruikt alleen de openbare functies van `graan.cjs` (renderVeld, tegelLagen,
// veldAfmeting, MAX_HOOG) — dat bestand zelf verandert hier niet. Wie dit straks in beelden/ zet
// (zoals `naar-spel.cjs` al doet voor de muren en de trap, zie daar `muren()`/`trap()`) roept
// hiervandaan `vel()` aan.
//
//   node gereedschap/pixelart/graan-vel.cjs
//     -> gereedschap/pixelart/uit/graan/spel-vel.png       (het spritesheet)
//     -> gereedschap/pixelart/uit/graan/naad-proef-*.png   (3×3 tegels, ter controle op naden)
'use strict';
const fs = require('fs');
const path = require('path');
const K = require('./kern.cjs');
const G = require('./graan.cjs');

// Drie zaden, tien uit elkaar zodat een veld niet als behang leest — dezelfde reden als
// varianten.png in graan-proef.cjs, dat om die reden ook drie zaden per stadium toont. Schaalt
// mee als VARIANTEN ooit groter wordt; bij groen/rijp (16 kolommen windbeelden per rij) telt
// elke extra variant meteen een hele rij extra mee, dus meer dan een paar wordt al snel duur.
const VARIANTEN = 3;
const ZADEN = Array.from({ length: VARIANTEN }, (_, i) => i * 10 + 11); // 11, 21, 31, ...
const FRAMES = 8; // windfasen per tegel, zoals graan-proef.cjs (sectie 5, "wind: 8 beelden per tegel")

// Van boven naar beneden op de plaat: de groeivolgorde, dezelfde volgorde als MAX_HOOG in
// graan.cjs zelf.
const VOLGORDE = ['geploegd', 'kiemend', 'groen', 'rijp', 'gemaaid'];
const MET_WIND = new Set(['groen', 'rijp']);

// Vergelijkt een net gerenderde celgrootte met wat veldAfmeting voor diezelfde tegel (1×1,
// marge 0) voorspelt — puur een controle dat renderVeld/tegelLagen niet stiekem iets anders
// teruggeven dan hun eigen formule zegt. cel/anker in het eindresultaat komen uit de plaat zelf
// (en uit deze veldAfmeting-aanroep voor het anker), nooit uit een eigen herberekening.
function keurAfmeting(stadium, breed, hoog) {
  const verwacht = G.veldAfmeting(1, 1, 0, G.MAX_HOOG[stadium]);
  console.assert(
    breed === verwacht.BREED && hoog === verwacht.HOOG,
    `graan-vel: ${stadium} is ${breed}x${hoog}, veldAfmeting(1,1,0,${G.MAX_HOOG[stadium]}) verwacht ${verwacht.BREED}x${verwacht.HOOG}`,
  );
  return verwacht;
}

// Eén band zonder wind (geploegd, kiemend, gemaaid): VARIANTEN tegels naast elkaar op een rij,
// kolom = variantindex.
function bandZonderWind(stadium) {
  const tegels = ZADEN.map((zaad) => G.renderVeld(1, 1, stadium, { zaad, marge: 0, randMarge: 0 }));
  const { b: BREED, h: HOOG } = tegels[0];
  tegels.forEach((tegel, v) =>
    console.assert(tegel.b === BREED && tegel.h === HOOG, `graan-vel: ${stadium} variant ${v} wijkt af van de celgrootte ${BREED}x${HOOG}`),
  );
  const band = new K.Plaat(BREED * VARIANTEN, HOOG);
  tegels.forEach((tegel, v) => band.plak(tegel, v * BREED, 0));
  const { OX, OY } = keurAfmeting(stadium, BREED, HOOG);
  return { plaat: band, cel: [BREED, HOOG], anker: [OX, OY] };
}

// Eén band met wind (groen, rijp): VARIANTEN rijen (één per variant), 16 kolommen — eerst de 8
// achter-beelden (fase 0/8 .. 7/8), dan de 8 voor-beelden, dus kolom = (voor ? 8 : 0) + frame.
function bandMetWind(stadium) {
  const rijen = ZADEN.map((zaad) => {
    const beelden = [];
    for (let f = 0; f < FRAMES; f++) beelden.push(G.tegelLagen(stadium, { zaad, fase: f / FRAMES }));
    return beelden;
  });
  const { b: BREED, h: HOOG } = rijen[0][0].achter;
  const band = new K.Plaat(BREED * FRAMES * 2, HOOG * VARIANTEN);
  rijen.forEach((beelden, v) => {
    beelden.forEach(({ achter, voor }, f) => {
      console.assert(
        achter.b === BREED && achter.h === HOOG && voor.b === BREED && voor.h === HOOG,
        `graan-vel: ${stadium} variant ${v} beeld ${f} wijkt af van de celgrootte ${BREED}x${HOOG}`,
      );
      band.plak(achter, f * BREED, v * HOOG);
      band.plak(voor, (FRAMES + f) * BREED, v * HOOG);
    });
  });
  const { OX, OY } = keurAfmeting(stadium, BREED, HOOG);
  return { plaat: band, cel: [BREED, HOOG], anker: [OX, OY], frames: FRAMES };
}

// Bouwt de complete plaat: alle stadium-banden onder elkaar gestapeld (de bandhoogtes lopen
// uiteen — rijp is veel hoger dan kiemend — dus de plaat wordt zo breed als de breedste band).
// Zelfde patroon als muren() in naar-spel.cjs, dat de "laag"-rij op een eigen y-offset onder de
// gewone rijen plakt.
function vel() {
  const banden = {};
  for (const stadium of VOLGORDE) banden[stadium] = (MET_WIND.has(stadium) ? bandMetWind : bandZonderWind)(stadium);

  const breed = Math.max(...VOLGORDE.map((s) => banden[s].plaat.b));
  const hoog = VOLGORDE.reduce((som, s) => som + banden[s].plaat.h, 0);
  const plaat = new K.Plaat(breed, hoog);

  const stadia = {};
  let y0 = 0;
  for (const stadium of VOLGORDE) {
    const { plaat: bandPlaat, cel, anker, frames } = banden[stadium];
    plaat.plak(bandPlaat, 0, y0);
    stadia[stadium] = { y0, cel, anker };
    if (frames) stadia[stadium].frames = frames;
    y0 += bandPlaat.h;
  }
  return { plaat, stadia };
}

module.exports = { VARIANTEN, vel };

if (require.main === module) {
  const t0 = Date.now();
  const UIT = path.join(__dirname, 'uit', 'graan');
  fs.mkdirSync(UIT, { recursive: true });

  const { plaat, stadia } = vel();
  const buf = K.png(plaat, 1);
  fs.writeFileSync(path.join(UIT, 'spel-vel.png'), buf);

  let tegels = 0;
  for (const stadium of VOLGORDE) tegels += MET_WIND.has(stadium) ? VARIANTEN * FRAMES * 2 : VARIANTEN;
  console.log(`graan-vel: spel-vel.png ${plaat.b}×${plaat.h}px, ${(buf.length / 1024).toFixed(0)} kB, ${tegels} tegels (${VARIANTEN} varianten per stadium)`);
  console.log('  stadia:', Object.entries(stadia).map(([s, o]) => `${s} y0=${o.y0} cel=${o.cel.join('x')}`).join(', '));

  // Naadproef: hetzelfde soort akker als 3×3 tegels, met marge 0 — moet naadloos aansluiten (met
  // het oog te controleren; geen automatische toets, want "ziet er naadloos uit" is geen getal).
  for (const stadium of VOLGORDE) {
    const proef = G.renderVeld(3, 3, stadium, { zaad: ZADEN[0], marge: 0, randMarge: 0 });
    fs.writeFileSync(path.join(UIT, `naad-proef-${stadium}.png`), K.png(proef, 1));
  }
  console.log(`  + 5 naad-proeven (naad-proef-<stadium>.png, telkens 3×3 tegels van variant ${ZADEN[0]})`);

  const duur = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`klaar in ${duur}s, in ${UIT}`);
}
